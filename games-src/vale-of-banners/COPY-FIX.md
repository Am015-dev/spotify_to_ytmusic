# Copy fixes: Vale of Banners
Date: 2026-11-08. Source: games-src/vale-of-banners/src (paths below are relative to that folder's parent).

## Goal card
The Goal card (showGoal, src/ui.js) opens with one aim sentence: `'Goal: the most points after ' + G.nPhases + ' season' + (G.nPhases > 1 ? 's' : '')`. That is ONE sentence, so the aim is ok. The three bullets under it were wordy and are fixed in the table below (src/ui.js, lines marked Goal card).

## Table
| file:line | old line | new line |
|---|---|---|
| src/story.js:8 | `Whoever builds the finest estate by harvest flies the banner of the Vale.` | `Build the best estate by harvest and your banner flies.` |
| src/story.js:9 | `Your two dice are your two hands today. That glowing stall matches your first die: claim its tile.` | `You have two dice, so two actions. Take the glowing tile.` |
| src/story.js:10 | `Take it home before Tobin does. It waits in your storage, three spaces.` | `Take it before Tobin does. Storage holds three tiles.` |
| src/story.js:11 | `Folk need a light to find your land. Your Beacon Tower is ready in storage.` | `Your Beacon Tower is in storage. Let us build it.` |
| src/story.js:12 | `Raise it on its own colour, with your other die\'s number, touching your keep.` | `Build it on a glowing space that touches your keep.` |
| src/story.js:13 | `Both hands spent. Let the day end and see what Tobin does.` | `Both dice used. End your turn.` |
| src/story.js:14 | `The banner track sets who goes first. The white die sent today\'s goods to its stall.` | `The white die sent goods to its stall. Time to sell.` |
| src/story.js:15 | `Your barn holds two crates marked 3, and you rolled a 3. Carry them to market. (Barns hold 3 kinds.)` | `You hold two crates marked 3, and rolled a 3. Sell them.` |
| src/story.js:16 | `Sell the lot: 2 points a crate and a silver coin.` | `Sell them all: 2 points per crate, plus 1 silver.` |
| src/story.js:17 | `Nothing else fits your last die. Hire hands instead: any die buys 2 workers.` | `Nothing fits your last die. Take 2 workers instead.` |
| src/story.js:19 | `A keep is for sale, one pip off your die. A worker will nudge it (6 and 1 touch).` | `This keep is one off your die. Spend a worker.` |
| src/story.js:21 | `Stone walls bring a spare hand. Your keep waits in storage.` | `Your keep is in storage. Build it for a free action.` |
| src/story.js:22 | `Set it where it glows. A keep grants one free action, any number.` | `Build it on a glowing space. It gives one free action.` |
| src/story.js:23 | `The Moot Hall is in the market. The free action can fetch it.` | `The Moot Hall is in the market. Take it free.` |
| src/story.js:25 | `The back lane sells to anyone with 2 silver, once a turn, no die needed. That lore scroll is cheap.` | `Pay 2 silver for one back lane tile. No die needed.` |
| src/story.js:28 | `A Moot Hall gathers the village to build twice. (Never two of one building in a quarter.)` | `A Moot Hall lets you build again at once.` |
| src/story.js:29 | `Raise the hall where it glows. Then build again at once, any number.` | `Build the hall on a glowing space. Then build again.` |
| src/story.js:31 | `Shelve it where it glows. Lore bends one rule for you all game.` | `Build it on a glowing space. Lore changes one rule for you.` |
| src/story.js:32 | `Silver sleeps under the hill. Your mine pays a coin at every season\'s end.` | `Your mine pays 1 silver at the end of every season.` |
| src/story.js:33 | `Dig where it glows. It fills a whole region: size points plus the spring bonus.` | `Build it on a glowing space. Filling a region scores big.` |
| src/story.js:35 | `Sheep for the meadow. Pastures score every animal of that kind in the field.` | `A pasture scores every animal of its kind in the meadow.` |
| src/story.js:36 | `Bring them home. (A full barn makes you drop a tile.)` | `Take the sheep. A full storage makes you drop a tile.` |
| src/story.js:37 | `Last hands for hire: every 2 workers are a point at the end.` | `Take 2 workers. Every 2 workers score 1 point at the end.` |
| src/story.js:38 | `End the day. The season closes, the mine pays, and the Vale counts.` | `End your turn. The season closes and your mine pays.` |
| src/story.js:39 | `+1 per silver, crate, 2 workers, lore. Ties: fuller estate, then further back.` | `Score 1 per silver, crate and lore, and 1 per 2 workers.` |
| src/story.js:44 | `See the numbers on the glowing spaces? Gold +N is what that space scores right now; 2/4 means its region gets closer to full. The star is my pick.` | `Gold +N is points now. 2/4 is region progress.` |
| src/story.js:44 | `Glowing spaces show what a build scores now (+N) or how full its region gets (2/4); the star marks the best spot.` | `Glowing spaces show points now (+N) or region progress (2/4).` |
| src/story.js:45 | `Two dice, two actions: that is a whole turn. The card tells you how your moves compared with the best ones on the table.` | `A turn is two actions, one per die.` |
| src/story.js:46 | `That tile wants a home: same colour, a die\'s number, touching your land. The glow shows where.` | `Build it on a glowing space next to your land.` |
| src/story.js:46 | `Build: a stored tile goes on an empty space of its colour with a die\'s number, touching your land.` | `Build a stored tile on an empty space of its colour.` |
| src/story.js:47 | `Both dice spent. End your turn (the back lane can still sell you a tile for silver).` | `Both dice used. End your turn, or buy a back lane tile.` |
| src/story.js:48 | `Tobin\'s turn. The banner track decides who goes first each round. Watch what he takes.` | `Tobin\'s turn. Watch what he takes.` |
| src/story.js:49 | `See the white die? It sent this round\'s goods crates to the stall with its number.` | `The white die sends a goods crate to its stall.` |
| src/story.js:50 | `You can sell! All crates of one number with a matching die: points per crate and a silver.` | `You can sell! A matching die sells all crates of that number.` |
| src/story.js:50 | `Sell all goods of one number with a matching die: 2/3/4 points per crate (2/3/4 players) and 1 silver.` | `A matching die sells all goods of that number. Each scores 2/3/4.` |
| src/story.js:51 | `Your barn holds three kinds of goods. A fourth kind would be lost, so sell soon.` | `You hold three kinds of goods. Sell before a fourth.` |
| src/story.js:52 | `Workers! Each one nudges a die up or down by 1, and 6 and 1 touch.` | `Each worker moves a die by 1. 6 and 1 touch.` |
| src/story.js:52 | `Any die can take 2 workers; each worker turns a die up or down by 1 (6 and 1 touch).` | `Any die takes 2 workers. Each worker moves a die by 1.` |
| src/story.js:53 | `Tiles marked with a worker are one pip off your dice: spend a worker to take them.` | `A worker mark means one off your die. Spend a worker.` |
| src/story.js:54 | `You have 2 silver: the back lane sells any one tile per turn, no die needed.` | `Pay 2 silver for one back lane tile. No die needed.` |
| src/story.js:55 | `A keep! It gives you one free action right now, with any number.` | `A keep! Take one free action now, with any number.` |
| src/story.js:56 | `Buildings act the moment they land. Never two of one kind in the same quarter.` | `Buildings work at once. No two of a kind in one quarter.` |
| src/story.js:57 | `Moot Hall: build again at once, any number. Chains win games.` | `Moot Hall: build again at once, with any number.` |
| src/story.js:58 | `Lore bends one rule for you for the rest of the game. Tap it to read which.` | `Lore changes one rule for you. Tap it to see which.` |
| src/story.js:60 | `Pastures score every animal of that kind in the same meadow, this one included.` | `A pasture scores every animal of its kind in the meadow.` |
| src/story.js:61 | `A barge loads every crate from one stall and moves your banner up the track.` | `A barge takes one stall's crates and moves you up.` |
| src/story.js:62 | `A whole region filled! Size points plus a season bonus: early regions pay best.` | `Region filled! You score size points plus a season bonus.` |
| src/story.js:62 | `Fill a whole region of one colour: 1/3/6/10/15/21/28/36 points by size plus 10/8/6/4/2 by season.` | `Fill a region for 1 to 36 points, plus a season bonus.` |
| src/story.js:63 | `Every space of one colour filled: the first to do it gets a colour bonus.` | `You filled every space of one colour. First player gets a bonus.` |
| src/story.js:65 | `The season ends: mines pay out. After the last season comes the final count.` | `The season ends and mines pay out.` |
| src/story.js:67 | `Chain! Two builds from one die. That is how estates grow fast.` | `Chain! Two builds from one die.` |
| src/story.js:68 | `A build was possible there. A tile on the board is usually worth more than 2 workers.` | `You could have built. A built tile usually beats 2 workers.` |
| src/story.js:69 | `Tobin just filled a region. Watch his estate: he chases the small ones.` | `Tobin just filled a region.` |
| src/story.js:69 | `Tobin chained builds with a Moot Hall or Keep.` | `Tobin built twice with a Moot Hall or Keep.` |
| src/story.js:72 | `Spring is done and you know every trade of the Vale. The real valley waits.` | `Spring is done. You know the rules. Time for a real game.` |
| src/story.js:74 | `Five seasons, two dice a day. The finest estate wins the Vale.` | `Five seasons, two dice a turn. Most points wins.` |
| src/story.js:74 | `Rival stewards eye the same valley. Build fast, build well.` | `Your rivals want the valley too. Build fast.` |
| src/story.js:77 | `Every space built. The Vale has never seen an estate like it.` | `Every space is built. You win!` |
| src/story.js:81 | `Tobin got there first. Again, steward: build from your edges.` | `Tobin got there first. Try again, and build from your edges.` |
| src/story.js:88 | `My workers bent every die. Finish your regions first, or lose again.` | `My workers bent every die. Finish your regions first.` |
| src/ui.js:166 | `Fill a whole region of one colour: size points + a season bonus (bigger early).` | `Fill a region for points. Earlier seasons pay a bigger bonus.` |
| src/ui.js:166 | `Animals in meadows, the beacon tower and lore add more; silver counts at the end.` | `Animals, the beacon tower and lore add points. Silver counts last.` |
| src/ui.js:167 | `Each turn: two dice, one action per die. Tap any score for the why.` | `Two dice, one action each. Tap a score to see why.` |
| src/ui.js:487 | `The valley is built. See who flies the highest banner.` | `The game is over. See who won.` |
| src/ui.js:491 | `Tap a glowing space: gold +N = points now, 2/4 = region progress, ★ = best spot.` | `Tap a glowing space. Gold +N is points now.` |
| src/ui.js:490 | `Keep built! One free action, any number.` | `Keep built! Take one free action, any number.` |
| src/ui.js:505 | `Nothing fits: tap +2 workers.` | `Nothing fits. Tap +2 workers.` |
| src/ui.js:462 | `Silver coins: buy from the back lane; each is a point at the end.` | `Silver: buy back lane tiles. Each silver scores 1 at the end.` |
| src/ui.js:462 | `Workers: spend to bend a die up or down by one.` | `Workers: spend one to move a die up or down by 1.` |
| src/ui.js:462 | `Banner track: barges move your banner along it for bonuses.` | `Banner track: barges move you up for turn order.` |
| src/ui.js:512 | `Turn order follows the banner track: Barges move you up. Coming goods this season: ` | `Banner track sets turn order. Goods coming this season: ` |
| src/ui.js:638 | `Turn over: you used both dice` | `Turn over: both dice used` |
| src/ui.js:227 | `Okay turn: nothing on the table was worth much.` | `Okay turn. Nothing good was on offer.` |
| src/ui.js:229 | `Good turn: you picked the strongest moves on the table.` | `Good turn! You picked the best moves.` |
| src/ui.js:230 | `Okay turn. Stronger was: ` | `Okay turn. Better was: ` |
| src/ui.js:231 | `Poor turn. Much stronger was: ` | `Poor turn. Much better was: ` |
| src/ui.js:1001 | `Win the chapter before to open this one` | `Win the previous chapter to open this one` |
| src/ui.js:733 | `(you must win the game; stars count only when you win)` | `(win the game first; stars only count if you win)` |
| src/ui.js:721 | `Ties go to the fuller estate, then to the steward further back on the banner track.` | `Ties go to the fuller estate, then the player further back.` |
| src/ui.js:755 | `Roll two dice, build your estate, raise your banner over the valley.` | `Roll two dice, build your estate, and score the most points.` |
| src/ui.js:778 | `Solo: 25 rounds. Fill all 37 spaces of your estate to win. No limit on goods kinds.` | `Solo: 25 rounds. Fill all 37 spaces to win.` |
| src/ui.js:778 | `Pass the device when it says so. Everything on the table is open.` | `Pass the device when asked. Nothing is hidden.` |
| src/ui.js:841 | `Both dice used. Buy from the back lane or end your turn.` | `Both dice used. Buy a back lane tile, or end your turn.` |
| src/ui.js:842 | `Your Keep gives one free action: any number at all.` | `Your Keep gives one free action with any number.` |
| src/ui.js:843 | `Moot Hall: pick a stored tile and build it at once.` | `Moot Hall: build a stored tile at once.` |
| src/ui.js:844 | `Load all goods from one stall, then sell them with a matching die.` | `Load all goods from one stall. Sell them with a matching die.` |
| src/ui.js:794 | `Both dice used? Tap End turn: a card rates your turn. Most points after five seasons wins.` | `Both dice used? Tap End turn. Most points after five seasons wins.` |
| src/ui.js:793 | `The bar on top shows the round, whose turn it is and the dice left. Glowing spaces show what a build scores (+N) or how full its region gets (2/4).` | `The top bar shows the round, the turn and dice left.` |
| src/ui.js:792 | `No good move? Take 2 workers; each worker turns a die up or down by 1.` | `No good move? Take 2 workers. Each moves a die by 1.` |

Lines fixed: 89
