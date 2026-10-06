// Sweep: full games against the computer through the REAL page, with touch taps on glowing targets only (like a person on a phone).
//   node sweep.js [games=20] [sizes=390x763,375x553] [workers=4]
// Fails on: page errors, a glowing target that does not respond, a hint that is not a legal move, status line over 8 words, a text block over 8 words
// on the board, on-screen influence different from the engine, nothing happening for 8 s, covered buttons, horizontal scroll, a board under 55% in portrait,
// and (rotations) a layout that breaks after turning the phone. Exit code 1 on any problem.
// Help kit (gx-help): tips ON from a fresh profile in 4 of 5 games (every first-time bubble must appear once, point at its target, never cover the target or a
// glowing thing, be short, dismiss on a tap, and the game is still completed); the 5th game has tips OFF (no bubble may appear). The lightbulb is tapped with
// a finger: its finger target must equal the game's own suggestion (advise()), the suggestion must be legal, the why <= 15 words, a tap dismisses it, the
// rules cards (2-4, <= 20 words, a picture each) open from the "How does this work?" link.
const PW=(()=>{try{return require('playwright')}catch(e){return require('/opt/node-tools/node_modules/playwright')}})();
const fs=require('fs');
const html=fs.readFileSync(__dirname+'/thornbound.html');
const MODE=process.argv[5]||'me';const GAMES=+(process.argv[2]||20);const SIZES=(process.argv[3]||'390x763,375x553').split(',').map(s=>s.split('x').map(Number));const WORKERS=+(process.argv[4]||4);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const probs=[];const note=(tag,msg)=>{if(probs.length<60)probs.push(tag+': '+msg);else if(probs.length===60)probs.push('... more')};
let totals={games:0,taps:0,hint:0,kinds:{},bubbles:{},bulbs:0,bulbNull:0,rulesOpened:0,tipsOffGames:0};

async function playGame(browser,W,H,gi){
  const tag=W+'x'+H+' g'+gi;
  const ctx=await browser.newContext({viewport:{width:W,height:H},deviceScaleFactor:1,isMobile:true,hasTouch:true});
  await ctx.route('**/*',r=>new URL(r.request().url()).host==='gns.test'?r.fulfill({status:200,contentType:'text/html',body:html}):r.abort());
  const p=await ctx.newPage();p.setDefaultTimeout(15000);
  p.on('pageerror',e=>note(tag,'PAGE ERROR '+e.message+' '+(e.stack||'').split('\n').slice(0,3).join('|')));
  p.on('console',m=>{if(m.type()==='warning'&&/rejected/.test(m.text()))note(tag,'ENGINE '+m.text().slice(0,200));if(m.type()==='error'&&!/net::|Failed to load|favicon/.test(m.text()))note(tag,'console error '+m.text().slice(0,160))});
  await p.goto('https://gns.test/?phone=1');await sleep(900);
  const np=2+gi%3;const seed=900+gi*7;
  await p.evaluate(([np,seed,gi,mode])=>{try{localStorage.clear()}catch(e){}newGame(mode==='hot'?'hot':mode==='watch'?'ai':'me',{np:mode==='hot'?2:np,seed,length:'short',levels:['normal','normal','easy','hard'].slice(0,np)});UI.speed=8;UI.guide=gi%4===0?'off':'full';if(gi%5===4)GXH.setEnabled(false)},[np,seed,gi,MODE]);
  const tipsOn=gi%5!==4;
  await sleep(300);
  let last='',lastT=Date.now(),taps=0,rot=false,rot2=false;const t0=Date.now();
  const state=()=>p.evaluate(()=>({over:!!G.over,k:UI.bf&&UI.bf.kind,q:G.q&&G.q.kind,card:UI.card&&(UI.card.kind+(UI.card.ev?':'+UI.card.ev.t:'')),n:G.logN,r:G.round,
     sig:[UI.nMoves,UI.hintQ,G.logN,G.q&&G.q.kind,G.q&&G.q.title,G.q&&G.q.chosen&&G.q.chosen.length,UI.hand,UI.ord&&UI.ord.join(),UI.pop,UI.sheetOpen,UI.card&&UI.card.kind,G.round,G.pl.map(x=>x.inf).join()].join('|')}));
  const checks=async(phase)=>{
    const r=await p.evaluate(()=>{const o={bad:[]};const W=innerWidth,Hh=innerHeight;
      const st=document.querySelector('#barstat .st-t');const words=st?st.textContent.replace(/[^a-zA-Z0-9'’]+/g,' ').trim().split(' ').filter(w=>/[a-z][a-z]/i.test(w)).length:0;if(words>8)o.bad.push('status line '+words+' words: '+st.textContent);
      // wordy text blocks on the board, seats, tray (not in sheets, drawers or dialogs the player opened)
      for(const e of document.querySelectorAll('#board *,#rivals *,#act *,#handw *,.gx-bar *,#tip,#fx *')){if(e.closest('svg')&&!e.closest('foreignObject'))continue;if(!e.childNodes||![...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim()))continue;
        const cs=getComputedStyle(e);if(cs.display.startsWith('inline'))continue;const r=e.getBoundingClientRect();if(!r.width||r.bottom<0||r.top>Hh)continue;
        const w=(e.innerText||'').replace(/[^a-zA-Z0-9'’]+/g,' ').trim().split(' ').filter(x=>/[a-z][a-z]/i.test(x));if(w.length>8)o.bad.push('text block '+w.length+' words: '+w.slice(0,6).join(' '))}
      // on-screen influence = engine (seat chips and the track tokens)
      document.querySelectorAll('#rivals .rv-n').forEach(n=>{const s=+n.dataset.s;if(!(UI.card&&UI.card.kind==='event'&&UI.card.ev.t==='clash')&&+n.textContent!==G.pl[s].inf)o.bad.push('seat '+s+' shows '+n.textContent+' engine '+G.pl[s].inf)});
      if(MAP.m&&!UI.busy)G.pl.forEach((pl,s)=>{if(MAP.m.influence(s)!==pl.inf&&!(UI.card&&UI.card.kind==='event'))o.bad.push('track token seat '+s+' at '+MAP.m.influence(s)+' engine '+pl.inf)});
      const de=document.documentElement;if(Math.max(de.scrollWidth,document.body.scrollWidth)>W+1||de.scrollHeight>Hh+1)o.bad.push('page scrolls '+de.scrollWidth+'x'+de.scrollHeight+' vs '+W+'x'+Hh);
      const B=document.querySelector('[data-board]').getBoundingClientRect();const pct=100*Math.max(0,Math.min(B.right,W)-Math.max(B.left,0))*Math.max(0,Math.min(B.bottom,Hh)-Math.max(B.top,0))/(W*Hh);o.pct=Math.round(pct);
      if(Hh>W&&pct<55)o.bad.push('board only '+Math.round(pct)+'% of the screen');
      const mb=document.querySelector('#mapbox svg').getBoundingClientRect();if(Hh>W&&mb.width<W*.8)o.bad.push('map only '+Math.round(mb.width)+'px wide on a '+W+'px screen');
      // covered buttons
      for(const e of document.querySelectorAll('#act .btn,#handw .hc,#handw .kcb,.gx-bar .gx-ibtn,#rivals .rv')){const r=e.getBoundingClientRect();if(!r.width||!r.height||e.closest('[hidden]'))continue;const x=r.left+Math.min(r.width/2,22),y=r.top+r.height/2;if(x<0||y<0||x>W||y>Hh)continue;
        const h=document.elementFromPoint(x,y);if(!h||!(h===e||e.contains(h)||h.contains(e)||(h.closest&&h.closest('[data-help]'))))o.bad.push('covered '+(e.dataset.a||e.className)+' by '+(h?(h.id||h.className||h.tagName):'none'))}
      // hint = a legal move
      if(UI.bf&&UI.bf.rec){const s=viewSeatForQ();if(s!=null&&!legal(s).some(m=>m.k===UI.bf.rec.k))o.bad.push('hint is not a legal move: '+UI.bf.rec.k)}
      // help elements: inside the screen, never over the target or a glowing thing; with tips off, no bubble at all
      {const hb=[...document.querySelectorAll('.gxh-bub.on')];if(!GXH.enabled()&&hb.some(b=>b.dataset.phase))o.bad.push('a coach bubble with tips off');
       for(const b of hb){const r=b.getBoundingClientRect();if(r.left<-1||r.top<-1||r.right>W+1||r.bottom>Hh+1)o.bad.push('help bubble outside the screen');
        const cores=[...document.querySelectorAll('.glow,.rglow,.rec,.rrec,#act .btn,#main .opt,#main [data-a=mv],#spots .bspot')].filter(e=>!e.closest('[data-help]')&&!e.closest('[hidden]')).map(e=>e.getBoundingClientRect()).filter(q=>q.width&&q.height&&q.right>0&&q.bottom>0&&q.left<W&&q.top<Hh).map(q=>{let w=q.width,h=q.height;const cx=q.left+w/2,cy=q.top+h/2;if(w>56)w=32;if(h>56)h=32;return {left:cx-w/2,top:cy-h/2,right:cx+w/2,bottom:cy+h/2}});
        for(const c of cores)if(r.left<c.right&&r.right>c.left&&r.top<c.bottom&&r.bottom>c.top){o.bad.push('help bubble covers a glowing target');break}}}
      const f=document.querySelector('#finger');o.finger=!!(f&&!f.hidden);
      return o});
    for(const b of r.bad){note(tag+' '+phase,b);if(/help bubble/.test(b)&&!checks._shot){checks._shot=1;await p.screenshot({path:'/tmp/claude-0/helpbad_'+W+'_'+gi+'.png'}).catch(()=>{})}}
    if(r.finger)totals.hint++;
    return r};
  let lastTap=null,lastDiag='';
  const diagAt=(x,y)=>p.evaluate(([x,y])=>{const e=document.elementFromPoint(x,y);return ' [at '+Math.round(x)+','+Math.round(y)+' el='+(e?(e.tagName+'.'+String(e.className&&e.className.baseVal!==undefined?e.className.baseVal:e.className).slice(0,40)+(e.dataset&&e.dataset.a?' a='+e.dataset.a:'')):'none')+' bf='+(UI.bf&&UI.bf.kind)+' q='+(G.q&&G.q.kind)+' hand='+UI.hand+' pop='+UI.pop+' card='+(UI.card&&UI.card.kind)+' sheet='+UI.sheetOpen+' main='+(document.querySelector('#main').classList.contains('on')?document.querySelector('#main').textContent.length:'off')+' nMoves='+UI.nMoves+' nc='+UI._nc+'/'+(UI._ncT?UI._ncT-Date.now():0)+' drag='+UI.dragging+' anc='+((e&&e.closest&&e.closest('.hc'))?'hc#'+e.closest('.hc').dataset.id+(e.closest('.hc').classList.contains('glow')?'g':'-'):'')+']'},[x,y]);
  const tapAt=async(x,y)=>{lastTap=[x,y];lastDiag=await diagAt(x,y);await p.touchscreen.tap(x,y);taps++;totals.taps++};
  const diag=async()=>lastDiag+' after:'+(await diagAt(...(lastTap||[0,0])));
  const ctr=sel=>p.evaluate(sel=>{const e=document.querySelector(sel);if(!e)return null;const r=e.getBoundingClientRect();if(!r.width)return null;return [r.left+r.width/2,r.top+r.height/2]},sel);
  const responded=async(before)=>{const t=Date.now();while(Date.now()-t<1500){await sleep(60);const s=await state();if(s.sig!==before)return true}return false};
  // ---- help kit checks
  const seenPh=new Set();let bulbN=0;
  const wc=t=>String(t||'').replace(/[^a-zA-Z0-9'’+]+/g,' ').trim().split(' ').filter(Boolean).length;
  const NEUTRAL=[60,16];   // the game title in the top bar: a tap there does nothing else
  const helpFlow=async(s)=>{
    const hs=await p.evaluate(()=>({ph:hlpPhase(),step:!!(HLP_STEPS[hlpPhase()]),st:GXH.state()}));
    if(hs.st.rules){note(tag,'rules overlay stuck open');await p.evaluate(()=>GXH.hide());return false}
    // 1) the first-time bubble of this phase
    if(tipsOn&&hs.ph&&hs.step&&!seenPh.has(hs.ph)){seenPh.add(hs.ph);
      let b=null;const t1=Date.now();
      while(Date.now()-t1<2500){b=await p.evaluate(ph=>{const e=document.querySelector('.gxh-bub.on[data-phase]');if(!e)return null;const te=HLP_STEPS[ph].target();const tq=te&&te.getBoundingClientRect();const T=tq&&{left:tq.left,top:tq.top,right:tq.right,bottom:tq.bottom};const r=e.getBoundingClientRect();return {id:e.dataset.phase,title:e.querySelector('.gxh-tt').textContent,text:e.querySelector('.gxh-tx').textContent,arrow:!!e.querySelector('.gxh-arr'),ok:!!e.querySelector('.gxh-ok'),r:[r.left,r.top,r.right,r.bottom],T}},hs.ph).catch(()=>null);if(b)break;await sleep(80)}
      if(!b)note(tag,'no coach bubble for phase '+hs.ph);
      else{totals.bubbles[hs.ph]=(totals.bubbles[hs.ph]||0)+1;
        if(b.id!==hs.ph)note(tag,'bubble for '+b.id+' shown in phase '+hs.ph);
        if(wc(b.title)>4)note(tag,'bubble title over 4 words: '+b.title);if(wc(b.text)>20)note(tag,'bubble text over 20 words ('+wc(b.text)+'): '+b.text);
        if(!b.arrow||!b.ok)note(tag,'bubble without arrow or Got it ('+hs.ph+')');
        if(b.T){const [l,t,r,bt]=b.r;if(l<b.T.right&&r>b.T.left&&t<b.T.bottom&&bt>b.T.top)note(tag,'bubble covers its target ('+hs.ph+')')}
        await checks('bubble '+hs.ph);
        await tapAt(...NEUTRAL);await sleep(120);
        const g=await p.evaluate(()=>!!document.querySelector('.gxh-bub'));if(g)note(tag,'bubble did not dismiss on a tap ('+hs.ph+')');
        return true}}
    // 2) the lightbulb: now and then (the first time in every phase, then a quarter of the time)
    if(hs.ph&&(!seenPh.has('bulb:'+hs.ph)||Math.random()<.25)&&bulbN<14){seenPh.add('bulb:'+hs.ph);bulbN++;totals.bulbs++;
      const pre=await p.evaluate(()=>{const M=UI.bf;const s=viewSeatForQ();let adv=null;try{adv=UI._rec&&UI._rec.k}catch(e){}   // the game's own cached suggestion (what the glowing suggestion uses)
        const pl=M&&M.sug?planFor(M,M.sug,{full:1}):null;return {sug:M&&M.sug&&M.sug.k,adv,legal:!!(M&&M.sug&&legal(s).some(m=>m.k===M.sug.k)),plan:pl&&{to:pl.to,from:pl.from},sig:G.logN+'|'+UI.hand+'|'+(G.q&&G.q.kind)}});
      let moved=false;const bb=await ctr('#bulbbtn');if(!bb){note(tag,'no bulb button');return false}
      await tapAt(...bb);await sleep(350);
      const r=await p.evaluate(()=>{const f=document.querySelector('.gxh-finger'),b=document.querySelector('.gxh-bub.on'),ru=document.querySelector('.gxh-rules');
        return {f:f&&{...f.dataset},ring:document.querySelectorAll('.gxh-ring').length,why:b&&b.querySelector('.gxh-tx').textContent,link:!!(b&&b.querySelector('.gxh-link')),rules:!!ru,card:UI.card&&UI.card.kind,sig:G.logN+'|'+UI.hand+'|'+(G.q&&G.q.kind)}});
      if(pre.sug&&pre.plan&&!r.f&&(r.card||r.sig!==pre.sig)){moved=true}
      else if(pre.sug&&pre.plan){
        if(pre.sug!==pre.adv)note(tag,'bulb suggestion '+pre.sug+' differs from advise() '+pre.adv+' ('+hs.ph+')');
        if(!pre.legal)note(tag,'bulb suggestion not legal ('+pre.sug+')');
        if(!r.f)note(tag,'bulb tapped, no finger ('+hs.ph+') plan now '+await p.evaluate(()=>{try{return JSON.stringify(planFor(UI.bf,UI.bf.sug,{full:1}).toR)+' main='+document.querySelector('#main').className+' '+document.querySelector('#main').innerHTML.length+' pop='+UI.pop+' card='+(UI.card&&UI.card.kind)+' st='+JSON.stringify(GXH.state())+' phase='+hlpPhase()+' qk='+(G.q&&G.q.kind)+' sugnow='+(()=>{const x=hlpSuggest();return x?JSON.stringify([x.why,!!x.target(),x.from&&!!x.from()]):'null'})()}catch(e){return 'none '+e.message}}));
        else{if(Math.abs(+r.f.tx-pre.plan.to.x)>2||Math.abs(+r.f.ty-pre.plan.to.y)>2)note(tag,'bulb finger target '+r.f.tx+','+r.f.ty+' != suggestion '+Math.round(pre.plan.to.x)+','+Math.round(pre.plan.to.y)+' ('+hs.ph+')');
          if(pre.plan.from&&(!r.f.fx||Math.abs(+r.f.fx-pre.plan.from.x)>2||Math.abs(+r.f.fy-pre.plan.from.y)>2))note(tag,'bulb finger start != the suggested card ('+hs.ph+')');}
        if(!r.ring)note(tag,'bulb: nothing glows at the suggestion');
        if(!r.why||wc(r.why)>15)note(tag,'bulb why '+wc(r.why)+' words: '+r.why);if(!r.link)note(tag,'bulb bubble has no "How does this work?"');
        await checks('bulb '+hs.ph);
        if(Math.random()<.5&&r.link){const lk=await ctr('.gxh-bub .gxh-link');if(lk){await tapAt(...lk);await sleep(250);await rulesCheck(hs.ph)}}
        else{await tapAt(...NEUTRAL);await sleep(150)}
      }else{totals.bulbNull++;totals.nullWhy=(totals.nullWhy||[]).concat(hs.ph+':'+pre.sug);if(r.f)note(tag,'bulb with no suggestion still pointed a finger ('+hs.ph+')');if(!r.rules)note(tag,'bulb with no suggestion did not open the rules ('+hs.ph+')');else await rulesCheck(hs.ph)}
      await p.evaluate(()=>GXH.hide());
      const a=await p.evaluate(()=>({g:!!document.querySelector('.gxh-bub,.gxh-ring,.gxh-finger,.gxh-rules'),sig:G.logN+'|'+UI.hand+'|'+(G.q&&G.q.kind)}));
      if(a.g)note(tag,'help still on screen after a tap ('+hs.ph+')');if(!moved&&a.sig!==pre.sig&&!(await p.evaluate(()=>!!UI.card)))note(tag,'tapping the bulb changed the game ('+pre.sig+' -> '+a.sig+')');
      return true}
    return false};
  const rulesCheck=async(ph)=>{totals.rulesOpened++;
    const R=await p.evaluate(()=>{const e=document.querySelector('.gxh-rules');if(!e)return null;const out=[];const n=+e.dataset.count;const card=e.querySelector('.gxh-card').getBoundingClientRect();
      for(let i=0;i<n;i++){out.push({t:e.querySelector('.gxh-rt').textContent,x:e.querySelector('.gxh-rx').textContent,pic:!!e.querySelector('.gxh-pic svg'),h:Math.round(card.height)});if(i<n-1)e.querySelector('.gxh-next').click()}
      const r=e.querySelector('.gxh-card').getBoundingClientRect();return {n,cards:out,inside:r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight}});
    if(!R){note(tag,'rules cards did not open ('+ph+')');return}
    if(R.n<2||R.n>4)note(tag,'rules for '+ph+' have '+R.n+' cards (want 2-4)');
    R.cards.forEach(c=>{if(wc(c.x)>20)note(tag,'rules card over 20 words ('+ph+'): '+c.x);if(!c.pic)note(tag,'rules card without a picture ('+ph+'): '+c.t)});
    if(!R.inside)note(tag,'rules card outside the screen ('+ph+')');
    await p.evaluate(()=>document.querySelector('.gxh-rules .gxh-x').click());await sleep(100);
    if(await p.evaluate(()=>!!document.querySelector('.gxh-rules')))note(tag,'rules cards did not close')};
  let dead=0;
  for(let i=0;i<4000;i++){
    if(Date.now()-t0>170000){note(tag,'game took over 170 s (stuck?)');break}
    let s=await state();
    if(s.over)break;
    if(s.sig!==last){last=s.sig;lastT=Date.now()}else if(Date.now()-lastT>8000){note(tag,'stuck for 8 s: q='+s.q+' bf='+s.k+' card='+s.card);await p.screenshot({path:'/tmp/claude-0/stuck_'+W+'_'+gi+'.png'}).catch(()=>{});break}
    // rotations in the middle of the game
    if(!rot&&s.r===2&&s.k){rot=true;await p.setViewportSize({width:H,height:W});await p.evaluate(()=>{dispatchEvent(new Event('resize'));dispatchEvent(new Event('orientationchange'))});await sleep(900);await checks('rotated');await p.setViewportSize({width:W,height:H});await p.evaluate(()=>{dispatchEvent(new Event('resize'));dispatchEvent(new Event('orientationchange'))});await sleep(900);await checks('rotated back');continue}
    if(s.card){if(s.card==='pass'){const tk=await ctr('#pc [data-a=take]');if(tk){await tapAt(...tk);await sleep(150);continue}break}
      if(i%7===3&&(s.card.startsWith('event')||s.card==='news')){await tapAt(W/2,H*.45)}   // a tap on the board skips the narration
      await sleep(80);continue}
    if(!s.k){await sleep(80);continue}
    totals.kinds[s.k]=(totals.kinds[s.k]||0)+1;
    if(await helpFlow(s))continue;
    if(i%5===0)await checks(s.k);
    const before=s.sig;let acted=false;
    const mode=Math.floor(Math.random()*3);
    switch(s.k){
      case 'bid':case 'place':case 'tie':{
        const cards=await p.evaluate(()=>[...document.querySelectorAll('#handw .hc.glow')].map(e=>{const r=e.getBoundingClientRect();return {id:+e.dataset.id,x:r.left+Math.min(r.width/2,22),y:r.top+r.height/2,rg:e.classList.contains('rg')}}));
        const pass=await ctr('#act [data-a=mv]');
        if(!cards.length){if(pass){await tapAt(...pass);acted=true}break}
        const c=cards.find(x=>x.rg&&Math.random()<.5)||cards[Math.floor(Math.random()*cards.length)];
        const tgt=await p.evaluate(k=>{ // glowing targets right now (before selecting): none expected
          return null},s.k);
        if(s.k==='tie'&&pass&&Math.random()<.4){await tapAt(...pass);acted=true;break}
        await tapAt(c.x,c.y);if(!(await responded(before))){dead++;note(tag,'dead tap on glowing hand card '+c.id+' ('+s.k+')'+await diag());break}
        const targets=await p.evaluate(()=>{const o=[];const sp=document.querySelector('#spots .bspot.glow');if(sp){const r=sp.getBoundingClientRect();o.push({t:'spot',x:r.left+r.width/2,y:r.top+r.height/2})}
          document.querySelectorAll('.tbx-pan g.rglow').forEach(g=>{const r=g.querySelector('rect').getBoundingClientRect();o.push({t:'region',x:r.left+r.width/2,y:r.top+r.height/2})});return o});
        if(!targets.length){note(tag,'selected a glowing card but nothing glows ('+s.k+')');await tapAt(c.x,c.y);acted=true;break}
        const t=targets[0];const mid=await state();
        if(mode===0){await tapAt(c.x,c.y)}                       // tap the lifted card again
        else if(mode===1){await tapAt(t.x,t.y)}                   // tap the glowing spot / region
        else{ // drag the card onto the target
          const pos=await p.evaluate(id=>{const e=document.querySelector('#handw .hc[data-id="'+id+'"]');const r=e.getBoundingClientRect();return [r.left+Math.min(r.width/2,22),r.top+r.height/2]},c.id);
          const cdp=await ctx.newCDPSession(p);const tp=(type,x,y)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'?[]:[{x,y}]});
          await tp('touchStart',pos[0],pos[1]);for(let k=1;k<=8;k++){await tp('touchMove',pos[0]+(t.x-pos[0])*k/8,pos[1]+(t.y-pos[1])*k/8);await sleep(16)}await tp('touchEnd');taps++;totals.taps++;await cdp.detach()}
        if(!(await responded(mid.sig))){dead++;note(tag,'dead '+['re-tap','target tap','drag'][mode]+' after selecting a card ('+s.k+')')}
        acted=true;break}
      case 'herald':case 'location':{
        const pts=await p.evaluate(()=>[...document.querySelectorAll('.tb-loc.glow')].map(g=>{const r=g.querySelector('.tb-ring').getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2,rec:g.classList.contains('rec')}}));
        if(!pts.length){note(tag,s.k+': no glowing location');break}
        const t=pts.find(x=>x.rec&&Math.random()<.6)||pts[Math.floor(Math.random()*pts.length)];await tapAt(t.x,t.y);acted=true;if(!(await responded(before))){dead++;note(tag,'dead tap on glowing location ('+s.k+')')}break}
      case 'bidRes':{
        const kc=await p.evaluate(()=>[...document.querySelectorAll('#handw .kcb.glow')].map(e=>{const r=e.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2,steal:e.classList.contains('steal'),rg:e.classList.contains('rg')}}));
        const keep=await ctr('#act [data-a=mv]');
        if(kc.length&&(Math.random()<.8||!keep)){const t=kc.find(x=>x.rg&&Math.random()<.6)||kc[Math.floor(Math.random()*kc.length)];await tapAt(t.x,t.y);acted=true;
          if(t.steal){await sleep(250);const ok=await ctr('#ppop [data-a=mv]');if(!ok){dead++;note(tag,'steal asked for no confirmation')}else{await tapAt(...ok)}}}
        else if(keep){await tapAt(...keep);acted=true}
        if(acted&&!(await responded(before))){dead++;note(tag,'dead tap in bid resolution'+await diag())}break}
      case 'clashOrder':{
        const t=await p.evaluate(()=>{const g=document.querySelector('.tbx-pan g.rglow');if(!g)return null;const r=g.querySelector('rect').getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2]});
        if(!t){note(tag,'clash order: no glowing region');break}await tapAt(...t);acted=true;if(!(await responded(before))){dead++;note(tag,'dead tap on glowing region (clash order)')}break}
      case 'menu':{
        const regs=await p.evaluate(()=>[...document.querySelectorAll('.tbx-pan g.rglow')].map(g=>{const r=g.querySelector('rect').getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2]}));
        const done=await ctr('#act [data-a=mv]');
        const pw=await ctr('#act [data-a=powers]');
        if(regs.length&&Math.random()<.35){await tapAt(...regs[Math.floor(Math.random()*regs.length)]);acted=true;if(!(await responded(before))){dead++;note(tag,'dead tap on glowing region (supporters)')}}
        else if(pw&&Math.random()<.3){await tapAt(...pw);await sleep(200);const use=await ctr('#main [data-a=mv]');if(use){await tapAt(...use);acted=true}else{note(tag,'Powers opened nothing'+await diag())}}
        else if(done){await tapAt(...done);acted=true;if(!(await responded(before))){dead++;note(tag,'dead tap on Done'+await diag())}}
        break}
      default:{ // anything else: a glowing hand card, or a button in the sheet
        const hc=await p.evaluate(()=>{const e=document.querySelector('#handw .hc.glow');if(!e)return null;const r=e.getBoundingClientRect();return [r.left+Math.min(r.width/2,22),r.top+r.height/2]});
        const btn=await ctr('#main [data-a=mv]')||await ctr('#act [data-a=mv]');
        if(btn&&(Math.random()<.7||!hc)){await tapAt(...btn);acted=true}else if(hc){await tapAt(...hc);acted=true;await sleep(200);const b2=await ctr('#ppop [data-a=mv]');if(b2)await tapAt(...b2)}
        if(acted&&!(await responded(before))){dead++;note(tag,'dead tap in "'+s.q+'" decision'+await diag())}
        await p.evaluate(()=>{if(UI.pop)closePop()});}
    }
    if(!acted)await sleep(120);
  }
  // end of game: on-screen influence = engine, result shown
  await sleep(2500);
  const fin=await p.evaluate(()=>({over:!!G.over,inf:G.pl.map(x=>x.inf),seats:[...document.querySelectorAll('#rivals .rv-n')].map(n=>+n.textContent),card:UI.card&&UI.card.kind}));
  if(!fin.over)note(tag,'game did not finish');else{if(fin.seats.join()!==fin.inf.join())note(tag,'final scores on screen '+fin.seats.join('/')+' vs engine '+fin.inf.join('/'));if(fin.card!=='over'&&fin.card!=null)note(tag,'end card was '+fin.card)}
  {const hst=await p.evaluate(()=>GXH.state());const dup=hst.shown.filter((x,i)=>hst.shown.indexOf(x)!==i);if(dup.length)note(tag,'bubble shown twice: '+dup.join());
   if(!tipsOn){totals.tipsOffGames++;if(hst.shown.length)note(tag,'tips off but bubbles shown: '+hst.shown.join())}}
  totals.games++;
  await ctx.close();
  return {taps,dead,secs:Math.round((Date.now()-t0)/1000)}}

(async()=>{const b=await PW.chromium.launch({args:['--no-sandbox']});const T=Date.now();
  const jobs=[];for(const [W,H] of SIZES)for(let g=0;g<GAMES;g++)jobs.push([W,H,g]);
  let ji=0;const res=[];
  await Promise.all(Array.from({length:WORKERS},async()=>{while(ji<jobs.length){const j=jobs[ji++];try{const r=await playGame(b,...j,j[2]);res.push(r);process.stdout.write('.')}catch(e){note(j[0]+'x'+j[1]+' g'+j[2],'CRASH '+String(e.message).split('\n')[0]);process.stdout.write('x')}}}));
  await b.close();
  console.log('\nhelp: bubbles '+JSON.stringify(totals.bubbles)+', bulb taps '+totals.bulbs+' ('+totals.bulbNull+' with no suggestion), rules opened '+totals.rulesOpened+', tips-off games '+totals.tipsOffGames+(totals.nullWhy?' null:'+JSON.stringify(totals.nullWhy.slice(0,12)):''));
  console.log(totals.games+' games, '+totals.taps+' taps, finger shown on '+totals.hint+' checks, decision kinds '+JSON.stringify(totals.kinds)+', '+Math.round((Date.now()-T)/1000)+' s');
  console.log(probs.length?'PROBLEMS '+probs.length+'\n  '+probs.join('\n  '):'PROBLEMS 0');process.exit(probs.length?1:0)})();
