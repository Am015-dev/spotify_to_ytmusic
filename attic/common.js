const {chromium,devices}=require('/opt/node22/lib/node_modules/playwright');
async function boot(o={}){const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const V=o.view||'desk';const ctx=V==='desk'?await b.newContext({viewport:{width:1280,height:720}}):await b.newContext({...devices['iPhone 13'],viewport:V==='land'?{width:844,height:390}:{width:390,height:844}});
 const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('http://127.0.0.1:8766/'+(o.page||'local.html'));await p.waitForFunction(()=>window.__mho&&window.__mho.state==='menu',null,{timeout:240000});
 await p.evaluate((o)=>{localStorage.clear();localStorage.setItem('mho_slot','1');localStorage.setItem('mho_athpre','1');localStorage.setItem('mho_roam@1',JSON.stringify(Object.assign({tut:1,otg:{}},o.roam||{})));localStorage.setItem('mho_set@1',JSON.stringify({thr:'auto',thrV:1}));localStorage.setItem('mho_set',JSON.stringify({thr:'auto',thrV:1}));localStorage.setItem('mho_story@1',JSON.stringify({ath:1}));for(const k in (o.ls||{}))localStorage.setItem(k,o.ls[k])},o);
 await p.reload({timeout:240000});await p.waitForFunction(()=>window.__mho&&window.__mho.state==='menu',null,{timeout:240000});
 if(o.city==='ath'){await p.evaluate(()=>__mho.travel('ath'));await p.waitForTimeout(3000);await p.waitForFunction(()=>window.__mho&&window.__mho.cid&&window.__mho.state!=='loading',null,{timeout:240000});}
 await p.evaluate(()=>{if(__mho.state!=='roam')__mho.enterRoam()});await p.waitForFunction(()=>__mho.state==='roam',null,{timeout:240000});await p.evaluate(()=>__mho.storyClose&&__mho.storyClose());
 return {b,p,errs}}
// in-page bot: drives along the GPS line (teleport-steps at spd m/s), stops at stop-stages, rams chase targets; returns game seconds used
const BOT=`window.__bot=(spd,maxT)=>{const M=__mho,R=M.RO,Q=M.qv;let t=0;const dt=1/60;let last=null;
 while(R.ch&&t<maxT){const c=Q.ch();if(!c)break;if(c.cd>0){M.roamSim(1);t+=dt;continue}const S=c.S||{},N=Q.nav(),tg=c.tgt;
  if(S.t==='vmax'){R.v=70;M.roamSim(1);t+=dt;continue}if(S.t==='dpts'){R.dDir=1;R.dT=3;R.v=30;M.roamSim(1);t+=dt;continue}
  if(!tg||!N||N.n<2){M.roamSim(1);t+=dt;continue}const P=N.P;if(window.__bP!==P){window.__bP=P;window.__bi=0}let bi=window.__bi,bd=1e18;for(let i=window.__bi;i<Math.min(P.length,window.__bi+30);i++){const d=(P[i][0]-R.x)**2+(P[i][1]-R.z)**2;if(d<bd){bd=d;bi=i}}
  window.__bi=bi;const dT=Math.hypot(tg.x-R.x,tg.z-R.z);if(S.t==="chase")spd=Math.max(spd,70);let nx,nz;if(dT<spd*dt*1.5||dT<25){nx=tg.x;nz=tg.z}else{let rem=spd*dt,x=R.x,z=R.z,i=bi;while(rem>0&&i<P.length-1){const a=P[i+1],d=Math.hypot(a[0]-x,a[1]-z);if(d>rem){x+=(a[0]-x)/d*rem;z+=(a[1]-z)/d*rem;rem=0}else{x=a[0];z=a[1];rem-=d;i++}}if(rem>0){const d=Math.hypot(tg.x-x,tg.z-z)||1;x+=(tg.x-x)/d*Math.min(rem,d);z+=(tg.z-z)/d*Math.min(rem,d)}nx=x;nz=z}
  if(dT<25){const st=Math.min(spd*dt,dT);nx=R.x+(tg.x-R.x)/(dT||1)*st;nz=R.z+(tg.z-R.z)/(dT||1)*st}
  R.h=Math.atan2(nx-R.x,nz-R.z)||R.h;R.vh=R.h;R.x=nx;R.z=nz;const ram=S.t==='chase'||S.t==='escort'&&S.amb;R.v=ram&&dT<20?(S.t==='wall'?60:30):S.t==='wall'&&dT<30?60:(S.t==='radar'?50:0);
  if(S.t==='wall'&&dT<30)R.v=60;M.roamSim(1);t+=dt}return t}`;
module.exports={boot,BOT,devices};
