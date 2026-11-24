const {chromium}=require('/opt/node-tools/node_modules/playwright');
const path=require('path'),fs=require('fs');
const dir='/home/user/spotify_to_ytmusic/games-src/via-tessera/';
(async()=>{
 const out=process.env.OUT||'/tmp/claude-0/s/out'; fs.mkdirSync(out,{recursive:true});
 const b=await chromium.launch();
 const ctx=await b.newContext({viewport:{width:402,height:874},hasTouch:true,isMobile:true,deviceScaleFactor:2,recordVideo:process.env.VID?{dir:out,size:{width:402,height:874}}:undefined});
 const p=await ctx.newPage(); const errs=[];
 p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>m.type()==='error'&&errs.push(m.text()));
 await p.goto('file://'+dir+'via-tessera.html'); await p.waitForTimeout(1500);
 await p.screenshot({path:out+'/start.png'});
 await p.tap('#tlearn'); await p.waitForTimeout(1200);
 let stuck=0,last='',n=0,shots=0;
 for(let i=0;i<1500;i++){
  const st=await p.evaluate(()=>{ if(!window.G&&typeof G==='undefined')return null; return {ph:G.phase,turn:G.turn,busy:VTUI.UI.busy}});
  if(st&&st.ph!=='play'){break}
  const r=await p.evaluate(()=>{const t=VTUI.hintTarget(); if(!t) return null; t.scrollIntoView&&0; const b=t.getBoundingClientRect(); return {x:b.x+b.width/2,y:b.y+b.height/2,w:b.width,h:b.height,txt:(t.textContent||'').slice(0,20)}});
  const key=JSON.stringify([r,st]);
  if(!r){await p.waitForTimeout(500); if(++stuck>30){console.log('STUCK no hint',JSON.stringify(st));await p.screenshot({path:out+'/stuck.png'});break} continue}
  stuck=0;
  await p.waitForTimeout(250);
  const r2=await p.evaluate(()=>{const t=VTUI.hintTarget(); if(!t) return null; if(t.closest('#hand,#sheet'))t.scrollIntoView({block:'nearest',inline:'center',behavior:'instant'}); const b=t.getBoundingClientRect(); return {x:b.x+b.width/2,y:b.y+b.height/2,w:b.width,h:b.height,txt:(t.className.baseVal??t.className)+'|'+t.id+'|'+(t.textContent||'').slice(0,12)}}); if(r2)Object.assign(r,r2);
  if(r.w<44||r.h<44) console.log('small target',r.w|0,r.h|0,r.txt);
  if(r.x<0||r.y<0||r.x>402||r.y>874){console.log('offscreen',JSON.stringify(r))}
  await p.touchscreen.tap(r.x,r.y); n++;
  await p.waitForTimeout(350);
  if(n==60||n==150) {await p.screenshot({path:out+'/mid'+(shots++)+'.png'});}
 }
 await p.waitForTimeout(1500);
 await p.screenshot({path:out+'/result.png'});
 console.log('taps',n,'errs',errs.slice(0,5));
 await ctx.close(); await b.close();
})();
