// Phone control strip: every button is really tappable (hit-test at its centre) even late in the game, when the
// end warning, the plan's "why" and the score causes all show. PW=<playwright> node strip-test.js [sands.html] [WxH,...]
const {chromium}=require(process.env.PW);const FILE=process.argv[2]||'sands.html';const SIZES=(process.argv[3]||'390x763,375x553,390x664').split(',');
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});let bad=0;
for(const sz of SIZES){const [W,H]=sz.split('x').map(Number);const pg=await (await b.newContext({viewport:{width:W,height:H},isMobile:true,hasTouch:true})).newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
  await pg.goto('file://'+__dirname+'/'+FILE);await pg.waitForTimeout(1500);
  const r=await pg.evaluate(()=>{AIDELAY=0;ANIM=0;setSeed(9);UI.setup.np=2;UI.setup.seats=['human','ai'];UI.modal=null;beginGame();UI.coach=true;PHONE.tips={bid:1,move:1,hand:1};
    for(let k=0;k<3000&&!G.over;k++){if(G.round>=3&&me()&&G.phase==='turn'&&G.step==='move'&&!G.move)break;go(aiMove(sideToAct()))}
    for(const p of G.pl)p.camels=Math.min(p.camels,2);UI.feedMark={};PHONE.chDone=PHONE.chapter&&PHONE.chapter.key;render();phRender();
    const out=[];for(const e of document.querySelectorAll('#ps button')){const rc=e.getBoundingClientRect();if(rc.width<2)continue;const x=rc.left+rc.width/2,y=rc.top+Math.min(rc.height/2,12);
      if(y>innerHeight)continue;const t=document.elementFromPoint(x,y);if(!(t===e||e.contains(t)))out.push((e.textContent||'').trim().slice(0,24)+' covered by '+(t&&(t.className||t.tagName)))}
    const kids=[...document.getElementById('ps').children].map(e=>e.getBoundingClientRect());for(let i=1;i<kids.length;i++)if(kids[i].top<kids[i-1].bottom-1)out.push('row '+i+' overlaps row '+(i-1));
    return {out,n:document.querySelectorAll('#ps button').length,round:G.round}});
  const ok=!r.out.length&&!errs.length;if(!ok)bad++;console.log(sz,ok?'ok':'FAIL',JSON.stringify(r),errs.slice(0,2).join(' | '));await pg.close()}
console.log(bad?`strip-test: ${bad} FAIL`:'strip-test: all ok');await b.close();process.exit(bad?1:0)})();
