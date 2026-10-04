# SP · 2-player split-screen

## What changed
- **Quick Play → "2 PLAYERS"** button next to START (hidden below 700 px via media query). Setup screen: mode (RACE / SMASH BATTLE), circuit list (all Frankfurt circuits + Athens if unlocked), AI-fill toggle, key cards for both players, gamepad status.
- **Controls** (while split-screen runs): P1 = W A S D, Space (weapon / hop), L-Shift boost, Q / E airbrake (drift in roam). P2 = arrow keys, Enter, R-Shift, `,` / `.`. P2 keys are captured before the game's own handlers. **Gamepads** (Gamepad API, auto-assigned): 1 pad → P2, 2 pads → P1 + P2.
- **Race**: P2 is a real ship driven by the game's `physPlayer` with P2 input; it sits next to P1 on the grid. AI fill on = 6 AI rivals, off = head to head. Traffic is halved. Results wait for both players (90 s grace after P1 finishes).
- **Smash Battle** (Frankfurt only, 3:00): free roam; P2 gets its own roam car (compact physics using the game's terrain, building and ground queries; posed and filmed by the game's `roamPose` / `roamCam` with P2 state swapped in). Scoring: prop 1 pt, traffic car 3 pts, takedown (ram the other player while boosting or ≥ 4 m/s faster) 10 pts. Half of the hub traffic is parked; mission beacons and pop-up challenges are muted.
- **Rendering**: one scene, two scissored viewports (side by side in landscape, stacked in portrait), one camera per player. Composer targets are sized per viewport, bloom targets at half that size, and the shadow map is halved and rendered once per frame (view 2 reuses it). Dynamic resolution is forced on (starts at 0.85). Each player has their own HUD (speed, position, lap, boost bar; battle: points, smashes / takedowns, shared timer), plus P1 / P2 tags above the cars.
- **Results** for both players, with REMATCH and MENU buttons. Single-player is unchanged: every wrapper passes straight through while `SP_S.on` is false.

## Patch order
`./reapply.sh pSP1.py`: a single anchor (`window.__mho={`) inserts `sp.js`. See ANCHORS.md for the wrapped functions.
Page size: 3.38 MB.

## Tests
- `node tSP.js` (real keyboard via Playwright, mocked `navigator.getGamepads`): **ALL PASS, 24/24** (menu entry + phone hiding, setup key cards, simultaneous independent keys in race and battle, boost-key separation, 1- and 2-pad assignment, full 3-lap race with AI fill where both finish and are placed, both-player results + rematch, per-player battle scoring for props, traffic and takedowns, 3:00 timer → results → rematch reset, back to a plain single-player race, zero console errors)
- Perf (draw calls, same frame): race split / single = 453 → 720 (**1.59×**); battle = 861 → 1305 (**1.52×**) (limit 1.9×).
- `node smoke.js .`: **SMOKE PASS** (12/12, 586 s, zero console errors). `smoke/sheet.png` checked: the single-player layout is unchanged.
- Screenshots: `shots/sp_race.jpg`, `shots/sp_battle.jpg`, `shots/sp_race_results.jpg`, `shots/sp_battle_results.jpg`, `shots/sp_setup.jpg`.

## Known gaps
- Race takedowns are one-sided: the game only scores contact where `isPlayer` is set, so P1 can take P2 out but P2 cannot take P1 out.
- P2 has no item-spin animation and doesn't earn style boost from `award()` (AI path); it gets a small passive boost refill instead.
- In battle, studs from P2's smashes fly to P1, and P2's car uses a simplified version of the roam physics (no boats, vehicle switch or mini-turbo tiers).
- Frame time was not measured on real hardware (software WebGL here); draw-call counts are the proxy.
