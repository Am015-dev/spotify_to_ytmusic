// ===== RS: ROAD SEAMS (art-1, 2026-10-13). Alex (v90m-beta.1 shot, Frankfurt Messe / "Hot Drop" start): "roads still wrong": the road ends in a
// ~10-15 m grass strip and the next road starts after it. Root cause: each Frankfurt filler grid (RF.grids) lays its streets inside its own
// rectangle, so where two grids meet, the streets of one stop ~10 m before the streets of the next. The traffic graph bridges those dead ends
// (buildHubTraffic links a dead grid end to any grid node within 16 m), so the road "is connected" but no asphalt is drawn in between
// (91 such links, 86 of them in line). Fix at the source: before the hub meshes are built, a dead filler-road end that has another grid node
// within 16 m straight ahead on its own axis is extended to that node, so the asphalt, kerbs, crossings and the graph all use the same road.
function RS_seams(){if(/[?&]rs=0/.test(location.search)||CID!=='fra'||!FILL_R||!FILL_R.length)return 0;let n=0;
 for(let pass=0;pass<3;pass++){const K=new Map(),key=(x,z)=>Math.round(x)+'|'+Math.round(z),P=[];
  for(const r of FILL_R){const T=[0,r.L,...(r.cross||[]).map(c=>c[0])];for(const t of T){const x=r.x0+r.ux*t,z=r.z0+r.uz*t,k=key(x,z);if(!K.has(k)){K.set(k,{x,z,rs:new Set()});P.push(K.get(k))}K.get(k).rs.add(r)}}
  let did=0;
  for(const r of FILL_R)for(const e of[0,1]){const t=e?r.L:0,x=r.x0+r.ux*t,z=r.z0+r.uz*t,me=K.get(key(x,z));if(!me||me.rs.size>1)continue;
   // a node on another road's line also counts as joined (T onto its side)
   if(FILL_R.some(q=>q!==r&&(()=>{const s=(x-q.x0)*q.ux+(z-q.z0)*q.uz,o=Math.abs(-(x-q.x0)*q.uz+(z-q.z0)*q.ux);return s>-1&&s<q.L+1&&o<1})()))continue;
   const sg=e?1:-1;let best=null,bd=16;for(const p of P){if(p.rs.has(r))continue;const dx=p.x-x,dz=p.z-z,al=(dx*r.ux+dz*r.uz)*sg,off=Math.abs(-dx*r.uz+dz*r.ux);
    if(al>.5&&off<1.5&&al<bd){bd=al;best=p}}
   if(!best)continue;if(e){r.x1+=r.ux*bd;r.z1+=r.uz*bd}else{r.x0-=r.ux*bd;r.z0-=r.uz*bd}r.L+=bd;n++;did++;best.rs.add(r)}
  OB_fillIdx();if(!did)break}
 RS.n+=n;return n}
const RS={n:0};
{const _f=RD_fillLoop;RD_fillLoop=function(trimOnly){const r=_f.apply(this,arguments);try{RS_seams()}catch(e){console.warn('RS',e)}return r}}
// GO check (checklist "roads: no gap at the Messe"): a top-down picture of the road (the GPU's downward ray: asphalt meshes free their CPU copy,
// so a raycast can't see them), sampled every 2 m along the road from the spawn to the next street: every sample must be asphalt, not grass.
const RS_SPOT={x:2160,z0:520,z1:420,n:'Messe grid seam (Hot Drop)'};
function RS_strip(x0,z0,x1,z1){const cx=(x0+x1)/2,cz=(z0+z1)/2,L=Math.hypot(x1-x0,z1-z0),S=Math.max(40,L+20),P=256;
 const cam=new THREE.OrthographicCamera(-S/2,S/2,S/2,-S/2,1,3000);cam.position.set(cx,800,cz);cam.up.set(0,0,-1);cam.lookAt(cx,0,cz);cam.updateMatrixWorld();
 const hid=[];scene.traverse(o=>{if(o.visible&&(o.isInstancedMesh||o.isSprite||o.isPoints||(o.isMesh&&o.material&&o.material.transparent)))hid.push(o)});for(const o of hid)o.visible=false;
 const rt=new THREE.WebGLRenderTarget(P,P),fog=scene.fog;scene.fog=null;const px=new Uint8Array(P*P*4);
 try{renderer.setRenderTarget(rt);renderer.clear();renderer.render(scene,cam);renderer.readRenderTargetPixels(rt,0,0,P,P,px)}finally{renderer.setRenderTarget(null);scene.fog=fog;for(const o of hid)o.visible=true;rt.dispose()}
 const out=[];for(let s=0;s<=L;s+=2){const x=x0+(x1-x0)*s/L,z=z0+(z1-z0)*s/L,i=Math.round((x-cx)/S*P+P/2),j=Math.round(P/2-(z-cz)/S*P);// row 0 = bottom = +z (camera up is -z)
  const o=(clamp(j,0,P-1)*P+clamp(i,0,P-1))*4,r=px[o],g=px[o+1],b=px[o+2];out.push({s,grass:g>r*1.12&&g>b*1.12&&g-Math.min(r,b)>10})}return out}
function RS_check(){if(CID!=='fra')return'📍 Frankfurt only';const S=RS_SPOT,q=rfSnap(S.x,S.z0,30);if(!roamWarp(q?q[0]:S.x,q?q[1]:S.z0,Math.atan2(0,S.z1-S.z0)))return'📍 Can\'t jump right now';RO.v=0;
 setTimeout(()=>{let L;try{L=RS_strip(S.x,S.z0,S.x,S.z1)}catch(e){window.__rsErr=String(e&&e.stack||e);return}const bad=L.filter(p=>p.grass),ok=!bad.length;(window.__chk||{}).roadgap={ok,n:L.length,grass:bad.length,at:bad.map(p=>p.s),seams:RS.n};
  try{say('',`ROAD GAP: ${L.length} rays every 2 m · ${bad.length} on grass `+(ok?'✅':'❌ at '+bad.slice(0,6).map(p=>p.s+' m').join(', ')),5)}catch(e){}},2500);
 return'📍 '+S.n.toUpperCase()+' · checking the road ahead…'}
window.__rs={RS,seams:RS_seams,strip:RS_strip,check:RS_check,SPOT:RS_SPOT};
