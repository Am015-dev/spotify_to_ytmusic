// DEAD-TAP TEST (R5 gate): plays full 2-player Quick games by real touch taps WITH the owner art, models and music served
// (so the djinn summon card and every painted overlay really appear), and counts dead taps: a tap whose target is covered
// by something else, or a tap after which nothing in the game or its choosers changes within 1.5 s. Must read 0.
//   node deadtap-test.js [games=3]   (2 games at 390x844, 1 at 375x667; exit 1 on any dead tap or error)
const PW=(()=>{try{return require('playwright')}catch(e){return require('/opt/node-tools/node_modules/playwright')}})();
const fs=require('fs');const html=fs.readFileSync(__dirname+'/sands.html');
const mode='quick';const NG=+process.argv[2]||3;const SIZES=[[390,844],[375,667],[390,844],[375,667]];const SH='';const path=require('path');const GD=path.join(__dirname,'..','..','games','sands-of-qamar');let dead=0;const deadLog=[];
const SMALL={};const sleep=ms=>new Promise(r=>setTimeout(r,ms));const probs=[];const note=m=>{if(probs.length<30)probs.push(m)};
(async()=>{const b=await PW.chromium.launch(process.env.PW_EXE?{executablePath:process.env.PW_EXE}:{});for(let gi=0;gi<NG;gi++){const [W,H]=SIZES[gi%SIZES.length];const mob=W<700;
 const MOUSE=W>=700||!!process.env.MOUSE;const ctx=await b.newContext({viewport:{width:W,height:H},isMobile:mob&&!MOUSE,hasTouch:!MOUSE,serviceWorkers:'block'});
 await ctx.route('**/*',r=>{if(r.request().url().startsWith('blob:'))return r.continue();const u=new URL(r.request().url());if(u.host!=='gns.test')return r.abort();if(u.pathname==='/'||u.pathname==='/index.html')return r.fulfill({status:200,contentType:'text/html',body:html});const f=path.join(GD,decodeURIComponent(u.pathname));if(f.startsWith(GD)&&fs.existsSync(f))return r.fulfill({path:f});return r.fulfill({status:404,body:''})});
 const p=await ctx.newPage();p.setDefaultTimeout(15000);const tapXY=(x,y)=>MOUSE?p.mouse.click(x,y):p.touchscreen.tap(x,y);   // W>=700 or MOUSE=1: plain mouse clicks only
 p.on('pageerror',e=>note('PAGE ERROR '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/net::|Failed to load|favicon/.test(m.text()))note('console error '+m.text().slice(0,140))});
 await p.goto('https://gns.test/');await sleep(900);await p.evaluate(()=>{try{localStorage.clear();localStorage.setItem('soq_tutoffer','1');localStorage.setItem('soq_fing','99')}catch(e){}});await p.reload();await sleep(900);
 await p.evaluate(()=>{window.__sumSeen=0;new MutationObserver(ms=>{for(const m of ms)for(const n of m.addedNodes)if(n.id==='summon')window.__sumSeen++}).observe(document.body,{childList:true})});
 const shot=async n=>{if(SH){fs.mkdirSync(SH,{recursive:true});await sleep(350);await p.screenshot({path:`${SH}/${mode}-${n}-${W}.png`})}};
 const tapEl=async sel=>{const c=await p.evaluate(sel=>{const e=document.querySelector(sel);if(!e)return null;const r=e.getBoundingClientRect();if(!r.width)return null;const x=r.left+r.width/2,y=r.top+r.height/2;const t=document.elementFromPoint(x,y);return {x,y,ok:!!t&&(t===e||e.contains(t)||t.contains(e))}},sel);if(!c)return false;if(!c.ok)note('covered: '+sel);await tapXY(c.x,c.y);return true};
 await shot('title');
 if(mode==='story'){await tapEl('#modal [data-ui=story]');await sleep(900);
   // the prologue (tutorial) is skipped by a finger tap on Skip; then the Story map
   if(await p.evaluate(()=>typeof GXT!=='undefined'&&GXT.active())){const sk=await p.evaluate(()=>{const e=document.querySelector('.gxt-skip');const r=e.getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2]});await tapXY(sk[0],sk[1]);await sleep(600)}
   await p.evaluate(()=>{UI.modal='start';render()});await tapEl('#modal [data-ui=story]');await sleep(900);await shot('map')}
 else{await tapEl('#modal [data-ui=quick]');await sleep(900)}
 let last='',lastT=Date.now(),shots={},turns=0,sawRival=false,startedChapter=false;
 for(let g=0;g<4000;g++){
  const st=await p.evaluate(()=>({over:!!(G&&G.over),g:!!G&&!G.tut,modal:UI.modal,me:!!(G&&me()),ph:G&&G.phase+'/'+G.step,t:G&&G.turnIdx,gxc:!!document.querySelector('.gxc-ov,.gxc-scene,.gxc-map,[class*=gxc]:not(style)')}));
  if(st.over&&(st.modal==='over'||!st.me)){await sleep(2600);await shot('result');break}
  const sig=JSON.stringify(st)+(await p.evaluate(()=>G?G.logN:0));if(sig!==last){last=sig;lastT=Date.now()}else if(Date.now()-lastT>9000){note('stuck 9 s '+sig+' '+JSON.stringify(await p.evaluate(()=>{let m=null;try{m=hlpAdvice()}catch(e){m='ERR '+e.message}return {adv:m,mv:[...document.querySelectorAll('[data-mv]')].map(b=>b.dataset.mv+'|'+b.textContent.trim()),vm:G.pl&&validMoves(me()?me().i:0).slice(0,6)}})));await shot('stuck');break}
  if(!st.g){ // story overlays: tap any visible primary button
    if(await p.evaluate(()=>!!document.querySelector('.gxc-node.next')&&!document.querySelector('.gxc-sheet'))){await sleep(600);await tapEl('.gxc-node.next .gxc-disc');await sleep(700);continue}
    const hit=await p.evaluate(()=>{const bs=[...document.querySelectorAll('[class*=gxc] button:not(.gxc-node):not(.gxc-back),[class*=gxc] [role=button]:not(.gxc-node),.gxc-go,.gxc-next')].filter(e=>{const r=e.getBoundingClientRect();if(!r.width||getComputedStyle(e).visibility==='hidden')return false;const t=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return t&&(t===e||e.contains(t))});
      const pick=bs.find(e=>e.classList.contains('go'))||bs.find(e=>/start|play|next|continue|meet|begin|go|chapter/i.test(e.textContent))||bs[0];if(!pick)return null;const r=pick.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2,t:pick.textContent.trim().slice(0,20)}});
    if(hit){await tapXY(hit.x,hit.y);await sleep(450)}else await sleep(300);continue}
  if(!startedChapter){startedChapter=true;await sleep(500);await shot('first')}
  if(st.modal&&st.modal!=='over'){const h=await p.evaluate(()=>{const e=document.querySelector('#modal .btn.go,#modal .btn');if(!e)return null;const r=e.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2}});if(h){await tapXY(h.x,h.y);await sleep(300)}else await sleep(200);continue}
  if(!st.me){if(!sawRival&&st.ph.startsWith('turn')&&!shots.r){sawRival=true}await sleep(250);if(!shots.r&&await p.evaluate(()=>G.phase==='turn'&&!me())){shots.r=1;await sleep(500);await shot('rival')}continue}
  const tgt=await p.evaluate(()=>{let el=null;try{const m=hlpAdvice();if(UI.chz){const i=UI.chz.opts.findIndex(o=>same(o.m,m));el=document.querySelector('#chz [data-chz="'+(i<0?0:i)+'"]')}else if(m)el=fingerEl(m)}catch(e){}
    if(!el)el=document.querySelector('#chz .chb')||[...document.querySelectorAll('#acts [data-mv]')].find(b=>!/"act":"undo"/.test(b.dataset.mv))||document.querySelector('#grid .glow')||document.querySelector('.sp-b.glow')||[...document.querySelectorAll('#acts button')].find(b=>/skip|done|end|sell/i.test(b.textContent)&&!b.disabled)||document.querySelector('#mkt .glow');
    if(!el)return null;el.scrollIntoView({block:'nearest'});const r=el.getBoundingClientRect();const x=r.left+r.width/2,y=r.top+r.height/2;const t=document.elementFromPoint(x,y);return {x,y,ok:!!t&&(t===el||el.contains(t)||t.contains(el)),what:el.id||el.className}});
  if(!tgt){await sleep(250);continue}
  const sigOf=()=>p.evaluate(()=>JSON.stringify([G&&G.logN,G&&G.phase,G&&G.step,G&&G.act,G&&G.move,G&&G.q,G&&G.turnIdx,G&&G.pl.map(x=>[x.coins,x.res.length,x.dj.length,x.vz,x.el]),UI.chz&&UI.chz.opts.length,UI.pick,UI.mkSel,UI.sellSel,UI.pendDj,UI.pickDj,UI.modal,!!(G&&G.over)]));
  const s0=await sigOf();const cov=!tgt.ok;
  await tapXY(tgt.x,tgt.y);turns++;let moved=false;for(let w=0;w<15&&!moved;w++){await sleep(100);moved=(await sigOf())!==s0}
  if(cov||!moved){dead++;if(deadLog.length<12)deadLog.push(W+'x'+H+' '+(cov?'covered ':'no effect ')+tgt.what+' over:'+(await p.evaluate(()=>{const e=document.getElementById('summon');return e?'summon card':''})))}
  if(process.env.TARGETS){const sm=await p.evaluate(()=>[...document.querySelectorAll('#bd button,#bd [data-mv],#bd [data-sell],#bd [data-dj],#bd [data-chz],#bd .sp-b,#bd [data-tile],#bd [role=button],#chz button,#modal button')].filter(e=>{const r=e.getBoundingClientRect();return r.width&&r.height&&getComputedStyle(e).visibility!=='hidden'&&(r.width<44||r.height<44)&&r.bottom>0&&r.top<innerHeight}).map(e=>(e.id||e.className||e.tagName).toString().slice(0,30)+' '+Math.round(e.getBoundingClientRect().width)+'x'+Math.round(e.getBoundingClientRect().height)));for(const x of sm)SMALL[x.replace(/ \d+x\d+$/,'')]=x}
  if(turns===30&&!shots.s){shots.s=1;await shot('mid')}
 }
 const fin=await p.evaluate(()=>({over:!!(G&&G.over),win:G&&G.winner,pl:G&&G.pl.map(x=>x.nm)}));
 if(!fin.over)note('game did not reach the result screen');
 console.log('game',gi+1,W+'x'+H,'taps',turns,'result',JSON.stringify(fin),'summon cards',await p.evaluate(()=>window.__sumSeen||0));await ctx.close()}
 console.log('dead taps',dead);deadLog.forEach(x=>console.log(' -',x));probs.forEach(x=>console.log(' -',x));const bad=dead>0||probs.length>0;console.log(bad?'FAIL':'PASS');
 await b.close();process.exit(bad?1:0)})();
