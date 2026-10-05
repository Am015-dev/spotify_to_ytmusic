// Sweep: full games against the computer through the REAL page, with touch taps on glowing targets only (like a person on a phone).
//   node sweep.js [games=20] [sizes=390x763,375x553] [workers=4]
// Fails on: page errors, a glowing target that does not respond, a hint that is not a legal move, status line over 8 words, a text block over 8 words
// on the board, on-screen influence different from the engine, nothing happening for 8 s, covered buttons, horizontal scroll, a board under 55% in portrait,
// and (rotations) a layout that breaks after turning the phone. Exit code 1 on any problem.
const PW=(()=>{try{return require('playwright')}catch(e){return require('/opt/node-tools/node_modules/playwright')}})();
const fs=require('fs');
const html=fs.readFileSync(__dirname+'/thornbound.html');
const MODE=process.argv[5]||'me';const GAMES=+(process.argv[2]||20);const SIZES=(process.argv[3]||'390x763,375x553').split(',').map(s=>s.split('x').map(Number));const WORKERS=+(process.argv[4]||4);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const probs=[];const note=(tag,msg)=>{if(probs.length<60)probs.push(tag+': '+msg);else if(probs.length===60)probs.push('... more')};
let totals={games:0,taps:0,hint:0,kinds:{}};

async function playGame(browser,W,H,gi){
  const tag=W+'x'+H+' g'+gi;
  const ctx=await browser.newContext({viewport:{width:W,height:H},deviceScaleFactor:1,isMobile:true,hasTouch:true});
  await ctx.route('**/*',r=>new URL(r.request().url()).host==='gns.test'?r.fulfill({status:200,contentType:'text/html',body:html}):r.abort());
  const p=await ctx.newPage();p.setDefaultTimeout(15000);
  p.on('pageerror',e=>note(tag,'PAGE ERROR '+e.message+' '+(e.stack||'').split('\n').slice(0,3).join('|')));
  p.on('console',m=>{if(m.type()==='warning'&&/rejected/.test(m.text()))note(tag,'ENGINE '+m.text().slice(0,200));if(m.type()==='error'&&!/net::|Failed to load|favicon/.test(m.text()))note(tag,'console error '+m.text().slice(0,160))});
  await p.goto('https://gns.test/?phone=1');await sleep(900);
  const np=2+gi%3;const seed=900+gi*7;
  await p.evaluate(([np,seed,gi,mode])=>{try{localStorage.clear()}catch(e){}newGame(mode==='hot'?'hot':mode==='watch'?'ai':'me',{np:mode==='hot'?2:np,seed,length:'short',levels:['normal','normal','easy','hard'].slice(0,np)});UI.speed=8;UI.guide=gi%4===0?'off':'full'},[np,seed,gi,MODE]);
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
        const h=document.elementFromPoint(x,y);if(!h||!(h===e||e.contains(h)||h.contains(e)))o.bad.push('covered '+(e.dataset.a||e.className)+' by '+(h?(h.id||h.className||h.tagName):'none'))}
      // hint = a legal move
      if(UI.bf&&UI.bf.rec){const s=viewSeatForQ();if(s!=null&&!legal(s).some(m=>m.k===UI.bf.rec.k))o.bad.push('hint is not a legal move: '+UI.bf.rec.k)}
      const f=document.querySelector('#finger');o.finger=!!(f&&!f.hidden);
      return o});
    for(const b of r.bad)note(tag+' '+phase,b);
    if(r.finger)totals.hint++;
    return r};
  let lastTap=null,lastDiag='';
  const diagAt=(x,y)=>p.evaluate(([x,y])=>{const e=document.elementFromPoint(x,y);return ' [at '+Math.round(x)+','+Math.round(y)+' el='+(e?(e.tagName+'.'+String(e.className&&e.className.baseVal!==undefined?e.className.baseVal:e.className).slice(0,40)+(e.dataset&&e.dataset.a?' a='+e.dataset.a:'')):'none')+' bf='+(UI.bf&&UI.bf.kind)+' q='+(G.q&&G.q.kind)+' hand='+UI.hand+' pop='+UI.pop+' card='+(UI.card&&UI.card.kind)+' sheet='+UI.sheetOpen+' main='+(document.querySelector('#main').classList.contains('on')?document.querySelector('#main').textContent.length:'off')+' nMoves='+UI.nMoves+' nc='+UI._nc+'/'+(UI._ncT?UI._ncT-Date.now():0)+' drag='+UI.dragging+' anc='+((e&&e.closest&&e.closest('.hc'))?'hc#'+e.closest('.hc').dataset.id+(e.closest('.hc').classList.contains('glow')?'g':'-'):'')+']'},[x,y]);
  const tapAt=async(x,y)=>{lastTap=[x,y];lastDiag=await diagAt(x,y);await p.touchscreen.tap(x,y);taps++;totals.taps++};
  const diag=async()=>lastDiag+' after:'+(await diagAt(...(lastTap||[0,0])));
  const ctr=sel=>p.evaluate(sel=>{const e=document.querySelector(sel);if(!e)return null;const r=e.getBoundingClientRect();if(!r.width)return null;return [r.left+r.width/2,r.top+r.height/2]},sel);
  const responded=async(before)=>{const t=Date.now();while(Date.now()-t<1500){await sleep(60);const s=await state();if(s.sig!==before)return true}return false};
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
  totals.games++;
  await ctx.close();
  return {taps,dead,secs:Math.round((Date.now()-t0)/1000)}}

(async()=>{const b=await PW.chromium.launch({args:['--no-sandbox']});const T=Date.now();
  const jobs=[];for(const [W,H] of SIZES)for(let g=0;g<GAMES;g++)jobs.push([W,H,g]);
  let ji=0;const res=[];
  await Promise.all(Array.from({length:WORKERS},async()=>{while(ji<jobs.length){const j=jobs[ji++];try{const r=await playGame(b,...j,j[2]);res.push(r);process.stdout.write('.')}catch(e){note(j[0]+'x'+j[1]+' g'+j[2],'CRASH '+String(e.message).split('\n')[0]);process.stdout.write('x')}}}));
  await b.close();
  console.log('\n'+totals.games+' games, '+totals.taps+' taps, finger shown on '+totals.hint+' checks, decision kinds '+JSON.stringify(totals.kinds)+', '+Math.round((Date.now()-T)/1000)+' s');
  console.log(probs.length?'PROBLEMS '+probs.length+'\n  '+probs.join('\n  '):'PROBLEMS 0');process.exit(probs.length?1:0)})();
