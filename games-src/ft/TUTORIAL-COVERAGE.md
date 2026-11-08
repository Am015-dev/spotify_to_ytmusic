# Tutorial coverage: the GUIDED first game (W497, gameplay gate)

The tutorial is a real two-player game (You vs Farid) on the stacked board of `src/tutdata.js`, played in a fixed order by `src/guide.js`.
Each step teaches ONE rule in ONE sentence of 12 words or fewer, with ONE highlighted tap: your move (only that move is accepted) or Next while Farid's scripted move plays.
Your last camel ends the game after round 2; Farid plays his last turn himself; the count walks every scoring rule page by page (no learn-later list); then Play a real game.

Tests: `node guide-logic.js` (every scripted move is legal on the engine, <=12 words, the last camel ends the game) and `node guide-test.js 390x844 [shots]` / `375x667` (walks it by touch, tapping only the glowing element; checks every core rule step in order, the count pages and the return to the menu). coach-test.js tested the old free coached game and is superseded.

| # | step | tap | sentence |
|--:|---|---|---|
| 1 | goal | Next | Most points wins. Coins, land, people, goods and djinns score. |
| 2 | bid | your tap | Bid for turn order: dearer spots play first. Tap 1 coin. |
| 3 | bidfree | Next | Farid takes a free spot. Paid coins go to the bank. |
| 4 | markers | your tap | Two players: you have two markers. Take a free spot. |
| 5 | order | Next | Same price: the later bidder plays first. Farid goes second. |
| 6 | lift | your tap | Your turn. Tap a tile to lift everyone on it. |
| 7 | drop | your tap | Drop one per tile: up, down, left or right. |
| 8 | noback | your tap | Never step straight back. Drop the next one onward. |
| 9 | lastcolour | your tap | The last one must land on its own colour. |
| 10 | take | Next | You take every Trader there. Emptied tile: your camel claims it. |
| 11 | traders | your tap | Traders bring goods from the front of the row. Collect. |
| 12 | stall | your tap | Bazaar Stall: 3 coins buys one of the first three. Take this. |
| 13 | mystics | Next | Mystics help Masons, Shadows and shrines. They never score. |
| 14 | sell | your tap | Four different goods sell for 13 coins. Sell them. |
| 15 | done | your tap | Selling is the last part of a turn. Tap End turn. |
| 16 | sages | Next | Farid takes four Sages. Each Sage is worth 2 points. |
| 17 | shrine | Next | At a Shrine two Sages summon a djinn: points and a power. |
| 18 | choose | your tap | Lift this mixed tile. You choose which colour drops where. |
| 19 | chz | your tap | Drop an Advisor here. Keep the Mason for the end. |
| 20 | pass | your tap | Any tile can be passed through. The other Advisor here. |
| 21 | masonland | your tap | The Mason lands on Masons. You take all four. |
| 22 | masons | your tap | Masons earn coins per blue tile around. Your Mystic adds one. |
| 23 | hamlet | your tap | Hamlet: you must raise a palace. Palaces score 5. |
| 24 | done2 | your tap | Nothing to sell. Tap End turn. |
| 25 | advisors | Next | Advisors: 1 point each, plus 10 per rival with fewer. |
| 26 | oasis | Next | Oasis: a palm tree must grow there. Palms score 3. |
| 27 | round | Next | Round over: goods and djinns refill. Bid again in play order. |
| 28 | bid2 | your tap | Pay 1 coin again to play first. |
| 29 | bid3 | your tap | Your second marker takes a free spot. |
| 30 | lift3 | your tap | Lift these three. A Shadow will end on Shadows. |
| 31 | s1 | your tap | The Advisor drops here. |
| 32 | s2 | your tap | The Trader drops here. |
| 33 | s3 | your tap | The Shadow joins three Shadows. Take all four. |
| 34 | end | Next | That was your last camel: the game ends after this round. |
| 35 | shadows | your tap | Shadows kill one person in reach, or a rival’s Advisor. Tap Farid. |
| 36 | noaction | your tap | A Shrine needs two Sages. You have none: skip it. |
| 37 | done3 | your tap | Tap End turn. |
| 38 | rival | Next | Farid plays by the same rules: Masons, then another djinn. |
| 39 | lift4 | your tap | Last turn. Lift this tile and walk right. |
| 40 | t1 | your tap | Your people may cross Farid’s tiles. |
| 41 | t2 | your tap | Keep walking right. |
| 42 | t3 | your tap | An Advisor lands on Advisors. |
| 43 | advisors2 | your tap | You keep your Advisors in front of you. |
| 44 | bazaar | your tap | Grand Bazaar: 6 coins buys two of the first six. |
| 45 | keep | your tap | Keep these goods: sets also score at the end. End turn. |

Count pages (one Next each): Coins and land, Palms and palaces, People (Sages, Advisors + majority), Djinns and goods, The count.
