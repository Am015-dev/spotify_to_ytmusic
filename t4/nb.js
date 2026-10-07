// t4/nb.js: RIDES → BUILD YOUR OWN → chassis → place real parts by taps on chassis cells → paint one part → DONE → SAVE & DRIVE → drive shot.
// usage: node t4/nb.js <url> <out> [desk]   env CH=sc8|rod  DRIVE=1 (drive in Frankfurt + tyre gap)
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
const URL=process.argv[2],OUT=process.argv[3]||'t4/nb',DESK=process.argv[4]==='desk',CH=process.env.CH||'sc8';fs.mkdirSync(OUT,{recursive:true});
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const ctx=await b.newContext(DESK?{viewport:{width:1280,height:720}}:{viewport:{width:852,height:393},isMobile:true,hasTouch:true});
 const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e)));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
 await p.goto(URL);await p.waitForFunction(()=>window.__mho&&!document.querySelector('#topBtns').hidden,null,{timeout:240000});
 const cdp=DESK?null:await ctx.newCDPSession(p);
 // touchStart + touchEnd sent back to back (the slow software renderer otherwise splits a tap across >900 ms of frames = a long press)
 const tapXY=async(x,y)=>{if(DESK)await p.mouse.click(x,y);else{const tp=[{x,y,id:1,radiusX:4,radiusY:4,force:1}];await Promise.all([cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:tp}),cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]})])}await p.waitForTimeout(600)};
 const tapEl=async e=>{await e.scrollIntoViewIfNeeded();const bb=await e.boundingBox();if(!bb)return console.log('HIDDEN');await tapXY(bb.x+bb.width/2,bb.y+bb.height/2)};
 const tap=async s=>{const e=await p.$(s);if(!e)return console.log('NO',s);await tapEl(e)};
 const shot=async n=>{await p.waitForTimeout(1000);await p.screenshot({path:`${OUT}/${n}.png`});console.log('shot',n)};
 const cnt=()=>p.evaluate(()=>__gb.list().length);
 const part=async pc=>{const ct=await p.$eval(`#gbBkPc [data-p="${pc}"]`,x=>x.dataset.ct).catch(()=>null);if(!ct)return console.log('nopc',pc);await tap(`#gbBkCt [data-ct="${ct}"]`);await tap(`#gbBkPc [data-p="${pc}"]`)};
 const put=async(pc,i,j,rot=0)=>{await part(pc);for(let r=0;r<rot;r++)await tap('#gbBkT [data-a="rot"]');const n0=await cnt();const s=await p.evaluate(([i,j])=>__gb.scr(i,j),[i,j]);if(!s)return console.log('noscr',i,j);
  const dg=await p.evaluate(([x,y])=>__gnb.dbg(x,y),[s.x,s.y]);await tapXY(s.x,s.y);
  // v87o: a tap shows the held part (brackets + PLACE bar); PLACE puts it on
  if(await p.evaluate(()=>!!(window.__gs&&__gs.held()))){if(process.env.SHOTHELD&&!globalThis.__sh){globalThis.__sh=1;await shot('04a_held')}await tap('#gsBar [data-g="place"]')}let d=(await cnt())-n0;
  // the ~2 fps software renderer can run a frame between touchStart and touchEnd (>900 ms = long press, no add): tap again like a player would
  if(!d&&JSON.parse(dg).c){await tapXY(s.x,s.y);d=(await cnt())-n0;console.log('retap')}console.log('put',pc,i,j,'+'+d,dg);for(let r=0;r<rot;r++)await tap('#gbBkT [data-a="rot"]')};
 await tap('#gbMenuBtn');await tap('#gbx .gbTabs button[data-t="veh"]');await shot('01_rides');await tap('.gnbGo');await shot('02_picker');
 await tap(`[data-ch="${CH}"]`);await shot('03_chassis');console.log('n',await p.$eval('#gbBkN',e=>e.textContent));
 // zoom in a little with the wheel/pinch-free path: keep the default camera (phone users orbit by drag)
 for(const[pc,i,j,r]of(process.env.PARTS?JSON.parse(process.env.PARTS):[['hl',-4,-8],['tl',-4,7,2],['arch',-4,-6],['arch',-4,4],['b16',-4,-1],['ws4',-1,-4],['cs24',-2,-7],['cs24',-2,4,2],['spoiler',-1,5],['t16',-4,-1]]))await put(pc,i,j,r||0);
 await shot('04_parts');console.log('n',await p.$eval('#gbBkN',e=>e.textContent));
 // paint: white hood and white door stripes; the brush paints the mirrored twin too. A slow frame can turn the tap into a long press: tap again then.
 const paint=async(c,t,i,j)=>{await tap(`#gbBkCl [data-c="${c}"]`);const q=await p.evaluate(([i,j])=>__gb.scr(i,j),[i,j]);for(let k=0;k<3;k++){await tapXY(q.x,q.y);const ok=await p.evaluate(([t,c])=>__gb.list().some(b=>b.t===t&&b.c===c),[t,c]);console.log('paint',t,c,ok);if(ok)break}};
 await tap('#gbBkT [data-a="paint"]');await paint(9,'cs24',-2,-7);await paint(9,'t16',-4,-1);
 await shot('05_painted');console.log('cols',await p.evaluate(()=>JSON.stringify(__gb.list().filter(b=>!/^(wL|wM|T)/.test(b.t)).map(b=>b.t+':'+b.c))));
 await tap('#gbBkT [data-a="done"]');await tap('#gbx .gbTabs button[data-t="veh"]');await shot('06_rides_mine');await tap('#gbSave');
 // the selected set's live bricks are saved under mho_build (gbClose); G.br[id] only holds the sets you switched away from
 console.log('save',await p.evaluate(()=>JSON.stringify(__gnb.saved())));
 if(process.env.DRIVE){await tap('#hcStory');for(let i=0;i<80;i++){await p.waitForTimeout(3000);const s=await p.evaluate(()=>__mho.state+'|'+!!(__mho.LD&&__mho.LD.on));if(s==='roam|false')break;for(const q of['#slotList .go','#m1Next']){const e=await p.$(q);if(e&&await e.isVisible())await tapEl(e)}}
  for(let i=0;i<14;i++){let hit=0;for(const l of[p.getByText('SKIP',{exact:false}),p.getByText('TAP TO CONTINUE'),p.locator('#m1Next')]){const e=l.first();if(await e.count()&&await e.isVisible()){await tapEl(await e.elementHandle());hit=1;break}}if(!hit&&i>3)break;await p.waitForTimeout(1500)}
  await shot('07_roam');
  // drive: hold the GAS button with a real touch (the software renderer runs the sim slowly, so hold until ≥25 km/h or 120 s), small keyboard steering taps like a human
  const kmh=()=>p.evaluate(()=>{try{return Math.round(Math.abs(__mho.RO.v||__mho.RO.spd||0)*3.6)}catch(e){return 0}});const g=await (await p.$('#tG')).boundingBox();
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:g.x+g.width/2,y:g.y+g.height/2,id:2}]});
  for(let t=0;t<40&&await kmh()<25;t++){await p.waitForTimeout(3000);if(t===3){await p.keyboard.down('ArrowLeft');await p.waitForTimeout(300);await p.keyboard.up('ArrowLeft')}}
  await shot('08_drive');await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  console.log('tyre',await p.evaluate(()=>{try{return JSON.stringify(__gnb.gap())}catch(e){return String(e)}}),'kmh',await p.evaluate(()=>{try{return Math.round(Math.abs(__mho.RO.v||__mho.RO.spd||0)*3.6)}catch(e){return 'n/a'}}))}
 if(process.env.DRIVE){// low side view: brake to a stop (real touch), then a camera ~1 m above the road, side-on, framing My Build and the nearest traffic car
  const kmh=()=>p.evaluate(()=>{try{return Math.round(Math.abs(__mho.RO.v||0)*3.6)}catch(e){return 0}});const B=await (await p.$('#tB')).boundingBox();await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:B.x+B.width/2,y:B.y+B.height/2,id:3}]});
  for(let t=0;t<30&&await kmh()>1;t++)await p.waitForTimeout(1500);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  const side=async(n,close)=>{const r=await p.evaluate(close=>{const M=__mho,R=M.RO,g=M.gnd(R.x,R.z,R.y+.3);let c=null,bd=40;for(const o of(M.HUB.cars||[])){if(o.dead>0)continue;const d=Math.hypot(o.x-R.x,o.z-R.z);if(d<bd&&d>2){bd=d;c=o}}
    const tx=close||!c?R.x:(R.x+c.x)/2,tz=close||!c?R.z:(R.z+c.z)/2,h=close||!c?R.h:Math.atan2(c.x-R.x,c.z-R.z),sx=Math.cos(h),sz=-Math.sin(h),k=close?3.6:Math.max(8,bd*.75);
    __gnb.cam([tx+sx*k,g+(close?.35:1),tz+sz*k,tx,g+(close?.25:.6),tz]);
    return{traffic:c?+bd.toFixed(1):null}},close);await p.waitForTimeout(2500);await p.screenshot({path:`${OUT}/${n}.png`});console.log('shot',n,JSON.stringify(r))};
  await side('09_side_traffic',0);await side('10_side_tyres',1);await p.evaluate(()=>__gnb.cam(null));
  console.log('tyre_rest',await p.evaluate(()=>JSON.stringify(__gnb.gap())))}
 console.log('ERR',errs.slice(0,8));await b.close()})();
