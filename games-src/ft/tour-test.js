// The floating tour (tour.js, W655), at machine speed: node ft/tour-test.js [402x874|1366x768] [shotsDir]   (after a build: ft/sands.html)
// Checks: Learn by playing opens the HUD map; labels never overlap each other or the window and stay on screen; every label explains its
// part with the window off that part; every lesson completes by taps (real moves where the game allows, else Next); taps on things
// that are not highlighted still work; the window never covers the ringed target; the practice commissions are offered at the end;
// then a full game finishes. 0 JS errors. Exit code 1 on any problem.
const PW=(()=>{try{return require('playwright')}catch(e){return require('/opt/node-tools/node_modules/playwright')}})();
const fs=require('fs'),path=require('path');const html=fs.readFileSync(__dirname+'/sands.html');const MEDIA=path.join(__dirname,'..','..','games','sands-of-qamar');
const [W,H]=(process.argv[2]||'402x874').split('x').map(Number);const SH=process.argv[3]||'';const probs=[];const bad=m=>{if(probs.length<40)probs.push(m)};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const b=await PW.chromium.launch(fs.existsSync('/opt/pw-browsers/chromium')?{executablePath:'/opt/pw-browsers/chromium'}:{});const touch=W<700;
 const ctx=await b.newContext({viewport:{width:W,height:H},hasTouch:touch,isMobile:touch,serviceWorkers:'block'});
 await ctx.route('**/*',r=>{const u=new URL(r.request().url());if(u.host!=='gns.test')return r.abort();if(u.pathname==='/')return r.fulfill({status:200,contentType:'text/html',body:html});
   const f=path.join(MEDIA,decodeURIComponent(u.pathname));return fs.existsSync(f)?r.fulfill({status:200,path:f}):r.fulfill({status:404,body:''})});
 const p=await ctx.newPage();p.on('pageerror',e=>bad('PAGE ERROR '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/net::|Failed to load|favicon|404|GLTFLoader/.test(m.text()))bad('console '+m.text().slice(0,140))});
 const tap=async(x,y)=>touch?p.touchscreen.tap(x,y):p.mouse.click(x,y);
 // tap the centre of an element, only if that element (or its child) is what a finger would hit there
 const tapEl=async(sel,i=0)=>{await p.evaluate(s=>{const e=document.querySelector(s);if(GX.open&&e&&!e.closest('.gx-drawer'))GX.close()},sel);const c=await p.evaluate(([s,i])=>{const L=[...document.querySelectorAll(s)].filter(e=>e.getBoundingClientRect().width>2);const free=e=>{const r=e.getBoundingClientRect();const h=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return !!h&&(e===h||e.contains(h))};const e=i<0?(L.find(free)||L[0]):L[i];if(!e)return null;e.scrollIntoView({block:'nearest'});const r=e.getBoundingClientRect();const x=r.left+r.width/2,y=r.top+r.height/2;const h=document.elementFromPoint(x,y);return {x,y,ok:!!h&&(e===h||e.contains(h)),by:h?(h.id||h.className.toString()||h.tagName+'<'+(h.parentElement.id||h.parentElement.className)).slice(0,40):''}},[sel,i]);
   if(!c){bad('no element '+sel+' at lesson '+(await p.evaluate(()=>TOUR.i+1)));return false}if(!c.ok){bad('covered '+sel+' by '+c.by);return false}await tap(c.x,c.y);await sleep(60);return true};
 const shot=async n=>{if(!SH)return;fs.mkdirSync(SH,{recursive:true});await sleep(80);await p.screenshot({path:`${SH}/tour-${n}-${W}x${H}.jpg`,type:'jpeg',quality:62})};
 const ov=(a,b)=>Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left))*Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top));
 await p.goto('https://gns.test/');await sleep(700);
 await p.evaluate(()=>{try{localStorage.clear();localStorage.setItem('soq_tutoffer','1');localStorage.setItem('soq_fing','99')}catch(e){}ANIM=0;AIDELAY=0});await p.reload();await sleep(700);
 await p.evaluate(()=>{ANIM=0;AIDELAY=0;UI.speed=3});
 await tapEl('#modal [data-coach-entry]');await sleep(300);
 // ---- 1. the HUD map ----
 const map=await p.evaluate(()=>{const r=e=>{const q=e.getBoundingClientRect();return {left:q.left,top:q.top,right:q.right,bottom:q.bottom}};
   return {on:TOUR.on&&TOUR.map,w:r(document.getElementById('tourw')),labels:[...document.querySelectorAll('#tourmap .tm-l')].map(e=>({t:e.textContent,i:+e.dataset.tm,...r(e)}))}});
 if(!map.on)bad('map not open on start');if(map.labels.length<14)bad('only '+map.labels.length+' map labels');
 for(let i=0;i<map.labels.length;i++){const a=map.labels[i];if(a.left<0||a.top<0||a.right>W||a.bottom>H)bad('label off screen '+a.t);if(ov(a,map.w))bad('label under window '+a.t);
   for(let j=i+1;j<map.labels.length;j++)if(ov(a,map.labels[j])>0)bad('labels overlap '+a.t+' / '+map.labels[j].t)}
 await shot('00-map');
 for(const l of map.labels){await tapEl(`#tourmap .tm-l[data-tm="${l.i}"]`);await sleep(40);
   const r=await p.evaluate(i=>{const w=document.getElementById('tourw').getBoundingClientRect();const t=tourTarget();const tr=t&&t.getBoundingClientRect();
     return {txt:document.querySelector('#tourw .tw-s').textContent,want:TOUR_MAP[i][2],w:{left:w.left,top:w.top,right:w.right,bottom:w.bottom},t:tr&&{left:tr.left,top:tr.top,right:tr.right,bottom:tr.bottom},area:tr?tr.width*tr.height:0}},l.i);
   if(r.txt!==r.want)bad('label '+l.t+' explains the wrong thing');if(r.t&&ov(r.w,r.t)>0)bad('window covers '+l.t)}
 await shot('01-map-label');
 // minimise to a chip, restore, drag the window
 await tapEl('#tourw [data-tw="min"]');if(!await p.evaluate(()=>document.getElementById('tourw').hidden&&!document.getElementById('tourchip').hidden))bad('minimise failed');
 await tapEl('#tourchip');if(await p.evaluate(()=>document.getElementById('tourw').hidden))bad('restore failed');
 await tapEl('#tourw [data-tw="lessons"]');await sleep(60);
 const n=await p.evaluate(()=>TOUR_L.length);let real=0;
 // ---- 2. every lesson ----
 for(let k=0;k<n;k++){
   const st=await p.evaluate(()=>({i:TOUR.i,map:TOUR.map,on:TOUR.on}));if(st.i!==k){bad(`lesson ${k} expected, at ${st.i}`);await p.evaluate(k=>{TOUR.i=k;tourDraw()},k)}
   await sleep(40);await shot(String(k+2).padStart(2,'0')+'-lesson'+(k+1));
   const g=await p.evaluate(()=>{const w=document.getElementById('tourw').getBoundingClientRect();const t=tourTarget();const tr=t&&t.getBoundingClientRect();const l=TOUR_L[TOUR.i];
     return {l:{ev:l.ev||'',tap:!!l.tap,t:l.t},hit:tr?Math.max(0,Math.min(w.right,tr.right)-Math.max(w.left,tr.left))*Math.max(0,Math.min(w.bottom,tr.bottom)-Math.max(w.top,tr.top)):0,ring:!document.getElementById('tourring').hidden}});
   if(g.hit>0)bad(`lesson ${k+1} (${g.l.t}): window covers its target`);
   // a tap on something NOT highlighted still works (lesson 1: the Log button; lesson 4: another glowing tile)
   if(k===0){await tapEl('.gx-bar [data-gx="logd"]');if(!await p.evaluate(()=>document.getElementById('logd').classList.contains('on')))bad('Log tap blocked during the tour');await p.evaluate(()=>GX.close())}
   const before=await p.evaluate(()=>TOUR.i);
   if(g.l.tap){await p.evaluate(()=>{const t=tourTarget();if(t)t.setAttribute('data-tt','1')});await tapEl('[data-tt="1"]');await p.evaluate(()=>{document.querySelectorAll('[data-tt]').forEach(e=>e.removeAttribute('data-tt'));try{GX.close()}catch(e){}document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape'}))})}
   else if(g.l.ev){ // a real move by tapping the ringed control, while the game lets you
     for(let t=0;t<80;t++){const s=await p.evaluate(()=>({i:TOUR.i,mine:!!(G&&!G.over&&me()&&sideToAct()===me().i),ph:G.phase,step:G.step,mv:!!G.move,chz:!!document.querySelector('#chz:not([hidden]) button')}));
       if(s.i!==before)break;
       if(g.l.ev==='phase:play'||g.l.ev==='round2'){if(s.mine&&s.ph==='bid'&&g.l.ev==='round2'){await p.evaluate(()=>{if(GX.open!=='bidd')GX.show('bidd')});await sleep(60);await tapEl('#bidt .bidt button:not([disabled])',-1)}else if(s.mine&&g.l.ev==='round2'){await p.evaluate(()=>{const m=aiMove(me().i);if(m)go(m)})}await sleep(150);continue}
       if(!s.mine){await sleep(100);continue}
       if(s.chz){await tapEl('#chz:not([hidden]) button');continue}
       if(g.l.ev==='bid'&&s.ph==='bid'){await p.evaluate(()=>{if(GX.open!=='bidd')GX.show('bidd')});await sleep(60);await tapEl('#bidt .bidt button:not([disabled])',-1);continue}
       if(['start','step','take'].includes(g.l.ev)&&s.step==='move'){
         if(g.l.ev==='start'&&!s.mv){const two=await p.evaluate(()=>document.querySelectorAll('#grid .tile.glow').length);
           await tapEl('#grid .tile.glow',two>1?1:0);if(!await p.evaluate(()=>!!G.move))bad('tap on a non-highlighted glowing tile did not lift');continue}
         await tapEl('#grid .tile.glow');continue}
       if(t===39)console.log('fallback',k+1,JSON.stringify(s));break}
     if(await p.evaluate(()=>TOUR.i)!==before)real++}
   if(await p.evaluate(()=>TOUR.i)===before)await tapEl('#tourw [data-tw="next"]');
   await sleep(40);if(await p.evaluate(()=>TOUR.i)!==before+1)bad(`lesson ${k+1} did not complete`)}
 const end=await p.evaluate(()=>({done:Object.keys(TOUR.done).length,comm:document.querySelectorAll('#tourw [data-tw="comm"]').length}));
 if(end.done!==n)bad(`checklist ${end.done}/${n}`);if(end.comm!==6)bad('practice commissions offered: '+end.comm);await tapEl('#tourw [data-tw="list"]');await shot(String(n+2).padStart(2,'0')+'-done');
 // ---- 3. a full game finishes (the computer plays your seat, at machine speed) ----
 const fin=await p.evaluate(()=>{clearTimeout(aiTimer);aiTimer=null;UI.pause=true;let k=0;while(G&&!G.over&&k++<5000){const s=sideToAct();if(s<0)break;const m=aiMove(s)||validMoves(s)[0];if(!m)break;const r=performMove(m,s);if(!r.success)return 'illegal '+JSON.stringify(m)}
   return G.over?'over':'stuck '+G.phase+'/'+G.step});
 if(fin!=='over')bad('full game: '+fin);await p.evaluate(()=>{UI.pause=false;render()});await sleep(200);
 console.log(`tour ${W}x${H}: map labels ${map.labels.length}, lessons ${n}/${n} (${real} by a real move), game ${fin}, problems ${probs.length}`);
 for(const x of probs)console.log('  - '+x);await b.close();process.exit(probs.length?1:0)})();
