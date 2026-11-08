# Redline Rally copy fixes
Game: Redline Rally. Date: 2026-11-08.

## Goal card

Current (src/race.js:172) heading: `Goal: first across the line after N lap(s)`, then three short bullets (gear = cards, add them up, corners burn heat) and a "Start the race" button.

Verdict: OK. The aim is stated once, in one short line, before the rules. Optional tidy as a full sentence: `Be first across the line after N lap(s).` (keep the `' + G.laps + ' lap' + (G.laps > 1 ? 's' : '') + '` parts unchanged).

## Fixes

| file:line | old line | new line |
|---|---|---|
| src/tutor.js:49 | `Spin out: not enough heat for a corner means you stop behind it, lose ALL engine heat, take 1 stress card (2 from gear 3 or 4).` | `No heat for a corner? You spin out and take stress cards.` |
| src/tutor.js:50 | `Two cars fit on a space. If the space you aim for is full, you stop on the first free space behind.` | `A space holds two cars. If full, you stop behind it.` |
| src/tutor.js:51 | `Too few playable cards for your gear? You play them all, pay heat cards for the rest, do not move and drop to gear 1.` | `Too few playable cards? You stay put and drop to gear 1.` |
| src/tutor.js:52 | `Swap cards (before you pick): throw away speed cards you do not want and draw back to 7, once per round.` | `Swap: once a round, discard speed cards and redraw to 7.` |
| src/tutor.js:53 | `Upgrades mode: draft 3 bonus cards before the race. They play like speed cards with a bonus.` | `Upgrades: pick 3 bonus cards before the race.` |
| src/tutor.js:54 | `Ties on the finish: the car that arrived first wins. The race goes on until every car has finished.` | `Tie at the line? The car that arrived first wins.` |
| src/tutor.js:55 | `Starting upgrades: in a normal race your deck also holds a Brake card (speed 0), a Burst card (speed 5) and 1 extra heat card.` | `Your deck adds a Brake (0), a Burst (5), and a heat.` |
| src/tutor.js:56 | `Weather (optional): rain lowers corner limits, a heatwave starts you hotter, a tailwind makes slipstream 3 spaces.` | `Weather: rain lowers limits, heatwave adds heat, wind lengthens slipstream.` |
| src/tutor.js:57 | `Championship: three tracks in a row, points for every place (9, 6, 4, 3, 2, 1).` | `Championship: three races, points for each place, best total wins.` |
| src/tutor.js:61 | `Rookie, Kit Marlow wants your seat at Sunline. Win one lap and it stays yours.` | `Kit Marlow wants your seat. Win one lap to keep it.` |
| src/tutor.js:62 | `Your gear is how many cards you play. Pick one, then tap that many cards.` | `Gear sets how many cards you play. Tap that many.` |
| src/tutor.js:63 | `The numbers on your cards add up to your speed. Speed is how many spaces you drive.` | `Card numbers add up to your speed, in spaces.` |
| src/tutor.js:64 | `Shifting two gears at once costs 1 heat. One gear up or down is free.` | `Shift one gear free. Shifting two costs 1 heat.` |
| src/tutor.js:65 | `Corner ahead. Its sign is the speed limit. Faster than the limit burns engine heat.` | `Corner ahead. Go faster than its sign and you burn heat.` |
| src/tutor.js:66 | `You are over the limit: each point over burns 1 heat from your engine. Brake or pay?` | `Over the limit: each point costs 1 heat. Brake or pay?` |
| src/tutor.js:67 | `Dark Heat cards are dead weight in your hand. Gear 1 or 2 cools them back into the engine.` | `Heat cards cannot be played. Gear 1 or 2 cools them.` |
| src/tutor.js:68 | `Purple Stress card: when played, it flips a random speed card from your deck.` | `Stress card: playing it flips a random speed card.` |
| src/tutor.js:69 | `Cooled! Heat cards from your hand went back into the engine. Fuel restored.` | `Cooled! Heat cards went back to your engine.` |
| src/tutor.js:70 | `Now every rival drives in turn, leader first. Watch how Kit and Juno handle the corners.` | `Now the rivals drive, leader first. Watch their corners.` |
| src/tutor.js:71 | `Adrenaline: the last car to move gets +1 space and +1 cool-down. Free help.` | `Last car gets adrenaline: +1 space, +1 cool-down.` |
| src/tutor.js:72 | `You are next to or right behind a car: slipstream gives 2 free spaces. Usually take it.` | `Next to or behind a car? Slipstream gives 2 free spaces.` |
| src/tutor.js:73 | `Boost: pay 1 heat, flip an extra speed card and add it. Use it when the line is near.` | `Boost: pay 1 heat to add an extra speed card.` |
| src/tutor.js:74 | `Over the line! Finishers are placed in the order they cross.` | `Over the line! Finishers rank in crossing order.` |
| src/tutor.js:94 | `'Corner ahead in ' + nc.d + ' spaces, limit ' + nc.limit + '. Faster than that burns engine heat.'` | `'Corner in ' + nc.d + ' spaces, limit ' + nc.limit + '. Over it burns heat.'` |
| src/tutor.js:95 | `' is over the limit: it burns ' + ci.burn + ' of your ' + c.eng + ' heat. Brake or pay?'` | `' burns ' + ci.burn + ' of your ' + c.eng + ' heat. Brake or pay?'` |
| src/tutor.js:108 | `'Good lesson: ' + e.cost + ' heat burned over a limit of ' + e.limit + '. Brake earlier to save fuel.'` | `'Burned ' + e.cost + ' heat over the limit of ' + e.limit + '. Brake earlier.'` |
| src/tutor.js:108 | `'Clean corner: you stayed under the limit of ' + e.limit + '. That is how you save fuel.'` | `'Clean corner! You stayed under the limit of ' + e.limit + '.'` |
| src/tutor.js:109 | `Spin out! No heat left for that corner: you lose all engine heat and take stress cards.` | `Spin out! You lose all heat and take stress cards.` |
| src/tutor.js:137 | `Kit Marlow wants your seat. Win one lap. Your gear is how many cards you play: take gear 2.` | `Gear is how many cards you play. Take gear 2.` |
| src/tutor.js:116 | `'. Finishers rank by crossing order; the rest by distance. Ties go to whoever arrived first.` | `'. Ties go to whoever arrived first.` |
| src/tutor.js:116 | ` in corners, shifts and boosts. Less heat spent means more left for the next push.` | ` in corners, shifts and boosts. Less spent means more later.` |
| src/tutor.js:118 | `Coach Mara: "That is how you beat Kit. The Sunline seat is yours."` | `Coach Mara: "You beat Kit. The seat is yours."` |
| src/tutor.js:118 | `Coach Mara: "Not first, but you now know every trick. Again?"` | `Coach Mara: "Not first, but you know the tricks. Again?"` |
| src/tutor.js:153 | `Pick a gear (cards to play). Tap that many cards: they add up to your speed. Press Go. Mind the corner limits. Then each rival drives in turn.` | `Pick a gear, tap that many cards, then press Go. Rivals go next.` |
| src/tutor.js:154 | `Your gear is how many cards you play. Shift one gear free, or two gears for 1 heat. The cards add up to your speed.` | `Gear is cards played. Shift one gear free, two for 1 heat.` |
| src/tutor.js:155 | `Each corner has a speed limit. Every point you go over costs 1 heat from your engine. No heat left means a spin-out.` | `Each point over a corner limit costs 1 heat. No heat? Spin-out.` |
| src/tutor.js:156 | `Heat you pay goes to your discard pile and comes back as dead cards in your hand. Gears 1 and 2 send heat back to the engine.` | `Spent heat returns later as dead cards. Gears 1 and 2 cool them.` |
| src/tutor.js:157 | `End next to or right behind a car to glide 2 more spaces. Boost: pay 1 heat to flip an extra speed card.` | `Beside or behind a car: 2 free spaces. Boost costs 1 heat.` |
| src/tutor.js:158 | `With Upgrades on you draft 3 cards before the race. They are played like speed cards and add a bonus.` | `With Upgrades on, pick 3 bonus cards before the race.` |
| src/tutor.js:162 | `Tap Suggest and the computer picks a gear and cards for you. Then tap Go.` | `Tap Suggest to get a gear and cards. Then tap Go.` |
| src/story.js:21 | `Rookie, I am Coach Mara. Kit Marlow wants your seat at Sunline. Win one lap and it stays yours.` | `I am Coach Mara. Win one lap and keep your seat.` |
| src/story.js:24 | `Speed 5 puts you five spaces up the road. Floor it!` | `Speed 5 moves you five spaces. Press Go!` |
| src/story.js:25 | `Smooth launch! Kit, Juno and you each drive in turn. That is every round.` | `Smooth launch! Everyone drives in turn each round.` |
| src/story.js:26 | `Rain on the corner ahead: the speed limit is 5. Every point over burns a heat from your engine.` | `Wet corner ahead. Limit 5. Each point over burns 1 heat.` |
| src/story.js:28 | `Speed 7 is 2 over the limit: two heat burned. Too pricey right now.` | `Speed 7 is 2 over: two heat burned. Too costly.` |
| src/story.js:32 | `Kit is pulling away. Corner limit 4 ahead. Spend one heat to catch him: play the 3 and the 2.` | `Spend 1 heat to catch Kit: play the 3 and the 2.` |
| src/story.js:34 | `Caught him! One heat spent. Watch the engine dots: that is your fuel.` | `Caught him! The engine dots are your fuel.` |
| src/story.js:35 | `Spent heat comes back later as dead Heat cards in your hand. They cannot be played.` | `Spent heat returns as dead Heat cards. You cannot play them.` |
| src/story.js:37 | `The purple card is Stress: a mystery speed, flipped from your deck. Play it.` | `The purple Stress card has a mystery speed. Play it.` |
| src/story.js:38 | `You are last, so you get adrenaline: one extra space and one extra cool-down. Free help.` | `Last place gets adrenaline: +1 space and +1 cool-down.` |
| src/story.js:41 | `Kit is just ahead. Stop right behind him and you can slipstream: two free spaces.` | `Stop right behind Kit to slipstream two free spaces.` |
| src/story.js:42 | `Shifting two gears costs one heat. Worth it: take gear 3.` | `Two gears up costs 1 heat. Worth it: take gear 3.` |
| src/story.js:47 | `The line is close. Gear 2, then boost: one heat for an extra flipped card.` | `The line is close. Take gear 2, then boost.` |
| src/story.js:50 | `Now boost: it pays one heat and flips an extra speed card.` | `Boost: pay 1 heat to add an extra speed card.` |
| src/story.js:52 | `First over the line wins. Finishing order is by distance, ties go to whoever arrived first.` | `First over the line wins. Ties go to who arrived first.` |
| src/story.js:55 | `Gear, cards, corners, heat, slipstream, boost. Kit wants a rematch.` | `You learned the basics. Kit wants a rematch.` |
| src/ui.js:39 | `The strip in the side panel lights your phase: <b>Shift</b> (pick a gear), <b>Play</b> (pick the cards), <b>Move</b>, <b>React</b> (cooldown, boost, slipstream, corners), <b>Discard</b> (draw back to 7).` | `The side strip lights your phase: <b>Shift</b>, <b>Play</b>, <b>Move</b>, <b>React</b>, <b>Discard</b>.` |
| src/ui.js:39 | `Before you press Go, the track shows where you will land and what the corner costs.` | `Before Go, the track shows where you land and the corner cost.` |
| src/ui.js:39 | `Each round you pick a <b>gear</b> and play that many cards.` | `Each round, pick a <b>gear</b> and play that many cards.` |
| src/ui.js:39 | `The total is your speed: you move that many spaces.` | `The total is how far you move.` |
| src/ui.js:40 | `shift one step free, or two steps for 1 heat. Gear = cards you play.` | `shift one step free, two steps for 1 heat.` |
| src/ui.js:40 | `Not enough heat? You spin out: all your engine heat is lost, you stop behind the corner in gear 1, and get 1 stress card (2 if you were in gear 3 or 4).` | `No heat? Spin out: lose all heat, drop to gear 1, take stress.` |
| src/ui.js:40 | `end next to or right behind another car and you may glide 2 more spaces. It does not count as speed.` | `end beside or behind a car to glide 2 more spaces.` |
| src/ui.js:40 | `pay 1 heat to flip cards from your deck until a speed card shows, and add it.` | `pay 1 heat to flip an extra speed card and add it.` |
| src/ui.js:40 | `(after your cards are shown): gear 1 sends up to 3 heat from your hand back to the engine, gear 2 sends 1.` | `(after cards show): gear 1 cools 3 heat, gear 2 cools 1.` |
| src/ui.js:40 | `the last car to move each round gets +1 move and +1 cooldown (the last two cars when 5 or more started).` | `last car gets +1 move, +1 cooldown (two cars if 5+).` |
| src/ui.js:40 | `if your hand has fewer playable cards than your gear, you play them all, pay heat cards for the rest, do not move and drop to gear 1.` | `too few playable cards? You do not move and drop to gear 1.` |
| src/ui.js:40 | `no slipstream past the line. The race goes on until every car has finished; finishers are placed in the order they cross.` | `no slipstream past the line. Finishers rank in crossing order.` |
| src/ui.js:40 | `Cars crossing in the same round: the one furthest past the line is ahead; on the same space, the one that got there first.` | `Same round: furthest past the line wins; same space, first there wins.` |
| src/ui.js:41 | `when played, flip your deck until a speed card shows and use it.` | `playing one flips a speed card from your deck.` |
| src/ui.js:41 | `paying sends them to your discard pile. They clog your hand later and cannot be played.` | `paid heat returns later as unplayable cards.` |
| src/ui.js:42 | `Switch Upgrades on in setup. Before the race you pick 3 upgrade cards; they join your deck and are played like speed cards, each with a bonus (more cooling, higher corner limits, a big speed jump).` | `Switch Upgrades on in setup. Pick 3 bonus cards before the race.` |
| src/ui.js:43 | `Every car shuffles a <b>Brake card</b> (speed 0), a <b>Burst card</b> (speed 5) and 1 extra heat card into its deck. The printed rules give no numbers for these, so these are this game\'s own fair values.` | `Each deck adds a <b>Brake card</b> (0), <b>Burst card</b> (5) and a heat.` |
| src/ui.js:45 | `Three tracks in a row with the same drivers. Points per place: 9, 6, 4, 3, 2, 1.` | `Three tracks, same drivers. Points per place: 9, 6, 4, 3, 2, 1.` |
| src/ui.js:46 | `Stress and heat cards never run out (the printed game has a limited reserve).` | `Stress and heat cards never run out.` |
| src/ui.js:46 | `Brake and keep your heat, or push and burn it. Heat comes back around.` | `Brake to keep heat, or push and burn it.` |
| src/ui.js:118 | `Throw away cards you do not want and draw back to 7 (once a round)` | `Discard unwanted cards and redraw to 7 (once a round)` |
| src/ui.js:268 | `You beat Kit to the line. Coach Mara is grinning: the Sunline seat is yours.` | `You beat Kit. Coach Mara grins: the seat is yours.` |
| src/ui.js:268 | `Kit took the flag, but you learned every trick. Coach Mara: "Again. You are close."` | `Kit won, but you learned the tricks. Coach Mara: "Again!"` |
| src/race.js:167 | `The car furthest round the track is ahead. Two cars on one space: the one that got there first is ahead.` | `The car furthest along leads. On one space, first arrival leads.` |

Lines fixed: 80
