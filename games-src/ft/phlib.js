// shared helpers for the phone tests / measurements (Sands of Qamar)
const PW=require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const path=require('path'),fs=require('fs');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const SIZES=[[390,844],[844,390],[360,740],[740,360]];
async function launch(){return PW.chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']})}
async function open(br,W,H,q,opts){opts=opts||{};const ctx=await br.newContext({viewport:{width:W,height:H},deviceScaleFactor:1,hasTouch:true,isMobile:true,reducedMotion:'reduce'});
  const pg=await ctx.newPage();const errs=[];pg.on('console',m=>{if(m.type()==='error'&&!/fonts\.g|ERR_|net::|CERT/.test(m.text()))errs.push(m.text())});pg.on('pageerror',e=>errs.push(String(e)));pg.setDefaultTimeout(120000);
  await pg.route(/fonts\.(googleapis|gstatic)\.com/,r=>r.abort());await pg.goto('file://'+path.resolve(opts.file||path.join(__dirname,'sands.html'))+(q||'')+((q||'').includes('?')?'&':'?')+'gfx=low',{waitUntil:'domcontentloaded'});await sleep(1500);if(!opts.anim)await pg.addStyleTag({content:'*{transition:none!important;animation:none!important}'});return {ctx,pg,errs}}
// from the opening scene to a running game (human = seat 0), 2 players unless n given
async function startGame(pg,o){o=o||{};
  await pg.evaluate(o=>{try{localStorage.clear()}catch(e){}ANIM=o.anim?1:0;AIDELAY=o.delay||60;setSeed(o.seed||7);UI.setup.np=o.np||2;UI.setup.seats=['human','ai','ai','ai','ai'];Object.assign(UI.setup.ex,o.ex||{});if(o.hot)UI.setup.seats=['human','human','ai','ai','ai']},o);
  const b=await pg.$('[data-ui=play]');if(b){await b.click();await sleep(300)}
  await pg.evaluate(()=>{render()});await pg.click('[data-ui=start]');await sleep(900)}
const MEASURE=`(()=>{
  const R=e=>{const r=e.getBoundingClientRect();return [r.left,r.top,r.width,r.height].map(x=>Math.round(x*10)/10)};
  const cv=V3.r.domElement,rc=cv.getBoundingClientRect(),W=BW(),H=BH();V3.cam.updateMatrixWorld();
  const pj=(x,y,z)=>{const v=new THREE.Vector3(x,y,z).project(V3.cam);return [rc.left+(v.x+1)/2*rc.width,rc.top+(1-v.y)/2*rc.height]};
  let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;const tw=[];
  for(let i=0;i<W*H;i++){const p=tilePos(i);for(const [dx,dz] of [[-1,-1],[1,-1],[1,1],[-1,1]]){const q=pj(p.x+dx*TS/2,TH,p.z+dz*TS/2);x0=Math.min(x0,q[0]);x1=Math.max(x1,q[0]);y0=Math.min(y0,q[1]);y1=Math.max(y1,q[1])}
    const a=pj(p.x-TS/2,TH,p.z),b=pj(p.x+TS/2,TH,p.z),c=pj(p.x,TH,p.z-TS/2),d=pj(p.x,TH,p.z+TS/2);tw.push(Math.min(Math.hypot(a[0]-b[0],a[1]-b[1]),Math.hypot(c[0]-d[0],c[1]-d[1])))}
  // meeple: pawn base diameter and height projected at tile 0
  const p0=tilePos(0);const s=V3.pawnScale||1;const a=pj(p0.x-.195*s,TH,p0.z),b=pj(p0.x+.195*s,TH,p0.z),h0=pj(p0.x,TH,p0.z),h1=pj(p0.x,TH+.64*s,p0.z);
  const els=[...document.querySelectorAll('button,[data-tile],[data-mv],[data-a],[data-gx],[data-ui],[data-dc],[data-sell],[data-dj],[data-pw]')].filter(e=>{const r=e.getBoundingClientRect();if(r.width<1||r.height<1)return false;const cs=getComputedStyle(e);if(cs.visibility==='hidden'||cs.display==='none'||+cs.opacity===0)return false;if(r.right<0||r.bottom<0||r.left>innerWidth||r.top>innerHeight)return false;if(e.closest('.gx-drawer:not(.on)'))return false;if(e.closest('[hidden]'))return false;const t=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return t&&(t===e||e.contains(t))});
  let min=null;for(const e of els){const r=e.getBoundingClientRect();const m=Math.min(r.width,r.height);if(!min||m<min.m)min={m:Math.round(m),w:Math.round(r.width),h:Math.round(r.height),el:(e.id?'#'+e.id:'')+'.'+String(e.className).split(' ').join('.')+':'+(e.textContent||'').trim().slice(0,14)}}
  return {vw:innerWidth,vh:innerHeight,cls:document.documentElement.className,boardEl:R(document.querySelector('.gx-board')),bazaar:[Math.round(x1-x0),Math.round(y1-y0)],tile:Math.round(Math.min(...tw)),tileMax:Math.round(Math.max(...tw)),meepleW:Math.round(Math.hypot(a[0]-b[0],a[1]-b[1])),meepleH:Math.round(Math.hypot(h0[0]-h1[0],h0[1]-h1[1])),minTap:min,nTap:els.length,scroll:[document.documentElement.scrollWidth,document.documentElement.scrollHeight]}})()`;
// bid with the recommended button (data-mv click) until it is my turn to move; returns when me() and phase turn and no move in hand
async function toMyMove(pg,ms){const t0=Date.now();while(Date.now()-t0<(ms||120000)){const st=await pg.evaluate(()=>({g:!!G,me:!!(G&&me()),ph:G&&G.phase,mv:G&&!!G.move,step:G&&G.step,q:G&&!!G.q,over:G&&!!G.over}));
  if(st.over)return false;if(st.me&&st.ph==='turn'&&st.step==='move'&&!st.mv)return true;
  if(st.me&&st.ph==='bid'){await pg.evaluate(()=>{const b=document.querySelector('#dockbody button.go[data-mv]')||document.querySelector('#dockbody button[data-mv]');b&&b.click()})}
  await sleep(200)}throw new Error('toMyMove timeout')}
const measure=pg=>pg.evaluate(MEASURE);
module.exports={PW,path,fs,sleep,SIZES,launch,open,startGame,toMyMove,measure,MEASURE};
// ---- touch helpers ----
async function tileXY(pg,i){return pg.evaluate(i=>{const cv=V3.r.domElement,rc=cv.getBoundingClientRect();V3.cam.updateMatrixWorld();const p=tilePos(i);const v=new THREE.Vector3(p.x,TH,p.z).project(V3.cam);return {x:rc.left+(v.x+1)/2*rc.width,y:rc.top+(1-v.y)/2*rc.height}},i)}
// tap a point after checking what is under it; returns the hit description
async function tapXY(pg,x,y){const hit=await pg.evaluate(([x,y])=>{const e=document.elementFromPoint(x,y);return e?(e.id?'#'+e.id:'')+'.'+String(e.className).split(' ')[0]+'<'+e.tagName:null},[x,y]);await pg.touchscreen.tap(x,y);return hit}
async function tapSel(pg,sel,scope){const r=await pg.evaluate(([sel,scope])=>{const root=scope?document.querySelector(scope):document;if(!root)return null;const els=[...root.querySelectorAll(sel)].filter(e=>{const r=e.getBoundingClientRect();const cs=getComputedStyle(e);return r.width>0&&r.height>0&&cs.visibility!=='hidden'&&!e.disabled&&!e.closest('[hidden]')});
  const e=els[0];if(!e)return null;e.scrollIntoView({block:'nearest'});const r=e.getBoundingClientRect();const x=r.left+r.width/2,y=r.top+r.height/2;const t=document.elementFromPoint(x,y);return {x,y,ok:!!t&&(t===e||e.contains(t)),w:r.width,h:r.height,txt:(e.textContent||'').trim().slice(0,30)}},[sel,scope]);
  if(!r)return null;await pg.touchscreen.tap(r.x,r.y);return r}
module.exports.tileXY=tileXY;module.exports.tapXY=tapXY;module.exports.tapSel=tapSel;
