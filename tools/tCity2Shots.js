// tCity2Shots (city-2): 3 districts per city. node tools/tCity2Shots.js <url> <outdir> <tag> [query]   (before = query "&c2=0")
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
const [BASE,OUT,TAG,Q]=process.argv.slice(2);fs.mkdirSync(OUT,{recursive:true});
const D={fra:['Bankenviertel','Sachsenhausen','Bockenheim'],ath:['Plaka','Kolonaki','Monastiraki']};
(async()=>{const res={};for(const c of['fra','ath']){const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await b.newPage({viewport:{width:852,height:393}});
 await p.goto(BASE+'?test='+c+(Q||''));await p.waitForFunction(()=>window.__chk&&window.__bv,null,{timeout:240000});await p.waitForTimeout(4000);
 await p.evaluate(c=>__chk.go('bv1/'+c),c);await p.waitForTimeout(3000);
 for(const n of D[c]){const r=await p.evaluate(n=>__c2.view(n),n);
  await p.waitForTimeout(7000);const st=await p.evaluate(()=>{const a=__cvf.audit(150);return{calls:a.calls,tris:a.tris}});res[c+'/'+n]=Object.assign({at:r},st);await p.screenshot({path:`${OUT}/${c}_${n}_${TAG}.png`})}
 await b.close()}
console.log(TAG,JSON.stringify(res))})();
