// in-page bot for M1 missions: drives along the GPS line at spd m/s (teleport steps), rams goons, smashes booths, drifts, jumps with real physics.
// Scenes are skipped (counted). Returns game seconds used in this call plus event log.
module.exports=`window.__m1bot=(spd,maxT,o={})=>{const M=__mho,R=M.RO,Q=M.qv,dt=1/60;let t=0;const log=window.__m1log=window.__m1log||{cs:[],skips:0,gt:0,ph:[]};const B=window.__m1b=window.__m1b||{};
 const step=()=>{M.roamSim(1);t+=dt;log.gt+=dt};
 const appr=(tx,tz,sp)=>{const d=Math.hypot(tx-R.x,tz-R.z);if(d<30){const st=Math.min(d,sp*dt);R.x+=(tx-R.x)/(d||1)*st;R.z+=(tz-R.z)/(d||1)*st}else{if(!B.ap||Math.hypot(B.ap[0]-tx,B.ap[1]-tz)>10){B.ap=[tx,tz];B.apP=M.qv.path(R.x,R.z,tx,tz).P;B.api=0}const P=B.apP;let rem=sp*dt,i=B.api;while(rem>0&&i<P.length-1){const a=P[i+1],dd=Math.hypot(a[0]-R.x,a[1]-R.z);if(dd>rem){R.x+=(a[0]-R.x)/dd*rem;R.z+=(a[1]-R.z)/dd*rem;rem=0}else{R.x=a[0];R.z=a[1];rem-=dd;i++}}B.api=i;if(rem>0){const dd=Math.hypot(tx-R.x,tz-R.z)||1;R.x+=(tx-R.x)/dd*Math.min(rem,dd);R.z+=(tz-R.z)/dd*Math.min(rem,dd)}}R.y=M.gnd(R.x,R.z,R.y+4);R.v=0};
 while(R.ch&&t<maxT){const cs=__m1.cs();if(cs){if(o.stopCs&&!cs.seen){return{t:+t.toFixed(1),on:true,cs}}log.cs.push({gt:+log.gt.toFixed(1),who:cs.who,n:cs.n});if(o.noSkip){step();continue}__m1.skip();log.skips++;continue}
  const c=Q.ch();if(!c)break;if(c.cd>0){step();continue}const h=__m1.hint();if(!h){step();continue}
  if(log.ph[log.ph.length-1]!==h.ph){log.ph.push(h.ph);if(o.brkPh&&log.ph.length>1)return{t:+t.toFixed(1),on:true,ph:h.ph}}
  if(o.idle){R.v=0;step();continue}
  if(h.mode==='drift'){M.K.KeyX=true;M.K.ArrowLeft=true;M.K.ArrowUp=true;if(Math.abs(R.v)<30)R.v=34;step();B.dr=1;continue}if(B.dr){B.dr=0;M.K.KeyX=false;M.K.ArrowLeft=false;M.K.ArrowUp=false}
  if(h.mode==='chain'){__m1.chain(16);step();continue}
  if(h.mode==='push'&&h.ball){const gx=h.x-h.ball.x,gz=h.z-h.ball.z,gd=Math.hypot(gx,gz)||1,qx=h.ball.x-gx/gd*12,qz=h.ball.z-gz/gd*12,dq=Math.hypot(qx-R.x,qz-R.z);
    if(dq>4&&!B.push){appr(qx,qz,spd);R.h=R.vh=Math.atan2(gx,gz);step();continue}
    B.push=(B.push||0)+1;R.h=R.vh=Math.atan2(h.ball.x-R.x,h.ball.z-R.z);R.v=30;step();if(B.push>40)B.push=0;continue}
  if(h.mode==='jump'){const da=Math.hypot(h.ax-R.x,h.az-R.z);if(!B.jmp&&da>6){appr(h.ax,h.az,spd);step();continue}
    if(!B.jmp){B.jmp=1;B.jt=0;R.x=h.ax;R.z=h.az;R.h=R.vh=Math.atan2(h.ramp.x-h.ax,h.ramp.z-h.az);R.v=55}B.jt+=dt;if(!R.takeoff&&R.y<=M.gnd(R.x,R.z,R.y+4)+.3)R.h=R.vh=Math.atan2(h.ramp.x-h.ax,h.ramp.z-h.az);if(R.y<=M.gnd(R.x,R.z,R.y+4)+.3)R.v=Math.max(R.v,55);step();if(B.jt>5){B.jmp=0;B.tries=(B.tries||0)+1}continue}
  B.jmp=0;
  if(h.x==null){step();continue}
  const tg={x:h.x,z:h.z},dT=Math.hypot(tg.x-R.x,tg.z-R.z);let sp=spd;if(h.mode==='ram'||h.mode==='smash')sp=Math.max(spd,60);
  if(h.mode==='follow'&&dT<30){R.v=0;step();continue}
  let nx,nz;const N=Q.nav();
  if(dT<((h.mode==='ram'||h.mode==='smash'||h.mode==='follow')?70:14)||!N||N.n<2){const st=Math.min(sp*dt,Math.max(0,dT-(h.mode==='stop'?0:1)));nx=R.x+(tg.x-R.x)/(dT||1)*st;nz=R.z+(tg.z-R.z)/(dT||1)*st}
  else{const P=N.P;if(B.P!==P){B.P=P;B.i=0}let bi=B.i,bd=1e18;for(let i=B.i;i<Math.min(P.length,B.i+30);i++){const d=(P[i][0]-R.x)**2+(P[i][1]-R.z)**2;if(d<bd){bd=d;bi=i}}B.i=bi;let rem=sp*dt,x=R.x,z=R.z,i=bi;while(rem>0&&i<P.length-1){const a=P[i+1],d=Math.hypot(a[0]-x,a[1]-z);if(d>rem){x+=(a[0]-x)/d*rem;z+=(a[1]-z)/d*rem;rem=0}else{x=a[0];z=a[1];rem-=d;i++}}if(rem>0){const d=Math.hypot(tg.x-x,tg.z-z)||1;x+=(tg.x-x)/d*Math.min(rem,d);z+=(tg.z-z)/d*Math.min(rem,d)}nx=x;nz=z}
  R.h=Math.atan2(nx-R.x,nz-R.z)||R.h;R.vh=R.h;R.x=nx;R.z=nz;R.y=M.gnd(R.x,R.z,R.y+4);
  R.v=(h.mode==='ram'&&dT<22)?(h.v||30):(h.mode==='smash'&&dT<35)?(h.v||32):0;M.K.ShiftLeft=!!(h.v>=38&&dT<30);step()}M.K.ShiftLeft=false;
 if(B.dr){B.dr=0;M.K.KeyX=false;M.K.ArrowLeft=false;M.K.ArrowUp=false}return{t:+t.toFixed(1),on:!!R.ch}}`;
