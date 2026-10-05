/* ===== QA8 · no giants, fewer rings (owner after v82: "There are still giants, way too many rings in the city") =====
   (1) Every minifig the game builds (minifig(): quest givers at markers, event hosts, passengers, pilots, goon riders…) is tagged, and
       once a second any tagged figure in the world taller than 2.2 m is scaled down to 1.85 m (an adult next to a 4.5 m car / 3 m storey).
       window.__qaHumans() lists every humanoid type near the car with its height (pavement peds included).
   (2) Free roam draws only the nearest on-the-go event ring (the otg2 "E" torus) instead of one at every event spot in range; quest /
       event markers away from the route lose their ground ring beyond 160 m. Event gates and checkpoint rings are untouched (they only
       exist while an event runs). */
minifig=(f=>function(){const g=f.apply(this,arguments);g.userData.qaFig=1;return g})(minifig);
const QA8={t:0,fixed:0};
function QA8_h(o){const B=new THREE.Box3();o.updateMatrixWorld(true);o.traverseVisible(c=>{if(c.isMesh&&c.geometry&&!(c.userData&&c.userData.ex)){if(!c.geometry.boundingBox)c.geometry.computeBoundingBox();B.union(c.geometry.boundingBox.clone().applyMatrix4(c.matrixWorld))}});return B.isEmpty()?0:B.max.y-B.min.y}
function QA8_figs(){const L=[];const root=RO&&RO.grp?scene:null;if(!root)return L;scene.traverse(o=>{if(o.userData&&o.userData.qaFig&&o.parent)L.push(o)});return L}
function QA8_kind(o){for(let a=o;a;a=a.parent){if(pl&&a===pl.mesh)return'driver/pilot on player car';for(const m of RO.marks||[])if(m.g===a)return'marker '+m.kind;if(typeof M1!=='undefined'&&M1.goons&&M1.goons.some(g=>g.m===a))return'mission goon rider'}return'mission/other figure'}
function QA8_step(dt){QA8.t+=dt;if(QA8.t<1)return;QA8.t=0;for(const o of QA8_figs()){if(!o.visible)continue;const h=QA8_h(o);if(h>2.2&&!(pl&&pl.mesh&&QA8_kind(o).startsWith('driver'))){o.scale.multiplyScalar(1.85/h);QA8.fixed++}}}
window.__qaHumans=(r=160)=>{const out={};const put=(k,h)=>{if(!h)return;out[k]=Math.max(out[k]||0,+h.toFixed(2))};
  for(const o of QA8_figs()){if(!o.visible)continue;const p=new THREE.Vector3();o.getWorldPosition(p);if(Math.hypot(p.x-RO.x,p.z-RO.z)>r)continue;put(QA8_kind(o),QA8_h(o))}
  try{const S=SC_S&&SC_S.on?SC_K.ped:.66;if(HUB.peds&&HUB.peds.length)put('pavement pedestrian',(1.25+.32+1.4+.96+.25)*S)}catch(e){}
  try{if(window.__sc&&__sc.humans){const h=__sc.humans();if(h.driver)put('garage driver (seated, standing height)',h.driver);if(h.moped)put('moped goon rider',h.moped)}}catch(e){}
  return{heights:out,fixed:QA8.fixed}};
// rings: only the nearest otg2 event ring
{const f0=OG_draw;OG_draw=function(){if(OG.vis&&state==='roam'&&!OG.ev){let best=null,bd=1e9;for(const sp of OG.vis)if(sp.k==='ev'&&!OG_done(sp)){const d=Math.hypot(sp.x-RO.x,sp.z-RO.z);if(d<bd){bd=d;best=sp}}const keep=OG.vis;OG.vis=keep.filter(sp=>sp.k!=='ev'||sp===best);try{return f0.apply(this,arguments)}finally{OG.vis=keep}}return f0.apply(this,arguments)}}
// quest / event marker ground rings fade out beyond 160 m (the minimap and the NEXT arrow still show them)
roamHud=(f=>function(){const r=f.apply(this,arguments);if(RO.on&&RO.marks&&((QA8.mk=(QA8.mk||0)+1)%15===0))for(const m of RO.marks){if(!m.ring)continue;const near=Math.hypot(m.x-RO.x,m.z-RO.z)<160||m===RO.wp;m.ring.visible=near}QA8_step(1/4);return r})(roamHud);
