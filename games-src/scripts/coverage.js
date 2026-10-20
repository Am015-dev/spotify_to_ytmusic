#!/usr/bin/env node
// Forced-card coverage: for every card, costume, tile, evolution and curse, start computer games where every monster
// already owns it (discard cards are played at once), and check the effect counter for it fires.
// Usage: node coverage.js <game.html> [games per item=3] [maxTurns=12]   env ONLY=regex to test some items.
const {JSDOM}=require('jsdom');const fs=require('fs');
const html=fs.readFileSync(process.argv[2],'utf8');const K=+process.argv[3]||3,MAXT=+process.argv[4]||12;
function run(setup){return new Promise(res=>{const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'http://localhost/'});const w=dom.window;const errs=[],inv=new Set();
  w.addEventListener('error',e=>errs.push(e.message));w.console.error=(...a)=>errs.push(a.join(' '));
  w.eval('ANIM=0;AIDELAY=0;UI.n=4;UI.evo=true;UI.xp="trial";DEFEX={cult:1,tower:1,bers:1,wick:1,cost:1,curse:1}');
  try{w.eval("newGame('ai')");w.eval(setup);w.eval('G.ncards=cardTotal()')}catch(e){errs.push('setup '+e.stack)}
  let last='',stall=0;const t0=Date.now();
  const iv=setInterval(()=>{let G;try{G=w.eval('G');w.eval('checkInvariants()').filter(x=>!/evolution count|card count|duplicate card|two places/.test(x)).forEach(x=>inv.add(x))}catch(e){errs.push(String(e))}
    const sig=G?JSON.stringify([G.turn,G.active,G.dice,G.log.length,G.phase]):'';if(sig===last)stall++;else{stall=0;last=sig}if(stall>80)errs.push('STALL');
    if(!G||G.winner||stall>80||G.turn>MAXT||Date.now()-t0>40000){clearInterval(iv);res({cov:JSON.parse(JSON.stringify(w.eval('COV'))),errs,inv:[...inv]});w.close()}},3)})}
(async()=>{const dom=new JSDOM(html,{runScripts:'dangerously',url:'http://localhost/'});const W=dom.window;
  const cards=JSON.parse(W.eval('JSON.stringify(Object.keys(CARDS).map(k=>[k,CARDS[k].t]))'));const evos=JSON.parse(W.eval('JSON.stringify(Object.keys(EVO).map(Number))'));const curses=JSON.parse(W.eval('JSON.stringify(Object.keys(CURSES))'));
  const evoMon=JSON.parse(W.eval('JSON.stringify(Object.fromEntries(Object.keys(EVO).map(e=>[e,MEVO.findIndex(g=>Math.floor(e/10)===g)])))'));W.close();
  const items=[];
  for(const [k,t] of cards){const pre=t==='U'?'cost:':t==='W'?'wick:':'card:';const key=pre+(t==='U'||t==='W'?k.slice(2):k);
    const setup=t==='D'?`G.pl.forEach((p,j)=>{p.en=12;G.tf.uses={};acquire(p,'${k}#cv'+j,false,()=>{})});deaths()`:`G.pl.forEach((p,j)=>{p.en=15;p.hp=Math.min(p.hp,7);p.cards.push('${k}#cv'+j);if('${k}'==='cell')p.tok.cell=6;if('${k}'==='smoke')p.tok.smoke=3;if('${k}'==='mimic')p.tok.mim=null;if('${t}'==='W'){p.cards.pop();p.wk=CARDS['${k}'].lv-1;G.wtiles[CARDS['${k}'].lv]=['${k}']}});if('${k}'==='mimic')G.pl.forEach(p=>{const t=mimicTargets(p);if(t.length)setMimic(p,t[0].o+':'+t[0].id)})`;
    items.push({name:k,key,setup})}
  for(const e of evos){const m=evoMon[e];items.push({name:'evo '+e,key:'evo:'+e,setup:`G.pl.forEach(p=>{p.m=${m};p.en=12;p.hand.push(${e},${e})});G.frz=null`})}
  for(const c of curses)for(const f of ['a','s'])items.push({name:c+':'+f,key:'curse:'+c.slice(2)+':'+f,setup:`G.curse='${c}';G.lockCurse=true;if('${c}'==='k_ra')G.pl.forEach(p=>p.hp=Math.min(p.hp,8));G.pl.forEach(p=>{p.en=6;p.cards.push('probe#k'+p.i)})`});
  const re=process.env.ONLY?new RegExp(process.env.ONLY):null;const miss=[],bad=[];let n=0;
  for(const it of items){if(re&&!re.test(it.name))continue;n++;let hit=0,got={};const errs=[],inv=[];
    for(let g=0;g<K&&!hit;g++){const r=await run(it.setup);errs.push(...r.errs);inv.push(...r.inv);Object.keys(r.cov).forEach(x=>{if(x===it.key||x.startsWith(it.key+':'))hit+=r.cov[x]})}
    if(!hit)miss.push(it.name);if(errs.length||inv.length)bad.push(it.name+': '+[...new Set([...errs,...inv])].slice(0,3).join(' || '));
    if(process.env.V)console.log(it.name,hit)}
  console.log('items',n,'never fired',miss.length,JSON.stringify(miss));console.log('items with errors/invariant problems',bad.length);bad.slice(0,30).forEach(b=>console.log(' ',b.slice(0,400)))})();
