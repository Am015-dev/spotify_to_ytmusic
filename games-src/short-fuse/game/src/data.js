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
 eq1:{n:'Unequal Tag',v:1,need:2,timing:'any',pool:'base',kind:'tag',
   text:'Clip the one "not equal" tag between two neighbouring wires on your own stand that hold different values. One of them may already be cut. Two reds, or two yellows, count as the same value, so they never take this tag.'},
 eq2:{n:'Handsets',v:2,need:2,timing:'any',pool:'base',kind:'swap',
   text:'Trade one uncut wire with a crewmate, face down both ways. Each of you slots the new wire into sorted order; a two-stand player puts it on the stand the outgoing wire left. Any colour may be traded. Everyone sees which slots changed. A token in front of a traded wire goes with it. Nobody may ask for a value.'},
 eq3:{n:'Triple Probe',v:3,need:2,timing:'turn',pool:'base',kind:'probe',
   text:'With your dual cut, name a number and point at three wires on one crewmate stand. It works if any of them matches; they cut one match without saying how many matched. If none match, the fuse burns one step and they tag one of the three with its true value.'},
 eq4:{n:'Sticky Note',v:4,need:2,timing:'any',pool:'base',kind:'note',
   text:'Put an info token showing the true value in front of one of your own blue wires.'},
 eq5:{n:'Full Scan',v:5,need:2,timing:'turn',pool:'base',kind:'probe',
   text:'With your dual cut, name a number and point at a crewmate\'s whole stand. It works if any wire there matches; they cut one match without saying how many. If none match, the fuse burns one step and they tag a wire of their choice.'},
 eq6:{n:'Rewind',v:6,need:2,timing:'any',pool:'base',kind:'dial',text:'Turn the fuse back one step.'},
 eq7:{n:'Recharge',v:7,need:2,timing:'any',pool:'base',kind:'recharge',text:'Wake up one or two crew members whose personal tool is spent; each can use it once more this job.'},
 eq8:{n:'Sweep',v:8,need:2,timing:'any',pool:'base',kind:'sweep',
   text:'Call a number. Every crew member, you included, says yes if they have at least one uncut blue wire of it; two-stand players answer for each stand. Nobody says how many or where. Red and yellow never count.'},
 eq9:{n:'Damper',v:9,need:2,timing:'start',pool:'base',kind:'damper',
   text:'Use before your action. If your dual cut this turn misses, the fuse does not burn, and if you pointed at a red nothing goes off. A wrong non-red wire still gets its token; a red one gets none.'},
 eq10:{n:'Two-Value Probe',v:10,need:2,timing:'turn',pool:'base',kind:'probe2',
   text:'With your dual cut, name two values (yellow allowed) for one wire. You must hold both. If the wire is either one, it works and you cut your matching wire, so the crew also learns you hold the other value. Can be combined with the twin, triple or full-scan probe.'},
 eq11:{n:'Coffee Break',v:11,need:2,timing:'turn',pool:'base',kind:'coffee',text:'Skip your action and pick, without discussion, who goes next; play carries on clockwise from them.'},
 eq12:{n:'Equal Tag',v:12,need:2,timing:'any',pool:'base',kind:'tag',
   text:'Clip the one "equal" tag between two neighbouring wires on your own stand that share a value. One may already be cut. Any two reds, or any two yellows, count as equal.'},
 eqY:{n:'Hidden Compartment',v:'Y',need:2,timing:'instant',pool:'yellow',kind:'more',
   text:'The moment it unlocks, draw two more equipment cards into this job. They may unlock at once if their values are already cut.'},
 eq22:{n:'Lone Tag',v:2,need:4,timing:'any',pool:'double',kind:'lone',
   text:'Put a x1 token in front of one of your blue wires, cut or not: that value appears only once on that stand, counting cut wires.'},
 eq33:{n:'Supply Drop',v:3,need:4,timing:'instant',pool:'double',kind:'refresh',text:'The moment it unlocks, every used equipment card turns face up and works once more.'},
 eq99:{n:'Express Pass',v:9,need:4,timing:'turn',pool:'double',kind:'express',text:'Solo-cut two identical wires from your hand even if more of that value are still uncut elsewhere.'},
 eq1010:{n:'Vaporiser',v:10,need:4,timing:'instant',pool:'double',kind:'vapor',
   text:'The moment it unlocks, draw a random info token from the supply: everyone cuts every uncut wire of that number they hold.'},
 eq1111:{n:'Hook Line',v:11,need:4,timing:'any',pool:'double',kind:'hook',
   text:'Point at a crewmate\'s uncut wire and pull it, unseen, into your own hand in sorted order (a two-stand player picks the stand). Everyone sees where it came from and went.'}
};
const EQ_IDS=Object.keys(EQUIP);
// ---------- characters and personal tools ----------
const ITEMS={
 dd:{n:'Twin Probe',timing:'turn',text:'With your dual cut, name a number (never yellow) and point at two wires on one crewmate stand. It works if either matches; if both do they quietly pick one. If neither matches the fuse burns one step and they tag one of the two. If exactly one is red nothing goes off and the tag goes on the other; if both are red, boom.'},
 sweep:{n:'Pocket Sweep',timing:'any',text:'Your own copy of the Sweep card.'},
 handsets:{n:'Pocket Handsets',timing:'any',text:'Your own copy of the Handsets card.'},
 pt3:{n:'Pocket Triple Probe',timing:'turn',text:'Your own copy of the Triple Probe card.'},
 pt10:{n:'Pocket Two-Value Probe',timing:'turn',text:'Your own copy of the Two-Value Probe card.'}
};
const CHARS={
 ch_captain:{n:'Foreman Brix',item:'dd',captain:true,from:1,text:'Runs the job: goes first and settles setup choices.'},
 ch_base1:{n:'Wren',item:'dd',from:1,text:'Rigger with steady hands.'},
 ch_base2:{n:'Pike',item:'dd',from:1,text:'Wrecking-ball operator.'},
 ch_base3:{n:'Moss',item:'dd',from:1,text:'Tunnel and trench specialist.'},
 ch_base4:{n:'Tally',item:'dd',from:1,text:'Keeps the count on every charge.'},
 ch_new1:{n:'Echo',item:'sweep',from:31,newc:true,text:'Carries a pocket sweep unit.'},
 ch_new2:{n:'Relay',item:'handsets',from:31,newc:true,text:'Never without a pair of handsets.'},
 ch_new3:{n:'Trident',item:'pt3',from:31,newc:true,text:'Prefers three prongs to two.'},
 ch_new4:{n:'Prism',item:'pt10',from:31,newc:true,text:'Reads two values at once.'}
};
const BASE_CHARS=['ch_captain','ch_base1','ch_base2','ch_base3','ch_base4'];
// ---------- constraint cards A-L. A cut value V is 1-12 or 'Y' (yellow has no number: it breaks A-E, passes F) ----------
const CONSTRAINTS={
 A:{n:'Evens Only',text:'You may only cut even values.',val:v=>v!=='Y'&&v%2===0},
 B:{n:'Odds Only',text:'You may only cut odd values.',val:v=>v!=='Y'&&v%2===1},
 C:{n:'Low Side',text:'You may only cut values 1 to 6.',val:v=>v!=='Y'&&v<=6},
 D:{n:'High Side',text:'You may only cut values 7 to 12.',val:v=>v!=='Y'&&v>=7},
 E:{n:'Middle Band',text:'You may only cut values 4 to 9.',val:v=>v!=='Y'&&v>=4&&v<=9},
 F:{n:'Skip the Middle',text:'You may not cut values 4 to 9.',val:v=>v==='Y'||v<4||v>9},
 G:{n:'Bare Hands',text:'You may not use equipment cards or your personal tool.',noTools:true},
 H:{n:'Radio Silence',text:'When your cut misses, or a cut aimed at your hand misses, no token is placed. You may not cut a wire that has a token in front of it, and you may not use the Sticky Note.',silent:true},
 I:{n:'Leave the Top',text:'You may not cut the right-most uncut wire of a crewmate\'s stand.',noRight:true},
 J:{n:'Leave the Bottom',text:'You may not cut the left-most uncut wire of a crewmate\'s stand.',noLeft:true},
 K:{n:'No Solo',text:'You may not solo cut.',noSolo:true},
 L:{n:'Hair Trigger',text:'If your cut misses, the fuse burns two steps instead of one.',double:true}
};
const CON_IDS=Object.keys(CONSTRAINTS);
// ---------- challenge cards 1-10 (met: discard it and turn the fuse back one step) ----------
const CHALLENGES={
 1:{n:'Call the Red',text:'Instead of a normal action, point at a crewmate\'s wire and say "red". If it is red it is revealed and this is met; if not, boom.'},
 2:{n:'Even Streak',text:'Four turns in a row each cut an even value.'},
 3:{n:'Pairs Apart',text:'On one stand the uncut wires form only separate pairs: groups of exactly two side by side, split by cut wires.'},
 4:{n:'Eighteen',text:'The first three validation tokens placed add up to 18.'},
 5:{n:'Solo Duet',text:'Two turns in a row are solo cuts.'},
 6:{n:'Lonely Five',text:'On one stand at least five uncut wires each sit alone between cut wires or a stand end.'},
 7:{n:'Staircase',text:'Three turns in a row cut consecutive values, up or down (like 8, 9, 10).'},
 8:{n:'Called Shots',text:'Two number cards are placed on this when it is drawn: met if the first two validation tokens are exactly those values.'},
 9:{n:'Odd Wall',text:'One stand holds only odd uncut blue wires, at least six of them (red and yellow are ignored).'},
 10:{n:'Hollow Middle',text:'On one stand at least seven wires are cut while both end wires are still uncut.'}
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
{"n":1,"blue":6,"eq":{"n":0}},
{"n":2,"blue":8,"yel":{"m":"exact","n":2,"cand":[1.1,7.1]},"eq":{"n":0}},
{"n":3,"blue":10,"red":{"m":"exact","n":1,"cand":[1.5,9.5]},"eq":{"ex":["eq2","eq12"]}},
{"n":4,"red":{"m":"exact","n":1},"yel":{"m":"exact","n":2},"two":{"red":{"m":"exact","n":1},"yel":{"m":"exact","n":4}}},
{"n":5,"red":{"m":"exact","n":1},"yel":{"m":"of","n":2,"of":3},"two":{"red":{"m":"exact","n":2},"yel":{"m":"of","n":2,"of":3}}},
{"n":6,"red":{"m":"exact","n":1},"yel":{"m":"exact","n":4},"two":{"red":{"m":"exact","n":2},"yel":{"m":"exact","n":4}}},
{"n":7,"red":{"m":"of","n":1,"of":2},"two":{"red":{"m":"of","n":1,"of":3}}},
{"n":8,"red":{"m":"of","n":1,"of":2},"yel":{"m":"of","n":2,"of":3},"two":{"red":{"m":"of","n":1,"of":3},"yel":{"m":"exact","n":4}}},
{"n":9,"red":{"m":"exact","n":1},"yel":{"m":"exact","n":2},"two":{"red":{"m":"exact","n":2},"yel":{"m":"exact","n":4}}},
{"n":10,"red":{"m":"exact","n":1},"yel":{"m":"exact","n":4},"eq":{"ex":["eq11"]},"timer":{"s":900,"s2":720}},
{"n":11,"yel":{"m":"exact","n":2},"two":{"yel":{"m":"exact","n":4},"capNoInfo":1}},
{"n":12,"red":{"m":"exact","n":1},"yel":{"m":"exact","n":4},"two":{"red":{"m":"exact","n":2},"yel":{"m":"exact","n":4}}},
{"n":13,"red":{"m":"exact","n":3,"deal":"one_per_player_from_captain"},"two":{"capNoInfo":1}},
{"n":14,"red":{"m":"exact","n":2},"yel":{"m":"of","n":2,"of":3},"two":{"red":{"m":"exact","n":3},"yel":{"m":"exact","n":4}},"chars":"random_deal"},
{"n":15,"red":{"m":"of","n":1,"of":3},"two":{"red":{"m":"of","n":2,"of":3}}},
{"n":16,"red":{"m":"exact","n":1},"yel":{"m":"of","n":2,"of":3},"two":{"red":{"m":"exact","n":2},"yel":{"m":"exact","n":4}}},
{"n":17,"red":{"m":"of","n":2,"of":3},"two":{"red":{"m":"exact","n":3}},"chars":"random_deal"},
{"n":18,"red":{"m":"exact","n":2},"two":{"red":{"m":"exact","n":3}},"eq":{"n":0,"fixed":["eq8"]}},
{"n":19,"red":{"m":"exact","n":1},"yel":{"m":"of","n":2,"of":3},"timer":{"s":668}},
{"n":20,"red":{"m":"exact","n":2},"yel":{"m":"exact","n":2},"two":{"red":{"m":"of","n":2,"of":3},"yel":{"m":"exact","n":4}},"eq":{"ex":["eq2"]}},
{"n":21,"red":{"m":"of","n":1,"of":2},"two":{"red":{"m":"exact","n":2}}},
{"n":22,"red":{"m":"exact","n":1},"yel":{"m":"exact","n":4}},
{"n":23,"red":{"m":"of","n":1,"of":3},"two":{"red":{"m":"of","n":2,"of":3}},"eq":{"n":0}},
{"n":24,"red":{"m":"exact","n":2},"two":{"red":{"m":"exact","n":3}}},
{"n":25,"red":{"m":"exact","n":2},"two":{"red":{"m":"exact","n":3}}},
{"n":26,"red":{"m":"exact","n":2},"eq":{"ex":["eq10"]}},
{"n":27,"red":{"m":"exact","n":1},"yel":{"m":"exact","n":4},"two":{"capNoInfo":1},"eq":{"ex":["eq7"]},"chars":"no_personal_items"},
{"n":28,"red":{"m":"exact","n":2},"yel":{"m":"exact","n":4},"two":{"red":{"m":"exact","n":3},"yel":{"m":"exact","n":4}},"chars":"captain_has_none"},
{"n":29,"red":{"m":"exact","n":3},"two":{"capNoInfo":1}},
{"n":30,"red":{"m":"of","n":1,"of":2},"yel":{"m":"exact","n":4}},
{"n":31,"red":{"m":"of","n":2,"of":3}},
{"n":32,"red":{"m":"exact","n":2},"two":{"red":{"m":"exact","n":3}}},
{"n":33,"red":{"m":"of","n":2,"of":3},"two":{"red":{"m":"exact","n":3}}},
{"n":34,"pl":[3,4,5],"red":{"m":"exact","n":1},"chars":"hidden_random_deal"},
{"n":35,"red":{"m":"of","n":2,"of":3},"yel":{"m":"exact","n":4},"two":{"red":{"m":"exact","n":3},"yel":{"m":"exact","n":4}},"eq":{"ex":["eq2"]}},
{"n":36,"red":{"m":"of","n":1,"of":3},"yel":{"m":"exact","n":2},"two":{"red":{"m":"of","n":2,"of":3},"yel":{"m":"exact","n":4}}},
{"n":37,"red":{"m":"exact","n":2},"two":{"red":{"m":"exact","n":3}}},
{"n":38,"red":{"m":"exact","n":2},"two":{"red":{"m":"exact","n":3}}},
{"n":39,"red":{"m":"of","n":2,"of":3},"yel":{"m":"exact","n":4},"two":{"red":{"m":"exact","n":3},"yel":{"m":"exact","n":4}},"eq":{"n":0}},
{"n":40,"red":{"m":"exact","n":3},"two":{"capNoInfo":1}},
{"n":41,"red":{"m":"of","n":1,"of":3},"yel":{"m":"exact","n":"players_max_4","deal":"one_per_player_from_captain_skip_captain_at_5"},"two":{"red":{"m":"of","n":2,"of":3},"yel":{"m":"exact","n":2,"deal":"one_per_player_from_captain"}},"dial":1,"eq":{"ex":["eqY"]}},
{"n":42,"red":{"m":"of","n":1,"of":3},"yel":{"m":"exact","n":4}},
{"n":43,"red":{"m":"exact","n":3},"two":{"capRandInfo":1}},
{"n":44,"red":{"m":"of","n":1,"of":3},"eq":{"ex":["eq10"]},"chEx":["ch_new4"]},
{"n":45,"red":{"m":"exact","n":2},"two":{"red":{"m":"exact","n":3}},"eq":{"ex":["eq10","eq11"]},"chEx":["ch_new4"]},
{"n":46,"yel":{"m":"fixed","vals":[5.1,6.1,7.1,8.1],"n":4},"two":{"capNoInfo":1},"eq":{"ex":["eq7"]}},
{"n":47,"red":{"m":"of","n":2,"of":3},"two":{"red":{"m":"exact","n":3}},"eq":{"ex":["eq10"]},"chEx":["ch_new4"]},
{"n":48,"red":{"m":"exact","n":2},"yel":{"m":"exact","n":3,"deal":"one_per_player_from_captain"},"two":{"red":{"m":"exact","n":3},"yel":{"m":"exact","n":3,"deal":"one_per_player_from_captain_captain_gets_2"}}},
{"n":49,"red":{"m":"exact","n":2},"two":{"red":{"m":"exact","n":3}},"eq":{"ex":["eq10"]},"chEx":["ch_new4"]},
{"n":50,"red":{"m":"exact","n":2},"yel":{"m":"exact","n":2},"two":{"red":{"m":"exact","n":3},"yel":{"m":"exact","n":4}}},
{"n":51,"red":{"m":"exact","n":1},"two":{"red":{"m":"exact","n":2},"capNoInfo":1},"dial":"players+1","eq":{"ex":["eq10"]},"chEx":["ch_new4"]},
{"n":52,"red":{"m":"exact","n":3},"two":{"red":{"m":"exact","n":3},"yel":{"m":"exact","n":4}},"eq":{"ex":["eq1","eq12"]}},
{"n":53,"red":{"m":"exact","n":2},"two":{"red":{"m":"exact","n":3}},"dial":null,"eq":{"ex":["eq6","eq9"]}},
{"n":54,"red":{"m":"exact","n":11,"deal":"facedown_pile_not_dealt"},"two":{"red":{"m":"exact","n":11,"deal":"facedown_pile_not_dealt"}},"eq":{"ex":["eq10"]},"chEx":["ch_new4"],"timer":{"s":600}},
{"n":55,"red":{"m":"exact","n":2},"two":{"red":{"m":"of","n":2,"of":3}},"dial":1},
{"n":56,"red":{"m":"of","n":2,"of":3},"two":{"red":{"m":"exact","n":3}}},
{"n":57,"red":{"m":"exact","n":1},"two":{"red":{"m":"exact","n":2}},"eq":{"ex":["eq1010"]}},
{"n":58,"red":{"m":"exact","n":2},"two":{"red":{"m":"exact","n":3}},"eq":{"ex":["eq4","eq7"]},"chars":"base_only"},
{"n":59,"red":{"m":"of","n":2,"of":3},"two":{"red":{"m":"exact","n":3}},"eq":{"ex":["eq10"]},"chEx":["ch_new4"]},
{"n":60,"red":{"m":"of","n":2,"of":3},"two":{"red":{"m":"exact","n":3}},"dial":1},
{"n":61,"red":{"m":"exact","n":1},"two":{"red":{"m":"exact","n":2}}},
{"n":62,"red":{"m":"exact","n":2},"two":{"red":{"m":"exact","n":3}},"dial":1},
{"n":63,"red":{"m":"exact","n":2},"two":{"red":{"m":"exact","n":3}},"eq":{"ex":["eq10"]},"chEx":["ch_new4"]},
{"n":64,"red":{"m":"exact","n":1},"two":{"red":{"m":"exact","n":2}}},
{"n":65,"pl":[3,4,5],"red":{"m":"exact","n":3},"eq":{"ex":["eq10"]},"chEx":["ch_new4"]},
{"n":66,"red":{"m":"exact","n":2},"yel":{"m":"exact","n":2}}];
// ---------- per-job names, our own text and structured rules ----------
// rules: [{k:handlerKey, ...params}] - every key has a handler in engine.js (RH). info: opening-token mode. tok: token family.
const MISSION_INFO={
1:{nm:'Boot Camp I',text:'Training. Blue wires 1 to 6 only, no equipment. Learn the dual cut and the solo cut.'},
2:{nm:'Boot Camp II',text:'Blue 1 to 8 plus two yellow wires (drawn from 1.1 to 7.1). Every yellow is just "yellow": to cut one you must hold one. No equipment.'},
3:{nm:'Boot Camp III',text:'Blue 1 to 10 plus one red (from 1.5 to 9.5). Pointing at a red ends the job. A hand of only reds is revealed at the start of its turn. Equipment arrives: one card per player (Handsets and Equal Tag are swapped out).'},
4:{nm:'Field Day One',text:'All 48 blue wires from now on. One red, two yellows. No new rules.'},
5:{nm:'Field Day Two',text:'"2 out of 3": three yellow values are marked, but only two of those wires are really in play.'},
6:{nm:'Field Day Three',text:'Four yellows in play, cut in pairs or by a solo cut.'},
7:{nm:'Last Lesson',text:'"1 out of 2" for red: two values are marked, one red is really in play.'},
8:{nm:'Graduation',text:'The graduation test. No special rules.'},
9:{nm:'Pecking Order',text:'Three number cards set an order: two wires of the first value must be cut before the second value may be cut, and two of the second before the third. Other values are free.',rules:[{k:'gate',cards:3,req:2}]},
10:{nm:'No Coffee Today',text:'Against the clock (15 minutes, 12 with two players). No fixed order: when a turn ends, anyone may claim the next one, but never two in a row (unless only two of you, or you are the last with wires). Coffee Break is swapped out.',rules:[{k:'freeTurns'},{k:'timer',script:'plain'}]},
11:{nm:'Colourblind',text:'No red wires, but a random number card marks a blue value that behaves exactly like red: never cut it, reveal it at the end.',rules:[{k:'fakeRed'}]},
12:{nm:'Paperwork',text:'A number card covers each equipment card. A card unlocks only when two wires of its own value AND two of the covering value are cut.',rules:[{k:'eqCover'}]},
13:{nm:'Triple Trouble',text:'The three reds are dealt one per player from the foreman. Opening tokens are drawn at random. Reds go only by a special action: point at three uncut wires anywhere at once; if any is not red, boom. A hand of only reds must try it.',info:'rand',rules:[{k:'redTriple'}]},
14:{nm:'The Rookie',text:'Crew cards are dealt at random; whoever gets the foreman card is the rookie. If the rookie misses a dual cut, boom. The rookie may not use the Damper.',rules:[{k:'rookie'}]},
15:{nm:'Garbled Orders',text:'Equipment lies face down. A number deck is turned up one card at a time: when all four wires of the shown value are cut, one equipment card turns up, ready at once.',rules:[{k:'eqDeckReveal'}]},
16:{nm:'Same Again',text:'Like Pecking Order, but all four wires of each value in the order must be cut before the next.',rules:[{k:'gate',cards:3,req:4}]},
17:{nm:'Fibber',text:'Crew cards are dealt at random; the foreman card holder is the fibber. The fibber opens with two false tokens, and every token in the fibber\'s hand means "NOT this value". The fibber may not use equipment, but may join a Handsets trade and answer a Sweep.',rules:[{k:'liar'}]},
18:{nm:'Searchlight',text:'Only the Sweep is on the board, always ready. No opening tokens. Each turn: turn up a number card, sweep it, then pick who must cut that value.',info:'none',rules:[{k:'searchlight'}]},
19:{nm:'Cave Lair',text:'Timed job. The villain\'s screen shows 15:00, but he cheats: real play time is about 11 minutes. If the clock hits zero, boom.',rules:[{k:'timer',script:'m19'}],audio:true},
20:{nm:'Odd One Out',text:'The last wire dealt to each stand is not sorted: it sits at the far right with an X. No equipment or personal tool can touch X wires. Handsets are swapped out.',rules:[{k:'xWire',mode:'last'}]},
21:{nm:'Even Stevens',text:'Info tokens only show even or odd, for the whole job.',tok:'par'},
22:{nm:'Ruled Out',text:'Instead of an opening token, each player lays two tokens for values they do NOT hold. When the first two yellows are cut, each player gives a token from the supply to the player on their left, who places it truthfully.',info:'neg',rules:[{k:'yellowGift'}]},
23:{nm:'Small Town',text:'No equipment on the board: seven face-down cards wait in a pile. A number card is shown; its four wires go only all at once, by pointing at all four (boom if wrong). Until then, one card of the pile burns each round. After it, the rest of the pile is ready.',rules:[{k:'special4',reward:'eqDeck'}]},
24:{nm:'Head Count',text:'Count tokens (x1, x2, x3) replace info tokens: "this value is on this stand that many times, cut wires included". Never on a red.',tok:'cnt'},
25:{nm:'Big Ears',text:'Nobody may say a wire number out loud.',rules:[{k:'speech',what:'numbers'}]},
26:{nm:'Dwindling Options',text:'All twelve number cards lie face up. Each turn, turn one over and cut that value. When none are left, turn them all up again. If you hold none of the shown values, skip.',rules:[{k:'declare'}]},
27:{nm:'Putty',text:'No personal tools. When the first two yellows are cut, draw one random token per player; from the foreman each takes one and places it truthfully (or beside the stand).',rules:[{k:'yellowDraft'}]},
28:{nm:'Butterfingers',text:'The foreman has no crew card, may not use any equipment and blows up the job on a missed dual cut. The foreman may still join a Handsets trade and answer a Sweep.',rules:[{k:'butterfingers'}]},
29:{nm:'Read My Mind',text:'Everyone holds secret number cards. Before each turn the player on the right lays one face down; if the active player then cuts that value, the fuse burns a step.',rules:[{k:'mindRead'}]},
30:{nm:'No Brakes',text:'Timed job. A run of quick number targets with rewards and penalties, then a three-value rush, then a final dash.',rules:[{k:'bus'}],audio:true},
31:{nm:'Handicap',text:'Each player drafts a restriction card (A to E) and must obey it. A player who cannot obey at the start of a turn turns it down and plays free.',rules:[{k:'persCon',pick:'draft'}]},
32:{nm:'Clown Tricks',text:'A shared restriction deck (A to L). Everyone obeys the face-up card. The foreman may swap it at the start of each turn. A blocked player skips.',rules:[{k:'globCon',mode:'captain'}]},
33:{nm:'High Roller',text:'Even/odd tokens replace info tokens everywhere.',tok:'par'},
34:{nm:'Mole Hunt',text:'Crew cards and restrictions are dealt face down. The foreman card holder is the secret weak link and alone obeys a restriction. No personal tools until the weak link is unmasked. At the start of your turn you may accuse.',rules:[{k:'mole'}]},
35:{nm:'Hard-Wired',text:'Each stand gets one extra blue at the far right with an X, unsorted. X wires may only be cut once all four yellows are cut, and no equipment or personal tool may touch them. Handsets are swapped out.',rules:[{k:'xWire',mode:'extra',lockYellow:true}]},
36:{nm:'Beach Panic',text:'Five number cards in a row; the order arrow starts at the end the foreman picks. Cut two of the arrowed value to clear it; whoever does chooses which end the arrow goes to next.',rules:[{k:'line5'}]},
37:{nm:'Moving Goalposts',text:'A shared restriction deck. The card changes each time a value is finished. If nobody can play for a whole round the fuse burns and the card changes.',rules:[{k:'globCon',mode:'onFinish',roundBlock:'dial'}]},
38:{nm:'Blind Spot',text:'The foreman flips one own wire at random, unseen by the foreman but seen by everyone else. Only the foreman may cut it, with a plain cut, and a miss on it is a boom.',rules:[{k:'flip',who:'captain',n:1}]},
39:{nm:'The Noble Four',text:'No equipment. A number card is shown; its four wires go only all at once (boom if wrong). A deck of eight number cards burns one per round until then; afterwards the rest are dealt out as extra tokens. Opening tokens are drawn at random.',info:'rand',rules:[{k:'special4',reward:'numInfo'}]},
40:{nm:'Tower Block',text:'Count tokens replace info tokens everywhere, the opening one too.',tok:'cnt'},
41:{nm:'Snare Tango',text:'The yellows are snare wires, one per player. The fuse starts one step from the end. A snare goes only by pointing at a crewmate\'s snare: right means the fuse turns back a step, wrong means a token and a burnt step.',info:'rand',rules:[{k:'tripwire'}]},
42:{nm:'Big Top',text:'No time limit, but circus acts keep interrupting: wires come back, seats move, cut wires get juggled or thrown away.',rules:[{k:'circus'}],audio:true},
43:{nm:'Robo-Pal',text:'A robot holds a few unseen wires and walks the 1-12 track, one step after every turn. Cut the value it stands on and you take one of its wires. Its wires must be cut too.',rules:[{k:'robotPatrol'}]},
44:{nm:'Deep Dive',text:'A shared oxygen reserve (2 per player). Each cut costs 1, 2 or 3 by depth. It all comes back at the foreman\'s turn. Cannot pay: skip and burn a step. No talking.',rules:[{k:'oxygen',variant:'shared'},{k:'speech',what:'all'}]},
45:{nm:'Volunteers',text:'No fixed order. A number card is turned up and the first to call it must cut that value. A false call burns a step. If nobody calls, the foreman picks someone.',rules:[{k:'volunteer'}]},
46:{nm:'Lucky Sevens',text:'No reds; four yellows at 5.1, 6.1, 7.1 and 8.1. The four 7s must go last, all at once, by a player holding only 7s.',rules:[{k:'sevens'}]},
47:{nm:'Mental Math',text:'Twelve number cards face up. To cut, combine two of them by adding or subtracting: the result is the value you must cut. Cannot or will not: burn a step.',rules:[{k:'math'}]},
48:{nm:'Yellow Trio',text:'Three yellows, dealt one each. They go only all three at once by pointing at them; a miss tags every pointed wire and burns one step.',rules:[{k:'yellowTrio'}]},
49:{nm:'Bottle Post',text:'Each player keeps oxygen. To cut value V, first hand V oxygen to a crewmate. Cannot pay: skip and burn a step. No talking.',rules:[{k:'oxygen',variant:'gift'},{k:'speech',what:'all'}]},
50:{nm:'Lights Out',text:'No validation tokens or markers. Tokens are laid beside the stand, not in front of the wire: remember where they pointed.',info:'memory',rules:[{k:'memory'}]},
51:{nm:'Yes, Boss!',text:'Each turn the boss of the moment turns up a number card and picks who must cut it. The fuse starts one step further back.',rules:[{k:'sir'}]},
52:{nm:'Two-Faced',text:'Every token in this job is false: it means "this wire is NOT this value". Each player opens with two false tokens.',info:'false2',tok:'false'},
53:{nm:'Robo-Rogue',text:'No fuse dial: the robot is the fuse. It steps forward after cuts (two after a miss, back one when the cut matches its space). At 12, boom.',rules:[{k:'robotFuse'}]},
54:{nm:'Red Tide',text:'Timed job (10 minutes). All eleven reds wait in a pile and leak into hands. Oxygen by depth; validation tokens bring fresh air.',rules:[{k:'redTide'},{k:'oxygen',variant:'depth'}],audio:true},
55:{nm:'Dare Board',text:'One challenge card per player. The fuse starts one step from the end; each challenge met turns it back a step.',rules:[{k:'challenges'}]},
56:{nm:'Haywire',text:'Each player flips one own wire unseen to the far right. You must cut your own flipped wire yourself (plain cut, a miss is a boom). Cutting a crewmate\'s flipped wire costs a step.',rules:[{k:'flip',who:'each',n:1,others:1}]},
57:{nm:'Self-Destruct',text:'Each number is paired with a restriction. Each validation token switches on the paired restriction for everyone. If nobody can play for a whole round, boom.',rules:[{k:'globCon',mode:'paired',roundBlock:'explode'}]},
58:{nm:'Probe Party',text:'No info tokens at all. Every Twin Probe works every turn.',info:'none',tok:'none',rules:[{k:'unlimitedDD'}]},
59:{nm:'Robot Guide',text:'Number cards in a line with the robot on the 7. Move it forward (never back) to a value you hold and cut that value. Stuck: skip, burn a step, turn it round.',rules:[{k:'robotLine'}]},
60:{nm:'Dare Board Again',text:'As Dare Board: one challenge per player, fuse one step from the end.',rules:[{k:'challenges'}]},
61:{nm:'Pass It On',text:'Each player gets a restriction (A to E). Each round the crew may rotate them all. Anyone may swap theirs for a random F-L card by burning a step. If nobody can play for a whole round, boom.',rules:[{k:'persCon',pick:'random',rotate:true,swap:true,roundBlock:'explode'}]},
62:{nm:'Meteor Run',text:'One number card per player. The fuse starts one step from the end; each finished card value turns it back a step.',rules:[{k:'meteor'}]},
63:{nm:'Unsinkable',text:'The foreman starts with all the oxygen. Cut value V: pay V into the reserve. Pass all your oxygen left after your turn. The foreman refills each round. No talking.',rules:[{k:'oxygen',variant:'bundle'},{k:'speech',what:'all'}]},
64:{nm:'Double Haywire',text:'Each player flips two own wires unseen: the lower to the far left, the higher to the far right. Same rules as Haywire.',rules:[{k:'flip',who:'each',n:2,others:1}]},
65:{nm:'Hot Potato',text:'Number cards are dealt face up. You may only cut values on your cards; none: skip and burn a step. After each turn hand one card to a crewmate.',rules:[{k:'hotPotato'}]},
66:{nm:'Bunker Showdown',text:'Timed final job on the bunker map. Every cut moves the crew toward a side whose restriction it met. Reach the key, the guard, the stairs, the lever and the doctor in time, then finish the bomb.',rules:[{k:'bunker'}],audio:true}
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
  {t:60,len:20,check:'eqIfMissed',say:'A miss now costs the lowest ready equipment card. New target, 20 seconds.'},
  {t:80,len:15,check:'yellowCountIfHit',say:'Hit: everyone announces how many yellows they hold. New target, 15 seconds.'},
  {t:95,len:15,check:'mimeIfMissed',say:'Miss: the active player may only mime. New target, 15 seconds.'},
  {t:110,len:15,check:'holdIfHit',say:'Hit: the active player draws a number card and says if they hold it. New target, 15 seconds.'},
  {t:125,len:120,check:'finishIfHit',say:'Hit: the rest of that value is cut at once. Three targets now: nothing else may be cut until all of them are finished. 2 minutes.'},
  {t:245,len:120,check:'rush',say:'All three done: defused! Otherwise cut every remaining yellow at once, then 2 minutes to finish.'}]},
 m42:{acts:[
  {t:37,act:'magician',say:'The magician: everyone else looks away while a pair of cut wires goes back on its stands, uncut.'},
  {t:111,act:'tamerL',say:'The tamer cracks the whip: everyone moves one seat to the left, stands stay put.'},
  {t:161,act:'juggler',say:'The juggler swaps two cut wires of different values on their own stand.'},
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
  {t:42,ev:'leak',say:'A leak! The active player draws a red from the pile into their hand, in sorted order.'},
  {t:88,ev:'extra',say:'Busy hands: the active player takes another turn right after this one.'},
  {t:93,ev:'bottle',say:'A bottle! The active player takes one oxygen from the reserve.'},
  {t:130,ev:'leak',say:'Water is coming in: the active player draws a red.'},
  {t:229,ev:'transfer',say:'Transfer: the active player may give oxygen to, or take it from, one crewmate.'},
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
