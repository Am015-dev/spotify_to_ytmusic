// ===== SB (v88l BUILD GUIDE, Alex's request): ▶ step-by-step build player for every ride + "build it yourself" ghost mode =====
// Ideas (no code copied, see docs/research/SUPRA.md): LDraw "0 STEP" = a part list split into steps (three.js LDrawLoader, MIT; brick-viewer, Apache-2.0:
// step slider, earlier steps dimmed, camera per step); LEGO Builder app UX: parts callout per step, new parts highlighted, rotate/zoom, "12/48" counter.
// Data: a template array may carry A.steps (start index of each booklet step, SU_car sets it). Without it (other templates, edited rides, My Build):
// bottom-up by layer (y), nose first (z), then x. Every group is split into steps of 1-4 parts, same part + colour together, mirror twins together.
// Watch: the garage camera orbits the build; earlier parts dimmed, the new parts drop in (+1.5 m, ease-out) and glow. Controls ◀ ▶, PLAY/PAUSE, ×1/×2,
// slider, EXIT (≥ 44 px, in bars around the car). BUILD IT: BUILD mode with the next step as a green ghost; a tap near it snaps the part in place.
const SB={on:0,diy:0,B:null,S:[],k:0,play:1,sp:1,t:0,drop:[],from:'',bak:null,z:1,R:{v:3,h:6},C:null,tg:null,want:null,gh:null,t0:0,done:0};
SB.dm=GB_MAT.clone();SB.dm.color.setScalar(.62);SB.hm=GB_MAT.clone();SB.hm.emissive=new THREE.Color(0xffffff);SB.hm.emissiveIntensity=0;
SB.gm=new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,opacity:.55,depthWrite:false,color:0x7dffa0});
const SB_same=(a,b)=>a.t===b.t&&a.x===b.x&&a.z===b.z&&a.y===b.y&&(a.r%4)===(b.r%4);
function SB_steps(B,tpl){const G=[],n=B.length,ok=tpl&&tpl.steps&&tpl.length===n&&tpl.every((e,i)=>e[0]===B[i].t&&e[1]===B[i].x&&e[2]===B[i].z);
 if(ok){let a=0;for(const e of tpl.steps.concat([n])){if(e>a)G.push(Array.from({length:e-a},(_,i)=>a+i));a=Math.max(a,e)}}
 else{const I=B.map((b,i)=>i).sort((i,j)=>(B[i].y-B[j].y)||(B[i].z-B[j].z)||(B[i].x-B[j].x));let cur=null;for(const i of I){if(!cur||B[cur[0]].y!==B[i].y)G.push(cur=[]);cur.push(i)}}
 const S=[];for(const g of G){const K=new Map();for(const i of g){const k=B[i].t+'|'+B[i].c;if(!K.has(k))K.set(k,[]);K.get(k).push(i)}let st=[];
  for(const L of K.values())for(let a=0;a<L.length;a+=4){const ch=L.slice(a,a+4);if(st.length&&st.length+ch.length>4){S.push(st);st=[]}st=st.concat(ch);if(st.length>=3){S.push(st);st=[]}}
  if(st.length)S.push(st)}return S}
const SB_host=()=>{const U=GB.mesh.userData;return U.carG||U.m};
function SB_clearDrop(){for(const d of SB.drop){d.g.parent&&d.g.parent.remove(d.g);for(const o of d.g.userData.gbM||[])if(!o.userData.gbc)o.geometry.dispose()}SB.drop=[]}
function SB_box(o){const b=new THREE.Box3();o.updateMatrixWorld(true);b.setFromObject(o);return b}
// show step k (k = SB.S.length → the finished car with the driver)
function SB_show(k,anim){if(!GB.mesh)return;SB_clearDrop();const n=SB.S.length;SB.k=k=clamp(k,0,n);SB.t=0;SB.done=k>=n;const U=GB.mesh.userData,host=SB_host();
 if(SB.done){GB_attach(GB.mesh,SB.B,GB_figGet(),false,true);SB.want=SB.C.clone();SB_ui();return}
 const old=[];for(let i=0;i<k;i++)for(const j of SB.S[i])old.push(SB.B[j]);GB_attach(GB.mesh,old,null,false,true);
 if(SB.wh&&!old.some(CR_isW)&&U.gbM[0]&&!U.gbM[0].userData.gbc){const p=U.gbM.shift();host.remove(p);p.geometry.dispose()}
 for(const o of U.gbM)if(o.material===GB_MAT)o.material=SB.dm;
 const bb=new THREE.Box3();SB.S[k].forEach((j,i)=>{const g=new THREE.Group();g.userData.m=g;GB_attach(g,[SB.B[j]],null,false,false);g.traverse(o=>{if(o.material===GB_MAT)o.material=SB.hm});host.add(g);
  bb.union(SB_box(g));const d={g,t:anim?-i*.1:1};if(anim)g.position.y=1.5;SB.drop.push(d)});
 SB.want=SB.C.clone().lerp(bb.getCenter(new THREE.Vector3()),.35);if(anim)try{AU.sfx('pick')}catch(e){}SB_ui()}
function SB_go(k){if(!SB.on)return;SB_show(k,true)}
// ---------- open / close
function SB_open(from){if(!GB.mesh||!GB.d)return;const B=GB_list().map(b=>({...b}));if(!B.length){GB_msg&&GB_msg('Nothing to build yet');return}
 if(GB_.bk){SB.from='build';GB_exit()}else SB.from=from||'rides';
 let tpl=null;try{const S=GAR_set(GAR_get().sel);tpl=S&&S.car?S.car():null}catch(e){}
 Object.assign(SB,{on:1,B,S:SB_steps(B,tpl),play:1,z:1,wh:B.some(CR_isW)});
 GB_attach(GB.mesh,B,null,false,true);const bx=new THREE.Box3();for(const o of GB.mesh.userData.gbM||[])bx.union(SB_box(o));const sz=bx.getSize(new THREE.Vector3());SB.C=bx.getCenter(new THREE.Vector3());SB.tg=SB.C.clone();SB.sz=sz;
 SB_dom();$('#gbx').classList.add('sbOn');SB_show(0,true);try{AU.sfx('pick')}catch(e){}}
function SB_close(){if(!SB.on)return;SB.on=0;SB_clearDrop();$('#gbx').classList.remove('sbOn');GB.cam.clearViewOffset();GB.cam.zoom=1;GB.cam.updateProjectionMatrix();
 const w=SB.from==='build';gbRender();if(w)GB_enter()}
// ---------- per-frame: drops, glow, autoplay, camera (the garage loop hands over to this while the guide is on)
function SB_frame(){const now=performance.now(),dt=Math.min(.05,SB.t0?(now-SB.t0)/1000:.016);SB.t0=now;try{if(typeof GS_step==='function')GS_step(dt)}catch(e){}
 const sp=SB.sp;let land=0,all=1;for(const d of SB.drop){if(d.t<1){const t0=d.t;d.t+=dt*sp/.45;if(d.t>=1&&t0<1)land=1;const k=clamp(d.t,0,1);d.g.position.y=1.5*Math.pow(1-k,3);d.g.visible=d.t>0}if(d.t<1)all=0}
 if(land)try{AU.sfx('brick')}catch(e){}
 SB.t+=dt*sp;SB.hm.emissiveIntensity=all?.32*Math.max(0,Math.cos(Math.min(SB.t*2.2,Math.PI/2)))+.12*Math.max(0,Math.sin(SB.t*5))*(SB.t<1.4?1:0):.35;
 if(SB.play&&all&&SB.t>1.5){if(SB.k<SB.S.length)SB_show(SB.k+1,true);else SB.play=0,SB_ui()}
 const cvs=$('#gbC'),W=cvs.clientWidth,H=cvs.clientHeight,C=GB.cam;if(!W||!H)return;if(cvs.width!==Math.round(W*DPR2())||SB.cw!==W+'x'+H){SB.cw=W+'x'+H;GB.r.setPixelRatio(DPR2());GB.r.setSize(W,H,false);C.aspect=W/H}
 const A=SB_area(W,H);if(GB.drag==null&&SB.play)GB.rot+=dt*.12;SB.tg.lerp(SB.want||SB.C,1-Math.exp(-dt*3));
 const pit=.42,vf=C.fov*Math.PI/360,tv=Math.tan(vf)*(A.b-A.t)/H,th=Math.tan(vf)*C.aspect*(A.r-A.l)/W,s=SB.sz,ev=(s.y*Math.cos(pit)+Math.max(s.x,s.z)*Math.sin(pit))/2,eh=Math.hypot(s.x,s.z)/2;
 const d=Math.max(ev/tv,eh/th,4)*1.16*SB.z+Math.max(s.x,s.z)*.3;C.position.set(SB.tg.x+Math.sin(GB.rot)*Math.cos(pit)*d,SB.tg.y+Math.sin(pit)*d,SB.tg.z+Math.cos(GB.rot)*Math.cos(pit)*d);C.lookAt(SB.tg);
 C.zoom=1;C.setViewOffset(W,H,Math.round(W/2-(A.l+A.r)/2),Math.round(H/2-(A.t+A.b)/2),W,H);C.updateMatrixWorld();GB.r.render(GB.sc,C)}
// free screen rect for the car (canvas px): between the top bar, the bottom bar and the parts callout
function SB_area(W,H){const c=$('#gbC').getBoundingClientRect(),r=e=>{const q=e&&e.getBoundingClientRect();return q&&q.width?q:null},T=r($('#sbG .sbTop')),Bt=r($('#sbG .sbBar')),L=r($('#sbG .sbCall'));
 return{l:L?L.right-c.left+6:0,t:T?T.bottom-c.top+4:0,r:W-6,b:Bt?Bt.top-c.top-4:H}}
gbLoop=(f=>function(){if(!SB.on||$('#gbx').hidden)return f.apply(this,arguments);try{SB_frame()}catch(e){console.warn('SB',e)}GB.raf=requestAnimationFrame(gbLoop)})(gbLoop);
// ---------- UI
function SB_dom(){if($('#sbG'))return;const G=document.createElement('div');G.id='sbG';
 G.innerHTML=`<div class="sbTop"><b>▶ BUILD GUIDE</b><span class="sbNm"></span><span class="sbN"></span><button data-sb="x">✕ EXIT</button></div><div class="sbCall"></div>
 <div class="sbBar"><button data-sb="prev" aria-label="previous step">◀</button><button data-sb="play" class="sbPl"></button><button data-sb="next" aria-label="next step">▶</button><input type="range" class="sbSl" min="0" value="0" aria-label="step"><button data-sb="sp" class="sbSp"></button><button data-sb="diy" class="sbDiy">✋ BUILD IT</button></div>`;
 $('#gbx').appendChild(G);
 G.addEventListener('click',e=>{const b=e.target.closest('[data-sb]');if(!b)return;e.stopPropagation();const a=b.dataset.sb;
  if(a==='x')SB_close();else if(a==='prev'){SB.play=0;SB_go(SB.k-1)}else if(a==='next'){SB.play=0;SB_go(SB.k+1)}
  else if(a==='play'){if(SB.done)SB_go(0);SB.play=!SB.play;SB_ui()}else if(a==='sp'){SB.sp=SB.sp===1?2:1;SB_ui()}else if(a==='diy')SB_diy();try{AU.sfx('pick')}catch(_){}});
 G.querySelector('.sbSl').addEventListener('input',e=>{SB.play=0;SB_go(+e.target.value)});
 const D=document.createElement('div');D.id='sbD';D.innerHTML=`<div class="sbDt"></div><button data-sbd="hint">💡 PLACE IT</button><button data-sbd="watch">▶ WATCH</button><button data-sbd="x">✕</button>`;$('#gbx').appendChild(D);
 D.addEventListener('click',e=>{const b=e.target.closest('[data-sbd]');if(!b)return;e.stopPropagation();const a=b.dataset.sbd;if(a==='hint')SB_hint();else if(a==='watch'){const k=SB_cur();SB_diyEnd(false);SB_open('rides');SB_show(Math.min(k,SB.S.length-1),true)}else SB_diyEnd(false)});
 $('#gbC').addEventListener('wheel',e=>{if(!SB.on)return;e.preventDefault();SB.z=clamp(SB.z*(e.deltaY>0?1.1:.9),.55,1.8)},{passive:false});
 addEventListener('keydown',e=>{if(!SB.on||$('#gbx').hidden)return;const k=e.key;if(k==='ArrowLeft'||k==='ArrowRight'||k===' '||k==='Escape'){e.preventDefault();e.stopPropagation();SB.play=0;
  if(k==='ArrowLeft')SB_go(SB.k-1);else if(k==='ArrowRight')SB_go(SB.k+1);else if(k===' '){SB.play=1;SB_ui()}else SB_close()}},true)}
function SB_call(P){const K=new Map();for(const b of P){const k=b.t+'|'+b.c;K.set(k,(K.get(k)||0)+1)}let h='';
 for(const[k,n]of K){const[t,c]=k.split('|');let u='';try{u=GS_thumb(t,c)||''}catch(e){}h+=`<div class="sbPc"><img src="${u}" alt=""><i>${n}×</i><small>${(GB_PC[t]&&GB_PC[t].n)||t}</small></div>`}return h}
function SB_ui(){const G=$('#sbG');if(!G)return;const n=SB.S.length,cnt=SB.S.slice(0,SB.k+1).reduce((a,s)=>a+s.length,0);
 G.querySelector('.sbNm').textContent=($('#r2Name')&&$('#r2Name').textContent)||'';
 G.querySelector('.sbN').textContent=SB.done?`✔ ${SB.B.length} parts`:`${SB.k+1}/${n}`;
 G.querySelector('.sbCall').innerHTML=SB.done?`<p class="sbOk">✔ BUILT!<small>${SB.B.length} parts · ${n} steps</small></p>`:`<p>STEP ${SB.k+1}<small>parts ${cnt}/${SB.B.length}</small></p>`+SB_call(SB.S[SB.k].map(j=>SB.B[j]));
 G.querySelector('.sbPl').innerHTML=SB.done?'↺ AGAIN':SB.play?'❚❚ PAUSE':'▶ PLAY';G.querySelector('.sbSp').textContent='×'+SB.sp;
 const sl=G.querySelector('.sbSl');sl.max=n;sl.value=SB.k}
// ---------- RIDES card + BUILD ⋯ MORE entry points
GAR_tab=(f=>function(){f();try{const C=$('#g9Col');if(!C||C.dataset.sb)return;C.dataset.sb=1;for(const e of C.querySelectorAll('.g9Ed')){const b=document.createElement('button');b.className='g9Ed sbGo';b.dataset.sbg=e.dataset.ged;b.textContent='▶ GUIDE';e.after(b)}
 C.addEventListener('click',e=>{const t=e.target.closest('[data-sbg]');if(!t)return;e.stopPropagation();const S=GAR_set(t.dataset.sbg);if(GAR_get().sel!==S.id){GAR_select(S.id);gbRender()}SB_open('rides')})}catch(e){console.warn('SB',e)}})(GAR_tab);
{const mo=$('#r2More');if(mo&&!mo.querySelector('[data-r2a="sbg"]'))mo.insertAdjacentHTML('afterbegin','<button class="r2T" data-r2a="sbg"><i>▶</i>BUILD GUIDE</button>');
 const P=$('#gbBkP');if(P)P.addEventListener('click',e=>{const b=e.target.closest('[data-r2a="sbg"]');if(b)setTimeout(()=>SB_open('build'),0)})}
// ---------- BUILD IT YOURSELF: BUILD mode, the current step's missing parts as a pulsing green ghost; a tap within 4 studs snaps the part in
function SB_diy(){if(!SB.on)return;const k=Math.min(SB.k,SB.S.length-1),B=SB.B,S=SB.S;SB.on=0;SB_clearDrop();$('#gbx').classList.remove('sbOn');GB.cam.clearViewOffset();
 SB.bak=JSON.parse(JSON.stringify(GB.d.bricks||[]));SB.b25=typeof B25!=='undefined'?B25.on:null;if(SB.b25!=null)B25.on=0;SB.diy=1;SB.ok=0;
 const keep=[];for(let i=0;i<k;i++)for(const j of S[i])keep.push({...B[j]});GB.d.bricks=keep;SB.from='';gbRender();GB_enter();GB_.undo=[];$('#gbx').classList.add('sbDiy');SB_sync()}
function SB_miss(){const L=GB_list();for(let i=0;i<SB.S.length;i++){const m=SB.S[i].map(j=>SB.B[j]).filter(b=>!L.some(o=>SB_same(o,b)));if(m.length)return{i,m}}return null}
function SB_cur(){const c=SB_miss();SB_cur.done=!c;return c?c.i:SB.S.length}
function SB_sync(){if(!SB.diy||!GB.mesh)return;const host=SB_host();if(SB.gh){SB.gh.parent&&SB.gh.parent.remove(SB.gh);SB.gh.geometry.dispose();SB.gh=null}
 const c=SB_miss(),D=$('#sbD .sbDt');
 if(!c){if(!SB.ok){SB.ok=1;GB.d.bricks=SB.B.map(b=>({...b}));GB_attach(GB.mesh,GB_list(),GB_figGet(),false,!!GB.d.bp);try{AU.sfx('win')}catch(e){try{AU.sfx('pick')}catch(_){}}}
  if(D)D.innerHTML=`<b>🎉 YOU BUILT IT!</b><small>${SB.B.length} parts · tap ✕ to keep it</small>`;return}
 const M=[],L=[];for(const b of c.m)GB_brickGeo(b,M,L);if(M.length||L.length){SB.gh=new THREE.Mesh(mergeGeometries(M.concat(L)),SB.gm);SB.gh.userData.gbG=1;SB.gh.renderOrder=3;host.add(SB.gh)}
 GB_.pc=c.m[0].t;GB_.rot=c.m[0].r%4;
 if(D){let u='';try{u=GS_thumb(c.m[0].t,c.m[0].c)}catch(e){}D.innerHTML=`<img src="${u}" alt=""><b>STEP ${c.i+1}/${SB.S.length}</b><small>place ${c.m.length}× ${(GB_PC[c.m[0].t]||{}).n||''} · tap the green ghost</small>`}}
function SB_target(x,z,t){const c=SB_miss();if(!c)return null;let best=null,bd=1e9;for(const b of c.m){const[w,d]=GB_dims(b),dd=Math.abs(x-(b.x+(w-1)/2))+Math.abs(z-(b.z+(d-1)/2))-(b.t===t?.5:0);if(dd<bd){bd=dd;best=b}}return bd<=4?best:null}
function SB_hint(){const c=SB_miss();if(!c)return;const b=c.m[0];if(GB_add(b.t,b.x,b.z,b.r,b.c)){try{AU.sfx('brick');GS_pop(b)}catch(e){}GB_refresh()}}
GB_cand=(f=>function(hit){const r=f.apply(this,arguments);if(!SB.diy||!hit)return r;const t=SB_target(hit.i,hit.j,GB_.pc);if(t)return{...t,bad:false};return r?{...r,bad:true}:null})(GB_cand);
GB_add=(f=>function(t,x,z,r,c,noUndo){if(!SB.diy)return f.apply(this,arguments);const m=SB_miss();if(!m)return 0;const b=m.m.find(o=>o.t===t&&o.x===x&&o.z===z&&o.r%4===r%4);
 if(!b){GB_msg('Follow the green ghost');try{AU.sfx('bump')}catch(e){}return 0}const add=[{...b}];if(GB_.mir){const w=GB_twin(b),tw=m.m.find(o=>o!==b&&o.t===w.t&&o.x===w.x&&o.z===w.z&&o.y===b.y);if(tw)add.push({...tw})}
 if(!noUndo)GB_snap();GB_list().push(...add);return add.length})(GB_add);
// a tap within 70 px (screen) of a ghost part snaps it in (also when the tap hits empty air above the chassis)
function SB_scr(cx,cy){const c=SB_miss();if(!c||!GB.mesh)return null;const R=$('#gbC').getBoundingClientRect(),host=SB_host();GB_cam();host.updateMatrixWorld(true);let best=null,bd=70;
 for(const b of c.m){const M=[],L=[];try{GB_brickGeo(b,M,L)}catch(e){continue}if(!M.length)continue;const g=mergeGeometries(M);g.computeBoundingBox();const v=g.boundingBox.getCenter(new THREE.Vector3());g.dispose();
  host.localToWorld(v).project(GB.cam);const d=Math.hypot(R.left+(v.x+1)/2*R.width-cx,R.top+(1-v.y)/2*R.height-cy);if(d<bd){bd=d;best=b}}return best}
GB_act=(f=>function(cx,cy,del){if(SB.diy&&!del&&GB_.tool==='add'){const b=SB_scr(cx,cy);if(b){if(typeof GS!=='undefined'){GS.held=null;GS.hit=null}if(GB_add(b.t,b.x,b.z,b.r,b.c)){try{AU.sfx('brick');GS_pop(b)}catch(e){}GB_refresh();try{GS_ui()}catch(e){}}return 1}}return f.apply(this,arguments)})(GB_act);
GB_refresh=(f=>function(){const r=f.apply(this,arguments);try{SB_sync()}catch(e){console.warn('SB',e)}return r})(GB_refresh);
function SB_diyEnd(keep){if(!SB.diy)return;SB.diy=0;$('#gbx').classList.remove('sbDiy');if(SB.gh){SB.gh.parent&&SB.gh.parent.remove(SB.gh);SB.gh.geometry.dispose();SB.gh=null}
 if(SB.b25!=null&&typeof B25!=='undefined')B25.on=SB.b25;if(!(keep||SB.ok))GB.d.bricks=SB.bak;GB_.undo=[];if(GB_.bk)GB_exit();else gbRender()}
GB_exit=(f=>function(){if(SB.diy){SB.diy=0;$('#gbx').classList.remove('sbDiy');if(SB.gh){SB.gh.parent&&SB.gh.parent.remove(SB.gh);SB.gh=null}if(SB.b25!=null&&typeof B25!=='undefined')B25.on=SB.b25;if(!SB.ok)GB.d.bricks=SB.bak;GB_.undo=[]}return f.apply(this,arguments)})(GB_exit);
// SAVE / BACK while the guide or BUILD IT runs: leave it first (restores the ride unless it was finished)
document.addEventListener('click',e=>{if(!(SB.on||SB.diy))return;const t=e.target.closest&&e.target.closest('#gbSave,#gbBack');if(!t)return;if(SB.on){SB.on=0;SB_clearDrop();$('#gbx').classList.remove('sbOn');GB.cam.clearViewOffset();gbRender()}if(SB.diy)SB_diyEnd(false)},true);
{const st=document.createElement('style');st.textContent=`#sbG,#sbD{display:none}#gbx.sbOn>*:not(.gbw):not(#sbG){display:none!important}#gbx.sbOn .gbp,#gbx.sbOn #gbStats,#gbx.sbOn .gbHint,#gbx.sbOn #gsBar,#gbx.sbOn #gsBr{display:none!important}
#gbx.sbOn #sbG{display:block;position:absolute;inset:0;z-index:30;pointer-events:none;font:900 13px system-ui;color:#141413}
#sbG button{pointer-events:auto;min-width:44px;min-height:44px;border:2px solid #141413;border-radius:10px;background:#fff;color:#141413;font:italic 900 13px var(--hud,system-ui);box-shadow:0 3px 0 #141413;cursor:pointer;padding:0 10px}
#sbG button:active{transform:translateY(2px);box-shadow:0 1px 0 #141413}
#sbG .sbTop{position:absolute;left:0;right:0;top:0;height:46px;display:flex;align-items:center;gap:10px;padding:0 calc(8px + env(safe-area-inset-right,0px)) 0 calc(10px + env(safe-area-inset-left,0px));background:rgba(10,18,40,.86);border-bottom:2px solid #141413;color:#fff;pointer-events:auto}
#sbG .sbTop b{font:italic 900 15px var(--hud,system-ui);color:#ffd400;-webkit-text-stroke:.5px #141413;white-space:nowrap}#sbG .sbNm{flex:1;min-width:0;font:800 13px system-ui;color:#cfe3f0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#sbG .sbN{font:900 16px system-ui;color:#fff;background:#e8202a;border:2px solid #141413;border-radius:9px;padding:3px 10px;white-space:nowrap}#sbG .sbTop button{min-height:38px}
#sbG .sbCall{position:absolute;left:calc(6px + env(safe-area-inset-left,0px));top:52px;bottom:66px;width:118px;overflow:auto;display:flex;flex-direction:column;gap:5px;padding:6px;box-sizing:border-box;background:rgba(255,255,255,.94);border:2px solid #141413;border-radius:12px;pointer-events:auto}
#sbG .sbCall p{margin:0;font:italic 900 15px var(--hud,system-ui);display:flex;flex-direction:column}#sbG .sbCall p small{font:700 12px system-ui;color:#4a5468;font-style:normal}#sbG .sbOk{color:#0a8a3a}
#sbG .sbPc{position:relative;display:grid;grid-template-columns:44px 1fr;align-items:center;column-gap:4px;background:#e9eef5;border-radius:8px;padding:2px 4px}#sbG .sbPc img{width:44px;height:44px;grid-row:span 2}
#sbG .sbPc i{font:900 15px system-ui;font-style:normal}#sbG .sbPc small{font:700 12px/1.1 system-ui;color:#4a5468;overflow-wrap:anywhere}body:has(#gbx.sbOn) #tuG{display:none!important}
#sbG .sbBar{position:absolute;left:0;right:0;bottom:0;height:60px;display:flex;align-items:center;gap:8px;padding:0 calc(8px + env(safe-area-inset-right,0px)) env(safe-area-inset-bottom,0px) calc(8px + env(safe-area-inset-left,0px));background:rgba(10,18,40,.86);border-top:2px solid #141413;pointer-events:auto;box-sizing:border-box}
#sbG .sbBar button{height:46px;font-size:15px}#sbG .sbPl{min-width:104px}#sbG .sbDiy{background:linear-gradient(90deg,#ffd12c,#ff7a1c)}
#sbG .sbSl{flex:1;min-width:60px;height:44px;margin:0;accent-color:#ffd400;pointer-events:auto}
#gbx.sbDiy #sbD{display:flex;position:absolute;z-index:30;left:calc(var(--r2rw,72px) + 8px);top:calc(var(--r2hh,52px) + 6px);max-width:min(520px,calc(100% - var(--r2rw,72px) - 140px));align-items:center;gap:6px;padding:3px 4px 3px 8px;background:rgba(255,255,255,.95);border:2px solid #141413;border-radius:12px;box-shadow:0 3px 0 #141413;color:#141413}
#sbD .sbDt{display:grid;grid-template-columns:auto 1fr;column-gap:6px;align-items:center;min-width:0}#sbD .sbDt img{width:40px;height:40px;grid-row:span 2}#sbD .sbDt b{font:italic 900 14px var(--hud,system-ui)}#sbD .sbDt small{font:700 12px system-ui;color:#4a5468;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#sbD button{flex:none;min-width:44px;min-height:44px;border:2px solid #141413;border-radius:10px;background:#fff;color:#141413;font:italic 900 12px var(--hud,system-ui);cursor:pointer;padding:0 8px}#sbD [data-sbd="hint"]{background:#ffd400}
#gbx.r2 #g9Col .g9Ed.sbGo{background:#fff}#g9Col .g9Card .g9Ed{margin-right:4px}
@media (min-height:501px) and (min-width:900px){#sbG .sbCall{width:150px}#sbG .sbPc{grid-template-columns:56px 1fr}#sbG .sbPc img{width:56px;height:56px}}`;document.head.appendChild(st)}
gbOpen=(f=>function(){if(SB.on||SB.diy){SB.on=0;SB.diy=0;const X=$('#gbx');X.classList.remove('sbOn','sbDiy');if(SB.b25!=null&&typeof B25!=='undefined')B25.on=SB.b25;}return f.apply(this,arguments)})(gbOpen);
setInterval(()=>{if(SB.diy){const g=SB.gh;if(g)SB.gm.opacity=.35+.25*Math.sin(performance.now()/200)}},50);
window.__sb={scr:SB_scr,S:SB,steps:SB_steps,open:SB_open,close:SB_close,go:SB_go,diy:SB_diy,hint:SB_hint,miss:()=>{const c=SB_miss();return c&&{i:c.i,n:c.m.length}}};
{const c=$('#credBox');if(c&&!c.querySelector('.sbCred'))c.insertAdjacentHTML('beforeend','<p class="sbCred"><b>Build guide</b>: step idea after the LDraw file format (ldraw.org) and three.js LDrawLoader (MIT) · no LDraw parts included</p>')}
