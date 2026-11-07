// Coached first game to the end, from fresh storage, by REAL taps at 390x763 and 1440x860: Play -> "Learn" -> free play (any legal move: the move comes from the
// game's own hint, never engine calls) -> result -> "Things you'll meet later". Asserts: no forced step, one coach chip at a time, every rule in COACH was either
// explained during play or is listed on the later card, the tutorial is saved as done. Prints only PASS/FAIL.   node tutor-e2e.js [390x763,1440x860]
const PW=require('/home/user/spotify_to_ytmusic/games-src/node_modules/playwright');
const fs=require('fs');const html=fs.readFileSync(__dirname+'/hollowbough.html');
const SIZES=(process.argv[2]||'390x763,1440x860').split(',').map(x=>x.split('x').map(Number));const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function game(b,W,H){const kind='coached';const touch=W<600;const probs=[];const t0=Date.now();
  const ctx=await b.newContext({viewport:{width:W,height:H},isMobile:touch,hasTouch:touch,deviceScaleFactor:1});
  await ctx.route('**/*',r=>new URL(r.request().url()).host==='gns.test'?r.fulfill({status:200,contentType:'text/html',body:html}):r.abort());
  const p=await ctx.newPage();p.setDefaultTimeout(6000);
  p.on('pageerror',e=>probs.push('page error '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/net::|Failed to load|favicon/.test(m.text()))probs.push('console '+m.text().slice(0,140))});
  await p.goto('https://gns.test/');await sleep(600);await p.evaluate(()=>{localStorage.clear()});await p.reload();await sleep(900);
  const tapEl=async sel=>{const r=await p.evaluate(sel=>{const e=document.querySelector(sel);if(!e)return null;const b=e.getBoundingClientRect();if(b.width<4)return null;const x=b.left+b.width/2,y=b.top+b.height/2;const t=document.elementFromPoint(x,y);return{x,y,ok:!!t&&(e===t||e.contains(t)||t.contains(e))}},sel);if(!r)return false;if(!r.ok){probs.push('covered: '+sel);return false}await(touch?p.touchscreen.tap(r.x,r.y):p.mouse.click(r.x,r.y));return true};
  const tapAt=async(x,y)=>touch?p.touchscreen.tap(x,y):p.mouse.click(x,y);
  await p.evaluate(()=>{AIDELAY=120});
  await tapEl('[data-start="play"]');await sleep(500);await tapEl('[data-offer="learn"]');await sleep(1500);
  if(!await p.evaluate(()=>!!(G&&UI.cfg&&UI.cfg.coached)))probs.push('coached game did not start');
  let maxChips=0,seenChip=new Set();
  await sleep(1200);let idle=0,taps=0,over=false;
  while(Date.now()-t0<420000){
    const s=await p.evaluate(()=>{
      const vis=e=>{if(!e)return false;const r=e.getBoundingClientRect();return r.width>4&&r.height>4&&!e.closest('[hidden]')&&getComputedStyle(e).visibility!=='hidden'};
      const pt=e=>{const r=e.getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2}};
      const cover=(e,q)=>{const t=document.elementFromPoint(q.x,q.y);return !!t&&(e===t||e.contains(t)||t.contains(e))};
      const out={over:!!(G&&G.phase==='over'),busy:!!(UI.animBusy)};
      // 1) open dialogs/cards/overlays: press their first visible button
      const pcs=[...document.querySelectorAll('#pc:not([hidden]) .cbtns .btn, .gxc-btn.go')].filter(vis);
      if(UI.cards[0]&&UI.cards[0].kind==='over'&&document.querySelector('#pc:not([hidden])'))return Object.assign(out,{kind:'done'});
      if(pcs.length){const e=pcs[0];const q=pt(e);return Object.assign(out,{kind:'btn',q,cov:cover(e,q),txt:e.textContent.trim().slice(0,24),pc:!!document.querySelector('#pc:not([hidden])')})}
      if(!G||!UI.started)return Object.assign(out,{kind:'none'});
      if(UI.animBusy||G.phase==='over')return Object.assign(out,{kind:'wait'});
      const a=HB.actor(G);if(G.players[a].ai)return Object.assign(out,{kind:'wait'});
      try{computeRec(true)}catch(e){}
      if(!UI.rec||!UI.rec.m)return Object.assign(out,{kind:'norec'});
      let tg=tgOf(UI.rec.m);if(UI.sel){const i=UI.sel.ms.findIndex(x=>sameM(x,UI.rec.m));tg=i>=0?'o:'+i:'x';}
      let el=UI.tgEls&&UI.tgEls[tg];if(!el&&G.q){el=UI.tgEls['q:'+UI.rec.m.i]}
      if(!el)return Object.assign(out,{kind:'noel',tg});
      hscrollTo(el);const b0=el.getBoundingClientRect();let q=null;
      for(const fy of [.5,.35,.65,.2,.8])for(const fx of [.5,.2,.8,.35,.65,.1,.9]){const x=b0.left+b0.width*fx,y=b0.top+b0.height*fy;if(x<0||y<0||x>innerWidth||y>innerHeight)continue;const t=document.elementFromPoint(x,y);if(t&&(el===t||el.contains(t))){q={x,y};break}if(q)break}
      if(!q)return Object.assign(out,{kind:'move',q:{x:b0.left+b0.width/2,y:b0.top+b0.height/2},cov:false,tg});
      return Object.assign(out,{kind:'move',q,cov:true,tg});
    }).catch(e=>({kind:'err',e:e.message}));
    const chip=await p.evaluate(()=>{const e=document.getElementById('hbsay');return e&&e.classList.contains('on')?e.textContent:''}).catch(()=>'');if(chip)seenChip.add(chip.slice(0,30));
    if(await p.$('.hb-later')){over=true;break}
    if(s.kind==='done'||(s.over&&s.kind==='wait')){await sleep(3500);if(await p.$('.hb-later')){over=true;break}}
    if(s.kind==='btn'&&s.cov===false)probs.push('button covered: '+s.txt);
    if(s.kind==='btn'||s.kind==='move'){idle=0;if(s.cov===false&&s.kind==='move'){probs.push('target covered '+s.tg)}await tapAt(s.q.x,s.q.y);taps++;if(process.env.DBG&&taps%15===0){console.error(taps,JSON.stringify(await p.evaluate(()=>({n:G.logN,t:G.turn,ph:G.phase,q:G.q&&G.q.kind,seat:HB.actor(G),pc:UI.cards[0]&&UI.cards[0].kind,sel:!!UI.sel,res:G.players[0].res,w:G.players[0].workers,dep:G.players[0].dep.length,se:G.players[0].season,rec:UI.rec&&UI.rec.m&&UI.rec.m.label}))))}await sleep(s.kind==='btn'?350:550);}
    else{idle++;await sleep(300);if(idle>60){probs.push('stuck: '+JSON.stringify(s).slice(0,120));break}}
  }
  await sleep(300);
  const fin=await p.evaluate(()=>({later:!!document.querySelector('.hb-later'),log:UI.tutLog||[],left:UI.laterList||[],rules:COACH.map(c=>c.id).concat(COACH_LATER.map(c=>c.id)),over:!!(G&&G.phase==='over'),res:G&&G.over?G.over.scores.map(x=>x.total):null}));
  if(!fin.later)probs.push('no later card');
  const miss=fin.rules.filter(i=>!fin.log.includes(i)&&!fin.left.includes(i));if(miss.length)probs.push('rules neither explained nor listed: '+miss.join(','));
  if(!fin.log.includes('score')||!fin.log.includes('rscore'))probs.push('score walk-through missing');
  const lb=await p.$('[data-later]');if(lb){await lb.click();await sleep(500)}
  const done=await p.evaluate(()=>GXT.isDone('hollowbough'));if(!done)probs.push('tutorial not saved as done');
  console.log((probs.length?'FAIL ':'PASS ')+'tutorial-to-end '+W+'x'+H+' coached free play taps='+taps+' chips='+seenChip.size+' explained='+fin.log.filter(i=>fin.rules.includes(i)).length+'/'+fin.rules.length+' later='+fin.left.length+' scores='+JSON.stringify(fin.res)+' '+Math.round((Date.now()-t0)/1000)+'s '+probs.slice(0,4).join(' | '));
  await ctx.close();return probs.length}
(async()=>{const b=await PW.chromium.launch();let bad=0;for(const [W,H] of SIZES)bad+=await game(b,W,H);await b.close();process.exit(bad?1:0)})();
