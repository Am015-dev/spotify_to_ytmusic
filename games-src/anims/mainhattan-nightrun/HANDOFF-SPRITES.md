# Nightrun animated sprite sheets: what to wire (handoff to the Linux session, 21 Oct 2026)

Owner reviewed and APPROVED all 229 sheets (`sheets/review.json`, every entry `"v": "ok"`). Wire them behind a flag
(suggest `RET.sprites`, `?sprites=0` = today's stills) so nothing changes for players until the flag is on.

## What is in `sheets/`
- `sheets/<who>/<act>-strip.webp` + `.json`: ONE horizontal row of frames, transparent background.
  json: `{frames, fps, w, h, anchor: [x, y], order}`; frame i = `sx = i * w`, `sy = 0`, size `w x h`.
  `anchor` = the point that sits on the ground / object position: characters, bosses = bottom-centre (`[w/2, h]`);
  ships, effects, props = centre.
- `sheets/smoothing.json`: the owner-approved in-game smoothing (preview "Smoothing ON"): per-act `holds` (relative frame
  durations at the sheet fps), hit-stop + white flash on the hit frame, squash on foot contacts / landings, idle bob/breath,
  4 deg lean into runs, cross-fade ONLY for idle / flame / beam / burst / impact / muzzle / glow / loop. Read it, do not
  hard-code new numbers.
- Facing: characters face RIGHT, bosses and enemy ships face LEFT, effects have no facing (already mirrored where needed).
- How they were made (Flow strips -> cut -> sheet): `games-src/anims/FLOW-SPRITE-STRIPS.md`.

## 1. A strip loader (needed first; nothing reads one-row strips today)
The only frame animation now is the boss grid `UIK.bossDraw` (parts/uikit.js:23-32, 2 rows x 4 frames from
`media/anim-boss-<name>.webp` + `anim-boss.json` pasted at `__BOSSANIM__` by build.py). Add a small helper next to
`ART.load` (parts/art.js:12-19):
- `ART.anim(key)` -> loads `media/anim/<who>/<act>-strip.webp` + its json once (bundle the jsons in build.py like
  `anim-boss.json`, one `ANIM` object, so there is no fetch at runtime).
- `ART.frame(key, t)` -> frame index from time: walk `smoothing.holds[act]` (fall back to equal holds) at `json.fps`;
  loop acts (idle, run, flame, glow, loop, spin, hover) wrap, one-shot acts (die, defeat, death, burst, impact, muzzle,
  hit, melee, attack) stop on the last frame and report done.
- `ART.drawAnim(ctx, key, t, x, y, scale, flip)` -> drawImage of one cell, positioned by `anchor`.
- Media: copy `sheets/` to `games/mainhattan-nightrun/media/anim/` and add every file to `media/ready.json`
  (art only counts if listed: shapes.js:3-4 `ART.isReal`). build.py has a hardcoded `/home/user/spotify_to_ytmusic` path
  (build.py:2): fine on the Linux box, keep it.
- `fx-` keys get black keyed out in `ART.load` (art.js:14): the effect sheets are ALREADY transparent, do not key again.

## 2. Wire per category (code location -> sheet, name map)
| Category | Draws today | Sheets | Notes / name map |
|---|---|---|---|
| Bosses (10) | `bossPaint` draw.js:91-97 -> `UIK.bossDraw` grid, else still `spr-boss-<id>` | `boss-<id>/{idle,attack,hit,defeat}` | code ids have NO `boss-` prefix (`ART.bossN` art.js:6) and `boss-<id>` is already the PORTRAIT key (art.js:102): load sheets as `anim/boss-<id>/...` (folder path), never as `boss-<id>`. New: `hit` (replace the flash-only hit, uikit.js:31, keep the flash on top) and `defeat` (play once when hp hits 0, before the explosion). |
| On-foot (11 in game) | `FA.draw` footart.js:102 via `drawWho` foot.js:440; stills `media/foot/<who>-<pose>.webp`; run = run-a/run-b swap foot.js:445 | `kai, grunt, gunman, shield, bruiser, knife, sniper, drone, turret, mech, warden` x run/idle/shoot/melee/die/jump (+ more for Kai) | pose -> act: run-a/run-b -> `run` (6 frames, replaces the 2-still swap), idle -> `idle`, shoot -> `shoot`, melee -> `melee`, die -> `die`, jump/fall -> `jump` (frames 1-2 rising, 3-4 falling). Keep the stills for `hit`, `crouch`, `crouch-shoot` where no sheet exists. Kai extra: `dash, runshoot, hurt, land, crouchshoot, combo2, combo3, aimup, aimdiag, grenade, victory`. warden = the foot boss (footen.js:385). |
| Player ships | `drawPlayer` draw.js:31-36 still `spr-ship-<id>` + `fx-engine` | `ship-<id>/{flame,death}` (std, tri, hv, ec, swg, syn, drift, lancer, nova) | `flame` replaces the separate `fx-engine` jet (the sheet already contains ship + flame); `death` plays once instead of / before `ART.boom` (art.js:22). drift/lancer/nova are not in `ART.shipN` (art.js:8): add them to the preload. Banking stays in code (tilt + squash, smoothing.json). |
| Enemy ships | `drawEnemy` draw.js:51 (drone :56, turret :63, charger :71, gunship :74), dir.js:168-170 | `ship-e{interceptor,bomber,gunship,kamikaze,carrier,cruiser}/{flame,volley,death}` (+ `ship-ec`) | Only `gunship` exists in code (`spr-en-gunship`); `kamikaze` is a vector in ZOO.art zoo.js:82. interceptor / bomber / carrier / cruiser are NEW enemy types: art is ready, design + spawn rules are not (owner decision, do not invent stats). `ship-ec` is a PLAYER ship id (art.js:8), not an enemy. |
| Weapon FX (16) | `ART.fxDraw` art.js:57 single image; muzzle fxwave.js:25 `fx-w-<id>-muzzle`, hit fxwave.js:28 `fx-w-<id>-hit` | `wpn-<id>/{muzzle,impact,beam}` | name map: sheet `impact` = code `hit`. Ids match (g.js:194 + wpx.js:12-24). Per-weapon `beam` sheets have no hook (only enemy beams exist, fxwave.js:35-36): use them for the player bullet/projectile sprite if a weapon draws one, else leave unwired. |
| Explosions (13) | `FXW.bk` fxwave.js:30-32 picks `fx-boom-<size>-<look>` / `fx-boom-boss-a|b`, drawn grown + faded | `fx-boom-*/burst` (5 frames) | same names: play the 5 frames instead of grow+fade (keep a small fade on the last frame). Last 1-2 frames are faint smoke by design. |
| Small FX | `fx-hitconfirm`, `fx-spark`, `fx-shield` | `.../{burst,glow}` | hitconfirm/spark = one-shot on a confirmed hit; shield = looping glow while a shield is up. |
| Pickups | power.js:67 `coin()` draws `pk-<k>` (`ART.pkN` art.js:11) | `pk-coin, pk-health, pk-ammo` / `spin` | map coin -> `pk-shard`, health -> `pk-hp`; there is no ammo pickup (leave `pk-ammo` for foot mode `FA.pickup` footart.js:121, which nothing calls yet). |
| Props (8) | not in game | `prop-{car,drone,banner,neon,police,windows,beacon,holo,steam}/loop|glow` | background life for the on-foot street (foot scenery `FA.scenery` footart.js:127 exists but nothing calls it): place a few per street layer, loop at sheet fps, behind the actors. |

## 3. Not in the game (art is ready; needs owner design first)
On-foot enemies `jetpack, hound, flamer, ninja, medic` (full move sets), enemy ships interceptor / bomber / carrier /
cruiser, all props. Wire the loader so they can be dropped in, but do not add enemy stats or spawn rules on your own.

## 4. Check before turning the flag on
- Each sheet draws with its feet / centre on the old still's spot (compare one frame per category vs the old still).
- fps feel matches the preview (`viewer` Sprites tab on the laptop, or the frames/fps in each json).
- Performance: one drawImage per sprite; no per-frame canvas allocation (`ART.sp` cache, art.js:24, takes a key: cache
  per sheet, not per frame).
- `media/ready.json` lists every new file; build.py output includes the ANIM json.
