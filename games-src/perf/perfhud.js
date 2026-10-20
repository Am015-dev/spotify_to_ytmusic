// ---------- PerfHUD: one speed tool for every game on the shelf ----------
// 1. an optional overlay (FPS, frame time avg/p95, level, draws/triangles, heap, dpr, render size): menu "Show speed", ?fps=1 or F9
// 2. "Test speed": 2 s per graphics level with a slow camera orbit, then a result card with Apply and Copy report
// 3. the standard auto step-down: p95 > 50 ms for 3 s steps down a level, then the pixel ratio (floor 0.6);
//    10 s with p95 work < 14 ms steps back up, at most once a minute; a level picked by hand is never changed
// 4. the idle-frame saver: nothing animating and no input for 1.5 s -> PerfHUD.raf() runs at 10 fps (or only on demand)
// Plain script, no modules. Safe in jsdom and without WebGL or requestAnimationFrame: nothing runs and the overlay never shows.
(function(root){
  'use strict';
  const HAS_DOM=typeof window!=='undefined'&&typeof document!=='undefined';
  const UA=(typeof navigator!=='undefined'&&navigator.userAgent)||'';
  const JSDOM=/jsdom/i.test(UA);
  const now=()=>(typeof performance!=='undefined'&&performance.now)?performance.now():Date.now();
  const RAF=HAS_DOM&&!JSDOM&&typeof window.requestAnimationFrame==='function'?window.requestAnimationFrame.bind(window):null;
  const LIVE=!!RAF;
  const store={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
  const NAMES={high:'High',medium:'Medium',med:'Medium',low:'Low'};
  const WIN=2000;                         // stats window (ms)
  const RULE={down:50,downFor:3000,up:14,upFor:10000,upEvery:60000,grace:2000,prStep:.8,prFloor:.6,idleAfter:1500};

  // registered game hooks
  const H={game:'',renderer:null,levels:['high','medium','low'],setLevel:null,getLevel:null,orbit:null,isAuto:null,isAnimating:null,
    onPixelRatio:null,beforeTest:null,anchor:null,corner:'bl',idleMode:'throttle',idleFps:10,autoTop:null,names:null};
  let registered=false;
  // measurement
  let S=[],lastT=0,workAcc=0,workSeen=0,drawn=0,loopOn=false,lastEval=0,lastHud=0;
  // controller
  const C={slowSince:0,fastSince:0,lastUp:-1e9,grace:0,prCap:null,log:[]};
  // idle saver
  let idleOn=false,lastInput=now(),lastIdleDraw=0,pollT=0;const pending=new Set();
  // test
  let testing=false,testT0=0,testLen=0,collect=null;
  // ui
  let hudOn=false,hud=null,card=null,pill=null;

  // ---------- stats ----------
  function pct(a,p){if(!a.length)return 0;const b=a.slice().sort((x,y)=>x-y);return b[Math.min(b.length-1,Math.floor(p*(b.length-1)+.5))]}
  function stats(list){const L=list||S;const n=L.length;if(!n)return {n:0,fps:0,avg:0,p95:0,work:0,refresh:16.7};
    const dts=L.map(s=>s.dt),span=Math.max(1,L[n-1].t-L[0].t+L[0].dt);const ws=L.filter(s=>s.w>=0).map(s=>s.w);
    return {n,fps:n*1000/span,avg:dts.reduce((a,b)=>a+b,0)/n,p95:pct(dts,.95),work:ws.length?pct(ws,.95):-1,refresh:Math.max(4,pct(dts,.1))}}
  function levelName(l){return (H.names&&H.names[l])||NAMES[l]||String(l)}
  function curLevel(){try{return H.getLevel?H.getLevel():null}catch(e){return null}}
  function auto(){try{return H.isAuto?!!H.isAuto():true}catch(e){return false}}
  function animating(){try{return H.isAnimating?!!H.isAnimating():true}catch(e){return true}}
  function pr(){try{return H.renderer?H.renderer.getPixelRatio():(HAS_DOM?window.devicePixelRatio||1:1)}catch(e){return 1}}

  // ---------- the measuring loop: one rAF callback per display frame while the game is awake ----------
  function startLoop(){if(!LIVE||loopOn)return;loopOn=true;lastT=0;RAF(tick)}
  function tick(t){
    if(idleOn&&!testing&&!hudOn){loopOn=false;lastT=0;return}
    RAF(tick);
    if(typeof document!=='undefined'&&document.hidden){lastT=0;S=[];return}
    if(lastT&&!idleOn){const dt=t-lastT;const w=workSeen?workAcc:-1;S.push({t,dt,w});if(collect)collect.push({t,dt,w})}
    lastT=t;workAcc=0;workSeen=0;
    while(S.length&&t-S[0].t>WIN)S.shift();
    if(testing&&H.orbit){try{H.orbit(Math.min(1,(now()-testT0)/testLen))}catch(e){}}
    if(t-lastEval>250){lastEval=t;control(t)}
    if(hudOn&&t-lastHud>500){lastHud=t;drawHud()}
    if(!testing&&!idleOn&&H.isAnimating&&now()-lastInput>RULE.idleAfter&&!animating())idle(true);
  }

  // ---------- auto step-down / step-up ----------
  function note(s){C.log.push(Math.round(now())+' '+s);if(C.log.length>20)C.log.shift()}
  function hitch(ms){C.grace=now()+(ms==null?RULE.grace:ms);C.slowSince=C.fastSince=0;S=[]}
  function applyPR(){if(!H.renderer)return;try{const base=H.basePR?H.basePR():pr();const v=C.prCap==null?base:Math.min(base,C.prCap);
      if(H.onPixelRatio)H.onPixelRatio(v);else H.renderer.setPixelRatio(v)}catch(e){}}
  function control(t){
    const T=now();
    if(!H.setLevel||!H.getLevel){return}
    if(!auto()){if(C.prCap!=null){C.prCap=null;applyPR()}C.slowSince=C.fastSince=0;return}
    if(testing||idleOn||T<C.grace||(typeof document!=='undefined'&&document.hidden)){C.slowSince=C.fastSince=0;return}
    const st=stats();if(st.n<4&&!(st.n>=1&&st.avg>RULE.down*4))return; // very slow frames (>200 ms, e.g. 3 s in SwiftShader) leave fewer than 4 in the 2 s window: they still count as slow
    if(st.p95>RULE.down){C.fastSince=0;if(!C.slowSince)C.slowSince=T;else if(T-C.slowSince>=RULE.downFor)stepDown(st);return}
    C.slowSince=0;
    // "under 14 ms": the game's own work per frame when it reports it (PerfHUD.raf), and every display frame on time
    // (a 60 Hz display never shows intervals under 16.7 ms, so without work numbers "every frame on time" stands in for it)
    const onTime=st.p95<=Math.max(RULE.up,st.refresh*1.3+1);const fast=onTime&&(st.work>=0?st.work<RULE.up:true);
    if(fast){if(!C.fastSince)C.fastSince=T;else if(T-C.fastSince>=RULE.upFor&&T-C.lastUp>=RULE.upEvery)stepUp(st)}else C.fastSince=0}
  function stepDown(st){const L=H.levels,i=L.indexOf(curLevel());C.slowSince=0;
    if(i>=0&&i<L.length-1){note('down '+L[i]+'->'+L[i+1]+' p95 '+st.p95.toFixed(0));set(L[i+1],'auto');hitch();return}
    if(!H.renderer)return;const cur=C.prCap==null?pr():C.prCap;if(cur<=RULE.prFloor+1e-3)return;
    C.prCap=Math.max(RULE.prFloor,Math.round(cur*RULE.prStep*100)/100);note('pixel ratio '+C.prCap);applyPR();hitch()}
  function stepUp(st){const L=H.levels,i=L.indexOf(curLevel());C.fastSince=0;const T=now();
    if(C.prCap!=null){const base=H.basePR?H.basePR():C.prCap/RULE.prStep;const v=Math.round(C.prCap/RULE.prStep*100)/100;C.prCap=v>=base-1e-3?null:v;note('pixel ratio up '+(C.prCap||'full'));applyPR();C.lastUp=T;hitch();return}
    const top=H.autoTop!=null?Math.max(0,L.indexOf(typeof H.autoTop==='function'?H.autoTop():H.autoTop)):0;
    if(i>top){note('up '+L[i]+'->'+L[i-1]+' work '+st.work.toFixed(1));set(L[i-1],'auto');C.lastUp=T;hitch()}}
  function set(l,why){try{H.setLevel(l,why)}catch(e){}}
  // the resolution cap the controller wants; games pass their own pixel ratio through this in their resize code
  function pixelRatio(want){return C.prCap==null?want:Math.min(want,C.prCap)}

  // ---------- idle-frame saver ----------
  function raf(fn){if(!RAF)return 0;
    const run=ts=>{const t0=now();if(idleOn)lastIdleDraw=t0;try{fn(ts)}finally{workAcc+=now()-t0;workSeen++;drawn++}};
    if(idleOn&&!testing){if(H.idleMode==='demand'){pending.add({fn:run,to:0});return -1}
      const e={fn:run,to:0};e.to=setTimeout(()=>{pending.delete(e);RAF(run)},Math.max(0,lastIdleDraw+1000/H.idleFps-now()));pending.add(e);return -1}
    return RAF(run)}
  function idle(on){on=!!on&&LIVE;if(on===idleOn)return;idleOn=on;
    if(on){note('idle');if(!pollT)pollT=setInterval(()=>{if(testing||animating())idle(false)},250);if(hudOn)drawHud()}
    else{if(pollT){clearInterval(pollT);pollT=0}for(const e of pending){clearTimeout(e.to);RAF(e.fn)}pending.clear();lastT=0;hitch(400);startLoop()}}
  function wake(){lastInput=now();if(idleOn)idle(false)}

  // ---------- overlay ----------
  const CSS='#perfhud{position:fixed;z-index:2147483000;pointer-events:none;left:8px;top:8px;margin:0;padding:4px 7px;border-radius:7px;background:rgba(8,12,16,.62);color:#dff3e4;'+
    'font:600 11px/1.3 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;white-space:pre;opacity:.72;contain:content;text-shadow:0 1px 0 #000;user-select:none}'+
    '#perfhud b{color:#fff}#perfhud .w{color:#ffcf6e}#perfhud .bad{color:#ff8f7e}'+
    '.phud-card{position:fixed;z-index:2147483001;left:50%;top:50%;transform:translate(-50%,-50%);width:min(340px,calc(100vw - 32px));max-height:calc(100dvh - 32px);overflow:auto;box-sizing:border-box;padding:14px 16px;border-radius:12px;'+
    'background:#12181e;color:#e9eef2;border:1px solid #3a4652;box-shadow:0 12px 40px rgba(0,0,0,.55);font:14px/1.4 system-ui,-apple-system,Segoe UI,Roboto,sans-serif}'+
    '.phud-card h3{margin:0 0 8px;font-size:16px}.phud-card table{width:100%;border-collapse:collapse;margin:4px 0 10px;font-variant-numeric:tabular-nums}'+
    '.phud-card td,.phud-card th{padding:3px 4px;text-align:right;border-bottom:1px solid #26303a}.phud-card td:first-child,.phud-card th:first-child{text-align:left}'+
    '.phud-card tr.phud-rec td{color:#9ff0b0;font-weight:700}.phud-card .phud-row{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}'+
    '.phud-card button{font:inherit;min-height:40px;padding:6px 12px;border-radius:8px;border:1px solid #4a5866;background:#223040;color:#fff;cursor:pointer}.phud-card button.phud-pri{background:#2f7a4a;border-color:#3c9a5e}'+
    '.phud-card textarea{width:100%;box-sizing:border-box;height:90px;margin-top:8px;font:11px/1.3 ui-monospace,monospace;background:#0b1015;color:#cfe;border:1px solid #334}.phud-card small{color:#9aa8b4}'+
    '.phud-pill{position:fixed;z-index:2147483001;left:50%;top:12px;transform:translateX(-50%);pointer-events:none;padding:6px 12px;border-radius:999px;background:rgba(8,12,16,.8);color:#fff;font:600 13px/1.2 system-ui,sans-serif}';
  function css(){if(!HAS_DOM||document.getElementById('perfhud-css'))return;const s=document.createElement('style');s.id='perfhud-css';s.textContent=CSS;(document.head||document.documentElement).appendChild(s)}
  function anchorRect(){let el=H.anchor;try{if(typeof el==='function')el=el();if(typeof el==='string')el=document.querySelector(el)}catch(e){el=null}
    if(el&&el.getBoundingClientRect){const r=el.getBoundingClientRect();if(r.width>40&&r.height>40)return r}
    return {left:0,top:0,right:innerWidth,bottom:innerHeight,width:innerWidth,height:innerHeight}}
  function place(){if(!hud)return;const r=anchorRect(),c=H.corner||'bl',m=6,w=hud.offsetWidth||150,h=hud.offsetHeight||60;
    const x=c[1]==='r'?r.right-w-m:r.left+m,y=c[0]==='b'?r.bottom-h-m:r.top+m;hud.style.left=Math.max(0,Math.round(x))+'px';hud.style.top=Math.max(0,Math.round(y))+'px'}
  function fmtK(n){return n>=1e6?(n/1e6).toFixed(1)+'M':n>=1e3?(n/1e3).toFixed(1)+'k':String(n)}
  function hudText(){const st=stats(),lv=curLevel();const L=[];
    if(idleOn&&!testing)L.push('<b>idle</b> · saving battery ('+(H.idleMode==='demand'?'on demand':H.idleFps+' fps')+')');
    else L.push('<b>'+Math.round(st.fps)+' fps</b>  '+st.avg.toFixed(1)+' / <span class="'+(st.p95>33?'bad':st.p95>20?'w':'')+'">'+st.p95.toFixed(1)+'</span> ms p95'+(st.work>=0?'  work '+st.work.toFixed(1):''));
    L.push((lv!=null?levelName(lv):'—')+(H.setLevel?(auto()?' · auto':' · fixed'):'')+(C.prCap!=null?' · res ×'+C.prCap:'')+(testing?' · testing':''));
    const ri=H.renderer&&H.renderer.info;if(ri&&ri.render)L.push(fmtK(ri.render.calls)+' draws · '+fmtK(ri.render.triangles)+' tris');
    const m=typeof performance!=='undefined'&&performance.memory;if(m&&m.usedJSHeapSize)L.push('heap '+Math.round(m.usedJSHeapSize/1048576)+' MB');
    let res;try{if(H.renderer){const c=H.renderer.domElement;res=c.width+'×'+c.height}else res=Math.round(innerWidth*(devicePixelRatio||1))+'×'+Math.round(innerHeight*(devicePixelRatio||1))}catch(e){res='?'}
    L.push('dpr '+(+(HAS_DOM&&window.devicePixelRatio||1)).toFixed(2).replace(/\.?0+$/,'')+(H.renderer?' · pr '+pr().toFixed(2).replace(/\.?0+$/,''):'')+' · '+res+' px');return L.join('\n')}
  function drawHud(){if(!hud)return;hud.innerHTML=hudText();place()}
  function show(on,persist){hudOn=on==null?!hudOn:!!on;if(persist!==false)store.set('perfhud',hudOn?'1':'0');syncButtons();if(!LIVE)return hudOn;
    if(hudOn){css();if(!hud){hud=document.createElement('div');hud.id='perfhud';hud.setAttribute('aria-hidden','true');document.body.appendChild(hud)}hud.hidden=false;drawHud();startLoop()}
    else if(hud){hud.hidden=true}return hudOn}
  function syncButtons(){if(!HAS_DOM)return;try{document.querySelectorAll('[data-perfhud="show"]').forEach(b=>{b.setAttribute('aria-pressed',hudOn?'true':'false');b.textContent=hudOn?'Hide speed':'Show speed'})}catch(e){}}
  function buttonsHTML(cls){cls=cls||'';return `<button type="button" class="${cls}" data-perfhud="show" aria-pressed="${hudOn}">${hudOn?'Hide speed':'Show speed'}</button><button type="button" class="${cls}" data-perfhud="test">Test speed</button>`}

  // ---------- speed test ----------
  function wait(ms){return new Promise(r=>setTimeout(r,ms))}
  function frames(n){return new Promise(r=>{let k=0;const f=()=>{if(++k>=n)r();else RAF(f)};RAF(f)})}
  function recommend(rs){const ok=f=>rs.filter(r=>r.p95<f);return (ok(20)[0]||ok(33)[0]||rs[rs.length-1]||{}).level}
  async function test(){if(!LIVE||testing||!H.setLevel)return null;
    try{if(H.beforeTest)H.beforeTest()}catch(e){}closeCard();
    const L=H.levels.slice(),orig=curLevel(),res=[];testing=true;idle(false);startLoop();testT0=now();testLen=L.length*2000;pillShow('Testing speed… keep still');note('test start');
    try{for(let i=0;i<L.length;i++){const l=L[i];pillShow('Testing speed · '+levelName(l)+' ('+(i+1)+'/'+L.length+')');set(l,'test');
        await frames(2);const t0=now();await wait(300);collect=[];const c0=now();await wait(Math.max(900,2000-(now()-t0)));const st=stats(collect),span=now()-c0;collect=null;
        // no frame finished inside the window (frames slower than ~1.7 s): count the whole window as one frame, so this level can never look fast
        if(!st.n)res.push({level:l,fps:+(1000/span).toFixed(1),avg:Math.round(span),p95:Math.round(span),work:null});
        else res.push({level:l,fps:+st.fps.toFixed(1),avg:+st.avg.toFixed(1),p95:+st.p95.toFixed(1),work:st.work>=0?+st.work.toFixed(1):null})}}
    finally{collect=null;try{if(H.orbit)H.orbit(null)}catch(e){}if(orig!=null)set(orig,'restore');testing=false;pillHide();hitch()}
    const out={game:H.game,results:res,recommended:recommend(res)};PerfHUD.lastTest=out;note('test done '+out.recommended);cardShow(out);return out}
  function gpuName(){try{let gl=H.renderer&&H.renderer.getContext&&H.renderer.getContext(),tmp=null;
      if(!gl){tmp=document.createElement('canvas');gl=tmp.getContext('webgl2')||tmp.getContext('webgl')}if(!gl)return 'no WebGL';
      const x=gl.getExtension('WEBGL_debug_renderer_info');const n=x?gl.getParameter(x.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER);
      if(tmp){const l=gl.getExtension('WEBGL_lose_context');if(l)l.loseContext()}return String(n)}catch(e){return 'unknown'}}
  function report(t){t=t||PerfHUD.lastTest||{results:[]};return JSON.stringify({game:H.game,ua:UA,gpu:gpuName(),screen:HAS_DOM?[screen.width,screen.height]:null,viewport:HAS_DOM?[innerWidth,innerHeight]:null,
    dpr:HAS_DOM?window.devicePixelRatio||1:1,pr:+pr().toFixed(2),level:curLevel(),auto:auto(),results:t.results,recommended:t.recommended,date:new Date().toISOString().slice(0,10)})}
  function pillShow(s){css();if(!pill){pill=document.createElement('div');pill.className='phud-pill';pill.setAttribute('role','status');document.body.appendChild(pill)}pill.textContent=s}
  function pillHide(){if(pill){pill.remove();pill=null}}
  function closeCard(){if(card){card.remove();card=null}}
  function cardShow(t){css();closeCard();const rec=t.recommended;card=document.createElement('div');card.className='phud-card';card.setAttribute('role','dialog');card.setAttribute('aria-label','Speed test result');
    const rows=t.results.map(r=>`<tr class="${r.level===rec?'phud-rec':''}"><td>${levelName(r.level)}${r.level===rec?' ✓':''}</td><td>${Math.round(r.fps)}</td><td>${r.p95}</td></tr>`).join('');
    card.innerHTML=`<h3>Speed test</h3><table><tr><th>Level</th><th>FPS</th><th>p95 ms</th></tr>${rows}</table><div>Recommended: <b>${levelName(rec)}</b><br><small>The highest level that keeps 60 fps, or else 30 fps (p95 under 33 ms).</small></div>`+
      `<div class="phud-row"><button type="button" class="phud-pri" data-ph="apply">Apply ${levelName(rec)}</button><button type="button" data-ph="copy">Copy report</button><button type="button" data-ph="close">Close</button></div><div data-ph="out"></div>`;
    card.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-ph]');if(!b)return;const k=b.dataset.ph;
      if(k==='apply'){set(rec,'apply');closeCard()}else if(k==='close')closeCard();
      else if(k==='copy'){const txt=report(t);const out=card.querySelector('[data-ph=out]');const fallback=()=>{out.innerHTML='<small>Copy this text:</small><textarea readonly></textarea>';const ta=out.querySelector('textarea');ta.value=txt;ta.focus();ta.select()};
        try{if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(txt).then(()=>{b.textContent='Copied ✓'},fallback);else fallback()}catch(err){fallback()}}});
    document.body.appendChild(card);const a=card.querySelector('[data-ph=apply]');try{a.focus({preventScroll:true})}catch(e){}}

  // ---------- wiring ----------
  function register(o){o=o||{};for(const k in o)if(k in H||k==='basePR')H[k]=o[k];if(!H.levels||!H.levels.length)H.levels=['high','medium','low'];registered=true;hitch();
    startLoop();if(hudOn)drawHud();return PerfHUD}
  if(HAS_DOM){
    try{const q=new URLSearchParams(location.search).get('fps');if(q!=null)show(q!=='0',true);else if(store.get('perfhud')==='1')hudOn=true}catch(e){}
    const inp=()=>wake();['pointerdown','pointermove','wheel','keydown','touchstart'].forEach(ev=>{try{addEventListener(ev,inp,{passive:true,capture:true})}catch(e){}});
    try{addEventListener('keydown',e=>{if(e.key==='F9'){e.preventDefault();show()}})}catch(e){}
    try{document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('[data-perfhud]');if(!b)return;const k=b.getAttribute('data-perfhud');if(k==='show')show();else if(k==='test')test()},true)}catch(e){}
    try{document.addEventListener('visibilitychange',()=>{S=[];lastT=0;if(!document.hidden)hitch()})}catch(e){}
    try{addEventListener('resize',()=>{if(hud)place()})}catch(e){}
    const boot=()=>{if(hudOn)show(true,false)};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else setTimeout(boot,0)}
  const PerfHUD={register,show,toggle:()=>show(),test,report,stats:()=>Object.assign(stats(),{level:curLevel(),auto:auto(),idle:idleOn,testing,prCap:C.prCap,pr:pr(),drawn}),
    raf,idle,wake,hitch,pixelRatio,buttonsHTML,rules:RULE,log:C.log,lastTest:null,
    get live(){return LIVE},get testing(){return testing},get idling(){return idleOn},get shown(){return hudOn}};
  root.PerfHUD=PerfHUD;
})(typeof window!=='undefined'?window:globalThis);
