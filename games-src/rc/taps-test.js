// Every tap of a full default game by touch (R3 review: "5-17 Continue taps a day"). Title -> Play -> the default game (Marooned, 2 players,
// Easy island) to the result screen, like a new player who taps whatever button is showing as soon as it shows (no speed-up, no waiting for
// the scenes to play by themselves). Each day (R8: ✨ only suggests): for every pawn ✨, the place the finger shows, the ⭐ row; ✨ once more for
// the pile; Start day (HINT=1, the flagged hint mode; default: ✨ Plan it for me, Start day). OWN=1: an own plan (random glowing places and rows; after a refused Start day it follows the board line). Every question: the ✨ pick (PICK=first: the first option).
// Counts decision taps (plan, Start day, answers, a space to choose) and non-decision taps (Continue, Start day N from the summary, OK).
// FAIL when non-decision taps > 60, a page error, or no result screen.   node taps-test.js [WxH=390x844] [seed]
const PW=require('playwright');const fs=require('fs'),path=require('path');
const [W,H]=(process.argv[2]||'390x844').split('x').map(Number);const SEED=process.argv[3];const PICK=process.env.PICK||'adv';const OWN=!!process.env.OWN;const HINT=!!process.env.HINT;let rs0=(+(process.argv[3]||7))>>>0;const rnd=()=>{rs0=(rs0*1664525+1013904223)>>>0;return rs0/4294967296};const warns=new Set();
const HTML=path.join(__dirname,'shipwreck.html');const LIVE=path.join(__dirname,'../../games/shipwreck-isle');const sleep=ms=>new Promise(r=>setTimeout(r,ms));const SHOTS=process.env.SHOTS||'';const shot=async n=>{if(SHOTS)await p.screenshot({path:path.join(SHOTS,n+'.png')})};let p;
(async()=>{const br=await PW.chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const ctx=await br.newContext({viewport:{width:W,height:H},isMobile:true,hasTouch:true});
 await ctx.route('**/*',r=>{const u=new URL(r.request().url());if(u.host!=='swi.test')return r.abort();const p=decodeURIComponent(u.pathname);
  if(p==='/')return r.fulfill({status:200,contentType:'text/html',body:fs.readFileSync(HTML)});const f=path.join(LIVE,p);
  if(fs.existsSync(f)&&fs.statSync(f).isFile())return r.fulfill({status:200,body:fs.readFileSync(f)});return r.fulfill({status:404,body:''})});
 p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource/.test(m.text()))errs.push('console: '+m.text())});
 await p.goto('https://swi.test/'+(HINT?'?hint=1':''));await sleep(900);await p.evaluate(()=>{try{localStorage.clear()}catch(e){}});await p.reload();await sleep(1500);
 if(SEED)await p.evaluate(s=>{try{const o=beginGame;beginGame=function(){setSeed(+s);return o.apply(this,arguments)}}catch(e){}},SEED);
 const centre=sel=>p.evaluate(sel=>{for(const e of document.querySelectorAll(sel)){if(e.disabled)continue;const r=e.getBoundingClientRect();if(r.width<8||r.height<8)continue;const x=r.left+r.width/2,y=r.top+r.height/2;if(x<0||y<0||x>innerWidth||y>innerHeight)continue;const t=document.elementFromPoint(x,y);if(t&&(t===e||e.contains(t)))return [x,y]}return null},sel);
 const tap=async sel=>{const c=await centre(sel);if(!c)return false;await p.touchscreen.tap(c[0],c[1]);return true};
 await tap('#modal [data-a=start]');await sleep(600);await tap('.tutoffer [data-tutoffer=play]');await sleep(1500);
 const D={},N={},labels={};let dec=0,non=0,planned=-1,pileDay=-1,t0=Date.now(),idle=0;
 const count=(isDec,day,what)=>{if(isDec){dec++;D[day]=(D[day]||0)+1}else{non++;N[day]=(N[day]||0)+1;labels[what]=(labels[what]||0)+1}};
 while(Date.now()-t0<900000){
   const st=await p.evaluate(()=>({confirm:!!UI.confirm,over:!!(G&&G.over),st:PHO.st,day:G?G.round:0,res:!!(G&&G.over)&&!!document.querySelector('#modal:not([hidden]) .mbox.over')}));
   if(st.res){await sleep(800);await shot('result');break}
   if(await tap('.gxh-bub .gxh-ok')){count(false,st.day,'help OK');await sleep(350);continue}
   if(await tap('#coachb [data-coach=x]')){count(false,st.day,'coach close');await sleep(350);continue}
   // R8: ✨ only suggests. FOLLOW (default): ✨, then the place the finger shows, then the ⭐ row, for every pawn. OWN=1: my own plan (random places and rows).
   if(!OWN&&!HINT&&(st.st==='plan'||st.st==='plan2')&&planned!==st.day){await shot('plan-'+st.day);if(await tap('#bf [data-a=suggest]')){planned=st.day;count(true,st.day,'plan');await sleep(450);continue}}
   if((OWN||HINT)&&(st.st==='plan'||st.st==='plan2')){if(planned!==st.day){planned=st.day;await shot('plan-'+st.day)}
     if(await centre('#ppop .bfr')){const ok=OWN?await p.evaluate(rn=>{const rs=[...document.querySelectorAll('#ppop .bfr:not(.no)')];if(!rs.length)return false;const r=rs[Math.floor(rn*rs.length)].getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2]},rnd()):await centre('#ppop .bfr[data-rec="1"]')||await centre('#ppop .bfr[data-place]');
       if(ok){await p.touchscreen.tap(ok[0],ok[1]);count(true,st.day,'row');await sleep(450);continue}}
     const fr=await p.evaluate(own=>{const short=planProblems().some(m=>/needs \d pawn/.test(m));const f=humanFree().filter(q=>q.c!=null||(!own&&BF.recTile(q))||(own&&short&&!!BF.msg));const c=curPawn();return {n:f.length,swap:f.length&&(!c||!f.some(q=>q.id===c.id))?f[0].id:null}},OWN);const free=fr.n;
     if(fr.swap&&await tap('#bf [data-pawn="'+fr.swap+'"]')){count(true,st.day,'pawn');await sleep(400);continue}
     if(!OWN&&free===0&&!st.confirm&&pileDay!==st.day&&await p.evaluate(()=>BF.wantPile()>0)){pileDay=st.day;await tap('#bf [data-a=suggest]');count(true,st.day,'suggest pile');await sleep(450);continue}
     if(free>0&&!st.confirm){if(!OWN){await tap('#bf [data-a=suggest]');count(true,st.day,'suggest');await sleep(500);const gh=await p.evaluate(()=>BF.ghostAt&&BF.ghostAt.why==='tile'?[BF.ghostAt.x,BF.ghostAt.y]:null);if(gh){await p.touchscreen.tap(gh[0],gh[1]);count(true,st.day,'space');await sleep(500);continue}}
       else{const g=await p.evaluate(rn=>{const m=/tap place (\d+)/.exec(BF.msg&&BF.msg.t||'');const gs=[...document.querySelectorAll(m?'#bfglow .bfgl[data-t="'+(m[1]-1)+'"]':'#bfglow .bfgl')];if(!gs.length)return null;const r=gs[Math.floor(rn*gs.length)].getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2]},rnd());if(g){await p.touchscreen.tap(g[0],g[1]);count(true,st.day,'space');await sleep(500);continue}}}}
   const sel=PICK==='first'?'.bf-opts .opt':'.bf-opts .opt.rec, .bf-opts .opt';
   if(await tap(sel)){count(true,st.day,'answer');await sleep(450);continue}
   if(await tap('#bfglow .bfgl')){count(true,st.day,'space');await sleep(450);continue}
   if(await tap('#bf [data-a=go][data-force]')||await tap('#bf [data-a=go]')){count(true,st.day,'Start day');await sleep(450);continue}
   const lab=await p.evaluate(()=>{const b=document.querySelector('#bf [data-a=next]');return b?b.textContent.trim():''});
   if(/Start day/.test(lab))await shot('daysum-'+st.day);
   if(/Start day/.test(lab)){for(const t of await p.evaluate(()=>[...document.querySelectorAll('#bfcard .bfpace,#bfcard .bfok')].map(e=>e.textContent)))warns.add(t.replace(/\d+/g,'N').slice(0,60))}
   if(await tap('#bf [data-a=next]')){count(false,st.day,lab.replace(/\d+/,'N'));await sleep(450);continue}
   if(await tap('#modal button.go, #modal [data-a=close]')){count(false,st.day,'modal');await sleep(450);continue}
   idle++;if(idle%60===0)console.log('  idle',idle,JSON.stringify(await p.evaluate(()=>({st:PHO.st,day:G.round,lbl:(document.querySelector('#phlabel')||{}).textContent}))));await sleep(300)}
 const r=await p.evaluate(()=>({win:!!(G&&G.over&&G.over.win),why:G&&G.over&&G.over.why,day:G&&G.round,pile:G&&G.sc&&G.sc.pile}));
 const days=Object.keys(N).map(Number).filter(d=>d>0);const maxDay=Math.max(0,...days.map(d=>N[d]));
 const ok=non<=60&&!errs.length&&!!r.why;
 console.log(`taps ${W}x${H} ${OWN?'OWN plan':HINT?'follow ✨ hints':'follow ✨ plan'} PICK=${PICK}: ${ok?'PASS':'FAIL'} non-decision ${non} (most in a day ${maxDay}, per day ${days.map(d=>d+':'+N[d]).join(' ')}) · decision ${dec} · ${r.win?'RESCUED':'lost'} day ${r.day} pile ${r.pile} · ${Math.round((Date.now()-t0)/1000)} s · errors ${errs.length?errs.slice(0,3).join(' | '):0}`);
 console.log('  non-decision taps by button:',JSON.stringify(labels));
 console.log('  summary lines seen:',JSON.stringify([...warns]));
 await br.close();process.exit(ok?0:1)})();
