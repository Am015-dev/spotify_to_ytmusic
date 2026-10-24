// tBrickShots (bricks-r24i): Racers power-up bricks in the Westend race, 4 phone shots: bricks on the start straight, HUD with a level-2 brick, turbo firing, shield bubble.
// node tools/tBrickShots.js <built page url> <outdir>   (adds ?test=fra&proto=1)
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const [BASE,OUT]=process.argv.slice(2);
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const c=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:1,isMobile:true,hasTouch:true,userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'});const p=await c.newPage();p.setDefaultTimeout(400000);
 await p.goto(BASE+'?test=fra&proto=1');await p.waitForFunction(()=>window.__chk&&window.__tq&&__tq.ready&&window.RBR,null,{timeout:400000});await p.waitForTimeout(3000);
 const Q=s=>p.evaluate(s=>__xc.ev(s),s),W=ms=>p.waitForTimeout(ms);
 const at=(s,v,gas)=>Q(`(()=>{const sp=RO.sp;sp.cd=0;K.ArrowUp=K.KeyW=${!!gas};const Gm=tkGeoOf(sp.C),L=tkLen(Gm.seg.start),q=tkAt(Gm.seg.start,${s}/L);RO.x=q.x;RO.z=q.z;RO.y=groundAt(q.x,q.z,99);RO.h=RO.vh=q.h;RO.v=${v};camSnap=true;sp.ai.forEach((a,i)=>{a.s=${s}+14+i*8;a.v=${v}*.9;a.route='A'});return 1})()`);
 await Q(`(()=>{tkStart(tkMarkOf(RIVAL_EV.find(e=>e.p===TK_C.p)),TK_C);return 1})()`);await W(5000);
 await Q(`(()=>{const sp=RO.sp;sp.cd=99;const Gm=tkGeoOf(sp.C),L=tkLen(Gm.seg.start),q=tkAt(Gm.seg.start,57/L);RO.x=q.x;RO.z=q.z;RO.y=groundAt(q.x,q.z,99);RO.h=RO.vh=q.h;RO.v=0;camSnap=true;return 1})()`);await W(2500);
 console.log('1',await Q(`[RBR.B.length,RBR.on,PROTO.on].join(' ')`));await p.screenshot({path:OUT+'/bricks_01_start.png'});
 await at(150,24,true);await Q(`(()=>{const p=RBR.p,B=RBR.B;RBR.ret(p);RBR.touch(p,B.find(b=>b.col===3),'me');for(const b of B.filter(b=>b.kind==='w'&&!b.own).slice(-2))RBR.touch(p,b,'me');RBR.tick(0);return p.col+'/'+p.w})()`);await W(900);
 console.log('2',await Q(`RBR.p.col+'/'+RBR.p.w+' '+document.querySelector('#rbHud').textContent`));await p.screenshot({path:OUT+'/bricks_02_hud_l2.png'});
 console.log('3',await Q(`JSON.stringify(RBR.use('me'))`));await W(1300);console.log('3b',await Q(`[RBR.p.turboT.toFixed(1),RBR.p.vPeak.toFixed(2),Math.round(RO.v)].join(' ')`));await p.screenshot({path:OUT+'/bricks_03_turbo.png'});
 await at(260,18,true);await Q(`(()=>{const p=RBR.p;RBR.ret(p);RBR.touch(p,RBR.B.find(b=>b.col===2&&!(b.cd>0)),'me');return JSON.stringify(RBR.use('me'))})()`);await W(900);
 console.log('4',await Q(`[RBR.p.shieldT.toFixed(1),RBR.bub.visible].join(' ')`));await p.screenshot({path:OUT+'/bricks_04_shield.png'});
 await b.close()})();
