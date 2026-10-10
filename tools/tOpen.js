// tOpen: open-course probe + placed shots (race worker RO). usage: node tools/tOpen.js <url> <outdir>  env TRACK=fra_ufer CITY=fra SHOTS="name:code;..." 
// Starts a race through __oc.ev(setupRace) (no menu), then runs JS snippets (in module scope) and shoots 852×393 frames.
const {chromium}=require('playwright'),path=require('path'),fs=require('fs');
const URL=process.argv[2],OUT=process.argv[3]||'.';fs.mkdirSync(OUT,{recursive:true});const TRACK=process.env.TRACK||'fra_ufer',TAG=process.env.TAG||TRACK+'_';
const INIT=`(()=>{const q=[];let t=0;window.__auto=true;window.requestAnimationFrame=cb=>{q.push(cb);return q.length};window.cancelAnimationFrame=()=>{};
 window.__tick=n=>{for(let i=0;i<n;i++){t+=1000/60;const c=q.splice(0);for(const f of c){try{f(t)}catch(e){setTimeout(()=>{throw e})}}}return t};
 setInterval(()=>{if(window.__auto)window.__tick(1)},16)})();`;
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const ctx=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:1,isMobile:true,hasTouch:true});const p=await ctx.newPage();p.setDefaultTimeout(600000);
 const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,200)));p.on('console',m=>{if(m.type()==='error'||(m.type()==='warning'&&/RO |OPN/.test(m.text())))errs.push(m.text().slice(0,200))});
 await p.addInitScript(INIT);await p.goto(URL);await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:500});
 await p.evaluate(()=>{window.__auto=false;localStorage.setItem('mho_prof@1',JSON.stringify({xp:40000}))});
 const ev=c=>p.evaluate(c=>__oc.ev(c),c),tick=n=>p.evaluate(n=>__tick(n),n);
 await ev(`(menuTab='quick',menuTrack='${TRACK}',startRace(),0)`);
 for(let i=0;i<80;i++){if(await ev('state')==='race')break;await tick(15)}if(process.env.PRE)console.log('PRE',JSON.stringify(await ev(process.env.PRE)));await tick(+(process.env.WARM||30));console.log('RO',JSON.stringify(await ev('window.__ro()')));
 // SHOTS = "name~frames~setup~cam@@…": setup runs once (module scope), then `frames` sim frames, then cam (optional) runs inside the render
 for(const sp of (process.env.SHOTS||'').split('@@').filter(Boolean)){const[name,n,setup,cam]=sp.split('~');let r0=setup?await ev(setup):null;
   for(let k=0;k<(+n||0);k+=5){await tick(5);if(process.env.HOLD)await ev(process.env.HOLD)}
   const r=await p.evaluate(code=>{let out;const rr=__dbg.composer.render;__dbg.composer.render=function(){try{out=code?__oc.ev(code):0}catch(e){out='ERR '+e.message}return rr.apply(this,arguments)};__tick(1);__dbg.composer.render=rr;return out},cam||'');
   const info=await ev(process.env.INFO||'({x:+pl.x.toFixed(1),d:Math.round(pl.dist),v:Math.round(pl.v*3.6),ter:pl.terrain,dead:+pl.dead.toFixed(2),air:!!pl.air,place:pl.place,fp:window.__ro().fallsP})');
   await p.screenshot({path:path.join(OUT,TAG+name+'.jpg'),type:'jpeg',quality:78});console.log('SHOT',name,JSON.stringify(r0),JSON.stringify(r),JSON.stringify(info))}
 if(process.env.RUN){console.log('RUN',JSON.stringify(await ev(process.env.RUN)))}
 console.log('ERRORS',JSON.stringify(errs));await b.close()})();
