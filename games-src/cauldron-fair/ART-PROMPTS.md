# Cauldron Fair: AI art prompts (Google Flow / ComfyUI)

Rules (keep the art ours):
- Never name the original game, its publisher, or "in the style of ..." any artist or game.
- Don't feed any card, chip or board scans in as reference / image-to-image input.
- The game draws the numbers, the chip rims, the track numbers, the coin and point badges and every word itself.
  Generate only the pictures listed below. **No text, no numbers, no letters in any image.**

## Output spec (what to send back)
- One PNG per item, **transparent background** (or plain flat #FFFFFF that I can key out), sizes below (generate at 2x, I downscale).
- Round items (chips, pads, flask, ruby, droplet...) centred, filling about 88% of the square, nothing cropped.
- File names exactly as in the tables; put them in a Drive folder and send me the link.
- Keep the same seed, model and settings for the whole set so they match.

## Style block (paste in front of every prompt)
> Hand-painted gouache illustration for a cosy fantasy-fair board game, warm brown ink outline with a slightly wobbly
> brush edge, soft rim light, matte paper texture, rich but warm colours, simple readable silhouette that still works at
> 60 px wide, centred, plenty of margin, plain transparent background, no text, no numbers

## Negative prompt (ComfyUI) / "avoid" line (Flow)
> text, letters, numbers, logo, watermark, signature, border, frame, photograph, photorealistic, 3D render, plastic,
> glossy, chibi anime, busy background, harsh shadows, grim, gore, perspective distortion

## Chips (round tokens seen from above, 256 x 256, the number sits on the lower right and is added by the game)
| File | Chip | Prompt |
|---|---|---|
| chip-W.png | Fizzpod (white) | a round cream-white seed pod that is just starting to fizz, tiny spark lines and a wisp of smoke, set on a round white clay token with a darker cream rim |
| chip-O.png | Marrow (orange) | a small ribbed orange gourd with a curly green stalk, set on a round orange clay token with a darker orange rim |
| chip-G.png | Mossback (green) | a friendly green moss-backed beetle with tiny glowing eyes, set on a round green clay token with a darker green rim |
| chip-B.png | Wren Feather (blue) | a single curved sky-blue feather with a little curl at the tip, set on a round blue clay token with a darker blue rim |
| chip-R.png | Scarlet Cap (red) | a plump red toadstool cap with cream dots, set on a round red clay token with a darker red rim |
| chip-Y.png | Sunroot (yellow) | a knobbly golden root with two small leaves and a faint glow, set on a round yellow clay token with a darker gold rim |
| chip-P.png | Dusk Sigh (purple) | a drifting purple vapour curl shaped like a soft sigh with two tiny stars in it, set on a round violet clay token with a darker violet rim |
| chip-K.png | Cinder Moth (black) | a small dark moth with ember-orange wing edges, set on a round charcoal clay token with a darker rim |

## Table pieces
| File | Size | What | Prompt |
|---|---|---|---|
| cauldron.png | 1280 x 1280 | The big pot, seen straight from above: a round rim and a round bubbling potion surface. **The centre must be a calm, dark teal potion, empty**, because the game lays a spiral track of spaces over it. | a big round iron cauldron seen exactly from above, thick rim with rivets, dark teal bubbling potion filling the circle, a few soft bubbles near the edge, centre calm and empty, wisps of steam only at the very edge |
| pad.png | 256 x 256 | A flat stepping pad, plain, tinted by the game for coin, point and ruby spaces | a flat round paper-and-clay stepping disc, pale cream, subtle fibre texture, soft rim, empty |
| bag.png | 320 x 320 | Ingredient bag | a plump drawstring cloth bag with a knotted cord, patched, a few chips peeking out of the top, three-quarter view, warm brown |
| flask.png / flask-empty.png | 256 x 256 | Flask full and empty | a small round-bellied glass flask with a cork, glowing lilac potion inside / the same flask, empty and clear |
| ruby.png | 192 x 192 | Ruby | a faceted red gemstone, glossy highlight, tiny sparkle, no setting |
| droplet.png | 192 x 192 | The droplet marker | a single teal potion droplet with a bright highlight and a small ripple ring under it |
| rat.png | 256 x 256 | The rat stone | a cheeky grey rat sitting on a round pebble, long tail curled around it, small ears, seen from above at a slight angle |
| puff.png | 320 x 320 | Explosion smoke | a soft round puff of grey-violet smoke with lighter swirls, fading at the edges, no outline |
| splash.png | 320 x 320 | Splash | a ring-shaped potion splash from above with a crown of drops, teal and white, no outline |
| bubble.png | 192 x 192 | Bubble | a single glossy soap-like bubble, pale teal, a bright highlight, mostly transparent |
| seer.png | 256 x 256 | Fortune-card emblem | a small round crystal ball on a stand with a star inside, purple and gold |
| book.png | 256 x 256 | Ingredient book | a thick closed spellbook seen from above, leather cover, a ribbon, a small leaf emblem, no letters |

## Makers (busts, 384 x 384, round-framed look, the game crops to a circle)
| File | Who | Prompt |
|---|---|---|
| char-wynne.png | Wynne, the Moss Herbalist | a friendly cartoon herbalist bust portrait, long brown braid, green shawl with leaves, calm smile |
| char-odo.png | Odo, the Root Dealer | a cheerful cartoon market dealer bust portrait, straw hat, curly moustache, yellow waistcoat, a root in his pocket |
| char-tamsin.png | Tamsin, the Feather Seer | a clever cartoon seer bust portrait, pointed blue hat with feathers, round spectacles, mysterious grin |
| char-mirabel.png | Mirabel, the Fire Brewer | a bold cartoon brewer bust portrait, red head scarf, singed eyebrows, goggles on forehead, daring smile |

## Backgrounds (no characters in the middle; the cauldron is drawn on top)
| File | Size | Prompt |
|---|---|---|
| table.png | 2560 x 1440 | a night-time village fair seen from above-front: dark violet sky with stars, strings of triangular bunting, two striped tents at the left and right edges, wooden stall counter along the bottom, **big calm empty area in the centre**, warm lantern glow, painted |
| title.png | 2880 x 1620 | the same fair at dusk, four makers (a braided herbalist, a straw-hatted dealer, a feathered seer, a red-scarfed brewer) behind their cauldrons at the left and right, bunting overhead, **keep the top middle calm for the logo**, no text |

## Tool tips
- **Google Flow**: use the style block + one line per generation; once you like one chip, use it as the style reference for the
  rest of the chips (our own art only). Pick 1:1 for chips and pieces, 16:9 for backgrounds. Check Flow's terms that you may use
  the output in a public, tip-supported project.
- **ComfyUI**: SDXL or Flux. Fixed seed, CFG ~5-7 (Flux: guidance ~3.5), 30 steps. For a consistent set use IP-Adapter with your
  first good chip as the style image, or a small style LoRA. Remove backgrounds with a rembg / BiRefNet node.
- Check every chip at **48 px wide** (phone cauldron size). If the picture can't be recognised there, simplify the prompt.

## Swapping in your own paintings
The game ships with painted stand-ins made by `paint/paint.js` (`art/*.webp`, listed in `art/manifest.json`). To use a real
painting, save it as `art/<file name above>.png` (for example `art/chip-R.png`, `art/cauldron.png`) and run `python3 build.py`.
A PNG always wins over the WebP of the same name; the build resizes it to the size in `manifest.json` and re-encodes it as WebP, so
the page stays small. Delete the PNG to go back. To regenerate the stand-ins: `node paint/paint.js` (Playwright Chromium).
