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

// ---- GO onegame/race-roundtrip (og2, one game S2): every Race Mode race has a city marker; one card tap starts it; finish/quit returns to the exact spot + heading without a menu.
// Per race: park on the marker (the stop opens the card; a prompt tap would count as a tap), tap GO, wait for the countdown/race, end the race (DNF clock) or quit, tap #roamBack, measure.
// a real tap: the element must be shown, sized and the TOP element at its centre (elementFromPoint); a covered or hidden element fails the check (no .click() on the element itself)
function OG2_tap(sel){const el=$(sel);if(!el||el.hidden||!el.getClientRects().length)return'hidden';const r=el.getBoundingClientRect();if(r.width<4||r.height<4)return'hidden';const x=r.left+r.width/2,y=r.top+r.height/2,top=document.elementFromPoint(x,y);if(!top||!(top===el||el.contains(top)))return'covered by '+(top?(top.id||top.className||top.tagName):'nothing');
 const o={bubbles:true,cancelable:true,clientX:x,clientY:y,pointerType:'touch',isPrimary:true};for(const t of['pointerdown','mousedown','pointerup','mouseup'])top.dispatchEvent(t.startsWith('p')?new PointerEvent(t,o):new MouseEvent(t,o));top.dispatchEvent(new MouseEvent('click',o));return'ok'}
async function OG2_trip(key,how,save){const m=RO.marks.find(q=>markKey(q)===key);if(!m)return{key,err:'no marker'};
 const p0=prof();if(save==='fresh'){store.set('mho_prof',Object.assign({},p0,{xp:0}))}else if(save==='used'){store.set('mho_prof',Object.assign({},p0,{xp:Math.max(p0.xp,20000)}))}const lv0=lvlOf(prof().xp),bad=[],wait=async(f,ms)=>{for(let k=0;k<ms/50&&!f();k++)await ogWait(50);return f()},built0=RO.built,grp0=RO.grp;
 RO.x=m.x-Math.sin(m.h)*14;RO.z=m.z-Math.cos(m.h)*14;RO.h=RO.vh=m.h;RO.v=0;RO.y=groundAt(RO.x,RO.z,RO.y);RO.cool=0;camSnap=true;let taps=0;
 await wait(()=>RO.card===m||RO.pm===m||RO.pmNew===m,4000);if(RO.card!==m){if(!roamPromptOpen())roamOpen(m);taps++}
 const x0=RO.x,z0=RO.z,h0=RO.h,cardTxt=$('#roamCard').textContent,cl=/(\d+) laps?/.exec(cardTxt);taps++;const t1r=OG2_tap('#rcGo');if(t1r!=='ok'){bad.push('PLAY '+t1r);$('#rcGo').click()}
 const started=await wait(()=>['countdown','race'].includes(state)&&RC,15000),type=started?RC.type+'/'+(RC.world?RC.world.p:RC.track||''):'-';if(started&&cl&&+cl[1]!==RC.laps)bad.push('card says '+cl[1]+' laps, race runs '+RC.laps);
 await ogWait(400);const t0=performance.now();let back=0;
 if(how==='quit'){togglePause(true);const q=$('#quitBtn');if(!/CITY/i.test(q.textContent))bad.push('pause button says '+q.textContent);const r=OG2_tap('#quitBtn');if(r!=='ok')bad.push('quit '+r);back=1}
 else{await wait(()=>state==='race',6000);if(state==='race')raceT=Math.max(raceT,236);await wait(()=>state==='results'&&!$('#roamBack').hidden,15000);await ogWait(1500);const r=OG2_tap('#roamBack');if(r!=='ok')bad.push('BACK TO FREE ROAM '+r+(r==='ok'?'':' (level-up '+(!$('#r3Up').hidden)+')'));else back=1}
 const t1=performance.now();await wait(()=>state==='roam'&&RO.on&&!LD.busy,8000);const ms=Math.round(performance.now()-t1+(how==='quit'?0:0));
 const dh=Math.abs(Math.atan2(Math.sin(RO.h-h0),Math.cos(RO.h-h0))),dp=Math.hypot(RO.x-x0,RO.z-z0);
 const lv1=lvlOf(prof().xp);if(save==='fresh'&&how==='finish'&&lv1<=lv0)bad.push('fresh save did not level up (test is vacuous)');return{key,save,lv:lv0+'>'+lv1,bad,type,how,taps,back,ms,dp:+dp.toFixed(1),dh:+dh.toFixed(3),reuse:RO.built===built0&&RO.grp===grp0,menu:!$('#menu').hidden,roam:state==='roam'&&RO.on}}
async function OG2_roundtrip(){const e0=OGG.errs;for(let k=0;k<200&&!(state==='roam'&&pl&&RO.built&&!LD.busy);k++)await ogWait(100);
 if(!OD_FLAG('og2')){const n=RO.marks.filter(q=>q.og2).length;return n===0?'📍 RACE ROUNDTRIP → ✅ PASS (flag og2 OFF: 0 og2 markers, nothing changed)':'📍 RACE ROUNDTRIP → ❌ FAIL (flag OFF but '+n+' og2 markers)'}
 const prof0=prof(),ath=CID==='ath',L=ath?[['rm_akro','finish'],['PAPPAS','quit'],['rm_synt','finish']]:[['rm_grand','finish'],['rm_cup','quit'],['rm_hafen','finish']],R=[];
 for(const sv of['fresh','used'])for(const[k,h]of L){const r=await OG2_trip(k,h,sv);R.push(r);if(r.err)continue}
 const bad=[];for(const r of R){if(r.err){bad.push(r.key+' '+r.err);continue}if(!r.type||r.type==='-')bad.push(r.key+' not started');if(r.taps>2)bad.push(r.key+' taps '+r.taps);if(r.back!==1)bad.push(r.key+' no single back tap');for(const b of r.bad||[])bad.push(r.key+' ('+r.save+') '+b);if(!r.roam||r.menu)bad.push(r.key+' not back in the city');if(r.dp>5||r.dh>.2)bad.push(r.key+' pos '+r.dp+'m '+r.dh+'rad');if(!r.reuse)bad.push(r.key+' hub rebuilt');if(r.ms>10000)bad.push(r.key+' back '+r.ms+'ms')}
 store.set('mho_prof',prof0);if(OGG.errs!==e0)bad.push((OGG.errs-e0)+' page errors');window.__og2Res=R;
 return`📍 RACE ROUNDTRIP (${CID}) · ${R.map(r=>r.err?r.key+' '+r.err:`${r.key}/${r.save} lv${r.lv} ${r.type} taps ${r.taps} · ${r.how} → city ${r.ms} ms · ${r.dp} m ${r.dh} rad · hub ${r.reuse?'reused':'REBUILT'}`).join(' | ')} → ${bad.length?'❌ FAIL ('+bad.join('; ')+')':'✅ PASS'}`}
(function OG2_reg(i){const C=window.__chk;if(C&&C.GO&&C.items){if(!C.items.some(q=>q.ver==='onegame'&&q.id==='race-roundtrip'))C.items.push({ver:'onegame',id:'race-roundtrip',area:'race',text:'og2 · onegame/race-roundtrip: every Race Mode race has a city marker, 1 card tap starts it, finish/quit returns to the exact spot and heading (<= 5 m, 0.2 rad) without a menu, hub reused, 0 errors (flag og2; OFF: no og2 markers)'});
  C.GO['onegame/race-roundtrip']=[{c:'fra',n:'Race round trip (Frankfurt)',secs:300,fn:()=>OG2_roundtrip()},{c:'ath',n:'Race round trip (Athens)',secs:300,fn:()=>OG2_roundtrip()}];return}
 if(i<600)setTimeout(()=>OG2_reg(i+1),100)})(0);
window.__og2={run:OG2_roundtrip,trip:OG2_trip};

// ---- GO onegame/hud (og3, one game S3): ONE HUD kit in roam, Race Mode and the builder DRIVE: the same element ids visible, every HUD text >= 12 px,
// 0 HUD rects over the touch controls (852x393 and portrait 390x844), and the GAS button present in all 3 modes. Flag OFF: no #hk, nothing changed.
const OG3_IDS=['hkSpd','hkPlace','hkLap','hkTime','hkBoost','hkMap'],OG3_TXT=['hkSpdN','hkSpdU','hkPlace','hkLap','hkTime'],OG3_CT=['tL','tR','tG','tB','tN','tD','tF','tP','bxL','bxR','bxG','bxB','bxBo','bxPz','bxRsp','bxBack'];   // bx*: the builder's own drive buttons when og1 is off
function OG3_vis(e){if(!e)return null;const r=e.getBoundingClientRect(),cs=getComputedStyle(e);if(r.width<=0||r.height<=0||cs.visibility!=='visible'||cs.display==='none'||+cs.opacity<.05)return null;
 for(let a=e;a&&a!==document.body;a=a.parentElement)if(a.hidden||getComputedStyle(a).display==='none')return null;return r}
function OG3_probe(){const bad=[],R={},ct=[];for(const id of OG3_IDS){const r=OG3_vis(document.getElementById(id));if(!r)bad.push('#'+id+' hidden');else R[id]=r}
 for(const id of OG3_TXT){const e=document.getElementById(id),f=e?parseFloat(getComputedStyle(e).fontSize):0;if(!(f>=12))bad.push('#'+id+' '+f+'px')}
 for(const id of OG3_CT){const r=OG3_vis(document.getElementById(id));if(r)ct.push([id,r])}
 let ov=0;for(const id of['hkSpd','hkPlace','hkLap','hkTime','hkMap']){const a=R[id];if(!a)continue;for(const[cid,b]of ct)if(Math.min(a.right,b.right)-Math.max(a.left,b.left)>1&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>1){ov++;bad.push('#'+id+' over #'+cid)}}
 const gas=!!ct.find(c=>c[0]==='tG'||c[0]==='bxG');if(!gas)bad.push('no GAS');return{bad,gas,ids:Object.keys(R).length,ov}}
async function OG3_mode(name,out){for(const[w,h]of[[852,393],[390,844]]){if(window.__vp){await window.__vp(w,h);await ogWait(500)}else if(w!==innerWidth)continue;
  let p=OG3_probe();for(let k=0;k<6&&p.bad.length;k++){await ogWait(400);p=OG3_probe()}out.push({m:name,vp:w+'x'+h,...p})}}
async function OG3_hud(){const e0=OGG.errs;
 if(!OG3){const clean=!document.getElementById('hk')&&!document.body.classList.contains('og3');return clean?'📍 HUD KIT → ✅ PASS (flag og3 OFF: no #hk, nothing changed)':'📍 HUD KIT → ❌ FAIL (flag OFF but #hk exists)'}
 for(let k=0;k<200&&!(state==='roam'&&pl&&RO.built&&!LD.busy);k++)await ogWait(100);if(!(state==='roam'&&pl))return'📍 HUD KIT → ❌ FAIL (no roam)';
 const out=[];await ogWait(600);await OG3_mode('roam',out);
 try{await XC_need('98b2_builder2')}catch(e){}for(let k=0;k<100&&!(window.__bx&&window.__bx.raceStart);k++)await ogWait(100);const X=window.__bx;
 if(X){X.raceStart('CLIFF RUN');await ogWait(1500);await OG3_mode('builder',out);try{X.close()}catch(e){}await ogWait(600)}else out.push({m:'builder',vp:'-',bad:['builder chunk not loaded'],gas:0,ids:0,ov:0});
 if(window.__vp)await window.__vp(852,393);
 if(window.__rm){const L=window.__rm.list(),i=Math.max(0,L.findIndex(n=>/race|grand/i.test(n)&&!/city|duel|sprint/i.test(n)));window.__rm.open(i);
  for(let k=0;k<300&&!(state==='race'||state==='countdown');k++)await ogWait(100);await ogWait(1500);await OG3_mode('race',out)}else out.push({m:'race',vp:'-',bad:['__rm missing'],gas:0,ids:0,ov:0});
 const bad=out.filter(o=>o.bad.length),fail=bad.map(o=>o.m+' '+o.vp+': '+o.bad.slice(0,3).join(', ')),err=OGG.errs-e0;window.__ogRes3=out;
 const sum=['roam','builder','race'].map(m=>{const q=out.filter(o=>o.m===m);return q.length?`${m} ${q.every(o=>!o.bad.length)?'✔':'✘'} (ids ${q.map(o=>o.ids+'/6').join(' ')}, gas ${q.every(o=>o.gas)?'yes':'NO'}, overlaps ${q.reduce((a,o)=>a+o.ov,0)})`:m+' ✘ not run'}).join(' · ');
 return`📍 HUD KIT · ${sum} · text >= 12 px · ${err} page errors → ${fail.length||err?'❌ FAIL ('+fail.concat(err?[err+' errors']:[]).join('; ')+')':'✅ PASS'}`}
(function OG3_reg(i){const C=window.__chk;if(C&&C.GO&&C.items){if(!C.items.some(q=>q.ver==='onegame'&&q.id==='hud'))C.items.push({ver:'onegame',id:'hud',area:'phone',text:'og3 · onegame/hud: one HUD kit: the same element ids (speed pill, place, lap, time, boost, minimap slot) visible in roam, Race Mode and the builder DRIVE, every HUD text >= 12 px, 0 HUD rects over the touch controls at 852x393 and 390x844, a GAS button in all 3 modes, 0 errors (flag og3; OFF: no #hk)'});
  C.GO['onegame/hud']=[{c:'fra',n:'One HUD kit (3 modes)',secs:180,fn:()=>OG3_hud()}];return}
 if(i<600)setTimeout(()=>OG3_reg(i+1),100)})(0);
window.__og3={run:OG3_hud,probe:OG3_probe};
