# redline-rally: asset check (W349)

Report-only, 2026-11-07. Read from `origin/shelf/W336-redline` (its `games-src/next-wave/expected-assets.json` and `flow-2d/redline-rally/`). Manifest not edited; the integrator applies any rows below.

REQUIRED = every manifest slot for this game + every file in `games/redline-rally/media/`. DELIVERED = file present. PROMPTED = no file, Flow prompt present. 3D items (`kind: model3d`) have prompts in the 3D set and are counted apart. NOT WIRED = delivered file that no game source names, literal or dynamic.

## Counts

| required | delivered | prompted 2D | prompted 3D | gaps added | not wired |
|---|---|---|---|---|---|
| 43 | 0 | 43 | 0 | 0 | 0 |

## Gaps added

None. Every manifest slot has a 2D prompt or a 3D prompt (0 3D slots, all with prompts), so nothing was added.

## Not wired

None.

## Manifest slots no game source names yet

0 2D slots. Prompted, but the game does not load them, so no file is needed yet: none.

## Music cues (named by the game, all delivered)

`games/redline-rally/music/`: none.
