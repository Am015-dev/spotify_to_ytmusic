// prof.js <url> [frames] : enter Frankfurt roam, drive straight with gas, CPU-profile N test-driven frames (render stubbed like tPlay)
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const URL=process.argv[2],N=+(process.argv[3]||300),THR=+(process.env.THROTTLE||4);
const INIT=`(()=>{const q=[];let t=0;window.requestAnimationFrame=cb=>{q.push(cb);return q.length};window.cancelAnimationFrame=()=>{};
 window.__tick=n=>{for(let i=0;i<n;i++){t+=1000/60;const c=q.splice(0);for(const f of c){try{f(t)}catch(e){setTimeout(()=>{throw e})}}}return t};
 window.__auto=true;setInterval(()=>{if(window.__dbg&&!window.__fastR&&!window.__keepR){window.__fastR=__dbg.composer.render;__dbg.composer.render=()=>{}}if(window.__auto)window.__tick(1)},16)})();`;
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const ctx=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:3,isMobile:true,hasTouch:true});const p=await ctx.newPage();p.setDefaultTimeout(900000);
 await p.addInitScript(INIT);if(process.env.CITY)await p.addInitScript('window.__CITY='+JSON.stringify(process.env.CITY));const cdp=await ctx.newCDPSession(p);if(THR>1)await cdp.send('Emulation.setCPUThrottlingRate',{rate:THR});
 p.on('pageerror',e=>console.log('ERR',e.message.slice(0,150)));
 let T=Date.now();const lg=m=>{console.log(((Date.now()-T)/1000).toFixed(1)+'s '+m);T=Date.now()};
 await p.goto(URL);await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:500});lg('menu');
 await p.evaluate(()=>{localStorage.clear();localStorage.setItem('mho_slot','1');localStorage.setItem('mho_roam@1',JSON.stringify({tut:1,otg:{}}));if(window.__CITY==='ath'){localStorage.setItem('mho_city@1','ath');localStorage.setItem('mho_athd@1','A');localStorage.setItem('mho_roam.ath@1','{"otg":{}}');localStorage.setItem('mho_story.ath@1','{"seen":1}')}});await p.reload();
 await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:500});lg('menu2');
 if(process.env.PROFLOAD){await cdp.send('Profiler.enable');await cdp.send('Profiler.start')}
 await p.evaluate(()=>{window.__ldlog=[];const t0=performance.now();const o=$=>0;window.__ldT0=Date.now();const iv=setInterval(()=>{const s=document.querySelector('#ldStep'),b=document.querySelector('#ldPct');__ldlog.push([Date.now()-__ldT0,(b&&b.textContent)+' '+(s&&s.textContent)]);if(__mho.state==='roam'&&!(__mho.LD&&__mho.LD.on))clearInterval(iv)},1000)});
 await p.evaluate(()=>__mho.enterRoam());await p.waitForFunction(()=>__mho.state==='roam'&&!(__mho.LD&&__mho.LD.on),null,{polling:1000});lg('roam loaded');{const L=await p.evaluate(()=>__ldlog);let last='';for(const [t,x] of L){if(x!==last)console.log('  ld',t,x);last=x}}
 if(process.env.PROFLOAD){const {profile}=await cdp.send('Profiler.stop');const self={};const byId={};for(const n of profile.nodes)byId[n.id]=n;const dts=profile.timeDeltas;const cnt={};profile.samples.forEach((s,i)=>{cnt[s]=(cnt[s]||0)+(dts[i]||0)});for(const id in cnt){const n=byId[id],k=(n.callFrame.functionName||'(anon)')+':'+n.callFrame.lineNumber;self[k]=(self[k]||0)+cnt[id]}const tot=Object.values(self).reduce((a,b)=>a+b,0);console.log('load profile total',(tot/1e6).toFixed(1),'s');Object.entries(self).sort((a,b)=>b[1]-a[1]).slice(0,25).forEach(([k,v])=>console.log((v/tot*100).toFixed(1).padStart(5)+'% '+k))}
 await p.evaluate(()=>{window.__auto=false});await p.keyboard.down('ArrowUp');
 await p.evaluate(()=>__tick(60));lg('warm 60f');
 if(process.env.PROF){await cdp.send('Profiler.enable');await cdp.send('Profiler.start')}
 const t0=Date.now();await p.evaluate(n=>__tick(n),N);const dt=Date.now()-t0;lg(`${N} frames: ${(dt/N).toFixed(1)} ms/frame`);
 if(process.env.PROF){const {profile}=await cdp.send('Profiler.stop');const self={};const byId={};for(const n of profile.nodes)byId[n.id]=n;
  const dts=profile.timeDeltas;const cnt={};profile.samples.forEach((s,i)=>{cnt[s]=(cnt[s]||0)+(dts[i]||0)});
  for(const id in cnt){const n=byId[id],k=(n.callFrame.functionName||'(anon)')+':'+n.callFrame.lineNumber;self[k]=(self[k]||0)+cnt[id]}
  const tot=Object.values(self).reduce((a,b)=>a+b,0);Object.entries(self).sort((a,b)=>b[1]-a[1]).slice(0,30).forEach(([k,v])=>console.log((v/tot*100).toFixed(1).padStart(5)+'% '+k))}
 if(process.env.RENDER){const t1=Date.now();await p.evaluate(()=>{__dbg.composer.render=window.__fastR;window.__keepR=1;for(let i=0;i<5;i++){if(window.__fast)window.__fast.force=1;__tick(1);if(!window.__fast)0}});lg('5 rendered frames: '+((Date.now()-t1)/5).toFixed(0)+' ms/frame')}
 const st=await p.evaluate(()=>({x:__mho.RO.x,z:__mho.RO.z,v:__mho.RO.v}));console.log(JSON.stringify(st));
 await b.close()})();
