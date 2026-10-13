// g18/patch.js <url> <out> <setid>: garage → RIDES → set → BUILD; shot; list shadow casters in the garage scene (size, visible, material)
const E=require('../bc/enter.js');const fs=require('fs');const OUT=process.argv[3];fs.mkdirSync(OUT,{recursive:true});const ID=process.argv[4];
(async()=>{const T=await E(process.argv[2],{gfx:'normal',tick:0});const{p,tap,tapXY}=T;const ev=c=>p.evaluate(c=>__g9ev(c),c);
 const tapSel=async s=>{const r=await p.evaluate(s=>{const e=document.querySelector(s);if(!e)return null;e.scrollIntoView({block:'center'});const b=e.getBoundingClientRect();return[b.x+b.width/2,b.y+b.height/2]},s);if(r){await tapXY(r[0],r[1]);return 1}console.log('NO',s);return 0};
 await tap('#gbMenuBtn');await p.waitForTimeout(3500);await tap('#r2R [data-r2m="rides"]');await p.waitForTimeout(3000);
 await tapSel(`#g9Col .g9Card[data-gc="${ID}"] img`);await p.waitForTimeout(9000);await p.screenshot({path:OUT+'/stage.png'});
 const C=`(()=>{const o=[];GB.sc.updateMatrixWorld(true);GB.sc.traverse(m=>{if(!m.isMesh||!m.castShadow)return;let v=1;for(let q=m;q;q=q.parent)if(!q.visible)v=0;const b=new THREE.Box3().setFromObject(m),s=b.getSize(new THREE.Vector3());
  if(s.x*s.z>.5)o.push({n:m.name||m.geometry.type,v,mv:m.material&&m.material.visible,cw:m.material&&m.material.colorWrite,op:m.material&&m.material.opacity,s:s.toArray().map(q=>+q.toFixed(2)),y:[+b.min.y.toFixed(2),+b.max.y.toFixed(2)],gb:!!m.userData.gb,inst:!!m.isInstancedMesh})});return JSON.stringify(o)})()`;
 console.log('stage casters',await ev(C));
 await tapSel('#r2R [data-r2m="build"]');await p.waitForTimeout(5000);await p.screenshot({path:OUT+'/build.png'});console.log('build casters n',JSON.parse(await ev(C)).length);
 const shot=async n=>{await p.waitForTimeout(1500);await p.screenshot({path:OUT+'/'+n+'.png'})};
 console.log('cam',await ev(`JSON.stringify({near:GB.cam.near,far:GB.cam.far,d:GB.cam.position.length().toFixed(1)})`));
 await ev(`(()=>{GS.g.traverse(o=>{if(o.isMesh&&o.geometry.type==='BoxGeometry'&&o.geometry.parameters.width>14&&o.geometry.parameters.height===.5){o.position.y-=.03;window.__R=o}})})()`);await shot('b_rimdown');
 console.log('shadow',await ev(`JSON.stringify({type:GB.r.shadowMap.type,auto:GB.r.shadowMap.autoUpdate,bias:__L.shadow.bias,nb:__L.shadow.normalBias,ms:__L.shadow.mapSize.x,gy:GS.gy,gpos:GS.g.position.y})`));
 console.log('errs',JSON.stringify(T.errs.slice(0,5)));await T.b.close()})().catch(e=>{console.log('FAIL',e);process.exit(1)});
