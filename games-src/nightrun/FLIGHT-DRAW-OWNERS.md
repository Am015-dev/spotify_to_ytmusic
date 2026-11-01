# Flight draw owners (W302, 31 Oct 2026; rule 18a: one owner per drawn thing)

Live flags: purelook ON (default since W215). `render()` in hud/c.js hands the whole flight frame to `PURL.draw` (render/pure.js).
Measured with `qa/w302-owners.js` (stage 1 through the boss, stepped, phone 390x763 and PC 1440x860, ~1290 frames each, 0 page errors):
every call made during `render()` into the render layers was counted. Change a colour or size in the owner below and the picture changes.

| drawn thing | ONE owner (file: function) | notes |
|---|---|---|
| backdrop (phone sky pan / PC tiled planes) | render/pure.js `PURL.bg` (`pan`, `tile`, `cover`, `dim`) | |
| pickups (power-ups, shards, hull) | render/pureboss.js `PB.pickups` | W302: the dead `PURL.pickups` / `PURL.coin` copies in pure.js are deleted; `PURL.draw` calls `PB.pickups` |
| enemy ships (every kind with a sheet) | render/pure.js `PURL.foe` -> `PURL.sheet` + `PURL.ink` | value lift `PURL.FOEF`, lit edge .6 (W302). Kinds without a sheet fall back to `drawEnemy` (old chain): 0 calls in stage 1 on both devices |
| boss | render/pureboss.js `PB.boss` (wraps `PURL.foe`) + `PB.shield`; boss bar `PB.bar` | |
| gate pylons | render/pureboss.js `PB.gate` | not in stage 1 |
| death clips (explosions of ships) | art `ART.ghosts` | |
| explosions / hit / muzzle fx | art `ART.fxDraw` (muzzle halved in `PURL.draw`) | |
| player shots | render/pure.js `PURL.shots` (weapon picture `fx-w-<id>-bullet`, else `fx-shot-std/hv/ec`) | drawn BEFORE enemy shots (under them) |
| enemy shots: orb, needle, shell, rocket, mine, homing | render/pureboss.js `PB.ebul` -> `PB.eshot` / `PB.spr` / `PB.ramp` | the ONLY owner. W302: reserved pink `PB.EBC`, dark ink outline, phone size floor. The second copy in `PURL.shots` (dead: pureboss emptied `G.eb` around it) is deleted |
| boss beams / aim lines | render/pureboss.js `PB.boss` (`fx-eb-aim-line`, `fx-eb-laser-sweep`) | |
| player ship + engine light | render/pure.js `PURL.player` -> `PURL.rim` -> `PURL.ink` | value lift `PURL.SHIPF`, lit edge .9, larger engine light on phone (W302) |
| EMP pulse | render/pure.js `PURL.draw` (`AH.pic('fx-pw-bomb-pulse')`) | |
| HUD | hud/c.js `drawHUDP` (phone) / `drawHUD` + `PW.hud` (PC); wrapped by `PB` fade; text floors `COM.minH`, lean HUD `DIET.*`, boss warning `CALM.draw` | HUD only, not the play field |

## Why W291's orb colour edit did nothing
W291 changed `POL.EB` (render/polish.js). Under purelook nothing in polish.js draws a shot: the orb was painted by `PB.ebul` with the owner's
amber `fx-bullet-shell` picture ('lighter'). Proof in W302: `PB.EBC` changed from amber to pink and the orbs in the shots are pink.

## Layers deleted in W302 (0 calls during render on phone and PC)
- render/lit.js (`LIT`: wrapped `drawEnemy` / `drawPlayer`, neither is called in the purelook frame), its kill-light listener only fed those draws.
- render/pcbright.js (`PCB`: patched `drawBG`, `READ.dim`, `DIET.DIM`; none is reached by `PURL.draw`).
- art/bulletart.js (`BA.own`: referenced by no other file), with bulletart-test.js and qa/pcbright-probe.js.
- pure.js enemy-shot loop + `PURL.pickups` + `PURL.coin`; pureboss.js `PURL.shots` / `PURL.pickups` wrappers (double draw merged into the owner).

## Dead in the flight frame but NOT deleted yet (next task)
readable.js (`READ`), polish.js (`POL`), legible.js (`LGB`), cleanlook.js: 0 calls in the purelook frame, but their globals are read by
street, HUD and art files (READ: c.js, fx.js, foot.js, streetlook.js, zoo.js, counter.js, legend.js; LGB: bg.js, draw.js, art.js, foeart.js;
polish.js wraps `render`, `ART.pic`, `SPR.ship`, `RIG.draw`). Deleting them is a cross-file job (street is W300's).
Proof limit: a before/after frame hash across builds is NOT reproducible (two loads of the SAME build differ at t=6 s with Math.random, clocks
and rAF frozen: the sim diverges, score 346 vs 560). The deletion proof is the in-render call count (0) plus 0 page errors through the boss.
