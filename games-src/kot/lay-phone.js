#!/usr/bin/env node
// Phone layout test for Crown City Smash. Usage: ONLY=390x844 node lay-phone.js [kot2.html] [outdir]
// Real WebGL (SwiftShader), isMobile + hasTouch, every action by a touch tap (touchscreen.tap at the element centre after an
// elementFromPoint hit-test). Checks: no scroll, board >= 0.85 x short side, board hit-tests to the canvas with every card /
// pop-up open, every monster + Downtown inside the board, cards and pop-ups never overlap the board, tap targets >= 44 px
// (dice >= 52), text >= 13 px, a full human turn through board + strip + pop-ups, interrupts, hot-seat, game over, 0 console errors.
const L=require('./phlib.js');const {sleep}=L;
const FILE=process.argv[2]||'kot2.html',OUT=process.argv[3]||'shots/ph';L.fs.mkdirSync(OUT,{recursive:true});
const TURNS=+(process.env.TURNS||1);const PART=process.env.PART||'all';
(async()=>{const br=await L.launch();let total=0;const summary=[];
for(const [W,H] of L.SIZES){if(process.env.ONLY&&!process.env.ONLY.split(',').includes(W+'x'+H))continue;
  const tag=W+'x'+H;const short=Math.min(W,H);const R={tag,checks:0,fails:[],info:{}};const fail=m=>{R.fails.push(m);console.log('  FAIL',tag,m)};const chk=(c,m)=>{R.checks++;if(!c)fail(m);return c};
  const {ctx,pg,errs}=await L.open(br,W,H,process.env.Q||'',{file:FILE,tour:true});
  const shot=n=>pg.screenshot({path:`${OUT}/${tag}-${n}.png`});
  const until=async(fn,ms,arg)=>{const t0=Date.now();while(Date.now()-t0<(ms||20000)){if(await pg.evaluate(fn,arg))return true;await sleep(120)}return false};
  // ---- geometry: no scroll, board size, hit-test, monsters inside ----
  const geo=async (where,skipBoard)=>{const g=await pg.evaluate(()=>{const bd=document.querySelector('.gx-board').getBoundingClientRect();const cv=document.getElementById('c3');const out={sw:document.documentElement.scrollWidth,sh:document.documentElement.scrollHeight,bsw:document.body.scrollWidth,bsh:document.body.scrollHeight,iw:innerWidth,ih:innerHeight,bd:[bd.left,bd.top,bd.width,bd.height],bad:[],mon:[],ph:document.documentElement.className};
      for(let i=0;i<5;i++)for(let j=0;j<5;j++){const x=bd.left+bd.width*(i+.5)/5,y=bd.top+bd.height*(j+.5)/5;const e=document.elementFromPoint(x,y);const ok=e&&(e.id==='c3'||e.id==='stage'||e.id==='map'||e.closest('#map'));if(!ok)out.bad.push(`${Math.round(x)},${Math.round(y)}:${e?(e.id||e.className||e.tagName):'none'}`)}
      if(typeof V3!=='undefined'&&V3.on&&G&&V3.mons.length){const r=cv.getBoundingClientRect();const pts=V3.mons.map((o,k)=>({k,p:o.g.position.clone().add(new THREE.Vector3(0,2.2,0))}));pts.push({k:'city',p:new THREE.Vector3(0,1.1,0)});
        for(const q of pts){const v=q.p.project(V3.cam);const x=r.left+(v.x+1)/2*r.width,y=r.top+(1-v.y)/2*r.height;const e=document.elementFromPoint(x,y);out.mon.push({k:q.k,x:Math.round(x),y:Math.round(y),inside:x>=bd.left&&x<=bd.right&&y>=bd.top&&y<=bd.bottom,hit:!!e&&(e.id==='c3'||e.id==='stage')})}}
      return out});
    chk(g.sw<=g.iw&&g.sh<=g.ih&&g.bsw<=g.iw&&g.bsh<=g.ih,`${where}: page scrolls ${g.sw}x${g.sh} (body ${g.bsw}x${g.bsh}) > ${g.iw}x${g.ih}`);
    if(skipBoard){R.board=g.bd;return g}
    chk(Math.min(g.bd[2],g.bd[3])>=.85*short-.5,`${where}: board ${g.bd.map(Math.round)} < 0.85 x ${short}`);
    chk(g.bad.length===0,`${where}: board covered at ${g.bad.slice(0,3).join(' ')}`);
    for(const m of g.mon)chk(m.inside&&m.hit,`${where}: monster/city ${m.k} at ${m.x},${m.y} ${m.inside?'covered':'outside the board'}`);
    R.board=g.bd;return g};
  // ---- tap targets and text ----
  const targets=async where=>{const t=await pg.evaluate(()=>{const bad=[],txt=[];const vis=e=>{const r=e.getBoundingClientRect();if(r.width<1||r.height<1)return null;const cs=getComputedStyle(e);if(cs.visibility==='hidden'||cs.display==='none'||+cs.opacity===0)return null;if(r.right<=0||r.bottom<=0||r.left>=innerWidth||r.top>=innerHeight)return null;return r};
      const sel='button,[data-act],[data-die],[data-card],[data-opt],[data-gx],[data-a],[data-tour],[data-pm],[data-shop],[data-ph],[data-start],[data-mon],summary,a[href]';
      const modal=document.getElementById('modal');const inModal=!modal.classList.contains('hidden');
      for(const e of document.querySelectorAll(sel)){if(e.closest('.gx-drawer:not(.on)')||e.closest('.hidden')||e.closest('[hidden]'))continue;if(inModal&&!e.closest('#modal'))continue;if(e.closest('#pcx')&&!document.querySelector('.gx-dock[data-card="pop"]'))continue;
        const r=vis(e);if(!r)continue;const x=Math.min(innerWidth-1,Math.max(0,r.left+r.width/2)),y=Math.min(innerHeight-1,Math.max(0,r.top+r.height/2));const h=document.elementFromPoint(x,y);if(!(h&&(h===e||e.contains(h)||h.contains(e))))continue;
        const need=e.classList.contains('die')?52:44;const m=Math.min(r.width,r.height);if(m<need-.5)bad.push(`${e.tagName}.${String(e.className).split(' ').slice(0,3).join('.')}${e.dataset&&Object.keys(e.dataset)[0]?'['+Object.keys(e.dataset)[0]+'='+Object.values(e.dataset)[0]+']':''} ${Math.round(r.width)}x${Math.round(r.height)} "${(e.textContent||'').trim().slice(0,14)}"`)}
      const roots=[...document.querySelectorAll('.gx-dock,header.gx-bar,.gx-drawer.on,#modal:not(.hidden)')];
      for(const root of roots)for(const e of root.querySelectorAll('*')){if(e.closest('.hidden')||e.closest('svg')||e.closest('[hidden]')||e.closest('.gx-drawer:not(.on)'))continue;const r=vis(e);if(!r)continue;
        let own=false;for(const n of e.childNodes)if(n.nodeType===3&&n.textContent.trim().length>1)own=true;if(!own)continue;const cs=getComputedStyle(e);if(cs.display==='none')continue;
        const fs=parseFloat(cs.fontSize);if(fs>0&&fs<12.9&&!e.closest('#modal'))txt.push(`${e.tagName}.${String(e.className).slice(0,20)} ${fs}px "${e.textContent.trim().slice(0,16)}"`)}
      return {bad,txt:[...new Set(txt)]}});
    chk(t.bad.length===0,`${where}: small tap targets: ${t.bad.slice(0,5).join(' | ')}`);chk(t.txt.length===0,`${where}: text < 13px: ${t.txt.slice(0,5).join(' | ')}`);return t};
  // ---- a card / pop-up: inside the control zone, never over the board ----
  const card=async where=>{const c=await pg.evaluate(()=>{const dk=document.querySelector('.gx-dock');const k=dk.dataset.card;const idm={choice:'choice',coach:'coach',advice:'advice',pop:'pcx'};const e=document.getElementById(idm[k]);if(!k||!e)return {k};
      const r=e.getBoundingClientRect(),b=document.querySelector('.gx-board').getBoundingClientRect();const vis=getComputedStyle(e).display!=='none';
      const ov=!(r.right<=b.left+1||r.left>=b.right-1||r.bottom<=b.top+1||r.top>=b.bottom-1);
      const btns=[...e.querySelectorAll('button:not([disabled])')].filter(x=>x.getBoundingClientRect().height>0);
      const others=[...document.querySelectorAll('#choice,#coach,#advice,#pcx')].filter(x=>x!==e&&getComputedStyle(x).display!=='none').map(x=>x.id);
      return {k,vis,r:[r.left,r.top,r.right,r.bottom].map(Math.round),ov,inV:r.left>=-1&&r.top>=-1&&r.right<=innerWidth+1&&r.bottom<=innerHeight+1,btns:btns.length,others,text:e.textContent.trim().slice(0,50)}});
    if(!c.k){fail(`${where}: no card on top`);return c}
    chk(c.vis,`${where}: card ${c.k} not visible`);chk(!c.ov,`${where}: card ${c.k} overlaps the board ${c.r}`);chk(c.inV,`${where}: card ${c.k} outside viewport ${c.r}`);chk(c.others.length===0,`${where}: cards stack: ${c.others}`);
    await geo(where+' (card open)');await targets(where+' (card)');return c};
  // ---- touch tap on an element, after a hit test ----
  const tap=async(sel,where,minSize)=>{if(!/coach|tour|pcx|choice/.test(sel)){const kk=await pg.evaluate(()=>document.getElementById('modal').classList.contains('hidden')?document.querySelector('.gx-dock').dataset.card:'');if(kk==='coach'){await tap('[data-tour="next"]','tip (in the way)');await sleep(250)}}const r=await pg.evaluate(sel=>{const e=document.querySelector(sel);if(!e)return null;if(e.closest('#modal'))e.scrollIntoView({block:'center'});const b=e.getBoundingClientRect();const x=b.left+b.width/2,y=b.top+b.height/2;const h=document.elementFromPoint(x,y);return {x,y,w:b.width,h:b.height,ok:!!h&&(h===e||e.contains(h)),hit:h?(h.id||h.className||h.tagName):'none',dis:e.disabled}},sel);
    if(!r){fail(`${where}: nothing to tap for ${sel}`);return false}if(!chk(r.ok,`${where}: ${sel} not hit-testable (${r.hit})`))return false;chk(Math.min(r.w,r.h)>=(minSize||44)-.5,`${where}: ${sel} only ${Math.round(r.w)}x${Math.round(r.h)}`);
    await pg.touchscreen.tap(r.x,r.y);await sleep(180);return true};
  const tapXY=async(x,y)=>{await pg.touchscreen.tap(x,y);await sleep(220)};
  const st=()=>pg.evaluate(()=>({g:!!G,w:G&&G.winner,ht:G&&humanTurn(),ph:G&&G.phase,rolls:G&&G.rolls,busy:UI.busy,ch:UI.choice?UI.choice.title:null,coach:UI.coach,intro:UI.intro,en:G&&G.pl.find(p=>p.human)?G.pl.find(p=>p.human).en:0,card:document.querySelector('.gx-dock').dataset.card,info:UI.info,tid:G&&G.tid,turn:G&&G.turn}));
  try{
    // ---- start screen ----
    await geo('start screen',true);chk(await pg.evaluate(()=>document.documentElement.classList.contains('ph')),'html.ph is set');
    const dl=await pg.evaluate(()=>{const r=document.querySelector('#modal .dlg').getBoundingClientRect();return [r.left,r.top,r.right,r.bottom]});chk(dl[0]>=0&&dl[2]<=W+1&&dl[3]<=H+1,`start dialog outside viewport ${dl}`);
    await shot('0-start');await targets('start screen');
    await pg.evaluate(()=>{ANIM=0;AIDELAY=50;UI.n=4;UI.evo=true});
    if(PART!=='extra'){
    await tap('[data-start="solo"]','start');await until(()=>!!G&&UI.intro,30000);await sleep(400);
    // ---- the story card (a choice-type card) ----
    let c=await card('intro');await shot('1-intro');await tap('[data-a="story"]','intro');await sleep(300);
    // ---- loop: tips, starting evolution, rolling, shop, interrupts ----
    const seen=new Set();let turns=0,did={};const t0=Date.now();let last='';
    while(turns<TURNS&&Date.now()-t0<(+process.env.LOOPMS||230000)){await sleep(150);const s=await st();if(!s.g||s.w)break;
      if(s.card==='pop'||s.card==='advice'){await pg.evaluate(()=>{PHN.pop=null;UI.adv=false;renderAdvice();phRender()});continue}
      if(s.card==='coach'){const k='tip'+s.coach;if(!seen.has(k)){seen.add(k);await card('tip '+s.coach);if(seen.size===1)await shot('2-tip')}await tap('[data-tour="next"]','tip');did.tip=1;continue}
      if(s.card==='choice'||s.ch&&s.card!=='coach'){const k='ch:'+s.ch;if(!seen.has(k)){seen.add(k);await card('choice '+s.ch);if(seen.size<6)await shot('3-choice-'+seen.size)}
        const csel=await pg.evaluate(()=>document.querySelector('#choice .btn.primary[data-opt]')?'#choice .btn.primary[data-opt]':'#choice [data-opt]:not([data-opt="x"])');const ok=await tap(csel,'choice');if(!ok)await pg.evaluate(()=>{const b=document.querySelector('#choice [data-opt]');b&&b.click()});did.choice=(did.choice||0)+1;continue}
      if(!s.ht||s.busy)continue;
      if(s.ph==='roll'){
        if(!did.roll){did.roll=1;await sleep(500);await geo('roll');await targets('roll');await shot('4-roll');
          // dice: every die >= 52, tap to keep / release
          const dd=await pg.evaluate(()=>[...document.querySelectorAll('#dice .die')].map(d=>{const r=d.getBoundingClientRect();return [r.width,r.height]}));R.info.dice=dd.length+' dice '+Math.round(Math.min(...dd.map(x=>Math.min(...x))))+'px';chk(dd.length>=6&&dd.every(x=>x[0]>=52&&x[1]>=52),`dice < 52 px: ${JSON.stringify(dd)}`);
          const k0=await pg.evaluate(()=>G.dice[0].k);await tap('#dice .die:nth-child(1)','die 1',52);const k1=await pg.evaluate(()=>G.dice[0].k);chk(k1===!k0,'tap on a die did not toggle keep');await tap('#dice .die:nth-child(1)','die 1 again',52);chk((await pg.evaluate(()=>G.dice[0].k))===k0,'second tap did not release the die');
          await tap('#dice .die:nth-child(2)','die 2',52);const pv=await pg.evaluate(()=>document.getElementById('preview').textContent.trim().length);chk(pv>5,'no preview line under the dice');
          await tap('#pacts [data-act="hint"]','hint');await shot('5-kept');
          const r0=await pg.evaluate(()=>G.rolls);const rb=await pg.evaluate(()=>{const b=document.querySelector('#pacts [data-act="reroll"]');return b&&!b.disabled});if(rb){await tap('#pacts [data-act="reroll"]','roll button');await sleep(700);chk((await pg.evaluate(()=>G.rolls))===r0-1,'Roll did not use a reroll')}
          // the advice card and the tips button
          await tap(W>H?'#pacts [data-a="advise"]':'#advbtn','advice');await sleep(200);await card('advice');await tap('#advice [data-a="advise"]','advice close');chk((await st()).card==='','advice did not close');
          // chip -> monster info pop-up, closed with the x
          await tap('.pchip:nth-child(2)','chip');await sleep(200);c=await card('monster pop-up (chip)');chk(/\bYOU\b|Boltbox|Squidrik|Magmaw|Shroomhulk|Glacyx|Voltusk/.test(c.text||''),'monster pop-up has no name');await shot('6-monpop');await tap('#pcx [data-ph="close"]','pop-up x');chk((await st()).card==='','x did not close the monster pop-up');
          // monster on the board -> info pop-up; closed by Esc
          const mp=await pg.evaluate(()=>{const o=V3.mons[1];const r=V3.r.domElement.getBoundingClientRect();const v=o.g.position.clone().add(new THREE.Vector3(0,2.2,0)).project(V3.cam);return {x:r.left+(v.x+1)/2*r.width,y:r.top+(1-v.y)/2*r.height}});
          await tapXY(mp.x,mp.y);chk((await st()).card==='pop','tap on a monster in the city did not open its pop-up');await geo('monster pop-up (board tap)');await pg.keyboard.press('Escape');await sleep(200);chk((await st()).card==='','Esc did not close the pop-up');
          // monster pop-up, closed by tapping outside (on the board, away from monsters)
          await tap('.pchip:nth-child(3)','chip 3');await sleep(150);const bd=R.board;await tapXY(bd[0]+14,bd[1]+bd[3]-14);chk((await st()).card==='','tap outside did not close the pop-up');
          // the shop pop-up from the bar (view only in the roll step)
          await tap('header.gx-bar [data-gx="dr-market"]','bar Cards');await sleep(250);c=await card('shop view (roll step)');chk(await pg.evaluate(()=>document.querySelectorAll('#pcx .pcard').length)===3,'shop pop-up does not show 3 cards');await tap('#pcx [data-ph="close"]','shop x');
          // pause button keeps a visible icon while paused
          await tap('#pausebtn','pause');await sleep(200);const pz=await pg.evaluate(()=>({p:UI.paused,c:getComputedStyle(document.getElementById('pausebtn'),'::before').content,w:document.getElementById('pausebtn').getBoundingClientRect().width}));chk(pz.p&&/▶/.test(pz.c),`paused state has no visible icon: ${JSON.stringify(pz)}`);await tap('#pausebtn','resume');await sleep(200);chk(!(await pg.evaluate(()=>UI.paused)),'resume did not resume');
          // drawers still work and do not scroll the page
          for(const id of ['dr-log','dr-mine','dr-mons','dr-menu']){await tap(`header.gx-bar [data-gx="${id}"]`,'bar '+id);await pg.waitForFunction(id=>{const r=document.getElementById(id).getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight+1},id,{timeout:60000}).catch(()=>{});const g=await geo('drawer '+id,true);if(id==='dr-mons'){await shot('7-drawer');await targets('drawer')}await tap(`#${id} .gx-x`,'drawer x '+id);await pg.waitForFunction(id=>!document.getElementById(id).classList.contains('on'),id,{timeout:20000}).catch(()=>{});await pg.waitForFunction(()=>{const s=document.querySelector('.gx-scrim');return !s.classList.contains('on')},null,{timeout:20000}).catch(()=>{});await sleep(300);chk(!(await pg.evaluate(id=>document.getElementById(id).classList.contains('on'),id)),'drawer '+id+' did not close')}
        }
        const s2=await st();if(s2.rolls>0&&turns===0&&!did.second){did.second=1;await tap('#pacts [data-act="reroll"]:not([disabled])','roll 2')}
        await tap('#pacts [data-act="resolve"]','done button');did.done=(did.done||0)+1;await sleep(500);continue}
      if(s.ph==='buy'){
        if(!did['buy'+turns]){did['buy'+turns]=1;await sleep(400);await geo('buy');await targets('buy');await shot('8-buy');
          const nt=await pg.evaluate(()=>document.querySelectorAll('#pshop .ptile').length);chk(nt===3,`shop tiles: ${nt}`);
          await tap('#pshop .ptile:nth-child(1)','shop tile');await sleep(250);c=await card('shop pop-up');await shot('9-shop');
          const info=await pg.evaluate(()=>({cards:document.querySelectorAll('#pcx .pcard').length,buy:document.querySelectorAll('#pcx [data-card]').length,sweep:!!document.querySelector('#pcx [data-act="sweep"]'),rec:!!document.querySelector('#pcx .rec'),why:!!document.querySelector('#pcx .why')}));
          chk(info.cards===3&&info.buy===3&&info.sweep,`shop pop-up content ${JSON.stringify(info)}`);R.info.shop=JSON.stringify(info);
          if(turns===0){const en0=(await st()).en;const can=await pg.evaluate(()=>{const b=document.querySelector('#pcx [data-card]:not([disabled])');return b?+b.dataset.card:-1});
            if(can>=0){await tap(`#pcx [data-card="${can}"]`,'shop buy');await sleep(500);did.bought=1;const s3=await st();if(s3.ch){await card('after buy '+s3.ch);await tap('#choice .btn.primary[data-opt]','choice after buy')||await tap('#choice [data-opt]','choice after buy')}}
            else if(!did.sweep){const e=await pg.evaluate(()=>{const b=document.querySelector('#pcx [data-act="sweep"]');return b&&!b.disabled});if(e){await tap('#pcx [data-act="sweep"]','sweep');did.sweep=1;await sleep(400)}}}
          if((await st()).card==='pop')await tap('#pcx [data-ph="close"]','shop x');chk((await st()).card!=='pop','shop pop-up did not close');
          await tap('#pshop .ptile:nth-child(2)','tile 2');await pg.keyboard.press('Escape');await sleep(150);chk((await st()).card!=='pop','Esc did not close the shop');
          await tap('#pshop .ptile:nth-child(3)','tile 3');const bd2=R.board;await tapXY(bd2[0]+14,bd2[1]+bd2[3]-14);chk((await st()).card!=='pop','outside tap did not close the shop');
        }
        if(!did.rec){did.rec=1;await pg.evaluate(()=>{cur().en=9;render()});await sleep(300);await tap('#pshop .ptile:nth-child(1)','tile rec');await sleep(250);await card('shop pop-up (recommended)');
          const ri=await pg.evaluate(()=>({rec:!!document.querySelector('#pcx .rec'),why:(document.querySelector('#pcx .why')||{}).textContent||'',sg:suggestCard(cur())}));R.info.rec=JSON.stringify(ri).slice(0,140);chk(ri.sg<0||ri.rec&&ri.why.length>8,'recommended card without a reason');await shot('9b-shop-rec');
          const bk=await pg.evaluate(()=>{const b=document.querySelector('#pcx [data-card]:not([disabled])');return b?+b.dataset.card:-1});if(bk>=0){const e0=(await st()).en;await tap(`#pcx [data-card="${bk}"]`,'buy rec');await sleep(500);const s4=await st();if(s4.ch){await card('after buy2 '+s4.ch);const cs=await pg.evaluate(()=>document.querySelector('#choice .btn.primary[data-opt]')?'#choice .btn.primary[data-opt]':'#choice [data-opt]');await tap(cs,'choice after buy2');await sleep(300)}else chk(s4.en<e0,'buy did not spend energy')}}
        if((await st()).card==='pop')await tap('#pcx [data-ph="close"]','x');
        await tap('#pacts [data-act="end"]','end turn');turns++;did.end=turns;await sleep(500);continue}
    }
    R.info.turns=turns;R.info.did=JSON.stringify(did);R.info.seen=[...seen].join(', ');
    chk(turns>=1,'did not complete a human turn by touch');
    }
    if(PART!=='main'){
    // ---- 5-6 monsters: Harbor in frame, 6 chips ----
    await pg.evaluate(()=>{UI.coach=-1;UI.tour=false;UI.info=true;render()});await sleep(300);await pg.evaluate(()=>{UI.n=6;UI.evo=false;UI.xp='base'});await pg.evaluate(()=>{UI.custOpen=true;render()});
    await tap('[data-start="hot"]','start hot-seat');if(!(await until(()=>!!G&&G.mode==='hot',40000))){R.info.retry=(R.info.retry||0)+1;await pg.evaluate(()=>{const b=document.querySelector('[data-start="hot"]');if(b)b.click()});await until(()=>!!G&&G.mode==='hot',40000)}await sleep(800);
    await pg.evaluate(()=>{UI.intro=false;UI.tour=false;UI.coach=-1;render()});await sleep(500);
    const nc=await pg.evaluate(()=>document.querySelectorAll('.pchip').length);chk(nc===6,`6 chips expected, saw ${nc}`);
    // hot-seat: the human at the device is active; do a turn by tap
    let hs=0,h0=Date.now();while(hs<1&&Date.now()-h0<60000){await sleep(150);const s=await st();if(s.w)break;if(s.ch){await tap('#choice [data-opt]','hot choice');continue}if(!s.ht||s.busy)continue;
      if(s.ph==='roll'){await sleep(400);await geo('hot-seat 6 monsters roll');await targets('hot-seat roll');await shot('10-six');await tap('#pacts [data-act="resolve"]','hot done');await sleep(400);continue}
      if(s.ph==='buy'){await geo('hot-seat buy');await tap('#pacts [data-act="end"]','hot end');hs++;await sleep(400)}}
    // ---- game over: the end card ----
    await pg.evaluate(()=>{G.winner='P1';G.winText='Voltusk wins (test)';G.phase='over';UI.stats=true;render()});await sleep(500);
    const md=await pg.evaluate(()=>{const m=document.getElementById('modal');const d=m.querySelector('.dlg');if(!d)return null;const r=d.getBoundingClientRect();return {r:[r.left,r.top,r.right,r.bottom],h:!m.classList.contains('hidden')}});
    chk(md&&md.h&&md.r[0]>=-1&&md.r[2]<=W+1&&md.r[3]<=H+1,`end card outside the viewport ${md&&md.r}`);await shot('11-end');await geo('game over',true);await tap('#modal [data-a="closestats"]','end card continue');
    await sleep(300);
    }
  }catch(e){fail('exception: '+e.message.split('\n')[0])}
  R.info.errs=errs.length;chk(errs.length===0,'console errors: '+errs.slice(0,3).join(' | '));
  total+=R.fails.length;summary.push(R);console.log(`${tag}: PROBLEMS ${R.fails.length} (checks ${R.checks}) board ${R.board} ${JSON.stringify(R.info)}`);
  await ctx.close()}
await br.close();console.log(total?`FAIL (${total})`:'ALL PASS');process.exit(total?1:0)})();
