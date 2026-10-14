const OD_VER=OD_CHANGELOG[0].v;
function CR_trackW(w){return Math.min(20,Math.max(14,w*.38))}
var CR_LS=1;const CR_LGV=12;

const CR_SPDCAM={b:2.2,h:.9};
// SMASH feedback: one-shot big hit (no continuous shake)
function CR_smashHit(){const t=performance.now();if(t-(CR_smashHit.t||0)<250)return;CR_smashHit.t=t;shake=Math.max(shake,.75);fovKick=Math.max(fovKick,10);slowmo=Math.max(slowmo,.18);try{AU.sfx('takedown')}catch(e){}try{hitPop('💥 SMASH!','#ffd12c')}catch(e){}}
// city victims tumble for 0.9 s (barrel roll + flight) before they burst into bricks
const _crTQ=new THREE.Quaternion(),_crTE=new THREE.Euler(),_crTS=new THREE.Vector3(1,1,1),_crTP=new THREE.Vector3(),_crTM=new THREE.Matrix4();
function CR_tumbleStart(c,x,z,dx,dz){const f=Math.hypot(dx,dz)||1,rx=x-RO.x,rz=z-RO.z,rl=Math.hypot(rx,rz)||1,v=Math.max(12,Math.abs(RO.v));c.crW={t:0,x,y:c.y,z,h:Math.atan2(dx,dz),vx:Math.sin(RO.vh)*v*.55+rx/rl*6,vz:Math.cos(RO.vh)*v*.55+rz/rl*6,vy:7+v*.08,r:0,p:0,sr:(Math.random()<.5?-1:1)*9,sp:(Math.random()-.5)*5}}
function CR_tumble(c,im,dt){const W=c.crW;if(!W)return false;if(W.t>=.9){c.crW=null;return false}W.t+=dt;W.vy-=22*dt;W.x+=W.vx*dt;W.y=Math.max(c.y-.5,W.y+W.vy*dt);W.z+=W.vz*dt;W.r+=W.sr*dt;W.p+=W.sp*dt;
 _crTQ.setFromEuler(_crTE.set(W.p,W.h,W.r,'YXZ'));_crTM.compose(_crTP.set(W.x,W.y,W.z),_crTQ,_crTS);im.setMatrixAt(c.j,_crTM);if(im.userData.w)im.userData.w.setMatrixAt(c.j,_crTM);if(im.userData.g)im.userData.g.setMatrixAt(c.j,_crTM);return true}
function CR_dodge(s,o){const m=s.crDg||(s.crDg=new Map()),t=typeof raceT!=='undefined'?raceT:performance.now()/1000,e=m.get(o);if(e&&t-e.t<1.5)return e.d;const d=o.x>s.x?-1:1;m.set(o,{d,t});return d}

const CR_TYRE_Y=.03;

// ---- city ramp launch: boost + an arc sized to the takeoff speed on lighter gravity (cleared on landing)
const CR_RG=14,CR_RJM=.74;
function CR_rampLaunch(r){try{if(!r||!(RO.v>3))return;const vb=Math.min(Math.max(RO.v,RO.v*1.12),Math.max(RO.v,CR_VBOOST));RO.v=vb;const kmh=vb*3.6;
 const D=kmh<=140?kmh*CR_RJM:140*CR_RJM+(kmh-140)*.35,T=D/vb,h0=Math.max(0,r.hgt||0);let vy=(CR_RG*T*T/2-h0)/T;vy*=Math.min(1,Math.max(.45,vb/15));
 RO.vy=Math.max(3,Math.min(20,vy));RO.crRJ=1}catch(e){}}

function CR_glowFar(p){try{if(p.distanceToSquared(camera.position)<=14*14)return false;return CR_glowCar(p)}catch(e){return true}}
function CR_glowCar(p){const m=typeof pl!=='undefined'&&pl&&pl.mesh;return !m||p.distanceToSquared(m.position)>8*8}

// one layer of the truck's cargo box: a 6-wide core and side walls of panels with a lighter rib every 3 studs (top layer = rail)
function CR_boxWall(add,sym,W,y){const Rb='#c9ced6';add('B6x21',-3,-10,0,W,y);for(let k=0;k<7;k++){const z=-10+3*k;sym('B1x1',-4,z,0,Rb,y);sym('B1x2',-4,z+1,0,y===12?Rb:W,y)}}

let CR_noGlow=0;
function CR_minBack(){const v=pl&&pl.vmode||'car';return v==='4x4'?5.5:v==='boat'?5:3.5}

const CR_SMASHV=150/3.6;

const ALL_OPEN=true,TEST_MODE=true; // TEST_MODE: Alex's test build (src/99x_test_mode.js): ∞ studs, everything unlocked, all events open, ⚙ everywhere. false = normal game
// R3b: English UI. Numbers were formatted 'de-DE' (3.000 studs reads as 3); one wrapper maps it to en-US (3,000) without touching every module
{const _tls=Number.prototype.toLocaleString;Number.prototype.toLocaleString=function(l,o){return _tls.call(this,l==='de-DE'?'en-US':l,o)}}
import * as THREE from 'three';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {ShaderPass} from 'three/addons/postprocessing/ShaderPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {Reflector} from 'three/addons/objects/Reflector.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';   // gfx-1: stock studio env for LEGO plastic highlights
import {GTAOPass} from 'three/addons/postprocessing/GTAOPass.js';             // gfx-1: stock ground-truth AO (PC high tier only)

/* ============================================================ 0 · utils */
const $=s=>document.querySelector(s);
const V3=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z);
const clamp=(v,a,b)=>v<a?a:v>b?b:v, lerp=(a,b,t)=>a+(b-a)*t;
const mod=(a,n)=>((a%n)+n)%n;
function mul(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const R=mul(20990);const rr=(a,b)=>a+R()*(b-a);
const CK=['mho_season','mho_flags','mho_roam','mho_riv','mho_career','mho_prof','mho_story','mho_perks','mho_garage','mho_stars','mho_build','mho_packs','mho_gbown','mho_adapt','mho_disc','mho_log','mho_pstat','mho_city','mho_qpos','mho_enc','mho_sq'];let SLOT=1;try{SLOT=+(localStorage.getItem('mho_slot')||1)||1}catch(e){}
// TQ (int-2, 2026-10-13): FAST TEST START. ?test=fra|ath[&car=<ride id>][&at=x,z][&go=<checklist ver/id>] skips intro, menu, story and tutorial and boots
// straight into free roam on a throwaway save slot (9, wiped each load; the player's slots are untouched), minimal graphics; 98tq_test_quick.js does the rest.
const TQ=(()=>{try{const q=new URLSearchParams(location.search);{const rp=q.get('repro');if(rp)try{const R=JSON.parse(decodeURIComponent(escape(atob(rp.replace(/-/g,'+').replace(/_/g,'/')))));window.__repro=R;q.set('test',R.c);if(R.ride)q.set('car',R.ride);q.set('at',R.x+','+R.z);q.set('draw',q.get('draw')||'1')}catch(e){}}const c=q.get('test');if(c!=='fra'&&c!=='ath')return null;const at=(q.get('at')||'').split(',').map(Number);
 const o={c,car:q.get('car')||'',at:at.length===2&&at.every(Number.isFinite)?at:null,go:q.get('go')||'',nodraw:q.get('draw')==='0'};SLOT=9;
 for(let i=localStorage.length-1;i>=0;i--){const k=localStorage.key(i);if(k&&/@9$/.test(k))localStorage.removeItem(k)}
 const J=(k,v)=>localStorage.setItem(k+'@9',JSON.stringify(v));localStorage.setItem('mho_city@9',c);
 J('mho_roam',{tut:1,otg:{},studs:[]});J('mho_roam.ath',{tut:1,otg:{},studs:[]});J('mho_story',{seen:1,end:0,fly:1});J('mho_story.ath',{seen:1});if(c==='ath')localStorage.setItem('mho_athd@9','A');
 sessionStorage.setItem('mho_boot',JSON.stringify({go:'roam',t:Date.now(),snap:1}));return o}catch(e){return null}})();
const CID=(()=>{try{return localStorage.getItem('mho_city@'+SLOT)==='ath'?'ath':'fra'}catch(e){return 'fra'}})(),CITYK=['mho_roam','mho_disc','mho_packs','mho_pick','mho_story','mho_qpos','mho_enc','mho_sq'];
const skey=k=>{const K=CID!=='fra'&&CITYK.includes(k)?k+'.'+CID:k;return CK.includes(k)?K+'@'+SLOT:K};
const _SC=new Map();try{const SP=Storage.prototype,w=(f,g)=>function(...a){g(a);return f.apply(this,a)};SP.setItem=w(SP.setItem,a=>_SC.delete(String(a[0])));SP.removeItem=w(SP.removeItem,a=>_SC.delete(String(a[0])));SP.clear=w(SP.clear,()=>_SC.clear())}catch(e){}
const _scGet=K=>{let c=_SC.get(K);if(!c){c={r:localStorage.getItem(K)};_SC.set(K,c)}return c};
const store={get(k,d){try{const c=_scGet(skey(k));return c.r==null?d:JSON.parse(c.r)}catch(e){return d}},peek(k,d){try{const c=_scGet(skey(k));if(c.r==null)return d;if(!('v' in c))c.v=JSON.parse(c.r);return c.v}catch(e){return d}},set(k,v){try{const K=skey(k),r=JSON.stringify(v);localStorage.setItem(K,r);_SC.set(K,{r})}catch(e){}}};
const BOOTF=(()=>{let r=null;try{r=sessionStorage.getItem('mho_boot');sessionStorage.removeItem('mho_boot')}catch(e){}try{const l=localStorage.getItem('mho_boot');if(l!=null){localStorage.removeItem('mho_boot');r=r||l}}catch(e){}try{const o=r&&JSON.parse(r);return o&&o.go&&Math.abs(Date.now()-o.t)<120000?o:null}catch(e){return null}})();
{const lo=document.getElementById('loading');if(lo)lo.textContent=CID==='ath'?'BUILDING ATHENS…':'BUILDING FRANKFURT…';if(BOOTF){const el=document.getElementById('ld2'),st=document.getElementById('ldStep'),F=document.getElementById('ldFly');if(el){el.hidden=false;el.classList.remove('out')}if(st)st.textContent=BOOTF.arrive?'✈ Landing in '+(CID==='ath'?'Athens':'Frankfurt'):'Loading your save';if(F&&BOOTF.arrive){F.hidden=false;document.getElementById('ldFa').textContent=BOOTF.from==='ath'?'ATH':'FRA';document.getElementById('ldFb').textContent=CID==='ath'?'ATH':'FRA'}}}
try{if(!localStorage.getItem('mho_migr')){for(const k of CK){const v=localStorage.getItem(k);if(v!=null&&localStorage.getItem(k+'@1')==null)localStorage.setItem(k+'@1',v)}localStorage.setItem('mho_migr','1')}}catch(e){}
const fmt=t=>{if(!isFinite(t))return'--:--.-';const m=Math.floor(t/60),s=t-m*60;return String(m).padStart(2,'0')+':'+s.toFixed(1).padStart(4,'0')};
const fmt2=t=>{if(!isFinite(t))return'--:--.--';const m=Math.floor(t/60),s=t-m*60;return String(m).padStart(2,'0')+':'+s.toFixed(2).padStart(5,'0')};
const ord=n=>n+(n%100>=11&&n%100<=13?'TH':['TH','ST','ND','RD'][n%10]||'TH');
const pad2=n=>String(n).padStart(2,'0');

/* ============================================================ 1 · data */
const S=0.62;                         // city footprint scale (x, z)
let W=48,HALF=W/2,MARGIN=HALF-3.2;  // road width (metres)
const CR_RK=.47,BASE_TOP=120*CR_RK;
const CLASSES=[{id:'rookie',name:'Rookie',mul:.72,ai:[.9,.98]},{id:'pro',name:'Pro',mul:.86,ai:[.94,1.02]},{id:'elite',name:'Elite',mul:1,ai:[.98,1.06]},{id:'master',name:'Master',mul:1.08,ai:[1,1.08],hide:1},{id:'legend',name:'Legend',mul:1.15,ai:[1.03,1.11],hide:1}];
const TEAMS=[
 {id:'kronos',name:'Kronos Finanz',desc:'Bank money. Balanced to the cent.',a:'#f2c10f',b:'#1b1c3a',c:'#ffffff',glow:'#ffd84a',trail:'#ff58d6',c1:'#f5c20c',c2:'#ffd84a',top:1,acc:1,han:1,hull:1,unlock:0},
 {id:'aeppler',name:'Äppler Motorsport',desc:'Sachsenhausen garage. Brutal launch.',a:'#2cc070',b:'#f2c14e',c:'#0d2b1c',glow:'#8dffb8',trail:'#9dff3a',c1:'#36d17a',c2:'#8dffb8',top:.97,acc:1.13,han:.99,hull:.92,unlock:0},
 {id:'helix',name:'Helix Aerodyn',desc:'Sharpest turn-in on the grid.',a:'#e8f3ff',b:'#1a8fd0',c:'#ff3b55',glow:'#5ff0ff',trail:'#3fdcff',c1:'#22e4ff',c2:'#9ff4ff',top:.97,acc:1,han:1.13,hull:.95,unlock:0},
 {id:'nordend',name:'Nordend Kinetik',desc:'Armoured freight pilots. Unbothered.',a:'#ff7a1c',b:'#2a2f38',c:'#ffd12c',glow:'#ff9a4a',trail:'#ff7a2a',c1:'#ff7a1c',c2:'#ffac66',top:.98,acc:.95,han:.97,hull:1.3,unlock:0},
 {id:'zeil',name:'Zeil Syndikat',desc:'Street racers. Top speed, thin skin.',a:'#e5177f',b:'#f5c20c',c:'#1b1c3a',glow:'#ff4fd8',trail:'#ff58d6',c1:'#ff2d95',c2:'#ff7ac0',top:1.06,acc:.96,han:.95,hull:.88,unlock:4},
 {id:'ostend',name:'Ostend Voltaic',desc:'EZB data couriers. Quick, fragile.',a:'#7a3cff',b:'#19d3c5',c:'#ffffff',glow:'#c46bff',trail:'#59f5ff',c1:'#9b5cff',c2:'#c9a2ff',top:1.03,acc:1.05,han:1.03,hull:.84,unlock:9},
 {id:'v_rossi',name:'Fulmine Rosso',desc:'Rossi’s spear. Fastest thing in the Bankenviertel.',a:'#e01e2b',b:'#1b1c22',c:'#ffffff',glow:'#ff4a3a',trail:'#ff5a2d',c1:'#ff3b3b',c2:'#ff8a7a',top:1.07,acc:1.01,han:.97,hull:.9,unlock:0,own:'ROSSI',rival:'ROSSI',kit:'spike'},
 {id:'v_weber',name:'Mainschiff',desc:'Weber’s river cruiser. Calm, stable, tough.',a:'#1d5fd6',b:'#e8f3ff',c:'#0d1b33',glow:'#5fb0ff',trail:'#3f9bff',c1:'#2f7bff',c2:'#9fc8ff',top:1.01,acc:1,han:1.06,hull:1.15,unlock:0,own:'WEBER',rival:'WEBER',kit:'twin'},
 {id:'v_moreau',name:'Lame de Nuit',desc:'Moreau’s blade wing. Carves the towers.',a:'#1a1a2e',b:'#c9a2ff',c:'#ffffff',glow:'#c46bff',trail:'#c46bff',c1:'#8c55ff',c2:'#d9b8ff',top:1.03,acc:1.02,han:1.16,hull:.88,unlock:0,own:'MOREAU',rival:'MOREAU',kit:'blade'},
 {id:'v_okafor',name:'Piste Bulldozer',desc:'Okafor’s plough. Rams first, asks never.',a:'#f2a20c',b:'#2a2f38',c:'#111111',glow:'#ffb84a',trail:'#ff9a2a',c1:'#ffb020',c2:'#ffd27a',top:.97,acc:.97,han:.95,hull:1.5,unlock:0,own:'OKAFOR',rival:'OKAFOR',kit:'ram'},
 {id:'v_ferreira',name:'Míssil Verde',desc:'Ferreira’s launcher. Twin rocket pods, brutal launch.',a:'#16a34a',b:'#f5c20c',c:'#0b2010',glow:'#5dffb0',trail:'#5dffb0',c1:'#22c55e',c2:'#9dffc8',top:1.02,acc:1.09,han:1,hull:.95,unlock:0,own:'FERREIRA',rival:'FERREIRA',kit:'pods'},
 {id:'v_celik',name:'Mayın',desc:'Çelik’s minelayer. Armoured tail.',a:'#7a1020',b:'#d0d4dc',c:'#ff2a3a',glow:'#ff3b55',trail:'#ff2a3a',c1:'#c0182f',c2:'#ff7a8a',top:1,acc:1,han:1,hull:1.25,unlock:0,own:'ÇELIK',rival:'ÇELIK',kit:'mine'},
 {id:'v_brandt',name:'Voltwerk',desc:'Brandt’s coil racer. Instant launch.',a:'#0ea5b7',b:'#0b1220',c:'#e8fbff',glow:'#4ceaff',trail:'#4ceaff',c1:'#22d3ee',c2:'#a5f3fc',top:1.02,acc:1.15,han:1.05,hull:.9,unlock:0,own:'BRANDT',rival:'BRANDT',kit:'coil'},
 {id:'v_naka',name:'Kage Rail',desc:'Nakamura’s sniper. Pure top speed, paper hull.',a:'#f4f4f5',b:'#18181b',c:'#e11d48',glow:'#ff4f7a',trail:'#ff2d55',c1:'#fafafa',c2:'#ff8aa5',top:1.09,acc:1,han:1,hull:.82,unlock:0,own:'NAKAMURA',rival:'NAKAMURA',kit:'sniper'},
 {id:'v_kaiser',name:'Kaiserkrone',desc:'The champion’s machine. Best at everything.',a:'#111111',b:'#f5c20c',c:'#ffffff',glow:'#ffd12c',trail:'#ffd12c',c1:'#f5c20c',c2:'#ffe27a',top:1.1,acc:1.08,han:1.07,hull:1.12,unlock:0,own:'SKYCUP',rival:'KAISER',kit:'crown'},
 {id:'v_taxi',name:'Taxi Turbo',desc:'A Frankfurt ivory taxi with a jet engine. Heavy.',a:'#efe6c8',b:'#1b1c22',c:'#f5c20c',glow:'#ffd84a',trail:'#ffd12c',c1:'#efe6c8',c2:'#fff6d8',top:1,acc:1.06,han:.98,hull:1.3,unlock:0,cost:25000,kit:'heavy'},
 {id:'v_ebbel',name:'Ebbelwoi Express',desc:'Sachsenhausen speed wagon. Quick and grippy.',a:'#8bc34a',b:'#6d2c1a',c:'#ffd12c',glow:'#c6ff6a',trail:'#9dff3a',c1:'#8bc34a',c2:'#d4ff9a',top:1.05,acc:1.06,han:1.06,hull:.95,unlock:0,cost:45000,kit:'twin'}];
const PERKS=[{id:'refill',icon:'⛽',name:'Nitro Refill',d:'+35 boost every time you pick up an item',flag:'ROSSI'},{id:'shield',icon:'🛡',name:'Long Shield',d:'Shields last almost twice as long',flag:'WEBER'},
 {id:'drift',icon:'🌀',name:'Drift Master',d:'Drift turbos charge 35% faster',flag:'MOREAU'},{id:'heal',icon:'🔧',name:'Scrap Heal',d:'Every KO repairs 30 hull',flag:'OKAFOR'},
 {id:'armor',icon:'🧱',name:'Missile Armour',d:'Missiles and rail shots do half damage',flag:'FERREIRA'},{id:'mines',icon:'🧹',name:'Sweeper',d:'Immune to mines and oil slicks',flag:'ÇELIK'},
 {id:'empwreck',icon:'⚡',name:'EMP Payback',d:'Getting wrecked fires an EMP at everyone near you',flag:'BRANDT'},{id:'rail',icon:'🎯',name:'Long Shot',d:'Rail range +60%, rockets fire 4',flag:'NAKAMURA'},
 {id:'start',icon:'🎁',name:'Loaded Start',d:'Start every race holding an item',lvl:4},{id:'slip',icon:'💨',name:'Slipstream',d:'Near misses give double boost',lvl:12},
 {id:'luck',icon:'🍀',name:'Lucky Box',d:'Item boxes treat you as two places further back',lvl:18},{id:'crown',icon:'👑',name:'Kaiser’s Crown',d:'+3% top speed',flag:'SKYCUP'}];
let PK=new Set();
function perkUnlocked(p){return p.flag?!!flags()[p.flag]:carStat().lvl>=p.lvl}
function perkReq(p){return p.flag?(p.flag==='SKYCUP'?'win the Sky Cup':'beat '+PD[p.flag].full):'driver level '+p.lvl}
function perkSlots(){const l=carStat().lvl;return l>=16?3:l>=8?2:1}
function perkEq(){return CR_perkAdd(perkEq0())}function perkEq0(){return store.get('mho_perks',[]).filter(id=>{const p=PERKS.find(q=>q.id===id);return p&&perkUnlocked(p)}).slice(0,perkSlots())}
function perkSet(){const s=new Set(perkEq());if(carStat().lvl>=10)s.add('_lock');return s}
function garOwned(){return store.get('mho_garage',[])}
function teamLocked(t){return t.unlock>medalPts()||(t.own&&!flags()[t.own])||(t.cost&&!garOwned().includes(t.id))}
function vehOf(p){const v=TEAMS.find(t=>t.rival===p);return v?Object.assign({},v,{top:1,acc:1,han:1,hull:1}):null}
function pickItem(s){const act=ships.filter(o=>!o.eliminated),n=act.length||1;let p=n>1?clamp(((s.place||Math.ceil(n/2))-1)/(n-1),0,1):.5;if(s.isPlayer&&PK.has('luck'))p=Math.min(1,p+2/Math.max(1,n-1));
  const W={turbo:1,shield:1.2-p*.6,mines:1.1-p*.8,oil:1-p*.6,wall:.9-p*.6,rockets:1,rail:.8,emp:.8,missile:.35+p*.9,tornado:.25+p*.9,magnet:.15+p*1.1,storm:p>.55?(p-.4)*1.4:0};
  let tot=0;for(const k in W)tot+=Math.max(0,W[k]);let r=R()*tot;for(const k in W){r-=Math.max(0,W[k]);if(r<=0)return k}return 'turbo'}
// ---------- Garage builder: parts, paint, livery pattern, number, horn (2K-style)
const GB_PARTS={nose:[['none','Stock nose',null,{}],['shark','Shark jaw',{pack:0},{top:1.01,hull:1.02}],['plough','Plough blade',{cost:2500,stars:12},{hull:1.1,top:.98}],['prongs','Twin prongs',{pack:3},{top:1.02,han:.99}],['duck','Duck bill',{pack:6},{han:1.03,top:.99}],['drill','Drill nose',{pack:9},{hull:1.05,acc:1.01}],['spike','Spear nose',null,{top:1.02,hull:.97}],['ram','Ram bar',{quest:'q_walls'},{hull:1.15,top:.98}]],
  wing:[['none','Stock wings',null,{}],['delta','Delta wings',{cost:2000,stars:8},{top:1.02,han:.99}],['bi','Biplane wings',{pack:2},{han:1.05,top:.98}],['stub','Stubby wings',null,{acc:1.02,han:.99}],['gull','Gull wings',{pack:5},{han:1.03}],['jets','Wing jets',{pack:8},{top:1.03,hull:.97}],['blade','Blade wings',{flag:'MOREAU'},{han:1.05,hull:.97}]],
  rear:[['none','Stock tail',null,{}],['spoiler','Big spoiler',{cost:1800,stars:5},{han:1.04,top:.99}],['fins','Tri fins',{pack:2},{han:1.02}],['nozzle','Jet nozzle',{pack:11},{acc:1.05,hull:.97}],['stacks','Exhaust stacks',{pack:5},{acc:1.03}],['twin','Twin booms',null,{han:1.03}],['pods','Rocket pods',{flag:'FERREIRA'},{acc:1.04}],['mine','Armoured tail',{flag:'ÇELIK'},{hull:1.08,acc:.98}]],
  side:[['none','Clean flanks',null,{}],['skirts','Side skirts',{cost:1500},{han:1.03}],['cannons','Side cannons',{pack:4},{hull:1.04,top:.99}],['bricks','Brick stacks',{pack:1},{hull:1.06,acc:.99}],['tubes','Neon tubes',{pack:7},{}],['floats','Pontoons',{pack:10},{hull:1.03,han:1.02}]],
  roof:[['none','Clean roof',null,{}],['coil','Tesla coils',{flag:'BRANDT'},{acc:1.04}],['sniper','Rail barrel',{flag:'NAKAMURA'},{top:1.03,hull:.96}],['heavy','Cargo rack',{quest:'q_taxi'},{hull:1.12,acc:.97}],['crown','Kaiser crown',{flag:'SKYCUP'},{top:1.02,acc:1.02,han:1.02,hull:1.02}],['antenna','Antenna',null,{}],['siren','Police lights',{pack:1},{}],['sfin','Shark fin',{pack:0},{han:1.02}],['flag','Frankfurt flag',{cost:1200},{}],['dish','Radar dish',{pack:8},{acc:1.01}],['pilot','Minifig pilot',{pack:11},{}]]};
const GB_COLS=['#e01e2b','#ff7a1c','#ffd12c','#36d17a','#22c5e4','#2f7bff','#8c55ff','#ff2d95','#ffffff','#9aa3b0','#2a2f38','#111111','#f5c20c','#d8dde4'],GB_NEON=['#ff2d95','#22e4ff','#ffd12c','#5dffb0','#c46bff','#ff5a2d','#ffffff'];
const GB_PATS=[['racing','Racing'],['plain','Plain'],['stripes','Stripes'],['flames','Flames'],['checker','Checker'],['split','Split'],['camo','Camo'],['bolt','Lightning',{pack:3}],['hex','Hexagons',{pack:6}],['dots','Polka dots',{cost:800}],['bricks','LEGO bricks',{pack:9}],['zebra','Zebra',{pack:10}],['sunset','Sunset',{cost:1600,stars:10}],['circuit','Circuit board',{pack:7}]];
const GB_HORNS=[['classic','Classic beep',null],['train','S-Bahn chime',{pack:4}],['goose','Angry goose',{cost:900}],['duck','Rubber duck',{quest:'q_ball'}],['bells','Wedding bells',{quest:'q_wedding'}],['fanfare','Stunt fanfare',{quest:'q_stunt'}],['truck','Cider truck',{quest:'q_cider'}]];
const gbOwn=()=>store.get('mho_gbown',[]),packs=()=>store.get('mho_packs',[]);
function gbReq(r,id){if(!r)return true;if(r.pack!=null)return packs().includes(r.pack);if(r.cost)return gbOwn().includes(id);if(r.flag)return !!flags()[r.flag];if(r.quest)return (roamSave().otg[r.quest]||0)>=1;if(r.stars)return Object.values(store.get('mho_stars',{})).reduce((a,b)=>a+b,0)>=r.stars;return true}
function gbReqTxt(r){return r.pack!=null?'find Brick Pack '+(r.pack+1):r.cost?(r.stars&&totStars()<r.stars?'needs '+r.stars+' ★ · then '+r.cost.toLocaleString('de-DE')+' studs':'buy · '+r.cost.toLocaleString('de-DE')+' studs'):r.flag?(r.flag==='SKYCUP'?'win the Sky Cup':'beat '+PD[r.flag].full.split(' ').pop()):r.quest?'quest: '+(QUESTS.find(q=>q.id===r.quest)||{}).name:r.stars+' ★'}
const gbBuild=()=>store.get('mho_build',null);
function gbTeam(base,b){if(!b||!b.on)return base;const t=Object.assign({},base,{a:b.a,b:b.b,c:b.c,glow:b.glow,trail:b.trail,c1:b.a,c2:b.b,pat:b.pat,num:b.num,kit:null,kits:Object.values(b.parts||{}).filter(k=>k&&k!=='none')});
  for(const cat in GB_PARTS){const p=GB_PARTS[cat].find(x=>x[0]===(b.parts||{})[cat]);if(p)for(const k in p[3])t[k]=(t[k]||1)*p[3][k]}
  t.id='cu_'+[b.a,b.b,b.c,b.glow,b.trail,b.pat,b.num,t.kits.join('-')].join('').replace(/[^a-z0-9]/gi,'');return t}
const playerTeam=()=>gbTeam(TEAMS[teamIdx],gbBuild());
function hornPlay(){const b=gbBuild(),h=(b&&b.horn)||'classic',A=AU,a=A.a;if(!a)return;const t=a.currentTime,F=A.fx;
  if(h==='classic'){A.osc(t,'square',415,.35,.14,F);A.osc(t,'square',523,.35,.1,F)}else if(h==='duck'){A.osc(t,'sawtooth',900,.12,.16,F,500);A.osc(t+.16,'sawtooth',900,.14,.16,F,450)}
  else if(h==='bells'){[1047,1319,1568,2093].forEach((f,i)=>A.osc(t+i*.12,'sine',f,.6,.12,F))}else if(h==='train'){[659,523,587,392].forEach((f,i)=>A.osc(t+i*.22,'sine',f,.3,.14,F))}else if(h==='goose'){for(let i=0;i<3;i++)A.osc(t+i*.18,'sawtooth',520-i*40,.14,.15,F,300)}else if(h==='fanfare'){[523,659,784,1047].forEach((f,i)=>A.osc(t+i*.1,'triangle',f,i===3?.45:.12,.16,F))}else{A.osc(t,'sawtooth',110,.9,.16,F);A.osc(t,'sawtooth',138,.9,.12,F);A.osc(t,'sawtooth',165,.9,.1,F)}
  if(state==='roam')for(const c of HUB.cars)if(Math.hypot(c.x-RO.x,c.z-RO.z)<40)c.hitT=Math.max(c.hitT||0,1.5)}
const GB={d:null,tab:'parts',r:null,sc:null,cam:null,mesh:null,rot:.6,raf:0,drag:null};
function gbOpen(){const cur=gbBuild(),base=TEAMS[teamIdx];GB.d=cur?JSON.parse(JSON.stringify(cur)):{on:true,a:base.a,b:base.b,c:base.c,glow:base.glow,trail:base.trail,pat:'racing',num:Math.floor(R()*90+10),parts:{nose:'none',wing:'none',rear:'none',roof:'none',side:'none'},horn:'classic'};GB.d.on=true;if(!(GB.d.bricks&&GB.d.bricks.length)){GB.d.bricks=CR_DEF().map(b=>({...b}));GB.d.bp=1}
  $('#gbx').hidden=false;if(!GB.r){const cvs=$('#gbC');GB.r=P1_view(cvs);GB.r.outputColorSpace=THREE.SRGBColorSpace;GB.r.toneMapping=THREE.ACESFilmicToneMapping;GB.sc=new THREE.Scene();GB.sc.add(new THREE.HemisphereLight(0xe8ecff,0x40384a,1.6));const d=new THREE.DirectionalLight(0xffffff,2.4);d.position.set(5,9,6);GB.sc.add(d);const d2=new THREE.DirectionalLight(0x88ccff,1);d2.position.set(-6,3,-5);GB.sc.add(d2);
    const fl=new THREE.Mesh(new THREE.CylinderGeometry(9,9,.3,48),new THREE.MeshStandardMaterial({color:0x1b2440,roughness:.6}));fl.position.y=-.4;GB.sc.add(fl);const rg=new THREE.Mesh(new THREE.TorusGeometry(9,.08,6,64),neonMat('#22e4ff',2));rg.rotation.x=Math.PI/2;rg.position.y=-.2;GB.sc.add(rg);GB.cam=new THREE.PerspectiveCamera(35,1,.1,100);
    cvs.addEventListener('pointerdown',e=>{GB.drag=e.clientX;cvs.setPointerCapture(e.pointerId)});cvs.addEventListener('pointermove',e=>{if(GB.drag!=null){GB.rot+=(e.clientX-GB.drag)*.01;GB.drag=e.clientX}});cvs.addEventListener('pointerup',()=>GB.drag=null)}
  gbRender();gbLoop()}
function gbLoop(){if($('#gbx').hidden)return;const cvs=$('#gbC'),w=cvs.clientWidth,h=cvs.clientHeight;if(cvs.width!==Math.round(w*DPR2())){GB.r.setPixelRatio(DPR2());GB.r.setSize(w,h,false);GB.cam.aspect=w/h;GB.cam.updateProjectionMatrix()}
  if(GB.drag==null)GB.rot+=.004;GB.cam.position.set(Math.sin(GB.rot)*21,8,Math.cos(GB.rot)*21);GB.cam.lookAt(0,-.6,0);GB.r.render(GB.sc,GB.cam);GB.raf=requestAnimationFrame(gbLoop)}
// R1: garage stats read like 2K: a chip −3…+3 per stat (relative to the team's base car, 1 step ≈ 4 %) and a weight class from the brick count
function R1_chip(v,b0){const dd=(v/(b0||1)-1)*100;return Math.sign(dd)*Math.min(3,Math.round(Math.abs(dd)/4))}
const R1_WT=[[0,'SUPER LIGHT'],[40,'LIGHT'],[70,'MEDIUM'],[110,'HEAVY'],[160,'SUPER HEAVY'],[230,'MASSIVE']];
function R1_weight(n){let w=R1_WT[0][1];for(const[k,nm]of R1_WT)if(n>=k)w=nm;return w}
function gbRender(){const d=GB.d,t=gbTeam(TEAMS[teamIdx],d);if(GB.mesh)GB.sc.remove(GB.mesh);GB.mesh=shipMesh(t);GB.mesh.userData.boat.visible=false;GB.mesh.userData.wheels.visible=false;GB.mesh.userData.shield.visible=false;for(const rb of GB.mesh.userData.ribbons)rb.scale.z=4;GB.sc.add(GB.mesh);
  const base=TEAMS[teamIdx],bar=(n,k)=>{const c=R1_chip(t[k],base[k]);return`<div class="r1C"><span>${n}</span><i>${[-3,-2,-1,1,2,3].map(j=>`<b class="${j<0?(c<=j?'dn':''):(c>=j?'up':'')}"></b>`).join('')}</i><em class="${c>0?'up':c<0?'dn':''}">${c>0?'+'+c:c<0?'−'+(-c):'±0'}</em></div>`};
  $('#gbStats').innerHTML=`<h4>${base.name} · #${d.num} <span class="r1W">${R1_weight((d.bricks||[]).length)}</span></h4>`+bar('TOP SPEED','top')+bar('ACCEL','acc')+bar('GRIP','han')+bar('HULL','hull');
  const B=$('#gbBody');let h='';const sw=(key,list,lock)=>`<div class="gbSw">${list.map(c=>{const lk=lock&&lock(c);return`<button ${lk?'disabled title="'+lk+'"':''} data-k="${key}" data-v="${c}" class="${d[key]===c?'on':''}" style="--c:${c}">${lk?'🔒':''}</button>`}).join('')}</div>`;
  if(GB.tab==='parts'){for(const cat in GB_PARTS){h+=`<h5>${{nose:'NOSE',wing:'WINGS',rear:'REAR',roof:'ROOF',side:'FLANKS'}[cat]}</h5><div class="gbRow">`;for(const[id,nm,req,mod]of GB_PARTS[cat]){const ok=gbReq(req,id),buy=!ok&&req&&req.cost&&!(req.stars&&totStars()<req.stars),fx=Object.entries(mod).map(([k,v])=>`${{top:'top',acc:'acc',han:'grip',hull:'hull'}[k]} ${v>1?'+':''}${Math.round((v-1)*100)}%`).join(' · ');h+=`<button class="gbP ${d.parts[cat]===id?'on':''}" ${ok||buy?'':'disabled'} ${buy?`data-buy="${id}" data-cost="${req.cost}"`:''} data-cat="${cat}" data-id="${id}"><b>${ok?'':buy?'🛒 ':'🔒 '}${nm}</b><small>${ok?(fx||'—'):gbReqTxt(req)}</small></button>`}h+='</div>'}h=`<div class="gbInfo">🟡 ${season().cr.toLocaleString('de-DE')} studs · 📦 Brick Packs ${packs().length}/12 found in the city</div>`+h}
  else if(GB.tab==='paint'){const prem=c=>(c==='#f5c20c'||c==='#d8dde4')&&!gbReq({stars:25})?'25 ★ needed':'';h+=`<h5>BODY</h5>${sw('a',GB_COLS,prem)}<h5>ACCENT</h5>${sw('b',GB_COLS,prem)}<h5>TRIM</h5>${sw('c',GB_COLS,prem)}<h5>GLOW</h5>${sw('glow',GB_NEON)}<h5>EXHAUST TRAIL</h5>${sw('trail',GB_NEON)}<h5>LIVERY</h5><div class="gbRow">${GB_PATS.map(([id,nm,req])=>{const ok=gbReq(req,'pat_'+id),buy=!ok&&req&&req.cost;return`<button class="gbP ${d.pat===id?'on':''}" ${ok||buy?'':'disabled'} ${buy?`data-buy="pat_${id}" data-cost="${req.cost}"`:''} data-pat="${id}"><b>${ok?'':buy?'🛒 ':'🔒 '}${nm}</b>${ok?'':`<small>${gbReqTxt(req)}</small>`}</button>`}).join('')}</div><h5>RACE NUMBER</h5><div class="gbRow"><button class="gbP" data-num="-1"><b>−</b></button><button class="gbP on"><b>#${d.num}</b></button><button class="gbP" data-num="1"><b>+</b></button></div>`}
  else{h+=`<h5>HORN · press H while driving${TOUCH.on?' (or 📯)':''}</h5><div class="gbRow">${GB_HORNS.map(([id,nm,req])=>{const ok=gbReq(req,'horn_'+id),buy=!ok&&req&&req.cost;return`<button class="gbP ${d.horn===id?'on':''}" ${ok||buy?'':'disabled'} ${buy?`data-buy="horn_${id}" data-cost="${req.cost}"`:''} data-horn="${id}"><b>${ok?'':buy?'🛒 ':'🔒 '}${nm}</b><small>${ok?'tap to try':gbReqTxt(req)}</small></button>`}).join('')}</div>`}
  B.innerHTML=h;document.querySelectorAll('#gbx .gbTabs button').forEach(b=>b.classList.toggle('on',b.dataset.t===GB.tab));
  B.querySelectorAll('button').forEach(b=>b.onclick=()=>{const s=b.dataset;if(s.buy){const S2=season(),c=+s.cost;if(S2.cr<c){b.querySelector('small').textContent='need '+(c-S2.cr).toLocaleString('de-DE')+' more studs';AU.sfx('bump');return}S2.cr-=c;saveSeason(S2);const o=gbOwn();o.push(s.buy);store.set('mho_gbown',o);AU.sfx('brick')}if(s.k){d[s.k]=s.v}else if(s.cat){d.parts=d.parts||{};d.parts[s.cat]=s.id}else if(s.pat){d.pat=s.pat}else if(s.num){d.num=(d.num+ +s.num+100)%100}else if(s.horn){d.horn=s.horn;const keep=store.get('mho_build',null);store.set('mho_build',d);hornPlay();store.set('mho_build',keep);return}else return;AU.sfx('pick');gbRender()})}
function gbClose(save){cancelAnimationFrame(GB.raf);$('#gbx').hidden=true;if(save){store.set('mho_build',GB.d);AU.sfx('brick');if(state==='roam'){roamSavePos();enterRoam()}else if(state==='menu')refreshAttract&&refreshAttract()}if(RO.card&&RO.card.kind==='garage')roamOpen(RO.card)}
// extra livery patterns + race number on top of the stock design
function liveryPat(t,g){const W=512,col=t.b;if(t.pat==='plain'){g.fillStyle=t.a;g.fillRect(0,0,W,W)}
  else if(t.pat==='stripes'){g.fillStyle=t.a;g.fillRect(0,0,W,W);g.fillStyle=col;g.fillRect(W*.2,0,W*.1,W);g.fillRect(W*.34,0,W*.1,W);g.fillStyle=t.c;g.fillRect(W*.315,0,W*.012,W)}
  else if(t.pat==='flames'){g.fillStyle=t.a;g.fillRect(0,0,W,W);g.fillStyle=col;for(let i=0;i<7;i++){const y=i*76;g.beginPath();g.moveTo(0,y);g.quadraticCurveTo(W*.35,y+20,W*.55,y+38);g.quadraticCurveTo(W*.3,y+50,0,y+70);g.fill()}g.fillStyle=t.c;for(let i=0;i<7;i++){const y=i*76+14;g.beginPath();g.moveTo(0,y);g.quadraticCurveTo(W*.2,y+14,W*.33,y+24);g.quadraticCurveTo(W*.18,y+34,0,y+42);g.fill()}}
  else if(t.pat==='checker'){g.fillStyle=t.a;g.fillRect(0,0,W,W);g.fillStyle=col;const s=32;for(let y=0;y<W;y+=s)for(let x=0;x<W;x+=s)if((x/s+y/s)%2)g.fillRect(x,y,s,s)}
  else if(t.pat==='split'){g.fillStyle=t.a;g.fillRect(0,0,W/2,W);g.fillStyle=col;g.fillRect(W/2,0,W/2,W);g.fillStyle=t.c;g.fillRect(W/2-4,0,8,W)}
  else if(t.pat==='camo'){g.fillStyle=t.a;g.fillRect(0,0,W,W);const r=mul(7);for(let i=0;i<40;i++){g.fillStyle=i%2?col:t.c;g.globalAlpha=.85;g.beginPath();g.ellipse(r()*W,r()*W,20+r()*50,12+r()*30,r()*3,0,7);g.fill()}g.globalAlpha=1}
  else if(t.pat==='bolt'){g.fillStyle=t.a;g.fillRect(0,0,W,W);g.fillStyle=col;for(const y0 of[60,300]){g.beginPath();g.moveTo(0,y0);g.lineTo(W*.4,y0+20);g.lineTo(W*.32,y0+60);g.lineTo(W,y0+90);g.lineTo(W*.5,y0+70);g.lineTo(W*.58,y0+36);g.closePath();g.fill()}}
  else if(t.pat==='hex'){g.fillStyle=t.a;g.fillRect(0,0,W,W);g.strokeStyle=col;g.lineWidth=5;const r=28;for(let y=0,row=0;y<W+r;y+=r*1.5,row++)for(let x=row%2?r*.87:0;x<W+r;x+=r*1.74){g.beginPath();for(let k=0;k<6;k++){const a=k*Math.PI/3+Math.PI/6;g.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r)}g.closePath();g.stroke()}}
  else if(t.pat==='dots'){g.fillStyle=t.a;g.fillRect(0,0,W,W);g.fillStyle=col;for(let y=0;y<W;y+=48)for(let x=(y/48)%2*24;x<W;x+=48){g.beginPath();g.arc(x,y,13,0,7);g.fill()}}
  else if(t.pat==='bricks'){g.fillStyle=t.a;g.fillRect(0,0,W,W);g.strokeStyle=col;g.lineWidth=4;for(let y=0,r=0;y<W;y+=32,r++){g.beginPath();g.moveTo(0,y);g.lineTo(W,y);g.stroke();for(let x=r%2*32;x<W;x+=64){g.beginPath();g.moveTo(x,y);g.lineTo(x,y+32);g.stroke()}}}
  else if(t.pat==='zebra'){g.fillStyle=t.a;g.fillRect(0,0,W,W);g.fillStyle=col;for(let i=0;i<14;i++){g.beginPath();g.moveTo(i*40,0);g.quadraticCurveTo(i*40+40,W*.5,i*40-10,W);g.lineTo(i*40+12,W);g.quadraticCurveTo(i*40+58,W*.5,i*40+18,0);g.fill()}}
  else if(t.pat==='sunset'){const gr=g.createLinearGradient(0,0,0,W);gr.addColorStop(0,t.a);gr.addColorStop(.6,col);gr.addColorStop(1,t.c);g.fillStyle=gr;g.fillRect(0,0,W,W)}
  else if(t.pat==='circuit'){g.fillStyle=t.a;g.fillRect(0,0,W,W);g.strokeStyle=col;g.fillStyle=col;g.lineWidth=4;const r=mul(11);for(let i=0;i<26;i++){let x=r()*W,y=r()*W;g.beginPath();g.moveTo(x,y);for(let k=0;k<3;k++){if(k%2)x+=(r()-.5)*160;else y+=(r()-.5)*160;g.lineTo(x,y)}g.stroke();g.beginPath();g.arc(x,y,7,0,7);g.fill()}}
  if(t.num!=null){g.fillStyle='#ffffff';g.beginPath();g.arc(W*.62,W*.5,46,0,7);g.fill();g.fillStyle='#111';g.font='italic 900 54px system-ui';g.textAlign='center';g.textBaseline='middle';g.fillText(String(t.num),W*.62,W*.5+2)}}
function kitParts(k,m,paint,trim,dark,team){const B=(mat,w,h,d,x,y,z,rx=0,ry=0,rz=0)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);o.position.set(x,y,z);o.rotation.set(rx,ry,rz);m.add(o);return o};const gl=neonMat(team.glow,2.5);
  if(k==='spike'){const c=new THREE.Mesh(new THREE.ConeGeometry(.45,4,10),trim);c.rotation.x=-Math.PI/2;c.position.set(0,.2,-6.4);m.add(c);for(const sd of[-1,1])B(paint,.14,2.6,1.4,sd*2.2,1.4,3.6,-.4)}
  else if(k==='ram'){B(dark,7.2,1.1,.7,0,-.1,-5.2);for(const sd of[-1,0,1])B(trim,.5,1.5,.5,sd*2.4,.1,-5.5);B(gl,6.4,.18,.2,0,.5,-5.6)}
  else if(k==='blade'){for(const sd of[-1,1])B(paint,4.6,.12,2.2,sd*7.4,.1,2.6,0,sd*.25,sd*-.12)}
  else if(k==='twin'){for(const sd of[-1,1]){B(trim,.6,.6,5.6,sd*1.6,.6,5.2);B(paint,.12,2,1.6,sd*1.6,1.6,7.2,-.3)}B(paint,3.8,.12,1.2,0,2.4,7.4)}
  else if(k==='pods'){for(const sd of[-1,1]){const c=new THREE.Mesh(new THREE.CylinderGeometry(.55,.55,3,10),trim);c.rotation.x=Math.PI/2;c.position.set(sd*4.4,.55,.6);m.add(c);for(const r of[-.22,.22])B(gl,.18,.18,.2,sd*4.4+r,.55+r,-.95)}}
  else if(k==='mine'){for(const sd of[-1,1]){B(dark,1.2,1.2,1.6,sd*1.8,.4,4.6);B(neonMat('#ff2a3a',3),.5,.5,.1,sd*1.8,.4,5.45)}}
  else if(k==='coil'){for(let i=0;i<3;i++){const t=new THREE.Mesh(new THREE.TorusGeometry(.9,.14,6,16),gl);t.position.set(0,1.3,.6+i*1.1);m.add(t)}}
  else if(k==='sniper'){const c=new THREE.Mesh(new THREE.CylinderGeometry(.2,.28,7,10),dark);c.rotation.x=Math.PI/2;c.position.set(0,1.25,-2.4);m.add(c);B(gl,.12,.12,6.4,0,1.5,-2.4)}
  else if(k==='heavy'){B(paint,6.6,.9,4,0,.75,.8);B(neonMat('#ffd12c',2.5),2.2,.4,.8,0,1.4,.2)}
  else if(k==='shark'){B(paint,3.4,.5,2.2,0,-.15,-5.6);for(let i=-3;i<=3;i++){const c=new THREE.Mesh(new THREE.ConeGeometry(.16,.5,4),neonMat('#ffffff',1.6));c.rotation.x=Math.PI;c.position.set(i*.42,-.4,-6.5);m.add(c)}}
  else if(k==='plough'){B(dark,8,1.8,.4,0,.1,-6,-.35);B(neonMat('#ffd12c',2.4),8.1,.2,.42,0,-.7,-6.1,-.35)}
  else if(k==='prongs'){for(const sd of[-1,1]){const c=new THREE.Mesh(new THREE.CylinderGeometry(.18,.32,4.4,8),trim);c.rotation.x=Math.PI/2;c.position.set(sd*1.5,0,-7);m.add(c);B(gl,.25,.25,.25,sd*1.5,0,-9.2)}}
  else if(k==='duck'){B(neonMat('#ff9a1c',1.3),3.6,.35,2.6,0,-.05,-6.6)}
  else if(k==='drill'){const c=new THREE.Mesh(new THREE.ConeGeometry(1,3.6,8),trim);c.rotation.x=-Math.PI/2;c.position.set(0,.1,-7.2);m.add(c);for(let i=0;i<3;i++){const t=new THREE.Mesh(new THREE.TorusGeometry(.75-i*.2,.08,4,14),gl);t.position.set(0,.1,-6.2-i*.9);m.add(t)}}
  else if(k==='delta'){for(const sd of[-1,1]){const sh=new THREE.Shape();sh.moveTo(0,0);sh.lineTo(sd*8,3);sh.lineTo(0,5);const g2=new THREE.Mesh(new THREE.ShapeGeometry(sh),paint);g2.material.side=THREE.DoubleSide;g2.rotation.x=-Math.PI/2;g2.position.set(sd*1.5,.15,4);m.add(g2)}}
  else if(k==='bi'){for(const y of[.1,2.2])for(const sd of[-1,1])B(paint,5,.12,1.8,sd*5.4,y,1.8);for(const sd of[-1,1])B(trim,.14,2.1,.14,sd*6.8,1.15,1.8)}
  else if(k==='stub'){for(const sd of[-1,1])B(paint,2.4,.3,2.4,sd*4.6,.15,1.6)}
  else if(k==='gull'){for(const sd of[-1,1])B(paint,5.2,.14,2.2,sd*5.6,1.1,2.2,0,0,sd*.42)}
  else if(k==='jets'){for(const sd of[-1,1]){const c=new THREE.Mesh(new THREE.CylinderGeometry(.6,.45,2.6,10),dark);c.rotation.x=Math.PI/2;c.position.set(sd*6.4,-.2,2.6);m.add(c);B(gl,.7,.7,.12,sd*6.4,-.2,3.95)}}
  else if(k==='spoiler'){for(const sd of[-1,1])B(trim,.2,1.6,.5,sd*2.4,1.4,6.4);B(paint,6.4,.2,1.6,0,2.3,6.6,-.15)}
  else if(k==='fins'){for(const a of[-.6,0,.6])B(paint,.14,2.4,2,Math.sin(a)*1.4,1.5,6.6,0,0,a)}
  else if(k==='nozzle'){const c=new THREE.Mesh(new THREE.CylinderGeometry(1.1,.8,2.2,12,1,true),dark);c.rotation.x=Math.PI/2;c.position.set(0,.5,7);m.add(c);const f=new THREE.Mesh(new THREE.CircleGeometry(.85,12),neonMat(team.trail,3));f.position.set(0,.5,8.05);m.add(f)}
  else if(k==='stacks'){for(const sd of[-1,1])for(const z of[4.6,5.6]){const c=new THREE.Mesh(new THREE.CylinderGeometry(.22,.22,2.2,8),neonMat('#c0c6d0',.8));c.position.set(sd*2.3,1.5,z);m.add(c)}}
  else if(k==='skirts'){for(const sd of[-1,1]){B(dark,.4,.6,9,sd*3.3,-.5,.6);B(gl,.1,.12,8.6,sd*3.52,-.5,.6)}}
  else if(k==='cannons'){for(const sd of[-1,1]){const c=new THREE.Mesh(new THREE.CylinderGeometry(.35,.35,3.4,10),dark);c.rotation.x=Math.PI/2;c.position.set(sd*3.4,.6,-1);m.add(c)}}
  else if(k==='bricks'){const cs=[team.a,team.b,'#ffd12c'];for(const sd of[-1,1])for(let i=0;i<3;i++){const mm=new THREE.MeshStandardMaterial({color:cs[i%3],roughness:.4});B(mm,1.3,.7,1.9,sd*3.6,.0+i*.72,1.2);for(const zz of[-.45,.45]){const s2=new THREE.Mesh(new THREE.CylinderGeometry(.24,.24,.22,10),mm);s2.position.set(sd*3.6,.45+i*.72,1.2+zz);m.add(s2)}}}
  else if(k==='tubes'){for(const sd of[-1,1]){const c=new THREE.Mesh(new THREE.CylinderGeometry(.16,.16,7,8),neonMat(team.glow,3.2));c.rotation.x=Math.PI/2;c.position.set(sd*3.1,.4,.8);m.add(c)}}
  else if(k==='floats'){for(const sd of[-1,1]){const c=new THREE.Mesh(new THREE.CapsuleGeometry(.6,6,4,10),trim);c.rotation.x=Math.PI/2;c.position.set(sd*3.8,-.7,.8);m.add(c)}}
  else if(k==='antenna'){const c=new THREE.Mesh(new THREE.CylinderGeometry(.05,.08,4,6),dark);c.position.set(1,3,3);m.add(c);B(gl,.3,.3,.3,1,5,3)}
  else if(k==='siren'){B(dark,2.6,.3,.7,0,1.55,.6);B(neonMat('#ff2a3a',3.2),1.1,.45,.6,-.7,1.9,.6);B(neonMat('#2a7bff',3.2),1.1,.45,.6,.7,1.9,.6)}
  else if(k==='sfin'){const sh=new THREE.Shape();sh.moveTo(0,0);sh.lineTo(3,0);sh.lineTo(2.4,2.6);const f=new THREE.Mesh(new THREE.ShapeGeometry(sh),paint);f.material.side=THREE.DoubleSide;f.rotation.y=-Math.PI/2;f.position.set(0,1.3,2);m.add(f)}
  else if(k==='flag'){const c=new THREE.Mesh(new THREE.CylinderGeometry(.06,.06,4.2,6),dark);c.position.set(-1.2,3.2,4.6);m.add(c);B(new THREE.MeshStandardMaterial({color:'#e01e2b'}),.06,.7,2,-1.2,4.9,5.6);B(new THREE.MeshStandardMaterial({color:'#ffffff'}),.06,.7,2,-1.2,4.2,5.6)}
  else if(k==='dish'){const c=new THREE.Mesh(new THREE.SphereGeometry(1.1,12,8,0,Math.PI*2,0,Math.PI/3),trim);c.material.side=THREE.DoubleSide;c.rotation.x=-.9;c.position.set(0,2.2,3);m.add(c);B(dark,.2,1,.2,0,1.6,3.2)}
  else if(k==='pilot'){const f=minifig(team.a);f.scale.setScalar(.55);f.position.set(0,1.1,.4);m.add(f)}
  else if(k==='crown'){for(let i=0;i<5;i++){const c=new THREE.Mesh(new THREE.ConeGeometry(.35,1.6,6),neonMat('#ffd12c',2.6));c.position.set((i-2)*.9,1.9,1.2);m.add(c)}for(const sd of[-1,1])B(paint,.16,3,2.2,sd*5.8,1.4,3.6,-.3)}}
const PILOTS=['VOSS','KAYA','LINDQVIST','OKAFOR','BRANDT','NAKAMURA','FERREIRA','ADLER','ROSSI','WEBER','ÇELIK','MOREAU'];
// rival pilots: rating r (0 weakest … 1 champion), personality drives aggression, weapon use and radio lines
const PDL=[{n:'ROSSI',full:'Luca Rossi',flag:'🇮🇹',team:'zeil',style:'showman',r:.05},{n:'WEBER',full:'Jana Weber',flag:'🇩🇪',team:'nordend',style:'clean',r:.12},
 {n:'MOREAU',full:'Inès Moreau',flag:'🇫🇷',team:'helix',style:'clean',r:.2},{n:'OKAFOR',full:'Tunde Okafor',flag:'🇳🇬',team:'aeppler',style:'aggressor',r:.28},
 {n:'FERREIRA',full:'Rui Ferreira',flag:'🇵🇹',team:'ostend',style:'gunner',r:.36},{n:'ÇELIK',full:'Deniz Çelik',flag:'🇹🇷',team:'zeil',style:'aggressor',r:.45},
 {n:'BRANDT',full:'Ole Brandt',flag:'🇩🇪',team:'nordend',style:'gunner',r:.53},{n:'NAKAMURA',full:'Aoi Nakamura',flag:'🇯🇵',team:'helix',style:'clean',r:.62},
 {n:'LINDQVIST',full:'Saga Lindqvist',flag:'🇸🇪',team:'ostend',style:'showman',r:.7},{n:'ADLER',full:'Max Adler',flag:'🇩🇪',team:'aeppler',style:'gunner',r:.8},
 {n:'KAYA',full:'Elif Kaya',flag:'🇹🇷',team:'kronos',style:'aggressor',r:.9},{n:'VOSS',full:'Mira Voss',flag:'🇩🇪',team:'kronos',style:'clean',r:1}];
const BOSS_TEAM={id:'shadow',name:'Schattenwerk',desc:'Nobody knows who pays for it.',a:'#16121c',b:'#ff1e3c',c:'#ffffff',glow:'#ff2a4a',trail:'#ff1e3c',c1:'#ff1e3c',c2:'#ff6a7a',top:1.04,acc:1.06,han:1.05,hull:1.4,unlock:0};
