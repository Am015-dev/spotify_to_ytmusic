#!/usr/bin/env node
// Directed rule scenarios against the real engine. Usage: node rulestest.js <game.html>
const {JSDOM}=require('jsdom');const fs=require('fs');const html=fs.readFileSync(process.argv[2],'utf8');
function mk(n,ex){const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'http://localhost/'});const w=dom.window;const errs=[];w.addEventListener('error',e=>errs.push(e.message));
  w.eval(`ANIM=0;AIDELAY=0;UI.paused=true;UI.n=${n||4};UI.evo=false;UI.xp='trial';DEFEX=${JSON.stringify(ex||{})};setSeed(7);newGame('ai');
   G.pl.forEach(p=>{p.hp=10;p.vp=0;p.en=0;p.cards=[];p.mb=0;p.hand=[];p.evo=[]});G.city=-1;G.bay=-1;G.active=0;G.home=0;G.ncards=undefined;G.market=['kiosk#t','train#t','tower#t'];PENDING=[];`);
  w.errs=errs;return w}
const setDice=(w,f)=>w.eval(`G.phase='roll';G.rolls=0;G.dice=${JSON.stringify(f)}.map(x=>({f:x,k:true}))`);
let pass=0,fail=0;const T=(name,ok,info)=>{if(ok)pass++;else fail++;console.log((ok?'PASS ':'FAIL ')+name+(ok?'':' '+JSON.stringify(info)))};
const g=(w,e)=>w.eval(e);
// 1. Brainjack turn flow
{const w=mk(4);g(w,`aiBrainjack=(q)=>q.i===1;G.pl[1].mb=1;G.pl[0].vp=5`);setDice(w,['3','3','3','E','E','C']);g(w,'resolve()');
 const a=g(w,'JSON.stringify({act:G.active,bug:!!G.bug,ph:G.phase,vp1:G.pl[1].vp,en1:G.pl[1].en,city:G.city,vp0:G.pl[0].vp,mb:G.pl[1].mb})');
 T('brainjacker resolves the dice, enters and gets its buy step',a.includes('"act":1,"bug":true,"ph":"buy","vp1":4,"en1":2,"city":1'),a);
 g(w,'endTurn()');const b=g(w,'JSON.stringify({act:G.active,bug:!!G.bug,ph:G.phase,vp0:G.pl[0].vp,nd:G.dice.length})');
 T('then the Brainjacked monster rolls again from scratch, no extra city stars',b==='{"act":0,"bug":false,"ph":"roll","vp0":5,"nd":6}',b)}
// 2. Rampage Rush grants the extra turn after the end of the turn
{const w=mk(4);g(w,`G.pl[0].en=7;G.market[0]='rush#t';G.phase='buy';buy(0)`);const a=g(w,'G.phase+":"+G.active+":"+G.tf.frenzy');T('Rampage Rush does not start a turn inside the buy step',a==='buy:0:true',a);
 g(w,`G.pl[0].en=6;G.pl[0].cards=['battery#t']`);g(w,'endTurn()');const b=g(w,'G.active+":"+G.phase+":"+G.pl[0].vp+":"+G.tf.extra');T('... end-of-turn effects happen, then the same monster goes again',b==='0:roll:1:true',b)}
// 3. Harbor monster does not move up at its Enter step
{const w=mk(5);g(w,'G.bay=2;G.active=2');setDice(w,['1','2','3','E','E','H']);g(w,'resolve()');const a=g(w,'G.city+":"+G.bay');T('Harbor monster stays in the Harbor when Downtown is empty',a==='-1:2',a);
 g(w,'G.active=0');setDice(w,['1','2','3','E','E','H']);g(w,'resolve()');const b=g(w,'G.city+":"+G.bay');T('next outside monster enters Downtown',b==='0:2',b)}
// 4. Skydive Stomp
{const w=mk(5);g(w,`G.city=1;G.bay=2;G.phase='buy';acquire(G.pl[0],'skydive#t',false,()=>{})`);const a=g(w,'G.city+":"+G.bay+":"+G.pl[0].vp');T('Skydive Stomp: +2 stars, takes Downtown (+1), everyone else leaves',a==='0:-1:3',a)}
// 5. Venom Quills without claws
{const w=mk(4);g(w,`G.city=1;G.pl[0].cards=['quills#t']`);setDice(w,['2','2','2','E','E','H']);g(w,'resolve()');T('Venom Quills: three 2s add 2 claws',g(w,'G.pl[1].hp')===8,g(w,'G.pl[1].hp'))}
// 6. Tunneler in the city without claws
{const w=mk(4);g(w,`G.city=0;G.pl[0].cards=['tunnel#t']`);setDice(w,['1','2','3','E','E','H']);g(w,'resolve()');T('Tunneler: +1 claw in the city with no claws rolled',g(w,'G.pl[1].hp+","+G.pl[2].hp')==='9,9',g(w,'G.pl[1].hp+","+G.pl[2].hp'))}
// 7. Membrane Wings
{const w=mk(4);g(w,`G.city=1;G.pl[1].cards=['wings#t'];G.pl[1].en=2;G.pl[1].hp=3`);setDice(w,['C','C','C','E','E','H']);g(w,'resolve()');const a=g(w,'G.pl[1].hp+":"+G.pl[1].en+":"+G.tf.safe[1]');
 T('Membrane Wings: pay 2 when about to lose hearts, no loss',a==='3:0:true',a);g(w,`acquire(G.pl[0],'flame#t',false,()=>{})`);T('... and no loss for the rest of the turn',g(w,'G.pl[1].hp')===3,g(w,'G.pl[1].hp'))}
// 8. Regrowth on every heal
{const w=mk(4);g(w,`G.pl[0].cards=['regrow#t'];G.pl[0].hp=4;acquire(G.pl[0],'patch#t',false,()=>{})`);T('Regrowth: Patch Up heals 2+1',g(w,'G.pl[0].hp')===7,g(w,'G.pl[0].hp'))}
// 9. Carrion Feast triggers on an Egg Clutch reset
{const w=mk(4);g(w,`G.pl[1].cards=['carrion#t'];G.pl[2].cards=['egg#t'];G.pl[2].hp=1;G.city=2`);setDice(w,['C','1','2','E','E','H']);g(w,'resolve()');const a=g(w,'G.pl[1].vp+":"+G.pl[2].hp+":"+G.pl[2].alive');T('Carrion Feast +3 when an Egg Clutch monster drops to 0',a==='3:10:true',a)}
// 10. The Spire
{const w=mk(4,{tower:1});setDice(w,['1','1','1','1','E','H']);g(w,'resolve()');T('Tower: not claimed when entering this turn',g(w,'G.tower.join()')==='-1,-1,-1',g(w,'G.tower.join()'));
 g(w,'G.phase="roll";G.city=0;G.tower=[0,0,-1]');setDice(w,['1','1','1','1','E','H']);g(w,'resolve()');T('Tower: level 3 wins at once',g(w,'G.winner')==='P1',g(w,'G.winner+G.tower.join()'))}
// 11. Top Predator with no target
{const w=mk(4);g(w,`G.pl[0].cards=['alpha#t']`);setDice(w,['C','1','2','E','E','H']);g(w,'resolve()');T('Top Predator: +1 star for rolling a claw even with no target (+1 entering)',g(w,'G.pl[0].vp')===2,g(w,'G.pl[0].vp'))}
// 12. Time Hiccup chains
{const w=mk(4);g(w,`G.pl[0].cards=['hiccup#t'];G.city=3`);setDice(w,['1','1','1','E','E','H']);g(w,'resolve()');g(w,'endTurn()');const a=g(w,'G.active+":"+G.less+":"+G.dice.length');T('Time Hiccup: extra turn with 1 die fewer',a==='0:1:5',a);
 setDice(w,['1','1','1','E','E']);g(w,'resolve()');g(w,'endTurn()');const b=g(w,'G.active+":"+G.less+":"+G.dice.length');T('... and 2 fewer when it repeats',b==='0:2:4',b)}
// 13. Wrecking Spree and Clown
{const w=mk(4,{cost:1});g(w,`G.pl[0].cards=['spree#t','c_clown#t'];G.city=3`);setDice(w,['1','2','3','E','C','H']);T('Clown Nose unlocks on 1-2-3-heart-claw-energy',g(w,'clownReady()')===true);g(w,'resolve()');T('Wrecking Spree +9',g(w,'G.pl[0].vp')===9,g(w,'G.pl[0].vp'))}
// 14. Menace gauge
{const w=mk(4,{wick:1});g(w,'G.city=3');setDice(w,['1','1','1','1','1','1']);g(w,'resolve()');T('Six 1s give 4 menace and a level-3 tile',g(w,'G.pl[0].wk+":"+G.pl[0].cards.filter(c=>c.startsWith("w_")).length')==='4:1',g(w,'G.pl[0].wk+G.pl[0].cards'))}
// 15. LOCK-ON / SLINK / VENOM / HARDENED
{const w=mk(4);g(w,`G.pl[0].cards=['m_legend#t'];G.pl[2].hp=2;G.city=1;G.tf.hunt=null;aiKwStart=(p,o)=>o[0].k;aiHunt=()=>2;startQuestions(G.pl[0]).forEach(f=>f(()=>{}))`);
 setDice(w,['C','C','E','E','1','2']);g(w,'resolve()');const a=g(w,'G.pl[1].hp+":"+G.pl[2].alive+":"+G.pl[0].vp');T('LOCK-ON: claws hit only the locked-on monster (even outside the city); knockout gives 4 stars',a.startsWith('10:false:')&&+a.split(':')[2]>=4,a)}
{const w=mk(4);g(w,`G.pl[0].cards=['m_offp#t'];G.pl.forEach(p=>p.vp=5);G.city=3;aiKwStart=(p,o)=>o[0].k;startQuestions(G.pl[0]).forEach(f=>f(()=>{}))`);
 setDice(w,['3','3','3','E','E','H']);g(w,'resolve()');const a=g(w,'G.pl[1].vp+":"+G.pl[1].hp+":"+G.pl[0].vp');T('SLINK + Assault Routine: others lose the 3 stars you scored and 3 hearts',a==='2:7:8',a)}
{const w=mk(4);g(w,`G.city=1;G.pl[1].cards=['m_whip#t'];G.pl[0].en=5`);setDice(w,['C','C','C','E','E','1']);g(w,'resolve()');const a=g(w,'G.pl[1].hp+":"+G.pl[0].hp+":"+G.pl[0].en');T('VENOM + Shock Lash: attacker loses the same hearts and energy',a==='7:7:4',a)}
{const w=mk(4);g(w,`G.city=1;G.pl[1].cards=['m_earm#t']`);setDice(w,['C','C','C','E','E','1']);g(w,'resolve()');const a=g(w,'G.pl[1].hp+":"+G.pl[1].en');T('HARDENED + Charged Plating: no hearts lost, energy instead',a==='10:3',a)}
{const w=mk(4);g(w,`G.pl[0].cards=['m_gift#t'];G.pl[0].vp=8;G.city=3`);setDice(w,['1','2','3','E','E','H']);g(w,'resolve()');g(w,'endTurn()');const a=g(w,'G.active+":"+!!G.tf.frenzyTurn');g(w,'G.phase="buy";endTurn()');const b=g(w,'G.pl[0].vp+":"+G.active');
 T('ENCORE: another turn right away, and Rigged Present costs 5 stars after it',a==='0:true'&&b.startsWith('3:'),a+' / '+b)}
// 16. Alley Lurker keeps the choice of which 3 (the button asks which die)
{const w=mk(4);g(w,`G.pl[0].cards=['lurker#t'];G.pl[0].human=true`);setDice(w,['3','3','1','E','E','H']);g(w,`doAct(G.pl[0],'lurker')`);T('Alley Lurker asks which 3 to reroll',g(w,'UI.choice&&UI.choice.options.length')===2,g(w,'UI.choice&&UI.choice.options'))}
console.log('passed',pass,'failed',fail);process.exit(0);
