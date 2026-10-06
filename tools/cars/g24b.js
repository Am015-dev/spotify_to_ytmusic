// g24b.js <base url dir> <outdir>: pCAR24b gate. Real CDP touch on the ◀ ▶ GAS BRAKE buttons, phone 852x393, top-level and in an iframe.
// Scenarios: (1) off-road on grass: crash/stop, steer at rest, drive away; (2) wall: drive into a building, steer, drive away; (3) wreck rebuild then steer.
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
const [BASE,OUT]=process.argv.slice(2);fs.mkdirSync(OUT,{recursive:true});
(async()=>{const br=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});let fails=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fails++};
for(const mode of (process.env.MODES||'top,iframe').split(',')){
 const ctx=await br.newContext({viewport:{width:852,height:393},deviceScaleFactor:1,isMobile:true,hasTouch:true});const p=await ctx.newPage();p.setDefaultTimeout(900000);
 p.on('pageerror',e=>{console.log('ERR',e.message);fails++});
 await p.goto(BASE+'/local_dbg.html');await p.evaluate(()=>{localStorage.clear();localStorage.setItem('mho_slot','1');localStorage.setItem('mho_athpre','1');localStorage.setItem('mho_roam@1',JSON.stringify({tut:1,otg:{}}))});
 if(mode==='iframe')await p.goto(BASE+'/iframe_dbg.html');else await p.reload();
 const F=mode==='iframe'?await (await p.waitForSelector('#g')).contentFrame():p.mainFrame();
 await F.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:500});
 await F.evaluate(()=>{__mho.enterRoam()});await F.waitForFunction(()=>__mho.state==='roam');await F.evaluate(()=>__mho.storyClose&&__mho.storyClose());await p.waitForTimeout(2500);
 await F.evaluate(()=>{for(const id of['m1Next','m1Skip']){const b=document.getElementById(id);if(b&&b.getClientRects().length)b.click()}});await p.waitForTimeout(1500);
 await F.evaluate(()=>{window.requestAnimationFrame=()=>0;__ju.autoClose(true)});
 const cdp=await ctx.newCDPSession(p);const ctr=async id=>F.evaluate(id=>{const r=document.getElementById(id).getBoundingClientRect();return[r.x+r.width/2,r.y+r.height/2,r.width>0]},id);
 const pos={};for(const id of['tL','tR','tG','tB'])pos[id]=await ctr(id);console.log(mode,'buttons',JSON.stringify(pos));
 const held=new Set();const sync=async()=>{const tp=[...held].map((id,i)=>({x:pos[id][0],y:pos[id][1],id:{tL:1,tR:2,tG:3,tB:4}[id]}));await cdp.send('Input.dispatchTouchEvent',{type:tp.length?(sync.n?'touchMove':'touchStart'):'touchEnd',touchPoints:tp});sync.n=tp.length};
 const down=async id=>{held.add(id);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[...held].map(k=>({x:pos[k][0],y:pos[k][1],id:{tL:1,tR:2,tG:3,tB:4}[k]}))})};
 const up=async id=>{held.delete(id);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});if(held.size){await p.waitForTimeout(440);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[...held].map(k=>({x:pos[k][0],y:pos[k][1],id:{tL:1,tR:2,tG:3,tB:4}[k]}))})}};
 const st=n=>F.evaluate(n=>{__ju.step(n);const R=__dbg.RO;return{nb:__dbg.NB,lh:R.lastHit,hp:R.hp,kmh:+(R.v*3.6).toFixed(1),h:+R.h.toFixed(3),terr:R.terr,x:+R.x.toFixed(1),z:+R.z.toFixed(1),wk:!!R.wk}},n);
 let si=0;const shot=async tag=>{await F.evaluate(()=>{__dbg.SS&&__dbg.SS();try{__dbg.composer.render()}catch(e){}});await p.screenshot({path:`${OUT}/${mode}_${String(si++).padStart(2,'0')}_${tag}.png`})};
 // steer test after an event: hold dir at rest 0.5 s (no gas) -> measure; then gas+dir 1 s -> drive away
 const steerAway=async(tag,dir)=>{const a=await st(1);await down(dir);let b;for(let i=0;i<5;i++){b=await st(6);if(i%2==0)await shot(tag+'_steer')}const d05=b.h-a.h;
  await down('tG');for(let i=0;i<6;i++){b=await st(10);if(i%2==1)await shot(tag+'_away')}await up(dir);for(let i=0;i<4;i++)b=await st(10);await up('tG');
  const moved=Math.hypot(b.x-a.x,b.z-a.z);ok(Math.abs(d05)>.25,`${mode} ${tag}: turned ${(d05*57.3).toFixed(0)}° within 0.5 s at rest`);ok(moved>8&&!b.wk,`${mode} ${tag}: drove away ${moved.toFixed(0)} m`);console.log(' ',JSON.stringify(b))};
 if(process.env.DIRT){const z0=()=>F.evaluate(()=>{const R=__dbg.RO;R.v=0;R.yr=0;R.dl=0});
  for(const [lbl,ks] of [['T gas+tL',['tG','tL']],['T gas+tR',['tG','tR']],['T tL',['tL']],['T tR',['tR']]]){await z0();const a0=await st(1);for(const k of ks)await down(k);let b;for(let i=0;i<10;i++)b=await st(6);for(const k of ks.slice().reverse())await up(k);console.log(lbl,(b.h-a0.h).toFixed(3),b.kmh,JSON.stringify(await F.evaluate(()=>__dbg.CTL)).slice(0,120));await st(30)}
  for(const [lbl,ks] of [['K up+left',['ArrowUp','ArrowLeft']],['K up+right',['ArrowUp','ArrowRight']],['K left',['ArrowLeft']]]){await z0();const a0=await st(1);for(const k of ks)await p.keyboard.down(k);let b;for(let i=0;i<10;i++)b=await st(6);for(const k of ks)await p.keyboard.up(k);console.log(lbl,(b.h-a0.h).toFixed(3),b.kmh);await st(30)}
  continue}
 // (1) grass: drive, veer off road, brake to stop
 await down('tG');for(let i=0;i<20;i++)await st(15);await down('tL');await st(40);await up('tL');for(let i=0;i<10;i++)await st(15);await up('tG');let s1=await st(1);
 await down('tB');for(let i=0;i<40;i++){s1=await st(6);if(Math.abs(s1.kmh)<1.5)break}await up('tB');await shot('grass_stop');console.log(' grass',JSON.stringify(s1));
 await steerAway('grass','tR');
 // (2) wall: setup = probe headings for a wall within ~60 m (restore pose after each probe), then a real touch crash into it
 const pose=await F.evaluate(()=>{const R=__dbg.RO;return{x:R.x,z:R.z,y:R.y,h:R.h}});let th=null;
 const fw=await F.evaluate(P=>{let W=null,bd=1e9;for(let x=P.x-800;x<=P.x+800;x+=8)for(let z=P.z-800;z<=P.z+800;z+=8){const d=Math.hypot(x-P.x,z-P.z);if(d<bd&&__tr.hit(x,z)&&[[-6,-6],[6,-6],[-6,6],[6,6],[0,0]].every(([u,v])=>__tr.hit(x+u,z+v))){
   for(let k=0;k<16;k++){const a=k*Math.PI/8,sx=Math.sin(a),sz=Math.cos(a);let wd=null;for(let t=0;t<12;t+=.5)if(__tr.hit(x-sx*(12-t),z-sz*(12-t))){wd=12-t;break}if(wd==null)continue;const wx=x-sx*wd,wz=z-sz*wd;let ok=true;for(let e=wd+3;e<=wd+55;e+=2)if(__tr.hit(x-sx*e,z-sz*e)||__mho.roadD(x-sx*e,z-sz*e)<8){ok=false;break}if(ok){W={a,wx:x-sx*(wd+0),wz:z-sz*(wd+0)};bd=d;break}}}}return W},pose);
 console.log('  wall at',JSON.stringify(fw),await F.evaluate(()=>typeof __tr.roadD+' '+Object.keys(window).filter(k=>k.startsWith('__')&&window[k]&&window[k].roadD).join(',')));th=fw&&fw.a;if(fw){pose.x=fw.wx;pose.z=fw.wz}
 const back=(P,a)=>({x:P.x-Math.sin(a)*48,z:P.z-Math.cos(a)*48,y:P.y});const P2=back(pose,th??pose.h);
 await F.evaluate(([P,a])=>{const R=__dbg.RO;Object.assign(R,{x:P.x,z:P.z,y:__dbg.GY(P.x,P.z),h:a,vh:a,v:0,yr:0,dl:0})},[P2,th??pose.h]);await st(10);
 let hit=null,prev=[],sd=null;const aim=async r=>{if(!fw)return;let e=Math.atan2(fw.wx-r.x,fw.wz-r.z)-r.h;e=Math.atan2(Math.sin(e),Math.cos(e));const want=e>.06?'tL':e<-.06?'tR':null;if(want!==sd){if(sd)await up(sd);if(want)await down(want);sd=want}};
 await down('tG');for(let i=0;i<60&&!hit;i++){const r=await st(6);await aim(r);if(i===0)prev=r.nb;else if(r.nb!==prev||r.lh<.12)hit=r}
 if(sd)await up(sd);for(let i=0;i<8;i++)await st(6);await up('tG');await st(20);await shot('wall_rest');ok(!!hit,`${mode} wall hit ${JSON.stringify(hit)}`);
 if(hit){await steerAway('wall','tL')}
 // (3) wreck: force hp to 0 on the next hit is invasive; instead trigger the game's own wreck path and wait for REBUILT
 const wk=await F.evaluate(()=>{const R=__dbg.RO;return typeof R.hp})
 await F.evaluate(()=>{const R=__dbg.RO;Object.assign(R,{hp:1,inv:0,y:R.y+45,vy:0,v:0})});let w=null;for(let i=0;i<60&&!(w&&w.wk);i++){w=await st(6)}await shot('wreck_hit');ok(!!(w&&w.wk),`${mode} wreck triggered`);for(let i=0;i<30&&w.wk;i++)w=await st(10);await st(3);await shot('wreck_rebuilt');await steerAway('wreck','tR');
 await ctx.close()}
console.log(fails?'GATE FAIL '+fails:'GATE PASS');await br.close()})();
