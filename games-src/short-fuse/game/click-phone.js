// Random clicker for the PHONE layout (jsdom, ?phone=1, no WebGL -> the kit's 2D board): human seats play ONLY through the phone UI:
// board tiles (the 2D board), the strip (#ps), the pop-up (#ppop) and the cards (#pc). Never the hidden dock.
// node click-phone.js [from] [to]   -> one line per game, then TOTAL errors ; also checks hidden wires (2D board backs) and the strip rack owner.
const {JSDOM,VirtualConsole}=(()=>{try{return require('../../node_modules/jsdom')}catch(e){return require('jsdom')}})();const fs=require('fs');
const html=fs.readFileSync(__dirname+'/shortfuse.html','utf8');
const CONF=[
 {name:'PHONE tutorial job1 solo',tut:1,anim:0},
 {name:'PHONE solo job4 3p anim (+replay)',job:4,np:3,seats:'solo',anim:1,replay:1},
 {name:'PHONE hot 2p job9 (+replay)',job:9,np:2,seats:'hot',anim:0,replay:1},
 {name:'PHONE hot 4p job12',job:12,np:4,seats:'hot',anim:0},
 {name:'PHONE watch 4p job23',job:23,np:4,seats:'watch',anim:0},
 {name:'PHONE solo 3p job10 timed+claims anim',job:10,np:3,seats:'solo',anim:1},
 {name:'PHONE solo 2p job19 timed',job:19,np:2,seats:'solo',anim:0},
 {name:'PHONE hot 3p job45 volunteers',job:45,np:3,seats:'hot',anim:0},
 {name:'PHONE solo 3p job38 flipped',job:38,np:3,seats:'solo',anim:0},
 {name:'PHONE solo 4p job13 red triple',job:13,np:4,seats:'solo',anim:1},
 {name:'PHONE solo 3p job48 yellow trio',job:48,np:3,seats:'solo',anim:0},
 {name:'PHONE solo 4p job66 bunker timed',job:66,np:4,seats:'solo',anim:0},
 {name:'PHONE solo 3p job42 circus',job:42,np:3,seats:'solo',anim:0},
 {name:'PHONE hot 4p job65 hot potato',job:65,np:4,seats:'hot',anim:1},
 {name:'PHONE solo 5p job31 handicap',job:31,np:5,seats:'solo',anim:0},
 {name:'PHONE solo 2p job3 gear',job:3,np:2,seats:'solo',anim:0},
 {name:'PHONE hot 4p job8 (all human)',job:8,np:4,seats:'hot',anim:0},
 {name:'PHONE solo 4p job26 declare',job:26,np:4,seats:'solo',anim:0},
 {name:'PHONE solo 3p job63 oxygen',job:63,np:3,seats:'solo',anim:0}];
function run(cf,seed){return new Promise(res=>{const errs=[];const vc=new VirtualConsole();vc.on('jsdomError',e=>errs.push('JSDOM '+String(e.message).slice(0,200)));vc.on('error',(...a)=>errs.push('ERR '+a.map(x=>x&&x.stack||x).join(' ').slice(0,500)));vc.on('warn',()=>{});
  const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://gns.test/?phone=1',virtualConsole:vc});const w=dom.window,d=w.document;
  const click=el=>el.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));const R=(()=>{let s=seed*7919+13;return ()=>{s=(s*16807)%2147483647;return (s-1)/2147483646}})();const rnd=a=>a[Math.floor(R()*a.length)];
  const seen=new Set();let hidden=0,clicks=0;
  w.addEventListener('load',()=>{try{w.eval(`AIDELAY=${cf.anim?15:0};ANIM=${cf.anim?1:0};UI.speed=${cf.anim?40:1};UI.tickRate=25;setSeed(${seed});setAiSeed(${seed})`);
    if(!w.eval('PX.on'))errs.push('phone layout not on');
    if(cf.tut){click(d.querySelector('[data-a=tutorial]'))}
    else{click(d.querySelector('[data-a=stplay]'));{const cb=d.querySelector('[data-a=stboard]');if(cb)click(cb)}click(d.querySelector(`[data-a=job][data-n="${cf.job}"]`));click(d.querySelector(`[data-a=np][data-v="${cf.np}"]`));click(d.querySelector(`[data-a=preset][data-v="${cf.seats}"]`));
      if(cf.seats==='solo'&&R()<.5)click(d.querySelector('[data-a=lv][data-v=easy]'));
      click(d.querySelector('[data-a=start]'))}
    const s=w.eval('UI.lastSetup');if(!cf.tut&&(s.job!==cf.job||s.np!==cf.np))errs.push('setup clicks failed '+JSON.stringify([s.job,s.np]));go()}catch(e){errs.push('BOOT '+e.stack);res({cf,errs,seen})}});
  let stall=0,last='',iv,replayed=0;const t0=Date.now();
  function go(){iv=setInterval(()=>{try{const G=w.eval('G');if(!G){return}
    // hidden information: every uncut wire not seen by the current viewer is a back on the board; the strip rack only for the device holder
    if(cf.seats==='hot'&&!G.over){const bad=w.eval(`(()=>{const v=viewer();let n=0;for(const el of document.querySelectorAll('#fb .sf2d-t')){const p=JSON.parse(el.getAttribute('data-sf'));const u=+String(p.id).replace(/^.*u/,'');const f=findU(u);if(!f||f.sl.cut)continue;const own=ownerOf(f.s);const may=v>=0&&((own===v&&!f.sl.flip)||(own!==v&&f.sl.flip));if(!may&&!el.classList.contains('back'))n++}
      const rk=document.querySelector('#ps .ps-rack');const has=rk&&!rk.hidden&&rk.querySelector('.pw');if(has&&(passTo()>=0||String(rk.dataset.owner)!==String(v)))n+=100;return n})()`);if(bad){hidden+=bad;if(errs.length<6)errs.push('HIDDEN wire/rack shown to the wrong seat: '+bad)}}
    if(G.over){const card=d.querySelector('#pc:not([hidden]) .over');
      if(!card&&!w.eval('PX.ovHide===G.over'))return;                              // wait one tick for the card
      clearInterval(iv);if(!card)errs.push('no game-over card');else seen.add('over:'+(G.over.win?'win':'boom'));
      const again=d.querySelector('#pc [data-a=again]');if(again)seen.add('again-button');
      if(card&&!d.querySelector('#pc [data-ph=dismiss]'))errs.push('over card has no See-the-table button');
      if(cf.replay&&!replayed&&again){replayed=1;seen.add('replayed');click(G.over.win&&d.querySelector('#pc [data-a=next]')?d.querySelector('#pc [data-a=next]'):again);go();return}
      res({cf,over:G.over,turns:G.turn,errs,seen,clicks,secs:Math.round((Date.now()-t0)/1000)});w.close();return}
    const q=s=>[...d.querySelectorAll(s)].filter(b=>!b.disabled&&!b.closest('[hidden]'));const r=R();
    // drawers now and then (bar buttons)
    if(r<.02){const t=rnd(q('.gx-bar [data-gx]'));if(t){click(t);clicks++;seen.add('pop:'+t.dataset.gx);const x=d.querySelector('.gx-drawer.on .gx-x');if(x)click(x)}return}
    const kind=w.eval('PX.card&&PX.card.kind');
    if(kind){seen.add('card:'+kind);
      if(kind==='brief'){click(q('#pc [data-a=briefok]')[0]);return}
      if(kind==='pass'){click(q('#pc [data-a=take]')[0]);clicks++;seen.add('pass-screen');return}
      if(kind==='coach'){const c=q('#pc [data-a=coach],#pc [data-a=coachok]');if(c.length){click(c[0]);seen.add('coach');return}}
      if(kind==='res'){const b=q('#pc [data-ph=resok]');if(b.length){click(b[0]);seen.add('res-continue');return}}
      if(kind==='q'){const qs=q('#pc [data-a=q]');const tiles=[...d.querySelectorAll('#fb .sf2d-hl')];if(tiles.length&&R()<.4){click(rnd(tiles));seen.add('q-by-tile')}else if(qs.length){seen.add('q:'+w.eval('G.q&&G.q.kind'));click(rnd(qs))}clicks++;return}
      if(kind==='over'){return}}
    const pop=d.querySelector('#ppop:not([hidden])');
    const board=[...d.querySelectorAll('#fb .sf2d-hl')];
    if(pop){seen.add('popup');
      const par=q('#ppop [data-a=param],#ppop [data-a=pickmove]');if(par.length){click(rnd(par));clicks++;seen.add('param');return}
      const ch=q('#ppop [data-a=choose]');if(ch.length){click(ch[0]);clicks++;seen.add('choose');return}
      const dm=q('#ppop [data-a=domulti]');if(dm.length){click(dm[0]);clicks++;seen.add('multi-go');return}
      if(pop.querySelector('.ph-v')){
        const go=q('#ppop [data-a=dual]');if(go.length&&R()<.85){click(go[0]);clicks++;seen.add('dual');return}
        const vb=q('#ppop [data-a=v],#ppop [data-a=v2]');if(vb.length&&R()<.75){click(rnd(vb));clicks++;seen.add('value');return}
        const oth=q('#ppop [data-a=grp],#ppop [data-a=tool],#ppop [data-a=two],#ppop [data-a=flipmode],#ppop [data-a=solo]');if(oth.length&&R()<.2){const b=rnd(oth);click(b);clicks++;seen.add('popup-'+b.dataset.a);return}
        if(board.length&&R()<.3){click(rnd(board));clicks++;seen.add('tile');return}
        const x=q('#ppop [data-ph=pclose]');if(x.length&&R()<.3){click(x[0]);seen.add('close-popup');return}return}
      const use=q('#ppop [data-a=grp],#ppop [data-a=offgrp],#ppop [data-a=tool]');if(use.length&&R()<.5){click(rnd(use));clicks++;seen.add('use-from-chip');return}
      if(board.length&&R()<.5){click(rnd(board));clicks++;return}
      const x=q('#ppop [data-ph=pclose]');if(x.length){click(x[0]);return}
      const can=q('#ppop [data-a=cancel]');if(can.length){click(can[0]);return}}
    // idle: the strip
    const acts=q('#ps .ps-acts [data-a]');
    const off=acts.filter(b=>b.dataset.a==='off');if(off.length&&R()<.6){const b=rnd(off);click(b);clicks++;seen.add('off:'+b.textContent.slice(0,12));return}
    if(r<.06){const o=q('#ps [data-ph=own]');if(o.length){click(rnd(o));seen.add('own-wire');return}}
    if(r<.1){const c=q('#ps [data-ph=chip]');if(c.length){click(rnd(c));seen.add('chip');return}}
    if(w.eval('(()=>{const V=UI.V;return !!(V&&V.seat>=0&&decider()===V.seat&&V.legal&&!G.q)})()')){
      if(acts.length&&R()<.3){const b=rnd(acts);click(b);clicks++;seen.add('act:'+b.dataset.a);return}
      if(board.length){click(rnd(board));clicks++;seen.add('tile');return}
      const sg=q('#ps [data-a=sugg]');if(sg.length){click(sg[0]);return}}
    const can=q('#ps [data-a=cancel]');if(can.length&&R()<.3){click(can[0]);return}
    const sig=JSON.stringify([G.logN,G.turn,G.step,!!G.q,w.eval('JSON.stringify(UI.sel)'),G.clock]);if(sig===last)stall++;else{stall=0;last=sig}
    const inv=w.eval('checkInvariants()');if(inv.length&&errs.length<5)errs.push('INV '+inv[0]);
    if(stall>4000||Date.now()-t0>240000){errs.push('STALL '+G.step+' q='+(G.q&&G.q.kind)+' side='+w.eval('sideToAct()')+' card='+kind+' ps='+(d.getElementById('ps').textContent||'').slice(0,160));clearInterval(iv);res({cf,over:G.over,errs,seen,clicks});w.close()}
  }catch(e){errs.push('LOOP '+String(e.stack||e).slice(0,400));clearInterval(iv);res({cf,errs,seen,clicks});w.close()}},2)}})}
(async()=>{const a=+(process.argv[2]||0),b=+(process.argv[3]||CONF.length-1);const all=new Set();let bad=0,n=0;const T=Date.now();
  for(let i=a;i<=b&&i<CONF.length;i++){const cf=CONF[i];const r=await run(cf,200+i+(+process.env.SEEDOFF||0));n++;r.seen.forEach(x=>all.add(x));bad+=r.errs.length;
    console.log(`[${i}] ${cf.name}: ${r.over?(r.over.win?'WIN':'BOOM '+r.over.why):'not over'} turns ${r.turns} clicks ${r.clicks} ${r.secs}s errors ${r.errs.length} ${JSON.stringify(r.errs.slice(0,3))}`)}
  console.log('TOTAL games',n,'errors',bad,'time',Math.round((Date.now()-T)/1000)+'s');console.log('seen:',[...all].sort().join(' | '))})();
