# Tutorial coverage (the prologue: one real staged round against the real AI, never saved)

Chapters (leave and resume from the title; the kit offers "restart or exit"): Ch.1 Empty Throne (goal..sages), Ch.2 First Walk (lift..sell2), Ch.3 Rival Moves (advisors..palace), Ch.4 The Count (score..end).
Script: `node playable-test.js` and `node tutor-test.js 390x763,1440x860 clean` (taps each spotlit element's centre, checks elementFromPoint, asserts all 23 step ids were shown and the end card).
The staged round is one round (two turns each) ending in the final count; a full game is longer, so rules marked "seen" are shown on the board or told by the guide once, not played by the learner.

| Rule | Step | How | Story beat (guide / rival) |
|---|---|---|---|
| [x] Goal: most points; what scores | goal, score, end | told + final count | "The Sultan left no heir, child." / "The count is done." |
| [x] Five tribes, three per tile | tribes | seen | "Farid the Water-Boy wants the throne for his village well." |
| [x] Bid for turn order, dearer plays first | bid1, order | done | "Five coins down. Bold, child." |
| [x] Two markers each with 2 players | bid2 | done | "A thrifty second caravan." |
| [x] Same price: later bidder first | order | told | "Farid, you, Farid, you." |
| [x] Coins are points | bid1, sell2, score | told | "Thirteen coins. The throne feels closer!" |
| [x] Lift everyone from a tile | lift | done | "The Traders are in your hands." |
| [x] Drop one per tile, up/down/left/right, never straight back | drop | done | "The caravan arrives." |
| [x] Last person lands on its own colour | drop, dropB, dropC | done | "The Masons are yours!" |
| [x] Take all of that colour; empty tile gets a camel | traders | done | "Four goods and a camel." |
| [x] Choose who stays on a tile (mixed tile) | dropA, dropB | done | "One Advisor stays, one marches on." |
| [x] Traders: goods from the market | traders | done | idem |
| [x] Stall: 3 coins for a good | buy | done | "A Mystic in your purse." |
| [x] Mystics never score, boost Masons/Shadows | buy, masons | done | "Spend your Mystic for a fifth Mason." |
| [x] Sell a set of different goods (1/3/7/13...) | sell1, sell2 | done | "A fine, varied set." |
| [x] Sages: 2 points, pay for djinns; Shrine summons | sages | seen (rival) | "Farid: A djinn! Beat that." |
| [x] Advisors: 1 each + 10 per rival with fewer | advisors | seen (rival) + told | "Farid: Advisors rule the court!" |
| [x] Oasis: palm worth 3 | advisors, others | seen + told | "Farid's Advisors plant a palm." |
| [x] Masons: coins per blue tile around | masons | done | "Coins pour in. Farid gasps." |
| [x] Hamlet: palace worth 5 | palace | done | "A palace rises on your land!" |
| [x] Grand Bazaar: 6 coins for 2 goods | others | told | |
| [x] Shadows: remove a person in range, or a rival's Advisor/Sage | shadows | told (not performed) | "Beware the red Shadows." |
| [x] The computer plays the same rules, step by step | order, sages, advisors | seen | Farid's captions |
| [x] End: last camel ends the game; final count | end, score | told + done | "The bazaar is yours, child." |
| [ ] Djinn powers (each of the 22) and items | - | NOT covered: the lightbulb and the Djinns drawer explain each card |
| [ ] Crafters / Cutpurses / Wonder Cities expansion rules | - | NOT covered: Story chapters 4-7 introduce them with their own intro scene |
| [ ] No legal move / pass; ties | - | NOT covered in the prologue (described in the Rules drawer) |
