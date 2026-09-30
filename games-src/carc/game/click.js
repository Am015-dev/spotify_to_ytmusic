// random clicker: humans play only through the page's buttons and the 2D map (jsdom has no WebGL, so the 2D fallback is used)
const {JSDOM}=require('jsdom');const fs=require('fs');const html=fs.readFileSync(__dirname+'/rampart.html','utf8');
function run(cfg,seed){return new Promise(res=>{const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'http://localhost/'});const w=dom.window,d=w.document;
  const errs=[];w.addEventListener('error',e=>errs.push(e.message));w.console.error=(...a)=>errs.push(a.join(' '));w.console.warn=()=>{};
  const click=el=>el.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));const rnd=a=>a[Math.floor(Math.random()*a.length)];const seen=new Set();
  w.addEventListener('load',()=>{w.eval(`AIDELAY=0;ANIM=${cfg.anim?1:0};setSeed(${seed});try{localStorage.clear()}catch(e){}`);const q=s=>d.querySelector(s);
    click(q(`[data-np="${cfg.np}"]`));for(const k of ['river','ic','tb']){const cb=q(`[data-ex=${k}]`);if(cb&&cb.checked!==!!cfg.ex[k])click(cb)}
    for(let i=0;i<cfg.np;i++){const want=cfg.h.includes(i)?'human':'ai';if(w.eval(`UI.setup.seats[${i}]`)!==want)click(q(`[data-seat="${i}"]`));if(want==='ai'&&cfg.lv){for(let k=0;k<3&&w.eval(`UI.setup.lv[${i}]`)!==cfg.lv;k++)click(q(`[data-lv="${i}"]`))}}
    const g=q('[data-guide]');if(g&&g.checked!==!!cfg.guide)click(g)
    click(q('[data-ui=start]'));if(!w.eval('G'))errs.push('start failed');const so=q('[data-ui=storyok]');if(so){seen.add('story');click(so)}go()});
  let stall=0,last='',iv;const t0=Date.now();
  function go(){iv=setInterval(()=>{try{const G=w.eval('G');if(!G)return;
    if(G.over){clearInterval(iv);const sc=G.pl.map(p=>p.score);if(!d.querySelector('#dockbody table'))errs.push('no final score table');res({cfg,turn:G.turn,win:G.winText,sc,errs,seen});w.close();return}
    const hp=w.eval('me()');
    if(hp){const r=Math.random();
      if(r<.02){const t=rnd([...d.querySelectorAll('.gx-bar [data-gx]')]);click(t);seen.add('pop:'+t.dataset.gx);const x=d.querySelector('.gx-drawer.on .gx-x');if(x)click(x);return}
      if(r<.05){const a=d.querySelector('#dockbody [data-a=adv]');if(a){click(a);seen.add('advice:'+G.step);const ap=d.querySelector('#dockbody [data-ui=apply]');if(ap&&Math.random()<.7){click(ap);seen.add('advice-applied');}return}}
      if(r<.07){const b=d.querySelector('.gx-bar [data-a=guide]');click(b);seen.add('guide-toggle');return}
      if(G.step==='place'){const conf=d.querySelector('#dockbody [data-ui=confirm]');
        if(conf&&Math.random()<.5){if(Math.random()<.4){const rr=d.querySelector('#dockbody [data-ui=rotr]');if(rr){click(rr);seen.add('rotate')}}click(conf);seen.add('place');return}
        if(conf&&Math.random()<.1){click(d.querySelector('#dockbody [data-ui=cancel]'));seen.add('cancel');return}
        const cells=[...d.querySelectorAll('#map2d [data-cell]')];if(cells.length){click(rnd(cells));seen.add('cell');return}}
      if(G.step==='fig'){const r2=Math.random();const kinds=[...d.querySelectorAll('#dockbody [data-kind]')];if(kinds.length&&r2<.2){const k=rnd(kinds);click(k);seen.add('kind:'+k.dataset.kind);return}
        const spots=[...d.querySelectorAll('#map2d [data-spot]')];if(spots.length&&r2<.5){click(rnd(spots));seen.add('spot');return}
        const bs=[...d.querySelectorAll('#dockbody button[data-mv]')];if(bs.length){const b=rnd(bs);const m=JSON.parse(b.dataset.mv);seen.add('btn:'+m.act+(m.k?':'+m.k:''));click(b);return}}}
    const sig=JSON.stringify([G.turn,G.step,G.logN,w.eval('UI.ghost&&UI.ghost.k+UI.ghost.r')]);if(sig===last)stall++;else{stall=0;last=sig}
    const inv=w.eval('checkInvariants()');if(inv.length&&errs.length<5)errs.push('INV '+inv[0]);
    if(hp&&w.getComputedStyle(d.querySelector('.gx-dock')).visibility==='hidden')errs.push('dock hidden on decision');
    if(stall>4000||Date.now()-t0>280000){errs.push('STALL '+G.step+' turn '+G.turn);clearInterval(iv);res({cfg,turn:G.turn,errs,seen});w.close()}
  }catch(e){errs.push(String(e.stack||e).slice(0,300));clearInterval(iv);res({cfg,errs,seen});w.close()}},1)}})}
const games=[{np:2,h:[0],ex:{},guide:1},{np:2,h:[0,1],ex:{river:1},guide:0},{np:3,h:[1],ex:{ic:1},lv:'hard',guide:1},{np:4,h:[0,2],ex:{tb:1},lv:'easy'},{np:5,h:[0],ex:{river:1,ic:1,tb:1},anim:1,guide:1},{np:6,h:[0,1,2,3,4,5],ex:{river:1,ic:1,tb:1}},{np:2,h:[0],ex:{ic:1,tb:1},lv:'hard',anim:1}];
(async()=>{const all=new Set();let bad=0;const only=process.argv[2]!=null?process.argv[2].split(',').map(Number):games.map((_,i)=>i);
  for(const i of only){const r=await run(games[i],900+i);r.seen.forEach(x=>all.add(x));bad+=r.errs.length;console.log(JSON.stringify(games[i]),'turns',r.turn,r.win||'',JSON.stringify(r.sc||[]),'errors',r.errs.length,JSON.stringify(r.errs.slice(0,3)))}
  console.log('TOTAL errors',bad);console.log('seen:',[...all].sort().join(' | '))})()
