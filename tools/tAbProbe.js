// tAbProbe.js (v88z): what stops a car at top speed on the Autobahn at x≈4060 z≈-3362 (tSpeed hot-rod crash). Follows __qs.line(true) from
// x≈4500 at 230 km/h (ArrowUp held, keys steer) and logs every 6 frames near the spot: pos, speed, height over ground, nearest traffic, collider hit.
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const {boot}=require('./d24lib.js');
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const {p,errs,shot}=await boot(b,{city:'fra',url:process.argv[2],phone:true});
 await p.evaluate(()=>{const M=__mho,R=M.RO;R.ch=null;R.sp=null;window.__L=__qs.line(true);const L=__L;let bi=0,bd=1e9;L.forEach((q,k)=>{const d=Math.hypot(q[0]-4500,q[1]+3270);if(d<bd){bd=d;bi=k}});
  M.warp(L[bi][0],L[bi][1],Math.atan2(L[bi+1][0]-L[bi][0],L[bi+1][1]-L[bi][1]));R.vsel='ship';window.__li=bi});await p.evaluate(()=>__tick(30));
 await p.evaluate(()=>{__mho.RO.v=225/3.6});await p.keyboard.down('ArrowUp');let kL=0,kR=0;
 for(let f=0;f<60*14;f+=3){const o=await p.evaluate(()=>{const M=__mho,R=M.RO,L=__L;let bi=__li,bd=1e9;for(let k=Math.max(0,__li-5);k<Math.min(L.length,__li+60);k++){const d=Math.hypot(L[k][0]-R.x,L[k][1]-R.z);if(d<bd){bd=d;bi=k}}__li=bi;
   let k=bi,acc=0;while(k<L.length-1&&acc<30+Math.abs(R.v)*.6){acc+=Math.hypot(L[k+1][0]-L[k][0],L[k+1][1]-L[k][1]);k++}let e=Math.atan2(L[k][0]-R.x,L[k][1]-R.z)-R.h;e=Math.atan2(Math.sin(e),Math.cos(e));
   let nc=null,nd=1e9;for(const c of M.HUB.cars){if(c.dead>0)continue;const d=Math.hypot(c.x-R.x,c.z-R.z);if(d<nd){nd=d;nc=c}}
   const g=M.gnd(R.x,R.z,R.y+.3);return{e,x:Math.round(R.x),z:Math.round(R.z),y:+R.y.toFixed(1),g:+g.toFixed(1),v:Math.round(Math.abs(R.v)*3.6),h:+R.h.toFixed(2),lineD:+bd.toFixed(1),
    car:nc?[Math.round(nd),nc.type||nc.k,Math.round(nc.v*3.6||0)]:null,hit:!!M.roamHitAt(R.x,R.z,1.6,R.y+.6),ramp:!!R.takeoff,wk:!!R.wk,cam:R.camMode||null}});
  if(o.x<4250)console.log(JSON.stringify(o));if(o.x<4250&&o.v<60){await shot('qa_speed2/abprobe_stop.jpg');break}
  const wl=o.e>.03,wr=o.e<-.03;if(wl!=kL){kL=wl;wl?await p.keyboard.down('ArrowLeft'):await p.keyboard.up('ArrowLeft')}if(wr!=kR){kR=wr;wr?await p.keyboard.down('ArrowRight'):await p.keyboard.up('ArrowRight')}
  await p.evaluate(()=>__tick(3))}
 console.log('errs',errs.length);await b.close()})();
