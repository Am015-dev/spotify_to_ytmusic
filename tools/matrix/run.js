#!/usr/bin/env node
// tools/matrix/run.js: generated player-experience matrix. node tools/matrix/run.js [--city fra|ath] [--profiles phone,portrait,desktop] [--rides N] [--fam builder,roam,...]
// One warm page per (city x profile) from the hot server (tools/hot.js serves out/hot/hot.html from CURRENT src, so a build is not needed).
const fs=require('fs'),path=require('path'),cp=require('child_process'),http=require('http');
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const ROOT=path.resolve(__dirname,'..','..'),PORT=+process.env.HOT_PORT||8890;
const A=process.argv.slice(2),arg=(f,d)=>{const i=A.indexOf(f);return i<0?d:A[i+1]};
const CITIES=(arg('--city','fra')).split(','),PROFS=(arg('--profiles','phone,portrait,desktop')).split(','),NR=+arg('--rides',12),FAMS=(arg('--fam','builder')).split(','),OUT=arg('--out','out/matrix');
const T0=Date.now(),log=m=>console.error(((Date.now()-T0)/1000).toFixed(1)+'s '+m);
const PV={phone:{viewport:{width:852,height:393},isMobile:true,hasTouch:true,deviceScaleFactor:1},portrait:{viewport:{width:393,height:852},isMobile:true,hasTouch:true,deviceScaleFactor:1},desktop:{viewport:{width:1280,height:720},deviceScaleFactor:1}};
const up=()=>new Promise(r=>http.get('http://127.0.0.1:'+PORT+'/hot.html?probe=1',x=>{x.resume();r(true)}).on('error',()=>r(false)));
(async()=>{
 if(!await up()){cp.spawn('node',[ROOT+'/tools/hot.js','status'],{env:{...process.env,HOT_CITIES:'none'},detached:true,stdio:'ignore'}).unref();for(let i=0;i<60&&!await up();i++)await new Promise(r=>setTimeout(r,1000))}
 const pageJs=fs.readFileSync(__dirname+'/page.js','utf8'),all=[];let errs=[];
 const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const jobs=[];for(const c of CITIES)for(const pr of PROFS)jobs.push({c,pr});
 await Promise.all(jobs.map(async({c,pr})=>{
  const ctx=await b.newContext(PV[pr]),p=await ctx.newPage();p.setDefaultTimeout(600000);const E=[];p.on('pageerror',e=>E.push(String(e).slice(0,160)));p.on('console',m=>{if(m.type()==='error')E.push('console: '+m.text().slice(0,160))});
  await p.goto(`http://127.0.0.1:${PORT}/hot.html?test=${c}&draw=0`);await p.waitForFunction(()=>window.__tq&&__tq.ready,null,{polling:250,timeout:300000});log(`${c}/${pr} booted`);
  const H=js=>p.evaluate(s=>window.__hot(s),js);await H(pageJs);
  const ride=await H('GAR_SETS.map(s=>s.id)');
  const step=Math.max(1,Math.floor(ride.length/NR)),rides=arg('--ids',null)?arg('--ids').split(','):ride.filter((_,i)=>i%step===0).slice(0,NR);
  if(FAMS.includes('builder')){const demos=await H('Object.keys(BX_DEMOS).filter(k=>!BX_DEMOS[k].hide)');
   for(const rid of rides){await H('MX.setRide('+JSON.stringify(rid)+')');
    for(const d of demos)await H('MX.bxCase('+JSON.stringify(d)+','+JSON.stringify(pr)+','+JSON.stringify(rid)+')')}}
  if(FAMS.includes('roam')){const NS=+arg('--starts',150);const st=await H('MX.starts('+NS+')');
   for(const rid of rides){await H('MX.setRide('+JSON.stringify(rid)+')');await H('MX.roamHud('+JSON.stringify(pr)+','+JSON.stringify(rid)+')');
    const B=50;for(let i=0;i<st.length;i+=B){const js=st.slice(i,i+B).map((q,j)=>'MX.roamCase('+JSON.stringify(pr)+','+JSON.stringify(rid)+','+JSON.stringify(q)+','+(i+j)+','+((i+j)%25===0)+')').join(';');await H(js)}}}
  const res=await H('MX.R.slice()');for(const r of res){r.city=c;r.prof=pr}all.push(...res);errs.push(...E.map(e=>c+'/'+pr+' '+e));await ctx.close()}));
 await b.close();
 // ---- report: group FAILs by root cause (check id x family), one line per group with the case count
 const G={};let nf=0;for(const r of all)if(r.fails.length){nf++;for(const f of new Set(r.fails)){const k=f.replace(/-(bxL|bxR|bxB|bxRsp|bxBack).*$/,'-'+f.split('-').pop());(G[f]=G[f]||{n:0,ex:[]}).n++;if(G[f].ex.length<3)G[f].ex.push(r.city+'/'+r.prof+'/'+r.tag)}}
 fs.mkdirSync(OUT,{recursive:true});fs.writeFileSync(OUT+'/matrix.json',JSON.stringify({all,errs},null,0));
 for(const [k,g] of Object.entries(G).sort((a,b)=>b[1].n-a[1].n))console.log(`FAIL ${k}: ${g.n} cases · e.g. ${g.ex.join(' ; ')}`);
 for(const e of [...new Set(errs)].slice(0,5))console.log('CONSOLE '+e);
 console.log(`MATRIX ${nf?'FAIL':'OK'}: ${all.length} cases · ${nf} failing · ${Object.keys(G).length} root causes · ${errs.length} console errors · ${((Date.now()-T0)/1000).toFixed(0)} s`);
 process.exit(nf?1:0)})();
