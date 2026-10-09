// tTurn.js (v88z): turn rate vs speed with real keys. On the longest Autobahn straight: reach the target km/h (gas held/pulsed), then hold ◀
// for 1.0 s with gas kept; reports yaw rate (°/s) mean over the hold, peak, and km/h lost. usage: node tools/tTurn.js <url> [forms] [speeds]
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const {boot}=require('./d24lib.js');
const URL=process.argv[2],FORMS=(process.argv[3]||'ship,offroad').split(','),SP=(process.argv[4]||'50,100,150').split(',').map(Number);
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const {p,errs}=await boot(b,{city:'fra',url:URL,phone:false});const out=[];
 const line=await p.evaluate(()=>{let best=null;for(const S of __mho.abS?__mho.abS().map((s,k)=>({...s,k})):[])if(S.ab&&!S.c&&(!best||S.L>best.L))best=S;const P=[];for(let i=0;i<best.n;i+=2){const q=__mho.abPt(best.k,i);P.push([q.x,q.z])}return P});
 for(const form of FORMS)for(const v of SP){
  await p.evaluate(([L,form])=>{const M=__mho,R=M.RO;R.ch=null;R.sp=null;R.wk=null;const i=Math.floor(L.length*.15);M.warp(L[i][0],L[i][1],Math.atan2(L[i+1][0]-L[i][0],L[i+1][1]-L[i][1]));R.vsel=form;window.__L=L;window.__li=i},[line,form]);
  await p.evaluate(()=>__tick(30));let gas=false,steer=0;
  const st=async(c)=>{if(c.gas!==gas){gas=c.gas;gas?await p.keyboard.down('ArrowUp'):await p.keyboard.up('ArrowUp')}if(c.st!==steer){if(steer)await p.keyboard.up(steer<0?'ArrowLeft':'ArrowRight');steer=c.st;if(steer)await p.keyboard.down(steer<0?'ArrowLeft':'ArrowRight')}};
  let ok=false;for(let f=0;f<60*40;f+=3){const o=await p.evaluate(()=>{const R=__mho.RO,L=__L;let bi=__li,bd=1e9;for(let k=Math.max(0,__li-5);k<Math.min(L.length,__li+40);k++){const d=Math.hypot(L[k][0]-R.x,L[k][1]-R.z);if(d<bd){bd=d;bi=k}}__li=bi;
    const k=Math.min(L.length-1,bi+4);let e=Math.atan2(L[k][0]-R.x,L[k][1]-R.z)-R.h;e=Math.atan2(Math.sin(e),Math.cos(e));return{v:R.v*3.6,e,stable:Math.abs(R.yr||0)<.02}});
   await st({gas:o.v<v,st:o.e>.03?-1:o.e<-.03?1:0});if(Math.abs(o.v-v)<3&&o.stable&&Math.abs(o.e)<.03&&f>120){ok=true;break}await p.evaluate(()=>__tick(3))}
  // the turn: hold ◀ 1.0 s, gas pulsed to hold speed
  const h0=await p.evaluate(()=>__mho.RO.h);let pk=0,v0=await p.evaluate(()=>__mho.RO.v*3.6),hs=[];await st({gas:true,st:-1});
  for(let f=0;f<60;f+=2){await p.evaluate(()=>__tick(2));const o=await p.evaluate(()=>({h:__mho.RO.h,yr:__mho.RO.yr||0,v:__mho.RO.v*3.6}));hs.push(o.h);pk=Math.max(pk,Math.abs(o.yr));await st({gas:o.v<v,st:-1})}
  await st({gas:false,st:0});const v1=await p.evaluate(()=>__mho.RO.v*3.6);
  const r={form,kmh:v,reached:ok?Math.round(v0):'no',yawDegS:+((hs[hs.length-1]-h0)*180/Math.PI/1.0).toFixed(1),peakDegS:+(pk*180/Math.PI).toFixed(1),lostKmh:Math.round(v0-v1)};out.push(r);console.log(JSON.stringify(r))}
 console.log('TURN done errs',errs.length);await b.close()})();
