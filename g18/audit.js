// g18/audit.js <url> <outdir> [ids,comma] : garage-18 ride audit. Phone 852x393, real touch. For every ride in RIDES (STREET / OFF-ROAD / WATER):
// tap its card, wait for the model + build-up, stage shot, and measure (a) lowest visible geometry vs the platform top, (b) a dummy base (bare plate,
// base-ship meshes, the built-in off/boat ride) drawn with it, (c) console errors, (d) the card thumbnail (saved for the sheet).
const E=require('../bc/enter.js');const fs=require('fs');const OUT=process.argv[3]||'g18/before';fs.mkdirSync(OUT,{recursive:true});
const ONLY=process.argv[4]?process.argv[4].split(','):null;
(async()=>{const T=await E(process.argv[2],{gfx:'normal',tick:0});const{p,tap,tapXY}=T;const ev=c=>p.evaluate(c=>__g9ev(c),c);
 const tapSel=async s=>{const r=await p.evaluate(s=>{const e=document.querySelector(s);if(!e)return null;e.scrollIntoView({block:'center'});const b=e.getBoundingClientRect();return[b.x+b.width/2,b.y+b.height/2]},s);if(r){await tapXY(r[0],r[1]);return 1}console.log('NO',s);return 0};
 await tap('#gbMenuBtn');await p.waitForTimeout(3500);await tap('#r2R [data-r2m="rides"]');await p.waitForTimeout(3000);
 const L=JSON.parse(await ev(`JSON.stringify(G9C_TY.map(([k])=>G9C_list(k).A.map(q=>[q.S.id,k,G9C_name(q.S,k)])).flat())`));
 console.log('rides',L.length);const res=[];
 // in-page measurement of the garage stage
 const M=`(()=>{const m=GB.mesh;if(!m)return JSON.stringify({err:'nomesh'});m.updateMatrixWorld(true);const vis=o=>{for(let q=o;q;q=q.parent)if(!q.visible)return 0;return 1};
  const B=new THREE.Box3(),bb=new THREE.Box3(),dum=[];let gbN=0,wl=null;
  m.traverse(o=>{if(!(o.isMesh)||!vis(o))return;const U=o.userData;if(U.gbG)return;const g=o.geometry;if(!g||!g.attributes.position)return;
   // decals / shadows / under-glow are flat helpers: skip transparent non-gb meshes
   if(!U.gb){const mt=o.material;if(mt&&(mt.transparent||mt.isShaderMaterial||mt.blending!==THREE.NormalBlending))return;}
   g.computeBoundingBox();bb.copy(g.boundingBox).applyMatrix4(o.matrixWorld);
   if(U.gb){gbN++;B.union(bb);if(U.r!=null){const P=new THREE.Vector3(),S=new THREE.Vector3();o.getWorldPosition(P);o.getWorldScale(S);const w=P.y-U.r*S.y;wl=wl==null?w:Math.min(wl,w)}}
   else dum.push((o.name||o.geometry.type)+':'+bb.min.y.toFixed(2)+'..'+bb.max.y.toFixed(2))});
  // plate meshes from GB_attach (bare base plate) are gb meshes on GB_plate geometry
  const U=m.userData,host=U.carG||U.m;let plate=0;for(const o of U.gbM||[])if(o.visible&&o.geometry&&!o.userData.r){o.geometry.computeBoundingBox();const q=o.geometry.boundingBox;if(Math.abs(q.min.y+.2)<.01&&Math.abs(q.max.y)<.01)plate=1}
  const vf=[];for(const k in U.gbV||{})if(U.gbV[k].visible)vf.push(k);
  const top=GS.g?GS.y0+GS.g.position.y-.004:null;
  return JSON.stringify({top:top==null?null:+top.toFixed(3),gy:GS.gy==null?null:+GS.gy.toFixed(3),min:+B.min.y.toFixed(3),max:+B.max.y.toFixed(3),
   sx:+(B.max.x-B.min.x).toFixed(2),sz:+(B.max.z-B.min.z).toFixed(2),wl:wl==null?null:+wl.toFixed(3),gbN,dum:dum.slice(0,6),ndum:dum.length,plate,vf,
   n:(GB.d&&GB.d.bricks||[]).length,bp:GB.d&&GB.d.bp,ba:BA.on,sc:+m.userData.m.scale.y.toFixed(3),wait:LDL.wait.size})})()`;
 let curTy='car';
 const SH=(process.env.SHARD||'0/1').split('/').map(Number);let ix=-1;
 for(const [id,ty,nm] of L){ix++;if(ix%SH[1]!==SH[0])continue;if(ONLY&&!ONLY.includes(id))continue;const e0=T.errs.length;
  if(ty!==curTy){await tapSel(`#r2C [data-r2px="${({car:0,off:1,boat:2})[ty]}"]`);await p.waitForTimeout(1500);curTy=ty}
  if(!await tapSel(`#g9Col .g9Card[data-gc="${id}"] img`)&&!await tapSel(`#g9Col .g9Card[data-gc="${id}"]`)){res.push({id,ty,nm,miss:1});continue}
  // model chunk + build-up: wait until nothing is loading and the build-up is over
  for(let i=0;i<40;i++){await p.waitForTimeout(500);const s=JSON.parse(await ev(`JSON.stringify({w:LDL.wait.size,ba:BA.on})`));if(!s.w&&!s.ba&&i>3)break}
  await p.waitForTimeout(600);
  const r=JSON.parse(await ev(M));
  const th=await p.evaluate(id=>{const i=document.querySelector(`#g9Col .g9Card[data-gc="${id}"] img`);return i&&i.src&&i.src.startsWith('data:')?i.src:null},id);
  const f=`${OUT}/${ty}_${id}`;if(th)fs.writeFileSync(f+'_th.png',Buffer.from(th.split(',')[1],'base64'));
  // stage only (hide the RIDES panel? keep the real view: the panel is what Alex sees)
  await p.screenshot({path:f+'.png'});
  const gap=r.top!=null?+(r.min-r.top).toFixed(3):null;
  const o=Object.assign({id,ty,nm,gap,errs:T.errs.slice(e0)},r);res.push(o);
  console.log(ty.padEnd(4),id.padEnd(16),'gap',gap,'wl',r.wl,'top',r.top,'dum',r.ndum,r.plate?'PLATE':'','vf',r.vf.join('+'),'n',r.n,'sc',r.sc,'errs',o.errs.length,(o.errs[0]||'').slice(0,80))}
 fs.writeFileSync(OUT+'/audit'+(process.env.SHARD?'_'+SH[0]:'')+'.json',JSON.stringify(res,null,1));console.log('total errs',T.errs.length,JSON.stringify(T.errs.slice(0,8)));await T.b.close()})().catch(e=>{console.log('FAIL',e);process.exit(1)});
