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

## Findings 2026-10-08 16:20
- Harness: headless rAF stalls the loader with lowgfx flags → bc/enter.js installs tPlay's frame ticker (opt.tick:0 to disable, e.g. garage shots). With the ticker only ~0.25 sim steps/s
  at normal gfx, so BC's 36-step settle delay is reached only in real play; probes call `__bc.measure()` (immediate).
- First size measure must wait: CR_PS caches the body box from the first frames when stock ship parts are still visible (gave 2× size). BC re-measures 36 steps after a car change, then every 180.
- Measured (m, W×L×H, wheelbase): Hot Rod 1.93×4.43×1.44 / 2.45 (= BC.ref); Rosso 1.56×4.24×1.08; Bus 2.36×9.06×2.61 / 5.14; Truck 2.36×10.07×3.34 / 6.61; Limo 2.00×7.85×1.28 / 4.90; Monster 2.57×5.87×1.96 / 3.43.
- Bus hull: rad 1.41, off 3.41, CR_WB 5.67, acc ×0.64, top ×0.93, cam ×1.59 (chase back 8.97 vs 5.63). Normal cars: exact defaults (rad 1.15, off 1.35, WB 2.7, cam .72).

## GARAGE UX NEXT (problems hit / seen while making the big templates)
- Big templates are 100-150 parts: no way to select or hide a GROUP (e.g. "upper deck", "box body") to edit what is inside; you can only remove brick by brick.
- No show/hide per part type or per layer range; the B25 layers dim everything above, but inner bricks of a long bus stay hard to reach.
- The 5-tile part strip hides most parts (swipe needed); glass panes (new Window 1×4/1×2) and long bricks (B1x16 etc. exist only via templates) are not pickable as sizes: no length picker.
- Height is one plate per STEP ▲▼ tap; a 26-plate bus deck = 26 taps.
- 46-stud grid: the camera now backs off by build length (BC GB_cam), but tap targets on a far end get tiny on a phone; no "focus here"/zoom-to-part.
- Old pick needs a ray hit on a mesh: empty cells next to bodies often answer "No room"; 2-wide parts land offset from the finger.
- Low fps in the cloud makes taps long-presses (always use ?fast=1 for builder input tests).
- Reference to study: LEGO 2K Drive garage = big part categories with many tiles, part groups/"sub-builds" you can toggle, snapping by attachment points, free camera orbit with focus.

## FINAL 2026-10-08 17:35 UTC
- Reviewer PASS (99dcae1c). DEPLOY sent to the coordinator: out/v88i at 5892dc26 (on live v88h).
- Review fixes made: tall-vehicle chase cam (BC_tall: H>2.2 m → RCAM h ≥ roof+0.2+tan10°·(b+L/2)); garage shadow camera fits the car (BC_gsShadow).
- Optional polish (reviewer): truck sits low in frame under the boost bar; lower pitch ~3° if Alex says the vehicle feels "lost".

## Status 2026-10-08 17:15 UTC
- QUICK REVIEW sent to reviewer for 103a3687 (base live v88g / drive26; bigcars entries renamed v88i, v88h reserved for the P0 city fix). Waiting for PASS.
- Tyre gap 0.03 m (bus, truck, monster); 0 console errors. Garage RIDES view now zooms out for long builds (R2_frame wrap).
- Open follow-ups: truck chase cam (tall box hides road centre → raise camera height for tall vehicles, e.g. scale RCAM h/hk by rH more than b);
  PC + iframe runs; limo drive shot; garage preview in the cloud updates only after reopen (slow renderer; real devices not checked).
- Harness notes: bc/drive.js = t4/g11drive.js + __bc.measure() before shots. Don't use pkill -f with a pattern that is in your own command line (kills the shell).
- After PASS: merge live HEAD, pick next free letter (rename v88i if taken), tools/build.sh <ver>, git add -f out/<ver> (+ tune.json, music from live), DEPLOY message to coordinator.

## Next (old)
1. Read probe logs; check big=true for templates and big=false for rod/t_rosso; fix errors.
2. garshot (garage + build shots), g11drive per template (Frankfurt few s + side view + tyre gap ≤0.05), start/PC/iframe shots, 0 console errors. LOOK at shots.
3. REVIEW to session_01Y6FYerWwxv43FuKUcaUT4v. After PASS: merge live HEAD, rebuild, out/<ver> (+tune.json, music), DEPLOY msg to coordinator.
