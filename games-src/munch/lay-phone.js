require('../phfit.js').guard(null);
// Phone layout test for Doorkick Dungeon (Playwright, plain Chromium, isMobile + hasTouch).
// Usage: PW=/opt/node22/lib/node_modules/playwright node lay-phone.js [W H] [query]   (no W H = all four phone sizes)
// A full human turn is played ONLY by touch taps (page.touchscreen.tap at element centres, after an elementFromPoint hit test).
const {chromium}=require(process.env.PW||'/opt/node22/lib/node_modules/playwright');
const fs=require('fs');const OUT=process.env.OUT||'shots';fs.mkdirSync(OUT,{recursive:true});
const SIZES=process.env.SIZES?process.env.SIZES.split(',').map(s=>s.split('x').map(Number)):process.argv[2]?[[+process.argv[2],+process.argv[3]]]:[[390,844],[844,390],[360,740],[740,360]];
const QUERY=process.argv[4]||'';const FILE=process.env.FILE||'doorkick.html';
const MODE=process.env.MODE||'F';
(async()=>{const b=await chromium.launch();let total=0;
for(const [W,H] of SIZES){const land=W>H,short=Math.min(W,H);
  const p=await b.newPage({viewport:{width:W,height:H},isMobile:true,hasTouch:true,deviceScaleFactor:1});
  const errs=[],bad=[];const tag=`${W}x${H}`;const stats={minTap:1e9,minTapName:'',minFont:99,minFontName:'',turns:0,taps:0,popups:0};
  p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>m.type()==='error'&&!/ERR_|Failed to load|net::/.test(m.text())&&errs.push(m.text()));
  const B=(m)=>{if(!bad.includes(m))bad.push(m)};
  await p.goto('file://'+process.cwd()+'/'+FILE+QUERY);await p.evaluate(()=>{try{localStorage.clear()}catch(e){}});await p.goto('file://'+process.cwd()+'/'+FILE+QUERY);await p.waitForTimeout(400);
  if(!QUERY.includes('phone=0')&&!await p.evaluate(()=>document.documentElement.classList.contains('ph')))B('ph class not set');
  const FIT=require('../phfit.js');const shot=async s=>{(await FIT.run(p)).forEach(m=>B('FIT '+s+': '+m));return p.screenshot({path:`${OUT}/P_${tag}_${s}.png`})};
  // ---- generic probes ----
  const noScroll=async w=>{const r=await p.evaluate(()=>{const d=document.documentElement;const dr=[...document.querySelectorAll('.gx-drawer')].filter(x=>x.classList.contains('on')).map(x=>x.scrollWidth>x.clientWidth+1?x.id:'' ).filter(Boolean);return {sh:d.scrollHeight,sw:d.scrollWidth,ih:innerHeight,iw:innerWidth,bs:document.body.scrollHeight,dr}});
    if(r.sh>r.ih||r.sw>r.iw||r.bs>r.ih)B(`${w}: page scrolls ${r.sw}x${r.sh} > ${r.iw}x${r.ih}`);if(r.dr.length)B(`${w}: horizontal overflow in ${r.dr}`)};
  const rect=async sel=>p.evaluate(s=>{const e=document.querySelector(s);if(!e)return null;const r=e.getBoundingClientRect();return {l:r.left,t:r.top,r:r.right,b:r.bottom,w:r.width,h:r.height}},sel);
  // tap targets: every visible interactive element must be >= 44 in both directions (hand cards: visible slice)
  const targets=async w=>{const r=await p.evaluate(()=>{const out=[];const vis=e=>{const r=e.getBoundingClientRect();const cs=getComputedStyle(e);return r.width>1&&r.height>1&&cs.visibility!=='hidden'&&cs.display!=='none'&&r.bottom>0&&r.right>0&&r.left<innerWidth&&r.top<innerHeight};
      const open=document.querySelector('.gx-drawer.on');const modal=!document.getElementById('modal').hidden;
      const hostOK=e=>{if(modal)return !!e.closest('#modal');if(open)return !!e.closest('.gx-drawer.on')||!!e.closest('.gx-scrim');return !e.closest('.gx-drawer')&&!e.closest('#modal')};
      const hand=[...document.querySelectorAll('.hand .card')];
      for(const e of document.querySelectorAll('button,[data-a],[data-mv],[data-card],[data-opp],[data-gx],[data-set],[data-start],[role=button]')){if(!vis(e)||!hostOK(e))continue;if(e.closest('.gx-scrim'))continue;if(e.classList.contains('gx-grab')||e.classList.contains('vs'))continue;
        const r=e.getBoundingClientRect();let w=r.width,h=r.height;
        if(e.matches('.hand .card')){const i=hand.indexOf(e);const nx=hand[i+1];if(nx){const nr=nx.getBoundingClientRect();w=Math.min(w,nr.left-r.left)}}
        if(e.closest('.arena,.pile')&&e.matches('.card'))continue; // table cards: info only (tap = zoom pop-up), not a decision target
        if(e.matches('.card.xs')&&e.closest('.zoom,.tableau'))continue;
        out.push({n:(e.tagName+'.'+String(e.className).split(' ').slice(0,2).join('.')+' '+(e.getAttribute('aria-label')||e.textContent||'').trim().slice(0,18)),w:Math.round(w),h:Math.round(h)})}
      return out});
    for(const t of r){const m=Math.min(t.w,t.h);if(m<stats.minTap){stats.minTap=m;stats.minTapName=t.n}if(t.w<44||t.h<44)B(`${w}: tap target ${t.w}x${t.h} ${t.n}`)}};
  // text >= 13px in the open pop-up / chips / dock (card faces on the table excluded, inside the pop-up included)
  const fonts=async(sel,w)=>{const r=await p.evaluate(sel=>{const out=[];for(const root of document.querySelectorAll(sel)){const wk=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let n;while(n=wk.nextNode()){if(!n.textContent.trim())continue;const e=n.parentElement;const cs=getComputedStyle(e);if(cs.display==='none'||cs.visibility==='hidden')continue;const r=e.getBoundingClientRect();if(r.width<1||r.height<1)continue;if(e.closest('.sr,.card .meta,.tag small'))continue;out.push([parseFloat(cs.fontSize),n.textContent.trim().slice(0,22),e.className])}}return out},sel);
    for(const [f,t,c] of r){if(f<stats.minFont){stats.minFont=f;stats.minFontName=t}if(f<12.99)B(`${w}: text ${f}px "${t}" (${c})`)}};
  const hit=async(sel,w,inside)=>{ // centre of el hit-tests to el
    return p.evaluate(([s,inside])=>{const e=document.querySelector(s);if(!e)return 'missing';const r=e.getBoundingClientRect();const x=r.left+r.width/2,y=r.top+r.height/2;const t=document.elementFromPoint(x,y);return t&&(e===t||e.contains(t))?'':(t?t.tagName+'.'+t.className:'none')},[sel,inside])};
  const boardCheck=async w=>{ // the table: inside viewport, hit-testable, big enough
    const r=await p.evaluate(()=>{const t=document.querySelector('.table');const b=t.getBoundingClientRect();const f=document.querySelector('.felt').getBoundingClientRect();const pts=[];for(let i=0;i<5;i++)for(let j=0;j<5;j++){const x=f.left+f.width*(i+.5)/5,y=f.top+f.height*(j+.5)/5;const e=document.elementFromPoint(x,y);if(!e||!e.closest('.felt'))pts.push([Math.round(x),Math.round(y),e?e.tagName+'.'+e.className:'none'])}
      const mk=document.querySelector('.arena .mon .card');const mr=mk?mk.getBoundingClientRect():null;
      return {t:[b.left,b.top,b.right,b.bottom].map(Math.round),inside:b.left>=-.5&&b.top>=-.5&&b.right<=innerWidth+.5&&b.bottom<=innerHeight+.5,pts,w:b.width,h:b.height,mon:mr&&[mr.left,mr.top,mr.right,mr.bottom].map(Math.round)}});
    if(!r.inside)B(`${w}: table outside viewport ${r.t}`);if(r.pts.length)B(`${w}: table covered at ${JSON.stringify(r.pts.slice(0,2))}`);
    return r};
  const tapAt=async(sel,w,opts)=>{ // hit test then real touch tap at the centre
    const el=await p.$(sel);if(!el){B(`${w}: ${sel} missing`);return false}
    await el.scrollIntoViewIfNeeded().catch(()=>{});const bb=await el.boundingBox();if(!bb){B(`${w}: ${sel} no box`);return false}
    const x=bb.x+bb.width/2,y=bb.y+bb.height/2;const h=await p.evaluate(([x,y,s])=>{const e=document.querySelector(s);const t=document.elementFromPoint(x,y);return t&&(e===t||e.contains(t))?'':(t?t.tagName+'.'+t.className:'none')},[x,y,sel]);if(h)B(`${w}: ${sel} not hit-testable (covered by ${h})`);
    await p.touchscreen.tap(x,y);stats.taps++;await p.waitForTimeout(opts&&opts.wait||140);return true};
  // ---- start screen ----
  await noScroll('start');const dl=await p.evaluate(()=>{const e=document.querySelector('#modal .dlg');if(!e)return false;const r=e.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight+.5&&r.left>=0&&r.right<=innerWidth+.5});if(!dl)B('start dialog does not fit');
  await fonts('#modal .dlg','start');await targets('start');await shot('0start');
  await p.evaluate(()=>{setSeed(21);AIDELAY=40;ANIM=0});
  if(MODE!=='F'){await tapAt(`#modal [data-set="mode"][data-v="${MODE}"]`,'mode')}
  await tapAt(`#modal [data-start="${MODE}"]`,'start game');await p.waitForTimeout(500);
  await noScroll('game start');
  // ---- play: human decisions through taps only ----
  let did={popup:false,rival:false,fight:false,ask:false,esc:false,outside:false,x:false},turn0=await p.evaluate(()=>G.turn),humanTurns=new Set(),lastSig='',stall=0,sawFight=false;
  const state=()=>p.evaluate(()=>({me:typeof sideToAct==='function'&&sideToAct()===viewSeat()&&!G.winner&&P(viewSeat()).human,win:!!G.winner,turn:G.turn,ph:G.phase,cb:!!G.cb,q:G.q&&G.q.kind,modal:!document.getElementById('modal').hidden,open:GX.open,pass:UI.pass}));
  const popupChecks=async(id,w)=>{const t=await rect('.table');const d=await rect('#'+id);if(!d){B(`${w}: #${id} missing`);return}
    const vis=await p.evaluate(id=>{const d=document.getElementById(id);const r=d.getBoundingClientRect();return d.classList.contains('on')&&getComputedStyle(d).visibility==='visible'&&r.left>=-1&&r.right<=innerWidth+1&&r.top>=-1&&r.bottom<=innerHeight+1},id);
    if(!vis)B(`${w}: #${id} not fully on screen (${JSON.stringify(d)})`);
    if(!land){if(d.t<t.b-2)B(`${w}: #${id} overlaps the table (top ${Math.round(d.t)} < table bottom ${Math.round(t.b)})`)}
    else{ // landscape: must not cover the fight card, the piles or the totals
      const cov=await p.evaluate(id=>{const d=document.getElementById(id).getBoundingClientRect();const o=[];for(const e of document.querySelectorAll('.arena .card,.arena .score,.arena .vsx,.pile .stack')){const r=e.getBoundingClientRect();if(r.width>0&&r.right>d.left+2&&r.left<d.right&&r.bottom>d.top&&r.top<d.bottom)o.push(e.className.toString().slice(0,20))}return o},id);
      if(cov.length)B(`${w}: #${id} covers the table items ${cov.slice(0,3)}`)}
    await noScroll(w);await fonts('#'+id+' .gx-drawer-body, #'+id+' .gx-drawer-head',w);await targets(w)};
  for(let i=0;i<500&&humanTurns.size<3&&stats.taps<200;i++){
    const s=await state();if(s.win)break;
    const sig=JSON.stringify([s.turn,s.ph,s.q,s.cb,s.me]);if(sig===lastSig)stall++;else{stall=0;lastSig=sig}
    if(stall>150){B(`stall at turn ${s.turn} phase ${s.ph} q ${s.q} me ${s.me}`);break}
    if(s.modal){const btn=await p.$('#modal button[data-a="iam"],#modal [data-a="new"]');if(btn&&s.pass!=null)await tapAt('#modal [data-a="iam"]','pass');else await p.waitForTimeout(100);continue}
    if(s.open&&!['dkCard','dkOpp'].includes(s.open)){await p.keyboard.press('Escape');continue}
    if(!s.me){await p.waitForTimeout(60);continue}
    // a human decision is pending
    humanTurns.add(s.turn);
    await p.waitForTimeout(80);
    const bc=await boardCheck(`turn ${s.turn} ${s.ph}`);await noScroll(`turn ${s.turn} ${s.ph}`);await targets(`turn ${s.turn} ${s.ph}`);await fonts('#phopps,#prompt,#phchip',`dock ${s.ph}`);
    if(s.ph==='combat'&&s.cb&&!sawFight){sawFight=true;
      const vs=await p.evaluate(()=>{const v=document.querySelector('.arena .vs');if(!v)return null;const f=document.querySelector('.felt').getBoundingClientRect();const sc=[...v.querySelectorAll('.score')];const nums=sc.map(n=>n.querySelector('.num').textContent);return {inside:sc.every(n=>{const r=n.getBoundingClientRect();return r.width>0&&r.left>=f.left-1&&r.right<=f.right+1&&r.top>=f.top-1&&r.bottom<=f.bottom+1}),nums}});
      if(!vs)B('fight: no .vs card');else{if(!vs.inside)B('fight: totals outside the felt');if(vs.nums.length!==2)B('fight: expected two totals, got '+vs.nums)}
      await shot(`3fight_t${s.turn}`);
      // monster card -> zoom pop-up (readable)
      if(await p.$('.arena .mon .card')){await tapAt('.arena .mon .card','fight monster tap');await p.waitForTimeout(350);if(await p.evaluate(()=>GX.open==='dkCard')){await popupChecks('dkCard','monster pop-up');await shot('4monster');await tapAt('#dkCard .gx-x','close monster pop-up');await p.waitForTimeout(300)}else B('monster tap did not open the card pop-up')}}
    // rival chip -> info pop-up (once), close with outside tap
    if(!did.rival&&await p.$('#phopps button[data-opp]')){did.rival=true;await tapAt('#phopps button[data-opp]','rival chip');await p.waitForTimeout(400);
      if(await p.evaluate(()=>GX.open==='dkOpp')){await popupChecks('dkOpp','rival pop-up');await shot('5rival');
        // tap outside (on the scrim, over the table) closes it
        const tb=await rect('.table');await p.touchscreen.tap(tb.l+14,tb.t+14);await p.waitForTimeout(350);if(await p.evaluate(()=>GX.open))B('rival pop-up did not close on outside tap');else did.outside=true}else B('rival chip did not open the pop-up')}
    // hand card -> pop-up with buttons (once per size at a playable card; Esc / x / outside)
    const cards=await p.$$('.hand .card.play');
    if(!did.popup&&cards.length){did.popup=true;const id=await cards[0].getAttribute('data-card');
      await tapAt(`.hand .card[data-card="${id}"]`,'hand card');await p.waitForTimeout(400);
      if(await p.evaluate(()=>GX.open==='dkCard')){stats.popups++;await popupChecks('dkCard','card pop-up');await shot(`2cardpopup`);
        const nb=await p.$$('#dkCard .opts button');if(!nb.length)B('card pop-up has no buttons');
        await p.keyboard.press('Escape');await p.waitForTimeout(350);if(await p.evaluate(()=>GX.open))B('card pop-up did not close on Esc');else did.esc=true;
        await tapAt(`.hand .card[data-card="${id}"]`,'hand card again');await p.waitForTimeout(350);
        await tapAt('#dkCard .gx-x','close x');await p.waitForTimeout(350);if(await p.evaluate(()=>GX.open))B('x did not close');else did.x=true}
      else B('hand card tap did not open the pop-up');continue}
    if(s.open){await p.keyboard.press('Escape');continue}
    if(did.popup&&!did.cardplay&&cards.length&&Math.random()<.5){did.cardplay=true;const id=await cards[0].getAttribute('data-card');await tapAt(`.hand .card[data-card="${id}"]`,'hand card to play');await p.waitForTimeout(350);const ob=await p.$('#dkCard .opts button');if(ob){await tapAt('#dkCard .opts button','popup action')}else await p.keyboard.press('Escape');continue}
    // ask for help menu once
    if(!did.ask&&await p.$('#prompt [data-a="askmenu"]')&&Math.random()<.7){did.ask=true;await tapAt('#prompt [data-a="askmenu"]','ask');await p.waitForTimeout(900);
      const ar=await p.evaluate(()=>{const a=document.querySelector('#prompt .asks');if(!a)return null;const r=a.getBoundingClientRect();const t=document.querySelector('.table').getBoundingClientRect();return {t:r.top,b:r.bottom,l:r.left,r:r.right,tb:t.bottom,tr:t.right,ih:innerHeight,iw:innerWidth,v:getComputedStyle(document.documentElement).getPropertyValue('--ph-tb')}});
      if(!ar)B('ask menu missing');else{if(ar.b>ar.ih+1||ar.r>ar.iw+1)B('ask menu off screen');if(!land&&ar.t<ar.tb-2)B('ask menu covers the table '+JSON.stringify(ar));await targets('ask');await fonts('#prompt .asks','ask');await shot('6ask')}
      const cancel=await p.$('#prompt .asks [data-a="close"]');if(cancel)await tapAt('#prompt .asks [data-a="close"]','ask cancel');continue}
    // main action: first enabled big button (prefer fight / kick / ready / loot / end), else a card
    const pick=await p.evaluate(()=>{const bs=[...document.querySelectorAll('#prompt .acts button:not(:disabled)')];const pref=['fight','kick','ready','loot','end','pass','run'];
      const key=b=>{if(b.dataset.mv){try{return JSON.parse(b.dataset.mv).act}catch(e){return ''}}return b.dataset.a||''};
      for(const k of pref){const b=bs.find(x=>key(x)===k);if(b){b.setAttribute('data-ph-pick','1');return k}}const b=bs[0];if(b){b.setAttribute('data-ph-pick','1');return key(b)}return ''});
    if(pick){await tapAt('#prompt [data-ph-pick="1"]','action '+pick);await p.evaluate(()=>document.querySelectorAll('[data-ph-pick]').forEach(e=>e.removeAttribute('data-ph-pick')));continue}
    // charity / pick: tap a hand card then its first popup button
    const c2=await p.$('.hand .card');if(c2){const id=await c2.getAttribute('data-card');await tapAt(`.hand .card[data-card="${id}"]`,'hand card (forced)');await p.waitForTimeout(250);const ob=await p.$('#dkCard.on .opts button');if(ob)await tapAt('#dkCard.on .opts button','forced action');else if(await p.evaluate(()=>GX.open))await p.keyboard.press('Escape')}
    else await p.waitForTimeout(100)}
  if(humanTurns.size<2)B(`only ${humanTurns.size} human turns played by taps`);
  if(!did.popup)B('never saw a playable card for the pop-up test');
  if(!sawFight)B('no fight reached');
  await noScroll('end');await shot('9end');
  const fin=await p.evaluate(()=>({t:G.turn}));
  if(errs.length)B('console errors: '+errs.slice(0,3).join(' | '));
  const tb=await rect('.table');const bd=await rect('.gx-board');
  console.log(`${tag}: table ${Math.round(tb.w)}x${Math.round(tb.h)}  board ${Math.round(bd.w)}x${Math.round(bd.h)}  ratio(board side/short)=${(Math.max(tb.w,tb.h)/short).toFixed(2)}  minTap ${stats.minTap} (${stats.minTapName}) minFont ${stats.minFont} (${stats.minFontName}) human turns ${humanTurns.size} taps ${stats.taps} did ${JSON.stringify(did)}`);
  console.log(`${tag}: PROBLEMS ${bad.length}${bad.length?'\n  - '+bad.slice(0,14).join('\n  - '):''}`);total+=bad.length;await p.close()}
await b.close();console.log(total?'FAILURES '+total:'ALL OK')})()
