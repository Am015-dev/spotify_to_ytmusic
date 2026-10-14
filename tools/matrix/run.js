#!/usr/bin/env node
// tools/matrix/run.js: generated player-experience matrix. node tools/matrix/run.js [--city fra|ath] [--profiles phone,portrait,desktop] [--rides N] [--fam builder,roam,...]
// One warm page per (city x profile) from the hot server (tools/hot.js serves out/hot/hot.html from CURRENT src, so a build is not needed).
const fs=require('fs'),path=require('path'),cp=require('child_process'),http=require('http');
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const ROOT=path.resolve(__dirname,'..','..'),PORT=+process.env.HOT_PORT||8890;
const A=process.argv.slice(2),arg=(f,d)=>{const i=A.indexOf(f);return i<0?d:A[i+1]};
const QUICK=A.includes('--quick');if(QUICK){for(const [k,v] of [['--city','fra,ath'],['--profiles','phone,desktop'],['--rides','2'],['--starts','250'],['--fam','builder,roam,spot,foot,race,camfit,props,footsurf'],['--foot-starts','12'],['--foot-rides','1'],['--spot-rides','1'],['--race-rides','1']])if(A.indexOf(k)<0)A.push(k,v)}
const FULL=A.includes('--full');if(FULL){for(const [k,v] of [['--city','fra,ath'],['--rides','3'],['--starts','1000'],['--fam','builder,roam,spot,foot,race,camfit,props,footsurf'],['--foot-starts','60'],['--race-rides','1'],['--foot-rides','1'],['--spot-rides','1']])if(A.indexOf(k)<0)A.push(k,v)}
const CITIES=(arg('--city','fra')).split(','),PROFS=(arg('--profiles','phone,portrait,desktop')).split(','),NR=+arg('--rides',12),FAMS=(arg('--fam','builder')).split(','),OUT=arg('--out','out/matrix'),SH=+arg('--shards',2);
const T0=Date.now(),log=m=>console.error(((Date.now()-T0)/1000).toFixed(1)+'s '+m);
const VP={phone:{width:852,height:393},portrait:{width:393,height:852},desktop:{width:1280,height:720}};
const up=()=>new Promise(r=>http.get('http://127.0.0.1:'+PORT+'/hot.html?probe=1',x=>{x.resume();r(true)}).on('error',()=>r(false)));
(async()=>{
 if(!await up()){cp.spawn('node',[ROOT+'/tools/hot.js','status'],{env:{...process.env,HOT_CITIES:'none'},detached:true,stdio:'ignore'}).unref();for(let i=0;i<60&&!await up();i++)await new Promise(r=>setTimeout(r,1000))}
 const pageJs=fs.readFileSync(__dirname+'/page.js','utf8'),all=[];const errs=[];
 const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 // one warm page per (city, shard); the 3 input profiles run in the SAME page (viewport + touch state switched), so boots and ride loads are paid once per shard
 const jobs=[];for(const c of [...CITIES].sort((a,b)=>(b==='ath')-(a==='ath')))for(let k=0;k<SH;k++)jobs.push({c,k});
 const JOBS=+arg('--jobs',4);let next=0;
 await Promise.all(Array.from({length:JOBS},async()=>{while(next<jobs.length){const {c,k}=jobs[next++];for(let attempt=0;attempt<2;attempt++){let ctx=null;try{ctx=await b.newContext({viewport:VP.phone,isMobile:true,hasTouch:true,deviceScaleFactor:1});await (async()=>{
  const p=await ctx.newPage();p.setDefaultTimeout(900000);const E=[];
  p.on('pageerror',e=>E.push(String(e).slice(0,160)));p.on('response',r=>{if(r.status()===404)E.push('404 '+r.url().replace(/^https?:\/\/[^/]+/,'').slice(0,100))});p.on('console',m=>{if(/Failed to load resource/.test(m.text()))return;if(m.type()==='error')E.push('console: '+m.text().slice(0,160))});
  const tag=c+'#'+k;await p.goto(`http://127.0.0.1:${PORT}/hot.html?test=${c}&draw=0`);await p.waitForFunction(()=>window.__tq&&__tq.ready,null,{polling:250,timeout:300000});log(tag+' booted');
  const H=async js=>{const t=Date.now();const r=await p.evaluate(s=>window.__hot(s),js);const d=Date.now()-t;if(d>8000||process.env.MX_V)log(tag+' slow '+d+' ms: '+js.slice(0,70));return r};await H(pageJs);
  const QAJ=ROOT+'/src/assets/qa/code.js';if(!A.includes('--no-qa')&&fs.existsSync(QAJ)){try{await H(fs.readFileSync(QAJ,'utf8'))}catch(e){log(tag+' qa kit not loaded: '+String(e).slice(0,80))}}
  const J=JSON.stringify,first=k===0;
  const ride=await H('GAR_SETS.map(s=>s.id)');const step=Math.max(1,Math.floor(ride.length/NR)),rides=arg('--ids',null)?arg('--ids').split(','):ride.filter((_,i)=>i%step===0).slice(0,NR);
  const setProf=async pr=>{await p.setViewportSize(VP[pr]);await H('MX.setProf('+J(pr)+')')};
  if(FAMS.includes('footsurf')&&first){try{const r=JSON.parse(await H(fs.readFileSync(ROOT+'/tools/hot/footSurf.js','utf8')));const f=[];if(!r.pass){if(r.A&&r.A.nBad)f.push('footsurf-A-feet-off-surface');if(r.B)for(const q of ['cars','props','bld','rides'])if(r.B[q]&&r.B[q].nBad)f.push('footsurf-B-penetrates-'+q);if(!f.length)f.push('footsurf-fail')}all.push({fam:'footsurf',tag:c,city:c,prof:'phone',fails:f,info:r})}catch(e){all.push({fam:'footsurf',tag:c,city:c,prof:'phone',fails:['footsurf-crash']})}}
  if(FAMS.includes('props')&&!first)await H('MX.propScan()');
  // starts: shard k takes every SH-th street start
  const NS=+arg('--starts',150),stAll=FAMS.includes('roam')?await H('MX.starts('+NS+')'):[],st=stAll.filter((_,i)=>i%SH===k);
  const spots=FAMS.includes('spot')&&!first?await H('MX.spotStarts()'):[];
  const fN=+arg('--foot-starts',60),fAll=FAMS.includes('foot')&&!first?await H('MX.starts('+Math.max(fN,150)+')'):[],fsel=fAll.filter((_,i)=>i%Math.max(1,Math.floor(fAll.length/fN))===0).slice(0,fN);
  let demos=[];if(FAMS.includes('builder')&&first)demos=await H('Object.keys(BX_DEMOS).filter(q=>!BX_DEMOS[q].hide)');
  const tr=FAMS.includes('race')&&first?await H('TRACK_DEFS.filter(t=>(t.city||"fra")===CID).map(t=>t.id)'):[];
  for(let ri=0;ri<rides.length;ri++){const rid=rides[ri];await H('MX.setRide('+J(rid)+')');
   for(const pr of PROFS){await setProf(pr);
    if(demos.length&&FAMS.includes('builder')){for(const d of demos)await H('MX.bxCase('+J(d)+','+J(pr)+','+J(rid)+')');await H('MX.bxEnd()')}
    if(first&&FAMS.includes('roam'))await H('MX.roamHud('+J(pr)+','+J(rid)+')');
    if(first&&FAMS.includes('camfit')&&ri<+arg('--cam-rides',4))await H('MX.camFit('+J(rid)+')');
    if(st.length){for(let i=0;i<st.length;i+=50)await H(st.slice(i,i+50).map((q,j)=>'MX.roamCase('+J(pr)+','+J(rid)+','+J(q)+','+(i+j)+','+((i+j)%60===0)+')').join(';'))}
    if(spots.length&&ri<+arg('--spot-rides',3))await H(spots.map((q,j)=>'MX.roamCase('+J(pr)+','+J(rid)+','+J(q)+','+j+','+(j%6===0)+',"spot")').join(';'));
    if(fsel.length&&ri<+arg('--foot-rides',3))await H(fsel.map((q,j)=>'MX.footCase('+J(pr)+','+J(rid)+','+J(q)+','+j+')').join(';'));
    if(tr.length&&ri<+arg('--race-rides',2))for(const t of tr)await H('MX.raceCase('+J(t)+','+J(pr)+','+J(rid)+')');
   }log(tag+' ride '+rid+' done')}
  try{const bugs=await H('(window.__bugs||[]).map(b=>({name:b.name,x:b.x,z:b.z,ride:b.ride,n:b.n}))');for(const b of bugs)all.push({fam:'qa-invariant',tag:b.name+'@'+Math.round(b.x)+','+Math.round(b.z)+'|'+(b.ride||''),city:c,prof:'',fails:['qa-inv:'+b.name]})}catch(e){}
  const res=await H('MX.R.slice()');for(const r of res){r.city=c;r.prof=r.prof||''}all.push(...res);errs.push(...E.map(e=>tag+' '+e));await ctx.close()})();break}catch(e){log(c+'#'+k+' attempt '+attempt+' failed: '+String(e).slice(0,100));errs.push(c+'#'+k+' JOB FAILED: '+String(e).slice(0,100));try{await ctx.close()}catch(x){}}}}}));
 await b.close();
 // ---- report: group FAILs by root cause (check id), one line per group with the case count
 const G={};let nf=0;for(const r of all)if(r.fails&&r.fails.length){nf++;for(const f of new Set(r.fails)){(G[f]=G[f]||{n:0,ex:[]}).n++;if(G[f].ex.length<3)G[f].ex.push(r.city+'/'+r.tag)}}
 fs.mkdirSync(OUT,{recursive:true});fs.writeFileSync(OUT+'/matrix.json',JSON.stringify({all,errs},null,0));
 for(const [k,g] of Object.entries(G).sort((a,b)=>b[1].n-a[1].n))console.log(`FAIL ${k}: ${g.n} cases · e.g. ${g.ex.join(' ; ')}`);
 for(const e of [...new Set(errs)].slice(0,5))console.log('CONSOLE '+e);
 console.log(`MATRIX ${nf?'FAIL':'OK'}: ${all.length} cases · ${nf} failing · ${Object.keys(G).length} root causes · ${errs.length} console errors · ${((Date.now()-T0)/1000).toFixed(0)} s`);
 process.exit(nf?1:0)})();
