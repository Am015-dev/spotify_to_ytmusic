// Touch-only walk of the Thornbound tutorial at 402x874 (iPhone-class, hasTouch, isMobile).
//   node tutorial-walk.js [html=../game/thornbound.html] [outdir=.]    exit 1 if the tutorial is not completed.
// Every step: read the glowing target from GXT.state() (no hard-coded coordinates), check it is >=44px, uncovered and
// on screen, tap it with a real finger (page.touchscreen.tap) and require the step counter to move on.
const PW=(()=>{try{return require('playwright')}catch(e){return require('/opt/node-tools/node_modules/playwright')}})();
const fs=require('fs'),path=require('path');
const html=fs.readFileSync(path.resolve(process.argv[2]||path.join(__dirname,'..','game','thornbound.html')));
const OUT=path.resolve(process.argv[3]||__dirname);
const W=402,H=874,sleep=ms=>new Promise(r=>setTimeout(r,ms));
const problems=[];const note=m=>{problems.push(m);console.log('PROBLEM',m)};
(async()=>{
  const browser=await PW.chromium.launch();
  const tmp=path.join(OUT,'vid-tmp');fs.rmSync(tmp,{recursive:true,force:true});
  const ctx=await browser.newContext({viewport:{width:W,height:H},deviceScaleFactor:1,isMobile:true,hasTouch:true,recordVideo:{dir:tmp,size:{width:W,height:H}}});
  await ctx.route('**/*',r=>new URL(r.request().url()).host==='gns.test'?r.fulfill({status:200,contentType:'text/html',body:html}):r.abort());
  const p=await ctx.newPage();p.setDefaultTimeout(15000);
  p.on('pageerror',e=>note('PAGE ERROR '+e.message));
  await p.goto('https://gns.test/?phone=1');await sleep(900);
  await p.evaluate(()=>{try{localStorage.clear()}catch(e){}});await p.reload();await sleep(900);
  await p.evaluate(()=>showStart());
  const tb=await p.evaluate(()=>{const b=document.querySelector('#start [data-gxt-open]');const r=b.getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2,b.textContent]});
  console.log('menu button:',tb[2]);
  await p.touchscreen.tap(tb[0],tb[1]);await sleep(600);
  await p.evaluate(()=>{window.__churn={};new MutationObserver(m=>{const id=(window.GXT&&GXT.state().id)||'?';m.forEach(x=>x.addedNodes.forEach(n=>{if(n.classList&&n.classList.contains('gxt-bub'))__churn[id]=(__churn[id]||0)+1}))}).observe(document.body,{childList:true})});
  const state=()=>p.evaluate(()=>GXT.state());
  const seen=[];let lastSig='',lastT=Date.now(),steps=0,total=0,ended=false;
  for(let guard=0;guard<6000;guard++){
    const st=await state();
    if(!st.active){break}
    total=st.n;
    if(st.phase==='end'){ended=true;break}
    const sig=[st.i,st.phase,st.count,st.shown].join('|');
    if(sig!==lastSig){lastSig=sig;lastT=Date.now()}
    else if(Date.now()-lastT>9000){note('STUCK >9s at step '+(st.i+1)+'/'+st.n+' '+st.id+' phase='+st.phase+' '+JSON.stringify(await p.evaluate(()=>({q:G.q&&G.q.kind,card:UI.card&&UI.card.kind,ev:UI.card&&UI.card.ev&&UI.card.ev.t,bf:UI.bf&&UI.bf.kind}))));await p.screenshot({path:path.join(OUT,'stuck-'+(st.i+1)+'.png')});break}
    if(!st.shown){
      // between steps: a "Tap to go on" strip over the board -> one tap on the board
      const go=await p.evaluate(()=>{const l=document.querySelector('#tbturn:not([hidden]) .tbt-line'),ch=document.querySelector('#tbturn:not([hidden]) .tbt-chip');
        if(!l||!(/Tap to go on/.test(l.textContent)||ch&&/^Tap/.test(ch.textContent))||!UI.card||(typeof tutHold==='function'&&tutHold(UI.card)))return null;window.__tbGo=UI.card;
        const b=document.getElementById('board').getBoundingClientRect();return {x:b.left+b.width/2,y:b.top+b.height*0.62}});
      if(go){await p.touchscreen.tap(go.x,go.y);await sleep(300)}else await sleep(80);
      continue}
    const info=await p.evaluate(()=>{const s=GXT.state(),b=document.querySelector('.gxt-bub'),nb=b&&b.querySelector('.gxt-next');
      const q=e=>{if(!e)return null;const r=e.getBoundingClientRect();return {left:r.left,top:r.top,right:r.right,bottom:r.bottom,w:r.width,h:r.height,cx:r.left+r.width/2,cy:r.top+r.height/2}};
      let under=null;if(s.hole){const e=document.elementFromPoint(s.hole.cx,s.hole.cy);under=e?(e.closest('.gxt-bub,.gxt-top')?'COVERED by '+(e.className||e.tagName):(e.id||(e.className&&e.className.baseVal)||e.className||e.tagName)):null}
      return {s,next:q(nb),under,say:(b&&b.querySelector('.gxh-tx')||{}).textContent,hs:document.documentElement.scrollWidth>innerWidth+1}});
    if(!seen.includes(st.id)){seen.push(st.id);
      const tag='step '+(st.i+1)+'/'+st.n+' '+st.id+' ['+(st.wait||'next')+'] "'+(info.say||'')+'"';console.log(tag);
      const h=st.hole;
      if(h){if(st.wait&&(h.width<44||h.height<44))note(tag+': target only '+Math.round(h.width)+'x'+Math.round(h.height)+'px (<44)');
        if(h.cx<0||h.cy<0||h.cx>W||h.cy>H)note(tag+': target off screen');
        if(info.under&&/COVERED/.test(info.under))note(tag+': target covered by '+info.under)}
      if(info.hs)note(tag+': page scrolls horizontally');
      if(st.bubble&&(st.bubble.right>W+1||st.bubble.left<-1||st.bubble.bottom>H+1))note(tag+': bubble off screen')}
    const age=Date.now()-(st.shownAt||0);if(age<800)await sleep(800-age);   // the kit ignores taps in the first 600 ms of a bubble
    const before=await state();
    if(!st.wait){
      let nx=null;for(let k=0;k<5&&!nx;k++){nx=await p.evaluate(()=>{const n=document.querySelector('.gxt-bub .gxt-next');if(!n)return null;const r=n.getBoundingClientRect();return {cx:r.left+r.width/2,cy:r.top+r.height/2,w:r.width,h:r.height}});if(!nx)await sleep(60)}
      if(!nx){const c=await state();if(!c.active||c.i!==st.i||c.phase!=='show'||c.wait){await sleep(100);continue}   /* the watch step moved on by itself (2.5 s) between the read and the tap: fine */
        note('step '+(st.i+1)+' '+st.id+': Next step but no Next button');await sleep(300);continue}
      if(nx.h<44)note('step '+(st.i+1)+' '+st.id+': Next button only '+Math.round(nx.h)+'px high');
      await p.touchscreen.tap(nx.cx,nx.cy);
    }else await p.touchscreen.tap(st.hole.cx,st.hole.cy);
    const t1=Date.now();let moved=false;
    while(Date.now()-t1<2500){await sleep(60);const a=await state();if(!a.active||a.i!==before.i||a.count!==before.count||a.phase!=='show'){moved=true;break}}
    if(!moved){const a=await state();note('step '+(st.i+1)+' '+st.id+': a finger tap on '+(st.wait?'the target':'Next')+' did not advance (under='+info.under+')');await p.screenshot({path:path.join(OUT,'dead-'+(st.i+1)+'.png')});
      // retry once to tell flaky from dead
      await sleep(800);const b2=await state();if(b2.shown&&b2.i===before.i){if(!st.wait){const nx=await p.evaluate(()=>{const n=document.querySelector('.gxt-bub .gxt-next');if(!n)return null;const r=n.getBoundingClientRect();return {cx:r.left+r.width/2,cy:r.top+r.height/2}});if(nx)await p.touchscreen.tap(nx.cx,nx.cy)}else await p.touchscreen.tap(b2.hole.cx,b2.hole.cy);await sleep(1500);const b3=await state();if(b3.i===before.i&&b3.phase==='show')break}}
  }
  const churn=await p.evaluate(()=>window.__churn);for(const k in churn)if(churn[k]>2)note('bubble of step '+k+' was rebuilt '+churn[k]+' times (re-render churn)');
  if(seen.length<total)note('only '+seen.length+'/'+total+' steps were ever shown (a step vanished before it could be read/tapped)');
  const fin=await state();
  const lastStep=seen.length;
  console.log('RESULT steps shown',lastStep+'/'+total,'ended card:',ended||(fin.active&&fin.phase==='end'));
  if(ended){await p.screenshot({path:path.join(OUT,'tutorial-end.png')});
    const b=await p.evaluate(()=>{const e=document.querySelector('[data-gxt-end=play]');const r=e.getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2,r.height]});
    await p.touchscreen.tap(b[0],b[1]);await sleep(1200);console.log('after end card: tutorial active =',await p.evaluate(()=>GXT.active()))}
  const vp=p.video();await ctx.close();
  const vf=await vp.path();fs.copyFileSync(vf,path.join(OUT,'tutorial-402x874.webm'));fs.rmSync(tmp,{recursive:true,force:true});
  await browser.close();
  console.log(problems.length?'FAIL '+problems.length+' problem(s)':'PASS');
  process.exit(ended&&!problems.length?0:1);
})().catch(e=>{console.error(e);process.exit(2)});
