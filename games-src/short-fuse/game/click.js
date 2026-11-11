// Random clicker (jsdom, no WebGL -> the kit's 2D board): human seats play ONLY through the page's buttons and board tiles.
// node click.js [from] [to]   (config indices)   -> one line per game, then TOTAL errors
const {JSDOM,VirtualConsole}=require('../../node_modules/jsdom');const fs=require('fs');
const html=fs.readFileSync(__dirname+'/shortfuse.html','utf8');
const CONF=[
 {name:'tutorial job1 solo',tut:1,anim:0},
 {name:'solo job4 3p anim (+replay)',job:4,np:3,seats:'solo',anim:1,replay:1},
 {name:'hot 2p job9 (+replay)',job:9,np:2,seats:'hot',anim:0,replay:1},
 {name:'hot 4p job12',job:12,np:4,seats:'hot',anim:0},
 {name:'watch 4p job23',job:23,np:4,seats:'watch',anim:0},
 {name:'solo 3p job10 timed+claims anim',job:10,np:3,seats:'solo',anim:1},
 {name:'solo 2p job19 timed',job:19,np:2,seats:'solo',anim:0},
 {name:'hot 3p job45 volunteers',job:45,np:3,seats:'hot',anim:0},
 {name:'solo 3p job38 flipped',job:38,np:3,seats:'solo',anim:0},
 {name:'solo 4p job13 red triple',job:13,np:4,seats:'solo',anim:1},
 {name:'solo 3p job48 yellow trio',job:48,np:3,seats:'solo',anim:0},
 {name:'solo 4p job66 bunker timed',job:66,np:4,seats:'solo',anim:0},
 {name:'solo 3p job42 circus',job:42,np:3,seats:'solo',anim:0},
 {name:'hot 2p job54 red tide',job:54,np:2,seats:'hot',anim:0},
 {name:'solo 4p job34 mole',job:34,np:4,seats:'solo',anim:0},
 {name:'solo 3p job59 robot',job:59,np:3,seats:'solo',anim:0},
 {name:'hot 4p job65 hot potato',job:65,np:4,seats:'hot',anim:1},
 {name:'solo 5p job31 handicap',job:31,np:5,seats:'solo',anim:0},
 {name:'solo 2p job3 gear',job:3,np:2,seats:'solo',anim:0},
 {name:'hot 4p job8 (all human)',job:8,np:4,seats:'hot',anim:0},
 {name:'solo 4p job26 declare',job:26,np:4,seats:'solo',anim:0},
 {name:'solo 3p job47 maths',job:47,np:3,seats:'solo',anim:0},
 {name:'watch 3p job30 bus timed',job:30,np:3,seats:'watch',anim:1},
 {name:'solo 3p job63 oxygen',job:63,np:3,seats:'solo',anim:0}];
function run(cf,seed){return new Promise(res=>{const errs=[];const vc=new VirtualConsole();vc.on('jsdomError',e=>errs.push('JSDOM '+String(e.message).slice(0,200)));vc.on('error',(...a)=>errs.push('ERR '+a.map(x=>x&&x.stack||x).join(' ').slice(0,500)));vc.on('warn',()=>{});
  const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://gns.test/',virtualConsole:vc});const w=dom.window,d=w.document;
  const click=el=>el.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));const R=(()=>{let s=seed*7919+13;return ()=>{s=(s*16807)%2147483647;return (s-1)/2147483646}})();const rnd=a=>a[Math.floor(R()*a.length)];
  const seen=new Set();let hidden=0,clicks=0;
  w.addEventListener('load',()=>{try{w.eval(`AIDELAY=${cf.anim?15:0};ANIM=${cf.anim?1:0};UI.speed=${cf.anim?40:1};UI.tickRate=25;setSeed(${seed});setAiSeed(${seed})`);
    if(cf.tut){click(d.querySelector('[data-a=tutorial]'))}
    else{click(d.querySelector(`[data-a=job][data-n="${cf.job}"]`));click(d.querySelector(`[data-a=np][data-v="${cf.np}"]`));click(d.querySelector(`[data-a=preset][data-v="${cf.seats}"]`));
      if(cf.seats==='solo'&&R()<.5)click(d.querySelector('[data-a=lv][data-v=easy]'));
      const sel=d.querySelector('[data-ch="1"]');if(sel&&sel.options.length>2&&R()<.5){sel.value=sel.options[2].value;sel.dispatchEvent(new w.Event('change',{bubbles:true}))}
      click(d.querySelector('[data-a=start]'))}
    const s=w.eval('UI.lastSetup');if(!cf.tut&&(s.job!==cf.job||s.np!==cf.np))errs.push('setup clicks failed '+JSON.stringify([s.job,s.np]));go()}catch(e){errs.push('BOOT '+e.stack);res({cf,errs,seen})}});
  let stall=0,last='',iv,replayed=0;const t0=Date.now();
  function go(){iv=setInterval(()=>{try{const G=w.eval('G');if(!G){return}
    // hidden information: every uncut wire not seen by the current viewer is shown as a back
    if(cf.seats==='hot'&&!G.over){const bad=w.eval(`(()=>{const v=viewer();let n=0;for(const el of document.querySelectorAll('#fb .sf2d-t')){const p=JSON.parse(el.getAttribute('data-sf'));const u=+String(p.id).replace(/^.*u/,'');const f=findU(u);if(!f||f.sl.cut)continue;const own=ownerOf(f.s);const may=v>=0&&((own===v&&!f.sl.flip)||(own!==v&&f.sl.flip));if(!may&&!el.classList.contains('back'))n++}return n})()`);if(bad){hidden+=bad;if(errs.length<6)errs.push('HIDDEN wire shown to the wrong seat: '+bad)}}
    if(G.over){clearInterval(iv);const ov=d.querySelector('#main .over');if(!ov)errs.push('no game-over card');else seen.add('over:'+(G.over.win?'win':'boom'));
      // replay button works
      const again=d.querySelector('[data-a=again]');if(again)seen.add('again-button');
      if(cf.replay&&!replayed&&again){replayed=1;seen.add('replayed');const tiles=d.querySelectorAll('#fb .sf2d-t').length;click(G.over.win&&d.querySelector('[data-a=next]')?d.querySelector('[data-a=next]'):again);
        const t2=d.querySelectorAll('#fb .sf2d-t').length,n2=w.eval('G.st.reduce((a,s)=>a+s.w.length,0)');if(t2!==n2)errs.push('REPLAY board shows '+t2+' tiles for '+n2+' wires');go();return}
      res({cf,over:G.over,turns:G.turn,errs,seen,clicks,secs:Math.round((Date.now()-t0)/1000)});w.close();return}
    const q=s=>[...d.querySelectorAll(s)].filter(b=>!b.disabled);const r=R();
    // popups now and then
    if(r<.02){const t=rnd(q('.gx-bar [data-gx]'));if(t){click(t);clicks++;seen.add('pop:'+t.dataset.gx);const x=d.querySelector('.gx-drawer.on .gx-x');if(x)click(x)}return}
    {const bo=q('[data-a=briefok],[data-a=myack]');if(bo.length){click(bo[0]);seen.add('brief/ack');return}}
    if(r<.03){const c=q('#coach [data-a=coach]');if(c.length){click(c[0]);seen.add('coach');return}}
    const take=q('#main [data-a=take]');if(take.length){click(take[0]);clicks++;seen.add('pass-screen');return}
    const qs=q('#main [data-a=q]');if(qs.length){const tiles=[...d.querySelectorAll('#fb .sf2d-hl')];if(tiles.length&&R()<.5){click(rnd(tiles));seen.add('q-by-tile')}else{seen.add('q:'+w.eval('G.q&&G.q.kind'));click(rnd(qs))}clicks++;return}
    const main=d.getElementById('main');const has=s=>q('#main '+s);
    // waiting: off-turn buttons
    const off=has('[data-a=off]');if(off.length&&R()<.6){const b=rnd(off);click(b);clicks++;seen.add('off:'+b.textContent.slice(0,12));return}
    const par=has('[data-a=param],[data-a=pickmove]');if(par.length){click(rnd(par));clicks++;seen.add('param');return}
    const ch=has('[data-a=choose]');if(ch.length){click(ch[0]);clicks++;seen.add('choose');return}
    if(has('[data-a=domulti]').length||main.textContent.includes('Tap ')&&main.querySelector('[data-a=domulti]')){const dm=main.querySelector('[data-a=domulti]');if(dm&&!dm.disabled){click(dm);clicks++;seen.add('multi-go');return}
      const tiles=[...d.querySelectorAll('#fb .sf2d-hl')];if(R()<.08){click(main.querySelector('[data-a=cancel]'));return}if(tiles.length){click(rnd(tiles));clicks++;return}}
    const board=[...d.querySelectorAll('#fb .sf2d-hl')];
    if(main.querySelector('[data-a=dual],.vb')||main.querySelector('.steps')){
      const sg0=q('#tip [data-a=sugg]');if(sg0.length&&!main.querySelector('.vb.sel')&&R()<.6){click(sg0[0]);clicks++;seen.add('suggest');return}
      const go=has('[data-a=dual]');if(go.length&&R()<.85){click(go[0]);clicks++;seen.add('dual');return}
      const vb=has('[data-a=v],[data-a=v2]');if(vb.length&&R()<.7){click(rnd(vb));clicks++;seen.add('value');return}
      const sg=has('[data-a=sugg]').concat(q('#tip [data-a=sugg]'));if(sg.length&&R()<.45){click(sg[0]);clicks++;seen.add('suggest');return}
      const solo=has('[data-a=solo]');if(solo.length&&R()<.5){click(rnd(solo));clicks++;seen.add('solo');return}
      const oth=has('[data-a=grp],[data-a=multi],[data-a=tool],[data-a=two],[data-a=flipmode],[data-a=fu]');if(oth.length&&R()<.25){const b=rnd(oth);click(b);clicks++;seen.add(b.dataset.a+':'+(b.dataset.k||b.dataset.t||b.dataset.kind||''));return}
      if(board.length){click(rnd(board));clicks++;seen.add('tile');return}
      const can=has('[data-a=cancel]');if(can.length&&R()<.3){click(can[0]);return}}
    else{const gear=has('[data-a=offgrp],[data-a=offseat],[data-a=offdone]');if(gear.length&&R()<.05){const b=rnd(gear);click(b);clicks++;seen.add(b.dataset.a);return}
      const can=has('[data-a=cancel]');if(can.length&&R()<.2){click(can[0]);return}}
    const sig=JSON.stringify([G.logN,G.turn,G.step,!!G.q,w.eval('JSON.stringify(UI.sel)'),G.clock]);if(sig===last)stall++;else{stall=0;last=sig}
    const inv=w.eval('checkInvariants()');if(inv.length&&errs.length<5)errs.push('INV '+inv[0]);
    if(stall>4000||Date.now()-t0>240000){errs.push('STALL '+G.step+' q='+(G.q&&G.q.kind)+' side='+w.eval('sideToAct()')+' main='+main.textContent.slice(0,160));clearInterval(iv);res({cf,over:G.over,errs,seen,clicks});w.close()}
  }catch(e){errs.push('LOOP '+String(e.stack||e).slice(0,400));clearInterval(iv);res({cf,errs,seen,clicks});w.close()}},2)}})}
(async()=>{const a=+(process.argv[2]||0),b=+(process.argv[3]||CONF.length-1);const all=new Set();let bad=0,n=0;const T=Date.now();
  for(let i=a;i<=b&&i<CONF.length;i++){const cf=CONF[i];const r=await run(cf,100+i);n++;r.seen.forEach(x=>all.add(x));bad+=r.errs.length;
    console.log(`[${i}] ${cf.name}: ${r.over?(r.over.win?'WIN':'BOOM '+r.over.why):'not over'} turns ${r.turns} clicks ${r.clicks} ${r.secs}s errors ${r.errs.length} ${JSON.stringify(r.errs.slice(0,3))}`)}
  console.log('TOTAL games',n,'errors',bad,'time',Math.round((Date.now()-T)/1000)+'s');console.log('seen:',[...all].sort().join(' | '))})();
