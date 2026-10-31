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
## 4. Strict critic pass (game-look), shots LOOKED at
Shots: qa/w302-owners.js HASH=1 SHOTS=<dir> AT=13,22,37,48,59,71,88,101,118,128 (8 stepped moments + 2 boss moments; the W291 shot script
stops at ~61 s because the real-time loop keeps running beside the stepped sim, so it never reached the boss). Phone 10/10 looked at in colour
and grayscale; PC 6 of 10 looked at. Bullet board: qa/w302-bullets.js (every enemy shot kind next to the ship, phone + PC).
| row (minimum over moments) | before (W291) | after phone | after PC |
|---|---|---|---|
| owner-art | 7 | 7 | 7 |
| grayscale | 5 | 5 (small foes in m2/m3 still sink into the city; shots and ship pass) | 6 |
| silhouette | 5 | 5 (all small foes one helicopter shape: art) | 6 |
| bullets | 5 | 7 (pink + dark ring, >= 11 px; boss small shots paler) | 7 |
| find-player | 6 | 7 (brightest thing at the bottom, engine light) | 6 (violet ship on a violet skyline) |
| clutter | 7 | 7 | 7 |
| benchmark | 4 | 5 | 5 |
NOT all >= 7. Left: grayscale/silhouette of small foes (needs wider, lighter enemy sheets: ART list; code already lifts value 2x on the
last build, not yet seen in a shot), PC find-player (ship hue = skyline hue: a cool-white rim for the player on PC is the next step), benchmark.
The last change (foe value lift 2.0 + phone foe size floor .68) was built and run through the boss on phone (0 errors); its 2 shots had no
small foe on screen, so it is NOT judged yet.
## 5. Dodger gap (4 seeds, not 8: the box ran ~100 s of game time per 424 s of wall with 4 pages, load 20+)
| run | result |
|---|---|
| phone dodger, W302 build, dash on (W291 config) | killed: every run hit the 424 s wall cap at ~100 s game time (unusable) |
| phone dodger, NODASH=1, pull 520 | 1/4 cleared (s3, 0 game overs, boss killed); s1/s2/s4 2-3 game overs, then wall cap |
| PKEY (phone UA + portrait rotMode, keyboard input) dodger | 4/4 cleared the stage + killed the boss (s4 0 game overs; s1-s3 after 1 game over), 0 errors: SAME portrait geometry, keys = fine |
| pull cap 300 (GAME_DIR copy with 520 -> 300) | not run (time) |
| PC dodger / phone shooter 8 seeds | not run (time) |
Lead (harness, not game): on phone the dodger dashes by tapping #bDash with a second finger; qa/gauntlet-flight.js I.tap then sends a CDP
touchEnd that lists the steering finger. CDP's rule is that touchEnd carries no points (it ends the touch sequence), so the steering finger is
probably lifted on every dash tap and the ship stops following until the next touchMove re-presses it. W291's 0/8 had dash on; NODASH gave 1/4.
Fix to try first (bot side): release the tap finger with a touchMove that lists only the steering finger, not touchEnd. Then re-run 8 seeds.
Conclusion: the gap is the TOUCH INPUT PATH (harness finger and/or the game's 520 u/s finger pull), not the rotMode geometry (boss x, spawn
lead, ebCap): keys in the same portrait field clear 4/4, touch clears 1/4. Not split further (pull cap 300 untested). No game change made.
## 6. Not done / checks
- Phone fps probe (benchmark/playability-probe.js, 3 alternating runs) NOT run (time); visible-test / w227probe NOT run.
- Checks run: qa/w302-owners.js phone + PC through the boss, 0 page errors; qa/w302-bullets.js phone + PC, 0 errors; flake8 E9/F63/F7/F82 = 0.
- Gauntlet changes: DEV `pkey` (phone UA + portrait, keyboard) in qa/gauntlet-flight.js.
## 7. Next (one task each)
1. (sonnet) Harness: dash/EMP tap releases with touchMove [steering finger] instead of touchEnd; re-run phone dodger/shooter 8 seeds, PC dodger 8
   seeds, on a quieter box or PAR=2 with WALL >= 900. If the phone still trails pkey: try the game's touch pull 520 -> 300 (core/b.js line ~329).
2. (opus) PC find-player: cool-white rim on the player only (PURL.player lit colour), then the strict critic pass on both devices.
3. (sonnet) Delete readable.js / polish.js / legible.js / cleanlook.js: move the few globals the street/HUD read into their owners first.
