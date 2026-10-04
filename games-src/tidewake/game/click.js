// Random clicker (jsdom, no WebGL -> the kit's 2D board): human seats play ONLY through the page's buttons and board squares.
// node click.js [from] [to]   -> one line per game, then TOTAL errors
const {JSDOM,VirtualConsole}=require('../../node_modules/jsdom');const fs=require('fs');
const html=fs.readFileSync(__dirname+'/tidewake.html','utf8');
const E=(...k)=>Object.fromEntries(k.map(x=>[x,1]));
const CONF=[
 {name:'guided 2p',guided:1,anim:0},
 {name:'me 3p standard anim',mode:'me',np:3,anim:1},
 {name:'hot 2p',mode:'hot',np:2},
 {name:'hot 3p all expansions',mode:'hot',np:3,exp:['rift','wave','maelstrom','cannon']},
 {name:'watch 4p',mode:'watch',np:4},
 {name:'me 5p rift',mode:'me',np:5,exp:['rift']},
 {name:'me 4p wave anim',mode:'me',np:4,exp:['wave'],anim:1},
 {name:'hot 4p maelstrom+cannon anim',mode:'hot',np:4,exp:['maelstrom','cannon'],anim:1},
 {name:'solo',mode:'me',variant:'solo'},
 {name:'easy solo all exp',mode:'me',variant:'easysolo',exp:['rift','cannon','wave','maelstrom']},
 {name:'teams 4p me',mode:'me',np:4,variant:'teams'},
 {name:'teams 6p hot',mode:'hot',np:6,variant:'teams',exp:['cannon','rift']},
 {name:'watch 8p all exp',mode:'watch',np:8,exp:['rift','wave','maelstrom','cannon']},
 {name:'me 2p cannon+rift, timer',mode:'me',np:2,exp:['cannon','rift'],qt:1},
 {name:'hot 2p no leviathans',mode:'hot',np:2,noMon:1},
 {name:'mixed hot 4p (2 humans)',mode:'hot',np:4,mixed:[2,3],exp:['rift','cannon']},
 {name:'me 7p all exp anim',mode:'me',np:7,exp:['rift','wave','maelstrom','cannon'],anim:1},
 {name:'solo watch (computer)',mode:'watch',variant:'solo'},
 // phone layout: humans play through board taps + the pop-up
 {name:'PHONE guided 2p',guided:1,anim:0,phone:1},
 {name:'PHONE me 3p anim',mode:'me',np:3,anim:1,phone:1},
 {name:'PHONE hot 3p all exp',mode:'hot',np:3,exp:['rift','wave','maelstrom','cannon'],phone:1},
 {name:'PHONE me 4p rift+cannon anim',mode:'me',np:4,exp:['rift','cannon'],anim:1,phone:1},
 {name:'PHONE teams 4p me',mode:'me',np:4,variant:'teams',phone:1},
 {name:'PHONE solo',mode:'me',variant:'solo',phone:1},
 {name:'PHONE easy solo all exp',mode:'me',variant:'easysolo',exp:['rift','cannon','wave','maelstrom'],phone:1},
 {name:'PHONE mixed hot 4p',mode:'hot',np:4,mixed:[2,3],exp:['rift','cannon','wave','maelstrom'],anim:1,phone:1},
 {name:'PHONE me 2p cannon+rift timer',mode:'me',np:2,exp:['cannon','rift'],qt:1,phone:1}];
function run(cf,seed){return new Promise(res=>{const errs=[];const vc=new VirtualConsole();vc.on('jsdomError',e=>errs.push('JSDOM '+String(e.message).slice(0,200)+(e.detail?String(e.detail.stack||e.detail).slice(0,300):'')));vc.on('error',(...a)=>errs.push('ERR '+a.map(x=>x&&x.stack||x).join(' ').slice(0,500)));vc.on('warn',()=>{});
  const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://gns.test/'+(cf.phone?'?phone=1':''),virtualConsole:vc,beforeParse(win){if(cf.phone){Object.defineProperty(win,'innerWidth',{value:390,configurable:true});Object.defineProperty(win,'innerHeight',{value:844,configurable:true})}}});const w=dom.window,d=w.document;
  const click=el=>el.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));const R=(()=>{let s=seed*7919+13;return ()=>{s=(s*16807)%2147483647;return (s-1)/2147483646}})();const rnd=a=>a[Math.floor(R()*a.length)];
  const seen=new Set();let hidden=0,clicks=0,mism=0,mm=0;
  w.addEventListener('load',()=>{try{w.eval(`AIDELAY=${cf.anim?10:0};ANIM=${cf.anim?1:0};UI.speed=${cf.anim?40:1};UI.qTime=${cf.qt||0};UI.tickRate=${cf.qt?60:1};setSeed(${seed});setAiSeed(${seed});TWKit.setSpeed(${cf.anim?40:1})`);
    if(cf.guided)click(d.querySelector('[data-a=guided]'));
    else{if(cf.variant)click(d.querySelector(`[data-a=var][data-v=${cf.variant}]`));click(d.querySelector(`[data-a=mode][data-v=${cf.mode}]`));
      if(cf.np&&!cf.variant)click(d.querySelector(`[data-a=np][data-v="${cf.np}"]`));
      for(const k of cf.exp||[]){const c=d.querySelector(`[data-a=exp][data-k=${k}]`);c.checked=true;c.dispatchEvent(new w.Event('change',{bubbles:true}))}
      if(cf.noMon){const c=d.querySelector('[data-a=nomon]');c.checked=true;c.dispatchEvent(new w.Event('change',{bubbles:true}))}
      for(const i of cf.mixed||[]){click(d.querySelector(`[data-a=seath][data-i="${i}"][data-v="0"]`))}
      for(let i=0;i<(cf.np||1);i++){const l=d.querySelector(`[data-a=lv][data-i="${i}"]`);if(l){l.value=rnd(['easy','normal','hard']);l.dispatchEvent(new w.Event('change',{bubbles:true}))}}
      const sel=d.querySelector('[data-a=col][data-i="0"]');if(sel&&R()<.5){sel.value='5';sel.dispatchEvent(new w.Event('change',{bubbles:true}))}
      click(d.querySelector('[data-a=start]'))}
    if(!w.eval('UI.started'))errs.push('start click failed');
    const np=w.eval('G.np');if(!cf.guided&&!cf.variant&&np!==Math.max(cf.np,cf.variant==='teams'?4:0))errs.push('np '+np);go()}catch(e){errs.push('BOOT '+e.stack);res({cf,errs,seen})}});
  let stall=0,last='',iv,replayed=0,steps=0;const t0=Date.now();
  function go(){iv=setInterval(()=>{try{const G=w.eval('G');if(!G)return;steps++;
    const holder=w.eval('UI.holder'),hot=w.eval('hotSeat()'),humans=w.eval('humans()');
    // hidden information: no hand drawn face up unless it belongs to the seat holding the device (or the one human)
    for(const el of d.querySelectorAll('[data-owner][data-up="1"]')){const own=+el.getAttribute('data-owner');const vs=w.eval('viewSeat()');if(own!==vs){hidden++;if(errs.length<6)errs.push('HIDDEN hand of '+own+' face up for viewer '+vs)}
      if(hot&&own!==holder){hidden++;if(errs.length<6)errs.push('HIDDEN hand of '+own+' face up, holder '+holder)}}
    if(!humans.length||humans.length>=1){for(const el of d.querySelectorAll('[data-crewhand][data-up="1"]'))if(humans.length){hidden++;errs.push('HIDDEN crew hand face up')}}
    if(hot&&!w.eval('UI.busy')){const dd=w.eval('sideToAct()');if(dd>=0&&G.seats[dd].human&&holder!==dd&&d.querySelector('#dockbody [data-hand]')){hidden++;errs.push('hand shown before the pass screen was taken')}}
    if(G.over&&w.eval('UI.busy'))return; // the result card waits until the replay has shown what sank the junks
    if(G.over){clearInterval(iv);const ov=d.querySelector('#dockbody [data-over]');if(!ov)errs.push('no game-over card');else seen.add('over');
      const again=d.querySelector('[data-a=again]');if(cf.replay===undefined&&again&&!replayed&&R()<.3){replayed=1;seen.add('again');click(again);const g2=w.eval('G');if(!g2||g2.over||g2.turn>1)errs.push('replay did not start');go();return}
      res({cf,over:G.over,turns:G.turn,errs,seen,clicks,hidden,mism,secs:Math.round((Date.now()-t0)/1000)});w.close();return}
    const PSEL=s=>cf.phone?s.split(',').map(x=>x.trim()).flatMap(x=>x.startsWith('#dockbody ')?['#ps','#ppop','#pc'].map(r=>r+' '+x.slice(10)):x.startsWith('#coach ')?['#pc '+x.slice(7)]:[x]).join(','):s;
    const q=s=>[...d.querySelectorAll(PSEL(s))].filter(b=>!b.disabled);const r=R();
    if(cf.phone&&!w.eval('UI.busy')){ // phone: board taps + pop-up
      const ph=w.eval('({pop:PH.pop,on:PH.on,card:PH.cur&&PH.cur.kind})');if(!ph.on){errs.push('phone mode not on');clearInterval(iv);res({cf,errs,seen,clicks});w.close();return}
      const sqEl=(c,rr)=>d.querySelector(`#fb [data-c="${c}"][data-r="${rr}"]`);
      const dd=w.eval('sideToAct()');const mine=dd>=0&&G.seats[dd].human&&!w.eval('mustPass(sideToAct())');
      if(mine&&!G.q&&!G.over&&!ph.card){
        if(G.phase==='setup'){if(!d.querySelector('#ppop:not([hidden]) [data-a=startmark]')&&R()<.9){const info=w.eval('startInfo(sideToAct()).map(o=>[o.m.x,o.m.y])');const o=rnd(info);const t=sqEl(o[0],o[1]);if(t){click(t);clicks++;seen.add('ph:start-square');if(w.eval('PH.pop')!=='start'){const mk=w.eval('G.mons.some(m=>m.x==='+o[0]+'&&m.y==='+o[1]+')');if(!mk)errs.push('start popup did not open for '+o);}return}}}
        else if(G.phase==='play'&&G.step==='act'){
          const fr=w.eval('UI.fronts');
          if(ph.pop!=='tiles'&&fr&&fr.length&&R()<.5){const f=rnd(fr);const sq=w.eval(`(()=>{const S=G.ships[${f}];return [S.x,S.y]})()`);const t=sqEl(sq[0],sq[1]);if(t){click(t);clicks++;seen.add('ph:front-tap');if(w.eval('PH.pop')!=='tiles')errs.push('tile popup did not open on the front square tap');else if(!d.querySelector('#ppop .ph-t'))errs.push('popup has no tiles');else{const bds=[...d.querySelectorAll('#ppop .ph-t .bd')].map(x=>x.textContent);if(!bds.some(x=>/SAFE|SINKS|GATE|CANNON/.test(x)))errs.push('popup has no badges')}return}}
          if(ph.pop==='tiles'){const r2=R();
            if(r2<.12){const c=q('#ppop [data-ph=pcard]');if(c.length){click(rnd(c));seen.add('ph:pcard');return}}
            if(r2<.2){const c=q('#ppop [data-a=rot]');if(c.length){click(rnd(c));seen.add('ph:rot');return}}
            if(r2<.24){const t=d.querySelector('#ppop .ph-tiles');if(t){const dx=R()<.5?60:-60;t.dispatchEvent(new w.Event('pointerdown',{bubbles:true}));seen.add('ph:swipe-skip')}}
            if(r2<.27){click(d.querySelector('#ppop [data-ph=pclose]'));seen.add('ph:close-x');return}
            if(r2<.29){d.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));seen.add('ph:esc');return}
            if(r2<.31){const sg=q('#ppop [data-a=sugg]');if(sg.length){click(sg[0]);seen.add('sugg');return}}
            const pb=q('#ppop [data-a=place],#ppop [data-a=gate]');if(pb.length&&r2<.8){click(pb[0]);clicks++;seen.add('ph:place-popup');return}
          }
          if(ph.pop==null&&R()<.04){const mons=w.eval('G.mons.map(m=>[m.x,m.y,m.k])');const frs=fr?fr.map(f=>w.eval(`G.ships[${f}].x+","+G.ships[${f}].y`)):[];const m=mons.find(x=>!frs.includes(x[0]+','+x[1]));if(m){const t=sqEl(m[0],m[1]);if(t){click(t);seen.add('ph:info-'+m[2]);if(w.eval('PH.pop')!=='info')errs.push('info popup did not open');else if(!d.querySelector('#ppop .ph-head'))errs.push('info popup empty');click(d.querySelector('#ppop [data-ph=pclose]'));return}}}
        }
      }
      const ck=q('#pc [data-a=coachok],#pc [data-a=sunkok]');if(ck.length&&R()<.35){click(ck[0]);seen.add('ph:continue');return}
      const dm=q('#pc [data-ph=dismiss]');if(dm.length&&R()<.5){click(dm[0]);seen.add('ph:dismiss');return}
    }
    if(r<.015){const t=rnd(q('.gx-bar [data-gx]'));if(t){click(t);clicks++;seen.add('pop:'+t.dataset.gx);const x=d.querySelector('.gx-drawer.on .gx-x');if(x)click(x)}return}
    if(w.eval('UI.busy')){if(R()<.05)click(d.querySelector('[data-a=skip]')||d.body);return}
    // kit mirror = G once nothing is moving
    if(steps%25===0&&!w.eval('UI.busy')){const st=w.eval('TWKit.getState()');const tiles=G.bd.filter(Boolean).length;const levs=G.mons.filter(m=>m.k==='L').length;const al=G.ships.filter(s=>s.alive&&(s.x!=null||s.on||s.tp)).length;
      if(st.tiles.length!==tiles||st.leviathans.length!==levs||st.ships.length!==al){mm++;if(mm>=4){mism++;if(errs.length<6)errs.push(`MIRROR tiles ${st.tiles.length}/${tiles} levs ${st.leviathans.length}/${levs} ships ${st.ships.length}/${al} kit=${JSON.stringify(st.ships.map(x=>x.id+':'+x.c+','+x.r))} G=${JSON.stringify(G.ships.map(s=>[s.i,s.alive,s.x,s.y,s.on,s.tp]))} q=${G.q&&G.q.kind} KS=${JSON.stringify(w.eval('KS.ships'))}`)}}else mm=0}
    if(r<.03){const c=q('#coach [data-a=coachok]');if(c.length){click(c[0]);seen.add('coach');return}}
    if(r<.035){const c=q('#coach [data-a=guidetoggle]');if(c.length){click(c[0]);const y=q('#coach [data-a=guideyes],#coach [data-a=guideno]');if(y.length){click(rnd(y));seen.add('guide-toggle')}return}}
    const take=q('#dockbody [data-a=take]');if(take.length){click(take[0]);clicks++;seen.add('pass-screen');return}
    const qs=q('#dockbody [data-a=q]');if(qs.length){seen.add('q:'+w.eval('G.q&&G.q.kind'));const tiles=[...d.querySelectorAll('#fb [data-c]')];if(R()<.3&&w.eval('UI.fronts===null||true')){const lg=w.eval('(G.q.opts.find(o=>o.d&&o.d.x!=null&&(o.h==="dGateAt"||o.h==="dReloc"))||{}).d||null');if(lg){const t=d.querySelector(`#fb [data-c="${lg.x}"][data-r="${lg.y}"]`);if(t){click(t);clicks++;seen.add('q-by-square');return}}}click(rnd(qs));clicks++;return}
    const sm=q('#dockbody [data-a=startmark]');if(sm.length){click(rnd(sm));clicks++;seen.add('startmark');return}
    const main=d.getElementById(cf.phone?'ps':'main');
    if(q('#dockbody [data-a=place],#dockbody [data-a=cannon],#dockbody [data-a=gate],#dockbody [data-a=pass],#dockbody [data-a=card]').length||main.querySelector('[data-a=place]')){
      const sg=q('#dockbody [data-a=sugg]');if(sg.length&&R()<(cf.careful||.6)){click(sg[0]);seen.add('sugg');return}
      const hint=q('#dockbody [data-a=hint]');if(hint.length&&R()<.1){click(hint[0]);seen.add('hint');return}
      const tg=q('#dockbody [data-a=target]');if(tg.length&&R()<.3){click(rnd(tg));seen.add('target');return}
      const cs=q('#dockbody [data-a=cannon]');if(cs.length&&R()<.6){click(rnd(cs));seen.add('cannon');clicks++;return}
      const gt=q('#dockbody [data-a=gate]');if(gt.length&&R()<.4){click(rnd(gt));seen.add('gate');clicks++;return}
      const ps=q('#dockbody [data-a=pass]');if(ps.length){click(ps[0]);seen.add('pass');clicks++;return}
      if(R()<.25){const cd=q('#dockbody [data-a=card]');if(cd.length){click(rnd(cd));seen.add('card');return}}
      if(R()<.25){const rb=q('#dockbody [data-a=rot]');if(rb.length){click(rnd(rb));seen.add('rot');return}}
      if(R()<.15){const k=rnd(['1','2','3','r','q']);d.dispatchEvent(new w.KeyboardEvent('keydown',{key:k,bubbles:true}));seen.add('key');return}
      const pb=q('#dockbody [data-a=place]');if(pb.length){if(R()<.15){const f=w.eval('UI.fronts&&UI.fronts[0]');if(f!=null){const sq=w.eval(`(()=>{const S=G.ships[${f}];return [S.x,S.y]})()`);const t=d.querySelector(`#fb [data-c="${sq[0]}"][data-r="${sq[1]}"]`);if(t){click(t);seen.add('square-place');clicks++;return}}}
        click(pb[0]);clicks++;seen.add('place');return}
      const rb=q('#dockbody [data-a=rot]');if(rb.length){click(rnd(rb));return}
      const cd=q('#dockbody [data-a=card]');if(cd.length){click(rnd(cd));return}}
    const sig=JSON.stringify([G.logN,G.turn,G.step,!!G.q,w.eval('JSON.stringify(UI.sel)'),w.eval('UI.busy'),w.eval('UI.holder')]);if(sig===last)stall++;else{stall=0;last=sig}
    const inv=w.eval('checkInvariants()');if(inv.length&&errs.length<5)errs.push('INV '+inv[0]);
    if(stall>3000||Date.now()-t0>200000){errs.push('STALL step '+G.step+' phase '+G.phase+' q='+(G.q&&G.q.kind)+' side='+w.eval('sideToAct()')+' busy='+w.eval('UI.busy')+' main='+main.textContent.slice(0,160));clearInterval(iv);res({cf,over:G.over,errs,seen,clicks});w.close()}
  }catch(e){errs.push('LOOP '+String(e.stack||e).slice(0,500));clearInterval(iv);res({cf,errs,seen,clicks});w.close()}},2)}})}
(async()=>{const a=+(process.argv[2]||0),b=+(process.argv[3]||CONF.length-1),NS=+(process.argv[4]||1);const all=new Set();let bad=0,n=0,hid=0;const T=Date.now();
  for(let i=a;i<=b&&i<CONF.length;i++)for(let sd=0;sd<NS;sd++){const cf=CONF[i];const r=await run(cf,100+i+sd*1000);n++;r.seen.forEach(x=>all.add(x));bad+=r.errs.length;hid+=r.hidden||0;
    console.log(`[${i}.${sd}] ${cf.name}: ${r.over?(r.over.win&&r.over.win.length?'WIN '+r.over.win:'LOSS')+' ('+r.over.why+')':'not over'} turns ${r.turns} clicks ${r.clicks} ${r.secs}s hidden ${r.hidden} errors ${r.errs.length} ${JSON.stringify(r.errs.slice(0,3))}`)}
  console.log('TOTAL games',n,'errors',bad,'hidden-hand violations',hid,'time',Math.round((Date.now()-T)/1000)+'s');console.log('seen:',[...all].sort().join(' | '))})();
