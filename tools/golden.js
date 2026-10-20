// golden.js (golden-r20j): golden-image guard for the BUILT page. Fixed camera spots, seeded Math.random, sim held (rAF gated) before each shot,
// perceptual diff against docs/golden/<view>.png, side-by-side docs/golden/diff/<view>.png only for failures + cheap rules on every frame.
//   node tools/golden.js [--update] [--page out/<ver>] [--no-build] [--only a,b] [--keep-diff]
//   default: builds out/golden (tools/build.sh golden) and checks; exit 1 on any failure. --update rewrites the baselines (review them by eye, then commit).
// Baselines are stored at half size (PNG, <= 3 MB total); the shot is downscaled the same way before the compare, so AA noise does not count.
// Diff: both images go through a 2x2 box average, then a pixel counts as changed when its colour distance > D (0-255 scale); a view fails when the changed
// share of the (unmasked) pixels exceeds view.tol. Mask: sky/cloud pixels in the top 40 % (clouds animate). Rules: <= 2 % pure black, sky is blue (outdoor views),
// no HUD element overlapping the touch controls, visible text >= 12 px.
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs'),path=require('path'),http=require('http'),{execSync}=require('child_process');
const A=process.argv.slice(2),has=f=>A.includes(f),arg=f=>{const i=A.indexOf(f);return i>=0?A[i+1]:null};
const ROOT=path.resolve(__dirname,'..'),GD=path.join(ROOT,'docs/golden'),DD=path.join(GD,'diff'),UPD=has('--update'),ONLY=(arg('--only')||'').split(',').filter(Boolean);
const KNOWN=['"KM/H"','"NO WEAPON"'];   // small-text defects already reported (docs/HANDOFF_golden-r20j.md): notes, not failures, until fixed; drop the entry then
const D=26;   // per-pixel colour distance (0-255) above which a pixel counts as changed
// kind: 'go' = warp to a fixed spot; 'race' = race start grid; 'menu' = main menu. vp = viewport; touch = phone emulation (touch controls, DPR 1)
const VIEWS=[
 {n:'fra-skyline',city:'fra',at:[-380.31,450.33,1.6],tol:.10},
 {n:'fra-street-traffic',city:'fra',at:[-380.31,450.33,4.785],tol:.14},   // the boot spot: the street with its traffic
 {n:'ath-acropolis',city:'ath',at:[2420,-2257,-1.571],tol:.12},          // open ground east of the Acropolis, hills + backdrop mountains (see HANDOFF: the rock itself is hidden by blocks at road level)
 {n:'ath-street',city:'ath',at:[1883.68,-3170.29,-0.7933],tol:.12,blk:.05},   // building shadow, not a black frame
 {n:'race-grid',city:'fra',kind:'race',tol:.16,blk:.25},
 {n:'hud-portrait-402x812',city:'fra',at:[-380.31,450.33,4.785],vp:[402,812],touch:1,tol:.20},
 {n:'hud-landscape-852x393',city:'fra',at:[-380.31,450.33,4.785],vp:[852,393],touch:1,tol:.20},
 {n:'menu',city:'fra',kind:'menu',tol:.10,sky:0}
].filter(v=>!ONLY.length||ONLY.includes(v.n));
// seeded Math.random + a gate on requestAnimationFrame (hold the sim at the shot)
const INIT=`(()=>{let s=1337;const r=()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};Math.random=r;window.__goldSeed=n=>{s=n};
 const raf=window.requestAnimationFrame.bind(window),pn=performance.now.bind(performance),dn=Date.now.bind(Date);const G=window.__gold={hold:0,q:[],frames:0,fix:0};
 const vt=()=>1e7+G.frames*1000/60;performance.now=()=>G.fix?vt():pn();Date.now=()=>G.fix?1.7e12+vt():dn();
 window.requestAnimationFrame=cb=>raf(t=>{if(G.stopAt&&G.frames>=G.stopAt)G.hold=1;if(G.hold){G.q.push(cb);return}G.frames++;cb(G.fix?vt():t)});
 G.start=()=>{G.fix=1;G.frames=0};   // fixed 60 Hz clock from here: frame n is at the same game time in every run
 G.release=()=>{G.hold=0;G.fix=0;const q=G.q;G.q=[];for(const cb of q)raf(cb)}})()`;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const serve=dir=>new Promise(res=>{const T={'.html':'text/html','.js':'text/javascript','.json':'application/json','.mp3':'audio/mpeg','.png':'image/png'};
 const s=http.createServer((q,r)=>{let f=path.join(dir,decodeURIComponent(q.url.split('?')[0]));if(f.endsWith('/'))f+='index.html';fs.readFile(f,(e,b)=>{if(e){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':T[path.extname(f)]||'application/octet-stream'});r.end(b)})}).listen(0,'127.0.0.1',()=>res([s,s.address().port]))});
// DOM rules run inside the page: overlap HUD vs touch controls, text size
const DOMRULES=()=>{const vis=e=>{const r=e.getBoundingClientRect(),cs=getComputedStyle(e);return r.width>2&&r.height>2&&cs.visibility!=='hidden'&&cs.display!=='none'&&+cs.opacity>.05&&!e.closest('[hidden]')&&r.right>0&&r.bottom>0&&r.left<innerWidth&&r.top<innerHeight};
 const rc=e=>{const r=e.getBoundingClientRect();return[r.left,r.top,r.right,r.bottom]};const ov=(a,b)=>Math.min(a[2],b[2])-Math.max(a[0],b[0])>4&&Math.min(a[3],b[3])-Math.max(a[1],b[1])>4;
 const tc=[...document.querySelectorAll('#touch .tbtn,#steerZone')].filter(vis),hud=['roamMini','roamPlate','roamGauge','ofExit','odPin','m1Next'].map(i=>document.getElementById(i)).concat([...document.querySelectorAll('#crHB>*')]).filter(e=>e&&vis(e)),over=[];
 for(const h of hud)for(const t of tc)if(ov(rc(h),rc(t)))over.push((h.id||h.className)+' x '+(t.id||t.className));
 const small=[];for(const e of document.querySelectorAll('body *')){if(!vis(e))continue;let own='';for(const n of e.childNodes)if(n.nodeType===3)own+=n.nodeValue;own=own.trim();if(!own||/^[\u2000-\u2BFF\uFE0F\u{1F000}-\u{1FFFF}\s]+$/u.test(own))continue;
  if(e.closest('canvas,script,style,#c'))continue;const fs=parseFloat(getComputedStyle(e).fontSize);if(fs<12)small.push((e.id||e.className||e.tagName)+':'+fs+'px "'+own.slice(0,14)+'"')}
 return{touch:tc.length,over,small:small.slice(0,6)}};
// image work in a page: decode, downscale, diff, rules
const IMGJS=`(()=>{const L=u=>new Promise((ok,no)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=no;i.src=u});
 const half=(img,w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d',{willReadFrequently:true});x.imageSmoothingEnabled=true;x.imageSmoothingQuality='high';x.drawImage(img,0,0,w,h);return c};
 const px=c=>c.getContext('2d').getImageData(0,0,c.width,c.height);
 const ringish=(r,g,b)=>g>195&&b>205&&r<200&&r>90&&Math.abs(g-b)<45;   // the pale cyan story ring (a translucent torus whose spot differs per boot)
 const skyish=(r,g,b)=>(b>r+35&&b>g+8)||(r>205&&g>205&&b>205);
 window.G2={L,half,
  prep:async(u)=>{const i=await L(u),w=i.width>>1,h=i.height>>1,c=half(i,w,h);return{png:c.toDataURL('image/png'),w,h,rules:rules(i)}},
  diff:async(ub,uc,tol,D,sky,ring)=>{const[b,c]=[await L(ub),await L(uc)];if(b.width!==c.width||b.height!==c.height)return{fail:1,why:'size '+b.width+'x'+b.height+' vs '+c.width+'x'+c.height};
   const B=px(half(b,b.width,b.height)).data,C=px(half(c,c.width,c.height)).data,W=b.width,H=b.height,o=document.createElement('canvas');o.width=W*3;o.height=H;const x=o.getContext('2d'),od=x.createImageData(W*3,H);let n=0,bad=0,sum=0;
   for(let y=0;y<H;y++)for(let i=0;i<W;i++){const k=(y*W+i)*4,dr=B[k]-C[k],dg=B[k+1]-C[k+1],db=B[k+2]-C[k+2],d=Math.sqrt((dr*dr*.3+dg*dg*.59+db*db*.11)),m=sky&&y<H*.4&&(skyish(B[k],B[k+1],B[k+2])||skyish(C[k],C[k+1],C[k+2]))||ring&&(ringish(B[k],B[k+1],B[k+2])||ringish(C[k],C[k+1],C[k+2]));
    if(!m){n++;sum+=d;if(d>D)bad++}
    const hot=!m&&d>D;for(let j=0;j<3;j++){const q=(y*W*3+j*W+i)*4;if(j<2){const s=j?C:B;od.data[q]=s[k];od.data[q+1]=s[k+1];od.data[q+2]=s[k+2]}else{od.data[q]=hot?255:B[k]*.35;od.data[q+1]=hot?40:B[k+1]*.35;od.data[q+2]=hot?40:B[k+2]*.35}od.data[q+3]=255}}
   x.putImageData(od,0,0);const f=bad/n;return{share:f,mean:sum/n,fail:f>tol?1:0,sheet:o.toDataURL('image/png')}}};
 function rules(img){const c=half(img,img.width,img.height),d=px(c).data,n=c.width*c.height;let blk=0,blue=0,top=0;for(let y=0;y<c.height;y++)for(let i=0;i<c.width;i++){const k=(y*c.width+i)*4,r=d[k],g=d[k+1],b=d[k+2];if(r<3&&g<3&&b<3)blk++;if(y<c.height*.4){top++;if(b>r+30&&b>g+5&&b>90)blue++}}
  return{black:blk/n,blueTop:blue/top}}})()`;
async function doView(b,port,v,imgPage){const vp=v.vp||[852,393],touch=!!v.touch;
 const ctx=await b.newContext({viewport:{width:v.touch?852:vp[0],height:v.touch?393:vp[1]},deviceScaleFactor:1,isMobile:touch,hasTouch:touch});await ctx.addInitScript(INIT);const p=await ctx.newPage();p.setDefaultTimeout(240000);const E=[];p.on('pageerror',e=>E.push(String(e).slice(0,120)));
 await p.goto(`http://127.0.0.1:${port}/index.html?test=${v.city}&draw=0`);await p.waitForFunction(()=>window.__tq&&__tq.ready,null,{polling:250,timeout:240000});return{ctx,p,E}}
(async()=>{
 const T0=Date.now();let page=arg('--page');
 if(!page){if(!has('--no-build')||!fs.existsSync(path.join(ROOT,'out/golden/index.html'))){const o=execSync('tools/build.sh golden 2>&1 | tail -1',{cwd:ROOT,encoding:'utf8'});if(!/BUILD_OK/.test(o)){console.log('GOLDEN FAIL: build: '+o.slice(0,200));process.exit(1)}}page='out/golden'}
 page=path.resolve(ROOT,page);if(page.endsWith('.html'))page=path.dirname(page);
 const[srv,port]=await serve(page);fs.mkdirSync(GD,{recursive:true});if(!UPD)fs.rmSync(DD,{recursive:true,force:true});
 const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const ip=await b.newPage();await ip.setContent('<canvas></canvas>');await ip.evaluate(IMGJS);
 const dataBuf=u=>Buffer.from(u.split(',')[1],'base64'),dataUrl=f=>'data:image/png;base64,'+fs.readFileSync(f).toString('base64');
 const res=[];
 const prof=v=>v.city+(v.kind||(v.touch?'t':'d')),byCity={};for(const v of VIEWS)(byCity[prof(v)]=byCity[prof(v)]||[]).push(v);
 const groups=Object.values(byCity),POOL=+(arg('--jobs')||3);let gi=0;await Promise.all(Array.from({length:Math.min(POOL,groups.length)},async()=>{while(gi<groups.length){const vs=groups[gi++];
  // one page per (city, profile): race/menu change the page state, so each gets its own; plain views share one
  const pages={};
  for(const v of vs){try{
   let S=pages.p;if(!S)S=pages.p=await doView(b,port,v);const p=S.p;
   await p.evaluate(()=>{__gold.stopAt=0;__gold.release();__goldSeed(1337)});
   if(v.touch&&v.vp)await p.setViewportSize({width:v.vp[0],height:v.vp[1]});else if(v.touch)await p.setViewportSize({width:852,height:393});
   const stop=n=>p.evaluate(n=>{__gold.stopAt=n},n).then(()=>p.waitForFunction(()=>__gold.hold===1,null,{polling:100,timeout:120000}));   // the page holds itself at frame n of the fixed clock
   if(v.kind==='race'){await p.evaluate(()=>{__gold.start();__raceGo()});await stop(240)}
   else if(v.kind==='menu'){await p.evaluate(()=>document.getElementById('roamExit').click());await sleep(500);await p.evaluate(()=>{__gold.start();const e=[...document.querySelectorAll('button')].find(x=>x.offsetWidth&&/QUIT TO TITLE/.test(x.textContent));e.click()});await stop(240)}
   else{await p.evaluate(()=>{for(const e of document.querySelectorAll('button'))if(e.offsetWidth&&/^\s*OK\s*$/.test(e.textContent))e.click()});await p.evaluate(a=>{__gold.start();__mho.warp(a[0],a[1],a[2],1)},v.at);await stop(180)}
   await sleep(300);
   await p.evaluate(()=>{try{__tq.draw()}catch(e){}});await sleep(250);await p.evaluate(()=>{try{__tq.draw()}catch(e){}});
   const png=await p.screenshot({type:'png'});const dom=await p.evaluate(DOMRULES);
   const prep=await ip.evaluate(u=>G2.prep(u),'data:image/png;base64,'+png.toString('base64'));
   const R={n:v.n,fail:[],note:[]};const rl=prep.rules;
   if(rl.black>(v.blk||.02))R.fail.push('black '+(rl.black*100).toFixed(1)+'% > '+((v.blk||.02)*100)+'%');
   if(v.sky!==0&&rl.blueTop<.03)R.fail.push('sky not blue (blue share of top 40% '+(rl.blueTop*100).toFixed(1)+'%)');
   if(dom.over.length)R.fail.push('HUD overlaps touch controls: '+dom.over.join(', '));
   {const nw=dom.small.filter(t=>!KNOWN.some(k=>t.includes(k)));if(nw.length)R.fail.push('text < 12 px: '+nw.join(' | '));const kn=dom.small.filter(t=>KNOWN.some(k=>t.includes(k)));if(kn.length)R.note.push('KNOWN small text: '+kn.join(' | '))}
   if(S.E.length)R.note.push('page errors: '+S.E.slice(0,2).join(' | '));
   const bf=path.join(GD,v.n+'.png');
   if(UPD){fs.writeFileSync(bf,dataBuf(prep.png));R.note.push('baseline written')}
   else if(!fs.existsSync(bf))R.fail.push('no baseline (run --update)');
   else{const d=await ip.evaluate(a=>G2.diff(a[0],a[1],a[2],a[3],a[4],a[5]),[dataUrl(bf),prep.png,v.tol,D,v.sky!==0,v.kind!=='menu'&&v.kind!=='race']);
    if(d.why)R.fail.push(d.why);else{R.share=+d.share.toFixed(4);if(d.fail){R.fail.push(`pixel diff ${(d.share*100).toFixed(1)}% > ${(v.tol*100).toFixed(0)}% (mean ${d.mean.toFixed(1)})`);}
     if(d.fail||has('--keep-diff')){fs.mkdirSync(DD,{recursive:true});fs.writeFileSync(path.join(DD,v.n+'.png'),dataBuf(d.sheet))}}}
   res.push(R)}catch(e){res.push({n:v.n,fail:['ERROR '+String(e).slice(0,160)],note:[]})}}
  for(const S of Object.values(pages))await S.ctx.close().catch(()=>{})}}));
 res.sort((a,b)=>VIEWS.findIndex(v=>v.n===a.n)-VIEWS.findIndex(v=>v.n===b.n));
 let nf=0;for(const R of res){if(R.fail.length)nf++;console.log(`${R.fail.length?'FAIL':'PASS'} ${R.n}${R.share!=null?' diff '+(R.share*100).toFixed(1)+'%':''}${R.fail.length?' · '+R.fail.join(' · '):''}${R.note.length?' ['+R.note.join('; ')+']':''}`)}
 const sz=fs.readdirSync(GD).filter(f=>f.endsWith('.png')).reduce((a,f)=>a+fs.statSync(path.join(GD,f)).size,0);
 console.log(`GOLDEN ${UPD?'UPDATED':nf?'FAIL':'OK'}: ${res.length} views · ${nf} failing · baselines ${(sz/1e6).toFixed(2)} MB · ${((Date.now()-T0)/1000).toFixed(0)} s${nf&&!UPD?' · side-by-sides in docs/golden/diff/ (baseline | now | changed)':''}`);
 await b.close();srv.close();process.exit(UPD?0:nf?1:0)})();
