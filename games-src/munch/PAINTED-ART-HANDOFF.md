# Doorkick Dungeon: painted card art hand-off (laptop → Linux session, 2026-10-08)

The laptop made the pictures; the Linux session wires them in, tests and deploys (owner rule: laptop for media only).

## What is here
- `art/<k>.webp`: 44 paintings, 320×320 WebP, about 900 KB together (about 1.2 MB as base64). `<k>` is the card key `k` in `cards.js`:
  all 37 monsters and the 7 class/race cards (warrior, wizard, thief, cleric, elf, dwarf, halfling).
- `art/manifest.json`: `items` maps id → file base name, and `size` gives `[320, 320]` for each. This is the same shape as `../kaiten/art/manifest.json`.
- The originals are 1024 px JPEGs on the laptop in `Desktop\game-assets\cards\doorkick\`, with the prompts in `prompts.json`. The square crops were made by `Desktop\game-assets\prep_doorkick_art.py`, which trims the paper border.
- Licence: generated with Google Flow (Nano Banana) from our own prompts. They describe original monsters and never name or reference the original game. Add a line to the game's credits and licence log.
- Still drawn in code: items, one-shots, curses, levels and the two special cards. The deck mixes painted and drawn art until those get pictures too.

## To do (Linux)
1. **Embed.** In `build.py`, copy `art_js()` from `../kaiten/game/build.py`, with `ART = 'art'` and `var DK_ART = {...}`. Insert it as a script before `art.js` in the file list.
   - Budget: `doorkick.html` is about 2.0 MB now and should be about 3.2 MB after this. The cap is about 4 MB.
2. **Use it.** In `art.js`, at the top of `svgArt(def, key, cls)`: when `typeof DK_ART !== 'undefined' && DK_ART[def.k]`, return
   `<img class="${cls||'art'}" src="${blobURL(def.k)}" alt="" draggable="false">`.
   - Make `blobURL` turn each data URI into a blob URL once, like `KK_ART` in `../kaiten/game/ui.js` lines 10-16.
   - Skip the `pic()`/bitmap pass for these: they are already bitmaps.
   - The card art window is wider than tall (the procedural backdrop was drawn past the 120 box). Give the painted `<img>` `object-fit: cover` so the square picture fills the window.
3. **jsdom path.** Keep the current `IS_JSDOM` branch (empty `<svg>`), or check that `arttest.js`/`cards-test.js` accept an `<img>` there.
4. **Check on a phone (the art window is small).** Monsters must still read at the smallest size. Hand/bench cards may not need the full picture.
5. **Tests.** Run `arttest.js`, `cards-test.js`, `rules-test.js`, `board-test.js`, `clarity-test.js`, `gauntlet.js`, `click.js`, `click-ph.js` and `lay-phone.js` (the usual build-all phone-check and sweep). Then build, commit and deploy as in `../kot/MEDIA-HANDOFF.md`.

## Optional
- `slurper.mp4` (8 s, 16:9, laptop `cards\doorkick\`) is a test clip of the Sock Slurper. It is not needed for the cards; it could become a monster-reveal clip, like the Crown City boss clips.
