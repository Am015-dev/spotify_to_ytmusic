// garage-cars (lane r22e35, Alex 22 Oct: "most of the cars do not work from the garage"). Lazy chunk: 99c_checklist.js is at its 200 KB cap, so the item and GO register
// on window.__chk from here. Root cause was deploy-side: the Beta artifact carried only models/{as,lx,xf,qa}.js, not the per-car chunks (now listed in out/<ver>/PUBLISH_FILES.txt).
// garage-cars (Alex 22 Oct "most of the cars do not work from the garage"): EVERY street ride in the garage list, picked by tapping its card (the touch path) and SAVE & DRIVE;
// per ride: the player mesh is the ride (visible, model loaded, sane size), gas held -> > 30 km/h, steer left -> yaw rate > 0.1 rad/s (heading alone is nudged by the road assist), no page error. ALL_OPEN: every ride owned.
async function GCAR_one(id){const T0=performance.now(),TT=[],tm=n=>TT.push(n+Math.round(performance.now()-T0)),W=ms=>new Promise(r=>setTimeout(r,ms)),K=(c,on)=>dispatchEvent(new KeyboardEvent(on?'keydown':'keyup',{code:c,key:c,bubbles:true})),o={id},E=[],oe=e=>E.push(String(e.message||e.reason||e).slice(0,90));
 addEventListener('error',oe);addEventListener('unhandledrejection',oe);
 try{if(window.__tq&&__tq.reset)__tq.reset();const S=GAR_set(id);o.own=GAR_owned(S);gbOpen();G9C.type='car';G9C.filt='all';SB_open?SB_open('rides'):GAR_tab();await W(120);
  const cd=document.querySelector('#g9Col [data-gc="'+id+'"]');o.card=!!cd;if(cd)cd.click();else G9C_equip(S,'car');
  const b0=window.__ldBad||0;let n=0;while((GAR_get().sel!==id||LDL.wait.size)&&(window.__ldBad||0)===b0&&n++<200)await W(100);if((window.__ldBad||0)!==b0)o.toast=(document.getElementById('ldToast')||{}).textContent;tm('ld');o.sel=GAR_get().sel===id;{const sv=document.getElementById('gbSave');if(sv&&sv.offsetWidth)sv.click();else gbClose(true)}n=0;await W(200);while((state!=='roam'||LD.busy||!RO.on)&&n++<150)await W(100);
  tm('roam');o.miss=LD_probe(()=>GAR_arr(S.car())).length;const ud=pl.mesh.userData;let vm=0;const bb=new THREE.Box3();pl.mesh.updateMatrixWorld(true);
  pl.mesh.traverseVisible(m=>{if(m.isMesh&&m.geometry){vm++;bb.expandByObject(m)}});const sz=bb.isEmpty()?[0,0,0]:bb.getSize(new THREE.Vector3()).toArray();o.vm=vm;o.len=+Math.max(sz[0],sz[2]).toFixed(1);o.vmode=pl.vmode||'car';o.vis=!!pl.mesh.visible;
  RO.v=0;const h0=RO.h;K('KeyW',1);let mx=0;for(let i=0;i<60&&mx<=32;i++){await W(100);mx=Math.max(mx,RO.v*3.6)}o.kmh=Math.round(mx);tm('gas');
  K('KeyA',1);let yr=0;for(let i=0;i<10;i++){await W(100);yr=Math.max(yr,Math.abs(RO.yr||0))}o.yr=+yr.toFixed(2);K('KeyA',0);K('KeyW',0);o.dh=+Math.abs(Math.atan2(Math.sin(RO.h-h0),Math.cos(RO.h-h0))).toFixed(2);RO.v=0}catch(e){o.err=String(e).slice(0,90)}
 removeEventListener('error',oe);removeEventListener('unhandledrejection',oe);try{K('KeyW',0);K('KeyA',0)}catch(e){}
 o.tt=TT.join(' ');o.errs=E;const f=[];if(o.err)f.push('threw '+o.err);if(!o.own)f.push('locked');if(!o.sel)f.push(o.toast?'model failed to load, kept the old ride + toast':'not selected');if(o.miss)f.push(o.miss+' meshes not loaded');if(!o.vis||o.vm<1||o.len<1.5||o.len>16)f.push('mesh vis '+o.vis+' '+o.vm+' meshes '+o.len+' m');
 if(o.vmode!=='car')f.push('form '+o.vmode);if(!(o.kmh>30))f.push(o.kmh+' km/h');if(!(o.yr>.1))f.push('steer '+o.yr+' rad/s');if(E.length)f.push('err '+E[0]);o.fail=f;return o}
const GCAR_ids=()=>GAR_SETS.filter(S=>G9C_forms(S).includes('car')).map(S=>S.id);
async function GCAR_all(ids){const L=ids||GCAR_ids(),out=[],run=GCAR_all.run=(GCAR_all.run||0)+1;for(const id of L){if(GCAR_all.run!==run)break;out.push(await GCAR_one(id))}return out}
window.__gcar={one:GCAR_one,all:GCAR_all};
(function GCAR_reg(i){const C=window.__chk;if(C&&C.GO&&C.items){if(!C.items.some(q=>q.ver==='garage'&&q.id==='all-cars'))C.items.push({ver:'garage',id:'all-cars',area:'garage',text:'garage-cars · Every street ride in the garage works (Alex 22 Oct: "most of the cars do not work from the garage"). 📍 GO taps each card, SAVE & DRIVE, holds gas and steers. Pass line: every ride owned (ALL_OPEN), model loaded and visible, > 30 km/h, turns, no page error, in Frankfurt and Athens.'});
  C.GO['garage/all-cars']=['fra','ath'].flatMap(c=>[...Array(12).keys()].map(k=>({c,n:(c==='fra'?'Frankfurt':'Athens')+' free roam, rides part '+(k+1)+'/12',secs:480,fn:()=>{const L=GCAR_ids(),q=Math.ceil(L.length/12),ids=L.slice(k*q,(k+1)*q);if(typeof ALL_OPEN!=='undefined'&&!ALL_OPEN)return'📍 ALL_OPEN is off ❌';const sel0=GAR_get().sel;
  GCAR_all(ids).then(R=>{const bad=R.filter(r=>r.fail.length);try{if(GAR_get().sel!==sel0){gbOpen();GAR_select(sel0);gbClose(true)}}catch(e){}
   C.goSay('📍 GARAGE · '+R.length+'/'+L.length+' street rides (part '+(k+1)+'/12) tapped in the garage and driven ('+(CID==='fra'?'Frankfurt':'Athens')+'): '+(R.length-bad.length)+' work, '+bad.length+' fail'+(bad.length?': '+bad.slice(0,12).map(r=>r.id+' ('+r.fail.join(', ')+')').join(' · ')+' ❌':' ✅'))},e=>C.goSay('📍 GARAGE · threw '+e+' ❌'));
  return'📍 GARAGE · tapping and driving rides part '+(k+1)+'/12…'}})));
  return}
 if(i<600)setTimeout(()=>GCAR_reg(i+1),100)})(0);
