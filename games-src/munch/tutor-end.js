// Tutorial-to-end gate: from FRESH storage, start the guided game and play it to the result screen by tapping the centre of each spotlit element.
//   node tutor-end.js [sizes=390x763,1440x860]     exit 1 on any problem.   Checks: elementFromPoint at the target centre is the target (not covered),
//   the step advances, every coverage step id is shown, the game ends with a real result (winner, end card), no page errors.
const PW=(()=>{try{return require('playwright')}catch(e){return require('/opt/node-tools/node_modules/playwright')}})();
const fs=require('fs'),path=require('path');const html=fs.readFileSync(__dirname+'/doorkick.html');const localRoute=require('./local-route.js');
const SIZES=(process.argv[2]||'390x763,1440x860').split(',').map(s=>s.split('x').map(Number));
const sleep=ms=>new Promise(r=>setTimeout(r,ms));const probs=[];const note=(t,m)=>{if(probs.length<40)probs.push(t+': '+m)};
const WANT=(()=>{const t=fs.readFileSync(__dirname+'/tutor.js','utf8');return [...t.matchAll(/\{id:'([a-z0-9]+)',(?:onEnter:[^,]*,)?title:/g)].map(m=>m[1])})();
async function run(b,W,H){const tag=W+'x'+H;const ctx=await b.newContext({viewport:{width:W,height:H},isMobile:W<700,hasTouch:true});await localRoute(ctx,html);
  const p=await ctx.newPage();p.setDefaultTimeout(15000);
  p.on('pageerror',e=>note(tag,'PAGE ERROR '+e.message));p.on('console',m=>{const t=m.text();if(m.type()==='error'&&!/net::|Failed to load|favicon/.test(t))note(tag,'console error '+t.slice(0,160))});
  await p.goto('https://gns.test/'+(W<700?'?phone=1':''));await sleep(900);await p.evaluate(()=>{try{localStorage.clear()}catch(e){}});await p.reload();await sleep(1000);
  const tb=await p.evaluate(()=>{const b=document.querySelector('#modal [data-gxt-open]');if(!b)return null;const r=b.getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2]});
  if(!tb){note(tag,'no Tutorial button on the title');await ctx.close();return}
  await p.touchscreen.tap(tb[0],tb[1]);await sleep(600);await p.evaluate(()=>{UI.speed=4});
  const seen=[];let lastSig='',lastT=Date.now();const st=()=>p.evaluate(()=>GXT.state());
  for(let k=0;k<1200;k++){
    const s=await st();if(!s.active){note(tag,'tutorial ended early at '+seen[seen.length-1]);break}
    if(s.phase==='end')break;
    if(Date.now()-lastT>25000){note(tag,'stuck at '+s.id+' '+JSON.stringify({ph:s.phase,i:s.i}));break}
    if(s.phase!=='show'||!s.shown||!s.hole){await sleep(120);continue}
    const sig=s.id+':'+s.count+':'+s.i;if(sig!==lastSig){lastSig=sig;lastT=Date.now()}
    if(!seen.includes(s.id))seen.push(s.id);
    await sleep(250);const s2=await st();if(s2.id!==s.id||!s2.hole)continue;
    // elementFromPoint at the centre of the target (hole) or of the Next button
    const cov=await p.evaluate(()=>{const s=GXT.state(),h=s.hole;const el=document.elementFromPoint(h.cx,h.cy);
      const nx=document.querySelector('.gxt-next,.gxt-b.pri,[data-gxt-next]');
      const kit=el&&el.closest('.gxt-cell,.gxt-bub,.gxt-top,.gxt-end');return {wait:!!s.wait,tag:el?(el.tagName+'.'+String(el.className).slice(0,40)):null,kit:!!kit&&!el.closest('.gxt-bub'),vw:innerWidth,vh:innerHeight,
        onscreen:h.left>=-1&&h.top>=-1&&h.left+h.width<=innerWidth+1&&h.top+h.height<=innerHeight+1,next:nx?(()=>{const r=nx.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2,top:document.elementFromPoint(r.left+r.width/2,r.top+r.height/2)===nx||nx.contains(document.elementFromPoint(r.left+r.width/2,r.top+r.height/2))}})():null}});
    if(s.id==='finale')await p.screenshot({path:'/tmp/claude-0/s/finale-'+W+'.png'});if(cov.wait){if(cov.kit)note(tag,s.id+': target centre is covered by the tutorial kit ('+cov.tag+')');if(!cov.onscreen)note(tag,s.id+': target not fully on screen')}
    else{let c2=cov;for(let r=0;r<6&&c2.next&&!c2.next.top;r++){await sleep(400);c2=await p.evaluate(()=>{const nx=document.querySelector('.gxt-next');if(!nx)return {next:null};const r=nx.getBoundingClientRect(),e=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return {next:{x:r.left+r.width/2,y:r.top+r.height/2,top:e===nx||nx.contains(e)}}})}
      cov.next=c2.next;if(!cov.next)note(tag,s.id+': no Next button');else if(!cov.next.top)note(tag,s.id+': Next button covered')}
    const before=await st();
    if(!s2.wait){if(cov.next)await p.touchscreen.tap(cov.next.x,cov.next.y)}
    else{
      if(s2.wait==='drag'&&s2.holes.length>1){const c=s2.holes[1];await p.touchscreen.tap(c.cx,c.cy);await sleep(350);const m=await st();if(!m.hole)continue;await p.touchscreen.tap(m.hole.cx,m.hole.cy)}
      else await p.touchscreen.tap(s2.hole.cx,s2.hole.cy)}
    const t1=Date.now();let moved=false;while(Date.now()-t1<2500){await sleep(80);const a=await st();if(a.i!==before.i||a.count!==before.count||a.phase!=='show'||a.id!==before.id){moved=true;break}}
    if(!moved&&s2.wait){const again=await st();if(again.id===before.id&&again.phase==='show'){note(tag,before.id+': tapping the target did not advance');await p.screenshot({path:'/tmp/claude-0/s/tutdead-'+W+'.png'}).catch(()=>{});break}}
  }
  const fin=await p.evaluate(()=>({ph:GXT.state().phase,winner:G&&G.winner,lvl:G&&G.pl[0].lvl,phase:G&&G.phase,act:G&&G.active,cb:G&&G.cb&&G.cb.stage,log:G&&G.log.slice(0,6).map(l=>l.t)}));
  if(fin.ph!=='end')note(tag,'did not reach the end card: '+JSON.stringify(fin)+' seen '+seen.join(','));
  else{if(fin.winner!=='P1')note(tag,'tutorial ended without the player winning: '+JSON.stringify(fin));await p.screenshot({path:'/tmp/claude-0/s/tutend-'+W+'.png'})}
  await p.screenshot({path:'/tmp/claude-0/s/tutfin-'+W+'.png'});const miss=WANT.filter(id=>!seen.includes(id));if(miss.length)note(tag,'coverage steps never shown: '+miss.join(','));
  console.log(tag,fin.ph==='end'&&!miss.length?'PASS':'FAIL','steps shown '+seen.length+'/'+WANT.length);await ctx.close()}
(async()=>{const b=await PW.chromium.launch({args:['--no-sandbox']});for(const [W,H] of SIZES){try{await run(b,W,H)}catch(e){note(W+'x'+H,'CRASH '+String(e.message).split('\n')[0])}}await b.close();
  console.log(probs.length?'PROBLEMS '+probs.length+'\n  '+probs.join('\n  '):'PROBLEMS 0');process.exit(probs.length?1:0)})();
