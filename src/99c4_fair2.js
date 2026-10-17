// fair2 GOs (lane H, 2026-10-17): fair race combat (src/98fc_fair2.js). Lazy chunk: 99c_checklist.js is at its 200 KB cap, so the items and GOs
// register on window.__chk from here. State asserts on the fake clock (roamStep 1/30), Westend Split (TK_C), no real-time play.
function FC2T_start(){if(RO.sp)try{sprintEnd()}catch(e){}const m=tkMarkOf(RIVAL_EV.find(e=>e.p===TK_C.p));tkStart(m,TK_C);const sp=RO.sp;sp.cd=0;FC2.log.length=0;return sp}
function FC2T_stop(sp){try{$('#spRes').hidden=true}catch(e){}RO.fin=false;RO.turbo=0;if(RO.sp===sp)try{sprintEnd()}catch(e){}}
// put the player at rival a's path position + ds (m), lateral lat from its lane, speed v, heading offset h
function FC2T_put(a,s,lat,v,h){const q=tkPosOn(tkPath(a),Math.max(0,s)),L=lat;RO.x=q.x+Math.cos(q.h)*L;RO.z=q.z-Math.sin(q.h)*L;RO.y=groundAt(RO.x,RO.z,(RO.y||0)+3);RO.h=RO.vh=q.h+(h||0);RO.v=v}
const FC2T_st=n=>{for(let i=0;i<n;i++)roamStep(1/30)};
// 3 side rams in 10 s (or none: the reference), then the rest of the race with you 40 m behind; returns metres gained in the 10 s + finish
function FC2T_ram(ram){const sp=FC2T_start(),a=sp.ai[0];FC2T_st(150);const s0=a.s;let minV=1e9;
 for(let i=0;i<300;i++){const ph=i%100;if(ram&&ph<12)FC2T_put(a,a.s,FC2_lane(a)+(ph<6?4.4:3.4),a.v+3,-Math.sign(1)*.35);else FC2T_put(a,a.s-40,a.lane,a.v*.95,0);roamStep(1/30);if(i>20)minV=Math.min(minV,a.v)}
 const ds=a.s-s0,v=a.v,sh=FC2.log.filter(e=>e.e==='shove').length,td=sp.fcTd||0;let k=0;for(;k<12000&&a.fin==null&&RO.sp===sp;k++){FC2T_put(a,a.s-40,a.lane,a.v*.95,0);roamStep(1/30)}
 const r={ds,v,minV,sh,td,fin:a.fin!=null};FC2T_stop(sp);return r}
function FC2_go(kind,say){const ok=b=>b?' ✅':' ❌',f1=x=>Math.round(x*10)/10;const off=!FC2.on?' (FAIR2 OFF: old contact)':'';
 if(kind==='block'){const sp=FC2T_start(),a=sp.ai[0];FC2T_st(150);const v0=a.v;let bs=a.s+12,pass=null,minV=1e9;
  // you park on its racing line 12 m ahead and keep sliding in front of it (crawling at 50 % of its speed, matching its dodge): worst-case blocker
  for(let i=0;i<150&&pass==null;i++){bs+=v0*.5/30;FC2T_put(a,bs,FC2_lane(a),v0*.5,0);roamStep(1/30);minV=Math.min(minV,a.v);if(a.s>bs+3)pass=(i+1)/30}
  const g=FC2.log.some(e=>e.e==='ghost');FC2T_stop(sp);
  return say('📍 FAIR2 BLOCK (Westend, rival at '+Math.round(v0*3.6)+' km/h, you park on its line 12 m ahead and slide in front of it at half its speed) · rival passes you after '+(pass==null?'never (5 s)':f1(pass)+' s')+' (≤ 2 s) · its lowest speed '+Math.round(minV*3.6)+' km/h (≥ 60 % = '+Math.round(v0*.6*3.6)+') · ghosted through: '+(g?'yes':'no')+off+ok(!off&&pass!=null&&pass<=2&&minV>=v0*.6))}
 if(kind==='ram'){const r0=FC2T_ram(false),r1=FC2T_ram(true),loss=(r0.ds-r1.ds)/Math.max(r0.v,1);
  return say('📍 FAIR2 RAM (Westend, 3 side rams in 10 s at its speed +11 km/h, 20° in) · shoves '+r1.sh+', takedowns '+r1.td+' (0: not a boost ram) · rival lost '+f1(loss)+' s (≤ 4) · lowest speed '+Math.round(r1.minV*3.6)+' km/h · finished the race: '+(r1.fin?'yes':'no')+' (reference '+(r0.fin?'yes':'no')+')'+off+ok(!off&&loss<=4&&r1.fin&&r1.td===0&&r1.sh>=3))}
 if(kind==='takedown'){const sp=FC2T_start(),a=sp.ai[0];FC2T_st(150);if(pl)pl.bm=20;const bm0=pl?pl.bm:0,td0=sp.fcTd||0,v0=a.v;let tdAt=null,back=null,kmh=0;
  for(let i=0;i<150;i++){if(tdAt==null){FC2T_put(a,a.s-4.5,FC2_lane(a),25,0);RO.turbo=1;kmh=Math.round(RO.v*3.6)}else{RO.turbo=0;FC2T_put(a,a.s-60,a.lane,a.v*.9,0)}
   roamStep(1/30);if(tdAt==null&&(sp.fcTd||0)>td0)tdAt=i;if(tdAt!=null&&back==null&&!(a.down>0)&&a.g.visible!==undefined&&a.v>=v0*.6)back=(i-tdAt)/30;if(back!=null&&i>tdAt+90)break}
  const tdE=FC2.log.find(e=>e.e==='td'),bm=tdE?tdE.boost:0,td=(sp.fcTd||0)-td0;
  // cooldown: ram it again with boost right away: a shove, not a second takedown
  let td2=0;if(tdAt!=null){for(let i=0;i<20;i++){FC2T_put(a,a.s-4.5,FC2_lane(a),25,0);RO.turbo=1;roamStep(1/30)}td2=(sp.fcTd||0)-td0-td}
  FC2T_stop(sp);
  return say('📍 FAIR2 TAKEDOWN (Westend, boost ram from behind at '+kmh+' km/h, rival at '+Math.round(v0*3.6)+') · takedown '+(td?'yes':'no')+' · boost reward +'+Math.round(bm)+' · rival back racing (≥ 60 % speed) after '+(back==null?'never':f1(back)+' s')+' (≤ 2 s) · second boost ram inside the cooldown = takedown: '+(td2?'yes ❌':'no')+off+ok(!off&&td===1&&bm>0&&back!=null&&back<=2&&!td2))}
 return say('📍 FAIR2 ? '+kind+' ❌')}
(function FC2_reg(i){const C=window.__chk;if(C&&C.GO&&C.items){const T={block:'Player parks in front of a rival: the rival passes within 2 s',ram:'3 side rams in 10 s: rival loses ≤ 4 s and finishes the race',takedown:'Boost ram at ≥ 80 km/h: takedown + boost reward, rival back racing ≤ 2 s, cooldown'};
  for(const k in T){if(!C.items.some(q=>q.ver==='fair2'&&q.id===k))C.items.push({ver:'fair2',id:k,area:'drive',text:'rv:2026-10-17 · '+T[k]});C.GO['fair2/'+k]=[{c:'fra',n:k,secs:90,fn:()=>FC2_go(k,t=>t)}]}return}
 if(i<600)setTimeout(()=>FC2_reg(i+1),100)})(0);
