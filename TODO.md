# To do

## Dosing weights / obesity (SOBA)
- [x] **BMI tables:** UK-WHO BMI LMS values (WHO 2006 0.5–4 yr, UK90 4–20 yr) in `assets/growth-uk-who.js`, matching the data bundled with paedspro. Replace with the locally supplied tables when uploaded (same `[age, L, M, S]` shape).
- [x] Height and sex inputs in the patient bar (patient now carries across pages for the browser session).
- [x] "TBW > 110% of IBW" replaced by the BMI-centile trigger (≥98th, as paedspro). Needs measured weight, height, sex and age 6 mo–20 yr; the manual IBW box is gone (IBW = BMI50 × height²).
- [x] Dosing-weight bases on the emergency drug table and the emergency pages' dose chips (adrenaline, propofol, rocuronium, lidocaine topical = IBW; atropine, suxamethonium = TBW).
- [x] LBW (Peters) and AdjBW 40% shown alongside AdjBW 35% (reference only — no drug uses them).
- [x] Rest of the SOBA 2024 sheet: pre-assessment, consent, induction, airway, ventilation (live tidal volume), analgesia, positioning, TIVA, emergence, VTE (live enoxaparin), other.
- [ ] Confirm bases for emergency drugs SOBA does not list (dantrolene, intralipid, amiodarone, lignocaine for arrest, fluids, hydrocortisone, naloxone) — currently TBW.
- [ ] Below 6 months there is no BMI centile (tables start at 0.5 yr), so obesity weights never switch on.
- [ ] Emergency card (`mepa-emergency-card.html`) weight bands are still TBW only.

## Drug data
- [ ] Clinically verify every drug badged **UNVERIFIED**: etomidate, cisatracurium, vecuronium, phenytoin, phenobarbitone. Remove the flag once checked.
- [ ] Check the dose cap inferred for midazolam IV loading (no popup seen) and confirm levetiracetam status epilepticus maximum and infusion rate against the local guideline.
- [ ] Reconcile RXH vs paedspro differences (shown as "paedspro: …" notes): ondansetron 0.15 vs 0.2 mg/kg, clonidine PO, midazolam PO (0.2–0.3, max 7.5 vs 0.5, max 20), morphine IV/PO, alfentanil, dexmedetomidine bolus.
- [ ] Remaining paedspro drugs not yet added (need doses/screenshots): ceftriaxone, cefuroxime, co-amoxiclav, flucloxacillin, tazocin, meropenem, metronidazole, teicoplanin, vancomycin, gentamicin, aciclovir, amoxicillin, carbamazepine, valproate, cyclizine, ketamine/midazolam variants, lidocaine variants, ETT/LMA/laryngoscope sizes, tidal volume, blood volume, fluid bolus, energy (DC) values.
- [ ] Any paedspro sections below Anticonvulsants (screenshots stopped there).
- [ ] Add the "i" popup text (age bands, maxima, references: BNFC, NPPG 2021) for the remaining drugs, as was done for lorazepam, diazepam and levetiracetam.
- [ ] Paedspro rounds doses to whole numbers; this app shows 1 decimal for 10–100. Decide on rounding.

## Pages / structure
- [ ] Paediatric Emergency shows the same shared algorithms as Anaesthesia Emergencies (`assets/emergencies.js`). Filter the list in its `MEPA.init` if it should be a general emergency page.
- [ ] Emergency card (`mepa-emergency-card.html`) is untouched apart from nav links; its drug doses are not linked to the live data.
- [x] Drug data moved to one shared file (`assets/drugs.js`); the emergency algorithms are shared too (`assets/emergencies.js`).
- [x] Search: across all drugs in the Drug Reference, emergencies on the emergency pages, and site-wide on the home page.
- [x] `index.html` is a landing page with search; `old/` removed; `_template.html` updated.
- [ ] Emergency-pathway adrenaline/anaphylaxis wording vs. new obesity weights.

## Sources / access
- [x] `www.paedspro.com` is reachable from the Claude cloud environment again (its drugs.json and UK90 data were used for the BMI work).
- [ ] RXH Quick Reference Guide: only the 2023 v3 PDF has been used; add FLACC/NIPS/PAED score tables and CVC sizing if wanted on a page.

## Design
- [ ] Pick a default theme (Slate, Mist, Navy or Graphite — switchable in the navbar; stored per browser).

## Testing / quality
- [ ] Test on real phones and tablets (iOS Safari, Android Chrome); tested so far only in headless Chromium at 390 px and 820 px.
- [ ] Print/PDF check of the new Drug Reference panels.
- [ ] Automated checks (a small Node test of `dosingWeight()` / `calcDose()` / `bodySize()`).
