// tCamLoop.js <out dir with index.html> [city fra|ath] [seconds=60] [throttle=4] : iPhone emulation (852x393 DPR 3, touch UA, CPU throttled), real-time driving,
// per-frame log of the player (RO) and camera. Reports teleports (|d RO| > 1.2*v*dt+1.5 m while moving > 10 km/h), camera jumps (camera->car distance step > 2 m or > 2x normal follow distance).
// Prints one JSON line {tele,camJump,dist:[min,max,normal],frames}; set LOG=1 for event details.
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const http=require('http'),fs=require('fs'),path=require('path');
const OUT=path.resolve(process.argv[2]),CITY=process.argv[3]||'fra',SEC=+(process.argv[4]||60),THR=+(process.argv[5]||4);
const mime={'.html':'text/html','.js':'application/javascript','.json':'application/json','.mp3':'audio/mpeg'};
const INIT=`(()=>{const q=[];let t=0;window.requestAnimationFrame=cb=>{q.push(cb);return q.length};window.cancelAnimationFrame=()=>{};
 window.__tick=ms=>{t+=ms;const c=q.splice(0);for(const f of c){try{f(t)}catch(e){}}return t};window.__auto=true;setInterval(()=>{if(window.__auto)window.__tick(16.7)},16)})();`;
(async()=>{const srv=http.createServer((q,r)=>{const f=path.join(OUT,decodeURIComponent(q.url.split('?')[0]));fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);return r.end()}if(f.endsWith('index.html'))d=Buffer.from(d.toString().replace('const composer=new EffectComposer(renderer,rt);','const composer=new EffectComposer(renderer,rt);window.__C=composer;'));r.writeHead(200,{'content-type':mime[path.extname(f)]||'application/octet-stream'});r.end(d)})});
 await new Promise(r=>srv.listen(0,'127.0.0.1',r));const port=srv.address().port;
 const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const ctx=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:3,isMobile:true,hasTouch:true,userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'});
 const p=await ctx.newPage();p.setDefaultTimeout(240000);const errs=[];p.on('pageerror',e=>errs.push(String(e).slice(0,200)));await p.addInitScript(INIT);
 await p.goto(`http://127.0.0.1:${port}/index.html?test=${CITY}`);await p.waitForFunction(()=>window.__tq&&__tq.ready,null,{polling:500});
 const cdp=await ctx.newCDPSession(p);if(THR>1)await cdp.send('Emulation.setCPUThrottlingRate',{rate:THR});
 const info=await p.evaluate(()=>({cp:JSON.stringify(window.__cam.cp()).slice(0,200)}));console.error('probe',JSON.stringify(info));
 await p.evaluate(()=>{window.__auto=false;__C.render=()=>{}});await p.keyboard.down('ArrowUp');
 // fake-time driving: 60 fps base, a 90-250 ms hitch every ~40 frames (iPhone CPU throttle / GC / chunk load), steer in bursts
 const F=await p.evaluate(async([sec,hitch])=>{const out=[];let ms=0,i=0,seed=7;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;while(ms<sec*1000){const h=hitch&&i%40===39,d=h?90+rnd()*160:16.7+(i%3===0?16.7:0);ms+=d;i++;
   const k=(i/90|0)%4;window.__cam&&(0);__tick(d);const q=__cam.cp();if(q)out.push([ms,q.x,0,q.z,q.v,q.b,q.h,0,0,0,0,q.cb,q.Cb,q.Ch,d,__cam.S.k.split("|").slice(2).join("|")+"#"+(__cam.S.P?__cam.S.P.L.toFixed(1)+"x"+__cam.S.P.H.toFixed(1):"")]);if(i%300===0)await new Promise(r=>setTimeout(r,0))}return out},[SEC,1]);
 await p.keyboard.up('ArrowUp');
 if(process.env.DUMP)fs.writeFileSync(process.env.DUMP,JSON.stringify(F));
 let tele=[],jump=[],dmin=1e9,dmax=0;const dist=r=>r[5];const ds=F.map(dist).sort((a,b)=>a-b),norm=ds[ds.length>>1]||0;
 for(let i=1;i<F.length;i++){const a=F[i-1],c=F[i],dt=Math.min(.25,(c[0]-a[0])/1000),step=Math.hypot(c[1]-a[1],c[3]-a[3]);if(a[4]*3.6>10&&c[4]*3.6>10&&step>Math.abs(a[4])*dt*1.6+1.5)tele.push([i,+step.toFixed(1),+dt.toFixed(3),+a[4].toFixed(1)]);
  const dd=Math.abs(dist(c)-dist(a));if(dd>2&&dd>.0)jump.push([i,+dist(a).toFixed(1),+dist(c).toFixed(1),+dt.toFixed(3)]);dmin=Math.min(dmin,dist(c));dmax=Math.max(dmax,dist(c))}
 console.log(JSON.stringify({city:CITY,frames:F.length,tele:tele.length,camJump:jump.length,dist:[+dmin.toFixed(1),+dmax.toFixed(1),+norm.toFixed(1)],errs:errs.length}));
 if(process.env.LOG){console.log('TELE',JSON.stringify(tele.slice(0,20)));console.log('JUMP',JSON.stringify(jump.slice(0,30)))}
 await b.close();srv.close()})();
