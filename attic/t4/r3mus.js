// t4/r3mus.js (R3 music): page load → first tap → first AUDIBLE music (element playing + ctx running + gain>0), with a real browser
// autoplay policy (user gesture required). usage: node t4/r3mus.js <url> [W H]; IFRAME=1 = cross-origin-style iframe without allow=autoplay;
// TAP=play → the first tap is the PLAY/start button, else a neutral tap on the menu background.
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const U=process.argv[2],W=+(process.argv[3]||852),H=+(process.argv[4]||393);
 const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--autoplay-policy=user-gesture-required']});
 const ctx=await b.newContext({viewport:{width:W,height:H},isMobile:W<1000,hasTouch:true});const pg=await ctx.newPage();const errs=[];
 pg.on('pageerror',e=>errs.push(String(e)));pg.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
 const reqs=[];pg.on('request',r=>{if(/\.mp3/.test(r.url()))reqs.push({t:Date.now(),u:r.url().split('/').pop(),range:r.headers().range||''})});
 await ctx.addInitScript(()=>{const T=window.__r3t={load0:performance.now(),tap:null,playing:[],audible:null};
  const p0=HTMLMediaElement.prototype.play;HTMLMediaElement.prototype.play=function(){if(!this.__r3){this.__r3=1;(T.els=T.els||[]).push(this);this.addEventListener('playing',()=>T.playing.push({t:performance.now(),src:(this.src||'').split('/').pop(),muted:this.muted}))}return p0.apply(this,arguments)};
  for(const ev of['pointerdown','touchstart','keydown'])addEventListener(ev,e=>{if(T.tap==null){T.tap=e.timeStamp;T.tapSeen=performance.now()}},{capture:true});
  setInterval(()=>{if(T.audible||T.tap==null||!window.__mus)return;const s=__mus.st();if(s.ctx==='running'&&!s.muted&&s.level>0&&s.playing.some(q=>!q.paused&&q.g>0.005&&q.t>0)){const el=(T.els||[]).find(e=>!e.paused&&!e.muted&&/mp3/.test(e.src)&&e.currentTime>0);T.audible={t:performance.now(),track:s.track,est:el?performance.now()-el.currentTime*1000:null}}},20)});
 const t0=Date.now();await pg.goto(U+(U.includes('?')?'&':'?')+'r3='+t0);let p=pg;
 if(process.env.IFRAME){await pg.setContent(`<html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#000"><iframe id="f" src="${U}" style="border:0;width:${W}px;height:${H}px"></iframe></body></html>`);
  await pg.waitForTimeout(500);p=pg.frames()[1]}
 await p.waitForFunction(()=>window.__mho&&document.querySelector('#topBtns')&&!document.querySelector('#topBtns').hidden,null,{timeout:240000});const tReady=Date.now()-t0;
 const pre=await p.evaluate(()=>({mus:__mus.st(),res:performance.getEntriesByType('resource').filter(r=>/mp3/.test(r.name)).map(r=>({n:r.name.split('/').pop(),start:Math.round(r.startTime),end:Math.round(r.responseEnd),kb:Math.round(r.transferSize/1024)}))}));
 console.log('READY_MS',tReady,'pre',JSON.stringify(pre));await pg.waitForTimeout(+(process.env.IDLE||1500));
 const cdp=await ctx.newCDPSession(pg);let x=W*0.5,y=H*0.12;
 if(process.env.XY){[x,y]=process.env.XY.split(',').map(Number)}if(process.env.TAP==='play'){const e=await p.$(process.env.SEL||'#playBtn,#bPlay,#startBtn');if(e){const bb=await e.boundingBox();x=bb.x+bb.width/2;y=bb.y+bb.height/2;console.log('tap PLAY at',x|0,y|0)}else console.log('no PLAY sel')}
 if(process.env.KEY)await pg.keyboard.press('KeyM');else{const tp=[{x,y,id:1,radiusX:4,radiusY:4,force:1}];await Promise.all([cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:tp}),cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]})])}
 await pg.waitForTimeout(+(process.env.WAIT||6000));
 if(process.env.SHOT)await pg.screenshot({path:process.env.SHOT});
 if(process.env.TOGGLE){const tg=await p.evaluate(async()=>{const o=[];const w=ms=>new Promise(r=>setTimeout(r,ms));__mus.knob({musOn:0});await w(1500);o.push(['musOn0 gains',__mus.st().playing.map(q=>q.g)]);__mus.knob({musOn:1,musVol:.25});await w(1500);o.push(['musOn1 vol.25 level',__mus.st().level,__mus.st().track]);__mus.knob({musVol:.5},{mus:0});await w(1200);o.push(['SET.mus0 level',__mus.st().level]);__mus.knob(null,{mus:1});await w(800);o.push(['restored',__mus.st().level,__mus.st().track]);return o});console.log('TOGGLE',JSON.stringify(tg))}
 const r=await p.evaluate(()=>({T:__r3t,mus:__mus.st(),log:__mus.log.slice(0,6)}));const T=r.T;
 console.log(JSON.stringify({ready_ms:tReady,tap_to_firstPlaying_ms:T.playing.filter(q=>!q.muted)[0]?Math.round(T.playing.filter(q=>!q.muted)[0].t-T.tap):null,tap_to_audible_ms:T.audible?Math.round(T.audible.t-T.tap):null,tap_to_audioStart_est_ms:T.audible&&T.audible.est?Math.round(T.audible.est-T.tap):null,tap_dispatch_lag_ms:Math.round(T.tapSeen-T.tap),
  load_to_audible_ms:T.audible?Math.round(T.audible.t-T.load0):null,playing:T.playing.map(q=>({dt:Math.round(q.t-T.tap),src:q.src,muted:q.muted})),mus:r.mus,log:r.log,mp3reqs:reqs.map(q=>({dt:q.t-t0,u:q.u,range:q.range}))},null,0));
 console.log('ERR',JSON.stringify(errs.slice(0,6)));await b.close()})();
