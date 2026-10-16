// tCity4Shots (city-4): 3 street spots per city (bv1 + 2 districts). node tools/tCity3Shots.js <url> <outdir> <tag> [query]   (off = "&c3=0", on = ""); adds frame ms (median of 40 rAF frames, swiftshader = all CPU) + __c3.stat()
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
const [BASE,OUT,TAG,Q]=process.argv.slice(2);fs.mkdirSync(OUT,{recursive:true});
const D={fra:['bv1','Sachsenhausen','Bockenheim'],ath:['bv1','Kolonaki','Plaka']};
(async()=>{const res={};for(const c of(process.env.CITY?[process.env.CITY]:['fra','ath'])){const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await b.newPage({viewport:{width:852,height:393}});
 await p.goto(BASE+'?test='+c+(Q||''),{timeout:180000});await p.waitForFunction(()=>window.__chk&&window.__bv&&window.__c3,null,{timeout:240000});await p.waitForTimeout(4000);
 for(const n of D[c]){const r=n==='bv1'?await p.evaluate(c=>__chk.go('bv1/'+c),c):await p.evaluate(n=>__c2.view(n),n);
  await p.waitForTimeout(8000);const st=await p.evaluate(async()=>{const a=__cvf.audit(150);const T=[];let l=performance.now();for(let i=0;i<40;i++){await new Promise(r=>requestAnimationFrame(r));const t=performance.now();T.push(t-l);l=t}T.sort((x,y)=>x-y);return{calls:a.calls,tris:a.tris,ms:Math.round(T[20]),c3:__c3.near(),st:__c3.stat()}});res[c+'/'+n]=st;await p.screenshot({path:`${OUT}/${c}_${n}_${TAG}.png`})}
 await b.close()}
console.log(TAG,JSON.stringify(res))})();
