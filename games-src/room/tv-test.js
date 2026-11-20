// Game Night TV (highlights channel on the room TV + full-screen player). node games-src/room/tv-test.js   [VP=390x844-light] [SHOTS=dir] [PROOF=dir]
// Checks at the room's viewports (+1366x768, 1920x1080): the knobs reach "CH 3 · Highlights" and back to CH 1/CH 2 unchanged, the small screen
// shows the trailer's game, only one trailer is loaded, the player opens/closes (button, Esc), swipe / arrow / wheel go to the next trailer,
// tap pauses, sound starts muted, Play opens the right game, no sideways scroll, tap >= 44 px, text >= 12 px (PC) / 11 px (phone),
// reduced motion = poster, no autoplay; preview pauses while a game is open or the page is hidden.
const {chromium}=require('playwright');const fs=require('fs');
const GAMES_DIR=process.env.GAMES_DIR||require('path').resolve(__dirname,'../../games'),SHOTS=process.env.SHOTS||'/tmp/tv-shots',PROOF=process.env.PROOF||'';
const URL='file://'+GAMES_DIR+'/index.html',SHELF_PATH=GAMES_DIR+'/index.html';
const TV=JSON.parse(fs.readFileSync(GAMES_DIR+'/tv/tv.json','utf8')).trailers;
const VPS=[[1440,900],[1366,768],[1920,1080],[1280,720],[844,390],[390,844],[360,740]];
let problems=0,checks=0;const fail=m=>{problems++;console.log('FAIL',m)},ok=(c,m)=>{checks++;if(!c)fail(m)};
fs.mkdirSync(SHOTS,{recursive:true});if(PROOF)fs.mkdirSync(PROOF,{recursive:true});
async function mk(b,w,h,o={}){
  const ph=w<700||h<500;
  const c=await b.newContext({viewport:{width:w,height:h},colorScheme:o.scheme||'light',reducedMotion:o.rm?'reduce':'no-preference',hasTouch:ph,isMobile:false,deviceScaleFactor:o.dsf||1,recordVideo:o.video?{dir:o.video,size:{width:w,height:h}}:undefined});
  if(o.hour!=null)await c.addInitScript(h=>{Date.prototype.getHours=()=>h},o.hour);
  await c.route(u=>/\/[^\/]+\/index\.html$/.test(u.pathname)&&u.pathname!==SHELF_PATH,r=>r.fulfill({body:'<!doctype html><title>stub</title><body>stub',contentType:'text/html'}));
  const p=await c.newPage();p.errs=[];p.on('pageerror',e=>{if(!/buildBox|reading 'c'\)/.test((e.stack||'')+e.message))p.errs.push(e.message)});   // buildBox: a known shelf error (box art of a game without a box style), not the TV's
  await p.goto(URL+(o.q||''));await p.waitForFunction(()=>window.GNS_TV,null,{timeout:8000}).catch(()=>{});await p.waitForTimeout(400);return [c,p]}
const lab=p=>p.getAttribute('#tvscreen','aria-label');
async function toHL(p){await p.locator('#tv').scrollIntoViewIfNeeded();for(let i=0;i<4&&!/highlights/i.test(await lab(p));i++){await p.click('[data-tvch="1"]');await p.waitForTimeout(350)}}
const vids=p=>p.evaluate(()=>[...document.querySelectorAll('video')].filter(v=>v.getAttribute('src')).map(v=>v.getAttribute('src')));
const hlOpen=p=>p.evaluate(()=>!document.getElementById('hltv').hidden);
const cur=p=>p.evaluate(()=>document.querySelector('#hltv .hl-v').getAttribute('src'));
const tap=async(p,ph,sel)=>{if(ph)await p.tap(sel);else await p.click(sel)};
async function swipe(p,ph,dy){const r=await p.evaluate(()=>{const e=document.querySelector('#hltv .hl-tap').getBoundingClientRect();return{x:e.x+e.width/2,y:e.y+e.height*.45}});
  await p.evaluate(({x,y,dy,t})=>{const el=document.querySelector('#hltv .hl-tap');const ev=(n,yy)=>el.dispatchEvent(new PointerEvent(n,{bubbles:true,clientX:x,clientY:yy,pointerType:t,isPrimary:true,pointerId:7}));ev('pointerdown',y);for(let i=1;i<=6;i++)ev('pointermove',y+dy*i/6);ev('pointerup',y+dy)},{...r,dy,t:ph?'touch':'mouse'});await p.waitForTimeout(450)}
(async()=>{
const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});
for(const [w,h] of VPS){
  const tag=`${w}x${h}`,ph=w<700||h<500;if(process.env.VP&&!process.env.VP.startsWith(tag))continue;
  const [c,p]=await mk(b,w,h);
  ok(TV.length>=15,tag+' trailers in tv.json '+TV.length);
  await p.locator('#tv').scrollIntoViewIfNeeded();
  // existing channels unchanged: CH 1 Nightrun, CH 2 Overdrive
  for(let i=0;i<4&&!/channel 1:/i.test(await lab(p));i++){await p.click('[data-tvch="1"]');await p.waitForTimeout(350)}
  ok(/channel 1:.*Nightrun/i.test(await lab(p)),tag+' CH 1 still Nightrun');
  ok((await vids(p)).length===0,tag+' no trailer loads on the game channels');
  await p.click('[data-tvch="1"]');await p.waitForTimeout(350);ok(/channel 2:.*Overdrive/i.test(await lab(p)),tag+' CH 2 still Overdrive');
  await p.click('[data-tvch="1"]');await p.waitForTimeout(600);
  ok(/channel 3:.*highlights/i.test(await lab(p)),tag+' CH 3 is highlights: '+await lab(p));
  ok((await p.textContent('#tvscreen .tv-ch')).trim()==='CH 3 · Highlights',tag+' CH 3 label');
  const nm=await p.textContent(ph?'#tvtitle':'#tvscreen .tv-ttl');ok(TV.some(t=>nm.includes(t.name.split(' (')[0])),tag+' game name on screen '+nm);
  await p.waitForTimeout(900);
  const pv=await p.evaluate(()=>{const v=document.querySelector('#tvscreen .tv-vid');return v&&{src:v.getAttribute('src'),muted:v.muted,paused:v.paused,loop:v.loop}});
  ok(pv&&pv.src&&pv.muted&&!pv.paused,tag+' muted preview plays '+JSON.stringify(pv));
  ok((await vids(p)).length===1,tag+' only one trailer loaded '+JSON.stringify(await vids(p)));
  ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),tag+' no sideways scroll on CH 3');
  {const fsz=await p.evaluate(()=>[...document.querySelectorAll('#tvscreen .tv-ch,#tvscreen .tv-ttl,#tvtitle,#tvchn,#tvplate')].filter(e=>e.offsetParent).map(e=>parseFloat(getComputedStyle(e).fontSize)));
   ok(fsz.every(f=>f>=(ph?11:12)),tag+' TV text size '+fsz)}
  if(PROOF&&[[1440,900],[390,844]].some(([a,bb])=>a===w&&bb===h)){
    for(const [hr,tod] of [[13,'day'],[22,'night']]){const [c2,p2]=await mk(b,w,h,{hour:hr,dsf:2});await toHL(p2);await p2.waitForTimeout(2500);
      if(ph)await p2.locator('#tv').evaluate(e=>e.scrollIntoView({block:'center'}));await p2.screenshot({path:`${PROOF}/room-${ph?'phone-390':'pc-1440'}-${tod}.png`});await c2.close()}}
  // auto channel surfing must not leave CH 3
  await p.mouse.move(2,2);await p.waitForTimeout(6600);ok(/channel 3/i.test(await lab(p)),tag+' auto surf keeps CH 3');
  // knobs back: CH 3 -> CH 1 (next wraps)
  await p.click('[data-tvch="1"]');await p.waitForTimeout(400);ok(/channel 1:/i.test(await lab(p)),tag+' wraps to CH 1');
  await p.click('[data-tvch="-1"]');await p.waitForTimeout(400);ok(/channel 3/i.test(await lab(p)),tag+' previous reaches CH 3');
  // the player
  await tap(p,ph,'#tvscreen');await p.waitForTimeout(700);
  ok(await hlOpen(p),tag+' player opens');
  const s0=await cur(p);ok(s0&&TV.some(t=>s0.endsWith(t.file)),tag+' player trailer '+s0);
  ok(await p.evaluate(()=>{const v=document.querySelector('#hltv .hl-v');return v.muted&&!v.paused}),tag+' player plays muted');
  ok(await p.evaluate(()=>document.activeElement&&document.activeElement.closest('#hltv')!==null),tag+' focus inside player');
  ok(await p.evaluate(()=>document.querySelector('#tvscreen .tv-vid').paused),tag+' small screen pauses under the player');
  ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),tag+' no sideways scroll in player');
  {const bad=await p.evaluate(()=>{const o=[];for(const e of document.querySelectorAll('#hltv button,#hltv input')){if(e.classList.contains('hl-tap'))continue;const r=e.getBoundingClientRect();if(r.width<44||r.height<44)o.push(e.className+' '+Math.round(r.width)+'x'+Math.round(r.height));if(r.left<-1||r.right>innerWidth+1||r.top<-1||r.bottom>innerHeight+1)o.push('outside '+e.className)}return o});bad.forEach(x=>fail(tag+' player control '+x))}
  {const bad=await p.evaluate(min=>{const o=[];for(const e of document.querySelectorAll('#hltv *')){if(![...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim()))continue;const f=parseFloat(getComputedStyle(e).fontSize);if(f<min)o.push(e.className+' '+f)}return o},ph?11:12);bad.forEach(x=>fail(tag+' player small text '+x))}
  if(PROOF&&(tag==='390x844'||tag==='1440x900')){await p.waitForTimeout(1800);await p.screenshot({path:`${PROOF}/player-${ph?'phone-390':'pc-1440'}.png`})}
  else await p.screenshot({path:`${SHOTS}/${tag}-player.png`});
  // tap pauses / plays
  await tap(p,ph,'#hltv .hl-tap');await p.waitForTimeout(250);ok(await p.evaluate(()=>document.querySelector('#hltv .hl-v').paused&&document.getElementById('hltv').classList.contains('paused')),tag+' tap pauses');
  await tap(p,ph,'#hltv .hl-tap');await p.waitForTimeout(350);ok(await p.evaluate(()=>!document.querySelector('#hltv .hl-v').paused),tag+' tap plays again');
  // sound
  await tap(p,ph,'[data-hlsnd]');ok(await p.evaluate(()=>!document.querySelector('#hltv .hl-v').muted),tag+' sound toggle on');await tap(p,ph,'[data-hlsnd]');
  // scrub bar
  await p.waitForFunction(()=>document.querySelector('#hltv .hl-v').duration>0,null,{timeout:5000}).catch(()=>{});
  await p.evaluate(()=>{const r=document.querySelector('#hltv .hl-bar');r.value=600;r.dispatchEvent(new Event('input',{bubbles:true}))});await p.waitForTimeout(200);
  ok(await p.evaluate(()=>{const v=document.querySelector('#hltv .hl-v');return v.duration&&Math.abs(v.currentTime/v.duration-.6)<.08}),tag+' scrub seeks');
  // next / previous: swipe, keys, wheel, rail
  await swipe(p,ph,-160);const s1=await cur(p);ok(s1!==s0,tag+' swipe up = next trailer');
  await swipe(p,ph,160);ok(await cur(p)===s0,tag+' swipe down = previous trailer');
  await p.keyboard.press('ArrowDown');await p.waitForTimeout(300);ok(await cur(p)===s1,tag+' ArrowDown = next');
  await p.keyboard.press('ArrowUp');await p.waitForTimeout(300);ok(await cur(p)===s0,tag+' ArrowUp = previous');
  if(!ph){await p.mouse.move(w/2,h/2);await p.mouse.wheel(0,120);await p.waitForTimeout(700);ok(await cur(p)===s1,tag+' wheel = next');await p.keyboard.press('ArrowUp');await p.waitForTimeout(300)}
  await tap(p,ph,'[data-hlgo="1"]');await p.waitForTimeout(300);ok(await cur(p)===s1,tag+' next button');await tap(p,ph,'[data-hlgo="-1"]');await p.waitForTimeout(300);
  ok((await vids(p)).length<=2,tag+' at most the player trailer + the screen preview loaded');
  // close: Esc and the button, focus back on the TV
  await p.keyboard.press('Escape');await p.waitForTimeout(300);ok(!await hlOpen(p),tag+' Esc closes');
  ok(await p.evaluate(()=>document.activeElement&&document.activeElement.id==='tvscreen'),tag+' focus back on the TV');
  ok(await p.evaluate(()=>!document.querySelector('#hltv .hl-v').getAttribute('src')),tag+' closed player unloads its trailer');
  await tap(p,ph,'#tvscreen');await p.waitForTimeout(500);await tap(p,ph,'#hltv .hl-x');await p.waitForTimeout(300);ok(!await hlOpen(p),tag+' close button');
  // Play this game opens the trailer's game
  await tap(p,ph,'#tvscreen');await p.waitForTimeout(500);
  const want=await p.evaluate(()=>{const f=document.querySelector('#hltv .hl-v').getAttribute('src').replace(/^tv\//,'').replace(/\.webm$/,'');return f});
  await tap(p,ph,'#hltv [data-hlplay]');await p.waitForTimeout(600);
  const fr=await p.evaluate(()=>({src:document.getElementById('frame').src,tab:!document.getElementById('table').hidden,pl:document.documentElement.classList.contains('playing')}));
  ok(fr.tab&&fr.src.includes('/'+want+'/'),tag+` Play opens ${want}: ${fr.src}`);ok(!await hlOpen(p),tag+' player closed under the game');
  ok(await p.evaluate(()=>{const v=document.querySelector('#tvscreen .tv-vid');return !v||v.paused}),tag+' preview paused while a game is open');
  if(await p.locator('#back').isVisible())await p.click('#back');else await p.evaluate(()=>{try{closeGame()}catch(e){}});   // phone full-screen game: its back button sits in the FAB menu (covered in test.js); here only the TV state after a game mattersawait p.waitForTimeout(500);
  ok(await p.evaluate(()=>document.getElementById('table').hidden),tag+' back from game');ok(/channel 3/i.test(await lab(p)),tag+' TV back on CH 3 after the game');
  // hidden page pauses the preview
  await p.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'))});await p.waitForTimeout(200);
  ok(await p.evaluate(()=>document.querySelector('#tvscreen .tv-vid').paused),tag+' preview pauses when the page is hidden');
  ok(p.errs.length===0,tag+' page errors '+p.errs.join(' | '));
  await c.close();
}
// reduced motion: poster on the screen, nothing autoplays, the player waits for a tap
{const [c,p]=await mk(b,390,844,{rm:true});await toHL(p);await p.waitForTimeout(900);
 ok(await p.evaluate(()=>{const v=document.querySelector('#tvscreen .tv-vid');return v&&v.paused&&!v.getAttribute('src')}),'reduced motion: no preview autoplay');
 ok(await p.evaluate(()=>/tv\/.+\.webp$/.test(document.querySelector('#tvscreen img').getAttribute('src'))),'reduced motion: poster shown');
 await p.tap('#tvscreen');await p.waitForTimeout(600);ok(await p.evaluate(()=>document.querySelector('#hltv .hl-v').paused),'reduced motion: player waits for a tap');
 await p.tap('#hltv .hl-tap');await p.waitForTimeout(400);ok(await p.evaluate(()=>!document.querySelector('#hltv .hl-v').paused),'reduced motion: tap plays');
 ok(p.errs.length===0,'reduced motion page errors '+p.errs.join(' | '));await c.close()}
// proof video: ~30 s of using it on a phone
if(PROOF){const vd=require('os').tmpdir()+'/tv-proof-vid';fs.rmSync(vd,{recursive:true,force:true});
  const [c,p]=await mk(b,390,844,{video:vd,hour:20});await p.waitForTimeout(1200);await toHL(p);await p.waitForTimeout(3500);
  await p.tap('#tvscreen');await p.waitForTimeout(4000);await swipe(p,true,-200);await p.waitForTimeout(3500);await swipe(p,true,-200);await p.waitForTimeout(3000);
  await p.tap('#hltv .hl-tap');await p.waitForTimeout(1500);await p.tap('#hltv .hl-tap');await p.waitForTimeout(2500);await swipe(p,true,200);await p.waitForTimeout(3000);
  await p.tap('#hltv [data-hlplay]');await p.waitForTimeout(2500);const v=p.video();await c.close();
  require('child_process').execFileSync('ffmpeg',['-y','-loglevel','error','-i',await v.path(),'-t','32','-an','-c:v','libvpx-vp9','-b:v','500k','-crf','36',PROOF+'/using-game-night-tv.webm'])}
await b.close();
console.log(problems?`FAIL ${problems} of ${checks} checks`:`PASS ${checks} checks`);process.exit(problems?1:0)})();
