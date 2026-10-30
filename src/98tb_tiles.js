// tb1 (tilebuild, 2026-10-30; docs/DESIGN_tiled_city_build.md step 1): ring scaffolding for the tiled city build. ?tb1=1 (OD_FLAG, default OFF).
// Idea (docs/wiki/learn/cuphead-structure.md, "scene per level"): a shell that loads before the reveal and per-area content that streams after it.
// Frankfurt only. R0 = the hubTile (800 m) cells that touch the disc of 800 m around the spawn. Ground cells (gndGen), filler roads + kerbs (hubRoads loop),
// crossing pads (FILL_X), street ribbons / junction rings / trails (cityStreetsBuild) and the kerb runs (CE_kerbs) of R0 are built before the reveal;
// every other piece is queued here (TB.pend / TB.gnd) and built after control, nearest to the car first, one tile at a time, on the B2_pump idle slicer.
// Same data, only the timing changes: the geometry thunks are the unchanged builders, the deferred pieces go into a second TBatch (TB.bt) that flushes per tile.
// TB.rec = vertex count per TBatch key (material#hubTile) recorded at add time; TB_hash() must be equal with the flag OFF and ON (GO perf/tb-geo).
const TB={on:OD_FLAG('tb1')&&CID==='fra',R:800,delay:4000,pend:[],gnd:null,sp:null,R0:null,bt:null,dbg:/[?&]tbdbg=1/.test(location.search)?[]:null,rec:new Map(),cat:{},lab:'',ph:5,q:9,kt:null,armed:0,go:0,fin:0,ms:0,tc:0,tf:0,step:0,steps:0,rs:0,n:{in:0,def:0}};
window.TBq=TB;/* GO perf/tb-play reads it from the iframe */
function TB_spawn(){if(TB.sp)return TB.sp;let p=null;try{const sv=roamSave();if(sv&&sv.pos&&sv.lay===LAYOUT_VER&&isFinite(sv.pos.x))p=[sv.pos.x,sv.pos.z]}catch(e){}return TB.sp=p||[-378,448]}
// the hubTile ids whose 800 m box touches the disc R around the spawn
function TB_tiles(){if(TB.R0)return TB.R0;const[sx,sz]=TB_spawn(),R=TB.R,S=new Set();for(let i=Math.floor((sx-R-HX0)/800);i<=Math.floor((sx+R-HX0)/800);i++)for(let j=Math.floor((sz-R-HZS)/800);j<=Math.floor((sz+R-HZS)/800);j++){const bx0=HX0+i*800,bz0=HZS+j*800,dx=Math.max(bx0-sx,0,sx-bx0-800),dz=Math.max(bz0-sz,0,sz-bz0-800);if(Math.hypot(dx,dz)<=R)S.add(hubTile(bx0+1,bz0+1))}return TB.R0=S}
function TB_in(x,z){return !TB.on||TB_tiles().has(hubTile(x,z))}
function TB_inBox(x0,z0,x1,z1,pad=40){if(!TB.on)return true;const S=TB_tiles();for(let i=Math.floor((Math.min(x0,x1)-pad-HX0)/800);i<=Math.floor((Math.max(x0,x1)+pad-HX0)/800);i++)for(let j=Math.floor((Math.min(z0,z1)-pad-HZS)/800);j<=Math.floor((Math.max(z0,z1)+pad-HZS)/800);j++)if(S.has(i+64+256*(j+64)))return true;return false}
function TB_rec(k,n,g){if(TB.dbg&&g){g.computeBoundingBox();const b=g.boundingBox;TB.dbg.push(TB.lab+' '+Math.round((b.min.x+b.max.x)/2)+' '+Math.round((b.min.z+b.max.z)/2)+' '+n)}TB.rec.set(k,(TB.rec.get(k)||0)+n);TB.cat[TB.lab]=(TB.cat[TB.lab]||0)+n}
// material uuids differ per page: the hash is over the sorted '#tile:vertices' strings
function TB_hash(){let h=2166136261;for(const s of[...TB.rec].map(([k,n])=>k.replace(/^[^#]*#/,'#')+':'+n).sort()){for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}}return(h>>>0).toString(16)+'/'+TB.rec.size}
// a piece of the city: now when its centre (or, for long pieces, its box +40 m) touches R0, else queued with a rank. Ranks keep the order that matters to the
// junction-conform capture (src/98tj_junc.js: a pad sees the road triangles captured before it): 1 roads, 2 fill pads (see roads only), 3 street ribbons, 4 kerb-run streets
// (CE_kerbs, collected in TB.kt), 5 the CE merge, 6 everything else per tile (junction rings, trails, TJ pads). Ranks 1-5 run for all tiles first, rank 6 tile by tile with a flush.
function TB_later(x,z,fn,rk=6){TB.pend.push({x,z,t:hubTile(x,z),fn,rk});TB.n.def++}
function TB_put(bt,x,z,mk,mat,rk=6,box){const ph=rk===1?1:rk===3?3:5,go=(b)=>{TB.ph=ph;try{b.add(mk(),mat)}finally{TB.ph=5}};if(box?TB_inBox(...box):TB_in(x,z)){TB.n.in++;go(bt)}else TB_later(x,z,()=>go(TB.bt),rk)}
function TB_begin(){TB.bt=new TBatch();TB.bt.rec=1;TB.pend.length=0;TB.gnd=null;TB.n.in=TB.n.def=0}
// after control (+TB.delay ms: nothing streams in the reveal+3 s window), once
function TB_arm(){if(TB.armed||!TB.on||!(TB.pend.length||TB.gnd))return;TB.armed=1;const poll=()=>{if(state==='roam'&&typeof RO!=='undefined'&&RO.on&&!RO.frozen&&!RO.bootHold){TB.tc=performance.now();setTimeout(TB_start,TB.delay)}else setTimeout(poll,200)};poll()}
function TB_start(){if(TB.go)return;TB.go=1;TB_snap();B2.tb=TB.g=TB_gen();B2_start()}/* tb1b: own slot in the B2 pump (half of each slice), not the 3rd generator in B2.q */
// longest single pump step of the queue (ms, wall) and the count: GO perf/tb-play (a step is one TB_gen unit: <= ~3 ms of work, or one tile merge)
function TB_step(ms){TB.steps++;if(ms>TB.step)TB.step=Math.round(ms)}
// what exists at control (the queue has not run yet): ground cells whose centre is within R of the spawn, and queued pieces with their centre within R (must be 0)
function TB_snap(){if(TB.snap)return TB.snap;const g=TB.GL,[sx,sz]=TB_spawn();let tot=0,got=0,all=0,allGot=0;if(g)for(let i=0;i<g.nx;i++)for(let j=0;j<g.nz;j++){const x=g.x0+(i+.5)*g.dx,z=g.z0+(j+.5)*g.dz,b=GND_in(g,x,z)!==undefined;all++;if(b)allGot++;if(Math.hypot(x-sx,z-sz)<=TB.R){tot++;if(b)got++}}
  let near=0;for(const p of TB.pend)if(Math.hypot(p.x-sx,p.z-sz)<=TB.R)near++;return TB.snap={cells:[got,tot],all:[allGot,all],pend:TB.pend.length,near,gnd:!!TB.gnd}}
// tb1b: the order follows the car: the not-yet-built pieces are re-sorted by the distance to the car's CURRENT position about once a second (TB.rs counts the re-sorts),
// so a warp or a fast-travel in the first seconds sends the queue to the new place; the tile groups (rank 6) pick the nearest unbuilt tile each time one is done.
function* TB_gen(){const t0=performance.now();let t=t0;const tick=()=>performance.now()-t>2;
  if(TB.gnd){const g=TB.gnd;TB.gnd=null;yield* g;t=performance.now()}
  const pos=()=>typeof RO!=='undefined'&&isFinite(RO.x)?[RO.x,RO.z]:TB_spawn(),P=TB.pend.splice(0),run=p=>{try{p.fn()}catch(e){console.warn('TB',e)}};
  for(let rk=1;rk<=5;rk++){let L=P.filter(p=>p.rk===rk),ts=-1e9;while(L.length){const n=performance.now();if(n-ts>1000){const[cx,cz]=pos();for(const p of L)p.d=Math.hypot(p.x-cx,p.z-cz);L.sort((a,b)=>b.d-a.d);ts=n;TB.rs++}run(L.pop());if(tick()){yield;t=performance.now()}}}
  const G=new Map();for(const p of P)if(p.rk===6){let L=G.get(p.t);if(!L)G.set(p.t,L={t:p.t,p:[],d:1e12});L.p.push(p)}
  while(G.size){const[cx,cz]=pos();let best=null;for(const L of G.values()){L.d=1e12;for(const p of L.p)L.d=Math.min(L.d,Math.hypot(p.x-cx,p.z-cz));if(!best||L.d<best.d)best=L}TB.rs++;G.delete(best.t);
    for(const p of best.p){run(p);if(tick()){yield;t=performance.now()}}
    yield* TB_flush('#'+best.t)}
  yield* TB_flush('');TB.fin=1;TB.tf=performance.now();TB.ms=Math.round(performance.now()-t0);BMK('tb done');TJ.cap=null;TJ.capOn=0;if(typeof TRN!=='undefined')TRN.gm=null}
// flush the deferred batch keys that end with sfx ('' = all), one key per step (one mergeGeometries each)
function* TB_flush(sfx){for(const[k,e]of[...TB.bt.m]){if(sfx&&!k.endsWith(sfx))continue;TB.bt.m.delete(k);const one=new TBatch();one.rec=1;one.m.set(k,e);one.flush(HUB.grp);yield}}
// GO helper: run the queue to the end, counting simulated 30 fps frames of 4 ms (the B2_pump slice); returns simulated game-seconds
function TB_drain(){let fr=0;TB_start();const t=performance.now();while(!TB.fin&&fr<20000){fr++;const t1=performance.now();while(!TB.fin&&performance.now()-t1<4){let r;try{r=TB.g.next()}catch(e){console.error(e);r={done:true}}if(r.done){TB.fin=TB.fin||1;break}}}return{sec:+(fr/30).toFixed(1),ms:Math.round(performance.now()-t)}}
