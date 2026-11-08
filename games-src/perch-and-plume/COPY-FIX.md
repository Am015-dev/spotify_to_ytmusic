# Perch and Plume: copy fixes

Goal card verdict: ok. It states the aim in one sentence ("Goal: have the most points after N rounds") plus 3 short scoring bullets and one tip line. Only light edits listed below (src/turnui.js goalCard).

| # | file:line | old line | new line |
|---|---|---|---|
| 1 | src/story.js:7 | Dawn, and your notebook is empty. Pip swears he\'ll fill his first. Here are the birds you\'ve spotted so far. | Your notebook is empty. Pip wants to fill his first. These are your birds. |
| 2 | src/story.js:8 | Finches are waking hungry. Your forest row gathers food for them: gain food now. | Tap your forest row to get food. |
| 3 | src/story.js:8 | Listen to that rustle. The forest gives to those who wait. | Nice. Your forest birds fed you. |
| 4 | src/story.js:9 | The feeder holds what the woods offer. Your two forest birds let you pick 2 food. | Your 2 forest birds let you take 2 food. |
| 5 | src/story.js:9 | Two in the basket! An empty feeder simply fills again. | Got 2 food. An empty feeder is rolled again. |
| 6 | src/story.js:10 | See them work? After the forest gave food, each bird there used its power, right to left. | Each forest bird then used its power, right to left. |
| 7 | src/story.js:10 | That chain is your engine. Grow it and every turn gets bigger. | More birds in a row means bigger turns. |
| 8 | src/story.js:11 | A bird in your hand wants a home. Playing it is the other kind of turn. | Now play a bird. Tap a glowing card in your hand. |
| 9 | src/story.js:12 | It nests in the meadow. Birds take the leftmost free space of a row they live in. | Tap the glowing space. A bird takes the first free space in its row. |
| 10 | src/story.js:13 | Pay its food from the card, plus the egg the space asks for. Any 2 food stand in for 1. | Pay the food on the card, plus the egg this space costs. Any 2 food count as 1. |
| 11 | src/story.js:13 | Welcome home! Its points are in your notebook now. | Done. Its points count now. |
| 12 | src/story.js:14 | The meadow is warm and your birds want to nest. More birds in a row make a bigger action. | Lay eggs with your grassland row. More birds there means more eggs. |
| 13 | src/story.js:15 | Put each egg on a bird with room in its nest. Every egg is 1 point. | Tap a bird with room to lay an egg. Each egg is 1 point. |
| 14 | src/story.js:15 | Three eggs, three points. A full nest is a happy nest. | Three eggs, three points. |
| 15 | src/story.js:16 | Pip is whispering about rare birds at the wetland. Your wetland row brings new cards. | Draw birds with your wetland row. They give you new cards. |
| 16 | src/story.js:17 | Pick a bird you can see in the tray, or gamble on the deck. The tray refills after you. | Take a bird from the tray, or one from the deck. The tray refills after you. |
| 17 | src/story.js:17 | A fine find. Pip is already jealous. | Nice pick. |
| 18 | src/story.js:18 | At dusk the round goal is judged. Tonight: most birds in your grassland. Most wins the most points. | The round goal is scored now. This one: most birds in your grassland. |
| 19 | src/story.js:19 | At year\'s end: birds + eggs + goals + bonus card + cached food + tucked cards. A tie? Most food left wins. | Final score: birds, eggs, goals, bonus card, stored food, tucked cards. Ties go to the most food left. |
| 20 | src/story.js:20 | The light is going. Use your last actions your own way, and beat Pip to the count. | Use your last actions as you like. Try to beat Pip. |
| 21 | src/story.js:20 | Let\'s see whose notebook is fuller! | Let\'s count the points. |
| 22 | src/story.js:24 | play a bird. Birds are your biggest points, so tap "Play a bird" and pick a glowing card. | play a bird. Birds give the most points. Tap "Play a bird". |
| 23 | src/story.js:25 | get food. Birds cost food, and the forest gives it: more forest birds, more food. | get food. Birds cost food. More forest birds, more food. |
| 24 | src/story.js:26 | Each die in the feeder is one food. Pick the food your cards ask for. | Each die is one food. Take the food your birds need. |
| 25 | src/story.js:27 | The feeder was empty (or all one face), so all five dice were rolled again. | The feeder was empty or all dice matched, so all 5 dice were rolled. |
| 26 | src/story.js:28 | See that? After a row is used, each bird in it uses its power, right to left. | After you use a row, each bird in it uses its power, right to left. |
| 27 | src/story.js:29 | That bird stored food or tucked a card behind itself: each is 1 point at the end. | Stored food and tucked cards are 1 point each at the end. |
| 28 | src/story.js:30 | Now tap the glowing space: a bird goes in the first free space of its habitat. | Tap the glowing space. A bird takes the first free space in its row. |
| 29 | src/story.js:31 | You pay the food on the card, plus 1 egg for spaces 2 and 3 (2 eggs further right). | Pay the food on the card. Spaces 2 and 3 also cost 1 egg. Spaces 4 and 5 cost 2. |
| 30 | src/story.js:32 | A white power works once, the moment the bird is played. | A white power works once, when you play the bird. |
| 31 | src/story.js:33 | lay eggs. Every egg is 1 point, so this turns your meadow into points. | lay eggs. Each egg is 1 point. |
| 32 | src/story.js:35 | draw birds. New cards are the birds you play next round. | draw birds. Cards in hand are birds you can play later. |
| 33 | src/story.js:36 | Take a bird you can see in the tray, or a surprise from the deck. | Take a bird from the tray, or one from the deck. |
| 34 | src/story.js:37 | This space offers a trade for one more: say yes if it helps, "No thanks" is always fine. | This space offers a trade for 1 more. Say yes, or tap "No thanks". |
| 35 | src/story.js:38 | A bird power is asking you. Skip is always allowed. | A bird power needs your choice. You can always skip. |
| 36 | src/story.js:39 | A pink power works between turns, when someone else does the thing it names. | A pink power works between turns, when another player does what it names. |
| 37 | src/story.js:40 | Now Pip takes a turn. Each step is shown; tap to speed him up. | Pip is playing. Tap to speed him up. |
| 38 | src/story.js:41 | Every die shows the same food: you may reroll the whole feeder before taking. | All dice match. You may reroll the feeder before you take. |
| 39 | src/story.js:43 | The round is over, so its goal was judged: whoever has the most of it scores most. | The round goal is scored. The player with the most gets the most points. |
| 40 | src/story.js:44 | A new round: one fewer action each, the tray is replaced and the first player moves on. | New round: 1 fewer action each, and a new first player. |
| 41 | src/story.js:45 | At the end you score birds + eggs + goals + bonus card + cached food + tucked cards. | Final score: birds, eggs, goals, bonus card, stored food, tucked cards. |
| 42 | src/story.js:48 | Good move: birds are the biggest points, and they make your rows stronger. | Good move. Birds score the most and make your rows stronger. |
| 43 | src/story.js:48 | Your hand is already full: playing a bird would score more than drawing. | Your hand is full. Playing a bird scores more than drawing. |
| 44 | src/story.js:49 | That works too. I will show you the other action next turn. | That works too. We will try the other one next turn. |
| 45 | src/story.js:49 | your choice now. Pick the button marked Best for the most points. | your choice. The button marked Best scores the most. |
| 46 | src/story.js:53 | Get food takes dice from the feeder; more forest birds means more food. | Get food takes dice from the feeder. More forest birds, more food. |
| 47 | src/story.js:57 | Pay the food on the card, plus 1 egg for spaces 2 and 3, and 2 eggs for spaces 4 and 5. | Pay the food on the card. Spaces 2 and 3 cost 1 egg. Spaces 4 and 5 cost 2. |
| 48 | src/story.js:58 | Lay eggs puts eggs on your birds; every egg is 1 point. | Lay eggs puts eggs on your birds. Each egg is 1 point. |
| 49 | src/story.js:61 | The 3 face-up birds are the tray; it refills after each turn. | The 3 face-up birds are the tray. It refills after each turn. |
| 50 | src/story.js:62 | On a rival\'s turn, each step is shown; tap to speed it up. | On a rival's turn, tap to speed it up. |
| 51 | src/story.js:63 | At the end of each round its goal is judged: most of it scores most. | At the end of each round, the goal is scored. Most gets the most points. |
| 52 | src/story.js:69 | From here every choice is yours: play a bird, or use a row. I\'ll pipe up when something new comes along. | From here on you choose. I will speak up when something new comes up. |
| 53 | src/story.js:70 | A fuller notebook than Pip\'s on your very first day. The Larchwood has a new naturalist! | You beat Pip on your first day. Well done! |
| 54 | src/story.js:70 | Pip wins this one, but you know every move now. Tomorrow the year begins. | Pip wins this time. You know every move now. |
| 55 | src/story.js:72 | A fresh spring morning: fill your notebook before the others do. | Spring morning. Fill your notebook first. |
| 56 | src/story.js:72 | The feeders are full and the rivals are up early. | The feeder is full. Your rivals are already up. |
| 57 | src/story.js:73 | Your notebook is the talk of the county! | You won. Great notebook! |
| 58 | src/story.js:73 | Not this year. The birds will be back in spring. | Not this time. Try again? |
| 59 | src/story.js:73 | Two notebooks, one score. The birds call it a draw. | A tie. Same score. |
| 60 | src/story.js:76 | Every naturalist starts somewhere. Try again: birds and eggs are all you need. | Try again. Birds and eggs are all you need. |
| 61 | src/story.js:77 | The forest needs more birds before it can carry you. Plant three there next time. | Put 3 birds in your forest next time. |
| 62 | src/story.js:82 | My fish run was faster. Build your engine early, or not at all. | My fish run was faster. Build your rows early. |
| 63 | src/story.js:81 | A lean season is hard on everyone. Spend your food on birds that pay back. | Spend your food on birds that pay you back. |
| 64 | src/screens.js:28 | Solo: you play against the Rival Flock, a simple deck-driven rival that grabs dice, lays eggs and races you for the round goals. | Solo: you play the Rival Flock. It takes dice, lays eggs and races you for goals. |
| 65 | src/screens.js:32 | Race (most wins) | Most scores most |
| 66 | src/screens.js:68 | Keep 5 things in total: birds and food. We picked a good start; tap to change it. | Keep 5 in total, birds and food. We chose for you. Tap to change. |
| 67 | src/screens.js:72 | Secret bonus card (scores at the end): | Pick a secret bonus card. It scores at the end. |
| 68 | src/screens.js:100 | You won the year, but this chapter is only cleared when its goal is met. Try again! | You won, but the chapter goal was not met. Try again. |
| 69 | src/screens.js:100 | Try again: the goal is shown at the top of the board. | Try again. The goal is at the top of the board. |
| 70 | src/screens.js:101 | Stars are earned once the goal is met. | Stars need the goal met first. |
| 71 | src/screens.js:106 | Birds = card points. Food = food cached on birds. Ties go to the most food left over. | Birds are card points. Food is stored on birds. Ties go to the most food left. |
| 72 | src/screens.js:118 | Attract birds to your three habitats over 4 rounds. Most points wins: birds, bonus cards, round goals, eggs, cached food and tucked cards are each worth points. | Get the most points after 4 rounds. Points come from birds, eggs, round goals, your bonus card, stored food and tucked cards. |
| 73 | src/screens.js:119 | Take ONE action: play a bird from your hand, or use a habitat row. Each round you get fewer actions: 8, then 7, 6 and 5. | Do ONE thing: play a bird, or use a row. You get 8 actions in round 1, then 7, 6 and 5. |
| 74 | src/screens.js:120 | Take food dice from the birdfeeder. The more birds in your forest, the more food. When the feeder is empty, all 5 dice are rolled again; if every die shows the same food you may reroll. | Take food dice from the feeder. More forest birds, more food. An empty feeder is rolled again. If all dice match, you may reroll. |
| 75 | src/screens.js:121 | Put eggs on your birds (each bird holds only as many as its nest shows). Each egg is 1 point and pays for playing birds further right. | Put eggs on your birds. A bird holds only as many as its nest shows. Each egg is 1 point. Eggs also pay for birds further right. |
| 76 | src/screens.js:122 | Take birds from the face-up tray of 3 or from the deck. The tray refills at the end of the turn. | Take birds from the 3 in the tray, or from the deck. The tray refills after your turn. |
| 77 | src/screens.js:123 | Every second space in a row offers a trade: a card for 1 more food, a food for 1 more egg, or an egg for 1 more card. | Every second space offers a trade. Pay a card for 1 more food, a food for 1 more egg, or an egg for 1 more card. |
| 78 | src/screens.js:124 | Pay its food (any 2 food can stand in for 1) and put it in the leftmost empty space of a habitat it lives in. Spaces 2 and 3 cost 1 egg, spaces 4 and 5 cost 2 eggs. | Pay its food. Any 2 food count as 1. Put it in the first free space of a matching row. Spaces 2 and 3 cost 1 egg. Spaces 4 and 5 cost 2. |
| 79 | src/screens.js:125 | Brown powers fire every time you use that row, one by one from right to left. White powers fire once when the bird is played. Pink powers react to other players between your turns. | Brown powers work each time you use that row, right to left. White powers work once, when you play the bird. Pink powers work between turns, when others act. |
| 80 | src/screens.js:126 | The round goal is scored: most items gets the most points (4/1/0 in round 1 up to 7/4/3 in round 4); ties share. The tray is refreshed and the first player passes on. | The round goal is scored. Most gets the most points: 4/1/0 in round 1, up to 7/4/3 in round 4. Ties share. The tray refills and the first player changes. |
| 81 | src/screens.js:127 | After round 4, add up card points, bonus cards, goals, eggs, cached food and tucked cards. Ties go to the most leftover food. | After round 4, add up all your points. Ties go to the most food left. |
| 82 | src/screens.js:131 | Play a bird from your hand into a row (pay the food on the card). | Play a bird into a row. Pay the food on its card. |
| 83 | src/screens.js:131 | Or tap a row button: forest = food, grassland = eggs, wetland = cards. | Or use a row: forest gives food, grassland gives eggs, wetland gives cards. |
| 84 | src/screens.js:132 | Food and eggs you pay for a bird are picked for you (cheapest first). | The game picks the food and eggs you pay, cheapest first. |
| 85 | src/screens.js:132 | The solo Rival Flock is this game\'s own simple deck. | The Rival Flock plays from its own small deck. |
| 86 | src/screens.js:132 | A row\'s trade (card for food, food for egg, egg for card) is offered before the row\'s gain, not after. | A row's trade is offered before its gain, not after. |
| 87 | src/screens.js:132 | Row yields: forest and wetland 1,1,2,2,3,3; grassland 2,2,3,3,4,4; a trade on every second space. | Row gains: forest and wetland 1,1,2,2,3,3. Grassland 2,2,3,3,4,4. A trade on every second space. |
| 88 | src/screens.js:132 | The 4 round goals never repeat a family. | The 4 round goals are all different kinds. |
| 89 | src/screens.js:132 | When the feeder dice all match and a power wants a food that is not there, the dice are rerolled for you. | If all dice match and a power needs a food they lack, they are rerolled for you. |
| 90 | src/screens.js:144 | 'Now: ' + G.pl.map | 'So far: ' + G.pl.map |
| 91 | src/screens.js:153 | Goal marks this round:  | Goal count this round:  |
| 92 | src/screens.js:173 | Songs play here once the music files are added. | Songs will play here when music is added. |
| 93 | src/screens.js:184 | Scored at the end of a round: most wins. | Scored at the end of a round. Most scores most. |
| 94 | src/render.js:130 | Now tap a glowing space on your board | Tap a glowing space on your board |
| 95 | src/render.js:144 | Your birds are at work, one by one. | Your birds are using their powers. |
| 96 | src/render.js:152 | Tap a glowing food die in the feeder to take it ( | Take a food die from the feeder ( |
| 97 | src/render.js:153 | Tap a glowing bird on your board to lay an egg on it ( | Tap a glowing bird to lay an egg ( |
| 98 | src/render.js:154 | Tap a glowing bird in the tray, or the deck, to take a card ( | Take a bird from the tray or the deck ( |
| 99 | src/turnui.js:45 | pick from ' + nPl + ' you can pay for | ' + nPl + ' you can afford |
| 100 | src/turnui.js:191 | points printed on birds played | printed on your birds |
| 101 | src/turnui.js:191 | judged at each round end | scored at each round end |
| 102 | src/turnui.js:152 | Lesson learned! | Well done. |
| 103 | src/turnui.js:154 | Good: food now lets you play birds next turn. | Good: food lets you play birds next turn. |
| 104 | src/turnui.js:180 | Hints on: previews, Best badges and a rating after each turn. | Hints on. You get previews, Best tags and a rating after each turn. |
| 105 | src/turnui.js:205 | <li><b>Birds</b> score the points printed on them. Play birds by paying their food.</li> | <li><b>Birds</b> show their points. Pay food to play them.</li> |
| 106 | src/turnui.js:208 | Each turn you do one thing. Tap the score line any time to see how it adds up. | Each turn, do one thing. Tap the score line to see how it adds up. |
| 107 | src/flow.js:17 | Deck: ' + G.deck.length + ' birds. Draw birds takes from here or the tray. | Deck: ' + G.deck.length + ' birds. "Draw birds" takes from here or the tray. |
| 108 | src/flow.js:16 | die. Get food takes dice from here. | die. "Get food" takes dice from here. |
| 109 | src/flow.js:82 | 'Not allowed: ' + r.err | 'You cannot do that: ' + r.err |
| 110 | src/flow.js:64 | No room in its habitat. | No room in its row. |
| 111 | src/flow.js:65 | Not enough eggs to pay for that column. | Not enough eggs for that space. |
| 112 | src/flow.js:198 | Hand the device over. Your cards stay hidden until you tap. | Hand over the device. Your cards stay hidden until you tap. |
| 113 | src/engine.js:491 | can only reroll when every die matches | you can reroll only when all dice match |
| 114 | src/engine.js:556 | cannot play there | that bird cannot go there |
| 115 | src/engine.js:558 | payment does not fit | that payment does not fit |
| 116 | src/engine.js:504 | err('nest full') | err('that nest is full') |
| 117 | src/engine.js:504 | err('wrong nest') | err('that bird has a different nest type') |
| 118 | src/engine.js:286 | No power. A sturdy bird worth its points. | No power. Only its points. |
| 119 | src/engine.js:289 | Gain 1 ' + FN[x[0]] + ' from the birdfeeder, if there is one. | Gain 1 ' + FN[x[0]] + ' from the feeder, if there is one. |
| 120 | src/engine.js:291 | Cache 1 ' + FN[x[0]] + ' from the supply on this bird. | Store 1 ' + FN[x[0]] + ' from the supply on this bird. |
| 121 | src/engine.js:292 | Take 1 ' + FN[x[0]] + ' from the birdfeeder, if there is one, and cache it on this bird. | Take 1 ' + FN[x[0]] + ' from the feeder, if there is one, and store it on this bird. |
| 122 | src/engine.js:301 | Roll all dice not in the birdfeeder. If any shows ' + FN[x[0]] + ', cache 1 ' + FN[x[0]] + ' on this bird. | Roll all dice outside the feeder. If any shows ' + FN[x[0]] + ', store 1 ' + FN[x[0]] + ' on this bird. |
| 123 | src/engine.js:310 | When played: gain every ' + FN[x[0]] + ' in the birdfeeder. | When played: gain every ' + FN[x[0]] + ' in the feeder. |
| 124 | src/engine.js:312 | Between your turns, once: when another player lays eggs, lay 1 egg on this bird. | Once between your turns: when another player lays eggs, lay 1 egg on this bird. |
| 125 | src/engine.js:313 | Between your turns, once: when another player gains food, gain 1 ' + FN[x[0]] + ' from the supply. | Once between your turns: when another player gains food, gain 1 ' + FN[x[0]] + ' from the supply. |
| 126 | src/engine.js:314 | Between your turns, once: when another player plays a bird in their  | Once between your turns: when another player plays a bird in their  |
| 127 | src/engine.js:328 | ev.txt = 'cached 1 ' + x[0] | ev.txt = 'stored 1 ' + x[0] |
| 128 | src/engine.js:491 | ' rerolls the birdfeeder.' | ' rerolls the feeder.' |
| 129 | src/engine.js:449 | 'gain ' + y.n + ' food' : h === 1 ? 'lay ' + y.n + ' eggs' : 'draw ' + y.n + ' cards' | 'gets ' + y.n + ' food' : h === 1 ? 'lays ' + y.n + ' eggs' : 'draws ' + y.n + ' cards' |
| 130 | src/data.js:2 | Birds whose power caches food | Birds whose power stores food |
| 131 | src/data.js:2 | Full egg sets (1 per row) | Fewest eggs in any one row |
| 132 | src/shelfkit.js:56 | A bird goes in the leftmost free space. Spaces further right cost eggs. | A bird takes the first free space. Spaces further right cost eggs. |
| 133 | src/shelfkit.js:57 | The birdfeeder | The feeder |
| 134 | src/shelfkit.js:59 | The tray shows three birds; the deck is a surprise. | The tray shows 3 birds. The deck is face down. |
| 135 | src/shelfkit.js:57 | Each die is one food. An empty feeder rolls all five dice again. | Each die is one food. An empty feeder is rerolled. |
| 136 | src/shelfkit.js:60 | This space offers a trade for one more. Yes or no thanks. | This space offers a trade for 1 more. Say yes or no. |
| 137 | src/shelfkit.js:61 | This bird asks for a decision. Skip is always allowed. | This bird needs your choice. You can always skip. |
| 138 | src/shelfkit.js:64 | More birds in a row means a bigger action, and every brown power in it fires. | More birds in a row means a bigger action. Every brown power in it works. |
| 139 | src/shelfkit.js:65 | Pay the food shown. Any two food can stand in for one. | Pay the food shown. Any 2 food count as 1. |
| 140 | src/shelfkit.js:66 | The food your birds in hand need is the best food. | Take the food your hand needs. |
| 141 | src/ai.js:154 | Gather food: your birds in hand need it. | Get food: your hand needs it. |
| 142 | src/ai.js:154 | Draw cards: you need more birds to play. | Draw birds: you need more to play. |
| 143 | src/ai.js:158 | Nothing in the tray fits; try the deck. | Nothing in the tray fits. Try the deck. |
| 144 | src/ai.js:156 | This nest has room and helps your goals. | This nest has room. It helps your goals. |

ROWS: 144
