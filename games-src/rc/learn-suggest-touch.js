// Learn to play by touch, following ✨ Suggest every day (390x844 phone): taps Learn, then each day ✨ Suggest and Start, and every
// Continue / choice on the way, until the game ends. Passes when the castaways are rescued with no Skip. W481.
//   NODE_PATH=/opt/node-tools/node_modules node learn-suggest-touch.js [WxH]
const PW=require('playwright');const fs=require('fs'),path=require('path');const [W,H]=(process.argv[2]||'390x844').split('x').map(Number);
const html=fs.readFileSync(path.join(__dirname,'shipwreck.html'));const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const br=await PW.chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const ctx=await br.newContext({viewport:{width:W,height:H},isMobile:W<600,hasTouch:true});
 await ctx.route('**/*',r=>{const u=new URL(r.request().url());u.host==='swi.test'?r.fulfill({status:200,contentType:'text/html',body:html}):r.abort()});
 const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('https://swi.test/');await sleep(900);await p.evaluate(()=>{try{localStorage.clear()}catch(e){}});await p.reload();await sleep(1500);
 const centre=sel=>p.evaluate(sel=>{for(const e of document.querySelectorAll(sel)){if(e.disabled)continue;const r=e.getBoundingClientRect();if(r.width<8||r.height<8)continue;const x=r.left+r.width/2,y=r.top+r.height/2;if(x<0||y<0||x>innerWidth||y>innerHeight)continue;const t=document.elementFromPoint(x,y);if(t&&(t===e||e.contains(t)))return [x,y]}return null},sel);
 const tap=async sel=>{const c=await centre(sel);if(!c)return false;await p.touchscreen.tap(c[0],c[1]);return true};
 await tap('#modal [data-a=start]');await sleep(500);await tap('.tutoffer [data-tutoffer=learn]');await sleep(1500);
 await p.evaluate(()=>{try{ANIM=0.05;UI.speed=20}catch(e){}});
 let sug=-1,t0=Date.now(),skips=0,sugTaps=0;
 while(Date.now()-t0<(+process.env.MAXMS||1000000)){
   const st=await p.evaluate(()=>({over:G&&G.over,st:PHO.st,round:G&&G.round,bub:!!document.querySelector('#coachb:not([hidden])')}));
   if(st.over&&!(await centre('#modal button')))break;
   if(await tap('#coachb [data-coach=keep]')){await sleep(400);continue}
   if(st.bub)await tap('#coachb [data-coach=x]');
   if((st.st==='plan'||st.st==='plan2')&&sug!==st.round){if(await tap('#bf [data-a=suggest]')){sug=st.round;sugTaps++;await sleep(500);continue}}
   let did=false;
   for(const sel of ['.gxh-bub .gxh-ok','#modal button:not([data-a=new]):not([data-a=rules]):not([data-a=cards]):not([data-a=close])','.bf-opts .opt','#bf [data-a=go][data-force]','#bf [data-a=next]','#bf [data-a=go]'])if(await tap(sel)){did=true;break}
   if(st.over&&!did)break;await sleep(did?250:200)}
 const r=await p.evaluate(()=>({over:G&&G.over,round:G&&G.round,pile:G&&G.sc.pile,fire:G&&!!G.inv.built.fire,learn:G&&!!G.learn}));
 const ok=!!(r.over&&r.over.win)&&!errs.length;
 console.log(`learn+suggest by touch ${W}x${H}: ${ok?'PASS':'FAIL'} ${JSON.stringify(r)} suggest taps ${sugTaps} errors ${errs.length?errs.slice(0,2).join(' | '):0}`);
 await br.close();process.exit(ok?0:1)})();
