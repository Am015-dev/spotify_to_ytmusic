// ===== RV14 (rev-1 bug hunter, 2026-10-14): checklist GO + auto checks for the bugs found in the beta.27 teleport sweep (qa_rv1/).
// RV14_go(kind,say) is called from the GO map in 99c_checklist.js (items tagged rv:2026-10-14). say(t) updates the GO message later (async checks).
// Every check returns a one-line verdict with ✅ / ❌ so tools/tChkGo.js can score it.
function RV14_vis(id){const e=typeof id==='string'?document.getElementById(id):id;if(!e)return null;const r=e.getBoundingClientRect(),cs=getComputedStyle(e);if(cs.display==='none'||cs.visibility==='hidden'||+cs.opacity===0||r.width<2||r.height<2)return null;return r}
function RV14_ovl(a,b){if(!a||!b)return 0;const w=Math.min(a.right,b.right)-Math.max(a.left,b.left),h=Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top);return w>1&&h>1?Math.round(w*h):0}
// screen rect of the player's ride (8 corners of its world box projected)
function RV14_carBox(){try{const m=pl.mesh;m.updateMatrixWorld(true);const b=new THREE.Box3().setFromObject(m),v=new THREE.Vector3();let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
  for(let i=0;i<8;i++){v.set(i&1?b.max.x:b.min.x,i&2?b.max.y:b.min.y,i&4?b.max.z:b.min.z).project(camera);const x=(v.x+1)/2*innerWidth,y=(1-v.y)/2*innerHeight;x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y)}
  y1=y0+(y1-y0)*.8;/* bottom 20 %: shadow + contact patches, not body */return{left:x0,right:x1,top:y0,bottom:y1,width:x1-x0,height:y1-y0,L:Math.max(b.max.x-b.min.x,b.max.z-b.min.z)}}catch(e){return null}}
function RV14_mark(kind,id,nth){const L=RO.marks.filter(m=>m.kind===kind&&(!id||(m.ev&&m.ev.id===id)));return L[nth||0]}
function RV14_near(m,d){const h=m.h!=null?m.h:0,q=rfSnap(m.x-Math.sin(h)*d,m.z-Math.cos(h)*d,80);roamWarp(q?q[0]:m.x,q?q[1]:m.z,q&&q[2]!=null?q[2]:h);camSnap=true}
function RV14_start(kind,id,nth){const m=RV14_mark(kind,id,nth);if(!m)return false;RV14_near(m,10);roamOpen(m);setTimeout(()=>{try{roamGo()}catch(e){}},250);return true}
function RV14_ride(id,cb){try{gbOpen();GAR_select(id)}catch(e){return cb('ride '+id+': '+e)}let n=0;const w=()=>{if((typeof LDL==='undefined'||!LDL.wait.size)||++n>60){try{gbClose(true)}catch(e){}setTimeout(()=>cb(null),1200)}else setTimeout(w,100)};setTimeout(w,200)}
function RV14_pairs(P){const bad=[];for(const[a,b]of P){const A=a==='CAR'?RV14_carBox():RV14_vis(a),B=b==='CAR'?RV14_carBox():RV14_vis(b),o=RV14_ovl(A,B),lim=(a==='CAR'||b==='CAR')?.5*Math.min(A?A.width*A.height:1e9,B?B.width*B.height:1e9):40;if(o>lim)bad.push(a+'×'+b+' '+o+'px²')}return bad}
function RV14_go(kind,say){
 const P=innerHeight>innerWidth?'portrait':'landscape',ok=b=>b?' ✅':' ❌';
 if(kind==='card'){const m=RV14_mark('quest','q_ball');if(!m)return'📍 no Giant Ball marker ❌';RV14_near(m,14);roamOpen(m);RO.cardPin=1;
  setTimeout(()=>{const c=document.getElementById('roamCard');if(!RV14_vis(c))return say('📍 GIANT BALL CARD ('+P+') did not open ❌');constbt=['rcGo','rcNo'].map(RV14_vis),bad=[];let narrow=0;
   for(const e of c.querySelectorAll('*')){if(e.id==='rcGo'||e.id==='rcNo'||e.closest('#rcGo,#rcNo'))continue;if(!e.childNodes.length||![...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim().length>2))continue;const r=RV14_vis(e);if(!r)continue;
    for(const b of bt)if(RV14_ovl(r,b)>40)bad.push((e.textContent||'').trim().slice(0,14));if((e.textContent||'').trim().length>40&&r.width<150)narrow++}
   say('📍 GIANT BALL CARD ('+P+') · buttons over text: '+bad.length+(bad[0]?' ("'+bad[0]+'")':'')+' · narrow text blocks (<150 px): '+narrow+ok(!bad.length&&!narrow))},700);
  return'📍 GIANT BALL CARD · checking…'}
 if(kind==='hud'){if(!RV14_start('quest','m1_hotdrop'))return'📍 no Hot Drop marker ❌';
  const sk=setInterval(()=>{try{__tq&&__tq.skip&&__tq.skip()}catch(e){}},200);setTimeout(()=>{clearInterval(sk);if(!RV14_vis('roamGauge'))return say('📍 HOT DROP HUD ('+P+') · driving HUD not on screen (cutscene?) ❌');const bad=RV14_pairs([['raceW','tP'],['b2kM','tL'],['b2kM','tR'],['npcSay','roamMini'],['roamArrow','roamMini'],['rgSpd','CAR']]);
   say('📍 HOT DROP HUD ('+P+') · overlaps: '+(bad.join(' · ')||'none')+ok(!bad.length))},3500);return'📍 HOT DROP HUD · checking…'}
 if(kind==='race'){if(!RV14_start('rival',null,0))return'📍 no rival marker ❌';
  setTimeout(()=>{const bad=RV14_pairs([['hPos','spd'],['pos','spd'],['hTime','tP']]),bx=new THREE.Box3().setFromObject(pl.mesh),inside=bx.containsPoint(camera.position);
   say('📍 RIVAL RACE START ('+P+') · overlaps: '+(bad.join(' · ')||'none')+' · camera inside the car: '+(inside?'yes':'no')+ok(!bad.length&&!inside))},4000);return'📍 RIVAL RACE · checking…'}
 if(kind==='garage'){gbOpen();setTimeout(()=>{const d=RV14_vis('ogArea');let root=null;for(const e of document.querySelectorAll('button,div'))if(/SHOWROOM/.test(e.textContent||'')&&RV14_vis(e)){root=e}while(root&&root.parentElement&&getComputedStyle(root).position!=='fixed')root=root.parentElement;
   let min=99,tiny=0;if(root)for(const e of root.querySelectorAll('*')){if(![...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim().length>1)||!RV14_vis(e))continue;const f=parseFloat(getComputedStyle(e).fontSize);min=Math.min(min,f);if(f<9)tiny++}
   say('📍 GARAGE ('+P+') · text blocks under 9 px: '+tiny+' (smallest '+min.toFixed(0)+' px) · district chip: '+(d?'visible over the garage':'hidden')+ok(!tiny&&!d))},1500);return'📍 GARAGE · checking…'}
 if(kind==='cam'){const L=['rod','t_bus','rod','t_truck'],res=[];let i=0;
  const next=()=>{if(i>=L.length){const d0=res[0].d,good=res[1].d>=1.3*d0&&res[2].d>=.8*d0&&res[2].d<=1.2*d0&&res[3].d>=1.3*d0;RV14_ride('rod',()=>{});say('📍 RIDE SWITCH CAMERA · camera distance: '+res.map(r=>r.id+' '+r.d.toFixed(1)+' m').join(' · ')+' (bus/truck ≥ 1.3× hot rod, hot rod again ±20 %)'+ok(good));return}
   const id=L[i++];RV14_ride(id,err=>{if(err){res.push({id,d:0});return next()}res.push({id,d:camera.position.distanceTo(pl.mesh.position)});next()})};next();return'📍 RIDE SWITCH CAMERA · switching hot rod → bus → hot rod → truck…'}
 if(kind==='median'){const q=rfSnap(704,605,80);roamWarp(q[0],q[1],q[2]);camSnap=true;const c=cityAt(RO.x,RO.z),lat=c?Math.abs(c.lat):99,w=c?c.S.r.w:0;
  return'📍 RESPAWN ON ANLAGENRING (road '+w+' m) · car '+lat.toFixed(1)+' m from the centre line (min 2.5: in a lane, not on the green median)'+ok(lat>=2.5||w<24)}
 if(kind==='tilt'){const S=[[6500,4000,'Königstein road'],[3250,5850,'Kurpark Bad Homburg']],res=[];let i=0;
  const next=()=>{if(i>=S.length){const bad=res.filter(r=>!r.ok);say('📍 HILL SPAWNS · '+res.map(r=>r.t).join(' · ')+ok(!bad.length));return}
   const[x,z,n]=S[i++],q=rfSnap(x,z,150);roamWarp(q?q[0]:x,q?q[1]:z,q&&q[2]!=null?q[2]:0);camSnap=true;
   setTimeout(()=>{let k=null;try{k=OF_parkChk()}catch(e){}const up=new THREE.Vector3(0,1,0).applyQuaternion(pl.mesh.getWorldQuaternion(new THREE.Quaternion())),tilt=Math.acos(Math.min(1,up.y))*180/Math.PI,gap=k?Math.max(...k.tyre.map(Math.abs)):9;
    res.push({ok:tilt<15&&gap<=.05,t:n+' tilt '+tilt.toFixed(0)+'° tyre gap '+gap.toFixed(2)+' m'});next()},1500)};next();return'📍 HILL SPAWNS · checking…'}
 if(kind==='filo'){const q=rfSnap(2200,-2600,150);roamWarp(q?q[0]:2200,q?q[1]:-2600,q&&q[2]!=null?q[2]:0);camSnap=true;
  setTimeout(()=>{const inCar=!!SC_hit(RO.x,RO.z,RO.y),c=camera.position,inCam=!!roamHit(c.x,c.z,.3,c.y);say('📍 FILOPAPPOU ROAD · car inside a building: '+(inCar?'yes':'no')+' · camera inside a building: '+(inCam?'yes':'no')+ok(!inCar&&!inCam))},1200);return'📍 FILOPAPPOU ROAD · checking…'}
 if(kind==='athfoot'){try{__tq&&__tq.reset&&__tq.reset()}catch(e){}const r=OF_go('car');return r+(/No clear|first/i.test(r)?' ❌ (GO cannot get out at the Athens start, Eleni\'s garage)':' ✅')}
 if(kind==='fest'){const m=RO.marks.find(q=>q.ev&&(q.ev.id==='e_fest'||/Festival/.test(q.ev.name||'')));if(!m)return'📍 Festival Delivery marker not on the map yet (visual check skipped)';RV14_near(m,10);roamOpen(m);setTimeout(()=>{try{roamGo()}catch(e){}},250);
  return'📍 FESTIVAL DELIVERY START · look 10-20 m ahead-left: no flat plain-brown box standing on the road and no black square on the asphalt (visual check)'}
 if(kind==='black'){roamWarp(706,564,Math.PI,true);camSnap=true;return'📍 ZEIL WEST (706,564) · look right: every building facade has windows/texture, no wall renders pure black (visual check)'}
 return'📍 unknown rv14 kind '+kind+' ❌'}
