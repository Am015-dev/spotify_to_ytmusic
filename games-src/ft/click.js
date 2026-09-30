// random clicker: humans play only through the page's buttons and board tiles (jsdom: no WebGL, so the 2D map is used)
const {JSDOM}=require('jsdom');const fs=require('fs');const html=fs.readFileSync(__dirname+'/sands.html','utf8');
function run(cfg,seed){return new Promise(res=>{const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'http://localhost/'});const w=dom.window,d=w.document;
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
    if(hp){const r=Math.random();
      if(r<.03){const t=rnd([...d.querySelectorAll('.gx-bar [data-gx]')]);click(t);seen.add('pop:'+t.dataset.gx);const x=d.querySelector('.gx-drawer.on .gx-x');if(x)click(x);return}
      if(w.eval('!!UI.autoPlan'))return;
      if(r<.05){click(d.querySelector('[data-a=advise]'));seen.add('advise');const a=d.querySelector('#dockbody .adv [data-mv],#dockbody [data-advplan]');if(a&&Math.random()<.6){click(a);seen.add('advise-do')}return}
      if(r<.2){const sh=[...d.querySelectorAll('#dockbody [data-planshow]')];if(sh.length&&Math.random()<.3){click(rnd(sh));seen.add('planshow')}const pd=[...d.querySelectorAll('#dockbody [data-plando]')];if(pd.length){click(rnd(pd));seen.add('plando');return}}
      if(r<.06){const s=[...d.querySelectorAll('#dockbody [data-pw]')];if(s.length){click(rnd(s));seen.add('pw');const t=w.eval('UI.pick.slice()');if(t.length){click(d.querySelector(`#map2d [data-tile="${rnd(t)}"]`));seen.add('pw-tile')}else click(d.querySelector('[data-ui=cancelpw]'));return}}
      if(r<.12){const s=[...d.querySelectorAll('#dockbody [data-dc]:not([disabled]),#dockbody [data-sell]')];if(s.length){click(rnd(s));return}}
      const pick=w.eval('UI.pick.slice()');
      if(pick.length&&r<.6){click(d.querySelector(`#map2d [data-tile="${rnd(pick)}"]`));seen.add('tile:'+G.step);return}
      const bs=[...d.querySelectorAll('#dockbody button[data-mv]:not([disabled])')];
      if(bs.length){const b=rnd(bs);const m=JSON.parse(b.dataset.mv);seen.add('btn:'+(m.act||m.ui)+(m.act==='q'?':'+(G.q&&G.q.kind||''):''));click(b);return}
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
