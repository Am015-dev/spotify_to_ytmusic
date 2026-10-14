// tBVshots (art-3): ONE browser pass, close-ups of each street-life kind (shop, cafe, kiosk, bill, mural) per city + the bv1 GO view, then one grid.
//   node tools/tBVshots.js <base url> <outdir>
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');const {execSync}=require('child_process');const [BASE,OUT]=process.argv.slice(2);fs.mkdirSync(OUT,{recursive:true});
(async()=>{const files=[];
 for(const c of['fra','ath']){const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await b.newPage({viewport:{width:852,height:393}});await p.goto(BASE+'?test='+c);await p.waitForFunction(()=>window.__tq&&__tq.ready,null,{polling:250,timeout:200000});
  await p.evaluate(c=>__chk.go('bv1/'+c),c);await p.waitForTimeout(3000);let f=`${OUT}/${c}_go.png`;await p.screenshot({path:f});files.push(f);
  for(const t of['shop','cafe','kiosk','bill','mural']){const ok=await p.evaluate(t=>{const L=(__bv.BV.L||[]).filter(o=>o.t===t);if(!L.length)return false;const o=L[Math.floor(L.length/3)];return __bv.view(o)},t);if(!ok)continue;
   await p.waitForTimeout(1800);f=`${OUT}/${c}_${t}.png`;await p.screenshot({path:f});files.push(f)}await b.close()}
fs.writeFileSync(`${OUT}/files.txt`,files.join('\n'));
 execSync(`python3 -c "
from PIL import Image;import sys;F=open('${OUT}/files.txt').read().split();W,H=426,196;g=Image.new('RGB',(W*3,H*((len(F)+2)//3)))
for i,f in enumerate(F):g.paste(Image.open(f).resize((W,H)),((i%3)*W,(i//3)*H))
g.save('${OUT}/grid.png')"`);console.log('GRID',`${OUT}/grid.png`,files.length)})();
