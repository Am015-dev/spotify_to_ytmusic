# Hollowbough: copy fixes

Goal card: ok (one plain sentence `Have the most points when everyone has passed.` plus 3 short bullets). Two bullets get light edits (rows 1-2).

| # | file:line | old line | new line |
|---|---|---|---|
| 1 | src/ui13.js:144 | Point tokens, flags (events) you claim and bonus cards add more. | Point tokens, claimed events and bonus cards add more. |
| 2 | src/ui13.js:144 | Pass when your workers are used up: the highest total wins. | Pass when you are done. The highest total wins. |
| 3 | src/story.js:9 | The thaw is here and the Elderheart Oak needs a steward. Most points when both pass wins it. Scores sit up here. | The Elderheart Oak needs a steward. Most points wins it. Scores sit up here. |
| 4 | src/story.js:10 | The woods are generous. Every place gives goods or cards, and each turn you send one worker to one place. | Each turn, send one worker to one place. Places give goods or cards. |
| 5 | src/story.js:13 |  raced to the Pebble Bank. A place without the Shared mark holds one worker only. |  took the Pebble Bank. A place without the Shared mark holds one worker. |
| 6 | src/story.js:15 | Bramble is already hammering. These cards are your plans: each shows its price, and glowing ones you can afford. | These cards are your plans. Each shows its price. Glowing ones are affordable. |
| 7 | src/story.js:16 | Raise the Allotment: pay 2 twigs and 1 resin. It will feed you every spring. | Build the Allotment: pay 2 twigs and 1 resin. It feeds you every spring. |
| 8 | src/story.js:17 | Buildings live here, ' + n + ' of 15: that is the limit. The Allotment already gave a berry. | Buildings live here: ' + n + ' of 15 at most. The Allotment gave a berry. |
| 9 | src/story.js:18 | Every worker is out. Prepare: they come home, you gain one, and the Allotment grows a berry. | All workers are out. Tap Prepare. They come home and you gain one. |
| 10 | src/story.js:19 | Spring: ' + w + ' workers, ' + b + ' berries. Seasons run Winter, Spring, Summer, Autumn. Chapter 2 done! | Spring: ' + w + ' workers, ' + b + ' berries. Seasons go Winter, Spring, Summer, Autumn. |
| 11 | src/story.js:20 | Even rivals share. Shared places take many workers: send one to the Berry Patch. | Shared places take many workers. Send one to the Berry Patch. |
| 12 | src/story.js:21 | The meadow is open to everyone. Critters cost berries: buy the Toad. | Anyone can buy from the meadow. Critters cost berries. Buy the Toad. |
| 13 | src/story.js:22 | A critter moves into its matching building free. The Goodwife loves your Allotment. | A critter moves into its matching building free. The Goodwife fits your Allotment. |
| 14 | src/story.js:23 | Three red buildings earn a flag. Send a worker to the glowing flag: three points. | Three red buildings earn a flag. Send a worker to it for three points. |
| 15 | src/story.js:24 | The forest pays more. Send your last worker to Bumper Bramble for berries. | The forest pays more. Send your last worker to Bumper Bramble. |
| 16 | src/story.js:25 | Summer would bring more hands, but our tale is short. Pass now: tap Pass twice to end the season. | This lesson ends here. Tap Pass twice to finish. |
| 17 | src/story.js:26 | Cards ' + s.cards + ', tokens ' + s.tokens + ', events ' + s.events + '. You score ' + s.total + '. Every point is a home. | Cards ' + s.cards + ', tokens ' + s.tokens + ', events ' + s.events + '. You score ' + s.total + '. |
| 18 | src/story.js:27 |  scores ' + t + ' the same way. Passing early leaves workers unused. |  scores ' + t + ' the same way. Passing early wastes workers. |
| 19 | src/story.js:28 | The Oak bows to you, ' + a + ' to ' + b + '. A real game plays all four seasons. | You win the Oak, ' + a + ' to ' + b + '. A real game has all four seasons. |
| 20 | src/story.js:28 | The Oak picks the higher total. A real game plays all four seasons. | The higher total wins the Oak. A real game has all four seasons. |
| 21 | src/story.js:31 | Hazel nods: workers, goods, cards, events, seasons, scoring. The Oak is yours to keep. | Hazel nods. You know workers, goods, cards, events, seasons and scoring. |
| 22 | src/story.js:32 | Hazel: A fresh thaw. Build the finest city before winter. | Hazel: Build the best city before winter. |
| 23 | src/story.js:32 | Hazel: The Oak has a new steward! | Hazel: You are the new steward! |
| 24 | src/story.js:32 | Hazel: Not this year. The Oak waits for next thaw. | Hazel: Not this year. Try again next thaw. |
| 25 | src/ui12.js:153 | The thaw is here and the Elderheart Oak needs a steward. Most points when we have both passed wins it. Start anywhere: the Twig Heap is a safe first pick. | The Elderheart Oak needs a steward. Most points wins. Start with the Twig Heap. |
| 26 | src/ui12.js:154 | Each turn you send one worker to one place. Basic places give goods, the forest gives more, and cards are bought from the meadow. | Each turn, send one worker to one place. Basic places give goods. The forest gives more. |
| 27 | src/ui12.js:155 | Twigs, resin, pebbles and berries pay for buildings and critters. You hold  | Twigs, resin, pebbles and berries pay for cards. You hold  |
| 28 | src/ui12.js:156 |  sent a worker. A place without the Shared mark holds one worker only, so it is closed to you this season. |  sent a worker. A place without the Shared mark holds one worker. It is closed to you. |
| 29 | src/ui12.js:157 | Your hand holds plans: each shows its price, glowing ones you can afford. Build one by paying its price. Your city holds 15 buildings and your hand 8 cards. | Your hand holds plans. Glowing ones are affordable. Pay the price to build. City holds 15, hand holds 8. |
| 30 | src/ui12.js:157 | Hand limit 8, city limit 15; glowing cards are affordable. | Hand holds 8, city holds 15. Glowing cards are affordable. |
| 31 | src/ui12.js:158 | A building! It stays in your city. Production buildings pay again every season. | A building! It stays in your city. Production cards pay again each season. |
| 32 | src/ui12.js:158 | Buildings stay in your city; production pays each season. | Buildings stay in your city. Production pays each season. |
| 33 | src/ui12.js:159 | The Goodwife loves your Allotment: a critter moves into its matching building for free. Try her from your hand. | The Goodwife fits your Allotment. She moves in free. Play her from your hand. |
| 34 | src/ui12.js:160 | The meadow is open to everyone. Critters cost berries; bought cards join your hand and the meadow refills. | Anyone can buy from the meadow. Critters cost berries. The meadow refills. |
| 35 | src/ui12.js:160 | The meadow of 8 is open to everyone; critters cost berries. | The meadow holds 8 cards for anyone. Critters cost berries. |
| 36 | src/ui12.js:161 | Flags are events: the first to hold the right buildings claims one for three points. Only one claimer, so be quick. | Flags are events. Build what one needs, then claim it for three points. Only one player can. |
| 37 | src/ui12.js:161 | Events: right buildings, first to claim, 3 points. | Events: build what they need, claim first, 3 points. |
| 38 | src/ui12.js:162 | Every worker is out. Prepare for Season: they all come home, you gain one more, and production pays. | All workers are out. Prepare: they come home, you gain one, production pays. |
| 39 | src/ui12.js:162 | Prepare for Season: workers home, +1 worker, production. | Prepare: workers come home, +1 worker, production pays. |
| 40 | src/ui12.js:163 | A new season! Seasons run Winter, Spring, Summer, Autumn. You have ' + p.workers + ' workers now. Summer draws cards, Autumn brings bonus workers. | A new season! You have ' + p.workers + ' workers. Summer draws cards. Autumn brings extra workers. |
| 41 | src/ui12.js:163 | Seasons: Winter, Spring, Summer (draw), Autumn (bonus workers). | Seasons: Winter, Spring, Summer (draw cards), Autumn (extra workers). |
| 42 | src/ui12.js:164 | Shared places take many workers: even rivals share the Berry Patch. | Shared places take many workers. Rivals share the Berry Patch. |
| 43 | src/ui12.js:165 | The forest pays more goods than the basic places, but each spot holds one worker. | The forest pays more goods. Each spot holds one worker. |
| 44 | src/ui12.js:166 | When you are done, Pass. The game ends when everyone has passed, and workers left unused are wasted points. | When you are done, Pass. The game ends when all have passed. Unused workers are wasted. |
| 45 | src/ui12.js:166 | Pass ends your game; unused workers are wasted. | Pass ends your game. Unused workers are wasted. |
| 46 | src/ui12.js:171 | The Inn and Post Office are open places: you play the rival\'s open card and they get a point. | The Inn and Post Office are open. You play a rival\'s open card. They get a point. |
| 47 | src/ui12.js:172 | The Haven turns two discarded cards into one good. | The Haven turns two discarded cards into one resource. |
| 48 | src/ui12.js:173 | The Long Road is a journey for Autumn only. | The Long Road opens in Autumn only. |
| 49 | src/ui12.js:174 | Special events need particular buildings and cost goods. | Special events need certain buildings and cost goods. |
| 50 | src/ui12.js:175 | Tie-break: most events, then most leftover goods. | Ties go to most events, then most leftover goods. |
| 51 | src/ui12.js:193 | Careful: your hand is full at 8. Extra cards are lost, so build or play one soon. | Careful: your hand is full at 8. Extra cards are lost. Play one soon. |
| 52 | src/ui12.js:194 | Poor: that worker brought nothing new. Check what glows before you send one. | That worker gained nothing. Check what glows before you send one. |
| 53 | src/ui12.js:190 | Poor: you passed with  | You passed with  |
| 54 | src/ui12.js:190 |  still home. Each one was a free action lost. |  still home. Each was a lost action. |
| 55 | src/ui12.js:190 | Good: every worker worked before you passed. Nothing wasted. | Good: every worker was used before you passed. |
| 56 | src/ui12.js:207 |  the same way. The higher total wins; a tie goes to most events, then most leftover goods. |  the same way. The higher total wins. Ties go to most events. |
| 57 | src/ui12.js:212 | A full first tale! Let us pass here and count the Oak\'s points. A real game plays on until you choose to pass. | Nice first game! Let us pass here and count points. Real games run longer. |
| 58 | src/ui12.js:192 | Good: +' + (snap.pts - b.pts) + ' points in one move. Races for events and big cards pay best. | Good: +' + (snap.pts - b.pts) + ' points in one move. Events and big cards pay best. |
| 59 | src/ui12.js:195 | Good: ' + (snap.res - b.res) + ' goods in one go. Goods turn into buildings. | Good: ' + (snap.res - b.res) + ' goods at once. Goods pay for buildings. |
| 60 | src/ui11.js:20 | Tap a glowing spot to send a worker there. Or tap a glowing card to play it. | Tap a glowing spot to send a worker. Or tap a glowing card to play it. |
| 61 | src/ui11.js:21 | All workers are out. Tap Prepare: they come home and you gain more. | All workers are out. Tap Prepare. They come home and you gain more. |
| 62 | src/ui11.js:22 | Play a card if you can. Otherwise tap Pass twice: your city still scores. | Play a card if you can. Otherwise tap Pass twice. Your city still scores. |
| 63 | src/ui11.js:31 | Build the best woodland city. When everyone has passed, the highest total of points wins. | Build the best city. When everyone has passed, the highest total wins. |
| 64 | src/ui11.js:32 | Place a worker, play a card, or Prepare for the next season. Then the next player goes. | Place a worker, play a card, or Prepare. Then the next player goes. |
| 65 | src/ui11.js:33 | Tap a glowing spot. Your worker goes there and its effect happens at once. | Tap a glowing spot. Your worker goes there and you get its reward. |
| 66 | src/ui11.js:34 | Tap a glowing card in your hand or the meadow, then pay its price in resources. | Tap a glowing card in your hand or the meadow. Then pay its price. |
| 67 | src/ui11.js:35 | Most spots hold only one worker, so good ones go fast. Spots marked Shared hold more. | Most spots hold one worker, so good ones go fast. Shared spots hold more. |
| 68 | src/ui11.js:36 | Flags and stars are events: claim one when your city meets its need. The Long Road opens in Autumn. | Flags and stars are events. Claim one when your city fits it. The Long Road opens in Autumn. |
| 69 | src/ui11.js:37 | When all your workers are out, tap Prepare. They come home and you gain more workers. | When all workers are out, tap Prepare. They come home and you gain more. |
| 70 | src/ui11.js:38 | In Spring and Autumn every green Production card in your city gathers goods again. | In Spring and Autumn, each green Production card pays again. |
| 71 | src/ui11.js:39 | Each player moves through Winter, Spring, Summer and Autumn at their own pace. | Each player goes through Winter, Spring, Summer and Autumn alone. |
| 72 | src/ui11.js:40 | When you have no workers or plays left, tap Pass twice. You take no more turns. | With nothing left to do, tap Pass twice. You take no more turns. |
| 73 | src/ui11.js:41 | When everyone has passed, your cards, point tokens, events and Long Road workers are scored. | When all have passed, cards, tokens, events and Long Road workers score. |
| 74 | src/ui11.js:42 | The highest total wins. A tie goes to the player with more events claimed. | The highest total wins. A tie goes to the player with more events. |
| 75 | src/ui11.js:43 | This card or spot can be used in more than one way. Tap the option you want. | This can be used in more than one way. Tap the option you want. |
| 76 | src/ui11.js:44 | Pay the price, or play a critter free into its matching building when that building is open. | Pay the price. Or play a critter free into its open matching building. |
| 77 | src/ui11.js:45 | Some cards you own make a play cheaper. They show up as extra buttons. | Some of your cards make a play cheaper. They show as extra buttons. |
| 78 | src/ui11.js:47 | The power needs a card. Tap one that glows: it may be in your hand, the meadow or your city. | Tap a glowing card. It may be in your hand, the meadow or your city. |
| 79 | src/ui11.js:49 | A power asks for a resource. Tap one of the icons in the row below the board. | Tap a resource icon in the row below the board. |
| 80 | src/ui11.js:50 | Twigs, resin, pebbles and berries pay for cards. The row under your city shows your stock. | Twigs, resin, pebbles and berries pay for cards. The row under your city shows what you hold. |
| 81 | src/ui11.js:53 | The power gives you options. Tap the one you want in the row below the board. | Tap the option you want in the row below the board. |
| 82 | src/ui11.js:54 | Each button says what it does. Pick the one that helps your city most. | Each button says what it does. Pick the one that helps most. |
| 83 | src/ui11.js:87 | : you use its power, its owner gets a point token. | : you use its power. Its owner gets a point token. |
| 84 | src/ui11.js:85 | The Long Road: discard cards, and this worker stays and scores  | The Long Road: discard cards. This worker stays and scores  |
| 85 | src/ui11.js:84 | Barter Burrow turns spare cards into resources: 1 for every 2. | Barter Burrow turns 2 spare cards into 1 resource. |
| 86 | src/ui11.js:86 | Your city meets this event: claim it for  | Your city fits this event. Claim it for  |
| 87 | src/ui13.js:186 | All your workers are out, so only a card, Prepare or Pass is left. | All workers are out. You can play a card, Prepare or Pass. |
| 88 | src/ui13.js:186 | You passed, so you are done for the game. | You passed. You take no more turns. |
| 89 | src/ui2.js:164 | Autumn only. Discard 5, 4, 3 or 2 cards from your hand; that worker stays for the rest of the game and scores the same number of points. | Autumn only. Discard 5, 4, 3 or 2 cards. The worker stays and scores that many points. |
| 90 | src/ui2.js:474 | Tap the effect to resolve first. | Tap the effect to use first. |
| 91 | src/ui2.js:474 | Tap a card to activate next. | Tap a card to use next. |
| 92 | src/engine.js:698 | Choose which triggered effect to resolve first | Pick which effect to use first |
| 93 | src/engine.js:804 | Choose the card to keep; the other goes to a rival | Pick a card to keep. The other goes to a rival |
| 94 | src/engine.js:1027 | Spend a token to repeat a location before recalling workers? | Spend a token to repeat a place before workers come home? |
| 95 | src/engine.js:58 | The discard pile is shuffled into a new deck. | The discard pile becomes a new deck. |
| 96 | src/engine.js:495 |  sets out on the Long Road ( |   takes the Long Road ( |
| 97 | src/engine.js:811 |  draws two cards, keeps one and hands one away. |  draws two cards, keeps one and gives one away. |
| 98 | src/engine.js:881 |  adds a point token to the shrine ( |  adds a point token to the Shrine ( |
| 99 | src/engine.js:938 |  achieves  |  claims  |
| 100 | src/ui5.js:146 | Tie-breaks (events, then leftover resources) could not separate them. | Still tied after events and leftover resources. |
| 101 | src/ui6.js:23 |  plays a card from the meadow chosen by a die every turn. His city: |  picks a meadow card with a die each turn. His city: |
| 102 | src/ui6.js:30 | tokens earned on cards and places | tokens from cards and places |
| 103 | src/ui6.js:30 | workers sent on the Long Road | workers on the Long Road |
| 104 | src/ui6.js:30 | the points printed on your buildings and critters | points printed on your buildings and critters |
| 105 | src/ui6.js:4 | The banner says whose turn it is; the line at the top says what to do. | The banner shows whose turn it is. The top line says what to do. |
| 106 | src/ui6.js:4 | Tap a glowing place to send a worker, or a glowing card to build it. | Tap a glowing place for a worker. Tap a glowing card to build it. |
| 107 | src/ui6.js:4 | The move plays out step by step, then the points or goods pop up. | The move plays out, then your points or goods show. |
| 108 | src/ui6.js:4 | The rivals play the same way, one step at a time. | Rivals play the same way. |
| 109 | src/ui6.js:4 | When all workers are out, Prepare for the next season. When done, Pass. | When all workers are out, Prepare. When you are done, Pass. |
| 110 | src/ui6.js:5 | Build the best woodland city. Each player has a city of up to 15 cards and a few workers. When every player has passed, you add up points from cards, point tokens, bonuses, events and the Long Road. The highest total wins. | Build the best city. A city holds up to 15 cards. When all have passed, add up your points. Cards, tokens, bonuses, events and the Long Road all count. The highest total wins. |
| 111 | src/ui6.js:6 | On your turn do exactly <b>one</b> of these: | On your turn, do <b>one</b> of these: |
| 112 | src/ui6.js:6 | <b>Prepare for the next season</b> (only when all your workers are out). | <b>Prepare</b> (only when all your workers are out). |
| 113 | src/ui6.js:6 | When you cannot or do not want to do anything useful, <b>Pass</b>. You take no more turns, but your city still scores. | When you are done, <b>Pass</b>. You take no more turns. Your city still scores. |
| 114 | src/ui6.js:7 | <b>Brown places</b> give resources, cards or a point token. Some are shared, others take one worker only. | <b>Brown places</b> give resources, cards or a point token. Some are Shared. Others take one worker. |
| 115 | src/ui6.js:7 | <b>Forest places</b> (green) are special and take one worker (two players can share in a four-player game). | <b>Forest places</b> (green) take one worker. In a four-player game, two can share. |
| 116 | src/ui6.js:7 | <b>The Barter Burrow</b> turns spare cards into resources: 1 resource for every 2 cards you discard. | <b>The Barter Burrow</b> trades cards for resources. Discard 2 cards, get 1 resource. |
| 117 | src/ui6.js:7 | <b>The Long Road</b> opens in Autumn. Discard cards equal to the spot (5, 4, 3 or 2); the worker stays and scores that many points. | <b>The Long Road</b> opens in Autumn. Discard 5, 4, 3 or 2 cards. The worker stays and scores that many points. |
| 118 | src/ui6.js:7 | <b>Destinations</b> are red cards in your city. A worker on one uses its power. A few are Open, so rivals may visit them too (the owner gets a point token). | <b>Destinations</b> are red cards in your city. A worker there uses the card. Open ones can be visited by rivals. The owner gets a point token. |
| 119 | src/ui6.js:7 | <b>Events</b> are claimed with a worker when your city meets their requirement. Each can be claimed only once. | <b>Events</b> need a worker and the right city. Each can be claimed once. |
| 120 | src/ui6.js:8 | Pay the price in resources: twigs, resin, pebbles and berries. You can play from the eight-card meadow as well as from your hand. Your hand holds 8 cards at most. A <b>unique</b> card can be in your city once; a common card as often as you like. | Pay the price in twigs, resin, pebbles and berries. Play from your hand or the eight-card meadow. Your hand holds 8 cards. A <b>unique</b> card can be in your city once. A common card can be in as often as you like. |
| 121 | src/ui6.js:8 | <b>Playing free:</b> each critter is paired with one building. If you own that building and it has no token, you can play the critter free and put a token on the building. Each building can do this once, ever. | <b>Playing free:</b> each critter has one matching building. If you own it and it has no token, play the critter free. Put a token on the building. Each building does this once. |
| 122 | src/ui6.js:8 | They are offered as extra buttons when you play a card. | They show as extra buttons when you play a card. |
| 123 | src/ui6.js:9 | Simplifications on purpose | Changes in this version |
| 124 | src/ui6.js:9 | The goods supply never runs out. | Resources never run out. |
| 125 | src/ui6.js:9 | Each destination card holds one worker (two for the cards with a permanent helper). | Each destination holds one worker. Cards with a permanent helper hold two. |
| 126 | src/ui6.js:9 | Solo: a tie with the bear counts as your loss. | Solo: a tie with the bear is a loss. |
| 127 | src/ui6.js:9 | A worker standing on a claimed event comes home like any other worker. | A worker on a claimed event comes home like the others. |
| 128 | src/ui6.js:9 | The cemetery reveals the top four cards of the discard pile. | The cemetery shows the top four cards of the discard pile. |
| 129 | src/ui6.js:9 | An empty deck is reshuffled from the discard automatically. | An empty deck is refilled from the discard pile. |
| 130 | src/ui6.js:10 | <b>Tan, Traveler:</b> acts once when played. | <b>Tan, Traveler:</b> works once when played. |
| 131 | src/ui6.js:10 | <b>Green, Production:</b> acts when played and again every Spring and Autumn. | <b>Green, Production:</b> works when played, then every Spring and Autumn. |
| 132 | src/ui6.js:10 | <b>Red, Destination:</b> a place for your workers. | <b>Red, Destination:</b> a place for workers. |
| 133 | src/ui6.js:10 | <b>Purple, Prosperity:</b> extra points at the end. | <b>Purple, Prosperity:</b> bonus points at the end. |
| 134 | src/ui6.js:11 | Everyone starts in Winter with 2 workers. Preparing for <b>Spring</b> gives +1 worker and runs your production. <b>Summer</b> gives +1 worker and lets you take 2 meadow cards. <b>Autumn</b> gives +2 workers and runs production again. Every player moves through the seasons at their own pace. | Everyone starts in Winter with 2 workers. <b>Spring</b> gives +1 worker and runs production. <b>Summer</b> gives +1 worker and 2 meadow cards. <b>Autumn</b> gives +2 workers and runs production again. Each player moves through seasons alone. |
| 135 | src/ui6.js:12 | Printed points on your cards, point tokens you hold, purple card bonuses, events and Long Road workers. Ties go to the player with more events, then more leftover resources. | Count printed card points, point tokens, purple bonuses, events and Long Road workers. Ties go to more events, then more leftover resources. |
| 136 | src/ui6.js:13 | You play against Old Grimbeard. He takes places and cards by dice and a fixed routine. You win if you end with strictly more points than he does. Choose Grumpy, Gruff or Ghastly for the difficulty. | You play Old Grimbeard. He picks places and cards by dice. You win with more points than he has. Pick Grumpy, Gruff or Ghastly. |
| 137 | src/ui6.js:14 | Build production early; it pays every Spring and Autumn. | Build production early. It pays every Spring and Autumn. |
| 138 | src/ui6.js:14 | Keep cards in hand cheap to play. Watch the meadow too. | Keep cheap cards in hand. Watch the meadow too. |
| 139 | src/ui6.js:14 | Tap the lightbulb any time to see a good move and the reason for it. | Tap the lightbulb for a good move and why. |
| 140 | src/ui8.js:32 | An original woodland city-building game. Names and texts are our own. Art and music by Am015-dev. | A woodland city-building game. Art and music by Am015-dev. |
| 141 | src/refdata.js:31 | Forest card: 3 are dealt in a 2-player game, 4 with 3 or 4 players. One worker (two in a 4-player game). | Forest card: 3 in a 2-player game, 4 with 3 or 4 players. One worker, or two in a 4-player game. |
| 142 | src/refdata.js:22 | Free with any construction that has an open slot | Free with any building that has an open slot |
| 143 | src/refdata.js:46 | Mark a construction whose free critter slot has been used. | Marks a building whose free critter slot is used. |
| 144 | src/data.js:3 | At the end of the game, score 1 point per resin and per pebble you still hold, to a maximum of 6. | End of game: 1 point per resin and pebble you hold, up to 6. |
| 145 | src/data.js:3 | Sing away up to 5 cards from your hand and take a point token for each. | Discard up to 5 cards from your hand. Take a point token for each. |
| 146 | src/data.js:3 | Gain 2 twigs for every Bramble Allotment in your city. | Gain 2 twigs for each Bramble Allotment in your city. |
| 147 | src/data.js:3 | Re-run one other production card in your own city. | Use one other production card in your city again. |
| 148 | src/data.js:3 | Plant this prankster in a rival village; it takes one of their spaces and costs them 2 points. | Put this prankster in a rival city. It takes a space and costs them 2 points. |
| 149 | src/data.js:3 | Whenever you play another card, draw 1 card afterwards. | Whenever you play another card, draw 1 card. |
| 150 | src/data.js:3 | When you play a Critter you may send this hedgehog away to cut 3 berries off its price. | When you play a Critter, send this hedgehog away to cut 3 berries off its price. |
| 151 | src/data.js:3 | When playing any card, pay one required resource with a different resource of your choice. | When you play a card, pay one resource with a different resource. |
| 152 | src/data.js:3 | Mimic any one production card in a rival village, as though it were theirs. | Copy one production card in a rival city. |
| 153 | src/data.js:3 | Swap up to 2 of your resources for any 2 resources from the supply. | Swap up to 2 of your resources for any 2 from the supply. |
| 154 | src/data.js:3 | Reveal 2 cards; you may play one worth up to 3 base points free; discard the other. | Reveal 2 cards. Play one worth up to 3 points free. Discard the other. |
| 155 | src/data.js:3 | Send a worker here to play any card worth up to 3 base points from hand or meadow without paying. | Send a worker here to play a card worth up to 3 points free, from hand or meadow. |
| 156 | src/data.js:3 | Relocate one of your deployed workers to another legal spot. Opens the second Thornhold cell. | Move one of your workers to another legal spot. Opens the second Thornhold cell. |
| 157 | src/data.js:3 | Gain 3 berries plus 1 point token per token on your Shrine. If bought with berries, they go to a rival. | Gain 3 berries plus 1 point token per token on your Shrine. Berries paid for it go to a rival. |
| 158 | src/data.js:3 | Clear 3 meadow cards, refill, then take 1 meadow card. Opens the second Grove plot. | Clear 3 meadow cards and refill. Then take 1 meadow card. Opens the second Grove plot. |
| 159 | src/data.js:3 | A worker settles here forever; reveal 4 cards from deck or discard pile and play one free, discarding the rest. | A worker stays here for good. Reveal 4 cards from the deck or discard pile. Play one free. Discard the rest. |
| 160 | src/data.js:3 | Place 3 tokens here when built. Before recalling workers each season, spend one to repeat a basic or forest spot you occupy. Leftover tokens score. | Place 3 tokens here when built. Each season, before workers come home, spend one to repeat a basic or forest spot you hold. Leftover tokens score. |
| 161 | src/data.js:3 | When building a Construction, dismantle this lift to cut 3 resources of your choice off the price. | When you build, remove this lift to cut 3 resources off the price. |
| 162 | src/data.js:3 | Lock one of your Critters beneath this card to cut 3 resources off the price of a card. Opens a second cell with a Trailwarden. | Lock one of your Critters under this card to cut a card's price by 3. Opens a second cell with a Trailwarden. |
| 163 | src/data.js:3 | Send a worker to play a meadow card for 3 fewer resources. Rivals may visit too and pay you 1 point. | Send a worker to play a meadow card for 3 fewer resources. Rivals may visit and pay you 1 point. |
| 164 | src/data.js:3 | A worker settles here forever: give 2 resources to a rival and take 4 point tokens. | A worker stays here for good. Give a rival 2 resources and take 4 point tokens. |
| 165 | src/data.js:3 | Give a rival 2 cards, discard any others you like, then refill your hand from the deck. Visitors pay you 1 point. | Give a rival 2 cards. Discard any others, then refill your hand. Visitors pay you 1 point. |
| 166 | src/data.js:3 | Raze one of your constructions, build here in its place, regain its exact cost, and draw 2 cards. | Tear down one of your buildings and build here instead. Get its exact cost back. Draw 2 cards. |
| 167 | src/data.js:3 | Each production adds a stack (3 twigs, 2 resin, 1 pebble or 2 berries) to this card; send a worker to haul it all away. | Each production adds a stack here: 3 twigs, 2 resin, 1 pebble or 2 berries. Send a worker to take it all. |
| 168 | src/data.js:3 | Disband one of your cards, regain its exact cost, plus any 1 resource and 1 point. | Remove one of your cards. Get its exact cost back, plus 1 resource and 1 point. |
| 169 | src/data.js:3 | Discard any number of cards, then draw 2 for each one discarded (limit 8). | Discard any number of cards. Draw 2 for each one (hand limit 8). |
| 170 | src/data.js:3 | Take 2 meadow cards; you may immediately play one of them for 1 fewer resource. | Take 2 meadow cards. You may play one now for 1 fewer resource. |
| 171 | src/data.js:3 | Discard any number of cards from your hand; gain 1 resource of your choice for every 2 discarded. Shared. | Discard any cards from your hand. Gain 1 resource for every 2 discarded. Shared. |
| 172 | src/data.js:3 | Hand up to 3 resources to rivals and take 2 point tokens for each, immediately. | Give rivals up to 3 resources. Take 2 point tokens for each, now. |
| 173 | src/data.js:3 | Return one of your deployed workers to hand at once. Worth 4 points. | Take one of your workers back now. Worth 4 points. |
| 174 | src/data.js:3 | Reveal 5 cards; keep any in hand or tuck any under this event (1 point each at the end). | Reveal 5 cards. Keep any in hand, or tuck any under this event for 1 point each at the end. |
| 175 | src/data.js:3 | Worth 3 points for every Goodman Vole and Goodwife Vole pair in every city, yours and rivals. | Worth 3 points for each Goodman Vole and Goodwife Vole pair in any city. |
| 176 | src/data.js:3 | Immediately draw 1 card and gain 1 resource per token on your Shrine; also 2 points per token at game end. | Draw 1 card now. Gain 1 resource per token on your Shrine. Also 2 points per token at game end. |
| 177 | src/data.js:3 | Stack up to 3 of your resources here; berry/twig = 1 point, resin/pebble = 2 points each at the end. | Stack up to 3 of your resources here. At the end, berry or twig is 1 point, resin or pebble is 2. |
| 178 | src/data.js:3 | Requires at least 2 cards of each of the five colors in your city. Worth 9 points. | Needs 2 cards of each of the five colours in your city. Worth 9 points. |
| 179 | campaign.json chapters c1 intro | Welcome to Hollowbough. The snow is melting and the valley needs a new city. | Welcome to Hollowbough. The snow is melting. The valley needs a new city. |
| 180 | campaign.json chapters c1 intro | On your turn, place a worker on a spot to gather twigs, resin, berries or pebbles. | On your turn, put a worker on a spot to gather twigs, resin, berries or pebbles. |
| 181 | campaign.json chapters c1 intro | I'm Bramble! I'll build next door. Don't worry, I mostly grab whatever's shiny. | I'm Bramble! I'll build next door. I mostly grab whatever is shiny. |
| 182 | campaign.json chapters c2 intro | Look for the little link on each card. A free card is a whole turn of gathering saved. | Look for the little link on each card. A free card saves a whole turn. |
| 183 | campaign.json chapters c3 intro | Plant them early and Prepare for Season will fill your larder for you. | Build them early. Prepare will fill your larder. |
| 184 | campaign.json chapters c4 intro | He follows a fixed routine and rolls for meadow cards. Beat his total by even 1 point. | He rolls dice for meadow cards. Beat his total by even 1 point. |
| 185 | campaign.json chapters c7 intro | Thistle builds big and scores at the end. Close off the events before her city fills. | Thistle builds big and scores late. Claim the events before her city fills. |
| 186 | campaign.json chapters c9 intro | Each special event nobody claims is worth 6 points to him now. Claim them first. | He now scores 6 points for each special event nobody claims. Claim them first. |
| 187 | campaign.json chapters c10 intro | Thistle starts with a stocked pantry. Two hard rivals, one meadow. Build fast and claim early. | Thistle starts with a full pantry. Two hard rivals, one meadow. Build fast. |
| 188 | campaign.json chapters c2 goal | Win with at least 2 critters moved in for free. | Win with 2 critters moved in free. |
| 189 | campaign.json chapters c3 goal | Win with at least 3 green Production cards in your city. | Win with 3 green Production cards in your city. |
| 190 | campaign.json chapters c4 goal | Beat Old Grimbeard on Grumpy by at least 1 point. | Beat Old Grimbeard on Grumpy by 1 point or more. |
| 191 | campaign.json chapters c6 goal | Win and claim at least 2 events. | Win and claim 2 events. |
| 192 | campaign.json chapters c7 goal | Win with at least 40 points. | Win with 40 points or more. |
| 193 | campaign.json chapters c9 goal | Beat Old Grimbeard on Gruff by at least 1 point. | Beat Old Grimbeard on Gruff by 1 point or more. |

ROWS: 193
