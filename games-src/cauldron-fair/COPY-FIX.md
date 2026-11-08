# Cauldron Fair copy fixes

Goal-card verdict: rewritten. The goal text ran to three sentences and mixed story with scoring. New aim: "Have the most victory points after day 9." (see row 1 for bullets).

| # | file:line | old line | new line |
|---|---|---|---|
| 1 | src/ui5.js:13 | You are a travelling potion-maker at the village fair. Over nine days you brew in your cauldron, sell what you make and stock your bag with better ingredients. The most victory points after day 9 wins. | GOAL: Have the most victory points after day 9.<br>- Stop on a good space to score its points.<br>- Coins buy better chips for your bag.<br>- On day 9, every 5 coins and 2 rubies make 1 point. |
| 2 | src/ui10.js:26 | You brew for nine days. Chips earn coins and victory points. The most points after day 9 wins. | Have the most victory points after day 9. |
| 3 | src/ui11.js:67 | Brew potions for 9 days. The most victory points wins. Your rival | Most victory points after day 9 wins. Your rival |
| 4 | src/turnlayer.js:100 | Brew two practice days against Wynne. Most victory points wins. Play any move you like. | Play two practice days against Wynne. Most victory points wins. |
| 5 | src/story-data.js:13 | Tomorrow the Golden Ladle fair opens. Tonight you and Wynne brew two practice days. Most points takes the best stall. | Tomorrow the fair opens. Tonight you and Wynne play two practice days. Most points wins. |
| 6 | src/story-data.js:20 | Tomorrow the Golden Ladle fair opens. You and Wynne brew two practice days tonight. Most points wins. | Tomorrow the fair opens. Tonight you and Wynne play two practice days. Most points wins. |
| 7 | src/story-data.js:8 | The crowd cheers your pot. The fair remembers you. | The crowd cheers your pot. You win! |
| 8 | src/story-data.js:9 | A rival takes the crowd tonight. Tomorrow, brew bolder. | A rival won this one. Try again. |
| 9 | src/story-data.js:10 | Dead level. The judges toss a ladle. | It is a tie. |
| 10 | src/story-data.js:14 | The potion is brewed. Now spend what you earned, apprentice. | The brew is done. Spend your coins at the stalls. |
| 11 | src/story-data.js:15 | Day two is the last day of the fair. Everything is on the line. | Day two is the last day. Make it count. |
| 12 | src/story-data.js:16 | The pots have stopped. Let the fair count what each one earned. | Everyone has stopped. Time to count each pot. |
| 13 | src/story-data.js:21 | Each day the fair draws a fortune. Purple happens now: the pedlar owes us rubies. Take 3. | Each day starts with a fortune card. Purple cards are instant. Take 3 rubies. |
| 14 | src/story-data.js:22 | Rubies are shiny, chips are the brew. Reach into your bag, dear: one chip. | Tap your bag to pull one chip. |
| 15 | src/story-data.js:23 | Ha! It walked  | It moved  |
| 16 | src/story-data.js:23 | : its number. The ring is the prize if you stop here. | , its number. The ring marks your score if you stop. |
| 17 | src/story-data.js:24 | White Fizzpods fill the meter. Past 7 and the pot blows. Draw again, carefully. | White Fizzpods fill the meter. Over 7 and the pot explodes. Draw again. |
| 18 | src/story-data.js:25 |  of 7. Wynne |  of 7. Draw one more. |
| 19 | src/story-data.js:26 | : the pot hisses! Tip the flask. It puts the last white back in the bag. |  is risky. Tap the flask to put the last white back. |
| 20 | src/story-data.js:27 | Phew, saved. Exactly 7 is still safe. Press on. | The white is back in your bag. Exactly 7 is safe. Draw again. |
| 21 | src/story-data.js:28 | Seven. Any white now blows the pot. Wynne would stop here. Be bold: draw! | At 7, any white chip explodes the pot. Tap the bag to risk it. |
| 22 | src/story-data.js:29 | Spaces pay coins and points. Only a safe pot rolls the bonus die | Your space pays coins and points. Only safe pots roll the bonus die |
| 23 | src/story-data.js:30 | Your pot went up! Take  | Your pot exploded. Pick  |
| 24 | src/story-data.js:30 |  coins to shop. Coins buy better chips: take them. |  coins. Take the coins to shop. |
| 25 | src/story-data.js:31 | Now spend. Marrow is a cheap filler. Mossback pays rubies when it is one of your last two chips. | Marrow is cheap and has no power. Mossback gives rubies when it is one of your last two chips. |
| 26 | src/story-data.js:32 | Wren Feather peeks at extra chips. Scarlet Cap slides further for every Marrow in the pot. | Wren Feather peeks at extra chips. Scarlet Cap moves further for each Marrow in your pot. |
| 27 | src/story-data.js:33 | Cinder Moth wins droplet steps. Sunroot opens on day 2, Dusk Sigh on day 3. | Cinder Moth wins droplet steps. Sunroot opens on day 2. Dusk Sigh opens on day 3. |
| 28 | src/story-data.js:34 | You may buy up to two chips, of different colours. Take the Wren Feather: it peeks ahead. | Buy up to two chips of different colours. Take the Wren Feather. |
| 29 | src/story-data.js:35 | Two rubies move your droplet on. Every brew then starts further along. Do it. | Spend 2 rubies to move your droplet one space. Tap it. |
| 30 | src/story-data.js:36 | A used flask comes back for 2 rubies. Fill it, you will want it tomorrow. | Refill a used flask for 2 rubies. Tap the flask. |
| 31 | src/story-data.js:37 | Chips into the bag, rubies spent. The last day awaits. | Your chips go in the bag. Day two is next. |
| 32 | src/story-data.js:38 | Last day! Blue cards last all day: the limit is 9. The rat stone helps whoever trails. | Last day! The limit is 9 today. The rat stone helps whoever is behind. |
| 33 | src/story-data.js:39 | Today you and Wynne choose in secret, then reveal together. Reach in. | You and Wynne choose in secret, then show together. Tap your bag. |
| 34 | src/story-data.js:40 | The feather whispers a chip. Place it as your next one, or send it back. | The feather shows a chip. Place it as your next chip, or put it back. |
| 35 | src/story-data.js:41 | That is enough. Stopping keeps this space: its coins and points are yours. | Stopping keeps this space, with its coins and points. Tap Stop. |
| 36 | src/story-data.js:42 | Last day rule: every 5 coins and every 2 rubies make a point. Let us see who won. | Every 5 coins and every 2 rubies make 1 point. Tap to see who won. |
| 37 | src/story-data.js:43 | Wynne grins. Tomorrow it is for real. | Wynne grins. The real fair starts tomorrow. |
| 38 | src/story-data.js:43 | She smiles. Tomorrow you get your revenge. | She smiles. Win it back tomorrow. |
| 39 | src/story-data.js:47 | The pot blew, dear. Everyone\'s does. Try again. | Your pot exploded. It happens to everyone. Try again. |
| 40 | src/story-data.js:48 | Coins unspent are just weight. Shop sooner next time. | Unspent coins do nothing. Shop earlier next time. |
| 41 | src/story-data.js:50 | The feathers saw that coming. Do you want to try again? | The feathers saw that coming. Try again? |
| 42 | src/story-data.js:51 | Three pots, and one went further. Stay close to the leader. | Another pot went further. Stay close to the leader. |
| 43 | src/story-data.js:52 | The feathers were right. Shall we see if you can change the number? | The feathers were right. Can you change the score? |
| 44 | src/story-data.js:53 | You stopped too early, or too late. Come back when you know which. | You stopped too early or too late. Try again. |
| 45 | src/story-data.js:54 | A crowded bag is a risky bag. Count your Fizzpods and try again. | Too many Fizzpods is risky. Count them and try again. |
| 46 | src/story-data.js:56 | Not yet. The Ladle is patient. Are you? | Not yet. Try again. |
| 47 | src/story-data.js:55 | Once more. We know their tricks now. | Once more. Now you know their tricks. |
| 48 | src/turnlayer.js:101 | Each day the fair draws a fortune. Purple happens now: pick whichever reward you fancy. | Each day starts with a fortune card. Purple cards are instant. Pick a reward. |
| 49 | src/turnlayer.js:102 | Tap the bag to pull a chip. It walks as many spaces along the spiral as its number. | Tap the bag to pull a chip. It moves as many spaces as its number. |
| 50 | src/turnlayer.js:105 | Getting hot? The flask puts your last white chip back in the bag, once a day. | Close to the limit? The flask puts your last white back. Once a day. |
| 51 | src/turnlayer.js:106 | Seven is still safe. Any white chip now explodes the pot. Brave, or wise? | Seven is safe. Any white chip now explodes the pot. Draw or stop? |
| 52 | src/turnlayer.js:107 | Exploded! You pick points OR coins for the day and skip the bonus die. Stopping sooner is the cure. | Your pot exploded. Pick points or coins. You skip the bonus die. |
| 53 | src/turnlayer.js:108 | Good: you keep your space. Safe pots may roll the bonus die when the day is counted. | You keep your space. Safe pots can roll the bonus die. |
| 54 | src/turnlayer.js:109 | Wynne stopped early: a safe, smaller score. You may be bolder, or not. | Wynne stopped early. She scores less but stays safe. |
| 55 | src/turnlayer.js:110 | That is the price of pushing your luck. | She went over the limit. |
| 56 | src/turnlayer.js:111 | The fair counts each pot: coins, points, and a bonus die for safe pots. | Each pot scores coins and points. Safe pots roll a bonus die. |
| 57 | src/turnlayer.js:112 | Spend coins: up to two chips, different colours. Each colour has a power. Press and hold a chip to read it. | Spend coins on up to two chips of different colours. Press and hold a chip to read its power. |
| 58 | src/turnlayer.js:113 | Two rubies move your droplet on, or refill a used flask. Your next brew starts further along. | 2 rubies move your droplet one space or refill your flask. |
| 59 | src/turnlayer.js:114 | Day two is the last: blue fortune cards last all day, and the rat stone helps whoever trails. | Day two is the last day. The rat stone helps whoever is behind. |
| 60 | src/turnlayer.js:115 | Today you and Wynne pick Draw or Stop in secret, then reveal together. No shop today. | You and Wynne pick Draw or Stop in secret. Then both show. No shop today. |
| 61 | src/turnlayer.js:116 | A feather chip peeks ahead: place the chip, or send it back. | Place the chip you peeked at, or put it back. |
| 62 | src/turnlayer.js:117 | Last day rule: every 5 coins and every 2 rubies become 1 point. | Every 5 coins and every 2 rubies make 1 point. |
| 63 | src/turnlayer.js:145 | Final count with your numbers: you made  | You made  |
| 64 | src/turnlayer.js:145 | Things you\'ll meet later | Rules you have not seen yet |
| 65 | src/turnlayer.js:121 | The purple book (days 3+) and the black chips | Purple chips (from day 3) and black chips |
| 66 | src/turnlayer.js:121 | Rat tails: trailing players start the stone ahead | Rat tails: players behind start further ahead |
| 67 | src/turnlayer.js:121 | Nine days, and ties go to the furthest last chip | A full game lasts 9 days. Ties go to the furthest chip |
| 68 | src/ui10.js:13 | Tap the bag. The chip lands on the spiral, as many spaces on as its number. | Tap the bag. The chip moves as many spaces as its number. |
| 69 | src/ui10.js:14 | Draw for more coins and points, or Stop to keep your space. Whites must stay at 7 or less. | Draw to score more, or Stop to keep your space. Keep whites at 7 or less. |
| 70 | src/ui10.js:15 | Another white chip may explode the pot. Stop now, or use the flask on the last white. | Another white chip may explode the pot. Stop, or use the flask. |
| 71 | src/ui10.js:16 | Everyone secretly picks Draw or Stop, then all show together. No shopping today. | Everyone picks Draw or Stop in secret. Then all show. No shop today. |
| 72 | src/ui10.js:17 | Today\'s card lets you choose something. Tap the option you want. | Today\'s card gives a choice. Tap the one you want. |
| 73 | src/ui10.js:18 | A chip lets you choose. Place the chip it shows, or put it all back. | Place the chip shown, or put them all back. |
| 74 | src/ui10.js:19 | title: 'Boom! Choose' | title: 'Your pot exploded' |
| 75 | src/ui10.js:19 | Your pot exploded. Take the victory points, or the coins to go shopping. | Take the victory points or the coins. |
| 76 | src/ui10.js:20 | Tap chips to buy them for your bag: up to two, different colours. | Tap chips to buy up to two. Pick different colours. |
| 77 | src/ui10.js:21 | 2 rubies move your droplet one space on, or refill your flask. Then go on. | 2 rubies move your droplet one space or refill your flask. |
| 78 | src/ui10.js:22 | A chip in your pot earned a bonus. Tap the reward you want. | One of your chips gives a reward. Tap the one you want. |
| 79 | src/ui10.js:27 | Draw chips one by one and stop when you like. Then count the day, shop, and begin again. | Draw chips and stop when you like. Then count your score and shop. |
| 80 | src/ui10.js:28 | White chips add up. More than 7 and the cauldron explodes: you must stop and give something up. | White chips add up. Over 7 and your pot explodes. You must stop. |
| 81 | src/ui10.js:30 | The ring sits one space past your last chip. Its coins buy chips, its points win the game. | The ring sits one space past your last chip. Coins buy chips. Points win. |
| 82 | src/ui10.js:31 | The meter adds up your white chips. Seven is the limit; one more and the pot explodes. | The meter adds up your white chips. Over 7 and the pot explodes. |
| 83 | src/ui10.js:32 | Drawing travels further for more coins and points, but risks an explosion. Stop keeps your space. | Drawing scores more but risks an explosion. Stop keeps your space. |
| 84 | src/ui10.js:33 | It shows the chance that the next chip explodes you. When it turns red, think about Stop. | It shows the chance your next chip explodes. If it is red, think about stopping. |
| 85 | src/ui10.js:34 | Once a day the flask puts the white chip you just drew back in the bag. Rubies refill it. | The flask puts the white chip you just drew back. Once a day. Rubies refill it. |
| 86 | src/ui10.js:35 | When everyone has stopped, the safe cauldron with the most coins rolls the bonus die for a prize. | The safe pot with the most coins rolls the bonus die. |
| 87 | src/ui10.js:36 | Your whites are near 7. A white chip may explode you; other colours are safe. | Your whites are near 7. A white chip may explode your pot. Other colours are safe. |
| 88 | src/ui10.js:37 | Just drew a white? Tap the flask to put it back. You cannot save the chip that exploded you. | Drew a white? Tap the flask to put it back. It cannot undo an explosion. |
| 89 | src/ui10.js:38 | Your last chip stays and you must stop. Then you choose: the points, or the coins to shop. | Your last chip stays and you stop. Then pick the points or the coins. |
| 90 | src/ui10.js:39 | On the last day everybody secretly chooses Draw or Stop. All choices are shown together. | On the last day everyone picks Draw or Stop in secret. Then all show. |
| 91 | src/ui10.js:40 | No shop today. Every 5 coins and every 2 rubies you hold become 1 victory point. | No shop today. Every 5 coins and every 2 rubies make 1 point. |
| 92 | src/ui10.js:41 | The most points wins. A tie goes to the cauldron that reached furthest today. | Most points wins. A tie goes to the pot that reached furthest today. |
| 93 | src/ui10.js:42 | Each day opens with a card. Purple cards happen now, blue cards last the whole day. | Each day starts with a card. Purple is instant. Blue lasts all day. |
| 94 | src/ui10.js:43 | Read the options and tap one. The card text above tells you what each one does. | Read the options and tap one. |
| 95 | src/ui10.js:44 | From day 2, if you trail the leader your first chip starts further on. Tap the rat to use less. | From day 2, players behind start further on. Tap the rat to use less. |
| 96 | src/ui10.js:45 | Some coloured chips have a power when they land. Blue and yellow ones may ask you to choose. | Some chips have a power when they land. Blue and yellow may ask you to choose. |
| 97 | src/ui10.js:46 | A peeked chip can be your next chip, with its power. Or put them all back in the bag. | Place a peeked chip as your next chip. Or put them all back. |
| 98 | src/ui10.js:47 | The last chip stays and the day ends for you. You still score a ruby if your space has one. | Your last chip stays and your day ends. You still get a ruby if your space has one. |
| 99 | src/ui10.js:49 | Better chips make a stronger bag for the next days. Points win the game today. | Better chips help on later days. Points win the game. |
| 100 | src/ui10.js:50 | Spend up to your coins on one or two chips of different colours. New chips go in your bag. | Spend coins on one or two chips of different colours. They go in your bag. |
| 101 | src/ui10.js:51 | Orange is plain. Green gives rubies, blue peeks, red slides, black counts moths. Tap and hold to read. | Orange has no power. Green gives rubies, blue peeks, red moves, black counts. Hold a chip to read it. |
| 102 | src/ui10.js:52 | The yellow stall opens on day 2 and the purple one on day 3. Sold-out chips are gone. | Yellow opens on day 2. Purple opens on day 3. Sold-out chips are gone. |
| 103 | src/ui10.js:53 | Every 2 rubies do one thing: move your droplet one space, or refill the flask. | Spend 2 rubies to move your droplet one space or refill the flask. |
| 104 | src/ui10.js:54 | Your first chip starts at the droplet. Moving it on gives you a head start every day. | Your first chip starts at the droplet. Move it on for a head start each day. |
| 105 | src/ui10.js:55 | Unspent rubies are not lost. At the end of the game 2 rubies count as 1 victory point. | Unspent rubies stay with you. At the end, 2 rubies make 1 point. |
| 106 | src/ui10.js:56 | Green, purple and black chips act after the brew, if they sit near the end of your pot. | Green, purple and black chips act after the brew. |
| 107 | src/ui10.js:57 | The glowing option is a good choice. Read the others if you like, then tap one. | The glowing option is a good pick. Tap one. |
| 108 | src/ui11.js:69 | Each day starts with a fortune card. This purple one happens now. Take 3 rubies. | Each day starts with a fortune card. This purple one is instant. Take 3 rubies. |
| 109 | src/ui11.js:71 | Your chips live in the bag. Tap it to pull one out. | Tap your bag to pull a chip. |
| 110 | src/ui11.js:81 | The chip is back in the bag. Exactly 7 is still safe. Draw again. | The white is back in the bag. Exactly 7 is safe. Draw again. |
| 111 | src/ui11.js:83 | At 7, any white chip explodes the pot. Stopping is safe, but be bold: draw! | At 7, any white chip explodes the pot. Tap the bag to risk it. |
| 112 | src/ui11.js:84 | Be bold: tap the bag. | Tap the bag. |
| 113 | src/ui11.js:87 | Exploded pots choose:  | Your pot exploded. Pick  |
| 114 | src/ui11.js:87 | title: 'Boom: pick one' | title: 'Your pot exploded' |
| 115 | src/ui11.js:89 | Marrow has no power: a cheap filler. Mossback gives rubies when it is one of your last two chips. | Marrow is cheap and has no power. Mossback gives rubies when it is one of your last two chips. |
| 116 | src/ui11.js:91 | Wren Feather peeks at extra chips when it lands. Scarlet Cap slides further for every Marrow already in your pot. | Wren Feather peeks at extra chips. Scarlet Cap moves further for each Marrow in your pot. |
| 117 | src/ui11.js:93 | Cinder Moth: most moths win droplet steps. Sunroot opens on day 2 and Dusk Sigh on day 3. | Cinder Moth: the most moths win droplet steps. Sunroot opens on day 2. Dusk Sigh opens on day 3. |
| 118 | src/ui11.js:95 | You may buy up to two chips of different colours. Tap the Wren Feather: it peeks at extra chips. | Buy up to two chips of different colours. Tap the Wren Feather. |
| 119 | src/ui11.js:97 | 2 rubies move your droplet one space on. Your first chip starts further every day. Tap it. | Spend 2 rubies to move your droplet one space. Tap it. |
| 120 | src/ui11.js:101 | Chips go in your bag and rubies are spent. Tap to begin day 2. | Your chips go in the bag. Tap to start day 2. |
| 121 | src/ui11.js:103 | Blue cards last all day: the limit is 9 now. Trailing on points? The rat stone gives a head start. | Blue cards last all day. The limit is 9 today. The rat stone helps whoever is behind. |
| 122 | src/ui11.js:105 | On the last day both players secretly choose, then reveal together. Tap the bag. | On the last day both players choose in secret, then show. Tap the bag. |
| 123 | src/ui11.js:109 | Stop keeps your space: its coins and points are yours. Tap Stop. | Stop keeps your space, with its coins and points. Tap Stop. |
| 124 | src/ui11.js:111 | Last day: every 5 coins and every 2 rubies give 1 point. Tap to see who won. | Every 5 coins and every 2 rubies make 1 point. Tap to see who won. |
| 125 | src/ui5.js:8 | Draw chips from your bag one by one. Each lands that many spaces along the dotted path in your cauldron. | Draw chips from your bag. Each moves as many spaces as its number. |
| 126 | src/ui5.js:9 | The white chips must add up to 7 or less. Over 7 and the cauldron explodes. | White chips must add up to 7 or less. Over 7 and the pot explodes. |
| 127 | src/ui5.js:10 | Stop whenever you like. Your last chip decides your space: the big number is coins, the small brown badge is victory points. | Stop whenever you like. Your last chip sets your space. The big number is coins. The brown badge is points. |
| 128 | src/ui5.js:11 | Then the day is counted: spend coins on new chips for your bag, spend rubies, and the next day begins. | Then count the day. Spend coins on new chips. Spend rubies if you like. |
| 129 | src/ui5.js:15 | s seer turns up a fortune card. Purple cards happen at once, blue cards last all day. | A fortune card is drawn. Purple is instant. Blue lasts all day. |
| 130 | src/ui5.js:16 | From day 2, anyone behind the leader gets a rat stone: your first chip starts one space further for every rat tail between you and the leader on the score track. | From day 2, players behind get a rat stone. Your first chip starts 1 space further per rat tail you trail by. |
| 131 | src/ui5.js:17 | Everybody brews at the same time. Draw a chip from your bag, it lands on the spiral as many spaces after the last chip as its number. Then decide: draw again, or stop. | Everyone brews at once. Draw a chip. It moves as many spaces as its number. Then draw again or stop. |
| 132 | src/ui5.js:18 | When everyone has stopped, the day is counted: the bonus die, chip powers, rubies, points, shopping. | When everyone has stopped, count the day: bonus die, chip powers, rubies, points, shop. |
| 133 | src/ui5.js:19 | Spend rubies if you like, then the next day begins. Everything you drew goes back in your bag together with what you bought. | Spend rubies if you like. Your drawn chips and new buys go back in the bag. |
| 134 | src/ui5.js:20 | The white chips (Fizzpods) are dangerous. If the white numbers in your cauldron add up to more than 7, the cauldron explodes. The last chip stays, you must stop, and you must choose later: take the victory points of your space or shop with its coins, not both. Only white chips count towards the limit. | White chips (Fizzpods) add up. Over 7 and your pot explodes. Your last chip stays and you stop. Then pick the points or the coins, not both. Only white chips count. |
| 135 | src/ui5.js:21 | Your flask can put the last white chip back into the bag (not the chip that exploded you), once per day. It stays empty until you refill it with 2 rubies. | Once a day, the flask puts your last white chip back in the bag. It cannot undo an explosion. Refill it with 2 rubies. |
| 136 | src/ui5.js:22 | In the last day everybody secretly chooses Draw or Stop, and all choices are revealed together (Stir!). You can also draw at the same moment on every other day: the computers draw while you think. | On the last day everyone picks Draw or Stop in secret. Then all show (Stir!). On other days everyone draws at once. |
| 137 | src/ui5.js:23 | Your scoring space is the one right after your last chip. It shows coins (the big number, for shopping), victory points (the small brown number) and sometimes a ruby. Reach the last space and you get the spoon: 15 points and 35 coins. | Your scoring space is right after your last chip. The big number is coins. The small brown number is points. A ruby may show too. The last space is the spoon: 15 points and 35 coins. |
| 138 | src/ui5.js:25 | Bonus die: among the cauldrons that did not explode, the one whose space has the most coins rolls the die (a tie on coins goes to the one further along the path; if even that is equal, they all roll). It gives 1 or 2 points, a ruby, one step further on for your droplet (your start marker), or a Marrow chip. | Bonus die: among safe pots, the one with the most coins rolls. A tie goes to the furthest chip. Still tied? All roll. It gives 1 or 2 points, a ruby, a droplet step, or a Marrow. |
| 139 | src/ui5.js:26 | Chip powers: black, green and purple chips act now (books say how). | Chip powers: black, green and purple chips work now. |
| 140 | src/ui5.js:28 | Points: you score the victory points of your space (exploded players choose points or shopping). | Points: you score your space\'s points. Exploded players pick points or coins. |
| 141 | src/ui5.js:29 | Shopping: spend up to the coins of your space on one or two chips of different colours. Leftover coins are lost. Sold-out chips are gone. | Shop: spend your space\'s coins on one or two chips of different colours. Unspent coins are lost. |
| 142 | src/ui5.js:30 | Rubies: 2 rubies move your droplet one space (your first chip starts further along every day) or refill the flask. | Rubies: 2 rubies move your droplet one space or refill the flask. |
| 143 | src/ui5.js:31 | Orange and black are always in the shop. Green, blue and red come from the chosen set (1 to 4); yellow opens before day 2 and purple before day 3. Every colour has its own power: blue, red and yellow act when drawn, green, purple and black after the brew. Open the Cards drawer to read every book. | Orange and black are always in the shop. Green, blue and red come from your chosen set (1 to 4). Yellow opens on day 2 and purple on day 3. Blue, red and yellow work when drawn. Green, purple and black work after the brew. Open the Cards drawer to read every chip. |
| 144 | src/ui5.js:32 | On day 9 there is no shopping: every 5 coins and every 2 rubies you hold become 1 victory point. The most points wins; a tie goes to the cauldron that reached furthest on day 9. | Day 9 has no shop. Every 5 coins and every 2 rubies make 1 point. Most points wins. A tie goes to the furthest chip. |
| 145 | src/ui5.js:34 | The ring on the spiral marks where you would score now. The box under the buttons shows the chance that the next chip explodes you. | The ring marks where you score now. The box under the buttons shows your chance of exploding. |
| 146 | src/ui5.js:35 | The small cauldrons at the top are the other players: tap one to watch it. Hot-seat plays one cauldron after the other with a pass screen, online everybody brews in parallel and the host collects every stop. | The small pots at the top are the other players. Tap one to watch. Hot-seat players take turns. Online players brew at once. |
| 147 | src/ui5.js:36 | The lightbulb at the top gives a hint for this very moment. The Menu switches the tips on or off and replays the Tutorial. | The lightbulb gives a hint. The Menu turns tips on or off and replays the Tutorial. |
| 148 | src/ui5.js:38 | Cauldron Fair is an original game. Names, text and art are original; the rules follow the box. | Cauldron Fair is an original game. |
| 149 | src/ui5.js:48 | The big number on a space is its coins (what you can spend in the shop). | The big number is coins to spend in the shop. |
| 150 | src/ui5.js:48 | The small brown badge is its victory points; no badge means none. | The brown badge is points. No badge means none. |
| 151 | src/ui5.js:48 | A pink space with a ruby gives you a ruby when it is your scoring space. | A pink ruby space gives you a ruby when you score it. |
| 152 | src/ui5.js:48 | The dotted path with arrows runs from the droplet (start) outwards to the spoon (15 VP and 35 coins). | The dotted path runs from the droplet to the spoon (15 points, 35 coins). |
| 153 | src/ui5.js:48 | The gold ring is the space you score if you stop now. A chip lands as many spaces further along as its number. | The gold ring is the space you score if you stop. Chips move as many spaces as their number. |
| 154 | src/ui5.js:56 | Blue cards last the whole day, purple cards happen at once. Options that name yellow or purple chips only work once that stall is open.  | Blue cards last all day. Purple cards are instant. Options naming yellow or purple chips need that stall open. |
| 155 | src/ui5.js:60 | Rolled by the cauldron on the highest coin number among those that did not explode. | The safe pot with the most coins rolls it. |
| 156 | src/ui3.js:83 | Boom! But safe harbour saves your points.  | Your pot exploded, but Safe harbour keeps your points.  |
| 157 | src/ui3.js:83 | Your cauldron exploded!  | Your pot exploded.  |
| 158 | src/ui3.js:83 | White total  | Your whites total  |
| 159 | src/ui3.js:84 | Flask used: the white chip went back into your bag. Rubies can refill the flask after the day. | The white chip is back in your bag. Refill the flask with rubies after the day. |
| 160 | src/ui5.js:103 | At least one other maker joins you. | At least one other player joins you. |
| 161 | src/ui6.js:195 | That purchase did not work. | Could not buy that. Try again. |
| 162 | src/net.js:153 | Not connected to the host yet. | Not connected yet. |
| 163 | src/ui2.js:137 | Flask used this day. | Flask used today. |
| 164 | src/ui5.js:100 | Set 1: easiest to learn, recommended for a first game. | Easiest to learn. Best for a first game. |
| 165 | src/data.js:16 | Explosive. Too many and the pot blows. | Explosive. Too many and the pot explodes. |
| 166 | src/data.js:33 | No power. It just fills one space. The cheapest chip in the shop. | No power. It fills one space. The cheapest chip. |
| 167 | src/data.js:35 | After everyone has stopped, compare black chips. 2 players: equal to your rival, droplet one space; more than your rival, droplet and a ruby. 3 or 4 players: more than the player on your left or on your right, droplet one space; more than both, droplet and a ruby. You need at least one black chip. | After everyone stops, compare black chips. You need at least 1 black chip. 2 players: equal to your rival, droplet 1 space. More than your rival, droplet 1 space and a ruby. 3 or 4 players: more than the player on your left or right, droplet 1 space. More than both, droplet 1 space and a ruby. |
| 168 | src/data.js:38 | After the brew, take 1 ruby for each green chip that is your last or your second-to-last chip. Its number does not matter. | After the brew, take 1 ruby for each green chip in your last two. The number does not matter. |
| 169 | src/data.js:39 | After the brew, for each green chip that is last or second-to-last put a free chip in your bag: a green 1 gives an orange 1; a green 2 gives a blue 1 or a red 1; a green 4 gives a yellow 1 or a purple 1 (only if that book is already out). | After the brew, each green chip in your last two gives a free chip for your bag. Green 1: orange 1. Green 2: blue 1 or red 1. Green 4: yellow 1 or purple 1, if that stall is open. |
| 170 | src/data.js:40 | After the brew, if your white chips add up to exactly 7, add the numbers of all green chips in your pot and slide your last chip forward that many spaces. | After the brew, if your whites add up to exactly 7, add up your green chips. Move your last chip forward that many spaces. |
| 171 | src/data.js:41 | After the brew, for each green chip that is last or second-to-last you may pay 1 ruby to move your droplet forward one space. | After the brew, pay 1 ruby per green chip in your last two to move your droplet 1 space. |
| 172 | src/data.js:44 | When it lands, draw as many extra chips from your bag as its number (1, 2 or 4). Place one of them as your next chip, with its power, or none. The rest go back into the bag. | When it lands, draw extra chips equal to its number (1, 2 or 4). Place one as your next chip, or none. The rest go back in the bag. |
| 173 | src/data.js:45 | For the next chips after it (as many as its number: 1, 2 or 4), if your pot explodes you still get the victory points and the coins, but no bonus die. Covers do not add up: the longer remaining one counts. | For your next chips (as many as its number: 1, 2 or 4), an explosion still gives you the points and coins, but no bonus die. Covers do not add up. The longer one counts. |
| 174 | src/data.js:50 | It slides extra spaces by the number of orange chips already in your pot: 1 or 2 oranges give +1, 3 or more give +2. | It moves extra spaces for orange chips already in your pot: 1 or 2 oranges give +1, 3 or more give +2. |
| 175 | src/data.js:51 | Set it beside your pot instead. After you stop (even if exploded) you may add it after your last chip, moving by its number. Or keep it beside the pot for a later round, or put it back in the bag any time. | Set it beside your pot. After you stop, even if exploded, you may add it after your last chip and move by its number. Or keep it for a later day. Or put it back in the bag any time. |
| 176 | src/data.js:53 | Once a red chip is in your pot, every white 1 you draw later moves 2 spaces (it still counts only 1 for the explosion). | Once a red chip is in your pot, each white 1 you draw moves 2 spaces. It still counts as 1 toward the limit. |
| 177 | src/data.js:56 | If it is drawn right after a white chip, you may put that white chip back in the bag. Its space stays empty and the yellow chip stays where it is. | If you draw it right after a white chip, you may put that white back in the bag. Its space stays empty. The yellow chip stays put. |
| 178 | src/data.js:59 | Your 1st yellow chip in the pot moves 1 extra space, your 2nd moves 2 extra, your 3rd moves 3 extra. Later ones get nothing. | Your 1st yellow chip moves 1 extra space, the 2nd 2 extra, the 3rd 3 extra. Later ones get nothing. |
| 179 | src/data.js:62 | After the brew, count purple chips: 1 gives 1 VP; 2 give 1 VP and a ruby; 3 or more give 2 VP and a droplet step. You may take a lower reward. | After the brew, count your purple chips. 1: 1 point. 2: 1 point and a ruby. 3 or more: 2 points and a droplet step. You may take less. |
| 180 | src/data.js:63 | After the brew, hand in purple chips: 1 gives a black 1, 1 VP and a ruby; 2 give a green 1, a blue 2, 3 VP and a droplet step; 3 give a yellow 4, 6 VP, a ruby and two droplet steps. You may hand in fewer than you have, but not use the 2-reward twice. | After the brew, hand in purple chips. 1: black 1, 1 point, ruby. 2: green 1, blue 2, 3 points, droplet step. 3: yellow 4, 6 points, ruby, two droplet steps. You may hand in fewer. Use the 2-chip reward once only. |
| 181 | src/data.js:64 | After the brew, each purple chip scores by its space: spaces 0-9 give 0 VP, 10-19 give 1, 20-29 give 2, 30 and up give 3. | After the brew, each purple chip scores by its space. 0-9: 0 points. 10-19: 1. 20-29: 2. 30 and up: 3. |
| 182 | src/data.js:65 | After the brew: 1 purple lets you swap one 1-chip of your pot for the 2-chip of the same colour; 2 purples swap a 2-chip for the 4-chip; 3 or more swap a 1-chip for a 4-chip. The new chip goes into your bag. | After the brew, swap pot chips for bigger ones. 1 purple: a 1-chip for the 2-chip of its colour. 2 purples: a 2-chip for the 4-chip. 3 or more: a 1-chip for a 4-chip. The new chip goes in your bag. |
| 183 | src/data.js:73 | If your pot explodes this round, the player on your left takes any 2-chip from the shop. | If your pot explodes today, the player on your left takes any 2-chip from the shop. |
| 184 | src/data.js:74 | Right after your 5th chip you may tip all your chips back into the bag and start the round again. Once. | After your 5th chip, you may put all your chips back in the bag and start again. Once. |
| 185 | src/data.js:75 | Whoever rolls the bonus die this round rolls it twice and gets both results. | Whoever rolls the bonus die today rolls it twice and keeps both results. |
| 186 | src/data.js:76 | The explosion limit is 9 this round instead of 7. | The limit is 9 today instead of 7. |
| 187 | src/data.js:77 | This round every orange chip moves 1 extra space. | Today every orange chip moves 1 extra space. |
| 188 | src/data.js:79 | If your scoring space shows a ruby, score 2 VP, even if your pot exploded. | If your scoring space shows a ruby, score 2 points, even if your pot exploded. |
| 189 | src/data.js:80 | At the end of the round every flask is refilled for free. | At the end of the day every flask refills free. |
| 190 | src/data.js:81 | This round you may put the first white chip you draw back into the bag. | Today you may put the first white you draw back in the bag. |
| 191 | src/data.js:86 | The player or players with the fewest rubies take 1 ruby. | Each player with the fewest rubies takes 1 ruby. |
| 192 | src/data.js:87 | The player or players with the fewest victory points take a green 1. | Each player with the fewest points takes a green 1. |
| 193 | src/data.js:88 | Score 4 VP, or take one white 1 out of your bag. | Score 4 points, or take a white 1 out of your bag. |
| 194 | src/data.js:89 | Count your rat tails again: move your rat stone that many extra spaces. | Move your rat stone one extra space per rat tail you trail by. |
| 195 | src/data.js:90 | Everyone draws 5 chips. The lowest total takes a blue 2, everyone else takes a ruby. Chips go back. | Everyone draws 5 chips. The lowest total takes a blue 2. The rest take a ruby. Chips go back. |
| 196 | src/data.js:92 | Take any 4-chip, or score 1 VP for each rat tail you trail the leader by. | Take any 4-chip, or score 1 point per rat tail you trail the leader by. |
| 197 | src/data.js:95 | Draw 4 chips. You may swap one for the next higher chip of its colour; if none can, take a green 1. Chips go back. | Draw 4 chips. Swap one for the next higher chip of its colour. If none can, take a green 1. Chips go back. |
| 198 | src/data.js:83 | Take a black chip, or any 2-chip, or 3 rubies. | Take a black chip, any 2-chip, or 3 rubies. |
| 199 | campaign.json:98 | Welcome to Bramblemere Fair, apprentice. Your bag, your cauldron, nine days of brewing. | Welcome to Bramblemere Fair. You have a bag, a pot and nine days. |
| 200 | campaign.json:102 | Draw a chip, lay it down, then choose: draw again or stop. Too many Fizzpods and it blows. | Draw a chip, then draw again or stop. Too many Fizzpods and it explodes. |
| 201 | campaign.json:134 | Score at least 15 points (winning is not needed). | Score 15 points or more. Winning is optional. |
| 202 | campaign.json:220 | Buy at least 8 new chips over the fair (winning is not needed). | Buy 8 or more chips. Winning is optional. |
| 203 | campaign.json:185 | Coins are not points. Spend them: every chip you buy makes your next brew go further. | Coins are not points. Spend them on chips for your bag. |
| 204 | campaign.json:275 | Odo always draws one chip too many. Let his pot blow; keep yours whole. | Odo always draws one chip too many. Let his pot explode. |
| 205 | campaign.json:279 | From day 2, whoever trails gets a rat stone head start. Falling behind is not the end. | From day 2, whoever is behind gets a rat stone. Falling behind is okay. |
| 206 | campaign.json:199 | A fuller bag, a longer brew. Now you see why the shop matters. | A fuller bag scores more. The shop matters. |
| 207 | campaign.json:369 | New day, new ingredient books. The colours brew differently now; read the stall cards. | New chip books today. The colours work differently. Read the stall cards. |
| 208 | campaign.json:377 | No more coach in your ear. Trust what you learned. | No more tips from here on. |
| 209 | campaign.json:458 | Three cauldrons today. The leader gives everyone else rat stones, so stay close. | Three pots today. Rat stones help whoever is behind, so stay close. |
| 210 | campaign.json:403 | Win the fair with the second set of ingredient books. | Win using chip set 2. |
| 211 | campaign.json:651 | Mirabel plays sharp now. The fourth book set: red chips pay off after reds land. | Mirabel plays sharper now. Set 4: red chips pay off after reds land. |
| 212 | campaign.json:740 | One more Fizzpod 1 from the start. The flask and Wren Feathers matter more now. | You start with one extra Fizzpod 1. The flask and Wren Feathers matter more. |
| 213 | campaign.json:950 | Exact, patient, unafraid. Take the Ladle; you earned it. | Exact, patient, unafraid. Take the Ladle. You earned it. |

ROWS: 213
