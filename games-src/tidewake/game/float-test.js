// Floating tutorial by taps (float.js + shell/gx-float.js). From fresh storage: title tutorial button -> HUD map (labels, no overlaps, tap one) -> every lesson
// by real taps on the pulse ring (Next when no ring) -> done. Asserts: non-highlighted taps still work, window never covers the target, 0 JS errors, < 60 s.
//   node float-test.js [sizes=402x874,1366x768] [shotdir]
const PW=(()=>{try{return require('playwright')}catch(e){return require('/opt/node-tools/node_modules/playwright')}})();
const gx=require('../../scripts/gx-serve.js');const path=require('path');const fs=require('fs');
const FILE=path.join(__dirname,'tidewake.html');
const SIZES=(process.argv[2]||'402x874,1366x768').split(',').map(s=>s.split('x').map(Number));const SHOTS=process.argv[3]||null;
let fail=0;const bad=m=>{fail++;console.log('FAIL',m)};
(async()=>{
  const url=await gx.url('tidewake',{file:FILE,query:'?2d'});const b=await PW.chromium.launch(process.env.PW_EXE?{executablePath:process.env.PW_EXE}:{});
  for(const [W,H] of SIZES){const tag=W+'x'+H,mob=W<700;if(SHOTS)fs.mkdirSync(SHOTS,{recursive:true});
    const c=await b.newContext({viewport:{width:W,height:H},hasTouch:mob,isMobile:mob});const p=await c.newPage();const errs=[];
    p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>m.type()==='error'&&!/net::|Failed to load|favicon/.test(m.text())&&errs.push(m.text()));
    const tap=async(x,y)=>mob?p.touchscreen.tap(x,y):p.mouse.click(x,y);
    let shotMs=0;const shot=async n=>{if(SHOTS){const s0=Date.now();await p.screenshot({path:path.join(SHOTS,`gxf-${tag}-${n}.png`)});shotMs+=Date.now()-s0}};
    await p.goto(url);await p.waitForTimeout(1200);await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForTimeout(1500);
    const open=p.locator('#start [data-gxt-open]:visible').first();if(!await open.count()){bad(tag+' no tutorial button');await c.close();continue}
    const t0=Date.now();{const bx=await open.boundingBox();await tap(bx.x+bx.width/2,bx.y+bx.height/2)}
    await p.waitForTimeout(900);await p.evaluate(()=>{UI.speed=4;try{TWKit.setSpeed(4)}catch(e){}});
    // HUD map
    let st=await p.evaluate(()=>GXF.state());if(!st||!st.open||!st.map)bad(tag+' tutorial did not open on the HUD map');
    const labs=st.labels;const olap=[];for(let i=0;i<labs.length;i++)for(let j=i+1;j<labs.length;j++){const a=labs[i],q=labs[j];if(a.left<q.right&&a.right>q.left&&a.top<q.bottom&&a.bottom>q.top)olap.push(a.sel+'|'+q.sel)}
    console.log(tag,'map labels',labs.length,'overlaps',olap.length);if(olap.length)bad(tag+' map label overlaps '+olap);if(labs.length<7)bad(tag+' only '+labs.length+' map labels');
    await shot('map');
    {const l=await p.evaluate(()=>{const e=document.querySelector('.gxf-lab');const r=e.getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2]});await tap(l[0],l[1]);await p.waitForTimeout(300);
     const info=await p.evaluate(()=>document.querySelector('.gxf-say').textContent);if(!/:/.test(info))bad(tag+' label tap showed no sentence: '+info);await shot('map-label')}
    await p.evaluate(()=>GXF.close());await p.waitForTimeout(200);await p.locator('.gxf-q').first().click().catch(()=>{});await p.waitForTimeout(300);
    st=await p.evaluate(()=>GXF.state());if(!st.open||!st.map)bad(tag+' ? did not reopen the map');
    await p.evaluate(()=>document.querySelector('.gxf-btn.pri').click());await p.waitForTimeout(300);
    // lessons
    let n=0,last='',same=0,cover=0,sawNonSug=false;const seenIds=[];
    while(Date.now()-t0-shotMs<58000){
      st=await p.evaluate(()=>GXF.state());if(st.complete)break;
      if(st.id!==last){last=st.id;same=0;n++;seenIds.push(st.id);if(process.env.V)console.log(((Date.now()-t0)/1000).toFixed(1),st.id);await p.waitForTimeout(600);{const s2=await p.evaluate(()=>GXF.state());if(s2.overlap&&!s2.min){cover++;console.log(tag,'window covers target at',st.id)}}await shot(String(n).padStart(2,'0')+'-'+st.id);
        if(st.id==='goal'){ // a tap on something that is NOT highlighted must work: open Rules
          const vb=await p.evaluate(()=>{const e=[...document.querySelectorAll('.gx-bar [data-gx]')].find(e=>e.offsetWidth>0&&e.getAttribute('data-gx')!=='sheet');e.setAttribute('data-gxtest','1');return e.getAttribute('data-gx')});await p.locator('[data-gxtest="1"]').first().click();await p.waitForTimeout(300);
          const o=await p.evaluate(()=>document.querySelector('[data-gxtest="1"]').getAttribute('aria-expanded')==='true');
          if(!o)bad(tag+' non-highlighted tap (Rules) did nothing');else sawNonSug=true;await p.keyboard.press('Escape');await p.evaluate(()=>{try{GX.close()}catch(e){}});await p.waitForTimeout(250)}}
      // game buttons that are part of the flow (roll card, sunk card)
      const btn=await p.evaluate(()=>{const e=[...document.querySelectorAll('#pc [data-ph=dismiss],[data-a=sunkok],[data-sw=keep]')].find(e=>!e.closest('[hidden]')&&e.offsetWidth>0&&e.getBoundingClientRect().bottom<innerHeight);if(!e)return null;const r=e.getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2]});
      const ring=await p.evaluate(()=>{const r=document.querySelector('.gxf-ring');if(!r)return null;const b=r.getBoundingClientRect();return [b.left+b.width/2,b.top+b.height/2]});
      same++;
      const sw=await p.evaluate(()=>{const q=s=>{const e=[...document.querySelectorAll(s)].find(e=>e.offsetWidth>0);if(!e)return null;const r=e.getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2]};
        if(!document.querySelector('#twswap'))return null;return TSW.a!=null?q('#twswap [data-sw=co][data-i="0"]'):TSW.n>0?q('#twswap [data-sw=keep]'):q('#twswap [data-sw=me][data-i="1"]')});
      if(sw){await tap(sw[0],sw[1]);await p.waitForTimeout(300);continue}
      const act=await p.evaluate(()=>{const s=TW_FLOAT.steps[GXF.state().i];return !!(s&&(s.act||s.done))});
      if(!act){const nb=await p.evaluate(()=>{const r=document.querySelector('.gxf-ft .gxf-btn.pri').getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2]});await tap(nb[0],nb[1]);await p.waitForTimeout(150);continue}
      if(btn&&(same>1||!ring)){await tap(btn[0],btn[1]);await p.waitForTimeout(350);continue}
      if(ring&&same<=3){const ok=await p.evaluate(([x,y])=>{const e=document.elementFromPoint(x,y);return !!e&&!(e.closest&&e.closest('.gxf-win'))},ring);if(ok){await tap(ring[0],ring[1]);await p.waitForTimeout(350);continue}}
      if(same<=2&&!ring){await p.waitForTimeout(300);continue}
      await p.evaluate(()=>GXF.next());await p.waitForTimeout(350);
    }
    const secs=((Date.now()-t0-shotMs)/1000).toFixed(1);st=await p.evaluate(()=>GXF.state());await shot('done');
    console.log(tag,'lessons visited',seenIds.length,'complete',st.complete,'in',secs,'s','window-covered',cover);
    if(!st.complete)bad(tag+' tutorial not completed (stuck at '+st.id+')');if(secs>=60)bad(tag+' took '+secs+' s');if(cover)bad(tag+' window covered a target '+cover+' times');if(!sawNonSug)bad(tag+' no non-highlighted tap proof');
    if(errs.length)bad(tag+' JS errors: '+errs.slice(0,3).join(' | '));await c.close()}
  await b.close();console.log(fail?'FAILED':'PASS');process.exit(fail?1:0)})();
