// Board-first layout check (Playwright): no page scroll, board fully visible and uncovered, dock shows pending decisions,
// every popup opens and closes (✕ and Esc), no console errors. Usage: PW=$(npm root -g)/playwright node board-test.js [outdir]
const {chromium}=require(process.env.PW);const out=process.argv[2]||'../shots';
const SIZES=[['1366x768',1366,768],['1920x1080',1920,1080],['768x1024',768,1024],['390x844',390,844],['1366x722-iframe',1366,722],['390x798-iframe',390,798]];
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});let fails=0;const rows=[];
for(const [name,W,H] of SIZES)for(const cs of ['light','dark']){if(cs==='dark'&&name.includes('iframe'))continue;
  const p=await b.newPage({viewport:{width:W,height:H},colorScheme:cs,hasTouch:W<700,isMobile:false});const errs=[],bad=[];
  p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>m.type()==='error'&&!/ERR_|Failed to load|net::/.test(m.text())&&errs.push(m.text()));
  const tag=`${name}-${cs}`;const shot=async s=>{if(cs==='light'||/popup|choice/.test(s))await p.screenshot({path:`${out}/${tag}-${s}.png`})};
  const check=async(where,board=true)=>{const r=await p.evaluate(board=>{const de=document.documentElement;const o={sh:de.scrollHeight,sw:de.scrollWidth,ih:innerHeight,iw:innerWidth};
      const bd=document.querySelector('.gx-board').getBoundingClientRect();o.board=[bd.left,bd.top,bd.right,bd.bottom].map(Math.round);o.inside=bd.left>=0&&bd.top>=0&&bd.right<=innerWidth+.5&&bd.bottom<=innerHeight+.5&&bd.width>100&&bd.height>100;
      o.cover=[];if(board){for(let i=0;i<5;i++)for(let j=0;j<5;j++){const x=bd.left+bd.width*(i+.5)/5,y=bd.top+bd.height*(j+.5)/5;const e=document.elementFromPoint(x,y);if(!e||!e.closest('.gx-board'))o.cover.push([Math.round(x),Math.round(y),e?e.tagName+'.'+e.className:'none'])}}
      const dk=document.querySelector('.gx-dock').getBoundingClientRect();o.dock=[dk.left,dk.top,dk.right,dk.bottom].map(Math.round);o.overlap=!(dk.left>=bd.right-1||dk.top>=bd.bottom-1);
      return o},board);
    if(r.sh>r.ih||r.sw>r.iw)bad.push(`${where}: page scrolls ${r.sw}x${r.sh} > ${r.iw}x${r.ih}`);if(!r.inside)bad.push(`${where}: board outside viewport ${r.board}`);
    if(r.cover.length)bad.push(`${where}: board covered at ${JSON.stringify(r.cover.slice(0,3))}`);if(r.overlap)bad.push(`${where}: dock overlaps board ${r.dock} / ${r.board}`);return r};
  await p.goto('file://'+process.cwd()+'/doorkick.html');await p.evaluate(()=>{try{localStorage.clear()}catch(e){}});await p.reload();await p.waitForTimeout(300);
  const r0=await check('start',false);await shot('start');
  // the start dialog must fit
  const dl=await p.evaluate(()=>{const r=document.querySelector('#modal .dlg').getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight+.5});if(!dl)bad.push('start dialog does not fit');
  // rules from the start screen: popup over the start dialog, close with ✕
  await p.click('#modal [data-a="rules"]');await p.waitForTimeout(300);if(!await p.isVisible('#dkRules'))bad.push('rules popup did not open');await p.click('#dkRules .gx-x');await p.waitForTimeout(300);
  await p.evaluate(()=>{setSeed(21);AIDELAY=60});await p.click('#modal [data-start="F"]');await p.waitForTimeout(400);
  let r1=await check('game start');const heights=[r0.sh,r1.sh];let sawChoice=false,sawMid=false,clicks=0,popDone=false,turn0=await p.evaluate(()=>G.turn);
  for(let i=0;i<400&&clicks<40;i++){await p.waitForTimeout(90);
    const st=await p.evaluate(()=>({me:sideToAct()===0&&!G.winner,cb:!!G.cb,turn:G.turn,modal:!document.getElementById('modal').hidden,open:GX.open,win:!!G.winner}));
    if(st.win)break;if(st.modal||st.open)continue;
    if(!st.me){if(!sawMid&&i>3){await check('mid-turn');await shot('midturn');sawMid=true}continue}
    // a human decision is pending: the dock must be visible and show buttons
    const dv=await p.evaluate(()=>{const d=document.querySelector('.gx-dock');const r=d.getBoundingClientRect();const btn=d.querySelector('#prompt [data-mv],#prompt .asks');const br=btn&&btn.getBoundingClientRect();return getComputedStyle(d).visibility!=='hidden'&&r.width>100&&r.height>40&&(!document.querySelector('.gx-app').classList.contains('gx-dock-min'))});
    if(!dv)bad.push('dock hidden while a decision is pending');
    if(!sawChoice&&(st.cb||clicks>2)){await p.waitForTimeout(600);await check('choice');await shot('choice');sawChoice=true}
    if(!popDone&&clicks>=2){popDone=true;
      // every popup: open, check it fits, close with ✕; open again, close with Esc
      const pops=[['dkLog','[data-gx="dkLog"]'],['dkOpp','.opps .opp'],['dkRules','.gx-bar [data-gx="dkRules"]'],['dkCard','.hand [data-card]']];
      for(const [id,sel] of pops){for(const how of ['x','esc']){const el=await p.$(sel);if(!el){bad.push('no opener for '+id);continue}await el.click();await p.waitForFunction(id=>{const d=document.getElementById(id);return d&&d.classList.contains('on')&&getComputedStyle(d).transform==='none'},id,{timeout:10000}).catch(()=>{});await p.waitForTimeout(60);
        const vis=await p.evaluate(id=>{const d=document.getElementById(id);const r=d.getBoundingClientRect();return {r:[r.left,r.top,r.right,r.bottom].map(Math.round).join(','),on:d.classList.contains('on'),fit:r.top>=0&&r.left>=-1&&r.right<=innerWidth+1&&r.bottom<=innerHeight+1,sh:document.documentElement.scrollHeight<=innerHeight}},id);
        if(!vis.on)bad.push(id+' did not open');if(!vis.fit)bad.push(id+' does not fit '+vis.r);if(!vis.sh)bad.push(id+' makes the page scroll');
        if(how==='x'&&id!=='dkRules')await shot('popup-'+id);
        if(how==='x')await p.click(`#${id} .gx-x`);else await p.keyboard.press('Escape');await p.waitForTimeout(320);
        const closed=await p.evaluate(id=>!document.getElementById(id).classList.contains('on')&&!document.querySelector('.gx-scrim.on'),id);if(!closed)bad.push(id+' did not close with '+how)}}
      // collapse and reopen the dock
      await p.click('.gx-dock-head [data-gx="dock"]');await p.waitForTimeout(250);await check('dock collapsed');await shot('dockmin');
      if(W>=1000)await p.click('.gx-reopen');else await p.click('.gx-dock-head [data-gx="dock"]');await p.waitForTimeout(250);
      if(await p.evaluate(()=>document.querySelector('.gx-app').classList.contains('gx-dock-min')))bad.push('dock did not reopen');
      continue}
    // play through the real buttons: mostly the main action, sometimes a playable card
    const card=await p.$('.mine [data-card].play');const btns=await p.$$('#prompt [data-mv]:not(:disabled)');
    // board-first: a click picks the card up and lights its targets (tap one); the computer may re-render the board meanwhile
    if(card&&Math.random()<.3){await card.click({timeout:3000}).catch(()=>{});await p.waitForTimeout(250);const tg=await p.$('[data-bfz]');
      if(tg)await tg.click({timeout:3000}).catch(()=>{});else{const mv=await p.$('#dkCard.on [data-mv]');if(mv)await mv.click({timeout:3000}).catch(()=>{});else if(await p.$('#dkCard.on'))await p.click('#dkCard .gx-x').catch(()=>{})}}
    else if(btns.length){await btns[0].click({timeout:3000}).catch(()=>{})}clicks++;
    await p.waitForTimeout(120);const r=await check('turn '+st.turn);heights.push(r.sh)}
  const turns=await p.evaluate(t=>G.turn-t,turn0);if(turns<2)bad.push('only '+turns+' turns played');
  await shot('end');
  if(errs.length)bad.push('console errors: '+errs.slice(0,3).join(' | '));fails+=bad.length;
  rows.push(`${tag}: max page height ${Math.max(...heights)} / viewport ${H}, turns ${turns}, clicks ${clicks}, choice ${sawChoice}, popups ${popDone} -> ${bad.length?'FAIL '+[...new Set(bad)].slice(0,6).join('; '):'ok'}`);console.log(rows[rows.length-1]);await p.close()}
await b.close();console.log(fails?'FAILURES '+fails:'ALL OK')})()
