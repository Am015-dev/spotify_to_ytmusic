// rev45: og3 shots + probes, BUILT page, phone profile. node shots.js <url> <outdir> <tag> <cpu>
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const [URL_,OUT,TAG,CPU]=process.argv.slice(2);
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const c=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:1,isMobile:true,hasTouch:true,userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'});
 const p=await c.newPage();p.setDefaultTimeout(900000);let errs=0;p.on('pageerror',e=>{errs++;console.log('PAGEERR',String(e).slice(0,160))});
 const cdp=await c.newCDPSession(p);await p.goto(URL_+(URL_.includes('?')?'&':'?')+'test=fra');
 await p.waitForFunction(()=>window.__tq&&__tq.ready,null,{timeout:900000});
 const W=ms=>p.waitForTimeout(ms),Q=s=>p.evaluate(s=>__tk.q(s),s);await p.waitForFunction(()=>window.__tk,null,{timeout:900000});
 for(let k=0;k<200;k++){if(await Q(`state==='roam'&&RO.built&&!LD.busy`))break;await W(500)}
 if(+CPU>1)await cdp.send('Emulation.setCPUThrottlingRate',{rate:+CPU});
 const probe=`(()=>{const vis=e=>{if(!e||!e.checkVisibility||!e.checkVisibility({checkOpacity:true,checkVisibilityCSS:true}))return null;const r=e.getBoundingClientRect();return r.width>0&&r.height>0&&r.right>0&&r.bottom>0&&r.left<innerWidth&&r.top<innerHeight?r:null};
  const small=[],hud=[];for(const e of document.body.querySelectorAll('*')){if(e.closest('#touch')&&!/^t[A-Z]/.test(e.id))continue;const own=[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim());if(!own)continue;const r=vis(e);if(!r)continue;const f=parseFloat(getComputedStyle(e).fontSize);const nm=(e.id?'#'+e.id:e.tagName.toLowerCase()+(e.className&&typeof e.className==='string'?'.'+e.className.split(' ')[0]:''))+'"'+e.textContent.trim().slice(0,14)+'"';if(f<12)small.push(nm+' '+f+'px');hud.push([nm,r])}
  const ct=['tL','tR','tG','tB','tN','bxL','bxR','bxG','bxB'].map(i=>[i,vis(document.getElementById(i))]).filter(x=>x[1]);
  const B=window.__bx&&window.__bx.BX,bx=B&&B.on&&B.mode==='drive';const cam=bx?B.cam:camera,obj=bx?B.car:(pl&&pl.mesh);let car=null;
  if(cam&&obj){const bb=new THREE.Box3().setFromObject(obj),v=new THREE.Vector3();let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(let i=0;i<8;i++){v.set(i&1?bb.max.x:bb.min.x,i&2?bb.max.y:bb.min.y,i&4?bb.max.z:bb.min.z).project(cam);const X=(v.x+1)/2*innerWidth,Y=(1-v.y)/2*innerHeight;x0=Math.min(x0,X);x1=Math.max(x1,X);y0=Math.min(y0,Y);y1=Math.max(y1,Y)}car={left:x0,right:x1,top:y0,bottom:y1}}
  const ov=(a,b)=>Math.min(a.right,b.right)-Math.max(a.left,b.left)>2&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>2;
  const overT=[],overC=[];for(const[n,r]of hud){for(const[i,q]of ct)if(ov(r,q)&&!/^#t[A-Z]|^#bx[LRGB]"/.test(n))overT.push(n+'>'+i);if(car&&ov(r,car))overC.push(n)}
  const hk=document.getElementById('hk');return{mode:typeof HK_mode==='function'?HK_mode():'(no kit)',vp:innerWidth+'x'+innerHeight,gas:ct.some(x=>x[0]==='tG'||x[0]==='bxG'),small:[...new Set(small)].slice(0,12),overTouch:[...new Set(overT)].slice(0,8),overCar:[...new Set(overC)].slice(0,8),car:car&&[car.left,car.top,car.right,car.bottom].map(Math.round),hk:hk?hk.innerText.replace(/\\s+/g,' '):null}})()`;
 const both=async n=>{for(const[w,h,o]of[[852,393,'land'],[390,844,'port']]){await p.setViewportSize({width:w,height:h});await W(2500);await p.screenshot({path:`${OUT}/${TAG}_${n}_${o}.jpg`,type:'jpeg',quality:80});console.log('PROBE',TAG,n,o,JSON.stringify(await Q(probe)))}await p.setViewportSize({width:852,height:393});await W(800)};
 // 1 roam: drive a bit on GAS so the speed is non-zero
 await Q(`(()=>{const t=document.getElementById('tG');if(t){t.dispatchEvent(new TouchEvent('touchstart',{bubbles:true,touches:[]}))}})()`);
 const tg=await Q(`(()=>{const e=document.getElementById('tG');if(!e)return null;const r=e.getBoundingClientRect();return[r.x+r.width/2,r.y+r.height/2]})()`);
 if(tg){await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:tg[0],y:tg[1],id:1}]});await W(2500)}
 console.log('ROAM0',TAG,await Q(`JSON.stringify({touchHidden:document.getElementById('touch').hidden,TOUCHon:TOUCH.on})`));await both('1roam');if(tg)await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 // 2 Race Mode race
 await Q(`(()=>{const L=__rm.list(),i=Math.max(0,L.findIndex(n=>/race|grand/i.test(n)&&!/city|duel|sprint/i.test(n)));__rm.open(i)})()`);
 for(let k=0;k<300;k++){if(await Q(`state==='race'`))break;await W(200)}
 const tg2=await Q(`(()=>{const e=document.getElementById('tG');if(!e||!e.checkVisibility())return null;const r=e.getBoundingClientRect();return[r.x+r.width/2,r.y+r.height/2]})()`);
 if(tg2)await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:tg2[0],y:tg2[1],id:1}]});await W(3000);
 console.log('RACE',TAG,await Q(`JSON.stringify({thr:thrEff(),v:+(pl.v*3.6).toFixed(0),gasHeld:${!!tg2}})`));
 await both('2race');if(tg2)await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 // race without GAS: does the car move? (gas default on touch)
 await W(3000);console.log('RACE_NOGAS',TAG,await Q(`JSON.stringify({thr:thrEff(),v:+(pl.v*3.6).toFixed(0)})`));
 // 3 builder DRIVE
 await Q(`(typeof toMenu==='function'&&toMenu(),0)`);await W(1500);
 await Q(`(async()=>{try{await XC_need('98b2_builder2')}catch(e){}})()`);for(let k=0;k<100;k++){if(await Q(`!!(window.__bx&&__bx.raceStart)`))break;await W(200)}
 await Q(`__bx.raceStart('CLIFF RUN')`);await W(4000);
 const tg3=await Q(`(()=>{for(const i of['tG','bxG']){const e=document.getElementById(i);if(e&&e.checkVisibility()){const r=e.getBoundingClientRect();return[r.x+r.width/2,r.y+r.height/2]}}return null})()`);
 if(tg3){await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:tg3[0],y:tg3[1],id:1}]});await W(2500)}
 await both('3builder');if(tg3)await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 await Q(`(__bx.close(),0)`);await W(1500);await Q(`(enterRoam(),0)`);for(let k=0;k<120;k++){if(await Q(`state==='roam'&&!LD.busy`))break;await W(500)}await W(2000);
 console.log('AFTER_BUILDER',TAG,await Q(`JSON.stringify({state,touchHidden:document.getElementById('touch').hidden,TOUCHon:TOUCH.on,gasVis:!!(document.getElementById('tG')&&document.getElementById('tG').checkVisibility())})`));await p.screenshot({path:`${OUT}/${TAG}_4roam_after_builder_land.jpg`,type:'jpeg',quality:80});
 console.log('ERRS',TAG,errs);await b.close()})().catch(e=>{console.log('SCRIPT_ERR',String(e).slice(0,300));process.exit(1)});
