'use strict';
// HUMANOID scale (rv-human: every humanoid 1.80 m +-3 %). Only the humanoids whose height is a pure constant can be checked without geometry:
// pavement pedestrians (4.18 x SC_K.ped) and the moped rider (4.01 x .75 x SC_K.moped), using the FINAL SC_K after every Object.assign(SC_K,...).
// The quest giver / on-foot figure / City-set driver need minifig() geometry and stay in the in-game check (RSZ_human, checklist rv-human).
const L=require('./lib.js');
module.exports=T=>{
 T.group('humans');const src=L.JSCODE();
 const base=L.ev(L.constSrc('SC_K'));
 let i=0;while((i=src.indexOf('Object.assign(SC_K,',i))>=0){const e=L.bal(src,i+'Object.assign'.length);try{Object.assign(base,L.ev(src.slice(i+'Object.assign(SC_K,'.length,e)))}catch(x){}i=e}
 if(L.SEED==='human-giant')base.ped=.66;
 const HUM=+/RSZ\.HUM=([\d.]+)/.exec(src)[1];T.eq(HUM,1.8,'target-is-1.80');
 const tol=+/Math\.abs\(r\)>\.(\d+)/.exec(L.rd('98sz2_ride_audit.js'))[1];T.eq(tol,3,'audit-tolerance-3pct');
 const ped=4.18*base.ped,mop=4.01*.75*base.moped;
 T.ok(Math.abs(ped/HUM-1)<=.03,'pedestrian-1.80m','pedestrian '+ped.toFixed(2)+' m');
 T.ok(Math.abs(mop/HUM-1)<=.03,'moped-rider-1.80m','moped rider '+mop.toFixed(2)+' m');
 T.ok(base.ped>.2&&base.ped<.7,'ped-scale-sane');
 // the pedestrian crowd uses SC_K.ped (not a raw literal)
 T.ok(/SC_K\.ped/.test(L.rd('96_scale_qa.js')),'ped-uses-SC_K');
};
