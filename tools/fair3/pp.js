// analog pure-pursuit "careful human": touch pad steering, brakes for corners by curvature-limited speed
window.ppBot=function(P,o={}){const cum=[0];for(let i=1;i<P.length;i++)cum.push(cum[i-1]+Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]));const L=cum[cum.length-1];let ix=0,s=0,still=0,pv=0,rec=0,slow=0;const R={stuck:[],walls:0,maxS:0,recov:0,lagq:[]};const lagN=Math.round((o.lag||0)*30);
 const at=d=>tkAt(P,Math.min(1,Math.max(0,d)/L));
 const f=function(sp){if(sp.cd>0||sp.done)return;let bd=1e9,bi=ix;for(let i=Math.max(0,ix-2);i<Math.min(P.length-1,ix+40);i++){const a=P[i],b=P[i+1],l2=(b[0]-a[0])**2+(b[1]-a[1])**2||1,t=clamp(((RO.x-a[0])*(b[0]-a[0])+(RO.z-a[1])*(b[1]-a[1]))/l2,0,1),d=Math.hypot(a[0]+(b[0]-a[0])*t-RO.x,a[1]+(b[1]-a[1])*t-RO.z);if(d<bd){bd=d;bi=i;s=cum[i]+t*Math.sqrt(l2)}}ix=bi;R.maxS=Math.max(R.maxS,s);
  const v=Math.abs(RO.v),wet=RO.veh==='boat',T=at(s+(o.look||8)+v*(o.lv||.5)),e0=angDiff(Math.atan2(T.x-RO.x,T.z-RO.z),RO.h);R.lagq.push(e0);const e=R.lagq.length>lagN?R.lagq[R.lagq.length-1-lagN]:0;if(R.lagq.length>60)R.lagq.shift();
  TOUCH.on=TOUCH.used=true;TOUCH.sid=1;SET.touch='drag';K.ArrowLeft=K.ArrowRight=false;
  if(rec>0){rec-=1/30;TOUCH.target=0;TOUCH.brake=false;K.ArrowUp=K.KeyW=false;K.ArrowDown=true;TOUCH.target=clamp(e0*1.5,-1,1);TOUCH.brake=true;return}
  if(sp.t>2&&v<2.5){if(++slow>45){slow=0;rec=1;R.recov++;(R.rp=R.rp||[]).push([Math.round(RO.x),Math.round(RO.z),Math.round(sp.t),Math.round(s)])}}else slow=0;
  TOUCH.target=clamp(-e*(o.k||2.2),-1,1);R.e=e0;R.T=T;R.vt=0;
  // target speed from the sharpest turn in the next 10..60 m
  let vt=99;for(let d=6;d<=60;d+=6){const a1=at(s+d-6),a2=at(s+d+6),cu=Math.abs(angDiff(a2.h,a1.h))/12;const vmax=Math.sqrt((o.lat||7)/Math.max(cu,1e-3));vt=Math.min(vt,Math.sqrt(vmax*vmax+2*(o.dec||8)*Math.max(0,d-8)))}
  const brake=v>vt+1.5;TOUCH.brake=brake;K.ArrowDown=brake;K.ArrowUp=K.KeyW=!brake;
  if(v<1.5)still++;else still=0;if(still===60){R.stuck.push([Math.round(RO.x),Math.round(RO.z),+sp.t.toFixed(0)]);still=0}
  if(pv>14&&v<pv*.5)R.walls++;pv=v};f.R=R;return f};
window.ppRace=function(drv,opt,secs){const sp0=RO.sp;if(sp0)try{sprintEnd()}catch(e){}const m=tkMarkOf(RIVAL_EV.find(e=>e.p===TK_C.p));tkStart(m,TK_C);const sp=RO.sp;sp.cd=0;const G=tkGeoOf(TK_C),bot=drv(G.pA,opt);let lc=0,sg=0,acc=0;const gaps=[];
 tkRun(secs||300,s=>{bot(s);acc+=1/30;if(acc>=1){acc=0;const a=s.ai[0];if(a){const d=Math.sign((s.myS||0)-(a.s||0));if(sg&&d&&d!==sg)lc++;if(d)sg=d;gaps.push(Math.round((s.myS||0)-(a.s||0)))}}});
 const r=TK.last,ab=gaps.map(Math.abs).sort((a,b)=>a-b),o={fin:!!r&&!r.dnf,place:r&&r.place,t:r&&r.t,ai:sp.ai[0]&&sp.ai[0].fin,lc,med:ab[ab.length>>1],fired:sp.fired||0,walls:bot.R.walls,stuck:bot.R.stuck,recov:bot.R.rp,prog:Math.round(bot.R.maxS/tkLen(G.pA)*100),g:gaps.filter((x,i)=>i%10==0)};
 try{$('#spRes').hidden=true}catch(e){}if(RO.sp===sp)try{sprintEnd()}catch(e){}TOUCH.sid=null;TOUCH.target=0;TOUCH.brake=false;TOUCH.used=false;SET.touch='buttons';K.ArrowUp=K.KeyW=K.ArrowLeft=K.ArrowRight=K.ArrowDown=false;return o};
'ok '+typeof tkBot+' '+TK_FAIR
