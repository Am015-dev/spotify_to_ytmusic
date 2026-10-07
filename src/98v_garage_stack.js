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
{const st=document.createElement('style');st.textContent=`@media (max-width:760px),(max-height:500px){#gbx #gbBkT{gap:4px}#gbx #gbBkN{max-width:80px!important;width:80px;padding:0 6px}}`;document.head.appendChild(st)}
// 5) SELECT tool: the counter said "3 selected" after the selection was gone; with nothing selected it now says what to do
SL_ui=(f=>function(){const r=f.apply(this,arguments);const n=$('#gbBkN');if(n&&GB_.bk&&GB_.tool==='sel'&&!SL.sel.length&&!SL.carry)n.textContent='☝ Tap a part';return r})(SL_ui);
