# Final Approach: copy fixes

Goal card: ok (one sentence aim `Goal: land together in round N.` plus 3 bullets). Only its third bullet is rewritten (row 1).

| # | file:line | old line | new line |
|---|---|---|---|
| 1 | src/ui11.js:223 | Spare dice: clear planes, lower gear and flaps, set brakes. The checklist shows what is left. | Spare dice: radio, gear, flaps, brakes. The checklist shows what is left. |
| 2 | src/ui10.js:39 | Tap a phrase to tell your partner a plan, never dice values. Then tap Roll. | Tap a phrase to share a plan. Never say dice. Then tap Roll. |
| 3 | src/ui10.js:42 | Tap the dice you want to roll again, then tap the green button. None is fine. | Tap the dice to roll again. Then tap the green button. |
| 4 | src/ui10.js:49 | Drop a die on the axis. The plane tilts toward the higher die. Equal dice keep it level. | Put a die on the axis. The higher die tips the plane. Equal dice stay level. |
| 5 | src/ui10.js:50 | The two engine dice add up to your speed. Low holds, medium moves one space, high two. | Two engine dice add up to your speed. Low stays. Medium moves one space. High moves two. |
| 6 | src/ui10.js:51 | The radio clears a plane ahead. A 1 clears your space, a 2 the next one, and so on. | The radio sends a plane away. A 1 hits your space. A 2 hits the next. |
| 7 | src/ui10.js:52 | Gear takes 1-2, 3-4, 5-6; flaps go in order. Land with all of them down. | Gear takes 1-2, 3-4, 5-6. Flaps go in order. Land with all down. |
| 8 | src/ui10.js:53 | Brakes set how fast you may land. Place 2, then 4, then 6. Landing speed must stay within them. | Brakes set your top landing speed. Place 2, then 4, then 6. |
| 9 | src/ui10.js:54 | A die on a coffee space earns a token to nudge a later die by one. Rerolls redo your dice. | A die on coffee gives a token. Spend it to change a die by one. |
| 10 | src/ui10.js:58 | Land with the plane level. Seven rounds, and both crew put a die on the axis every round. | Land with the plane level. Both of you put a die on the axis each round. |
| 11 | src/ui10.js:59 | The plane tilts toward the higher die, by the difference. Equal dice change nothing. | The plane tips toward the higher die. Equal dice change nothing. |
| 12 | src/ui10.js:60 | Answer your partner’s die with a close one. A spin loses the flight at once. | Answer your partner’s die with a close one. A tilt of 3 loses. |
| 13 | src/ui10.js:62 | Up to the blue marker you stay. Up to orange you move one space. Above it, two. | Up to the blue marker, you stay. Up to orange, move one. Above, move two. |
| 14 | src/ui10.js:63 | Reach the airport before the last round, then hold. Too fast overshoots the runway. | Reach the airport before the last round. Too fast flies past it. |
| 15 | src/ui10.js:65 | A die of 1 clears your own space, 2 the next one, 3 the one after. | A 1 clears your space. A 2 clears the next. A 3 the one after. |
| 16 | src/ui10.js:67 | Three gear spaces take 1-2, 3-4 and 5-6, in any order. Only the pilot uses them. | Three gear spaces take 1-2, 3-4, 5-6 in any order. Pilot only. |
| 17 | src/ui10.js:68 | Four flap spaces take 1-2, 2-3, 4-5, 5-6, top to bottom. Co-pilot only. | Four flap spaces take 1-2, 2-3, 4-5, 5-6 in order. Co-pilot only. |
| 18 | src/ui10.js:69 | Each gear and flap raises a speed marker. Every one must be down at the landing. | Each gear and flap raises a speed marker. All must be down to land. |
| 19 | src/ui10.js:70 | Brake spaces take exactly 2, then 4, then 6, in that order. Only the pilot uses them. | Brakes take exactly 2, then 4, then 6. Pilot only. |
| 20 | src/ui10.js:71 | In the last round the plane stops: the engine total must be no more than the brakes. | In the last round, engine total must not beat the brakes. |
| 21 | src/ui10.js:74 | You know every control. Later flights hide each crew’s dice and add fuel, wind and more. | You know every control. Next come hidden dice, fuel and wind. |
| 22 | src/ui10.js:75 | Land together in the last round: clear all planes, lower gear and flaps, level the axis, slow down. | Land together in the last round. Clear planes, gear and flaps down, axis level, slow enough. |
| 23 | src/ui10.js:77 | A spin, a crash, an empty Axis or Engines space, or a failed landing loses for both. | A spin, a crash, an empty Axis or Engines, or a bad landing loses for both. |
| 24 | src/ui10.js:78 | Tap a phrase to share a plan. Never say the values of your dice. Then tap Roll my dice. | Tap a phrase to share a plan. Never say dice. Then tap Roll my dice. |
| 25 | src/ui10.js:79 | After the roll your placed dice are your only words. Watch where your partner puts theirs. | After the roll, say nothing. Your dice do the talking. |
| 26 | src/ui10.js:80 | Pilot is blue, Co-pilot orange. Blue spaces are the Pilot’s, orange the Co-pilot’s. Grey spaces take either. | Pilot is blue. Co-pilot is orange. Grey spaces take either. |
| 27 | src/ui10.js:81 | One row per round. Its colour says who places first. A purple dot adds a reroll token. | One row per round. Its colour shows who goes first. A purple dot adds a reroll. |
| 28 | src/ui10.js:82 | Both crew put a die on the Axis. The plane tilts toward the higher die. Tilt of 3 loses. | Both of you put a die on the Axis. A tilt of 3 loses. |
| 29 | src/ui10.js:83 | Both fill the Engines. Sum: up to blue marker stays, up to orange moves 1, above moves 2. | Both fill the Engines. Up to blue stays. Up to orange moves 1. Above moves 2. |
| 30 | src/ui10.js:84 | A die on the Radio clears one plane that many spaces ahead. Your own space counts as 1. | A die on Radio clears a plane that many spaces ahead. Your space is 1. |
| 31 | src/ui10.js:85 | A reroll token rerolls all unplaced dice, for both crew. Spare dice earn Coffee tokens. | A reroll token lets you both roll unplaced dice again. Spare dice earn coffee. |
| 32 | src/ui10.js:86 | Pilot lowers three gears, Co-pilot extends four flaps in order. All must be done to land. | Pilot lowers three gears. Co-pilot sets four flaps in order. All must be done to land. |
| 33 | src/ui10.js:87 | Set the brakes in order, exact values. In the last round your engine total must stay within them. | Set brakes 2, 4, 6 in order. In the last round, engines must not beat them. |
| 34 | src/ui10.js:88 | A die on a Coffee space earns a token. Spend tokens to change a later die by 1. | A die on Coffee gives a token. Spend it to change a die by 1. |
| 35 | src/ui10.js:89 | If no space takes the die, tap Put it aside. Coffee can change its value by one first. | If no space fits, tap Put it aside. Coffee can change the die first. |
| 36 | src/ui10.js:90 | Spending a token lets both crew reroll any unplaced dice, once. Either crew can spend one any time. | A token lets you both reroll unplaced dice once. Either of you can spend it. |
| 37 | src/ui10.js:91 | Tap only the dice that do not fit the open jobs. Tap the green button to confirm. | Tap only the dice you do not need. Then tap the green button. |
| 38 | src/ui10.js:92 | Some twists give a die you must place right away. Tap it, then a glowing space. | Some flights give an extra die. Tap it, then a glowing space. |
| 39 | src/ui10.js:93 | It goes on the same spaces as your other dice, with the same rules. Coffee can bend it. | It goes where your other dice go. Coffee can change it. |
| 40 | src/ui10.js:94 | Both crew swap one die, without saying the values. Pick which of yours to give. | You each swap one die. Pick the one you give. |
| 41 | src/ui10.js:95 | Give the die that fits your open jobs least. You still must place every die. | Give the die you need least. You still place every die. |
| 42 | src/ui10.js:120 | The radio clears nothing here: this just uses up a spare die. | The radio clears nothing here. It uses up a spare die. |
| 43 | src/ui10.js:126 | A spare die on Coffee earns a token to bend a later die by one. | A spare die on Coffee gives a token to change a die by one. |
| 44 | src/ui10.js:128 | This trains the trainee: place the next token too. | Now place the next trainee token too. |
| 45 | src/ui4.js:21 | No extra rules today: just the panel, the track and each other. | No extra rules today. Just the panel and the track. |
| 46 | src/ui4.js:33 | Every round both crew must put a die on the Axis and on the Engines. The panel warns you (red pulse) when your last dice are needed there. | Every round, both of you fill the Axis and Engines. A red pulse warns you. |
| 47 | src/ui4.js:33 | A tilt of 3 either way is a spin. Watch the dial and answer your crewmate’s axis die with a close value. | A tilt of 3 either way is a spin. Answer your partner’s axis die with a close one. |
| 48 | src/ui4.js:33 | Clear a plane with the Radio before you leave its space: a die showing n clears the space n - 1 ahead of you. | Clear planes with the Radio before you move. A die showing n clears n spaces ahead, counting yours as 1. |
| 49 | src/ui4.js:33 | Near the airport keep the engine sum at or under the blue marker: the plane then stays where it is. | Near the airport, keep engines at or under blue. The plane stays put. |
| 50 | src/ui4.js:33 | Use the fuel space every round (any die burns its value; skipping burns 6), or keep the engine dice close when fuel leaks. | Use the fuel space each round. Skipping burns 6. In a leak, keep engine dice close. |
| 51 | src/ui4.js:33 | You must be on the airport space when the last altitude starts: plan the moves round by round. | Be on the airport when the last round starts. Plan your moves each round. |
| 52 | src/ui4.js:62 | A banner tells you whose turn it is. The line at the bottom says what to do. | A banner shows whose turn it is. The bottom line says what to do. |
| 53 | src/ui4.js:62 | Pick one of your dice. The spaces it can go to glow; the rest dim. | Pick one of your dice. Spaces it fits glow. The rest dim. |
| 54 | src/ui4.js:62 | Put it on a glowing space. It slides in, then a caption says what changed. | Put it on a glowing space. A caption says what changed. |
| 55 | src/ui4.js:62 | Your crewmate takes a turn the same way, one step at a time. Tap the board to speed it up. | Your partner goes next, the same way. Tap the board to speed it up. |
| 56 | src/ui4.js:62 | Dice run out, the round ends, the plane moves. Seven rounds, then you land together. | When dice run out, the round ends and the plane moves. After seven rounds you land. |
| 57 | src/ui4.js:63 | You and your crewmate fly an airliner onto the runway. You are the Pilot (blue) and the Co-pilot (orange). You win or lose together. The game lasts seven rounds, one altitude row each. The plane must already be on the airport when the last round starts (rounds 1 to 6 are for flying there; arriving early is fine, you then hold). The last round is the landing: by its end the track must be clear, the gear and flaps down, the axis level, and the engine total no more than the brakes. | You and your partner land an airliner. You are the Pilot (blue) and the Co-pilot (orange). You win or lose together. The game has seven rounds. Rounds 1 to 6 fly you to the airport. Arriving early is fine. Round 7 is the landing. By its end the track is clear. Gear and flaps are down. The axis is level. Engines do not beat the brakes. |
| 58 | src/ui4.js:64 | Round start: the altitude row appears (it may bring a reroll token), and the traffic die may add planes. | A new round starts. The altitude row may add a reroll token. The traffic die may add planes. |
| 59 | src/ui4.js:64 | Briefing: talk strategy, never dice values. Then both crew roll four dice behind their screens. | Briefing: talk plans, never dice. Then you each roll four dice behind your screens. |
| 60 | src/ui4.js:64 | Silence. The first player (shown on the altitude row) puts one die on a free space of their colour, then you alternate until all eight dice are used. | Now stay silent. The first player puts a die on a free space. Then you take turns until all eight dice are placed. |
| 61 | src/ui4.js:64 | End of round: both axis and both engine dice must be there. The plane sinks one row and the dice come back. | Round ends. Both Axis and both Engines must be filled. The plane drops one row. |
| 62 | src/ui4.js:67 | Axis (both, mandatory): the plane tilts toward the higher die by the difference. Tilt of 3 = spin = lost. It never resets. | Axis (both, every round): the higher die tips the plane by the difference. A tilt of 3 loses. The tilt stays. |
| 63 | src/ui4.js:67 | Engines (both, mandatory): the sum against the two markers (blue starts at 4, orange at 8): 0, 1 or 2 spaces. Leaving a space with a plane is a collision; passing the airport is an overshoot. | Engines (both, every round): add the two dice. Blue starts at 4, orange at 8. Up to blue: stay. Up to orange: move 1. Above: move 2. Leaving a space with a plane is a crash. Passing the airport loses. |
| 64 | src/ui4.js:68 | Radio: pilot one space, co-pilot two, any value. It removes a plane from the space that many steps ahead (1 = your own space). | Radio: Pilot has one space, Co-pilot two. Any die works. It clears a plane that many spaces ahead. Your own space is 1. |
| 65 | src/ui4.js:69 | Landing gear (pilot): 1-2, 3-4, 5-6 in any order. Each raises the blue marker by one. | Landing gear (Pilot): 1-2, 3-4, 5-6 in any order. Each one lifts blue by one. |
| 66 | src/ui4.js:70 | Flaps (co-pilot): 1-2, 2-3, 4-5, 5-6 strictly in order. Each raises the orange marker by one. | Flaps (Co-pilot): 1-2, 2-3, 4-5, 5-6 in order. Each one lifts orange by one. |
| 67 | src/ui4.js:71 | Brakes (pilot): exactly 2, then 4, then 6. They only count in the last round. | Brakes (Pilot): exactly 2, then 4, then 6. They only matter in the last round. |
| 68 | src/ui4.js:72 | Concentration: any die, a coffee token (up to 3). Spend tokens to add or subtract 1 from any die you place (1 to 6, no wrapping). | Coffee: any die earns a token (hold up to 3). Spend one to add or subtract 1 from a die. Stay between 1 and 6. |
| 69 | src/ui4.js:73 | Reroll token: either crew may spend it at any time while dice are unplaced (also on the partner’s turn): both crew may reroll any of their unplaced dice once. | Reroll token: either of you can spend it, even on your partner’s turn. You both may roll unplaced dice again, once. |
| 70 | src/ui4.js:74 | House rules in this version | Extra rules in this game |
| 71 | src/ui4.js:74 | Landing: the speed may equal the brake value, but the brakes must be at least 2. | Landing speed can equal the brakes. The brakes must be at least 2. |
| 72 | src/ui4.js:74 | A die that fits no space is thrown away and counts as your turn. | A die that fits nowhere is put aside. It counts as your turn. |
| 73 | src/ui4.js:74 | The trainee token is placed at once, in the same turn, and never on a trainee space. | Place a trainee token right away, in the same turn. Never on a trainee space. |
| 74 | src/ui4.js:74 | Briefing talk is a fixed set of phrases, never dice values. The timer pauses on pass screens and while the computer plays. | Briefing uses set phrases, never dice. The timer pauses on pass screens and computer turns. |
| 75 | src/ui4.js:74 | Hand-over, flip and cross-check can be used by either seat when no question is open; cross-check fires once a round and both crew see the swapped values. | Either of you can use Hand-over, Flip and Cross-check when nothing else is waiting. Cross-check works once a round. You both see the swapped values. |
| 76 | src/ui4.js:74 | The newer expansion (alarms, turbulence, engine loss) is not included. | Alarms, turbulence and engine loss are not in this game. |
| 77 | src/ui4.js:75 | The plane does not move. Your engine total must be no more than the brake value (and the brakes must be at least 2). At the end of the round you win only if every one of these holds: no planes left, all gear and flaps down, the axis level, and that speed check passed. | The plane does not move. Engine total must not beat the brakes. You win only if all of these are true. No planes are left. Gear and flaps are down. The axis is level. The speed is within the brakes. |
| 78 | src/ui4.js:76 | an axis or engine die is missing at the end of a round | an Axis or Engines die is missing at round end |
| 79 | src/ui4.js:76 | the last altitude starts and you are not at the airport | the last round starts and you are not at the airport |
| 80 | src/ui4.js:79 | Coffee buttons appear under the selected die when you hold tokens. | Coffee buttons show under your die when you hold tokens. |
| 81 | src/ui4.js:79 | Hot-seat: a pass screen hides everything between turns. Online: you only ever see your own dice. | Pass-and-play: a cover screen hides dice between turns. Online: you only see your own dice. |
| 82 | src/ui4.js:79 | Hint shows what the computer crew would do and why, under the selected die (never over the buttons). | Hint shows the computer’s move and why, under your die. |
| 83 | src/ui4.js:79 | Each control space is labelled (Axis, Engine, Radio, Gear, Flap, Brake, Coffee). The altitude strip colour shows who places first. The ✓ button lists the landing checklist. | Every space has a label. The strip colour shows who goes first. The ✓ button shows the landing checklist. |
| 84 | src/ui4.js:98 | Before the roll you may say one thing. After the roll: silence, your placed dice do the talking. | Before the roll, say one thing. After the roll, stay silent. |
| 85 | src/ui4.js:121 | Final Approach is an original co-operative landing game. Names, text and art are original; audio credits are in How to play. | Final Approach is a team landing game. Audio credits are in How to play. |
| 86 | src/ui4.js:86 | Module parts: fuel track (starts at 20), wind dial, six trainee tokens, icy-runway brake track, 60-second timer | Extras: fuel track (starts at 20), wind dial, six trainee tokens, icy-runway brake track, 60-second timer |
| 87 | src/ui2.js:243 | for the next flap (they go in order). Coffee tokens can bend a die into range. | for the next flap. Flaps go in order. Coffee can change a die. |
| 88 | src/ui2.js:244 | the missing gear values (1-2, 3-4, 5-6). | the missing gear numbers (1-2, 3-4, 5-6). |
| 89 | src/ui2.js:254 | this ends the flight. ' + (R.msg \|\| '') + ' Tap it twice if you really mean it. | This loses the flight. ' + (R.msg \|\| '') + ' Tap twice to do it anyway. |
| 90 | src/ui2.js:284 | Spend a reroll token: both crew may reroll any unplaced dice once | Use a reroll token: you both roll unplaced dice again |
| 91 | src/ui2.js:236 | A reroll token was spent. | A reroll token was used. |
| 92 | src/ui2.js:236 | You spent a reroll token. | You used a reroll token. |
| 93 | src/ui2.js:142 | shared coffee token | coffee token |
| 94 | src/ui2.js:193 | After the roll: silence. Your placed dice do the talking. | After the roll, say nothing. Place your dice. |
| 95 | src/ui2.js:289 | No space fits: put it aside | Nothing fits: put it aside |
| 96 | src/ui3.js:84 | Flaps go in order: use the one above first. | Flaps go in order. Use the top one first. |
| 97 | src/ui3.js:84 | The die must differ from the next trainee token. | The die must not match the next trainee token. |
| 98 | src/ui3.js:106 | Your dice are hidden until you tap the button. | Your dice stay hidden until you tap the button. |
| 99 | src/ui3.js:79 | still empty. Tap again. | is still empty. Tap again. |
| 100 | src/ui3.js:81 | This ends the flight. Tap again. | This loses the flight. Tap again. |
| 101 | src/ui3.js:95 | Spend a token? Tap again. | Use the token? Tap again. |
| 102 | src/ui5.js:50 | Pick an airport, your seat and how sharp the computer crewmate is. New to the game? Start with flight school. | Pick an airport, your seat and the computer’s skill. New? Try Flight school first. |
| 103 | src/ui5.js:54 | Host a flight and send a friend the code or the link. Browsers connect directly; each of you only ever sees your own dice. An empty seat goes to the computer. | Host a flight. Send your friend the code or link. You each see only your own dice. An empty seat is flown by the computer. |
| 104 | src/ui5.js:55 | Free, peer to peer | Free, direct connection |
| 105 | src/ui5.js:42 | This scenario uses no ability cards. | This flight uses no ability cards. |
| 106 | src/ui5.js:43 | Configure the flight | Set up the flight |
| 107 | src/ui5.js:37 | Choose your flight | Pick a flight |
| 108 | src/net.js:175 | Your friend opens the link, or taps Play online and types the code. Nobody can see the other crew member’s dice. | Your friend opens the link, or taps Play online and types the code. Nobody sees the other seat’s dice. |
| 109 | src/net.js:185 | If nobody joins, the other seat is flown by the computer. A friend who leaves is replaced by it. | If nobody joins, the computer flies the other seat. It also covers a friend who leaves. |
| 110 | src/net.js:195 | Online play needs a recent browser with WebRTC (Chrome, Edge, Firefox or Safari). | Online play needs a recent Chrome, Edge, Firefox or Safari. |
| 111 | src/net.js:196 | Free and direct: your browsers connect to each other. Host a flight, then send your friend the code or the link. | Free and direct. Host a flight, then send your friend the code or link. |
| 112 | src/ui12.js:164 | Tap the dice you want to roll again, then confirm, or keep them all. | Tap the dice to roll again, then confirm. Or keep them all. |
| 113 | src/ui12.js:146 | Nothing takes your  | Nothing fits your  |
| 114 | src/ui12.js:146 | : throw it away (it still counts as your turn). | : put it aside. It still counts as your turn. |
| 115 | src/ui11.js:137 | Either: any die. Earns a coffee token (nudge a later die by 1). | Either seat, any die. Earns a coffee token to change a die by 1. |
| 116 | src/ui11.js:139 | : any die but the next token value. Trains the trainee. | : any die but the next token number. Trains the trainee. |
| 117 | src/ui8.js:12 | Trainee token being placed. | Trainee token is being placed. |
| 118 | src/ui9.js:44 | Replay the tutorial | Replay the lesson |
| 119 | src/engine.js:122 | A reroll token comes aboard. | You get a reroll token. |
| 120 | src/engine.js:141 | Both crew roll their dice behind the screens. Silence in the cockpit. | You both roll behind your screens. No talking now. |
| 121 | src/engine.js:150 | keeps the spare dice in the box. | sets the spare dice aside. |
| 122 | src/engine.js:228 | Twin Thrust: equal engine dice earn a reroll token. | Twin Thrust: matching engine dice earn a reroll token. |
| 123 | src/engine.js:250 | Concentration: a coffee token. | Coffee: you get a token. |
| 124 | src/engine.js:250 | Concentration: already three coffees, the die is simply spent. | Coffee: you already hold three. The die is used up. |
| 125 | src/engine.js:368 | spends a reroll token: both crew may reroll. | uses a reroll token. You both may reroll. |
| 126 | src/engine.js:254 | The trainee gets token ' + tok + ' and must place it now. | The trainee token is ' + tok + '. Place it now. |
| 127 | src/engine.js:335 | Cross-check: the traffic die shows ' + v + '. The co-pilot places it. | Cross-check: the traffic die shows ' + v + '. Co-pilot, place it. |
| 128 | src/engine.js:204 | The axis was outside the corridor while leaving space  | The axis was off the corridor tab when leaving space  |
| 129 | src/engine.js:187 | The plane reached the last altitude before reaching the airport. | The last round began before the plane reached the airport. |
| 130 | src/engine.js:220 | The plane tilted too far and went into a spin. | The plane tilted too far and spun. |
| 131 | src/engine.js:233 | No brakes were set: the plane cannot stop. | No brakes are set. The plane cannot stop. |
| 132 | src/engine.js:176 | Missing at the end of the round:  | Still empty at round end:  |
| 133 | src/engine.js:164 | LOST:  | Lost:  |
| 134 | src/engine.js:183 | LANDED. | Landed. |
| 135 | src/data.js:57 | Only one control today: the axis. Land with the plane level. | One control today: the axis. Land with the plane level. |
| 136 | src/data.js:58 | Add the engines: fly the approach and stop on the airport. | Add the engines. Fly in and stop on the airport. |
| 137 | src/data.js:59 | Add the radio: send planes away before you reach them. | Add the radio. Clear planes before you reach them. |
| 138 | src/data.js:60 | Add landing gear and flaps: both must be down to land. | Add gear and flaps. Both must be down to land. |
| 139 | src/data.js:61 | A short, easy flight: the last four rounds, one new control each round. | A short, easy flight. Four rounds, one new control each. |
| 140 | src/data.js:62 | Add the brakes: they set how fast you may touch down. | Add the brakes. They set your top landing speed. |
| 141 | src/data.js:78 | Your first flight is going well. The sun comes up over the frozen river. Perfect conditions for a smooth landing. | Sun rises over the frozen river. Good weather for a smooth landing. |
| 142 | src/data.js:79 | Lights shimmer along the river as you near the city. There is traffic at the end of your approach. Stay calm. | Night over the river. Planes crowd the approach. Stay calm. |
| 143 | src/data.js:80 | With the volcano behind you, make a wide left turn over the bay and line up with the runway that juts into the water. | Turn wide left over the bay. Line up with the runway on the water. |
| 144 | src/data.js:81 | The city is on your left and the long lake shimmers on your right. Keep an eye on your fuel. | City on your left, lake on your right. Watch your fuel. |
| 145 | src/data.js:82 | You break through the cloud over a hub packed with traffic. On top of that you have a nervous trainee to teach. | A busy airport sits under the cloud. A nervous trainee is aboard. |
| 146 | src/data.js:83 | Your skills are improving. Use special abilities to land safely among the spires of the old town. | Use your ability cards to land among the old town spires. |
| 147 | src/data.js:84 | Thick fog has filled the sky with jets circling the city. You need to be alert from the very start of your approach. | Thick fog and circling jets. Stay sharp from the start. |
| 148 | src/data.js:85 | The airport sits at the bottom of a ring of mountains. You must descend quickly and make a very tight final turn. | The airport sits in a ring of mountains. Drop fast and turn tight. |
| 149 | src/data.js:86 | The tower is not answering. A strong tail wind pushes you in too fast over the beach. Turn wide and control your speed. | The tower is silent. A tail wind pushes you in fast. Turn wide and watch speed. |
| 150 | src/data.js:87 | Low cloud, a white peninsula and a runway like a skating rink. Use a light touch. | Low cloud and an icy runway. Go gently. |
| 151 | src/data.js:88 | The sky is clear, the hills are beautiful, and an alarm sounds: you are losing fuel. Manage your speed and hope for luck. | Clear sky, but you are leaking fuel. Keep your speed steady. |
| 152 | src/data.js:89 | Electrical storms rumble ahead. Keep the plane in line between the storm cells. It will be a bumpy landing. | Storms ahead. Stay in line between the storm cells. |
| 153 | src/data.js:90 | It is the busiest travel day of the year, and a fuel leak means you must push through the traffic to make it in time. | A busy day with a fuel leak. Push through the traffic. |
| 154 | src/data.js:91 | The locals call them foothills; anywhere else they would be mountains. A narrow valley, thin air and the clock running. | A narrow valley and thin air. The clock is running. |
| 155 | src/data.js:92 | A festival fills the sky with planes and the air corridor is narrow. Your trainee is on board. Focus. | A festival fills the sky and the corridor is narrow. Your trainee is aboard. |
| 156 | src/data.js:93 | You are flying in at the tail end of a tropical cyclone: very high winds and a narrow corridor. Why are your palms so sweaty? | Strong winds from a passing cyclone and a narrow corridor. |
| 157 | src/data.js:94 | The runway is frozen solid and the fuel gauge has been low for half an hour. A hundred and fifty people depend on you. | The runway is frozen and fuel is low. 150 people are aboard. |
| 158 | src/data.js:95 | Landing here haunts your dreams. Drop to the left between the mountains and do whatever it takes. | A hard landing. Drop left between the mountains. |
| 159 | src/data.js:96 | You pierce the cloud into a blizzard. The runway lights shimmer dimly through the snow. Concentrate. Focus. Land. | A blizzard hides the runway. Stay focused and land. |
| 160 | src/data.js:97 | Lightning flashes all around. Getting to the airport will take every last ounce of your concentration, and time is against you. | Lightning all around, and time is short. Stay focused. |
| 161 | src/data.js:98 | The most dangerous airport on the map. The weather is clear, but only eight pilots are cleared to land here. Add your name to the list. | The hardest airport. The weather is clear. Only eight crews have landed here. |
| 162 | src/data.js:101 | When a round starts on a space with dice icons, roll the traffic die once per icon. Each roll adds a plane that many spaces ahead (counting your space as 1), at most to the airport. | At round start on a space with dice icons, roll the traffic die once per icon. Each roll adds a plane that many spaces ahead. Your space is 1. Never past the airport. |
| 163 | src/data.js:102 | It is checked on every space you leave, but not when you stand still. | It is checked when you leave a space, not when you stay put. |
| 164 | src/data.js:103 | Start at 20. Anyone may put a die of any value on the fuel space to burn that many units. A round with no die there burns 6 at the end. Below 0 you are out of fuel and lose. | Fuel starts at 20. Either seat may put any die on the fuel space to burn that much. No die there burns 6. Below 0 you lose. |
| 165 | src/data.js:104 | No fuel space. Every round, when both engine dice are down, you burn the difference between them plus 1. Below 0 you lose. | No fuel space. Each round you burn the engine dice difference plus 1. Below 0 you lose. |
| 166 | src/data.js:105 | A wind dial adds to your engine total every round, even the last. It starts at +3. After the axis is set each round, turn the dial by the axis tilt. | The wind dial adds to your engine total every round, even the last. It starts at +3. Each round, turn it by the axis tilt. |
| 167 | src/data.js:106 | Put any die on your trainee space to take the next token from your side and place it as a die of that value right away (not on Concentration, no coffee). The die must differ from the token. Train all six before you land. | Put any die on your trainee space. Take the next token from your side and place it as a die. Not on Coffee. The die must not match the token. Place all six before you land. |
| 168 | src/data.js:107 | The brakes become a four-column track (2, 3, 4, 5). The pilot (upper half) and either crew (lower half) must put dice showing the column number into the next column in the same round. All four must be done, and the last-round speed must be no more than the brake value reached. | Brakes become four columns: 2, 3, 4, 5. In one round, fill the next column with dice showing its number. Pilot takes the top, either seat the bottom. Finish all four. Last-round speed must not beat the brakes. |
| 169 | src/data.js:108 | When it runs out, unplaced dice are ignored. If both axis and both engine dice are not down, you lose. | When it runs out, unplaced dice are skipped. If Axis and Engines are not full, you lose. |
| 170 | src/data.js:111 | Each round, before placing a die, the first player may reroll one of their dice. | Each round, the first player may reroll one die before placing. |
| 171 | src/data.js:112 | Once per game each player may turn one of their unplaced dice to its opposite face (1 to 6, 2 to 5, 3 to 4). | Once a game, each player may flip one unplaced die to its opposite side (1-6, 2-5, 3-4). |
| 172 | src/data.js:113 | When both engine dice show the same value you gain a reroll token, if one is left in the box. | Matching engine dice earn a reroll token, if one is left. |
| 173 | src/data.js:114 | When both axis dice show the same value you gain a coffee token, if one is left. | Matching axis dice earn a coffee token, if one is left. |
| 174 | src/data.js:115 | Once a round, after you have a die on the landing gear and one on the flaps, roll the traffic die. The co-pilot places it on any empty space of either colour as an extra action. | Once a round, with a die on gear and one on flaps, roll the traffic die. Co-pilot places it on any empty space. |
| 175 | src/data.js:116 | Once a round either player may put an unplaced die here, and the other must too. Swap the two values, then take the dice back. | Once a round, you both put an unplaced die here. Swap the two values. Take the dice back. |
| 176 | campaign.json tutorial.steps.owners.say | Blue spaces are yours, orange are {rival}'s, grey take anyone. Pell is watching. | Blue spaces are yours. Orange are {rival}'s. Grey take anyone. |
| 177 | campaign.json tutorial.steps.goal.say | To pass: runway clear, gear and flaps down, wings level, speed under the brakes. | To pass: clear runway, gear and flaps down, wings level, speed within the brakes. |
| 178 | campaign.json tutorial.steps.roll.say | Plan out loud, never dice numbers. Pell is listening. Roll, then silence. | Plan out loud, never dice numbers. Then roll and stay quiet. |
| 179 | campaign.json tutorial.steps.radio.say | A plane waits on space {planeAt}: fly through it and we are gone. Your {d2} clears it. | A plane waits on space {planeAt}. Flying into it crashes us. Your {d2} clears it. |
| 180 | campaign.json tutorial.steps.engines.say | {en1} + your {d1} = {sumE}. Blue {aeroB}, orange {aeroO}: beat a marker and the plane moves. | {en1} + your {d1} = {sumE}. Beat a marker and the plane moves. |
| 181 | campaign.json tutorial.steps.coffee.say | Nothing else fits? Coffee takes any die and earns a token to nudge one by a pip. | Nothing else fits? Coffee takes any die and gives a token. |
| 182 | campaign.json tutorial.steps.flaps.say | Flaps are {rival}'s: four spaces, in order. Each flap or gear lifts a speed marker. | Flaps are {rival}'s. Four spaces, in order. Each flap or gear lifts a marker. |
| 183 | campaign.json tutorial.steps.rr1.say | Your {d0} cannot lower the last gear: it needs a 5 or 6. Spend the reroll token. | Your {d0} cannot lower the last gear. It needs a 5 or 6. Use the reroll token. |
| 184 | campaign.json tutorial.steps.rr3.say | Hold your breath. Roll the die once more. | Roll the die again. |
| 185 | campaign.json tutorial.coach.intro | Check ride, Captain. We win or crash together. Plan aloud, never say numbers. | Check ride, Captain. We win or crash together. Plan aloud, but never say numbers. |
| 186 | campaign.json tutorial.coach.turns | One die each, taking turns. Axis and engines must both be filled every round, or we lose. | One die each, taking turns. Fill Axis and Engines every round, or we lose. |
| 187 | campaign.json tutorial.coach.axis | Axis: the plane tips toward the higher die by the difference. A tilt of 3 is a spin and Pell wins. | Axis: the higher die tips the plane. A tilt of 3 is a spin. We lose. |
| 188 | campaign.json tutorial.coach.radio | A plane on the track is a collision. Radio clears the plane that many spaces ahead: yours counts from 1, {rival}'s from 2. | Leaving a space with a plane in it crashes us. Radio clears a plane ahead. Yours starts at 1, {rival}'s at 2. |
| 189 | campaign.json tutorial.coach.engines | Engines: both dice add up. Past blue {aeroB} the plane moves one space, past orange {aeroO} two. It must end on the airport, not past it. | Engines: both dice add up. Over blue {aeroB}, move one. Over orange {aeroO}, move two. Stop on the airport. |
| 190 | campaign.json tutorial.coach.gear | Landing gear takes 1-2, 3-4 or 5-6 in any order. Each gear lifts the blue marker. | Gear takes 1-2, 3-4 or 5-6 in any order. Each lifts the blue marker. |
| 191 | campaign.json tutorial.coach.flaps | Flaps are {rival}'s: 1-2, 2-3, 4-5, 5-6 in order. Each flap lifts the orange marker. | Flaps are {rival}'s. Play 1-2, 2-3, 4-5, 5-6 in order. Each lifts orange. |
| 192 | campaign.json tutorial.coach.brakes | Brakes need exactly 2, then 4, then 6, in order. They count only in the last round. | Brakes take exactly 2, then 4, then 6. They matter only in the last round. |
| 193 | campaign.json tutorial.coach.coffee | Coffee: any die earns a token. Spend tokens with the + and - buttons to nudge a die by one. | Coffee: any die gives a token. Use the + and - buttons to change a die by one. |
| 194 | campaign.json tutorial.coach.reroll | A reroll token: either of you may spend it, even on the other's turn. Pick the dice to roll again, or keep them. | Either of us can use a reroll token, even on the other's turn. Pick dice to roll again. |
| 195 | campaign.json tutorial.coach.rounds | Each round we drop 1000 ft. Reach the airport before the last round. | Each round we drop 1000 ft. Reach the airport before the last round. |
| 196 | campaign.json tutorial.coach.final | Landing round. No flying now: engine speed within the brake value, gear and flaps down, wings level. | Landing round. The plane stays put. Keep speed within the brakes, gear and flaps down, wings level. |
| 197 | campaign.json tutorial.later[1] | Corridor tabs: some strips make the axis match a marker (chapter 9). | Corridor tabs: some strips need the axis to match a marker (chapter 9). |
| 198 | campaign.json tutorial.later[3] | Wind dial, trainee tokens, icy runway, the 60-second clock (chapters 11 to 15). | Wind dial, trainee tokens, icy runway and a 60-second clock (chapters 11 to 15). |
| 199 | campaign.json tutorial.later[5] | A die that fits nowhere is thrown away and counts as your turn. | A die that fits nowhere is put aside. It counts as your turn. |
| 200 | campaign.json tutorial.rounds[0] | Round 1 of 4: axis and engines. Each of us fills both. Spare dice earn coffee. | Round 1 of 4: Axis and Engines. We each fill both. Spare dice earn coffee. |
| 201 | campaign.json tutorial.rounds[3] | Round 4: landing. The plane stops. Speed must not beat the brakes. | Round 4: landing. The plane stops. Speed must stay within the brakes. |
| 202 | campaign.json tutorial.end.text | Axis, engines, radio, gear, flaps, brakes, coffee, rerolls: flight school is yours. | You now know axis, engines, radio, gear, flaps, brakes, coffee and rerolls. |
| 203 | campaign.json chapters c3 intro | Planes wait on the approach. Leaving a space with a plane in it is a collision. | Planes wait on the approach. Leaving a space with a plane in it crashes us. |
| 204 | campaign.json chapters c8 intro | Put any die on the fuel space to burn that much. Skip it and we burn 6 at the end of the round. | Any die on the fuel space burns that much. Skip it and we burn 6. |
| 205 | campaign.json chapters c8 goal | Land at Lake Orrin without the fuel dropping below 0. | Land at Lake Orrin with fuel above 0. |
| 206 | campaign.json chapters c9 goal | Land at Seabright Bay, matching the axis to every corridor tab you fly past. | Land at Seabright Bay. Match the axis to every corridor tab. |
| 207 | campaign.json chapters c10 intro | Castlemoor gives us two crew cards. Pick ones that save dice, not ones that look exciting. | Castlemoor gives us two crew cards. Pick ones that save dice. |
| 208 | campaign.json chapters c12 goal | Land at Bowlrock: a 5-space dive, three tilt tabs and fuel above 0. | Land at Bowlrock. Five spaces, three tilt tabs, fuel above 0. |
| 209 | campaign.json chapters c14 goal | Land at Palmreach with the tail wind, with only one reroll token on the whole track. | Land at Palmreach in a tail wind. Only one reroll token on the track. |
| 210 | campaign.json chapters c15 goal | Land at Cloudspire against the clock, with fuel above 0 and every plane cleared. | Land at Cloudspire on the clock. Fuel above 0, every plane cleared. |

ROWS: 210
