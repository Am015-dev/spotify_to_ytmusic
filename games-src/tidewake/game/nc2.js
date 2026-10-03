// watch-mode game with every expansion: screenshots of a sinking (card + marker) and of the expansion labels. node nc2.js WxH [seed]
const PW=require((process.env.PW||require('child_process').execSync('npm root -g').toString().trim()+'/playwright'));const fs=require('fs'),path=require('path');
const html=fs.readFileSync(path.join(__dirname,'tidewake.html'));const [W,H]=(process.argv[2]||'1366x768').split('x').map(Number);const seed=+process.argv[3]||11;const OUT=path.join(__dirname,'shots','nc');
(async()=>{const b=await PW.chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const ctx=await b.newContext({viewport:{width:W,height:H},deviceScaleFactor:1});await ctx.route('**/*',r=>{const u=new URL(r.request().url());return u.host==='gns.test'?r.fulfill({status:200,contentType:'text/html',body:html}):r.abort()});
const p=await ctx.newPage();p.setDefaultTimeout(60000);const errs=[];p.on('pageerror',e=>errs.push('pageerror '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/net::|Failed to load/.test(m.text()))errs.push(m.text())});
const shot=async n=>{await p.screenshot({path:path.join(OUT,`${W}x${H}_${n}.png`)});console.log('shot',n)};
await p.goto('https://gns.test/');await p.waitForTimeout(1200);await p.evaluate(()=>{try{localStorage.clear()}catch(e){}});
await p.click('[data-a=mode][data-v=me]');await p.click('[data-a=np][data-v="4"]');
for(const k of['rift','wave','maelstrom','cannon'])await p.evaluate(k=>{const c=document.querySelector(`[data-a=exp][data-k=${k}]`);c.checked=true;c.dispatchEvent(new Event('change',{bubbles:true}))},k);
await p.evaluate(s=>{setSeed(s);setAiSeed(s);AIDELAY=40;UI.speed=3},seed);await p.click('#startbtn');await p.waitForTimeout(1500);
let gotSunk=false,gotExp=false,gotQ=false;
for(let k=0;k<400&&!(gotSunk&&gotExp);k++){await p.waitForTimeout(300);
  const s=await p.evaluate(()=>{const d=sideToAct();return {over:!!G.over,mine:d>=0&&G.seats[d].human&&!UI.busy,setup:G.phase==='setup',q:!!G.q,qk:G.q&&G.q.kind,sunk:(UI.sunk||[]).length,exp:!!(G.wave||G.mons.some(m=>m.k==='M')||G.gates.length),busy:UI.busy}});
  if(s.over)break;
  if(s.mine){if(s.q){if(!gotQ&&s.qk==='cannonDraw'){gotQ=true;await shot('8_cannonDraw')}await p.click('#dockbody [data-a=q]');continue}
    if(s.setup){await p.click('#dockbody [data-a=startmark]:not([disabled])');continue}
    await p.evaluate(()=>{const m=recMove(sideToAct());if(m&&m.a==='place')UI.sel={t:m.t,r:m.r,s:m.s};else if(m&&m.a!=='place'){}render()});
    const pb=await p.$('#dockbody [data-a=place]:not([disabled])');if(pb)await pb.click();else{const pa=await p.$('#dockbody [data-a=pass],#dockbody [data-a=cannon]');if(pa)await pa.click();}}
  if(s.sunk&&!gotSunk){gotSunk=true;await p.waitForTimeout(700);await shot('6_sunk')}
  if(s.exp&&!gotExp&&!s.busy){gotExp=true;await shot('9_expansions')}}
await shot('10_end');fs.writeFileSync(path.join(OUT,`errs2_${W}x${H}.txt`),errs.join('\n'));console.log('errors',errs.length,errs.slice(0,3));await b.close()})();
