#!/usr/bin/env node
// Board-first layout check (Playwright). Usage: node layoutcheck.js [kot2.html] [outdir]
// At 4 viewport sizes: start screen, a game against the computer played through the real buttons, every popup opened
// and closed (✕ and Esc). Asserts: no page scroll, the canvas fills the board and sits inside the viewport, a 5×5 grid of
// elementFromPoint hits over the board only lands on the canvas or anchored labels, the dock is visible when a human
// decision is pending, no console errors. Also measures the page at each size minus 46px (the shelf iframe).
const PW=require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const path=require('path'),fs=require('fs');
const file=path.resolve(process.argv[2]||path.join(__dirname,'kot2.html'));const out=process.argv[3]||path.join(__dirname,'..','layoutshots');fs.mkdirSync(out,{recursive:true});
const SIZES=[[1366,768],[1920,1080],[768,1024],[390,844]].filter(([w,h])=>!process.env.ONLY||process.env.ONLY.split(',').includes(w+'x'+h));const LOG=(...a)=>process.env.V&&console.log(...a);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const br=await PW.chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const report=[];let fails=0;
  for(const [W,H] of SIZES){const tag=`${W}x${H}`;const ctx=await br.newContext({viewport:{width:W,height:H},deviceScaleFactor:1,hasTouch:W<700,isMobile:W<700});
    const pg=await ctx.newPage();const errs=[];pg.on('console',m=>{if(m.type()==='error'&&!/fonts\.g|ERR_|net::/.test(m.text()))errs.push(m.text())});pg.on('pageerror',e=>errs.push(String(e)));
    const R={size:tag,checks:0,fails:[]};const fail=m=>{R.fails.push(m);fails++};
    const shot=async n=>pg.screenshot({path:path.join(out,`${tag}-${n}.png`),timeout:180000});pg.setDefaultTimeout(180000);
    const scroll=async where=>{const s=await pg.evaluate(()=>({sh:document.documentElement.scrollHeight,sw:document.documentElement.scrollWidth,bh:document.body.scrollHeight,ih:innerHeight,iw:innerWidth}));R.checks++;
      if(s.sh>s.ih||s.sw>s.iw)fail(`${where}: page scrolls ${s.sw}x${s.sh} > ${s.iw}x${s.ih}`);return s};
    const board=async where=>{const b=await pg.evaluate(()=>{const bd=document.querySelector('.gx-board').getBoundingClientRect();const cv=document.getElementById('c3').getBoundingClientRect();
        const bad=[];for(let i=0;i<5;i++)for(let j=0;j<5;j++){const x=bd.left+bd.width*(i+.5)/5,y=bd.top+bd.height*(j+.5)/5;const e=document.elementFromPoint(x,y);
          const ok=e&&(e.id==='c3'||e.id==='stage'||e.id==='hud'||e.closest('.tag,.pop,#hud,#map'));if(!ok)bad.push(`${Math.round(x)},${Math.round(y)}:${e?(e.id||e.className||e.tagName):'none'}`)}
        return {bd:[bd.left,bd.top,bd.width,bd.height].map(Math.round),cv:[cv.left,cv.top,cv.width,cv.height].map(Math.round),bad,iw:innerWidth,ih:innerHeight}});R.checks++;
      const [l,t,w,h]=b.cv;if(l<0||t<0||l+w>b.iw+1||t+h>b.ih+1)fail(`${where}: canvas outside viewport ${b.cv}`);
      if(Math.abs(w-b.bd[2])>2||Math.abs(h-b.bd[3])>2)fail(`${where}: canvas ${b.cv} does not fill board ${b.bd}`);
      if(b.bad.length)fail(`${where}: board covered at ${b.bad.slice(0,4).join(' ')}`);R.board=b.bd;return b};
    const dockVisible=async where=>{const d=await pg.evaluate(()=>{const a=document.querySelector('.gx-app');const k=document.querySelector('.gx-dock').getBoundingClientRect();const c=document.getElementById('choice');const t=c.classList.contains('hidden')?document.getElementById('pacts'):c;const tr=t.getBoundingClientRect();
        return {min:a.classList.contains('gx-dock-min'),h:k.height,top:k.top,bottom:k.bottom,tt:tr.top,ih:innerHeight}});R.checks++;
      if(d.min||d.h<60||d.bottom>d.ih+1)fail(`${where}: dock hidden ${JSON.stringify(d)}`);if(d.tt>d.ih)fail(`${where}: decision below the fold ${JSON.stringify(d)}`);};
    await pg.goto('file://'+file);await pg.evaluate(()=>{localStorage.clear()});await pg.reload();await sleep(1500);
    R.start=await scroll('start');await shot('1-start');
    // the shelf iframe is the viewport minus ~46px
    await pg.setViewportSize({width:W,height:H-46});await sleep(300);R.iframe=await scroll('start iframe');await pg.setViewportSize({width:W,height:H});await sleep(300);
    // evolutions on so the "Starting evolution" question shows up; a fast computer
    await pg.evaluate(()=>{if(!UI.evo)document.querySelector('[data-exk="evo"]').click();UI.n=4});
    await pg.click('[data-start="solo"]');await pg.evaluate(()=>{AIDELAY=120});await sleep(800);await pg.waitForFunction(()=>{const b=document.querySelector('.gx-board').getBoundingClientRect(),c=document.getElementById('c3').getBoundingClientRect();return Math.abs(b.width-c.width)<2&&Math.abs(b.height-c.height)<2},null,{timeout:60000}).catch(()=>{});
    await scroll('game start');await board('game start');
    if(await pg.$('#coach:not(.hidden)')){await dockVisible('tour');await shot('2-tour');await pg.click('[data-tour="next"]');await sleep(150);await pg.click('[data-tour="skip"]')}
    let turns=0,choiceShot=false,rollShot=false,buyShot=false,t0=Date.now(),did=0;const seenQ=new Set();
    while(Date.now()-t0<(+process.env.LOOPMS||200000)&&turns<2){await sleep(150);
      const st=await pg.evaluate(()=>({g:!!G,w:G&&G.winner,ch:!!document.querySelector('#choice:not(.hidden) [data-opt]'),title:UI.choice&&UI.choice.title,ht:humanTurn(),ph:G&&G.phase,rolls:G&&G.rolls,busy:UI.busy}));
      LOG(Math.round((Date.now()-t0)/1000),JSON.stringify(st),turns);if(!st.g||st.w)break;
      {const sb=await pg.$('#choice:not(.hidden) [data-a="story"]');if(sb){seenQ.add('story card');await dockVisible('story card');await board('story card');await scroll('story card');await shot('2b-story');await sb.click();did++;continue}
       const tb=await pg.$('#coach:not(.hidden) [data-tour="next"]');if(tb){seenQ.add('tip');await dockVisible('tip');await board('tip');await scroll('tip');await tb.click();did++;continue}}
      if(st.ch){seenQ.add(st.title);await dockVisible('choice '+st.title);await board('choice');await scroll('choice');if(!choiceShot){choiceShot=true;await shot('4-choice')}
        const b=await pg.$('#choice .btn.primary[data-opt]')||await pg.$('#choice [data-opt]:not([data-opt="x"])');if(b)await b.click();did++;continue}
      if(!st.ht||st.busy)continue;
      await dockVisible('human '+st.ph);
      if(st.ph==='roll'){const dice=await pg.$$('#dice .die:not([disabled])');if(dice.length&&st.rolls>0){await dice[0].click();await sleep(80);
          if(!rollShot){rollShot=true;await board('mid-turn');await scroll('mid-turn');await shot('3-midturn')}
          const rr=await pg.$('#pacts [data-act="reroll"]:not([disabled])');if(rr){await rr.click();did++;await sleep(500);continue}}
        const rs=await pg.$('#pacts [data-act="resolve"]');if(rs){await rs.click();did++;await sleep(400)}continue}
      if(st.ph==='buy'){await scroll('buy');await board('buy');const mini=await pg.$('#buymini:not(.hidden) .bm');R.checks++;if(!mini)fail('buy step: no compact market in the dock');
        if(!buyShot){buyShot=true;await shot('5-buy')}
        const buy=await pg.$('#buymini [data-card]:not([disabled])');if(buy&&turns===1){await buy.click();did++;await sleep(300);continue}
        const e=await pg.$('#pacts [data-act="end"]');if(e){await e.click();did++;turns++;await sleep(400)}continue}}
    R.modal=await pg.evaluate(()=>{const m=document.getElementById('modal');return m.classList.contains('hidden')?'':m.textContent.slice(0,80)});if(R.modal){await shot('5b-modal');const b=await pg.$('#modal [data-a="closestats"]');if(b)await b.click();await sleep(300)}
    const closeModal=async()=>{const b=await pg.$('#modal:not(.hidden) [data-a="closestats"]');if(b){R.gameOver=true;await b.click();await sleep(300)}};
    await pg.evaluate(()=>{UI.paused=true});await sleep(3000);R.modal2=await pg.evaluate(()=>{const m=document.getElementById('modal');return m.classList.contains('hidden')?'':m.textContent.slice(0,120)});await closeModal();
    R.turns=turns;R.clicks=did;R.questions=[...seenQ];
    // dock collapse: the board grows and the canvas follows
    if(W>=1000){const a=(await board('before collapse')).cv[2];await pg.click('.gx-dock-head [data-gx="dock"]');await sleep(400);await pg.waitForFunction(()=>{const b=document.querySelector('.gx-board').getBoundingClientRect(),c=document.getElementById('c3').getBoundingClientRect();return Math.abs(b.width-c.width)<2&&Math.abs(b.height-c.height)<2},null,{timeout:60000}).catch(()=>{});const b=await board('dock collapsed');await scroll('dock collapsed');R.checks++;if(b.cv[2]<=a)fail('collapse: board did not grow');
      await shot('6-dockmin');await pg.click('.gx-reopen');await sleep(300)}
    else{await pg.click('.gx-dock-head .gx-grab');await sleep(300);await scroll('sheet full');await pg.click('.gx-dock-head .gx-grab');await sleep(300);await pg.waitForFunction(()=>{const b=document.querySelector('.gx-board').getBoundingClientRect(),c=document.getElementById('c3').getBoundingClientRect();return Math.abs(b.width-c.width)<2&&Math.abs(b.height-c.height)<2},null,{timeout:60000}).catch(()=>{});const b=await board('sheet min');await shot('6-sheetmin');await pg.click('.gx-dock-head .gx-grab');await sleep(300)}
    // every popup: open, check, close with ✕; open again, close with Esc
    await pg.evaluate(()=>{UI.paused=true});
    const ids=await pg.$$eval('header.gx-bar [data-gx]',bs=>bs.map(b=>b.dataset.gx));R.popups=ids;
    for(const id of ids){await pg.click(`header.gx-bar [data-gx="${id}"]`);await pg.waitForFunction(id=>{const r=document.getElementById(id).getBoundingClientRect();return r.left>=0&&r.right<=innerWidth+1&&r.bottom<=innerHeight+1},id,{timeout:60000}).catch(()=>{});
      let on=await pg.evaluate(id=>{const d=document.getElementById(id);const r=d.getBoundingClientRect();return {on:d.classList.contains('on'),r:[r.left,r.top,r.right,r.bottom],iw:innerWidth,ih:innerHeight,body:d.querySelector('.gx-drawer-body').textContent.trim().length}},id);R.checks++;
      if(!on.on||on.body<5)fail(`popup ${id} did not open or is empty`);if(on.r[0]<-1||on.r[1]<-1||on.r[2]>on.iw+1||on.r[3]>on.ih+1)fail(`popup ${id} outside viewport ${on.r}`);
      await scroll('popup '+id);if(id==='dr-market'||id==='dr-mons'){await sleep(400);await shot('7-popup-'+id.slice(3))}
      await pg.click(`#${id} .gx-x`);await sleep(300);if(await pg.evaluate(id=>document.getElementById(id).classList.contains('on'),id))fail(`popup ${id}: ✕ did not close`);
      await pg.click(`header.gx-bar [data-gx="${id}"]`);await sleep(250);await pg.keyboard.press('Escape');await sleep(300);if(await pg.evaluate(id=>document.getElementById(id).classList.contains('on'),id))fail(`popup ${id}: Esc did not close`);R.checks+=2}
    await board('after popups');await scroll('after popups');await shot('8-end');
    R.errors=errs;if(errs.length)fail('console errors: '+errs.slice(0,3).join(' | '));
    report.push(R);await ctx.close()}
  await br.close();
  for(const R of report)console.log(`${R.size}: start page ${R.start.sw}x${R.start.sh} (viewport ${R.start.iw}x${R.start.ih}), iframe ${R.iframe.sh}/${R.iframe.ih}, board ${R.board}, turns ${R.turns}, clicks ${R.clicks}, questions ${JSON.stringify(R.questions)}, checks ${R.checks}, modal ${JSON.stringify(R.modal||R.modal2||'')}, fails ${R.fails.length}${R.fails.length?'\n  '+R.fails.slice(0,8).join('\n  '):''}`);
  console.log(fails?`FAIL (${fails})`:'ALL PASS');process.exit(fails?1:0)})();
