# Tutorial coverage: a COACHED first game (free legal moves, one real round, fixed seed, real AI). No forced tap steps; the guide speaks the first time a rule matters (`coach` in game/src/story.js, ids below), never more than one bubble, tap the strip to dismiss.
# Proven by game/coach-test.js: plays free legal moves at 390x763 and 1440x860 and asserts every id below was explained and the end card (with 'Things you will meet later') shows. The old spotlight steps (ui12.js tutSteps, tutor-test.js) are retired.
Coach ids: welcome, goal, bid, bids, kc, herald, place, supp, order, clash, claim, score, round (round is told on the end card).

(Older table, step ids are now coach ids:)
Steps are ids in `game/src/ui12.js` (`tutSteps`); story text in `game/src/story.js` (`tut`, `chapters`). Ticked = taught by doing or seeing it once.

| Rule | Step | Story beat |
|---|---|---|
| [x] Goal: most Influence after the last round | goal, end | Ysolde: "Influence is how the kingdom counts loyalty." / climax at the end |
| [x] Map: 3 regions, 6 locations, rewards | map | "Hold them and you hold the Throne." |
| [x] Secret bid, highest first | bid1, bid2, reveal | "Lay it face down. She must not see." / "Hidden well." |
| [x] Kingdom Card (take, bid card goes under it) | kc | "A fine favour." |
| [x] Herald placement | herald | "The crowd cheers your name." |
| [x] Hide one card per region | place1, place1b, place2, place3 | "Three cards down." |
| [x] Heir / strongest card where both Heralds stand | place2 | |
| [x] Supporters +1 each | supp, spring | "That is +2." |
| [x] Clash order | order | "The horns sound." |
| [x] Clash: flip, total, winner | clash | |
| [x] Claim a location, Herald bonus and steal | claim, score | "One region at a time." |
| [x] Round end: Supporters home, cards discarded | round | |
| [x] End trigger and tie-break (told at the end) | end | |
| [ ] Day/Night commands (Ambush, Retreat, Flank, Deadly) | not covered (lightbulb tips explain them in round 2) | |
| [ ] Autumn: Govern, Journey, Lore, Site of Power | not covered | |
| [ ] Councils, Favour, Tactics | not covered (Story chapters 5-6 introduce them) | |
| [ ] Attrition (empty deck), tied Clash re-clash, empty market | not covered | |
Chapters are not leave-and-resume: Skip tutorial works at any step and restarts from the title. Honest gap: only round 1 is guided.
