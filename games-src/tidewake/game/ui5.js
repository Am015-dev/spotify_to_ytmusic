// ===================== part 5: boot, kit wiring, PerfHUD =====================
function detectSoftGPU(){if(/jsdom/i.test(navigator.userAgent))return false;try{const c=document.createElement('canvas');const gl=c.getContext('webgl');if(!gl)return false;const e=gl.getExtension('WEBGL_debug_renderer_info');const r=e?gl.getParameter(e.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER);const lose=gl.getExtension('WEBGL_lose_context');if(lose)lose.loseContext();return /swiftshader|llvmpipe|software|softpipe/i.test(String(r))}catch(e){return false}}
function perfHooks(){const PH=window.PerfHUD;if(!PH||!TWKit._K||!TWKit._K.on)return;const K=TWKit._K;const DPR={high:2,medium:1.5,low:1};
  PH.register({game:'Tidewake',renderer:K.r,levels:['high','medium','low'],names:{high:'High',medium:'Medium',low:'Low'},anchor:'.gx-board',corner:'bl',
    getLevel:()=>TWKit.getQuality().active,isAuto:()=>TWKit.getQuality().pref==='auto',autoTop:()=>window.TW_SOFTGPU?'low':(Math.min(innerWidth,innerHeight)<600?'medium':'high'),
    setLevel:(l,why)=>{if(why==='apply')TWKit.setQuality(l);else TWKit._applyQ(l);if(GX.open==='setd')renderSettings()},
    basePR:()=>Math.min(window.devicePixelRatio||1,DPR[TWKit.getQuality().active]||1),onPixelRatio:v=>{K.r.setPixelRatio(v);const b=GX.boardSize();TWKit.resize(b.w,b.h)},
    orbit:t=>{const C=K.cs;if(!C)return;if(t==null){if(UI.orb0){C.pos.copy(UI.orb0.p);C.look.copy(UI.orb0.l);UI.orb0=null}return}if(!UI.orb0)UI.orb0={p:C.pos.clone(),l:C.look.clone()};const a=Math.sin(t*Math.PI*2)*.5;const d=UI.orb0.p.clone().sub(UI.orb0.l);const x=d.x*Math.cos(a)-d.z*Math.sin(a),z=d.x*Math.sin(a)+d.z*Math.cos(a);C.pos.set(UI.orb0.l.x+x,UI.orb0.p.y,UI.orb0.l.z+z)},
    isAnimating:()=>{try{return TWKit.isAnimating()||UI.busy}catch(e){return false}},beforeTest:()=>GX.close()})}
// board framing: the whole chart (frame, edge numbers, ships on the marks) must stay inside the board area at any aspect
function frame(w,h){const a=w/h;window.TW_PADX=a<1.2?.3:.15;window.TW_PADT=a<.8?.55:.6;window.TW_PADB=.2}
function boot(){GX.init({key:'tw'});const st=lsGet('tw_set',{});if(st.speed)UI.speed=st.speed;if(st.guide)UI.guide=st.guide;if(st.anim===false){UI.anim=false;ANIM=0}
  window.TW_SOFTGPU=detectSoftGPU();installRecorders();
  const cv=$('#c3'),fb=$('#fb');const P=new URLSearchParams(location.search);let res={ok:false};
  {const b=GX.boardSize();frame(b.w,b.h)}
  try{res=TWKit.init(cv,{fallback:fb,force2D:P.has('2d')})}catch(e){console.error(e)}
  try{TWKit.setSpeed(UI.speed)}catch(e){}
  const on2d=()=>{cv.hidden=true;fb.hidden=false;if(!fb._wired){fb._wired=1;fb.addEventListener('click',e=>{let p=null;try{p=TWKit.pick(e.clientX,e.clientY)}catch(x){}if(!p||!isFinite(e.clientX)||!e.clientX&&!e.clientY)p=TWKit.pick2D(e.target)||p;if(p)onPick(p)})}};
  if(!res.ok)on2d();
  else{let down=null;cv.addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY}});
    cv.addEventListener('webglcontextlost',e=>{e.preventDefault();window.TW_LOST=(window.TW_LOST||0)+1;console.warn('WebGL context lost: switching to the 2D chart');setTimeout(()=>{try{TWKit._K.loopOn=false;TWKit.init(cv,{fallback:fb,force2D:true});on2d();KS={tiles:{},mons:{},ships:{},gates:{},mael:{},wave:null,hold:{}};kitSync();render()}catch(x){console.error(x)}},0)},false);
    cv.addEventListener('click',e=>{if(down&&Math.abs(e.clientX-down.x)+Math.abs(e.clientY-down.y)>8)return;onPick(TWKit.pick(e.clientX,e.clientY))});perfHooks()}
  const tiltFor=(w,h)=>w<700?82:(w/h<.8?76:61);GX.onResize((w,h)=>{try{frame(w,h);TWKit.resize(w,h);TWKit.setView({tilt:tiltFor(w,h),immediate:true});TWKit.renderOnce()}catch(e){}});{const b=GX.boardSize();try{TWKit.resize(b.w,b.h);TWKit.setView({tilt:tiltFor(b.w,b.h),immediate:true})}catch(e){}}
  $('#rulesbody').innerHTML=RULES_HTML;
  GX.onShow=id=>{sfx('open');if(id==='piecesd'&&!$('#piecesbody').firstChild)$('#piecesbody').innerHTML=piecesHTML();renderOpenDrawer()};GX.onClose=()=>sfx('close');
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!GX.open&&G&&UI.started&&UI.confirm){UI.confirm=null;renderCoach()}});
  netInit();showStart();OV.raf=requestAnimationFrame(ovLoop)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
