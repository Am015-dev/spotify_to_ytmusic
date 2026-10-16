// tRev70Shots (rev-70): release shots on the BUILT page via checklist GOs. node tools/tRev70Shots.js <url> <outdir>
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const [BASE,OUT]=process.argv.slice(2);
(async()=>{for(const c of['fra','ath']){const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await b.newPage({viewport:{width:852,height:393}});
 p.on('pageerror',e=>console.log('PAGEERR',String(e).slice(0,160)));
 await p.goto(BASE+'?test='+c+(c==='fra'?'&l3lt=1':''));await p.waitForFunction(()=>window.__chk&&window.__bv&&window.__cvf&&window.__l3,null,{timeout:300000});await p.waitForTimeout(4000);
 const go=async(id,n,w)=>{const r=await p.evaluate(i=>String(__chk.go(i)).slice(0,100),id).catch(e=>'ERR '+e.message.slice(0,80));console.log(c,id,r);await p.waitForTimeout(w||4500);await p.screenshot({path:`${OUT}/${c}_${n}.png`})};
 if(c==='fra')await go('bv1/fra','a_street_trees');else{await p.evaluate(()=>__cvf.park());await p.waitForTimeout(5000);await p.screenshot({path:`${OUT}/ath_b_park_trees.png`})}
 if(c==='fra'){await go('life3/lanes','c_lanes');await go('life3/lights','d_junction')}else await go('life3/peds','e_peds',30000);
 await b.close()}})();
