// ---- GO onegame/builder-car (og1, one game S1, docs/DESIGN_one_game.md): the builder DRIVE uses YOUR roam car: same mesh (makeShip + garage loadout),
// roam top speed, roam camera FOV (RCAM chase + SKC), the shared #touch controls and no builder drive buttons. Measured with the flag OFF (today) and ON in one page.
const OGG={errs:0};window.addEventListener('error',()=>OGG.errs++);
const ogWait=ms=>new Promise(r=>setTimeout(r,ms));
// mesh count + bbox in the car's own frame (heading/roll/pitch taken out, like 96_scale_qa)
function OG_mesh(g){if(!g)return null;const ud=g.userData||{},m=ud.m,q=m&&m.quaternion.clone(),gq=g.quaternion.clone(),gp=g.parent;if(m)m.quaternion.identity();g.quaternion.identity();g.updateMatrixWorld(true);
 const inv=g.matrixWorld.clone().invert(),B=new THREE.Box3(),M=new THREE.Matrix4();let n=0;g.traverseVisible(o=>{if(!o.isMesh||!o.geometry||o.userData.a8s)return;n++;if(!o.geometry.boundingBox)o.geometry.computeBoundingBox();B.union(o.geometry.boundingBox.clone().applyMatrix4(M.multiplyMatrices(inv,o.matrixWorld)))});
 if(m)m.quaternion.copy(q);g.quaternion.copy(gq);g.updateMatrixWorld(true);const s=B.getSize(new THREE.Vector3());return{n,x:+s.x.toFixed(2),y:+s.y.toFixed(2),z:+s.z.toFixed(2)}}
function OG_touch(){const t=document.getElementById('touch');if(!t||t.hidden||getComputedStyle(t).visibility!=='visible')return 0;
 return['tB','tG','tN','steerZone','tL','tR'].filter(id=>{const e=document.getElementById(id);if(!e)return 0;const r=e.getBoundingClientRect();return r.width>0&&getComputedStyle(e).visibility==='visible'}).length}
const OG_BTN='#bx #bxL,#bx #bxR,#bx #bxB,#bx #bxG,#bx #bxBo';
async function OG_builderCar(){const e0=OGG.errs;for(let k=0;k<200&&!(state==='roam'&&pl&&RO.top>0);k++)await ogWait(100);
 if(!(state==='roam'&&pl))return'📍 BUILDER CAR → ❌ FAIL (no roam car)';
 for(let k=0;k<20&&Math.abs(RO.v)>.5;k++)await ogWait(100);   // the roam FOV at rest (the builder FOV is read at rest too)
 const ro={top:+RO.top.toFixed(1),fov:+camera.fov.toFixed(1),mesh:OG_mesh(pl.mesh),team:pl.team&&pl.team.name};
 try{BX_open()}catch(e){}for(let k=0;k<100&&!window.__bx;k++)await ogWait(100);const X=window.__bx;if(!X)return'📍 BUILDER CAR → ❌ FAIL (builder chunk not loaded)';
 if(!X.BX.on)X.open();X.load(X.demos()['CLIFF RUN'],'CLIFF RUN');const out={};
 for(const f of[false,true]){X.og(f);X.drive();await ogWait(900);const B=X.BX,r={mesh:OG_mesh(B.carM),fov:+B.cam.fov.toFixed(1),btn:document.querySelectorAll(OG_BTN).length,touch:OG_touch(),shared:!!B.ship};
  X.stopDrive();const sim=X.sim([],60);r.top=sim.cfgTop;r.vTop=sim.vTop;out[f?'on':'off']=r}
 X.og(null);try{X.close()}catch(e){}
 const on=out.on,M=ro.mesh,Q=on.mesh,w=(a,b)=>b>0&&Math.abs(a/b-1)<=.05,
  C=[['mesh',Q&&M&&Q.n===M.n&&w(Q.x,M.x)&&w(Q.y,M.y)&&w(Q.z,M.z)&&on.shared,`mesh ${Q&&Q.n} parts ${Q&&[Q.x,Q.y,Q.z].join('x')} m vs roam ${M.n} parts ${[M.x,M.y,M.z].join('x')} m (OFF ${out.off.mesh&&out.off.mesh.n} parts ${out.off.mesh&&[out.off.mesh.x,out.off.mesh.y,out.off.mesh.z].join('x')})`],
   ['top',w(on.top,ro.top),`top ${on.top} m/s (lap max ${on.vTop}) vs roam RO.top ${ro.top} (OFF ${out.off.top}, lap max ${out.off.vTop})`],
   ['fov',Math.abs(on.fov-ro.fov)<=2,`FOV ${on.fov}° vs roam ${ro.fov}° (OFF ${out.off.fov}°)`],
   ['touch',on.touch>=2&&on.btn===0,`#touch ${on.touch} controls visible, #bx drive buttons ${on.btn} (OFF: touch ${out.off.touch}, buttons ${out.off.btn})`],
   ['errors',OGG.errs===e0,`${OGG.errs-e0} page errors`]],bad=C.filter(c=>!c[1]).map(c=>c[0]);
 window.__ogRes={ro,out};
 return`📍 BUILDER CAR (${ro.team}, CLIFF RUN) · ${C.map(c=>(c[1]?'✔ ':'✘ ')+c[2]).join(' · ')} → ${bad.length?'❌ FAIL ('+bad.join(',')+')':'✅ PASS'}`}
(function OG_reg(i){const C=window.__chk;if(C&&C.GO&&C.items){if(!C.items.some(q=>q.ver==='onegame'&&q.id==='builder-car'))C.items.push({ver:'onegame',id:'builder-car',area:'race',text:'og1 · onegame/builder-car: the builder DRIVE uses your roam car: same mesh and size as roam (±5 %), top speed = RO.top ±5 %, camera FOV = roam ±2°, the shared #touch controls and no builder drive buttons, no page errors'});
  C.GO['onegame/builder-car']=[{c:'fra',n:'Builder car = roam car',secs:120,fn:()=>OG_builderCar()}];return}
 if(i<600)setTimeout(()=>OG_reg(i+1),100)})(0);
window.__og={run:OG_builderCar,mesh:OG_mesh,ev:s=>eval(s)};   // ev: test harness hook (tools/og1), this chunk is test-only
