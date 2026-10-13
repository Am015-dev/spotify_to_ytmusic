# Checklist review: live v90i (2026-10-13)

The build reviewed is the live v90i page. The local copy served for the test is byte-identical to the live index.html.

Setup:
- Phone layout at 852×393 with real touch input (GAS, steering and buttons tapped).
- Scope is the 12 items the in-game checklist pin shows (versions v90i, v90h and v90g). The full OD_CHECKLIST has 186 items.
- 0 console errors in all runs.

| # | Item | Verdict | Reason |
|---|------|---------|--------|
| 1 | v90i town16 | PASS | Blaze Commander, Blizzard Blazer, Pothole Patcher and Bulldozer all stand on the platform, tyres on the tiles. Equipped the Bulldozer, SAVE & DRIVE, drove 25 s: complete and on the road. Note: in the garage the Bulldozer was still only chassis + wheels 4.8 s after the tap; the others were complete by then. |
| 2 | v90i pin-obj | PASS | During the Hot Drop mission the pin sits at y 80–136 px, below the objective line (y 44–74). They do not overlap. |
| 3 | v90i palms | CAN'T TEST | 90 s of Athens driving never reached the Syntagma race. |
| 4 | v90i ath-size | PASS | 90 s in Athens, including a RAMP JUMP event. The car stays at scale 1.0 and upright, normal size on screen. |
| 5 | v90h gfloor | PASS | Orange Racer, Big Rig, Fire Truck, Fire & Rescue Van, Street Sweeper, Z06 and the Town sets: tyres on the tiles, nothing sunk. The OFF-ROAD and WATER rides were not checked (the script did not find their cards). |
| 6 | v90h gpatch | PASS | Fire Truck → BUILD: the grey platform behind the truck has no dark striped patch. |
| 7 | v90g rides16 | PASS | Street Sweeper, Fire Truck (4208), Z06 Racer and Big Rig look complete. |
| 8 | v90g racers | PASS | The chip cycles ALL → OWNED → ★ FAVS → 🏁 RACERS. RACERS shows exactly 7611, 7612, 7613, 8120 and 8121. Driving a racer was not tested. |
| 9 | v90g fra-props | CAN'T TEST | Pizza To Go, the phone booth, the fountain and the speedboat were not passed during a 100 s Frankfurt roam. |
| 10 | v90g ath-display | CAN'T TEST | The lighthouse and house plinths were not passed. |
| 11 | v90g bigrig | CAN'T TEST | No yellow Big Rig was seen in traffic during the 100 s Frankfurt roam. |
| 12 | v90g land2 | CAN'T TEST | The Athens lamps look LEGO (black post, yellow lamp). Frankfurt planters and dumpsters were not identified on screen. |

Totals: 7 PASS, 0 FAIL, 5 CAN'T TEST. The CAN'T TEST items need a specific spot in the world, and the real-input drive did not reach it in the time available.
