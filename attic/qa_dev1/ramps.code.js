(()=>{const r=AB_netChk();const L=AB_AUTO.map((Z,i)=>[i,Z.name,Z.auto,Z.pts.map(p=>p.map(Math.round)),r.rampHits[i]]);
 const FR=hubRoads(),nB=BRIDGES.length,ext=OB_ext(FR,nB),N=OB_net(null,ext),fd=[];FR.forEach((q,k)=>{const I=ext.info[k];for(const e of[0,1])if(!I.endJ[e]){const[x,z]=OB_fpt(q,e?q.L:0);fd.push([Math.round(x),Math.round(z),Math.round(q.L),I.J.length,+q.ux.toFixed(2),+q.uz.toFixed(2),e])}});
 return{L,fd,ops:RD.ops}})()
