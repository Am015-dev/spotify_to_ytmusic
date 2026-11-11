// node pa_test.js WxH -> PerfHUD (?fps=1, F9, Test speed + Apply, auto step-down, idle saver) and real audio (GA decode + events) in Sands of Qamar
// env PW=playwright path. Screenshots in ../perf/shots/ft_*.png
const {chromium}=require(process.env.PW);const [W,H]=(process.argv[2]||'1366x768').split('x').map(Number);const OUT=__dirname+'/../perf/shots';
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--autoplay-policy=no-user-gesture-required']});
const ctx=await b.newContext({viewport:{width:W,height:H}});const p=await ctx.newPage();p.setDefaultTimeout(120000);const errs=[];
p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>m.type()==='error'&&!/CERT|net::|fonts/.test(m.text())&&errs.push(m.text()));
const tag=W+'x'+H,log=(...a)=>console.log(tag,...a),narrow=W<761;
await p.goto('file://'+__dirname+'/sands.html?fps=1');await p.waitForTimeout(900);
log('fps=1 overlay',await p.evaluate(()=>{const h=document.getElementById('perfhud');return !!h&&!h.hidden&&PerfHUD.shown}));
await p.evaluate(()=>{try{localStorage.clear()}catch(e){}setSeed(7);AIDELAY=250;window.__sfxLog=[]});
await p.click('[data-ui=play]');await p.waitForTimeout(300);await p.click('[data-ui=start]');await p.waitForTimeout(1200);
// real audio: the clicks above were user gestures, so GA unlocked and decodes
await p.waitForTimeout(2500);log('GA after gesture',JSON.stringify(await p.evaluate(()=>GA.state())));
// play: the human seat moves through go() (the same path as its buttons), the computer through its own timer
const t0=Date.now();let turns=0;while(Date.now()-t0<25000){const r=await p.evaluate(()=>{if(!G||G.over)return 'over';const s=sideToAct();if(s>=0&&P(s).human&&!UI.modal){const m=aiMove(s);if(m){go(m);return 'h'}}return '-'});if(r==='over')break;if(r==='h')turns++;await p.waitForTimeout(400)}
const au=await p.evaluate(()=>({st:GA.state(),log:window.__sfxLog.slice(),round:G.round,map:SND_MAP}));
const fired={};for(const e of au.log){fired[e]=(fired[e]||0)+1}
log('played human moves',turns,'round',au.round,'events',JSON.stringify(fired));
log('GA state after play',JSON.stringify(au.st));
const evs=[...new Set(au.log.map(x=>x.split(':')[0]))];log('event check',evs.map(e=>e+'->'+(au.map[e]&&au.map[e].s?'sample '+au.map[e].s:'synth')).join(', '));
// sound toggles drive GA and persist
await p.evaluate(()=>{toggleMusic()});const m1=await p.evaluate(()=>({ga:GA.state().music,playing:GA.playing(),ls:localStorage.getItem('soq_mus')}));
await p.evaluate(()=>{toggleMusic()});await p.waitForTimeout(300);const m2=await p.evaluate(()=>({ga:GA.state().music,playing:GA.playing(),ls:localStorage.getItem('soq_mus')}));
await p.evaluate(()=>{toggleSound()});const s1=await p.evaluate(()=>({ga:GA.state().sfx,ls:localStorage.getItem('soq_snd'),played:(sfx('coins'),window.__sfxLog.slice(-1)[0])}));await p.evaluate(()=>{toggleSound()});
log('music off',JSON.stringify(m1),'music on',JSON.stringify(m2),'sound off',JSON.stringify(s1));
// pause the computer so the board settles, then the auto step-down (Auto on SwiftShader)
await p.evaluate(()=>{UI.pause=true});const seen=[];const ta=Date.now();
for(let i=0;i<30;i++){await p.mouse.move(W/2+(i%2)*10,H/3);await p.waitForTimeout(1000);const s=await p.evaluate(()=>({q:GFX.q,pr:V3.r.getPixelRatio(),cap:PerfHUD.stats().prCap}));const k=s.q+'@'+s.pr;if(seen[seen.length-1]!==k)seen.push(k);if(s.q==='low'&&i>8)break}
log('auto steps',seen.join(' -> '),'in',((Date.now()-ta)/1000).toFixed(0)+'s',JSON.stringify(await p.evaluate(()=>PerfHUD.log.slice(-6))));
// F9 hides and shows
await p.keyboard.press('F9');await p.waitForTimeout(200);const f1=await p.evaluate(()=>PerfHUD.shown);await p.keyboard.press('F9');await p.waitForTimeout(600);const f2=await p.evaluate(()=>PerfHUD.shown&&!document.getElementById('perfhud').hidden);
log('F9 off',!f1,'F9 on',f2);await p.screenshot({path:`${OUT}/ft_${tag}_hud.png`});
// the buttons sit next to Graphics: Settings drawer (desktop) and the ☰ menu (phones)
if(narrow){await p.click('.nar-show[data-gx=menud]');await p.waitForTimeout(300);log('menu has buttons',await p.evaluate(()=>!!document.querySelector('#menud [data-perfhud=show]')&&!!document.querySelector('#menud [data-perfhud=test]')));await p.screenshot({path:`${OUT}/ft_${tag}_menu.png`});await p.click('#menud [data-gx=setd]')}
else await p.click('[data-gx=setd]');
await p.waitForTimeout(300);log('settings has buttons',await p.evaluate(()=>[...document.querySelectorAll('#setd [data-perfhud]')].map(b=>b.textContent).join('|')));await p.screenshot({path:`${OUT}/ft_${tag}_settings.png`});
const tt=Date.now();await p.click('#setd [data-perfhud=test]');await p.waitForSelector('.phud-card',{timeout:120000});
log('test took',((Date.now()-tt)/1000).toFixed(1)+'s',JSON.stringify(await p.evaluate(()=>PerfHUD.lastTest)),'level after',await p.evaluate(()=>GFX.q+' pref '+GFX.pref));
await p.screenshot({path:`${OUT}/ft_${tag}_card.png`});
await p.click('.phud-card [data-ph=copy]');await p.waitForTimeout(400);log('copy',await p.evaluate(()=>{const t=document.querySelector('.phud-card textarea');return t?'textarea selected '+(t.selectionEnd-t.selectionStart)+'/'+t.value.length:document.querySelector('.phud-card [data-ph=copy]').textContent}));
await p.click('.phud-card [data-ph=apply]');await p.waitForTimeout(600);log('after apply',await p.evaluate(()=>GFX.q+' pref '+GFX.pref+' saved '+localStorage.getItem('soq_gfx')+' auto '+PerfHUD.stats().auto));
// idle saver
await p.evaluate(()=>{if(GX.open)GX.close()});await p.waitForTimeout(4500);
const id1=await p.evaluate(()=>new Promise(r=>{const d0=PerfHUD.stats().drawn;setTimeout(()=>r({idle:PerfHUD.idling,busy:V3.busy,drawnPerSec:PerfHUD.stats().drawn-d0}),1000)}));
await p.mouse.move(W/3,H/3);await p.mouse.move(W/3+20,H/3+10);await p.waitForTimeout(150);const id2=await p.evaluate(()=>PerfHUD.idling);
log('idle',JSON.stringify(id1),'after pointer move idle=',id2);
log('errors',errs.length,JSON.stringify(errs.slice(0,5)));await b.close()})();
