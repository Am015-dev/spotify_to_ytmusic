// tCity5Pave (city-5): PAVEMENT-height camera (1.7 m, on the footpath looking along the street at the nearest vignette). node tools/tCity5Pave.js <url> <outdir> <tag> [query] ; CITY=fra|ath ; "&c3=0" = off
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
const [BASE,OUT,TAG,Q]=process.argv.slice(2);fs.mkdirSync(OUT,{recursive:true});
(async()=>{for(const c of(process.env.CITY?[process.env.CITY]:['fra','ath'])){const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await b.newPage({viewport:{width:852,height:393}});
 await p.goto(BASE+'?test='+c+(Q||''),{timeout:120000});await p.waitForFunction(()=>window.__chk&&window.__bv&&window.__c3,null,{timeout:240000});await p.waitForTimeout(4000);
 await p.evaluate(c=>__chk.go('bv1/'+c),c);await p.waitForTimeout(6000);
 const S=process.env.SPOT?JSON.parse(process.env.SPOT):await p.evaluate(()=>__c3.pick());
 if(!S){console.log(c,'no vignette');await b.close();continue}
 await p.evaluate(S=>__c3.pave(S),S);
 await p.waitForTimeout(6000);const st=await p.evaluate(()=>({a:__cvf.audit(150),c3:__c3.stat()}));await p.screenshot({path:`${OUT}/${c}_${TAG}.png`});console.log(c,TAG,JSON.stringify({S,calls:st.a.calls,tris:st.a.tris,c3:st.c3}));await b.close()}})();
