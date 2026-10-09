# Garage worker 11 handoff (2026-10-07): slice 2 (collection + 9 set-inspired templates), branch alex/od-garage9b

## Base
- Merged origin/alex/od-garage9 (v87t src, d0e06ce). Only conflict: `src/ORDER` (kept `98y_garage_collection.js` then `98z_race_items.js`).
- od-garage9's src builds live byte for byte (`tools/verify_live.sh` in a worktree: IDENTICAL index.html + km.js, LIVE_MATCH 64e3bec).
- Merged base vs od-garage9: only `98y_garage_collection.js`, `98_garage_driver.js` (GAR_frm mix), `ORDER`, `src/test/g9iter.js` differ.
- Build: `tools/build.sh s2 --local` → BUILD_OK. No OD_CHANGELOG entry, no out/<ver> yet (after review).

## Changes (src/98y_garage_collection.js)
- Roofs: the roof plate now sits 1 plate down in the screens' crown (flush, no "hat"); roof stripes are inlaid tiles, not a box on top.
- Bianco (76908-inspired): knife-edge 2-plate nose, hood of Slope 33 3×1s rising to the screen, lower cabin (`low:1`), haunch blocks with black intakes, white wing.
- Racer (31100-inspired): twin round headlights, grey engine block + V8 + scoop behind the open cockpit, white centre stripe, big white wing.
- Blue Beast (60402-inspired): new `G9_mt` monster truck (XL tyres outside a short raised body, azure fenders + flames, yellow lamps, grey grille, scoop, black studded roof, roll bar). Replaces CR_monster recolour.
- Patrol light bar sits on the lowered roof.
- Collection: shown first in RIDES (right under the studs line, above perks); RARITY sort puts owned before locked; a card shows the selected car's saved edits (mho_build), also after reload.

## Evidence
- Side-by-sides vs refs: `docs/shots/garage11/sbs/t_*.jpg`; all 9: `templates_sheet.png`.
- Collection (`t4/g11col.js`, real touch, 852×393): 5 bar buttons per tab, smallest visible text 12 px, equip street + off-road mix, fav/filter/sort OK, ✎ BUILD opens the template, placed a brick 54→55, SAVE & DRIVE, reload → 55 kept. Same inside an iframe (`IFRAME=1`). ERR [].
- Drive (`t4/g11drive.js`, real touch GAS/BRAKE + key steering): player tyre gap 0.03 m (max 0.031, 14–15 samples per run, rest 0.03×4) for Rosso; Racer + Blue Beast (off-road form via T key) 0.03×4. ERR [] in all runs.
- Traffic car (4-wheel, frozen police car at a crossing): 0.013 m near side, 0.067 m far side (roll/camber). Traffic code is unchanged from live.

## Open
- Traffic far-side gap 0.067 m > 0.05 (live code, not slice 2): cars owner should check the traffic suspension roll vs road camber.
- Off-road/water locked items (3 per tab) are progression locks, not ALL_OPEN (unchanged).
- `t4/g11req.py` + `t4/g9iter.js`: write `t4/g11/iter/req.js` straight from src template code; `t4/g11wait.sh` waits for the render.
