// tRv2k2 (review 2K #2): play the BUILT page like a player and measure. node tools/tRv2k2.js <base url> <outdir> <fra|ath|por|cold>
// fra: roam shot + road-follow 30 s + Westend Split (bot 150 ms lag, then hands-off) + Main River Run (boat) + garage + builder. ath: roam + Akropolis final. por: 393x852. cold: real menu path timing.
// Prints one JSON line per measurement (R {...}). Shots 852x393 jpg.
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');const [BASE,OUT,mode]=process.argv.slice(2);fs.mkdirSync(OUT,{recursive:true});
const BOT=(t=>t.slice(t.indexOf('function tkRock'),t.indexOf('function tkStaticFeel')))(fs.readFileSync(__dirname+'/../src/98tk_go.js','utf8'));
(async()=>{const por=mode==='por',b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const c=await b.newContext({viewport:por?{width:393,height:852}:{width:852,height:393},deviceScaleFactor:1,isMobile:true,hasTouch:true});const p=await c.newPage();p.setDefaultTimeout(900000);
 const errs=[];p.on('pageerror',e=>errs.push(String(e).slice(0,160)));const R=(k,o)=>console.log('R '+k+' '+JSON.stringify(o));const shot=n=>p.screenshot({path:OUT+'/'+(por?'por_':'')+n+'.jpg',type:'jpeg',quality:80});const T0=Date.now();
 if(mode==='cold'){await p.goto(BASE);let menu=0;for(let i=0;i<240&&!menu;i++){await p.waitForTimeout(500);menu=await p.evaluate(()=>[...document.querySelectorAll('button')].some(e=>/STORY/.test(e.innerText)&&e.offsetParent))}
  R('cold',{menuS:(Date.now()-T0)/1000,btns:await p.evaluate(()=>[...document.querySelectorAll('button')].filter(e=>e.offsetParent).map(e=>e.innerText.replace(/\s+/g,' ').slice(0,20)).slice(0,14))});await shot('a_menu');
  await b.close();return}
 const city=mode==='ath'?'ath':'fra';await p.goto(BASE+'?test='+city);await p.waitForFunction(()=>window.__tk&&window.__tq&&__tq.ready,null,{timeout:600000});R('boot',{s:(Date.now()-T0)/1000});await p.waitForTimeout(2500);
 const Q=s=>p.evaluate(s=>__tk.q(s),s);await Q(BOT+';window.tkBotX=tkBot');
 const life=()=>Q(`(()=>{let n=0,mv=0;for(const c of (HUB.cars||[])){if(c.dead>0)continue;const x=c.x!=null?c.x:c.p&&c.p.x,z=c.z!=null?c.z:c.p&&c.p.z;if(x==null)continue;if(Math.hypot(x-RO.x,z-RO.z)<120){n++;if(Math.abs(c.v||c.spd||0)>1)mv++}}return{traf:(HUB.cars||[]).length,near120:n,moving:mv}})()`).catch(e=>({err:String(e).slice(0,80)}));
 await shot(city+'_roam');R(city+'_life',await life());
 // road-follow 30 s sim, real roamStep (same law as RV2K_drive), counts speed drops (> 14 m/s to < half) as hits
 const rf=await Q(`(()=>{const W=a=>Math.atan2(Math.sin(a),Math.cos(a));let t=0,hits=0,pv=0,sum=0,hp=100,n=0;for(;t<30;t+=1/30){const la=12+RO.v*.9,q=rfSnap(RO.x+Math.sin(RO.h)*la,RO.z+Math.cos(RO.h)*la,60),e=q?W(Math.atan2(q[0]-RO.x,q[1]-RO.z)-RO.h):0;K.KeyW=K.ArrowUp=true;K.ArrowLeft=e>.06;K.ArrowRight=e<-.06;roamStep(1/30);if(pv>14&&RO.v<pv*.5)hits++;pv=RO.v;sum+=RO.v;n++;hp=Math.min(hp,RO.hp)}K.KeyW=K.ArrowUp=K.ArrowLeft=K.ArrowRight=false;return{avgKmh:Math.round(sum/n*3.6),hits,lowHp:Math.round(hp),x:Math.round(RO.x),z:Math.round(RO.z)}})()`);R(city+'_roadfollow30',rf);await p.waitForTimeout(1500);await shot(city+'_drive');R(city+'_life_after',await life());
 // race runner: bot (lag .15) or hands-off; samples lead changes and the gap every second
 const race=async(lbl,startJs,route,handsOff,shots)=>{const r=await Q(`(()=>{const C0=${startJs};if(!C0||!C0.C)return{none:1};if(RO.sp)try{sprintEnd()}catch(e){};tkStart(C0.m,C0.C);const sp=RO.sp;sp.cd=0;const G=tkGeoOf(C0.C);const bot=tkBotX(G.${route},{lag:.15});
   let lc=0,sg=0,gaps=[],veh=new Set,acc=0;window.__rc={sp,bot,lc:0,gaps,veh,name:C0.C.name,ho:${handsOff?1:0}};return{name:C0.C.name,len:Math.round(tkLen(G.${route}))}})()`);if(r.none){R(lbl,r);return}
  for(let k=0;k<(shots||1);k++){await Q(`(()=>{const o=__rc,sp=o.sp;let acc=0;for(let i=0;i<30*${Math.round(300/(shots||1))}&&RO.sp===sp&&!sp.done;i++){if(!o.ho)o.bot(sp);if(RO.veh)o.veh.add(RO.veh);roamStep(1/30);acc+=1/30;if(acc>=1){acc=0;const a=sp.ai[0];if(a){const d=Math.sign((sp.myS||0)-(a.s||0));if(o.sg&&d&&d!==o.sg)o.lc++;if(d)o.sg=d;o.gaps.push(Math.round((sp.myS||0)-(a.s||0)))}}}K.ArrowUp=K.KeyW=K.ArrowLeft=K.ArrowRight=K.ArrowDown=false;return 1})()`);
   await p.waitForTimeout(1200);await shot(lbl+'_'+k)}
  const o=await Q(`(()=>{const o=__rc,r=TK.last,g=o.gaps,ab=g.map(Math.abs);const res={name:o.name,handsOff:!!o.ho,fin:!!r,place:r&&r.place,t:r&&r.t,dnf:r&&r.dnf,leadChanges:o.lc,gapMedian:ab.sort((a,b)=>a-b)[ab.length>>1],gapMaxAhead:Math.max(0,...g),gapMaxBehind:Math.min(0,...g),secsSampled:g.length,veh:[...o.veh].join('/'),walls:o.bot.R.walls,stuck:o.bot.R.stuck.length,prog:Math.round(o.bot.R.maxS)};try{$('#spRes').hidden=true}catch(e){}if(RO.sp===o.sp)try{sprintEnd()}catch(e){}return res})()`);R(lbl,o)};
 if(city==='fra'&&!por){
  await race('westend_bot',`{C:TK_C,m:tkMarkOf(RIVAL_EV.find(e=>e.p===TK_C.p))}`,'pA',0,3);
  await race('westend_handsoff',`{C:TK_C,m:tkMarkOf(RIVAL_EV.find(e=>e.p===TK_C.p))}`,'pA',1,1);
  await race('river_bot',`{C:tkBuild({key:'rival:water-rv2',kind:'quick',name:'Main River Run',ai:['WEBER'],water:true}),m:{kind:'quick',ev:null}}`,'pB',0,3);
  await Q(`(()=>{const sv=menuTrack;menuTrack='grand';const C=tkBuild(tkQuickSpec());menuTrack=sv;window.__qC=C;return 1})()`).catch(()=>{});
  await race('quick_grand_bot',`{C:window.__qC,m:{kind:'quick',ev:null}}`,'pA',0,1);
  await Q(`(()=>{roamWarp(RO.x,RO.z,RO.h,true);gbOpen();return 1})()`);await p.waitForTimeout(12000);await shot('garage');
  await p.evaluate(()=>{for(const e of document.querySelectorAll('button'))if(/BUILD$/.test(e.innerText.trim())&&e.getBoundingClientRect().left<90){e.click();break}});await p.waitForTimeout(6000);await shot('builder');
  R('garage_ui',await p.evaluate(()=>({tiles:document.querySelectorAll('#gbBkPc .gbPc').length,cards:document.querySelectorAll('#g9Col .g9Card').length,smallText:[...document.querySelectorAll('#gbx *')].filter(e=>e.offsetParent&&e.childNodes[0]&&e.childNodes[0].nodeType===3&&e.textContent.trim()&&parseFloat(getComputedStyle(e).fontSize)<12).length})))}
 if(city==='ath'){const ok=await Q(`(()=>{const m=tkMarkOf(ATH_BOSS_EV);const C=tkCourseOf(m);window.__aC=C?{C,m}:null;return !!C})()`);
  if(ok){await race('akropolis_bot',`window.__aC`,'pA',0,3);await race('akropolis_handsoff',`window.__aC`,'pA',1,1)}else R('akropolis',{none:1})}
 if(por){await race('portrait_westend',`{C:TK_C,m:tkMarkOf(RIVAL_EV.find(e=>e.p===TK_C.p))}`,'pA',0,1);
  R('portrait_ui',await p.evaluate(()=>{const v=[...document.querySelectorAll('body *')].filter(e=>e.offsetParent&&e.childNodes[0]&&e.childNodes[0].nodeType===3&&e.textContent.trim());return{tiny:v.filter(e=>parseFloat(getComputedStyle(e).fontSize)<12).map(e=>e.textContent.trim().slice(0,16)).slice(0,10)}}))}
 R('errors',errs.slice(0,5));await b.close()})();
