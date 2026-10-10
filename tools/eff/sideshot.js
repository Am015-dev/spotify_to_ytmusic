// PERF-3: low side views (852x393) of the player car and the nearest traffic car: pause, hide the pause menu, park the camera 0.5 m up beside the car.
// usage: CITY=fra node tools/eff/sideshot.js <url local_dbg.html> <out prefix>
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const [URL,PRE]=process.argv.slice(2);const CITY=process.env.CITY||'fra';
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const ctx=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:1,isMobile:true,hasTouch:true});const p=await ctx.newPage();p.setDefaultTimeout(900000);
const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,160)));
await p.goto(URL);await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:200});
await p.evaluate(c=>{localStorage.clear();localStorage.setItem('mho_slot','1');localStorage.setItem('mho_roam@1',JSON.stringify({tut:1,otg:{}}));if(c==='ath'){localStorage.setItem('mho_city@1','ath');localStorage.setItem('mho_athd@1','A');localStorage.setItem('mho_roam.ath@1','{"otg":{}}');localStorage.setItem('mho_story.ath@1','{"seen":1}')}},CITY);
await p.reload();await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:200});
await p.evaluate(()=>__mho.enterRoam());await p.waitForFunction(()=>__mho.state==='roam'&&!(__mho.LD&&__mho.LD.on),null,{polling:200});await p.waitForTimeout(4000);
const r=await p.evaluate(()=>window.__oc.ev(`(()=>{const P=[RO.x,RO.y,RO.z,RO.h];let tc=null,bd=1e9;for(const c of (HUB.cars||[])){const d=Math.hypot(c.x-RO.x,c.z-RO.z);if(d>6&&d<bd){bd=d;tc=c}}
 const cam=__dbg.camera,R=__dbg.renderer;const S=(x,y,z,h,tag)=>{const sx=Math.cos(h),sz=-Math.sin(h);cam.position.set(x+sx*6,y+.5,z+sz*6);cam.lookAt(x,y+.5,z);cam.updateMatrixWorld();__dbg.composer.render();return R.domElement.toDataURL('image/png')};
 const out={gap:+(RO.y-groundY(RO.x,RO.z)).toFixed(3),me:S(RO.x,RO.y,RO.z,RO.h)};if(tc)out.tr=S(tc.x,groundY(tc.x,tc.z),tc.z,tc.h||0);return out})()`));
const fs=require('fs');for(const k of ['me','tr'])if(r[k])fs.writeFileSync(`${PRE}_${CITY}_side_${k==='me'?'player':'traffic'}.png`,Buffer.from(r[k].split(',')[1],'base64'));
console.log(JSON.stringify({city:CITY,gap:r.gap,traffic:!!r.tr,errs}));await b.close()})().catch(e=>{console.error(e);process.exit(1)});
