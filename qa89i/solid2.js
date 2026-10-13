const{chromium,boot}=require('../tools/d24lib');const fs=require('fs');const out=process.argv[3];fs.mkdirSync(require('path').dirname(out),{recursive:true});
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const{p,errs}=await boot(b,{city:'fra',url:process.argv[2],phone:true});
await p.evaluate(()=>{__mho.warp(-1200,960,3.14159,true)});for(let i=0;i<40;i++)await p.evaluate(()=>__tick(10));
const a=await p.evaluate(()=>__oc.ev(`(()=>{let b=null,bd=1e9;for(const r of DR.solid){const d=Math.hypot((r.x0+r.x1)/2+1200,(r.z0+r.z1)/2-960);if(d<bd){bd=d;b=r}}const cz=(b.z0+b.z1)/2,g=groundY(b.x1,cz);
 const W=852,H=393,rt=new THREE.WebGLRenderTarget(W,H),cam=new THREE.PerspectiveCamera(60,W/H,.5,3000);cam.position.set(b.x1+40,g+9,cz+55);cam.lookAt(b.x1,g+4,cz-10);cam.updateMatrixWorld(true);
 const R=__dbg.renderer||renderer;R.setRenderTarget(rt);R.render(scene,cam);const buf=new Uint8Array(W*H*4);R.readRenderTargetPixels(rt,0,0,W,H,buf);R.setRenderTarget(null);return JSON.stringify(Array.from(buf))})()`));
fs.writeFileSync(out+'.raw',Buffer.from(JSON.parse(a)));console.log(errs);await b.close()})()
