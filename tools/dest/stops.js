// stops.js <url> <fra|ath> <road|wander> <secs> [seed]: fixed-step drive on the BUILT page, logs every hard stop (speed drop > 50 % in < 0.3 s, from > 8 m/s) with the object type hit.
// road = road-follow bot (rfSnap look-ahead, as tRv2k2); wander = random heading changes every 2-5 s, gas held, steers toward the target heading. Prints one JSON line.
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const [U,C,MODE,SECS,SEED]=process.argv.slice(2);
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await(await b.newContext({viewport:{width:852,height:393},isMobile:true,hasTouch:true})).newPage();p.setDefaultTimeout(900000);
 await p.goto(U+'?test='+C+'&draw=0');await p.waitForFunction(()=>window.__tq&&__tq.ready&&window.__qa,null,{polling:250,timeout:900000});
 const out=await p.evaluate(async a=>window.__qa.ev('('+String(function(a){
  try{__tq.reset()}catch(e){}
  let seed=a.seed|0||12345;const rnd=()=>(seed=(seed*1664525+1013904223)>>>0)/4294967296;
  const q=CAM_road(70);if(q)roamWarp(q.x,q.z,q.h,true);RO.v=0;__qa.step(30);
  const W=x=>Math.atan2(Math.sin(x),Math.cos(x));
  // source tracking per frame
  let cur=[];const hitB=[];
  const _hit=SC_hit;SC_hit=function(x,z,y){const b=_hit.apply(this,arguments);if(b)cur.push({k:'bld',b});return b};
  const _bump=SM2_bump;SM2_bump=function(o){cur.push({k:'propbump',o});return _bump.apply(this,arguments)};
  const _sm=SM2_smash;SM2_smash=function(kind){const r=_sm.apply(this,arguments);cur.push({k:'sm2_'+kind+(r?'_smash':'_tap')});return r};
  const _rb=roamBounce;roamBounce=function(){const s0=Math.abs(RO.v),vy=RO.vy,tb=RO.tb;const r=_rb.apply(this,arguments);cur.push({k:'rb:'+(tb?'T':'W')+' '+Math.round(s0*3.6)+'>'+Math.round(Math.abs(RO.v)*3.6)+' vy'+(vy||0).toFixed(1)+' hv'+(window.DEST_hv?DEST_hv():'')});return r};
  const _wb=W10_bump;W10_bump=function(){cur.push({k:'traffic'});return _wb.apply(this,arguments)};
  const cls=b=>{const g=groundY(b.x,b.z),hh=b.h!=null?b.h-(b.y0!=null?b.y0+1.5:g):0,w=Math.round(b.hw*2*10)/10,d=Math.round(b.hd*2*10)/10,mn=Math.min(w,d),mx=Math.max(w,d);
   const tag=b.simp?'simp':b.lz?'lz':b.ld?'ld':b.fp?'fp':'';const sz=hh<1.3?'low':hh<3?'h<3':hh<8?'h<8':'tall';const sh=mx<=3?'small':mx<=8?'medium':'big';return `bld:${sz}/${sh}${tag?'/'+tag:''}${mn<=1.2&&mx>6?'/thin-long':''}`};
  {let v=RO.v;Object.defineProperty(RO,'v',{configurable:true,get(){return v},set(n){if(Math.abs(v)>4&&Math.abs(n)<Math.abs(v)*.85){const L=(new Error().stack||'').split('\n').slice(2,6).map(l=>(l.trim().split(' ')[1]||'?'));cur.push({k:'cut:'+L.filter(x=>x!=='roamStep'&&!/^(Object|Array)/.test(x)).slice(0,2).join('>')})}v=n}})}
  const dt=1/30,hist=[],stops=[];let t=0,dist=0,px=RO.x,pz=RO.z,tgt=RO.h,tchg=0,cool=0,km=0;
  for(let i=0,N=a.secs*30;i<N;i++){cur=[];t+=dt;
   if(a.mode==='road'){const la=12+RO.v*.9,qq=rfSnap(RO.x+Math.sin(RO.h)*la,RO.z+Math.cos(RO.h)*la,60),e=qq?W(Math.atan2(qq[0]-RO.x,qq[1]-RO.z)-RO.h):0;K.KeyW=K.ArrowUp=true;K.ArrowLeft=e>.06;K.ArrowRight=e<-.06}
   else{if(t>=tchg){tgt=rnd()*6.283;tchg=t+2+rnd()*3}const e=W(tgt-RO.h);K.KeyW=K.ArrowUp=true;K.ArrowLeft=e>.08;K.ArrowRight=e<-.08}
   roamStep(dt);dist+=Math.hypot(RO.x-px,RO.z-pz);px=RO.x;pz=RO.z;km+=Math.abs(RO.v)*3.6*dt;
   hist.push({v:Math.abs(RO.v),c:cur});if(hist.length>10)hist.shift();
   cool-=dt;
   if(cool<=0&&hist.length>=2){let mxv=0,mi=0;for(let j=0;j<hist.length-1;j++)if(hist[j].v>mxv){mxv=hist[j].v;mi=j}const v1=hist[hist.length-1].v;
    if(mxv>8&&v1<mxv*.5){const srcs=[];for(let j=mi;j<hist.length;j++)for(const s of hist[j].c)srcs.push(s);
     const names=[...new Set(srcs.map(s=>s.k==='bld'?cls(s.b):s.k.startsWith('rb:')?s.k:s.k.startsWith('cut:')?s.k:s.k==='propbump'?'propbump:'+(s.o.t||'?'):s.k))];
     // nearest alive prop smash / debris is not recorded here; terrain/edge or pin when no source
     const bl=srcs.find(s=>s.k==='bld');let ident=null;if(bl){const B=bl.b,hits=[];try{HUB.grp.traverse(o=>{if(hits.length>5||!o.isMesh&&!o.isInstancedMesh)return;if(!o.geometry.boundingBox)o.geometry.computeBoundingBox();const bb=o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld);if(bb.min.x<=B.x&&bb.max.x>=B.x&&bb.min.z<=B.z&&bb.max.z>=B.z&&bb.max.x-bb.min.x<80)hits.push((o.name||'')+'|'+Object.keys(o.userData||{}).slice(0,4).join(',')+'|'+Math.round(bb.max.x-bb.min.x)+'x'+Math.round(bb.max.y-bb.min.y)+'x'+Math.round(bb.max.z-bb.min.z)+(o.isInstancedMesh?'|inst':''))})}catch(e){}ident={rh:+(B.h-groundY(B.x,B.z)).toFixed(1),meshes:hits}}
     stops.push({t:+t.toFixed(1),from:+(mxv*3.6).toFixed(0),to:+(v1*3.6).toFixed(0),x:Math.round(RO.x),z:Math.round(RO.z),src:names.length?names:[RO.terr==='water'?'water/edge':'none/terrain'],b:bl?{x:+bl.b.x.toFixed(1),z:+bl.b.z.toFixed(1),hw:+bl.b.hw.toFixed(1),hd:+bl.b.hd.toFixed(1),keys:Object.keys(bl.b).join(','),ident}:null});cool=.6;hist.length=0}}}
  K.KeyW=K.ArrowUp=K.ArrowLeft=K.ArrowRight=false;
  return{city:CID,mode:a.mode,secs:a.secs,distM:Math.round(dist),avgKmh:Math.round(km/a.secs),stops};
 })+')('+JSON.stringify(a)+')'),{secs:+SECS,mode:MODE,seed:+SEED||0});
 console.log(JSON.stringify(out));await b.close()})().catch(e=>{console.log('ERR '+e.message);process.exit(1)});
