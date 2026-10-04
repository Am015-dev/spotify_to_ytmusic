// OC test helpers: boot a city/district straight into free roam with drawing skipped (fast.js)
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const F=require('./fast.js');
async function ocBoot(b,city,d,vp){const p=await (await b.newContext({viewport:vp||{width:960,height:540}})).newPage();p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));p.setDefaultTimeout(900000);
 await p.goto('http://127.0.0.1:8766/local_dbg.html');await p.waitForFunction(()=>window.__mho&&__mho.state==='menu');
 await p.evaluate(([c,d])=>{localStorage.clear();localStorage.setItem('mho_slot','1');localStorage.setItem('mho_city@1',c);if(d)localStorage.setItem('mho_athd@1',d);const k=c==='ath'?'.ath':'';localStorage.setItem('mho_roam'+k+'@1','{"tut":1,"otg":{}}');if(c==='ath')localStorage.setItem('mho_story.ath@1','{"seen":1}')},[city,d]);
 await p.reload();await p.waitForFunction(()=>window.__mho&&__mho.state==='menu');await p.evaluate(()=>__mho.enterRoam());await p.waitForFunction(()=>__mho.state==='roam',null,{polling:500});await F.on(p);
 await p.evaluate(()=>{try{__mho.storyClose()}catch(e){}try{window.__m1&&__m1.skip&&__m1.skip()}catch(e){}__mho.roamSim(30)});return p}
const launch=()=>chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
module.exports={ocBoot,launch,F};
