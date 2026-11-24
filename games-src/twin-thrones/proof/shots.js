// node proof/shots.js <tag> : wonder-draft + quick-rules screenshots at 402x874 touch and 1366x768 mouse
const path=require('path'),fs=require('fs');const {chromium}=require('playwright');
const tag=process.argv[2]||'after';const SD=process.env.TT_SCRATCH||require('os').tmpdir()+'/tt-proof';fs.mkdirSync(SD,{recursive:true});try{fs.symlinkSync(path.resolve(__dirname,'../../../games/twin-thrones/media'),SD+'/media')}catch(e){}
fs.copyFileSync(path.resolve(__dirname,'..','twin-thrones.html'),path.join(SD,'index.html'));
(async()=>{const b=await chromium.launch();
for(const [W,H,touch] of [[402,874,true],[1366,768,false]]){
 const ctx=await b.newContext({viewport:{width:W,height:H},hasTouch:touch,isMobile:touch,deviceScaleFactor:touch?2:1});
 await ctx.addInitScript(()=>{try{localStorage.clear();localStorage.setItem('tt_seen','1')}catch(e){}});
 const pg=await ctx.newPage();await pg.goto('file://'+SD+'/index.html');await pg.waitForTimeout(900);
 await pg.evaluate(()=>{TT_TEST.newGame("cpu",7)});await pg.waitForTimeout(600);
 await pg.screenshot({path:path.join(__dirname,`draft-${tag}-${W}-popup.png`)});
 await pg.evaluate(()=>{const g=document.querySelector('[data-goalgo]');g&&g.click()});await pg.waitForTimeout(1500);
 await pg.screenshot({path:path.join(__dirname,`draft-${tag}-${W}.png`)});
 await pg.evaluate(()=>GX.show('rulesd'));await pg.waitForTimeout(600);
 await pg.screenshot({path:path.join(__dirname,`rules-${tag}-${W}.png`)});
 await ctx.close();}
await b.close();})();
