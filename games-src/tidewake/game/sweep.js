// Sweep: full games against the computer through the REAL page (phone layout), with touch taps on glowing targets only (like a person on a phone).
//   node sweep.js [games=20] [sizes=390x763,375x553] [workers=3]
// Fails on: page errors, a glowing target (gold mark, tile, Place, option button) that does not respond, a bulb finger that is not the game's own advice or
// does not lead to that move, nothing happening for 8 s, covered buttons, horizontal scroll, a board narrower than the screen, and (rotations) a layout that
// breaks after turning the phone. Exit code 1 on any problem.
// Help kit (gx-help): tips ON from a fresh profile in 4 of 5 games (every first-time bubble appears once, points at its target, never covers the target or a glowing
// thing, is short, dismisses on a tap, and the game is still completed); the 5th game has tips OFF (no bubble may appear). The lightbulb is tapped with a finger:
// its finger target must equal planned advice (startAdvice / recMove / aiMove), tapping the finger must perform exactly that move, the why <= 15 words, a tap
// dismisses it, and the rules cards (2-4, <= 20 words, a picture each) open from "How does this work?".
const PW=(()=>{try{return require('playwright')}catch(e){return require('/opt/node-tools/node_modules/playwright')}})();
const fs=require('fs');
const html=fs.readFileSync(__dirname+'/tidewake.html');
const GAMES=+(process.argv[2]||20);const SIZES=(process.argv[3]||'390x763,375x553').split(',').map(s=>s.split('x').map(Number));const WORKERS=+(process.argv[4]||3);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const probs=[];const note=(tag,msg)=>{if(probs.length<60)probs.push(tag+': '+msg);else if(probs.length===60)probs.push('... more')};
const totals={games:0,taps:0,hint:0,phases:{},bubbles:{},bulbs:0,bulbNull:0,bulbFollowed:0,rulesOpened:0,tipsOffGames:0,rot:0};
const wc=t=>String(t||'').replace(/[^a-zA-Z0-9'’+]+/g,' ').trim().split(' ').filter(Boolean).length;
const GLOW='.opip,.oring,#ps .pt,#ps .pb:not(.zoom),#ppop .pb,#ppop .ph-t,#pc .btn,#pin .hc,#pin .btn,#dockbody .btn';

async function playGame(browser,W,H,gi){
  const tag=W+'x'+H+' g'+gi;
  const ctx=await browser.newContext({viewport:{width:W,height:H},deviceScaleFactor:1,isMobile:true,hasTouch:true});
  await ctx.route('**/*',r=>new URL(r.request().url()).host==='gns.test'?r.fulfill({status:200,contentType:'text/html',body:html}):r.abort());
  const p=await ctx.newPage();p.setDefaultTimeout(15000);
  p.on('pageerror',e=>note(tag,'PAGE ERROR '+e.message+' '+(e.stack||'').split('\n').slice(0,3).join('|')));
  p.on('console',m=>{if(m.type()==='error'&&!/net::|Failed to load|favicon/.test(m.text()))note(tag,'console error '+m.text().slice(0,160))});
  const twoD=process.argv[5]==='3d'?false:process.argv[5]==='2d'?true:gi%4!==0;                       // most games on the 2D chart (fast), every 4th on the real 3D board
  await p.goto('https://gns.test/?phone=1'+(twoD?'&2d':''),{timeout:90000});await sleep(1100);
  const np=2+gi%3,anim=gi%2===0;const exp=gi%3===1||gi%7===3?['rift','cannon','wave','maelstrom']:gi%4===2?['cannon','rift']:[];
  const tipsOn=gi%5!==4;
  await p.evaluate(([np,gi,exp,anim,seed])=>{try{localStorage.clear()}catch(e){}
    const s=defaultSetup();s.mode='me';s.np=np;s.variant=gi%9===5?'solo':null;s.noMon=false;s.exp={rift:0,wave:0,maelstrom:0,cannon:0};for(const k of exp)s.exp[k]=1;
    s.seats.forEach((x,i)=>{x.h=i===0;x.lv=['normal','normal','easy','hard'][i%4]});
    AIDELAY=0;ANIM=anim?1:0;UI.anim=anim;UI.speed=anim?40:1;try{TWKit.setSpeed(UI.speed)}catch(e){}UI.tickRate=1;setSeed(seed);setAiSeed(seed);
    window.__acts=[];const _a=act;act=function(m,s){window.__acts.push(JSON.stringify(m));return _a.apply(this,arguments)};
    startGame(JSON.parse(JSON.stringify(s)));if(gi%5===4)GXH.setEnabled(false)},[np,gi,exp,anim,300+gi*13]);
  await sleep(500);
  let last='',lastT=Date.now(),taps=0,rot=false;const t0=Date.now();const SLOW=twoD?1:3;     // the 3D board runs on a software renderer here: everything takes about 3x longer
  const state=()=>p.evaluate(()=>({over:!!G.over,ph:hlpPhase(),busy:!!UI.busy,q:G.q&&G.q.kind,pc:PH.cur&&PH.cur.kind,pop:PH.pop,turn:G.turn,
     sig:[G.logN,G.phase,G.step,G.q&&G.q.kind,UI.sel&&UI.sel.t+':'+UI.sel.r+':'+UI.sel.s,PH.pop,PH.cur&&PH.cur.kind,UI.busy,G.turn,UI.sunk&&UI.sunk.length,(UI.moves||[]).length].join('|')}));
  const cen=sel=>p.evaluate(sel=>{const e=hq(...sel.split('||'))();if(!e)return null;const r=e.getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2]},sel);
  const tapAt=async(x,y)=>{await p.touchscreen.tap(x,y);taps++;totals.taps++};
  const tapSel=async sel=>{const c=await cen(sel);if(!c)return false;await tapAt(...c);return true};
  const responded=async(before)=>{const t=Date.now();while(Date.now()-t<1800){await sleep(60);const s=await state();if(s.sig!==before)return true}return false};
  // ---------------- layout checks
  const checks=async(phase)=>{
    const r=await p.evaluate(([GLOW])=>{const o={bad:[]};const W=innerWidth,Hh=innerHeight;
      const de=document.documentElement;if(Math.max(de.scrollWidth,document.body.scrollWidth)>W+1||de.scrollHeight>Hh+1)o.bad.push('page scrolls '+de.scrollWidth+'x'+de.scrollHeight+' vs '+W+'x'+Hh);
      const B=document.querySelector('#board').getBoundingClientRect();if(Hh>W&&B.width<Math.min(W*.85,280))o.bad.push('board only '+Math.round(B.width)+'px wide on a '+W+'px screen');
      if(B.bottom>Hh+1||B.right>W+1)o.bad.push('board runs off the screen');
      const card=document.querySelector('#pc:not([hidden])');for(const e of document.querySelectorAll('#ps .pb,#ps .pt,#ppop .pb,#ppop .ph-t,#pc .btn,.gx-bar .gx-ibtn')){const r=e.getBoundingClientRect();if(!r.width||!r.height||e.closest('[hidden]')||(card&&e.closest('#ps')))continue;const x=r.left+Math.min(r.width/2,22),y=r.top+r.height/2;if(x<0||y<0||x>W||y>Hh)continue;
        const h=document.elementFromPoint(x,y);if(!h||!(h===e||e.contains(h)||h.contains(e)||(h.closest&&h.closest('[data-help]'))))o.bad.push('covered '+(e.dataset.a||e.className)+' by '+(h?(h.id||h.className||h.tagName):'none'))}
      // help elements: inside the screen, never over the target or a glowing thing; with tips off, no coach bubble at all
      {const hb=[...document.querySelectorAll('.gxh-bub.on')];if(!GXH.enabled()&&hb.some(b=>b.dataset.phase))o.bad.push('a coach bubble with tips off');
       for(const b of hb){const r=b.getBoundingClientRect();if(r.left<-1||r.top<-1||r.right>W+1||r.bottom>Hh+1)o.bad.push('help bubble outside the screen');
        const cores=[...document.querySelectorAll(GLOW)].filter(e=>!e.closest('[data-help]')&&!e.closest('[hidden]')).map(e=>{const q=e.getBoundingClientRect();q.cls=e.className;return q}).filter(q=>q.width&&q.height&&q.right>0&&q.bottom>0&&q.left<W&&q.top<Hh).map(q=>{let w=q.width,h=q.height;const cx=q.left+w/2,cy=q.top+h/2;if(w>56)w=32;else w*=.8;if(h>56)h=32;else h*=.8;return {left:cx-w/2,top:cy-h/2,right:cx+w/2,bottom:cy+h/2,cls:q.cls}});
        for(const c of cores)if(Math.min(r.right,c.right)-Math.max(r.left,c.left)>10&&Math.min(r.bottom,c.bottom)-Math.max(r.top,c.top)>10){   // more than 10px into the glowing thing (a pulsing ring grows a few px)
          o.bad.push('help bubble covers a glowing target '+c.cls+' core '+[c.left,c.top,c.right,c.bottom].map(Math.round)+' bubble '+[r.left,r.top,r.right,r.bottom].map(Math.round));break}}}
      // afloat list on screen = engine
      const g=document.querySelector('#ps .ps-goal');if(g&&/Afloat/.test(g.textContent)&&!UI.busy&&G.variant!=='solo'&&G.variant!=='easysolo'){const up=g.innerHTML.split('<b>Sunk:</b>')[0];const n=(up.match(/<i /g)||[]).length;const alive=G.ships.filter(s=>s.alive).length;if(n!==alive)o.bad.push('afloat list shows '+n+' junks, engine '+alive)}
      return o},[GLOW]);
    for(const b of r.bad){note(tag+' '+phase,b);if(/help bubble/.test(b)&&!checks._shot){checks._shot=1;await p.screenshot({path:'/tmp/claude-0/helpbad_'+W+'_'+gi+'.png'}).catch(()=>{})}}
    return r};
  // ---------------- help kit checks
  const seenPh=new Set();let bulbN=0;
  const NEUTRAL=[60,16];     // the title chip in the top bar: a tap there does nothing else
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
  const helpFlow=async(s)=>{
    const hs=await p.evaluate(()=>({ph:hlpPhase(),step:!!HLP_STEPS[hlpPhase()],st:GXH.state()}));
    if(hs.st.rules){note(tag,'rules overlay stuck open');await p.evaluate(()=>GXH.hide());return false}
    // 1) the first-time bubble of this phase
    if(tipsOn&&hs.ph&&hs.step&&!seenPh.has(hs.ph)){seenPh.add(hs.ph);
      let b=null;const t1=Date.now();
      while(Date.now()-t1<4500*SLOW){b=await p.evaluate(ph=>{const e=document.querySelector('.gxh-bub.on[data-phase]');if(!e)return null;const te=HLP_STEPS[ph].target();const tq=te&&te.getBoundingClientRect?te.getBoundingClientRect():(te?{left:te.x-22,top:te.y-22,right:te.x+22,bottom:te.y+22}:null);
        const T=tq&&{left:tq.left,top:tq.top,right:tq.right,bottom:tq.bottom};const r=e.getBoundingClientRect();
        return {id:e.dataset.phase,title:e.querySelector('.gxh-tt').textContent,text:e.querySelector('.gxh-tx').textContent,arrow:!!e.querySelector('.gxh-arr'),ok:!!e.querySelector('.gxh-ok'),r:[r.left,r.top,r.right,r.bottom],T}},hs.ph).catch(()=>null);if(b)break;await sleep(80)}
      if(!b&&(await p.evaluate(()=>GXH.state().shown)).includes(hs.ph)){/* it appeared and was dismissed by an earlier tap of this script */}
      else if(!b)note(tag,'no coach bubble for phase '+hs.ph+' '+await p.evaluate(ph=>JSON.stringify({st:GXH.state(),tgt:!!HLP_STEPS[ph].target(),pop:PH.pop,ph2:hlpPhase(),sel:UI.sel,canPlace:UI.canPlace}),hs.ph));
      else{totals.bubbles[hs.ph]=(totals.bubbles[hs.ph]||0)+1;
        if(b.id!==hs.ph)note(tag,'bubble for '+b.id+' shown in phase '+hs.ph);
        if(wc(b.title)>4)note(tag,'bubble title over 4 words: '+b.title);if(wc(b.text)>20)note(tag,'bubble text over 20 words ('+wc(b.text)+'): '+b.text);
        if(!b.arrow||!b.ok)note(tag,'bubble without arrow or Got it ('+hs.ph+')');
        if(b.T){const [l,t,r,bt]=b.r;if(l<b.T.right&&r>b.T.left&&t<b.T.bottom&&bt>b.T.top)note(tag,'bubble covers its target ('+hs.ph+')')}
        await checks('bubble '+hs.ph);
        await tapAt(...NEUTRAL);await sleep(120);
        if(await p.evaluate(()=>!!document.querySelector('.gxh-bub')))note(tag,'bubble did not dismiss on a tap ('+hs.ph+')');
        return true}}
    // 2) the lightbulb: the first time in every phase, then a quarter of the time
    if(hs.ph&&(!seenPh.has('bulb:'+hs.ph)||Math.random()<.25)&&bulbN<14){seenPh.add('bulb:'+hs.ph);bulbN++;totals.bulbs++;
      const pre=await p.evaluate(()=>{let pl=null;try{pl=hlpPlan()}catch(e){}return {has:!!pl,key:pl&&pl.key,sig:G.logN+'|'+G.turn+'|'+(G.q&&G.q.kind)}});
      const bb=await cen('#bulbbtn');if(!bb){note(tag,'no bulb button');return false}
      await tapAt(...bb);await sleep(380);
      const r=await p.evaluate(()=>{const f=document.querySelector('.gxh-finger'),b=document.querySelector('.gxh-bub.on'),ru=document.querySelector('.gxh-rules');
        let pl=null,to=null,from=null;try{pl=hlpPlan();if(pl){const c=t=>{if(!t)return null;const e=typeof t==='function'?t():t;if(!e)return null;if(e.getBoundingClientRect){const r=e.getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2]}return [e.x,e.y]};to=c(pl.to);from=pl.from?c(pl.from):null}}catch(e){}
        return {f:f&&{...f.dataset},ring:document.querySelectorAll('.gxh-ring').length,why:b&&b.querySelector('.gxh-tx').textContent,link:!!(b&&b.querySelector('.gxh-link')),rules:!!ru,key:pl&&pl.key,to,from,sig:G.logN+'|'+G.turn+'|'+(G.q&&G.q.kind)}});
      if(pre.has&&r.f&&r.to){
        if(r.key!==pre.key)note(tag,'bulb advice changed between two reads: '+pre.key+' -> '+r.key+' ('+hs.ph+')');
        if(Math.abs(+r.f.tx-r.to[0])>20||Math.abs(+r.f.ty-r.to[1])>20)note(tag,'bulb finger target '+r.f.tx+','+r.f.ty+' != the advice '+Math.round(r.to[0])+','+Math.round(r.to[1])+' ('+hs.ph+')');
        if(r.from&&(!r.f.fx||Math.abs(+r.f.fx-r.from[0])>2||Math.abs(+r.f.fy-r.from[1])>2))note(tag,'bulb finger start != the advised tile ('+hs.ph+')');
        if(!r.ring)note(tag,'bulb: nothing glows at the suggestion ('+hs.ph+')');
        if(!r.why||wc(r.why)>15)note(tag,'bulb why '+wc(r.why)+' words: '+r.why);if(!r.link)note(tag,'bulb bubble has no "How does this work?"');
        await checks('bulb '+hs.ph);
        const roll=Math.random();
        if(roll<.3&&r.link){const lk=await cen('.gxh-bub .gxh-link');if(lk){await tapAt(...lk);await sleep(250);await rulesCheck(hs.ph);await p.evaluate(()=>GXH.hide());return true}}
        // follow the finger: it must lead to exactly that move
        await followFinger(hs.ph,r);return true}
      else if(!pre.has){totals.bulbNull++;if(r.f)note(tag,'bulb with no advice still pointed a finger ('+hs.ph+')');if(!r.rules)note(tag,'bulb with no advice did not open the rules ('+hs.ph+')');else await rulesCheck(hs.ph);await p.evaluate(()=>GXH.hide());return true}
      else{note(tag,'bulb tapped, advice exists but no finger ('+hs.ph+') key='+pre.key);await p.evaluate(()=>{GXH.hide();const x=document.querySelector('.gxh-rules .gxh-x');if(x)x.click()});return true}}
    return false};
  // tap where the finger points and check the game did exactly the advised move
  const followFinger=async(ph,r)=>{totals.bulbFollowed++;const before=await p.evaluate(()=>{const d=sideToAct();const pl=hlpPlan();const o={key:pl&&pl.key,d,logN:G.logN};
      if(pl&&/^place:/.test(pl.key)){const [,t,rr,sh]=pl.key.split(':').map((x,i)=>i?+x:x);const S=G.ships[sh];o.pl={card:G.hands[d][t],rot:rr,x:S.x,y:S.y,t}}return o});
    const mid=r.f?[+r.f.tx,+r.f.ty]:r.to;const sig0=(await state()).sig;
    if(process.env.DBGF)console.log(tag,'follow',before.key,mid,await p.evaluate(([x,y])=>{const e=document.elementFromPoint(x,y);return (e&&(e.tagName+'.'+e.className+' '+(e.dataset&&e.dataset.a)))+' sel='+JSON.stringify(UI.sel)+' pop='+PH.pop+' acts='+window.__acts.length},mid));
    const n0=await p.evaluate(()=>window.__acts.length);
    await tapAt(mid[0],mid[1]);
    if(/^start:/.test(before.key)){await sleep(300);
      const pk=await p.evaluate(()=>({pop:PH.pop,pd:PH.pd&&{x:PH.pd.x,y:PH.pd.y}}));const [,x,y,e]=before.key.split(/[:,]/).map((v,i)=>i?+v:v);
      if(pk.pop!=='start'||!pk.pd||pk.pd.x!==x||pk.pd.y!==y){note(tag,'tapping the bulb finger did not open the advised start mark ('+JSON.stringify(pk)+' want '+x+','+y+')');await p.evaluate(()=>GXH.hide());return}
      const ok=await tapSel('#ppop [data-a=startmark][data-x="'+x+'"][data-y="'+y+'"][data-e="'+e+'"]');
      if(!ok){note(tag,'advised start mark has no button in the pop-up');return}
      if(!(await responded(sig0)))note(tag,'dead tap on the advised start mark');
      else{const mk=await p.evaluate(([x,y,e,d])=>{const S=G.ships[d];return S.x===x&&S.y===y&&S.e===e},[x,y,e,before.d]);if(!mk)note(tag,'the start mark played is not the advised one')}
      return}
    if(!(await responded(sig0))){note(tag,'dead tap on the bulb finger target ('+ph+', '+before.key+')');await p.evaluate(()=>GXH.hide());return}
    await sleep(200);const done=await p.evaluate(n0=>{const a=window.__acts;return a.length>n0?JSON.parse(a[n0]):null},n0);
    const [kind,x1,x2,x3]=before.key.split(':');let ok=!!done;
    if(done){if(kind==='place')ok=done.a==='place'&&done.t===+x1&&done.r===+x2&&done.s===+x3;else if(kind==='q')ok=done.a==='q'&&done.i===+x2;else if(kind==='cannon')ok=done.a==='cannon'&&done.m===+x1;else if(kind==='gate')ok=done.a==='gate'&&done.t===+x1;else if(kind==='pass')ok=done.a==='pass'}
    if(!ok)note(tag,'bulb advised '+before.key+' but the move played was '+JSON.stringify(done));
    await p.evaluate(()=>GXH.hide())};
  let dead=0;const hist=[];const HH=(...a)=>{hist.push(a.join(' ')+' @'+(Date.now()-t0));if(hist.length>14)hist.shift()};
  const layTurn=async(s)=>{
    const before=s.sig;const ver=Math.random();
    // some variety first: open the tile pop-up by tapping my junk, pick another tile, turn
    if(s.pop!=='tiles'&&ver<.25){const ring=await p.evaluate(()=>{const e=document.querySelector('.oring');if(!e)return null;const r=e.getBoundingClientRect();return r.width?[r.left+r.width/2,r.top+r.height/2]:null});if(ring){await tapAt(...ring);await sleep(250)}}
    if(Math.random()<.5){const n=await p.evaluate(()=>(hq('#ppop .ph-t:not(.sp)','#ps .pt:not(.sp)')?document.querySelectorAll('#ppop:not([hidden]) .ph-t:not(.sp),#ps .pt:not(.sp)').length:0));if(n>1){const idx=Math.floor(Math.random()*n);
      const c=await p.evaluate(i=>{const l=[...document.querySelectorAll('#ppop:not([hidden]) .ph-t:not(.sp),#ps .pt:not(.sp)')];const e=l[i];if(!e)return null;const r=e.getBoundingClientRect();return r.width?[r.left+r.width/2,r.top+r.height/2]:null},idx);if(c){await tapAt(...c);await sleep(120)}}}
    for(let k=0;k<14;k++){lastT=Date.now();
      const pb=await cen('#ppop [data-a=place]:not([disabled])||#ps [data-a=place]:not([disabled])');
      if(pb&&(k>0||Math.random()<.7)){const sg=(await state()).sig;await tapAt(...pb);if(!(await responded(sg))){dead++;note(tag,'dead tap on the enabled Place button')}return}
      const r=await cen('#ppop [data-a=rot][data-d="1"]||#ps [data-a=rot][data-d="1"]');
      if(r){await tapAt(...r);await sleep(90)}
      if(k%4===3||!r){const c=await p.evaluate(()=>{const l=[...document.querySelectorAll('#ppop:not([hidden]) .ph-t:not(.sp),#ps .pt:not(.sp)')].filter(e=>e.getBoundingClientRect().width);const e=l[Math.floor(Math.random()*l.length)];if(!e)return null;const r=e.getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2]});if(c){await tapAt(...c);await sleep(90)}}}
    const lg=await p.evaluate(()=>({n:(UI.moves||[]).filter(m=>m.a==='place').length,pop:PH.pop,sel:JSON.stringify(UI.sel)}));
    if(lg.n)note(tag,'legal placements exist but no enabled Place after trying every turn ('+JSON.stringify(lg)+')')};
  for(let i=0;i<5000;i++){
    if(Date.now()-t0>420000){note(tag,'game took over 200 s (stuck?)');break}
    const s=await state();
    if(s.over)break;
    if(s.sig!==last){last=s.sig;lastT=Date.now()}else if(Date.now()-lastT>8000*SLOW){note(tag,'stuck for 8 s: ph='+s.ph+' q='+s.q+' pc='+s.pc+' busy='+s.busy+' hist='+hist.join(' | ')+' '+await p.evaluate(()=>JSON.stringify({pop:PH.pop,pd:PH.pd,sp:G.sp,order:G.order,ships:G.ships.map(s=>[s.x,s.y,s.e,s.alive]),pp:$('#ppop').hidden,help:GXH.state()})));await p.screenshot({path:'/tmp/claude-0/stuck_'+W+'_'+gi+'.png'}).catch(()=>{});break}
    if(!rot&&s.turn>=3&&s.ph){rot=true;totals.rot++;await p.setViewportSize({width:H,height:W});await p.evaluate(()=>{dispatchEvent(new Event('resize'));dispatchEvent(new Event('orientationchange'))});await sleep(900*SLOW);await checks('rotated');await p.setViewportSize({width:W,height:H});await p.evaluate(()=>{dispatchEvent(new Event('resize'));dispatchEvent(new Event('orientationchange'))});await sleep(900*SLOW);await checks('rotated back');continue}
    // cards: Sunk! / wake roll
    if(s.pc==='sunk'){if(!(await tapSel('#pc [data-a=sunkok]')))await sleep(100);continue}
    if(s.pc==='mph'){if(Math.random()<.5){await tapSel('#pc [data-ph=dismiss]')}else await sleep(150);continue}
    if(s.pc==='over'){await sleep(200);continue}
    if(s.busy||!s.ph){if(i%9===0&&s.busy)await tapSel('#ps [data-a=skip]');await sleep(90);continue}
    totals.phases[s.ph]=(totals.phases[s.ph]||0)+1;HH('i'+i,s.ph,s.pop||'-');
    if(await helpFlow(s)){lastT=Date.now();continue}
    if(i%4===0)await checks(s.ph);
    const before=s.sig;
    switch(s.ph){
      case 'start':{
        const pips=await p.evaluate(()=>[...document.querySelectorAll('.opip')].map(e=>{const r=e.getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2]}).filter(c=>c[0]>0&&c[1]>0&&c[0]<innerWidth&&c[1]<innerHeight));
        if(!pips.length){note(tag,'start: no gold marks on screen');await sleep(300);break}
        const c=pips[Math.floor(Math.random()*pips.length)];HH('tap pip',Math.round(c[0]),Math.round(c[1]),'of',pips.length);await tapAt(...c);await sleep(250);
        const b=await p.evaluate(()=>[...document.querySelectorAll('#ppop [data-a=startmark]')].map(e=>{const r=e.getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2]}));
        HH('popup buttons',b.length);if(!b.length){dead++;note(tag,'tap on a gold mark opened no start pop-up');break}
        await tapAt(...b[Math.floor(Math.random()*b.length)]);if(!(await responded(before))){dead++;note(tag,'dead tap on the start mark button')}break}
      case 'lay':await layTurn(s);break;
      case 'nolay':{
        const specials=await p.evaluate(()=>[...document.querySelectorAll('#ps [data-a=cannon],#ps [data-a=gate]')].length);
        if(specials&&Math.random()<.5){await tapSel('#ps [data-a=cannon]||#ps [data-a=gate]');await sleep(250);break}
        if(!(await tapSel('#ps [data-a=pass]||[data-a=pass]'))){note(tag,'nothing to lay and no Pass button');await sleep(300)}else if(!(await responded(before))){dead++;note(tag,'dead tap on Pass')}break}
      default:{ // a question card: tap one of its option buttons
        const opts=await p.evaluate(()=>{const l=[...document.querySelectorAll('#pc [data-a=q]')];const e=l[Math.floor(Math.random()*l.length)];if(!e)return [];e.scrollIntoView({block:'nearest'});const r=e.getBoundingClientRect();return r.width?[[r.left+r.width/2,r.top+r.height/2]]:[]});
        if(!opts.length){note(tag,'question '+s.q+' has no option buttons on screen');await sleep(300);break}
        await tapAt(...opts[Math.floor(Math.random()*opts.length)]);if(!(await responded(before))){dead++;note(tag,'dead tap on a '+s.q+' option')}}
    }
  }
  await sleep(1200);
  const fin=await p.evaluate(()=>({over:!!G.over,alive:G.ships.filter(s=>s.alive).length}));
  if(!fin.over)note(tag,'game did not finish');
  {const hst=await p.evaluate(()=>GXH.state());const dup=hst.shown.filter((x,i)=>hst.shown.indexOf(x)!==i);if(dup.length)note(tag,'bubble shown twice: '+dup.join());
   if(!tipsOn){totals.tipsOffGames++;if(hst.shown.length)note(tag,'tips off but bubbles shown: '+hst.shown.join())}}
  totals.games++;
  await ctx.close();
  return {taps,dead,secs:Math.round((Date.now()-t0)/1000)}}

// every phase has a step (title <= 4 words, text <= 20) and 2-4 rules cards (<= 20 words, a picture), plus 2+ general cards
async function staticCheck(b){const ctx=await b.newContext({viewport:{width:390,height:763},isMobile:true,hasTouch:true});
  await ctx.route('**/*',r=>new URL(r.request().url()).host==='gns.test'?r.fulfill({status:200,contentType:'text/html',body:html}):r.abort());
  const p=await ctx.newPage();await p.goto('https://gns.test/?phone=1&2d',{timeout:90000});await sleep(900);
  const R=await p.evaluate(()=>({steps:Object.entries(HLP_STEPS).map(([k,v])=>({k,t:v.title,x:v.text,pic:!!(v.pic&&v.pic())})),rules:HLP_RULES.map(r=>({ph:r.phase||null,t:r.title,x:r.text,pic:!!(r.pic&&r.pic())}))}));
  const phases=R.steps.map(s=>s.k);const sc={phases:phases.length,steps:R.steps.length,rules:R.rules.length};
  for(const s of R.steps){if(wc(s.t)>4)note('static','step '+s.k+' title over 4 words: '+s.t);if(wc(s.x)>20)note('static','step '+s.k+' text over 20 words: '+s.x);if(!s.pic)note('static','step '+s.k+' has no picture')}
  for(const ph of phases){const l=R.rules.filter(r=>r.ph===ph);if(l.length<2||l.length>4)note('static','phase '+ph+' has '+l.length+' rules cards (want 2-4)')}
  if(R.rules.filter(r=>!r.ph).length<2)note('static','fewer than 2 general rules cards');
  for(const r of R.rules){if(wc(r.x)>20)note('static','rules card over 20 words: '+r.t+': '+r.x);if(wc(r.t)>5)note('static','rules card title over 5 words: '+r.t);if(!r.pic)note('static','rules card without a picture: '+r.t)}
  const bad=R.rules.map(r=>r.ph).filter(ph=>ph&&!phases.includes(ph));if(bad.length)note('static','rules for unknown phases: '+bad.join());
  await ctx.close();return sc}
(async()=>{const b=await PW.chromium.launch({args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});const T=Date.now();
  const SC=await staticCheck(b);console.log('help kit: '+SC.phases+' phases, '+SC.steps+' coach steps, '+SC.rules+' rules cards');
  const jobs=[];for(const [W,H] of SIZES)for(let g=0;g<GAMES;g++)jobs.push([W,H,g]);
  let ji=0;const res=[];
  await Promise.all(Array.from({length:WORKERS},async()=>{while(ji<jobs.length){const j=jobs[ji++];try{const r=await playGame(b,...j);res.push(r);process.stdout.write('.')}catch(e){note(j[0]+'x'+j[1]+' g'+j[2],'CRASH '+String(e.message).split('\n')[0]);process.stdout.write('x')}}}));
  await b.close();
  console.log('\nhelp: bubbles '+JSON.stringify(totals.bubbles)+', bulb taps '+totals.bulbs+' ('+totals.bulbNull+' with no advice, '+totals.bulbFollowed+' followed), rules opened '+totals.rulesOpened+', tips-off games '+totals.tipsOffGames);
  console.log(totals.games+' games, '+totals.taps+' taps, decisions '+JSON.stringify(totals.phases)+', rotations '+totals.rot+', '+Math.round((Date.now()-T)/1000)+' s');
  console.log(probs.length?'PROBLEMS '+probs.length+'\n  '+probs.join('\n  '):'PROBLEMS 0');process.exit(probs.length?1:0)})();
