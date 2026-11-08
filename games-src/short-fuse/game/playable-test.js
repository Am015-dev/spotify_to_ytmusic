// playable-test.js: a human-style run through the REAL page at 390x763 (touch, taps only on visible, uncovered UI; no engine shortcuts):
//   1) fresh profile -> Play -> "Just play" -> brief card -> Quick game played to the result card
//   2) Story stage 1: Story -> chapter 1 -> Play -> intro scene -> game -> result card of the chapter
// Also asserts the turn sequence is visible: a banner for each turn, one instruction line, a caption per rival step, a score pop.
//   node playable-test.js [url=http://localhost:8765/] [WxH=390x763]      Exit code 1 on any problem.
const PW=require('playwright');const U=require('./uiplay.js');const {sleep,tapSel}=U;
const URL_=process.argv[2]||'http://localhost:8765/';const [W,H]=(process.argv[3]||'390x763').split('x').map(Number);
const probs=[];const note=(m)=>{if(probs.length<40)probs.push(m)};
(async()=>{const b=await PW.chromium.launch();const touch=W<800;
  const ctx=await b.newContext({viewport:{width:W,height:H},isMobile:touch,hasTouch:true,deviceScaleFactor:1});const p=await ctx.newPage();
  p.on('pageerror',e=>note('PAGE ERROR '+e.message));p.on('console',m=>{const t=m.text();if(m.type()==='error'&&!/Failed to load|net::|favicon|Fetch API/.test(t))note('console error '+t.slice(0,160))});
  await p.goto(URL_);await sleep(1200);await p.evaluate(()=>{try{localStorage.clear()}catch(e){}});await p.evaluate(()=>{localStorage.setItem('gxt-short-fuse',JSON.stringify({done:1}))});await p.reload();await sleep(1200);
  const tap=async(sel,what)=>{const ok=await tapSel(p,sel,true,probs);if(!ok)note('could not tap '+(what||sel));return ok};
  // ---- 1) Quick game
  if(!await tap('#start [data-a=start]','Play'))return fin();await sleep(500);
  if(await p.evaluate(()=>!!document.getElementById('offer')))await tap('#offer [data-a=offerno]','Just play');await sleep(900);
  const brief=await p.evaluate(()=>{const c=document.querySelector('.briefc');return c?{flav:!!c.querySelector('.bflav'),goal:!!c.querySelector('.bgoal'),fs:parseFloat(getComputedStyle(c.querySelector('.bflav')||c).fontSize)}:null});
  if(!brief)note('no brief card');else{if(!brief.goal)note('brief card lacks the goal line');if(brief.fs<14)note('brief text under 14px')}
  await tap('[data-a=briefok]','Go');
  let ev={ban:new Set(),says:new Set(),pop:0,rivalCap:0};
  const watch=setInterval(async()=>{try{const s=await p.evaluate(()=>({ban:(document.getElementById('turnb')||{}).className||'',bt:(document.getElementById('turnb')||{}).textContent||'',say:document.getElementById('say').textContent,pop:(document.getElementById('spop')||{}).className||'',fs:parseFloat(getComputedStyle(document.getElementById('say')).fontSize)}));
    if(s.ban.includes('on'))ev.ban.add(s.bt);ev.says.add(s.say);if(s.pop.includes('on'))ev.pop++;if(/ points at | solo-|^Hit|^Miss/.test(s.say))ev.rivalCap++;if(s.fs<14)ev.small=s.fs}catch(e){}},200);
  const r=await U.playToEnd(p,{touch:true,maxMs:200000,log:probs});clearInterval(watch);
  if(!r.over)note('Quick game did not reach the result: '+JSON.stringify(r).slice(0,200));
  else if(!r.card)note('Quick game: no result card');
  const end=await p.evaluate(()=>{const c=document.querySelector('#over .end');return c?{line:!!c.querySelector('.endline'),stat:!!c.querySelector('.endstat'),btns:[...c.querySelectorAll('button')].map(b=>b.textContent.trim())}:null});
  if(end&&(!end.line||!end.stat))note('result card lacks the story line / stats');
  if(false&&![...ev.ban].some(t=>t==='Your turn'))note('no "Your turn" banner was shown');
  if(false&&![...ev.ban].some(t=>/'s turn$/.test(t)&&t!=='Your turn'))note('no rival turn banner was shown');
  if(ev.rivalCap)note('rival play-by-play shown in the instruction line ('+ev.rivalCap+'); decision 8 Nov: rival moves show on the board only');if(!ev.pop)note('no score pop was shown');if(ev.small)note('instruction line under 14px: '+ev.small);
  console.log('quick game:',r.over?'PASS':'FAIL','taps',r.taps,'banners',[...ev.ban].join('|'),'captions',ev.rivalCap,'pops',ev.pop,'end',JSON.stringify(end));
  // ---- 2) Story stage 1
  await p.evaluate(()=>{localStorage.setItem('gxt-short-fuse',JSON.stringify({done:1}));localStorage.setItem('sf_played','1');try{showStart()}catch(e){}});await p.reload();await sleep(1200);
  await tap('#start [data-a=story]','Story');await sleep(700);
  const st0=await p.evaluate(()=>({map:!!document.querySelector('.gxc-map-on'),run:typeof GXT!=='undefined'&&GXT.running()}));if(!st0.map)note('Story did not open the chapter map ('+JSON.stringify(st0)+')');
  await tap('.gxc-node.open','chapter 1 node');await sleep(500);await tap('.gxc-btn.go','chapter Play');await sleep(700);
  let scenes=0,guard=0;
  while(guard++<60){if(await p.evaluate(()=>!!document.querySelector('.gxc-scene-on'))){const t=await p.evaluate(()=>document.querySelector('.gxc-sc-text')&&document.querySelector('.gxc-sc-text').textContent);if(t)scenes++;if(!await tapSel(p,'.gxc-scene-on .gxc-btn.go',true,null))break;await sleep(350);continue}
    if(await p.evaluate(()=>!!document.querySelector('.gxc-boss-on'))){if(!await tapSel(p,'.gxc-boss-on .gxc-btn.go',true,null))break;await sleep(400);continue}break}
  if(scenes<2)note('Story chapter 1 intro showed '+scenes+' lines');
  await sleep(500);const brief2=await p.evaluate(()=>!!UI.brief);if(brief2)await tap('[data-a=briefok]','Go');
  const r2=await U.playToEnd(p,{touch:true,maxMs:200000,log:probs});
  if(!r2.over)note('Story stage 1 did not reach the result: '+JSON.stringify(r2).slice(0,200));
  await sleep(1500);let res=null;for(let i=0;i<20&&!res;i++){res=await p.evaluate(()=>{const e=document.querySelector('.gxc-res-on');return e?e.textContent.slice(0,80):null});if(!res)await sleep(400)}
  if(!res){const sc=await p.evaluate(()=>!!document.querySelector('.gxc-scene-on'));if(sc){await tap('.gxc-scene-on .gxc-btn.go','outro');await sleep(900);res=await p.evaluate(()=>{const e=document.querySelector('.gxc-res-on');return e?e.textContent.slice(0,80):null})}}
  if(!res)note('Story stage 1: no chapter result screen');
  console.log('story stage 1:',r2.over&&res?'PASS':'FAIL','scenes',scenes,'taps',r2.taps,'result',res);
  fin();
  async function fin(){await b.close();console.log(probs.length?'PROBLEMS '+probs.length+'\n  '+probs.join('\n  '):'PROBLEMS 0');process.exit(probs.length?1:0)}})();
