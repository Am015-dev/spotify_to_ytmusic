(()=>{const FR=hubRoads(),nB=BRIDGES.length,ext=OB_ext(FR,nB),N=OB_net(null,ext),out=[];const ramp=(x,z)=>AB_Z.some(Z=>Math.hypot(Z.pts[0][0]-x,Z.pts[0][1]-z)<25);
 for(const d of N.dead){if(ramp(d.x,d.z))continue;const S=N.segs[d.a];const q=N.proj(d.x,d.z,200,(a,i)=>a!==d.a);const f=fillAt(d.x,d.z);
  const P=S.pts,E=d.e?P[P.length-1]:P[0],F=d.e?P[Math.max(0,P.length-4)]:P[Math.min(P.length-1,3)];
  out.push(['st',Math.round(d.x),Math.round(d.z),S.r.cls,S.r.name||S.r.id,Math.round(S.L),Math.round(d.st),q?Math.round(q.d):-1,f?Math.round(f.d-f.r.w/2):-1,+(Math.atan2(E.x-F.x,E.z-F.z)).toFixed(2)])}
 FR.forEach((r,k)=>{const I=ext.info[k];for(const e of[0,1])if(!I.endJ[e]){const[x,z]=OB_fpt(r,e?r.L:0);if(ramp(x,z))continue;const c=cityAt(x,z);out.push(['fill',Math.round(x),Math.round(z),Math.round(r.L),c?Math.round(c.d-c.road.w/2):-1])}});
 return out})()
