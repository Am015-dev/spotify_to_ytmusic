# Final Approach: asset check (W346)

Checked on branch `shelf/W346-assets-a`. Source: `art/manifest.json` (27 items, 44 files in `art/`), `games/final-approach/media/` (58 files), `campaign.json` (11 portraits, all delivered), `src/ui13.js` (shell sets), and the shell.

## Counts
| item | count |
|---|---|
| required pictures | 78 (27 art items, 51 media stems the code loads) |
| delivered | 85 (27 art items, 58 media files) |
| prompted | 0 |
| gaps added | 0 |
| not wired | 7 |

Music: the `music/` folder holds the cue files. I did not check the cue names against the code, so this is not verified.

Flow prompts: the art items were delivered before this check, so they are not counted as gaps.

## Gaps added
None. Every required item is delivered.

## Not wired (file exists, no code loads it)
| file | note |
|---|---|
| `title-phone.webp` | no code path loads it |
| `ui-altbar.webp`, `ui-phrase.webp`, `ui-sheet.webp` | code uses the `-c` versions |
| `ui-button-go.webp`, `ui-button-power.webp`, `ui-button-roll.webp` | code and shell use the `-c` versions |

Not checked: nothing skipped.
