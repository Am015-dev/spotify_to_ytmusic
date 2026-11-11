// random clicker: humans play only through the page's buttons and board tiles (jsdom: no WebGL, so the 2D map is used)
const {JSDOM}=require('jsdom');const fs=require('fs');const html=fs.readFileSync(__dirname+'/'+(process.env.FILE||'sands.html'),'utf8');
function run(cfg,seed){return new Promise(res=>{const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'http://localhost/?phone=1'});const w=dom.window,d=w.document;
  const errs=[];w.addEventListener('error',e=>errs.push(e.message));w.console.error=(...a)=>errs.push(a.join(' '));
  const click=el=>el.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));const rnd=a=>a[Math.floor(Math.random()*a.length)];const seen=new Set();
  w.addEventListener('load',()=>{w.eval(`AIDELAY=0;ANIM=0;setSeed(${seed})`);const q=s=>d.querySelector(s);{const op=q('[data-ui=play]');if(!op)errs.push('no opening scene');else{seen.add('opening');click(op)}}
    click(q(`[data-np="${cfg.np}"]`));for(let i=0;i<cfg.np;i++){const want=cfg.h.includes(i)?'human':'ai';if(w.eval(`UI.setup.seats[${i}]`)!==want)click(q(`[data-seat="${i}"]`))}
    for(const k of ['artisans','sultan','thieves','promos']){const cb=q(`[data-ex=${k}]`);if(cb&&!cb.disabled&&cb.checked!==!!cfg.ex[k]){cb.checked=!cb.checked;click(cb)}}
    click(q('[data-ui=start]'));if(!w.eval('G'))errs.push('start failed');go()});
  let stall=0,last='',iv;const t0=Date.now();
  function go(){iv=setInterval(()=>{try{const G=w.eval('G');if(!G)return;
    if(G.over){clearInterval(iv);res({cfg,round:G.round,win:G.winText,errs,seen});w.close();return}
    const hp=w.eval('me()');
    if(hp){const q=s=>d.querySelector(s);const vis=e=>e&&!e.hidden;const pc=q('#pc'),pp=q('#ppop'),ps=q('#ps');const r=Math.random();
      if(!w.eval('document.documentElement.classList.contains("ph")'))errs.push('ph class missing');
      if(vis(pc)){const c=[...pc.querySelectorAll('button')].filter(b=>!b.disabled&&!(b.dataset.mv||'').includes('"new"'));if(!c.length){errs.push('card without button: '+pc.dataset.k);return}const b=rnd(c);seen.add('card:'+pc.dataset.k);click(b);return}
      if(w.eval('!!UI.autoPlan'))return;
      if(r<.04){const k=rnd([...ps.querySelectorAll('[data-ph=open]')]);if(k){click(k);seen.add('pop:'+k.dataset.k)}return}
      if(r<.07){const t=rnd([...d.querySelectorAll('#map2d [data-tile]')]);if(t){click(t);seen.add('tap-any-tile')}return}
      if(r<.09&&vis(pp)){const x=pp.querySelector('[data-ph=close]');if(x){click(x);seen.add('close:'+pp.dataset.k)}return}
      if(r<.10){click(q('.gx-bar [data-a=advise]'));seen.add('advise');return}
      const pick=w.eval('UI.pick.slice()');
      if(pick.length&&r<.5){click(d.querySelector(`#map2d [data-tile="${rnd(pick)}"]`));seen.add('tile:'+G.step);return}
      let c=vis(pp)?[...pp.querySelectorAll('button')]:[...ps.querySelectorAll('button[data-plando],button[data-ph=reopen],button[data-ui=cancelpw]')];
      c=c.filter(b=>!b.disabled&&!(b.dataset.mv||'').includes('"new"')&&b.dataset.ph!=='close');
      if(c.length){const b=rnd(c);seen.add('btn:'+(vis(pp)?pp.dataset.k:'strip'));click(b);return}
      if(pick.length){click(d.querySelector(`#map2d [data-tile="${rnd(pick)}"]`));return}}
    const sig=JSON.stringify([G.round,G.phase,G.step,G.logN,!!G.q,G.move&&G.move.hand.length]);if(sig===last)stall++;else{stall=0;last=sig}
    const inv=w.eval('checkInvariants()');if(inv.length&&errs.length<5)errs.push('INV '+inv[0]);
    if(stall>3000||Date.now()-t0>270000){errs.push('STALL '+G.phase+'/'+G.step+' q='+(G.q&&G.q.title)+' '+w.eval('JSON.stringify({cur:G.cur,human:P(G.cur).human,move:G.move,auto:!!UI.autoPlan,pick:UI.pick,modal:UI.modal,timer:!!aiTimer,vm:validMoves(G.cur).length,ai:(()=>{try{return aiMove(G.cur)}catch(e){return String(e)}})(),spd:UI.speed,pause:UI.pause,AID:AIDELAY})'));clearInterval(iv);res({cfg,round:G.round,errs,seen});w.close()}
  }catch(e){errs.push(String(e.stack||e).slice(0,300));clearInterval(iv);res({cfg,errs,seen});w.close()}},1)}})}
const ALL={artisans:1,sultan:1,thieves:1,promos:1};
const games=[{np:2,h:[0],ex:{}},{np:2,h:[0,1],ex:{promos:1}},{np:3,h:[1],ex:{artisans:1}},{np:4,h:[0,2],ex:{thieves:1,promos:1}},{np:5,h:[0],ex:{sultan:1}},{np:2,h:[0],ex:ALL},{np:3,h:[0,1,2],ex:ALL}];
(async()=>{const all=new Set();let bad=0;const only=process.argv[2]!=null?[+process.argv[2]]:games.map((_,i)=>i);
  for(const i of only){const r=await run(games[i],(+process.env.SEEDB||900)+i);r.seen.forEach(x=>all.add(x));bad+=r.errs.length;console.log(JSON.stringify(games[i]),'round',r.round,r.win||'','errors',r.errs.length,JSON.stringify(r.errs.slice(0,3)))}
  console.log('TOTAL errors',bad);console.log('seen:',[...all].sort().join(' | '))})()
