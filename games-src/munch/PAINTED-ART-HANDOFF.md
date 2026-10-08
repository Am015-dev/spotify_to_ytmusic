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

## Optional
- `slurper.mp4` (8 s, 16:9, laptop `cards\doorkick\`) is a test clip of the Sock Slurper.
- Boss reveal clips are being made for the level-16+ monsters (wyrm, inferno, tentacles, pharaoh, twins, skygrif). They are separate files, not inlined, like the Crown City boss clips. A separate hand-off will follow.
