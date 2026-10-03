// Phone layout check (real WebGL via SwiftShader, isMobile + hasTouch). node lay-phone.js [WxH,...] [--before] [--safe=t,r,b,l] [--tiles=N]
// Every human action is a touch tap (page.touchscreen) on the map or on a pop-up / strip / card button.
const PW=require((process.env.PW||require('child_process').execSync('npm root -g').toString().trim()+'/playwright'));
const fs=require('fs'),path=require('path');const HERE=__dirname,OUT=path.join(HERE,'shots','ph');fs.mkdirSync(OUT,{recursive:true});
const FILE=path.join(HERE,process.argv.find(a=>a.startsWith('--file='))?process.argv.find(a=>a.startsWith('--file=')).slice(7):'rampart.html');
const SIZES=(process.argv[2]&&!process.argv[2].startsWith('--')?process.argv[2]:'390x844,844x390,360x740,740x360').split(',').map(s=>s.split('x').map(Number));
const BEFORE=process.argv.includes('--before'),SAFE=(process.argv.find(a=>a.startsWith('--safe='))||'').slice(7),NT=+((process.argv.find(a=>a.startsWith('--tiles='))||'--tiles=40').slice(8));
(async()=>{const b=await PW.chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});let bad=0;
for(const [W,H] of SIZES){const t=W+'x'+H+(BEFORE?'_before':'');const ctx=await b.newContext({viewport:{width:W,height:H},deviceScaleFactor:1,isMobile:true,hasTouch:true});
  const p=await ctx.newPage();p.setDefaultTimeout(60000);const errs=[];p.on('pageerror',e=>errs.push('pageerror '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/net::|Failed to load resource|CERT|fonts/.test(m.text()))errs.push(m.text())});
  const log=(...a)=>console.log(t,...a);const prob=(...a)=>{bad++;log('PROBLEM',...a)};
  const FIT=require('../../phfit.js');const shot=async n=>{(await FIT.run(p)).forEach(m=>prob('FIT '+n,m));await p.screenshot({path:path.join(OUT,`P_${t}_${n}.png`)})};
  const q=(BEFORE?'?phone=0':'?phone=1')+(SAFE?'&safe='+SAFE:'');
  await p.goto('file://'+FILE+q);await p.waitForTimeout(1500);await p.evaluate(()=>{try{localStorage.clear()}catch(e){}setSeed(7);AIDELAY=50;ANIM=0});
  const scroll=async tag=>{const r=await p.evaluate(()=>({h:document.documentElement.scrollHeight,w:document.documentElement.scrollWidth,vh:innerHeight,vw:innerWidth,bh:document.body.scrollHeight}));if(r.h>r.vh+1||r.w>r.vw+1||r.bh>r.vh+1)prob(tag,'SCROLL',JSON.stringify(r))};
  const tap=async sel=>{const l=p.locator(sel).first();await l.tap({timeout:45000});await p.waitForTimeout(250)};
  // projection of a world point / cell to page px
  await p.evaluate(()=>{window.__cellPt=(k)=>{const [x,y]=unkey(k);const v=screenOf(cellWorld(x,y).setY(TH));const R=V3.r.domElement.getBoundingClientRect();return {x:R.left+v.x,y:R.top+v.y,in:v.in}};
    window.__cellRect=(k)=>{const [x,y]=unkey(k);const R=V3.r.domElement.getBoundingClientRect();const xs=[],ys=[];for(const [dx,dy] of [[-1,-1],[1,-1],[1,1],[-1,1]]){const v=screenOf(cellWorld(x+dx*.5,y+dy*.5).setY(TH));xs.push(R.left+v.x);ys.push(R.top+v.y)}return [Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys)]};
    window.__tilePx=()=>{const l=V3.look.clone();const a=screenOf(l),c=screenOf(l.clone().add(new THREE.Vector3(TS,0,0)));return Math.hypot(a.x-c.x,a.y-c.y)}});
  const boardM=async tag=>{const m=await p.evaluate(()=>{const R=document.querySelector('.gx-board').getBoundingClientRect();return {rect:[Math.round(R.left),Math.round(R.top),Math.round(R.width),Math.round(R.height)],short:Math.min(innerWidth,innerHeight),W:innerWidth,H:innerHeight,tile:Math.round(window.__tilePx()),cells:UI.cells.length,placed:G?G.order.length:0}});
    const ratio=Math.min(m.rect[2],m.rect[3])/m.short;log(tag,'board',m.rect[2]+'x'+m.rect[3],'ratio',ratio.toFixed(2),'tile px',m.tile,'cells',m.cells,'placed',m.placed);return {m,ratio}};
  // every glowing cell centre inside the board and hit-testing to the canvas
  const cellsOK=async tag=>{const r=await p.evaluate(()=>{const R=document.querySelector('.gx-board').getBoundingClientRect();let n=0,out=0,cov=0;const w={};for(const k of UI.cells){const c=window.__cellPt(k);if(!c.in)continue;n++;if(!(c.x>=R.left&&c.x<=R.right&&c.y>=R.top&&c.y<=R.bottom)){out++;continue}const e=document.elementFromPoint(c.x,c.y);if(e!==V3.r.domElement){cov++;const k2=e?(e.id||String(e.className)||e.tagName):'none';w[k2]=(w[k2]||0)+1}}return {n,out,cov,w,total:UI.cells.length}});
    if(r.out||r.cov)prob(tag,'CELLS out',r.out,'covered',r.cov,JSON.stringify(r.w));return r};
  const targets=async tag=>{const r=await p.evaluate(()=>{const o=[];for(const e of document.querySelectorAll('.gx-bar button,.pchip,#ps button,#ppop button,#pc button')){const R=e.getBoundingClientRect();if(!R.width||!R.height)continue;const cs=getComputedStyle(e);if(cs.visibility==='hidden'||cs.display==='none')continue;if(e.closest('[hidden]'))continue;if(R.width<43.5||R.height<43.5)o.push((e.dataset.ph||e.dataset.a||e.dataset.ui||e.dataset.mv||e.className||e.tagName)+':'+Math.round(R.width)+'x'+Math.round(R.height))}return o});
    if(r.length)prob(tag,'SMALL TAP TARGETS',JSON.stringify(r.slice(0,6)));return r};
  const fontsOK=async tag=>{const r=await p.evaluate(()=>{const o=[];for(const e of document.querySelectorAll('#ps *,#ppop *,#pc *,#pchips *,#pbar *')){if(!e.childNodes.length)continue;const has=[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim());if(!has)continue;const R=e.getBoundingClientRect();if(!R.width||e.closest('[hidden]'))continue;const fs=parseFloat(getComputedStyle(e).fontSize);if(fs<12.99)o.push(e.className+':'+fs)}return o});if(r.length)prob(tag,'SMALL TEXT',JSON.stringify(r.slice(0,5)))};
  const inside=async(sel,tag)=>{await p.evaluate(()=>Promise.all(document.getAnimations().map(a=>a.finished.catch(()=>0))));const r=await p.evaluate(sel=>{const e=document.querySelector(sel);if(!e||e.hidden)return null;const R=e.getBoundingClientRect();return {l:R.left,t:R.top,r:R.right,b:R.bottom,vw:innerWidth,vh:innerHeight,sh:e.scrollHeight,ch:e.clientHeight}},sel);if(r&&(r.l<-1||r.t<-1||r.r>r.vw+1||r.b>r.vh+1))prob(tag,sel,'outside the screen',JSON.stringify(r));return r};
  const waitCam=async()=>{for(let i=0;i<60;i++){const c=await p.evaluate(()=>!!V3.camTo);if(!c)break;await p.waitForTimeout(100)}await p.waitForTimeout(150)};
  const cards=async()=>{for(let k=0;k<12;k++){const vis=await p.evaluate(()=>{const c=document.getElementById('pc');return !c.hidden&&c.innerHTML.length>0});if(!vis)return k;await targets('card');await fontsOK('card');await inside('#pc','card');if(k===0&&!globalThis.__cs){}await shot('card'+(globalThis.__n=(globalThis.__n||0)+1)%6);await tap('#pc [data-ph=cont]');await p.waitForTimeout(250)}return 12};
  // 0. start screen
  await scroll('start');await shot('0start');
  const mb=await p.evaluate(()=>{const e=document.querySelector('#modal .mbox');const R=e.getBoundingClientRect();return {t:R.top,b:R.bottom,vh:innerHeight,sh:e.scrollHeight,ch:e.clientHeight}});log('start box',JSON.stringify(mb));
  await p.evaluate(()=>{UI.setup.np=3;UI.setup.seats=['human','ai','ai','ai','ai','ai'];UI.setup.ex={river:true,ic:true,tb:true}});
  await p.evaluate(()=>render());await p.locator('[data-ui=start]').scrollIntoViewIfNeeded();await tap('[data-ui=start]');await p.waitForTimeout(1500);
  const so=await p.$('[data-ui=storyok]');if(so){await shot('1story');await tap('[data-ui=storyok]')}await p.waitForTimeout(900);
  await scroll('play');
  const phOn=await p.evaluate(()=>document.documentElement.classList.contains('ph'));
  if(BEFORE){const bm=await boardM('BEFORE');await shot('2play');await ctx.close();continue}
  if(!phOn)prob('html.ph not set');
  const nc=await cards();log('coach cards dismissed',nc);
  await p.waitForTimeout(600);await scroll('place');const bm=await boardM('first turn');if(bm.ratio<FIT.share(W,H))prob('board ratio',bm.ratio);await cellsOK('first');await targets('strip');await fontsOK('strip');await shot('2place');
  if(bm.m.tile<44)prob('tile px at default zoom',bm.m.tile);
  // 1. a full human turn by touch only
  let turns=0,ghostShot=false,figShot=false,infoDone=false,menuDone=false,rotDone=false,spotsDone=false,scoreCards=0,placedByMe=0;
  for(let k=0;k<400&&turns<4;k++){
    const s=await p.evaluate(()=>({hp:!!me(),step:G.step,over:!!G.over,card:!document.getElementById('pc').hidden,ghost:!!UI.ghost,fig:!!UI.spotOpts.length}));
    if(s.over)break;
    if(s.card){const c=await cards();scoreCards+=c;continue}
    if(!s.hp){await p.waitForTimeout(250);continue}
    if(s.step==='place'&&!s.ghost){
      if(!rotDone){await tap('#ps [data-ph=rot][data-d="1"]');rotDone=true;await shot('3rot')}
      if(!menuDone&&turns===1){await tap('#phmenu');await p.waitForTimeout(300);await shot('4menu');await targets('menu');await fontsOK('menu');await inside('#ppop','menu');await scroll('menu');
        await tap('#ppop [data-gx=plrd]');await p.waitForTimeout(700);await shot('4players');await scroll('drawer players');await p.evaluate(()=>GX.close());await p.waitForTimeout(500);menuDone=true;const op=await p.evaluate(()=>!document.getElementById('ppop').hidden);if(op)prob('menu pop-up stayed open after choosing an item')}
      if(!infoDone&&turns===2){// info popup: tap a placed tile that is not a glowing square
        await waitCam();const pt=await p.evaluate(()=>{const R=document.querySelector('.gx-board').getBoundingClientRect();for(const k of G.order){const c=window.__cellPt(k);if(c.in&&c.x>R.left+20&&c.x<R.right-20&&c.y>R.top+20&&c.y<R.bottom-20&&!UI.cells.includes(k))return {x:c.x,y:c.y}}return null});
        if(pt){await p.touchscreen.tap(pt.x,pt.y);await p.waitForTimeout(500);const o=await p.evaluate(()=>({open:!document.getElementById('ppop').hidden,txt:document.getElementById('ppop').textContent.slice(0,80)}));if(!o.open)prob('feature info pop-up did not open');else{await shot('5info');await targets('info');await fontsOK('info');await inside('#ppop','info');
            // tap outside (the map) closes it
            await p.touchscreen.tap(pt.x,pt.y);await p.waitForTimeout(400);const c=await p.evaluate(()=>document.getElementById('ppop').hidden);if(!c)prob('info pop-up did not close on a map tap')}infoDone=true}}
      if(!spotsDone&&turns===3){await waitCam();const bt=await p.evaluate(()=>window.__tilePx());await tap('#ps [data-ph=zin]');await waitCam();const a=await p.evaluate(()=>window.__tilePx());await tap('#ps [data-ph=zout]');await tap('#ps [data-ph=zout]');await waitCam();const c=await p.evaluate(()=>window.__tilePx());
        await tap('#ps [data-ph=all]');await waitCam();const d=await p.evaluate(()=>window.__tilePx());await tap('#ps [data-ph=spots]');await waitCam();const e2=await p.evaluate(()=>window.__tilePx());await tap('#ps [data-ph=last]');await waitCam();
        log('zoom: tile px',Math.round(bt),'in',Math.round(a),'out',Math.round(c),'all',Math.round(d),'spots',Math.round(e2));if(!(a>bt*1.2&&c<a*.7))prob('zoom buttons did not zoom',bt,a,c);spotsDone=true;await tap('#ps [data-ph=spots]');await waitCam();const cr=await cellsOK('after spots');}
      const cell=await p.evaluate(()=>{const R=document.querySelector('.gx-board').getBoundingClientRect();const L=UI.cells.map(k=>({k,...window.__cellPt(k)})).filter(c=>c.in&&c.x>R.left+8&&c.x<R.right-8&&c.y>R.top+8&&c.y<R.bottom-8);return L.length?L[Math.floor(L.length/2)]:null});
      if(!cell){log('no visible cell, pressing spots');await tap('#ps [data-ph=spots]');await p.waitForTimeout(900);const c2=await p.evaluate(()=>UI.cells.length);if(!c2)await p.waitForTimeout(500);continue}
      await p.touchscreen.tap(cell.x,cell.y);await p.waitForTimeout(500);const g=await p.evaluate(()=>!!UI.ghost);if(!g){prob('tap on a glowing cell did not place the ghost',JSON.stringify(cell));await p.evaluate(k=>on3DTap(k,null),cell.k);}continue}
    if(s.step==='place'&&s.ghost){await p.waitForTimeout(300);
      const o=await p.evaluate(()=>{const e=document.getElementById('ppop');const R=e.getBoundingClientRect();const k=UI.ghost.k;const cr=window.__cellRect(k);const B=document.querySelector('.gx-board').getBoundingClientRect();return {open:!e.hidden,pop:[R.left,R.top,R.right,R.bottom],cell:cr,board:[B.left,B.top,B.right,B.bottom]}});
      if(!o.open)prob('ghost popup not open');else{const ov=o.pop[0]<o.cell[2]&&o.pop[2]>o.cell[0]&&o.pop[1]<o.cell[3]&&o.pop[3]>o.cell[1];if(ov)prob('place pop-up overlaps the ghost tile',JSON.stringify(o));
        const cin=o.cell[0]>=o.board[0]-1&&o.cell[2]<=o.board[2]+1&&o.cell[1]>=o.board[1]-1&&o.cell[3]<=o.board[3]+1;if(!cin)log('note: ghost tile partly outside the board',JSON.stringify(o.cell));
        await targets('place popup');await fontsOK('place popup');await inside('#ppop','place popup');await cellsOK('with place popup');if(!ghostShot){await shot('6ghost');ghostShot=true}}
      const rb=await p.$('#ppop [data-ui=rotr]:not([disabled])');if(rb){const r0=await p.evaluate(()=>UI.ghost.r);await rb.tap();await p.waitForTimeout(300);const r1=await p.evaluate(()=>UI.ghost.r);if(r0===r1)prob('rotate button did not rotate')}
      await tap('#ppop [data-ui=confirm]');await p.waitForTimeout(700);placedByMe++;continue}
    if(s.step==='fig'){await p.waitForTimeout(500);
      const o=await p.evaluate(()=>{const e=document.getElementById('ppop');const R=e.getBoundingClientRect();const k=G.cur.k;const cr=window.__cellRect(k);const B=document.querySelector('.gx-board').getBoundingClientRect();const opts=[...e.querySelectorAll('[data-mv]')].map(x=>x.textContent.replace(/\s+/g,' ').trim().slice(0,70));return {open:!e.hidden,pop:[R.left,R.top,R.right,R.bottom],cell:cr,board:[B.left,B.top,B.right,B.bottom],opts,rec:!!e.querySelector('.rec'),tile:window.__tilePx(),sh:e.scrollHeight,ch:e.clientHeight}});
      if(!o.open)prob('follower pop-up not open');else{const ov=o.pop[0]<o.cell[2]&&o.pop[2]>o.cell[0]&&o.pop[1]<o.cell[3]&&o.pop[3]>o.cell[1];if(ov)prob('follower pop-up overlaps the new tile');
        const cin=o.cell[0]>=o.board[0]-2&&o.cell[2]<=o.board[2]+2&&o.cell[1]>=o.board[1]-2&&o.cell[3]<=o.board[3]+2;if(!cin)prob('new tile not inside the board at the follower step',JSON.stringify(o.cell));
        await targets('fig popup');await fontsOK('fig popup');await inside('#ppop','fig popup');await cellsOK('fig board');if(!figShot){figShot=true;log('fig popup',JSON.stringify(o.opts),'rec',o.rec,'tile px',Math.round(o.tile),'popup scroll',o.sh,o.ch);await shot('7fig')}}
      // sometimes tap a ring on the map, else a button; last turn: skip
      const ring=await p.evaluate(()=>{if(!UI.spotOpts.length)return null;const o=UI.spotOpts[0];const v=screenOf(spotWorld(G.cur.k,o.l));const R=V3.r.domElement.getBoundingClientRect();return {x:R.left+v.x,y:R.top+v.y}});
      if(turns%2===0&&ring){await p.touchscreen.tap(ring.x,ring.y);await p.waitForTimeout(500);const still=await p.evaluate(()=>G.step==='fig'&&!!me());if(still){log('ring tap missed; using the button');const bb=p.locator('#ppop [data-mv]:not([data-mv*=skip])').first();if(await bb.count())await bb.tap();else await tap('#ppop [data-mv*=skip]')}}
      else{const bb=p.locator('#ppop [data-mv]:not([data-mv*=skip])').first();if(turns%3===1&&await bb.count())await bb.tap();else await tap((await p.locator('#ppop:not([hidden]) [data-mv*=skip]').count())?'#ppop [data-mv*=skip]':'#ps [data-mv*=skip]')}
      await p.waitForTimeout(500);turns++;continue}
    await p.waitForTimeout(250)}
  log('human turns',turns,'placed',placedByMe,'score/coach cards seen',scoreCards);
  // 2. long-map framing: jump to ~NT tiles, the default zoom must keep the glowing squares >= 44 px
  await p.evaluate(n=>{UI.pause=true;let g=0;while(G.order.length<n&&!G.over&&g++<3000){const s=sideToAct();performMove(aiMove(s),s)}
    while(!(sideToAct()===0&&G.step==='place')&&!G.over){const s=sideToAct();performMove(aiMove(s),s)}UI.fitTurn=-1;UI.ghost=null;PHN.cards=[];PHN.pop=null;resetScene();refresh();fitAll(true)},NT);await p.waitForTimeout(1500);
  await cards();await scroll('mid');const mm=await boardM('mid-game');await cellsOK('mid');await shot('8mid');
  if(mm.m.tile<44)prob('mid-game tile px',mm.m.tile);
  // groups of glowing squares: spots button visits them
  const gr=await p.evaluate(()=>PHN.groups().map(g=>g.n));log('spot groups',JSON.stringify(gr));
  for(let i=0;i<Math.min(3,gr.length);i++){await tap('#ps [data-ph=spots]');await waitCam();const r=await p.evaluate(()=>{const R=document.querySelector('.gx-board').getBoundingClientRect();let n=0;for(const k of UI.cells){const c=window.__cellPt(k);if(c.in&&c.x>R.left&&c.x<R.right&&c.y>R.top&&c.y<R.bottom)n++}return {n,tile:Math.round(window.__tilePx())}});log('spots press',i,'visible cells',r.n,'tile px',r.tile);if(!r.n)prob('spots button shows no glowing square');if(r.tile<44)prob('spots tile px',r.tile)}
  // one-finger drag pans, two-finger pinch zooms (CDP touch events)
  const cdp=await ctx.newCDPSession(p);const touch=async(type,pts)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:pts.map((q,i)=>({x:q[0],y:q[1],id:i+1}))});
  const bx=await p.evaluate(()=>{const R=document.querySelector('.gx-board').getBoundingClientRect();return {cx:R.left+R.width/2,cy:R.top+R.height/2,w:R.width,h:R.height}});
  const look0=await p.evaluate(()=>V3.look.clone().toArray());const tp0=await p.evaluate(()=>window.__tilePx());
  await touch('touchStart',[[bx.cx,bx.cy]]);for(let i=1;i<=6;i++){await touch('touchMove',[[bx.cx+i*10,bx.cy]]);await p.waitForTimeout(30)}await touch('touchEnd',[]);await p.waitForTimeout(300);
  const look1=await p.evaluate(()=>V3.look.clone().toArray());const moved=Math.abs(look1[0]-look0[0]);const expect=60/tp0*2;log('pan 60px: world dx',moved.toFixed(2),'expected ~',expect.toFixed(2));if(moved<expect*.6||moved>expect*1.5)prob('pan not about 1:1 with the finger',moved,expect);
  await touch('touchStart',[[bx.cx-40,bx.cy],[bx.cx+40,bx.cy]]);for(let i=1;i<=8;i++){await touch('touchMove',[[bx.cx-40-i*8,bx.cy],[bx.cx+40+i*8,bx.cy]]);await p.waitForTimeout(30)}await touch('touchEnd',[]);await p.waitForTimeout(400);
  const tp1=await p.evaluate(()=>window.__tilePx());log('pinch out: tile px',Math.round(tp0),'->',Math.round(tp1));if(!(tp1>tp0*1.4))prob('pinch did not zoom in',tp0,tp1);
  // 3. cards: a scoring event and the final count
  await p.evaluate(()=>{PHN.add(phScoreCard({r:+Object.keys(G.fd).find(r=>G.fd[r].ty==='R'||G.fd[r].ty==='C'),pts:12,win:[0,1]}));PHN.render(true)});await p.waitForTimeout(300);const sc=await p.evaluate(()=>!document.getElementById('pc').hidden);
  if(!sc)prob('score card did not show');else{await shot('9score');await targets('score card');await fontsOK('score card');await inside('#pc','score card');const blk=await p.evaluate(()=>PHN.blocking());if(!blk)prob('card should block the computer');await tap('#pc [data-ph=cont]');await p.waitForTimeout(300);const gone=await p.evaluate(()=>document.getElementById('pc').hidden);if(!gone)prob('Continue did not close the card')}
  await p.evaluate(()=>{finish();refresh()});await p.waitForTimeout(800);let ec=0;
  for(let k=0;k<30;k++){const v=await p.evaluate(()=>{const c=document.getElementById('pc');return {vis:!c.hidden,final:!!c.querySelector('.pc-row.win')}});if(!v.vis)break;ec++;if(ec<=3)await shot('Aend'+ec);await targets('end card');await fontsOK('end card');await inside('#pc','end card');await scroll('end card');await tap('#pc [data-ph=cont]');await p.waitForTimeout(250)}
  log('end cards',ec);if(ec<2)prob('end cards missing');
  await shot('Bover');await scroll('over');await targets('over strip');
  const eb=await p.$('#ps [data-ph=results]');if(!eb)prob('no Result button after the game');else{await eb.tap();await p.waitForTimeout(300);const vis=await p.evaluate(()=>!document.getElementById('pc').hidden);if(!vis)prob('Result button did not reopen the result');else await tap('#pc [data-ph=cont]')}
  if(errs.length){bad++;log('ERRORS',errs.slice(0,4))}
  log('done');await ctx.close()}
console.log('PROBLEMS',bad);await b.close()})()
