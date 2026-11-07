# tidewake: asset check (W349)

Checked 2026-11-07 on branch `shelf/W349-assets-d`. Manifest: `games-src/next-wave/expected-assets.json` (slug `tidewake`). Prompts: `games-src/next-wave/flow-2d/tidewake/`.

REQUIRED = every manifest slot for this game + every file in `games/tidewake/media/`. DELIVERED = file present. PROMPTED = no file, Flow prompt present. 3D items (`kind: model3d`) have prompts in the 3D set and are counted apart. NOT WIRED = delivered file that no game source names, literal or dynamic.

## Counts

| required | delivered | prompted 2D | prompted 3D | gaps added | not wired |
|---|---|---|---|---|---|
| 124 | 55 | 60 | 9 | 0 | 11 |

## Gaps added

None. Every manifest slot has a 2D prompt or a 3D prompt (9 3D slots, all with prompts), so nothing was added.

## Not wired

| file | note |
|---|---|
| `games/tidewake/media/back-default.webp` | no literal or dynamic name in the game source |
| `games/tidewake/media/back-night.webp` | no literal or dynamic name in the game source |
| `games/tidewake/media/back-scales.webp` | no literal or dynamic name in the game source |
| `games/tidewake/media/ui-button-go.webp` | no literal or dynamic name in the game source |
| `games/tidewake/media/ui-button-power.webp` | no literal or dynamic name in the game source |
| `games/tidewake/media/ui-iconbtn-k.webp` | no literal or dynamic name in the game source |
| `games/tidewake/media/ui-nametag.webp` | no literal or dynamic name in the game source |
| `games/tidewake/media/ui-node-boss-k.webp` | no literal or dynamic name in the game source |
| `games/tidewake/media/ui-node-done-k.webp` | no literal or dynamic name in the game source |
| `games/tidewake/media/ui-node-locked-k.webp` | no literal or dynamic name in the game source |
| `games/tidewake/media/ui-node-open-k.webp` | no literal or dynamic name in the game source |

Matched only by a dynamic name (verify): `table-dawn`, `table-lantern`, `table-storm`.

## Manifest slots no game source names yet

60 2D slots. Prompted, but the game does not load them, so no file is needed yet: `brann-idle`, `brann-lose`, `brann-win`, `button-button-plate`, `crown-attack`, `crown-hit`, `crown-idle`, `crown-lose`, `crown-win`, `end-lose-b`, `end-lose-c`, `end-win-b`, `end-win-c`, `event-leviathan`, `gx-bar-plate`, `gx-drawer-head-plate`, `gxh-ok-button-plate`, `harrow-idle`, `harrow-lose`, `harrow-praise`, `harrow-shock`, `harrow-taunt`, `harrow-win`, `osk-idle`, `osk-lose`, `osk-talk`, `osk-win`, `sabel-idle`, `sabel-lose`, `sabel-praise`, `sabel-shock`, `sabel-taunt`, `sabel-win`, `saltshade-attack`, `saltshade-hit`, `saltshade-idle`, `saltshade-lose`, `saltshade-win`, `start-plate`, `table-harbor-noon`, `table-harbor-noon-phone`, `table-rift-night`, `table-rift-night-phone`, `tile-water-e`, `tile-water-f`, `tile-water-g`, `tile-water-h`, `vey-idle`, `vey-lose`, `vey-win`, `wick-idle`, `wick-lose`, `wick-talk`, `wick-win`, `ysolde-idle`, `ysolde-lose`, `ysolde-praise`, `ysolde-shock`, `ysolde-taunt`, `ysolde-win`.

## Music cues (named by the game, all delivered)

`games/tidewake/music/`: `defeat-a`, `defeat-b`, `fight-a`, `fight-b`, `main-a`, `main-b`, `tavern-a`, `tavern-b`, `victory-a`, `victory-b`.
