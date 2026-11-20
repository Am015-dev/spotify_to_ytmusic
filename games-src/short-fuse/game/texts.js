// ===================== Short Fuse: texts for the page (all our own words) =====================
// One short briefing per job for the mission board: who called the crew, and where.
const BRIEFS={
1:"Day one at the depot. Brix rolls in a practice charge. Five blue numbers, no tricks.",
2:"Same practice charge, now with yellow tape on four leads. Yellow only matches yellow.",
3:"The trainers hide one red lead in the bundle. Touch it and the paint charge pops. Your first gear arrives.",
4:"A real call-out under the old cinema. All the blues, a low red and two high yellows. Nothing new.",
5:"A grumpy gardener wired the greenhouse. Two red tags hang there. Only one lead is real.",
6:"Four yellow tags in the freezer room. Two leads are real. Gloves on.",
7:"Three red tags under lane seven. One of them is real. Guess wrong and it is a strike.",
8:"Exam day on the pier. The chief listens to every word. Keep the numbers to yourself.",
9:"The first brass key turns up at the paint shop. One blue number is painted red.",
10:"Every gear card at the permit office is pinned under a form. Two stamps to unlock each.",
11:"The keeper left one tool: a roll call that never runs out. The lamp picks the numbers.",
12:"Four numbers chalked on the town hall steps. The Clockmaker wants them climbed in order.",
13:"A screen in the station shows 15:00. The Clockmaker never plays fair with time.",
14:"The gardener is back, hiding in the crew. Whoever draws the foreman card fibs all job.",
15:"A charge on the tram line. No time for turns: whoever is ready grabs the next cut.",
16:"The school gym. Everyone chalks two numbers they do NOT hold. Yellows bring a gift.",
17:"The tool lockers are glued shut. No personal tools. Yellows unlock a token draft.",
18:"The foreman wakes up with one wire flipped the wrong way. Everyone sees it but Brix.",
19:"The church bells ring seven times. The four 7s wait for the very end.",
20:"A laundry van, wired in a hurry. The last wire on each stand never got sorted.",
21:"A casino coin sorter. The tokens only say even or odd tonight.",
22:"A fairground wheel with twelve numbers. Spin, then cut what it shows.",
23:"Three red leads, one in each of three pockets. They must come out together.",
24:"A parcel van with a ticking parcel. Targets flash up and the clock does not wait.",
25:"The gear is locked in the van. One number opens it, but only all four at once.",
26:"The lights die in the museum. Tokens lie beside the stand. Remember where they pointed.",
27:"Five bulbs along the pier. Only the bulb under the arrow may be cut.",
28:"The gear arrives in sealed crates. Finish a number to open one.",
29:"A lemonade stand with three yellow leads, one per pocket. All three go at once.",
30:"A quiz show set. A number lights up and the first hand up must cut it.",
31:"The bell tower stairs. Three numbers in order, four wires each, and no saying numbers.",
32:"A new hire joins at random. Whoever draws the foreman card is green as grass.",
33:"Brix broke a finger. No crew card for the foreman, and one slip blows the job.",
34:"The accountant's office. Tokens count how many of a number sit on a stand.",
35:"A rulebook factory. The house rule changes every time a number is finished.",
36:"Each stand gets one extra blue, glued at the far right. The yellows unlock them.",
37:"The carnival is in town and its acts keep crashing the job.",
38:"Everyone draws a quirk card and must live with it. Until they cannot.",
39:"The card club. One number must go all four at once. Spare cards become tips.",
40:"The yellows are snares, one per player. The fuse is already short.",
41:"Someone on the crew works for the Clockmaker. Find them before the fuse does.",
42:"Shooting stars over the observatory. Each finished star number buys back a step.",
43:"A robot guard walks the number track. It carries wires of its own.",
44:"A fortune teller's tent. Your neighbour guesses your next number in secret.",
45:"A charge at the bottom of a well. Air is shared, deep cuts cost more, and nobody talks.",
46:"A boss of the moment barks the orders. Each turn a new number and a new victim.",
47:"The mirror maze. Every token in here lies.",
48:"The harbour pump room floods. Reds leak into hands and the air runs low.",
49:"The Clockmaker built the fuse himself: a little robot marching to 12.",
50:"The crew plays dares to buy time. Meet one and the fuse turns back.",
51:"Every finished number knocks a new rule into place. Do not get boxed in.",
52:"A robot rolls along a road of numbers. It only goes forward.",
53:"No tokens at all, but the Two Prongs work every single turn.",
54:"Quirk cards again, and they move around the table.",
55:"The tower's first floor is a giant abacus. Every cut is a sum.",
56:"Every crew member gets one wire flipped blind to the far right.",
57:"The tower lift is stuck. Pay for each cut with air sent to a crewmate. Silence.",
58:"The foreman holds the house rule and may change it every turn.",
59:"Dares again, but the tokens only say even or odd.",
60:"Number cards travel round the table. You may only cut what you are holding.",
61:"One air tank for the whole crew. It starts with the foreman and moves left.",
62:"Two blind wires each, one at each end of every hand.",
63:"Stars again, now counted. Tokens say how many, and the fuse is short.",
64:"The Clockmaker's bunker under the tower. Race the clock room to room.",
65:"The Clockmaker's apprentice hides in the crew, and one blue number is painted red.",
66:"The top of the clock tower. The Clockmaker's last device, against the clock."};
const BOXES=[[1,3,"Depot training"],[4,8,"First call-outs"],[9,18,"Act 1: calling cards"],[19,31,"Act 2: night shift"],[32,44,"Act 3: crew trouble"],[45,55,"Act 4: deep water"],[56,66,"Act 5: the clock tower"]];
// short name + icon + one line for each job rule (the job card shows these as visual chips)
const RULE_DOC={
 gate:['order','Order cards','Number cards set an order. Cut the shown count of each value before the next one opens.'],
 freeTurns:['hand','Grab a turn','No fixed order. After a turn, anyone eligible may claim the next one. Never twice in a row.'],
 timer:['clock','Against the clock','The job has a time limit. At zero the bomb goes off.'],
 fakeRed:['bomb','Fake red','One blue value acts as red. Never cut it, it is revealed at the end.'],
 eqCover:['gear','Covered gear','Each gear card needs two wires of its cover number cut. Only then does it unlock.'],
 redTriple:['bomb','Three reds at once','The reds go only together. Point at all three at once.'],
 rookie:['user','The rookie','The foreman-card holder is the rookie. A missed dual cut is a boom, and no Blast Blanket.'],
 eqDeckReveal:['gear','Hidden gear','Gear lies face down; finishing the shown number turns one up.'],
 liar:['mask','The fibber','The fibber\'s tokens mean "NOT this value". The fibber may not use gear.'],
 searchlight:['eye','Searchlight','Each turn a number is turned up and swept. Then someone is picked to cut it.'],
 xWire:['x','X wires','Unsorted wires marked X at the far right. Gear and tools cannot touch them.'],
 yellowGift:['gift','Yellow gift','The first two yellows go. Then everyone gives a token to the left.'],
 special4:['four','All four at once','The shown number goes only all at once. Point at all four of its wires.'],
 speech:['mute','No talking','Big Ears (job 25): no numbers out loud. Deep Dive, Bottle Post and Unsinkable (44, 49, 63). No talking at all, only a thumbs-up for "I need oxygen". The page lets you talk through the rules anyway.'],
 declare:['cards','Called numbers','Each turn, turn over a number card. Cut exactly that value.'],
 yellowDraft:['gift','Token draft','The first yellows go. Then everyone takes a token and places it truthfully.'],
 butterfingers:['user','Butterfingers','The foreman has no tools or gear. A missed dual cut is a boom.'],
 mindRead:['eye','Mind reading','The player on your right lays a secret card. Cutting that value burns a step.'],
 bus:['bus','No brakes','Timed targets, then a three-value rush, then a final dash.'],
 persCon:['ban','Own restriction','Each player obeys a restriction card of their own.'],
 globCon:['ban','Shared restriction','Everyone obeys the face-up restriction card.'],
 mole:['mask','The mole','A hidden weak link obeys a secret restriction. Accuse them to get your tools back.'],
 line5:['order','The arrow line','Only the arrowed value may be cut. The cutter chooses where the arrow goes next.'],
 flip:['flip','Flipped wires','Some wires are turned round. Seen by the crew, not by their owner.'],
 tripwire:['snare','Snare wires','Yellow snare wires: point at a crewmate\'s snare. Right turns the fuse back.'],
 circus:['star','Circus acts','Acts interrupt the job: wires return, seats move, cut wires are juggled.'],
 robotPatrol:['robot','Robot patrol','A robot walks the track holding wires. Cut its value to take one.'],
 oxygen:['bubble','Oxygen','Cuts cost oxygen. Cannot pay: skip the turn and burn a step.'],
 volunteer:['hand','Volunteers','A card is turned up. The first to call it must cut that value.'],
 sevens:['seven','Lucky sevens','The 7s go last, all four at once. A hand of only 7s must do it.'],
 math:['calc','Mental maths','Two face-up cards, added or subtracted, give the value to cut.'],
 yellowTrio:['four','Yellow trio','The three yellows go only together, in one pointing.'],
 memory:['eye','Lights out','Tokens lie beside the stand, not in front of the wire. No validation tokens.'],
 sir:['user','Yes, boss','The boss turns up a number and picks who cuts it.'],
 robotFuse:['robot','Robot fuse','The robot is the fuse: it steps forward after cuts. At 12, boom.'],
 redTide:['drop','Red tide','Reds leak from the pile into hands during the job.'],
 challenges:['trophy','Dares','Meet a dare card to turn the fuse back one step.'],
 unlimitedDD:['probe','Probe party','Every Two Prongs card works every turn.'],
 robotLine:['robot','Robot guide','Move the robot forward along the number line. Then cut the value under it.'],
 meteor:['star','Meteors','Each finished meteor value turns the fuse back a step.'],
 hotPotato:['cards','Hot potato','Cut only values on your cards. Hand one card on after each turn.'],
 bunker:['map','Bunker','Each cut moves the crew on the bunker map. Reach each objective in time.']};
const TOKFAM_DOC={par:'Info tokens show only EVEN or ODD.',cnt:'Count tokens (x1, x2, x3). They show how many of that value are on that stand. Cut ones are included.',false:'Every token is false: it means "this wire is NOT this value".',none:'No info tokens at all: a miss shows nothing.'};
const INFO_DOC={rand:'Opening tokens are placed at random.',none:'No opening tokens.',neg:'Opening tokens say two values you do NOT hold.',false:'Opening tokens are false.'};
// why the job was lost, in plain words, with a tip
function lossHelp(why){why=String(why||'');
  if(/fuse burnt/.test(why))return ['The fuse burnt down.','Every miss burns one step. The last step is the explosion. Point at wires the crew knows more about (tokens, sorted order). Use a Two Prongs on a 50/50. Keep Fuse Pinch for the last step.'];
  if(/pointed at.*red|red wire/.test(why))return ['Someone pointed at a red wire.','Red wires go off when pointed at. Watch the red markers on the track. They show which values a red sits between. A wire whose neighbours are close to a red value is risky.'];
  if(/clock|time ran out|bus ran out|flooded/.test(why))return ['Time ran out.','In timed jobs, quick certain cuts are worth more than careful 50/50s. Solo cuts and probes save turns.'];
  if(/robot reached 12/.test(why))return ['The robot reached the end.','Misses push the robot two spaces. Cutting the value it stands on pulls it back one.'];
  if(/flipped/.test(why))return ['A flipped wire went wrong.','Your own flipped wire is the one you cannot see. Cut it only when tokens and sort order leave one value.'];
  if(/no legal cut|could play|no progress|nobody/.test(why))return ['The crew got stuck.','When nobody can cut, the bomb goes off. Keep options open. Do not spread a value so thin that nobody can match it.'];
  if(/called red/.test(why))return ['A red call was wrong.','Call red only when the tokens and red markers make it certain.'];
  if(/objective missed/.test(why))return ['An objective was missed.','In the bunker, every cut moves the crew. Pick cuts that meet the restriction on the side you need.'];
  if(/call was wrong/.test(why))return ['The all-at-once call was wrong.','Point at all the wires only when you are sure of each.'];
  return ['The bomb went off: '+why+'.','Read the job card again for its special rules. Then try once more.']}
// the guided first game (job 1): short steps, shown one at a time in the dock
const TUTORIAL=[
 {id:'hello',t:'Welcome to the crew!',p:'You defuse the bomb together. <b>Cut every wire</b> on every stand to win. The <b>fuse</b> (top of the panel) burns one step on every miss. When it is gone, boom.'},
 {id:'stand',t:'Your stand',p:'Your wires stand at the front of the table. They are face up for you and sorted low to high. Your crewmates see only the backs. You see only theirs. Their wires are sorted too.'},
 {id:'open',t:'The opening token',p:'Everyone starts by showing one wire to the crew. A token with its number goes in front of it. Pick one of yours.'},
 {id:'dual',t:'Your turn: a dual cut',p:'Tap a <b>glowing wire of a crewmate</b>. Then say a number <b>you hold</b>. Right: both wires are cut. Wrong: the fuse burns a step. Clues: the shown numbers. Every rack is sorted low to high.'},
 {id:'value',t:'Say the number',p:'Now pick the number you think it is. You can only say numbers you hold yourself. Tokens and the sort order are your clues.'},
 {id:'confirm',t:'Snip!',p:'Check the summary and press the big button. The "What we know" box suggests a move and says why.'},
 {id:'hit',t:'Both wires are cut',p:'A hit cuts their wire. It also cuts your wire of the same value. A fully cut value gets a green check on the track.'},
 {id:'miss',t:'BUZZ: a miss',p:'A miss burns one step of the fuse. The crewmate puts a token before that wire. It shows the true number. Now everyone knows it.'},
 {id:'solo',t:'A solo cut',p:'Do you hold <b>all</b> the wires still left of a value? That means all four, or the last two. Then you may cut them yourself. No pointing needed. A solo cut never fails. Look for the solo button.'},
 {id:'know',t:'What we know',p:'The bulb button opens a table of what every wire could be. Use it whenever you are unsure.'}];
// how to play: in the order a player meets things
const RULES_HTML=`
<h3>The goal</h3><p>A villain has wired a bomb. Your crew of 2 to 5 defuses it <b>together</b>: you win when <b>every wire</b> on every stand is cut or revealed. You lose if the fuse burns down. You also lose if anyone points at a red wire. Or if the job's own special rule says so.</p>
<h3>How a round goes</h3><ol>
<li><b>Setup.</b> Each player gets a stand of wires, sorted from low to high. With 2 players, each has two stands. With 3, the foreman has two. Your wires face you. You never see a crewmate's wires. They never see yours.</li>
<li><b>Opening tokens.</b> Starting with the foreman, everyone places one info token. It goes in front of one of their own blue wires. It shows that wire's number.</li>
<li><b>Turns.</b> The foreman goes first, then clockwise. On your turn you do exactly <b>one</b> action. Pick a dual cut, a solo cut or a reveal. A reveal needs a hand of only reds.</li>
<li><b>Repeat</b> until every wire is cut, or the bomb goes off. A player with no wires left is skipped.</li></ol>
<h3>The wires</h3><ul><li><b>Blue</b> 1 to 12, four of each (48). These are the ones you match.</li>
<li><b>Yellow</b> (up to 11). Every yellow is simply "yellow". You match a yellow with a yellow. They sort between the blues. A 3.1 yellow sits between the 3s and the 4s.</li>
<li><b>Red</b> (up to 11). Never match them. Pointing at a red is an explosion. They sort between the blues too. A 6.5 red sits between the 6s and the 7s.</li></ul>
<p>The track markers show which red and yellow values this job uses. "2 out of 3" means three values are marked. Only two wires are really there.</p>
<h3>Dual cut</h3><p>Point at one uncut wire of a crewmate. Say a number you <b>hold yourself</b>. Or say "yellow" if you hold a yellow. Never say "red".</p><ul>
<li><b>Hit:</b> their wire is turned face up and cut. You cut one of yours of the same value.</li>
<li><b>Miss:</b> the fuse burns one step. The crewmate puts an info token in front of that wire. It shows the wire's true number. Your own wire stays hidden.</li>
<li><b>Red:</b> if the wire you pointed at is red, boom.</li></ul>
<h3>Solo cut</h3><p>Is <b>every</b> remaining uncut wire of a value in your hand? That means all four. Or the last two, after a pair was cut. Then you may cut them all at once. It never fails. You can never solo cut three.</p>
<h3>Reveal reds</h3><p>If every wire you still hold is red, you reveal them. You do it at the start of your turn. The page does it for you.</p>
<h3>Clues</h3><ul><li><b>Sort order:</b> every stand is sorted. A wire between 4 and 6 is a 4, 5 or 6. It could also be a red or yellow in between.</li>
<li><b>Info tokens</b> show a wire's number. Some jobs use other tokens. Even/odd, counts ("x2 on this stand") or false ("NOT this").</li>
<li><b>Validation tokens</b>: a value has all four wires cut. A green check goes on the track.</li>
<li><b>Announcements.</b> Some gear makes the crew answer out loud. A Roll Call: "yes, I hold a 7". The dock and What we know show every announcement.</li></ul>
<h3>House rules</h3><p>Two things are our own additions, not part of the tabletop game: a hand with no legal cut skips its turn, and after four rounds with no progress the bomb goes off, so a game cannot run forever. Only jobs 9, 16 and 36 blow the bomb on a skipped turn. Also: when only red wires remain, they are revealed for you, and earlier answers stay visible on the page.</p>
<h3>No free talk</h3><p>You may not tell crewmates what you hold. The page enforces that. You can share only through moves, tokens and required answers.</p>
<h3>The fuse</h3><p>It starts with one step per player. Some jobs start lower. It can never go above 6. A miss burns one step. At zero the bomb explodes.</p>
<h3>Equipment</h3><p>From job 3, the board holds one locked gear card per player. Each card unlocks when two wires of its number are cut. Double cards need all four. It then works once. "Any time" cards work even when it is not your turn. Never use one in the middle of a question. "Your turn" cards are part of your action. Open <b>Gear</b> to read them all.</p>
<h3>Crew cards and personal tools</h3><p>Everyone has a crew card with a personal tool. It is usually a <b>Two Prongs</b>. Use it once per job. Point at two wires on one crewmate stand and say a number. It works if either matches. One red plus one other: no explosion. The token goes on the other wire. Both red: boom. From job 31, new crew members bring other tools.</p>
<h3>Special jobs</h3><p>From job 9, most jobs add a twist. An order, a timer, limits, robots, oxygen... The <b>Job</b> button opens the job card. It shows each special rule as a picture and a line.</p>
<h3>On this page</h3><ul><li>The <b>dock</b> is beside the board, or under it on a phone. It always says what the game is waiting for. It has a button for every option.</li>
<li>Tap a <b>glowing wire</b> on the table to pick it. Then tap the value. Then tap the big button.</li>
<li><b>Hot-seat:</b> the next player may be another human. Then the dock asks you to pass the device. The table shows only wire backs until they confirm.</li>
<li><b>Timed jobs</b> show a countdown in the dock. The pause button stops the clock and the computer crew.</li>
<li>Keys: <kbd>Esc</kbd> closes a popup, <kbd>F9</kbd> shows the speed overlay.</li></ul>`;
// every wire, token, card and table in the game (the Cards drawer, and dump_ref.js for the shared reference page)
function refEntries(){const E=[];const add=(s,n,tags,t,c,sub)=>E.push({s,n,tags:(tags||[]).filter(Boolean),t,c:c==null?null:c,sub:sub||[]});
 add('Wires','Blue wire',['1 to 12','four of each'],'The wires you match. Four of every number from 1 to 12. Some training jobs use only the low numbers.',48);
 add('Wires','Yellow wire',['1.1 to 11.1'],'Every yellow counts simply as "yellow". You match a yellow with a yellow of your own. Its decimal only places it in the sort order. For example, 3.1 sits between the 3s and the 4s. A job uses some of them.',11);
 add('Wires','Red wire',['1.5 to 11.5'],'Never match a red. Pointing at one is an explosion. Its decimal only places it in the sort order. For example, 6.5 sits between the 6s and the 7s. A hand of only reds is revealed.',11);
 add('Wires','Stand',['one per player. Two with 2 players. Foreman gets two with 3.'],'Holds a hand of wires, sorted low to high, facing its owner. A player with two stands treats them as one hand.',5);
 add('Tokens','Info token',['1 to 12 and yellow','two of each'],'Shows the true value of the wire it stands in front of. Placed at the start (one each) and after every miss. A cut wire returns its token to the supply. On screen only (a convenience, not a tabletop rule): when the supply runs dry, a token is still "spoken".',26);
 add('Tokens','Validation token',['green check'],'Goes on the track once a value has all four wires cut.',12);
 add('Tokens','Red and yellow markers',['on the track'],'Show which red and yellow values are in the job. "2 out of 3": three are marked. Only two wires are really in play. The markers show a "?".',null);
 add('Tokens','Even / odd token',['jobs 21, 33'],'Replaces info tokens. It tells only whether the wire is even or odd. Yellow keeps its own token.',null);
 add('Tokens','Count token (x1, x2, x3)',['jobs 24, 40'],'Replaces info tokens. That value appears that many times on that stand, cut wires included. Never on a red.',null);
 add('Tokens','False token',['jobs 17, 52'],'Means "this wire is NOT this value". Shown on the table as "!5".',null);
 add('Tokens','Equal / unequal tag',['from the Equal and Odd-Pair Clip cards'],'Clipped between two neighbouring wires of one stand. They are the same value, or they are different values.',2);
 add('Tokens','X token',['jobs 20, 35'],'Marks an unsorted wire at the right end of a stand. No gear and no personal tool can touch it.',null);
 add('Tokens','Oxygen token',['jobs 44, 49, 54, 63'],'Paid to cut in the diving jobs. Cannot pay: skip the turn and burn a step.',null);
 add('Tokens','Number card',['1 to 12'],'Used by many jobs. It can be an order to follow. Or a called value. Or a secret prediction. Or a value that acts as red.',12);
 add('Tokens','Fuse (detonator dial)',['starts at one step per player','max 6'],'Burns one step on every miss (two with restriction L). At zero the bomb goes off. Some jobs start it at 1. Some turn it back for dares and meteors.',1);
 add('Tokens','Robot',['jobs 43, 53, 59'],'A wind-up robot standee. In job 43 it walks the track holding wires. In job 53 it is the fuse itself. In job 59 it guides the number line.',1);
 for(const id of EQ_IDS){const e=EQUIP[id];add('Equipment cards',e.n,['unlocks at '+(e.need===4?'four':'two')+' '+(e.v==='Y'?'yellows':e.v+'s'),{any:'any time',turn:'your turn',start:'start of your turn',instant:'instant'}[e.timing],{base:'base',yellow:'from job 9 in yellow jobs',double:'double card, from job 55'}[e.pool]],e.text,1)}
 for(const id in CHARS){const c=CHARS[id];add('Crew cards',c.n,[ITEMS[c.item].n,c.captain?'foreman':'',c.newc?'from job 31':''],c.text+' Personal tool: '+ITEMS[c.item].n+'.',1)}
 for(const id in ITEMS)add('Personal tools',ITEMS[id].n,[ITEMS[id].timing==='any'?'any time':'your turn','once per job'],ITEMS[id].text,null);
 for(const k of CON_IDS)add('Restriction cards',k+': '+CONSTRAINTS[k].n,[],CONSTRAINTS[k].text,1);
 for(const k in CHALLENGES)add('Dare cards',k+': '+CHALLENGES[k].n,['jobs 55, 60'],CHALLENGES[k].text+' Met: discard it and turn the fuse back one step.',1);
 for(const f of BUNKER.floors)add('Bunker map (job 66)',f.name,[],'Squares: '+Object.values(f.squares).filter((v,i,a)=>a.indexOf(v)===i).join(', ')+'. Walls block moves; the door and the laser open with their objectives.',1);
 for(const k in RULE_DOC)add('Job rules',RULE_DOC[k][1],[],RULE_DOC[k][2],null);
 for(let n=1;n<=66;n++){const M=MISSIONS[n];add('Jobs',n+'. '+M.nm,[M.pl.length<4?'3-5 players':'2-5 players',M.audio||hasRule(n,'timer')?'timed':''],M.text,null)}
 return E}
