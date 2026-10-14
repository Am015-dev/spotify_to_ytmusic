// bootprof.js [ath|fra] [N] : CPU-profile one fast-test boot (?test=<c>&draw=0) of the hot page (tools/hot.js daemon must be up, port HOT_PORT)
// and print the top N functions by self and by inclusive time (ms), plus the loader stage timings. hot-1, 2026-10-14.
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const C=process.argv[2]||'ath',N=+(process.argv[3]||25),PORT=+process.env.HOT_PORT||8890;
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader',...(process.env.ACC2D?[]:['--disable-accelerated-2d-canvas'])]});
 const ctx=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:1,isMobile:true,hasTouch:true});const p=await ctx.newPage();p.setDefaultTimeout(180000);
 const errs=[];p.on('pageerror',e=>errs.push(String(e).slice(0,160)));
 const cdp=await ctx.newCDPSession(p);await cdp.send('Profiler.enable');await cdp.send('Profiler.setSamplingInterval',{interval:1000});await cdp.send('Profiler.start');
 const t=Date.now();await p.goto(`http://127.0.0.1:${PORT}/hot.html?test=${C}&draw=0${process.env.Q?"&"+process.env.Q:""}`);await p.waitForFunction(()=>window.__tq&&__tq.ready,null,{polling:250,timeout:180000});
 const wall=(Date.now()-t)/1000;const {profile:P}=await cdp.send('Profiler.stop');
 const st=await p.evaluate(()=>{const L=__tq.st;return L.map((x,i)=>[(((L[i+1]||[__tq.tReady])[0]-x[0])/1000).toFixed(1),x[1]]).filter(x=>x[0]>0.3)});
 const byId=new Map(P.nodes.map(n=>[n.id,n])),par=new Map();for(const n of P.nodes)for(const c of n.children||[])par.set(c,n.id);
 // hot.html line → src module:line (same concatenation as hot.js hotPage)
 const fs=require('fs'),S=__dirname+'/../src/';let txt=fs.readFileSync(S+'assets/shell_head.html','utf8');const M=[];
 for(const f of fs.readFileSync(S+'ORDER','utf8').split('\n').map(x=>x.trim()).filter(Boolean)){if(f==='99_api.js'){for(const t of fs.readdirSync(S+'test').filter(x=>x.endsWith('.js')).sort()){M.push([txt.split('\n').length,'test/'+t]);txt+=fs.readFileSync(S+'test/'+t,'utf8')}txt+='\nwindow.__hot=__hs=>eval(__hs);\n'}M.push([txt.split('\n').length,f]);txt+=fs.readFileSync(S+f,'utf8')}
 const loc=l=>{let m=M[0];for(const x of M)if(x[0]<=l)m=x;return m[1]+':'+(l-m[0]+1)};
 const key=n=>{const f=n.callFrame;return(f.functionName||'(anon)')+' '+(/hot\.html/.test(f.url)?loc(f.lineNumber+1):f.url.split('/').pop()+':'+(f.lineNumber+1))};
 const dt=P.timeDeltas,self={},inc={};for(let i=0;i<P.samples.length;i++){const d=(dt[i+1]||0)/1000;let id=P.samples[i];const n=byId.get(id);const k=key(n);self[k]=(self[k]||0)+d;
  const seen=new Set();while(id!=null){const q=byId.get(id),kk=key(q);if(!seen.has(kk)){seen.add(kk);inc[kk]=(inc[kk]||0)+d}id=par.get(id)}}
 // CALLERS=name: time spent under that function, by the calling function
 const CA=process.env.CALLERS,cal={};if(CA)for(let i=0;i<P.samples.length;i++){const d=(dt[i+1]||0)/1000;let id=P.samples[i],last=null;while(id!=null){const q=byId.get(id);if(q.callFrame.functionName===CA)last=id;id=par.get(id)}if(last!=null){const pp=byId.get(par.get(last));const k=key(pp);cal[k]=(cal[k]||0)+d}}
 // CHILD=name: time under that function, by its direct child (self = its own code)
 const CH=process.env.CHILD,chi={};if(CH)for(let i=0;i<P.samples.length;i++){const d=(dt[i+1]||0)/1000;let id=P.samples[i],prev=null;while(id!=null){const q=byId.get(id);if(q.callFrame.functionName===CH){const k=prev==null?'(self)':key(byId.get(prev));chi[k]=(chi[k]||0)+d;break}prev=id;id=par.get(id)}}
 const top=o=>Object.entries(o).filter(([k])=>!/^\((root|program|idle|garbage collector)\)/.test(k)||true).sort((a,b)=>b[1]-a[1]).slice(0,N).map(([k,v])=>v.toFixed(0).padStart(6)+' '+k);
 console.log(`BOOT ${C} ${wall.toFixed(1)} s, errors ${errs.length}${errs.length?' · '+errs[0]:''}\nstages: `+st.map(x=>x[0]+' '+x[1]).join(' | '));
 console.log('--- self ms\n'+top(self).join('\n'));console.log('--- inclusive ms\n'+top(inc).join('\n'));if(CH)console.log('--- children of '+CH+'\n'+top(chi).join('\n'));if(CA)console.log('--- callers of '+CA+'\n'+top(cal).join('\n'));await b.close()})();
