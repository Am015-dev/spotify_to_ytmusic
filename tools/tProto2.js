// tProto2: proto-2 (2K look) shots + numbers. Same 3 framings as tProtoShots (grid, mid-straight 140 m, prop spot 300 m), phone profile 852x393,
// then frame time at the 300 m spot with 6x CPU throttle (CDP). node tools/tProto2.js <base url> <outdir> <tag> [query e.g. &proto=1]
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const [BASE,OUT,TAG,QS]=process.argv.slice(2);
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const c=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:1,isMobile:true,hasTouch:true,userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'});const p=await c.newPage();p.setDefaultTimeout(600000);p.on('pageerror',e=>console.log('PAGEERR',String(e).slice(0,160)));
 await p.goto(BASE+'?test=fra'+(QS||''));await p.waitForFunction(()=>window.__chk&&window.__tq&&__tq.ready,null,{timeout:400000});await p.waitForTimeout(3000);
 const Q=s=>p.evaluate(s=>__tk.q(s),s);
 console.log("progs0",await Q(`renderer.info.programs.length`));await Q(`(()=>{tkStart(tkMarkOf(RIVAL_EV.find(e=>e.p===TK_C.p)),TK_C);return 1})()`);
 await p.waitForTimeout(6000);await Q(`(()=>{RO.sp.cd=Math.max(RO.sp.cd,1.5);return 1})()`);await p.waitForTimeout(1500);
 console.log('state',await Q(`JSON.stringify({mood:MOOD.id,q:SET.q,low:lowGfx,bloom:bloom.enabled,bs:+bloom.strength.toFixed(2),exp:renderer.toneMappingExposure,tm:renderer.toneMapping,key:moonL.position.toArray().map(Math.round),kc:moonL.color.getHexString(),ki:moonL.intensity,fogD:scene.fog.density,env:scene.environmentIntensity,P2:window.PROTO&&PROTO.p2&&PROTO.p2.dbg,progs:renderer.info.programs.length})`));
 await p.screenshot({path:OUT+'/'+TAG+'_01.png'});
 for(const [n,s] of [[2,140],[3,300]]){
  await Q(`(()=>{const sp=RO.sp;sp.cd=0;K.ArrowUp=K.KeyW=true;const Gm=tkGeoOf(sp.C),L=tkLen(Gm.seg.start),f=${s}/L,q=tkAt(Gm.seg.start,f);RO.x=q.x;RO.z=q.z;RO.y=groundAt(q.x,q.z,99);RO.h=RO.vh=q.h;RO.v=30;camSnap=true;sp.ai.forEach((a,i)=>{a.s=${s}+12+i*9;a.v=29;a.route='A'});return L|0})()`);
  await p.waitForTimeout(1600);console.log('shot',n,await Q(`[Math.round(RO.v),Math.round(RO.sp.myS||0),RO.sp.ai.map(a=>Math.round(a.s)).join('/')].join(' ')`));await p.screenshot({path:OUT+'/'+TAG+'_0'+n+'.png'})}
 console.log("progs3",await Q(`renderer.info.programs.length`));const cdp=await c.newCDPSession(p);await cdp.send('Emulation.setCPUThrottlingRate',{rate:6});await p.waitForTimeout(1500);
 const ft=await p.evaluate(()=>new Promise(r=>{const a=[];let t0=performance.now();function f(t){a.push(t-t0);t0=t;if(a.length<90)requestAnimationFrame(f);else{a.shift();a.sort((x,y)=>x-y);r([a.reduce((s,x)=>s+x,0)/a.length,a[Math.floor(a.length*.5)],a[Math.floor(a.length*.95)]].map(x=>x.toFixed(1)).join(' '))}}requestAnimationFrame(f)}));
 console.log('frame6x mean/p50/p95 ms',ft);await cdp.send('Emulation.setCPUThrottlingRate',{rate:1});
 await b.close()})();
