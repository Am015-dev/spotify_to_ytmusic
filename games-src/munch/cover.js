// run N computer games and count how often each card's name shows up in the log (proof that it was used)
const {JSDOM}=require('jsdom');const fs=require('fs');const html=fs.readFileSync('doorkick.html','utf8');const N=+process.argv[2]||10;
const counts={};const errs=[];let names=null;const inv=[];
function one(seed){return new Promise(res=>{const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'http://localhost/'});const w=dom.window;w.console.error=(...a)=>errs.push(a.join(' '));
  w.eval('ANIM=0;AIDELAY=0;render=function(){};'+(process.env.PRE||''));w.eval('setSeed('+seed+')');w.eval("newGame('ai',"+(process.env.NP||4)+")");if(!names)names=w.eval('CARDS.map(c=>c.n)');
  const t0=Date.now();const iv=setInterval(()=>{const v=w.eval('checkInvariants()');if(v.length&&inv.length<5)inv.push(seed+': '+v[0]);const G=w.eval('G');
    if(G.winner||Date.now()-t0>60000){clearInterval(iv);const L=G.log.map(l=>l.t);for(const n of names){const k=L.filter(t=>t.includes(n)).length;counts[n]=(counts[n]||0)+k}res({turn:G.turn,w:G.winner,why:G.winText});w.close()}},1)})}
(async()=>{const rs=[];for(let i=0;i<N;i++)rs.push(await one(1000+i*7+(+process.env.OFF||0)));
  const never=names.filter(n=>!counts[n]);console.log('games',N,'avg turns',(rs.reduce((a,r)=>a+r.turn,0)/N).toFixed(1),'no winner',rs.filter(r=>!r.w).length);
  console.log('errors',errs.length,JSON.stringify(errs.slice(0,4)));console.log('invariants',JSON.stringify(inv));console.log('never seen in the log ('+never.length+'):',never.join(' | '))})()
