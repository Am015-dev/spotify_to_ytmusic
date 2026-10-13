const{chromium,boot}=require('../tools/d24lib');
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const{p,errs,shot}=await boot(b,{city:'ath',url:process.argv[2],phone:true});
const CX=+process.env.CX,CZ=+process.env.CZ,HE=+process.env.HE||500;
await p.evaluate(([x,z])=>{__mho.warp(x,z,0,true)},[CX,CZ]);for(let i=0;i<40;i++)await p.evaluate(()=>__tick(10));
const r=await p.evaluate(([CX,CZ,HE])=>__oc.ev(`(()=>{const N=1600,rt=new THREE.WebGLRenderTarget(N,N),oc=new THREE.OrthographicCamera(-${HE},${HE},${HE},-${HE},1,2000);oc.position.set(${CX},800,${CZ});oc.up.set(0,0,-1);oc.lookAt(${CX},0,${CZ});oc.updateMatrixWorld(true);
 const R=__dbg.renderer||renderer;const old=scene.fog;scene.fog=null;R.setRenderTarget(rt);R.render(scene,oc);const buf=new Uint8Array(N*N*4);R.readRenderTargetPixels(rt,0,0,N,N,buf);R.setRenderTarget(null);scene.fog=old;
 window.__top=Array.from(buf);const mask=new Uint8Array(N*N),W=new Uint8Array(N*N);for(let i=0;i<N*N;i++){const r=buf[i*4],g=buf[i*4+1],b=buf[i*4+2];if(r>200&&g>110&&g<190&&b<90)mask[i]=1;if(r>205&&g>205&&b>195)W[i]=1}
 // clusters by 8px cells
 const cl={};for(let y=0;y<N;y++)for(let x=0;x<N;x++){const i=y*N+x;if(!mask[i])continue;const k=(x>>4)+','+(y>>4);cl[k]=(cl[k]||0)+1}
 const out=[];for(const k in cl){if(cl[k]<40)continue;const[cx,cy]=k.split(',').map(Number);let w=0;for(let y=cy*16-24;y<cy*16+40;y++)for(let x=cx*16-24;x<cx*16+40;x++)if(x>=0&&y>=0&&x<N&&y<N&&W[y*N+x])w++;out.push([Math.round(${CX}-${HE}+(cx*16+8)*${2*HE}/N),Math.round(${CZ}-${HE}+(cy*16+8)*${2*HE}/N),cl[k],w])}
 return JSON.stringify(out.sort((a,b)=>b[3]-a[3]).slice(0,25))})()`),[CX,CZ,HE]);console.log(r);{const a=await p.evaluate(()=>window.__top);const sharp=1;require('fs').writeFileSync('qa89i/top.raw',Buffer.from(a))}console.log(errs);await b.close()})()
