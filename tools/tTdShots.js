// raceG: Takedown race shots on the BUILT page. node tools/tTdShots.js <base url> <outdir> [por]  -> td_action.jpg (staged takedown mid-race), td_result.jpg (852x393) or por_td_action.jpg (393x852)
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');const [BASE,OUT,mode]=process.argv.slice(2);fs.mkdirSync(OUT,{recursive:true});
const BOT=(t=>t.slice(t.indexOf('function tkBot'),t.indexOf('function tkStaticFeel')))(fs.readFileSync(__dirname+'/../src/98tk_go.js','utf8'));
(async()=>{const por=mode==='por',b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const c=await b.newContext({viewport:por?{width:393,height:852}:{width:852,height:393},deviceScaleFactor:1,isMobile:true,hasTouch:true});const p=await c.newPage();p.setDefaultTimeout(900000);
 const errs=[];p.on('pageerror',e=>errs.push(String(e).slice(0,160)));const shot=n=>p.screenshot({path:OUT+'/'+(por?'por_':'')+n+'.jpg',type:'jpeg',quality:80});
 await p.goto(BASE+'?test=fra&td=1');await p.waitForFunction(()=>window.__tk&&window.__tq&&__tq.ready,null,{timeout:600000});await p.waitForTimeout(2500);
 const Q=s=>p.evaluate(s=>__tk.q(s),s);await Q(BOT+';window.tkBotX=tkBot');
 console.log('start',await Q(`(()=>{TDR.sel=true;menuTrack='grand';const C=tkBuild(tkQuickSpec());tkStart({kind:'quick',ev:null},C);const sp=RO.sp;sp.cd=0;window._bot=tkBotX(tkGeoOf(sp.C).pA,{lag:.15});tkRun(25,s=>_bot(s));return !!sp.td})()`));
 await p.waitForTimeout(3000);
 console.log('stage',await Q(`(()=>{const sp=RO.sp;const a=sp.ai.slice().sort((x,y)=>Math.hypot(x.g.position.x-RO.x,x.g.position.z-RO.z)-Math.hypot(y.g.position.x-RO.x,y.g.position.z-RO.z))[0];const h=RO.h,p=a.g.position;
   RO.x=p.x-Math.sin(h)*5;RO.z=p.z-Math.cos(h)*5;RO.y=a.y;RO.v=26;a.v=12;a.tdCd=0;a.stun=0;tdContact(sp,1/30);return sp.td.n})()`));
 await p.waitForTimeout(60);await shot('td_action');
 if(!por&&mode!=='act'){console.log('fin',await Q(`(()=>{tkRun(320,s=>_bot(s));return JSON.stringify(TK.last)})()`));await p.waitForTimeout(3000);await shot('td_result')}
 console.log('errors',errs.length,errs[0]||'');await b.close()})();
