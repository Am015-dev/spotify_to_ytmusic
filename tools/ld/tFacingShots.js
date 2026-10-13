// tools/ld/tFacingShots.js <url> <outdir> <id,id,..> [view yaw|34] : garage-stage shots of many rides in one page load (phone 852x393, real touch for the menu).
// View "34" = the default g_34 (3/4 front: the ride's front points RIGHT, camera on its right side). DIST env = camera distance (default 10).
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const OUT=process.argv[3];require('fs').mkdirSync(OUT,{recursive:true});
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const ctx=await b.newContext({viewport:{width:852,height:393},isMobile:true,hasTouch:true});
 const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e)));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});const ev=(f,a)=>p.evaluate(f,a),W=ms=>p.waitForTimeout(ms);
 await p.goto(process.argv[2],{timeout:0});await p.waitForFunction(()=>window.__mho&&!document.querySelector('#topBtns').hidden,null,{timeout:240000});const cdp=await ctx.newCDPSession(p);
 const tapXY=async(x,y)=>{const tp=[{x,y,id:1,radiusX:4,radiusY:4,force:1}];await Promise.all([cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:tp}),cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]})]);await W(700)};
 const tap=async s=>{const e=await p.$(s);if(!e)return console.log('NO',s);await e.scrollIntoViewIfNeeded().catch(()=>{});const bb=await e.boundingBox();if(!bb)return console.log('HID',s);await tapXY(bb.x+bb.width/2,bb.y+bb.height/2)};
 const drag=async(dx)=>{const x=430,y=200,n=6;await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y,id:3}]});for(let i=1;i<=n;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+dx*i/n,y,id:3}]});await W(30)}await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await W(300)};
 await tap('#gbMenuBtn');await W(1500);await tap('#r2R [data-r2m="rides"]');await W(1200);
 const view=process.argv[5]&&process.argv[5]!=='34'?+process.argv[5]:null;
 for(const id of process.argv[4].split(',')){
  await ev(async id=>{await __ld.need(__ld.probe(()=>__g9c.bricks(id,'car')));},id);if(!await p.$('[data-gc="'+id+'"]')){await tap('#r2R [data-r2m="rides"]');await W(1200)}await tap('[data-gc="'+id+'"]');await W(2500);
  if(view!=null)await ev(y=>{__gb.GB_.yaw=y},view);else await ev(()=>{__gb.GB_.yaw=2.45});await ev(d=>{__gb.GB_.dist=d},+(process.env.DIST||10));await drag(1);
  await ev(()=>{try{__gb.render()}catch(e){}});await W(+(process.env.SW||1200));
  await p.screenshot({path:`${OUT}/${id}.png`,clip:{x:200,y:52,width:560,height:150}});console.log('shot',id,await ev(()=>__g9c.eq('car')))}
 console.log('ERR',JSON.stringify(errs.slice(0,6)));await b.close()})();
