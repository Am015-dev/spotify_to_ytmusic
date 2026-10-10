# Mainhattan Nightrun: painted art hand-off (laptop → Linux session, 2026-10-09)

Nightrun draws everything procedurally today (no `new Image` anywhere in `parts/`). The laptop made Google Flow paintings as **separate files** in `games/mainhattan-nightrun/media/` (WebP). The Linux session wires them in, keeps the procedural drawing as the fallback until each image has loaded, tests and deploys.

## In-game sprites `spr-*.webp` (transparent, trimmed to the shape)
- **Player ships** (256 px wide, nose pointing RIGHT), one per `SHIPS` id in `garage.js`: `spr-ship-std`, `-tri`, `-hv`, `-ec`, `-swg`, `-syn`.
  - Draw them in place of the polygon in `draw.js:1-10`, centred on the ship position, scaled to the current hitbox width (about 40–48 px on screen).
- **Enemies** (256 px long side, facing LEFT): `spr-en-drone`, `-charger`, `-gunship`, `-gate` (upright), `-flank`, `-swarm`, `-mine` (symmetric).
  - Replaces `draw.js:19-31` and `dir.js:153-158`.
- **Turret in two parts:** `spr-en-turret-base` and `spr-en-turret-barrel`. The barrel's pivot hub is at its LEFT end and the muzzle at the right, so rotate it around the hub (translate to the hub, rotate to the aim angle, draw with x offset 0) so it keeps aiming in code.
- **Bosses** (512 px long side, facing LEFT): `spr-boss-sek-adler` (k0), `-flusskrake` (k1), `-zentral-ice` (k2), `-kronos` (k3), `-bruecken-waechter`, `-schranken-wart`, `-hoplite`, `-talos` (map to k4/k5/`drawBossX` by name).
  - Talos was painted facing right and is mirrored in the file.
  - The Schranken-Wart frame is open in the middle; keep drawing its laser bars in code.

### Animation recipe (all in code, no sprite sheets)
1. **Bob and tilt:**
   - Player: `ctx.rotate(P.tilt)` with the existing tilt and a 1–2 px sine bob.
   - Enemies: a sine bob with a per-enemy phase.
2. **Engine flame:** keep the existing `D.a` glow behind the ship's left edge, flickering in length with the beat. A painted `fx-engine` jet can replace it once the effects arrive (see below).
3. **Hit flash:** on damage, draw the sprite again for about 60 ms with `globalCompositeOperation='lighter'`, or as a white silhouette via an offscreen canvas filled with `source-in`.
4. **Drone rotors:** the drone has short stubs only. Draw two spinning ellipses above it in code.
5. **Bosses:**
   - Phase changes: pulse a glow (`glow()` from `a.js:29`) behind the sprite in the district colour.
   - Damage: add a red tint flash.
   - Death: keep the existing five bursts.
6. **Elites and telegraphs:** keep the existing rings (`draw.js:14-16`) on top of the sprites.
- Preload all of them once (`new Image()`; draw only after `complete`). They total about 1 MB.

## Backdrops and key art
- `bg-<district>.webp` (1600 px wide, 16:9) and `bg-<district>-phone.webp` (9:16) for `bankenviertel`, `mainufer`, `ostend`, `messe`, `athina`.
  - These replace the cached sky (`skyFor`, `bg.js`) as the farthest layer.
  - Keep the procedural skyline layers on top until the painted parallax strips (below) arrive. Darken them about 30 % so bullets stay readable.
- `title.webp` / `title-phone.webp`, `end-win.webp`, `end-lose.webp`.
- `boss-<name>.webp` (384×384, square portraits) for boss intro cards.
- `ship-<id>.webp` (256×256, square portraits) for the garage and shop.

## Shots, effects, pickups and parallax strips (delivered 2026-10-09)
- **Shots and effects `fx-*`:** light on BLACK. Draw them with `ctx.globalCompositeOperation='lighter'` so the black vanishes.
  - Shots: `fx-shot-std` (neutral, so it can be tinted to `D.b`), `-hv`, `-ec`, `-perfect`.
  - Enemy bullets: `fx-bullet-enemy` (lime, matches `BULLET`).
  - Hits and flashes: `fx-muzzle`, `fx-hit-spark`.
  - Explosions: `fx-explosion-small`, `-big`, `-boss`. Scale them up while fading them out over about 300 ms.
  - Others: `fx-shockwave`, `fx-engine`.
- **Pickups `pk-*`** (keyed, 128 px):
  - `pk-shard`, `pk-hp`, `pk-up`, `pk-emp` (`draw.js:59-66`).
  - Power coins `pk-drum`, `pk-tempo`, `pk-slow`, `pk-drop` (`power.js`).
- **Parallax strips `ly-*`** (keyed, so the sky shows through; 1600 px wide; tile horizontally, mirroring every other tile if the seam shows):
  - `ly-far-<district>` replaces the far skyline (0.1) and `ly-mid-<district>` the mid skyline (0.45).
  - `ly-near-rail` / `-river` / `-street` / `-sea` replace `drawNear`.

## Music
`music-treblo/README.md`: ten Treblo instrumentals.

## Licence
Google Flow (Nano Banana) generation from our own prompts. Add a credit line in the game's credits and in `kit/ASSETS.md`.
