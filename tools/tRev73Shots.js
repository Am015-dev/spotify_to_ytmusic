// tRev73Shots (rev-73): Westend Split start + jump, camera pull-in near a building, STORY first drivable frame + 10 s, Athens roam. node tools/tRev73Shots.js <base url> <outdir>
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const [BASE,OUT]=process.argv.slice(2);
const L=['--use-angle=swiftshader','--enable-unsafe-swiftshader'];
async function mk(){const b=await chromium.launch({args:L});const c=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:1,isMobile:true,hasTouch:true});const p=await c.newPage();p.setDefaultTimeout(600000);p.on('pageerror',e=>console.log('PAGEERR',String(e).slice(0,160)));return{b,c,p}}
const ready=p=>p.waitForFunction(()=>window.__chk&&window.__tq&&__tq.ready,null,{timeout:400000});
(async()=>{const which=process.argv[4]||'all';
 if(which==='all'||which==='fra'){const{b,p}=await mk();await p.goto(BASE+'?test=fra');await ready(p);await p.waitForTimeout(4000);
  console.log('start',await p.evaluate(()=>__chk.GO['tk1/items'][0].fn()));await p.waitForTimeout(2500);await p.screenshot({path:OUT+'/a_westend_start.png'});
  for(let i=0;i<8;i++){await p.waitForTimeout(1500);await p.screenshot({path:OUT+'/b_westend_t'+i+'.png'})}
  // camera pull-in near a building: scan x1240-1640 z-120..35 for a spot where the camera pulled in
  await p.evaluate(()=>__chk.go('bv1/fra')).catch(()=>{});await p.waitForTimeout(3000);
  const pts=await p.evaluate(()=>{const o=[];for(let x=1240;x<=1640;x+=40)for(let z=-120;z<=35;z+=30){try{const r=__fcShot(x,z,60);o.push([x,z,r[0],r[1],Math.hypot(r[2]-r[0],r[3]-r[1]),r[4]])}catch(e){}}return o});
  pts.sort((a,b)=>a[4]-b[4]);console.log('closest cams',JSON.stringify(pts.slice(0,4)));const t=pts[0];
  if(t){await p.evaluate(t=>__fcShot(t[0],t[1],60),t);await p.waitForTimeout(1500);await p.screenshot({path:OUT+'/c_camera_pullin.png'})}
  await b.close()}
 if(which==='all'||which==='story'){const{b,c,p}=await mk();const cdp=await c.newCDPSession(p);
  await p.goto(BASE);await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:250});
  await p.evaluate(()=>{localStorage.clear();localStorage.setItem('mho_slot','1')});await p.reload();await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:250});
  const raw=async(x,y)=>{await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y,id:0}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]})};
  const tap=async s=>{const q=await p.evaluate(s=>{const e=document.querySelector(s);if(!e)return null;const r=e.getBoundingClientRect();return r.width>4?[r.left+r.width/2,r.top+r.height/2]:null},s);if(!q)return false;await raw(q[0],q[1]);await p.waitForTimeout(150);return true};
  await tap('#hcStory');await p.waitForTimeout(500);await tap('#slotList .go');const CONT=['#storyGo','#m1Cs','#rcGo','#ogRetryB','.m1go','#resBtn','#tutSkip'];
  for(let i=0;i<900;i++){if(await p.evaluate(()=>__mho.state==='roam'&&!(__mho.LD&&__mho.LD.on)))break;for(const s of CONT)if(await tap(s))break;await p.waitForTimeout(500)}
  await p.screenshot({path:OUT+'/d_story_first.png'});console.log('story first frame');await p.waitForTimeout(10000);await p.screenshot({path:OUT+'/e_story_plus10s.png'});await b.close()}
 if(which==='all'||which==='ath'){const{b,p}=await mk();await p.goto(BASE+'?test=ath');await ready(p);await p.waitForTimeout(3000);await p.evaluate(()=>__chk.go('bv1/ath')).catch(()=>{});await p.waitForTimeout(6000);await p.screenshot({path:OUT+'/f_athens_roam.png'});await b.close()}
})();
