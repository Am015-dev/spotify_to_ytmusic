// ===== RV14 (rev-1 bug hunter, 2026-10-14): checklist GO + auto checks for the bugs found in the beta.27 teleport sweep (qa_rv1/).
// RV14_go(kind,say) is called from the GO map in 99c_checklist.js (items tagged rv:2026-10-14). say(t) updates the GO message later (async checks).
// Every check returns a one-line verdict with ✅ / ❌ so tools/tChkGo.js can score it.
function RV14_vis(id){const e=typeof id==='string'?document.getElementById(id):id;if(!e)return null;const r=e.getBoundingClientRect(),cs=getComputedStyle(e);if(cs.display==='none'||cs.visibility==='hidden'||+cs.opacity===0||r.width<2||r.height<2)return null;return r}
function RV14_ovl(a,b){if(!a||!b)return 0;const w=Math.min(a.right,b.right)-Math.max(a.left,b.left),h=Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top);return w>1&&h>1?Math.round(w*h):0}
// screen rect of the player's ride (8 corners of its world box projected)
// xform-1: visible meshes only (setFromObject also counted the hidden off-road/boat forms and helpers: the box spanned −566…972 px in portrait)
function RV14_carBox(){try{const m=pl.mesh;m.updateMatrixWorld(true);const b=new THREE.Box3(),bb=new THREE.Box3(),v=new THREE.Vector3();
  m.traverse(o=>{if(!o.isMesh||o.isSprite||!o.geometry)return;for(let q=o;q;q=q.parent){if(!q.visible)return;if(q===m)break}if(o.material&&(o.material.transparent&&o.material.opacity<.6||o.material.blending===THREE.AdditiveBlending))return;if(!o.geometry.boundingBox)o.geometry.computeBoundingBox();bb.copy(o.geometry.boundingBox).applyMatrix4(o.matrixWorld);b.union(bb)});if(b.isEmpty())return null;let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
  for(let i=0;i<8;i++){v.set(i&1?b.max.x:b.min.x,i&2?b.max.y:b.min.y,i&4?b.max.z:b.min.z).project(camera);const x=(v.x+1)/2*innerWidth,y=(1-v.y)/2*innerHeight;x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y)}
  y1=y0+(y1-y0)*.8;/* bottom 20 %: shadow + contact patches, not body */return{left:x0,right:x1,top:y0,bottom:y1,width:x1-x0,height:y1-y0,L:Math.max(b.max.x-b.min.x,b.max.z-b.min.z)}}catch(e){return null}}
function RV14_mark(kind,id,nth){const L=RO.marks.filter(m=>m.kind===kind&&(!id||(m.ev&&m.ev.id===id)));return L[nth||0]}
function RV14_near(m,d){const h=m.h!=null?m.h:0,q=rfSnap(m.x-Math.sin(h)*d,m.z-Math.cos(h)*d,80);roamWarp(q?q[0]:m.x,q?q[1]:m.z,q&&q[2]!=null?q[2]:h);camSnap=true}
function RV14_start(kind,id,nth){const m=RV14_mark(kind,id,nth);if(!m)return false;RV14_near(m,10);roamOpen(m);setTimeout(()=>{try{roamGo()}catch(e){}},250);return true}
function RV14_ride(id,cb){try{gbOpen();GAR_select(id)}catch(e){return cb('ride '+id+': '+e)}let n=0;const w=()=>{if((typeof LDL==='undefined'||!LDL.wait.size)||++n>60){try{gbClose(true)}catch(e){}setTimeout(()=>cb(null),150)}else setTimeout(w,100)};setTimeout(w,200)}
function RV14_pairs(P){const bad=[];for(const[a,b]of P){const A=a==='CAR'?RV14_carBox():RV14_vis(a),B=b==='CAR'?RV14_carBox():RV14_vis(b),o=RV14_ovl(A,B),lim=(a==='CAR'||b==='CAR')?.5*Math.min(A?A.width*A.height:1e9,B?B.width*B.height:1e9):40;if(o>lim)bad.push(a+'×'+b+' '+o+'px²')}return bad}
// RV14_reset (rev-2): clean drive before every rv14 GO and after the auto checks that start something (Hot Drop, rival race):
//   no mission/race/sprint, back in the car (not sitting/on foot), garage/card/map closed, camera snapped. The GO warps after this.
const RV14={ride0:null};
function RV14_reset(){const T=f=>{try{f()}catch(e){}};
 T(()=>{if(typeof OG!=='undefined'&&OG.ev)OG_end(null,1)});T(()=>{if(RO.ch)chAbort()});T(()=>{if(RO.sp)sprintEnd()});T(()=>{RO.wk=null});
 T(()=>{OF.sit=null});T(()=>OF_reset());T(()=>{const g=document.getElementById('gbx');if(g&&!g.hidden)gbClose(false)});
 T(()=>{RO.card=null;RO.cardPin=0;const c=document.getElementById('roamCard');if(c)c.hidden=true});T(()=>{if(RO.mapOpen)toggleMap(false)});
 T(()=>{if(state!=='roam')enterRoam()});T(()=>{RO.v=0;RO.vy=0;RO.frozen=false;camSnap=true})}
function RV14_go(kind,say){RV14_reset();if(RV14.ride0==null)try{RV14.ride0=GAR_get().sel}catch(e){}
 const P=innerHeight>innerWidth?'portrait':'landscape',ok=b=>b?' ✅':' ❌';
 if(kind==='card'){const m=RV14_mark('quest','q_ball');if(!m)return'📍 no Giant Ball marker ❌';RV14_near(m,14);roamOpen(m);RO.cardPin=1;
  setTimeout(()=>{const c=document.getElementById('roamCard');if(!RV14_vis(c))return say('📍 GIANT BALL CARD ('+P+') did not open ❌');const bt=['rcGo','rcNo'].map(RV14_vis),bad=[];let narrow=0;
   for(const e of c.querySelectorAll('*')){if(e.id==='rcGo'||e.id==='rcNo'||e.closest('#rcGo,#rcNo'))continue;if(!e.childNodes.length||![...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim().length>2))continue;const r=RV14_vis(e);if(!r)continue;
    for(const b of bt)if(RV14_ovl(r,b)>40)bad.push((e.textContent||'').trim().slice(0,14));if((e.textContent||'').trim().length>40&&r.width<150)narrow++}
   say('📍 GIANT BALL CARD ('+P+') · buttons over text: '+bad.length+(bad[0]?' ("'+bad[0]+'")':'')+' · narrow text blocks (<150 px): '+narrow+ok(!bad.length&&!narrow))},700);
  return'📍 GIANT BALL CARD · checking…'}
 if(kind==='hud'){if(!RV14_start('quest','m1_hotdrop'))return'📍 no Hot Drop marker ❌';
  const sk=setInterval(()=>{try{__tq&&__tq.skip&&__tq.skip()}catch(e){}},200);setTimeout(()=>{clearInterval(sk);if(!RV14_vis('roamGauge'))return say('📍 HOT DROP HUD ('+P+') · driving HUD not on screen (cutscene?) ❌');const bad=RV14_pairs([['raceW','tP'],['b2kM','tL'],['b2kM','tR'],['npcSay','roamMini'],['roamArrow','roamMini'],['rgSpd','CAR']]);
   say('📍 HOT DROP HUD ('+P+') · overlaps: '+(bad.join(' · ')||'none')+ok(!bad.length));RV14_reset()},3500);return'📍 HOT DROP HUD · checking…'}
 if(kind==='race'){if(!RV14_start('rival',null,0))return'📍 no rival marker ❌';
  setTimeout(()=>{const bad=RV14_pairs([['hPos','spd'],['pos','spd'],['hTime','tP']]),bx=new THREE.Box3().setFromObject(pl.mesh),inside=bx.containsPoint(camera.position);
   say('📍 RIVAL RACE START ('+P+') · overlaps: '+(bad.join(' · ')||'none')+' · camera inside the car: '+(inside?'yes':'no')+ok(!bad.length&&!inside));RV14_reset()},4000);return'📍 RIVAL RACE · checking…'}
 if(kind==='garage'){gbOpen();setTimeout(()=>{const d=RV14_vis('ogArea');let root=null;for(const e of document.querySelectorAll('button,div'))if(/SHOWROOM/.test(e.textContent||'')&&RV14_vis(e)){root=e}while(root&&root.parentElement&&getComputedStyle(root).position!=='fixed')root=root.parentElement;
   let min=99,tiny=0;if(root)for(const e of root.querySelectorAll('*')){if(![...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim().length>1)||!RV14_vis(e))continue;const f=parseFloat(getComputedStyle(e).fontSize);min=Math.min(min,f);if(f<9)tiny++}
   say('📍 GARAGE ('+P+') · text blocks under 9 px: '+tiny+' (smallest '+min.toFixed(0)+' px) · district chip: '+(d?'visible over the garage':'hidden')+ok(!tiny&&!d))},1500);return'📍 GARAGE · checking…'}
 if(kind==='cam'){const L=['rod','t_bus','rod','t_truck'],res=[];let i=0;
  const next=()=>{if(i>=L.length){const d0=res[0].d,good=res[1].d>=1.3*d0&&res[2].d>=.8*d0&&res[2].d<=1.2*d0&&res[3].d>=1.3*d0;const v='📍 RIDE SWITCH CAMERA · camera distance: '+res.map(r=>r.id+' '+r.d.toFixed(1)+' m').join(' · ')+' (bus/truck ≥ 1.3× hot rod, hot rod again ±20 %)'+ok(good);RV14_ride(RV14.ride0||'rod',()=>say(v));return}/* verdict only once your own ride is back: the next GO must not start mid-switch */
   const id=L[i++];const sw=(i===1&&id===(RV14.ride0||'rod'))?(c=>c(null)):(c=>RV14_ride(id,c));/* the first rod is skipped when it is already your ride */sw(err=>{if(err){res.push({id,d:0});return next()}/* state assert: wait for the camera fit to land (CAM.pend 0) and the distance to settle; a fixed 450 ms read the old ride's camera on a slow first run */let k=0,last=-1,still=0;const dd=()=>camera.position.distanceTo(pl.mesh.position),fin=()=>{res.push({id,d:dd()});next()},w=()=>{const d=dd(),pend=window.__cam&&__cam.S&&__cam.S.pend;still=Math.abs(d-last)<.05?still+1:0;last=d;if((!pend&&still>=3)||++k>160)fin();else setTimeout(w,50)};setTimeout(w,100)})};next();return'📍 RIDE SWITCH CAMERA · switching hot rod → bus → hot rod → truck…'}
 if(kind==='median'){const q=rfSnap(704,605,80);roamWarp(q[0],q[1],q[2]);camSnap=true;const c=cityAt(RO.x,RO.z),lat=c?Math.abs(c.lat):99,w=c?c.S.r.w:0;
  return'📍 RESPAWN ON ANLAGENRING (road '+w+' m) · car '+lat.toFixed(1)+' m from the centre line (min 2.5: in a lane, not on the green median)'+ok(lat>=2.5||w<24)}
 if(kind==='tilt'){const S=[[6500,4000,'Königstein road'],[3250,5850,'Kurpark Bad Homburg']],res=[];let i=0;
  const next=()=>{if(i>=S.length){const bad=res.filter(r=>!r.ok);say('📍 HILL SPAWNS · '+res.map(r=>r.t).join(' · ')+ok(!bad.length));return}
   const[x,z,n]=S[i++],q=rfSnap(x,z,150);roamWarp(q?q[0]:x,q?q[1]:z,q&&q[2]!=null?q[2]:0);camSnap=true;
   setTimeout(()=>{let k=null;try{k=OF_parkChk()}catch(e){}const up=new THREE.Vector3(0,1,0).applyQuaternion(pl.mesh.getWorldQuaternion(new THREE.Quaternion())),tilt=Math.acos(Math.min(1,up.y))*180/Math.PI,gap=k?Math.max(...k.tyre.map(Math.abs)):9;
    res.push({ok:tilt<15&&gap<=.05,t:n+' tilt '+tilt.toFixed(0)+'° tyre gap '+gap.toFixed(2)+' m'});next()},1500)};next();return'📍 HILL SPAWNS · checking…'}
 if(kind==='filo'){const q=rfSnap(2200,-2600,150);roamWarp(q?q[0]:2200,q?q[1]:-2600,q&&q[2]!=null?q[2]:0);camSnap=true;
  setTimeout(()=>{const inCar=!!SC_hit(RO.x,RO.z,RO.y),c=camera.position,inCam=!!roamHit(c.x,c.z,.3,c.y);say('📍 FILOPAPPOU ROAD · car inside a building: '+(inCar?'yes':'no')+' · camera inside a building: '+(inCam?'yes':'no')+ok(!inCar&&!inCam))},1200);return'📍 FILOPAPPOU ROAD · checking…'}
 if(kind==='athfoot'){const r=OF_go('car');return r+(/No clear|first/i.test(r)?' ❌ (GO cannot get out at the Athens start, Eleni\'s garage)':' ✅')}
 if(kind==='fest'){let n=0;const go=()=>{const m=RO.marks.find(q=>q.ev&&(q.ev.id==='e_fest'||/Festival/.test(q.ev.name||'')));if(!m){if(++n<3)return setTimeout(go,250);const t=QV_ENC.find(q=>q.id==='e_fest'),q=rfSnap(RO.x+40,RO.z+40,150);if(!t||!q)return say('📍 Festival Delivery marker not on the map ❌');qvEncMark(t,q[0],q[1],q[2]||0,7,1);return go()}RV14_near(m,10);roamOpen(m);setTimeout(()=>{try{roamGo()}catch(e){}},250);
  setTimeout(()=>{const g=RO.ch&&RO.ch.crates;if(!g||!g.children.length)return say('📍 FESTIVAL DELIVERY START · no crates loaded ❌');const C=new THREE.Box3(),B=new THREE.Box3();g.updateMatrixWorld(true);C.setFromObject(g);
   g.parent.children.forEach(o=>{if(o!==g&&o.visible&&!o.userData.cargo)B.expandByObject(o)});const c=C.getCenter(new THREE.Vector3()),b=B.getCenter(new THREE.Vector3()),dh=Math.hypot(c.x-b.x,c.z-b.z),hl=Math.max(B.max.x-B.min.x,B.max.z-B.min.z)/2,on=dh<hl&&C.min.y>B.max.y-.3;
   say('📍 FESTIVAL DELIVERY START · '+g.children.length+' crates ride on the car roof (centre '+dh.toFixed(1)+' m from car centre, half-length '+hl.toFixed(1)+'; bottom '+(C.min.y-B.max.y).toFixed(2)+' m vs roof), no brown slab on the road'+ok(on))},2200)};go();
  return'📍 FESTIVAL DELIVERY START · checking the crates…'}
 if(kind==='black'){roamWarp(706,564,Math.PI,true);camSnap=true;let dark=0,n=0,em=0;try{for(const k of['com','sub']){const m=KMM[k];if(!m||!m.map||!m.map.image)continue;n++;if(m.emissiveMap&&m.emissiveMap!==m.map)em++;
   const im=m.map.image,c=document.createElement('canvas');c.width=im.width;c.height=im.height;const x=c.getContext('2d');x.drawImage(im,0,0);const d=x.getImageData(0,0,c.width,c.height).data;
   for(let i=0;i<d.length;i+=4){const mx=Math.max(d[i],d[i+1],d[i+2]),mn=Math.min(d[i],d[i+1],d[i+2]);if(d[i+3]>8&&mx>=24&&mx<=105&&mx-mn<=30)dark++}}}catch(e){}
  return'📍 ZEIL WEST (706,564) · look right: glass facades read as blue-grey glass with window lines, no wall renders flat black · auto: '+n+' Kenney atlases, dark-glass texels left '+dark+', glass-only glow '+em+'/'+n+ok(n>=1&&!dark&&em===n)}
 return'📍 unknown rv14 kind '+kind+' ❌'}
// ===== RV15 (rev-2, 2026-10-14): monkey-bot STUCK clusters (test-1 0b34d0c2, beta.41). GO = spawn in the cluster, hold GAS (real key events
// through the game's own handlers) for 3 s of game time, PASS when the car moved ≥ 5 m. Root cause found: street-life set pieces (seesaw at the
// Athens start) and Athens dressing props took 20-30 % speed EVERY frame of contact whatever the angle → now glancing hits slide (LIFE_slide).
const RV15_SPOTS={'fra-west':['fra',-925,225,0],'fra-start':['fra',-375,475,0],'fra-north':['fra',-475,775,0],'fra-corner':['fra',7990,6990,-2.36],
 'ath-start':['ath',1986.4,-1651.9,.85],'ath-psyrri':['ath',2125,-1675,0],'ath-north':['ath',2775,6525,0],'ath-sw':['ath',-6475,-3375,0]};
function RV15_go(id,say){const S=RV15_SPOTS[id];if(!S)return'📍 unknown spot '+id+' ❌';RV14_reset();const[,x,z,h]=S;if(!roamWarp(x,z,h,true))return'📍 '+id+' · can\'t jump right now ❌';RO.v=0;camSnap=true;
 const K=on=>dispatchEvent(new KeyboardEvent(on?'keydown':'keyup',{code:'KeyW',key:'KeyW',bubbles:true}));let x0=0,z0=0,t=0,last=0,ph=0;
 const f=now=>{if(ph===0){if(!last){last=now;return requestAnimationFrame(f)}if(now-last<400)return requestAnimationFrame(f);if(RO.card){const b=document.getElementById('rcNo');if(b)b.click();/* the Athens start pops the pinned ✈ Flights card: tap LATER like a player */}x0=RO.x;z0=RO.z;K(true);ph=1;last=now;return requestAnimationFrame(f)}
  t+=Math.min(.05,(now-last)/1000);last=now;if(RO.card){const b=document.getElementById('rcNo');if(b)b.click()}if(t<3&&Math.hypot(RO.x-x0,RO.z-z0)<5)return requestAnimationFrame(f);/* state, not time: stop once the car has moved 5 m */K(false);const d=Math.hypot(RO.x-x0,RO.z-z0);
  say('📍 STUCK CLUSTER '+id+' ('+Math.round(x)+','+Math.round(z)+') · gas moved the car '+d.toFixed(1)+' m in '+t.toFixed(1)+' s (≥ 5 m within 3 s)'+(d>=5?' ✅':' ❌'))};
 requestAnimationFrame(f);return'📍 STUCK CLUSTER '+id+' · holding GAS 3 s…'}

// rev-3 (Alex: "where is the bug to send inside the game"): the 🐞 button is on the HUD at all times; SEND writes a record to the shared db 'bugs' collection (mocked here)
function RV16_bug(say){const b=document.getElementById('qaBugTop');if(!b||!window.__qa)return'📍 BUG BUTTON · missing (QA kit not loaded?) ❌';
 const r=b.getBoundingClientRect(),bad=[];if(r.width<40||r.height<40||r.left<0||r.top<0||r.right>innerWidth||r.bottom>innerHeight||getComputedStyle(b).display==='none')bad.push('size/visibility '+Math.round(r.width)+'×'+Math.round(r.height));
 for(const id of['tP','tL','tR','tG','tB','roamMini','roamGauge','spd','hPos']){const A=RV14_vis(id);if(A&&RV14_ovl({left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height},A)>0)bad.push('over #'+id)}
 const got=[];window.__qaDbMock={collection:n=>({add:async d=>{got.push([n,d]);return{}}})};b.click();const sh=document.getElementById('qaSheet'),open=sh&&sh.style.display==='block';document.getElementById('qaNote').value='GO test report';document.getElementById('qaSend').click();
 let n=0;const iv=setInterval(()=>{const m=document.getElementById('qaMsg').textContent;if(m.indexOf('Sent')<0&&++n<40)return;clearInterval(iv);delete window.__qaDbMock;const rec=got[0]&&got[0][1],kb=rec&&rec.shot?Math.round(rec.shot.length*.75/1024):-1;
  const ok=!bad.length&&open&&got.length===1&&got[0][0]==='bugs'&&rec.note==='GO test report'&&rec.build&&rec.city&&/^http/.test(rec.repro)&&Array.isArray(rec.errors)&&Array.isArray(rec.bugs)&&kb>0&&kb<=150&&m.indexOf('Sent')>=0;
  document.getElementById('qaCancel').click();say('📍 BUG BUTTON · '+Math.round(r.width)+'×'+Math.round(r.height)+' px at '+Math.round(r.left)+','+Math.round(r.top)+(bad.length?' · '+bad.join(', '):' · clear of the controls')+' · sheet '+(open?'opens':'did NOT open')+' · SEND wrote '+got.length+' record to "bugs"'+(rec?' (shot '+kb+' KB, '+rec.errors.length+' errors, '+rec.bugs.length+' bugs)':'')+' · "'+m+'"'+(ok?' ✅':' ❌'))},150);return'📍 BUG BUTTON · tapping 🐞 → SEND…'}

// rev-3 (Alex's first 🐞 report, Athens on foot @899.7,-1033): street turbine between apartment blocks, js_error null [1] (freed GPU array), pale slab in the foot camera
function RV16_turb(say){const S=[[899.7,-1033],[2074,-1637],[1986,-1652],[525,-1629]],bad=[];let n=0;
 for(const[x,z]of S){const q=rfSnap(x,z,80);if(!q)continue;roamWarp(q[0],q[1],q[2]);for(let i=0;i<150;i++)roamStep(1/30);const L=window.__life&&window.__life.LIFE;for(const it of((L&&L.H)||[])){if(it.c!=='set'||(it.t!=='turbine'&&it.t!=='windmill'))continue;n++;if(roamHit(it.x,it.z,15,it.y+.5))bad.push(it.t+'@'+Math.round(it.x)+','+Math.round(it.z))}}
 return('📍 STREET TURBINES · '+n+' turbines/windmills near 4 Athens street spots, '+bad.length+' within 15 m of a building'+(bad.length?' ('+bad.slice(0,3).join(' ')+')':'')+(bad.length?' ❌':' ✅'))}
function RV16_freed(say){let freed=0,thrown=0;scene.traverse(o=>{const g=o.geometry;if(!g||!g.attributes)return;for(const k in g.attributes){const a=g.attributes[k];if(a&&a.isBufferAttribute&&a.array===null){freed++;try{a.getX(0);a.getY(0);a.getZ(0)}catch(e){thrown++}}}});
 return('📍 FREED GPU ARRAYS · '+freed+' attributes with the CPU array freed after upload, '+thrown+' throw on getY (null reading 1)'+(thrown?' ❌':' ✅'))}
function RV16_near(say){const r=OF_go('car');let n=0;const iv=setInterval(()=>{if((RO.foot==='car'||!RO.foot)&&++n<60)return;clearInterval(iv);for(let i=0;i<30;i++)roamStep(1/30);const nf=camera.near;
  say('📍 FOOT NEAR-CLIP · on foot camera.near '+nf.toFixed(2)+' m (0.4–1.1, grows with the camera distance)'+((RO.foot&&RO.foot!=='car'&&nf>=.4&&nf<=1.1)?' ✅':' ❌'))},200);return'📍 FOOT NEAR-CLIP · getting out…'}

// rev-3 (Alex on PC: could not type in the 🐞 note): keys typed in the box never reach the game, held keys are released on open, Enter = SEND, Esc = close, the box has focus
function RV16_type(say){const b=document.getElementById('qaBugTop'),sh=document.getElementById('qaSheet'),ta=document.getElementById('qaNote');if(!b||!ta)return'📍 BUG TYPING · missing ❌';
 K.KeyW=true;K.KeyD=true;TOUCH.gas=true;const got=[];window.__qaDbMock={collection:()=>({add:async d=>{got.push(d);return{}}})};b.click();const rel=!K.KeyW&&!K.KeyD&&!TOUCH.gas;
 setTimeout(()=>{const foc=document.activeElement===ta,bad=[];let pd=0,reached=0;const probe=e=>{reached++};addEventListener('keydown',probe);
  for(const c of['KeyW','KeyA','KeyS','KeyD','Space','KeyE','KeyF']){const e=new KeyboardEvent('keydown',{code:c,key:c==='Space'?' ':c[3].toLowerCase(),bubbles:true,cancelable:true});ta.dispatchEvent(e);if(e.defaultPrevented)pd++;ta.dispatchEvent(new KeyboardEvent('keyup',{code:c,bubbles:true}))}
  removeEventListener('keydown',probe);const held=Object.keys(K).filter(k=>K[k]);ta.value='wasd ';
  ta.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',code:'Enter',bubbles:true,cancelable:true}));
  setTimeout(()=>{const sent=got.length===1&&got[0].note==='wasd ';ta.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',code:'Escape',bubbles:true,cancelable:true}));const closed=sh.style.display==='none';delete window.__qaDbMock;
   const ok=rel&&foc&&!reached&&!pd&&!held.length&&sent&&closed;
   say('📍 BUG TYPING · held keys released on open: '+rel+' · note box focused: '+foc+' · 7 game keys typed: reached the game '+reached+', blocked from typing '+pd+', held keys after '+held.length+' · Enter sent "wasd ": '+sent+' · Esc closed: '+closed+(ok?' ✅':' ❌'))},700)},300);return'📍 BUG TYPING · typing wasd into the note…'}
