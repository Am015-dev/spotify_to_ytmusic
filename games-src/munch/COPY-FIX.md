# Doorkick Dungeon copy fix

Goal card: rewritten (one aim sentence plus three short scoring bullets)

Old text is verbatim from source (`\n` and `\'` are literal). Where the old cell is a fragment, replace only that fragment. `+N more` means the same text also appears on other lines.

| # | file:line | old line | new line |
|---|---|---|---|
| 1 | hlp.js:51 | GOAL: Be first to reach level 10. The last level can only come from killing a monster. | Be the first hero to reach level 10.\n- Beat monsters to gain levels.\n- Selling items can buy levels up to 9.\n- Your last level must come from a monster. |
| 2 | tutor.js:87 | GOAL: Be first to reach level 10. The final level can only come from killing a monster. | Be first to reach level 10. Your last level must come from a monster. |
| 3 | rules-html.js:3 | GOAL: You can only gain that last level by killing a monster (a few special cards are exceptions). | Your last level must come from killing a monster. A few special cards are exceptions. |
| 4 | coach.js:206 | <b>Goal:</b> reach level 10. Tap glowing cards. | <b>Goal:</b> be first to reach level 10. Tap glowing cards. |
| 5 | coach.js:209 | <b>Monster is stronger.</b> Play a card or run. | <b>The monster is stronger.</b> Play a card or run. |
| 6 | coach.js:178 | The Doorkick Dungeon opens once a year. ${n} fools go in; one comes out a <b>Level 10 Legend</b>. | The dungeon opens once a year. ${n} heroes go in. One comes out a <b>Level 10 Legend</b>. |
| 7 | coach.js:72 | Your lead is small: a single monster boost could turn it. | Your lead is small. One monster boost could beat you. |
| 8 | coach.js:84 | Nobody will help and no card wins it: run away ( | Nobody will help and no card wins it. Run away ( |
| 9 | hlp.js:80 | Some cards trigger a power at a set moment. Read the question, then pick a button. | Some cards have a power you can use now. Read the question, then tap a button. |
| 10 | hlp.js:81 | You can always decline. Declining keeps your cards just as they are. | You can always skip. Your cards stay as they are. |
| 11 | hlp.js:79 | No other player or hint decides this for you. Read each option before you tap. | This is your choice. Read each option, then tap. |
| 12 | hlp.js:78 | The effect needs a choice. Tap the card or button you want. | Tap the card or button you want. |
| 13 | hlp.js:83 | Tap the held card again, or tap empty space. Nothing is played until you tap a spot. | Tap the card again, or tap empty space. Nothing is played yet. |
| 14 | hlp.js:57 | Any other card goes to your hand. Then you may loot the room or fight from your hand. | Other cards go to your hand. Then loot the room or fight from your hand. |
| 15 | hlp.js:66 | Your strength against the monster. If you are higher, or tie as a Warrior, you win. | Compare your strength to the monster's. Higher wins. A Warrior wins ties. |
| 16 | hlp.js:67 | You gain levels and draw the monster’s treasure. Rivals get one last chance to boost it. | Rivals get one last chance to boost the monster. Then you gain levels and draw treasure. |
| 17 | tutor.js:91 | Your Elf runs better. Classes add powers too: Warriors win ties, Wizards flee, Thieves stab, Clerics fight undead. | Elves run away better. Classes add powers too. Warriors win ties. Wizards flee. Thieves stab. Clerics fight undead. |
| 18 | tutor.js:93 | Items go on by themselves and add to your strength. Tap the Bucket, then your hero. | Items add to your strength. Tap the Bucket, then your hero. |
| 19 | tutor.js:110 | A failed run means the monster’s Bad Stuff: it ate your hat. Some even kill you. | You failed to run, so Bad Stuff happens: it ate your hat. Some Bad Stuff kills you. |
| 20 | tutor.js:117 | Morwen fights alone. Anyone may interfere! Tap Gargantuan, then her monster: +10 for it. | Morwen fights alone, but anyone may join in. Tap Gargantuan, then her monster. It gets +10. |
| 21 | tutor.js:124 | No monster. You may loot a free card, or fight one from your hand: tap Lizards, then the door. | No monster. Loot a free card, or fight one from your hand. Tap Lizards, then the door. |
| 22 | tutor.js:133 | You beat it: +1 level, and you drew the treasure. A Treasure Pile gave 3 more cards. Tap End turn. | You won! +1 level, and you drew the treasure. A Treasure Pile gave 3 more cards. Tap End turn. |
| 23 | ui.js:134 | Watching the computer play. Press ⏸ to pause at any moment; tap a rival for their cards. | Watching the computer play. Press ⏸ to pause. Tap a rival to see their cards. |
| 24 | ui.js:218 | Pick a helper and how many of the ${cbTreasure(cb)} treasures you offer. They add their strength; if you still lose, you both run. | Pick a helper and how many of the ${cbTreasure(cb)} treasures to offer. They add their strength. If you still lose, you both run. |
| 25 | ui.js:218 | ; will say yes for ${o.yes} | , says yes for ${o.yes} |
| 26 | ui.js:218 | ; will say no | , says no |
| 27 | ui.js:223 | You can\'t use this card right now. | You cannot use this card right now. |
| 28 | net.js:32 | left the table: the computer takes over. | left. The computer takes over. |
| 29 | net.js:154 | The host’s page was running this game, so the game is over. | The host left, so the game ended. |
| 30 | engine.js:83 | stays at level ${R.WIN-1}: the last level only comes from killing a monster. | stays at level ${R.WIN-1}. The last level must come from a monster. |
| 31 | rules-html.js:4 | Everyone is a level 1 human with no class and gets 4 door cards and 4 treasure cards. Before the first turn you may play any races, classes and items from your hand. | Everyone starts as a level 1 human with no class. Everyone gets 4 door cards and 4 treasure cards. Before the first turn, play any races, classes and items from your hand. |
| 32 | rules-html.js:17 | Anyone can join in: <b style="white-space:nowrap">one-shot</b> items (potions and so on) add to either side, and <b style="white-space:nowrap">monster boosts</b> make a monster tougher or weaker. | Anyone can join in. <b style="white-space:nowrap">One-shot</b> items (potions and so on) add to either side. <b style="white-space:nowrap">Monster boosts</b> make a monster tougher or weaker. |
| 33 | rules-html.js:21 | you keep your level, race and class, but lose everything else. | you keep your level, race and class. You lose everything else. |
| 34 | rules-html.js:21 | Starting with the highest level, the other players each take one card from your body. | Starting with the highest level, each other player takes one card from your body. |
| 35 | rules-html.js:40 | Curses can be played on anyone: here that's on your turn, during fights, or when someone else's turn starts. | You can curse anyone on your turn, during fights, or when another turn starts. |
| 36 | rules-html.js:40 |  The rules follow the real card game. |  |
| 37 | rules-html.js:47 | All sounds were trimmed, loudness-normalised and converted to MP3 for this game. | All sounds were trimmed, evened out and saved as MP3. |
| 38 | cards.js:9 | Play on anyone, any time, but never to reach the winning level. | Play on anyone, any time. It cannot give you level 10. |
| 39 | cards.js:12 | Berserk: in a fight, discard up to 3 cards, +1 each. You win ties. | Berserk: in a fight, discard up to 3 cards for +1 each. You win ties. |
| 40 | cards.js:13 | Flight: discard up to 3 cards, +1 each to run away. Charm: discard your whole hand (3+ cards) to send one monster away and take its treasure (no level). | Flight: discard up to 3 cards for +1 each to run away. Charm: discard your whole hand (3+ cards) to send one monster away. Take its treasure, but no level. |
| 41 | cards.js:14 | Steal: discard a card to try for a small item: roll 4+, or lose a level. | Steal: discard a card to try for a small item. Roll 4+ or lose a level. |
| 42 | cards.js:15 | Resurrection: instead of kicking a new door, take the top door discard and discard a card. Turning: discard up to 3 cards against undead, +3 each. | Resurrection: instead of kicking, discard a card and take the top door discard. Turning: discard up to 3 cards for +3 each against undead. |
| 43 | cards.js:22 | Roll a die: 1–2 and you are trampled to death, otherwise lose that many levels. | Roll a die. On 1-2 you are trampled to death. Otherwise lose that many levels. |
| 44 | cards.js:23 | Lose your class(es); with no class, lose 3 levels. | Lose your classes. With no class, lose 3 levels. |
| 45 | cards.js:27 | Lose the footgear you wear; with none, lose a level. | Lose your footgear. With none, lose a level. |
| 46 | cards.js:28 | It kisses your face off, hat and all: lose all headgear and a level. | It kisses your face off, hat and all. Lose all headgear and a level. |
| 47 | cards.js:35 | You drop things as you flee: each other player takes one treasure card from your table or hand. | You drop things as you flee. Each other player takes one treasure card from your table or hand. |
| 48 | cards.js:37 (+1 more) | Undead. Won’t chase level 3 or lower; anyone higher who flees loses 2 levels even when they get away. | Undead. Won’t chase level 3 or lower. Anyone higher who flees loses 2 levels, even if they get away. |
| 49 | cards.js:45 | If you can’t win, drop a pole or staff to distract it: you get away automatically. | If you can’t win, drop a pole or staff to distract it. You get away automatically. |
| 50 | cards.js:51 | Roll a die: lose that many items or cards from your hand, your pick. | Roll a die. Lose that many items or hand cards, your pick. |
| 51 | cards.js:53 | You may simply walk past him and skip the fight (Halflings look tasty and must fight). | You may walk past him and skip the fight. Halflings must fight. |
| 52 | cards.js:56 | Unspeakable death for anyone but a Wizard. A Wizard just loses the Wizard card. | Anyone but a Wizard dies. A Wizard only loses the Wizard card. |
| 53 | cards.js:57 | A Cleric can shoo him off without a fight and take all his treasure (no level). | A Cleric can shoo him off without a fight. Take all his treasure, but no level. |
| 54 | cards.js:64 | -5 to a monster (never below level 1). If it is beaten, 1 less treasure (never below 1). | -5 to a monster, to a minimum of level 1. If it is beaten, 1 less treasure, to a minimum of 1. |
| 55 | cards.js:65 | The monster brings a date: an identical second monster with the same boosts. Beat both for double levels and treasure. | A second identical monster joins, with the same boosts. Beat both for double levels and treasure. |
| 56 | cards.js:68 | Wear one item the rules would not allow (any restriction or slot). Lose this card when you lose that item. | Wear one item the rules would not allow. Lose this card when you lose that item. |
| 57 | cards.js:72 | In any fight, all the monsters leave; the fighter draws 2 treasures. | In any fight, all monsters leave. The fighter draws 2 treasures. |
| 58 | cards.js:74 | If you have a class, it is replaced by the first class card in the door discards (or just lost). | Your class is replaced by the first class card in the door discards. If there is none, you lose it. |
| 59 | cards.js:75 | If you have a race, it is replaced by the first race card in the door discards (or just lost). | Your race is replaced by the first race card in the door discards. If there is none, you lose it. |
| 60 | cards.js:76 | Your sex changes for good, and you are at -5 in your next fight while you get used to it. | Your sex changes for good. You get -5 in your next fight. |
| 61 | cards.js:77 | A hen roosts on your head: -1 to all your die rolls, until something takes your headgear. | A hen sits on your head. -1 to all your die rolls until your headgear is taken. |
| 62 | cards.js:94 | Go up a level, only if a Porter is in play (anyone’s): the Porter is discarded. | Go up a level, but only if anyone has a Porter in play. Discard the Porter. |
| 63 | cards.js:99 | Pick a player: they go down a level and you go up one (never to win). | Pick a player. They go down a level and you go up one. This cannot give you level 10. |
| 64 | cards.js:159 | In any fight, another player of your choice takes over the fight, with its rewards. | In any fight, a player of your choice takes it over, with its rewards. |
| 65 | campaign.json:281 | Just win; 3 items worn is enough. | Just win. Wearing 3 items is enough. |
| 66 | campaign.json:207 | I just trip over treasure. You'll have to actually wear yours! | I trip over treasure. You have to wear yours! |
| 67 | campaign.json:536 | Selling can't give you level 10, but it gets you to 9 fast. | Selling can't give you level 10. It gets you to 9 fast. |
| 68 | campaign.json:771 | The Vault rivals play hard: they keep a safety margin and save tricks for the end. | The Vault rivals play hard. They keep a safety margin and save tricks for the end. |
| 69 | campaign.json:779 | Just one sharp rival here. Find your feet before the deep doors. | One sharp rival here. Find your feet before the deep doors. |
| 70 | campaign.json:394 | Grub still plays gently; the extra stars are optional. | Grub still plays gently. The extra stars are optional. |

ROWS: 70
