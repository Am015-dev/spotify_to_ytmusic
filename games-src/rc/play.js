// newcomer replay: follows the advisor (Do it on the top priority, then Suggest), screenshots into ../advisor/shipwreck/after/
// node play.js [W H tag days]
const {chromium}=require(process.env.PW);const OUT=__dirname+'/../advisor/shipwreck/after/';require('fs').mkdirSync(OUT,{recursive:true});
const [W,H,TAG,DAYS]=[+(process.argv[2]||1366),+(process.argv[3]||768),process.argv[4]||'d',+(process.argv[5]||6)];
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await b.newPage({viewport:{width:W,height:H}});p.setDefaultTimeout(60000);
  const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>m.type()==='error'&&!/CERT/.test(m.text())&&errs.push(m.text()));
  await p.goto('file://'+__dirname+'/shipwreck.html');await p.waitForTimeout(800);await p.evaluate(()=>{try{localStorage.clear()}catch(e){}setSeed(7);AIDELAY=50});
  let n=0;const shot=async t=>{await p.screenshot({path:`${OUT}${TAG}${String(++n).padStart(2,'0')}_${t}.png`})};
  await p.evaluate(()=>openStart());await p.waitForTimeout(300);await shot('start');
  // carpenter = you, cook = computer
  await p.click('[data-ctl=cook][data-v=ai]');await p.waitForTimeout(200);await shot('setup');
  await p.click('[data-a=start]');await p.waitForTimeout(1200);
  for(let k=0;k<8;k++){if(!await p.$('#story:not([hidden]) [data-a=next]'))break;if(k===1||k===3)await shot('intro'+k);await p.click('#story [data-a=next]');await p.waitForTimeout(250)}
  const log=[];
  for(let day=1;day<=DAYS;day++){
    // story until the plan
    for(let k=0;k<60;k++){const s=await p.evaluate(()=>({st:storyActive(),q:humanQ()&&storyIdx()===UI.beats.length-1,plan:planOpen()&&!G.q,over:!!G.over,kind:storyActive()?UI.beats[storyIdx()].kind:''}));
      if(s.over&&!s.st)break;if(s.plan&&!s.st)break;
      if(s.q){await shot(`d${day}_q`);await p.click('#story [data-ans="0"]');await p.waitForTimeout(250);continue}
      if(s.st){if(['weather','night','threat','fight','over','finds','dawn'].includes(s.kind))await shot(`d${day}_${s.kind}`);const nx=await p.$('#story [data-a=next]');if(nx)await nx.click();await p.waitForTimeout(200);continue}
      await p.waitForTimeout(300)}
    if(await p.evaluate(()=>!!G.over)){await p.waitForTimeout(500);await shot('over');break}
    await p.waitForTimeout(700);await shot(`d${day}_plan`);
    const pr=await p.evaluate(()=>priorities().filter(x=>!x.done).map(x=>x.title+(x.can?' [Do it]':x.move?' [Move]':x.cant?' ('+x.cant+')':'')));log.push(`day ${day}: `+pr.join(' | '));
    // the newcomer taps Do it on the top priority while there is one
    for(let k=0;k<4;k++){const b2=await p.$('.prios [data-do]');if(!b2)break;const free=await p.evaluate(()=>humanFree().some(q=>q.c!=null));if(!free&&!(await b2.innerText()).startsWith('Move'))break;await b2.click();await p.waitForTimeout(300);if(k===0)await shot(`d${day}_doit`)}
    if(await p.evaluate(()=>humanFree().some(q=>q.c!=null))){await p.click('#step [data-a=suggest]');await p.waitForTimeout(600);await shot(`d${day}_suggest`)}
    log.push('   plan: '+await p.evaluate(()=>G.plan.acts.map(a=>actLabel(a)+'['+a.pw.map(i=>pawnLabel(pawnInfo(i))).join('+')+']').join('; ')));
    await p.click('#step [data-a=go]');await p.waitForTimeout(500);
    if(await p.$('#step .confirm')){await shot(`d${day}_confirm`);log.push('   confirm: '+await p.innerText('#step .confirm'));await p.click('#step [data-a=go]');await p.waitForTimeout(500)}
  }
  if(await p.evaluate(()=>!!G.over)){for(let k=0;k<20;k++){const nx=await p.$('#story:not([hidden]) [data-a=next]');if(!nx)break;await nx.click();await p.waitForTimeout(200)}await p.waitForTimeout(500);await shot('gameover')}
  console.log(log.join('\n'));console.log('errors',errs.slice(0,5));await b.close()})();
