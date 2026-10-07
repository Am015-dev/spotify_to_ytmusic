// ===== TUNE (tune20): Alex tunes the driving feel himself, live, with versioned saves. Docs: docs/TUNE.md
// One table of knobs. A knob id is a path: 'TUNE.x' = the TUNE object (10_core.js, numbers that used to be inline literals),
// 'C26.…' / 'W13S.…' / 'W14_ST.…' / 'RCAM.chase.…' = the existing settings objects, 'W.B2K_DMIN' = window. Defaults are read
// from those objects when this module loads, so with nothing changed the game is exactly v87w.
// Drawer: only with ?tune=1 or when the page runs as a claude.ai artifact with the db capability (the beta). Storage: artifact db
// (collection tune_versions {v,note,values,createdAt}, doc tune/current {v}); without db the public page reads ./tune.json.
const TUNE_K=[ // [group, id, label, min, max, step]
 ['Steer','TUNE.stAng','Steer angle (slow)',.2,1.2,.01],['Steer','TUNE.stFall','Speed-sensitive (higher = sharper fast)',4,40,.5],
 ['Steer','TUNE.stIn','Steer-in rate',2,30,.5],['Steer','TUNE.stOut','Return-to-centre rate',2,40,.5],
 ['Steer','TUNE.stMax','Max turn rate',.6,2.5,.05],['Steer','TUNE.stSpd','Turn-rate cut at top speed',0,1.2,.05],
 ['Steer','W14_ST.k0','Touch: start lock',0,.8,.01],['Steer','W14_ST.rk','Touch: ramp to full lock',.3,4,.05],
 ['Steer','TUNE.tRet','Touch: return speed',2,40,.5],['Steer','TUNE.assist','Lane assist (touch)',0,4,.1],
 ['Grip','C26.muCity.road','Road grip',5,40,.5],['Grip','C26.muCity.dirt','Dirt grip',3,25,.5],['Grip','C26.muCity.water','Water grip',1,15,.5],
 ['Grip','TUNE.gripRoad','Lateral grip (lower = slides)',5,80,1],['Grip','C26.align','Self-straighten',0,6,.1],['Grip','C26.scrub','Slide scrub (speed loss)',0,5,.1],
 ['Grip','W.B2K_DMIN','Drift min speed (m/s)',4,30,.5],['Grip','W14_ST.hbCity','Touch BRAKE+steer drift speed (m/s)',10,60,.5],
 ['Grip','TUNE.drSlip','Drift angle',.5,3,.05],['Grip','TUNE.drGrip','Drift grip',.01,.3,.005],
 ['Grip','TUNE.drFill','Drift bar fill rate',5,60,1],['Grip','TUNE.drConv','Drift → boost gain',.1,1.5,.05],
 ['Engine','W13S.city','City top speed ×',.5,1.6,.01],['Engine','W13S.open','Open-road top speed ×',.5,1.6,.01],['Engine','TUNE.abTop','Autobahn top speed ×',.8,2,.01],
 ['Engine','TUNE.acc','Acceleration',.4,3,.05],['Engine','W13S.cp','Accel curve (higher = pulls to top)',.5,4,.1],['Engine','C26.thUp','Throttle response',.5,10,.1],
 ['Engine','C26.brkCity','Brake force',4,40,.5],['Engine','TUNE.rev','Reverse top (m/s)',5,30,1],
 ['Boost','TUNE.bPush','Boost burst push',0,60,1],['Boost','TUNE.bTop','Boost top-speed bonus ×',0,3,.05],['Boost','TUNE.bDrain','Boost use per s',5,60,1],
 ['Boost','TUNE.bRegen','Meter regen per s',0,9,.25],['Boost','TUNE.bashT','Brickbash after (s)',.5,6,.1],
 ['Boost','TUNE.hop','Hop height',4,24,.5],['Boost','TUNE.grav','Gravity',10,60,1],
 ['Camera','RCAM.chase.b','Distance',4,20,.1],['Camera','RCAM.chase.bk','Extra distance at speed',-4,6,.1],['Camera','RCAM.chase.h','Height',1,10,.1],
 ['Camera','RCAM.chase.hk','Extra height at speed',-2,4,.1],['Camera','RCAM.chase.l','Look-ahead',4,30,.5],['Camera','TUNE.fov','FOV',45,95,1],
 ['Camera','TUNE.fovSpd','FOV widen at speed',0,30,.5],['Camera','TUNE.camK','Turn follow (higher = less lag)',1,20,.1],['Camera','TUNE.camY','Height follow',1,30,.5],
 ['Body','TUNE.carW','Car width ×',.7,1.4,.01],['Body','TUNE.carL','Car length ×',.7,1.4,.01],['Body','TUNE.ride','Body ride height (m)',-.3,.5,.01],
 ['Body','C26.w','Suspension stiffness',3,25,.5],['Body','C26.z','Suspension damping',.05,1.5,.01],['Body','C26.pK','Pitch (brake/accel dive)',0,.012,.0002],['Body','C26.rK','Body roll',0,.012,.0002],
 ['Race','TUNE.rSpd','Race speed × (next race)',.8,1.8,.01],['Race','TUNE.rub','AI rubber-band ×',0,3,.05],['Race','TUNE.traf','Traffic density (next city load)',.1,2,.05],
 // fix21 FX: boost visuals, roam + races (1 = the default look). A 7th entry 'bool' = on/off switch
 ['FX','TUNE.fxFlS','Flame size ×',0,2.5,.05],['FX','TUNE.fxFlL','Flame length ×',0,3,.05],['FX','TUNE.fxFlI','Flame brightness ×',0,3,.05],
 ['FX','TUNE.fxSpk','Boost sparkles',0,1,1,'bool'],['FX','TUNE.fxSpkN','Sparkle count ×',0,3,.1],['FX','TUNE.fxSpkS','Sparkle size / spread ×',.2,3,.05],
 ['FX','TUNE.fxLines','Speed lines on boost ×',0,3,.05],['FX','TUNE.fxGlow','Boost screen glow / blur ×',0,3,.05],
 ['FX','TUNE.fxFov','Boost FOV kick ×',0,3,.05],['FX','TUNE.fxShake','Boost camera shake ×',0,3,.05]];
const TU_ROOT={TUNE,C26,W13S,W14_ST,RCAM,W:window};
const TU_ref=id=>{const p=id.split('.');let o=TU_ROOT[p[0]];for(let i=1;i<p.length-1&&o;i++)o=o[p[i]];return o?[o,p[p.length-1]]:null};
const TU_get=id=>{const r=TU_ref(id);return r?r[0][r[1]]:undefined};
const TU_set=(id,v)=>{const r=TU_ref(id);if(r&&typeof v==='number'&&isFinite(v))r[0][r[1]]=v};
const TU_DEF={};for(const k of TUNE_K)TU_DEF[k[1]]=TU_get(k[1]);
const TU={db:null,show:/[?&]tune=1/.test(location.search),src:'defaults',cur:null,list:[],grp:'Steer',open:false,el:null,msg:''};
const TU_vals=()=>{const o={};for(const k of TUNE_K)o[k[1]]=TU_get(k[1]);return o};
// a version = a full snapshot: start from defaults, then the saved numbers (unknown ids are ignored, missing ones stay default)
function TU_apply(v){for(const k of TUNE_K)TU_set(k[1],TU_DEF[k[1]]);if(v&&typeof v==='object')for(const k of TUNE_K)if(typeof v[k[1]]==='number')TU_set(k[1],v[k[1]]);if(TU.el)TU_render()}
// ---- load: db (beta artifact) → current version; else ./tune.json (public page); else defaults. Never writes.
(async()=>{let db=null;try{if(window.claude&&typeof claude.use==='function')db=await claude.use('db')}catch(e){db=null}
 TU.db=db;if(db){TU.show=true;try{const c=await db.doc('tune/current').get();const v=c.exists?(c.data()||{}).v:null;if(v!=null){const d=await db.doc('tune_versions/v'+v).get();if(d.exists){TU_apply((d.data()||{}).values);TU.cur=v;TU.src='v'+v}}}catch(e){console.warn('TUNE load',e&&e.message||e)}
  TU_list()}
 else{try{const r=await fetch('./tune.json',{cache:'no-store'});if(r.ok){const j=await r.json();if(j&&typeof j==='object'){TU_apply(j.values||j);TU.cur=j.v??null;TU.src='tune.json'+(j.v!=null?' v'+j.v:'')}}}catch(e){}}
 if(TU.show)TU_ui()})();
async function TU_list(){if(!TU.db)return;try{const q=await TU.db.collection('tune_versions').orderBy('v','desc').limit(60).get();TU.list=q.docs.map(d=>d.data()).filter(d=>d&&typeof d.v==='number')}catch(e){TU.msg='list failed: '+(e&&e.code||e)}if(TU.el)TU_render()}
async function TU_save(note){if(!TU.db){TU.msg='no db here: use EXPORT';TU_render();return}TU.msg='saving…';TU_render();
 try{const q=await TU.db.collection('tune_versions').orderBy('v','desc').limit(1).get();const v=q.empty?1:((q.docs[0].data()||{}).v|0)+1;
  await TU.db.doc('tune_versions/v'+v).set({v,note:String(note||'').slice(0,120),values:TU_vals(),createdAt:new Date().toISOString()});TU.msg='saved v'+v+' · tap ★ to make it the default';await TU_list()}
 catch(e){TU.msg='save failed: '+(e&&e.code||e)}TU_render()}
async function TU_setCur(v){if(!TU.db)return;try{await TU.db.doc('tune/current').set({v});TU.cur=v;TU.msg='v'+v+' is now the default'}catch(e){TU.msg='failed: '+(e&&e.code||e)}TU_render()}
function TU_load(v){const d=TU.list.find(q=>q.v===v);if(!d)return;TU_apply(d.values);TU.src='v'+v;TU.msg='loaded v'+v+' (not default until ★)';TU_render()}
function TU_export(){const j=JSON.stringify({v:TU.cur,note:'export '+new Date().toISOString().slice(0,16),values:TU_vals()},null,1);TU.exp=j;
 const done=ok=>{TU.msg=ok?'JSON copied':'copy blocked: select the text below';TU_render()};try{navigator.clipboard.writeText(j).then(()=>done(true),()=>done(false))}catch(e){done(false)}}
// ---- drawer UI (852×393 phone landscape first; opens instantly, no slide, so a tap never lands mid-animation). ⚙ sits top-right (coins/objective are top-centre, pause+minimap top-left);
// on the phone the drawer fills the free middle column between ◀▶ and BRAKE/GAS/BOOST, so every drive control stays usable while it is open.
const TU_fmt=(v,st)=>{const d=st>=1?0:st>=.1?1:st>=.01?2:st>=.001?3:4;return(+v).toFixed(d)};
const TU_esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function TU_ui(){if(TU.el)return;const st=document.createElement('style');st.textContent=`
#tuG{position:fixed;top:calc(6px + env(safe-area-inset-top));right:calc(8px + env(safe-area-inset-right));z-index:9000;width:34px;height:34px;border-radius:17px;border:1px solid #4ceaff88;background:#0b1424cc;color:#bff6ff;font:18px/32px system-ui;text-align:center;padding:0;touch-action:manipulation}
#tuD{position:fixed;left:6px;top:6px;z-index:9001;width:380px;display:flex;flex-direction:column;background:#081120ee;border:1px solid #4ceaff66;border-radius:12px;color:#e6f7ff;font:13px/1.25 system-ui,sans-serif;box-shadow:0 6px 24px #0008;touch-action:pan-y}
#tuD:not(.on){display:none}#tuD *{box-sizing:border-box}
#tuD .th{display:flex;align-items:center;gap:6px;padding:6px 8px;border-bottom:1px solid #4ceaff33}#tuD .th b{font-size:13px;color:#4ceaff}#tuD .th small{flex:1;font-size:12px;color:#9fb6c8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#tuD button{font:600 12px system-ui;color:#e6f7ff;background:#16304c;border:1px solid #4ceaff55;border-radius:7px;padding:5px 8px;min-height:28px}
#tuD .tabs{display:flex;gap:3px;padding:5px 6px;overflow-x:auto;border-bottom:1px solid #4ceaff22;flex:none}#tuD .tabs button{flex:none;padding:4px 7px}#tuD .tabs button.on{background:#4ceaff;color:#04121c}
#tuD .bd{overflow-y:auto;padding:4px 8px 8px;flex:1;min-height:0;overscroll-behavior:contain}
#tuD .r{padding:4px 0;border-bottom:1px solid #ffffff10}#tuD .r .l{display:flex;justify-content:space-between;gap:6px;font-size:12px}#tuD .r .l span{color:#9fb6c8}#tuD .r .l b{color:#ffd12c;font-variant-numeric:tabular-nums}#tuD .r .l b.ch{color:#ff8ad0}
#tuD input[type=range]{width:100%;height:26px;margin:0;accent-color:#4ceaff}#tuD label.tb{display:flex;align-items:center;gap:8px;min-height:34px}#tuD label.tb .l{flex:1}#tuD input[type=checkbox]{width:26px;height:26px;margin:0;accent-color:#4ceaff}
#tuD .ft{display:flex;gap:5px;padding:6px 8px;border-top:1px solid #4ceaff33;flex-wrap:wrap}#tuD .msg{font-size:12px;color:#ffd12c;padding:0 8px 6px}
#tuD .vl{display:flex;align-items:center;gap:5px;padding:5px 0;border-bottom:1px solid #ffffff10;font-size:12px}#tuD .vl div{flex:1;min-width:0}#tuD .vl small{display:block;color:#9fb6c8;font-size:12px}
#tuD input[type=text]{flex:1;min-width:0;font:13px system-ui;background:#0d1a2c;color:#fff;border:1px solid #4ceaff55;border-radius:7px;padding:5px 7px}
#tuD textarea{width:100%;height:90px;font:12px monospace;background:#0d1a2c;color:#cfe;border:1px solid #4ceaff55;border-radius:6px}`;
 document.head.appendChild(st);
 const g=document.createElement('button');g.id='tuG';g.textContent='⚙';g.title='Tune';g.setAttribute('aria-label','Tune driving');document.body.appendChild(g);
 const d=document.createElement('div');d.id='tuD';document.body.appendChild(d);TU.el=d;
 // touches inside the drawer belong to the drawer (never steer/brake the car); keys typed in the note field never drive
 for(const ev of['touchstart','touchmove','touchend','pointerdown','mousedown','wheel'])d.addEventListener(ev,e=>e.stopPropagation(),{passive:true});
 for(const ev of['keydown','keyup'])d.addEventListener(ev,e=>{if(e.target.tagName==='INPUT'&&e.target.type==='text')e.stopPropagation()});
 g.addEventListener('click',e=>{e.stopPropagation();TU_toggle()});
 d.addEventListener('input',e=>{const t=e.target;if(t.type!=='range')return;const k=TUNE_K.find(q=>q[1]===t.dataset.k);if(!k)return;TU_set(k[1],+t.value);
  const b=t.parentNode.querySelector('b');if(b){b.textContent=TU_fmt(t.value,k[5]);b.classList.toggle('ch',Math.abs(+t.value-TU_DEF[k[1]])>k[5]/2)}});
 d.addEventListener('change',e=>{const t=e.target;if(t.type==='range')t.blur();if(t.type==='checkbox'&&t.dataset.k){TU_set(t.dataset.k,t.checked?1:0);const b=t.parentNode.querySelector('b');if(b){b.textContent=t.checked?'ON':'OFF';b.classList.toggle('ch',(t.checked?1:0)!==TU_DEF[t.dataset.k])}}});
 d.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const a=b.dataset.a;
  if(a==='x')TU_toggle(false);else if(a==='tab'){TU.grp=b.dataset.g;TU.exp=null;TU_render()}
  else if(a==='reset'){for(const k of TUNE_K)if(k[0]===TU.grp)TU_set(k[1],TU_DEF[k[1]]);TU.msg=TU.grp+' reset to defaults';TU_render()}
  else if(a==='resetAll'){TU_apply(null);TU.src='defaults';TU.msg='all defaults';TU_render()}
  else if(a==='save'){const n=d.querySelector('#tuN');TU_save(n?n.value:'')}
  else if(a==='load')TU_load(+b.dataset.v);else if(a==='cur')TU_setCur(+b.dataset.v);else if(a==='exp')TU_export();else if(a==='ref')TU_list()});
 addEventListener('resize',()=>TU_fit());TU_render()}
function TU_toggle(on){TU.open=on==null?!TU.open:on;TU.el.classList.toggle('on',TU.open);if(TU.open){TU_render();TU_fit()}}
// keep the drawer above every visible touch control it would cover (GAS/BRAKE/◀▶/DRIFT/BOOST): its bottom stops 6 px above them
function TU_fit(){const d=TU.el;if(!d||!TU.open)return;const W=innerWidth,H=innerHeight,C=[];
 for(const e of document.querySelectorAll('#touch .tbtn,#steerZone')){const q=e.getBoundingClientRect();if(q.width>4&&q.height>4&&getComputedStyle(e).display!=='none')C.push(q)}
 // phone: the free column between the left cluster (◀▶ / steer pad) and the right cluster (BRAKE/GAS/BOOST); top buttons (pause) don't count
 let L=6,R=W-6;for(const q of C){if(q.bottom<H*.45)continue;if(q.left+q.width/2<W/2)L=Math.max(L,q.right+6);else R=Math.min(R,q.left-6)}
 const w=Math.max(260,Math.min(420,R-L)),x=Math.min(L,W-w-6);let top=6,bot=H-6;
 for(const q of C)if(q.right>x&&q.left<x+w){if(q.bottom<H*.45)top=Math.max(top,q.bottom+6);else bot=Math.min(bot,q.top-6)}
 d.style.left=x+'px';d.style.width=w+'px';d.style.top=top+'px';d.style.height=Math.max(150,bot-top)+'px'}
function TU_render(){const d=TU.el;if(!d)return;const G=[...new Set(TUNE_K.map(k=>k[0]))],sv=TU.grp==='Saves';let h=`<div class="th"><b>TUNE</b><small>active: ${TU_esc(TU.src)}${TU.db?'':' · no db'}</small><button data-a="x" aria-label="close">✕</button></div><div class="tabs">`;
 for(const g of[...G,'Saves'])h+=`<button data-a="tab" data-g="${g}" class="${g===TU.grp?'on':''}">${g}</button>`;h+='</div><div class="bd">';
 if(!sv){for(const k of TUNE_K){if(k[0]!==TU.grp)continue;const v=TU_get(k[1]),ch=Math.abs(v-TU_DEF[k[1]])>k[5]/2;
   if(k[6]==='bool'){h+=`<label class="r tb"><div class="l"><span>${TU_esc(k[2])}</span><b class="${ch?'ch':''}">${v?'ON':'OFF'}</b></div><input type="checkbox" data-k="${k[1]}" ${v?'checked':''}></label>`;continue}
   h+=`<div class="r"><div class="l"><span>${TU_esc(k[2])}</span><b class="${ch?'ch':''}">${TU_fmt(v,k[5])}</b></div><input type="range" data-k="${k[1]}" min="${k[3]}" max="${k[4]}" step="${k[5]}" value="${v}"></div>`}}
 else{h+=`<div class="vl"><input type="text" id="tuN" maxlength="120" placeholder="note, e.g. tighter steering"><button data-a="save">SAVE</button></div>`;
  if(!TU.db)h+='<div class="vl"><div><small>No artifact db on this page: SAVE needs the beta. EXPORT still works.</small></div></div>';
  for(const q of TU.list)h+=`<div class="vl"><div>${q.v===TU.cur?'★ ':''}<b>v${q.v}</b> ${TU_esc(q.note||'')}<small>${TU_esc(String(q.createdAt||'').replace('T',' ').slice(0,16))}</small></div><button data-a="load" data-v="${q.v}">LOAD</button><button data-a="cur" data-v="${q.v}" ${q.v===TU.cur?'disabled':''}>★ SET</button></div>`;
  if(TU.db&&!TU.list.length)h+='<div class="vl"><div><small>No saved versions yet.</small></div></div>';
  if(TU.exp)h+=`<textarea readonly>${TU_esc(TU.exp)}</textarea>`}
 h+=`</div>${TU.msg?`<div class="msg">${TU_esc(TU.msg)}</div>`:''}<div class="ft">${sv?'<button data-a="exp">EXPORT JSON</button><button data-a="ref">REFRESH</button><button data-a="resetAll">ALL DEFAULTS</button>':`<button data-a="reset">RESET ${TU.grp.toUpperCase()}</button><button data-a="tab" data-g="Saves">SAVE…</button>`}</div>`;
 const bd=d.querySelector('.bd'),sc=bd?bd.scrollTop:0,same=d.dataset.g===TU.grp;d.innerHTML=h;d.dataset.g=TU.grp;if(same){const b2=d.querySelector('.bd');if(b2)b2.scrollTop=sc}
 const ta=d.querySelector('textarea');if(ta){ta.focus();ta.select()}TU_fit()}
// body width / length / ride height: cosmetic, on the player car only, applied after every other pose step (wrapped last, after boot)
setTimeout(()=>{const f0=roamPose;roamPose=function(s,dt){const r=f0.apply(this,arguments);try{if(s===pl&&state==='roam')TU_body(s)}catch(e){}return r}},0);
function TU_body(s){const ud=s.mesh&&s.mesh.userData;if(!ud||!ud.m)return;const sc=ud.m.scale,W=TUNE.carW,L=TUNE.carL,on=W!==1||L!==1;
 const mine=ud.tuSet&&sc.equals(ud.tuSet);if(!on){if(mine)sc.copy(ud.tuB);ud.tuSet=null}else{const b=mine?ud.tuB:sc.clone();sc.set(b.x*W,b.y,b.z*L);ud.tuB=b;ud.tuSet=sc.clone()}
 // ride: only the body bricks (wheels keep touching the road); they are re-posed from crP0 every frame by the C26 lean, so this never accumulates
 if(TUNE.ride&&C26.on&&ud.gbM&&!s.air&&!((s.boatK||0)>.5)&&!RO.wk){const dy=TUNE.ride/(sc.y||1);ud.m.traverse(o=>{if(o.isMesh&&!o.userData.r&&o.userData.gb&&o.userData.crP0)o.position.y+=dy})}}
window.__tune={K:TUNE_K,DEF:TU_DEF,get:TU_get,set:TU_set,vals:TU_vals,apply:TU_apply,toggle:o=>TU_toggle(o),fit:()=>TU_fit(),TU,list:()=>TU_list()};
