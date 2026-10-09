// ---- PA (v88y garage): BUILD CANVAS + MY PARTS + TILES. Alex (2026-10-09): "since we have now groups we can work in garage in parts and then
// append them. but we need an empty big canvas, maybe investigate also to include more tiles".
// 1) CANVAS: NEW → 🧩 BUILD CANVAS (or MY PARTS → the CANVAS card): an empty 32×32-stud baseplate with its own bricks (localStorage mho_cv),
//    its own undo and group names (mho_cvn). One finger orbits, two fingers pinch-zoom + pan (PC: wheel zooms, right/middle-drag or arrow keys pan).
//    ← CAR (badge, or the card) goes back to the car; DONE / SAVE & DRIVE / BACK leave the canvas first, so the car is never overwritten.
// 2) PARTS: ⛓ GROUPS → a group → 💾 SAVE PART stores it as a named sub-assembly (mho_parts, newest first, max 30). The MY PARTS chip lists them;
//    tap one to APPEND it to the car (or the canvas): it is carried like a COPY (tap where it goes, ⟳ ROTATE, ▲▼ STEP, ✔ PLACE), on the stud grid.
//    With ⇋ MIRROR on (default) a part off the centre line gets its mirror twin on the other side. Placed, each side is a named group
//    (MOVE / COPY / UNGROUP as usual). 🧩 TO CANVAS (group row) copies a group of the car onto the canvas. Long-press a part card to delete it.
// 3) TILES: real LEGO tiles at true proportions (stud 8 mm = GB_U, plate/tile 3.2 mm = GB_PH); sources in docs/research/TILES_88y.md.
const PA={K:'mho_parts',KC:'mho_cv',KN:'mho_cvn',on:0,st:null,px:0,pz:0,pre:null,th:new Map(),delId:null,lp:null,lpT:0,mir:null,pg:null};
const PA_N=16,PA_CAT='My parts',PA_K=1.65;
CK.push('mho_parts','mho_cv','mho_cvn');
const PA_get=()=>{try{const a=JSON.parse(localStorage.getItem(PA.K)||'[]');return Array.isArray(a)?a.filter(p=>p&&Array.isArray(p.b)&&p.b.length):[]}catch(e){return[]}};
const PA_put=a=>{try{localStorage.setItem(PA.K,JSON.stringify(a));return 1}catch(e){GS_tip('Storage full · delete a part first');return 0}};
const PA_cvGet=()=>{try{const o=JSON.parse(localStorage.getItem(PA.KC)||'{}');return Array.isArray(o.b)?o.b.filter(b=>b&&GB_PC[b.t]):[]}catch(e){return[]}};
const PA_cvPut=b=>{try{localStorage.setItem(PA.KC,JSON.stringify({b}))}catch(e){}};
const PA_nm=()=>{try{return JSON.parse(localStorage.getItem(PA.KN)||'{}')||{}}catch(e){return{}}};
const PA_h=b=>(GB_PC[b.t]||{h:1}).h;
const PA_ov3=(a,b)=>SL_ov(a,b)&&a.y<b.y+PA_h(b)&&a.y+PA_h(a)>b.y;
// a brick list → a part: offsets from its lowest/front-left corner, no group ids
function PA_norm(G){const mx=Math.min(...G.map(b=>b.x)),mz=Math.min(...G.map(b=>b.z)),my=Math.min(...G.map(b=>b.y));
 return G.map(o=>({t:o.t,x:o.x-mx,z:o.z-mz,y:o.y-my,r:o.r||0,m:o.m?1:0,c:o.c}))}

// ---------- TILES (Tiles tab): new parts + geometry; existing tile-like parts move into the tab
Object.assign(GB_PC,{t18:{n:'Tile 1×8',w:1,d:8,h:1,g:'T',ic:'▭'},t23:{n:'Tile 2×3',w:2,d:3,h:1,g:'T',ic:'▭'},t26:{n:'Tile 2×6',w:2,d:6,h:1,g:'T',ic:'▭'},
 rt22:{n:'Round 2×2',w:2,d:2,h:1,ic:'●'},qt11:{n:'Quarter 1×1',w:1,d:1,h:1,ic:'◜'},mac:{n:'Macaroni',w:2,d:2,h:1,ic:'◠'},
 st12:{n:'Slope30 1×2',w:2,d:1,h:2,ic:'◢'},cv13:{n:'Curve 1×3',w:1,d:3,h:3,g:'C',ic:'◠'},
 prH:{n:'Headlight',w:1,d:1,h:1,ic:'◐'},prN:{n:'No. plate',w:2,d:1,h:1,ic:'▭'},prG:{n:'Gauge',w:1,d:1,h:1,ic:'◷'}});
const PA_TILES=['t11','tile','t13','t14','t16','t18','t22','t23','t24','t26','t44','rt','rt22','qt11','qt','mac','st12','cv13','grl','jmp','prH','prN','prG'];
for(const k of PA_TILES)if(GB_PC[k])GB_PC[k].cat='Tiles';
Object.assign(GB_PC.tile,{n:'Tile 1×2'});Object.assign(GB_PC.rt,{n:'Round 1×1'});Object.assign(GB_PC.qt,{n:'Quarter 2×2'});Object.assign(GB_PC.grl,{n:'Grille 1×2'});Object.assign(GB_PC.jmp,{n:'Jumper 1×2'});
GB_piece=(f=>function(t,c,M,L){const P=GB_PC[t];if(!P||!/^(rt22|qt11|mac|st12|prH|prN|prG)$/.test(t))return f(t,c,M,L);
 const W=P.w*GB_U,D=P.d*GB_U,H=P.h*GB_PH,g=.008,col=GB_BC[c]||c,x0=-W/2+g,x1=W/2-g,z0=-D/2+g,z1=D/2-g,T=H+.004;
 const arc=(cx,cz,r,a0,a1,n)=>{const o=[];for(let i=0;i<=n;i++){const a=a0+(a1-a0)*i/n;o.push([cx+Math.cos(a)*r,cz+Math.sin(a)*r])}return o};
 const disc=(r,x,z,cl,k,y=T)=>{const d=new THREE.CircleGeometry(r,18);d.rotateX(-Math.PI/2);d.translate(x,y,z);return GB_col(d,cl,k)};
 if(t==='rt22')M.push(GB_cyl(W/2-g,H,0,0,0,col,28));
 // quarter circle, centre on the back-right corner (rotate / mirror for the others)
 else if(t==='qt11')M.push(CR_top([[x1,z1]].concat(arc(x1,z1,W-2*g,-Math.PI/2,-Math.PI,12)),0,H,col));
 // macaroni: quarter ring, outer radius 2 studs, inner 1 stud, centre on the back-right corner
 else if(t==='mac')M.push(CR_top(arc(x1,z1,W-2*g,-Math.PI/2,-Math.PI,16).concat(arc(x1,z1,GB_U-g,-Math.PI,-Math.PI/2,10)),0,H,col));
 // slope 30 1×2 (85984): 2 wide, the slope runs over its 1-stud depth from a 1.6 mm lip at the front (-z) to full height at the back; no studs
 else if(t==='st12')M.push(CR_side([[z1,0],[z1,H],[z1-.08,H],[z0,H*.25],[z0,0]],x0,x1,col));
 // printed 1×1 round headlight (98138pr0005)
 else if(t==='prH'){M.push(GB_cyl(W/2-g,H,0,0,0,'#f4f4f4',20));M.push(disc(.22,0,0,'#c9ced6',1));L.push(disc(.17,0,0,'#fff4cf',2.4,T+.002))}
 // printed 1×2 number plate (3069bpr9978): white, a blue strip on the left, 6 black characters
 else if(t==='prN'){M.push(CR_bb(x0,x1,0,H,z0,z1,'#f4f4f4'));M.push(GB_box(x0+.03,x0+.13,H,T+.002,z0+.06,z1-.06,'#0055bf'));
  for(let i=0;i<6;i++){const w=(W-.3)/6,a=x0+.18+i*w;M.push(GB_box(a+.025,a+w-.025,T,T+.003,-.13,.13,'#1b1d22'))}}
 // printed 1×1 round gauge (98138pr0430): black ring, white dial, ticks, red needle
 else if(t==='prG'){const R=W/2-g;M.push(GB_cyl(R,H,0,0,0,'#1b1d22',20));M.push(disc(R-.05,0,0,'#f4f4f4',1));
  for(let i=0;i<7;i++){const a=Math.PI*(.75+i*1.5/6),r=R-.1,tk=GB_box(-.01,.01,T+.001,T+.003,-.035,.035,i>4?'#d01712':'#1b1d22');tk.rotateY(Math.PI/2-a);tk.translate(Math.cos(a)*r,0,Math.sin(a)*r);M.push(tk)}
  const nd=GB_box(-.012,.012,T+.003,T+.006,-.015,R-.12,'#ff3b1a');nd.rotateY(.7);L.push(GB_col(nd,'#ff3b1a',1.6));M.push(GB_cyl(.035,.01,0,T+.003,0,'#1b1d22',10))}})(GB_piece);
// the palette was built before this module: add the new tiles and put the Tiles tab in a sensible order (1×1 … 2×6, round, slopes, printed)
{const S=$('#gbBkPc');if(S){for(const k of PA_TILES){const P=GB_PC[k];if(!P)continue;let b=S.querySelector(`.gbPc[data-p="${k}"]`);
  if(!b){b=document.createElement('button');b.className='gbPc';b.dataset.p=k;b.innerHTML=`<i>${P.ic}</i>${P.n}`}b.dataset.ct='Tiles';b.dataset.n=P.n;b.style.display=GB_.ct==='Tiles'?'':'none';S.appendChild(b)}}}
// a part card is not a catalogue part: no 3D catalogue thumbnail for it
GS_thumb=(f=>function(t){if(!t||!GB_PC[t])return null;return f.apply(this,arguments)})(GS_thumb);

// ---------- CANVAS: a separate workspace in the builder
function PA_plate(){if(PA.pg)return PA.pg;const A=[],u=GB_U,N=PA_N,G='#4b9f4a',G2='#5bb05a';A.push(GB_box(-N*u,N*u,-.2,0,-N*u,N*u,G,.92));
 for(let i=-N;i<N;i++)for(let j=-N;j<N;j++)A.push(GB_cyl(.17,.1,(i+.5)*u,0,(j+.5)*u,(i===-1||i===0)?'#7cc47a':G2,8));
 // a yellow line marks the front, the centre line helps mirror builds
 A.push(GB_box(-N*u,N*u,-.19,.004,-N*u-.12,-N*u,'#ffd12c'));return PA.pg=mergeGeometries(A)}
GB_plate=(f=>function(){return PA.on?PA_plate():f.apply(this,arguments)})(GB_plate);
GB_scanBase=(f=>function(){if(!PA.on)return f.apply(this,arguments);if(GB.mesh)GB.mesh.updateMatrixWorld(true);GB_.hull=[];const B={};
 for(let i=GB_N0;i<=GB_N1;i++)for(let j=GB_Z0;j<=GB_Z1;j++)B[i+','+j]=0;GB_.base=B})(GB_scanBase);
GB_gridMesh=(f=>function(){if(!PA.on)return f.apply(this,arguments);const U=GB.mesh&&GB.mesh.userData;if(U&&GB_.grid){(U.carG||U.m).remove(GB_.grid);GB_.grid.geometry.dispose();GB_.grid=null}})(GB_gridMesh);
// no seated driver on the canvas
GB_attach=(f=>function(g,bricks,fig,cache,bp){const U=g&&g.userData;if(U)for(const o of U.gbM||[])if(PA.pg&&o.geometry===PA.pg)o.userData.gbc=1;if(PA.on&&GB.mesh&&g===GB.mesh)fig=null;return f.call(this,g,bricks,fig,cache,bp)})(GB_attach);
// the plate geometry is shared (GB_attach above never disposes it); the canvas saves on every change
GB_refresh=(f=>function(){const r=f.apply(this,arguments);if(PA.on&&GB.d&&GB.d.cv)PA_cvPut(GB_list());return r})(GB_refresh);
// group names on the canvas are its own (not the car's)
GX_names=(f=>function(){return PA.on?PA_nm():f.apply(this,arguments)})(GX_names);
GX_setName=(f=>function(g,n){if(!PA.on)return f.apply(this,arguments);const a=PA_nm();if(n==null)delete a[g];else a[g]=String(n).slice(0,24);try{localStorage.setItem(PA.KN,JSON.stringify(a))}catch(e){}})(GX_setName);
function PA_redo0(){try{if(typeof G8!=='undefined'&&G8.redo)G8.redo.length=0}catch(e){}}
function PA_enter(){if(PA.on||!GB.mesh||!GB.d)return 0;if(!GB_.bk)GB_enter();if(SL.carry)SL_cancel();if(GS.held)GS_drop();SL_set([]);
 PA.st={d:GB.d,undo:GB_.undo,cam:[GB_.yaw,GB_.pit,GB_.dist],b:[GB_N0,GB_N1,GB_Z0,GB_Z1],hid:[...GX.hid],L:typeof B25!=='undefined'?B25.L:null};PA.on=1;PA_redo0();
 GX.hid.clear();GX.open=0;GX.act=0;GX.ren=0;GB_N0=-PA_N;GB_N1=PA_N-1;GB_Z0=-PA_N;GB_Z1=PA_N-1;
 GB.d=Object.assign({},PA.st.d,{bricks:PA_cvGet(),bp:1,cv:1});GB_.undo=[];PA.px=0;PA.pz=0;
 GB_scanBase();GB_gridMesh();GB_refresh();GB_.yaw=Math.PI*.78;GB_.pit=.7;GB_.dist=12;GB_.tool='add';try{B25_set(0)}catch(e){}
 GX_sfx('brick');GS_tip('🧩 CANVAS · build here, then ⛓ GROUP → 💾 SAVE PART');PA_ui();PA_cards(1);return 1}
function PA_exit(){if(!PA.on)return 0;if(SL.carry)SL_cancel();if(GS.held)GS_drop();SL_set([]);if(GB.d&&GB.d.cv)PA_cvPut(GB_list());const S=PA.st;
 PA.on=0;PA.st=null;PA_redo0();[GB_N0,GB_N1,GB_Z0,GB_Z1]=S.b;GB.d=S.d;GB_.undo=S.undo;[GB_.yaw,GB_.pit,GB_.dist]=S.cam;PA.px=0;PA.pz=0;
 GX.hid.clear();for(const g of S.hid)GX.hid.add(g);GX.open=0;GX.act=0;GX.ren=0;
 if(GB.mesh){GB_refresh();GB_scanBase();GB_gridMesh();GB_refresh();try{if(S.L!=null)B25_set(S.L)}catch(e){}}PA_ui();PA_cards(1);return 1}
GB_exit=(f=>function(){if(PA.on)PA_exit();return f.apply(this,arguments)})(GB_exit);
gbClose=(f=>function(){if(PA.on)PA_exit();return f.apply(this,arguments)})(gbClose);
GNB_new=(f=>function(){if(PA.on)PA_exit();return f.apply(this,arguments)})(GNB_new);
GB_enter=(f=>function(){const r=f.apply(this,arguments);PA_ui();return r})(GB_enter);
// camera: further out on the canvas (zoom range ×1.65) and a pan target
GB_cam=(f=>function(){if(!PA.on)return f.apply(this,arguments);const d=GB_.dist;GB_.dist=d*PA_K;try{f.apply(this,arguments)}finally{GB_.dist=d}
 const C=GB.cam;C.position.x+=PA.px;C.position.z+=PA.pz;C.updateMatrixWorld()})(GB_cam);
function PA_pan(dx,dy){const C=GB.cam,cvs=$('#gbC');if(!C||!cvs)return;const d=GB_.dist*PA_K*1.3,k=d*2*Math.tan(C.fov*Math.PI/360)/Math.max(200,cvs.clientHeight),
 s=Math.sin(GB_.yaw),c=Math.cos(GB_.yaw),sp=1/Math.max(.45,Math.sin(GB_.pit));let lim=PA_N*GB_U;try{const v=new THREE.Vector3();GB.mesh.userData.m.getWorldScale(v);lim*=v.x}catch(e){}
 PA.px=clamp(PA.px-c*dx*k-s*dy*k*sp,-lim,lim);PA.pz=clamp(PA.pz+s*dx*k-c*dy*k*sp,-lim,lim)}
{const v=$('#gbx .gbv'),cvs=$('#gbC'),P=new Map();
 addEventListener('pointermove',()=>{if(PA.on&&GB_.bk)PA.pre=[GB_.yaw,GB_.pit]},true);
 v.addEventListener('pointerdown',e=>{if(!PA.on||!GB_.bk||e.target!==cvs)return;P.set(e.pointerId,{x:e.clientX,y:e.clientY,b:e.button})},true);
 v.addEventListener('pointermove',e=>{const q=P.get(e.pointerId);if(!q||!PA.on)return;
  if(P.size>=2){const A=[...P.values()].slice(0,2),m0=[(A[0].x+A[1].x)/2,(A[0].y+A[1].y)/2];q.x=e.clientX;q.y=e.clientY;const m1=[(A[0].x+A[1].x)/2,(A[0].y+A[1].y)/2];
   if(PA.pre){GB_.yaw=PA.pre[0];GB_.pit=PA.pre[1]}PA_pan(m1[0]-m0[0],m1[1]-m0[1])}
  else if(q.b===1||q.b===2){if(PA.pre){GB_.yaw=PA.pre[0];GB_.pit=PA.pre[1]}PA_pan(e.clientX-q.x,e.clientY-q.y);q.x=e.clientX;q.y=e.clientY}
  else{q.x=e.clientX;q.y=e.clientY}},true);
 for(const k of['pointerup','pointercancel'])v.addEventListener(k,e=>P.delete(e.pointerId),true);
 addEventListener('keydown',e=>{if(!PA.on||!GB_.bk||$('#gbx').hidden||(e.target&&e.target.tagName==='INPUT'))return;const m={ArrowLeft:[40,0],ArrowRight:[-40,0],ArrowUp:[0,40],ArrowDown:[0,-40]}[e.code];
  if(!m)return;e.preventDefault();PA_pan(m[0],m[1])},true)}

// ---------- the canvas badge (← CAR) and the NEW picker entry
function PA_ui(){const X=$('#gbx');if(!X)return;let E=$('#paCvB');if(!E){const v=$('#gbx .gbv');if(!v)return;E=document.createElement('div');E.id='paCvB';
  E.innerHTML='<b>🧩 CANVAS 32×32</b><button data-pa="back"><i>←</i>CAR</button>';v.appendChild(E);E.addEventListener('pointerdown',e=>e.stopPropagation());
  E.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;e.stopPropagation();GX_sfx('pick');PA_exit();GS_tip('Back to your car · MY PARTS has your parts')})}
 const busy=(typeof SL!=='undefined'&&SL.carry)||GS.held;E.hidden=!(PA.on&&GB_.bk&&!X.hidden)||!!busy;X.classList.toggle('paOn',!!(PA.on&&GB_.bk));
 // the held-part pad (#gsBar) and the selection bar (#slBar) own the left column: the palette (chips + tiles) starts right of them (review v88y)
 let pr=0;if(GB_.bk&&!X.hidden)for(const id of['gsBar','slBar']){const B=document.getElementById(id);if(B&&!B.hidden&&B.offsetParent){const r=B.getBoundingClientRect();if(r.width)pr=Math.max(pr,r.right-X.getBoundingClientRect().left)}}
 if(pr){const v=Math.round(pr+6)+'px';if(X.style.getPropertyValue('--paL')!==v)X.style.setProperty('--paL',v)}if(X.classList.contains('paPad')!==!!pr){X.classList.toggle('paPad',!!pr);try{R2.area=null}catch(e){}}document.body.classList.toggle('paOn',!!(PA.on&&GB_.bk&&!X.hidden))}
GS_ui=(f=>function(){const r=f.apply(this,arguments);PA_ui();return r})(GS_ui);
// the selection bar's MAKE GROUP label was clipped at 852×393: GROUP (the ⛓ icon stays)
SL_ui=(f=>function(){const r=f.apply(this,arguments);const g=$('#slBar [data-s="grp"] span');if(g&&g.textContent==='MAKE GROUP')g.textContent='GROUP';PA_ui();return r})(SL_ui);
GNB_pick=(f=>function(){const r=f.apply(this,arguments);const R=$('#gnbP .gnbR');if(R&&!R.querySelector('[data-pa]')){const b=document.createElement('button');b.dataset.pa='cv';
  b.innerHTML='<i>🧩</i><b>BUILD CANVAS</b><small>empty 32×32 plate · build parts</small>';b.addEventListener('click',()=>{setTimeout(PA_enter,0)});R.appendChild(b)}return r})(GNB_pick);

// ---------- MY PARTS: save a group, list, append, copy to the canvas
function PA_save(g){const G=GX_of(g);if(!G.length)return null;const nm=GX_name(g),A=PA_get();let n=nm,i=2;while(A.some(p=>p.n===n))n=nm+' '+i++;
 const p={id:'p'+Date.now().toString(36)+Math.floor(Math.random()*99),n,b:PA_norm(G),ts:Date.now()};A.unshift(p);if(A.length>30)A.length=30;if(!PA_put(A))return null;
 GX_sfx('brick');GS_tip('💾 Saved to MY PARTS · '+n+' ('+G.length+' parts)');PA_cards(1);return p.id}
function PA_toCv(g){const G=GX_of(g);if(!G.length)return 0;const B=PA_norm(G),C=PA_cvGet(),nm=GX_name(g);const R=[];for(let oz=-PA_N;oz<PA_N;oz++)for(let ox=-PA_N;ox<PA_N;ox++)R.push([ox,oz]);
 R.sort((a,b)=>Math.hypot(a[0]+2,a[1]+2)-Math.hypot(b[0]+2,b[1]+2));
 for(const[ox,oz]of R){const T=B.map(o=>({...o,x:o.x+ox,z:o.z+oz}));if(!T.every(o=>{const[w,d]=GB_dims(o);return o.x+w<=PA_N&&o.z+d<=PA_N}))continue;if(T.some(o=>C.some(c=>PA_ov3(o,c))))continue;
  if(C.length+T.length>GB_MAX)break;const ng=1+Math.max(0,...C.map(o=>o.g||0));for(const o of T){o.g=ng;C.push(o)}PA_cvPut(C);const a=PA_nm();a[ng]=String(nm).slice(0,24);try{localStorage.setItem(PA.KN,JSON.stringify(a))}catch(e){}
  GX_sfx('brick');GS_tip('🧩 '+nm+' copied to the canvas · MY PARTS → CANVAS');return 1}
 GX_sfx('bump');GS_tip('No room on the canvas');return 0}
function PA_del(id){const A=PA_get().filter(p=>p.id!==id);PA_put(A);PA.th.delete(id);PA.delId=null;GX_sfx('bump');GS_tip('Part deleted');PA_cards(1)}
function PA_append(id){const p=PA_get().find(o=>o.id===id);if(!p||!GB_.bk)return 0;if(GS.held)GS_drop();if(SL.carry)SL_cancel();SL_set([]);GX.open=0;
 const B=p.b.filter(b=>GB_PC[b.t]).map(b=>({...b}));if(!B.length)return 0;if(GB_list().length+B.length>GB_MAX){GB_msg('Brick budget full · '+GB_MAX);GX_sfx('bump');return 0}
 const A=B[0],W=Math.max(...B.map(b=>b.x+GB_dims(b)[0])),D=Math.max(...B.map(b=>b.z+GB_dims(b)[1]));
 SL.carry={parts:B.map(o=>({...o,dx:o.x-A.x,dz:o.z-A.z,dy:o.y-A.y})),copy:1,snap:JSON.stringify(GB_list()),x:0,z:0,y:0,bad:0,ap:p.id,gxN:p.n};PA.mir=GB_.mir;
 SL_fitAt(A.x-Math.floor(W/2),A.z-Math.floor(D/2),null);PA_lay();GX_sfx('pick');GS_tip(p.n+' · tap where it goes, ⟳ turns it, ✔ PLACE'+(GB_.mir?' · ⇋ mirror on':''));SL_ui();GX_ui();return 1}
// the layer view follows the carried part, so its ghost is never hidden in the see-through layers above the active one (review v88y)
function PA_lay(){try{const C=SL.carry;if(C&&B25.on&&B25.L!=null&&C.y>B25.L)B25_set(C.y)}catch(e){}}
// mirror twins of an appended part (only when it sits off the centre line and the other side has room)
SL_fitAt=(f=>function(x,z,y){const C=SL.carry;if(!C||!C.ap)return f.apply(this,arguments);C.parts=C.parts.filter(p=>!p.tw);const r=f.apply(this,arguments);PA_twins();PA_lay();return r})(SL_fitAt);
function PA_twins(){const C=SL.carry;if(!C)return;C.parts=C.parts.filter(p=>!p.tw);C.tw=0;if(GB_.mir){const B=SL_at(C,C.x,C.z,C.y),T=B.map(GB_twin),L=GB_list();
  if(!T.some(w=>B.some(o=>PA_ov3(w,o)))&&!T.some(w=>SL_clash(w,L))&&L.length+B.length*2<=GB_MAX){for(const w of T)C.parts.push({t:w.t,r:w.r,m:w.m,c:w.c,tw:1,dx:w.x-C.x,dz:w.z-C.z,dy:w.y-C.y});C.tw=1}}
 C.bad=!SL_ok(SL_at(C,C.x,C.z,C.y));SL_ghost()}
SL_place=(f=>function(){const C=SL.carry,tw=C&&C.ap?C.parts.map(p=>!!p.tw):null,r=f.apply(this,arguments);
 if(r&&tw){const S=SL.sel.slice(),T=S.filter((b,i)=>tw[i]);if(T.length&&T.length<S.length){const ng=GX_newG();for(const b of T)b.g=ng;GX_setName(ng,C.gxN+' ⇋')}
  GS_tip(C.gxN+' added'+(T.length?' + mirror side':'')+' · ⛓ GROUPS to move it');GX_ui();PA_cards()}return r})(SL_place);
GB_ui=(f=>function(){const r=f.apply(this,arguments);const C=typeof SL!=='undefined'&&SL.carry;if(C&&C.ap&&PA.mir!==GB_.mir){PA.mir=GB_.mir;SL_fitAt(C.x,C.z,C.y);GS_tip(GB_.mir?'⇋ Mirror on · both sides':'Mirror off · one side')}PA_ui();return r})(GB_ui);
// thumbnails of saved parts (same offscreen renderer as the catalogue thumbnails)
function PA_thumb(p){if(PA.th.has(p.id))return PA.th.get(p.id);if(!GS.th)try{GS_thumb('b11',0)}catch(e){}const T=GS.th;if(!T)return null;let url=null;
 try{const host=new THREE.Group(),g={userData:{m:host}};GB_attach(g,p.b,null,false,false);host.rotation.y=.75;host.updateMatrixWorld(true);const bb=new THREE.Box3().setFromObject(host),ce=bb.getCenter(new THREE.Vector3()),sz=bb.getSize(new THREE.Vector3());
  host.position.sub(ce);T.s.add(host);T.r.setSize(100,72,false);T.cam.aspect=100/72;T.cam.updateProjectionMatrix();const d=Math.max(sz.x,sz.z,sz.y*1.5)*1.6+.5;T.cam.position.set(0,d*.5,d*.85);T.cam.lookAt(0,0,0);
  T.r.setClearColor(0,0);T.r.render(T.s,T.cam);url=T.cv.toDataURL('image/png');T.s.remove(host);host.traverse(m=>{if(m.isMesh&&!m.userData.gbc)m.geometry.dispose()})}catch(e){console.warn('PA',e);url=null}
 finally{try{T.r.setSize(112,112,false);T.cam.aspect=1;T.cam.updateProjectionMatrix()}catch(e){}}PA.th.set(p.id,url);return url}
// palette: the MY PARTS tab (first card = the canvas), cards follow the palette's category / favourites filtering
CR_CATS.unshift(PA_CAT);
function PA_cards(force){const S=$('#gbBkPc');if(!S)return;const A=PA_get(),key=PA.on+'|'+(PA.delId||'')+'|'+A.map(p=>p.id+':'+p.n).join(',');
 if(!force&&S._pa===key&&S.querySelector('.paC'))return PA_vis();S._pa=key;S.querySelectorAll('.paC,.paEm').forEach(e=>e.remove());const first=S.firstChild;
 const mk=(id,html,cls,n)=>{const b=document.createElement('button');b.className='gbPc paC'+(cls?' '+cls:'');b.dataset.ct=PA_CAT;b.dataset.pa=id;b.dataset.n=n;b.innerHTML=html;S.insertBefore(b,first);return b};
 mk('cv',`<i>${PA.on?'🚗':'🧩'}</i>`,'paCv',PA.on?'← CAR':'CANVAS').title=PA.on?'Back to your car':'Empty 32×32 canvas to build parts on';
 for(const p of A){const b=mk(p.id,'<img alt="">',PA.delId===p.id?'paDel':'',PA.delId===p.id?'🗑 DELETE?':p.n);b.title=p.n+' · '+p.b.length+' parts · long-press to delete';const u=PA_thumb(p);if(u)b.querySelector('img').src=u}
 if(!A.length){const e=document.createElement('div');e.className='paEm';e.textContent='Build on 🧩 CANVAS → ⛓ GROUP → 💾 SAVE PART';S.insertBefore(e,first)}PA_vis()}
function PA_vis(){const S=$('#gbBkPc');if(!S)return;const on=(GB_.ct===PA_CAT)&&!GX.cat;for(const e of S.querySelectorAll('.paC,.paEm'))e.style.display=on?'':'none'}
GX_pal=(f=>function(){const r=f.apply(this,arguments);if(GB_.bk)PA_cards();return r})(GX_pal);
{const S=$('#gbBkPc');if(S){
 S.addEventListener('pointerdown',e=>{const b=e.target.closest('.paC');if(!b)return;e.stopPropagation();clearTimeout(PA.lp);const id=b.dataset.pa;if(!/^p/.test(id))return;const x0=e.clientX,y0=e.clientY;
  PA.lp=setTimeout(()=>{PA.lp=null;PA.lpT=performance.now();PA.delId=id;GX_sfx('pick');GS_tip('Tap 🗑 DELETE? again to delete it · tap another part to keep it');PA_cards(1)},600);PA.lpXY=[x0,y0]},true);
 S.addEventListener('pointermove',e=>{if(PA.lp&&PA.lpXY&&Math.hypot(e.clientX-PA.lpXY[0],e.clientY-PA.lpXY[1])>10){clearTimeout(PA.lp);PA.lp=null}});
 for(const k of['pointerup','pointercancel','pointerleave'])S.addEventListener(k,()=>{clearTimeout(PA.lp);PA.lp=null});
 S.addEventListener('contextmenu',e=>{const b=e.target.closest('.paC');if(!b)return;e.preventDefault();e.stopPropagation();if(/^p/.test(b.dataset.pa)){PA.delId=b.dataset.pa;PA_cards(1)}},true);
 S.addEventListener('click',e=>{const b=e.target.closest('.paC');if(!b)return;e.stopPropagation();e.preventDefault();if(performance.now()-PA.lpT<900)return;const id=b.dataset.pa;
  if(id==='cv'){PA.delId=null;GX_sfx('pick');if(PA.on){PA_exit();GS_tip('Back to your car')}else PA_enter();return}
  if(PA.delId===id)return PA_del(id);if(PA.delId){PA.delId=null;PA_cards(1)}PA_append(id)},true)}}
// GROUPS panel: 💾 SAVE PART and 🧩 TO CANVAS under the active group's MOVE / COPY / MIRROR / DELETE
GX_ui=(f=>function(){const r=f.apply(this,arguments);const E=$('#gxG'),A=E&&!E.hidden&&E.querySelector('.gxA');if(A&&!A.nextElementSibling?.classList?.contains('paRow')){const g=+A.dataset.g,R=document.createElement('div');R.className='paRow';R.dataset.g=g;
  R.innerHTML=`<button data-pa="save"><i>💾</i>SAVE PART</button>${PA.on?'':'<button data-pa="tocv"><i>🧩</i>TO CANVAS</button>'}`;A.after(R);
  R.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;e.stopPropagation();if(b.dataset.pa==='save')PA_save(g);else PA_toCv(g)})}return r})(GX_ui);
{const st=document.createElement('style');st.textContent=`
body.paOn #odPin{display:none!important}#gbx.r2.gbBk.paPad #gbBkP{left:var(--paL)!important}
#paCvB{position:absolute;left:50%;transform:translateX(-50%);top:calc(var(--r2hh,52px) + 6px);z-index:4;display:flex;align-items:center;gap:8px;padding:3px 3px 3px 12px;border-radius:14px;border:2px solid #141413;background:#ffd400;box-shadow:0 3px 0 #141413;font:italic 900 13px system-ui;color:#141413;white-space:nowrap}
#paCvB[hidden]{display:none}#paCvB button{height:40px;min-width:72px;border-radius:10px;border:2px solid #141413;background:#fff;color:#141413;font:italic 900 13px system-ui;display:flex;align-items:center;gap:4px;padding:0 10px;cursor:pointer}#paCvB button i{font-style:normal;font-size:16px}
#gbx.r2 #gbBkPc .gbPc.paC{background:#fff}#gbx.r2 #gbBkPc .gbPc.paC img{width:50px;height:36px;object-fit:contain;display:block}#gbx.r2 #gbBkPc .gbPc.paC i{font-style:normal;font-size:22px}
#gbx.r2 #gbBkPc .gbPc.paCv{background:#ffd400}#gbx.r2 #gbBkPc .gbPc.paDel{background:#ff8a8a}
#gbx.r2.gbBk:not(.gxBig) #gbBkPc .gbPc.paC::after{content:attr(data-n);font:900 12px system-ui;max-width:50px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:block}
#gbx.r2 #gbBkPc .paEm{grid-row:1/3;align-self:center;font:900 12px system-ui;color:#fff;background:rgba(20,20,19,.7);border-radius:10px;padding:10px 12px;white-space:nowrap}
#gxG .paRow{display:grid;grid-template-columns:repeat(2,1fr);gap:4px;padding:0 0 4px}#gxG .paRow button{display:flex;align-items:center;justify-content:center;gap:4px;font-size:12px;background:#ffd400}#gxG .paRow button i{font-style:normal;font-size:14px}
.gnbR button[data-pa]{border-color:#ffd12c}`;document.head.appendChild(st)}
window.__pa={S:PA,on:()=>PA.on,parts:()=>PA_get(),cv:()=>PA_cvGet(),enter:()=>PA_enter(),exit:()=>PA_exit(),save:g=>PA_save(g),toCv:g=>PA_toCv(g),append:id=>PA_append(id),
 carry:()=>SL.carry&&{n:SL.carry.parts.length,tw:SL.carry.tw||0,bad:!!SL.carry.bad,x:SL.carry.x,z:SL.carry.z,y:SL.carry.y,ap:SL.carry.ap||null},
 bounds:()=>[GB_N0,GB_N1,GB_Z0,GB_Z1],pan:()=>[PA.px,PA.pz],cam:()=>[GB_.yaw,GB_.pit,GB_.dist],tiles:()=>PA_TILES.filter(k=>GB_PC[k])};
