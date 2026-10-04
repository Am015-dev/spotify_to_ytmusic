require('../../phfit.js').guard(2);
// Phone layout check (real WebGL via SwiftShader, isMobile + hasTouch). node lay-phone.js [WxH,...] [--before] [--2d] [--safe=t,r,b,l]
// --before = same build with ?phone=0 (the old layout) to measure the board only.
const PW=require((process.env.PW||require('child_process').execSync('npm root -g').toString().trim()+'/playwright'));
const fs=require('fs'),path=require('path');const HERE=__dirname,OUT=path.join(HERE,'shots','ph');fs.mkdirSync(OUT,{recursive:true});fs.mkdirSync(path.join(HERE,'out'),{recursive:true});
const html=fs.readFileSync(path.join(HERE,'tidewake.html'));
const SIZES=(process.argv[2]&&!process.argv[2].startsWith('--')?process.argv[2]:'390x844,844x390,360x740,740x360').split(',').map(s=>s.split('x').map(Number));
const BEFORE=process.argv.includes('--before'),TWO=process.argv.includes('--2d');const SAFE=(process.argv.find(a=>a.startsWith('--safe='))||'').slice(7);
(async()=>{const b=await PW.chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});let bad=0;const rep=[];
for(const [W,H] of SIZES){const t=W+'x'+H+(BEFORE?'_before':'')+(TWO?'_2d':'');const ctx=await b.newContext({viewport:{width:W,height:H},deviceScaleFactor:1,isMobile:true,hasTouch:true});
  await ctx.route('**/*',r=>{const u=new URL(r.request().url());return u.host==='gns.test'?r.fulfill({status:200,contentType:'text/html',body:html}):r.abort()});
  const p=await ctx.newPage();p.setDefaultTimeout(120000);const errs=[];p.on('pageerror',e=>errs.push('pageerror '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/net::|Failed to load resource/.test(m.text()))errs.push(m.text())});
  const log=(...a)=>console.log(t,...a);const prob=(...a)=>{bad++;log('PROBLEM',...a)};
  const q='?'+(BEFORE?'phone=0':'phone=1')+(TWO?'&2d':'')+(SAFE?'&safe='+SAFE:'');
  await p.goto('https://gns.test/'+q);await p.waitForTimeout(1200);await p.evaluate(()=>{try{localStorage.clear()}catch(e){}setSeed(5);setAiSeed(5);AIDELAY=60});
  const FIT=require('../../phfit.js');const shot=async n=>{(await FIT.run(p)).forEach(m=>prob('FIT '+n,m));await p.screenshot({path:path.join(OUT,`P_${t}_${n}.png`)})};
  const scroll=async tag=>{const r=await p.evaluate(()=>({h:document.documentElement.scrollHeight,w:document.documentElement.scrollWidth,vh:innerHeight,vw:innerWidth}));if(r.h>r.vh+1||r.w>r.vw+1)prob(tag,'SCROLL',JSON.stringify(r))};
  // projection helper on the page
  await p.evaluate(()=>{window.__P=()=>{const host=document.querySelector('#c3:not([hidden])')||document.querySelector('#fb');const is3=host.id==='c3';if(is3){TWKit.renderOnce();const K=TWKit._K;K.cam.updateMatrixWorld();const v=new THREE.Vector3();return (x,y,z)=>{v.set(x,y,z).project(K.cam);const hr=host.getBoundingClientRect();return [hr.left+(v.x+1)/2*hr.width,hr.top+(1-v.y)/2*hr.height]}}
      const svg=host.querySelector('svg');const sr=svg.getBoundingClientRect(),vb=svg.viewBox.baseVal;const sc=Math.min(sr.width/vb.width,sr.height/vb.height);const ox=sr.left+(sr.width-vb.width*sc)/2-vb.x*sc,oy=sr.top+(sr.height-vb.height*sc)/2-vb.y*sc;return (x,y,z)=>[ox+x*sc,oy+z*sc]}});
  const metrics=async()=>p.evaluate(()=>{const P=__P();const R=document.querySelector('.gx-board').getBoundingClientRect();
    const a=P(-2.5,0,-2.5),c=P(2.5,0,-2.5),d=P(-2.5,0,2.5);const sq=(c[0]-a[0])/5;
    const n1=P(-3.7,0,0),n2=P(3.7,0,0),n3=P(0,0,-3.7),n4=P(0,0,3.7);const nums=Math.min(n2[0]-n1[0],n4[1]-n3[1])+0.56*sq;
    const f1=P(-4.45,0,0),f2=P(4.45,0,0);
    const bar=document.querySelector('.gx-bar').getBoundingClientRect();
    return {sq:+sq.toFixed(1),grid:+(sq*6).toFixed(0),nums:+nums.toFixed(0),frame:+(f2[0]-f1[0]).toFixed(0),rect:[R.left,R.top,R.width,R.height].map(Math.round),bar:[Math.round(bar.top),Math.round(bar.height)],short:Math.min(innerWidth,innerHeight),W:innerWidth,H:innerHeight}});
  // all 36 squares + 24 numbers + 48 marks inside the board and hit the canvas
  const whole=async tag=>{const r=await p.evaluate(()=>{const host=document.querySelector('#c3:not([hidden])')||document.querySelector('#fb');const R=document.querySelector('.gx-board').getBoundingClientRect();const P=__P();const pts=[];
      for(let c=0;c<6;c++)for(let r=0;r<6;r++)pts.push(['sq'+c+r,...P(c-2.5,0,r-2.5)]);
      for(let i=0;i<6;i++){const u=i-2.5;for(const s of[-1,1]){pts.push(['numTB',...P(u,0,s*3.7)]);pts.push(['numLR',...P(s*3.7,0,u)])}}
      for(let c=0;c<6;c++)for(let r=0;r<6;r++){if(c&&c<5&&r&&r<5)continue;for(let q=0;q<8;q++){if(!TWKit.portEdge(c,r,q))continue;const w=TWKit.portWorld(c,r,q);pts.push(['mark',...P(w[0],0,w[1])])}}
      let out=0,cov=0;const w={};const outs=[];for(const [n,x,y] of pts){if(!(x>=R.left-.5&&x<=R.right+.5&&y>=R.top-.5&&y<=R.bottom+.5)){out++;if(outs.length<4)outs.push(n+':'+Math.round(x)+','+Math.round(y))}else{const e=document.elementFromPoint(x,y);if(!(e===host||host.contains(e))){cov++;const k=e?(e.id||String(e.className)||e.tagName):'none';w[k]=(w[k]||0)+1}}}
      return {n:pts.length,out,outs,cov,w}});
    if(r.out||r.cov)prob(tag,'BOARD POINTS out',r.out,JSON.stringify(r.outs),'covered',r.cov,JSON.stringify(r.w));return r};
  const sqPt=async(c,r)=>p.evaluate(([c,r])=>__P()(c-2.5,0,r-2.5),[c,r]);
  const tapSq=async(c,r)=>{const [x,y]=await sqPt(c,r);await p.touchscreen.tap(x,y);await p.waitForTimeout(350)};
  const waitHuman=async()=>{let ok=0;for(let k=0;k<120&&ok<3;k++){const s=await p.evaluate(()=>{const d=sideToAct();return !!G.over||(d>=0&&G.seats[d].human&&!UI.busy&&!document.querySelector('#pc [data-a=take]'))});ok=s?ok+1:0;await p.waitForTimeout(250)}};
  const dismissCards=async()=>{for(let k=0;k<8;k++){try{const l=p.locator('#pc:not([hidden]) [data-a=coachok],#pc:not([hidden]) [data-a=sunkok],#pc:not([hidden]) [data-ph=dismiss]').first();if(!(await l.count()))break;await l.tap({timeout:4000})}catch(e){}await p.waitForTimeout(250)}};
  // tap targets >= 44
  const targets=async tag=>{const r=await p.evaluate(()=>{const o=[];for(const e of document.querySelectorAll('.gx-bar button,#ps button,#ppop button,#pc button,#netst button')){const R=e.getBoundingClientRect();if(!R.width||!R.height)continue;const cs=getComputedStyle(e);if(cs.visibility==='hidden')continue;if(R.width<43.5||R.height<43.5)o.push((e.dataset.a||e.dataset.ph||e.className||e.tagName)+':'+Math.round(R.width)+'x'+Math.round(R.height))}return o});if(r.length)prob(tag,'SMALL TAP TARGETS',JSON.stringify(r.slice(0,6)))};
  const overlap=(A,B)=>A[0]<B[2]&&A[2]>B[0]&&A[1]<B[3]&&A[3]>B[1];
  // 0. start screen then guided game
  await scroll('start');await shot('00title');await p.click('[data-a=guided]');await p.waitForTimeout(1500);await waitHuman();
  if(BEFORE){await p.waitForTimeout(500);const m=await metrics();log('BEFORE metrics',JSON.stringify(m));rep.push({t,m});await shot('0setup');await ctx.close();continue}
  await scroll('setup');await shot('0setup_card');await dismissCards();await p.waitForTimeout(300);
  const m0=await metrics();const side=m0.nums;const need=FIT.share(W,H)*(m0.short-(m0.rect[2]===m0.W&&m0.rect[3]<m0.H?0:0));
  log('metrics',JSON.stringify(m0),'ratio nums/short',(side/m0.short).toFixed(3),'grid/short',(m0.grid/m0.short).toFixed(3));
  if(side<FIT.share(W,H)*m0.short)prob('board side',side,'<',FIT.share(W,H)*m0.short);
  if(m0.rect[2]!==m0.rect[3])prob('board not square',m0.rect);
  await whole('setup');await targets('setup');await shot('1setup');
  // tap an edge square -> start pop-up -> mark
  await tapSq(2,0);const pop1=await p.evaluate(()=>({open:!document.querySelector('#ppop').hidden,txt:document.querySelector('#ppop').textContent.slice(0,60)}));if(!pop1.open)prob('start popup did not open',JSON.stringify(pop1));
  await shot('2startpop');await targets('startpop');
  const mk=await p.$('#ppop [data-a=startmark]');if(mk)await mk.tap();await p.waitForTimeout(900);await waitHuman();await dismissCards();await p.waitForTimeout(400);
  // 1. my turn: front square hit test, tap it, pop-up
  await scroll('turn');await whole('turn');await shot('3turn');await targets('turn');
  const fr=await p.evaluate(()=>({f:UI.fronts,sq:UI.fronts&&UI.fronts.map(s=>[G.ships[s].x,G.ships[s].y])}));
  if(!fr.f||!fr.f.length)prob('no front square on my turn');
  else{const [c,r]=fr.sq[0];const [x,y]=await sqPt(c,r);const hit=await p.evaluate(([x,y])=>{const e=document.elementFromPoint(x,y);return e&&(e.id==='c3'||e.closest('#board')||e.closest('#fb'))?1:0},[x,y]);if(!hit)prob('front square does not hit-test to the board');
    await p.touchscreen.tap(x,y);await p.waitForTimeout(500);
    const pp=await p.evaluate(()=>{const e=document.querySelector('#ppop');const R=e.getBoundingClientRect();const B=document.querySelector('.gx-board').getBoundingClientRect();const P=__P();
      const pts=[];const S=G.ships[UI.fronts[0]];const sp=shipPos(S);const w=TWKit.portWorld(sp.c,sp.r,sp.port||0);pts.push(P(w[0],.3,w[1]));if(UI.route)for(const q of UI.route.pts)pts.push(P(q[0],.06,q[1]));if(UI.route)pts.push(P(UI.route.stop[0],.5,UI.route.stop[1]));
      let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const q of pts){x0=Math.min(x0,q[0]);x1=Math.max(x1,q[0]);y0=Math.min(y0,q[1]);y1=Math.max(y1,q[1])}
      return {open:!e.hidden,pop:[R.left,R.top,R.right,R.bottom].map(Math.round),route:[x0,y0,x1,y1].map(Math.round),npts:pts.length,board:[B.left,B.top,B.right,B.bottom].map(Math.round),badges:[...e.querySelectorAll('.bd')].map(x=>x.textContent),tiles:e.querySelectorAll('.ph-t').length,sel:UI.sel&&UI.sel.t}});
    log('popup',JSON.stringify(pp));if(!pp.open)prob('tile popup did not open');else{
      if(overlap(pp.pop,pp.route))prob('POPUP COVERS ship/route',JSON.stringify(pp));if(pp.tiles<1)prob('no tiles in popup');if(!pp.badges.some(x=>/SAFE|SINKS/.test(x)))prob('no SAFE/SINKS badges');
      await shot('4popup');await targets('popup');
      // rotate by button, by swipe; second tile; route line changes
      const r0=await p.evaluate(()=>UI.sel.r);await p.tap('#ppop [data-a=rot][data-d="1"]');await p.waitForTimeout(300);const r1=await p.evaluate(()=>UI.sel.r);if(r1===r0)prob('rotate button did nothing');
      const bx=await p.evaluate(()=>{const R=document.querySelector('#ppop .ph-tiles').getBoundingClientRect();return [R.left+R.width/2,R.top+R.height/2]});
      const cdp=await ctx.newCDPSession(p);const sw=async(dx)=>{await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:bx[0]-dx/2,y:bx[1]}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:bx[0],y:bx[1]}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});};
      // swipe via synthetic pointer events (touch swipes may be taken by the browser as scroll)
      await p.evaluate(([x,y])=>{const el=document.elementFromPoint(x,y);const o=d=>({bubbles:true,clientX:x+d,clientY:y,pointerId:7,pointerType:'touch'});el.dispatchEvent(new PointerEvent('pointerdown',o(-30)));el.dispatchEvent(new PointerEvent('pointerup',o(30)))},bx);await p.waitForTimeout(300);
      const r2=await p.evaluate(()=>UI.sel.r);if(r2===r1)prob('swipe did not rotate');
      const t2=await p.$('#ppop [data-ph=pcard][data-t="1"]');if(t2){await t2.tap();await p.waitForTimeout(300);const s2=await p.evaluate(()=>UI.sel.t);if(s2!==1)prob('tile 2 not selected')}
      await shot('5popup_rot');
      // outside tap closes (tap the board on an interior square), Esc closes, x closes
      await p.touchscreen.tap(...(await sqPt(3,3)));await p.waitForTimeout(300);if(!(await p.evaluate(()=>document.querySelector('#ppop').hidden)))prob('outside tap did not close the popup');
      await p.touchscreen.tap(x,y);await p.waitForTimeout(400);await p.keyboard.press('Escape');await p.waitForTimeout(250);if(!(await p.evaluate(()=>document.querySelector('#ppop').hidden)))prob('Esc did not close the popup');
      await p.touchscreen.tap(x,y);await p.waitForTimeout(400);await p.tap('#ppop [data-ph=pclose]');await p.waitForTimeout(250);if(!(await p.evaluate(()=>document.querySelector('#ppop').hidden)))prob('x did not close the popup');
      // place from the popup (rotate until allowed)
      await p.touchscreen.tap(x,y);await p.waitForTimeout(400);
      for(let i=0;i<4;i++){const ok=await p.evaluate(()=>!document.querySelector('#ppop [data-a=place]').disabled);if(ok)break;await p.tap('#ppop [data-a=rot][data-d="1"]');await p.waitForTimeout(200)}
      const turn0=await p.evaluate(()=>G.turn+':'+G.logN);await p.tap('#ppop [data-a=place]');await p.waitForTimeout(700);await shot('6after_place');await scroll('after place');
      await waitHuman();const turn1=await p.evaluate(()=>G.logN);if(turn1===turn0.split(':')[1])prob('place did nothing')}}
  // a few more turns through the strip (tile, rotate, Place) and taps on monsters
  for(let k=0;k<6;k++){await waitHuman();await dismissCards();const st=await p.evaluate(()=>({over:!!G.over,q:!!G.q}));if(st.over)break;
    if(st.q){const o=await p.$('#pc [data-a=q]');if(o)await o.tap();await p.waitForTimeout(400);continue}
    let pb=await p.$('#ps [data-a=place]:not([disabled])');for(let i=0;i<4&&!pb;i++){const r2=await p.$('#ps [data-a=rot][data-d="1"]');if(r2)await r2.tap();await p.waitForTimeout(150);pb=await p.$('#ps [data-a=place]:not([disabled])')}
    if(k===1){await shot('7strip');await whole('strip turn')}
    if(pb){await pb.tap();await p.waitForTimeout(600)}else{const pa=await p.$('#ps [data-a=pass],#ps [data-a=cannon],#ps [data-a=gate]');if(pa)await pa.tap()}
    await p.waitForTimeout(300)}
  await waitHuman();await dismissCards();await p.waitForTimeout(300);await scroll('later');await whole('later');await shot('8later');
  // info pop-up: tap a leviathan, then a ship
  const mon=await p.evaluate(()=>{const fr=(UI.fronts||[]).map(s=>G.ships[s].x+','+G.ships[s].y);const m=G.mons.find(x=>x.k==='L'&&!fr.includes(x.x+','+x.y));return m?[m.x,m.y]:null});
  if(mon){await tapSq(...mon);const io=await p.evaluate(()=>({open:!document.querySelector('#ppop').hidden,txt:document.querySelector('#ppop').textContent.slice(0,80),img:!!document.querySelector('#ppop img')}));log('monster info',JSON.stringify(io));if(!io.open||!io.img)prob('monster tap did not open the info popup');await shot('9moninfo');await targets('info');await p.keyboard.press('Escape');await p.waitForTimeout(200)}
  const nm0=await p.evaluate(()=>{const s=G.ships.find(s=>s.alive&&s.i!==viewSeat()&&shipPos(s));if(!s)return null;const q=shipPos(s);const w=TWKit.portWorld(q.c,q.r,q.port||0);return __P()(w[0],0.2,w[1])});
  if(nm0){await p.touchscreen.tap(nm0[0],nm0[1]);await p.waitForTimeout(350);const io=await p.evaluate(()=>({open:!document.querySelector('#ppop').hidden,txt:document.querySelector('#ppop').textContent.slice(0,80)}));log('ship info',JSON.stringify(io));await shot('9shipinfo');await p.keyboard.press('Escape');await p.waitForTimeout(200)}
  // zoom toggle
  await waitHuman();await dismissCards();await p.tap('#ps [data-ph=zoom]');await p.waitForTimeout(1500);await shot('10zoom');const zr=await metrics();log('zoomed grid px',zr.grid);if(zr.grid<=m0.grid*1.2)prob('zoom did nothing',zr.grid,m0.grid);await p.tap('#ps [data-ph=zoom]');await p.waitForTimeout(3500);const zb=await metrics();if(Math.abs(zb.grid-m0.grid)>3)prob('zoom off did not restore',zb.grid,m0.grid);
  // drawers
  for(const id of['setd','crewd']){await p.tap(`.gx-bar [data-gx="${id}"]`);await p.waitForTimeout(600);await scroll('drawer '+id);if(id==='setd')await shot('11menu');await p.keyboard.press('Escape');await p.waitForTimeout(350)}
  // hot-seat pass screen
  await p.evaluate(()=>{UI.cfgOpen=true;showStart()});await p.waitForTimeout(300);await p.click('[data-a=mode][data-v=hot]');await p.click('[data-a=np][data-v="3"]');await p.click('#startbtn');await p.waitForTimeout(1200);
  await scroll('pass');await shot('12pass');const pass=await p.evaluate(()=>({card:!document.querySelector('#pc').hidden&&!!document.querySelector('#pc [data-a=take]'),hand:!!document.querySelector('#ps [data-owner]')}));if(!pass.card)prob('no pass card in hot-seat',JSON.stringify(pass));if(pass.hand)prob('hand visible before pass screen taken');
  await p.tap('#pc [data-a=take]');await p.waitForTimeout(500);await whole('hot setup');await shot('13hot');
  // busy 8 captain game + game over card
  await p.evaluate(()=>{UI.cfgOpen=true;showStart()});await p.waitForTimeout(300);await p.click('[data-a=mode][data-v=watch]');await p.click('[data-a=np][data-v="8"]');
  for(const k of['rift','wave','maelstrom','cannon']){await p.evaluate(k=>{const c=document.querySelector(`[data-a=exp][data-k=${k}]`);if(!c.checked){c.checked=true;c.dispatchEvent(new Event('change',{bubbles:true}))}},k)}
  await p.evaluate(()=>{setSeed(11);AIDELAY=0;ANIM=0});await p.click('#startbtn');await p.waitForTimeout(1500);await p.evaluate(()=>{let n=0;while(!G.over&&n++<60&&G.turn<8){const st=aiStep();if(!st)break;act(st.m,st.seat)}});await p.waitForTimeout(1500);
  await scroll('busy');await whole('busy 8p');await shot('14busy8');
  await p.evaluate(()=>{UI.cfgOpen=true;showStart()});await p.waitForTimeout(300);await p.click('[data-a=mode][data-v=watch]');await p.click('[data-a=np][data-v="4"]');for(const k of['rift','wave','maelstrom','cannon']){await p.evaluate(k=>{const c=document.querySelector(`[data-a=exp][data-k=${k}]`);if(c.checked){c.checked=false;c.dispatchEvent(new Event('change',{bubbles:true}))}},k)}await p.evaluate(()=>{setSeed(11);AIDELAY=0;ANIM=0});await p.click('#startbtn');await p.waitForTimeout(1200);
  await p.evaluate(()=>{ANIM=0;let n=0;while(!G.over&&n++<8000){const st=aiStep();if(!st)break;performMove(st.m,st.seat)}refresh();overCheck&&overCheck()});await p.waitForTimeout(1500);await scroll('over');await shot('15over');
  const ov=await p.evaluate(()=>({card:!document.querySelector('#pc').hidden&&!!document.querySelector('#pc [data-over]'),cont:!!document.querySelector('#pc [data-ph=dismiss]')}));if(!ov.card||!ov.cont)prob('end card missing',JSON.stringify(ov));
  await p.tap('#pc [data-ph=dismiss]');await p.waitForTimeout(400);await whole('over dismissed');await shot('16over_board');
  log('errors',JSON.stringify(errs.slice(0,4)));bad+=errs.length;rep.push({t,m0});await ctx.close()}
fs.writeFileSync(path.join(HERE,'out','layphone'+(BEFORE?'_before':'')+'.json'),JSON.stringify(rep,null,1));console.log('PROBLEMS',bad);await b.close()})().catch(e=>{console.error('FATAL',e);process.exit(1)});
