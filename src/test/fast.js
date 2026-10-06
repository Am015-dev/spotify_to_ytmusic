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
  // 4) loading screen: the loaders yield one frame per 12 ms of performance.now(); while LD.on that clock runs 25× slower, so the same
  //    generators finish in ~25× fewer frames (yield points only; what gets built is identical). Outside loading it is the real clock.
  {const pn=performance.now.bind(performance);let real0=pn(),virt=real0,was=false;
   performance.now=()=>{const r=pn();if(LD.on){if(!was){was=true}virt+=(r-real0)/25}else{if(was)was=false;virt+=r-real0}real0=r;return virt}}
  if(!ownClock){const _f=frame;frame=now=>{FAST.f++;_f(now)}}   // external clock (tPlay/g25 __tick): only count frames

}
