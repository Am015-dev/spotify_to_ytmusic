// Learn to play (guided game, guide.js) by touch: taps ONLY the highlighted spot (the #tutring centre) while a step shows; between steps it plays
// like a new player (Continue, the first option of a question). Checks every rule step appears in order, each line <= 12 words, a wrong tap is ignored,
// the end card offers a real game, and Keep playing continues as a normal game. Optional shots: SHOTS=dir (tut-N.png per step, 390 wide).
//   node guide-test.js [WxH=390x844]      Exit 1 on failure.
const PW=require('playwright');const fs=require('fs'),path=require('path');
const [W,H]=(process.argv[2]||'390x844').split('x').map(Number);const SHOTS=process.env.SHOTS||'';
const HTML=path.join(__dirname,'shipwreck.html');const LIVE=path.join(__dirname,'../../games/shipwreck-isle');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const br=await PW.chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const ctx=await br.newContext({viewport:{width:W,height:H},isMobile:true,hasTouch:true,deviceScaleFactor:SHOTS?2:1});
 await ctx.route('**/*',r=>{const u=new URL(r.request().url());if(u.host!=='swi.test')return r.abort();const p=decodeURIComponent(u.pathname);
  if(p==='/')return r.fulfill({status:200,contentType:'text/html',body:fs.readFileSync(HTML)});const f=path.join(LIVE,p);
  if(fs.existsSync(f)&&fs.statSync(f).isFile())return r.fulfill({status:200,path:f});return r.fulfill({status:404,body:''})});
 const p=await ctx.newPage();const errs=[],probs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('https://swi.test/');await sleep(900);await p.evaluate(()=>{try{localStorage.clear()}catch(e){}});await p.reload();await sleep(1500);
 const centre=sel=>p.evaluate(sel=>{for(const e of document.querySelectorAll(sel)){if(e.disabled)continue;const r=e.getBoundingClientRect();if(r.width<6||r.height<6)continue;const x=r.left+r.width/2,y=r.top+r.height/2;if(x<0||y<0||x>innerWidth||y>innerHeight)continue;const t=document.elementFromPoint(x,y);if(t&&(t===e||e.contains(t)))return [x,y]}return null},sel);
 const tap=async sel=>{const c=await centre(sel);if(!c)return false;await p.touchscreen.tap(c[0],c[1]);return true};
 await tap('#modal [data-a=start]');await sleep(600);await tap('.tutoffer [data-tutoffer=learn]');await sleep(1500);
 if(!await p.evaluate(()=>GXGUIDE.running))probs.push('guided game did not start');
 const order=[],says={};let wrongDone=false,shotN=0,stall=0,last='';const t0=Date.now();
 while(Date.now()-t0<300000){
  const s=await p.evaluate(()=>{const b=document.querySelector('#coachb.guide:not([hidden])');const r=document.querySelector('#tutring:not([hidden])');const rr=r&&r.getBoundingClientRect();
    return {fin:!!document.querySelector('#coachb.guide[data-kind=final]:not([hidden])'),step:b&&b.dataset.step,rule:b&&b.dataset.rule,say:b&&(b.querySelector('.ct')||{}).textContent,ring:rr&&[rr.left+rr.width/2,rr.top+rr.height/2],st:PHO.st,over:!!(G&&G.over)}});
  if(s.fin)break;if(s.over){probs.push('game over during the tutorial');break}
  if(s.step&&s.ring){
   if(!order.includes(s.step)){order.push(s.step);says[s.step]=[s.rule,s.say];await sleep(350);if(SHOTS){shotN++;await p.screenshot({path:path.join(SHOTS,'tut-'+shotN+'.png')})}}
   if(!wrongDone&&s.step==='explore'){wrongDone=true;const n0=await p.evaluate(()=>G.plan.acts.reduce((a,x)=>a+x.pw.length,0));await p.touchscreen.tap(30,H-40);await sleep(400);await p.touchscreen.tap(W/2,140);await sleep(400);
     const n1=await p.evaluate(()=>({tut:!!G.tut,modal:UI.modal,n:G.plan.acts.reduce((a,x)=>a+x.pw.length,0),step:GXGUIDE.step,pop:!!(PHO.pop&&PHO.pop.k!=='tile')}));if(n1.n!==n0||n1.step!=='explore')probs.push('a wrong tap changed the game: '+JSON.stringify(n1))}
   await p.touchscreen.tap(s.ring[0],s.ring[1]);await sleep(500)}
  else{let did=false;for(const sel of ['.bf-opts .opt','#bf [data-a=next]','#modal button:not([data-a=new]):not([data-a=rules]):not([data-a=cards]):not([data-a=close])']){if(await tap(sel)){did=true;break}}await sleep(did?500:300)}
  const sig=s.step+'|'+s.st+'|'+await p.evaluate(()=>UI.shown);if(sig===last){if(++stall>60){probs.push('stuck at '+sig);await p.screenshot({path:(process.env.TMPDIR||'/tmp')+'/guide-stuck.png'});console.log(await p.evaluate(()=>JSON.stringify({step:GXGUIDE.step,pop:PHO.pop,acts:G.plan.acts.map(a=>[a.type,a.pw.length]),chips:document.querySelector('#bfchips').innerHTML.slice(0,300)})));break}}else stall=0;last=sig}
 const r=await p.evaluate(()=>({rules:GXGUIDE.rules,seen:GXGUIDE.seen,steps:GXGUIDE.steps}));
 const shownRules=[...new Set(order.map(o=>says[o][0]))];
 for(const ru of r.rules)if(!shownRules.includes(ru))probs.push('rule step never shown: '+ru);
 const must=['goal','death','phases','event','morale','production','pawns','explore','dice','sure','build','shelter','invention','action','weather','night','wounds','adventure','threat','gather','camp','rest','hunt','roof','real'];
 for(const m of must)if(!r.rules.includes(m))probs.push('rule missing from the step list: '+m);
 for(const st of r.steps){const n=st.say.replace(/[^A-Za-z0-9'’?✊]+/g,' ').trim().split(' ').filter(Boolean).length;if(n>12)probs.push(st.id+' has '+n+' words')}
 // order: the first appearance of each phase rule follows the game's phase order
 const idx=k=>shownRules.indexOf(k);const seq=['goal','event','morale','production','action','weather','night'];for(let i=1;i<seq.length;i++)if(idx(seq[i])<idx(seq[i-1]))probs.push('order: '+seq[i]+' before '+seq[i-1]);
 const fin=await p.evaluate(()=>!!document.querySelector('#coachb[data-kind=final] [data-guide=keep]')&&!!document.querySelector('#coachb [data-guide=new]'));if(!fin)probs.push('no end card with Keep playing / New game');
 if(SHOTS&&fin){shotN++;await p.screenshot({path:path.join(SHOTS,'tut-'+shotN+'.png')})}
 if(fin){await tap('#coachb [data-guide=keep]');await sleep(800);const k=await p.evaluate(()=>({g:!!G,tut:!!(G&&G.tut),run:GXGUIDE.running,ring:!!document.querySelector('#tutring:not([hidden])')}));if(!k.g||k.tut||k.run||k.ring)probs.push('Keep playing did not continue as a normal game '+JSON.stringify(k))}
 if(errs.length)probs.push('errors: '+errs.slice(0,3).join(' | '));
 console.log(`guide ${W}x${H}: ${probs.length?'FAIL '+probs.join('; '):'PASS'} steps ${order.length}/${r.steps.length} rules ${shownRules.length}/${r.rules.length}`);
 if(process.env.V)console.log(order.map(o=>o+': '+says[o][1]).join('\n'));
 await br.close();process.exit(probs.length?1:0)})();
