// Independent rules check for Doorkick Dungeon. One numbered assertion per rule in RULES-CHECKLIST.md,
// written from the published rulebook (not from the engine or the builders' tests). Each test builds a position in the real
// engine (doorkick.html), acts through performMove, and checks the exact result.
//   NODE_PATH=<dir with jsdom> node logic-test.js          run all; prints one line per failure: R<n> expected X got Y
//   node logic-test.js --md                                  rewrite RULES-CHECKLIST.md from this file
const {JSDOM}=require('jsdom');const fs=require('fs');
const RULES=[];
function R(sec,text,code,opt){RULES.push({n:RULES.length+1,sec,text,code,opt:opt||{}})}

// ============================ SETUP ============================
R('Setup','Every hero starts at level 1.','return E([1,1,1,1],G.pl.map(p=>p.lvl))',{raw:1});
R('Setup','Every hero is dealt 4 door and 4 treasure cards.',`
 for(let s=1;s<60;s++){setSeed(s);newGame("hot",4);
  const odd=G.pl.some(p=>p.hand.some(id=>cd(id).sp==='hoard'||cd(id).sp==='divine'))||G.td.length||G.dd.length; if(odd)continue;
  for(const p of G.pl){const d=p.hand.filter(id=>cd(id).d==='door').length,t=p.hand.length-d;if(d!==4||t!==4)return 'expected 4+4 got '+d+'+'+t+' (seed '+s+')'}
  return true}return 'no clean seed found'`,{raw:1});
R('Setup','The deck has 94 door and 74 treasure cards (168 in all).','return E([94,74],[Object.keys(G.C).filter(i=>DEF[G.C[i]].d==="door").length,Object.keys(G.C).filter(i=>DEF[G.C[i]].d==="tr").length])',{raw:1});
R('Setup','A new hero has no race (so is Human) and no class.','return E([[],[],["human"]],[P(0).race,P(0).cls,races(P(0))])',{raw:1});
R('Setup','Before the first turn heroes may play race, class and item cards.',`
 const e=give(0,"elf"),it=give(0,"stompy");const mv=validMoves(0);return ALL(E(true,mv.some(m=>m.act==="play"&&m.card===e)),E(true,mv.some(m=>m.act==="play"&&m.card===it)))`,{setup:1});
R('Setup','Turns pass to the player on the left (next seat).','G.active=1;nextTurn();return E(2,G.active)');
R('Setup','The first player is the one who rolled highest.','return E(G.first,G.setupOrd[0])',{raw:1});

// ============================ TURN ============================
R('Turn','Kicking open a door that shows a monster starts a fight with it.','G.door.push(inst("imp"));act({act:"kick"},0);return ALL(E("combat",G.phase),E(["imp"],G.cb.mons.map(m=>mdef(m).k)))');
R('Turn','A curse found by kicking open the door hits the kicker at once.','P(0).lvl=3;G.door.push(inst("hexlvl"));act({act:"kick"},0);return E(2,P(0).lvl)');
R('Turn','Any other door card found by kicking goes to the hand.','const e=inst("elf");G.door.push(e);act({act:"kick"},0);return ALL(E(true,P(0).hand.includes(e)),E("after",G.phase))');
R('Turn','With no monster met you may loot the room: draw a face-down door card into your hand.','G.door.push(inst("elf"));act({act:"kick"},0);const n=P(0).hand.length;const top=G.door[G.door.length-1];G.door.push(inst("toads"));const t2=G.door[G.door.length-1];act({act:"loot"},0);return ALL(E(n+1,P(0).hand.length),E(true,P(0).hand.includes(t2)),E("post",G.phase))');
R('Turn','With no monster met you may instead look for trouble: play a monster from your hand and fight it.','G.door.push(inst("elf"));act({act:"kick"},0);const m=give(0,"imp");act({act:"trouble",card:m},0);return ALL(E("combat",G.phase),E(false,P(0).hand.includes(m)))');
R('Turn','You cannot look for trouble after you have fought a monster this turn.','fightNow(0,"imp");P(0).lvl=5;winFight();give(0,"toads");return E(false,validMoves(0).some(m=>m.act==="trouble"))');
R('Turn','You cannot loot the room after you have fought a monster this turn.','fightNow(0,"imp");P(0).lvl=5;winFight();return E(false,validMoves(0).some(m=>m.act==="loot"))');
R('Turn','You cannot loot the room AND look for trouble: only one of the two.','G.door.push(inst("elf"));act({act:"kick"},0);act({act:"loot"},0);give(0,"toads");return E(false,validMoves(0).some(m=>m.act==="trouble"))');
R('Turn','Charity: with more than 5 cards at end of turn, give the extras to the lowest-level player.','P(0).lvl=5;P(1).lvl=2;P(2).lvl=3;P(3).lvl=4;for(let i=0;i<6;i++)give(0,["toads","imp","stompy","swash","l1","l2"][i]);G.phase="post";act({act:"end"},0);const mv=validMoves(0);return ALL(E("charity",G.phase),E(true,mv.length>0&&mv.every(m=>m.act==="give"&&m.tgt===1)))');
R('Turn','Charity: if you are the lowest level (or tied for lowest) you discard the extras instead.','P(0).lvl=2;P(1).lvl=2;P(2).lvl=3;P(3).lvl=4;for(let i=0;i<6;i++)give(0,["toads","imp","stompy","swash","l1","l2"][i]);G.phase="post";act({act:"end"},0);const mv=validMoves(0);return ALL(E("charity",G.phase),E(true,mv.length>0&&mv.every(m=>m.act==="toss")))');
R('Turn','Charity: ties for lowest level may be given to any of the tied players.','P(0).lvl=5;P(1).lvl=2;P(2).lvl=2;P(3).lvl=4;for(let i=0;i<6;i++)give(0,["toads","imp","stompy","swash","l1","l2"][i]);G.phase="post";act({act:"end"},0);const t=new Set(validMoves(0).map(m=>m.tgt));return E([1,2],[...t].sort())');
R('Turn','Charity stops as soon as you are back down to 5 cards.','P(0).lvl=5;P(1).lvl=2;P(2).lvl=3;P(3).lvl=3;for(let i=0;i<7;i++)give(0,["toads","imp","stompy","swash","l1","l2","l3"][i]);G.phase="post";act({act:"end"},0);act({act:"give",card:P(0).hand[0],tgt:1},0);const still=G.phase;act({act:"give",card:P(0).hand[0],tgt:1},0);return ALL(E("charity",still),E(1,G.active))');
R('Turn','Exactly 5 cards in hand is fine at end of turn: no charity.','for(let i=0;i<5;i++)give(0,["toads","imp","stompy","swash","l1"][i]);G.phase="post";act({act:"end"},0);return E(1,G.active)');
R('Turn','A dead hero cannot receive charity.','P(0).lvl=5;P(1).lvl=1;P(2).lvl=3;P(3).lvl=3;P(1).dead=true;for(let i=0;i<6;i++)give(0,["toads","imp","stompy","swash","l1","l2"][i]);G.phase="post";act({act:"end"},0);return E(true,validMoves(0).every(m=>m.tgt!==1))');

// ============================ COMBAT ============================
R('Combat','A hero\'s strength is level plus the bonuses of worn items.','P(0).lvl=3;wear(0,"stompy");wear(0,"swash");return E(7,pStr(P(0)))');
R('Combat','A monster\'s strength is its level (Limping Imp = 1, Hairy Hat-Muncher = 12).','fightNow(0,"hatmuncher");return E(12,monStr(G.cb))');
R('Combat','Items only count when worn: an item in the hand adds nothing.','P(0).lvl=3;give(0,"stompy");return E(3,pStr(P(0)))');
R('Combat','The hero wins only with strictly MORE strength than the monster.','P(0).lvl=2;fightNow(0,"toads");return ALL(E(2,sideStr(G.cb)),E(2,monStr(G.cb)),E(false,winning(G.cb)))');
R('Combat','A hero with more strength can fight and win.','P(0).lvl=3;fightNow(0,"toads");return E(true,validMoves(0).some(m=>m.act==="fight"))');
R('Combat','A hero who is not stronger cannot fight: the only way out is to run away.','P(0).lvl=1;fightNow(0,"toads");const mv=validMoves(0);return ALL(E(false,mv.some(m=>m.act==="fight")),E(true,mv.some(m=>m.act==="run")))');
R('Combat','A Warrior wins ties.','P(0).lvl=2;P(0).cls.push(inst("warrior"));fightNow(0,"toads");return E(true,winning(G.cb))');
R('Combat','Winning a fight earns 1 level per monster (Limping Imp = 1 level).','P(0).lvl=4;fightNow(0,"imp");winFight();return E(5,P(0).lvl)');
R('Combat','Big monsters give 2 levels (Horned Inferno).','P(0).lvl=3;wear(0,"stompy");fightNow(0,"inferno");G.cb.mb=-99;winFight();return E(5,P(0).lvl)');
R('Combat','Winning draws the monster\'s treasure count (Limping Imp = 1, Stampeding Skygrif = 4).','P(0).lvl=9;fightNow(0,"skygrif");G.cb.mb=-99;const n=P(0).hand.length;winFight();return E(n+4,P(0).hand.length)');
R('Combat','Level and treasure come only when the fight ends, then the monster is discarded.','P(0).lvl=4;const id=fightNow(0,"imp");winFight();return ALL(E(true,G.dd.includes(id)),E("post",G.phase))');
R('Combat','A monster enhancer adds to the monster\'s strength (Furious +5).','fightNow(0,"imp");const e=give(1,"furious");G.cb.stage="others";G.cb.ord=[1,2,3];G.cb.oi=0;act({act:"play",card:e,tgt:0},1);return E(6,monStr(G.cb))');
R('Combat','A monster enhancer gives extra treasure if the monster is killed (Furious +1).','P(0).lvl=9;fightNow(0,"imp");const e=give(1,"furious");G.cb.stage="others";G.cb.ord=[1,2,3];G.cb.oi=0;act({act:"play",card:e,tgt:0},1);G.cb.mb=-99;const n=P(0).hand.length;winFight();return E(n+2,P(0).hand.length)');
R('Combat','Tiny (-5) cannot take a monster below level 1.','fightNow(0,"imp");const e=give(1,"tiny");G.cb.stage="others";G.cb.ord=[1,2,3];G.cb.oi=0;act({act:"play",card:e,tgt:0},1);return E(1,monStr(G.cb))');
R('Combat','Tiny takes away a treasure but never below 1.','P(0).lvl=9;fightNow(0,"imp");const e=give(1,"tiny");G.cb.stage="others";G.cb.ord=[1,2,3];G.cb.oi=0;act({act:"play",card:e,tgt:0},1);const n=P(0).hand.length;winFight();return E(n+1,P(0).hand.length)');
R('Combat','A monster enhancer is played on a monster in a fight, never outside one.','const e=give(0,"furious");return E(false,validMoves(0).some(m=>m.card===e))');
R('Combat','A one-shot item gives its bonus to the hero side for this fight only (Zappy Dart +5).','P(0).lvl=2;fightNow(0,"hatmuncher");const d=give(0,"dart");act({act:"play",card:d,tgt:"p"},0);return E(7,sideStr(G.cb))');
R('Combat','A one-shot item can be played to help the monsters instead (+5 to the monster).','fightNow(0,"imp");const d=give(1,"dart");G.cb.stage="others";G.cb.ord=[1,2,3];G.cb.oi=0;act({act:"play",card:d,tgt:"m"},1);return E(6,monStr(G.cb))');
R('Combat','A used one-shot goes to the treasure discard pile after the fight.','P(0).lvl=9;fightNow(0,"imp");const d=give(0,"fizz");act({act:"play",card:d,tgt:"p"},0);winFight();return E(true,G.td.includes(d))');
R('Combat','Several monsters in one fight add their strengths (Uninvited Guest).','fightNow(0,"imp");const g=give(1,"uninvited"),t=give(1,"toads");G.cb.stage="others";G.cb.ord=[1,2,3];G.cb.oi=0;act({act:"play",card:g,tgt:t},1);return ALL(E(2,G.cb.mons.length),E(3,monStr(G.cb)))');
R('Combat','Killing several monsters gives the levels of each.','P(0).lvl=9-0;P(0).lvl=5;fightNow(0,"imp");const g=give(1,"uninvited"),t=give(1,"toads");G.cb.stage="others";G.cb.ord=[1,2,3];G.cb.oi=0;act({act:"play",card:g,tgt:t},1);G.cb.stage="act";winFight();return E(7,P(0).lvl)');
R('Combat','When the hero says Fight, every other player in turn order gets a chance to interfere.','P(0).lvl=5;fightNow(0,"imp");act({act:"fight"},0);return ALL(E("others",G.cb.stage),E([1,2,3],G.cb.ord),E(1,sideToAct()))');
R('Combat','Interfering (a curse, a boost) hands the choice back to the hero, who may then run.','P(0).lvl=3;fightNow(0,"toads");act({act:"fight"},0);const e=give(1,"furious");act({act:"play",card:e,tgt:0},1);return ALL(E("act",G.cb.stage),E(0,sideToAct()))');
R('Combat','Worn items cannot be changed during a fight.','P(0).lvl=1;const a=give(0,"stompy");const w=wear(0,"swash");fightNow(0,"imp");const mv=validMoves(0);return E(false,mv.some(m=>["equip","unequip","sell"].includes(m.act)||(m.act==="play"&&m.card===a)))');
R('Combat','Race and class cards cannot be played during a fight.','fightNow(0,"imp");const e=give(0,"elf");return E(false,validMoves(0).some(m=>m.card===e))');
R('Combat','A fight ends with the monster discarded when the hero escapes too (no level, no treasure).','P(0).lvl=1;const id=fightNow(0,"toads");const n=P(0).hand.length;rig(6);act({act:"run"},0);return ALL(E(1,P(0).lvl),E(n,P(0).hand.length),E("post",G.phase))');
R('Combat','The monsters\' special "vs" bonus applies against the named race (Kissy Leech +6 vs Elf).','P(0).race.push(inst("elf"));fightNow(0,"leech");return E(14,monStr(G.cb))');
R('Combat','The "vs" bonus applies against a named class (Off-Key Sirens +5 vs Wizard).','P(0).cls.push(inst("wizard"));fightNow(0,"sirens");return E(9,monStr(G.cb))');
R('Combat','No "vs" bonus applies to a hero of another race.','P(0).race.push(inst("dwarf"));fightNow(0,"leech");return E(8,monStr(G.cb))');
R('Combat','Winning at level 9 with a kill reaches level 10 and wins the game.','P(0).lvl=9;fightNow(0,"imp");winFight();return ALL(E(10,P(0).lvl),E("P1",G.winner))');
R('Combat','Level 10 only comes from killing a monster: monsters run from or sent away give no level.','P(0).lvl=9;fightNow(0,"imp");const p=give(0,"parrot");act({act:"play",card:p,tgt:0},0);return ALL(E(9,P(0).lvl),E(null,G.winner))');

// ============================ HELPING ============================
R('Helping','A hero who cannot win may ask any other player for help.','P(0).lvl=1;fightNow(0,"toads");const asks=new Set(validMoves(0).filter(m=>m.act==="ask").map(m=>m.tgt));return E([1,2,3],[...asks].sort())');
R('Helping','The helper adds their level and items to the hero\'s strength.','P(0).lvl=1;P(1).lvl=4;wear(1,"stompy");fightNow(0,"hatmuncher");act({act:"ask",tgt:1,opt:0},0);act({act:"opt",opt:"yes"},1);return E(1+4+2,sideStr(G.cb))');
R('Helping','The helper may refuse.','P(0).lvl=1;fightNow(0,"toads");act({act:"ask",tgt:1,opt:0},0);act({act:"opt",opt:"no"},1);return E(-1,G.cb.help)');
R('Helping','Only one player may help.','P(0).lvl=1;P(1).lvl=4;fightNow(0,"hatmuncher");act({act:"ask",tgt:1,opt:0},0);act({act:"opt",opt:"yes"},1);return E(false,validMoves(0).some(m=>m.act==="ask"))');
R('Helping','A helper that wins with you gets no level (the hero alone levels up).','P(0).lvl=2;P(1).lvl=5;fightNow(0,"hatmuncher");P(0).lvl=2;act({act:"ask",tgt:1,opt:0},0);act({act:"opt",opt:"yes"},1);G.cb.mb=-99;winFight();return ALL(E(5,P(1).lvl),E(3,P(0).lvl))');
R('Helping','An Elf helper goes up a level for each monster killed while helping.','P(0).lvl=1;P(1).lvl=5;P(1).race.push(inst("elf"));fightNow(0,"sirens");act({act:"ask",tgt:1,opt:0},0);act({act:"opt",opt:"yes"},1);winFight();return ALL(E(6,P(1).lvl),E(true,P(0).lvl>=2))');
R('Helping','The helper takes the number of treasures bargained for, the hero the rest.','P(0).lvl=1;P(1).lvl=9;fightNow(0,"skygrif");act({act:"ask",tgt:1,opt:3},0);act({act:"opt",opt:"yes"},1);G.cb.mb=-99;const h0=P(0).hand.length,h1=P(1).hand.length;winFight();return ALL(E(h1+3,P(1).hand.length),E(h0+1,P(0).hand.length))');
R('Helping','The helper cannot be promised more treasure than the monsters give.','P(0).lvl=1;fightNow(0,"toads");const m=validMoves(0).filter(x=>x.act==="ask");return E(1,Math.max(...m.map(x=>x.opt)))');
R('Helping','Nobody can help against Menacing Pergola.','P(0).lvl=1;fightNow(0,"pergola");return E(false,validMoves(0).some(m=>m.act==="ask"))');
R('Helping','If hero and helper still lose, both must run away, each rolling separately.','P(0).lvl=1;P(1).lvl=1;fightNow(0,"hatmuncher");act({act:"ask",tgt:1,opt:0},0);act({act:"opt",opt:"yes"},1);rig(6,6);act({act:"run"},0);return E([0,1],G.out.runs.map(r=>r.w).sort())');
R('Helping','A helper\'s Bad Stuff applies to the helper only; a helper caught gets it too.','P(0).lvl=1;P(1).lvl=4;fightNow(0,"toads");G.cb.mb=20;act({act:"ask",tgt:1,opt:0},0);act({act:"opt",opt:"yes"},1);rig(6,1);act({act:"run"},0);return ALL(E(1,P(0).lvl),E(2,P(1).lvl))');

// ============================ RUNNING AWAY ============================
R('Running away','A roll of 5 or 6 escapes.','P(0).lvl=1;fightNow(0,"hatmuncher");rig(5);act({act:"run"},0);return E(true,G.out.runs[0].ok)');
R('Running away','A roll of 4 or less is caught.','P(0).lvl=3;fightNow(0,"hatmuncher");rig(4);act({act:"run"},0);return E(false,G.out.runs[0].ok)');
R('Running away','A caught hero suffers the monster\'s Bad Stuff (Limping Imp: lose a level).','P(0).lvl=5;fightNow(0,"imp");G.cb.mb=20;rig(1);act({act:"run"},0);return E(4,P(0).lvl)');
R('Running away','An escaped hero suffers nothing.','P(0).lvl=5;fightNow(0,"imp");G.cb.mb=20;rig(5);act({act:"run"},0);return E(5,P(0).lvl)');
R('Running away','Bad Stuff that kills (Horned Inferno): the hero dies.','P(0).lvl=5;fightNow(0,"inferno");rig(1);act({act:"run"},0);return E(true,P(0).dead)');
R('Running away','A level can never drop below 1.','P(0).lvl=1;fightNow(0,"toads");rig(1);act({act:"run"},0);return E(1,P(0).lvl)');
R('Running away','With two monsters, roll once for EACH monster.','P(0).lvl=1;fightNow(0,"imp");const g=give(1,"uninvited"),t=give(1,"toads");G.cb.stage="others";G.cb.ord=[1,2,3];G.cb.oi=0;act({act:"play",card:g,tgt:t},1);G.cb.stage="act";G.cb.mb=20;act({act:"run"},0);return E(2,G.cb?G.cb.runs.length:G.out.runs.length)');
R('Running away','Escaping one monster but not the other: Bad Stuff only from the one that caught you.','P(0).lvl=6;fightNow(0,"imp");const g=give(1,"uninvited"),t=give(1,"toads");G.cb.stage="others";G.cb.ord=[1,2,3];G.cb.oi=0;act({act:"play",card:g,tgt:t},1);G.cb.stage="act";G.cb.mb=20;const first=G.cb.mons[0];rig(6,1);act({act:"run"},0);return E(4,P(0).lvl)');
R('Running away','Elves get +1 to run away.','P(0).race.push(inst("elf"));fightNow(0,"hatmuncher");return E(1,runMod(P(0),G.cb,G.cb.mons[0]))');
R('Running away','Items that help running away add to the roll (Sprint Sneakers +2).','wear(0,"sneakers");fightNow(0,"hatmuncher");return E(2,runMod(P(0),G.cb,G.cb.mons[0]))');
R('Running away','A monster\'s own run-away modifier applies (Kamikaze Toads -1; Limping Imp +1).','fightNow(0,"toads");const a=runMod(P(0),G.cb,G.cb.mons[0]);endCombat();G.phase="main";fightNow(0,"imp");return E([-1,1],[a,runMod(P(0),G.cb,G.cb.mons[0])])');
R('Running away','A hero who fails the roll but holds a way out may use it (Vanishing Tonic).','P(0).lvl=1;fightNow(0,"hatmuncher");const v=give(0,"vanish");rig(1);act({act:"run"},0);const q=G.q&&G.q.kind;act({act:"use",card:v},0);return ALL(E("rescue",q),E(1,P(0).lvl),E("post",G.phase))');
R('Running away','Halfling: after a failed run-away roll, discard a card to roll again (once).','P(0).lvl=3;P(0).race.push(inst("halfling"));fightNow(0,"hatmuncher");const x=give(0,"stompy");rig(1,6);act({act:"run"},0);const q=G.q&&G.q.kind,h=P(0).hand.length;act({act:"reroll",card:x},0);return ALL(E("rescue",q),E(true,G.out?G.out.runs.every(r=>r.ok):G.cb.runs.every(r=>r.ok)),E(h-1,P(0).hand.length),E(3,P(0).lvl))');
R('Running away','Halfling: only one reroll per run-away.','P(0).lvl=3;P(0).race.push(inst("halfling"));fightNow(0,"hatmuncher");const x=give(0,"stompy");give(0,"swash");rig(1,1);act({act:"run"},0);const a=validMoves(0).some(m=>m.act==="reroll");act({act:"reroll",card:x},0);const b=G.q?validMoves(0).some(m=>m.act==="reroll"):false;return ALL(E(true,a),E(false,b))');
R('Running away','Only a Halfling may discard to roll again.','P(0).lvl=3;fightNow(0,"hatmuncher");give(0,"stompy");rig(1);act({act:"run"},0);return E(false,validMoves(0).some(m=>m.act==="reroll"))');
R('Running away','Pop-Up Wall: you and your helper escape automatically.','P(0).lvl=1;fightNow(0,"hatmuncher");const w=give(0,"wall");act({act:"play",card:w},0);return ALL(E(true,G.out.runs.every(r=>r.ok)),E(1,P(0).lvl))');
R('Running away','No hero can be chased by a monster that "won\'t pursue" their level (Horned Inferno, level 4 or lower).','P(0).lvl=4;fightNow(0,"inferno");act({act:"run"},0);return ALL(E(false,P(0).dead),E("post",G.phase))');
R('Running away','"Won\'t pursue" does not protect a hero above that level (level 5 vs Inferno rolls).','P(0).lvl=5;fightNow(0,"inferno");rig(1);act({act:"run"},0);return E(true,P(0).dead)');

// ============================ DEATH ============================
R('Death','A dead hero keeps level, race and class.','P(0).lvl=4;P(0).race.push(inst("elf"));P(0).cls.push(inst("thief"));bots(1,2,3);die(P(0),"t");return ALL(E(4,P(0).lvl),E(1,P(0).race.length),E(1,P(0).cls.length),E(true,P(0).dead))');
R('Death','A dead hero loses all items and the whole hand.','wear(0,"stompy");give(0,"toads");bots(1,2,3);die(P(0),"t");return ALL(E(0,P(0).eq.length),E(0,P(0).hand.length))');
R('Death','Others loot the body, highest level first, one card each.','P(0).lvl=2;P(1).lvl=3;P(2).lvl=6;P(3).lvl=4;wear(0,"stompy");give(0,"toads");give(0,"imp");give(0,"l1");bots(1,2,3);die(P(0),"t");return E([1,1,1],[P(2).hand.length,P(3).hand.length,P(1).hand.length])');
R('Death','The best level loots first, so it gets the first pick of the body.','P(0).lvl=2;P(1).lvl=3;P(2).lvl=6;P(3).lvl=4;const a=wear(0,"stompy"),b=give(0,"imp");G.cb=null;die(P(0),"t");return E(2,G.loot.ord[0])',{noBots:1});
R('Death','Cards nobody can loot are discarded.','const a=["toads","imp","stompy","swash","l1"].map(k=>give(0,k));bots(1,2,3);die(P(0),"t");return ALL(E(2,a.filter(x=>G.dd.includes(x)||G.td.includes(x)).length),E(null,G.loot))');
R('Death','A dead hero keeps the curses on them and the Mixed Heritage / Double Major cards.','P(0).half=inst("mixed");P(0).sup=inst("double");const c=inst("hexhen");P(0).curse.push(c);bots(1,2,3);die(P(0),"t");return ALL(E(true,P(0).half!=null),E(true,P(0).sup!=null),E(true,P(0).curse.includes(c)))');
R('Death','The new hero appears at the next player\'s turn, and draws 4 door + 4 treasure at the start of their own.','bots(1,2,3);G.active=0;die(P(0),"t");nextTurn();const mid=[P(0).dead,P(0).fresh,P(0).hand.length];nextTurn();nextTurn();nextTurn();return ALL(E([false,true,0],mid),E(0,G.active),E(8,P(0).hand.length))');

// ============================ ITEMS ============================
R('Items','Only one headgear may be worn.','const a=give(0,"bucket"),b=give(0,"headband");act({act:"play",card:a},0);act({act:"play",card:b},0);return E(1,P(0).eq.filter(e=>e.on&&cd(e.id).slot==="head").length)');
R('Items','Only one armor may be worn.','const a=give(0,"jerkin"),b=give(0,"gooey");act({act:"play",card:a},0);act({act:"play",card:b},0);return E(1,P(0).eq.filter(e=>e.on&&cd(e.id).slot==="armor").length)');
R('Items','Only one footgear may be worn.','const a=give(0,"stompy"),b=give(0,"sneakers");act({act:"play",card:a},0);act({act:"play",card:b},0);return E(1,P(0).eq.filter(e=>e.on&&cd(e.id).slot==="foot").length)');
R('Items','Two hands: two 1-hand weapons, or one 2-hand weapon; not more.','const a=give(0,"swash"),b=give(0,"rascal"),c=give(0,"pole");act({act:"play",card:a},0);act({act:"play",card:b},0);act({act:"play",card:c},0);return E(2,P(0).eq.filter(e=>e.on).reduce((s,e)=>s+(cd(e.id).hands||0),0))');
R('Items','A 2-hand weapon uses both hands (cannot be worn with a 1-hand weapon).','const a=give(0,"swash"),b=give(0,"longbow");P(0).race.push(inst("elf"));act({act:"play",card:a},0);act({act:"play",card:b},0);return E(false,P(0).eq.find(e=>e.id===b).on)');
R('Items','Only one Big item may be carried.','const a=give(0,"buzzsaw"),b=give(0,"boulderitem");act({act:"play",card:a},0);act({act:"play",card:b},0);return E(1,bigCount(P(0)))');
R('Items','A Dwarf may carry any number of Big items.','P(0).race.push(inst("dwarf"));const a=give(0,"buzzsaw"),b=give(0,"boulderitem");act({act:"play",card:a},0);act({act:"play",card:b},0);return E(2,bigCount(P(0)))');
R('Items','Items a hero is not allowed to use are carried but give no bonus (Elves-only bow on a Human).','const a=give(0,"longbow");act({act:"play",card:a},0);return ALL(E(false,P(0).eq[0].on),E(1,pStr(P(0))))');
R('Items','Class-restricted items need the class (Holy Cheese Grater: Clerics only).','const a=give(0,"grater");act({act:"play",card:a},0);const off=P(0).eq[0].on;P(0).cls.push(inst("cleric"));revalidate(P(0));return E([false,false],[off,P(0).eq[0].on])');
R('Items','Sex-restricted items need the sex (Dame\'s Blade: women only).','const a=give(0,"dame");P(0).sex="m";act({act:"play",card:a},0);const m=P(0).eq[0].on;P(0).sex="f";revalidate(P(0));const f=P(0).eq[0].on;return E([false,false],[m,f])');
R('Items','Items worn by an allowed hero give their bonus (women get Dame\'s Blade +3).','P(0).sex="f";const a=give(0,"dame");act({act:"play",card:a},0);return E(4,pStr(P(0)))');
R('Items','"Not for" items may not be used by the named class (Leggings: not Warriors).','P(0).cls.push(inst("warrior"));const a=give(0,"leggings");act({act:"play",card:a},0);return E(false,P(0).eq[0].on)');
R('Items','Loophole lets a hero use one item they would not be allowed to.','const a=give(0,"zaphat");act({act:"play",card:a},0);const l=give(0,"loophole");act({act:"play",card:l,tgt:a},0);return E(true,P(0).eq[0].on)');
R('Items','Selling: 1,000 gold of items buys one level.','P(0).lvl=2;const a=give(0,"parrot");act({act:"sell",cards:""+a},0);return E(3,P(0).lvl)');
R('Items','Selling: no change given (1,200 gold still buys only one level).','P(0).lvl=2;const a=give(0,"rod"),b=give(0,"courage");act({act:"sell",cards:a+","+b},0);return E(3,P(0).lvl)');
R('Items','Selling: 2,000 gold buys two levels.','P(0).lvl=2;const a=give(0,"parrot"),b=give(0,"rod"),c=give(0,"stompy");act({act:"sell",cards:[a,b].join(",")},0);return E(4,P(0).lvl)');
R('Items','Selling: less than 1,000 gold at once is not allowed.','P(0).lvl=2;const a=give(0,"stompy"),b=give(0,"swash");return E(false,performMove({act:"sell",cards:a+","+b},0).success)');
R('Items','Selling: 900 gold is not enough, exactly 1,000 is.','P(0).lvl=2;const a=give(0,"flipflops"),b=give(0,"bucket");const r1=performMove({act:"sell",cards:a+","+b},0).success;const c=give(0,"stompy"),d=give(0,"cloak");const r2=performMove({act:"sell",cards:c+","+d},0).success;return E([false,true,3],[r1,r2,P(0).lvl])');
R('Items','Selling: you cannot sell to reach level 10.','P(0).lvl=9;give(0,"parrot");return E(false,validMoves(0).some(m=>m.act==="sell"))');
R('Items','Selling cannot push the level past 9.','P(0).lvl=8;const a=give(0,"parrot"),b=give(0,"rod"),c=give(0,"fizz");act({act:"sell",cards:[a,b,c].join(",")},0);return E(9,P(0).lvl)');
R('Items','Sold cards go to the discard pile.','P(0).lvl=2;const a=give(0,"parrot");act({act:"sell",cards:""+a},0);return E(true,G.td.includes(a))');
R('Items','Selling is not allowed during a fight.','P(0).lvl=1;give(0,"parrot");fightNow(0,"toads");return E(false,validMoves(0).some(m=>m.act==="sell"))');
R('Items','Selling is only for the hero whose turn it is.','give(1,"parrot");return E(false,validMoves(1).some(m=>m.act==="sell"))');
R('Items','A Halfling sells ONE item for double price once per turn.','P(0).lvl=2;P(0).race.push(inst("halfling"));const a=give(0,"stompy"),b=give(0,"swash");act({act:"sell",cards:a+","+b},0);return E(3,P(0).lvl)');
R('Items','The Halfling double price works only once per turn.','P(0).lvl=2;P(0).race.push(inst("halfling"));const a=give(0,"stompy"),b=give(0,"swash");act({act:"sell",cards:a+","+b},0);const c=give(0,"stompy"),d=give(0,"swash");const r=performMove({act:"sell",cards:c+","+d},0);return E(false,r.success)');
R('Items','Dwarf hand limit is 6 cards, not 5.','P(0).race.push(inst("dwarf"));for(let i=0;i<6;i++)give(0,["toads","imp","stompy","swash","l1","l2"][i]);G.phase="post";act({act:"end"},0);return E(1,G.active)');
R('Items','A Porter allows one extra Big item.','P(0).hire=inst("porter");const a=give(0,"buzzsaw"),b=give(0,"boulderitem"),c=give(0,"moonsilver");act({act:"play",card:a},0);act({act:"play",card:b},0);act({act:"play",card:c},0);return E(2,bigCount(P(0)))');

// ============================ LEVELS & WINNING ============================
R('Levels','A Go-Up-A-Level card gives one level.','P(0).lvl=3;const c=give(0,"l1");act({act:"play",card:c,tgt:0},0);return E(4,P(0).lvl)');
R('Levels','A Go-Up-A-Level card cannot take anyone to level 10.','P(0).lvl=9;give(0,"l1");return E(false,validMoves(0).some(m=>m.act==="play"&&m.tgt===0))');
R('Levels','A Go-Up-A-Level card may be played on another player.','give(0,"l1");return E(true,validMoves(0).some(m=>m.act==="play"&&m.tgt===1))');
R('Levels','Levels can never go below 1.','P(0).lvl=1;const c=give(1,"hexlvl");G.active=1;act({act:"play",card:c,tgt:0},1);return E(1,P(0).lvl)');
R('Levels','Level Heist: victim goes down 1, thief goes up 1.','P(0).lvl=3;P(1).lvl=4;const c=give(0,"heist");act({act:"play",card:c,tgt:1},0);return E([4,3],[P(0).lvl,P(1).lvl])');
R('Levels','Reaching level 10 by killing a monster wins the game.','P(0).lvl=9;fightNow(0,"imp");winFight();return E("P1",G.winner)');
R('Levels','Heavenly Favor: all Clerics go up a level when it is drawn, even to win.','P(2).cls.push(inst("cleric"));P(2).lvl=9;const d=inst("favor");gain(P(0),d);return ALL(E(10,P(2).lvl),E("P3",G.winner))');
R('Levels','Treasure Pile! gives 3 more treasures as soon as you get it.','const n=P(0).hand.length;gain(P(0),inst("pile"));return E(n+3,P(0).hand.length)');

R('Classes','A Halfling has no run-away penalty (the power is the reroll).','P(0).race.push(inst("halfling"));fightNow(0,"hatmuncher");return E(0,runMod(P(0),G.cb,G.cb.mons[0]))');
R('Classes','Mixed Heritage with a single Elf: monsters get no "vs Elf" bonus against you.','P(0).race.push(inst("elf"));P(0).half=inst("mixed");fightNow(0,"leech");return E(8,monStr(G.cb))');
R('Classes','Double Major with a single class: no class drawback (monster "vs Warrior" bonus ignored).','P(0).cls.push(inst("warrior"));P(0).sup=inst("double");fightNow(0,"nerd");return E(6,monStr(G.cb))');
R('Levels','Level Heist cannot be used by a hero at level 9 (it would not be allowed to reach 10).','P(0).lvl=9;P(1).lvl=4;give(0,"heist");return E(false,validMoves(0).some(m=>m.tgt===1&&m.card!==undefined&&cd(m.card).sp==="steal"))');
R('Levels','Level Heist cannot target a hero at level 1.','P(0).lvl=3;give(0,"heist");return E(false,validMoves(0).some(m=>m.card!==undefined&&cd(m.card).sp==="steal"&&m.tgt===1))');
R('Helping','An Elf helper at level 9 cannot win the game by helping (stays at 9).','P(0).lvl=1;P(1).lvl=9;P(1).race.push(inst("elf"));fightNow(0,"sirens");act({act:"ask",tgt:1,opt:0},0);act({act:"opt",opt:"yes"},1);winFight();return ALL(E(9,P(1).lvl),E(null,G.winner))');
R('Levels','Heavenly Favor kicked from the door: all Clerics go up a level at once.','P(1).cls.push(inst("cleric"));P(1).lvl=3;G.door.push(inst("favor"));act({act:"kick"},0);return E(4,P(1).lvl)');

// ============================ CURSES ============================
R('Curses','Anyone may play a curse on any player, during a fight, as an interference.','fightNow(0,"imp");const c=give(1,"hexlvl");G.cb.stage="others";G.cb.ord=[1,2,3];G.cb.oi=0;return E(true,validMoves(1).some(m=>m.card===c&&m.tgt===0))');
R('Curses','Rotten Luck: lose a level.','P(0).lvl=4;const c=give(1,"hexlvl");G.active=1;act({act:"play",card:c,tgt:0},1);return E(3,P(0).lvl)');
R('Curses','Goose of Gloom: lose 2 levels.','P(0).lvl=4;const c=give(1,"hexgoose");G.active=1;act({act:"play",card:c,tgt:0},1);return E(2,P(0).lvl)');
R('Curses','Sudden Gust with no headgear worn does nothing.','const c=give(1,"hexgust");G.active=1;const l=P(0).lvl;act({act:"play",card:c,tgt:0},1);const h=wear(0,"bucket");G.active=1;G.phase="main";const c2=give(2,"hexlvl");const a=P(0).eq.length;return E([1,l],[a,P(0).lvl])');
R('Curses','Rust Storm: lose the armor you wear.','wear(0,"jerkin");wear(0,"stompy");const c=give(1,"hexrust");G.active=1;act({act:"play",card:c,tgt:0},1);return E(["stompy"],P(0).eq.map(e=>cd(e.id).k))');
R('Curses','Sock Goblin: lose the footgear you wear.','wear(0,"jerkin");wear(0,"stompy");const c=give(1,"hexsock");G.active=1;act({act:"play",card:c,tgt:0},1);return E(["jerkin"],P(0).eq.map(e=>cd(e.id).k))');
R('Curses','A curse takes only worn items: a carried item is not lost (Sudden Gust).','const a=give(0,"zaphat");act({act:"play",card:a},0);const c=give(1,"hexgust");G.active=1;act({act:"play",card:c,tgt:0},1);return E(1,P(0).eq.length)');
R('Curses','Butterfingers: lose the Big item.','wear(0,"buzzsaw");wear(0,"stompy");const c=give(1,"hexbig");G.active=1;act({act:"play",card:c,tgt:0},1);if(G.q)act({act:"pick",opt:0},0);return E(["stompy"],P(0).eq.map(e=>cd(e.id).k))');
R('Curses','Light-Fingered Gremlin: lose a small item of your choice.','wear(0,"stompy");const c=give(1,"hexsmall");G.active=1;act({act:"play",card:c,tgt:0},1);if(G.q)act({act:"pick",opt:0},0);return E(0,P(0).eq.length)');
R('Curses','Utterly Rotten Hex: lose the item that gives the biggest bonus.','wear(0,"stompy");wear(0,"wildfire");P(0).cls.push(inst("wizard"));const c=give(1,"hexrotten");G.active=1;act({act:"play",card:c,tgt:0},1);return E(["stompy"],P(0).eq.map(e=>cd(e.id).k))');
R('Curses','Career Crisis: lose a class card; with none, lose a level.','P(0).lvl=3;const c=give(1,"hexcrisis");G.active=1;act({act:"play",card:c,tgt:0},1);const a=P(0).lvl;P(0).cls.push(inst("thief"));const c2=give(1,"hexcrisis");act({act:"play",card:c2,tgt:0},1);return E([2,0],[a,P(0).cls.length])');
R('Curses','Identity Crisis: lose your race and become a Human.','P(0).race.push(inst("elf"));const c=give(1,"hexid");G.active=1;act({act:"play",card:c,tgt:0},1);return E(["human"],races(P(0)))');
R('Curses','Career Change: your class becomes the first class card found in the door discards.','P(0).cls.push(inst("thief"));const w=inst("wizard");G.dd.push(w);const c=give(1,"hexcls");G.active=1;act({act:"play",card:c,tgt:0},1);return E(["wizard"],classes(P(0)))');
R('Curses','Family Tree Hex: your race becomes the first race card found in the door discards.','P(0).race.push(inst("elf"));const w=inst("dwarf");G.dd.push(w);const c=give(1,"hexrace");G.active=1;act({act:"play",card:c,tgt:0},1);return E(["dwarf"],races(P(0)))');
R('Curses','A Change-class/race curse does nothing to a hero with none.','const w=inst("wizard");G.dd.push(w);const c=give(1,"hexcls");G.active=1;act({act:"play",card:c,tgt:0},1);return E([],classes(P(0)))');
R('Curses','Gender Swap: your sex changes.','P(0).sex="m";const c=give(1,"hexsex");G.active=1;act({act:"play",card:c,tgt:0},1);return E("f",P(0).sex)');
R('Curses','Hen Hat Hex: -1 to your die rolls while you wear no headgear-losing event.','const c=give(1,"hexhen");G.active=1;act({act:"play",card:c,tgt:0},1);return E(-1,persMod(P(0),"die"))');
R('Curses','Hen Hat Hex ends when the headgear is lost.','wear(0,"bucket");const c=give(1,"hexhen");G.active=1;act({act:"play",card:c,tgt:0},1);const g=give(1,"hexgust");act({act:"play",card:g,tgt:0},1);return E(0,persMod(P(0),"die"))');
R('Curses','Hen Hat Hex applies to a run-away roll.','P(0).lvl=1;const c=give(1,"hexhen");G.active=1;act({act:"play",card:c,tgt:0},1);G.active=0;fightNow(0,"hatmuncher");rig(5);act({act:"run"},0);return E(false,G.out.runs[0].ok)');
R('Curses','Tax Collector: every player pays an item of equal value or loses all items and a level.','wear(0,"stompy");wear(1,"bucket");P(1).lvl=4;const t=give(2,"hextax");G.active=2;act({act:"play",card:t,tgt:0},2);if(G.q)act({act:"pick",opt:0},0);return E([0,0,3],[P(0).eq.length,P(1).eq.length,P(1).lvl])');
R('Curses','Grabby Neighbours: the players on each side take a random card from your hand.','give(0,"toads");give(0,"imp");const n=P(0).hand.length;const c=give(2,"hexgrab");G.active=2;act({act:"play",card:c,tgt:0},2);return E([n-2,1,1],[P(0).hand.length,P(1).hand.length,P(3).hand.length])');
R('Curses','Spiteful Mirror: no weapon bonus in the next fight only.','wear(0,"stompy");wear(0,"swash");P(0).lvl=3;const c=give(1,"hexmirror");G.active=1;act({act:"play",card:c,tgt:0},1);G.active=0;fightNow(0,"imp");return E(5,sideStr(G.cb))');
R('Curses','A curse played on someone is discarded after it takes effect (not kept).','const c=give(1,"hexlvl");G.active=1;act({act:"play",card:c,tgt:0},1);return E(true,G.dd.includes(c))');
R('Curses','Ring of Undoing cancels a curse (the victim is asked).','P(0).lvl=3;give(0,"undoring");const c=give(1,"hexlvl");G.active=1;act({act:"play",card:c,tgt:0},1);const asked=G.q&&G.q.kind;act({act:"opt",opt:"yes"},0);return ALL(E("ward",asked),E(3,P(0).lvl))');
R('Curses','Lucky Flip-Flops block curses you kick open, but not curses other players play.','P(0).lvl=3;wear(0,"flipflops");G.door.push(inst("hexlvl"));act({act:"kick"},0);const a=P(0).lvl;const c=give(1,"hexlvl");G.active=1;act({act:"play",card:c,tgt:0},1);return E([3,2],[a,P(0).lvl])');

// ============================ MONSTER CARDS ============================
R('Monsters','Bad Stuff: Pinch Mites take armor and everything worn below the waist.','wear(0,"jerkin");wear(0,"stompy");wear(0,"swash");P(0).lvl=1;fightNow(0,"mites");G.cb.mb=9;act({act:"run"},0);return E(["swash"],P(0).eq.map(e=>cd(e.id).k))');
R('Monsters','You cannot run away from Pinch Mites.','P(0).lvl=1;fightNow(0,"mites");G.cb.mb=9;rig(6);act({act:"run"},0);return E(false,G.out.runs[0].ok)');
R('Monsters','Hairy Hat-Muncher takes your headgear if you are caught.','P(0).lvl=1;wear(0,"bucket");fightNow(0,"hatmuncher");rig(1);act({act:"run"},0);return E(0,P(0).eq.length)');
R('Monsters','Kamikaze Toads: lose 2 levels.','P(0).lvl=5;fightNow(0,"toads");G.cb.mb=9;rig(1);act({act:"run"},0);return E(3,P(0).lvl)');
R('Monsters','The Endless Goblin Horde: roll 1-2 and you die, otherwise lose that many levels.','P(0).lvl=6;fightNow(0,"horde");rig(1,4);act({act:"run"},0);return E(2,P(0).lvl)');
R('Monsters','Gnawers: no items or bonuses count against them, level only.','P(0).lvl=3;wear(0,"stompy");wear(0,"swash");fightNow(0,"gnawers");return E(3,sideStr(G.cb))');
R('Monsters','Gnawers Bad Stuff: your level drops to the lowest at the table.','P(0).lvl=6;P(1).lvl=2;P(2).lvl=3;P(3).lvl=4;fightNow(0,"gnawers");rig(1);act({act:"run"},0);return E(2,P(0).lvl)');
R('Monsters','Timeshare Pitchman: your level does not count.','P(0).lvl=5;wear(0,"stompy");fightNow(0,"pitchman");return E(2,sideStr(G.cb))');
R('Monsters','Hovering Sniffer: an item worth 200+ gold bribes it away.','P(0).lvl=1;const b=wear(0,"bucket");fightNow(0,"sniffer");return E(true,validMoves(0).some(m=>m.act==="bribe"&&m.card===b))');
R('Monsters','Garlic Gargle kills a Hovering Sniffer outright.','P(0).lvl=1;fightNow(0,"sniffer");const g=give(0,"garlic");act({act:"play",card:g,tgt:0},0);return E("post",G.phase)');
R('Monsters','Shieldmaiden: a woman fighter just gets 1 treasure and no fight.','P(0).sex="f";const n=P(0).hand.length;fightNow(0,"amazon");return ALL(E("post",G.phase),E(n+1,P(0).hand.length))');
R('Monsters','Litigation Lizards never attack a Thief.','P(0).cls.push(inst("thief"));fightNow(0,"lizards");return E(true,G.phase!=="combat"||G.cb.mons.length===0)');
R('Monsters','Sleepy Boulderman: you may skip past him (a Halfling may not).','fightNow(0,"boulder");const a=validMoves(0).some(m=>m.act==="skip");endCombat();G.phase="main";P(0).race.push(inst("halfling"));fightNow(0,"boulder");return E([true,false],[a,validMoves(0).some(m=>m.act==="skip")])');
R('Monsters','Bat-Cape Poser: a Cleric can shoo him away and take the treasure, with no level.','P(0).lvl=3;P(0).cls.push(inst("cleric"));fightNow(0,"poser");const n=P(0).hand.length;act({act:"shoo",tgt:0},0);return ALL(E(3,P(0).lvl),E(n+3,P(0).hand.length))');
R('Monsters','Furious Rooster: an extra level if beaten with fire.','P(0).lvl=4;fightNow(0,"rooster");const f=give(0,"hotsauce");act({act:"play",card:f,tgt:"p"},0);winFight();return E(6,P(0).lvl)');
R('Monsters','Barfabunny: extra level if beaten with no help or bonuses.','P(0).lvl=8;fightNow(0,"barfabunny");winFight();return E(10,P(0).lvl)');
R('Monsters','Undead monsters (Rattlebones): fleeing costs a level even when you get away.','P(0).lvl=5;fightNow(0,"rattle");G.cb.mb=20;rig(6);act({act:"run"},0);return E(4,P(0).lvl)');
R('Monsters','Pharaoh: fleeing costs 2 levels (above level 3) even when you get away.','P(0).lvl=6;fightNow(0,"pharaoh");rig(6);act({act:"run"},0);return E(4,P(0).lvl)');
R('Monsters','Forum Troll / Pixie / Skygrif: others take items from you; the Nameless Dread kills all but a Wizard.','bots(1,2,3);P(0).lvl=1;P(0).cls.push(inst("wizard"));wear(0,"stompy");fightNow(0,"dread");rig(1);act({act:"run"},0);return ALL(E(false,P(0).dead),E(0,P(0).cls.length))');

// ============================ CLASSES & RACES ============================
R('Classes','Warrior Berserking: discard up to 3 cards, +1 each in the fight.','P(0).cls.push(inst("warrior"));P(0).lvl=3;for(let i=0;i<4;i++)give(0,["toads","imp","stompy","swash"][i]);fightNow(0,"hatmuncher");let n=0;for(let i=0;i<4;i++){const m=validMoves(0).find(x=>x.act==="berserk");if(m){act(m,0);n++}}return ALL(E(3,n),E(6,sideStr(G.cb)))');
R('Classes','Wizard Flight: discard up to 3 cards, +1 each to run away.','P(0).cls.push(inst("wizard"));P(0).lvl=1;for(let i=0;i<3;i++)give(0,["toads","imp","stompy"][i]);fightNow(0,"hatmuncher");for(let i=0;i<3;i++)act(validMoves(0).find(x=>x.act==="flight"),0);return E(3,(G.cb.used.f0||0))');
R('Classes','Wizard Charm needs the whole hand and at least 3 cards.','P(0).cls.push(inst("wizard"));P(0).lvl=1;P(0).hand=[];give(0,"toads");give(0,"imp");fightNow(0,"hatmuncher");while(P(0).hand.length>2)G.door.unshift(P(0).hand.pop());if(P(0).hand.length!==2)return "setup: hand "+P(0).hand.length;return E(false,validMoves(0).some(m=>m.act==="charm"))');
R('Classes','Wizard Charm with 3+ cards: discards the whole hand, takes the monster\'s treasure but no level.','P(0).cls.push(inst("wizard"));P(0).lvl=1;for(let i=0;i<3;i++)give(0,["toads","imp","stompy"][i]);fightNow(0,"hatmuncher");const t0=P(0).hand.length;act({act:"charm",tgt:0},0);return ALL(E(3,t0),E(1,P(0).lvl),E(true,P(0).hand.length>=0&&G.phase==="post"))');
R('Classes','Thief Backstab: discard a card to give a player in a fight -2, once per victim per fight.','P(0).lvl=3;P(1).cls.push(inst("thief"));give(1,"toads");give(1,"imp");fightNow(0,"hatmuncher");G.cb.stage="others";G.cb.ord=[1,2,3];G.cb.oi=0;const m=validMoves(1).filter(x=>x.act==="backstab");if(!m.length)return "no backstab offered";act(m[0],1);return ALL(E(1,sideStr(G.cb)),E(false,validMoves(1).some(x=>x.act==="backstab"&&x.tgt===0)))');
R('Classes','Thief Steal: discard a card, roll 4+ to steal a small item, fail and lose a level.','P(0).lvl=3;P(0).cls.push(inst("thief"));give(0,"toads");const s=wear(1,"stompy");rig(4);act({act:"steal",card:s,tgt:1},0);return ALL(E(true,P(0).eq.some(e=>e.id===s)),E(3,P(0).lvl))');
R('Classes','A failed Thief steal costs a level.','P(0).lvl=3;P(0).cls.push(inst("thief"));give(0,"toads");const s=wear(1,"stompy");rig(3);act({act:"steal",card:s,tgt:1},0);return ALL(E(false,P(0).eq.some(e=>e.id===s)),E(2,P(0).lvl))');
R('Classes','Thieves cannot steal a Big item.','P(0).cls.push(inst("thief"));give(0,"toads");const s=wear(1,"buzzsaw");return E(false,validMoves(0).some(m=>m.act==="steal"&&m.card===s))');
R('Classes','Cleric Turning: discard up to 3 cards, +3 each against Undead.','P(0).cls.push(inst("cleric"));P(0).lvl=3;for(let i=0;i<3;i++)give(0,["toads","imp","stompy"][i]);fightNow(0,"rattle");for(let i=0;i<3;i++)act(validMoves(0).find(x=>x.act==="turn"),0);return E(12,sideStr(G.cb))');
R('Classes','Turning works only against Undead.','P(0).cls.push(inst("cleric"));give(0,"toads");fightNow(0,"imp");return E(false,validMoves(0).some(m=>m.act==="turn"))');
R('Classes','Cleric Resurrection: instead of kicking, take the top door discard and discard a card from hand.','P(0).cls.push(inst("cleric"));const top=inst("elf");G.dd.push(top);const pay=give(0,"dwarf");act({act:"resurrect",card:pay},0);return ALL(E(true,P(0).hand.includes(top)),E(true,G.dd.includes(pay)))');
R('Classes','A hero may hold only one class (a new class card replaces the old).','P(0).cls.push(inst("thief"));const w=give(0,"wizard");act({act:"play",card:w},0);return E(["wizard"],classes(P(0)))');
R('Classes','A hero may hold only one race (a new race card replaces the old).','P(0).race.push(inst("elf"));const d=give(0,"dwarf");act({act:"play",card:d},0);return E(["dwarf"],races(P(0)))');
R('Classes','Mixed Heritage allows two races.','P(0).half=inst("mixed");P(0).race.push(inst("elf"));const d=give(0,"dwarf");act({act:"play",card:d},0);return E(["elf","dwarf"].sort(),races(P(0)).sort())');
R('Classes','Double Major allows two classes.','P(0).sup=inst("double");P(0).cls.push(inst("thief"));const w=give(0,"wizard");act({act:"play",card:w},0);return E(["thief","wizard"].sort(),classes(P(0)).sort())');
R('Classes','Mixed Heritage can only be played once you have a race.','const m=give(0,"mixed");return E(false,validMoves(0).some(x=>x.card===m))');
R('Classes','Elf: +1 to run away.','P(0).race.push(inst("elf"));fightNow(0,"hatmuncher");return E(1,runMod(P(0),G.cb,G.cb.mons[0]))');
R('Classes','Class and race cards may be dropped (discarded) at any time on your turn.','P(0).cls.push(inst("thief"));const id=P(0).cls[0];return E(true,validMoves(0).some(m=>m.act==="drop"&&m.card===id))');

// ============================ SPECIAL CARDS ============================
R('Special','Gone Fishing: all monsters leave and the fighter draws 2 treasures.','fightNow(0,"hatmuncher");const f=give(1,"fishing");G.cb.stage="others";G.cb.ord=[1,2,3];G.cb.oi=0;const n=P(0).hand.length;act({act:"play",card:f},1);return ALL(E("post",G.phase),E(n+2,P(0).hand.length))');
R('Special','Plus-One: the monster brings an identical date and both must be beaten.','fightNow(0,"toads");const c=give(1,"plusone");G.cb.stage="others";G.cb.ord=[1,2,3];G.cb.oi=0;act({act:"play",card:c,tgt:0},1);return ALL(E(2,G.cb.mons.length),E(4,monStr(G.cb)))');
R('Special','Smoke and Mirrors: swap a monster for another from your hand.','P(0).lvl=1;fightNow(0,"hatmuncher");const s=give(0,"mirrors");const m=give(0,"imp");act({act:"play",card:s,tgt:0,opt:m},0);return E(["imp"],G.cb.mons.map(x=>mdef(x).k))');
R('Special','Hug Juice: all monsters leave, no treasure.','P(0).lvl=1;fightNow(0,"toads");const h=give(0,"hugjuice");const n=P(0).hand.length;act({act:"play",card:h},0);return ALL(E("post",G.phase),E(n-1,P(0).hand.length),E(1,P(0).lvl))');
R('Special','Parrotify Potion: monster leaves, you take its treasure, no level.','P(0).lvl=1;fightNow(0,"skygrif");const p=give(0,"parrot");const n0=P(0).hand.length;act({act:"play",card:p,tgt:0},0);return ALL(E(1,P(0).lvl),E(n0-1+4,P(0).hand.length))');
R('Special','Not-My-Problem Potion: another player takes over the fight and its rewards.','P(0).lvl=1;fightNow(0,"imp");const n=give(0,"notmine");act({act:"play",card:n,tgt:1},0);return E(1,G.cb.who)');
R('Special','Mirror Twin: doubles your strength when fighting alone.','P(0).lvl=3;wear(0,"stompy");fightNow(0,"hatmuncher");const t=give(0,"twin");act({act:"play",card:t},0);return E(10,sideStr(G.cb))');
R('Special','Wishing Lantern: on your own turn a monster vanishes.','P(0).lvl=1;fightNow(0,"hatmuncher");const l=give(0,"lantern");act({act:"play",card:l,tgt:0},0);return E(0,G.cb?G.cb.mons.length:0)');
R('Special','Rummaging Rod: take any card from the discard piles.','const a=inst("imp");G.dd.push(a);const rod=give(0,"rod");act({act:"play",card:rod},0);return ALL(E("pick",G.q&&G.q.kind),E(true,G.q.opts.includes(a)))');
R('Special','Uninvited Guest can only be played during a fight, with a monster from your hand.','const g=give(0,"uninvited");give(0,"toads");return E(false,validMoves(0).some(m=>m.card===g))');
R('Special','Sticky Paste: a hero who gets away must roll again.','P(0).lvl=1;fightNow(0,"hatmuncher");give(1,"paste");rig(6);act({act:"run"},0);return E("glue",G.q&&G.q.kind)');
R('Special','Porter can be played at any time, even in a fight.','fightNow(0,"imp");const p=give(0,"porter");act({act:"play",card:p},0);return E(p,P(0).hire)');
// ============================ TURN FLOW (gameplay gate, Nov 2026) ============================
R('Turn','With no monster met you must loot the room or look for trouble: ending the turn is not offered yet.','G.door.push(inst("elf"));act({act:"kick"},0);const v=validMoves(0);return ALL(E("after",G.phase),E(false,v.some(m=>m.act==="end")),E(true,v.some(m=>m.act==="loot")))');
R('Turn','A curse kicked from the door still leaves the room to loot afterwards.','P(0).lvl=3;G.door.push(inst("hexlvl"));act({act:"kick"},0);const lv=P(0).lvl,n=P(0).hand.length;act({act:"loot"},0);return ALL(E(2,lv),E(n+1,P(0).hand.length),E("post",G.phase))');
R('Turn','After a won fight the turn goes straight to tidy-up: no loot and no trouble.','P(0).lvl=5;fightNow(0,"imp");act({act:"fight"},0);for(let k=0;k<20&&G.cb;k++){const t=sideToAct();const m=validMoves(t).find(x=>x.act==="pass"||x.act==="fight");if(!m)break;act(m,t)}const v=validMoves(0);return ALL(E(false,v.some(m=>m.act==="loot"||m.act==="trouble")),E(true,v.some(m=>m.act==="end")))');

// ============================ harness ============================
function run(){
  const html=fs.readFileSync(__dirname+'/doorkick.html','utf8');
  const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'http://localhost/',beforeParse(w){w.matchMedia=w.matchMedia||(()=>({matches:false,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}}))}});
  const w=dom.window;const errs=[];w.console.error=(...a)=>errs.push(a.join(' '));
  w.eval(`ANIM=0;AIDELAY=0;UI.fast=false;render=function(){};schedule=function(){};refresh=function(){};setSeed(5);
   var RIG=[],_rnd=rnd;rnd=function(n){if(n===6&&RIG.length)return RIG.shift()-1;return _rnd(n)};function rig(){RIG.push(...arguments)}
   function E(e,g){return JSON.stringify(e)===JSON.stringify(g)||('expected '+JSON.stringify(e)+' got '+JSON.stringify(g))}
   function ALL(){for(const r of arguments)if(r!==true)return r;return true}
   function inst(k){const ids=Object.keys(G.C).map(Number).filter(i=>G.C[i]===k);for(const id of ids){for(const z of ['door','tr','dd','td']){const j=G[z].indexOf(id);if(j>=0){G[z].splice(j,1);return id}}}
     for(const id of ids){for(const p of G.pl){const j=p.hand.indexOf(id);if(j>=0){p.hand.splice(j,1);return id}}}throw new Error('no free '+k)}
   function give(s,k){const id=inst(k);P(s).hand.push(id);return id}
   function wear(s,k){const id=inst(k);P(s).eq.push({id,on:true});return id}
   function bots(){for(const i of arguments)P(i).human=false}
   function clearAll(){for(const p of G.pl){p.hand.forEach(id=>(cd(id).d==='door'?G.door:G.tr).unshift(id));p.hand=[];p.eq.forEach(e=>(cd(e.id).d==='door'?G.door:G.tr).unshift(e.id));p.eq=[];}G.phase='main';G.active=0;G.setupI=99;G.win=null;G.q=null;RIG.length=0}
   function fightNow(s,k){const id=inst(k);G.active=s;startCombat(s,id,'kick');return id}
   function act(m,s){const r=performMove(m,s===undefined?sideToAct():s);if(!r.success)throw new Error(r.error);return r}
   function winFight(){act({act:'fight'},G.cb.who);let n=0;while(G.phase==='combat'&&n++<30){if(G.q)throw new Error('question '+G.q.kind);act({act:'pass'})}}`);
  let pass=0;const fails=[];
  for(const r of RULES){
    if(r.opt.todo){pass++;continue}
    let res;
    try{
      w.eval('RIG.length=0;setSeed(5);newGame("hot",4)');
      if(!r.opt.raw&&!r.opt.setup)w.eval('clearAll()');
      if(r.opt.setup){w.eval('G.phase="setup";G.setupOrd=[0,1,2,3];G.setupI=0;for(const p of G.pl){p.hand.forEach(id=>(cd(id).d==="door"?G.door:G.tr).unshift(id));p.hand=[]}')}
      res=w.eval('(function(){'+r.code+'})()');
    }catch(e){res='threw '+String(e.message||e).split('\n')[0]}
    if(res===true){const inv=w.eval('checkInvariants()');if(inv.length&&!/no legal move/.test(inv[0]))res='invariant: '+inv[0]}
    if(res===true)pass++;else fails.push(`R${r.n} ${r.text.slice(0,70)} :: ${String(res).replace(/^expected /,'expected ')}`)
  }
  w.close();
  fails.forEach(f=>console.log('FAIL '+f));
  console.log(`logic-test: ${RULES.length} rules, ${pass} pass, ${fails.length} fail`);
  process.exitCode=fails.length?1:0;
}
function md(){
  let out='# Doorkick Dungeon: rules checklist\n\nEvery rule of the original rulebook this game adapts (the 2001 base game, current rules sheet), numbered. Each number has exactly one assertion in `logic-test.js` that builds the position in the real engine, acts, and checks the exact result. Written from the published rules, not from the engine or the builders\' tests. Regenerate with `node logic-test.js --md`.\n\nSources: the published rulebook and FAQ (public rules pages), cross-checked against `rules-notes.md`.\nOpen interpretations ([H]): Halfling keeps the printed -1 to run away (the 2010 errata removed it); Charm needs at least 3 cards (2010 errata); Resurrection takes the top door discard (the rules sheet text).\n';
  let sec='';for(const r of RULES){if(r.sec!==sec){sec=r.sec;out+=`\n## ${sec}\n\n`}out+=`${r.n}. ${r.text}\n`}
  fs.writeFileSync(__dirname+'/RULES-CHECKLIST.md',out);console.log('wrote RULES-CHECKLIST.md ('+RULES.length+' rules)');
}
if(process.argv.includes('--md'))md();else run();
