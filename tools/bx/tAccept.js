// builder-A acceptance tests: each uses the checklist's 📍 GO spawn (window.__chk.go = goJump -> BX_test), real touch input, then the page's own check.
// node tools/bx/tAccept.js [ids...]   (default: all)  -> qa_bx/acc_<id>_*.png + qa_bx/acc.json
const L=require('./lib.js');const fs=require('fs');
const SECS={'bx-jump':22,'bx-offroad':22,'bx-cliff':14,'bx-water':24,'bx-bridge':55,'bx-split':16,'bx-elev':40};
(async()=>{const ids=process.argv.slice(2);const {b,p,E,cdp}=await L.launch();const all=ids.length?ids:await p.evaluate(()=>[...__bx.tests(),'bx-errors']);const R={};
 const wp=async(id,ch)=>{let W=await p.evaluate(c=>__bx.route(c),ch);const off=await p.evaluate(i=>__bx.off(i),id);
  if(off){for(const[x,z]of off){const a=W[W.length-1];const n=Math.ceil(Math.hypot(x-a[0],z-a[2])/4);for(let k=1;k<=n;k++){const X=a[0]+(x-a[0])*k/n,Z=a[2]+(z-a[2])*k/n;W.push([X,await p.evaluate(([X,Z])=>__bx.h(X,Z),[X,Z]),Z,'off'])}}}return W};
 for(const id of all){const t0=Date.now();if(id==='bx-errors')continue;
  await p.evaluate(i=>__chk.go('bxA/'+i),id);await L.sleep(1200);
  if(id==='bx-snap'){for(const [pc,how] of [['sf','place'],['up','place'],['st','ghost']]){await L.tapEl(p,cdp,`#bxPal [data-p="${pc}"]`);await L.sleep(300);
    if(how==='ghost'){const g=await p.evaluate(()=>__bx.ghostXY());await L.tap(cdp,g[0],g[1])}else await L.tapEl(p,cdp,'#bxPlace');await L.sleep(500)}
   await L.shot(p,`qa_bx/acc_${id}.png`)}
  else{const shots={air:s=>!s.v.g&&!s.v.boat&&s.v.air>.6,boat:s=>s.v.boat&&s.m.boat>1,resp:s=>s.m.resp>0&&s.m.backT!=null,low:s=>s.m.t>2.5,under:s=>s.v.on&&s.v.p[1]<3&&s.m.t>4,over:s=>s.v.on&&s.v.p[1]>8};
   const runs=id==='bx-split'?[[0],[1]]:[[]];for(const ch of runs){if(ch[0]===1){await L.tapEl(p,cdp,'#bxBack');await L.sleep(500);await L.tapEl(p,cdp,'#bxGo');await L.sleep(600)}
    const W=await wp(id,ch);await L.drive(p,cdp,{secs:SECS[id]||20,out:'qa_bx',tag:'acc_'+id+(ch[0]?'_b':''),shots,wpExtra:W,stopLaps:99,maxWall:300})}}
  R[id]=await p.evaluate(i=>__bx.check(i),id);R[id].why=await p.evaluate(()=>__bx.BX.m.respWhy.join(','));R[id].wall=((Date.now()-t0)/1000|0)+'s';console.log(id,JSON.stringify(R[id]))}
 R['bx-errors']={ok:E.length===0,msg:E.length+' console/page errors',err:E.slice(0,5)};console.log('bx-errors',JSON.stringify(R['bx-errors']));
 fs.writeFileSync('qa_bx/acc.json',JSON.stringify(R,null,1));await b.close()})();
