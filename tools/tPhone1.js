// tPhone1: HUD shots of the BUILT page, driving + in a race, landscape 852x393 and portrait 393x852. node tools/tPhone1.js <url> <outdir>
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');const [BASE,OUT]=process.argv.slice(2);fs.mkdirSync(OUT,{recursive:true});
const BOT=(t=>t.slice(t.indexOf('function tkBot'),t.indexOf('function tkStaticFeel')))(fs.readFileSync(__dirname+'/../src/98tk_go.js','utf8'));
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 for(const por of[0,1]){const tag=por?'por':'land';const c=await b.newContext({viewport:por?{width:393,height:852}:{width:852,height:393},deviceScaleFactor:1,isMobile:true,hasTouch:true});const p=await c.newPage();p.setDefaultTimeout(600000);
  await p.goto(BASE+'?test=fra');await p.waitForFunction(()=>window.__tk&&window.__tq&&__tq.ready,null,{timeout:600000});await p.waitForTimeout(2000);
  const Q=s=>p.evaluate(s=>__tk.q(s),s);const shot=n=>p.screenshot({path:OUT+'/'+tag+'_'+n+'.jpg',type:'jpeg',quality:80});
  await Q(`(()=>{K.KeyW=K.ArrowUp=true;for(let i=0;i<150;i++)roamStep(1/30);try{scorePop&&0}catch(e){}return 1})()`);await p.waitForTimeout(800);await shot('drive');await Q(`(()=>{JU_pop('CHAIN 68 ×5','+340 STUDS','#ff2d95');hitPop('✔ CHECKPOINT 2/5');return 1})()`);await p.waitForTimeout(350);await shot('roam_popups');
  console.log(tag,JSON.stringify(await p.evaluate(()=>{const o=[];for(const e of document.querySelectorAll('body *')){const t=e.childNodes[0];if(!t||t.nodeType!==3||!t.textContent.trim()||!e.offsetParent)continue;const r=e.getBoundingClientRect();if(r.width&&(parseFloat(getComputedStyle(e).fontSize)<12||r.right>innerWidth+1))o.push(t.textContent.trim().slice(0,16)+'@'+getComputedStyle(e).fontSize+(r.right>innerWidth+1?' CUT':''))}return o})));
  await Q(BOT+';window.tkBotX=tkBot');
  await Q(`(()=>{const m=tkMarkOf(RIVAL_EV.find(e=>e.p===TK_C.p));if(RO.sp)try{sprintEnd()}catch(e){};tkStart(m,TK_C);const sp=RO.sp;sp.cd=0;window.__b=tkBotX(tkGeoOf(TK_C).pA,{lag:.15});for(let i=0;i<30*40;i++){__b(sp);roamStep(1/30)}return 1})()`);await p.waitForTimeout(1200);await shot('race');await Q(`(()=>{feed('CHAIN 68 ×5',340,'#ff2d95');feed('CRASH',50,'#ffd12c');hitPop('✔ CHECKPOINT 2/5');JU_pop('CHAIN 68 ×5','+340 STUDS','#ff2d95');return 1})()`);await p.waitForTimeout(300);await shot('popups');
  await c.close()}
 await b.close()})();
