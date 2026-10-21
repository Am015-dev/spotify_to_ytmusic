// tCLsmashShot (cl-L2): node tools/tCLsmashShot.js <base url> <out png>  852x393; a stall smashed at 35 km/h inside the core with ?cl=smash, shot ~0.15 s later
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const [BASE,OUT]=process.argv.slice(2);
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const c=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:1,isMobile:true,hasTouch:true});const p=await c.newPage();p.setDefaultTimeout(400000);
 await p.goto(BASE+'?test=fra&cl=smash');await p.waitForFunction(()=>window.__chk&&window.__tq&&__tq.ready,null,{timeout:400000});await p.waitForTimeout(3000);
 await p.evaluate(()=>__tk.q(`(()=>{const q=rfSnap(CL.spawn[0],CL.spawn[1],120);RO.x=q[0];RO.z=q[1];RO.h=RO.vh=Math.PI/2;RO.y=groundAt(RO.x,RO.z,99);camSnap=true;OF_reset&&OF_reset();RO.turbo=0;
  const t=HUB.props.some(x=>x.t==='stall')?'stall':'tree',d=HUB.ptypes[t],pp=HUB.props.find(x=>x.t===t&&x.im&&x.i!=null),D=Math.min(OB_HL+d.r*.6,d.r+2);pp.x=RO.x+D;pp.z=RO.z;pp.y=RO.y;pp.alive=true;pp.sm2T=0;
  const k=Math.floor(pp.x/16)*10000+Math.floor(pp.z/16),L=HUB.pgrid.get(k)||(HUB.pgrid.set(k,[]),HUB.pgrid.get(k));if(!L.includes(pp))L.push(pp);RO.v=35/3.6;smashCheck(1/60);window.__cl2=CL.sn+' '+CL.lastB})()`));
 await p.waitForTimeout(150);await p.screenshot({path:OUT});console.log('smash',await p.evaluate(()=>window.__cl2));await b.close()})();
