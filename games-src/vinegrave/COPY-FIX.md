# Vinegrave copy edits
Date: 2026-11-08

## Goal card
The Story goal card shows one short sentence per stage (e.g. "Win the expedition.", "Win with 35 points or more."), set in campaign.json and shown by the toast at ui3.js. Each is already ONE sentence, so the Goal card is ok. Quick games show no goal card, only a flavour line. The "The goal" rules paragraph was wordy and is fixed in the table below.

## Table
| file:line | old line | new line |
|---|---|---|
| src/ui3.js:113 | Explore the island for 5 rounds. The most points wins: research track, temple tiles, idols, guardians overcome and card points, minus 1 for every Dread card. | Play 5 rounds. Most points wins. Each Dread card costs 1 point. |
| src/ui3.js:188 | Five rounds. Points from research, temple, idols, guardians and cards. Dread costs 1 each. | Five rounds. Score from research, idols, guardians and cards. Dread costs 1. |
| src/ui3.js:114 | Do ONE main action, then the next explorer goes. When you cannot or do not want to act, pass: you are out until the next round. The round ends when everybody has passed. | Do one action, then the next explorer goes. Pass to sit out. |
| src/ui3.js:111 | Do <b>one</b> action, then the next explorer plays. | Do <b>one</b> action, then the next explorer goes. |
| src/ui3.js:111 | <b>Go to a site</b>: pay its travel icons with cards. Dig at a camp, or explore a ruin with compasses. | <b>Go to a site</b>: pay its travel icons with cards. |
| src/ui3.js:111 | Nothing to do? <b>Pass</b>. After 5 rounds the most points wins. | Nothing to do? <b>Pass</b>. After 5 rounds, most points wins. |
| src/ui3.js:116 | Each card you hold pays one travel icon (shown top right) and is discarded: a Jeep or a Boat also pays a Boot (a Jeep and a Boat never pay each other); a Plane pays anything; 2 coins buy a Plane. | A card pays one travel icon, then is discarded. |
| src/ui3.js:117 | pay 3 compasses (deep ruins: 6) plus its travel. Flip it, take an idol, gain its loot, and a <b>guardian wakes</b> there. | pay 3 compasses (deep ruins: 6) plus travel. A <b>guardian wakes</b>. |
| src/ui3.js:118 | pay its cost, take it (5 points) and keep its boon for one free use later. | pay its cost for 5 points and a one-time boon. |
| src/ui3.js:120 | climb with your magnifier, or let the notebook follow it. Pay the row's cost, gain its bonus; the first magnifier to rows 2, 4, 6 and 7 also takes an extra reward. Only the magnifier enters the temple (earlier arrivals score more); there it buys temple tiles. Ties go to the first explorer into the temple. | climb the track. Pay each row's cost for its bonus. |
| src/ui3.js:121 | Any time on your turn: use a guardian's boon, or set one idol in a shrine for a one-time boon (idols score 3 either way). Your board has 4 shrine slots worth 1, 1, 1 and 2 points while they stay empty: each idol you set fills the next slot and loses its points. | Use a boon, or set one idol in a shrine. |
| src/ui3.js:122 | Explorers come home. An explorer still sharing a site with a guardian brings back a Dread card (when the 19 Dread cards run out: a fear tile, -2). Played cards go to your discard; you keep unplayed cards and draw up to 5. The market shifts: the item and the artifact beside the divide leave, and one more artifact slot opens. | Explorers come home. Anyone with a guardian gains Dread. |
| src/ui3.js:123 | A rival expedition plays one card after each of your actions: it camps on sites, takes market cards, climbs research and hunts guardians. Beat its score. | A rival plays after each action. Beat its score. |
| src/ui3.js:184 | Overcome it for 5 points, or flee at round end with a Dread card. | Overcome it for 5 points, or flee and take a Dread card. |
| src/ui3.js:186 | Removing Dread cards makes your deck stronger. | Removing Dread cards helps your deck. |
| src/ui3.js:187 | One action, then the next explorer: play a card, go to a site, or buy a card. Nothing to do? Pass. | One action, then the next explorer. Nothing to do? Pass. |
| src/ui3.js:189 | Each card pays one travel icon. A Jeep or Boat pays a Boot too; a Plane pays anything; 2 coins buy a Plane. | Each card pays one travel icon. A Plane pays any icon. |
| src/ui3.js:190 | Three compasses and travel flip a hidden ruin: idol, loot, and a guardian wakes. | Three compasses flip a hidden ruin. You get an idol and loot. |
| src/ui3.js:88 | 'You won the game but missed the goal: ' | 'You won, but missed the goal: ' |
| src/ui3.js:88 | ' Try again: the stage stays open.' | ' Try again.' |
| src/ui3.js:191 | Pay the guardian\'s cost while your explorer is there: 5 points and a one-time boon. | Pay its cost while you are there: 5 points and a boon. |
| src/ui3.js:192 | One idol a turn into a shrine: an instant boon. It still scores 3. | Set one idol a turn in a shrine for a boon. |
| src/ui1.js:119 | Nothing left to do: tap Pass to end your round. | Nothing left to do. Tap Pass. |
| src/ui1.js:102 | ' is choosing. Tap to speed up.' | ' is choosing. Tap to skip ahead.' |
| src/ui1.js:122 | ' Best now: ' | ' Try: ' |
| src/ui2.js:30 | Dread does nothing when played: use it for travel. | Dread does nothing. Use it to pay travel. |
| src/ui2.js:51 | Both your explorers are out this round. | Both explorers are already out. |
| src/ui2.js:50 | Someone is already here this round. | Someone is already here. |
| src/ui2.js:53 | Your hand cannot pay this travel (2 coins buy a plane). | You cannot pay this travel. 2 coins buy a Plane. |
| src/ui2.js:187 | Overcome it for 5 points and a boon:  | Beat it for 5 points and a boon:  |
| src/ui2.js:240 | No goods now: it sets up later turns | No goods now. It helps later turns. |
| src/ui2.js:256 | Good move: the strongest option this turn. | Good move: the best option this turn. |
| src/ui2.js:262 | You passed: you sit out until everyone has passed and the round ends. | You passed. You sit out until the round ends. |
| src/ui2.js:262 | Turn over: you used your one action ( | Turn over: you used your action ( |
| src/ui2.js:78 | That move is not allowed now. | You cannot do that now. |
| src/ui4.js:93 | Tamsin dug a camp: that site is closed to you until the round ends. | Tamsin dug a camp. It is closed to you this round. |
| src/ui4.js:93 | Tamsin explored a ruin: an idol for her, and a guardian now sits with her explorer. | Tamsin explored a ruin. She gets an idol, and a guardian wakes. |
| src/ui4.js:94 | Tamsin overcame a guardian: 5 points and a boon for her. | Tamsin overcame a guardian: 5 points and a boon. |
| src/ui4.js:94 | Tamsin bought from the market: a new card slides in. | Tamsin bought a card. A new one slides in. |
| src/ui4.js:94 | Tamsin played a card for its goods. | Tamsin played a card. |
| src/ui4.js:95 | Tamsin climbed the research track: those rows score at the end. | Tamsin climbed the research track. Those rows score at the end. |
| src/ui4.js:95 | Tamsin bought a temple tile: big points. | Tamsin bought a temple tile for big points. |
| src/ui4.js:117 | The boat is gone and Tamsin is ashore. Trail Notes point inland: start with it. | The boat is gone. Start with your Trail Notes card. |
| src/ui4.js:119 | Playing it gives +1 compass. That is your one action. After this, the island is yours to explore. | It gives +1 compass. That is your one action. |
| src/ui4.js:138 | Pell: "You played a whole expedition. Now the coast, and Tamsin, are waiting." | Pell: "You played a full expedition. Now the coast awaits." |
| src/ui4.js:138 | Pell: "A whole expedition, start to count. A real game is 5 rounds. The lightbulb helps any time." | Pell: "That was one round. A real game has 5." |
| src/ui4.js:171 | Win the stage before it to open this one. | Win the stage before it to unlock this one. |
| src/ui4.js:171 | Win stages to earn stars and unlock portraits. | Win stages to earn stars and portraits. |
| src/data.js:197 | The boat is gone and Tamsin is already ashore. Trail Notes will point us inland. | The boat is gone. Trail Notes will point us inland. |
| src/data.js:198 | One action a turn, then Tamsin moves. Play it: +1 compass. | One action a turn, then Tamsin moves. Play it for +1 compass. |
| src/data.js:199 | Tamsin grabbed a camp. Fine: 3 compasses find what she can’t. That hidden ruin. | Tamsin took a camp. Spend 3 compasses on that hidden ruin. |
| src/data.js:200 | Your two Dread cards pay the two Boots. Fear is good for something! | Your two Dread cards can pay the two Boots. |
| src/data.js:201 | An idol, 3 points! And something stirs. Idols can wake a shrine: free. | An idol, worth 3 points! Set it in a shrine. |
| src/data.js:202 | The shrine gives 3 coins. Its slot was worth 1 point; the coins buy more. | The shrine gives 3 coins. Its slot was only worth 1 point. |
| src/data.js:203 | The Glass Moth guards our ruin. You carry a tablet and a jewel: face it. | The Glass Moth guards the ruin. You can face it. |
| src/data.js:204 | Pay its price and it’s ours: 5 points and a boon to use later. | Pay its price for 5 points and a boon. |
| src/data.js:205 | Tamed! Its boon is free, any time. Use it now. | Tamed! Its boon is free. Use it now. |
| src/data.js:206 | The Moth lights the research track: your magnifier climbs a row. | The Moth lets your magnifier climb a research row. |
| src/data.js:207 | Research pays at the end. Now shop: Tamsin is out of explorers. | Research pays at the end. Now shop while Tamsin is out. |
| src/data.js:208 | Items cost coins and sleep under your deck until you draw them. | Items cost coins. They go under your deck. |
| src/data.js:209 | Nothing left worth a move. Pass: when all pass, the round ends. | Nothing left to do. Pass. The round ends when all pass. |
| src/data.js:210 | New day: explorers home, fresh hand, market shifted. Last round! Dig a camp. | New day, last round. Dig a camp. |
| src/data.js:211 | Pay its travel with a card and haul the loot home. | Pay its travel with a card to get the loot. |
| src/data.js:212 | The light is going. Pass, and we count the finds. | Light is fading. Pass, and we count up. |
| src/data.js:217 | You hold 5 cards and 2 explorers. Two of the cards are Dread: -1 point each. | You hold 5 cards. Two are Dread: -1 point each. |
| src/data.js:220 | Tamsin plays by the same rules: one action, then it\u2019s you again. | Tamsin plays by the same rules: one action, then you. |
| src/data.js:221 | Each site shows travel icons. Each card you hold pays one icon; it\u2019s discarded. | Sites show travel icons. A card pays one, then is discarded. |
| src/data.js:222 | Camps glow: send an explorer there and dig its loot. One explorer per site a round. | Glowing camps are open. Send an explorer to dig. One per site. |
| src/data.js:223 | 3 compasses! A hidden ruin can be explored now: idol, loot, and a guardian. | 3 compasses! You can explore a hidden ruin now. |
| src/data.js:224 | Deep ruins hold more, but cost 6 compasses to explore. | Deep ruins pay more but cost 6 compasses. |
| src/data.js:225 | Short of the right icon? 2 coins buy a Plane, and a Plane pays any icon. | Missing an icon? 2 coins buy a Plane, which pays any icon. |
| src/data.js:227 | A guardian woke! Overcome it for 5 points, or flee at round end with a Dread card. | A guardian woke! Overcome it for 5 points. |
| src/data.js:228 | Set an idol in a shrine for a free boon now (one a turn). | Set an idol in a shrine for a free boon. |
| src/data.js:229 | Empty shrine slots are worth 1, 1, 1 and 2 points at the end. Setting an idol fills one. | Empty shrine slots score points. Setting an idol fills one. |
| src/data.js:230 | You can pay the guardian\u2019s price now: 5 points and its boon. | You can pay its price now: 5 points and a boon. |
| src/data.js:231 | A tamed guardian\u2019s boon is free and works once, any time on your turn. | A boon is free and works once, any time on your turn. |
| src/data.js:232 | The research track glows: pay a row\u2019s cost, your magnifier climbs, higher rows score more. | Research glows. Pay a row's cost to climb. Higher rows score more. |
| src/data.js:233 | Your notebook can follow the magnifier up the track, never past it. | Your notebook can climb behind the magnifier. |
| src/data.js:234 | Your magnifier reached the temple: buy temple tiles for big points. | Your magnifier is in the temple. Buy tiles for big points. |
| src/data.js:235 | Coins buy items. They go under your deck and come back later. | Coins buy items. They go under your deck. |
| src/data.js:236 | Compasses buy artifacts. They work the moment you buy them. | Compasses buy artifacts. They work at once. |
| src/data.js:237 | Exile removes a card for good. Dread is the best one to lose. | Exile removes a card for good. Lose a Dread card. |
| src/data.js:238 | Tamsin passed: she\u2019s out this round. When everyone has passed, the round ends. | Tamsin passed. The round ends when everyone passes. |
| src/data.js:239 | New round: explorers come home, you draw up to 5, the market shifts. | New round. Explorers come home and you draw to 5. |
| src/data.js:240 | An explorer fled a guardian: a Dread card joins that deck. | An explorer fled a guardian and took a Dread card. |
| src/data.js:241 | The final count adds research, temple tiles, idols, empty shrine slots, guardians and card points, minus Dread. | Final score: research, temple, idols, shrines, guardians and cards, minus Dread. |
| src/data.js:242 | A tie goes to whoever reached the temple first, then to research. | Ties go to whoever reached the temple first. |
| src/data.js:246 | You beat Tamsin to the temple trail. The island is waiting. | You beat Tamsin. The island awaits. |
| src/data.js:246 | Tamsin edged it, but now you know the island. Rematch? | Tamsin won this one. Ready for a rematch? |
| src/engine.js:190 | ' buys ' + bc.name + ' (to the bottom of the deck).' | ' buys ' + bc.name + ' (under the deck).' |
| campaign.json:181 | The rivals play a little gentler. | Rivals play a little easier. |
| campaign.json:292 | Boss rule: two guardians are already awake on the ruins. | Boss rule: two guardians start awake. |
| campaign.json:602 | Boss rule: the twins start with 2 extra coins and compasses each. | Boss rule: each twin starts with 2 extra coins and compasses. |
| campaign.json:733 | Vane's hired crew is tearing through the ruins. Alone, you must outscore them. | Vane's crew is racing through the ruins. Outscore them alone. |
| campaign.json:498 | Storms ground the planes. Flying now costs 3 coins, not 2. | Storms ground planes. A Plane now costs 3 coins. |

Lines fixed: 95
