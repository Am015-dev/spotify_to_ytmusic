// node pa_test.js WxH -> PerfHUD (?fps=1, F9, Test speed + Apply, auto step-down, idle saver) and real audio (GA decode + events) in Sunglaze
// env PW=playwright path. Screenshots in ../../perf/shots/sgz_*.png
const {chromium}=require(process.env.PW);const [W,H]=(process.argv[2]||'1366x768').split('x').map(Number);const OUT=__dirname+'/../../perf/shots';
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--autoplay-policy=no-user-gesture-required']});
const ctx=await b.newContext({viewport:{width:W,height:H}});const p=await ctx.newPage();p.setDefaultTimeout(150000);const errs=[];
p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>m.type()==='error'&&!/CERT|net::|fonts|ERR_/.test(m.text())&&errs.push(m.text()));
const tag=W+'x'+H,log=(...a)=>console.log(tag,...a);
await p.goto('file://'+__dirname+'/sunglaze.html?fps=1');await p.waitForTimeout(900);
log('fps=1 overlay',await p.evaluate(()=>{const h=document.getElementById('perfhud');return !!h&&!h.hidden&&PerfHUD.shown}));
await p.evaluate(()=>{try{localStorage.clear()}catch(e){}setSeed(11);AIDELAY=250;window.__sfxLog=[]});
await p.click('[data-ui=start]');await p.waitForTimeout(700);await p.click('[data-ui=story-ok]');await p.waitForTimeout(2500);
log('GA after gesture',JSON.stringify(await p.evaluate(()=>GA.state())));
// play: the human seat moves through go() (the same path as its buttons), the computer through its own timer
const t0=Date.now();let turns=0;while(Date.now()-t0<30000){const r=await p.evaluate(()=>{if(!G||G.over)return 'over';const s=sideToAct();if(s>=0&&P(s).human&&!UI.modal){const m=aiMove(s);if(m){go(m);return 'h'}}return '-'});if(r==='over')break;if(r==='h')turns++;await p.waitForTimeout(500)}
const au=await p.evaluate(()=>({st:GA.state(),log:window.__sfxLog.slice(),round:G.round,map:SND_MAP}));
const fired={};for(const e of au.log){fired[e]=(fired[e]||0)+1}
log('played human moves',turns,'round',au.round,'events',JSON.stringify(fired));
log('GA state after play',JSON.stringify(au.st));
const evs=[...new Set(au.log.map(x=>x.split(':')[0]))];log('event check',evs.map(e=>e+'->'+(au.map[e]&&au.map[e].s?'sample '+au.map[e].s:'synth')).join(', '));
await p.evaluate(()=>{toggleMusic()});const m1=await p.evaluate(()=>({ga:GA.state().music,playing:GA.playing(),ls:localStorage.getItem('sgz_mus')}));
await p.evaluate(()=>{toggleMusic()});await p.waitForTimeout(300);const m2=await p.evaluate(()=>({ga:GA.state().music,playing:GA.playing(),ls:localStorage.getItem('sgz_mus')}));
await p.evaluate(()=>{toggleSound()});const s1=await p.evaluate(()=>({ga:GA.state().sfx,ls:localStorage.getItem('sgz_snd'),n:window.__sfxLog.length,after:(sfx('take'),window.__sfxLog.length)}));await p.evaluate(()=>{toggleSound()});
log('music off',JSON.stringify(m1),'music on',JSON.stringify(m2),'sound off',JSON.stringify(s1));
// auto step-down on SwiftShader: keep the table busy (camera glides) so frames are drawn and measured
await p.evaluate(()=>{UI.pause=true});const seen=[];const ta=Date.now();
for(let i=0;i<40;i++){await p.evaluate(i=>{V3.orbit.a=i%2?.3:-.3;fitCam()},i);await p.waitForTimeout(800);const s=await p.evaluate(()=>({q:V3.q,pr:V3.r.getPixelRatio()}));const k=s.q+'@'+s.pr;if(seen[seen.length-1]!==k)seen.push(k);if(s.q==='low'&&i>10)break}
await p.evaluate(()=>{V3.orbit.a=0;fitCam()});
log('auto steps',seen.join(' -> '),'in',((Date.now()-ta)/1000).toFixed(0)+'s',JSON.stringify(await p.evaluate(()=>PerfHUD.log.slice(-6))));
await p.keyboard.press('F9');await p.waitForTimeout(200);const f1=await p.evaluate(()=>PerfHUD.shown);await p.keyboard.press('F9');await p.waitForTimeout(600);const f2=await p.evaluate(()=>PerfHUD.shown&&!document.getElementById('perfhud').hidden);
log('F9 off',!f1,'F9 on',f2);await p.screenshot({path:`${OUT}/sgz_${tag}_hud.png`});
// the buttons sit in the bar next to Graphics (the bar scrolls on phones)
log('bar buttons',await p.evaluate(()=>{const g=document.getElementById('gfxbtn');const n=[];let e=g.nextElementSibling;for(let k=0;k<2;k++){n.push(e.dataset.perfhud+':'+e.textContent);e=e.nextElementSibling}return n.join('|')}));
await p.evaluate(()=>document.querySelector('[data-perfhud=test]').scrollIntoView({inline:'center'}));
const tt=Date.now();await p.click('.gx-bar [data-perfhud=test]');await p.waitForSelector('.phud-card',{timeout:150000});
log('test took',((Date.now()-tt)/1000).toFixed(1)+'s',JSON.stringify(await p.evaluate(()=>PerfHUD.lastTest)),'level after',await p.evaluate(()=>V3.q+' pref '+V3.qPref));
await p.screenshot({path:`${OUT}/sgz_${tag}_card.png`});
await p.click('.phud-card [data-ph=copy]');await p.waitForTimeout(400);log('copy',await p.evaluate(()=>{const t=document.querySelector('.phud-card textarea');return t?'textarea selected '+(t.selectionEnd-t.selectionStart)+'/'+t.value.length:document.querySelector('.phud-card [data-ph=copy]').textContent}));
await p.click('.phud-card [data-ph=apply]');await p.waitForTimeout(600);log('after apply',await p.evaluate(()=>V3.q+' pref '+V3.qPref+' saved '+localStorage.getItem('sgz_gfx')+' auto '+PerfHUD.stats().auto+' button '+document.getElementById('gfxbtn').textContent));
// idle saver ('demand': no frames at all while nothing moves)
await p.waitForTimeout(4500);
const id1=await p.evaluate(()=>new Promise(r=>{const d0=PerfHUD.stats().drawn;setTimeout(()=>r({idle:PerfHUD.idling,busy:V3.busy,drawnPerSec:PerfHUD.stats().drawn-d0}),1000)}));
await p.mouse.move(W/3,H/3);await p.mouse.move(W/3+20,H/3+10);await p.waitForTimeout(150);const id2=await p.evaluate(()=>PerfHUD.idling);
// a computer move while idle wakes it too
await p.waitForTimeout(2500);const id3=await p.evaluate(()=>{const w=PerfHUD.idling;UI.pause=false;schedule();return w});await p.waitForTimeout(1500);const id4=await p.evaluate(()=>({idle:PerfHUD.idling,drawn:PerfHUD.stats().drawn}));
log('idle',JSON.stringify(id1),'after pointer move idle=',id2,'idle before AI move',id3,'after AI move',JSON.stringify(id4));
log('errors',errs.length,JSON.stringify(errs.slice(0,5)));await b.close()})();
