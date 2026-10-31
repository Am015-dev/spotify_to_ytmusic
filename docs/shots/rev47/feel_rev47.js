// rev47: 1x touch race feel probe, BUILT page, iPhone UA 852x393. node feel_rev47.js <url> <tag>
// ON: hold GAS the whole race start, lift for 2 s in the middle, press again. OFF: no touch (auto). Samples km/h, place, steering-assist, fps.
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const [URL_,TAG]=process.argv.slice(2);
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const c=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:1,isMobile:true,hasTouch:true,userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'});
 const p=await c.newPage();p.setDefaultTimeout(900000);let errs=0;p.on('pageerror',e=>{errs++;console.log('PAGEERR',String(e).slice(0,160))});
 const cdp=await c.newCDPSession(p);await p.goto(URL_+(URL_.includes('?')?'&':'?')+'test=fra');
 await p.waitForFunction(()=>window.__tk,null,{timeout:900000});const W=ms=>p.waitForTimeout(ms),Q=s=>p.evaluate(s=>__tk.q(s),s);
 for(let k=0;k<200;k++){if(await Q(`state==='roam'&&RO.built&&!LD.busy`))break;await W(500)}
 await Q(`(()=>{const L=__rm.list(),i=Math.max(0,L.findIndex(n=>/race|grand/i.test(n)&&!/city|duel|sprint/i.test(n)));__rm.open(i)})()`);
 for(let k=0;k<300;k++){if(await Q(`state==='countdown'||state==='race'`))break;await W(200)}
 const gp=async()=>Q(`(()=>{const e=document.getElementById('tG');if(!e||!e.checkVisibility())return null;const r=e.getBoundingClientRect();return[r.x+r.width/2,r.y+r.height/2]})()`);
 const S=`JSON.stringify({st:state,thr:thrEff(),v:Math.round(pl.v*3.6),top:Math.round(pl.stats.top*3.6),place:typeof pl.place!=='undefined'?pl.place:null,raceT:+raceT.toFixed(1),tRace:(document.getElementById('tRace')||{}).textContent||null,hkTime:(document.getElementById('hkTime')||{}).textContent||null,strip:(()=>{const e=document.getElementById('hkSpd');if(!e)return null;const r=e.getBoundingClientRect(),c=window.__og3&&__og3.car();return [Math.round(r.top),Math.round(r.height),c?Math.round(c.bottom):null]})()})`;
 const hold=TAG==='ON';let g=await gp();console.log('GASBTN',TAG,JSON.stringify(g));
 if(hold&&g)await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:g[0],y:g[1],id:1}]});   // held from the countdown, like a player
 for(let k=0;k<240;k++){if(await Q(`state==='race'`))break;await W(500)}console.log('GO',TAG,await Q(S));
 const t0=Date.now();for(let i=0;i<24;i++){await W(500);const s=await Q(S);console.log('T',TAG,((Date.now()-t0)/1000).toFixed(1),s);
   if(hold&&i===11){await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});console.log('LIFT',TAG)}
   if(hold&&i===15){g=await gp();if(g)await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:g[0],y:g[1],id:1}]});console.log('PRESS',TAG)}}
 await p.screenshot({path:`docs/shots/rev47/feel_${TAG}_race_1x.jpg`,type:'jpeg',quality:80});
 console.log('ERRS',TAG,errs);await b.close()})().catch(e=>{console.log('SCRIPT_ERR',String(e).slice(0,300));process.exit(1)});
