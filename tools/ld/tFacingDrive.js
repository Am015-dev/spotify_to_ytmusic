// tools/ld/tFacingDrive.js (facing-1, from tools/ld/tRides.js) <url> <out>: phone 852x393, real touch. RIDES → (env TAB car|off|boat) → SET (env SET, default t_rally) → garage shots → SAVE → story → drive shots (copied from t4/taxi15.js).
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
 await tap('#gbMenuBtn');await W(1500);await tap('#r2R [data-r2m="rides"]');await W(1200);if(process.env.TAB){await ev(t=>document.querySelector('[data-gty="'+t+'"]').click(),process.env.TAB);await W(1200);await ev(s=>document.querySelector('[data-gc="'+s+'"]').click(),process.env.SET)}else await tap('[data-gc="'+(process.env.SET||'t_rally')+'"]');await W(2000);
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
 // facing-1: real keyboard gas (W / ArrowUp held), then: distance, signed speed (RO.v > 0 = forward gear), and the travel direction vs the ride's -z (its front)
 const st=()=>ev(()=>{const R=__mho.RO,m=__mho.pl.mesh,T=__ld.THREE;m.updateMatrixWorld(true);let g=null;m.traverse(o=>{if(!g&&o.isMesh&&o.userData.gb)g=o});g=g||m;/* the brick mesh: its local -z = the ride's front */const a=g.localToWorld(new T.Vector3(0,0,0)),f=g.localToWorld(new T.Vector3(0,0,-1));return{x:R.x,z:R.z,v:R.v||0,fx:f.x-a.x,fz:f.z-a.z,st:__mho.state,ps:!!__mho.paused}});
 const s0=await st();await p.keyboard.down('KeyW');await p.keyboard.down('ArrowUp');let vmax=0;for(let i=0;i<+(process.env.HOLD||8);i++){await W(1000);if(process.env.SIM)await ev(()=>__mho.roamSim(60));/* SIM=1: also step the roam physics 1 s per second with the keys held (the headless page runs the loop slowly) */const s=await st();vmax=Math.max(vmax,s.v)}
 const s1=await st();await shot('d_drive');await p.keyboard.up('KeyW');await p.keyboard.up('ArrowUp');
 const dx=s1.x-s0.x,dz=s1.z-s0.z,d=Math.hypot(dx,dz),fl=Math.hypot(s0.fx,s0.fz)||1,cos=d>.5?(dx*s0.fx+dz*s0.fz)/(d*fl):null;
 console.log('FACING_DRIVE',JSON.stringify({set:process.env.SET,state:s0.st,paused:s0.ps,sim:!!process.env.SIM,dist:+d.toFixed(1),vmax:+vmax.toFixed(2),kmh:Math.round(vmax*3.6),cosFront:cos==null?null:+cos.toFixed(2),forward:cos!=null&&cos>.7&&vmax>0}));
 console.log('ERR',JSON.stringify(errs.slice(0,6)));await b.close()})();
