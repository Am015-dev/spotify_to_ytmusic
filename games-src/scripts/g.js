#!/usr/bin/env node
// Computer-vs-computer balance run. Usage: node gauntlet.js <game.html> [games=20] [maxTurns=40]
// Needs: npm i jsdom@24 (run from a folder where node_modules has it, or set NODE_PATH).
// Relies on the test hooks in references/architecture.md.
const {JSDOM}=require('jsdom');const fs=require('fs');
const file=process.argv[2];if(!file){console.error('usage: node gauntlet.js <game.html> [games] [maxTurns]');process.exit(1)}
const html=fs.readFileSync(file,'utf8');const N=+process.argv[3]||20,MAXT=+process.argv[4]||40;
// Edit these to match the game's log wording. Each counts log lines matching the regex.
const COUNT={smash:/ smashes /,buys:/ buys “/,yields:/ yields /,ko:/knocked out/,enters:/storms into/};
function game(){return new Promise(res=>{
  const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'http://localhost/'});const w=dom.window;
  const errs=[];w.addEventListener('error',e=>errs.push(e.message));w.console.error=(...a)=>errs.push(a.join(' '));
  w.eval('ANIM=0;AIDELAY=0;DEFN='+(process.env.N||4)+';UI.n=DEFN');try{w.eval("newGame('ai')")}catch(e){errs.push(e.stack)}
  let last='',stall=0;const t0=Date.now();
  const iv=setInterval(()=>{let G;try{G=w.eval('G')}catch(e){errs.push(String(e))}
    const sig=G?JSON.stringify([G.turn,G.active,G.dice,G.log&&G.log.length]):'';if(sig===last)stall++;else{stall=0;last=sig}
    if(stall>60)errs.push('STALL turn '+(G&&G.turn)+' phase '+(G&&G.phase));
    if(!G||G.winner||stall>60||G.turn>MAXT||Date.now()-t0>60000){clearInterval(iv);
      const L=(G&&G.log||[]).map(l=>l.t);const r={w:G&&G.winner,turn:G&&G.turn,why:((G&&G.winText)||'none').split(':')[0],errs};
      for(const k in COUNT)r[k]=L.filter(x=>COUNT[k].test(x)).length;res(r);w.close()}},5)})}
(async()=>{const rs=[];for(let i=0;i<N;i++)rs.push(await game());
  const sides={};rs.forEach(r=>sides[r.w||'none']=(sides[r.w||'none']||0)+1);
  const why={};rs.forEach(r=>why[r.why]=(why[r.why]||0)+1);
  const avg=k=>(rs.reduce((a,r)=>a+(+r[k]||0),0)/rs.length).toFixed(1);
  console.log('games',N,'wins',JSON.stringify(sides));console.log('endings',JSON.stringify(why));
  console.log('avg turns',avg('turn'),'min',Math.min(...rs.map(r=>r.turn)),'max',Math.max(...rs.map(r=>r.turn)),Object.keys(COUNT).map(k=>k+' '+avg(k)).join('  '));
  const errs=rs.flatMap(r=>r.errs);console.log('errors',errs.length,JSON.stringify(errs.slice(0,5)));})();
