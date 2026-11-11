// w488-shots.js: plays a full game by touch (iPhone UA, 390x844) and saves shots of the first turn, a cut, a wrong guess and the end.
//   node w488-shots.js <url> <outdir> <prefix>      e.g. before / after
const PW=require('playwright');const U=require('./uiplay.js');const {sleep,tapSel}=U;
const [URL_,OUT,PRE]=[process.argv[2],process.argv[3],process.argv[4]];
(async()=>{const b=await PW.chromium.launch();
  const ctx=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:1,userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'});
  const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.goto(URL_);await sleep(1200);await p.evaluate(()=>{localStorage.setItem('gxt-short-fuse',JSON.stringify({done:1}))});await p.reload();await sleep(1500);
  await tapSel(p,'#start [data-a=start]',true);await sleep(500);
  if(await p.evaluate(()=>!!document.getElementById('offer')))await tapSel(p,'#offer [data-a=offerno]',true);await sleep(900);
  await tapSel(p,'[data-a=briefok]',true);await sleep(1200);
  const shot=async n=>{await p.screenshot({path:`${OUT}/${PRE}-${n}.png`})};
  await shot('first-turn');const got={};
  const w=setInterval(async()=>{try{
    const s=await p.evaluate(()=>({cut:!!document.querySelector('.s3.pl'),miss:!!document.querySelector('.s3.bw'),spark:(()=>{const e=document.querySelector('.spark');return e?getComputedStyle(e).backgroundPositionX:''})()}));
    if(s.cut&&!got.cut){got.cut=1;await sleep(180);await shot('cut')}
    if(s.miss&&!got.miss){got.miss=1;await sleep(250);await shot('wrong-guess')}
    (got.sp=got.sp||new Set()).add(s.spark)}catch(e){}},120);
  const r=await U.playToEnd(p,{touch:true,maxMs:240000});clearInterval(w);await sleep(1500);await shot('end');
  console.log(PRE,'over',r.over,'taps',r.taps,'shots',Object.keys(got).join(','),'sparkPositions',[...(got.sp||[])].join('|'),'errs',errs.length);await b.close()})();
