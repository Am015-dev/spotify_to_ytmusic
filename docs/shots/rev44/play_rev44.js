// rev44 og2 loop with real CDP touch on the BUILT page, phone profile. node play.js <url> <outdir> <cpu>
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const [BASE,OUT,CPU]=process.argv.slice(2);
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const c=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:1,isMobile:true,hasTouch:true,userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'});
 const p=await c.newPage();p.setDefaultTimeout(900000);let errs=0;p.on('pageerror',e=>{errs++;console.log('PAGEERR',String(e).slice(0,160))});
 const cdp=await c.newCDPSession(p);
 await p.goto(BASE+'&test=fra');await p.waitForFunction(()=>window.__tq&&__tq.ready&&window.__tk,null,{timeout:900000});
 if(+CPU>1)await cdp.send('Emulation.setCPUThrottlingRate',{rate:+CPU});
 const Q=s=>p.evaluate(s=>__tk.q(s),s),W=ms=>p.waitForTimeout(ms),shot=n=>p.screenshot({path:OUT+'/'+n+'.jpg',type:'jpeg',quality:80});
 const ctr=async sel=>{const r=await p.evaluate(s=>{const e=document.querySelector(s);if(!e||!e.checkVisibility())return null;const b=e.getBoundingClientRect();return b.width?[b.x+b.width/2,b.y+b.height/2]:null},sel);return r};
 const tdown=async(sel,id=1)=>{const r=await ctr(sel);if(!r)return false;await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:r[0],y:r[1],id}]});DOWN=1;return r};
 let DOWN=0;const tup=async()=>{if(!DOWN)return;DOWN=0;return cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]})};
 const tap=async sel=>{const r=await tdown(sel);if(!r){console.log('NO TARGET',sel);return false}await W(90);await tup();return true};
 for(let k=0;k<100;k++){if(await Q(`state==='roam'&&RO.built&&!LD.busy`))break;await W(500)}
 // marker layout around the garage
 const lay=await Q(`(()=>{const g=MARKPOS.g_city||[0,0],o=RO.marks.filter(m=>m.og2).map(m=>({k:markKey(m),d:Math.round(Math.hypot(m.x-g[0],m.z-g[1])),t:markTitle(m)})),all=RO.marks.length,near=RO.marks.filter(m=>Math.hypot(m.x-g[0],m.z-g[1])<200).length;return JSON.stringify({og2:o,all,near200:near,spawnToGarage:Math.round(Math.hypot(RO.x-g[0],RO.z-g[1]))})})()`);console.log('LAYOUT',lay);
 // camera high above the garage cluster for an overview shot
 await shot('0_spawn');
 const trip=async(key,how,tag)=>{
  const m0=await Q(`(()=>{const m=RO.marks.find(q=>markKey(q)==='${key}');RO.x=m.x-Math.sin(m.h)*22;RO.z=m.z-Math.cos(m.h)*22;RO.h=RO.vh=m.h;RO.v=0;RO.y=groundAt(RO.x,RO.z,RO.y);RO.cool=0;camSnap=true;return [m.x,m.z,markTitle(m)]})()`);
  await W(1500);await shot(tag+'_1_marker_ahead');
  // drive into it with the real GAS pad, then brake
  const t0=Date.now();await tdown('#tG');let near=0;for(let k=0;k<400;k++){await W(250);const d=await Q(`Math.hypot(RO.x-(${m0[0]}),RO.z-(${m0[1]}))`);if(d<9){near=1;break}}await tup();
  await tdown('#tB');for(let k=0;k<40;k++){await W(250);if(await Q(`Math.abs(RO.v)<1`))break}await tup();
  const driveS=((Date.now()-t0)/1000).toFixed(1);let taps=0;
  for(let k=0;k<40;k++){if(await Q(`!$('#roamCard').hidden||!RQ_el().hidden`))break;await W(250)}
  await shot(tag+'_2_chip');const chip=await Q(`RQ_el().hidden?'':RQ_el().textContent`);console.log(tag,'drive s',driveS,'near',near,'chip',chip);
  if(await Q(`$('#roamCard').hidden`)){if(chip){await tap('#rqAsk');taps++}else{await Q(`roamOpen(RO.marks.find(q=>markKey(q)==='${key}'))`);taps++;console.log(tag,'NO CHIP: card opened by eval')}}
  await W(900);await shot(tag+'_2b_card');
  const pos0=await Q(`[RO.x,RO.z,RO.h]`);const cardTxt=await Q(`$('#roamCard').innerText.replace(/\\s+/g,' ').slice(0,160)`);
  await tap('#rcGo');taps++;const tr=Date.now();
  for(let k=0;k<120;k++){if(await Q(`['countdown','race'].includes(state)&&!!RC`))break;await W(250)}
  const loadS=((Date.now()-tr)/1000).toFixed(1);await W(2500);await shot(tag+'_3_race_start');
  await tdown('#tG');await W(6000);await shot(tag+'_4_race_drive');await tup();
  const rinfo=await Q(`RC?RC.type+'/'+(RC.world?RC.world.p:RC.track||'')+' state '+state+' v '+Math.round((pl&&pl.v)||0):'-'`);
  if(how==='quit'){await tap('#tP');await W(800);await shot(tag+'_5_pause');await tap('#quitBtn');taps++}
  else{await Q(`raceT=Math.max(raceT,236)`);for(let k=0;k<120;k++){if(await Q(`state==='results'&&!$('#roamBack').hidden`))break;await W(250)}await W(800);await shot(tag+'_5_results');const bt=await Q(`$('#roamBack').textContent`);console.log(tag,'results button',bt);await tap('#roamBack');taps++}
  const tb=Date.now();for(let k=0;k<80;k++){if(await Q(`state==='roam'&&RO.on&&!LD.busy`))break;await W(250)}const backS=((Date.now()-tb)/1000).toFixed(1);
  await W(1500);await shot(tag+'_6_back');
  const dlg=await Q(`[...document.querySelectorAll('.ov,.dlg,#story,#lvl,#levelUp,[id*=lvl],[id*=Level]')].filter(e=>!e.hidden&&e.offsetParent).map(e=>e.id||e.className).join('|')`);
  const after=await Q(`[RO.x,RO.z,RO.h,state,$('#menu').hidden]`);
  await W(2500);const reopen=await Q(`($('#roamCard').hidden?'':'CARD ')+(RQ_el().hidden?'':RQ_el().textContent)`);await shot(tag+'_7_back_plus4s');console.log(tag,'card/prompt again 4 s after return:',reopen);console.log('TRIP',JSON.stringify({key,how,title:m0[2],driveS,taps,loadS,race:rinfo,backS,dp:+Math.hypot(after[0]-pos0[0],after[1]-pos0[1]).toFixed(2),dh:+Math.abs(after[2]-pos0[2]).toFixed(3),state:after[3],menuHidden:after[4],overlays:dlg,card:cardTxt}));
  // dismiss any overlay with a real tap
  for(const s of ['#storyGo','#lvlGo']){if(await ctr(s)){await tap(s);await W(500)}}
 };
 await trip('rm_grand','finish','A');await trip('rm_cup','quit','B');
 console.log('CARS',await Q(`JSON.stringify({roamCar:typeof RO.car!=='undefined'&&RO.car&&RO.car.userData&&RO.car.userData.id,sel:typeof myCar!=='undefined'?myCar:null,save:store.peek('mho_car',null)})`));console.log('ERRS',errs);await b.close()})();
