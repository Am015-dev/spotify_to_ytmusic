// Proof shots: a real game vs the computer by MOUSE at 1366x768 and 1920x1080 (board in the middle, panels each side) and by touch at 375x667.
// Plays a few turns through the page (click a tile, click Place tile), checks every visible control is clickable and every visible text is >= 12 px,
// then saves proof/<size>.png.   node tools/pc-shots.js [sizes=1366x768,1920x1080,375x667]
const PW=(()=>{try{return require('playwright')}catch(e){return require('/opt/node-tools/node_modules/playwright')}})();
const gx=require('../../../scripts/gx-serve.js');const path=require('path');
const sizes=(process.argv[2]||'1366x768,1920x1080,375x667').split(',');const OUT=path.join(__dirname,'..','..','proof');
(async()=>{const url=await gx.url('tidewake',{file:path.join(__dirname,'..','tidewake.html')});
  const b=await PW.chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});let fail=0;
  for(const s of sizes){const [w,h]=s.split('x').map(Number),mob=w<800;
    const c=await b.newContext({viewport:{width:w,height:h},hasTouch:mob,isMobile:mob});const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
    await p.goto(url);await p.waitForTimeout(1200);await p.evaluate(()=>{localStorage.clear();localStorage.setItem('tw_played','1');localStorage.setItem('tw_offered','1')});await p.reload();await p.waitForTimeout(2500);
    await p.evaluate(()=>{try{GXH.setEnabled(false)}catch(e){}try{GX.close()}catch(e){}const st=defaultSetup();st.mode='me';st.np=3;st.variant=null;st.seats.forEach((x,i)=>{x.h=i===0;x.lv='easy'});setSeed(5);AIDELAY=60;startGame(JSON.parse(JSON.stringify(st)))});
    const at=async sel=>p.evaluate(sel=>{const e=[...document.querySelectorAll(sel)].find(e=>e.offsetWidth&&!e.closest('[hidden]')&&!e.disabled);if(!e)return null;const q=e.getBoundingClientRect();return [q.left+q.width/2,q.top+q.height/2]},sel);
    const tap=async sel=>{const r=await at(sel);if(!r)return false;if(mob)await p.touchscreen.tap(r[0],r[1]);else await p.mouse.click(r[0],r[1]);return true};
    let mine=0;const T0=Date.now();
    while(Date.now()-T0<90000&&mine<4){const st=await p.evaluate(()=>({over:!!G.over,phase:G.phase,busy:!!UI.busy,d:sideToAct(),q:!!(G.q&&G.q.who===0),pc:PH.cur&&PH.cur.kind}));
      if(st.over)break;if(st.pc==='sunk'){await tap('#pc [data-a=sunkok]');continue}
      if(st.busy||st.d!==0){if(!(await tap('#pc [data-ph=dismiss]')))await p.waitForTimeout(250);continue}
      if(st.q){await tap('#pc [data-a=q]');continue}
      if(st.phase==='setup'){await p.waitForTimeout(600);await tap('#ps [data-a=startmark]');await p.waitForTimeout(600);continue}
      await p.waitForTimeout(700);mine++;if(mine<4){await tap('#ps .pt:not(.sp)');await p.waitForTimeout(300);if(!(await tap('#ps [data-a=place]')))await tap('#ps [data-a=pass]');await p.waitForTimeout(600)}}
    await p.waitForTimeout(800);
    const chk=await p.evaluate(()=>{const bad=[],small=[];for(const e of document.querySelectorAll('#ps button,#pside button,.gx-bar button')){if(!e.offsetWidth||e.closest('[hidden]')||getComputedStyle(e).visibility==='hidden')continue;const r=e.getBoundingClientRect();const t=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);if(r.right>innerWidth+1||r.bottom>innerHeight+1||!(t===e||e.contains(t)))bad.push((e.textContent||e.getAttribute('aria-label')||'').trim().slice(0,16))}
      const tw=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;while(n=tw.nextNode()){const el=n.parentElement;if(!n.textContent.trim()||!el||!el.offsetWidth||el.closest('[hidden],#perfhud,.gxs-tag'))continue;const r=el.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight||r.right<0||r.left>innerWidth)continue;const fs=parseFloat(getComputedStyle(el).fontSize);if(fs<12)small.push(n.textContent.trim().slice(0,20)+' '+fs)}
      const B=document.getElementById('board').getBoundingClientRect();return {bad,small:small.slice(0,6),board:[B.left|0,B.width|0,B.height|0],wide:document.documentElement.classList.contains('ph-w')}});
    await p.screenshot({path:path.join(OUT,s+'.png')});
    const ok=!chk.bad.length&&!chk.small.length&&!errs.length;if(!ok)fail++;
    console.log(s,ok?'PASS':'FAIL','my turns',mine,'board x/w/h',chk.board.join('/'),'3-panel',chk.wide,'not clickable',JSON.stringify(chk.bad),'text<12px',JSON.stringify(chk.small),'errors',errs.length);await c.close()}
  await b.close();process.exit(fail?1:0)})();
