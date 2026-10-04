// tDR: driving-flow numbers + checks. usage: node tDR.js [dir] [tag]   (dir served at :8766/<dir>/local_dbg.html, default '.')
// per city (Athens A / Kolonaki, Frankfurt / Altstadt): breakables near roads, traffic, objects + draw calls, bot average speed on fixed routes,
// worst speed kept on a smash, stopped side-by-side car pairs (lane walls); phone landscape HUD with a mission running (card vs steer pads / minimap).
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const F=require('./fast.js');const fs=require('fs');
const DIR=process.argv[2]||'.',TAG=process.argv[3]||'run',U=`http://127.0.0.1:8766/${DIR}/local_dbg.html`;fs.mkdirSync('shots',{recursive:true});
let fails=0,pass=0;const ok=(c,m,i)=>{c?pass++:fails++;console.log((c?'PASS ':'FAIL ')+m+(i!==undefined?' · '+JSON.stringify(i):''))};const OUT={};
const seed=async(p,city,d)=>{await p.evaluate(([c,d])=>{localStorage.clear();localStorage.setItem('mho_slot','1');localStorage.setItem('mho_city@1',c);if(d)localStorage.setItem('mho_athd@1',d);const k=c==='ath'?'.ath':'';localStorage.setItem('mho_roam'+k+'@1','{"tut":1,"otg":{}}');if(c==='ath')localStorage.setItem('mho_story.ath@1','{"seen":1}')},[city,d]);
 await p.reload();await p.waitForFunction(()=>window.__mho&&__mho.state==='menu');await F.on(p);await p.evaluate(()=>__mho.enterRoam());await p.waitForFunction(()=>__mho.state==='roam',null,{polling:500});
 await p.evaluate(()=>{try{__mho.storyClose()}catch(e){}try{__m1.skip()}catch(e){}__mho.roamSim(30)})};
const CITIES=[{c:'ath',d:'A',area:'Kolonaki',routes:[[-300,0,300,0],[0,-300,0,300],[-250,-250,250,250],[250,-250,-250,250],[-150,-50,350,150]]},{c:'fra',d:null,area:'Altstadt',routes:[[-300,0,300,0],[0,-300,0,300],[-250,-250,250,250],[250,-250,-250,250],[-150,-50,350,150]]}];
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const errs=[];
for(const C of CITIES){const p=await (await b.newContext({viewport:{width:1000,height:460}})).newPage();p.setDefaultTimeout(900000);p.on('pageerror',e=>errs.push(C.c+': '+e.message.slice(0,160)));
 await p.goto(U);await p.waitForFunction(()=>window.__mho&&__mho.state==='menu');await seed(p,C.c,C.d);
 const o=await p.evaluate(([area,routes])=>{const [cx,cz]=__dr.dist(area),M=__mho;const o={all:__dr.props(0,0),area:__dr.props(cx,cz,450),traffic:__dr.traffic(),fix:window.__drFix?__drFix.DR.st:null};
   M.warp(...M.rsnap(cx,cz,300),0,true);M.roamSim(120);o.objs=__dr.objs();o.draws=__dr.draws();o.trafficNear=[];o.walls=0;
   // stopped cars side by side across the road = a lane wall
   const walls=()=>{const S=__mho.HUB.cars.filter(c=>!(c.dead>0)&&(c.cv??c.v)<.5&&Math.hypot(c.x-__mho.RO.x,c.z-__mho.RO.z)<250);let n=0;for(let i=0;i<S.length;i++)for(let j=i+1;j<S.length;j++){const a=S[i],c=S[j],d=Math.hypot(a.x-c.x,a.z-c.z);if(d>2.2&&d<6.5&&a.CVhx!=null&&c.CVhx!=null){const lat=Math.abs((c.x-a.x)*a.CVhz-(c.z-a.z)*a.CVhx);if(lat>2.2)n++}}return n};
   o.runs=routes.map(r=>{const R=__dr.drive(cx+r[0],cz+r[1],cx+r[2],cz+r[3],150);return R});
   for(let k=0;k<20;k++){M.roamSim(90);o.trafficNear.push(__dr.traffic(150).near);o.walls+=walls()}
   const ok=o.runs.filter(r=>!r.skip);o.kmh=+(ok.reduce((a,r)=>a+r.kmh,0)/Math.max(1,ok.length)).toFixed(1);o.routes=ok.length;o.minRet=Math.min(...ok.map(r=>r.minRet));o.smash=ok.reduce((a,r)=>a+r.smash,0);o.stuck=Math.max(...ok.map(r=>r.stuck));
   o.near=+(o.trafficNear.reduce((a,b)=>a+b,0)/o.trafficNear.length).toFixed(1);delete o.trafficNear;return o},[C.area,C.routes]);
 OUT[C.c]=o;console.log(C.c,JSON.stringify(o));
 await p.evaluate(([area])=>{const [cx,cz]=__dr.dist(area);__mho.warp(...__mho.rsnap(cx,cz,300),0,true);__mho.roamSim(60)},[C.area]);try{await F.shot(p,`shots/dr_${TAG}_${C.c}.jpg`,{type:'jpeg',quality:72})}catch(e){errs.push(C.c+' shot: '+e.message.slice(0,80))}
 await p.context().close()}
// phone landscape (2000x920 like the owner's iPhone 16 shot) with a mission running
{const ctx=await b.newContext({viewport:{width:870,height:400},deviceScaleFactor:2.3,isMobile:true,hasTouch:true});const p=await ctx.newPage();p.setDefaultTimeout(900000);p.on('pageerror',e=>errs.push('phone: '+e.message.slice(0,160)));
 const cdp=await ctx.newCDPSession(p);
 await p.goto(U);await p.waitForFunction(()=>window.__mho&&__mho.state==='menu');await seed(p,'ath','A');
 await p.evaluate(()=>{const e=document.querySelector('#rotOk');if(e&&e.offsetParent)e.click()});
 const mk=await p.evaluate(()=>{const M=__mho.RO.marks,m=M.find(m=>m.kind==='quest')||M.find(m=>m.kind==='otg');__mho.chStart(m);__mho.roamSim(240);return m&&(m.ev&&m.ev.id)});
 const rr=s=>p.evaluate(s=>{const e=document.querySelector(s);if(!e||!e.offsetParent||e.hidden||getComputedStyle(e).visibility==='hidden')return null;const r=e.getBoundingClientRect();return{l:Math.round(r.left),t:Math.round(r.top),r:Math.round(r.right),b:Math.round(r.bottom),w:Math.round(r.width),h:Math.round(r.height)}},s);
 const ov=(a,c)=>a&&c&&Math.min(a.r,c.r)-Math.max(a.l,c.l)>2&&Math.min(a.b,c.b)-Math.max(a.t,c.t)>2;
 const touchIds=['#tL','#tR','#tG','#tB','#tD','#tF','#tN','#tP','#tW','#roamMini','#roamHorn','#roamVeh','#roamMapBtn','#roamExit','#roamPause'];
 const hud=async()=>{const q=await rr('#qTrk'),pl=await rr('#roamPlate'),mi=await rr('#roamMini');const hit=[];for(const s of touchIds){const r=await rr(s);if(s!=='#roamMini'&&ov(q,r))hit.push(s)}if(ov(q,mi))hit.push('#roamMini');return{q,pl,mi,hit,plMini:ov(pl,mi),plCard:ov(pl,q)}};
 const h1=await hud();OUT.hud=h1;console.log('hud',mk,JSON.stringify(h1));await F.shot(p,`shots/dr_${TAG}_phone.png`);
 // a few seconds later (district plate may show) and after tapping the card title (expanded)
 await p.evaluate(()=>{__mho.roamSim(60)});const h2=await hud();
 const qh=await rr('#qTrk .qh');let h3=null;if(qh){const x=qh.l+20,y=(qh.t+qh.b)/2;await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y,id:0}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await p.waitForTimeout(200);h3=await hud();await F.shot(p,`shots/dr_${TAG}_phone_open.png`)}
 OUT.hud2=h2;OUT.hud3=h3;console.log('hud2',JSON.stringify(h2),'hud3',JSON.stringify(h3));
 if(TAG!=='before'){ok(h1.q&&h1.q.h<=56,'phone: mission card is compact (<= 56 px tall)',h1.q);ok(h1.q&&!h1.hit.length,'phone: mission card clear of every touch control and the minimap',h1.hit);
  ok(!h2.plMini&&!h2.plCard,'phone: district plate clear of minimap and mission card',h2);ok(h3&&h3.q&&h3.q.h>h1.q.h&&!h3.hit.length,'phone: tapping the card title expands it, still clear of controls',h3&&h3.q)}
 await ctx.close()}
const A=OUT.ath,Fr=OUT.fra;
if(TAG!=='before'){for(const[k,o]of[['ath',A],['fra',Fr]]){ok(o.minRet>=.85,`${k}: a smash keeps >= 85 % speed`,o.minRet);ok(o.traffic.total<=80,`${k}: traffic halved (<= 80 AI cars)`,o.traffic);ok(o.walls===0,`${k}: no stopped side-by-side lane walls`,o.walls);ok(o.routes>=2,`${k}: at least 2 bot routes driven`,o.routes);ok(o.stuck<3,`${k}: bot never stuck >= 3 s`,o.stuck);ok(o.area.road===0||o.area.road<=3,`${k}: (almost) no breakables on the road surface near ${k==='ath'?'Kolonaki':'Altstadt'}`,o.area.road)}
 const base=fs.existsSync('shots/dr_before.json')?JSON.parse(fs.readFileSync('shots/dr_before.json')):null;
 if(base)for(const k of['ath','fra']){const b0=base[k].area.path,b1=OUT[k].area.path;ok(b1<=b0*.4,`${k}: >= 60 % fewer breakables in the driving path (edge < 2.5 m)`,{before:b0,after:b1,cut:+(1-b1/b0).toFixed(2)})}}
ok(!errs.length,'no page errors',errs.slice(0,5));fs.writeFileSync(`shots/dr_${TAG}.json`,JSON.stringify(OUT,null,1));
console.log(`tDR ${TAG}: ${pass} pass, ${fails} fail`);await b.close();process.exit(fails?1:0)})();
