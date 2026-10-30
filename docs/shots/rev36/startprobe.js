// startprobe.js <url> <city> <outdir> [noclr]: phone profile (iPhone UA, 852x393 touch, dpr 2, 6x CPU). For EVERY usable quest marker: car at the ring point
// nearest a street prop (as GO world/mstart), card START by DOM click, then samples what is drawn inside the car body at 0.3/1/2/4/7/10 game-s while the car stands.
// Also counts how many objects the persistent re-clear (FC.clrT) hides after the first second, and times one FC_clear() call. noclr = re-clear disabled (FC.clrT forced 0).
const {chromium}=require('playwright');const fs=require('fs');
const [U,CITY,OUT,NOCLR]=process.argv.slice(2);fs.mkdirSync(OUT,{recursive:true});
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const ctx=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:2,isMobile:true,hasTouch:true,userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'});
 const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e).slice(0,200)));p.setDefaultTimeout(900000);let nav=0;p.on('framenavigated',fr=>{if(fr===p.mainFrame()){nav++;console.log('NAV '+nav+' '+fr.url().slice(-40))}});p.on('console',m=>{if(/reload|memory|lost/i.test(m.text()))console.log('CONSOLE '+m.text().slice(0,160))});
 const E=(fn,a)=>p.evaluate(([src,a])=>{window.__dbg=1;return window.__oc.ev('('+src+')('+JSON.stringify(a)+')')},[fn.toString(),a===undefined?null:a]);
 await p.goto(U+'?test='+CITY);await p.waitForFunction(()=>window.__tq&&__tq.ready,null,{polling:500,timeout:240000});
 await p.waitForFunction(()=>window.RO===undefined||true,null);await p.waitForFunction(()=>{window.__dbg=1;return window.__oc.ev("(RO.marks||[]).some(q=>q.kind==='quest')")},null,{polling:500,timeout:240000});
 const ids=await E(()=>(RO.marks||[]).filter(q=>q.ev&&q.kind==='quest'&&qvUse(q)&&!markLocked(q)).map(q=>q.ev.id));
 console.log('quests '+ids.join(','));
 const cdp=await ctx.newCDPSession(p);await cdp.send('Emulation.setCPUThrottlingRate',{rate:+(process.env.THR||1)});
 await p.evaluate(()=>window.__chk.go('world/roof'));await p.waitForFunction(()=>!/…$/.test(window.__chk.said()||''),null,{timeout:300000,polling:1000});
 const rows=[];
 for(const id of ids){console.log('quest '+id);
  const r=await E(([id,noclr])=>{const m=RO.marks.find(q=>q.ev&&q.ev.id===id);try{chAbort()}catch(e){}RO.card=null;
    let best=null,bd=1e9;for(const l of HUB.pgrid.values())for(const p of l){if(!p.im||p.alive===false)continue;const d=Math.hypot(p.x-m.x,p.z-m.z);if(d<bd){bd=d;best=p}}
    const a=best&&bd<30?Math.atan2(best.x-m.x,best.z-m.z):m.h||0,rr=Math.min(8,Math.max(0,bd-1));RO.x=m.x+Math.sin(a)*rr;RO.z=m.z+Math.cos(a)*rr;RO.y=groundY(RO.x,RO.z);RO.h=m.h||0;RO.v=0;RO.cool=0;
    const body=()=>{const fx=Math.sin(RO.h),fz=Math.cos(RO.h),y=RO.y+.8;return[-1.6,0,1.6].map(a=>new THREE.Vector3(RO.x+fx*a,y,RO.z+fz*a))};
    const before=WRG_inside(body(),12,WRG_carMesh);roamOpen(m);const go=document.getElementById('rcGo');if(go&&!go.disabled)go.click();
    const t0=performance.now();FC_clear();const clrMs=performance.now()-t0;
    window.__SP={id,before,clr0:FC.clr||0,clrMs:+clrMs.toFixed(1),started:!!RO.ch,samples:[],T0:T,noclr};return window.__SP},[id,!!NOCLR]);
  const marks=[.3,1,2,4,7,10];let shot=false;
  for(const s of marks){await p.waitForFunction(([s])=>T-__SP.T0>=s,[s],{timeout:300000,polling:100}).catch(()=>{});
   const smp=await E(()=>{if(__SP.noclr)FC.clrT=0;RO.v=0;const fx=Math.sin(RO.h),fz=Math.cos(RO.h),y=RO.y+.8;const h=WRG_inside([-1.6,0,1.6].map(a=>new THREE.Vector3(RO.x+fx*a,y,RO.z+fz*a)),12,WRG_carMesh);
     const r={t:+(T-__SP.T0).toFixed(1),inside:h.slice(0,3),clr:(FC.clr||0)-__SP.clr0,clrT:+(FC.clrT||0).toFixed(2),fd:FC.fd.size};__SP.samples.push(r);return r});
   if(!shot&&s>=1){await p.screenshot({path:OUT+'/start_'+CITY+'_'+id+(NOCLR?'_noclr':'')+'.jpg',type:'jpeg',quality:70});shot=true}}
  const r2=await E(()=>{const s=__SP;try{chAbort()}catch(e){}return s});rows.push(r2);
  console.log((r2.samples.some(q=>q.inside.length)?'FAIL ':'PASS ')+CITY+' '+id+' started='+r2.started+' before='+r2.before.length+' clrMs='+r2.clrMs+' late-clr='+r2.samples.map(q=>q.clr).join('/')+' inside@'+r2.samples.filter(q=>q.inside.length).map(q=>q.t+':'+q.inside.join('+')).join(' | '));
 }
 fs.writeFileSync(OUT+'/start_'+CITY+(NOCLR?'_noclr':'')+'.json',JSON.stringify({rows,errs},null,1));console.log('errors '+errs.length);await b.close()})();
