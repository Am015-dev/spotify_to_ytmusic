// tDrive.js <url> <outprefix> <fra|ath> <seq|long> : player-car feel metrics with real keyboard input on the 852x393 touch layout.
// seq : 10 s (accelerate, ~90° right turn, straight, slalom), a frame every 0.5 s.
// long: 120 s free drive with steering pulses (hills, kerbs, walls).
// Prints slip angle in normal turns, chase-camera yaw lag, wheel spin vs v/r, min body/tyre clearance to the ground.
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const [URL,OUT,CITY='fra',MODE='seq']=process.argv.slice(2);
const br=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const p=await (await br.newContext({viewport:{width:852,height:393},deviceScaleFactor:2,isMobile:true,hasTouch:true})).newPage();p.setDefaultTimeout(600000);
const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,150)));
await p.goto(URL);await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:500});
await p.evaluate(c=>{localStorage.clear();localStorage.setItem('mho_slot','1');localStorage.setItem('mho_athpre','1');localStorage.setItem('mho_roam@1',JSON.stringify({tut:1,otg:{}}));if(c==='ath')localStorage.setItem('mho_city@1','ath')},CITY);
await p.reload();await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:500});
await p.evaluate(()=>{try{__m1&&__m1.skip&&__m1.skip()}catch(e){}__mho.enterRoam()});await p.waitForFunction(()=>__mho.state==='roam');
await p.evaluate(()=>__mho.storyClose&&__mho.storyClose());await p.waitForTimeout(2500);
// deterministic: stop the real-time loop, step the sim at 1/60 s via the game's own test hook, render only for screenshots
await p.evaluate(()=>{window.requestAnimationFrame=()=>0});await p.waitForTimeout(400);
await p.evaluate(()=>{const {scene,camera,THREE}=__dbg,GY0=__dbg.GA;let gyRef=0;const GY=(x,z)=>GY0(x,z,gyRef);const L=window.__dl=[];let fr=0,gt=0;const v=new THREE.Vector3(),q=new THREE.Vector3(),sc=new THREE.Vector3();
 const vis=o=>{while(o){if(!o.visible)return false;o=o.parent}return true};
 const sample=()=>{fr++;gt+=1/60;const RO=__dbg.RO,c=__dbg.CTL||{},P=__dbg.PL;if(!P||!P.mesh)return;const M=P.mesh.userData.m;P.mesh.updateMatrixWorld(true);gyRef=RO.y+1;
  const W=[];let clr=1e9,cw=1e9;
  M.traverse(o=>{if(!o.isMesh||!vis(o))return;if(o.userData.r){o.getWorldPosition(v);o.getWorldScale(sc);W.push([o.rotation.x,o.userData.r*sc.y,o.position.z]);cw=Math.min(cw,v.y-o.userData.r*sc.y-GY(v.x,v.z));return}
   if(fr%2)return;if(o.material&&(o.material.transparent||o.material.depthWrite===false))return;if(!o.geometry.boundingBox)o.geometry.computeBoundingBox();const b=o.geometry.boundingBox;
   for(let k=0;k<8;k++){q.set(k&1?b.max.x:b.min.x,k&2?b.max.y:b.min.y,k&4?b.max.z:b.min.z).applyMatrix4(o.matrixWorld);clr=Math.min(clr,q.y-GY(q.x,q.z))}});
  camera.getWorldDirection(v);
  L.push({t:gt,h:RO.h,vh:RO.vh??RO.h,v:RO.v,yr:RO.yr||0,d:RO.dDir||0,st:c.steer||0,air:!!P.air,cx:camera.position.x,cz:camera.position.z,x:RO.x,z:RO.z,y:RO.y,cy:Math.atan2(v.x,v.z),W,clr:clr<1e8?clr:null,cw:cw<1e8?cw:null,bt:(P.boatK||0)>.3?1:0,nb:__dbg.NB,vm:P.vmode||'car'})};
 window.__run=n=>{for(let i=0;i<n;i++){__ju.step(1);sample()}return __dbg.RO.h};
 window.__draw=()=>{try{__dbg.composer.render()}catch(e){__dbg.renderer.render(scene,camera)}}});
const K=p.keyboard;let si=0;
const run=n=>p.evaluate(n=>__run(n),n);
const shot=async()=>{await p.evaluate(()=>__draw());await p.screenshot({path:`${OUT}_f${String(si++).padStart(2,'0')}.png`})};
const seg=async(frames)=>{for(let k=0;k<frames;k+=30){await run(Math.min(30,frames-k));await shot()}};
if(MODE==='seq'){await K.down('ArrowUp');await seg(180);const h0=await run(0);await K.down('ArrowRight');
 for(let k=0;k<180;k+=6){const h=await run(6);if(k%30===24)await shot();if(Math.abs(h-h0)>Math.PI/2)break}
 await K.up('ArrowRight');await shot();await seg(60);for(let i=0;i<6;i++){const k=i%2?'ArrowRight':'ArrowLeft';await K.down(k);await seg(42);await K.up(k)}await K.up('ArrowUp')}
else{await K.down('ArrowUp');let n=0;for(let t=0;t<7200;){const k=Math.random()<.5?'ArrowLeft':'ArrowRight',hold=Math.round(18+Math.random()*54),gap=Math.round(72+Math.random()*150);await K.down(k);await run(hold);await K.up(k);await run(gap);t+=hold+gap;if(n++%8===0)await shot()}await K.up('ArrowUp')}
const L=await p.evaluate(()=>window.__dl);
const ad=(a,b)=>{let d=a-b;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;return d},deg=r=>r*180/Math.PI;
// slip in normal (non-drift, grounded) turns
const hit=L.map((f,i)=>i>0&&(Math.abs(f.v-L[i-1].v)>1.5||f.nb!==L[i-1].nb)),near=i=>hit.slice(Math.max(0,i-30),i+12).some(Boolean);
const sl=L.filter((f,i)=>!f.d&&!f.air&&Math.abs(f.st)>.2&&Math.abs(f.v)>5&&!near(i)).map(f=>Math.abs(deg(ad(f.h,f.vh)))).sort((a,b)=>a-b);
// camera yaw lag: chase bearing (camera->car) vs car heading, best time shift
const un=a=>{const o=[a[0]];for(let i=1;i<a.length;i++)o.push(o[i-1]+ad(a[i],a[i-1]));return o};const tt=L.map(f=>f.t),H=un(L.map(f=>f.h)),C=un(L.map(f=>Math.atan2(f.x-f.cx,f.z-f.cz)));
const off=C.map((c,i)=>c-H[i]).sort((a,b)=>a-b)[C.length>>1];const hAt=t=>{let i=tt.findIndex(x=>x>=t);if(i<=0)return H[Math.max(0,i)];if(i<0)return H[H.length-1];const u=(t-tt[i-1])/(tt[i]-tt[i-1]);return H[i-1]+(H[i]-H[i-1])*u};
let best=[1e9,0];for(let tau=0;tau<=.8;tau+=.01){let e=0,n=0;for(let i=0;i<L.length;i++){if(tt[i]-tau<tt[0])continue;const d=C[i]-off-hAt(tt[i]-tau);e+=d*d;n++}if(n&&e/n<best[0])best=[e/n,tau]}
// wheel spin: measured rotation per frame vs v*dt/r (rear wheels; front ones are steered too)
let sr=0,sv=0;const SM={};for(let i=1;i<L.length;i++){const a=L[i-1],b=L[i];if(!a.W.length||a.W.length!==b.W.length||Math.abs(b.v)<2||b.bt||a.bt||near(i))continue;const dt=b.t-a.t,ds=Math.hypot(b.x-a.x,b.z-a.z);for(let k=0;k<b.W.length;k++){if(b.W[k][2]<0)continue;const dr=b.W[k][0]-a.W[k][0];sr+=Math.abs(dr);sv+=ds/b.W[k][1];const o=SM[b.vm]=SM[b.vm]||[0,0];o[0]+=Math.abs(dr);o[1]+=ds/b.W[k][1]}}
const cl=L.filter(f=>!f.bt).map(f=>f.clr).filter(x=>x!=null),cw=L.filter(f=>!f.bt&&!f.air).map(f=>f.cw).filter(x=>x!=null);const modes={};L.forEach(f=>modes[f.vm]=(modes[f.vm]||0)+1);
const R={modes,boatFrames:L.filter(f=>f.bt).length,hits:hit.filter(Boolean).length,city:CITY,mode:MODE,frames:L.length,fps:+(L.length/(tt[tt.length-1]-tt[0])).toFixed(1),slipDeg:{n:sl.length,mean:+(sl.reduce((a,b)=>a+b,0)/Math.max(1,sl.length)).toFixed(2),p95:+(sl[Math.floor(sl.length*.95)]||0).toFixed(2),max:+(sl[sl.length-1]||0).toFixed(2)},
 camLagS:+best[1].toFixed(2),camRms:+deg(Math.sqrt(best[0])).toFixed(1),wheelSpinRatio:+(sr/Math.max(1e-6,sv)).toFixed(2),spinByMode:Object.fromEntries(Object.entries(SM).map(([k,o])=>[k,+(o[0]/Math.max(1e-6,o[1])).toFixed(2)])),minBodyClear:+Math.min(...cl).toFixed(3),minTyreGap:+Math.min(...cw).toFixed(3),maxTyreGap:+Math.max(...cw).toFixed(3),
 tyreGapP50:+cw.sort((a,b)=>a-b)[cw.length>>1].toFixed(3),maxKmh:+(Math.max(...L.map(f=>Math.abs(f.v)))*3.6).toFixed(0),turned:+deg(H[H.length-1]-H[0]).toFixed(0)};
console.log(JSON.stringify(R));require('fs').writeFileSync(OUT+'_log.json',JSON.stringify(L.map(f=>({...f,W:undefined}))));console.log('errs',JSON.stringify(errs));await br.close()})().catch(e=>{console.log('ERR',e.message);process.exit(1)});
