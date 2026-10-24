/* ============================================================
   PAEDIATRIC ANAESTHESIA — SHARED CALCULATION ENGINE  (assets/calc.js)
   ------------------------------------------------------------
   Pure logic only: patient state, weight estimation, ETT, the
   dose engine, and the vitals table. NO DOM manipulation here,
   so ANY page can import this and compute live doses.

   Every formula, cap and rounding rule is identical to the
   original interactive tool — verify against the SAMF.
   ============================================================ */

/* ---- patient state (shared, single source of truth) ---- */
const S = { ageYears:null, ageMonths:null, measWt:null, heightCm:null, sex:null };

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
/* ============================================================
   BODY SIZE + DOSING WEIGHTS (SOBA / paedspro method)
   needs: measured weight, height, sex and age ≥ 6 months.
   BMI centile from the UK-WHO LMS tables (growth-uk-who.js);
   obesity dosing weights apply at BMI centile ≥ 98th.
     IBW      = BMI50 × height(m)²
     AdjBW    = IBW + 0.35 × (TBW − IBW)
     AdjBW40  = IBW + 0.40 × (TBW − IBW)
     LBW      = 3.8 × 0.0215 × TBW^0.6469 × height(cm)^0.7236 (Peters)
   ============================================================ */
const OBESE_CENTILE = 98;
const BMI_CATEGORIES = [            // SOBA "Defining obesity"
  {min:99.6, label:'Severely Obese', asa:3},
  {min:98,   label:'Obese',          asa:2},
  {min:91,   label:'Overweight',     asa:2},
];

function lmsAt(ageY, sex){
  if(typeof BMI_LMS==='undefined' || !BMI_LMS[sex]) return null;
  const segs = BMI_LMS[sex];
  const first = segs[0][0][0], lastSeg = segs[segs.length-1], last = lastSeg[lastSeg.length-1][0];
  if(ageY<first || ageY>last) return null;
  // later segment wins at a join age
  for(let i=segs.length-1;i>=0;i--){
    const rows=segs[i];
    if(ageY<rows[0][0] || ageY>rows[rows.length-1][0]) continue;
    for(let j=0;j<rows.length;j++){
      if(rows[j][0]===ageY) return {L:rows[j][1], M:rows[j][2], S:rows[j][3]};
      if(rows[j][0]>ageY){
        const a=rows[j-1], b=rows[j], f=(ageY-a[0])/(b[0]-a[0]);
        return {L:a[1]+(b[1]-a[1])*f, M:a[2]+(b[2]-a[2])*f, S:a[3]+(b[3]-a[3])*f};
      }
    }
  }
  return null;
}
/* standard normal CDF (Abramowitz & Stegun 7.1.26) */
function normCdf(z){
  const t=1/(1+0.3275911*Math.abs(z)/Math.SQRT2);
  const y=1-(((((1.061405429*t-1.453152027)*t)+1.421413741)*t-0.284496736)*t+0.254829592)*t*Math.exp(-z*z/2);
  return z>=0 ? (1+y)/2 : (1-y)/2;
}
const r1 = n=>Math.round(n*10)/10;

/* full body-size picture, or {missing:[...]} when it can't be calculated */
function bodySize(){
  const missing=[];
  if(S.ageYears==null) missing.push('age');
  if(!S.measWt) missing.push('measured weight');
  if(!S.heightCm) missing.push('height');
  if(!S.sex) missing.push('sex');
  if(missing.length) return {missing};
  const lms = lmsAt(S.ageYears, S.sex);
  if(!lms) return {missing:[], outOfRange:true};
  const h = S.heightCm/100, tbw = S.measWt;
  const bmi = tbw/(h*h);
  const z = (Math.pow(bmi/lms.M, lms.L)-1)/(lms.L*lms.S);
  const centile = normCdf(z)*100;
  const ibw = lms.M*h*h;
  const cat = BMI_CATEGORIES.find(c=>centile>=c.min) || null;
  return {
    bmi:r1(bmi), z:Math.round(z*100)/100, centile, bmi50:r1(lms.M),
    category: cat ? cat.label : 'Not Overweight', asa: cat ? cat.asa : null,
    obese: centile>=OBESE_CENTILE,
    tbw, ibw:r1(ibw),
    adjbw:r1(ibw+0.35*(tbw-ibw)), adjbw40:r1(ibw+0.40*(tbw-ibw)),
    lbw:r1(3.8*0.0215*Math.pow(tbw,0.6469)*Math.pow(S.heightCm,0.7236))
  };
}
function fmtCentile(c){
  if(c>=99.95) return '>99.9th';
  if(c<0.05) return '<0.1st';
  const v = c>=99 || c<1 ? Math.round(c*10)/10 : Math.round(c);
  const n = Math.round(v*10)%10===0 ? Math.round(v) : v;
  const k = Number.isInteger(n) ? n%100 : null;
  const suf = k==null ? 'th' : (k>=11&&k<=13) ? 'th' : ({1:'st',2:'nd',3:'rd'}[k%10]||'th');
  return n+suf;
}
function obesityActive(){ const b=bodySize(); return !!(b && b.obese); }

/* dosing weight for a basis: TBW · IBW · AdjBW · AdjBW40 · LBW.
   Below the 98th centile (or without height/sex) every basis uses TBW. */
function dosingWeight(basis){
  const w = estimateWeight(); if(!w) return null;
  const b = bodySize();
  if(b && b.obese){
    if(basis==='IBW')     return {kg:b.ibw,     source:'IBW',     label:'IBW'};
    if(basis==='AdjBW')   return {kg:b.adjbw,   source:'AdjBW',   label:'AdjBW'};
    if(basis==='AdjBW40') return {kg:b.adjbw40, source:'AdjBW40', label:'AdjBW 40%'};
    if(basis==='LBW')     return {kg:b.lbw,     source:'LBW',     label:'LBW'};
  }
  return {kg:w.kg, source:w.source, label:'TBW'};
}
function calcDose(d){
  const w = d.basis ? dosingWeight(d.basis) : estimateWeight();
  const lab = d.basis ? ` (${w?w.label:''})` : '';
  if(!w) return {ok:false, text:d.label||'Enter Weight'};
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
  {band:'1 yr',    maxMonths:18,  rr:'20–40', hr:'110–160', bp:'85–100'},
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
  const rows=VITALS.map((v,i)=>`<tr${i===idx?' class="current"':''}>
    <th>${v.band}${i===idx?' ◀':''}</th>
    <td class="num">${v.rr}</td><td class="num">${v.hr}</td><td class="num">${v.bp}</td></tr>`).join('');
  return `<table class="mini"><thead><tr><th>Age</th><th>Resp Rate /min</th><th>Heart Rate /min</th><th>Systolic BP mmHg</th></tr></thead><tbody>${rows}</tbody></table>
  <p class="hint">Premature MAP target = gestational age (weeks). ${idx>=0?'Highlighted row = current patient.':'Enter age to highlight the band.'}</p>`;
}
