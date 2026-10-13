// t4/g9col.js: 852x393 real touch on the garage COLLECTION (RIDES tab): type tabs, cards render, equip by tap (street + off-road mix),
// favourite + filter, sort, ✎ BUILD opens the builder with that car. Shots into <outdir>. usage: node t4/g9col.js <url> <outdir>
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const O=process.argv[3];fs.mkdirSync(O,{recursive:true});const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const ctx=await b.newContext({viewport:{width:852,height:393},isMobile:true,hasTouch:true});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e)));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
 await p.goto(process.argv[2]);await p.waitForFunction(()=>window.__mho&&!document.querySelector('#topBtns').hidden,null,{timeout:240000});const cdp=await ctx.newCDPSession(p);
 const tapXY=async(x,y)=>{const tp=[{x,y,id:1,radiusX:4,radiusY:4,force:1}];await Promise.all([cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:tp}),cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]})]);await p.waitForTimeout(700)};
 const tap=async s=>{const e=await p.$(s);if(!e){console.log('NO',s);return 0}await e.scrollIntoViewIfNeeded();const bb=await e.boundingBox();if(!bb){console.log('NOBOX',s);return 0}await tapXY(bb.x+bb.width/2,bb.y+bb.height/2);return 1};
 const ev=(f,a)=>p.evaluate(f,a);const shot=async n=>{await p.waitForTimeout(800);await p.screenshot({path:`${O}/${n}.png`});console.log('shot',n)};
 const wait=async()=>{for(let i=0;i<60;i++){const n=await ev(()=>document.querySelectorAll('#g9Col img[data-k]:not([src])').length);if(!n)return;await p.waitForTimeout(1000)}};
 await tap('#gbMenuBtn');await p.waitForTimeout(1500);await tap('#gbx .gbTabs [data-t="veh"]');await wait();await shot('01_street');
 const info=await ev(()=>{const C=document.querySelector('#g9Col');const small=[...C.querySelectorAll('*')].filter(e=>e.childNodes.length&&[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())&&parseFloat(getComputedStyle(e).fontSize)<12).map(e=>e.className+':'+getComputedStyle(e).fontSize);
  return{cards:C.querySelectorAll('.g9Card').length,bar:C.querySelectorAll('.g9Bar button').length,small:small.slice(0,5),cnt:C.querySelector('.g9Cnt').textContent,tabs:[...C.querySelectorAll('.g9Ty')].map(e=>e.textContent.trim())}});console.log('STREET',JSON.stringify(info));
 // equip a template street car by tapping its card
 await tap('#g9Col .g9Card[data-gc="t_rosso"] img');console.log('equip street →',await ev(()=>__g9c.eq('car')));await wait();await shot('02_equipped_rosso');
 // off-road tab, equip Blue Beast (mix with the street car)
 await tap('#g9Col [data-gty="off"]');await wait();await tap('#g9Col .g9Card[data-gc="t_beast"] img');console.log('equip off →',await ev(()=>__g9c.eq('off')),'street still',await ev(()=>__g9c.eq('car')),'load',await ev(()=>JSON.stringify(__gar.get().off)));await wait();await shot('03_offroad');
 await tap('#g9Col [data-gty="boat"]');await wait();await shot('04_water');
 // favourite + filter
 await tap('#g9Col [data-gty="car"]');await wait();await tap('#g9Col .g9Card[data-gc="t_papaya"] .g9Fav');await tap('#g9Col [data-gfi]');await tap('#g9Col [data-gfi]');
 console.log('FAVS filter →',JSON.stringify(await ev(()=>__g9c.list('car'))));await wait();await shot('05_favs');await tap('#g9Col [data-gfi]');
 await tap('#g9Col [data-gso]');console.log('sort A–Z →',JSON.stringify(await ev(()=>__g9c.list('car'))));await tap('#g9Col [data-gso]');console.log('sort NEW →',JSON.stringify(await ev(()=>__g9c.list('car').slice(0,4))));await tap('#g9Col [data-gso]');
 // ✎ BUILD opens the builder with that template
 await tap('#g9Col .g9Card[data-gc="t_bianco"] .g9Ed');await p.waitForTimeout(3000);console.log('builder',await ev(()=>!!__gb.GB_.bk),'sel',await ev(()=>__g9c.eq('car')),'parts',await ev(()=>__gb.list().length));await shot('06_build_bianco');
 console.log('ERR',errs.slice(0,6));await b.close()})();
