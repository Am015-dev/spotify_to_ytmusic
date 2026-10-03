const {chromium}=require('playwright');
const URL='file:///home/user/spotify_to_ytmusic/games/index.html';
const VPS=[[1440,900],[1280,720],[844,390],[390,844],[360,740]];
let problems=0;const fail=m=>{problems++;console.log('FAIL',m)};
const ok=(c,m)=>{if(!c)fail(m)};
const GAMES=[['crown','crown-city-smash/index.html'],['nebula','nebula-aces/index.html'],['doorkick','doorkick-dungeon/index.html'],['shipwreck','shipwreck-isle/index.html'],['sands','sands-of-qamar/index.html'],['sunglaze','sunglaze/index.html'],['rampart','rampart-and-vine/index.html'],['shortfuse','short-fuse/index.html'],['tidewake','tidewake/index.html'],['hollowbough','hollowbough/index.html'],['thornbound','thornbound/index.html'],['mainhattan','mainhattan-nightrun/index.html'],['overdrive','mainhattan-overdrive/index.html']];
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
  ok((await p.textContent('#tally'))==='13 games on the shelf',tag+' tally');
  ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),tag+' scrollWidth '+await p.evaluate(()=>document.documentElement.scrollWidth));
  ok(await p.locator('.boxbtn').count()===13,tag+' 13 boxes');
  ok(await p.evaluate(()=>getComputedStyle(document.body).backgroundColor!=='rgba(0, 0, 0, 0)'),tag+' body bg');
  {const t0=await p.evaluate(()=>{const r=document.querySelector('.boxbtn[data-id="crown"]').getBoundingClientRect();return{top:r.top,h:innerHeight}});
   if(ph)ok(t0.top<t0.h-60,`${tag} first shelf row not visible on load (top ${Math.round(t0.top)} of ${t0.h})`);}
  // boxes visible on their shelf
  for(const [id] of GAMES){const l=p.locator(`.boxbtn[data-id="${id}"]`);await l.evaluate(e=>e.scrollIntoView({block:'center'}));await p.waitForTimeout(80);
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
  ok(await p.locator('#listview li').count()===13&&await p.locator('#listview').isVisible(),tag+' list view');
  ok(await p.evaluate(()=>localStorage.room_view)==='list',tag+' room_view saved');
  if(ph){const bad=await p.evaluate(()=>{const o=[];for(const e of document.querySelectorAll('#listview button,#listview a,header button,header a')){const r=e.getBoundingClientRect();if(r.width&&(r.width<43.5||r.height<43.5))o.push(e.textContent+Math.round(r.height))}return o});bad.forEach(x=>fail(tag+' list small tap '+x))}
  await p.screenshot({path:`shots/${tag}-list.png`});
  await p.reload();await p.waitForTimeout(400);
  ok(await p.locator('#listview li').count()===13&&await p.locator('#listview').isVisible(),tag+' list persists');
  await p.click('#listview [data-play="doorkick"]');await p.waitForTimeout(300);
  ok((await p.evaluate(()=>document.getElementById('frame').src)).endsWith('doorkick-dungeon/index.html'),tag+' list play');
  await backFromGame(p);
  await p.click('#viewbtn');await p.waitForTimeout(200);
  ok(await p.locator('.boxbtn').count()===13,tag+' back to room');
  ok(p.errs.length===0,`${tag} page errors ${p.errs}`);
  await c.close();
}
/* seeded: wear, cat, trophies */
for(const [w,h] of [[1440,900],[390,844],[844,390]]){
  const ph=w<700||h<500,tag=`${w}x${h}`;
  let [c,p]=await mk(b,w,h,'dark',{seed:{room_plays:JSON.stringify({crown:20,nebula:7,sands:2,rampart:1,doorkick:3,tidewake:4}),shelf_last:'crown'}});
  const wr=await p.evaluate(()=>Object.fromEntries([...document.querySelectorAll('.boxbtn')].map(b=>[b.dataset.id,b.querySelector('.b3').dataset.wear])));
  const exp={crown:'3',nebula:'2',sands:'1',rampart:'1',doorkick:'1',tidewake:'1',shipwreck:'0',overdrive:'0'};
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
  await openBox(p,'overdrive');ok(await inside(p,'#inspect .play'),tag+' play visible');
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
/* deep link */
{const [c,p]=await mk(b,1280,720,'dark',{});await p.goto(URL+'#sands');await p.reload();await p.waitForTimeout(500);
 ok((await p.evaluate(()=>document.getElementById('frame').src)).endsWith('sands-of-qamar/index.html'),'deep link');await c.close()}
await b.close();console.log(problems+' problems');
})();
