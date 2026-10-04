// tAU.js · audio + polish tests (tag AU). usage: node tAU.js   (server from ./setup.sh on :8766, page local_dbg.html)
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const F=require('./fast.js');const fs=require('fs');
const U='http://127.0.0.1:8766/local_dbg.html';fs.mkdirSync(__dirname+'/shots',{recursive:true});
let fails=0,n=0;const ok=(c,m,i)=>{n++;console.log((c?'PASS ':'FAIL ')+m+(i!==undefined?' · '+JSON.stringify(i):''));if(!c)fails++};
async function page(b,vp,mobile){const ctx=await b.newContext(mobile?{viewport:vp,deviceScaleFactor:2,isMobile:true,hasTouch:true}:{viewport:vp});const p=await ctx.newPage();p.setDefaultTimeout(900000);p.errs=[];
  p.on('pageerror',e=>p.errs.push(e.message.slice(0,160)));p.on('console',m=>{if(m.type()==='error')p.errs.push(m.text().slice(0,160))});await p.goto(U);await p.waitForFunction(()=>window.__mho&&__mho.state==='menu');return p}
const seed=(p,city,d)=>p.evaluate(([c,d])=>{localStorage.clear();localStorage.setItem('mho_slot','1');localStorage.setItem('mho_city@1',c);if(d)localStorage.setItem('mho_athd@1',d);localStorage.setItem('mho_roam'+(c==='ath'?'.ath':'')+'@1','{"tut":1,"otg":{}}')},[city,d]);
async function roam(p){await p.evaluate(()=>__mho.enterRoam());await p.waitForFunction(()=>__mho.state==='roam',null,{polling:300});await F.on(p);await p.evaluate(()=>{try{__mho.storyClose()}catch(e){}try{__m1.skip()}catch(e){}__mho.roamSim(30)})}
const buses=p=>p.evaluate(()=>{const M=__au.M;return{cur:M.cur,duck:+M.duck.gain.value.toFixed(2),...Object.fromEntries(Object.entries(M.bus).map(([k,v])=>[k,+v.gain.value.toFixed(2)]))}});
const only=(g,k)=>g[k]>.8&&['fra','ath','race','mission','cut'].every(j=>j===k||g[j]<.1);
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const T0=Date.now();
 // 1 · AudioContext on the first gesture, then the music state machine through the crossfade
 {const p=await page(b,{width:1280,height:720});await F.on(p);await seed(p,'fra');
  const before=await p.evaluate(()=>__au.AU.a===null);await p.keyboard.press('Shift');const after=await p.evaluate(()=>!!__au.AU.a&&__au.AU.a.constructor.name);
  ok(before&&!!after,'AudioContext is created on the first gesture (keydown), not before',{before,after});
  await roam(p);await p.waitForTimeout(2500);let g=await buses(p);ok(only(g,'fra'),'roam (Frankfurt): city theme bus up, others silent',g);
  const r=await p.evaluate(()=>{__mho.startRace();return __mho.state});await p.waitForTimeout(2500);g=await buses(p);ok(only(g,'race'),'race: crossfades to the drum and bass bus',{st:r,...g});
  await p.evaluate(()=>__mho.enterRoam());await p.waitForFunction(()=>__mho.state==='roam',null,{polling:300});await p.evaluate(()=>{try{__mho.storyClose()}catch(e){}__mho.roamSim(10)});
  const ms=await p.evaluate(()=>{const ok=__m1.start('heist');for(let i=0;i<20&&__m1.cs();i++)__m1.skip();__mho.roamSim(120);const RO=__au.RO;return{ok,ch:!!RO.ch,kind:RO.ch&&RO.ch.kind,goons:__m1.goons().length}});
  await p.waitForTimeout(2500);g=await buses(p);ok(ms.ch&&only(g,'mission'),'mission: crossfades to the tension bus',{...ms,...g,int:await p.evaluate(()=>__au.M.int)});
  await p.evaluate(()=>__au.scene({lines:[['HILDE','Sound check.']],dur:60}));await p.waitForTimeout(2500);g=await buses(p);
  ok(only(g,'cut'),'cutscene: crossfades to the cutscene bus (stinger on entry)',g);ok(g.duck<.4,'music ducks under dialogue',{duck:g.duck});
  await p.evaluate(()=>{__mho.roamSim(1);__au.csEnd()});await p.waitForTimeout(1200);g=await buses(p);ok(g.duck>.9,'duck releases after the dialogue',{duck:g.duck});
  await p.evaluate(()=>{__au.pop('TAKEDOWN!','#ff2d55')});await F.shot(p,'shots/au_takedown.png');await p.evaluate(()=>{__au.confetti()});await p.waitForTimeout(900);await F.shot(p,'shots/au_confetti.png');
  // 5 min of sim (keyboard bot: throttle, steer, drift, boost) while the scheduler keeps playing: live audio sources must stay flat
  const samp=[];for(let i=0;i<60;i++){await p.evaluate(i=>{const K=__mho.K;K.ArrowUp=true;K.ArrowLeft=i%6<2;K.ArrowRight=i%6===3;K.KeyX=i%5===1;K.ShiftLeft=i%7===2;__mho.roamSim(300)},i);await p.waitForTimeout(150);samp.push(await p.evaluate(()=>__au.M.live))}
  await p.evaluate(()=>{const K=__mho.K;K.ArrowUp=K.ArrowLeft=K.ArrowRight=K.KeyX=K.ShiftLeft=false});
  const a=samp.slice(5,15),z=samp.slice(-10),avg=x=>x.reduce((s,v)=>s+v,0)/x.length;
  ok(Math.max(...samp)<160&&avg(z)<avg(a)*1.5+15,'5 min sim: live audio sources stay bounded (no leak)',{early:+avg(a).toFixed(1),late:+avg(z).toFixed(1),max:Math.max(...samp),made:await p.evaluate(()=>__au.M.made)});
  ok(!p.errs.length,'no page errors (desktop)',p.errs.slice(0,4));await p.context().close()}
 // 2 · volume sliders persist across reloads
 {const p=await page(b,{width:1280,height:720});await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForFunction(()=>window.__mho&&__mho.state==='menu');
  await p.evaluate(()=>{__au.openSettings();const L=[...document.querySelectorAll('#setBody label.sl')],f=n=>L.find(l=>l.querySelector('span').textContent===n).querySelector('input');const m=f('Music'),e=f('Effects');m.value='0.3';m.dispatchEvent(new Event('input'));e.value='0.45';e.dispatchEvent(new Event('input'))});
  await p.reload();await p.waitForFunction(()=>window.__mho&&__mho.state==='menu');await p.keyboard.press('Shift');
  const r=await p.evaluate(()=>{__au.openSettings();const L=[...document.querySelectorAll('#setBody label.sl')],f=n=>+L.find(l=>l.querySelector('span').textContent===n).querySelector('input').value;return{mus:__au.SET.mus,sfx:__au.SET.sfx,ui:[f('Music'),f('Effects')],busMus:+__au.AU.mus.gain.value.toFixed(3)}});
  ok(r.mus===.3&&r.sfx===.45&&r.ui[0]===.3&&r.ui[1]===.45&&Math.abs(r.busMus-.078)<.01,'Music / Effects sliders persist after reload and drive the buses',r);await p.context().close()}
 // 3 · portrait hint: shown once per device, auto-hides in ~3 s, never over #m1Next / minimap / map
 {const p=await page(b,{width:390,height:844},true);await seed(p,'fra');await p.reload();await p.waitForFunction(()=>window.__mho&&__mho.state==='menu');await roam(p);
  const r=await p.evaluate(async()=>{const hit=(a,b)=>Math.min(a.right,b.right)-Math.max(a.left,b.left)>0&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>0,vis=e=>e&&!e.hidden&&e.offsetWidth>0&&getComputedStyle(e).display!=='none';
    let seen=0,ov=[],first=null,last=null;const t0=performance.now();
    while(performance.now()-t0<4500){const h=document.getElementById('rotateHint');if(vis(h)&&+getComputedStyle(h).opacity>.05){const r=h.getBoundingClientRect(),now=performance.now()-t0;seen++;first=first??now;last=now;
        for(const id of['m1Next','roamMini','roamMap']){const o=document.getElementById(id);if(vis(o)&&hit(r,o.getBoundingClientRect()))ov.push(id)}}
      if(performance.now()-t0>1200&&!window.__mapT){window.__mapT=1}
      await new Promise(r=>setTimeout(r,100))}return{seen,ov:[...new Set(ov)],first:first&&Math.round(first),last:last&&Math.round(last),ok:document.body.classList.contains('portraitOk')}});
  ok(r.seen>0&&!r.ov.length&&r.last<3600&&r.ok,'portrait hint: visible briefly, gone within ~3 s, never over NEXT bar / minimap / map',r);await F.shot(p,'shots/au_portrait.png');
  await p.reload();await p.waitForFunction(()=>window.__mho&&__mho.state==='menu');await roam(p);await p.waitForTimeout(600);
  const again=await p.evaluate(()=>{const h=document.getElementById('rotateHint');return!!h&&h.offsetWidth>0&&getComputedStyle(h).display!=='none'});ok(!again,'portrait hint: not shown again on the same device');
  // open the map while it would be showing: it must hide
  await p.evaluate(()=>{localStorage.removeItem('mho_portok')});await p.reload();await p.waitForFunction(()=>window.__mho&&__mho.state==='menu');await roam(p);
  const m=await p.evaluate(async()=>{__mho.toggleMap(true);await new Promise(r=>setTimeout(r,400));const h=document.getElementById('rotateHint');const v=!!h&&h.offsetWidth>0&&getComputedStyle(h).display!=='none';__mho.toggleMap(false);return v});
  ok(!m,'portrait hint hides as soon as the map opens');ok(!p.errs.length,'no page errors (phone)',p.errs.slice(0,4));await p.context().close()}
 // 4 · English UI text: scanned list of former German / Greek strings must be gone; Athens plate reads "Chapter 1 · Welcome to Athens"
 {const src=fs.readFileSync(__dirname+'/local_dbg.html','utf8');
  const BAN=['Kefalaio','Kalos irthes','Ta stena tis','TELOS TOU CHARTI','ENDE DER KARTE',"'Kapitel'",'Neu in Mainhattan','Die Hafenbande','Kaisers Schatten','Das Finale','Los geht','BAUSTELLE',"'Feierabend'","'Rushhour'",'Brücke gesperrt','Letzte Bahn','Takedown-Rausch','Nachtfinale','Hügel Cup','Brückensprint',
   'Landeanflug','Hinauf in den','Ankunft im','Einfahrt nach','Über die Felder','Einlaufen in','Kräne am','Durch den Stadtwald',"'Zubringer",'Danke','Wunderbar','Ach nein','Ach,','Ach!','Efcharist','Siga siga','Ela!','yiayia drives','Astynomia','Polizei Frankfurt','Kalimera','Opa!','OPA!',"'Umland'","fb:['Athina'"];
  const left=BAN.filter(w=>src.includes(w));ok(!left.length,`non-English UI strings: ${BAN.length} scanned, none left`,left);
  const p=await page(b,{width:1280,height:720});await seed(p,'ath','A');await p.reload();await p.waitForFunction(()=>window.__mho&&__mho.state==='menu');await roam(p);await p.evaluate(()=>__mho.roamSim(60));
  const t=await p.evaluate(()=>({sub:document.querySelector('#roamPlate small').textContent,}));
  ok(t.sub==='Chapter 1 · Welcome to Athens','Athens plate subtitle is English',t);
  const g=await (async()=>{await p.keyboard.press('Shift');await p.waitForTimeout(2000);return buses(p)})();ok(only(g,'ath'),'roam (Athens): bouzouki theme bus up',g);
  ok(!p.errs.length,'no page errors (Athens)',p.errs.slice(0,4));await p.context().close()}
 console.log(`${fails?'tAU FAILED '+fails:'tAU PASS'} · ${n-fails}/${n} · ${Math.round((Date.now()-T0)/1000)} s`);await b.close();process.exit(fails?1:0)})();
