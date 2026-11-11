// board-first phone table, layout + touch test (real Chromium): node lay-bf.js ['{"np":4,"ex":{"gray":true}}'] [sizes] [file]
// per size: no page scroll; the table, kilns, courtyard, hint line and your board all on screen and not overlapping; buttons >= 44 px
// (chips >= 36), kiln quadrants >= 22 px, text >= 12 px; a full animated turn by touch (tile -> glowing rack), the mirror matches the
// game afterwards; then the rest of the game by touch taps only (wall spaces on the unmarked mosaic too); the result card fits; 0 errors
const {chromium}=require(process.env.PW||'/opt/node22/lib/node_modules/playwright');const CFG=JSON.parse(process.argv[2]||'{}');
const SIZES=(process.argv[3]||'390x844,390x763,390x664,375x553,412x780,844x390,750x342').split(',').map(s=>s.split('x').map(Number));const FILE=process.argv[4]||__dirname+'/sunglaze.html';
(async()=>{const b=await chromium.launch({executablePath:process.env.CHROME||undefined});let bad=0;
for(const [w,h] of SIZES){const t=`${CFG.np||2}p${CFG.ex&&CFG.ex.gray?'g':''}_${w}x${h}`;const c=await b.newContext({viewport:{width:w,height:h},isMobile:true,hasTouch:true,deviceScaleFactor:1});const p=await c.newPage();p.setDefaultTimeout(60000);
  const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>m.type()==='error'&&!/CERT|fonts|ERR_|404/.test(m.text())&&errs.push(m.text()));
  const prob=(tag,msg)=>{bad++;console.log(t,tag,'PROBLEM',msg)};
  await p.goto('file://'+FILE);await p.waitForTimeout(800);
  await p.evaluate(o=>{try{localStorage.clear()}catch(e){}setSeed(21);UI.setup.np=o.np||2;Object.assign(UI.setup.ex,o.ex||{});UI.speed=3},CFG);
  if(!await p.evaluate(()=>BF.on))prob('start','board-first table is off');
  await p.locator('[data-ui=start]').tap();await p.waitForTimeout(300);await p.locator('[data-ui=story-ok]').tap();
  const idle=async()=>{await p.waitForFunction(()=>!BF.busy&&!BF.q.length,null,{timeout:60000})};await idle();
  const audit=async tag=>{const r=await p.evaluate(()=>{const vw=innerWidth,vh=innerHeight,o={issues:[]};const R=e=>{const r=e.getBoundingClientRect();return {l:r.left,t:r.top,r:r.right,b:r.bottom,w:r.width,h:r.height}};
      const D=document.documentElement;if(D.scrollHeight>vh+1||D.scrollWidth>vw+1)o.issues.push(`page scrolls ${D.scrollWidth}x${D.scrollHeight}`);
      const inV=(e,n)=>{const r=R(e);if(r.w<1)return;if(r.l<-1||r.t<-1||r.r>vw+1||r.b>vh+1)o.issues.push(n+' off screen '+JSON.stringify(r))};
      const tb=R(document.querySelector('#bf .bf-table'));const ks=[...document.querySelectorAll('#bf .bf-k')].map(R);const pool=R(document.querySelector('#bf .bf-pool'));
      for(const [n,e] of [['top','.bf-top'],['hint','.bf-hint'],['board','.bf-me'],['table','.bf-table']])inV(document.querySelector('#bf '+n.replace(/.*/,e)),n);
      ks.forEach((k,i)=>{if(k.l<tb.l-2||k.t<tb.t-2||k.r>tb.r+2||k.b>tb.b+2)o.issues.push('kiln '+i+' outside the table');if(k.w/2<22)o.issues.push('kiln quadrant '+(k.w/2|0)+'px')});
      const ov=(a,b2)=>Math.max(0,Math.min(a.r,b2.r)-Math.max(a.l,b2.l))*Math.max(0,Math.min(a.b,b2.b)-Math.max(a.t,b2.t));
      for(let i=0;i<ks.length;i++)for(let j=i+1;j<ks.length;j++)if(ov(ks[i],ks[j])>.12*ks[i].w*ks[i].h)o.issues.push(`kilns ${i}/${j} overlap`);
      const me=R(document.querySelector('#bf .bf-me'));if(ov(me,tb)>4)o.issues.push('board overlaps the table');
      for(const e of document.querySelectorAll('#bf .bf-ib,#bf .bf-go,#bf .bf-mi')){const r=R(e);if(r.w&&Math.min(r.w,r.h)<(e.classList.contains('bf-bulb')?40:44))o.issues.push('small button '+(e.getAttribute('aria-label')||e.textContent).trim().slice(0,20)+' '+(r.w|0)+'x'+(r.h|0))}
      for(const e of document.querySelectorAll('#bf .bf-chip')){const r=R(e);if(r.h<36)o.issues.push('small chip')}
      for(const e of document.querySelectorAll('#bf .bf-say,#bf .bf-chip,#bf .bf-fll,#bf .bf-floor .bf-c span,#bf .bf-card')){const f=parseFloat(getComputedStyle(e).fontSize);if(e.getBoundingClientRect().width&&f<12)o.issues.push('small text '+f+'px '+e.className)}
      const say=document.querySelector('#bf .bf-say');if(say&&say.scrollWidth>say.clientWidth+2)o.issues.push('hint line clipped: '+say.textContent);
      o.cs=BF.cs;o.kiln=ks.length?ks[0].w|0:0;o.row=R(document.querySelector('#bf .bf-row')).h|0;return o});
    for(const i of r.issues)prob(tag,i);return r};
  const a0=await audit('start');
  // one animated turn by touch
  const tapEl=async sel=>{const bx=await p.locator(sel).first().boundingBox();if(!bx)return false;await p.touchscreen.tap(bx.x+bx.width/2,bx.y+bx.height/2);return true};
  await p.waitForFunction(()=>!!me(),null,{timeout:60000});
  const n0=await p.evaluate(()=>G.logN);await tapEl('#bf .bf-table [data-k^="f"]');await p.waitForTimeout(250);
  const s1=await p.evaluate(()=>({sel:!!UI.sel,up:document.querySelectorAll('#bf .bf-t.up').length,ok:document.querySelectorAll('#bf .bf-row.ok,#bf .bf-floor.ok').length}));
  if(!s1.sel||!s1.up||!s1.ok)prob('turn','tile tap: '+JSON.stringify(s1));await audit('picked');
  await tapEl(s1.ok>1?'#bf .bf-row.ok':'#bf .bf-floor.ok');await p.waitForTimeout(100);
  const busy=await p.evaluate(()=>BF.busy);if(!busy)prob('turn','no animation after the rack tap');await idle();
  const s2=await p.evaluate(n0=>({moved:G.logN>n0,errs:BF.errs,sync:JSON.stringify(BF.disp.fac)===JSON.stringify(G.fac)&&JSON.stringify(BF.disp.pl.map(q=>q.lines))===JSON.stringify(G.pl.map(q=>q.lines))}),n0);
  if(!s2.moved||s2.errs.length||!s2.sync)prob('turn',JSON.stringify(s2));
  // the rest by touch, fast
  await p.evaluate(()=>{ANIM=0;AIDELAY=0});let taps=0,wq=0;const t0=Date.now();
  while(Date.now()-t0<180000){const st=await p.evaluate(()=>({over:!!G.over,hp:!!me()&&!BF.busy,ph:G.phase,sel:!!UI.sel}));if(st.over)break;if(!st.hp){await p.waitForTimeout(20);continue}
    if(st.ph==='wall'){wq++;if(!await tapEl('#bf [data-bfcell]'))prob('wall','no glowing wall space');}
    else if(!st.sel)await tapEl('#bf .bf-table [data-k^="f"],#bf .bf-table [data-k^="c_"]');
    else{const ok=await p.locator('#bf .bf-row.ok').count();await tapEl(ok?'#bf .bf-row.ok':'#bf .bf-floor.ok')}taps++}
  await idle();if(!await p.evaluate(()=>!!G.over))prob('end','game not over after 180 s');
  const e=await p.evaluate(()=>{const c=document.querySelector('#bf .bf-res');if(!c)return null;const r=c.getBoundingClientRect();return {fits:r.top>=0&&r.bottom<=innerHeight+1&&r.left>=0&&r.right<=innerWidth+1,errs:BF.errs}});
  if(!e)prob('end','no result card');else if(!e.fits||e.errs.length)prob('end',JSON.stringify(e));await audit('end');
  if(errs.length)prob('console',errs.slice(0,3).join(' | '));
  console.log(t,'cs',a0.cs,'kiln',a0.kiln,'row',a0.row,'taps',taps,'wall choices',wq);await c.close()}
console.log('PROBLEMS',bad);await b.close()})();
