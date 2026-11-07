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
