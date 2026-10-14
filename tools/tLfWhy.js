// tLfWhy (art-3): why the fill skips the ground in front of a lf1 spot. node tools/tLfWhy.js <url> <city> <spot id>
// prints a histogram of LF.why() over the view cone (±30°, 15-160 m), so a flat-green FAIL names the rule that blocks it.
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const [BASE,C,ID]=process.argv.slice(2);
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await b.newPage({viewport:{width:852,height:393}});
 await p.goto(BASE+'?test='+C+'&draw=0');await p.waitForFunction(()=>window.__tq&&__tq.ready,null,{polling:250,timeout:100000});
 const r=await p.evaluate(id=>{const s=__lvf.SP[id];__lvf.ensure(s.x,s.z,600);const H={};for(let d=15;d<=160;d+=5)for(let a=-30;a<=30;a+=3){const q=s.h+a*Math.PI/180,x=s.x+Math.sin(q)*d,z=s.z+Math.cos(q)*d;
  const w=String(__lvf.why(x,z)).replace(/[-\d.]+/g,'#');const k=(d<60?'near ':'far ')+w;H[k]=(H[k]||0)+1}return H},ID);console.log(ID,JSON.stringify(r));await b.close()})();
