# Asset spec for smooth motion (W253, 25 Oct 2026)

Why: our 287 strips have 3-6 frames at 4-14 fps (idle = 4 frames at 4 fps, run = 6 at 12, hit = 3, attacks 3-4). `?smooth=1` blends and ping-pongs what we have, but code cannot invent in-between poses. These targets are what new art needs.

## Targets per action (frames @ fps)
| action | frames @ fps | notes |
|---|---|---|
| idle (actors) | 8-12 @ 12 | a breath: weight shift, head and cloth follow-through |
| run | 8 @ 14-16 | contact, down, pass, up on both legs |
| jump | 8-12 @ 12 | anticipation (2) / rise (2) / apex (2) / fall (2) / land (2-4) |
| hit | 6-8 @ 14 | impact pose on frame 1, recoil, recover |
| dash | 6-8 @ 14 | wind-up frame first |
| death | 8-12 @ 12 | last frame is a held rest pose |
| boss idle | 12-16 @ 12 | slow breath, no cut at the loop point |
| boss attack | 12-20 @ 14-16 | 3-5 frames anticipation, 1-2 active frames, rest follow-through |
| melee / shoot | 6-8 @ 14 | active (damage) frames marked in the json |

## Sheet rules
1. Same cell size and same anchor on every frame of a strip (feet or ship centre on the anchor, never re-centred per frame).
2. 2-4 px transparent padding inside every cell; nothing touches the cell edge.
3. No edge halo: no light or dark fringe from the removed background; premultiplied-clean edges.
4. A looping strip must not end on its first pose: frame N != frame 0 (the loop point is a transition, not a duplicate). An idle that does close on itself plays forward; one that does not is ping-ponged by code.
5. One strip = one row of frames; json `frames`, `fps`, `anchor`, `body` filled in.

## The 10 sheets to replace first
Usage frequency: NOT measured by a bot run (no time inside the 30 min budget); the order is by how often the sheet is on screen in a normal street or boss fight plus how few frames it has today. Re-order with a bot run if the owner wants.
1. kai/run (6 @ 12): on screen all street long
2. kai/idle (4 @ 4): every pause, every menu moment
3. kai/jump (4 @ 8): no anticipation or landing cell
4. kai/melee, combo2, combo3 (4 @ 10): the most-watched hit animation
5. kai/dash (4 @ 14)
6. kai/hurt + kai/die (4 @ 10, 4 @ 8)
7. grunt/idle + grunt/run (4 @ 4, 6 @ 12): most common foe
8. gunman/shoot + idle (3 @ 10, 4 @ 4): common foe, no wind-up
9. boss-kronos/idle + attack (4 @ 4, 4 @ 8), then the other five boss idles (3-4 @ 4)
10. ship-*/flame (35 sheets, mostly 3-4 frames): best done as one shared flame strip, 8 frames @ 16
