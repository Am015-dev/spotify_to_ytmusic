# Crown City Smash copy fixes

Goal-card verdict: rewritten. The intro card hid the aim in a story sentence and the goal line described a turn. New aim: "Be first to 20 ★, or be the last monster standing." (see row 1 for bullets).

| # | file:line | old line | new line |
|---|---|---|---|
| 1 | story.js:66 | Whoever reaches <b>20 ★</b>, or is the <b>last one standing</b>, becomes the city's new King.</p> | GOAL: Be first to 20 ★, or be the last monster standing.<br>- Three of a kind scores that many ★.<br>- Each turn you start in Downtown scores 2 ★.<br>- At 0 hearts you are out. |
| 2 | story.js:69 | <p class="goal"><b>Your turn:</b> roll 6 dice up to 3 times, keep what you like, then use them. <b>Three of a kind</b> scores stars, claws hit, hearts heal, ⚡ buys cards.</p> | <p class="goal"><b>Your turn:</b> roll 6 dice, up to 3 times. Keep the ones you like. Then tap Smash.</p> |
| 3 | story.js:66 | The portal over Crown City cracked open at dawn. | A portal opened over Crown City at dawn. |
| 4 | body.html:577 | Reach <b>20 stars</b> and survive your turn, or be the last monster standing. If everyone falls at once, nobody wins. | Be first to <b>20 stars</b> at the end of your turn, or be the last monster standing. If everyone falls at once, nobody wins. |
| 5 | body.html:568 | The names, card text and art are original, for copyright reasons. The rules follow the published rulebook. | The names, card text and art are original. |
| 6 | ui.js:151 | All 66 classic cards, the 24 Brainjack cards, 72 evolutions, 12 costumes, 24 curses and 10 menace tiles follow the published cards, with new names and wording. | This version has 66 classic cards, 24 Brainjack cards, 72 evolutions, 12 costumes, 24 curses and 10 menace tiles. |
| 7 | body.html:578 | <h3>Left out of this version</h3> | <h3>Not in this version</h3> |
| 8 | body.html:578 | Ten advanced cards that need tokens or peeking at the deck (copying, poison, shrinking, card stealing and similar). | Ten advanced cards that need tokens or a peek at the deck. |
| 9 | body.html:570 | <li><b>Roll</b> all dice. Keep any dice you like and reroll the rest, up to twice. You can reroll dice you kept earlier.</li> | <li><b>Roll</b> all six dice. Keep the ones you like. Reroll the rest, up to twice. You may reroll kept dice too.</li> |
| 10 | body.html:571 | <li><b>Resolve</b>: three of a kind of 1, 2 or 3 scores that many stars, and each extra matching die adds 1. Energy gives 1 each. Hearts heal 1 each, but only outside the city (max 10). Claws smash.</li> | <li><b>Smash</b>: three 1s, 2s or 3s score that many stars. Each extra match adds 1. Each ⚡ gives 1 energy. Each heart heals 1, but only outside the city (max 10). Claws hit rivals.</li> |
| 11 | body.html:572 | <li><b>Smash</b>: from the city (Downtown or the Harbor) your claws hit every monster outside. From outside, they hit every monster in the city. When smashed by dice, a city monster may <b>yield</b>. It still takes the damage, and the smasher moves in.</li> | <li><b>Claws</b>: in the city, your claws hit every monster outside. Outside, they hit every monster in the city. A hit city monster may <b>yield</b>. It still takes the damage. The attacker moves in.</li> |
| 12 | body.html:573 | <li><b>Enter</b>: if Downtown is empty after resolving, you must move in (+1 star). With 5–6 monsters, if Downtown is taken and the Harbor is empty, you move into the Harbor.</li> | <li><b>Enter</b>: if Downtown is empty after your dice, move in for +1 star. With 5 or 6 monsters, if Downtown is taken and the Harbor is empty, move into the Harbor.</li> |
| 13 | body.html:574 | <li><b>Buy</b> power cards with energy. Keep cards stay with you; use-now cards happen at once and are discarded. Pay 2 energy to sweep the three cards and deal three new ones.</li> | <li><b>Buy</b> power cards with energy. Keep cards stay with you. Use-now cards happen at once, then go away. Pay 2 energy to swap all three cards.</li> |
| 14 | body.html:575 | <li><b>End of turn</b> effects happen, then the next monster goes.</li> | <li><b>End your turn</b>. End-of-turn effects happen. Then the next monster plays.</li> |
| 15 | body.html:576 | Starting your turn in the city scores 2 stars. You cannot heal with hearts there, and everyone outside is hitting you. When only four monsters remain, the Harbor closes. | Starting your turn in the city scores 2 stars. Hearts do not heal you there. Everyone outside hits you. When four monsters remain, the Harbor closes. |
| 16 | ui.js:142 | every monster starts with 1. When another monster finishes rolling, you may spend one to resolve its dice as if they were yours. You then do your own Enter and Buy steps, and the Brainjacked monster rolls again from scratch. | every monster starts with 1. When another monster finishes rolling, you may spend one to use its dice as yours. Then do your own Enter and Buy steps. That monster rolls again from scratch. |
| 17 | ui.js:143 | <b>Consumable</b> cards: you keep them until the moment their keyword applies, use them once, then discard them. You are asked automatically when you can use one. | <b>Consumable</b> cards: you keep them until their keyword applies. Use one once, then discard it. You get a pop-up when you can use one. |
| 18 | ui.js:145 | <b>Evolutions</b> (optional): each monster has 8. Start with one of two; whenever you resolve three or more hearts (even in the city), look at two more and keep one. | <b>Evolutions</b> (optional): each monster has 8. Start with one of two. Each time you roll three or more hearts, even in the city, look at two more and keep one. |
| 19 | ui.js:145 | Some are played from your hand at a special moment: you get a pop-up when you can. | Some are played from your hand at a set moment. You get a pop-up when you can. |
| 20 | ui.js:149 | <b>R</b> reroll · <b>Space</b> resolve / end turn | <b>R</b> reroll · <b>Space</b> smash / end turn |
| 21 | ui.js:148 | On the start screen press <b>Host a game</b> and share the invite code. Friends open this same page (share it with them as Contributors or Editors first), type the code and press <b>Join a game</b>. The host's page runs the game. | On the start screen, press <b>Host a game</b> and share the invite code. Friends open this page, type the code and press <b>Join a game</b>. The host's page runs the game. |
| 22 | ui.js:153 | The 20-star win is checked when the active monster ends its turn; it must survive the turn. | The 20-star win is checked when a monster ends its turn. It must still be alive. |
| 23 | ui.js:153 | Dice order: Automatic resolves hearts before claws. | Dice order: Automatic counts hearts before claws. |
| 24 | ui.js:153 | Evolutions: keep 1 of 2 cards at the start; resolving 3 hearts shows 2 and keeps 1. | Evolutions: keep 1 of 2 cards at the start. Three hearts show 2 more, and you keep 1. |
| 25 | body.html:583 | Monsters brawl over Downtown (and the Harbor with 5–6 players). The one in the city scores stars every turn but gets hit by everyone else. | Monsters fight over Downtown (and the Harbor with 5 or 6 players). The one in the city scores stars each turn, but everyone hits it. |
| 26 | body.html:584 | Each plate along the bottom shows hearts (red), stars (gold, first to 20 wins) and energy (green). The glowing plate is whoever is taking a turn. | Each plate shows hearts (red), stars (gold) and energy (green). First to 20 stars wins. The glowing plate is whose turn it is. |
| 27 | body.html:585 | On your turn, click dice to keep them (they turn yellow), then reroll the rest. You get two rerolls. | On your turn, click dice to keep them. They turn yellow. Then reroll the rest. You get two rerolls. |
| 28 | body.html:586 | This box always tells you what is happening and gives you the buttons: Reroll, Resolve, then buy or End turn. | This box tells you what to do next. It has the buttons: Reroll, Smash, then Buy or End turn. |
| 29 | body.html:587 | Spend energy on cards after resolving. Keep cards change the rules for you; use-now cards pay off at once. | Spend energy on cards after you smash. Keep cards stay with you. Use-now cards work at once. |
| 30 | body.html:588 | Numbers score only in sets of three. Claws smash, hearts heal, lightning is energy. | Numbers score only in threes. Claws hit, hearts heal, lightning is energy. |
| 31 | body.html:589 | Everything that happened, newest first. Good luck, monster! | Everything that happened, newest first. |
| 32 | ui.js:21 | Step 2 · ${esc(mname(p))} resolves its dice | Step 2 · ${esc(mname(p))} smashes |
| 33 | ui.js:26 | Happy with the result? Press <b>Resolve</b>. | Happy with the dice? Press <b>Smash</b>. |
| 34 | ui.js:28 | btn('resolve','Resolve dice','','go to step 2' | btn('resolve','Smash!','','go to step 2' |
| 35 | ui.js:48 | If you resolve now | If you smash now |
| 36 | body.html:535 | Dice resolved. | Dice used. |
| 37 | ui.js:27 | Downtown is empty, so you will move in after resolving (+1 ★) and claws hit nobody this time. | Downtown is empty. You will move in after you smash (+1 ★). Claws hit nobody. |
| 38 | ui.js:23 | Nothing to do right now: you will get a pop-up if you can  | Nothing to do now. You get a pop-up if you can  |
| 39 | ui.js:31 | Nothing great to buy? Save your energy and press <b>End turn</b>. | Nothing good to buy? Save your energy. Press <b>End turn</b>. |
| 40 | ui.js:59 | Already in the city, resolve four 1s to climb one level. Reaching level 3 wins. | In the city, roll four 1s to climb one level. Level 3 wins. |
| 41 | ui.js:63 | spend one to resolve its dice as yours and take its Enter and Buy steps; it then | spend one to use its dice as yours; it then |
| 42 | ui.js:32 | 'throw these 3 away, deal 3 fresh' | 'swap all 3 cards' |
| 43 | ui.js:32 | Throw these 3 cards away and deal 3 fresh ones (2 ⚡) | Swap all 3 cards for new ones (2 ⚡) |
| 44 | story.js:84 | The recommended setup is the easiest way to learn. | The suggested setup is the easiest to learn. |
| 45 | story.js:84 | Read the front page, then play again. | Read the front page. Then play again. |
| 46 | story.js:84 | Try another monster: each has its own secret powers. | Try another monster. Each has its own secret powers. |
| 47 | story.js:104 | You used the stolen dice; nothing here is worth buying. Your own turn still comes. | You used the stolen dice. Nothing here is worth buying. Your own turn is still coming. |
| 48 | story.js:105 | It is PERMANENT: it helps you every turn from now on. | It is PERMANENT. It helps you every turn. |
| 49 | story.js:105 | You SAVE it FOR LATER and get a pop-up when it can be used. | SAVE FOR LATER: you get a pop-up when you can use it. |
| 50 | story.js:105 | ONE-SHOT: it happens right away. | ONE-SHOT: it works right away. |
| 51 | story.js:106 | Press End turn and save your energy. | Press End turn. Your energy carries over. |
| 52 | story.js:106 | Nothing for sale is worth it yet | Nothing for sale is worth it |
| 53 | story.js:106 | Energy carries over to your next turn. | Energy carries over. |
| 54 | story.js:107 | The game is resolving. | The game is busy. |
| 55 | story.js:107 | Wait a moment. | Please wait. |
| 56 | story.js:122 | You kept your head down this time. | You stayed out of trouble this time. |
| 57 | story.js:122 | A quiet day, by monster standards. | A quiet day. |
| 58 | story.js:31 | RISES FROM THE PORTAL. THE CITY TREMBLES. | RISES FROM THE PORTAL. |
| 59 | story.js:116 | CITY IN RUINS: NO MONSTER LEFT STANDING | CITY IN RUINS: NO MONSTER LEFT |
| 60 | story.js:36 | RIVALRY: ${UP(mname(G.pl[l.s]))} HAS SMASHED YOU FOR ${UI.riv[l.s]} ♥. PAYBACK TIME? | RIVALRY: ${UP(mname(G.pl[l.s]))} HAS HIT YOU FOR ${UI.riv[l.s]} ♥. |
| 61 | tut-story.js:52 | Hearts do nothing in Downtown: no healing there. Leave to heal. | Hearts do not heal you in Downtown. Leave to heal. |
| 62 | tutor.js:96 | Smash your way to 20 ★. The last monster standing wins too. | Be first to 20 ★. The last monster standing wins too. |
| 63 | tutor.js:97 | Dice you tap stay put when you roll again. Tap both 3s. | Tapped dice stay put when you roll again. Tap both 3s. |
| 64 | tutor.js:99 | You roll up to three times. Tap Roll to throw the other dice. | You roll up to three times. Tap Roll for the other dice. |
| 65 | tutor.js:101 | Two 3s score nothing. Three score 3 ★. Tap the new 3. | Two 3s score nothing. Three 3s score 3 ★. Tap the new 3. |
| 66 | tutor.js:103 | Each ⚡ gives 1 energy to spend on power cards. Keep both. | Each ⚡ is 1 energy for power cards. Keep both. |
| 67 | tutor.js:107 | No rolls left. Tap SMASH! over the city to use your dice. | No rolls left. Tap SMASH! to use your dice. |
| 68 | tutor.js:109 | Three 3s score 3 ★, three ⚡ give 3 energy. Downtown was empty, so you moved in: +1 ★. You have  | Three 3s score 3 ★. Three ⚡ give 3 energy. Downtown was empty, so you moved in for +1 ★. You have  |
| 69 | tutor.js:119 |  rolls like you. Its claws hit the monster in Downtown: you. Computers keep, roll and buy too. |  rolls like you. Its claws hit the monster in Downtown: you. |
| 70 | tutor.js:122 | Hit in Downtown? Stay to earn 2 ★ next turn, or yield and run. Tap Stay. | Hit in Downtown? Stay to earn 2 ★ next turn, or yield and leave. Tap Stay. |
| 71 | tutor.js:128 | Two claws hit both rivals. Two ⚡ gained. The heart did nothing: no healing in Downtown. | Two claws hit both rivals. You gain 2 ⚡. The heart did nothing. No healing in Downtown. |
| 72 | tutor.js:130 | Not happy with the cards? Pay 2 ⚡ to swap all three for new ones. | Do not like the cards? Pay 2 ⚡ to swap all three. |
| 73 | tutor.js:134 |  hit you again. Yield to leave Downtown: it moves in, but you stop taking hits. Tap Yield. |  hit you again. Yield to leave Downtown. It moves in and you stop taking hits. Tap Yield. |
| 74 | tutor.js:136 | Outside, hearts heal you and claws hit whoever holds Downtown. Tap SMASH! | Outside, hearts heal you and claws hit Downtown. Tap SMASH! |
| 75 | tutor.js:140 | Tap End turn. The rivals play on while you watch. | Tap End turn. The rivals play while you watch. |
| 76 | tutor.js:142 | Some turns later you have  | A few turns later you have  |
| 77 | tutor.js:145 | Reach 20 and end your turn to win. Tap End turn. | End your turn at 20 to win. Tap End turn. |
| 78 | tutor.js:147 | The first to 20 ★ wins at once. You also win if every rival is K.O. (0 hearts). Tap Finish. | First to 20 ★ wins. You also win if every rival is out (0 hearts). Tap Finish. |
| 79 | tutor.js:171 | You played a whole game, start to finish. Time for a real one. | You played a whole game. Now play a real one. |
| 80 | tutor.js:171 | You played a whole game. Now the Story begins. | You played a whole game. Now the Story starts. |
| 81 | tut-story.js:8 | Hold the front page! A new monster just climbed out of the portal. That’s you. | Hold the front page! A new monster came out of the portal. That is you. |
| 82 | tut-story.js:8 | Stars in the bank and a power card in the paw. Not bad for a first night! | You have stars and a power card. Good first night! |
| 83 | tut-story.js:9 | You held the city and knew when to run. That’s the whole trick of Crown City. | You held the city and knew when to leave. That is the trick of Crown City. |
| 84 | tut-story.js:10 | Out in the streets you heal, and your claws find the monster in Downtown. | Outside, you heal. Your claws hit the monster in Downtown. |
| 85 | tut-story.js:10 | Squidrik’s bleeding and you’re healthy. The rookie is climbing. | Squidrik is hurt and you are healthy. You are winning. |
| 86 | tut-story.js:11 | Many turns later, the whole city is watching. One big roll from the crown. | Many turns later, one big roll could win the crown. |
| 87 | tut-story.js:11 | KING OF CROWN CITY! Tomorrow’s headline just wrote itself. | KING OF CROWN CITY! That is tomorrow's headline. |
| 88 | tut-story.js:13 | The Clarion wants a headline: be first to 6 ★ in this short game. Squidrik is after it too. | Be first to 6 ★ in this short game. Squidrik wants it too. |
| 89 | tut-story.js:14 | Two 3s! Squidrik hates a pair. Keep both: they stay put when you roll. | Two 3s! Keep both. They stay put when you roll. |
| 90 | tut-story.js:15 | Now throw the rest. Squidrik is watching, so make it count. | Now roll the rest. |
| 91 | tut-story.js:16 | A third 3! Three of a kind pays 3 ★. Keep it too. | A third 3! Three of a kind scores 3 ★. Keep it too. |
| 92 | tut-story.js:17 | Those ⚡ buy power cards from the vendors. Keep both. | Those ⚡ buy power cards. Keep both. |
| 93 | tut-story.js:18 | One throw left. Fortune favours the bold. | One roll left. |
| 94 | tut-story.js:19 | No throws left. SMASH! Let the city hear you coming. | No rolls left. Tap SMASH! |
| 95 | tut-story.js:21 | The vendors are open. Read ${g.card}: it might be your lucky card. | Power cards are for sale. Read ${g.card}. |
| 96 | tut-story.js:22 | Spend ${g.cost} ⚡ on it. A permanent card stays with you all game. | Pay ${g.cost} ⚡ for it. A permanent card stays all game. |
| 97 | tut-story.js:23 | Good haul. Saved ⚡ carry over. Pass the turn. | Good turn. Saved ⚡ carry over. End your turn. |
| 98 | tut-story.js:24 |  is furious. Its claws hit whoever holds Downtown: you. |  attacks. Its claws hit whoever holds Downtown: you. |
| 99 | tut-story.js:25 | Hurt, but Downtown pays 2 ★ every turn. Hold your ground: stay. | Hurt, but Downtown pays 2 ★ each turn. Stay. |
| 100 | tut-story.js:26 | Staying paid off: +2 ★ at turn start, ${g.vp} ★ now. No healing in Downtown, though. | Staying paid off: +2 ★ at turn start. You have ${g.vp} ★. No healing in Downtown. |
| 101 | tut-story.js:27 | From Downtown your claws hit everyone. Stop rolling and SMASH! | From Downtown your claws hit everyone. Stop rolling and tap SMASH! |
| 102 | tut-story.js:28 | Both rivals bled. The heart did nothing: you can’t heal in Downtown. | Both rivals are hurt. The heart did nothing. You cannot heal in Downtown. |
| 103 | tut-story.js:29 | Don’t fancy the cards? Pay 2 ⚡ and the vendors deal fresh ones. | Do not like the cards? Pay 2 ⚡ for new ones. |
| 104 | tut-story.js:30 | Enough shopping. Pass the turn. | Enough shopping. End your turn. |
| 105 | tut-story.js:31 | ${g.rival} hit you again. Step aside: yield, and Downtown is theirs. | ${g.rival} hit you again. Yield, and Downtown is theirs. |
| 106 | tut-story.js:34 | Squidrik still sits in Downtown. Pass the turn and let the night go on. | Squidrik is still in Downtown. End your turn. |
| 107 | tut-story.js:35 | You’ve ${g.vp} ★ now. Four 3s pay 3 ★ plus 1 for the extra die. SMASH! | You have ${g.vp} ★. Four 3s score 3 ★ plus 1 for the extra die. SMASH! |
| 108 | tut-story.js:36 | ${g.vp} ★ is the crown. End your turn with 6 and it’s yours. | You have ${g.vp} ★. End your turn with 6 to win. |
| 109 | tut-story.js:37 | First to the goal wins at once (6 ★ here, 20 in a real game), or the last monster standing. Take a bow. | First to the goal wins (6 ★ here, 20 in a real game). The last monster standing wins too. |
| 110 | tut-story.js:45 | Welcome, rookie! This short game ends at 6 ★ (real games: 20), or the last monster standing. Each turn: roll six dice, up to three times. | Welcome! This short game ends at 6 ★ (real games: 20). Each turn, roll six dice up to three times. |
| 111 | tut-story.js:46 | Each die says what it does: STAR dice score in sets, ENERGY buys cards, HEAL mends you, HIT smashes rivals. | Each die has a job. Numbers score ★. ⚡ buys cards. Hearts heal. Claws hit rivals. |
| 112 | tut-story.js:47 | See the yellow line above your dice? It shows what you would score if you smashed right now. Check it before every roll. | The yellow line shows what you score if you smash now. Check it before each roll. |
| 113 | tut-story.js:48 | Tap dice to keep them, then Roll for the rest. Kept dice can be tapped again to roll them too. | Tap dice to keep them. Then roll the rest. Tap a kept die to roll it again. |
| 114 | tut-story.js:49 | A pair of numbers scores nothing. Three of a kind scores that number in ★. Chase the third! | A pair scores nothing. Three of a kind scores that number in ★. Roll for a third! |
| 115 | tut-story.js:50 | Four of a kind! Every extra matching die adds 1 ★ on top. | Four of a kind! Each extra match adds 1 ★. |
| 116 | tut-story.js:51 | Energy dice give 1 ⚡ each. Spend ⚡ on power cards in the buy step. Unspent ⚡ is saved for later. | Each ⚡ gives 1 energy. Spend it on power cards. Unspent ⚡ carries over. |
| 117 | tut-story.js:52 | Heart dice heal 1 ♥ each, up to 10. You can’t heal inside Downtown. | Each heart heals 1 ♥, up to 10. You cannot heal in Downtown. |
| 118 | tut-story.js:53 | From outside, your claws hit the monster in Downtown. If it’s empty, nobody is hit. | From outside, claws hit the monster in Downtown. If it is empty, nobody is hit. |
| 119 | tut-story.js:54 | Happy with these dice? You may stop early: tap SMASH! to use them. | Happy with these dice? Stop early. Tap SMASH! |
| 120 | tut-story.js:55 | Downtown was empty, so you moved in: +1 ★. In the city you score more, but everyone outside hits you. | Downtown was empty, so you moved in for +1 ★. In the city you score more. Everyone outside hits you. |
| 121 | tut-story.js:56 | Starting a turn in Downtown pays +2 ★. That’s the reward for holding the city. | Starting a turn in Downtown pays +2 ★. |
| 122 | tut-story.js:57 | Power cards: tap one to read it, tap again to buy. PERMANENT stays, ONE-SHOT is used once. ♻ swaps the three for 2 ⚡. Then End turn. | Tap a power card to read it. Tap again to buy. PERMANENT cards stay. ONE-SHOT cards work once. ♻ swaps all three for 2 ⚡. Then End turn. |
| 123 | tut-story.js:58 | plays too: it rolls, keeps, smashes and buys like you. Watch the caption at the top. | plays too. It rolls, keeps, smashes and buys like you. Watch the caption at the top. |
| 124 | tut-story.js:59 | Hit in Downtown? Stay and keep earning 2 ★ a turn, or yield: you leave, and the attacker moves in. | Hit in Downtown? Stay and earn 2 ★ a turn. Or yield: you leave and the attacker moves in. |
| 125 | tut-story.js:60 | At 0 ♥ a monster is knocked out. Last one standing wins, even below the star goal. | At 0 ♥ a monster is out. The last one standing wins, even without the stars. |
| 126 | tut-story.js:61 | Nearly there! End a turn holding the star goal and you win. The check happens when your turn ends. | Nearly there! End your turn at the star goal to win. |
| 127 | tut-story.js:65 | Harbor: with 5-6 monsters a second city space opens on the water. | Harbor: with 5 or 6 monsters, a second city space opens. |
| 128 | tut-story.js:66 | Ties: if two monsters hit the goal in one turn, the one whose turn it is wins. | Ties: if two monsters reach the goal in one turn, the monster taking that turn wins. |
| 129 | tut-story.js:67 | Options: evolutions, curses and the Omen die, Brainjack, costumes, Tower and Berserk dice. Switch them on in Customise; the lightbulb explains each. | Options: evolutions, curses, Omen die, Brainjack, costumes, Tower and Berserk dice. Turn them on in Customise. The lightbulb explains each. |
| 130 | tut-story.js:68 | Some cards give an extra turn right after yours. | Some cards give you an extra turn. |
| 131 | hlp.js:43 | title:'Meet your monster',text:'First to 20 ★ wins. Tap Let’s smash to begin.' | title:'Meet your monster',text:'First to 20 ★ wins. Tap Let’s smash to start.' |
| 132 | hlp.js:45 | Yield to leave Downtown and stop the hits. Staying pays 2 ★ each turn. | Yield to leave Downtown and stop the hits. Staying pays 2 ★ a turn. |
| 133 | hlp.js:47 | Tap the dice you like. They turn yellow and stay. Then press Roll. | Tap the dice you like. They turn yellow. Then press Roll. |
| 134 | hlp.js:48 | Press Roll to throw the dice you did not keep. | Press Roll for the dice you did not keep. |
| 135 | hlp.js:49 | Tap SMASH! over the city to score them: stars, energy, hearts and claws. | Tap SMASH! to score them: stars, energy, hearts and claws. |
| 136 | hlp.js:50 | Hold a card to read it, tap to buy. Or tap End turn to save your ⚡. | Hold a card to read it. Tap to buy. Or tap End turn to save your ⚡. |
| 137 | hlp.js:51 | Watch their dice. Tap the board to speed them up. | Watch their dice. Tap the board to speed things up. |
| 138 | hlp.js:55 | Roll six dice, up to three times. Keep the good ones, roll the rest again. | Roll six dice, up to three times. Keep the good ones. Roll the rest. |
| 139 | hlp.js:56 | Three matching numbers score stars. ⚡ gives energy, claws hit rivals, hearts heal you. | Three matching numbers score ★. ⚡ gives energy. Claws hit rivals. Hearts heal you. |
| 140 | hlp.js:57 | The monster in Downtown earns 2 ★ each turn, but every rival’s claws hit it. | The monster in Downtown earns 2 ★ a turn. Every rival's claws hit it. |
| 141 | hlp.js:66 | Evolutions are secret powers only you can see. Keep one of the two offered. | Evolutions are secret powers only you can see. Keep one of the two. |
| 142 | hlp.js:67 | Play it later with the 🧬 button, when its rules allow. Details are on the card. | Play it later with the 🧬 button. The card says when. |
| 143 | hlp.js:69 | When claws hit you in Downtown you may yield: leave the city, and the attacker moves in. | When claws hit you in Downtown, you may yield. You leave and the attacker moves in. |
| 144 | hlp.js:70 | Starting your turn in Downtown pays 2 ★. But you cannot heal there, and every rival’s claws hit you. | Starting your turn in Downtown pays 2 ★. You cannot heal there. Every rival's claws hit you. |
| 145 | hlp.js:72 | Some cards and events ask you to decide. Each button says what it does. | Some cards ask you to choose. Each button says what it does. |
| 146 | hlp.js:73 | Tap the bulb: it points at the pick an experienced monster would make. | Tap the bulb. It points at a good pick. |
| 147 | hlp.js:75 | Tap a die to keep it. It turns yellow and stays put when you roll again. | Tap a die to keep it. It turns yellow and stays when you roll again. |
| 148 | hlp.js:78 | You roll up to three times. Before each reroll, choose again which dice to keep. | You roll up to three times. Before each reroll, pick which dice to keep. |
| 149 | hlp.js:80 | Press Roll to throw every die you did not keep. You get up to two rerolls. | Press Roll for every die you did not keep. You get two rerolls. |
| 150 | hlp.js:81 | Two matching numbers score nothing. Keep the pair and roll for a third one. | A pair scores nothing. Keep the pair and roll for a third. |
| 151 | hlp.js:82 | You can tap SMASH! at any time. You do not have to use every roll. | Tap SMASH! any time. You do not have to use every roll. |
| 152 | hlp.js:84 | SMASH! scores them: numbers give ★, ⚡ adds energy, hearts heal, claws hit. | SMASH! scores them: numbers give ★, ⚡ gives energy, hearts heal, claws hit. |
| 153 | hlp.js:85 | Outside Downtown, claws hit the monster inside. Inside Downtown, they hit everyone outside. | Outside, claws hit the monster in Downtown. In Downtown, claws hit everyone outside. |
| 154 | hlp.js:86 | If Downtown is empty you move in for 1 ★. Then you may buy cards with ⚡. | If Downtown is empty, you move in for 1 ★. Then you may buy cards. |
| 155 | hlp.js:88 | Spend ⚡ on the face-up cards. Tap a card to read it, tap Buy to take it. | Spend ⚡ on the cards for sale. Tap a card to read it. Tap Buy to take it. |
| 156 | hlp.js:89 | PERMANENT cards stay with you. ONE-SHOT cards act at once. SAVE FOR LATER cards wait for their moment. | PERMANENT cards stay. ONE-SHOT cards work at once. SAVE FOR LATER cards wait. |
| 157 | hlp.js:90 | Pay 2 ⚡ to throw away the cards for sale and deal fresh ones. | Pay 2 ⚡ to swap all the cards for sale. |
| 158 | hlp.js:91 | Buying nothing is fine: saved ⚡ carries over. Tap End turn to finish. | Buying nothing is fine. Saved ⚡ carries over. Tap End turn. |
| 159 | hlp.js:93 | Each monster takes a turn. Watch which dice they keep. Tap the board to speed it up. | Each monster takes a turn. Watch which dice they keep. Tap the board to speed up. |
| 160 | hlp.js:94 | You get a pop-up when you may yield Downtown or play a special card. | You get a pop-up when you can yield or play a special card. |
| 161 | hlp.js:95 | The monster in Downtown earns 2 ★ a turn, cannot heal, and takes every rival’s claws. | The monster in Downtown earns 2 ★ a turn. It cannot heal. Every rival's claws hit it. |
| 162 | campaign.json:35 | Roll your dice, tap the ones you like to keep them, and reroll the rest. Twice. | Roll your dice. Tap the ones you like to keep them. Reroll the rest, twice. |
| 163 | campaign.json:46 | Win the game: reach 20 stars or be the last monster standing. | Win: be first to 20 stars, or be the last monster standing. |
| 164 | campaign.json:53 | Shroomhulk dozes off even more; the hints stay on. | Shroomhulk is sleepier. Hints stay on. |
| 165 | campaign.json:60 | The crown sits in Downtown. Whoever starts a turn there gains 2 stars. | The crown is in Downtown. Start a turn there to gain 2 stars. |
| 166 | campaign.json:61 | But everyone outside hits the monster inside. Yield when you're hurt, take it back later. | But everyone outside hits the monster inside. Yield when hurt. Take it back later. |
| 167 | campaign.json:65 | You held the city and kept your head. That's the whole trick of Crown City. | You held the city and stayed calm. That is the trick of Crown City. |
| 168 | campaign.json:86 | Energy is money here. Spend it on power cards before the others snap them up. | Energy is money here. Spend it on power cards before others buy them. |
| 169 | campaign.json:87 | Don't like what's for sale? Pay 2 energy to sweep the cards and deal fresh ones. | Do not like what is for sale? Pay 2 energy to swap all the cards. |
| 170 | campaign.json:91 | Three monsters, one winner, and a fistful of power cards. Nice shopping. | Three monsters, one winner, and some power cards. Nice shopping. |
| 171 | campaign.json:98 | Win a 3-monster game after buying at least 2 power cards. | Win a 3-monster game after buying 2 or more power cards. |
| 172 | campaign.json:105 | Only Boltbox shows up; the third monster stays home. | Only Boltbox plays. The third monster stays home. |
| 173 | campaign.json:142 | Resolve three hearts and you pick an evolution card. Play it when its text allows. | Roll three hearts and you pick an evolution card. Play it when its text says. |
| 174 | campaign.json:223 | Spend it after a rival's last roll to resolve their dice as your own. Use it once, wisely. | Spend it after a rival's last roll to use their dice as yours. Use it once. |
| 175 | campaign.json:275 | The Crown Spire is up: hold the city and roll four 1s to climb. The top level wins outright. | The Crown Spire is up. In the city, roll four 1s to climb a level. The top level wins. |
| 176 | campaign.json:274 | Found it. Cortexa opened the portal and has been steering monsters ever since. | Found it. Cortexa opened the portal and has steered monsters since. |

ROWS: 176
