# Vinegrave components vs the original's structure (F14, 20 Nov 2026)

Source of the structure: the original's English rulebook (components page, setup, research, solo pages), read 20 Nov 2026. Facts only, nothing copied.
Names, art and card designs are ours. Counts, types, distributions and the rules match the original. Where the rulebook does not state a number
(it lives only in printed art), the value is ours and marked **[unverified]**. `rules-test.js` asserts every count in this file (block "COMPONENTS").

| Component | Original (rulebook) | Vinegrave | Match |
|---|---|---|---|
| Item cards | 40, bought with coins, to the bottom of your deck | 40 (`ITEMS`), costs 1-4 coins, points 0-3 | count yes; cost/point bands [unverified] |
| Artifact cards | 35, bought with compasses; you MAY use the effect at once, free; from hand the effect costs a tablet | 35 (`ARTS`), costs 1-5 compasses; buy offers "use it" or "keep it" (engine `nofx`) | yes; cost bands [unverified] |
| Fear cards | 19; 2 in each starting deck; exiled ones go back | 19 Dread (`DREAD_SUPPLY`), -1 point; fear tile -2 when empty | yes |
| Basic cards | 4 per colour (2 coin, 2 compass) + 2 Fear = 6-card deck | 2 Patron Letter, 2 Trail Notes, 2 Dread | yes |
| Level I site tiles | 10 | 10 (`S1`) | yes |
| Level II site tiles | 6 | 6 (`S2`) | yes |
| Site spaces on the board | 5 camp sites (some with 2 spaces), level I and II regions | 5 camps (2 spaces each, blocked by player count), 5 level I, 4 level II spaces | camp yes; number of level I/II spaces [unverified] |
| Blocking tiles | 5: 4 players none, 3 players block 3, 2 players block all 5 | same (`G.blockN`) | yes |
| Idol tiles | 16; level I site: 1 face-up idol; level II site: 1 face-up + 1 face-down (take both, use only the face-up gift) | 16 in 4 kinds of 4 (coins, compasses, tablet, arrowhead); level II discovery gives 2 idols, 1 gift | count + rule yes; kinds/gifts [unverified] |
| Idol slots | 4 per board, leftmost first, free action, choose 1 of 5 effects; empty slots score their printed points; every idol 3 points | 4 slots, 5 shrine effects (`SHRINE`), empty slots 1/1/1/2 (`IDOL_SLOT_VP`), idols 3 | structure yes; effects and slot points [unverified] |
| Guardians | 15; 5 points; boon once per game; Fear for each explorer taken back from its site | 15 (`GUARDS`), 5 points, one-time boon, Dread per explorer | yes; individual costs/boons are our designs [unverified distribution] |
| Assistants | 12, silver/gold, 3 face-down stacks of 4; notebook rows recruit / upgrade; 2 squares | 12 (`ASST`), same | yes; 9 effects + rows [unverified] |
| Research track | Path map: 2 start spaces, rows of 1-2 spaces joined by bridges, cost printed on each bridge; row effect differs for magnifier/notebook; notebook never above magnifier, never in the temple | Path map (`PATH`): 2 start spaces, rows 1-7 with 2,2,2,1,2,2,1 spaces, bridges with costs (`PATH[r][j].c`), row effects (`TRACK[r].bonus`), assistant symbols for the notebook | shape yes; exact geography and bridge costs [unverified] |
| Research bonus tiles | 18; one on most spaces, some spaces only at 3-4 or 4 players; first token there takes it; plus the Lost Temple stack (as many as players) dealt from the same 18 | 18 (`RBONUS`); 8/10/12 spaces at 2/3/4 players + temple stack of N | yes; tile values [unverified] |
| Temple tiles | 24: stacks of N tiles: one 11-point (all 3 costs), two 6-point (2 costs each), three 2-point (1 cost each); arrival points by order | 6 stacks of N (solo 2) (`TEMPLE`), `TEMPLE_ARRIVE` 10/8/6/4 | structure yes; the 3 costs and arrival points [unverified] |
| Resources | 27 coins, 27 compasses, 16 tablets, 12 arrowheads, 9 jewels, plus 10 reserve tiles for when tokens run out | unlimited supply | yes, read as: the reserve tiles keep the supply open [unverified] |
| Card row | 6 cards; moon staff: round r has r artifacts left of it; each round exile the 2 cards beside the staff | same | yes |
| Rounds / turns | 5 rounds, one main action, free actions, pass = out | same | yes |
| Solo rival | 15 action tiles: 5 dig + 5 green/red pairs (discover, research, guardian, item, artifact). Stack of 10 each round = 5 dig + one of each pair; red count = difficulty 0-5. Rival starts every round, flips 1 tile per turn, never passes before 10, no resources, no Fear. Item/artifact: green lowest points, red highest. Idols 3 per new kind, 2 per duplicate/face-down | same (`RIVAL`, `RIVAL_RED`: Easy 0, Steady 1, Normal 3, Hard 5) | structure yes; dig resources, round-V idles, guardian rounds and the research/guardian red differences [unverified] |

## Still ours on purpose (authored content, allowed by the brief)
Every individual item, artifact, guardian, site and assistant design (name, numbers, effect) is our own, built to the same counts and roles.

## Not built
The second board side and the expansions.
