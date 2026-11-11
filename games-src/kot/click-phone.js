#!/usr/bin/env node
// Phone clicker (jsdom, 2D fallback board, ?phone=1): plays whole games through the PHONE controls only
// (strip buttons, dice, chips, shop tiles + pop-up Buy/Sweep, cards' options, pop-up close) and checks 0 errors, no stalls,
// and no hidden hand evolutions of other monsters in the monster pop-up. Usage: node click-phone.js kot2.html [games=6]
const {JSDOM}=require('/tmp/claude-0/-home-user-spotify-to-ytmusic/5a36d2af-8697-5203-aeea-a0f2a3329615/scratchpad/node_modules/jsdom');const fs=require('fs');
const file=process.argv[2]||'kot2.html';const html=fs.readFileSync(file,'utf8');const N=+(process.argv[3]||6),OFF=+(process.argv[4]||0);
const CFG=[{mode:'solo',n:4,ex:0,evo:0},{mode:'solo',n:3,ex:1,evo:1},{mode:'hot',n:3,ex:0,evo:0},{mode:'hot',n:5,ex:1,evo:1},{mode:'solo',n:6,ex:1,evo:0},{mode:'ai',n:4,ex:0,evo:0},{mode:'solo',n:2,ex:0,evo:1},{mode:'hot',n:4,ex:1,evo:0}];
function run(cfg,seed){return new Promise(res=>{
  const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'http://localhost/?phone='+(process.env.PHONE||'1')});const w=dom.window,d=w.document;
  const errs=[],hid=[];w.addEventListener('error',e=>errs.push(e.message));w.console.error=(...a)=>errs.push(a.join(' '));w.console.warn=()=>{};
  w.eval(`ANIM=0;AIDELAY=0`);w.localStorage.setItem('ccs_tour2','1');
  w.eval(`UI.n=${cfg.n};UI.evo=${!!cfg.evo};if(${cfg.ex}){EXPS.forEach(x=>{if(x.k!=='evo')UI.ex[x.k]=true})}`);
  const phOn=w.eval('PHONE.on');if(process.env.PHONE!=='0'&&!phOn)errs.push('phone mode not on');
  const start=d.querySelector(`[data-start="${cfg.mode}"]`);if(!start){res({cfg,errs:['no start '+cfg.mode]});return}start.click();
  const seen=new Set();let last='',stall=0;const t0=Date.now();const click=el=>el.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));let r=seed;const rnd=a=>{r=(r*16807)%2147483647;return a[r%a.length]};
  const iv=setInterval(()=>{try{const G=w.eval('G');if(!G)return;const dk=d.querySelector('.gx-dock');
    // hidden-hand check on every pop-up that shows a monster
    const pc=d.getElementById('pcx');if(dk.dataset.card==='pop'&&G.mode==='solo'){const txt=pc.textContent;const me=w.eval('meSeat()');for(const p of G.pl){if(p.i===me)continue;for(const e of p.hand){const nm=w.eval(`evoName(${e})`);if(txt.includes(nm)&&!G.pl.some(q=>q.evo.includes(e)))hid.push(nm)}}}
    const m=d.getElementById('modal');
    if(m&&!m.classList.contains('hidden')){const b=[...m.querySelectorAll('button[data-opt]:not([disabled]),[data-a="closestats"]')].filter(b=>b.dataset.opt!=='x');if(b.length){seen.add('modal');click(rnd(b))}}
    const card=dk.dataset.card;
    if(card==='choice'){const bs=[...d.querySelectorAll('#choice [data-opt],#choice [data-a="story"]')].filter(b=>b.dataset.opt!=='x');if(bs.length){seen.add('choice:'+(d.querySelector('#choice h2')||{}).textContent);click(rnd(bs));return}}
    if(card==='coach'){const b=d.querySelector('[data-tour="skip"]');if(b){click(b);return}}
    if(card==='pop'||card==='advice'){const b=d.querySelector('#pcx [data-card]:not([disabled])');if(card==='pop'&&b&&Math.random()<.5){seen.add('buy in pop-up');click(b);return}const sw=d.querySelector('#pcx [data-act="sweep"]:not([disabled])');if(card==='pop'&&sw&&Math.random()<.2){seen.add('sweep in pop-up');click(sw);return}
      const x=d.querySelector('#pcx [data-ph="close"]')||d.querySelector('#advice [data-a="advise"]');if(x){click(x);return}}
    // random taps on chips / tiles / banner / bar Cards, then the real game buttons
    const hum=w.eval('humanTurn()');
    if(Math.random()<.12){const chips=[...d.querySelectorAll('.pchip')];if(chips.length){seen.add('chip');click(rnd(chips));return}}
    if(hum&&G.phase==='buy'&&Math.random()<.25){const t=[...d.querySelectorAll('#pshop .ptile')];if(t.length){seen.add('tile');click(rnd(t));return}}
    if(Math.random()<.03){const mk=d.querySelector('header.gx-bar [data-gx="dr-market"]');if(mk){seen.add('bar cards');click(mk);return}}
    const acts=[...d.querySelectorAll('#prompt [data-act]:not([disabled])')].filter(b=>b.dataset.act!=='sweep');if(acts.length&&hum){const b=rnd(acts);seen.add('act:'+b.dataset.act);click(b);return}
    const dice=[...d.querySelectorAll('.die[data-die]:not([disabled])')];if(dice.length&&hum&&Math.random()<.5){seen.add('die');click(rnd(dice));return}
    const sig=JSON.stringify([G.turn,G.active,G.dice,G.log.length,G.phase]);if(sig===last)stall++;else{stall=0;last=sig}
    if(stall>800){errs.push('STALL '+G.phase+' '+G.active+' '+JSON.stringify({ch:w.eval('UI.choice&&UI.choice.title'),intro:w.eval('UI.intro'),card:dk.dataset.card,chc:d.getElementById('choice').className,info:w.eval('UI.info'),modal:(d.getElementById('modal').className+'|'+d.getElementById('modal').textContent.slice(0,80)),busy:w.eval('UI.busy'),hum:hum}))}
    if(G.winner||G.turn>40||stall>800||Date.now()-t0>70000){clearInterval(iv);res({cfg,turn:G.turn,w:G.winner,errs,hid,seen:[...seen]});w.close()}
  }catch(e){errs.push(String(e.stack||e).slice(0,300));clearInterval(iv);res({cfg,errs,hid,seen:[...seen]});w.close()}},2)})}
(async()=>{let bad=0,hbad=0;const all=new Set();for(let i=OFF;i<OFF+N;i++){const cfg=CFG[i%CFG.length];const r=await run(cfg,i*7919+13);(r.seen||[]).forEach(x=>all.add(x));bad+=r.errs.length;hbad+=(r.hid||[]).length;console.log(JSON.stringify(cfg),'turn',r.turn,'winner',r.w,'errors',r.errs.length,r.errs.slice(0,2),'hidden-hand',(r.hid||[]).length)}
  console.log('TOTAL errors',bad,'hidden-hand violations',hbad,'games',N);console.log('seen:',[...all].sort().join(' | '));process.exit(bad||hbad?1:0)})();
