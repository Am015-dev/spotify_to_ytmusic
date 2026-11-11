// ===== HM (home-1, version set at integration). Alex 2026-10-13: "the nitro/boost should be on sports cars only and not all cars unless you modify the car in home.
// I think we should have a save point Home with a garage to store cars".
// HOME = the city garage of each city (Werkstatt Konstablerwache / Garaz Psyrri), its 🔧 beacon becomes 🏠 HOME (pinned on the minimap edge).
//  - driving in (the beacon stop) = SAVE POINT: position + stats saved at once, "💾 SAVED" toast. The card then opens the usual garage (RIDES).
//  - stored cars: up to 4 rides stand parked beside the door; swapping your ride in the garage while at Home parks the old one there.
//  - pause menu: 🏠 HOME = fast travel to it.
// BOOST rule (free roam): built-in nitro only on sports-class rides (HM_sport: the QS sport/super classes, Speed Champions and racing sets,
//  the 🏁 RACERS group, the sports templates, the speed/power boats). Any other ride gets nitro with a NITRO KIT (1,500 studs, installed at Home).
//  Without nitro the BOOST button and boost bar are hidden. Races keep boost for everyone (state 'race', roam sprints RO.sp, rival/mission
//  races = RO.ch with a race path): AI pace and rewards are tuned on boost.
CK.push('mho_home');// per save slot, like mho_gar
const HM={at:false,park:[],P:[],toastT:0,sig:''};
const HM_KIT=1500,HM_NP=4;
const HM_REF=new Set(['75870','75878','75892','75893','76897','75895','1517','30572','6501','6503','6509','6526','6530','6605','6609','6669','4641','4643']);
const HM_IDS=new Set(['t_rosso','t_bianco','t_papaya','t_silver','t_viola','t_flame','t_racer','t_su_v8','t_sc_f1']);
function HM_sport(S){if(!S)return false;const q=typeof QS_CLS!=='undefined'&&QS_CLS[S.id];return q==='spSport'||q==='spSuper'||S.grp==='racers'||HM_IDS.has(S.id)||!!(S.ref&&HM_REF.has(String(S.ref)))}
const HM_form=()=>CR_MODE==='boat'?'boat':CR_MODE==='4x4'?'off':'car';
function HM_curSet(){try{return GAR_set(G9C_eq(HM_form()))}catch(e){return GAR_set()}}
const HM_kits=()=>GAR_get().nk||[];
const HM_has=S=>!!S&&(HM_sport(S)||HM_kits().includes(S.id));
// races keep boost for everyone
function HM_race(){if(state!=='roam')return true;if(RO.sp)return true;const c=RO.ch;return !!(c&&c.v2&&c.v2.L&&c.v2.L.rp)}
function HM_ok(){return HM_race()||HM_has(HM_curSet())}
ctlPlayer=(f=>function(){const c=f.apply(this,arguments);try{if(c&&c.boost&&state==='roam'&&!document.body.classList.contains('onfoot')&&!HM_ok())c.boost=0}catch(e){}return c})(ctlPlayer);
// ---- the home beacon
const HM_isHome=m=>!!m&&m.kind==='garage'&&(!m.id||m.id==='g_city');
const HM_mark=()=>(RO.marks||[]).find(HM_isHome)||null;
mapIcon=(f=>function(m){return HM_isHome(m)?'🏠':f.apply(this,arguments)})(mapIcon);
markTitle=(f=>function(m){return HM_isHome(m)?'Home · '+f.apply(this,arguments):f.apply(this,arguments)})(markTitle);
function HM_toast(t){let e=document.getElementById('hmToast');if(!e){e=document.createElement('div');e.id='hmToast';(document.getElementById('roam')||document.body).appendChild(e)}
 e.textContent=t;e.classList.remove('on','side');e.style.left=e.style.top=e.style.maxWidth='';void e.offsetWidth;HM_toastPlace(e);e.classList.add('on');clearTimeout(HM.toastT);HM.toastT=setTimeout(()=>e.classList.remove('on'),2200)}
// reviewer (39d31f2): the toast sat on the Home card's title. When it would touch the card, it moves into the free column left of the card, under the minimap.
function HM_toastPlace(e){const c=document.getElementById('roamCard'),R=x=>x&&x.getBoundingClientRect(),cr=R(c);if(!cr||cr.width<4||getComputedStyle(c).display==='none')return;
 const tr=R(e),hit=!(tr.right<cr.left||tr.left>cr.right||tr.bottom<cr.top||tr.top>cr.bottom);if(!hit)return;const mm=R(document.getElementById('roamMini')||document.getElementById('mini')),top=mm&&mm.height>4?mm.bottom+10:120;
 e.classList.add('side');e.style.left='10px';e.style.top=top+'px';e.style.maxWidth=Math.max(90,cr.left-20)+'px'}
function HM_save(){try{pstatFlush()}catch(e){}roamSavePos();const H=store.get('mho_home',{});H[CID]={t:Date.now(),car:GAR_get().sel};H.last=CID;store.set('mho_home',H);HM.saves=(HM.saves||0)+1;HM_toast('💾 SAVED · HOME');try{AU.sfx('pick')}catch(e){}}
roamOpen=(f=>function(m){const r=f.apply(this,arguments);try{if(HM_isHome(m)&&state==='roam'){HM.at=true;HM_save()}}catch(e){console.warn('HM',e)}return r})(roamOpen);
// ---- stored cars: the old ride is parked at Home when you swap there
function HM_parkList(){const H=store.get('mho_home',{}),sel=GAR_get().sel;let L=(H.park||[]).filter(id=>id!==sel&&GAR_SETS.some(s=>s.id===id));
 if(!H.park){const fav=(GAR_get().fav||[]).map(k=>k.split('|')).filter(a=>a[1]==='car').map(a=>a[0]);L=[...fav,'t_v6651_1','t_v4208_1','t_v75870_1','rod'].filter((id,i,a)=>a.indexOf(id)===i&&id!==sel&&GAR_SETS.some(s=>s.id===id))}
 return L.slice(0,HM_NP)}
GAR_select=(f=>function(id){const p=GAR_get().sel;f.apply(this,arguments);try{const n=GAR_get().sel;if(HM.at&&p!==n){const H=store.get('mho_home',{});H.park=[p,...HM_parkList().filter(x=>x!==p&&x!==n)].slice(0,HM_NP);store.set('mho_home',H);HM.sig=''}}catch(e){console.warn('HM',e)}})(GAR_select);
// parking slots beside the door (the door is 24 m wide at the building's -z face, the beacon stands in front of it)
function HM_slots(){const L=typeof LM_BY!=='undefined'&&LM_BY[CID==='ath'?'Garaz Psyrri':'Werkstatt Konstablerwache'];if(!L)return[];const ath=CID==='ath',GD=ath?22:34,z=L.z-GD/2-3.6,X=ath?[14,17.4]:[15.5,19.5];
 return[[L.x-X[0],z],[L.x+X[0],z],[L.x-X[1],z],[L.x+X[1],z]]}
function HM_carMesh(S){const B=G9C_bricks(S,'car'),t=Object.assign({},gbTeam(TEAMS[teamIdx]||TEAMS[0],GB.d||null),{gbB:B,gbF:null,gbP:1}),g=shipMesh(t),U=g.userData;
 for(const k of['boat','shield','flares','under'])if(U[k])U[k].visible=false;for(const rb of U.ribbons||[])rb.visible=false;try{SC_ship(g,false)}catch(e){}return g}
// box of the visible meshes only (the hidden shield / boat would put the car in the air)
function HM_box(g){const B=new THREE.Box3(),b=new THREE.Box3();g.updateMatrixWorld(true);g.traverse(o=>{if(!o.isMesh||!o.geometry)return;for(let a=o;a;a=a.parent)if(!a.visible)return;if(!o.geometry.boundingBox)o.geometry.computeBoundingBox();b.copy(o.geometry.boundingBox).applyMatrix4(o.matrixWorld);B.union(b)});return B}
function HM_clear(){for(const o of HM.P){o.parent&&o.parent.remove(o);o.traverse(m=>{if(m.isMesh&&m.geometry&&!m.userData.gbc&&!m.userData.keep)m.geometry.dispose()})}HM.P=[]}
function HM_build(){if(!RO.on||!RO.grp)return;const L=HM_parkList(),sig=CID+'|'+L.join(',');if(sig===HM.sig&&HM.P.length)return;const miss=LD_probe(()=>[].concat(...L.map(id=>G9C_bricks(GAR_set(id),'car'))));if(miss.length){if(!HM.ld){HM.ld=1;LD_need(miss).then(()=>{HM.ld=0;HM.sig='';HM_build()})}return}/* LDraw rides load on demand */
 HM.sig=sig;HM_clear();const Q=HM_slots();
 L.forEach((id,i)=>{const q=Q[i];if(!q)return;try{const g=HM_carMesh(GAR_set(id));const y=groundY(q[0],q[1]);g.position.set(q[0],y,q[1]);g.rotation.y=Math.PI;g.updateMatrixWorld(true);
  const bb=HM_box(g);if(Number.isFinite(bb.min.y))g.position.y+=y-bb.min.y;g.userData.hmId=id;RO.grp.add(g);HM.P.push(g)}catch(e){console.warn('HM car',id,e)}})}
// ---- pause menu: 🏠 HOME fast travel
{const g=document.querySelector('#roamPause .pg'),q=g&&g.querySelector('[data-p="garage"]');if(g){const b=document.createElement('button');b.dataset.p='home';b.textContent='🏠 HOME';
  b.addEventListener('click',()=>{try{AU.sfx('pick')}catch(e){}const m=HM_mark();roamPauseClose();if(m){HM.flip=1;if(!fastTravel(m))HM.flip=0}});g.insertBefore(b,q||null)}}
// fast travel home lands 26 m out FACING the beacon (garages face away from it): drive straight in
roamWarp=(f=>function(x,z,h){if(HM.flip){HM.flip=0;const m=HM_mark();if(m&&Math.hypot(m.x-x,m.z-z)<40)h=Math.atan2(m.x-x,m.z-z)}return f.call(this,x,z,h,...[].slice.call(arguments,3))})(roamWarp);
roamPauseOpen=(f=>function(){f.apply(this,arguments);const b=document.querySelector('#roamPause [data-p="home"]');if(b)b.hidden=!!(RO.ch||RO.sp)||!HM_mark()})(roamPauseOpen);
// ---- garage: nitro row in the ride stats + NITRO KIT install (only at Home)
GAR_tab=(f=>function(){f.apply(this,arguments);try{const B=$('#gbBody'),st=B&&B.querySelector('.garSt');if(!st)return;const fm=GAR_.pv==='4x4'?'off':GAR_.pv==='boat'?'boat':'car',S=GAR_set(G9C_eq(fm)),sp=HM_sport(S),kit=HM_kits().includes(S.id);
  const r=document.createElement('div');r.className='hmNit';r.innerHTML=`<span>Nitro</span><em>${sp?'⚡ Built in (sports)':kit?'🧰 Nitro Kit':'— none'}</em>`;st.appendChild(r);if(sp||kit)return;
  const b=document.createElement('button');b.className='gbP hmKit';b.dataset.hmkit=S.id;const cr=season().cr;
  b.innerHTML=HM.at?`<b>🧰 INSTALL NITRO KIT</b><small>${S.n} gets BOOST · ${HM_KIT.toLocaleString('de-DE')} studs${cr<HM_KIT?' · need '+(HM_KIT-cr).toLocaleString('de-DE')+' more':''}</small>`:`<b>🧰 NITRO KIT</b><small>install it at 🏠 Home · ${HM_KIT.toLocaleString('de-DE')} studs</small>`;
  if(!HM.at)b.disabled=true;st.after(b);
  b.onclick=()=>{const S2=season();if(S2.cr<HM_KIT){try{AU.sfx('bump')}catch(e){}return}S2.cr-=HM_KIT;saveSeason(S2);const G=GAR_get();G.nk=[...(G.nk||[]).filter(x=>x!==S.id),S.id];GAR_put(G);try{AU.sfx('brick')}catch(e){}const sc=$('#gbBody').scrollTop;gbRender();$('#gbBody').scrollTop=sc}}catch(e){console.warn('HM kit',e)}})(GAR_tab);
// ---- per frame: HUD (no BOOST button / bar without nitro), leaving Home, parked cars
roamStep=(f=>function(dt){f.apply(this,arguments);try{const nb=!HM_ok();if(nb!==HM.nb){HM.nb=nb;document.body.classList.toggle('hmNoB',nb)}
  const m=HM_mark();if(HM.at&&(!m||Math.hypot(m.x-RO.x,m.z-RO.z)>60))HM.at=false;if(m){m.col='#ff8a1c';if((HM.fr=(HM.fr||0)+1)%30===1)HM_build()}}catch(e){if(!HM.err)console.warn('HM',e);HM.err=String(e)}})(roamStep);
exitRoam=(f=>function(){document.body.classList.remove('hmNoB');HM.nb=false;HM.at=false;HM_clear();HM.sig='';return f.apply(this,arguments)})(exitRoam);
{const s=document.createElement('style');s.textContent=`
body.hmNoB:not(.onfoot) #tN,body.hmNoB #artBoost{display:none!important}
#hmToast{position:absolute;left:50%;top:calc(58px + env(safe-area-inset-top,0px));transform:translate(-50%,-8px);background:#141413;color:#ffd400;border:3px solid #ffd400;border-radius:12px;padding:6px 14px;font:italic 900 15px var(--hud,system-ui);letter-spacing:.04em;opacity:0;pointer-events:none;transition:opacity .2s,transform .2s;z-index:7;white-space:nowrap}
#hmToast.on{opacity:1;transform:translate(-50%,0)}
#hmToast.side{transform:none;transition:opacity .2s;white-space:normal;text-align:center;font-size:14px;line-height:1.15}#hmToast.side.on{transform:none}
.garSt .hmNit em{color:#ffd400}
#gbBody .hmKit{display:block;width:100%;margin:6px 0;text-align:left;background:#ffd400;color:#141413}#gbBody .hmKit[disabled]{opacity:.6;background:#fff}
#gbBody .hmKit b{font-size:14px}#gbBody .hmKit small{display:block;font-size:12px}`;document.head.appendChild(s)}
window.__hm={HM,box:HM_box,ok:HM_ok,sport:HM_sport,cur:HM_curSet,mark:HM_mark,save:HM_save,park:HM_parkList,slots:HM_slots,build:HM_build,kits:HM_kits};
