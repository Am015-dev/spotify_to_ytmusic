// Browser check: a full computer-vs-computer game in the real page at phone and desktop size, 0 JS errors expected. Usage: node fullgame-ai.js
const {chromium}=require('/opt/node-tools/node_modules/playwright'); const path=require('path'); const dir=path.resolve(__dirname,'..')+'/';
(async()=>{const b=await chromium.launch(); let bad=0;
for(const [w,h] of [[402,874],[1366,768]]){
 const ctx=await b.newContext({viewport:{width:w,height:h},hasTouch:true,isMobile:w<500}); const p=await ctx.newPage(); const errs=[];
 p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>m.type()==='error'&&errs.push(m.text()));
 await p.goto('file://'+dir+'via-tessera.html'); await p.waitForTimeout(400);
 const r=await p.evaluate(()=>{VTUI.UI.fast=true; VTUI.startGame('vs',{lvl:'normal',seed:5,first:0,ai:['normal','normal']}); let n=0;
   while(G.phase==='play'&&n++<4000){VT.performMove(G,VAI.choose(G,'normal')); if(n%15===0)VTUI.render(); const e=VT.checkInvariants(G); if(e.length)return 'INVARIANT '+e;}
   VTUI.render(); return G.phase+' moves '+n+' turn '+G.turn+' score '+JSON.stringify(VT.score(G,0).total)+'/'+JSON.stringify(VT.score(G,1).total)});
 console.log(w+'x'+h,r);
 await p.waitForTimeout(300); await p.evaluate(()=>{VTUI.startGame('vs',{lvl:'normal',seed:3,first:0,learn:true})}); await p.waitForTimeout(300);
 await ctx.close(); if(errs.length){console.log(w,errs);bad++}}
await b.close(); process.exit(bad)})();
