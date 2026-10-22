# Sprite cuts: what was really wrong (qa/spritecut.js, 22 Oct 2026, rewritten by S5)

Owner (22 Oct): "I can see the sprites fine, it's your fault." Right: the game never cropped a sprite.

## How the game draws a frame (checked line by line)
`ART.drawAnim` (parts/art/art.js) draws the whole cell: source rect (i*w, 0, w, h) from the json size, destination (w*sc, h*sc) about the anchor. `ART.footDraw` calls it with
`sc = h / cell height`. No clip rect, no body-box crop, no top offset, no cell-height clamp. The small-size copy (a canvas of `w*ts` per frame) cuts at the same frame
width, so it is whole as well. `build.py` takes frames / w / h from `games-src/anims/mainhattan-nightrun/sheets/*.json`. So a frame is only wrong when the webp in
`games/mainhattan-nightrun/media/anim` is not the export its json was written for.

## True cause 1: stale media copies (fixed)
15 more strips in `media/anim` were older exports than their json/sheet (the 28 foe strips were fixed by L3 the same way). Each is now a byte copy of `sheets/`:
- Wrong width (the game cut every frame at the json width, so a frame showed a slice of its neighbour and lost its right side; boss sheets were also 12 px taller):
  boss-bruecken-waechter/attack, boss-flusskrake/attack, boss-flusskrake/hit, boss-hoplite/hit, boss-messe-waechter/idle, boss-schranken-wart/attack,
  boss-sek-adler/attack, boss-sek-adler/idle, boss-talos/idle, boss-tresor-wart/attack, boss-zentral-ice/hit
- Same size, older art (before the "one body size across acts" pass of 22 Oct): grunt/run, gunman/run, knife/run, kai/aimdiag

Edge cuts caused by slicing: 0 (before: 29 frames with left/right or short-sheet cuts on the 10 boss strips above that touch an edge; talos/idle was only 12 px too tall).

## True cause 2: the checker (fixed)
The 13 "cut in the art" on-foot frames and the pickup stills were never clipped. The art is scaled to fill its cell, so a round head or disc **touches** the edge:
kai/idle frame 3 has 4, 14, 18, 22 opaque px on rows 0..3 (a dome), the same for kai/run 3 (6, 15, 20, 24), grunt/die 1 (3, 8, 13, 16), mech/shoot 2 (3, 15, 32, 37) and so on;
the pk-* pickups are discs (20, 30, 38 px going inward). A clipped picture keeps its width instead. `spritecut.js` now calls an edge a cut only if the width at the edge is
still >= 2/3 of the width 3 px inward; round contacts are counted apart ("tangent, not a cut"). No art change is needed for them.

## Result (`NODE_PATH=$(npm root -g) node games-src/nightrun/qa/spritecut.js`)
| | edge cuts | tangent only | count errors |
|---|---|---|---|
| on-foot scope, before (L3 state) | 29 frames | not counted | 0 |
| on-foot scope, now | 4 stills | 25 frames | 0 |
| `--all`, now | 14 sheets / 15 frames | 31 frames | 0 |

## What still touches its edge: the SOURCE does, proof = opaque px per line from the edge inward (media/foot is the source still)
- foot/sc-neon-sign top 56, 58, 58, 58 and bottom 61, 62, 62, 62: a flat rectangle sign cropped tight (its own border).
- foot/sc-door bottom 235, 235, 235, 235: the door's flat base on the road line.
- foot/sc-vending bottom 26, 77, 102, 108 and top 3, 4, 4, 4: rounded base / thin antenna; foot/pk-slow top 19, 23, 23, 25 and right 19, 22, 26, 25: a near-disc; all fully drawn, 1-2 px contact.
- ship-* death / volley frames (explosion flashes and weapon volleys fill the cell): effects, not bodies; not on foot.
These are drawn whole (stills are drawn h x h without crop). Re-exporting them with a margin is optional polish, not a bug.

## Body jumps (loops)
- prop-steam/glow: frames 1,3,5 (a glow that changes size; expected for steam, no fix needed)
