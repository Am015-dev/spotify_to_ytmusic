# Final Approach: AI art prompts (Google Flow / ComfyUI)

The shipped art is painted by `paint/paint.js` (gouache-style SVG filters rasterised to WebP). If you would rather have generated paintings, make
the pictures below, name them exactly `<id>.png` and drop them into `art/`. `game/build.py` embeds `art/<id>.png` in place of `art/<id>.webp`,
resized to the size in the table, so nothing else changes. `art/manifest.json` lists every id and size.

Rules (keep the art ours):
- Never name the original game, its publisher, or "in the style of ..." any artist, game or studio.
- Do not feed any photo or scan of the real game in as a reference or image-to-image input.
- The game writes all numbers, names and labels itself (slot numbers, the speed text, round and altitude text). Generate pictures only: **no text, no digits, no letters, no logos**, with two exceptions that are drawn pictures, not type: the dice pips and the dice question mark.
- Same seed, model and settings for the whole set so the pieces match. Final files: PNG, exact pixel size from the table.

## Style block (paste in front of every prompt)
> Hand-painted gouache illustration for a cosy cockpit game, chunky soft shapes with a slightly wobbly dark navy outline, matte paper grain,
> rich but warm colours (teal panel, warm cream highlights, blue and orange crew colours), gentle rim light, soft drop shadow, crisp and readable at
> very small sizes, simple silhouettes, no text, no numbers

## Negative prompt (ComfyUI) / "avoid" line (Flow)
> text, letters, digits, logo, watermark, signature, photograph, photorealistic, 3D render, glossy plastic, lens flare, busy background,
> real airline livery, real aircraft maker markings, perspective distortion, harsh shadows, grim, dark mood

## Single pictures
| id | size | prompt |
|---|---|---|
| `plate` | 1024 x 640 | the flat control-panel surface of a cartoon airliner cockpit, deep teal painted metal with soft brush streaks, four small rivets in the corners, empty, no instruments, no switches, even lighting so game pieces read on top |
| `frame` | 256 x 128 | a chunky rounded window frame made of pale brushed metal with a thick soft bevel, the inside is a flat mid-grey (it is keyed out), seen straight on |
| `tray` | 512 x 128 | a long rounded pill-shaped dice tray, pale cloudy grey-white felt with a soft raised rim, seen from above, empty |
| `screen` | 512 x 192 | a folding privacy screen seen from the front, dark navy cloth with a small gold line-drawing of an airliner on a runway triangle and a gold base strip |
| `dial` | 320 x 320 | a round artificial-horizon instrument, pale blue sky over brown ground, thick silver bezel, tiny white tick marks on the rim, small red wing marks, a white triangle at the top, no needle |
| `gauge` | 480 x 260 | a half-round speed gauge (a semicircle, flat side at the bottom), thick silver bezel, near-black teal face, empty (the game draws the ticks and the two needles) |
| `pillbar` | 256 x 48 | a slim horizontal fuel-bar housing, silver rim with a dark empty channel, seen from the front |
| `planefront` | 320 x 140 | a cartoon airliner seen from straight ahead, white body, two engines, blue tail edge visible, wings spread, simple |
| `planeside` | 512 x 200 | a cartoon twin-engine airliner in side view flying right, cream-white body with a blue tail fin and a blue stripe, round windows in a row, no logo, gear up |
| `planegear` | 512 x 200 | the same airliner, landing gear down (two stubby legs with wheels), flaps out |
| `crew-0` | 256 x 256 | a friendly airline captain, head and shoulders, **blue** cap with a gold badge shape (no letters), headset, warm expressive eyes, white jacket with a blue collar |
| `crew-1` | 256 x 256 | a friendly first officer, head and shoulders, **orange** cap with a cream badge shape, headset, cheeky wink, white jacket with an orange collar |
| `title` | 1440 x 810 | the view from inside an airliner cockpit at sunrise: two big windows split by a centre post, a violet and peach sky with soft cream clouds and a low sun, purple mountains, a small airliner flying across, a teal dashboard with round gauges and two crew members' caps at the bottom edge, no text |
| `end-land` | 1280 x 720 | a landing view down a dark runway at golden sunset, runway edge lights glowing, white centre dashes, green fields, purple hills, big soft clouds, no aircraft |
| `end-crash` | 1280 x 720 | a night sky over dark hills with heavy slate-blue clouds, calm and moody, no fire, no wreckage, no aircraft |
| `sky-dawn`, `sky-day`, `sky-dusk`, `sky-night` | 1024 x 192 each | a wide seamless (tileable left to right) sky strip: dawn = pink to peach with a pale sun, day = clear blue with soft clouds, dusk = purple to orange with a low sun, night = navy with stars and a moon |
| `ter-mountain`, `ter-water`, `ter-city`, `ter-ice`, `ter-plain` | 1024 x 96 each | a seamless low terrain silhouette strip along the bottom: snowy mountains / sea with wave lines / city skyline with lit windows / pale ice and snow / green farmland with soft hills |

## Atlases (one picture per file, a grid of equal cells, transparent background)
Cells are listed left to right, top to bottom. Keep every item centred in its cell with about 8% margin.

### `dice` (768 x 512, cells 128 x 128, 6 columns)
Row 1: blue dice showing 1, 2, 3, 4, 5, 6 (cream pips, rounded cube, top view). Row 2: orange dice 1 to 6. Row 3: black traffic dice 2, 3, 4, 5, then a blue die with a white question mark, then an orange die with a white question mark. Row 4: cream round trainee tokens 1 to 6 (stitched edge, dark pips).

### `tokens` (512 x 512, cells 128 x 128, 4 columns)
Row 1: a white coffee cup on a saucer; a violet reroll ring (circular arrows, no text); a dark-blue round token with a white airliner (other planes on the track); a gold round token with a white airliner (your plane). Row 2: a switch with a red light, switch off; a switch with a green light, switch on; a blue upward arrow (blue speed marker); an orange upward arrow (orange speed marker). Row 3: a red upward arrow (brake marker); a teal water drop (fuel); a sky-blue round token with a white airliner (spare); an empty cell. Row 4: an empty blue-rimmed square well; an empty orange-rimmed square well; an empty grey-rimmed square well; an empty round silver well.

### `icons` (768 x 192, cells 96 x 96, 8 columns)
Row 1: balance scales (axis), steering wheel (engines), headset (radio), landing-gear leg (gear), a flap profile (flaps), a half-filled circle (brakes), a steaming cup (concentration), a water drop (fuel). Row 2: a trainee cap (intern), a snowflake (ice), wind lines (wind), a stopwatch (clock), mountain (altitude), a triangle (approach). Each icon is a white glyph on a round coloured badge, simple and bold.
