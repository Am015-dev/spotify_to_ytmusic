# sunglaze: asset check (W349)

Checked 2026-11-07 on branch `shelf/W349-assets-d`. Manifest: `games-src/next-wave/expected-assets.json` (slug `sunglaze`). Prompts: `games-src/next-wave/flow-2d/sunglaze/`.

REQUIRED = every manifest slot for this game + every file in `games/sunglaze/media/`. DELIVERED = file present. PROMPTED = no file, Flow prompt present. 3D items (`kind: model3d`) have prompts in the 3D set and are counted apart. NOT WIRED = delivered file that no game source names, literal or dynamic.

## Counts

| required | delivered | prompted 2D | prompted 3D | gaps added | not wired |
|---|---|---|---|---|---|
| 127 | 58 | 56 | 13 | 0 | 14 |

## Gaps added

None. Every manifest slot has a 2D prompt or a 3D prompt (13 3D slots, all with prompts), so nothing was added.

## Not wired

| file | note |
|---|---|
| `games/sunglaze/media/back-default.webp` | no literal or dynamic name in the game source |
| `games/sunglaze/media/back-guild-seal.webp` | no literal or dynamic name in the game source |
| `games/sunglaze/media/back-lamplight.webp` | no literal or dynamic name in the game source |
| `games/sunglaze/media/table-prism-light.webp` | no literal or dynamic name in the game source |
| `games/sunglaze/media/table-sun-palace.webp` | no literal or dynamic name in the game source |
| `games/sunglaze/media/table-unmarked-slate.webp` | no literal or dynamic name in the game source |
| `games/sunglaze/media/ui-button-go.webp` | no literal or dynamic name in the game source |
| `games/sunglaze/media/ui-button-power.webp` | no literal or dynamic name in the game source |
| `games/sunglaze/media/ui-iconbtn-k.webp` | no literal or dynamic name in the game source |
| `games/sunglaze/media/ui-node-boss-k.webp` | no literal or dynamic name in the game source |
| `games/sunglaze/media/ui-node-done-k.webp` | no literal or dynamic name in the game source |
| `games/sunglaze/media/ui-node-locked-k.webp` | no literal or dynamic name in the game source |
| `games/sunglaze/media/ui-node-open-k.webp` | no literal or dynamic name in the game source |
| `games/sunglaze/media/ui-rack-frame.webp` | no literal or dynamic name in the game source |

## Manifest slots no game source names yet

56 2D slots. Prompted, but the game does not load them, so no file is needed yet: `back-black-kiln`, `bram-idle`, `bram-lose`, `bram-win`, `btn-sm-button-plate`, `cobb-idle`, `cobb-lose`, `cobb-win`, `end-lose-b`, `end-lose-c`, `end-win-b`, `end-win-c`, `garnet-idle`, `garnet-lose`, `garnet-praise`, `garnet-shock`, `garnet-taunt`, `garnet-win`, `iris-idle`, `iris-lose`, `iris-win`, `nell-idle`, `nell-lose`, `nell-win`, `ochre-idle`, `ochre-lose`, `ochre-talk`, `ochre-win`, `saffra-idle`, `saffra-lose`, `saffra-praise`, `saffra-shock`, `saffra-taunt`, `saffra-win`, `table-kiln-hall`, `table-kiln-hall-phone`, `table-moon-courtyard`, `table-moon-courtyard-phone`, `tamsin-idle`, `tamsin-lose`, `tamsin-talk`, `tamsin-win`, `tile-gloss-b`, `tile-gloss-c`, `twins-idle`, `twins-lose`, `twins-win`, `umbra-idle`, `umbra-lose`, `umbra-praise`, `umbra-shock`, `umbra-taunt`, `umbra-win`, `vesper-idle`, `vesper-lose`, `vesper-win`.

## Music cues (named by the game, all delivered)

`games/sunglaze/music/`: `defeat-a`, `defeat-b`, `fight-a`, `fight-b`, `main-a`, `main-b`, `tavern-a`, `tavern-b`, `victory-a`, `victory-b`.
