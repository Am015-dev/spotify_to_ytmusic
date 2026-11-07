# Wildmark art direction (free kit, round 2)

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
