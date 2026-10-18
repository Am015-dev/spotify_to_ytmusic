/* ---------- Phone full screen, portrait and landscape (owner, 18 Oct 2026). Flag RET.fs (?fs=0 = off).
   Touch devices: the first tap goes full screen (browsers need a user gesture), a tap after a rotation or a system exit goes back in (unless the player turned it off
   with the MENU > FULL SCREEN button, which is remembered in mnr_fs). iPhone Safari has no page full screen: there the button explains Add to Home Screen. ---------- */
RET.fs=RET.fs!==false&&!/[?&]fs=0\b/.test(location.search);
if(RET.fs){(()=>{
  const de=document.documentElement,rq=de.requestFullscreen||de.webkitRequestFullscreen,ex=document.exitFullscreen||document.webkitExitFullscreen;
  const touch=matchMedia('(pointer:coarse)').matches||navigator.maxTouchPoints>1,standalone=matchMedia('(display-mode: fullscreen)').matches||matchMedia('(display-mode: standalone)').matches||navigator.standalone;
  const isFS=()=>!!(document.fullscreenElement||document.webkitFullscreenElement)||matchMedia('(display-mode: fullscreen)').matches;
  let pref;try{pref=localStorage.getItem('mnr_fs');}catch(e){}
  let off=pref==='0',lastTry=0;
  const enter=()=>{if(!rq||isFS()||off)return;const n=Date.now();if(n-lastTry<400)return;lastTry=n;try{const p=rq.call(de,{navigationUI:'hide'});if(p&&p.catch)p.catch(()=>{});}catch(e){}};
  const leave=()=>{if(ex&&isFS()){try{const p=ex.call(document);if(p&&p.catch)p.catch(()=>{});}catch(e){}}};
  const save=()=>{try{localStorage.setItem('mnr_fs',off?'0':'1');}catch(e){}};
  window.FSX={on:()=>!off,isFS,supported:!!rq,standalone:!!standalone,enter,leave,set(v){off=!v;save();if(v)enter();else leave();paint();}};
  if(touch){
    const go=()=>enter();
    addEventListener('pointerup',go,{capture:true,passive:true});addEventListener('touchend',go,{capture:true,passive:true});
    addEventListener('orientationchange',()=>{lastTry=0;});                       // the next tap re-enters if the rotation dropped full screen
  }
  document.addEventListener('fullscreenchange',()=>{paint();try{window.dispatchEvent(new Event('resize'));}catch(e){}});
  document.addEventListener('webkitfullscreenchange',()=>{paint();try{window.dispatchEvent(new Event('resize'));}catch(e){}});
  let fsEl=null;
  function paint(){if(!fsEl)return;const on=isFS();fsEl.textContent=!rq&&!standalone?'FULL SCREEN: ADD TO HOME':on?'FULL SCREEN: ON':'FULL SCREEN: OFF';fsEl.setAttribute('aria-pressed',on?'true':'false');}
  setTimeout(()=>{const mg=document.querySelector('#mnMore .mg');if(!mg||fsEl)return;
    fsEl=document.createElement('button');fsEl.type='button';fsEl.className='go dim wide';fsEl.id='fsBtn';
    fsEl.addEventListener('click',()=>{if(!rq){alert('On iPhone: tap Share, then Add to Home Screen, then open Nightrun from the icon for full screen.');return;}FSX.set(!(isFS()));});
    mg.appendChild(fsEl);paint();},0);
})();}
