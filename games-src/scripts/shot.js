// usage: node shot.js <slug> <tag>  -> shots in games-src/<dir>/playtest/facelift-<tag>-<view>-<w>.png
const { chromium } = require('playwright'); const path=require('path'), fs=require('fs');
const [slug,tag]=process.argv.slice(2);
const DIR={ 'sands-of-qamar':'ft','crown-city-smash':'kot','doorkick-dungeon':'munch'}[slug];
const R='/home/user/spotify_to_ytmusic';
const stage=R+'/games-src/.staging/'+slug; 
const file=stage+'/index.html';
if(!fs.existsSync(stage+'/media')) fs.symlinkSync(R+'/games/'+slug+'/media',stage+'/media');
const out=R+'/games-src/'+DIR+'/playtest/'; fs.mkdirSync(out,{recursive:true});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const b=await chromium.launch();
 for(const [w,h,mob] of [[390,763,true],[1280,800,false]]){
  const ctx=await b.newContext({viewport:{width:w,height:h},hasTouch:mob,isMobile:mob,deviceScaleFactor:1});
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto('file://'+file); await sleep(1800);
  const sh=async n=>{await p.screenshot({path:out+`facelift-${tag}-${n}-${w}.png`})};
  await sh('title');
  // story map
  const st=await p.$('button:visible:has-text("Story mode")');
  if(st){await st.click({timeout:3000});await sleep(1200);await sh('map');
    const x=await p.$('.gxc-x,[data-gxc="back"],.gxc-head button');}
  await p.reload(); await sleep(1500);
  const q=await p.$('button:visible:has-text("Play vs")');
  if(q){await q.click({timeout:3000});await sleep(2500);
   // play: tap glowing things a few times
   for(let i=0;i<14;i++){const g=await p.$('.glow:not([disabled])'); if(g){try{await g.click({timeout:600})}catch(e){}} await sleep(500);}
   await sh('board');
   const m=await p.$('[data-gx="menud"]'); if(m){await m.click();await sleep(700);await sh('dialog');}
  }
  console.log(w,'errors',errs.slice(0,3));
  await ctx.close();}
 await b.close();})();
