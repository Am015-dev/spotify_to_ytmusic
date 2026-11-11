// newcomer walk through the guided flow: Continue on every scene; plan with the 4 steps (recommended job for each pawn)
// node np.js W H TAG [days]   (screenshots in ../np/)
const {chromium}=require(process.env.PW);const OUT=process.env.OUT||__dirname+'/../np/';
const [W,H,TAG,DAYS]=[+(process.argv[2]||1366),+(process.argv[3]||768),process.argv[4]||'n',+(process.argv[5]||2)];
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await b.newPage({viewport:{width:W,height:H}});p.setDefaultTimeout(60000);
 const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>m.type()==='error'&&!/CERT/.test(m.text())&&errs.push(m.text()));
 await p.goto('file://'+__dirname+'/shipwreck.html');await p.waitForTimeout(800);await p.evaluate(()=>{try{localStorage.clear()}catch(e){}setSeed(7);AIDELAY=50});
 let n=0;const shot=async t=>{await p.screenshot({path:`${OUT}${TAG}${String(++n).padStart(2,'0')}_${t}.png`})};
 await p.click('[data-a=start]');await p.waitForTimeout(1200);const trail=[];
 for(let k=0;k<260;k++){const s=await p.evaluate(()=>({r:G.round,st:storyActive(),q:humanQ()&&storyIdx()===UI.beats.length-1,plan:planOpen()&&!G.q,over:!!G.over,kind:storyActive()?UI.beats[storyIdx()].kind:'',br:storyActive()?UI.beats[storyIdx()].round:0,ps:UI.ps&&UI.ps.step,dockt:document.querySelector('#dockt').textContent,rm:(document.querySelector('.rm-p.now span')||{}).textContent||''}));
   if(s.over&&!s.st)break;if(s.plan&&!s.st&&s.r>DAYS)break;
   if(s.st){trail.push(`${s.dockt} | ${s.kind}${s.q?' (question)':''}`);if(k<300)await shot(`d${s.br}_${s.kind}${s.q?'_q':''}`);
     if(s.q){await p.click('#story [data-ans="0"]')}else await p.click('#story [data-a=next]');await p.waitForTimeout(250);continue}
   if(s.plan){trail.push(`${s.dockt} | ${await p.innerText('#steptext')}`);await shot(`d${s.r}_plan${s.ps}`);
     if(s.ps===2&&await p.$('#panel [data-a=rec]')){await p.click('#panel [data-a=rec]');await p.waitForTimeout(250);continue}
     if(s.ps===2&&await p.$('#panel [data-a=pskip]')){await p.click('#panel [data-a=pskip]');await p.waitForTimeout(250);continue}
     const go=await p.$('#step [data-a=go]');if(go){await go.click();await p.waitForTimeout(500);continue}
     await p.click('#step [data-a=pnext]');await p.waitForTimeout(300);continue}
   await p.waitForTimeout(300)}
 console.log(trail.join('\n'));console.log('shots',n,'errors',errs);await b.close()})();
