// Desktop/tablet layout check. node lay.js [WxH,...]  (1366x768, 1920x1080, 768x1024)
const PW=require(process.env.PW||(require('child_process').execSync('npm root -g').toString().trim()+'/playwright'));
const fs=require('fs'),path=require('path');const OUT=path.join(__dirname,'shots','desk');fs.mkdirSync(OUT,{recursive:true});
const html=fs.readFileSync(path.join(__dirname,'hollowbough.html'));
const SIZES=(process.argv[2]||'1366x768,1920x1080,768x1024').split(',').map(s=>s.split('x').map(Number));
(async()=>{const b=await PW.chromium.launch();let bad=0;
for(const [W,H] of SIZES){const t=W+'x'+H;const ctx=await b.newContext({viewport:{width:W,height:H},deviceScaleFactor:1});
  await ctx.route('**/*',r=>new URL(r.request().url()).host==='gns.test'?r.fulfill({status:200,contentType:'text/html',body:html}):r.abort());
  const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/net::|Failed to load/.test(m.text()))errs.push(m.text())});
  const prob=(c,d)=>{bad++;console.log('PROBLEM',t,c,d||'')};
  const scroll=async tag=>{const r=await p.evaluate(()=>({h:document.documentElement.scrollHeight,w:document.documentElement.scrollWidth,vh:innerHeight,vw:innerWidth}));if(r.h>r.vh+1||r.w>r.vw+1)prob('scroll '+tag,JSON.stringify(r))};
  await p.goto('https://gns.test/');await p.waitForTimeout(600);await scroll('start');await p.screenshot({path:path.join(OUT,t+'_start.png')});
  await p.evaluate(()=>{UI.seed=3;AIDELAY=30;UI.opt={np:4,level:'normal',solo:1}});await p.click('[data-start=vs]');await p.waitForTimeout(800);
  for(let k=0;k<100;k++){if(await p.evaluate(()=>!G.players[HB.actor(G)].ai&&!UI.tm))break;await p.waitForTimeout(150)}
  for(let k=0;k<5;k++){const c=await p.$('#pc:not([hidden]) [data-a=cont]');if(!c)break;await c.click()}
  await scroll('game');
  const m=await p.evaluate(()=>{const B=document.querySelector('#board').getBoundingClientRect(),D=document.querySelector('#dock').getBoundingClientRect();const bad=[];for(const e of document.querySelectorAll('.tile,.mc:not(.empty),#handRow .sc,#chips .chip,#acts button')){const r=e.getBoundingClientRect();const x=r.left+r.width/2,y=r.top+r.height/2;if(x<0||y<0||x>innerWidth||y>innerHeight){bad.push('offscreen '+(e.dataset.a||'')+(e.dataset.k||'')+e.dataset.i);continue}const h=document.elementFromPoint(x,y);if(!h||!e.contains(h))bad.push('covered '+(e.dataset.a||'')+(e.dataset.k||'')+e.dataset.i)}
    return {board:[Math.round(B.width),Math.round(B.height)],share:+(B.width*B.height/(innerWidth*innerHeight)).toFixed(2),dock:[Math.round(D.width),Math.round(D.height)],bad:bad.slice(0,6),tall:document.querySelector('#bd').className}});
  console.log(t,'board',JSON.stringify(m));if(m.bad.length)prob('unreachable',JSON.stringify(m.bad));
  await p.screenshot({path:path.join(OUT,t+'_game.png')});
  const mc=await p.$('.mc:not(.empty)');await mc.click();await p.waitForTimeout(300);if(await p.evaluate(()=>document.querySelector('#ppop').hidden))prob('card popup did not open');await p.screenshot({path:path.join(OUT,t+'_pop.png')});await scroll('popup');await p.keyboard.press('Escape');
  for(const id of['rivald','logd','rulesd','setd']){await p.click(`.gx-bar [data-gx=${id}]`);await p.waitForTimeout(450);await scroll('drawer '+id);if(!(await p.evaluate(i=>document.getElementById(i).classList.contains('on'),id)))prob('drawer did not open',id);await p.keyboard.press('Escape');await p.waitForTimeout(300);if(await p.evaluate(i=>document.getElementById(i).classList.contains('on'),id))prob('Esc did not close drawer',id)}
  await p.click('.gx-bar [data-gx=rulesd]');await p.waitForTimeout(400);await p.screenshot({path:path.join(OUT,t+'_rules.png')});await p.keyboard.press('Escape');
  if(errs.length)prob('console errors',JSON.stringify(errs.slice(0,3)));await ctx.close()}
console.log('PROBLEMS',bad);await b.close()})().catch(e=>{console.error('FATAL',e);process.exit(1)});
