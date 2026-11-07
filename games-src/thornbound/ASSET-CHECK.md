# thornbound: asset check (W349)

Checked 2026-11-07 on branch `shelf/W349-assets-d`. Manifest: `games-src/next-wave/expected-assets.json` (slug `thornbound`). Prompts: `games-src/next-wave/flow-2d/thornbound/`.

REQUIRED = every manifest slot for this game + every file in `games/thornbound/media/` + `cards/`. DELIVERED = file present. PROMPTED = no file, Flow prompt present. 3D items (`kind: model3d`) have prompts in the 3D set and are counted apart. NOT WIRED = delivered file that no game source names, literal or dynamic.

## Counts

| required | delivered | prompted 2D | prompted 3D | gaps added | not wired |
|---|---|---|---|---|---|
| 183 | 114 | 59 | 10 | 0 | 9 |

## Gaps added

None. Every manifest slot has a 2D prompt or a 3D prompt (10 3D slots, all with prompts), so nothing was added.

## Not wired

| file | note |
|---|---|
| `games/thornbound/media/back-council-seal.webp` | no literal or dynamic name in the game source |
| `games/thornbound/media/back-moth-wing.webp` | no literal or dynamic name in the game source |
| `games/thornbound/media/table-lantern-night.webp` | no literal or dynamic name in the game source |
| `games/thornbound/media/table-throne-hall.webp` | no literal or dynamic name in the game source |
| `games/thornbound/media/ui-button-go.webp` | no literal or dynamic name in the game source |
| `games/thornbound/media/ui-button-power.webp` | no literal or dynamic name in the game source |
| `games/thornbound/media/ui-round-shield.webp` | no literal or dynamic name in the game source |
| `games/thornbound/media/ui-sheet.webp` | no literal or dynamic name in the game source |
| `games/thornbound/media/ui-sheet-head-c.webp` | no literal or dynamic name in the game source |

Matched only by a dynamic name (verify): `end-lose`, `end-win`.

## Manifest slots no game source names yet

59 2D slots. Prompted, but the game does not load them, so no file is needed yet: `back-moth-ossuary`, `board-plate`, `end-lose-b`, `end-lose-c`, `end-win-b`, `end-win-c`, `event-coronation`, `event-uprising`, `fennick-idle`, `fennick-lose`, `fennick-win`, `gx-bar-plate`, `gx-drawer-head-plate`, `gxh-ok-button-plate`, `halvard-idle`, `halvard-lose`, `halvard-praise`, `halvard-shock`, `halvard-taunt`, `halvard-win`, `ida-idle`, `ida-lose`, `ida-win`, `orlen-idle`, `orlen-lose`, `orlen-win`, `quill-idle`, `quill-lose`, `quill-win`, `rook-idle`, `rook-lose`, `rook-win`, `sable-idle`, `sable-lose`, `sable-praise`, `sable-shock`, `sable-taunt`, `sable-win`, `stag-idle`, `stag-lose`, `stag-praise`, `stag-shock`, `stag-taunt`, `stag-win`, `table-ossuary`, `table-ossuary-phone`, `table-sinks-masquerade`, `table-sinks-masquerade-phone`, `tamsin-idle`, `tamsin-lose`, `tamsin-talk`, `tamsin-win`, `tbtn-button-plate`, `tbtn-story-button-plate`, `tkey-picture`, `ysolde-idle`, `ysolde-lose`, `ysolde-talk`, `ysolde-win`.

## Music cues (named by the game, all delivered)

`games/thornbound/music/`: `defeat-a`, `defeat-b`, `fight-a`, `fight-b`, `main-a`, `main-b`, `tavern-a`, `tavern-b`, `victory-a`, `victory-b`.
