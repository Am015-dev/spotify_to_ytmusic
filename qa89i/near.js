const{chromium,boot}=require('../tools/d24lib');
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const{p,errs,shot}=await boot(b,{city:'ath',url:process.argv[2],phone:true});
await p.evaluate(()=>{__mho.warp(1049,-553,1.3826,true)});for(let i=0;i<40;i++)await p.evaluate(()=>__tick(10));
console.log(await p.evaluate(()=>__oc.ev(`(()=>{const o=[];scene.traverse(m=>{if(!m.isMesh)return;const bb=new THREE.Box3().setFromObject(m),c=bb.getCenter(new THREE.Vector3());if(Math.hypot(c.x-1110,c.z+550)<14&&(bb.max.x-bb.min.x)<60){let ch=[];for(let q=m;q&&ch.length<6;q=q.parent)ch.push((q.name||q.type)+JSON.stringify(q.userData).slice(0,50)+(q.parent&&q.parent.children?'#'+q.parent.children.length:''));const mt=[].concat(m.material)[0];o.push({c:[c.x|0,c.y|0,c.z|0],s:[+(bb.max.x-bb.min.x).toFixed(1),+(bb.max.y-bb.min.y).toFixed(1),+(bb.max.z-bb.min.z).toFixed(1)],geo:m.geometry.type,col:mt.color&&mt.color.getHexString(),vis:m.visible,pv:m.parent.visible,ch})}});return JSON.stringify(o)})()`)));
await p.evaluate(()=>__oc.ev(`(()=>{window.__sl=null;})()`));
console.log(errs);await b.close()})()
