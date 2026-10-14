# HANDOFF shots-1 → next worker (2026-10-14)

Task: Alex's beta.59 shots (`git show origin/alex/overdrive-devkit:docs/shots/alex/b59/<f>`), order 5, 4, 3, 1, 2. Trunk `alex/od-int2`.
Coordinator = session_017iH3DB4VyxwKSdMwsco4Ut (message only on DONE/HANDOFF). Never ask Alex.

## Done
- **#5 green fog world (DONE, pushed c5e08a8c).** Mesh: terr-5 Taunus backdrop ridge `HUB.ridge` (`TRN_fraRidge`, the vertical teal bands are its
  1.5° segments ×0.93). Root cause: every cutscene sets `RO.frozen`; the loop (`90_fixes_cv_ju.js` `if(!RO.frozen)roamStep(dt)`) then skips
  `hubTrafficStep` = ridge fit + `hubCullStep` + `lazyStep`. M1's Kaiser scene frames Hilde's truck, which keeps driving (6 m/s) when you fall
  behind → scene camera up to 2 km from the car: ridge wall in the sky, blocks culled, outskirts unloaded (grey lots).
  Fix `src/98sh_shots1.js` (`SH1_follow`, wraps `roamCam`; `?sh1=0` = off): while frozen, ridge + cull + lazyStep follow the camera (LZ budget 9 ms).
  GO `sh1/cut-world` (rv:2026-10-14): before FAIL ridge 2126 m off / 5 % blocks drawn / outskirts 0/2 → after PASS 0 m / 100 % / 2/2.
  Shot `qa_sh1/5_cut_world_before_after.png`. `tools/tSh1.js` = before/after runner. Gate: unit 0 FAIL, TAG=life1,xf1,terrain,sh1 36/37
  (life1/ath-density only "SLOW 11.1 s > 10 s" while another probe ran), 0 errors.

## Identified, not fixed yet
- **#3 bubble = life-1 pop-up bubble** (`src/assets/lx/code.js` line ~90/112/250: instanced `M.pop` IcosahedronGeometry(1.4) + `M.ring`
  TorusGeometry(2.6), emissive white, opacity .82, 3.2 m over the lane; raycast hit "TorusGeometry inst1 op0.82 userData keep,st").
  It also floats 40 m ahead at the Hot Drop start (`/tmp` probe shot). Proposed fix: don't draw pop bubbles (and kickers? no, keep kickers)
  while on foot (`RO.foot&&RO.foot!=='car'`) or while a mission/challenge runs (`RO.ch`), and fade them when the camera is < 15 m.
  Code is packed by `tools/lx/pack.sh` (life worker's area) — prefer a wrapper from 98sh_shots1.js if `__life.LIFE` exposes the pools.
  Test idea: GO = on foot at the Hot Drop start; assert 0 pop/ring instances drawn within 60 m.
  The "exploded tree with dark brown shard leaves" is NOT identified yet (same trees visible top-left at the Hot Drop start, Messe area):
  raycast it (screen ~ (470,150) of an 852×393 shot at the drop, heading -π/2) and name the model (98ld_w / 98as / ART brick trees).
- **#4 white road**: NOT reproduced. Ruled out with probes: sun specular (GFX_sunFollow keeps the sun behind the camera), env PMREM rebake
  with the sun glow ahead (no change), `shipKey` PointLight (70, decay 2, 40 m; it is left on in roam at the last race spot but too weak),
  FX / GFX_GRADE passes (no radial term). Clue from the shot: the car is NOT washed but road + far buildings behind it are → something
  translucent drawn just in front of the car, depth-tested (car closer). Shots 1 and 4 are both at 0 km/h → suspect tyre smoke/dust
  (SMOKE pool) from wheelspin with touch gas default on while stuck, or a LIFE pop bubble in front of the car. Next: Hot Drop start,
  hold gas against a wall for 5 s on `q=med`, shot + list visible SMOKE/LIFE instances within 15 m of the car.
  **Tan dotted wall** = a very large building block with a window-grid facade tiled tiny. Candidates near the Messe (scene query, centre x,z
  size, height, map uuid4): `790,700 95×60 h35 map5b7f`, `1007,343 70×60 h24 map5b7f`, `2193,151 186×147 h172 map5b7f`, a single
  `PlaneGeometry 80×160 h42 at 1260,-400 map2962`. Render each from 150 m to find the tan one, then name its builder.
- **#1**: sinking → shot sent to sink-1 (session_016byV5EiKkz43mnCWurWs28). Leaves = spiky dark leaf plants (unidentified; likely the
  same family as the #3 shard trees / LF green-field fill). Haze = same unknown as #4.
- **#2 race**: builder race 6/6, 0 km/h, CP 0/1 at 19 s, facing a yellow/black hazard stripe at a deck crest (trk-4 open tracks merged in
  beta.59: 24 m decks, kicker lips 1.5 m, new race GAS/BOOST/PAUSE buttons). `BX_input` (98b2_builder2.js:427): gas = `(kb||BX.touch)&&!brk`,
  `BX.touch` = `(pointer:coarse)`; touch buttons set `BX.tc`. Not reproduced yet: check stuck-on-deck-seam (`V.stuck`) and whether a held
  BRAKE/`bxB` (or `BX.tc.b` stuck after touchend outside the button) zeroes gas.

## How to probe fast
`window.__dbg=1` (addInitScript) then `__oc.ev("<js>")` evaluates in the game's module scope (RO, M1, scene, camera, LIFE is NOT in scope: use
`__life.LIFE`). `?test=fra` auto-skips cutscenes: to keep one, override `document.querySelector('#m1Cs').click=()=>{}`, `__m1.skip=()=>{}`, `M1.csHold=1`.
`q=high` screenshots time out in swiftshader; use `q=med`. Server: `cd out/shots1 && python3 -m http.server 8812` (don't `pkill -f http.server`
from your own shell).
