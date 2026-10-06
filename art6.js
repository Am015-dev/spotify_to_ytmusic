// ==== ART pART6 · no dark blob/contact shadows under any car (player, AI, traffic; races and city). Visual only: grounding (ART4_base) is untouched.
const ART6_off=o=>{if(!o||o.userData.art6)return;o.userData.art6=1;Object.defineProperty(o,'visible',{configurable:true,get(){return false},set(v){}})};
const ART6_noCast=root=>{if(root)root.traverse(o=>{if(o.isMesh&&!o.userData.art6c){o.userData.art6c=1;Object.defineProperty(o,'castShadow',{configurable:true,get(){return false},set(v){}})}})};
shipMesh=(f=>function(){const g=f.apply(this,arguments);try{ART6_off(g.userData.shadow);ART6_noCast(g)}catch(e){}return g})(shipMesh);
ART4_tyres=(f=>function(){const im=f.apply(this,arguments);ART6_off(im);return im})(ART4_tyres);
let ART6_t=0;function ART6_sweep(){const t=performance.now();if(t-ART6_t<500)return;ART6_t=t;
  try{if(trShadow)ART6_off(trShadow);if(trGlow)ART6_off(trGlow)}catch(e){}try{if(CR_SH)ART6_off(CR_SH)}catch(e){}if(ART4.ty)ART6_off(ART4.ty);
  for(const s of[pl,...ships])if(s&&s.mesh){const ud=s.mesh.userData;if(ud&&ud.shadow)ART6_off(ud.shadow);ART6_noCast(s.mesh)}
  for(const c of HUB.cars||[])if(c&&c.mesh)ART6_noCast(c.mesh);for(const o of TRM||[])for(const k in o)if(o[k]&&o[k].isMesh)ART6_noCast(o[k])}
posShip=(f=>function(s,dt,snap){f(s,dt,snap);if(s===pl)ART6_sweep()})(posShip);
roamStep=(f=>function(dt){f(dt);ART6_sweep()})(roamStep);
