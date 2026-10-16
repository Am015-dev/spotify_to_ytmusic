// tLights3: red-light-run forensics at the busiest signalled spot. node tools/tLights3.js <base url> <fra|ath> [secs] ; per run: the car's last 3 s
// (edge, its CV approach vs the audit approach, light state of both, distance to the box edge, speed, hold reason, chosen stop line). LT=0 = guard off
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const [BASE,C,S]=process.argv.slice(2),b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const ctx=await b.newContext({viewport:{width:852,height:393},isMobile:true,hasTouch:true}),p=await ctx.newPage();p.setDefaultTimeout(600000);
p.on('pageerror',e=>console.log('ERR',String(e).slice(0,160)));
await p.goto(BASE+'?test='+C+'&draw=0'+(process.env.LT==='0'?'':'&l3lt=1'));await p.waitForFunction(()=>window.__tq&&__tq.ready,null,{polling:250,timeout:90000});
const r=await p.evaluate(secs=>{const {CV,HUB,L3,sim,park}=window.__l3;let best=null,bn=0;for(const J of CV.sig){let n=0;for(const K of CV.sig)if(Math.hypot(K.x-J.x,K.z-J.z)<250)n++;if(n>bn){bn=n;best=J}}
 park(best.x+best.R0+14,best.z+best.R0+14);const r0=L3.run,H=new Map(),out=[];let seen=(L3.rls||[]).length;const st=(J,k)=>{const u=((CV.t-J.off)%J.C+J.C)%J.C,s=J.s[k],g=J.g[k];return u>=s&&u<s+g?'g':u>=s+g&&u<s+g+2.5?'y':'r'};
 for(let i=0;i<secs*15;i++){sim(1/15,1/15);
  for(const c of HUB.cars){if(c.dead>0||!c.CVn)continue;let J=null,jd=1e9;for(const Q of CV.sig){const d=Math.hypot(Q.x-c.x,Q.z-c.z)-Q.R0;if(d<jd){jd=d;J=Q}}if(!J||jd>50){H.delete(c);continue}
   const a=H.get(c)||[];const f=c.CVf!=null?c.CVf:-1,cj=f>=0?Math.floor(f/8):-1,ck=f>=0?f%8:-1;a.push([+CV.t.toFixed(2),c.a+'>'+c.b,+(c.t||0).toFixed(2),'J'+J.id,'d'+jd.toFixed(1),'v'+(c.cv||0).toFixed(1),c.RDy||'-','cv'+cj+'/'+ck+(cj===J.id&&ck>=0?st(J,ck):'?'),c.l3S?'S'+c.l3S.J.id+'k'+c.l3S.k+st(c.l3S.J,c.l3S.k)+'d'+c.l3S.d.toFixed(1):'S-',J.res&&J.res.has(c)?'res':'']);if(a.length>45)a.shift();H.set(c,a)}
  const R=L3.rls||[];while(seen<R.length){const rl=R[seen++];let c=null,cd=1e9;for(const o of HUB.cars){const d=Math.hypot(o.x-rl[0],o.z-rl[1]);if(d<cd&&o.a===rl[2]&&o.b===rl[3]){cd=d;c=o}}
   const J=CV.sig.find(Q=>Math.abs(Q.x-(+rl[8].slice(3).split(',')[0]))<1.01&&Q.R0|0);out.push({rl:JSON.stringify(rl),car:HUB.cars.indexOf(c),hist:(H.get(c)||[]).filter((e,i,A)=>i%3===0||i>A.length-6).map(e=>e.join(' '))})}}
 const box=J=>({id:J.id,x:J.x|0,z:J.z|0,R0:+J.R0.toFixed(1),C:J.C,ap:J.ap.map((g,k)=>[g.dx.toFixed(2),g.dz.toFixed(2),'s'+J.s[k],'g'+J.g[k],g.e.map(e=>e.join('>')).join(' ')])});
 return{runs:L3.run-r0,bn,out,boxes:CV.sig.filter(J=>Math.hypot(J.x-612,J.z+2)<80).map(box)}},+S||120).catch(e=>String(e));
if(typeof r==='string')console.log(r);else{console.log(C,'runs',r.runs,'junctions',r.bn);for(const B of r.boxes)console.log('BOX',JSON.stringify(B));for(const o of r.out){console.log('RUN',o.rl,'car',o.car);for(const h of o.hist)console.log('   ',h)}}
await b.close()})();
