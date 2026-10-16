// tRev74Shots (rev-74): real race shots on the built page. node tools/tRev74Shots.js <base url> <outdir> <which: jump|akro|river|sign|life|portrait>
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const [BASE,OUT,which]=process.argv.slice(2);
const fs=require('fs');const BOTSRC=(t=>t.slice(t.indexOf('function tkBot'),t.indexOf('function tkStaticFeel')))(fs.readFileSync(__dirname+'/../src/98tk_go.js','utf8'));
const L=['--use-angle=swiftshader','--enable-unsafe-swiftshader'];
(async()=>{const por=which==='portrait',city=which==='akro'||which==='life-ath'?'ath':'fra';
 const b=await chromium.launch({args:L});const c=await b.newContext({viewport:por?{width:393,height:852}:{width:852,height:393},deviceScaleFactor:1,isMobile:true,hasTouch:true});const p=await c.newPage();p.setDefaultTimeout(600000);p.on('pageerror',e=>console.log('PAGEERR',String(e).slice(0,160)));
 await p.goto(BASE+'?test='+city);await p.waitForFunction(()=>window.__chk&&window.__tq&&__tq.ready,null,{timeout:400000});await p.waitForTimeout(3000);
 const Q=s=>p.evaluate(s=>__tk.q(s),s);
 const shot=n=>p.screenshot({path:OUT+'/'+n+'.png'});
 // drive: start a course, a human-like bot (150 ms lag) feeds the keys every frame
 const drive=async(startJs,routeJs)=>{await Q(BOTSRC+`;window.tkBotX=tkBot`);await Q(`(()=>{const C=${startJs};tkStart(C.m,C.C);const sp=RO.sp;sp.cd=0;const G=tkGeoOf(C.C);window.__bot=tkBotX(${routeJs},{lag:.15});(function f(){if(RO.sp===sp&&!sp.done){__bot(sp);requestAnimationFrame(f)}else{K.ArrowUp=K.KeyW=K.ArrowLeft=K.ArrowRight=false}})();return 1})()`)};
 if(which==='jump'||which==='portrait'){
  await drive(`{C:TK_C,m:tkMarkOf(RIVAL_EV.find(e=>e.p===TK_C.p))}`,`G.pA`);
  let n=0,t0=Date.now();while(n<(por?1:2)&&Date.now()-t0<900000){const a=await Q(`(()=>{const gy=groundAt(RO.x,RO.z,99);return[RO.y-gy,RO.v,RO.sp&&RO.sp.t]})()`);
   if(por){if(a[2]>6){await shot('portrait_race');n++}}
   else if(a[0]>1.5&&a[1]>10){await shot('jump_westend_'+n);console.log('air',JSON.stringify(a));n++;await p.waitForTimeout(8000)}
   await p.waitForTimeout(120)}
 }
 if(which==='sign'){await Q(`(()=>{const C=TK_C;tkStart(tkMarkOf(RIVAL_EV.find(e=>e.p===TK_C.p)),C);RO.sp.cd=0})()`);for(const f of[.8,.9]){await Q(`__tk.view(${f})`);await p.waitForTimeout(2500);await shot('signboard_'+f)}}
 if(which==='akro'){const r=await Q(`(()=>{const m=tkMarkOf(ATH_BOSS_EV);const C=tkCourseOf(m);if(!C)return'nocourse';tkStart(m,C);RO.sp.cd=0;return C.name})()`);console.log('akro',r);await p.waitForTimeout(3000);await shot('akropolis_start')}
 if(which==='river'){await drive(`{C:tkBuild({key:'rival:water-shot',kind:'quick',name:'Main River Run',ai:['WEBER'],water:true}),m:{kind:'quick',ev:null}}`,`G.pB`);
  let t0=Date.now(),n=0;while(Date.now()-t0<900000){const v=await Q(`RO.veh||''`);if(v==='boat'){await p.waitForTimeout(4000);await shot('river_boat_'+n++);if(n>=2)break}await p.waitForTimeout(300)}}
 if(which==='life'||which==='life-ath'){const sp=await Q(`(()=>{const o=__c3&&__c3.pick&&__c3.pick();return JSON.stringify(o)||'nopick'})()`);console.log('c3pick',String(sp).slice(0,300));await p.waitForTimeout(3000);await shot(which)}
 await b.close()})();
