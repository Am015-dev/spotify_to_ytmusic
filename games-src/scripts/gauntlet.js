#!/usr/bin/env node
// Computer-vs-computer run. Usage: node gauntlet.js <game.html> [games=20] [maxTurns=40]
// env: PRE='js run before newGame (e.g. UI.n=5;UI.xp="trial";UI.evo=true;DEFEX={cult:1})'  SEED=n (game k uses seed n+k)
//      COVOUT=file (write merged effect counters as JSON)  QUIET=1
// Needs jsdom (run from a folder where node_modules has it). Checks checkInvariants() on every tick.
const {JSDOM}=require('jsdom');const fs=require('fs');
const file=process.argv[2];if(!file){console.error('usage: node gauntlet.js <game.html> [games] [maxTurns]');process.exit(1)}
const html=fs.readFileSync(file,'utf8');const N=+process.argv[3]||20,MAXT=+process.argv[4]||40;
const PRE=process.env.PRE||'';const SEED=process.env.SEED;
const cov={};
function game(k){return new Promise(res=>{
  const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'http://localhost/'});const w=dom.window;
  const errs=[],inv=new Set();w.addEventListener('error',e=>errs.push(e.message+' '+(e.error&&e.error.stack||'').split('\n').slice(0,3).join(' | ')));w.console.error=(...a)=>errs.push(a.join(' '));
  w.eval('ANIM=0;AIDELAY=0');if(SEED!==undefined)w.eval(`setSeed(${(+SEED)+k})`);
  try{if(PRE)w.eval(PRE);w.eval("newGame('ai')")}catch(e){errs.push(e.stack)}
  let last='',stall=0;const t0=Date.now();
  const iv=setInterval(()=>{let G;try{G=w.eval('G');const b=w.eval('checkInvariants()');b.forEach(x=>inv.add(x))}catch(e){errs.push(String(e.stack||e))}
    const sig=G?JSON.stringify([G.turn,G.active,G.dice,G.log&&G.log.length,G.phase]):'';if(sig===last)stall++;else{stall=0;last=sig}
    if(stall>80)errs.push('STALL turn '+(G&&G.turn)+' phase '+(G&&G.phase)+' choice '+w.eval('UI.choice&&UI.choice.title')+' busy '+w.eval('UI.busy'));
    if(!G||G.winner||stall>80||G.turn>MAXT||Date.now()-t0>90000){clearInterval(iv);
      const C=w.eval('COV');for(const x in C)cov[x]=(cov[x]||0)+C[x];
      const r={w:G&&G.winner,turn:G&&G.turn,why:((G&&G.winText)||'none').slice(0,30),errs,inv:[...inv],seed:SEED!==undefined?(+SEED)+k:null};res(r);w.close()}},4)})}
(async()=>{const rs=[];for(let i=0;i<N;i++){const r=await game(i);rs.push(r);if(!process.env.QUIET&&(r.errs.length||r.inv.length))console.log('game',i,'seed',r.seed,JSON.stringify(r.errs.slice(0,3)),JSON.stringify(r.inv.slice(0,5)))}
  const sides={};rs.forEach(r=>sides[r.w||'none']=(sides[r.w||'none']||0)+1);
  const why={};rs.forEach(r=>{const k=r.why.replace(/:.*/,'');why[k]=(why[k]||0)+1});
  const avg=k=>(rs.reduce((a,r)=>a+(+r[k]||0),0)/rs.length).toFixed(1);
  console.log('games',N,'wins',JSON.stringify(sides));console.log('endings',JSON.stringify(why));
  console.log('avg turns',avg('turn'),'min',Math.min(...rs.map(r=>r.turn)),'max',Math.max(...rs.map(r=>r.turn)),'unfinished',rs.filter(r=>!r.w).length);
  const errs=rs.flatMap(r=>r.errs),inv=rs.flatMap(r=>r.inv);console.log('errors',errs.length,'invariant violations',inv.length,'stalls',errs.filter(e=>/STALL/.test(e)).length);
  if(errs.length)console.log(JSON.stringify(errs.slice(0,4)));if(inv.length)console.log(JSON.stringify([...new Set(inv)].slice(0,8)));
  if(process.env.COVOUT)fs.writeFileSync(process.env.COVOUT,JSON.stringify(cov,null,0));})();
