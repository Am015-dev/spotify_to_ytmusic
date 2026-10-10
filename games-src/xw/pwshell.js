// Board-first layout check: PW=$(npm root -g)/playwright node pwshell.js [sizes like 1366x768,390x844]
// (reduced motion is emulated: headless Chromium with a busy WebGL loop does not advance CSS transitions, so the popup slide-in would never finish there)
// At each size: start screen, squad builder popup, a game vs the computer through the real buttons (asteroid placement incl. a tap on the mat,
// dials, actions, attacks), every popup opened and closed (✕ and Esc), dock collapse; asserts no page scroll, board inside the viewport and
// not covered (5x5 elementFromPoint grid), dock visible when a human decision is pending, no console errors. Screenshots in shots/.
const {chromium}=require(process.env.PW||require('child_process').execSync('npm root -g').toString().trim()+'/playwright');const path=require('path');const fs=require('fs');
const SIZES=(process.argv[2]||'1366x768,1920x1080,768x1024,390x844,1366x722').split(',').map(s=>s.split('x').map(Number));
fs.mkdirSync('shots',{recursive:true});
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});const report=[];let totalBad=0;
for(const [W,H] of SIZES){const tag=W+'x'+H;const touch=W<1000;const ctx=await b.newContext({viewport:{width:W,height:H},isMobile:W<500,hasTouch:touch,deviceScaleFactor:1,reducedMotion:'reduce'});ctx.setDefaultTimeout(+process.env.PWT||120000);const p=await ctx.newPage();
  const errs=[],fails=[];const bad=m=>{if(fails.length<25)fails.push(m)};
  p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/ERR_CERT|Failed to load|fonts\.g/.test(m.text()))errs.push(m.text())});
  await p.addInitScript(()=>{localStorage.clear();localStorage.setItem('na_tour','1')});await p.goto('file://'+path.resolve('nebula.html'));await p.waitForTimeout(900);
  const maxH={v:0};
  // ---- layout assertions ----
  async function check(where,{board=true,pending=false}={}){const r=await p.evaluate(({board})=>{const de=document.documentElement;const o={sh:de.scrollHeight,sw:de.scrollWidth,ih:innerHeight,iw:innerWidth};
      if(board){const bd=document.querySelector('.gx-board');const cv=document.body.classList.contains('flat')?document.getElementById('map'):document.getElementById('c3');const r=cv.getBoundingClientRect(),br=bd.getBoundingClientRect();
        o.cv=[r.left,r.top,r.width,r.height].map(Math.round);o.bd=[br.left,br.top,br.width,br.height].map(Math.round);o.inside=r.left>=-.5&&r.top>=-.5&&r.right<=innerWidth+.5&&r.bottom<=innerHeight+.5;o.fills=Math.abs(r.width-br.width)<2&&Math.abs(r.height-br.height)<2;
        o.hits=[];const modal=!document.getElementById('modal').classList.contains('hidden')||document.querySelector('.gx-drawer.on');
        if(!modal)for(let i=0;i<5;i++)for(let j=0;j<5;j++){const x=r.left+r.width*(i+.5)/5,y=r.top+r.height*(j+.5)/5;const e=document.elementFromPoint(x,y);
          const ok=e===cv||(e&&e.closest&&e.closest('.tag,.pop,.viewbar,svg#map'));if(!ok)o.hits.push(Math.round(x)+','+Math.round(y)+':'+(e?(e.id||e.className||e.tagName):'none'))}
        // whole mat projected inside the canvas
        if(window.V3&&V3.on){const T=THREE;let a=1e9,b=-1e9,c=1e9,d=-1e9;for(const x of [0,91.4])for(const z of [0,91.4]){const q=new T.Vector3(x,0,z).project(V3.camera);a=Math.min(a,q.x);b=Math.max(b,q.x);c=Math.min(c,q.y);d=Math.max(d,q.y)}
          o.mat=[a,b,c,d].map(v=>+v.toFixed(3));o.matIn=a>=-1&&b<=1&&c>=-1&&d<=1;o.matFill=+Math.max((b-a)/2,(d-c)/2).toFixed(2)}}
      const dock=document.querySelector('.gx-dock');const dr=dock.getBoundingClientRect();o.dockVis=getComputedStyle(dock).visibility!=='hidden'&&dr.width>50&&dr.height>60&&!document.querySelector('.gx-app').classList.contains('gx-dock-min');
      const btn=[...document.querySelectorAll('#prompt button:not([disabled])')];o.btnIn=btn.length?btn.some(x=>{const q=x.getBoundingClientRect();return q.height>0&&q.top>=dr.top-1&&q.bottom<=innerHeight+1}):true;return o},{board});
    maxH.v=Math.max(maxH.v,r.sh);
    if(r.sh>r.ih||r.sw>r.iw)bad(`${where}: page scrolls ${r.sw}x${r.sh} > ${r.iw}x${r.ih}`);
    if(board){if(!r.inside)bad(`${where}: canvas outside viewport ${r.cv}`);if(!r.fills)bad(`${where}: canvas ${r.cv} does not fill board ${r.bd}`);if(r.hits.length)bad(`${where}: board covered at ${r.hits.slice(0,4).join(' ')}`);if(r.mat&&!r.matIn)bad(`${where}: mat not fully in view ${r.mat}`)}
    if(pending&&!r.dockVis)bad(`${where}: decision pending but dock hidden`);if(pending&&!r.btnIn)bad(`${where}: no prompt button visible`);return r}
  const shot=n=>p.screenshot({path:`shots/${tag}_${n}.png`});
  // ---- start screen + squad builder popup ----
  await check('start',{board:true});await shot('1start');
  const dlgFits=async w=>{const f=await p.evaluate(()=>{const d=document.querySelector('#modal .dlg');if(!d)return true;const r=d.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight&&r.right<=innerWidth});if(!f)bad(w+': dialog does not fit')};await dlgFits('start');
  await p.click('[data-size="custom"]');await p.click('[data-a="build"][data-k="0"]');await p.waitForTimeout(350);
  if(!await p.isVisible('#d-build.on'))bad('builder popup not open');await p.click('[data-badd]');await p.waitForTimeout(100);await shot('2builder');await check('builder');
  await p.keyboard.press('Escape');await p.waitForTimeout(350);if(await p.isVisible('#d-build.on'))bad('builder not closed by Esc');if(!await p.isVisible('#modal .start'))bad('start screen not back after builder Esc');
  await p.click('[data-a="build"][data-k="0"]');await p.waitForTimeout(350);await p.click('#d-build .gx-x');await p.waitForTimeout(350);if(await p.isVisible('#d-build.on'))bad('builder not closed by ✕');
  await p.click('[data-a="build"][data-k="0"]');await p.waitForTimeout(300);await p.click('#d-build [data-a="bdone"]');await p.waitForTimeout(300);if(await p.isVisible('#d-build.on'))bad('builder not closed by Done');
  await p.click('[data-size="core"]');await p.click('#modal [data-a="rules"]');await p.waitForTimeout(200);await dlgFits('rules');await check('rules');await p.click('#modal [data-a="close"]');
  // ---- battle vs the computer ----
  await p.evaluate(()=>{AIDELAY=120});await p.click('[data-start="solo"]');await p.waitForTimeout(700);
  let shots={},matTap=false,popups=false,collapsed=false,dials=0;const t0=Date.now();
  while(Date.now()-t0<(+process.env.PWB||150000)){const st=await p.evaluate(()=>{if(!G)return {k:'nog'};if(G.winner)return {k:'win'};const ps=planSide();return {k:ps>=0?'plan':humanTurn()?G.phase:'wait',round:G.round,q:G.q&&G.q.key,kid:G.q&&G.q.kid,n:G.q&&G.q.opts.length}});
    if(st.k==='win'||st.round>=4)break;if(st.k==='wait'||st.k==='nog'){if(await p.isVisible('#prompt [data-a="hold"]')){await check(`r${st.round} guided pause`,{pending:true});await p.click('#prompt [data-a="hold"]')}await p.waitForTimeout(200);continue}
    await check(`r${st.round} ${st.k}${st.q?':'+st.q:''}`,{pending:true});
    if(st.k==='ask'&&st.q==='rock'){if(!shots.rock){await shot('3choice_rocks');shots.rock=1}
      if(!matTap){// tap the mat on an outlined spot
        const xy=await p.evaluate(()=>{const o=G.q.opts[Math.floor(G.q.opts.length/2)];const v=W(o.p.x,o.p.y).project(V3.camera);const r=V3.r.domElement.getBoundingClientRect();return [r.left+(v.x+1)/2*r.width,r.top+(1-v.y)/2*r.height]});
        await p.mouse.click(xy[0],xy[1]);await p.waitForTimeout(300);const kid=await p.evaluate(()=>G.q&&G.q.kid);if(kid===st.kid)bad('tap on the mat did not place the asteroid');matTap=true;continue}
      await p.click('#prompt .acts.grid button');continue}
    if(st.k==='ask'&&st.q==='deploy'&&!shots.deploy){await shot('3choice_deploy');shots.deploy=1}
    if(st.k==='plan'&&await p.isVisible('#prompt [data-a="nextround"]')){if(!shots.sum){await shot('4summary');shots.sum=1}
      // the roadmap explains a phase when tapped, and closes again
      await p.click('#steps [data-road="1"]');await p.waitForTimeout(80);if(!await p.isVisible('#steps .roadinfo'))bad('roadmap phase explanation not shown');await p.click('#steps [data-road="1"]');await p.waitForTimeout(80);if(await p.isVisible('#steps .roadinfo'))bad('roadmap explanation not closed');
      await p.click('#prompt [data-a="nextround"]');await p.waitForTimeout(150);if(await p.isVisible('#prompt [data-a="nextround"]'))bad('summary Continue did not start the next round');continue}
    if(st.k==='plan'){if(!shots.plan){await shot('4plan');shots.plan=1}
      if(!await p.isVisible('#steps .road .ph.on'))bad('roadmap has no current phase');if(!await p.isVisible('#queue .qc'))bad('turn order queue missing in planning')
      if(!popups){popups=true;// every popup: open with its toolbar button, close with ✕, reopen, close with Esc
        for(const id of ['d-squads','d-log']){await p.click(`[data-gx="${id}"]`);await p.waitForTimeout(350);if(!await p.isVisible(`#${id}.on`))bad(id+' not open');
          const ins=await p.evaluate(id=>{const r=document.getElementById(id).getBoundingClientRect();return r.top>=0&&r.left>=0&&r.bottom<=innerHeight+1&&r.right<=innerWidth+1},id);if(!ins)bad(id+' popup outside viewport');
          if(!shots[id]){await shot('5popup_'+id);shots[id]=1}await check('popup '+id);
          await p.click(`#${id} .gx-x`);await p.waitForTimeout(350);if(await p.isVisible(`#${id}.on`))bad(id+' not closed by ✕');
          await p.click(`[data-gx="${id}"]`);await p.waitForTimeout(350);await p.keyboard.press('Escape');await p.waitForTimeout(350);if(await p.isVisible(`#${id}.on`))bad(id+' not closed by Esc')}
        // "All" in the dock ship card opens the squads popup too
        if(await p.isVisible('#shipcard [data-gx="d-squads"]')){await p.click('#shipcard [data-gx="d-squads"]');await p.waitForTimeout(300);if(!await p.isVisible('#d-squads.on'))bad('ship card All does not open squads');await p.keyboard.press('Escape');await p.waitForTimeout(300)}
      }
      if(!collapsed){collapsed=true;const before=await p.evaluate(()=>GX.boardSize());
        if(W>=1000){await p.click('.gx-dock-head [data-gx="dock"]');await p.waitForTimeout(400);const after=await p.evaluate(()=>GX.boardSize());if(after.w<=before.w)bad('collapsing the dock did not widen the board');await check('dock collapsed',{});await shot('6dock_collapsed');await p.click('.gx-reopen');await p.waitForTimeout(400)}
        else{await p.click('.gx-grab');await p.waitForTimeout(400);await check('sheet full',{pending:true});await shot('6sheet_full');await p.click('.gx-grab');await p.waitForTimeout(400);await check('sheet min',{});await shot('6sheet_min');
          await p.click('.gx-grab');await p.waitForTimeout(400)}}
      // pick dials through the real dial buttons: a ship tab, a maneuver, then lock
      const tabs=await p.$$('#prompt .shipTabs [data-sel]');if(tabs.length&&dials%2===0){await tabs[tabs.length-1].click();await p.waitForTimeout(80)}
      const mv=await p.$$('#prompt [data-dial]');if(mv.length&&dials<3){await mv[Math.floor(mv.length/2)].click();dials++;await p.waitForTimeout(80)}
      await p.click('#prompt [data-a="autodial"]');await p.waitForTimeout(80);await p.click('#prompt [data-a="lock"]');await p.waitForTimeout(250);continue}
    // actions / attacks / questions: prefer firing, else the primary button, else the first
    const sel=await p.evaluate(()=>{const bs=[...document.querySelectorAll('#prompt button:not([disabled])')];const i=bs.findIndex(b=>b.dataset.act==='fire'&&b.dataset.w!=='skip');const j=bs.findIndex(b=>b.classList.contains('primary'));return i>=0?i:j>=0?j:0});
    if((st.k==='amod'||st.k==='dmod')&&!shots.dice){await shot('7dice');shots.dice=1}if(st.k==='action'&&!shots.act){await shot('7action');shots.act=1}
    const bs=await p.$$('#prompt button:not([disabled])');if(bs[sel]){await bs[sel].click();await p.waitForTimeout(150)}else await p.waitForTimeout(200)}
  await p.waitForTimeout(400);await check('end');await shot('8mid');
  const round=await p.evaluate(()=>G&&G.round);totalBad+=fails.length+errs.length;
  report.push(`${tag}: max page height ${maxH.v} (viewport ${H}) · board ${JSON.stringify(await p.evaluate(()=>GX.boardSize()))} · reached round ${round} · mat tap ${matTap?'ok':'not tried'} · fails ${fails.length} · console errors ${errs.length}`+(fails.length?'\n   '+fails.join('\n   '):'')+(errs.length?'\n   ERR '+errs.slice(0,4).join('\n   ERR '):''));
  await ctx.close()}
console.log(report.join('\n'));console.log(totalBad?'FAILED':'ALL OK');await b.close()})();
