// board-first phone table, random clicker (jsdom, ?phone=1): humans play only by tapping tiles, racks, wall spaces, chips and the menu
// checks: no errors, invariants after every move, the mirror (BF.disp) equals the game whenever nothing is animating,
// a tap on a rack that can't take the tiles does nothing, the line under the table is <= 8 words, the result card shows at the end
const {JSDOM}=require('jsdom');const fs=require('fs');const html=fs.readFileSync(__dirname+'/sunglaze.html','utf8');
function run(cfg,seed){return new Promise(res=>{const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'http://localhost/?phone=1'});const w=dom.window,d=w.document;
  const errs=[];w.addEventListener('error',e=>errs.push(e.message));w.console.error=(...a)=>errs.push(a.join(' '));
  const click=el=>el.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));const rnd=a=>a[Math.floor(Math.random()*a.length)];const seen=new Set();const E=s=>w.eval(s);
  w.addEventListener('load',()=>{E(`AIDELAY=0;ANIM=0;setSeed(${seed});try{localStorage.clear()}catch(e){}`);const q=s=>d.querySelector(s);
    if(E('BF.on')!==true)errs.push('board-first table off');
    click(q(`[data-np="${cfg.np}"]`));for(let i=0;i<cfg.np;i++){const want=cfg.h.includes(i)?'human':'ai';if(E(`UI.setup.seats[${i}]`)!==want)click(q(`[data-seat="${i}"]`))}
    for(let i=0;i<cfg.np;i++)if(cfg.lv&&!cfg.h.includes(i)){while(E(`UI.setup.lv[${i}]`)!==cfg.lv){click(q(`[data-lv="${i}"]`))}}
    for(const k of ['gray','prism']){const cb=q(`[data-ex=${k}]`);if(cb&&cb.checked!==!!cfg.ex[k]){click(cb);if(cb.checked!==!!cfg.ex[k]){cb.checked=!!cfg.ex[k];click(cb)}}if(E(`UI.setup.ex.${k}`)!==!!cfg.ex[k])errs.push("variant "+k+" not set")}
    click(q('[data-ui=start]'));if(!E('G'))errs.push('start failed');const ok=q('[data-ui=story-ok]');if(!ok)errs.push('no story');else{seen.add('story');click(ok)}go()});
  let stall=0,last='',iv;const t0=Date.now();
  const synced=()=>E(`(()=>{const a=BF.disp,b=bfClone(G);return JSON.stringify([a.fac,a.ctr,a.markerIn,a.pl.map(p=>[p.score,p.lines,p.wall,p.floor])])===JSON.stringify([b.fac,b.ctr,b.markerIn,b.pl.map(p=>[p.score,p.lines,p.wall,p.floor])])})()`);
  function go(){iv=setInterval(()=>{try{const G=E('G');if(!G)return;if(E('BF.busy'))return;
    const say=(d.querySelector('#bf .bf-say')||{}).textContent||'';if(say.trim().split(/\s+/).length>8&&errs.length<8)errs.push('hint over 8 words: '+say);
    if(E('BF.errs.length'))errs.push('BF '+E('BF.errs.join("; ")'));
    if(!synced()&&errs.length<8)errs.push('mirror out of step at '+G.logN);
    if(G.over){clearInterval(iv);if(!d.querySelector('#bf .bf-res'))errs.push('no result card');else{seen.add('result');click(d.querySelector('#bf .bf-res [data-bf=close]'));if(!d.querySelector('#bf [data-bf=res]'))errs.push('no Result button after closing');}
      res({cfg,round:G.round,win:G.winText,errs,seen});w.close();return}
    const hp=E('me()');
    if(hp){const r=Math.random();
      if(r<.02){const t=rnd(['[data-bf=menu]','[data-bfchip]']);const e=d.querySelector('#bf '+t);if(e){click(e);if(!d.querySelector('#bf .bf-ov:not([hidden]) .bf-card'))errs.push('no pop-up after '+t);seen.add('open:'+t);click(d.querySelector('#bf .bf-ov'));if(!d.querySelector('#bf .bf-ov[hidden]'))errs.push('pop-up did not close');return}}
      if(r<.04){const a=d.querySelector('#bf #bulbbtn');if(a){click(a);seen.add('hint');return}}
      if(G.phase==='wall'){const cells=[...d.querySelectorAll('#bf [data-bfcell]')];if(cells.length){click(rnd(cells));seen.add('wall-cell');return}errs.push('wall question without glowing spaces');return}
      const sel=E('UI.sel');
      if(!sel){if(r<.1){const k=[...d.querySelectorAll('#bf [data-bfsrc]')];if(k.length){click(rnd(k));seen.add('kiln-tap');return}}
        const t=[...d.querySelectorAll('#bf .bf-table [data-k^="f"],#bf .bf-table [data-k^="c_"]')];if(t.length){click(rnd(t));seen.add('tile');if(!E('UI.sel'))errs.push('tile tap did not lift anything');return}return}
      const up=d.querySelectorAll('#bf .bf-table .bf-t.up:not(.sun)').length;const want=E(`(()=>{const a=UI.sel.src<0?G.ctr:G.fac[UI.sel.src];return a.filter(t=>t===UI.sel.c||(t===PRISM&&UI.sel.j)).length})()`);if(up!==want)errs.push(`lifted ${up} of ${want}`);
      const okRows=[...d.querySelectorAll('#bf .bf-row.ok')].map(e=>+e.dataset.bfrow);const legal=E('[...new Set(movesFor(UI.sel).map(m=>m.line))].filter(r=>r<5)');if(JSON.stringify(okRows.sort())!==JSON.stringify(legal.sort()))errs.push('glowing racks '+okRows+' but legal '+legal);
      if(r<.06){const pz=d.querySelector('#bf [data-bf=prism]');if(pz){click(pz);seen.add('prism-toggle');return}}
      if(r<.1){const dim=[...d.querySelectorAll('#bf .bf-row.dim')];if(dim.length){const n=G.logN;click(rnd(dim));if(E('G.logN')!==n)errs.push('a dim rack took tiles');seen.add('dim-rack');return}}
      if(r<.14){const t=[...d.querySelectorAll('#bf .bf-table [data-k^="f"],#bf .bf-table [data-k^="c_"]')];if(t.length){click(rnd(t));seen.add('re-pick');return}}
      if(r<.17){click(d.querySelector('#bf .bf-top'));seen.add('deselect');return}
      const o=[...d.querySelectorAll('#bf .bf-row.ok')];if(o.length&&r<.92){click(rnd(o));seen.add('rack');return}
      const fl=d.querySelector('#bf .bf-floor.ok');if(fl){click(fl);seen.add('floor');return}}
    const sig=JSON.stringify([G.round,G.phase,G.logN,E('JSON.stringify(UI.sel)')]);if(sig===last)stall++;else{stall=0;last=sig}
    const inv=E('checkInvariants()');if(inv.length&&errs.length<5)errs.push('INV '+inv[0]);
    if(stall>3000||Date.now()-t0>200000){errs.push('STALL '+G.phase+' me='+!!hp);clearInterval(iv);res({cfg,round:G.round,errs,seen});w.close()}
  }catch(e){errs.push(String(e.stack||e).slice(0,300));clearInterval(iv);res({cfg,errs,seen});w.close()}},1)}})}
const games=[{np:2,h:[0],ex:{}},{np:2,h:[0,1],ex:{}},{np:3,h:[1],ex:{gray:1},lv:'hard'},{np:4,h:[0,2],ex:{prism:1},lv:'easy'},{np:4,h:[0,1,2,3],ex:{gray:1,prism:1}},{np:3,h:[0,1,2],ex:{prism:1}},{np:2,h:[1],ex:{gray:1,prism:1}}];
(async()=>{const all=new Set();let bad=0;const only=process.argv[2]!=null?[+process.argv[2]]:games.map((_,i)=>i);
  for(const i of only){const r=await run(games[i],900+i);r.seen.forEach(x=>all.add(x));bad+=r.errs.length;console.log(JSON.stringify(games[i]),'round',r.round,r.win||'','errors',r.errs.length,JSON.stringify(r.errs.slice(0,3)))}
  console.log('TOTAL errors',bad);console.log('seen:',[...all].sort().join(' | '))})()
