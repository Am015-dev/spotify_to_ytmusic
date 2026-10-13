// tTB.js — track builder check (track-1): phone 852×393 touch. node tools/tTB.js <url> <outdir> [step]
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs'),path=require('path');
const URL=process.argv[2]||'http://127.0.0.1:8766/local_dbg.html',OUT=process.argv[3]||'qa_tb',STEP=process.argv[4]||'ui';fs.mkdirSync(OUT,{recursive:true});
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const ctx=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:2,isMobile:true,hasTouch:true});const p=await ctx.newPage();p.setDefaultTimeout(300000);
 const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,300)));p.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text().slice(0,300))});
 if(STEP==='db')await p.addInitScript(()=>{const S={};const col=n=>({orderBy(){return this},limit(){return this},async get(){const docs=Object.entries(S).filter(([k])=>k.startsWith(n+'/')).map(([k,v])=>({id:k.split('/')[1],exists:true,data:()=>v}));return{docs,size:docs.length,empty:!docs.length}},doc:id=>({id,async set(v){S[n+'/'+id]=JSON.parse(JSON.stringify(v))}})});
  window.__dbMock=S;window.claude={use:async k=>k==='db'?{collection:col}:k==='user'?{id:async()=>'u_alex',isOwner:()=>true}:null}});
 await p.goto(URL);await p.waitForFunction(()=>window.__tb&&document.querySelector('#menu')&&!document.querySelector('#menu').hidden,null,{timeout:240000}).catch(()=>{});
 const shot=async n=>{await p.screenshot({path:path.join(OUT,n+'.jpg'),type:'jpeg',quality:80});console.log('SHOT',n)};
 const tap=async(x,y)=>{await p.touchscreen.tap(x,y);await p.waitForTimeout(150)};
 await shot('00_menu');
 await p.evaluate(()=>__tb.list());await p.waitForTimeout(300);await shot('01_list');
 if(STEP==='ui'){
  // new Frankfurt track by real taps on the map
  const nb=await p.$('text=＋ NEW FRANKFURT');await nb.tap();await p.waitForTimeout(300);await shot('02_empty');
  for(const[x,y]of[[300,150],[420,110],[560,160],[580,260],[450,330],[300,300],[250,220]])await tap(x,y);
  await shot('03_drawn');console.log(JSON.stringify(await p.evaluate(()=>({st:__tb.state(),lint:__tb.lint().rules.map(r=>r.id+(r.ok?'+':'-')+' '+r.val)}))));
 }
 if(STEP==='json'){const t=JSON.parse(fs.readFileSync(process.argv[5],'utf8'));await p.evaluate(t=>{__tb.open(t);__tb.fit()},t);await p.waitForTimeout(300);await shot('10_track');
  console.log(JSON.stringify(await p.evaluate(()=>{const L=__tb.lint();return{lap:L.lap,race:L.race,rules:L.rules.map(r=>r.id+(r.ok?' OK ':' XX ')+r.name+': '+r.val)}}),null,1))}
 if(STEP==='db'){const t=JSON.parse(fs.readFileSync(process.argv[5],'utf8'));t.id='tb_dbtest';t.name='DB test';await p.evaluate(t=>{__tb.open(t)},t);await p.waitForTimeout(300);
  const sv=await p.$('#tbBar button[title=Save]');await sv.tap();await p.waitForTimeout(800);await shot('20_saved');
  const r=await p.evaluate(()=>{const S=window.__dbMock;const k=Object.keys(S);const v=S[k[0]];const back=__tb.decode(v.json);const code=__tb.code(back),rt=__tb.decode(code);return{keys:k,fields:Object.keys(v),author:v.author,name:v.name,city:v.city,pts:back.pts.length,roundtrip:JSON.stringify(rt)===JSON.stringify(back),state:__tb.state()}});console.log('DB',JSON.stringify(r));
  await p.evaluate(()=>__tb.list());await p.waitForTimeout(300);await shot('21_list_db')}
 if(STEP==='gate'){const demo=JSON.parse(fs.readFileSync('docs/track_demo_twister.json','utf8')),copy=JSON.parse(fs.readFileSync('docs/track_twister_copy.json','utf8'));
  await p.evaluate(t=>{__tb.open(t);__tb.fit()},copy);await p.waitForTimeout(300);await shot('g1_copy_lint_red');
  await p.evaluate(t=>{__tb.open(t);__tb.fit()},demo);await p.waitForTimeout(300);await shot('g2_demo_builder');
  const pt=await p.evaluate(()=>{const c=document.querySelector('#tbC'),t=__tb.get();return null});
  // tap the 3rd control point (real touch) → height / delete bar
  const xy=await p.evaluate(()=>{const t=__tb.get(),q=t.pts[4];const ev=new Function('x','z','return [0,0]');return q});
  await p.evaluate(()=>{window.__tbxy=null});
  const sxy=await p.evaluate(()=>{const t=__tb.get(),q=t.pts[4];return window.__tbS?__tbS(q[0],q[1]):null});
  if(sxy){await tap(sxy[0],sxy[1]);await shot('g3_point_selected')}
  // Athens: copy the Akropolis circuit
  await p.evaluate(()=>__tb.list());await p.waitForTimeout(200);const ak=await p.$('#tbOv button:has-text("Akropolis")');if(ak){await ak.tap();await p.waitForTimeout(300);await shot('g4_athens_copy')}
  // TEST DRIVE the demo from MY TRACKS by real taps, then RESTART timing
  await p.evaluate(()=>__tb.list());await p.waitForTimeout(200);const rb=await p.$('#tbOv .trk button:has-text("RACE")');await rb.tap();
  await p.waitForFunction(()=>__mho.state==='countdown'||__mho.state==='race',null,{timeout:600000});await p.waitForTimeout(500);await shot('g5_test_start');
  const tr=await p.evaluate(()=>{const t0=performance.now();document.querySelector('#rstBtn').click();return{ms:Math.round(performance.now()-t0),st:__mho.state}});console.log('RETRY',JSON.stringify(tr));
  const tr2=await p.evaluate(()=>{const t0=performance.now();document.querySelector('#rstBtn').click();return{ms:Math.round(performance.now()-t0),st:__mho.state}});console.log('RETRY2',JSON.stringify(tr2))}
 console.log('ERRORS',JSON.stringify(errs));await b.close()})();
