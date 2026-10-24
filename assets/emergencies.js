/* ============================================================
   PAEDIATRIC ANAESTHESIA — SHARED EMERGENCY ALGORITHMS
   (assets/emergencies.js)
   ------------------------------------------------------------
   Used by the Anaesthesia Emergencies and Paediatric Emergency
   pages. Dose chips use D() from calc.js; pass {basis:'IBW'} etc.
   for the SOBA dosing weight (TBW unless BMI centile ≥98th).
   Depends on calc.js and drugs.js (renderEmergTable, renderEttRef).
   ============================================================ */
function ALGOS(){ return [

{id:'laryngospasm', group:'Airway / Respiratory', c:'air', title:'Laryngospasm', pill:'Airway',
 steps:[
  `<b>Call for help</b>; remove the stimulus (secretions, airway, surgery).`,
  `<b>100% O₂</b> + <b>CPAP</b> via tight-fitting mask, close APL valve.`,
  `<b>Larson's manoeuvre</b> — firm pressure at the laryngospasm notch behind ear lobes, jaw thrust.`,
  `<b>Deepen</b> anaesthesia: Propofol ${D(0.5,'mg',{hi:1,basis:'IBW'})} IV (0.5–1 mg/kg, repeated as necessary).`,
  `If unbroken / desaturating: Suxamethonium ${D(1.5,'mg',{basis:'TBW'})} IV (IM 4 mg/kg if no access) + Atropine ${D(20,'mcg',{max:4000,basis:'TBW'})}.`,
  `Ventilate, intubate if needed; watch for <b>negative-pressure pulmonary oedema</b>.`
 ],
 flag:`Bradycardia in a hypoxic child = pre-arrest — treat the hypoxia.`},
{id:'bronchospasm', group:'Airway / Respiratory', c:'air', title:'Bronchospasm', pill:'Airway',
 steps:[
  `<b>100% O₂</b>; exclude mechanical causes — tube position, kink, blockage, breathing circuit.`,
  `<b>Deepen</b> anaesthesia (volatile / Propofol); consider Ketamine.`,
  `Salbutamol — MDI via circuit or neb 2.5–5 mg; IV ${D(15,'mcg')} slow.`,
  `Severe / silent chest: Adrenaline ${D(1,'mcg',{basis:'IBW'})} IV titrated, or IM.`,
  `Add Magnesium ${D(40,'mg',{max:2000})} IV, Hydrocortisone ${D(3,'mg')}, Ipratropium.`,
  `<b>Bronchospastic mix (RXH):</b> Lignocaine 2% 1 mL + Adrenaline 50 mcg (0.5 mL of 1:10 000) + N.Saline 0.5 mL. Give <b>&lt;1 yr = 1 mL</b>, <b>&gt;1 yr = 2 mL</b> down the ETT.`,
  `Hand-ventilate — feel compliance; allow long expiratory time (avoid gas trapping).`
 ]},
{id:'foreignbody', group:'Airway / Respiratory', c:'air', title:'Inhaled Foreign Body / Rigid Bronchoscopy', pill:'Airway · Shared Airway',
 steps:[
  `<b>Don't convert a partial obstruction to complete.</b> Keep the child <b>calm, upright, undisturbed</b>; senior anaesthetist + ENT + theatre before induction.`,
  `<b>Maintain spontaneous ventilation</b> — inhalational (sevoflurane) induction in 100% O₂, no paralysis until the airway is controlled and the surgeon is scrubbed.`,
  `Deepen adequately; topicalise the cords (Lignocaine, max 3 mg/kg = ${D(3,'mg',{label:'max 3 mg/kg',basis:'IBW'})}) to blunt laryngospasm before instrumentation.`,
  `<b>Shared airway:</b> ventilate through the rigid bronchoscope side-arm; communicate continuously with the surgeon; TIVA helps maintain depth.`,
  `<b>Watch for:</b> complete obstruction if FB migrates, ball-valve air trapping, desaturation, laryngospasm on emergence, post-op subglottic oedema (Dexamethasone, nebulised Adrenaline).`,
  `If total obstruction &amp; cannot ventilate → push the FB distally into a main bronchus to ventilate the other lung, then retrieve.`
 ],
 flag:`Spontaneous ventilation + inhalational technique is the safe default — paralysing before the airway is secured can lose it entirely.`},

{id:'dmv', group:'Difficult Airway Pathways', c:'air', title:'Unanticipated Difficult Mask Ventilation', pill:'APA/DAS Fig 1', showNap4:true,
 steps:[
  `<b>100% O₂ + call for help.</b> Is this <b>equipment</b> or <b>patient</b>? Check mask, circuit, O₂ supply — have a <b>self-inflating bag</b> ready.`,
  `<b>Optimise head position</b> — neutral in a child; shoulder roll if &lt;6 months.`,
  `<b>Airway-opening manoeuvres:</b> chin lift, jaw thrust; apply PEEP/CPAP; adjust or release cricoid pressure if used.`,
  `<b>Insert an oropharyngeal airway</b> (if deep enough); deepen anaesthesia — exclude laryngospasm.`,
  `<b>Two-person technique:</b> one holds mask with both hands, the other bags.`,
  `<b>Decompress the stomach</b> (NG tube) — gastric inflation splints the diaphragm in infants.`,
  `Still impossible / SpO₂ falling → <b>insert an LMA</b> (first choice).`,
  `<b>OR</b> deepen, visualise cords, intubate. If LMA fails → move to <b>CICO</b>. <span class="sub">If ventilating well: proceed or wake — if in doubt, wake the child.</span>`
 ],
 flag:`Functional causes (light anaesthesia, laryngospasm, gastric inflation) are commoner than anatomical — deepen and decompress early.`},
{id:'lmafail', group:'Difficult Airway Pathways', c:'air', title:'Cannot Ventilate via LMA', pill:'Airway · Rescue',
 steps:[
  `<b>100% O₂ + call for help.</b> The LMA is your rescue device — if it won't ventilate, optimise it before abandoning it.`,
  `<b>Reseat / resize:</b> check depth of anaesthesia (light plane → laryngospasm), reposition head (sniffing), jaw thrust, and check cuff inflation. Try up/down a size.`,
  `<b>Confirm the problem is the LMA, not the patient:</b> exclude laryngospasm (deepen: Propofol ${D(2.5,'mg',{basis:'IBW'})}), bronchospasm, gastric distension (NG/OG tube), and breath-stacking (disconnect, long expiration).`,
  `<b>Second-generation LMA:</b> pass a gastric tube through the drain channel to decompress the stomach and improve the seal.`,
  `<b>Still cannot ventilate:</b> remove the LMA and return to face-mask ventilation (two-person), or intubate (via the LMA as a conduit if appropriate).`,
  `<b>If mask, LMA and intubation all fail and SpO₂ falling → declare CICO</b> and move to front-of-neck access without delay.`
 ],
 flag:`The LMA failing to ventilate is a step toward CICO — optimise it fast, but don't fixate. If nothing ventilates and SpO₂ is falling, declare CICO.`},

{id:'dti', group:'Difficult Airway Pathways', c:'air', title:'Unanticipated Difficult Tracheal Intubation', pill:'APA/DAS Fig 2',
 steps:[
  `<b>100% O₂ + call for help.</b> Maintain oxygenation between every attempt — mask-ventilate to recover SpO₂.`,
  `<b>Limit to 3–4 attempts total.</b> Each attempt must <b>change something</b> — do not repeat the identical technique.`,
  `<b>Change personnel</b> (most experienced anaesthetist), <b>position</b>, or <b>equipment</b>.`,
  `<b>Optimise the view:</b> external laryngeal manipulation, adequate depth &amp; paralysis, bougie or stylet, straight blade (infants), video laryngoscope.`,
  `Larynx impossible to view → <b>insert an LMA</b> (oxygenate; conduit for fibreoptic intubation).`,
  `LMA fails to ventilate → <b>CICO pathway</b>. <span class="sub">Ventilating but not intubated: wake or proceed on the LMA.</span>`
 ],
 flag:`Repeated laryngoscopy causes oedema that converts a difficult airway into a CICO — change approach, don't just retry.`},
{id:'cico', group:'Difficult Airway Pathways', c:'air', title:"Can't Intubate, Can't Oxygenate (CICO)", pill:'APA/DAS Fig 3',
 steps:[
  `<b>Declare CICO.</b> Confirm all mask/LMA steps failed. Call for <b>most senior help + ENT/surgeon</b> and the difficult-airway trolley.`,
  `If a reversible relaxant was used (Rocuronium/Vecuronium) and waking is an option → <b>Sugammadex</b> and wake the child.`,
  `<b>Act when SpO₂ &lt;80% and falling and/or HR dropping.</b> The critical failure is <b>doing nothing</b>.`,
  `<b>Front-of-neck access — choose by age/anatomy:</b><br><b>Older / larger child →</b> scalpel cricothyroidotomy (recruit the surgeon).<br><b>Infant / small child →</b> cricothyroid membrane (~2.6 × 3 mm) is smaller than any tube — surgical tracheostomy or inter-ring approach by ENT.`,
  `<b>Cannula technique:</b> extend neck, stabilise trachea, insert cannula, confirm air aspiration, oxygenate via purpose-made device. Beware barotrauma.`,
  `<b>Scalpel technique:</b> extend neck → stab skin + cricothyroid membrane → tracheal hook at lower edge → railroad tube → ventilate, confirm ETCO₂, secure.`
 ],
 flag:`Infant anatomy is the trap — CTM barely exists; locating between tracheal rings is easier. Get ENT if time allows, but never delay the only technique that oxygenates.`},

{id:'arrest', group:'Circulation', c:'cir', title:'Paediatric Cardiac Arrest', pill:'APLS / RCUK',
 steps:[
  `Confirm arrest; <b>call resus team</b>; start <b>CPR 15:2</b> (2 rescuers), rate 100–120, depth ⅓ chest.`,
  `Attach defib/monitor; <b>rhythm check</b> — shockable vs non-shockable.`,
  `<b>Non-shockable</b> (PEA/asystole — the common paediatric arrest): Adrenaline ${D(10,'mcg',{basis:'IBW'})} IV/IO immediately, then every 3–5 min.`,
  `<b>Shockable</b> (VF/pVT): DC shock ${D(4,'J',{label:'4 J/kg'})}; Adrenaline ${D(10,'mcg',{basis:'IBW'})} + Amiodarone ${D(5,'mg',{max:300})} after 3rd shock (repeat after 5th). <b>Lignocaine ${D(1,'mg',{hi:1.5})} (1–1.5 mg/kg) is an alternative to amiodarone.</b>`,
  `<b>Airway:</b> ventilate 100% O₂; once advanced airway in, continuous compressions + 25 breaths/min.`,
  `<b>Reversible causes — 4 H &amp; 4 T:</b> Hypoxia, Hypovolaemia, Hypo/hyperkalaemia &amp; metabolic, Hypothermia · Tension pneumothorax, Tamponade, Toxins, Thromboembolism.`
 ],
 flag:`In children, hypoxia &amp; hypovolaemia are the usual precipitants — fix airway and volume first.`},

{id:'hypotension', group:'Circulation', c:'cir', title:'Acute Hypotension', pill:'AAGBI QRH · Circulation',
 steps:[
  `<b>Confirm it's real:</b> recheck cuff size/position, transducer level/zero, arterial trace. Palpate a central pulse. <b>Give 100% O₂.</b>`,
  `<b>Immediate support:</b> IV fluid bolus ${D(10,'mL')} (repeat to ${D(20,'mL',{label:'20 mL/kg'})}); a titrated vasopressor bolus (Ephedrine or Adrenaline) while you find the cause.`,
  `<b>Reduce the obvious causes:</b> lighten if anaesthesia too deep; check for <b>high intrathoracic pressure</b> (gas trapping, tension pneumothorax, high PEEP) — disconnect and hand-ventilate to test.`,
  `<b>Think through the differential:</b> hypovolaemia / haemorrhage, <b>anaphylaxis</b> (rash, bronchospasm, high airway pressure), arrhythmia, <b>LAST</b>, sepsis, embolism (air/PE), cardiac (ischaemia, tamponade), high neuraxial block.`,
  `<b>Surgical causes:</b> caval compression, vagal/peritoneal traction, gas embolism during laparoscopy, major blood loss — communicate with the surgeon.`,
  `Treat the cause; escalate early; consider an arterial line, invasive monitoring, and inotrope/vasopressor infusion if not responding.`
 ],
 flag:`If hypotension is severe, sudden, and with a high airway pressure or rash — treat as anaphylaxis until proven otherwise. Disconnect-and-hand-ventilate tests for gas trapping / tension in seconds.`},
{id:'svt', group:'Circulation', c:'cir', title:'SVT', pill:'Circulation · RCUK',
 steps:[
  `<b>Assess stability:</b> conscious level, perfusion, BP.`,
  `<b>Stable:</b> vagal manoeuvres (ice to face in infants; Valsalva).`,
  `Adenosine ${D(100,'mcg',{max:6000})} rapid IV + flush; ↑ by 50–100 mcg/kg every 1–2 min (max 12 mg; neonate 300 mcg/kg).`,
  `<b>Unstable</b> (shock, ↓consciousness): synchronised DC ${D(1,'J',{suffix:'',label:'1 J/kg'})} → ${D(2,'J',{label:'2 J/kg'})}.`,
  `Seek expert help; treat reversible causes; consider Amiodarone.`
 ]},
{id:'anaphylaxis', group:'Circulation', c:'cir', title:'Anaphylaxis', pill:'Circulation · RCUK',
 steps:[
  `<span class="stop">STOP</span> the likely trigger (antibiotic, NMBA, latex, chlorhexidine, colloid).`,
  `<b>Call for help</b>; declare anaphylaxis; <b>100% O₂</b>, secure airway.`,
  `<b>Adrenaline IM</b> by age band — repeat every 5 min. In theatre with monitoring &amp; access: titrated IV ${D(1,'mcg',{basis:'IBW'})} boluses by an experienced anaesthetist.`,
  `<b>IV fluid bolus</b> ${D(20,'mL')} crystalloid, repeat as needed — vasodilatation is profound.`,
  `Refractory (≥2 IM doses): start <b>Adrenaline infusion</b> 0.05–0.3 mcg/kg/min; consider Vasopressin, Glucagon (if β-blocked).`,
  `<b>Second line</b> (after stabilisation): Hydrocortisone ${D(3,'mg')}, Chlorphenamine by age.`,
  `<b>Investigations:</b> mast-cell tryptase — at diagnosis, 1–2 h, and 24 h.`,
  `Document; refer for allergy testing; report the reaction.`
 ],
 flag:`Grade by severity · IM Adrenaline is first-line &amp; lifesaving — don't delay for IV access.`},
{id:'embolism', group:'Circulation', c:'cir', title:'Air / Gas (Venous) Embolism', pill:'AAGBI QRH · Circulation',
 steps:[
  `<b>Suspect</b> with a sudden <b>fall in ETCO₂</b>, desaturation, hypotension, tachy/brady or arrhythmia — classically during neurosurgery (sitting), laparoscopy (CO₂), CVC insertion/removal, or open venous surgery.`,
  `<b>Stop further entrainment:</b> flood the surgical field with saline, pack the wound; ask the surgeon to occlude the source; release pneumoperitoneum / stop gas insufflation.`,
  `<b>100% O₂</b>, stop N₂O. <b>Call for help.</b>`,
  `<b>Position:</b> head-down + left lateral (Durant) to trap gas in the RV apex, away from the RV outflow.`,
  `<b>Aspirate air</b> from a central line if in situ. <b>Support the circulation:</b> IV fluids ${D(20,'mL')}, vasopressor (Ephedrine or Adrenaline); CPR if arrest — compressions may fragment a gas lock.`,
  `Consider hyperbaric O₂ if significant paradoxical / cerebral arterial embolism. Monitor for pulmonary oedema; escalate to ICU.`
 ],
 flag:`A sudden fall in ETCO₂ with hypotension in a high-risk case = embolism until proven otherwise. Stop the entry point, flood the field, Durant position, aspirate from a CVC.`},

{id:'mh', group:'Metabolic', c:'met', title:'Malignant Hyperthermia', pill:'AAGBI / RXH',
 steps:[
  `<span class="stop">STOP</span> all volatile / Suxamethonium; <b>change circuit / use wall O₂</b>; <b>call for help + declare MH</b>; get the <b>MH kit</b>.`,
  `<b>100% O₂</b> high flow; hyperventilate; convert to <b>TIVA</b>; remove vaporisers.`,
  `Dantrolene ${D(2.5,'mg')} IV bolus, <b>repeat every 5 min</b> until signs reverse → up to 30 mg/kg (${D(30,'mg',{label:'ceiling 30 mg/kg'})}). 20 mg vials, each in 60 mL sterile water — assign a mixer.`,
  `<b>Active cooling</b> if T&gt;39 °C — cold IV fluids, surface ice, cavity lavage; stop at 38 °C; avoid vasoconstriction.`,
  `<b>Hyperkalaemia:</b> Ca gluconate ${D(0.5,'mL',{max:20})}, glucose–insulin, NaHCO₃ (see Hyperkalaemia).`,
  `<b>Arrhythmias:</b> Magnesium / Amiodarone. <span class="stop">Do NOT use Ca-channel blockers</span> — hyperkalaemia &amp; arrest with Dantrolene.`,
  `<b>Acidosis:</b> NaHCO₃ ${D(1,'mL',{label:'1 mL/kg if no gas'})}, else BE-based. Catheterise, aim urine &gt;0.5 mL/kg/h; if low → Furosemide ${D(1,'mg')} or Mannitol ${D(0.25,'g')}.`,
  `<b>Monitor:</b> core temp, ETCO₂, ABG, K⁺, CK, myoglobin, coagulation. ICU + continue Dantrolene.`
 ],
 flag:`Triad: ↑ETCO₂, tachycardia, rigidity / masseter spasm — with acidosis, ↑temp (late), myoglobinuria.`},
{id:'air', group:'Metabolic', c:'met', title:'Anaesthesia-Induced Rhabdomyolysis (AIR)', pill:'Metabolic · RXH',
 steps:[
  `<b>Recognise — this is NOT MH:</b> presents with <b>bradycardia, hyperkalaemia, peaked T-waves, cardiac arrest</b> (often undiagnosed myopathy after Suxamethonium/volatile). <span class="stop">No Dantrolene.</span>`,
  `<span class="stop">STOP</span> all triggers (volatile + Suxamethonium); change machine / use wall O₂; call for help.`,
  `<b>100% O₂ + hyperventilate.</b> <b>ABG — check K⁺.</b>`,
  `<b>Treat hyperkalaemia</b> once confirmed (see Hyperkalaemia) — this is the priority.`,
  `<b>Catheterise</b>, aim urine &gt;1 mL/kg/h: IV fluid boluses + Mannitol ${D(0.25,'g')}.`,
  `If pulseless or HR &lt;60 → <b>start CPR</b>. CPR &gt;20 min → consider <b>bypass / ECMO</b>. Send blood + urine myoglobin, CK.`
 ],
 flag:`Key distinction: AIR = hyperkalaemic arrest (treat the K⁺); MH = hypermetabolic (give Dantrolene). Don't confuse them.`},
{id:'last', group:'Metabolic', c:'last', title:'Local Anaesthetic Systemic Toxicity (LAST)', pill:'AAGBI',
 steps:[
  `<span class="stop">STOP</span> injecting LA; <b>call for help</b>; <b>100% O₂</b>, secure airway.`,
  `<b>Control seizures:</b> Benzodiazepine / small Propofol (avoid large Propofol if unstable).`,
  `Intralipid 20% ${D(1.5,'mL')} bolus over 1 min, then infusion 15 mL/kg/h.`,
  `Repeat bolus ×2 every 5 min if unstable; double infusion rate. Max ≈ 12 mL/kg (${D(12,'mL',{label:'ceiling ≈12 mL/kg'})}).`,
  `<b>If arrest:</b> prolonged CPR (&gt;1 h); small Adrenaline doses (&lt;1 mcg/kg); avoid Vasopressin, Ca-blockers, LA.`
 ]},
{id:'hyperk', group:'Metabolic', c:'met', title:'Hyperkalaemia Management', pill:'RXH / APLS',
 steps:[
  `<b>Confirm on ABG</b> (exclude haemolysis/spurious); continuous <b>ECG</b> — watch peaked T-waves, wide QRS.`,
  `<b>Stabilise the membrane:</b> Ca gluconate 10% ${D(0.5,'mL',{max:20})} IV bolus — or CaCl₂ 10% ${D(0.15,'mL',{max:10})}. Repeat if ECG changes persist.`,
  `<b>Shift K⁺ in:</b> Salbutamol neb/IV; NaHCO₃ 8.4% ${D(1,'mL',{label:'1–2 mL/kg'})} (or BE-based).`,
  `<b>Hyperventilate</b> (once ETT-in-right-main-bronchus excluded).`,
  `<b>Insulin–Dextrose</b> if not resolving (senior input): Emergency 50% Dextrose ${D(1,'mL')} + Insulin ${D(0.1,'U',{label:'0.1 U/kg'})}. Gradual: 25% Dextrose 2 mL/kg/h until glucose &gt;10 → Actrapid 0.05 U/kg/h.`,
  `Salbutamol infusion: 5 mcg/kg/min ×1 h, then 1 mcg/kg/min.`,
  `<b>Diuresis:</b> Furosemide ${D(1,'mg')}. Monitor glucose &amp; K⁺; aim glucose 10–15 mmol/L.`
 ],
 flag:`Calcium protects the myocardium but does NOT lower K⁺ — always follow with a shifting agent.`},

{id:'dopes', group:'Systems / Equipment', c:'neu', title:'DOPES — Sudden Deterioration in an Intubated Child', pill:'AAGBI QRH · Systematic',
 steps:[
  `<b>Switch to 100% O₂; hand-ventilate</b> off the machine with a self-inflating bag — this immediately removes ventilator/circuit as the cause and lets you feel compliance.`,
  `<b>D — Displacement:</b> ETT too deep (endobronchial → unilateral chest rise), too shallow, or oesophageal. Check depth at lips, capnography trace, auscultate; use ultrasound / re-laryngoscopy if unsure.`,
  `<b>O — Obstruction:</b> kink, secretions, mucus plug, blood, biting. Pass a suction catheter down the ETT; if it won't pass, the tube is blocked — remove and re-oxygenate.`,
  `<b>P — Pneumothorax:</b> ↑airway pressure, ↓unilateral air entry, ↓SpO₂, ↑HR, hypotension. Tension → immediate needle decompression / finger thoracostomy, then chest drain.`,
  `<b>E — Equipment:</b> once bagging, work through circuit, valves, O₂ source, connectors, capnography line, ventilator settings. User error (wrong bag/mask size, wrong rate) is common in small children.`,
  `<b>S — Stacking &amp; Stomach:</b> <b>Stacking</b> (breath-stacking / gas trapping, esp. bronchospasm) — disconnect to let trapped gas escape, allow long expiration. <b>Stomach</b> — gastric distension splints the diaphragm; decompress with an NG/OG tube.`
 ],
 flag:`Disconnect and hand-ventilate first — it converts an unknown ventilator problem into a simple airway assessment. If in doubt, take the machine out of the circuit.`},
{id:'desat', group:'Systems / Equipment', c:'neu', title:'Acute Desaturation + Loss of ETCO₂', pill:'AAGBI QRH · Airway / Circulation',
 steps:[
  `<b>Loss of ETCO₂ has two lethal causes — decide fast:</b> (1) no circulation → <b>cardiac arrest</b>, or (2) no ventilation reaching the lungs → <b>airway/circuit problem</b>. Check a pulse now.`,
  `<b>No pulse → cardiac arrest algorithm</b> immediately (CPR, adrenaline 10 mcg/kg).`,
  `<b>Pulse present → 100% O₂, hand-ventilate, run DOPES:</b> displaced/obstructed ETT, disconnection, oesophageal intubation, complete circuit obstruction.`,
  `<b>Confirm the airway:</b> flat capnograph with an ETT = displacement, disconnection, or oesophageal — direct/video laryngoscopy to confirm the tube is through the cords.`,
  `<b>Also consider:</b> severe bronchospasm, massive PE / air or fat embolism, low cardiac output states — a sudden fall (not loss) of ETCO₂ with hypotension suggests embolism or falling output.`,
  `Escalate; treat the identified cause; recheck ETCO₂ returns as the marker of success.`
 ],
 flag:`A flat capnograph is either "no output" or "no ventilation" — a pulse check separates arrest from an airway problem. Waveform capnography is the single most reliable monitor here (NAP4).`},
{id:'highpaw', group:'Systems / Equipment', c:'neu', title:'High Airway Pressure', pill:'AAGBI QRH',
 steps:[
  `<b>100% O₂; hand-ventilate</b> with a self-inflating bag to feel compliance and separate <b>circuit/equipment</b> from <b>patient</b> causes.`,
  `<b>Equipment/circuit (relieved by disconnecting):</b> obstructed / kinked ETT or circuit, stuck APL valve or ventilator, wrong ventilator settings, filter blockage. If bagging is easy off the machine, the fault is the machine/circuit.`,
  `<b>Patient — airway:</b> run <b>DOPES</b> — displaced (endobronchial) or obstructed ETT (secretions, mucus plug, biting), <b>breath-stacking</b> / gas trapping.`,
  `<b>Patient — lungs / chest:</b> bronchospasm, <b>tension pneumothorax</b> (↓unilateral air entry, hypotension → decompress), pulmonary oedema, aspiration, light anaesthesia with coughing / straining.`,
  `<b>Surgical:</b> retraction, pneumoperitoneum, patient position, surgeon leaning on the chest — communicate with the surgeon.`,
  `Deepen anaesthesia ± relaxant if straining; treat the identified cause; recheck compliance.`
 ],
 flag:`Hand-ventilating is the fastest test — if compliance is normal off the machine, the problem is the circuit/ventilator, not the patient.`},
{id:'machinefail', group:'Systems / Equipment', c:'neu', title:'Anaesthetic Machine / Ventilator Failure', pill:'AAGBI QRH',
 steps:[
  `<b>Call for help</b> and declare the problem. <b>Maintain anaesthesia &amp; oxygenation</b> — patient safety before fault-finding.`,
  `<b>Switch to a self-inflating bag</b> with an <b>alternative O₂ source</b> (cylinder on the machine, or a separate cylinder). Hand-ventilate.`,
  `<b>Convert to TIVA</b> (Propofol ± remifentanil / Ketamine) to maintain anaesthesia and prevent awareness — a stopped vaporiser means no volatile.`,
  `<b>Isolate the fault:</b> total machine vs component — vaporiser, gas delivery, ventilator, or integrated monitoring. Use the machine's O₂ flush / auxiliary O₂ outlet if the fault is ventilator-only.`,
  `<b>Get a replacement machine</b>; keep the self-inflating bag until the new machine is checked (two-bag check). Continue full monitoring — SpO₂ + capnography are the priority.`,
  `Document; report the equipment failure; remove the faulty machine from service.`
 ],
 flag:`A self-inflating bag + O₂ cylinder keeps the patient alive independent of the machine — reach for it before troubleshooting. Awareness risk is real once the vaporiser stops: start TIVA early.`},
{id:'o2fail', group:'Systems / Equipment', c:'neu', title:'O₂ Supply / Pipeline Failure', pill:'AAGBI QRH',
 steps:[
  `<b>Declare it; call for help.</b> Suspect if O₂ analyser falls, pipeline pressure gauge drops, or the low-O₂ alarm sounds.`,
  `<b>Open the O₂ cylinder on the anaesthetic machine</b> immediately — this is the fastest independent supply.`,
  `<b>Disconnect the O₂ pipeline hose from the wall.</b> A crossed or contaminated pipeline can deliver a hypoxic mix — the cylinder is only safe once the wall supply is disconnected.`,
  `<b>Switch to a self-inflating bag</b> if machine flow is unreliable; ventilate from the cylinder. <b>Minimise flows</b> to conserve cylinder O₂ (know your remaining volume).`,
  `<b>Maintain anaesthesia</b> — convert to TIVA if fresh gas / vaporiser is compromised.`,
  `Call for backup cylinders early; alert theatre coordinator &amp; estates; plan to wake or finish depending on cylinder reserve.`
 ],
 flag:`Disconnect the wall pipeline — do not assume a rising cylinder fixes a crossed pipeline still feeding a hypoxic mix. Cylinder O₂ is finite: minimise flows and count your reserve.`},

{id:'blood', group:'Haemorrhage', c:'cir', title:'Blood Products / Bleeding', pill:'Haemorrhage · RXH',
 type:'custom', html:()=>{
   const w=estimateWeight();
   const wk = w? w.kg : null;
   const line=(perKg,unit,lbl)=>{
     if(!wk) return `<span class="dose noval"><span class="calc">${perKg} ${unit}/kg</span></span>`;
     return `<span class="dose"><span class="calc">${fmtNum(perKg*wk)} ${unit}</span><span class="work">${perKg} ${unit}/kg × ${wk} kg</span></span>`;
   };
   return `<div class="dpanel" style="display:grid;grid-template-columns:1fr 1fr;gap:0 26px;">
     <dl>
       <dt>Packed Red Cells</dt><dd>(Desired−Actual Hb) × wt × 4 mL<br><small>(30 mL/kg in MTP)</small></dd>
       <dt>Platelets</dt><dd>${line(10,'mL','Platelets')} <small>/dose</small></dd>
       <dt>FFP</dt><dd>${line(15,'mL','FFP')} <small>/dose</small></dd>
       <dt>Tranexamic Acid</dt><dd>5–10 mg/kg over 20 min + 10 mg/kg/h; MTP ${line(10,'mg','TXA')}</dd>
     </dl>
     <dl>
       <dt>Cryoprecipitate</dt><dd>1 bag per 5 kg${wk?` ≈ <b>${Math.max(1,Math.round(wk/5))} bag(s)</b>`:''} <small>(individual, not pooled)</small></dd>
       <dt>Albumin 4%</dt><dd>${line(5,'mL','Albumin')} boluses</dd>
       <dt>PRBC Unit Size</dt><dd>Paed 130±25 mL · Neonate 55±20 mL</dd>
       <dt>Platelet Unit</dt><dd>Infant apheresis 50 mL · Paed single-donor 150 mL</dd>
     </dl>
   </div>`;
 }},
{id:'mtp', group:'Haemorrhage', c:'cir', title:'Massive Transfusion Protocol (MTP)', pill:'Haemorrhage · RXH',
 type:'custom', html:()=>{
   const w=estimateWeight(); const wk=w?w.kg:null;
   const vol=(perKg,unit)=> wk? `<span class="dose"><span class="calc">${fmtNum(perKg*wk)} ${unit}</span><span class="work">${perKg} ${unit}/kg × ${wk} kg</span></span>` : `<span class="dose noval"><span class="calc">${perKg} ${unit}/kg</span></span>`;
   return `
   <ol class="steps">
     <li><b>Alert switchboard</b> — location, name, hospital number, weight.</li>
     <li><b>Send:</b> crossmatch (3 mL); repeat ABG half-hourly (monitor <b>K⁺ &amp; Ca²⁺</b>).</li>
     <li><b>Blood warmer</b> on. Give Tranexamic acid ${vol(10,'mg')} IV.</li>
   </ol>
   <div class="refgrid" style="margin-top:10px;">
     <div class="refcard"><h4>MTP Pack 1</h4><div>PRBC ${vol(30,'mL')}<br>+ FFP ${vol(15,'mL')}</div></div>
     <div class="refcard"><h4>MTP Pack 2*</h4><div>Cryo 4 units/kg${wk?` ≈ ${Math.round(4*wk)} u`:''}<br>+ Platelets ${vol(10,'mL')}</div><div class="note">*if ongoing bleeding</div></div>
   </div>
   <table class="mini" style="margin-top:10px;"><thead><tr><th>Indications for MTP</th></tr></thead><tbody>
     <tr><td>Rapid loss with shock or no likelihood of control</td></tr>
     <tr><td>Actual loss &gt;40 mL/kg${wk?` (≈ ${Math.round(40*wk)} mL)`:''}</td></tr>
     <tr><td>Ongoing loss ≥20 mL/kg/h${wk?` (≈ ${Math.round(20*wk)} mL/h)`:''}</td></tr>
     <tr><td>Severe head, thoracic, abdominal, pelvic or long-bone trauma</td></tr>
   </tbody></table>
   <span class="flag">Monitor ionised Ca²⁺ &amp; K⁺ throughout — citrate load causes hypocalcaemia; stored blood is hyperkalaemic.</span>`;
 }},

{id:'drugs', group:'Reference', c:'acc', title:'All Emergency Drugs (Live Table)', pill:'Reference',
 type:'custom', html:()=>renderEmergTable()},
{id:'ett', group:'Reference', c:'acc', title:'ETT · Vitals · Cardioversion', pill:'Reference',
 type:'custom', html:()=>renderEttRef()},

]; }
