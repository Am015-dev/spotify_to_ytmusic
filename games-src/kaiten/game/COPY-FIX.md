# Kaiten Kitchen copy fixes

Goal card verdict: rewritten (the Rules "The goal" section ran three sentences and listed no scoring bullets; GOAL row below).

| # | file:line | old line | new line |
|---|---|---|---|
| GOAL 1 | src/ui5.js:6 | You are a diner at a conveyor-belt sushi bar. Collect plates over three rounds and score points for sets, pairs, ladders and races. The highest total after the third round wins. Ties go to the diner with more Custard Cups. | Aim: finish three rounds with the most points.<br>- Pairs, sets and bun stacks score every round.<br>- Roll icons and nigiri score every round.<br>- Custard Cups score once, at the end. |
| 2 | src/ui5.js:6 | (new line after the Goal card) | A tie goes to the diner with more Custard Cups. |
| 3 | src/data.js:10 | A lone one scores nothing. | Every pair of Crispy Prawns scores 5. A single one scores nothing. |
| 4 | src/data.js:11 | Collect three Fish Slices for 10 points. One or two score nothing. | Every set of three Fish Slices scores 10. One or two score nothing. |
| 5 | src/data.js:12 | The more Steam Buns you stack, the better: 1, 3, 6, 10, then 15 points for five or more. | Buns score 1, 3, 6, 10, then 15 for five or more. |
| 6 | src/data.js:13 | Two roll icons. Most icons this round scores 6, second most scores 3. | Two roll icons. Most icons scores 6. Second most scores 3. |
| 7 | src/data.js:14 | Three roll icons. Most icons this round scores 6, second most scores 3. | Three roll icons. Most icons scores 6. Second most scores 3. |
| 8 | src/data.js:15 | One roll icon. Most icons this round scores 6, second most scores 3. | One roll icon. Most icons scores 6. Second most scores 3. |
| 9 | src/data.js:16 | Worth 2 points, or 6 if it lands on Fire Paste. | Worth 2 points. Worth 6 on Fire Paste. |
| 10 | src/data.js:17 | Worth 3 points, or 9 if it lands on Fire Paste. | Worth 3 points. Worth 9 on Fire Paste. |
| 11 | src/data.js:18 | Worth 1 point, or 3 if it lands on Fire Paste. | Worth 1 point. Worth 3 on Fire Paste. |
| 12 | src/data.js:19 | The next nigiri you play lands on it and scores triple. With no nigiri it scores nothing. | Your next nigiri goes on it and scores triple. No nigiri, no points. |
| 13 | src/data.js:20 | Keep it on the table. On a later turn pick two cards from your hand, then put Twin Sticks back into that hand. | Keep it on your counter. Later, take two dishes in one turn. Then the sticks go back in your hand. |
| 14 | src/data.js:21 | Kept until the game ends. Most Custard Cups score 6, fewest lose 6 (nobody loses points in a 2-player game). | Kept until the game ends. Most cups score 6. Fewest lose 6. With two diners, nobody loses. |
| 15 | src/story.js:8 | Welcome to the Turning Plate. The belt rolls! | Welcome to the Turning Plate. Let's eat! |
| 16 | src/story.js:9 | You cleared the belt. Auntie Suzu is proud. | You win! Auntie Suzu is proud of you. |
| 17 | src/story.js:9 | %R takes the Golden Plate. Same belt tomorrow? | %R wins this one. Play again? |
| 18 | src/story.js:9 | A dead heat. The belt keeps turning. | It's a tie. Play again? |
| 19 | src/story.js:11 | 1. Everyone looks at their own hand of plates. | 1. Look at your hand of plates. |
| 20 | src/story.js:11 | 2. Pick ONE plate. Everybody picks at the same time. | 2. Pick one dish. Everyone picks together. |
| 21 | src/story.js:11 | 3. The covers lift, one diner after another, and each plate lands on its owner\'s counter. | 3. The covers lift. Each dish lands on its owner's counter. |
| 22 | src/story.js:11 | 4. Your points pop up with the reason. | 4. Your points show, with the reason. |
| 23 | src/story.js:11 | 5. Your leftover hand slides to the next diner, theirs comes to you. Repeat until the hands are empty. | 5. Pass your hand to the next diner. Repeat until the hands are empty. |
| 24 | src/story.js:19 | cover: 'Picks are in\|Covers lift one by one.' | Picks are in\|Covers lift next. |
| 25 | src/story.js:21 | pass: 'Hands pass\|Leftovers go to %N.' | Hands pass\|Your hand goes to %N. |
| 26 | src/story.js:22 | roundEnd: 'Round over\|Counting the counters.' | Round over\|Counting the points. |
| 27 | src/story.js:26 | Staff lunch! Odile bet a custard you can\'t beat her. | Odile bets a custard you can't beat her. |
| 28 | src/story.js:27 | Plates score more together. Hot paste, clever tricks. | Dishes score more together. Learn pairs, paste and sticks. |
| 29 | src/story.js:28 | Sets, a roll race, a bun ladder. The belt keeps moving. | Learn sets, roll icons and buns. |
| 30 | src/story.js:29 | Lunch is over. Now the counters are counted aloud. | Lunch is over. Time to count the points. |
| 31 | src/story.js:33 | I\'m Auntie Suzu. Today you cook up the most points at lunch. | I'm Auntie Suzu. Score the most points at lunch. |
| 32 | src/story.js:35 | You get a hand of plates. Take one, pass the rest to Odile. | Take one dish from your hand. Pass the rest to Odile. |
| 33 | src/story.js:36 | Start with a Crispy Prawn. Prawns love company. | Take a Crispy Prawn. Two make a pair. |
| 34 | src/story.js:36 | Nice. Both covers lift, and the hands swap! | Nice. Both covers lift. Then the hands swap. |
| 35 | src/story.js:37 | Odile\'s leftovers are yours now. Plates rode the belt over. | Odile's leftover dishes are now your hand. |
| 36 | src/story.js:39 | Hot paste triples the next nigiri. Take it first. | Fire Paste triples your next nigiri. Take it first. |
| 37 | src/story.js:39 | Smart. The paste waits for a nigiri. | Good. The paste waits for a nigiri. |
| 38 | src/story.js:40 | The Moon Nigiri lands on the paste: 3 becomes 9! | The Moon Nigiri goes on the paste. 3 becomes 9. |
| 39 | src/story.js:41 | Sticks let you take two plates later. Keep them handy. | Twin Sticks let you take two dishes later. |
| 40 | src/story.js:41 | The sticks are yours. Use them next turn. | The sticks are on your counter. Use them next turn. |
| 41 | src/story.js:42 | Time for a double helping. Pick up the sticks. | Tap the Twin Sticks to take two dishes. |
| 42 | src/story.js:42 | Two plates this turn. Odile is nervous. | Two dishes this turn. Odile is nervous. |
| 43 | src/story.js:44 | Grab the other. Sticks go back in the hand you pass. | Tap the other one. The sticks go back in your hand. |
| 44 | src/story.js:44 | Two Fish Slices! One more makes a set. | Two Fish Slices. One more makes a set. |
| 45 | src/story.js:45 | Three Fish Slices: 10 points. Find the third. | Three Fish Slices score 10. Find the third. |
| 46 | src/story.js:46 | Rolls race for icons. Most icons wins 6. | Most roll icons scores 6. |
| 47 | src/story.js:46 | Three icons! Odile has one. | Three icons. Odile has one. |
| 48 | src/story.js:47 | Each bun is worth more than the last: 1, 3, 6, 10, 15. | Each bun scores more than the last: 1, 3, 6, 10, 15. |
| 49 | src/story.js:48 | Custard pays at the end of the game. Most cups gets 6. | Custard scores at the end of the game. Most cups scores 6. |
| 50 | src/story.js:48 | Custard saved for the final count. | Custard is kept for the end. |
| 51 | src/story.js:49 | Prawn pair, Fish Slice set, and a Steam Bun. | Your Prawn pair, Fish Slice set and Steam Bun. |
| 52 | src/story.js:50 | More icons than Odile: you take the big prize. | You have more icons than Odile. You score 6. |
| 53 | src/story.js:51 | Your Moon Nigiri on the paste is the star plate. | Your Moon Nigiri on the paste scored the most. |
| 54 | src/story.js:52 | Same rules for her. Her lone Fish Slice scores nothing. | Same rules for her. Her single Fish Slice scores nothing. |
| 55 | src/story.js:53 | Custard only pays at the very end of a meal. | Custard scores once, at the end of the game. |
| 56 | src/story.js:54 | Odile owes you a custard. A real meal lasts three rounds. | Odile owes you a custard. A real game has three rounds. |
| 57 | src/story.js:58 | First plate, first swap. You are a diner now. | First dish, first swap. You're a diner now. |
| 58 | src/story.js:59 | Paste, nigiri, sticks. A clever kitchen! | Paste, nigiri, sticks. Well done. |
| 59 | src/story.js:60 | A set, a race and a ladder. Not bad at all. | A set, a roll race and buns. Well done. |
| 60 | src/story.js:61 | The count is done. Now you are ready for real meals. | The count is done. You're ready for a real game. |
| 61 | src/story.js:63 | The Turning Plate cheers for you. | You win! Nice game. |
| 62 | src/story.js:63 | The belt turns on. There is always the next meal. | You lost this one. Try again. |
| 63 | src/story.js:67 | Odile bet a custard you cannot win, Mina. Pick any dish you like! | Odile bet you can't win, Mina. Pick any dish. |
| 64 | src/story.js:68 | Picks flip together, then your leftovers ride the belt to the next diner. | Picks flip together. Then your hand goes to the next diner. |
| 65 | src/story.js:69 | Crispy Prawns score 5 per PAIR. You have %n: one more makes a pair. | Crispy Prawns score 5 per pair. You have %n. One more makes a pair. |
| 66 | src/story.js:70 | A pair of prawns: 5 points. Every extra pair scores again. | A pair of prawns scores 5. Each extra pair scores 5 more. |
| 67 | src/story.js:71 | Fish Slices score 10 per SET of three. One or two score nothing. | Fish Slices score 10 per set of three. One or two score nothing. |
| 68 | src/story.js:72 | Steam Buns climb: 1, 3, 6, 10, then 15 for five. Stack them! | Steam Buns score 1, 3, 6, 10, then 15 for five. |
| 69 | src/story.js:73 | Seaweed Rolls race: most icons this round wins 6, second wins 3. | Most roll icons scores 6. Second most scores 3. |
| 70 | src/story.js:74 | Nigiri score 1 to 3 points on their own: Sun 1, Sunset 2, Moon 3. | Nigiri score on their own: Sun 1, Sunset 2, Moon 3. |
| 71 | src/story.js:75 | Fire Paste triples the NEXT nigiri you serve. Paste first, nigiri after! | Fire Paste triples your next nigiri. Take the paste first. |
| 72 | src/story.js:76 | Nigiri on Fire Paste: tripled! That is the best trick on the belt. | Nigiri on Fire Paste scores triple. Nice. |
| 73 | src/story.js:77 | Twin Sticks: keep them, then tap the glowing sticks to take two dishes. | Keep the Twin Sticks. Later, tap them to take two dishes. |
| 74 | src/story.js:78 | Custard Cups pay only at the very end: most +6, fewest -6. | Custard Cups score at the end. Most +6, fewest -6. |
| 75 | src/story.js:79 | Fire Paste for me. My next nigiri triples. Watch your plates, Mina! | I took Fire Paste. My next nigiri scores triple. |
| 76 | src/story.js:80 | Rolls are mine this round. You will have to race me! | I'm ahead on rolls. Catch up if you can! |
| 77 | src/story.js:81 | Lovely pick! The green +N on a plate is what it scores right now. | Good pick! The green +N shows what a dish scores now. |
| 78 | src/story.js:82 | Hmm. %n was worth more right now. Check the green +N before you pick. | %n would have scored more. Check the green +N before you pick. |
| 79 | src/story.js:83 | Round 2: a new hand. Custard Cups stay, everything else is cleared. | Round 2. You get a new hand. Only Custard Cups stay. |
| 80 | src/story.js:84 | Last round! Custard gets counted right after it. | Last round! Custard is counted right after it. |
| 81 | src/story.js:85 | Round scored. Let us count it together, rule by rule. | Round scored. Let's count it together. |
| 82 | src/story.js:86 | A roll tie! Tied for most split 6 (rounded down), nobody gets second. | A roll tie. Tied players split 6, rounded down. No second prize. |
| 83 | src/story.js:87 | Custard: most cups +6, fewest -6, ties split. Counted once, at the end. | Custard: most cups +6, fewest -6. Ties split the points. |
| 84 | src/story.js:88 | With three diners, the fewest cups LOSES 6. Two diners never lose. | With three or more diners, fewest cups loses 6. With two, nobody loses. |
| 85 | src/story.js:89 | Custard ties split the points, rounded down. | Tied Custard splits the points, rounded down. |
| 86 | src/story.js:90 | Equal totals? More Custard Cups wins the meal. | Same total? More Custard Cups wins. |
| 87 | src/ui1.js:111 | Twin Sticks on the table: on a later turn you may serve two plates from your hand, then the sticks go back into that hand and move on to the next diner with it. | Twin Sticks let you take two dishes in one later turn. Then they go back in your hand. |
| 88 | src/ui1.js:134 | Fire Paste and a nigiri together: the nigiri scores triple. | Fire Paste and a nigiri together score triple for the nigiri. |
| 89 | src/ui1.js:135 | Twin Sticks: two plates for one turn | Twin Sticks: two dishes this turn |
| 90 | src/ui1.js:137 | This finishes a pair of prawns: +5. | This makes a pair of prawns: +5. |
| 91 | src/ui1.js:137 | The start of a prawn pair (5 points once you have two). | Start a prawn pair. Two prawns score 5. |
| 92 | src/ui1.js:138 | This finishes a set of fish slices: +10. | This makes a set of Fish Slices: +10. |
| 93 | src/ui1.js:138 | Fish slices only score in sets of three. | Fish Slices score only in sets of three. |
| 94 | src/ui1.js:139 | Each extra bun is worth more: now | Each bun scores more than the last. Score now: |
| 95 | src/ui1.js:140 | Roll icons race for the most this round (6 points, second 3). | Most roll icons scores 6. Second most scores 3. |
| 96 | src/ui1.js:141 | Your Fire Paste is waiting: this nigiri scores triple | Your Fire Paste is waiting. This nigiri scores triple |
| 97 | src/ui1.js:141 | A nigiri is worth ' + NIG[x] + ' point | Nigiri score ' + NIG[x] + ' point |
| 98 | src/ui1.js:141 | ' straight away.' | ' right away.' |
| 99 | src/ui1.js:142 | Fire Paste triples the next nigiri you serve. | Fire Paste triples your next nigiri. |
| 100 | src/ui1.js:143 | Twin Sticks let you serve two plates on a later turn. | Twin Sticks let you take two dishes later. |
| 101 | src/ui1.js:144 | Custard is kept to the end of the game: most scores +6, fewest loses 6. | Custard scores at the end. Most +6, fewest -6. |
| 102 | src/ui1.js:100 | every pair is worth 5 points | every pair scores 5. One more makes another pair. |
| 103 | src/ui1.js:101 | each set of three is worth 10 points | every set of three scores 10. Another set needs N more. |
| 104 | src/ui1.js:102 | the next bun makes it | the next bun makes it N. Five or more is the top score. |
| 105 | src/ui1.js:103 | not scoring yet. Most icons scores 6, second most 3. | No points yet. Most icons scores 6, second most 3. |
| 106 | src/ui1.js:108 | tripled to | triple: N each. |
| 107 | src/ui1.js:110 | Fire Paste waiting for a nigiri: your next nigiri lands on it and scores triple. With none it scores nothing. | Fire Paste is waiting. Your next nigiri scores triple. |
| 108 | src/ui1.js:168 | Twin Sticks: two plates on a later turn | Twin Sticks: take two dishes later |
| 109 | src/ui1.js:167 | the Fire Paste waits to triple | the Fire Paste will triple |
| 110 | src/ui1.js:169 | used Twin Sticks to serve two | used Twin Sticks to take two |
| 111 | src/ui1.js:170 | custard is counted at the end of the game | custard scores at the end |
| 112 | src/ui1.js:171 | scores when the set is complete | scores when the set is done |
| 113 | src/ui1.js:165 | : someone else served rolls | : another diner played rolls |
| 114 | src/ui1.js:181 | Last turn of round ' + n.round + ': | Last turn, round N: |
| 115 | src/ui2.js:107 | Nothing served yet | Nothing yet |
| 116 | src/ui2.js:196 | Custard scores at the end of the game | Custard scores at the end |
| 117 | src/ui2.js:202 | The belt is empty: new plates are coming. | Your hand is empty. A new hand is coming. |
| 118 | src/ui2.js:202 | Watching the belt. | Watching the game. |
| 119 | src/ui2.js:202 | The meal is over. | The game is over. |
| 120 | src/ui2.js:232 | Pass the device to ' + pname(UI.cards[0].seat) + '. | Pass the device to NAME. |
| 121 | src/ui2.js:234 | The chefs are choosing… | The other diners are choosing… |
| 122 | src/ui2.js:239 | Now tap a second dish | Tap a second dish |
| 123 | src/ui2.js:240 | Tap it again to serve | Tap it again to take it |
| 124 | src/ui2.js:240 | Press Serve to grab it | Press Take to confirm |
| 125 | src/ui2.js:241 | Tap a dish to grab it | Tap a dish to take it |
| 126 | src/ui2.js:297 | Put the plate back | Put the dish back |
| 127 | src/ui8.js:13 | n === 2 ? 'Serve both' : 'Serve' | n === 2 ? 'Take both' : 'Take' |
| 128 | src/ui8.js:56 | Later: grab two dishes | Later: take two dishes |
| 129 | src/ui8.js:56 | Nigiri: 2 (×3 on paste) | Nigiri: 2 (6 on paste) |
| 130 | src/ui8.js:56 | End: most +6, fewest −6 | At end: most +6, fewest −6 |
| 131 | src/ui3.js:76 | That did not work: ' + r.error | Could not do that: ' + r.error |
| 132 | src/ui3.js:91 | You have served. Waiting for the others. | You picked. Waiting for the others. |
| 133 | src/ui3.js:111 | That choice is not allowed. | You can't pick that. |
| 134 | src/ui3.js:166 | Everyone has chosen. The plates are under covers… | Everyone has picked. The covers lift next… |
| 135 | src/ui3.js:185 | The plates land. Hands slide to the left… | Dishes land. Hands pass on… |
| 136 | src/ui3.js:185 | The plates land. The round is over! | Dishes land. The round is over. |
| 137 | src/ui3.js:241 | That saved meal is from an older version of the game, so it could not be resumed. | This saved game is too old to resume. |
| 138 | src/ui4.js:32 | A tie, and you share it! | A tie. You share the win! |
| 139 | src/ui4.js:32 | It is a tie! | It's a tie! |
| 140 | src/ui4.js:67 | Counting round ' + sc.round | Counting round N |
| 141 | src/ui4.js:92 | Custard cups count | Counting Custard Cups |
| 142 | src/ui4.js:150 | h('span.p', String(tot[s]) + ' pts') | N points |
| 143 | src/ui10.js:12 | Tap the dish you want. Your other plates pass to the next diner. | Tap the dish you want. The rest pass on. |
| 144 | src/ui10.js:13 | Tap the glowing sticks, then two dishes. You take both this turn. | Tap the glowing sticks, then two dishes. |
| 145 | src/ui10.js:14 | Tap two dishes. The Twin Sticks then go back into the hand you pass. | Tap two dishes. The sticks go back in your hand. |
| 146 | src/ui10.js:15 | Every set, roll race and nigiri was just counted. Tap for the next round. | All sets, rolls and nigiri are counted. Tap for the next round. |
| 147 | src/ui10.js:18 | Everyone takes one dish at the same time. Then every hand passes to the next diner. | Everyone takes one dish together. Then hands pass on. |
| 148 | src/ui10.js:19 | Two Prawns score 5, three Fish Slices 10. Steam Buns score 1, 3, 6, 10, then 15. | Two Prawns score 5. Three Fish Slices score 10. |
| 149 | src/ui10.js:20 | Most roll icons score 6, second most 3. Nigiri score 1 to 3, tripled on Fire Paste. | Most roll icons scores 6. Nigiri score 1 to 3, triple on Fire Paste. |
| 150 | src/ui10.js:21 | Custard Cups score only when the game ends: most scores 6, fewest loses 6. | Custard Cups score at the end. Most +6, fewest -6. |
| 151 | src/ui10.js:22 | Keep them on the table. On a later turn take two dishes from your hand at once. | Keep them on your counter. Later, take two dishes at once. |
| 152 | src/ui10.js:23 | Tap the glowing sticks, then tap two dishes. The sticks return to the hand you pass. | Tap the glowing sticks, then two dishes. |
| 153 | src/ui10.js:24 | Tap two dishes from your hand. You take both, then the hand passes on. | Tap two dishes. You take both. |
| 154 | src/ui10.js:25 | The Twin Sticks are put back into your hand, so the next diner can use them. | The sticks go back in your hand. The next diner can use them. |
| 155 | src/ui10.js:26 | Sets, rolls, buns and nigiri are scored now. Custard waits until the game ends. | Sets, rolls, buns and nigiri score now. Custard waits for the end. |
| 156 | src/ui10.js:27 | The meal lasts three rounds. The highest total after round three wins. | A game is three rounds. Most points after round three wins. |
| 157 | src/ui10.js:40 | Twin Sticks: take these two dishes together this turn. | Twin Sticks: take both dishes this turn. |
| 158 | src/ui10.js:43 | Pairs up with your Crispy Prawn: | Makes a pair with your Crispy Prawn: |
| 159 | src/ui10.js:43 | Two Crispy Prawns score 5; you need a partner. | Two Crispy Prawns score 5. You need a partner. |
| 160 | src/ui10.js:44 | Completes three Fish Slices: | Makes a set of three Fish Slices: |
| 161 | src/ui10.js:44 | Three Fish Slices score 10; this starts a set. | Three Fish Slices score 10. This starts a set. |
| 162 | src/ui10.js:45 | Every Steam Bun scores more than the last. | Each Steam Bun scores more than the last. |
| 163 | src/ui10.js:46 | Roll icons: the most this round scores 6. | Most roll icons scores 6. |
| 164 | src/ui10.js:47 | Lands on your Fire Paste and scores triple: | Goes on your Fire Paste. Scores triple: |
| 165 | src/ui10.js:48 | Fire Paste triples the next nigiri you take. | Fire Paste triples your next nigiri. |
| 166 | src/ui10.js:50 | Custard Cups pay at the end: most scores 6. | Custard Cups score at the end. Most scores 6. |
| 167 | src/ui10.js:51 | The best dish for you right now. | The best dish right now. |
| 168 | src/ui11.js:71 | Collect dishes that score points. After the last round the highest total wins. Today: one short round. | Score the most points. Today we play one short round. |
| 169 | src/ui11.js:73 | Each turn you take one dish. Then your other dishes pass along the belt to the chef. | Each turn, take one dish. The rest pass to the chef. |
| 170 | src/ui11.js:75 | Picks flip together | Picks reveal together |
| 171 | src/ui11.js:75 | Both picks were revealed at once, then the hands swapped. You now hold the chef\'s leftovers. | Both picks showed together. Then the hands swapped. |
| 172 | src/ui11.js:76 | Two Crispy Prawns make a pair: 5 points. Tap this one. | Two Crispy Prawns make a pair worth 5. Tap this one. |
| 173 | src/ui11.js:77 | Fire Paste triples the next nigiri you take. Tap it. | Fire Paste triples your next nigiri. Tap it. |
| 174 | src/ui11.js:78 | Moon Nigiri is worth 3. On your Fire Paste it scores 9. Tap it. | Moon Nigiri scores 3. On Fire Paste it scores 9. Tap it. |
| 175 | src/ui11.js:79 | Twin Sticks stay on your table. Take them now and use them next turn. | Take the Twin Sticks now. Use them next turn. |
| 176 | src/ui11.js:80 | The glowing sticks let you take two dishes this turn. Tap them. | Tap the glowing sticks to take two dishes. |
| 177 | src/ui11.js:81 | Fish Slices score 10 for a set of three. Tap a Fish Slice. | Three Fish Slices score 10. Tap a Fish Slice. |
| 178 | src/ui11.js:82 | Tap the other Fish Slice. The sticks go back into the hand you pass on. | Tap the other Fish Slice. The sticks go back in your hand. |
| 179 | src/ui11.js:83 | Three Fish Slices make a set: 10 points. Tap the third. | Three Fish Slices score 10. Tap the third. |
| 180 | src/ui11.js:84 | Roll icons race. Most icons this round scores 6, second most 3. Tap the three-icon roll. | Most roll icons scores 6. Tap the three-icon roll. |
| 181 | src/ui11.js:85 | Each extra bun is worth more: 1, 3, 6, 10, then 15. Tap it. | Each bun scores more: 1, 3, 6, 10, then 15. Tap it. |
| 182 | src/ui11.js:86 | Custard scores only at the game end. Most cups gets 6. Tap it. | Custard scores at the end. Most cups scores 6. Tap it. |
| 183 | src/ui11.js:87 | . A lone dish scores nothing. | . A single dish scores nothing. |
| 184 | src/ui11.js:89 | Nigiri alone: 1 to 3. | Nigiri alone score 1 to 3. |
| 185 | src/ui11.js:90 | Her lone Fish Slice scored nothing. | Her single Fish Slice scored nothing. |
| 186 | src/ui11.js:91 | Custard scores once, at the very end: most cups +6, fewest −6 (not with two diners). | Custard scores at the end. Most +6, fewest −6. Not with two diners. |
| 187 | src/ui11.js:200 | Odile keeps the custard. For now. | Odile keeps the custard. Try again! |
| 188 | src/ui11.js:202 | Things you will meet later | Coming up later |
| 189 | src/ui9.js:30 | Win the roll prize twice. | Win the roll prize in two rounds. |
| 190 | src/ui9.js:30 | Win, champion bonus and all. | Win and earn the champion bonus. |
| 191 | src/ui5.js:7 | Hand size: 10 plates with 2 diners, 9 with 3, 8 with 4, 7 with 5. | Your hand: 10 dishes with 2 diners, 9 with 3, 8 with 4, 7 with 5. |
| 192 | src/ui5.js:7 | Tap a dish on the belt to grab it, or press and hold to read it first. | Tap a dish to take it. Press and hold to read it first. |
| 193 | src/ui5.js:7 | With "One tap grabs" off in the menu, a tap lifts the dish and Serve confirms it. | If "One tap takes" is off, tap a dish, then press Take. |
| 194 | src/ui5.js:7 | When the hands are empty the round is scored, everything except Custard is cleared and a new hand is dealt. | When hands are empty, the round is scored. Then you get a new hand. |
| 195 | src/ui5.js:7 | (new line after the previous row) | Only Custard Cups stay on your counter. |
| 196 | src/ui5.js:13 | Steam Bun: 1, 3, 6, 10, 15 points for 1, 2, 3, 4, 5 or more buns. | Steam Buns: 1, 3, 6, 10, 15 for 1, 2, 3, 4, 5 or more. |
| 197 | src/ui5.js:14 | Seaweed Rolls: add up the roll icons on your counter. The most icons scores 6. The second most scores 3. If several diners tie for the most, they split 6 (rounded down) and nobody scores second place. Ties for second split 3. Diners with no icons never score. | Seaweed Rolls: count the icons on your counter. Most icons scores 6. Second most scores 3. Tied for most split 6, rounded down. Nobody scores second then. Tied for second split 3. No icons, no points. |
| 198 | src/ui5.js:15 | Nigiri: Sunset 2, Moon 3, Sun 1 point. Fire Paste: your next nigiri lands on it and scores triple. A Fire Paste with no nigiri scores nothing, and each paste only takes one nigiri. | Nigiri: Sun 1, Sunset 2, Moon 3. Fire Paste triples your next nigiri. Each paste triples one nigiri. Paste without nigiri scores nothing. |
| 199 | src/ui5.js:16 | Keep them on your counter. On a later turn you may serve two plates from the hand you are holding: tap the glowing sticks on your counter (or press "Use Twin Sticks"), then tap two dishes. The sticks then go back into that hand (they are passed on) and you have used them. A Fire Paste and a nigiri served together land on each other. | Keep them on your counter. On a later turn, tap the glowing sticks. Then tap two dishes. The sticks go back in your hand. Paste and nigiri taken together still match up. |
| 200 | src/ui5.js:17 | Custard Cups are never cleared away. At the end of the third round the diner with the most Custard scores 6 and the diner with the fewest loses 6. Ties split the points (rounded down). With two diners nobody loses points. If everybody has the same number, nobody scores. | Custard Cups stay all game. After round three, most cups scores 6. Fewest cups loses 6. Ties split the points, rounded down. With two diners, nobody loses. Same number for all? Nobody scores. |
| 201 | src/ui5.js:19 | The small green +N on a plate is what serving it scores you right now (switch it off in the menu). | The green +N on a dish is its score now. You can switch it off in the menu. |
| 202 | src/ui5.js:20 | The glowing seat shows who is still choosing. Covered plates on the right of each counter mean that diner has chosen. | A glowing seat is still choosing. A covered dish means that diner has picked. |
| 203 | src/ui5.js:21 | Tap a group of plates on any counter to see what it is worth right now. Tap a chef to see their whole table. | Tap a group of dishes to see its score. Tap a diner to see their counter. |
| 204 | src/ui5.js:22 | Hot-seat: the hands are hidden between diners, with a "pass the device" screen. Online: friends see only their own hand. | Hot-seat: a screen hides hands between turns. Online: you see only your own hand. |
| 205 | src/ui5.js:23 | Your meal is saved after every turn. If you close the page or switch apps, choose Resume on the title screen. | Your game saves every turn. To come back, choose Resume on the title screen. |
| 206 | src/ui5.js:25 | the hand of plates you are holding this turn. It moves on to the next diner after every pick. | your hand of dishes this turn. It passes to the next diner after every pick. |
| 207 | src/ui5.js:26 | the plates you have served this round, in front of your seat. | the dishes you have taken this round, in front of your seat. |
| 208 | src/ui5.js:27 | tap a dish on the belt: it goes to your seat under a cover. When everybody has chosen, the covers lift together. | tap a dish to take it. It sits under a cover. When all have picked, the covers lift. |
| 209 | src/ui5.js:28 | the Seaweed Roll contest: add up the roll icons on each counter. Most icons scores 6, second most 3. | the Seaweed Roll contest. Most icons scores 6. Second most scores 3. |
| 210 | src/ui5.js:29 | the Sunset, Moon and Sun plates. They score their number straight away. | the Sunset, Moon and Sun dishes. They score their own number. |
| 211 | src/ui5.js:30 | a nigiri served onto a waiting Fire Paste scores triple; the extra points show as this row on the score pad. | a nigiri on a Fire Paste scores triple. The extra points show on the score pad. |
| 212 | src/ui5.js:31 | Custard Cups. They stay on your counter until the end of the meal, then most scores 6 and fewest loses 6. | Custard Cups. They stay all game. At the end, most +6 and fewest -6. |
| 213 | src/ui5.js:32 | the lines in the panel after every reveal: what each diner served and why their score went up or down. | the lines after each reveal. They show what each diner took and why points changed. |
| 214 | src/ui5.js:33 | the number on each diner during a round: what their counter would score if the round ended now. The roll race can still change it. | the number on each diner. It is their score if the round ended now. |
| 215 | src/ui5.js:34 | the paper that adds up every diner\'s rounds and the custard at the end. | the sheet that adds up every round and the custard. |
| 216 | src/ui5.js:35 | the small green number on a plate: what serving it would score you right now. | the green number on a dish. It is what taking it scores now. |
| 217 | src/ui5.js:37 | Kaiten Kitchen is an original conveyor-belt card game. Names, card text and art are original; the audio credits are above. | Kaiten Kitchen is an original card game. Audio credits are above. |
| 218 | src/ui5.js:40 | Twin Sticks: your two dishes are put down in the best order automatically (Fire Paste first, then the best nigiri). You cannot choose the order. | Twin Sticks: your two dishes land in the best order. You cannot choose the order. |
| 219 | src/ui5.js:41 | A nigiri goes on your oldest unused Fire Paste. All pastes triple the same, so the score never changes. | A nigiri goes on your oldest free Fire Paste. The score is the same either way. |
| 220 | src/ui5.js:42 | A tie for fewest Custard Cups splits the 6-point loss, rounded down. | Tied for fewest Custard Cups? Split the 6-point loss, rounded down. |
| 221 | src/ui5.js:43 | Story mode adds a twist to some boss meals (a head start or extra roll icons). Quick games never use twists. | Story mode gives some bosses a head start or extra roll icons. Quick games don't. |
| 222 | src/ui5.js:62 | Nothing served yet this round. | Nothing taken yet this round. |
| 223 | src/ui5.js:79 | One tap grabs | One tap takes |
| 224 | src/ui5.js:79 | Tap twice to serve | Tap twice to take |
| 225 | src/ui5.js:80 | Pick the songs… | Choose songs |
| 226 | src/ui5.js:97 | At least one chef joins you. | You need at least one opponent. |
| 227 | src/ui5.js:89 | Taro cooks noodles on the night shift and eats his supper at the belt long after midnight. He counts every plate that rolls past and remembers exactly who took the last prawn. | Taro cooks on the night shift. He counts every dish and remembers who took the last prawn. |
| 228 | src/ui5.js:89 | Choose Taro if you enjoy a sharp rival who punishes every loose plate. | Pick Taro for a sharp opponent. He punishes every mistake. |
| 229 | src/ui5.js:90 | Odile ran a bakery for forty years and still wears her tall hat to dinner. She has never once left without dessert, and she will happily tell you about it. | Odile ran a bakery for forty years. She never leaves without dessert. |
| 230 | src/ui5.js:90 | Choose Odile if you enjoy a fair, steady race with the custard on the line. | Pick Odile for a fair, steady game. |
| 231 | src/ui5.js:91 | Kofi drives the number 9 bus and knows every regular by name. He loves a roll race, cheers when he wins it and cheers just as loudly when he loses. | Kofi drives the number 9 bus. He loves roll races, win or lose. |
| 232 | src/ui5.js:91 | Choose Kofi if you enjoy a lively table where the seaweed rolls are always fought over. | Pick Kofi for a lively game. He always goes for rolls. |
| 233 | src/ui5.js:92 | Pip saved up pocket money all month for this dinner and wants to try one of everything. Pip picks whichever plate looks the happiest. | Pip wants to try one of everything. Pip picks the dish that looks happiest. |
| 234 | src/ui5.js:92 | Choose Pip if you enjoy a relaxed first meal with room to try things out. | Pick Pip for an easy first game. |
| 235 | src/ui5.js:120 | Grab a plate, pass the belt. | Take a dish, pass the rest. |
| 236 | src/ui5.js:123 | your meal, round ' + si.round + ' of ' + D.rounds + ' · ' | your game, round N of 3 ·  |
| 237 | src/ui5.js:123 | your saved meal | your saved game |
| 238 | src/ui5.js:126 | with friends, free | play with friends, free |
| 239 | src/ui5.js:139 | Who is at the counter? | Who is playing? |
| 240 | src/ui5.js:141 | Configure the table | Set up the game |
| 241 | src/ui5.js:140 | Configure | Set up |
| 242 | src/ui5.js:149 | Start the meal | Start the game |
| 243 | src/ui5.js:149 | You against | You vs |
| 244 | src/ui5.js:156 | the chefs play | computers play |
| 245 | src/ui5.js:157 | Invite the chefs you want at the belt. Each one has a temper; change their level if you like. | Choose who you play against. You can change each level. |
| 246 | src/ui5.js:161 | Host a table and send friends the code or the link. Every browser connects directly; nobody sees another hand. Empty seats go to the computer chefs. | Host a game and send friends the code or link. Nobody sees another hand. Computers fill empty seats. |
| 247 | src/ui5.js:162 | Free, peer to peer | Free and direct |
| 248 | src/ui5.js:133 | At the table ✓ | Playing ✓ |
| 249 | src/net.js:25 | Type the invite code first. | Type the code first. |
| 250 | src/net.js:27 | Could not open the game room. | Could not open the game. |
| 251 | src/net.js:49 | The host closed the room. | The host closed the game. |
| 252 | src/net.js:183 | The game moved on. Look at your plates and try again. | The game moved on. Check your dishes and try again. |
| 253 | src/net.js:184 | That seat is played by the computer. | That seat is a computer player. |
| 254 | src/net.js:185 | You have already served a plate. | You already picked a dish. |
| 255 | src/net.js:187 | That pick is not allowed. | You can't pick that. |
| 256 | src/net.js:189 | That pick did not work. | Could not take that pick. |
| 257 | src/net.js:212 | Friends open the link, or tap Play online and type the code. Nobody can see another player\'s hand. | Friends open the link, or tap Play online and type the code. |
| 258 | src/net.js:214 | Back to the start | Back to start |
| 259 | src/net.js:229 | Close the room | Close the game |
| 260 | src/net.js:235 | Online play needs a recent browser with WebRTC (Chrome, Edge, Firefox or Safari). | Online play needs a recent Chrome, Edge, Firefox or Safari. |
| 261 | src/net.js:236 | Free and direct: your browsers connect to each other. Host a game, then send friends the code or the link. | Host a game. Send friends the code or link. |
| 262 | src/net.js:239 | Opening the room... | Opening the game... |
| 263 | src/net.js:241 | Play online (free, peer to peer) | Play online (free) |
| 264 | src/net.js:262 | Look at the table | See the table |
| 265 | src/engine.js:93 | A new meal begins: ' + np + ' diners, 3 rounds. | New game: N diners, 3 rounds. |
| 266 | src/engine.js:104 | everyone is dealt ' + H + ' cards. | everyone gets N dishes. |
| 267 | src/engine.js:165 | Twin Sticks: take | Twin Sticks to take |
| 268 | src/engine.js:166 | ' on Fire Paste (x3)' | ' on Fire Paste (triple)' |

ROWS: 268
