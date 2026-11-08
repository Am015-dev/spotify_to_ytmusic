// Coached first game: starts the tutorial from the title with a finger, then plays FREE legal moves (recommended 70%, random 30%) through the game's own move entry,
// clicking through cards. Asserts every coverage rule was explained (TBCOACH.seen), one voice bubble at a time, the end card with "Things you will meet later".
//   node coach-test.js [sizes=390x763,1440x860]
const PW=(()=>{try{return require('playwright')}catch(e){return require('/opt/node-tools/node_modules/playwright')}})();
const fs=require('fs');const html=fs.readFileSync(__dirname+'/thornbound.html');
const SIZES=(process.argv[2]||'390x763,1440x860').split(',').map(s=>s.split('x').map(Number));
const NEED=['welcome','goal','bid','bids','kc','herald','place','supp','order','clash','claim','score','round'];
const sleep=ms=>new Promise(r=>setTimeout(r,ms));const probs=[];
async function run(b,W,H,att){const tag=W+'x'+H+'#'+att;
 const ctx=await b.newContext({viewport:{width:W,height:H},isMobile:W<700,hasTouch:W<700});
 await ctx.route('**/*',r=>new URL(r.request().url()).host==='gns.test'?r.fulfill({status:200,contentType:'text/html',body:html}):r.abort());
 const p=await ctx.newPage();p.on('pageerror',e=>probs.push(tag+' PAGE ERROR '+e.message));
 await p.goto('https://gns.test/'+(W<700?'?phone=1':''));await sleep(900);await p.evaluate(()=>{try{localStorage.clear()}catch(e){}});await p.reload();await sleep(900);
 await p.evaluate(()=>{showStart()});
 const pt=await p.evaluate(()=>{const b=document.querySelector('#start [data-gxt-open]');const r=b.getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2]});
 if(W<700)await p.touchscreen.tap(pt[0],pt[1]);else await p.mouse.click(pt[0],pt[1]);await sleep(600);
 await p.evaluate(()=>{UI.speed=4});
 let multi=0;
 for(let i=0;i<3000;i++){
  const r=await p.evaluate(()=>{if(document.getElementById('tbcend'))return 'end';
   const bub=document.querySelectorAll('#tbturn.voice').length;
   if(UI.card&&UI.card.kind!=='over'){return 'card'}
   const s=viewSeatForQ();if(s!=null){const rc=suggest(s),mv=legal(s);let m=(rc&&mv.find(x=>x.k===rc.k))||mv[0];if(Math.random()<.3)m=mv[Math.floor(Math.random()*mv.length)];humanMove(m.k);return 'move'}return 'wait'});
  if(r==='end')break;await sleep(r==='move'?30:120)}
 const res=await p.evaluate(()=>({seen:TBCOACH.seen,end:!!document.getElementById('tbcend'),later:/Things you will meet later/.test((document.getElementById('tbcend')||{}).textContent||''),done:GXT.isDone('thornbound')}));
 const miss=NEED.filter(x=>res.seen.indexOf(x)<0);await ctx.close();return {tag,res,miss}}
(async()=>{const b=await PW.chromium.launch();
 for(const [W,H] of SIZES){let ok=false,last;for(let a=1;a<=3&&!ok;a++){last=await run(b,W,H,a);ok=last.res.end&&last.res.later&&!last.miss.length&&last.res.done}
  console.log(last.tag,ok?'PASS':'FAIL','seen',last.res.seen.join(','),last.miss.length?'missing '+last.miss.join(','):'');if(!ok)probs.push(last.tag+' failed')}
 await b.close();console.log(probs.length?'PROBLEMS '+probs.join(' | '):'PROBLEMS 0');process.exit(probs.length?1:0)})();
