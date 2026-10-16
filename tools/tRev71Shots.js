// tRev71Shots (rev-71): park spot (ath), queue at a red light on a road near node 115 (fra), street with trees (fra). node tools/tRev71Shots.js <url> <outdir>
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const [BASE,OUT]=process.argv.slice(2);
(async()=>{for(const c of['ath','fra']){const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await b.newPage({viewport:{width:852,height:393}});
 p.on('pageerror',e=>console.log('PAGEERR',String(e).slice(0,160)));
 await p.goto(BASE+'?test='+c);await p.waitForFunction(()=>window.__chk&&window.__bv&&window.__cvf&&window.__l3,null,{timeout:300000});await p.waitForTimeout(4000);
 if(c==='ath'){await p.evaluate(()=>__cvf.park());await p.waitForTimeout(5000);await p.screenshot({path:`${OUT}/a_ath_park.png`})}
 else{
  console.log(await p.evaluate(()=>{const L=__l3,J=L.sig().slice().sort((a,b)=>Math.hypot(a.x-612,a.z-(-2))-Math.hypot(b.x-612,b.z-(-2)))[0];window.__J=J;return JSON.stringify({x:J.x|0,z:J.z|0,R0:J.R0,ap:J.ap.map(g=>[g.dx.toFixed(2),g.dz.toFixed(2),g.e.length])})}));
  // park on the longest approach 40 m before the junction, advance sim until its group is red and cars wait
  const r=await p.evaluate(()=>{const L=__l3,J=window.__J;let bestk=0,bn=-1;J.ap.forEach((g,k)=>{if(g.e.length>bn){bn=g.e.length;bestk=k}});const g=J.ap[bestk];
   L.park(J.x-g.dx*(J.R0+26),J.z-g.dz*(J.R0+26));window.RO&&0;let q=0;for(let s=0;s<240;s++){L.sim(1);q=0;for(const c of L.cars())if(c.CVn&&(c.cv||0)<1&&Math.hypot(c.x-J.x,c.z-J.z)<J.R0+60)q++;if(q>=3)break}return {q,k:bestk,dx:g.dx,dz:g.dz}});console.log(JSON.stringify(r));
  await p.waitForTimeout(3000);await p.screenshot({path:`${OUT}/b_fra_queue.png`});
  await p.evaluate(()=>__chk.go('bv1/fra'));await p.waitForTimeout(5000);await p.screenshot({path:`${OUT}/c_fra_street_trees.png`})}
 await b.close()}})();
