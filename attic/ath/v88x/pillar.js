// ath/v88x/pillar.js <url> : identify the beige pillar of fra_0.2_wall (nearest HUB.bld to spot 0.2) and raycast what mesh is drawn there
const enter=require('../../bc/enter.js');const URL=process.argv[2];
(async()=>{const E=await enter(URL,{gfx:'normal',seed:`localStorage.setItem('mho_slot','1');localStorage.setItem('mho_roam@1',JSON.stringify({tut:1,otg:{}}))`});const {p}=E;p.setDefaultTimeout(900000);await E.roamApi();
 await p.evaluate(()=>{window.__wb&&window.__wb.fast&&window.__wb.fast();__tick&&__tick(1)});
 const [x,z,h]=JSON.parse(require('fs').readFileSync('ath/v88w/spots_fra.json','utf8'))[0];
 await p.evaluate(([x,z,h])=>{const M=__mho,R=M.RO;M.warp(x,z,h,performance.now());R.x=x;R.z=z;R.y=M.gnd(x,z,R.y+60);R.v=0;R.vh=h;R.h=h},[x,z,h]);await p.waitForTimeout(6000);
 const r=await p.evaluate(()=>{const M=__mho,R=M.RO;let b=null,bd=80;for(const q of(__g9ev('HUB').bld||[])){if(!(q.h>5)||q.hw<3||q.hd<3)continue;const d=Math.hypot(q.x-R.x,q.z-R.z);if(d<bd){bd=d;b=q}}
  const o={};if(b)for(const k in b){const v=b[k];o[k]=typeof v==='object'?(v&&v.isObject3D?'OBJ:'+v.name+'/'+v.type:Array.isArray(v)?'arr'+v.length:typeof v):v}
  const dx=R.x-b.x,dz=R.z-b.z,L=Math.hypot(dx,dz)||1,k=Math.max(b.hw,b.hd)+11,g=M.gnd(b.x+dx/L*k,b.z+dz/L*k,R.y+.3);
  const T=__g9ev('THREE'),rc=new T.Raycaster(new T.Vector3(b.x+dx/L*k,g+2.5,b.z+dz/L*k),new T.Vector3(-dx/L,.1,-dz/L).normalize(),0,40),sc=__g9ev('scene');
  const hits=(rc.camera=__g9ev('camera'),rc.intersectObjects(sc.children,true)).slice(0,4).map(t=>{const path=[];let q=t.object;while(q){path.push((q.name||'')+':'+q.type);q=q.parent}const m=t.object.material;return{d:+t.distance.toFixed(1),path:path.join(' < '),mat:m&&(m.name||m.type),col:m&&m.color&&m.color.getHexString(),map:!!(m&&m.map),ud:JSON.stringify(t.object.userData).slice(0,200),geo:t.object.geometry&&t.object.geometry.type,inst:t.instanceId}});
  return{bd,b:o,hits}});console.log(JSON.stringify(r,null,1));await E.close?.();process.exit(0)})();
