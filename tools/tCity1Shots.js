// tCity1Shots (city-1): bv1 street shot + draw stats per city. node tools/tCity1Shots.js <url> <outdir> <tag> [query]
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
const [BASE,OUT,TAG,Q]=process.argv.slice(2);fs.mkdirSync(OUT,{recursive:true});
(async()=>{const res={};for(const c of['fra','ath']){const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await b.newPage({viewport:{width:852,height:393}});
 await p.goto(BASE+'?test='+c+(Q||''));await p.waitForFunction(()=>window.__chk&&window.__bv,null,{timeout:240000});await p.waitForTimeout(4000);
 await p.evaluate(c=>__chk.go('bv1/'+c),c);await p.waitForTimeout(6000);
 const st=await p.evaluate(()=>{const a=__cvf.audit(150);return{calls:a.calls,tris:a.tris,bld:a.bld,fol:a.foliageNear,looks:a.foliageLooks,heights:a.heights}});
 res[c]=st;await p.screenshot({path:`${OUT}/${c}_${TAG}.png`});await b.close()}
console.log(TAG,JSON.stringify(res))})();
