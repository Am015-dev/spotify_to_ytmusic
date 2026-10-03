// Phone layout + touch-only play test for Nebula Aces (real WebGL via SwiftShader, isMobile + hasTouch).
// node lay-phone.js [WxH,...] [--rounds=2] [--anim=0|1] [--file=nebula.html] [--q=?phone=1] [--hot] [--safe=t,r,b,l]
const PW=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs'),path=require('path');
const A=process.argv.slice(2);const arg=(k,d)=>{const a=A.find(x=>x.startsWith('--'+k+'='));return a?a.slice(k.length+3):d};
const SIZES=(A[0]&&!A[0].startsWith('--')?A[0]:'390x844,844x390,360x740,740x360').split(',').map(s=>s.split('x').map(Number));
const ROUNDS=+arg('rounds',2),ANIMV=arg('anim','1')==='1',FILE=arg('file','nebula.html'),HOT=A.includes('--hot'),SAFE=arg('safe','');
const OUT=path.join(__dirname,'shots','ph');fs.mkdirSync(OUT,{recursive:true});
(async()=>{const b=await PW.chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});let bad=0;
for(const [W,H] of SIZES){const t=W+'x'+H+(HOT?'_hot':'');const ctx=await b.newContext({viewport:{width:W,height:H},deviceScaleFactor:1,isMobile:true,hasTouch:true});
  const p=await ctx.newPage();p.setDefaultTimeout(30000);const errs=[];p.on('pageerror',e=>errs.push('pageerror '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/net::|Failed to load resource|ERR_/.test(m.text()))errs.push(m.text())});
  const log=(...a)=>console.log(t,...a);const prob=(...a)=>{bad++;console.log('FAIL '+t+' '+a.map(x=>typeof x==='string'?x:JSON.stringify(x)).join(' '))};
  const seen=new Set();const note=k=>seen.add(k);
  await p.goto('file://'+path.resolve(FILE)+'?phone=1'+(SAFE?'&safe='+SAFE:''));await p.waitForTimeout(1500);
  await p.evaluate(a=>{ANIM=a;AIDELAY=60;try{localStorage.removeItem('na_tour');localStorage.removeItem('na_coach');localStorage.removeItem('na_guide')}catch(e){}},ANIMV);
  const shot=async n=>{if(process.env.AT===n&&process.env.JS){console.log('EVAL',n,JSON.stringify(await p.evaluate(process.env.JS)));if(process.env.AT_EXIT)process.exit(0)}await p.screenshot({path:path.join(OUT,`${t}_${n}.png`)});if(process.env.DUMP)fs.writeFileSync(path.join(OUT,`${t}_${n}.html`),await p.evaluate(()=>['#prompt','#ps','#ppop','#pc'].map(q=>{const e=document.querySelector(q);return e&&!e.hidden?e.outerHTML:''}).join('\n\n')))};
  const info=()=>p.evaluate(()=>({w:innerWidth,h:innerHeight,sw:document.documentElement.scrollWidth,sh:document.documentElement.scrollHeight,ph:document.documentElement.className}));
  // ---- generic checks ----
  const noScroll=async tag=>{const r=await info();if(r.sw>r.w+1||r.sh>r.h+1)prob(tag,'PAGE SCROLL',JSON.stringify(r))};
  const tapTargets=async tag=>{const r=await p.evaluate(()=>{const o=[];for(const e of document.querySelectorAll('.gx-bar button,.gx-dock button,#phctl button,#ppop button,#pc button,#modal button,#modal select,#modal input,.gx-drawer button,.gx-drawer select,#more button')){
      const R=e.getBoundingClientRect();if(R.width<2||R.height<2)continue;let hid=false;for(let n=e;n&&n!==document.body;n=n.parentElement){const c=getComputedStyle(n);if(c.display==='none'||c.visibility==='hidden'){hid=true;break}}if(hid)continue;
      if(e.closest('.gx-drawer')&&!e.closest('.gx-drawer.on'))continue;if(e.closest('#more')&&!e.closest('#more.open'))continue;
      if(e.matches('.road .ph')&&document.documentElement.classList.contains('ph-p')){if(R.height>36.5||R.height<30)o.push('phase tab height '+Math.round(R.height));continue}
      if(R.width<43.5||R.height<43.5)o.push((e.dataset.a||e.dataset.ph||e.dataset.pd||e.dataset.road||e.dataset.gx||e.className||e.tagName).toString().slice(0,22)+':'+Math.round(R.width)+'x'+Math.round(R.height))}return o});
    if(r.length)prob(tag,'SMALL TAP TARGETS',JSON.stringify(r.slice(0,8)))};
  const fonts=async tag=>{const r=await p.evaluate(()=>{const o=new Set();const walk=document.createTreeWalker(document.body,4);while(walk.nextNode()){const n=walk.currentNode;if(!n.nodeValue.trim())continue;const e=n.parentElement;if(!e||e.closest('script,style,.sr,#live'))continue;const R=e.getBoundingClientRect();if(R.width<2||R.height<2)continue;let hid=false;for(let q=e;q&&q!==document.body;q=q.parentElement){const c=getComputedStyle(q);if(c.display==='none'||c.visibility==='hidden'){hid=true;break}}if(hid)continue;
        if(e.closest('.gx-drawer')&&!e.closest('.gx-drawer.on'))continue;if(e.closest('#more')&&!e.closest('#more.open'))continue;if(e.closest('#roster,#log,#bbody')&&!e.closest('.gx-drawer.on'))continue;
        const fs=parseFloat(getComputedStyle(e).fontSize);if(fs>0&&fs<12.5)o.add(e.className+'|'+(e.tagName)+'|'+fs.toFixed(1)+'|'+n.nodeValue.trim().slice(0,16))}return [...o]});if(r.length)prob(tag,'SMALL TEXT',JSON.stringify(r.slice(0,8)))};
  const board=async tag=>{await settle();const r=await p.evaluate(()=>{const cv=V3.r.domElement;const R=cv.getBoundingClientRect();V3.camera.updateMatrixWorld();const P=(x,y)=>{const v=W(x,y,0).project(V3.camera);return [R.left+(v.x+1)/2*R.width,R.top+(1-v.y)/2*R.height]};
      const cs=[P(0,0),P(MAT,0),P(MAT,MAT),P(0,MAT)];const xs=cs.map(a=>a[0]),ys=cs.map(a=>a[1]);const mat=[Math.max(...xs)-Math.min(...xs),Math.max(...ys)-Math.min(...ys)];
      const ships=G.ships.filter(s=>s.alive).map(s=>{const q=P(s.x,s.y);const k=corners(s,B(s)).map(c=>P(c.x,c.y));const e=document.elementFromPoint(q[0],q[1]);return {n:s.name,gx:Math.round(s.x),gy:Math.round(s.y),x:q[0],y:q[1],px:Math.hypot(k[0][0]-k[2][0],k[0][1]-k[2][1])*.707,in:q[0]>=R.left&&q[0]<=R.right&&q[1]>=R.top&&q[1]<=R.bottom,hit:!!e&&(e===cv||cv.contains(e)),ctl:!!e&&!!e.closest('#phctl')}});
      return {rect:[R.left,R.top,R.width,R.height].map(Math.round),mat:mat.map(Math.round),short:Math.min(innerWidth,innerHeight),portrait:innerHeight>innerWidth,panelH:Math.round(document.querySelector('.gx-dock').getBoundingClientRect().height),ships,zoomed:V3.cam.dist<V3.fitDist*.97}});return r};
  const boardCheck=async(tag,allowOut)=>{const r=await board(tag);const side=Math.min(r.rect[2],r.rect[3]);if(r.rect[2]!==r.rect[3])prob(tag,'board not square',r.rect);
    // portrait: the board may shrink to .75 x width on short viewports (never below), but only to keep the panel usable
    const lo=r.portrait?.75:.85;if(side<lo*r.short-1)prob(tag,'board side',side,'<',lo*r.short);if(r.portrait&&side<.85*r.short-1&&r.panelH>300)prob(tag,'board shrunk although the panel has room',side,r.panelH);
    if(!r.zoomed&&Math.min(...r.mat)<.85*Math.min(side,.85*r.short)-2)prob(tag,'mat extent',r.mat,'< .85 of the board');
    for(const s of r.ships){if(!allowOut&&!r.zoomed&&!s.in&&s.gx>=0&&s.gx<=914&&s.gy>=0&&s.gy<=914)prob(tag,'ship outside board',s.n,Math.round(s.x),Math.round(s.y),'G',s.gx,s.gy,JSON.stringify(r.rect));if(s.in&&!s.hit&&!s.ctl)prob(tag,'ship point covered (not hit-testing to the canvas)',s.n)}return r};
  const popCheck=async tag=>{const r=await p.evaluate(()=>{const o=[];const B=document.querySelector('.gx-board').getBoundingClientRect();for(const sel of ['#ppop','#pc']){const e=document.querySelector(sel);if(!e||e.hidden)continue;const R=e.getBoundingClientRect();if(R.width<2)continue;
        if(R.left<B.right-0.5&&R.right>B.left+0.5&&R.top<B.bottom-0.5&&R.bottom>B.top+0.5)o.push(sel+' overlaps the board');if(R.right>innerWidth+1||R.bottom>innerHeight+1||R.left<-1)o.push(sel+' outside viewport')}return o});if(r.length)prob(tag,r.join('; '))};

  // ---- CLIPPED-TEXT: every visible text inside the panel/dock/pop-ups/menus must be fully readable; the primary action must be fully visible ----
  const clipCheck=async tag=>{const r=await p.evaluate(()=>{const o=[];const VW=innerWidth,VH=innerHeight;const desc=e=>(e.id?'#'+e.id:'')+(e.className&&typeof e.className==='string'?'.'+e.className.trim().split(/\s+/).slice(0,2).join('.'):'')||e.tagName;
    const vis=e=>{for(let n=e;n&&n!==document.documentElement;n=n.parentElement){const c=getComputedStyle(n);if(c.display==='none'||c.visibility==='hidden'||c.opacity==='0')return false;if(n.hidden)return false}return true};
    const live=e=>{if(!vis(e))return false;if(e.closest('.gx-drawer')&&!e.closest('.gx-drawer.on'))return false;if(e.closest('#more')&&!e.closest('#more.open'))return false;if(e.closest('#roster,#log,#bbody')&&!e.closest('.gx-drawer.on'))return false;if(e.closest('.sr,#live,script,style'))return false;return true};
    const roots='.gx-dock,#ppop,#pc,#modal,#more,.gx-drawer.on,.gx-bar,#phctl';const ovl=['#ppop','#pc'].map(q=>document.querySelector(q)).filter(e=>e&&!e.hidden&&e.getClientRects().length);
    const w=document.createTreeWalker(document.body,4);const seen=new Set();
    while(w.nextNode()){const n=w.currentNode;if(!n.nodeValue.trim())continue;const e=n.parentElement;if(!e||!e.closest(roots)||!live(e))continue;if(ovl.length&&!ovl.some(x=>x.contains(e))&&e.closest('.gx-dock'))continue;
      const rg=document.createRange();rg.selectNodeContents(n);const R=rg.getBoundingClientRect();if(R.width<1||R.height<1)continue;const lab=desc(e)+' "'+n.nodeValue.trim().slice(0,28)+'"';
      let ok=true;
      if(R.left<-1||R.right>VW+1||R.top<-1||R.bottom>VH+1){let scrolled=false;for(let a=e;a&&a!==document.documentElement;a=a.parentElement){const c=getComputedStyle(a);if(/(auto|scroll)/.test(c.overflowY)&&a.scrollHeight>a.clientHeight+1){scrolled=true;break}}if(!scrolled){o.push('outside viewport: '+lab+' '+[R.left,R.top,R.right,R.bottom].map(Math.round));ok=false}}
      for(let a=e;ok&&a&&a!==document.body&&a!==document.documentElement;a=a.parentElement){const c=getComputedStyle(a);const ar=a.getBoundingClientRect();if(ar.width<1&&ar.height<1)continue;
        const hy=/(hidden|clip)/.test(c.overflowY),sy=/(auto|scroll)/.test(c.overflowY),hx=/(hidden|clip)/.test(c.overflowX);
        if(a===e&&hy&&a.clientHeight>0&&a.scrollHeight>a.clientHeight+1&&!seen.has(a)){seen.add(a);o.push('scrollHeight>clientHeight, overflow hidden: '+lab+' '+a.scrollHeight+'>'+a.clientHeight)}
        if(R.top<ar.top-1||R.bottom>ar.bottom+1){if(hy&&!sy){o.push('cut by '+desc(a)+': '+lab+' text '+Math.round(R.top)+'-'+Math.round(R.bottom)+' box '+Math.round(ar.top)+'-'+Math.round(ar.bottom));break}if(sy){break}}
        if(hx&&(R.left<ar.left-1||R.right>ar.right+1)&&!/ellipsis/.test(getComputedStyle(e).textOverflow)&&!/ellipsis/.test(c.textOverflow)){o.push('cut sideways by '+desc(a)+': '+lab);break}}}
    for(const b of document.querySelectorAll('.gx-dock button,.gx-bar button,#ppop button,#pc button,#phctl button,#more button')){if(!live(b))continue;if(b.clientWidth>0&&b.scrollWidth>b.clientWidth+1&&!/ellipsis/.test(getComputedStyle(b).textOverflow))o.push('text wider than its button: '+desc(b)+' "'+(b.textContent||'').trim().slice(0,20)+'" '+b.scrollWidth+'>'+b.clientWidth)}
    const over=['#ppop','#pc'].map(q=>document.querySelector(q)).filter(e=>e&&!e.hidden&&e.getClientRects().length);
    for(const b of document.querySelectorAll('#prompt .btn.primary,#ps .btn.primary,#ppop .btn.primary,#pc .btn.primary,#modal .btn.primary')){if(!live(b)||b.disabled||b.closest('.acts.grid'))continue;if(over.length&&!over.some(e=>e.contains(b)))continue;const R=b.getBoundingClientRect();if(R.width<2)continue;const lab=desc(b)+' "'+(b.textContent||'').trim().slice(0,24)+'"';
      if(R.left<-0.5||R.top<-0.5||R.right>VW+.5||R.bottom>VH+.5)o.push('PRIMARY outside viewport: '+lab);
      for(let a=b.parentElement;a&&a!==document.body;a=a.parentElement){const c=getComputedStyle(a);if(/(hidden|clip|auto|scroll)/.test(c.overflowY)){const ar=a.getBoundingClientRect();if(R.top<ar.top-.5||R.bottom>ar.bottom+.5){o.push('PRIMARY not fully visible in '+desc(a)+': '+lab+' '+Math.round(R.top)+'-'+Math.round(R.bottom)+' vs '+Math.round(ar.top)+'-'+Math.round(ar.bottom));break}}}
      const m=document.elementFromPoint(R.left+R.width/2,R.top+R.height/2);if(!m||!(b===m||b.contains(m)))o.push('PRIMARY covered: '+lab+' by '+(m?desc(m):'nothing'))}
    return o});if(r.length)prob(tag,'CLIPPED TEXT',JSON.stringify(r.slice(0,6)))};
  const all=async(tag,o)=>{await noScroll(tag);await clipCheck(tag);await tapTargets(tag);await fonts(tag);await popCheck(tag);try{return await boardCheck(tag,o&&o.allowOut)}catch(e){prob(tag,'board check threw',e.message)}};
  const shipXY=async id=>{await settle();return p.evaluate(id=>{const s=ship(id);const cv=V3.r.domElement,R=cv.getBoundingClientRect();V3.camera.updateMatrixWorld();const v=W(s.x,s.y,1.2).project(V3.camera);return [R.left+(v.x+1)/2*R.width,R.top+(1-v.y)/2*R.height]},id)};
  const st=()=>p.evaluate(()=>{const vis=s=>{const e=document.querySelector(s);return !!e&&!e.hidden&&e.getClientRects().length>0};return {has:!!G,info:!!UI.info,build:UI.build,rules:!!UI.rules,stats:!!UI.stats,round:G&&G.round,phase:G&&G.phase,win:G&&G.winner,ps:G?planSide():-1,hum:G?humanTurn():false,cur:G&&G.cur,hold:!!UI.hold,sum:G?sumPending():false,pc:vis('#pc'),pcKey:(document.querySelector('#pc')||{})._k||null,pop:vis('#ppop'),popKind:window.PHN&&PHN.pop&&PHN.pop.kind,strip:vis('#ps'),modal:!document.querySelector('#modal').classList.contains('hidden'),pass:!!document.querySelector('#modal .pass'),q:G&&G.q&&G.q.key,atk:G&&G.atk&&G.atk.step,drawer:GX.open}});
  const tapL=async(sel,tag,okFn)=>{const l=p.locator(sel).first();let last='';for(let k=0;k<3;k++){if(k&&okFn&&await p.evaluate(okFn).catch(()=>false))return true;try{await l.tap({timeout:8000});return true}catch(e){last=e.message.split('\n').filter(x=>/intercept|not visible|outside|detached|obscur/.test(x)).slice(-1)[0]||e.message.split('\n')[0];
      // diagnose: what is really on top of the target's centre right now?
      await p.screenshot({path:path.join(OUT,`${t}_FAIL_${(tag||'x').replace(/\W/g,'')}${k}.png`)}).catch(()=>{});const d=await p.evaluate(sel=>{const el=document.querySelector(sel);if(!el)return {missing:true,modal:document.getElementById('modal').className,html:document.getElementById('modal').innerHTML.slice(0,80)};const r=el.getBoundingClientRect();const x=r.left+r.width/2,y=r.top+r.height/2;const t=document.elementFromPoint(x,y);return {x,y,r:[r.left,r.top,r.width,r.height].map(Math.round),top:t?(t.id||t.className||t.tagName):null,own:!!t&&(t===el||el.contains(t)),anim:document.getAnimations().length,vis:innerHeight,all:[...document.querySelectorAll(sel)].length,modalCls:document.getElementById('modal').className,gx:GX.open,scrim:document.querySelector('.gx-scrim').className}},sel).catch(e=>String(e));
      if(d)console.log('DIAG '+t+' '+(tag||sel)+' '+JSON.stringify(d));await p.waitForTimeout(800)}}
    if(okFn&&await p.evaluate(okFn).catch(()=>false))return true;prob(tag||sel,'tap failed after 3 tries',last);return false};
  const settle=async()=>{for(let k=0;k<60;k++){const e=await p.evaluate(()=>!!V3.ez);if(!e)break;await p.waitForTimeout(150)}await p.waitForTimeout(150)};
  const tapXY=async(x,y)=>{const inb=await p.evaluate(([x,y])=>{const R=document.querySelector('.gx-board').getBoundingClientRect();return x>=R.left&&x<=R.right&&y>=R.top&&y<=R.bottom},[x,y]);if(!inb){prob('board tap point is outside the board',Math.round(x),Math.round(y));return}await p.touchscreen.tap(x,y);await p.waitForTimeout(250)};
  // ---- 0. start screen ----
  await noScroll('start');await tapTargets('start');await fonts('start');await shot('0start');
  // 0b. drawers and menu
  // squad builder via the start screen
  await p.evaluate(()=>{UI.size='custom';UI.squads=UI.squads||[[],[]];render()});await p.waitForTimeout(300);
  const bb=p.locator('[data-a=build]').first();if(await bb.count()){await bb.tap();await p.waitForTimeout(2500);await noScroll('builder');await tapTargets('builder');await shot('0builder');
    await p.evaluate(()=>{const b=document.querySelector('[data-badd]');b&&b.click()});await p.waitForTimeout(300);await shot('0builder2');await tapTargets('builder2');
    await p.evaluate(()=>{GX.close()});await p.waitForTimeout(300)}
  await p.evaluate(()=>{UI.size='core';UI.info=true;render()});await p.waitForTimeout(300);
  if(HOT){await p.evaluate(()=>{UI.mode='hot';render()});await p.waitForTimeout(200)}
  await tapL('#modal [data-start]','launch',()=>!!G);await p.waitForTimeout(1500);
  // ---- main loop: only touch taps through the board, pop-ups, cards and the dock ----
  let steps=0,maxRound=0,stuck=0,lastSig='';const done=new Set();let atkTapped=0,armTapped=0,dialTapped=0;
  while(steps++<400){const s=await st();if(s.win){note('winner');break}
    if(s.round>maxRound){maxRound=s.round}if(s.round>ROUNDS||(s.round===ROUNDS&&s.phase==='plan'&&s.sum===false&&s.ps>=0&&done.has('r'+ROUNDS+'plan')))break;
    const sig=JSON.stringify([s.round,s.phase,s.cur,s.hold,s.sum,s.pc,s.pop,s.q,s.atk,s.ps,s.hum]);if(sig===lastSig){stuck++}else{stuck=0;lastSig=sig}
    if(stuck>60){prob('STUCK',sig);await shot('stuck');break}
    if(s.modal&&s.pass){note('pass card');const r=await tapL('#modal [data-a=passok]','pass');await p.waitForTimeout(400);await noScroll('pass');continue}
    if(s.modal){await tapL('#modal [data-start],#modal [data-a=close]','modal');await p.waitForTimeout(400);continue}
    if(s.pc){note('card:'+s.pcKey);await all('card '+s.pcKey);if(s.round===0&&!done.has('brief')){done.add('brief');await shot('1brief')}await tapL('#pc [data-ph=briefok],#pc [data-a=advise]','card');await p.waitForTimeout(400);continue}
    if(!s.has){await p.waitForTimeout(300);continue}
    // setup questions
    if(s.phase==='ask'&&s.hum){note('ask:'+s.q);
      if(!done.has('spot')&&(s.q==='rock'||s.q==='deploy')){done.add('spot');await all('setup');await shot('2setup');const spot=await p.evaluate(()=>{const o=G.q.opts.find(o=>o.p);if(!o)return null;const cv=V3.r.domElement,R=cv.getBoundingClientRect();const v=W(o.p.x,o.p.y,0).project(V3.camera);return [R.left+(v.x+1)/2*R.width,R.top+(1-v.y)/2*R.height,R.left,R.top,R.width,R.height]});
        if(spot){if(spot[0]<spot[2]||spot[0]>spot[2]+spot[4]||spot[1]<spot[3]||spot[1]>spot[3]+spot[5])prob('setup spot outside the board');await tapXY(spot[0],spot[1]);note('spot tap');await p.waitForTimeout(500);continue}}
      if(s.q==='rock'||s.q==='deploy'){await tapL('#prompt [data-a=autoplace]','autoplace');await p.waitForTimeout(500);continue}
      const ok=await p.locator('#prompt [data-act=ask].primary,#prompt [data-act=ask]').first();if(await ok.count()){await ok.tap();await p.waitForTimeout(400)}continue}
    if(s.sum){note('summary card');if(!done.has('sum')){done.add('sum');await all('summary');await shot('6summary')}await tapL('#prompt [data-a=nextround]','nextround');await p.waitForTimeout(400);continue}
    if(s.hold){note('hold card');if(!done.has('hold')){done.add('hold');await all('hold');await shot('5hold')}await tapL('#prompt [data-a=hold]','hold');await p.waitForTimeout(400);continue}
    if(s.phase==='plan'&&s.ps>=0){
      if(s.pop&&s.popKind==='dial'){note('dial popup');if(!done.has('dial')){done.add('dial');await all('dial popup');await shot('3dial')}
        const cells=await p.locator('#ppop .pm:not([disabled])').count();const sug=p.locator('#ppop .pm.sugg').first();
        if(dialTapped%2===0&&await sug.count())await sug.tap();else await p.locator('#ppop .pm:not([disabled])').nth(Math.min(cells-1,2+dialTapped%3)).tap();dialTapped++;await p.waitForTimeout(350);
        if(!done.has('dialpick')){done.add('dialpick');await all('dial picked',{allowOut:true});await shot('3dialpick')}
        await tapL('#ppop [data-ph=set]','set');await p.waitForTimeout(450);continue}
      // tap a ship that needs a dial, by touch on the board
      const need=await p.evaluate(()=>{const my=alive().filter(x=>x.side===planSide());const n=my.filter(x=>UI.draft[x.id]==null);return {n:n.map(x=>x.id),all:my.length}});
      if(need.n.length){note('plan strip');if(!done.has('strip')){done.add('strip');await all('plan strip');await shot('3plan')}
        const xy=await shipXY(need.n[0]);const inB=await p.evaluate(([x,y])=>{const R=document.querySelector('.gx-board').getBoundingClientRect();return x>=R.left&&x<=R.right&&y>=R.top&&y<=R.bottom},xy);
        if(!inB)prob('ship not on the board at plan',xy);await tapXY(xy[0],xy[1]);const s2=await st();if(!s2.pop){prob('tap on my ship did not open the dial pop-up');await tapL('#ps [data-ph=ship]','chip');}
        await p.waitForTimeout(300);continue}
      if(!done.has('focus')){done.add('focus');await tapL('[data-ph=focus]','focus');await p.waitForTimeout(1800);const z=await board('focus');if(!z.zoomed)prob('focus did not zoom');log('FOCUS ship base px',Math.round(z.ships.find(q=>/Kael/.test(q.n)).px),'(focused view, plan phase)');await shot('4focus');
        await tapL('[data-ph=zin]','zin');await p.waitForTimeout(300);await tapL('[data-ph=zout]','zout');await p.waitForTimeout(300);await tapL('[data-ph=fit]','fit');await p.waitForTimeout(600);const z2=await board('fit');if(z2.zoomed)prob('fit did not restore the whole mat');
        await tapL('[data-ph=focus]','focus');await p.waitForTimeout(500)}
      await all('plan locked',{allowOut:true});if(s.round===ROUNDS)done.add('r'+ROUNDS+'plan');
      if(s.round===ROUNDS)break;
      note('lock');await tapL('#ps [data-a=lock]','lock');await p.waitForTimeout(700);continue}
    if(s.phase==='action'&&s.hum){note('action');
      if(!done.has('tele'+s.round)&&!HOT&&s.round<=2){done.add('tele'+s.round);await p.evaluate(()=>{const me=ship(G.cur);const f=fwd(me.h),l=leftOf(me.h);G.ships.filter(x=>x.side!==me.side&&x.alive).forEach((e,i)=>{const d=150+i*40,o=(i?1:-1)*45;e.x=Math.max(70,Math.min(MAT-70,me.x+f.x*d+l.x*o));e.y=Math.max(70,Math.min(MAT-70,me.y+f.y*d+l.y*o));e.h=me.h+Math.PI});render()});await p.waitForTimeout(500)}
if(!done.has('act')){done.add('act');await all('action card');await shot('4action')}
      const btns=p.locator('#prompt [data-act=action]');const n=await btns.count();let k=0;
      if(!done.has('arm')){const hov=p.locator('#prompt [data-act=action][data-hov]').first();if(await hov.count()){done.add('arm');await hov.tap();await p.waitForTimeout(400);const armed=await p.evaluate(()=>!!document.querySelector('#prompt .armed')&&!!UI.hoverAct);if(!armed){const dbg=await p.evaluate(()=>JSON.stringify({armedCls:!!document.querySelector('#prompt .armed'),hov:UI.hoverAct,PA:PHN.armed,phase:G.phase,cur:G.cur,btn:[...document.querySelectorAll('#prompt [data-hov]')].map(b=>b.dataset.hov+':'+b.className).slice(0,4)}));prob('barrel roll/boost first tap did not arm a preview',dbg)}else note('armed preview');await shot('4armed');await all('armed');
          const still=await p.evaluate(()=>G.phase);if(still!=='action')prob('first tap already executed the action');await hov.tap();await p.waitForTimeout(500);continue}}
      if(n){const f=p.locator('#prompt [data-act=action][data-a2=F],#prompt [data-act=action][data-a2=skip]').first();if(await f.count())await f.tap();else await btns.nth(0).tap()}await p.waitForTimeout(500);continue}
    if(s.phase==='target'&&s.hum){note('target');
      const tg=await p.evaluate(()=>{const a=ship(G.cur);const ids=[];for(const w of weaponsFor(a))for(const t of w.targets)if(!ids.includes(t.id))ids.push(t.id);return ids});
      if(tg.length&&atkTapped<3){const xy=await shipXY(tg[0]);if(!done.has('tgt')){done.add('tgt');await all('target');await shot('4target')}await tapXY(xy[0],xy[1]);const s2=await st();
        if(s2.popKind!=='atk'){prob('tap on an enemy in arc did not open the attack pop-up',JSON.stringify(s2.popKind));await tapL('#prompt [data-act=fire]','fire');continue}
        atkTapped++;note('attack popup');if(!done.has('atk')){done.add('atk');await all('attack popup');await shot('4attackpop')}
        // close by outside tap once, reopen, fire
        if(atkTapped===1){{const o=await p.evaluate(()=>{const R=document.querySelector('.gx-board').getBoundingClientRect();const cv=V3.r.domElement;V3.camera.updateMatrixWorld();const pts=G.ships.filter(s=>s.alive).map(s=>{const v=W(s.x,s.y,1.2).project(V3.camera);return [R.left+(v.x+1)/2*R.width,R.top+(1-v.y)/2*R.height]});let best=null,bd=-1;for(const c of [[R.left+25,R.top+25],[R.right-25,R.top+25],[R.left+25,R.bottom-25],[R.right-25,R.bottom-25]]){const d=Math.min(...pts.map(q=>Math.hypot(q[0]-c[0],q[1]-c[1])));if(d>bd){bd=d;best=c}}return best});await tapXY(o[0],o[1])}await p.waitForTimeout(300);const s3=await st();if(s3.pop)prob('outside tap did not close the pop-up');note('outside tap closes');await tapXY(xy[0],xy[1])}
        await tapL('#ppop [data-act=fire]','fire');await p.waitForTimeout(500);continue}
      const hf=p.locator('#prompt [data-act=fire]').first();if(await hf.count())await hf.tap();else{const sk=p.locator('#prompt [data-w=skip]').first();if(await sk.count())await sk.tap()}await p.waitForTimeout(500);continue}
    if((s.phase==='amod'||s.phase==='dmod'||s.phase==='damod')&&s.hum){note(s.phase);if(!done.has(s.phase)){done.add(s.phase);await all(s.phase);await shot('5'+s.phase)}
      const dn=p.locator(`#prompt [data-act=${s.phase}][data-k=done]`).first();if(await dn.count())await dn.tap();await p.waitForTimeout(450);continue}
    await p.waitForTimeout(250)}
  // ---- after the loop: menu, info pop-up, guide toggle, drawers ----
  await p.evaluate(()=>{PHN.pop=null;render()});await p.waitForTimeout(300);
  if(!errs.length||true){const s=await st();if(s.has&&!s.win&&s.round>=1){
    const alive=await p.evaluate(()=>G.ships.filter(s=>s.alive).map(s=>[s.id,s.side]));const en=alive.find(a=>a[1]===1)||alive[0];const xy=await shipXY(en[0]);
    if(!(s.phase==='plan'&&s.ps>=0&&false)){await p.evaluate(()=>{PHN.focus(false,true)});await p.waitForTimeout(500);const xy2=await shipXY(en[0]);await tapXY(xy2[0],xy2[1]);const s2=await st();if(s2.pop){note('info popup');await all('info popup',{allowOut:true});await shot('7info');
        const txt=await p.evaluate(()=>document.querySelector('#ppop').textContent);if(!/Hull/.test(txt))prob('info popup lacks hull');
        await tapL('#ppop [data-ph=zoomto]','zoomto');await p.waitForTimeout(500);const z=await board('zoomto');if(!z.zoomed)prob('zoom to ship did not zoom');await shot('7zoomto');await tapL('[data-ph=fit]','fit');await p.waitForTimeout(500)}else prob('info popup did not open on a ship tap',JSON.stringify(s2))}
    await tapL('.gx-gear','gear');await p.waitForTimeout(400);await noScroll('menu');await tapTargets('menu');await shot('8menu');await tapL('.gx-gear','gear');await p.waitForTimeout(300);
    const g0=await p.evaluate(()=>guided());await tapL('.na-guide','guide');await p.waitForTimeout(300);const g1=await p.evaluate(()=>guided());if(g0===g1)prob('guide toggle did not change');await tapL('.na-guide','guide');await p.waitForTimeout(200);
    await tapL('.na-adv','advice');await p.waitForTimeout(400);const adv=await st();if(!adv.pc)prob('advice did not open a card');else{await all('advice card');await shot('8advice');await tapL('#pc [data-a=advise]','advice close')}await p.waitForTimeout(300);
    await tapL('.gx-bar [data-gx=d-squads]','squads');await p.waitForTimeout(1800);await noScroll('squads drawer');await tapTargets('squads drawer');await fonts('squads drawer');await shot('8squads');await p.keyboard.press('Escape');await p.waitForTimeout(300);
    await tapL('.gx-bar [data-gx=d-log]','log');await p.waitForTimeout(1800);await noScroll('log drawer');await shot('8log');await p.keyboard.press('Escape');await p.waitForTimeout(300)}}
  await noScroll('end');
  if(errs.length)prob('console errors',JSON.stringify(errs.slice(0,3)));
  log('steps',steps,'rounds',maxRound,'seen',[...seen].sort().join(', '));await ctx.close()}
await b.close();console.log('PROBLEMS',bad);process.exit(bad?1:0)})();
