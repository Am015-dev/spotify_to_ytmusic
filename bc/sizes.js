// bc/sizes.js <url>: every car ride's brick extent (studs, plates) + local box, no roam needed
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const IDS=process.env.IDS?process.env.IDS.split(','):['rod','t_rally','t_turbo','t_taxi','t_bus','t_truck','t_limo','t_mt','t_v30313_1','t_v30572_1','t_v3179_1','t_v3180_1','t_v3221_1','t_v4436_1','t_v4914_1','t_v60017_1','t_v60054_1','t_v60059_1','t_v60083_1','t_v75878_1','t_v75892_1','t_v75893_1a','t_v75893_1b','t_v7639_1','t_v7731_1'];
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});const p=await b.newPage({viewport:{width:852,height:393}});
 const errs=[];p.on('pageerror',e=>errs.push(String(e)));
 await p.goto(process.argv[2]);await p.waitForFunction(()=>window.__ld&&window.__ld.need,null,{timeout:240000});
 for(const id of IDS){const r=await p.evaluate(async id=>{try{const S=__ld.set(id);if(!S)return 'noset';let B=S.car();if(!Array.isArray(B)||!B.length){await __ld.need(__ld.probe(()=>S.car()));B=S.car()}
   const T=__ld.THREE;const fx=__ld.fix(B.map(b=>Array.isArray(b)?{t:b[0],x:b[1],z:b[2],r:b[3],c:b[4],y:b[5]||0}:b));const g=__ld.grp(fx);const bb=new T.Box3().setFromObject(g),s=bb.getSize(new T.Vector3());
   const U=__ld.U,PH=__ld.PH;const drv=fx.filter(b=>/^drv/.test(b.t)).length;
   return {n:B.length,drv,studW:+(s.x/U).toFixed(1),studL:+(s.z/U).toFixed(1),bricksH:+(s.y/(PH*3)).toFixed(1),loc:s.toArray().map(v=>+v.toFixed(2))}}catch(e){return 'ERR '+e}},id);
  console.log(id,JSON.stringify(r))}
 console.log('ERR',errs.slice(0,4));await b.close()})();
