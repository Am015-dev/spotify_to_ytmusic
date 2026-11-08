// GUIDE TEST (gameplay gate): starts the guided first game from the title menu and walks it to the end by real touch taps,
// tapping ONLY the highlighted element of each step (refused if something covers its centre). Checks that every step teaches its rule
// in one sentence of 12 words or fewer, that every core rule step appears in order, that the count is walked page by page with no
// "learn later" list, and that "Play a real game" ends on the start screen.  node guide-test.js [390x844] [shotsDir]   (exit 1 on any problem)
const PW=(()=>{try{return require('playwright')}catch(e){return require('/opt/node-tools/node_modules/playwright')}})();
const fs=require('fs');const html=fs.readFileSync(__dirname+'/sands.html');
const [W,H]=(process.argv[2]||'390x844').split('x').map(Number);const SH=process.argv[3]||'';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));const probs=[];const note=m=>{if(probs.length<30)probs.push(m)};
// the core rules the guided game must teach, in this order (ids of guide.js steps)
const CORE=['goal','bid','markers','order','lift','drop','noback','lastcolour','traders','stall','sell','sages','choose','masons','hamlet','advisors','bid2','zeros','bazaar','s3','shadows','summon','power'];
(async()=>{const b=await PW.chromium.launch();const ctx=await b.newContext({viewport:{width:W,height:H},isMobile:true,hasTouch:true,serviceWorkers:'block'});
 await ctx.route('**/*',r=>new URL(r.request().url()).host==='gns.test'?r.fulfill({status:200,contentType:'text/html',body:html}):r.abort());
 const p=await ctx.newPage();p.setDefaultTimeout(15000);
 p.on('pageerror',e=>note('PAGE ERROR '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/net::|Failed to load|favicon|ERR_/.test(m.text()))note('console error '+m.text().slice(0,140))});
 await p.goto('https://gns.test/');await sleep(900);await p.evaluate(()=>{try{localStorage.clear();localStorage.setItem('soq_tutoffer','1')}catch(e){}});await p.reload();await sleep(1200);
 let shotN=0;const shot=async n=>{if(!SH)return;fs.mkdirSync(SH,{recursive:true});await sleep(250);await p.screenshot({path:`${SH}/${n}.png`})};
 // tap the centre of an element if it is the topmost thing there
 const tapSel=async(sel,why)=>{const c=await p.evaluate(sel=>{const e=typeof sel==='string'?document.querySelector(sel):null;if(!e)return null;e.scrollIntoView({block:'nearest'});const r=e.getBoundingClientRect();if(!r.width)return null;
   const x=r.left+r.width/2,y=r.top+r.height/2;const t=document.elementFromPoint(x,y);return {x,y,ok:!!t&&(t===e||e.contains(t)||t.contains(e)),top:t?t.className+'':''}},sel);
  if(!c){note('missing '+why+' '+sel);return false}if(!c.ok){note('covered '+why+' by '+c.top);return false}await p.touchscreen.tap(c.x,c.y);return true};
 const tapTarget=async why=>{const c=await p.evaluate(()=>{const e=gdTarget(gdStep());if(!e)return null;e.scrollIntoView({block:'nearest'});const r=e.getBoundingClientRect();if(!r.width)return null;
   const x=r.left+r.width/2,y=r.top+r.height/2;const t=document.elementFromPoint(x,y);return {x,y,ok:!!t&&(t===e||e.contains(t)||t.contains(e)),hl:e.classList.contains('gd-hl'),top:t?(t.id||t.className)+'':''}});
  if(!c){return false}if(!c.hl){await sleep(300);return false}if(!c.ok){note('covered '+why+' by '+c.top);return false}await p.touchscreen.tap(c.x,c.y);return true};
 await shot('title');
 if(!await tapSel('#modal [data-coach-entry]','learn button'))note('no Learn button on the title screen');await sleep(1000);
 if(await p.evaluate(()=>!(window.GXGUIDE&&GXGUIDE.running)))note('the guided game did not start');
 const seen=[];let lastKey='',lastT=Date.now(),firstTurn=false,mid=false;
 for(let g=0;g<3000;g++){const st=await p.evaluate(()=>window.GXGUIDE&&GXGUIDE.step);if(!st)break;
  const key=st.id+'/'+st.busy;if(key!==lastKey){lastKey=key;lastT=Date.now()}else if(Date.now()-lastT>12000){note('stuck at step '+st.id);break}
  if(st.busy||st.who==='auto'){await sleep(250);continue}
  if(!seen.includes(st.id)){seen.push(st.id);const words=st.say.trim().split(/\s+/).length;if(words>12)note(`step ${st.id}: ${words} words`);
   const shown=await p.evaluate(()=>{const e=document.getElementById('coach');return e&&e.classList.contains('on')?e.innerText:''});if(!shown.includes(st.say))note('step '+st.id+' bubble does not show its sentence');
   await sleep(450);shotN++;await shot('tut-'+shotN);
   if(st.id==='lift'&&!firstTurn){firstTurn=true;await shot('first-turn')}
   if(st.id==='bid2'&&!mid){mid=true;await shot('mid-game')}}
  const n=await p.evaluate(()=>document.querySelectorAll('.gd-hl').length);if(n>1)note('step '+st.id+': '+n+' things glow');
  const tapped=await tapTarget(st.id);if(process.env.DBG&&tapped)console.log("tap",st.id,"->",await p.evaluate(()=>GXGUIDE.step&&GXGUIDE.step.id));await sleep(500)}
 const told=await p.evaluate(()=>GXGUIDE.told);let k=0;for(const id of CORE){const j=told.indexOf(id);if(j<0)note('core rule step missing: '+id);else if(j<k)note('core rule out of order: '+id);else k=j}
 const log=await p.evaluate(()=>G.log.map(e=>e.t).join('\n'));if(!/You calls on Wahha/.test(log))note('you never used a djinn power');if(!/Farid bids 3 coins?/.test(log))note('the 3 free spots limit never forced a paid bid');
 const all=await p.evaluate(()=>GXGUIDE.ids);for(const id of all)if(!told.includes(id))note('step never shown: '+id);
 // the rest of the round is Farid's own turn; then the count
 for(let g=0;g<120;g++){if(await p.evaluate(()=>!!document.getElementById('coachend')))break;await sleep(500)}
 if(!await p.evaluate(()=>!!document.getElementById('coachend')))note('the game did not reach the final count');
 const pages=[];for(let g=0;g<12;g++){const pg=await p.evaluate(()=>{const o=document.getElementById('coachend');if(!o)return null;return {t:o.querySelector('h2').innerText,next:!!o.querySelector('[data-ce=next]'),play:!!o.querySelector('[data-ce=play]'),txt:o.innerText}});
  if(!pg)break;pages.push(pg.t);if(pg.next){await tapSel('#coachend [data-ce=next]','next page');await sleep(400);continue}
  await shot('result');if(!pg.play)note('last count page has no Play a real game');if(/later/i.test(pg.t+pg.txt))note('a learn-later list is shown');
  await tapSel('#coachend [data-ce=play]','play a real game');await sleep(800);break}
 for(const t of ['Coins and land','Palms and palaces','People','Djinns and goods','The count'])if(!pages.includes(t))note('count page missing: '+t);
 if(await p.evaluate(()=>!(UI.modal==='start'&&!G)))note('Play a real game did not open the start screen');
 console.log(`guide ${W}x${H}: steps ${seen.length} (${seen.join(',')}) count pages ${pages.length} problems ${probs.length}`);
 for(const x of probs)console.log('  - '+x);console.log(probs.length?'FAIL':'PASS');await b.close();process.exit(probs.length?1:0)})();
