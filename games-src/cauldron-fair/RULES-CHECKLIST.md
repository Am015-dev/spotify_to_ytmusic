# Cauldron Fair: rules checklist (W503 gameplay gate, 8 Nov 2026)

Every rule of the published push-your-luck bag-building game this adapts, checked against its rulebook and a written
playthrough, then by playing a full 9-day game by touch at 390x844. Real names stay out of the repo (see rules-notes.md).
Proof column = the test line in `rules-test.js` (`node rules-test.js`, 99 tests) or the tutorial test (`tutor-test.js`).

| Rule | Engine | Proof | Taught in tutorial step |
|---|---|---|---|
| 9 rounds, most points wins | same | last round test | goal, end |
| Fortune card each round: purple now, blue all round | same, all 24 cards | 24 `card ...` tests | fortune, day2 |
| Rat tails: trailing players get a head start from round 2 | same (tails after every even number) | rat tail tests | rat |
| Everyone draws at the same time, own bag, never look | same | net / sweep | draw1 |
| A chip moves as many spaces as its number, gaps stay empty | same | placement test | spiral |
| Scoring space = the space after the last chip | same | scoring space test | ring |
| Stop any time (after at least one chip) | same: the rulebook puts the stop-or-draw choice after each chip is placed, so the first chip is drawn | must draw test | stopany |
| White sum over 7 explodes; last chip stays | same | explosion test | whites, push |
| Flask: put the last white back, once until refilled | same | flask tests, tutorial script test | flask, seven |
| Bonus die: furthest pot that did not explode rolls | same (ties all roll, spoon all roll) | bonus die tests | report |
| Die faces | 1 VP, 1 VP, 2 VP, ruby, droplet, orange (the rulebook names 5 outcomes; repeated face unverified) | die test | die |
| Chip powers by colour and book set (green/purple/black after the brew) | all 4 sets | set tests | shops1-3, peek |
| Ruby on the scoring space gives a ruby (even exploded) | same | ruby space test | ruby |
| Exploded: points OR buying, not both | same | exploded player test | choose |
| Buy 1 or 2 chips of different colours, leftovers lost, limited supply | same | buying rules test | buy |
| Yellow book from round 2, purple from round 3 | same | round 6 / books test | shops4 |
| 2 rubies: droplet step or flask refill | same | rubies test | droplet, refill |
| Extra white 1 before round 6 | same | round 6 test | six |
| Last round: draw/stop chosen in secret, no shop, 5 coins and 2 rubies = 1 VP | same | day 9 tests, 2-day tutorial test | d2draw, d2report |
| Tie: furthest in the last round, else shared | same | tie tests | ties |

## Differences found in this gate
1. Tutorial (fixed): the coached tutorial left rat tails, the bonus die faces, ruby spaces, stopping any time, simultaneous drawing,
   the day-6 white, the tie-break and the later chip colours to a "Rules you have not seen yet" list. Now a guided spotlight game
   teaches all of them in play order (33 steps, one sentence of 12 words or fewer, one highlighted tap each), then starts a real game.
2. Logic tests added: the 2-day tutorial game plays day 2 with every last-day rule; the tutorial's scripted whites (6, flask to 5, 7 safe, next white explodes).
3. No engine rule differed from the rulebook in the full touch game (9 days, 3 players, 0 errors).

## Still differs or unverified
- Die: the rulebook lists five results (1 VP, 2 VP, ruby, droplet, orange chip) and no rules page, FAQ or review found on 8 Nov says
  which sits on the sixth face; we repeat 1 VP. Checked again: rules summary pages, the publisher FAQ list, two reviews.
- First chip: confirmed, not a difference (the rulebook: "After each chip is drawn and placed, players decide whether they want to stop").
- Not built: the advanced test-tube side of the cauldron and both expansions.
