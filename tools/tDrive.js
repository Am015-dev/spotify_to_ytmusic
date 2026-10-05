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
 window.__draw=()=>{__dbg.SS&&__dbg.SS();try{__dbg.composer.render()}catch(e){__dbg.renderer.render(scene,camera)}}});
const K=p.keyboard;let si=0;
const run=n=>p.evaluate(n=>__run(n),n);
const shot=async()=>{await p.evaluate(()=>__draw());await p.screenshot({path:`${OUT}_f${String(si++).padStart(2,'0')}.png`})};
const CRU=+(process.env.CRUISE||0);let up=false;const run6=async n=>{let h;for(let k=0;k<n;k+=6){if(CRU){const v=await p.evaluate(()=>__dbg.RO.v*3.6);const want=v<CRU;if(want!==up){up=want;await(want?K.down('ArrowUp'):K.up('ArrowUp'))}}h=await run(Math.min(6,n-k))}return h};
const seg=async(frames)=>{for(let k=0;k<frames;k+=30){await run6(Math.min(30,frames-k));await shot()}};
if(MODE==='seq'){if(!CRU)await K.down('ArrowUp');await seg(180);const h0=await run(0);await K.down('ArrowRight');
 for(let k=0;k<180;k+=6){const h=await run6(6);if(k%30===24)await shot();if(Math.abs(h-h0)>Math.PI/2)break}
 await K.up('ArrowRight');await shot();await seg(60);for(let i=0;i<6;i++){const k=i%2?'ArrowRight':'ArrowLeft';await K.down(k);await seg(42);await K.up(k)}await K.up('ArrowUp')}
else if(MODE==='route'){
 // a person driving a real street: follow the road graph to the next junction, turn 90 deg, then slalom down the straight
 const info=await p.evaluate(()=>{const CS=__dbg.CS,JN=__dbg.JN;if(!CS||!JN)return{err:'no road data'};const ad=(a,b)=>Math.atan2(Math.sin(a-b),Math.cos(a-b));
  // a real junction of two car roads (>= 10 m wide): 90 m straight approach on road A, a ~90 deg turn, 160 m straight on road B
  const run=(S,i,dirn,len)=>{const P=[],p0=S.pts[i];let k=i;while(k>=0&&k<S.pts.length){const q=S.pts[k];if(Math.abs(q.s-p0.s)>len)break;P.push({x:q.x,z:q.z});k+=dirn}return{P,ok:Math.abs(S.pts[Math.max(0,Math.min(S.pts.length-1,k-dirn))].s-p0.s)>=len*.95}};
  const hd=(P,k)=>Math.atan2(P[k+1].x-P[k].x,P[k+1].z-P[k].z),straight=P=>{if(P.length<3)return false;const h0=hd(P,0);for(let k=0;k<P.length-1;k++)if(Math.abs(ad(hd(P,k),h0))>.18)return false;return true};
  for(const J of JN){const IX=J.ix||(J.ids||[]).map(id=>{const S=CS[id];let bi=0,bd=1e9;S.pts.forEach((q,k)=>{const d=Math.hypot(q.x-J.x,q.z-J.z);if(d<bd){bd=d;bi=k}});return[id,bi]});if(IX.length<2)continue;for(const[a,ia]of IX)for(const[b,ib]of IX){if(a===b)continue;const A=CS[a],B=CS[b];if(A.r.w<10||B.r.w<10||A.r.cls==='ped'||B.r.cls==='ped')continue;
    for(const da of[1,-1])for(const db of[1,-1]){const ap=run(A,ia,-da,90),out=run(B,ib,db,160);if(!ap.ok||!out.ok||!straight(ap.P)||!straight(out.P))continue;const inH=-hd(ap.P,0),P=ap.P.slice().reverse();
      const hin=Math.atan2(P[P.length-1].x-P[P.length-2].x,P[P.length-1].z-P[P.length-2].z),hout=hd(out.P,0),turn=ad(hout,hin);if(Math.abs(Math.abs(turn)-Math.PI/2)>.3)continue;
      const R=P.concat(out.P.slice(1)),Jp=P.length-1;__m1.warp(R[0].x,R[0].z,Math.atan2(R[1].x-R[0].x,R[1].z-R[0].z));window.__rt={P:R,J:Jp};return{n:R.length,J:Jp,turnDeg:+(turn*57.3).toFixed(0),wA:A.r.w,wB:B.r.w,at:[J.x|0,J.z|0]}}}}
  return{err:'no junction'}});
 await run(30);
console.log('route',JSON.stringify(info));if(!info||info.err){await br.close();return}
 const steer=off=>p.evaluate(off=>{const {P,J}=__rt,RO=__dbg.RO;let bi=0,bd=1e9;for(let i=0;i<P.length-1;i++){const a=P[i],b=P[i+1],vx=b.x-a.x,vz=b.z-a.z,l2=vx*vx+vz*vz||1,u=Math.max(0,Math.min(1,((RO.x-a.x)*vx+(RO.z-a.z)*vz)/l2)),d=Math.hypot(a.x+vx*u-RO.x,a.z+vz*u-RO.z);if(d<bd){bd=d;bi=i+u}}
  const at=s=>{let i=Math.floor(s),u=s-i;if(i>=P.length-1){i=P.length-2;u=1}const a=P[i],b=P[i+1];return{x:a.x+(b.x-a.x)*u,z:a.z+(b.z-a.z)*u,h:Math.atan2(b.x-a.x,b.z-a.z)}};
  let s=bi,left=11;while(left>0&&s<P.length-1){const i=Math.floor(s),a=P[i],b=P[i+1],L=Math.hypot(b.x-a.x,b.z-a.z)||1,rem=(1-(s-i))*L;if(rem>=left){s+=left/L;left=0}else{left-=rem;s=i+1}}
  const T=at(s),px=T.x+Math.cos(T.h)*off,pz=T.z-Math.sin(T.h)*off,a=Math.atan2(px-RO.x,pz-RO.z),e=Math.atan2(Math.sin(a-RO.h),Math.cos(a-RO.h));const jd=Math.hypot(P[J].x-RO.x,P[J].z-RO.z);return{e,seg:bi,jd,end:bi>=P.length-1.2,kmh:RO.v*3.6,vm:__dbg.PL.vmode||'car'}},off);
 let key=null;const setKey=async k=>{if(k===key)return;if(key)await K.up(key);key=k;if(k)await K.down(k)};
 let up=false,f=0,last=-99,slT=0,phase='turn',sl=0;const vms={};
 for(let it=0;it<2400;it++){let st=await steer(0);if(phase==='slalom'){const e2=await p.evaluate(sl=>{const RO=__dbg.RO,t=RO.rdT;if(!t)return null;let a=Math.atan2(t[0],t[1]);if(Math.abs(Math.atan2(Math.sin(a-RO.h),Math.cos(a-RO.h)))>Math.PI/2)a+=Math.PI;const w=a+sl;return Math.atan2(Math.sin(w-RO.h),Math.cos(w-RO.h))},sl>0?.22:sl<0?-.22:0);if(e2!=null)st={...st,e:e2,end:false}}vms[st.vm]=(vms[st.vm]||0)+1;if(st.end&&phase==='turn'){phase='slalom';slT=0;console.log('slalom from frame',si)}if(phase==='turn'&&st.seg>info.J+.9&&st.jd>30){phase='slalom';slT=0;console.log('slalom from frame',si)}
  if(phase==='slalom'){slT+=6;if(slT%48===0)sl=sl>0?-2.6:2.6}
  const cru=phase==='turn'&&st.jd<45?42:58;const want=st.kmh<cru;if(want!==up){up=want;await(want?K.down('ArrowUp'):K.up('ArrowUp'))}
  await setKey(st.e>.05?'ArrowLeft':st.e<-.05?'ArrowRight':null);await run(6);f+=6;
  const near=phase==='turn'&&st.jd<28;if(f-last>=(near?9:30)){last=f;await shot()}if(phase==='slalom'&&slT>48*7)break}
 console.log('vehicle modes',JSON.stringify(vms));await setKey(null);if(up)await K.up('ArrowUp')}
else{await K.down('ArrowUp');let n=0;for(let t=0;t<7200;){const k=Math.random()<.5?'ArrowLeft':'ArrowRight',hold=Math.round(18+Math.random()*54),gap=Math.round(72+Math.random()*150);await K.down(k);await run(hold);await K.up(k);await run(gap);t+=hold+gap;if(n++%8===0)await shot()}await K.up('ArrowUp')}
const L=await p.evaluate(()=>window.__dl);
const ad=(a,b)=>{let d=a-b;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;return d},deg=r=>r*180/Math.PI;
// slip in normal (non-drift, grounded) turns
const hit=L.map((f,i)=>i>0&&(Math.abs(f.v-L[i-1].v)>1.5||f.nb!==L[i-1].nb)),near=i=>hit.slice(Math.max(0,i-30),i+12).some(Boolean);
const sl=L.filter((f,i)=>!f.d&&!f.air&&!f.bt&&Math.abs(f.st)>.2&&Math.abs(f.v)>5&&!near(i)).map(f=>Math.abs(deg(ad(f.h,f.vh)))).sort((a,b)=>a-b);
// camera yaw lag: chase bearing (camera->car) vs car heading, best time shift
const un=a=>{const o=[a[0]];for(let i=1;i<a.length;i++)o.push(o[i-1]+ad(a[i],a[i-1]));return o};const tt=L.map(f=>f.t),H=un(L.map(f=>f.h)),C=un(L.map(f=>Math.atan2(f.x-f.cx,f.z-f.cz)));
const off=C.map((c,i)=>c-H[i]).sort((a,b)=>a-b)[C.length>>1];const hAt=t=>{let i=tt.findIndex(x=>x>=t);if(i<=0)return H[Math.max(0,i)];if(i<0)return H[H.length-1];const u=(t-tt[i-1])/(tt[i]-tt[i-1]);return H[i-1]+(H[i]-H[i-1])*u};
let best=[1e9,0];for(let tau=0;tau<=.8;tau+=.01){let e=0,n=0;for(let i=0;i<L.length;i++){if(tt[i]-tau<tt[0])continue;const d=C[i]-off-hAt(tt[i]-tau);e+=d*d;n++}if(n&&e/n<best[0])best=[e/n,tau]}
// wheel spin: measured rotation per frame vs v*dt/r (rear wheels; front ones are steered too)
let sr=0,sv=0;const SM={};for(let i=1;i<L.length;i++){const a=L[i-1],b=L[i];if(!a.W.length||a.W.length!==b.W.length||Math.abs(b.v)<2||b.bt||a.bt||a.vm!==b.vm||near(i))continue;const dt=b.t-a.t,ds=Math.hypot(b.x-a.x,b.z-a.z);for(let k=0;k<b.W.length;k++){if(b.W[k][2]<0)continue;const dr=b.W[k][0]-a.W[k][0];sr+=Math.abs(dr);sv+=ds/b.W[k][1];const o=SM[b.vm]=SM[b.vm]||[0,0];o[0]+=Math.abs(dr);o[1]+=ds/b.W[k][1]}}
const cl=L.filter(f=>!f.bt&&f.vm!=='boat').map(f=>f.clr).filter(x=>x!=null),cw=L.filter(f=>!f.bt&&!f.air).map(f=>f.cw).filter(x=>x!=null);const modes={};L.forEach(f=>modes[f.vm]=(modes[f.vm]||0)+1);
const R={modes,boatFrames:L.filter(f=>f.bt).length,hits:hit.filter(Boolean).length,city:CITY,mode:MODE,frames:L.length,fps:+(L.length/(tt[tt.length-1]-tt[0])).toFixed(1),slipDeg:{n:sl.length,mean:+(sl.reduce((a,b)=>a+b,0)/Math.max(1,sl.length)).toFixed(2),p95:+(sl[Math.floor(sl.length*.95)]||0).toFixed(2),max:+(sl[sl.length-1]||0).toFixed(2)},
 camLagS:+best[1].toFixed(2),camRms:+deg(Math.sqrt(best[0])).toFixed(1),wheelSpinRatio:+(sr/Math.max(1e-6,sv)).toFixed(2),spinByMode:Object.fromEntries(Object.entries(SM).map(([k,o])=>[k,+(o[0]/Math.max(1e-6,o[1])).toFixed(2)])),minBodyClear:+Math.min(...cl).toFixed(3),minTyreGap:+Math.min(...cw).toFixed(3),maxTyreGap:+Math.max(...cw).toFixed(3),
 tyreGapP50:+cw.sort((a,b)=>a-b)[cw.length>>1].toFixed(3),maxKmh:+(Math.max(...L.map(f=>Math.abs(f.v)))*3.6).toFixed(0),turned:+deg(H[H.length-1]-H[0]).toFixed(0)};
console.log(JSON.stringify(R));require('fs').writeFileSync(OUT+'_log.json',JSON.stringify(L.map(f=>({...f,W:undefined}))));console.log('errs',JSON.stringify(errs));await br.close()})().catch(e=>{console.log('ERR',e.message);process.exit(1)});
