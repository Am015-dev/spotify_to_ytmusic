# W214: `?pure=1`, the owner's art drawn as it is (flight, stage 1)

Flag `RET.purelook` (default OFF, `?pure=1` turns it on). The flag has its own name because `RET.pure` is already the music flag in
`audio/puremusic.js` (default ON). `?pure=1` does not change that flag; only `?pure=0` does.
Code: `parts/render/pure.js` (new), a one-line hand-off at the top of `render()` in `parts/hud/c.js:124`, the DPR line in
`parts/core/b.js:25`, and one line in `parts/build.py`.

Shots: stage 1, seed 7, stepped 59 s with the same scripted path, then one `render()` call with dt 0 (sim mode). The phone pair is the
same moment. The PC pair is the same second, but the enemy bullet count differs by a few (22 vs 25) because a stepped run is not fully
deterministic.
- `phone-pure-off.webp` / `phone-pure-on.webp` (390x763)
- `pc-pure-off.webp` / `pc-pure-on.webp` (1440x860)

## Inventory: what the flight renderer adds on top of the owner's pictures, and what `?pure=1` does with it

Line numbers are on this branch (parts/...).

| What | Where | With `?pure=1` |
|---|---|---|
| Scanlines (1 px black line every 3 px) + vignette, as one full-screen image | render/bg.js:23 `scanFor`, drawn at hud/c.js:164 / 167 | off |
| Black veil baked into the backdrop (dim .52 PC / .5 phone, clamped to .15 by cleanlook) | art/art.js:81 `ART.bgOf`, render/cleanlook.js:9-11 | off: raw `bg-<district>` |
| Neon ground haze baked into the backdrop and the mid strip (district colour, alpha .22) | art/art.js:85 and :89 `ART.midHaze` | off |
| Far / mid / near layers at alpha .75 / .88 / .92 | art/art.js:83, :100-105 `ART.paintBG` | full strength, same parallax |
| Black veil after the backdrop (DIET.DIM) | render/diet.js:60 | off |
| Desaturation + dim band over the backdrop (READ.SAT, LGB.DIM, LGB.BAND) | render/readable.js:19 `READ.dim`, render/legible.js `band` | off |
| PC 'screen' lift over the backdrop | render/pcbright.js:9 | off |
| Per-stage colour wash (alpha .13 hsl fill) | waves/stagescripts.js:176 | off |
| Colour grade (soft-light district neon over field and sprites) | render/lit.js:37 `grade` | off |
| Rim light, contact shadow, depth haze, light pools, streaks per ship | render/lit.js:22 `under`, :25 `over`, :33 `lights`, :39-41 hooks | off |
| Tinted enemy sheets (canvas filter hue / saturate / brightness, built once) | art/foeart.js:55 `FOEART.sheet` | off: untinted sheet |
| Hull brightening for dark sheets (LGB.BR) | art/foeart.js:52, render/legible.js:42 | off |
| Additive hit flash (the sprite redrawn white over itself) | art/foeart.js:64 | off |
| Arming glow + closing ring before a shot (telegraph) | render/draw.js:53-54 | off |
| Elite ring | render/draw.js:55 | off |
| Readability layers on enemies (discs, halos), calm/comfort/diet hooks | render/legible.js, comfort.js, calm.js, diet.js (`drawEnemy` hooks) | off for every enemy with a sheet |
| Variant marks (hue pips) | hud/c.js:132 `VAR.mark` | off |
| Glow sprites everywhere (`G_`, additive radial glow) | core/a.js:34 | not called by pure.js |
| Ship engine glow, halo, tier glow, white centre dot | render/draw.js:36-39 | off |
| Player overlays (polish / readable / diet hooks, mounts, shield ring, `AH.player`) | render/polish.js, readable.js, diet.js, draw.js `mount` | off |
| Pickup glow behind every pickup | render/draw.js:131 | off (the painted pickup stays) |
| Player shots: tinted copy at alpha .55, plus glow | hud/c.js:116 `shotDraw`, :136-137 | owner shot / weapon bullet picture, alpha 1 |
| Enemy bullets: glow, dark ring, flat discs, core, pink hue turn of the painted orb, white needle core line | hud/c.js:141, render/readable.js:29-40, render/legible.js `halo` | owner orb / needle / rocket / shell / homing picture only |
| Particle squares (fillRect) | hud/c.js:139 | off |
| Hit rings (code arcs) | hud/c.js:150 | off |
| Floating score / label text in the play field ("BOLD x2", "+120") | hud/c.js:151 | off |
| Boss hazards and their telegraph lines | hud/c.js:145 `BMV.draw` / `BPL.draw` | off |
| Abilities, counters, timers drawn in the field | hud/c.js:148 | off |
| Beat ring around the ship | hud/c.js:147 `FXV.ring` | off |
| Screen-edge pulse | hud/c.js:165 / 167 `FXV.edges` | off |
| EMP: code arc fallback | hud/c.js:155 | off (owner `fx-pw-bomb-pulse` only) |
| Full-screen white flash, glitch slices + red fill | hud/c.js:157-158 | off |
| Tier glow (additive full-screen colour) | hud/c.js:159 | off |
| Backing store capped at 1.5x (Medium) and a 2.1 MP budget, then lowered by lagfix (RSC.k): the browser scales the canvas up | core/b.js:8-9, :25 | full device pixel ratio (max 3), no budget, no RSC |
| Image smoothing quality left at the default (low) on the play canvases | (never set on vctx / wctx) | `high` on both every frame |
| Sprite sizes: each kind its own size (k x hit radius), texel density differs up to ~2x | art/foeart.js ENEMY_ART | one scale, PURE.K = 90/520 world px per sheet px, clamped 0.8-1.25x; player 1.1x |
| `flylook` caches | not on this branch (only on rejected branches) | - |

Still drawn the old way with `?pure=1`: bosses and gate pylons (no single sheet path in pure.js yet, they fall back to the full
`drawEnemy` chain), power-up pickups (`PW.pickup`), death clips and fx sheets (`ART.ghosts`, `ART.fxDraw`; these are owner sheets,
added with 'lighter' as before), and the HUD (`drawHUD` / `drawHUDP`, `PW.hud`). The shot and bullet pictures are painted on black
(no alpha), so pure.js adds them with 'lighter', like the fx sheets; drawn normally they would be black boxes.

Gameplay: unchanged. The sim never calls `render()`. simhunt stage 1, 3 seeds x human + parked bot, off vs on: the same kinds
(HUD-band intrusions; empty stretches over 5 s in both: off max 6.9 s, on max 7.4 s). The only kind that goes away with pure on is
text overlap, because the play field has no text.

## Does the art blend now? (honest)

Much better on the backdrop. The painted city shows at full colour and detail, with no lines, no purple veil and no grey discs, and
the bronze enemy ships sit in it as part of the picture. It is not finished:
- the player ship is a thin blue dart on a blue-purple city: readable on PC, hard to find on the phone;
- player shots are faint (the shot pictures are thin and dim at game size), so the player's own fire hardly reads;
- the lime enemy orbs are the most saturated thing on screen: readable, but they look laid on top of the painting;
- bosses still use the old draw with all its layers.
Rows (owner baseline < 10, so the cap is 25): SHIPS 20, BULLETS 15, ENVIRONMENT 25, FEEL not judged from a still.
The owner decides from the two pairs.
