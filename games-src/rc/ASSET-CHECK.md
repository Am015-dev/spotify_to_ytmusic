# Shipwreck Isle: asset check (W348)

Checked 7 Nov 2026 on branch `shelf/W348-assets-c`. Source of truth: the code, data and campaign files named below.

## Counts

| measure | count |
|---|--:|
| required (loaded by the game) | 105 (101 published + 4 source-only beasts and items) |
| delivered in games/shipwreck-isle (media 71, art 50) | 121 |
| delivered in games-src/rc/art only (not published) | 28 |
| prompted (required, no file) | 1 (char-soldier: prompt in prompts-wave6.json) |
| gaps added | 0 |
| not wired (media) | 20 |
| not wired (source art: disc, wreck, char) | 24 |
| music cues delivered | 10 of 10 |

## Method
- **Required**: each picture the game loads (literal `.webp` references in the game's files and its shell kit, template ids expanded from the data tables, campaign portraits). Music: the 10 cues the code names (defeat, fight, main, tavern, victory; a and b).
- **Delivered**: the file is on disk in `games/<slug>/` (media, art or cards folder). Music cues are all present in `games/<slug>/music/`.
- **Prompted**: no file, but a Google Flow prompt exists (`games-src/next-wave/flow-2d/<slug>/`).
- **Gap**: required, no file, no prompt. None found.
- **Not wired**: a file on disk that the game code never loads by name or template. Report only; no code was changed.

## Gaps added
None. Every required picture is delivered or prompted, so no manifest row or prompt file was added.

## Not wired (delivered, never loaded)
| file | note |
|---|---|
| `back-cross` | no reference by name in the game or shell |
| `back-lifeboat` | no reference by name in the game or shell |
| `end-lose` | no reference by name in the game or shell |
| `end-win` | no reference by name in the game or shell |
| `hex-beach` | no reference by name in the game or shell |
| `hex-fog-a` | no reference by name in the game or shell |
| `hex-fog-b` | no reference by name in the game or shell |
| `hex-fog-c` | no reference by name in the game or shell |
| `hex-hills` | no reference by name in the game or shell |
| `hex-mountains` | no reference by name in the game or shell |
| `hex-plains` | no reference by name in the game or shell |
| `hex-river` | no reference by name in the game or shell |
| `table-beach` | no reference by name in the game or shell |
| `table-beach-phone` | no reference by name in the game or shell |
| `table-homestead` | no reference by name in the game or shell |
| `table-temple-ruins` | no reference by name in the game or shell |
| `title-phone` | no reference by name in the game or shell |
| `ui-button-go` | no reference by name in the game or shell |
| `ui-button-power` | no reference by name in the game or shell |
| `ui-row-c` | no reference by name in the game or shell |
| `disc-* (17: candles, fallentree, goat, healherbs, herbs, larvae, leaves, machete, poison, thorns, tobacco, treasure, veggies, sc1-sc4)` | source art, not loaded yet (the handoff lists these as still to wire) |
| `wreck-* (3: crates, dinghy, seachest)` | source art, not loaded yet (the handoff lists these as still to wire) |
| `char-* (4: carpenter, cook, explorer, friday)` | source art, not loaded yet (the handoff lists these as still to wire) |

## Manifest note
`games-src/next-wave/expected-assets.json` lists 70 art rows and 12 model3d rows for this game, but none of those stems is loaded by the code, so none is a required picture. The manifest does not name the stems the game actually uses, so the "named slot" check fails for every delivered file. Owner decision needed: rewrite the rows for this game to the stems in use, or keep them as a kit list.

## Not checked
Publishing the 28 source-only files to games/shipwreck-isle/art is a build step (not done here, to avoid committing media). Until then the cards show the fallback. Phone versions were not checked.
