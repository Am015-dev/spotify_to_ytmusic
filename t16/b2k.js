// t16/b2k.js — Boost-2K real-input gate (phone 852×393, CDP multi-touch, test-driven rAF like tPlay). usage: node t16/b2k.js <url> <outdir> [city]
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs'),path=require('path');
const URL=process.argv[2],OUT=process.argv[3]||'qa16/b2k',CITY=process.argv[4]||'fra';fs.mkdirSync(OUT,{recursive:true});
const INIT=`(()=>{const q=[];let t=0;window.__auto=true;window.requestAnimationFrame=cb=>{q.push(cb);return q.length};window.cancelAnimationFrame=()=>{};
 window.__tick=n=>{for(let i=0;i<n;i++){t+=1000/60;const c=q.splice(0);for(const f of c){try{f(t)}catch(e){setTimeout(()=>{throw e})}}if(window.__mon)try{window.__mon()}catch(e){}}return t};
 setInterval(()=>{if(window.__dbg&&!window.__fastR&&!window.__shooting){window.__fastR=__dbg.composer.render;__dbg.composer.render=()=>{}}if(window.__auto)window.__tick(1)},16)})();`;
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const ctx=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:2,isMobile:true,hasTouch:true});const p=await ctx.newPage();p.setDefaultTimeout(900000);
 const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,200)));p.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text().slice(0,200))});
 await p.addInitScript(INIT);const cdp=await ctx.newCDPSession(p);let SYN=Date.now()/1000;{const s0=cdp.send.bind(cdp);cdp.send=(m,o)=>s0(m,m==='Input.dispatchTouchEvent'?{...o,timestamp:SYN}:o)}
 const tick=n=>{SYN+=n/60;return p.evaluate(n=>__tick(n),n)};
 const F={};const pts=()=>Object.values(F).map(f=>({x:f.x,y:f.y,id:f.id,radiusX:6,radiusY:6,force:1}));
 const center=sel=>p.evaluate(s=>{const e=document.querySelector(s);if(!e)return null;const r=e.getBoundingClientRect();if(r.width<4||getComputedStyle(e).display==='none')return null;for(let a=e;a;a=a.parentElement)if(a.hidden)return null;return[r.left+r.width/2,r.top+r.height/2]},sel);
 const down=async(n,xy)=>{if(!xy)return false;if(F[n])await up(n);let id=0;while(Object.values(F).some(o=>o.id===id))id++;F[n]={x:xy[0],y:xy[1],id};await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:pts()});return true};
 const move=async(n,xy)=>{if(!F[n])return;F[n].x=xy[0];F[n].y=xy[1];await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:pts()})};
 const up=async n=>{if(!F[n])return;delete F[n];const P=pts();await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});if(P.length){SYN+=.44;await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:P})}};
 const tap=async s=>{const xy=await center(s);if(!xy)return false;await down('tap',xy);await tick(4);await up('tap');await tick(4);return true};
 const shot=async n=>{await p.evaluate(()=>{window.__shooting=1;if(window.__fastR){__dbg.composer.render=window.__fastR;window.__fastR=null}__tick(1)});await p.screenshot({path:path.join(OUT,n+'.jpg'),type:'jpeg',quality:70});await p.evaluate(()=>{window.__shooting=0})};
 const st=()=>p.evaluate(()=>{const R=__mho.RO,B=window.__b2k&&__b2k.st();return{v:+(Math.abs(R.v)*3.6).toFixed(0),x:Math.round(R.x),z:Math.round(R.z),dDir:R.dDir,bm:+(__mho.pl?__mho.pl.bm:0).toFixed(1),air:+(R.y-__mho.gnd(R.x,R.z,R.y+.3)).toFixed(2),sm:__mho.HUB.smashed,b:B}});
 const CONT=['#storyGo','#m1Cs','#rcGo','#setDone','.m1go','#resBtn','#tutSkip'];
 await p.goto(URL);await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:500});
 await p.evaluate(c=>{localStorage.clear();localStorage.setItem('mho_slot','1');if(c==='ath'){localStorage.setItem('mho_city@1',c);localStorage.setItem('mho_athd@1','A');localStorage.setItem('mho_roam.ath@1','{"otg":{}}');localStorage.setItem('mho_story.ath@1','{"seen":1}')}},CITY);
 await p.reload();await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:500});
 await tap('#hcStory');await tick(10);await tap('#slotList .go');
 for(let i=0;i<120;i++){try{if(await p.evaluate(()=>window.__mho&&__mho.state==='roam'))break}catch(e){}await p.waitForTimeout(2000)}await p.evaluate(()=>{window.__auto=false});
 for(let i=0;i<30;i++){await tick(30);let t=false;for(const s of CONT)if(await tap(s)){t=true;break}if(!t)break}
 await shot('start');
 const S=process.env.SCEN||'all';const res={city:CITY};
 require(process.env.SC||'./scen.js')({p,tick,down,up,move,tap,center,shot,st,res,F,cdp});
 if(global.SCEN)await global.SCEN(S);
 res.errs=errs;console.log(JSON.stringify(res,null,1));fs.writeFileSync(path.join(OUT,'res.json'),JSON.stringify(res,null,1));await b.close()})();
