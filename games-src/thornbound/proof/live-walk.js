// Walks the Thornbound tutorial by reading GXT.state() (target hole + Next button). usage: NODE_PATH=$(npm root -g) [BASE=http://localhost:PORT] node games-src/scripts/../thornbound/proof/live-walk.js pc|phone   -> prints steps advanced and where it got stuck (stuck must be only the final end card, i=37).
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const exe=fs.existsSync('/opt/pw-browsers/chromium')?'/opt/pw-browsers/chromium':undefined;const b=await chromium.launch(exe?{executablePath:exe}:{});
const mob=process.argv[2]==='phone';const VW=+process.env.VW||1366,VH=+process.env.VH||768;
const c=await b.newContext({viewport:mob?{width:402,height:874}:{width:VW,height:VH},hasTouch:mob,isMobile:mob,serviceWorkers:'block',...(process.env.VIDEO?{recordVideo:{dir:process.env.VIDEO,size:{width:VW,height:VH}}}:{})});const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e).slice(0,100)));
await p.goto(''+(process.env.BASE||'https://am015-dev.github.io/spotify_to_ytmusic')+'/thornbound/?v='+Date.now());await p.waitForTimeout(2500);
const t=p.getByText('New here?').first();mob?await t.tap():await t.click();await p.waitForTimeout(2500);
let last=-1,same=0,steps=0,stuck=null;
for(let g=0;g<400;g++){
 const st=await p.evaluate(()=>{try{return GXT.state()}catch(e){return {active:false}}});
 if(!st.active)break;
 if(st.i===last){same++}else{same=0;last=st.i;steps++}
 if(same>=5){stuck={i:st.i,id:st.id,say:(st.say||'').slice(0,90),hole:st.hole};break}
 const nb=await p.evaluate(()=>{const e=document.querySelector('.gxt-next,.gxh-ok');if(!e||!e.offsetParent)return null;const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}});
 const pt=nb||(st.hole?{x:st.hole.cx,y:st.hole.cy}:null);
 if(pt){mob?await p.touchscreen.tap(pt.x,pt.y):await p.mouse.click(pt.x,pt.y)}
 await p.waitForTimeout(700)}
console.log(mob?'PHONE':'PC','steps advanced:',steps,'stuck:',JSON.stringify(stuck),'errors:',JSON.stringify(errs.slice(0,2)));

await c.close();await b.close()})();
