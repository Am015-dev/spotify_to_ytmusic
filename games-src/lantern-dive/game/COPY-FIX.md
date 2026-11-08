# Lantern Dive copy fixes

Goal card verdict: rewritten (Rules "The goal" ran four sentences with no scoring bullets; GOAL row below. The help-card goal at ui11 is shortened to match).

| # | file:line | old line | new line |
|---|---|---|---|
| GOAL 1 | src/ui5.js:8 | You are a team of divers on a deep-sea expedition. Each dive lays out job cards. Every job is a condition on the tricks one diver wins. You win the dive together when every job is done, and you lose it together the moment one job cannot be done. Nobody may talk about their cards: you can only use the ping signal. | Finish every job card to win the dive together.<br>- Each job belongs to one diver.<br>- A job is met by the tricks that diver wins.<br>- One broken job ends the attempt. |
| 2 | src/ui5.js:8 | Nobody may talk about their cards: you can only use the ping signal. | Do not talk about your cards. Use pings instead. |
| 3 | src/ui11.js:45 | The whole crew wins or loses together. Finish every job card and the dive is won. | Finish every job card to win the dive together. |
| 4 | src/data.js:23 | Win more tricks than all the other divers put together. | Win more tricks than all other divers together. |
| 5 | src/data.js:28 | Win a trick in which every card is lower than 7 (no Lanterns). | Win a trick where every card is below 7. No Lanterns. |
| 6 | src/data.js:29 | Win a trick in which every card is higher than 5. | Win a trick where every card is above 5. |
| 7 | src/data.js:33 | Win a 5 by playing a 7. | Win a 5 using your 7. |
| 8 | src/data.js:34 | Win an 8 by playing a 4. | Win an 8 using your 4. |
| 9 | src/data.js:35 | Win a 6 by playing another 6. | Win a 6 using your own 6. |
| 10 | src/data.js:65 | Win at least one card of each colour (Lanterns do not count). | Win a card of every colour. Lanterns do not count. |
| 11 | src/data.js:67 | Win a trick that holds only even numbers (2, 4, 6, 8). | Win a trick with only even numbers (2, 4, 6, 8). |
| 12 | src/data.js:68 | Win a trick that holds only odd numbers (1, 3, 5, 7, 9). | Win a trick with only odd numbers (1, 3, 5, 7, 9). |
| 13 | src/data.js:69 | Win a trick worth more than 23 / 28 / 31 (3 / 4 / 5 divers), no Lanterns. | Win a trick over 23 (3 divers), 28 (4) or 31 (5). No Lanterns. |
| 14 | src/data.js:70 | Win a trick worth less than 8 / 12 / 16 (3 / 4 / 5 divers), no Lanterns. | Win a trick under 8 (3 divers), 12 (4) or 16 (5). No Lanterns. |
| 15 | src/data.js:71 | Win a trick whose card values add up to 22 or 23 (no Lanterns in it). | Win a trick that adds up to 22 or 23. No Lanterns. |
| 16 | src/data.js:79 | Win the Coral 7 using a Lantern. | Win the Coral 7 with a Lantern. |
| 17 | src/data.js:80 | Win the Kelp 9 using a Lantern. | Win the Kelp 9 with a Lantern. |
| 18 | src/data.js:109 | Win exactly three tricks, one straight after the other. | Win exactly three tricks, all in a row. |
| 19 | src/data.js:110 | Win exactly two tricks, one straight after the other. | Win exactly two tricks, in a row. |
| 20 | src/data.js:111 | Predict your exact number of tricks, out loud for everybody to see. | Say how many tricks you will win. Win exactly that many. |
| 21 | src/data.js:112 | Predict your exact number of tricks and keep the number secret. | Pick a secret number of tricks. Win exactly that many. |
| 22 | src/data.js:113 | Win as many Coral cards as Sunstar cards (at least one of each). | Win equal Coral and Sunstar cards. At least one of each. |
| 23 | src/data.js:114 | Win a trick holding as many Kelp as Sunstar cards (at least one each). | Win a trick with equal Kelp and Sunstar cards. At least one each. |
| 24 | src/data.js:115 | Win a trick holding as many Coral as Tide cards (at least one each). | Win a trick with equal Coral and Tide cards. At least one each. |
| 25 | src/data.js:116 | Win more Sunstar cards than Tide cards (no Tide at all is fine). | Win more Sunstar than Tide cards. Zero Tide is fine. |
| 26 | src/data.js:117 | Win more Coral cards than Kelp cards (no Kelp at all is fine). | Win more Coral than Kelp cards. Zero Kelp is fine. |
| 27 | src/data.js:121 | 'Rich trick' | 'High-total trick' |
| 28 | src/data.js:121 | 'Poor trick' | 'Low-total trick' |
| 29 | src/data.js:131 | Training day in the bay. One small job, then the logbook is yours. | Training day. One small job, then you are logged. |
| 30 | src/data.js:132 | Two stone tablets came up in a fishing net. The team dives to find where they came from. | Two stone tablets came up in a net. Find where they came from. |
| 31 | src/data.js:133 | A base waits on the sea floor. Learn its three life systems before you move in. | A base sits on the sea floor. Check its three life systems. |
| 32 | src/data.js:134 | You pilot the little submersible down yourselves. Everybody else watches the dark rise past the windows. | You pilot the submersible down yourselves. |
| 33 | src/data.js:135 | Walk the five chambers of the base and report that every system hums. | Check all five chambers of the base. |
| 34 | src/data.js:136 | The whole team agrees, without a word about cards, which one diver takes every job. | Agree on one diver to take every job. Do not talk about cards. |
| 35 | src/data.js:136 | A porthole was opened too early. Somebody has to fix it, and fast. | A porthole opened too early. Fix it fast. |
| 36 | src/data.js:137 | First proper outing: test the suits and chart the ground around the base. | Your first real trip. Map the ground around the base. |
| 37 | src/data.js:138 | The pearl rations are disappearing. Time for a talk about sharing. | The pearls are running out. Share them fairly. |
| 38 | src/data.js:138 | No diver may ever have won two more 9s than any other diver. | No diver may ever hold two more 9s than another diver. |
| 39 | src/data.js:139 | Murky water: to signal, show a card as usual, but the ping token does not go on it. Put it beside the card, spent side up. | Murky water: show a card, but put the ping token beside it, spent side up. |
| 40 | src/data.js:139 | A centuries-old ship lies close by. Strong currents blur every message. | An old ship lies close by. Strong currents blur your signals. |
| 41 | src/data.js:140 | The Commander takes every job, or hands them all to a willing diver. If handed over, all signalling must happen before the first trick. | The Commander takes every job, or hands them all to a willing diver. If handed over, signal before the first trick. |
| 42 | src/data.js:140 | Inside the wreck: a tablet covered in carved signs, snapped off at the bottom. | Inside the wreck is a carved tablet, broken at the bottom. |
| 43 | src/data.js:141 | Deep narcosis: there are two fewer ping tokens than divers and they sit in the middle. Anyone may take one at any time between tricks, silently, and signal at once. Several signals by one diver are allowed. | Deep narcosis: ping tokens sit in the middle, two fewer than divers. Anyone may take one between tricks and signal at once. One diver may signal many times. |
| 44 | src/data.js:141 | The base answered. Nobody is surprised but you. You move the talk to a secure channel. | The base answered. Only you are surprised. Switch to a private channel. |
| 45 | src/data.js:142 | No trick may be led with a Coral card or a Lantern. | Never lead a trick with Coral or a Lantern. |
| 46 | src/data.js:142 | The tablet is fragile. Handle it with extreme care, and never start the cutting with the loud tools. | The tablet is fragile. Work slowly and quietly. |
| 47 | src/data.js:143 | The carvings describe a coast that does not exist here. Draw up a plan to survey the water. | The carvings show a coast that is not here. Plan a survey. |
| 48 | src/data.js:144 | One volunteer takes all the jobs. Beat the clock (3:30), or play without a clock and use murky water. | One volunteer takes all jobs. Beat the 3:30 clock, or play with murky water and no clock. |
| 49 | src/data.js:144 | An alarm drill, at the worst possible moment. | An alarm drill at a bad moment. |
| 50 | src/data.js:145 | One volunteer takes all the jobs. Beat the clock (3:00), or play without a clock and use deep narcosis. | One volunteer takes all jobs. Beat the 3:00 clock, or play with deep narcosis and no clock. |
| 51 | src/data.js:145 | A swarm drifts into the base. One diver is stranded outside and a suit is torn. | Jellyfish drift into the base. One diver is stuck outside. |
| 52 | src/data.js:146 | One volunteer takes all the jobs. Beat the clock (2:30), or play without a clock and without any signalling. | One volunteer takes all jobs. Beat the 2:30 clock, or play with no signals and no clock. |
| 53 | src/data.js:146 | The injured diver needs care and the infirmary is flooding. Both at once. | An injured diver needs care. The infirmary is flooding. |
| 54 | src/data.js:147 | Open briefing: talk freely about who takes which job, but never about your cards. One diver may take all jobs. | Open briefing: talk about who takes which job. Never talk about cards. One diver may take all jobs. |
| 55 | src/data.js:147 | The sculptures seem to be older than anything on record, and the team works as one. | The statues are older than any record. Work as one team. |
| 56 | src/data.js:148 | The way to the next chamber is close. Something about it feels wrong. | The next chamber is close. Something feels wrong. |
| 57 | src/data.js:149 | The Commander takes the most difficult job first. | The Commander takes the hardest job first. |
| 58 | src/data.js:149 | A drone found a maze of tunnels, some only one diver wide. | A drone found a maze of tunnels. Some fit only one diver. |
| 59 | src/data.js:150 | Unknown waters: before dealing, draw a colour card at random. 1-3: normal signalling, 4-6: murky water, 7-9: deep narcosis. No diver may ever have won two more 1s than any other diver. | Unknown waters: draw a colour card before dealing. 1-3 normal, 4-6 murky water, 7-9 deep narcosis. No diver may ever hold two more 1s than another diver. |
| 60 | src/data.js:150 | The tunnels fork again and again, and the radio keeps dropping out. | The tunnels keep forking. The radio keeps cutting out. |
| 61 | src/data.js:151 | Unknown waters: draw a colour card first (1-3 normal, 4-6 murky, 7-9 deep narcosis). No diver may ever have won two more 1s than any other diver. | Unknown waters: draw a colour card first. 1-3 normal, 4-6 murky, 7-9 deep narcosis. No diver may ever hold two more 1s than another diver. |
| 62 | src/data.js:151 | The base computer has finished its analysis. It has also given itself a name. | The base computer finished its scan. It has named itself. |
| 63 | src/data.js:152 | Rooms full of shelves, and not one of them was built by anybody you know. | Rooms full of shelves. Nobody you know built them. |
| 64 | src/data.js:153 | Unknown waters: draw a colour card first. No signalling until just before the second trick. The winner of the first trick must always have more tricks than any other diver. | Unknown waters: draw a colour card first. Signal just before trick 2. The first trick's winner must always have the most tricks. |
| 65 | src/data.js:153 | A dangerously narrow bend. Follow the leader and do not waste a breath. | A narrow, dangerous bend. Follow the leader. |
| 66 | src/data.js:154 | Not very deep any more, but it feels that way. Dinner is a paste in a tube. | Not deep now, but it feels deep. Dinner is paste in a tube. |
| 67 | src/data.js:155 | Unknown waters: draw a colour card first. The Commander never takes a job: skip the Commander each time round. | Unknown waters: draw a colour card first. The Commander takes no job. Skip them each round. |
| 68 | src/data.js:155 | Creatures flee from your lamps into the cracks. You are not wanted here. | Creatures flee your lamps into the cracks. |
| 69 | src/data.js:156 | Unknown waters: draw a colour card first. Two volunteers take all the jobs, at least one each. Beat the clock (5:00) at difficulty 10, or play without a clock at difficulty 12. | Unknown waters: draw a colour card first. Two volunteers take all jobs, one each at least. Beat the 5:00 clock at difficulty 10, or skip the clock at 12. |
| 70 | src/data.js:156 | A giant squid fills the tunnel behind you. Decoys, thrusters, everything! | A giant squid fills the tunnel behind you. Use everything you have! |
| 71 | src/data.js:157 | Unknown waters: draw a colour card first. The Sunstar 5 must be the very last card played in the final trick of the dive (with three divers it may not be the card left over). | Unknown waters: draw a colour card first. The Sunstar 5 must be the last card played in the final trick. With three divers, it may not be the card left over. |
| 72 | src/data.js:157 | Lights show a path through the weeds, and a yellow glow waits at the end. | Lights mark a path through the weeds. A yellow glow waits at the end. |
| 73 | src/data.js:158 | The sea floor looks paved. Somebody walked here, long ago. | The sea floor looks paved. Someone walked here long ago. |
| 74 | src/data.js:159 | There are things you would not write in the official report. | Some things stay out of the official report. |
| 75 | src/data.js:160 | Something terrible once happened in this place, and its shadow is still here. | Something terrible happened here long ago. |
| 76 | src/data.js:161 | Pictures of a great flood, scratched into the rock as a warning. | Carvings of a great flood warn of danger. |
| 77 | src/data.js:162 | The four jobs are fixed: no tricks at all; exactly three tricks in a row; two tricks in a row; the first and the last trick. Take them clockwise as usual. | The four jobs are fixed. Win no tricks. Win exactly three in a row. Win two in a row. Win the first and last trick. Take them clockwise. |
| 78 | src/data.js:162 | The light is fading. Concentrate. One mistake and the dark closes in. | The light is fading. One mistake ends it. |
| 79 | src/data.js:164 | After dive 32: start at difficulty 18 and raise it by one for every dive you complete. Open briefing every time. Attempts are no longer counted; only whether the distress flare was used. | After dive 32, start at difficulty 18. Raise it by one for each dive you win. Every dive is an open briefing. Attempts are not counted. Only the flare is logged. |
| 80 | src/data.js:167 | Nerea trained as a harbour pilot and counts everything twice: air, minutes, and the cards on the table. | Nerea was a harbour pilot. She counts air, minutes and cards twice. |
| 81 | src/data.js:167 | Choose Nerea if you like a careful teammate who plans the whole dive. | Pick Nerea for a careful teammate. She plans the whole dive. |
| 82 | src/data.js:168 | Bram fixes pumps for a living and trusts his hands more than maps. He plays his cards and hopes for the best. | Bram fixes pumps. He trusts his hands, plays his cards and hopes. |
| 83 | src/data.js:168 | Choose Bram if you like a steady teammate who rarely panics. | Pick Bram for a steady teammate. He rarely panics. |
| 84 | src/data.js:169 | Sumi studies deep-sea fish and signals the moment she sees something useful. She loves a good ping. | Sumi studies deep-sea fish. She pings as soon as she sees something useful. |
| 85 | src/data.js:169 | Choose Sumi if you like a teammate who talks with her tokens. | Pick Sumi for a teammate who pings a lot. |
| 86 | src/data.js:170 | Dag is new to diving and gets every job he can carry. He is learning, and he is cheerful about it. | Dag is new to diving. He takes every job he can and stays cheerful. |
| 87 | src/data.js:170 | Choose Dag if you want a relaxed first dive with room for mistakes. | Pick Dag for a relaxed first dive. |
| 88 | src/data.js:172 | Echo is the little drone that rides along on two-diver dives. Its cards lie face up in a double row; the Commander flies it. | Echo is a drone that joins two-diver dives. The Commander plays its cards. |
| 89 | src/ui11.js:46 | Each diver plays one card. The highest card of the colour led wins, unless a Lantern is played. | Each diver plays one card. The highest card of the led colour wins. A Lantern beats any colour. |
| 90 | src/ui11.js:47 | Each job card is a task for one diver. It is done by the tricks that diver wins. | Each job card belongs to one diver. That diver's tricks meet it. |
| 91 | src/ui11.js:48 | A job is done when it is met and can no longer fail. One broken job ends the dive. | A job is done when it is met and cannot fail. One broken job ends the attempt. |
| 92 | src/ui11.js:49 | The Commander holds Lantern 4 and picks first. Jobs marked with a crossed circle are not for them. | The Commander holds Lantern 4 and picks first. Jobs with a crossed circle are not for them. |
| 93 | src/ui11.js:50 | This dive lets the crew choose. The Commander may keep every job, or offer them to others. | The Commander may keep every job, or offer them to others. |
| 94 | src/ui11.js:51 | Yes means you take the jobs on. No leaves them for someone else. | Yes means you take the jobs. No leaves them for someone else. |
| 95 | src/ui11.js:53 | The team agrees on one diver to take every job. Tap your vote. You may vote for yourself. | Vote for the diver who takes every job. You may vote for yourself. |
| 96 | src/ui11.js:54 | You may talk about the plan, but never about which cards you hold. | Talk about the plan. Never talk about your cards. |
| 97 | src/ui11.js:55 | Optional, before signals: every diver passes one colour card to a neighbour. | Optional. Before signals, every diver passes one colour card to a neighbour. |
| 98 | src/ui11.js:56 | Everyone passes the same way. Lanterns can never be passed. | Everyone passes the same way. You cannot pass Lanterns. |
| 99 | src/ui11.js:57 | It costs a try | It costs an attempt |
| 100 | src/ui11.js:57 | In the logbook, lighting the flare counts as one extra attempt. Skipping it is fine. | The flare adds one attempt to the logbook. Skipping it is fine. |
| 101 | src/ui11.js:58 | Pick one colour card to pass to your neighbour. Lanterns cannot be passed. | Pick a colour card to pass to your neighbour. You cannot pass Lanterns. |
| 102 | src/ui11.js:59 | Give a card your neighbour's jobs need. Keep the cards your own jobs need. | Pass a card their jobs need. Keep the cards yours need. |
| 103 | src/ui11.js:60 | This job needs you to win exactly the number of tricks you predicted. | Win exactly the number of tricks you predicted. |
| 104 | src/ui11.js:61 | High cards and Lanterns win tricks. Few of them? Predict a low number. | High cards and Lanterns win tricks. Few of them? Predict low. |
| 105 | src/ui11.js:62 | Once per dive you may show one colour card to the crew. It stays in your hand. | Once per dive, show one colour card to the crew. It stays in your hand. |
| 106 | src/ui11.js:63 | You may show only your highest, lowest or only card of a colour. The token says which. | Show only your highest, lowest or only card of a colour. The token says which. |
| 107 | src/ui11.js:64 | Signals come between tricks, never in the middle of one. Lanterns can never be shown. | Signal between tricks only. You cannot show Lanterns. |
| 108 | src/ui11.js:65 | Lead any card. Its colour is the colour everyone else must follow if they can. | Lead any card. Everyone must follow its colour if they can. |
| 109 | src/ui11.js:67 | A Lantern beats every colour. With several Lanterns, the highest Lantern wins. | A Lantern beats every colour. The highest Lantern wins. |
| 110 | src/ui11.js:68 | Between tricks, once per dive, you may show your highest, lowest or only card of a colour. | Once per dive, between tricks, show your highest, lowest or only card of a colour. |
| 111 | src/ui11.js:69 | If you hold the colour that was led, you must play it. Dim cards are not allowed. | If you have the led colour, you must play it. Dim cards are blocked. |
| 112 | src/ui11.js:70 | The highest card of the led colour wins. Play low to let a teammate win. | Play low to let a teammate win. |
| 113 | src/ui11.js:72 | You may play any card. A different colour can never win the trick. | Play any card. Other colours never win. |
| 114 | src/ui11.js:73 | Play a Lantern and you win the trick, unless someone plays a higher Lantern. | A Lantern wins the trick, unless someone plays a higher Lantern. |
| 115 | src/ui11.js:74 | Play a card your jobs do not need. Keep what your jobs need for later. | Play a card your jobs do not need. Keep the ones they do. |
| 116 | src/ui11.js:75 | With two divers, a drone joins as an extra player. You play its cards for it. | With two divers, a drone joins. You play its cards. |
| 117 | src/ui11.js:76 | The drone follows the colour led like anyone else. Blocked cards are dimmed. | The drone must follow the led colour too. Blocked cards are dim. |
| 118 | src/ui11.js:32 | Answer with a button below. Each button says what happens next. | Tap a button below. Each one says what happens next. |
| 119 | src/ui11.js:33 | Tap the diver who should take every job. You may pick yourself. | Tap the diver who takes every job. You may pick yourself. |
| 120 | src/ui11.js:34 | Optional. Pass cards to a neighbour, or tap the skip button. | Optional. Pass cards to a neighbour, or skip. |
| 121 | src/ui11.js:35 | Tap a colour card to pass to your neighbour. Lanterns cannot go. | Tap a colour card to pass to your neighbour. No Lanterns. |
| 122 | src/ui11.js:36 | Tap how many tricks you will win. The job needs exactly that many. | Tap how many tricks you will win. You need exactly that many. |
| 123 | src/ui11.js:37 | Tap a ping spot to show one card, or tap No signal. | Tap a ping spot to show a card, or tap No signal. |
| 124 | src/ui11.js:39 | Play the colour that was led. Dim cards are blocked. Highest of that colour wins. | Play the led colour. Dim cards are blocked. |
| 125 | src/ui12.js:119 | Brack here. The bay nets are tangled. You, Dag and Sumi dive as one crew; each job is one diver\'s. | Brack here. The bay nets are tangled. You, Dag and Sumi are one crew. Each job is one diver's. |
| 126 | src/ui12.js:121 | Lantern 4 makes you Commander. Brack: "Captain\'s privilege. You pick first." | Lantern 4 makes you Commander. You pick a job first. |
| 127 | src/ui12.js:123 | Dag needs the nets cleared. Take the Lantern 3 job: you hold Lantern 3 and 4, so it\'s safe. | Take the Lantern 3 job. You hold Lantern 3 and 4, so it is safe. |
| 128 | src/ui12.js:125 | Dag grabs the first-trick job: "Don\'t you dare win it!" Both jobs must be done to win. | Dag takes the first-trick job. Do not win it! Both jobs must be done. |
| 129 | src/ui12.js:127 | The distress flare swaps cards after a lost try. Calm water today, so leave it. | The flare swaps cards after a failed attempt. Skip it today. |
| 130 | src/ui12.js:129 | No talking about cards down here. One silent ping per dive: show your Coral 9. | No card talk. You get one ping per dive. Show your Coral 9. |
| 131 | src/ui12.js:131 | Sumi pings her Kelp 9, her highest Kelp. Everyone pings once, between tricks. | Sumi pings her Kelp 9, her highest Kelp. Everyone pings once. |
| 132 | src/ui12.js:133 | The Commander leads and everyone must follow its colour. Lead your Coral 9. | You lead. Everyone must follow its colour. Lead your Coral 9. |
| 133 | src/ui12.js:135 | Coral was led, so the highest Coral takes it: your 9 beats | Coral was led, so the highest Coral wins. Your 9 beats |
| 134 | src/ui12.js:137 | Oh no, Dag needed that trick and you took it. One broken job sinks the dive. Dive again! | Oh no. Dag needed that trick, and you won it. One broken job ends the attempt. Dive again! |
| 135 | src/ui12.js:139 | Same cards, new plan. Ping your lowest Coral, the 2: tell Dag the trick is his. | Same cards, new plan. Ping your lowest Coral, the 2. It tells Dag the trick is his. |
| 136 | src/ui12.js:141 | You are never forced to win. Lead Coral 2 and let Dag take it. | You never have to win. Lead Coral 2 and let Dag win. |
| 137 | src/ui12.js:143 | Dag\'s Coral 7 is highest: "Ha, thanks!" Whoever wins a trick leads the next. | Dag's Coral 7 is highest, so Dag wins. The winner leads next. |
| 138 | src/ui12.js:145 | Green tick: Dag\'s job is done for good. Jobs that can still fail stay open. | Green tick: Dag's job is done. Jobs that can still fail stay open. |
| 139 | src/ui12.js:147 | Forgot a card? Brack keeps the logbook: look at the previous trick again. | Forgot a card? You can look at the last trick again. |
| 140 | src/ui12.js:149 | Dag won it with Coral 7. Only the latest trick is kept. Close the log. | Dag won it with Coral 7. Only the last trick is kept. Close it. |
| 141 | src/ui12.js:151 | Dag leads Kelp. If you hold Kelp you must follow: play your Kelp 3. | Dag leads Kelp. You hold Kelp, so you must follow. Play your Kelp 3. |
| 142 | src/ui12.js:153 | Sumi\'s Kelp 9 is the highest Kelp, so she wins and leads next. She grins. | Sumi's Kelp 9 is the highest Kelp. She wins and leads next. |
| 143 | src/ui12.js:155 | Sumi leads Tide and you hold none: play anything. A Lantern beats every colour. Play Lantern 3. | Sumi leads Tide. You have none, so play anything. A Lantern wins. Play Lantern 3. |
| 144 | src/ui12.js:157 | Your Lantern 3 beats her Tide 8. A higher Lantern would win. "Show-off!" says Sumi. | Your Lantern 3 beats her Tide 8. Only a higher Lantern would beat it. |
| 145 | src/ui12.js:159 | Both jobs done, so the dive ends and the crew wins. Brack: "Logbook signed. You\'re a diver now." | Both jobs are done. The crew wins. You're a diver now. |
| 146 | src/ui4.js:4 | You hold Lantern 4, the strongest card, so you pick a job first and lead the first trick. | You hold Lantern 4, so you pick a job first. You also lead the first trick. |
| 147 | src/ui4.js:5 | Tap a job card, then "Take this job". Pick one your cards can do. | Tap a job card, then Take this job. Pick one your cards can do. |
| 148 | src/ui4.js:6 | Light it and everyone passes one card to a neighbour. It costs one extra attempt in the logbook. "No flare" is fine. | Light it and everyone passes one card to a neighbour. It adds one attempt to the logbook. You can skip it. |
| 149 | src/ui4.js:7 | Once per dive you may show the team one card: your highest, lowest or only card of a colour. Or skip. | Once per dive, show one card: your highest, lowest or only card of a colour. Or skip. |
| 150 | src/ui4.js:8 | You must play the colour that was led if you have it (dim cards are not allowed). You never have to win. | Play the led colour if you have it. Dim cards are blocked. You never have to win. |
| 151 | src/ui4.js:9 | Play anything. Another colour never wins; a Lantern always does. | Play anything. Other colours never win. A Lantern does. |
| 152 | src/ui4.js:10 | A Lantern beats every colour. With several Lanterns the highest wins. | A Lantern beats every colour. The highest Lantern wins. |
| 153 | src/ui4.js:11 | Green tick = done for good. A red cross would end the dive. | A green tick means done. A red cross ends the attempt. |
| 154 | src/ui4.js:53 | Count the tricks each diver wins. Ties do not count as more or fewer. | Count each diver's tricks. A tie is neither more nor fewer. |
| 155 | src/ui4.js:54 | You win a card by winning the trick it is in. | You win a card by winning its trick. |
| 156 | src/ui4.js:55 | The card you play to win the trick has to be a colour card of that number. | The card that wins the trick must be a colour card of that number. |
| 157 | src/ui4.js:56 | The first trick is the first one played; the last is the final one of the dive. | The first trick is played first. The last trick ends the dive. |
| 158 | src/ui4.js:57 | Aim for exactly your number of tricks at the end. | Win exactly your number of tricks. |
| 159 | src/ui4.js:58 | Lanterns you win count: every Lantern in a trick you win. | Every Lantern in a trick you win counts. |
| 160 | src/ui4.js:59 | Cards in tricks you win count as won, even the ones other divers played. | Every card in a trick you win is yours, even other divers' cards. |
| 161 | src/ui4.js:60 | All cards in the tricks you win count as won by you. | Every card in a trick you win is yours. |
| 162 | src/ui4.js:47 | The Commander may not take this job. | The Commander cannot take this job. |
| 163 | src/ui4.js:77 | Only the most recent trick can be looked at again. | You can only look at the last trick. |
| 164 | src/ui4.js:94 | It could not be met by the end of the dive. | It could not be met before the dive ended. |
| 165 | src/ui4.js:94 | Not finished: the dive ended first. | Not finished. The dive ended first. |
| 166 | src/ui4.js:97 | Tip: the red cross marks the job that broke the dive. Grey jobs were still open. | The red cross marks the job that broke. Grey jobs were still open. |
| 167 | src/ui4.js:99 | Logged in your logbook: dive | Logged: dive |
| 168 | src/ui4.js:100 | Attempts so far on this dive: | Attempts on this dive: |
| 169 | src/ui2.js:256 | Watching the divers. | Watching the other divers. |
| 170 | src/ui2.js:301 | Waiting for the votes… | Waiting for votes… |
| 171 | src/ui2.js:302 | Handing out the jobs… | Handing out jobs… |
| 172 | src/ui2.js:305 | Keep every job, or offer? | Keep every job, or offer them? |
| 173 | src/ui2.js:310 | Take your jobs, then Done. | Take your jobs, then tap Done. |
| 174 | src/ui2.js:319 | Decide about the flare… | Use the flare? |
| 175 | src/ui2.js:30 | Distress flare is lit | The flare is lit |
| 176 | src/ui2.js:57 | No signalling in this dive | No signals in this dive |
| 177 | src/ui3.js:98 | That did not work. | Could not do that. |
| 178 | src/ui3.js:124 | Pick your highest, lowest or only card. | Pick your highest, lowest or only card of a colour. |
| 179 | src/ui3.js:125 | Lanterns cannot be passed. | You cannot pass Lanterns. |
| 180 | src/ui3.js:129 | That card cannot lead now. | You cannot lead that card. |
| 181 | src/ui3.js:148 | Not for the Commander. | The Commander cannot take that. |
| 182 | src/ui3.js:154 | That card cannot be shown. | You cannot show that card. |
| 183 | src/ui5.js:7 | Look at the line at the top: it says exactly what to do now. | Read the line at the top. It says what to do now. |
| 184 | src/ui5.js:7 | Glowing cards are the ones you may play; dim cards are blocked. | Glowing cards are playable. Dim cards are blocked. |
| 185 | src/ui5.js:7 | Each rival plays in turn, one card at a time, with a caption. | Each diver plays one card in turn. |
| 186 | src/ui5.js:7 | The highest card of the led colour wins the trick (a Lantern beats every colour); a caption says why. | The highest card of the led colour wins. A Lantern beats every colour. |
| 187 | src/ui5.js:9 | Everybody is dealt a hand. The diver with Lantern 4 is the Commander. | Everyone gets a hand. The diver with Lantern 4 is the Commander. |
| 188 | src/ui5.js:9 | Job cards are drawn until their numbers add up to the dive\'s difficulty (the number for your team size counts). | Job cards are drawn until their numbers add up to the dive's difficulty. Use the number for your team size. |
| 189 | src/ui5.js:9 | Jobs are taken: the Commander first, then clockwise, one job at a turn, until none are left. | Take jobs one at a time. The Commander goes first, then clockwise, until none are left. |
| 190 | src/ui5.js:9 | Optionally, light the distress flare to pass cards (see below). | Optional: light the distress flare to pass cards. |
| 191 | src/ui5.js:9 | Divers may signal once (see below), then the tricks are played. The Commander leads the first trick; each trick is led by the winner of the one before. | Each diver may signal once. Then play the tricks. The Commander leads first. The winner of each trick leads next. |
| 192 | src/ui5.js:9 | When every job is done the dive is won. If one job can no longer be done, the attempt is lost: deal again. | Every job done wins the dive. If one job cannot be met, the attempt is lost. Deal again. |
| 193 | src/ui5.js:10 | 40 cards: four colours (Coral, Tide, Kelp, Sunstar) numbered 1 to 9, and four Lanterns numbered 1 to 4. The Lanterns are the trump suit. With 3 divers one diver has 14 cards and one card is never played; 4 divers play 10 tricks, 5 divers 8 tricks. | 40 cards: Coral, Tide, Kelp and Sunstar, numbered 1 to 9, plus Lanterns 1 to 4. Lanterns beat every colour. With 3 divers, one has 14 cards and one card is never played. 4 divers play 10 tricks. 5 divers play 8. |
| 194 | src/ui5.js:11 | The leader plays any card. Everybody must follow the colour that was led if they can (Lanterns count as a colour too). If you cannot follow, play anything. | The leader plays any card. Everyone must follow its colour if they can. Lanterns count as a colour. If you cannot follow, play anything. |
| 195 | src/ui5.js:11 | A Lantern beats every colour; the highest Lantern wins. With no Lantern, the highest card of the led colour wins. | A Lantern beats every colour. The highest Lantern wins. With no Lantern, the highest card of the led colour wins. |
| 196 | src/ui5.js:11 | You may look again at the most recent trick only (the "Last trick" button). | Tap Last trick to see the previous trick. Only that one. |
| 197 | src/ui5.js:12 | Once per dive each diver may show one colour card from the hand, face up: it must be their highest, their lowest or their only card of that colour. The token marks which one (top, bottom or middle). | Once per dive, each diver may show one colour card. It must be their highest, lowest or only card of that colour. The token says which: top, bottom or middle. |
| 198 | src/ui5.js:12 | Lanterns cannot be shown. Signals only happen between tricks. The mark does not change afterwards, even if it stops being true. | You cannot show Lanterns. Signal between tricks only. The mark stays, even if it stops being true. |
| 199 | src/ui5.js:12 | Murky water: the card is shown but gets no mark. Deep narcosis: the tokens are in a shared pool (two fewer than divers) and anyone can use one at any time between tricks. Unknown waters: draw a colour card first: 1-3 normal, 4-6 murky, 7-9 narcosis. | Murky water: the shown card gets no mark. Deep narcosis: tokens share a pool, two fewer than divers. Anyone may use one between tricks. Unknown waters: draw a colour card first. 1-3 normal, 4-6 murky, 7-9 narcosis. |
| 200 | src/ui5.js:13 | A job is done when it is met and can no longer fail. It fails when it can no longer be met. | A job is done when it is met and cannot fail. A job breaks when it cannot be met. |
| 201 | src/ui5.js:13 | Three jobs compare with the Commander (more, fewer or equally many tricks); the Commander cannot take those. | Three jobs compare your tricks with the Commander's. The Commander cannot take them. |
| 202 | src/ui5.js:13 | If both "win the first trick" and "win the first two tricks" lie on the table and nobody could take both, one is swapped for another job of the same value. | If both "first trick" and "first two tricks" are out and nobody can take both, swap one for a job of the same value. |
| 203 | src/ui5.js:14 | Before any signalling, the team may light the flare. Every diver passes one colour card to the left (or everybody to the right). It stays lit until the dive is won, and the dive counts one extra attempt in your logbook. You may pass again at the start of each later attempt, or not. | Before signals, the team may light the flare. Everyone passes one colour card left, or everyone right. It stays lit until the dive is won. The logbook counts one extra attempt. You may pass again each attempt. |
| 204 | src/ui5.js:15 | Commander\'s call (dives 10, 13): the Commander takes all jobs or hands them to a willing diver. If handed over, all signalling happens before the first trick. | Commander's call (dives 10, 13): the Commander takes all jobs or hands them to a willing diver. If handed over, signal before the first trick. |
| 205 | src/ui5.js:15 | One diver takes all jobs: by team vote (dive 6) or by volunteering in turn, answering only yes or no (dives 14, 15, 16; two volunteers in dive 26). | One diver takes all jobs. Dive 6: team vote. Dives 14, 15, 16: volunteer in turn, yes or no. Dive 26: two volunteers. |
| 206 | src/ui5.js:15 | Open briefing (dives 17, 28-31, deep dives): talk freely about the jobs, never about cards. | Open briefing (dives 17, 28-31, deep dives): talk about jobs. Never about cards. |
| 207 | src/ui5.js:15 | Limits: some dives forbid winning two more 9s (or 1s) than another diver, leading Coral or a Lantern, and more. The rule of each dive is in the panel when you start it. | Some dives add limits. Examples: no holding two more 9s than another diver, or never leading Coral. Each dive shows its rule when it starts. |
| 208 | src/ui5.js:15 | Real-time dives (14, 15, 16, 26): beat a clock, or play without it and use the alternative rule shown with the dive. Turn the clock on in the setup screen. | Clock dives (14, 15, 16, 26): beat the clock, or skip it and use the other rule shown. Turn the clock on in setup. |
| 209 | src/ui5.js:16 | With two divers a drone joins as a third team member. Its 14 cards lie in a double row, 7 face up on top of 7 face down. The Commander takes jobs for it, plays its face-up cards and decides without talking. A face-down card turns up only after the card on top of it was played, between tricks. | With two divers, a drone joins as a third player. Its 14 cards lie in two rows: 7 face up, 7 face down. The Commander takes its jobs and plays its face-up cards. A face-down card turns up after the card on top is played. |
| 210 | src/ui5.js:17 | Tap a card to lift it, tap it again (or press Play) to play. Dim cards are not allowed now. Tap a diver or a job chip for details; "Last trick" shows the previous trick. | Tap a card to lift it. Tap again, or press Play, to play it. Dim cards are blocked. Tap a diver or job for details. |
| 211 | src/ui5.js:17 | The panel at the bottom always says what to do now. The Hint button shows a suggestion with the reason. | The bottom panel says what to do now. The Hint button suggests a card and why. |
| 212 | src/ui5.js:17 | Hot-seat: a pass-the-device screen hides every hand. Online: you only ever see your own cards. There is no chat, only the pings and a few neutral emotes. | Hot-seat: a screen hides hands between turns. Online: you see only your own cards. There is no chat, only pings and emotes. |
| 213 | src/ui5.js:76 | Lantern Dive is an original deep-sea co-op trick game. Names, job text and art are original; the audio credits are in How to play. | Lantern Dive is an original co-op card game. Audio credits are in How to play. |
| 214 | src/ui5.js:31 | Numbers are the job\'s worth for 3 / 4 / 5 divers. 96 jobs. | Numbers are each job's difficulty for 3, 4 and 5 divers. 96 jobs. |
| 215 | src/ui5.js:36 | * the difficulty number of this dive could not be confirmed from the sources; see rules-notes.md. | * This difficulty number is unconfirmed. |
| 216 | src/ui5.js:29 | Reminder card x5 (put in your hand while your shown card is on the table), card back x1 design. | Reminder card (5): sits in your hand while your shown card is on the table. |
| 217 | src/ui5.js:38 | Put on a shown card: top = highest, middle = only, bottom = lowest of that colour in the hand. Green side ready, red side spent. | Placed on a shown card. Top is highest, middle is only, bottom is lowest. Green is ready, red is spent. |
| 218 | src/ui5.js:39 | Flipped to red after use. In murky water it sits beside the card without a mark. | Red after use. In murky water it sits beside the card. |
| 219 | src/ui5.js:40 | Lit before a dive: everybody passes a card, the dive counts one extra attempt. | Light it before a dive. Everyone passes a card. It adds one attempt. |
| 220 | src/ui5.js:41 | Goes to the diver holding Lantern 4. Picks jobs first and leads the first trick. | Goes to the diver with Lantern 4. They pick jobs first and lead first. |
| 221 | src/ui5.js:42 | Shown in your hand while your signalled card lies on the table. | Sits in your hand while your signalled card is on the table. |
| 222 | src/ui5.js:50 | All jobs of this attempt. Tap one for details. | All jobs this attempt. Tap one for details. |
| 223 | src/ui5.js:82 | At least one diver joins you. | You need at least one other diver. |
| 224 | src/ui5.js:110 | Dive together. Say nothing. Trust the lantern. | Dive together. Do not talk about your cards. |
| 225 | src/ui5.js:129 | In the team ✓ | In the crew ✓ |
| 226 | src/ui5.js:142 | All 32 dives logged! The Deep Dive keeps going from difficulty 18. | All 32 dives logged. Deep Dive starts at difficulty 18. |
| 227 | src/ui5.js:175 | Choose the dive and who comes along. Each computer diver has a temper; change their level if you like. | Choose a dive and your crew. You can change each computer diver's level. |
| 228 | src/ui5.js:179 | Host a dive and send friends the code or the link. Every browser connects directly; nobody sees another hand. Empty seats go to the computer divers. There is no chat: talk with the pings only. | Host a dive and send friends the code or link. Nobody sees another hand. Computers fill empty seats. There is no chat, only pings. |
| 229 | src/ui5.js:180 | Free, peer to peer | Free and direct |
| 230 | src/ui5.js:159 | Configure the dive | Set up the dive |
| 231 | src/ui5.js:157 | Plan the dive | Set up the dive |
| 232 | src/ui5.js:174 | the divers play | computers play |
| 233 | src/ui8.js:7 | Sssso… fresh divers in MY reef. I bite when you least expect it. Every second trick I twist the rules! | Fresh divers in my reef! I twist the rules every second trick. |
| 234 | src/ui8.js:8 | Hah! Back to the surface with you! | Ha! Back to the surface! |
| 235 | src/ui8.js:8 | Nooo… my reef… take it, then. | No! My reef! Fine, take it. |
| 236 | src/ui8.js:10 | Welcome to my garden, little lights. I put Lanterns to sleep and turn the tides upside down. | Welcome to my garden. I put Lanterns to sleep and flip the tides. |
| 237 | src/ui8.js:11 | Tangled at last. Swim home, little lights. | Tangled at last. Swim home! |
| 238 | src/ui8.js:11 | My spells… unravelled. Pass, then. | My spells fell apart. Pass, then. |
| 239 | src/ui8.js:13 | Follow my little light… In my trench every colour bites, Lanterns doze, and the low ones rise. | Follow my light. In my trench every colour bites, Lanterns doze, and low cards win. |
| 240 | src/ui8.js:14 | Into the dark you go. Forever. | Into the dark you go. |
| 241 | src/ui8.js:14 | My light… goes out… | My light is out. |
| 242 | src/ui8.js:16 | I AM THE ABYSS. EVERY TRICK, MY CURSE. FINISH YOUR JOBS… IF YOU CAN. | I AM THE ABYSS. EVERY TRICK HAS A CURSE. FINISH YOUR JOBS IF YOU CAN. |
| 243 | src/ui8.js:17 | THE DEEP… TREMBLES. | THE DEEP TREMBLES. |
| 244 | src/ui8.js:17 | YOU… WOUND ME? | YOU HURT ME? |
| 245 | src/ui8.js:17 | THE LANTERNS… REACH… THE BOTTOM. YOU HAVE WON. | THE LANTERNS REACH THE BOTTOM. YOU WIN. |
| 246 | src/ui8.js:46 | The LOWEST card of the led colour wins the trick. Lanterns still beat colours (the highest Lantern wins as usual). | The lowest card of the led colour wins. Lanterns still beat colours. |
| 247 | src/ui8.js:47 | Lanterns sleep this trick: a Lantern played on a colour wins nothing. | Lanterns do not win this trick. |
| 248 | src/ui8.js:48 | Every colour counts: the highest number wins, whatever its colour. Lanterns still beat colours. | Every colour counts. The highest number wins. Lanterns still beat colours. |
| 249 | src/ui8.js:66 | You reached the bottom of the sea. Legendary! Start again any time. | You reached the sea floor! Start again any time. |
| 250 | src/ui8.js:66 | Each zone: 3 dives, then a boss. A failed dive costs one oxygen tank. Out of air = back to the top of the zone. | Each zone has 3 dives, then a boss. A failed dive costs one oxygen tank. No tanks left sends you to the zone start. |
| 251 | src/ui8.js:145 | Four zones, deeper and harder. Each zone: three dives, then a boss. A failed dive costs one oxygen tank (you have | Four zones, each harder. Each has three dives, then a boss. A failed dive costs one oxygen tank. You have |
| 252 | src/ui8.js:145 | Do every job to clear a dive. Ready? | Finish every job to clear a dive. Ready? |
| 253 | src/ui8.js:147 | Shallow and bright. Pick jobs your cards can do, and help the others with theirs. | Shallow and bright. Pick jobs your cards can do. Help the others. |
| 254 | src/ui8.js:147 | Murky water ahead: in some dives a shown card does not tell if it is the highest or lowest. | Murky water ahead. In some dives, a shown card has no mark. |
| 255 | src/ui8.js:147 | The trench is dark and the jobs are many. Use your signal early. | The trench is dark with many jobs. Signal early. |
| 256 | src/ui8.js:111 | Every job hit home. | Every job done. |
| 257 | src/ui8.js:111 | The sea is yours. | You cleared the sea. |
| 258 | src/ui8.js:114 | You beat ' + B.name + '! Fresh tanks — on to ' | You beat ' + B.name + '! Fresh tanks. On to ' |
| 259 | src/ui8.js:114 | 'the surface, legends' | 'the surface' |
| 260 | src/ui8.js:114 | First try — that is a star. | First try. That earns a star. |
| 261 | src/ui8.js:115 | Out of air! Back up to the start of ' | No tanks left. Back to the start of ' |
| 262 | src/ui8.js:115 | with full tanks. You know the waters now. | with full tanks. |
| 263 | src/ui8.js:116 | That cost one oxygen tank (' | You lost one oxygen tank ('  |
| 264 | src/ui8.js:116 | left). Read the red cross: that job broke. Try the dive again. | left). The red cross shows the job that broke. Try again. |
| 265 | src/ui8.js:151 | the next curse comes on trick | the next curse is on trick |
| 266 | src/ui8.js:170 | Curse on trick ' | Next curse: trick ' |
| 267 | src/ui9.js:39 | The boss rule was broken, so the chapter is not won. | The boss rule was broken. The chapter is not won. |
| 268 | src/engine.js:695 | The distress flare is lit: this dive will count one extra attempt. | The flare is lit. This dive counts one extra attempt. |
| 269 | src/engine.js:694 | The team goes without the distress flare. | The team skips the flare. |
| 270 | src/engine.js:419 | Nobody volunteers: | Nobody volunteers. |
| 271 | src/engine.js:426 | every job (team vote). | every job by team vote. |
| 272 | src/engine.js:418 | All signalling happens before the first trick. | Signal before the first trick. |
| 273 | src/engine.js:608 | Dive complete! | Dive won! |
| 274 | src/net.js:244 | Close the room | Close the game |
| 275 | src/net.js:261 | Leave the room | Leave the game |

ROWS: 275
