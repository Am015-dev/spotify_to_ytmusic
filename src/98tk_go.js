// tracks-3 test-only code (lazy chunk, src/LAZY): feel check driver, static feel audit, GO tk1/water and tk1/quick. Evaluated in the page's module scope after the game is drivable.
// tracks-3: feel check. tkBot = pure-pursuit driver on a route (lag = human steering delay in s, no auto-steer: plain arrow keys); tkFeel drives every course with it and logs stuck spots, walls hit, ramps that land in a building, bricks that sit inside a collider.
function tkBot(P,o={}){const lagN=Math.round((o.lag||0)*30),q=[],look=o.look||26,cum=[0];for(let i=1;i<P.length;i++)cum.push(cum[i-1]+Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]));const L=cum[cum.length-1];let ix=0,s=0,still=0,pv=0,slow=0,rec=0;const R={stuck:[],walls:0,maxS:0,recov:0};
  const at=d=>tkAt(P,Math.min(1,d/L));
  const f=function(sp){if(sp.cd>0||sp.done)return;let bd=1e9,bi=ix;for(let i=Math.max(0,ix-2);i<Math.min(P.length-1,ix+40);i++){const a=P[i],b=P[i+1],l2=(b[0]-a[0])**2+(b[1]-a[1])**2||1,t=clamp(((RO.x-a[0])*(b[0]-a[0])+(RO.z-a[1])*(b[1]-a[1]))/l2,0,1),d=Math.hypot(a[0]+(b[0]-a[0])*t-RO.x,a[1]+(b[1]-a[1])*t-RO.z);if(d<bd){bd=d;bi=i;s=cum[i]+t*Math.sqrt(l2)}}ix=bi;
    R.maxS=Math.max(R.maxS,s);const wet=RO.veh==='boat',T0=at(s+(wet?14:look)+Math.abs(RO.v)*(wet?.3:.6)),e0=angDiff(Math.atan2(T0.x-RO.x,T0.z-RO.z),RO.h);q.push(e0);const e=q.length>lagN?q[q.length-1-lagN]:0;
    K.ArrowLeft=K.ArrowRight=false;
    // fair-1: a human backs out after ~1 s nosed into a bush / car / kerb (reverse, wheel the other way), then drives on; R.stuck still counts any 2 s standstill
    if(rec>0){rec-=1/30;K.ArrowUp=K.KeyW=false;K.ArrowDown=true;if(Math.abs(e0)>.1)K[e0>0?'ArrowRight':'ArrowLeft']=true;pv=0;return}
    if(sp.t>2&&Math.abs(RO.v)<3&&K.ArrowUp){if(++slow>30){slow=0;rec=1;R.recov++}}else slow=0;
    if(Math.abs(e)>.035)K[e>0?'ArrowLeft':'ArrowRight']=true;const c1=at(s),c2=at(s+30+RO.v*1.5),cu=Math.abs(angDiff(c2.h,c1.h));   // a driver brakes for the corner ahead
    K.ArrowUp=K.KeyW=!((Math.abs(e0)>(wet?.2:.4)&&RO.v>(wet?7:14))||(cu>.6&&RO.v>14)||(cu>.3&&RO.v>24));K.ArrowDown=(Math.abs(e0)>.9&&RO.v>9)||(cu>.6&&RO.v>20);
    if(Math.abs(RO.v)<1.5)still++;else still=0;if(still===60){R.stuck.push([Math.round(RO.x),Math.round(RO.z),+sp.t.toFixed(0),tkRoad(RO.x,RO.z)]);still=0}
    if(pv>14&&RO.v<pv*.5)R.walls++;pv=RO.v};f.R=R;return f}
function tkStaticFeel(C){const G=tkGeoOf(C),o={lineWalls:0,rampBad:[],itemBad:0,items:0};
  for(const P of[G.pA,G.pB])for(let d=0;d<tkLen(P);d+=8){const q=tkAt(P,d/tkLen(P));if(roamHit(q.x,q.z,1.2))o.lineWalls++}
  for(const[sg,f,len,hgt,w]of C.ramps){const q=tkAt(G.seg[sg],f);for(const d of[len+6,len+14,len+24,len+36]){const x=q.x+Math.sin(q.h)*d,z=q.z+Math.cos(q.h)*d;if(roamHit(x,z,2)){o.rampBad.push(sg+'@'+f);break}}}
  for(const[sg,f]of C.items)for(const of of[-6,0,6]){const q=tkAt(G.seg[sg],f);o.items++;if(roamHit(q.x+Math.cos(q.h)*of,q.z-Math.sin(q.h)*of,1))o.itemBad++}
  return o}
function tkFeel(secs=150,lag=.15){const out=[];const L=[...tkWorldEvs().map(tkMarkOf),...(CID==='fra'?RO.marks.filter(m=>m.kind==='sprint'&&m.ev&&SPR_TRACK[m.ev.id]):[])];
  const quick=(CID==='fra'?['grand','hafen','fraport','sky','nord','sachs']:['akro','synt','kifi','pana','ath_akti']).map(id=>({id,kind:'quick'}));
  for(const m of[...L,...quick]){let C;if(m.kind==='quick'){const sv=menuTrack;menuTrack=m.id;C=tkBuild(tkQuickSpec());menuTrack=sv}else C=tkCourseOf(m);if(!C){out.push({n:m.ev?(m.ev.p||m.ev.id):m.id,none:1});continue}
    const st=tkStaticFeel(C);tkStart(m,C);const sp=RO.sp;sp.cd=0;const G=tkGeoOf(C),route=C.water||C.off?'B':'A',bot=tkBot(route==='B'?G.pB:G.pA,{lag});let veh=new Set;
    tkRun(secs,s=>{bot(s);if(RO.veh)veh.add(RO.veh)});const R=bot.R,r=TK.last;
    out.push({n:C.name,route,fin:!!r&&r.key===C.key,place:r&&r.place,t:r&&r.t,prog:Math.round(R.maxS/tkLen(route==='B'?G.pB:G.pA)*100),stuck:R.stuck,walls:R.walls,veh:[...veh].join('/'),aiWet:sp.aiWet||0,...st});
    try{$('#spRes').hidden=true}catch(e){}if(RO.sp===sp)sprintEnd();K.ArrowUp=K.KeyW=K.ArrowLeft=K.ArrowRight=false}
  return out}
// GO tk1/water: the river run builds, the human-like bot takes route B (slipway -> Main -> slipway): it becomes a boat and back, and the rival crosses the water as well
function tkGoWater(){const C=CID==='fra'?tkBuild({key:'rival:water-go',kind:'quick',name:'Main River Run',ai:['WEBER'],water:true}):null;if(!C||!C.water)return'📍 RIVER RUN · no water course ❌';
  tkStart({kind:'quick',ev:null},C);const sp=RO.sp;sp.cd=0;sp.ai[0].route='B';sp.ai[0].base=26;/* slow rival: the human-like bot needs ~170 s, and the hands-off DNF comes 40 s after the rival finishes */const G=tkGeoOf(C),bot=tkBot(G.pB,{lag:.15}),veh=[];let boatT=null,backT=null;
  const exitS=G.Ls+G.LB*.95;tkRun(300,s=>{bot(s);const v=RO.veh||'';if(v==='boat'&&boatT==null)boatT=s.t;if(boatT!=null&&backT==null&&v!=='boat'&&bot.R.maxS>=exitS)backT=s.t});   // back to the car only counts at the far slipway
  const a=sp.ai[0],prog=bot.R.maxS/tkLen(G.pB),ok=boatT!=null&&backT!=null&&sp.aiWet>30&&a.fin!=null&&C.spread.spread<=5;
  try{$('#spRes').hidden=true}catch(e){}if(RO.sp===sp)sprintEnd();K.ArrowUp=K.KeyW=K.ArrowLeft=K.ArrowRight=false;
  return`📍 RIVER RUN · ${C.name} · spread ${C.spread.spread} % · you became a boat at ${boatT==null?'never':boatT.toFixed(1)+' s'} and back to the car at ${backT==null?'never':backT.toFixed(1)+' s'} · bot ${Math.round(bot.R.maxS/tkLen(G.pB)*100)} % of route B, stuck ${JSON.stringify(bot.R.stuck.slice(0,3))}, walls ${bot.R.walls} · rival swam ${sp.aiWet} steps and ${a.fin!=null?'finished at '+a.fin.toFixed(1)+' s':'did not finish'} ${ok?'✅':'❌'}`}
// GO tk1/quick: every menu track of this city builds a real-street course; then the real START path (menu tab Quick Race) must start one
function tkGoQuick(say){const ids=(CID==='fra'?['grand','hafen','fraport','sky','nord','sachs']:['akro','synt','kifi','pana','ath_akti']),sv=[menuTrack,menuTab],out=[];let bad=0,off=0,wet=0;
  for(const id of ids){menuTrack=id;const C=tkBuild(tkQuickSpec());if(!C||tkGeoOf(C).lenA<1500||C.spread.spread>5){bad++;out.push(id+' ❌');continue}if(C.off)off++;if(C.water)wet++;out.push(`${C.name} ${C.spread.spread}%${C.off?' 🌳':''}${C.water?' 🌊':''}`)}
  menuTrack=ids[0];menuTab='quick';RO.sprId=null;RO.launching=false;startRace();
  setTimeout(()=>{const sp=RO.sp,ok=!bad&&sp&&sp.tk&&sp.C.kind==='quick'&&(CID!=='fra'||wet===1)&&off>=1;if(sp&&sp.tk){try{$('#spRes').hidden=true}catch(e){}sprintEnd()}menuTrack=sv[0];menuTab=sv[1];
    say('📍 QUICK RACE · '+out.join(' · ')+' · start button -> '+(sp&&sp.tk?'city course "'+sp.C.name+'"':'old spline track')+' '+(ok?'✅':'❌'))},1500);
  return'📍 QUICK RACE · starting…'}
Object.assign(window.__tk,{feel:tkFeel,water:tkGoWater,quick:tkGoQuick});
({tkBot,tkStaticFeel,tkFeel,tkGoWater,tkGoQuick})
