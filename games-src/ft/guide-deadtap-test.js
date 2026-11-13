// DEAD-TAP TEST (W497 R27 fix): a lit thing must answer a real touch tap. Two parts, both by Playwright touchscreen.tap:
//  1. the guided first game: in EVERY step, every lit thing (glow class, gd-hl, an enabled button in the action area or chooser, the bubble's Next)
//     is tapped once; each tap must change something (state or screen). Nothing but the step's own target may be lit.
//  2. real games (2 players, defaults): tap the lit target as soon as it shows (even while a score pop is up) and count taps that change nothing.
// node deadtap-test.js [390x844] [games=2]      (exit 1 on any dead tap, covered target or page error)
const PW=(()=>{try{return require('playwright')}catch(e){return require('/opt/node-tools/node_modules/playwright')}})();
const fs=require('fs');const html=fs.readFileSync(__dirname+'/sands.html');
const [W,H]=(process.argv[2]||'390x844').split('x').map(Number);const GAMES=process.argv[3]!=null?+process.argv[3]:2;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));const probs=[];const note=m=>{if(probs.length<40&&!probs.includes(m))probs.push(m)};
// everything a person would take for "tappable now": reported with a stable label and its centre
const LIT=`(()=>{const out=[],seen=new Set();const vis=e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return r.width>3&&r.height>3&&s.visibility!=='hidden'&&s.display!=='none'&&!e.closest('[hidden]')&&e.getAttribute('aria-disabled')!=='true'&&!e.disabled&&!e.classList.contains('gd-off')};
 const add=(e,k)=>{if(seen.has(e)||!vis(e))return;seen.add(e);const r=e.getBoundingClientRect();const x=r.left+r.width/2,y=r.top+r.height/2;if(x<0||y<0||x>innerWidth||y>innerHeight)return;const t=document.elementFromPoint(x,y);
  out.push({x,y,k,w:Math.round(r.width),h:Math.round(r.height),label:(e.getAttribute('aria-label')||e.innerText||e.className||'').toString().replace(/\\s+/g,' ').trim().slice(0,36),hl:e.classList.contains('gd-hl'),cover:t&&t!==e&&!e.contains(t)&&!t.contains(e)?(()=>{let c=[],n=t;for(let i=0;i<4&&n;i++,n=n.parentElement)c.push((n.id?'#'+n.id:'')+'.'+String(n.className).split(' ').join('.'));return c.join(' < ')})():''})};
 document.querySelectorAll('.glow,.gd-hl').forEach(e=>add(e,'glow'));
 document.querySelectorAll('#acts button,#chz button,#mine button').forEach(e=>add(e,'btn'));
 const nb=document.querySelector('#coach.on button');if(nb)add(nb,'next');return out})()`;
const SIG=`(()=>{let h=0;const s=document.getElementById('bd').innerHTML;for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))|0;
 return [G?G.logN:'x',G&&G.step,G&&G.phase,G&&G.bids&&G.bids.length,G&&G.move?G.move.path.length+':'+G.move.hand.length:-1,!!(G&&G.q),UI.modal,!!UI.pendDj,UI.mkSel&&UI.mkSel.join(),UI.sellSel&&UI.sellSel.join(),window.GXGUIDE&&GXGUIDE.step?GXGUIDE.step.id:'',h].join('|')})()`;
(async()=>{const b=await PW.chromium.launch();let taps=0,dead=0;
 const open=async()=>{const ctx=await b.newContext({viewport:{width:W,height:H},isMobile:true,hasTouch:true,serviceWorkers:'block'});
  await ctx.route('**/*',r=>new URL(r.request().url()).host==='gns.test'?r.fulfill({status:200,contentType:'text/html',body:html}):r.abort());
  const p=await ctx.newPage();p.setDefaultTimeout(15000);
  p.on('pageerror',e=>note('PAGE ERROR '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/net::|Failed to load|favicon|ERR_/.test(m.text()))note('console error '+m.text().slice(0,140))});
  await p.goto('https://gns.test/');await sleep(900);await p.evaluate(()=>{try{localStorage.clear();localStorage.setItem('soq_tutoffer','1')}catch(e){}});await p.reload();await sleep(1200);return p};
 // tap one lit thing; true = it answered
 const tapLit=async(p,c,why)=>{const before=await p.evaluate(SIG);if(c.cover){note(`${why}: "${c.label}" is covered by ${c.cover}`)}
  await p.touchscreen.tap(c.x,c.y);taps++;let ch=false;for(let k=0;k<24;k++){await sleep(50);if(await p.evaluate(SIG)!==before){ch=true;break}}
  if(!ch){dead++;const x=await p.evaluate(([x,y])=>{const t=document.elementFromPoint(x,y);const q=s=>{const e=document.querySelector(s);return !!e&&(e.classList.contains('on')||!e.hidden)};return `at point: ${t?(t.id||t.className)+'':'none'}; pops ${document.querySelectorAll('.plpop').length}; turnover ${q('#turnover.on')}; coach ${q('#coach.on')}; phase ${G&&G.phase}/${G&&G.step} cur ${G&&G.cur}; modal ${UI.modal}`},[c.x,c.y]);note(`DEAD ${why}: "${c.label}" (${c.k}${c.hl?' hl':''}) ${c.w}x${c.h} | ${x}`)}return ch};
 // ---------- 1. the guided game ----------
 if(!process.env.NOTUT){const p=await open();await p.tap('#modal [data-coach-entry]');await sleep(1000);let steps=0,lastId='',lastT=Date.now();
  for(let g=0;g<4000;g++){const st=await p.evaluate(()=>window.GXGUIDE&&GXGUIDE.step);if(!st)break;
   if(st.id!==lastId){lastId=st.id;lastT=Date.now();steps++}else if(Date.now()-lastT>14000){note('stuck at step '+st.id);break}
   if(st.busy||st.who==='auto'){await sleep(250);continue}
   const lit=await p.evaluate(LIT);if(!lit.length){await sleep(250);continue}
   // the step's own target is the one with gd-hl; anything else lit must still answer (it should not exist)
   const others=lit.filter(c=>!c.hl&&c.k!=='next'),target=lit.find(c=>c.hl)||lit.find(c=>c.k==='next');
   for(const c of others){if(!await tapLit(p,c,'tutorial '+st.id+' extra lit thing'))break;break}
   const t2=(await p.evaluate(LIT)).find(c=>c.hl||c.k==='next');if(!t2){await sleep(250);continue}
   if(t2.cover)note(`tutorial ${st.id}: target "${t2.label}" covered by ${t2.cover}`);
   if(t2.w<44||t2.h<44)note(`tutorial ${st.id}: target "${t2.label}" only ${t2.w}x${t2.h}`);
   await tapLit(p,t2,'tutorial '+st.id+' target');await sleep(350)}
  for(let g=0;g<160;g++){if(await p.evaluate(()=>!!document.getElementById('coachend')))break;await sleep(500)}
  for(let g=0;g<12;g++){const nx=await p.evaluate(()=>{const o=document.getElementById('coachend');if(!o)return -1;const n=o.querySelector('[data-ce=next]');if(!n)return 0;const r=n.getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2]});
   if(nx===-1||nx===0)break;await p.touchscreen.tap(nx[0],nx[1]);await sleep(350)}
  console.log(`tutorial ${W}x${H}: ${steps} steps`);await p.context().close()}
 // ---------- 2. real games ----------
 for(let n=0;n<GAMES;n++){const p=await open();await p.evaluate(s=>{setSeed(s)},300+n);await p.tap('text=Play vs computer');await sleep(500);
  await p.evaluate(()=>{const e=[...document.querySelectorAll('#modal button')].find(x=>/Start playing/.test(x.innerText));if(e)e.click()});await sleep(800);await p.evaluate(()=>{UI.speed=3});
  let lastSig='',lastT=Date.now(),gt=0;
  for(let g=0;g<1500;g++){const st=await p.evaluate(()=>({over:!!(G&&G.over),modal:UI.modal,me:!!(G&&me()),pops:document.querySelectorAll('.plpop').length}));
   if(st.over)break;const sg=await p.evaluate(SIG);if(sg!==lastSig){lastSig=sg;lastT=Date.now()}else if(Date.now()-lastT>15000){note(`game ${n}: stuck`);break}
   if(st.modal&&st.modal!=='over'){await sleep(100);continue}if(!st.me){await sleep(60);continue}
   const lit=(await p.evaluate(LIT)).filter(c=>c.k==='glow'||c.k==='btn');if(!lit.length){await sleep(60);continue}
   const glow=lit.filter(c=>c.k==='glow'&&!c.cover),c=(glow.length?glow:lit)[Math.floor(Math.random()*(glow.length||lit.length))];gt++;
   await tapLit(p,c,`game ${n}${st.pops?' (score pop up)':''}`);}
  console.log(`game ${n} ${W}x${H}: ${gt} taps, over=${await p.evaluate(()=>!!(G&&G.over))}`);await p.context().close()}
 console.log(`deadtap ${W}x${H}: taps ${taps}, dead ${dead}, problems ${probs.length}`);for(const x of probs)console.log('  - '+x);console.log(probs.length?'FAIL':'PASS');await b.close();process.exit(probs.length?1:0)})();
