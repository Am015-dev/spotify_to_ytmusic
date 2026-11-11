// random clicker: plays human castaways only through the page's buttons (jsdom, no WebGL -> 2D map)
const {JSDOM}=require('jsdom');const fs=require('fs');const html=fs.readFileSync('shipwreck.html','utf8');
function run(scen,chars,seed){return new Promise(res=>{const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'http://localhost/'});const w=dom.window,d=w.document;
  const errs=[];w.addEventListener('error',e=>errs.push(e.message));w.console.error=(...a)=>errs.push(a.join(' '));
  const click=el=>el.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));const rnd=a=>a[Math.floor(Math.random()*a.length)];
  w.addEventListener('load',()=>{w.eval(`AIDELAY=0;setSeed(${seed})`);const q=s=>d.querySelector(s);click(q(`[data-scen=${scen}]`));for(const k of ['carpenter','cook'])if(!chars.includes(k))click(q(`[data-char=${k}]`));for(const k of chars)if(!['carpenter','cook'].includes(k))click(q(`[data-char=${k}]`));if(seed%2)click(q('[data-diff=easy]'));
  if(w.eval('UI.setup.scen')!==scen||w.eval('UI.setup.chars.length')!==chars.length)errs.push('setup clicks failed');
  click(d.querySelector('[data-a=start]'));go()});const seen=new Set();let stall=0,last='';const t0=Date.now();let iv;
  function go(){iv=setInterval(()=>{try{const G=w.eval('G');const m=d.getElementById('modal');
    if(!m.hidden){const bs=[...m.querySelectorAll('button:not([disabled])')].filter(b=>!['new','rules','cards','close'].includes(b.dataset.a));const h=m.querySelector('h2');if(h)seen.add('modal:'+h.textContent.replace(/\d+/g,'#').slice(0,30));if(bs.length){click(rnd(bs));return}}
    else if(!d.getElementById('story').hidden){const st=d.getElementById('story');const k=st.querySelector('.scene');if(k)seen.add('scene:'+k.className.split(' ')[1]);const ans=[...st.querySelectorAll('[data-ans]')];if(ans.length){click(rnd(ans));seen.add('story-q');return}if(Math.random()<.02){const qk=st.querySelector('[data-a=quick]');if(qk){click(qk);seen.add('quick');return}}if(Math.random()<.03){const ph=rnd([...d.querySelectorAll('[data-phx]')]);if(ph){click(ph);seen.add('roadmap');return}}const nx=[...st.querySelectorAll('[data-a=next],[data-a=skip],[data-a=auto]')];const pick=Math.random()<.85?nx.find(b=>b.dataset.a==='next'):rnd(nx);if(pick){seen.add('story:'+pick.dataset.a);click(pick);return}}
    else if(G.over){clearInterval(iv);res({scen,round:G.round,over:G.over,errs,seen,secs:Math.round((Date.now()-t0)/1000)});w.close();return}
    else{const r=Math.random();
      if(r<.04){const t=rnd([...d.querySelectorAll('.gx-bar [data-gx]')]);if(t){click(t);seen.add('pop:'+t.dataset.gx);const x=d.querySelector('.gx-drawer.on .gx-x');if(x&&Math.random()<.5)click(x)}return}
      if(r<.10){const s=[...d.querySelectorAll('[data-skill]:not([disabled]),[data-item]:not([disabled]),[data-disc]:not([disabled]),[data-a=pile]:not([disabled])')];if(s.length){const b=rnd(s);seen.add('use:'+(b.dataset.skill||b.dataset.item||b.dataset.disc||'pile'));click(b);return}}
      if(r<.13){const s=[...d.querySelectorAll('[data-tile]')];if(s.length){click(rnd(s));seen.add('tile');return}}
      if(r<.16){const s=[...d.querySelectorAll('[data-rm]')];if(s.length){click(rnd(s));seen.add('unplace');return}}
      if(w.eval('planOpen()')&&w.eval('planProblems().length===0')&&r<.5){const g=d.querySelector('#step [data-a=go]');if(g){click(g);seen.add('go')}else{click(d.querySelector('#step [data-a=pnext]'));seen.add('pnext:'+w.eval('UI.ps.step'))}return}
      if(r<.28){const s2=[...d.querySelectorAll('[data-do]:not([disabled]),[data-cat],[data-tut]')];if(s2.length){const b=rnd(s2);seen.add(b.dataset.do!=null?'do':b.dataset.cat?'cat':'tut');click(b);return}}
      if(r<.2){const c=[...d.querySelectorAll('.tray [data-pawn],.pawnrow [data-pawn]:not(.set)')];if(c.length){click(rnd(c));return}}
      if(w.eval('planOpen()')&&r>=.28&&r<.4){const nv=[...d.querySelectorAll(Math.random()<.15?'#step [data-a=pback],[data-pgo],[data-phx]':'#step [data-a=pnext],#panel [data-a=rec],#panel [data-a=pick],#panel [data-a=pskip],[data-pq]')];if(nv.length){const b=rnd(nv);seen.add('wiz:'+(b.dataset.a||(b.dataset.pgo?'pgo':b.dataset.pq!=null?'pq':'phx')));click(b);return}}
      const adds=[...d.querySelectorAll('[data-place]:not([disabled])')];if(adds.length&&w.eval('planOpen()')){const b=rnd(adds);seen.add('place:'+JSON.parse(decodeURIComponent(b.dataset.place)).type);click(b);return}
      if(w.eval('planOpen()')&&Math.random()<(w.eval('planProblems().length')?.3:.05)){click(d.querySelector('#step [data-a=suggest]'));seen.add('suggest')}}
    const sig=JSON.stringify([G.round,G.phase,G.logN,G.plan.acts.length,!!G.q]);if(sig===last)stall++;else{stall=0;last=sig}
    const inv=w.eval('checkInvariants()');if(inv.length&&errs.length<5)errs.push('INV '+inv[0]);
    if(stall>1500||Date.now()-t0>120000){errs.push('STALL '+G.phase+' '+w.eval('JSON.stringify(planProblems())'));clearInterval(iv);res({scen,round:G.round,over:G.over,errs,seen});w.close()}
  }catch(e){errs.push(String(e.stack||e).slice(0,300));clearInterval(iv);res({scen,errs,seen});w.close()}},1)}})}
(async()=>{const all=new Set();const T=Date.now();let bad=0;const games=[['marooned',['carpenter','cook']],['hexed',['explorer']],['stranded',['carpenter','cook','soldier']],['settlers',['carpenter','cook','explorer','soldier']],['marooned',['explorer','soldier']],['hexed',['cook','carpenter']]];
  for(let i=0;i<games.length;i++){const [s,c]=games[i];const r=await run(s,c,500+i);r.seen.forEach(x=>all.add(x));bad+=r.errs.length;console.log(s,c.join('+'),'round',r.round,'secs',r.secs,r.over&&r.over.why,'errors',r.errs.length,JSON.stringify(r.errs.slice(0,3)))}
  console.log('TOTAL errors',bad,'time',Math.round((Date.now()-T)/1000)+'s');console.log('seen:',[...all].sort().join(' | '))})()
