// trk-4 OPEN TRACKS acceptance run: every 'trk4' checklist item via its 📍 GO (window.__chk.go -> BX_test), then the page's own check.
// Buttons (bx-o-btn, bx-o-ui) are checked in landscape 852x393 AND portrait 393x852, then pressed with REAL touch (CDP): BOOST, PAUSE/RESUME, LAND/TRACK tabs.
//   node tools/bx/tOpen.js <url of the built page, e.g. http://localhost:8811/index.html> [ids...]      (prints PASS/FAIL lines + a JSON summary)
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const BASE=process.argv[2],IDS=process.argv.slice(3),sleep=ms=>new Promise(r=>setTimeout(r,ms));
const ALL=['bx-o-width','bx-o-routes','bx-o-open','bx-o-jumps','bx-o-ai','bx-o-btn','bx-o-ui'];
(async()=>{const T0=Date.now(),b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const c=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:1,isMobile:true,hasTouch:true});const p=await c.newPage();p.setDefaultTimeout(180000);const E=[],R={};
 p.on('pageerror',e=>E.push(String(e).slice(0,200)));p.on('console',m=>{if(m.type()==='error')E.push('console: '+m.text().slice(0,200))});
 await p.goto(BASE+(BASE.includes('?')?'&':'?')+'test=fra&draw=0');await p.waitForFunction(()=>window.__tq&&__tq.ready&&window.__chk&&window.__bx,null,{polling:250,timeout:150000});
 console.log('BOOT',((Date.now()-T0)/1000).toFixed(1),'s');const cdp=await c.newCDPSession(p);
 const tap=async sel=>{const bb=await p.locator(sel).first().boundingBox();if(!bb)return false;const x=bb.x+bb.width/2,y=bb.y+bb.height/2;
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y,id:1}]});await sleep(90);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await sleep(250);return true};
 const chk=id=>p.evaluate(i=>__bx.check(i.split('/').pop()),id),go=id=>p.evaluate(i=>__chk.go(i.includes('/')?i:'trk4/'+i),id);
 const line=(id,r)=>{R[id]=r;console.log((r.ok?'PASS ':'FAIL ')+id+' :: '+r.msg)};
 for(const id of IDS.length?IDS:ALL){const t=Date.now();try{await go(id);await sleep(1200);if(id.includes('/'))await p.waitForFunction(()=>!__bx.BX.m||__bx.BX.mode!=='drive'||__bx.BX.m.t>=4,null,{polling:300,timeout:150000});
  if(id==='bx-o-btn'||id==='bx-o-ui'){const rr=[];for(const vp of[[852,393],[393,852]]){await p.setViewportSize({width:vp[0],height:vp[1]});await sleep(700);const r=await chk(id);rr.push(r)}
   const acts=[];
   if(id==='bx-o-btn'){await p.evaluate(()=>{__bx.BX.v.boostE=1});const b0=await p.evaluate(()=>__bx.BX.v.boost);await tap('#bxBo');const b1=await p.evaluate(()=>__bx.BX.v.boost);acts.push(['BOOST tap',b1>0&&b1>b0,`boost ${b0.toFixed(1)} -> ${b1.toFixed(1)} s`]);
    await tap('#bxPz');const ps=await p.evaluate(()=>({h:!!__bx.BX.hold,c:!!document.querySelector('#bxPause:not([hidden])')}));acts.push(['PAUSE tap',ps.h&&ps.c,`paused ${ps.h}, card ${ps.c}`]);
    await tap('#bxPzGo');const rs=await p.evaluate(()=>!__bx.BX.hold&&!document.querySelector('#bxPause:not([hidden])'));acts.push(['RESUME tap',rs,`resumed ${rs}`])}
   else{await tap('#bxT2');const t2=await p.evaluate(()=>__bx.BX.tab);await tap('#bxT1');const t1=await p.evaluate(()=>__bx.BX.tab);acts.push(['LAND/TRACK taps',t2==='land'&&t1==='track',`tabs ${t2}, ${t1}`])}
   await p.setViewportSize({width:852,height:393});await sleep(400);
   line(id,{ok:rr.every(r=>r.ok)&&acts.every(a=>a[1]),msg:'landscape: '+rr[0].msg+' | portrait: '+rr[1].msg+' | '+acts.map(a=>(a[1]?'✔ ':'✘ ')+a[2]).join(', ')})}
  else line(id,await chk(id))}catch(e){line(id,{ok:false,msg:'ERROR '+String(e).slice(0,200)})}
  if(process.env.V)console.log('  ',id,((Date.now()-t)/1000).toFixed(1),'s')}
 const n=Object.values(R).filter(r=>r.ok).length;console.log(JSON.stringify({pass:n,of:Object.keys(R).length,errors:E.length,err:E.slice(0,4),secs:Math.round((Date.now()-T0)/1000)}));await b.close()})();
