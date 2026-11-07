# Short Fuse: asset check (W348)

Checked 7 Nov 2026 on branch `shelf/W348-assets-c`. Source of truth: the code, data and campaign files named below.

## Counts

| measure | count |
|---|--:|
| required (loaded by the game) | 74 |
| delivered (games/short-fuse/media 54, cards 32) | 86 |
| prompted (required, no file) | 0 |
| gaps added | 0 |
| not wired | 12 |
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
| `table-clockface` | no reference by name in the game or shell |
| `table-tower-floor` | no reference by name in the game or shell |
| `table-workbench` | no reference by name in the game or shell |
| `table-workbench-phone` | no reference by name in the game or shell |
| `title-phone` | no reference by name in the game or shell |
| `ui-button-go` | no reference by name in the game or shell |
| `ui-button-power` | no reference by name in the game or shell |
| `ui-eq-frame` | no reference by name in the game or shell |
| `ui-job-sheet` | no reference by name in the game or shell |
| `ui-nameplate` | no reference by name in the game or shell |
| `ui-rack` | no reference by name in the game or shell |
| `wire-tile-frame` | no reference by name in the game or shell |

## Manifest note
`games-src/next-wave/expected-assets.json` lists 54 art rows and 10 model3d rows for this game, but none of those stems is loaded by the code, so none is a required picture. The manifest does not name the stems the game actually uses, so the "named slot" check fails for every delivered file. Owner decision needed: rewrite the rows for this game to the stems in use, or keep them as a kit list.

## Not checked
Characters (9), equipment (18) and personal items (5) are all on disk as the cards folder, and the game loads them by id. Phone versions were not checked.
