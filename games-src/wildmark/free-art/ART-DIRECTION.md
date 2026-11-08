# Wildmark art direction (free kit, round 3: 3D terrain + plates)

**Round 3 (replaces ter-*, tok-*, card-*, table-bg; the rest below still applies):** terrain is a 3D render (three.js, KayKit Medieval Hexagon
Pack glTF, CC0): oblique orthographic, warm sun, soft shadows, seamless 4x6 hex lattice with trees, mountains, hills, reeds, lilies.
Animals are public-domain 19th-century natural-history plates (Audubon elk, fox, bear, hawk; a period fish plate for salmon), cropped and
put through one parchment grade. Tokens: round portrait on a cream disc with a thin animal-colour rim. Cards: same layout as before (picture
window, colour band, free cream area); the plates sit as pinned paper cards on the terrain render. Table: procedural walnut planks, low contrast.
Rebuild: `render/README.md`. Sources: `CREDITS.md`.

# (round 2, kept for the files compose.py still makes)

**Style:** one family only, Kenney flat vector (CC0): soft flat colour, no outlines, rounded shapes, gentle top-light.
Everything is rendered from the packs' own **vector** files at 4-7x (Chromium, bevel filters stripped), then downsampled,
so edges stay crisp at any size. No glyph icons, no gradients-as-art, no text in pictures.

| Slot | Pack | How |
|---|---|---|
| ter-* (5 seamless 512 textures) | Hexagon Pack (objects vector) | flat terrain colour + the pack's own blob grain, then its pines/round trees (forest) and rocks (peak); wheat tufts, reeds/ponds and wave arcs drawn in the same flat language for meadow, marsh, river. Wrap-around placement = seamless. |
| tok-* (6 tokens) | Animal Pack Redux (round.svg) | bear, moose = elk; fox = dog recoloured orange/cream; hawk = parrot recoloured brown/amber/cream; salmon = orca recoloured salmon/pink; acorn drawn flat in pack colours. Pale tint of the animal colour behind. |
| card-*-a..d (20) | Fantasy UI Borders (Double border 011, tinted walnut) + Hexagon textures + Animal Pack Redux | cream card, framed picture window (habitat texture, set B-D adds a second terrain), 1-3 animals, animal-colour type band with a habitat hex badge; lower cream area left free for the game's text. |
| portrait-* (11) | Toon Characters 1 (vector, idle pose) | 4 base characters, clothes/hair/skin recoloured per role; habitat-tinted backdrop with soft hexes and a pack prop (pine, rock, log pile). Snowline = goat from Animal Pack Redux recoloured white. |
| title-bg, result-win/lose | all of the above | a board of thick hex tiles (same terrain textures) with animal tokens; lose = same valley at dusk, no animals. |
| table-bg | - | dark moss with faint hex grid, vignette. |
| icon-logo | Hexagon textures + Animal Pack Redux | one forest hex tile with the elk. |

**Palette:** terrain = the game's TER_COL (peak #8e979c, forest #3f8a4f, meadow #cdb65c, marsh #5c9a86, river #4a8cc4);
animals = ANI_COL (bear #7a4e2d, elk #c08a4a, salmon #d8576b, hawk #4f6fa3, fox #e2762b); card cream #f3ead2, frame walnut #5a3d24.

**Why:** the owner rejected glyph-on-gradient art. Kenney's flat vector family covers hex terrain, animals, people and frames in
one consistent hand, reads at 120 px, and is CC0. Rebuild: `PACKS=<dir> python3 compose.py` (see the header of compose.py).
- Round 3b (W416b): ter-peak calmed after the render (3x3-wrapped blur 1.2, contrast 0.55, colour 0.8, brightness 1.06); repeat that grade if the peak is re-rendered.
