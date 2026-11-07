# Vinegrave tutorial coverage (W378)

The tutorial is the story's prologue: one complete, real 2-round game against the real game engine. Tamsin's moves are scripted (she
digs at camps, then passes); the turns, rules and scoring are the normal ones. Pell Ardent (guide, code-drawn "P" portrait) gives a story
reason in every bubble, and the next bubble starts with Pell's reaction. The deck is stacked (`tutSetup` in src/ui4.js): a fixed hand, the
Tin Lamp first in the market, the Glass Moth as the first guardian, and 1 tablet + 1 jewel in hand so you can overcome it.
All text is in `V.STORY.tut` (src/data.js). `tut-test.js` plays all 17 steps to the result screen at 390x763 and 1440x860, and checks that
every step below was shown, in order, and that the final count step was reached.

Chapters: 1 Landfall (steps 1-2), 2 The ruin / The guardian (3-8), 3 Supplies (9-13), 4 Last light / The count (14-17).
Leaving: Skip works at every step. Resuming part-way is NOT supported: the shared tutor kit (gx-tutor) only offers "Restart" after you
leave. A shared-kit change is needed for resume-by-chapter.

## Rules checklist
Key: **do** = you take the action, **see** = it happens on screen and the bubble names it, **told** = a bubble or the end card explains
it but the case does not come up.

| Rule | How | Step (id) | Story beat |
|---|---|---|---|
| [x] Setup: hand of 5, 2 explorers, starting coins and compasses | see | 1 hand | "The boat is gone and Tamsin is already ashore." |
| [x] Two Dread cards in the start deck, -1 point each | see + do | 4 disc (they pay the travel), 17 score (Dread row) | "Fear is good for something!" |
| [x] One main action per turn, then the next player | do | 2 play | "One action a turn, then Tamsin moves." |
| [x] Play a card for its effect (gain) | do | 2 play | Trail Notes points inland |
| [x] Rival turn, played step by step | see | after 2 and 4 (Tamsin digs camps), checked by step 3/5 ready() | "Tamsin grabbed a camp." |
| [x] Dig at a camp: travel paid with cards, gain loot | see (Tamsin) + do | 14 dig, 15 digit | "Haul the loot home." |
| [x] Discover a hidden ruin: 3 compasses + travel | do | 3 ruin, 4 disc | "3 compasses find what she can't." |
| [x] Pay travel by discarding cards (one icon each) | do | 4 disc, 15 digit | Dread pays the Boots |
| [x] Discovering gives an idol (3 points) + loot | see | 5 idol | "An idol, 3 points!" |
| [x] A guardian wakes on a discovered ruin | see | 4 disc (guardian card + roar), 7 beat | "Something stirs." |
| [x] Free action: set an idol in a shrine for an instant boon, one per turn | do | 5 idol, 6 shrine | "The shrine gives 3 coins." |
| [x] Empty shrine slots score their printed value; setting an idol fills one (rules-check MISSING 1) | told + see | 6 shrine, 17 score ("Empty shrine slots" row) | "Its slot was worth 1 point." |
| [x] Overcome a guardian where your explorer stands: pay its cost, 5 points | do | 7 beat, 8 over | "Pay its price and it's ours." |
| [x] Guardian boon: once, free, any time | do | 9 boon, 10 useboon | "Its boon is free, any time." |
| [x] Research track: the magnifier climbs a row | see (via the boon) | 10 useboon | "The Moth lights the research track." |
| [x] Buy an item with coins; it goes under your deck | do | 11 market, 12 buy | "Items sleep under your deck." |
| [x] Pass; the round ends when everyone has passed | do | 13 pass, 16 pass2 | "When all pass, the round ends." |
| [x] Round end: explorers home, draw up to 5, the market shifts | see | 14 dig (round 2 starts) | "Explorers home, fresh hand, market shifted." |
| [x] Game end after the last round, final scoring by category | see | 17 score (result table, count-up) | "You N, Tamsin M. ..." climax |
| [x] Winner = most points | see | 17 score | win / lose line from Pell |
| [ ] An explorer left beside an awake guardian brings home a Dread card | told only (rules drawer, help card) | not shown: the tutorial guardian is overcome first | - |
| [ ] Dread supply empty: fear tile, -2 | told only (rules drawer) | not shown | - |
| [ ] Buy an artifact with compasses (works at once; a tablet to play it later) | told only (inspector text, rules drawer) | not shown | - |
| [ ] Research with the notebook (never above the magnifier), first-arrival rewards, the temple and temple tiles | told only (track inspector, rules drawer) | not shown | - |
| [ ] Deep ruins (6 compasses) | told (row label "Deep ruins: explore for 6 compasses") | not shown | - |
| [ ] Exile a card | told only (shrine option, guardian boons) | not shown | - |
| [ ] Jeep / Boat / Plane substitution, 2 coins buy a Plane | told only (rules drawer, help card "Travel") | not shown | - |
| [ ] Tie-break (first into the temple, then research) | told only (rules drawer) | not shown | - |
| [ ] 5 rounds in a real game (the tutorial plays 2) | told | end card | "A real game is 5 rounds." |

Not covered by doing: 9 rules (the unticked rows). They are explained in the rules drawer and the help cards. Teaching them by doing needs
a third tutorial chapter (artifact + notebook + temple + a fled guardian). It's the next step if the owner wants every rule done in play.
