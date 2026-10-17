# Final Approach: results of the last full test run

Everything was run from `games-src/final-approach/game/` on a shared 4-core sandbox (load average 12-25 most of the time, Chromium with SwiftShader, no GPU). Raw outputs of the last runs are in `data/last-run/`, gauntlet tables in `data/final_*.txt`.

| test | result |
|---|---|
| `rules-test.js` | 63 passed, 0 failed |
| `cover.js 700` | 700 games over all 21 scenarios, 26 113 moves, invariants checked after every move, 0 problems, 34 landings; every required rule path fired (all 6 abilities, all 3 advance sizes, gear, flaps, brakes, ice columns, trainee, fuel, traffic roll, radio, rerolls, coffee, toss, timeout, every loss reason incl. overshoot) |
| `hidden-test.js 40` | 40 games, 1 791 checks, 0 problems (poisoned states: view, legal moves and easy / normal / hard choices identical; a cheating chooser is caught) |
| `net-strip-test.js 24` | 24 games, 2 148 stripped views, 0 problems |
| `gauntlet.js` | 0 errors, 0 stalls in every run (21 scenarios x easy / normal / hard); table below |
| `click.js` (jsdom, 18 configurations: guided, vs at several airports and levels with each module, hot-seat, watch, phone portrait and landscape) | ANIM=0: 18 games, 0 errors, 0 stalls, 0 not finished, 0 hidden-dice violations (195 s). ANIM=1: the same, 174 s |
| `lay.js` 1366x768, 1920x1080, 768x1024, 1100x700 | PROBLEMS 0 (painted canvas 96 % covered on each) |
| `lay-phone.js` 390x844, 390x763, 390x664, 375x553, 412x780, 844x390, 750x342 (with the shared `phfit.js` guard) | PROBLEMS 0 at every size (no scroll, taps >= 44 px, text >= 13 px, nothing clipped, panel items inside the board and not overlapping, tip sheet, story card, final card, hot-seat pass card, touch-only play) |
| `px-test.js` | PASSED: WebGL renderer, 8 dice sprites and flights after the roll, sprites settle exactly on their DOM buttons, co-pilot dice show `?`, tray -> slot flight + landing squash, canvas painted, Low / Medium / High, PerfHUD registered, ending animation then final card, Again clears the overlay, context loss -> DOM view, `?px=canvas`, `?px=0`, phone portrait and landscape painted |
| `net/p2p-fa.js` (port 17793, two real WebRTC peers): `full` (2 flights, Play again), `leave` (18 forged messages refused, guest leaves, computer takes over, same uid rejoins), `ui`, `hostleft` | 0 bad in each; hidden dice never on the guest page, guest state byte-equal to `netStrip(hostG, seat)` |
| `net/p2p-fa-phone.js` `full`, `touch` (390x844 touch contexts) | 0 bad; badge and lobby close button 44 x 44, 6 placements by tap |

## Landing rate of two computer crew members, per airport (`node gauntlet.js <ids> <level> <games> <seed0>`)
Easy: 60 games per scenario (seed 51000); normal: 30 (seed 31000); hard: 12 (seeds 41000 / 42000 / 43000). Ability cards drawn at random for scenarios that use them.
Normal ~4 s per game and hard ~45 s per game on the loaded sandbox (about 0.4 s and 5 s unloaded).

| id | band | airport | easy | normal | hard |
|---|---|---|---|---|---|
| g1 | green | Port Alder | 23/60 (38%) | 26/30 (87%) | 10/12 (83%) |
| g2 | green | Foxmere | 8/60 (13%) | 9/30 (30%) | 6/12 (50%) |
| g3 | green | Seabright Bay | 5/60 (8%) | 11/30 (37%) | 5/12 (42%) |
| g4 | green | Lake Orrin | 8/60 (13%) | 15/30 (50%) | 7/12 (58%) |
| g5 | green | Grand Crossing | 9/60 (15%) | 17/30 (57%) | 8/12 (67%) |
| g6 | green | Castlemoor | 9/60 (15%) | 14/30 (47%) | 6/12 (50%) |
| y1 | yellow | Foxmere | 4/60 (7%) | 12/30 (40%) | 2/12 (17%) |
| y2 | yellow | Bowlrock | 0/60 (0%) | 3/30 (10%) | 1/12 (8%) |
| y3 | yellow | Palmreach | 0/60 (0%) | 4/30 (13%) | 2/12 (17%) |
| y4 | yellow | Frostmere | 0/60 (0%) | 0/30 (0%) | 0/12 (0%) |
| y5 | yellow | Castlemoor | 1/60 (2%) | 9/30 (30%) | 2/12 (17%) |
| y6 | yellow | Twin Spires | 2/60 (3%) | 10/30 (33%) | 2/12 (17%) |
| y7 | yellow | Grand Crossing | 1/60 (2%) | 3/30 (10%) | 1/12 (8%) |
| r1 | red | Cloudspire | 2/60 (3%) | 0/30 (0%) | 0/12 (0%) |
| r2 | red | Seabright Bay | 0/60 (0%) | 0/30 (0%) | 0/12 (0%) |
| r3 | red | Palmreach | 0/60 (0%) | 2/30 (7%) | 1/12 (8%) |
| r4 | red | Lake Orrin | 0/60 (0%) | 0/30 (0%) | 0/12 (0%) |
| r5 | red | Bowlrock | 0/60 (0%) | 0/30 (0%) | 0/12 (0%) |
| b1 | black | Frostmere | 0/60 (0%) | 0/30 (0%) | 0/12 (0%) |
| b2 | black | Twin Spires | 1/60 (2%) | 0/30 (0%) | 0/12 (0%) |
| b3 | black | Cloudspire | 0/60 (0%) | 0/30 (0%) | 0/12 (0%) |

green easy 62/360=17.2% normal 92/180=51.1% hard 42/72=58.3%
yellow easy 8/420=1.9% normal 41/210=19.5% hard 10/84=11.9%
red easy 2/300=0.7% normal 2/150=1.3% hard 1/60=1.7%
black easy 1/180=0.6% normal 0/90=0.0% hard 0/36=0.0%
all easy 73/1260=5.8% normal 135/630=21.4% hard 53/252=21.0%

Reading the table: with 12 to 60 games per cell the error bars are +-10 to +-25 points; easy is clearly below normal; normal and hard cannot be told apart at these sample sizes (hard searches more but its pick is judged by the same cost model).
Red and black airports are close to 0 for the computer crew; the scenarios using the icy runway (y4, r4, b1) fail mostly on "ice track not finished" and the kerosene ones (y2, r1, r2, r5, b2, b3) mostly on fuel.
