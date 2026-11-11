// end cards: lose a guided game / a solo game on purpose (worst legal move), then screenshot. node nc3.js WxH
const PW=require((process.env.PW||require('child_process').execSync('npm root -g').toString().trim()+'/playwright'));const fs=require('fs'),path=require('path');
const html=fs.readFileSync(path.join(__dirname,'tidewake.html'));const [W,H]=(process.argv[2]||'1366x768').split('x').map(Number);const OUT=path.join(__dirname,'shots','nc');
(async()=>{const b=await PW.chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const ctx=await b.newContext({viewport:{width:W,height:H},deviceScaleFactor:1});await ctx.route('**/*',r=>{const u=new URL(r.request().url());return u.host==='gns.test'?r.fulfill({status:200,contentType:'text/html',body:html}):r.abort()});
const p=await ctx.newPage();p.setDefaultTimeout(60000);const errs=[];p.on('pageerror',e=>errs.push(e.message));
for(const mode of ['guided','solo']){await p.goto('https://gns.test/');await p.waitForTimeout(900);await p.evaluate(()=>{localStorage.clear();setSeed(7);setAiSeed(7);AIDELAY=30;UI.speed=4});
 if(mode==='guided')await p.click('[data-a=guided]');else{await p.click('[data-a=var][data-v=solo]');await p.click('#startbtn')}
 await p.waitForTimeout(1200);
 for(let k=0;k<80;k++){const ok=await p.evaluate(()=>{const d=sideToAct();return d>=0&&G.seats[d].human&&!UI.busy&&G.phase==='play'});if(ok)break;
  await p.evaluate(()=>{const d=sideToAct();if(d>=0&&G.seats[d].human&&!UI.busy&&!G.q&&G.phase==='setup'){act(validMoves(d)[0],d)}});await p.waitForTimeout(250)}
 await p.evaluate(()=>{const d=sideToAct();const m=validMoves(d).find(x=>x.a==='place');act(m,d)});await p.waitForTimeout(2500);
 await p.evaluate(()=>{eliminate(0,'sailed off the edge of the chart',false);G.batch=[0];checkEnd([0]);refresh()});
 await p.waitForTimeout(2500);await p.screenshot({path:path.join(OUT,`${W}x${H}_end_${mode}.png`)});console.log(mode,await p.evaluate(()=>G.over&&G.over.why))}
console.log('errors',errs);await b.close()})();
