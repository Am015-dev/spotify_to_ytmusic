// tRamp.js (v88z): every free-roam ramp in a city: static checks (approach / body / landing colliders, kerb step, road under the
// approach) + a real keyboard drive at it (start 55 m before the low end, ArrowUp held, ◀▶ keys steer at the ramp axis; no forces).
// reachable = the car leaves THIS ramp airborne (RO.takeoff.r === ramp). usage: node tools/tRamp.js <url> <outdir> [fra|ath] [ids…]
const fs=require('fs'),path=require('path');const {chromium}=require('/opt/node22/lib/node_modules/playwright');const {boot}=require('./d24lib.js');
const URL=process.argv[2]||'http://127.0.0.1:8766/local_dbg.html',OUT=process.argv[3]||'qa_ramp',CITY=process.argv[4]||'fra',ONLY=process.argv.slice(5).map(Number);fs.mkdirSync(OUT,{recursive:true});
const TAG={0xffb020:'street',0xff5a1c:'hill/biome/autobahn',0xffcd03:'longjump',0xff2d55:'M1 story',0xffd12c:'OTG roof',0x5dffb0:'OTG big',0xff2d95:'OTG',0xff8a1c:'lively'};
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const {p,errs,shot}=await boot(b,{city:CITY,url:URL,phone:false});
 const list=await p.evaluate(()=>{const M=__mho,R=M.RO,ath=M.cid()==='ath';
  const onRoad=(x,z)=>{try{if(ath){const r=M.athRoad(x,z,48);return!!r&&r.e<=0}return!(M.roadD(x,z)>0)}catch(e){return null}};
  return R.ramps.map((r,i)=>{const s=Math.sin(r.h),c=Math.cos(r.h),pt=(a,b)=>[r.x+s*a+c*b,r.z+c*a-s*b];const lo=-r.len/2;
   const app=[],body=[],land=[];let kerb=0,road=0,nr=0;
   for(let d=2;d<=45;d+=3)for(const bb of[-r.w/3,0,r.w/3]){const[x,z]=pt(lo-d,bb),g=M.gnd(x,z,r.y0+6);const h=M.roamHitAt(x,z,1.6,g+.6);if(h)app.push(d);if(bb===0){nr++;if(onRoad(x,z))road++}}
   {const[x,z]=pt(lo-1,0),g=M.gnd(x,z,r.y0+6);kerb=+(r.y0-g).toFixed(2)}
   for(let a=lo;a<=r.len/2;a+=2)for(const bb of[-r.w/3,0,r.w/3]){const[x,z]=pt(a,bb),y=r.y0+(a-lo)/r.len*r.hgt;if(M.roamHitAt(x,z,1.4,y+.6))body.push(+a.toFixed(0))}
   for(let d=2;d<=40;d+=3){const[x,z]=pt(r.len/2+d,0);const y=r.y0+r.hgt+Math.max(0,4-d*.08);if(M.roamHitAt(x,z,1.6,y))land.push(d)}
   return{i,x:+r.x.toFixed(0),z:+r.z.toFixed(0),h:+r.h.toFixed(2),len:r.len,hgt:r.hgt,w:r.w,y0:+r.y0.toFixed(1),dk:r.dk,col:r.col,
    appBlk:[...new Set(app)].slice(0,6),bodyBlk:[...new Set(body)].slice(0,6),landBlk:land.slice(0,6),kerb,roadPct:Math.round(100*road/Math.max(1,nr))}})});
 const res=[];
 for(const r of list){if(ONLY.length&&!ONLY.includes(r.i))continue;
  // ROUTE=1: a person's way there: start on a street ~150 m back, follow the road graph (GPS path) to the run-up point, then aim at the ramp
  if(process.env.ROUTE){const rt=await p.evaluate(([i])=>{const M=__mho,R=M.RO,r=R.ramps[i];const s=Math.sin(r.h),c=Math.cos(r.h),d=r.len/2+45,ax=r.x-s*d,az=r.z-c*d;
     const q0=M.rsnap(ax-s*150,az-c*150,300);if(!q0)return null;let P=null;try{P=M.qv.path(q0[0],q0[1],ax,az).P}catch(e){}if(!P||P.length<2)return null;P.push([ax,az],[r.x,r.z],[r.x+s*r.len,r.z+c*r.len]);
     R.ch=null;R.sp=null;R.wk=null;R.hp=100;M.warp(P[0][0],P[0][1],Math.atan2(P[1][0]-P[0][0],P[1][1]-P[0][1]));R.v=0;R.takeoff=null;window.__P=P;window.__pi=0;return P.length},[r.i]);
   let rl=false,stuck=0,hitsR=0,lv=0;if(rt){await p.evaluate(()=>__tick(20));await p.keyboard.down('ArrowUp');let kL=false,kR=false;
    for(let f=0;f<60*40;f+=3){const o=await p.evaluate(([i])=>{const R=__mho.RO,r=R.ramps[i],P=__P;let bi=__pi,bd=1e9;for(let k=__pi;k<Math.min(P.length,__pi+40);k++){const d=Math.hypot(P[k][0]-R.x,P[k][1]-R.z);if(d<bd){bd=d;bi=k}}__pi=bi;
       let k=bi,acc=0;while(k<P.length-1&&acc<10+Math.abs(R.v)*.5){acc+=Math.hypot(P[k+1][0]-P[k][0],P[k+1][1]-P[k][1]);k++}let e=Math.atan2(P[k][0]-R.x,P[k][1]-R.z)-R.h;e=Math.atan2(Math.sin(e),Math.cos(e));
       const a=(R.x-r.x)*Math.sin(r.h)+(R.z-r.z)*Math.cos(r.h);return{e,v:R.v,to:!!(R.takeoff&&R.takeoff.r===r),a,end:bi>=P.length-2}},[r.i]);
     if(o.to)rl=true;if(rl&&o.a>r.len/2+20)break;if(Math.abs(o.v)<1)stuck++;else stuck=0;if(stuck>120){if(process.env.DBG)await shot(path.join(OUT,`${CITY}_stuck${r.i}.jpg`));break}if(lv>8&&o.v<lv*.7)hitsR++;lv=o.v;
     const slow=Math.abs(o.e)>.6&&o.v>12;if(slow){await p.keyboard.up('ArrowUp')}else await p.keyboard.down('ArrowUp');
     const wl=o.e>.05,wr=o.e<-.05;if(wl!==kL){kL=wl;wl?await p.keyboard.down('ArrowLeft'):await p.keyboard.up('ArrowLeft')}if(wr!==kR){kR=wr;wr?await p.keyboard.down('ArrowRight'):await p.keyboard.up('ArrowRight')}
     await p.evaluate(()=>__tick(3))}
    await p.keyboard.up('ArrowUp');if(kL)await p.keyboard.up('ArrowLeft');if(kR)await p.keyboard.up('ArrowRight')}
   if(process.env.DBG)console.log('route end',JSON.stringify(await p.evaluate(([i])=>{const R=__mho.RO,r=R.ramps[i];return{x:R.x,z:R.z,v:R.v,pi:__pi,n:__P.length,P:__P.filter((_,k)=>k%4==0).map(q=>q.map(Math.round))}},[r.i])));
   r.route=rt?{launched:rl,hits:hitsR,stuck:stuck>120}:'no road path'}
  // real drive: warp 55 m behind the low end facing the ramp, hold ArrowUp, keep heading at the ramp line with arrow keys
  const st=await p.evaluate(([i])=>{const M=__mho,R=M.RO,r=R.ramps[i];const s=Math.sin(r.h),c=Math.cos(r.h);const d=r.len/2+55;R.ch=null;R.sp=null;R.wk=null;R.hp=100;M.warp(r.x-s*d,r.z-c*d,r.h);R.v=0;R.takeoff=null;return[R.x,R.z]},[r.i]);
  await p.evaluate(()=>__tick(20));await p.keyboard.down('ArrowUp');let kL=false,kR=false,maxAir=0,launched=false,hits=0,lastV=0,vAt=0,minD=1e9;
  for(let f=0;f<60*9;f+=3){const o=await p.evaluate(([i])=>{const M=__mho,R=M.RO,r=R.ramps[i];const s=Math.sin(r.h),c=Math.cos(r.h);const dx=R.x-r.x,dz=R.z-r.z,a=dx*s+dz*c,bb=dx*c-dz*s;
     // aim at a point on the ramp axis 25 m ahead of the car (or the ramp centre)
     const ta=Math.min(a+25,0),tx=r.x+s*ta,tz=r.z+c*ta;let e=Math.atan2(tx-R.x,tz-R.z)-R.h;e=Math.atan2(Math.sin(e),Math.cos(e));
     return{a,bb,e,v:R.v,air:R.y-M.gnd(R.x,R.z,R.y+.3),to:!!(R.takeoff&&R.takeoff.r===r),y:R.y}},[r.i]);
   if(o.to)launched=true;maxAir=Math.max(maxAir,o.air);minD=Math.min(minD,Math.hypot(o.a,o.bb));if(o.a>-r.len/2-2&&o.a<-r.len/2+2)vAt=o.v;
   if(lastV>8&&o.v<lastV*.7)hits++;lastV=o.v;
   const wantL=o.e>.06,wantR=o.e<-.06;if(wantL!==kL){kL=wantL;wantL?await p.keyboard.down('ArrowLeft'):await p.keyboard.up('ArrowLeft')}if(wantR!==kR){kR=wantR;wantR?await p.keyboard.down('ArrowRight'):await p.keyboard.up('ArrowRight')}
   if(launched&&o.a>r.len/2+30)break;
   await p.evaluate(()=>__tick(3))}
  await p.keyboard.up('ArrowUp');if(kL)await p.keyboard.up('ArrowLeft');if(kR)await p.keyboard.up('ArrowRight');
  const out={...r,tag:TAG[r.col]||r.col,launched,maxAir:+maxAir.toFixed(1),vLip:+(vAt*3.6).toFixed(0),hits,minD:+minD.toFixed(0)};res.push(out);console.log(JSON.stringify(out));
  if(process.env.SHOTS&&(process.env.SHOTS==='all'||process.env.SHOTS.split(',').map(Number).includes(r.i))){
   await p.evaluate(([i])=>{const M=__mho,R=M.RO,r=R.ramps[i];const s=Math.sin(r.h),c=Math.cos(r.h);const d=r.len/2+30;R.ch=null;R.sp=null;R.wk=null;R.hp=100;M.warp(r.x-s*d,r.z-c*d,r.h);R.v=0},[r.i]);await p.evaluate(()=>__tick(20));
   await p.keyboard.down('ArrowUp');for(let f=0;f<60*6;f+=3){const o=await p.evaluate(([i])=>{const R=__mho.RO,r=R.ramps[i];const a=(R.x-r.x)*Math.sin(r.h)+(R.z-r.z)*Math.cos(r.h);return{a,air:R.y-__mho.gnd(R.x,R.z,R.y+.3)}},[r.i]);if(o.a>r.len/2+4&&o.air>2)break;await p.evaluate(()=>__tick(3))}
   await p.keyboard.up('ArrowUp');await shot(path.join(OUT,`${CITY}_ramp${r.i}.jpg`))}}
 const n=res.length,ok=res.filter(r=>r.launched).length;fs.writeFileSync(path.join(OUT,`ramps_${CITY}.json`),JSON.stringify(res,null,1));
 console.log(`RAMPS ${CITY}: ${ok}/${n} reachable · errs ${errs.length}`,errs.slice(0,3));await b.close()})();
