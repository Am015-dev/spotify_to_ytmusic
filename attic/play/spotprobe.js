// play/spotprobe.js: what is at a stuck spot? warp there (city, x, z), wait, list colliders / traffic / ramps nearby, take a shot.
// usage: node play/spotprobe.js <url> <city> <x> <z> <out.jpg>
const{chromium,boot}=require('../tools/d24lib');const[URL,city,X,Z,OUT]=process.argv.slice(2);
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const{p,errs,shot}=await boot(b,{city,url:URL,phone:true});
 const r=await p.evaluate(([x,z])=>__g9ev(`(()=>{roamWarp(${x},${z},0);__tick(120);const o={pos:[RO.x,RO.z,RO.y].map(v=>+v.toFixed(1)),v:RO.v};
  o.cars=HUB.cars.filter(c=>!c.dead&&Math.hypot(c.x-RO.x,c.z-RO.z)<25).map(c=>({d:+Math.hypot(c.x-RO.x,c.z-RO.z).toFixed(1),x:+c.x.toFixed(1),z:+c.z.toFixed(1),v:c.v,k:c.k,hitT:c.hitT,pk:!!c.pk,stop:c.stop,red:c.red,keys:Object.keys(c).join(',')}));
  o.hit=[];for(let a=0;a<16;a++)for(const R of[3,6,10]){const xx=RO.x+Math.sin(a*.3927)*R,zz=RO.z+Math.cos(a*.3927)*R;const h=roamHit(xx,zz,.3,RO.y);if(h)o.hit.push([a,R])}
  return o})()`),[+X,+Z]);
 console.log(JSON.stringify(r).slice(0,3000));await shot(OUT);console.log('errs',errs);await b.close()})();
