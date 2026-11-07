# Crown City Smash: asset check (W346)

Checked on branch `shelf/W346-assets-a`. Source: `data.js` (CARDS, COSTUMES, WTILES, EVO), `campaign.json` (portraits), `media.js` and `art.js` (the `media/pc-${id}.webp` card loader), `paint.js` / `scn.js` / `skin.css`, the shell `shell/gx-skin.js`, `games/crown-city-smash/media/media.json`, and `games/crown-city-smash/media/` (228 files).

Note: the curse cards (`CURSES`, 24 entries) have no picture slot in the code (`art.js` draws pictures for power cards only), so they are not counted as required.

## Counts
| item | count |
|---|---|
| required pictures | 236 (182 power-card pictures, 9 cast portraits, 9 avatars, 1 cutout, 33 other wired stems, 2 star icons) |
| required videos | 3 (`crown-ch4/7/10-boss.mp4`, all delivered) |
| delivered | 215 wired picture files + 3 videos (182 `pc-*`, 33 others) |
| prompted before this check | 0 (the Flow files hold pose and table prompts, not these stems) |
| gaps added | 21 (see table) |
| not wired | 9 (see table) |

Missing on disk before this check: the 9 `camp-*` portraits and 9 `cut-*` avatars named in `media.json`, plus `cut-clampede` (cutout). They are not in `media/`. `games-src/kot/media/cast-grid.png` may be a source sheet for these; I did not open it, so I did not confirm that.

Music: the code references one cue, `music.main`. `games/crown-city-smash/music/` holds 10 files (main, fight, tavern, victory, defeat, a and b). I did not confirm which of them the code plays, so this is not verified.

## Gaps added
New file: `games-src/next-wave/flow-2d/crown-city-smash/prompts-gaps-ratio-1x1.json` (21 prompts, 1:1, style block copied from `prompts-wave8.json`). The portrait and avatar prompts reuse each monster's `<name>-idle` description.

| stem | slot already named in | prompt file |
|---|---|---|
| `camp-boltbox` | media.json (portraits) | `next-wave/flow-2d/crown-city-smash/prompts-gaps-ratio-1x1.json` |
| `camp-bramblebat` | media.json (portraits) | `next-wave/flow-2d/crown-city-smash/prompts-gaps-ratio-1x1.json` |
| `camp-cortexa` | media.json (portraits) | `next-wave/flow-2d/crown-city-smash/prompts-gaps-ratio-1x1.json` |
| `camp-dot` | media.json (portraits) | `next-wave/flow-2d/crown-city-smash/prompts-gaps-ratio-1x1.json` |
| `camp-glacyx` | media.json (portraits) | `next-wave/flow-2d/crown-city-smash/prompts-gaps-ratio-1x1.json` |
| `camp-magmaw` | media.json (portraits) | `next-wave/flow-2d/crown-city-smash/prompts-gaps-ratio-1x1.json` |
| `camp-shroomhulk` | media.json (portraits) | `next-wave/flow-2d/crown-city-smash/prompts-gaps-ratio-1x1.json` |
| `camp-squidrik` | media.json (portraits) | `next-wave/flow-2d/crown-city-smash/prompts-gaps-ratio-1x1.json` |
| `camp-voltusk` | media.json (portraits) | `next-wave/flow-2d/crown-city-smash/prompts-gaps-ratio-1x1.json` |
| `cut-boltbox` | media.json (avatars) | `next-wave/flow-2d/crown-city-smash/prompts-gaps-ratio-1x1.json` |
| `cut-bramblebat` | media.json (avatars) | `next-wave/flow-2d/crown-city-smash/prompts-gaps-ratio-1x1.json` |
| `cut-cortexa` | media.json (avatars) | `next-wave/flow-2d/crown-city-smash/prompts-gaps-ratio-1x1.json` |
| `cut-dot` | media.json (avatars) | `next-wave/flow-2d/crown-city-smash/prompts-gaps-ratio-1x1.json` |
| `cut-glacyx` | media.json (avatars) | `next-wave/flow-2d/crown-city-smash/prompts-gaps-ratio-1x1.json` |
| `cut-magmaw` | media.json (avatars) | `next-wave/flow-2d/crown-city-smash/prompts-gaps-ratio-1x1.json` |
| `cut-shroomhulk` | media.json (avatars) | `next-wave/flow-2d/crown-city-smash/prompts-gaps-ratio-1x1.json` |
| `cut-squidrik` | media.json (avatars) | `next-wave/flow-2d/crown-city-smash/prompts-gaps-ratio-1x1.json` |
| `cut-voltusk` | media.json (avatars) | `next-wave/flow-2d/crown-city-smash/prompts-gaps-ratio-1x1.json` |
| `cut-clampede` | media.json (cutouts) | `next-wave/flow-2d/crown-city-smash/prompts-gaps-ratio-1x1.json` |
| `ui-star-on` | media.json (none: UI star, shell GXSK stars) | `next-wave/flow-2d/crown-city-smash/prompts-gaps-ratio-1x1.json` |
| `ui-star-off` | media.json (none: UI star, shell GXSK stars) | `next-wave/flow-2d/crown-city-smash/prompts-gaps-ratio-1x1.json` |

The two star icons (`ui-star-on`, `ui-star-off`) are drawn by the shell only when `GXSK.init` has `stars: 1`, which this game sets. `media.json` has no UI list, so their stems are not in a manifest slot. I did not edit `media.json` (it sits in the built `games/` folder). Owner to decide where UI stems should be listed.

## Not wired (file exists, no code loads it)
| file | note |
|---|---|
| `back-brass-beetle.webp`, `back-bulletin.webp` | no code loads them |
| `ui-button-go.webp`, `ui-button-power.webp`, `ui-button-ghost.webp`, `ui-button-pink.webp`, `ui-button-yellow.webp` | code uses the `-c` versions |
| `ui-dice-tray.webp`, `ui-hud-chip.webp` | code uses `ui-dice-tray-c`, `ui-hud-chip-c` |

Not checked: nothing skipped.
