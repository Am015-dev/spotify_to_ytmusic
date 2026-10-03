// phone layout test (touch only, real WebGL): node lay-phone.js '{"np":3,"ex":{"gray":true}}' TAG [sizes] [file]
// no scroll, ring >= 0.85 of the short side, board targets hit-test to the canvas with every pop-up/card open, pop-ups never cover the kilns,
// a full human turn by touch taps only (tile or kiln -> pop-up -> rack button), wall choice card, round card + Continue, board pop-ups, end card; tap targets >= 44 px, text >= 13 px, 0 console errors
const {chromium}=require(process.env.PW||'/opt/node22/lib/node_modules/playwright');const CFG=JSON.parse(process.argv[2]||'{}');const TAG=process.argv[3]||'p';
const SIZES=(process.argv[4]||'390x844,844x390,360x740,740x360').split(',').map(s=>s.split('x').map(Number));const FILE=process.argv[5]||__dirname+'/sunglaze.html';
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});let bad=0;const sum=[];
for(const [w,h] of SIZES){const t=TAG+'_'+w+'x'+h;const c=await b.newContext({viewport:{width:w,height:h},isMobile:true,hasTouch:true,deviceScaleFactor:1});const p=await c.newPage();p.setDefaultTimeout(60000);
  const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>m.type()==='error'&&!/CERT|fonts|ERR_/.test(m.text())&&errs.push(m.text()));
  const short=Math.min(w,h);const prob=(tag,msg)=>{bad++;console.log(t,tag,'PROBLEM',msg)};const stats={mins:1e9,minName:'',zoneScroll:0,ringMax:0};
  await p.goto('file://'+FILE+(CFG.q||''));await p.waitForTimeout(1200);
  await p.evaluate(()=>{try{localStorage.clear();localStorage.setItem('sgz_gfx','low')}catch(e){}setSeed(11);AIDELAY=60;ANIM=0});
  await p.addStyleTag({content:'.gx-drawer,.gx-scrim{transition:none!important}'});const on=await p.evaluate(()=>document.documentElement.classList.contains('ph'));if(!on)prob('start','html.ph not set');
  const audit=async tag=>{const r=await p.evaluate(()=>{const cv=document.querySelector('#c3'),R=cv.getBoundingClientRect(),vw=innerWidth,vh=innerHeight;const out={};
      out.scroll={h:document.documentElement.scrollHeight,w:document.documentElement.scrollWidth,vh,vw};
      out.cv=[R.left,R.top,R.width,R.height];out.inside=R.left>=-.5&&R.top>=-.5&&R.right<=vw+.5&&R.bottom<=vh+.5;
      const pr=(x,y,z)=>{const v=new THREE.Vector3(x,y,z).project(V3.cam);return {x:R.left+(v.x+1)/2*R.width,y:R.top+(1-v.y)/2*R.height}};
      if(V3.on&&V3.L){const o=V3.L.ring.out;const xs=[],ys=[];for(let a=0;a<64;a++){const q=pr(Math.cos(a/64*6.283)*o,0,Math.sin(a/64*6.283)*o);xs.push(q.x);ys.push(q.y)}out.ring=Math.min(Math.max(...xs)-Math.min(...xs),Math.max(...ys)-Math.min(...ys));
        // hit tests: kiln centres, centre, every tile slot on the table
        const pts=[];V3.L.kilns.forEach((K,i)=>pts.push(['kiln'+i,pr(K.x,.16,K.z+1.25)]));pts.push(['ctr',pr(0,.1,0)]);
        if(G){G.fac.forEach((a,i)=>a.forEach((_,k)=>{const v=slotScreen('f'+i+'_'+k);if(v)pts.push(['f'+i+'_'+k,{x:R.left+v.x,y:R.top+v.y}])}));G.ctr.forEach((_,k)=>{const v=slotScreen('c_'+k);if(v)pts.push(['c_'+k,{x:R.left+v.x,y:R.top+v.y}])})}
        out.hit=[];for(const [n,q] of pts){const e=document.elementFromPoint(q.x,q.y);const ok=e===cv||(e&&e.closest&&e.closest('.gx-board'))&&q.x>=R.left&&q.x<=R.right&&q.y>=R.top&&q.y<=R.bottom;if(!ok)out.hit.push(n+':'+(e?(e.id||e.className||e.tagName):'none'))}
        out.npts=pts.length}
      const zone=document.querySelector('.gx-dock').getBoundingClientRect();out.zone=[zone.left,zone.top,zone.width,zone.height];
      const inter=(a,b)=>a.left<b.right-1&&a.right>b.left+1&&a.top<b.bottom-1&&a.bottom>b.top+1;
      out.overlap=[];for(const s of ['#ph-pop','#ph-card','#ph-st','.gx-bar']){const e=document.querySelector(s);if(!e||e.hidden)continue;const r=e.getBoundingClientRect();if(r.width&&inter(r,R))out.overlap.push(s)}
      const z=document.getElementById('ph-z');out.zs=z.scrollHeight>z.clientHeight+2;
      const vis=e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return r.width>0&&r.height>0&&s.visibility!=='hidden'&&s.display!=='none'};
      out.small=[];for(const e of document.querySelectorAll('.gx-bar button,#ph-z button,#ph-z [data-cell],#ph-z [data-mv]')){if(!vis(e)||e.closest('[hidden]'))continue;const r=e.getBoundingClientRect();const m=Math.min(r.width,r.height);
        if(m<43.5)out.small.push((e.getAttribute('aria-label')||e.dataset.ph||e.dataset.a||e.textContent.trim().slice(0,12))+':'+Math.round(m));
        if(r.right>vw+1||r.left<-1||(r.bottom>vh+1&&!out.zs))out.small.push('OFF '+(e.dataset.ph||e.textContent.trim().slice(0,12))+' b='+Math.round(r.bottom)+' r='+Math.round(r.right))}
      out.minTap=[...document.querySelectorAll('.gx-bar button,#ph-z button,#ph-z [data-cell]')].filter(e=>vis(e)&&!e.closest('[hidden]')).reduce((a,e)=>{const r=e.getBoundingClientRect();return Math.min(a,Math.min(r.width,r.height))},1e9);
      out.txt=[];const walker=document.createTreeWalker(document.querySelector('.gx-app'),NodeFilter.SHOW_TEXT);let n;while(n=walker.nextNode()){const el=n.parentElement;if(!n.textContent.trim()||el.closest('svg')||el.closest('[hidden]')||el.closest('#c3'))continue;const s=getComputedStyle(el);if(s.display==='none'||s.visibility==='hidden')continue;const r=el.getBoundingClientRect();if(!r.width||!r.height)continue;if(parseFloat(s.fontSize)<12.9)out.txt.push(n.textContent.trim().slice(0,16)+':'+s.fontSize)}
      out.mode=PHN.mode;out.dbg=document.querySelectorAll('#ph-pop .ph-g').length+' chips, src '+(UI.sel?UI.sel.src:PHN.src)+', tg '+!!document.querySelector('#ph-pop .ph-tg');return out});
    if(!(r.scroll.h<=r.scroll.vh+1&&r.scroll.w<=r.scroll.vw+1))prob(tag,'SCROLL '+JSON.stringify(r.scroll));
    if(!r.inside)prob(tag,'canvas outside the viewport '+r.cv);if(r.cv[2]<FIT.share(w,h)*short-1||r.cv[3]<FIT.share(w,h)*short-1)prob(tag,'canvas '+r.cv.map(Math.round)+' < 0.85 short');
    if(r.ring!=null){stats.ringMax=Math.max(stats.ringMax,r.ring);if(r.ring<FIT.share(w,h)*short-1)prob(tag,'ring '+Math.round(r.ring)+' < 0.85 x '+short)}
    if(r.hit&&r.hit.length)prob(tag,'board targets not hit-testing to the canvas: '+r.hit.slice(0,5).join(','));
    if(r.overlap.length)prob(tag,'overlaps the board: '+r.overlap);if(r.small.length)prob(tag,'tap targets < 44: '+r.small.slice(0,6).join(' | ')+' ['+r.dbg+']');
    if(r.txt.length)prob(tag,'text < 13px: '+r.txt.slice(0,5).join(' | '));if(r.zs)stats.zoneScroll++;if(r.minTap<stats.mins){stats.mins=r.minTap;stats.minName=tag}return r};
  const FIT=require('../../phfit.js');const shot=async n=>{(await FIT.run(p)).forEach(m=>prob('FIT '+n,m));return p.screenshot({path:`shots/${t}_${n}.png`})};
  // ---- start screen, story ----
  await shot('0start');
  await p.evaluate(c=>{UI.setup.np=c.np||3;Object.assign(UI.setup.ex,c.ex||{});for(let i=1;i<4;i++)UI.setup.seats[i]='ai';if(c.hot)for(let i=0;i<UI.setup.np;i++)UI.setup.seats[i]='human'},CFG);
  await p.touchscreen.tap(...await ctr(p,'[data-ui=start]'));await p.waitForTimeout(600);await shot('1story');await p.touchscreen.tap(...await ctr(p,'[data-ui=story-ok]'));
  await p.waitForFunction(()=>!!me(),null,{timeout:60000});await p.waitForTimeout(1200);
  // ---- coach card -> strip ----
  let m=(await audit('coach')).mode;if(m!=='coach')prob('coach','expected the coach card, got '+m);await shot('2coach');
  await p.touchscreen.tap(...await ctr(p,'#ph-card .ph-go'));await p.waitForTimeout(500);m=(await audit('strip')).mode;if(m!=='strip')prob('strip','expected the strip, got '+m);await shot('3strip');
  // ---- board pop-ups: mine (strip tap), rival chip, close by x / Esc / outside ----
  await p.touchscreen.tap(...await ctr(p,'.ph-mine'));await p.waitForTimeout(400);m=(await audit('board-me')).mode;if(m!=='board')prob('board','own board pop-up did not open');await shot('4board');
  await p.touchscreen.tap(...await ctr(p,'#ph-pop .ph-ib[data-ph=close]'));await p.waitForTimeout(300);if((await p.evaluate(()=>PHN.mode))!=='strip')prob('board','x did not close');
  await p.touchscreen.tap(...await ctr(p,'.ph-rv'));await p.waitForTimeout(400);if((await p.evaluate(()=>PHN.board))==null)prob('board','rival chip did not open a board');await audit('board-rival');await p.keyboard.press('Escape');await p.waitForTimeout(300);if((await p.evaluate(()=>PHN.mode))!=='strip')prob('board','Esc did not close');
  // tap the bar Players button -> board pop-up
  await p.touchscreen.tap(...await ctr(p,'.gx-bar [data-gx=plrd]'));await p.waitForTimeout(300);if((await p.evaluate(()=>PHN.mode))!=='board')prob('board','Players button did not open the board pop-up');await p.touchscreen.tap(...await ctr(p,'#ph-pop .ph-ib[data-ph=close]'));await p.waitForTimeout(200);
  // menu card
  await p.touchscreen.tap(...await ctr(p,'#ph-more'));await p.waitForTimeout(300);m=(await audit('more')).mode;if(m!=='more')prob('more','menu did not open');await shot('5more');await p.touchscreen.tap(...await ctr(p,'#ph-card .ph-ib[data-ph=close]'));await p.waitForTimeout(300);
  // drawers from the bar fit the screen
  for(const id of ['logd','rulesd']){await p.touchscreen.tap(...await ctr(p,`.gx-bar [data-gx=${id}]`));await p.waitForFunction(i=>{const r=document.getElementById(i).getBoundingClientRect();return r.top>=-1&&r.right<=innerWidth+1},id,{timeout:8000}).catch(()=>{});const o=await p.evaluate(i=>{const d=document.getElementById(i);const r=d.getBoundingClientRect();return {on:d.classList.contains('on'),l:r.left,t:r.top,r:r.right,b:r.bottom,sh:document.documentElement.scrollHeight,sw:document.documentElement.scrollWidth}},id);
    if(!o.on)prob('drawer',id+' did not open');if(o.l<-1||o.t<-1||o.r>w+1||o.b>h+1)prob('drawer',id+' outside screen '+JSON.stringify(o));if(o.sh>h+1||o.sw>w+1)prob('drawer',id+' page scroll');if(id==='logd')await shot('6log');
    await p.keyboard.press('Escape');await p.waitForTimeout(400);if(await p.evaluate(i=>document.getElementById(i).classList.contains('on'),id))prob('drawer',id+' Esc did not close')}
  // ---- play by touch only ----
  const tapTile=async()=>{await p.waitForFunction(()=>V3idle(),null,{timeout:20000}).catch(()=>{});
    const pt=await p.evaluate(()=>{const H=UI.hl.src||[];const s0=H.find(x=>x.src>=0)||H[0];if(!s0)return null;const a=s0.src<0?G.ctr:G.fac[s0.src];const k=a.findIndex(t=>t!==PRISM);const sl=s0.src<0?'c_'+Math.max(0,k):'f'+s0.src+'_'+Math.max(0,k);const v=slotScreen(sl);const R=V3.r.domElement.getBoundingClientRect();return {x:R.left+v.x,y:R.top+v.y,sl}});
    if(!pt)return null;await p.touchscreen.tap(pt.x,pt.y);return pt};
  const tapKiln=async()=>{await p.waitForFunction(()=>V3idle(),null,{timeout:20000}).catch(()=>{});
    const pt=await p.evaluate(()=>{const R=V3.r.domElement.getBoundingClientRect();const pr=(x,y,z)=>{const v=new THREE.Vector3(x,y,z).project(V3.cam);return {x:R.left+(v.x+1)/2*R.width,y:R.top+(1-v.y)/2*R.height}};
      const i=G.fac.findIndex(a=>new Set(a.filter(t=>t<5)).size>=2);if(i<0)return null;const K=V3.L.kilns[i];const q=pr(K.x,.16,K.z+1.25);return {x:q.x,y:q.y,i}});if(!pt)return null;await p.touchscreen.tap(pt.x,pt.y);return pt};
  let turns=0,shotTake=false,shotWall=false,shotSum=false,kilnDone=false,wallq=0,sums=0,adv=false,touched=0;
  for(let k=0;k<900&&turns<(CFG.turns||7);k++){const s=await p.evaluate(()=>({hp:!!me(),phase:G.phase,over:!!G.over,mode:PHN.mode,sel:!!UI.sel,tgt:UI.tgt}));
    if(s.over)break;
    if(s.mode==='sum'){const r=await audit('sum');if(!shotSum){shotSum=true;await shot('9sum')}sums++;await p.touchscreen.tap(...await ctr(p,'#ph-card [data-ph=continue]'));await p.waitForTimeout(400);continue}
    if(s.mode==='coach'){await p.touchscreen.tap(...await ctr(p,'#ph-card [data-ph=continue]'));await p.waitForTimeout(300);continue}
    if(!s.hp){await p.waitForTimeout(250);continue}
    if(s.mode==='wallq'){const r=await audit('wallq');wallq++;if(!shotWall){shotWall=true;await shot('8wallq')}
      const cells=await p.evaluate(()=>[...document.querySelectorAll('#ph-card [data-cell]')].map(e=>{const r=e.getBoundingClientRect();return [Math.round(r.width),Math.round(r.height)]}));if(!cells.length)prob('wallq','no tappable cells');else if(cells.some(c=>Math.min(c[0],c[1])<43.5))prob('wallq','cell < 44 '+JSON.stringify(cells));
      if(!adv){adv=true;await p.touchscreen.tap(...await ctr(p,'#ph-card [data-ui=advise]'));await p.waitForTimeout(400);await audit('wallq-advice')}
      await p.touchscreen.tap(...await ctr(p,'#ph-card [data-cell]'));await p.waitForTimeout(500);continue}
    if(s.phase!=='offer'){await p.waitForTimeout(250);continue}
    if(s.mode==='strip'){touched++;let pt;if(!kilnDone&&turns>=1){pt=await tapKiln();if(pt){kilnDone=true;await p.waitForTimeout(500);const md=(await audit('kiln-chooser')).mode;if(md!=='take')prob('kiln','kiln tap did not open the pop-up ('+md+')');const ch=await p.evaluate(()=>!!document.querySelector('#ph-pop .ph-chips')&&!UI.sel);if(!ch)prob('kiln','expected the glaze chooser (no selection)');await shot('7chooser');
          await p.touchscreen.tap(...await ctr(p,'#ph-pop .ph-g'));await p.waitForTimeout(500);if(!(await p.evaluate(()=>!!UI.sel)))prob('kiln','chip did not select a glaze');continue}}
      pt=await tapTile();if(!pt){await p.waitForTimeout(300);continue}await p.waitForTimeout(500);continue}
    if(s.mode==='take'){const r=await audit('take');
      // the pop-up never covers the tile it is about
      const ov=await p.evaluate(()=>{if(!UI.sel)return null;const s=UI.sel;const a=s.src<0?G.ctr:G.fac[s.src];const R=V3.r.domElement.getBoundingClientRect();const pop=document.getElementById('ph-pop').getBoundingClientRect();let n=0;a.forEach((t,k)=>{const v=slotScreen(s.src<0?'c_'+k:'f'+s.src+'_'+k);if(!v)return;const x=R.left+v.x,y=R.top+v.y;if(x>pop.left&&x<pop.right&&y>pop.top&&y<pop.bottom)n++});return n});
      if(ov)prob('take','pop-up covers '+ov+' tile(s) of the source');
      if(!shotTake){shotTake=true;await p.waitForTimeout(900);await shot('7take')}
      if(!s.sel){await p.touchscreen.tap(...await ctr(p,'#ph-pop .ph-g'));await p.waitForTimeout(400);continue}
      // outside tap on empty table closes the pop-up (once), then reopen
      if(turns===2&&!CFG.noclose&&!(await p.evaluate(()=>!!window.__closed))){await p.evaluate(()=>{window.__closed=1});const q=await p.evaluate(()=>{const R=V3.r.domElement.getBoundingClientRect();return {x:R.left+4,y:R.top+R.height-4}});await p.touchscreen.tap(q.x,q.y);await p.waitForTimeout(400);if((await p.evaluate(()=>PHN.mode))==='take')prob('take','tap outside did not close');continue}
      const sel=await p.evaluate(()=>{const e=document.querySelector('#ph-pop .ph-o.rec')||document.querySelector('#ph-pop .ph-o[data-mv]');if(!e)return null;e.scrollIntoView({block:'nearest'});const r=e.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2,tx:e.textContent.slice(0,40)}});
      if(!sel){prob('take','no rack button');break}
      const hitok=await p.evaluate(q=>{const e=document.elementFromPoint(q.x,q.y);return !!(e&&e.closest('#ph-pop .ph-o'))},sel);if(!hitok)prob('take','rack button not hit-testable at '+sel.x+','+sel.y);
      await p.touchscreen.tap(sel.x,sel.y);turns++;await p.waitForTimeout(500);continue}
    await p.waitForTimeout(200)}
  // make sure the wall choice card and the round card are exercised in every run (the engine plays the offer, touch plays the cards)
  if(!wallq||!sums){await p.evaluate(()=>{PHN.sum=null;let n=0;while(G&&!G.over&&n++<500&&!(G.phase==='wall'&&me())){const s=sideToAct();if(s<0)break;const m=aiMove(s);if(!m||!performMove(m,s).success)break}});await p.waitForTimeout(800);
    for(let k=0;k<30;k++){const md=await p.evaluate(()=>PHN.mode);if(md==='wallq'){await audit('wallq*');wallq++;if(!shotWall){shotWall=true;await shot('8wallq')}
        const cells=await p.evaluate(()=>[...document.querySelectorAll('#ph-card [data-cell]')].map(e=>{const r=e.getBoundingClientRect();return Math.min(r.width,r.height)}));if(!cells.length||cells.some(c=>c<43.5))prob('wallq*','cells '+JSON.stringify(cells));
        await p.touchscreen.tap(...await ctr(p,'#ph-card [data-cell]'));await p.waitForTimeout(500);continue}
      if(md==='sum'){await audit('sum*');if(!shotSum){shotSum=true;await shot('9sum')}sums++;await p.touchscreen.tap(...await ctr(p,'#ph-card [data-ph=continue]'));await p.waitForTimeout(400);break}
      if(md==='coach'){await p.touchscreen.tap(...await ctr(p,'#ph-card [data-ph=continue]'));continue}
      await p.waitForTimeout(300)}}
  // ---- end of game: finish with the engine, then the cards ----
  await p.evaluate(()=>{let n=0;while(G&&!G.over&&n++<2000){const s=sideToAct();if(s<0)break;const m=aiMove(s);if(!m)break;if(!performMove(m,s).success)break}});await p.waitForTimeout(800);
  let guard=0;while(guard++<4){const md=await p.evaluate(()=>PHN.mode);if(md==='sum'){await audit('final-sum');await shot('A_finalsum');await p.touchscreen.tap(...await ctr(p,'#ph-card [data-ph=continue]'));await p.waitForTimeout(500)}else break}
  const md=(await audit('end')).mode;if(md!=='end')prob('end','expected the end card, got '+md);await shot('B_end');
  await p.touchscreen.tap(...await ctr(p,'#ph-card [data-ph=continue]'));await p.waitForTimeout(500);if((await audit('end-strip')).mode!=='strip')prob('end','Continue did not return to the strip');await shot('C_over');
  await p.touchscreen.tap(...await ctr(p,'#ph-st [data-ph=result]'));await p.waitForTimeout(400);if((await p.evaluate(()=>PHN.mode))!=='end')prob('end','Result button did not reopen the end card');
  if(errs.length)prob('errors',errs.slice(0,3).join(' | '));
  const line=`${t} turns ${turns} wallChoices ${wallq} sumCards ${sums} minTap ${Math.round(stats.mins)}px(${stats.minName}) ring ${Math.round(stats.ringMax)}px/${short} zoneScrolls ${stats.zoneScroll} errors ${errs.length}`;console.log(line);sum.push(line);await c.close()}
console.log('PROBLEMS',bad);await b.close()})();
async function ctr(p,sel){const r=await p.evaluate(s=>{const e=document.querySelector(s);if(!e)return null;if(!e.closest('.gx-bar'))e.scrollIntoView({block:'nearest'});const r=e.getBoundingClientRect();const x=r.left+r.width/2,y=r.top+r.height/2;const h=document.elementFromPoint(x,y);return {x,y,ok:!!(h&&(h===e||e.contains(h)||h.contains(e)))}},sel);
  if(!r)throw new Error('no element '+sel);if(!r.ok)console.log('  (not hit-testable at centre: '+sel+')');return [r.x,r.y]}
