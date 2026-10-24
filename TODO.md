# To do

## Dosing weights / obesity (SOBA)
- [ ] **BMI tables:** add age- and sex-specific BMI centile tables (UK-WHO / RCPCH) so the app can calculate BMI centile, BMI50, IBW (= BMI50 × height²) and the obesity category (>91st, >98th, >99.6th) from age, sex, height and weight. Until then IBW is entered by hand.
- [ ] Add **height** and **sex** inputs to the patient bar.
- [ ] Replace the "TBW > 110% of IBW" auto-switch with the BMI-centile trigger (≥98th) once the tables exist, or confirm 110% as the local rule.
- [ ] Apply dosing-weight bases to the emergency drug tables and the interactive / Paediatric Emergency pages (adrenaline is IBW, atropine TBW, etc.). Only the Drug Reference page does this today.
- [ ] Lean body weight (LBW) and AdjBW at 40%, as shown in paedspro, if wanted.
- [ ] Obesity airway/ventilation/consent/analgesia notes from the SOBA sheet (only the drug-weight table, BMI categories and premed doses are in so far).

## Drug data
- [ ] Clinically verify every drug badged **UNVERIFIED**: etomidate, cisatracurium, vecuronium, phenytoin, phenobarbitone. Remove the flag once checked.
- [ ] Check the dose cap inferred for midazolam IV loading (no popup seen) and confirm levetiracetam status epilepticus maximum and infusion rate against the local guideline.
- [ ] Reconcile RXH vs paedspro differences (shown as "paedspro: …" notes): ondansetron 0.15 vs 0.2 mg/kg, clonidine PO, midazolam PO (0.2–0.3, max 7.5 vs 0.5, max 20), morphine IV/PO, alfentanil, dexmedetomidine bolus.
- [ ] Remaining paedspro drugs not yet added (need doses/screenshots): ceftriaxone, cefuroxime, co-amoxiclav, flucloxacillin, tazocin, meropenem, metronidazole, teicoplanin, vancomycin, gentamicin, aciclovir, amoxicillin, carbamazepine, valproate, cyclizine, ketamine/midazolam variants, lidocaine variants, ETT/LMA/laryngoscope sizes, tidal volume, blood volume, fluid bolus, energy (DC) values.
- [ ] Any paedspro sections below Anticonvulsants (screenshots stopped there).
- [ ] Add the "i" popup text (age bands, maxima, references: BNFC, NPPG 2021) for the remaining drugs, as was done for lorazepam, diazepam and levetiracetam.
- [ ] Paedspro rounds doses to whole numbers; this app shows 1 decimal for 10–100. Decide on rounding.

## Pages / structure
- [ ] Paediatric Emergency is a full copy of the interactive page. Trim anaesthesia-specific content (difficult airway pathways, machine/O₂ failure, etc.) if it should be a general emergency page.
- [ ] Emergency card (`mepa-emergency-card.html`) is untouched apart from nav links; its drug doses are not linked to the live data.
- [ ] Drug list data is duplicated (EMERG in the Drug Reference, DRUGS in the interactive and emergency pages). Move to one shared data file.
- [ ] Add a search/filter box across all drugs in the Drug Reference.
- [ ] `index.html` still redirects to `mepa-interactive.html`; `old/` and `_template.html` could be tidied.
- [ ] Emergency-pathway adrenaline/anaphylaxis wording vs. new obesity weights.

## Sources / access
- [ ] `www.paedspro.com` is blocked from the Claude cloud environment (network policy); allow it if automatic checking of doses is wanted.
- [ ] RXH Quick Reference Guide: only the 2023 v3 PDF has been used; add FLACC/NIPS/PAED score tables and CVC sizing if wanted on a page.

## Testing / quality
- [ ] Test on real phones and tablets (iOS Safari, Android Chrome); tested so far only in headless Chromium at 390 px and 820 px.
- [ ] Print/PDF check of the new Drug Reference panels.
- [ ] Automated checks (a small Node test of `dosingWeight()` / `calcDose()`).
