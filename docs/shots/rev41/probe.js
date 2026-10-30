// rev41 probe: Athens ridge state + 852x393 shots at two spots. node probe.js <url> <outprefix>
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const [U,O]=process.argv.slice(2);
 const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const ctx=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:1,isMobile:true,hasTouch:true,userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'});
 const p=await ctx.newPage();p.setDefaultTimeout(400000);const errs=[];p.on('pageerror',e=>errs.push(String(e.message).slice(0,90)));p.on('console',m=>{if(m.type()==='error')errs.push(m.text().slice(0,90))});
 const cdp=await ctx.newCDPSession(p);await cdp.send('Emulation.setCPUThrottlingRate',{rate:6});
 await p.goto(U+'?test=ath');await p.waitForFunction(()=>window.__chk&&window.__tq&&__tq.ready,null,{timeout:400000});
 await cdp.send('Emulation.setCPUThrottlingRate',{rate:1});await p.waitForTimeout(4000);
 const st=()=>p.evaluate(()=>__xc.ev("(()=>{const R=HUB.ridge;let m=null;R&&R.traverse(o=>{if(o.isMesh&&o.userData.ridge)m=o});if(!m)return{noRidge:1};const g=m.geometry,c=g.attributes.color,P=g.attributes.position;\n  const e=(typeof MEMF!=='undefined'?MEMF.S:[]).find(q=>q.m===m);let top=null,low=null;if(c.array&&P.array)for(let i=0;i<P.count;i++){const y=P.getY(i);if(y>-39&&!top)top=[c.getX(i),c.getY(i),c.getZ(i)].map(v=>+v.toFixed(3));if(y<=-39&&!low)low=[c.getX(i),c.getY(i),c.getZ(i)].map(v=>+v.toFixed(3));if(top&&low)break}\n  return{rc:R.userData.rc,cam:[camera.position.x|0,camera.position.z|0],ridgePos:[R.position.x|0,R.position.z|0],scale:+R.scale.y.toFixed(2),visible:m.visible,layers:m.layers.mask,memf:e?{x:e.x|0,z:e.z|0,r:e.r|0,on:e.on,ro:e.ro|0,d:(Math.hypot(e.x-camera.position.x,e.z-camera.position.z)-e.r)|0}:'none',colorType:c.array?c.array.constructor.name:'freed',top,low,wantTop:[.31,.365,.502].map(v=>+v.toFixed(3)),mood:window.MOOD&&MOOD.k||window.TOD&&TOD.k||null}})()"));
 const out={};
 const spots=[['B_spawn',null],['A_origin',[0,150,0.8]]];
 for(const [n,s] of spots){if(s){await p.evaluate(s=>__xc.ev('roamWarp('+s.join(',')+',true)'),s);await p.waitForTimeout(6000)}
  await p.evaluate(()=>{try{__tq.draw()}catch(e){}});out[n]=await st();await p.screenshot({path:O+'_'+n+'.png'})}
 out.errs=errs.slice(0,5);console.log(JSON.stringify(out));await b.close()})().catch(e=>{console.error('PROBE ERR',e.message);process.exit(1)});
