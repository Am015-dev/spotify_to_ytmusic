// ===================== Short Fuse: game data =====================
// A cartoon demolition crew defuses rigged charges. Mechanics follow the published co-op game exactly;
// every name and text here is our own.
const GAME_TITLE='Short Fuse';
// ---------- wires: 48 blue (1-12 x4), 11 red (x.5), 11 yellow (x.1). The decimals only sort the stands. ----------
const WIRES=[];
for(let v=1;v<=12;v++)for(let k=0;k<4;k++)WIRES.push({id:WIRES.length,c:'b',v,s:v});
for(let v=1;v<=11;v++)WIRES.push({id:WIRES.length,c:'r',v:null,s:v+0.5});
for(let v=1;v<=11;v++)WIRES.push({id:WIRES.length,c:'y',v:null,s:v+0.1});
const WIRE_COUNT=WIRES.length; // 70
const RED_IDS=WIRES.filter(w=>w.c==='r').map(w=>w.id),YEL_IDS=WIRES.filter(w=>w.c==='y').map(w=>w.id);
// info tokens: 2 per number 1-12 plus 2 yellow (26). Validation tokens: one per number.
const INFO_TOKENS={1:2,2:2,3:2,4:2,5:2,6:2,7:2,8:2,9:2,10:2,11:2,12:2,Y:2};
const DIAL_MAX=6; // the extra segment beyond the 5-player start
// ---------- equipment (18 cards). unlock: v = value, n = wires of it that must be cut ----------
// timing: any (any seat, any time the crew is not mid-resolution), turn (active seat, as part of its action),
// start (active seat, before its action), instant (fires by itself on unlock)
const EQUIP={
 eq1:{n:'Odd-Pair Clip',v:1,need:2,timing:'any',pool:'base',kind:'tag',
   text:'Clip the odd-pair clip between two side-by-side wires on your stand. Their values differ. One of them may already be cut. Two reds, or two yellows, count as the same value, so they never take this clip.'},
 eq2:{n:'Swap Bag',v:2,need:2,timing:'any',pool:'base',kind:'swap',
   text:'Swap one uncut wire with a crewmate, face down both ways. Each of you files the new wire in sorted order. A two-stand player uses the stand the old wire left. Any colour goes. Everyone sees which slots changed. A token in front of a swapped wire travels with it.'},
 eq3:{n:'Fork Tester',v:3,need:2,timing:'turn',pool:'base',kind:'probe',
   text:'Spend your dual cut on it. Name a number and point at three wires on one crewmate stand. If any of them matches, they cut one match and keep quiet about the rest. No match: the fuse burns one step and they tag one of the three with its real value.'},
 eq4:{n:'Chalk Mark',v:4,need:2,timing:'any',pool:'base',kind:'note',
   text:'Choose one of your own blue wires. Put an info token in front of it, showing its real value.'},
 eq5:{n:'Stand Scanner',v:5,need:2,timing:'turn',pool:'base',kind:'probe',
   text:'Spend your dual cut on it. Name a number and point at a crewmate\'s whole stand. If anything there matches, they cut one match and say nothing more. No match: the fuse burns one step and they tag any wire they like.'},
 eq6:{n:'Fuse Pinch',v:6,need:2,timing:'any',pool:'base',kind:'dial',text:'Pinch the fuse: it goes back one step.'},
 eq7:{n:'Spare Batteries',v:7,need:2,timing:'any',pool:'base',kind:'recharge',text:'Fresh batteries for one or two crew members whose personal tool is spent. Each may use it once more this job.'},
 eq8:{n:'Roll Call',v:8,need:2,timing:'any',pool:'base',kind:'sweep',
   text:'Call out a number. Every crew member answers yes or no, you included. Yes means at least one uncut blue wire of it. Two-stand players answer per stand. Nobody says how many or where. Red and yellow never count.'},
 eq9:{n:'Blast Blanket',v:9,need:2,timing:'start',pool:'base',kind:'damper',
   text:'Throw it over the bomb before your action. If your dual cut misses this turn, the fuse does not burn. A red does not go off either. A wrong non-red wire still gets its token; a red one gets none.'},
 eq10:{n:'Either-Or Meter',v:10,need:2,timing:'turn',pool:'base',kind:'probe2',
   text:'Spend your dual cut on it. Name two values for one wire, yellow allowed; you must hold both. If the wire is either one, it works and you cut your matching wire. The crew then knows you hold the other value too. It stacks with the two-prong, fork or stand tester.'},
 eq11:{n:'Hand-Off',v:11,need:2,timing:'turn',pool:'base',kind:'coffee',text:'Skip your action and hand the turn to anyone, without talking it over. Play goes on clockwise from them.'},
 eq12:{n:'Twin Clip',v:12,need:2,timing:'any',pool:'base',kind:'tag',
   text:'Clip the twin clip between two side-by-side wires on your stand. They share a value. One may already be cut. Any two reds match, and so do any two yellows.'},
 eqY:{n:'False Bottom',v:'Y',need:2,timing:'instant',pool:'yellow',kind:'more',
   text:'As soon as it unlocks, two more gear cards come into this job. They unlock at once if their values are already cut.'},
 eq22:{n:'Only-One Pin',v:2,need:4,timing:'any',pool:'double',kind:'lone',
   text:'Pick one of your blue wires, cut or uncut. Put a x1 token in front of it: that value shows up only once on that stand, cut wires included.'},
 eq33:{n:'Van Restock',v:3,need:4,timing:'instant',pool:'double',kind:'refresh',text:'As soon as it unlocks, every used gear card turns face up again. Each works once more.'},
 eq99:{n:'Pair Snip',v:9,need:4,timing:'turn',pool:'double',kind:'express',text:'Solo-cut two matching wires from your hand. Others of that value may still be out there.'},
 eq1010:{n:'Number Purge',v:10,need:4,timing:'instant',pool:'double',kind:'vapor',
   text:'As soon as it unlocks, draw a random info token from the supply. Everyone cuts every uncut wire of that number they hold.'},
 eq1111:{n:'Long Grabber',v:11,need:4,timing:'any',pool:'double',kind:'hook',
   text:'Point at a crewmate\'s uncut wire and pull it, unseen, into your own hand in sorted order. A two-stand player picks the stand. Everyone sees where it left and where it landed.'}
};
const EQ_IDS=Object.keys(EQUIP);
// ---------- characters and personal tools ----------
const ITEMS={
 dd:{n:'Two-Prong Tester',timing:'turn',text:'Spend your dual cut on it. Name a number (never yellow). Point at two wires on one crewmate stand. It works if either matches. If both do, they quietly pick one. If neither matches, the fuse burns one step. They tag one of the two. If exactly one is red, nothing goes off. The tag goes on the other. If both are red, boom.'},
 sweep:{n:'Pocket Roll Call',timing:'any',text:'Your own copy of the Roll Call card.'},
 handsets:{n:'Pocket Swap Bag',timing:'any',text:'Your own copy of the Swap Bag card.'},
 pt3:{n:'Pocket Fork Tester',timing:'turn',text:'Your own copy of the Fork Tester card.'},
 pt10:{n:'Pocket Either-Or Meter',timing:'turn',text:'Your own copy of the Either-Or Meter card.'}
};
const CHARS={
 ch_captain:{n:'Foreman Brix',item:'dd',captain:true,from:1,text:'Runs the job: goes first and settles setup choices.'},
 ch_base1:{n:'Wren',item:'dd',from:1,text:'Rigger with steady hands.'},
 ch_base2:{n:'Pike',item:'dd',from:1,text:'Wrecking-ball operator.'},
 ch_base3:{n:'Moss',item:'dd',from:1,text:'Tunnel and trench specialist.'},
 ch_base4:{n:'Tally',item:'dd',from:1,text:'Keeps the count on every charge.'},
 ch_new1:{n:'Hark',item:'sweep',from:32,newc:true,text:'Has ears like a bat and a pocket roll call.'},
 ch_new2:{n:'Dot',item:'handsets',from:32,newc:true,text:'Trades anything, keeps a swap bag on the belt.'},
 ch_new3:{n:'Spike',item:'pt3',from:32,newc:true,text:'Never lends out the fork tester.'},
 ch_new4:{n:'Iris',item:'pt10',from:32,newc:true,text:'Squints at a wire and sees two numbers.'}
};
// structure of the job list: new crew from job 32, the False Bottom card from job 7, double gear from job 50
const NEWCHAR_FROM=32,YEQ_FROM=7,DOUBLE_EQ_FROM=50;
const BASE_CHARS=['ch_captain','ch_base1','ch_base2','ch_base3','ch_base4'];
// ---------- constraint cards A-L. A cut value V is 1-12 or 'Y' (yellow has no number: it breaks A-E, passes F) ----------
const CONSTRAINTS={
 A:{n:'Even Keel',text:'You may only cut even values.',val:v=>v!=='Y'&&v%2===0},
 B:{n:'Odd Job',text:'You may only cut odd values.',val:v=>v!=='Y'&&v%2===1},
 C:{n:'Low Road',text:'You may only cut values 1 to 6.',val:v=>v!=='Y'&&v<=6},
 D:{n:'High Road',text:'You may only cut values 7 to 12.',val:v=>v!=='Y'&&v>=7},
 E:{n:'Middle Lane',text:'You may only cut values 4 to 9.',val:v=>v!=='Y'&&v>=4&&v<=9},
 F:{n:'Mind the Gap',text:'You may not cut values 4 to 9.',val:v=>v==='Y'||v<4||v>9},
 G:{n:'Gloves Off',text:'You may not use equipment cards or your personal tool.',noTools:true},
 H:{n:'Hush',text:'No token is placed when your cut misses. Same when a cut aimed at your hand misses. Never cut a wire that has a token in front. Never use the Chalk Mark.',silent:true},
 I:{n:'Top Shelf Off',text:'You may not cut the right-most uncut wire of a crewmate\'s stand.',noRight:true},
 J:{n:'Bottom Shelf Off',text:'You may not cut the left-most uncut wire of a crewmate\'s stand.',noLeft:true},
 K:{n:'Buddy System',text:'You may not solo cut.',noSolo:true},
 L:{n:'Short Temper',text:'If your cut misses, the fuse burns two steps instead of one.',double:true}
};
const CON_IDS=Object.keys(CONSTRAINTS);
// ---------- challenge cards 1-10 (met: discard it and turn the fuse back one step) ----------
const CHALLENGES={
 1:{n:'Spot the Red',text:'Use this instead of a normal action. Point at a crewmate\'s wire and say "red". If it is red, it is revealed and this is met. If not, boom.'},
 2:{n:'Even Run',text:'Four turns in a row each cut an even value.'},
 3:{n:'Lonely Pairs',text:'On one stand the uncut wires form only separate pairs. Groups of exactly two side by side, split by cut wires.'},
 4:{n:'Sum to 18',text:'The first three validation tokens placed add up to 18.'},
 5:{n:'Solo Double',text:'Two turns in a row are solo cuts.'},
 6:{n:'Five Islands',text:'On one stand, at least five uncut wires each sit alone. Each has cut wires or a stand end on both sides.'},
 7:{n:'Steps',text:'Cut consecutive values on three turns in a row. Go up or down, like 8, 9, 10.'},
 8:{n:'Called Numbers',text:'Two number cards are placed on this when it is drawn. Met if the first two validation tokens are exactly those values.'},
 9:{n:'All Odd',text:'One stand holds only odd uncut blue wires. There are at least six of them. Red and yellow are ignored.'},
 10:{n:'Bare Middle',text:'On one stand, at least seven wires are cut. Both end wires are still uncut.'}
};
// ---------- the final job's bunker: 3 columns x 4 rows per floor (r,c are 0-based). Walls are between squares. ----------
const BUNKER={
 floors:[
  {name:'Ground floor',start:[3,0],stairs:[0,0],squares:{'0,1':'guard','2,2':'key','2,0':'bushes','3,0':'chopper','0,0':'stairs'},
   walls:['0,0|0,1','1,0|2,0','1,1|2,1'],door:'1,2|2,2'},
  {name:'Basement',stairs:[0,0],squares:{'0,0':'stairs','0,1':'trap','0,2':'lever','2,0':'trap','2,2':'trap','3,0':'doctor'},
   walls:['0,0|0,1'],laser:['1,0|2,0','1,1|2,1','1,2|2,2']}],
 action:{guard:1,key:1,lever:1,doctor:1}
};
// ---------- numeric setup of every job (wire mix, 2-player box, fuse start, equipment swaps), generated by tools/gen_setup.js ----------
const MISSION_SETUP=[
{"n":1,"blue":7,"eq":{"n":0}},
{"n":2,"blue":9,"yel":{"m":"exact","n":4,"cand":[1.1,8.1]},"eq":{"n":0}},
{"n":3,"blue":11,"red":{"m":"exact","n":1,"cand":[2.5,10.5]},"eq":{"ex":["eq11","eq7"]}},
{"n":4,"red":{"m":"exact","n":1,"cand":[1.5,6.5]},"yel":{"m":"exact","n":2,"cand":[5.1,11.1]},"two":{"red":{"m":"exact","n":2},"yel":{"m":"exact","n":4}}},
{"n":5,"red":{"m":"of","n":1,"of":2},"yel":{"m":"exact","n":2},"two":{"red":{"m":"of","n":2,"of":3},"yel":{"m":"exact","n":4}}},
{"n":6,"red":{"m":"of","n":1,"of":2},"yel":{"m":"of","n":2,"of":4},"two":{"red":{"m":"of","n":2,"of":3}}},
{"n":7,"red":{"m":"of","n":1,"of":3},"two":{"red":{"m":"of","n":2,"of":3}},"eq":{"ex":["eq6"]}},
{"n":8,"red":{"m":"of","n":1,"of":2},"yel":{"m":"exact","n":4},"two":{"red":{"m":"of","n":2,"of":3}}},
{"n":9,"yel":{"m":"of","n":2,"of":3}},
{"n":10,"red":{"m":"exact","n":1},"yel":{"m":"exact","n":2},"two":{"red":{"m":"exact","n":2},"yel":{"m":"exact","n":4}}},
{"n":11,"red":{"m":"exact","n":2},"yel":{"m":"exact","n":2},"two":{"red":{"m":"exact","n":3},"yel":{"m":"exact","n":4}},"eq":{"n":0,"fixed":["eq8"]}},
{"n":12,"red":{"m":"exact","n":2},"two":{"red":{"m":"exact","n":3}}},
{"n":13,"red":{"m":"exact","n":1},"yel":{"m":"of","n":2,"of":4},"timer":{"s":668}},
{"n":14,"red":{"m":"exact","n":1},"yel":{"m":"exact","n":2},"two":{"red":{"m":"exact","n":2},"yel":{"m":"exact","n":4}},"chars":"random_deal"},
{"n":15,"red":{"m":"of","n":1,"of":2},"two":{"red":{"m":"of","n":2,"of":3}},"eq":{"ex":["eq11"]},"timer":{"s":780,"s2":660}},
{"n":16,"red":{"m":"exact","n":2},"yel":{"m":"exact","n":4},"two":{"red":{"m":"exact","n":3}}},
{"n":17,"red":{"m":"exact","n":2},"yel":{"m":"exact","n":2},"two":{"red":{"m":"exact","n":3},"yel":{"m":"exact","n":4}},"eq":{"ex":["eq6"]},"chars":"no_personal_items"},
{"n":18,"red":{"m":"exact","n":1},"yel":{"m":"exact","n":4},"two":{"red":{"m":"exact","n":2}}},
{"n":19,"red":{"m":"exact","n":1},"yel":{"m":"fixed","vals":[2.1,6.1,9.1,11.1],"n":4}},
{"n":20,"red":{"m":"of","n":1,"of":2},"yel":{"m":"exact","n":2},"two":{"red":{"m":"of","n":2,"of":3},"yel":{"m":"exact","n":4}},"eq":{"ex":["eq2"]}},
{"n":21,"red":{"m":"exact","n":1},"yel":{"m":"exact","n":2},"two":{"red":{"m":"exact","n":2},"yel":{"m":"exact","n":4}}},
{"n":22,"red":{"m":"exact","n":2},"two":{"red":{"m":"exact","n":3}}},
{"n":23,"red":{"m":"exact","n":3,"deal":"one_per_player_from_captain"},"yel":{"m":"exact","n":4},"two":{"capNoInfo":1}},
{"n":24,"red":{"m":"exact","n":1},"yel":{"m":"exact","n":2}},
{"n":25,"red":{"m":"exact","n":2},"yel":{"m":"exact","n":2},"two":{"red":{"m":"exact","n":3},"yel":{"m":"exact","n":4}}},
{"n":26,"red":{"m":"of","n":1,"of":2},"yel":{"m":"exact","n":4},"two":{"red":{"m":"of","n":2,"of":3}}},
{"n":27,"red":{"m":"exact","n":3}},
{"n":28,"red":{"m":"exact","n":2},"yel":{"m":"exact","n":2},"two":{"red":{"m":"exact","n":3},"yel":{"m":"exact","n":4}}},
{"n":29,"red":{"m":"of","n":2,"of":3},"yel":{"m":"exact","n":3,"deal":"one_per_player_from_captain"},"two":{"yel":{"m":"exact","n":3,"deal":"one_per_player_from_captain_captain_gets_2"}},"chars":"no_personal_items"},
{"n":30,"red":{"m":"exact","n":1},"two":{"red":{"m":"exact","n":2}},"eq":{"ex":["eq11"]}},
{"n":31,"red":{"m":"exact","n":2},"yel":{"m":"exact","n":2},"two":{"red":{"m":"exact","n":3},"yel":{"m":"exact","n":4}}},
{"n":32,"red":{"m":"exact","n":1},"yel":{"m":"exact","n":2},"two":{"red":{"m":"exact","n":2},"yel":{"m":"exact","n":4}},"chars":"random_deal"},
{"n":33,"red":{"m":"exact","n":1},"yel":{"m":"exact","n":2},"two":{"red":{"m":"exact","n":2},"yel":{"m":"exact","n":4}},"chars":"captain_has_none"},
{"n":34,"red":{"m":"exact","n":2},"yel":{"m":"exact","n":2},"two":{"red":{"m":"exact","n":3},"yel":{"m":"exact","n":4}}},
{"n":35,"red":{"m":"exact","n":2},"yel":{"m":"exact","n":2},"two":{"red":{"m":"exact","n":3},"yel":{"m":"exact","n":4}}},
{"n":36,"red":{"m":"exact","n":1},"yel":{"m":"exact","n":2},"two":{"red":{"m":"exact","n":2},"yel":{"m":"exact","n":4}},"eq":{"ex":["eq2"]}},
{"n":37,"red":{"m":"exact","n":2},"yel":{"m":"exact","n":2}},
{"n":38,"red":{"m":"exact","n":1},"yel":{"m":"exact","n":2},"two":{"red":{"m":"exact","n":2},"yel":{"m":"exact","n":4}}},
{"n":39,"red":{"m":"exact","n":1},"yel":{"m":"exact","n":2},"two":{"red":{"m":"exact","n":2},"yel":{"m":"exact","n":4}},"eq":{"n":0}},
{"n":40,"red":{"m":"exact","n":1},"yel":{"m":"exact","n":"players_max_4","deal":"one_per_player_from_captain_skip_captain_at_5"},"two":{"red":{"m":"exact","n":1},"yel":{"m":"exact","n":2,"deal":"one_per_player_from_captain"}},"dial":2,"eq":{"ex":["eqY"]}},
{"n":41,"pl":[3,4,5],"red":{"m":"exact","n":2},"yel":{"m":"exact","n":2},"chars":"hidden_random_deal"},
{"n":42,"red":{"m":"exact","n":2},"yel":{"m":"exact","n":2},"two":{"red":{"m":"exact","n":3},"yel":{"m":"exact","n":4}},"dial":1},
{"n":43,"red":{"m":"exact","n":2},"yel":{"m":"exact","n":2},"two":{"red":{"m":"exact","n":3},"capRandInfo":1}},
{"n":44,"red":{"m":"exact","n":2},"yel":{"m":"exact","n":2},"two":{"red":{"m":"exact","n":3},"yel":{"m":"exact","n":4}}},
{"n":45,"red":{"m":"exact","n":1},"yel":{"m":"exact","n":2},"two":{"red":{"m":"exact","n":2},"yel":{"m":"exact","n":4}},"eq":{"ex":["eq6"]}},
{"n":46,"red":{"m":"exact","n":2},"yel":{"m":"exact","n":2},"two":{"red":{"m":"exact","n":3},"yel":{"m":"exact","n":4}}},
{"n":47,"red":{"m":"exact","n":2},"yel":{"m":"exact","n":2},"two":{"red":{"m":"exact","n":3},"yel":{"m":"exact","n":4}},"eq":{"ex":["eq1","eq12"]}},
{"n":48,"red":{"m":"exact","n":11,"deal":"facedown_pile_not_dealt"},"two":{"red":{"m":"exact","n":11,"deal":"facedown_pile_not_dealt"}},"eq":{"ex":["eq10"]},"chEx":["ch_new4"],"timer":{"s":600}},
{"n":49,"red":{"m":"exact","n":1},"yel":{"m":"exact","n":2},"two":{"red":{"m":"exact","n":2},"yel":{"m":"exact","n":4}},"dial":null,"eq":{"ex":["eq6","eq9"]}},
{"n":50,"red":{"m":"exact","n":1},"yel":{"m":"exact","n":2},"two":{"red":{"m":"exact","n":2},"yel":{"m":"exact","n":4}},"dial":1},
{"n":51,"red":{"m":"exact","n":2},"two":{"red":{"m":"exact","n":3}},"eq":{"ex":["eq1010"]}},
{"n":52,"red":{"m":"exact","n":1},"two":{"red":{"m":"exact","n":2}}},
{"n":53,"red":{"m":"exact","n":1},"yel":{"m":"exact","n":2},"two":{"red":{"m":"exact","n":2},"yel":{"m":"exact","n":4}},"eq":{"ex":["eq4","eq7"]},"chars":"base_only"},
{"n":54,"red":{"m":"exact","n":1},"yel":{"m":"exact","n":2},"two":{"red":{"m":"exact","n":2},"yel":{"m":"exact","n":4}}},
{"n":55,"eq":{"ex":["eq10"]},"chEx":["ch_new4"]},
{"n":56,"red":{"m":"exact","n":1},"yel":{"m":"exact","n":2},"two":{"red":{"m":"exact","n":2},"yel":{"m":"exact","n":4}}},
{"n":57,"red":{"m":"exact","n":1},"two":{"red":{"m":"exact","n":2}}},
{"n":58,"red":{"m":"exact","n":1},"yel":{"m":"exact","n":2},"two":{"red":{"m":"exact","n":2},"yel":{"m":"exact","n":4}}},
{"n":59,"red":{"m":"exact","n":1},"two":{"red":{"m":"exact","n":2}},"dial":2},
{"n":60,"pl":[3,4,5]},
{"n":61},
{"n":62,"red":{"m":"exact","n":1},"two":{"red":{"m":"exact","n":2}}},
{"n":63,"red":{"m":"exact","n":2},"two":{"red":{"m":"exact","n":3}},"dial":1},
{"n":64,"red":{"m":"exact","n":1},"yel":{"m":"exact","n":2}},
{"n":65,"red":{"m":"exact","n":1},"two":{"red":{"m":"exact","n":2}},"chars":"random_deal"},
{"n":66,"red":{"m":"exact","n":2},"yel":{"m":"exact","n":2},"two":{"red":{"m":"exact","n":3},"yel":{"m":"exact","n":4}},"timer":{"s":900,"s2":780}}];
// ---------- per-job names, our own text and structured rules ----------
// rules: [{k:handlerKey, ...params}] - every key has a handler in engine.js (RH). info: opening-token mode. tok: token family.
const MISSION_INFO={
1:{nm:"First Snip",text:"Training. Blue wires 1 to 7 only, no gear. Learn the dual cut and the solo cut."},
2:{nm:"Yellow Tape",text:"Blue 1 to 9, plus four yellow wires from 1.1 to 8.1. A yellow is just \"yellow\". To cut one, you must hold one. No gear."},
3:{nm:"The Red Lead",text:"Blue 1 to 11, plus one red from 2.5 to 10.5. Pointing at a red ends the job. A hand of only reds is shown at turn start. Gear arrives, one card each. Hand-Off and Spare Batteries stay in the van."},
4:{nm:"Cinema Basement",text:"All 48 blue wires from now on. One low red, from 1.5 to 6.5. Two high yellows, from 5.1 to 11.1. No new rules."},
5:{nm:"Greenhouse",text:"Two red values are marked with \"?\". Only one of those reds is really in play. Two yellows too."},
6:{nm:"Ice-Cream Plant",text:"Four yellow values are marked. Only two of those yellows are really in play. Two red tags, one real."},
7:{nm:"Bowling Lanes",text:"Three red values are marked, one red is real. The Fuse Pinch stays in the van."},
8:{nm:"Pier Exam",text:"Two red tags, one real. Four yellows. Nobody may say a wire number out loud.",rules:[{k:"speech",what:"numbers"}]},
9:{nm:"Paint Shop",text:"A random number card marks one blue value. It acts like red: never cut it. It is shown at the end. Three yellow tags, two real.",rules:[{k:"fakeRed"}]},
10:{nm:"Permit Office",text:"A number card covers each gear card. A card unlocks only when both are done. Cut two wires of its own value. Cut two of the covering value too.",rules:[{k:"eqCover"}]},
11:{nm:"Lighthouse",text:"Only the Roll Call is on the board, always ready. No opening tokens. Each turn a number card turns up. Roll call it. Then pick who must cut it.",info:"none",rules:[{k:"searchlight"}]},
12:{nm:"Town Hall Steps",text:"Four number cards set an order. Cut two wires of each before the next one opens. Other values are free.",rules:[{k:"gate",cards:4,req:2}]},
13:{nm:"Fake Countdown",text:"Timed job. The screen shows 15:00, but the clock cheats. Real play time is about 11 minutes. If it hits zero, boom.",rules:[{k:"timer",script:"m19"}],audio:true},
14:{nm:"Two-Faced Gardener",text:"Crew cards are dealt at random. Whoever gets the foreman card is the fibber. They open with two false tokens. Every token in their hand means \"NOT this value\". The fibber may not use gear.",rules:[{k:"liar"}]},
15:{nm:"Rush Hour",text:"Against the clock: 13 minutes, 11 with two crew. No fixed order. After a turn, anyone may claim the next one. Never two in a row. Hand-Off stays in the van.",rules:[{k:"freeTurns"},{k:"timer",script:"plain"}]},
16:{nm:"Chalk Lines",text:"Each player lays two tokens for values they do NOT hold. After the first two yellows go, each player passes a supply token left. The receiver places it truthfully.",info:"neg",rules:[{k:"yellowGift"}]},
17:{nm:"Bare Toolbelts",text:"No personal tools. After the first two yellows are cut, draw one token per player. From the foreman, each player takes one and places it truthfully.",rules:[{k:"yellowDraft"}]},
18:{nm:"Back to Front",text:"The foreman flips one own wire at random. They cannot see it, everyone else can. Only the foreman may cut it, with a plain cut. A miss on it is a boom.",rules:[{k:"flip",who:"captain",n:1}]},
19:{nm:"Seven Bells",text:"The four 7s must go last. They go all at once, by a player holding only 7s. Four yellows at 2.1, 6.1, 9.1 and 11.1. One red.",rules:[{k:"sevens"}]},
20:{nm:"Odd Socks",text:"The last wire dealt to each stand is not sorted. It sits at the far right with an X. No gear or personal tool can touch X wires. The Swap Bag stays in the van.",rules:[{k:"xWire",mode:"last"}]},
21:{nm:"Heads or Tails",text:"Info tokens only show even or odd, all job long. One red, two yellows.",tok:"par"},
22:{nm:"Number Wheel",text:"All twelve number cards lie face up. Each turn, turn one over and cut that value. When none are left, turn them all up again. Hold none of the shown values: skip.",rules:[{k:"declare"}]},
23:{nm:"Red Trio",text:"The three reds are dealt one each from the foreman. Reds go only by a special action: point at three uncut wires at once. If any is not red, boom. Gear cannot pick reds.",info:"rand",rules:[{k:"redTriple"}]},
24:{nm:"Rush Delivery",text:"Timed job. Quick number targets with rewards and penalties. Then a three-value rush. Then a final dash.",rules:[{k:"bus"}],audio:true},
25:{nm:"Locked Van",text:"Seven gear cards wait face down in the van. A number card is shown. Its four wires go only all at once: point at all four, boom if wrong. Until then one van card burns each round.",rules:[{k:"special4",reward:"eqDeck"}]},
26:{nm:"Power Cut",text:"No validation tokens or markers. Tokens lie beside the stand, not in front of a wire. Remember where they pointed.",info:"memory",rules:[{k:"memory"}]},
27:{nm:"Pier Lights",text:"Five number cards in a row. The arrow starts at the end the foreman picks. Cut two of the arrowed value to clear it. Whoever does picks the end the arrow goes to next.",rules:[{k:"line5"}]},
28:{nm:"Sealed Crates",text:"Gear lies face down. A number deck turns up one card at a time. Cut all four wires of the shown value. Then one gear card turns up, ready at once.",rules:[{k:"eqDeckReveal"}]},
29:{nm:"Three Lemons",text:"Three yellows, dealt one each. They go only all three at once, by pointing at them. A miss tags every pointed wire and burns one step. A red among them still explodes. No personal tools.",rules:[{k:"yellowTrio"}]},
30:{nm:"Hands Up",text:"No fixed order. A number card turns up. The first to call it must cut that value. A false call burns a step. If nobody calls, the foreman picks.",rules:[{k:"volunteer"}]},
31:{nm:"Bell Tower Climb",text:"Three number cards set an order. Cut all four wires of a value before the next one opens. Nobody may say a wire number out loud.",rules:[{k:"gate",cards:3,req:4},{k:"speech",what:"numbers"}]},
32:{nm:"First Shift",text:"Crew cards are dealt at random. Whoever gets the foreman card is the rookie. If the rookie misses a dual cut, boom. The rookie may not use the Blast Blanket.",rules:[{k:"rookie"}]},
33:{nm:"Shaky Hands",text:"The foreman has no crew card and may not use gear. A missed dual cut by the foreman blows up the job.",rules:[{k:"butterfingers"}]},
34:{nm:"Tally Marks",text:"Count tokens (x1, x2, x3) replace info tokens. They show how many of that value are on that stand, cut wires included. Never on a red.",tok:"cnt"},
35:{nm:"Moving Rules",text:"A shared restriction deck. The card changes each time a value is finished. If nobody can play for a whole round, the fuse burns and the card changes.",rules:[{k:"globCon",mode:"onFinish",roundBlock:"dial"}]},
36:{nm:"Hard Lines",text:"Each stand gets one extra blue wire, unsorted, at the far right with an X. X wires can be cut only after every yellow is cut. No gear or tool may touch them.",rules:[{k:"xWire",mode:"extra",lockYellow:true}]},
37:{nm:"Carnival Night",text:"No time limit, but carnival acts keep cutting in. Wires come back, seats move, cut wires get swapped or thrown away.",rules:[{k:"circus"}],audio:true},
38:{nm:"Personal Quirks",text:"Each player drafts a restriction card (A to E) and obeys it. At turn start, a player who cannot obey turns it down and plays free.",rules:[{k:"persCon",pick:"draft"}]},
39:{nm:"Four of a Kind",text:"No gear. A number card is shown. Its four wires go only all at once, boom if wrong. A deck of eight cards burns one per round until then. Then the rest become extra tokens. Opening tokens are random.",info:"rand",rules:[{k:"special4",reward:"numInfo"}]},
40:{nm:"Snare Line",text:"The yellows are snare wires, one per player. The fuse starts two steps from the end. A snare goes only by pointing at a crewmate's snare. Right: the fuse turns back a step. Wrong: a token and a burnt step.",info:"rand",rules:[{k:"tripwire"}]},
41:{nm:"Inside Job",text:"Crew cards and restrictions are dealt face down. The foreman card holder is the secret weak link. Only they obey a restriction. No personal tools until they are unmasked. At your turn start you may accuse.",rules:[{k:"mole"}]},
42:{nm:"Star Shower",text:"One number card per player. The fuse starts one step from the end. Each finished card value turns it back a step.",rules:[{k:"meteor"}]},
43:{nm:"Walking Robot",text:"A robot holds a few unseen wires. It walks the 1-12 track one step after every turn. Cut the value it stands on and take one of its wires. Its wires must be cut too.",rules:[{k:"robotPatrol"}]},
44:{nm:"Mind Games",text:"Everyone holds secret number cards. Before each turn, the player on the right lays one face down. If the active player cuts that value, the fuse burns a step.",rules:[{k:"mindRead"}]},
45:{nm:"Deep Well",text:"A shared oxygen reserve, two per player. Each cut costs 1, 2 or 3 by depth. It refills each round, when the turn passes the foreman. Cannot pay: skip and burn a step. No talking.",rules:[{k:"oxygen",variant:"shared"},{k:"speech",what:"all"}]},
46:{nm:"Boss Calls",text:"Each turn, the boss of the moment turns up a number card. They pick who must cut it. Two reds, two yellows.",rules:[{k:"sir"}]},
47:{nm:"Hall of Lies",text:"Every token in this job is false. It means \"this wire is NOT this value\". Each player opens with two false tokens.",info:"false2",tok:"false"},
48:{nm:"Flood Tide",text:"Timed job, 10 minutes. All eleven reds wait in a pile and leak into hands. Oxygen by depth. Finished numbers bring fresh air.",rules:[{k:"redTide"},{k:"oxygen",variant:"depth"}],audio:true},
49:{nm:"Clockwork Fuse",text:"No fuse dial: the robot is the fuse. It steps forward after cuts, two steps after a miss. It steps back when the cut matches its space. At 12, boom.",rules:[{k:"robotFuse"}]},
50:{nm:"Dare Night",text:"One challenge card per player. The fuse starts one step from the end. Each challenge met turns it back a step.",rules:[{k:"challenges"}]},
51:{nm:"Domino Rules",text:"Each number is paired with a restriction. Each finished value switches its paired restriction on for everyone. If nobody can play for a whole round, boom.",rules:[{k:"globCon",mode:"paired",roundBlock:"explode"}]},
52:{nm:"Robot Road",text:"Number cards in a line with the robot on the 7. Move it forward, never back, to a value you hold. Then cut that value. Stuck: skip, burn a step, turn it round.",rules:[{k:"robotLine"}]},
53:{nm:"Probe Frenzy",text:"No info tokens at all. Every Two-Prong Tester works every turn. Base crew only.",info:"none",tok:"none",rules:[{k:"unlimitedDD"}]},
54:{nm:"Quirk Swap",text:"Each player gets a restriction (A to E). Each round the crew may rotate them all. Burn a step to swap yours for a random F-L card. If nobody can play for a whole round, boom.",rules:[{k:"persCon",pick:"random",rotate:true,swap:true,roundBlock:"explode"}]},
55:{nm:"Sums",text:"Twelve number cards face up. To cut, add or subtract two of them. The result is the value you must cut. Cannot or will not: burn a step.",rules:[{k:"math"}]},
56:{nm:"Haywire",text:"Each player flips one own wire unseen to the far right. You must cut your own flipped wire yourself, with a plain cut. A miss is a boom. Cutting a crewmate's flipped wire costs a step.",rules:[{k:"flip",who:"each",n:1,others:1}]},
57:{nm:"Air Mail",text:"Each player keeps oxygen. To cut value V, first hand V oxygen to a crewmate. Cannot pay: skip and burn a step. No talking.",rules:[{k:"oxygen",variant:"gift"},{k:"speech",what:"all"}]},
58:{nm:"Ringmaster",text:"A shared restriction deck. Everyone obeys the face-up card. The foreman may swap it at the start of each turn. A blocked player skips.",rules:[{k:"globCon",mode:"captain"}]},
59:{nm:"Even Dares",text:"One challenge card per player. The fuse starts two steps from the end. Each challenge met turns it back a step. Info tokens only show even or odd.",tok:"par",rules:[{k:"challenges"}]},
60:{nm:"Pass the Parcel",text:"Number cards are dealt face up. You may only cut values on your cards. None: skip and burn a step. After each turn hand one card to a crewmate.",rules:[{k:"hotPotato"}]},
61:{nm:"One Tank",text:"The foreman starts with all the oxygen. Cut value V: pay V into the reserve. Pass all your oxygen left after your turn. Each round the foreman collects the reserve. No talking.",rules:[{k:"oxygen",variant:"bundle"},{k:"speech",what:"all"}]},
62:{nm:"Both Ends",text:"Each player flips two own wires unseen. The lower goes far left, the higher far right. Same rules as Haywire.",rules:[{k:"flip",who:"each",n:2,others:1}]},
63:{nm:"Meteor Count",text:"One number card per player. The fuse starts one step from the end. Each finished card value turns it back a step. Count tokens replace info tokens.",tok:"cnt",rules:[{k:"meteor"}]},
64:{nm:"Bunker Raid",text:"Timed job on the bunker map. Every cut moves the crew toward the side whose restriction it met. Reach the key, guard, stairs, lever and doctor in time. Then finish the bomb.",rules:[{k:"bunker"}],audio:true},
65:{nm:"The Apprentice",text:"Crew cards are dealt at random. The foreman card holder is the rookie: their missed dual cut is a boom. A random blue value acts like red. Never cut it.",rules:[{k:"rookie"},{k:"fakeRed"}]},
66:{nm:"The Masterpiece",text:"Timed job: 15 minutes, 13 with two crew. Three number cards set an order, two wires each. Count tokens replace info tokens. Two reds, two yellows.",tok:"cnt",rules:[{k:"gate",cards:3,req:2},{k:"timer",script:"plain"}]}
};
// ---------- timed prompt scripts (play seconds; narration never counts). Our own wording. ----------
const SCRIPTS={
 plain:{prompts:[]},
 m19:{limit:668,fake:{jump:337,before:900,after:668},prompts:[
  {t:0,say:'The villain starts his countdown: 15:00 on the screen.'},
  {t:190,say:'The screen shows 12 minutes.'},
  {t:328,say:'The screen shows 10 minutes.'},
  {t:337,say:'Cheat! The villain skips his countdown straight to 5 minutes.'},
  {t:520,say:'2 minutes left.'},
  {t:620,say:'30 seconds left.'},
  {t:658,say:'Ten... nine... eight...'}]},
 m30:{phases:[
  {t:0,len:20,say:'Number target! At least two wires of the shown value within 20 seconds.'},
  {t:20,len:20,check:'dialIfMissed',say:'Missed targets burn a step. New target, 20 seconds.'},
  {t:40,len:20,check:'none',say:'No reward this time. New target, 20 seconds.'},
  {t:60,len:20,check:'eqIfMissed',say:'A miss now costs the lowest visible equipment card (locked or ready). New target, 20 seconds.'},
  {t:80,len:15,check:'yellowCountIfHit',say:'Hit: everyone announces how many yellows they hold. New target, 15 seconds.'},
  {t:95,len:15,check:'mimeIfMissed',say:'Miss: the active player may only mime. New target, 15 seconds.'},
  {t:110,len:15,check:'holdIfHit',say:'Hit: the active player draws a number card. They say if they hold it. New target, 15 seconds.'},
  {t:125,len:120,check:'finishIfHit',say:'Hit: the rest of that value is cut at once. Three targets now. Nothing else may be cut until all of them are finished. 2 minutes.'},
  {t:245,len:120,check:'rush',say:'All three done: defused! Otherwise cut every remaining yellow at once, then 2 minutes to finish.'}]},
 m42:{acts:[
  {t:37,act:'magician',say:'The magician: everyone else looks away. A pair of cut wires goes back on its stands, uncut.'},
  {t:111,act:'tamerL',say:'The tamer cracks the whip. Everyone moves one seat to the left, stands stay put.'},
  {t:161,act:'juggler',say:'The juggler swaps two cut wires on their own stand. They must be different values.'},
  {t:200,act:'tamerR',say:'The tamer again: everyone moves one seat to the right.'},
  {t:238,act:'knife',say:'The knife thrower tosses all of their cut wires into the box.'},
  {t:287,act:'tadaOn',say:'From now on, whoever cuts must shout "ta-da!".'},
  {t:334,act:'magician',say:'The magician returns another pair of cut wires.'},
  {t:417,act:'juggler',say:'The juggler swaps two cut wires again.'},
  {t:460,act:'clouds',say:'Clouds roll in: every validation token leaves the board and the supply.'},
  {t:502,act:'trampoline',say:'Trampoline! Did the last cutter shout "ta-da!"? If not, a step burns.'},
  {t:583,act:'magician',say:'The magician strikes once more.'},
  {t:605,act:'trampoline',say:'Trampoline again: ta-da check.'},
  {t:643,act:'tamerR',say:'The tamer: everyone moves one seat to the right.'},
  {t:700,act:'trampoline',say:'Last trampoline: ta-da check. Applause!'}]},
 m54:{limit:600,events:[
  {t:42,ev:'leak',say:'A leak! The active player draws a red from the pile. It goes into their hand, in sorted order.'},
  {t:88,ev:'extra',say:'Busy hands: the active player takes another turn right after this one.'},
  {t:93,ev:'bottle',say:'A bottle! The active player takes one oxygen from the reserve.'},
  {t:130,ev:'leak',say:'Water is coming in: the active player draws a red.'},
  {t:229,ev:'transfer',say:'Transfer: the active player may give oxygen to one crewmate. Or take oxygen from one.'},
  {t:234,ev:'bottle',say:'Another bottle: one oxygen from the reserve.'},
  {t:283,ev:'leak',say:'A leak: the active player draws a red.'},
  {t:320,ev:'extra',say:'Busy hands: another turn for the active player.'},
  {t:349,ev:'leak',say:'A leak: the active player draws a red.'},
  {t:418,ev:'transfer',say:'Transfer of oxygen with one crewmate.'},
  {t:451,ev:'leak',say:'A leak: the active player draws a red.'},
  {t:517,ev:'leak',say:'A leak: the active player draws a red.'},
  {t:560,ev:'transfer',say:'Last transfer. Minutes left!'},
  {t:590,ev:'none',say:'Hold your breath and finish the job!'}]},
 m66:{objectives:[
  {len:80,goal:'key',say:'Reach the key square and do its action.'},
  {len:75,goal:'guard',say:'The door is open. Reach the guard square and do its action.'},
  {len:60,goal:'stairs',say:'Reach the stairs and go down to the basement.'},
  {len:90,goal:'lever',say:'A yellow laser blocks the way. Reach the lever square and cut the two yellows there.'},
  {len:10,goal:'arrange',say:'Bonus: you may rearrange the five restriction cards.'},
  {len:105,goal:'doctor',say:'Reach the doctor square and do its action.'},
  {len:20,goal:'finish',say:'Twenty seconds: cut every remaining wire!'}]}
};
// ---------- assemble ----------
const MISSIONS={};
for(const s of MISSION_SETUP){const i=MISSION_INFO[s.n];MISSIONS[s.n]=Object.assign({pl:[2,3,4,5],blue:12,red:null,yel:null,two:{},dial:'players',eq:{},chars:'standard',chEx:[],timer:null,
  nm:i.nm,text:i.text,rules:i.rules||[],info:i.info||'std',tok:i.tok||'num',audio:!!i.audio},s)}
function missionRules(n){return MISSIONS[n].rules}
function hasRule(n,k){return MISSIONS[n].rules.find(r=>r.k===k)||null}
