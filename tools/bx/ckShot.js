// screenshot of the in-game checklist with the builder-A items (real taps: ⚙ drawer -> ✔ CHECKLIST)
const L=require('./lib.js');(async()=>{const {b,p,E,cdp}=await L.launch();await L.tapEl(p,cdp,'#tuG');await L.sleep(800);
 const c=p.locator('button',{hasText:'CHECKLIST'}).first();const bb=await c.boundingBox();await L.tap(cdp,bb.x+bb.width/2,bb.y+bb.height/2);await L.sleep(1200);
 await p.screenshot({path:'qa_bx/checklist.png'});console.log(E.join('\n')||'NO_ERRORS');await b.close()})();
