const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
const city=process.argv[2],lim=+process.argv[3]||9999;
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const p=await (await b.newContext({viewport:{width:852,height:393},isMobile:true,hasTouch:true})).newPage();
await p.goto('http://localhost:8813/index.html?test='+city+'&draw=0');
await p.waitForFunction(()=>window.__tq&&__tq.ready&&window.__chk&&window.__bot&&window.__botG,null,{polling:250,timeout:120000});
const r=await p.evaluate(lim=>{const B=__botG,N=__cvNodes(),ng=N.ng,pred=new Map();for(let i=0;i<ng;i++)for(const v of N[i].nb)if(v<ng){if(!pred.has(v))pred.set(v,[]);pred.get(v).push(i)}
 const H=[];for(let u=0;u<ng;u++)for(const v of N[u].nb){if(v>=ng)continue;const L=Math.hypot(N[u].x-N[v].x,N[u].z-N[v].z);if(L<6&&N[u].nb.length<=2&&(pred.get(u)||[]).length===1&&N[v].nb.length===1)H.push([u,v])}
 const out=[];let k=0;for(const[u,v]of H){if(k++>=lim)break;const u1=pred.get(u)[0],u2=(pred.get(u1)||[])[0],v1=N[v].nb[0],v2=(N[v1]||{nb:[]}).nb[0];if(u2==null||v1==null||v2==null)continue;const ids=[u2,u1,u,v,v1,v2];const P=ids.map(i=>[N[i].x,N[i].z]);
  const R=B.BOT_rec(),h=Math.atan2(P[1][0]-P[0][0],P[1][1]-P[0][1]);B.roamWarp(P[0][0],P[0][1],h,true);B.RO.v=0;for(let i=0;i<45;i++)R.step();const l=B.BOT_leg(R,P,25);R.done();
  if(l.why||l.left>25)out.push([ids,Math.round(N[u].x),Math.round(N[u].z),l.why||('left '+l.left),l.backs,l.resets])}
 return{n:H.length,tested:Math.min(k,H.length),bad:out}},lim);
fs.writeFileSync(process.argv[4]||'/dev/null',JSON.stringify(r));console.log(city,'hairpins',r.n,'tested',r.tested,'bad',r.bad.length);console.log(r.bad.slice(0,30).map(x=>JSON.stringify(x)).join('\n'));await b.close()})();
