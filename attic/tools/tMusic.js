// tMusic.js (fix21) — music player + AUDIO tab check with real taps. modes: menu (menu+tab+mute+garage+race) | roam (fra then ath) | missing (race with music/race.mp3 hidden)
// usage: node tools/tMusic.js <url> <outdir> menu|roam|missing
// (helpers copied from tBoostFx.js)
// — boost visuals check (fix21). Phone 852×393 touch, normal build (no ?fast=1: fast mode hides particles).
// RACE: taps RACE → circuit → START RACE, holds GAS, taps BOOST (#tN) with real touch, shots at +0.15/+0.5/+1.2/+2.6 s of boost
// (2.6 s = Brickbash) + a low side shot of the player car while boosting. ROAM: STORY → new game, holds GAS, holds BOOST, same shots.
// Logs the FX numbers per shot: live SPARK particles (count / max size / max distance from the car), thruster scale + world offset.
// usage: node tools/tBoostFx.js <url local_dbg.html> <outdir> race|roam|tab   env TRACK=grand CITY=fra TAG=prefix
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');const path=require('path');
const URL=process.argv[2]||'http://127.0.0.1:8766/local_dbg.html',OUT=process.argv[3]||'qa21',MODE=process.argv[4]||'race',TRACK=process.env.TRACK||'grand',CITY=process.env.CITY||'fra',TAG=process.env.TAG||'';fs.mkdirSync(OUT,{recursive:true});
const INIT=`(()=>{const q=[];let t=0;window.__auto=true;window.requestAnimationFrame=cb=>{q.push(cb);return q.length};window.cancelAnimationFrame=()=>{};
 window.__tick=n=>{for(let i=0;i<n;i++){t+=1000/60;const c=q.splice(0);for(const f of c){try{f(t)}catch(e){setTimeout(()=>{throw e})}}}return t};
 setInterval(()=>{if(window.__dbg&&!window.__noR&&!window.__shooting){window.__noR=__dbg.composer.render;__dbg.composer.render=()=>{}}if(window.__auto)window.__tick(1)},16)})();`;
// FX probe: sparks alive near the player car, thruster group, camera fov

(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const ctx=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:1,isMobile:true,hasTouch:true});
 const p=await ctx.newPage();p.setDefaultTimeout(900000);const errs=[],net=[];p.on('pageerror',e=>errs.push(e.message.slice(0,200)));p.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text().slice(0,200))});
 p.on('request',r=>{if(/music\//.test(r.url()))net.push(r.url().replace(/.*music\//,''))});
 await p.addInitScript(INIT);const cdp=await ctx.newCDPSession(p);
 let SYN=Date.now()/1000;{const s0=cdp.send.bind(cdp);cdp.send=(m,o)=>s0(m,m==='Input.dispatchTouchEvent'?{...o,timestamp:SYN}:o)}
 const tick=n=>{SYN+=n/60;return p.evaluate(n=>__tick(n),n)};
 const F={};const pts=()=>Object.values(F).map(f=>({x:f.x,y:f.y,id:f.id,radiusX:6,radiusY:6,force:1}));
 const center=sel=>p.evaluate(s=>{const e=document.querySelector(s);if(!e)return null;const r=e.getBoundingClientRect();const cs=getComputedStyle(e);if(r.width<4||cs.display==='none'||cs.visibility==='hidden')return null;for(let a=e;a;a=a.parentElement)if(a.hidden)return null;return[r.left+r.width/2,r.top+r.height/2]},sel);
 const down=async(name,xy)=>{if(!xy)return false;let id=0;while(Object.values(F).some(o=>o.id===id))id++;F[name]={x:xy[0],y:xy[1],id};await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:pts()});return true};
 const up=async name=>{if(!F[name])return;delete F[name];const P=pts();await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});if(P.length){SYN+=.44;await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:P})}};
 const tapXY=async xy=>{if(!xy)return false;await down('tap',xy);await tick(4);await up('tap');await tick(2);return true};
 const tap=async sel=>tapXY(await center(sel));
 const wait=ms=>p.waitForTimeout(ms);const LOG=[];
 const st=async(label)=>{const o=await p.evaluate(()=>({mus:window.__mus.st(),state:__mho.state,master:__oc.ev('AU.a?+AU.m.gain.value.toFixed(3):null'),fx:__oc.ev('AU.a?+AU.fx.gain.value.toFixed(3):null'),synth:__oc.ev('AU.a?+AU.mus.gain.value.toFixed(3):null')}));LOG.push({label,...o});console.log('ST',label,JSON.stringify(o));return o};
 const shot=async name=>{await p.evaluate(()=>{window.__shooting=1;if(window.__noR){__dbg.composer.render=window.__noR;window.__noR=null}});await tick(1);await p.screenshot({path:path.join(OUT,name+'.jpg'),type:'jpeg',quality:80});await p.evaluate(()=>{window.__shooting=0;if(!window.__noR){window.__noR=__dbg.composer.render;__dbg.composer.render=()=>{}}})};
 const startRace=async()=>{await p.evaluate(()=>{localStorage.setItem('mho_prof@1',JSON.stringify({xp:40000}))});await tap('[data-a="quick"]');await wait(300);await tick(10);
  await tapXY(await p.evaluate(()=>{const e=[...document.querySelectorAll('[data-c]')].find(x=>x.dataset.c==='fra'&&x.offsetParent);if(!e)return null;const r=e.getBoundingClientRect();return[r.left+r.width/2,r.top+r.height/2]}));await tick(10);
  const sb=await p.evaluate(()=>{const e=document.querySelector('#startBtn');e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return[r.left+r.width/2,r.top+r.height/2]});await tapXY(sb);
  for(let i=0;i<300;i++){const s=await p.evaluate(()=>__mho.state);if(s==='race')break;await tick(15)}};
 const MODE2=MODE;
 await p.goto(URL);await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:500});
 if(MODE2==='menu'){
  await wait(1500);await st('menu_before_tap');
  await tapXY([426,8]);await wait(3500);await st('menu_after_tap');
  await tap('#tuG');await tick(4);await p.evaluate(()=>{const b=[...document.querySelectorAll('#tuD [data-g]')].find(x=>x.dataset.g==='Audio');if(b)b.click()});await tick(4);await shot('audio_tab');
  await p.evaluate(()=>document.querySelector('#tuD input[data-k="TUNE.musOn"]').click());await wait(1500);await st('music_off');
  await p.evaluate(()=>document.querySelector('#tuD input[data-k="TUNE.musOn"]').click());await wait(2500);await st('music_on');
  await p.evaluate(()=>{const sl=document.querySelector('#tuD input[data-k="TUNE.musVol"]');sl.value=.2;sl.dispatchEvent(new Event('input',{bubbles:true}))});await wait(1500);await st('music_vol_0.2');
  await p.evaluate(()=>{const sl=document.querySelector('#tuD input[data-k="TUNE.sfxVol"]');sl.value=.5;sl.dispatchEvent(new Event('input',{bubbles:true}))});await wait(800);await st('sfx_0.5');await shot('audio_tab_changed');
  await p.evaluate(()=>{for(const [k,v] of [['TUNE.musVol',.5],['TUNE.sfxVol',1]])__tune.set(k,v)});await tap('#tuG');await tick(4);
  await tap('#muteBtn');await wait(1200);await st('sound_off');await shot('menu_sound_off');await tap('#muteBtn');await wait(1200);await st('sound_on');
  await tap('#gbMenuBtn');await tick(30);await wait(3500);await st('garage');await shot('garage');
  await p.keyboard.press('Escape');await tick(30);await wait(2500);await st('garage_closed');
  await startRace();await down('gas',await center('#tG'));await tick(120);await wait(3500);await st('race');await shot('race');
  await down('boost',await center('#tN'));await tick(6);await wait(300);await st('race_boost_duck');await up('boost');
 }else if(MODE2==='missing'){
  await tapXY([426,8]);await wait(3000);await st('menu');await startRace();await down('gas',await center('#tG'));await tick(120);await wait(3500);await st('race_missing_file');
 }else{
  for(const city of['fra','ath']){
   await p.evaluate(([c])=>{localStorage.clear();localStorage.setItem('mho_slot','1');if(c==='ath'){localStorage.setItem('mho_city@1',c);localStorage.setItem('mho_athd@1','A');localStorage.setItem('mho_roam.ath@1','{"otg":{}}');localStorage.setItem('mho_story.ath@1','{"seen":1}')}},[city]);
   await p.reload();await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:500});
   await tapXY([426,8]);await wait(2500);await st(city+'_menu');
   await tap('#hcStory');await tick(10);await tap('#slotList .go');
   for(let i=0;i<150;i++){try{if(await p.evaluate(()=>window.__mho&&__mho.state==='roam'))break;await wait(2000)}catch(e){await wait(2000)}}
   await wait(1500);
   // the page reloads for Athens (CONTINUE) and the first tap must happen again
   if(!(await p.evaluate(()=>window.__mus.st().unlocked))){await tapXY([426,8]);}
   await wait(4000);await st(city+'_roam');await shot(city+'_roam');}
 }
 fs.writeFileSync(path.join(OUT,'music_'+MODE2+'.json'),JSON.stringify({LOG,mlog:await p.evaluate(()=>window.__mus.log),net:[...new Set(net)],errs},null,1));
 console.log('NET',JSON.stringify([...new Set(net)]));console.log('ERR',JSON.stringify(errs.slice(0,8)));await b.close()})().catch(e=>{console.error('FAIL',e);process.exit(1)});
