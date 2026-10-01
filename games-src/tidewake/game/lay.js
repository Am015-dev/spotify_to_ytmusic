// Board-first layout check with real WebGL (SwiftShader) at 4 sizes: no page scroll, the WHOLE board (36 squares, edge numbers, all 48 start marks, ships on them)
// inside the board area and uncovered, every popup opens and closes (x and Esc), the dock shows the decision, no console errors. Screenshots in shots/.
// PW=$(npm root -g)/playwright node lay.js [WxH,...] [--2d]
const PW=require((process.env.PW||require('child_process').execSync('npm root -g').toString().trim()+'/playwright'));
const fs=require('fs'),path=require('path');const HERE=__dirname,OUT=path.join(HERE,'shots');fs.mkdirSync(OUT,{recursive:true});fs.mkdirSync(path.join(HERE,'out'),{recursive:true});
const html=fs.readFileSync(path.join(HERE,'tidewake.html'));
const SIZES=(process.argv[2]||'1366x768,1920x1080,768x1024,390x844').split(',').map(s=>s.split('x').map(Number));const TWO=process.argv.includes('--2d');
const DRAWERS=['crewd','logd','rulesd','piecesd','setd','credd'];
(async()=>{const b=await PW.chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});let bad=0;const report=[];
for(const [W,H] of SIZES){const t=W+'x'+H+(TWO?'_2d':'');const ctx=await b.newContext({viewport:{width:W,height:H},deviceScaleFactor:1});
  await ctx.route('**/*',r=>{const u=new URL(r.request().url());return u.host==='gns.test'?r.fulfill({status:200,contentType:'text/html',body:html}):r.abort()});
  const p=await ctx.newPage();p.setDefaultTimeout(150000);const errs=[];p.on('pageerror',e=>errs.push('pageerror '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/net::|Failed to load resource/.test(m.text()))errs.push(m.text())});
  const log=(...a)=>console.log(t,...a);const T0=Date.now();
  await p.goto('https://gns.test/'+(TWO?'?2d':''));await p.waitForTimeout(1200);await p.evaluate(()=>{try{localStorage.clear()}catch(e){}setSeed(5);setAiSeed(5);AIDELAY=60});
  const scroll=async tag=>{const r=await p.evaluate(()=>({h:document.documentElement.scrollHeight,w:document.documentElement.scrollWidth,vh:innerHeight,vw:innerWidth}));const ok=r.h<=r.vh+1&&r.w<=r.vw+1;if(!ok){bad++;log(tag,'SCROLL',JSON.stringify(r))}return ok};
  // every square centre, the frame corners, edge-number medallions, all 48 start marks and a ship-height point above each must project inside the board rect and hit the canvas
  const whole=async tag=>{const r=await p.evaluate(()=>{const host=document.querySelector('#c3:not([hidden])')||document.querySelector('#fb');const R=document.querySelector('.gx-board').getBoundingClientRect();const pts=[];
      const is3=host.id==='c3';const K=TWKit._K;let proj;
      if(is3){TWKit.renderOnce();K.cam.updateMatrixWorld();const v=new THREE.Vector3();proj=(x,y,z)=>{v.set(x,y,z).project(K.cam);const hr=host.getBoundingClientRect();return [hr.left+(v.x+1)/2*hr.width,hr.top+(1-v.y)/2*hr.height]}}
      else{const svg=host.querySelector('svg');const sr=svg.getBoundingClientRect(),vb=svg.viewBox.baseVal;const sc=Math.min(sr.width/vb.width,sr.height/vb.height);const ox=sr.left+(sr.width-vb.width*sc)/2-vb.x*sc,oy=sr.top+(sr.height-vb.height*sc)/2-vb.y*sc;proj=(x,y,z)=>[ox+x*sc,oy+z*sc]}
      const HALF=TWKit.BOARD.half;for(let c=0;c<6;c++)for(let r=0;r<6;r++)pts.push(['sq'+c+r,...proj(c-2.5,0,r-2.5)]);
      for(const sx of[-1,1])for(const sz of[-1,1]){pts.push(['corner',...proj(sx*HALF,0,sz*HALF)]);pts.push(['cornerUp',...proj(sx*HALF,.9,sz*HALF)])}
      for(let i=0;i<6;i++){const u=i-2.5;for(const s of[-1,1]){pts.push(['numTB'+i,...proj(u,0,s*3.7)]);pts.push(['numLR'+i,...proj(s*3.7,0,u)])}}
      let nm=0;for(let c=0;c<6;c++)for(let r=0;r<6;r++){if(c&&c<5&&r&&r<5)continue;for(let q=0;q<8;q++){const e=TWKit.portEdge(c,r,q);if(!e)continue;const w=TWKit.portWorld(c,r,q);pts.push(['mark',...proj(w[0],0,w[1])]);pts.push(['shipTop',...proj(w[0]+(q<2?0:q<4?.25:q<6?0:-.25)*0,1.0,w[1])]);nm++}}
      let out=0,cov=0,whatc={};const outs=[];for(const [n,x,y] of pts){if(!(x>=R.left-.5&&x<=R.right+.5&&y>=R.top-.5&&y<=R.bottom+.5)){out++;if(outs.length<5)outs.push(n+':'+Math.round(x)+','+Math.round(y))}
        else{const e=document.elementFromPoint(x,y);if(!(e===host||host.contains(e)||e&&e.closest('#chip'))){cov++;const k=e?(e.id||String(e.className)||e.tagName):'none';whatc[k]=(whatc[k]||0)+1}}}
      const hr=host.getBoundingClientRect();return {n:pts.length,out,outs,cov,whatc,marks:nm,rect:[Math.round(R.left),Math.round(R.top),Math.round(R.width),Math.round(R.height)],area:Math.round(R.width*R.height/(innerWidth*innerHeight)*100),is3,hostInside:hr.top>=-1&&hr.left>=-1&&hr.bottom<=innerHeight+1&&hr.right<=innerWidth+1}});
    if(r.out||r.cov||!r.hostInside){bad++;log(tag,'BOARD NOT WHOLE/UNCOVERED',JSON.stringify(r))}return r};
  const dockOn=async tag=>{const r=await p.evaluate(()=>{const d=document.querySelector('.gx-dock');const R=d.getBoundingClientRect();const m=document.querySelector('#main');const M=m.getBoundingClientRect();return {vis:getComputedStyle(d).visibility,in:R.top<innerHeight-30&&R.bottom>30&&R.left<innerWidth-30&&R.width>100,mainh:M.height>10,txt:m.textContent.length>3}});if(r.vis!=='visible'||!r.in||!r.txt){bad++;log(tag,'DOCK HIDDEN/EMPTY',JSON.stringify(r))}};
  const shot=async n=>{await p.screenshot({path:path.join(OUT,`L_${t}_${n}.png`)})};
  const waitHuman=async()=>{for(let k=0;k<80;k++){const s=await p.evaluate(()=>{const d=sideToAct();return !!G.over||(d>=0&&G.seats[d].human&&!UI.busy&&!document.querySelector('#dockbody [data-a=take]'))});if(s)break;await p.waitForTimeout(300)}await p.waitForTimeout(300)};
  // 1. start screen
  await scroll('start');await shot('0start');
  // 2. guided game: start mark, then a turn
  await p.click('[data-a=guided]');await p.waitForTimeout(1500);await waitHuman();await scroll('setup');const c1=await whole('setup');await dockOn('setup');await shot('1setup');
  await p.click('#dockbody [data-a=startmark]:not([disabled])');await p.waitForTimeout(800);await waitHuman();await scroll('turn');const c2=await whole('turn');await dockOn('turn');await shot('2turn');
  const rb=await p.$('#dockbody [data-a=rot]');if(rb){await rb.click();await p.waitForTimeout(300);await shot('3rotated')}
  // 3. play turns through the real buttons (rotate until the Place button is enabled)
  let turns=0;for(let k=0;k<60&&turns<4;k++){await waitHuman();const st=await p.evaluate(()=>({over:!!G.over,q:!!G.q,sm:G.phase==='setup'}));if(st.over)break;
    if(st.q){const q=await p.$('#dockbody [data-a=q]');if(q)await q.click()}
    else{let pb=await p.$('#dockbody [data-a=place]:not([disabled])');for(let i=0;i<4&&!pb;i++){const r2=await p.$('#dockbody [data-a=rot][data-d="1"]');if(r2)await r2.click();await p.waitForTimeout(150);pb=await p.$('#dockbody [data-a=place]:not([disabled])')}
      if(pb){if(!shot.g){shot.g=1;await shot('4ghost');await whole('ghost')}await dockOn('decision '+k);await pb.click();turns++;await p.waitForTimeout(500);if(turns===2)await shot('5anim')}else{const pa=await p.$('#dockbody [data-a=pass],#dockbody [data-a=cannon],#dockbody [data-a=gate]');if(pa)await pa.click()}}
    await p.waitForTimeout(400)}
  await waitHuman();await scroll('later');await whole('later');await shot('6later');
  // 3b. reload: the saved game is offered and resumes
  await p.reload();await p.waitForTimeout(1200);const hasCont=await p.$('[data-a=cont]');if(!hasCont){bad++;log('NO CONTINUE button after reload')}else{await hasCont.click();await p.waitForTimeout(1200);const ok=await p.evaluate(()=>!!G&&UI.started&&!document.querySelector('#start').offsetParent);if(!ok){bad++;log('CONTINUE did not resume')}await whole('resumed');await shot('6resumed')}
  // 4. every popup opens and closes (x and Esc)
  for(const id of DRAWERS){const btn=await p.$(`.gx-bar .gx-ibtn[data-gx="${id}"]`);if(btn)await btn.click();else await p.evaluate(i=>GX.show(i),id);await p.waitForTimeout(700);
    const on=await p.evaluate(i=>document.getElementById(i).classList.contains('on'),id);await scroll('popup '+id);if(['rulesd','piecesd','crewd','setd'].includes(id))await shot('7pop_'+id);
    if(id==='logd'||id==='rulesd')await p.keyboard.press('Escape');else if(id==='piecesd'){await (W<1000?p.mouse.click(Math.round(W/2),8):p.mouse.click(5,Math.round(H/2)))}else await p.click(`#${id} .gx-x`);await p.waitForTimeout(380);
    const off=await p.evaluate(i=>!document.getElementById(i).classList.contains('on'),id);if(!on||!off){bad++;log('popup',id,'open',on,'closed',off)}}
  // 5. dock collapsed and back
  await p.evaluate(()=>GX.toggleDock(false));await p.waitForTimeout(500);await whole('dock min');await shot('8dockmin');await p.evaluate(()=>GX.toggleDock(true));await p.waitForTimeout(300);
  // 6. hot-seat pass screen
  await p.evaluate(()=>{showStart()});await p.waitForTimeout(300);await p.click('[data-a=mode][data-v=hot]');await p.click('[data-a=np][data-v="3"]');await p.click('#startbtn');await p.waitForTimeout(1200);
  await scroll('pass');await whole('pass');await dockOn('pass');await shot('9pass');await p.click('#dockbody [data-a=take]');await p.waitForTimeout(500);await shot('9pass_taken');
  // 7. a busy 8-captain game with every expansion: ships on every edge, leviathans, gate, wave, maelstrom
  await p.evaluate(()=>{showStart()});await p.waitForTimeout(300);await p.click('[data-a=mode][data-v=watch]');await p.click('[data-a=np][data-v="8"]');
  for(const k of['rift','wave','maelstrom','cannon']){await p.evaluate(k=>{const c=document.querySelector(`[data-a=exp][data-k=${k}]`);if(!c.checked){c.checked=true;c.dispatchEvent(new Event('change',{bubbles:true}))}},k)}
  await p.evaluate(()=>{setSeed(11);AIDELAY=0;ANIM=0});await p.click('#startbtn');await p.waitForTimeout(1500);await p.evaluate(()=>{let n=0;while(!G.over&&n++<60&&G.turn<8){const st=aiStep();if(!st)break;act(st.m,st.seat)}});await p.waitForTimeout(1500);
  await scroll('busy');const c3=await whole('busy 8p');await shot('10busy8');
  // 8. game over card
  await p.evaluate(()=>{ANIM=0;let n=0;while(!G.over&&n++<3000){const st=aiStep();if(!st)break;performMove(st.m,st.seat)}refresh();overCheck&&overCheck()});await p.waitForTimeout(1500);await scroll('over');await whole('over');await shot('11over');
  const r={size:t,board:c2.area+'%',boardRect:c2.rect.join('x'),pts:c2.n,errors:errs.slice(0,4),secs:Math.round((Date.now()-T0)/1000),mode:c2.is3?'3d':'2d'};report.push(r);
  log('mode',r.mode,'board area',c2.area+'% of screen, rect',c2.rect.join(','),'points checked',c2.n,'errors',JSON.stringify(errs.slice(0,4)),'secs',r.secs);if(errs.length)bad+=errs.length;await ctx.close()}
fs.writeFileSync(path.join(HERE,'out','lay'+(TWO?'2d':'')+'.json'),JSON.stringify(report,null,1));console.log('PROBLEMS',bad);await b.close()})().catch(e=>{console.error('FATAL',e);process.exit(1)});
