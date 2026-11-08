# Emberclimb copy fix

Goal card: rewritten (aim sentence kept short; bullets reduced to plain scoring lines)

Old text is verbatim from source (`\n` and `\'` are literal). Where the old cell is a fragment, replace only that fragment. `+N more` means the same text also appears on other lines.

| # | file:line | old line | new line |
|---|---|---|---|
| 1 | ui.js:39 | GOAL: Reach the top of the tower and defeat its guardian. | Climb to the top and beat the guardian. |
| 2 | ui.js:40 | Spend energy on cards: attacks cut enemy HP, Block stops their hits. | Attacks hurt enemies. Block stops their hits. |
| 3 | ui.js:40 | Each won fight adds a card, gold or a relic to your climb. | Win fights to get cards, gold and relics. |
| 4 | ui.js:40 | If your HP hits 0, the climb ends. | At 0 HP, the climb is over. |
| 5 | help.js:8 | 1. Above the enemy: what it does next. | 1. Each enemy shows its next move. |
| 6 | help.js:8 | 2. Tap a glowing card, then tap again to play. | 2. Tap a glowing card, then tap it again to play it. |
| 7 | help.js:8 | 3. Cards cost energy (gold coin): 3 a turn. | 3. Cards cost energy. You get 3 each turn. |
| 8 | help.js:8 | 4. Tap End turn: the enemy acts step by step. | 4. Tap End turn. Then the enemies move. |
| 9 | help.js:8 | 5. Enemy at 0 HP: you win and pick a card. | 5. Beat every enemy, then pick a card. |
| 10 | help.js:11 | Walk up the map room by room. Glowing rooms are your next step. Beat the boss at the top to win. | Climb the map one room at a time.\nGlowing rooms are next.\nBeat the boss at the top to win. |
| 11 | help.js:12 | You draw 5 cards and have 3 energy each turn. Tap a card once to lift it, again to play it. Pick a target if asked. | Each turn you draw 5 cards and get 3 energy.\nTap a card once to pick it, again to play it.\nIf asked, tap an enemy. |
| 12 | help.js:13 | Enemies show what they will do next. Block cancels attacks. Out of energy? End your turn. | Each enemy shows its next move.\nBlock stops attack damage.\nOut of energy? Tap End turn. |
| 13 | help.js:14 | Vulnerable (max 3): the next hit deals double. Weak (max 3): each hit deals 3 less. One is used up per attack; Weak against Vulnerable cancels both. Poison: 1 HP per token at end of turn, stays. Dice: 1-2 low, 3-4 middle, 5-6 high. | Vulnerable (max 3): the next hit does double.\nWeak (max 3): each hit does 3 less.\nEach attack uses up one of each.\nPoison: 1 HP per point at turn end.\nDice: 1-2 low, 3-4 middle, 5-6 high. |
| 14 | help.js:15 | Pick 1 of 3 new cards, or skip to keep your deck lean. | Pick 1 of 3 new cards, or skip to keep your deck small. |
| 15 | help.js:18 | Glowing rooms are your next step. Fights give cards, campfires heal, shops sell, ? rooms are events. | Glowing rooms are next.\nFights give cards.\nCampfires heal.\nShops sell things.\n? rooms are events. |
| 16 | help.js:20 | Tap a card once to lift it, again to play it. Pick a target if asked. You have 3 energy a turn. | Tap a card once to pick it, again to play it.\nIf asked, tap an enemy.\nYou get 3 energy a turn. |
| 17 | help.js:21 | The icon over an enemy is its next move. Block cancels attacks this turn. | The icon over an enemy is its next move.\nBlock stops its attacks this turn. |
| 18 | help.js:22 | Vulnerable: double damage. Weak: 3 less per hit. One used per attack. Poison: 1 HP per token each turn, it stays. | Vulnerable: take double damage.\nWeak: deal 3 less per hit.\nEach attack uses up one.\nPoison: 1 HP per point each turn. |
| 19 | help.js:23 | Add one of three cards to your deck, or skip to keep it lean. A sharper deck climbs higher. | Add one of three cards to your deck.\nOr skip to keep your deck small. |
| 20 | help.js:24 | Heal some HP, or smith to upgrade one card. Pick one. | Rest to heal, or smith to upgrade one card.\nPick one. |
| 21 | help.js:26 | A choice with a price or a prize. Read each option, then pick one. | Read each option, then pick one.\nSome cost HP or gold. |
| 22 | help.js:27 | Simplified on purpose | How this game differs |
| 23 | help.js:27 | Numbers are 3 times the tabletop scale (a Strike deals 6). | Numbers are bigger here: a Strike deals 6. |
| 24 | help.js:27 | The map is generated, not a printed board. | The map is new every game. |
| 25 | help.js:27 | All enemies, relics and events are our own; some card numbers are tuned. | All enemies, relics and events are original. |
| 26 | help.js:27 | Potions drop by chance after fights (max 3). | Potions drop at random after fights. You can hold 3. |
| 27 | help.js:27 | 1 or 2 heroes, not 4. | You play with 1 or 2 heroes. |
| 28 | help.js:42 | Sure? Tap again | Tap again to confirm |
| 29 | help.js:64 | Pick the songs… | Choose songs |
| 30 | help.js:73 | An original card-climbing roguelike. Names and text are our own. | A card-climbing game with its own names and text. |
| 31 | help.js:73 | until the finished art arrives. | until the final art is ready. |
| 32 | tutor.js:66 | Climb won!  | You won the climb!  |
| 33 | tutor.js:66 | The climb ends here.  | The climb is over.  |
| 34 | tutor.js:76 | Rules you met on the way:  | Rules you saw:  |
| 35 | tutor.js:80 | 'Title' | 'Title screen' |
| 36 | tutor.js:104 | Your climb now. | Now you play. |
| 37 | tutor.js:105 | It is Vulnerable now: your next hit lands double. Play on your own; I speak up when something new matters. | It is Vulnerable, so your next hit does double. Play on. I will speak up for new rules. |
| 38 | tutor.js:102 | The summit ember is fading. Climb, Garrick!\nThis Gnawer shows its next move: a bite for 4. | The summit ember is fading. Climb, Garrick!\nThis Gnawer will bite for 4 next. |
| 39 | tutor.js:103 | Crack its hide with Anvil Blow: lift it, then play it.\nAfter that, the climb is yours. | Tap Anvil Blow to pick it, then tap it again.\nAfter that, you play on your own. |
| 40 | story.js:11 | The summit ember is fading, and the Gatekeeper means to seal it away for good. | The summit ember is fading. The Gatekeeper wants to seal it. |
| 41 | story.js:11 | Your first foe is down. The tower noticed you. | Your first enemy is down. Nice start. |
| 42 | story.js:12 | The Gatekeeper sends his iron sentries down the stair to stop you. | The Gatekeeper sends iron sentries to stop you. |
| 43 | story.js:12 | You fought dirty magic and won. Onward. | You beat the sentries. Keep climbing. |
| 44 | story.js:13 | Between fights the tower offers rest, trade and strange bargains. | Between fights you can rest, shop and meet strangers. |
| 45 | story.js:13 | Rested, armed, a little richer. The crown room waits. | You are rested and ready. The crown room is next. |
| 46 | story.js:14 | His captain guards the last door. Beat it before the gate locks. | His captain guards the last door. Beat him. |
| 47 | story.js:14 | The gate stays open. The ember lives, for now. | The gate stays open. The ember is safe for now. |
| 48 | story.js:17 | I am Ashgrove, keeper of this tower. You are Garrick: 80 HP, ten honest cards.\nIf your HP hits 0, the climb is over. | I am Ashgrove. You are Garrick.\nYou have 80 HP and 10 cards.\nAt 0 HP, the climb is over. |
| 49 | story.js:18 | A Gnawer blocks the stair. Above it you can read its next move:\nit will bite for 4. | A Gnawer blocks the stair.\nThe icon above it shows a bite for 4. |
| 50 | story.js:18 | Always read them first. Monsters are honest about that much. | Always check the icon first. |
| 51 | story.js:19 | Each turn you draw 5 cards and hold 3 embers of energy. | Each turn you draw 5 cards and get 3 energy. |
| 52 | story.js:19 | Spend it all. Embers do not keep overnight. | Spend it all. Unused energy is lost. |
| 53 | story.js:20 | Crack its hide open with Anvil Blow:\nit hits and leaves the beast Vulnerable. | Play Anvil Blow.\nIt hits hard and makes the Gnawer Vulnerable. |
| 54 | story.js:20 | Hear that crack? Vulnerable. Your next hit lands double. | Now it is Vulnerable. Your next hit does double. |
| 55 | story.js:21 | That bite is coming. Raise Plate Guard:\nBlock soaks damage until your next turn. | A bite is coming. Play Plate Guard.\nBlock stops damage until your next turn. |
| 56 | story.js:22 | Your embers are spent. End your turn\nand let the beast make its move. | You are out of energy.\nTap End turn. Then the Gnawer moves. |
| 57 | story.js:22 | Now we watch. Never look away from an enemy turn. | Watch what it does on its turn. |
| 58 | story.js:23 | It bit, and your Block ate the damage.\nBlock fades when your next turn starts. | Your Block stopped the bite.\nBlock goes away when your next turn starts. |
| 59 | story.js:23 | Not a scratch. That is how a warden fights. | No damage. Well played. |
| 60 | story.js:24 | Draw: cards still waiting. Used: cards you played.\nWhen Draw runs dry, Used is shuffled back in. | Draw pile: cards you have not drawn yet.\nUsed pile: cards you played.\nWhen Draw is empty, Used is shuffled back in. |
| 61 | story.js:24 | Your deck is a wheel. It always comes round. | Your cards come back around. |
| 62 | story.js:25 | It is Vulnerable and wobbling.\nFinish it with Cinder Strike. | It is Vulnerable.\nPlay Cinder Strike to finish it. |
| 63 | story.js:25 | Down it goes! The first ember of your climb is lit. | It is down. Nice first fight. |
| 64 | story.js:26 | Every win teaches you something new.\nAdd this card to your deck. | Winning gives you a new card.\nPick one to add to your deck. |
| 65 | story.js:28 | The tower map: glowing rooms are your next step.\nA chest gleams ahead. Go claim it. | Glowing rooms are your next step.\nThe chest room is free. Go there. |
| 66 | story.js:29 | An old relic, warm to the touch.\nTake it: its gift lasts the whole climb. | This is a relic.\nTake it. Its bonus lasts the whole climb. |
| 67 | story.js:29 | It likes you. Relics choose their bearers. | Nice. Relics help in every fight. |
| 68 | story.js:31 | Crossed swords: the Gatekeeper\'s sentries.\nMeet them. | Crossed swords mean a fight.\nGo there. |
| 69 | story.js:32 | An Iron Warden. It will stuff 2 Dazed into your deck:\njunk cards you can never play. | An Iron Warden adds 2 Dazed to your deck.\nDazed cards cannot be played. |
| 70 | story.js:33 | Potions are free and break after one use.\nPour the Venom Vial on it. | Potions cost no energy and work once.\nUse the Venom Vial on it. |
| 71 | story.js:33 | Hiss! Poison is in its gears now. | It is poisoned now. |
| 72 | story.js:34 | Poison bites at the end of your turn, through any Block.\nAnd it stays until the thing falls. | Poison hurts at the end of each turn.\nBlock does not stop it.\nIt stays until the enemy falls. |
| 73 | story.js:35 | Powers burn for the whole fight.\nPlay Kindle: +2 Strength on every hit. | A Power lasts the whole fight.\nPlay Kindle for +2 Strength on every hit. |
| 74 | story.js:35 | Feel that fire in your arms? Every swing hits 2 harder. | Every hit now does 2 more. |
| 75 | story.js:36 | Roar at it: it goes Weak and hits softer.\nThe roar exhausts: gone until the next fight. | Play Roar. The enemy gets Weak and hits softer.\nRoar exhausts. It is gone until the next fight. |
| 76 | story.js:36 | It flinched. Weak things hit soft. | Weak enemies hit softer. |
| 77 | story.js:37 | Some cards roll the tower\'s die: 1-6, low to high.\nSwing wild! | Some cards roll a die from 1 to 6.\nPlay Wild Swing and see what you get. |
| 78 | story.js:37 | Ha! Fortune favours the bold. | Dice add some luck. |
| 79 | story.js:38 | Hold the rest and end your turn.\nWatch the poison chew. | Tap End turn.\nWatch the poison hurt it. |
| 80 | story.js:39 | There: the Dazed cards fell into your used pile.\nThey will clog your hand when you draw them. | The Dazed cards are in your Used pile.\nThey take up space in your hand. |
| 81 | story.js:39 | Mud in the gears. Fight through it. | Play around them. |
| 82 | story.js:40 | Your fight now: play your cards, then end the turn.\nBreak the sentry. | Your turn. Play cards, then tap End turn.\nBeat the sentry. |
| 83 | story.js:40 | Scrap metal! The Gatekeeper will hear of this. | The sentry is down. |
| 84 | story.js:41 | Sometimes the best card is no card.\nSkip it: a lean deck draws its best cards more often. | Sometimes skipping is best.\nA small deck draws its best cards more often.\nTap Skip. |
| 85 | story.js:41 | Wise. Weight slows a climber. | Good call. Small decks are strong. |
| 86 | story.js:43 | A campfire flickers on the next floor.\nYou have earned it. | A campfire is on the next floor.\nGo there to rest. |
| 87 | story.js:44 | Rest to heal, or Smith to sharpen one card.\nYou are bruised: rest. | Rest heals you. Smith upgrades one card.\nYou are hurt, so pick Rest. |
| 88 | story.js:44 | Breathe. The tower will still be here. | Good. You feel better. |
| 89 | story.js:45 | A trader set up shop on the stair.\nSee what she sells. | A trader sells things here.\nGo in and look. |
| 90 | story.js:46 | Gold buys cards, relics and potions,\nand she will burn away a card for a fee. | Gold buys cards, relics and potions.\nShe can also remove a card for gold. |
| 91 | story.js:47 | Spent well. Gold is for spending. | Good buy. |
| 92 | story.js:49 | A ? room: the tower likes surprises.\nStep inside. | A ? room is an event.\nGo inside. |
| 93 | story.js:50 | An ember shrine hums with warmth.\nPray to heal. | This shrine can heal you.\nPick Pray. |
| 94 | story.js:50 | The tower is on your side tonight. | You feel better. |
| 95 | story.js:52 | The crown room. The Gatekeeper\'s captain guards his gate.\nWin, and the climb is yours. | The crown room holds the boss.\nBeat it to win the climb. |
| 96 | story.js:53 | Captains fight to a pattern. When it grows Spikes,\nattacks on it cut you back: block that turn. | The captain repeats a pattern.\nWhen it has Spikes, attacking it hurts you.\nPlay Block that turn. |
| 97 | story.js:53 | Read it, then strike. You know how. | Check its move, then strike. |
| 98 | story.js:54 | This is it, Garrick.\nRead its move each turn and break it. | This is it, Garrick.\nCheck its move each turn and beat it. |
| 99 | story.js:55 | The captain dropped three relics.\nTake one for the road. | The captain dropped 3 relics.\nPick one. |
| 100 | story.js:58 | Others will climb with you: a poison Rogue, a clockwork Automaton,\na Monk of stances. Story mode tells their tale. | More heroes join you later: a Rogue, an Automaton and a Monk.\nStory mode shows how. |
| 101 | story.js:60 | You beat the Gatekeeper\'s captain and kept the summit open. The real climb starts now. | You beat the captain and kept the summit open.\nTime for a real climb. |
| 102 | story.js:64 | The summit ember is fading and the Gatekeeper wants it sealed. Climb, Garrick. I will talk when it matters. | Let us climb, Garrick. I will speak up when something new comes. |
| 103 | story.js:66 | You hold 3 energy a turn. A card costs the number in its corner. | You get 3 energy each turn. A card costs the number in its corner. |
| 104 | story.js:67 | Above each enemy: its next move. Plan around it. | The icon above each enemy shows its next move. |
| 105 | story.js:68 | An attack is coming. Block cards soak damage until your next turn. | An attack is coming. Block stops damage until your next turn. |
| 106 | story.js:69 | No playable cards left: End turn. The enemy then acts step by step. | No cards you can play. Tap End turn. |
| 107 | story.js:70 | Several enemies: after lifting an attack, tap the enemy you want to hit. | Pick an attack card, then tap the enemy to hit. |
| 108 | story.js:73 | Poison: 1 HP per token at the end of the turn, through Block. It stays. | Poison costs 1 HP per point at turn end. Block cannot stop it. |
| 109 | story.js:74 | Strength adds to every hit you make this fight. | Strength adds damage to every hit this fight. |
| 110 | story.js:76 | Exhaust cards vanish for the rest of this fight once played. | Exhaust cards are gone for this fight after you play them. |
| 111 | story.js:77 | Die cards roll 1-6: low, middle or high result. | Die cards roll 1 to 6: 1-2 low, 3-4 middle, 5-6 high. |
| 112 | story.js:78 | Junk cards like Dazed can never be played. They just clog your hand. | Junk cards like Dazed cannot be played. They fill your hand. |
| 113 | story.js:79 | Your draw pile ran dry: your used cards were shuffled back in. | Your Draw pile ran out. Your Used pile was shuffled back in. |
| 114 | story.js:80 | You carry a potion: free to use, one use. Tap it in the dock. | You have a potion. It costs no energy and works once. Tap it to use it. |
| 115 | story.js:81 | Each win: pick one card for your deck, or skip to keep it lean. | Pick one new card, or skip to keep your deck small. |
| 116 | story.js:82 | Gold piles up. Spend it at shops. | Spend your gold at a shop. |
| 117 | story.js:83 | A relic: a lasting bonus for the whole climb. | A relic gives a bonus for the whole climb. |
| 118 | story.js:84 | Your path: glowing rooms are your next step. Pick one. | Pick a glowing room. That is your next step. |
| 119 | story.js:85 | Campfire: rest to heal, or smith to upgrade one card. | Campfire: Rest heals you. Smith upgrades one card. |
| 120 | story.js:86 | A shop: tap an item to read it, then Buy. You can also pay to remove a card. | Tap an item to read it, then tap Buy. You can also pay to remove a card. |
| 121 | story.js:87 | A ? room: a choice with a price or a prize. | A ? room is an event. Read the choices and pick one. |
| 122 | story.js:88 | An elite: tougher than a normal foe, better loot. | An elite is tougher than a normal enemy. It drops a relic. |
| 123 | story.js:89 | The boss repeats a pattern. On its Spikes turn, attacks hurt you: block instead. | The boss repeats a pattern. When it has Spikes, play Block, not attacks. |
| 124 | story.js:91 | Hints (top bar) on: lift a card and each foe shows the exact damage it would take, and you see the Block you would gain. | Hints are on. Pick a card to see its damage and Block. |
| 125 | story.js:93 | A full climb has three acts, each with its own foes and guardian, plus a final act. Each new act heals you fully. | A full climb has three acts and a final act. Each new act heals you fully. |
| 126 | story.js:94 | Last Stand: with two heroes in a boss fight, the first to fall stays at 1 HP. The second fall ends the climb. | Last Stand: in a boss fight, the first hero to fall stays at 1 HP. The second fall ends the climb. |
| 127 | story.js:95 | Shivs: 0-cost knives that hit for 3. At most 5 in hand. | Shivs are free knives that hit for 3. You can hold 5. |
| 128 | story.js:96 | Orbs: Lightning zaps, Frost blocks, Dark grows. A full row fires the oldest. | Orbs: Lightning hits, Frost blocks, Dark grows. When full, the oldest fires. |
| 129 | story.js:97 | Stances: Wrath adds 3 per hit but costs 3 HP at turn end; leaving Calm gives 2 energy. | Wrath adds 3 damage per hit and costs 3 HP at turn end. Leaving Calm gives 2 energy. |
| 130 | story.js:98 | Scry: look at the top cards of your draw pile and discard the ones you do not want. | Scry: look at the top cards of your Draw pile. Discard any you do not want. |
| 131 | story.js:101 | Double damage on a Vulnerable foe. Nicely done. | Double damage on a Vulnerable enemy. Nice. |
| 132 | story.js:101 | Fully blocked. That is how a warden fights. | You blocked it all. Well played. |
| 133 | story.js:102 | Ouch. A Block card would have soaked some of that. | Ouch. A Block card would have stopped some of that. |
| 134 | story.js:102 | Spikes bit you. On its Spikes turn, block instead. | Spikes hurt you. When it has Spikes, play Block. |
| 135 | story.js:102 | You ended with energy left. Spend it all next time. | You had energy left. Try to use it all. |
| 136 | story.js:103 | Things you will meet later | Rules you have not seen yet |
| 137 | story.js:103 | title2: 'Title' | title2: 'Title screen' |
| 138 | story.js:107 | A new climber. The Gatekeeper wants this tower sealed, and only climbers keep the gate open. | A new climber. The Gatekeeper wants to seal this tower. Only climbers keep it open. |
| 139 | story.js:107 | You kept the gate open tonight. Now the real road. | You kept the gate open. Now the real climb starts. |
| 140 | story.js:107 | Everyone falls once. Get up. | Everyone falls once. Try again. |
| 141 | story.js:108 | His Warden Captain grows Spikes: block that turn, strike the next. | His Warden Captain grows Spikes. Block that turn, then strike. |
| 142 | story.js:108 | The captain is down, and a Rogue was watching from the reeds. She wants in. | The captain is down. A Rogue was watching. She wants to join. |
| 143 | story.js:108 | Block on the spike turn. Again. | Block on the Spikes turn. Try again. |
| 144 | story.js:109 | Sable the Rogue takes the Thorn Gate, where the Mire Behemoth wallows. Poison stays and bites every turn. | Sable the Rogue takes the Thorn Gate. The Mire Behemoth waits there. Poison hurts every turn. |
| 145 | story.js:109 | My Behemoth fills your deck with slime. Act one ends in the mud. | My Behemoth fills your deck with slime. Act one ends here. |
| 146 | story.js:109 | The first guardian sinks. Act one is done: the Ash Stair is next, and its foes are tougher. | The first guardian is down. Act one is done. The Ash Stair is next, with tougher enemies. |
| 147 | story.js:109 | Slime clogs your hand. Stack poison early and let it work. | Slime fills your hand. Use Poison early and let it work. |
| 148 | story.js:110 | Act two, the Ash Stair. An Automaton wakes; it channels orbs of lightning, frost and dark. | Act two, the Ash Stair. An Automaton wakes. It uses Lightning, Frost and Dark orbs. |
| 149 | story.js:110 | My Skyclaw hunts from above. Ash wisps make your shields thin: that is Frail. | My Skyclaw hunts from above. Ash wisps give you Frail, so your Block is weaker. |
| 150 | story.js:110 | Three quick claws: block before the flurry, not after. | Three quick claws. Block before they hit. |
| 151 | story.js:111 | Brother Quill, the Monk. Calm stores energy; Wrath hits 3 harder but burns 3 HP to stay in. | Brother Quill, the Monk. Calm stores energy. Wrath adds 3 damage but costs 3 HP. |
| 152 | story.js:111 | Calm and fury, both mastered. Act two ends; the Gatekeeper is angry now. | You used both stances well. Act two ends. The Gatekeeper is angry. |
| 153 | story.js:112 | Back to Garrick, and the Ashen Wraith that guards the top of act two. | Back to Garrick. The Ashen Wraith guards the top of act two. |
| 154 | story.js:112 | The wraith is smoke. Act three: the Cinder Gate, where the dead keep watch. | The wraith is gone. Act three is next: the Cinder Gate. |
| 155 | story.js:112 | Burns pile up. End the fight quickly. | Burn cards pile up. Win fast. |
| 156 | story.js:113 | The king lies down again. Only the Hall of Gears stands before the gate. | The king lies down again. Only the Hall of Gears is left before the gate. |
| 157 | story.js:113 | His Frail makes your Block thin. Kill fast, block big. | Frail weakens your Block. Win fast and block big. |
| 158 | story.js:114 | The Automaton in the Hall of Gears, a long climb with no rest for its circuits. | The Automaton in the Hall of Gears. It is a long climb with no rest. |
| 159 | story.js:114 | Every skill fed the Brute. Attack on its turn to grow. | Each skill you play makes the Brute stronger. Play attacks instead. |
| 160 | story.js:115 | The gate stands open. But below the summit the ember has a master of its own. | The gate is open. But the ember has a master below the summit. |
| 161 | story.js:115 | His Wyrm strikes for 24: be in Calm with Block up. | His Wyrm hits for 24. Be in Calm with Block up. |
| 162 | story.js:116 | Two climbers: if one falls to the Tyrant, a Last Stand keeps them at 1 HP. The second fall ends it. | Two climbers: the first to fall stays at 1 HP (Last Stand). The second fall ends the climb. |
| 163 | story.js:116 | The Tyrant is ash and the ember burns free. The tower is yours, climbers. | The Tyrant is gone and the ember burns free. The tower is yours. |
| 164 | story.js:116 | Together, again. Watch the 30 hit. | Try again together. Watch for the 30 hit. |
| 165 | story.js:120 | The gate stays open another night. The tower remembers your name. | The gate stays open another night. Well climbed. |
| 166 | story.js:121 | The Gatekeeper smiles as the gate grinds shut. Climb again. | The gate shut. Try the climb again. |
| 167 | ui.js:83 | Guardian slain! | Guardian beaten! |
| 168 | ui.js:92 | Spikes! Attacking it cost you  | Spikes hurt you: - |
| 169 | ui.js:184 | Do the glowing step first | Tap the glowing spot first |
| 170 | ui.js:205 | Beat Story chapter | Win Story chapter |
| 171 | ui.js:237 | Two heroes, shared map. Pass the screen. Tap to pick both. | Two heroes share one map. Tap two heroes, then pass the screen. |
| 172 | ui.js:237 | Tap a hero to pick them. Use + Second hero to play together. | Tap a hero to pick them. Tap + Second hero to play with two. |
| 173 | ui.js:268 | The enemy is acting. Tap to speed up. | Enemies are moving. Tap to speed up. |
| 174 | ui.js:269 | Now tap the glowing enemy to play  | Tap the glowing enemy to play  |
| 175 | ui.js:276 | Rest, or smith a card. | Rest to heal, or smith to upgrade a card. |
| 176 | ui.js:279 | You won this climb. | You won the climb. |
| 177 | ui.js:324 | Unknown: this enemy has not shown its next move. | Unknown: its next move is hidden. |
| 178 | ui.js:329 | damage (Block soaks it first). | damage. Block stops it first. |
| 179 | ui.js:333 | Weak: each of your hits deals 3 less. One Weak is used up per attack (max 3). | Weak: your hits do 3 less. Each attack uses up one Weak. Max 3. |
| 180 | ui.js:334 | Vulnerable: you take double damage from a hit. One is used up per attack (max 3). | Vulnerable: hits on you do double. Each hit uses up one. Max 3. |
| 181 | ui.js:336 | Poison: lose 1 HP per poison at the end of the turn, ignoring Block. It stays. | Poison: lose 1 HP per point at turn end. Block cannot stop it. It stays. |
| 182 | ui.js:337 | to your discard pile. It clogs your deck. | to your Used pile. It fills your hand. |
| 183 | ui.js:338 | every attack card you play on it hurts you for  | each attack card you play on it hurts you for  |
| 184 | ui.js:338 | Use skills or block that turn. | Block that turn. |
| 185 | ui.js:339 | Unknown: it is up to something. Watch out. | Unknown: watch out. |
| 186 | ui.js:577 | Good fight: lost  | Good fight. You lost  |
| 187 | ui.js:577 | , no wasted energy | , and you used all your energy |
| 188 | ui.js:577 | Poor fight: took  | Rough fight. You lost  |
| 189 | ui.js:577 | energy unspent over  | energy left over after  |
| 190 | ui.js:577 | , block more before big hits | . Block more before big hits |
| 191 | ui.js:597 | Sit, climber. Heal  | Rest to heal  |
| 192 | ui.js:597 | HP, or sharpen one card. | HP, or smith to upgrade one card. |
| 193 | ui.js:646 | Final boss down:  | You beat the final boss:  |
| 194 | ui.js:646 | The guided fight is won. | You won the practice fight. |
| 195 | ui.js:646 | Felled by  | Beaten by  |
| 196 | ui.js:646 | Your own cards finished you. | You lost HP to your own cards. |
| 197 | ui.js:641 | 'FALLEN' | 'CLIMB OVER' |
| 198 | ui.js:660 | Relics (tap for text) | Relics (tap to read) |
| 199 | data.js:182 | Start fights with 1 Miracle: spend for +1 energy. | Start fights with 1 Miracle. Spend it for +1 energy. |
| 200 | data.js:186 | Enemies start Vulnerable 1. | Enemies start with 1 Vulnerable. |
| 201 | data.js:188 | Rest sites heal 10 more. | Campfires heal 10 more. |
| 202 | data.js:197 | Once per run: revive at 30% HP. | Once per climb: come back at 30% HP. |
| 203 | data.js:200 | Deal 20 to an enemy. | Deal 20 damage to one enemy. |
| 204 | data.js:211 | Offer 6 HP: upgrade a card | Lose 6 HP: upgrade a card |
| 205 | data.js:212 | Sell blood: +60 gold, -8 HP | Sell blood: gain 60 gold, lose 8 HP |
| 206 | data.js:214 | Loot: +45 gold, Regret | Loot: gain 45 gold and a Regret card |
| 207 | data.js:215 | Gain 6 max HP, Doubt | Gain 6 max HP and a Doubt card |
| 208 | data.js:216 | A grin and a pair of dice. | A man with dice wants a bet. |

ROWS: 208
