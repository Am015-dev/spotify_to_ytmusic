# Lantern Dive: AI art prompts (Google Flow / ComfyUI)

The game ships with a painted set made by `paint/paint.js` (SVG gouache, rasterised to WebP; `node paint/paint.js` re-runs it).
Any picture can be replaced by dropping a PNG with the same base name into `art/` (see `art/manifest.json`): `game/build.py`
picks `<name>.png` before `<name>.webp`, resizes it to the size in the manifest and re-encodes it. Delete the PNG to go back.

Rules (keep the art ours):
- Never name the original game, its publisher, or "in the style of ..." any artist or game.
- Do not feed any scan of the original cards or box in as a reference or image-to-image input.
- The game draws the card frame, the numbers and the job-card text itself. Generate only the pictures below.
- No text, no numbers, no letters, no borders, no frame, no logos, no watermark in any picture.

## Output spec (what to send back)
- One PNG per item, at the size in the table, **transparent background** where the table says so (or plain flat #FFFFFF that can be keyed out).
- File names exactly as in the table (they are the keys in `art/manifest.json`). Put them in `art/` next to the manifest.
- Keep the same seed, model and settings for the whole set so the pictures match.
- Square items sit centred and fill about 85% of the square, nothing cropped.

## Style block (paste in front of every prompt)
> Hand-painted gouache illustration for a calm co-operative deep-sea card game, deep blue and teal water,
> a small warm golden lantern glow as the only strong warm light, soft rim light, visible gentle brush
> texture on matte paper, slightly wobbly dark navy ink outline, simple readable silhouette that still
> works at 40 pixels, rich but not neon colours, centred, plenty of margin, no text

## Negative prompt (ComfyUI) / "avoid" line (Flow)
> text, letters, numbers, logo, watermark, signature, card frame, border, photograph, photorealistic, 3D render,
> plastic, glossy, anime, chibi, horror, gore, skulls, sharks attacking, busy background, multiple subjects,
> cropped subject, harsh black shadows, neon

## Items

| File | Size | Background | What it is | Prompt (after the style block) |
|---|---|---|---|---|
| `emb0.png` | 320 x 320 | transparent | Coral suit emblem (pink-red, colour 1 of 4), printed large in the middle of cards 1-9 | a single branching coral fan in **raspberry pink-red**, thick rounded branches, a few tiny bubbles, flat front view |
| `emb1.png` | 320 x 320 | transparent | Tide suit emblem (blue) | a single curling ocean wave crest in **cobalt blue** with a foam curl and two small droplets, flat front view |
| `emb2.png` | 320 x 320 | transparent | Kelp suit emblem (green) | a single swaying kelp frond with three leaf blades in **sea green**, a small holdfast at the bottom, flat front view |
| `emb3.png` | 320 x 320 | transparent | Sunstar suit emblem (yellow) | a single plump five-armed starfish in **golden yellow** with a dotted texture on the arms, flat front view |
| `emb4.png` | 320 x 320 | transparent | Lantern emblem (the four trump cards) | a glowing brass diving lantern with a warm pale-gold flame inside a round glass, a small ring on top, soft halo, flat front view |
| `back.png` | 320 x 448 | opaque, full card | Card back, shown for face-down cards and the hot-seat pass screen | a portrait card back: deep navy water with a faint pattern of tiny rising bubbles and one small pale-gold lantern glow in the middle, a thin gold inner border drawn as part of the painting, symmetrical |
| `ping.png` | 192 x 192 | transparent | The ping token shown over a card when a diver signals | a round brass sonar ping token seen from the front: concentric pale-gold ripple rings around a small bright centre, slight dent texture on the metal |
| `flare.png` | 192 x 192 | transparent | The distress flare token | a small emergency flare stick with a bright orange-red flame and a puff of pink smoke, held at a slight angle, readable as a flare |
| `cmd.png` | 192 x 192 | transparent | The Commander badge | a round brass badge with a four-pointed compass star and a tiny lantern at its centre, a short ribbon below |
| `drone.png` | 256 x 256 | transparent | Echo, the drone in 2-diver dives (avatar) | a cute small yellow-and-teal underwater drone with one round glass eye, two little propellers and a tiny lantern on top, friendly, seen from the front |
| `diver0.png` | 256 x 256 | transparent | Diver 1 avatar (Nerea: harbour pilot, careful) | a friendly diver portrait in a round brass helmet with the glass open, warm brown skin, short dark curls, calm focused expression, pink-red collar, shoulders up |
| `diver1.png` | 256 x 256 | transparent | Diver 2 avatar (Bram: pump fixer, steady) | a friendly diver portrait in a round brass helmet with the glass open, light skin, sandy beard and a knitted blue cap under the helmet rim, relaxed half smile, shoulders up |
| `diver2.png` | 256 x 256 | transparent | Diver 3 avatar (Sumi: fish scientist, signals often) | a friendly diver portrait in a round brass helmet with the glass open, East Asian features, black bob haircut, bright curious eyes, small green notebook strap on the shoulder, shoulders up |
| `diver3.png` | 256 x 256 | transparent | Diver 4 avatar (Dag: new, cheerful) | a friendly diver portrait in a round brass helmet with the glass open, freckled face, red-blond tufts of hair, a wide cheerful grin, a slightly too-big yellow collar, shoulders up |
| `diver4.png` | 256 x 256 | transparent | Diver 5 avatar (Lio: the extra diver in 5-diver crews) | a friendly diver portrait in a round brass helmet with the glass open, dark skin, a short grey-streaked beard, kind eyes, an orange scarf, shoulders up |
| `table.png` | 1280 x 720 | opaque | Table background behind the felt, drawn under all the UI | a wide view into deep ocean water, deep blue at the top fading to near-navy at the bottom, a few soft light shafts from the surface, tall kelp silhouettes at the far left and far right edges, very quiet in the centre (the cards go there), a little sand at the bottom edge, no creatures in the middle |
| `title.png` | 1440 x 810 | opaque | Title screen painting | a wide scene: a small crew of three divers on a rocky ledge looking down into a deep blue trench, each holding a glowing lantern, the lanterns reflecting in the water, a faint outline of a huge friendly whale far below, rays of light from the surface, dark navy at the bottom, **leave the central lower third calm** because the title and buttons sit there |

## Optional extras (not wired yet)
| File | Size | What it would be |
|---|---|---|
| `bubble.png` | 128 x 128 | one soft pale-blue bubble with a bright highlight, transparent background (a particle for the Medium and High settings) |
| `tick.png` / `cross.png` | 128 x 128 | a gold painted tick mark and a coral-red painted cross for the job cards, transparent background, brush-stroke look |
