const { chromium } = require('playwright'); const fs=require('fs');
const [slug,tag,dir]=process.argv.slice(2);
const R='/home/user/spotify_to_ytmusic', stage=R+'/games-src/.staging/'+slug;
if(!fs.existsSync(stage+'/media')) fs.symlinkSync(R+'/games/'+slug+'/media',stage+'/media');
const out=R+'/games-src/'+dir+'/playtest/'; const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const b=await chromium.launch();
 for(const [w,h,mob] of [[390,763,true],[1280,800,false]]){
  const p=await (await b.newContext({viewport:{width:w,height:h},hasTouch:mob,isMobile:mob})).newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto('file://'+stage+'/index.html'); await sleep(1800);
  await p.evaluate(()=>{try{GXC.open()}catch(e){}}); await sleep(1200);
  await p.screenshot({path:out+`facelift-${tag}-map-${w}.png`});
  const n=await p.$('.gxc-node.next, .gxc-node.open'); if(n){await n.click({timeout:3000});await sleep(700);await p.screenshot({path:out+`facelift-${tag}-sheet-${w}.png`});
    const go=await p.$('.gxc-sheet .gxc-btn.go'); if(go){await go.click({timeout:3000});await sleep(1500);await p.screenshot({path:out+`facelift-${tag}-scene-${w}.png`});}}
  console.log(w,'errors',errs.slice(0,3)); }
 await b.close();})();
