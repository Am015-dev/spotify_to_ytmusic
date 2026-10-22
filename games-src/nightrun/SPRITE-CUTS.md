# Sprite cuts: on-foot sheets and stills (qa/spritecut.js, 22 Oct 2026)

How it is checked: `NODE_PATH=$(npm root -g) node games-src/nightrun/qa/spritecut.js` (add `--all` for bosses, ships and fx). Each strip is cut exactly as art.js
cuts it (frame i = x i*w, size w x h from its json). A frame is CUT when its opaque pixels (alpha > 32) touch the top, left or right edge of its cell in a run
longer than 2 px (the bottom too, except for on-foot actors whose feet stand on it). BODY = a loop whose body height jumps more than 15% from its median.
The Lab > ON FOOT viewer draws a red line on the cut edge of the frame.

## Before / after (on-foot scope: 218 sheets and stills)

| | edge cuts | body jumps | wrong frame count / size |
|---|---|---|---|
| before | 56 sheets (125 frames) | 2 loops | 28 sheets |
| after | 29 sheets (29 frames) | 1 loop | 0 |

## Fixed here (wiring, not art)

28 on-foot strips in `games/mainhattan-nightrun/media/anim` were an older export than their json in `games-src/anims/mainhattan-nightrun/sheets` (the json the build bundles).
The game cut them at the wrong frame width, so each frame showed a slice of its neighbour and lost its own right side (hound run: json 434 px a frame, sheet 376).
Each was replaced by its matching export from `sheets/` (same file the json was written for; no new art). With the boss copies below applied, `--all` reports 0 count errors for bosses and ships too.

bruiser/shoot, drone/shoot, flamer/hit, flamer/spray, grunt/shoot, gunman/melee, gunman/shoot, hound/bite, hound/run, jetpack/fly, kai/aimup, kai/crouchshoot, kai/dash, kai/shoot, knife/jump, knife/melee, knife/shoot, mech/idle, medic/heal, shield/melee, shield/shoot, sniper/jump, sniper/melee, sniper/run, sniper/shoot, turret/shoot, warden/run, warden/shoot

NOT applied yet (outside the on-foot scope; the same fix, ready): boss-bruecken-waechter/attack, boss-flusskrake/attack, boss-flusskrake/hit, boss-hoplite/hit, boss-messe-waechter/idle, boss-schranken-wart/attack, boss-sek-adler/attack, boss-sek-adler/idle, boss-talos/idle, boss-tresor-wart/attack, boss-zentral-ice/hit. Copying them from sheets/ fixes their frame cut but changes the endless10 draw fingerprint (state unchanged), so it needs the orchestrator's OK (then UPDATE=1 fingerprints).

## Cut in the art itself: please re-export (id, frames, edge)

| id | frames (1-based) | edge |
|---|---|---|
| bruiser/die | 1 | top |
| flamer/walk | 3 | top |
| foot/pk-bomb | 1 | top |
| foot/pk-bomb | 1 | bottom |
| foot/pk-damage | 1 | top |
| foot/pk-damage | 1 | left |
| foot/pk-damage | 1 | right |
| foot/pk-damage | 1 | bottom |
| foot/pk-magnet | 1 | top |
| foot/pk-magnet | 1 | left |
| foot/pk-magnet | 1 | right |
| foot/pk-magnet | 1 | bottom |
| foot/pk-shield | 1 | top |
| foot/pk-shield | 1 | bottom |
| foot/pk-slow | 1 | top |
| foot/pk-slow | 1 | right |
| foot/pk-speed | 1 | top |
| foot/pk-speed | 1 | left |
| foot/pk-speed | 1 | right |
| foot/pk-speed | 1 | bottom |
| foot/pk-weapon-arc | 1 | top |
| foot/pk-weapon-arc | 1 | left |
| foot/pk-weapon-arc | 1 | right |
| foot/pk-weapon-arc | 1 | bottom |
| foot/pk-weapon-flame | 1 | top |
| foot/pk-weapon-flame | 1 | left |
| foot/pk-weapon-flame | 1 | bottom |
| foot/pk-weapon-hmg | 1 | left |
| foot/pk-weapon-hmg | 1 | right |
| foot/pk-weapon-rocket | 1 | top |
| foot/pk-weapon-rocket | 1 | left |
| foot/pk-weapon-rocket | 1 | right |
| foot/pk-weapon-rocket | 1 | bottom |
| foot/pk-weapon-shotgun | 1 | top |
| foot/pk-weapon-shotgun | 1 | left |
| foot/pk-weapon-shotgun | 1 | right |
| foot/pk-weapon-shotgun | 1 | bottom |
| foot/sc-barrel | 1 | top |
| foot/sc-barrel | 1 | bottom |
| foot/sc-crate | 1 | left |
| foot/sc-crate | 1 | right |
| foot/sc-door | 1 | bottom |
| foot/sc-neon-sign | 1 | top |
| foot/sc-neon-sign | 1 | bottom |
| foot/sc-vending | 1 | top |
| foot/sc-vending | 1 | bottom |
| grunt/die | 1 | top |
| grunt/jump | 3 | top |
| jetpack/die | 1 | top |
| jetpack/fly | 1 | top |
| kai/combo3 | 3 | top |
| kai/hurt | 1 | top |
| kai/idle | 3 | top |
| kai/land | 3 | top |
| kai/run | 3 | top |
| mech/shoot | 2 | top |
| shield/idle | 3 | top |

Note: the media/foot rows are single pictures (pickups, scene props) cropped tight to the art; they are drawn as stills, so a tight crop is only a cut if the
picture itself is clipped. The kai / foe rows are the head or a raised arm touching the top of a 256 px cell: give those frames headroom (the art is scaled to fill the cell).

## Body jumps (loops)

- prop-steam/glow: frames 1,3,5 (a loop whose glow changes size; expected for steam, no fix needed)
