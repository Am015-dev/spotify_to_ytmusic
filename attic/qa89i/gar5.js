const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');const URL=process.argv[2],OUT=process.argv[3];fs.mkdirSync(OUT,{recursive:true});
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const ctx=await b.newContext({viewport:{width:852,height:393},isMobile:true,hasTouch:true});
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e)));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
await p.goto(URL);await p.waitForFunction(()=>window.__mho&&!document.querySelector('#topBtns').hidden,null,{timeout:240000});await p.waitForTimeout(2500);
console.log('menu pin text',await p.evaluate(()=>{const e=document.querySelector('#odPin');return e?e.textContent.replace(/\s+/g,' ').slice(0,40):null}));
await p.click('#gbMenuBtn');await p.waitForTimeout(2000);await p.getByText('BUILD',{exact:true}).first().click();await p.waitForTimeout(2500);await p.screenshot({path:OUT+'/1_tiles.png'});
await p.mouse.click(320,230);await p.waitForTimeout(1500);await p.screenshot({path:OUT+'/2_dropdown.png'});await p.mouse.click(720,300).catch(()=>{});await p.waitForTimeout(500);
await p.getByText('BRICKS',{exact:false}).first().click({force:true}).catch(()=>{});await p.waitForTimeout(800);
await p.mouse.click(120,230);await p.keyboard.type('slope');await p.waitForTimeout(2500);await p.screenshot({path:OUT+'/4_slope.png'});
await p.fill('input[type=search],input[placeholder*=earch]','').catch(()=>{});await p.waitForTimeout(800);
await p.mouse.click(688,230);await p.waitForTimeout(1500);await p.screenshot({path:OUT+'/3_paint.png'});console.log(errs);await b.close()})()
