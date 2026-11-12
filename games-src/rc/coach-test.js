// Coached first game (flag ?coach=1): plays it with free legal moves through the UI (tap a pawn, tap a glowing place, then the plan helper, Start day, Continue)
// and asserts the coach explained the rules in time, one bubble at a time, never blocking the board, and a "Things you'll meet later" card at the end.
//   PLAYWRIGHT_BROWSERS_PATH=... NODE_PATH=../node_modules node coach-test.js [WxH]
const PW=require('playwright');const fs=require('fs'),path=require('path');
const MODE=process.argv[3]||'play';const [W,H]=(process.argv[2]||'390x763').split('x').map(Number);
const html=fs.readFileSync(path.join(__dirname,'shipwreck.html'));const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const br=await PW.chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const ctx=await br.newContext({viewport:{width:W,height:H},isMobile:W<600,hasTouch:true});
 await ctx.route('**/*',r=>{const u=new URL(r.request().url());u.host==='swi.test'?r.fulfill({status:200,contentType:'text/html',body:html}):r.abort()});
 const p=await ctx.newPage();const errs=[],probs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('https://swi.test/?coach=1');await sleep(900);await p.evaluate(()=>{try{localStorage.clear()}catch(e){}});await p.reload();await sleep(1500);
 const centre=sel=>p.evaluate(sel=>{for(const e of document.querySelectorAll(sel)){if(e.disabled)continue;const r=e.getBoundingClientRect();if(r.width<8||r.height<8)continue;const x=r.left+r.width/2,y=r.top+r.height/2;if(x<0||y<0||x>innerWidth||y>innerHeight)continue;const t=document.elementFromPoint(x,y);if(t&&(t===e||e.contains(t)))return [x,y]}return null},sel);
 const tap=async sel=>{const c=await centre(sel);if(!c)return false;await p.touchscreen.tap(c[0],c[1]);return true};
 await tap('#modal [data-a=start]');await sleep(500);await tap('.tutoffer [data-tutoffer=learn]');await sleep(1500);
 if(!await p.evaluate(()=>!!G&&!!G.coach))probs.push('coached game did not start');
 if(await p.evaluate(()=>!!document.querySelector('.gxt-bub,.gxt-cell,.gxt-top')))probs.push('forced tutorial overlay present');
 if(MODE==='leave'){await sleep(3500);await p.reload();await sleep(1500);
  const o=await p.evaluate(()=>({open:JSON.parse(localStorage.getItem('gxt-shipwreck-isle')||'{}'),g:!!G,btn:(document.querySelector('#modal [data-gxt-open]')||{}).textContent}));
  if(!o.open.open)probs.push('tutorial not remembered as open after leaving');if(o.g)probs.push('a game was running after reload');if(!/Resume|Continue|Tutorial|Learn/i.test(o.btn||''))probs.push('no tutorial resume entry on the title: '+o.btn);
  if(!await tap('#modal [data-gxt-open]')){await tap('#modal details.morep summary');await sleep(400);await tap('#modal [data-gxt-open]')}await sleep(600);if(!await tap('[data-gxt-dlg=restart]'))probs.push('no restart/exit dialog for a half-done tutorial');await sleep(1500);
  if(!await p.evaluate(()=>!!G&&!!G.coach))probs.push('resume did not restart the coached game');
  if(!await tap('#coachskip'))probs.push('no Skip tutorial button');await sleep(1000);
  const e=await p.evaluate(()=>({g:!!G&&!!G.coach,sk:!!JSON.parse(localStorage.getItem('gxt-shipwreck-isle')||'{}').skipped,start:UI.modal==='start'}));
  if(e.g)probs.push('skip left the coached game running');if(!e.sk)probs.push('skip not remembered');if(!e.start)probs.push('skip did not return to the title');
  console.log(`coach leave ${W}x${H}: ${probs.length?'FAIL '+probs.join('; '):'PASS'}`);await br.close();process.exit(probs.length?1:0)}
 let first=true,maxBub=0,t0=Date.now();
 while(Date.now()-t0<420000){
   const st=await p.evaluate(()=>({over:!!G.over,st:PHO.st,later:!!document.querySelector('#coachb[data-rule=later]:not([hidden])'),bub:document.querySelectorAll('#coachb:not([hidden])').length,pe:getComputedStyle(document.querySelector('#coachb')||document.body).pointerEvents}));
   maxBub=Math.max(maxBub,st.bub);if(st.later)break;
   if((st.st==='plan'||st.st==='plan2')&&first){first=false;await tap('#bf .bfpw');await sleep(300);await p.touchscreen.tap(...(await p.evaluate(()=>{const e=document.querySelector('#bfglow>*');if(!e)return [5,5];const r=e.getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2]})));await sleep(400)}
   if(st.bub&&!st.later){await sleep(900);await tap('#coachb [data-coach=x]')}   // read it, then dismiss
   if(st.st==='plan'||st.st==='plan2')await sleep(1300);   // a human takes a moment to plan: the coach speaks meanwhile
   let did=false;
   for(const sel of ['.gxh-bub .gxh-ok','#modal button:not([data-a=new]):not([data-a=rules]):not([data-a=cards]):not([data-a=close])','.bf-opts .opt','#bf [data-a=go][data-force]','#bf [data-a=next]','#bf [data-a=suggest]','#bf [data-a=go]']){
     if(sel==='#bf [data-a=suggest]'){const need=await p.evaluate(()=>{try{return (PHO.st==='plan'||PHO.st==='plan2')&&planProblems().length>0}catch(e){return false}});if(!need)continue}
     if(await tap(sel)){did=true;break}}
   if(!did){const g=await p.evaluate(()=>{const e=document.querySelector('#bfglow>*');if(!e)return null;const r=e.getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2]});if(g)await p.touchscreen.tap(g[0],g[1])}
   await sleep(did?700:400)}
 const r=await p.evaluate(()=>({done:COACHX.done(),all:COACHX.rules,over:!!(G&&G.over)}));
 const must=['goal','pawns','prod','night','skill','fog','ready'];for(const m of must)if(!r.done.includes(m))probs.push('rule not explained: '+m);
 if(r.done.length<10)probs.push('only '+r.done.length+' rules explained: '+r.done.join());
 const walk=await p.evaluate(()=>document.querySelectorAll('#coachb .walk li').length);if(walk<3)probs.push('final scoring walk has '+walk+' lines');const kinds=await p.evaluate(()=>Object.keys(COACHX.state.done));if(!['noshelter','nofood','sure','ready'].some(k=>kinds.includes(k)))probs.push('no move feedback line shown');if(!['event','weather','threat'].some(k=>kinds.includes(k)))probs.push('no rival comment shown');
 if(maxBub>1)probs.push('more than one bubble at once');
 if(!await p.evaluate(()=>GXCOACH.done))probs.push('GXCOACH.done never became true');
 if(errs.length)probs.push('errors '+errs.slice(0,2).join('|'));
 console.log(`coach ${W}x${H}: ${probs.length?'FAIL '+probs.join('; '):'PASS'} explained ${r.done.length}/${r.all.length}: ${r.done.join(',')}`);
 await br.close();process.exit(probs.length?1:0)})();
