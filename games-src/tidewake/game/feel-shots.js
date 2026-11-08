// Feel shots: drives a Quick game by touch (phone) or mouse (PC) with real WebGL and saves the brief's shots.
//   node feel-shots.js [W] [H] [outdir]   -> <outdir>/<W>x<H>-<name>.png
const PW=(()=>{try{return require('playwright')}catch(e){return require('/opt/node-tools/node_modules/playwright')}})();
const gx=require('../../scripts/gx-serve.js'),path=require('path'),fs=require('fs');
const W=+process.argv[2]||390,H=+process.argv[3]||844,O=process.argv[4]||path.join(__dirname,'shots');fs.mkdirSync(O,{recursive:true});
const PH=W<800;let P;
async function tapEl(p,loc){const b=await loc.boundingBox();if(!b)return false;const x=b.x+b.width/2,y=b.y+b.height/2;
  const top=await p.evaluate(([x,y,sel])=>{const e=document.elementFromPoint(x,y);return !!e},[x,y]);if(!top)return false;if(PH)await p.touchscreen.tap(x,y);else await p.mouse.click(x,y);return true}
// one decision per call: returns what it tapped (or '')
async function step(p){
  const vis=async sel=>{const l=p.locator(sel+':visible');return (await l.count())?l.first():null};
  let e;
  for(const sel of ['[data-a=sunkok]','[data-ph=dismiss]','[data-a=q]','.gxh-btn:has-text("Got it")','button:has-text("Got it")','[data-ph=showover]']){if((e=await vis(sel))&&await tapEl(p,e))return sel}
  if(e=await vis('[data-a=startmark]')){if(await tapEl(p,e))return 'startmark'}
  const st=await p.evaluate(()=>({over:!!(G&&G.over),phase:G&&G.phase,busy:!!UI.busy,me:typeof sideToAct==='function'?sideToAct():-9,place:!!document.querySelector('[data-a=place]:not([disabled])')}));
  if(st.over)return 'OVER';
  if(st.phase==='setup'&&!st.busy&&st.me===0){
    const pt=await p.evaluate(()=>{const si=startInfo(0);const o=si[Math.floor(si.length/2)];const q=hproj(o.w[0],o.w[1]);return q?{x:q.x,y:q.y}:null});
    if(pt){const r=await p.evaluate(([x,y])=>{const e=document.elementFromPoint(x,y);return e?e.tagName:''},[pt.x,pt.y]);if(PH)await p.touchscreen.tap(pt.x,pt.y);else await p.mouse.click(pt.x,pt.y);return 'mark@'+r}}
  if(e=await vis('[data-a=card]')){
    // try each tile and each turn until Place is enabled, then tap Place
    const n=await p.locator('[data-a=card]:visible').count();
    for(let t=0;t<n;t++){const c=p.locator('[data-a=card]:visible').nth(t);if(!await tapEl(p,c))continue;
      for(let r=0;r<4;r++){const pl=await vis('[data-a=place]:not([disabled])');if(pl){await tapEl(p,pl);return 'place'}
        const tr=await vis('[data-a=rot][data-d="1"]');if(!tr||!await tapEl(p,tr))break;await p.waitForTimeout(120)}}
    const sk=await vis('[data-a=pass]');if(sk&&await tapEl(p,sk))return 'pass';
  }
  if(e=await vis('[data-a=skip]')){return 'wait'}
  return ''}

const shot=async n=>{await P.screenshot({path:O+'/'+W+'x'+H+'-'+n+'.png'});console.log('shot',n)};
(async()=>{const url=await gx.url('tidewake',{file:path.join(__dirname,'tidewake.html'),query:process.env.TWQ||''});
const b=await PW.chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const c=await b.newContext({viewport:{width:W,height:H},hasTouch:PH,isMobile:PH});const p=P=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto(url);await p.waitForTimeout(2500);await shot('title');
const tapL=async l=>{const bb=await l.boundingBox();if(PH)await p.touchscreen.tap(bb.x+bb.width/2,bb.y+bb.height/2);else await p.mouse.click(bb.x+bb.width/2,bb.y+bb.height/2)};
// Learn to play first screen + Goal card
if(!process.env.NOLEARN){await tapL(p.locator('.stcard button.pri, .stcard .gxt-menu button').first());await p.waitForTimeout(3500);await shot('learn');await p.goto(url);await p.evaluate(()=>{try{localStorage.setItem('tw_offered','1')}catch(e){}});await p.reload();await p.waitForTimeout(2500)}
await tapL(p.locator('[data-quick]:visible, button:has-text("Quick game")').first());await p.waitForTimeout(700);
const jp=p.getByText('Just play');if(await jp.count()&&await jp.isVisible())await tapL(jp);
await p.waitForTimeout(1500);
const goal=p.locator('[data-goal]:visible').first();if(await goal.count()){await tapL(goal);await p.waitForTimeout(800);await shot('goal');await p.keyboard.press('Escape');await p.waitForTimeout(500)}
const t0=Date.now();let idle=0,places=0,riv=0,mid=0,first=0;const seen={};
while(Date.now()-t0<300000){
  const st=await p.evaluate(()=>({over:!!(G&&G.over),me:sideToAct(),busy:!!UI.busy,ph:G.phase}));
  if(st.busy&&st.me!==0&&st.ph!=='setup'&&riv<2&&places>=1){await p.waitForTimeout(900);await shot('rival'+(riv?'2':''));riv++}
  if(!first&&st.ph!=='setup'&&st.me===0&&!st.busy&&await p.locator('[data-a=card]:visible').count()){first=1;await p.waitForTimeout(600);await shot('first-turn');const g=p.locator('[data-goal]:visible').first();if(await g.count()){await tapL(g);await p.waitForTimeout(700);await shot('goal');await tapL(p.locator('[data-goalok]'));await p.waitForTimeout(400)}}
  const a=await step(p);seen[a]=(seen[a]||0)+1;
  if(a==='OVER'){await p.waitForFunction(()=>!UI.busy,null,{timeout:60000}).catch(()=>{});await p.waitForTimeout(2500);await shot('result');break}
  if(a==='startmark'||(a&&a.startsWith('mark'))){await p.waitForTimeout(800)}
  if(a===''||a==='wait'){idle++;await p.waitForTimeout(500);if(idle>300){console.log('STUCK',JSON.stringify(seen));await shot('stuck');break}}else idle=0;
  if(a==='place'){places++;if(places===4){await p.waitForTimeout(1500);await shot('mid')}}
  await p.waitForTimeout(250)}
console.log(JSON.stringify(seen),'errors',errs.length,errs.slice(0,3));
await b.close();process.exit(0)})();
