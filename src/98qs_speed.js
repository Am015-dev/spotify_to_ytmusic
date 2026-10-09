// ==== QS (v88z quick wins): real top speeds per car class + boost top, realistic traffic mix and city cruise speeds ====
// Speeds: free roam only (races unchanged). The open-road / Autobahn top is the class's real top speed in km/h on the HUD; the city
// (RO.inCity, the whole street grid) runs at TUNE.spCity of it; BOOST / drift turbo / pads add TUNE.spBoost on top (nitrous-style:
// a modest top-speed gain, most of it is the push). Handling is untouched: steering, camera and FX still scale with the OLD RO.top,
// so the car turns exactly as before at any given speed. Sources + table: docs/TUNE.md "v88z speeds".
Object.assign(TUNE,{spOn:1,spCar:250,spGT:300,spSuper:330,spHyper:340,spTuner:250,spRoad:210,spCoupe:230,spOff:180,spBoat:90,
 spBus:100,spTruck:90,spLimo:200,spMT:110,spCity:.66,spOpen:1,spBoost:.15,spMax:345,
 trOn:1,trCar:45,trHeavy:38,trScoot:40});
// garage set id → class knob (template's own description: k)
const QS_CLS={rod:'spCar',ebbel:'spCar',posei:'spGT',gold:'spSuper',t_su:'spTuner',t_su_mid:'spTuner',t_su_gt:'spTuner',t_su_wide:'spTuner',t_su_sky:'spTuner',
 t_su_pink:'spRoad',t_sc_tm:'spCoupe',t_sc_hy:'spHyper',t_bus:'spBus',t_truck:'spTruck',t_limo:'spLimo',t_mt:'spMT'};
function QS_cls(){if(CR_MODE==='boat')return'spBoat';if(CR_MODE==='4x4')return'spOff';let id='rod';try{id=GAR_set().id}catch(e){}return QS_CLS[id]||'spCar'}
// base top (km/h, open road, no boost): class × player level × BOOSTER upgrade, capped at spMax
function QS_kmh(lvl){let up=1;try{if(CR_MODE==='car')up=GAR_upMul(GAR_ups(),'top')}catch(e){}return Math.min(TUNE.spMax,TUNE[QS_cls()]*(lvl?lvl.top:1)*up)}
// speed target (m/s) replacing the old tt in roamStep; k = surface fit × v85 offroad factor
function QS_tt(lvl,k){const a=RO.onAB?1:RO.inCity?TUNE.spCity:TUNE.spOpen,b=Math.max(RO.bRamp||0,RO.turbo>0&&!RO.bash?1:0);return QS_kmh(lvl)/3.6*a*(1+TUNE.spBoost*b)*k}
// ---- traffic mix (of HUB.cars, 150): urban counts are mostly cars; delivery vans ~10-14 % (Vienna count: 13.5 % delivery vehicles),
// heavy trucks a few %, buses a few %; Athens: two-wheelers ~24 % of the Attica fleet (EL.STAT via NTUA) → 15 % scooters on the road.
// Frankfurt slots (HCAR after the swaps below): 0 sedan,1 hypercar,2 taxi,3 van,4 truck,5 delivery,6 police,7 time coupe,8 bus,9 tuner,10 roadster
// Athens: 0 taxi,1 sedan,2 van,3 suv,4 delivery,5 sports,6 trolleybus,7 scooter,8 tuner,9 silver tuner
const QS_MIX={fra:[52,6,14,15,3,4,5,18,6,15,12],ath:[18,52,13,18,4,5,6,22,6,6]};
{const i=HCAR.indexOf('garbage-truck');if(i>=0)HCAR[i]='bus'} // same type count = same draw calls; garbage trucks are < 1 % of city traffic
let QS_K=null,QS_KC='';function QS_kind(i){if(QS_KC!==CID){QS_K=null;QS_KC=CID}if(!TUNE.trOn)return CID==='fra'?i%HCAR.length:ATH_K[i%ATH_K.length];
 if(!QS_K){const W=QS_MIX[CID==='fra'?'fra':'ath'],L=[];W.forEach((n,k)=>{for(let j=0;j<n;j++)L.push(k)});const r=mul(919);for(let j=L.length-1;j>0;j--){const q=Math.floor(r()*(j+1));[L[j],L[q]]=[L[q],L[j]]}QS_K=L}
 return QS_K[i%QS_K.length]}
// city cruise speeds (km/h → m/s, ±15 %): 50 km/h limit on Frankfurt and Athens city streets
function QS_v0(k){if(!TUNE.trOn)return HCAR[k]==='#scoot'?rr(15,22):rr(14,24);const nm=HCAR[k]||'',m=nm==='#scoot'?TUNE.trScoot:/truck|delivery|bus|#troll/.test(nm)?TUNE.trHeavy:TUNE.trCar;return m/3.6*(.85+.3*R())}
window.__qs={line:ab=>{const S=ab?abSamples().filter(S=>S.r.ab&&!S.r.c):CITY_S.filter(S=>S.r.cls!=='hill'&&S.r.cls!=='ped'&&!S.prof);S.sort((a,b)=>b.L-a.L);return S[0].pts.map(p=>[p.x,p.z])},kmh:()=>QS_kmh(carStat()),cls:QS_cls,mix:()=>{const n={};for(const c of HUB.cars){const k=HCAR[c.k];n[k]=(n[k]||0)+1}return n}};
