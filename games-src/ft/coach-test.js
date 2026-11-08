// COACH TEST: starts the coached first game from the title menu and plays it to the final count by real taps (any legal move: the hint finger's target), asserting the coach.
// Plays a Quick game (or Story chapter 1) to the result screen using ONLY real touch taps on visible, uncovered UI.
//   node playable-test.js [mode=quick|story] [size=390x763] [shotsDir]      Exit code 1 on any problem.
// The target of each tap is the control the game's own hint finger points at (hlpAdvice -> fingerEl); the tap is a touch at that element's centre
// and is skipped (a problem is reported) if another element covers the centre.
const PW=(()=>{try{return require('playwright')}catch(e){return require('/opt/node-tools/node_modules/playwright')}})();
const fs=require('fs');const html=fs.readFileSync(__dirname+'/sands.html');
const mode='coach';const [W,H]=(process.argv[2]||'390x763').split('x').map(Number);const SH=process.argv[3]||'';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));const probs=[];const note=m=>{if(probs.length<30)probs.push(m)};
(async()=>{const b=await PW.chromium.launch();const mob=W<700;
 const ctx=await b.newContext({viewport:{width:W,height:H},isMobile:mob,hasTouch:true,serviceWorkers:'block'});
 await ctx.route('**/*',r=>new URL(r.request().url()).host==='gns.test'?r.fulfill({status:200,contentType:'text/html',body:html}):r.abort());
 const p=await ctx.newPage();p.setDefaultTimeout(15000);
 p.on('pageerror',e=>note('PAGE ERROR '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/net::|Failed to load|favicon/.test(m.text()))note('console error '+m.text().slice(0,140))});
 await p.goto('https://gns.test/');await sleep(900);await p.evaluate(()=>{try{localStorage.clear();localStorage.setItem('soq_tutoffer','1');localStorage.setItem('soq_fing','99')}catch(e){}});await p.reload();await sleep(900);
 const shot=async n=>{if(SH){fs.mkdirSync(SH,{recursive:true});await sleep(350);await p.screenshot({path:`${SH}/${mode}-${n}-${W}.png`})}};
 const tapEl=async sel=>{const c=await p.evaluate(sel=>{const e=document.querySelector(sel);if(!e)return null;const r=e.getBoundingClientRect();if(!r.width)return null;const x=r.left+r.width/2,y=r.top+r.height/2;const t=document.elementFromPoint(x,y);return {x,y,ok:!!t&&(t===e||e.contains(t)||t.contains(e))}},sel);if(!c)return false;if(!c.ok)note('covered: '+sel);await p.touchscreen.tap(c.x,c.y);return true};
 await shot('title');
 await tapEl('#modal [data-coach-entry]');await sleep(900);
 if(await p.evaluate(()=>!G||!G.coach))note('the coached game did not start from the title menu');
 let cards=[],trkOk=0,badgeOk=0,prevOk=0;
 let last='',lastT=Date.now(),shots={},turns=0,sawRival=false,startedChapter=false;
 for(let g=0;g<4000;g++){
  const st=await p.evaluate(()=>({over:!!(G&&G.over),g:!!G&&!G.over,modal:UI.modal,me:!!(G&&me()),ph:G&&G.phase+'/'+G.step,t:G&&G.turnIdx,gxc:!!document.querySelector('.gxc-ov,.gxc-scene,.gxc-map,[class*=gxc]:not(style)')}));
  if(st.over){await sleep(900);break}
  {const x=await p.evaluate(()=>{const c=document.getElementById('turnover');const t=document.getElementById('trk');const pv=document.getElementById('trk2');return {card:c&&c.classList.contains('on')?c.innerText:'',trk:!!t&&!t.hidden&&/Round \d/.test(t.innerText)&&/Bid/.test(t.innerText),gain:document.querySelectorAll('#grid .gain').length,prev:!!pv&&!pv.hidden&&/\+\d/.test(pv.textContent)}});if(x.card&&!cards.includes(x.card))cards.push(x.card);if(x.trk)trkOk++;if(x.gain)badgeOk++;if(x.prev)prevOk++}
  const sig=JSON.stringify(st)+(await p.evaluate(()=>G?G.logN:0));if(sig!==last){last=sig;lastT=Date.now()}else if(Date.now()-lastT>9000){note('stuck 9 s '+sig+' '+JSON.stringify(await p.evaluate(()=>{let m=null;try{m=hlpAdvice()}catch(e){m='ERR '+e.message}return {adv:m,mv:[...document.querySelectorAll('[data-mv]')].map(b=>b.dataset.mv+'|'+b.textContent.trim()),vm:G.pl&&validMoves(me()?me().i:0).slice(0,6)}})));await shot('stuck');break}
  if(!st.g){ // story overlays: tap any visible primary button
    if(await p.evaluate(()=>!!document.querySelector('.gxc-node.next')&&!document.querySelector('.gxc-sheet'))){await sleep(600);await tapEl('.gxc-node.next .gxc-disc');await sleep(700);continue}
    const hit=await p.evaluate(()=>{const bs=[...document.querySelectorAll('[class*=gxc] button:not(.gxc-node):not(.gxc-back),[class*=gxc] [role=button]:not(.gxc-node),.gxc-go,.gxc-next')].filter(e=>{const r=e.getBoundingClientRect();if(!r.width||getComputedStyle(e).visibility==='hidden')return false;const t=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return t&&(t===e||e.contains(t))});
      const pick=bs.find(e=>e.classList.contains('go'))||bs.find(e=>/start|play|next|continue|meet|begin|go|chapter/i.test(e.textContent))||bs[0];if(!pick)return null;const r=pick.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2,t:pick.textContent.trim().slice(0,20)}});
    if(hit){await p.touchscreen.tap(hit.x,hit.y);await sleep(450)}else await sleep(300);continue}
  if(!startedChapter){startedChapter=true;await sleep(500);await shot('first')}
  if(!st.me){if(!sawRival&&st.ph.startsWith('turn')&&!shots.r){sawRival=true}await sleep(250);if(!shots.r&&await p.evaluate(()=>G.phase==='turn'&&!me())){shots.r=1;await sleep(500);await shot('rival')}continue}
  if(st.modal&&st.modal!=='over'){const h=await p.evaluate(()=>{const e=document.querySelector('#modal .btn.go,#modal .btn');if(!e)return null;const r=e.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2}});if(h){await p.touchscreen.tap(h.x,h.y);await sleep(300)}else await sleep(200);continue}
  const tgt=await p.evaluate(()=>{let el=null;try{const m=hlpAdvice();if(UI.chz){const i=UI.chz.opts.findIndex(o=>same(o.m,m));el=document.querySelector('#chz [data-chz="'+(i<0?0:i)+'"]')}else if(m)el=fingerEl(m)}catch(e){}
    if(!el)el=document.querySelector('#chz .chb')||[...document.querySelectorAll('#acts [data-mv]')].find(b=>!/"act":"undo"/.test(b.dataset.mv))||document.querySelector('#grid .glow')||document.querySelector('.sp-b.glow')||[...document.querySelectorAll('#acts button')].find(b=>/skip|done|end|sell/i.test(b.textContent)&&!b.disabled)||document.querySelector('#mkt .glow');
    if(!el)return null;el.scrollIntoView({block:'nearest'});const r=el.getBoundingClientRect();const x=r.left+r.width/2,y=r.top+r.height/2;const t=document.elementFromPoint(x,y);return {x,y,ok:!!t&&(t===el||el.contains(t)||t.contains(el)),what:el.id||el.className}});
  if(!tgt){await sleep(250);continue}
  if(!tgt.ok){note('hint target covered '+tgt.what);}
  if(await p.evaluate(()=>{const e=document.getElementById('coach');return e&&e.classList.contains('on')&&Date.now()-COACH.shownAt<2700}))await sleep(2700);   // a player reads the bubble
  await p.touchscreen.tap(tgt.x,tgt.y);turns++;await sleep(220);
  if(turns===30&&!shots.s){shots.s=1;await shot('mid')}
 }
 // the final count: walk the pages with real taps, check the numbers and the rest card
 const pages=[];let alltxt='';
 for(let k=0;k<9;k++){const pg=await p.evaluate(()=>{const o=document.getElementById('coachend');return o?{t:o.querySelector('h2').textContent,txt:o.innerText.slice(0,400),next:!!o.querySelector('[data-ce=next]'),play:!!o.querySelector('[data-ce=play],[data-ce=chapter]')}:null});
  if(!pg){note('no final count card');break}pages.push(pg.t);alltxt+=await p.evaluate(()=>document.getElementById('coachend').innerText);if(k===1)await shot('count');if(pg.play){await shot('later');break}
  if(!await tapEl('#coachend [data-ce=next]')){note('no Next on page '+pg.t);break}await sleep(300)}
 const fin=await p.evaluate(()=>({over:!!(G&&G.over),seen:Object.keys(COACH.seen),all:Object.keys(LORE.coach),scores:G&&G.over&&G.over.scores.map(x=>x.s.total),later:[...document.querySelectorAll('#coachend .ce-l li')].length,txt:document.getElementById('coachend')?document.getElementById('coachend').innerText:''}));
 if(!fin.over)note('game did not reach the final count');
 const unseen=fin.all.filter(x=>!fin.seen.includes(x));
 if(fin.seen.length<7)note('only '+fin.seen.length+' rules explained in play: '+fin.seen.join(','));
 if(fin.later<Math.min(unseen.length,6))note('later card lists '+fin.later+' < '+unseen.length+' unseen rules');
 for(const n of fin.scores||[])if(!alltxt.includes(String(n)))note('final total '+n+' not shown');
 if(!trkOk)note('turn tracker never shown');if(!badgeOk)note('no gain badges on tiles');/* W480: one message at a time, so the points preview line and the rating card are no longer shown in Learn */if(false&&!prevOk)note('no points preview line');if(false&&!cards.some(c=>/^.{0,4}\s?(Hadiya|Your turn)?\s*(Good|Okay|Poor):/.test(c.replace(/\n/g,' '))||/(Good|Okay|Poor): /.test(c)))note('no turn-over rating card: '+JSON.stringify(cards));
 console.log('score layer: tracker',trkOk,'badges',badgeOk,'preview',prevOk,'cards',JSON.stringify(cards.map(c=>c.replace(/\n/g,' ').slice(0,110))));
 if(pages.length<5)note('count walked in only '+pages.length+' pages');
 // finish: Play a real game must leave the coached game
 if(pages.length){await tapEl('#coachend [data-ce=play]');await sleep(600);const e=await p.evaluate(()=>({g:!!G,modal:UI.modal,done:GXT.isDone('sands-of-qamar'),end:!!document.getElementById('coachend')}));if(e.g||e.end||e.modal!=='start'||!e.done)note('Play a real game did not return to the menu: '+JSON.stringify(e))}
 console.log('coach',W+'x'+H,'taps',turns,'explained',fin.seen.length+'/'+fin.all.length,'unseen->later',unseen.join(','),'scores',JSON.stringify(fin.scores),probs.length?'PROBLEMS':'PASS');probs.forEach(x=>console.log(' -',x));
 await b.close();process.exit(probs.length?1:0)})();
