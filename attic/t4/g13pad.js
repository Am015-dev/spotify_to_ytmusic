// t4/g13pad.js <url> <out>: quick re-shot of 07_rotation_pad (canvas, search tile 1x2, hold, ⟲ AXES pad) + MY PARTS empty pill
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const OUT=process.argv[3];require('fs').mkdirSync(OUT,{recursive:true});
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const ctx=await b.newContext({viewport:{width:852,height:393},isMobile:true,hasTouch:true});
 const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e)));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});const ev=(f,a)=>p.evaluate(f,a),W=ms=>p.waitForTimeout(ms);
 await p.goto(process.argv[2]);await p.waitForFunction(()=>window.__mho&&!document.querySelector('#topBtns').hidden,null,{timeout:240000});const cdp=await ctx.newCDPSession(p);
 const tapXY=async(x,y)=>{const tp=[{x,y,id:1,radiusX:4,radiusY:4,force:1}];await Promise.all([cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:tp}),cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]})]);await W(700)};
 const tap=async s=>{const e=await p.$(s);if(!e)return console.log('NO',s);await e.scrollIntoViewIfNeeded().catch(()=>{});const bb=await e.boundingBox();if(!bb)return console.log('HID',s);await tapXY(bb.x+bb.width/2,bb.y+bb.height/2)};
 const shot=async n=>{await W(1200);await p.screenshot({path:`${OUT}/${n}.png`});console.log('shot',n)};
 await tap('#gbMenuBtn');await W(1500);await tap('#r2R [data-r2m="build"]');await W(2500);
 await tap('#g13Ch .g13Ca');await tap('#g13Pop [data-g13c="My parts"]');await W(600);await shot('pad_myparts_empty');
 const pill=()=>ev(()=>{const e=document.querySelector('#gbBkPc .paEm');if(!e)return 'none';const r=e.getBoundingClientRect();return getComputedStyle(e).display+' '+Math.round(r.width)+'x'+Math.round(r.height)});console.log('pill in empty MY PARTS',await pill());console.log('pill in empty MY PARTS',await pill());
 await tap('#gbBkPc .paC[data-pa="cv"]');await W(1500);
 await tap('#g13Qi');await ev(q=>{const I=document.querySelector('#g13Qi');I.value=q;I.dispatchEvent(new Event('input'))},'tile 1x2');await W(500);await tap('#gbBkPc .gbPc[data-p="tile"]');await W(300);
 const s0=await ev(()=>__gb.scr(-4,-4));await tapXY(s0.x,s0.y);console.log('held',JSON.stringify(await ev(()=>__gs.held())));await tap('#gsBar [data-g13p]');
 console.log('pill during search',await pill());await shot('07_rotation_pad');console.log('ERR',JSON.stringify(errs.slice(0,4)));await b.close()})();
