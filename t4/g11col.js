// t4/g11col.js: 852x393 real touch on the garage COLLECTION (RIDES). Per tab (STREET/OFF-ROAD/WATER): visible bar buttons, smallest visible
// font in the garage panel, shot. Equip street + off-road by tapping cards, fav + filter, sort, ✎ BUILD opens the template in the builder,
// place one brick by real taps, DONE, then reload the page and check the edit persisted. IFRAME=1 runs the page inside an iframe.
// usage: [IFRAME=1] node t4/g11col.js <url> <outdir>
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const O=process.argv[3],U=process.argv[2];fs.mkdirSync(O,{recursive:true});const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const ctx=await b.newContext({viewport:{width:852,height:393},isMobile:true,hasTouch:true});const pg=await ctx.newPage();const errs=[];pg.on('pageerror',e=>errs.push(String(e)));pg.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
 let p=pg;if(process.env.IFRAME){await pg.setContent(`<html><body style="margin:0;background:#000"><iframe id="f" src="${U}" style="border:0;width:852px;height:393px" allow="fullscreen"></iframe></body></html>`);
  await pg.waitForTimeout(3000);p=pg.frames().find(f=>f.url().startsWith(U.split('?')[0]))}else await pg.goto(U);
 const boot=async()=>{await p.waitForFunction(()=>window.__mho&&!document.querySelector('#topBtns').hidden,null,{timeout:240000})};await boot();const cdp=await ctx.newCDPSession(pg);
 const tapXY=async(x,y)=>{const tp=[{x,y,id:1,radiusX:4,radiusY:4,force:1}];await Promise.all([cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:tp}),cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]})]);await pg.waitForTimeout(700)};
 const tap=async s=>{const e=await p.$(s);if(!e){console.log('NO',s);return 0}await e.scrollIntoViewIfNeeded();const bb=await e.boundingBox();if(!bb){console.log('NOBOX',s);return 0}await tapXY(bb.x+bb.width/2,bb.y+bb.height/2);return 1};
 const ev=(f,a)=>p.evaluate(f,a);const shot=async n=>{await pg.waitForTimeout(800);await pg.screenshot({path:`${O}/${n}.png`});console.log('shot',n)};
 const wait=async()=>{for(let i=0;i<60;i++){const n=await ev(()=>document.querySelectorAll('#g9Col img[data-k]:not([src])').length);if(!n)return;await pg.waitForTimeout(1000)}};
 const audit=()=>ev(()=>{const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0&&r.bottom>0&&r.top<innerHeight&&r.right>0&&r.left<innerWidth&&getComputedStyle(e).visibility!=='hidden'};
  const P=document.querySelector('#gbx');let min=99,minE='';for(const e of P.querySelectorAll('*')){if(!vis(e))continue;if(![...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim()))continue;const f=parseFloat(getComputedStyle(e).fontSize);if(f<min){min=f;minE=(e.className||e.tagName)+':'+e.textContent.trim().slice(0,20)}}
  const bar=[...document.querySelectorAll('#g9Col .g9Bar button')].filter(vis).length;return{bar,minFont:min,minE,cards:document.querySelectorAll('#g9Col .g9Card').length,cnt:document.querySelector('#g9Col .g9Cnt').textContent}});
 await tap('#gbMenuBtn');await pg.waitForTimeout(1500);await tap('#gbx .gbTabs [data-t="veh"]');await wait();
 for(const t of['car','off','boat']){await tap(`#g9Col [data-gty="${t}"]`);await wait();await ev(()=>document.querySelector('#g9Col .g9Bar').scrollIntoView({block:'start'}));console.log('TAB',t,JSON.stringify(await audit()));await shot('tab_'+t)}
 await tap('#g9Col [data-gty="car"]');await wait();
 await tap('#g9Col .g9Card[data-gc="t_rosso"] img');console.log('equip street →',await ev(()=>__g9c.eq('car')));
 await tap('#g9Col [data-gty="off"]');await wait();await tap('#g9Col .g9Card[data-gc="t_beast"] img');console.log('equip off →',await ev(()=>__g9c.eq('off')),'street still',await ev(()=>__g9c.eq('car')));
 await tap('#g9Col [data-gty="car"]');await wait();await tap('#g9Col .g9Card[data-gc="t_papaya"] .g9Fav');await tap('#g9Col [data-gfi]');await tap('#g9Col [data-gfi]');
 console.log('FAVS filter →',JSON.stringify(await ev(()=>__g9c.list('car'))));await shot('favs');await tap('#g9Col [data-gfi]');
 await tap('#g9Col [data-gso]');console.log('sort A–Z →',JSON.stringify(await ev(()=>__g9c.list('car').slice(0,4))));await tap('#g9Col [data-gso]');console.log('sort NEW →',JSON.stringify(await ev(()=>__g9c.list('car').slice(0,4))));await tap('#g9Col [data-gso]');
 // ✎ BUILD → builder with the template, place one 2x2 brick by real taps (hold + place), DONE
 await tap('#g9Col .g9Card[data-gc="t_bianco"] .g9Ed');await pg.waitForTimeout(3000);const n0=await ev(()=>__gb.list().length);console.log('builder',await ev(()=>!!__gb.GB_.bk),'sel',await ev(()=>__g9c.eq('car')),'parts',n0);await shot('builder_bianco');
 if(await ev(()=>__gb.GB_.mir))await tap('#gbBkT [data-a="mir"]');await tap('#gbBkCt [data-ct="Bricks"]');await tap('#gbBkPc [data-p="b22"]');await tap('#gbBkCl .gbCl[data-c="2"]');
 let placed=0;for(const[i,j]of[[-1,-1],[0,0],[-1,1],[0,-2]]){const s=await ev(([i,j])=>__gb.scr(i,j),[i,j]);if(!s||s.y<30||s.y>390)continue;await tapXY(s.x,s.y);if(!await ev(()=>__gs.held()))continue;await tapXY(s.x,s.y);if(await ev(()=>__gb.list().length)>n0){placed=1;break}}
 const n1=await ev(()=>__gb.list().length);console.log('placed',placed,'parts',n0,'→',n1);await shot('builder_placed');await tap('#gbBkT [data-a="done"]');await pg.waitForTimeout(2000);await tap('#gbSave');await pg.waitForTimeout(3000);
 const st=()=>ev(()=>{try{return{sel:__g9c.eq('car'),live:(__gb.d()&&__gb.d().bricks||[]).length,card:__g9c.bricks('t_bianco').length,saved:__g9ev("(store.get('mho_build',{}).bricks||[]).length")}}catch(e){return String(e)}});console.log('saved',JSON.stringify(await st()));
 if(!process.env.IFRAME){await pg.reload();await boot();console.log('after reload',JSON.stringify(await st()),'eq',await ev(()=>__g9c.eq('car')),'bricks',await ev(()=>__g9c.bricks('t_bianco').length))}
 console.log('ERR',JSON.stringify(errs.slice(0,6)));await b.close()})();
