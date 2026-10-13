const{chromium,boot}=require('../tools/d24lib');
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const{p,errs,shot}=await boot(b,{city:'fra',url:process.argv[2],phone:true});
await p.evaluate(()=>{__mho.warp(-1200,960,3.14159,true)});for(let i=0;i<60;i++)await p.evaluate(()=>__tick(10));
console.log(await p.evaluate(()=>__oc.ev(`(()=>{const o=[];scene.traverse(m=>{if(!m.isMesh||!m.geometry)return;const g=m.geometry;if(!g.attributes.position)return;const P=g.attributes.position,C=g.attributes.color;if(m.name==='x')return;const bb=new THREE.Box3().setFromObject(m);const c=bb.getCenter(new THREE.Vector3()),sz=bb.getSize(new THREE.Vector3());
 if(Math.hypot(c.x+1200,c.z-940)<130&&Math.max(sz.x,sz.z)>6&&Math.max(sz.x,sz.z)<140&&sz.y<9&&sz.y>.8){o.push([Math.round(c.x),Math.round(c.y),Math.round(c.z),+sz.x.toFixed(1),+sz.y.toFixed(1),+sz.z.toFixed(1),m.name||m.type,JSON.stringify(m.userData).slice(0,40),[].concat(m.material)[0].color&&[].concat(m.material)[0].color.getHexString(),P.count])}});return JSON.stringify(o.slice(0,40))})()`)));
console.log(errs);await b.close()})()
