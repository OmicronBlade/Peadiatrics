/* ============================================================
   PAEDIATRIC ANAESTHESIA — SHARED DRUG DATA  (assets/drugs.js)
   ------------------------------------------------------------
   One source for every drug list on the site:
     EMERG   emergency drugs (live tables on every page)
     GROUPS  drug-reference panels
   plus renderDrugTable() / renderSoba() used to draw them.
   Depends on calc.js (S, estimateWeight, dosingWeight, calcDose…).

   src: default = RXH Paediatric Anaesthesia Quick Reference Guide (2023 v3)
        src:'pp'  = dose from paedspro.com
        unv:true  = in neither — drafted from standard paediatric references;
                    shown with an UNVERIFIED badge. Verify, then remove the flag.
   Fields: name, note, perKg/hi/unit/max (weight-linear dose),
           basis (TBW / IBW / AdjBW — SOBA dosing weight, see calc.js),
           guide (text override), live(w) → {result,working} (custom calc),
           rxh (notes / timing column), pp (paedspro value where different)
   ============================================================ */
const ageM = ()=>S.ageMonths;

/* ---- emergency drugs ----
   basis follows the SOBA "which weight" table; drugs SOBA does not list
   stay on TBW (no basis) — see TODO.md.                                  */
const EMERG = [
  {c:'cir', name:'Adrenaline — Arrest', note:'IV/IO · Every 3–5 min', perKg:10, unit:'mcg', basis:'IBW', rxh:'Same (every 4 min)', same:true},
  {c:'cir', name:'Adrenaline — Anaphylaxis', note:'IM 1:1000 · Anterolateral Thigh · Repeat at 5 min', anaphAdren:true, rxh:'IV 1 mcg/kg (IBW) + IM 10 mcg/kg (max 500 mcg)'},
  {c:'air', name:'Atropine', note:'IV/IO · Max 4 mg', perKg:20, unit:'mcg', max:4000, basis:'TBW', rxh:'0.02 mg/kg', same:true},
  {c:'air', name:'Suxamethonium', note:'IV (IM 4 mg/kg if No Access)', perKg:1.5, unit:'mg', basis:'TBW', rxh:'—', same:true},
  {c:'air', name:'Rocuronium', note:'RSI · IV', perKg:1.2, unit:'mg', basis:'IBW', rxh:'—', same:true},
  {c:'neu', name:'Propofol', note:'Induction / Deepen · IV', perKg:0.5, hi:2.5, unit:'mg', basis:'IBW', rxh:'—', same:true},
  {c:'met', name:'Dantrolene — MH', note:'IV · Repeat Every 5 min to 30 mg/kg', perKg:2.5, unit:'mg', rxh:'2.5 mg/kg every 5 min', same:true},
  {c:'last', name:'Intralipid 20% — LAST', note:'Bolus, then Infusion', perKg:1.5, unit:'mL', rxh:'—', same:true},
  {c:'air', name:'Salbutamol — IV', note:'Slow Bolus', perKg:15, unit:'mcg', rxh:'Neb &lt;5 yr 2.5 mg · &gt;5 yr 5 mg'},
  {c:'cir', name:'Amiodarone', note:'Shockable Arrest / Arrhythmia', perKg:5, unit:'mg', max:300, rxh:'In 5% dextrose over 30 min (arrhythmia)'},
  {c:'cir', name:'Adenosine — SVT', note:'Rapid Push + Saline Flush · Escalate Every 1–2 min', adenosine:true, rxh:'100 / 200 / 300 mcg/kg (neonate 300 mcg/kg) · Max 12 mg'},
  {c:'cir', name:'Fluid Bolus', note:'Crystalloid · Titrate', perKg:10, unit:'mL', rxh:'5 mL/kg → 20 mL/kg max'},
  {c:'met', name:'Dextrose 10%', note:'Hypoglycaemia · IV/IO', perKg:2, unit:'mL', rxh:'2 mL/kg', same:true},
  {c:'met', name:'Calcium Chloride 10%', note:'IV Slow · Max 10 mL', perKg:0.15, unit:'mL', max:10, rxh:'0.1–0.2 mL/kg', same:true},
  {c:'met', name:'Calcium Gluconate 10%', note:'IV Slow · Max 20 mL', perKg:0.5, unit:'mL', max:20, rxh:'0.3–0.5 mL/kg', same:true},
  {c:'cir', name:'Lignocaine — Arrest (VT/VF)', note:'IV/IO · Alternative to Amiodarone', perKg:1, hi:1.5, unit:'mg', rxh:'1 mg/kg', same:true},
  {c:'neu', name:'Magnesium Sulphate', note:'IV Infusion over 10–20 min', perKg:40, unit:'mg', max:2000, rxh:'25–50 mg/kg', same:true},
  {c:'neu', name:'Hydrocortisone', note:'Anaphylaxis', perKg:3, unit:'mg', rxh:'2–4 mg/kg (RXH weight-based)'},
  {c:'neu', name:'Naloxone', note:'Post-op Sedation · Repeat Every 2 min', perKg:2, unit:'mcg', rxh:'2 mcg/kg', same:true},
  {c:'met', name:'Mannitol', note:'↑ICP / Diuresis', perKg:0.5, unit:'g', rxh:'0.25–0.5 g/kg', same:true},
  {c:'met', name:'Sodium Bicarbonate 8.4%', note:'If Gas Unavailable', perKg:1, unit:'mL', rxh:'BE × wt ÷ 6 (&gt;5 kg)', same:true},
];

/* helper: live result for a dose on a dosing-weight basis (units that aren't plain X/kg) */
const L = (perKg,hi,unit,basis,per)=>(w0)=>{
  const w=dosingWeight(basis); if(!w) return null;
  const r = hi!=null ? `${fmtNum(perKg*w.kg)}–${fmtNum(hi*w.kg)} ${unit}` : `${fmtNum(perKg*w.kg)} ${unit}`;
  return {result:r, working:`${perKg}${hi!=null?'–'+hi:''} ${per||unit+'/kg'} × ${w.kg} kg (${w.label})`};
};
/* helper: the weight to type into a TCI pump */
const pumpWeight = basis=>()=>{const x=dosingWeight(basis); return x&&{result:`${x.kg} kg`, working:`Weight to enter (${x.label})`};};

/* ---- drug groups (Drug Reference page) ---- */
const GROUPS = [

{id:'premed', title:'Premeds & Apnoea Prevention', pill:'Pre-op', c:'neu',
 note:'Fasting: Solids &gt;6 h · Breast Milk &gt;4 h · Clear Fluid &gt;1 h Pre-op. Apnoea Monitoring 12 h Post-op (Term &lt;50 wk PCA · Premature &lt;60 wk PCA). <b>Reduce Doses if Combining Premedications.</b>',
 drugs:[
  {c:'neu', name:'Clonidine', note:'PO Premed', perKg:3, hi:4, unit:'mcg', basis:'TBW', rxh:'90 min pre-op', pp:'1–5 mcg/kg (TBW)'},
  {c:'neu', name:'Midazolam', note:'PO Premed', perKg:0.2, hi:0.3, unit:'mg', max:7.5, basis:'TBW', rxh:'30 min pre-op, “on trolley” · Max 7.5 mg · OSA: airway-obstruction risk; severe OSA ↓ to 0.25 mg/kg', pp:'0.5 mg/kg PO, max 20 mg (15–30 min) · Buccal 0.3 mg/kg, max 10 mg (10–15 min) (TBW)'},
  {c:'neu', name:'Ketamine', note:'PO Premed', perKg:5, hi:10, unit:'mg', basis:'IBW', src:'pp', rxh:'10–20 min pre-op'},
  {c:'neu', name:'Ketamine', note:'IM Premed', perKg:5, unit:'mg', basis:'IBW', src:'pp', rxh:'3–5 min pre-op'},
  {c:'neu', name:'Dexmedetomidine', note:'Intranasal Premed', perKg:2, hi:3, unit:'mcg', max:150, basis:'AdjBW', src:'pp', rxh:'30–60 min pre-op · Max 150 mcg · RXH: 3–4 mcg/kg intranasal (emergence delirium)'},
  {c:'neu', name:'Caffeine Citrate', note:'PO · Premature &lt;60 wk PCA', perKg:20, unit:'mg', rxh:'2 h pre-op, then 5–10 mg/kg daily PO for 48 h post-op · Anhydrous caffeine: 10 mg/kg, then 5 mg/kg OD'},
  {c:'neu', name:'Aminophylline', note:'IV Slowly · Intra-op · Premature', perKg:5, hi:10, unit:'mg', rxh:'Apnoea prevention'},
 ]},

{id:'antiemetic', title:'Anti-emetics', pill:'PONV', c:'last',
 note:'PCA Patients Must Have a PRN Antiemetic. 1st Line Ondansetron · 2nd Line Droperidol · 3rd Line Metoclopramide.',
 drugs:[
  {c:'last', name:'Ondansetron', note:'IV · PONV Prophylaxis / PCA 1st Line', perKg:0.15, unit:'mg', basis:'TBW', rxh:'PCA: 8-hourly', pp:'0.2 mg/kg (TBW)'},
  {c:'last', name:'Dexamethasone', note:'IV · PONV Prophylaxis', perKg:0.15, unit:'mg', basis:'TBW', rxh:'Same in both guides'},
  {c:'last', name:'Droperidol', note:'IV · PCA 2nd Line', perKg:0.02, unit:'mg', max:0.5, rxh:'6–8-hourly · Max 0.5 mg'},
  {c:'last', name:'Metoclopramide', note:'IV · PCA 3rd Line', perKg:0.3, unit:'mg', max:15, rxh:'8-hourly · Max 15 mg'},
  {c:'last', name:'Lactulose', note:'PO · Stool Softener with PCA', perKg:0.5, unit:'mL', rxh:'12-hourly PRN'},
 ]},

{id:'analg-intra', title:'Analgesia — Intra-operative', pill:'Analgesia', c:'cir',
 note:'* Diclofenac, Parecoxib and Ibuprofen Are Contraindicated Under 1 Year.',
 drugs:[
  {c:'cir', name:'Paracetamol', note:'IV', perKg:15, unit:'mg', basis:'AdjBW', rxh:'Loading dose 20 mg/kg'},
  {c:'cir', name:'Diclofenac*', note:'PR (paedspro: IV/PO)', perKg:1, unit:'mg', basis:'AdjBW', rxh:'Contraindicated &lt;1 yr'},
  {c:'cir', name:'Parecoxib*', note:'IV', perKg:1, unit:'mg', max:40, rxh:'Max 40 mg · Contraindicated &lt;1 yr'},
  {c:'cir', name:'Ketamine', note:'IV', perKg:0.25, hi:0.5, unit:'mg', basis:'IBW', rxh:'—'},
  {c:'cir', name:'Clonidine', note:'IV', perKg:1, hi:2, unit:'mcg', rxh:'—'},
  {c:'cir', name:'Fentanyl', note:'IV', perKg:1, hi:2, unit:'mcg', basis:'AdjBW', rxh:'Same in both guides'},
  {c:'cir', name:'Morphine', note:'IV', perKg:0.1, unit:'mg', basis:'IBW', rxh:'—', pp:'0.05–0.1 mg/kg (IBW)'},
  {c:'cir', name:'Morphine', note:'IM', perKg:0.1, unit:'mg', basis:'IBW', src:'pp', rxh:'SOBA: IBW · paedspro app uses AdjBW'},
  {c:'cir', name:'Alfentanil', note:'IV', perKg:10, unit:'mcg', basis:'AdjBW', rxh:'—', pp:'10–20 mcg/kg (AdjBW)'},
 ]},

{id:'analg-post', title:'Analgesia — Post-operative', pill:'Analgesia', c:'cir',
 note:'* Ibuprofen Contraindicated &lt;1 yr. Gabapentin: Initiate and Wean over 3 Days (Day 1 Nocte · Day 2 12-hourly · Day 3 8-hourly). Pain Scores: Revised FLACC (2 mo–16 yr) · NIPS (&lt;2 mo).',
 drugs:[
  {c:'cir', name:'Paracetamol', note:'PO', perKg:15, unit:'mg', basis:'AdjBW', rxh:'6-hourly'},
  {c:'cir', name:'Ibuprofen*', note:'PO', perKg:5, hi:10, unit:'mg', basis:'AdjBW', rxh:'8-hourly · Contraindicated &lt;1 yr', pp:'TDS 10 mg/kg · QDS 5 mg/kg (AdjBW)'},
  {c:'cir', name:'Clonidine', note:'PO', perKg:2, hi:5, unit:'mcg', basis:'TBW', rxh:'8-hourly', pp:'1–5 mcg/kg (TBW) as premed'},
  {c:'cir', name:'Gabapentin', note:'PO', perKg:3, hi:10, unit:'mg', rxh:'8-hourly · See titration note'},
  {c:'cir', name:'Morphine — Oral', note:'By Age Band', basis:'IBW', guide:'Neonate 0.05 · 1 mo–1 yr 0.05–0.2 · &gt;1 yr 0.2–0.4 mg/kg',
   live:()=>{ const m=ageM(), w=dosingWeight('IBW'); if(!w||m==null) return null;
     const [lo,hi,band]= m<1?[0.05,null,'Neonate']: m<12?[0.05,0.2,'1 mo–1 yr']:[0.2,0.4,'>1 yr'];
     const r = hi?`${fmtNum(lo*w.kg)}–${fmtNum(hi*w.kg)} mg`:`${fmtNum(lo*w.kg)} mg`;
     return {result:r, working:`${band}: ${lo}${hi?'–'+hi:''} mg/kg × ${w.kg} kg (${w.label})`}; },
   rxh:'4–6-hourly (neonate 6-hourly)', pp:'0.1–0.2 mg/kg (IBW)'},
  {c:'cir', name:'Morphine — Infusion', note:'IV', guide:'0.5 × Weight (kg) mg in 50 mL N.Saline',
   live:(w)=>w&&{result:`${fmtNum(0.5*w.kg)} mg in 50 mL`, working:`0.5 mg × ${w.kg} kg · Run 1–3 mL/h`}, rxh:'Run 1–3 mL/h'},
  {c:'cir', name:'Ketamine — Infusion', note:'IV · 0.2–0.3 mg/kg/h', guide:'5 mg/kg in 50 mL N.Saline',
   live:(w)=>w&&{result:`${fmtNum(5*w.kg)} mg in 50 mL`, working:`5 mg × ${w.kg} kg · Run 2–3 mL/h`}, rxh:'Run 2–3 mL/h'},
 ],
 extra:()=>{
   const w=estimateWeight(); const kg=w?w.kg:null;
   const f=(perKg,u)=>kg?`${fmtNum(perKg*kg)} ${u}`:`${perKg} ${u}/kg`;
   let mor, fen;
   if(kg){
     mor = kg<30 ? `${fmtNum(kg)} mg in 50 mL · Bolus 1 mL = 20 mcg/kg (${fmtNum(0.02*kg)} mg)`
         : kg<=50 ? `${fmtNum(2*kg)} mg in 100 mL · Bolus 1 mL = 20 mcg/kg (${fmtNum(0.02*kg)} mg)`
         : `100 mg in 100 mL · Bolus 1 mL = 1 mg`;
     fen = kg<50 ? `${fmtNum(15*kg)} mcg (0.3 mcg/kg bolus, background 1 mL/h) <b>or</b> ${fmtNum(25*kg)} mcg (0.5 mcg/kg bolus, background 0.2–1 mL/h) in 50 mL`
         : `750 mcg (bolus 15 mcg, background 1 mL/h) <b>or</b> 1250 mcg (bolus 25 mcg) in 50 mL`;
   }
   const ket = kg ? (kg<50?`${f(1,'mg')}–${f(2,'mg')} in 50 mL · Bolus 20–40 mcg/kg (${fmtNum(0.02*kg)}–${fmtNum(0.04*kg)} mg)`:`50–100 mg in 50 mL · Bolus 2.5–5 mg`) : '—';
   return `<h4 class="subh">PCA (Dilute in 0.9% Saline)</h4>
   <table class="mini"><thead><tr><th>Drug</th><th>Weight</th><th>Make Up</th></tr></thead><tbody>
    <tr><th>Morphine</th><td>&lt;30 kg: 1 mg/kg in 50 mL<br>30–50 kg: 2 mg/kg in 100 mL<br>&gt;50 kg: 100 mg in 100 mL</td><td>${kg?mor:'Enter Weight'}<br><small>Background 0.2–1 mL/h</small></td></tr>
    <tr><th>Fentanyl</th><td>&lt;50 kg: 15 or 25 mcg/kg in 50 mL<br>&gt;50 kg: 750 or 1250 mcg in 50 mL</td><td>${kg?fen:'Enter Weight'}</td></tr>
    <tr><th>Ketamine <small>(Add to Opioid PCA)</small></th><td>&lt;50 kg: 1–2 mg/kg<br>&gt;50 kg: 50–100 mg</td><td>${ket}<br><small>Background set by opioid rate</small></td></tr>
   </tbody></table>
   <p class="hint">PCA needs a PRN antiemetic (see Anti-emetics); consider a stool softener.</p>`;
 }},

{id:'agents', title:'Anaesthetic & Sedative Agents', pill:'Induction & Maintenance', c:'neu',
 note:'Items Badged <span class="unv">UNVERIFIED</span> Are in Neither the RXH Guide nor paedspro — Drafted from Standard References; Check Before Use.',
 drugs:[
  {c:'neu', name:'Propofol — Bolus', note:'IV Induction', perKg:1, hi:4, unit:'mg', basis:'IBW', src:'pp', rxh:'—'},
  {c:'neu', name:'Propofol — Infusion', note:'IV', guide:'1–15 mg/kg/h (AdjBW)', live:L(1,15,'mg/h','AdjBW','mg/kg/h'), basis:'AdjBW', src:'pp', rxh:'—'},
  {c:'neu', name:'Propofol TCI', note:'Enter This Weight in the Pump', guide:'AdjBW', live:pumpWeight('AdjBW'), basis:'AdjBW', src:'pp', rxh:'—'},
  {c:'neu', name:'Remifentanil TCI', note:'Enter This Weight in the Pump', guide:'AdjBW', live:pumpWeight('AdjBW'), basis:'AdjBW', src:'pp', rxh:'—'},
  {c:'neu', name:'Ketamine', note:'IV Induction', perKg:1, hi:2, unit:'mg', basis:'IBW', rxh:'Same in both guides; also TIVA bolus (see Infusions)'},
  {c:'neu', name:'Thiopentone', note:'IV Induction', perKg:3, hi:5, unit:'mg', basis:'IBW', src:'pp', rxh:'—'},
  {c:'neu', name:'Etomidate', note:'IV Induction', perKg:0.3, unit:'mg', unv:true, rxh:'—'},
  {c:'neu', name:'Dexmedetomidine', note:'IV Bolus', perKg:1, unit:'mcg', basis:'IBW', rxh:'Intranasal 3–4 mcg/kg (emergence delirium)', pp:'0.5 mcg/kg (IBW)'},
  {c:'neu', name:'Propofol — Emergence Delirium', note:'IV', perKg:1, unit:'mg', rxh:'PAED score &gt;10–12 · Rule out pain / hypoxia first'},
  {c:'neu', name:'Clonidine — Emergence Delirium', note:'IV', perKg:0.5, hi:1, unit:'mcg', rxh:'—'},
 ]},

{id:'nmb', title:'Muscle Relaxants & Reversal', pill:'NMB', c:'air',
 note:'Reversal Doses and the Red Cross Mix Are from the RXH Guide; Relaxant Doses Are from paedspro. Items Badged <span class="unv">UNVERIFIED</span> Are in Neither.',
 drugs:[
  {c:'air', name:'Suxamethonium', note:'IV', perKg:1, hi:2, unit:'mg', basis:'TBW', src:'pp', rxh:'Emergency list uses 1.5 mg/kg'},
  {c:'air', name:'Suxamethonium', note:'IM (if No Access)', perKg:4, unit:'mg', basis:'TBW', src:'pp', rxh:'—'},
  {c:'air', name:'Rocuronium', note:'IV Routine', perKg:0.6, hi:1, unit:'mg', basis:'IBW', src:'pp', rxh:'RSI 1.2 mg/kg (emergency list)'},
  {c:'air', name:'Atracurium', note:'IV', perKg:0.5, unit:'mg', basis:'IBW', src:'pp', rxh:'—'},
  {c:'air', name:'Cisatracurium', note:'IV', perKg:0.15, unit:'mg', basis:'IBW', unv:true, rxh:'—'},
  {c:'air', name:'Vecuronium', note:'IV', perKg:0.1, unit:'mg', basis:'IBW', unv:true, rxh:'—'},
  {c:'air', name:'Sugammadex', note:'IV · Routine (2 mg/kg)', perKg:2, unit:'mg', basis:'TBW', src:'pp', rxh:'—'},
  {c:'air', name:'Sugammadex', note:'IV · Immediate Reversal (16 mg/kg)', perKg:16, unit:'mg', basis:'TBW', src:'pp', rxh:'—'},
  {c:'air', name:'Neostigmine', note:'IV Reversal', perKg:0.05, unit:'mg', basis:'TBW', rxh:'With glycopyrrolate or atropine · Same in both guides'},
  {c:'air', name:'Glycopyrrolate', note:'IV with Neostigmine', perKg:0.01, unit:'mg', basis:'TBW', rxh:'—'},
  {c:'air', name:'Atropine', note:'IV Alternative to Glycopyrrolate', perKg:0.02, unit:'mg', basis:'TBW', rxh:'—'},
  {c:'air', name:'Red Cross Reversal Mix', note:'Neostigmine 2.5 mg + Glycopyrrolate 0.4 mg, Made Up to 5 mL with N.Saline',
   guide:'1 mL per 10 kg · 0.1 mL/kg if &lt;10 kg',
   live:(w)=>{ if(!w) return null; const v = w.kg<10 ? 0.1*w.kg : w.kg/10;
     return {result:`${fmtNum(v)} mL`, working: w.kg<10?`0.1 mL/kg × ${w.kg} kg`:`${w.kg} kg ÷ 10`}; }, rxh:'—'},
 ]},

{id:'la', title:'Local Anaesthetics & Regional', pill:'Regional', c:'met',
 note:'Maximum Doses Are from paedspro (IBW). Caudal, Epidural and Wound Volumes Are from the RXH Guide. Treat LAST per the Metabolic Emergency Pathway.',
 drugs:[
  {c:'met', name:'Lidocaine — Infiltration', note:'Maximum Dose', perKg:3, unit:'mg', basis:'IBW', src:'pp', rxh:'1% = 10 mg/mL'},
  {c:'met', name:'Lidocaine + Adrenaline', note:'Maximum Dose', perKg:7, unit:'mg', basis:'IBW', src:'pp', rxh:'—'},
  {c:'met', name:'Bupivacaine', note:'Maximum Dose', perKg:2, unit:'mg', basis:'IBW', src:'pp', rxh:'0.25% = 2.5 mg/mL · 0.5% = 5 mg/mL'},
  {c:'met', name:'Ropivacaine', note:'Maximum Dose', perKg:3, unit:'mg', basis:'IBW', src:'pp', rxh:'—'},
  {c:'met', name:'Caudal 0.25% Bupivacaine — Sacro-lumbar', note:'Volume', perKg:0.5, unit:'mL', rxh:'1 mcg/kg clonidine may be added'},
  {c:'met', name:'Caudal 0.25% Bupivacaine — Upper Abdominal', note:'Volume', perKg:1, unit:'mL', rxh:'1 mcg/kg clonidine may be added'},
  {c:'met', name:'Caudal 0.25% Bupivacaine — Mid-thoracic', note:'Volume', perKg:1.2, unit:'mL', rxh:'Mid-thoracic level not reliably achieved'},
  {c:'met', name:'Epidural Bolus 0.25% Bupivacaine — Thoracic', note:'Volume', perKg:0.5, unit:'mL', rxh:'Or 0.5–1 mL per dermatome (check toxic dose)'},
  {c:'met', name:'Epidural Bolus 0.25% Bupivacaine — Lumbar', note:'Volume', perKg:0.75, unit:'mL', rxh:'Or 0.5–1 mL per dermatome (check toxic dose)'},
  {c:'met', name:'Epidural Infusion 0.1% Bupivacaine', note:'mL/h', guide:'&gt;6 mo and &gt;5 kg: 0.1–0.4 mL/kg/h<br>&lt;6 mo or &lt;5 kg: 0.1–0.2 mL/kg/h',
   live:(w)=>{ if(!w) return null; const small = w.kg<5 || (ageM()!=null && ageM()<6); const hi=small?0.2:0.4;
     return {result:`${fmtNum(0.1*w.kg)}–${fmtNum(hi*w.kg)} mL/h`, working:`0.1–${hi} mL/kg/h × ${w.kg} kg`+(ageM()==null?' (age not entered)':'')}; },
   rxh:'Epidural depth ≈ 1 mm/kg from skin · 3–4 cm in space'},
  {c:'met', name:'Wound Infusion Catheter', note:'Bupivacaine · 0.1–0.2 mL/kg/h', guide:'&lt;4 mo: 0.1% · &gt;4 mo: 0.2%',
   live:(w)=>{ const m=ageM(); if(!w||m==null) return null;
     return {result:`${m<4?'0.1':'0.2'}% · ${fmtNum(0.1*w.kg)}–${fmtNum(0.2*w.kg)} mL/h`, working:`0.1–0.2 mL/kg/h × ${w.kg} kg`}; }, rxh:'Needs age'},
  {c:'met', name:'Clysis — Max Volume', note:'Bupivacaine 0.5% 10 mL + Adrenaline 1:1000 1 mL; Take 4.5 mL of Mix into 200 mL N.Saline', perKg:20, unit:'mL', rxh:'Max 20 mL/kg'},
 ]},

{id:'anticonv', title:'Anticonvulsants', pill:'Seizures', c:'neu',
 note:'Lorazepam and Diazepam: BNFC Doses as Shown in paedspro (Use Unadjusted TBW). Phenytoin and Phenobarbitone Are <span class="unv">UNVERIFIED</span>. Secure Airway, Check Glucose, Give 100% O₂.',
 drugs:[
  {c:'neu', name:'Lorazepam', note:'IV Loading · 1 mo–11 yr · into a Large Vein', perKg:0.1, unit:'mg', max:4, basis:'TBW', src:'pp', rxh:'Repeat once after 10 min (max 4 mg/dose) · ≥12 yr: 4 mg, repeat once after 10 min'},
  {c:'neu', name:'Midazolam', note:'IV Loading', perKg:0.05, hi:0.1, unit:'mg', basis:'TBW', src:'pp', rxh:'—'},
  {c:'neu', name:'Diazepam', note:'IV · 1 mo–11 yr · over 3–5 min', perKg:0.3, hi:0.4, unit:'mg', max:10, basis:'TBW', src:'pp', rxh:'Repeat after 10 min if required (max 10 mg/dose) · ≥12 yr: 10 mg'},
  {c:'neu', name:'Levetiracetam', note:'IV · Status Epilepticus 2nd Line (Loading)', perKg:40, unit:'mg', basis:'AdjBW', src:'pp', rxh:'⚠ paedspro’s 10 mg/kg “loading” figure is the BNFc <b>adjunctive</b> dose, NOT status epilepticus. SE loading = 40 mg/kg (APLS / EcLiPSE) — take the maximum and infusion rate from your local SE guideline'},
  {c:'neu', name:'Phenytoin', note:'IV Second Line', perKg:20, unit:'mg', unv:true, rxh:'Over ≥20 min with ECG monitoring'},
  {c:'neu', name:'Phenobarbitone', note:'IV (Neonates / Alternative)', perKg:20, unit:'mg', unv:true, rxh:'Over 20 min'},
 ]},

{id:'infusions', title:'Infusions (Make-up & Rates)', pill:'Infusions', c:'cir',
 note:'Standard Syringe: Drug in 50 mL N.Saline Unless Stated. Rates Are for the Entered Weight.',
 drugs:[
  {c:'cir', name:'Adrenaline', note:'60 mcg/kg in 50 mL · 1 mL/h = 0.02 mcg/kg/min', guide:'60 mcg/kg in 50 mL', basis:'IBW',
   live:()=>{const w=dosingWeight('IBW'); return w&&{result:`${fmtNum(60*w.kg)} mcg in 50 mL`, working:`60 mcg × ${w.kg} kg (${w.label})`};}, rxh:'1 mL/h = 0.02 mcg/kg/min'},
  {c:'cir', name:'Noradrenaline', note:'60 mcg/kg in 50 mL · 1 mL/h = 0.02 mcg/kg/min', guide:'60 mcg/kg in 50 mL',
   live:(w)=>w&&{result:`${fmtNum(60*w.kg)} mcg in 50 mL`, working:`60 mcg × ${w.kg} kg`}, rxh:'1 mL/h = 0.02 mcg/kg/min'},
  {c:'cir', name:'Milrinone', note:'1.5 mg/kg in 50 mL · 1 mL/h = 0.5 mcg/kg/min', guide:'1.5 mg/kg in 50 mL',
   live:(w)=>w&&{result:`${fmtNum(1.5*w.kg)} mg in 50 mL`, working:`1.5 mg × ${w.kg} kg`}, rxh:'Range 0.25–0.75 mcg/kg/min'},
  {c:'neu', name:'Dexmedetomidine', note:'10 mcg/kg in 50 mL · 1 mL/h = 0.2 mcg/kg/h', guide:'10 mcg/kg in 50 mL · Bolus 1 mcg/kg', basis:'IBW',
   live:()=>{const w=dosingWeight('IBW'); return w&&{result:`${fmtNum(10*w.kg)} mcg in 50 mL`, working:`10 mcg × ${w.kg} kg (${w.label}) · Bolus ${fmtNum(w.kg)} mcg`};}, rxh:'Range 0.2–1.5 mcg/kg/h (1–7.5 mL/h)', pp:'0.2 mcg/kg/h (IBW)'},
  {c:'cir', name:'Remifentanil', note:'10 mcg/mL · Rate = Weight × 0.6 mL/h = 0.1 mcg/kg/min', guide:'10 mcg/mL', basis:'AdjBW',
   live:()=>{const w=dosingWeight('AdjBW'); return w&&{result:`${fmtNum(0.6*w.kg)}–${fmtNum(1.8*w.kg)} mL/h`, working:`0.1–0.3 mcg/kg/min · 0.6 × ${w.kg} kg (${w.label}) per 0.1`};}, rxh:'Range 0.1–0.3 mcg/kg/min'},
  {c:'cir', name:'Sufentanil', note:'1 mcg/mL (10 mL of 5 mcg/mL to 50 mL)', guide:'&lt;20 kg: 10 mL/h · &gt;20 kg: 20 mL/h',
   live:(w)=>w&&{result:`${w.kg<20?10:20} mL/h`, working:`${w.kg<20?'<20':'≥20'} kg`}, rxh:'Stop 20 min before end'},
  {c:'neu', name:'Ketamine TIVA', note:'200 mg in 50 mL = 4 mg/mL (Consider 8 mg/mL for Larger Children / Long Cases)', basis:'IBW',
   guide:'Induction 1–2 mg/kg · 12 mg/kg/h for 20 min · 8 mg/kg/h for 20 min · 4 mg/kg/h Thereafter',
   live:()=>{const w=dosingWeight('IBW'); return w&&{result:`Bolus ${fmtNum(w.kg)}–${fmtNum(2*w.kg)} mg · ${fmtNum(3*w.kg)} → ${fmtNum(2*w.kg)} → ${fmtNum(w.kg)} mL/h`,
     working:`At 4 mg/mL: 12/8/4 mg/kg/h ÷ 4 × ${w.kg} kg (${w.label})`};}, rxh:'20 min, 20 min, then remainder'},
 ]},

{id:'other', title:'Antibiotics & Fluids', pill:'RXH', c:'acc',
 drugs:[
  {c:'acc', name:'Cefazolin', note:'IV Prophylaxis', perKg:50, unit:'mg', basis:'TBW', rxh:'—'},
  {c:'acc', name:'Metronidazole', note:'IV Prophylaxis', perKg:15, unit:'mg', rxh:'—'},
  {c:'acc', name:'Fluid Bolus', note:'Crystalloid', perKg:5, unit:'mL', rxh:'Titrate to 20 mL/kg max · Urine 0.5–1 mL/kg/h'},
  {c:'acc', name:'Maintenance Fluid (4:2:1)', note:'4 mL/kg/h First 10 kg · 2 mL/kg/h Next 10 kg · 1 mL/kg/h Thereafter', guide:'4:2:1 Rule',
   live:(w)=>{ if(!w) return null; const k=w.kg; const r = k<=10?4*k : k<=20?40+2*(k-10) : 60+(k-20);
     return {result:`${fmtNum(r)} mL/h`, working:`4:2:1 for ${k} kg`}; }, rxh:'—'},
 ]},
];

/* ============================================================
   RENDERERS
   ============================================================ */
const NA = (txt)=>`<td class="live noval" data-label="For This Patient">${txt}</td>`;

function liveCellFor(d, w){
  if(d.live){
    const r = d.live(w);
    return r ? `<td class="live" data-label="For This Patient">${r.result}<span class="w">${r.working}</span></td>`
             : NA(w?'Enter Age':'—');
  }
  if(d.adenosine){
    if(!w) return NA('—');
    const mg = (perKg,max)=>{ let v=perKg*w.kg; if(v>max)v=max; return fmtNum(v/1000)+' mg'; };
    return `<td class="live" data-label="For This Patient">1st ${mg(100,6000)} · 2nd ${mg(200,12000)} · 3rd ${mg(300,12000)}<span class="w">100/200/300 mcg/kg × ${w.kg} kg (max 6/12/12 mg)</span></td>`;
  }
  if(d.anaphAdren){
    const ay = S.ageYears;
    if(ay==null) return NA('Enter Age');
    const band = ay<6 ? '&lt;6 yr → 150 mcg' : (ay<=12 ? '6–12 yr → 300 mcg' : '&gt;12 yr → 500 mcg');
    return `<td class="live" data-label="For This Patient">${band}<span class="w">IM 1:1000 · by age band (age ${fmtNum(ay)} yr)</span></td>`;
  }
  if(d.special) return NA(d.special);
  if(!w) return NA('—');
  const c = calcDose(d);
  return `<td class="live" data-label="For This Patient">${c.result}<span class="w">${c.working}</span></td>`;
}

function basisTag(d){
  if(!d.basis) return '';
  const on = d.basis!=='TBW' && obesityActive();
  return ` <span class="basis${on?' on':''}" title="Dosing weight: ${d.basis}">${d.basis}</span>`;
}

/* opts: doseHead, notesHead, groupCol (show the group a row came from) */
function renderDrugTable(list, opts={}){
  const w = estimateWeight();
  const doseHead = opts.doseHead || 'Dose (APA/DAS/RCUK)';
  const notesHead = opts.notesHead || 'RXH if Different';
  const rows = list.map(d=>{
    const guideCell = d.guide ? d.guide
      : d.adenosine ? '100 / 200 / 300 mcg/kg<br><small class="muted">Max 6 / 12 / 12 mg</small>'
      : d.anaphAdren ? 'IM (1:1000): &lt;6 yr 150 mcg · 6–12 yr 300 mcg · &gt;12 yr 500 mcg'
      : (d.special?d.special:(d.hi!=null?d.perKg+'–'+d.hi:d.perKg)+' '+d.unit+'/kg'+(d.max?'<br><small class="muted">Max '+d.max+' '+d.unit+'</small>':''));
    const badge = d.unv ? ' <span class="unv" title="Not in the RXH guide or paedspro — verify against the SAMF">UNVERIFIED</span>'
      : d.src==='pp' ? ' <span class="ppb" title="Dose from paedspro.com">paedspro</span>' : '';
    const ppNote = d.pp ? `<br><span class="ppnote">paedspro: ${d.pp}</span>` : '';
    const grp = opts.groupCol && d._group ? `<span class="grp">${d._group}</span>` : '';
    return `<tr${d.unv?' class="unvrow"':''}>
      <th><span class="classdot cd-${d.c}"></span>${d.name}${badge}${basisTag(d)}<small>${d.note||''}</small>${grp}</th>
      <td data-label="${doseHead}">${guideCell}</td>
      <td class="${d.same?'rxh same':'rxh'}" data-label="${notesHead}">${d.rxh||'—'}${ppNote}</td>
      ${liveCellFor(d, w)}
    </tr>`;
  }).join('');
  return `<div class="drugwrap"><table class="drugs">
    <thead><tr>
      <th>Drug / Indication</th><th>${doseHead}</th><th>${notesHead}</th>
      <th>For This Patient${w?' ('+w.kg+' kg)':''}</th>
    </tr></thead><tbody>${rows}</tbody></table></div>`;
}

/* ETT · vitals · cardioversion reference (shared by every page) */
function renderEttRef(){
  const s=ettSize(), l=ettLength(), w=estimateWeight();
  const j=(x)=>w?`${fmtNum(x*w.kg)} J`:`${x} J/kg`;
  return `<div class="refgrid">
    <div class="refcard"><h4>ETT Cuffed (RXH)</h4><div class="big">${s!=null?s+' <small>mm ID</small>':'—'}</div><div class="note">Age/4 + 3.5${S.ageYears!=null?` · Age ${fmtNum(S.ageYears)} yr`:''}</div></div>
    <div class="refcard"><h4>ETT Length (Oral)</h4><div class="big">${l!=null?l+' <small>cm</small>':'—'}</div><div class="note">Size × 3 (+2 Nasal)</div></div>
    <div class="refcard"><h4>Defibrillation</h4><div class="big">4 <small>J/kg</small></div><div class="note">Every Cycle</div></div>
    <div class="refcard"><h4>Adrenaline Infusion</h4><div class="big">0.05–0.3 <small>mcg/kg/min</small></div></div>
  </div>
  <h4 class="subh">Cardioversion / Defibrillation Energy</h4>
  <table class="mini"><thead><tr><th>Indication</th><th>1st</th><th>2nd</th></tr></thead><tbody>
    <tr><th>SVT (Synchronised)</th><td class="num">${j(1)}</td><td class="num">${j(2)}</td></tr>
    <tr><th>VT with Pulse (Synchronised)</th><td class="num">${j(2)}</td><td class="num">${j(4)}</td></tr>
    <tr><th>Defibrillation (VF/pVT)</th><td class="num" colspan="2">${j(4)}</td></tr>
  </tbody></table>${w?'':'<p class="hint">Enter weight for joules.</p>'}
  <h4 class="subh">Normal Vital Signs</h4>
  ${renderVitals()}`;
}

function renderEmergTable(){
  return renderDrugTable(EMERG) + `<p class="hint">The live column computes the exact dose from the active weight and shows the arithmetic. Tags such as <span class="basis">IBW</span> show the SOBA dosing weight; they switch from TBW when the BMI centile is ≥98th. Anaphylaxis adrenaline is dosed by age band, not weight.</p>`;
}

/* every drug, flattened, with the panel it belongs to (for search) */
function allDrugs(){
  const out = EMERG.map(d=>Object.assign({_group:'Emergency Drugs', _gid:'alldrugs'}, d));
  GROUPS.forEach(g=>g.drugs.forEach(d=>out.push(Object.assign({_group:g.title, _gid:g.id}, d))));
  return out;
}
function drugMatches(d, q){
  const hay = (d.name+' '+(d.note||'')+' '+(d._group||'')+' '+(d.basis||'')).replace(/<[^>]+>/g,'').toLowerCase();
  return q.toLowerCase().split(/\s+/).filter(Boolean).every(t=>hay.includes(t));
}

/* ============================================================
   SOBA — CHILDREN LIVING WITH OBESITY
   (SOBA UK 2024 quick reference "Anaesthesia for Children Living
   with Obesity"; NPPG 2021; weights per paedspro)
   ============================================================ */
function renderSoba(){
  const w=estimateWeight(), b=bodySize(), full = b && b.bmi!=null;
  const card=(t,v,n,unit='kg')=>`<div class="refcard"><h4>${t}</h4><div class="big">${v!=null?v+(unit?' <small>'+unit+'</small>':''):'—'}</div><div class="note">${n}</div></div>`;
  const need = b && b.missing && b.missing.length ? 'Enter '+b.missing.join(', ') : (b && b.outOfRange ? 'Age Outside 6 mo–20 yr' : '');
  let status;
  if(!full) status = `No BMI centile (${need||'enter age, measured weight, height and sex'}). All drugs are using TBW.`;
  else if(b.obese) status = `BMI ${b.bmi} kg/m² · <b>${fmtCentile(b.centile)} centile</b> · ${b.category}. Obesity dosing weights are <b>ACTIVE</b>: IBW- and AdjBW-basis drugs use those weights.`;
  else status = `BMI ${b.bmi} kg/m² · ${fmtCentile(b.centile)} centile · ${b.category}. Below the 98th centile — all drugs are using TBW.`;
  const tv = (()=>{const x=dosingWeight('IBW'); return x?`${fmtNum(6*x.kg)}–${fmtNum(8*x.kg)} mL <small class="muted">(6–8 mL/kg × ${x.kg} kg ${x.label})</small>`:'6–8 mL/kg (IBW)';})();
  const enox = (()=>{ if(!w) return '—'; const k=w.kg;
    if(k<45) return `${fmtNum(Math.min(0.5*k,20))} mg BD <small class="muted">(0.5 mg/kg × ${k} kg, max 40 mg/day)</small>`;
    if(k<=100) return '40 mg OD'; if(k<=150) return '40 mg BD'; return '60 mg BD'; })();
  const catRow=(c,lab,asa,lo,hi)=>{ const on = full && b.centile>lo && b.centile<=hi; return `<tr${on?' class="current"':''}><td class="num">${c}</td><td>${lab}${on?' ◀':''}</td><td class="num">${asa}</td></tr>`; };
  const list=(items)=>`<ul class="tight">${items.map(i=>`<li>${i}</li>`).join('')}</ul>`;
  const sec=(t,body)=>`<div class="sobasec"><h4 class="subh">${t}</h4>${body}</div>`;
  return `<div class="refgrid">
    ${card('TBW (Actual)', w?w.kg:null, w?(w.source==='measured'?'Measured':'Estimated from Age'):'Enter Age / Weight')}
    ${card('BMI', full?b.bmi:null, full?`${fmtCentile(b.centile)} centile · z ${b.z}`:(need||'—'), 'kg/m²')}
    ${card('IBW', full?b.ibw:null, full?`BMI<sub>50</sub> ${b.bmi50} × height²`:'BMI<sub>50</sub> × height²')}
    ${card('AdjBW (35%)', full?b.adjbw:null, 'IBW + 0.35 × (TBW − IBW)')}
    ${card('AdjBW (40%)', full?b.adjbw40:null, 'IBW + 0.40 × (TBW − IBW)')}
    ${card('LBW', full?b.lbw:null, 'Peters: 3.8 × 0.0215 × TBW<sup>0.6469</sup> × Ht<sup>0.7236</sup>')}
  </div>
  <span class="flag">${status}</span>

  <h4 class="subh">Which Weight for Which Drug</h4>
  <table class="mini"><thead><tr><th>Basis</th><th>Drugs</th></tr></thead><tbody>
   <tr><th>Total (TBW)</th><td>Atropine · Glycopyrrolate · Dexamethasone · Ondansetron · Suxamethonium · Penicillins · Cephalosporins · Sugammadex · Neostigmine · Enoxaparin (also Midazolam PO/Buccal)</td></tr>
   <tr><th>Ideal (IBW)</th><td>Propofol (Induction Bolus) · Ketamine · Morphine · Non-depolarising Muscle Relaxants · Dexmedetomidine (IV) · Local Anaesthetics · Adrenaline · Phenylephrine</td></tr>
   <tr><th>Adjusted (AdjBW)</th><td>Propofol (TCI / Infusion) · Alfentanil · Fentanyl · Remifentanil (Minto) · Dexmedetomidine (IN) · Ibuprofen · Gentamicin · Paracetamol</td></tr>
  </tbody></table>
  <p class="hint">Do not exceed maximum adult doses. AdjBW (40%) and LBW are shown for reference (as in paedspro); no drug on this site is dosed on them.</p>

  <h4 class="subh">Defining Obesity (RCPCH UK-WHO BMI Centile)</h4>
  <table class="mini"><thead><tr><th>BMI Centile</th><th>Weight Category</th><th>ASA</th></tr></thead><tbody>
   ${catRow('&gt;91st','Overweight',2,91,98)}
   ${catRow('&gt;98th','Obese',2,98,99.6)}
   ${catRow('&gt;99.6th','Severely Obese',3,99.6,101)}
  </tbody></table>

  <div class="sobagrid">
  ${sec('Pre-assessment', list([
    '<b>Screen for Co-morbidities</b> — CVS: hypertension, cardiac dysfunction · Respiratory: OSA, asthma, smoke exposure · GI: fatty liver disease (NAFLD), GORD · Endocrine: insulin resistance, type 2 DM · Other: secondary causes of obesity, metabolic syndrome, psychological',
    'Investigations to consider: fasting bloods (glucose + insulin, HbA1c, LFTs, TFTs, lipid profile, vitamin D); sleep study, ECG, echocardiogram, spirometry',
    'Refer to paediatric specialists if necessary',
    'Perform a full airway assessment',
    'Safeguarding concerns?',
    'Preventative medicine: offer lifestyle advice; refer to a Tier 2 community programme / Tier 3 CEW clinic / dietitian']))}
  ${sec('Consent', list([
    '↑ Likelihood of critical events — “higher risk”',
    'Encourage shared decision making',
    'Avoid negative language']))}
  ${sec('Premedication', list([
    'Dexmedetomidine (AdjBW): IN 2–3 mcg/kg (max 150 mcg), 30–60 min before GA',
    'Ketamine (IBW): PO 5–10 mg/kg (10–20 min) · IM 5 mg/kg (3–5 min)',
    'Midazolam (TBW): PO 0.5 mg/kg, max 20 mg (15–30 min) · Buccal 0.3 mg/kg, max 10 mg (10–15 min)',
    '<b>↓ Dose if combining premedications.</b> Midazolam: risk of airway obstruction in OSA — in severe OSA reduce to 0.25 mg/kg']))}
  ${sec('Induction', list([
    '<b>Intravenous</b> — preferable but may be difficult: consider topical analgesia (hands, volar wrist), ultrasound guidance / IO availability',
    '<b>Gas</b> — may take longer due to airway obstruction; use O₂ and volatile; avoid nitrous oxide',
    'The priority is to secure the airway in a rapid but controlled manner']))}
  ${sec('Airway', list([
    'Consider pre-oxygenation where tolerated (face mask / HFNO / nasal cannulae)',
    'Airway obstruction under GA <b>is</b> more common',
    'Difficult face-mask ventilation <b>is</b> more common (3.7% vs 0.6% in healthy-weight children)',
    'Use an oropharyngeal airway ± two-person technique',
    '1st line: tracheal intubation with videolaryngoscopy',
    'Difficult intubation is <b>not</b> more common',
    'Obesity in isolation is <b>not</b> an indication for rapid sequence induction',
    'Decompress the stomach with a nasogastric / orogastric tube',
    'If a supraglottic airway is appropriate, consider a 2nd-generation device (size by TBW)']))}
  ${sec('Ventilation', list([
    `Pressure-control ventilation 6–8 mL/kg (IBW) to limit barotrauma — tidal volume ${tv}`,
    'Optimise PEEP to compensate for reduced FRC',
    'Pressure support if spontaneously ventilating with a supraglottic airway']))}
  ${sec('Analgesia', list([
    'Use a multimodal approach',
    'Avoid long-acting opioids in severe OSA; titrate to clinical effect',
    'Use opioid-sparing techniques: ultrasound-guided regional anaesthesia, analgesic adjuncts (e.g. dexamethasone, dexmedetomidine)',
    'Opioid PCAs are safe to use, but apply the drug dose adjustments above']))}
  ${sec('Positioning & Equipment', list([
    '“Ramp” the patient with pillows / Oxford HELP® pillow at induction (tragus level with sternum) — ↓ risk of difficult laryngoscopy and improves ventilation',
    'Discuss additional equipment at the team brief: table extenders · transfer board and slide sheet · hover mattress &gt;90 kg · gel padding · correctly sized / forearm BP cuff · arterial line · wide straps',
    'Anti-embolism stockings if &gt;40 kg · Intermittent pneumatic compression if &gt;13 years, &gt;40 kg and surgery &gt;60 min']))}
  ${sec('TIVA', list([
    'Titrate to effect',
    'Use depth-of-anaesthesia monitoring',
    'Follow AAGBI / SIVA good practice guidance']))}
  ${sec('Emergence', list([
    '↑ FiO₂ and a more upright position',
    'Full reversal with neuromuscular monitoring',
    'Awake extubation recommended; insert a soft bite block (e.g. rolled gauze)',
    'No evidence that obesity increases PONV risk',
    'NIV should be readily available',
    'Usual PACU discharge criteria should be met; SpO₂ maintained at pre-operative levels with minimal O₂']))}
  ${sec('VTE Prophylaxis', `${list(['Perform a risk assessment and follow local guidance; literature is limited — low threshold for consulting a haematologist'])}
    <table class="mini"><thead><tr><th>TBW</th><th>SC Enoxaparin</th></tr></thead><tbody>
     <tr><td>&lt;45 kg</td><td>0.5 mg/kg BD (max 40 mg/day)</td></tr>
     <tr><td>45–100 kg</td><td>40 mg OD</td></tr>
     <tr><td>100–150 kg</td><td>40 mg BD</td></tr>
     <tr><td>&gt;150 kg</td><td>60 mg BD</td></tr>
     <tr class="current"><th>This Patient</th><td>${enox}</td></tr>
    </tbody></table>`)}
  ${sec('Other', list([
    'Prioritise early mobilisation where possible; ensure good hydration',
    'BM monitoring if insulin resistance / T2DM',
    '<b>Day Case vs Inpatient:</b> surgery- and co-morbidity-dependent; consider the need for HDU. Obesity as the sole co-morbidity does not preclude day-case surgery — if day case, allow prolonged post-operative observation (AM list)']))}
  </div>
  <p class="hint">BMI centile from the UK-WHO LMS reference (6 months–20 years); obesity weights switch on at ≥98th centile, as in paedspro. Needs a <b>measured</b> weight, height and sex — an age-estimated weight is never used for BMI.</p>
  <p class="hint">Sources: SOBA UK “Anaesthesia for Children Living with Obesity” (2024); NPPG “How Should Medicines Be Dosed in Children Who Are Obese?” (April 2021); paedspro.com. For guidance only — always consult local policy.</p>`;
}
