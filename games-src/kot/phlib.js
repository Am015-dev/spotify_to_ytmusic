// shared helpers for the phone tests / measurements
const PW=require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const path=require('path'),fs=require('fs');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const SIZES=process.env.SIZES?process.env.SIZES.split(',').map(s=>s.split('x').map(Number)):[[390,844],[844,390],[360,740],[740,360]];
async function launch(){return PW.chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']})}
async function open(br,W,H,q,opts){opts=opts||{};const ctx=await br.newContext({viewport:{width:W,height:H},deviceScaleFactor:1,hasTouch:true,isMobile:true});
  const pg=await ctx.newPage();const errs=[];pg.on('console',m=>{if(m.type()==='error'&&!/fonts\.g|ERR_|net::/.test(m.text()))errs.push(m.text())});pg.on('pageerror',e=>errs.push(String(e)));pg.setDefaultTimeout(120000);
  if(!opts.tour)await pg.addInitScript(()=>{try{localStorage.setItem('ccs_tour2','1')}catch(e){}});
  await pg.goto('file://'+path.resolve(opts.file||path.join(__dirname,'kot2.html'))+(q||'')+(/gfx=/.test(q||'')?'':((q||'').includes('?')?'&':'?')+'gfx=low'));await sleep(1200);return {ctx,pg,errs}}
// start a solo game, dismiss the story/tips, wait for the human's roll phase
async function startSolo(pg,opts){opts=opts||{};
  await pg.evaluate(o=>{ANIM=o.anim?1:0;AIDELAY=60;UI.n=o.n||4;if(o.evo&&!UI.evo)UI.evo=true;},opts);
  await pg.click('[data-start="solo"]');await sleep(700);
  await pg.evaluate(()=>{UI.tour=false});
  await waitHuman(pg,'roll');return}
async function waitHuman(pg,phase,ms){const t0=Date.now();while(Date.now()-t0<(ms||90000)){
  const st=await pg.evaluate(()=>({g:!!G,ht:typeof humanTurn==='function'&&humanTurn(),ph:G&&G.phase,busy:UI.busy,ch:!!UI.choice,intro:UI.intro,coach:UI.coach}));
  if(st.intro){const b=await pg.$('[data-a="story"]');if(b){await b.click();await sleep(200);continue}}
  if(st.coach>=0){const b=await pg.$('[data-tour="skip"]');if(b){await b.click();await sleep(150);continue}}
  if(st.g&&st.ht&&(!phase||st.ph===phase)&&!st.busy&&!st.ch)return true;
  if(st.ch){const b=await pg.$('#choice .btn.primary[data-opt]')||await pg.$('#choice [data-opt]');if(b){await b.click();await sleep(200)}}
  await sleep(150)}throw new Error('waitHuman timeout '+phase)}
// measurements
async function measure(pg){return pg.evaluate(()=>{
  const R=e=>{const r=e.getBoundingClientRect();return [r.left,r.top,r.width,r.height].map(x=>Math.round(x*10)/10)};
  const bd=document.querySelector('.gx-board'),cv=document.getElementById('c3');const out={vw:innerWidth,vh:innerHeight,board:R(bd),canvas:R(cv),ph:document.documentElement.className};
  // arena: projected ring (radius 11.8) + seat centres
  try{const cam=V3.cam;cam.updateMatrixWorld();const rc=cv.getBoundingClientRect();let mnx=1e9,mxx=-1e9,mny=1e9,mxy=-1e9;
    for(let k=0;k<24;k++){const a=k/24*Math.PI*2;const v=new THREE.Vector3(Math.cos(a)*11.8,.25,Math.sin(a)*11.8).project(cam);const x=(v.x+1)/2*rc.width,y=(1-v.y)/2*rc.height;mnx=Math.min(mnx,x);mxx=Math.max(mxx,x);mny=Math.min(mny,y);mxy=Math.max(mxy,y)}
    out.city=[Math.round(mxx-mnx),Math.round(mxy-mny)];
    // 3D die size: project the cube centre and an offset of 1.05 units
    if(V3.dice[0]){const w=V3.dice[0].m.getWorldPosition(new THREE.Vector3());const a=w.clone().project(cam),b=w.clone().add(new THREE.Vector3(1.05,0,0)).project(cam);out.die3d=Math.round(Math.abs(b.x-a.x)/2*rc.width)}
    // Crown City spot (Downtown) size ~ 2*radius
    }catch(e){out.err=String(e)}
  const h=document.querySelector('#dice .die,#psd .die');if(h){const r=h.getBoundingClientRect();out.dieHtml=[Math.round(r.width),Math.round(r.height)]}
  // smallest visible tap target (anything clickable that is actually on screen and not in a hidden drawer)
  const els=[...document.querySelectorAll('button,[data-act],[data-die],[data-card],[data-opt],[data-gx],[data-a],[data-tour],g.seat,.tag')].filter(e=>{const r=e.getBoundingClientRect();if(r.width<1||r.height<1)return false;const cs=getComputedStyle(e);if(cs.visibility==='hidden'||cs.display==='none'||+cs.opacity===0)return false;if(r.right<0||r.bottom<0||r.left>innerWidth||r.top>innerHeight)return false;if(e.closest('.gx-drawer:not(.on)'))return false;if(e.closest('[hidden],.hidden'))return false;const x=r.left+r.width/2,y=r.top+r.height/2;const t=document.elementFromPoint(x,y);return t&&(t===e||e.contains(t))});
  let min=null;for(const e of els){const r=e.getBoundingClientRect();const m=Math.min(r.width,r.height);if(!min||m<min.m)min={m:Math.round(m),w:Math.round(r.width),h:Math.round(r.height),el:(e.id?'#'+e.id:'')+'.'+String(e.className).split(' ').join('.')+(e.dataset&&Object.keys(e.dataset).length?'['+Object.keys(e.dataset)[0]+'='+Object.values(e.dataset)[0]+']':'')+':'+(e.textContent||'').trim().slice(0,12)}}
  out.minTap=min;out.nTap=els.length;
  out.scroll=[document.documentElement.scrollWidth,document.documentElement.scrollHeight];return out})}
module.exports={PW,path,fs,sleep,SIZES,launch,open,startSolo,waitHuman,measure};
