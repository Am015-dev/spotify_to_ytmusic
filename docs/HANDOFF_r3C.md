# HANDOFF r3C (race HUD, review #3 rows 4, 5, 7 + result-panel bugs)
- Race pop-ups: level-up card queues while any city race runs (RO.sp) and while #spRes shows (comes after CONTINUE); district plate hidden in a race; roamOpen is a no-op during a race.
- Finish: RO.fin (set with the result panel) makes roamStep treat the car as `busy` (fast decay): <= 10 km/h in ~0.7 s, gas held; cleared by CONTINUE/RACE AGAIN.
- HUD: v85 hid #raceW after its 5 s brief (that is why no place showed); body.spOn keeps it up for the whole race. New gap pill (+x.x s / -x m, nearest rival, sp.gapM/gapN via RV3_gap), checkpoint label 12 px, portrait drops the checkpoint pill to fit.
- Result panel: STORY/arrow pills hidden while it shows (body.spShow); rival not yet home shows a projected time with "~" instead of "—".
- GOs rv2k3/racepop|finish|pos live in src/99c3_rv3c.js (lazy chunk; 99c_checklist.js is at its 200 KB cap, tChkGo verdict bug "PASS with a ❌ line" still open: read the ❌ yourself).
