# Worker 8 handoff (branch alex/od-w8, from alex/od-src; 2026-10-07)

## Done
- STEP 1: src/ re-split from live v87e (30b9ee3), verify_live LIVE_MATCH, pushed alex/od-src 70da63c.
- STEP 2 = v87f (reviewer: SUV/GAS/3 boats PASS; Ebbelwoi shot re-sent as a13066c after the camera-under-water FAIL):
  - `src/93_cars_lego.js` `CR_suv()` new traffic SUV (case 'suv' in CR_cityGeo; suv removed from the CR_cab list).
  - `src/97_art.js` `W8_boatY()` (called from the ART4 roamPose wrapper in boat mode): hull bottom = local wave surface (waveH at T, times boatK, + small bob) - 0.22 m,
    through the live transform chain (box cached in the boat group's own space, key = group uuid + vertex count). Root cause: boat mode kept the car's ride-height offset in ud.m.position.y.
  - `src/00_page.html` `#tG.down` lit (solid mint, dark text). The old "dimmed" GAS = pressed state at 35 % alpha.
- If v87f is not yet shipped when you read this: on PASS → `git fetch origin alex/brave-carson-rbpmlk`, `tools/verify_live.sh` must still match v87e (else merge live into src first),
  prepend the v87f OD_CHANGELOG entry (top of src/10_core.js), `tools/build.sh v87f`, `git add -f out/v87f`, push, send the coordinator "DEPLOY alex/od-w8 <commit> out/v87f <msg>" + 3 bullets + shot paths (docs/shots/v87f/).

## Tools (this branch)
- `src/test/w8.js` (local builds only): `__w8.shot(kind,col,camAng,dist,h)` renders a CR_cityGeo traffic model next to the player → PNG; `__w8.boat()/boatRun(spot)/sel(set)/cam()/dbg()`.
- `tools/w8v.js <url> <out> fra '<[[name,expr],...]>'` boots to roam, evals each expr, saves PNGs. Env TOUCH=1 (phone touch), BOOT=skip (`__m1.skip()+enterRoam`, skips the slow parachute intro).
  An expr returning `{hold:'#tG'}` holds a real CDP touch and shoots held + released; `{page:1}` = page screenshot.
- `tools/w8boat.js <url> <out> [sets]` = per garage set: boat waterline gap + side/3-4 shots at the Frankfurt boat spot (-417.9,-226.9).
- Server: `python3 -m http.server 8766` in the repo root; `tools/build.sh w8 --local` → local_dbg.html. Software GL: ~2-3 min per boot.
- Water shader time `HUB.waterU` only advances in hubFrame; under `__ju.step` use T.

## STEP 3 (pART10) not started: notes
Current day light (97_art.js ART_light): hemi sky #e6edfb / ground #7d9852 at 1.0, sun (moonL) #fff3e0 3.1, NeutralToneMapping exp 1.0, env .55, fog rgb(.7,.84,1).
City bloom threshold 1.0 (ART9, races 1.5). Facades read cool/blue in phone shots (v87f 06_gas_pressed.png). Ideas: warmer sun (#ffe6c0), lower flat hemi fill (.8) for contrast,
less blue fog, slight saturation/contrast grade, gentle highlight bloom. Gate: full review (start, Frankfurt drive, Athens drive, low side) + tPlay FAST=1 on the split build, fps ≥ live (tools/fpsCmp.js lives on alex/od-art).
Before/after side-by-side shots in both cities go to the coordinator first.
