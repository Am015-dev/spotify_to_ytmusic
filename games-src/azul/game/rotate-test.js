// Rotation responsiveness test. Run: (cd games-src/azul/game && python3 -m http.server 8095 &) ; NODE_PATH=/opt/node-tools/node_modules node rotate-test.js
// For each orientation step it taps every visible button / tile / row with a real touch and reports: hit (elementFromPoint at centre is the target),
// responded (click reached target), latency (tap -> next painted frame), plus long tasks, offscreen controls and horizontal scroll.
const {chromium}=require('playwright');
const URL=process.env.URL||'http://localhost:8095/sunglaze.html';
const UA='Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mozilla/5.0 Mobile/15E148 Safari/604.1)';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const SEL='button,[data-k],[data-bfrow],[data-ui],[data-bf],[data-gx],[data-ph]';
async function install(p){await p.evaluate(()=>{if(window.__rt)return;window.__rt={clicks:[],lt:0,ltMax:0};
  try{new PerformanceObserver(l=>{for(const e of l.getEntries()){__rt.lt++;__rt.ltMax=Math.max(__rt.ltMax,e.duration)}}).observe({entryTypes:['longtask']})}catch(e){}
  for(const t of ['click','pointerup','touchend'])addEventListener(t,e=>{__rt.clicks.push({t:e.type,at:performance.now(),el:e.target})},true)})}
async function targets(p){return p.evaluate(sel=>{const out=[];const seen=new Set();
  for(const e of document.querySelectorAll(sel)){const r=e.getBoundingClientRect();if(r.width<4||r.height<4)continue;const cs=getComputedStyle(e);if(cs.visibility==='hidden'||cs.display==='none')continue;
    const x=r.left+r.width/2,y=r.top+r.height/2;const off=x<0||y<0||x>innerWidth||y>innerHeight;
    const top=off?null:document.elementFromPoint(x,y);const hit=!!top&&(top===e||e.contains(top)||top.contains(e));
    const id=(e.tagName+'.'+(e.dataset.k||e.dataset.bfrow||e.dataset.ui||e.dataset.bf||e.dataset.gx||e.dataset.ph||e.className)).slice(0,40);if(seen.has(id))continue;seen.add(id);
    out.push({id,x,y,w:r.width,h:r.height,off,hit,cover:hit?'':(top?top.tagName+'.'+String(top.className).slice(0,30)+'#'+top.id:'none')})}return out},SEL)}
async function tapAll(p,label,R,opts={}){await install(p);const ts=await targets(p);
  const res={label,n:0,off:0,blocked:0,slow:0,noresp:0,max:0,lat:[],bad:[]};
  for(const t of ts){res.n++;if(t.off){res.off++;res.bad.push('OFFSCREEN '+t.id);continue}if(!t.hit){res.blocked++;res.bad.push('BLOCKED '+t.id+' by '+t.cover);continue}
    if(opts.skip&&opts.skip(t.id))continue;
    await p.evaluate(()=>{__rt.clicks=[]});const t0=await p.evaluate(()=>performance.now());
    await p.touchscreen.tap(t.x,t.y);
    const r=await p.evaluate(()=>new Promise(res=>requestAnimationFrame(()=>requestAnimationFrame(()=>res({now:performance.now(),c:__rt.clicks.map(c=>[c.t,c.at])})))));
    const ck=r.c.find(c=>c[0]==='click');const lat=ck?ck[1]-t0:null;
    if(lat==null){res.noresp++;res.bad.push('NOCLICK '+t.id)}else{res.lat.push(lat);res.max=Math.max(res.max,lat);if(lat>150){res.slow++;res.bad.push('SLOW '+t.id+' '+lat.toFixed(0))}}
    await sleep(120);await closeDialogs(p)}
  const sc=await p.evaluate(()=>({sw:document.documentElement.scrollWidth,iw:innerWidth,bw:document.body.scrollWidth,lt:__rt.lt,ltMax:Math.round(__rt.ltMax)}));
  res.hscroll=Math.max(sc.sw,sc.bw)>sc.iw+1;res.lt=sc.lt;res.ltMax=sc.ltMax;
  const avg=res.lat.length?res.lat.reduce((a,b)=>a+b,0)/res.lat.length:0;
  console.log(`${label.padEnd(30)} ctl=${res.n} off=${res.off} blocked=${res.blocked} noresp=${res.noresp} slow>150=${res.slow} avg=${avg.toFixed(0)}ms max=${res.max.toFixed(0)}ms hscroll=${res.hscroll} longtasks=${res.lt}(max ${res.ltMax}ms)`);
  for(const b of res.bad.slice(0,8))console.log('    '+b);return res}
async function closeDialogs(p){await p.evaluate(()=>{try{GXH.hide();const r=document.querySelector('.gxh-rules');if(r)r.remove()}catch(e){}   // the lightbulb's bubble sits over the board until dismissed
    for(const b of document.querySelectorAll('.close,[data-bf=close],.gx-scrim.on'))if(b.offsetParent!==null||b.classList.contains('on'))try{b.click()}catch(e){}})}
async function fresh(b,w,h){const c=await b.newContext({viewport:{width:w,height:h},isMobile:true,hasTouch:true,deviceScaleFactor:3,userAgent:UA});await c.addInitScript(()=>{try{localStorage.setItem('sgz_offer','1');localStorage.setItem('gxh-sunglaze','{"on":false,"seen":{}}')}catch(e){}});   // no first-time tutorial offer, no coach bubbles over the board
  const p=await c.newPage();
  p.on('pageerror',e=>console.log('PAGEERROR',e.message));await p.goto(URL);await sleep(1500);return p}
async function start(p){await p.evaluate(()=>{document.querySelector('[data-ui=start]').click()});await sleep(600);
  await p.evaluate(()=>{const o=document.querySelector('[data-ui=story-ok]');if(o)o.click()});await sleep(1500)}
async function move(p){ // one real move by touch: first factory tile, then first row that glows/accepts
  const pt=async s=>p.evaluate(s=>{const e=document.querySelector(s);if(!e)return null;const r=e.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2}},'[data-k=f0_0]');
  const a=await pt();if(a)await p.touchscreen.tap(a.x,a.y);await sleep(500);
  const r=await p.evaluate(()=>{const e=document.querySelector('[data-bfrow="4"]');const q=e.getBoundingClientRect();return {x:q.left+q.width/2,y:q.top+q.height/2}});await p.touchscreen.tap(r.x,r.y);await sleep(2500)}
async function rotate(p,w,h){await p.setViewportSize({width:w,height:h});await p.evaluate(()=>{dispatchEvent(new Event('resize'));dispatchEvent(new Event('orientationchange'))});await sleep(700)}
// iOS quirk: resize/orientationchange fire while innerWidth/innerHeight still report the OLD size, and nothing fires afterwards.
async function rotateStale(p,w,h,ow,oh){await p.setViewportSize({width:w,height:h});await sleep(300);
  await p.evaluate(([ow,oh])=>{const dw=Object.getOwnPropertyDescriptor(window,'innerWidth'),dh=Object.getOwnPropertyDescriptor(window,'innerHeight');
    Object.defineProperty(window,'innerWidth',{configurable:true,get:()=>ow});Object.defineProperty(window,'innerHeight',{configurable:true,get:()=>oh});
    dispatchEvent(new Event('orientationchange'));dispatchEvent(new Event('resize'));
    setTimeout(()=>{if(dw)Object.defineProperty(window,'innerWidth',dw);else delete window.innerWidth;if(dh)Object.defineProperty(window,'innerHeight',dh);else delete window.innerHeight},50)},[ow,oh]);await sleep(1400)}
(async()=>{const b=await chromium.launch();let fail=0;const chk=r=>{if(r.blocked||r.noresp||r.slow||r.off||r.hscroll)fail++};
  const skip=id=>/menu|new|reset|rulesd|story|start/i.test(id)&&false;
  for(const [pw,ph,lw,lh] of [[390,763,763,390],[390,844,844,390],[375,667,667,375]]){
    console.log(`=== rotate ${pw}x${ph} <-> ${lw}x${lh}`);const p=await fresh(b,pw,ph);await start(p);
    chk(await tapAll(p,`portrait ${pw}x${ph} (before move)`));await move(p);
    chk(await tapAll(p,`portrait ${pw}x${ph} after move`,0,{skip:id=>/\.f\d|\.sun/.test(id)}));
    await rotate(p,lw,lh);chk(await tapAll(p,`landscape ${lw}x${lh} after rotate`,0,{skip:id=>/\.f\d|\.sun/.test(id)}));
    await rotate(p,pw,ph);chk(await tapAll(p,`portrait again`,0,{skip:id=>/\.f\d|\.sun/.test(id)}));
    await rotate(p,lw,lh);chk(await tapAll(p,`landscape again`,0,{skip:id=>/\.f\d|\.sun/.test(id)}));
    await p.context().close()}
  console.log('=== iOS stale-size rotation (events fire with old innerWidth/innerHeight)');
  for(const [pw,ph,lw,lh] of [[390,763,763,390],[390,844,844,390]]){const p=await fresh(b,pw,ph);await start(p);await move(p);
    await rotateStale(p,lw,lh,pw,ph);chk(await tapAll(p,`stale->landscape ${lw}x${lh}`,0,{skip:id=>/\.f\d|\.sun/.test(id)}));
    const g=await p.evaluate(()=>{const t=document.querySelector('.bf-table').getBoundingClientRect(),m=document.querySelector('.bf-me').getBoundingClientRect();return {tbl:[t.x,t.y,t.width,t.height].map(Math.round),me:[m.x,m.y,m.width,m.height].map(Math.round),land:document.documentElement.classList.contains('bf-land'),offTiles:[...document.querySelectorAll('.bf-table [data-k]')].filter(e=>{const r=e.getBoundingClientRect();return r.right>innerWidth||r.bottom>innerHeight||r.left<0||r.top<0}).length}});
    console.log('    layout',JSON.stringify(g));if(!g.land||g.offTiles)fail++;
    await rotateStale(p,pw,ph,lw,lh);chk(await tapAll(p,`stale->portrait ${pw}x${ph}`,0,{skip:id=>/\.f\d|\.sun/.test(id)}));await p.context().close()}
  console.log('=== start directly in landscape');
  for(const [w,h] of [[763,390],[844,390],[667,375]]){const p=await fresh(b,w,h);await start(p);chk(await tapAll(p,`land-start ${w}x${h}`,0,{skip:id=>/\.f\d|\.sun/.test(id)}));await move(p);chk(await tapAll(p,`land-start ${w}x${h} after move`,0,{skip:id=>/\.f\d|\.sun/.test(id)}));await p.context().close()}
  await b.close();console.log(fail?`FAIL (${fail} bad steps)`:'ALL OK');process.exit(fail?1:0)})();
