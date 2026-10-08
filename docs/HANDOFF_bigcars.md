# HANDOFF bigcars (alex/od-bigcars, PR #69 draft → base alex/od-drive24)

## State (2026-10-08 15:25 UTC)
- Branch = drive24 (v88f, incl. build25 layers + 99c checklist) + bigcars commits. v88g OD_CHANGELOG entry + 6 checklist items (99c) already added.
- Code:
  - 92: `GB_Z0/GB_Z1` = -23..22 (length, 46 studs), width unchanged `GB_N0/N1` -9..8; `GB_MAX` 250, `GB_CAP` 72. z-bound sites switched in 92, 98b (why/clamp/grid lines), 98r, 98t (3 sites). 94:4 stock-hull scan still uses N for z (stock hull only).
  - 93: `let CR_WB` (+ `CR_PLH` NPC push half sizes); 90: `let OB_HW/OB_HL`.
  - NEW `src/98bc_bigcars.js` (ORDER before 99c/99_api): glass part `G<w>x<d>[h<n>]`, balloon tyre `wMT` (orange rims), templates t_bus (60407), t_truck (60440), t_limo (60102), t_mt (60180) pushed to GAR_SETS (forms car);
    size→driving: `BC_upd` each roamStep measures body+wheels (BC_dims) vs Hot Rod parts (BC_refM); big = L>1.12× or W>1.12× or H>1.25× → SC_K.rad/off, extra SC_hit circles,
    CR_WB × wheelbase ratio, OB_HW/HL, CR_PLH, acc × m^-.3, top × m^-.05, cam × ratio^.65 (SC_rcam, CR_minBack); not big → exact defaults. Garage GB_cam backs off by build extent. Test API `window.__bc` (dims, hull, n(id)).
  - Research: docs/research/BIGCARS.md (set numbers + URLs).
- Coordinator orders: NO play tests / long drive runs (Alex validates via checklist). Only function checks: template loads, car moves, tyre gap. 3 templates enough (limo is extra, keep if it looks right).
- NOT YET RUN IN BROWSER. bc/probe.js (API enterRoam, lowgfx min) was running: logs bc/probe_rod.log, bc/probe_bus.log.

## Test tools (bc/)
- enter.js: launch with tools/lowgfx.js (GFX=min default), opt.seed = localStorage seed (e.g. mho_gar sel), roam() real taps, roamApi() via __mho.enterRoam.
- probe.js <url> [tpl]: dims/hull numbers. garshot.js <url> <out>: real taps RIDES → card → shot, BUILD → shot (GFX normal). walls.js: wall hits/min (not to be run now, no play tests).
- Review drive shots: `TPL=t_bus SEC=8 SIDE=1 node t4/g11drive.js http://127.0.0.1:8766/local_dbg.html bc/drive_bus` (tyre gap logged as tyre_rest).

## Next
1. Read probe logs; check big=true for templates and big=false for rod/t_rosso; fix errors.
2. garshot (garage + build shots), g11drive per template (Frankfurt few s + side view + tyre gap ≤0.05), start/PC/iframe shots, 0 console errors. LOOK at shots.
3. REVIEW to session_01Y6FYerWwxv43FuKUcaUT4v. After PASS: merge live HEAD, rebuild, out/<ver> (+tune.json, music), DEPLOY msg to coordinator.
