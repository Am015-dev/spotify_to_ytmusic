#!/usr/bin/env node
// Random clicker: plays every human flow through the real UI. Usage: node uiclick.js <game.html> [modes=F,S,hot] [tourKey]
// Env: PRE='js' before the start button is clicked, SETUP='js' right after. Pass the tour's localStorage key as the 3rd argument or the tour blocks every run.
// Reports errors, stalls and the set of actions/modals it saw. Also runs one short animated game per human mode.
const {JSDOM}=require('jsdom');const fs=require('fs');
const file=process.argv[2];const html=fs.readFileSync(file,'utf8');
const modes=(process.argv[3]||'F,S,hot').split(',');const TOUR=process.argv[4]||'';
function run(mode,anim,maxTurn){return new Promise(res=>{
  const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:process.env.URLQ||'http://localhost/'});const w=dom.window,d=w.document;
  const errs=[];w.addEventListener('error',e=>errs.push(e.message));w.console.error=(...a)=>errs.push(a.join(' '));
  w.eval(`ANIM=${anim};AIDELAY=0`);if(TOUR)w.localStorage.setItem(TOUR,'1');
  if(process.env.PRE)w.eval(process.env.PRE);const start=d.querySelector(`[data-start="${mode}"]`);if(!start){res({mode,errs:['no start button '+mode+' (this page has: '+[...d.querySelectorAll('[data-start]')].map(b=>b.dataset.start).join(',')+'; pass modes as the 2nd argument)']});return}start.click();if(process.env.SETUP)w.eval(process.env.SETUP);
  const seen=new Set();let last='',stall=0;const t0=Date.now();const click=el=>el.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));const rnd=a=>a[Math.floor(Math.random()*a.length)];
  let __n=0;const iv=setInterval(()=>{__n++;if(process.env.DBG&&__n%100===0)console.log('tick',__n,Date.now()-t0,w.eval('G&&[G.round,G.phase,G.winner,!!UI.info]'));try{const G=w.eval('G');const m=d.getElementById('modal');if(G&&(G.winner||Date.now()-t0>(+process.env.MAXMS||80000))){clearInterval(iv);res({mode,anim,turn:G.round,w:G.winner,errs,seen:[...seen]});w.close();return}
    const tour=d.querySelector('[data-tour="skip"]');if(tour){click(tour);return}
    if(m&&!m.classList.contains('hidden')){const bs=[...m.querySelectorAll('button:not([disabled])')].filter(b=>b.dataset.opt!=='x');const h=m.querySelector('h2');if(h)seen.add('modal:'+h.textContent.replace(/\d+/g,'#').slice(0,28));if(bs.length){click(rnd(bs));return}}
    const pk=[...d.querySelectorAll('g.reg.pickable')];if(pk.length){seen.add('map pick');click(rnd(pk));return}
    try{const hid=w.eval("(function(){if(!(window.PHN&&PHN.on)||!G||G.phase!=='plan')return 0;const ps=planSide();let b=0;window.__why=[];if(PHN.pop&&ship(PHN.pop.id)&&ship(PHN.pop.id).side!==ps&&PHN.pop.kind==='dial'){b++;window.__why.push('pop side '+ship(PHN.pop.id).side+' ps '+ps)}document.querySelectorAll('#ps [data-id]').forEach(e=>{if(ship(e.dataset.id).side!==ps)b++});const pp=document.getElementById('ppop');if(pp&&!pp.hidden&&PHN.pop&&PHN.pop.kind==='dial'&&ship(PHN.pop.id).side!==ps)b++;return b})()");if(hid)errs.push('HIDDEN-DIAL: the other side\'s dial UI is visible '+JSON.stringify(w.__why)+' '+w.eval('[G.phase,planSide(),UI.pass,!!document.querySelector("#modal .pass")]'));
      if(Math.random()<.25){const r=w.eval("(function(){if(!(window.PHN&&PHN.on)||!G||G.winner)return 0;const a=G.ships.filter(s=>s.alive);const s=a[Math.floor(Math.random()*a.length)];PHN.shipTap(s.id);return PHN.pop?PHN.pop.kind:'none'})()");seen.add('tap:'+r)}}catch(e2){errs.push('phone hook: '+e2)}
    const acts=[...d.querySelectorAll('#ppop button:not([disabled]), #pc button:not([disabled]), #ps button:not([disabled]), #prompt button:not([disabled]), #modal [data-a="passok"]')].filter(b=>!/^(new|rules|stats)$/.test(b.dataset.a||''));if(acts.length){const b=rnd(acts);seen.add('act:'+(b.firstChild&&b.firstChild.textContent));click(b);return}
    const cards=[...d.querySelectorAll('[data-card]:not([disabled])')];if(cards.length&&Math.random()<.3){seen.add('card play');click(cards[0]);return}
    const cards2=[...d.querySelectorAll('[data-card]:not([disabled])')];if(cards2.length&&Math.random()<.5){seen.add('card play');click(rnd(cards2));return}
    const dice=[...d.querySelectorAll('.die:not([disabled])')];if(dice.length){click(dice[0]);return}
    {const v=w.eval("typeof checkInvariants==='function'?checkInvariants():[]");if(v&&v.length&&errs.length<5)errs.push('INVARIANT: '+[].concat(v).slice(0,3).join('; '))}
    const sig=JSON.stringify([G.turn,G.active,G.dice,G.log.length]);if(sig===last)stall++;else{stall=0;last=sig}
    if(stall>500)errs.push('STALL '+G.phase+' '+G.active);
    if(G.winner||G.turn>maxTurn||stall>500||Date.now()-t0>80000){clearInterval(iv);res({mode,anim,turn:G.turn,w:G.winner,errs,seen:[...seen]});w.close()}
  }catch(e){errs.push(String(e.stack||e));clearInterval(iv);res({mode,errs});w.close()}},anim?20:2)})}
(async()=>{const all=new Set();let bad=0;
  for(const m of modes){for(const [a,t] of (process.env.ANIMS?JSON.parse(process.env.ANIMS):[[0,30],[1,3]])){const r=await run(m,a,t);(r.seen||[]).forEach(x=>all.add(x));bad+=r.errs.length;console.log(m,'anim',a,'turn',r.turn,'winner',r.w,'errors',r.errs.length,JSON.stringify(r.errs.slice(0,3)))}}
  console.log('TOTAL errors',bad);console.log('seen:',[...all].sort().join(' | '))})();
