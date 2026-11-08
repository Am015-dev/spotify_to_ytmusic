# Copy fixes: Shipwreck Isle
Date: 2026-11-08

## Goal card

Not one sentence yet. The Marooned goal card (data.js, scenario text `x`) is three sentences with a staging recipe:

> Keep a signal fire ready. Build Fire and stack a 15-wood signal pile (1, then 2, 3, 4, 5 wood, one stage a round). Have both in round 10, 11 or 12 and a ship sees you.

Fixed: **Light a fire and stack a 15-wood signal pile by day 12.** Stranded Friend and Settlers need the same treatment (rows 2 and 3 below). The Hexed Isle goal is already one sentence. The staging detail stays on the planning card (the pile button) and in the Rules.

## Fixes

| file:line | old line | new line |
|---|---|---|
| data.js:92 | Keep a signal fire ready. Build Fire and stack a 15-wood signal pile (1, then 2, 3, 4, 5 wood, one stage a round). Have both in round 10, 11 or 12 and a ship sees you. | Light a fire and stack a 15-wood signal pile by day 12. |
| scen.js:3 | Your shipmate Ada is stuck on a rock off the coast. Build the Rescue Raft, row out to bring her back (an explore action), then build the Lifeboat. Do both to win. If Ada dies, you lose. | Rescue Ada, then build the Lifeboat. If Ada dies, you lose. |
| scen.js:8 | No rescue is coming, so make a home. Build a shelter, get roof, palisade and weapon to 1 or more, and make all 9 inventions dealt at the start. Children arrive in rounds 7, 9 and 11: each eats 1 food a night, and if a child goes hungry you lose. | Build a home: shelter, roof, palisade, weapon and all 9 inventions. |
| scen.js:19 | signal pile ${G.sc.pile}/15 · rescue possible in rounds 10–12 | signal pile ${G.sc.pile}/15 · ship may come days 10–12 |
| scen.js:30 | A dark temple stands here. An explore action on this tile can search it once (4 mystery cards: up to 3 treasures and 1 creature). | A dark temple. Explore here once to search it. |
| scen.js:6 | Lets you row out to rescue Ada (an explore action; a "?" means a wound, not an adventure). | Row out to rescue Ada. A "?" die means a wound. |
| scen.js:47 | ⛵ Ada is safe in camp! She can only rest, but she eats and feels the weather like everyone. | ⛵ Ada is safe! She can only rest, and she needs food. |
| campaign.json:128 | Marooned: have Fire and a full 15-wood signal pile in round 10, 11 or 12. | Light a fire and stack 15 signal wood by day 12. |
| campaign.json:257 | Settlers: shelter, roof, palisade and weapon at 1+, and all 9 dealt inventions within 12 rounds. | Build a home: shelter, roof, palisade, weapon and all 9 inventions. |
| campaign.json:285 | Stranded Friend: rescue Ada with the Rescue Raft and build the Lifeboat within 8 rounds. | Rescue Ada, then build the Lifeboat, within 8 rounds. |
| campaign.json:206 | The Hexed Isle: raise a cross on five different tiles within 10 rounds. | Raise crosses on five different tiles within 10 rounds. |
| campaign.json:100 | Have 4 island tiles explored (3 new ones) before the end of day 6. | Explore 3 new tiles before the end of day 6. |
| campaign.json:205 | Boss rule: the Grey Shroud starts with an event card already in the left threat slot. It fires on day 2 unless you deal with it. | Boss: a threat starts early. Deal with it by day 2. |
| campaign.json:114 | Build Fire, then stack the signal pile: 1, 2, 3, 4, 5 wood, one stage a day. Fifteen in all. | Build Fire, then stack 15 wood in stages: 1, 2, 3, 4, 5. |
| tutor.js:37 | Our ship is gone. Light a fire and stack 15 wood by day 12: a ship will see it. Pick a pawn, then a glowing place. | Light a fire, stack 15 wood by day 12. Tap a pawn first. |
| tutor.js:39 | One pawn alone rolls dice and can fail or get hurt. A second pawn makes it sure. | One pawn rolls dice and may fail. Two pawns never fail. |
| tutor.js:46 | Poor move: no shelter and no build planned. Tonight everyone takes a wound. | No shelter planned. Everyone gets a wound tonight. |
| tutor.js:47 | Poor move: food is short for tonight and nobody gathers. Hunger costs 2 wounds. | Food is short tonight and nobody gathers. Hunger costs 2 wounds. |
| tutor.js:49 | 'The island moves: “'+ccard(b&&b.data&&b.data.card)+'”. Its effect happens now, then it waits as a threat.' | 'New event: “'+ccard(b&&b.data&&b.data.card)+'”. It hits now, then waits as a threat.' |
| tutor.js:50 | A threat sits at camp. Deal with it in time, or the card strikes. | A threat waits at camp. Deal with it soon, or it strikes. |
| tutor.js:51 | Morale moves our determination each morning. Low morale costs wounds. | Morale sets our determination each morning. Low morale hurts. |
| tutor.js:55 | Night: everyone eats 1 food (or takes 2 wounds). No shelter means a wound each. | Everyone eats 1 food or takes 2 wounds. No shelter: 1 wound each. |
| tutor.js:57 | We have determination ✊. Open the Camp tab and use a skill: once per round, and it can turn a bad roll. | Spend ✊ on a skill in the Camp tab. Skills can fix rolls. |
| tutor.js:79 | Here is how it scored, rule by rule: | Here is your score: |
| tutor.js:79 | Here is how the goal stands, rule by rule: | Here is how you are doing: |
| hlp.js:63 | Meet your chapter\'s goal before the last day. If any castaway dies, everyone loses. | Reach your goal before the last day. If anyone dies, all lose. |
| hlp.js:64 | Plan a job for every pawn, then watch the day play out. Night brings hunger and weather. | Give every pawn a job, then watch the day play out. |
| hlp.js:65 | One pawn on a job rolls dice and can fail. Add a second pawn to make it sure. | One pawn rolls dice and can fail. Two pawns are sure. |
| hlp.js:66 | Tap a glowing place to send the castaway there. Tap a place with one job to place it at once. | Tap a glowing place to send the castaway there. |
| hlp.js:67 | A lone pawn rolls dice and may fail or get hurt. Two pawns on a job never roll. | A lone pawn may fail or get hurt. Two pawns never roll. |
| hlp.js:68 | A place two steps from camp needs one extra pawn. Explore unknown places to reveal new land. | Places two steps from camp need one extra pawn. |
| hlp.js:70 | Chips on the island show each job: a tick is sure, a die rolls, red needs more pawns. | Tick: sure. Die: rolls. Red: needs more pawns. |
| hlp.js:73 | A warning means something may go wrong tonight, such as hunger. Go back to fix it, or start anyway. | Something may go wrong tonight, like hunger. Fix it or start anyway. |
| hlp.js:74 | At night everyone eats 1 food. A hungry castaway takes 2 wounds. Plan food every day. | Everyone eats 1 food at night. Hungry castaways take 2 wounds. |
| hlp.js:75 | The game asks where. Tap one of the glowing places on the island to choose it. | Tap a glowing place on the island to choose it. |
| hlp.js:76 | A fogged place needs one extra pawn and hides its land. Pick a place you need least. | Fog adds one pawn to a place. Pick one you need least. |
| hlp.js:77 | Tap one button. Read the card text first: it explains what each option does. | Read the card, then tap one button. |
| hlp.js:78 | Each castaway can take wounds until their life runs out. Protect the hurt ones. | Each wound costs a life. Protect hurt castaways. |
| hlp.js:79 | Tick: the job worked. Blood drop: a wound. Question mark: you draw an adventure card. | Tick: success. Drop: wound. ?: adventure card. |
| hlp.js:80 | You may keep the roll, or use an item or skill to roll a die again. | Keep the roll, or use an item or skill to reroll a die. |
| hlp.js:84 | This shows what changed and why. Check your food, wood and the castaways\' life. | See what changed and why. Check food, wood and life. |
| hlp.js:86 | An event card comes each morning. Its threat waits in a slot and strikes later unless you send pawns. | Each morning brings an event. Send pawns to stop its threat. |
| hlp.js:87 | Each morning the first player gains or loses determination, which pays for skills. Low morale costs it, then wounds. | Morale gives or takes the first player's determination each morning. |
| hlp.js:90 | Tick: the job worked. Blood drop: a wound. Question mark: an adventure card. Two pawns mean no dice. | Tick: success. Drop: wound. ?: adventure card. Two pawns skip dice. |
| hlp.js:91 | Each cloud above your roof ruins 1 food and 1 wood. Snow also needs 1 wood each to keep warm. | Each cloud above your roof ruins 1 food and 1 wood. |
| hlp.js:93 | Everyone eats 1 food. Anyone hungry takes 2 wounds. Without a shelter, everyone takes 1 wound. | Hungry castaways take 2 wounds. No shelter: 1 wound each. |
| hlp.js:94 | Build a shelter on day 1 or 2. It costs 2 wood and spares everyone a wound each night. | Build a shelter early. It costs 2 wood and stops night wounds. |
| flow.js:4 | A new event card is turned over. It can hurt you now, and it stays as a threat you can deal with later. | A new event card hits now, then waits as a threat. |
| flow.js:5 | An event card is turned over. It may do something right away, and then it waits as a threat. Ignored threats strike two days later. | Events hit now, then wait as threats. Ignored threats strike later. |
| flow.js:6 | Good morale gives the first player determination (used for skills). Bad morale takes it away. | Good morale gives the first player determination. Bad morale takes it. |
| flow.js:7 | The camp’s mood is checked. Above 0 the first player (★) gains that much determination; below 0 they lose it. | The first player (★) gains or loses determination equal to morale. |
| flow.js:12 | The jobs are done one at a time. Certain jobs always work; the others roll dice. | Jobs happen one at a time. Sure jobs work; others roll dice. |
| flow.js:13 | Your jobs are done one at a time, in this order. A job with enough pawns is certain. A job with fewer pawns rolls 3 dice: it can fail, hurt, or start an adventure. | Jobs run one at a time. Short-staffed jobs roll dice. |
| flow.js:15 | The weather dice are rolled. Every cloud above your roof ruins 1 food and 1 wood (or costs a wound if you have none). | Every cloud above your roof ruins 1 food and 1 wood. |
| flow.js:17 | Everyone eats 1 food. Anyone left hungry loses 2 life. Without a shelter everyone loses 1 life. Fresh food spoils. | Everyone eats 1 food. Hunger costs 2 life. No shelter costs 1. |
| flow.js:93 | Only ${lifeOf(G,nd)} life left. Resting heals 1. If anyone dies, you all lose. | Only ${lifeOf(G,nd)} life left. Rest heals 1. |
| flow.js:94 | You need ${eaters} food tomorrow night and can count on only ${have+pf}. Hungry castaways lose 2 life each. | Tomorrow night needs ${eaters} food; you have ${have+pf}. Hunger costs 2 life. |
| flow.js:95 | A shelter costs ${tb.wood} wood (you have ${G.res.wood}). Without one everyone loses 1 life every night. | Shelter costs ${tb.wood} wood (have ${G.res.wood}). Without it, all lose 1 life. |
| flow.js:96 | A beast attacks at dawn. Every point it is stronger than your weapon is a wound. | A beast attacks at dawn. Each point past your weapon is a wound. |
| flow.js:97 | Tomorrow brings ${wx.filter(d=>d!=='animals').length} weather dice and your roof is ${G.camp.roof}. Every cloud above it ruins food and wood. | ${wx.filter(d=>d!=='animals').length} weather dice are coming and your roof is ${G.camp.roof}. |
| plan-ui.js:5 | The day is being told on the island, on everyone’s screen at once. The first player ★ steps through it with <b>Continue</b>. | The first player ★ taps <b>Continue</b> to step through the day. |
| plan-ui.js:5 | The day is being told on the island. Step through it with <b>Continue</b> (or Enter), or turn on <b>Play by itself</b>. | Tap <b>Continue</b> (or Enter) to step through, or use <b>Play by itself</b>. |
| plan-ui.js:44 | Keep everyone alive: food for every night (fish and birds on the map), and rest anyone low on life. | Keep everyone alive: feed them nightly and rest the hurt. |
| plan-ui.js:44 | Build the <b>Shelter</b> (a job in Build). It costs wood, so gather wood first, and put 2 pawns on it to make it certain. | Build the <b>Shelter</b>. Gather wood first; 2 pawns make it sure. |
| plan-ui.js:44 | Send pawns to the ❔ places next to the land you know (Explore). Two pawns make it certain. | Explore ❔ places next to known land. Two pawns make it sure. |
| plan-ui.js:111 | One pawn fewer than sure: the dice decide. Add 1 more pawn for a sure success. A failure gives the leader 2 determination. | Dice decide. Add 1 pawn to be sure. A failure gives 2 determination. |
| plan-ui.js:130 | 1 pawn rolls the dice (it may fail or hurt); 1 more pawn makes it sure. Places 2 steps from camp need +1 pawn. Numbers are the places on the map. | 1 pawn rolls dice; 2 pawns are sure. Far places need +1 pawn. |
| plan-ui.js:130 | Building rolls the dice with 1 pawn (4-in-6 wound risk!); 2 pawns make it sure. | One pawn rolls dice and risks a wound. Two pawns are sure. |
| plan-ui.js:130 | Threat cards strike at the next dawn if they are still in the left slot. Dealing with one needs no dice. | The left threat strikes next dawn. Dealing with it needs no dice. |
| plan-ui.js:126 | your weapon ${G.weapon} against its strength: each point short is a wound · gives food and fur | each point over your weapon (${G.weapon}) wounds you · gives food and fur |
| ui.js:45 | Days. Dots under a day are its weather dice: orange = rain die, white = winter die, red = hungry-animals die | Days. Dots show weather dice: orange rain, white winter, red hungry animals. |
| ui.js:50 | Morale (−3 to +3): below 0 the first player loses that much ✊ determination each morning; above 0 they gain it | Morale (−3 to +3): first player gains or loses that much ✊ daily. |
| ui.js:113 | First player: pays for low morale each morning and faces event cards first. The role passes on every day. | First player: takes morale effects and event cards first. Passes on daily. |
| ui.js:61 | Give every pawn a job following today’s needs (H). You can change anything. | Give every pawn a job. You can change any of them. |
| ui.js:143 | Plan food every day: the 🍖 priority says how much you need. Threat rewards like the crates count too. | Plan food every day. The 🍖 priority shows how much. |
| ui.js:237 | ✨ Every pawn has a job now. Check the risk of each one below, and change anything you like. | ✨ Every pawn has a job. Check the risks below and change anything. |
| rules-html.js:11 | You are castaways on a wild island. Everyone wins or loses together. Finish the scenario's goal before the last round ends, and keep every castaway alive: if anyone dies (Friday aside), you all lose. | Finish the goal before the last round and keep every castaway alive. |
| rules-html.js:7 | The jobs play out one by one: you see each result as it happens. | Jobs play out one by one. |
| text.js:4 | a "?" marker (the next time anyone does it, it also triggers an adventure card) | a "?" marker (next time, it also draws an adventure card) |
| text.js:45 | a fever: 2 wounds per castaway land tonight | a fever: every castaway takes 2 wounds tonight |

Lines fixed: 80
