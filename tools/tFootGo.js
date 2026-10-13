// tFootGo: the foot: checklist tests (src/99c_checklist.js v90n/foot-go-*), automated. Each test taps the item's 📍 GO (spawns ONLY that
// requirement), then acts with REAL input (keys via Playwright, touch via CDP on #ofZone / #tB) and checks the item's pass line.
// Prints one PASS/FAIL line per check and "GO n/m". 852×393 touch context (keyboard works too).
//   node tools/tFootGo.js <url e.g. http://127.0.0.1:8766/out/foot1/index.html> [outdir] [tests: walk,phone,npc,obj,jump] [SHOTS=1]
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
const BASE=process.argv[2],OUT=process.argv[3]||'qa_footgo',ONLY=(process.argv[4]||'walk,phone,npc,obj,jump').split(','),SHOTS=process.env.SHOTS==='1';fs.mkdirSync(OUT,{recursive:true});
let nOk=0,nAll=0;const R=[];const ok=(t,c,m,i)=>{nAll++;if(c)nOk++;const l=(c?'PASS ':'FAIL ')+t+' · '+m+(i!==undefined?' · '+JSON.stringify(i):'');R.push(l);console.log(l)};
const ang=(a,b)=>{let d=a-b;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;return d};
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const ctx=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:1,isMobile:true,hasTouch:true});const p=await ctx.newPage();p.setDefaultTimeout(120000);
 const errs=[];p.on('pageerror',e=>errs.push(String(e).slice(0,200)));p.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text().slice(0,200))});
 const cdp=await ctx.newCDPSession(p);const touch=(type,pts)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:pts.map((q,i)=>({x:q[0],y:q[1],id:q[2]??i}))});
 const t0=Date.now();await p.goto(BASE+(BASE.includes('?')?'&':'?')+'test=fra&draw=0');await p.waitForFunction(()=>window.__tq&&__tq.ready,null,{polling:250,timeout:120000});
 console.log('BOOT fra '+((Date.now()-t0)/1000).toFixed(1)+' s');
 const F=()=>p.evaluate(()=>__mho.foot);const W=ms=>p.waitForTimeout(ms);
 const go=async(id,tag)=>{const said=await p.evaluate(id=>__chk.go(id)||'',id);await W(400);const f=await F();console.log(`GO ${tag}: "${said}" state=${f.state}`);return{said,f}};
 const shot=async f=>{if(!SHOTS)return;await p.evaluate(()=>__tq.draw()).catch(()=>{});await p.screenshot({path:OUT+'/'+f,type:'jpeg',quality:75})};
 const samp=async(ms,step=50)=>{const L=[],e=Date.now()+ms;while(Date.now()<e){const f=await F();f.t=Date.now();L.push(f);await W(step)}return L};
 const tapEl=async sel=>{const r=await p.evaluate(s=>{const e=document.querySelector(s);if(!e||!e.offsetWidth)return null;const q=e.getBoundingClientRect();return[q.left+q.width/2,q.top+q.height/2]},sel);if(!r)return false;await touch('touchStart',[r]);await W(60);await touch('touchEnd',[]);return true};
 const mean=a=>a.reduce((x,y)=>x+y,0)/Math.max(1,a.length),sd=a=>{const m=mean(a);return Math.sqrt(mean(a.map(x=>(x-m)**2)))};
 try{
 if(ONLY.includes('walk')){const T='walk';const g=await go('v90n/foot-go-walk',T);ok(T,g.f.state==='walk','GO puts you on foot',g.said);
  const s0=await F();const cam0=s0.n.camIn;await p.keyboard.down('KeyW');const A=await samp(3000);await p.keyboard.up('KeyW');const s1=A[A.length-1];
  const d=Math.hypot(s1.x-s0.x,s1.z-s0.z);ok(T,d>=4,'3 s forward moves ≥ 4 m',{d:+d.toFixed(2)});
  const st=A.filter(f=>f.t-A[0].t>1000);const sp=st.map(f=>f.spd);ok(T,sd(sp)/Math.max(.01,mean(sp))<.12,'steady speed, no jitter (sd/mean < 0.12)',{mean:+mean(sp).toFixed(2),sd:+sd(sp).toFixed(2)});
  let hj=0;for(let i=1;i<st.length;i++)hj=Math.max(hj,Math.abs(ang(st[i].h,st[i-1].h)));ok(T,hj<.06,'heading steady while walking straight',{maxStep:+hj.toFixed(3)});
  const fr=st.map(f=>f.footV/Math.max(.01,f.spd));ok(T,mean(fr)>.75&&mean(fr)<1.35,'feet step in time with the ground (foot speed / ground speed 0.75-1.35)',{ratio:+mean(fr).toFixed(2)});
  await shot('foot_walk.jpg');
  const pre=await F(),tgt=pre.cy-Math.PI/2;await p.keyboard.down('KeyD');const tD=Date.now();const B=await samp(1800,30);await p.keyboard.up('KeyD');
  const hit=B.find(f=>Math.abs(ang(f.h,tgt))<.2&&f.spd>.3);ok(T,!!hit&&hit.t-tD<=260,'faces the new direction within 0.2 s (+1 frame)',{ms:hit?hit.t-tD:null});
  const cb=B.find(f=>f.t-tD>300&&Math.abs(ang(f.cy,f.h))<.5);ok(T,!!cb&&cb.t-tD<=1500,'camera back behind within 1.5 s of the turn',{ms:cb?cb.t-tD:null,end:+Math.abs(ang(B[B.length-1].cy,B[B.length-1].h)).toFixed(2)});
  const s2=await F();ok(T,s2.n.camIn===cam0,'camera never inside a wall',{camIn:s2.n.camIn-cam0});ok(T,s2.n.stuckF-s0.n.stuckF<10,'no snagging (stuck frames < 10)',{stuck:s2.n.stuckF-s0.n.stuckF})}
 if(ONLY.includes('phone')){const T='phone';const g=await go('v90n/foot-go-phone',T);ok(T,g.f.state==='walk','GO puts you on foot',g.said);
  const z=await p.evaluate(()=>{const e=document.getElementById('ofZone'),r=e.getBoundingClientRect();return[r.left+r.width*.4,r.top+r.height*.6]});
  const hold=async(frac,ms)=>{await touch('touchMove',[[z[0],z[1]-70*frac,7]]);await W(ms-800);const L=await samp(800);return mean(L.map(f=>f.spd))};
  await touch('touchStart',[[z[0],z[1],7]]);await W(80);const v50=await hold(.5,2000),v75=await hold(.75,1500),v100=await hold(1,2000);await touch('touchEnd',[]);
  ok(T,v50>=1.4&&v50<=2.6,'half stick = steady walk 1.4-2.6 m/s',{v50:+v50.toFixed(2)});ok(T,v100>=4,'full stick = run ≥ 4 m/s',{v100:+v100.toFixed(2)});
  ok(T,v75>v50+.3&&v75<v100-.3,'¾ stick is in between (smooth, no crawl→sprint jump)',{v75:+v75.toFixed(2)})}
 if(ONLY.includes('npc')){const T='npc';const g=await go('v90n/foot-go-npc',T);ok(T,g.f.state==='walk'&&!!g.f.npc,'GO: pedestrian ahead',{said:g.said,npc:g.f.npc});
  await W(300);let f=await F();ok(T,f.act==='npc'&&/HI/.test(f.btnTxt),'👋 HI button shows next to a person',{act:f.act,btn:f.btnTxt,d:f.npc&&f.npc.d});
  await shot('foot_npc_prompt.jpg');
  const tp=await tapEl('#tB');const tT=Date.now();const L=await samp(700,40);const r=L.find(q=>q.npc&&q.npc.w>0&&q.npc.face!=null&&q.npc.face<.35&&q.npc.bub);
  ok(T,tp&&!!r&&r.t-tT<=500,'tap HI: person faces you, waves, bubble within 0.5 s',{tap:tp,ms:r?r.t-tT:null,last:L[L.length-1].npc});
  await p.keyboard.press('KeyE');await W(200);f=await F();ok(T,f.npc&&f.npc.w>0,'E key greets too',f.npc);
  await p.keyboard.down('KeyW');const M=await samp(1500);await p.keyboard.up('KeyW');ok(T,M.every(q=>!q.flying),'walking into people never sends them flying',{flying:Math.max(...M.map(q=>q.flying))})}
 if(ONLY.includes('obj')){const T='obj';let g=await go('v90n/foot-go-obj',T+':car');await W(300);let f=await F();ok(T,f.btn==='enter'||/ENTER/.test(f.btnTxt),'next to your car: 🚪 ENTER',{btn:f.btn,said:g.said});
  await tapEl('#tB');await W(1200);f=await F();ok(T,f.state==='car','ENTER gets you in',{state:f.state});
  g=await go('v90n/foot-go-obj',T+':bench');await W(300);f=await F();ok(T,f.act==='bench'&&/SIT/.test(f.btnTxt),'next to a bench: 🪑 SIT',{act:f.act,btn:f.btnTxt,said:g.said});
  await tapEl('#tB');await W(900);f=await F();ok(T,f.sit,'SIT sits the minifig on the bench',{sit:f.sit,y:f.y});await shot('foot_bench.jpg');
  await p.keyboard.down('KeyW');await W(700);await p.keyboard.up('KeyW');f=await F();ok(T,!f.sit&&f.state==='walk','the stick stands it up again',{sit:f.sit});
  g=await go('v90n/foot-go-obj',T+':mission');await W(300);f=await F();ok(T,f.act==='mission'&&/TALK/.test(f.btnTxt),'next to a mission giver: 📋 TALK',{act:f.act,btn:f.btnTxt,said:g.said});
  await tapEl('#tB');await W(600);f=await F();const vis=await p.evaluate(()=>!document.getElementById('roamCard').hidden);ok(T,f.card&&vis,'TALK opens the mission card',{card:f.card,vis});
  await p.evaluate(()=>{const b=document.getElementById('rcNo');if(b)b.click()})}
 if(ONLY.includes('jump')){const T='jump';const g=await go('v90n/foot-go-jump',T);ok(T,g.f.state==='walk','GO puts you on foot',g.said);
  await p.keyboard.down('Space');const L=await samp(1300,25);await p.keyboard.up('Space');const top=Math.max(...L.map(q=>q.gnd)),sink=Math.min(...L.map(q=>q.gnd)),end=L[L.length-1];
  ok(T,top>=.5&&top<=1.2,'short hop 0.5-1.2 m',{top});ok(T,!end.air&&Math.abs(end.gnd)<.03,'lands on the ground',{air:end.air,gnd:end.gnd});ok(T,sink>-.03,'never sinks',{sink});
  await p.keyboard.down('KeyW');await W(1200);const a=await F();await p.keyboard.press('Space');const J=await samp(500,25);await p.keyboard.up('KeyW');const air=J.filter(q=>q.air);
  ok(T,air.length>0&&mean(air.map(q=>Math.hypot(q.vx,q.vz)))>=.7*a.spd,'jumping while walking keeps you moving',{before:a.spd,air:air.length?+mean(air.map(q=>Math.hypot(q.vx,q.vz))).toFixed(2):0})}
 }catch(e){ok('run',false,'script error '+String(e).slice(0,200))}
 ok('all',errs.length===0,'no console errors',errs.slice(0,3));
 console.log(`GO ${nOk}/${nAll}`);fs.writeFileSync(OUT+'/result.txt',R.join('\n')+`\nGO ${nOk}/${nAll}\n`);await b.close()})();
