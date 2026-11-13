// Guided tutorial by touch ("The Lantern Race", ui10.js): from fresh storage, tap the tutorial button on the title, then tap ONLY the highlighted
// ring of each step (real touchscreen taps at its centre) to the end card, then "Play a real game" must start a normal game.
//   node tutor-test.js [sizes=390x844,375x667] [shotdir]    Exit code 1 on failure.
// Asserts: every rule step in TUT_RULES was shown, in order; every sentence has 12 words or fewer; one ring (one tap) per step;
// every tap lands on the highlighted element; the bubble never covers the ring; 0 console errors.
// shotdir: tut-1..tut-N.png at the first size (one per step).
const PW=(()=>{try{return require('playwright')}catch(e){return require('/opt/node-tools/node_modules/playwright')}})();
const gx=require('../../scripts/gx-serve.js');const path=require('path');const fs=require('fs');
const FILE=path.join(__dirname,'tidewake.html');
const SIZES=(process.argv[2]||'390x844,375x667').split(',').map(s=>s.split('x').map(Number));
const SHOTS=process.argv[3]||null;
let fail=0;const bad=m=>{fail++;console.log('FAIL',m)};
const words=t=>String(t||'').replace(/[^a-zA-Z0-9'’+]+/g,' ').trim().split(' ').filter(Boolean).length;
(async()=>{
  const url=await gx.url('tidewake',{file:FILE,query:'?2d'});const b=await PW.chromium.launch(process.env.PW_EXE?{executablePath:process.env.PW_EXE}:{});
  for(const [W,H] of SIZES){const tag=W+'x'+H;const shoot=SHOTS&&W===SIZES[0][0]&&H===SIZES[0][1];if(shoot)fs.mkdirSync(SHOTS,{recursive:true});
    const c=await b.newContext({viewport:{width:W,height:H},hasTouch:true,isMobile:true});const p=await c.newPage();const errs=[];
    p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>m.type()==='error'&&!/net::|Failed to load|favicon/.test(m.text())&&errs.push(m.text()));
    await p.goto(url);await p.waitForTimeout(1200);await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForTimeout(1500);
    const open=p.locator('#start [data-gxt-open]:visible').first();if(!await open.count()){bad(tag+' no tutorial button on the title');await c.close();continue}
    {const bx=await open.boundingBox();await p.touchscreen.tap(bx.x+bx.width/2,bx.y+bx.height/2)}
    await p.waitForTimeout(800);await p.evaluate(()=>{UI.speed=2;try{TWKit.setSpeed(2)}catch(e){}});
    const t0=Date.now();const shown=[];let idle=0,n=0,cover=0,miss=0,rings=0,mz=0,dead=0,gapBtn=0,slow=0;
    while(Date.now()-t0<300000){
      const s=await p.evaluate(()=>{const st=GXT.state();if(document.querySelector('[data-gxt-end]'))return {end:1};if(!st.active||!st.shown)return {wait:1,id:st.id,act:st.active,ph:st.phase};
        const rs=[...document.querySelectorAll('.gxt-ring')];const r=rs[0]&&rs[0].getBoundingClientRect();const bub=document.querySelector('.gxt-bub');const bb=bub&&bub.getBoundingClientRect();
        const say=(bub&&bub.querySelector('.gxh-tx')||{}).textContent||'';
        const ov=r&&bb?Math.max(0,Math.min(r.right,bb.right)-Math.max(r.left,bb.left))*Math.max(0,Math.min(r.bottom,bb.bottom)-Math.max(r.top,bb.top)):0;
        return {id:st.id,say,n:rs.length,ov,r:r?{x:r.left+r.width/2,y:r.top+r.height/2}:null}});
      if(s.end){console.log("end card at",shown.join(","));break}
      if(s.wait||!s.r){
        // a visible button between steps (the roll card's Continue) must take a tap and answer within 1 s: never a dead tap under the tutor layer
        const bt=await p.evaluate(()=>{const e=[...document.querySelectorAll('#pc [data-ph=dismiss]')].find(e=>!e.closest('[hidden]')&&e.offsetWidth>0);if(!e)return null;const r=e.getBoundingClientRect();if(r.bottom>innerHeight||r.top<0)return null;
          const x=r.left+r.width/2,y=r.top+r.height/2,t=document.elementFromPoint(x,y);return {x,y,ok:!!t&&(t===e||e.contains(t)),on:t?String(t.className||t.id):'none'}});
        if(bt&&!bt.ok){await p.waitForTimeout(250);const b2=await p.evaluate(([x,y])=>{const e=[...document.querySelectorAll('#pc [data-ph=dismiss]')].find(e=>!e.closest('[hidden]')&&e.offsetWidth>0);if(!e||GXT.state().shown)return null;const t=document.elementFromPoint(x,y);return {ok:!!t&&(t===e||e.contains(t)),on:(t?String(t.className||t.id):'none')+' phase '+GXT.state().phase}},[bt.x,bt.y]);if(!b2)continue;bt.ok=b2.ok;bt.on=b2.on}
        if(bt){gapBtn++;if(!bt.ok){dead++;console.log(tag,'dead button between steps after',shown[shown.length-1],'covered by',bt.on)}else{await p.touchscreen.tap(bt.x,bt.y);const t1=Date.now();let ans=false;
          while(Date.now()-t1<1000){ans=await p.evaluate(()=>{const e=[...document.querySelectorAll('#pc [data-ph=dismiss]')].find(e=>!e.closest('[hidden]')&&e.offsetWidth>0);return !e||!UI.busy||GXT.state().shown});if(ans)break;await p.waitForTimeout(50)}
          if(!ans){dead++;console.log(tag,'button between steps did not answer within 1 s after',shown[shown.length-1])}}}
        idle++;if(idle%50===1)console.log('wait',JSON.stringify(s));if(idle>400){bad(tag+' stuck waiting at step '+s.id+' after '+shown.join(','));break}await p.waitForTimeout(150);continue}idle=0;
      if(shown[shown.length-1]!==s.id){shown.push(s.id);n++;if(process.env.V)console.log(((Date.now()-t0)/1000).toFixed(1),s.id,s.say);if(words(s.say)>12)bad(tag+' step '+s.id+' has '+words(s.say)+' words: '+s.say);if(s.n!==1)rings++;if(s.ov>16)cover++;
        if(s.id==='hand'){const hb=await p.evaluate(()=>[...document.querySelectorAll('[data-a=card]')].map(e=>e.getBoundingClientRect()).filter(r=>r.width>0).map(r=>({w:Math.round(r.width),h:Math.round(r.height),b:Math.round(r.bottom),t:Math.round(r.top)})));
          const okH=hb.length>=3&&hb.every(r=>r.w>=44&&r.h>=44&&r.t>=0&&r.b<=H);if(!okH)bad(tag+' hand step: tiles cut off or under 44 px '+JSON.stringify(hb));else console.log(tag,'PASS hand step: all',hb.length,'tiles on screen, min',Math.min(...hb.map(r=>Math.min(r.w,r.h))),'px')}
        await p.waitForTimeout(700);if(shoot)await p.screenshot({path:path.join(SHOTS,'tut-'+n+'.png')});}
      const hit=await p.evaluate(([x,y])=>{const e=document.elementFromPoint(x,y);return e?(e.className&&String(e.className).indexOf('gxt-cell')>=0?'shield':'ok'):'none'},[s.r.x,s.r.y]);if(hit!=='ok'){mz=(mz||0)+1;if(mz>=6){miss++;mz=0;console.log(tag,'highlight not tappable at step',s.id,hit)}await p.waitForTimeout(150);continue}mz=0;
      await p.touchscreen.tap(s.r.x,s.r.y);{const t1=Date.now();let ans=false;while(Date.now()-t1<1000){ans=await p.evaluate(id=>{const st=GXT.state();return !!document.querySelector('[data-gxt-end]')||!st.shown||st.id!==id},s.id);if(ans)break;await p.waitForTimeout(50)}
        if(!ans){const again=await p.evaluate(()=>!!(TW_TUT.cur&&!TW_TUT.cur.tap));if(!again){slow++;console.log(tag,'step',s.id,'did not answer one tap within 1 s')}}}
      await p.waitForTimeout(300)}
    const r=await p.evaluate(()=>({seen:TW_TUT.seen,rules:TUT_RULES,over:G&&G.over}));
    const want=r.rules;const got=r.seen.map(x=>x==='mark2'?'mark':x).filter((x,i,a)=>a.indexOf(x)===i);
    const missing=want.filter(x=>!got.includes(x));const order=got.filter(x=>want.includes(x)).join()===want.filter(x=>got.includes(x)).join();
    if(missing.length)bad(tag+' rule steps never shown: '+missing.join(','));if(!order)bad(tag+' rule steps out of order: '+got.join(','));
    if(dead)bad(tag+' '+dead+' visible buttons between steps ignored a tap');if(slow)bad(tag+' '+slow+' steps did not answer one tap within 1 s');console.log(tag,'buttons between steps tapped:',gapBtn,'dead:',dead);
    if(rings)bad(tag+' '+rings+' steps without exactly one highlight');if(cover)bad(tag+' bubble covers the highlight on '+cover+' steps');if(miss)bad(tag+' '+miss+' taps did not land on the highlight');
    console.log(tag,missing.length?'FAIL':'PASS','tutorial steps',n,'rules',got.length+'/'+want.length,'winner',JSON.stringify(r.over&&r.over.win));
    if(shoot){const e=p.locator('.gxt-end');if(await e.count())await p.screenshot({path:path.join(SHOTS,'tut-'+(n+1)+'.png')})}
    const play=p.locator('[data-gxt-end=play]');if(!await play.count())bad(tag+' no "Play a real game" on the end card');else{const bx=await play.boundingBox();await p.touchscreen.tap(bx.x+bx.width/2,bx.y+bx.height/2);await p.waitForTimeout(1500);
      const g=await p.evaluate(()=>({tut:!!UI.tut,on:TW_TUT.on,phase:G&&G.phase,np:G&&G.np,done:GXT.isDone('tidewake'),gate:G&&G.exp}));
      if(g.tut||g.on||g.phase!=='setup'||!g.done)bad(tag+' real game did not start cleanly '+JSON.stringify(g));else console.log(tag,'PASS real game starts after the tutorial',JSON.stringify(g))}
    if(errs.length)bad(tag+' console errors: '+errs.slice(0,3).join(' | '));else console.log(tag,'PASS 0 console errors');
    await c.close()}
  await b.close();process.exit(fail?1:0)})();
