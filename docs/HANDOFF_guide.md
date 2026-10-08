# HANDOFF guide (alex/od-supra), v88l BUILD GUIDE → next: Speed Champions car series
## v88l (this session)
- Code: src/98sb_build_guide.js (ORDER right after 98su_supra.js). Tag SB_. Test API window.__sb. SU_car now sets A.steps (booklet step starts).
- Watch: RIDES card ▶ GUIDE (data-sbg) or BUILD ⋯ MORE → BUILD GUIDE (data-r2a="sbg"). The gbLoop wrapper takes over the camera while SB.on.
  Steps come from SB_steps(bricks, template): explicit A.steps when the ride equals its template, else by layer y → z → x; split into 1–4 parts.
- BUILD IT (SB_diy): BUILD mode with B25 layer mode off, GB.d.bricks = earlier steps; ghost = the missing parts of the current step.
  GB_cand / GB_add / GB_act are wrapped (snap to the target; a tap within 70 px on screen places it). ✕ before the end restores SB.bak.
- Test: `node su/guide.js <url> su/guide` (real taps, 0 errors expected; prints the steps per template and car-vs-free-area boxes).
- OD_CHANGELOG v88l + 4 checklist items sb-*. Research and licences: docs/research/SUPRA.md (brick-viewer licence NOT verified → ideas only).
- Known: on cards ✎ BUILD and ▶ GUIDE are stacked (card is too narrow for both in one row). Reviewer polish from v88k is still open
  (dark sill under the doors, a visible windscreen frame, truncated card names).
## NEXT: car series (standing order: 2–3 cars per release)
- Companion sets first: 77252, 77256, 77261, 77262 (check booklets on lego.com; verify facts online, never present memory as fact).
- Pattern: generator like SU_car, with st() step markers so the guide plays booklet order. Add to GAR_SETS (tpl:1), RIDES row, changelog/checklist.
- Then make AI traffic + rivals use them (see 93_cars_lego.js LEGO traffic / CR_rivB).
- Release: merge CURRENT live → tools/build.sh vXX → QUICK review → DEPLOY message to the coordinator (never deploy.sh).
## Reviewer PASS c7cfa776 (2026-10-08); DEPLOY v88l sent to the coordinator. Fix with the next release (not blocking):
- (a) BUILD IT: preselect the step's part AND colour in the palette (strip still shows red defaults).
- (b) Guide parts panel is ~60 % empty: shrink it to its content (and let SB_area give the car the space).
- (c) Ghost taps sometimes need 2–3 taps in automation: add checklist item "BUILD IT: one tap on the green ghost places it"; if Alex fails it, widen the hit area (nearest stud ±1) / find why GB_act is not reached.
