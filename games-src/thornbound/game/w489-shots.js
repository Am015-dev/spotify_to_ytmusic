// Shots for the round-flow + tutorial rework at 390x844, by touch only. Then a full game by touch as a new player (0 page errors).
//   node w489-shots.js [outdir=../playable-shots/w489]   Exit code 1 on any problem.
// Tutorial: tap the spotlight (or Next) at each step, as a reader would (waits 0.8 s per step). Real game: follow the finger or the one glowing thing.
const PW=(()=>{try{return require('playwright')}catch(e){return require('/opt/node-tools/node_modules/playwright')}})();
const fs=require('fs'),path=require('path');const html=fs.readFileSync(__dirname+'/thornbound.html');
const OUT=path.resolve(process.argv[2]||path.join(__dirname,'..','playable-shots','w489'));fs.mkdirSync(OUT,{recursive:true});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));const probs=[];const note=m=>{probs.push(m);console.log('PROBLEM '+m)};
(async()=>{const b=await PW.chromium.launch({args:['--no-sandbox']});
  const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});
  await ctx.route('**/*',r=>new URL(r.request().url()).host==='gns.test'?r.fulfill({status:200,contentType:'text/html',body:html}):r.abort());
  const p=await ctx.newPage();p.on('pageerror',e=>note('page error '+e.message));
  await p.goto('https://gns.test/?phone=1');await sleep(900);
  await p.evaluate(()=>{try{localStorage.clear()}catch(e){}showStart()});await sleep(300);
  const tap=async(x,y)=>{await p.touchscreen.tap(x,y)};
  const lb=await p.evaluate(()=>{const e=document.querySelector('#start [data-gxt-open]');const r=e.getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2]});await tap(...lb);await sleep(600);
  await p.evaluate(()=>{UI.speed=3});
  const shotAt={goal:'tut-1',bid1:'tut-2',council:'tut-3'};const seen=[];let last='',lastT=Date.now();const t0=Date.now();
  while(Date.now()-t0<240000){const s=await p.evaluate(()=>GXT.state());
    if(!s||!s.active){break}
    if(s.phase==='end'){await sleep(500);await p.screenshot({path:OUT+'/tut-end.png'});break}
    const sig=s.i+'|'+s.count+'|'+s.phase;if(sig!==last){last=sig;lastT=Date.now()}else if(Date.now()-lastT>15000){note('tutorial stuck at '+s.id+' '+JSON.stringify(await p.evaluate(()=>({q:G.q&&G.q.kind,t:G.q&&G.q.title,card:UI.card&&UI.card.kind,aut:UI.autCard}))));await p.screenshot({path:OUT+'/../w489-stuck.png'});break}
    if(s.phase!=='show'||!s.shown){await sleep(120);continue}
    if(!seen.includes(s.id)){seen.push(s.id);await sleep(800);if(shotAt[s.id])await p.screenshot({path:OUT+'/'+shotAt[s.id]+'.png'})}
    const words=String(s.say||'').trim().split(/\s+/).length;if(words>12&&!seen.includes('w:'+s.id)){seen.push('w:'+s.id);note('step '+s.id+' says '+words+' words')}
    if(!s.wait){const nx=await p.evaluate(()=>{const e=document.querySelector('.gxt-next');if(!e)return null;const r=e.getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2]});if(nx){await tap(...nx);await sleep(500)}else await sleep(150);continue}
    const h=s.hole;if(h){await tap(h.cx,h.cy);await sleep(500)}else await sleep(150)}
  const ids=seen.filter(x=>!x.startsWith('w:'));console.log('tutorial steps',ids.length,ids.join(','));
  for(const need of ['goal','tactic','attrition','bid1','kc','favour','herald','cmds','place1','supp','order','clash','claim','score','govern','council','journey','round','end'])if(!ids.includes(need))note('tutorial never showed step '+need);
  if(!fs.existsSync(OUT+'/tut-end.png'))note('tutorial did not reach its end card');
  // the end card hands over a real game
  const pb=await p.evaluate(()=>{const e=document.querySelector('[data-gxt-end=play]');if(!e)return null;const r=e.getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2]});
  if(!pb)note('no "Play a real game" on the end card');else{await tap(...pb);await sleep(900)}
  const real=await p.evaluate(()=>({len:G.rounds,tut:!!(UI.cfg&&UI.cfg.tutorial),q:G.q&&G.q.kind}));console.log('handed over',JSON.stringify(real));if(real.tut||real.len<4)note('the end card did not start a real game');
  // the real game by touch: follow the finger / the one glowing thing; first-turn and mid-game shots
  await p.evaluate(()=>{UI.speed=6});let firstShot=false,midShot=false,steps=0;const t1=Date.now();last='';lastT=Date.now();
  while(Date.now()-t1<420000){const s=await p.evaluate(()=>({over:!!G.over,r:G.round,mine:viewSeatForQ()!=null,card:UI.card&&UI.card.kind,k:UI.bf&&UI.bf.kind,ph:G.phase,sig:[G.logN,UI.hand,UI.autCard,UI.card&&UI.card.kind,G.q&&G.q.kind].join('|')}));
    if(s.over)break;if(s.sig!==last){last=s.sig;lastT=Date.now()}else if(Date.now()-lastT>15000){note('real game stuck: '+JSON.stringify(s));break}
    if(await p.$('#tbgoal')){const e=await p.$('#tbgoal button');const bb=await e.boundingBox();await tap(bb.x+bb.width/2,bb.y+bb.height/2);await sleep(300);continue}
    if(!s.mine||s.card){await sleep(120);continue}
    if(!firstShot&&s.k==='bid'){firstShot=true;await sleep(500);await p.screenshot({path:OUT+'/first-turn.png'})}
    if(!midShot&&s.r===3&&s.k==='place'){midShot=true;await sleep(500);await p.screenshot({path:OUT+'/mid-game.png'})}
    const f=await p.evaluate(()=>{const f=document.querySelector('#finger');return (!f||f.hidden)?null:fingerPlan()});
    if(f){if(f.from){await tap(f.from.x,f.from.y);await sleep(150)}await tap(f.to.x,f.to.y);steps++;await sleep(220);continue}
    const pos=await p.evaluate(()=>{const c=e=>{if(!e)return null;const r=e.getBoundingClientRect();return r.width?[r.left+r.width/2,r.top+r.height/2]:null};const q=s=>document.querySelector(s);
      const vis=[...document.querySelectorAll('[data-a=mv]')].filter(e=>{const r=e.getBoundingClientRect();return r.width&&r.bottom>0&&r.top<innerHeight});
      return c(q('#act .autc .btn'))||c(q('#handw .hc.glow'))&&UI.bf&&UI.bf.aut&&UI.autCard==null&&G.round%2===0&&c(q('#handw .hc.glow'))||c(vis.find(e=>/Done|End my|Keep it|Pass|Skip|No/i.test(e.innerText)))||c(q('#ppop [data-a=mv]'))||c(vis[0])||c(q('.tb-loc.glow .tb-ring'))||c(q('.tbx-pan g.rglow rect'))||c(q('#handw .hc.glow'))||c(q('#handw .kcb.glow'))});
    if(pos){await tap(pos[0],pos[1]);steps++;await sleep(220)}else await sleep(150)}
  const fin=await p.evaluate(()=>({over:!!G.over,inf:G.pl.map(x=>x.inf),r:G.round}));console.log('real game',JSON.stringify(fin),'taps',steps);
  if(!fin.over)note('the real game did not finish by touch');if(!firstShot)note('no first-turn shot');if(!midShot)note('no mid-game shot');
  await b.close();console.log('PROBLEMS '+probs.length);process.exit(probs.length?1:0)})();
