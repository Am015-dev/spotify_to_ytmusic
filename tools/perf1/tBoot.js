// boot-1 probe: tBoot.js <outdir> <ver> : the first SECS (60) fake seconds after the car is drivable, touch profile (852x393, isMobile, hasTouch, Graphics Auto via ?gov=1).
// Stepped frames (rAF stubbed, 60 Hz fake clock); every frame really renders (composer.render timed apart; shader links = renderer.info.programs growth).
// Prints a per-second timeline of frames > 33 ms (JS + render) with the owner of each long frame (largest wrapped subsystem, 'render+prog' for a first-use shader link, 'gc/other' when the subs explain < half).
// env: CITY=fra|ath SECS=60 TOUCH=1 (0 = desktop 1280x720) QS=extra query WRAP=extra fns
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const http=require('http'),fs=require('fs'),path=require('path');
const OUT=path.resolve(process.argv[2]),V=process.argv[3],CITY=process.env.CITY||'fra',SECS=+(process.env.SECS||60),TOUCH=process.env.TOUCH!=='0';
const mime={'.html':'text/html','.js':'application/javascript','.json':'application/json','.mp3':'audio/mpeg'};
const INIT=`(()=>{const q=[];let t=0;window.requestAnimationFrame=cb=>{q.push(cb);return q.length};window.cancelAnimationFrame=()=>{};window.__dbg=1;
 window.__tick=n=>{for(let i=0;i<n;i++){t+=1000/60;const c=q.splice(0);for(const f of c){try{f(t)}catch(e){console.log('TICKERR '+e.message)}}}return t};window.__auto=true;setInterval(()=>{if(window.__auto)window.__tick(1)},16);})();`;
const srv=http.createServer((q,r)=>{const f=path.join(OUT,decodeURIComponent(q.url.split('?')[0]));fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':mime[path.extname(f)]||'application/octet-stream'});r.end(d)})}).listen(0,async()=>{
 const port=srv.address().port;const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--enable-precise-memory-info']});
 const ctx=await b.newContext(TOUCH?{viewport:{width:852,height:393},deviceScaleFactor:3,isMobile:true,hasTouch:true}:{viewport:{width:1280,height:720},deviceScaleFactor:1});
 const p=await ctx.newPage();p.setDefaultTimeout(1800000);await p.addInitScript(INIT);await p.addInitScript('window.__WRAP='+JSON.stringify(process.env.WRAP||''));
 p.on('console',m=>{const t=m.text();if(/TICKERR|PF1/.test(t))console.log(t.slice(0,200))});p.on('pageerror',e=>console.log('ERR',e.message.slice(0,150)));const t0=Date.now();
 await p.goto(`http://127.0.0.1:${port}/${V}/index.html?test=${CITY}&gov=1${process.env.QS?'&'+process.env.QS:''}`);
 await p.waitForFunction(()=>window.__tq&&__tq.drv&&window.__oc,null,{polling:100});const boot=Math.round((Date.now()-t0)/1000);
 const wr=await p.evaluate(()=>{window.__auto=false;const ev=__oc.ev;window.PF1={b:{}};
  const names=['roamStep','roamCam','hubCullStep','roamHud','drawTraffic','updWorld','hubTrafficStep','miniDraw','miniPaint','studSync','updDebris','dresStep','stepSim','lazyStep','lzFinish','lzStart','hubRecycle','pedStep','districtStep','LV_step','L3_tick','STR_step','STR_lzStep','LK_paint','LK_apply','GOV_step','resize','OC_traffic','FC_step','LF_step','MEMF_step','GS_step','LIFE_draw','ART_step','FL_step','OG_tick','BC_upd','W12_chk','storyCheck','PC_step','PC_add','PC_grid','DEST_find','DEST_mark','XC_need','applyQuality','PB_tick','QA_tick'].concat((window.__WRAP||'').split(',').filter(Boolean));const ok=[];
  for(const n of names){try{ev(`${n}=(f=>function(){const t=performance.now();try{return f.apply(this,arguments)}finally{PF1.b['${n}']=(PF1.b['${n}']||0)+performance.now()-t}})(${n})`);ok.push(n)}catch(e){}}
  ev(`{const R=composer.render.bind(composer);composer.render=function(){const t=performance.now();R();PF1.rms=(PF1.rms||0)+performance.now()-t}}`);window.__R=ev('renderer');window.__ev=ev;return ok});
 console.log('PF1 wrapped',wr.join(','));
 const r=await p.evaluate(async N=>{const ev=__ev,RO=ev("RO"),R=__R,G=ev("typeof GOV!=='undefined'?GOV:null"),out=[];
  const drv=ev(`(()=>{const W=a=>Math.atan2(Math.sin(a),Math.cos(a));return()=>{const la=12+RO.v*.9,fx=Math.sin(RO.h),fz=Math.cos(RO.h),q=rfAim(RO.x+fx*la,RO.z+fz*la,fx,fz,60),e=q?W(Math.atan2(q[0]-RO.x,q[1]-RO.z)-RO.h):0;K.KeyW=K.ArrowUp=true;K.ArrowLeft=e>.06;K.ArrowRight=e<-.06;if(Math.abs(RO.v)<.5&&(window.__stk=(window.__stk|0)+1)>90){window.__stk=0;const s=rfSnap(RO.x+(Math.random()-.5)*400,RO.z+(Math.random()-.5)*400,200);if(s)roamWarp(s[0],s[1],s[2]||0,true)}}})()`);
  let prog=R.info.programs.length,glog=G?G.log.length:0;
  for(let i=0;i<N;i++){try{drv()}catch(e){}PF1.b={};PF1.rms=0;const t=performance.now();__tick(1);const ms=performance.now()-t;
   const pg=R.info.programs.length,np=pg-prog;prog=pg;const b=PF1.b,rm=PF1.rms;let own='',om=0,sum=0;for(const k in b){if(k==='resize'||k==='LK_apply'||k==='PC_grid'||k==='PC_add'||k==='lzFinish'||k==='DEST_mark')continue;sum+=b[k];if(b[k]>om){om=b[k];own=k}}
   if(rm>om&&rm>ms*.4){own='render';om=rm}if(np>0&&rm>20)own='render+prog'+np;
   for(const k of['PC_add','lzFinish','LK_apply','GOV_step','DEST_find'])if(b[k]>ms*.3&&b[k]>15)own=k;
   if(om+rm<ms*.5)own='gc/other';
   let gl='';if(G&&G.log.length!==glog){gl=G.log.slice(glog).map(x=>x.join(':')).join(',');glog=G.log.length}
   out.push([i,+ms.toFixed(1),+rm.toFixed(1),own,+om.toFixed(1),np,gl,Object.entries(b).filter(e=>e[1]>4).map(e=>e[0]+':'+e[1].toFixed(0)).join(' ')]);
   await new Promise(r=>setTimeout(r,0))}
  return{out,gov:G?G.log:null,lvl:ev("typeof GOV_lvl==='function'?GOV_lvl():null")}},SECS*60);
 const fr=r.out,js=fr.map(f=>f[1]-f[2]),all=fr.map(f=>f[1]),srt=a=>a.slice().sort((x,y)=>x-y),pc=(a,q)=>srt(a)[Math.floor(a.length*q)];
 console.log(`PF1 city=${CITY} touch=${TOUCH} boot=${boot}s frames=${fr.length} gov=${JSON.stringify(r.gov)} end=${JSON.stringify(r.lvl)}`);
 console.log(`PF1 total(js+render) med ${pc(all,.5).toFixed(1)} p99 ${pc(all,.99).toFixed(1)} max ${Math.max(...all).toFixed(0)} n33 ${all.filter(x=>x>33).length} n50 ${all.filter(x=>x>50).length} n150 ${all.filter(x=>x>150).length} | js med ${pc(js,.5).toFixed(1)} max ${Math.max(...js).toFixed(0)} jsn50 ${js.filter(x=>x>50).length}`);
 const sec={};for(const f of fr)if(f[1]>33){const s=Math.floor(f[0]/60);(sec[s]=sec[s]||[]).push(f)}
 for(const s of Object.keys(sec))console.log(`PF1T s${String(s).padStart(2)} `+sec[s].map(f=>`${Math.round(f[1])}(${f[3]}${f[6]?' GOV '+f[6]:''})`).join(' '));
 const own={};for(const f of fr)if(f[1]>50){own[f[3]]=(own[f[3]]||0)+1}console.log('PF1OWN>50 '+JSON.stringify(own));
 for(const f of fr.filter(f=>f[1]>50).sort((a,b)=>b[1]-a[1]).slice(0,+(process.env.TOPN||12)))console.log(`PF1LONG f${f[0]} ${f[1]} r${f[2]} ${f[3]} prog+${f[5]} ${f[6]} | ${f[7]}`);
 if(process.env.JSON)fs.writeFileSync(process.env.JSON,JSON.stringify(r));
 await b.close();srv.close()});
