// ---- GZ (garage zoom + pick, Alex 2026-10-13: "include a zoom in/out and more builder functionalities for garage").
// 1) ZOOM in every garage mode (RIDES / BUILD / PAINT / PERKS / DRIVER): − ⤢ + buttons at the stage's left edge (BUILD: top, clear of the palette), pinch with two fingers,
//    mouse wheel, keys + / − / 0. It is the camera's own zoom on top of the shell's auto-framing (R2_frame), so every view (TOP / SIDE / 3D,
//    build guide, phone layout) and tap-picking stay correct. ⤢ = back to the framed view. BUILD and the stage keep their own zoom (×0.6 … ×3.5).
// 2) 💧 PICK (⋯ MORE, key I): tap a placed part to copy it: the same part, turn and colour become the part you place next.
//    From PAINT ONE it copies only the colour and goes back to painting.
const GZ={k:{b:1,s:1},base:1,last:-1,ptr:new Map(),d0:0,el:null,f:0,prev:'add'};
const GZ_md=()=>GB_.bk?'b':'s',GZ_MIN=.6,GZ_MAX=3.5;
function GZ_set(z,md=GZ_md()){GZ.k[md]=clamp(z,GZ_MIN,GZ_MAX);GZ_lab()}
function GZ_step(dir){GZ_set(GZ.k[GZ_md()]*(dir>0?1.25:.8));try{AU.sfx('pick')}catch(e){}}
function GZ_fit(){GZ_set(1);if(GB_.bk)GB_.dist=clamp(GB_.dist,7,26);try{AU.sfx('pick')}catch(e){}}
function GZ_lab(){const e=GZ.el&&GZ.el.querySelector('[data-gz="0"]');if(e)e.textContent=Math.abs(GZ.k[GZ_md()]-1)<.02?'⤢':'×'+GZ.k[GZ_md()].toFixed(1)}
R2_frame=(f=>function(C,bk){f.apply(this,arguments);if(!C)return;if(C.zoom!==GZ.last)GZ.base=C.zoom;const z=GZ.base*GZ.k[bk?'b':'s'];
 if(C.zoom!==z){C.zoom=z;C.updateProjectionMatrix()}GZ.last=C.zoom})(R2_frame);
// buttons: one row (− ⤢ +) at the bottom-left of the free stage area, 44 px tap targets
function GZ_mk(){if(GZ.el||!$('#gbx'))return;const d=document.createElement('div');d.id='gzBar';
 d.innerHTML='<button class="r2T" data-gz="-1" aria-label="Zoom out">−</button><button class="r2T" data-gz="0" aria-label="Fit view">⤢</button><button class="r2T" data-gz="1" aria-label="Zoom in">+</button>';
 d.style.cssText='position:fixed;z-index:30;display:flex;gap:6px;pointer-events:auto';
 d.addEventListener('pointerdown',e=>e.stopPropagation(),true);
 d.addEventListener('click',e=>{const b=e.target.closest('[data-gz]');if(!b)return;e.stopPropagation();const v=+b.dataset.gz;if(v)GZ_step(v);else GZ_fit()},true);
 $('#gbx').appendChild(d);GZ.el=d;GZ_lab()}
function GZ_place(){const d=GZ.el;if(!d)return;const c=$('#gbC'),A=(typeof R2!=='undefined'&&R2.area)||null;if(!c||!A||$('#gbx').hidden||(typeof SB!=='undefined'&&SB.on)){d.style.display='none';return}
 const r=c.getBoundingClientRect();d.style.display='flex';d.style.left=Math.round(r.left+A.l+8)+'px';d.style.top=Math.round(r.top+(GB_.bk?A.t+8:A.b-44-30))+'px';GZ_lab()}
gbLoop=(f=>function(){if(!$('#gbx').hidden){GZ_mk();if(++GZ.f%10===1)GZ_place()}else if(GZ.el)GZ.el.style.display='none';return f.apply(this,arguments)})(gbLoop);
// pinch + wheel on the stage outside BUILD (BUILD already pinches / wheels the camera distance)
{const v=document;const cv=e=>e.target&&e.target.id==='gbC'&&!GB_.bk;
 v.addEventListener('pointerdown',e=>{if(!cv(e))return;GZ.ptr.set(e.pointerId,{x:e.clientX,y:e.clientY});GZ.d0=0},true);
 v.addEventListener('pointermove',e=>{const q=GZ.ptr.get(e.pointerId);if(!q)return;q.x=e.clientX;q.y=e.clientY;if(GZ.ptr.size!==2)return;const[A,B]=[...GZ.ptr.values()],d=Math.hypot(A.x-B.x,A.y-B.y);
  if(GZ.d0>10&&d>10)GZ_set(GZ.k.s*d/GZ.d0,'s');GZ.d0=d},true);
 const up=e=>{GZ.ptr.delete(e.pointerId);GZ.d0=0};v.addEventListener('pointerup',up,true);v.addEventListener('pointercancel',up,true);
 v.addEventListener('wheel',e=>{if(!cv(e))return;e.preventDefault();GZ_set(GZ.k.s*(1-e.deltaY*.001),'s')},{passive:false,capture:true});
 addEventListener('keydown',e=>{if($('#gbx').hidden||(e.target&&/INPUT|TEXTAREA/.test(e.target.tagName)))return;const k=e.key;
  if(k==='+'||k==='=')GZ_step(1);else if(k==='-'||k==='_')GZ_step(-1);else if(k==='0')GZ_fit();else if((k==='i'||k==='I')&&GB_.bk)GZ_pickOn();else return;e.preventDefault();e.stopImmediatePropagation()},true)}
// 💧 PICK
function GZ_pickOn(){if(!GB_.bk)return;if(GB_.tool==='pick'){GB_.tool=GZ.prev;GB_ui();GZ_ui();return}GZ.prev=GB_.tool==='paint'?'paint':'add';GB_.tool='pick';GB_ghostSet(null);
 try{if(GS.held){GS.held=null}}catch(e){}GS_tip(GZ.prev==='paint'?'💧 Tap a part to copy its colour':'💧 Tap a part to copy it (part, turn and colour)');GB_ui();GZ_ui()}
function GZ_ui(){const b=$('#r2More [data-gzm="pick"]');if(b)b.classList.toggle('on',GB_.tool==='pick')}
GB_act=(f=>function(cx,cy,del){if(!GB_.bk||del||GB_.tool!=='pick')return f.apply(this,arguments);const h=GB_pick(cx,cy),o=h&&h.brick;
 if(!o){GS_tip('💧 Tap a part of the car');return 0}GB_.col=o.c;
 if(GZ.prev==='paint'){GB_.tool='paint';GS_tip('💧 Colour copied · tap parts to paint')}
 else{GB_.pc=o.t;GB_.rot=o.r||0;GB_.tool='add';const P=GB_PC[o.t];GS_tip('💧 Copied '+((P&&P.n)||'part')+' · tap where it goes')}
 try{AU.sfx('pick')}catch(e){}GB_ui();GZ_ui();try{G13_ui()}catch(e){}return 1})(GB_act);
GB_exit=(f=>function(){if(GB_.tool==='pick')GB_.tool='add';return f.apply(this,arguments)})(GB_exit);
GB_ui=(f=>function(){const r=f.apply(this,arguments);const mo=$('#r2More');if(mo&&!mo.querySelector('[data-gzm]')){mo.insertAdjacentHTML('afterbegin','<button class="r2T" data-gzm="pick"><i>💧</i>PICK</button>');
 mo.addEventListener('click',e=>{if(!e.target.closest('[data-gzm]'))return;e.stopPropagation();try{R2_pop(null)}catch(_){}GZ_pickOn()},true)}GZ_ui();return r})(GB_ui);
window.__gz={S:GZ,set:GZ_set,step:GZ_step,fit:GZ_fit,pick:GZ_pickOn,st:()=>({bk:GB_.bk,tool:GB_.tool,pc:GB_.pc,col:GB_.col,rot:GB_.rot,zoom:GB.cam&&GB.cam.zoom}),
 // screen point of the build's centre (tests tap it)
 mid:()=>{if(!GB.mesh)return null;GB_cam();const c=new THREE.Box3().setFromObject(GB.mesh).getCenter(new THREE.Vector3()).project(GB.cam),r=$('#gbC').getBoundingClientRect();return[r.left+(c.x+1)/2*r.width,r.top+(1-c.y)/2*r.height]}};
