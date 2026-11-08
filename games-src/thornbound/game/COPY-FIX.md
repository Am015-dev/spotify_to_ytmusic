# Thornbound Throne: copy-fix table
Game: thornbound. Date: 2026-11-08.

## Goal card
The aim is stated in one sentence in most places, but the wording drifts and some versions carry extra clauses. The title card says: "Win by holding the most Influence when the last round ends." The coach line says: "Influence is your score. The most when the last round ends wears the crown." (vague: "the most" what, and "wears the crown" is flowery). The quick rules say it in two sentences plus a tie rule.
Verdict: fixed. Use ONE sentence everywhere: "Hold the most Influence when the last round ends." (Tie rule lives in the full rules only.)

Old goal lines are in the table below: story.js (coach goal, tutorial goal), ui7.js (title card), ui12.js (retired goal step).

| file:line | old line | new line |
|---|---|---|
| story.js:7 | The crown is yours, and the heath sings your name. | You win the crown. The heath cheers for you. |
| story.js:7 | The Court holds the gate this time. Gather your Clans and ride again. | The Court wins this time. Try again. |
| story.js:7 | Neither banner falls. The Favour decides the crown. | It is a tie. The Favour holder wins. |
| story.js:10 | First pick of the road is yours. Well bid, heir. | You pick first. Well bid, heir. |
| story.js:11 | Three cards down. Now the heath will judge them. | Three cards hidden. Now we see how they fare. |
| story.js:12 | The clans are in place. Let the horns sound. | Your people are placed. Sound the horns. |
| story.js:13 | Cards flip, and the heath chooses its heir. | Cards flip. The best total wins. |
| story.js:11 | Now the quiet work: where to stand, and what to hide. | Now choose where to stand and what to hide. |
| story.js:12 | Your people have come. Put them where they matter. | Your people have come. Send them where they help most. |
| story.js:16 | The king is dead. Three regions, six locations: hold them and you hold the Throne. | Three regions, six locations. Hold more of them than your rivals. |
| story.js:17 | Influence is how the kingdom counts loyalty. The most when the last round ends wears the crown. | Influence is your score. Most Influence after the last round wins. |
| story.js:18 | Tamsin bids for first pick of the road. Answer with your '+cinfo | Tamsin bids for first pick. Bid your '+cinfo |
| story.js:19 | Lay it face down. She must not see what you offer. | Place it face down. Tamsin cannot see it. |
| story.js:19 | Hidden well. She will wonder all night. | Hidden well. Tamsin cannot guess it. |
| story.js:21 | The winner takes a Kingdom Card, a favour you keep all game. Take the glowing one. | The bid winner keeps a Kingdom Card. Take the glowing one. |
| story.js:21 | A fine favour. It will serve you through the whole war. | Good choice. You keep it all game. |
| story.js:22 | The crowd cheers your name. Only a win there makes it pay. | It pays only if you win there. |
| story.js:24 | Slip it into the Uplands. Nobody sees it until the Clash. | Put it in the Uplands. Nobody sees it until the Clash. |
| story.js:25 | Your Heir is your strongest card. Hide it in the Tablelands, where both Heralds stand. | Hide your Heir, your strongest card, in the Tablelands. |
| story.js:27 | Supporters are loyal hands: each adds +1 here this round. Send two to the Tablelands. | Each Supporter adds +1 here this round. Send two to the Tablelands. |
| story.js:27 | Two more hands in the Tablelands. That is +2. | Two Supporters in the Tablelands. That is +2. |
| story.js:28 | Spring is done. Tell the kingdom you are ready. | Spring is done. Tap Done. |
| story.js:29 | You decide which region fights first. Start with the Uplands, then the Tablelands. | Pick the fight order. Tap the Uplands, then the Tablelands. |
| story.js:29 | The horns sound. The first Clash begins. | The first Clash begins. |
| story.js:31 | Your Herald there earns extra. | Your Herald there earns a bonus. |
| story.js:31 | That is how a crown is won: one region at a time. | You win the crown one region at a time. |
| story.js:34 | You did it. Tamsin keeps the gate, and the heath is yours. | You won. The heath is yours. |
| story.js:34 | Tamsin wins this one. Real games are longer: try again. | Tamsin wins this one. Real games are longer. Try again. |
| story.js:38 | The king is dead. Three regions, six locations: hold them and you hold the Throne. Play any card you like; I will speak up when a rule matters. | Hold the most of six locations. Play any card; I will help. |
| story.js:39 | Influence is your score. The most when the last round ends wears the crown. | Influence is your score. Most Influence after the last round wins. |
| story.js:40 | Every round starts with a secret bid. Tap a card, then the glowing spot. The highest bid chooses first. | Bid in secret: tap a card, then the glowing spot. |
| story.js:41 | A tie goes to the higher on the Order Track. | A tie goes to whoever is higher on the Order Track. |
| story.js:42 | The winner takes a Kingdom Card, a favour you keep all game. Your bid card goes under it. | The bid winner keeps a Kingdom Card. Your bid goes under it. |
| story.js:43 | Place your Herald on a location. It pays only if you win that region; stand where Tamsin stands to steal from her. | Place your Herald. It pays if you win that region. |
| story.js:44 | Hide one card at each region, face down. Your Heir and your biggest cards belong where it matters. | Hide one card per region. Put big cards where you want to win. |
| story.js:45 | Supporters add +1 each in a region this round. Tap a region to send one, then Done. | Each Supporter adds +1. Tap a region to send one, then Done. |
| story.js:46 | You choose which region fights first. Tap the regions in order. | Choose which region fights first. Tap the regions in order. |
| story.js:48 | Winner of a region claims one of its two locations: its Influence, plus +1 and a steal if your Herald stands there. | The winner claims one location and its Influence. A Herald there adds +1. |
| story.js:49 | Scoring: you have '+myInf()+', Tamsin '+rivInf()+'. Location reward, Herald bonus and steals all count. | Score: you '+myInf()+', Tamsin '+rivInf()+'. Location, Herald bonus and steals all count. |
| story.js:50 | The round ends: Supporters go home, played cards are discarded, a new round begins. Real games last 4 to 6 rounds. | Round over. Supporters leave and played cards are discarded. |
| story.js:54 | Tap a card to bid it in secret. The highest bid picks first. | Tap a card to bid it in secret. High bid picks first. |
| story.js:60 | Choose where you will stand in the turn order. | Choose your place in the turn order. |
| story.js:62 | Use a power if you like, then tap Done. | Use a power if you want, then tap Done. |
| ui11.js:44 | Bid for a Kingdom Card, place your Herald, hide cards, send Supporters, fight the Clashes. | Bid, place your Herald, hide cards, send Supporters, then fight. |
| ui11.js:45 | Pick one hand card as your secret bid. The highest bid chooses a Kingdom Card first. | Pick one card as your secret bid. High bid picks first. |
| ui11.js:46 | Your bid card is tucked under the Kingdom Card you take, so it cannot fight this round. | Your bid card goes under the Kingdom Card and cannot fight. |
| ui11.js:47 | A cheap bid keeps your strong cards for the Clashes. A high bid picks first. | A cheap bid saves strong cards. A high bid picks first. |
| ui11.js:48 | A Kingdom Card works for you every round you keep it. Tap a glowing one to read it. | A Kingdom Card helps every round. Tap a glowing one. |
| ui11.js:49 | Tap Keep my card to take your bid back, or steal a Kingdom Card from a rival. | Tap Keep my card to take your bid back. |
| ui11.js:51 | A stronger card under it makes your Kingdom Card harder for rivals to steal. | A stronger card under it is harder for rivals to steal. |
| ui11.js:52 | Tap a glowing location. Your Herald pays off only if you win that location\'s region. | Tap a glowing location. Your Herald pays if you win there. |
| ui11.js:53 | Win the region and claim the location: +1 Influence, and take 1 from each rival Herald there. | Win and claim it: +1 Influence, and steal from rival Heralds. |
| ui11.js:54 | Tap a card, then tap a region (or drag it there). It stays face down until the Clash. | Tap a card, then a region. It stays hidden until the Clash. |
| ui11.js:56 | Pass keeps your cards in your hand. If everyone passes, nobody wins that region. | Pass keeps your cards. If everyone passes, nobody wins. |
| ui11.js:57 | The totals are equal. Each side may add one more hidden card, or pass. | Totals are equal. Add one more hidden card, or pass. |
| ui11.js:60 | Supporters on the map are lost in Winter. Tap Done when you are finished. | Supporters are lost in Winter. Tap Done when finished. |
| ui11.js:61 | The cards are face up. The highest total Strength wins the region. Tap Done to fight it. | Cards are face up. Highest total wins the region. Tap Done. |
| ui11.js:62 | Some cards and Tactics can act now, before the result. Tap Powers to look. | Some cards and Tactics act before the result. Tap Powers. |
| ui11.js:63 | After the Clashes you may Govern or Journey with a card. Tap Done to skip both. | After the Clashes, you may Govern or Journey. Tap Done to skip. |
| ui11.js:64 | Send a card on a Journey for Lore. Lore buys stronger Site of Power cards. | A Journey gains Lore. Lore buys Site of Power cards. |
| ui11.js:65 | A card with votes goes into a Council for a lasting power. | A card with votes joins a Council for a lasting power. |
| ui11.js:66 | Tap the regions in the order they fight. Your strongest region first is a good start. | Tap the regions in fighting order. Start with your strongest. |
| ui11.js:67 | Each region fights once per round. The winner claims one of its two locations. | Each region fights once a round. The winner claims one location. |
| ui11.js:69 | If your Herald stands there you gain 1 more, and take 1 from each rival Herald. | Your Herald there adds 1 and steals 1 from rivals. |
| ui11.js:71 | Tap an option to read it. Skipping is always allowed, and keeps your cards. | Tap an option to read it. You may always skip. |
| ui11.js:72 | Lore buys Site of Power cards. A card with Strength goes to your hand. | Lore buys Site of Power cards. Strength cards go to your hand. |
| ui11.js:74 | Your hand is over its size limit. Discard cards down to the limit. | You have too many cards. Discard down to the limit. |
| ui11.js:75 | Keep your strong cards for the Clashes. Discard the weakest ones. | Keep strong cards for the Clashes. Discard the weakest. |
| ui5.js:113 | <b>Simplified on purpose:</b> starting hand is 6; the solo mode and the optional advanced setup of the board game are not built. | <b>Simplified on purpose:</b> you start with 6 cards. No solo mode or advanced setup. |
| ui5.js:114 | Underlined words in the game can be tapped for their meaning. | Tap underlined words to see what they mean. |
| ui4.js:131 | Every round starts with a secret bid. The highest bid picks a Kingdom Card first; the card you bid then sits under it and cannot fight. | Bid in secret. High bid picks first. Your bid card goes under it. |
| ui4.js:132 | Your Herald is public. If you win a region and claim the location where your Herald stands, you gain +1 Influence and take 1 from every rival Herald there. | Everyone sees your Herald. Win there for +1 Influence and steals. |
| ui4.js:133 | You hide one card at each of the three regions. Put big cards where the prize matters and cheap ones elsewhere. | Hide one card per region. Put big cards where the prize is best. |
| ui4.js:134 | Supporters add +1 Strength each in a region\'s first Clash. Open the list for other actions, or finish the step. | Each Supporter adds +1 Strength. Open the list for more actions. |
| ui4.js:135 | The player with the least Influence chooses the order of the three Clashes. | The player with least Influence picks the Clash order. |
| ui4.js:136 | The winner claims one of the region\'s two locations: its Influence and its bonus. | The winner claims one location, with its Influence and bonus. |
| ui4.js:137 | Take a Kingdom Card from the Great Road, steal one a rival holds (your bid must beat the card under it), or take your card back. | Take a Kingdom Card, steal one, or take your card back. |
| ui4.js:147 | Everyone else look away. | Everyone else, look away. |
| ui4.js:194 | You have played a whole game. Next time try a full game from Play: choose the faction whose story you like, 3 players, 5 rounds. Suggestions show in rounds 1 and 2; after that tap Suggest a move when you want one. | You finished a game. Next, try a full game: 3 players, 5 rounds. |
| ui3.js:8 | Spring, Bids. Everyone secretly picks one card from their hand as a bid. Highest bid chooses first: take a Kingdom Card, steal a rival\'s, or take your card back. A card you bid under a Kingdom Card stays there while you keep it. | Spring, Bids. Pick one card as a secret bid. High bid chooses first. |
| ui3.js:9 | Spring, Heralds. In turn, put your Herald on one of the six locations. Everyone sees it. If you win a clash and claim that location you gain 1 Influence and steal 1 from every rival Herald on it. | Spring, Heralds. Place your Herald on a location. Win there for a bonus. |
| ui3.js:10 | Spring, Cards. Secretly play one face-down card next to each of the three regions. The strongest total in a region wins its clash, so decide where your big cards go. | Spring, Cards. Hide one card at each region. Highest total wins. |
| ui3.js:11 | Spring, Actions. In turn order you may use Spring abilities, such as sending Supporters (+1 Strength each) to a region. Skip it if you have nothing to do. | Spring, Actions. Send Supporters (+1 Strength each) or use abilities. |
| ui3.js:12 | Summer, Clashes. Regions are resolved one by one. Cards are revealed, Day and Night abilities fire, the strongest total wins and claims one of the region\'s two locations. | Summer, Clashes. Regions fight one by one. The highest total wins. |
| ui3.js:13 | Autumn. Once each you may Govern (move a hand card with votes into a Council) and Journey (spend a hand card for Lore to buy Site of Power cards), plus any Autumn abilities. | Autumn. You may Govern (join a Council) and Journey (gain Lore). |
| ui3.js:14 | Winter. Heralds go home, Supporters are lost, played cards go to the discard pile, and the next round starts. Running out of deck shrinks your hand size (Attrition). | Winter. Heralds go home, Supporters are lost, and played cards are discarded. |
| ui3.js:62 | A high bid ('+i.strength+') chooses early, but this card then sits under the Kingdom Card and cannot fight. | A high bid ('+i.strength+') picks early, but that card cannot fight. |
| ui3.js:63 | A cheap bid ('+i.strength+') keeps your strong cards for the Clashes. You may choose late; you can always take your card back. | A cheap bid ('+i.strength+') saves strong cards. You can take it back. |
| ui3.js:64 | A middle bid ('+i.strength+') can still win a good Kingdom Card while your strongest cards stay free for the Clashes. | A middle bid ('+i.strength+') can still win a good card. |
| ui3.js:69 | Nothing on offer is worth a card: take it back and keep your hand full. | Nothing good here. Take your card back. |
| ui3.js:69 | Stealing takes a Kingdom Card from a rival; their card under it goes back to their hand. | Stealing takes a rival\'s Kingdom Card. Their card returns to their hand. |
| ui3.js:69 | It works for you every round you keep it: ' | It helps you every round: ' |
| ui3.js:67 | Passing keeps your cards. If everyone passes, nobody wins this region. | Passing keeps your cards. If all pass, nobody wins. |
| ui3.js:86 | Nothing else here helps right now, so finish this step. | Nothing else helps now. Finish this step. |
| ui3.js:73 | Nothing more here is worth it right now. | Nothing more is worth it right now. |
| ui3.js:74 | Site of Power cards are stronger than your basic cards; buying one now makes your deck better for the rest of the game. | Site of Power cards beat basic cards. Buying one improves your deck. |
| ui3.js:75 | Cards at the bottom of your deck come back later, after a reshuffle; weak cards there leave room for better draws. | Weak cards at the bottom of your deck mean better draws. |
| ui3.js:77 | Taking strong cards back to your hand saves them from Winter\'s discard. | Taking strong cards back saves them from Winter\'s discard. |
| ui3.js:78 | Of the choices here this one gains you the most. | This choice gains you the most. |
| ui3.js:91 | Your Favour power has limited uses; this is a good one. | Your Favour power has few uses. This is a good time. |
| ui3.js:93 | Rally brings strong cards back to your hand before Winter discards them. | Rally returns strong cards to your hand before Winter. |
| ui3.js:98 | Worth doing before you finish this step. | Worth doing before you finish. |
| ui8.js:87 | is your weakest card: a card under a Kingdom Card cannot fight. (A stronger one would make the Kingdom Card harder to steal.) | is your weakest card, and cards under Kingdom Cards cannot fight. |
| ui8.js:111 | This is the last round: only Influence counts now, and nothing here gives Influence. | Last round: only Influence counts, and nothing here gives any. |
| ui8.js:111 | This is the last round: only Influence counts now. ' | Last round: only Influence counts. ' |
| ui8.js:112 | Nothing here is worth spending this round. | Nothing here is worth using this round. |
| ui8.js:112 | Nothing here gains you more than it costs. | Nothing here is worth the cost. |
| ui8.js:105 | Your strongest region fights first ('+ | Your strongest region goes first ('+ |
| ui8.js:94 | Keep the card: it is worth more in your hand than this bonus. | Keep the card. It is worth more than this bonus. |
| ui8.js:95 | The Favour lets you use '+DD.FAVOUR[G.pl[s].fac].nm+' up to three times, and it breaks a tie at the end. | The Favour gives '+DD.FAVOUR[G.pl[s].fac].nm+' three times and breaks ties. |
| ui8.js:96 | Your eliminated card comes back to your hand instead of staying lost. | Your eliminated card returns to your hand. |
| ui8.js:99 | That is enough cards back in your hand. | That is enough cards. |
| ui8.js:101 | Back in your hand, the card can fight again next round. | In your hand, it can fight next round. |
| ui8.js:100 | Keep your cards: nothing here needs to go. | Keep your cards. Nothing here needs to go. |
| ui5.js:74 | Saved. You can continue from the start screen. | Saved. Resume from the start screen. |
| ui12.js:51 | Three regions, two locations each. Every location you claim pays Influence. | Three regions, two locations each. Each claim pays Influence. |
| ui12.js:52 | Influence is your score. After the last round, the most Influence wins. | Influence is your score. Most Influence after the last round wins. |
| ui12.js:60 | Take a Kingdom Card: a power you keep. Your bid card goes under it. Tap the glowing one. | Take a Kingdom Card to keep. Your bid goes under it. |
| ui12.js:74 | Supporters are placed. Tap Done to end Spring. | Supporters placed. Tap Done to end Spring. |
| ui12.js:76 | You choose which region fights first. Tap the Uplands, then the Tablelands. | Pick the fight order: Uplands, then Tablelands. |
| ui12.js:86 | The round ends: Supporters go home and played cards are discarded. You have ' | Round over. Supporters leave and cards are discarded. You have ' |
| ui12.js:89 | Real games last 4 to 6 rounds. The most Influence wins: ' | Real games last 4 to 6 rounds. Most Influence wins: ' |
| ui7.js:208 | Win by holding the most Influence when the last round ends. | Win by holding the most Influence at the end. |
| ui7.js:208 | The king is dead. Four factions reach for his crown. | The king is dead. Four factions want his crown. |
| ui4.js:195 | The host can start another game. | The host can start a new game. |
| ui11.js:37 | Optional extra from your location. Choose an option, or skip it. | An optional extra. Pick an option, or skip. |
| ui11.js:38 | Lore buys stronger Site of Power cards. Keep it if nothing fits. | Lore buys Site of Power cards. Keep it if nothing fits. |
| ui11.js:34 | Optional: Govern or Journey with a card. Tap Powers to look, or Done to skip. | Optional: Govern or Journey. Tap Powers to look, or Done to skip. |
| ui11.js:26 | Tap a card to bid it, then tap the glowing spot. The highest bid picks first. | Tap a card, then the glowing spot. High bid picks first. |
| ui11.js:27 | Tap a glowing Kingdom Card for a lasting power. Or tap Keep my card. | Tap a glowing Kingdom Card to keep, or tap Keep my card. |
| ui11.js:28 | Pick the hand card that sits under your new Kingdom Card. It cannot fight. | Pick a card to go under your Kingdom Card. It cannot fight. |
| ui11.js:29 | Tap a glowing location. Your Herald pays off only if you win that region. | Tap a glowing location. Your Herald pays if you win there. |
| ui11.js:30 | Tap a card, then tap a region. It stays hidden until the Clash. | Tap a card, then a region. It stays hidden until the Clash. |
| ui11.js:31 | Add one more hidden card to break it, or tap Pass. | Add one more hidden card, or tap Pass. |
| ui11.js:32 | Tap a region to send a Supporter: +1 Strength in its first Clash. Then tap Done. | Tap a region to send a Supporter (+1 Strength). Then tap Done. |
| ui11.js:33 | The cards are face up. Highest total Strength wins. Tap Done to fight. | Cards are face up. Highest total wins. Tap Done. |
| ui11.js:36 | You won! Tap one of the two locations to claim its Influence. | You won! Tap a location to claim its Influence. |

Lines fixed: 137
