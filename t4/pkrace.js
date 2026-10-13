// t4/pkrace.js: quick race by taps with PERK=tank|glass|none seeded; prints player race stats
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});const ctx=await b.newContext({viewport:{width:1280,height:720}});
 const PK=process.env.PERK||'none';await ctx.addInitScript(pk=>{localStorage.setItem('mho_prof@1',JSON.stringify({xp:40000}));localStorage.setItem('mho_perks@1',JSON.stringify(pk==='none'?[]:[pk]))},PK);
 const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e)));await p.goto(process.argv[2]);
 await p.waitForFunction(()=>window.__mho&&!document.querySelector('#topBtns').hidden,null,{timeout:240000});
 await p.click('[data-a="quick"]');await p.waitForTimeout(1500);
 const btns=await p.$$eval('button',a=>a.filter(x=>x.offsetParent).map(x=>x.id+':'+x.textContent.trim().slice(0,20)));console.log(btns.slice(0,30).join(' | '));
 for(const s of['#startBtn','#tGo','text=START','text=RACE!','text=GO']){const e=p.locator(s).first();if(await e.count()&&await e.isVisible()){await e.click();break}}
 await p.waitForTimeout(8000);console.log(PK,await p.evaluate(()=>{const pl=__mho.pl;return pl&&pl.stats?JSON.stringify({top:+pl.stats.top.toFixed(3),hull:+pl.stats.hull.toFixed(3)}):'no pl '+__mho.state}));console.log('ERR',errs);await b.close()})();
