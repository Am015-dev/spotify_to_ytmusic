// tools/ld/tDrive.js <url> <out> <ls.json> [fra|ath] : a garage save (tools/ld/ls_*.json, from tRides DUMPLS=1) driven at 852×393 (phone, real touch GAS).
// Shots only (roam entered directly like tWorld.js; not the gate): d_start, d_drive (9 s GAS), d_side_low (player), d_traffic_low; prints tyre gap, kmh, console errors.
// env BOAT=1: warp onto the nearest water first (boat form), shots b_*.
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const [URL,OUT,LSF,CITY]=process.argv.slice(2);fs.mkdirSync(OUT,{recursive:true});const LS=JSON.parse(fs.readFileSync(LSF));
 const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const ctx=await b.newContext({viewport:{width:852,height:393},isMobile:true,hasTouch:true}),p=await ctx.newPage();p.setDefaultTimeout(600000);
 const errs=[];p.on('pageerror',e=>errs.push(String(e)));p.on('console',m=>{if(m.type()==='error')errs.push(m.text().slice(0,200))});const W=ms=>p.waitForTimeout(ms),ev=(f,a)=>p.evaluate(f,a);
 await p.goto(URL);await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{timeout:300000});
 await ev(([ls,c])=>{localStorage.clear();localStorage.setItem('mho_slot','1');for(const k in ls)if(/^mho_(gar|build)@/.test(k))localStorage.setItem(k,ls[k]);localStorage.setItem('mho_roam@1',JSON.stringify({tut:1,otg:{}}));
  if(c==='ath'){localStorage.setItem('mho_city@1',c);localStorage.setItem('mho_athd@1','A');localStorage.setItem('mho_roam.ath@1','{"tut":1,"otg":{}}');localStorage.setItem('mho_story.ath@1','{"seen":1}')}},[LS,CITY||'fra']);
 await p.reload({timeout:600000});await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{timeout:300000});
 await ev(()=>{try{__m1.skip()}catch(e){}__mho.enterRoam()});await p.waitForFunction(()=>__mho.state==='roam'&&!(__mho.LD&&__mho.LD.on),null,{timeout:300000});
 await ev(()=>{__mho.storyClose&&__mho.storyClose();__mho.roamSim(20);try{__ju.autoClose(true)}catch(e){}});await W(3000);
 const cdp=await ctx.newCDPSession(p),shot=async n=>{await W(2500);await p.screenshot({path:`${OUT}/${n}.png`});console.log('shot',n)};
 await shot('d_start');
 const g=await (await p.$('#tG')).boundingBox();await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:g.x+g.width/2,y:g.y+g.height/2,id:2}]});await W(9000);
 console.log('kmh',await ev(()=>Math.round((__mho.RO.v||0)*3.6)));await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await shot('d_drive');await W(4000);
 console.log('gap',JSON.stringify(await ev(()=>{try{return __gnb.gap()}catch(e){return String(e)}})));
 await ev(()=>{const M=__mho,R=M.RO,gg=M.gnd(R.x,R.z,R.y+.3),sx=Math.cos(R.h),sz=-Math.sin(R.h);__gnb.cam([R.x+sx*5,gg+.7,R.z+sz*5,R.x,gg+.6,R.z])});await shot('d_side_low');
 const tc=await ev(()=>{try{const M=__mho,R=M.RO;let best=null,bd=1e9;M.scene.traverse(o=>{if(o.userData&&o.userData.trf&&o.visible){const d=Math.hypot(o.position.x-R.x,o.position.z-R.z);if(d<bd){bd=d;best=o}}});if(!best)return null;const q=best.position,gg=M.gnd(q.x,q.z,q.y+.3);__gnb.cam([q.x+4,gg+.7,q.z+4,q.x,gg+.6,q.z]);return Math.round(bd)}catch(e){return String(e)}});
 console.log('traffic car at',tc);if(tc!=null)await shot('d_traffic_low');await ev(()=>__gnb.cam(null));
 console.log('ERR',errs.length,JSON.stringify(errs.slice(0,6)));await b.close()})();
