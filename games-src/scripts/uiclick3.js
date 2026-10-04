#!/usr/bin/env node
// Random clicker: plays every human flow through the real UI. Usage: node uiclick.js <game.html> [modes=F,S,hot] [tourKey]
// Reports errors, stalls and the set of actions/modals it saw. Also runs one short animated game per human mode.
const {JSDOM}=require('jsdom');const fs=require('fs');
const file=process.argv[2];const html=fs.readFileSync(file,'utf8');
const modes=(process.argv[3]||'F,S,hot').split(',');const TOUR=process.argv[4]||'';
function run(mode,anim,maxTurn){return new Promise(res=>{
  const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'http://localhost/'});const w=dom.window,d=w.document;
  const errs=[];w.addEventListener('error',e=>errs.push(e.message));w.console.error=(...a)=>errs.push(a.join(' '));
  w.eval(`ANIM=${anim};AIDELAY=0`);if(TOUR)w.localStorage.setItem(TOUR,'1');
  w.eval('UI.n='+(process.env.N||4));if(process.env.PRE)w.eval(process.env.PRE);const start=d.querySelector(`[data-start="${mode}"]`);if(!start){res({mode,errs:['no start button '+mode]});return}start.click();if(process.env.SETUP)w.eval(process.env.SETUP);
  const seen=new Set();let last='',stall=0;const t0=Date.now();const click=el=>el.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));const rnd=a=>a[Math.floor(Math.random()*a.length)];
  const iv=setInterval(()=>{try{const G=w.eval('G');const m=d.getElementById('modal');
    const tour=d.querySelector('[data-tour="skip"]');if(tour){click(tour);return}
    if(m&&!m.classList.contains('hidden')){const bs=[...m.querySelectorAll('button:not([disabled])')].filter(b=>b.dataset.opt!=='x');const h=m.querySelector('h2');if(h)seen.add('modal:'+h.textContent.replace(/\d+/g,'#').slice(0,28));if(bs.length){click(rnd(bs));return}}
    const pk=[...d.querySelectorAll('g.reg.pickable')];if(pk.length){seen.add('map pick');click(rnd(pk));return}
    const cards2=[...d.querySelectorAll('[data-card]:not([disabled])')];if(cards2.length&&Math.random()<.5){seen.add('card play');click(rnd(cards2));return}
    const acts=[...d.querySelectorAll('#prompt [data-act]:not([disabled])')];if(acts.length){const b=rnd(acts);seen.add('act:'+(b.firstChild&&b.firstChild.textContent));click(b);return}
    const cards=[...d.querySelectorAll('[data-card]:not([disabled])')];if(cards.length&&Math.random()<.3){seen.add('card play');click(cards[0]);return}
    const dice=[...d.querySelectorAll('.die:not([disabled])')];if(dice.length){click(dice[0]);return}
    const sig=JSON.stringify([G.turn,G.active,G.dice,G.log.length]);if(sig===last)stall++;else{stall=0;last=sig}
    if(stall>500)errs.push('STALL '+G.phase+' '+G.active);
    if(G.winner||G.turn>maxTurn||stall>500||Date.now()-t0>80000){clearInterval(iv);res({mode,anim,turn:G.turn,w:G.winner,errs,seen:[...seen]});w.close()}
  }catch(e){errs.push(String(e.stack||e));clearInterval(iv);res({mode,errs});w.close()}},anim?20:2)})}
(async()=>{const all=new Set();let bad=0;
  for(const m of modes){for(const [a,t] of [[0,30],[1,3]]){const r=await run(m,a,t);(r.seen||[]).forEach(x=>all.add(x));bad+=r.errs.length;console.log(m,'anim',a,'turn',r.turn,'winner',r.w,'errors',r.errs.length,JSON.stringify(r.errs.slice(0,3)))}}
  console.log('TOTAL errors',bad);console.log('seen:',[...all].sort().join(' | '))})();
