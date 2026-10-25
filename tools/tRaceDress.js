// tRaceDress (racedress-r24n): phone-profile page (iPhone UA, 852x393 touch), ?test=<city>, then evaluates a JS file in the page and prints its result.
//   node tools/tRaceDress.js <base url> <city> <file.js with an async body returning a value> [extra query]
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const[U,C,F,Q]=process.argv.slice(2);const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const ctx=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:1,isMobile:true,hasTouch:true,userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'});
 const p=await ctx.newPage();p.setDefaultTimeout(600000);p.on('pageerror',e=>console.log('PAGEERR',String(e).slice(0,200)));p.on('console',m=>{if(m.type()==='warning'&&/racedress/.test(m.text()))console.log('WARN',m.text().slice(0,300))});
 await p.goto(U+(U.includes('?')?'&':'?')+'test='+C+(Q||''));await p.waitForFunction(()=>window.__tq&&__tq.ready,null,{polling:250,timeout:120000});
 const body=fs.readFileSync(F,'utf8');const r=await p.evaluate(`(async()=>{${body}})()`).catch(e=>'EVALERR '+e);
 console.log(typeof r==='string'?r:JSON.stringify(r));if(process.env.SHOT)for(const s of JSON.parse(process.env.SHOT)){await p.evaluate(s[1]);await p.waitForTimeout(+(s[2]||400));await p.screenshot({path:s[0],type:'jpeg',quality:80})}await b.close()})();
