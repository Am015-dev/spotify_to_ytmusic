# Vellum Shire rules checklist (each line = an assert in rules-test.js or a ?scn= scenario)

| rule | proof |
|---|---|
| 164 tiles by colour and back; 8 building kinds x 7; animal counts; 26 lore, ink set | rules-test: components |
| 42 goods, 20 silver, 30 workers, 12 seals, 9 dice, 9 estates | rules-test: components |
| estate 1: 37 spaces, colours, die numbers, regions (towns 1/3/3/5 ...), start keep on centre 6 | rules-test: estate |
| region points, chapter bonus, sell 2, seals 5/2, ink stall 4 | rules-test: 2-player numbers |
| setup: 1 silver, 3 goods, workers 1/2, stall colours, 4 ink tiles, white-die goods | rules-test: setup |
| take from the stall matching the die; storage full -> drop one | rules-test: take; scn vs-take |
| workers turn a die by 1 with wrap 6-1 | rules-test; scn vs-workers |
| place: die number, colour, touching | rules-test: place; scn vs-place |
| one building of each kind per town; lore 1 lifts it | rules-test |
| completed region + chapter bonus | rules-test; scn vs-region |
| big seal, then small seal for the second player | rules-test |
| animals: same kind in the same pasture; lore 7 | rules-test |
| keep: free action, any number | rules-test |
| barge: loads goods, max 3 kinds, steps up the procession | rules-test; scn vs-place |
| sell: 2 points per tile + 1 silver; lore 3, 4 | rules-test; scn vs-sell |
| take workers 2; lore 13, 14; lore 8, 12 | rules-test |
| buy from the ink stall for 2 silver once a turn; lore 6 | rules-test |
| all 8 buildings | rules-test: buildings |
| quarry silver at chapter end; stalls refilled | rules-test |
| end scoring: goods, silver, workers/2, lore 15-26 | rules-test |
| 5 chapters x 5 rounds; tie: more empty spaces | rules-test |
| computer plays legal moves only, invariants (tile and goods totals) hold | rules-test: gauntlet |
| result totals = engine | scn vs-result |
