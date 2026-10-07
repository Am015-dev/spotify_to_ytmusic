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
function SL_step(dir){const C=SL.carry;if(!C)return 0;for(let y=C.y+dir;y>=-12&&y<=60;y+=dir)if(SL_ok(SL_at(C,C.x,C.z,y))){C.y=y;C.bad=0;SL_ghost();try{AU.sfx('pick')}catch(e){}return 1}
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
