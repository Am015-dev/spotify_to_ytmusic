require('../../phfit.js').guard(2);
// Phone layout + touch-only play check. node lay-phone.js [WxH,...]   prints "FAIL <size> <check>" lines, then PROBLEMS n
const PW=require(process.env.PW||(require('child_process').execSync('npm root -g').toString().trim()+'/playwright'));
const fs=require('fs'),path=require('path');const HERE=__dirname,OUT=path.join(HERE,'shots','ph');fs.mkdirSync(OUT,{recursive:true});
const html=fs.readFileSync(path.join(HERE,'hollowbough.html'));
const SIZES=(process.argv[2]&&!process.argv[2].startsWith('--')?process.argv[2]:'390x844,844x390,360x740,740x360').split(',').map(s=>s.split('x').map(Number));
const TURNS=+((process.argv.find(a=>a.startsWith('--turns='))||'').slice(8))||14;
(async()=>{const b=await PW.chromium.launch();let bad=0;
for(const [W,H] of SIZES){const t=W+'x'+H;const ctx=await b.newContext({viewport:{width:W,height:H},deviceScaleFactor:1,isMobile:true,hasTouch:true});
  await ctx.route('**/*',r=>new URL(r.request().url()).host==='gns.test'?r.fulfill({status:200,contentType:'text/html',body:html}):r.abort());
  const p=await ctx.newPage();p.setDefaultTimeout(30000);const errs=[];p.on('pageerror',e=>errs.push('pageerror '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/net::|Failed to load/.test(m.text()))errs.push(m.text())});
  const fail=(c,d)=>{bad++;console.log('FAIL',t,c,d||'')};const log=(...a)=>console.log(t,...a);
  const FIT=require('../../phfit.js');const shot=async n=>{(await FIT.run(p)).forEach(m=>fail('FIT '+n+': '+m));await p.screenshot({path:path.join(OUT,`${t}_${n}.png`)})};
  const scroll=async tag=>{const r=await p.evaluate(()=>({h:document.documentElement.scrollHeight,w:document.documentElement.scrollWidth,vh:innerHeight,vw:innerWidth,b:document.body.scrollHeight}));if(r.h>r.vh+1||r.w>r.vw+1)fail('scroll '+tag,JSON.stringify(r))};
  const ov=(A,B)=>A[0]<B[2]-.5&&A[2]>B[0]+.5&&A[1]<B[3]-.5&&A[3]>B[1]+.5;
  const rect=sel=>p.evaluate(s=>{const e=document.querySelector(s);if(!e)return null;const r=e.getBoundingClientRect();return [r.left,r.top,r.right,r.bottom]},sel);
  const targets=async tag=>{const r=await p.evaluate(()=>{const o=[];const vis=e=>{const r=e.getBoundingClientRect();if(!r.width||!r.height)return null;const cs=getComputedStyle(e);if(cs.visibility==='hidden'||cs.display==='none')return null;return r};
    for(const e of document.querySelectorAll('.gx-bar button,#dock button,.tile,.mc:not(.empty),#ppop button,#pc button,.gx-drawer.on button')){if(e.closest('#ppop')&&document.querySelector('#ppop').hidden)continue;if(e.closest('#pc')&&document.querySelector('#pc').hidden)continue;if(e.closest('.gx-drawer')&&!e.closest('.gx-drawer.on'))continue;const r=vis(e);if(!r)continue;
      // clipped by a scroll container? only the visible part counts for hit area but the element size is what we check
      if(r.width<43.9||r.height<43.9)o.push((e.dataset.a||e.className)+' '+Math.round(r.width*10)/10+'x'+Math.round(r.height*10)/10)}
    const txt=[];const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;while(n=w.nextNode()){const s=n.textContent.trim();if(!s)continue;const e=n.parentElement;if(!e||e.closest('svg,script,style,#start[hidden],[hidden],.sr,#toast'))continue;const r=e.getBoundingClientRect();if(!r.width||!r.height)continue;const cs=getComputedStyle(e);if(cs.visibility==='hidden'||cs.display==='none')continue;if(r.right<0||r.bottom<0||r.left>innerWidth||r.top>innerHeight)continue;
      if(parseFloat(cs.fontSize)<12.95)txt.push(s.slice(0,18)+':'+cs.fontSize)}
    return {small:o.slice(0,6),txt:txt.slice(0,6)}});
    if(r.small.length)fail('tap target <44 '+tag,JSON.stringify(r.small));if(r.txt.length)fail('text <13px '+tag,JSON.stringify(r.txt))};
  const boardCheck=async tag=>{const r=await p.evaluate(()=>{const B=document.querySelector('#board').getBoundingClientRect();const bad=[];let n=0;for(const e of document.querySelectorAll('.tile,.mc:not(.empty)')){n++;const r=e.getBoundingClientRect();if(r.left<B.left-.5||r.right>B.right+.5||r.top<B.top-.5||r.bottom>B.bottom+.5)bad.push('out '+(e.dataset.k||'mc')+e.dataset.i);const x=r.left+r.width/2,y=r.top+r.height/2;const hit=document.elementFromPoint(x,y);if(!hit||!e.contains(hit))bad.push('covered '+(e.dataset.k||'mc')+e.dataset.i+' by '+(hit&&(hit.id||hit.className)))}
      return {n,bad:bad.slice(0,5)}});if(r.bad.length)fail('board '+tag,JSON.stringify(r));return r};
  const cards=async()=>{for(let k=0;k<12;k++){const b=await p.$('#pc:not([hidden]) [data-a=cont],#pc:not([hidden]) [data-a=take]');if(!b)break;try{await b.tap({timeout:3000})}catch(e){}await p.waitForTimeout(150)}};
  const waitHuman=async()=>{for(let k=0;k<160;k++){const s=await p.evaluate(()=>G.phase==='over'||(!G.players[HB.actor(G)].ai&&!UI.tm));if(s)return;await p.waitForTimeout(150)}};
  await p.goto('https://gns.test/');await p.waitForTimeout(700);await scroll('start');await shot('0start');await targets('start');
  await p.evaluate(()=>{try{localStorage.clear()}catch(e){}UI.seed=5;AIDELAY=40;UI.opt={np:3,level:'normal',solo:1}});
  await p.tap('[data-start=vs]');await p.waitForTimeout(900);await waitHuman();await cards();await waitHuman();
  await scroll('game');
  const m=await p.evaluate(()=>{const b=document.querySelector('#bd').getBoundingClientRect();return {w:b.width,h:b.height,short:Math.min(innerWidth,innerHeight),ph:document.documentElement.className,vw:innerWidth,vh:innerHeight}});
  log('board',JSON.stringify(m));
  const port=m.vw<m.vh;const side=port?m.w:m.h;if(side<FIT.share(W,H)*m.short)fail('board share',side+' < '+FIT.share(W,H)*m.short);if(!port&&m.w<FIT.share(W,H)*m.short)fail('board width landscape',m.w);
  if(!/ph/.test(m.ph))fail('phone class missing',m.ph);
  await boardCheck('turn');await targets('turn');await shot('1turn');
  // tap a legal location
  const tile=await p.$('.tile.ok');if(!tile)fail('no legal tile');else{
    const tr=await tile.evaluate(e=>{const r=e.getBoundingClientRect();return [r.left,r.top,r.right,r.bottom]});await p.tap('.tile.ok');await p.waitForTimeout(300);
    const pr=await rect('#ppop');const dr=await rect('#dock');const br=await rect('#board');const open=await p.evaluate(()=>!document.querySelector('#ppop').hidden);
    if(!open)fail('location popup did not open');else{if(ov(pr,tr))fail('popup over its tile');if(ov(pr,br))fail('popup over the board');if(pr[0]<dr[0]-1||pr[2]>dr[2]+1||pr[3]>dr[3]+1)fail('popup outside dock',JSON.stringify([pr,dr]));
      await shot('2locpop');await targets('locpop');
      await p.tap('#ppop [data-a=popx]');await p.waitForTimeout(150);if(!(await p.evaluate(()=>document.querySelector('#ppop').hidden)))fail('x did not close');
      await p.tap('.tile.ok');await p.waitForTimeout(250);await p.keyboard.press('Escape');await p.waitForTimeout(150);if(!(await p.evaluate(()=>document.querySelector('#ppop').hidden)))fail('Esc did not close');
      await p.tap('.tile.ok');await p.waitForTimeout(250);{const r=await rect('.gx-bar');const pt=await p.evaluate(()=>{const b=document.querySelector('.gx-bar'),br=b.getBoundingClientRect();for(const s of ['.gx-bar h1','#barstat']){const e=document.querySelector(s),q=e&&e.getBoundingClientRect();if(q&&q.width>8&&q.left>=br.left)return [q.left+q.width/2,q.top+q.height/2]}return [br.left+3,(br.top+br.bottom)/2]});await p.touchscreen.tap(pt[0],pt[1])}await p.waitForTimeout(200);
      if(!(await p.evaluate(()=>document.querySelector('#ppop').hidden)))fail('outside tap did not close');
      await p.tap('.tile.ok');await p.waitForTimeout(250);const n0=await p.evaluate(()=>G.logN);await p.tap('#ppop [data-a=do]');await p.waitForTimeout(500);await waitHuman();
      if(await p.evaluate(()=>G.logN)===n0)fail('placing a worker did nothing')}}
  await cards();await waitHuman();
  // meadow card popup
  const mc=await p.$('.mc:not(.empty)');if(mc){const cr=await mc.evaluate(e=>{const r=e.getBoundingClientRect();return [r.left,r.top,r.right,r.bottom]});await mc.tap();await p.waitForTimeout(300);const pr=await rect('#ppop');if(ov(pr,cr))fail('meadow popup over its card');
    if(!(await p.evaluate(()=>document.querySelector('#ppop [data-a=do],#ppop .why')!==null)))fail('meadow popup has neither Play nor a reason');await shot('3meadowpop');await targets('meadowpop');await p.tap('#ppop [data-a=popx]')}
  // hand card popup
  const hc=await p.$('#handRow .sc');if(!hc)fail('no hand card');else{const cr=await hc.evaluate(e=>{const r=e.getBoundingClientRect();return [r.left,r.top,r.right,r.bottom]});await hc.tap();await p.waitForTimeout(300);const pr=await rect('#ppop');if(ov(pr,cr))fail('hand popup over its card',JSON.stringify([pr,cr]));const br=await rect('#board');if(ov(pr,br))fail('hand popup over board');await shot('4handpop');await targets('handpop');await p.tap('#ppop [data-a=popx]')}
  // rival chip -> drawer
  await p.tap('#chips .chip:nth-child(2)');await p.waitForTimeout(500);await scroll('drawer');await shot('5rival');await targets('rival drawer');await p.keyboard.press('Escape');await p.waitForTimeout(300);
  // hint
  await waitHuman();const hb=await p.$('#acts [data-a=hint]:not([disabled])');if(hb){await hb.tap();await p.waitForTimeout(700);await shot('6hint');await targets('hint');if(!(await p.evaluate(()=>!!document.querySelector('#ppop [data-a=do]'))))fail('hint has no Do it button');await p.tap('#ppop [data-a=popx]')}
  // play a card by touch (resources granted through the test hook so a card is affordable)
  await waitHuman();await cards();await p.evaluate(()=>{const r=G.players[0].res;r.twig=r.resin=r.pebble=r.berry=6;UI.noRec=true;render()});await p.waitForTimeout(200);
  {const c=await p.$('#handRow .sc.ok');if(!c)fail('no playable hand card with 6 of each resource');else{const n0=await p.evaluate(()=>G.players[0].city.length);await c.tap();await p.waitForTimeout(250);await shot('6play');await targets('playpop');const d=await p.$('#ppop [data-a=do]');if(!d)fail('no Play button');else{await d.tap();await p.waitForTimeout(400);await waitHuman();await cards();
    for(let k=0;k<4&&await p.evaluate(()=>!!(G.q&&!G.players[G.q.who].ai));k++){const o=await p.$('#pc .qo');if(o)await o.tap();await p.waitForTimeout(250);await waitHuman()}
    const n1=await p.evaluate(()=>G.players[0].city.length);if(n1<=n0)fail('playing a card did not add it to the city');else{const sc=await p.$('#cityRow .sc');if(!sc)fail('city strip empty after play');}}}}
  await p.evaluate(()=>{UI.noRec=false});
  // a full human turn sequence by touch only
  let stuck=0,prog=0,played=0,prepd=0,qs=0;
  for(let k=0;k<TURNS*3&&prog<TURNS;k++){await waitHuman();await cards();await waitHuman();const st=await p.evaluate(()=>({over:G.phase==='over',q:!!G.q&&!G.players[G.q.who].ai,n:G.logN}));if(st.over)break;
    const before=st.n;
    if(st.q){if(qs++===0){await shot('7decision');await targets('decision')}const o=await p.$('#pc .qo');if(o)await o.tap();await p.waitForTimeout(250);}
    else{
      const prep=await p.$('#acts [data-a=prep]:not([disabled])');const wk=await p.evaluate(()=>availW(G.players[0]));
      if(prep&&wk===0){await prep.tap();await p.waitForTimeout(250);if(!prepd++)await shot('8prepare');await p.tap('#ppop [data-a=do]')}
      else if(k%3===1&&await p.$('#handRow .sc.ok')){const c=await p.$('#handRow .sc.ok');await c.tap();await p.waitForTimeout(200);const d=await p.$('#ppop [data-a=do]');if(d){played++;await d.tap()}else await p.tap('#ppop [data-a=popx]')}
      else if(await p.$('.tile.ok')){const tl=await p.$('.tile.ok');await tl.tap();await p.waitForTimeout(200);const d=await p.$('#ppop [data-a=do]');if(d)await d.tap();else await p.tap('#ppop [data-a=popx]')}
      else if(await p.$('#handRow .sc.ok')){const c=await p.$('#handRow .sc.ok');await c.tap();await p.waitForTimeout(200);const d=await p.$('#ppop [data-a=do]');if(d){played++;await d.tap()}else await p.tap('#ppop [data-a=popx]')}
      else if(await p.$('.mc.ok')){const c=await p.$('.mc.ok');await c.tap();await p.waitForTimeout(200);const d=await p.$('#ppop [data-a=do]');if(d){played++;await d.tap()}else await p.tap('#ppop [data-a=popx]')}
      else if(prep){await prep.tap();await p.waitForTimeout(250);await p.tap('#ppop [data-a=do]')}
      else{await p.tap('#acts [data-a=pass]');await p.waitForTimeout(200);await p.tap('#ppop [data-a=do]')}
      await p.waitForTimeout(250)}
    const after=await p.evaluate(()=>G.logN);if(after>before)prog++;else if(++stuck>12){fail('stuck: no progress by touch');break}
    if(k===6){await scroll('midgame');await boardCheck('midgame');await targets('midgame');await shot('9mid')}}
  log('human moves by touch',prog,'cards played',played,'seasons prepared',prepd,'decisions',qs);if(prog<Math.min(TURNS,6))fail('too few moves by touch',prog);
  await waitHuman();await cards();await scroll('later');await boardCheck('later');await targets('later');await shot('10later');
  // hot-seat pass card
  await p.evaluate(()=>{showStart()});await p.waitForTimeout(300);await scroll('start2');
  await p.tap('[data-a=opt][data-k=np][data-v="3"]');await p.tap('[data-start=hot]');await p.waitForTimeout(600);
  const pass=await p.evaluate(()=>({card:!document.querySelector('#pc').hidden&&!!document.querySelector('#pc [data-a=take]'),hand:document.querySelectorAll('#handRow [data-up="1"]').length}));
  if(!pass.card)fail('no pass-the-device card in hot-seat');if(pass.hand)fail('hand visible before the pass card is taken');await shot('11pass');await scroll('pass');
  await p.tap('#pc [data-a=take]');await p.waitForTimeout(400);const hh=await p.evaluate(()=>({n:document.querySelectorAll('#handRow [data-up="1"]').length,own:[...new Set([...document.querySelectorAll('#handRow [data-owner]')].map(e=>e.dataset.owner))].join(',')}));if(!hh.n)fail('hand not shown after take');await boardCheck('hot');
  // watch game to the end: end-of-game cards
  await p.evaluate(()=>{showStart()});await p.waitForTimeout(200);await p.tap('[data-start=ai]');await p.waitForTimeout(300);
  await p.evaluate(()=>{ANIM=0;AIDELAY=0});for(let k=0;k<200;k++){if(await p.evaluate(()=>G.phase==='over'))break;await p.waitForTimeout(400)}
  await p.waitForTimeout(500);const ovc=await p.evaluate(()=>({over:G.phase==='over',card:!!document.querySelector('#pc [data-a=cont],#pc [data-a=again]'),kind:document.querySelector('#pc').dataset.card}));log('end',JSON.stringify(ovc));
  if(!ovc.over)fail('watch game did not finish');else{if(!ovc.card)fail('no end-of-game card');await shot('12over');await scroll('over');await targets('over');for(let k=0;k<8;k++){const c=await p.$('#pc:not([hidden]) [data-a=cont]');if(!c)break;await c.tap();await p.waitForTimeout(150)}await boardCheck('over dismissed')}
  log('errors',JSON.stringify(errs.slice(0,3)));bad+=errs.length;if(errs.length)console.log('FAIL',t,'console errors',errs.length);await ctx.close()}
console.log('PROBLEMS',bad);await b.close()})().catch(e=>{console.error('FATAL',e);process.exit(1)});
