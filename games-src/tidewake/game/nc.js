// Newcomer-review replay with screenshots. PW=$(npm root -g)/playwright node nc.js [WxH]
const PW=require((process.env.PW||require('child_process').execSync('npm root -g').toString().trim()+'/playwright'));const fs=require('fs'),path=require('path');
const html=fs.readFileSync(path.join(__dirname,'tidewake.html'));const [W,H]=(process.argv[2]||'1366x768').split('x').map(Number);const OUT=path.join(__dirname,'shots','nc');
(async()=>{const b=await PW.chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const ctx=await b.newContext({viewport:{width:W,height:H},deviceScaleFactor:1});await ctx.route('**/*',r=>{const u=new URL(r.request().url());return u.host==='gns.test'?r.fulfill({status:200,contentType:'text/html',body:html}):r.abort()});
const p=await ctx.newPage();p.setDefaultTimeout(60000);const errs=[];p.on('pageerror',e=>errs.push('pageerror '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/net::|Failed to load/.test(m.text()))errs.push(m.text())});
const shot=async n=>{await p.screenshot({path:path.join(OUT,`${W}x${H}_${n}.png`)});console.log('shot',n)};
await p.goto('https://gns.test/');await p.waitForTimeout(1200);await p.evaluate(()=>{try{localStorage.clear()}catch(e){}setSeed(21);setAiSeed(21);AIDELAY=60});
await p.click('[data-a=guided]');await p.waitForTimeout(1800);await shot('1_setup');
await p.click('#dockbody [data-a=startmark]:not([disabled])');await p.waitForTimeout(2500);
const waitHuman=async()=>{for(let k=0;k<100;k++){const s=await p.evaluate(()=>{const d=sideToAct();return !!G.over||(d>=0&&G.seats[d].human&&!UI.busy)});if(s)break;await p.waitForTimeout(250)}await p.waitForTimeout(400)};
await waitHuman();await shot('2_turn');
// bad route (red): rotate until the Place button is disabled
for(let i=0;i<4;i++){const dis=await p.$('#dockbody [data-a=place][disabled]');if(dis){await shot('3_badroute');break}await p.click('#dockbody [data-a=rot][data-d="1"]');await p.waitForTimeout(250)}
await p.click('#dockbody [data-a=sugg],#dockbody [data-a=hint]').catch(()=>{});await p.waitForTimeout(400);await shot('4_advice');
let seenMph=false,seenSunk=false;
for(let t=0;t<30;t++){await waitHuman();const o=await p.evaluate(()=>({over:!!G.over,q:!!G.q}));if(o.over)break;
  if(o.q){const q=await p.$('#dockbody [data-a=q]');if(q)await q.click();continue}
  await p.evaluate(()=>{const m=recMove(sideToAct());if(m&&m.a==='place')UI.sel={t:m.t,r:m.r,s:m.s};render()});await p.waitForTimeout(200);
  const pb=await p.$('#dockbody [data-a=place]:not([disabled])');if(pb)await pb.click();else{const pa=await p.$('#dockbody [data-a=pass],#dockbody [data-a=cannon]');if(pa)await pa.click()}
  for(let k=0;k<40;k++){await p.waitForTimeout(250);const s=await p.evaluate(()=>({mph:!!(UI.mph&&UI.mph.wake&&UI.mph.shown>0&&UI.busy),sunk:(UI.sunk||[]).length,busy:UI.busy}));
    if(s.mph&&!seenMph){seenMph=true;await shot('5_monsters');}
    if(s.sunk&&!seenSunk){seenSunk=true;await p.waitForTimeout(600);await shot('6_sunk')}
    if(!s.busy)break}
  if(seenMph&&seenSunk)break}
await waitHuman();await shot('7_later');
fs.writeFileSync(path.join(OUT,`errs_${W}x${H}.txt`),errs.join('\n'));console.log('errors',errs.length,errs.slice(0,3));await b.close()})();
