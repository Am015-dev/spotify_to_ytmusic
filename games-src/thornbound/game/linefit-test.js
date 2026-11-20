// Line-fit test (F14): at a short phone every turn-strip line must fit (no text cut off). Plays a default game by the suggestions; at each of your
// decisions it repaints the strip and checks the line; every log line is also put through the message-card text into a clone of the strip.
//   node linefit-test.js [size=375x553]
const PW=(()=>{try{return require('playwright')}catch(e){return require('/opt/node-tools/node_modules/playwright')}})();
const fs=require('fs');const html=fs.readFileSync(process.env.TB_FILE||__dirname+'/thornbound.html');
const [W,H]=(process.argv[2]||'375x553').split('x').map(Number);const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const b=await PW.chromium.launch();const ctx=await b.newContext({viewport:{width:W,height:H},isMobile:true,hasTouch:true});
  await ctx.route('**/*',r=>new URL(r.request().url()).host==='gns.test'?r.fulfill({status:200,contentType:'text/html',body:html}):r.abort());
  const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.goto('https://gns.test/?phone=1');await sleep(700);
  await p.evaluate(()=>{showStart();document.querySelector('#start [data-a=play]').click()});await sleep(300);
  await p.evaluate(()=>document.querySelector('#start [data-a=start]').click());await sleep(1500);
  await p.evaluate(()=>{const g=document.getElementById('tbgoal');if(g)g.remove();try{GXH.hide()}catch(e){}});
  const r=await p.evaluate(async()=>{const cut=[],seen=new Set();let checked=0;const T=document.getElementById('tbturn');
    const over=ln=>!!ln&&tbLineOver(ln);
    const probe=T.cloneNode(false);probe.id='tbturn';probe.style.cssText='position:fixed;left:0;top:-500px;width:'+T.offsetWidth+'px';
    const fit=(chip,txt,card)=>{T.parentNode.appendChild(probe);T.id='tbturnX';probe.className='';probe.innerHTML='<span class="tbt-chip wt">'+chip+'</span><span class="tbt-line">'+txt+'</span>'+(card?'<button class="tbt-skip2" type="button">Skip</button>':'<button class="tbt-goal" type="button">Goal</button>')+'';const ln=probe.querySelector('.tbt-line');
      if(over(ln))ln.classList.add('sm');if(over(ln)){ln.classList.add('xs');probe.classList.add('tbxs')}const o=over(ln);probe.remove();T.id='tbturn';return !o};
    let n=0;while(G.phase!=='over'&&n<3000){n++;const q=TB.pending(G);if(!q)break;
      if(q.seats.includes(0)){try{UI.card=null;UI.evq=[];renderAll();tbStripPaint()}catch(e){}const ln=T.querySelector('.tbt-line');const t=ln?ln.textContent:'';
        if(t&&!seen.has(t)){seen.add(t);checked++;if(over(ln))cut.push('turn: '+t);if(t.replace(/[^a-zA-Z0-9\u2019']+/g,' ').trim().split(' ').length>8)cut.push('turn over 8 words: '+t)}
        UI._rk=null;const mv=legal(0);let m=null;try{m=getRec(0,mv)}catch(e){}TB.apply(G,m||mv[0])}else TB.AI.step(G,{humans:[0]})}
    for(const e of G.log){let t='';try{t=tbEight(shortT(tbOne(plain(e.t))));if(e.m&&(e.m.k==='inf'||e.m.k==='steal')){const il=infLine([{m:e.m}]);if(il)t=tbEight(il)}}catch(x){t=""}if(!t||seen.has(t))continue;seen.add(t);checked++;
      if(t.split(/\s+/).filter(Boolean).length>8)cut.push('over 8 words: '+t);if(!fit('Court',t.replace(/&/g,'&amp;').replace(/</g,'&lt;'),1))cut.push('card: '+t)}
    return {checked,cut:cut.slice(0,15),ncut:cut.length}});
  console.log('lines checked '+r.checked+', cut off '+r.ncut);for(const c of r.cut)console.log('  CUT '+c);
  console.log('page errors '+errs.length+(errs[0]?' '+errs[0]:''));await b.close();const bad=r.ncut||errs.length||r.checked<20;console.log(bad?'linefit-test FAIL':'linefit-test PASS ('+W+'x'+H+')');process.exit(bad?1:0)})();
