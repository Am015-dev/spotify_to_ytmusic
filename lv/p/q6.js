(()=>{const out=[];for(const [x,z] of [[-3036,1339],[232,-1543]]){const a=HUB.nodes.reduce((b,n)=>n&&Math.hypot(n.x-x,n.z-z)<Math.hypot(b.x-x,b.z-z)?n:b,HUB.nodes[0]),b=HUB.nodes[a.nb[0]],h=Math.atan2(b.x-a.x,b.z-a.z);__mho.warp(a.x,a.z,h,performance.now());RO.x=a.x;RO.z=a.z;RO.h=RO.vh=h;RO.y=__mho.gnd(a.x,a.z,RO.y+60);
 for(let i=0;i<40;i++)__tick(1);camera.updateMatrixWorld();const v=new THREE.Vector3();const pr=(x,y,z)=>{v.set(x,y,z).project(camera);return `${Math.round((v.x+1)*426)},${Math.round((1-v.y)*196)}${v.z>1?'B':''}`};
 out.push(`ro=${RO.x.toFixed(0)},${RO.z.toFixed(0)},${RO.y.toFixed(1)} cam=${camera.position.y.toFixed(1)} w=${a.w} pw=${a.pw} g=${a.g}`);
 for(const C of LV.cl.L.filter(c=>c.on))out.push(` ${C.k} d=${Math.hypot(C.x-RO.x,C.z-RO.z).toFixed(0)} dy=${(C.y-RO.y).toFixed(1)} scr=${pr(C.x,C.y+1,C.z)}`);
 const P=HUB.peds.filter(p=>p.cw).slice(0,4);for(const p of P)out.push(` ped y=${(p.y-RO.y).toFixed(1)} scr=${pr(p._x,p.y+1,p._z)}`);
 const F=LV.birds.fl.filter(f=>f.on&&!f.gull);for(const f of F.slice(0,3))out.push(` pigeon d=${Math.hypot(f.x-RO.x,f.z-RO.z).toFixed(0)} st=${f.st} dy=${(f.y-RO.y).toFixed(1)} scr=${pr(f.x,f.y,f.z)}`)}return out.join('\n')})()
