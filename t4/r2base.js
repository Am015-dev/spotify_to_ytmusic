// t4/r2base.js: 852x393 real-touch tour of the garage (every tab + builder), shots + layout audit. usage: node t4/r2base.js <url> <outdir> [W H]
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const U=process.argv[2],O=process.argv[3],W=+(process.argv[4]||852),H=+(process.argv[5]||393);fs.mkdirSync(O,{recursive:true});
 const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const ctx=await b.newContext({viewport:{width:W,height:H},isMobile:W<1000,hasTouch:true});const pg=await ctx.newPage();const errs=[];pg.on('pageerror',e=>errs.push(String(e)));pg.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
 await pg.goto(U);await pg.waitForFunction(()=>window.__mho&&!document.querySelector('#topBtns').hidden,null,{timeout:240000});const cdp=await ctx.newCDPSession(pg);
 const tapXY=async(x,y)=>{const tp=[{x,y,id:1,radiusX:4,radiusY:4,force:1}];await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:tp});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await pg.waitForTimeout(600)};
 const tap=async s=>{const e=await pg.$(s);if(!e){console.log('NO',s);return 0}const bb=await e.boundingBox();if(!bb){console.log('NOBOX',s);return 0}await tapXY(bb.x+bb.width/2,bb.y+bb.height/2);return 1};
 const shot=async n=>{await pg.waitForTimeout(900);await pg.screenshot({path:`${O}/${n}.png`});console.log('shot',n)};
 await tap('#gbMenuBtn');await pg.waitForTimeout(2500);
 for(const t of['veh','parts','paint','horn','driver']){await tap(`#gbx .gbTabs [data-t="${t}"]`);await shot('tab_'+t)}
 await tap('#gbx .gbTabs [data-t="bricks"]');await pg.waitForTimeout(1500);await shot('bricks');
 console.log('ERR',JSON.stringify(errs.slice(0,6)));await b.close()})();
