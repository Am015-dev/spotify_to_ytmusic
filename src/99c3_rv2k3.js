// rv2k3 lane A (2026-10-17): GOs rv2k3/akro-play and rv2k3/races (docs/REVIEW_2K_3.md rows 1 and 3); own module to keep 99c_checklist.js under 200 KB.
// The gap is measured in the course's own metres: the rival's progress is scaled to the player's route length (a.s / its route * lenA), as tkStep's rubber band does. The raw a.s of a rival on the longer of two routes reads 100-200 m ahead for the whole race.
function RV3A_race(C,route,roam){const ok0=RO.sp;if(ok0)try{sprintEnd()}catch(e){}
 if(roam){const W=a=>Math.atan2(Math.sin(a),Math.cos(a));for(let t=0;t<roam;t+=1/30){const la=12+RO.v*.9,q=rfSnap(RO.x+Math.sin(RO.h)*la,RO.z+Math.cos(RO.h)*la,60),e=q?W(Math.atan2(q[0]-RO.x,q[1]-RO.z)-RO.h):0;K.KeyW=K.ArrowUp=true;K.ArrowLeft=e>.06;K.ArrowRight=e<-.06;roamStep(1/30)}K.KeyW=K.ArrowUp=K.ArrowLeft=K.ArrowRight=false}
 tkStart({kind:C.kind,ev:C.ev||null},C);const sp=RO.sp;sp.cd=0;const G=tkGeoOf(C),bot=tkBot(G[route],{lag:.15});let lc=0,sg=0,acc=0;const gaps=[];
 let dg=null,n0=0;tkRun(300,s=>{bot(s);if((n0+1)%450===0){const a=s.ai[0];dg=(dg||'')+' @'+((n0+1)/30)+'s '+Math.round(s.myS||0)+'/'+(a?Math.round(a.s)+(a.fin!=null?'F':''):'-')+' g'+s.gi+' v'+Math.round(RO.v)+(RO.wk?' WK':'')+' xz'+Math.round(RO.x)+','+Math.round(RO.z)+' h'+RO.h.toFixed(2)+' st'+JSON.stringify(bot.R.stuck.slice(-1))+' air'+(RO.y-groundAt(RO.x,RO.z,1)).toFixed(1)+' car'+HUB.cars.filter(c=>!c.dead&&Math.hypot(c.x-RO.x,c.z-RO.z)<14).map(c=>Math.round(Math.hypot(c.x-RO.x,c.z-RO.z))+'/v'+Math.round(c.v||0)).join(',')}if(++n0<0)dg=[!!RO.card,!!RO.mapOpen,!!RO.story,!!RO.fin,!!RO.wk,RO.veh,RO.onFoot,RO.dDir,!!RO.ch,s.cd,K.KeyW,K.ArrowUp,RO.hp,!!(typeof OG!=='undefined'&&OG.ev)].join();acc+=1/30;if(acc>=1){acc=0;const a=s.ai[0];if(a){const g=(s.myS||0)-a.s/tkLen(tkPath(a))*G.lenA,d=Math.sign(g);if(sg&&d&&d!==sg)lc++;if(d)sg=d;gaps.push(g)}}});
 const r=TK.last,ab=gaps.map(Math.abs).sort((a,b)=>a-b);try{$('#spRes').hidden=true}catch(e){}if(RO.sp===sp)try{sprintEnd()}catch(e){}K.ArrowUp=K.KeyW=K.ArrowLeft=K.ArrowRight=K.ArrowDown=false;
 return{fin:!!r&&!r.dnf,place:r&&r.place,t:r&&r.t,lc,med:Math.round(ab[ab.length>>1]||0),stuck:bot.R.stuck.length,dg}}
function RV3A_go(kind,say){const ok=b=>b?' ✅':' ❌',fmt=o=>(o.fin?(o.place===1?'1st':o.place===2?'2nd':o.place+'th')+' '+o.t+' s':'DNF')+' · '+o.lc+' lead changes · median gap '+o.med+' m'+(o.dg?' [FROZEN '+o.dg+']':'');
 if(kind==='akro'){setTimeout(()=>{const m=tkMarkOf(ATH_BOSS_EV),C=m&&tkCourseOf(m);if(!C)return say('📍 AKROPOLIS FINAL after 30 s Athens roam · no course ❌');const R=[0,1,2].map(()=>RV3A_race(C,'pA',30));
  say('📍 AKROPOLIS FINAL after a 30 s road-follow roam, human-like bot, 3 runs: '+R.map(fmt).join(' | ')+' (each: finish 1st/2nd, median gap ≤ 60 m)'+ok(R.every(o=>o.fin&&o.place<=2&&o.med<=60)))},300);return'📍 AKROPOLIS FINAL (real play) · racing 3 runs…'}
 if(kind==='races'){setTimeout(()=>{const W=tkBuild({key:'rival:water-rv2',kind:'quick',name:'Main River Run',ai:['WEBER'],water:true}),sv=menuTrack;menuTrack='grand';const Gp=tkBuild(tkQuickSpec());menuTrack=sv;if(!W||!Gp)return say('📍 RACES · no course ❌');
  const a=RV3A_race(W,'pB',0),b=RV3A_race(Gp,'pA',0);
  say('📍 RACES (human-like bot) · Main River Run: '+fmt(a)+' · Grand Prix Quick Race: '+fmt(b)+' (each: finishes, ≥ 2 lead changes, median gap ≤ 60 m)'+ok([a,b].every(o=>o.fin&&o.lc>=2&&o.med<=60)))},300);return'📍 RACES · River Run + Grand Prix…'}
 if(kind==='finish'){setTimeout(()=>{const sv=menuTrack;let L;
  if(CID==='ath'){const m=tkMarkOf(ATH_BOSS_EV),C=m&&tkCourseOf(m);L=C?[['Akropolis',C,'pA',30]]:[]}
  else{menuTrack='grand';const Gp=tkBuild(tkQuickSpec());menuTrack=sv;L=[['River Run',tkBuild({key:'rival:water-rv2',kind:'quick',name:'Main River Run',ai:['WEBER'],water:true}),'pB',0],['Grand Prix',Gp,'pA',0],['Westend',TK_C,'pA',0]]}
  if(!L.length||L.some(q=>!q[1]))return say('📍 RACES FINISH · no course ❌');
  const out=[];let all=true;for(const[n,C,r,roam]of L){const R=[0,1,2].map(()=>RV3A_race(C,r,roam)),good=R.every(o=>o.fin&&o.t<=420);all=all&&good;out.push(n+': '+R.map(o=>o.fin?o.place+'. '+o.t+' s':'DNF').join(', '))}
  say('📍 RACES FINISH ('+CID+', 3 runs each, human-like bot, limit 420 s) · '+out.join(' · ')+ok(all))},300);return'📍 RACES FINISH · racing…'}
 return'📍 unknown rv2k3 lane A kind '+kind+' ❌'}
({RV3A_go})
