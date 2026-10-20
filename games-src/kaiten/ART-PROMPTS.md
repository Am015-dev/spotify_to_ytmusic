# Kaiten Kitchen — AI art prompts (Google Flow / ComfyUI)

Rules (keep the art ours):
- Never name the original game, its publisher, or "in the style of …" any artist or game.
- Don't feed the card scans in as reference / image-to-image input.
- The game draws the card frame, the name chit and the score badge itself. Generate only the
  food-on-plate illustration (and the extras at the end).

## Output spec (what to send back)
- One PNG per item, 1024 × 1024, **transparent background** (or plain flat #FFFFFF that I can key out).
- The plate is seen **straight from above**, centred, filling ~85% of the square, nothing cropped.
- No text, no numbers, no letters, no borders, no frame in the image.
- File names: `tempura.png`, `sashimi.png`, `dumpling.png`, `roll1.png`, `roll2.png`, `roll3.png`,
  `salmon.png`, `squid.png`, `egg.png`, `wasabi.png`, `wasabi-nigiri.png`, `chop.png`, `pudding.png`,
  `back.png`, plus the extras. Put them in a Drive folder and send me the link.
- Keep the same seed, model and settings for the whole set so they match.

## Style block (paste in front of every prompt)
> Hand-painted gouache illustration for a cosy card game, top-down view of a single round ceramic
> plate on a soft linen placemat, the food on the plate is a cute character with an expressive face
> (little eyebrows, eyelids, a clear emotion), warm-brown ink outline with a slightly wobbly brush edge,
> soft rim light, gentle shadow under the plate, rich but warm colours, matte paper texture, crisp at
> small sizes, simple readable silhouette, centred, plenty of margin, plain transparent background,
> no text

## Negative prompt (ComfyUI) / "avoid" line (Flow)
> text, letters, numbers, logo, watermark, signature, card frame, border, colour band, photograph,
> photorealistic, 3D render, plastic, glossy, kawaii dot eyes with blush only, chibi anime, busy
> background, table scene, chopsticks in frame (except Twin Sticks), multiple plates, cropped plate,
> perspective view, side view, harsh shadows, dark, grim

## Card prompts (style block + one line)
| File | Card | Prompt |
|---|---|---|
| tempura.png | Crispy Prawn | a proud golden battered prawn character puffing out its chest, curled tail, crunchy crumbs, on a **tangerine orange** plate with a dotted rim |
| sashimi.png | Fish Slice | a sleepy slab of pink raw fish with a tiny "z" sleep puff, resting on a green leaf, on a **raspberry red** plate with a wave-pattern rim |
| dumpling.png | Steam Bun | a startled round white steamed bun with pleated top and wide eyes, little steam puffs rising, in a bamboo basket, on a **sky blue** plate |
| roll1.png | Seaweed Roll ×1 | one round seaweed-wrapped rice roll seen from above with a smiling green filling, on a **teal** plate with a stripe rim |
| roll2.png | Seaweed Roll ×2 | two round seaweed rice rolls side by side, one orange filling and one green, both grinning, on a **teal** plate with a stripe rim |
| roll3.png | Seaweed Roll ×3 | three round seaweed rice rolls in a triangle, yellow, green and orange fillings, cheeky faces, on a **teal** plate with a stripe rim |
| salmon.png | Sunset Nigiri | a smug rice block topped with a striped orange fish slice, a small warm sun motif, on a **vermilion** plate |
| squid.png | Moon Nigiri | a dreamy rice block topped with a pale lilac squid slice with soft ridges, a little crescent moon and stars, on an **indigo** plate |
| egg.png | Sun Nigiri | a happy rice block topped with a fluffy yellow omelette slice held by a thin seaweed belt, sun rays, on a **lemon yellow** plate |
| wasabi.png | Fire Paste | a fiery little green paste mound with a determined grin and small flame wisps on its head, on a **lime green** plate |
| wasabi-nigiri.png | Fire Paste + nigiri | the green fire paste character proudly holding a nigiri on top of its head, sparkle burst, on a **lime green** plate |
| chop.png | Twin Sticks | a winking little rice ball character with two wooden chopsticks crossed behind it like an X, on a **chestnut brown** plate |
| pudding.png | Custard Cup | a blissful wobbly custard pudding with caramel top, a tiny chef's hat and a cherry, eyes closed in delight, on a **pink** plate |

## Card back
> back.png — repeating indigo wave-scale pattern (seigaiha-like waves) in deep blue and cream,
> with one small round medallion in the centre showing a steaming plate, gouache texture, symmetrical,
> flat, no text, no logo, fills the whole square edge to edge

## Extras (optional, same style)
| File | What | Prompt |
|---|---|---|
| belt.png | Conveyor belt strip, 2048 × 256, must tile left-right | a seamless horizontal sushi-bar conveyor belt seen from above, brushed steel edges, cream rubber slats, soft shadow, repeating, no plates |
| counter.png | Wooden counter, 2048 × 512 | a warm wooden sushi-bar counter top seen from above, planks, a cloth runner, soft lantern light, empty |
| chef-mina.png … chef-pip.png | 5 diners, 512 × 512 busts | a friendly cartoon diner bust portrait, round frame, (Mina: braids and headband / Taro: spiky hair and towel headband / Odile: chef's hat, cheerful / Kofi: cap and big smile / Pip: freckles and green cap), gouache, warm colours |
| cover.png | Shelf cover, 1600 × 900 | a cosy conveyor-belt sushi bar at night, paper lanterns, plates of cute food characters gliding past on the belt, four friendly diners at the counter, warm light, no text |

## Tool tips
- **Google Flow**: use the style block + one card line per generation; once you like one plate, use it
  as the style/ingredient reference for the rest (our own art only). Pick 1:1. Check Flow's terms that
  you may use the output in a public, tip-supported project.
- **ComfyUI**: SDXL or Flux. Fixed seed, CFG ~5–7 (Flux: guidance ~3.5), 30 steps, 1024 × 1024.
  For a consistent set use IP-Adapter with your first good plate as the style image, or train a small
  style LoRA on 6–10 plates you like. Remove backgrounds with a rembg / BiRefNet node.
- Check every image at **70 px wide** (phone hand size). If the food can't be recognised at that size,
  simplify the prompt (fewer details, bigger shapes, stronger outline).

When you send the images I'll swap them in (the code keeps the frames, names and score badges),
check them at phone size and run the layout tests before it goes live.

## Swapping in your own paintings
The game already ships with painted stand-ins made by `paint/paint.js` (`art/*.webp`, listed in `art/manifest.json`).
To use a real painting, save it as `art/<file name above>.png` (for example `art/tempura.png`, `art/chef-mina.png`,
`art/title.png`) and run `python3 game/build.py`. A PNG always wins over the WebP of the same name; the build resizes it
to the size in `manifest.json` and re-encodes it as WebP, so the page stays small. Delete the PNG to go back.
Extra names the game uses: `title.png` (1600 x 900 title painting, no text; keep the top middle calm for the logo).
