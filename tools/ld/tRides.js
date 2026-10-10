// tools/ld/tRides.js <url> <out>: phone 852x393, real touch. RIDES → SET (env SET, default t_rally) → garage shots → SAVE → story → drive shots (copied from t4/taxi15.js).
// SAVE → story start → hold GAS ~9 s → drive shot, tyre gap, low side shot with a traffic car.
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const OUT=process.argv[3];require('fs').mkdirSync(OUT,{recursive:true});
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const ctx=await b.newContext({viewport:{width:852,height:393},isMobile:true,hasTouch:true});
 const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e)));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});const ev=(f,a)=>p.evaluate(f,a),W=ms=>p.waitForTimeout(ms);
 await p.goto(process.argv[2]);await p.waitForFunction(()=>window.__mho&&!document.querySelector('#topBtns').hidden,null,{timeout:240000});const cdp=await ctx.newCDPSession(p);
 const tapXY=async(x,y)=>{const tp=[{x,y,id:1,radiusX:4,radiusY:4,force:1}];await Promise.all([cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:tp}),cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]})]);await W(700)};
 const tap=async s=>{const e=await p.$(s);if(!e)return console.log('NO',s);await e.scrollIntoViewIfNeeded().catch(()=>{});const bb=await e.boundingBox();if(!bb)return console.log('HID',s);await tapXY(bb.x+bb.width/2,bb.y+bb.height/2)};
 const shot=async n=>{await W(+process.env.SW||1500);await p.screenshot({path:`${OUT}/${n}.png`});console.log('shot',n)};
 // drag on the garage view (one finger) to turn the car on the stand
 const drag=async(dx)=>{const x=430,y=200,n=12;await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y,id:3}]});for(let i=1;i<=n;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+dx*i/n,y,id:3}]});await W(30)}await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await W(400)};
 await tap('#gbMenuBtn');await W(1500);await tap('#r2R [data-r2m="rides"]');await W(1200);await tap('[data-gc="'+(process.env.SET||'t_rally')+'"]');await W(2000);
 console.log('car',await ev(()=>__g9c.eq('car')),'n',await ev(()=>__gb.list().length),'yaw',await ev(()=>__gb.GB_.yaw));
 await drag(1);await ev(()=>{try{__gb.render()}catch(e){}});await shot('g_rides');
 const views=process.env.VIEWS?JSON.parse(process.env.VIEWS):{g_34front:null,g_front:Math.PI*0,g_side:Math.PI/2,g_34rear:2.4};
 for(const k in views){if(views[k]!=null)await ev(y=>{__gb.GB_.yaw=y},views[k]);await drag(1);await ev(()=>{try{__gb.render()}catch(e){}});await shot(k);console.log(k,'yaw',await ev(()=>__gb.GB_.yaw))}
 if(process.env.GONLY){console.log('ERR',JSON.stringify(errs.slice(0,6)));await b.close();return}
 await tap('#gbSave');await W(3000);console.log('saved n',await ev(()=>__g9c.bricks(__g9c.eq('car')).length),'eq',await ev(()=>__g9c.eq('car')));
 if(process.env.DUMPLS){const L=await ev(()=>{const o={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);o[k]=localStorage.getItem(k)}return o});require('fs').writeFileSync(OUT+'/ls.json',JSON.stringify(L));console.log('LS',Object.keys(L).map(k=>k+':'+L[k].length).join(' '));await b.close();return}
 await tap('#hcStory');for(let i=0;i<120;i++){await W(3000);const s=await ev(()=>__mho.state+'|'+!!(__mho.LD&&__mho.LD.on));if(s==='roam|false')break;for(const q of['#slotList .go','#m1Next']){const e=await p.$(q);if(e&&await e.isVisible()){const bb=await e.boundingBox();await tapXY(bb.x+bb.width/2,bb.y+bb.height/2)}}}
 for(let i=0;i<10;i++){let hit=0;for(const l of[p.getByText('SKIP',{exact:false}),p.getByText('TAP TO CONTINUE'),p.locator('#m1Next')]){const e=l.first();if(await e.count()&&await e.isVisible()){const bb=await e.boundingBox();await tapXY(bb.x+bb.width/2,bb.y+bb.height/2);hit=1;break}}if(!hit&&i>3)break;await W(1500)}
 for(let i=0;i<60;i++){const ok=await ev(()=>!(__mho.LD&&__mho.LD.on)&&!!document.querySelector('#tG')&&!!document.querySelector('#tG').getBoundingClientRect().width);if(ok)break;await W(2000)}
 await shot('d_start');
 const g=await (await p.$('#tG')).boundingBox();await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:g.x+g.width/2,y:g.y+g.height/2,id:2}]});await W(9000);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 await shot('d_drive');await W(4000);
 const gap=await ev(()=>{try{return __gnb.gap()}catch(e){return String(e)}});console.log('gap',JSON.stringify(gap));
 console.log('car',await ev(()=>{try{const m=__mho.pl.mesh;m.updateMatrixWorld(true);const T=__ld.THREE,B=new T.Box3().setFromObject(m),S=B.getSize(new T.Vector3());return JSON.stringify({x:__mho.RO.x,z:__mho.RO.z,h:__mho.RO.h,size:S.toArray().map(v=>+v.toFixed(3)),ws:(()=>{let w=null;m.traverse(o=>{if(!w&&o.isMesh&&o.userData.gb&&o.visible){const v=new T.Vector3();o.getWorldScale(v);w=v.toArray().map(q=>+q.toFixed(4))}});return w})(),kmh:Math.round((__mho.RO.v||0)*3.6)})}catch(e){return String(e)}}));
 await ev(()=>{const M=__mho,R=M.RO,gg=M.gnd(R.x,R.z,R.y+.3),sx=Math.cos(R.h),sz=-Math.sin(R.h);__gnb.cam([R.x+sx*5,gg+.7,R.z+sz*5,R.x,gg+.6,R.z])});await W(2500);await p.screenshot({path:`${OUT}/d_side_low.png`});console.log('shot d_side_low');
 // a traffic car: nearest LEGO traffic mesh, low side view
 const tc=await ev(()=>{try{const M=__mho,R=M.RO;let best=null,bd=1e9;M.scene.traverse(o=>{if(o.userData&&o.userData.trf&&o.visible){const d=Math.hypot(o.position.x-R.x,o.position.z-R.z);if(d<bd){bd=d;best=o}}});if(!best)return null;const p=best.position,gg=M.gnd(p.x,p.z,p.y+.3);__gnb.cam([p.x+4,gg+.7,p.z+4,p.x,gg+.6,p.z]);return Math.round(bd)}catch(e){return String(e)}});
 console.log('traffic',tc);await W(2500);await p.screenshot({path:`${OUT}/d_traffic_low.png`});
 console.log('ERR',JSON.stringify(errs.filter(e=>!/GPU stall|GL Driver/.test(e)).slice(0,6)));await b.close()})();
