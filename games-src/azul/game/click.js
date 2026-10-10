// random clicker: humans play only through the page's buttons and the 2D table (jsdom has no WebGL, so the SVG fallback is used)
const {JSDOM}=require('jsdom');const fs=require('fs');const html=fs.readFileSync(__dirname+'/sunglaze.html','utf8');
function run(cfg,seed){return new Promise(res=>{const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'http://localhost/'});const w=dom.window,d=w.document;
  const errs=[];w.addEventListener('error',e=>errs.push(e.message));w.console.error=(...a)=>errs.push(a.join(' '));
  const click=el=>el.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));const rnd=a=>a[Math.floor(Math.random()*a.length)];const seen=new Set();
  w.addEventListener('load',()=>{w.eval(`AIDELAY=0;ANIM=0;setSeed(${seed});try{localStorage.clear()}catch(e){}`);const q=s=>d.querySelector(s);
    click(q(`[data-np="${cfg.np}"]`));for(let i=0;i<cfg.np;i++){const want=cfg.h.includes(i)?'human':'ai';if(w.eval(`UI.setup.seats[${i}]`)!==want)click(q(`[data-seat="${i}"]`))}
    for(let i=0;i<cfg.np;i++)if(cfg.lv&&!cfg.h.includes(i)){while(w.eval(`UI.setup.lv[${i}]`)!==cfg.lv){click(q(`[data-lv="${i}"]`))}}
    for(const k of ['gray','prism']){const cb=q(`[data-ex=${k}]`);if(cb&&cb.checked!==!!cfg.ex[k]){cb.checked=!cb.checked;click(cb)}}
    click(q('[data-ui=start]'));if(!w.eval('G'))errs.push('start failed');const ok=q('[data-ui=story-ok]');if(!ok)errs.push('no story');else{seen.add('story');click(ok)}go()});
  let stall=0,last='',iv;const t0=Date.now();
  function go(){iv=setInterval(()=>{try{const G=w.eval('G');if(!G)return;
    if(G.over){clearInterval(iv);const endOk=!!d.querySelector('#dockbody table');if(!endOk)errs.push('no end table');res({cfg,round:G.round,win:G.winText,errs,seen});w.close();return}
    const hp=w.eval('me()');
    if(hp){const r=Math.random();
      if(r<.02){const t=rnd([...d.querySelectorAll('.gx-bar [data-gx]')]);click(t);seen.add('pop:'+t.dataset.gx);const x=d.querySelector('.gx-drawer.on .gx-x');if(x)click(x);return}
      if(r<.04){const a=d.querySelector('#dockbody [data-ui=advise]');if(a){click(a);seen.add('advise');const m=d.querySelector('#dockbody .adv [data-mv]');if(m&&Math.random()<.5){seen.add('advice-applied');click(m)}return}}
      if(r<.05){const t=d.querySelector('[data-a=coach]');click(t);seen.add('coach-toggle');return}
      if(G.phase==='wall'){const cells=[...d.querySelectorAll('#map2d [data-cell]')].filter(e=>w.eval('UI.hl.cells||[]').some(c=>c.r+','+c.c===e.dataset.cell));
        if(cells.length&&r<.5){click(rnd(cells));seen.add('map-cell');return}const bs=[...d.querySelectorAll('#dockbody button[data-mv]')];if(bs.length){click(rnd(bs));seen.add('btn-wall');return}}
      const sel=w.eval('UI.sel');
      if(!sel){if(r<.5){const t=[...d.querySelectorAll('#map2d [data-slot]')];if(t.length){click(rnd(t));seen.add('map-tile');return}}const b=[...d.querySelectorAll('#dockbody [data-pick]')];if(b.length){click(rnd(b));seen.add('pick-btn');return}}
      else{const tg=w.eval('UI.tgt');
        if(r<.08){const u=d.querySelector('#dockbody [data-ui=unsel]');if(u){click(u);seen.add('unsel');return}}
        if(r<.14){const pz=d.querySelector('#dockbody [data-ui=prism]');if(pz){click(pz);seen.add('prism-toggle');return}const pk=[...d.querySelectorAll('#dockbody .prompt [data-pick]')];if(pk.length){click(rnd(pk));seen.add('prism+glaze');return}}
        if(tg!=null&&r<.6){const pl=d.querySelector('#dockbody .btn.go[data-mv]');if(pl){click(pl);seen.add('place');return}}
        if(r<.8){const L=[...d.querySelectorAll('#map2d [data-line]')];const legal=w.eval('UI.hl.lines||[]').map(l=>String(l.r));const ok=L.filter(e=>legal.includes(e.dataset.line));if(ok.length){const e=rnd(ok);click(e);if(Math.random()<.5)click(e);seen.add('map-line');return}}
        const b=[...d.querySelectorAll('#dockbody [data-line]')];if(b.length){click(rnd(b));seen.add('line-btn');return}}}
    const sig=JSON.stringify([G.round,G.phase,G.logN,w.eval('JSON.stringify(UI.sel)'),w.eval('UI.tgt')]);if(sig===last)stall++;else{stall=0;last=sig}
    const inv=w.eval('checkInvariants()');if(inv.length&&errs.length<5)errs.push('INV '+inv[0]);
    if(stall>3000||Date.now()-t0>200000){errs.push('STALL '+G.phase+' me='+!!hp);clearInterval(iv);res({cfg,round:G.round,errs,seen});w.close()}
  }catch(e){errs.push(String(e.stack||e).slice(0,300));clearInterval(iv);res({cfg,errs,seen});w.close()}},1)}})}
const games=[{np:2,h:[0],ex:{}},{np:2,h:[0,1],ex:{}},{np:3,h:[1],ex:{gray:1},lv:'hard'},{np:4,h:[0,2],ex:{prism:1},lv:'easy'},{np:4,h:[0,1,2,3],ex:{gray:1,prism:1}},{np:3,h:[0,1,2],ex:{prism:1}},{np:2,h:[1],ex:{gray:1,prism:1}}];
(async()=>{const all=new Set();let bad=0;const only=process.argv[2]!=null?[+process.argv[2]]:games.map((_,i)=>i);
  for(const i of only){const r=await run(games[i],900+i);r.seen.forEach(x=>all.add(x));bad+=r.errs.length;console.log(JSON.stringify(games[i]),'round',r.round,r.win||'','errors',r.errs.length,JSON.stringify(r.errs.slice(0,3)))}
  console.log('TOTAL errors',bad);console.log('seen:',[...all].sort().join(' | '))})()
