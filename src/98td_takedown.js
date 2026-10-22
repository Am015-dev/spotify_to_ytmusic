/* raceG (2026-10-17): TAKEDOWN race, a Quick Race variation (Burnout 3 takedowns + Wreckfest banger race, docs/RACE_MODES.md #1).
   Same city course, rivals, "?" bricks and ramps as the Quick Race (98tk_city_duel.js). New: ram a rival from behind while faster (or while it is stunned by a BRICK BLAST)
   = TAKEDOWN: it spins out in a brick burst for 2.6 s and drops back, and 3 s come off your final time. Rivals hunt you: near you they steer into your lane and shove from behind;
   a rival that takes you down costs 40 % of your speed (then 15 s grace; each rival rams at most every 20 s) and gets the same 3 s. Final order = finish time minus 3 s per takedown. Hard cap 300 s, so a winner is always declared.
   Phone: no new button (gas default + TURBO from "?" bricks). Flag: ?td=1 shows Mode · Race | Takedown in the Quick Race options (default OFF until a release review passes it).
   GO raceG/takedown (TD_go in 98tk_go.js). */
const TDR={on:(()=>{try{return OD_FLAG('td')}catch(e){return false}})(),sel:false,force:false,BONUS:3,CAP:300};
function tdLat(a,P,x,z){const q=tkPosOn(P,Math.max(0,a.s));return{q,lat:(x-q.x)*Math.cos(q.h)-(z-q.z)*Math.sin(q.h)}}
function tdBurst(x,y,z){const at=V3(x,y+1.2,z),cols=[0xff2d2d,0xffd21c,0x2b7bff,0xffffff].map(c=>new THREE.Color(c));try{xfBurst(at,cols)}catch(e){}try{debris(at,V3(0,4,0),10,cols,.8)}catch(e){}shake=Math.max(shake,.4)}
// rammer = the car behind, closing faster than 2.5 m/s (a stunned rival goes down on any contact); each pair has a 3 s cool-down
function tdContact(sp,dt){const T=sp.td;for(const a of sp.ai){a.tdCd=Math.max(0,(a.tdCd||0)-dt);if(a.fin!=null||a.tdCd>0||!a.g)continue;const x=a.g.position.x,z=a.g.position.z,d=Math.hypot(x-RO.x,z-RO.z);if(d>6.2||Math.abs(a.y-RO.y)>3)continue;
    const fx=Math.sin(RO.h),fz=Math.cos(RO.h),ahead=((x-RO.x)*fx+(z-RO.z)*fz)>0;
    if((ahead&&RO.v-a.v>2.5)||(a.stun>0&&RO.v>8)){a.stun=2.6;a.v=0;a.s=Math.max(0,a.s-15);a.tdCd=3;a.tdBy=(a.tdBy||0)+1;T.n++;tdBurst(x,a.y,z);feed('💥 TAKEDOWN · '+a.name+' · −'+TDR.BONUS+' s',500,'#ffd21c');say('','💥 TAKEDOWN!',.9);AU.sfx('crash');comboAdd(2);if(pl)pl.bm=Math.min(100,pl.bm+25)}
    else if(!ahead&&a.v-RO.v>2.5&&T.cd<=0&&sp.shieldT<=0){RO.v*=.6;a.tdCd=20;T.cd=15;T.me++;a.td=(a.td||0)+1;tdBurst(RO.x,RO.y,RO.z);feed('TAKEN DOWN · '+a.name,0,'#ff2d95');AU.sfx('crash')}}}
{const _start=tkStart;tkStart=function(m,C0){const sp=_start(m,C0);if(TDR.on&&TDR.sel&&sp&&(sp.C.kind==='quick'||TDR.force)){sp.td={n:0,me:0,cd:0,aim:0};say('TAKEDOWN RACE · '+sp.C.name.toUpperCase(),'RAM RIVALS FROM BEHIND · −'+TDR.BONUS+' s EACH',2.2)}return sp}}
{const _step=tkStep;tkStep=function(dt){const sp=RO.sp;if(!sp||!sp.td)return _step(dt);const T=sp.td;T.cd=Math.max(0,T.cd-dt);
   if(sp.cd<=0&&!sp.done){tdContact(sp,dt);
     // hunters: a rival up to 40 m behind you steers into your lane (ahead of you, or after a hit, it drifts back to its own lane so it never pins you on a wall); just behind you it pushes 3 m/s over your speed to shove you
     for(const a of sp.ai){if(a.fin!=null||a.stun>0)continue;if(a.lane0==null)a.lane0=a.lane;const P=tkPath(a),G=tkGeo(),as=a.s/tkLen(P)*G.lenA,gap=as-sp.myS,hunt=gap<0&&gap>-40&&!(a.tdCd>0);
       if(!hunt){a.lane+=clamp(a.lane0-a.lane,-3*dt,3*dt);continue}const{lat}=tdLat(a,P,RO.x,RO.z),want=clamp(lat,-7,7),st=clamp(want-a.lane,-6*dt,6*dt);if(Math.abs(st)>1e-3){a.lane+=st;T.aim++}
       if(sp.t>8&&T.cd<=0&&!(a.tdCd>0)&&gap<0&&gap>-22&&Math.abs(lat-a.lane)<3)a.v=Math.max(a.v,RO.v+3)}}
   const r=_step(dt);if(RO.sp===sp&&!sp.done){if(sp.cd<=0&&sp.t>=TDR.CAP)return tkFinish(true);sp.hud=(sp.hud||'').replace('</span>',` · 💥 ${T.n}</span>`).replace('🏁 ','💥 ')}return r}}
{const _fin=tkFinish;tkFinish=function(dnf){const sp=RO.sp;if(!sp||!sp.td)return _fin(dnf);const T=sp.td;if(!dnf)sp.t=Math.max(1,sp.t-T.n*TDR.BONUS);for(const a of sp.ai)if(a.fin!=null)a.fin=Math.max(1,a.fin-(a.td||0)*TDR.BONUS);
   const r=_fin(dnf);if(TK.last)Object.assign(TK.last,{mode:'takedown',td:T.n,tdMe:T.me,aim:T.aim});
   try{const el=$('#spRes'),h=el.querySelector('h3');if(h)h.textContent='💥 TAKEDOWN · '+h.textContent;const p=el.querySelector('p');if(p)p.insertAdjacentHTML('afterend',`<p>💥 Takedowns ${T.n} (−${T.n*TDR.BONUS} s) · taken down ${T.me}</p>`)}catch(e){}return r}}
// Quick Race options: Mode · Race | Takedown (only with ?td=1)
{const _bm=buildMenu;buildMenu=function(){const r=_bm.apply(this,arguments);try{let el=$('#segVar');const tr=$('#segTraffic');if(!el&&tr){el=document.createElement('div');el.className='seg';el.id='segVar';el.innerHTML='<span>Mode</span>';tr.parentNode.insertBefore(el,tr)}
   if(el){el.hidden=!(TDR.on&&menuTab==='quick');el.querySelectorAll('button').forEach(b=>b.remove());for(const[v,l]of[[false,'Race'],[true,'Takedown']]){const b=document.createElement('button');b.textContent=l;b.setAttribute('aria-pressed',TDR.sel===v);b.onclick=()=>{TDR.sel=v;buildMenu()};el.appendChild(b)}
     if(TDR.on&&TDR.sel&&menuTab==='quick'){const sb=$('#startBtn');if(sb)sb.textContent='START TAKEDOWN RACE'}}}catch(e){}return r}}
