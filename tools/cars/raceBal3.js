// raceFeel.js <url> <out> [tab] : race physics numbers with real keys (test-driven rAF, 60 frames per game second)
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const INIT=`(()=>{const q=[];let t=0;window.__auto=true;window.requestAnimationFrame=cb=>{q.push(cb);return q.length};window.cancelAnimationFrame=()=>{};
 window.__tick=n=>{for(let i=0;i<n;i++){t+=1000/60;const c=q.splice(0);for(const f of c){try{f(t)}catch(e){window.__err=String(e)}}if(window.__mon)window.__mon()}return t};
 setInterval(()=>{if(window.__dbg&&!window.__fastR){window.__fastR=__dbg.composer.render;__dbg.composer.render=()=>{}}if(window.__auto)window.__tick(1)},16)})();`;
(async()=>{const [URL,OUT,TAB='quick']=process.argv.slice(2);const br=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const ctx=await br.newContext({viewport:{width:852,height:393},deviceScaleFactor:2,isMobile:true,hasTouch:true});await ctx.addInitScript(INIT);const p=await ctx.newPage();p.setDefaultTimeout(600000);
const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,150)));
await p.goto(URL);await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:500});
await p.evaluate(()=>{localStorage.clear();localStorage.setItem('mho_slot','1');localStorage.setItem('mho_roam@1',JSON.stringify({tut:1,otg:{}}))});await p.reload();await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:500});
await p.evaluate(()=>{window.__auto=false});await p.evaluate(t=>__dbg.RS(t),TAB);
await p.evaluate(()=>{const L=window.__L=[];window.__mon=()=>{const P=__dbg.PL;if(!P||__dbg.ST!=='race')return;L.push({v:P.v,yaw:P.yaw,beta:P.beta,wall:P.wall,lap:P.lap,dist:P.dist,air:!!P.air,nitro:!!P.nitro,place:P.place})}});
const tick=n=>p.evaluate(n=>__tick(n),n);let si=0;const shot=async tag=>{await p.evaluate(()=>{__dbg.SS&&__dbg.SS();const f=window.__fastR;if(f)f.call(__dbg.composer)});await p.screenshot({path:`${OUT}_${String(si++).padStart(2,'0')}_${tag}.png`})};
const K=p.keyboard;await K.down('ArrowUp');await tick(240);// countdown
const info0=await p.evaluate(()=>({laps:__dbg.RC.laps,L:__dbg.TD.L|0,top0:__dbg.PL.stats.top0,top:__dbg.PL.stats.top,acc:__dbg.PL.stats.acc,brake:__dbg.PL.stats.brake}));console.log('cfg',JSON.stringify(info0));
for(let i=0;i<10;i++){await tick(60);if(i%2===0)await shot('go')}
await K.down('ShiftLeft');for(let i=0;i<4;i++){await tick(60);await shot('nitro')}await K.up('ShiftLeft');await tick(60);

// drive on: simple steering keeping to the track centre (a human looking ahead)
let lastLap=-1;const t0=Date.now();for(let i=0;i<4000;i++){const st=await p.evaluate(()=>{const P=__dbg.PL;return{x:P.x,yaw:P.yaw,lap:P.lap,fin:P.finished,st:__dbg.ST,mir:window.__mir}});if(st.fin||st.st!=='race')break;const e=st.x*.05+st.yaw*1.5;if(i%80===0){const bm=await p.evaluate(()=>__dbg.PL.bm);if(bm>40&&Math.abs(st.yaw)<.1)await K.down('ShiftLeft')}if(i%80===25)await K.up('ShiftLeft');await K.up('ArrowLeft');await K.up('ArrowRight');if(e>.08)await K.down('ArrowLeft');else if(e<-.08)await K.down('ArrowRight');await tick(6);if(i%60===0)await shot('lap')}
const L=await p.evaluate(()=>window.__L);const kmh=v=>v*3.6;let t100=null;{let s0=-1;for(let i=1;i<L.length;i++){if(L[i].v<.5&&L[i-1].v>=.5)s0=i;if(s0>=0&&L[i].v<.5)s0=i;if(s0>=0&&kmh(L[i].v)>=100){t100=(i-s0)/60;break}}}
const noN=L.filter(f=>!f.nitro&&!f.air);const top=Math.max(...noN.map(f=>kmh(f.v))),topN=Math.max(...L.map(f=>kmh(f.v)));
const slip=L.filter(f=>!f.air&&f.v>8).map(f=>Math.abs(f.yaw-f.beta)*57.3).sort((a,b)=>a-b);
let hits=0;for(let i=1;i<L.length;i++)if(L[i].wall>0&&!(L[i-1].wall>0))hits++;
const res=await p.evaluate(()=>({aiFin:__dbg.SH.filter(s=>!s.isPlayer).map(s=>s.finished?+s.finishTime.toFixed(1):null),falls:window.__falls|0,fin:__dbg.PL.finished,ft:__dbg.PL.finishTime,laps:__dbg.PL.laps,place:__dbg.PL.place,ai:__dbg.SH.filter(s=>!s.isPlayer).map(s=>+(s.v*3.6).toFixed(0)),aiGap:__dbg.SH.filter(s=>!s.isPlayer).map(s=>+(__dbg.PL.dist-s.dist).toFixed(0)),aiWall:__dbg.SH.filter(s=>!s.isPlayer).map(s=>Math.abs(s.x)>=__cr25.MARGIN-.05?1:0).reduce((a,b)=>a+b,0)}));
console.log(JSON.stringify({tab:TAB,t0_100:t100&&+t100.toFixed(2),topKmh:+top.toFixed(0),nitroKmh:+topN.toFixed(0),slipP95:+(slip[Math.floor(slip.length*.95)]||0).toFixed(1),wallHits:hits,minutes:+(L.length/3600).toFixed(2),avgKmh:+(L.reduce((a,f)=>a+f.v,0)/L.length*3.6).toFixed(0),distKm:+((L[L.length-1].dist-L[0].dist)/1000).toFixed(2),...res,errs}));await br.close()})();
