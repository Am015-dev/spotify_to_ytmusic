# Shipwreck Isle: wired round 3 (W353)

## 3D models (11 owner files): 11 of 11 used
sw-carpenter, sw-cook, sw-explorer, sw-friday (pawns), sw-palm-a/b/c (instanced trees), sw-fire (campfire), sw-raft, sw-shelter, sw-palisade (built on the island): all loaded by `glbLoad` in three3d.js (GLBD table) behind the quality toggle, with the `.webp` sprite on Low and the procedural piece when a file is missing.

## 2D files
| file | slot |
|---|---|
| title, title-phone | NEW: start card background (extras.js) |
| end-win, end-lose | NEW: banner on top of the result card |
| back-cross, back-lifeboat | NEW: card back (`--back-img`) once the campaign unlocks them; back-default otherwise |
| hex-fog-c | NEW: third unexplored-hex variant (three3d.js, `id%3`) |
| hex-beach, hex-plains, hex-river, hex-hills, hex-mountains, hex-fog-a, hex-fog-b | already wired (loaded by name `hex-<terrain>`; the asset check missed them) |

## Superseded
ui-button-go, ui-button-power (the game uses the `-c` versions), ui-row-c (no loader, the plain row is used).

## Still unused
- table-beach, table-beach-phone, table-homestead, table-temple-ruins: the game has no table surface (the island is a full 3D world with its own sea and sky), so there is no slot. Campaign unlocks homestead and temple-ruins have nothing to show.
- rc/art disc-* (17), wreck-* (3): source art, not published to games/shipwreck-isle/art; the card renderer has no slot for them yet. char-* (4): 2D castaways, superseded by the 3D pawns and their sprites.
