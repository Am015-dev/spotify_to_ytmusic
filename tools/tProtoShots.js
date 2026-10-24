// tProtoShots: proto-1 Westend start stretch, 3 phone shots (grid, mid-straight with rivals, prop-dense spot). node tools/tProtoShots.js <base url> <outdir> <tag> [query e.g. &proto=1]
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const [BASE,OUT,TAG,QS]=process.argv.slice(2);
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const c=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:1,isMobile:true,hasTouch:true,userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'});const p=await c.newPage();p.setDefaultTimeout(600000);p.on('pageerror',e=>console.log('PAGEERR',String(e).slice(0,160)));
 await p.goto(BASE+'?test=fra'+(QS||''));await p.waitForFunction(()=>window.__chk&&window.__tq&&__tq.ready,null,{timeout:400000});await p.waitForTimeout(3000);
 const Q=s=>p.evaluate(s=>__tk.q(s),s);
 await Q(`(()=>{tkStart(tkMarkOf(RIVAL_EV.find(e=>e.p===TK_C.p)),TK_C);return 1})()`);
 await p.waitForTimeout(6000);await Q(`(()=>{RO.sp.cd=Math.max(RO.sp.cd,1.5);return 1})()`);await p.waitForTimeout(1500);
 console.log('grid',await Q(`[RO.sp.cd.toFixed(1),RO.sp.ai.length,typeof PROTO!=='undefined'&&PROTO.on,typeof PROTO!=='undefined'&&PROTO.n,typeof PROTO!=='undefined'&&PROTO.hw,typeof PROTO!=='undefined'&&PROTO.draws].join(' ')`));await p.screenshot({path:OUT+'/'+TAG+'_01.png'});
 // mid-straight / prop spot: player at s, rivals just ahead, gas held
 for(const [n,s] of [[2,140],[3,300]]){
  await Q(`(()=>{const sp=RO.sp;sp.cd=0;K.ArrowUp=K.KeyW=true;const Gm=tkGeoOf(sp.C),L=tkLen(Gm.seg.start),f=${s}/L,q=tkAt(Gm.seg.start,f);RO.x=q.x;RO.z=q.z;RO.y=groundAt(q.x,q.z,99);RO.h=RO.vh=q.h;RO.v=30;camSnap=true;sp.ai.forEach((a,i)=>{a.s=${s}+12+i*9;a.v=29;a.route='A'});return L|0})()`);
  await p.waitForTimeout(1600);console.log('shot',n,await Q(`[Math.round(RO.v),Math.round(RO.sp.myS||0),RO.sp.ai.map(a=>Math.round(a.s)).join('/')].join(' ')`));await p.screenshot({path:OUT+'/'+TAG+'_0'+n+'.png'})}
 await b.close()})();
