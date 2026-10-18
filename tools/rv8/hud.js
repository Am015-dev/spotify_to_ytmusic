// rv8 hud (review #8): node tools/rv8/hud.js <url> <fra|ath> <WxH> <outdir>
// Lists visible text under 12 px and overlapping HUD boxes on: the menu (cold boot), roam HUD, race HUD (bot-driven 20 s);
// then touches every race item box (player pickup) and logs JS errors. One JSON line; shots <outdir>/<city>_<WxH>_{menu,roam,race}.jpg
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
const [U,C,VP,OUT]=process.argv.slice(2);const [VW,VH]=VP.split('x').map(Number);fs.mkdirSync(OUT,{recursive:true});
const BOT=(t=>t.slice(t.indexOf('function tkRock'),t.indexOf('function tkStaticFeel')))(fs.readFileSync(__dirname+'/../../src/98tk_go.js','utf8'));
const TXT=()=>{const v=[...document.querySelectorAll('body *')].filter(e=>{if(!e.offsetParent&&getComputedStyle(e).position!=='fixed')return false;const r=e.getBoundingClientRect();if(r.width<1||r.height<1||r.right<0||r.bottom<0||r.left>innerWidth||r.top>innerHeight)return false;const cs=getComputedStyle(e);if(cs.visibility==='hidden'||+cs.opacity===0)return false;return [...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())});
 const tiny=v.filter(e=>parseFloat(getComputedStyle(e).fontSize)<12).map(e=>e.textContent.trim().replace(/\s+/g,' ').slice(0,18)+'@'+getComputedStyle(e).fontSize);
 const clip=v.filter(e=>e.scrollWidth>e.clientWidth+2&&/ellipsis/.test(getComputedStyle(e).textOverflow)).map(e=>e.textContent.trim().slice(0,30));
 return{n:v.length,tiny:[...new Set(tiny)].slice(0,14),tinyN:tiny.length,clipped:clip.slice(0,6)}};
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const mob=VW<1000;
 const c=await b.newContext({viewport:{width:VW,height:VH},deviceScaleFactor:1,isMobile:mob,hasTouch:mob});const p=await c.newPage();p.setDefaultTimeout(900000);
 const errs=[];p.on('pageerror',e=>errs.push(String(e).slice(0,200)));p.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text().slice(0,160))});
 const res={city:C,vp:VP};const shot=n=>p.screenshot({path:`${OUT}/${C}_${VP}_${n}.jpg`,type:'jpeg',quality:80});
 // menu: cold boot, no test flag
 await p.goto(U);let menu=0;for(let i=0;i<300&&!menu;i++){await p.waitForTimeout(500);menu=await p.evaluate(()=>[...document.querySelectorAll('button')].some(e=>/STORY|PLAY|FREE/.test(e.innerText)&&e.offsetParent))}
 res.menuS=menu?'ok':'none';res.menu=await p.evaluate(TXT);await shot('menu');
 await p.goto(U+'?test='+C);await p.waitForFunction(()=>window.__tk&&window.__tq&&__tq.ready,null,{timeout:900000});await p.waitForTimeout(3000);
 res.roam=await p.evaluate(TXT);await shot('roam');
 const Q=s=>p.evaluate(s=>__tk.q(s),s);await Q(BOT+';window.tkBotX=tkBot');
 const st=await Q(`(()=>{const C0=${C==='ath'?'(()=>{const m=tkMarkOf(ATH_BOSS_EV);return {C:tkCourseOf(m),m}})()':'{C:TK_C,m:tkMarkOf(RIVAL_EV.find(e=>e.p===TK_C.p))}'};if(!C0.C)return{none:1};tkStart(C0.m,C0.C);const sp=RO.sp;sp.cd=0;const G=tkGeoOf(C0.C);window.__b=tkBotX(G.pA,{lag:.15});window.__sp=sp;return{name:C0.C.name,items:sp.items.length,pads:sp.pads.length}})()`);
 res.race=st;if(!st.none){await Q(`(()=>{for(let i=0;i<600&&RO.sp===__sp;i++){__b(__sp);roamStep(1/30)}return 1})()`);await p.waitForTimeout(1500);res.raceHud=await p.evaluate(TXT);await shot('race');
  res.items=await Q(`(()=>{const sp=__sp,log=[];let err=0,e1='';for(const it of sp.items){it.cd=0;RO.x=it.x;RO.z=it.z;const f0=sp.fired||0;for(let k=0;k<4;k++){try{roamStep(1/30)}catch(e){err++;if(!e1)e1=String(e).slice(0,200)}}log.push((sp.fired||0)-f0)}for(let k=0;k<90;k++){try{__b(sp);roamStep(1/30)}catch(e){err++;if(!e1)e1=String(e).slice(0,200)}}return{boxes:sp.items.length,fired:log.reduce((a,b)=>a+b,0),err,e1,inRace:RO.sp===sp}})()`)}
 res.errs=errs.slice(0,8);console.log(JSON.stringify(res));await b.close()})().catch(e=>{console.log('ERR '+e.message);process.exit(1)});
