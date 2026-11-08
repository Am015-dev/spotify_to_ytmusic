// Drag-to-place proof: a Quick game where every one of your turns is played by DRAGGING a hand tile onto the bow square.
//   node drag-test.js [phone|pc]   phone = real touch events (CDP), pc = mouse. Exit 1 on failure.
const PW=(()=>{try{return require('playwright')}catch(e){return require('/opt/node-tools/node_modules/playwright')}})();
const gx=require('../../scripts/gx-serve.js'),path=require('path');
const PHN=(process.argv[2]||'phone')==='phone';
(async()=>{const url=await gx.url('tidewake',{file:path.join(__dirname,'tidewake.html'),query:'?2d'});
const b=await PW.chromium.launch();const c=await b.newContext(PHN?{viewport:{width:390,height:844},hasTouch:true,isMobile:true}:{viewport:{width:1440,height:900}});
const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto(url);await p.waitForTimeout(1200);await p.evaluate(()=>{localStorage.setItem('tw_offered','1');localStorage.setItem('tw_played','1')});await p.reload();await p.waitForTimeout(1200);
await p.evaluate(()=>{AIDELAY=30;try{UI.speed=8;TWKit.setSpeed(8)}catch(e){}});
const cdp=PHN?await c.newCDPSession(p):null;
const drag=async(a,z)=>{const N=10;if(PHN){await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:a.x,y:a.y}]});for(let k=1;k<=N;k++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:a.x+(z.x-a.x)*k/N,y:a.y+(z.y-a.y)*k/N}]});await p.waitForTimeout(16)}await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]})}
  else{await p.mouse.move(a.x,a.y);await p.mouse.down();for(let k=1;k<=N;k++){await p.mouse.move(a.x+(z.x-a.x)*k/N,a.y+(z.y-a.y)*k/N);await p.waitForTimeout(16)}await p.mouse.up()}};
const tapEl=async sel=>{const l=p.locator(sel+':visible').first();if(!await l.count())return false;const bb=await l.boundingBox();if(PHN)await p.touchscreen.tap(bb.x+bb.width/2,bb.y+bb.height/2);else await p.mouse.click(bb.x+bb.width/2,bb.y+bb.height/2);return true};
await tapEl('#quickgo');await p.waitForTimeout(800);
let drags=0,fails=0,glow=0;const t0=Date.now();
while(Date.now()-t0<180000){
  const st=await p.evaluate(()=>({over:!!G.over,me:sideToAct(),busy:UI.busy,ph:G.phase,q:!!G.q,alive:G.ships[0].alive}));
  if(st.over||!st.alive){console.log("end",JSON.stringify(st));break}
  for(const s of ['[data-a=sunkok]','[data-ph=dismiss]','[data-a=q]','.gxh-btn:has-text("Got it")'])if(await tapEl(s))await p.waitForTimeout(200);
  if(st.busy||st.me!==0){await p.waitForTimeout(250);continue}
  if(st.ph==='setup'){await tapEl('[data-a=startmark]');await p.waitForTimeout(400);continue}
  // pick a tile and rotation that is legal, by tapping (tap = select/turn), then drag that tile
  const pick=await p.evaluate(()=>{const d=0;const mv=(UI.moves||[]).filter(m=>m.a==='place');if(!mv.length)return null;const m=mv[0];UI.sel.t=m.t;UI.sel.r=m.r;UI.sel.s=m.s;UI.rots=UI.rots||[];UI.rots[m.t]=m.r;render();return m});
  if(!pick){await p.waitForTimeout(300);continue}
  await p.waitForTimeout(150);
  const tile=await p.locator(`[data-a=card][data-t="${pick.t}"]:visible`).first().boundingBox();const T=await p.evaluate(()=>drgTarget());
  if(!tile||!T){fails++;console.log('no tile/target');break}
  const n0=await p.evaluate(()=>G.log.length);
  await drag({x:tile.x+tile.width/2,y:tile.y+tile.height/2},{x:T.x,y:T.y});drags++;
  await p.waitForTimeout(300);const n1=await p.evaluate(()=>({n:G.log.length,busy:UI.busy,me:sideToAct()}));
  if(n1.n===n0&&!n1.busy&&n1.me===0){fails++;console.log('drag did not place',JSON.stringify(pick));if(fails>2)break}
  if(drags===1)await p.screenshot({path:path.join(__dirname,'shots','drag-after.png')});
}
console.log(PHN?'phone':'pc','drags',drags,'fails',fails,'errors',errs.length,errs.slice(0,2));await b.close();process.exit(fails||errs.length||!drags?1:0)})();
