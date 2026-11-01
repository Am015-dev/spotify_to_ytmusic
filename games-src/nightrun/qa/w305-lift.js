// W305: proves CDP touchEnd ends the LISTED points (list the tap finger, not the steering finger). Output: touch events the page sees around a dash tap.
const L=require('./lib.js');
(async()=>{const b=await L.boot();
 for(const mode of ['touchEnd-tapfinger']){
  const ctx=await b.br.newContext({viewport:{width:390,height:763},hasTouch:true,isMobile:true,userAgent:L.UA});const p=await ctx.newPage();
  await p.addInitScript(()=>{localStorage.setItem('mnr_tipdone','true');localStorage.setItem('mnr_fscard','99');window.__ev=[];for(const t of['touchstart','touchmove','touchend','touchcancel'])addEventListener(t,e=>window.__ev.push([t,[...e.touches].map(x=>x.identifier).join(),[...e.changedTouches].map(x=>x.identifier).join()]),true);});
  await p.goto(b.base+'?nomusic=1');await p.waitForFunction(()=>window.__mnr);await L.sleep(500);
  await p.locator('#focFlight').click().catch(()=>{});await L.sleep(1500);
  const c=await ctx.newCDPSession(p);const send=(type,pts)=>c.send('Input.dispatchTouchEvent',{type,touchPoints:pts});
  const f=[{x:195,y:550,id:1}];await send('touchStart',f);await send('touchMove',[{x:195,y:520,id:1}]);
  const bb=await p.locator('#bDash').boundingBox();const tx=bb.x+bb.width/2,ty=bb.y+bb.height/2;
  const f2=[{x:195,y:520,id:1}];
  await send('touchStart',[...f2,{x:tx,y:ty,id:7}]);
  await send('touchEnd',[{x:tx,y:ty,id:7}]);
  await send('touchMove',[{x:195,y:490,id:1}]);await L.sleep(300);
  const r=await p.evaluate(()=>window.__ev);console.log(mode);r.forEach(e=>console.log(' ',e.join(' | ')));
  await ctx.close();}
 await b.close();process.exit(0)})();
