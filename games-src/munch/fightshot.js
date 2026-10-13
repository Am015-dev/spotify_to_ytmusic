// Stages a fight and screenshots it: node fightshot.js [sizes=390x763,375x553,1280x800]  -> playtest/fight-<size>-<scene>.png
const PW=(()=>{try{return require('playwright')}catch(e){return require('/opt/node-tools/node_modules/playwright')}})();
const fs=require('fs'),path=require('path');const html=fs.readFileSync(__dirname+'/doorkick.html');const localRoute=require('./local-route.js');
const SIZES=(process.argv[2]||'390x763,375x553,1280x800').split(',').map(s=>s.split('x').map(Number));
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const browser=await PW.chromium.launch();
 for(const [W,H] of SIZES){const ctx=await browser.newContext({viewport:{width:W,height:H},isMobile:W<700,hasTouch:true});await localRoute(ctx,html);
  const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.goto('https://gns.test/'+(W<700?'?phone=1':''));await sleep(900);await p.evaluate(()=>{try{localStorage.clear()}catch(e){}});await p.reload();await sleep(900);
  await p.evaluate(()=>{ANIM=0;setSeed(7);newGame('solo',3);UI.speed=4;});await sleep(500);
  const shot=async n=>{await sleep(1800);await p.screenshot({path:path.join(__dirname,'playtest',`fight-${W}x${H}-${n}.png`)})};
  // scene 1: losing fight, then a one-shot/bonus
  const info=await p.evaluate(()=>{G.active=0;const me=0;P(0).lvl=4;const mon=CARDS.findIndex(c=>c.ref==='dk-hatmuncher');const id=Object.keys(G.C).map(Number).find(i=>G.C[i]==='hatmuncher'||(cd(i).ref==='dk-hatmuncher'));
    window.__id=id;startCombat(me,id,'kick');render();return {me,id,a:sideStr(G.cb),b:monStr(G.cb),human:P(me).human}});
  console.log(W+'x'+H,JSON.stringify(info),errs.join('|'));await p.addStyleTag({content:'[class*=gxt]{display:none!important}'});await shot('1lose');
  // scene 2: a one-shot is played, then a helper joins, monster boost (shots mid-animation and settled)
  const mv=async(f)=>{await p.evaluate(f);};
  await p.evaluate(()=>{const os=Object.keys(G.C).map(Number).filter(i=>cd(i).t==='oneshot'&&!P(0).hand.includes(i)&&G.tr.includes(i));window.__os=os.slice(0,2);G.tr=G.tr.filter(i=>!os.slice(0,2).includes(i));P(0).hand.push(...os.slice(0,2));render()});
  await p.evaluate(()=>{apply({act:'play',card:window.__os[0]},0);render()});await sleep(330);await p.screenshot({path:path.join(__dirname,'playtest',`fight-${W}x${H}-2oneshot-fly.png`)});await shot('2oneshot');
  await p.evaluate(()=>{G.cb.help=1;G.cb.pb+=3;render()});await sleep(330);await p.screenshot({path:path.join(__dirname,'playtest',`fight-${W}x${H}-3helper-fly.png`)});await shot('3helper');
  const i2=await p.evaluate(()=>({a:sideStr(G.cb),b:monStr(G.cb),dom:[...document.querySelectorAll('.sline .n')].map(n=>n.textContent)}));console.log(JSON.stringify(i2),errs.join('|'));
  await ctx.close()}
 await browser.close()})();
