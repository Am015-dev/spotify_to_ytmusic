// blocked-start rescue card at phone sizes: forces the rulebook's blocked-start question on your first turn, checks each mark is listed once,
// the card (with Accept and the timer) fits on screen, and a relocation tap by touch works.  node tools/reloc-shot.js [shotdir]
const PW=(()=>{try{return require('playwright')}catch(e){return require('/opt/node-tools/node_modules/playwright')}})();
const gx=require('../../../scripts/gx-serve.js');const path=require('path');const OUT=process.argv[2]||'.';let fail=0;
(async()=>{const url=await gx.url('tidewake',{file:path.join(__dirname,'..','tidewake.html'),query:'?2d'});const b=await PW.chromium.launch(process.env.PW_EXE?{executablePath:process.env.PW_EXE}:{});
  for(const [W,H] of [[390,844],[375,667]]){const c=await b.newContext({viewport:{width:W,height:H},hasTouch:true,isMobile:true});const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
    await p.goto(url);await p.waitForTimeout(1200);await p.evaluate(()=>{localStorage.setItem('tw_played','1');localStorage.setItem('tw_offered','1');localStorage.setItem('gxt-tidewake','{"done":1}')});await p.reload();await p.waitForTimeout(1500);
    await p.getByText('Quick game: you vs 2 computers').tap();await p.waitForTimeout(800);
    for(let i=0;i<200;i++){const st=await p.evaluate(()=>({ph:G.phase,s:sideToAct(),busy:UI.busy}));if(st.ph==='play'&&st.s===0&&!st.busy)break;
      const sb=p.locator('button.pb[data-a=startmark]:visible');if(await sb.count()){const bx=await sb.first().boundingBox();await p.touchscreen.tap(bx.x+bx.width/2,bx.y+bx.height/2)}
      const dm=p.locator('[data-ph=dismiss]:visible');if(await dm.count()){const bx=await dm.first().boundingBox();await p.touchscreen.tap(bx.x+bx.width/2,bx.y+bx.height/2)}await p.waitForTimeout(300)}
    const ok=await p.evaluate(()=>{const s=G.ships[0];if(s.moved||s.on)return 'moved';const m=G.mons.find(x=>x.k==='L');m.x=s.x;m.y=s.y;G.step=null;now('doom',{seat:0,cause:{k:'mon',id:m.id,blk:1},near:[s.x,s.y]});flow();UI.qKey=null;render();return G.q&&G.q.kind});
    await p.waitForTimeout(900);
    const r=await p.evaluate(()=>{const card=document.querySelector('[data-qkind=doom]');if(!card)return null;const vis=e=>{const q=e.getBoundingClientRect();return q.width>0&&q.top>=0&&q.bottom<=innerHeight};
      const marks=G.q.opts.filter(o=>o.h==='dReloc').length;const labels=[...card.querySelectorAll('[data-a=q]')].map(e=>e.getAttribute('aria-label')||e.textContent);
      const acc=card.querySelector('.btn.warn'),tm=card.querySelector('#qtxt'),best=card.querySelector('.btn.pri');return {marks,labels,dupes:labels.length-new Set(labels).size,acc:acc&&vis(acc),timer:tm?vis(tm):'none',best:best&&vis(best),card:Math.round(card.getBoundingClientRect().bottom),H:innerHeight}});
    console.log(W+'x'+H,ok,JSON.stringify(r));if(!r||r.dupes||!r.acc||!r.best||r.timer===false)fail++;
    await p.screenshot({path:path.join(OUT,`tide-${W}-reloc.png`)});
    const bt=p.locator('[data-qkind=doom] .btn.pri');const bx=await bt.boundingBox();await p.touchscreen.tap(bx.x+bx.width/2,bx.y+bx.height/2);await p.waitForTimeout(800);
    const after=await p.evaluate(()=>({q:!!G.q,alive:G.ships[0].alive,log:G.log.slice(0,4).map(l=>l.t)}));console.log('  after tap',JSON.stringify(after));if(after.q||!after.alive)fail++;
    if(errs.length){fail++;console.log('  errors',errs.slice(0,3))}await c.close()}
  await b.close();console.log(fail?'FAIL':'PASS');process.exit(fail?1:0)})();
