# Worker 9 handoff (branch alex/od-w9, from alex/od-w8 + live v87f; 2026-10-07)

## Done: pART10 (v87g candidate), REVIEW sent to the reviewer at de443d8
- Only `src/97_art.js` (ART10 block at the end + the cloudsOn constants). Root causes:
  1. Pale lime grass + cyan facades = sky env sheen at grazing angles (grass rough .55, Kenney kits .55/metal .05). Now grass .95, kits .8 with metal 0 (`ART10_world`, run from the ART_hub wrapper).
  2. The env's lower half was sky blue (`ART.gnd`), so everything picked up blue from below. Now `[.24,.25,.27]`. (A green-grey value turned yellow traffic olive.)
  3. three.js r164 uses `scene.environmentIntensity` for any material WITHOUT its own envMap, so car envMapIntensity was ignored. `ART10_env(m,cap)` gives car paint `envMap=scene.environment` (resynced every 0.5 s; the PMREM texture changes per mood) and caps the intensity: traffic .6, CR_CM 1, player ≤1.2, glass 1.4. Authored value kept in m.userData.a10e. World env by day is .35 (`ART.hook`).
  4. Traffic glass used CR_WM (matte wheels). Now `ART10_glass()`.
  5. Clouds: L 13→24, 22→14 clouds, R 1200-1600, y 240-500, emissive #dce6fa .6.
- Not done: phone ('med') has NO shadow map; shadows are CR_SH plus contact blobs. A tight car-only shadow map would recompile every lit shader once and its iPhone cost can't be measured here. Desktop 'high' shadows: 2048 over ±110 m, normalBias .6 (soft).
- Facades still read cool: that's the Kenney atlas colours, not lighting.

## Gate numbers
- fps (fpsCmp median ms/frame, live → w9): park 981→964, hill 921→931, city 1003→1002.
- tPlay FAST: live FAIL 4, w9 FAIL 5 (extra = transient 10 px "2 goons" label on that route); stuck/walls/DRIFT failures are pre-existing.
- Tyre gap player 0.021/0.022, traffic 0.040. Boat −0.337 m. 0 console errors.

## If PASS and not yet shipped
`git fetch origin alex/brave-carson-rbpmlk`. Garage worker 4 may ship first; if live moved, re-split it or merge live into src/. `tools/verify_live.sh` must match live minus my 97_art.js diff.
Then prepend the next free version's OD_CHANGELOG entry (top of src/10_core.js), run `tools/build.sh <ver>`, `git add -f out/<ver>`, push, and send the coordinator "DEPLOY alex/od-w9 <commit> out/<ver> <msg>" plus 3 bullets plus docs/shots/v87g/ba_*.jpg.

## Tools
- `src/test/w9.js` (local builds only): `__w9.camera`, `__w9.ray(pts)` (pixel → mesh/material), `__w9.shotAt(...)` (composer-rendered custom camera), `__w9.side()` (real traffic model beside the player, low side shot + tyre gaps).
- `tools/fpsCmp.js`, `tools/dev.js`, `tools/a8/{zf,ap}.js` + strip.sh copied from alex/od-art.
- Garage shot: `document.querySelector('#gbMenuBtn').click()`.
