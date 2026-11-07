# Sands of Qamar: asset check (W348)

Checked 7 Nov 2026 on branch `shelf/W348-assets-c`. Source of truth: the code, data and campaign files named below.

## Counts

| measure | count |
|---|--:|
| required (loaded by the game) | 160 |
| delivered (games/sands-of-qamar/media) | 169 |
| prompted (required, no file) | 0 |
| gaps added | 0 |
| not wired | 9 |
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
| `back-copper` | no reference by name in the game or shell |
| `back-lamp` | no reference by name in the game or shell |
| `table-court` | no reference by name in the game or shell |
| `table-night` | no reference by name in the game or shell |
| `table-palace` | no reference by name in the game or shell |
| `table-workshop` | no reference by name in the game or shell |
| `ui-button-go` | no reference by name in the game or shell |
| `ui-button-power` | no reference by name in the game or shell |
| `ui-seat-chip` | no reference by name in the game or shell |

## Manifest note
`games-src/next-wave/expected-assets.json` lists 74 art rows (for example dcard-plate, camp-*-idle, token-*) for this game, but none of those stems is loaded by the code, so none is a required picture. The manifest does not name the stems the game actually uses, so the "named slot" check fails for every delivered file. Owner decision needed: rewrite the rows for this game to the stems in use, or keep them as a kit list.

## Not checked
The 13 model3d rows (3D, not part of the 2D check). The djinn, tile and goods lists were taken from the data in node, not by reading every line.
