// Clarity regression tests (jsdom, phone layout). node clarity-test.js [sands.html]
// Each test reproduces a bug a blind playtester hit, or checks a cause -> effect guarantee.
const {JSDOM}=require('jsdom');const fs=require('fs');const FILE=__dirname+'/'+(process.argv[2]||'sands.html');const html=fs.readFileSync(FILE,'utf8');
let fails=0,checks=0;const ok=(c,m)=>{checks++;if(!c){fails++;console.log('  FAIL',m)}else console.log('  ok  ',m)};
function page(q){return new Promise(res=>{const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'http://localhost/'+(q||'?phone=1')});
  const w=dom.window;const errs=[];w.addEventListener('error',e=>errs.push(e.message));w.console.error=(...a)=>errs.push(a.join(' '));
  w.addEventListener('load',()=>{w.eval('AIDELAY=0;ANIM=0;setSeed(11)');res({w,d:w.document,errs,ev:s=>{try{return w.eval(s)}catch(e){return {err:e.message,bad:[e.message]}}}})})})}
const start=(t,np,seats)=>t.ev(`UI.setup.np=${np};UI.setup.seats=${JSON.stringify(seats)};UI.setup.lv=['normal','normal','normal','normal','normal'];UI.setup.ex={};UI.modal=null;beginGame();UI.coach=false;PHONE.tips={bid:1,move:1,hand:1};render()`);
(async()=>{
  // 1. round banner: "Only N camels left for X" must name the player who really has N camels
  {const t=await page('?phone=0');start(t,2,['human','ai']);
    t.ev(`G.round=5;G.pl[0].camels=3;G.pl[1].camels=1;UI.chapterShown='';showChapter()`);const txt=t.d.getElementById('banner').textContent;
    ok(/\b1 camel left for Teal|Teal has 1 camel left|Teal.*1 camel/.test(txt)&&!/1 camels/.test(txt),'banner names the player with the fewest camels, singular: '+txt.replace(/\s+/g,' ').slice(0,120));t.w.close()}
  // 2. bidding with Mystics: the suggested bid button must still appear when the suggestion spends Mystics
  {const t=await page();start(t,2,['human','ai']);
    const r=t.ev(`(()=>{let g=0;while(!(me()&&G.phase==='bid')&&g++<50)go(aiMove(sideToAct()));const p=me();if(!p||G.phase!=='bid')return 'no bid';p.dj.push('dalil');p.fk=3;const vm=validMoves(p.i).filter(m=>m.fk);if(!vm.length)return 'no fk bid';
      UI.coach=true;if(PHONE.chapter)PHONE.chDone=PHONE.chapter.key;const real=aiMove;aiMove=()=>vm[0];UI.bidKey='';render();phRender();aiMove=real;return JSON.stringify(vm[0])})()`);
    ok(!!t.d.querySelector('#pc .bidrec, #ppop .bidrec'),'suggested bid button shown when the suggestion uses Mystics ('+r+')');t.w.close()}
  // 3. cause -> effect: every score change of every player during a game has a feed entry that explains it, and the parts add up
  {const t=await page();start(t,2,['human','ai']);
    const r=t.ev(`(()=>{let bad=[],n=0,steps=0;if(typeof UI.feed==='undefined')return {bad:['no UI.feed'],n:0};
      while(G&&!G.over&&steps<4000){steps++;const s=sideToAct();const m=aiMove(s);const before=G.pl.map(p=>scoreOf(p).total);const f0=UI.feedN||0;go(m);
        G.pl.forEach((p,i)=>{const d=scoreOf(p).total-before[i];if(!d)return;n++;const es=UI.feed.filter(e=>e.n>f0&&e.p===i);const sum=es.reduce((a,e)=>a+e.d,0);
          if(sum!==d||es.some(e=>!e.why||!e.why.length))bad.push(p.nm+' '+d+' vs feed '+sum+' at '+G.phase+'/'+G.step)})}
      return {bad:bad.slice(0,5),n,over:!!G.over}})()`);
    ok(r.over&&!r.bad.length&&r.n>20,`every score change has a cause in the feed (${r.n} changes; ${r.bad.join(' | ')})`);t.w.close()}
  // 4. the plan badge is the points the plan scores now, not an internal rating: keeping Advisors/Sages shows exactly their points
  {const t=await page();start(t,2,['human','ai']);
    const r=t.ev(`(()=>{let n=0,bad=[];for(let k=0;k<200&&!G.over;k++){const s=sideToAct();if(G.phase==='turn'&&G.step==='move'&&!G.move&&P(s).human){
        for(const o of allPlans(P(s)).filter(o=>o.c==='elder'||o.c==='vizier')){n++;const p=P(s);const before=scoreOf(p).total;const snap=JSON.stringify(G);const had=G.board[o.e].camel;
          UI.autoPlan=o;while(G.step==='move'){const m=planNext(o);if(!m)break;performMove(m,s)}UI.autoPlan=null;
          if(G.step==='tribe'){performMove(validMoves(s).find(m=>m.act==='tribe'),s)}const t=G.board[o.e];const got=scoreOf(p).total-before-(t.camel===p.i&&had!==p.i?t.v:0);
          const lg5=G.log.slice(0,5).map(l=>l.t).join('/');G=JSON.parse(snap);const est=planPoints(P(s),o).tribe;if(est!==got)bad.push(MNAME[o.c]+' est '+est+' got '+got+' n='+o.n+' dj='+P(s).dj+' log='+lg5)}}
        go(aiMove(s))}return {n,bad:bad.slice(0,4)}})()`);
    ok(r.n>5&&!r.bad.length,`plan points match the real gain for Advisors/Sages (${r.n} plans; ${r.bad.join(' | ')})`);t.w.close()}
  // 5. phone decision pop: the decision options come before anything else, and powers are a separate small button
  {const t=await page();start(t,2,['human','ai']);
    const r=t.ev(`(()=>{for(let k=0;k<400&&!G.over;k++){const s=sideToAct();if(P(s).human&&G.phase==='turn'&&(G.step==='tribe'||G.step==='tile')){render();phRender();const b=document.querySelector('#ppop .pp-b');if(!b)return 'no pop';
        const first=b.querySelector('.btn');return {log:!!b.querySelector('ol.mini'),powersInline:!!b.querySelector('.powers [data-mv],.powers [data-pw]'),first:first&&first.textContent}}go(aiMove(s))}return 'none'})()`);
    ok(r&&r.first&&!r.log&&!r.powersInline,'phone decision pop leads with the decision, no log/powers list inside: '+JSON.stringify(r));t.w.close()}
  console.log(`clarity-test: ${checks-fails}/${checks} passed`);process.exit(fails?1:0)})();
