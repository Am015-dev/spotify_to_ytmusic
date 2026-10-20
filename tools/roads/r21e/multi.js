const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const city=process.argv[2],seeds=process.argv[3].split(',').map(Number),base=process.argv[4]||'http://localhost:8813/index.html';
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const p=await (await b.newContext({viewport:{width:852,height:393},isMobile:true,hasTouch:true})).newPage();
await p.goto(base+'?test='+city+'&draw=0');
await p.waitForFunction(()=>window.__tq&&__tq.ready&&window.__chk&&window.__bot,null,{polling:250,timeout:120000});
for(const sd of seeds){await p.evaluate(([s,c])=>{__tq.reset();__bot.seed=20261020+s;__bot.wp=4;__bot.trace=[];if(__chk.bot)delete __chk.bot[c+'/nav'];window.BOT_go('nav',t=>{__bot.said=t})},[sd,city]);
await p.waitForFunction(c=>__chk.bot&&__chk.bot[c+'/nav'],city,{timeout:300000,polling:200});
const r=await p.evaluate(c=>({ok:__chk.bot[c+'/nav'].ok,legs:__chk.bot[c+'/nav'].legs,tr:__bot.trace,cells:__chk.bot[c+'/nav'].cells}),city);
console.log('SEED',sd,r.ok?'PASS':'FAIL',JSON.stringify(r.legs.map(l=>[l.g,l.from,l.why,l.resets,l.backs,Math.round(l.t)])));
if(!r.ok)console.log(' TRACE',JSON.stringify(r.tr.filter((x,i)=>x[0]==='JUMP'||i%3==0)),' CELLS',JSON.stringify(r.cells));}
await b.close()})();
