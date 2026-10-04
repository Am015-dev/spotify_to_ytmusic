// tOC: owner bugs 2 — soft night lights (pixel test), real-scale Acropolis, height audit (0 outliers, 0 floating/buried), 0 props on drivable roads
// usage: node tOC.js [fra A B C D]   (default all) — screenshots in shots_oc/
const {ocBoot,launch,F}=require('./ocboot.js');const fs=require('fs');fs.mkdirSync('shots_oc',{recursive:true});
const SEL=process.argv.slice(2);const want=k=>!SEL.length||SEL.includes(k);let fails=0;const ok=(c,m,i)=>{console.log((c?'PASS ':'FAIL ')+m+(i!==undefined?' · '+JSON.stringify(i):''));if(!c)fails++};
// every drivable centreline, resampled every 2 m; a prop overlaps when its footprint (OC_fp) reaches the carriageway
const ROADS=`(()=>{const L=[];const add=(pts,w,src)=>{if(pts&&pts.length>1&&w>0)L.push({pts,w,src})};CITY_S.forEach(S=>add(S.pts,S.r.w,'street:'+S.r.cls));
 for(const r of hubRoads()||[])add([{x:r.x0,z:r.z0},{x:r.x0+r.ux*r.L,z:r.z0+r.uz*r.L}],r.w,'fill');for(const S of abSamples())add(S.pts,(S.r&&S.r.w)||S.w,'autobahn');
 for(const S of LZ.roads)add(S.pts,S.w,'biome');for(const T of TRAILS)add(T.pts,T.w||12,'trail');if(CID==='fra')for(const S of mtnSamples())add(S.pts,12,'taunus');return L})()`;
const SAMPLE=`(()=>{const GAME=new Set(__oc.GAME),D=HUB.ptypes,PG=HUB.pgrid,bad=[],seen=new Set();let n=0,km=0;const near=(x,z)=>{const kx=Math.floor(x/16),kz=Math.floor(z/16),o=[];for(let a=-2;a<=2;a++)for(let b=-2;b<=2;b++){const A=PG.get((kx+a)*10000+kz+b);if(A)o.push(...A)}return o};
 const hit=(p,ax,az,bx,bz,w,src)=>{if(!p.alive||GAME.has(p.t)||seen.has(p))return;const fp=__oc.fp(p.t),dx=bx-ax,dz=bz-az,l2=dx*dx+dz*dz||1e-9;let t=((p.x-ax)*dx+(p.z-az)*dz)/l2;t=t<0?0:t>1?1:t;const d=Math.hypot(ax+dx*t-p.x,az+dz*t-p.z);if(d<w/2+fp){seen.add(p);bad.push([p.t,Math.round(p.x),Math.round(p.z),src,+(d-w/2).toFixed(2)])}};
 for(const R of ${ROADS}){const P=R.pts;for(let i=1;i<P.length;i++){const a=P[i-1],b=P[i],L=Math.hypot(b.x-a.x,b.z-a.z),k=Math.max(1,Math.ceil(L/2));km+=L/1000;for(let j=0;j<k;j++){const ax=a.x+(b.x-a.x)*j/k,az=a.z+(b.z-a.z)*j/k,bx=a.x+(b.x-a.x)*(j+1)/k,bz=a.z+(b.z-a.z)*(j+1)/k;n++;for(const p of near(ax,az))hit(p,ax,az,bx,bz,R.w,R.src)}}}
 for(const J of JUNC){if(!(J.r>0))continue;for(const p of near(J.x,J.z))if(p.alive&&!GAME.has(p.t)&&!seen.has(p)&&Math.hypot(p.x-J.x,p.z-J.z)<J.r+__oc.fp(p.t)){seen.add(p);bad.push([p.t,Math.round(p.x),Math.round(p.z),'junction',0])}}
 const by={};for(const b of bad)by[b[0]]=(by[b[0]]||0)+1;return{samples:n,km:+km.toFixed(1),props:HUB.props.length,bad:bad.length,by,ex:bad.slice(0,6),fix:HUB.OC}})()`;
async function night(p,tag){await p.evaluate(()=>{__fl.mode('night');__fl.apply();__mho.roamSim(12);__fl.apply()});
 const info=await p.evaluate(()=>__oc.ev(`(()=>{const P=OC.pool,H=FL.hl;return{n:FL.n,pool:P?{count:P.count,op:+OC.poolPeak.toFixed(3),add:P.material.blending===THREE.AdditiveBlending,dw:P.material.depthWrite,vis:P.visible}:null,
   hl:H?{peak:+(H.material.color.r*Math.max(...OC_beamGeo().attributes.color.array)).toFixed(3),dw:H.material.depthWrite,add:H.material.blending===THREE.AdditiveBlending}:null}})()`));
 await p.evaluate(()=>{const s=document.createElement('style');s.id='ocHide';s.textContent='body *{visibility:hidden!important}canvas{visibility:visible!important}';document.head.appendChild(s)});
 const f=`shots_oc/night_${tag}.png`;await F.shot(p,f);await p.evaluate(()=>document.getElementById('ocHide').remove());
 const st=await p.evaluate(async b64=>{const im=new Image();im.src='data:image/png;base64,'+b64;await im.decode();const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const g=c.getContext('2d');g.drawImage(im,0,0);
   const W=im.width,H=im.height,x0=Math.round(W*.25),x1=Math.round(W*.75),y0=Math.round(H*.5),y1=Math.round(H*.95),d=g.getImageData(x0,y0,x1-x0,y1-y0).data,w=x1-x0,h=y1-y0;let white=0,flat=0,tot=w*h,bright=0;
   for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){const o=(y*w+x)*4,m=Math.min(d[o],d[o+1],d[o+2]);if(m>225){white++;const n=[o-4,o+4,o-w*4,o+w*4].every(q=>Math.abs(d[q]-d[o])<3&&Math.abs(d[q+1]-d[o+1])<3&&Math.abs(d[q+2]-d[o+2])<3);if(n)flat++}if(d[o]+d[o+1]+d[o+2]>240)bright++}
   return{white:+(white/tot*100).toFixed(3),flat:+(flat/tot*100).toFixed(3),bright:+(bright/tot*100).toFixed(2)}},fs.readFileSync(f).toString('base64'));
 ok(info.hl&&info.hl.peak<=.25&&!info.hl.dw&&info.hl.add,`${tag}: headlight beam is a faint additive gradient (peak ${info.hl&&info.hl.peak} ≤ 0.25, depthWrite off)`,info.hl);
 ok(info.pool&&info.pool.op<=.25&&!info.pool.dw&&info.pool.add&&info.pool.vis&&info.pool.count>50,`${tag}: warm lamp pools under ${info.pool&&info.pool.count} lamps (opacity ${info.pool&&info.pool.op} ≤ 0.25, additive, depthWrite off)`,info.pool);
 ok(st.flat<.3&&st.white<1.5,`${tag}: no hard white polygon in the beam region (near-white ${st.white}%, flat near-white ${st.flat}%)`,st);
 await p.evaluate(()=>{__fl.mode('day');__fl.apply()})}
async function city(b,city,d){const tag=city==='fra'?'fra':'ath'+d;const p=await ocBoot(b,city,d);
 await p.evaluate(()=>__oc.ev('(()=>{for(const L of LAZY)lzRun(L);return LAZY.length})()'));
 const a=await p.evaluate(()=>__oc.audit());for(const r of a.rows)console.log('INFO height',tag,r.cls,r.name,r.v,r.min!=null?`(storeys ${r.min}-${r.max}, n=${r.n})`:'',`range ${r.lo}-${r.hi}`,r.real?'real '+r.real:'',r.ok?'':'OUTLIER');
 ok(!a.bad.length,`${tag}: height audit — 0 outliers (${a.rows.length} rows)`,a.bad);ok(a.float===0&&a.buried===0,`${tag}: 0 objects floating > 0.3 m / buried > 1 m (riverbed piers excluded: ${a.riverbed})`,{fl:a.fl,bu:a.bu});
 const r=await p.evaluate(s=>eval(s),'__oc.ev(`'+SAMPLE.replace(/`/g,'\\`')+'`)');console.log('INFO roads',tag,JSON.stringify({samples:r.samples,km:r.km,props:r.props,by:r.by,fix:r.fix}));
 ok(r.bad===0&&r.samples>1000,`${tag}: 0 props on drivable roads (${r.samples} samples every 2 m over ${r.km} km)`,r.ex);
 if(city==='fra'||d==='A'){const P=await p.evaluate(()=>{const M=__mho,q=M.qv&&M.rsnap(M.RO.x,M.RO.z,300);return q});await p.evaluate(()=>{__mho.roamSim(60)});await night(p,tag)}
 if(city==='ath'&&d==='A')await acro(p);
 ok(!p.errs.length,`${tag}: no page errors`,p.errs.slice(0,2));await p.context().close()}
async function acro(p){const A=await p.evaluate(()=>__oc.acro());const m=await p.evaluate(()=>__oc.ev(`(()=>{const H=HILL_BY.akro,y=H.H,ext=(dx,dz)=>{let a=0,b=0;while(a<400&&groundY(H.cx+dx*(a+1),H.cz+dz*(a+1))>=y-.3)a++;while(b<400&&groundY(H.cx-dx*(b+1),H.cz-dz*(b+1))>=y-.3)b++;return a+b+1};
  const st=[];for(const S of CITY_S)for(const q of S.pts){const d=Math.hypot(q.x-H.cx,q.z-H.cz);if(d>200&&d<450)st.push(groundY(q.x,q.z))}st.sort((a,b)=>a-b);const P=OC.acro.parth;let cols=0;
  return{ew:ext(1,0),ns:ext(0,1),asl:y+TR_DATUM,above:+(y-st[st.length>>1]).toFixed(1),aboveLow:+(y-st[Math.floor(st.length*.25)]).toFixed(1),hitP:!!roamHit(P.x,P.z,1,P.yb+2),hitE:!!roamHit(OC.acro.erech.x,OC.acro.erech.z,1,OC.acro.erech.y+2)}})()`));
 const near=(v,r)=>Math.abs(v-r)/r<=.05;
 ok(near(m.ew,270)&&near(m.ns,156),`acropolis: plateau ${m.ew} x ${m.ns} m (real ~270 x 156, ±5%), ${m.asl} m a.s.l., ${m.above} m above the median street within 450 m (${m.aboveLow} m above the lower quartile)`,m);
 ok(near(A.parth.w,69.5)&&near(A.parth.d,30.9)&&A.cols===46&&A.parth.nx===17&&A.parth.ny===8,`acropolis: Parthenon stylobate ${A.parth.w} x ${A.parth.d} m, ${A.parth.ny} x ${A.parth.nx} Doric columns = ${A.cols} (real 46), apex ${A.parth.top} m above the crepidoma base`,A.parth);
 ok(m.hitP&&m.hitE&&A.erech&&A.propy&&A.nike&&A.odeon&&A.dion&&A.crane,'acropolis: Parthenon, Erechtheion, Propylaea, Athena Nike, Odeon, Theatre of Dionysus and crane built with colliders',Object.keys(A));
 const P=A.parth,cam=(pos,look)=>p.evaluate(([a,b])=>__oc.ev(`(()=>{if(!OC.rc0)OC.rc0=roamCam;roamCam=()=>{camera.position.set(${a});camera.lookAt(${b})};return 1})()`),[pos.join(','),look.join(',')]);
 for(const[n,pos,look]of[['street',[P.x-60,`groundY(${P.x-60},${P.z-195})+2.2`,P.z-195],[P.x,P.y0+8,P.z]],['aerial',[P.x+230,P.y0+150,P.z-230],[P.x-10,P.y0,P.z+10]],['summit',[P.x+95,P.y0+3.5,P.z-40],[P.x,P.y0+9,P.z]]]){await cam(pos,look);await p.evaluate(()=>__mho.roamSim(2));await F.shot(p,`shots_oc/acro_${n}.png`)}
 await p.evaluate(()=>__oc.ev('roamCam=OC.rc0'))}
(async()=>{const b=await launch();for(const k of['fra','A','B','C','D'])if(want(k))await city(b,k==='fra'?'fra':'ath',k==='fra'?null:k);console.log(fails?`FAILED ${fails}`:'ALL PASS');await b.close();process.exit(fails?1:0)})();
