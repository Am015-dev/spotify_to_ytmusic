// tTrees1Shots (trees-1): street (bv1) + park shots per city, old trees (?tr1=0) vs new, + draw stats. node tools/tTrees1Shots.js <url> <outdir>
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');const [BASE,OUT]=process.argv.slice(2);fs.mkdirSync(OUT,{recursive:true});
(async()=>{const res={};for(const c of['fra','ath'])for(const[tag,q]of[['before','&tr1=0'],['after','']]){const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await b.newPage({viewport:{width:852,height:393}});
 p.on('pageerror',e=>console.log('PAGEERR',String(e).slice(0,160)));await p.goto(BASE+'?test='+c+q);await p.waitForFunction(()=>window.__chk&&window.__bv&&window.__cvf&&window.__as&&window.__tr1,null,{timeout:240000});await p.waitForTimeout(4000);
 await p.evaluate(c=>__chk.go('bv1/'+c),c);await p.waitForTimeout(6000);const st=await p.evaluate(()=>{const a=__cvf.audit(150);return{calls:a.calls,tris:a.tris}});await p.screenshot({path:`${OUT}/${c}_street_${tag}.png`});
 const pk=await p.evaluate(()=>__cvf.park());await p.waitForTimeout(5000);const sp=await p.evaluate(()=>{const a=__cvf.audit(150);return{calls:a.calls,tris:a.tris}});await p.screenshot({path:`${OUT}/${c}_park_${tag}.png`});
 res[c+'_'+tag]={street:st,park:sp,pk};console.log(c,tag,JSON.stringify(res[c+'_'+tag]));await b.close()}
 fs.writeFileSync(OUT+'/stats.json',JSON.stringify(res,null,1))})();
