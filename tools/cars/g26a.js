// g26a.js <base url dir> <outdir> [label]: pCAR26a gate (also runs on the unpatched build to reproduce), phone 852x393,
// real CDP touch (env MODES=top,iframe; SKIPROAM / SKIPRACE).
// Double-taps at human intervals (150/220/280/320/340 ms touchstart->touchstart, 5 each), held-first-tap, buffered double-taps
// (cooldown / landing), zero false triggers, feedback DOM + hint chip (patched only), race traffic = 0 + 60 s race, Crash Junction.
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
const [BASE,OUT,LABEL='run']=process.argv.slice(2);fs.mkdirSync(OUT,{recursive:true});
const INIT=`(()=>{window.__tsL=[];addEventListener('touchstart',e=>{for(const t of e.changedTouches)__tsL.push(e.timeStamp)},{capture:true,passive:true});if(!location.search.includes('race'))return;const q=[];let t=0;window.requestAnimationFrame=cb=>{q.push(cb);return q.length};window.cancelAnimationFrame=()=>{};
 window.__tick=n=>{for(let i=0;i<n;i++){t+=1000/60;const c=q.splice(0);for(const f of c){try{f(t)}catch(e){window.__err=String(e)}}}return t};setInterval(()=>{if(window.__dbg&&!window.__fastR){window.__fastR=__dbg.composer.render;__dbg.composer.render=()=>{}}},50)})();`;
const INTERVALS=[150,220,280,320,340];const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const br=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});let fails=0;const res={};
const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fails++};const T0=Date.now(),lg=m=>console.log(((Date.now()-T0)/1000).toFixed(0)+'s '+m);
const open=async(mode,race)=>{const ctx=await br.newContext({viewport:{width:852,height:393},deviceScaleFactor:1,isMobile:true,hasTouch:true});await ctx.addInitScript(INIT);const p=await ctx.newPage();p.setDefaultTimeout(900000);
 const errs=[];p.on('pageerror',e=>{errs.push(e.message.slice(0,200));console.log('ERR',e.message.slice(0,200));fails++});const q=race?'?race':'';
 await p.goto(BASE+'/local_dbg.html');await p.evaluate(()=>{localStorage.clear();localStorage.setItem('mho_slot','1');localStorage.setItem('mho_athpre','1');localStorage.setItem('mho_roam@1',JSON.stringify({tut:1,otg:{}}))});
 if(mode==='iframe'){await p.goto(BASE+'/iframe_dbg.html');if(race)await p.evaluate(()=>{document.getElementById('g').src='local_dbg.html?race'})}else await p.goto(BASE+'/local_dbg.html'+q);
 const F=mode==='iframe'?await (await p.waitForSelector('#g')).contentFrame():p.mainFrame();await F.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:500});
  const cdp=await ctx.newCDPSession(p);const off=mode==='iframe'?await p.evaluate(()=>{const r=document.getElementById('g').getBoundingClientRect();return[r.x,r.y]}):[0,0];
 const ctr=async id=>F.evaluate(id=>{const r=document.getElementById(id).getBoundingClientRect();return[r.x+r.width/2,r.y+r.height/2,r.width]},id).then(a=>[a[0]+off[0],a[1]+off[1],a[2]]);
 const P={};const pt=async(id,tid)=>{if(!P[id])P[id]=await ctr(id);return{x:P[id][0]+(tid%3),y:P[id][1],id:tid}};
 const down=async(pts)=>cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:pts});const up=async(pts=[])=>cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:pts});
 const tap=async(id,hold=60)=>{await down([await pt(id,7)]);await sleep(hold);await up()};
 // double tap with touchstart->touchstart = iv ms
 const dtap=async(id,iv)=>{const a=await pt(id,7);const t0=Date.now();await down([a]);await sleep(Math.min(60,iv-50));await up();const w=iv-(Date.now()-t0);if(w>0)await sleep(w);await down([a]);await sleep(60);await up()};
 // first tap still held, second finger taps the same arrow iv ms later
 const htap=async(id,iv)=>{const a=await pt(id,7),b=await pt(id,8);await down([a]);await sleep(iv);await down([a,b]);await sleep(60);await up([a]);await sleep(80);await up()};
 let si=0;const shot=async(tag)=>{await F.evaluate(()=>{__dbg.SS&&__dbg.SS();try{(window.__fastR||__dbg.composer.render).call(__dbg.composer)}catch(e){}});const f=`${OUT}/${LABEL}_${mode}_${race?'race':'roam'}_${String(si++).padStart(2,'0')}_${tag}.png`;await p.screenshot({path:f});return f};
 const gaps=async()=>F.evaluate(()=>{const L=__tsL.splice(0);return L.length>=2?Math.round(L[L.length-1]-L[L.length-2]):null});
 if(mode==='iframe')await p.focus('#g');
 return{ctx,p,F,cdp,ctr,tap,dtap,htap,shot,gaps,errs,down,up,pt}};
const DOMCHK=`(()=>{const vis=e=>e&&e.getClientRects().length&&getComputedStyle(e).visibility!=='hidden'&&getComputedStyle(e).display!=='none';
 const pop=document.getElementById('crSmPop'),R=pop&&pop.getBoundingClientRect();const over=[];
 if(R)for(const e of document.querySelectorAll('button,.tbtn,#roamMini,#map,#roamTut')){if(e.id==='btnZone'||!vis(e))continue;const r=e.getBoundingClientRect();if(r.width<3)continue;if(R.left<r.right&&R.right>r.left&&R.top<r.bottom&&R.bottom>r.top)over.push(e.id||e.textContent.trim().slice(0,10))}
 const tut=document.getElementById('roamTut');
 return{pop:!!pop&&pop.classList.contains('on')&&+getComputedStyle(pop).opacity>.05,txt:pop&&pop.textContent,rect:R&&[R.left,R.top,R.width,R.height].map(Math.round),fs:pop&&parseFloat(getComputedStyle(pop).fontSize),over,
  flash:[...document.querySelectorAll('#tL.crSmF,#tR.crSmF')].map(e=>e.id),tutHidden:tut?getComputedStyle(tut).visibility==='hidden':null}})()`;
const HINT=`(()=>{const h=document.getElementById('crSmHint');if(!h)return{on:false};const cs=getComputedStyle(h),on=h.classList.contains('on')&&cs.display!=='none';const R=h.getBoundingClientRect(),over=[];
 if(on)for(const e of document.querySelectorAll('button,.tbtn,#roamMini,#map')){if(e.id==='btnZone'||!e.getClientRects().length||getComputedStyle(e).visibility==='hidden')continue;const r=e.getBoundingClientRect();if(r.width<3)continue;if(R.left<r.right&&R.right>r.left&&R.top<r.bottom&&R.bottom>r.top)over.push(e.id||e.textContent.trim().slice(0,10))}
 const a=document.getElementById('tL').getBoundingClientRect();return{on,txt:h.textContent,fs:parseFloat(cs.fontSize),rect:[R.left,R.top,R.width,R.height].map(Math.round),above:R.bottom<=a.top,over,ls:localStorage.getItem('mho_smHint')}})()`;
for(const mode of (process.env.MODES||'top,iframe').split(',')){
 // ================= ROAM =================
 if(!process.env.SKIPROAM){const o=await open(mode,false),{ctx,p,F,dtap,htap,tap,shot,gaps}=o;
 await F.evaluate(()=>{__mho.enterRoam()});await F.waitForFunction(()=>__mho.state==='roam',null,{polling:500});await F.evaluate(()=>__mho.storyClose&&__mho.storyClose());await sleep(2500);
 await F.evaluate(()=>{for(const id of['m1Next','m1Skip']){const b=document.getElementById(id);if(b&&b.getClientRects().length)b.click()}});await sleep(1500);
 await F.evaluate(()=>{window.requestAnimationFrame=()=>0;__ju.autoClose(true)});lg(mode+' roam ready');
 const patched=await F.evaluate(()=>!!window.__crsm);
 const st=n=>F.evaluate(n=>{__ju.step(n);const R=__dbg.RO;return{lg:R.crLgN||0,cd:R.crLgCd||0,air:!!__dbg.PL.air,wk:!!R.wk,acc:window.__crsm?__crsm.S.acc:-1,md:!!(R.card||R.mapOpen||R.story||R.frozen)}},n);
 await st(30);const P0=await F.evaluate(()=>{const R=__dbg.RO;return{x:R.x,z:R.z,h:R.h}});
 const reset=async()=>{await F.evaluate(P0=>{const R=__dbg.RO;Object.assign(R,{x:P0.x,z:P0.z,h:P0.h,vh:P0.h,v:0,vy:0,crLgCd:0,crLg:0});R.y=__dbg.GY(R.x,R.z);__dbg.PL.air=null},P0);await st(3)};
 // hint chip first
 await st(20);await sleep(400);if(patched){const h=await F.evaluate(HINT);console.log('  hint',JSON.stringify(h));ok(h.on&&h.above&&h.over.length===0&&h.fs>=12,`${mode} roam hint chip shown above the arrows, clear of buttons (${h.txt}, ${h.fs}px)`);if(mode==='top')await shot('hint')}
 // warm-up touch (first touch into a fresh frame can stall on hit-testing), then double-taps at human intervals
 await tap('tR');await sleep(900);await st(2);await F.evaluate(()=>{__tsL.length=0});
 const R1={};let all=0,tot=0;
 for(const iv of INTERVALS){let h=0;const g=[];for(let k=0;k<5;k++){let a,b,gp;for(let r=0;r<3;r++){await reset();await sleep(250);const id=k%2?'tL':'tR';a=await st(0);await dtap(id,iv);b=await st(2);gp=await gaps();if(gp!=null&&Math.abs(gp-iv)<=40)break;console.log('  harness: delivered gap',gp,'for',iv,'- retry');if(b.lg>a.lg)await st(70);await sleep(450)}g.push(gp);if(b.lg>a.lg)h++;else console.log('  miss',iv,JSON.stringify({a,b}));
   if(patched&&iv===220&&k===0){await sleep(90);const d=await F.evaluate(DOMCHK);console.log('  fx',JSON.stringify(d));ok(d.pop&&d.flash.length===1&&d.over.length===0&&d.fs>=12,`${mode} roam feedback: arrow flash ${d.flash} + "${d.txt}" clear of buttons/minimap`);if(mode==='top')await shot('smash_pop')}
   await sleep(450)}R1[iv]={hits:h,gaps:g};all+=h;tot+=5}
 console.log('  roam intervals',JSON.stringify(R1));res[`${mode}_roam_iv`]=Object.fromEntries(Object.entries(R1).map(([k,v])=>[k,v.hits+'/5']));
 ok(!patched||all===tot,`${mode} roam double-tap ${all}/${tot} (${INTERVALS.map(i=>i+'ms '+R1[i].hits+'/5').join(', ')})`);
 // first tap still held
 {let h=0;for(let k=0;k<5;k++){await reset();const a=await st(0);await htap(k%2?'tL':'tR',200);const b=await st(2);if(b.lg>a.lg)h++;await sleep(450)}res[`${mode}_roam_held`]=h+'/5';ok(!patched||h===5,`${mode} roam held-first-tap double-tap ${h}/5`)}
 // buffered: during cooldown (0.3 s left) and right before landing
 {let hc=0,hl=0;for(let k=0;k<5;k++){await reset();await F.evaluate(()=>{__dbg.RO.crLgCd=.3});const a=await st(0);await dtap(k%2?'tL':'tR',220);const b=await st(40);if(b.lg>a.lg)hc++;await sleep(450)}
  const land=[];for(let k=0;k<5;k++){await reset();await F.evaluate(()=>{const R=__dbg.RO;R.y=__dbg.GY(R.x,R.z)+2.2;R.vy=0});const a=await st(1);await dtap(k%2?'tL':'tR',220);let n=0,b;for(;n<45;n++){b=await st(1);if(!b.air)break}land.push(+(n/60).toFixed(2)+(a.air?'':'(no air)'));const c=await st(30);if(c.lg>a.lg)hl++;await sleep(450)}
  res[`${mode}_roam_buf`]={cooldown:hc+'/5',landing:hl+'/5',land_s:land};console.log('  roam buffered',JSON.stringify(res[`${mode}_roam_buf`]));ok(!patched||(hc===5&&hl===5),`${mode} roam buffered double-tap: cooldown ${hc}/5, landing ${hl}/5`)}
 // false triggers
 {await reset();const a=await st(0);for(let k=0;k<6;k++){await tap('tR');await sleep(390)}await sleep(400);for(let k=0;k<4;k++){await tap('tL',600);await sleep(350)}await sleep(400);for(let k=0;k<4;k++){await tap('tL');await sleep(100);await tap('tR');await sleep(400)}
  const b=await st(2);res[`${mode}_roam_false`]=b.lg-a.lg;ok(b.lg===a.lg,`${mode} roam false triggers: ${b.lg-a.lg} lunges from 6 single taps 450 ms apart, 4 holds of 600 ms, 4 L/R quick pairs`)}
 // keyboard still works
 {await reset();let kh=0;for(const key of['KeyD','KeyA','ArrowRight','ArrowLeft']){await reset();const a=await st(0);await p.keyboard.press(key);await sleep(150);await p.keyboard.press(key);const b=await st(2);if(b.lg>a.lg)kh++;await sleep(450)}ok(kh===4,`${mode} roam keyboard double-tap ${kh}/4`)}
 // a SMASH hit right after the tap: the side pop turns into the hit pop, no centre hitPop; the tutorial card is hidden meanwhile
 if(patched){await reset();await F.evaluate(()=>{const t=document.getElementById('roamTut');t.hidden=false;t.querySelector('p').textContent='Drive! Your car accelerates by itself — steer with ◀ ▶.'});
  const tr=await F.evaluate(()=>{const C=__cr25.cars,R=__dbg.RO;let b=-1,bd=1e9;C.forEach((c,i)=>{if(c.dead>0||c.x==null)return;const d=Math.hypot(c.x-R.x,c.z-R.z);if(d<bd&&d>20){bd=d;b=i}});if(b<0)return -1;const c=C[b],cam=__dbg.camera;cam.updateMatrixWorld();const e=cam.matrixWorld.elements;R.x=c.x-e[0]*3.4;R.z=c.z-e[2]*3.4;R.y=__dbg.GY(R.x,R.z);R.v=0;R.vh=R.h;c.cv=0;__ju.step(1);return b});
  if(tr>=0){await dtap('tR',200);let dead=false;for(let i=0;i<20&&!dead;i++)dead=await F.evaluate(i=>{__ju.step(1);return __cr25.cars[i].dead>0},tr);await sleep(60);
   const d=await F.evaluate(DOMCHK),hp=await F.evaluate(()=>{const e=document.getElementById('hitPop');return !e.hidden&&getComputedStyle(e).display!=='none'});if(mode==='top')await shot('smash_hit_tut');console.log('  hit',dead,JSON.stringify(d),'hitPop',hp);
   ok(dead&&d.pop&&/💥/.test(d.txt)&&!hp&&d.tutHidden===true&&d.over.filter(x=>x!=='roamTut').length===0,`${mode} roam SMASH hit: side pop "${d.txt}", centre hitPop ${hp?'shown':'not shown'}, tutorial card hidden=${d.tutHidden}`);
   await sleep(800);const t2=await F.evaluate(()=>getComputedStyle(document.getElementById('roamTut')).visibility);ok(t2==='visible',`${mode} tutorial card back after the pop (${t2})`)}
  await F.evaluate(()=>{document.getElementById('roamTut').hidden=true})}
 if(patched){await sleep(400);const h=await F.evaluate(HINT);ok(!h.on&&+h.ls>=2,`${mode} roam hint chip gone after ${h.ls} SMASHes`)}
 await ctx.close()}
 // ================= RACE =================
 if(!process.env.SKIPRACE){const o=await open(mode,true),{ctx,p,F,dtap,htap,tap,shot,gaps,errs}=o;const tick=n=>F.evaluate(n=>__tick(n),n);
 await F.evaluate(()=>__dbg.RS('quick'));lg(mode+' race start');const patched=await F.evaluate(()=>!!window.__crsm);
 const tr0=await F.evaluate(()=>({n:__cr25.traffic.length,type:__dbg.RC.type,cfg:__dbg.RC.traffic}));res[`${mode}_race_traffic`]=tr0.n;ok(!patched||tr0.n===0,`${mode} race (${tr0.type}, cfg traffic ${tr0.cfg}) civilian traffic objects: ${tr0.n}`);
 await p.keyboard.down('ArrowUp');for(let i=0;i<20;i++)await tick(30);for(let i=0;i<40&&(await F.evaluate(()=>__dbg.ST))!=='race';i++)await tick(30);console.log('  state',await F.evaluate(()=>__dbg.ST));
 if(patched){await sleep(400);const h=await F.evaluate(HINT);ok(h.on&&h.above&&h.over.length===0,`${mode} race hint chip above the arrows (${JSON.stringify(h.rect)})`);if(mode==='top')await shot('hint')}
 const ps=()=>F.evaluate(()=>{const P=__dbg.PL;return{rc:P.rollCd,rt:P.rollT,air:!!P.air,dead:P.dead>0,fin:!!P.finished}});
 const ready=async()=>{let a=await ps();for(let g=0;g<60&&(a.air||a.rc>0||a.rt>0||a.dead);g++){await tick(5);a=await ps()}return a};
 const fired=async(n)=>{for(let i=0;i<n;i++){await tick(1);const b=await ps();if(b.rt>0&&b.rc>.5)return true}return false};
 await tap('tR');await sleep(900);await tick(2);
 const R1={};let all=0,tot=0;
 for(const iv of INTERVALS){let h=0;for(let k=0;k<5;k++){let f=false;for(let r=0;r<3;r++){await ready();await F.evaluate(()=>{__tsL.length=0});await dtap(k%2?'tL':'tR',iv);f=await fired(4);const gp=await gaps();if(gp!=null&&Math.abs(gp-iv)<=40)break;console.log('  harness: delivered gap',gp,'for',iv,'- retry');await tick(80);await sleep(450)}if(f)h++;
   if(patched&&iv===220&&k===1){await sleep(60);const d=await F.evaluate(DOMCHK);console.log('  fx',JSON.stringify(d));ok(d.pop&&d.flash.length===1&&d.over.length===0,`${mode} race feedback: arrow flash ${d.flash} + "${d.txt}" clear of buttons/minimap`);if(mode==='top')await shot('smash_pop')}
   await tick(20);await sleep(420)}R1[iv]=h;all+=h;tot+=5}
 res[`${mode}_race_iv`]=Object.fromEntries(Object.entries(R1).map(([k,v])=>[k,v+'/5']));ok(!patched||all===tot,`${mode} race double-tap ${all}/${tot} (${INTERVALS.map(i=>i+'ms '+R1[i]+'/5').join(', ')})`);
 {let h=0;for(let k=0;k<5;k++){await ready();await htap(k%2?'tL':'tR',200);if(await fired(4))h++;await tick(20);await sleep(420)}res[`${mode}_race_held`]=h+'/5';ok(!patched||h===5,`${mode} race held-first-tap ${h}/5`)}
 {let h=0;for(let k=0;k<5;k++){await ready();await F.evaluate(()=>{__dbg.PL.rollCd=.3});await dtap(k%2?'tL':'tR',220);if(await fired(30))h++;await tick(20);await sleep(420)}res[`${mode}_race_buf`]=h+'/5';ok(!patched||h===5,`${mode} race buffered double-tap during cooldown ${h}/5`)}
 {await ready();const a=await ps();let n=0;const cnt=async()=>{if(await fired(2))n++};for(let k=0;k<6;k++){await tap('tR');await cnt();await sleep(390)}for(let k=0;k<4;k++){await tap('tL',600);await cnt();await sleep(350)}for(let k=0;k<4;k++){await tap('tL');await sleep(100);await tap('tR');await cnt();await sleep(400)}
  res[`${mode}_race_false`]=n;ok(n===0,`${mode} race false triggers: ${n}`)}
 // 60 s of racing (fresh race), no errors
 await F.evaluate(()=>__dbg.RS('quick'));const e0=errs.length;for(let i=0;i<120;i++){await tick(30);if(i===60&&mode==='top')await shot('race_30s')}
 const r60=await F.evaluate(()=>({err:window.__err||null,n:__cr25.traffic.length,st:__dbg.ST,d:Math.round(__dbg.PL.dist)}));res[`${mode}_race60`]=r60;ok(!r60.err&&errs.length===e0&&(!patched||r60.n===0),`${mode} 60 s race: ${JSON.stringify(r60)}`);
 // Crash Junction keeps <= 3 cars parked at the edge
 if(patched){await F.evaluate(()=>__dbg.RS('junction'));await tick(60);const j=await F.evaluate(()=>({type:__dbg.RC.type,M:__cr25.MARGIN,c:__cr25.traffic.map(c=>({x:+c.x.toFixed(2),v:+c.v.toFixed(2)}))}));
  for(let i=0;i<10;i++)await tick(30);const err=await F.evaluate(()=>window.__err||null);console.log('  junction',JSON.stringify(j));ok(j.type==='junction'&&j.c.length<=3&&j.c.every(c=>Math.abs(c.x)>=j.M-1&&c.v===0)&&!err,`${mode} Crash Junction: ${j.c.length} parked cars at |x|>=MARGIN-1 (${j.M.toFixed(1)})`)}
 await p.keyboard.up('ArrowUp');await ctx.close()}
}
fs.writeFileSync(`${OUT}/${LABEL}_results.json`,JSON.stringify(res,null,1));console.log('RESULTS',JSON.stringify(res));
console.log(fails?'GATE FAIL '+fails:'GATE PASS');await br.close()})();
