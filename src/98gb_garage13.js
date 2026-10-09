// ---- G13 (v89d garage). Alex (2026-10-09, with the 40468 Yellow Taxi instructions): "the garage is missing several items; there is not full
// control to rotate in different ways; we need much better shortcuts to rotate items; we miss a lot of tiles … good to be able to search for the
// tile and also place it in a cart to organise them; allow group/ungroup and ways to join items together; the controls in the garage need to be
// improved, there are way too many options."  Research: docs/GARAGE13_PARTS.md.
// 1) ROTATION on 3 axes: R = turn on Y (up axis), T = tip over X, F = roll over Z, Shift = the other way; ⟲ AXES pad on touch (X, Z, 45°, ▲ ▼).
//    Tap the held part = turn it on Y; a two-finger twist on the build view turns it too. A 3-axis gizmo shows while turning.
//    How: a tipped part is the same part under a derived type id "<part>@<x><z><45>" (x/z quarter turns, 45° flag), created on demand
//    through a prototype proxy on GB_PC, so footprint, height, stacking, saving, mirror twins and undo work unchanged everywhere.
// 2) SEARCH: 🔍 field over the whole catalogue (name, LEGO design id, category), live results. ★ FAVS / 🕘 RECENT / MY PARTS stay (▾ list).
// 3) 🧺 TRAY: + on a part tile adds it to this build's tray (counts); TRAY shows only those parts (used / planned). Saved per vehicle (mho_tray).
// 4) GROUP / UNGROUP / JOIN: the selection bar is GROUP · JOIN · MOVE · TURN · ⋯. JOIN snaps loose parts onto each other on the stud grid
//    (side by side or on top) and makes them one rigid piece (🔗 Piece N) that moves and turns as one; SPLIT (= ungroup) undoes it.
// 5) SIMPLER BUILD: one bar PARTS · TRAY · SELECT · PAINT · MORE; the 13 category chips became 🔍 + one ▾ list; the view column shows
//    only the current view (tap = next view) + layer ▲ ▼; MIRROR, GROUPS and HIDE UP moved into ⋯ MORE.
const G13={K:'mho_tray',q:'',tray:0,giz:null,gizT:0,pad:0,tw:new Map(),twA:null,twS:0,last:null};
CK.push('mho_tray');
// ---------- 1) oriented part types
const G13_RX=/^(.+)@([0-3])([0-3])([01])$/;
const G13_base=t=>{const m=typeof t==='string'&&G13_RX.exec(t);return m?m[1]:t};
const G13_ori=t=>{const m=typeof t==='string'&&G13_RX.exec(t);return m?[+m[2],+m[3],+m[4]]:[0,0,0]};
const G13_key=(b,x,z,q)=>{x&=3;z&=3;return x||z||q?b+'@'+x+z+(q?1:0):b};
const G13_noTilt=t=>/^(drv|G\d|T\d)/.test(t)||(typeof CR_WH!=='undefined'&&CR_WH[t]);
const G13_own=k=>Object.prototype.hasOwnProperty.call(GB_PC,k);
function G13_mat(x,z,q){const m=new THREE.Matrix4().makeRotationX(x*Math.PI/2);m.premultiply(new THREE.Matrix4().makeRotationZ(z*Math.PI/2));if(q)m.premultiply(new THREE.Matrix4().makeRotationY(Math.PI/4));return m}
function G13_def(k){if(G13_own(k))return;const m=G13_RX.exec(k);if(!m||!G13_own(m[1])||G13_noTilt(m[1]))return;const P=GB_PC[m[1]],M=G13_mat(+m[2],+m[3],+m[4]),v=new THREE.Vector3(),e=[0,0,0];
 for(const sx of[-1,1])for(const sy of[-1,1])for(const sz of[-1,1]){v.set(sx*P.w*GB_U/2,sy*P.h*GB_PH/2,sz*P.d*GB_U/2).applyMatrix4(M);e[0]=Math.max(e[0],Math.abs(v.x));e[1]=Math.max(e[1],Math.abs(v.y));e[2]=Math.max(e[2],Math.abs(v.z))}
 const Q=Object.assign({},P,{n:P.n,w:Math.max(1,Math.round(2*e[0]/GB_U)),d:Math.max(1,Math.round(2*e[2]/GB_U)),h:Math.max(1,Math.round(2*e[1]/GB_PH)),s:0,base:m[1]});delete Q.cat;
 Object.defineProperty(GB_PC,k,{value:Q,enumerable:false,configurable:true,writable:true})}
Object.setPrototypeOf(GB_PC,new Proxy(Object.create(Object.prototype),{
 get(T,k,R){if(typeof k==='string'&&k.indexOf('@')>0){G13_def(k);return G13_own(k)?GB_PC[k]:undefined}return Reflect.get(T,k,R)},
 has(T,k){if(typeof k==='string'&&k.indexOf('@')>0){G13_def(k);return G13_own(k)}return Reflect.has(T,k)}}));
// the geometry of a tipped part = the part built upright, turned about its centre, then stood on its new bottom
GB_piece=(f=>function(t,c,M,L){const m=typeof t==='string'&&G13_RX.exec(t);if(!m||!GB_PC[t])return f(t,c,M,L);
 const P=GB_PC[m[1]],Q=GB_PC[t],m0=M.length,l0=L.length,G=typeof CR_G!=='undefined'?CR_G:null,g0=G?G.length:0;f(m[1],c,M,L);
 const X=new THREE.Matrix4().makeTranslation(0,-P.h*GB_PH/2,0).premultiply(G13_mat(+m[2],+m[3],+m[4])).premultiply(new THREE.Matrix4().makeTranslation(0,Q.h*GB_PH/2,0));
 for(let i=m0;i<M.length;i++)M[i].applyMatrix4(X);for(let i=l0;i<L.length;i++)L[i].applyMatrix4(X);if(G)for(let i=g0;i<G.length;i++)G[i].applyMatrix4(X)})(GB_piece);
// full orientation of a brick (yaw r, mirror m, tilt): R = Ry(r)·Mx^m·T
const G13_MX=new THREE.Matrix4().makeScale(-1,1,1);
function G13_full(r,m,t){const[x,z,q]=G13_ori(t),M=G13_mat(x,z,q);if(m)M.premultiply(G13_MX);return M.premultiply(new THREE.Matrix4().makeRotationY(r*Math.PI/2))}
const G13_eq=(A,B)=>A.elements.every((v,i)=>Math.abs(v-B.elements[i])<1e-4);
// turn about a world axis: find the yaw + tilt that gives the turned orientation (45° parts only turn on Y)
function G13_turnOri(t,r,m,ax,dir){const base=G13_base(t),[x0,z0,q0]=G13_ori(t);
 if(ax==='y')return{t,r:(r+dir+4)%4};if(ax==='q')return q0?{t:G13_key(base,x0,z0,0),r}:{t:G13_key(base,x0,z0,1),r};
 if(G13_noTilt(base))return null;const A=new THREE.Matrix4()[ax==='x'?'makeRotationX':'makeRotationZ'](dir*Math.PI/2),W=G13_full(r,m,G13_key(base,x0,z0,0)).premultiply(A);
 for(const s of[0,1,2,3,4,5,6])for(let a=0;a<4;a++)for(let b=0;b<4;b++){if(a+b!==s)continue;for(let c=0;c<4;c++){const k=G13_key(base,b,a,0);if(G13_eq(G13_full(c,m,k),W))return{t:k,r:c}}}return null}
const G13_ht=b=>(GB_PC[b.t]||{h:1}).h;
function G13_ov(a,b){const[aw,ad]=GB_dims(a),[bw,bd]=GB_dims(b);return a.x<b.x+bw&&a.x+aw>b.x&&a.z<b.z+bd&&a.z+ad>b.z&&a.y<b.y+G13_ht(b)&&a.y+G13_ht(a)>b.y}
function G13_free(B,skip){const L=GB_list();for(const b of B){const[fw,fd]=GB_dims(b);if(b.x<GB_N0||b.x+fw-1>GB_N1||b.z<GB_Z0||b.z+fd-1>GB_Z1||b.y<-2)return 0;
  for(const o of L)if(!skip.includes(o)&&G13_ov(b,o))return 0}for(let i=0;i<B.length;i++)for(let j=i+1;j<B.length;j++)if(G13_ov(B[i],B[j]))return 0;return 1}
// turn a placed part in place (with its mirror twin); it keeps its centre, or rises until it fits
function G13_turnSel(ax,dir){const S=SL.sel;if(!S.length)return 0;const b=S[0],tw=GB_.mir?SL_twin(b):null,one=S.length===1||(S.length===2&&tw&&S.includes(tw));
 if(!one||(b.g&&GB_list().filter(o=>o.g===b.g).length>(tw&&tw.g===b.g?2:1))){if(ax==='y'){SL_lift(0,1);return 1}GS_tip('X / Z turn one part · groups turn on Y (⟳)');return 0}
 const o=G13_turnOri(b.t,b.r,b.m,ax,dir);if(!o){GS_tip('This part only turns on Y');return 0}
 const[fw,fd]=GB_dims(b),cx=b.x+fw/2,cz=b.z+fd/2,cy=b.y+G13_ht(b)/2,nb={...b,t:o.t,r:o.r},[nw,nd]=GB_dims(nb);nb.x=Math.round(cx-nw/2);nb.z=Math.round(cz-nd/2);
 const ys=[b.y,Math.round(cy-G13_ht(nb)/2)];for(let k=1;k<=6;k++)ys.push(b.y+k);
 for(const y of ys){nb.y=y;const B=[nb];let w=null;if(tw){w={...GB_twin(nb),y};B.push(w)}if(!G13_free(B,[b,tw].filter(Boolean)))continue;
  GB_snap();Object.assign(b,{t:nb.t,r:nb.r,x:nb.x,z:nb.z,y:nb.y});if(tw)Object.assign(tw,{t:w.t,r:w.r,x:w.x,z:w.z,y:w.y,m:w.m});GB_refresh();SL_set(S.slice());return 1}
 try{AU.sfx('bump')}catch(e){}GS_tip('No room to turn it here');return 0}
const G13_AXN={y:'Y ⟳',x:'X ⤼',z:'Z ⤻',q:'45°'};
function G13_turn(ax,dir=1){if(!GB_.bk)return 0;let ok=0;
 if(SL.carry){if(ax==='y'){for(let i=0;i<(dir>0?1:3);i++)SL_rot();ok=1}else GS_tip('X / Z turn one part · groups turn on Y (⟳)')}
 else if(GB_.tool==='sel'&&SL.sel.length)ok=G13_turnSel(ax,dir);
 else if(GB_.tool==='add'){const o=G13_turnOri(GB_.pc,GB_.rot,0,ax,dir);if(!o)GS_tip('This part only turns on Y');else{GB_.pc=o.t;GB_.rot=o.r;ok=1;if(GS.held)GS_reheld();else GB_hover()}}
 if(ok){try{AU.sfx('pick')}catch(e){}G13_gizShow(ax);G13.last=ax;GS_tip('Turned '+G13_AXN[ax]+(GS.pt==='mouse'?' · R / T / F':''));G13_ui()}return ok}
// ---------- gizmo: red X, green Y, blue Z through the held / selected part; a ring on the axis just used
function G13_gizMk(){const g=new THREE.Group(),mk=(c,ax)=>{const m=new THREE.MeshBasicMaterial({color:c,depthTest:false,depthWrite:false,transparent:true,opacity:.95,toneMapped:false}),
  s=new THREE.Mesh(new THREE.CylinderGeometry(.06,.06,1.9,8).translate(0,.95,0),m),h=new THREE.Mesh(new THREE.ConeGeometry(.17,.4,12).translate(0,2.08,0),m),a=new THREE.Group();a.add(s,h);
  if(ax==='x')a.rotation.z=-Math.PI/2;else if(ax==='z')a.rotation.x=Math.PI/2;a.userData.ax=ax;const r=new THREE.Mesh(new THREE.TorusGeometry(1.25,.06,6,40),m);r.userData.ring=ax;
  if(ax==='y')r.rotation.x=Math.PI/2;else if(ax==='x')r.rotation.y=Math.PI/2;g.add(a,r)};
 mk(0xff3b30,'x');mk(0x34d058,'y');mk(0x2f7bff,'z');g.traverse(o=>{o.renderOrder=20;o.frustumCulled=false});return g}
function G13_gizAt(){let B=null;if(GS.held)B=[GS.held];else if(SL.sel.length&&GB_.tool==='sel')B=SL.sel;else if(GB_.hov)B=[GB_.hov];if(!B||!B.length)return null;
 let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9,z0=1e9,z1=-1e9;for(const b of B){const[fw,fd]=GB_dims(b);x0=Math.min(x0,b.x);x1=Math.max(x1,b.x+fw);z0=Math.min(z0,b.z);z1=Math.max(z1,b.z+fd);y0=Math.min(y0,b.y);y1=Math.max(y1,b.y+G13_ht(b))}
 return[(x0+x1)/2*GB_U,(y0+y1)/2*GB_PH,(z0+z1)/2*GB_U]}
function G13_gizShow(ax,ms=1800){const U=GB.mesh&&GB.mesh.userData;if(!U)return;const host=U.carG||U.m,p=G13_gizAt();if(!host||!p)return;if(!G13.giz)G13.giz=G13_gizMk();const g=G13.giz;
 if(g.parent!==host){if(g.parent)g.parent.remove(g);host.add(g)}g.position.set(p[0],p[1],p[2]);g.scale.setScalar(clamp((GB_.dist||14)/9,1,3.5));g.visible=true;
 g.traverse(o=>{if(o.userData.ring)o.visible=o.userData.ring===(ax==='q'?'y':ax)});clearTimeout(G13.gizT);if(ms)G13.gizT=setTimeout(()=>{if(!G13.pad&&G13.giz)G13.giz.visible=false},ms)}
function G13_gizHide(){clearTimeout(G13.gizT);if(G13.giz)G13.giz.visible=false}
// ---------- keys (PC): R / T / F, Shift = the other way (called first by the builder's key handler in 94_garage_ui.js)
function G13_keys(e){const k=e.code,ax=k==='KeyR'?'y':k==='KeyT'?'x':k==='KeyF'?'z':null;if(!ax||e.ctrlKey||e.metaKey||e.altKey)return 0;e.preventDefault();G13_turn(ax,e.shiftKey?-1:1);GB_ui();return 1}
// ---------- tap the held part = turn it on Y (PLACE places it)
GB_act=(f=>function(cx,cy,del){const o=GS.held;if(o&&!del&&GB_.tool==='add'&&GS.pt!=='mouse'&&!SL.carry){const h=GB_pick(cx,cy);if(h){const[fw,fd]=GB_dims(o);
  if(h.i>=o.x&&h.i<o.x+fw&&h.j>=o.z&&h.j<o.z+fd&&(h.brick==null||h.brick!==o)){G13_turn('y',1);return 0}}}return f.apply(this,arguments)})(GB_act);
GS_tip=(f=>function(t){if(typeof t==='string')t=t.replace('✔ PLACE or tap again · ⟳ to turn it','✔ PLACE · tap it to turn · ⟲ more axes');return f.call(this,t)})(GS_tip);
// ---------- two-finger twist on the build view turns the held / selected part on Y (every 35°)
{const inV=e=>e.target&&e.target.closest&&e.target.closest('#gbx .gbv canvas,#gbC');
 const ang=()=>{const P=[...G13.tw.values()];return Math.atan2(P[1].y-P[0].y,P[1].x-P[0].x)};
 addEventListener('pointerdown',e=>{if(!GB_.bk||e.pointerType!=='touch'||!inV(e))return;G13.tw.set(e.pointerId,{x:e.clientX,y:e.clientY});if(G13.tw.size===2){G13.twA=ang();G13.twS=0}},true);
 addEventListener('pointermove',e=>{const p=G13.tw.get(e.pointerId);if(!p)return;p.x=e.clientX;p.y=e.clientY;if(G13.tw.size!==2||G13.twA==null)return;
  if(!(GS.held||SL.carry||(GB_.tool==='sel'&&SL.sel.length)))return;let a=ang(),d=a-G13.twA;if(d>Math.PI)d-=2*Math.PI;if(d<-Math.PI)d+=2*Math.PI;G13.twS+=d;G13.twA=a;
  if(Math.abs(G13.twS)>.61){const s=Math.sign(G13.twS);G13.twS-=s*.61;G13_turn('y',s>0?1:-1)}},true);
 const up=e=>{G13.tw.delete(e.pointerId);if(G13.tw.size<2)G13.twA=null};addEventListener('pointerup',up,true);addEventListener('pointercancel',up,true)}

// ---------- 2) search + ▾ category list (replaces the 13-chip row)
const G13_ID={};// design ids for search (filled with the parts below)
function G13_score(b,q){const p=b.dataset.p||'';if(!p)return 0;const P=GB_PC[p]||{},n=((P.n||b.dataset.n||p)+' '+(G13_AL[p]||'')).toLowerCase(),ct=(b.dataset.ct||P.cat||'').toLowerCase(),id=String(G13_ID[p]||'');
 let s=0;for(const w of q.split(/\s+/).filter(Boolean)){const v=w.replace('x','×');if(n.startsWith(v)||n.startsWith(w))s+=4;else if(n.includes(v)||n.includes(w))s+=3;else if(id&&id.startsWith(w))s+=5;else if(ct.startsWith(w))s+=2;else if(p.toLowerCase()===w)s+=2;else return 0}return s}
function G13_search(q){G13.q=q=(q||'').trim().toLowerCase();const S=$('#gbBkPc');if(!S)return;
 if(!q){G13_cat(G13.tray?'tray':(GX.cat||GB_.ct||'Bricks'));return}G13.tray=0;G13_badges();let n=0;
 const R=GX_tiles().map(b=>[b,G13_score(b,q)]).sort((a,c)=>c[1]-a[1]);R.forEach(([b,s],i)=>{b.style.display=s?'':'none';b.style.order=s?i:'';if(s)n++});
 for(const e of S.querySelectorAll('.gxEm,.paC,.paEm'))e.style.display='none';S.scrollLeft=0;G13_em(n?'':'No part called “'+q+'” · try tile, slope, 3069');try{GS_thumbs()}catch(e){}G13_ui()}
function G13_em(t){const S=$('#gbBkPc');if(!S)return;let e=S.querySelector('.g13Em');if(!e){e=document.createElement('div');e.className='g13Em gxEm';S.appendChild(e)}e.hidden=!t;e.textContent=t;e.style.display=t?'':'none'}
function G13_catList(){const C=$('#gxCh');return C?[...C.querySelectorAll('.gxC')].filter(b=>b.dataset.gxc!=='fold').map(b=>[b.dataset.gxc,b.textContent.trim()]):[]}
function G13_catName(){if(G13.q)return'🔍 '+G13.q;if(G13.tray)return'🧺 TRAY';const k=GX.cat||GB_.ct||'Bricks',c=G13_catList().find(a=>a[0]===k);return c?c[1]:String(k).toUpperCase()}
function G13_cat(k){G13_em('');if(k==='tray'){G13.tray=1;G13_trayShow()}else{G13.tray=0;const b=$(`#gxCh [data-gxc="${CSS.escape(k)}"]`);if(b)b.click();else GX_cat(k)}G13_ui()}
// ---------- 3) tray (per vehicle)
const G13_tAll=()=>{try{return JSON.parse(localStorage.getItem(G13.K)||'{}')||{}}catch(e){return{}}};
const G13_tGet=()=>{const a=G13_tAll()[GX_sid()];return a&&typeof a==='object'?a:{}};
function G13_tPut(o){try{const a=G13_tAll();a[GX_sid()]=o;localStorage.setItem(G13.K,JSON.stringify(a))}catch(e){}}
function G13_tAdd(p,d){const o=G13_tGet();o[p]=Math.max(0,(o[p]||0)+d);if(!o[p])delete o[p];G13_tPut(o);const P=GB_PC[p];try{AU.sfx(d>0?'brick':'pick')}catch(e){}
 GS_tip(d>0?'🧺 '+(P?P.n:p)+' ×'+o[p]+' in the tray':'🧺 '+(P?P.n:p)+(o[p]?' ×'+o[p]:' removed'));if(G13.tray)G13_trayShow();G13_badges()}
const G13_used=p=>GB_list().filter(b=>G13_base(b.t)===p).length;
function G13_trayShow(){const o=G13_tGet(),K=Object.keys(o);let n=0;GX_tiles().forEach(b=>{const i=K.indexOf(b.dataset.p);b.style.display=i<0?'none':'';b.style.order=i<0?'':i;if(i>=0)n++});
 const S=$('#gbBkPc');if(S){for(const e of S.querySelectorAll('.gxEm:not(.g13Em),.paC,.paEm'))e.style.display='none';S.scrollLeft=0}G13_em(n?'':'Tray empty · tap + on a part to collect it');G13_badges();try{GS_thumbs()}catch(e){}}
function G13_badges(){const o=G13_tGet();for(const b of GX_tiles()){let a=b.querySelector('.g13Add');if(!a){a=document.createElement('span');a.className='g13Add';b.appendChild(a)}
  let c=b.querySelector('.g13Ct');const p=b.dataset.p,n=o[p]||0;if(n&&!c){c=document.createElement('span');c.className='g13Ct';b.appendChild(c)}
  if(c){c.hidden=!n;if(n)c.textContent=G13.tray?G13_used(p)+'/'+n:'×'+n;c.classList.toggle('ok',G13.tray&&G13_used(p)>=n)}a.textContent=G13.tray?'−':'+';a.title=G13.tray?'Take one out of the tray':'Add to the tray'}}
// ---------- 4) JOIN: loose parts snap together on the stud grid, then become one piece
function G13_touch(a,b){const[aw,ad]=GB_dims(a),[bw,bd]=GB_dims(b),ah=G13_ht(a),bh=G13_ht(b),ox=a.x<b.x+bw&&a.x+aw>b.x,oz=a.z<b.z+bd&&a.z+ad>b.z,oy=a.y<b.y+bh&&a.y+ah>b.y;
 if(ox&&oz&&(a.y+ah===b.y||b.y+bh===a.y))return 1;if(oy&&((oz&&(a.x+aw===b.x||b.x+bw===a.x))||(ox&&(a.z+ad===b.z||b.z+bd===a.z))))return 1;return 0}
function G13_comps(S){const left=S.slice(),out=[];while(left.length){const c=[left.shift()];for(let i=0;i<c.length;i++)for(let j=left.length-1;j>=0;j--)if(G13_touch(c[i],left[j]))c.push(left.splice(j,1)[0]);out.push(c)}return out}
function G13_snap(S){const C=G13_comps(S);if(C.length<2)return 0;C.sort((a,b)=>b.length-a.length);const main=C[0].slice();let moved=0;
 for(const c of C.slice(1)){let best=null;for(let dx=-8;dx<=8;dx++)for(let dz=-8;dz<=8;dz++)for(let dy=-12;dy<=12;dy++){const d=Math.abs(dx)+Math.abs(dz)+Math.abs(dy)*.4;if(best&&d>=best.d)continue;
   const T=c.map(o=>({...o,x:o.x+dx,z:o.z+dz,y:o.y+dy}));if(!T.some(t=>main.some(m=>G13_touch(t,m))))continue;if(!G13_free(T,c))continue;best={d,dx,dz,dy}}
  if(!best)continue;for(const o of c){o.x+=best.dx;o.z+=best.dz;o.y+=best.dy}main.push(...c);moved++}return moved}
function G13_join(){const S=SL.sel.slice();if(!S.length)return;const g0=S[0].g;
 if(g0&&S.every(o=>o.g===g0&&o.j)){SL_group();for(const o of S)delete o.j;GS_tip('Split · the parts are loose again');GB_refresh();SL_set(S);G13_ui();return}
 if(S.length<2){GS_tip('Select 2 or more parts to JOIN');return}GB_snap();const n=G13_snap(S);GB_.undo.pop();
 const g=GX_make();if(!g)return;for(const o of GB_list())if(o.g===g)o.j=1;const k=GB_list().filter(o=>o.j).reduce((s,o)=>s.add(o.g),new Set()).size;GX_setName(g,'🔗 Piece '+k);GX.open=0;GX.act=0;
 GB_refresh();SL_set(S);GS_tip('🔗 Joined · '+S.length+' parts are one piece'+(n?' (snapped together)':''));try{AU.sfx('brick')}catch(e){}GX_ui();G13_ui()}
// ---------- 5) the bars
function G13_mk(){const P=$('#gbBkP'),T=$('#gbBkP .r2BkT');if(!P||!T)return;
 if(!$('#g13Ch')){const C=document.createElement('div');C.id='g13Ch';C.innerHTML='<label class="g13Q"><i>🔍</i><input id="g13Qi" type="search" placeholder="Search parts" autocomplete="off" enterkeyhint="search"></label><button class="g13Ca" data-g13="cat"></button>';
  P.insertBefore(C,$('#gxCh')||$('#gbBkPc'));for(const k of['pointerdown','pointerup','touchstart'])C.addEventListener(k,e=>e.stopPropagation());const I=C.querySelector('input');I.addEventListener('input',()=>G13_search(I.value));I.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Escape'||e.key==='Enter')I.blur()});
  C.addEventListener('click',e=>{const b=e.target.closest('[data-g13]');if(!b)return;e.stopPropagation();try{AU.sfx('pick')}catch(_){}G13.pad=0;G13_pop(G13_pop.k==='cat'?null:'cat')})}
 if(!T.querySelector('[data-g13="parts"]')){T.insertAdjacentHTML('afterbegin','<button class="r2T" data-g13="parts"><i>🧱</i>PARTS</button><button class="r2T" data-g13="tray"><i>🧺</i>TRAY</button>');
  T.addEventListener('click',e=>{const b=e.target.closest('[data-g13]');if(!b)return;e.stopPropagation();try{AU.sfx('pick')}catch(_){}const k=b.dataset.g13;R2_pop(null);G13_pop(null);
   if(k==='parts'){if(G13.tray||G13.q){G13.tray=0;const I=$('#g13Qi');if(I)I.value='';G13.q='';G13_cat(GX.cat||GB_.ct||'Bricks');if(!GX.big){GX.big=1;GX_save();GX_lay()}}else{GX.big=GX.big?0:1;GX_save();GX_lay()}}
   else if(k==='tray'){if(G13.tray){G13.tray=0;G13_cat(GX.cat||GB_.ct||'Bricks')}else{const I=$('#g13Qi');if(I)I.value='';G13.q='';if(!GX.big){GX.big=1;GX_save();GX_lay()}G13_cat('tray')}}G13_ui()},true)}
 const mo=$('#r2More');if(mo&&!mo.querySelector('[data-g13m]')){mo.insertAdjacentHTML('afterbegin',[['mir','⇋','MIRROR'],['grp','⛓','GROUPS'],['ha','◨','HIDE UP'],['keys','⌨','KEYS']].map(([a,i,n])=>`<button class="r2T" data-g13m="${a}"><i>${i}</i>${n}</button>`).join(''));
  mo.addEventListener('click',e=>{const b=e.target.closest('[data-g13m]');if(!b)return;e.stopPropagation();R2_pop(null);const a=b.dataset.g13m,px=s=>{const t=$(s);if(t)t.click()};
   if(a==='mir')px('#gbBkP [data-r2b="mir"]');else if(a==='grp')px('#gbBkP [data-gx="grp"]');else if(a==='ha'){if(!B25.on)px('#b25 [data-b25="lay"]');px('#b25 .gxHa')}else GS_tip('R turn · T tip · F roll · Shift = back · S select · G groups');G13_ui()},true)}
 const P2=$('#gbBkPc');if(P2&&!P2.dataset.g13){P2.dataset.g13=1;P2.addEventListener('click',e=>{const a=e.target.closest('.g13Add');if(!a)return;e.preventDefault();e.stopImmediatePropagation();const b=a.closest('.gbPc');if(b)G13_tAdd(b.dataset.p,G13.tray?-1:1)},true);
  P2.addEventListener('pointerdown',e=>{if(e.target.closest('.g13Add'))e.stopPropagation()},true)}
 const G=$('#gsBar');if(G&&!G.querySelector('[data-g13p]')){const b=document.createElement('button');b.dataset.g13p=1;b.innerHTML='<i>⟲</i>AXES';const r=G.querySelector('[data-g="rot"]');(r||G.lastChild).after(b);
  G.addEventListener('click',e=>{const x=e.target.closest('[data-g13p]');if(!x)return;e.stopPropagation();try{AU.sfx('pick')}catch(_){}G13.pad=G13.pad?0:1;if(G13.pad)G13_gizShow(G13.last||'y',0);else G13_gizHide();G13_ui()},true)}
 const B=$('#slBar');if(B&&!B.querySelector('[data-g13s]')){B.insertAdjacentHTML('beforeend','<button data-g13s="join"><i>🔗</i><span>JOIN</span></button><button data-g13s="turn"><i>⟲</i><span>TURN</span></button><button data-g13s="more"><i>⋯</i><span>MORE</span></button>');
  B.addEventListener('click',e=>{const x=e.target.closest('[data-g13s]');if(!x)return;e.stopPropagation();try{AU.sfx('pick')}catch(_){}const a=x.dataset.g13s;
   if(a==='join')G13_join();else if(a==='turn'){G13.pad=G13.pad?0:1;if(G13.pad)G13_gizShow(G13.last||'y',0);else G13_gizHide()}else B.classList.toggle('g13X');G13_ui()},true)}
 if(!$('#g13Pad')){const v=$('#gbx .gbv');if(v){const D=document.createElement('div');D.id='g13Pad';D.hidden=true;
  D.innerHTML=[['y','⟳','Y'],['x','⤼','X'],['z','⤻','Z'],['q','◇','45°'],['up','▲','UP'],['dn','▼','DOWN']].map(([a,i,n])=>`<button data-g13a="${a}" class="g13A${a}"><i>${i}</i>${n}</button>`).join('');v.appendChild(D);for(const k of['pointerdown','pointerup'])D.addEventListener(k,e=>e.stopPropagation());
  D.addEventListener('click',e=>{const x=e.target.closest('[data-g13a]');if(!x)return;e.stopPropagation();const a=x.dataset.g13a;if(a==='up'||a==='dn'){const s=$(`#gsBar [data-g8="${a==='up'?1:-1}"]`);if(s)s.click();return}G13_turn(a,1);G13_gizShow(a,0)})}}
 if(!$('#g13Pop')){const X=$('#gbx');if(X){const D=document.createElement('div');D.id='g13Pop';D.hidden=true;X.appendChild(D);for(const k of['pointerdown','pointerup'])D.addEventListener(k,e=>e.stopPropagation());
  D.addEventListener('click',e=>{const b=e.target.closest('[data-g13c]');if(!b)return;e.stopPropagation();try{AU.sfx('pick')}catch(_){}const I=$('#g13Qi');if(I)I.value='';G13.q='';G13_pop(null);if(!GX.big){GX.big=1;GX_save();GX_lay()}G13_cat(b.dataset.g13c)})}}}
function G13_pop(k){G13_pop.k=k;const D=$('#g13Pop');if(!D)return;D.hidden=!k;if(!k)return;const cur=G13.tray?'tray':(GX.cat||GB_.ct);
 D.innerHTML=[['tray','🧺 TRAY']].concat(G13_catList()).map(([c,t])=>`<button data-g13c="${c}" class="${c===cur&&!G13.q?'on':''}">${t}</button>`).join('');
 const a=$('#g13Ch .g13Ca'),X=$('#gbx');if(a&&X){const r=a.getBoundingClientRect(),q=X.getBoundingClientRect();D.style.left=Math.max(8,r.left-q.left)+'px';D.style.bottom=Math.max(8,q.bottom-r.top+6)+'px'}}
function G13_ui(){if(!GB_.bk){G13_gizHide();return}G13_mk();const T=$('#gbBkP .r2BkT');
 if(T){const pb=T.querySelector('[data-g13="parts"]'),tb=T.querySelector('[data-g13="tray"]'),n=Object.keys(G13_tGet()).length;
  if(pb)pb.classList.toggle('on',!!GX.big&&!G13.tray&&!G13.q);if(tb){tb.classList.toggle('on',!!G13.tray);tb.innerHTML=`<i>🧺</i>TRAY${n?'<b class="g13N">'+n+'</b>':''}`}
  const cb=T.querySelector('[data-r2b="col"]');if(cb&&!cb.dataset.g13){cb.dataset.g13=1;cb.lastChild.textContent='PAINT'}}
 const a=$('#g13Ch .g13Ca');if(a){const t=G13_catName()+' ▾';if(a.textContent!==t)a.textContent=t}
 const I=$('#g13Qi');if(I&&document.activeElement!==I&&I.value.trim().toLowerCase()!==G13.q)I.value=G13.q;
 const held=!!(GS.held||SL.carry),sel=GB_.tool==='sel'&&SL.sel.length>0&&!SL.carry,D=$('#g13Pad');if(!held&&!sel)G13.pad=0;
 if(D){D.hidden=!G13.pad;D.classList.toggle('g13Sel',!held);const G=$('#gsBar'),S=$('#slBar'),host=held?G:S,X=$('#gbx');
  if(G13.pad&&host&&!host.hidden&&X){const r=host.getBoundingClientRect(),q=X.getBoundingClientRect();D.style.left=(r.right-q.left+12)+'px';D.style.top=(r.top-q.top)+'px'}}
 const G=$('#gsBar');if(G){const x=G.querySelector('[data-g13p]');if(x)x.classList.toggle('on',!!G13.pad);G.classList.toggle('g13P',!!G13.pad)}
 const S=$('#slBar');if(S){if(!sel)S.classList.remove('g13X');const j=S.querySelector('[data-g13s="join"] span'),s0=SL.sel[0];if(j)j.textContent=s0&&s0.g&&s0.j&&SL.sel.every(o=>o.g===s0.g)?'SPLIT':'JOIN';
  const t=S.querySelector('[data-g13s="turn"]');if(t)t.classList.toggle('on',!!G13.pad)}
 // the palette tile of a tipped part stays lit
 const bp=G13_base(GB_.pc);if(bp!==GB_.pc)for(const b of GX_tiles())b.classList.toggle('on',b.dataset.p===bp);
 if(G13.tray)G13_badges();else if(!G13_ui.bd){G13_ui.bd=1;G13_badges()}
 if(G13.giz&&G13.giz.visible&&G13.pad){const p=G13_gizAt();if(p)G13.giz.position.set(p[0],p[1],p[2]);else G13_gizHide()}}
GB_ui=(f=>function(){const r=f.apply(this,arguments);try{G13_ui()}catch(e){console.warn('G13',e)}return r})(GB_ui);
GS_ui=(f=>function(){const r=f.apply(this,arguments);try{G13_ui()}catch(e){console.warn('G13',e)}return r})(GS_ui);
SL_ui=(f=>function(){const r=f.apply(this,arguments);try{G13_ui()}catch(e){}return r})(SL_ui);
// a category / fav / recent chip ends search and tray mode; leaving the builder hides the gizmo
GX_cat=(f=>function(c){if(c!=='tray'){G13.tray=0}const r=f.apply(this,arguments);if(G13.q){const q=G13.q;G13.q='';const I=$('#g13Qi');if(I&&document.activeElement!==I)I.value=''}G13_badges();G13_ui();return r})(GX_cat);
GB_exit=(f=>function(){G13.pad=0;G13_gizHide();G13_pop(null);return f.apply(this,arguments)})(GB_exit);
GX_pal=(f=>function(){const r=f.apply(this,arguments);if(G13.q){const S=$('#gbBkPc');if(S)for(const e of S.querySelectorAll('.gxEm:not(.g13Em)'))e.hidden=true}return r})(GX_pal);
// view column: only the current view shows; tapping it goes to the next (3D → TOP → SIDE)
addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#b25 .b25V button.on');if(!b||!GB_.bk)return;e.preventDefault();e.stopImmediatePropagation();
 const V=['3d','top','side'],n=V[(V.indexOf(b.dataset.b25)+1)%3],t=$(`#b25 [data-b25="${n}"]`);if(t)t.click()},true);
addEventListener('pointerdown',e=>{if(!G13_pop.k)return;if(e.target.closest&&e.target.closest('#g13Pop,#g13Ch'))return;G13_pop(null)},true);
{const st=document.createElement('style');st.textContent=`
#gbx.r2.gbBk #gxCh{display:none!important}
#gbx.r2 #r2More{max-width:min(700px,calc(100vw - 160px));gap:8px 10px}#gbx.r2 #r2More .r2T{height:40px;min-width:0;padding:0 10px;flex-direction:row;gap:4px}
#gbx.r2.gbBk #g13Ch{pointer-events:auto;display:flex;align-items:center;gap:12px;min-width:0;height:48px}#gbx:not(.gbBk) #g13Ch{display:none}
#gbx.r2.gbBk.gxBig #g13Ch{grid-row:1;grid-column:1}
#g13Ch .g13Q{display:flex;align-items:center;gap:4px;height:44px;flex:0 1 168px;min-width:104px;padding:0 8px;border:2px solid #141413;border-radius:12px;background:#fff;box-shadow:0 2px 0 #141413}
#g13Ch .g13Q i{font-style:normal;font-size:15px}#g13Ch input{flex:1;min-width:0;border:0;outline:0;background:transparent;font:800 14px system-ui;color:#141413}
#g13Ch .g13Ca{flex:0 1 auto;max-width:150px;height:44px;padding:0 12px;border-radius:12px;border:2px solid #141413;background:#ffd400;color:#141413;font:italic 900 12px system-ui;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;box-shadow:0 2px 0 #141413}
#gbx.r2.gbBk .r2BkT{gap:12px}
#gbx.r2.gbBk .r2BkT [data-r2b="mir"],#gbx.r2.gbBk .r2BkT [data-gx="grp"]{display:none!important}
#gbx.r2.gbBk .r2BkT [data-g13="parts"]{order:-3}#gbx.r2.gbBk .r2BkT [data-g13="tray"]{order:-2;position:relative}#gbx.r2.gbBk .r2BkT [data-r2b="sel"]{order:-1}
#gbx .r2BkT [data-g13].on{background:#ffd400}.g13N{position:absolute;top:-6px;right:-6px;min-width:18px;height:18px;border-radius:9px;background:#e3000b;color:#fff;font:900 12px/18px system-ui;font-style:normal}
#gbx.r2.gbBk:not(.gxBig) #g13Ch{display:none}
#b25 .b25V button:not(.on){display:none!important}#b25 .gxHa{display:none!important}
#gbBkPc .gbPc{position:relative}
#gbBkPc .g13Add{position:absolute;top:1px;right:1px;width:24px;height:24px;border-radius:8px;background:#1b2433;color:#fff;font:900 16px/22px system-ui;text-align:center;border:1px solid #fff;z-index:2}
#gbBkPc .g13Ct{position:absolute;top:1px;left:1px;min-width:20px;height:18px;padding:0 3px;border-radius:8px;background:#ffd400;color:#141413;font:900 12px/18px system-ui;z-index:2}#gbBkPc .g13Ct.ok{background:#38d16a}
#g13Pop,#g13Pad{pointer-events:auto}
#g13Pop,#g13Pad{pointer-events:auto}
#g13Pop{position:absolute;z-index:80;display:grid;grid-template-columns:repeat(5,auto);gap:8px 12px;padding:10px;background:#fff;border:2px solid #141413;border-radius:14px;box-shadow:0 4px 0 #141413;max-width:620px}
#g13Pop[hidden]{display:none}#g13Pop button{height:38px;padding:0 12px;border-radius:10px;border:2px solid #141413;background:#fff;font:italic 900 12px system-ui;color:#141413;white-space:nowrap}#g13Pop button.on{background:#ffd400}
#g13Pad{position:absolute;z-index:31;display:grid;grid-template-columns:repeat(2,64px);gap:8px}#g13Pad[hidden]{display:none}
#g13Pad button{height:44px;border-radius:10px;border:2px solid #141413;background:#fff;color:#141413;font:italic 900 12px system-ui;display:flex;flex-direction:column;align-items:center;justify-content:center;line-height:1;box-shadow:0 2px 0 #141413}
#g13Pad button i{font-style:normal;font-size:16px}#g13Pad .g13Ax{border-color:#d0281e}#g13Pad .g13Ay{border-color:#1f9d45}#g13Pad .g13Az{border-color:#1f5fd6}#g13Pad.g13Sel .g13Aup,#g13Pad.g13Sel .g13Adn{display:none}
#gbx.r2 #gsBar .g8St{display:none!important}#gbx.r2 #gsBar,#gbx.r2 #slBar{gap:12px}#gbx.r2 #gsBar [data-g13p].on,#gbx.r2 #slBar [data-g13s].on{background:#ffd400}
#gbx.r2 #slBar [data-s="rot"],#gbx.r2 #slBar [data-s="col"],#gbx.r2 #slBar [data-s="del"],#gbx.r2 #slBar [data-s="up"],#gbx.r2 #slBar [data-s="none"],#gbx.r2 #slBar [data-s="dup"]{display:none}
#gbx.r2 #slBar.g13X [data-s="col"],#gbx.r2 #slBar.g13X [data-s="del"],#gbx.r2 #slBar.g13X [data-s="up"],#gbx.r2 #slBar.g13X [data-s="none"],#gbx.r2 #slBar.g13X [data-s="dup"]{display:flex}
#gbx.r2 #slBar.g13X [data-s="grp"],#gbx.r2 #slBar.g13X [data-s="move"],#gbx.r2 #slBar.g13X [data-g13s="join"],#gbx.r2 #slBar.g13X [data-g13s="turn"]{display:none}
#gbx.r2 #slBar [data-g13s="more"]{order:9}#gbx.r2 #slBar.g13X [data-g13s="more"]{background:#ffd400}
`;document.head.appendChild(st)}
// ---------- 6) new parts (docs/GARAGE13_PARTS.md): true LEGO proportions, stud 8 mm = GB_U, plate 3.2 mm = GB_PH, brick = 3 plates.
// front of a part = -z (like the headlight 'hl'); SNOT studs face -z. Element lists: 40468 Yellow Taxi, 76916, 76920, 31127, 60371.
if(!CR_CATS.includes('SNOT'))CR_CATS.splice(CR_CATS.indexOf('Slopes')+1,0,'SNOT');
const G13_NEW={
 t2c:['Tile corner 2×2',2,2,1,'Tiles',14719],t11h:['Tile 1×1 half round',1,1,1,'Tiles',35399],t12h:['Tile 1×2 half round',2,1,1,'Tiles',1748],
 t22c:['Tile 2×2 cut corner',2,2,1,'Tiles',35787],t2t:['Tile 2×2 triangle',2,2,1,'Tiles',27263],t12hd:['Tile 1×2 handle',1,2,1,'Tiles',2432],
 s11d:['Slope 45 1×1 double',1,1,2,'Slopes',35464],inv22:['Inv. slope 2×2',2,2,3,'Slopes',3660],cs31:['Curved slope 3×1',1,3,2,'Slopes',50950],
 s65:['Slope 65 2×2',2,2,6,'Slopes',3678],cwL:['Curved wedge 1×2 L',1,2,2,'Slopes',29120],cwR:['Curved wedge 1×2 R',1,2,2,'Slopes',29119],ib22:['Inv. curve 2×2',2,2,2,'Slopes',32803],
 wp22:['Wedge plate 2×2',2,2,1,'Plates',26601],cp22:['Corner plate 2×2',2,2,1,'Plates',2420],pr12:['Plate 1×2 rounded',1,2,1,'Plates',35480],ph12:['Plate 1×2 handle',2,1,1,'Plates',2540],
 br11u:['Bracket 1×1 up',1,1,3,'SNOT',36840],br11d:['Bracket 1×1 down',1,1,3,'SNOT',36841],br22:['Bracket 1×2–2×2',2,1,5,'SNOT',21712],br24:['Bracket 1×2–2×4',4,1,5,'SNOT',21731],
 br14:['Bracket 1×2–1×4',4,1,3,'SNOT',28802],b12s4:['Brick 1×2 4 side studs',2,1,3,'SNOT',52107],b12s:['Brick 1×2 side studs',2,1,3,'SNOT',11211],
 gb12:['Grille brick 1×2',2,1,3,'SNOT',2877],pb14:['Profile brick 1×4',4,1,3,'SNOT',15533],rp1h:['Round plate 1×1 hole',1,1,1,'Round',28626],pbar:['Plate 1×1 with bar',1,1,3,'Vehicle',31561]};
for(const k in G13_NEW){const[n,w,d,h,cat,id]=G13_NEW[k];GB_PC[k]={n,w,d,h,cat,ic:'▭',g:cat==='Tiles'?'T':undefined};G13_ID[k]=id}
Object.assign(G13_ID,{b11:3005,b12:3004,b22:3003,b24:3001,b13:3622,b14:3010,b16:3009,b18:3008,b23:3002,b26:2456,b28:3007,p11:3024,p12:3023,p13:3623,p14:3710,p16:3666,p18:3460,p22:3022,p23:3021,p24:3020,p26:3795,p28:3034,p44:3031,p46:3032,p66:3958,
 t11:3070,tile:3069,t13:63864,t14:2431,t16:6636,t18:4162,t22:3068,t23:26603,t24:87079,t26:69729,t44:1751,grl:2412,jmp:15573,rt:98138,rt22:14769,qt11:25269,mac:27925,st12:85984,ch:54200,s21:3040,s22:3039,inv:3665,cs12:11477,cs14:11153,cs22:15068,cs24:88930,ics:24201,hl:4070,wl:41770,wr:41769});
const G13_AL={hl:'headlight brick',grl:'grille tile radiator',gb12:'grille profile',jmp:'jumper',ch:'cheese slope',b12s:'snot',b12s4:'snot',br22:'angle plate',br24:'angle plate',br14:'angle plate',br11u:'snot',br11d:'snot',t12hd:'clamp',pbar:'antenna mirror shaft',rp1h:'exhaust lamp'};
GB_piece=(f=>function(t,c,M,L){const P=GB_PC[t];if(!P||!G13_NEW[t])return f(t,c,M,L);
 const U=GB_U,W=P.w*U,D=P.d*U,H=P.h*GB_PH,g=.008,col=GB_BC[c]||c,x0=-W/2+g,x1=W/2-g,z0=-D/2+g,z1=D/2-g,PH=GB_PH,dk='#1b1d22';
 const arc=(cx,cz,r,a0,a1,n)=>{const o=[];for(let i=0;i<=n;i++){const a=a0+(a1-a0)*i/n;o.push([cx+Math.cos(a)*r,cz+Math.sin(a)*r])}return o};
 const sst=(x,y,z,s=-1)=>{const q=new THREE.CylinderGeometry(.18,.18,.11,12);q.rotateX(s*Math.PI/2);q.translate(x,y,z+s*.055);M.push(GB_col(q,col))};// a stud facing ±z
 const bar=(x0_,x1_,y,z,r=.12)=>{const q=new THREE.CylinderGeometry(r,r,x1_-x0_,10);q.rotateZ(Math.PI/2);q.translate((x0_+x1_)/2,y,z);M.push(GB_col(q,col))};
 const vplate=(xa,xb,ya,yb,nx,ny)=>{M.push(CR_bb(xa,xb,ya,yb,z0,z0+PH,col));for(let i=0;i<nx;i++)for(let j=0;j<ny;j++)sst(xa+(i+.5)*(xb-xa)/nx,ya+(j+.5)*(yb-ya)/ny,z0)};
 if(t==='t2c')M.push(CR_top([[x0,z0],[x1,z0],[x1,0],[0,0],[0,z1],[x0,z1]],0,H,col));
 else if(t==='t11h')M.push(CR_top([[x1,z1],[x0,z1],[x0,0]].concat(arc(0,0,W/2-g,Math.PI,2*Math.PI,12)),0,H,col));
 else if(t==='t12h')M.push(CR_top([[x1,z1],[x0,z1]].concat(arc(0,z1,W/2-g,Math.PI,1.5*Math.PI,10).map(([x,z])=>[x,z1+(z-z1)*(D-2*g)/(W/2-g)]),arc(0,z1,W/2-g,1.5*Math.PI,2*Math.PI,10).map(([x,z])=>[x,z1+(z-z1)*(D-2*g)/(W/2-g)])),0,H,col));
 else if(t==='t22c')M.push(CR_top([[x0+U,z0],[x1,z0],[x1,z1],[x0,z1],[x0,z0+U]],0,H,col));
 else if(t==='t2t')M.push(CR_top([[x1,z0],[x1,z1],[x0,z1]],0,H,col));
 else if(t==='t12hd'){M.push(CR_bb(x0,x1,0,H,z0,z1,col));for(const z of[z0+.12,z1-.12])M.push(GB_cyl(.07,.16,0,H,z,col,8));const q=new THREE.CylinderGeometry(.075,.075,D-.24,10);q.rotateX(Math.PI/2);q.translate(0,H+.16,0);M.push(GB_col(q,col))}
 else if(t==='s11d'){M.push(CR_side([[z1,0],[z1,H*.15],[0,H],[z0,H*.15],[z0,0]],x0,x1,col))}
 else if(t==='inv22'){M.push(CR_side([[z0,H],[z1,H],[z1,0],[z1-.06,0],[z0,H*.62]],x0,x1,col));CR_studs(M,P.w,P.d,H,col)}
 else if(t==='cs31')M.push(CR_side([[z1,0],[z1,H],['q',z0+D*.35,H,z0,H*.14],[z0,0]],x0,x1,col));
 else if(t==='s65'){M.push(CR_side([[z1,0],[z1,H],[z1-U*.5,H],[z0,H*.12],[z0,0]],x0,x1,col));CR_studs(M,P.w,1,H,col);for(let i=M.length-P.w*2;i<M.length;i++)M[i].translate(0,0,D/2-U/2-.02)}
 else if(t==='cwL'||t==='cwR'){const s=t==='cwL'?1:-1,pts=[[x0,z1],[x1,z1],[x1,z0+U*.9],[x0,z0+U*.1]].map(([x,z])=>[x*s,z]);M.push(CR_top(s>0?pts:pts.reverse(),0,PH,col));
  M.push(CR_side([[z1,PH],[z1,H],['q',z0+D*.4,H,z0+U*.5,PH]],x0,x1,col))}
 else if(t==='ib22'){M.push(CR_side([[z0,H],[z1,H],[z1,0],['q',z0+D*.2,0,z0,H*.75]],x0,x1,col));CR_studs(M,P.w,P.d,H,col)}
 else if(t==='wp22'){M.push(CR_top([[x0+U,z0],[x1,z0],[x1,z1],[x0,z1],[x0,z0+U]],0,H,col));CR_studs(M,2,2,H,col,(x,z)=>!(x<0&&z<0))}
 else if(t==='cp22'){M.push(CR_top([[x0,z0],[x1,z0],[x1,0],[0,0],[0,z1],[x0,z1]],0,H,col));CR_studs(M,2,2,H,col,(x,z)=>!(x>0&&z>0))}
 else if(t==='pr12'){M.push(CR_top(arc(0,z1-U/2,W/2-g,0,Math.PI,10).concat(arc(0,z0+U/2,W/2-g,Math.PI,2*Math.PI,10)),0,H,col));CR_studs(M,1,2,H,col)}
 else if(t==='ph12'){M.push(CR_bb(x0,x1,0,H,z0+.1,z1,col));CR_studs(M,2,1,H,col);for(const x of[x0+.08,x1-.08])M.push(GB_box(x-.07,x+.07,.02,H-.02,z0-.1,z0+.12,col));bar(x0+.08,x1-.08,H/2,z0-.06,.075)}
 else if(t==='br11u'||t==='br11d'){const up=t==='br11u',yb=up?0:H-PH;M.push(CR_bb(x0,x1,yb,yb+PH,z0,z1,col));CR_stud(M,0,yb+PH,0,col);vplate(x0,x1,up?0:.04,up?H:H-PH,1,1)}
 else if(t==='b11s'){M.push(CR_bb(x0,x1,0,H,z0,z1,col));CR_stud(M,0,H,0,col);sst(0,H/2,z0)}
 else if(t==='br12u'||t==='br12d'){const up=t==='br12u',yb=up?0:H-PH;M.push(CR_bb(x0,x1,yb,yb+PH,z0,z1,col));CR_studs(M,2,1,yb+PH,col);vplate(x0,x1,up?0:.04,up?H:H-PH,2,1)}
 else if(t==='br22'||t==='br24'||t==='br14'){const yb=0;M.push(CR_bb(-U+g,U-g,yb,yb+PH,z0,z1,col));CR_stud(M,-U/2,PH,0,col);CR_stud(M,U/2,PH,0,col);vplate(x0,x1,0,H,P.w,t==='br14'?1:2)}
 else if(t==='b12s4'||t==='b12s'){M.push(CR_bb(x0,x1,0,H,z0,z1,col));CR_studs(M,2,1,H,col);for(const x of[-U/2,U/2]){sst(x,H/2,z0);if(t==='b12s4')sst(x,H/2,z1,1)}}
 else if(t==='gb12'||t==='pb14'){M.push(CR_bb(x0,x1,0,H,z0+.05,z1,col));CR_studs(M,P.w,1,H,col);const n=t==='gb12'?3:1;
  for(let i=0;i<=n;i++){const y0=n===1?0:i*H/n,y1=n===1?H:y0;if(n===1){M.push(GB_box(x0,x1,0,H*.38,z0,z0+.06,col));M.push(GB_box(x0,x1,H*.62,H,z0,z0+.06,col))}else if(i<n)M.push(GB_box(x0,x1,i*H/n+.05,(i+1)*H/n-.08,z0,z0+.06,col))}}
 else if(t==='rp1h'){M.push(GB_cyl(W/2-g,H,0,0,0,col,20));const d=new THREE.CircleGeometry(.12,14);d.rotateX(-Math.PI/2);d.translate(0,H+.003,0);M.push(GB_col(d,dk))}
 else if(t==='pbar'){M.push(CR_bb(x0,x1,0,PH,z0,z1,col));M.push(GB_cyl(.12,H-PH,0,PH,0,col,10))}})(GB_piece);
// palette tiles for the new parts (the palette was built before this module), sorted into their category
{const S=$('#gbBkPc');if(S)for(const k in G13_NEW){const P=GB_PC[k];if(S.querySelector(`.gbPc[data-p="${k}"]`))continue;const b=document.createElement('button');b.className='gbPc';b.dataset.p=k;b.dataset.ct=P.cat;b.dataset.n=P.n;b.innerHTML=`<i>${P.ic}</i>${P.n}`;b.style.display=GB_.ct===P.cat?'':'none';
  const last=[...S.querySelectorAll(`.gbPc[data-ct="${P.cat}"]`)].pop();if(last)last.after(b);else S.appendChild(b)}}
window.__g13={pc:()=>Object.entries(GB_PC).map(([k,v])=>k+':'+v.n+':'+v.w+'x'+v.d+'x'+v.h+':'+(v.cat||'')).join('|'),turn:G13_turn,ori:t=>G13_ori(t),def:k=>GB_PC[k],search:G13_search,tray:()=>G13_tGet(),tAdd:G13_tAdd,join:G13_join,comps:S=>G13_comps(S).length,st:()=>({held:!!GS.held,sel:SL.sel.length,tool:GB_.tool,n:GB_list().length,q:G13.q,tray:G13.tray,pad:G13.pad,pc:GB_.pc,rot:GB_.rot,giz:!!(G13.giz&&G13.giz.visible)})};
