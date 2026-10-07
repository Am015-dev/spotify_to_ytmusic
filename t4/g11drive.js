// t4/g11drive.js: 852x393 real touch. Garage RIDES → tap a template card in the COLLECTION (OFF=1: also equip Blue Beast on the OFF-ROAD tab)
// → SAVE & DRIVE → story → Frankfurt roam: hold GAS (touch) + human keyboard steering taps, sample the player tyre gap and nearby traffic tyre gaps,
// shots start / Frankfurt drive / low side view with traffic / tyres. ATH=1: then place the car on an Athens street (test placement only) and drive there.
// usage: [TPL=t_rosso] [OFF=1] [ATH=1] node t4/g11drive.js <url> <outdir>   (local_dbg build: uses the test-only __g9ev hook for traffic tyre gaps)
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');const URL=process.argv[2],OUT=process.argv[3]||'t4/g11/drive',TPL=process.env.TPL||'t_rosso';fs.mkdirSync(OUT,{recursive:true});
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const ctx=await b.newContext({viewport:{width:852,height:393},isMobile:true,hasTouch:true});
 const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e)));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
 await p.goto(URL);await p.waitForFunction(()=>window.__mho&&!document.querySelector('#topBtns').hidden,null,{timeout:240000});const cdp=await ctx.newCDPSession(p);
 const tapXY=async(x,y)=>{const tp=[{x,y,id:1,radiusX:4,radiusY:4,force:1}];await Promise.all([cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:tp}),cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]})]);await p.waitForTimeout(700)};
 const tapEl=async e=>{await e.scrollIntoViewIfNeeded().catch(()=>{});const bb=await e.boundingBox();if(bb)await tapXY(bb.x+bb.width/2,bb.y+bb.height/2)};const tap=async s=>{const e=await p.$(s);if(!e)return console.log('NO',s);await tapEl(e)};
 const shot=async n=>{await p.waitForTimeout(1200);await p.screenshot({path:`${OUT}/${n}.png`});console.log('shot',n)};
 // garage: equip by tapping the collection cards
 await tap('#gbMenuBtn');await p.waitForTimeout(1500);await tap('#gbx .gbTabs [data-t="veh"]');await p.waitForTimeout(1500);await tap(`#g9Col .g9Card[data-gc="${TPL}"] img`);
 if(process.env.OFF){await tap('#g9Col [data-gty="off"]');await p.waitForTimeout(1000);await tap('#g9Col .g9Card[data-gc="t_beast"] img');await tap('#g9Col [data-gty="car"]')}
 console.log('equipped car',await p.evaluate(()=>__g9c.eq('car')),'off',await p.evaluate(()=>__g9c.eq('off')));await tap('#gbSave');
 await tap('#hcStory');for(let i=0;i<240;i++){await p.waitForTimeout(3000);const s=await p.evaluate(()=>__mho.state+'|'+!!(__mho.LD&&__mho.LD.on));if(i%10==0)console.log('wait',i,s);if(s==='roam|false')break;for(const q of['#slotList .go','#m1Next']){const e=await p.$(q);if(e&&await e.isVisible())await tapEl(e)}}
 for(let i=0;i<14;i++){let hit=0;for(const l of[p.getByText('SKIP',{exact:false}),p.getByText('TAP TO CONTINUE'),p.locator('#m1Next')]){const e=l.first();if(await e.count()&&await e.isVisible()){await tapEl(await e.elementHandle());hit=1;break}}if(!hit&&i>3)break;await p.waitForTimeout(1500)}
 await shot('01_start');
 const kmh=()=>p.evaluate(()=>{try{return Math.round(Math.abs(__mho.RO.v||0)*3.6)}catch(e){return 0}});
 const pgap=()=>p.evaluate(()=>{try{const R=__mho.RO;if(R.vy!==0)return null;return __gnb.gap()}catch(e){return String(e)}});
 const tgap=()=>p.evaluate(()=>{try{return __g9ev(`(()=>{const out=[],M=new THREE.Matrix4(),v=new THREE.Vector3();for(const c of HUB.cars||[]){if(c.dead>0||c.x==null)continue;const dx=c.x-RO.x,dz=c.z-RO.z;if(dx*dx+dz*dz>80*80)continue;const im=HUB.cim&&HUB.cim[c.k],wm=im&&im.userData.w;if(!wm)continue;
   const W=ART6_wl[c.k]||(ART6_wl[c.k]=ART6_wheels(wm.geometry));wm.getMatrixAt(c.j,M);const g=[];for(const q of W){v.set(q[0],q[1],q[2]).applyMatrix4(M);g.push(+(v.y-groundAt(v.x,v.z,v.y+1)).toFixed(3))}out.push(g)}return out.slice(0,6)})()`)}catch(e){return String(e)}});
 const veh=()=>p.evaluate(()=>{try{const R=__mho.RO;return (R.vk||R.veh||R.mode||'')+''}catch(e){return ''}});
 const G=[],T=[];const drive=async(sec,tag)=>{const g=await (await p.$('#tG')).boundingBox();await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:g.x+g.width/2,y:g.y+g.height/2,id:2}]});
  const t0=Date.now();let k=0,top=0;while(Date.now()-t0<sec*1000){await p.waitForTimeout(2500);k++;const v=await kmh();top=Math.max(top,v);
   if(k%3===1){const key=['ArrowLeft','ArrowRight'][k%2];await p.keyboard.down(key);await p.waitForTimeout(250);await p.keyboard.up(key)}
   const a=await pgap();if(Array.isArray(a)&&a.length)G.push({tag,max:Math.max(...a.map(Math.abs)),a});if(k%4===0){const t=await tgap();if(Array.isArray(t))for(const w of t)if(w.length)T.push({tag,max:Math.max(...w.map(Math.abs))})}}
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});console.log(tag,'top kmh',top,'pos',await p.evaluate(()=>[Math.round(__mho.RO.x),Math.round(__mho.RO.z)]))};
 await drive(+(process.env.SEC||75),'fra');await shot('02_frankfurt_drive');
 // low side view: brake to a stop (real touch), camera ~1 m above the road, side-on, framing the player and the nearest traffic car; then a close tyre view
 const B=await (await p.$('#tB')).boundingBox();await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:B.x+B.width/2,y:B.y+B.height/2,id:3}]});
 for(let t=0;t<30&&await kmh()>1;t++)await p.waitForTimeout(1500);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 const side=async(n,close)=>{const r=await p.evaluate(close=>{const M=__mho,R=M.RO,g=M.gnd(R.x,R.z,R.y+.3);let c=null,bd=40;for(const o of(M.HUB.cars||[])){if(o.dead>0)continue;const d=Math.hypot(o.x-R.x,o.z-R.z);if(d<bd&&d>2){bd=d;c=o}}
   const tx=close||!c?R.x:(R.x+c.x)/2,tz=close||!c?R.z:(R.z+c.z)/2,h=close||!c?R.h:Math.atan2(c.x-R.x,c.z-R.z),sx=Math.cos(h),sz=-Math.sin(h),k=close?3.6:Math.max(8,bd*.75);
   __gnb.cam([tx+sx*k,g+(close?.35:1),tz+sz*k,tx,g+(close?.25:.6),tz]);return{traffic:c?+bd.toFixed(1):null}},close);await p.waitForTimeout(2500);await p.screenshot({path:`${OUT}/${n}.png`});console.log('shot',n,JSON.stringify(r))};
 await side('03_side_traffic',0);await side('04_side_tyres',1);await p.evaluate(()=>__gnb.cam(null));
 const rest=await pgap(),trest=await tgap();console.log('tyre_rest',JSON.stringify(rest),'traffic_rest',JSON.stringify(trest));if(Array.isArray(trest))for(const w of trest)if(w.length)T.push({tag:'rest',max:Math.max(...w.map(Math.abs))});
 if(process.env.OFF){// off-road form (Blue Beast) mixed in: press T (vehicle cycle, real key) until 4x4, drive, low side shot
  for(let i=0;i<4&&await p.evaluate(()=>__mho.RO.vsel)!=='offroad';i++){await p.keyboard.press('KeyT');await p.waitForTimeout(1500)}console.log('vsel',await p.evaluate(()=>__mho.RO.vsel));await p.waitForTimeout(3000);
  await drive(45,'off');await shot('07_offroad_drive');await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:B.x+B.width/2,y:B.y+B.height/2,id:3}]});for(let t=0;t<30&&await kmh()>1;t++)await p.waitForTimeout(1500);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  await side('08_offroad_side',1);await p.evaluate(()=>__gnb.cam(null));console.log('off_rest',JSON.stringify(await pgap()));
  for(let i=0;i<4&&await p.evaluate(()=>__mho.RO.vsel)!=='auto';i++){await p.keyboard.press('KeyT');await p.waitForTimeout(1200)}}
 if(process.env.ATH){// Athens: test placement on an Athens street lane node (Historic Centre), heading along the lane, then real driving
  const at=await p.evaluate(()=>{const M=__mho,N=M.HUB.nodes;let best=-1,bd=1e9;for(let i=0;i<N.length;i++){const n=N[i];if(n.ab||!n.nb||!n.nb.length)continue;if(n.x<-1350||n.x>-1150||n.z<760||n.z>1000)continue;const d=Math.hypot(n.x+1250,n.z-880);if(d<bd){bd=d;best=i}}
    if(best<0)return null;const n=N[best],m=N[n.nb[0]],h=Math.atan2(m.x-n.x,m.z-n.z),now=performance.now();M.warp(n.x,n.z,h,now);return{x:Math.round(n.x),z:Math.round(n.z),h:+h.toFixed(2)}});
  console.log('athens at',JSON.stringify(at));await p.waitForTimeout(8000);await shot('05_athens_start');await drive(+(process.env.SEC||75)*.8,'ath');await shot('06_athens_drive')}
 const sum=a=>a.length?{n:a.length,max:+Math.max(...a.map(x=>x.max)).toFixed(3),over05:a.filter(x=>x.max>.05).length}:null;
 console.log('GAP player',JSON.stringify(sum(G)),'traffic',JSON.stringify(sum(T)),'veh',await veh());
 console.log('ERR',JSON.stringify(errs.filter(e=>!/GPU stall|GL Driver/.test(e)).slice(0,8)));await b.close()})();
