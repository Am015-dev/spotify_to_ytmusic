'use strict';
// MODEL (asset-pipeline) lint on the LDraw chunks built from src/MODELS by tools/ld/mkmodels.py (0.2 s). Rides = chunks v<set>_<n>, audi, porsche.
const L=require('./lib.js');
module.exports=T=>{
 T.group('models');const M=L.loadModels();
 if(!M){T.ok(false,'build','tools/ld/mkmodels.py failed: cannot lint models');return}
 const ids=Object.keys(M.chunks);T.ok(ids.length>=100,'chunk-count','only '+ids.length+' chunks');
 const mesh={};for(const id of ids)Object.assign(mesh,M.chunks[id].M);
 if(L.SEED==='model-hollow'){const k=ids.find(i=>/^v6/.test(i));const m=Object.values(M.chunks[k].D)[0];m.B=m.B.filter((b,i)=>i%9===0)}
 if(L.SEED==='model-color'){const k=ids.find(i=>/^v6/.test(i));const m=Object.values(M.chunks[k].D)[0];m.B[0][5]=99}
 const RIDE=id=>/^v\d/.test(id)||id==='audi'||id==='porsche';
 const WHEEL=b=>/^w[A-Za-z]\d*(@\d+)?$/.test(b[0])||/wheel|tyre|tire/i.test((mesh[b[0]]||{}).n||'');
 let total=0;
 for(const id of ids){const D=M.chunks[id].D;
  for(const k in D){const m=D[k],B=m.B,tag=id+(k===id?'':'.'+k);total++;
   T.ok(Array.isArray(B)&&B.length>0,'has-bricks-'+tag,'empty model');
   if(!B||!B.length)continue;
   T.ok(Array.isArray(m.C)&&m.C.length>0,'has-colours-'+tag);
   let badC=0,badN=0;for(const b of B){const c=b[5];if(!(c>=0&&c<m.C.length))badC++;if(!(isFinite(b[1])&&isFinite(b[2])&&isFinite(b[3])&&Math.abs(b[1])<400&&Math.abs(b[2])<400&&b[3]>=-5&&b[3]<400))badN++}
   T.ok(!badC,'colour-index-'+tag,badC+' bricks point past the colour table');
   T.ok(!badN,'coords-sane-'+tag,badN+' bricks with NaN/out-of-range position');
   if(!RIDE(id))continue;
   const xs=B.map(b=>b[1]),ys=B.map(b=>b[2]),zs=B.map(b=>b[3]),mn=a=>Math.min(...a),mx=a=>Math.max(...a);
   const W=mx(xs)-mn(xs)+1,Ln=mx(ys)-mn(ys)+1,Ht=mx(zs)-mn(zs),cols=new Set(B.map(b=>b[1]+','+b[2])).size;
   const fill=cols/(W*Ln),lw=Ln/W,nwh=B.filter(WHEEL).length;
   T.ok(B.length>=14,'ride-bricks-'+tag,'only '+B.length+' bricks (hollow?)');
   T.ok(fill>=.2,'ride-fill-'+tag,'footprint fill '+fill.toFixed(2)+' < 0.20 = hollow shell');
   T.ok(Ht>=6,'ride-height-'+tag,'height '+Ht+' < 6 plates: no roof/body');
   T.ok(lw>=1.15&&lw<=4.6,'ride-aspect-'+tag,'length/width '+lw.toFixed(2)+' not car-like');
   T.ok(W>=4&&W<=13,'ride-width-'+tag,'width '+W+' studs outside 4..13');
   T.ok(Ln<=32,'ride-length-'+tag,'length '+Ln+' studs > 32');
   T.ok(nwh>=4,'ride-wheels-'+tag,nwh+' wheel parts (<4)');
  }}
 // ---- ride size in METRES: stud .245 m x set scale (minifig City/Town sets RSZ.MS x LD_FIG, 4-wide RACERS x RSZ.rk) x the per-ride factor table RSZ.F (98sz_ride_scale.js)
 T.group('ride-scale');
 {const src=L.JSCODE(),MS=L.ev(/const RSZ=\{MS:(\[[^\]]*\])/.exec(src)[1]),FIG=+/const LD_FIG=([\d.]+)/.exec(src)[1],RK=+/RSZ\.rk=(\d+)/.exec(src)[1],F=L.ev(/RSZ\.F=(\{[^}]*\})/.exec(src)[1]);
  const RAC=['7611','7612','7613','8120','8121'];T.ok(MS.length>=10&&FIG>1&&RK>=1,'scale-consts-found');let n=0;
  for(const id in M.chunks){if(!/^v\d/.test(id))continue;const num=id.slice(1).split('_')[0],k=MS.includes(num)?FIG:RAC.includes(num)?RK:1,f=F['t_'+id]||1;
   for(const m of Object.values(M.chunks[id].D)){const xs=m.B.map(b=>b[1]),ys=m.B.map(b=>b[2]),Ln=(Math.max(...ys)-Math.min(...ys)+1)*.245*k*f,W=(Math.max(...xs)-Math.min(...xs)+1)*.245*k*f;n++;
    T.ok(Ln>=1.4&&Ln<=15.6,'length-in-any-class-'+id,'length '+Ln.toFixed(1)+' m outside 1.4..15.6 (bike..bus +-20%)');
    T.ok(W<=5,'width-under-5m-'+id,'width '+W.toFixed(1)+' m (BC_dims caps at 3.2 after this)');
    T.ok(W/Ln<=1.15,'not-wider-than-long-'+id,'W/L '+(W/Ln).toFixed(2))}}
  T.ok(n>=100,'rides-measured','only '+n)}
 T.ok(total>=120,'model-total','only '+total+' models checked');
};
