// Tutorial test: plays the staged tutorial through the REAL page with touch taps, doing exactly what every step asks.
//   node tutor-test.js [sizes=390x763,375x553]        Exit code 1 on any problem.   env: FILE=nebula.html
// Runs per size: one clean run; at the first size also a run with rotations half way (portrait -> landscape -> portrait), a "leave and come back" run, a "Skip" run,
// a fresh-profile Story run (the tutorial is Chapter 0, then "Start chapter 1") and a Launch-offer run (first Launch asks "New here?").
// Checks per step: the bubble is short (say <= 20 words, title <= 4), inside the screen and never over the spotlight; the target is visible and not covered by
// the kit; a wrong tap (outside the spotlight) does not advance and shakes the bubble; the right action advances; nothing stuck for 8 s; no page errors.
// At the end: the "You know the rules" card, a real game from it, the menu shows "Tutorial ✓", the progress is remembered, nothing saved. Screenshots (390x763):
// playtest/tutor-start.png, tutor-dice.png, tutor-stress.png, tutor-end.png.
const PW=require('/opt/node22/lib/node_modules/playwright');
const fs=require('fs'),path=require('path');
const FILE=path.resolve(process.env.FILE||path.join(__dirname,'nebula.html'));
const SIZES=(process.argv[2]||'390x763,375x553').split(',').map(s=>s.split('x').map(Number));
const SHOTS=path.join(__dirname,'playtest');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const probs=[];const note=(tag,msg)=>{if(probs.length<60)probs.push(tag+': '+msg);else if(probs.length===60)probs.push('... more')};
const wc=t=>String(t||'').replace(/[^a-zA-Z0-9'’+]+/g,' ').trim().split(' ').filter(Boolean).length;
const totals={steps:0,wrong:0,runs:0,ids:[]};
const ARGS=['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'];
const ctr=(p,sel)=>p.evaluate(sel=>{const e=[...document.querySelectorAll(sel)].find(x=>x.offsetParent!==null||x.getClientRects().length);if(!e)return null;const r=e.getBoundingClientRect();return r.width?[r.left+r.width/2,r.top+r.height/2]:null},sel);

async function run(browser,W,H,mode){const tag=W+'x'+H+' '+mode;const t0=Date.now();
  const ctx=await browser.newContext({viewport:{width:W,height:H},deviceScaleFactor:1,isMobile:true,hasTouch:true});
  const p=await ctx.newPage();p.setDefaultTimeout(20000);
  p.on('pageerror',e=>note(tag,'PAGE ERROR '+e.message+' '+(e.stack||'').split('\n').slice(0,3).join('|')));
  p.on('console',m=>{const t=m.text();if(m.type()==='warning'&&/rejected|gxt/.test(t))note(tag,'console '+t.slice(0,200));if(m.type()==='error'&&!/net::|Failed to load|favicon|fonts\.g/.test(t))note(tag,'console error '+t.slice(0,160))});
  await p.goto('file://'+FILE+'?phone=1');await p.waitForSelector('[data-start]',{timeout:30000});await sleep(900);
  await p.evaluate(()=>{try{localStorage.clear()}catch(e){}});
  await p.reload();await p.waitForSelector('[data-start]',{timeout:30000});await sleep(900);
  // first visit: the title shows "New here? Learn in 5 minutes" as the first option
  const first=await p.evaluate(()=>{const b=document.querySelector('#modal .dlg.start [data-gxt-open]');return b?{t:b.textContent,first:b===document.querySelector('#modal .dlg.start .row button')}:null});
  if(!first||!/New here/.test(first.t)||!first.first)note(tag,'first menu option is not "New here? Learn in 5 minutes": '+JSON.stringify(first));
  if(mode==='offer'){
    const l=await ctr(p,'[data-start="solo"]');await p.touchscreen.tap(l[0],l[1]);await sleep(500);
    const o=await p.evaluate(()=>({offer:!!document.querySelector('#tutoffer'),btns:[...document.querySelectorAll('#tutoffer [data-tutoffer]')].map(b=>b.textContent),started:typeof G!=='undefined'&&!!G&&G.round>=0&&!!UI&&!UI.info}));
    if(!o.offer||o.btns.length!==2)note(tag,'first Launch did not offer the tutorial: '+JSON.stringify(o));
    else{const b=await ctr(p,'#tutoffer [data-tutoffer=play]');await p.touchscreen.tap(b[0],b[1]);await sleep(1200);
      const g=await p.evaluate(()=>({g:typeof G!=='undefined'&&!!G&&!G.tut,bf:BF.on,info:UI.info,offer:!!document.querySelector('#tutoffer'),played:localStorage.getItem('na_played')}));
      if(!g.g||g.info||g.offer||!g.played)note(tag,'"Just play" did not start a normal game: '+JSON.stringify(g));
      await p.evaluate(()=>{UI.info=true;render()});await sleep(300);
      const l2=await ctr(p,'[data-start="solo"]');await p.touchscreen.tap(l2[0],l2[1]);await sleep(600);
      const o2=await p.evaluate(()=>({offer:!!document.querySelector('#tutoffer'),info:UI.info}));if(o2.offer)note(tag,'the offer came back on the second Launch');
      // the offer's other button starts the tutorial
      await p.evaluate(()=>{localStorage.clear();UI.info=true;render()});await sleep(300);
      const l3=await ctr(p,'[data-start="solo"]');await p.touchscreen.tap(l3[0],l3[1]);await sleep(500);
      const lb=await ctr(p,'#tutoffer [data-tutoffer=learn]');if(!lb)note(tag,'no Learn button');else{await p.touchscreen.tap(lb[0],lb[1]);await sleep(1200);
        const r=await p.evaluate(()=>GXT.running()&&!!G&&!!G.tut);if(!r)note(tag,'"Learn in 5 minutes" did not start the tutorial')}}
    totals.runs++;console.log(tag,'done');await ctx.close();return}
  // start it with a finger
  const start=mode==='story'?'[data-a=story]':'#modal .dlg.start [data-gxt-open]';
  const tb=await ctr(p,start);if(!tb){note(tag,'no start button '+start);await ctx.close();return}
  await p.touchscreen.tap(tb[0],tb[1]);await sleep(900);
  await p.evaluate(()=>{AIDELAY=150});
  const state=()=>p.evaluate(()=>GXT.state());
  const shot=async(n)=>{if(W===390&&H===763&&mode==='clean'){fs.mkdirSync(SHOTS,{recursive:true});await p.screenshot({path:path.join(SHOTS,'tutor-'+n+'.png')})}};
  let lastSig='',lastT=Date.now(),rotated=0,left=false,seenIds=[];const shots={};
  for(let guard=0;guard<6000;guard++){
    const st=await state();
    if(!st.active)break;
    if(st.phase==='end')break;
    const sig=[st.i,st.phase,st.count,st.shown].join('|');
    if(sig!==lastSig){lastSig=sig;lastT=Date.now()}else if(Date.now()-lastT>8000){note(tag,'stuck for 8 s at step '+st.i+' '+st.id+' phase '+st.phase+' '+JSON.stringify(await p.evaluate(()=>({round:G.round,ph:G.phase,cur:G.cur,q:G.q&&G.q.key,hold:UI.hold&&UI.hold.kind,wave:!!BF.wave,key:BF.key,ez:!!V3.ez}))));await p.screenshot({path:'/tmp/claude-0/tutor_stuck_'+W+'_'+mode+'.png'}).catch(()=>{});break}
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
        hasData:[...document.querySelectorAll('.gxt-bub,.gxt-cell,.gxt-top,.gxt-ring')].every(e=>e.hasAttribute('data-help')),
        gstate:{round:G.round,ph:G.phase,sh:G.ships.map(s=>s.sh+'/'+(s.hull-hullDmg(s)))}}});
    const s=info.s,id=s.id;
    totals.steps++;
    if(wc(info.say)>20)note(tag,id+': say over 20 words ('+wc(info.say)+')');
    if(info.title&&wc(info.title)>4)note(tag,id+': title over 4 words');
    if(!info.say)note(tag,id+': empty text');
    if(info.hs)note(tag,id+': page scrolls sideways');
    if(!info.hasData)note(tag,id+': a tutorial element without data-help');
    if(info.dots!==s.n)note(tag,id+': progress dots '+info.dots+' vs steps '+s.n);
    if(!info.skip)note(tag,id+': no Skip tutorial button');
    const b=info.bub,V=info.v;
    if(!b)note(tag,id+': no bubble');else{
      if(b.left<-1||b.top<-1||b.right>V.w+1||b.bottom>V.h+1)note(tag,id+': bubble outside the screen '+JSON.stringify(b));
      for(const h of s.holes){if(b.left<h.left+h.width&&b.right>h.left&&b.top<h.top+h.height&&b.bottom>h.top)note(tag,id+': bubble covers the spotlight')}
      if(info.skip&&b.top<info.skip.bottom-1&&b.left<info.skip.right&&b.right>info.skip.left)note(tag,id+': bubble covers the top strip')}
    const h=s.hole;
    if(!h)note(tag,id+': no spotlight');else{
      const vis=Math.max(0,Math.min(h.left+h.width,V.w)-Math.max(h.left,0))*Math.max(0,Math.min(h.top+h.height,V.h)-Math.max(h.top,0));
      if(vis<0.9*h.width*h.height)note(tag,id+': target not fully on screen');
      if(h.width<24||h.height<24)note(tag,id+': target smaller than a fingertip ('+Math.round(h.width)+'x'+Math.round(h.height)+')');
      if(s.wait&&info.cover)note(tag,id+': target covered by '+info.under);
    }
    if(!s.wait){if(!info.next||!info.nextOk)note(tag,id+': the Next button is missing or covered')}
    // screenshots at 390x763 (after a moment so the bubble has settled)
    if(mode==='clean'&&W===390&&!shots[id]&&['goal','dice','stress'].includes(id)){shots[id]=1;await sleep(500);await shot(id==='goal'?'start':id)}
    if(mode==='rotate'&&rotated===0&&s.id==='order'){rotated=1;await p.setViewportSize({width:H,height:W});await p.evaluate(()=>{dispatchEvent(new Event('resize'));dispatchEvent(new Event('orientationchange'))});await sleep(1500);
      const r=await state();if(!r.shown||!r.hole)note(tag,'after rotating to landscape the step is not on screen ('+JSON.stringify({sh:r.shown,ph:r.phase,i:r.i})+')');else await p.screenshot({path:'/tmp/claude-0/tutor_rot_land.png'});continue}
    if(mode==='rotate'&&rotated===1&&s.id==='res1'){rotated=2;await p.setViewportSize({width:W,height:H});await p.evaluate(()=>{dispatchEvent(new Event('resize'));dispatchEvent(new Event('orientationchange'))});await sleep(1500);
      const r=await state();if(!r.shown||!r.hole)note(tag,'after rotating back the step is not on screen');continue}
    // a wrong tap: outside the spotlight (or on the highlighted thing of a Next step) must not advance and must shake the bubble
    const need=s.wait?'out':'in';
    const wp=await p.evaluate(([need])=>{const s=GXT.state(),V={w:innerWidth,h:innerHeight};const H=s.holes;
      const inside=(x,y)=>H.some(r=>x>=r.left-2&&x<=r.left+r.width+2&&y>=r.top-2&&y<=r.top+r.height+2);
      if(need==='in')return {x:s.hole.cx,y:s.hole.cy};
      const b=s.bubble;const inB=(x,y)=>b&&x>=b.left-10&&x<=b.right+10&&y>=b.top-10&&y<=b.bottom+10;
      for(const [fx,fy] of [[.5,.5],[.15,.45],[.85,.45],[.5,.3],[.2,.7],[.8,.7],[.5,.62],[.1,.2],[.9,.2],[.5,.9]]){const x=V.w*fx,y=V.h*fy;if(y>40&&!inside(x,y)&&!inB(x,y))return {x,y}}return null},need);
    if(wp&&(guardOnce(s.id))){const before=await state();const gs0=await p.evaluate(()=>JSON.stringify([G.round,G.phase,G.cur,G.ships.map(s=>[s.x,s.y,s.sh,s.dmg.length,s.dial,s.focus]),UI.hold&&UI.hold.kind]));
      await p.touchscreen.tap(wp.x,wp.y);await sleep(50);const after=await state();totals.wrong++;
      const gs1=await p.evaluate(()=>JSON.stringify([G.round,G.phase,G.cur,G.ships.map(s=>[s.x,s.y,s.sh,s.dmg.length,s.dial,s.focus]),UI.hold&&UI.hold.kind]));
      if(after.i!==before.i||after.count!==before.count)note(tag,id+': a wrong tap advanced the tutorial');
      if(gs0!==gs1)note(tag,id+': a wrong tap changed the game');
      if(after.wrongs<=before.wrongs)note(tag,id+': a wrong tap did not shake the bubble');
      const hint=await p.evaluate(()=>{const b=document.querySelector('.gxt-bub');return b&&b.classList.contains('gxt-shake')&&b.querySelector('.gxh-tx').textContent});
      if(!hint||!/Tap/.test(hint))note(tag,id+': wrong tap gave no "Tap ..." hint ('+hint+')')}
    // "Skip tutorial": once, at step 3: everything goes away, the menu is back, the tutorial is not marked done
    if(mode==='skip'&&s.i>=3){const sk=info.skip;await p.touchscreen.tap((sk.left+sk.right)/2,(sk.top+sk.bottom)/2);await sleep(600);
      const o=await p.evaluate(()=>({run:GXT.running(),dom:document.querySelectorAll('.gxt-cell,.gxt-bub,.gxt-top,.gxt-end').length,start:UI.info&&!!document.querySelector('#modal .dlg.start'),
        btn:(document.querySelector('#modal .dlg.start [data-gxt-open] b')||{}).textContent,st:JSON.parse(localStorage.getItem('gxt-nebula-aces')||'{}'),saved:!!localStorage.getItem(SAVE),tut:TUT.on}));
      if(o.run||o.dom)note(tag,'Skip left tutorial elements on screen ('+o.dom+')');if(!o.start)note(tag,'Skip did not return to the menu');
      if(/✓/.test(o.btn||''))note(tag,'a skipped tutorial shows Tutorial ✓');if(o.st.done)note(tag,'a skipped tutorial was marked done');if(o.st.open)note(tag,'a skipped tutorial is still "open"');if(o.saved)note(tag,'skip saved the staged game');if(o.tut)note(tag,'TUT.on still set after Skip');
      const n=await p.evaluate(()=>{startGame('solo');return !!G&&!G.tut&&BF.on});if(!n)note(tag,'no normal game after Skip');
      await sleep(900);const q=await p.evaluate(()=>!!document.querySelector('.gxt-cell,.gxt-bub'));if(q)note(tag,'tutorial elements in a normal game after Skip');
      totals.runs++;console.log(tag,'done');await ctx.close();return}
    // "leave and come back": once, at step 6, reload the page; the menu must offer restart or exit
    if(mode==='leave'&&!left&&s.i>=6){left=true;await p.reload();await p.waitForSelector('[data-start]');await sleep(1200);
      const o=await p.evaluate(()=>({t:(document.querySelector('#modal .dlg.start [data-gxt-open]')||{}).textContent,active:GXT.active()}));
      if(o.active)note(tag,'tutorial still running after a reload');
      const bb=await ctr(p,'#modal .dlg.start [data-gxt-open]');
      await p.touchscreen.tap(bb[0],bb[1]);await sleep(300);
      const d=await p.evaluate(()=>({dlg:!!document.querySelector('.gxt-end [data-gxt-dlg=restart]'),exit:!!document.querySelector('.gxt-end [data-gxt-dlg=exit]')}));
      if(!d.dlg||!d.exit)note(tag,'reopening a half-done tutorial offered no restart/exit ('+JSON.stringify(d)+')');
      else{const rb=await ctr(p,'[data-gxt-dlg=restart]');await p.touchscreen.tap(rb[0],rb[1]);await sleep(900);await p.evaluate(()=>{AIDELAY=150});
        const r2=await state();if(!r2.active||r2.i!==0)note(tag,'restart did not start at step 0 ('+JSON.stringify({a:r2.active,i:r2.i})+')');lastSig='';lastT=Date.now();seenIds=[]}
      continue}
    // ---- do exactly what the step asks
    if(!s.wait){const nx=info.next;await p.touchscreen.tap((nx.left+nx.right)/2,(nx.top+nx.bottom)/2)}
    else{
      const before=await state();
      await p.touchscreen.tap(h.cx,h.cy);
      const t1=Date.now();let moved=false;
      while(Date.now()-t1<2500){await sleep(60);const a=await state();if(a.i!==before.i||a.count!==before.count||a.phase!=='show'){moved=true;break}}
      if(!moved){note(tag,id+': tapping the target did not advance '+JSON.stringify({hole:h,under:info.under,g:info.gstate}));await p.screenshot({path:'/tmp/claude-0/tutor_dead_'+W+'_'+mode+'.png'}).catch(()=>{});break}
    }
    await sleep(40);
  }
  // ---- the end
  const fin=await state();
  if(!fin.active||fin.phase!=='end')note(tag,'the tutorial did not reach the end card ('+JSON.stringify({a:fin.active,ph:fin.phase,i:fin.i,id:fin.id})+') seen '+seenIds.join(','));
  else if(seenIds.length<22)note(tag,'only '+seenIds.length+' steps seen');
  if(fin.active&&fin.phase==='end'&&mode==='story'){
    await sleep(300);
    const e=await p.evaluate(()=>{const c=document.querySelector('.gxt-end');return c&&[...c.querySelectorAll('[data-gxt-end]')].map(b=>({t:b.textContent,k:b.dataset.gxtEnd,r:(()=>{const q=b.getBoundingClientRect();return [q.left,q.top,q.right,q.bottom]})()}))});
    if(!e||e.length!==1||e[0].k!=='chapter'||!/Start chapter 1/.test(e[0].t))note(tag,'story prologue end card buttons: '+JSON.stringify(e));
    else{await p.touchscreen.tap((e[0].r[0]+e[0].r[2])/2,(e[0].r[1]+e[0].r[3])/2);await sleep(1200);
      const sc=await p.evaluate(()=>({scene:!!document.querySelector('.gxc:not([hidden])'),camp:!!UI.camp}));
      if(!sc.scene&&!sc.camp)note(tag,'chapter 1 did not start after the tutorial');
      else{for(let k=0;k<10;k++){const q=await p.evaluate(()=>({camp:!!UI.camp&&!!G&&!UI.info&&!G.tut&&document.querySelectorAll('.gxc:not([hidden])').length===0}));if(q.camp)break;
          const t=await ctr(p,'.gxc-btn.ghost, .gxc .gxc-btn.go, .gxc-btn');if(t)await p.touchscreen.tap(t[0],t[1]);await sleep(600)}
        const ok=await p.evaluate(()=>!!UI.camp&&!!G&&!G.winner&&!G.tut&&!TUT.on);
        if(!ok)note(tag,'chapter 1 did not start after its intro')}}
    const st2=await p.evaluate(()=>JSON.parse(localStorage.getItem('gxt-nebula-aces')||'{}'));if(!st2.done)note(tag,'prologue not remembered as done');
    // second time: Story goes straight to the chapter map; the chapter list has a Tutorial button
    await p.evaluate(()=>{try{GXC.close()}catch(e){}UI.info=true;UI.camp=null;render()});await sleep(300);
    const sb=await ctr(p,'[data-a=story]');await p.touchscreen.tap(sb[0],sb[1]);await sleep(700);
    const m=await p.evaluate(()=>({run:GXT.running(),gxc:!!document.querySelector('.gxc:not([hidden])'),rep:[...document.querySelectorAll('.gxc button')].some(b=>/Tutorial/.test(b.textContent))}));
    if(m.run)note(tag,'a finished player was sent through the tutorial again');if(!m.gxc)note(tag,'Story did not open the chapter map after the tutorial');if(!m.rep)note(tag,'no "Tutorial" (replay) button in the chapter list');
  }
  else if(fin.active&&fin.phase==='end'){
    await sleep(300);
    const e=await p.evaluate(()=>{const c=document.querySelector('.gxt-end');if(!c)return null;const r=c.querySelector('.gxt-endc').getBoundingClientRect();return {t:c.querySelector('.gxt-et').textContent,btns:[...c.querySelectorAll('[data-gxt-end]')].map(b=>({t:b.textContent,k:b.dataset.gxtEnd,r:(()=>{const q=b.getBoundingClientRect();return [q.left,q.top,q.right,q.bottom,q.width,q.height]})()})),inside:r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight}});
    if(!e)note(tag,'no end card');else{
      if(!/know the rules/i.test(e.t))note(tag,'end card title: '+e.t);
      const ks=e.btns.map(b=>b.k).join();if(ks!=='play,story')note(tag,'end card buttons: '+ks);
      if(!e.inside)note(tag,'end card outside the screen');
      for(const b of e.btns)if(b.r[5]<40)note(tag,'end button too small: '+b.t);
      await shot('end');
      const play=e.btns.find(b=>b.k==='play');await p.touchscreen.tap((play.r[0]+play.r[2])/2,(play.r[1]+play.r[3])/2);await sleep(1200);
      const after=await p.evaluate(()=>({run:GXT.running(),dom:document.querySelectorAll('.gxt-cell,.gxt-bub,.gxt-end,.gxt-top').length,real:!!G&&!G.tut&&!TUT.on&&BF.on&&G.round>=0&&!UI.info,
        st:JSON.parse(localStorage.getItem('gxt-nebula-aces')||'{}'),saved:!!localStorage.getItem(SAVE),seed:G&&G.seed}));
      if(after.run||after.dom)note(tag,'tutorial elements left on screen after the end card ('+after.dom+')');
      if(!after.real)note(tag,'"Play a real game" did not start a normal game');
      if(!after.st.done)note(tag,'tutorial not remembered as done');
      if(after.saved)note(tag,'the staged tutorial game was saved as a normal game');
      // the title screen and the in-game menu show Tutorial ✓, a normal game plays a move
      await p.evaluate(()=>{UI.info=true;render()});await sleep(300);
      const tt=await p.evaluate(()=>[...document.querySelectorAll('#modal .dlg.start [data-gxt-open] b')].map(b=>b.textContent));
      if(!tt.some(x=>/Tutorial ✓/.test(x)))note(tag,'title menu does not show Tutorial ✓: '+tt.join('|'));
      if(/New here/.test(tt.join('')))note(tag,'"New here" still shown after the tutorial');
      await p.evaluate(()=>{startGame('solo')});await sleep(1500);
      const hb=await p.evaluate(()=>({bub:!!document.querySelector('.gxt-bub,.gxt-cell'),pl:G.phase,bf:BF.on,key:BF.key}));if(hb.bub)note(tag,'tutorial elements in a normal game');
      const mm=await p.evaluate(()=>{toggleMenu(true);const b=document.querySelector('#more [data-gxt-open] b');return b&&b.textContent});if(!/Tutorial ✓/.test(mm||''))note(tag,'in-game menu does not show Tutorial ✓: '+mm);
    }
  }
  totals.runs++;totals.ids=seenIds.length>totals.ids.length?seenIds:totals.ids;
  console.log(tag,'done in',Math.round((Date.now()-t0)/1000)+'s, steps seen',seenIds.length);
  await ctx.close()}
const once=new Set();const guardOnce=id=>{const k=id+'|'+(guardOnce.run||'');if(once.has(k))return false;once.add(k);return true};

(async()=>{const b=await PW.chromium.launch({args:ARGS});
  const jobs=[];for(const [W,H] of SIZES){jobs.push([W,H,'clean']);}
  const [W0,H0]=SIZES[0];jobs.push([W0,H0,'rotate']);jobs.push([W0,H0,'leave']);jobs.push([W0,H0,'skip']);jobs.push([W0,H0,'story']);jobs.push([375,553,'story']);jobs.push([W0,H0,'offer']);
  const only=process.env.ONLY;
  for(const j of jobs){if(only&&!only.split(',').includes(j[2]))continue;guardOnce.run=j.join('x');try{await run(b,...j)}catch(e){note(j.join(' '),'CRASH '+String(e.message).split('\n')[0])}}
  await b.close();
  console.log('steps checked',totals.steps,'wrong taps',totals.wrong,'step ids',totals.ids.join(','));
  console.log(probs.length?'PROBLEMS '+probs.length+'\n  '+probs.join('\n  '):'PROBLEMS 0');process.exit(probs.length?1:0)})();
