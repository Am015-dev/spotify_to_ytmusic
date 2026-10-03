// Phone layout check for Shipwreck Isle (real WebGL via SwiftShader, isMobile+hasTouch). node lay-phone.js [WxH,...] [--safe=t,r,b,l]
const PW=require(process.env.PW||'/opt/node22/lib/node_modules/playwright');const fs=require('fs'),path=require('path');
const HERE=__dirname;fs.mkdirSync(path.join(HERE,'shots','ph'),{recursive:true});const html=fs.readFileSync(path.join(HERE,'shipwreck.html'));
const SIZES=(process.argv[2]&&!process.argv[2].startsWith('--')?process.argv[2]:'390x844,844x390,360x740,740x360').split(',').map(s=>s.split('x').map(Number));
const SAFE=(process.argv.find(a=>a.startsWith('--safe='))||'').slice(7);
(async()=>{const b=await PW.chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});let bad=0;
for(const [W,H] of SIZES){const t=W+'x'+H;const ctx=await b.newContext({viewport:{width:W,height:H},deviceScaleFactor:1,isMobile:true,hasTouch:true});
 await ctx.route('**/*',r=>{const u=new URL(r.request().url());return u.host==='swi.test'?r.fulfill({status:200,contentType:'text/html',body:html}):r.abort()});
 const p=await ctx.newPage();p.setDefaultTimeout(60000);const errs=[];p.on('pageerror',e=>errs.push('pageerror '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/net::|Failed to load resource/.test(m.text()))errs.push(m.text())});
 const log=(...a)=>console.log(t,...a);const prob=(...a)=>{bad++;log('PROBLEM',...a)};
 await p.goto('https://swi.test/?phone=1'+(SAFE?'&safe='+SAFE:''));await p.waitForTimeout(1200);await p.evaluate(()=>{try{localStorage.clear()}catch(e){}setSeed(5);AIDELAY=60;ANIM=0});
 const FIT=require('../phfit.js');const shot=async n=>{(await FIT.run(p)).forEach(m=>prob('FIT '+n,m));return p.screenshot({path:path.join(HERE,'shots','ph',`P_${t}_${n}.png`)})};
 const scroll=async tag=>{const r=await p.evaluate(()=>({h:document.documentElement.scrollHeight,w:document.documentElement.scrollWidth,vh:innerHeight,vw:innerWidth}));if(r.h>r.vh+1||r.w>r.vw+1)prob(tag,'SCROLL',JSON.stringify(r))};
 // all visible interactive things must be >= 44 px and inside the screen
 const targets=async tag=>{const r=await p.evaluate(()=>{const o=[];const vis=e=>{const r=e.getBoundingClientRect();if(r.width<1||r.height<1)return null;for(let n=e;n&&n!==document.body;n=n.parentElement){const cs=getComputedStyle(n);if(cs.display==='none'||cs.visibility==='hidden'||n.hidden)return null}
      if(r.right<=0||r.bottom<=0||r.left>=innerWidth||r.top>=innerHeight)return null;return r};
    for(const e of document.querySelectorAll('button,[data-a],[data-pawn],a[href],summary,input,.chk,[data-tile]')){if(e.closest('#labels')||e.closest('#perfhud,.perf'))continue;if(e.tagName==='INPUT'&&e.closest('.chk'))continue;const r=vis(e);if(!r)continue;
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
 await p.tap('[data-a=start]');await p.waitForTimeout(1500);
 const bd=await board();const isl=await island();const SA=(SAFE||'0,0,0,0').split(',').map(Number);const sh=Math.min(W-SA[1]-SA[3],H-SA[0]-SA[2]);
 if(bd.w<.85*sh||bd.h<.85*sh)prob('board too small',JSON.stringify(bd));
 if(isl.x0<bd.l-1||isl.x1>bd.l+bd.w+1||isl.y0<bd.t-1||isl.y1>bd.t+bd.h+1)prob('island clipped',JSON.stringify(isl));
 if(Math.max(isl.w,isl.h)<.85*sh||Math.min(isl.w/bd.w,isl.h/bd.h)<.0)prob('island small',JSON.stringify(isl));
 log('board',Math.round(bd.w)+'x'+Math.round(bd.h),'island',Math.round(isl.w)+'x'+Math.round(isl.h),'ratio(long/short side)',(Math.max(isl.w,isl.h)/sh).toFixed(2),'(board/short)',(Math.min(bd.w,bd.h)/sh).toFixed(2));
 await hit('story');await scroll('story');await shot('1story');await T('story card');await vis('#story [data-a=next]','story');await noOverlap('story');
 // hot labels are hidden
 const lab=await p.evaluate(()=>[...document.querySelectorAll('#labels .tl')].filter(e=>{const r=e.getBoundingClientRect();return r.width>26&&getComputedStyle(e).visibility!=='hidden'&&!e.hidden}).length);if(lab)prob('floating labels visible',lab);
 // drawers
 for(const id of ['campd','logd','cardsd','rulesd']){if(id==='campd'&&W<H){await p.tap('#phchip');await p.waitForTimeout(250);await p.tap('#ppop [data-gx=campd]')}else await p.tap(`.gx-bar [data-gx="${id}"]`);await p.waitForTimeout(450);await scroll('drawer '+id);if(id==='cardsd'){await shot('cards');await T('cards drawer');await p.tap('#cardsbody .cgrid .card');await p.waitForTimeout(300);const z=await p.evaluate(()=>!document.querySelector('#pzoom').hidden&&document.querySelector('#pzoom .zc').getBoundingClientRect().width);if(!z)prob('card tap did not enlarge');else{await shot('cardzoom');await T('card zoom');await p.tap('#pzoom .zc-x');await p.waitForTimeout(200)}}if(id==='campd'){await shot('camp');await T('camp drawer')}
   const on=await p.evaluate(i=>document.getElementById(i).classList.contains('on'),id);if(!on)prob('drawer did not open',id);await p.tap(`#${id} .gx-x`);await p.waitForTimeout(350)}
 // more menu
 await p.tap('.gx-bar .menub');await p.waitForTimeout(250);await T('menu');await shot('menu');await scroll('menu');await p.tap('.gx-bar .menub');await p.waitForTimeout(200);
 // zoom / pan / camp
 const d0=await p.evaluate(()=>V3.orbit.d);await p.tap('#phview [data-ph=in]');await p.waitForTimeout(900);const d1=await p.evaluate(()=>V3.orbit.d);if(!(d1<d0-.5))prob('zoom in did not work',d0,d1);
 await p.tap('#phview [data-ph=camp]');let cm;for(let k=0;k<10;k++){await p.waitForTimeout(700);cm=await p.evaluate(()=>V3.look.distanceTo(new THREE.Vector3(hexPos(MAP[G.camp.pos].q,0,0).x,0,0))&&0);if(await p.evaluate(()=>V3.look.distanceTo(new THREE.Vector3(hexPos(MAP[G.camp.pos].q,MAP[G.camp.pos].r).x,0,hexPos(MAP[G.camp.pos].q,MAP[G.camp.pos].r).z))<.5))break}cm=await p.evaluate(()=>({m:V3.phMode,d:V3.orbit.d,dist:V3.look.distanceTo(new THREE.Vector3(hexPos(MAP[G.camp.pos].q,MAP[G.camp.pos].r).x,0,hexPos(MAP[G.camp.pos].q,MAP[G.camp.pos].r).z))}));if(cm.m!=='camp'||cm.dist>.6)prob('camp centre',JSON.stringify(cm));await shot('campview');
 // drag pan (mouse drag drives the same pointer events)
 const bb=await board();const l0=await p.evaluate(()=>V3.look.clone());await p.mouse.move(bb.l+bb.w/2,bb.t+bb.h/2);await p.mouse.down();await p.mouse.move(bb.l+bb.w/2+60,bb.t+bb.h/2+30,{steps:6});await p.mouse.up();await p.waitForTimeout(300);const l1=await p.evaluate(()=>V3.look.clone());if(Math.hypot(l1.x-l0.x,l1.z-l0.z)<.3)prob('pan did not move');
 let fm='';for(let k=0;k<3&&fm!=='fit';k++){await p.tap('#phview [data-ph=camp]');await p.waitForTimeout(500);fm=await p.evaluate(()=>V3.phMode)}if(fm!=='fit')prob('fit view',fm);
 let i2;for(let k=0;k<12;k++){await p.waitForTimeout(700);i2=await island();if(Math.abs(i2.w-isl.w)<=6)break}if(Math.abs(i2.w-isl.w)>6)prob('fit view did not restore island size',isl.w,i2.w);
 // tile info pop-up during the story
 const pt=await tilePt(6);await p.touchscreen.tap(pt[0],pt[1]);await p.waitForTimeout(400);const tp=await p.evaluate(()=>!!document.querySelector('#ppop:not([hidden]) .ti'));if(!tp)prob('tile tap did not open the info pop-up');else{await shot('tileinfo');await T('tile info');await noOverlap('tile info')}
 await p.tap('#ppop .pp-x');await p.waitForTimeout(250);
 // status chip pop-up
 await p.tap('#phchip');await p.waitForTimeout(300);await shot('status');await T('status pop-up');await noOverlap('status');await scroll('status');await p.tap('#ppop .pp-x');await p.waitForTimeout(200);
 // through the story to the plan, by taps only
 for(let k=0;k<14;k++){if(!await p.$('#story:not([hidden]) [data-a=next]'))break;await p.tap('#story [data-a=next]');await p.waitForTimeout(150)}
 await p.waitForTimeout(900);await scroll('plan1');await shot('plan1');await T('plan step 1');await vis('#step [data-a=pnext]','plan1');await hit('plan1');
 await p.tap('#panel .thr,#panel .prio').catch(()=>{});await p.waitForTimeout(300);const zc=await p.evaluate(()=>!document.querySelector('#pzoom').hidden);if(zc){await shot('zoomcard');await T('zoom card');await p.tap('#pzoom .zc-x');await p.waitForTimeout(200)}
 await p.tap('#step [data-a=pnext]');await p.waitForTimeout(500);await scroll('plan2');await shot('plan2');await T('plan step 2 strip');await noOverlap('strip');await vis('#ps .ps-go','plan2');
 // pawn pop-up, recommended job by touch
 await p.tap('#ps .ps-go');await p.waitForTimeout(400);await shot('pawnpop');await T('pawn pop-up');await noOverlap('pawn pop');await scroll('pawn pop');
 const planned0=await p.evaluate(()=>G.plan.acts.length);await p.tap('#ppop [data-a=rec]');await p.waitForTimeout(500);const popGone=await p.evaluate(()=>document.querySelector('#ppop').hidden);if(!popGone)prob('pop-up stayed open after giving a job');
 const planned1=await p.evaluate(()=>G.plan.acts.length);if(planned1<=planned0)prob('job not placed by tap');
 // next pawn through a tile tap: explore tile
 await p.tap('#ps .pawnrow .pw:not(.set)');await p.waitForTimeout(300);await p.tap('#ppop .pp-x');await p.waitForTimeout(200);
 const pt2=await tilePt(11);await p.touchscreen.tap(pt2[0],pt2[1]);await p.waitForTimeout(500);await shot('tilepop');await T('tile job pop-up');await noOverlap('tile job pop');
 const add=await p.$('#ppop .job:not(.no) [data-place]:not([disabled])');if(add){await add.tap();await p.waitForTimeout(500)}else{prob('no job on the tile pop-up');await p.tap('#ppop .pp-x')}
 // tile pop-up closes by tapping the sea / outside, and by Esc
 const pt3=await tilePt(5);await p.touchscreen.tap(pt3[0],pt3[1]);await p.waitForTimeout(300);const o1=await p.evaluate(()=>!document.querySelector('#ppop').hidden);await p.keyboard.press('Escape');await p.waitForTimeout(300);const o2=await p.evaluate(()=>!document.querySelector('#ppop').hidden);if(!o1||o2)prob('Esc close',o1,o2);
 // finish assigning with the recommended job for each remaining pawn, only by taps
 for(let k=0;k<8;k++){const st=await p.evaluate(()=>PHO.st);if(st!=='plan2')break;await p.tap('#ps .ps-go').catch(()=>{});await p.waitForTimeout(250);if(await p.$('#ppop [data-a=rec]'))await p.tap('#ppop [data-a=rec]');else{const a=await p.$('#ppop [data-place]:not([disabled])');if(a)await a.tap();else{await p.tap('#ppop [data-a=pskip]').catch(()=>{});await p.tap('#ppop .pp-x').catch(()=>{});await p.tap('#step [data-a=suggest]').catch(()=>{})}}await p.waitForTimeout(350)}
 await p.waitForTimeout(400);const st3=await p.evaluate(()=>PHO.st+':'+pstep());log('after assigning',st3);
 if(!/^plan:3/.test(st3)){await p.tap('#step [data-a=suggest]').catch(()=>{});await p.waitForTimeout(400)}
 await scroll('plan3');await shot('plan3');await T('plan step 3');await vis('#step [data-a=pnext]','plan3');
 await p.tap('#step [data-a=pnext]');await p.waitForTimeout(400);await scroll('plan4');await shot('plan4');await T('plan step 4');
 const go=await p.$('#step [data-a=go]');if(!go)prob('no start button');else await go.tap();await p.waitForTimeout(500);
 const conf=await p.$('#step [data-a=go][data-force]');if(conf){await conf.tap();await p.waitForTimeout(500)}
 // play the day by taps: Continue / answers
 let saw={q:0,dice:0};for(let k=0;k<80;k++){const s=await p.evaluate(()=>({st:PHO.st,q:!!document.querySelector('#story:not([hidden]) [data-ans]'),over:!!G.over}));if(s.over||s.st==='plan2'||s.st==='plan')break;
   if(s.q){saw.q++;if(saw.q===1){await shot('question');await T('question card');await noOverlap('question')}await p.tap('#story [data-ans="0"]');await p.waitForTimeout(250);continue}
   if(await p.$('#story:not([hidden]) [data-a=next]')){if(k===3){await shot('daycard');await T('day card');await vis('#story [data-a=next]','day card')}await p.tap('#story [data-a=next]');await p.waitForTimeout(160)}else await p.waitForTimeout(300)}
 await p.waitForTimeout(600);log('day played, state',await p.evaluate(()=>PHO.st+' round '+G.round));await scroll('day2');
 // end card
 await p.evaluate(()=>{G.over={win:false,why:'test'};UI.overSeen=false;refresh()});for(let k=0;k<6&&!await p.$('#modal.phcard [data-a=new]');k++){if(await p.$('#story:not([hidden]) [data-a=next]'))await p.tap('#story [data-a=next]');await p.waitForTimeout(400)}await shot('over');await T('over card');await vis('#modal [data-a=new]','over');await scroll('over');
 const mo=await p.evaluate(()=>{const a=document.querySelector('.gx-board').getBoundingClientRect(),q=document.querySelector('#modal').getBoundingClientRect();return Math.max(0,Math.min(a.right,q.right)-Math.max(a.left,q.left))*Math.max(0,Math.min(a.bottom,q.bottom)-Math.max(a.top,q.top))});if(mo>0)prob('over card covers the island',mo);
 log('smallest tap target',minT,'px; console errors',errs.length,errs.slice(0,3));if(errs.length)bad+=errs.length;await ctx.close()}
console.log('PROBLEMS',bad);await b.close()})()
