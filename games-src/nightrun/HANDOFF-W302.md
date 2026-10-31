# W302 flight look (branch nr/W302-flight-look from nr/W291-phone-flight), 31 Oct 2026. Not deployed.
Verdict: ONE OWNER per flight draw landed and is proven by in-render call counts; enemy shots now change when their owner changes (W291's
orb edit had hit a dead layer). Critic rows improved but NOT all >= 7 (enemies and silhouettes are art-limited). Clear-rate gates NOT measured
to the brief's 8 seeds: this 4-core box ran the gauntlet at ~100 s game time per 424 s wall with 4 pages (load 20+), see section 4.
Scratch (not committed): /tmp/w302 (shots, sheets, gauntlet logs).

## 1. Owners (full table: FLIGHT-DRAW-OWNERS.md)
Probe: `qa/w302-owners.js` (stage 1 through the boss, stepped, phone 390x763 + PC 1440x860, ~1290 frames each, 0 page errors) counts every
call made during `render()` into READ POL LIT LGB PCB DIET CALM COM BA PURL PB ART ... and drawEnemy / drawPlayer / drawHUD(P).
- Player ship + engine: `PURL.player` (pure.js). Enemies: `PURL.foe` (pure.js). Boss / gates: `PB.boss` / `PB.gate` (pureboss.js).
- Player shots: `PURL.shots` (pure.js). Enemy shots (orb, needle, shell, rocket, mine, homing): `PB.ebul` (pureboss.js) ONLY.
- Pickups: `PB.pickups`. Explosions / death clips: `ART.fxDraw` / `ART.ghosts`. HUD: `drawHUDP` / `drawHUD` (+ DIET, COM, CALM banner).
- In-render calls on both devices: READ 0, POL 0, LGB 0, LIT 0, PCB 0, BA 0, drawEnemy 0, drawPlayer 0.
- Why W291's orb edit did nothing: it changed `POL.EB`; the orb was painted by `PB.ebul` (amber `fx-bullet-shell`, 'lighter').
  W302 changed `PB.EBC` (amber -> pink) and the orbs in the shots are pink: the owner now controls the picture (qa/w302-bullets.js board).
## 2. Deleted (rule 18e)
- render/lit.js, render/pcbright.js, art/bulletart.js (+ bulletart-test.js, qa/pcbright-probe.js, their build/index/registry lines).
- Double draws merged: pure.js enemy-shot loop (dead: pureboss emptied G.eb around it) and `PURL.pickups` / `PURL.coin` (overridden);
  pureboss.js `PURL.shots` / `PURL.pickups` wrappers. `PURL.draw` now calls `PB.pickups` and `PB.ebul` directly.
- Kept (dead in the flight frame, still referenced by street/HUD/art): readable.js, polish.js, legible.js, cleanlook.js. Next task.
- Hash proof: NOT achievable as specified. Two loads of the SAME build differ at t=6 s (score 346 vs 560) with Math.random, clocks and rAF
  frozen in the probe: the sim is not reproducible across page loads. The deletion proof is 0 in-render calls + 0 errors through the boss.
## 3. Look changes (17h: dark outline, rim light, value lift; owner art underneath)
- Enemy shots (`PB.ebul/eshot/spr/ramp`): the owner's shot pictures gradient-mapped once to ONE reserved pink (`PB.EBC`, alpha from their
  own light, white-hot core), a dark ink outline, drawn source-over (not 'lighter', so they read over the bright city and explosions);
  phone floor ~12 css px; needles = the shell picture as a long bolt (the needle picture is too dark at game size).
- Player shots (`PURL.shots`): phone 1.4x size and thicker, fade starts at .55 W (was .4); still drawn under enemy shots.
- Player (`PURL.player`): value lift `PURL.SHIPF`, lit edge .9, larger engine light + hot core pass on phone.
- Enemies (`PURL.foe`): value lift `PURL.FOEF`, lit edge .6; phone size floor .68 of the player's length (art only, hitbox unchanged).
## 4. Critic and clear rates: see the tables appended below.
