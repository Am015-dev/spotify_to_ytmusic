// ===== FAST · test-only fast mode, active only with ?fast=1 in the URL. Never in deploy builds: tools/build.sh adds src/test/*.js
// (before 99_api.js) only with --local. Simulation code is untouched; only drawing is cheaper, and without an external test clock
// the page steps itself frame by frame (rAF timestamp += 1000/60 per frame, back to back, no wall-clock dt).
//   ?fast=1        426×196 drawing buffer, camera far ≤ 450 m while drawing, no shadow-map updates, no bloom, particles hidden while drawing
//   &fastr=N       draw every N-th frame only (default 6 = 10 pictures per game second with the own clock; 1 under a test clock,
//                  which already skips drawing except for screenshots; __fastDraw() forces one picture)
//   &fastclock=0   keep the browser's rAF (default: own frame clock unless a test already installed window.__tick)
const FAST=/[?&]fast=1\b/.test(location.search)?(()=>{const q=new URLSearchParams(location.search);return{W:426,H:196,far:450,every:Math.max(1,+(q.get('fastr')||(window.__tick?1:6))),clock:q.get('fastclock')!=='0',f:0,draws:0,force:0}})():null;
if(FAST){
  window.__fast=FAST;
  // 1) low resolution: the drawing buffer is 426 px wide whatever the window (CSS stretches it)
  const _rs=resize;resize=function(){_rs();const p=Math.min(FAST.W/innerWidth,FAST.H/innerHeight);renderer.setPixelRatio(p);renderer.setSize(innerWidth,innerHeight,false);composer.setPixelRatio(p);composer.setSize(innerWidth,innerHeight);bloom.resolution.set(innerWidth*p/2,innerHeight*p/2)};
  addEventListener('resize',()=>resize());resize();
  // 2) cheap pictures: every N-th frame, short far plane, no shadow re-render, no bloom, no particles. Everything is restored right after drawing.
  const _cr=composer.render.bind(composer);
  const fastRender=(...a)=>{const far=camera.far,sh=renderer.shadowMap.autoUpdate,be=bloom.enabled,hid=[];
    try{if(far>FAST.far){camera.far=FAST.far;camera.updateProjectionMatrix()}renderer.shadowMap.autoUpdate=false;bloom.enabled=false;
      for(const P of[SPARK,FIRE,SMOKE,FIREB,GLOWP,WATER])if(P&&P.pts&&P.pts.visible){P.pts.visible=false;hid.push(P.pts)}
      FAST.draws++;return _cr(...a)}
    finally{for(const o of hid)o.visible=true;renderer.shadowMap.autoUpdate=sh;bloom.enabled=be;if(camera.far!==far){camera.far=far;camera.updateProjectionMatrix()}}};
  composer.render=(...a)=>{if(FAST.force||(FAST.f%FAST.every)===0){FAST.force=0;return fastRender(...a)}};
  window.__fastDraw=()=>{FAST.force=1;composer.render()};
  // 3) frame clock: frames run back to back, each with now += 1000/60 (the game's dt is exactly 1/60 s, as on a 60 Hz phone)
  const ownClock=FAST.clock&&!window.__tick;
  if(ownClock){const q=[];let t=performance.now();const mc=new MessageChannel();let pend=false;
    const run=()=>{pend=false;const c=q.splice(0);t+=1000/60;FAST.f++;for(const f of c){try{f(t)}catch(e){setTimeout(()=>{throw e})}}if(q.length)kick()};
    const kick=()=>{if(!pend){pend=true;(FAST.f%4===3?setTimeout(run,0):mc.port2.postMessage(0))}};mc.port1.onmessage=run;   // a macrotask every 4th frame lets input/timers in
    window.requestAnimationFrame=cb=>{q.push(cb);kick();return q.length};window.cancelAnimationFrame=()=>{}}
  // 4) deterministic game time: after the first frame, performance.now(), Date.now(), setTimeout/setInterval follow the frame clock
  //    (the rAF timestamp, +1000/60 per frame), and Math.random is a seeded PRNG reset when free roam is entered. Results then
  //    depend only on the inputs per frame, not on machine speed or CPU throttle. Time-budget loops (≤ 12 ms slices) see frozen
  //    time within a frame and simply finish their queue (a phone with unlimited CPU).
  {const pn=performance.now.bind(performance),dn=Date.now,rST=setTimeout,rCT=clearTimeout,rSI=setInterval,rCI=clearInterval;
   let VT=null,d0=0,tid=1e7;const T=new Map();FAST.vt=()=>VT;
   performance.now=()=>VT==null?pn():VT;Date.now=()=>VT==null?dn():d0+VT;
   const add=(fn,ms,args,rep)=>{const id=++tid;T.set(id,{fn,args,due:VT+Math.max(0,+ms||0),ms:Math.max(1,+ms||0),rep});return id};
   window.setTimeout=(fn,ms,...a)=>VT==null||typeof fn!=='function'?rST(fn,ms,...a):add(fn,ms,a,false);
   window.setInterval=(fn,ms,...a)=>VT==null||typeof fn!=='function'?rSI(fn,ms,...a):add(fn,ms,a,true);
   window.clearTimeout=id=>{if(!T.delete(id))rCT(id)};window.clearInterval=id=>{if(!T.delete(id))rCI(id)};
   const fire=()=>{for(let k=0;k<1000;k++){let best=null,bi=0;for(const[i,t]of T)if(t.due<=VT&&(!best||t.due<best.due||t.due===best.due&&i<bi)){best=t;bi=i}
      if(!best)break;if(best.rep)best.due+=best.ms;else T.delete(bi);try{best.fn(...best.args)}catch(e){rST(()=>{throw e})}}};
   let seed=1;const rnd=()=>{seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
   const reseed=k=>{seed=k|0};reseed(20261006);Math.random=rnd;FAST.reseed=reseed;
   const _er=enterRoam;enterRoam=(...a)=>{reseed(20261006);return _er(...a)};
   const _f=frame;frame=now=>{if(VT==null){d0=dn()-now}VT=now;if(!ownClock)FAST.f++;fire();_f(now)}}

}
