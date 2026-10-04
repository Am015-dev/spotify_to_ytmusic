// tHop: no hopping. In every district a keyboard bot (real controls, 1/60 s steps) drives GPS routes across the district and along the
// hill streets (road profiles); any airborne frame (car > 0.5 m above the ground) or vertical-velocity spike (a jump of > 2.5 m/s in one frame) that is not within 60 m of a ramp fails.
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const U='http://127.0.0.1:8766/'+(process.env.PAGE||'local_dbg.html');
const ROUTES={A:[[-900,300,600,-300],[700,600,-800,-900],[-600,-600,500,800]],B:[[800,-1200,2600,1000],[900,900,2500,-1200],[1100,-300,1900,800]],C:[[2800,0,5000,4300],[3200,2500,4600,900]],D:[[5400,4000,7700,8300],[7600,4200,5600,6500]]};
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});let fails=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fails++};
for(const d of (process.env.D||'A,B,C,D').split(',')){const p=await (await b.newContext({viewport:{width:960,height:540}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.setDefaultTimeout(900000);
 await p.goto(U);await p.waitForFunction(()=>window.__mho&&window.__mho.state==='menu');
 await p.evaluate(d=>{localStorage.clear();localStorage.setItem('mho_slot','1');localStorage.setItem('mho_city@1','ath');localStorage.setItem('mho_athd@1',d);localStorage.setItem('mho_roam.ath@1','{"tut":1,"otg":{}}');localStorage.setItem('mho_story.ath@1','{"seen":1}')},d);await p.reload();await p.waitForFunction(()=>window.__mho&&window.__mho.state==='menu');
 await p.evaluate(()=>__mho.enterRoam());await p.waitForFunction(()=>__mho.state==='roam');await p.evaluate(()=>{try{__mho.storyClose()}catch(e){}});
 const r=await p.evaluate(R0=>{const M=__mho,R=M.RO,K=M.K,res=[];
  const drive=(pts,max,vmax)=>{const cum=[0];for(let k=1;k<pts.length;k++)cum.push(cum[k-1]+Math.hypot(pts[k][0]-pts[k-1][0],pts[k][1]-pts[k-1][1]));let lastTO=R.takeoff,jump=0,i=0,t=0,air=0,spk=0,st=0,mst=0,pvy=0,dist=0,px=R.x,pz=R.z,worst=null,ymax=-1e9;
   for(t=0;t<max;t++){let bj=i,bd=1e9;for(let k=i;k<Math.min(pts.length,i+60);k++){const dd=Math.hypot(pts[k][0]-R.x,pts[k][1]-R.z);if(dd<bd){bd=dd;bj=k}}i=bj;const LA=9+Math.abs(R.v)*.35;let k=i;while(k<pts.length-1&&cum[k]-cum[i]<LA)k++;
    let a=Math.atan2(pts[k][0]-R.x,pts[k][1]-R.z)-R.h;a=Math.atan2(Math.sin(a),Math.cos(a));const vt=vmax*Math.max(.4,1-Math.abs(a)*.9);K.ArrowLeft=a>.035;K.ArrowRight=a<-.035;K.ArrowUp=R.v<vt;K.ArrowDown=R.v>vt+6;M.roamSim(1);
    dist+=Math.hypot(R.x-px,R.z-pz);px=R.x;pz=R.z;const g=M.gnd(R.x,R.z,R.y+.3);if(R.takeoff&&R.takeoff!==lastTO){lastTO=R.takeoff;jump=1}let land=0;if(jump&&R.y<=g+.06){jump=0;land=1}const ramp=land||jump||(R.ramps||[]).some(q=>Math.hypot(q.x-R.x,q.z-R.z)<60)||R.lastRamp;ymax=Math.max(ymax,R.y);
    if(!ramp){const vy=R.vy||0;if(R.y>g+.5){air++;if(!worst)worst=['air',Math.round(R.x),Math.round(R.z),+(R.y-g).toFixed(2),'ramps',(R.ramps||[]).length,Math.round(Math.min(1e9,...(R.ramps||[]).map(q=>Math.hypot(q.x-R.x,q.z-R.z))))]}if(Math.abs(vy-pvy)>2.5){spk++;if(!worst)worst=['vy',Math.round(R.x),Math.round(R.z),+vy.toFixed(2)]}pvy=vy}else pvy=R.vy||0;
    if(Math.abs(R.v)<2)st++;else st=0;mst=Math.max(mst,st);if(i>=pts.length-3)break}
   K.ArrowLeft=K.ArrowRight=K.ArrowUp=K.ArrowDown=false;return{t:+(t/60).toFixed(1),dist:Math.round(dist),air,spk,worst,stuck:+(mst/60).toFixed(1),done:i>=pts.length-3,ymax:+ymax.toFixed(1)}};
  for(const[e0,n0,e1,n1]of R0){const[x0,z0]=M.W(e0,n0),[x1,z1]=M.W(e1,n1),q0=M.rsnap(x0,z0,300),q1=M.rsnap(x1,z1,300);const P=M.qv.path(q0[0],q0[1],q1[0],q1[1]).P;if(P.length<5){res.push({route:[e0,n0,e1,n1],skip:'no path'});continue}
    M.warp(P[0][0],P[0][1],Math.atan2(P[2][0]-P[0][0],P[2][1]-P[0][1]));M.roamSim(3);res.push({route:[e0,n0,e1,n1],...drive(P,150*60,45)})}
  for(const H of M.hillRoads()){M.warp(H[0][0],H[0][1],Math.atan2(H[2][0]-H[0][0],H[2][1]-H[0][1]));M.roamSim(3);res.push({hill:H.name,...drive(H,90*60,30)})}
  return{res,prof:M.roadProf()}},ROUTES[d]);
 console.log('INFO',d,JSON.stringify(r.prof));for(const q of r.res){if(q.skip){console.log('INFO skip',JSON.stringify(q));continue}ok(q.air===0&&q.spk===0&&q.dist>(q.hill?100:200),`district ${d} ${q.hill?'hill street '+q.hill:'route '+q.route.join(',')}: ${q.dist} m in ${q.t} s (top ${q.ymax} m), airborne frames ${q.air}, vy spikes ${q.spk} ${q.worst?JSON.stringify(q.worst):''}${q.stuck>2?' stuck '+q.stuck+' s':''}`)}
 ok(!errs.length,`district ${d}: no page errors ${JSON.stringify(errs.slice(0,2))}`);await p.context().close()}
console.log(fails?`FAILED ${fails}`:'ALL PASS');await b.close();process.exit(fails?1:0)})();
