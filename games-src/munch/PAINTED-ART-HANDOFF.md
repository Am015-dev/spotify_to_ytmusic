# Doorkick Dungeon: painted card art hand-off (laptop → Linux session, 2026-10-08)

The laptop made the pictures; the Linux session wires them in, tests and deploys (owner rule: laptop for media only).

## What is here
- `art/<k>.webp`: 147 paintings, **one for every card key `k` in `cards.js`** (checked: none missing), 1.38 MB together, about 1.85 MB as base64.
  - The 37 monsters and 7 class/race cards are 256×256, because players look at them most.
  - The other 103 (items, one-shots, curses, level cards, specials, monster boosts) are 224×224.
- `art/manifest.json`: `items` maps id → file base name, and `size` gives each picture's `[w, h]`. This is the same shape as `../kaiten/art/manifest.json`.
- The originals are 1024 px JPEGs on the laptop in `Desktop\game-assets\cards\doorkick\`, with the prompts in `prompts.json` (monsters/heroes) and `prompts2.json` (the rest). The square crops were made by `Desktop\game-assets\prep_doorkick_art.py`, which trims the paper border.
- Licence: generated with Google Flow (Nano Banana) from our own prompts. They describe original monsters and never name or reference the original game. Add a line to the game's credits and licence log.

## To do (Linux)
1. **Embed.** In `build.py`, copy `art_js()` from `../kaiten/game/build.py`, with `ART = 'art'` and `var DK_ART = {...}`. Insert it as a script before `art.js` in the file list.
   - Budget: `doorkick.html` is about 2.0 MB now and should be about **3.9 MB** after this, just under the ~4 MB cap. If it goes over, re-run the prep script with lower sizes (for example 192 px for the non-monster cards). Don't drop pictures.
   - Because the art is now about half the file, consider loading `DK_ART` lazily (blob URLs on first use). Measure the phone start-up time before and after.
2. **Use it.** In `art.js`, at the top of `svgArt(def, key, cls)`: when `typeof DK_ART !== 'undefined' && DK_ART[def.k]`, return
   `<img class="${cls||'art'}" src="${blobURL(def.k)}" alt="" draggable="false">`.
   - Make `blobURL` turn each data URI into a blob URL once, like `KK_ART` in `../kaiten/game/ui.js` lines 10-16.
   - Skip the `pic()`/bitmap pass for these: they are already bitmaps.
   - The card art window is wider than tall (the procedural backdrop was drawn past the 120 box). Give the painted `<img>` `object-fit: cover` so the square picture fills the window.
3. **jsdom path.** Keep the current `IS_JSDOM` branch (empty `<svg>`), or check that `arttest.js`/`cards-test.js` accept an `<img>` there.
4. **Check on a phone (the art window is small).** Monsters must still read at the smallest size. Hand/bench cards may not need the full picture.
5. **Tests.** Run `arttest.js`, `cards-test.js`, `rules-test.js`, `board-test.js`, `clarity-test.js`, `gauntlet.js`, `click.js`, `click-ph.js` and `lay-phone.js` (the usual build-all phone-check and sweep). Then build, commit and deploy as in `../kot/MEDIA-HANDOFF.md`.

## Boss reveal clips (new, 2026-10-08)
- `games/doorkick-dungeon/media/doorkick-<key>-boss.mp4`: 6 clips, each 6 s, 854×480, H.264 main, **no audio**, faststart, 363–988 KB (3.6 MB in total).
  - Keys: `wyrm` (Uranium Wyrm, 20), `inferno` (Horned Inferno, 18), `tentacles` (Tentaclopolis, 18), `pharaoh` (Pharaoh Wrappington, 16), `skygrif` (Stampeding Skygrif, 16), `dread` (The Nameless Dread, 14).
  - The Grave Twins (16) has no clip: Flow refuses to take its card picture.
- The raw 1280×720 Flow files are in `media/<key>-boss-raw.mp4`.
- Made with Google Flow (Omni 1.1 Flash), image-to-video from each monster's own card painting. Prompts are in laptop `game-assets/cards/doorkick/video_prompts.json`.
- **Wiring (Linux):** play the clip once per game when that monster is first revealed (door kicked open), over the board.
  - Make it skippable (tap, Esc), never blocking: the fight UI is ready underneath.
  - Muted autoplay with `playsinline`. Play the game's own `roar`/`door` sound with it.
  - Skip clips under `prefers-reduced-motion` and in the jsdom tests.
  - Clips are separate files (not inlined), so they don't count against the 4 MB page cap.
  - Reuse Crown's clip player in `../kot/media.js` if it fits.

## Portraits, card backs and tables (new, 2026-10-08)
All files are in `games/doorkick-dungeon/media/` (separate files, not inlined), 780 KB in total. They are Flow paintings in the card style; prompts are in laptop `game-assets/cards/doorkick/extras/*.json`.
- **Portraits** `camp-<id>.webp`, 256×256: `hobb`, `pip`, `tansy`, `bodkin`, `grub`, `morwen`, `wrenna`.
  - These are exactly the file names `campaign.json` already uses. Set `artBase: 'media/'` in the `GXC.init` call in `campaign.js` and the story screens show them instead of the emoji (`gx-campaign.js` line ~138).
  - Also use them on the rival seats, the title cast list, the diary and the win screen. Pip is the player's hero.
- **Card backs** `back-<id>.webp`, 300×426 (card shape 100:142):
  - `door` and `treasure` are the default deck backs (piles and face-down cards).
  - `cellar-oak`, `corridor-brass` and `crypt-bone` are the campaign `cardback` unlocks with the same ids.
- **Tables** `table-<id>.webp`, 1376×768 (`table-tavern-phone` is 768×1376).
  - `tavern` is the new default table, with a clear centre for the door/fight area. Use it in place of the CSS wood in `tbl.css`; that is where `--img-table` is set.
  - `vault-stone` and `golden-vault` are the campaign `table` unlocks.
  - Keep the CSS wood as the fallback while the image loads, and on Low graphics.

## Title and end-screen art, music prompts (new, 2026-10-08)
- `media/title.webp` (1302×726) and `media/title-phone.webp` (744×1334) are the title-screen key art: the party kicking open the cellar door.
  - The top has clear space for the "Doorkick Dungeon" logo text.
  - Put the rules text below the art or behind a "How to play" button instead of the current wall of text.
- `media/end-win.webp`: tavern feast with the golden boot. `media/end-lose.webp`: the hero sitting dazed in socks while monsters steal the gear.
  - Use them on the game-over screen behind the result.
- `MUSIC-PROMPTS.txt`: text-to-music prompts for a tavern menu loop, a new main loop, a fight loop, victory and defeat cues, stingers to replace the sax jingles, and a tavern ambience loop.
  - The music isn't made yet: the owner generates it in a music tool.
  - The tool's licence must allow public game use. Log each file in `ASSETS.md`.

## Optional
- `slurper.mp4` (8 s, 16:9, laptop `cards\doorkick\`) is a test clip of the Sock Slurper.
