# Wildmark pictures

Every picture the game shows is a named slot in `assets.json` (44 slots). A file `games/wildmark/media/<stem>.webp` fills
its slot on the next build with zero code changes; without it the code-drawn placeholder shows (`src/art.js`: terrain
textures, token discs with animal silhouettes, plain panels). Backgrounds and boards are cropped to cover, everything
else is contained at its own aspect, never stretched. Re-generate the slot list and prompts with `python3 gen-assets.py`.

| Wave | Slots | What |
|------|-------|------|
| 1 (first minute) | 17 | title-bg, table-bg, 5 terrain textures (ter-*), 6 tokens (tok-bear/elk/salmon/hawk/fox/acorn), 4 portraits (ranger, rowan, pip, bram) |
| 2 (every piece the rules use) | 15 | 5 scoring cards set A (card-*-a, used now), 5 cards set B (next), 5 portraits (sorrel, quill, linnet, oake, warden) |
| 3 (polish) | 12 | result-win, result-lose, scoring cards sets C and D (next) |

Prompt files (Google Flow, 2D only, no text in pictures): `games-src/next-wave/flow-2d/wildmark/prompts-waveN-ratio-WxH.json`.

## Drop-in (3 steps; PLAYBOOK "Finished pictures from the owner")
1. Put the finished files, named `<stem>.png/.jpg/.webp`, in `assets-inbox/wildmark/`.
2. Run `python3 games-src/scripts/ingest-assets.py` (it converts to WebP at the slot size and writes `games/wildmark/media/<stem>.webp`).
   The slots must be registered once: `python3 games-src/wildmark/register-assets.py` (orchestrator, at merge time).
3. Rebuild (`python3 games-src/scripts/build-all.py wildmark`): `build.py` lists the files present and the page uses them.
