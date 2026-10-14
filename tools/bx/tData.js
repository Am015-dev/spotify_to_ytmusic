// bxT track checks: 📍 GO per track (same spawn as the checklist), then the page's data + input check. FAIL lines only.
// Phone profile (lib.launch: hasTouch, 852x393, GAS automatic on touch), no steering (trk-2, Alex beta.22 "the car drives backwards"):
//  12 s: heading within 20° of the course tangent >= 90 % of samples and never backwards, camera behind the car always, progress along the course > 150 m;
//  then the car is turned backwards (test state only) -> the WRONG WAY rescue must face it along the course within 4 s.
// node tools/bx/tData.js [ids...]   (~90 s for all 4)
const L=require('./lib.js');
const probe=()=>{const B=__bx.BX,V=B.v;let bd=1e9,bs=null;for(const{s}of B.samp){const d=s.p.distanceToSquared(V.p);if(d<bd){bd=d;bs=s}}const fh=Math.hypot(bs.F.x,bs.F.z)||1,c=B.cam.position;
 return{t:B.m.t,hd:(V.F.x*bs.F.x+V.F.z*bs.F.z)/fh,vt:(V.v.x*bs.F.x+V.v.z*bs.F.z)/fh,cb:(V.p.x-c.x)*V.F.x+(V.p.z-c.z)*V.F.z,tu:B.m.turned||0}};
(async()=>{const ids=process.argv.slice(2).length?process.argv.slice(2):['bx-t-cliff','bx-t-canyon','bx-t-lagoon','bx-t-city'];const {b,p,E}=await L.launch();
 for(const id of ids){await p.evaluate(i=>__chk.go('bxT/'+i),id);await L.sleep(200);await p.waitForFunction(()=>__bx.BX.m&&__bx.BX.m.t>3.3,null,{timeout:60000});
  const r=await p.evaluate(i=>__bx.check(i),id);const F=r.ok?[]:r.msg.split(/, | \| /).filter(x=>x.startsWith('✘'));
  let n=0,ok20=0,back=0,camF=0,prog=0,last=null;while(true){await L.sleep(250);const q=await p.evaluate(probe);if(last)prog+=q.vt*(q.t-last);last=q.t;n++;if(q.hd>=Math.cos(20/180*Math.PI))ok20++;if(q.hd<0)back++;if(q.cb<=0)camF++;if(q.t>12)break}
  if(ok20/n<.9)F.push(`✘ heading within 20° only ${Math.round(ok20/n*100)} %`);if(back)F.push(`✘ backwards in ${back} samples`);if(camF)F.push(`✘ camera in front in ${camF} samples`);if(prog<150)F.push(`✘ progress ${prog.toFixed(0)} m in 9 s`);
  // on the START piece, mid-road (dry land, away from the rails, which already slide a car round), facing backwards at 8 m/s: the rescue must fire
  const tu0=await p.evaluate(()=>{const B=__bx.BX,V=B.v,st=B.pcs.find(q=>!q.dead&&q.def.start),bs=st.S[0][st.S[0].length>>1],fh=Math.hypot(bs.F.x,bs.F.z);
   V.p.set(bs.p.x,bs.p.y+.6,bs.p.z);V.F.set(-bs.F.x/fh,0,-bs.F.z/fh);V.U.set(0,1,0);V.v.copy(V.F).multiplyScalar(8);return B.m.turned||0});
  let tw=0,q=null;for(;tw<16;tw++){await L.sleep(250);q=await p.evaluate(probe);if(q.hd>=.9)break}
  if(tw>=16)F.push(`✘ still facing backwards 4 s after a wrong-way spin (heading ${q.hd.toFixed(2)})`);
  console.log(id,F.length?'FAIL':'PASS',F.join(', '),process.env.V?r.msg+` | heading ok ${Math.round(ok20/n*100)} %, progress ${prog.toFixed(0)} m, recovered in ${(tw*.25).toFixed(2)} s`:'')}
 console.log('errors',E.length?E.slice(0,3).join(' / '):'none');await b.close()})();
