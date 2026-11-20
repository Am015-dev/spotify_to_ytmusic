require('../phfit.js').guard(2);
// Phone layout check for Shipwreck Isle (real WebGL via SwiftShader, isMobile+hasTouch). node lay-phone.js [WxH,...] [--safe=t,r,b,l]
const PW=require(process.env.PW||'/opt/node22/lib/node_modules/playwright');const fs=require('fs'),path=require('path');
const HERE=__dirname;const LIVE=path.resolve(HERE,'../../games/shipwreck-isle');const CT={'.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml','.mp3':'audio/mpeg','.ogg':'audio/ogg','.glb':'model/gltf-binary','.gltf':'model/gltf+json','.json':'application/json','.js':'text/javascript','.css':'text/css','.html':'text/html','.woff2':'font/woff2'};fs.mkdirSync(path.join(HERE,'shots','ph'),{recursive:true});const html=fs.readFileSync(path.join(HERE,'shipwreck.html'));
const SIZES=(process.argv[2]&&!process.argv[2].startsWith('--')?process.argv[2]:'390x844,844x390,360x740,740x360').split(',').map(s=>s.split('x').map(Number));
const SAFE=(process.argv.find(a=>a.startsWith('--safe='))||'').slice(7);
(async()=>{const b=await PW.chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});let bad=0;
for(const [W,H] of SIZES){const t=W+'x'+H;const ctx=await b.newContext({viewport:{width:W,height:H},deviceScaleFactor:1,isMobile:true,hasTouch:true});
 await ctx.route('**/*',r=>{const u=new URL(r.request().url());if(u.host!=='swi.test')return r.abort();const f=decodeURIComponent(u.pathname);if(f==='/'||f==='/index.html')return r.fulfill({status:200,contentType:'text/html',body:html});
  const fp=path.join(LIVE,f);if(fp.startsWith(LIVE+path.sep)&&fs.existsSync(fp)&&fs.statSync(fp).isFile())return r.fulfill({status:200,contentType:CT[path.extname(fp).toLowerCase()]||'application/octet-stream',body:fs.readFileSync(fp)});return r.fulfill({status:404,contentType:'text/plain',body:''})});
 const p=await ctx.newPage();p.setDefaultTimeout(15000);{const t0=p.tap.bind(p);p.tap=(sel,o)=>{if(process.env.DBG)console.log(t,'tap',sel);return t0(sel,o)}}const errs=[];p.on('pageerror',e=>errs.push('pageerror '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/net::|Failed to load resource/.test(m.text()))errs.push(m.text())});
 const log=(...a)=>console.log(t,...a);const prob=(...a)=>{bad++;log('PROBLEM',...a)};
 await p.goto('https://swi.test/?phone=1'+(SAFE?'&safe='+SAFE:''));await p.waitForTimeout(1200);await p.evaluate(()=>{try{localStorage.clear()}catch(e){}setSeed(5);AIDELAY=60;ANIM=0});
 const FIT=require('../phfit.js');const shot=async n=>{const trayB=await p.evaluate(()=>{const e=document.querySelector('html.bf #bf');if(!e)return 0;const r=e.getBoundingClientRect();return r.height>20&&getComputedStyle(e).display!=='none'?r.bottom:0});(await FIT.run(p)).concat(await FIT.extra(p)).filter(m=>!(/^EMPTY BAND bottom/.test(m)&&trayB&&H-trayB<=12)).forEach(m=>prob('FIT '+n,m));return p.screenshot({path:path.join(HERE,'shots','ph',`P_${t}_${n}.png`),timeout:150000})};
 const scroll=async tag=>{const r=await p.evaluate(()=>({h:document.documentElement.scrollHeight,w:document.documentElement.scrollWidth,vh:innerHeight,vw:innerWidth}));if(r.h>r.vh+1||r.w>r.vw+1)prob(tag,'SCROLL',JSON.stringify(r))};
 // all visible interactive things must be >= 44 px and inside the screen
 const targets=async tag=>{await p.waitForTimeout(900);/* F15: let the chips' 0.4 s pop-in finish before measuring */const r=await p.evaluate(()=>{const o=[];const vis=e=>{const r=e.getBoundingClientRect();if(r.width<1||r.height<1)return null;for(let n=e;n&&n!==document.body;n=n.parentElement){const cs=getComputedStyle(n);if(cs.display==='none'||cs.visibility==='hidden'||n.hidden)return null}
      if(r.right<=0||r.bottom<=0||r.left>=innerWidth||r.top>=innerHeight)return null;return r};
    for(const e of document.querySelectorAll('button,[data-a],[data-pawn],a[href],summary,input,.chk,[data-tile]')){if(e.closest('#labels')||e.closest('#perfhud,.perf'))continue;if(e.tagName==='INPUT'&&e.closest('.chk'))continue;if(e.matches('i.ai'))continue;const r=vis(e);if(!r)continue;
      // clipped by a scroll container? skip those fully outside their scroller
      let clipped=false;for(let n=e.parentElement;n&&n!==document.body;n=n.parentElement){const cs=getComputedStyle(n);if(/(auto|scroll|hidden)/.test(cs.overflowY+cs.overflowX)){const q=n.getBoundingClientRect();if(r.bottom<=q.top+1||r.top>=q.bottom-1||r.right<=q.left+1||r.left>=q.right-1){clipped=true;break}}}if(clipped)continue;
      o.push({w:Math.round(r.width),h:Math.round(r.height),n:(e.dataset.a||e.dataset.gx||e.dataset.ph||e.dataset.pawn||e.dataset.place&&'place'||e.dataset.cat||e.dataset.pgo||e.className||e.tagName).toString().slice(0,24)+'|'+(e.textContent||'').trim().slice(0,14)})}return o});
   const sm=r.filter(x=>Math.min(x.w,x.h)<44);if(sm.length)prob(tag,'SMALL TARGETS',JSON.stringify(sm.slice(0,5)));return Math.min(...r.map(x=>Math.min(x.w,x.h)),999)};
 let minT=999;const T=async tag=>{minT=Math.min(minT,await targets(tag))};
 const board=()=>p.evaluate(()=>{const R=document.querySelector('.gx-board').getBoundingClientRect();return {l:R.left,t:R.top,w:R.width,h:R.height}});
 const island=()=>p.evaluate(()=>{const cv=document.querySelector('#c3');const R=cv.getBoundingClientRect();const v=new THREE.Vector3();let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;V3.cam.updateMatrixWorld();for(const t of MAP){const q=hexPos(t.q,t.r);for(let i=0;i<6;i++){const a=i/6*Math.PI*2;v.set(q.x+Math.sin(a)*HR0,HEXH,q.z+Math.cos(a)*HR0).project(V3.cam);const X=R.left+(v.x+1)/2*R.width,Y=R.top+(1-v.y)/2*R.height;x0=Math.min(x0,X);x1=Math.max(x1,X);y0=Math.min(y0,Y);y1=Math.max(y1,Y)}}
    return {w:x1-x0,h:y1-y0,x0,x1,y0,y1,short:Math.min(innerWidth,innerHeight),R:[R.left,R.top,R.right,R.bottom],mode:V3.phMode}});
 const hit=async tag=>{const r=await p.evaluate(()=>{const cv=document.querySelector('#c3');const bad=[];const v=new THREE.Vector3();const R=cv.getBoundingClientRect();V3.cam.updateMatrixWorld();for(const t of MAP){const q=hexPos(t.q,t.r);v.set(q.x,HEXH,q.z).project(V3.cam);const X=R.left+(v.x+1)/2*R.width,Y=R.top+(1-v.y)/2*R.height;if(X<R.left||X>R.right||Y<R.top||Y>R.bottom){bad.push(['out',t.id]);continue}const e=document.elementFromPoint(X,Y);if(e!==cv)bad.push([t.id,e&&(e.id||e.className||e.tagName)])}return bad});if(r.length)prob(tag,'TILES NOT HIT',JSON.stringify(r.slice(0,4)))};
 const tilePt=id=>p.evaluate(i=>{const q=hexPos(MAP[i].q,MAP[i].r);const v=new THREE.Vector3();V3.cam.updateMatrixWorld();v.set(q.x,HEXH,q.z).project(V3.cam);const R=document.querySelector('#c3').getBoundingClientRect();return [R.left+(v.x+1)/2*R.width,R.top+(1-v.y)/2*R.height]},id);
 const noOverlap=async tag=>{const r=await p.evaluate(()=>{const a=document.querySelector('.gx-board').getBoundingClientRect(),el=document.querySelector('#ppop:not([hidden])')||document.querySelector('.gx-dock');if(!el)return null;const q=el.getBoundingClientRect();const ov=Math.max(0,Math.min(a.right,q.right)-Math.max(a.left,q.left))*Math.max(0,Math.min(a.bottom,q.bottom)-Math.max(a.top,q.top));return {ov:Math.round(ov),inside:q.left>=-1&&q.right<=innerWidth+1&&q.bottom<=innerHeight+1&&q.top>=-1}});if(r&&(r.ov>0||!r.inside))prob(tag,'POP OVERLAPS BOARD/OUTSIDE',JSON.stringify(r))};
 const vis=async(sel,tag)=>{const r=await p.evaluate(s=>{const e=document.querySelector(s);if(!e)return 'missing';const q=e.getBoundingClientRect();if(!q.width)return 'zero';const x=q.left+q.width/2,y=q.top+q.height/2;if(y>innerHeight||y<0||x>innerWidth)return 'offscreen';const h=document.elementFromPoint(x,y);return e.contains(h)||h&&h.contains(e)?'ok':'covered by '+(h&&(h.id||h.className))},sel);if(r!=='ok')prob(tag,sel,r)};
 // ---- start screen
 await scroll('setup');await shot('0setup');await T('setup');await vis('[data-a=start]','setup');
 await p.tap('[data-a=start]');await p.waitForTimeout(900);
 // R67: a first visit shows the "New here?" card first; this test takes "Play anyway" (the Learn path is guide-test.js)
 if(await p.$('.tutoffer')){await scroll('new here');await shot('1offer');await T('new-here card');await vis('.tutoffer [data-tutoffer=learn]','new here');await p.tap('.tutoffer [data-tutoffer]:not([data-tutoffer=learn])');await p.waitForTimeout(600)}else prob('no "New here?" card on a first visit');
 await p.waitForTimeout(1500);
 const bd=await board();const isl=await island();const SA=(SAFE||'0,0,0,0').split(',').map(Number);const sh=Math.min(W-SA[1]-SA[3],H-SA[0]-SA[2]);
 {const need=(W<H&&H<800)?.6:.75;if(bd.w<need*sh&&bd.h<need*sh)prob('board too small (<'+need+')',JSON.stringify(bd))}
 log('board',Math.round(bd.w)+'x'+Math.round(bd.h),'island',Math.round(isl.w)+'x'+Math.round(isl.h),'(board/short)',(Math.min(bd.w,bd.h)/sh).toFixed(2));
 // the story scenes: one Continue button under the island
 await scroll('story');await shot('2story');await T('story');await vis('#bf [data-a=next]','story');
 const first=async l=>{for(const s of l){const ok=await p.evaluate(s=>{const e=document.querySelector(s);if(!e)return false;const r=e.getBoundingClientRect();if(r.width<2||r.height<2)return false;for(let n=e;n;n=n.parentElement){if(n.hidden)return false;const c=getComputedStyle(n);if(c.display==='none'||c.visibility==='hidden')return false}return true},s);if(ok)return s}return null};
 // drawers from the top bar
 for(const id of ['logd','cardsd','rulesd']){const bs=await first([`.gx-bar [data-gx="${id}"]`]);if(!bs)continue;await p.tap(bs);for(let k=0;k<20;k++){await p.waitForTimeout(200);if(await p.evaluate(i=>{const x=document.querySelector('#'+i+' .gx-x');if(!x)return true;const r=x.getBoundingClientRect();return r.bottom<=innerHeight&&r.top>=0&&!document.getElementById(i).getAnimations({subtree:true}).some(a=>a.playState==='running')},id))break}await scroll('drawer '+id);
   if(id==='cardsd'){await shot('cards');await T('cards drawer');const c=await p.$('#cardsbody .cgrid .card');if(c){await c.tap();await p.waitForTimeout(300);const z=await p.evaluate(()=>!document.querySelector('#pzoom').hidden&&document.querySelector('#pzoom .zc').getBoundingClientRect().width);if(!z)prob('card tap did not enlarge');else{await shot('cardzoom');await T('card zoom');await p.tap('#pzoom .zc-x');await p.waitForTimeout(200)}}}
   const on=await p.evaluate(i=>document.getElementById(i).classList.contains('on'),id);if(!on&&id!=='cardsd')prob('drawer did not open',id);
   if(await p.evaluate(i=>document.getElementById(i).classList.contains('on'),id)){const why=await p.evaluate(i=>{const x=document.querySelector('#'+i+' .gx-x');if(!x)return 'no close button';const r=x.getBoundingClientRect();const h=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return x.contains(h)?'':'close covered by '+(h&&(h.id||h.className||h.tagName))+' '+JSON.stringify([r.left,r.top,r.width,r.height].map(Math.round))},id);if(why){prob('drawer '+id,why);await p.screenshot({path:path.join(HERE,'shots','ph',`P_${t}_drawer-${id}.png`)})}else await p.tap(`#${id} .gx-x`);await p.waitForTimeout(350)}}
 // more menu
 {const mb=await first(['.gx-bar .menub']);if(mb){await p.tap(mb);await p.waitForTimeout(250);await T('menu');await shot('menu');await scroll('menu');await p.tap(mb);await p.waitForTimeout(250)}}
 // through the story to the plan, by taps only (a question takes its first answer)
 for(let k=0;k<60;k++){const st=await p.evaluate(()=>PHO.st);if(st==='plan2'||st==='plan')break;if(await p.$('#bf .bf-opts .opt')){await p.tap('#bf .bf-opts .opt');await p.waitForTimeout(300);continue}
   if(await p.$('#bf [data-a=next]')){await p.tap('#bf [data-a=next]').catch(()=>{});await p.waitForTimeout(250)}else await p.waitForTimeout(300)}
 await p.waitForTimeout(900);if(await p.evaluate(()=>PHO.st)!=='plan2')prob('did not reach the plan',await p.evaluate(()=>PHO.st));
 await scroll('plan');await shot('3plan');await T('plan');await vis('#bf [data-a=go]','plan');await hit('plan');
 // zoom in, then back to the whole island
 {const zi=await first(['#bfzoom [data-ph=in]','#phview [data-ph=in]']);if(!zi)log('zoom buttons hidden here (they step aside for the glowing places)');else{const d0=await p.evaluate(()=>V3.orbit.d);await p.tap(zi);await p.waitForTimeout(900);const d1=await p.evaluate(()=>V3.orbit.d);if(!(d1<d0-.3))prob('zoom in did not work',d0,d1);
   const zo=await first(['#bfzoom [data-ph=out]','#phview [data-ph=out]']);if(zo){await p.tap(zo);await p.waitForTimeout(900)}}}
 // drag pan (mouse drag drives the same pointer events)
 {const bb=await board();const l0=await p.evaluate(()=>V3.look.clone());await p.mouse.move(bb.l+bb.w/2,bb.t+bb.h/2);await p.mouse.down();await p.mouse.move(bb.l+bb.w/2+60,bb.t+bb.h/2+30,{steps:6});await p.mouse.up();await p.waitForTimeout(300);const l1=await p.evaluate(()=>V3.look.clone());if(Math.hypot(l1.x-l0.x,l1.z-l0.z)<.2)prob('pan did not move');
   const cb=await first(['#bfzoom [data-ph=camp]','#phview [data-ph=camp]']);if(cb){let fm='';for(let k=0;k<3&&fm!=='fit';k++){await p.tap(cb);await p.waitForTimeout(600);fm=await p.evaluate(()=>V3.phMode)}if(fm!=='fit')prob('fit view',fm)}}
 // status pop-up from the turn line
 await p.tap('#phlabel');await p.waitForTimeout(300);if(await p.evaluate(()=>!!(PHO.pop&&PHO.pop.k==='status'))){await shot('status');await T('status pop-up');await scroll('status');await p.tap('#ppop .pp-x');await p.waitForTimeout(250)}
 // a pawn by touch: its places glow
 const pw=await p.$('#bf .bfpw:not(.set)');if(!pw)prob('no free pawn on the tray');else{await pw.tap();await p.waitForTimeout(500)}
 const glows=await p.evaluate(()=>[...document.querySelectorAll('#bfglow .bfgl')].filter(g=>g.style.visibility!=='hidden').map(g=>{const r=g.getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2]}).filter(([x,y])=>x>0&&y>0&&x<innerWidth&&y<innerHeight));
 if(!glows.length)prob('a tapped pawn shows no glowing place');else{await shot('4glow');await T('glowing places');
   const a0=await p.evaluate(()=>G.plan.acts.reduce((n,a)=>n+a.pw.length,0));await p.touchscreen.tap(glows[0][0],glows[0][1]);await p.waitForTimeout(500);
   if(await p.$('#ppop:not([hidden]) .bfr')){await shot('5tilepop');await T('place pop-up');await scroll('place pop-up');const ok=await p.$('#ppop .bfr[data-rec="1"]:not(.no)')||await p.$('#ppop .bfr[data-place]:not(.no)');if(ok){await ok.tap();await p.waitForTimeout(500)}else{prob('no job on the place pop-up');await p.tap('#ppop .pp-x')}}
   const a1=await p.evaluate(()=>G.plan.acts.reduce((n,a)=>n+a.pw.length,0));if(a1<=a0)prob('job not placed by touch')}
 // the place pop-up closes with Esc
 {const pt=await tilePt(await p.evaluate(()=>G.camp.pos));await p.touchscreen.tap(pt[0],pt[1]);await p.waitForTimeout(400);const o1=await p.evaluate(()=>!document.querySelector('#ppop').hidden);if(o1){await p.keyboard.press('Escape');await p.waitForTimeout(300);if(await p.evaluate(()=>!document.querySelector('#ppop').hidden))prob('Esc did not close the pop-up')}}
 // ✨ plans the rest, then Start day (and Start anyway when it asks)
 for(let k=0;k<40;k++){if(await p.$('#ppop:not([hidden]) .bfr')){const ok=await p.$('#ppop .bfr[data-rec="1"]:not(.no)')||await p.$('#ppop .bfr[data-place]:not(.no)');if(ok){await ok.tap();await p.waitForTimeout(450);continue}await p.keyboard.press('Escape')}
   const fr=await p.evaluate(()=>{const f=humanFree().filter(q=>q.c!=null||BF.recTile(q));const c=curPawn();return {n:f.length,pb:planProblems().length,swap:f.length&&(!c||!f.some(q=>q.id===c.id))?f[0].id:null}});if(!fr.n&&!fr.pb)break;
   if(fr.swap&&await p.$('#bf [data-pawn="'+fr.swap+'"]')){await p.tap('#bf [data-pawn="'+fr.swap+'"]');await p.waitForTimeout(400);continue}
   await p.tap('#bf [data-a=suggest]');await p.waitForTimeout(600);const gh=await p.evaluate(()=>BF.ghostAt&&BF.ghostAt.why==='tile'?[BF.ghostAt.x,BF.ghostAt.y]:null);if(gh){await p.touchscreen.tap(gh[0],gh[1]);await p.waitForTimeout(500)}else if(!fr.n)break}
 await scroll('ready');await shot('6ready');await T('ready to start');
 for(let k=0;k<3;k++){const st=await p.evaluate(()=>PHO.st);if(st!=='plan2')break;const go=await first(['#bf [data-a=go][data-force]','#bf [data-a=go]']);if(!go){prob('no Start day button');break}await p.tap(go);await p.waitForTimeout(600)}
 if(await p.evaluate(()=>PHO.st)==='plan2')prob('Start day did not start the day',JSON.stringify(await p.evaluate(()=>({pb:planProblems(),cf:UI.confirm,msg:document.querySelector('#phlabel').textContent,tray:[...document.querySelectorAll('#bf button')].map(b=>b.dataset.a||b.className).join(' ')}))));
 // play the day by taps: Continue and answers
 let seen=0;for(let k=0;k<120;k++){const s=await p.evaluate(()=>({st:PHO.st,over:!!G.over,q:!!document.querySelector('#bf .bf-opts .opt')}));if(s.over||s.st==='plan2')break;
   if(s.q){if(!seen++){await shot('7question');await T('question')}await p.tap('#bf .bf-opts .opt');await p.waitForTimeout(300);continue}
   if(await p.$('#bf [data-a=next]')){if(k===4){await shot('7scene');await T('day scene');await scroll('day scene')}await p.tap('#bf [data-a=next]').catch(()=>{});await p.waitForTimeout(220)}else await p.waitForTimeout(300)}
 await p.waitForTimeout(600);log('day played, state',await p.evaluate(()=>PHO.st+' round '+G.round));if(await p.evaluate(()=>G.round)<2)prob('day 1 did not finish');await scroll('day2');
 // end card
 await p.evaluate(()=>{G.over={win:false,why:'test'};UI.overSeen=false;refresh()});for(let k=0;k<10&&!await p.$('#modal [data-a=new]');k++){if(await p.$('#bf [data-a=next]'))await p.tap('#bf [data-a=next]').catch(()=>{});await p.waitForTimeout(400)}
 await shot('8over');await T('over card');await vis('#modal [data-a=new]','over');await scroll('over');
 log('smallest tap target',minT,'px; console errors',errs.length,errs.slice(0,3));if(errs.length)bad+=errs.length;await ctx.close()}
console.log('PROBLEMS',bad);await b.close()})()
