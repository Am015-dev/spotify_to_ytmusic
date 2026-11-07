// Tutorial-to-end proof: fresh storage, plays the whole story tutorial by tapping the centre of each spotlit target (no engine shortcuts),
// asserts the point is not covered by the kit, every step id was shown, the result screen is reached and the tutorial is saved as done.
//   node tutor-e2e.js [390x763,1440x860]   exit 1 on any problem; prints only PASS/FAIL lines
const PW=require('/home/user/spotify_to_ytmusic/games-src/node_modules/playwright');
const fs=require('fs');const html=fs.readFileSync(__dirname+'/hollowbough.html');
const SIZES=(process.argv[2]||'390x763,1440x860').split(',').map(s=>s.split('x').map(Number));
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const EXPECT=['goal','places','twig','stock','rival','resin','hand','build','city','prep','spring','berry','toad','free','event','forest','pass','score','rscore','end'];
async function run(b,W,H){const probs=[];const t0=Date.now();const touch=W<600;
  const ctx=await b.newContext({viewport:{width:W,height:H},isMobile:touch,hasTouch:touch,deviceScaleFactor:1});
  await ctx.route('**/*',r=>new URL(r.request().url()).host==='gns.test'?r.fulfill({status:200,contentType:'text/html',body:html}):r.abort());
  const p=await ctx.newPage();p.setDefaultTimeout(8000);
  p.on('pageerror',e=>probs.push('page error '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/net::|Failed to load|favicon/.test(m.text()))probs.push('console '+m.text().slice(0,160))});
  await p.goto('https://gns.test/');await sleep(700);await p.evaluate(()=>{try{localStorage.clear()}catch(e){}});await p.reload();await sleep(900);
  const tap=async(x,y)=>{if(touch)await p.touchscreen.tap(x,y);else await p.mouse.click(x,y)};
  // first visit: Play offers the tutorial
  const pl=await p.$('[data-start="play"]');if(!pl){probs.push('no Play button');return probs}
  await pl.click();await sleep(400);
  const learn=await p.$('[data-offer="learn"]');if(!learn){probs.push('Play did not offer the tutorial');return probs}
  await learn.click();await sleep(1200);
  let last='',stuck=Date.now(),n=0,seen=new Set(),captions=0;
  while(Date.now()-t0<150000){
    const st=await p.evaluate(()=>{if(typeof GXT==='undefined'||!GXT.running())return null;const s=GXT.state();const e=document.querySelector('.gxt-end');return s?Object.assign({},s,{endCard:!!document.querySelector('.gxt-end')}):null});
    if(!st){await sleep(200);if(await p.$('.gxt-end')){}else if(Date.now()-stuck>8000){probs.push('tutorial not running');break}continue}
    if(st.phase==='end'||st.endCard){break}
    if(st.id+':'+st.count!==last){last=st.id+':'+st.count;stuck=Date.now()}
    if(Date.now()-stuck>15000){probs.push('stuck at step '+st.id+' phase '+st.phase);break}
    if(!st.shown||st.phase!=='show'){await sleep(150);continue}
    if(!seen.has(st.id)&&process.env.SHOT)await p.screenshot({path:process.env.SHOT+'/'+W+'_'+st.id+'.png'});
    seen.add(st.id);
    // the bubble: <=2 lines worth of text (<=28 words), has a story voice
    if(st.say.split(/\s+/).length>30)probs.push('long bubble at '+st.id);
    if(st.wait===null||st.wait==='none'||!st.wait){const nb=await p.$('.gxt-next');if(!nb){probs.push('no Next at '+st.id);break}await nb.click();await sleep(250);continue}
    const h=st.hole;if(!h){await sleep(150);continue}
    const cov=await p.evaluate(([x,y])=>{const e=document.elementFromPoint(x,y);if(!e)return 'none';if(e.closest('[data-help]')&&!e.closest('#bd'))return 'kit:'+(e.className||e.tagName);return ''},[h.cx,h.cy]);
    if(cov)probs.push('target centre covered at '+st.id+': '+cov);
    await tap(h.cx,h.cy);n++;await sleep(450);if(process.env.SHOT&&['twig','build','resin'].includes(st.id))await p.screenshot({path:process.env.SHOT+'/'+W+'_'+st.id+'_after.png'});
  }
  await sleep(500);
  const fin=await p.evaluate(()=>({end:!!document.querySelector('.gxt-end'),done:GXT.isDone('hollowbough'),log:UI.tutLog||[],title:(document.querySelector('.gxt-et')||{}).textContent}));
  if(!fin.end)probs.push('end card not reached');
  const miss=EXPECT.filter(i=>!fin.log.includes(i));if(miss.length)probs.push('steps never shown: '+miss.join(','));
  if(!fin.done)probs.push('tutorial not saved as done');
  await p.screenshot({path:__dirname+'/../playtest/tutor-end-'+W+'.png'});
  console.log((probs.length?'FAIL ':'PASS ')+'tutorial-to-end '+W+'x'+H+' steps='+fin.log.length+' taps='+n+' '+(Date.now()-t0)/1000+'s '+probs.slice(0,6).join(' | '));
  await ctx.close();return probs;}
(async()=>{const b=await PW.chromium.launch();let bad=0;for(const [W,H] of SIZES){bad+=(await run(b,W,H)).length}await b.close();process.exit(bad?1:0)})();
