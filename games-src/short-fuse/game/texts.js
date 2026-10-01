// ===================== Short Fuse: texts for the page (all our own words) =====================
// One short briefing per job for the mission board: who called the crew, and where.
const BRIEFS={
1:'Day one at the depot. Brix wheels in a practice charge: six colours of blue, no tricks. Learn to point, call and snip.',
2:'Same practice rig, now with two yellow leads taped in. Yellow is just "yellow": you can only match it with one of your own.',
3:'The trainers hid a red lead in the bundle. Touch it and the paint bomb goes off all over the depot. Your first gear arrives.',
4:'A real call-out: an old cinema basement. Every blue colour, one red, two yellows. Nothing new, so nothing to blame.',
5:'A greenhouse rigged by a gardener with a grudge. Three yellow tags on the board, but only two leads are really there.',
6:'Four yellows in the ice-cream factory. Cut them in pairs, or clear them all from one hand at once.',
7:'The bowling alley. Two red tags, one real red. Guess wrong and it is strikes all round.',
8:'Graduation day on the old pier. The chief is watching. No special rules: just clean, careful work.',
9:'The town hall clock tower. The bomber left three numbers: they must go in that order, two at a time.',
10:'A coffee shop with no coffee and a ticking timer. No fixed turns: whoever is ready grabs the next one.',
11:'The paint shop. The red leads are gone, but one blue colour has been rigged to act like red.',
12:'Paperwork at the permit office. Every gear card is pinned under a form that needs its own number cleared first.',
13:'Three red leads, dealt one to each of you. They come out only together, in one brave grab.',
14:'A rookie joins the crew today. Nobody knows who until the cards are dealt. A rookie miss is a big bang.',
15:'The orders arrived scrambled. The gear is face down and turns up only as the crew finishes the numbers on the deck.',
16:'Back at the clock tower, and the bomber is fussier: all four of each number in order this time.',
17:'Somebody on the crew is a fibber. Their tokens all mean "NOT this", and they keep their hands off the gear.',
18:'Night shift at the docks. Only the searchlight works: it sweeps one number each turn and picks who must cut it.',
19:'A cave lair with a villain who cheats at his own countdown. The screen says fifteen minutes. It is lying.',
20:'The rail yard. Each stand has one wire that would not sort: it sits at the end with an X, out of reach of every gadget.',
21:'The sock factory. The tokens only say "even" or "odd". Pairs matter more than ever.',
22:'A lighthouse. Instead of showing a wire, everyone first says two numbers they do NOT have.',
23:'Small-town fair. One number must go all four at once, and the gear is still locked in the van.',
24:'The census office. Tokens count: "this number is on this stand twice". Count carefully.',
25:'A library where the bomber can hear you. Not a single number may be spoken out loud.',
26:'Bingo hall. The caller turns one card each turn, and that is the number you must cut.',
27:'Putty everywhere at the toy store. No personal tools, and the first yellow pair hands out fresh tokens.',
28:'The foreman broke a wrist skating. No tools, no gear, and a missed cut is a disaster.',
29:'A fortune-teller\'s tent. The crewmate on your right secretly predicts the number you should NOT cut.',
30:'A runaway school bus. Quick targets, a three-value rush, then a final dash before the bridge.',
31:'Charity race day. Each of you drafts a handicap card and must play by it.',
32:'The circus clowns rigged the rules too: one shared restriction that the foreman may swap every turn.',
33:'The casino. Even or odd, that is all the tokens will tell you.',
34:'There is a mole on the crew. One of you secretly plays by a hidden restriction. Find them.',
35:'Hard-wired: an extra X wire on every stand that may go only after all four yellows are out.',
36:'Beach day panic. Five numbers in a row; the arrow says which one is next.',
37:'The stadium. The shared restriction changes every time a number is finished.',
38:'The foreman has a blind spot: one of their wires is flipped, seen by everyone but them.',
39:'The royal court. One noble number must go all four at once before the deck runs dry.',
40:'A tower block with count tokens everywhere, the opening ones too.',
41:'Snares on the lawn: each of you holds one yellow snare wire. The fuse is already nearly gone.',
42:'Big top night. The acts keep interrupting: wires come back, seats move, cut wires fly.',
43:'A friendly robot walks the track holding spare wires. Cut the number it stands on to take one.',
44:'Deep dive. Every cut costs shared oxygen, and talking is out: only a thumbs-up for air.',
45:'Volunteers wanted. A card is turned up, and the first to shout takes the cut.',
46:'Lucky sevens. The four 7s go last, all together, from a hand of nothing but 7s.',
47:'The maths club. Two face-up cards, added or subtracted, give the number you must cut.',
48:'Three yellows, one each. They go only together, in one pointing.',
49:'Bottle post on a desert island. Before cutting a number, hand that much oxygen to a crewmate. No talking.',
50:'Lights out in the museum. Tokens lie beside the stand, so remember where they pointed.',
51:'Yes, boss! The boss of the moment turns up a number and picks who cuts it.',
52:'Two-faced: every token in this job is false. "5" means "not a 5".',
53:'A rogue robot is the fuse. It steps forward after every cut, and twice after a miss.',
54:'Red tide in the submarine. All eleven reds leak into your hands, and the oxygen runs low.',
55:'The dare board. Meet the dares on the table to win back steps of a nearly burnt fuse.',
56:'Haywire: each of you has one wire flipped, unseen by you, at the far end.',
57:'Self-destruct mode. Each finished number switches on a new restriction for everyone.',
58:'Probe party: no tokens at all, but every Twin Probe works every turn.',
59:'A robot guide walks a line of numbers. Move it forward and cut what it points at.',
60:'The dare board, round two. Four dares, one nearly burnt fuse.',
61:'Pass it on. Restrictions rotate around the table each round.',
62:'Meteor run. Each finished meteor number turns the fuse back a step.',
63:'The unsinkable liner. The oxygen bundle passes around the table after every turn.',
64:'Double haywire: two flipped wires each, one at each end.',
65:'Hot potato. You may only cut numbers on your cards, and you hand one on after each turn.',
66:'The bunker showdown. Race the clock through the villain\'s bunker and finish the bomb.'};
const BOXES=[[1,3,'Boot camp'],[4,8,'Field days'],[9,19,'Box 1: trouble in town'],[20,30,'Box 2: strange days'],[31,42,'Box 3: crew games'],[43,54,'Box 4: deep trouble'],[55,66,'Box 5: the final season']];
// short name + icon + one line for each job rule (the job card shows these as visual chips)
const RULE_DOC={
 gate:['order','Order cards','Number cards set an order: cut the shown count of each value before the next one opens.'],
 freeTurns:['hand','Grab a turn','No fixed order: after a turn, anyone eligible may claim the next one (never twice in a row).'],
 timer:['clock','Against the clock','The job has a time limit. At zero the bomb goes off.'],
 fakeRed:['bomb','Fake red','One blue value acts as red: never cut it, it is revealed at the end.'],
 eqCover:['gear','Covered gear','Each gear card also needs two wires of its cover number cut before it unlocks.'],
 redTriple:['bomb','Three reds at once','The reds go only together, by pointing at all three at once.'],
 rookie:['user','The rookie','The foreman-card holder is the rookie: a missed dual cut is a boom, and no Damper.'],
 eqDeckReveal:['gear','Hidden gear','Gear lies face down; finishing the shown number turns one up.'],
 liar:['mask','The fibber','The fibber\'s tokens mean "NOT this value"; the fibber may not use gear.'],
 searchlight:['eye','Searchlight','Each turn a number is turned up and swept, then someone is picked to cut it.'],
 xWire:['x','X wires','Unsorted wires marked X at the far right; gear and tools cannot touch them.'],
 yellowGift:['gift','Yellow gift','When the first two yellows go, everyone gives a token to the left.'],
 special4:['four','All four at once','The shown number goes only by pointing at all four of its wires at once.'],
 speech:['mute','No talking','Big Ears (job 25): no numbers out loud. Deep Dive, Bottle Post and Unsinkable (44, 49, 63): no talking at all, only a thumbs-up for "I need oxygen". The page lets you talk through the rules anyway.'],
 declare:['cards','Called numbers','Each turn turn over a number card and cut exactly that value.'],
 yellowDraft:['gift','Token draft','When the first yellows go, everyone takes a token and places it truthfully.'],
 butterfingers:['user','Butterfingers','The foreman has no tools or gear and a missed dual cut is a boom.'],
 mindRead:['eye','Mind reading','The player on your right lays a secret card: cutting that value burns a step.'],
 bus:['bus','No brakes','Timed targets, then a three-value rush, then a final dash.'],
 persCon:['ban','Own restriction','Each player obeys a restriction card of their own.'],
 globCon:['ban','Shared restriction','Everyone obeys the face-up restriction card.'],
 mole:['mask','The mole','A hidden weak link obeys a secret restriction. Accuse them to get your tools back.'],
 line5:['order','The arrow line','Only the arrowed value may be cut; the cutter chooses where the arrow goes next.'],
 flip:['flip','Flipped wires','Some wires are turned round: seen by the crew, not by their owner.'],
 tripwire:['snare','Snare wires','Yellow snare wires: point at a crewmate\'s snare. Right turns the fuse back.'],
 circus:['star','Circus acts','Acts interrupt the job: wires return, seats move, cut wires are juggled.'],
 robotPatrol:['robot','Robot patrol','A robot walks the track holding wires; cut its value to take one.'],
 oxygen:['bubble','Oxygen','Cuts cost oxygen. Cannot pay: skip the turn and burn a step.'],
 volunteer:['hand','Volunteers','A card is turned up; the first to call it must cut that value.'],
 sevens:['seven','Lucky sevens','The 7s go last, all four at once, by a hand of only 7s.'],
 math:['calc','Mental maths','Two face-up cards, added or subtracted, give the value to cut.'],
 yellowTrio:['four','Yellow trio','The three yellows go only together, in one pointing.'],
 memory:['eye','Lights out','Tokens lie beside the stand, not in front of the wire. No validation tokens.'],
 sir:['user','Yes, boss','The boss turns up a number and picks who cuts it.'],
 robotFuse:['robot','Robot fuse','The robot is the fuse: it steps forward after cuts. At 12, boom.'],
 redTide:['drop','Red tide','Reds leak from the pile into hands during the job.'],
 challenges:['trophy','Dares','Meet a dare card to turn the fuse back one step.'],
 unlimitedDD:['probe','Probe party','Every Twin Probe works every turn.'],
 robotLine:['robot','Robot guide','Move the robot forward along the number line and cut the value under it.'],
 meteor:['star','Meteors','Each finished meteor value turns the fuse back a step.'],
 hotPotato:['cards','Hot potato','Cut only values on your cards; hand one card on after each turn.'],
 bunker:['map','Bunker','Each cut moves the crew on the bunker map; reach each objective in time.']};
const TOKFAM_DOC={par:'Info tokens show only EVEN or ODD.',cnt:'Count tokens (x1, x2, x3): how many of that value are on that stand, cut ones included.',false:'Every token is false: it means "this wire is NOT this value".',none:'No info tokens at all: a miss shows nothing.'};
const INFO_DOC={rand:'Opening tokens are placed at random.',none:'No opening tokens.',neg:'Opening tokens say two values you do NOT hold.',false:'Opening tokens are false.'};
// why the job was lost, in plain words, with a tip
function lossHelp(why){why=String(why||'');
  if(/fuse burnt/.test(why))return ['The fuse burnt down.','Every miss burns one step, and the last step is the explosion. Point at wires the crew knows more about (tokens, sorted order), use a Twin Probe on a 50/50, and keep Rewind for the last step.'];
  if(/pointed at.*red|red wire/.test(why))return ['Someone pointed at a red wire.','Red wires go off when pointed at. Watch the red markers on the track: they show which values a red sits between. A wire whose neighbours are close to a red value is risky.'];
  if(/clock|time ran out|bus ran out|flooded/.test(why))return ['Time ran out.','In timed jobs, quick certain cuts are worth more than careful 50/50s. Solo cuts and probes save turns.'];
  if(/robot reached 12/.test(why))return ['The robot reached the end.','Misses push the robot two spaces. Cutting the value it stands on pulls it back one.'];
  if(/flipped/.test(why))return ['A flipped wire went wrong.','Your own flipped wire is the one you cannot see: cut it only when the crew\'s tokens and the sort order leave one value.'];
  if(/no legal cut|could play|no progress|nobody/.test(why))return ['The crew got stuck.','When nobody can cut, the bomb goes off. Keep options open: do not leave a value spread so thin that nobody can match it.'];
  if(/called red/.test(why))return ['A red call was wrong.','Call red only on a wire that the tokens and the red markers make certain.'];
  if(/objective missed/.test(why))return ['An objective was missed.','In the bunker every cut moves the crew. Pick cuts whose value meets the restriction on the side you need to go.'];
  if(/call was wrong/.test(why))return ['The all-at-once call was wrong.','Point at all the wires only when you are sure of every one of them.'];
  return ['The bomb went off: '+why+'.','Read the job card again for its special rules, then try once more.']}
// the guided first game (job 1): short steps, shown one at a time in the dock
const TUTORIAL=[
 {id:'hello',t:'Welcome to the crew!',p:'You defuse the bomb together. <b>Cut every wire</b> on every stand to win. The <b>fuse</b> (top of the panel) burns one step on every miss: when it is gone, boom.'},
 {id:'stand',t:'Your stand',p:'Your wires stand at the front of the table, face up for you and sorted from low to high. Your crewmates see only the backs, and you see only theirs. Their wires are sorted too.'},
 {id:'open',t:'The opening token',p:'Everyone starts by showing one wire to the crew: a token with its number goes in front of it. Pick one of yours.'},
 {id:'dual',t:'A dual cut',p:'On your turn, point at <b>one wire of a crewmate</b> and say a number <b>you hold</b>. If it matches, both wires are cut. Tap a glowing wire on the table to start.'},
 {id:'value',t:'Say the number',p:'Now pick the number you think it is. You can only say numbers you hold yourself. Tokens and the sort order are your clues.'},
 {id:'confirm',t:'Snip!',p:'Check the summary and press the big button. The "What we know" box suggests a move and says why.'},
 {id:'hit',t:'Both wires are cut',p:'A hit cuts their wire and one of yours of the same value. When all four of a value are cut, a green check goes on the track.'},
 {id:'miss',t:'BUZZ: a miss',p:'A miss burns one step of the fuse, and the crewmate puts a token showing the true number in front of that wire. Now everyone knows it.'},
 {id:'solo',t:'A solo cut',p:'If you hold <b>all</b> the wires still left of a value (all four, or the last two), you may cut them yourself without pointing: a solo cut never fails. Look for the solo button.'},
 {id:'know',t:'What we know',p:'The bulb button opens the full table of what every wire could be. Use it whenever you are unsure.'}];
// how to play: in the order a player meets things
const RULES_HTML=`
<h3>The goal</h3><p>A villain has wired a bomb. Your crew of 2 to 5 defuses it <b>together</b>: you win when <b>every wire on every stand is cut or revealed</b>. You lose if the fuse burns down, if anyone points at a red wire, or if the job's own special rule says so.</p>
<h3>How a round goes</h3><ol>
<li><b>Setup.</b> Each player gets a stand of wires, sorted from low to high. With 2 players each has two stands; with 3, the foreman has two. Your wires face you: you never see a crewmate's wires and they never see yours.</li>
<li><b>Opening tokens.</b> Starting with the foreman, everyone places one info token in front of one of their own blue wires, showing its number.</li>
<li><b>Turns.</b> The foreman goes first, then clockwise. On your turn you do exactly <b>one</b> action: a dual cut, a solo cut, or (if you hold only reds) reveal your reds.</li>
<li><b>Repeat</b> until every wire is cut, or the bomb goes off. A player with no wires left is skipped.</li></ol>
<h3>The wires</h3><ul><li><b>Blue</b> 1 to 12, four of each (48). These are the ones you match.</li>
<li><b>Yellow</b> (up to 11). Every yellow is simply "yellow": you match a yellow with a yellow. They sort between the blues (a 3.1 yellow sits between the 3s and the 4s).</li>
<li><b>Red</b> (up to 11). Never match them. Pointing at a red is an explosion. They sort between the blues too (a 6.5 red sits between the 6s and the 7s).</li></ul>
<p>The markers on the track show which red and yellow values are in this job. "2 out of 3" means three values are marked but only two wires are really there.</p>
<h3>Dual cut</h3><p>Point at one uncut wire of a crewmate and say a number you <b>hold yourself</b> (or "yellow" if you hold a yellow). Never "red".</p><ul>
<li><b>Hit:</b> their wire is turned face up and cut, and you cut one of yours of the same value.</li>
<li><b>Miss:</b> the fuse burns one step, and the crewmate puts an info token showing that wire's true number in front of it. Your own wire stays hidden.</li>
<li><b>Red:</b> if the wire you pointed at is red, boom.</li></ul>
<h3>Solo cut</h3><p>If <b>every</b> remaining uncut wire of a value is in your hand (all four, or the last two after a pair was cut), you may cut them all at once. It never fails. You can never solo cut three.</p>
<h3>Reveal reds</h3><p>If every wire you still hold is red, you reveal them at the start of your turn (the page does it for you).</p>
<h3>Clues</h3><ul><li><b>Sort order:</b> every stand is sorted. A wire between a 4 and a 6 is a 4, a 5 or a 6 (or a red or yellow in between).</li>
<li><b>Info tokens</b> show a wire's number. Some jobs use other tokens: even/odd, counts ("x2 on this stand"), or false tokens ("NOT this").</li>
<li><b>Validation tokens</b>: when all four of a value are cut, a green check goes on the track.</li>
<li><b>Announcements:</b> some gear makes the crew answer out loud (a Sweep: "yes, I hold a 7"). The page shows every announcement in the dock and in What we know.</li></ul>
<h3>No free talk</h3><p>You may not tell crewmates what you hold. The page enforces that: the only ways to share are the moves themselves, the tokens and the answers the rules ask for.</p>
<h3>The fuse</h3><p>It starts with one step per player (some jobs start lower) and can never go above 6. A miss burns one step; at zero the bomb explodes.</p>
<h3>Equipment</h3><p>From job 3, one gear card per player lies on the board, locked. Each card unlocks the moment two wires of its number are cut (double cards: all four). It then works once. "Any time" cards may be used even when it is not your turn (not in the middle of a question). "Your turn" cards are part of your action. Open <b>Gear</b> to read them all.</p>
<h3>Crew cards and personal tools</h3><p>Everyone has a crew card with a personal tool, usually a <b>Twin Probe</b>: once per job, point at two wires on one crewmate stand and say a number; it works if either matches (one red plus one other: no explosion and the token goes on the other wire; both red: boom). From job 31 new crew members bring other tools.</p>
<h3>Special jobs</h3><p>From job 9 most jobs add a twist: an order to follow, a timer, restrictions, robots, oxygen... The <b>Job</b> button opens the job card with every special rule as a picture and a line of text.</p>
<h3>On this page</h3><ul><li>The <b>dock</b> (right, or under the board on a phone) always says what the game is waiting for, with a button for every option.</li>
<li>Tap a <b>glowing wire</b> on the table to pick it, then tap the value, then the big button.</li>
<li><b>Hot-seat:</b> when the next player is another human, the dock asks you to pass the device, and the table shows only wire backs until they confirm.</li>
<li><b>Timed jobs</b> show a countdown in the dock. The pause button stops the clock and the computer crew.</li>
<li>Keys: <kbd>Esc</kbd> closes a popup, <kbd>F9</kbd> shows the speed overlay.</li></ul>`;
// every wire, token, card and table in the game (the Cards drawer, and dump_ref.js for the shared reference page)
function refEntries(){const E=[];const add=(s,n,tags,t,c,sub)=>E.push({s,n,tags:(tags||[]).filter(Boolean),t,c:c==null?null:c,sub:sub||[]});
 add('Wires','Blue wire',['1 to 12','four of each'],'The wires you match. Four of every number from 1 to 12. Some training jobs use only the low numbers.',48);
 add('Wires','Yellow wire',['1.1 to 11.1'],'Every yellow counts simply as "yellow": you match a yellow with a yellow of your own. Its decimal only places it in the sort order (3.1 sits between the 3s and the 4s). A job uses some of them.',11);
 add('Wires','Red wire',['1.5 to 11.5'],'Never match a red. Pointing at one is an explosion. Its decimal only places it in the sort order (6.5 sits between the 6s and the 7s). A hand of only reds is revealed.',11);
 add('Wires','Stand',['one per player, two with 2 players, two for the foreman with 3'],'Holds a hand of wires, sorted low to high, facing its owner. A player with two stands treats them as one hand.',5);
 add('Tokens','Info token',['1 to 12 and yellow','two of each'],'Shows the true value of the wire it stands in front of. Placed at the start (one each) and after every miss. A cut wire returns its token to the supply; when the supply runs dry, a token is still "spoken".',26);
 add('Tokens','Validation token',['green check'],'Goes on the track when all four wires of a value are cut.',12);
 add('Tokens','Red and yellow markers',['on the track'],'Show which red and yellow values are in the job. "2 out of 3": three are marked but only two wires are really in play (the markers show a "?").',null);
 add('Tokens','Even / odd token',['jobs 21, 33'],'Replaces info tokens: tells only whether the wire is even or odd (yellow keeps its own token).',null);
 add('Tokens','Count token (x1, x2, x3)',['jobs 24, 40'],'Replaces info tokens: that value appears that many times on that stand, cut wires included. Never on a red.',null);
 add('Tokens','False token',['jobs 17, 52'],'Means "this wire is NOT this value". Shown on the table as "!5".',null);
 add('Tokens','Equal / unequal tag',['from the Equal and Unequal Tag cards'],'Clipped between two neighbouring wires of one stand: they are the same value, or they are different values.',2);
 add('Tokens','X token',['jobs 20, 35'],'Marks an unsorted wire at the right end of a stand. No gear and no personal tool can touch it.',null);
 add('Tokens','Oxygen token',['jobs 44, 49, 54, 63'],'Paid to cut in the diving jobs. Cannot pay: skip the turn and burn a step.',null);
 add('Tokens','Number card',['1 to 12'],'Used by many jobs: an order to follow, a called value, a secret prediction, a value that acts as red.',12);
 add('Tokens','Fuse (detonator dial)',['starts at one step per player','max 6'],'Burns one step on every miss (two with restriction L). At zero the bomb goes off. Some jobs start at 1 or turn it back for dares and meteors.',1);
 add('Tokens','Robot',['jobs 43, 53, 59'],'A wind-up robot standee: walks the track holding wires (43), is the fuse itself (53), or guides the number line (59).',1);
 for(const id of EQ_IDS){const e=EQUIP[id];add('Equipment cards',e.n,['unlocks at '+(e.need===4?'four':'two')+' '+(e.v==='Y'?'yellows':e.v+'s'),{any:'any time',turn:'your turn',start:'start of your turn',instant:'instant'}[e.timing],{base:'base',yellow:'from job 9 in yellow jobs',double:'double card, from job 55'}[e.pool]],e.text,1)}
 for(const id in CHARS){const c=CHARS[id];add('Crew cards',c.n,[ITEMS[c.item].n,c.captain?'foreman':'',c.newc?'from job 31':''],c.text+' Personal tool: '+ITEMS[c.item].n+'.',1)}
 for(const id in ITEMS)add('Personal tools',ITEMS[id].n,[ITEMS[id].timing==='any'?'any time':'your turn','once per job'],ITEMS[id].text,null);
 for(const k of CON_IDS)add('Restriction cards',k+': '+CONSTRAINTS[k].n,[],CONSTRAINTS[k].text,1);
 for(const k in CHALLENGES)add('Dare cards',k+': '+CHALLENGES[k].n,['jobs 55, 60'],CHALLENGES[k].text+' Met: discard it and turn the fuse back one step.',1);
 for(const f of BUNKER.floors)add('Bunker map (job 66)',f.name,[],'Squares: '+Object.values(f.squares).filter((v,i,a)=>a.indexOf(v)===i).join(', ')+'. Walls block moves; the door and the laser open with their objectives.',1);
 for(const k in RULE_DOC)add('Job rules',RULE_DOC[k][1],[],RULE_DOC[k][2],null);
 for(let n=1;n<=66;n++){const M=MISSIONS[n];add('Jobs',n+'. '+M.nm,[M.pl.length<4?'3-5 players':'2-5 players',M.audio||hasRule(n,'timer')?'timed':''],M.text,null)}
 return E}
