// bc/probe.js <url> [tpl]: equip a template via the saved garage state, enter roam (API), print size/hull numbers
const E=require('./enter.js');const TPL=process.argv[3]||'';(async()=>{const T=await E(process.argv[2]);
 console.log('loaded');if(TPL)console.log('set',await T.ev(`(()=>{const G=GAR_get();G.sel='${TPL}';if(!G.own.includes('${TPL}'))G.own.push('${TPL}');GAR_put(G);GAR_load();return GAR_get().sel})()`));await T.roamApi();console.log('roam');
 console.log(await T.ev(`(()=>{const ud=pl.mesh.userData,s=new THREE.Vector3();ud.m.getWorldScale(s);CR_bodyPts(ud);const B=CR_PS.b;
 return JSON.stringify({sel:GAR_get().sel,sc:[s.x,s.y,s.z].map(v=>+v.toFixed(3)),B:B&&[B.min.toArray(),B.max.toArray()].map(a=>a.map(v=>+v.toFixed(2))),dims:__bc.dims(),ref:BC.ref,hull:__bc.hull(),stats:pl.stats,rc:RCAM.chase})})()`));
 console.log('errs',T.errs.length,T.errs.slice(0,3));await T.b.close()})().catch(e=>{console.log('FAIL',e);process.exit(1)});
