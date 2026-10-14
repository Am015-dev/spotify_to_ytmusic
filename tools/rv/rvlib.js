window.RV={
 mk(k,id,nth){const L=RO.marks.filter(m=>m.kind===k&&(!id||(m.ev&&m.ev.id===id)));return L[nth||0]},
 near(m,d){const h=m.h!=null?m.h:0;const q=rfSnap(m.x-Math.sin(h)*(d||18),m.z-Math.cos(h)*(d||18),80);return roamWarp(q?q[0]:m.x,q?q[1]:m.z,q&&q[2]!=null?q[2]:h)},
 async card(k,id,nth){const m=RV.mk(k,id,nth);if(!m)return'no mark '+k+id;RV.near(m,14);camSnap=true;await new Promise(r=>setTimeout(r,400));roamOpen(m);return'card '+(m.ev&&m.ev.name)},
 async start(k,id,nth){const m=RV.mk(k,id,nth);if(!m)return'no mark '+k+id;RV.near(m,10);await new Promise(r=>setTimeout(r,400));roamOpen(m);await new Promise(r=>setTimeout(r,200));roamGo();await new Promise(r=>setTimeout(r,2500));try{__tq.skip()}catch(e){}return'start '+(m.ev&&m.ev.name)+' state='+state},
 warp(x,z,h){const q=rfSnap(x,z,150);const ok=roamWarp(q?q[0]:x,q?q[1]:z,q&&q[2]!=null?q[2]:(h||0));camSnap=true;return'warp '+ok+' '+(q?q.map(v=>Math.round(v)).join(','):'nosnap')},
 rawWarp(x,z,h){const ok=roamWarp(x,z,h||0,true);camSnap=true;return'raw '+ok},
 async foot(kind,x,z){if(x!=null)RV.warp(x,z);await new Promise(r=>setTimeout(r,300));return OF_go(kind)},
 async ride(id){TQ.car=id;gbOpen();GAR_select(id);let k=0;while(typeof LDL!=='undefined'&&LDL.wait.size&&k++<200)await new Promise(r=>setTimeout(r,25));gbClose(true);await new Promise(r=>setTimeout(r,300));return'ride '+id},
};'rv ok'
RV.footTraffic=async function(big){await new Promise(r=>setTimeout(r,200));const r0=OF_go('npc');await new Promise(r=>setTimeout(r,300));
 const L=OF_cars(true).filter(c=>c.k!=='cur'&&c.k!=='grp').map(c=>({c,d:Math.hypot(c.x-OF.x,c.z-OF.z)})).filter(o=>o.d<200).sort((a,b)=>(big?(b.c.hd-a.c.hd):0)||a.d-b.d);
 if(!L.length)return'no traffic near '+r0;const c=L[0].c;const sx=Math.cos(c.h),sz=-Math.sin(c.h);
 const off=(c.hw||1)+.55;OF.x=c.x+sx*off;OF.z=c.z+sz*off;OF.y=groundAt(OF.x,OF.z,c.y+2);OF.h=c.h;OF.cy=OF.cyIn=OF.h;RO.x=OF.x;RO.z=OF.z;RO.y=OF.y;RO.h=OF.h;
 try{if(c.ref)c.ref.v=0;if(c.ref)c.ref.stop=99}catch(e){}return'beside traffic hw='+(c.hw||0).toFixed(2)+' hd='+(c.hd||0).toFixed(2)+' dy='+(c.y-groundAt(c.x,c.z,c.y+3)).toFixed(2)}
