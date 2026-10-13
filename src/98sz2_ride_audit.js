// ---- RSZ audit (size-2, 2026-10-13): measures EVERY garage ride (length/width/height in game metres, driver head vs roof) against its class and
// derives the per-ride factor table RSZ.F (98sz_ride_scale.js). Used by the rv: checklist test 'rv-scale' (99c) and qa_dev3/scale_fit.js.
// Class targets (m): car 4-5, van 5-6, bus 11-13, truck 8-12; bike/kart are exempt-sized. Pass = length within ±20 % of the class range AND the seated driver's
// head not above the roofline (closed rides 0.1 m, open cabs 0.5 m).
RSZ.CL={car:[4,5],van:[5,6],bus:[11,13],truck:[8,12],bike:[1.8,2.6],limo:[6,8]};
RSZ.clsOf=(S,L)=>{const n=(S.n||'')+' '+S.id;// L = the ride's natural length (a 'truck' set under 6 m is a small van, not a 8-12 m truck)
 return/\bbus\b/i.test(n)?'bus':/limo/i.test(n)?'limo':/bike(?! hauler)|go-?kart/i.test(n)?'bike':/box truck|big rig|flatbed|logger|snowplow|recycl|dump truck|cement|mixer|loader|tipper truck|hauler|dig master|crane|cargo truck|fire truck|tow truck|bulldozer/i.test(n)&&!(L<6)?'truck'
 :/\bvan\b|pickup|truck|lorry|dumper|tractor|camper|ambulance|tow rig|tanker|sweeper|wagon|loader|mixer|rig\b|hauler/i.test(n)?'van':'car'};
RSZ.open=S=>/bike|kart|tractor|dumper|construction|dozer|loader|rod\b|convertible|roadster|racer|f1|formula|sprint|rally|monster/i.test((S.n||'')+' '+S.id);
RSZ.band=c=>{const r=RSZ.CL[c];return[r[0]*.8,r[1]*1.2]};
// one ride: {L,W,H,stick,roof}; stick = how far the driver's head is above the roof (m, <0 = under it); null = no driver
RSZ.meas=async function(S,f){const b0=gbBuild()||GB.d,F0=RSZ.F[S.id];try{const m=LD_probe(()=>[].concat(GAR_arr(S.car())));if(m&&m.length)await LD_need(m);
  if(f)RSZ.F[S.id]=f;const B=G9C_bricks(S,'car'),hasD=B.some(b=>b&&b.t==='drvM'&&b.y>-90);
  const mk=(B,S2)=>{RSZ.S=S2;const g=shipMesh(gbTeam(TEAMS[teamIdx],Object.assign({},b0,{on:true,bricks:B})));scene.add(g);SC_ship(g,true);CR_fx({boatK:0},g.userData);g.userData.m.updateMatrixWorld(true);return g};
  const top=g=>{const bb=new THREE.Box3();g.userData.m.traverse(o=>{if(!o.isMesh||o.userData.r)return;for(let q=o;q&&q!==g.userData.m;q=q.parent)if(!q.visible)return;if(!o.geometry.boundingBox)o.geometry.computeBoundingBox();bb.union(o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld))});return bb.max.y};
  const g=mk(B,S);CR_PS.k='';const d=BC_dims(g.userData),t1=top(g);let st=null,roof=null;
  if(hasD){const g2=mk(B.map(b=>b&&b.t==='drvM'?Object.assign({},b,{y:-99,hide:1}):b),{id:S.id});roof=top(g2);st=+(t1-roof).toFixed(2);scene.remove(g2)}
  scene.remove(g);return d&&{L:+d.L.toFixed(2),W:+d.W.toFixed(2),H:+d.H.toFixed(2),stick:st,roof:roof&&+roof.toFixed(2)}
 }finally{RSZ.S=null;if(f){if(F0)RSZ.F[S.id]=F0;else delete RSZ.F[S.id]}}};
RSZ.sets=()=>GAR_SETS.filter(s=>s.car&&!/boat/.test(s.id));
// audit: [{id,n,cls,L,stick,ok,why}] ; fit=true also computes the factor that would pass (field f)
RSZ.audit=async function(fit){const out=[];for(const S of RSZ.sets()){const m=await RSZ.meas(S);if(!m)continue;const L1=m.L/(RSZ.F[S.id]||1),c=RSZ.clsOf(S,L1),[lo,hi]=RSZ.band(c),R=RSZ.CL[c];const lim=RSZ.open(S)?.75:.1;
  const why=c==='bus'&&m.L<R[0]?'short':m.L<lo?'short':m.L>hi?'long':m.stick!=null&&m.stick>lim?'head':'';const o={id:S.id,n:S.n,cls:c,L:m.L,H:m.H,stick:m.stick,ok:!why,why};
  if(fit&&why){let f=c==='bus'&&m.L<R[0]?R[0]/L1:m.L<lo?R[0]/L1:m.L>hi?R[1]/L1:RSZ.F[S.id]||1;const cl=v=>Math.min(1.7,Math.max(.6,v));f=cl(f);let x=await RSZ.meas(S,f);
   for(let i=0;i<14&&x&&x.stick!=null&&x.stick>lim&&x.L<hi*1.1&&f<1.7;i++){f=cl(f+.05);x=await RSZ.meas(S,f)}o.f=+f.toFixed(2);o.after=x;o.ok2=!!x&&x.L>=lo&&x.L<=hi&&(x.stick==null||x.stick<=lim)}
  out.push(o)}return out};
// rv:2026-10-13 checklist GO ('v90k/rv-scale'): measures the 6 rides that were worst before size-2, says the verdict, then opens the garage on the first
RSZ.WORST=['t_v6607_1','t_v6609_1','t_v6608_1','t_v6505_1','t_v6501_1','t_bus'];
function RSZ_go(){(async()=>{const bad=[];for(const id of RSZ.WORST){const S=GAR_set(id),m=await RSZ.meas(S);if(!m)continue;const c=RSZ.clsOf(S,m.L/(RSZ.F[id]||1)),[lo,hi]=RSZ.band(c);
  if(m.L<lo||m.L>hi||m.stick!=null&&m.stick>(RSZ.open(S)?.75:.1))bad.push(S.n+' '+m.L+' m')}
 RSZ.res={bad};try{say('',bad.length?'❌ out of class: '+bad.join(' · '):'✅ the 6 worst rides are in class · look at the driver in the garage',4)}catch(e){}
 try{if(!RO.ch&&!RO.sp){gbOpen();setTimeout(()=>GAR_select(RSZ.WORST[0]),700)}}catch(e){}})();return'📍 Measuring 6 rides…'}
