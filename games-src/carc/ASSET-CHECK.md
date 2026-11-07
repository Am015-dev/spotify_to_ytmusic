# Rampart and Vine: asset check (W348)

Checked 7 Nov 2026 on branch `shelf/W348-assets-c`. Source of truth: the code, data and campaign files named below.

## Counts

| measure | count |
|---|--:|
| required (loaded by the game) | 83 |
| delivered (games/rampart-and-vine/media) | 85 |
| prompted (required, no file) | 0 |
| gaps added | 0 |
| not wired | 2 |
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
| `ui-button-go` | no literal reference; the game uses ui-button-go-c |
| `ui-button-power` | no literal reference; the game uses ui-button-power-c |

## Manifest note
`games-src/next-wave/expected-assets.json` lists 63 art rows (for example card-frame, scrim-plate, baron-idle) for this game, but none of those stems is loaded by the code, so none is a required picture. The manifest does not name the stems the game actually uses, so the "named slot" check fails for every delivered file. Owner decision needed: rewrite the rows for this game to the stems in use, or keep them as a kit list.

## Not checked
The 19 model3d rows (3D, not part of the 2D check). Phone-width and dark-mode checks were not run.
