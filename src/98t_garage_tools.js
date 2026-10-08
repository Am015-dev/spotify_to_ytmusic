// ---- G8: builder camera on the phone, brick-shower transition, STEP VERTICAL, REDO (garage worker 8, docs/GARAGE2K_GAP.md gaps 4-6)
// 1) phone camera: a lower 3/4 view so the workshop (walls, roller doors, GARAGE sign, crew) fills the back of the shot like the 2K Body Shop,
//    and the view is shifted so the car sits in the free band between the top toolbar and the parts palette.
// 2) brick shower: LEGO bricks pour across the screen when you enter or leave the builder. 3) STEP ▲/▼ moves the held part a plate up/down
//    (it must still touch something: rest on, hang under or sit beside a part or the chassis). 4) REDO next to UNDO (Ctrl+Y / Ctrl+Shift+Z).
const G8={T:{pit:.15,k:.92,top:6,bot:4,dur:1},redo:[],sh:null,nSh:0};
// ---------- 1) camera
function G8_band(){const c=$('#gbC').getBoundingClientRect(),t=$('#gbBkT'),p=$('#gbBkP');let y0=c.top,y1=c.bottom;
 if(t&&t.offsetParent){let m=0;for(const e of t.querySelectorAll('button,#gbBkN'))if(e.offsetParent&&!e.closest('#gbBkS'))m=Math.max(m,e.getBoundingClientRect().bottom);if(m)y0=m}
 if(p&&p.offsetParent){const r=p.getBoundingClientRect();if(r.height)y1=Math.min(y1,r.top)}return[y0-c.top+G8.T.top,y1-c.top-G8.T.bot,c.height,c.width]}
GB_cam=(f=>function(){f();if(!GB_.bk||innerHeight>500)return;const C=GB.cam,k=G8.T.k;C.position.set(C.position.x*k,.5+(C.position.y-.5)*k,C.position.z*k);C.lookAt(0,.5,0);
 const[a,b,h,w]=G8_band();if(b-a<60)return;const oy=Math.round(h/2-(a+b)/2),v=C.view;if(!v||!v.enabled||v.offsetY!==oy||v.fullWidth!==w||v.fullHeight!==h)C.setViewOffset(w,h,0,oy,w,h);C.updateMatrixWorld()})(GB_cam);
GB_enter=(f=>function(){const was=GB_.bk,r=f.apply(this,arguments);if(!was&&GB_.bk){if(innerHeight<=500)GB_.pit=G8.T.pit;G8.redo=[];G8_ui();G8_shower(1)}return r})(GB_enter);
GNB_new=(f=>function(){const r=f.apply(this,arguments);if(innerHeight<=500)GB_.pit=G8.T.pit;return r})(GNB_new);
GB_exit=(f=>function(){const was=GB_.bk,r=f.apply(this,arguments);if(was&&!GB_.bk)G8_shower(0);return r})(GB_exit);
// ---------- 2) brick shower: one full-screen 2D canvas, ~70 bricks, 0.9 s, then removed (no pointer events, never blocks a tap)
function G8_shower(enter){if(G8.sh&&G8.sh.t0)G8.sh.t0-=400;const cv=document.createElement('canvas'),W=innerWidth,H=innerHeight,dp=Math.min(2,devicePixelRatio||1);cv.width=W*dp;cv.height=H*dp;
 cv.id='g8Sh';cv.style.cssText='position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:9999';document.body.appendChild(cv);const g=cv.getContext('2d'),N=70,B=[];
 for(let i=0;i<N;i++){const s=(16+Math.random()*22)*Math.max(.8,Math.min(1.4,H/500)),n=1+(Math.random()*4|0);
  B.push({x:enter?W*Math.random():W*(i/N)+Math.random()*40-20,y:enter?H+s*2+Math.random()*H*.3:-s*2-Math.random()*H*.5,vx:enter?(Math.random()-.5)*W*.5:(Math.random()-.3)*120,vy:enter?-(H*1.3+Math.random()*H*.9):H*(.6+Math.random()*.6),
   r:Math.random()*6.3,vr:(Math.random()-.5)*9,s,n,c:GB_BC[i%GB_BC.length],d:Math.random()*.25})}
 const S={cv,t0:0,B};G8.sh=S;G8.nSh++;try{AU.sfx('brick')}catch(e){}
 const shade=(c,k)=>{const n=parseInt(c.slice(1),16),f=v=>Math.max(0,Math.min(255,Math.round(v*k)));return`rgb(${f(n>>16)},${f(n>>8&255)},${f(n&255)})`};
 const draw=now=>{if(!S.t0)S.t0=now;const t=(now-S.t0)/1000/G8.T.dur;g.setTransform(dp,0,0,dp,0,0);g.clearRect(0,0,W,H);if(t>1.05||!cv.isConnected){cv.remove();if(G8.sh===S)G8.sh=null;return}
  for(const q of B){const u=t-q.d;if(u<0)continue;const x=q.x+q.vx*u,y=q.y+q.vy*u+(enter?H*1.6:H*.5)*u*u,w=q.s*q.n*.62+q.s*.4,h=q.s*.62;g.save();g.translate(x,y);g.rotate(q.r+q.vr*u);g.globalAlpha=Math.min(1,(1.05-t)*5);
   g.fillStyle=shade(q.c,.62);g.fillRect(-w/2,-h/2+h*.25,w,h);g.fillStyle=q.c;g.fillRect(-w/2,-h/2,w,h*.8);g.fillStyle=shade(q.c,1.25);g.fillRect(-w/2,-h/2,w,h*.12);
   const sw=w/q.n;for(let k=0;k<q.n;k++){const sx=-w/2+sw*(k+.5);g.fillStyle=shade(q.c,.7);g.fillRect(sx-sw*.28,-h/2-h*.22,sw*.56,h*.24);g.fillStyle=q.c;g.fillRect(sx-sw*.28,-h/2-h*.3,sw*.56,h*.14)}g.restore()}
  requestAnimationFrame(draw)};requestAnimationFrame(draw)}
// ---------- 3) STEP VERTICAL: the held part moves one plate up or down to the next spot where it touches something and overlaps nothing
function G8_free(b,y,list){const[fw,fd]=GB_dims(b),h=GB_PC[b.t].h;let bmax=-1e9,floor=1e9,touch=0;for(const k in GB_.base){bmax=Math.max(bmax,GB_.base[k]);floor=Math.min(floor,GB_.base[k])}if(y+h>bmax+GB_CAP)return 0;
 for(let i=b.x;i<b.x+fw;i++)for(let j=b.z;j<b.z+fd;j++){if(i<GB_N0||i>GB_N1||j<GB_N0||j>GB_N1)return 0;const s=GB_.base[i+','+j];if(s!=null){if(s>y)return 0;if(s===y)touch=1}}
 if(y<floor)return 0;
 for(let i=b.x-1;i<=b.x+fw;i++)for(let j=b.z-1;j<=b.z+fd;j++){const ins=i>=b.x&&i<b.x+fw&&j>=b.z&&j<b.z+fd;if(ins)continue;const s=GB_.base[i+','+j];if(s!=null&&s>y&&(i===b.x-1||i===b.x+fw)!==(j===b.z-1||j===b.z+fd))touch=1}
 for(const o of list){const[ow,od]=GB_dims(o),oh=GB_PC[o.t].h;const ox=o.x<b.x+fw&&o.x+ow>b.x,oz=o.z<b.z+fd&&o.z+od>b.z,vy=o.y<y+h&&o.y+oh>y;
  if(ox&&oz){if(vy)return 0;if(o.y+oh===y||o.y===y+h)touch=1}else if(vy&&o.x<=b.x+fw&&o.x+ow>=b.x&&o.z<=b.z+fd&&o.z+od>=b.z&&((o.x+ow===b.x||o.x===b.x+fw)!==(o.z+od===b.z||o.z===b.z+fd)))touch=1}
 return touch}
function G8_step(dir){const b=GS.held;if(!b){GS_tip('Tap the car first to hold a part');return 0}const L=GB_list();
 for(let y=b.y+dir;y>=-12&&y<=120;y+=dir)if(G8_free(b,y,L)){const nb={...b,y};GS.held=nb;GB_ghostSet(nb);try{AU.sfx('pick')}catch(e){}GS_ui();GS_tip((dir>0?'▲ Up':'▼ Down')+' · '+(y-G8_top(b))+' plates from the top');return 1}
 try{AU.sfx('bump')}catch(e){}GS_tip(dir>0?'Can\'t go higher here':'Can\'t go lower here');return 0}
function G8_top(b){const y=GB_fit(b,GB_list());return y==null?b.y:y}
// a stepped part keeps its height when you rotate it (if it still fits there)
GS_reheld=(f=>function(){const y=GS.held&&GS.held.y;f();if(y!=null&&GS.held&&GS.held.y!==y&&G8_free(GS.held,y,GB_list())){GS.held={...GS.held,y};GB_ghostSet(GS.held)}})(GS_reheld);
// placing at a stepped height: the same as GB_add but at b.y (the mirror twin only when it fits too)
GS_place=(f=>function(){const b=GS.held;if(!b||b.bad||b.y===G8_top(b))return f();const L=GB_list();if(!G8_free(b,b.y,L)){try{AU.sfx('bump')}catch(e){}return 0}
 const nb={t:b.t,x:b.x,z:b.z,y:b.y,r:b.r%4,m:0,c:b.c},add=[nb];if(GB_.mir){const w=GB_twin(nb);if(w.x!==nb.x&&G8_free(w,w.y,L.concat([nb])))add.push(w)}
 if(L.length+add.length>GB_MAX){if(L.length+1>GB_MAX){GB_msg('Brick budget full · '+GB_MAX);try{AU.sfx('bump')}catch(e){}return 0}add.length=1}
 GB_snap();L.push(...add);GS.held=null;GS.hit=null;try{AU.sfx('brick')}catch(e){}GB_refresh();GS_pop(nb);GS_ui();return add.length})(GS_place);
// ---------- 4) REDO: every new edit (GB_snap) clears it; UNDO feeds it
GB_snap=(f=>function(){f.apply(this,arguments);G8.redo.length=0;G8_ui()})(GB_snap);
GB_undo=function(){if(!GB_.undo.length)return 0;if(GS.held)GS_drop();G8.redo.push(JSON.stringify(GB_list()));GB.d.bricks=JSON.parse(GB_.undo.pop());GB_refresh();try{AU.sfx('pick')}catch(e){}G8_ui();return 1};
function GB_redo(){if(!G8.redo.length)return 0;if(GS.held)GS_drop();GB_.undo.push(JSON.stringify(GB_list()));GB.d.bricks=JSON.parse(G8.redo.pop());GB_refresh();try{AU.sfx('pick')}catch(e){}G8_ui();return 1}
addEventListener('keydown',e=>{if(!GB_.bk||$('#gbx').hidden||!(e.ctrlKey||e.metaKey))return;if(e.code==='KeyY'||(e.code==='KeyZ'&&e.shiftKey)){e.preventDefault();e.stopImmediatePropagation();GB_redo();GB_ui()}},true);
// ---------- UI: REDO button right after UNDO; STEP ▲ / STEP ▼ in the held-part bar
function G8_ui(){const T=$('#gbBkT');if(T){let r=T.querySelector('[data-a="redo"]');const u=T.querySelector('[data-a="undo"]');
  if(!r&&u){r=document.createElement('button');r.dataset.a='redo';r.title='Redo (Ctrl+Y)';r.textContent='↷';r.addEventListener('click',()=>GB_redo());u.after(r)}
  if(u)u.disabled=!GB_.undo.length;if(r)r.disabled=!G8.redo.length}
 const B=$('#gsBar');if(B&&!B.querySelector('[data-g8]')){for(const[d,ic,tx]of[[1,'▲','STEP UP'],[-1,'▼','STEP DOWN']]){const x=document.createElement('button');x.dataset.g8=d;x.className='g8St';x.innerHTML=`<i>${ic}</i>${tx}`;
   x.addEventListener('click',e=>{e.stopPropagation();G8_step(d)});B.appendChild(x)}}}
GS_ui=(f=>function(){const r=f.apply(this,arguments);G8_ui();return r})(GS_ui);
GB_ui=(f=>function(){const r=f.apply(this,arguments);G8_ui();return r})(GB_ui);
{const st=document.createElement('style');st.textContent=`#gbBkT button:disabled{opacity:.4}
#gsBar{grid-template-columns:repeat(2,auto)}#gsBar .gsPl{grid-column:1/3;width:auto}#gsBar button{width:104px}#gsBar .g8St{font-size:12px;letter-spacing:0;gap:4px;padding:0 6px}
@media (max-width:760px),(max-height:500px){#gbx #gbBkT{gap:5px}#gbx #gbBkT button{padding:0 5px}#gsBar{gap:5px}#gsBar button{height:40px;width:106px;font-size:12px;gap:5px;padding:0 6px;white-space:nowrap}#gsBar button i{font-size:15px;width:16px}}`;document.head.appendChild(st)}
window.__g8={S:G8,T:G8.T,redo:()=>GB_redo(),undo:()=>GB_undo(),step:d=>G8_step(d),free:(b,y)=>G8_free(b,y,GB_list()),held:()=>GS.held&&{...GS.held},shower:()=>G8.nSh,showing:()=>!!G8.sh,nRedo:()=>G8.redo.length,band:()=>G8_band()};
// ---- SL: SELECT mode in the brick builder, like the 2K Body Shop (garage worker 8). Also: no dead taps on the car.
// SELECT (toolbar): tap a placed part to select it (cyan glow; with MIRROR on, its mirror twin too; a GROUP is selected whole).
// Bar: MOVE (lift it, then the same preview + PLACE as a new part) · ROTATE · COLOUR (the chosen swatch; tapping a swatch also recolours)
//      · DELETE · COPY (duplicate, then place it) · SELECT UP (+ everything attached above) · GROUP / UNGROUP · ✕ (deselect).
// Dead taps: a tap on the side of the car or on a big part used to aim at a cell with nothing under it, so nothing happened.
// Now the nearest cell where the part fits is used. A finger may wobble 14 px (mouse 8) and hold up to 1.5 s and still count as a tap.
const SL={sel:[],carry:null,hl:null,gid:0};
// ---------- dead taps: nearest cell where the held part fits (clamped into the grid first, then rings up to 3 cells)
GB_cand=(f=>function(hit){const b=f(hit);if(b||!hit||!GB_PC[GB_.pc])return b;const P=GB_PC[GB_.pc],[fw,fd]=GB_.rot%2?[P.d,P.w]:[P.w,P.d],ox=Math.floor((fw-1)/2),oz=Math.floor((fd-1)/2);
 const ci=clamp(hit.i,GB_N0+ox,GB_N1-fw+1+ox),cj=clamp(hit.j,GB_N0+oz,GB_N1-fd+1+oz),O=[];for(let d=-3;d<=3;d++)for(let e=-3;e<=3;e++)O.push([d,e]);O.sort((a,c)=>Math.hypot(a[0],a[1])-Math.hypot(c[0],c[1]));
 for(const[d,e]of O){const r=f({...hit,i:ci+d,j:cj+e});if(r)return r}return null})(GB_cand);
// ---------- selection helpers
const SL_dims=b=>GB_dims(b),SL_h=b=>GB_PC[b.t].h;
const SL_ov=(a,b)=>{const[aw,ad]=SL_dims(a),[bw,bd]=SL_dims(b);return a.x<b.x+bw&&a.x+aw>b.x&&a.z<b.z+bd&&a.z+ad>b.z};
function SL_twin(b){const L=GB_list(),w=GB_twin(b);return L.find(o=>o!==b&&o.t===w.t&&o.x===w.x&&o.z===w.z&&o.y===w.y)}
function SL_set(list){const L=GB_list();SL.sel=[...new Set(list)].filter(b=>L.includes(b));SL_hl();SL_ui()}
function SL_pickSel(cx,cy){const h=GB_pick(cx,cy);if(!h||!h.brick){if(SL.sel.length){SL_set([]);GS_tip('Nothing selected')}else GS_tip('Tap a part of your car to select it');return 0}
 const b=h.brick;let add=[b];if(b.g)add=GB_list().filter(o=>o.g===b.g);else if(GB_.mir){const w=SL_twin(b);if(w)add.push(w)}
 const on=SL.sel.includes(b);SL_set(on?SL.sel.filter(o=>!add.includes(o)):SL.sel.concat(add));try{AU.sfx('pick')}catch(e){}
 if(SL.sel.length)GS_tip(SL.sel.length+' selected · tap more parts to add them');return 1}
// SELECT UP: the selection plus every part resting on top of it, all the way up
function SL_up(){const L=GB_list(),S=new Set(SL.sel);let grow=1;while(grow){grow=0;for(const o of L){if(S.has(o))continue;for(const s of S)if(o.y===s.y+SL_h(s)&&SL_ov(o,s)){S.add(o);grow=1;break}}}
 const n=S.size-SL.sel.length;SL_set([...S]);GS_tip(n?'+'+n+' parts on top selected':'Nothing on top');try{AU.sfx('pick')}catch(e){}}
function SL_group(){if(!SL.sel.length)return;const g0=SL.sel[0].g;if(g0&&SL.sel.every(o=>o.g===g0)){GB_snap();for(const o of SL.sel)delete o.g;GS_tip('Ungrouped')}
 else{GB_snap();const g=1+Math.max(0,...GB_list().map(o=>o.g||0));for(const o of SL.sel)o.g=g;GS_tip('Grouped · '+SL.sel.length+' parts move together')}try{AU.sfx('brick')}catch(e){}SL_ui()}
function SL_colour(){if(!SL.sel.length)return;GB_snap();for(const o of SL.sel)o.c=GB_.col;const k=SL.sel.slice();GB_refresh();SL_set(k);try{AU.sfx('pick')}catch(e){}GS_tip('Recoloured · '+k.length)}
function SL_delete(){if(!SL.sel.length)return;GB_snap();const k=SL.sel;GB.d.bricks=GB_list().filter(o=>!k.includes(o));SL.sel=[];GB_refresh();SL_hl();SL_ui();try{AU.sfx('bump')}catch(e){}GS_tip('Deleted · '+k.length)}
// ---------- carry: MOVE / COPY / ROTATE lift the selection as one cluster (offsets from the first part), shown as a ghost until PLACE
function SL_lift(copy,rot){if(!SL.sel.length)return;const L=GB_list(),A=SL.sel[0],snap=JSON.stringify(L);
 if(!copy&&L.length-SL.sel.length<0)return;if(copy&&L.length+SL.sel.length>GB_MAX){GB_msg('Brick budget full · '+GB_MAX);try{AU.sfx('bump')}catch(e){}return}
 const parts=SL.sel.map(o=>({...o,dx:o.x-A.x,dz:o.z-A.z,dy:o.y-A.y}));if(copy)for(const p of parts)delete p.g;
 if(!copy)GB.d.bricks=L.filter(o=>!SL.sel.includes(o));SL.carry={parts,copy,snap,x:A.x,z:A.z,y:A.y,bad:0};SL.sel=[];GB_refresh();
 if(rot)SL_rot();else SL_fitAt(A.x,A.z,A.y);try{AU.sfx('pick')}catch(e){}GS_tip(copy?'Copy · tap where it goes, then ✔ PLACE':'Tap where it goes, then ✔ PLACE');SL_ui()}
const SL_at=(C,x,z,y)=>C.parts.map(p=>({t:p.t,x:x+p.dx,z:z+p.dz,y:y+p.dy,r:p.r,m:p.m,c:p.c,g:p.g}));
function SL_clash(b,list){const[fw,fd]=SL_dims(b),h=SL_h(b);let bmax=-1e9,fl=1e9;for(const k in GB_.base){bmax=Math.max(bmax,GB_.base[k]);fl=Math.min(fl,GB_.base[k])}if(b.y<fl||b.y+h>bmax+GB_CAP)return 1;
 for(let i=b.x;i<b.x+fw;i++)for(let j=b.z;j<b.z+fd;j++){if(i<GB_N0||i>GB_N1||j<GB_N0||j>GB_N1)return 1;const s=GB_.base[i+','+j];if(s!=null&&s>b.y)return 1}
 for(const o of list)if(SL_ov(o,b)&&o.y<b.y+h&&o.y+SL_h(o)>b.y)return 1;return 0}
function SL_ok(B){const L=GB_list();if(B.some(b=>SL_clash(b,L)))return 0;return B.some(b=>G8_free(b,b.y,L))}
// put the cluster at cell (x,z): the lowest height where no part sinks into what is under it (y given = keep it if it fits)
function SL_fitAt(x,z,y){const C=SL.carry;if(!C)return;let Y=-1e9;for(const p of C.parts){const f=GB_fit({...p,x:x+p.dx,z:z+p.dz},GB_list());if(f==null){Y=null;break}Y=Math.max(Y,f-p.dy)}
 if(y!=null&&SL_ok(SL_at(C,x,z,y)))Y=y;else if(Y==null){Y=C.y}C.x=x;C.z=z;C.y=Y;C.bad=!SL_ok(SL_at(C,x,z,Y));SL_ghost()}
function SL_rot(){const C=SL.carry;if(!C)return;for(const p of C.parts){const[fw,fd]=SL_dims(p),cx=p.dx+fw/2,cz=p.dz+fd/2,nx=cz,nz=-cx;p.r=(p.r+1)%4;const[nw,nd]=SL_dims(p);p.dx=Math.round(nx-nw/2);p.dz=Math.round(nz-nd/2)}
 const A=C.parts[0];for(const p of C.parts){p.dx-=A.dx;p.dz-=A.dz}A.dx=0;A.dz=0;SL_fitAt(C.x,C.z,C.y);try{AU.sfx('pick')}catch(e){}}
function SL_step(dir){const C=SL.carry;if(!C)return 0;for(let y=C.y+dir;y>=-12&&y<=120;y+=dir)if(SL_ok(SL_at(C,C.x,C.z,y))){C.y=y;C.bad=0;SL_ghost();try{AU.sfx('pick')}catch(e){}return 1}
 try{AU.sfx('bump')}catch(e){}GS_tip(dir>0?'Can\'t go higher here':'Can\'t go lower here');return 0}
function SL_place(){const C=SL.carry;if(!C)return 0;const B=SL_at(C,C.x,C.z,C.y);if(!SL_ok(B)){try{AU.sfx('bump')}catch(e){}GS_tip('No room here · try another spot');return 0}
 if(GB_list().length+B.length>GB_MAX){GB_msg('Brick budget full · '+GB_MAX);try{AU.sfx('bump')}catch(e){}return 0}
 const cur=GB_list().slice();GB.d.bricks=JSON.parse(C.snap);GB_snap();GB.d.bricks=cur;const L=GB_list();for(const b of B){if(!b.g)delete b.g;L.push(b)}
 SL.carry=null;SL_ghost();GB_refresh();for(const b of B)GS_pop(b);SL_set(B);try{AU.sfx('brick')}catch(e){}return B.length}
function SL_cancel(){const C=SL.carry;if(!C)return;SL.carry=null;SL_ghost();GB.d.bricks=JSON.parse(C.snap);GB_refresh();SL_set([]);try{AU.sfx('pick')}catch(e){}}
// ghost of the carried cluster (real colours, see-through) and the glow over the selection
function SL_mesh(B,mat){const U=GB.mesh&&GB.mesh.userData;if(!U||!B.length)return null;const M=[],Lg=[];for(const b of B){try{GB_brickGeo(b,M,Lg)}catch(e){}}if(!M.length&&!Lg.length)return null;
 const m=new THREE.Mesh(mergeGeometries(M.concat(Lg)),mat);m.userData.gbG=1;m.renderOrder=3;(U.carG||U.m).add(m);return m}
function SL_drop(m){if(m&&m.parent){m.parent.remove(m);m.geometry.dispose();m.material.dispose()}return null}
function SL_ghost(){SL.gh=SL_drop(SL.gh);const C=SL.carry;if(!C||!GB_.bk)return;const bad=C.bad;
 SL.gh=SL_mesh(SL_at(C,C.x,C.z,C.y),new THREE.MeshStandardMaterial({vertexColors:true,transparent:true,opacity:bad?.45:.85,roughness:.35,depthWrite:false,emissive:bad?0x801010:0x103010,color:bad?0xff8080:0xffffff}));SL_ui()}
function SL_hl(){SL.hl=SL_drop(SL.hl);if(!SL.sel.length||!GB_.bk)return;SL.hl=SL_mesh(SL.sel,new THREE.MeshBasicMaterial({color:0x37e6ff,transparent:true,opacity:.45,depthWrite:false,toneMapped:false,blending:THREE.AdditiveBlending,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}))}
// ---------- hooks into the builder
GB_act=(f=>function(cx,cy,del){if(!GB_.bk||del)return f(cx,cy,del);
 if(SL.carry){const h=GB_pick(cx,cy);if(!h){GS_tip('Tap on the car or the chassis');return 0}const C=SL.carry,A=C.parts[0],[fw,fd]=SL_dims(A),x=h.i-Math.floor((fw-1)/2),z=h.j-Math.floor((fd-1)/2);
  if(x===C.x&&z===C.z&&!C.bad)return SL_place();SL_fitAt(x,z,null);try{AU.sfx('pick')}catch(e){}return 0}
 if(GB_.tool==='sel')return SL_pickSel(cx,cy);return f(cx,cy,del)})(GB_act);
GB_hover=(f=>function(){if(SL.carry||GB_.tool==='sel'){if(GB_.ghost)GB_ghostSet(null);return}return f()})(GB_hover);
GB_refresh=(f=>function(){const r=f.apply(this,arguments);const L=GB_list();SL.sel=SL.sel.filter(o=>L.includes(o));SL_hl();SL_ghost();SL_ui();return r})(GB_refresh);
GB_undo=(f=>function(){if(SL.carry){SL_cancel();return 1}SL.sel=[];return f.apply(this,arguments)})(GB_undo);
GB_redo=(f=>function(){if(SL.carry)SL_cancel();SL.sel=[];return f.apply(this,arguments)})(GB_redo);
GB_exit=(f=>function(){if(SL.carry)SL_cancel();SL.sel=[];SL_hl();SL_ui();return f.apply(this,arguments)})(GB_exit);
gbClose=(f=>function(){if(GB_.bk){if(SL.carry)SL_cancel();SL.sel=[];SL_hl()}return f.apply(this,arguments)})(gbClose);
// the held-part bar (PLACE / ROTATE / CANCEL / STEP) drives the carried cluster too
GS_place=(f=>function(){return SL.carry?SL_place():f.apply(this,arguments)})(GS_place);
GS_drop=(f=>function(){if(SL.carry)return SL_cancel();return f.apply(this,arguments)})(GS_drop);
GS_reheld=(f=>function(){if(SL.carry){GB_.rot=(GB_.rot+3)%4;return SL_rot()}return f.apply(this,arguments)})(GS_reheld);
G8_step=(f=>function(d){return SL.carry?SL_step(d):f.apply(this,arguments)})(G8_step);
gbLoop=(f=>function(){const r=f.apply(this,arguments);if(GB_.bk&&SL.carry&&SL.gh){GS_br(SL.gh);const K=$('#gsBr');if(K)K.classList.toggle('bad',!!SL.carry.bad)}
 if(SL.hl)SL.hl.material.opacity=.3+.2*Math.sin(performance.now()/180);return r})(gbLoop);
// a colour swatch tap recolours the selection
addEventListener('click',e=>{if(!GB_.bk||!SL.sel.length||!e.target.closest||!e.target.closest('#gbBkCl .gbCl'))return;setTimeout(SL_colour,0)},true);
// ---------- UI: SELECT in the toolbar, the selection bar on the left
function SL_ui(){const T=$('#gbBkT');if(T&&!T.querySelector('[data-a="sel"]')){const a=T.querySelector('[data-a="add"]');if(a){const s=document.createElement('button');s.dataset.a='sel';s.title='Select parts (S)';s.textContent='☝ SELECT';
   s.addEventListener('click',()=>{if(GS.held)GS_drop();GB_.tool='sel'});a.after(s);a.addEventListener('click',()=>{SL_set([])})}}
 for(const k of['paint','del'])T&&T.querySelector(`[data-a="${k}"]`)&&!T.querySelector(`[data-a="${k}"]`).dataset.sl&&(T.querySelector(`[data-a="${k}"]`).dataset.sl=1,T.querySelector(`[data-a="${k}"]`).addEventListener('click',()=>SL_set([])));
 const v=$('#gbx .gbv');if(!v)return;let B=$('#slBar');if(!B){B=document.createElement('div');B.id='slBar';
  B.innerHTML=[['move','✥','MOVE'],['rot','⟳','ROTATE'],['col','🎨','COLOUR'],['del','🗑','DELETE'],['dup','⧉','COPY'],['up','⤒','SELECT UP'],['grp','⛓','GROUP'],['none','✕','DESELECT']].map(([a,i,t])=>`<button data-s="${a}"><i>${i}</i><span>${t}</span></button>`).join('');v.appendChild(B);
  B.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;e.stopPropagation();const a=b.dataset.s;
   if(a==='move')SL_lift(0);else if(a==='rot')SL_lift(0,1);else if(a==='col')SL_colour();else if(a==='del')SL_delete();else if(a==='dup')SL_lift(1);else if(a==='up')SL_up();else if(a==='grp')SL_group();else SL_set([])})}
 const show=GB_.bk&&!SL.carry&&SL.sel.length>0;B.hidden=!show;if(show){const g0=SL.sel[0].g,gs=B.querySelector('[data-s="grp"] span');if(gs)gs.textContent=g0&&SL.sel.every(o=>o.g===g0)?'UNGROUP':'GROUP'}
 const G=$('#gsBar');if(G&&SL.carry){G.hidden=false;const pl=G.querySelector('.gsPl');if(pl)pl.disabled=!!SL.carry.bad}
 const n=$('#gbBkN');if(n&&GB_.bk&&SL.sel.length&&GB_.tool==='sel')n.textContent='☝ '+SL.sel.length+' selected'}
GS_ui=(f=>function(){const r=f.apply(this,arguments);SL_ui();return r})(GS_ui);
GB_ui=(f=>function(){const r=f.apply(this,arguments);SL_ui();return r})(GB_ui);
GB_enter=(f=>function(){SL.sel=[];SL.carry=null;const r=f.apply(this,arguments);SL_ui();return r})(GB_enter);
addEventListener('keydown',e=>{if(!GB_.bk||$('#gbx').hidden||e.ctrlKey||e.metaKey||e.altKey)return;if(e.code==='KeyS'){GB_.tool='sel';GB_ui();e.preventDefault()}},true);
{const st=document.createElement('style');st.textContent=`#slBar{position:absolute;left:8px;top:calc(56px + env(safe-area-inset-top,0px));display:grid;grid-template-columns:repeat(2,auto);gap:5px;z-index:4}#slBar[hidden]{display:none}
#slBar button{width:112px;height:42px;border-radius:12px;border:2px solid rgba(255,255,255,.75);background:#1b2433;color:#fff;font:900 12px system-ui;letter-spacing:.02em;display:flex;align-items:center;gap:6px;padding:0 8px;cursor:pointer;box-shadow:0 3px 0 rgba(0,0,0,.35);white-space:nowrap}
#slBar button i{font-style:normal;font-size:16px;width:18px;text-align:center}#slBar [data-s="move"]{background:linear-gradient(#22c5e4,#1585b8)}#slBar [data-s="del"]{background:#6b1d24}
@media (max-width:760px),(max-height:500px){#slBar button{height:38px;width:108px}#gbx #gbBkN{max-width:104px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:block;line-height:34px}}`;document.head.appendChild(st)}
window.__sl={S:SL,sel:()=>SL.sel.map(o=>GB_list().indexOf(o)),carry:()=>SL.carry&&{x:SL.carry.x,z:SL.carry.z,y:SL.carry.y,bad:!!SL.carry.bad,n:SL.carry.parts.length},
 pick:(x,y)=>{const h=GB_pick(x,y);return h&&h.brick?GB_list().indexOf(h.brick):-1},bricks:()=>GB_list().map(b=>({t:b.t,x:b.x,z:b.z,y:b.y,r:b.r,c:b.c,g:b.g||0}))};
// ---- G9: tall builds (garage worker 9). The builder used to stop after ~4 floors of tiles: GB_CAP was 15 plates above the chassis,
// and a default body is already ~11 plates tall. GB_CAP is now 48 plates (12+ bricks on top of a body). This module:
// 1) the camera rises and pulls back as the build grows, so the top of a tall stack stays on screen and can be tapped;
// 2) a tap that only fails because of the height cap says "Height limit reached" (it used to say "No room here").
const G9={top:0,lim:0};
function G9_top(){let t=0;const L=GB.d&&GB.d.bricks||[];for(const b of L)t=Math.max(t,b.y+GB_PC[b.t].h);for(const k in GB_.base||{})t=Math.max(t,GB_.base[k]);return t}
GB_refresh=(f=>function(){const r=f.apply(this,arguments);G9.top=G9_top();return r})(GB_refresh);
GB_cam=(f=>function(){f();if(!GB_.bk||!GB.mesh)return;const m=GB.mesh.userData.m;if(!m)return;m.updateMatrixWorld();
 const yW=m.localToWorld(V3(0,G9.top*GB_PH,0)).y,ex=Math.max(0,yW-2.2);if(ex<=0)return;const C=GB.cam,ty=.5,dy=ex*.55,k=1+ex*.28;
 C.position.set(C.position.x*k,ty+(C.position.y-ty)*k+dy,C.position.z*k);C.lookAt(0,ty+dy,0);C.updateMatrixWorld()})(GB_cam);
// the tapped cell itself is only over the height cap: say so, and do not slide the part to a lower spot next to the stack
GB_cand=(f=>function(hit){if(!hit||!GB_PC[GB_.pc])return f(hit);const P=GB_PC[GB_.pc],[fw,fd]=GB_.rot%2?[P.d,P.w]:[P.w,P.d];GB_.capHit=0;
 GB_fit({t:GB_.pc,x:hit.i-Math.floor((fw-1)/2),z:hit.j-Math.floor((fd-1)/2),y:0,r:GB_.rot,m:0,c:GB_.col},GB_list());if(GB_.capHit){G9.lim=1;return null}G9.lim=0;return f(hit)})(GB_cand);
GS_tip=(f=>function(t){if(G9.lim&&/^No room/.test(t||'')){G9.lim=0;t='Height limit reached · '+GB_CAP+' plates'}return f.call(this,t)})(GS_tip);
GB_enter=(f=>function(){const r=f.apply(this,arguments);G9.top=G9_top();return r})(GB_enter);
// 3) thin parts (tiles, plates) on a body of the same colour were hard to see: the held part gets a bright edge outline (drawn over
//    everything), and a part that was just placed keeps a fading outline for 1.6 s.
function G9_edges(g,col){const e=new THREE.LineSegments(new THREE.EdgesGeometry(g,25),new THREE.LineBasicMaterial({color:col,transparent:true,opacity:1,depthTest:false,toneMapped:false}));e.renderOrder=9;e.userData.gbG=1;return e}
GB_ghostSet=(f=>function(b){const o=GB_.ghost;if(o)for(const c of o.children){c.geometry.dispose();c.material.dispose()}const r=f.apply(this,arguments);if(GB_.ghost&&b)GB_.ghost.add(G9_edges(GB_.ghost.geometry,b.bad?0xff4040:0xffe14a));return r})(GB_ghostSet);
G9.ol=[];
GS_pop=(f=>function(b){const r=f.apply(this,arguments);if(!b||!GB.mesh)return r;const U=GB.mesh.userData,host=U.carG||U.m,list=[b];if(GB_.mir){const w=GB_twin(b);if(w.x!==b.x)list.push(w)}
 for(const q of list){const M=[],L=[];try{GB_brickGeo(q,M,L)}catch(e){continue}if(!M.length)continue;const g=mergeGeometries(M.concat(L)),e=G9_edges(g,0xffe14a);g.dispose();host.add(e);G9.ol.push({e,t0:performance.now(),host})}return r})(GS_pop);
gbLoop=(f=>function(){const r=f.apply(this,arguments);const now=performance.now();for(let i=G9.ol.length-1;i>=0;i--){const o=G9.ol[i],k=(now-o.t0)/1600;
  if(k>=1||!GB_.bk){o.host.remove(o.e);o.e.geometry.dispose();o.e.material.dispose();G9.ol.splice(i,1)}else o.e.material.opacity=k<.6?1:1-(k-.6)/.4}return r})(gbLoop);
window.__g9={S:G9,ol:()=>G9.ol.length,top:()=>G9_top(),cap:GB_CAP};
// 4) phone toolbar: SELECT pushed ✔ DONE onto a second row at 852 px; a narrower brick counter keeps the whole bar on one row
{const st=document.createElement('style');st.textContent=`@media (max-width:760px),(max-height:500px){#gbx #gbBkT{gap:4px;flex-wrap:nowrap}#gbx #gbBkT>*{flex-shrink:0}#gbx #gbBkN{max-width:84px!important;width:auto;padding:0 6px;flex-shrink:1;min-width:0}}`;document.head.appendChild(st)}
// reviewer: "81/120 · Sup…" was cut off. On the phone the counter shows a short weight tag (81/120 SH); the full name stays on desktop
const G9_WS={'Super Light':'SL','Light':'L','Medium':'M','Heavy':'H','Super Heavy':'SH','Massive':'XL'};
GB_ui=(f=>function(){const r=f.apply(this,arguments);const n=$('#gbBkN');if(n&&GB.d&&(innerWidth<=760||innerHeight<=500)){const m=/^🧱 (\d+\/\d+) · (.+)$/.exec(n.textContent);if(m)n.textContent='🧱'+m[1]+' '+(G9_WS[m[2]]||'')}return r})(GB_ui);
// 5) SELECT tool: the counter said "3 selected" after the selection was gone; with nothing selected it now says what to do
SL_ui=(f=>function(){const r=f.apply(this,arguments);const n=$('#gbBkN');if(n&&GB_.bk&&GB_.tool==='sel'&&!SL.sel.length&&!SL.carry)n.textContent='☝ Tap a part';return r})(SL_ui);
// 6) BUILD YOUR OWN: the enter brick shower played over the chassis picker. It is cut when the picker opens and plays once the chassis is chosen.
GNB_pick=(f=>function(){const S=G8.sh;if(S){S.cv.remove();G8.sh=null}return f.apply(this,arguments)})(GNB_pick);
GNB_new=(f=>function(){const r=f.apply(this,arguments);if(!G8.sh&&GB_.bk)G8_shower(1);return r})(GNB_new);
// 7) the "Graphics: canvas" debug line under the CHOOSE TRACK menu is hidden (the element stays for tests)
{const st=document.createElement('style');st.textContent='#gfxNote{display:none!important}';document.head.appendChild(st)}
