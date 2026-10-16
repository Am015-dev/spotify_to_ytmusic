// tLights1: red-light runs + queue-overlap pairs at the busiest signalled spot, 120 s. node tools/tLights1.js <base url> <fra|ath> [secs]; LT=0 turns the guard off
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const [BASE,C,S]=process.argv.slice(2),b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const ctx=await b.newContext({viewport:{width:852,height:393},isMobile:true,hasTouch:true}),p=await ctx.newPage();p.setDefaultTimeout(300000);
p.on('pageerror',e=>console.log('ERR',String(e).slice(0,160)));
await p.goto(BASE+'?test='+C+'&draw=0'+(process.env.LT==='0'?'':'&l3lt=1'));await p.waitForFunction(()=>window.__tq&&__tq.ready,null,{polling:250,timeout:90000});
const r=await p.evaluate(secs=>{const {CV,HUB,L3,sim:L3_sim,park:L3_park}=window.__l3;let best=null,bn=0;for(const J of CV.sig){let n=0;for(const K of CV.sig)if(Math.hypot(K.x-J.x,K.z-J.z)<250)n++;if(n>bn){bn=n;best=J}}
 L3_park(best.x+best.R0+14,best.z+best.R0+14);const r0=L3.run,pairs=new Map(),runs=[];const id=c=>HUB.cars.indexOf(c);
 for(let s=0;s<secs;s++){L3_sim(1);const G=CV.G;for(const L of G.values())for(const c of L)if(!(c.dead>0)&&(c.cv||0)<1)for(const o of L){if(o===c||o.dead>0||(o.cv||0)>=1)continue;const rx=o.x-c.x,rz=o.z-c.z,al=rx*c.CVhx+rz*c.CVhz;if(al>0&&al<4&&Math.abs(-rx*c.CVhz+rz*c.CVhx)<1.6&&o.CVhx*c.CVhx+o.CVhz*c.CVhz>.8){const key=id(c)+'>'+id(o);let e=pairs.get(key);if(!e){let near=null,nd=1e9;for(const J of CV.sig){const d=Math.hypot(J.x-c.x,J.z-c.z)-J.R0;if(d<nd){nd=d;near=J}}
  const f=x=>({a:x.a,b:x.b,t:+(x.t||0).toFixed(2),cv:+(x.cv||0).toFixed(1),y:x.RDy,n:x.CVn,S:x.l3S?x.l3S.d.toFixed(1)+'k'+x.l3S.k:null,age:x.l3age});
  pairs.set(key,e={s,n:0,al:+al.toFixed(1),dJ:+nd.toFixed(1),lead:f(c),fol:f(o)})}e.n++}}}
 return{runs:L3.run-r0,rl:(L3.rls||[]).slice(-12),bn,pairs:[...pairs.values()]}},+S||120).catch(e=>String(e));
if(typeof r==='string')console.log(r);else{console.log(C,'runs',r.runs,JSON.stringify(r.rl),'distinct overlap pairs',r.pairs.length,'junctions',r.bn);for(const e of r.pairs)console.log(JSON.stringify(e))}
await b.close()})();
