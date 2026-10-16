// ===== CVF (city-var, 2026-10-16): FOLIAGE MIX. Alex: "the city looks repetitive and not good to the eye". Plan + audit: docs/CITY_VARIETY.md.
// Street/park trees and bushes were all placed at scale 1 with 1-5 flat tints, so every tree of a kind is the same clone.
// ON: (1) each foliage instance gets a hashed size (width .82-1.2, height .78-1.32) and a small hue / lightness shift (same draw calls, same colliders);
//     (2) half the street trees (1 in 8 park trees, ≤ 1800) stand in a LEGO tree pit: grey kerb + green clumps + 1x1 flower studs, in ONE city-wide InstancedMesh pair (+2 draw calls).
// Flag: TUNE.cvFol (default 0 = OFF) or ?cvf=1 / ?cvf=0. Test: checklist cvf1/* (cvf1/audit prints the numbers, cvf1/mix the pass line).
const CVF={on:/[?&]cvf=1\b/.test(location.search)||(!/[?&]cvf=0\b/.test(location.search)&&TUNE.cvFol>0),n:0,beds:0,im:null,imF:null};
const CVF_RX=/^(CE_)?(tree\d?|bush|pine|cypress|olive|plane|palm)$/,CVF_TREE=/^(CE_)?(tree\d?|pine|olive|plane|palm)$/;
const CVF_h=(x,z,s)=>{const h=Math.sin(x*12.9898+z*78.233+s*37.719)*43758.5453;return h-Math.floor(h)};
const CVF_MAX=1800,CVF_FL=['#ff4a8a','#ffd23a','#ff7a2a','#ffffff','#b46aff','#e8402a'];
function CVF_s(p){if(!p.cvs){const a=CVF_h(p.x,p.z,1),b=CVF_h(p.x,p.z,2);p.cvs=[.82+.38*a,.78+.54*(.5*a+.5*b)]}return p.cvs}
function CVF_mat(p){const[w,h]=CVF_s(p);_m.compose(V3(p.x,p.y,p.z),new THREE.Quaternion().setFromAxisAngle(V3(0,1,0),p.ry),_ts.set(w,h,w));p.im.setMatrixAt(p.i,_m);p.im.instanceMatrix.needsUpdate=true}
function CVF_bedGeo(fl){const L=[];if(!fl){L.push([2.4,.32,0,0,0,'#9a948a'],[2.0,.06,.32,0,0,'#5a3a24']);for(const[a,b]of[[-.62,-.62],[.62,.62]])L.push([.72,.34,.36,a,b,'#4f9a36'])}
  else for(const[a,b]of[[-.7,.1],[-.1,.72],[.7,.2],[.2,-.72],[-.5,.62]])L.push([.4,.22,.36,a,b,'#ffffff']);return ART_brickGeo(L,null,0)/* ~130 tris a pit, no studs */}
function CVF_apply(){if(!CVF.on||CVF.done||!HUB.props)return;CVF.done=1;const c=new THREE.Color(),beds=[],tou=new Set();
  for(const p of HUB.props){if(!p.im||p.i==null||!CVF_RX.test(p.t))continue;CVF_mat(p);
    if(p.im.instanceColor){p.im.getColorAt(p.i,c);c.offsetHSL((CVF_h(p.x,p.z,3)-.5)*.06,(CVF_h(p.x,p.z,4)-.5)*.12,(CVF_h(p.x,p.z,5)-.5)*.14);p.im.setColorAt(p.i,c);tou.add(p.im)}CVF.n++;
    if(CVF_TREE.test(p.t)&&beds.length<CVF_MAX){const hh=CVF_h(p.x,p.z,6);if(hh<.5){let e=0;try{e=OC_roadE(p.x,p.z);if(inRiver(p.x,p.z,0)||onAnyDeck(p.x,p.z))e=0}catch(x){e=0}/* street trees (1.6-14 m off the road) get a pit half the time, park trees 1 in 8 */if(e>=1.6&&(e<14||hh<.12))beds.push(p)}}}
  for(const im of tou)if(im.instanceColor)im.instanceColor.needsUpdate=true;
  if(!beds.length)return;const mk=(g,mat)=>{const im=new THREE.InstancedMesh(g,mat,beds.length);im.frustumCulled=false;im.receiveShadow=true;im.userData.nsh=1;HUB.grp.add(im);return im};
  const mat=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.45,metalness:0});CVF.im=mk(CVF_bedGeo(0),mat);CVF.imF=mk(CVF_bedGeo(1),mat);
  beds.forEach((p,i)=>{_m.compose(V3(p.x,p.y-.02,p.z),new THREE.Quaternion().setFromAxisAngle(V3(0,1,0),p.ry),_ts.set(1,1,1));CVF.im.setMatrixAt(i,_m);CVF.imF.setMatrixAt(i,_m);
    c.set(CVF_FL[Math.floor(CVF_h(p.x,p.z,7)*CVF_FL.length)]);CVF.imF.setColorAt(i,c)});CVF.beds=beds.length}
buildHubProps=(f=>function(){const r=f.apply(this,arguments);try{CVF.done=0;CVF.n=CVF.beds=0;if(CVF.im){HUB.grp.remove(CVF.im);HUB.grp.remove(CVF.imF);CVF.im=CVF.imF=null}CVF_apply()}catch(e){console.warn('CVF',e)}return r})(buildHubProps);
// a smashed tree that respawns keeps its own size (propRevive writes scale 1)
if(typeof propRevive==='function'){const _pr=propRevive;propRevive=function(p){const r=_pr.apply(this,arguments);try{if(CVF.on&&p&&p.cvs&&p.im)CVF_mat(p)}catch(e){}return r}}
// ---- audit (numbers for docs/CITY_VARIETY.md): what the player sees within R m
function CVF_audit(R){R=R||150;const x=RO.x,z=RO.z,P=HUB.props||[],near={},all={},combo={},c=new THREE.Color();let nf=0,sz=new Set();
  for(const p of P){all[p.t]=(all[p.t]||0)+1;if((p.x-x)**2+(p.z-z)**2>R*R)continue;near[p.t]=(near[p.t]||0)+1;
    if(CVF_RX.test(p.t)){nf++;let k=p.t;if(p.im&&p.im.instanceColor){p.im.getColorAt(p.i,c);k+='|'+c.getHexString().slice(0,3)}if(CVF.on&&p.cvs)k+='|'+Math.round(p.cvs[1]*5);combo[k]=(combo[k]||0)+1;sz.add(p.cvs?Math.round(p.cvs[1]*10):10)}}
  const top=Object.values(combo).sort((a,b)=>b-a)[0]||0,fk=Object.keys(all).filter(t=>CVF_RX.test(t));
  const gm=new Set();scene.traverse(o=>{if(!o.isMesh||o.isInstancedMesh||!o.geometry||!o.visible)return;const g=o.geometry;if(!g.boundingBox)g.computeBoundingBox();const b=g.boundingBox,s=o.scale;if((b.max.x-b.min.x)*s.x>40&&(b.max.z-b.min.z)*s.z>40&&(b.max.y-b.min.y)*s.y<8){const m=Array.isArray(o.material)?o.material[0]:o.material;gm.add((m.map?'t':'c')+(m.color?m.color.getHexString():''))}});
  let bv=null;try{bv=BV_measure(x,z,400)}catch(e){}let ds=null;try{ds=SIMP_drawStat()}catch(e){}
  return{on:CVF.on,R,propTypesCity:Object.keys(all).length,foliageKinds:fk,foliageNear:nf,foliageLooks:Object.keys(combo).length,topShare:nf?+(top/nf).toFixed(2):0,heights:sz.size,propTypesNear:Object.keys(near).length,near,
    bld:bv&&{n:bv.n,variants:bv.variants,facades:bv.facades,repeat:bv.repeat},groundMats:gm.size,beds:CVF.beds,calls:ds&&ds.calls,tris:ds&&ds.tris}}
// a park view: the 60 m spot with the most foliage (seeded scan of the props), camera 18 m back looking at it
function CVF_park(){const P=(HUB.props||[]).filter(p=>CVF_RX.test(p.t));let best=null,bn=0;for(let i=0;i<P.length;i+=7){const q=P[i];let n=0;for(const o of P)if((o.x-q.x)**2+(o.z-q.z)**2<900)n++;if(n>bn){bn=n;best=q}}
  if(!best)return null;let sp=null;for(let a=0;a<6.28&&!sp;a+=.39){const x=best.x+Math.sin(a)*22,z=best.z+Math.cos(a)*22;if(!roamHit(x,z,2.5))sp=[x,z,a+Math.PI]}if(!sp)return null;roamWarp(sp[0],sp[1],sp[2]);RO.v=0;camSnap=true;return{x:Math.round(best.x),z:Math.round(best.z),n:bn}}
window.__cvf={CVF,audit:CVF_audit,park:CVF_park};
