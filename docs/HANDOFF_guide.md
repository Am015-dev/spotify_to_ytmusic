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
## v88q SPEED SERIES (this session, alex/od-supra on top of garux v88o 0560e1d4)
- 3 cars in src/98su_supra.js (SC_time 77256, SC_hyper 77261, SC_f1 77252), pushed into SU_T as fam 3 → RIDES row "🏆 SPEED SERIES", GAR_SETS, ▶ GUIDE steps.
- Traffic: HCAR += su:t_sc_tm, su:t_sc_hy (Athens ATH_K too). Rivals: SC_RIV for the 6 base teams via a CR_rivB wrapper.
- Guide: SB_pal (98sb) preselects the step's part + colour in the BUILD palette once per step. Checklist sb-pal + sb-onetap.
- OD_CHANGELOG v88q + 6 checklist items (sc-*, sb-*). Research: docs/research/SUPRA.md "v88q SPEED SERIES".
- Shots: su/gar_q (garage per car), su/drive_q (F1 drive, side tyres), su/guide_q, look-dev su/th/t_sc_*.
