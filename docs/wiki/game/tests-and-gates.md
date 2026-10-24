# Tests and gates
Rule: push only green (CLAUDE.md rules 3, 12, 16). No real-time play as a test.

## Layers
1. **Unit** (no browser, ~1.6 s, 4300+ asserts): `node tools/unit/run.js [filter]`; `--selftest` seeds 18 breaks. Files: `tools/unit/{lint_meta,lint_roads,lint_models,lint_scale,lint_tracks,logic_core,logic_chkgo}.js`, ratchet `known.json`. Readme: `tools/unit/README.md`.
2. **GO checklist** (state asserts in the page): `src/99c_checklist.js` (`OD_CHECKLIST`, `CK_*`) + `src/99c*_*.js` / `src/99c*.js` modules (e.g. `99c7_handling.js`, `99c5_camstable.js`, `99ctf_traffic_go.js`, `99ctl_traffic_law.js`, `99cl_loop.js`). Runner: `tools/tChkGo.js` (env `CITY`, `TAG`, `PHONE=1`, `THROTTLE=6`); both cities in parallel: `tools/tGo.sh <url> <out>`.
3. **Gate**: `tools/gate.sh <built-page-url> [outdir]` = phone profile, `TAG=why,life1,xf1,terrain` on fra + ath, one PASS/FAIL line. CI wrapper: `tools/ci.sh`. Live check: `tools/verify_live.sh`.
4. **Bots**: `tools/bughunt.js` (time-accelerated autoplayer, detectors, phone profile default, `--desktop` extra run); `src/99c8_bot.js` + `tools/tBot.js` (road-following playtest bot, reports [../../BOT_REPORT.md](../../BOT_REPORT.md), notes [../../BOT_NOTES.md](../../BOT_NOTES.md)); `tools/qa/` (monkey, inv, athhunt).
5. **Visual**: `node tools/shot.js <ID> <url>` ([shot-library.md](shot-library.md)), golden `tools/golden.js`.
6. **Fast test start**: `?test=fra|ath&car=..&at=x,z&go=<id>` (`src/98tq_test_quick.js`, `window.__tq`); test mode `src/99x_test_mode.js`; page API `window.__mho` (`src/99_api.js`).

## Invariants
- A GO has a pass line; no known-red list (rule 15): fix or delete within 1 day.
- Gate runs on the BUILT page, not hot. Phone profile = iPhone UA + 852x393 touch.
- iPhone truth: throttled 6x gate (perf/ios-reveal) or real reports ([render-and-perf.md](render-and-perf.md)).

## Known bugs
- Bughunt findings: [../../BUGHUNT_x1000.md](../../BUGHUNT_x1000.md), [../../HANDOFF_bughunt-phone-r22e24.md](../../HANDOFF_bughunt-phone-r22e24.md). Athens: [../../ATHENS_BUGS.md](../../ATHENS_BUGS.md).
