// tCamGo: the cam: checklist tests (src/99c_checklist.js v90n/cam-go-*), automated. Each test runs the item's 📍 GO spawn (CAM_go: the ride on a straight
// Frankfurt street / on foot), waits for the camera to settle, then measures what the player sees (__cam.meas: real camera, 3D): the road point 10 m past
// the nose is not hidden by the ride (raycast) and sits in the lower middle (x 1/3-2/3, y 40-85 % from the top); the ride fills 15-35 % of the screen
// height. Same in portrait 393×852. bus/sport also drive 5 s with REAL keys (gas, then steer) and check the camera moves smoothly; 'switch' swaps
// sport → bus and checks the camera eases (no step > 0.5 m per 50 ms). Prints PASS/FAIL lines and "GO n/m".
//   node tools/tCamGo.js <url …/index.html> [outdir] [tests: sport,bus,flatbed,truck,foot,switch]   env SHOTS=1 (bus+sport shots), BEFORE=1 (old camera)
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
const BASE=process.argv[2],OUT=process.argv[3]||'qa_camgo',ONLY=(process.argv[4]||'sport,bus,flatbed,truck,foot,switch').split(','),SHOTS=process.env.SHOTS==='1',BEFORE=process.env.BEFORE==='1';fs.mkdirSync(OUT,{recursive:true});
let nOk=0,nAll=0;const ok=(t,c,m,i)=>{nAll++;if(c)nOk++;console.log((c?'PASS ':'FAIL ')+t+' · '+m+(i!==undefined?' · '+JSON.stringify(i):''))};
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const ctx=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:1});const p=await ctx.newPage();p.setDefaultTimeout(180000);
 const errs=[];p.on('pageerror',e=>errs.push(String(e).slice(0,200)));p.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text().slice(0,200))});
 const W=ms=>p.waitForTimeout(ms);const t0=Date.now();
 await p.goto(BASE+(BASE.includes('?')?'&':'?')+'test=fra&draw=0');await p.waitForFunction(()=>window.__tq&&__tq.ready&&window.__cam,null,{polling:250,timeout:180000});
 console.log('BOOT fra '+((Date.now()-t0)/1000).toFixed(1)+' s');if(BEFORE)await p.evaluate(()=>{__cam.S.on=0});
 const go=async k=>{const said=await p.evaluate(k=>__cam.go(k),k);await p.waitForFunction(()=>__cam.S.go&&__cam.S.go.done,null,{polling:200,timeout:90000});const g=await p.evaluate(()=>({sel:__cam.sel(),road:__cam.S.go.road,foot:__mho.foot&&__mho.foot.state}));console.log(`GO ${k}: "${said}" ${JSON.stringify(g)}`);return g};
 const M=()=>p.evaluate(()=>__cam.meas());const cp=()=>p.evaluate(()=>__cam.cp());
 const view=async(T,tag)=>{const m=await M();if(!m){ok(T,false,tag+' measure',null);return null}
  ok(T,!m.road.blocked,tag+': road 10 m past the nose not hidden by the ride',{by:m.road.by,cam:m.cam,P:m.P});
  ok(T,m.road.x>=1/3&&m.road.x<=2/3&&m.road.y>=.4&&m.road.y<=.85,tag+': that road point is in the lower middle (x 33-67 %, y 40-85 %)',m.road);
  ok(T,m.fill>=.15&&m.fill<=.35,tag+': ride fills 15-35 % of the screen height',{fill:m.fill,top:m.top,bot:m.bot});return m};
 const shot=async f=>{if(!SHOTS)return;await p.evaluate(()=>__tq.draw()).catch(()=>{});await W(300);await p.screenshot({path:OUT+'/'+f,type:'jpeg',quality:75})};
 const drive=async T=>{const S=[];const smp=async ms=>{const e=Date.now()+ms;while(Date.now()<e){S.push(await cp());await W(50)}};
  await p.keyboard.down('ArrowUp');await smp(3000);await p.keyboard.down('ArrowLeft');await smp(2000);await p.keyboard.up('ArrowLeft');await p.keyboard.up('ArrowUp');
  const d=Math.hypot(S[S.length-1].x-S[0].x,S[S.length-1].z-S[0].z);let jb=0,jh=0;for(let i=1;i<S.length;i++){jb=Math.max(jb,Math.abs(S[i].b-S[i-1].b));jh=Math.max(jh,Math.abs(S[i].h-S[i-1].h))}
  ok(T,d>=10,'drive 5 s (gas, then steer): the ride moves ≥ 10 m',{d:+d.toFixed(1)});ok(T,jb<.8&&jh<.6,'camera follows smoothly (no step > 0.8 m back / 0.6 m up per 50 ms)',{jb:+jb.toFixed(2),jh:+jh.toFixed(2)})};
 const ride=async(k,T)=>{await go(k);await W(4000);await view(T,'landscape 852×393');await shot('cam_'+k+'.jpg');
  if(k==='bus'||k==='sport'||k==='foot'){}await p.setViewportSize({width:393,height:852});await W(3500);await view(T,'portrait 393×852');await p.setViewportSize({width:852,height:393});await W(2500)};
 try{
 for(const k of['sport','bus','flatbed','truck','foot'])if(ONLY.includes(k)){await ride(k,k);if(k==='bus'||k==='sport'){await go(k);await W(3000);await drive(k)}}
 if(ONLY.includes('switch')){const T='switch';await go('sport');await W(4000);const b0=(await cp()).b;await go('bus');const S=[];const e=Date.now()+4500;while(Date.now()<e){S.push(await cp());await W(50)}
  let jb=0,jh=0;for(let i=1;i<S.length;i++){jb=Math.max(jb,Math.abs(S[i].b-S[i-1].b));jh=Math.max(jh,Math.abs(S[i].h-S[i-1].h))}const b1=S[S.length-1].b;
  ok(T,Math.abs(b1-S[0].b)>1||BEFORE,'the camera re-frames for the bus (moves back > 1 m)',{b0:+b0.toFixed(2),start:+S[0].b.toFixed(2),end:+b1.toFixed(2)});ok(T,jb<.5&&jh<.5,'it eases in: no step > 0.5 m per 50 ms',{jb:+jb.toFixed(2),jh:+jh.toFixed(2)})}
 }catch(e){console.log('ERROR '+String(e).slice(0,300))}
 ok('all',errs.length===0,'no console errors',errs.slice(0,3));console.log(`GO ${nOk}/${nAll}`);await b.close()})();
