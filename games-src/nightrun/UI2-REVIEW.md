# UI2 review (22 Oct 2026, worker U1): one menu style + size ladder, flag RET.ui2 (?ui2=0 = old)

Part: `parts/menus/ui2.js` (one `PARTS_EXTRA.append` line). Screenshots (kept out of git) were taken with Playwright at 1440x860, 1280x720
and 390x763 dpr 2 with the real fonts loaded, before (`?ui2=0` = the build at base) and after, and looked at one by one.

| screen | before (what was wrong) | after (what changed) | verdict |
|---|---|---|---|
| title (all 3) | PC: column used the left ~35% at small size; skewed painted plates, text over bevels ('stats · settings' touched the frame); red dot over TRAINING/MISSIONS label; rectangular info + story boxes beside skewed plates; mono sub-labels | one rounded plate for every button, CONTINUE = the only filled pink primary; info, story tile and the 4 hub tiles share width, radius and border; red dot sits on the plate corner; one font family; >=1024 px wide the column is 36 vw (460-600 px), title 7 vw, CONTINUE 76-96 px tall, left inset 6 vw, ship art stays visible on the right | done: nothing overlaps or overflows at 1440/1280/390 |
| menu (more) | skewed plates of 3 widths and 2 art sets, labels on the bevels | same plates in a clean 2-column grid, solid cyan focus ring | done |
| hangar tabs / upgrades | selected tab = glowing painted ring; phone tab labels touched their plate edges; level pips = tiny dashes ('sloppy dashes'); chips pill-shaped | tabs are plates with inner padding (phone font 3.3 vw), selected = filled pink plate; pips are a 6 px segmented bar; chips rounded rectangles; empty-slot dashed frames drawn solid (forge, inventory) | done (card frame colours by category kept; the filter-chip row is a horizontal scroller, its last chip is cut by design) |
| stage map | pre-existing panel art | PLAY / ARCADE / CLASSIC use the plate style | done for buttons; the painted panel frames stay (art) |
| pause | 4 skewed plates, RESUME not distinguishable | RESUME pink primary, RESTART / SETTINGS / TITLE equal secondaries, aligned grid | done |
| stage result | NEXT STAGE same as others; ONE MORE RUN wrapped to 2 lines, taller than STAGES | NEXT STAGE primary; row buttons one line, same height | done |
| game over | skewed plates | ONE MORE RUN primary, STAGES / GARAGE / TITLE secondaries, aligned | done ('Saved' toast briefly covers SAME AGAIN: pre-existing, feedback.js) |
| training / lab | painted plates | plates | done |
| profile / stats | painted plates | plates | done |
| settings | painted panel + row art with gems, row labels sat on the frame edge, italic, pill jump-tabs touching the frame, cyan-violet selected | flat card (14 px radius), each row a rounded box with its label inside a 16 px inset, upright text, jump-tabs are plates inside the card, selected option = the same pink plate as everywhere | done at 1440 / 390 |
| story card | rectangular box next to skewed plates | plates and boxes now share one shape | done |
| in game, stage 1 at 20 s | weak drone (r 14) drawn 71 px, bigger than the turret (r 20, 62 px); enemy k from 2.3 to 5.1 x radius | every mapped enemy drawn at 4.2 x hit radius: drone ~59, turret ~84, heavies larger, leaders +25 %, all below the player ship; pickups (crystal ~28 px, power hex ~34 px) and bullets unchanged = player > heavy > light > pickup > bullet | done for enemies; native sheets (gunship, kamikaze, fleet) and bosses untouched |

Gates: build.py ok; tour 39/39 shots, 0 page errors; fingerprint: every fly/street state hash unchanged (draw changes, allowed);
boss state differs in the full run with ui2 on AND with ui2=0, passes fully when run alone with ui2 on = order-dependent, not ui2;
guard.py ok; ui-audit.spec.js does not cover Nightrun (shell games only, no local playwright test runner) so not run; simhunt: same 2 severe kinds as base (unexplained deaths on stages 38-44, pre-existing).
