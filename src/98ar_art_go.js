// ===== art-6 (2026-10-14): GO state tests for the art lane's matrix FAILs (src/99c_checklist.js, TAG=art)
// art/props-road: brick piles, brick towers and gold bricks (block scatter in the block RECT, which diagonal roads cross) used to be exempt from the
//   OC push-off-the-road (OC_GAME). Now only roadworks (cone/barrier/clight) are. Pass: 0 of them with the footprint on a drivable surface, city-wide.
// art/footsurf: the minifig walks (real W key) across an art-4 DRAPED grass patch (one merged Mesh per tile, vertex y = ground + 3.5 cm).
//   Pass: >= 1 m walked over the patch (>= 4 samples; frame count depends on fps), feet within 0.05 m of the visible patch mesh (raycast), >= 2 m walked.
const ARG_={};
function ART_propsRoad(say){if(state!=='roam'||!RO.on)return'📍 Start free roam first';const D=HUB.ptypes||{},bad=[];let n=0,best=null;
 for(const p of HUB.props||[]){if(p.alive===false)continue;if(/^(barrier|clight)$/.test(p.t)){/* art-6: roadworks lines stay off the main streets */const q=cityAt(p.x,p.z);if(q&&q.d<(q.S.r.w||8)/2-.5)bad.push([p.t,p.x|0,p.z|0]);continue}if(!/^(bricks|tower|gold)$/.test(p.t))continue;n++;const e=OC_roadE(p.x,p.z),fp=OC_fp(p.t,D),q=cityAt(p.x,p.z);
  if(e<fp||q&&q.d<(q.S.r.w||8)/2-.5)bad.push([p.t,p.x|0,p.z|0]);else if(e<fp+3){const d=Math.hypot(p.x-RO.x,p.z-RO.z);if(!best||d<best.d)best={p,d,e}}}
 if(best){const s=rfSnap(best.p.x,best.p.z,200);if(s){roamWarp(s[0],s[1],Math.atan2(best.p.x-s[0],best.p.z-s[1]))}}
 return`📍 PROPS OFF THE ROAD: ${bad.length} of ${n} brick piles / towers / gold bricks on a drivable surface or roadworks barriers across a main street (0)`+(bad.length?' e.g. '+bad.slice(0,2).map(b=>b.join(' ')).join(', '):'')+(best?`; the one ahead stands ${best.e.toFixed(1)} m off the road edge`:'')+' '+(bad.length||!n?'❌':'✅')}
function ART_footSurf(say){if(state!=='roam'||!RO.on)return'📍 Start free roam first';try{LF_ensure(RO.x,RO.z,600)}catch(e){}
 const ms=(LF.ms||[]).filter(m=>m.userData.lf==='patch'&&!m.isInstancedMesh&&m.parent);if(!ms.length)return'📍 No draped grass patch loaded · drive on and try again ❌';
 const E=[];for(const A of LF.PG.values())for(const e of A)if(e.d&&Math.min(e.sx,e.sz)>1.6)E.push(e);E.sort((a,b)=>Math.hypot(a.x-RO.x,a.z-RO.z)-Math.hypot(b.x-RO.x,b.z-RO.z));
 const rc=new THREE.Raycaster(),dn=new THREE.Vector3(0,-1,0),O=new THREE.Vector3();for(const m of ms)m.updateWorldMatrix(true,false);
 const surf=(x,z,y)=>{O.set(x,y+3,z);rc.set(O,dn);rc.far=8;const h=rc.intersectObjects(ms,false)[0];return h?h.point.y:null};
 let go=null;for(const e of E.slice(0,60)){if(!rfSnap(e.x,e.z,120))continue;const R=Math.max(e.sx,e.sz);for(let a=0;a<8&&!go;a++){const an=a/8*6.283,fx=Math.sin(an),fz=Math.cos(an),gy=groundY(e.x,e.z);if(surf(e.x,e.z,gy)==null)break;let r=0;while(r<R+1&&surf(e.x-fx*r,e.z-fz*r,gy)!=null)r+=.25;const sx=e.x-fx*(r+1),sz=e.z-fz*(r+1);let ok=r>=1.2;
   for(let d=0;d<=2*r+3&&ok;d+=.5){const x=sx+fx*d,z=sz+fz*d,y=groundY(x,z);if(roamHit(x,z,OF_R+.25,y+1)||inRiver(x,z,0)||OF_propAt(x,z,y,.4))ok=false}if(ok)go={e,sx,sz,h:an}}if(go)break}
 if(!go)return'📍 No clear draped patch nearby · drive on and try again ❌';
 const q=rfSnap(go.sx,go.sz,200);if(!q)return'📍 No road near the patch · try again ❌';OF_reset();if(!OF_spawn({cx:q[0],cz:q[1],h:q[2]??0},go.sx,go.sz,go.h))return'📍 Can\'t jump right now ❌';
 const key=(t,c)=>dispatchEvent(new KeyboardEvent(t,{code:c,key:'w',bubbles:true}));key('keydown','KeyW');
 const t0=performance.now(),x0=OF.x,z0=OF.z;let n=0,w=0,dp=0,px=null,pz=null;
 const tick=()=>{const s=surf(OF.x,OF.z,OF.y);if(s!=null&&LF_patchY(OF.x,OF.z)==null){n++;const dv=Math.abs(OF.y-s);if(dv>w){w=dv;ARG_.wx=[+OF.x.toFixed(2),+OF.z.toFixed(2),+OF.y.toFixed(3),+s.toFixed(3),+groundY(OF.x,OF.z).toFixed(3),OF.air?1:0]}if(px!=null)dp+=Math.hypot(OF.x-px,OF.z-pz);px=OF.x;pz=OF.z}else px=null;
  if(performance.now()-t0<3500)return requestAnimationFrame(tick);key('keyup','KeyW');const mv=Math.hypot(OF.x-x0,OF.z-z0),ok=n>=4&&dp>=1&&w<=.05&&mv>=2;
  say(`📍 FEET ON THE PATCH: walked ${dp.toFixed(1)} m over a draped grass patch (≥ 1, ${n} samples), feet ${w.toFixed(3)} m from its surface (≤ 0.05), walked ${mv.toFixed(1)} m (≥ 2) `+(ok?'✅':'❌'))};
 requestAnimationFrame(tick);return'📍 FEET ON THE PATCH · walking across…'}
// art-6 (rv-ath-fest, rev-2): the quest crates are anchored once (qvCargoAt) to the roof of the car model visible at the start; a form change
// (auto TRANSFORM: ship / 4x4 / boat) swaps the visible model, so the crates rode the old roof (-0.31 m) or a hidden model. Re-anchor every 0.5 s.
roamStep=(f=>function(dt){f.apply(this,arguments);ARG_cargo(dt)})(roamStep);
function ARG_cargo(dt){if(/[?&]cargo=0\b/.test(location.search))return;/* ?cargo=0 = old behaviour (test baseline) */ARG_.ct=(ARG_.ct||0)+(dt||0);if(ARG_.ct<.5)return;ARG_.ct=0;const P=typeof pl!=='undefined'&&pl&&pl.mesh;if(!P)return;let g=null;P.traverse(o=>{if(!g&&o.isGroup&&o.userData.cargo&&o.children.length)g=o});if(g)try{qvCargoAt(g)}catch(e){}}
// crates on the roof: visible, bottom within 0.3 m of the top of the car model they ride (same math as RV14 fest)
function ARG_crates(){const g=RO.ch&&RO.ch.crates;if(!g||!g.children.length)return null;for(let a=g;a&&a!==pl.mesh;a=a.parent)if(!a.visible)return{vis:0};const C=new THREE.Box3(),B=new THREE.Box3();g.updateMatrixWorld(true);C.setFromObject(g);
 g.parent.children.forEach(o=>{if(o!==g&&o.visible&&!o.userData.cargo)B.expandByObject(o)});return{vis:1,dy:+(C.min.y-B.max.y).toFixed(2)}}
// GO art/fest-form: Athens Festival Delivery start, then the transform button's form change (4x4): crates still on the new roof
function ART_festForm(say){if(state!=='roam'||!RO.on)return'📍 Start free roam first';const v0=RO.vsel;RV14_go('fest',()=>{});
 setTimeout(()=>{const a=ARG_crates();if(!a)return say('📍 CRATES AFTER TRANSFORM · no crates loaded ❌');RO.vsel='offroad';
  setTimeout(()=>{const b=ARG_crates(),m=pl.mesh.userData.m;RO.vsel=v0;const ok=b&&b.vis&&Math.abs(b.dy)<=.1&&Math.abs(a.dy)<=.1;
   say(`📍 CRATES AFTER TRANSFORM: before ${a.dy} m vs roof, after the 4×4 form ${b?b.vis?b.dy+' m':'hidden':'gone'} (both within ±0.1), visible `+(ok?'✅':'❌'))},2500)},3200);
 return'📍 CRATES AFTER TRANSFORM · starting the delivery…'}
window.__art={festForm:s=>ART_festForm(s),propsRoad:s=>ART_propsRoad(s),footSurf:s=>ART_footSurf(s)};// by name: hot reload picks up changes
