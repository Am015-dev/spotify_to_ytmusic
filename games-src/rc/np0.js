// newcomer walk (before redesign): screenshots every screen for 2 days
const {chromium}=require(process.env.PW);const OUT=process.env.OUT||'../np/';
const [W,H,TAG]=[+(process.argv[2]||1366),+(process.argv[3]||768),process.argv[4]||'d'];
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await b.newPage({viewport:{width:W,height:H}});p.setDefaultTimeout(60000);
 const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file://'+__dirname+'/shipwreck.html');await p.waitForTimeout(800);await p.evaluate(()=>{try{localStorage.clear()}catch(e){}setSeed(7);AIDELAY=50});
 let n=0;const shot=async t=>{await p.screenshot({path:`${OUT}${TAG}${String(++n).padStart(2,'0')}_${t}.png`})};
 await p.click('[data-a=start]');await p.waitForTimeout(1200);
 for(let k=0;k<200&&n<60;k++){const s=await p.evaluate(()=>({r:G.round,ph:G.phase,st:storyActive(),q:humanQ(),plan:planOpen()&&!G.q,kind:storyActive()?UI.beats[storyIdx()].kind:''}));
   if(s.r>3)break;
   if(s.st){await shot(`r${s.r}_${s.kind}${s.q?'_q':''}`);const a=await p.$('#story [data-ans="0"]');if(a&&s.q){await a.click()}else{const nx=await p.$('#story [data-a=next]');if(nx)await nx.click()}await p.waitForTimeout(300);continue}
   if(s.plan){await shot(`r${s.r}_plan`);await p.click('#step [data-a=suggest]');await p.waitForTimeout(500);await shot(`r${s.r}_sugg`);await p.click('#step [data-a=go]');await p.waitForTimeout(500);if(await p.$('#step .confirm')){await shot('confirm');await p.click('#step [data-a=go]')}await p.waitForTimeout(500);continue}
   await p.waitForTimeout(300)}
 console.log('shots',n,'errors',errs);await b.close()})();
