// tHudStack: left HUD stack shot + rect check. node tools/tHudStack.js <base url> <outdir> <tag>  (852x393 and 393x852, ?test=fra)
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');const [BASE,OUT,tag]=process.argv.slice(2);fs.mkdirSync(OUT,{recursive:true});
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 for(const [n,vp] of [['land',{width:852,height:393}],['port',{width:393,height:852}]]){
  const c=await b.newContext({viewport:vp,deviceScaleFactor:1,isMobile:true,hasTouch:true}),p=await c.newPage();p.setDefaultTimeout(600000);const errs=[];p.on('pageerror',e=>errs.push(String(e).slice(0,120)));
  await p.goto(BASE+'?test=fra');await p.waitForFunction(()=>window.__tk&&window.__tq&&__tq.ready);
  const Q=s=>p.evaluate(s=>__tk.q(s),s);
  await Q(`(()=>{const m=RO.marks.find(q=>q.kind==='quest'||q.kind==='collect')||RO.marks[0];RV14_near(m,10);CRSM.hn=0;window.__t=()=>{RO.pop={k:'smash',name:'SMASH 20',goal:20,lim:25,v:0,t:0,txt(){return '0/20'}};RO.pmNew=m;RO.pmT=2.5};__t();window.__iv=setInterval(__t,100)})()`);
  await p.waitForTimeout(2500);
  const r=await p.evaluate(()=>{const o={};for(const id of ['roamPrompt','roamPop','crSmHint']){const e=document.getElementById(id),cs=e&&getComputedStyle(e),r=e&&e.getBoundingClientRect();o[id]=e&&!e.hidden&&cs.display!=='none'&&(id!=='crSmHint'||e.classList.contains('on'))&&r.width>2?[r.left,r.top,r.right,r.bottom].map(Math.round):null}return o});
  const L=Object.entries(r).filter(([k,v])=>v);let ov=0;for(let i=0;i<L.length;i++)for(let j=i+1;j<L.length;j++){const a=L[i][1],c=L[j][1],w=Math.min(a[2],c[2])-Math.max(a[0],c[0]),h=Math.min(a[3],c[3])-Math.max(a[1],c[1]);if(w>1&&h>1)ov+=w*h}
  console.log(tag,n,JSON.stringify(r),'overlap_px2',ov,'errs',errs.length);
  await p.screenshot({path:`${OUT}/${tag}_${n}.png`});await c.close()}
 await b.close()})();
