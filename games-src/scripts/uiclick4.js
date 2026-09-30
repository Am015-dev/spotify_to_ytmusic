#!/usr/bin/env node
// Random human clicker through the real UI. Usage: node uiclick4.js <game.html> [modes=solo,hot] [maxTurn=25]
// env PRE='js before starting' (e.g. DEFEX={...};UI.xp="trial"), RUNS=n per mode (default 2), SECS=time cap per run (default 70)
// In-game questions render in the dock (#choice); the start screen / game over stay in #modal.
// "rejected" = a click on an enabled button that changed nothing (neither the game state nor the pop-up).
const {JSDOM}=require('jsdom');const fs=require('fs');
const file=process.argv[2];const html=fs.readFileSync(file,'utf8');
const modes=(process.argv[3]||'solo,hot').split(',');const MAXT=+process.argv[4]||25;const RUNS=+process.env.RUNS||2;const SECS=+process.env.SECS||70;
function run(mode,anim){return new Promise(res=>{
  const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'http://localhost/'});const w=dom.window,d=w.document;
  const errs=[];w.addEventListener('error',e=>errs.push(e.message+' '+(e.error&&e.error.stack||'').split('\n').slice(1,3).join('|')));w.console.error=(...a)=>errs.push(a.join(' '));
  w.eval(`ANIM=${anim};AIDELAY=0`);w.localStorage.setItem('ccs_tour2','1');
  w.eval('UI.n='+(process.env.N||4));if(process.env.PRE)w.eval(process.env.PRE);
  const start=d.querySelector(`[data-start="${mode}"]`);if(!start){res({mode,errs:['no start button '+mode],rej:0,clicks:0});return}
  const click=el=>el.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));const rnd=a=>a[Math.floor(Math.random()*a.length)];
  click(start);
  const seen=new Set();let last='',stall=0,rej=0,clicks=0;const rejs=[];const t0=Date.now();const inv=new Set();
  const state=()=>{const G=w.eval('G');return JSON.stringify(G)+'|'+w.eval('UI.choice?UI.choice.who+UI.choice.title+JSON.stringify(UI.choice.options):""')};
  const iv=setInterval(()=>{try{const G=w.eval('G');if(!G){clearInterval(iv);res({mode,errs:['no game'],rej,clicks});return}
    w.eval('checkInvariants()').forEach(x=>inv.add(x));if(G.winner){clearInterval(iv);res({mode,anim,turn:G.turn,w:G.winner,errs,rej,rejs,clicks,inv:[...inv],seen:[...seen]});w.close();return}
    const ch=d.getElementById('choice');const m=ch&&!ch.classList.contains('hidden')?ch:d.getElementById('modal');let target=null,label='';
    const tour=d.querySelector('[data-tour="skip"]');if(tour){click(tour);return}
    if(m&&!m.classList.contains('hidden')){const bs=[...m.querySelectorAll('button[data-opt]:not([disabled])')];const h=m.querySelector('h2');if(h)seen.add('modal:'+h.textContent.replace(/\d+/g,'#').slice(0,30));
      const nb=bs.filter(b=>b.dataset.opt!=='x');if(nb.length){target=rnd(Math.random()<.1&&bs.length>nb.length?bs:nb);label='opt'}
      else if(m.querySelector('[data-a]')){target=m.querySelector('[data-a]');label='a'}}
    if(!target){const acts=[...d.querySelectorAll('#prompt [data-act]:not([disabled])')].filter(b=>b.dataset.act!=='hint');
      const cards=[...d.querySelectorAll('[data-card]:not([disabled])')];const dice=[...d.querySelectorAll('.die[data-die]:not([disabled])')];
      const r=Math.random();if(cards.length&&r<.3){target=rnd(cards);label='card'}else if(dice.length&&r<.5){target=rnd(dice);label='die'}else if(acts.length){target=rnd(acts);label='act:'+target.dataset.act.split(':')[0]}}
    if(target){const before=state();click(target);clicks++;seen.add(label);const after=state();if(before===after&&label!=='a'){rej++;if(rejs.length<5)rejs.push(label+' '+(target.textContent||'').slice(0,40))}}
    const sig=JSON.stringify([G.turn,G.active,G.dice,G.log.length,G.phase]);if(sig===last)stall++;else{stall=0;last=sig}
    if(stall>400)errs.push('STALL '+G.phase+' active '+G.active+' human '+G.pl[G.active].human+' choice '+w.eval('UI.choice&&UI.choice.title')+' busy '+w.eval('UI.busy'));
    if(G.winner||G.turn>MAXT||stall>400||Date.now()-t0>SECS*1000){clearInterval(iv);res({mode,anim,turn:G.turn,w:G.winner,errs,rej,rejs,clicks,inv:[...inv],seen:[...seen]});w.close()}
  }catch(e){errs.push(String(e.stack||e));clearInterval(iv);res({mode,errs,rej,clicks});w.close()}},anim?15:2)})}
(async()=>{const all=new Set();let bad=0,R=0,C=0,I=0;
  for(const m of modes)for(let k=0;k<RUNS;k++){const anim=k===RUNS-1&&RUNS>1?1:0;const r=await run(m,anim);(r.seen||[]).forEach(x=>all.add(x));bad+=r.errs.length;R+=r.rej;C+=r.clicks;I+=(r.inv||[]).length;
    console.log(m,'anim',anim,'turn',r.turn,'winner',r.w,'clicks',r.clicks,'rejected',r.rej,'errors',r.errs.length,'invariants',(r.inv||[]).length,JSON.stringify(r.errs.slice(0,3)),JSON.stringify(r.rejs||[]),JSON.stringify((r.inv||[]).slice(0,3)))}
  console.log('TOTAL clicks',C,'rejected',R,'errors',bad,'invariant violations',I);console.log('seen:',[...all].sort().join(' | '))})();
