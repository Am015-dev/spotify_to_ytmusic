// tGpProbe: GP races-6 probe. Hooks tkBot, logs per frame (t x z v h gas brake nearby cars x/z/v/yo/k/hold) when the bot is < 45 m from (209,279) and slower than 16 m/s. node tools/tGpProbe.js <.../index.html> <runs>
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const [BASE,N]=process.argv.slice(2);
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const p=await(await b.newContext({viewport:{width:852,height:393},isMobile:true,hasTouch:true})).newPage();p.setDefaultTimeout(900000);
await p.goto(BASE+'?test=fra&draw=0');await p.waitForFunction(()=>window.__tq&&__tq.ready&&window.__chk,null,{polling:250,timeout:600000});
await p.evaluate(s=>__tk.q(s),`(()=>{const o=tkBot;window.__log=[];tkBot=function(P,op){const f=o(P,op);const g=function(sp){f(sp);if(Math.hypot(RO.x-209,RO.z-279)<45&&RO.v<16&&sp.t>5){const cs=HUB.cars.filter(c=>!c.dead&&Math.hypot(c.x-RO.x,c.z-RO.z)<16).map(c=>[Math.round(c.x),Math.round(c.z),+(c.v||0).toFixed(1),+(c.yo||0).toFixed(1),c.k,c.stop||c.wait||c.hold||0].join('/'));__log.push([sp.t.toFixed(1),RO.x.toFixed(0),RO.z.toFixed(0),RO.v.toFixed(1),RO.h.toFixed(2),K.ArrowUp?1:0,K.ArrowDown?1:0,cs.join(' ')].join(' '))}};g.R=f.R;return g};return 1})()`);
for(let i=0;i<+N;i++){await p.evaluate(()=>{try{__tq.reset()}catch(e){}__log.length=0});
const r=await p.evaluate(s=>__tk.q(s),`(()=>{const sv=menuTrack;menuTrack='grand';const C=tkBuild(tkQuickSpec());menuTrack=sv;return RV3A_race(C,'pA',0)})()`);
const lg=await p.evaluate(()=>__log.slice(0,400));
console.log('run'+(i+1)+' '+(r.fin?r.place+'. '+r.t+'s':'DNF')+' slowlogs '+lg.length);
if(lg.length>10||!r.fin){console.log(lg.filter((_,j)=>j%6==0).slice(0,25).join('\n'));}}
await b.close()})();
