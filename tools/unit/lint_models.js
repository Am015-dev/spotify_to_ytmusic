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
 T.ok(total>=120,'model-total','only '+total+' models checked');
};
