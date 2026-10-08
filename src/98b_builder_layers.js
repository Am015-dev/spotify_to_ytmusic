// ---- B25 (build25, Alex: "the garage does not allow me to build like that maybe we can select levels so we can build more easier?").
// LAYER mode (default on in BUILD, remembered): one layer = one plate height. ▲ / ▼ jump to the next height where a part can rest (a part's top,
// a part's bottom or the chassis); the layer number shows between them. Parts on the active layer look normal, the layers below are dimmed,
// the layers above turn to see-through ghosts, and a stud grid is drawn at the active layer. A tap aims at that grid, so the part goes exactly
// there (centred on your finger) and only on the active layer: it needs a part under it, over it or beside it, otherwise it shows red.
// Tapping the layer number switches to the old "drop on top" mode (AUTO) and back. VIEW: TOP (straight down, nose to the right),
// SIDE (flat side view) and 3D (free orbit); dragging the view always goes back to 3D. The camera now orbits the centre of the build.
// Undo / redo, mirror, select, the build limit (GB_MAX), the height limit (GB_CAP) and saves are unchanged.
const B25={on:1,L:null,view:'3d',grid:null,gh:null,K:'mho_b25',why:'',pv:null};
try{const s=JSON.parse(localStorage.getItem(B25.K)||'{}');if(s.on===0)B25.on=0}catch(e){}
const B25_save=()=>{try{localStorage.setItem(B25.K,JSON.stringify({on:B25.on}))}catch(e){}};
const B25_act=()=>!!(B25.on&&GB_.bk&&GB.d&&GB_.base);
const B25_h=b=>GB_PC[b.t]?GB_PC[b.t].h:1;
function B25_floor(){let f=1e9;for(const k in GB_.base||{})f=Math.min(f,GB_.base[k]);return f>1e8?0:f}
function B25_cap(){let m=-1e9;for(const k in GB_.base||{})m=Math.max(m,GB_.base[k]);return(m<-1e8?0:m)+GB_CAP}
// heights where a part can sit: the chassis, the top and the bottom of every part (wheels excluded: nothing stacks on a tyre)
function B25_surf(){const S=new Set();for(const k in GB_.base||{})S.add(GB_.base[k]);for(const b of GB_list()){if(CR_WH[b.t])continue;S.add(b.y);S.add(b.y+B25_h(b))}return[...S].filter(y=>y>=B25_floor()&&y<B25_cap()).sort((a,b)=>a-b)}
// default layer: the most common column top over the chassis (the deck you would build on next)
function B25_def(){const C={};for(const k in GB_.base){const[i,j]=k.split(',').map(Number),t=GB_top(i,j,GB_list());C[t]=(C[t]||0)+1}let best=B25_floor(),n=-1;for(const t in C)if(C[t]>n||(C[t]===n&&+t<best)){n=C[t];best=+t}return Math.min(best,B25_cap()-1)}
function B25_set(L){const f=B25_floor();B25.L=clamp(Math.round(L),f,B25_cap()-1);B25_grid();B25_look();B25_ui();if(GS.held&&GS.hit)GS_reheld()}
function B25_step(d){if(B25.L==null)B25.L=B25_def();const S=B25_surf(),L=B25.L;let n=d>0?S.find(y=>y>L):[...S].reverse().find(y=>y<L);if(n==null)n=L+d;
 const f=B25_floor(),c=B25_cap()-1;if(n<f||n>c){try{AU.sfx('bump')}catch(e){}return 0}try{AU.sfx('pick')}catch(e){}B25_set(n);return 1}
// ---------- pick: in layer mode a tap aims at the active layer's plane (exact cell under the finger, centred footprint)
GB_pick=(f=>function(cx,cy){if(!B25_act()||GB_.tool!=='add'||(typeof SL!=='undefined'&&SL.carry))return f(cx,cy);
 const cvs=$('#gbC'),r=cvs.getBoundingClientRect(),rc=GB_.rc;GB_cam();rc.setFromCamera(new THREE.Vector2((cx-r.left)/r.width*2-1,-((cy-r.top)/r.height)*2+1),GB.cam);
 const m=GB.mesh.userData.m;m.updateMatrixWorld(true);const o=m.worldToLocal(rc.ray.origin.clone()),d=m.worldToLocal(rc.ray.origin.clone().add(rc.ray.direction)).sub(o).normalize();
 const y0=B25.L*GB_PH;if(Math.abs(d.y)<.12){const h=f(cx,cy);if(h){h.b25=1;h.brick=null}return h}const t=(y0-o.y)/d.y;if(t<0)return null;
 const px=o.x+d.x*t,pz=o.z+d.z*t;return{brick:null,i:Math.floor(px/GB_U),j:Math.floor(pz/GB_U),px:px/GB_U,pz:pz/GB_U,b25:1}})(GB_pick);
// is b free at its own y? 'ok' | 'full' (overlaps a part or the chassis) | 'air' (touches nothing) | 'out' (outside the build area / height cap)
function B25_why(b){const[fw,fd]=GB_dims(b),h=B25_h(b);if(b.x<GB_N0||b.x+fw-1>GB_N1||b.z<GB_N0||b.z+fd-1>GB_N1||b.y+h>B25_cap())return'out';
 for(let i=b.x;i<b.x+fw;i++)for(let j=b.z;j<b.z+fd;j++){const s=GB_.base[i+','+j];if(s!=null&&s>b.y)return'full'}
 for(const o of GB_list()){const[ow,od]=GB_dims(o);if(o.x<b.x+fw&&o.x+ow>b.x&&o.z<b.z+fd&&o.z+od>b.z&&o.y<b.y+h&&o.y+B25_h(o)>b.y)return'full'}
 return G8_free(b,b.y,GB_list())?'ok':'air'}
const B25_TXT={full:'Something is already there',air:'Nothing to hold it here',out:'Outside the build area'};
GB_cand=(f=>function(hit){if(!B25_act()||!hit||!hit.b25||!GB_PC[GB_.pc])return f(hit);const P=GB_PC[GB_.pc],r=GB_.rot,[fw,fd]=r%2?[P.d,P.w]:[P.w,P.d];
 let x=hit.px!=null?Math.round(hit.px-fw/2):hit.i-Math.floor((fw-1)/2),z=hit.pz!=null?Math.round(hit.pz-fd/2):hit.j-Math.floor((fd-1)/2);
 x=clamp(x,GB_N0,GB_N1-fw+1);z=clamp(z,GB_N0,GB_N1-fd+1);const b={t:GB_.pc,x,z,y:B25.L,r,m:0,c:GB_.col},w=B25_why(b);
 b.bad=w!=='ok'||GB_list().length>=GB_MAX;B25.why=w==='ok'?(GB_list().length>=GB_MAX?'Build limit full':''):B25_TXT[w];return b})(GB_cand);
// place on the active layer (touch: ✔ PLACE / second tap; mouse: click). The mirror twin goes on the same layer when it fits.
function B25_place(b){const L=GB_list();if(!b||b.bad||B25_why(b)!=='ok'){try{AU.sfx('bump')}catch(e){}B25_ui();return 0}
 const nb={t:b.t,x:b.x,z:b.z,y:b.y,r:b.r%4,m:0,c:b.c},add=[nb];if(GB_.mir){const w=GB_twin(nb);if(w.x!==nb.x&&B25_why(w)==='ok'&&!(w.x<nb.x+GB_dims(nb)[0]&&w.x+GB_dims(w)[0]>nb.x&&w.z===nb.z))add.push(w)}
 if(L.length+add.length>GB_MAX){if(L.length+1>GB_MAX){try{AU.sfx('bump')}catch(e){}return 0}add.length=1}
 GB_snap();L.push(...add);GS.held=null;GS.hit=null;try{AU.sfx('brick')}catch(e){}GB_refresh();GS_pop(nb);GS_ui();return add.length}
GS_place=(f=>function(){const b=GS.held;if(B25_act()&&b&&b.y===B25.L&&GB_.tool==='add')return B25_place(b);return f.apply(this,arguments)})(GS_place);
GB_act=(f=>function(cx,cy,del){if(B25_act()&&!del&&GB_.tool==='add'&&GS.pt==='mouse'&&!(typeof SL!=='undefined'&&SL.carry)){const b=GB_cand(GB_pick(cx,cy));if(!b){try{AU.sfx('bump')}catch(e){}return 0}return B25_place(b)}
 const r=f.apply(this,arguments);B25_ui();return r})(GB_act);
// ---------- look: dim the layers below, ghost the layers above (builder only; the car you drive is untouched)
function B25_look(){const U=GB.mesh&&GB.mesh.userData;if(!U)return;const host=U.carG||U.m;if(B25.gh){host.remove(B25.gh);B25.gh.geometry.dispose();B25.gh=null}
 const main=(U.gbM||[]).find(o=>o.geometry&&o.geometry.userData.bid&&o.material&&!o.material.isMeshBasicMaterial);if(!main)return;
 if(!main.userData.b25o)main.userData.b25o=main.geometry;const G0=main.userData.b25o;if(main.geometry!==G0){main.geometry.dispose();main.geometry=G0}
 if(!B25_act()||B25.L==null)return;const L=GB_list(),Ly=B25.L,cls=L.map(b=>b.y+B25_h(b)<=Ly?1:b.y>Ly?2:0);if(!cls.some(c=>c))return;
 const id=G0.userData.bid,P=G0.attributes.position.array,N=G0.attributes.normal.array,C=G0.attributes.color.array,nt=id.length;
 const A={p:[],n:[],c:[],id:[]},B={p:[],n:[],c:[]};for(let t=0;t<nt;t++){const k=id[t]>=0?cls[id[t]]:0,o=t*9;
  if(k===2){for(let q=0;q<9;q++){B.p.push(P[o+q]);B.n.push(N[o+q]);B.c.push(C[o+q])}continue}
  for(let q=0;q<9;q++){A.p.push(P[o+q]);A.n.push(N[o+q]);A.c.push(k===1?C[o+q]*.42+.05:C[o+q])}A.id.push(id[t])}
 const mk=S=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(S.p,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(S.n,3));g.setAttribute('color',new THREE.Float32BufferAttribute(S.c,3));return g};
 const g=mk(A);g.userData.bid=Int16Array.from(A.id);main.geometry=g;
 if(B.p.length){const gh=new THREE.Mesh(mk(B),new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,opacity:.16,depthWrite:false}));gh.raycast=()=>{};gh.userData.gbG=1;gh.renderOrder=2;host.add(gh);B25.gh=gh}}
// stud grid of the active layer over the whole build area
function B25_grid(){const U=GB.mesh&&GB.mesh.userData;if(!U)return;const host=U.carG||U.m;if(B25.grid){host.remove(B25.grid);B25.grid.traverse(o=>{if(o.geometry)o.geometry.dispose()});B25.grid=null}
 if(!B25_act()||B25.L==null)return;const y=B25.L*GB_PH+.012,u=GB_U,x0=GB_N0*u,x1=(GB_N1+1)*u,z0=GB_N0*u,z1=(GB_N1+1)*u,V=[];
 for(let i=GB_N0;i<=GB_N1+1;i++)V.push(i*u,y,z0,i*u,y,z1);for(let j=GB_N0;j<=GB_N1+1;j++)V.push(x0,y,j*u,x1,y,j*u);
 const G=new THREE.Group();G.userData.gbG=1;const lg=new THREE.BufferGeometry();lg.setAttribute('position',new THREE.Float32BufferAttribute(V,3));
 const ln=new THREE.LineSegments(lg,new THREE.LineBasicMaterial({color:0x4ceaff,transparent:true,opacity:.42,depthWrite:false}));ln.raycast=()=>{};ln.renderOrder=1;G.add(ln);
 const pl=new THREE.Mesh(new THREE.PlaneGeometry(x1-x0,z1-z0).rotateX(-Math.PI/2).translate((x0+x1)/2,y-.004,(z0+z1)/2),new THREE.MeshBasicMaterial({color:0x22c5e4,transparent:true,opacity:.07,depthWrite:false,side:THREE.DoubleSide}));pl.raycast=()=>{};G.add(pl);
 G.traverse(o=>o.userData.gbG=1);host.add(G);B25.grid=G}
GB_refresh=(f=>function(){const r=f.apply(this,arguments);if(GB_.bk&&GB.mesh){B25_look();if(!B25.grid&&B25_act())B25_grid()}B25_ui();return r})(GB_refresh);
// ---------- views: TOP / SIDE / 3D presets; the camera orbits the centre of the build
const B25_V={top:{yaw:Math.PI/2,pit:1.5,dist:15},side:{yaw:Math.PI/2,pit:.06,dist:15}};
function B25_view(v){B25.view=v;const p=B25_V[v];if(p){GB_.yaw=p.yaw;GB_.pit=p.pit;GB_.dist=p.dist;B25.pv=[p.yaw,p.pit]}else{B25.pv=null;GB_.pit=clamp(GB_.pit>1.3||GB_.pit<.12?.45:GB_.pit,.12,1.4);GB_.yaw=Math.PI*.78}try{AU.sfx('pick')}catch(e){}B25_ui()}
function B25_ctr(){let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;const add=(a,b,c,d)=>{x0=Math.min(x0,a);x1=Math.max(x1,b);z0=Math.min(z0,c);z1=Math.max(z1,d)};
 for(const k in GB_.base||{}){const[i,j]=k.split(',').map(Number);add(i,i+1,j,j+1)}for(const b of GB_list()){const[fw,fd]=GB_dims(b);add(b.x,b.x+fw,b.z,b.z+fd)}return x0>1e8?[0,0]:[(x0+x1)/2*GB_U,(z0+z1)/2*GB_U]}
GB_cam=(f=>function(){f();if(!GB_.bk||!GB.mesh||!GB.mesh.userData.m)return;if(B25.pv&&(Math.abs(GB_.yaw-B25.pv[0])>1e-3||Math.abs(GB_.pit-B25.pv[1])>1e-3)){B25.pv=null;B25.view='3d';B25_ui()}
 const m=GB.mesh.userData.m,[cx,cz]=B25_ctr(),T=m.localToWorld(V3(cx,0,cz)),O=m.localToWorld(V3(0,0,0)),C=GB.cam;C.position.x+=T.x-O.x;C.position.z+=T.z-O.z;
 const fw=new THREE.Vector3();C.getWorldDirection(fw);if(B25.view==='top'){C.up.set(-1,0,0)}else C.up.set(0,1,0);C.lookAt(C.position.clone().add(fw));C.updateMatrixWorld()})(GB_cam);
// the free area for framing the car stops left of the layer column
R2_calc=(f=>function(){const A=f.apply(this,arguments),e=$('#b25');if(A&&e&&GB_.bk&&e.offsetParent){const r=e.getBoundingClientRect(),c=$('#gbC').getBoundingClientRect();A.r=Math.min(A.r,r.left-c.left-6)}return A})(R2_calc);
// ---------- UI: right column [TOP|SIDE|3D] · ▲ · LAYER n · ▼ (+ one line why a part shows red)
function B25_ui(){const X=$('#gbx');if(!X)return;let E=$('#b25');if(!E){E=document.createElement('div');E.id='b25';X.appendChild(E);E.addEventListener('pointerdown',e=>e.stopPropagation());
  E.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;e.stopPropagation();const a=b.dataset.b25;if(a==='up')B25_step(1);else if(a==='dn')B25_step(-1);
   else if(a==='lay'){B25.on=B25.on?0:1;B25_save();if(B25.on&&B25.L==null)B25.L=B25_def();if(GS.held)GS_drop();B25_grid();B25_look();try{AU.sfx('pick')}catch(_){}B25_ui()}else B25_view(a)})}
 const on=GB_.bk&&!X.hidden;E.hidden=!on;if(!on)return;const lay=B25.on,n=lay&&B25.L!=null?B25.L-B25_floor():null,why=lay&&GS.held&&GS.held.bad?B25.why:'';
 const h=`<div class="b25V">${[['top','⬇','TOP'],['side','➡','SIDE'],['3d','⟲','3D']].map(([k,i,t])=>`<button data-b25="${k}" class="${B25.view===k?'on':''}"><i>${i}</i>${t}</button>`).join('')}</div>`+
  `<button data-b25="up" ${lay?'':'disabled'}><i>▲</i></button><button data-b25="lay" class="b25L ${lay?'on':''}"><small>${lay?'LAYER':'LAYERS'}</small><b>${lay?n:'AUTO'}</b></button><button data-b25="dn" ${lay?'':'disabled'}><i>▼</i></button>`+(why?`<em>${why}</em>`:'');
 if(E._h!==h){E._h=h;E.innerHTML=h}}
GB_enter=(f=>function(){const was=GB_.bk,r=f.apply(this,arguments);if(!was&&GB_.bk){B25.L=B25_def();B25.view='3d';B25.pv=null;B25_grid();B25_look();B25_ui();R2.area=null}return r})(GB_enter);
GB_exit=(f=>function(){const U=GB.mesh&&GB.mesh.userData;if(U&&B25.grid){(U.carG||U.m).remove(B25.grid);B25.grid=null}if(U&&B25.gh){(U.carG||U.m).remove(B25.gh);B25.gh=null}const r=f.apply(this,arguments);B25_ui();return r})(GB_exit);
GS_ui=(f=>function(){const r=f.apply(this,arguments);B25_ui();return r})(GS_ui);
// a new chassis / template / blank base starts at its own deck
GB_scanBase=(f=>function(){const r=f.apply(this,arguments);if(GB_.bk&&GB.d){B25.L=B25_def();B25_grid()}return r})(GB_scanBase);
GNB_new=(f=>function(){const r=f.apply(this,arguments);if(GB_.bk){B25.L=B25_def();B25_grid();B25_look();B25_ui()}return r})(GNB_new);
GB_preset=(f=>function(){const r=f.apply(this,arguments);if(GB_.bk){B25.L=B25_def();B25_grid();B25_look();B25_ui()}return r})(GB_preset);
// the CATEGORY ▾ popup stayed open after picking a category and covered the car, the parts and ▼: close it once a category is picked
addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#gbBkCt .gbCt');if(b&&!b.dataset.r2s)setTimeout(()=>{if(R2.pop==='cat')R2_pop(null)},0)},true);
// STEP ▲/▼ on the held part moves the active layer too (one control for height)
G8_step=(f=>function(d){if(!B25_act())return f.apply(this,arguments);return B25_step(d)})(G8_step);
{const st=document.createElement('style');st.textContent=`#b25{position:absolute;right:6px;top:calc(var(--r2hh,52px) + 6px);display:flex;flex-direction:column;align-items:flex-end;gap:5px;z-index:4}#b25[hidden]{display:none}
#b25 button{height:44px;min-width:56px;border-radius:12px;border:2px solid #141413;background:#fff;color:#141413;font:italic 900 12px system-ui;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:0;cursor:pointer;padding:0 6px;line-height:1.05;box-shadow:0 2px 0 rgba(0,0,0,.35)}
#b25 button i{font-style:normal;font-size:15px}#b25 button.on{background:#ffd12c}#b25 button:disabled{opacity:.4}
#b25 .b25V{display:flex;gap:4px}#b25 .b25V button{min-width:52px}#b25 .b25L{width:56px;height:46px}#b25 .b25L small{font-size:12px}#b25 .b25L b{font-size:17px}#b25 .b25L:not(.on) b{font-size:12px}
body.tmGar #r2H [data-r2h="redo"]{margin-right:50px}
#b25 em{font:900 12px system-ui;font-style:normal;background:#ff4a4a;color:#fff;border:2px solid #141413;border-radius:8px;padding:3px 6px;max-width:170px;text-align:center}`;document.head.appendChild(st)}
window.__b25={S:B25,scr:(fx,fz,y)=>{const m=GB.mesh.userData.m;GB.mesh.updateMatrixWorld(true);GB_cam();const p=m.localToWorld(V3(fx*GB_U,(y??B25.L)*GB_PH,fz*GB_U)).project(GB.cam),r=$('#gbC').getBoundingClientRect();return{x:r.left+(p.x+1)/2*r.width,y:r.top+(1-p.y)/2*r.height}},setLayer:L=>B25_set(L),step:d=>B25_step(d),view:v=>B25_view(v),surf:()=>B25_surf(),def:()=>B25_def(),floor:()=>B25_floor(),why:b=>B25_why(b)};
