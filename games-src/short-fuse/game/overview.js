// Phone overview check for other crew sizes (2, 3, 5 players) and watch mode: ring size, zoom wire size, screenshot. node overview.js WxH [np,np,...] [--watch]
const PW=require((process.env.PW||require('child_process').execSync('npm root -g').toString().trim()+'/playwright'));
const fs=require('fs'),path=require('path');const HERE=__dirname,OUT=path.join(HERE,'shots','ph');fs.mkdirSync(OUT,{recursive:true});
const html=fs.readFileSync(path.join(HERE,'shortfuse.html'));
const [W,H]=(process.argv[2]||'390x844').split('x').map(Number);const NPS=(process.argv[3]&&!process.argv[3].startsWith('--')?process.argv[3]:'2,3,5').split(',').map(Number);const WATCH=process.argv.includes('--watch');
(async()=>{const b=await PW.chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
for(const np of NPS){const ctx=await b.newContext({viewport:{width:W,height:H},deviceScaleFactor:1,isMobile:true,hasTouch:true});
  await ctx.route('**/*',r=>{const u=new URL(r.request().url());return u.host==='gns.test'?r.fulfill({status:200,contentType:'text/html',body:html}):r.abort()});
  const p=await ctx.newPage();p.setDefaultTimeout(120000);const errs=[];p.on('pageerror',e=>errs.push('pageerror '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/net::|Failed to load resource/.test(m.text()))errs.push(m.text())});
  await p.goto('https://gns.test/?phone=1');await p.waitForTimeout(1200);await p.evaluate(()=>{try{localStorage.clear()}catch(e){}setSeed(5);setAiSeed(5);AIDELAY=60});
  await p.evaluate(([n,watch])=>{showStart();UI.setup.job=9;UI.setup.np=n;UI.setup.seats=watch?['ai','ai','ai','ai','ai']:['human','ai','ai','ai','ai'];renderStart()},[np,WATCH]);await p.waitForTimeout(300);
  await p.tap('[data-a=start]');await p.waitForTimeout(1500);
  for(let k=0;k<8;k++){const c=await p.evaluate(()=>{const b=document.querySelector('#pc:not([hidden]) [data-a=briefok],#pc:not([hidden]) [data-a=q]');if(b){b.click();return 1}return 0});if(!c)break;await p.waitForTimeout(500)}
  if(WATCH){await p.evaluate(()=>{AIDELAY=300;});await p.waitForTimeout(2500)}
  else for(let k=0;k<80;k++){const s=await p.evaluate(()=>!!(UI.V&&UI.V.legal&&decider()===UI.V.seat)||!!G.over);if(s)break;await p.waitForTimeout(300)}
  await p.waitForTimeout(1200);
  const m=await p.evaluate(()=>{const K=SFKit._K;SFKit.renderOnce();const C=document.querySelector('#c3').getBoundingClientRect();const v=new THREE.Vector3();const pj=(x,y,z)=>{v.set(x,y,z).project(K.cam);return [C.left+(v.x+1)/2*C.width,C.top+(1-v.y)/2*C.height]};
    let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const r of K.rows){if(!r.m)continue;const c=Math.cos(r.rot),s=Math.sin(r.rot);const hw=(r.m*1.13+.5)*r.s/2;for(const du of[-.5,2.5])for(const dx of[-hw,hw]){const w=[dx*c+du*r.s*s+r.px,-dx*s+du*r.s*c+r.pz];const P=pj(w[0],.2,w[1]);x0=Math.min(x0,P[0]);x1=Math.max(x1,P[0]);y0=Math.min(y0,P[1]);y1=Math.max(y1,P[1])}}
    return {canvas:[Math.round(C.width),Math.round(C.height)],ring:[Math.round(x1-x0),Math.round(y1-y0)],rows:K.rows.filter(r=>r.m).map(r=>[r.key,r.m,+r.s.toFixed(2)]),mode:K.layout.mode,scroll:[document.documentElement.scrollHeight,document.documentElement.scrollWidth]}});
  console.log(W+'x'+H,'np',np,WATCH?'watch':'solo',JSON.stringify(m));
  await p.screenshot({path:path.join(OUT,`O_${W}x${H}_np${np}${WATCH?'_watch':''}.png`),timeout:150000});
  // zoom to the first crewmate rack and measure the wire
  const z=await p.evaluate(()=>{const r=pxRows()[0];if(!r)return null;pxZoomTo(r,null);return r.key});
  if(z){for(let k=0;k<40;k++){if(await p.evaluate(()=>!PX.cam))break;await p.waitForTimeout(150)}await p.waitForTimeout(800);
    await p.screenshot({path:path.join(OUT,`O_${W}x${H}_np${np}${WATCH?'_watch':''}_zoom.png`),timeout:150000});console.log(W+'x'+H,'np',np,'zoomed on',z)}
  console.log('errors',JSON.stringify(errs.slice(0,3)));await ctx.close()}
await b.close()})().catch(e=>{console.error('FATAL',e);process.exit(1)});
