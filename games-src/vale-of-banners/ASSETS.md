# Vale of Banners: pictures (2D only)

Every picture is a named slot. `media/<stem>.webp` fills it with no code change; until then a code-drawn placeholder shows. Manifest: `assets.json`
(style block + items). Check: `python3 games-src/vale-of-banners/asset-check.py` (required / prompted / gaps; gaps must be 0, see `ASSET-CHECK.md`).

Style block (in front of every prompt): Painted flat 2D storybook illustration, soft gouache texture, clean bold shapes with gentle shading, a warm medieval-valley palette of parchment cream, river blue, meadow green, keep-stone green, saffron and crimson banners, thin warm brown outlines, no 3D, no photo realism, no text, no letters, no numbers, no logos.

## Waves

| wave | pictures | by kind |
|---|---|---|
| 1 | 31 | bg 2, board 2, portrait 2, token 25 |
| 2 | 51 | bg 1, icon 7, portrait 4, token 38, ui 1 |
| 3 | 10 | fx 3, portrait 3, token 1, ui 3 |
| total | 92 | |

Wave 1 = title, estate mat, market, table, Wren and Odo, tile back, keep/mine/barge, 8 buildings, 6 goods, worker, silver, die, 4 banners.
Wave 2 = 26 lore tiles, 12 pastures, remaining 4 portraits, 7 icons, tile frame, story map. Wave 3 = result screens, scroll, 3 fx, 3 boss portraits, points token.

Prompt files: `games-src/next-wave/flow-2d/vale-of-banners/prompts-wave<N>-ratio-<w>x<h>.json` (paste into Flow with the `flow_aspect` in the file).
Music cues: `games-src/next-wave/music/vale-of-banners/cues-wave1.json`.

## Drop-in steps (PLAYBOOK, "Finished pictures from the owner")
1. Make the pictures from the prompt files and save each as `<stem>.webp` (or .png) into `assets-inbox/vale-of-banners/`.
2. Register once (orchestrator, at merge time): `python3 games-src/vale-of-banners/register-assets.py` (adds this game's rows to `games-src/next-wave/expected-assets.json`).
   Then run `python3 games-src/scripts/ingest-assets.py` (`--check` = dry run). It crops/resizes to size, writes `games/vale-of-banners/media/<stem>.webp` and runs the wiring and inbox reports.
3. Read the PASS/WARN lines and the "needs wiring code" list, send one worker for any wiring, then ONE `build-all.py --deploy vale-of-banners` call; commit the new `media/` files with the deploy.

## Temporary art (until the Flow pictures arrive)
`temp-art/` holds 71 temporary pictures in the slots' stems: all tiles (keep, mine, barge, 8 buildings, 26 lore, 12 pastures, tile back),
6 goods, worker / silver / points / die / 4 banner tokens, 7 icons. Each is our own code-drawn hex or disc in the game palette with one
icon from game-icons.net on it. Re-make them: `git clone --depth 1 https://github.com/game-icons/icons.git <dir>` then
`node tools/temp-art.js <dir>`. At deploy copy them in: `cp games-src/vale-of-banners/temp-art/*.webp games/vale-of-banners/media/`
(skip any stem that already has a Flow picture). A Flow file with the same stem replaces each one with zero code changes.
Boards, backgrounds, portraits, fx and result screens stay code-drawn (no free pack fitted in the time box).
Kenney (CC0) was the first choice, but kenney.nl answers 403 to this machine, so nothing was taken from it.
No pictures from print-and-play sheets, workshop mods or fan re-designs were used (none had an explicit reuse licence checked here).

### Credits
| files | source | author | licence |
|---|---|---|---|
| icons on tile-keep, tile-mine, tile-barge, tile-bld-hall/carp/chapel/mkt/mint/tower/store, tile-back, lore books/scrolls, pastures sheep/goose, goods wool/cloth, token-worker/silver/die/banners, icons | https://game-icons.net (repo https://github.com/game-icons/icons) | Delapouite | CC BY 3.0 https://creativecommons.org/licenses/by/3.0/ |
| icons on tile-bld-inn, lore scroll/book/quill, goods cheese/honey/cider/salt, token-points, icon-season | same | Lorc | CC BY 3.0 |
| icons on tile-pas-goat-*, tile-pas-pig-* | same | Skoll | CC BY 3.0 |
| icon on one lore book | same | Willdabeast | CC BY 3.0 |
The credit line is also in the game's Menu > About.
