(function(){return function drive(seed,simSec,opt){opt=opt||{};
 let s=seed>>>0;const R=()=>{s=(s+0x6D2B79F5)>>>0;let t=s;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296};
 const held={};const key=(c,on)=>{if(!!held[c]===on)return;held[c]=on;window.dispatchEvent(new KeyboardEvent(on?'keydown':'keyup',{code:c,key:c,bubbles:true}))};
 const W=a=>{while(a>Math.PI)a-=2*Math.PI;while(a<-Math.PI)a+=2*Math.PI;return a};
 const A=window.__drvA=window.__drvA||[];const T=()=>__qa.t;const an=(k,d)=>{A.push({k,t:+T().toFixed(1),x:Math.round(RO.x),z:Math.round(RO.z),y:+RO.y.toFixed(1),d})};
 let si=-1,pi=0,dir=1;const pick=(q,hint)=>{si=q.si;pi=q.i;const p=q.p;const f=p.tx*Math.sin(RO.h)+p.tz*Math.cos(RO.h);dir=hint||(f>=0?1:-1)};
 if(RO.foot!=='car'){try{window.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyE'}));window.dispatchEvent(new KeyboardEvent('keyup',{code:'KeyE'}))}catch(e){}}
 {const q=cityAt(RO.x,RO.z,-1,true);if(q)pick(q)}
 let turnT=8+R()*10,boostT=0,lx=RO.x,lz=RO.z,pT=0,gasHeld=true,stuckN=0,px=RO.x,pz=RO.z,cx=camera.position.x,cy=camera.position.y,cz=camera.position.z,under=0,flo=0,pm={},jamT=0,dist=0,warps=0;
 const DT=.05,N=Math.round(simSec/.25);
 for(let n=0;n<N;n++){
  try{if(window.__tq&&__tq.skip)__tq.skip();if(RO.pOpen&&typeof roamPauseClose==='function')roamPauseClose();if(RO.card){const b=document.getElementById('rcNo');if(b&&b.offsetWidth)b.click();else if(RO.card.close)RO.card.close()}}catch(e){}
  if(RO.foot!=='car'){key('KeyW',false);window.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyE'}));window.dispatchEvent(new KeyboardEvent('keyup',{code:'KeyE'}));}
  // street following
  let S=CITY_S[si];if(!S){const q=cityAt(RO.x,RO.z,-1,true);if(q){pick(q);S=CITY_S[si]}}
  let tx=RO.x+Math.sin(RO.h)*10,tz=RO.z+Math.cos(RO.h)*10;
  if(S){const P=S.pts;let g=0;while(g++<200){const p=P[pi];if(!p)break;if(Math.hypot(p.x-RO.x,p.z-RO.z)>12)break;pi+=dir}
   if(pi<0||pi>=P.length){const e=P[Math.max(0,Math.min(P.length-1,pi))];const q=cityAt(e.x,e.z,si,true);if(q&&q.d<30*30){pick(q, R()<.5?1:-1);const p2=CITY_S[si].pts[pi];const nx=CITY_S[si].pts[pi+dir];if(nx&&((nx.x-p2.x)*Math.sin(RO.h)+(nx.z-p2.z)*Math.cos(RO.h))<-0.5*Math.hypot(nx.x-p2.x,nx.z-p2.z))dir=-dir}else{dir=-dir;pi=Math.max(0,Math.min(P.length-1,pi))}}
   const p=CITY_S[si].pts[Math.max(0,Math.min(CITY_S[si].pts.length-1,pi))];tx=p.x;tz=p.z;
   // keep right: offset 2.5 m right of the lane direction
   const hx=tx-RO.x,hz=tz-RO.z,hl=Math.hypot(hx,hz)||1;tx+=hz/hl*-2.5*0;tz+=0;}
  turnT-=.25;if(turnT<=0){turnT=8+R()*14;const q=cityAt(RO.x,RO.z,si,true);if(q&&q.d<64){pick(q,R()<.5?1:-1);an('turn',CITY_S[si].r&&CITY_S[si].r.n||si)}}
  const hd=Math.atan2(tx-RO.x,tz-RO.z),err=W(hd-RO.h);
  key('KeyA',err>.06);key('KeyD',err<-.06);
  boostT-=.25;if(boostT<=-6&&R()<.08)boostT=2;key('ShiftLeft',boostT>0);
  const slow=Math.abs(err)>.7&&RO.v>14;key('KeyW',!slow);key('KeyS',false);
  if(opt.fine){for(let f=0;f<5;f++){const ax=RO.x,az=RO.z,ay=RO.y;__qa.step(1,DT);const j=Math.hypot(RO.x-ax,RO.z-az);if(j>2.5||Math.abs(RO.y-ay)>3)A.push({k:'frame',t:+__qa.t.toFixed(2),x:+RO.x.toFixed(1),z:+RO.z.toFixed(1),y:+RO.y.toFixed(1),d:'from '+ax.toFixed(1)+','+az.toFixed(1)+','+ay.toFixed(1)+' v '+RO.v.toFixed(1)+' vy '+(RO.vy||0).toFixed?.(1)+' air '+!!(pl&&pl.air)+' g '+groundAt(RO.x,RO.z).toFixed(1)+' keys '+Object.keys(RO).filter(k=>/^(v|k|f|r|w|s)[a-zA-Z]{0,3}$/.test(k)&&typeof RO[k]==='number'&&Math.abs(RO[k])>20).map(k=>k+'='+RO[k].toFixed(0)).join(',')})}}else __qa.step(5,DT);
  // anomalies
  const dx=RO.x-px,dz=RO.z-pz,mv=Math.hypot(dx,dz);dist+=Math.min(mv,20);
  if(mv>25){an('teleport',mv.toFixed(0)+' m in 0.25 s; from '+Math.round(px)+','+Math.round(pz)+' st '+(typeof state!=='undefined'?state:'?')+' sp '+!!RO.sp+' ch '+(RO.ch&&(RO.ch.id||RO.ch.name||Object.keys(RO.ch).slice(0,4).join('/')))+' foot '+RO.foot+' v '+RO.v.toFixed(0)+' para '+!!(RO.para||RO.chute||pl&&pl.air)+' banner '+[...document.querySelectorAll('#roam *')].filter(e=>e.offsetWidth&&e.children.length===0&&/[a-z]{4}/i.test(e.textContent)).map(e=>e.textContent.trim().slice(0,30)).slice(0,4).join('|'));warps++;const q=cityAt(RO.x,RO.z,-1,true);if(q)pick(q)}
  const c=camera.position,cj=Math.hypot(c.x-cx,c.y-cy,c.z-cz);if(cj>Math.max(8,mv*1.6+4)&&mv<=25)an('camjump',cj.toFixed(1)+' m (car '+mv.toFixed(1)+')');cx=c.x;cy=c.y;cz=c.z;
  let g=NaN;try{g=groundAt(RO.x,RO.z)}catch(e){}
  if(RO.foot==='car'&&isFinite(g)){if(RO.y<g-0.8){if(++under===4)an('under',(g-RO.y).toFixed(1)+' m below ground')}else under=0;
   if(RO.y>g+2.5&&!(pl&&pl.air)){if(++flo===8)an('float',(RO.y-g).toFixed(1)+' m above ground, not air')}else flo=0}
  px=RO.x;pz=RO.z;pT+=.25;
  if(pT>=3){const d=Math.hypot(RO.x-lx,RO.z-lz);if(d<3&&RO.foot==='car'&&!RO.frozen){let jam=false;try{for(const cc of HUB.cars||[])if(cc.x!=null&&Math.hypot(cc.x-RO.x,cc.z-RO.z)<8)jam=true}catch(e){}
    an(jam?'stuck_traffic':'stuck',d.toFixed(1)+' m in 3 s; v '+RO.v.toFixed(1)+' street '+(CITY_S[si]&&CITY_S[si].r&&CITY_S[si].r.n||si));stuckN++;
    key('KeyW',false);key('KeyS',true);key('KeyA',R()<.5);if(opt.fine){for(let f=0;f<20;f++){const ax=RO.x,az=RO.z,ay=RO.y,ah=RO.h,av=RO.v;__qa.step(1,DT);const j=Math.hypot(RO.x-ax,RO.z-az);if(j>2.5||Math.abs(RO.y-ay)>3)A.push({k:'frameU',t:+__qa.t.toFixed(2),x:+RO.x.toFixed(1),z:+RO.z.toFixed(1),y:+RO.y.toFixed(1),d:'from '+ax.toFixed(1)+','+az.toFixed(1)+','+ay.toFixed(1)+' h '+ah.toFixed(2)+' v0 '+av.toFixed(1)+' v '+RO.v.toFixed(1)+' air '+!!(pl&&pl.air)+' foot '+RO.foot+' wk '+!!RO.wk+' state '+state})}}else __qa.step(20,DT);key('KeyS',false);key('KeyA',false);
    if(stuckN>=3){stuckN=0;const q=rfSnap(RO.x+(R()-.5)*80,RO.z+(R()-.5)*80,150);if(q&&roamWarp(q[0],q[1],q[2])){an('unstick_warp','');}const q2=cityAt(RO.x,RO.z,-1,true);if(q2)pick(q2);px=RO.x;pz=RO.z}}else stuckN=0;lx=RO.x;lz=RO.z;pT=0}
  // prompts that stay
  if(n%8===0){for(const el of document.querySelectorAll('#roam *,.prompt,[id*=rompt],[id*=card]')){if(!el.offsetWidth||el.children.length>2)continue;const st=getComputedStyle(el);if(st.visibility==='hidden'||+st.opacity<.1)continue;const tx2=(el.textContent||'').trim().slice(0,60);if(!tx2||/^[\d .:,km\/h%+-]*$/.test(tx2))continue;const k=(el.id||el.className)+'|'+tx2;pm[k]=(pm[k]||0)+2}}
  // traffic pile-up
  if(n%8===0){try{const cs=(HUB.cars||[]).filter(cc=>cc.x!=null&&!(cc.dead>0)&&Math.hypot(cc.x-RO.x,cc.z-RO.z)<150&&Math.abs(cc.v||cc.sp||0)<.3);let pile=0;for(const a of cs){let k=0;for(const b of cs)if(a!==b&&Math.hypot(a.x-b.x,a.z-b.z)<9)k++;if(k>=3)pile++}if(pile){if(++jamT===4)an('traffic_pile',pile+' stopped cars in a cluster of ≥4 within 9 m')}else jamT=0}catch(e){}}
 }
 for(const c of Object.keys(held))key(c,false);
 const longP=Object.entries(pm).filter(([k,v])=>v>=30).map(([k,v])=>k+' ~'+v+'s');
 return {sim:simSec,dist:Math.round(dist),warps,longPrompts:longP,bugs:(window.__bugs||[]).length}
}})()
