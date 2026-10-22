// let-cars-climb-r22e17 GO clb/climb (WIP, out of the why gate until it passes): the car drives up a ~35 deg Taunus slope at gas (TR_climbWin in 85_audio_feel_sp_otg.js) and does not climb a building wall.
//   climb: a clear off-road fall line, >= 33 deg for >= 10 m, 30+ m long; the car starts at its foot at 12 m/s facing up with the gas held, heading held on the fall line.
//   Pass: reaches the crest (y >= crest - 1.5 m) within 9 s; the old window is run on the same line as INFO.
//   wall: the car faces a building 8 m away with the gas held for 4 s. Pass: never more than 1 m over the ground line and never inside the collider.
function CLB_line(){const B=[WX0+120,WX1-120,WZS+120,WZN-120],r=[];const gr=(x,z)=>{const[gx,gz]=TR_grad(x,z,2);return[gx,gz,Math.atan(Math.hypot(gx,gz))]};
  for(let x=B[0];x<B[1];x+=17)for(let z=B[2];z<B[3];z+=17){let g;try{g=roamTerr(x,z,999).g}catch(e){continue}if(!(g>2))continue;const[gx,gz,th]=gr(x,z);if(th<.58||th>.66)continue;
    // walk up and down the fall line in 2 m steps
    const s=Math.hypot(gx,gz),ux=gx/s,uz=gz/s;let top=null,steep=0,ok=true;for(let d=2;d<=60;d+=2){const px=x+ux*d,pz=z+uz*d,q=gr(px,pz);if(roamHit(px,pz,2.4,roamTerr(px,pz,999).g)||TR8_onRoad(px,pz)){ok=false;break}if(q[2]>.58)steep+=2;if(q[2]>.72){ok=false;break}if(q[2]<.2){top=[px,pz];break}}
    if(!ok||!top||steep<6)continue;let base=null;for(let d=2;d<=50;d+=2){const px=x-ux*d,pz=z-uz*d,q=gr(px,pz);if(roamHit(px,pz,2.4,roamTerr(px,pz,999).g)){ok=false;break}if(q[2]>.72){ok=false;break}if(q[2]<.2&&d>=16){base=[px,pz];break}}
    if(!ok||!base)continue;steep+=0;r.push({x,z,base,top,steep,th,ux,uz,len:Math.hypot(top[0]-base[0],top[1]-base[1])})}
  r.sort((a,b)=>b.steep-a.steep||b.th-a.th);return r}
function CLB_run(L,win){const T0=TR_CLB;TR_CLB=win;for(const k in K)K[k]=false;const h=Math.atan2(L.ux,L.uz),[bx,bz]=L.base,[tx,tz]=L.top,tY=(()=>{let m=-1e9;for(let k=0;k<=40;k++){const f=k/40;m=Math.max(m,roamTerr(bx+(tx-bx)*f,bz+(tz-bz)*f,999).g)}return m})();   /* the crest of the line (the top point can sit past it, lower) */
  roamWarp(bx,bz,h);RO.x=bx;RO.z=bz;RO.h=RO.vh=h;RO.y=groundAt(bx,bz,99);RO.vy=0;RO.v=12;ESC_end();SKH_reset();K.ArrowUp=true;let tr=[],t=0,top=false,maxTh=0,y0=RO.y,warp=RO.t6n||0;
  try{for(;t<9;t+=1/30){const e=Math.atan2(Math.sin(Math.atan2(tx-RO.x,tz-RO.z)-RO.h),Math.cos(Math.atan2(tx-RO.x,tz-RO.z)-RO.h));RO.h=RO.vh=h;roamStep(1/30);   /* heading held on the fall line: the climb grip is under test, not the steering */if(Math.round(t*30)%15===0)tr.push(Math.round(RO.v)+'/'+(RO.trSlope?Math.round(RO.trSlope.th*57.3):'-')+'/'+(RO.trGrip??1).toFixed(1)+'/'+RO.y.toFixed(0)+(TR_live()?'':'!L')+(RO.trDeck?'D':'')+'/e'+Math.round(e*57.3)+'/s'+Math.round((RO.x-bx)*L.ux+(RO.z-bz)*L.uz)+'/q'+Math.round(-(RO.x-bx)*L.uz+(RO.z-bz)*L.ux)+'/h'+Math.round(Math.atan2(Math.sin(RO.h-h),Math.cos(RO.h-h))*57.3));if((RO.t6n||0)!==warp){tr.push('warp');break}
    if(RO.trSlope)maxTh=Math.max(maxTh,RO.trSlope.th);if(RO.y>=tY-1.5){top=true;break}}}
  finally{for(const k in K)K[k]=false;TR_CLB=T0}return{top,t:+t.toFixed(1),maxDeg:Math.round(maxTh*57.3),dy:+(RO.y-y0).toFixed(1),need:+(tY-y0).toFixed(1),tr:tr.join(' ')}}
function CLB_wall(){const cx=RO.x,cz=RO.z;for(let r=20;r<400;r+=15)for(let a=0;a<6.28;a+=.4){const x=cx+Math.sin(a)*r,z=cz+Math.cos(a)*r,g=roamTerr(x,z,999).g;if(!roamHit(x,z,.5,g))continue;
    // step back from the collider to a free spot 8 m out, the car facing it
    for(const b of[0,1.57,-1.57,3.14]){const ux=Math.sin(a+b),uz=Math.cos(a+b);let f=0;for(let d=1;d<6;d++)if(!roamHit(x-ux*d,z-uz*d,.5,g)){f=d;break}if(!f)continue;const sx=x-ux*(f+8),sz=z-uz*(f+8);
      if(roamHit(sx,sz,2.8,roamTerr(sx,sz,999).g)||Math.abs(roamTerr(sx,sz,999).g-g)>1.5)continue;return{sx,sz,h:Math.atan2(ux,uz)}}}return null}
function CLB_go(){const out=[];let bad=0;const p0=[RO.x,RO.z,RO.h],ws=say;say=()=>{};
  try{const L=CLB_line();if(!L.length){out.push('no 35 deg line found FAIL');bad++}
    for(const l of L.slice(0,2)){const n=CLB_run(l,true),o=CLB_run(l,false);if(!n.top)bad++;out.push(`slope ${Math.round(l.th*57.3)}deg ${l.steep} m steep, climb ${n.need} m: new top ${n.top} in ${n.t}s (max ${n.maxDeg}deg) · old top ${o.top} (dy ${o.dy})`+(n.top?'':' FAIL ['+n.tr+']'))}
    roamWarp(p0[0],p0[1],p0[2]);RO.x=p0[0];RO.z=p0[1];const W=CLB_wall();if(!W){out.push('no wall found FAIL');bad++}else{for(const k in K)K[k]=false;roamWarp(W.sx,W.sz,W.h);RO.x=W.sx;RO.z=W.sz;RO.h=RO.vh=W.h;RO.y=groundAt(W.sx,W.sz,99);RO.v=6;RO.vy=0;ESC_end();SKH_reset();K.ArrowUp=true;let up=0,ins=0;
      for(let i=0;i<120;i++){roamStep(1/30);up=Math.max(up,RO.y-roamTerr(RO.x,RO.z,RO.y+.3).g);if(roamHit(RO.x,RO.z,.3,RO.y))ins++}K.ArrowUp=false;const ok=up<=1&&ins===0;if(!ok)bad++;out.push(`wall: max ${up.toFixed(2)} m over the ground, ${ins} frames inside`+(ok?'':' FAIL'))}}
  catch(e){bad++;out.push('threw '+String(e).slice(0,80)+' FAIL')}
  finally{say=ws;for(const k in K)K[k]=false;SKH_reset();ESC_end();RO.v=0;RO.vy=0;roamWarp(p0[0],p0[1],p0[2]);RO.x=p0[0];RO.z=p0[1];RO.h=RO.vh=p0[2];RO.y=groundAt(p0[0],p0[1],99)}
  return'📍 clb/climb · '+out.join(' · ')+' → '+(bad?'❌ FAIL':'✅ PASS')}
{const reg=setInterval(()=>{if(!window.__chk||!__chk.GO)return;clearInterval(reg);
 __chk.items.unshift({ver:'clb',id:'climb',area:'drive',text:'let-cars-climb-r22e17 (Alex: "no stuck on hills"): with the gas held the car climbs terrain to ~40 deg (46 deg max at speed) and does not slide back; buildings stay walls. 📍 GO drives up the 2 steepest clear ~35 deg Taunus fall lines at gas from their foot (pass: reaches the top within 9 s; old window shown as INFO) and into a building wall for 4 s (pass: never > 1 m over the ground, never inside). Flag ?clb=1, default OFF (the GO switches it on for its own runs).'});
 __chk.GO['clb/climb']=[{c:'fra',n:'climb Frankfurt',secs:60,fn:()=>CLB_go()}]},500)}
