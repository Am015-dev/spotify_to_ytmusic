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

  /* iPhone and iPad browsers have no page full screen: the only way is the installed icon (Add to Home Screen opens the game without the browser bars) */
  const ios=/iPhone|iPad|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  let cardEl=null,asked=0;try{asked=+localStorage.getItem('mnr_fscard')||0;}catch(e){}
  const closeCard=(never)=>{if(cardEl){cardEl.remove();cardEl=null;}try{localStorage.setItem('mnr_fscard',String(never?99:asked+1));}catch(e){}};
  FSX.card=function(force){if(cardEl||(!ios&&!force)||standalone)return;if(!force&&asked>=3)return;
    cardEl=document.createElement('div');cardEl.id='fsCard';cardEl.setAttribute('role','dialog');cardEl.setAttribute('aria-label','Full screen');
    cardEl.style.cssText='position:fixed;left:0;right:0;bottom:0;z-index:99999;padding:14px 16px calc(14px + env(safe-area-inset-bottom,0px));background:#0b0618f2;border-top:2px solid #ff2d78;color:#fff;font:600 15px/1.35 system-ui,sans-serif;text-align:left';
    cardEl.innerHTML='<div style="font:700 17px/1.2 system-ui,sans-serif;margin-bottom:6px">PLAY FULL SCREEN</div>'+
      '<div>Safari and Chrome on iPhone cannot hide their bars. Install the game and it opens full screen:</div>'+
      '<ol style="margin:8px 0 10px 20px;padding:0"><li>Tap <b>Share</b> (the square with the arrow, bottom or top bar)</li><li>Tap <b>Add to Home Screen</b></li><li>Open <b>Nightrun</b> from your home screen</li></ol>'+
      '<div style="display:flex;gap:10px"><button type="button" id="fsOk" style="flex:1;min-height:48px;border:0;border-radius:10px;background:#c8175c;color:#fff;font:700 15px system-ui">GOT IT</button><button type="button" id="fsNo" style="flex:1;min-height:48px;border:1px solid #6a5a8a;border-radius:10px;background:#0000;color:#cfc9f2;font:600 15px system-ui">DON\'T SHOW AGAIN</button></div>';
    document.body.appendChild(cardEl);cardEl.querySelector('#fsOk').addEventListener('click',()=>closeCard(false));cardEl.querySelector('#fsNo').addEventListener('click',()=>closeCard(true));};
  FSX.ios=ios;
  if(ios&&!standalone)setTimeout(()=>{try{const t=document.getElementById('title');if(t&&!t.hidden&&typeof running!=='undefined'&&!running)FSX.card(false);}catch(e){}},2500);
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
    fsEl.addEventListener('click',()=>{if(!rq){FSX.card(true);return;}FSX.set(!(isFS()));});
    mg.appendChild(fsEl);paint();},0);
})();}
