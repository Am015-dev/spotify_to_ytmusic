const {chromium}=require('playwright');
const UA='Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';
const [url,out]=process.argv.slice(2);const Q=(p,s)=>p.evaluate(c=>__tk.q(c),s);
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:2,isMobile:true,hasTouch:true,userAgent:UA});
 const p=await ctx.newPage();p.setDefaultTimeout(600000);const cdp=await ctx.newCDPSession(p);await cdp.send('Emulation.setCPUThrottlingRate',{rate:6});
 await p.goto(url);await p.waitForSelector('#ob2Play',{state:'visible'});await p.waitForTimeout(800);
 let bx=await p.locator('#ob2Play').boundingBox();await p.touchscreen.tap(bx.x+bx.width/2,bx.y+bx.height/2);
 await p.waitForFunction(()=>window.__tk&&__tk.q('typeof RO!=="undefined"&&RO.on&&!RO.frozen&&!RO.bootHold'),null,{polling:100});
 await cdp.send('Emulation.setCPUThrottlingRate',{rate:1});
 // hold GAS (real touch on #tG) until the garage mark is <= 24 m away
 const g=await p.locator('#tG').boundingBox();await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:g.x+g.width/2,y:g.y+g.height/2,id:1}]});
 const D="(()=>{const m=RO.marks.find(q=>q.kind==='garage');return +Math.hypot(m.x-RO.x,m.z-RO.z).toFixed(1)})()";let d=999;const t0=Date.now();
 while(Date.now()-t0<240000){d=await Q(p,D);if(d<=26)break;await p.waitForTimeout(250)}
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});console.log('GARAGE d',d,'after',((Date.now()-t0)/1000)|0,'s');
 await p.screenshot({path:out+'_garage_drive.jpg',quality:80});
 // camprop lab view (= WRG_camprop's first prop, the worker's staged shot): identify the black rectangle and the high bricks by raycast
 const r=await Q(p,`(()=>{const P=WRG_props?null:null;return 1})()`).catch(e=>String(e));
 const lab=await Q(p,`(()=>{const L=[];for(const l of HUB.pgrid.values())for(const p of l)if(p.im&&p.alive!==false&&p.t!=='lamp'&&!CVF_RX.test(p.t)&&FC_body(p)[0]&&FC_body(p)[2]-FC_body(p)[1]>1.4)L.push(p);
  L.sort((a,b)=>Math.hypot(a.x-RO.x,a.z-RO.z)-Math.hypot(b.x-RO.x,b.z-RO.z));const p=L[0];if(!p)return 'no prop';RO.x=p.x+5.5;RO.z=p.z;RO.h=Math.PI/2;RO.vh=RO.h;RO.v=0;RO.y=groundY(RO.x,RO.z);camSnap=true;for(let i=0;i<40;i++)roamCam(1/30);
  return {t:p.t,x:+p.x.toFixed(1),z:+p.z.toFixed(1)}})()`);console.log('LAB',JSON.stringify(lab));
 await p.waitForTimeout(3000);await p.screenshot({path:out+'_camprop_lab.jpg',quality:80});
 const hit=await Q(p,`(()=>{const rc=new THREE.Raycaster(),o=[];for(const [sx,sy] of [[.85,.35],[.92,.5],[.75,.4],[.36,.05],[.52,.1],[.6,.05]]){rc.setFromCamera(new THREE.Vector2(sx*2-1,-(sy*2-1)),camera);const h=rc.intersectObjects(scene.children,true).filter(x=>x.object.visible)[0];
  if(!h){o.push([sx,sy,'sky']);continue}const ob=h.object,m=Array.isArray(ob.material)?ob.material[0]:ob.material;let n=ob,path=[];while(n&&path.length<4){path.push(n.name||n.type);n=n.parent}
  o.push([sx,sy,+h.distance.toFixed(1),path.join('<'),m&&m.type,m&&m.color&&m.color.getHexString(),m&&m.map?'map':'nomap',ob.isInstancedMesh?'inst'+h.instanceId:'',+h.point.y.toFixed(1),+(h.point.y-groundY(h.point.x,h.point.z)).toFixed(1)])}return o})()`);
 console.log('HIT',JSON.stringify(hit));await b.close()})().catch(e=>{console.log('PROBE ERR',e.message);process.exit(1)});
