// athroads: road-corridor audit (window.__athAudit, tools/athAudit.js) + 📍 GO ath/roads-clear (lazy chunk, called from RV2K2_go kind 'roadsclear' in src/99c_checklist.js)
// Samples every drivable street (CITY_S not ped, fill roads FILL_R, Autobahn) every 3 m across the drivable width minus a 0.5 m kerb margin and reports every collider
// (HUB.grid: buildings, walls, stalls, set pieces) a car would hit (roamHit rules: low kerb pieces and bridge-deck colliders do not count) and every terrain step > 0.8 m in 1.5 m.
function ATHR_audit(){const out=[],seen=new Set(),M=.5;let km=0;
 const add=(type,b,x,z,rd,w,dep,note)=>{const k=type+(b?(b.x|0)+','+(b.z|0)+','+(b.hw|0):Math.round(x/4)+','+Math.round(z/4));if(seen.has(k))return;seen.add(k);out.push({type,x:Math.round(x),z:Math.round(z),road:rd,w:+w.toFixed(1),dep:+dep.toFixed(1),note,keys:b?Object.keys(b).join(','):'',hw:b?+b.hw.toFixed(1):0,hd:b?+b.hd.toFixed(1):0})};
 const kind=b=>b.kind||b.t||b.type||b.nm||b.name||(b.hw>b.hd*2.5||b.hd>b.hw*2.5?'wall':'bld');
 const probe=(x,z,tx,tz,w,rd,rid)=>{const h=w/2-M;if(h<=0)return;const y=groundY(x,z);if(typeof onAnyDeck==='function'&&onAnyDeck(x,z))return;
  for(let o=-h;o<=h+.01;o+=Math.min(1.5,h)){const px=x-tz*o,pz=z+tx*o,b=roamHit(px,pz,.3,y+.5);if(b)add(kind(b),b,px,pz,rd,w,h-Math.abs(o),'h='+(b.h?+(b.h-y).toFixed(1):'?'))}};
 const walk=(x0,z0,x1,z1,w,rd)=>{const L=Math.hypot(x1-x0,z1-z0);if(L<.5)return;const tx=(x1-x0)/L,tz=(z1-z0)/L;km+=L/1000;let py=null;
  for(let s=0;s<=L;s+=3){const x=x0+tx*s,z=z0+tz*s;probe(x,z,tx,tz,w,rd);const g=groundY(x,z);if(py!=null&&Math.abs(g-py)>.8&&!(typeof onAnyDeck==='function'&&onAnyDeck(x,z)))add('step',null,x,z,rd,w,Math.abs(g-py),'Δy '+(g-py).toFixed(1));py=g}};
 for(const S of CITY_S){if(S.r.cls==='ped'||S.r.cls==='hill')continue;const P=S.pts,rd=S.r.name||S.r.cls||'street';for(let i=0;i+1<P.length;i++)walk(P[i].x,P[i].z,P[i+1].x,P[i+1].z,S.r.w,rd)}
 for(const r of hubRoads())walk(r.x0,r.z0,r.x1,r.z1,r.w,'fill');
 if(typeof abSamples==='function')for(const S of abSamples()){if(!S.r.ab||S.r.c)continue;const P=S.pts;for(let i=0;i+1<P.length;i++)walk(P[i].x,P[i].z,P[i+1].x,P[i+1].z,S.r.w,S.r.name||'ab')}
 out.sort((a,b)=>b.dep-a.dep);return{n:out.length,km,nb:HUB.bld.length,ng:HUB.grid?HUB.grid.size:0,list:out}}
window.__athAudit=ATHR_audit;
function ATHR_go(){const r=ATHR_audit(),by={};for(const o of r.list)by[o.type]=(by[o.type]||0)+1;return'📍 ROADS CLEAR ('+CID+') · '+r.n+' blockers on '+r.km.toFixed(0)+' km of road '+JSON.stringify(by)+(r.n?' · worst '+r.list.slice(0,3).map(o=>o.type+'@'+o.x+','+o.z+' '+o.road).join('; '):'')+(r.n?' ❌':' ✅')}
(function ATHR_reg(i){const C=window.__chk;if(C&&C.GO&&C.items){if(!C.items.some(q=>q.ver==='ath'&&q.id==='roads-clear'))C.items.push({ver:'ath',id:'roads-clear',area:'drive',text:'athroads:2026-10-17 · ROADS CLEAR: no building, wall, stall, set piece or terrain step in the drivable width (minus 0.5 m kerb) of any street, fill road or hub road. Auto: audit finds 0 blockers (Athens and Frankfurt).'});C.GO['ath/roads-clear']=[{c:'fra',n:'roads clear',secs:60,fn:()=>ATHR_go()},{c:'ath',n:'roads clear Athens',secs:60,fn:()=>ATHR_go()}];return}
 if(i<600)setTimeout(()=>ATHR_reg(i+1),100)})(0);
window.__athDump=(x,z,r)=>{const R=[],B=[];for(const S of CITY_S)if(S.pts.some(p=>Math.abs(p.x-x)<r&&Math.abs(p.z-z)<r))R.push({c:S.r.cls,w:S.r.w,p:S.pts.map(p=>[Math.round(p.x),Math.round(p.z)])});const seen=new Set();for(let a=x-r;a<=x+r;a+=40)for(let c=z-r;c<=z+r;c+=40)for(const b of(HUB.grid.get(Math.floor(a/40)*10000+Math.floor(c/40))||[]))if(!seen.has(b)){seen.add(b);B.push([+b.x.toFixed(1),+b.z.toFixed(1),+b.hw.toFixed(1),+b.hd.toFixed(1),b.c==null?0:+Math.atan2(b.s,b.c).toFixed(2),+(b.h||0).toFixed(0)])}return{R,B}};
