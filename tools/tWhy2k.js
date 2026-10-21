// tWhy2k: the player's seat on the BUILT page (docs/WHY_NOT_2K.md). Own static server, software GL (fps here is NOT phone fps).
//   node tools/tWhy2k.js <built dir, e.g. out/why2k> <outdir> [land|por] [fra|ath]
//   1) real boot (no ?test): poll every 0.5 s what is on screen, tap the biggest CTA like a player would, time tap -> control
//   2) drive 180 s (real game loop, gas held, a human-like steer/back-out script), 1 sample/s: speed, stuck, nearest NPC, popups
//   3) staged shots: steepest slope nearby (gas 8 s: climbs out?), slow nose-in into an NPC car (pass-through?), HUD count
const {chromium}=require('/opt/node22/lib/node_modules/playwright'),http=require('http'),fs=require('fs'),path=require('path');
const [DIR,OUT,OR='land',CITY='fra']=process.argv.slice(2);fs.mkdirSync(OUT,{recursive:true});
const MT={'.html':'text/html','.js':'text/javascript','.json':'application/json','.mp3':'audio/mpeg','.ogg':'audio/ogg'};
const srv=http.createServer((q,r)=>{let f=path.join(DIR,decodeURIComponent(q.url.split('?')[0]));if(f.endsWith('/'))f+='index.html';fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{'content-type':MT[path.extname(f)]||'application/octet-stream'});r.end(d)})});
const VIS=`(()=>{const v=e=>{if(!e)return false;const r=e.getBoundingClientRect();if(r.width<4||r.height<4)return false;let n=e;while(n&&n!==document.body){const s=getComputedStyle(n);if(n.hidden||s.display==='none'||s.visibility==='hidden'||+s.opacity<.05)return false;n=n.parentElement}return r.right>0&&r.bottom>0&&r.left<innerWidth&&r.top<innerHeight};
 const ids=['ld2','menu','cmap','slots','roam','story','roamCard','npcSay','m1Cs','touch','journal','roamMap','roamPrompt','roamArrow','roamHint','topBtns','results','pause'].filter(i=>v(document.getElementById(i)));
 const btn=[...document.querySelectorAll('button,.tbtn')].filter(v).map(b=>(b.textContent||b.getAttribute('aria-label')||'').trim().replace(/\\s+/g,' ').slice(0,22));
 const txt=[...document.querySelectorAll('#roam *')].filter(e=>e.children.length===0&&(e.textContent||'').trim().length>1&&v(e)).length;
 const small=[...document.querySelectorAll('body *')].filter(e=>e.children.length===0&&(e.textContent||'').trim().length>1&&v(e)&&parseFloat(getComputedStyle(e).fontSize)<12).length;
 const R=typeof RO!=='undefined'?RO:null;return {ids,btn,txt,small,on:!!(R&&R.on),frozen:!!(R&&R.frozen),v:R?+Math.abs(R.v||0).toFixed(1):0,st:typeof __mho!=='undefined'?__mho.state:'?'}})()`;
srv.listen(0,async()=>{const BASE='http://localhost:'+srv.address().port+'/index.html';const por=OR==='por',W=por?393:852,H=por?852:393;
 const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--autoplay-policy=no-user-gesture-required']});
 const c=await b.newContext({viewport:{width:W,height:H},deviceScaleFactor:1,isMobile:true,hasTouch:true});const p=await c.newPage();p.setDefaultTimeout(300000);
 const errs=[];p.on('pageerror',e=>errs.push(String(e).slice(0,160)));const L=[],log=o=>{L.push(o);console.log(JSON.stringify(o).slice(0,300))};
 const shot=async n=>{await p.screenshot({path:`${OUT}/${CITY}_${OR}_${n}.jpg`,type:'jpeg',quality:72})};
 const t0=Date.now(),T=()=>+((Date.now()-t0)/1000).toFixed(1);let ctl=0,taps=[],seen=new Set(),first={};
 await p.goto(BASE+(CITY==='ath'?'?test=ath':''));
 // ---- 1) boot -> control (max 240 s)
 while(T()<240){const s=await p.evaluate(VIS).catch(()=>null);if(!s){await p.waitForTimeout(500);continue}
  for(const i of s.ids)if(!seen.has(i)){seen.add(i);first[i]=T();log({t:T(),appear:i,btn:s.btn.slice(0,12)});if(['menu','cmap','story','roamCard','npcSay','m1Cs','slots'].includes(i))await shot('boot_'+i)}
  if(s.on&&!s.frozen&&s.ids.includes('roam')&&!s.ids.some(i=>['story','roamCard','m1Cs','slots','cmap','menu'].includes(i))){if(!ctl){ctl=T();log({t:ctl,control:1,btn:s.btn,txt:s.txt,small:s.small});await shot('control')}break}
  // a player taps the obvious CTA: STORY card, CONTINUE, a save slot, RACE ▶ / LATER (we pick LATER: the player wants to drive), tap-to-skip
  const pick=await p.evaluate(()=>{const c=['#ob2Play','#hcStory','#storyGo','#rcNo','#slotList button','#cmStory','.m1skip','#m1Cs button','#ld2 button','#npcSay button'];for(const q of c){const e=document.querySelector(q);if(e&&e.offsetParent!==null&&!e.disabled){e.click();return q}}return ''}).catch(()=>'');
  if(pick){taps.push([T(),pick]);log({t:T(),tap:pick})}
  await p.waitForTimeout(500)}
 log({bootSummary:{toControl:ctl,taps,first}});
 // ---- 2) drive 180 s wall clock, real loop
 const D=[];let stuck=0,stuckEv=[],backing=0;
 for(let s=0;s<180;s++){const st=await p.evaluate(`(()=>{const R=RO;let nd=1e9;for(const c of (typeof HUB!=='undefined'&&HUB.cars)||[]){const d=Math.hypot(c.x-R.x,c.z-R.z);if(d<nd)nd=d}
   const g=(x,z)=>groundAt(x,z,99),sl=Math.atan(Math.hypot(g(R.x+2,R.z)-g(R.x-2,R.z),g(R.x,R.z+2)-g(R.x,R.z-2))/4)*57.3;
   return {x:Math.round(R.x),z:Math.round(R.z),v:+(Math.abs(R.v)*3.6).toFixed(0),sl:Math.round(sl),nd:Math.round(nd),n:((typeof HUB!=='undefined'&&HUB.cars)||[]).length,card:!!R.card,story:!!R.story,hp:Math.round(R.hp??100)}})()`).catch(e=>({err:String(e).slice(0,80)}));
  st.t=s;D.push(st);
  if(st.card||st.story){log({t:s,popup:st.card?'card':'story'});await p.evaluate(()=>{const e=document.querySelector('#rcNo')||document.querySelector('#storyGo');e&&e.click()}).catch(()=>{})}
  if(st.v<4)stuck++;else stuck=0;
  if(stuck===3){stuckEv.push({t:s,x:st.x,z:st.z,sl:st.sl,nd:st.nd});backing=2}
  await p.keyboard.up('ArrowLeft');await p.keyboard.up('ArrowRight');
  if(backing>0){backing--;await p.keyboard.up('KeyW');await p.keyboard.down('ArrowDown');await p.keyboard.down(s%2?'ArrowLeft':'ArrowRight')}
  else{await p.keyboard.up('ArrowDown');await p.keyboard.down('KeyW');const ph=s%12;if(ph<2)await p.keyboard.down('ArrowLeft');else if(ph>=6&&ph<8)await p.keyboard.down('ArrowRight')}
  if([5,40,90,150].includes(s))await shot('drive_'+s);
  await p.waitForTimeout(1000)}
 await p.keyboard.up('KeyW');
 const vs=D.map(d=>d.v).filter(v=>v>=0),avg=vs.reduce((a,b)=>a+b,0)/vs.length;
 log({driveSummary:{avgKmh:+avg.toFixed(0),maxKmh:Math.max(...vs),secsBelow5:vs.filter(v=>v<5).length,stuckEvents:stuckEv.length,stuckEv:stuckEv.slice(0,8),minNpc:Math.min(...D.map(d=>d.nd||1e9)),npcCount:D[D.length-1].n,hpMin:Math.min(...D.map(d=>d.hp||100))}});
 // fps in this lab (software GL, not phone truth)
 const fps=await p.evaluate(()=>new Promise(r=>{let n=0;const t=performance.now();const f=()=>{n++;if(performance.now()-t<3000)requestAnimationFrame(f);else r(+(n/3).toFixed(1))};requestAnimationFrame(f)}));log({labFps:fps});
 // ---- 3a) slope trap: steepest ground within 120 m, point uphill, gas 8 s
 const sl=await p.evaluate(`(()=>{const g=(x,z)=>groundAt(x,z,99);let best=null;for(let r=10;r<=120;r+=6)for(let a=0;a<6.28;a+=.2){const x=RO.x+Math.sin(a)*r,z=RO.z+Math.cos(a)*r,gx=(g(x+2,z)-g(x-2,z))/4,gz=(g(x,z+2)-g(x,z-2))/4,s=Math.hypot(gx,gz);if(!best||s>best.s)best={x,z,s,h:Math.atan2(gx,gz)}}
   const b=best;RO.x=b.x-Math.sin(b.h)*6;RO.z=b.z-Math.cos(b.h)*6;RO.y=g(RO.x,RO.z)+.5;RO.h=RO.vh=b.h;RO.v=0;camSnap=true;return {x:Math.round(b.x),z:Math.round(b.z),deg:Math.round(Math.atan(b.s)*57.3)}})()`).catch(e=>({err:String(e).slice(0,100)}));
 await p.keyboard.down('KeyW');await p.waitForTimeout(8000);await shot('slope');await p.keyboard.up('KeyW');
 const sl2=await p.evaluate(`({x:Math.round(RO.x),z:Math.round(RO.z),y:+RO.y.toFixed(1),v:+(Math.abs(RO.v)*3.6).toFixed(0)})`).catch(()=>null);log({slope:sl,after8s:sl2});
 // ---- 3b) slow nose-in into the nearest NPC car (the 'I pass through NPC cars when slow' report)
 const hit=await p.evaluate(`(()=>{let b=null,bd=1e9;for(const c of HUB.cars||[]){if(c.fake)continue;const d=Math.hypot(c.x-RO.x,c.z-RO.z);if(d<bd&&d>8){bd=d;b=c}}if(!b)return null;
   const h=Math.atan2(b.x-RO.x,b.z-RO.z);RO.x=b.x-Math.sin(h)*12;RO.z=b.z-Math.cos(h)*12;RO.y=groundAt(RO.x,RO.z,99)+.3;RO.h=RO.vh=Math.atan2(b.x-RO.x,b.z-RO.z);RO.v=4;camSnap=true;window.__wT=b;return {d:12}})()`).catch(e=>({err:String(e).slice(0,100)}));
 let minD=1e9,through=0;await p.keyboard.down('KeyW');
 for(let i=0;i<16;i++){const r=await p.evaluate(`(()=>{const b=window.__wT;if(!b)return null;const dx=b.x-RO.x,dz=b.z-RO.z,f=dx*Math.sin(RO.h)+dz*Math.cos(RO.h);return {d:+Math.hypot(dx,dz).toFixed(1),f:+f.toFixed(1),v:+(Math.abs(RO.v)*3.6).toFixed(0)}})()`).catch(()=>null);if(r){minD=Math.min(minD,r.d);if(r.f<-1&&r.d<3)through=1}if(i===5)await shot('npc_contact');await p.waitForTimeout(400)}
 await p.keyboard.up('KeyW');log({npcNoseIn:hit,minDist:minD,passedThrough:through});
 const hud=await p.evaluate(VIS);log({hud:{btn:hud.btn,txt:hud.txt,small12:hud.small}});await shot('hud');
 log({errors:errs.length,firstErr:errs.slice(0,3)});
 fs.writeFileSync(`${OUT}/${CITY}_${OR}.json`,JSON.stringify({L,D},null,1));await b.close();srv.close()});
