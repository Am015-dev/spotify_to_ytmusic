const {chromium}=require('playwright');
const URL='file:///home/user/spotify_to_ytmusic/games/index.html';
const VPS=[[1440,900],[1280,720],[844,390],[390,844],[360,740]];
let problems=0;const fail=m=>{problems++;console.log('FAIL',m)};
const ok=(c,m)=>{if(!c)fail(m)};
const GAMES=[['kaiten','kaiten-kitchen/index.html'],['crown','crown-city-smash/index.html'],['nebula','nebula-aces/index.html'],['doorkick','doorkick-dungeon/index.html'],['shipwreck','shipwreck-isle/index.html'],['sands','sands-of-qamar/index.html'],['sunglaze','sunglaze/index.html'],['rampart','rampart-and-vine/index.html'],['shortfuse','short-fuse/index.html'],['tidewake','tidewake/index.html'],['hollowbough','hollowbough/index.html'],['thornbound','thornbound/index.html'],['mainhattan','mainhattan-nightrun/index.html'],['overdrive','mainhattan-overdrive/index.html']];
const BOARD=GAMES.filter(g=>!['mainhattan','overdrive'].includes(g[0]));
const TVSRC={mainhattan:'mainhattan-nightrun/index.html',overdrive:'mainhattan-overdrive/index.html'};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function mk(b,w,h,scheme,opt={}){
  const c=await b.newContext({viewport:{width:w,height:h},colorScheme:scheme,reducedMotion:opt.rm?'reduce':'no-preference',hasTouch:w<700||h<500,isMobile:false});
  if(opt.seed)await c.addInitScript(s=>{if(!sessionStorage.getItem('seeded')){const o=JSON.parse(s);for(const k in o)localStorage.setItem(k,o[k]);sessionStorage.setItem('seeded','1')}},JSON.stringify(opt.seed));
  if(opt.hour!=null)await c.addInitScript(h=>{Date.prototype.getHours=()=>h},opt.hour);
  const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.errs=errs;
  await p.goto(URL+(opt.q||''));await p.waitForTimeout(500);return[c,p]}
const rectOf=(p,sel)=>p.evaluate(s=>{const e=document.querySelector(s);if(!e)return null;const r=e.getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height,r:r.right,b:r.bottom}},sel);
async function inside(p,sel){const r=await rectOf(p,sel);if(!r)return false;return r.x>=-1&&r.y>=-1&&r.r<=p.viewportSize().width+1&&r.b<=p.viewportSize().height+1&&r.w>0&&r.h>0}
async function openBox(p,id){await p.locator(`.boxbtn[data-id="${id}"]`).scrollIntoViewIfNeeded();await p.locator(`.boxbtn[data-id="${id}"]`).click();await p.waitForTimeout(1500)}
async function backFromGame(p){if(await p.locator('#back').isVisible())await p.click('#back');else{await p.click('#fab');await p.click('#fabback')}await p.waitForTimeout(300)}
(async()=>{
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
for(const [w,h] of VPS)for(const scheme of ['light','dark']){
  const tag=`${w}x${h}-${scheme}`,ph=w<700||h<500;
  let [c,p]=await mk(b,w,h,scheme,{});
  ok(await p.title()==='Game Night Shelf',tag+' title');
  ok((await p.textContent('#tally'))==='14 games on the shelf',tag+' tally');
  ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),tag+' scrollWidth '+await p.evaluate(()=>document.documentElement.scrollWidth));
  ok(await p.locator('.boxbtn').count()===12,tag+' 12 boxes (board games only)');
  ok(await p.locator('.boxbtn[data-id="mainhattan"],.boxbtn[data-id="overdrive"]').count()===0,tag+' video games are not on the shelf');
  ok(await p.evaluate(()=>getComputedStyle(document.body).backgroundColor!=='rgba(0, 0, 0, 0)'),tag+' body bg');
  {const t0=await p.evaluate(()=>{const r=document.querySelector('.boxbtn[data-id="crown"]').getBoundingClientRect();return{top:r.top,h:innerHeight}});
   if(ph)ok(t0.top<t0.h-60,`${tag} first shelf row not visible on load (top ${Math.round(t0.top)} of ${t0.h})`);}
  // boxes visible on their shelf
  for(const [id] of BOARD){const l=p.locator(`.boxbtn[data-id="${id}"]`);await l.evaluate(e=>e.scrollIntoView({block:'center'}));await p.waitForTimeout(80);
    const r=await p.evaluate(id=>{const e=document.querySelector(`.boxbtn[data-id="${id}"]`),r=e.getBoundingClientRect(),bay=e.closest('.bay').getBoundingClientRect();return{r:[r.x,r.y,r.right,r.bottom],bay:[bay.x,bay.y,bay.right,bay.bottom],vw:innerWidth,vh:innerHeight}},id);
    const [x,y,rr,bb]=r.r,[bx,by,br,bbb]=r.bay;
    if(!(rr-x>20&&bb-y>10&&x>=-1&&rr<=r.vw+1&&y>=-1&&bb<=r.vh+1&&x>=bx-2&&rr<=br+2&&y>=by-2&&bb<=bbb+4))fail(`${tag} box ${id} not visible on its shelf ${JSON.stringify(r)}`)}
  await p.evaluate(()=>scrollTo(0,0));
  if(ph){
    const bad=await p.evaluate(()=>{const out=[];for(const e of document.querySelectorAll('button,a[href],[role=button],input,select,.cat')){const cs=getComputedStyle(e);if(cs.visibility==='hidden'||cs.display==='none')continue;const r=e.getBoundingClientRect();if(!r.width)continue;if(e.closest('#inspect,#table,dialog'))continue;if(r.width<43.5||r.height<43.5)out.push((e.className||e.tagName)+' '+Math.round(r.width)+'x'+Math.round(r.height))}return out});
    bad.forEach(x=>fail(`${tag} small tap target ${x}`));
    const small=await p.evaluate(()=>{const out=new Set();const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;while(n=w.nextNode()){if(!n.nodeValue.trim())continue;const e=n.parentElement;if(e.closest('script,style,#inspect:not(.on),dialog:not([open]),[hidden]'))continue;const cs=getComputedStyle(e);if(cs.display==='none'||cs.visibility==='hidden')continue;const r=e.getBoundingClientRect();if(!r.width||!r.height)continue;if(parseFloat(cs.fontSize)<12.95)out.add(e.className+':'+cs.fontSize+':'+n.nodeValue.trim().slice(0,20))}return[...out]});
    small.forEach(x=>fail(`${tag} small text ${x}`))}
  await p.screenshot({path:`shots/${tag}.png`});
  // TV: visible, switchable, opens guide card, plays the video games
  {const info=()=>p.evaluate(()=>{const e=document.querySelector('#tvscreen');if(!e)return null;const r=e.getBoundingClientRect();return{x:r.x,y:r.y,r:r.right,b:r.bottom,w:r.width,h:r.height,lab:e.getAttribute('aria-label'),vw:innerWidth,vh:innerHeight}});
   if(!ph){const t=await info();ok(t&&t.w>100&&t.h>70&&t.x>=0&&t.r<=t.vw&&t.y>=0&&t.b<=t.vh,`${tag} TV screen visible on desktop ${JSON.stringify(t)}`);
     const sb=await p.evaluate(()=>{const t=document.querySelector('#tv').getBoundingClientRect(),l=document.querySelector('.lamp .pole').getBoundingClientRect(),b=document.querySelector('.bookcase').getBoundingClientRect();return{lamp:t.right>l.left&&t.left<l.right&&t.top<l.bottom&&t.bottom>l.top,case:t.left<b.right-2&&t.right>b.left&&t.top<b.bottom-12&&t.bottom>b.top}});
     ok(!sb.lamp&&!sb.case,`${tag} TV overlaps lamp/bookcase ${JSON.stringify(sb)}`)}
   else{await p.locator('#tvscreen').scrollIntoViewIfNeeded();const t=await info();ok(t&&t.w>=100&&t.h>=70&&t.x>=0&&t.r<=t.vw+1,`${tag} TV screen visible on phone ${JSON.stringify(t)}`)}
   await p.locator('#tv').scrollIntoViewIfNeeded();
   ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),tag+' no sideways scroll with TV');
   const l0=(await info()).lab;ok(/channel 1.*Nightrun/i.test(l0),tag+' starts on CH 1 '+l0);
   ok(await p.locator('[data-tvch]').count()===2,tag+' two channel controls');
   for(const e of await p.locator('[data-tvch]').all()){const bx=await e.boundingBox();ok(bx&&bx.width>=43&&bx.height>=43||(!ph&&bx&&bx.width>=24),`${tag} channel button size ${JSON.stringify(bx)}`);
     const hit=await e.evaluate(n=>{n.scrollIntoView({block:'center'});const r=n.getBoundingClientRect(),cs=getComputedStyle(n,'::after');return Math.max(r.width,parseFloat(cs.width)||0)});ok(hit>=43,`${tag} channel hit area ${hit}`)}
   await p.screenshot({path:`shots/${tag}-tv.png`});
   await p.click('[data-tvch="1"]');await p.waitForTimeout(450);
   const l1=(await info()).lab;ok(/channel 2.*Overdrive/i.test(l1),tag+' next channel '+l1);
   ok((await p.textContent(ph?'#tvtitle':'#tvscreen .tv-ttl')).includes('Mainhattan Overdrive'),tag+' title shows on screen');
   ok((await p.textContent('#tvscreen .tv-ch')).trim()==='CH 2',tag+' CH 2 label');
   await p.click('[data-tvch="-1"]');await p.waitForTimeout(450);
   ok(/channel 1/i.test((await info()).lab),tag+' previous channel');
   for(const [ch,id] of [[1,'mainhattan'],[2,'overdrive']]){
     if(ch===2){await p.click('[data-tvch="1"]');await p.waitForTimeout(450)}
     await p.locator('#tvscreen').scrollIntoViewIfNeeded();await p.click('#tvscreen');await p.waitForTimeout(900);
     ok(await p.locator('#inspect .tvg').count()===1&&!await p.evaluate(()=>document.getElementById('inspect').hidden),`${tag} tv card opens ${id}`);
     ok(await inside(p,'#inspect .play'),`${tag} tv Play inside viewport`);
     ok(await p.evaluate(()=>document.activeElement&&document.activeElement.closest('#inspect')!==null),tag+' tv card focus inside');
     ok((await p.textContent('#inspect')).includes('CH '+ch)&&await p.locator('#inspect .stats div').count()===4&&await p.locator('#inspect .chips span').count()>3&&await p.locator('#inspect a.alt').count()===1,`${tag} tv card content ${id}`);
     const nm=await p.evaluate(()=>document.querySelector('#inspect [role=dialog]').getAttribute('aria-label'));ok(/^Now playing:/.test(nm),tag+' tv card name '+nm);
     if(ch===1)await p.screenshot({path:`shots/${tag}-tv-card.png`});
     if(ch===1){await p.keyboard.press('Escape');await p.waitForTimeout(800);ok(await p.evaluate(()=>document.getElementById('inspect').hidden),tag+' tv Esc closes');ok(await p.evaluate(()=>document.activeElement&&document.activeElement.id==='tvscreen'),tag+' focus back on screen');
       await p.keyboard.press('Enter');await p.waitForTimeout(900);ok(!await p.evaluate(()=>document.getElementById('inspect').hidden),tag+' Enter on screen opens card');
       await p.click('#inspect .ins-x, #inspect .sh-x');await p.waitForTimeout(800);ok(await p.evaluate(()=>document.getElementById('inspect').hidden),tag+' tv close button');
       await p.click('#tvscreen');await p.waitForTimeout(800);
       if(!ph){await p.mouse.click(8,8);await p.waitForTimeout(800);ok(await p.evaluate(()=>document.getElementById('inspect').hidden),tag+' tv outside click closes');await p.click('#tvscreen');await p.waitForTimeout(800)}}
     const n0=await p.evaluate(id=>(JSON.parse(localStorage.room_plays||'{}')[id]|0),id);
     await p.click('#inspect .play');await p.waitForTimeout(1600);
     const s=await p.evaluate(()=>({src:document.getElementById('frame').src,hid:document.getElementById('table').hidden}));
     ok(!s.hid&&s.src.endsWith(TVSRC[id]),`${tag} tv play ${id} src ${s.src}`);
     await backFromGame(p);
     ok(await p.evaluate(()=>document.getElementById('table').hidden&&document.getElementById('inspect').hidden),`${tag} tv game closed`);
     ok(await p.evaluate(id=>localStorage.getItem('shelf_last')===id&&(JSON.parse(localStorage.room_plays)[id]|0),id)===n0+1,`${tag} tv play counted ${id}`);
     ok(await p.evaluate(()=>document.activeElement&&document.activeElement.id==='tvscreen'),`${tag} focus returns to TV after game`);
     ok(/channel/i.test((await info()).lab),tag+' TV still there after game');
   }
   // coffee table shows controller + cartridge for a video game
   if(!ph){ok(await p.locator('#coffee .cart').count()===1&&await p.locator('#coffee .pad').count()===1&&await p.locator('#coffee .lid').count()===0,tag+' coffee table video prop');await p.screenshot({path:`shots/${tag}-continue-video.png`})}
   else ok(/Overdrive/.test(await p.textContent('.cbtn2')),tag+' phone continue is the video game');
   ok(await p.evaluate(()=>{const b=document.querySelector('.cbtn,.cbtn2');return b&&b.textContent.includes('Overdrive')}),tag+' continue label video');
   await p.evaluate(()=>scrollTo(0,0))}
  // inspect three games
  for(const [id,src] of [GAMES[0],GAMES[8],GAMES[10]]){
    await openBox(p,id);
    const pl=await rectOf(p,'#inspect .play');
    ok(pl&&await inside(p,'#inspect .play'),`${tag} ${id} Play not fully inside viewport ${JSON.stringify(pl)}`);
    const top=await p.evaluate(()=>{const e=document.querySelector('#inspect .play');const r=e.getBoundingClientRect();const t=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return e.contains(t)});
    ok(top,`${tag} ${id} Play covered`);
    ok(await p.evaluate(()=>document.activeElement&&document.activeElement.closest('#inspect')!==null),`${tag} ${id} focus not in inspect`);
    if(id==='thornbound')await p.screenshot({path:`shots/${tag}-inspect.png`});
    await p.click('#inspect .play');await p.waitForTimeout(1600);
    const s=await p.evaluate(()=>({src:document.getElementById('frame').src,hid:document.getElementById('table').hidden}));
    ok(!s.hid&&s.src.endsWith(src),`${tag} ${id} overlay src ${s.src}`);
    await backFromGame(p);
    ok(await p.evaluate(()=>document.getElementById('table').hidden),`${tag} overlay did not close`);
    ok(await p.evaluate(()=>localStorage.getItem('shelf_last'))===id,`${tag} shelf_last ${id}`);
    ok(await p.evaluate(()=>document.getElementById('inspect').hidden),`${tag} inspect still open after game`);
  }
  ok(await p.evaluate(()=>JSON.parse(localStorage.room_plays).crown===1),tag+' plays counted');
  // reload shows continue
  await p.reload();await p.waitForTimeout(500);
  const ct=await p.evaluate(()=>(document.querySelector('.cbtn,.cbtn2')||{}).textContent||'');
  ok(ct.includes('The Thornbound Throne'),`${tag} coffee table continue: "${ct}"`);
  if(!ph||h===844)await p.screenshot({path:`shots/${tag}-continue.png`});
  // continue button works
  await p.locator('.cbtn,.cbtn2').scrollIntoViewIfNeeded();await p.click('.cbtn,.cbtn2');await p.waitForTimeout(400);
  ok((await p.evaluate(()=>document.getElementById('frame').src)).endsWith('thornbound/index.html'),tag+' continue opens game');
  await backFromGame(p);
  // Escape closes inspect
  await openBox(p,'nebula');await p.keyboard.press('Escape');await p.waitForTimeout(900);
  ok(await p.evaluate(()=>document.getElementById('inspect').hidden),tag+' Esc closes inspect');
  ok(await p.evaluate(()=>document.activeElement&&document.activeElement.dataset.id==='nebula'),tag+' focus returns to box');
  // backdrop close / close button
  await openBox(p,'sands');await p.click('#inspect .ins-x, #inspect .sh-x');await p.waitForTimeout(900);
  ok(await p.evaluate(()=>document.getElementById('inspect').hidden),tag+' close button');
  // card list from inspect
  await openBox(p,'crown');await p.click('#inspect [data-ref]');await p.waitForTimeout(300);
  ok((await p.evaluate(()=>document.getElementById('frame').src)).includes('reference.html#crown'),tag+' card list');
  await backFromGame(p);
  // reference object
  await p.locator('[data-obj="ref"]').scrollIntoViewIfNeeded();await p.click('[data-obj="ref"]');await p.waitForTimeout(300);
  ok((await p.evaluate(()=>document.getElementById('frame').src)).endsWith('reference.html'),tag+' reference opens');
  await backFromGame(p);
  ok((await p.getAttribute('[data-obj="sugg"]','href'))==='suggest.html',tag+' suggestion href');
  await p.locator('[data-obj="inv"]').scrollIntoViewIfNeeded();await p.click('[data-obj="inv"]');await p.waitForTimeout(200);
  ok(await p.evaluate(()=>document.getElementById('invite').open),tag+' invite dialog');await p.keyboard.press('Escape');
  // trophy tap
  if(ph)await p.click('#trbtn');await p.locator('.trophy[data-t="explorer"]').scrollIntoViewIfNeeded();await p.click('.trophy[data-t="explorer"]');
  ok((await p.textContent('#tip')).includes('Explorer'),tag+' trophy tip');if(ph){await p.keyboard.press('Escape');ok(!await p.evaluate(()=>document.getElementById('mantel').classList.contains('open')),tag+' trophy popover closes')}
  // plain list
  await p.click('#viewbtn');await p.waitForTimeout(200);
  ok(await p.locator('#listview li').count()===14&&await p.locator('#listview').isVisible(),tag+' list view');
  {const hs=await p.evaluate(()=>[...document.querySelectorAll('#listview h2')].map(h=>[h.textContent,h.nextElementSibling.querySelectorAll('li').length]));ok(JSON.stringify(hs)===JSON.stringify([['Board games',12],['Video games',2]]),tag+' list sections '+JSON.stringify(hs));
   ok(await p.locator('#listview .plist:last-of-type [data-play="overdrive"]').count()===1,tag+' video list play button')}
  ok(await p.evaluate(()=>localStorage.room_view)==='list',tag+' room_view saved');
  if(ph){const bad=await p.evaluate(()=>{const o=[];for(const e of document.querySelectorAll('#listview button,#listview a,header button,header a')){const r=e.getBoundingClientRect();if(r.width&&(r.width<43.5||r.height<43.5))o.push(e.textContent+Math.round(r.height))}return o});bad.forEach(x=>fail(tag+' list small tap '+x))}
  await p.screenshot({path:`shots/${tag}-list.png`});
  await p.reload();await p.waitForTimeout(400);
  ok(await p.locator('#listview li').count()===14&&await p.locator('#listview').isVisible(),tag+' list persists');
  await p.click('#listview [data-play="doorkick"]');await p.waitForTimeout(300);
  ok((await p.evaluate(()=>document.getElementById('frame').src)).endsWith('doorkick-dungeon/index.html'),tag+' list play');
  await backFromGame(p);
  await p.click('#viewbtn');await p.waitForTimeout(200);
  ok(await p.locator('.boxbtn').count()===12,tag+' back to room');
  ok(p.errs.length===0,`${tag} page errors ${p.errs}`);
  await c.close();
}
/* seeded: wear, cat, trophies */
for(const [w,h] of [[1440,900],[390,844],[844,390]]){
  const ph=w<700||h<500,tag=`${w}x${h}`;
  let [c,p]=await mk(b,w,h,'dark',{seed:{room_plays:JSON.stringify({crown:20,nebula:7,sands:2,rampart:1,doorkick:3,tidewake:4}),shelf_last:'crown'}});
  const wr=await p.evaluate(()=>Object.fromEntries([...document.querySelectorAll('.boxbtn')].map(b=>[b.dataset.id,b.querySelector('.b3').dataset.wear])));
  const exp={crown:'3',nebula:'2',sands:'1',rampart:'1',doorkick:'1',tidewake:'1',shipwreck:'0'};
  for(const k in exp)ok(wr[k]===exp[k],`${tag} wear ${k} ${wr[k]} want ${exp[k]}`);
  ok(await p.locator('.cat').count()===1,tag+' one cat');await p.locator('.cat').evaluate(e=>e.scrollIntoView({block:'center'}));await p.waitForTimeout(100);
  const cat=await p.evaluate(()=>{const c=document.querySelector('.cat'),cell=c.closest('.cell'),bx=cell.querySelector('.boxbtn[data-id="crown"]');if(!bx)return null;const a=c.getBoundingClientRect(),b=bx.getBoundingClientRect();const mid=document.elementFromPoint(b.x+b.width/2,b.y+3+0);const top=document.elementFromPoint(b.x+b.width/2,b.y+1);return{catBottom:a.bottom,boxTop:b.top,catW:a.width,catH:a.height,hit:!!(top&&bx.contains(top)),inBay:c.closest('.bay')===bx.closest('.bay')}});
  ok(cat&&cat.inBay&&cat.catBottom<=cat.boxTop+6&&cat.hit,`${tag} cat placement ${JSON.stringify(cat)}`);
  if(ph)ok(cat&&cat.catW>=43.5&&cat.catH>=43.5,tag+' cat tap size');
  await p.locator('.cat').scrollIntoViewIfNeeded();
  await p.screenshot({path:`shots/${tag}-cat.png`});
  await p.click('.cat');await p.waitForTimeout(150);
  ok(await p.evaluate(()=>document.querySelector('.cat').classList.contains('purr')),tag+' cat purrs');
  ok(await p.evaluate(()=>document.getElementById('inspect').hidden),tag+' cat tap must not open box');
  await p.click('.boxbtn[data-id="crown"]');await p.waitForTimeout(1500);
  ok(!await p.evaluate(()=>document.getElementById('inspect').hidden),tag+' box tap opens with cat');
  ok((await p.textContent('#inspect .plays')).includes('Played 20 times'),tag+' play note on back');
  await p.screenshot({path:`shots/${tag}-inspect-worn.png`});await p.keyboard.press('Escape');await p.waitForTimeout(800);
  const tr=await p.evaluate(()=>Object.fromEntries([...document.querySelectorAll('.trophy')].map(t=>[t.dataset.t,t.classList.contains('on')])));
  ok(tr.first&&tr.regular&&tr.explorer&&!tr.collector&&!tr.owl,tag+' trophies '+JSON.stringify(tr));
  ok(!!await p.evaluate(()=>localStorage.room_trophies),tag+' room_trophies stored');
  if(ph)await p.click('#trbtn');
  await p.screenshot({path:`shots/${tag}-trophies.png`});
  await c.close();
  // explorer + collector
  const all={};GAMES.forEach(([id])=>all[id]=1);
  [c,p]=await mk(b,w,h,'dark',{seed:{room_plays:JSON.stringify(all)}});
  const t2=await p.evaluate(()=>Object.fromEntries([...document.querySelectorAll('.trophy')].map(t=>[t.dataset.t,t.classList.contains('on')])));
  ok(t2.first&&t2.explorer&&t2.collector&&t2.regular&&!t2.owl,tag+' trophies all played '+JSON.stringify(t2));
  ok(await p.locator('.cat').count()===0,tag+' no cat when <3 plays');
  await c.close();
  [c,p]=await mk(b,w,h,'dark',{seed:{room_plays:JSON.stringify({crown:2,nebula:1})}});
  const t3=await p.evaluate(()=>Object.fromEntries([...document.querySelectorAll('.trophy')].map(t=>[t.dataset.t,t.classList.contains('on')])));
  ok(t3.first&&!t3.regular&&!t3.explorer&&!t3.collector&&!t3.owl,tag+' trophies few plays '+JSON.stringify(t3));await c.close();
  // night owl
  [c,p]=await mk(b,w,h,'dark',{hour:2});
  await openBox(p,'sunglaze');await p.click('#inspect .play');await p.waitForTimeout(1500);await backFromGame(p);
  ok(await p.evaluate(()=>document.querySelector('.trophy[data-t="owl"]').classList.contains('on')&&document.querySelector('.trophy[data-t="first"]').classList.contains('on')),tag+' night owl');
  ok(p.errs.length===0,tag+' seeded errors '+p.errs);await c.close();
}
/* copyright: no 'based on' references */
{const BAN=['Plays like','plays like','in the style of','King of Tokyo','X-Wing','Munchkin','Robinson Crusoe','Five Tribes','Azul','Carcassonne','Bomb Busters','Tsuro','Everdell','Old King','Aether'];
 const src=require('fs').readFileSync('/home/user/spotify_to_ytmusic/games/index.html','utf8');
 for(const t of BAN)ok(!src.includes(t),'banned text in source: '+t);
 for(const v of ['room','list']){const [c,p]=await mk(b,1280,720,'dark',{seed:{room_view:v}});await openBox(p,'crown').catch(()=>{});const html=await p.evaluate(()=>document.documentElement.outerHTML);for(const t of BAN)ok(!html.includes(t),'banned text in DOM ('+v+'): '+t);await c.close()}}
/* reduced motion */
for(const [w,h] of [[1440,900],[390,844]]){
  const tag=`rm-${w}x${h}`;const [c,p]=await mk(b,w,h,'dark',{rm:true});
  ok(await p.evaluate(()=>getComputedStyle(document.querySelector('.tv-flick')).animationName==='none'&&getComputedStyle(document.querySelector('.tv-roll')).animationName==='none'),tag+' no TV flicker animation under reduced motion');
  await p.locator('#tvscreen').scrollIntoViewIfNeeded();await p.click('[data-tvch="1"]');await p.waitForTimeout(60);
  ok(await p.locator('#tvscreen.sw').count()===0,tag+' no static flash under reduced motion');
  await p.click('#tvscreen');await p.waitForTimeout(500);ok(await inside(p,'#inspect .play'),tag+' play visible');
  await p.screenshot({path:`shots/${tag}-inspect.png`});
  await p.click('#inspect .play');await p.waitForTimeout(500);
  ok((await p.evaluate(()=>document.getElementById('frame').src)).endsWith('mainhattan-overdrive/index.html'),tag+' play');
  await backFromGame(p);ok(p.errs.length===0,tag+' errors '+p.errs);await c.close()}
/* short phones: first shelf row visible on load */
for(const [w,h] of [[740,360],[844,390],[360,740]]){const [c,p]=await mk(b,w,h,'dark',{});const t=await p.evaluate(()=>{const r=document.querySelector('.boxbtn[data-id="crown"]').getBoundingClientRect();return[r.top,r.bottom,innerHeight,document.documentElement.scrollWidth<=innerWidth]});
 ok(t[0]<t[2]-60&&t[3],`${w}x${h} first row visible ${t}`);await p.screenshot({path:`shots/${w}x${h}-first.png`});await c.close()}
/* continue label has no (preview) */
{const [c,p]=await mk(b,1280,720,'dark',{seed:{shelf_last:'tidewake'}});const t=await p.textContent('.cbtn');ok(t.includes('Tidewake')&&!t.includes('preview'),'continue label '+t);
 await openBox(p,'tidewake');ok((await p.textContent('#inspect .bk-h h2')).includes('(preview)'),'inspect title keeps (preview)');
 const r=await p.evaluate(()=>{const f=document.querySelector('#inspect .fly').getBoundingClientRect();const b=document.querySelector('#inspect .b3').getBoundingClientRect();const x=document.querySelector('#inspect .ins-x').getBoundingClientRect();const v=document.getElementById('viewbtn').getBoundingClientRect();return{fly:[f.left,f.top,f.right,f.bottom],boxIn:b.left>=f.left&&b.right<=f.left+f.width*.5,x:x.left>=f.left&&x.right<=f.right&&x.top>=f.top&&x.bottom<=f.bottom,fit:f.top>=0&&f.bottom<=innerHeight}});
 ok(r.boxIn&&r.x&&r.fit,'inspect card layout '+JSON.stringify(r));await p.screenshot({path:'shots/1280x720-inspect-card.png'});await c.close()}
/* phone full-screen mode */
{const IP='Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
 const c=await b.newContext({viewport:{width:390,height:844},userAgent:IP,hasTouch:true,colorScheme:'dark'});const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto(URL);await p.waitForTimeout(500);
 ok(await p.evaluate(()=>!document.getElementById('iostip').hidden),'iOS tip shown once');await p.click('#iosok');
 await p.locator('.boxbtn[data-id="sunglaze"]').scrollIntoViewIfNeeded();await p.click('.boxbtn[data-id="sunglaze"]');await p.waitForTimeout(600);await p.click('#inspect .play');await p.waitForTimeout(800);
 const r=await p.evaluate(()=>{const f=document.getElementById('frame').getBoundingClientRect(),fab=document.getElementById('fab').getBoundingClientRect();return{f:[f.x,f.y,f.width,f.height],bar:getComputedStyle(document.querySelector('#table .bar')).display,fab:[fab.width,fab.height,getComputedStyle(document.getElementById('fab')).display]}});
 ok(r.f[2]>=389&&r.f[3]>=843&&r.bar==='none'&&r.fab[0]>=44&&r.fab[2]!=='none','phone fullscreen '+JSON.stringify(r));
 await p.click('#fab');ok(await p.evaluate(()=>!document.getElementById('fabmenu').hidden),'fab menu opens');await p.click('#fabback');await p.waitForTimeout(300);
 ok(await p.evaluate(()=>document.getElementById('table').hidden&&document.getElementById('fab').hidden),'fab back closes');
 await p.reload();await p.waitForTimeout(400);ok(await p.evaluate(()=>document.getElementById('iostip').hidden),'iOS tip only once');
 ok(errs.length===0,'fab errors '+errs);await c.close();
 const [c2,p2]=await mk(b,1280,720,'dark',{});await openBox(p2,'sunglaze');await p2.click('#inspect .play');await p2.waitForTimeout(1500);
 ok(await p2.evaluate(()=>getComputedStyle(document.querySelector('#table .bar')).display!=='none'&&getComputedStyle(document.getElementById('fab')).display==='none'),'desktop keeps bar, no fab');await c2.close()}
/* TV: flicker animation present when motion allowed, auto channel switching with static, cat on the TV */
{const [c,p]=await mk(b,1440,900,'light',{});
 ok(await p.evaluate(()=>getComputedStyle(document.querySelector('.tv-flick')).animationName!=='none'),'TV flicker animates by default');
 const lab=()=>p.getAttribute('#tvscreen','aria-label');const a=await lab();
 let saw=false;for(let i=0;i<30;i++){await p.waitForTimeout(250);if(await p.locator('#tvscreen.sw').count()){saw=true;break}}
 await p.waitForTimeout(500);const a2=await lab();
 ok(saw,'static flash shown on auto switch');ok(a!==a2,'TV auto-switches channel after ~6 s ('+a+' / '+a2+')');
 await p.screenshot({path:'shots/1440x900-tv-auto.png'});
 await p.hover('#tvscreen');const h0=await lab();await p.waitForTimeout(6600);ok(h0===await lab(),'auto switch pauses while hovering the TV');
 await c.close()}
for(const [w,h] of [[1440,900],[390,844],[844,390]]){const tag=`catTV-${w}x${h}`,ph=w<700||h<500;
 const [c,p]=await mk(b,w,h,'dark',{seed:{room_plays:JSON.stringify({overdrive:9,crown:4}),shelf_last:'overdrive'}});
 ok(await p.locator('.cat').count()===1&&await p.locator('#tv .cat').count()===1,tag+' cat sits on the TV when a video game is most played');
 await p.locator('#tv').scrollIntoViewIfNeeded();await p.screenshot({path:`shots/${tag}.png`});
 const g=await p.evaluate(()=>{const c=document.querySelector('.cat').getBoundingClientRect(),s=document.querySelector('#tv .tv-cab,#tv .tv-bez').getBoundingClientRect();return{catB:c.bottom,top:s.top}});
 ok(g.catB<=g.top+ (ph?20:10),tag+' cat above TV '+JSON.stringify(g));
 await p.click('.cat');await p.waitForTimeout(100);ok(await p.evaluate(()=>document.getElementById('inspect').hidden),tag+' cat tap does not open card');
 ok(await p.locator('.boxbtn .cat,.cell .cat').count()===0,tag+' no cat on shelf');
 ok(p.errs.length===0,tag+' errors '+p.errs);await c.close()}
/* deep link */
{const [c,p]=await mk(b,1280,720,'dark',{});await p.goto(URL+'#sands');await p.reload();await p.waitForTimeout(500);
 ok((await p.evaluate(()=>document.getElementById('frame').src)).endsWith('sands-of-qamar/index.html'),'deep link');
 await p.goto(URL+'#overdrive');await p.reload();await p.waitForTimeout(500);
 ok((await p.evaluate(()=>document.getElementById('frame').src)).endsWith('mainhattan-overdrive/index.html')&&!await p.evaluate(()=>document.getElementById('table').hidden),'deep link to a video game');
 await p.goto(URL+'#mainhattan');await p.reload();await p.waitForTimeout(500);
 ok((await p.evaluate(()=>document.getElementById('frame').src)).endsWith('mainhattan-nightrun/index.html'),'deep link mainhattan');await c.close()}
await b.close();console.log(problems+' problems');
})();
