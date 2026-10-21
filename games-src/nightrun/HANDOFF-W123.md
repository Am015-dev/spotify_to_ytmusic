# HANDOFF W123 (menufix, 21 Oct 2026)
Done behind flag RET.menufix (default ON, ?menufix=0 = old): HANGAR 5 tabs + MORE sheet (parts/menufix.js), achievement toast slot top then bottom, waits if both are over a control (stats.js), no text diamonds in menus (stats badges, map chapter marker, home chip).
Tests: menufix-test.js 38/38; hub-test 147/147 (5 tabs behind MORE and PICK take 3 taps: HANGAR, MORE, item); tidy-test ALL PASS; guard.py ok.
ui-align-test: full run before the last fix had 30 findings, 4+ were garage-crew/looks/load/mkt only because the test clicked now-hidden tabs; the test now clicks them by DOM. NOT re-run (timeout): run `ui-align-test.js garage-tabs` alone.
NOT DONE: item 16 (S30 and S23). They are not in scripts/ui-audit.spec.js (that file is the unfinished 15-game audit); they live in nightrun/industry-audit.js: S30 = worst per-threat ratio parsed from counter-test.js lines ("without X, with the timed answer Y", ratio X/max(Y,1), noisy, one 24 s run each; last 0.67x), S23 = repeat-audit.js first-try clear (0.49, gate 0.55-0.90). Needs bot runs and tuning.
Toast waits in the hangar on 375x553 (no clear slot) and shows after leaving it.
