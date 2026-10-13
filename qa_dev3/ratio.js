(async()=>{const F=OF_figBuild();const bb=new THREE.Box3().setFromObject(F.g);const h=bb.max.y-bb.min.y,sc=F.g.scale.y;const o={figH:+h.toFixed(2),scale:+sc.toFixed(2),ped:(typeof SC_K!=='undefined')?SC_K.ped:null};
for(const id of['rod','t_su','t_sc_hy','t_rosso','t_papaya','t_taxi']){const m=await RSZ.meas(GAR_set(id));o[id]=m&&[m.H,+(h/m.H).toFixed(2)]}return o})()
