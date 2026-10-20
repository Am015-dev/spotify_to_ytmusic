// Guided game and Story chapter 1, played ONLY by following the ghost finger (and the one glowing Done button), through touch taps.
//   node finger-test.js [sizes=390x763,375x553]      Exit code 1 on any problem.
// Checks: the finger always points at a legal, glowing target; the game can be finished by following it; no page errors; no stuck >8 s.
const PW=(()=>{try{return require('playwright')}catch(e){return require('/opt/node-tools/node_modules/playwright')}})();
const fs=require('fs');const html=fs.readFileSync(__dirname+'/thornbound.html');
const SIZES=(process.argv[2]||'390x763,375x553').split(',').map(s=>s.split('x').map(Number));
const sleep=ms=>new Promise(r=>setTimeout(r,ms));const probs=[];const note=(t,m)=>{if(probs.length<40)probs.push(t+': '+m)};
async function run(browser,W,H,mode){const tag=W+'x'+H+' '+mode;
  const ctx=await browser.newContext({viewport:{width:W,height:H},deviceScaleFactor:1,isMobile:true,hasTouch:true});
  await ctx.route('**/*',r=>new URL(r.request().url()).host==='gns.test'?r.fulfill({status:200,contentType:'text/html',body:html}):r.abort());
  const p=await ctx.newPage();p.on('pageerror',e=>note(tag,'PAGE ERROR '+e.message+' '+(e.stack||'').split('\n').slice(0,2).join('|')));
  await p.goto('https://gns.test/?phone=1');await sleep(900);
  await p.evaluate(m=>{try{localStorage.clear()}catch(e){}
    if(m==='guided')newGame('guided');else{window.CAMP_WAIT=100;newGame('me',campOpts(window.CAMPAIGN.chapters[0]))}UI.speed=8},mode);await sleep(400);
  let last='',lastT=Date.now(),fing=0,noFing=0;const kinds={};const t0=Date.now();
  for(let i=0;i<3000;i++){
    if(Date.now()-t0>200000){note(tag,'took over 200 s');break}
    const s=await p.evaluate(()=>{const f=document.querySelector('#finger');const pl=(!f||f.hidden)?null:fingerPlan();
      return {over:!!G.over,card:UI.card&&UI.card.kind,k:UI.bf&&UI.bf.kind,rec:UI.bf&&UI.bf.rec&&UI.bf.rec.k,plan:pl,round:G.round,sig:[UI.nMoves,G.logN,UI.hand,G.round,UI.card&&UI.card.kind].join('|'),
        glowOK:pl?(()=>{const ok=(x,y,sel)=>document.elementsFromPoint(x,y).some(e=>{const c=e.closest&&e.closest(sel);return !!c});return pl.from?(ok(pl.from.x,pl.from.y,'.hc.glow')&&ok(pl.to.x,pl.to.y,'.bspot,.tbx-pan g[data-reg]')):ok(pl.to.x,pl.to.y,'.glow,.rglow,.rec,.rrec,.btn.pri,.bspot,[data-a=mv]')})():null}});
    if(s.over)break;
    if(s.sig!==last){last=s.sig;lastT=Date.now()}else if(Date.now()-lastT>8000){note(tag,'stuck 8 s: k='+s.k+' card='+s.card+' finger='+!!s.plan+' plan='+JSON.stringify(s.plan));await p.screenshot({path:'/tmp/claude-0/ft_'+W+'_'+mode+'.png'});console.log(await p.evaluate(()=>JSON.stringify({q:G.q&&G.q.kind,t:G.q&&G.q.title,mv:UI.bf&&UI.bf.mv.map(m=>m.k+':'+(m.label||'')).slice(0,8),rec:UI.bf&&UI.bf.rec&&UI.bf.rec.k,act:document.querySelector('#act').innerHTML.slice(0,300)})));break}
    if(s.card){await sleep(80);continue}
    if(!s.k){await sleep(80);continue}
    kinds[s.k]=(kinds[s.k]||0)+1;
    if(s.plan){fing++;if(!s.glowOK)note(tag,'finger points at something that does not glow (kind '+s.k+')');
      if(s.plan.from){await p.touchscreen.tap(s.plan.from.x,s.plan.from.y);await sleep(150)}
      await p.touchscreen.tap(s.plan.to.x,s.plan.to.y);await sleep(200);continue}
    // no finger: take the one glowing thing the way a person would (Done, a glowing spot, a button in the sheet)
    noFing++;
    const pos=await p.evaluate(()=>{const c=e=>{if(!e)return null;const r=e.getBoundingClientRect();return r.width?[r.left+r.width/2,r.top+r.height/2]:null};const q=s=>document.querySelector(s);
      return c(q('#ppop [data-a=mv]'))||c(q('#act [data-a=mv].pri'))||c(q('#act [data-a=mv]'))||c(q('#main [data-a=mv]'))||c(q('.tb-loc.glow .tb-ring'))||(()=>{const g=q('.tbx-pan g.rglow rect');return c(g)})()||c(q('#handw .hc.glow'))||c(q('#handw .kcb.glow'))});
    if(pos){await p.touchscreen.tap(pos[0],pos[1]);await sleep(200)}else await sleep(120)}
  const fin=await p.evaluate(()=>({over:!!G.over,winner:G.over&&G.over.winner,camp:!!UI.camp}));
  if(!fin.over)note(tag,'game did not finish by following the finger');
  console.log(tag,'finger steps',fing,'other steps',noFing,JSON.stringify(kinds),Math.round((Date.now()-t0)/1000)+'s');
  await ctx.close()}
(async()=>{const b=await PW.chromium.launch({args:['--no-sandbox']});
  const jobs=[];for(const [W,H] of SIZES)for(const m of ['guided','story'])jobs.push([W,H,m]);
  await Promise.all(jobs.map(j=>run(b,...j).catch(e=>note(j.join(' '),'CRASH '+String(e.message).split('\n')[0]))));
  await b.close();console.log(probs.length?'PROBLEMS '+probs.length+'\n  '+probs.join('\n  '):'PROBLEMS 0');process.exit(probs.length?1:0)})();
