// Scripted full game by touch (follows the built-in hint) at machine speed. Usage: node proof/full-game.js 402x874|1366x768
const {chromium}=require('/opt/node-tools/node_modules/playwright');
const fs=require('fs'),dir=__dirname+'/../',out=__dirname+'/';
(async()=>{
 const [W,H]=(process.argv[2]||'402x874').split('x').map(Number), tag=W+'x'+H, t0=Date.now();
 const b=await chromium.launch();
 const ctx=await b.newContext({viewport:{width:W,height:H},hasTouch:true,isMobile:W<500,deviceScaleFactor:W<500?2:1});
 const p=await ctx.newPage(); const errs=[];
 p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>m.type()==='error'&&errs.push(m.text()));
 await p.goto('file://'+dir+'via-tessera.html'); await p.waitForTimeout(600);
 await p.tap('#tvs'); await p.waitForTimeout(300);
 await p.evaluate(()=>{UI.AIDELAY=0;UI.fast=true;UI.hints=true;});
 let n=0,stuck=0,shot=0,small=new Set();
 for(let i=0;i<4000;i++){
  const st=await p.evaluate(()=>({ph:G.phase,busy:UI.busy,turn:G.turn}));
  if(st.ph!=='play')break;
  const r=await p.evaluate(()=>{const t=VTUI.hintTarget(); if(!t)return null; if(t.closest('#hand,#sheet'))t.scrollIntoView({block:'nearest',inline:'center',behavior:'instant'}); const b=t.getBoundingClientRect(); return {x:b.x+b.width/2,y:b.y+b.height/2,w:b.width,h:b.height,k:(t.id||t.className.baseVal||t.className)}});
  if(!r||st.busy){await p.waitForTimeout(40); if(++stuck>400){console.log('STUCK');await p.screenshot({path:out+'stuck-'+tag+'.png'});break} continue}
  stuck=0; if(n%50===0)console.log('n',n,st.turn,Date.now()-t0);
  if((r.w<44||r.h<44)&&!/^(sl|ic)/.test(r.k)) small.add(r.k+':'+(r.w|0)+'x'+(r.h|0));
  await p.touchscreen.tap(r.x,r.y); n++;
  await p.waitForTimeout(25);
  if(n===25||n===70){await p.screenshot({path:out+'hud-'+tag+'-'+(shot++)+'.png'});}
 }
 await p.waitForTimeout(300);
 await p.screenshot({path:out+'end-'+tag+'.png'});
 const fin=await p.evaluate(()=>({ph:G.phase,turn:G.turn,s:G.pl.map((_,i)=>VT.score(G,i).total)}));
 console.log(tag,'taps',n,'secs',(Date.now()-t0)/1000,'final',JSON.stringify(fin),'small',[...small].join(' '),'JS errors',errs.length,errs.slice(0,3));
 await b.close();
})();
