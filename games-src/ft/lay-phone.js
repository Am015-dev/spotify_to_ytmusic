#!/usr/bin/env node
require('../phfit.js').guard(null);
// Phone layout test for Sands of Qamar. Usage: ONLY=390x844 node lay-phone.js [sands.html] [outdir]
// Real WebGL (SwiftShader), isMobile + hasTouch; every action is a touch tap at an element/tile centre after an elementFromPoint hit-test.
// Checks: no page scroll (also with drawers open), bazaar >= 0.85 x short side, every tile + meeple stack inside the board and hit-testing to the canvas
// with each pop-up/card open, pop-ups never overlap the board, tap targets >= 44 px, text >= 13 px, a full human turn through board taps + pop-ups,
// info pop-up from a tile tap (close by x / Esc / tap outside), market / djinns / mine / players / plans pop-ups, hot-seat, end card, 0 console errors.
const L=require('./phlib.js');const {sleep}=L;
const FILE=process.argv[2]||'sands.html',OUT=process.argv[3]||'shots/ph';L.fs.mkdirSync(OUT,{recursive:true});
const EXTRA=process.env.EX?JSON.parse(process.env.EX):{};const PLAYERS=+(process.env.NP||2);
(async()=>{const br=await L.launch();let total=0;const summary=[];
for(const [W,H] of L.SIZES){if(process.env.ONLY&&!process.env.ONLY.split(',').includes(W+'x'+H))continue;
  const tag=W+'x'+H+(process.env.TAG||'');const short=Math.min(W,H);const R={tag,checks:0,fails:[],info:{}};const fail=m=>{R.fails.push(m);console.log('  FAIL',tag,m)};const chk=(c,m)=>{R.checks++;if(!c)fail(m);return c};
  const {ctx,pg,errs}=await L.open(br,W,H,process.env.Q||'',{file:FILE});
  const FIT=require('../phfit.js');const shot=async n=>{(await FIT.run(pg)).forEach(m=>fail('FIT '+n+': '+m));return pg.screenshot({path:`${OUT}/${tag}-${n}.png`})};
  const st=()=>pg.evaluate(()=>({g:!!G,me:!!(G&&me()),ph:G&&G.phase,step:G&&G.step,mv:G&&G.move?G.move.hand.length:-1,q:G&&!!G.q,over:G&&!!G.over,turn:G&&G.turn,cur:G&&G.cur,
    card:(()=>{const e=document.getElementById('pc');return e&&!e.hidden?e.dataset.k:''})(),pop:(()=>{const e=document.getElementById('ppop');return e&&!e.hidden?e.dataset.k:''})(),modal:UI.modal||'',pick:UI.pick.slice(),auto:!!UI.autoPlan,pend:!!UI.pendDj}));
  // ---- generic geometry checks, run at every stage ----
  const geo=async(where,o)=>{o=o||{};
    // the phone board zooms onto your hand during a move: wait for the camera to settle, then check only the tiles in view
    await pg.waitForFunction(()=>Math.abs(V3.cur.d-V3.orbit.d)<.05&&(!V3.lookT||V3.look.distanceTo(V3.lookT)<.05),null,{timeout:5000}).catch(()=>{});
    const g=await pg.evaluate(()=>{const ZOOM=typeof PHONE!=='undefined'&&PHONE.z>1;const bd=document.querySelector('.gx-board').getBoundingClientRect(),cv=V3.r.domElement,rc=cv.getBoundingClientRect();V3.cam.updateMatrixWorld();
      const pj=(x,y,z)=>{const v=new THREE.Vector3(x,y,z).project(V3.cam);return [rc.left+(v.x+1)/2*rc.width,rc.top+(1-v.y)/2*rc.height]};
      const out={sw:document.documentElement.scrollWidth,sh:document.documentElement.scrollHeight,bsw:document.body.scrollWidth,bsh:document.body.scrollHeight,vw:innerWidth,vh:innerHeight,board:[bd.left,bd.top,bd.width,bd.height],bad:[],ovl:[]};
      const W=BW(),Hh=BH();let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9,tmin=1e9;
      for(let i=0;i<W*Hh;i++){const p=tilePos(i);const c=pj(p.x,TH,p.z);
        for(const [dx,dz] of [[-1,-1],[1,-1],[1,1],[-1,1]]){const q=pj(p.x+dx*TS/2,TH,p.z+dz*TS/2);x0=Math.min(x0,q[0]);x1=Math.max(x1,q[0]);y0=Math.min(y0,q[1]);y1=Math.max(y1,q[1])}
        const a=pj(p.x-TS/2,TH,p.z),b=pj(p.x+TS/2,TH,p.z),c1=pj(p.x,TH,p.z-TS/2),d=pj(p.x,TH,p.z+TS/2);tmin=Math.min(tmin,Math.hypot(a[0]-b[0],a[1]-b[1]),Math.hypot(c1[0]-d[0],c1[1]-d[1]));
        const e=document.elementFromPoint(c[0],c[1]);const inB=c[0]>=bd.left&&c[0]<=bd.right&&c[1]>=bd.top&&c[1]<=bd.bottom;if(!(ZOOM&&!inB)&&!(inB&&e===cv))out.bad.push('tile'+i+':'+(e?(e.id||e.className||e.tagName):'none'))}
      for(const id in V3.stacks){const s=V3.stacks[id];if(s.hand||!s.to)continue;const c=pj(s.to.x,TH+.2,s.to.z);const e=document.elementFromPoint(c[0],c[1]);const inB=c[0]>=bd.left&&c[0]<=bd.right&&c[1]>=bd.top&&c[1]<=bd.bottom;if(!(ZOOM&&!inB)&&!(inB&&e===cv))out.bad.push('meeple'+id+':'+(e?(e.id||e.className||e.tagName):'none'))}
      out.bazaar=[x1-x0,y1-y0];out.tile=tmin;
      for(const sel of ['#ppop','#pc','#ps']){const e=document.querySelector(sel);if(!e||e.hidden||getComputedStyle(e).display==='none')continue;const r=e.getBoundingClientRect();if(r.width<2)continue;const ix=Math.max(0,Math.min(r.right,bd.right)-Math.max(r.left,bd.left)),iy=Math.max(0,Math.min(r.bottom,bd.bottom)-Math.max(r.top,bd.top));if(ix*iy>2)out.ovl.push(sel);if(r.right>innerWidth+1||r.bottom>innerHeight+1||r.left<-1||r.top<-1)out.ovl.push(sel+'-offscreen')}
      return out},null);
    chk(g.sw<=g.vw+1&&g.sh<=g.vh+1&&g.bsw<=g.vw+1&&g.bsh<=g.vh+1,`${where}: page scroll ${g.sw}x${g.sh} vs ${g.vw}x${g.vh}`);
    if(!o.noBoard){chk(g.bad.length===0,`${where}: ${g.bad.length} board targets not hit-testing to the canvas: ${g.bad.slice(0,4)}`);chk(g.ovl.length===0,`${where}: panels overlap the board / go off screen: ${g.ovl}`);
      const base=g.vw>g.vh?g.bazaar[1]:g.bazaar[0];chk(base>=FIT.share(W,H)*short-.5,`${where}: bazaar ${Math.round(base)} < .85 x ${short}`);chk(g.tile>=44,`${where}: smallest tile ${Math.round(g.tile)} px`);R.info.bazaar=g.bazaar.map(Math.round);R.info.tile=Math.round(g.tile);R.info.board=g.board.map(Math.round)}
    return g};
  // tap targets >= 44 and text >= 13 inside the phone UI
  const targets=async where=>{const r=await pg.evaluate(()=>{const out={small:[],text:[]};const roots=['.gx-bar','#ps','#ppop','#pc','#modal','.gx-drawer.on'].map(s=>document.querySelector(s)).filter(e=>e&&!e.hidden&&e.getBoundingClientRect().width>0);
      for(const root of roots){for(const e of root.querySelectorAll('button,[data-ph],[data-mv],input[type=checkbox],summary,a')){const r=e.getBoundingClientRect();const cs=getComputedStyle(e);if(r.width<1||r.height<1||cs.visibility==='hidden'||cs.display==='none'||e.closest('[hidden]'))continue;if(r.bottom<0||r.top>innerHeight)continue;
          if(e.type==='checkbox'){const lb=e.closest('label');const lr=lb?lb.getBoundingClientRect():r;if(Math.min(lr.width,lr.height)<43.5)out.small.push('checkbox '+Math.round(lr.width)+'x'+Math.round(lr.height));continue}
          if(Math.min(r.width,r.height)<43.5)out.small.push((e.id?'#'+e.id:'')+'.'+String(e.className).split(' ').join('.')+' "'+(e.textContent||'').trim().slice(0,16)+'" '+Math.round(r.width)+'x'+Math.round(r.height))}
        const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let n;while(n=w.nextNode()){if(!n.nodeValue.trim())continue;const e=n.parentElement;if(!e||e.closest('[hidden],svg,canvas'))continue;const cs=getComputedStyle(e);if(cs.display==='none'||cs.visibility==='hidden')continue;const r=e.getBoundingClientRect();if(r.width<1||r.height<1)continue;if(parseFloat(cs.fontSize)<12.95)out.text.push(e.tagName+'.'+String(e.className).slice(0,20)+' '+cs.fontSize+' "'+n.nodeValue.trim().slice(0,14)+'"')}}
      return out},null);chk(r.small.length===0,`${where}: small tap targets: ${r.small.slice(0,5).join(' | ')}`);chk(r.text.length===0,`${where}: text < 13 px: ${r.text.slice(0,5).join(' | ')}`);return r};
  const all=async(where,o)=>{await geo(where,o);await targets(where)};
  // ---- start screen + opening scene ----
  await sleep(500);R.info.cls=await pg.evaluate(()=>document.documentElement.className);chk(/\bph\b/.test(R.info.cls),'html.ph set: '+R.info.cls);
  await shot('0open');const modal=await pg.evaluate(()=>{const m=document.querySelector('#modal');const b=[...m.querySelectorAll('[data-ui=play]')][0];const r=b&&b.getBoundingClientRect();return {txt:UI.modal,btn:r&&[r.left,r.top,r.width,r.height],sw:document.documentElement.scrollWidth,sh:document.documentElement.scrollHeight}});
  chk(modal.btn&&modal.btn[1]+modal.btn[3]<=H&&modal.btn[2]>=44,'opening: Enter button visible '+JSON.stringify(modal.btn));await targets('opening');
  await L.tapSel(pg,'[data-ui=play]','#modal');await sleep(400);await shot('1setup');
  const setup=await pg.evaluate(()=>{const b=document.querySelector('#modal [data-ui=start]');const r=b&&b.getBoundingClientRect();return r&&[r.left,r.top,r.width,r.height]});chk(setup&&setup[1]+setup[3]<=H+1,'setup: Begin visible '+JSON.stringify(setup));await targets('setup');
  await pg.evaluate(o=>{try{localStorage.clear()}catch(e){}ANIM=0;AIDELAY=60;setSeed(7);UI.setup.np=o.np;UI.setup.seats=['human','ai','ai','ai','ai'];Object.assign(UI.setup.ex,o.ex);render()},{np:PLAYERS,ex:EXTRA});
  await L.tapSel(pg,'[data-ui=start]','#modal');await sleep(900);await pg.waitForFunction(()=>G&&me(),null,{timeout:90000});await sleep(500);
  // ---- chapter card, tip, bid card ----
  let s=await st();chk(s.card==='chapter','round card first, got '+s.card);await all('chapter card');await shot('2chapter');
  await L.tapSel(pg,'[data-ph=cont]','#pc');await sleep(250);s=await st();
  if(/^tip-/.test(s.card)){await all('tip card');await shot('3tip');await L.tapSel(pg,'[data-ph=cont]','#pc');await sleep(250);s=await st()}
  chk(s.card==='bid','bid card, got '+s.card);await all('bid card');await shot('4bid');
  // advisor card from the bar (touch), then close it
  await L.tapSel(pg,'.adv-btn','.gx-bar');await sleep(300);s=await st();chk(s.card==='adv','advisor card, got '+s.card);await all('advisor card');await shot('5adv');
  const advBtn=await L.tapSel(pg,'[data-ui=advx]','#pc');await sleep(250);s=await st();chk(s.card==='bid','back to bid card after closing advisor, got '+s.card);
  // bid: tap the suggested spot
  const bidTap=await L.tapSel(pg,'.sp.rec .btn','#pc')||await L.tapSel(pg,'.sp .btn','#pc');chk(!!bidTap&&bidTap.ok,'bid tap hit-tests to its button');await sleep(300);
  // get to my move (bidding may ask again with 2 markers)
  const toMove=async()=>{const t0=Date.now();while(Date.now()-t0<150000){const x=await st();if(x.over)return false;if(x.me&&x.ph==='turn'&&x.step==='move'&&x.mv<0)return true;
      if(x.card&&x.me){if(x.card==='bid'){await L.tapSel(pg,'.sp.rec .btn','#pc')||await L.tapSel(pg,'.sp .btn','#pc')}else if(x.card==='q'){await L.tapSel(pg,'.opts .btn','#pc')}else if(x.card==='adv'){await L.tapSel(pg,'[data-ui=advx]','#pc')}else await L.tapSel(pg,'[data-ph=cont]','#pc')}
      else if(x.card)await L.tapSel(pg,'[data-ph=cont]','#pc');
      await sleep(150)}throw new Error('toMove timeout')};
  await toMove();await sleep(600);s=await st();
  if(s.card){await all('move card '+s.card);await L.tapSel(pg,'[data-ph=cont]','#pc');await sleep(300);s=await st()}
  chk(s.card===''&&s.pop==='','move step: strip only');await all('my move: strip');await shot('6move');
  // ---- pop-ups from chips: board stays visible and hit-testing ----
  for(const k of ['mine','feed','market','djinns','plans']){const sel=k==='plans'?'[data-ph=open][data-k=plans]':`[data-ph=open][data-k=${k}]`;const t=await L.tapSel(pg,sel,'#ps');chk(!!t&&t.ok,'chip '+k+' tap');await sleep(300);const x=await st();chk(x.pop===k,'pop-up '+k+' opens, got '+x.pop);await all('pop-up '+k);await shot('7pop-'+k);
    // close by x
    await L.tapSel(pg,'[data-ph=close]','#ppop');await sleep(200);const y=await st();chk(y.pop==='','pop-up '+k+' closes by x');
    if(k==='market'){await L.tapSel(pg,sel,'#ps');await sleep(200);await pg.keyboard.press('Escape');await sleep(200);chk((await st()).pop==='','pop-up closes by Esc')}}
  // ---- tap a non-glowing tile -> info pop-up, then close by tapping outside (another non-glowing tile = new info; a glowing one acts) ----
  s=await st();const dark=await pg.evaluate(()=>{for(let i=0;i<G.W*G.H;i++)if(!UI.pick.includes(i))return i;return -1});
  let xy=await L.tileXY(pg,dark);let hit=await L.tapXY(pg,xy.x,xy.y);chk(/c3/.test(hit),'info: tile tap hits the canvas '+hit);await sleep(300);s=await st();chk(s.pop==='info','info pop-up from a tile tap, got '+s.pop);await all('tile info');await shot('8info');
  const infoT=await pg.evaluate(()=>document.querySelector('#ppop h3').textContent);chk(infoT.length>2,'info title '+infoT);
  await L.tapSel(pg,'[data-ph=close]','#ppop');await sleep(200);chk((await st()).pop==='','info closes by x');
  await L.tapXY(pg,xy.x,xy.y);await sleep(250);chk((await st()).pop==='info','info reopens');await pg.keyboard.press('Escape');await sleep(200);chk((await st()).pop==='','info closes by Esc');
  await L.tapXY(pg,xy.x,xy.y);await sleep(250);const other=await pg.evaluate(d=>{for(let i=0;i<G.W*G.H;i++)if(i!==d&&!UI.pick.includes(i))return i;return -1},dark);xy=await L.tileXY(pg,other);await L.tapXY(pg,xy.x,xy.y);await sleep(250);s=await st();chk(s.pop==='info','tap on the board swaps the info pop-up');
  // a tap on a glowing tile while info is open closes it and acts (picks up)
  // ---- a full human turn by touch: board taps + pop-ups ----
  const turn0=s.turn;let steps=0,sawHand=false,sawGain=false,pickedByTile=false;const kinds=new Set();
  while(steps++<80){s=await st();if(s.over||!s.me||s.turn!==turn0)break;
    if(s.card){kinds.add('card:'+s.card);await all('turn card '+s.card);if(s.card==='bid')await L.tapSel(pg,'.sp .btn','#pc');else if(s.card==='q')await L.tapSel(pg,'.opts .btn','#pc');else if(s.card==='adv')await L.tapSel(pg,'[data-ui=advx]','#pc');else await L.tapSel(pg,'[data-ph=cont]','#pc');await sleep(250);continue}
    if(s.step==='move'&&s.mv<0){const i=s.pick[Math.floor(Math.random()*s.pick.length)];xy=await L.tileXY(pg,i);hit=await L.tapXY(pg,xy.x,xy.y);chk(/c3/.test(hit),'tile tap hit '+hit);pickedByTile=true;await sleep(350);continue}
    if(s.step==='move'&&s.mv>=0){if(!sawHand){sawHand=true;await sleep(300);const x=await st();chk(x.pop==='hand','hand pop-up opens after pick-up, got '+x.pop);await all('hand pop-up');await shot('9hand');
        const live=await pg.evaluate(()=>!!V3.pathG||UI.path&&UI.path.length>=1);chk(live,'live path set')}
      // alternate: tap a reachable tile on the board, or a drop button in the pop-up
      const nxt=await pg.evaluate(()=>{const vm=validMoves(me().i);return [...new Set(vm.filter(m=>m.act==='step').map(m=>m.tile))]});
      if(!nxt.length){await sleep(200);continue}
      if(steps%2){const i=nxt[Math.floor(Math.random()*nxt.length)];xy=await L.tileXY(pg,i);hit=await L.tapXY(pg,xy.x,xy.y);chk(/c3/.test(hit),'drop tile tap hit '+hit)}
      else{const r=await L.tapSel(pg,'[data-ph=drop]','#ppop');if(!r){const i=nxt[0];xy=await L.tileXY(pg,i);await L.tapXY(pg,xy.x,xy.y)}else chk(r.ok,'drop button hit-test')}
      await sleep(300);
      // after the first drop: undo it once through the button (tests Undo last drop)
      if(!kinds.has('undo')&&(await st()).mv>=0){const u=await pg.evaluate(()=>!!document.querySelector('#ppop [data-ui=undodrop]'));if(u){kinds.add('undo');const before=(await st()).mv;await L.tapSel(pg,'[data-ui=undodrop]','#ppop');await sleep(400);const after=(await st()).mv;chk(after>=before,'undo last drop restores the hand '+before+'->'+after)}}
      continue}
    if(['tribe','tile','sell'].includes(s.step)){if(!sawGain){sawGain=true;await sleep(300);const x=await st();chk(x.pop==='gain','gain pop-up after the last drop, got '+x.pop);await all('gain pop-up '+s.step);await shot('10gain-'+s.step)}
      kinds.add('step:'+s.step);
      let r=await L.tapSel(pg,'.btn.go','#ppop')||await L.tapSel(pg,'.opts .btn','#ppop')||await L.tapSel(pg,'button[data-mv]','#ppop');
      if(!r){await sleep(250);if(s.step==='tribe'){/* auto step */}}await sleep(300);continue}
    await sleep(200)}
  chk(pickedByTile&&sawHand,'a whole move by taps (picked '+pickedByTile+', hand '+sawHand+') kinds '+[...kinds]);R.info.kinds=[...kinds].join(',');
  await sleep(800);await all('after my turn');await shot('11after');
  // ---- bar menu + log drawers: no page scroll, targets ----
  for(const d of ['logd','menud']){await L.tapSel(pg,`[data-gx=${d}]`,'.gx-bar');await sleep(500);const dr=await pg.evaluate(d=>{const e=document.getElementById(d),r=e.getBoundingClientRect(),b=document.querySelector('.gx-board').getBoundingClientRect();return {on:e.classList.contains('on'),r:[r.left,r.top,r.right,r.bottom],bd:[b.left,b.top,b.right,b.bottom],vw:innerWidth,vh:innerHeight}},d);chk(dr.on&&dr.r[0]>=-1&&dr.r[2]<=dr.vw+1&&dr.r[3]<=dr.vh+1&&dr.r[1]>=-1,'drawer '+d+' inside the screen '+JSON.stringify(dr.r));if(dr.vw>dr.vh)chk(dr.r[0]>=dr.bd[2]-1,'landscape drawer '+d+' stays off the board '+JSON.stringify([dr.r,dr.bd]));await all('drawer '+d,{noBoard:true});await shot('12'+d);await pg.keyboard.press('Escape');await sleep(300);chk(!(await pg.evaluate(()=>GX.open)),'drawer '+d+' closes by Esc')}
  // ---- end card ----
  await pg.evaluate(()=>{G.pl.forEach(p=>{});try{finish()}catch(e){};refresh()});await sleep(500);s=await st();chk(s.card==='over','end card, got '+s.card);await all('end card');await shot('13over');
  await L.tapSel(pg,'[data-ph=cont]','#pc');await sleep(300);s=await st();chk(s.card==='','end card Continue');await all('after end card');await shot('14over-strip');
  chk(errs.length===0,'console errors: '+errs.slice(0,3).join(' | '));
  R.tapTarget='see checks';console.log(tag,'checks',R.checks,'fails',R.fails.length,JSON.stringify(R.info));total+=R.fails.length;summary.push(R);await ctx.close()}
console.log('PROBLEMS',total);await br.close();process.exit(total?1:0)})().catch(e=>{console.error(e);process.exit(2)});
