// REVIEW_2K_39: copy of docs/shots/rev35/rev35tip.js (unchanged).
// REVIEW_2K_35 probe: does #crSmTip show in a REAL drive (page loop + traffic running, GAS held by a real CDP touch)?
// node rev35tip.js <url index.html> <fra|ath> <outdir> [portrait]  ; phone profile, CPU 6x after boot.
// Phase 1 (natural): spawn on a street, hold GAS (+ gentle real steer corrections), poll every 150 ms for 90 s; shot when the tip first shows.
// Phase 2 (placed): put one traffic car 3.2 m to the LEFT, then to the RIGHT, level with the player, page still running; shot each.
// Also: in a race the tip must never show.
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const [BASE,C,OUT,PORT]=process.argv.slice(2);const W=PORT?390:852,H=PORT?844:393;
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const ctx=await b.newContext({viewport:{width:W,height:H},deviceScaleFactor:2,isMobile:true,hasTouch:true,userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'});
 const p=await ctx.newPage();p.setDefaultTimeout(600000);const errs=[];p.on('pageerror',e=>errs.push(String(e).slice(0,160)));
 const cdp=await ctx.newCDPSession(p);const EV=(fn,arg)=>p.evaluate(c=>__xc.ev(c),'('+fn.toString()+')('+JSON.stringify(arg||{})+')');
 const sleep=ms=>new Promise(r=>setTimeout(r,ms));const tag=C+(PORT?'_portrait':'');
 await p.goto(BASE+'?test='+C);await p.waitForFunction(()=>window.__tq&&__tq.ready,null,{polling:250,timeout:300000});
 await cdp.send('Emulation.setCPUThrottlingRate',{rate:6});
 await EV(()=>{try{localStorage.setItem('mho_smTip','0')}catch(e){}__crt.n=0;__crt.last=-1e9;CRSM.hn=0;const q=CAM_road(70);if(q)roamWarp(q.x,q.z,q.h,true);RO.v=0;return 1});
 const pos=await EV(()=>{const c=s=>{const e=document.querySelector(s);if(!e)return null;const r=e.getBoundingClientRect();return[r.left+r.width/2,r.top+r.height/2]};return{G:c('#tG'),L:c('#tL'),R:c('#tR')}});
 const ID={G:2,L:4,R:1};let down=[];const pts=()=>down.map(k=>({x:pos[k][0],y:pos[k][1],id:ID[k]}));
 const set=async ks=>{if(down.some(k=>!ks.includes(k))){await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});down=[]}const add=ks.filter(k=>!down.includes(k));if(add.length){down=[...down,...add];await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:pts()})}};
 const tipInfo=()=>EV(()=>{const e=document.getElementById('crSmTip');if(!e||e.style.display==='none'||!__crt.on)return null;const r=e.getBoundingClientRect(),cs=getComputedStyle(e);
  const ov=[];for(const q of CRSM_rects())if(r.left<q.right&&r.right>q.left&&r.top<q.bottom&&r.bottom>q.top)ov.push(Math.round(q.left)+','+Math.round(q.top));
  const mm=document.querySelector('#roamMini');let mmo=false;if(mm&&mm.offsetParent){const m=mm.getBoundingClientRect();mmo=r.left<m.right&&r.right>m.left&&r.top<m.bottom&&r.bottom>m.top}
  return{t:e.textContent,fs:cs.fontSize,disp:cs.display,vis:cs.visibility,op:cs.opacity,r:[r.left,r.top,r.width,r.height].map(Math.round),inView:r.left>=0&&r.top>=0&&r.right<=innerWidth&&r.bottom<=innerHeight,overCtl:ov,overMini:mmo,side:CRB_side(0),kmh:Math.round(Math.abs(RO.v)*3.6),st:state}});
 const shot=async name=>{await cdp.send('Emulation.setCPUThrottlingRate',{rate:1})/* only so the shot lands inside the 3.5 s show; layout is unchanged */;await p.screenshot({path:OUT+'/'+name+'.jpg',type:'jpeg',quality:80});await cdp.send('Emulation.setCPUThrottlingRate',{rate:6})};
 await set(['G']);let nat=null,t0=Date.now(),k=0;
 while(Date.now()-t0<90000){const x=await tipInfo();if(x){nat=x;await shot('tip_natural_'+tag);break}
  k++;if(k%20===0){await set(['G',k%40?'L':'R']);await sleep(120);await set(['G'])}await sleep(150)
  if(k%60===0){const s=await EV(()=>({kmh:Math.round(Math.abs(RO.v)*3.6),st:state,road:!!CAM_road}));if(s.kmh<5)await EV(()=>{const q=CAM_road(70);if(q)roamWarp(q.x,q.z,q.h,true);return 1})}}
 console.log(tag,'natural',Math.round((Date.now()-t0)/1000)+'s',JSON.stringify(nat));
 for(const side of [-1,1]){await EV(()=>{CRT_hide();__crt.last=-1e9;if(__crt.n>=3)__crt.n=2;return 1});
  await EV(A=>{const h=RO.h,lx=-Math.cos(h),lz=Math.sin(h);const c=HUB.cars.find(q=>q.dead<=0&&!q.pk)||HUB.cars[0];c.x=RO.x+lx*A.s*3.2;c.z=RO.z+lz*A.s*3.2;c.dead=0;c.y=RO.y;return 1},{s:side});
  let x=null;for(let i=0;i<20&&!x;i++){x=await tipInfo();if(!x)await sleep(100)}if(x)await shot('tip_placed_'+(side<0?'left':'right')+'_'+tag);console.log(tag,'placed',side<0?'LEFT':'RIGHT',JSON.stringify(x))}
 const n3=await EV(()=>__crt.n);console.log(tag,'count after',n3);
 for(const m of ['','cup']){await set([]);await EV(A=>{try{if(state==='race'||RO.sp){}}catch(e){}__crt.n=0;__crt.last=-1e9;CRSM.hn=0;CRT_hide();if(A.m)menuTab=A.m;else menuTab='quick';startRace();return 1},{m});
  for(let i=0;i<120;i++){const s=await EV(()=>state+(RO.sp?'+sp':''));if(s==='race'||s.includes('sp'))break;await sleep(500)}await sleep(4000)/* past the countdown */
  await set(['G']);let shown=0,info=null;for(let i=0;i<40;i++){await EV(()=>{const h=RO.h;try{const c=HUB.cars[0];c.x=RO.x-Math.cos(h)*3.2;c.z=RO.z+Math.sin(h)*3.2;c.y=RO.y;c.dead=0}catch(e){}return 1});const x=await tipInfo();if(x){shown++;if(!info){info=x;await shot('tip_in_race_'+(m||'cityquick')+'_'+tag)}}await sleep(150)}
  console.log(tag,'race',m||'city-quick(default)','tip shown',shown+'/40','state',await EV(()=>state+(RO.sp?'+sp kind='+(RO.sp.C&&RO.sp.C.kind):'')+' v='+Math.round(Math.abs(RO.v)*3.6)),JSON.stringify(info));
  await set([]);await EV(()=>{try{if(RO.sp&&typeof tkQuit==='function')tkQuit()}catch(e){}return 1})}
 console.log(tag,'errs',JSON.stringify(errs.slice(0,3)));await b.close()})().catch(e=>{console.log('ERR '+String(e).slice(0,300));process.exit(1)});
