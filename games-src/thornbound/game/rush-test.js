// "Skip all" test: during a rival's turn ONE tap on the Skip button plays every remaining rival step at once and stops at your next decision.
// Also: a tap on a region answers with the selected state (.rsel), and the strip never ends in "..." while rivals play.
//   node rush-test.js [size=375x667]   Exit code 1 on any problem.
const PW=(()=>{try{return require('playwright')}catch(e){return require('/opt/node-tools/node_modules/playwright')}})();
const gx=require('../../scripts/gx-serve.js');
const [W,H]=(process.argv[2]||'375x667').split('x').map(Number);const pc=W>600;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const URL=(process.env.GX_URL?process.env.GX_URL+'thornbound/':await gx.url('thornbound',{file:process.env.TB_FILE||__dirname+'/thornbound.html'}))+'?scn=tb-pc-hand'+(pc?'':'&phone=1');
  const b=await PW.chromium.launch();const ctx=await b.newContext({viewport:{width:W,height:H},isMobile:!pc,hasTouch:!pc});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  let bad=0;const fail=m=>{bad++;console.log('FAIL '+m)};
  await p.goto(URL);await sleep(4500);
  const tap=async xy=>pc?p.mouse.click(...xy):p.touchscreen.tap(...xy);
  const ctr=sel=>p.evaluate(s=>{const e=[...document.querySelectorAll(s)].find(x=>x.offsetWidth);if(!e)return null;const r=e.getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2]},sel);
  await p.evaluate(()=>{UI.speed=1});
  // 1. a region tap with nothing picked: the region lights up and a short line says why
  const reg=await p.evaluate(()=>{const e=document.querySelector('.tbx-pan g[data-reg="1"] rect');const r=e.getBoundingClientRect();return [r.left+r.width/2,r.top+8]});
  await tap(reg);await sleep(250);
  const sel=await p.evaluate(()=>!!document.querySelector('.tbx-pan g.rsel'));if(!sel)fail('a region tap showed no selected state');
  // 2. bid a card (tap it twice), then the rivals play
  for(let i=0;i<2;i++){const c=await ctr('#handw .hc');if(!c){fail('no hand card');break}await tap(c);await sleep(500)}
  // wait for the Skip button
  let t0=Date.now(),seen=false;while(Date.now()-t0<15000){if(await p.evaluate(()=>!!document.querySelector('#tbturn:not([hidden]) .tbt-skip2'))){seen=true;break}await sleep(100)}
  if(!seen)fail('no Skip button appeared while the rivals played');
  else{
    const lines=[];const t1=Date.now();const b0=await p.evaluate(()=>G.logN);
    const sk=await ctr('#tbturn .tbt-skip2');await tap(sk);
    let done=false;while(Date.now()-t1<9000){const s=await p.evaluate(()=>({h:!!(G.q&&viewSeatForQ()!=null)&&!UI.card,r:UI.rush,t:(document.querySelector('#tbturn .tbt-line')||{}).textContent||''}));lines.push(s.t);if(s.h){done=true;break}await sleep(80)}
    const ms=Date.now()-t1;const r=await p.evaluate(()=>[UI.rush,G.logN]);
    console.log('one Skip tap -> your decision after '+ms+' ms, '+(r[1]-b0)+' log lines played, rush flag now '+r[0]);
    if(!done)fail('Skip did not reach your next decision in 9 s');if(r[0])fail('the rush flag stayed on at your decision');
    if(lines.some(t=>/(\.\.\.|…)$/.test(t.trim()))&&!lines.every(t=>/thinking/i.test(t)))fail('a strip line ended in "..." : '+lines.find(t=>/(\.\.\.|…)$/.test(t.trim())));
  }
  if(errs.length)fail('page errors: '+errs[0]);
  await b.close();console.log(bad?'FAIL':'PASS');process.exit(bad?1:0)})();
