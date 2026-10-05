// ---- v85: clean phone HUD, road spawn, objective line (module v85.js; patch pV85.py)
(function(){
const css=`
body.v85 #roamStuds,body.v85 #roamExit,body.v85 #roamMapBtn,body.v85 #roamVeh,body.v85 #roamHorn,body.v85 #roamCamBtn,body.v85 #roamLogBtn,body.v85 #roamSetBtn,body.v85 #roamEv,body.v85 #roamHint,
body.v85 #rgBar,body.v85 #rgHull,body.v85 #rgGb,body.v85 #rgTip,body.v85 #roamCombo,body.v85 #tF,body.v85 #tD,body.v85 #steerHint{display:none!important}
body.v85[data-mode=roam]:not(.v85b) #roamTop,body.v85[data-mode=roam]:not(.v85b) #m1Next,body.v85[data-mode=roam]:not(.v85b) #raceW,body.v85[data-mode=roam]:not(.v85b) #qTrk,body.v85[data-mode=roam]:not(.v85b) #roamPlate,body.v85[data-mode=roam]:not(.v85b) #ogHud,body.v85[data-mode=roam]:not(.v85b) #ogArea{display:none!important}
body.v85 #roamGauge{background:rgba(10,14,28,.55);border-radius:16px;padding:2px 12px}
body.v85 #roamArrow{display:flex;align-items:center;gap:6px;font-size:15px!important;font-weight:800;color:#fff;background:rgba(10,14,28,.62);border-radius:14px;padding:4px 14px;max-width:60vw!important;text-shadow:0 1px 2px #000}
body.v85 #roamArrow i{font-size:15px}
#touch,#btnZone,.tbtn{touch-action:none}
#roamFT{z-index:40;pointer-events:auto;bottom:auto;top:calc(10px + env(safe-area-inset-top,0px))}
body:not([data-mode=roam]) #ogHud,body:not([data-mode=roam]) #ogArea{display:none!important}
#itemBox{right:auto!important;left:calc(50% - clamp(24px,5.5vh,32px))!important;top:calc(60px + env(safe-area-inset-top,0px))!important}

body.v85 #roamPop{top:calc(64px + env(safe-area-inset-top,0px));min-width:0;padding:3px 12px;border-radius:14px;background:rgba(10,14,28,.62);box-shadow:none}body.v85 #roamPop h5{display:inline;font-size:12px;margin-right:6px}body.v85 #roamPop span{display:inline;font-size:12px}body.v85 #roamPop div,body.v85 #roamPop small{display:none}
body.v85 #tL{left:max(28px,calc(16px + env(safe-area-inset-left,0px)))!important}body.v85 #tR{left:calc(max(28px,16px + env(safe-area-inset-left,0px)) + 14px + clamp(68px,24vh,96px))!important}
body.v85 #tG,body.v85 #tN{right:max(28px,calc(14px + env(safe-area-inset-right,0px)))!important}body.v85 #tP{left:max(28px,calc(10px + env(safe-area-inset-left,0px)))!important}
`;
const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);document.body.classList.add('v85');
// verbs for the one objective line
window.v85Verb=function(ch){if(!ch)return'';const k=ch.kind;return({speed:'Radar',chase:'Catch',drift:'Drift',longjump:'Jump',smash:'Smash',m1:'Deliver'}[k])||'Go'};
// brief overlays: the mission / district / result cards show for 5 s at start and end, then get out of the way
let brief=0,lastCh=null,lastRes=false,lastPlate='';const bc=document.body.classList;
function v85tick(dt){try{if(RO.ch)v85Road(RO.ch);
 if(RO.v85w>0&&!RO.card&&!RO.story&&!RO.frozen&&!RO.mapOpen&&!(TOUCH.brake||K.ArrowDown||K.KeyS)){RO.v85w-=dt;RO.v=Math.max(RO.v,12)}const ch=!!(RO.ch||RO.sp),res=!!document.querySelector('#chRes:not([hidden])'),pl2=(document.querySelector('#roamPlate')||{}).textContent||'';
 if(lastCh===null){brief=5}else if(ch!==lastCh||res&&!lastRes||pl2!==lastPlate)brief=Math.max(brief,5);
 lastCh=ch;lastRes=res;lastPlate=pl2;if(res)brief=Math.max(brief,2);
 if(RO.card||RO.mapOpen||RO.jOpen)brief=Math.max(brief,.1);
 brief=Math.max(0,brief-dt);const on=brief>0;if(on!==bc.contains('v85b'))bc.toggle('v85b',on)}catch(e){}}
// road under the start: the hot-drop run begins on bare plaza paving. When a quest starts, lay a dark asphalt ribbon (white lane markings) along the first straight
// stretch of its route, face the car down it and let it roll. Visual only: no collision.
const V=window.__v85={};let ribbon=null;
function v85Road(ch){try{const q=ch&&ch.v2;if(!q||q._v85)return;q._v85=1;const st=q.L.st[q.si||0],P=st&&st.R&&st.R.P;if(!P||P.length<4)return;
 const a0=Math.atan2(P[1][0]-P[0][0],P[1][1]-P[0][1]),pts=[{x:P[0][0],z:P[0][1]}];let L=0;
 for(let i=1;i<P.length&&L<420;i++){const dx=P[i][0]-P[i-1][0],dz=P[i][1]-P[i-1][1];if(Math.abs(angDiff(Math.atan2(dx,dz),a0))>.35)break;const n=Math.max(1,Math.round(Math.hypot(dx,dz)/8));for(let k=1;k<=n;k++)pts.push({x:P[i-1][0]+dx*k/n,z:P[i-1][1]+dz*k/n});L+=Math.hypot(dx,dz)}
 if(pts.length<6)return;let s=0;const tx=Math.sin(a0),tz=Math.cos(a0);pts.forEach((p,i)=>{p.tx=tx;p.tz=tz;p.s=i*8});
 // start 12 m behind the car so the car is already on it
 const b={x:pts[0].x-tx*12,z:pts[0].z-tz*12,tx,tz,s:-12};pts.unshift(b);
 if(ribbon){ribbon.parent&&ribbon.parent.remove(ribbon);ribbon.geometry.dispose()}
 const mat=new THREE.MeshStandardMaterial({map:HUB.M.road.map,roughness:.85,metalness:0,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-8});
 ribbon=new THREE.Mesh(abStrip(pts,0,pts.length-1,-8,8,.34,.34,32),mat);ribbon.receiveShadow=true;ribbon.frustumCulled=false;(HUB.grp||scene).add(ribbon);
 // facing along the route, already rolling
 if(Math.hypot(RO.x-P[0][0],RO.z-P[0][1])<40&&Math.abs(RO.v)<6){RO.h=RO.vh=a0;RO.yr=0;RO.v=13;camSnap=true;RO.v85w=4}
 V.road={n:pts.length,a0,L}}catch(e){V.err=String(e&&e.stack||e)}}
roamStep=(f=>function(dt){f(dt);v85tick(dt)})(roamStep);

// ---- power-ups (2K Drive style): GHOST, TELEPORT, WEB CRASHER + bold coloured icons for every item
Object.assign(ITEMS,{ghost:{name:'GHOST',col:'#9fd8ff'},teleport:{name:'TELEPORT',col:'#c46bff'},web:{name:'WEB CRASHER',col:'#e8f3ff'}});for(const k of['ghost','teleport','web'])if(!ITEM_KEYS.includes(k))ITEM_KEYS.push(k);
const V85_EM={emp:'⚡',rail:'🎯',turbo:'🔥',rockets:'🚀',missile:'🎯',mines:'💣',shield:'🛡️',tornado:'🌪️',wall:'🧱',storm:'⛈️',magnet:'🧲',oil:'🛢️',ghost:'👻',teleport:'🌀',web:'🕸️'},V85_IC={};
itemIcon=function(k){if(V85_IC[k])return V85_IC[k];const[c,g]=cv(96,96),col=(ITEMS[k]||{col:'#fff'}).col;const gr=g.createLinearGradient(0,0,0,96);gr.addColorStop(0,col);gr.addColorStop(1,'#141826');g.fillStyle=gr;g.beginPath();const r=20;g.moveTo(r,4);g.lineTo(96-r,4);g.quadraticCurveTo(92,4,92,r);g.lineTo(92,96-r);g.quadraticCurveTo(92,92,96-r,92);g.lineTo(r,92);g.quadraticCurveTo(4,92,4,96-r);g.lineTo(4,r);g.quadraticCurveTo(4,4,r,4);g.closePath();g.fill();g.lineWidth=4;g.strokeStyle='rgba(255,255,255,.85)';g.stroke();
 g.font='54px "Apple Color Emoji","Segoe UI Emoji",sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(V85_EM[k]||'?',48,52);return V85_IC[k]=c.toDataURL()};
pickItem=(f=>function(s){const act=ships.filter(o=>!o.eliminated),n=act.length||1;const p=n>1?clamp(((s.place||Math.ceil(n/2))-1)/(n-1),0,1):.5;const r=R();
  if(p>.4&&r<.16+p*.14)return'teleport';if(r<.34)return'ghost';if(r<.5)return'web';return f.apply(this,arguments)})(pickItem);
function V85_item(it,s){const at=s.mesh.position.clone().add(s.mesh.userData.m.position);
  if(it==='ghost'){s.shield=Math.max(s.shield,4.5);s.ghostT=4.5;s.boost=Math.max(s.boost,.7);burst(SPARK,at,40,26,.6,new THREE.Color(1.2,2,2.8));if(s.isPlayer){AU.sfx('shield');say('','GHOST · nothing can touch you',1.1);feed('GHOST',0,'#9fd8ff')}}
  else if(it==='teleport'){burst(SPARK,at,90,50,.7,new THREE.Color(1.8,.8,2.8));burst(FIRE,at,12,30,.5,new THREE.Color(1.6,.5,2.4));s.dist+=130;s.inv=Math.max(s.inv,.6);if(s.isPlayer){AU.sfx('boost');flash=.55;shake=Math.max(shake,.5);fovKick=Math.max(fovKick,12);say('','TELEPORT!',.9);feed('TELEPORT +130 m',0,'#c46bff')}}
  else if(it==='web'){let tgt=null,bd=520;for(const o of ships){if(o===s||o.dead>0||o.eliminated||o.finished)continue;const dd=tdd(o.dist,s.dist);if(dd>0&&dd<bd){bd=dd;tgt=o}}
    if(tgt){tgt.webT=4.5;burst(SPARK,tgt.mesh.position.clone().add(tgt.mesh.userData.m.position),50,24,.6,new THREE.Color(2.4,2.4,2.6));if(tgt.isPlayer){flash=.3;AU.sfx('hit')}if(s.isPlayer){AU.sfx('missile');feed('WEB HIT',200,'#e8f3ff')}}else if(s.isPlayer)feed('WEB MISS',0,'#e8f3ff')}}
useItem=(f=>function(s){const it=s.item;if(it==='ghost'||it==='teleport'||it==='web'){if(s.isPlayer&&performance.now()<itemSpinUntil)return;s.item=null;try{V85_item(it,s)}catch(e){console.warn('v85 item',e)}return}return f.apply(this,arguments)})(useItem);
// per-step: web slows and blinds, ghost turns the car see-through
const V85W=document.createElement('div');V85W.id='v85web';V85W.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:3;opacity:0;transition:opacity .2s;background:radial-gradient(circle at 50% 50%,transparent 18%,rgba(240,246,255,.55) 70%),repeating-conic-gradient(from 0deg at 50% 50%,rgba(255,255,255,.75) 0 .7deg,transparent .7deg 15deg),repeating-radial-gradient(circle at 50% 50%,transparent 0 46px,rgba(255,255,255,.6) 46px 49px)';document.body.appendChild(V85W);
stepTraffic=(f=>function(){f.apply(this,arguments);if(state!=='race')return;try{for(const s of ships){if(s.webT>0){s.webT-=H;s.v*=1-.35*H}if(s.ghostT>0)s.ghostT-=H;const gh=s.ghostT>0;if(gh&&!s._gh){s._gh=1;s.mesh.traverse(o=>{if(o.isMesh&&o.material&&!o.userData._om&&!Array.isArray(o.material)){o.userData._om=o.material;const m=o.material.clone();m.transparent=true;m.opacity=.35;o.material=m}})}
   else if(!gh&&s._gh){s._gh=0;s.mesh.traverse(o=>{if(o.userData&&o.userData._om){o.material=o.userData._om;o.userData._om=null}})}}
  const w=pl&&pl.webT>0;V85W.style.opacity=w?Math.min(1,pl.webT/1.2):0}catch(e){}})(stepTraffic);
// rings: free roam shows only the nearest event ring, plus golden/collect rings within 70 m
OG_draw=(f=>function(){if(!OG.ev&&OG.vis&&state==='roam'){let best=null,bd=1e9;for(const sp of OG.vis)if(sp.k==='ev'){const d=Math.hypot(sp.x-RO.x,sp.z-RO.z);if(d<bd){bd=d;best=sp}}const keep=OG.vis;OG.vis=keep.filter(sp=>sp.k==='ev'?sp===best:Math.hypot(sp.x-RO.x,sp.z-RO.z)<70);try{return f.apply(this,arguments)}finally{OG.vis=keep}}return f.apply(this,arguments)})(OG_draw);
// a roam event must not survive into a race or the menu (stale GHOST RACE panel + RETRY)
exitRoam=(f=>function(){try{if(OG.ev)OG_end(null,1)}catch(e){}return f.apply(this,arguments)})(exitRoam);
setupRace=(f=>function(cfg){try{if(cfg&&cfg.type!=='roam'&&OG.ev)OG_end(null,1)}catch(e){}return f.apply(this,arguments)})(setupRace);

})();
