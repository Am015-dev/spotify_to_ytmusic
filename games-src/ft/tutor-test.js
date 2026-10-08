// Tutorial test: plays the staged tutorial through the REAL page with touch taps, doing exactly what every step asks.
//   node tutor-test.js [sizes=390x763,375x553] [only=clean,rotate,leave,skip,offer,story]        Exit code 1 on any problem.
// Runs: a clean run per size; at the first size also a rotation run (portrait -> landscape -> portrait), a "leave and come back" run, a Skip run
// (a saved game must survive untouched), a fresh-profile Story run (Chapter 0, then "Start chapter 1", then Story goes to the chapter map) and
// the "New here?" offer when a first-time player taps Play.
// Checks per step: short text (say <= 20 words, title <= 4), bubble inside the screen and off the spotlight, the target visible, big enough and not covered
// by the kit, the Next button tappable, a wrong tap does not advance and shakes the bubble, the right action advances, nothing stuck for 8 s, no page errors.
// At the end: the "You know the rules" card, the menu shows "Tutorial ✓", nothing was saved, a real game starts. Screenshots (390x763 clean run):
// playtest/tutor-early.png, tutor-mid.png, tutor-score.png, tutor-end.png.
const PW=(()=>{try{return require('playwright')}catch(e){return require('/opt/node-tools/node_modules/playwright')}})();
const fs=require('fs'),path=require('path');
const html=fs.readFileSync(__dirname+'/sands.html');
const SIZES=(process.argv[2]||'390x763,375x553').split(',').map(s=>s.split('x').map(Number));
const SHOTS=path.join(__dirname,'playtest');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const probs=[];const note=(tag,msg)=>{if(probs.length<60)probs.push(tag+': '+msg);else if(probs.length===60)probs.push('... more')};
const wc=t=>String(t||'').replace(/[^a-zA-Z0-9'’+]+/g,' ').trim().split(' ').filter(Boolean).length;
const totals={steps:0,wrong:0,runs:0,ids:[],ms:[]};
const EXPECT=['goal','tribes','bid1','bid2','order','sages','lift','drop','traders','buy','sell1','sell2','advisors','lift2','dropA','dropB','dropC','masons','palace','score','others','shadows','end'];

async function run(browser,W,H,mode){const tag=W+'x'+H+' '+mode;const t0=Date.now();
  const ctx=await browser.newContext({viewport:{width:W,height:H},deviceScaleFactor:1,isMobile:true,hasTouch:true,serviceWorkers:'block'});
  await ctx.route('**/*',r=>new URL(r.request().url()).host==='gns.test'?r.fulfill({status:200,contentType:'text/html',body:html}):r.abort());
  const p=await ctx.newPage();p.setDefaultTimeout(15000);
  p.on('pageerror',e=>note(tag,'PAGE ERROR '+e.message+' '+(e.stack||'').split('\n').slice(0,3).join('|')));
  p.on('console',m=>{const t=m.text();if(m.type()==='warning'&&/rejected|gxt/.test(t))note(tag,'console '+t.slice(0,200));if(m.type()==='error'&&!/net::|Failed to load|favicon/.test(t))note(tag,'console error '+t.slice(0,160))});
  await p.goto('https://gns.test/');await sleep(900);
  await p.evaluate(()=>{try{localStorage.clear()}catch(e){}});
  await p.reload();await sleep(900);
  const ctr=sel=>p.evaluate(sel=>{const b=document.querySelector(sel);if(!b)return null;const r=b.getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2]},sel);
  // first visit: the title shows "New here? Learn in 5 minutes" as the FIRST option
  const first=await p.evaluate(()=>{const b=document.querySelector('#modal .acts.big > *');return b?{t:b.textContent,gxt:b.hasAttribute('data-gxt-open')}:null});
  if(!first||!first.gxt||!/New here/.test(first.t)||!/Learn in 5 minutes/.test(first.t))note(tag,'first menu option is not "New here? Learn in 5 minutes": '+JSON.stringify(first));
  if(mode==='offer'){
    // a first-time player who taps Play is offered the tutorial once
    const pb=await ctr('#modal [data-ui=quick]');await p.touchscreen.tap(pb[0],pb[1]);await sleep(400);
    const o=await p.evaluate(()=>({modal:UI.modal,go:!!document.querySelector('#modal [data-ui=tutgo]'),play:!!document.querySelector('#modal [data-ui=tutplay]'),g:!!G&&!G.tut}));
    if(o.modal!=='offer'||!o.go||!o.play)note(tag,'tapping Play on a first visit did not offer the tutorial '+JSON.stringify(o));
    else{const jp=await ctr('#modal [data-ui=tutplay]');await p.touchscreen.tap(jp[0],jp[1]);await sleep(600);
      const g=await p.evaluate(()=>({modal:UI.modal,g:!!G&&!G.tut&&!G.over,run:GXT.running()}));if(!g.g||g.run)note(tag,'"Just play" did not start a normal game '+JSON.stringify(g));
      await p.evaluate(()=>{openStart()});await sleep(200);const pb2=await ctr('#modal [data-ui=quick]');await p.touchscreen.tap(pb2[0],pb2[1]);await sleep(500);
      const o2=await p.evaluate(()=>UI.modal);if(o2==='offer')note(tag,'the offer was shown twice')}
    totals.runs++;console.log(tag,'done');await ctx.close();return}
  // start it with a finger, from the title menu (or Story for the prologue)
  const tb=await p.evaluate(mode=>{const b=document.querySelector(mode==='story'?'#modal [data-ui=story]':'#modal [data-gxt-open]');const r=b.getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2]},mode);
  await p.touchscreen.tap(tb[0],tb[1]);await sleep(500);
  await p.evaluate(()=>{UI.speed=3});
  if(mode==='skip')await p.evaluate(()=>localStorage.setItem('soq_save1','SENTINEL'));
  const state=()=>p.evaluate(()=>GXT.state());
  const shot=async(n)=>{if(W===390&&H===763&&mode==='clean'){fs.mkdirSync(SHOTS,{recursive:true});await sleep(450);await p.screenshot({path:path.join(SHOTS,'tutor-'+n+'.png')})}};
  let lastSig='',lastT=Date.now(),rotated=0,left=false,seenIds=[],shots={};
  for(let guard=0;guard<6000;guard++){
    const st=await state();
    if(!st.active)break;
    if(st.phase==='end')break;
    const sig=[st.i,st.phase,st.count,st.shown].join('|');
    if(sig!==lastSig){lastSig=sig;lastT=Date.now()}else if(Date.now()-lastT>8000){note(tag,'stuck for 8 s at step '+st.i+' '+st.id+' phase '+st.phase+' '+JSON.stringify(await p.evaluate(()=>({ph:G.phase,st:G.step,t:G.turnIdx,q:G.q&&G.q.kind,mv:G.move&&G.move.drops.length,chz:!!UI.chz,sell:UI.sellSel,hold:tutHeld()}))));await p.screenshot({path:'/tmp/claude-0/tutor_stuck_'+W+'_'+mode+'.png'}).catch(()=>{});break}
    if(!st.shown){await sleep(60);continue}
    // ---- a step is on screen
    if(!seenIds.includes(st.id)){seenIds.push(st.id)}
    const info=await p.evaluate(()=>{const s=GXT.state(),v={w:innerWidth,h:innerHeight};
      const b=document.querySelector('.gxt-bub'),nb=b&&b.querySelector('.gxt-next');
      const q=(e)=>{if(!e)return null;const r=e.getBoundingClientRect();return {left:r.left,top:r.top,right:r.right,bottom:r.bottom,w:r.width,h:r.height}};
      const hole=s.hole;let cover=null,under=null;
      if(hole){const el=document.elementFromPoint(hole.cx,hole.cy);under=el?(el.closest('[data-help]')?'help:'+(el.className||el.tagName):(el.id||el.className&&el.className.baseVal||el.className||el.tagName)):null;cover=!!(el&&el.closest('[data-help]'))}
      const nbe=nb?document.elementFromPoint((q(nb).left+q(nb).right)/2,(q(nb).top+q(nb).bottom)/2):null;
      return {s,v,bub:q(b),next:q(nb),nextOk:!!(nbe&&nb&&(nbe===nb||nb.contains(nbe))),cover,under,title:b&&b.querySelector('.gxh-tt')&&b.querySelector('.gxh-tt').textContent,say:b&&b.querySelector('.gxh-tx').textContent,
        hs:document.documentElement.scrollWidth>innerWidth+1,skip:q(document.querySelector('.gxt-skip')),dots:document.querySelectorAll('.gxt-dots i').length,
        hasData:[...document.querySelectorAll('.gxt-bub,.gxt-cell,.gxt-top,.gxt-ring')].every(e=>e.hasAttribute('data-help'))}});
    const s=info.s,id=s.id;
    totals.steps++;
    if(wc(info.say)>20&&!/^Tap/.test(info.say))note(tag,id+': say over 20 words ('+wc(info.say)+')');
    if(info.title&&wc(info.title)>4)note(tag,id+': title over 4 words');
    if(!info.say)note(tag,id+': empty text');
    if(info.hs)note(tag,id+': page scrolls sideways');
    if(!info.hasData)note(tag,id+': a tutorial element without data-help');
    if(info.dots!==s.n)note(tag,id+': progress dots '+info.dots+' vs steps '+s.n);
    if(!info.skip)note(tag,id+': no Skip tutorial button');
    // the bubble: inside the screen, not over any spotlight
    const b=info.bub,V=info.v;
    if(!b)note(tag,id+': no bubble');else{
      if(b.left<-1||b.top<-1||b.right>V.w+1||b.bottom>V.h+1)note(tag,id+': bubble outside the screen '+JSON.stringify(b));
      for(const h of s.holes){if(b.left<h.left+h.width&&b.right>h.left&&b.top<h.top+h.height&&b.bottom>h.top)note(tag,id+': bubble covers the spotlight')}
      if(info.skip&&b.top<info.skip.bottom-1&&b.left<info.skip.right&&b.right>info.skip.left)note(tag,id+': bubble covers the top strip')}
    // the target: visible, big enough, inside the screen, not covered by the kit (Next steps: the Next button is tappable instead)
    const h=s.hole;
    if(!h)note(tag,id+': no spotlight');else{
      const vis=Math.max(0,Math.min(h.left+h.width,V.w)-Math.max(h.left,0))*Math.max(0,Math.min(h.top+h.height,V.h)-Math.max(h.top,0));
      if(vis<0.9*h.width*h.height)note(tag,id+': target not fully on screen');
      if(h.width<24||h.height<24)note(tag,id+': target smaller than a fingertip ('+Math.round(h.width)+'x'+Math.round(h.height)+')');
      if(s.wait&&info.cover)note(tag,id+': target covered by '+info.under);
    }
    if(!s.wait){if(!info.next||!info.nextOk)note(tag,id+': the Next button is missing or covered')}
    // screenshots at 390x763 (clean run): an early step, a middle one, a scoring one
    if(!shots[id]&&!/^Tap (the glowing|Next)/.test(info.say)){if(id==='tribes'||id==='drop'&&s.count===1||id==='score'){shots[id]=1;await shot(id==='tribes'?'early':id==='drop'?'mid':'score')}}
    // rotations: to landscape and back, half way
    if(mode==='rotate'&&rotated===0&&s.id==='sell1'){rotated=1;await p.setViewportSize({width:H,height:W});await p.evaluate(()=>{dispatchEvent(new Event('resize'));dispatchEvent(new Event('orientationchange'))});await sleep(900);
      const r=await state();if(!r.shown||!r.hole)note(tag,'after rotating to landscape the step is not on screen');else await p.screenshot({path:'/tmp/claude-0/tutor_rot_land.png'});continue}
    if(mode==='rotate'&&rotated===1&&s.id==='advisors'){rotated=2;await p.setViewportSize({width:W,height:H});await p.evaluate(()=>{dispatchEvent(new Event('resize'));dispatchEvent(new Event('orientationchange'))});await sleep(900);
      const r=await state();if(!r.shown||!r.hole)note(tag,'after rotating back the step is not on screen');continue}
    // a wrong tap: outside the spotlight (or on the highlighted thing of a Next step) must not advance and must shake the bubble
    const need=s.wait?'out':'in';
    const wp=await p.evaluate(([need])=>{const s=GXT.state(),V={w:innerWidth,h:innerHeight};const H=s.holes;
      const inside=(x,y)=>H.some(r=>x>=r.left-2&&x<=r.left+r.width+2&&y>=r.top-2&&y<=r.top+r.height+2);
      if(need==='in')return {x:s.hole.cx,y:s.hole.cy};
      const b=s.bubble;const inB=(x,y)=>b&&x>=b.left-10&&x<=b.right+10&&y>=b.top-10&&y<=b.bottom+10;
      for(const [fx,fy] of [[.5,.5],[.15,.45],[.85,.45],[.5,.3],[.2,.7],[.8,.7],[.5,.62],[.1,.2],[.9,.2],[.5,.9]]){const x=V.w*fx,y=V.h*fy;if(y>40&&!inside(x,y)&&!inB(x,y))return {x,y}}return null},need);
    if(wp&&(guardOnce(s.id))){const before=await state();await p.touchscreen.tap(wp.x,wp.y);await sleep(140);const after=await state();totals.wrong++;
      if(after.i!==before.i||after.count!==before.count)note(tag,id+': a wrong tap advanced the tutorial');
      if(after.wrongs<=before.wrongs)note(tag,id+': a wrong tap did not shake the bubble');
      const hint=await p.evaluate(()=>{const b=document.querySelector('.gxt-bub');return b&&b.classList.contains('gxt-shake')&&b.querySelector('.gxh-tx').textContent});
      if(!hint||!/Tap/.test(hint))note(tag,id+': wrong tap gave no "Tap ..." hint ('+hint+')')}
    // "Skip tutorial": once, at step 4, tap it with a finger: everything goes away, the title is back, the tutorial is not marked done, the saved game is untouched
    if(mode==='skip'&&s.i>=4){const sk=info.skip;await p.touchscreen.tap((sk.left+sk.right)/2,(sk.top+sk.bottom)/2);await sleep(500);
      const o=await p.evaluate(()=>({run:GXT.running(),dom:document.querySelectorAll('.gxt-cell,.gxt-bub,.gxt-top,.gxt-end').length,start:UI.modal==='start',g:!!G,
        btn:(document.querySelector('#modal [data-gxt-open] b')||{}).textContent,st:JSON.parse(localStorage.getItem('gxt-sands-of-qamar')||'{}'),saved:localStorage.getItem('soq_save1')}));
      if(o.run||o.dom)note(tag,'Skip left tutorial elements on screen ('+o.dom+')');if(!o.start)note(tag,'Skip did not return to the title');if(o.g)note(tag,'Skip left the staged game running');
      if(/✓/.test(o.btn||''))note(tag,'a skipped tutorial shows Tutorial ✓');if(o.st.done)note(tag,'a skipped tutorial was marked done');if(o.st.open)note(tag,'a skipped tutorial is still "open"');
      if(o.saved!=='SENTINEL')note(tag,'the tutorial touched the saved game ('+o.saved+')');
      const pb=await ctr('#modal [data-ui=quick]');await p.touchscreen.tap(pb[0],pb[1]);await sleep(700);
      const n=await p.evaluate(()=>({g:!!G&&!G.tut&&G.phase==='bid',modal:UI.modal,dom:document.querySelectorAll('.gxt-cell,.gxt-bub').length}));
      if(!n.g)note(tag,'no normal game after Skip '+JSON.stringify(n));if(n.dom)note(tag,'tutorial elements in a normal game after Skip');
      totals.runs++;console.log(tag,'done');await ctx.close();return}
    // "leave and come back": once, at step 7, reload the page; the title must offer restart or exit
    if(mode==='leave'&&!left&&s.i>=7){left=true;await p.reload();await sleep(1000);
      const o=await p.evaluate(()=>({t:(document.querySelector('#modal [data-gxt-open]')||{}).textContent,active:GXT.active(),saved:localStorage.getItem('soq_save1')}));
      if(o.active)note(tag,'tutorial still running after a reload');if(o.saved)note(tag,'leaving mid-tutorial saved the staged game');
      const bb=await ctr('#modal [data-gxt-open]');await p.touchscreen.tap(bb[0],bb[1]);await sleep(300);
      const d=await p.evaluate(()=>({dlg:!!document.querySelector('.gxt-end [data-gxt-dlg=restart]'),exit:!!document.querySelector('.gxt-end [data-gxt-dlg=exit]')}));
      if(!d.dlg||!d.exit)note(tag,'reopening a half-done tutorial offered no restart/exit ('+JSON.stringify(d)+')');
      else{const rb=await ctr('[data-gxt-dlg=restart]');await p.touchscreen.tap(rb[0],rb[1]);await sleep(600);await p.evaluate(()=>{UI.speed=3});
        const r2=await state();if(!r2.active||r2.i!==0)note(tag,'restart did not start at step 0 ('+JSON.stringify({a:r2.active,i:r2.i})+')');lastSig='';lastT=Date.now();seenIds=[]}
      continue}
    // ---- do exactly what the step asks
    if(!s.wait){const nx=info.next;await p.touchscreen.tap((nx.left+nx.right)/2,(nx.top+nx.bottom)/2)}
    else{
      const before=await state();
      await p.touchscreen.tap(h.cx,h.cy);
      const t1=Date.now();let moved=false;
      while(Date.now()-t1<2500){await sleep(60);const a=await state();if(a.i!==before.i||a.count!==before.count||a.phase!=='show'){moved=true;break}}
      if(!moved){note(tag,id+': tapping the target did not advance'+JSON.stringify({hole:h,under:info.under}));await p.screenshot({path:'/tmp/claude-0/tutor_dead_'+W+'_'+mode+'.png'}).catch(()=>{});break}
    }
    await sleep(40);
  }
  // ---- the end
  const fin=await state();
  const missing=EXPECT.filter(x=>!seenIds.includes(x));if(missing.length&&mode!=='leave')note(tag,'steps never shown: '+missing.join(','));
  if(!fin.active||fin.phase!=='end')note(tag,'the tutorial did not reach the end card ('+JSON.stringify({a:fin.active,ph:fin.phase,i:fin.i,id:fin.id})+') seen '+seenIds.join(','));
  else if(mode==='story'){
    await sleep(300);
    const e=await p.evaluate(()=>{const c=document.querySelector('.gxt-end');return c&&[...c.querySelectorAll('[data-gxt-end]')].map(b=>({t:b.textContent,k:b.dataset.gxtEnd,r:(()=>{const q=b.getBoundingClientRect();return [q.left,q.top,q.right,q.bottom]})()}))});
    if(!e||e.length!==1||e[0].k!=='chapter'||!/Start chapter 1/.test(e[0].t))note(tag,'story prologue end card buttons: '+JSON.stringify(e));
    else{await p.touchscreen.tap((e[0].r[0]+e[0].r[2])/2,(e[0].r[1]+e[0].r[3])/2);await sleep(900);
      const sc=await p.evaluate(()=>({scene:!!document.querySelector('.gxc-scene-on')}));
      if(!sc.scene)note(tag,'chapter 1 intro did not start after the tutorial');
      else{for(let k=0;k<10;k++){const q=await p.evaluate(()=>({camp:!!UI.camp&&!!G,skip:(()=>{const b=[...document.querySelectorAll('.gxc-btn.ghost')].find(x=>/^skip/i.test(x.textContent.trim()));if(!b)return null;const r=b.getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2]})(),go:(()=>{const b=document.querySelector('.gxc-btn.go');if(!b)return null;const r=b.getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2]})()}));
        if(q.camp)break;const t=q.skip||q.go;if(t)await p.touchscreen.tap(t[0],t[1]);await sleep(500)}
        const ok=await p.evaluate(()=>!!UI.camp&&!!G&&!G.over&&G.round===1&&!G.tut&&!GXT.running());
        if(!ok)note(tag,'chapter 1 did not start after its intro '+JSON.stringify(await p.evaluate(()=>({camp:!!UI.camp,g:!!G,over:G&&!!G.over,round:G&&G.round,tut:G&&G.tut,run:GXT.running(),modal:UI.modal,btns:[...document.querySelectorAll('.gxc button')].filter(b=>b.getBoundingClientRect().width).map(b=>b.className+':'+b.textContent.trim().slice(0,20))}))))}}
    const st2=await p.evaluate(()=>JSON.parse(localStorage.getItem('gxt-sands-of-qamar')||'{}'));if(!st2.done)note(tag,'prologue not remembered as done');
    // second time: Story goes straight to the chapter map; the chapter list has a Tutorial button
    await p.evaluate(()=>{try{GXC.close()}catch(e){}UI.camp=null;G=null;UI.modal='start';render()});await sleep(200);
    const sb=await ctr('#modal [data-ui=story]');await p.touchscreen.tap(sb[0],sb[1]);await sleep(600);
    const m=await p.evaluate(()=>({run:GXT.running(),map:!!document.querySelector('.gxc-map-on'),rep:[...document.querySelectorAll('.gxc-head button')].some(b=>/Tutorial/.test(b.textContent))}));
    if(m.run)note(tag,'a finished player was sent through the tutorial again');if(!m.map)note(tag,'Story did not open the chapter map after the tutorial');if(!m.rep)note(tag,'no "Tutorial" (replay) button in the chapter list');
  }
  else{
    await sleep(300);
    const e=await p.evaluate(()=>{const c=document.querySelector('.gxt-end');if(!c)return null;const r=c.querySelector('.gxt-endc').getBoundingClientRect();return {t:c.querySelector('.gxt-et').textContent,btns:[...c.querySelectorAll('[data-gxt-end]')].map(b=>({t:b.textContent,k:b.dataset.gxtEnd,r:(()=>{const q=b.getBoundingClientRect();return [q.left,q.top,q.right,q.bottom,q.height]})()})),inside:r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight}});
    if(!e)note(tag,'no end card');else{
      if(!/know the rules/i.test(e.t))note(tag,'end card title: '+e.t);
      const ks=e.btns.map(b=>b.k).join();if(ks!=='play,story')note(tag,'end card buttons: '+ks);
      if(!e.inside)note(tag,'end card outside the screen');
      for(const b of e.btns)if(b.r[4]<40)note(tag,'end button too small: '+b.t);
      await shot('end');
      const play=e.btns.find(b=>b.k==='play');await p.touchscreen.tap((play.r[0]+play.r[2])/2,(play.r[1]+play.r[3])/2);await sleep(500);
      const after=await p.evaluate(()=>({run:GXT.running(),dom:document.querySelectorAll('.gxt-cell,.gxt-bub,.gxt-end,.gxt-top').length,start:UI.modal==='start',g:!!G,
        btn:(document.querySelector('#modal [data-gxt-open] b')||{}).textContent,st:JSON.parse(localStorage.getItem('gxt-sands-of-qamar')||'{}'),saved:localStorage.getItem('soq_save1')}));
      if(after.run||after.dom)note(tag,'tutorial elements left on screen after the end card ('+after.dom+')');
      if(!after.start)note(tag,'"Play a real game" did not open the title');if(after.g)note(tag,'the staged game is still loaded after the end card');
      if(!/✓/.test(after.btn||''))note(tag,'menu does not show Tutorial ✓ ('+after.btn+')');
      if(!after.st.done)note(tag,'tutorial not remembered as done');
      if(after.saved)note(tag,'the staged tutorial game was saved as a normal game');
      if(/New here/.test(after.btn||''))note(tag,'"New here" still shown after the tutorial');
      // a normal game still starts and plays: Play vs computer, one bid
      const pb=await ctr('#modal [data-ui=quick]');await p.touchscreen.tap(pb[0],pb[1]);await sleep(700);
      const n=await p.evaluate(()=>({g:!!G&&!G.tut&&G.phase==='bid',modal:UI.modal,dom:document.querySelectorAll('.gxt-bub,.gxt-cell').length,gx:document.querySelectorAll('.gxh-bub').length}));
      if(!n.g)note(tag,'a normal game did not start after the tutorial '+JSON.stringify(n));if(n.dom)note(tag,'tutorial elements in a normal game');
      // the in-game menu lists the tutorial
      await p.evaluate(()=>GX.show('menud'));await sleep(200);const mm=await p.evaluate(()=>(document.querySelector('#gxtmenu [data-gxt-open] b')||{}).textContent);if(!/Tutorial/.test(mm||''))note(tag,'the in-game menu has no Tutorial entry ('+mm+')');
    }
  }
  totals.runs++;totals.ms.push(Date.now()-t0);totals.ids=seenIds.length>totals.ids.length?seenIds:totals.ids;
  console.log(tag,'done in',Math.round((Date.now()-t0)/1000)+'s, steps seen',seenIds.length);
  await ctx.close()}
const once=new Set();const guardOnce=id=>{const k=id+'|'+(guardOnce.run||'');if(once.has(k))return false;once.add(k);return true};

(async()=>{const b=await PW.chromium.launch({args:['--no-sandbox']});
  const jobs=[];for(const [W,H] of SIZES){jobs.push([W,H,'clean']);}
  const [W0,H0]=SIZES[0];jobs.push([W0,H0,'rotate']);jobs.push([W0,H0,'leave']);jobs.push([W0,H0,'skip']);jobs.push([W0,H0,'offer']);jobs.push([W0,H0,'story']);if(SIZES[1])jobs.push([SIZES[1][0],SIZES[1][1],'story']);
  const ONLY=process.argv[3]?process.argv[3].split(','):null;
  for(const j of jobs){if(ONLY&&!ONLY.includes(j[2]))continue;guardOnce.run=j.join('x');try{await run(b,...j)}catch(e){note(j.join(' '),'CRASH '+String(e.message).split('\n')[0])}}
  await b.close();
  console.log('steps checked',totals.steps,'wrong taps',totals.wrong,'step ids',totals.ids.join(','));
  console.log(probs.length?'PROBLEMS '+probs.length+'\n  '+probs.join('\n  '):'PROBLEMS 0');process.exit(probs.length?1:0)})();
