// tSmashFrame (smash-look-r22e22): node tools/tSmashFrame.js <base url> [extra query]  6x CPU (RATE=), ?cl=smash, N (default 6) scripted 35 km/h prop smashes at the core spawn, 1.5 s apart.
// Per smash: the longest rAF interval in the 3 frames after the hit minus the median of the 40 frames before it (= the smash-frame extra), and new shader programs. Fresh page per RUNS (default 1).
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const [BASE,Q]=process.argv.slice(2);const N=+(process.env.N||6),RUNS=+(process.env.RUNS||1);
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 for(let run=0;run<RUNS;run++){const c=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:1,isMobile:true,hasTouch:true});const p=await c.newPage();p.setDefaultTimeout(600000);p.on('pageerror',e=>console.log('ERR',String(e).slice(0,200)));
  await p.goto(BASE+'?test=fra&cl=smash'+(Q?'&'+Q:''));await p.waitForFunction(()=>window.__chk&&window.__tq&&__tq.ready,null,{timeout:600000});await p.waitForTimeout(3000);
  await p.evaluate(()=>__tk.q(`(()=>{const q=rfSnap(CL.spawn[0],CL.spawn[1],120);RO.x=q[0];RO.z=q[1];RO.h=RO.vh=Math.PI/2;RO.y=groundAt(RO.x,RO.z,99);camSnap=true;OF_reset&&OF_reset();RO.turbo=0;
   window.__hit=()=>{const ts=['bin','stall','tree','bench','pot'].filter(t=>HUB.ptypes[t]&&HUB.props.some(x=>x.t===t&&x.im&&x.i!=null&&!x._u));const t=ts[(window.__n=(window.__n||0)+1)%ts.length],d=HUB.ptypes[t],pp=HUB.props.find(x=>x.t===t&&x.im&&x.i!=null&&!x._u);pp._u=1;
    const D=Math.min(OB_HL+d.r*.6,d.r+2);pp.x=RO.x+Math.sin(RO.h)*D;pp.z=RO.z+Math.cos(RO.h)*D;pp.y=RO.y;pp.alive=true;pp.sm2T=0;const k=Math.floor(pp.x/16)*10000+Math.floor(pp.z/16),L=HUB.pgrid.get(k)||(HUB.pgrid.set(k,[]),HUB.pgrid.get(k));if(!L.includes(pp))L.push(pp);
    RO.v=35/3.6;const s0=HUB.smashed;smashCheck(1/60);return HUB.smashed>s0}})()`));
  const cd=await c.newCDPSession(p);await cd.send('Emulation.setCPUThrottlingRate',{rate:+(process.env.RATE||6)});await p.waitForTimeout(4000);
  const r=await p.evaluate(N=>new Promise(res=>{const iv=[],out=[];let last=0,k=0,next=60,hitAt=-1,pr0=0,ok=false,hms=0;
   const f=t=>{if(last)iv.push(t-last);last=t;const i=iv.length;
    if(hitAt<0&&i>=next){pr0=__tk.q('renderer.info.programs.length');const h0=performance.now();ok=__hit();hms=performance.now()-h0;hitAt=i}
    else if(hitAt>=0&&i>=hitAt+3){const pre=iv.slice(hitAt-40,hitAt).sort((a,b)=>a-b),med=pre[pre.length>>1],mx=Math.max(...iv.slice(hitAt,hitAt+3));
     out.push({ok,hms:Math.round(hms),ms:Math.round(mx),med:Math.round(med),extra:Math.round(mx-med),prog:__tk.q('renderer.info.programs.length')-pr0});hitAt=-1;k++;next=i+Math.round(1500/Math.max(16,med))}
    if(k<N)requestAnimationFrame(f);else res(out)};requestAnimationFrame(f)}),N);
  const ex=r.map(x=>x.extra);console.log('run',run,Q||'base','extra ms',JSON.stringify(ex),'first',ex[0],'max',Math.max(...ex),'hit JS ms',JSON.stringify(r.map(x=>x.hms)),'progs',JSON.stringify(r.map(x=>x.prog)),'smashed',r.filter(x=>x.ok).length+'/'+r.length,'median frame',r[0].med);await c.close()}
 await b.close()})();
