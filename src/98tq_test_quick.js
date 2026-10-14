// ===== TQ: FAST TEST START (int-2, 2026-10-13). Active only with ?test=fra|ath (the prelude in 10_core.js sets slot 9 + the boot-to-roam flag).
// Minimal graphics (low quality, no shadow map, 1500 m far plane), story/cutscene/tutorial popups skipped, then &car=<ride id>, &at=x,z and
// &go=<ver/id> (a checklist GO) are applied. window.__tq.ready turns true once you can drive. The checklist GO jumps to the other city through here.
if(TQ){
 // &q=high|med (gfx-1): test at a real quality tier (shadows allowed); default stays low
 TQ.q=new URLSearchParams(location.search).get('q');if(!/^(high|med)$/.test(TQ.q||''))TQ.q=null;
 SET.q=TQ.q||'low';LK.userQ=SET.q;LK.drop=TQ.q?0:1;try{applyQuality()}catch(e){}
 // settings stay the player's: nothing in test mode writes mho_set
 {const s0=store.set;store.set=function(k,v){if(k==='mho_set')return;return s0.apply(this,arguments)}}
 LK_shadow=(f=>function(on){return f.call(this,TQ.q?on:false)})(LK_shadow);
 // boot speed: no shader/GPU warm-up passes (they only smooth the first seconds on a phone) and no picture while the loader is up
 try{menuTrack=ROAMCFG.track||'grand'}catch(e){}  // the menu backdrop builds the same track free roam needs: built once, not twice
 ldPrewarm=async function(){};SM_upload=async function(){};P2_warm=function(){};warmTextures=function(){};
 {const r0=composer.render.bind(composer);composer.render=function(){let st='';try{st=state}catch(e){}if(st==='loading'||LD.busy||TQ.nodraw&&!TQ.draw)return;return r0.apply(this,arguments)}}
 // &draw=0: no NPC portraits (the first one, Hilde's tutorial face, cost 2.6 s of canvas emoji/font set-up in headless Chromium; nobody sees it)
 if(TQ.nodraw){try{avatar=function(){return'data:,'}}catch(e){}}
 if(TQ.nodraw){const rr=renderer.render.bind(renderer);renderer.render=function(){if(!TQ.draw)return;return rr.apply(this,arguments)}}
 // &draw=0 (headless tools): no pictures at all except __tq.shot() (software GL needs ~10 s for the first frame's shaders)
 const TQS={ready:false,drv:false,t0:performance.now(),tReady:0,log:[],st:[]};ldSet=(f=>function(a,lab){try{const L=TQS.st,l=lab||'';if(!L.length||L[L.length-1][1]!==l)L.push([Math.round(performance.now()-TQS.t0),l])}catch(e){}return f.apply(this,arguments)})(ldSet);
 const skip=()=>{try{if(window.__m1&&__m1.cs&&__m1.cs()&&__m1.skip)__m1.skip()}catch(e){}
  for(const s of['#storyGo','#rcGo','.m1go','#tutSkip','#m1Cs']){const e=document.querySelector(s);if(e&&!e.hidden&&e.offsetWidth)try{e.click()}catch(er){}}};
 const ride=()=>new Promise(res=>{if(!TQ.car)return res();let S=null;try{S=GAR_set(TQ.car)}catch(e){}if(!S||S.id!==TQ.car){TQS.log.push('no ride '+TQ.car);return res()}
  try{gbOpen();GAR_select(TQ.car)}catch(e){TQS.log.push('ride: '+e);return res()}
  let n=0;const w=()=>{if((typeof LDL==='undefined'||!LDL.wait.size)||++n>150){try{gbClose(true)}catch(e){}setTimeout(res,300)}else setTimeout(w,200)};setTimeout(w,300)});
 const spot=()=>{if(!TQ.at)return;const[x,z]=TQ.at,q=rfSnap(x,z,120);if(!roamWarp(q?q[0]:x,q?q[1]:z,q&&q[2]!=null?q[2]:RO.h))TQS.log.push('at: warp refused')};
 const iv=setInterval(()=>{skip();if(TQS.busy||TQS.drv)return;let st='';try{st=state}catch(e){}if(st!=='roam'||!RO.on||!RO.built||LD.busy)return;TQS.busy=1;
  ride().then(()=>{const w2=()=>{let s2='';try{s2=state}catch(e){}if(s2!=='roam'||!RO.on||LD.busy)return setTimeout(w2,200);spot();skip();RO.v=0;
   TQS.drv=true;TQS.tReady=Math.round(performance.now()-TQS.t0);TQS.home=[RO.x,RO.z,RO.h];  // drv = the player can drive; ready also waits for the lazy code chunks (src/LAZY, 10z_lazy.js: __chk etc.)
   XC_go().then(()=>{TQS.ready=true;if(TQ.go)setTimeout(()=>{try{TQS.goSaid=window.__chk&&__chk.go(TQ.go)}catch(e){TQS.log.push('go: '+e)}},300)})};w2()})},250);
 setTimeout(()=>clearInterval(iv),120000);
 // warm page (dev-5): back to a clean roam at the boot spot WITHOUT a reload (~0.2 s instead of a 20-40 s city boot); the GO runner calls it between items
 const reset=()=>{const t=performance.now(),log=[];const T=(n,f)=>{try{f()}catch(e){log.push(n+': '+String(e).slice(0,60))}};
  T('og',()=>{if(typeof OG!=='undefined'&&OG.ev)OG_end(null,1)});T('foot',()=>OF_reset());T('gar',()=>{const g=document.getElementById('gbx');if(g&&!g.hidden)gbClose(false)});
  T('card',()=>{RO.card=null;RO.cardPin=0;RO.wwTest=0;const c=document.getElementById('roamCard');if(c)c.hidden=true});T('map',()=>{if(RO.mapOpen&&typeof roamMap==='function')roamMap(false);RO.mapOpen=false});
  T('ch',()=>{if(RO.ch)chAbort()});T('sp',()=>{if(RO.sp)sprintEnd()});T('wk',()=>{RO.wk=null});skip();
  let st='';try{st=state}catch(e){}if(st!=='roam')T('roam',()=>enterRoam());
  T('home',()=>{const H=TQS.home;if(H){roamWarp(H[0],H[1],H[2])}RO.v=0;RO.vy=0;RO.frozen=false});
  return{ms:Math.round(performance.now()-t),state:(()=>{try{return state}catch(e){return'?'}})(),log}};
 window.__tq=Object.assign(TQS,{o:TQ,skip,reset,draw:()=>{TQ.draw=1;try{composer.render()}finally{TQ.draw=0}}});
}
// test URL for a city (+ ride / spot / checklist GO): the checklist GO uses this to reach the other city without the story flight
function TQ_url(c,o={}){const q=new URLSearchParams({test:c});for(const k of['car','at','go'])if(o[k])q.set(k,o[k]);return location.pathname+'?'+q}
