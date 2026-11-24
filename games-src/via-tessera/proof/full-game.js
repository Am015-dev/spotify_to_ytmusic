// Scripted full game by touch at machine speed, plus a screenshot of the main screen and every panel. Usage: node full-game.js  (OUT=dir)
const {chromium}=require('/opt/node-tools/node_modules/playwright');
const fs=require('fs'),path=require('path');
const dir=path.resolve(__dirname,'..')+'/'; const OUT=process.env.OUT||__dirname; 
(async()=>{const b=await chromium.launch(); let bad=0;
for(const [w,h,n] of [[402,874,'402'],[1366,768,'1366']].filter(z=>!process.env.ONLY||z[2]===process.env.ONLY)){
 const ctx=await b.newContext({viewport:{width:w,height:h},hasTouch:true,isMobile:w<500,deviceScaleFactor:w<500?2:1});
 const p=await ctx.newPage(); const errs=[];
 p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>m.type()==='error'&&errs.push(m.text()));
 await p.goto('file://'+dir+'via-tessera.html'); await p.waitForTimeout(600);
 await p.screenshot({path:`${OUT}/${n}-0-title.png`});
 await p.evaluate(()=>{VTUI.UI.fast=true; VTUI.UI.hints=true; VTUI.startGame('vs',{lvl:'normal',seed:11,first:0,learn:true})}); await p.waitForTimeout(400);
 const shot=async(name)=>p.screenshot({path:`${OUT}/${n}-${name}.png`});
 const audit=async(tag)=>{const r=await p.evaluate(()=>{const out=[];document.querySelectorAll('button,.cd,.ib,.strip,.round').forEach(e=>{const r=e.getBoundingClientRect();if(!r.width||e.closest('[hidden]')||e.disabled)return;const cs=getComputedStyle(e);if(cs.visibility==='hidden'||cs.pointerEvents==='none')return;if((r.width<44||r.height<44)&&!e.closest('.ref,.mrow,.sc-table'))out.push('small '+(e.id||e.className)+' '+r.width.toFixed(0)+'x'+r.height.toFixed(0))});
   document.querySelectorAll('.strip .cnt,.strip .nm,#prompt,.btn,.cd .nm').forEach(e=>{const r=e.getBoundingClientRect();if(!r.width)return;const f=parseFloat(getComputedStyle(e).fontSize);if(f<13)out.push('font '+f+' '+(e.id||e.className))}); return out}); if(r.length){console.log(n,tag,[...new Set(r)].slice(0,8).join('; '));bad+=r.length}};
 await shot('1-main'); await audit('main');
 // panels (each opened, screenshot, closed by X and by outside tap)
 await p.evaluate(()=>{VTUI.UI.hints=false});
 await p.touchscreen.tap(...await p.evaluate(()=>{const r=document.querySelector('#hand .cd[data-i="1"]').getBoundingClientRect();return [r.x+r.width/2,r.y+r.height/2]})); await p.waitForTimeout(150);
 await shot('2-card-selected'); await audit('selected');
 await p.evaluate(()=>{VTUI.UI.hints=true;VTUI.render()});
 const open=async(sel,name)=>{await p.tap(sel);await p.waitForTimeout(150);await shot(name);await audit(name);
   const x=await p.$('#drawer:not([hidden]) [data-x]'); if(x){const bb=await x.boundingBox(); if(bb.width<44||bb.height<44){console.log('X small',name);bad++} await p.touchscreen.tap(bb.x+bb.width/2,bb.y+bb.height/2); await p.waitForTimeout(100); if(await p.$('#drawer:not([hidden])')){console.log('X did not close',name);bad++}}};
 await open('#helpb','3-rules'); await open('#plb','4-points'); await open('.strip[data-pl="1"]','5-rival-panel'); await open('.strip[data-pl="0"]','6-my-panel');
 await open('#menub','7-menu');
 // tap outside closes
 await p.tap('#menub'); await p.waitForTimeout(100); await p.touchscreen.tap(5,h-5); await p.waitForTimeout(100); if(await p.$('#drawer:not([hidden])')){console.log('outside tap did not close drawer');bad++}
 await p.tap('#mktb'); await p.waitForTimeout(200); await shot('8-market'); await audit('market');
 await p.touchscreen.tap(w/2,h*0.3); await p.waitForTimeout(150); if(await p.$eval('#sheet',e=>!e.hidden)){console.log('outside tap did not close sheet');bad++}
 await p.evaluate(()=>{VTUI.UI.sel=null;VTUI.UI.hints=true;VTUI.render()});
 // full game by touch
 let taps=0,undoTested=false,shots={},stuck=0,same=0,lastKey='';
 for(let i=0;i<4000;i++){
  const st=await p.evaluate(()=>({ph:G.phase,busy:VTUI.UI.busy}));
  if(st.ph!=='play')break;
  if(await p.evaluate(()=>{const t=VTUI.hintTarget();return !!(t&&t.closest('#sheet'))})) await p.waitForTimeout(320);
  const r=await p.evaluate(()=>{const t=VTUI.hintTarget(); if(!t)return null; if(t.closest('#hand,#sheet'))t.scrollIntoView({block:'nearest',inline:'center',behavior:'instant'}); const b=t.getBoundingClientRect(); return {x:b.x+b.width/2,y:b.y+b.height/2,tag:(t.id||t.className.baseVal||t.className||'').toString().slice(0,20)}});
  if(!r){await p.waitForTimeout(40); if(++stuck>60){console.log(n,'STUCK',JSON.stringify(await p.evaluate(()=>({pend:G.pend&&G.pend.h,sheet:VTUI.UI.sheet,busy:VTUI.UI.busy,side:VT.sideToAct(G),drop:G.drop&&G.drop.length}))));await shot('stuck');bad++;break} continue} stuck=0;
  if(r.x<0||r.y<0||r.x>w||r.y>h){console.log('offscreen',JSON.stringify(r));bad++;break}
  const key=await p.evaluate(()=>JSON.stringify([G.turn,G.log.length,G.pend&&G.pend.h,VTUI.UI.sheet,VTUI.UI.sel,VTUI.UI.selCol,VTUI.UI.selProv]));
  if(key===lastKey){ if(++same>30){console.log(n,'NO PROGRESS',key,JSON.stringify(r),'TOP:',await p.evaluate(([x,y])=>{const e=document.elementFromPoint(x,y);return e&&(e.id||e.className.baseVal||e.className)+' in '+(e.closest('[id]')||{}).id},[r.x,r.y]),await p.evaluate(()=>JSON.stringify({hint:VTUI.UI.hint,el:(()=>{const t=VTUI.hintTarget();return t&&(t.id||t.className.baseVal||t.className)})()})));await shot('noprogress');bad++;break} } else {same=0;lastKey=key}
  await p.touchscreen.tap(r.x,r.y); taps++; await p.waitForTimeout(25);
  if(!undoTested&&taps===3){undoTested=true; const before=await p.evaluate(()=>G.log.length+':'+G.pl[0].hand.length); if(await p.$('#undob:not([hidden])')){await p.tap('#undob');await p.waitForTimeout(80);} else {console.log('no undo button');bad++}}
  if(taps%25===0)console.log(n,'tap',taps,Date.now()%100000);
  if(taps===40&&!shots.a){shots.a=1;await shot('9-midgame')}
 }
 await p.waitForTimeout(500); await shot('99-result');
 const fin=await p.evaluate(()=>({ph:G.phase,sc:[0,1].map(i=>VT.score(G,i).total),turn:G.turn}));
 console.log(n,'taps',taps,'final',JSON.stringify(fin),'errs',errs.length,errs.slice(0,3)); if(errs.length||fin.ph==='play')bad++;
 await ctx.close();}
await b.close(); console.log(bad?'FAIL '+bad:'PASS'); process.exit(bad?1:0)})();
