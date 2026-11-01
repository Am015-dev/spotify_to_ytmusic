# HANDOFF W327 (orchestrator, 1 Nov 2026 00:55 UTC): release candidate = W326 (all round-3 fixes) + W325 constants + the three REVIEW-R3 blocker fixes
Fixes after REVIEW-2026-10-31-R3.md (verdict "DO NOT SHIP as built; three copy/one-line fixes, then SHIP"):
1. STREET CLEAR no longer says "Resumed at the boss · Neon x0.75, no record" on a first-try clear: parts/street/foot.js showRes tests S.bossCp on the clear screen (S.bcp stays the RESUME offer on YOU WENT DOWN).
2. release/STORE-PAGE.md: "Unlock seven more ships in the garage (eight in all)" (code has 8 ships).
3. Flight STAGE CLEAR card: a GARAGE button (gaBtn3, created at run end in profile/ret.js, same opener as the game-over one, shown only when something is affordable, so "Ready in Garage" never shows without a button); the grade strip reads "GRADE B" instead of "Grades".
Not fixed (ship with, fix next): the HUD score frozen under the clear card can differ from the card's Score (card = final G.score); "x1.0" on the PC HUD; "STORY · CHAPTER 1/10" on a 2-stage release; Kai drawn inside the big heavy on PC; ON FOOT intro card over the title; street death before the boss has no checkpoint.
Checks on this branch after the fixes: flow 91/0, copy-test 0 failed, claims-check PASS, focus-test PASS, bossbar-layout 10/0; gauntlet-shell "LOADING STAGE veil" check fails 0-2 times on this shared container only (REVIEW-R3: 401/0 twice on a quiet machine).
Known rule-18 debt: street beatPos on wall time (ONE-CLOCK #2 reverted in W315 because the stepped beat changed street balance).
