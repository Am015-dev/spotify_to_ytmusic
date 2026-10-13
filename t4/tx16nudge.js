// t4/tx16nudge.js <url> <out>: real-touch NUDGE check on the 40468 taxi. RIDES → taxi → BUILD → SELECT → tap the hood → ✥ NUDGE → ↑ ↑ → ⤒ → shots + list diff.
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const OUT=process.argv[3];require('fs').mkdirSync(OUT,{recursive:true});
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const ctx=await b.newContext({viewport:{width:852,height:393},isMobile:true,hasTouch:true});
 const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e)));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});const ev=(f,a)=>p.evaluate(f,a),W=ms=>p.waitForTimeout(ms);
 await p.goto(process.argv[2]);await p.waitForFunction(()=>window.__mho&&!document.querySelector('#topBtns').hidden,null,{timeout:240000});const cdp=await ctx.newCDPSession(p);
 const tapXY=async(x,y)=>{const tp=[{x,y,id:1,radiusX:4,radiusY:4,force:1}];await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:tp});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await W(700)};
 const tap=async s=>{const e=await p.$(s);if(!e||!await e.isVisible()){console.log('NO',s);return 0}await e.scrollIntoViewIfNeeded().catch(()=>{});await W(300);const bb=await e.boundingBox();await tapXY(bb.x+bb.width/2,bb.y+bb.height/2);return 1};
 const shot=async n=>{await W(1200);await p.screenshot({path:`${OUT}/${n}.png`});console.log('shot',n)};
 const offs=()=>ev(()=>__gb.list().map((b,i)=>[i,b.t,b.ox||0,b.oz||0,b.oy||0].join(',')));
 await tap('#gbMenuBtn');await W(1500);await tap('#r2R [data-r2m="rides"]');await W(1200);await tap('[data-gc="t_taxi"]');await W(2000);console.log('eq',await ev(()=>__g9c.eq('car')));
 await tap('#r2R [data-r2m="build"]');await W(2500);console.log('sel tool',await tap('[data-r2b="sel"]'));await W(800);
 console.log('layer on',await ev(()=>!!document.querySelector('[data-b25="lay"].on')));if(await ev(()=>!!document.querySelector('[data-b25="lay"].on'))){await tap('[data-b25="lay"]');console.log('layer now',await ev(()=>!!document.querySelector('[data-b25="lay"].on')))}
 const A=await offs();
 // tap the hood: screen point of the cell under the hood centre (x 0, z −4)
 const s0=await ev(()=>__gb.scr(0,-4));console.log('hood at',JSON.stringify(s0));await tapXY(s0.x,s0.y);await W(800);await shot('n1_selected');
 console.log('nudge btn',await tap('#slBar [data-txs]'));await shot('n2_pad');
 for(const a of['zf','zf','yu'])console.log(a,await tap(`#txPad [data-txa="${a}"]`));await shot('n3_nudged');
 const B=await offs();const d=B.filter((x,i)=>x!==A[i]);console.log('changed',JSON.stringify(d),'tip',await ev(()=>{const t=document.querySelector('#gsTip,.gsTip');return t&&t.textContent}));
 console.log('ERR',JSON.stringify(errs.filter(e=>!/GPU stall|GL Driver/.test(e)).slice(0,6)));await b.close()})();
