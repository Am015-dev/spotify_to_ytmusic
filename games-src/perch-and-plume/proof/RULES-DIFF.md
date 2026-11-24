# Perch & Plume: rules diff (W649)

Source: the published base-game rulebook (official text, read only, nothing copied; title not written here) and its player-mat art.
Our names only. Tests: `node rules-test.js` (block `w649_rules_diff` = the new checks marked T).

| rule | published | ours | status |
|---|---|---|---|
| setup | 5 birds, 1 of each of 5 foods, 2 bonus cards; keep up to 5 birds, discard 1 food per bird kept; keep 1 bonus | same | MATCH |
| tray at start | 3 face-up birds | same | MATCH |
| rounds / actions | 4 rounds, 8/7/6/5 actions | same (`CUBES`) | MATCH |
| one action a turn | play a bird or use one habitat row; the same action may repeat | same | MATCH |
| forest: gain food | 1,1,2,2,3,3 by birds in the row | same (T) | MATCH |
| grassland: lay eggs | 2,2,3,3,4,4 | same (T) | MATCH |
| wetland: draw cards | 1,1,2,2,3,3, each from the tray or the deck in any mix | same (T) | MATCH |
| row trades | spaces with 1/3/5 birds: card->+1 food, food->+1 egg, egg->+1 card; optional, once | same (T) | MATCH |
| egg cost by column | 0,1,1,2,2, eggs from any of your birds | same | MATCH |
| food costs | "/" either, "+" all, wild = any 1 food | same | MATCH |
| 2-for-1 | any 2 food pay for 1, only when playing a bird | same (`payOptions` only on play) | MATCH |
| feeder | 5 dice; faces grub, seed, fish, berry, rodent, grub/seed (one token of either) | same | MATCH |
| feeder reroll | empty: roll all; all dice one face (a single die counts): you may reroll | same (T) | MATCH |
| grub/seed face | its own face for the reroll rule | same (T) | MATCH |
| tray refill | end of each turn; round end: discard all 3 and refill | same | MATCH |
| brown powers | after the row action, right to left, each optional | right to left; asks when a power also helps others, otherwise fires by itself | SIMPLIFIED (a power that can only help you fires itself) |
| white powers | once, when played | same | MATCH |
| pink powers | on others' turns, once between each of your turns | same | MATCH |
| egg limits | printed per bird, never exceeded; lay on any mix of birds | same; our roster limits 1-6 (published 0-6) | MATCH (roster is original) |
| 5 birds per row | yes | same | MATCH |
| cached food / tucked cards | not spendable, 1 point each | same | MATCH |
| end of round | remove cubes, score goal, clear and refill tray, first player passes on | same | MATCH |
| round goals | 4/1/0, 5/2/1, 6/3/2, 7/4/3; ties add the places and divide rounded down; 0 items scores 0; 4th+ scores 0 | same (T: tie 3/3/1, zero = 0) | MATCH |
| final score | birds + bonus + goals + eggs + cached food + tucked cards; tie: most unused food | same | MATCH |
| hand / food limits | none | none | MATCH |
| deck runs out | reshuffle the discards | same (T; `drawCard` now exported to test it) | MATCH |
| roster | 170 birds, 26 bonus cards | 120 original birds, 18 original bonus cards | MATCH by design (original content) |

Rules were already faithful; the owner's "confusing" verdict came from the screen and the tutorial, fixed in this round:
the mat now prints each space's egg cost and its row action (with the trade mark) like a real player mat, rows carry their habitat
name, the old tutorial that locked every tap but one is replaced by floating lessons (lessons.js) that cover each row above in play order.
