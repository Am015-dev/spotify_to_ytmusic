// Shipwreck Isle logic test: one headless assertion per numbered rule in RULES-CHECKLIST.md, against the real engine.
// Each test builds a state, acts through the real engine functions, and checks the exact result.
// Failure line:  FAIL <rule>: expected <what the rulebook says>, got <what the engine did>
// usage: node logic-test.js            (quiet: failures + one summary line)
//        node logic-test.js --md       (rewrite RULES-CHECKLIST.md from this table)
const fs=require('fs'),vm=require('vm');
const files=['data-gen.js','data.js','cards-ev.js','cards-adv.js','text.js','engine.js','phases.js','scen.js','moves.js','ai.js'];
const TUT=fs.readFileSync(__dirname+'/tutor.js','utf8');   // Easy island's deal (easyDeal) lives in tutor.js
const SRC=files.map(f=>fs.readFileSync(__dirname+'/'+f,'utf8')).join('\n')+'\n'+TUT.slice(TUT.indexOf('var EASYK'),TUT.indexOf('function tutDeal('))+';UI.pause=true;';
// helpers that run inside the engine context
const PRE=`
function refresh(){}
const eq=(g,e)=>JSON.stringify(g)===JSON.stringify(e)||JSON.stringify(g);
function mk(o){o=o||{};setSeed(o.seed||7);newGame({scen:o.scen||'marooned',chars:o.chars||['carpenter','cook'],mode:o.human?'solo':'ai',friday:o.friday,dog:o.dog,items:o.items!=null?o.items:0});
 G.stk=[];G.q=null;G.over=null;G.phase='plan';G.round=o.round||2;G.res={food:0,pfood:0,wood:0,fur:0};G.fut={food:0,pfood:0,wood:0,fur:0};G.ev.threat=[null,null];
 G.tok={build:{},gather:{},explore:{},camp:{},hunt:{},special:{}};G.plan={acts:[],nextId:1,extraBuild:0,thrifty:null,hands:0,used:{}};G.wx={rain:0,snow:0,storm:0,animals:0};G.wxEarly=null;G.own=[];G.xp=[];
 if(o.human)for(const c of G.chars)c.human=true;return G}
function tile(p,n){G.map[p].tile=n}
function pl(type,tgt,pids,alt,pay){for(const p of pids){const w=place(p,type,tgt,alt,pay);if(w)throw new Error('cannot place '+p+' on '+type+': '+w)}return G.plan.acts.find(a=>a.pw.includes(pids[0]))}
function go(partial){FN.go({});G.stk.splice(0,partial?4:3);run()}
function dice(k,w,s,q){DICE[k+'-wound']=Array(6).fill(w?'wound':'blank');DICE[k+'-success']=Array(6).fill(s?'success':'2 determination');DICE[k+'-adventure']=Array(6).fill(q?'?':'blank')}
function wxr(o){G.round=o.round||3;Object.assign(G.res,o.res||{});G.camp.roof=o.roof||0;G.camp.pal=o.pal||0;G.camp.shelter=true;G.wxEarly=o.roll||{};Object.assign(G.wx,o.tok||{});G.weapon=o.weapon||0;G.stk=[];FN.weather({});run()}
function night(fn){G.stk=[];fn({});run()}
function hunt1(beast,weapon,tok){mk();G.hunt=[beast];G.weapon=weapon;if(tok)G.beastStr=tok;pl('hunt',null,['c0_0','c0_1']);go(true);return {w:P(0).w,weapon:G.weapon,fut:{food:G.fut.food,fur:G.fut.fur},hunt:G.hunt.length,bs:G.beastStr}}
function rrRun(chars,ci,type,tgt,det){mk({human:true,chars});tile(6,1);G.res.wood=1;P(ci).det=det;DICE[type+'-wound']=Array(6).fill('blank');DICE[type+'-adventure']=Array(6).fill('blank');DICE[type+'-success']=['2 determination','success','success','success','success','success'];const seq=[0,0,0,1];let i=0;rnd=()=>seq[i++%4];pl(type,tgt,['c'+ci+'_0']);go(true);return G.q?G.q.opts.findIndex(o=>/reroll/.test(o.l)):-2}
const advKey=d=>ADVENTURES.find(a=>a.deck===d&&!a.decide&&!a.shuffle&&a.k!=='g_end').k;
`;
const tests=[],nas=[];
function R(id,sec,rule,exp,fn){tests.push({id,sec,rule,exp,fn:fn.toString()})}
function NA(id,sec,rule,why){nas.push({id,sec,rule,why})}

// ======================================================================= A. SETUP
const A='Setup';
R('A1',A,'Each castaway has 2 pawns.','4 character pawns for 2 castaways',()=>{mk();return eq(allPawns().filter(p=>p.c!=null).length,4)});
R('A2',A,'Every wound marker starts on the leftmost life-track space (0 wounds) and nobody starts with determination (2 castaways, morale 0 in round 1).','wounds/determination 0/0 for both',()=>{mk();return eq(G.chars.map(c=>c.w+'/'+c.det),['0/0','0/0'])});
R('A3',A,'The morale marker starts on level 0.','morale 0',()=>{mk();return eq(G.morale,0)});
R('A4',A,'The weapon level starts at 0 and roof/palisade at 0.','weapon 0, roof 0, palisade 0',()=>{mk();return eq([G.weapon,G.camp.roof,G.camp.pal],[0,0,0])});
R('A5',A,'The beach tile (#8) starts on the camp space as an unbuilt camp (no shelter).','tile 8 at camp space 7, shelter false',()=>{mk();return eq([tileAt(G.camp.pos).no,G.camp.pos,G.camp.shelter],[8,7,false])});
R('A6',A,'Placing the beach tile means beach is explored from the start, so the Shovel can be made at once.','beach explored, Shovel buildable (null)',()=>{mk();return eq([explored().has('beach'),invWhy('shovel')],[true,null])});
R('A7',A,'The 9 starting inventions plus 5 random normal ones are on the board; the other 12 normal inventions form the deck.','board 14 (all 9 starting present), deck 12',()=>{mk();return eq([G.inv.board.length,['bricks','dam','fire','knife','map','medicine','pot','rope','shovel'].every(k=>G.inv.board.includes(k)),G.inv.deck.length],[14,true,12])});
R('A8',A,'Personal inventions (Snare, Fireplace, Shortcut, Spear) are on the character cards, not in the invention deck or on the board.','none of the 4 on the board or in the deck',()=>{mk();return eq(['snare','fireplace','shortcut','spear'].some(k=>G.inv.board.includes(k)||G.inv.deck.includes(k)),false)});
R('A9',A,'Two starting items are drawn; each can be used twice.','2 items with 2 uses each',()=>{setSeed(7);newGame({chars:['carpenter','cook'],mode:'ai'});return eq(G.items.map(i=>i.uses),[2,2])});
R('A10',A,'The event deck holds (rounds/2, rounded up) cards from each pile: Marooned (12 rounds) = 6 book + 6 adventure-icon cards; Hexed (10 rounds) = 5 + 5.','6+6 and 5+5',()=>{const c=s=>{mk({scen:s,chars:['carpenter','cook']});return [G.ev.deck.filter(k=>CARD[k].icon==='book').length,G.ev.deck.filter(k=>CARD[k].icon!=='book').length]};return eq([c('marooned'),c('hexed')],[[6,6],[5,5]])});
R('A11',A,'The wreckage card Crates on the Tide starts on the rightmost threat space; the left space is empty.','threat [null,"crates"]',()=>{setSeed(7);newGame({chars:['carpenter','cook'],mode:'ai'});return eq(G.ev.threat,[null,'crates'])});
R('A12',A,'The round marker starts at round 1; the first player is the first castaway.','round 1, first player 0',()=>{setSeed(7);newGame({chars:['carpenter','cook'],mode:'ai'});return eq([G.round,G.first],[1,0])});
R('A13',A,'1 player: Friday and the Dog are both used.','Friday and Dog present',()=>{mk({chars:['cook']});return eq([!!G.fri,G.dog],[true,true])});
R('A14',A,'2 players: Friday is used, the Dog is not.','Friday yes, Dog no',()=>{mk();return eq([!!G.fri,!!G.dog],[true,false])});
R('A15',A,'3 and 4 players: neither Friday nor the Dog.','neither for 3 players and 4 players',()=>{const a=mk({chars:['carpenter','cook','explorer']});const x=[!!G.fri,!!G.dog];mk({chars:['carpenter','cook','explorer','soldier']});return eq([x,[!!G.fri,!!G.dog]],[[false,false],[false,false]])});
R('A16',A,'The Soldier is not used in 1- or 2-player games.','no Soldier among 2 castaways even when asked for',()=>{setSeed(7);newGame({chars:['soldier','cook'],mode:'ai'});return eq(G.chars.some(c=>c.k==='soldier'),false)});
R('A17',A,'A solo game pays the 2-player cost for shelter, roof and palisade (2 wood or 1 fur).','2 wood / 1 fur',()=>{mk({chars:['cook']});const a={id:1,type:'build',tgt:{k:'shelter'},pw:[],pay:'wood'};const w=actCost(a).wood;a.pay='fur';return eq([w,actCost(a).fur],[2,1])});
R('A18',A,'The Beast deck holds all 16 beasts; the Hunting deck starts empty.','beast 16, hunt 0',()=>{mk();return eq([G.beast.length,G.hunt.length],[16,0])});
R('A19',A,'The Adventure cards form 3 separate decks (build, gather, explore) of 30 each.','30/30/30',()=>{mk();return eq([G.adv.build.length,G.adv.gather.length,G.adv.explore.length],[30,30,30])});
R('A20',A,'The island stack holds the 10 island tiles other than the beach.','10 tiles, none is #8',()=>{mk();return eq([G.tileDeck.length,G.tileDeck.includes(8)],[10,false])});
NA('A21',A,'The youngest player takes the first-player token.','Real-world choice; the game starts with the first castaway.');
NA('A22',A,'Players cannot share Determination tokens.','Each castaway has its own counter; there is no transfer action to test.');

// ======================================================================= B. EVENT PHASE
const B='Event phase';
R('B1',B,'No event card is drawn in the first round.','deck keeps both cards',()=>{mk();G.round=1;G.ev.deck=['tempers','sunny'];FN.event({});return eq(G.ev.deck.length,2)});
R('B2',B,'From round 2 one event card is drawn and its event effect resolved (Tempers Flare: every castaway takes 1 wound).','deck 1 left, wounds [1,1]',()=>{mk();G.ev.deck=['tempers','sunny'];FN.event({});run();return eq([G.ev.deck.length,G.chars.map(c=>c.w)],[1,[1,1]])});
R('B3',B,'An adventure icon on the card puts an Adventure token on that action (Tempers Flare = build).','build "?" token',()=>{mk();G.ev.deck=['tempers'];FN.event({});run();return eq(G.tok.build.adv,1)});
R('B4',B,'After its event effect the card goes on the right threat space.','threat [null,"tempers"]',()=>{mk();G.ev.deck=['tempers'];FN.event({});run();return eq(G.ev.threat,[null,'tempers'])});
R('B5',B,'A card already on the right space slides left when a new card arrives.','threat ["crates","tempers"]',()=>{mk();G.ev.threat=[null,'crates'];G.ev.deck=['tempers'];FN.event({});run();return eq(G.ev.threat,['crates','tempers'])});
R('B6',B,'A card pushed off the left space resolves its threat effect and is discarded (Bickering: everyone loses 1 determination).','det 3 -> 2 each; card in discard',()=>{mk();G.ev.threat=['bicker','tempers'];G.chars.forEach(c=>c.det=3);G.ev.deck=['sunny'];FN.event({});run();return eq([G.chars.map(c=>c.det),G.ev.disc.includes('bicker')],[[2,2],true])});
R('B7',B,'An adventure card shuffled into the event deck resolves its event half, is discarded, and another card is drawn.','first player +2 determination, new card on the threat track, deck empty',()=>{mk();G.ev.deck=['b_breakdown','sunny'];FN.event({});run();return eq([P(0).det,G.ev.threat,G.ev.deck.length],[2,[null,'sunny'],0])});

// ======================================================================= C. MORALE PHASE
const C='Morale phase';
R('C1',C,'Morale 0: the first player neither gains nor loses determination.','det 0, wounds 0',()=>{mk();G.morale=0;FN.morale({});return eq([P(0).det,P(0).w],[0,0])});
R('C2',C,'Morale +1 / +2: the first player gains that many determination.','+1 -> 1, +2 -> 2',()=>{mk();G.morale=1;FN.morale({});const a=P(0).det;mk();G.morale=2;FN.morale({});return eq([a,P(0).det],[1,2])});
R('C3',C,'Morale -1 / -2 / -3: the first player discards that many determination.','5 -> 4, 3, 2',()=>{const r=[];for(const m of [-1,-2,-3]){mk();G.morale=m;P(0).det=5;FN.morale({});r.push(P(0).det)}return eq(r,[4,3,2])});
R('C4',C,'If the first player cannot discard enough, they discard all and take 1 wound per missing token.','det 1 at morale -3: det 0, 2 wounds',()=>{mk();G.morale=-3;P(0).det=1;FN.morale({});return eq([P(0).det,P(0).w],[0,2])});
R('C5',C,'Only the first player is affected by morale determination.','second castaway unchanged',()=>{mk();G.morale=-2;P(0).det=3;P(1).det=3;FN.morale({});return eq(P(1).det,3)});
R('C6',C,'At the highest morale the first player may choose 2 determination or heal 1 wound (offered when wounded).','2 options; picking heal removes a wound',()=>{mk({human:true});G.morale=3;P(0).w=2;FN.morale({});const n=G.q?G.q.opts.length:0;const hi=G.q?G.q.opts.findIndex(o=>/Heal/.test(o.l)):-1;if(hi>=0)answer(hi);return eq([n,P(0).w,P(0).det],[2,1,0])});
R('C7',C,'At the highest morale an unwounded first player takes the 2 determination.','det +2',()=>{mk({human:true});G.morale=3;FN.morale({});return eq(P(0).det,2)});
R('C8',C,'Solo: morale rises by 1 at the start of the Morale phase.','morale 0 -> 1 and 1 determination',()=>{mk({chars:['cook']});G.morale=0;P(0).det=0;FN.morale({});return eq([G.morale,P(0).det],[1,1])});
R('C9',C,'Morale cannot go above the highest or below the lowest level (nothing happens).','stays 3 and -3',()=>{mk();G.morale=3;morale(1);const a=G.morale;G.morale=-3;morale(-1);return eq([a,G.morale],[3,-3])});
R('C10',C,'Diary: the first player gets 1 more determination (or loses 1 fewer) in the Morale phase.','morale 0: +1',()=>{mk();G.inv.built.diary=1;G.morale=0;FN.morale({});return eq(P(0).det,1)});
R('C11',C,'Drums: the first player gets 2 more determination in the Morale phase.','morale 0: +2',()=>{mk();G.inv.built.drums=1;G.morale=0;FN.morale({});return eq(P(0).det,2)});

// ======================================================================= D. PRODUCTION
const D='Production phase';
R('D1',D,'Each source on the camp tile gives 1 cube: wood source = wood, food source = food (beach: wood + fish).','+1 food +1 wood in the available space',()=>{mk();G.prod={};FN.prod({});return eq(G.res,{food:1,pfood:0,wood:1,fur:0})});
R('D2',D,'A source covered by a black marker gives nothing.','wood source blocked: food 1, wood 0',()=>{mk();G.prod={};G.map[7].exh[0]=1;FN.prod({});return eq([G.res.food,G.res.wood],[1,0])});
R('D3',D,'Snare: a +1 food token on the camp tile adds 1 food in production.','food 2',()=>{mk();G.prod={};G.map[7].tok.c_food=1;FN.prod({});return eq(G.res.food,2)});
R('D4',D,'Pit: in production roll the brown wound die; a wound gives 2 extra food.','wound -> food 3; blank -> food 1',()=>{mk();G.inv.built.pit=1;G.prod={};dice('build',1,1,0);FN.prod({});const a=G.res.food;G.res.food=0;dice('build',0,1,0);FN.prod({});return eq([a,G.res.food],[3,1])});
R('D5',D,'Shortcut: the token on an adjacent tile gives 1 resource of that tile in production.','plains wood tile: wood 2',()=>{mk();tile(6,1);G.shortcut=6;G.prod={};FN.prod({});return eq(G.res.wood,2)});
R('D6',D,'Corral: a +1 food token on the camp tile adds 1 food in production.','food 2',()=>{mk();G.prod={};G.map[7].tok.c_food2=1;FN.prod({});return eq(G.res.food,2)});

// ======================================================================= E. PLANNING
const E='Planning actions';
R('E1',E,'Every castaway must assign both pawns before the day starts.','plan problem "still has a pawn"',()=>{mk();return eq(planProblems().some(s=>/still has a pawn/.test(s)),true)});
R('E2',E,'A threat action needs the number of pawns printed on the card (Enjoy the Sun = 2, Cool Down = 1).','2 and 1',()=>{mk();G.ev.threat=['sunny','tempers'];return eq([actNeed({type:'threat',tgt:0}).need,actNeed({type:'threat',tgt:1}).need],[2,1])});
R('E3',E,'Each threat action targets a different card; a 1-pawn card takes no second pawn.','second pawn refused (string)',()=>{mk();G.ev.threat=['tempers',null];place('c0_0','threat',0);return eq(typeof place('c1_0','threat',0),'string')});
R('E4',E,'Hunting needs a Hunting deck of at least 1 beast, and 2 pawns.','refused with empty deck; needs 2 pawns',()=>{mk();const a=typeof placeWhy('c0_0','hunt',null);G.hunt=['bear'];place('c0_0','hunt',null);return eq([a,planProblems().some(s=>/needs 2 pawns/.test(s))],['string',true])});
R('E5',E,'Build/gather/explore on an adjacent space: 1 pawn rolls the dice, 2 pawns succeed automatically.','need 1 and max 2',()=>{mk();tile(6,1);const n=actNeed({type:'gather',tgt:{pos:6,i:0}});return eq([n.need,n.max,n.roll],[1,2,true])});
R('E6',E,'Gather/explore one tile further away needs 1 more pawn (2 roll, 3 are automatic).','need 2 and max 3',()=>{mk();tile(6,1);tile(5,4);const n=actNeed({type:'gather',tgt:{pos:5,i:0}});return eq([n.need,n.max],[2,3])});
R('E7',E,'Gathering is limited to the camp neighbours and tiles one step beyond (nothing 3 away).','refused (string)',()=>{mk();tile(6,1);tile(5,4);tile(9,9);return eq(typeof placeWhy('c0_0','gather',{pos:9,i:0}),'string')});
R('E8',E,'The camp tile cannot be gathered from (it produces by itself).','refused (string)',()=>{mk();return eq(typeof placeWhy('c0_0','gather',{pos:7,i:0}),'string')});
R('E9',E,'Exploring needs an unexplored space next to the camp tile or one step beyond; 3 away and already-explored spaces are refused.','near ok; 3 away refused; explored refused',()=>{mk();tile(6,1);tile(5,4);return eq([placeWhy('c0_0','explore',2),typeof placeWhy('c0_0','explore',0),typeof placeWhy('c0_0','explore',6)],[null,'string','string'])});
R('E10',E,'Arranging the camp and resting take exactly 1 pawn.','max 1 each',()=>{mk();return eq([actNeed({type:'camp'}).max,actNeed({type:'rest'}).max],[1,1])});
R('E11',E,'Additional pawns (Map, Dog...) cannot act alone: a character pawn must lead.','plan problem "needs a character"',()=>{mk();G.inv.built.map=1;place('map','explore',2);return eq(planProblems().some(s=>/needs a character/.test(s)),true)});
R('E12',E,'Extra pawns only fit their actions: Map = explore, Belts = gather, Raft = gather or explore, Lantern = build, Shield = hunt, Dog = hunt or explore.','exact allowed-action sets',()=>{mk({dog:true});for(const k of ['map','belts','raft','lantern','shield'])G.inv.built[k]=1;tile(6,1);G.ev.threat=['tempers',null];G.hunt=['bear'];
  const tg={threat:0,hunt:null,build:{k:'weapon'},gather:{pos:6,i:0},explore:2,camp:null,rest:null};const out={};
  for(const id of ['map','belts','raft','lantern','shield','dog'])out[id]=TYPES.filter(t=>pawnWhy(id,{id:99,type:t,tgt:tg[t],pw:[]})===null);
  return eq(out,{map:['explore'],belts:['gather'],raft:['gather','explore'],lantern:['build'],shield:['hunt'],dog:['hunt','explore']})});
R('E13',E,'You cannot plan a build you cannot pay for.','refused with "not enough resources"',()=>{mk();return eq(/not enough resources/.test(place('c0_0','build',{k:'shelter'})||''),true)});
R('E14',E,'Resources are reserved while planning: 2 wood cannot pay for a shelter (2) and a weapon (1) at once.','second build refused',()=>{mk();G.res.wood=2;place('c0_0','build',{k:'shelter'});return eq(typeof place('c1_0','build',{k:'weapon'}),'string')});
R('E15',E,'Pawns of different castaways can join one action.','2 pawns from 2 different castaways on one action',()=>{mk();tile(6,1);tile(5,4);const a=pl('gather',{pos:5,i:0},['c0_0','c1_0']);return eq([a.pw.length,[...new Set(a.pw.map(x=>pawnInfo(x).c))].sort()],[2,[0,1]])});
R('E16',E,'A planned action can be taken back.','pawn free again',()=>{mk();tile(6,1);pl('gather',{pos:6,i:0},['c0_0']);unplace('c0_0');return eq([G.plan.acts.length,placedIds().has('c0_0')],[0,false])});
R('E17',E,'You may hunt as many times as there are beasts in the Hunting deck: 1 beast allows 1 full hunt, a second hunt is refused.','1 hunt with 2 pawns has no plan problem; a 2nd hunt refused',()=>{mk();G.hunt=['bear'];place('c0_0','hunt',null);place('c0_1','hunt',null);const ok=!planProblems().some(s=>/beast/.test(s));const second=typeof placeWhy('c1_0','hunt',null);return eq([G.plan.acts.filter(a=>a.type==='hunt').length,ok,second],[1,true,'string'])});

// ======================================================================= F. RESOLVING ORDER
const F='Resolving actions';
R('F1',F,'Actions resolve in board order: threat, hunting, building, gathering, exploring, arranging the camp, resting.','threat,hunt,build,gather,explore,camp,rest',()=>{mk({chars:['carpenter','cook','explorer','soldier']});tile(6,1);G.res.wood=5;G.ev.threat=['tempers',null];G.hunt=['wild-dog'];dice('build',0,1,0);dice('gather',0,1,0);dice('explore',0,1,0);G.weapon=5;
  pl('rest',null,['c0_0']);pl('camp',null,['c0_1']);pl('explore',2,['c1_0']);pl('gather',{pos:6,i:0},['c1_1']);pl('build',{k:'weapon'},['c2_0']);pl('hunt',null,['c2_1','c3_0']);pl('threat',0,['c3_1']);
  const seq=[];const o=FN.resolve;FN.resolve=fr=>{seq.push(G.plan.acts.find(a=>a.id===fr.id).type);o(fr)};go();return eq(seq,['threat','hunt','build','gather','explore','camp','rest'])});
R('F2',F,'Gains made during the actions go to the future space; they cannot be used until all actions are done.','fut wood 1, available wood 0',()=>{mk();tile(6,1);pl('gather',{pos:6,i:0},['c0_0','c1_0']);go(true);return eq([G.fut.wood,G.res.wood],[1,0])});
R('F3',F,'After all actions the future resources become available.','available wood 1, future 0',()=>{mk();tile(6,1);pl('gather',{pos:6,i:0},['c0_0','c1_0']);go();return eq([G.res.wood,G.fut.wood],[1,0])});
R('F4',F,'After the actions, discovery tokens that are resources turn into cubes (Fallen Tree = 1 wood, Grubs = 2 food); other tokens are kept.','wood 1, food 2, machete kept',()=>{mk();G.own=[{k:'fallentree',fut:true},{k:'larvae',fut:true},{k:'machete',fut:true}];FN.endActions({});return eq([G.res.wood,G.res.food,G.own.map(o=>o.k)],[1,2,['machete']])});
R('F5',F,'Resources and items you did not have while planning cannot be used (a build cannot be paid with wood gathered the same phase).','plan refused with 0 wood',()=>{mk();tile(6,1);return eq(typeof place('c0_0','build',{k:'weapon'}),'string')});

R('F6',F,'An item made this round cannot be used until the Action phase is over (Basket built, then a gather the same round gives only 1 cube).','wood 1, Basket built afterwards',()=>{mk();tile(6,1);tile(5,4);G.res.wood=0;G.inv.built.rope=0;G.inv.board.push('basket');tile(6,1);dice('build',0,1,0);dice('gather',0,1,0);pl('build',{k:'basket'},['c0_0','c0_1']);pl('gather',{pos:6,i:0},['c1_0','c1_1']);go();return eq([G.res.wood,has('basket')],[1,true])});

// ======================================================================= G. THREAT ACTION
const G_='Threat action';
R('G1',G_,'A threat action pays the card\'s cost, gives its reward, and the card is discarded (Rig a Windbreak: 1 wood, +1 determination).','wood 2 -> 1, det +1, card gone',()=>{mk();G.ev.threat=['grimskies',null];G.res.wood=2;pl('threat',0,['c0_0']);go();return eq([G.res.wood,P(0).det,G.ev.threat[0],G.ev.disc.includes('grimskies')],[1,1,null,true])});
R('G2',G_,'Wreckage with 1 pawn gives its small reward (Crates on the Tide: 1 food).','food 1, dry food 0',()=>{mk();G.ev.threat=[null,'crates'];pl('threat',1,['c0_0']);go();return eq([G.res.food,G.res.pfood],[1,0])});
R('G3',G_,'Wreckage with 2 pawns gives its bigger reward (Crates on the Tide: 1 food + 1 non-perishable).','food 1, dry food 1',()=>{mk();G.ev.threat=[null,'crates'];pl('threat',1,['c0_0','c1_0']);go();return eq([G.res.food,G.res.pfood],[1,1])});
R('G4',G_,'Threat rewards (resources) go to the future space.','fut food 1, available 0 before the end of actions',()=>{mk();G.ev.threat=[null,'crates'];pl('threat',1,['c0_0']);go(true);return eq([G.fut.food,G.res.food],[1,0])});
R('G5',G_,'Determination from a threat reward can be used straight away.','det +1 before the end of actions',()=>{mk();G.ev.threat=['tempers',null];pl('threat',0,['c0_0']);go(true);return eq(P(0).det,1)});
R('G6',G_,'A threat that needs an item (Smoke Them Out needs Fire) cannot be planned without it.','refused, then allowed with Fire',()=>{mk();G.ev.threat=['borers',null];const a=typeof placeWhy('c0_0','threat',0);G.inv.built.fire=1;return eq([a,placeWhy('c0_0','threat',0)],['string',null])});
R('G7',G_,'A threat that needs a resource cannot be planned without it.','refused with 0 wood',()=>{mk();G.ev.threat=['grimskies',null];return eq(/not enough resources/.test(place('c0_0','threat',0)||''),true)});

// ======================================================================= H. HUNTING
const H='Hunting';
R('H1',H,'Hunting: 1 wound per missing weapon level (Bear strength 6 vs weapon 2 = 4 wounds).','4 wounds',()=>eq(hunt1('bear',2).w,4));
R('H2',H,'Hunting: the weapon level then drops by the beast\'s number (Bear: 1).','weapon 2 -> 1',()=>eq(hunt1('bear',2).weapon,1));
R('H3',H,'Hunting: food and fur from the beast go to the future space (Bear: 5 food, 2 fur).','fut food 5, fur 2',()=>eq(hunt1('bear',2).fut,{food:5,fur:2}));
R('H4',H,'The fought beast leaves the Hunting deck.','hunting deck 0',()=>eq(hunt1('bear',2).hunt,0));
R('H5',H,'A strong enough weapon takes no wounds but the hunt still pays (Fox 2 vs weapon 2: 0 wounds, 2 food, 1 fur).','0 wounds, food 2, fur 1',()=>{const s=hunt1('fox',2);return eq([s.w,s.fut],[0,{food:2,fur:1}])});
R('H6',H,'Beast Strength token: the next hunt\'s beast is 1 stronger, then the token is discarded.','Bear 7 vs 2 = 5 wounds, token 0',()=>{const s=hunt1('bear',2,1);return eq([s.w,s.bs],[5,0])});
R('H7',H,'Unfulfilled demand: weapon loss with no weapon left costs 1 wound per missing level (Bear vs weapon 0: 6 + 1 = 7).','7 wounds',()=>eq(hunt1('bear',0).w,7));
R('H8',H,'Danger token on a tile: acting there with weapon 0 costs the actor 1 wound.','1 wound',()=>{mk();tile(6,1);G.map[6].tok.beast=1;pl('gather',{pos:6,i:0},['c0_0','c1_0']);go(true);return eq(G.chars.reduce((a,c)=>a+c.w,0),1)});
R('H9',H,'A beast icon on an explored tile shuffles 1 Beast card into the Hunting deck.','hunting deck 1',()=>{mk();G.tileDeck=[1,3,4,5,6,7,9,10,11,2];dice('explore',0,1,0);pl('explore',2,['c0_0','c1_0']);go(true);return eq(G.hunt.length,1)});

// ======================================================================= I. BUILDING
const I='Building';
R('I1',I,'Shelter, roof and palisade cost 2 wood or 1 fur (2 players), 3 / 2 (3 players), 4 / 3 (4 players).','2/1, 3/2, 4/3 for shelter, roof and palisade',()=>{mk();const r=[];for(const n of [2,3,4]){G.np=n;for(const t of ['shelter','roof','pal']){const a={id:1,type:'build',tgt:{k:t},pw:[],pay:'wood'};const w=actCost(a).wood;a.pay='fur';r.push(w+'/'+actCost(a).fur)}}return eq(r,['2/1','2/1','2/1','3/2','3/2','3/2','4/3','4/3','4/3'])});
R('I2',I,'The cost is paid in wood or in fur, never mixed.','wood pay costs 0 fur; fur pay costs 0 wood',()=>{mk();const a={id:1,type:'build',tgt:{k:'roof'},pw:[],pay:'wood'};const w=actCost(a);a.pay='fur';const f=actCost(a);return eq([w.fur,f.wood],[0,0])});
R('I3',I,'A successful shelter build turns the camp token to its shelter side and spends the cost.','shelter true, wood 2 -> 0',()=>{mk();G.res.wood=2;pl('build',{k:'shelter'},['c0_0','c1_0']);go();return eq([G.camp.shelter,G.res.wood],[true,0])});
R('I4',I,'Roof and palisade need a shelter (built or natural) on the camp tile.','refused, then allowed on a natural-shelter tile',()=>{mk();G.res.wood=4;const a=typeof placeWhy('c0_0','build',{k:'roof'});tile(7,11);return eq([a,placeWhy('c0_0','build',{k:'roof'})],['string',null])});
R('I5',I,'Each roof build raises the roof by 1; levels are unlimited.','roof 4 -> 5',()=>{mk();G.camp.shelter=true;G.camp.roof=4;G.res.wood=2;pl('build',{k:'roof'},['c0_0','c1_0']);go();return eq(G.camp.roof,5)});
R('I6',I,'Each palisade build raises the palisade by 1.','palisade 0 -> 1',()=>{mk();G.camp.shelter=true;G.res.wood=2;pl('build',{k:'pal'},['c0_0','c1_0']);go();return eq(G.camp.pal,1)});
R('I7',I,'Building weapons costs 1 wood and raises the weapon level by 1.','wood 1 -> 0, weapon 1',()=>{mk();G.res.wood=1;pl('build',{k:'weapon'},['c0_0','c1_0']);go();return eq([G.res.wood,G.weapon],[0,1])});
R('I8',I,'A "+1 wood" token on the build space adds 1 wood to the next wood build, then is discarded.','shelter costs 3, token gone',()=>{mk();G.res.wood=3;G.tok.build.wood=1;pl('build',{k:'shelter'},['c0_0','c1_0']);go();return eq([G.res.wood,!!G.tok.build.wood],[0,false])});
R('I9',I,'A failed build does not spend its resources.','wood stays 2',()=>{mk();G.res.wood=2;dice('build',0,0,0);pl('build',{k:'shelter'},['c0_0']);go();return eq(G.res.wood,2)});
R('I10',I,'An invention needs its terrain explored (Bricks: hills) and its prerequisite items (Bow: Rope + Knife).','hills needed; Rope needed',()=>{mk();const a=invWhy('bricks'),b=invWhy('bow');tile(6,4);return eq([a,b,invWhy('bricks')],['needs hills explored','needs Rope',null])});
R('I11',I,'Making an invention spends its resources (Bow: 1 wood).','wood 1 -> 0, Bow built',()=>{mk();G.inv.built.rope=1;G.inv.built.knife=1;G.res.wood=1;G.inv.board.push('bow');pl('build',{k:'bow'},['c0_0','c1_0']);go();return eq([G.res.wood,has('bow')],[0,true])});
R('I12',I,'Each item can only be built once.','"already made"',()=>{mk();G.inv.built.knife=1;return eq(invWhy('knife'),'already made')});
R('I13',I,'A personal invention can only be built by its owner (Snare: Carpenter).','Cook refused, Carpenter allowed',()=>{mk();G.inv.built.rope=1;const a=typeof placeWhy('c1_0','build',{k:'snare'});return eq([a,placeWhy('c0_0','build',{k:'snare'})],['string',null])});
R('I14',I,'The first time a personal invention is built its owner takes 2 determination.','Carpenter det 2',()=>{mk();G.inv.built.rope=1;pl('build',{k:'snare'},['c0_0','c1_0']);go();return eq(P(0).det,2)});
R('I15',I,'Item effects apply at the end of the Action phase (Knife: weapon +1 only after all actions).','weapon 0 mid-phase, 1 after',()=>{mk();tile(6,2);G.inv.board.includes('knife');pl('build',{k:'knife'},['c0_0','c1_0']);go(true);const a=G.weapon;FN.endActions({});return eq([a,G.weapon],[0,1])});
R('I16',I,'Bricks raise the palisade by 1.','pal +1',()=>{mk();G.camp.shelter=true;completeInv('bricks',null,true);return eq(G.camp.pal,1)});
R('I17',I,'Fire raises the palisade by 1.','pal +1',()=>{mk();G.camp.shelter=true;completeInv('fire',null,true);return eq(G.camp.pal,1)});
R('I18',I,'Stone Wall raises the palisade by 2.','pal +2',()=>{mk();G.camp.shelter=true;completeInv('wall',null,true);return eq(G.camp.pal,2)});
R('I19',I,'Moat raises the palisade by 2.','pal +2',()=>{mk();G.camp.shelter=true;completeInv('moat',null,true);return eq(G.camp.pal,2)});
R('I20',I,'Knife raises the weapon level by 1.','weapon 1',()=>{mk();completeInv('knife',null,true);return eq(G.weapon,1)});
R('I21',I,'Sling raises the weapon level by 2.','weapon 2',()=>{mk();completeInv('sling',null,true);return eq(G.weapon,2)});
R('I22',I,'Bow raises the weapon level by 3.','weapon 3',()=>{mk();completeInv('bow',null,true);return eq(G.weapon,3)});
R('I23',I,'Spear raises the weapon level by 3.','weapon 3',()=>{mk();completeInv('spear',null,true);return eq(G.weapon,3)});
R('I24',I,'Dam gives 2 non-perishable food, once.','dry food 2',()=>{mk();completeInv('dam',null,true);return eq(G.res.pfood,2)});
R('I25',I,'Snare puts a +1 food token on the camp tile.','camp tile food token',()=>{mk();completeInv('snare',null,true);return eq(!!G.map[7].tok.c_food,true)});
R('I26',I,'Shortcut puts a token on an adjacent tile that gives 1 resource there in production.','shortcut tile set, +1 wood',()=>{mk();tile(6,1);completeInv('shortcut',null,true);G.prod={};FN.prod({});return eq([G.shortcut,G.res.wood],[6,2])});
R('I27',I,'Basket: a successful gather gives 1 more cube, once per round.','two gathers: 2 wood + 1 fish = wood 2, food 1',()=>{mk();G.inv.built.basket=1;tile(6,4);pl('gather',{pos:6,i:0},['c0_0','c0_1']);pl('gather',{pos:6,i:1},['c1_0','c1_1']);go();return eq([G.res.wood,G.res.food],[2,1])});
R('I28',I,'Sack works like the Basket and stacks with it (both: gather gives +2).','wood 3',()=>{mk();G.inv.built.basket=1;G.inv.built.sack=1;tile(6,1);pl('gather',{pos:6,i:0},['c0_0','c1_0']);go();return eq(G.res.wood,3)});
R('I29',I,'Bed: resting heals 2 wounds and gives 1 determination.','wounds 3 -> 1, det 1',()=>{mk();G.inv.built.bed=1;P(0).w=3;pl('rest',null,['c0_0']);go();return eq([P(0).w,P(0).det],[1,1])});
R('I30',I,'Cellar: food is not discarded at night.','food 3 kept',()=>{mk();G.inv.built.cellar=1;G.camp.shelter=true;G.res.food=3;FN.night4({});return eq(G.res.food,3)});
R('I31',I,'Furnace: ignore 1 winter cloud in the Weather phase.','snow 1: wood unchanged',()=>{mk();G.inv.built.furnace=1;wxr({res:{wood:3,food:3},roof:5,tok:{snow:1}});return eq(G.res.wood,3)});
R('I32',I,'Pot: at night discard 1 food to heal 1 wound (once).','food -1, wound -1',()=>{mk({human:true});G.inv.built.pot=1;G.inv.built.cellar=1;G.camp.shelter=true;G.res.food=2;P(0).w=2;G.stk=[];FN.night2({});const i=G.q?G.q.opts.findIndex(o=>/Pot/.test(o.l)):-1;if(i>=0)answer(i);return eq([G.chars.reduce((s,c)=>s+c.w,0),G.res.food],[1,1])});
R('I33',I,'Fireplace: at night discard 1 food to heal 2 wounds (once).','food -1, wounds -2',()=>{mk({human:true});G.inv.built.fireplace=1;G.inv.built.cellar=1;G.camp.shelter=true;G.res.food=2;P(0).w=3;G.stk=[];FN.night2({});const i=G.q?G.q.opts.findIndex(o=>/Fireplace/.test(o.l)):-1;if(i>=0)answer(i);return eq([G.chars.reduce((s,c)=>s+c.w,0),G.res.food],[1,1])});
R('I34',I,'Belts/Lantern/Map/Raft/Shield each add their extra pawn every round once built.','5 extra pawns appear',()=>{mk();for(const k of ['belts','lantern','map','raft','shield'])G.inv.built[k]=1;return eq(extraPawns().map(x=>x.id),['map','belts','raft','lantern','shield'])});
R('I35',I,'Corral: covers one adjacent food source with a black marker and puts a +1 food token on the camp tile.','camp token set, adjacent source covered',()=>{mk();tile(6,9);completeInv('corral',null,true);return eq([!!G.map[7].tok.c_food2,!!G.map[6].exh[0]],[true,true])});

// ======================================================================= J. GATHER
const J='Gathering';
R('J1',J,'A successful gather gives 1 cube of that source\'s type (wood source = wood).','fut wood 1',()=>{mk();tile(6,1);pl('gather',{pos:6,i:0},['c0_0','c1_0']);go(true);return eq(G.fut.wood,1)});
R('J2',J,'The same source cannot be gathered twice in a round (a second pawn only supports).','still 1 action',()=>{mk();tile(6,1);pl('gather',{pos:6,i:0},['c0_0']);place('c1_0','gather',{pos:6,i:0});return eq(G.plan.acts.length,1)});
R('J3',J,'Each source of a tile can be gathered separately (hills: wood and fish).','wood 1 and food 1',()=>{mk();tile(6,4);pl('gather',{pos:6,i:0},['c0_0','c0_1']);pl('gather',{pos:6,i:1},['c1_0','c1_1']);go();return eq([G.res.wood,G.res.food],[1,1])});
R('J4',J,'A failed gather gives nothing.','no wood',()=>{mk();tile(6,1);dice('gather',0,0,0);pl('gather',{pos:6,i:0},['c0_0']);go();return eq(G.res.wood,0)});
R('J5',J,'A "+1 wood" token on a tile gives 1 more wood when gathering there.','wood 2',()=>{mk();tile(6,1);G.map[6].tok.wood=1;pl('gather',{pos:6,i:0},['c0_0','c1_0']);go();return eq(G.res.wood,2)});
R('J6',J,'A used-up (black marker) source cannot be gathered.','refused',()=>{mk();tile(6,1);G.map[6].exh[0]=1;return eq(typeof placeWhy('c0_0','gather',{pos:6,i:0}),'string')});

// ======================================================================= K. EXPLORE
const K='Exploring';
R('K1',K,'A successful exploration places the top island tile on the chosen space.','tile 4 on space 2, stack -1',()=>{mk();G.tileDeck=[4,1,3,5,6,7,9,10,11,2];pl('explore',2,['c0_0','c1_0']);go();return eq([G.map[2].tile,G.tileDeck.length],[4,9])});
R('K2',K,'A failed exploration leaves the stack and the space unchanged.','space empty, stack 10',()=>{mk();dice('explore',0,0,0);G.tileDeck=[4,1,3,5,6,7,9,10,11,2];pl('explore',2,['c0_0']);go();return eq([G.map[2].tile,G.tileDeck.length],[null,10])});
R('K3',K,'Discovery tokens: draw as many as the tile shows (tile 3: three).','3 tokens',()=>{mk();G.tileDeck=[3,1,4,5,6,7,9,10,11,2];pl('explore',2,['c0_0','c1_0']);go(true);return eq(G.own.length,3)});
R('K4',K,'A natural-shelter tile found by exploring is not a built shelter.','no built shelter, camp not sheltered',()=>{mk();G.tileDeck=[11,1,3,4,5,6,7,9,10,2];pl('explore',2,['c0_0','c1_0']);go();return eq([G.camp.shelter,hasShelter()],[false,false])});
R('K5',K,'Exploring a new terrain unlocks the inventions that need it (hills -> Bricks).','Bricks buildable',()=>{mk();G.tileDeck=[4,1,3,5,6,7,9,10,11,2];pl('explore',2,['c0_0','c1_0']);go();return eq(invWhy('bricks'),null)});
R('K6',K,'Exploring is refused when no tiles are left.','refused',()=>{mk();G.tileDeck=[];return eq(typeof placeWhy('c0_0','explore',2),'string')});

// ======================================================================= L. CAMP AND REST
const L='Arranging the camp and resting';
R('L1',L,'Arranging the camp: +2 determination and morale +1.','det 2, morale 1',()=>{mk();pl('camp',null,['c0_0']);go(true);return eq([P(0).det,G.morale],[2,1])});
R('L2',L,'With 4 players the camp action chooses between 2 determination and morale +1.','2 options; picking morale gives morale 1, det 0',()=>{mk({chars:['carpenter','cook','explorer','soldier'],human:true});pl('camp',null,['c0_0']);go(true);const n=G.q?G.q.opts.length:0;const i=G.q?G.q.opts.findIndex(o=>/Morale/.test(o.l)):-1;if(i>=0)answer(i);return eq([n,G.morale,P(0).det],[2,1,0])});
R('L3',L,'At the highest morale, arranging the camp leaves morale unchanged.','morale 3',()=>{mk();G.morale=3;pl('camp',null,['c0_0']);go(true);return eq(G.morale,3)});
R('L4',L,'Rest heals 1 wound.','wounds 3 -> 2',()=>{mk();P(0).w=3;pl('rest',null,['c0_0']);go(true);return eq(P(0).w,2)});
R('L5',L,'Healing is only possible at night, by the Rest action, and by the Cook\'s skill: no other free healing during planning.','a wounded castaway stays wounded through production',()=>{mk();P(0).w=3;G.prod={};FN.prod({});return eq(P(0).w,3)});

// ======================================================================= M. ACTION DICE
const M='Action dice and tokens';
R('M1',M,'Dice resolve in order: wound die, then success die, then adventure die.','log order: mishap, gather, adventure',()=>{mk();tile(6,1);dice('gather',1,1,1);G.adv.gather=['g_tracks'];pl('gather',{pos:6,i:0},['c0_0']);go(true);const ix=r=>G.log.findIndex(l=>r.test(l.t));return eq([ix(/Adventure:/)<ix(/gathers/),ix(/gathers/)<ix(/takes 1 wound/)],[true,true])});
R('M2',M,'A wound face costs 1 wound even when the action succeeds.','wound 1 and wood arrives',()=>{mk();tile(6,1);dice('gather',1,1,0);pl('gather',{pos:6,i:0},['c0_0']);go(true);return eq([P(0).w,G.fut.wood],[1,1])});
R('M3',M,'A failure face (no success) gives 2 determination to the actor.','det 2, no wood',()=>{mk();tile(6,1);dice('gather',0,0,0);pl('gather',{pos:6,i:0},['c0_0']);go(true);return eq([P(0).det,G.fut.wood],[2,0])});
R('M4',M,'The adventure face draws from the matching deck: build, gather, explore.','decks build, gather, explore',()=>{const r=[];for(const [d,t] of [['build',{k:'weapon'}],['gather',{pos:6,i:0}],['explore',2]]){mk();tile(6,1);G.res.wood=1;dice(d,0,1,1);G.adv[d]=[advKey(d)];pl(d,t,['c0_0']);go(true);r.push(CARD[G.lastAdv].deck)}return eq(r,['build','gather','explore'])});
R('M5',M,'An Adventure token plus an adventure face draws only one card.','deck 3 -> 2, token gone',()=>{mk();tile(6,1);dice('gather',0,1,1);G.adv.gather=[advKey('gather'),'g_tracks','g_shortage'];G.tok.gather.adv=1;pl('gather',{pos:6,i:0},['c0_0']);go(true);return eq([G.adv.gather.length,!!G.tok.gather.adv],[2,false])});
R('M5b',M,'An Adventure token draws a card even when two pawns make the action sure (no dice).','no roll, deck 2 -> 1, token gone',()=>{mk();tile(6,1);dice('gather',0,1,0);G.adv.gather=[advKey('gather'),'g_shortage'];G.tok.gather.adv=1;pl('gather',{pos:6,i:0},['c0_0','c0_1']);go(true);return eq([G.log.some(l=>/ rolls for /.test(l.t)),G.adv.gather.length,!!G.tok.gather.adv],[false,1,false])});
R('M5c',M,'Easy island keeps the adventure rules: the deal keeps newGame\'s book / "?" split (Easy: 4 book + 8 "?" marker cards), adventure and mystery decks full.','4+8 events, decks full',()=>{mk();G.diff='easy';G.ev.deck=[];newGame({scen:'marooned',chars:['carpenter','cook'],mode:'ai',friday:true,dog:true,items:4,diff:'easy'});const a=G.adv.build.length;easyDeal();return eq([G.ev.deck.filter(k=>CARD[k].icon==='book').length,G.ev.deck.filter(k=>CARD[k].icon!=='book').length,G.adv.build.length===a&&a>0,G.mys.deck.length>0],[4,8,true,true])});
R('M6',M,'An Adventure token draws a card even with 2 pawns (no roll), then is discarded.','deck 3 -> 2, token gone',()=>{mk();tile(6,1);G.adv.gather=[advKey('gather'),'g_tracks','g_shortage'];G.tok.gather.adv=1;pl('gather',{pos:6,i:0},['c0_0','c1_0']);go(true);return eq([G.adv.gather.length,!!G.tok.gather.adv],[2,false])});
R('M7',M,'Reroll Success token: a success on the next roll is rerolled (here to a failure), then the token is discarded.','no wood, token gone',()=>{mk();tile(6,1);DICE['gather-wound']=Array(6).fill('blank');DICE['gather-adventure']=Array(6).fill('blank');DICE['gather-success']=['success','2 determination','success','success','success','success'];const seq=[0,0,0,1];let i=0;rnd=()=>seq[i++%4];G.tok.gather.reroll=1;pl('gather',{pos:6,i:0},['c0_0']);go(true);return eq([G.fut.wood,!!G.tok.gather.reroll],[0,false])});
R('M8',M,'Minus 1 Pawn token: the next action of that type needs 1 more pawn, then the token is discarded.','needs 2 pawns, token gone',()=>{mk();tile(6,1);G.tok.gather.time=1;const n=actNeed({type:'gather',tgt:{pos:6,i:0}}).need;pl('gather',{pos:6,i:0},['c0_0','c1_0']);go(true);return eq([n,!!G.tok.gather.time],[2,false])});
R('M9',M,'Carpenter, Master Craft: 2 determination rerolls a brown (build) die; not offered with 1 determination.','not offered at 1; offered at 2; success after, det 0',()=>{const low=rrRun(['carpenter','cook'],0,'build',{k:'weapon'},1);const ix=rrRun(['carpenter','cook'],0,'build',{k:'weapon'},2);if(ix>=0)answer(ix);return eq([low,ix>=0,P(0).det,G.weapon],[-2,true,0,1])});
R('M10',M,'Cook, Forager\'s Eye: 2 determination rerolls a grey (gather) die; not offered with 1 determination.','not offered at 1; offered at 2; success after, det 0',()=>{const low=rrRun(['carpenter','cook'],1,'gather',{pos:6,i:0},1);const ix=rrRun(['carpenter','cook'],1,'gather',{pos:6,i:0},2);if(ix>=0)answer(ix);return eq([low,ix>=0,P(1).det,G.fut.wood],[-2,true,0,1])});
R('M11',M,'Explorer, Lucky Break: 2 determination rerolls a green (explore) die; not offered with 1 determination.','not offered at 1; offered at 2; success after, det 0',()=>{const low=rrRun(['explorer','cook'],0,'explore',2,1);const ix=rrRun(['explorer','cook'],0,'explore',2,2);if(ix>=0)answer(ix);return eq([low,ix>=0,P(0).det,G.map[2].tile!=null],[-2,true,0,true])});
R('M12',M,'A skill can be used only once per round.','second use refused',()=>{mk({human:true,chars:['carpenter','cook']});P(1).det=9;G.res.food=0;const a=useSkill(1,'broth');const b=useSkill(1,'broth');return eq([a,b],[null,'already used this round'])});

// ======================================================================= N. WEATHER
const N='Weather phase';
R('N1',N,'Weather dice come from the scenario card: Marooned has none in rounds 1-3, rain in 4-6, rain + winter + hungry animals in 7-12.','calm, 1, 1, 3, 3 dice',()=>{const r=[];for(const n of [3,4,6,7,12]){mk();wxr({round:n,roof:9,res:{food:9,wood:9},roll:{rain:'1 rain',snow:'1 snow',animals:'blank'}});r.push(/calm/.test(G.log[0].t)?'calm':G.lastWx.out.length)}return eq(r,['calm',1,1,3,3])});
R('N2',N,'Each winter cloud costs 1 wood regardless of the roof.','roof 5, 1 winter cloud: wood 3 -> 2, food 3',()=>{mk();wxr({res:{wood:3,food:3},roof:5,tok:{snow:1}});return eq([G.res.wood,G.res.food],[2,3])});
R('N3',N,'Clouds (rain + winter) above the roof level each ruin 1 food and 1 wood.','roof 1, rain 1 + winter 1: wood 5 -> 3, food 4 -> 3',()=>{mk();wxr({res:{wood:5,food:4},roof:1,tok:{rain:1,snow:1}});return eq([G.res.wood,G.res.food],[3,3])});
R('N4',N,'The rain die\'s "2 rain" face adds two rain clouds (roof 0: 2 food and 2 wood lost).','food 5 -> 3, wood 5 -> 3',()=>{mk();wxr({round:4,res:{wood:5,food:5},roll:{rain:'2 rain'}});return eq([G.res.wood,G.res.food],[3,3])});
R('N5',N,'The rain die\'s snow face is a winter cloud (roof 0: 1 wood heating + 1 food + 1 wood ruined).','food 5 -> 4, wood 5 -> 3',()=>{mk();wxr({round:4,res:{wood:5,food:5},roll:{rain:'1 snow'}});return eq([G.res.wood,G.res.food],[3,4])});
R('N6',N,'Every resource that cannot be discarded gives each castaway 1 wound (1 cloud, nothing to discard: 2 wounds each).','[2,2]',()=>{mk();wxr({res:{wood:0,food:0},roof:0,tok:{rain:1}});return eq(G.chars.map(c=>c.w),[2,2])});
R('N7',N,'Unpaid heating counts the same way (2 winter clouds, no wood, roof 9: 2 wounds each).','[2,2]',()=>{mk();wxr({res:{wood:0,food:3},roof:9,tok:{snow:2}});return eq(G.chars.map(c=>c.w),[2,2])});
R('N8',N,'Cook, Moonshine: 3 determination ignores 1 rain cloud.','1 rain cloud ignored: food/wood untouched, det 0',()=>{mk({human:true});P(1).det=3;wxr({res:{wood:3,food:3},roof:0,tok:{rain:1}});const i=G.q?G.q.opts.findIndex(o=>/Ignore 1 rain/.test(o.l)):-1;if(i>=0)answer(i);return eq([G.res.wood,G.res.food,P(1).det],[3,3,0])});
R('N9',N,'Cook, Moonshine: 3 determination turns 1 winter cloud into a rain cloud (no heating wood; roof 5 covers it).','wood untouched, det 0',()=>{mk({human:true});P(1).det=3;wxr({res:{wood:3,food:3},roof:5,tok:{snow:1}});const i=G.q?G.q.opts.findIndex(o=>/Turn 1 snow/.test(o.l)):-1;if(i>=0)answer(i);return eq([G.res.wood,P(1).det],[3,0])});
R('N10',N,'Big Leaves (discovery token): ignore 1 rain cloud.','nothing lost',()=>{mk();G.own=[{k:'leaves',fut:false}];wxr({res:{wood:3,food:3},roof:0,tok:{rain:1}});return eq([G.res.wood,G.res.food],[3,3])});
R('N11',N,'Hungry animals "discard 1 food": food -1; with no food each castaway takes 1 wound.','food 2 -> 1; food 0 -> wounds [1,1]',()=>{mk();wxr({res:{food:2},roof:9,tok:{animals:1},roll:{animals:'discard 1 food'}});const a=G.res.food;mk();wxr({res:{food:0},roof:9,tok:{animals:1},roll:{animals:'discard 1 food'}});return eq([a,G.chars.map(c=>c.w)],[1,[1,1]])});
R('N12',N,'Hungry animals "palisade -1": palisade 2 -> 1; at 0 each castaway takes 1 wound.','pal 1; wounds [1,1]',()=>{mk();wxr({pal:2,roof:9,tok:{animals:1},roll:{animals:'palisade -1'}});const a=G.camp.pal;mk();wxr({pal:0,roof:9,tok:{animals:1},roll:{animals:'palisade -1'}});return eq([a,G.chars.map(c=>c.w)],[1,[1,1]])});
R('N13',N,'Hungry animals "fight strength 3": each castaway takes 1 wound per missing PALISADE level (palisade 1: 2 each; palisade 3: none; weapon does not matter).','[2,2] then [0,0]',()=>{mk();wxr({pal:1,weapon:3,roof:9,tok:{animals:1},roll:{animals:'fight beast strength 3'}});const a=G.chars.map(c=>c.w);mk();wxr({pal:3,weapon:0,roof:9,tok:{animals:1},roll:{animals:'fight beast strength 3'}});return eq([a,G.chars.map(c=>c.w)],[[2,2],[0,0]])});
R('N14',N,'If the scenario and a card both call for the hungry animals die it is rolled once.','one animals die in round 7 with a card token',()=>{mk();wxr({round:7,roof:9,res:{food:9,wood:9},tok:{animals:1},roll:{rain:'1 rain',snow:'1 snow',animals:'blank'}});return eq(G.lastWx.out.filter(x=>/animals die/.test(x)).length,1)});
R('N15',N,'Storm token: palisade -1; if it cannot go down each castaway takes 1 wound.','pal 1 -> 0, no wound; pal 0 -> wounds [1,1]',()=>{mk();wxr({pal:1,roof:9,tok:{storm:1}});const a=[G.camp.pal,G.chars.map(c=>c.w)];mk();wxr({pal:0,roof:9,tok:{storm:1}});return eq([a,G.chars.map(c=>c.w)],[[0,[0,0]],[1,1]])});
R('N16',N,'With no weather dice only the weather on tokens applies (round 3, 2 rain clouds, roof 0).','food 5 -> 3, wood 5 -> 3',()=>{mk();wxr({round:3,res:{wood:5,food:5},tok:{rain:2}});return eq([G.res.wood,G.res.food],[3,3])});
R('N17',N,'All weather tokens are discarded at the end of the phase.','weather space empty',()=>{mk();wxr({round:3,roof:9,tok:{rain:1,snow:1,storm:1,animals:1},roll:{animals:'blank'}});return eq(G.wx,{rain:0,snow:0,storm:0,animals:0})});
R('N18',N,'No dice and no tokens: calm weather, nothing happens.','resources and wounds unchanged',()=>{mk();wxr({round:3,res:{wood:2,food:2}});return eq([G.res.wood,G.res.food,G.chars.map(c=>c.w)],[2,2,[0,0]])});

// ======================================================================= O. NIGHT
const O='Night phase';
R('O1',O,'Night: discard 1 food per castaway (2 castaways, 2 food: all eaten).','food 2 -> 0',()=>{mk();G.res.food=2;G.stk=[];FN.night({});return eq(G.res.food,0)});
R('O2',O,'Non-perishable food can be eaten too.','dry food 2 -> 0',()=>{mk();G.res.pfood=2;G.stk=[];FN.night({});return eq([G.res.pfood,G.chars.map(c=>c.w)],[0,[0,0]])});
R('O3',O,'Not enough food: the players decide who goes hungry; each hungry castaway takes 2 wounds.','one castaway 2 wounds, the other 0',()=>{mk();G.res.food=1;G.stk=[];FN.night({});return eq(G.chars.map(c=>c.w).sort(),[0,2])});
R('O4',O,'Friday does not eat.','2 food feed 2 castaways + Friday',()=>{mk();G.res.food=2;G.stk=[];FN.night({});return eq([!!G.fri,G.chars.map(c=>c.w)],[true,[0,0]])});
R('O5',O,'If a hungry castaway\'s wounds reach the end of the life track the game is lost.','game over, not a win',()=>{mk();G.res.food=0;P(0).w=CHARS.carpenter.die-2;P(1).w=CHARS.cook.die-2;G.stk=[];FN.night({});run();return eq([!!G.over,G.over&&G.over.win],[true,false])});
R('O6',O,'Moving the camp before a shelter is built has no cost.','roof/palisade stay 0, camp moved',()=>{mk();tile(6,1);G.stk=[];push({f:'fn',k:'doMove',p:6});run();return eq([G.camp.pos,G.camp.roof,G.camp.pal],[6,0,0])});
R('O7',O,'Moving a built shelter halves roof and palisade, rounded down (3 -> 1, 2 -> 1).','roof 1, palisade 1',()=>{mk();tile(6,1);G.camp.shelter=true;G.camp.roof=3;G.camp.pal=2;G.stk=[];push({f:'fn',k:'doMove',p:6});run();return eq([G.camp.roof,G.camp.pal],[1,1])});
R('O8',O,'Without a built shelter (natural-shelter tile only) moving loses roof and palisade completely.','roof 0, palisade 0',()=>{mk();tile(7,11);tile(6,1);G.camp.roof=2;G.camp.pal=2;G.stk=[];push({f:'fn',k:'doMove',p:6});run();return eq([G.camp.roof,G.camp.pal],[0,0])});
R('O9',O,'+1 resource tokens on the old camp tile move with the camp.','snare token on the new tile',()=>{mk();tile(6,1);G.map[7].tok.c_food=1;G.stk=[];push({f:'fn',k:'doMove',p:6});run();return eq([!!G.map[6].tok.c_food,!!G.map[7].tok.c_food],[true,false])});
R('O10',O,'Moving the camp discards the Shortcut; it must be built again.','Shortcut no longer built, token gone',()=>{mk();tile(6,1);tile(2,5);completeInv('shortcut',null,true);G.stk=[];push({f:'fn',k:'doMove',p:6});run();return eq([has('shortcut'),G.shortcut],[false,null])});
R('O11',O,'Without a shelter on the camp tile every castaway takes 1 wound for sleeping in the open.','[1,1]',()=>{mk();G.stk=[];FN.night4({});return eq(G.chars.map(c=>c.w),[1,1])});
R('O12',O,'A natural-shelter camp tile counts as shelter: no wounds.','[0,0]',()=>{mk();tile(7,11);FN.night4({});return eq(G.chars.map(c=>c.w),[0,0])});
R('O13',O,'The camp is moved before the shelter check: moving onto a natural-shelter tile avoids the open-air wound.','move to tile 11, then [0,0]',()=>{mk({human:true});tile(11,11);G.moveAsk=1;G.stk=[];FN.night3({});run();const i=G.q?G.q.opts.findIndex(o=>/Move to place 12/.test(o.l)):-1;if(i>=0)answer(i);return eq([G.camp.pos,G.chars.map(c=>c.w)],[11,[0,0]])});
R('O14',O,'Leftover food is discarded; wood, fur and non-perishable food stay.','food 0; pfood 1, wood 2, fur 1',()=>{mk();G.camp.shelter=true;G.res={food:3,pfood:1,wood:2,fur:1};FN.night4({});return eq(G.res,{food:0,pfood:1,wood:2,fur:1})});
R('O15',O,'Skill markers are removed: skills can be used again next round.','used flags empty after the next dawn',()=>{mk();P(0).used={craft:1};FN.startRound({});return eq(P(0).used,{})});
R('O16',O,'The round marker advances and the first-player token passes to the next castaway.','round 4, first player 1',()=>{mk();G.round=3;G.first=0;FN.endRound({});return eq([G.round,G.first],[4,1])});
R('O17',O,'Solo: you are always the first player.','first player stays 0',()=>{mk({chars:['cook']});G.round=3;FN.endRound({});return eq([G.round,G.first],[4,0])});
R('O18',O,'Healing happens only at night (Rest, the Cook\'s skill and tokens aside): the Pot is offered at night with food.','Pot option present',()=>{mk({human:true});G.inv.built.pot=1;G.res.food=2;P(0).w=2;G.stk=[];FN.night2({});return eq(G.q&&G.q.opts.some(o=>/Pot/.test(o.l)),true)});

// ======================================================================= P. CHARACTERS
const P_='Characters, wounds and skills';
R('P1',P_,'A wound that passes a morale-down symbol on the life track lowers morale by 1 (Cook: after wound 3).','morale 0 -> -1',()=>{mk();G.morale=0;P(1).w=2;wound(P(1),1);return eq(G.morale,-1)});
R('P2',P_,'Healing back past that symbol changes nothing in morale.','morale stays -1',()=>{mk();G.morale=0;P(1).w=2;wound(P(1),1);heal(P(1),1);return eq(G.morale,-1)});
R('P3',P_,'When a wound marker reaches the last space the character dies and all players lose.','dead, game lost',()=>{mk();P(0).w=CHARS.carpenter.die-1;wound(P(0),1);return eq([P(0).dead,G.over&&G.over.win],[true,false])});
R('P4',P_,'Unfulfilled demand: losing determination you do not have costs 1 wound per missing token.','det 1, lose 3: det 0, 2 wounds',()=>{mk();P(0).det=1;loseDet(P(0),3);return eq([P(0).det,P(0).w],[0,2])});
R('P5',P_,'Carpenter, Thrifty Build (2 det): one build costs 1 less wood.','refused at 1 det; cost 2 -> 1',()=>{mk();G.res.wood=2;pl('build',{k:'shelter'},['c0_0','c1_0']);P(0).det=1;const a=typeof useSkill(0,'thrifty');P(0).det=2;useSkill(0,'thrifty');return eq([a,actCost(G.plan.acts[0]).wood,P(0).det],['string',1,0])});
R('P6',P_,'Carpenter, Bright Idea (3 det): look at 5 invention cards, put 1 on the board, set the other 4 aside.','board +1, deck -5',()=>{mk({human:true});P(0).det=3;const b=G.inv.board.length,d=G.inv.deck.length;useSkill(0,'idea');const n=G.q?G.q.opts.length:0;if(G.q)answer(0);return eq([n,G.inv.board.length-b,d-G.inv.deck.length],[5,1,5])});
R('P7',P_,'Carpenter, Extra Hands (3 det): an extra brown pawn for one build action.','extra "hands" pawn for build only',()=>{mk();P(0).det=3;useSkill(0,'hands');const p=allPawns().find(x=>x.id==='hands');return eq([!!p,p&&p.t],[true,['build']])});
R('P8',P_,'Cook, Home Remedy (2 det): discard 1 food to heal 2 wounds.','food 1 -> 0, wounds 3 -> 1',()=>{mk({human:true});G.res.food=1;P(0).w=3;P(1).det=2;useSkill(1,'remedy');const i=G.q?G.q.opts.findIndex(o=>/Carpenter heals 2/.test(o.l)):-1;if(i>=0)answer(i);return eq([G.res.food,P(0).w,P(1).det],[0,1,0])});
R('P9',P_,'Cook, Pebble Broth (3 det): get 1 food in the available space.','food +1 now',()=>{mk();P(1).det=3;useSkill(1,'broth');return eq([G.res.food,P(1).det],[1,0])});
R('P10',P_,'Explorer, Scout Ahead (2 det): draw 3 tiles, choose 1 for the top; the other 2 go back into the stack.','3 choices; stack size unchanged; chosen on top',()=>{mk({human:true,chars:['explorer','cook']});P(0).det=2;G.tileDeck=[1,3,4,5,6,7,9,10,11,2];useSkill(0,'recon');const n=G.q?G.q.opts.length:0;if(G.q)answer(2);return eq([n,G.tileDeck[0],G.tileDeck.length],[3,4,10])});
R('P11',P_,'Explorer, Pep Talk (3 det): morale +1.','morale 0 -> 1',()=>{mk({chars:['explorer','cook']});P(0).det=3;useSkill(0,'peptalk');return eq(G.morale,1)});
R('P12',P_,'Explorer, Keen Eye (3 det): draw 2 discovery tokens, keep 1, remove the other from the game.','stack -2, own +1',()=>{mk({human:true,chars:['explorer','cook']});P(0).det=3;const d=G.discs.length;useSkill(0,'keeneye');if(G.q)answer(0);return eq([d-G.discs.length,G.own.length],[2,1])});
R('P13',P_,'Soldier, Tracker (2 det): look at the top hunting card, keep it on top or put it on the bottom.','bottom -> [fox, bear]',()=>{mk({human:true,chars:['soldier','cook','carpenter']});P(0).det=2;G.hunt=['bear','fox'];useSkill(0,'track');const n=G.q?G.q.opts.length:0;if(G.q)answer(1);return eq([n,G.hunt],[2,['fox','bear']])});
R('P14',P_,'Soldier, Fortify (2 det): palisade +1 or weapon +1.','refused at 1 det; works at 2 det',()=>{mk({human:true,chars:['soldier','cook','carpenter']});G.camp.shelter=true;P(0).det=1;const a=typeof useSkill(0,'fortify');P(0).det=2;const b=useSkill(0,'fortify');if(G.q)answer(0);return eq([a,b,P(0).det,G.camp.pal+G.weapon],['string',null,0,1])});
R('P15',P_,'Soldier, Battle Rage (3 det): +3 weapon for one fight.','offered at 3 det; no wound vs strength 2; det 0',()=>{mk({human:true,chars:['soldier','cook','carpenter']});P(0).det=3;G.stk=[];push({f:'fn',k:'fight',beast:Object.assign({},BEAST['fox']),who:0,ctx:{}});run();const i=G.q?G.q.opts.findIndex(o=>/Battle Rage/.test(o.l)):-1;if(i>=0)answer(i);return eq([i>=0,P(0).w,P(0).det],[true,0,0])});
R('P16',P_,'Soldier, Drive the Game (4 det): top Beast-deck card goes unseen on top of the Hunting deck.','that beast is now first in the hunting deck',()=>{mk({chars:['soldier','cook','carpenter']});P(0).det=4;G.hunt=['fox'];const top=G.beast[0];useSkill(0,'drive');return eq([G.hunt[0]===top,G.hunt.length,P(0).det],[true,2,0])});

// ======================================================================= Q. FRIDAY AND DOG
const Q='Friday and the Dog';
R('Q1',Q,'Friday can take an action as a single pawn; the action is resolved as if a castaway took it.','wood 1 gathered by Friday alone',()=>{mk();tile(6,1);dice('gather',0,1,0);pl('gather',{pos:6,i:0},['fri']);go(true);return eq(G.fut.wood,1)});
R('Q2',Q,'Friday alone on an adventure face: no adventure card, Friday takes 1 wound.','Friday w 1, deck unchanged',()=>{mk();tile(6,1);dice('gather',0,1,1);const n=G.adv.gather.length;pl('gather',{pos:6,i:0},['fri']);go(true);return eq([G.fri.w,G.adv.gather.length],[1,n])});
R('Q3',Q,'With a castaway\'s pawn Friday is just an additional pawn (2 pawns: automatic success).','succeeds with failing dice',()=>{mk();tile(6,1);dice('gather',0,0,0);pl('gather',{pos:6,i:0},['c0_0','fri']);go(true);return eq(G.fut.wood,1)});
R('Q4',Q,'Friday\'s failure gives him 2 determination.','Friday det 2',()=>{mk();tile(6,1);dice('gather',0,0,0);pl('gather',{pos:6,i:0},['fri']);go(true);return eq(G.fri.det,2)});
R('Q5',Q,'Friday with 2 determination may reroll a die once per action.','Friday reroll offered',()=>{mk({human:true});tile(6,1);dice('gather',0,0,0);G.fri.det=2;pl('gather',{pos:6,i:0},['fri']);go(true);return eq(!!(G.q&&G.q.opts.some(o=>/Friday: reroll/.test(o.l))),true)});
R('Q6',Q,'Effects that hurt "every player" do not hurt Friday.','Friday wounds 0',()=>{mk();ops([['wound','all',2]],{});run();return eq([G.fri.w,G.chars.map(c=>c.w)],[0,[2,2]])});
R('Q7',Q,'Friday is not affected by weather or hunger and does not need shelter.','no extra wounds for Friday',()=>{mk();wxr({res:{wood:0,food:0},roof:0,tok:{rain:1}});G.stk=[];FN.night4({});return eq(G.fri.w,0)});
R('Q8',Q,'If Friday dies the castaways can still win.','Friday dead, game not over',()=>{mk();friWound(FRIDAY.die);return eq([G.fri.dead,G.over],[true,null])});
R('Q9',Q,'Friday cannot be the first player.','first player is always a castaway',()=>{mk();for(let i=0;i<5;i++)passFirst();return eq(G.first<G.chars.length&&!!firstC(),true)});
R('Q10',Q,'The Dog is an extra pawn for hunting or exploring that cannot act alone.','dog: hunt+explore only, needs a castaway',()=>{mk({dog:true});place('dog','explore',2);return eq([extraPawns().find(x=>x.id==='dog').t,planProblems().some(s=>/needs a character/.test(s))],[['hunt','explore'],true])});

// ======================================================================= R. STARTING ITEMS
const R_='Starting items';
R('R1',R_,'A starting item can be used twice, then it is gone (Ship\'s Biscuits: 1 non-perishable food each).','dry food 2, item removed, third use refused',()=>{mk();G.items=[{k:'biscuits',uses:2}];useItem('biscuits');useItem('biscuits');return eq([G.res.pfood,G.items.length,typeof useItem('biscuits')],[2,0,'string'])});
R('R2',R_,'Empty Bottle: weapon +1.','weapon 1',()=>{mk();G.items=[{k:'bottle',uses:2}];useItem('bottle');return eq(G.weapon,1)});
R('R3',R_,'Pipe and Tobacco: the user gains 2 determination.','det 2',()=>{mk();G.items=[{k:'pipe',uses:2}];useItem('pipe',1);return eq(P(1).det,2)});
R('R4',R_,'Flintlock Pistol: +3 weapon for one fight.','offered; no wound vs strength 2; use spent',()=>{mk({human:true});G.items=[{k:'pistol',uses:2}];G.stk=[];push({f:'fn',k:'fight',beast:Object.assign({},BEAST['fox']),who:0,ctx:{}});run();const i=G.q?G.q.opts.findIndex(o=>/Pistol/.test(o.l)):-1;if(i>=0)answer(i);return eq([i>=0,P(0).w,G.items[0].uses],[true,0,1])});
R('R5',R_,'Flask of Rum: heal 1 wound at night.','wounds 2 -> 1, use spent',()=>{mk({human:true});G.items=[{k:'rum',uses:2}];P(0).w=2;G.stk=[];FN.night2({});const i=G.q?G.q.opts.findIndex(o=>/Rum/.test(o.l)):-1;if(i>=0)answer(i);return eq([P(0).w,G.items[0].uses],[1,1])});
R('R6',R_,'Hammer and Nails: an extra pawn for one build action, spending a use.','extra pawn is build-only; use spent after the action',()=>{mk();G.items=[{k:'hammer',uses:2}];G.res.wood=2;const p=extraPawns().find(x=>x.id==='hammer');pl('build',{k:'shelter'},['c0_0','hammer']);go();return eq([p&&p.t,G.items[0].uses],[['build'],1])});
R('R7',R_,'Prayer Book: arranging the camp gives 3 determination and heals 1 wound instead of 2 determination.','det 3, wound -1, morale +1',()=>{mk();G.items=[{k:'bible',uses:2}];P(0).w=2;pl('camp',null,['c0_0']);go(true);return eq([P(0).det,P(0).w,G.morale],[3,1,1])});

// ======================================================================= S. DISCOVERY TOKENS
const S='Discovery tokens';
R('S1',S,'Fallen Tree: 1 wood.','wood 1',()=>{mk();G.own=[{k:'fallentree',fut:false}];discUse(0);return eq(G.res.wood,1)});
R('S2',S,'Grubs: 2 food.','food 2',()=>{mk();G.own=[{k:'larvae',fut:false}];discUse(0);return eq(G.res.food,2)});
R('S3',S,'Wild Goat: with weapon 1+, exchange for 1 food and 1 fur; refused at weapon 0.','refused at 0; food 1 fur 1 at 1',()=>{mk();G.own=[{k:'goat',fut:false}];const a=typeof discUse(0);G.weapon=1;discUse(0);return eq([a,G.res.food,G.res.fur],['string',1,1])});
R('S4',S,'Old Machete: weapon +1.','weapon 1',()=>{mk();G.own=[{k:'machete',fut:false}];discUse(0);return eq(G.weapon,1)});
R('S5',S,'Thorn Bushes: palisade +1.','pal 1',()=>{mk();G.camp.shelter=true;G.own=[{k:'thorns',fut:false}];discUse(0);return eq(G.camp.pal,1)});
R('S6',S,'Wild Tobacco: morale +1.','morale 1',()=>{mk();G.own=[{k:'tobacco',fut:false}];discUse(0);return eq(G.morale,1)});
R('S7',S,'Glint in the Sand: draw 1 treasure from the Mystery deck (Old Duelling Sword: weapon +2).','weapon 2',()=>{mk();G.mys.deck=['m_rapier'];G.own=[{k:'treasure',fut:false}];discUse(0);return eq(G.weapon,2)});
R('S8',S,'Big Leaves: ignore 1 rain cloud (see weather rule N10) and are used up.','token spent',()=>{mk();G.own=[{k:'leaves',fut:false}];wxr({res:{wood:3,food:3},roof:0,tok:{rain:1}});return eq(G.own.length,0)});
R('S9',S,'Candle Stubs: one-time extra pawn for a build action.','build-only helper pawn',()=>{mk();G.own=[{k:'candles',fut:false}];discUse(0);const p=extraPawns().find(x=>x.t.includes('build')&&x.id.startsWith('xp'));return eq([!!p,p&&p.t],[true,['build']])});
R('S10',S,'Pot tokens need the Pot: Calming Herbs, Poison Sap, Healing Leaves and Wild Vegetables are refused without it.','4 refusals',()=>{mk();P(0).w=2;const r=[];for(const k of ['herbs','poison','healherbs','veggies']){G.own=[{k,fut:false}];r.push(typeof discUse(0))}return eq(r,['string','string','string','string'])});
R('S11',S,'Calming Herbs (with Pot): morale +1.','morale 1',()=>{mk();G.inv.built.pot=1;G.own=[{k:'herbs',fut:false}];discUse(0);return eq(G.morale,1)});
R('S12',S,'Poison Sap (with Pot): weapon +2.','weapon 2',()=>{mk();G.inv.built.pot=1;G.own=[{k:'poison',fut:false}];discUse(0);return eq(G.weapon,2)});
R('S13',S,'Healing Leaves (with Pot): make Medicine for free.','Medicine built',()=>{mk();G.inv.built.pot=1;G.own=[{k:'healherbs',fut:false}];discUse(0);return eq(has('medicine'),true)});
R('S14',S,'Wild Vegetables (with Pot): heal 2 wounds.','wounds 3 -> 1',()=>{mk();G.inv.built.pot=1;P(0).w=3;G.own=[{k:'veggies',fut:false}];discUse(0);return eq(P(0).w,1)});

// ======================================================================= T. CARD DECKS
const T='Adventure, mystery and event decks';
R('T1',T,'Mystery draw "until a treasure": non-matching cards are put back; the treasure is taken.','trap back in deck, treasure used',()=>{mk();const trap=MYSTERIES.find(m=>m.type==='trap').k;G.mys.deck=[trap,'m_rapier'];G.own=[{k:'treasure',fut:false}];discUse(0);return eq([G.mys.deck,G.weapon],[[trap],2])});
R('T2',T,'A kept treasure card stays with the castaways (Canvas Backpack).','backpack kept',()=>{mk();G.mys.deck=['m_backpack'];G.own=[{k:'treasure',fut:false}];discUse(0);return eq(!!G.kept.m_backpack,true)});
R('T3',T,'When an adventure deck is empty its discard pile is reshuffled into a new deck.','draw succeeds from the discards',()=>{mk();G.adv.gather=[];G.advDisc=['g_tracks'];push({f:'fn',k:'adventure',deck:'gather',ctx:{actor:0}});run();return eq(G.lastAdv,'g_tracks')});
R('T4',T,'An adventure card marked with the shuffle symbol goes into the event deck after use (Low Moment: morale -1).','event deck +1, morale -1',()=>{mk();G.adv.build=['b_breakdown'];const n=G.ev.deck.length;push({f:'fn',k:'adventure',deck:'build',ctx:{actor:0}});run();return eq([G.ev.deck.length-n,G.morale],[1,-1])});
R('T5',T,'An ordinary adventure card is discarded after use.','in the adventure discard pile',()=>{mk();G.adv.gather=['g_tracks'];push({f:'fn',k:'adventure',deck:'gather',ctx:{actor:0}});run();return eq(G.advDisc.includes('g_tracks'),true)});
R('T6',T,'A "decide" adventure card lets the castaways keep it (it goes into the event deck) or discard it.','2 choices; keeping adds to the event deck',()=>{mk({human:true});const c=ADVENTURES.find(a=>a.decide);G.adv[c.deck]=[c.k];const n=G.ev.deck.length;push({f:'fn',k:'adventure',deck:c.deck,ctx:{actor:0}});run();const o=G.q?G.q.opts.length:0;if(G.q)answer(1);return eq([o,G.ev.deck.length-n],[2,1])});

// ======================================================================= U. END OF THE GAME
const U='End of the game';
R('U1',U,'The castaways lose immediately when any character dies (checked in P3).','game over, not a win',()=>{mk();wound(P(1),CHARS.cook.die);return eq([G.over&&G.over.win,P(1).dead],[false,true])});
R('U2',U,'The castaways lose when the last round ends without the goal, in every shipped scenario.','lost in all 4 scenarios',()=>{const r=[];for(const s of ['marooned','hexed','stranded','settlers']){mk({scen:s});G.round=G.rounds;FN.endRound({});r.push(!!(G.over&&!G.over.win))}return eq(r,[true,true,true,true])});
R('U3',U,'The game does not end before the last round.','round 11 of 12 goes on',()=>{mk();G.round=11;FN.endRound({});return eq([G.over,G.round],[null,12])});
R('U4',U,'The scenario card sets the number of rounds (Marooned 12, Hexed 10, Stranded 8, Settlers 12).','12, 10, 8, 12',()=>eq(['marooned','hexed','stranded','settlers'].map(s=>{mk({scen:s});return G.rounds}),[12,10,8,12]));

// ======================================================================= V. SCENARIOS
const V1='Scenario 1: Marooned';
R('V1',V1,'The signal pile grows by one stage a round: 1, 2, 3, 4, 5 wood (15 in total); only one stage per round.','pile 1, second add refused, round 3 pile 3',()=>{mk();G.res.wood=10;const a=pileAdd(1);const b=typeof pileAdd(1);G.round=3;const c=pileAdd(2);return eq([a,b,c,G.sc.pile],[null,'string',null,3])});
R('V2',V1,'It takes 5 rounds of stages to reach 15 wood.','15 after stages in rounds 2-6; 3 after two rounds',()=>{mk();G.res.wood=30;let at2=0;for(let r=2;r<=6;r++){G.round=r;pileAdd(5);if(r===3)at2=G.sc.pile}return eq([at2,G.sc.pile],[3,15])});
R('V3',V1,'Pile wood is spent from the available wood.','wood 10 -> 9',()=>{mk();G.res.wood=10;pileAdd(1);return eq(G.res.wood,9)});
R('V4',V1,'With the Fire built and the full pile the castaways win in round 10, 11 or 12.','win at 10, 11, 12',()=>{const r=[];for(const n of [10,11,12]){mk();G.round=n;G.inv.built.fire=1;G.sc.pile=15;SCEN.marooned.check();r.push(!!(G.over&&G.over.win))}return eq(r,[true,true,true])});
R('V5',V1,'No rescue before round 10.','round 9: no win',()=>{mk();G.round=9;G.inv.built.fire=1;G.sc.pile=15;SCEN.marooned.check();return eq(G.over,null)});
R('V6',V1,'No rescue without the Fire, or without a complete pile.','no win either way',()=>{mk();G.round=10;G.sc.pile=15;SCEN.marooned.check();const a=G.over;G.inv.built.fire=1;G.sc.pile=14;SCEN.marooned.check();return eq([a,G.over],[null,null])});
R('V7',V1,'Time runs out after round 12: no ship came.','game over, lost',()=>{mk();G.round=12;FN.endRound({});return eq([G.over&&G.over.win,/no ship/.test(G.over.why)],[false,true])});

const V2='Scenario 2: The Hexed Isle';
R('V8',V2,'A book icon in the event phase puts fog on 2 spaces.','2 fogged spaces',()=>{mk({scen:'hexed'});G.ev.deck=['bicker'];FN.event({});run();return eq(G.map.filter(m=>m.fog).length,2)});
R('V9',V2,'Fog on the camp tile stops production.','no production',()=>{mk({scen:'hexed'});G.map[7].fog=1;G.prod={};FN.prod({});return eq(G.res,{food:0,pfood:0,wood:0,fur:0})});
R('V10',V2,'Fog on a tile needs 1 more pawn for actions there.','need 1 -> 2',()=>{mk({scen:'hexed'});tile(6,1);const a=actNeed({type:'gather',tgt:{pos:6,i:0}}).need;G.map[6].fog=1;return eq([a,actNeed({type:'gather',tgt:{pos:6,i:0}}).need],[1,2])});
R('V11',V2,'A fogged tile\'s terrain does not count as explored.','hills hidden under fog',()=>{mk({scen:'hexed'});tile(6,4);const a=explored().has('hills');G.map[6].fog=1;return eq([a,explored().has('hills')],[true,false])});
R('V12',V2,'A Cross costs 2 wood, is raised on an explored tile, one per tile.','cost 2 wood; second cross on the same tile refused',()=>{mk({scen:'hexed'});tile(6,1);G.res.wood=4;const a=actCost({id:1,type:'build',tgt:{k:'cross',cross:6},pw:[],pay:'wood'}).wood;G.sc.crosses.push(6);return eq([a,typeof targetWhy('build',{k:'cross',cross:6})],[2,'string'])});
R('V13',V2,'A Cross can only go on an explored tile.','refused on an empty space',()=>{mk({scen:'hexed'});return eq(typeof targetWhy('build',{k:'cross',cross:0}),'string')});
R('V14',V2,'Five crosses on five different tiles win the game; four do not.','4 crosses: no win; 5: win',()=>{mk({scen:'hexed'});for(const p of [7,6,2,11])SCEN.hexed.built('cross',0,p);const a=G.over;SCEN.hexed.built('cross',0,1);return eq([a,!!(G.over&&G.over.win)],[null,true])});
R('V15',V2,'First totem tile found: a dark temple (remembered for a search action).','temple = that space',()=>{mk({scen:'hexed'});G.tileDeck=[5,4,6,1,3,7,9,10,11,2];exploreTile(2,{actor:0});return eq(G.sc.temple,2)});
R('V16',V2,'Second totem tile found: an altar of death, the explorer takes 2 wounds.','explorer 2 wounds',()=>{mk({scen:'hexed'});G.tileDeck=[5,4,6,1,3,7,9,10,11,2];exploreTile(2,{actor:0});exploreTile(6,{actor:0});return eq(P(0).w,2)});
R('V17',V2,'Later totem tiles are cultist hideouts: fog on that tile.','third totem tile fogged',()=>{mk({scen:'hexed'});G.tileDeck=[5,4,6,1,3,7,9,10,11,2];exploreTile(2,{actor:0});exploreTile(6,{actor:0});exploreTile(11,{actor:0});return eq(!!G.map[11].fog,true)});
R('V18',V2,'The temple can be searched once, from within reach, with an explore-dice action.','why() null once; "already searched" after',()=>{mk({scen:'hexed'});tile(6,5);G.sc.temple=6;const a=SCEN.hexed.specials.temple.why();G.sc.templeDone=true;return eq([a,SCEN.hexed.specials.temple.why()],[null,'already searched'])});
R('V19',V2,'Sacred Bell removes up to 3 fog tokens.','4 fogs -> 1',()=>{mk({scen:'hexed'});for(const p of [0,1,2,3])G.map[p].fog=1;SCEN.hexed.built('bell');return eq(G.map.filter(m=>m.fog).length,1)});

const V3='Scenario 3: Stranded Friend';
R('V20',V3,'Each night Ada suffers 2 wounds while she is stuck on the rock.','Ada 0 -> 2',()=>{mk({scen:'stranded'});G.camp.shelter=true;FN.night4({});return eq(G.sc.ada,2)});
R('V21',V3,'If Ada\'s track ends before she is rescued the castaways lose.','game lost',()=>{mk({scen:'stranded'});G.camp.shelter=true;G.sc.ada=CHARS.ada.die-2;FN.night4({});return eq(G.over&&G.over.win,false)});
R('V22',V3,'The rescue needs the Rescue Raft first.','refused without raft, allowed with it',()=>{mk({scen:'stranded'});const a=typeof SPEC('ada').why();G.inv.built.jraft=1;return eq([a,SPEC('ada').why()],['string',null])});
R('V23',V3,'On the rescue roll an adventure face is a wound, not a card.','castaway wound 1, no adventure drawn, Ada rescued',()=>{mk({scen:'stranded'});G.inv.built.jraft=1;dice('explore',0,1,1);const n=G.adv.explore.length;pl('special','ada',['c0_0']);go(true);return eq([P(0).w,G.adv.explore.length,G.sc.rescued],[1,n,true])});
R('V24',V3,'A rescued Ada joins the camp, keeps her wounds, and can only rest.','3 castaways, Ada can only rest',()=>{mk({scen:'stranded'});G.sc.ada=4;SCEN.stranded.specials.ada.win({});G.phase='plan';return eq([G.chars.length,P(2).w,typeof placeWhy('c2_0','gather',{pos:6,i:0}),placeWhy('c2_0','rest',null)],[3,4,'string',null])});
R('V25',V3,'Win: Ada safe in camp and the Lifeboat built.','win only with both',()=>{mk({scen:'stranded'});G.sc.rescued=true;SCEN.stranded.check();const a=G.over;G.inv.built.lifeboat=1;SCEN.stranded.check();const b=!!(G.over&&G.over.win);mk({scen:'stranded'});G.inv.built.lifeboat=1;SCEN.stranded.check();return eq([a,b,G.over],[null,true,null])});
R('V26',V3,'A book icon is a storm: palisade -1.','pal 2 -> 1',()=>{mk({scen:'stranded'});G.camp.shelter=true;G.camp.pal=2;G.ev.deck=['bicker'];FN.event({});run();return eq(G.camp.pal,1)});

const V6='Scenario 6: Settlers';
R('V27',V6,'Children are born in rounds 7, 9 and 11.','kids 0,1,1,2,3 at rounds 6,7,8,9,11',()=>{const r=[];let kids=0;mk({scen:'settlers'});for(const n of [6,7,8,9,11]){G.round=n;SCEN.settlers.roundStart();r.push(G.sc.kids)}return eq(r,[0,1,1,2,3])});
R('V28',V6,'Each child eats 1 food a night on top of the castaways.','food 5, 2 kids: 3 left',()=>{mk({scen:'settlers'});G.sc.kids=2;G.res.food=5;SCEN.settlers.nightKids();return eq(G.res.food,3)});
R('V29',V6,'If a child cannot eat the castaways lose.','game lost',()=>{mk({scen:'settlers'});G.sc.kids=1;G.res.food=0;SCEN.settlers.nightKids();return eq(G.over&&G.over.win,false)});
R('V30',V6,'A book icon is bad crops: production is halved.','tile 8 1+1 -> 0+0',()=>{mk({scen:'settlers'});G.prod={};SCEN.settlers.book();FN.prod({});return eq(G.res,{food:0,pfood:0,wood:0,fur:0})});
R('V31',V6,'A totem on a terrain with no other copy turns it into wasteland.','mountain tile 2 barren',()=>{mk({scen:'settlers'});G.tileDeck=[2,1,3,4,5,6,7,9,10,11];exploreTile(2,{actor:0});return eq(!!G.map[2].waste,true)});
R('V32',V6,'The Reclaim action (2 pawns, no dice) removes a black marker.','needs a marker; marker removed',()=>{mk({scen:'settlers'});tile(6,1);const a=typeof SPEC('reclaim').why();G.map[6].exh[0]=1;const b=SPEC('reclaim').why();SPEC('reclaim').win({});run();return eq([a,b,!!G.map[6].exh[0]],['string',null,false])});
R('V33',V6,'Win: shelter, roof, palisade and weapon at 1+ and all dealt inventions made.','win only when all are met',()=>{mk({scen:'settlers'});G.camp.shelter=true;G.camp.roof=1;G.camp.pal=1;G.weapon=1;SCEN.settlers.check();const a=G.over;for(const k of G.sc.goals)G.inv.built[k]=1;SCEN.settlers.check();const b=!!(G.over&&G.over.win);mk({scen:'settlers'});G.camp.shelter=true;G.camp.roof=1;G.camp.pal=0;G.weapon=1;for(const k of G.sc.goals)G.inv.built[k]=1;SCEN.settlers.check();return eq([a,b,G.over],[null,true,null])});
R('V34',V6,'Settlers deal 9 normal inventions at the start.','9 goals',()=>{mk({scen:'settlers'});return eq(G.sc.goals.length,9)});
R('V35',V6,'Lean season: food is discarded in the weather phase in rounds 7-12 (round 9: 2 food).','food 6 -> 4',()=>{mk({scen:'settlers'});wxr({round:9,roof:9,res:{food:6,wood:9},roll:{snow:'1 snow',animals:'blank'}});return eq(G.res.food,4)});
NA('V36','Scenarios not shipped','Scenarios 4 and 5 of the rulebook and the bonus sheet are not in the game.','Out of scope: they need their own maps and rules (see rules-notes.md). Nothing to test.');

// ======================================================================= runner
if(require.main===module){
 const ids=new Set();for(const t of [...tests,...nas]){if(ids.has(t.id)){console.log('DUPLICATE id',t.id);process.exit(2)}ids.add(t.id)}
 if(process.argv.includes('--md')){require('./logic-md.js')(tests,nas);process.exit(0)}
 const script=new vm.Script(SRC+PRE);let pass=0,fail=0;const only=process.argv.slice(2).filter(a=>!a.startsWith('--'));
 for(const t of tests){if(only.length&&!only.includes(t.id))continue;
  const ctx={console:{log(){},error(){}},Math,JSON,Date,setTimeout:()=>0,clearTimeout(){},localStorage:{getItem(){return null},setItem(){},removeItem(){}},performance:{now:()=>Date.now()}};
  vm.createContext(ctx);let got;
  try{script.runInContext(ctx);got=vm.runInContext('('+t.fn+')()',ctx)}catch(e){got='exception: '+e.message}
  if(got===true)pass++;else{fail++;console.log(`FAIL ${t.id}: expected ${t.exp}, got ${typeof got==='string'?got:JSON.stringify(got)}`)}}
 console.log(`logic tests: ${pass} pass, ${fail} fail of ${pass+fail} (${nas.length} rules not testable headless)`);
 process.exit(fail?1:0)}
module.exports={tests,nas};
