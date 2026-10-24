# Engine lessons from open-source code (W222, 24 Oct 2026)

Owner, 24 Oct 20:20: "the assets I gave you are flawless and you turned the game into shit; look up open-source games of the same
style and also open-source WebGL to understand the logic." Docs only. Gates: one phone + one PC shot or a `?scn=` probe (rule 17).

Sources read (shallow clones, licence file checked in each):
- **OpenBOR** (beat-'em-up engine, BSD 3-clause, `LICENSE`): `engine/openbor.c`, `engine/openbor.h`.
- **Taisei** (vertical bullet-curtain shooter, MIT, `COPYING.txt`): `src/projectile.c`, `src/move.h`, `src/move.c`,
  `src/drawlayers.inc.h`, `src/stages/stage1/timeline.c`, `src/stages/stage1/draw.c`,
  `resources/00-taisei.pkgdir/shader/sprite_bullet.frag.glsl`.
- **PixiJS** 8.22.0 (MIT, `LICENSE`): `src/rendering/batcher/shared/Batcher.ts`, `src/rendering/renderers/shared/state/State.ts`,
  `const.ts`, `src/scene/sprite/Sprite.ts`, `src/filters/defaults/color-matrix`.
- **Phaser** 4.2.1 source (MIT, `LICENSE.md`; sizes from the 3.90.0 npm build): `src/core/Config.js`,
  `src/renderer/webgl/shaders/DefineLights-glsl.js`, `ApplyLighting-glsl.js`, `src/gameobjects/lights/LightsManager.js`.

Ours: `games-src/nightrun/parts/render/pure.js` (flight), `street/purefoot.js`, `street/streetlook.js`, `street/foot.js`,
`street/footart.js`, `street/streetfeel.js`, `street/streetmelee.js`, `art/art.js`.
The short version: the engines are not prettier because of WebGL. They are prettier because of a few compositing rules we
break: bullets keep a dark rim and are drawn with normal (premultiplied) blending, not pure additive; every plane moves on a
smooth parallax ladder; hits freeze the two fighters and send the victim on a real arc; shadows are the actor's own shape.

---

## 1. Bullets: dark rim + tinted edge + white core, normal blend (Taisei)

**How they do it.** `sprite_bullet.frag.glsl`: each bullet texture is a 3-channel MASK, not a coloured picture.
R = rim/shadow, G = edge (tinted with the bullet colour), B = core (white). Shader:
`shadow = smoothstep(0, 0.5, R) * 0.35` drawn in `edge_colour * shadow_brightness`, then `edge*G + white*B` composed OVER it.
`projectile.c:854-869` (`projectile_shader_params`): `shadow_threshold .5`, `shadow_opacity .35`,
`shadow_brightness = lerp(1, .25, alpha)` (opaque bullets get a DARK rim at 25% brightness; additive ones a glow),
`core_color = white`, two hue-shifted edge tones at hue -0.08 and +0.08 so the edge is not one flat colour.
Default blend is `BLEND_PREMUL_ALPHA` (`projectile.c:25`), i.e. normal over-blending. "Additive" in Taisei is the same blend
with colour alpha set to 0 (premultiplied trick), chosen per bullet, not for all bullets.
Spawn flash: `projectile.c:715-775` adds a `bullet_flare` particle 4.5x the bullet size, 30-34 frames, colour forced to
saturation .75 lightness .5, alpha .05 (a faint additive bloom), and fades with `scalefade_exp`.

**What ours does.** `render/pure.js:50` `pic()` draws EVERY bullet picture with `globalCompositeOperation='lighter'`, player
and enemy alike. Additive on a bright lit window adds to white: this is exactly CRITIC-2026-10-24 grayscale row 3 ("enemy orbs
are white dots with the same value as the lit windows"). Additive also cannot darken, so no bullet can carry a rim.

**Change.** In `pure.js` `shots()`, draw ENEMY bullets with `source-over` (the owner's bullet pictures already carry their own
halo); draw a dark rim first: the same picture through the existing `hot()` silhouette path tinted `#120818` at alpha .35 and
1.25x size, then the picture normal-blended. Keep 'lighter' only for player shots (they sit under enemy shots, Taisei layer
order below). Behind a flag `RET.rimshot`, default off until the owner sees the pair.
**Gate.** Grayscale of the busy stage-1 shot (seed 7, 59 s): every enemy bullet's centre luminance differs from the 24 px ring
around it by >= 40/255 on both phone and PC (today: < 10 on phone over windows). Owner-art test stays 7+ (no new code shapes).

## 2. Draw order (Taisei `src/drawlayers.inc.h`)

BACKGROUND < PLAYER_SHOT < PARTICLE_LOW < ITEM < PLAYER < PARTICLE_MID < ENEMY < BOSS < LASER_HIGH < BULLET < PARTICLE_HIGH <
PLAYER_FOCUS (hitbox dot) < OVERLAY. Player shots sit UNDER the player and enemies; enemy bullets are above every actor; only
spawn flares and the tiny focus marker go over bullets.
**Ours.** `pure.js` already draws `G.pb` before `G.eb` (good). **Check** that explosions/fx-boom are not drawn after enemy
bullets: a 200 px boom over a bullet hides the shot that kills you. **Gate:** `?scn=` probe logs draw order per frame; enemy
bullets are the last play-field draw except HUD.

## 3. Enemy movement: one 4-number integrator, curves for free (Taisei `move.h`, `move.c`)

**How.** Every enemy and bullet has `MoveParams {velocity, acceleration, retention, attraction, attraction_point, exponent}`
in complex numbers. Per frame (`move.c` `move_update`): `pos += v; v = accel + retention*v + attraction*(target - pos)`.
`retention` is complex: |r| < 1 eases out, arg(r) != 0 ROTATES the velocity each frame, so a single number gives spirals and
arcs. Helpers: `move_asymptotic(v0, v1, r)` (burst then settle: v -> v1), `move_asymptotic_halflife`, `move_towards(target,
attraction)`. Stage 1 enemy (`timeline.c:155-160`): `move_from_towards(pos, target, 0.005)` with `retention = 0.8` = the enemy
glides in and decelerates smoothly onto its spot; later `attraction_point += 30*rng_dir()` = it drifts to a new spot between
volleys. Bullets: `move_asymptotic_simple(aim, i*0.5)` = fired fast (1 + 0.5i boost), slow to the aim speed with r .8, so a
ring of 20 shots spreads into layers instead of one flat circle.
**Ours.** Rule 17 (d) and the critic both flag straight mechanical lines. **Change:** one `mv(e)` helper in the flight movement
code with exactly those four terms (complex retention as `{c,s}` rotation per frame at 60 Hz), and give stage-1 foes
`towards(spot, .005), retention .8` plus a 30 px re-target between volleys. **Gate:** probe over 300 frames: no foe has
constant velocity for > 30 consecutive frames; per-foe path curvature > 0 in >= 80% of frames.

## 4. Backgrounds: smooth parallax ladder + fog by depth (Taisei `stage1/draw.c`, game-look skill)

**How.** Stage backgrounds are a 3D scene drawn into their own framebuffers (`stage_add_background_framebuffer`), then a
`zbuf_fog` pass: `fog_color (0.78, 0.80, 0.85)`, linear from `fog.near` to `fog.far` (`draw.c:214-221`). Far things fade
toward ONE fog colour, which is why actors pop: nothing distant keeps full contrast.
**Ours.** `pure.js:22-29` PC: base `.03`, far `.03`, mid `.30`, near `1.1`: a 10x jump between far and mid and nothing between
.3 and 1.1, so the far layers read as wallpaper. Phone (`port`): ONE static `cover()` picture, no parallax at all.
Street `streetlook.js:101-104` tiles sky/far/mid/near/floor with `PSP[l]` (check the same ladder).
**Change.** Ratios `.08, .18, .4, .7, 1.0` (base, far, mid, near, play) and, on phone, draw the same far/mid/near strips over
the phone cover instead of the cover alone. Depth fade = owner's far art first (CRITIC W214 option a); only if refused, a
per-layer fog step on far+mid, never on actors. **Gate:** in a 2 s scroll capture each layer's measured scroll speed is
monotonic and adjacent ratios differ by <= 2.5x; phone shows >= 3 planes moving at different speeds.

## 5. Hit-stop: freeze the two fighters, not the world (OpenBOR)

**How.** `openbor.c:31720-31741`: on a hit with `pause_add` (per-attack, from the `attack` line, default 0 at `:248`),
BOTH attacker and target get `toss_time`, `nextmove`, `nextanim` and `nextthink` pushed back by `pause_add`: their animation,
their jump arc and their AI stop; everyone else keeps moving. The engine ticks at `GAME_SPEED_DEFAULT 200`/s (`openbor.h:80`).
**Ours.** `foot.js:101` `hitstop(ms)` sets `S.hs`; `foot.js:344` then runs the WHOLE sim at `dt*.05`. Values:
`streetfeel.js:29` 33 / 50 / 100 ms (light / medium / heavy), `streetmelee.js:31` 133 ms finisher, `streetreach.js:36` 25 ms.
Numbers are in the normal range; the global slow-down is what makes a 4-foe fight feel like stutter.
**Change.** Freeze only the attacker and its target (`e.hs`, `P.hs`, skip their anim time and movement while > 0); the world
dt stays 1.0 except the finisher (keep global there, it reads as a "big" moment). **Gate:** `?scn=` probe with 4 foes: during
a light hit the two other foes' x advance by > 0 every frame; attacker+target anim time advances 0.

## 6. Knockback is a real arc with gravity (OpenBOR)

**How.** Default knockdown `dropv = {x 1.2, y 3.0}` (`openbor.c:261-265`), level gravity `-0.1` per tick (`:271`), max fall
`-6`, max toss `100` (`:269-270`), scaled by the model's `antigravity` (`:32301`). So a knockdown is a short parabola, about
3 up : 1.2 back, the victim bouncing on landing; `knockdowntime` (`:37242`) resets the juggle count after `game_speed` ticks.
**Ours.** `streetfeel.js:30-31,79`: a DRAWN recoil of 4-16 px easing over 0.14 s (`e._kbd`), visual only; the finisher
(`streetmelee.js` header) slides the foe 160 units along the road. No vertical arc, no landing.
**Change.** On finisher and heavy hits: `vy = -3*k, vx = 1.2*k*dir`, gravity on until the foe's y returns to its belt line,
then the owner's knockdown/defeat state for its full length (game-look: "all states"). Light hits keep the recoil.
**Gate:** probe logs the foe's screen y on a finisher: rises for >= 8 frames, lands within 0.6 s, and the "down" sheet plays
to its last frame.

## 7. Frame events: active frames live on the frame, not on a timer (OpenBOR model format)

**How.** In an OpenBOR model each animation frame carries its own `delay` and optional `attack x y w h dmg power ...` and
`bbox`; a hit box exists ONLY on the frames that list it (`collision_attack_upsert_property`, `openbor.c:19822`). Startup,
active and recovery are therefore just frames of the owner's sheet. Grab: `grabdistance` default 36 (`:275`), throw is an
animation with its own frames.
**Ours.** `art/art.js:147-158` already has per-frame end times (`ART.aS`, `ART.aframe`) from the bundled sheet data, but
attack timing in `streetmelee.js` is time-based (0.35 s chain window, 0.5 s finisher recovery) and independent of which frame is
showing. **Change:** add an `act:[from,to]` frame range per attack sheet in the bundled anim data, and let the hit test read
`ART.aframe(key,t)` so the hit lands on the frame where the fist is out. **Gate:** for each player attack, the frame index at
the logged hit time is inside `act` in 100/100 sim hits.

## 8. Depth sort and shadows (OpenBOR)

**How.** Screen y = `z - y` (depth minus height); sort key = `z` plus a per-entity `sortid` tie-breaker
(`openbor.c:34341`, `spriteq_add_sprite(..., ent_list_size*100 - sortid)`). Panels: `PANEL_Z` behind players,
`FRONTPANEL_Z = PLAYER_MAX_Z+50` in front (`openbor.h:141-147`), i.e. foreground props pass in front of actors.
Shadows (`:34346-34460`): either a plain shadow sprite or a REPLICA of the current frame, filled `rgb(64,64,64)` with
MULTIPLY blend (`:336-338`, `:5932`), squashed and sheared by `light {x 128, y 64}/256` (`:333`), i.e. shear .5, height .25,
and shifted by jump height so it stays on the floor while the actor is in the air.
**Ours.** Belt sort by `z` (`streetlook.js:154`, `purefoot.js:49`) is right but has no tie-breaker (two foes on the same z
flicker order). Shadow is a radial-gradient ellipse (`footart.js:32-34`, `streetlook.js:56` at alpha .38).
**Change.** Sort key `z*1000 + id` for a stable order. Shadow: the current frame drawn through the existing silhouette path,
`scale(1, .25)`, `transform` shear .5 away from the key light (game-look: one light direction), fill `#404040` with
`globalCompositeOperation='multiply'`, alpha .5, behind a flag; keep the ellipse for flying foes. **Gate:** grayscale shot:
shadow mean value 40-70% of the floor under it; same-z pairs keep their order across 300 frames (probe).

## 9. Lights: multiply, ambient + few point lights (Phaser `DefineLights-glsl.js`)

**How.** Phaser's Light2D: `final = ambient + sum(attenuation * diffuse * intensity)`, `attenuation = clamp(1 - d^2/r^2)`,
`diffuse = max(dot(normal, lightDir), 0)`; sprite colour is MULTIPLIED by it (`ApplyLighting-glsl.js`). Default
`maxLights 10` per camera (`Config.js:481`). Without a normal map the normal is flat, so it is a plain radial multiply.
**Ours.** Engine flame and spill are additive pictures (`pure.js:37`); no darkening of the scene anywhere.
**Change (only if the owner wants night lighting).** Canvas2D can do the flat-normal version: a quarter-res light canvas
cleared to the ambient colour, radial gradients added with 'lighter' at the player engine, muzzle and neon, then drawn over the
backdrop ONLY with 'multiply'. Never over actors (rule 17 f0). **Gate:** owner pair; frame time on the phone profile +< 1 ms.

## 10. One colour grade per frame, pixel snapping, filtering (PixiJS, Phaser)

**How.** PixiJS `ColorMatrixFilter` (`src/filters/defaults/color-matrix`) and Phaser `FilterColorMatrix` run ONCE on a
container's render texture: one full-screen pass, not per sprite. Blend modes (`State.ts`): normal, add, multiply, screen,
erase; textures are premultiplied (`const.ts` maps normal/add/screen to `*-npm` variants for non-premultiplied sources).
Pixel snapping: Pixi `roundPixels` per sprite (`Sprite.ts:93`); Phaser `roundPixels` (`Config.js:382`) and `pixelArt`
(nearest filter + roundPixels + no antialias, `:397`). Batching: Pixi packs sprites into one draw call per up to
`maxBatchableTextures` textures (`Batcher.ts:398`, GPU limit, typically 16).
**Ours.** Smoothing 'high' on every canvas (`pure.js:64`, `purefoot.js:31`): correct for the owner's PAINTED art (it is not
pixel art; nearest would look worse). Sub-pixel positions are never rounded: slow-scrolling backdrop strips shimmer.
**Change.** Round the tile x in `pure.js` `tile()` and `streetlook.js:101` to device pixels (`Math.round(x*dpr)/dpr`), actors
stay sub-pixel (smooth motion). No grade: the owner's art is the grade (rule 17 f0). **Gate:** 2 s capture of the far layer
shows no 1-px brightness flicker on window edges (frame diff of a static-content region < 2/255).

---

## Recommendation: keep Canvas2D, fix the compositing

Every defect the critic scored low is a CHOICE in our code, fixable in Canvas2D: all-additive bullets (1), parallax ladder
and static phone backdrop (4), global hit-stop (5), no knockback arc (6), timer-based hits (7), ellipse shadows and unstable
sort (8), unrounded strips (10). WebGL changes how fast we draw, not what the picture looks like.

What a PixiJS layer would cost (measured from the npm builds):
- Size: `pixi.min.js` 8.22.0 = 840,663 B, 236,838 B gzip (Phaser 3.90 `phaser.min.js` 1,196,122 B, 314,863 gzip). Our
  `games/mainhattan-nightrun/index.html` is 2,353,772 B / 854,758 gzip today: +28% download for Pixi, +37% for Phaser.
- Work: every draw path moves (`render/pure.js`, `street/purefoot.js`, `street/streetlook.js`, `art/art.js` drawAnim and
  crossfade, `footart.js`, HUD stays DOM/Canvas). The sheets become Pixi textures (premultiply on upload; mipmaps on for the
  big painted backdrops). Estimate 5-7 one-deliverable tasks (renderer shell, backdrop layers, actor sheets, bullets/fx,
  street belt + shadows, phone-check + audit), plus a regression round, during a feature freeze.
- Gain: one draw call per batch instead of one per `drawImage`; real premultiplied blending; filters on the GPU. Phone gain
  only matters if Canvas2D is the bottleneck, which no one has measured yet.

**Decision rule.** Do fixes 1, 4, 5, 6, 8 first (each one task, behind a flag, owner pair before keeping). Move to a
PixiJS layer ONLY if a Chrome performance trace of the busy stage-1 moment on a mid phone (4x CPU throttle, 390x763) shows the
canvas draw > 10 ms per frame after those fixes. Phaser is not worth it: we would use only its renderer and pay for the rest.
