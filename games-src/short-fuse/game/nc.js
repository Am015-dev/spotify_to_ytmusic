// newcomer replay: node nc.js WxH job [steps]   (guided when job==0)
const PW=require(process.env.PW);const fs=require('fs'),path=require('path');
const HERE=__dirname;const html=fs.readFileSync(path.join(HERE,'shortfuse.html'));const FC=path.join(HERE,'..','kit','fontcache');const fcss=fs.readFileSync(path.join(FC,'fonts.css'));
const [W,H]=(process.argv[2]||'1366x768').split('x').map(Number);const job=+(process.argv[3]||0);const N=+(process.argv[4]||14);
(async()=>{const b=await PW.chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const ctx=await b.newContext({viewport:{width:W,height:H}});await ctx.route('**/*',r=>{const u=new URL(r.request().url());
 if(u.host==='gns.test')return r.fulfill({status:200,contentType:'text/html',body:html});if(u.host==='fonts.googleapis.com')return r.fulfill({status:200,contentType:'text/css',body:fcss});
 if(u.host==='fonts.gstatic.com'){const f=path.join(FC,path.basename(u.pathname));if(fs.existsSync(f))return r.fulfill({status:200,contentType:'font/woff2',body:fs.readFileSync(f)})}return r.abort()});
const p=await ctx.newPage();p.setDefaultTimeout(60000);const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/net::|Failed to load/.test(m.text()))errs.push(m.text())});
await p.goto('https://gns.test/');await p.waitForTimeout(1500);await p.evaluate(()=>{try{localStorage.clear()}catch(e){}});
const shot=async n=>{await p.screenshot({path:path.join(HERE,'shots','nc',`${W}x${H}_${job}_${n}.png`)})};
await shot('00start');
if(job===0)await p.click('[data-a=tutorial]');else{await p.click(`[data-a=job][data-n="${job}"]`);await p.click('[data-a=start]')}
await p.waitForTimeout(1500);
const dock=()=>p.evaluate(()=>document.querySelector('#dockt').textContent+' | '+[...document.querySelectorAll('#res,#coach,#main,#tip')].map(e=>e.innerText.replace(/\s+/g,' ').slice(0,170)).join(' || '));
for(let i=0;i<N;i++){await shot(String(i+1).padStart(2,'0'));console.log(i+1,(await dock()).slice(0,520));
 const act=await p.evaluate(()=>{const q=s=>document.querySelector(s);const click=e=>{e.click();return e.dataset.a||e.textContent};
  if(q('[data-a=briefok]'))return click(q('[data-a=briefok]'));
  if(q('#coach [data-a=coach]'))return click(q('#coach [data-a=coach]'));
  if(q('[data-a=myack]'))return click(q('[data-a=myack]'));
  if(q('#main [data-a=q]'))return click(q('#main [data-a=q]'));
  if(q('#main [data-a=dual]:not([disabled])'))return click(q('#main [data-a=dual]'));
  if(q('#main [data-a=v]'))return click(q('#main [data-a=v]'));
  const V=UI.V;if(V&&V.legal&&V.legal.plain.length&&decider()===V.seat){const m=V.legal.plain[0];onTile(m.st,m.ks[0]);return 'tile'}
  if(q('#main [data-a=claim],#main [data-a=off]'))return click(q('#main [data-a=off]'));
  return 'wait'});console.log('   ->',act);await p.waitForTimeout(act==='wait'?2500:1200)}
console.log('errors',errs.length,errs.slice(0,3));await b.close()})();
