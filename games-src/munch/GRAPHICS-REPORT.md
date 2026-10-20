# Doorkick Dungeon: graphics upgrade report

The graph-paper "doodle" look is now a candle-lit tavern table in 2D. The game name, rules, engine, AI and every test hook are unchanged. It is still one self-contained file: `python3 build.py` writes `doorkick.html`, which is 321 KB (it was 222 KB).

## What changed

**Card frames (ui.js `cardHTML`, head.html)**
- Every card now has these layers:
  - a door frame in dark bronze and oak, or a treasure frame in gilt
  - a thin foil edge highlight, and a foil sheen that sweeps across on hover
  - a ribbon title banner coloured by card type: monster crimson, curse violet, race teal, class blue, item bronze, one-shot emerald, level amber, boost orange, special slate
  - a framed art window with a vignette
  - a faceted gem: the level on monsters, the bonus on items and boosts
  - a type plaque that also carries conditions (for example "1 hand · Elves")
  - a parchment text box
  - a coin badge for gold, or a chest badge with the treasure count and levels on monsters
- Sizes come from registered `@property` lengths (`--w`, `--u`), so every card size from 46 px to 210 px stays in proportion.
- The door and treasure decks are real stacks. Each has a printed card back (an oxblood door with iron bands, or a teal back with a gilded chest), and its visible thickness grows with the number of cards left, with a brass count coin.

**Illustrated art (art.js, fully rewritten)**
- All 147 cards are drawn as shaded SVG with:
  - radial-gradient body shading and gloss highlights
  - a heavy outer contour with lighter inner lines
  - ground shadows, and a dungeon-arch backdrop or halo behind each figure
- Monsters use 13 archetypes, mapped from their names: blob, imp/goblin, skeleton/mummy, dragon, furry beast, tentacled, plant, rock golem, bat, bugs, toad, siren and the horde. They get extras such as horns, glasses, tie, crown, helmet and wings. A crimson aura appears from level 12.
- Items are drawn to match their names, for example a bucket, antlered helm, cheese grater, sousaphone, buzzsaw, 10-foot pole and flip-flops. Potions have liquid colours tied to their names.
- Heroes are portrait busts. Curses are storm clouds, each with its own motif. There is art for level-ups, boosts and specials too.

**Icons**
- There is one consistent 24 px SVG icon set (44 symbols, drawn in `currentColor`).
- An `emo()` pass swaps every raw emoji in rendered text for its icon. It only touches text nodes, never attributes. This covers the header, the dock, the log, the coach warnings and the toasts.

**Table and chrome**
- The tavern is built from textures that `gfx.js` generates once on a canvas:
  - wood planks, leather and parchment noise (tileable value noise)
  - the table (with candle light and vignette), the wall, the leather mat, the bar strip and the parchment panel, each baked into one image
- The rest of the table and chrome:
  - The table keeps its 3D tilt and has a brass-bound rim.
  - Rivals sit on tooled-leather plaques, and your area is a stitched leather mat.
  - The dock and popups are parchment ledgers with leather headers.
  - Buttons are embossed: parchment, gold lacquer for the main action, crimson and emerald lacquer, with hover and press states.
- Fonts: Cinzel Decorative for the logo, Cinzel for headings, Alegreya SC for card names and Alegreya for body text.
- The die is ivory with red pips.

**Motion (gfx.js)**
- Cards you receive are dealt from the right deck: they fly in, scale and rotate, one after another.
- A card you play flies along an arc from your hand to where it lands (the fight, the gear row or a discard pile). The card waiting there appears as it arrives.
- A kicked door card flips over, showing its back first. A monster slams onto the table.
- A fight opens with the two medallions (heroes and monsters) sliding in and clashing, with crossed swords popping between them. When a total changes, its number bumps and a floating +N or −N rises from it.
- Cards lift on hover, and the hand is laid out in a slight fan.
- On High only, the candle light flickers and embers drift over the board.

**Graphics setting**
- High, Medium and Low can be chosen from the header gem button or the ☰ menu. The choice is saved in `localStorage` as `dkd_gfx` (inside try/catch).
- If nothing is saved, it picks Medium on phones and small screens and High on desktop.
- A frame watchdog steps down one level after 3 seconds of frames slower than 45 ms. It ignores the first 6 seconds after load and 2.5 seconds after each re-render.
- What each level turns off:
  - Low: card flights, clash pops, the flicker and the embers.
  - Medium: the flicker and the embers.

**Theme text:** the layout comment now describes the tavern table. Nothing in the game text needed changing.

## Performance: how the cost was brought down
The first version was very slow under SwiftShader, with seconds per frame. Five changes brought it back:
- Large blurred shadows became hard or ring shadows. This was the biggest cost.
- Stacked gradient backgrounds were baked into single images.
- Each card's SVG is flattened once into a WebP bitmap (via a `blob:` SVG image and a canvas). Painting a card is now a plain image draw, not hundreds of live SVG nodes.
- Container-unit sizing moved to registered `@property` lengths, which cut the board's style and layout cost from about 90 ms to about 25 ms.
- Textures are held as short `blob:` URLs instead of data URLs inside custom properties.

In jsdom there is no canvas, blob or animation. The art is replaced by an empty `<svg class="art">`, card backs are left out, and every motion path is skipped. The CSS fallbacks are gradients.

## Screenshots
Everything is in `SP/munch-gfx/`:
- **Before:** `before/{d,m}_{start,main,fight,card}.png`
- **After:** `after/{d,m}_{start,main,fight,card}.png`
- **Art sheets:** `art_monster_*.png`, `art_item_*.png`, `art_oneshot_*.png`, `art_other_*.png`

`d` is 1366x768 and `m` is 390x844.

## Performance numbers
These were measured with SwiftShader in headless Chromium on an idle container (load average 0.3), with `munch-gfx/cmp2.js`. Each figure is the median of 3 interleaved runs, measured right after a door kick.

| Build | Frame ms, 1.5 s after the kick | Frame ms, 6 s after (settled) | `render()` ms |
|---|---|---|---|
| Before | 18.4 | 18.5 | 19–20 |
| After, Low | 93.7 | 18.1 | 29–35 |
| After, Medium | 87.0 | 162.4 | 28–34 |
| After, High | 1013.5 | 632.4 | 32–40 |

- Once the cards have been flattened to bitmaps, Low matches the old build.
- Medium settled at 162 ms in this run. Medium has no always-on effects, so this is more likely late raster work or noise than a steady cost, but it was not isolated.
- High's embers and candle flicker cost a lot under software rendering. They are compositor-only effects that a laptop GPU handles easily.
- Under SwiftShader the watchdog steps High down after about 9 seconds (6 seconds of grace plus 3 seconds of slow frames).
- In jsdom, the CPU time of `warn-check.js 3` is 35.6 s (it was 34.9 s before).

## Tests
All were run on the final build. The build and `node --check x.js` pass.

| Test | Result |
|---|---|
| `rules-test.js` | 46 passed, 0 failed |
| `cards-test.js` | exit 0. It is a data fixture and prints nothing, as before. |
| `force.js` | 147 cards checked, 0 problems |
| `gauntlet.js doorkick.html 20 80` | 20 games, 0 errors; average 52.0 turns (min 20, max 81) |
| `click.js` | total errors 0 (modes F and hot, each with animation on and off) |
| `warn-check.js 50` | 482 situations, 482 warnings shown, 0 missed, 0 false alarms, 0 errors |
| `board-test.js` | all 10 viewport and colour-scheme combinations "ok": 1366x768, 1920x1080, 768x1024 and 390x844 in light and dark, plus the 1366x722 and 390x798 iframe sizes. 0 layout problems. |
| `newcomer.js` 1366x768 | game finished at turn 47, 77 clicks, 0 errors |
| `newcomer.js` 390x844 | game finished at turn 47, 76 clicks, 0 errors |

Notes on the test runs:
- The first `warn-check.js 50` run found a crash in the new clash markup when a fight has no monsters left (`cb.mons[0]` was undefined). This is fixed, and the rerun above has 0 errors.
- `board-test.js` takes longer than the 30-minute background limit on this machine. The two iframe sizes were therefore run separately (`munch-gfx/board-part.js`, the same test restricted to a list of sizes), and they printed "ALL OK".
- `gauntlet.js` with its default of 40 turns cut 13 of 20 games short, so the run above uses a limit of 80 turns.
- `force.js` still lists the same 7 cards whose names never appear in the log, as before the change.
