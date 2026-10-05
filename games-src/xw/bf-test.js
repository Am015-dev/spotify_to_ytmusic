// Board-first portrait test (real WebGL via SwiftShader, isMobile + hasTouch): plays whole rounds with taps on the board only.
// node bf-test.js [WxH,...] [--rounds=4] [--file=nebula.html]
// Checks at every step: no page scroll; every board control is >= 40 px, on screen and not covered (it gets the tap);
// the one-line hint is <= 8 words; the dock never covers the board during normal play; after "Fly" at least two ships
// fly at the same time; the game reaches the asked round (or ends) with no page errors.
const PW=require('/opt/node22/lib/node_modules/playwright');const path=require('path');
const A=process.argv.slice(2);const arg=(k,d)=>{const a=A.find(x=>x.startsWith('--'+k+'='));return a?a.slice(k.length+3):d};
const SIZES=(A[0]&&!A[0].startsWith('--')?A[0]:'390x763,375x553,390x844').split(',').map(s=>s.split('x').map(Number));
const ROUNDS=+arg('rounds',4),FILE=arg('file','nebula.html'),SHOTS=arg('shots','');if(SHOTS)require('fs').mkdirSync(SHOTS,{recursive:true});
(async()=>{const b=await PW.chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});let bad=0;
for(const [W,H] of SIZES){const t=W+'x'+H;const ctx=await b.newContext({viewport:{width:W,height:H},deviceScaleFactor:1,isMobile:true,hasTouch:true});
  const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  const prob=(...a)=>{bad++;console.log('FAIL',t,...a)};
  await p.goto('file://'+path.resolve(FILE)+'?phone=1');await p.waitForTimeout(1500);
  await p.evaluate(()=>{AIDELAY=120;try{localStorage.clear()}catch(e){}});
  await p.evaluate(()=>document.querySelector('[data-start="solo"]').click());await p.waitForTimeout(1500);
  if(!await p.evaluate(()=>BF.on&&document.documentElement.classList.contains('bf')))prob('board-first mode is off');
  let simul=0,flies=0,steps=0,last='',same=0;const kinds=new Set();
  while(steps++<400){
    await p.waitForFunction(()=>!V3.ez,null,{timeout:2500}).catch(()=>{});await p.waitForTimeout(60);
    const st=await p.evaluate(()=>{const r=document.documentElement;const k=(BF.key||'').split('|')[0];
      const hint=(document.getElementById('bfhint').textContent||'').trim();
      const ctl=[...document.querySelectorAll('#bfl button,#bfbtns button,#bfdice .die.pick')].filter(e=>e.offsetParent!==null&&getComputedStyle(e).display!=='none'&&getComputedStyle(e).visibility!=='hidden').map(e=>{const R=e.getBoundingClientRect();const top=document.elementFromPoint(R.left+R.width/2,R.top+R.height/2);
        return {c:e.className,w:R.width,h:R.height,x:R.left+R.width/2,y:R.top+R.height/2,off:R.left<-1||R.top<-1||R.right>innerWidth+1||R.bottom>innerHeight+1,cov:!(top&&(top===e||e.contains(top))),by:top&&(top.tagName+'#'+top.id+'.'+top.className+'<'+(top.parentElement&&top.parentElement.className))}});
      const dock=getComputedStyle(document.querySelector('.gx-dock')).display;
      const moving=Object.values(V3.anim||{}).filter(a=>a.path&&a.path.length>2&&a.dur<1e8).length;
      return {k,hint,ctl,dock,sheet:r.classList.contains('bf-sheet'),sw:document.documentElement.scrollWidth,sh:document.documentElement.scrollHeight,w:innerWidth,h:innerHeight,round:G&&G.round,win:G&&G.winner,moving,ph:G&&G.phase}});
    if(SHOTS&&!kinds.has(st.k+st.ph)){kinds.add(st.k+st.ph);await p.screenshot({path:path.join(SHOTS,`${t}_${String(steps).padStart(3,'0')}_${st.k}_${st.ph}.png`)})}
    kinds.add(st.k);if(st.moving>=2)simul=Math.max(simul,st.moving);
    if(st.sw>st.w+1||st.sh>st.h+1)prob('page scroll',st.k);
    if(st.hint.split(/\s+/).filter(Boolean).length>8)prob('hint over 8 words:',st.hint);
    if(st.dock!=='none'&&!st.sheet&&!['over',''].includes(st.k))prob('dock shown during play',st.k);
    for(const c of st.ctl){if(c.off)prob('control off screen',st.k,c.c);else if(c.cov&&!/bfring/.test(c.c))prob('control covered',st.k,c.c,c.by);if(Math.min(c.w,c.h)<29.5)prob('control too small',st.k,c.c,Math.round(c.w),Math.round(c.h))}
    if(st.win||st.round>ROUNDS)break;
    const sig=JSON.stringify([st.k,st.round,st.ph,st.ctl.length]);if(sig===last)same++;else same=0;last=sig;if(same>40){prob('stuck at',sig);break}
    // decide like a player: the glowing / recommended thing
    const pick=await p.evaluate(k=>{const q=s=>{const e=document.querySelector(s);return e&&e.offsetParent!==null&&!e.disabled?e:null};let el=null;
      if(k==='brief')el=q('[data-bf=brief]');else if(k==='setup')el=q('.bfspot.rec')||q('.bfspot');
      else if(k==='plan')el=q('[data-bf=fly]')||q('.bfm.sug')||q('.bfm')||q('.bfring.need');
      else if(k==='action')el=q('.bfact.rec')||q('.bfact');else if(k==='sub')el=q('[data-bfarg]');
      else if(k==='target')el=q('.bftgt.rec')||q('.bftgt');else if(k==='dice')el=q('.die.pick:not(.on)')&&!q('#bfdice .die.pick.on')?q('.die.pick'):(q('#bfbtns .primary')||q('#bfbtns .btn'));
      else if(k==='res'||k==='note')return {x:innerWidth/2,y:innerHeight*.3,k};
      else if(k==='ask'){const e=q('#prompt [data-act=ask].primary')||q('#prompt [data-act=ask]');if(e){e.scrollIntoView({block:'center'});}el=e}
      if(!el)return null;const R=el.getBoundingClientRect();return {x:R.left+R.width/2,y:R.top+R.height/2,k,c:el.className+(el.dataset.bf||'')}},st.k);
    if(pick){if(pick.k==='plan'&&/fly/.test(pick.c))flies++;await p.touchscreen.tap(pick.x,pick.y)}
    await p.waitForTimeout(pick?500:400)}
  const fin=await p.evaluate(()=>({round:G.round,win:G.winner}));
  if(!fin.win&&fin.round<=ROUNDS)prob('only reached round',fin.round);
  if(flies&&simul<2)prob('ships never flew at the same time');
  if(errs.length)prob('page errors',errs.slice(0,3));
  console.log(t,'rounds',fin.round,'winner',fin.win||'-','flies',flies,'max ships flying at once',simul,'screens',[...kinds].filter(k=>!/[a-z](plan|ask|activate|action|target|amod|dmod|damod|combat|end|over)$/.test(k)||1).join(','));
  await ctx.close()}
console.log('PROBLEMS',bad);await b.close()})();
