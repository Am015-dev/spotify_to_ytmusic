// tHome.js — v90k Home + nitro gate, real input (CDP touch / keys). Per city: start HUD (sports car, BOOST shown) → pause → 🏠 HOME (fast travel)
// → reverse into the Home beacon with BRAKE → "SAVED" toast + garage card → open the garage → pick the Post Van (tap its card) → close
// → van HUD (no BOOST) + the Hot Rod parked at Home → garage again → INSTALL NITRO KIT → van HUD with BOOST → reload → CONTINUE → restored.
// Setup only (not gameplay): studs for the kit are granted with season(). Shots: <out>/<city>_N_name.jpg (852×393 phone).
// usage: node tools/tHome.js <url> [outdir]   env CITIES=fra,ath
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');const path=require('path');
const URL=process.argv[2]||'http://127.0.0.1:8766/local_dbg.html?fast=1',OUT=process.argv[3]||'qa_home';fs.mkdirSync(OUT,{recursive:true});
const CITIES=(process.env.CITIES||'fra,ath').split(',');
let fails=0;const ok=(c,m,i)=>{console.log((c?'PASS ':'FAIL ')+m+(i!==undefined?' · '+JSON.stringify(i):''));if(!c)fails++};
const INIT=`(()=>{const q=[];let t=0;window.__auto=true;window.requestAnimationFrame=cb=>{q.push(cb);return q.length};window.cancelAnimationFrame=()=>{};
 window.__tick=n=>{for(let i=0;i<n;i++){t+=1000/60;const c=q.splice(0);for(const f of c){try{f(t)}catch(e){setTimeout(()=>{throw e})}}
  if(window.__auto&&window.__fast&&window.__mho&&__mho.state==='roam'&&!(__mho.LD&&__mho.LD.on)){window.__auto=false;break}}return t};
 setInterval(()=>{if(window.__dbg&&!window.__fastR&&!window.__shooting){window.__fastR=__dbg.composer.render;__dbg.composer.render=()=>{}}if(window.__auto)window.__tick(1)},16)})();`;
async function run(b,city){const vp={width:852,height:393};const tag=city;
 const ctx=await b.newContext({viewport:vp,deviceScaleFactor:2,isMobile:true,hasTouch:true});const p=await ctx.newPage();p.setDefaultTimeout(900000);
 const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,200)));p.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text().slice(0,200));if(/HM/.test(m.text()))console.log('  page:',m.text().slice(0,200))});
 await ctx.addInitScript(INIT);const cdp=await ctx.newCDPSession(p);
 await p.goto(URL);await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:500});
 await p.evaluate(([c])=>{localStorage.clear();localStorage.setItem('mho_slot','1');/* a returning player: the Frankfurt intro (HOT DROP, replays on load while unfinished) is not the subject here */localStorage.setItem('mho_m1@1','{"v":1,"step":0,"fresh":0,"done":{},"wpn":0}');if(c==='ath'){localStorage.setItem('mho_city@1',c);localStorage.setItem('mho_athd@1','A');localStorage.setItem('mho_roam.ath@1','{"otg":{}}');localStorage.setItem('mho_story.ath@1','{"seen":1}')}},[city]);
 await p.goto(URL);await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:500});
 const G=p,tick=n=>G.evaluate(n=>__tick(n),n),ev=s=>G.evaluate(s=>__oc.ev(s),s);
 const shot=async name=>{await G.evaluate(()=>{window.__shooting=1;if(window.__fastR){__dbg.composer.render=window.__fastR;window.__fastR=null}__tick(2)});const f=path.join(OUT,`${tag}_${name}.jpg`);await p.screenshot({path:f,type:'jpeg',quality:72});
  await G.evaluate(()=>{window.__shooting=0;if(!window.__fastR){window.__fastR=__dbg.composer.render;__dbg.composer.render=()=>{}}});return f};
 const F={};const pts=()=>Object.values(F).map(f=>({x:f.x,y:f.y,id:f.id,radiusX:6,radiusY:6,force:1}));
 const center=sel=>G.evaluate(s=>{const e=document.querySelector(s);if(!e)return null;const r=e.getBoundingClientRect();const cs=getComputedStyle(e);if(r.width<4||cs.display==='none'||cs.visibility==='hidden')return null;for(let a=e;a;a=a.parentElement)if(a.hidden)return null;return[r.left+r.width/2,r.top+r.height/2]},sel);
 const down=async(name,xy)=>{if(!xy)return false;if(F[name])await up(name);let id=0;while(Object.values(F).some(o=>o.id===id))id++;F[name]={x:xy[0],y:xy[1],id};await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:pts()});return true};
 const up=async name=>{if(!F[name])return;delete F[name];const P=pts();await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});if(P.length){await p.waitForTimeout(60);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:P})}};
 const tap=async sel=>{const xy=await center(sel);if(!xy)return false;await down('tap',xy);await tick(4);await up('tap');await tick(4);return true};
 const CONT=['#storyGo','#m1Cs','#rcGo','#ogRetryB','.m1go','#resBtn','#tutSkip'];const through=async()=>{for(const s of CONT)if(await tap(s))return s;return null};
 const vis=sel=>G.evaluate(s=>{const e=document.querySelector(s);if(!e)return false;for(let a=e;a;a=a.parentElement){if(a.hidden)return false;const c=getComputedStyle(a);if(c.display==='none'||c.visibility==='hidden')return false}const r=e.getBoundingClientRect();return r.width>4&&r.height>4},sel);
 const st=()=>G.evaluate(()=>{const R=__mho.RO,m=__hm.mark();return{x:R.x,z:R.z,v:R.v,h:R.h,card:!!R.card,dHome:m?Math.hypot(m.x-R.x,m.z-R.z):-1,at:__hm.HM.at,saves:__hm.HM.saves||0,ok:__hm.ok(),cur:__hm.cur().id,nb:document.body.classList.contains('hmNoB'),foot:__oc.ev('RO.foot')}});
 const toRoam=async()=>{for(let i=0;i<150;i++){if(await G.evaluate(()=>window.__mho&&__mho.state==='roam'))break;await p.waitForTimeout(2000)}await G.evaluate(()=>{window.__auto=false});for(let i=0;i<30;i++){await tick(30);if(!(await through()))break}await tick(60)};
 await tap('#hcStory');await tick(10);await tap('#slotList .go');await toRoam();
 const calm=async()=>{for(let i=0;i<120;i++){const b=await G.evaluate(()=>!!document.getElementById('g8Sh')||!!(window.__ba&&__ba.st().on));if(!b)return true;await tick(6);await p.waitForTimeout(30)}return false};
 const S=[];const add=async(lab,name)=>{await calm();S.push(lab+'='+await shot(name))};
 const tapTxt=async(scope,re)=>{const xy=await G.evaluate(([sc,r])=>{const b=[...document.querySelectorAll(sc+' button')].find(b=>b.offsetWidth&&new RegExp(r).test(b.textContent));if(!b)return null;const q=b.getBoundingClientRect();return[q.left+q.width/2,q.top+q.height/2]},[scope,re]);if(!xy)return false;await down('tap',xy);await tick(4);await up('tap');await tick(4);return true};
 const closeCard=async()=>{if(await vis('#roamCard')){await tapTxt('#roamCard','LATER|DONE');await tick(20)}return !(await vis('#roamCard'))};
 let s=await st();ok(s.cur==='rod'&&s.ok&&!s.nb&&await vis('#tN'),tag+' start: Hot Rod (sports) has BOOST, button shown',s);
 // drive a few seconds so the start shot is mid-road with the HUD settled
 await down('gas',await center('#tG'));await tick(150);await up('gas');await tick(30);await add('Sports car HUD with BOOST','1_sports_boost');
 // a new save starts in the intro event (Home is hidden during events): abandon it from the pause menu, like a player
 await tap('#tP');await tick(10);if(await vis('#roamPause [data-p="eva"]')){await tap('#roamPause [data-p="eva"]');await tick(20);for(const sel of['#qAbn','.qvYes','#roamCard .go']){if(await vis(sel)){await tap(sel);await tick(20)}}await through();await tick(60)}
 if(await vis('#roamPause'))await tap('#roamPause [data-p="resume"]');await tick(20);
 console.log(tag,'foot after start',JSON.stringify(await st()));
 console.log(tag,'event after abandon',await ev('JSON.stringify({ch:!!RO.ch,sp:!!RO.sp,card:!!RO.card})'));
 // pause → HOME
 await tap('#tP');await tick(10);ok(await vis('#roamPause [data-p="home"]'),tag+' pause menu has 🏠 HOME');await add('Pause menu: 🏠 HOME','2_pause_home');
 await tap('#roamPause [data-p="home"]');for(let i=0;i<60;i++){await tick(10);await p.waitForTimeout(120);const q=await st();if(q.dHome>0&&q.dHome<40&&!(await G.evaluate(()=>__mho.LD&&__mho.LD.on)))break}await tick(60);await through();
 console.log(tag,'after FT',JSON.stringify(await st()));
 s=await st();ok(s.dHome>15&&s.dHome<40,tag+' fast travel lands at Home',{d:+s.dHome.toFixed(1)});
 await add('Home on the minimap (🏠 pin) after fast travel','3_home_minimap');fs.writeFileSync(path.join(OUT,tag+'_mini.json'),JSON.stringify(await G.evaluate(()=>{const r=document.getElementById('roamMini').getBoundingClientRect();return[r.left,r.top,r.width,r.height]})));
 // drive into the beacon: fast travel home leaves the car 26 m out facing it. GAS, then BRAKE to a stop on it (the card needs a stop)
 const goIn=async()=>{let f=0,mv=0;await down('gas',await center('#tG'));let sd=0;const steer=async q=>{const m=await G.evaluate(()=>{const m=__hm.mark();return[m.x,m.z]});let ae=Math.atan2(m[0]-q.x,m[1]-q.z)-q.h;ae=Math.atan2(Math.sin(ae),Math.cos(ae));const w=ae>.13?-1:ae<-.13?1:0;if(w!==sd){if(sd)await up('st');if(w)await down('st',await center(w<0?'#tL':'#tR'));sd=w}};
  while(f<900){await tick(6);f+=6;s=await st();if(s.card||s.dHome<9)break;await steer(s);if(Math.abs(s.v)>1)mv=1;else if(!mv&&f%120===0){await up('gas');await tick(4);await down('gas',await center('#tG'))}}await up('gas');if(sd)await up('st');console.log(tag,'goIn',f,JSON.stringify(s));
  if(Math.abs(s.v)>.6)await down('brk',await center('#tB'));for(let i=0;i<40;i++){await tick(4);s=await st();if(s.card||Math.abs(s.v)<.5)break}await up('brk');for(let i=0;i<60&&!(s=await st()).card;i++)await tick(6);return s};
 let f=0;s=await goIn();
 for(let i=0;i<60&&!(s=await st()).card;i++){await tick(6)}
 s=await st();ok(s.card&&s.saves>=1,tag+' driving into Home = save point (card + save)',s);
 const tst=await G.evaluate(()=>{const e=document.getElementById('hmToast');return e&&e.classList.contains('on')?e.textContent:null});ok(!!tst&&/SAVED/.test(tst),tag+' "Saved" toast',tst);
 const ov=await G.evaluate(()=>{const a=document.getElementById('hmToast').getBoundingClientRect(),c=document.getElementById('roamCard'),b=c&&c.getBoundingClientRect();if(!b||!b.width)return{ov:false};return{ov:!(a.right<b.left||a.left>b.right||a.bottom<b.top||a.top>b.bottom),t:[a.left,a.top,a.right,a.bottom].map(Math.round),c:[b.left,b.top,b.right,b.bottom].map(Math.round)}});ok(!ov.ov,tag+' toast does not overlap the card',ov);
 await add('Drive into Home: SAVED toast','4_home_saved');
 const H1=await G.evaluate(()=>JSON.parse(localStorage.getItem('mho_home@1')||'null'));ok(H1&&H1[city]&&H1.last===city,tag+' mho_home stored',H1);
 // stored cars, a low side view along the façade (camera set for the shot only)
 const camShot=async(lab,name)=>{await G.evaluate(()=>{window.__shooting=1;if(window.__fastR){__dbg.composer.render=window.__fastR;window.__fastR=null}__tick(1);window.__camF=()=>__oc.ev(`(()=>{const Q=__hm.slots();if(!Q.length)return 'noslots';const a=Q[0],b=Q[2],tx=(a[0]+b[0])/2,tz=a[1],gy=groundY(tx,tz);const V=window.__camV??2,m=__hm.mark(),sx=Math.sign(tx-m.x)||1;if(V===0)camera.position.set(tx+3,gy+5.5,tz-10);else if(V===1)camera.position.set(tx+sx*9,gy+8,tz-6);else camera.position.set(tx+sx*7,gy+3.2,tz-3);camera.lookAt(tx,gy+.7,tz);camera.updateMatrixWorld();__dbg.composer.render();return [camera.position.x,camera.position.z].map(Math.round).join(',')})()`);window.__camF()});
  const f2=path.join(OUT,`${tag}_${name}.jpg`);console.log(tag,'camShot',name,await G.evaluate(()=>{const c=document.getElementById('roamCard');if(c)c.style.visibility='hidden';return window.__camF()}));await p.screenshot({path:f2,type:'jpeg',quality:72});await G.evaluate(()=>{const c=document.getElementById('roamCard');if(c)c.style.visibility=''});S.push(lab+'='+f2);await G.evaluate(()=>{window.__shooting=0;if(!window.__fastR){window.__fastR=__dbg.composer.render;__dbg.composer.render=()=>{}}})};
 const pk=await ev('JSON.stringify({n:HM.P.length,ids:HM.P.map(g=>g.userData.hmId),pl:(()=>{const b=HM_box(pl.mesh);return [+(b.max.x-b.min.x).toFixed(2),+(b.max.y-b.min.y).toFixed(2),+(b.max.z-b.min.z).toFixed(2)]})(),y:HM.P.map(g=>{const b=HM_box(g);return [+(b.min.y-groundY(g.position.x,g.position.z)).toFixed(3),+(b.max.x-b.min.x).toFixed(2),+(b.max.y-b.min.y).toFixed(2),+(b.max.z-b.min.z).toFixed(2)]})})');
 const PK=JSON.parse(pk);ok(PK.n>=2,tag+' stored cars parked at Home',PK);ok(PK.y.every(a=>Math.abs(a[0])<=0.05),tag+' parked cars: tyre-to-ground gap ≤ 0.05 m',PK.y.map(a=>a[0]));
 {const f3=path.join(OUT,`${tag}_5b_home_top.jpg`);await G.evaluate(()=>{window.__shooting=1;if(window.__fastR){__dbg.composer.render=window.__fastR;window.__fastR=null}const c=document.getElementById('roamCard');if(c)c.style.visibility='hidden';return __oc.ev(`(()=>{const Q=__hm.slots(),m=__hm.mark(),tx=m.x,tz=(Q[0][1]+m.z)/2,gy=groundY(tx,tz);camera.position.set(tx,gy+38,tz-14);camera.lookAt(tx,gy,tz);camera.updateMatrixWorld();__dbg.composer.render()})()`)});await p.screenshot({path:f3,type:'jpeg',quality:72});S.push('Home from above (door, beacon, parked cars)='+f3);await G.evaluate(()=>{const c=document.getElementById('roamCard');if(c)c.style.visibility='';window.__shooting=0;if(!window.__fastR){window.__fastR=__dbg.composer.render;__dbg.composer.render=()=>{}}})}
 if(process.env.STOP5){fs.writeFileSync(path.join(OUT,tag+'_slots.json'),await ev('JSON.stringify({slots:__hm.slots(),mark:[__hm.mark().x,__hm.mark().z],L:(()=>{const L=LM_BY["Garaz Psyrri"]||LM_BY["Werkstatt Konstablerwache"];return [L.x,L.z]})()})'));for(const v of[0,1,2]){await G.evaluate(v=>{window.__camV=v},v);await camShot('cars','5_cam'+v)}await ctx.close();return S}
 await camShot('Stored cars parked at Home · gap '+Math.max(...PK.y.map(a=>Math.abs(a[0]))).toFixed(3)+' m','5_home_cars');
 // card → garage
 const cardBtns=await G.evaluate(()=>[...document.querySelectorAll('#roamCard button')].filter(b=>b.offsetWidth).map(b=>(b.id||'')+':'+b.textContent.trim().slice(0,30)));console.log(tag,'card buttons',cardBtns);
 const openGar=async()=>{for(const sel of['#roamCard .go','#roamCard button']){if(await tap(sel)){await tick(30);if(await vis('#gbx'))return true}}return vis('#gbx')};
 ok(await openGar(),tag+' garage opens from the Home card');await tick(30);
 const rides=async()=>{for(const sel of['[data-r2m="rides"]','[data-r2="rides"]','#gbx [data-t="veh"]']){if(await vis(sel)){await tap(sel);await tick(20);break}}};await rides();
 await add('Home garage: RIDES (Hot Rod: Nitro built in)','6_garage_rides');
 // pick the Post Van: scroll its card into view, then tap it
 await G.evaluate(()=>{const e=document.querySelector('[data-gc="t_v6651_1"]');e&&e.scrollIntoView({block:'center'})});await tick(10);
 ok(await tap('[data-gc="t_v6651_1"] img'),tag+' tap the Post Van card');await tick(40);ok(!(await G.evaluate(()=>__oc.ev('GB_.bk'))),tag+' card tap stays in RIDES (no BUILD)');
 s=await st();ok(s.cur==='t_v6651_1'&&!s.ok,tag+' Post Van selected, no nitro',s);
 await G.evaluate(()=>{const e=document.querySelector('#gbBody .hmKit');e&&e.scrollIntoView({block:'center'})});await tick(6);
 const kitTxt=await G.evaluate(()=>{const e=document.querySelector('#gbBody .hmKit');return e&&e.textContent});ok(!!kitTxt,tag+' NITRO KIT offered for the van',kitTxt);
 await add('Van stats: Nitro none + NITRO KIT','7_van_kit_offer');
 const closeGar=async()=>{for(const sel of['#gbSave','#gbDone','#gbx .gbX','#gbClose']){if(await vis(sel)){await tap(sel);break}}for(let i=0;i<40;i++){await tick(10);if(!(await vis('#gbx'))&&await G.evaluate(()=>__mho.state==='roam'))break}await tick(30);await through()};
 const gbBtns=await G.evaluate(()=>[...document.querySelectorAll('#gbx button')].filter(b=>b.offsetWidth&&/✕|DONE|DRIVE|CLOSE|BACK/i.test(b.textContent)).map(b=>(b.id||b.className)+':'+b.textContent.trim().slice(0,20)));console.log(tag,'garage close buttons',gbBtns);
 const gty=await ev('JSON.stringify({type:G9C.type,pv:GAR_.pv})');ok(/"car"/.test(gty),tag+' garage stays on STREET for the Post Van',gty);
 await closeGar();ok(!(await vis('#gbx')),tag+' garage closed (SAVE & DRIVE)');await closeCard();s=await st();ok(!s.ok&&s.nb&&!(await vis('#tN')),tag+' van HUD: BOOST button hidden',s);
 const pk2=await ev('JSON.stringify(HM.P.map(g=>g.userData.hmId))');ok(JSON.parse(pk2).includes('rod'),tag+' Hot Rod now parked at Home',pk2);
 // try the boost key on the van: no boost
 await down('gas',await center('#tG'));await p.keyboard.down('Shift');await tick(90);const nb=await ev('JSON.stringify({b:!!RO.boosting,n:!!pl.nitro})');await p.keyboard.up('Shift');await up('gas');ok(!JSON.parse(nb).b,tag+' van: Shift does not boost',nb);
 /* leave the beacon like a player: back out with BRAKE, then GAS (in Athens the garage exit faces the building) */await closeCard();await down('brk',await center('#tB'));await tick(100);await up('brk');await tick(10);await closeCard();
 await down('gas',await center('#tG'));for(let i=0;i<10;i++){await tick(10);if((await st()).v>4)break}await tick(40);await closeCard();await add('Post Van driving: no BOOST button','8_van_no_boost');await up('gas');await down('brk',await center('#tB'));await tick(90);await up('brk');
 await G.evaluate(()=>__oc.ev('HM_build()'));await tick(40);await camShot('Hot Rod parked at Home after the swap','9_home_cars_after');
 // back into the beacon → garage → install the kit (studs granted for the test)
 await G.evaluate(()=>__oc.ev('(()=>{const S=season();S.cr=Math.max(S.cr,5000);saveSeason(S)})()'));
 // pause → HOME again (the garage left the car on the beacon's exit), then drive in
 await tick(200);await tap('#tP');await tick(10);await tap('#roamPause [data-p="home"]');for(let i=0;i<60;i++){await tick(10);await p.waitForTimeout(120);const q=await st();if(q.dHome>0&&q.dHome<40&&!(await G.evaluate(()=>__mho.LD&&__mho.LD.on)))break}await tick(60);await through();s=await goIn();
 ok((s=await st()).card,tag+' back at the Home beacon',s);
 ok(await openGar(),tag+' garage again');await rides();await G.evaluate(()=>{const e=document.querySelector('#gbBody .hmKit');e&&e.scrollIntoView({block:'center'})});await tick(6);
 ok(await tap('#gbBody .hmKit'),tag+' tap INSTALL NITRO KIT');await tick(20);
 const kit=await G.evaluate(()=>JSON.parse(localStorage.getItem('mho_gar@1')||'{}').nk||[]);ok(kit.includes('t_v6651_1'),tag+' kit stored',kit);
 await G.evaluate(()=>{const e=document.querySelector('#gbBody .hmNit');e&&e.scrollIntoView({block:'center'})});await tick(6);
 await add('NITRO KIT installed (ride stats)','10_kit_installed');
 await closeGar();await closeCard();s=await st();ok(s.ok&&!s.nb&&await vis('#tN'),tag+' van with kit: BOOST button back',s);
 await down('gas',await center('#tG'));await tick(120);await down('bst',await center('#tN'));await tick(40);const yb=await ev('JSON.stringify({b:!!RO.boosting})');ok(JSON.parse(yb).b,tag+' van with kit boosts (BOOST held)',yb);
 await add('Post Van with Nitro Kit: BOOST','11_van_kit_boost');await up('bst');await up('gas');
 // reload → continue → restored
 console.log(tag,'saved pos before reload',await G.evaluate(()=>JSON.stringify((JSON.parse(localStorage.getItem('mho_roam@1')||'{}')).pos)));
 const before=await G.evaluate(()=>({gar:JSON.parse(localStorage.getItem('mho_gar@1')||'{}'),home:JSON.parse(localStorage.getItem('mho_home@1')||'null')}));
 await p.reload();await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:500});await tap('#hcStory');await tick(10);await tap('#slotList .go');await toRoam();
 s=await st();const pk3=await ev('JSON.stringify(HM.P.map(g=>g.userData.hmId))');
 ok(s.cur==='t_v6651_1'&&s.ok&&(await G.evaluate(()=>(JSON.parse(localStorage.getItem('mho_gar@1')||'{}').nk||[]).includes('t_v6651_1'))),tag+' reload: van + kit restored',s);
 ok(s.dHome<120,tag+' reload: back at Home',{d:+s.dHome.toFixed(1)});ok(JSON.parse(pk3).includes('rod'),tag+' reload: stored cars restored',pk3);
 await add('Reload: progress restored at Home','12_reload_restored');
 ok(errs.length===0,tag+' 0 console errors',errs.slice(0,6));fs.writeFileSync(path.join(OUT,tag+'_shots.txt'),S.join('\n'));await ctx.close();return S}
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 for(const c of CITIES){try{await run(b,c)}catch(e){console.log('FAIL',c,'crash',e.message.slice(0,400));fails++}}await b.close();console.log(fails?'THOME_FAIL '+fails:'THOME_OK');process.exit(fails?1:0)})();
