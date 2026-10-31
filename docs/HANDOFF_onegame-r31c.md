# HANDOFF onegame-r31c (design, docs only)
1. Deliverable: docs/DESIGN_one_game.md (audit, flow, target core + thin modes, 6 lanes S1-S6 with GO + numbers, risks); shots + recipe in docs/shots/onegame/.
2. Top splits: the builder is a whole own game (scene/sky/lights/render bypassing composer, BX_step physics, BX_camDrive, BX_hud, BX_input, raw 'bx_tracks' save, 0 XP); 3 physics models (top 146/220/122 km/h for the same car); Race Mode lives in a separate neon world, 5 taps + 7.9 s away from the city.
3. First step: S1 "the builder drives YOUR car": makeShip+garage loadout, roam stats, RCAM/SKC camera, shared #touch/ctlPlayer; flag og1; GO onegame/builder-car.
4. Page is 3,449,841 B (50 KB headroom): every lane must delete builder copies to pay for new code.
5. Shot probe needs window.__og injected into the built page locally (see docs/shots/onegame/shots.js header); never ship it.
