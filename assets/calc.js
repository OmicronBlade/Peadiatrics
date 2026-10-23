/* ============================================================
   MEPA / SIMPACT — SHARED CALCULATION ENGINE  (assets/calc.js)
   ------------------------------------------------------------
   Pure logic only: patient state, weight estimation, ETT, the
   dose engine, and the vitals table. NO DOM manipulation here,
   so ANY page can import this and compute live doses.

   Every formula, cap and rounding rule is identical to the
   original interactive tool — verify against the SAMF.
   ============================================================ */

/* ---- patient state (shared, single source of truth) ---- */
const S = { ageYears:null, ageMonths:null, measWt:null, ibw:null };

/* ---- weight estimation (RXH formulae) ----
   measured weight always overrides the age estimate.        */
function estimateWeight(){
  if(S.measWt && S.measWt>0) return {kg:S.measWt, source:'measured'};
  let m = S.ageMonths;
  if(m==null) return null;
  let kg;
  if(m<12)       kg = (m+9)/2;        // 0–12 mo
  else if(m<=60) kg = (m/12 + 4)*2;   // 1–5 yr
  else           kg = (m/12)*3 + 7;   // 6–12 yr
  return {kg:Math.round(kg*10)/10, source:'estimated'};
}

/* ---- ETT (cuffed, RXH: age/4 + 3.5) ---- */
function ettSize(){
  if(S.ageYears==null) return null;
  return Math.round((S.ageYears/4 + 3.5)*10)/10;
}
function ettLength(){ // size × 3 (+2 nasal)
  const s=ettSize(); if(s==null) return null;
  return Math.round(s*3*10)/10;
}

/* ============================================================
   DOSE ENGINE
   dose spec token forms:
     {perKg, unit, max, min, roundTo, prefix, suffix, label}
   ============================================================ */
function fmtNum(n){
  if(n>=100) return Math.round(n).toString();
  if(n>=10)  return (Math.round(n*10)/10).toString();
  return (Math.round(n*100)/100).toString();
}
/* ---- dosing weight (SOBA / paedspro style) ----
   TBW = actual/estimated weight. When an IBW is entered AND TBW is more than
   110% of IBW, IBW-basis drugs use IBW and AdjBW-basis drugs use
   AdjBW = IBW + 0.35 × (TBW − IBW). Otherwise everything uses TBW.
   (110% of IBW is a pragmatic trigger — SOBA/paedspro define obesity by
   BMI centile ≥98th; confirm the trigger against local policy.)          */
const OBESE_RATIO = 1.10;
function obesityActive(){
  const w = estimateWeight();
  return !!(w && S.ibw && S.ibw>0 && w.kg > OBESE_RATIO*S.ibw);
}
function dosingWeight(basis){
  const w = estimateWeight(); if(!w) return null;
  if(obesityActive()){
    if(basis==='IBW')   return {kg:S.ibw, source:'IBW', label:'IBW'};
    if(basis==='AdjBW') return {kg:Math.round((S.ibw+0.35*(w.kg-S.ibw))*10)/10, source:'AdjBW', label:'AdjBW'};
  }
  return {kg:w.kg, source:w.source, label:'TBW'};
}
function calcDose(d){
  const w = d.basis ? dosingWeight(d.basis) : estimateWeight();
  const lab = d.basis ? ` (${w?w.label:''})` : '';
  if(!w) return {ok:false, text:d.label||'enter weight'};
  // range dose: d.hi present → compute low–high
  if(d.hi!=null){
    let lo = d.perKg * w.kg, hi = d.hi * w.kg;
    let cappedLo=false, cappedHi=false;
    if(d.max!=null && lo>d.max){ lo=d.max; cappedLo=true; }
    if(d.max!=null && hi>d.max){ hi=d.max; cappedHi=true; }
    const rng = (lo===hi) ? fmtNum(lo) : `${fmtNum(lo)}–${fmtNum(hi)}`;
    const workBase = `${d.perKg}–${d.hi} ${d.unit}/kg × ${w.kg} kg${lab}`;
    return {
      ok:true,
      result:`${d.prefix||''}${rng} ${d.unit}${d.suffix||''}`,
      working:(cappedLo||cappedHi) ? `${workBase} · max ${d.max} ${d.unit}` : workBase
    };
  }
  let val = d.perKg * w.kg;
  let capped=false;
  if(d.max!=null && val>d.max){ val=d.max; capped=true; }
  if(d.roundTo){ val = Math.round(val/d.roundTo)*d.roundTo; }
  const num = fmtNum(val);
  const working = `${d.perKg} ${d.unit}/kg × ${w.kg} kg${lab}`;
  return {
    ok:true,
    result:`${d.prefix||''}${num} ${d.unit}${d.suffix||''}`,
    working: capped ? `max ${d.max} ${d.unit} (capped)` : working
  };
}
/* inline dose chip HTML from a dose spec */
function doseChip(d){
  const c = calcDose(d);
  if(!c.ok) return `<span class="dose noval"><span class="calc">${d.text}</span></span>`;
  return `<span class="dose"><span class="calc">${c.result}</span><span class="work">${c.working}</span></span>`;
}
/* convenience: D(10,'mcg',{max:4000}) → chip */
function D(perKg,unit,opts={}){ return doseChip(Object.assign({perKg,unit},opts)); }

/* convenience: a bare computed value (no chip markup) — handy for
   volumes / joules / bag-counts inside custom panels.            */
function calcVal(perKg,unit){
  const w=estimateWeight();
  if(!w) return null;
  return {num:fmtNum(perKg*w.kg), unit, working:`${perKg} ${unit}/kg × ${w.kg} kg`, kg:w.kg};
}

/* ============================================================
   VITALS by age (RXH)
   ============================================================ */
const VITALS = [
  {band:'Neonate', maxMonths:1,   rr:'25–50', hr:'120–170', bp:'80–90'},
  {band:'1 year',  maxMonths:18,  rr:'20–40', hr:'110–160', bp:'85–100'},
  {band:'2–7 yr',  maxMonths:96,  rr:'20–30', hr:'90–140',  bp:'90–110'},
  {band:'8–11 yr', maxMonths:144, rr:'15–25', hr:'70–120',  bp:'100–120'},
  {band:'>12 yr',  maxMonths:1e9, rr:'12–24', hr:'60–110',  bp:'100–120'},
];
function currentVitalBand(){
  if(S.ageMonths==null) return -1;
  return VITALS.findIndex(v=>S.ageMonths<=v.maxMonths);
}
function renderVitals(){
  const idx=currentVitalBand();
  const rows=VITALS.map((v,i)=>`<tr${i===idx?' style="outline:2px solid var(--accent);outline-offset:-2px;"':''}>
    <th>${v.band}${i===idx?' ◀':''}</th>
    <td class="num">${v.rr}</td><td class="num">${v.hr}</td><td class="num">${v.bp}</td></tr>`).join('');
  return `<table class="mini"><thead><tr><th>Age</th><th>Resp rate /min</th><th>Heart rate /min</th><th>Systolic BP mmHg</th></tr></thead><tbody>${rows}</tbody></table>
  <p class="hint">Premature MAP target = gestational age (weeks). ${idx>=0?'Highlighted row = current patient.':'Enter age to highlight the band.'}</p>`;
}
