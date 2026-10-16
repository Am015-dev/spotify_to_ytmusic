// tTrees1 (trees-1): model close-ups (new vs old asset-1 builds) as one image each. node tools/tTrees1.js <url> <outdir>
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');const [BASE,OUT]=process.argv.slice(2);fs.mkdirSync(OUT,{recursive:true});
const N={fra:['oak','linden','chestnut','oakAut','maple','birch','fir','plane','bush','bushFl','p_hedge','p_planter'],ath:['palm','olive','cypress','stonepine','aleppo','orange','almond','plane','oleander','bushFl','p_hedge','p_planter']};
(async()=>{for(const c of['fra','ath']){const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await b.newPage({viewport:{width:852,height:393}});
 p.on('pageerror',e=>console.log('PAGEERR',String(e).slice(0,200)));await p.goto(BASE+'?test='+c);await p.waitForFunction(()=>window.__tr1&&window.__tr1.gallery&&window.__as,null,{timeout:240000});await p.waitForTimeout(2000);
 for(const old of[0,1]){const r=await p.evaluate(([n,o])=>__tr1.gallery(n,o),[N[c],old]);fs.writeFileSync(`${OUT}/models_${c}_${old?'old':'new'}.jpg`,Buffer.from(r.url.split(',')[1],'base64'));console.log(c,old?'old':'new',JSON.stringify(r.tris))}
 await b.close()}})();
