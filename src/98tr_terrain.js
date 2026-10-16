// ===== terr-1 (Alex: "both cities are flat, not realistic"): terrain STATE tests (tag terrain:, no driving). Each returns one pass line.
// Roads = CITY_S streets (+ Frankfurt filler grid FILL_R and Autobahn AB) sampled every 8 m; heights = groundY (the physics/road surface).
const TRN={};
function TRN_rng(s){let a=s>>>0;return()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
function TRN_roads(){const R=[];for(const S of CITY_S)R.push({P:S.pts.map(p=>[p.x,p.z]),hw:S.r.w/2,id:S.r.id||S.r.name,cls:S.r.cls,ref:S});
  if(CID==='fra'){try{hubRoads()}catch(e){}for(const r of FILL_R||[]){const P=[],n=Math.max(1,Math.round(r.L/8));for(let i=0;i<=n;i++)P.push([r.x0+r.ux*r.L*i/n,r.z0+r.uz*r.L*i/n]);R.push({P,hw:r.w/2,id:'fill'+r.g,cls:'fill',ref:r})}
    for(const S of abSamples()){const P=S.pts.filter(p=>p.x>WX0+50&&p.x<WX1-50&&p.z>WZS+50&&p.z<WZN-50).map(p=>[p.x,p.z]);if(P.length>1)R.push({P,hw:S.r.w/4,id:S.r.k||S.r.id,cls:'ab'})}}
  return R}
// points to skip: water (bridges carry their own decks), decks, and the world rim
function TRN_skip(x,z){if(x<WX0+60||x>WX1-60||z<WZS+60||z>WZN-60)return true;if(CID==='fra'&&inRiver(x,z,-25))return true;for(const b of ALL_DECKS)if(deckAt(b,x,z)!=null)return true;return false}
// steepest 8 m step along every road
function TRN_grade(){const G=[];let worst=null;for(const r of TRN_roads()){if(r.cls==='hill')continue;  // hill trails (Lycabettus, Filopappou) climb by design
   const P=r.P;for(let i=1;i<P.length;i++){const a=P[i-1],b=P[i],d=Math.hypot(b[0]-a[0],b[1]-a[1]);if(d<4||TRN_skip(a[0],a[1])||TRN_skip(b[0],b[1]))continue;
    const g=Math.abs(groundY(b[0],b[1])-groundY(a[0],a[1]))/d;G.push(g);if(!worst||g>worst.g)worst={g,x:Math.round(a[0]),z:Math.round(a[1]),id:r.id}}}
  G.sort((a,b)=>a-b);const q=p=>+(G[Math.min(G.length-1,Math.floor(G.length*p))]*100).toFixed(1);const o={n:G.length,p50:q(.5),p99:q(.99),max:+(worst.g*100).toFixed(1),over:G.filter(g=>g>.12).length,worst};TRN.grade=o;return o}
// 50 road points: height across the full width (centre vs both edges)
function TRN_edge(n=50){const R=TRN_roads().filter(r=>r.P.length>2),rnd=TRN_rng(CID==='fra'?7:11),out=[];let t=0;
  while(out.length<n&&t++<5000){const r=R[Math.floor(rnd()*R.length)],i=1+Math.floor(rnd()*(r.P.length-2)),a=r.P[i-1],b=r.P[i+1],c=r.P[i];if(TRN_skip(c[0],c[1]))continue;
    const l=Math.hypot(b[0]-a[0],b[1]-a[1])||1,nx=-(b[1]-a[1])/l,nz=(b[0]-a[0])/l,y=groundY(c[0],c[1]),hw=Math.min(r.hw,8);if(TRN_skip(c[0]+nx*hw,c[1]+nz*hw)||TRN_skip(c[0]-nx*hw,c[1]-nz*hw))continue;
    // intersections: across one road is along the other (its grade), not a cross-fall; terr-4: also junction mouths (centre within one
    // half-width of a terr-2 junction pad / disc / filler square: the pad plane carries the cross street's grade, blended over 20 m)
    if(typeof TJ_inJunc==='function'&&TJ_inJunc(c[0],c[1],hw))continue;
    if([1,-1].some(sd=>{const x=c[0]+nx*hw*sd,z=c[1]+nz*hw*sd,q=cityAt(x,z);if(q&&q.S!==r.ref&&q.d<q.S.r.w/2+2)return true;try{const f=fillAt(x,z,r.ref);if(f&&f.d<f.r.w/2+2)return true}catch(e){}return false}))continue;
    const d=Math.max(Math.abs(groundY(c[0]+nx*hw,c[1]+nz*hw)-y),Math.abs(groundY(c[0]-nx*hw,c[1]-nz*hw)-y));out.push({d,x:Math.round(c[0]),z:Math.round(c[1]),id:r.id})}
  out.sort((a,b)=>b.d-a.d);const o={n:out.length,max:+out[0].d.toFixed(2),worst:out[0],over:out.filter(q=>q.d>.3).length};TRN.edge=o;return o}
// deck (bridge / ramp) ends: deck surface vs the ground just past the joint
function TRN_ramp(){let mx=0,w=null,n=0;for(const b of ALL_DECKS){for(const s of[-1,1]){const a=s*b.half,y=deckY(b,a);if(y==null)continue;const[x,z]=deckPt(b,s*(b.half+.6));if(CID==='fra'&&inRiver(x,z))continue;n++;
    const d=Math.abs(y-groundY(x,z));if(d>mx){mx=d;w={id:b.id,x:Math.round(x),z:Math.round(z)}}}}const o={n,max:+mx.toFixed(2),worst:w};TRN.ramp=o;return o}
// buildings: the lowest point of the body/plinth vs the lowest ground under its footprint (9 points)
function TRN_base(){let n=0,bad=0,mx=0,w=null;for(const b of HUB.bld||[]){if(b.hw==null||b.trMin==null)continue;n++;const g=b.trMin,bot=b.trBot??g,gap=bot-g;if(gap>.05){bad++;if(gap>mx){mx=gap;w={x:Math.round(b.x),z:Math.round(b.z)}}}}
  const o={n,bad,max:+mx.toFixed(2),worst:w};TRN.base=o;return o}
// relief: summit (highest ground within 150 m of the hill) above the lowest ground 400-1000 m around it
function TRN_relief(cx,cz){let top=-1e9,tx=cx,tz=cz;for(let x=-400;x<=400;x+=10)for(let z=-400;z<=400;z+=10){const y=groundY(cx+x,cz+z);if(y>top){top=y;tx=cx+x;tz=cz+z}}
  const Y=[];for(let a=0;a<48;a++)for(let r=400;r<=1000;r+=50){const t=a/48*6.283,x=tx+Math.cos(t)*r,z=tz+Math.sin(t)*r;if(CID==='fra'&&inRiver(x,z,-30))continue;Y.push(groundY(x,z))}Y.sort((a,b)=>a-b);const lo=Y[Math.floor(Y.length*.1)];return{top:+top.toFixed(1),lo:+lo.toFixed(1),relief:+(top-lo).toFixed(1),x:Math.round(tx),z:Math.round(tz)}}
const TRN_MUEHL=[-1350,-1400];
function TRN_hill(which){const H=which==='lyka'?(typeof HILL_BY!=='undefined'&&HILL_BY.lyka?[HILL_BY.lyka.cx,HILL_BY.lyka.cz]:[298,-1107]):TRN_MUEHL,R=TRN_relief(H[0],H[1]);TRN[which]=R;
  // look at it from a street 300-700 m away
  for(let k=0;k<24;k++){const t=k/24*6.283,d=420+(k%3)*120,q=rfSnap(R.x+Math.cos(t)*d,R.z+Math.sin(t)*d,60);if(q&&!TRN_skip(q[0],q[1])){roamWarp(q[0],q[1],Math.atan2(R.x-q[0],R.z-q[1]));RO.v=0;break}}
  const need=which==='lyka'?150:TRN_NEED_MUEHL,ok=R.relief>=need;return'📍 '+(which==='lyka'?'LYCABETTUS':'MÜHLBERG')+' · summit '+R.top+' m, valley '+R.lo+' m → relief '+R.relief+' m (need ≥'+need+')'+(ok?' ✅':' ❌')}
const TRN_NEED_MUEHL=100;
// tyre gap at 5 road spawns (async: settles 1.5 s at each)
function TRN_gapNow(){if(!pl||!pl.mesh)return null;const T=THREE,m4=new T.Matrix4(),v=new T.Vector3();let low=1e9;pl.mesh.updateMatrixWorld(true);const ud=pl.mesh.userData;if(!ud.m)return null;
  ud.m.traverseVisible(o=>{if(!o.isMesh||!o.geometry||(o.material&&(o.material.transparent||o.material.blending===T.AdditiveBlending)))return;if(o.isInstancedMesh){o.getMatrixAt(0,m4);m4.premultiply(o.matrixWorld)}else m4.copy(o.matrixWorld);
    const p=o.geometry.attributes.position;for(let i=0;i<p.count;i+=3){v.fromBufferAttribute(p,i).applyMatrix4(m4);if(Math.hypot(v.x-RO.x,v.z-RO.z)<3.2&&v.y<RO.y+.7){const c=v.y-groundAt(v.x,v.z,v.y+1);if(c<low)low=c}}});return low<1e8?low:null}
function TRN_tyre(say){if(TRN.tyRun)return'📍 TYRE GAP running…';TRN.tyRun=1;const R=TRN_roads().filter(r=>r.cls!=='ab'&&r.P.length>4),rnd=TRN_rng(CID==='fra'?3:5),S=[];
  for(let t=0;S.length<5&&t<500;t++){const r=R[Math.floor(rnd()*R.length)],i=2+Math.floor(rnd()*(r.P.length-4)),c=r.P[i],b=r.P[i+1];if(!TRN_skip(c[0],c[1]))S.push([c[0],c[1],Math.atan2(b[0]-c[0],b[1]-c[1])])}
  const G=[];const step=k=>{if(k>=S.length){TRN.tyRun=0;const m=Math.max(...G.map(g=>Math.abs(g??9)));TRN.tyre={gaps:G.map(g=>g==null?null:+g.toFixed(3)),max:+m.toFixed(3)};
      say('📍 TYRE GAP · 5 road spawns · gaps '+G.map(g=>g==null?'?':g.toFixed(2)).join(' / ')+' m · max '+m.toFixed(3)+' (need ≤0.05)'+(m<=.05?' ✅':' ❌'));return}
    roamWarp(S[k][0],S[k][1],S[k][2]);RO.v=0;setTimeout(()=>{const g=TRN_gapNow();if(g==null&&!S[k].re){S[k].re=1;step(k);return}G.push(g);step(k+1)},1300)};step(0);return'📍 TYRE GAP · checking 5 road spawns…'}
// draw load at 3 fixed views (same spots every run); fps is shown, the pass line is triangles/calls ≤ +5% of the pre-terrain build
const TRN_VIEWS={fra:[[200,354,0],[-1100,-1200,3.6],[2121,150,1.6]],ath:[[0,0,0],[300,-700,3.1],[-600,300,1.2]]};
const TRN_LOAD0={fra:null,ath:null};
function TRN_fps(say){if(TRN.fpRun)return'📍 FPS VIEWS running…';TRN.fpRun=1;const V=TRN_VIEWS[CID==='fra'?'fra':'ath'],out=[];
  const step=k=>{if(k>=V.length){TRN.fpRun=0;TRN.fps=out;const L0=TRN_LOAD0[CID==='fra'?'fra':'ath'];let ok=true;if(L0)for(let i=0;i<out.length;i++)if(out[i].tris>L0[i].tris*1.05||out[i].calls>L0[i].calls*1.05)ok=false;
      say('📍 FPS VIEWS · '+(out.every(o=>!o.calls)?'(page not drawing: draw=0 test mode) · ':'')+out.map(o=>o.fps+' fps / '+Math.round(o.tris/1000)+'k tris / '+o.calls+' calls').join(' · ')+(L0?ok?' · load ≤ +5% ✅':' · load > +5% ❌':' · (no baseline) ✅'));return}
    const q=rfSnap(V[k][0],V[k][1],200)||V[k];roamWarp(q[0],q[1],V[k][2]);RO.v=0;setTimeout(()=>{let n=0,t0=performance.now(),tr=0,ca=0;const I=renderer.info,ar=I.autoReset;I.autoReset=false;I.reset();const f=()=>{n++;tr=Math.max(tr,I.render.triangles);ca=Math.max(ca,I.render.calls);I.reset();if(performance.now()-t0>=1200)I.autoReset=ar;
      if(performance.now()-t0<1200)requestAnimationFrame(f);else{out.push({fps:Math.round(n*1000/(performance.now()-t0)),tris:tr,calls:ca});step(k+1)}};requestAnimationFrame(f)},1100)};step(0);return'📍 FPS VIEWS · measuring 3 views…'}
function TRN_go(kind,say){if(!TERR.on)return'📍 PENDING · terr-1 hills are OFF in this build (add ?terr=1 to try them)';try{
  if(kind==='lyka'||kind==='muehl')return TRN_hill(kind);
  if(kind==='grade'){const o=TRN_grade();return'📍 ROAD GRADE · '+o.n+' road steps of 8 m · p50 '+o.p50+'% p99 '+o.p99+'% max '+o.max+'% at '+o.worst.id+' ('+o.worst.x+','+o.worst.z+') (need ≤12%)'+(o.max<=12?' ✅':' ❌')}
  if(kind==='edge'){const o=TRN_edge();return'📍 ROAD FLAT ACROSS · 50 road points · max centre-to-edge drop '+o.max+' m at '+o.worst.id+' ('+o.worst.x+','+o.worst.z+') (need ≤0.3)'+(o.max<=.3?' ✅':' ❌')}
  if(kind==='ramp'){const o=TRN_ramp();return'📍 RAMP JOINTS · '+o.n+' deck ends · max step '+o.max+' m'+(o.worst?' at '+o.worst.id:'')+' (need <0.1)'+(o.max<.1?' ✅':' ❌')}
  if(kind==='base'){const o=TRN_base();return'📍 BUILDING BASES · '+o.n+' buildings · '+o.bad+' float above the ground (max '+o.max+' m) (need 0)'+(o.bad?' ❌':' ✅')}
  if(kind==='flush'){const o=TRN_flush(),j=TRN_junc(),ok=!o.buried&&!o.float&&j.max<=.1;return'📍 ROAD PIECES FLUSH · '+o.n+' thin road pieces: '+o.buried+' sunk, '+o.float+' floating (need 0'+(o.ex[0]?', e.g. ('+o.ex[0][0]+','+o.ex[0][1]+')':'')+') · '+j.n+' junctions planar within '+j.max+' m'+(j.worst?' (worst '+j.worst.join(',')+')':'')+' (need ≤0.1)'+(ok?' ✅':' ❌')}
  if(kind==='tyre')return TRN_tyre(say);if(kind==='fps')return TRN_fps(say)}catch(e){return'📍 terrain test error '+e.message+' ❌'}}
// terr-3: slipway tops meet the bank (3 of 4 Frankfurt slipways ended in a +4.7..+15 m cliff): the ramp mesh's top edge (3 points across) vs the
// ground 0.6 m inland, and the drive surface (roamTerr) step across the top edge; info: ramp grade. Athens has no slipways (no river) → n 0.
function TRN_slip(){const S=typeof SLIPS!=='undefined'?SLIPS:[],o={n:S.length,max:0,worst:null,L:[]};for(const s of S){const yT=s.yT??0;let gap=0;
  for(const c of[-8,0,8]){const x=s.x+s.tx*c,z=s.z+s.tz*c;gap=Math.max(gap,Math.abs(yT-groundY(x-s.ix*.6,z-s.iz*.6)),Math.abs(roamTerr(x+s.ix*.3,z+s.iz*.3,99).g-roamTerr(x-s.ix*.3,z-s.iz*.3,99).g))}
  const r={x:Math.round(s.x),z:Math.round(s.z),top:+yT.toFixed(2),gap:+gap.toFixed(3),grade:Math.round((yT-HWY)/30*100)};o.L.push(r);if(gap>=o.max){o.max=+gap.toFixed(3);o.worst=r;o.s=s}}return o}
function TRN_slipGo(){const o=TRN_slip();if(!o.n)return'📍 SLIPWAYS · '+CID+': no slipways here (no river) ✅';const s=o.s;roamWarp(s.x+s.ix*8,s.z+s.iz*8,Math.atan2(-s.ix,-s.iz));RO.v=0;
  return'📍 SLIPWAY TOPS · '+o.n+' slipways · top-to-bank gap '+o.L.map(r=>r.gap+' m ('+r.x+','+r.z+' top '+r.top+' m, '+r.grade+'%)').join(' · ')+' · worst '+o.max+' m (need ≤0.1; you stand on it, facing the bank)'+(o.max<=.1?' ✅':' ❌')}
window.__trn={TRN,go:TRN_go,slip:TRN_slip,grade:TRN_grade,edge:TRN_edge,ramp:TRN_ramp,base:TRN_base,relief:TRN_relief,roads:TRN_roads,gap:TRN_gapNow};
// slope colours on the open land (outer ground heightfields with a col callback): grass → dry grass (15-30 %) → dirt (30-55 %) → rock (>55 %);
// Athens also dries out with height (macchia above ~120 m)
const TRN_C={dry:new THREE.Color(CID==='fra'?'#b3a85e':'#c2ae72'),dirt:new THREE.Color('#9a7a52'),rock:new THREE.Color('#8e8a82')};
function TRN_slopeCol(c,x,z){if(!c||!c.isColor)return c;let s=0,h=0;try{h=groundY(x,z);const a=groundY(x+5,z)-h,b=groundY(x,z+5)-h;s=Math.hypot(a,b)/5}catch(e){return c}
  const ss=(a,b,v)=>{const t=clamp((v-a)/(b-a),0,1);return t*t*(3-2*t)};let d=ss(.12,.3,s)*.55;if(CID!=='fra')d=Math.max(d,ss(110,220,h)*.45);if(d>0)c.lerp(TRN_C.dry,d);const r=ss(.3,.55,s);if(r>0)c.lerp(TRN_C.dirt,r*.7);const k=ss(.55,.9,s);if(k>0)c.lerp(TRN_C.rock,k*.8);return c}
if(TERR.on&&new URLSearchParams(location.search).get('trc')!=='0'){const _g=gndBuild;gndBuild=(grp,x0,x1,z0,z1,o)=>{if(o&&o.col&&!o.trc){const c0=o.col;o={...o,trc:1,col:(x,z)=>TRN_slopeCol(c0(x,z),x,z)}}
  // in-city ground (pavement + grass classes, no colours): the grass material gets a slope tint (white = untinted texture; walk/rock ignore colours)
  else if(o&&o.mats&&o.mats.g&&!o.col&&!o.trc){const W=new THREE.Color(),g=o.mats.g.clone();g.vertexColors=true;o={...o,trc:1,mats:{...o.mats,g},col:(x,z)=>TRNinner(W.setRGB(1,1,1),x,z)}}return _g(grp,x0,x1,z0,z1,o)}}
function TRNinner(c,x,z){TRN_slopeCol(c,x,z);return c}
// flush test (Alex b27: kerb/edge bands across the asphalt at a junction): every thin piece added to the city batch (bbox height < 0.6 m:
// asphalt, crossing squares, kerbs, lines) is compared with the ground under its vertices; floating = lowest vertex > 0.12 m above,
// buried = highest vertex below the ground (structures > 1.5 m above/below, truss bars, underground pieces, are not decals; footbridge stairs/landings follow their deck). Recorded at build time (the batched meshes free their arrays later).
const TRN_FL={n:0,float:[],buried:[],tilt:[]};
if(typeof TBatch!=='undefined'){const _add=TBatch.prototype.add;TBatch.prototype.add=function(g,mat,matrix){try{if((TERR.on||/trflush/.test(location.search))&&g&&g.attributes&&g.attributes.position){if(matrix){g.applyMatrix4(matrix);matrix=null}g.computeBoundingBox();const b=g.boundingBox;
    if(b.max.y-b.min.y<.6&&b.max.x-b.min.x<400&&b.max.z-b.min.z<400&&b.max.x-b.min.x+b.max.z-b.min.z>1.5){const cx=(b.min.x+b.max.x)/2,cz=(b.min.z+b.max.z)/2;if(BRIDGES.some(B=>B.kind==='foot'&&Math.hypot(cx-B.cx,cz-B.cz)<B.half+20)){}else{const p=g.attributes.position,st=Math.max(1,Math.floor(p.count/64));let lo=1e9,hi=-1e9,wx=0,wz=0;
      for(let i=0;i<p.count;i+=st){const x=p.getX(i),z=p.getZ(i);if(CID==='fra'&&inRiver(x,z,-2))continue;let gd=groundY(x,z);for(const D of ALL_DECKS){const h=deckAt(D,x,z);if(h!=null)gd=Math.max(gd,h)}const d=p.getY(i)-gd;if(d<lo){lo=d;wx=x;wz=z}if(d>hi)hi=d}
      if(lo<1e8){TRN_FL.n++;const e=[Math.round(wx),Math.round(wz),+lo.toFixed(2),+hi.toFixed(2),(mat&&mat.color?mat.color.getHexString():'')+(mat&&mat.map?'T':'')];if(lo>.12&&lo<1.5){TRN_FL.float.push(e);if(/trdbg/.test(location.search))e.push(new Error().stack.split('\n').slice(2,9).join(' | '),[b.min.x,b.min.y,b.min.z,b.max.x,b.max.y,b.max.z].map(v=>+v.toFixed(2)))}else if(hi<-.02&&hi>-1.5)TRN_FL.buried.push(e)}}}}}catch(e){}return _add.call(this,g,mat,matrix)}}
function TRN_flush(){const F=TRN_FL;TRN.flush={n:F.n,float:F.float.length,buried:F.buried.length,ex:F.float.slice(0,3).concat(F.buried.slice(0,3))};return TRN.flush}
// junction planarity: ground under every street junction (JUNC, radius r) and filler crossing (FILL_X) vs its best-fit plane, ≤ 0.1 m
function TRN_junc(){const L=[];for(const J of (typeof JUNC!=='undefined'?JUNC:[]))L.push([J.x,J.z,Math.max(4,J.r||6)]);if(CID==='fra')for(const X of FILL_X||[])L.push([X.x,X.z,Math.max(X.wa,X.wb)/2]);let mx=0,w=null,n=0;
  for(const[x0,z0,R]of L){if(TRN_skip(x0,z0))continue;const P=[];for(let a=-2;a<=2;a++)for(let b=-2;b<=2;b++){const x=x0+a*R/2,z=z0+b*R/2;if(Math.hypot(x-x0,z-z0)>R*1.01)continue;P.push([x-x0,z-z0,groundY(x,z)])}if(P.length<5)continue;n++;
    // least squares plane y = c + gx·x + gz·z
    let sx=0,sz=0,sy=0,sxx=0,szz=0,sxz=0,sxy=0,szy=0;const m=P.length;for(const[x,z,y]of P){sx+=x;sz+=z;sy+=y;sxx+=x*x;szz+=z*z;sxz+=x*z;sxy+=x*y;szy+=z*y}
    const A=[[m,sx,sz],[sx,sxx,sxz],[sz,sxz,szz]],B=[sy,sxy,szy],det=M=>M[0][0]*(M[1][1]*M[2][2]-M[1][2]*M[2][1])-M[0][1]*(M[1][0]*M[2][2]-M[1][2]*M[2][0])+M[0][2]*(M[1][0]*M[2][1]-M[1][1]*M[2][0]),D=det(A);if(Math.abs(D)<1e-9)continue;
    const sol=[0,1,2].map(k=>det(A.map((r,i)=>r.map((v,j)=>j===k?B[i]:v)))/D);let e=0;for(const[x,z,y]of P)e=Math.max(e,Math.abs(y-(sol[0]+sol[1]*x+sol[2]*z)));if(e>mx){mx=e;w=[Math.round(x0),Math.round(z0)]}}
  const o={n,max:+mx.toFixed(3),worst:w};TRN.junc=o;return o}
// terr-4 (Alex: "hills from more streets"): 50 street spots per city, eye 1.5 m over the road, 16 headings. Each ray marches the ground
// 150 m .. TRN_VD (1500 m = the 'min' quality far plane: what every phone draws) and the building colliders (HUB.grid, top y = b.h) on the way;
// a heading SEES A HILL when some ground point rises >= 20 m and > 1.5 deg above the eye, above every building / nearer ground in front of it
// (a street climbing 6-10 m ahead is a slope, not a hill).
const TRN_VD=1500,TRN_VA=1.5,TRN_VH=20;
function TRN_ray(x0,z0,ey,a,tA,vh=TRN_VH,mg=0){const ux=Math.sin(a),uz=Math.cos(a);let occ=-1e9;const B=new Set();
  for(let d=5;d<=TRN_VD;d+=d<300?5:10){const x=x0+ux*d,z=z0+uz*d,L=HUB.grid&&HUB.grid.get(Math.floor(x/40)*10000+Math.floor(z/40));
    if(L)for(const b of L){if(B.has(b)||!b.h)continue;if(bHit(b,x,z,0)){B.add(b);occ=Math.max(occ,(b.h-ey)/d)}}
    const gy=groundY(x,z),g=(gy-ey)/d;if(d>=150&&g>tA&&gy-ey>=vh&&g>occ+mg)return d;occ=Math.max(occ,g)}
  // nothing on the ground: the backdrop ridge (Athens, terr-4 placement: stands on the ground under the eye, apparent height y/2300) if it clears everything
  const T=TR_H4.on?TRN_ridgeTop():null;if(T){const deg=((Math.round(a*57.296)%360)+360)%360,y=T[deg];if(y>-1e8){const g=(y-1.5)/TRN_RD;if(g>tA&&g>occ+mg)return TRN_RD}}return 0}
// the pass metric is the DRIVING view: the road direction (both ways) +-30 deg (5 rays each), what the chase camera shows; 16 headings = info
function TRN_view(n=100,seed,opt={}){const va=opt.va??TRN_VA,vh=opt.vh??TRN_VH,mg=Math.tan((opt.mg??0)*Math.PI/180);const R=TRN_roads().filter(r=>r.cls!=='ab'&&r.cls!=='hill'&&r.P.length>2),rnd=TRN_rng(seed??(CID==='fra'?21:23)),S=[];
  for(let t=0;S.length<n&&t<5000;t++){const r=R[Math.floor(rnd()*R.length)],i=1+Math.floor(rnd()*(r.P.length-2)),c=r.P[i],e=r.P[i+1];if(!TRN_skip(c[0],c[1])&&c[0]>HX0&&c[0]<HX1&&c[1]>HZS&&c[1]<HZN)S.push([c[0],c[1],Math.atan2(e[0]-c[0],e[1]-c[1])])}
  const tA=Math.tan(va*Math.PI/180),out=[];
  for(const[x0,z0,h0]of S){const ey=groundY(x0,z0)+1.5;let hits=0,fwd=null;
    for(let k=0;k<16;k++)if(TRN_ray(x0,z0,ey,k/16*6.283,tA,vh,mg))hits++;
    for(const s of[0,Math.PI])for(const da of[0,-.26,.26,-.52,.52]){const a=h0+s+da,d=TRN_ray(x0,z0,ey,a,tA,vh,mg);if(d&&(!fwd||d<fwd.d))fwd={d,a}}
    out.push({x:Math.round(x0),z:Math.round(z0),hits,fwd})}
  const sees=out.filter(o=>o.fwd).length,all=out.filter(o=>o.hits).length,o={n:out.length,sees,pct:Math.round(sees/out.length*100),all:Math.round(all/out.length*100),dirs:+(out.reduce((s,o)=>s+o.hits,0)/out.length).toFixed(1),L:out};TRN[opt.key||'view']=o;return o}
const TRN_NEED_VIEW={fra:75,ath:45};  // terr-3 build (?trh=0): fra 64 %, ath 14 % (FAIL); terr-4: fra 77, ath 53 (seeds 5-7: 80-84, 56-62)
function TRN_viewGo(){if(!TERR.on)return'📍 PENDING · terrain is OFF in this build';const o=TRN_view(),need=TRN_NEED_VIEW[CID==='fra'?'fra':'ath'],ok=o.pct>=need;
  const s=o.L.filter(q=>q.fwd).sort((a,b)=>a.fwd.d-b.fwd.d)[0];if(s){roamWarp(s.x,s.z,s.fwd.a);RO.v=0}
  return'📍 HILLS FROM STREETS · '+o.n+' street spots, 16 headings, ≤'+TRN_VD+' m: '+o.sees+' see a hill ahead or behind along the road (≥'+TRN_VH+' m up, >'+TRN_VA+'°, over the buildings, ±30°): '+o.pct+'% (need ≥'+need+'%) · all-round '+o.all+'%, avg '+o.dirs+'/16 headings'+(s?' · you face one ('+s.fwd.d+' m)':'')+(ok?' ✅':' ❌')}
window.__trn.view=TRN_view;
// terr-4: Athens backdrop mountains (athRidge, a ring 2300 m around the camera) were clipped on low/min quality (far plane 2000/1500 m, phones)
// and stood on y 0, so from the higher streets (ground 100-250 m) they sank below the eye. Now the ring is scaled about the camera to fit
// inside the far plane (same apparent size) and stands on the ground under the camera (apparent angles as seen from the street). ?trh=0 = old.
const TRN_RD=2300;
function TRN_ridgeFit(){if(!HUB.ridge&&CID==='fra'&&TRN_TAU&&HUB.grp){HUB.ridge=TRN_fraRidge();HUB.grp.add(HUB.ridge);TRN.rt=undefined}const R=HUB.ridge;if(!R||!TR_H4.on)return;if(TRN_RX!==1&&!R.userData.rc)TRN_athRecolor(R);const c=camera.position,s=Math.min(1,camera.far*.9/TRN_RD),g=groundY(c.x,c.z);R.scale.set(s,s*TRN_RX,s);R.position.set(c.x,c.y-s*(c.y-g),c.z)}
if(typeof hubTrafficStep==='function')hubTrafficStep=(f=>function(dt){const r=f.apply(this,arguments);TRN_ridgeFit();return r})(hubTrafficStep);
// apparent top of the ridge per whole degree of bearing (deg, 0 = +z, clockwise like atan2(x,z)), from the mesh's own vertices; null = no ridge there
function TRN_ridgeTop(){if(TRN.rt!==undefined)return TRN.rt;const R=HUB.ridge;TRN.rt=null;if(!R)return null;const T=new Float32Array(360).fill(-1e9);
  R.traverse(o=>{if(!o.isMesh||!o.userData.ridge)return;const p=o.geometry.attributes.position;for(let i=0;i+2<p.count;i+=3){const P=[0,1,2].map(k=>[p.getX(i+k),p.getY(i+k),p.getZ(i+k)]);
    // each triangle: fill its bearing span with the linear top edge (vertices with y > -40 are on the ridge line)
    const top=P.filter(v=>v[1]>-39);if(top.length<2)continue;const[a,b]=top,ba=Math.atan2(a[0],a[2])*57.3,bb=Math.atan2(b[0],b[2])*57.3;let d=bb-ba;if(d>180)d-=360;if(d<-180)d+=360;
    const n=Math.max(1,Math.ceil(Math.abs(d)));for(let k=0;k<=n;k++){const t=k/n,deg=((Math.round(ba+d*t)%360)+360)%360,y=(a[1]+(b[1]-a[1])*t)*TRN_RX;if(y>T[deg])T[deg]=y}}});TRN.rt=T;return T}
// terr-5: city ground on a mound crown is grass (per quadtree quad), so the crowns read as green hills over the pavement
if(typeof gndBuild==='function')gndBuild=(f=>function(grp,x0,x1,z0,z1,o){const out=f(grp,x0,x1,z0,z1,o&&o.mats&&o.mats.g&&o.mats.w&&TR_GT.on?{...o,qcls:(x,z,k)=>k==='w'&&TR_onCrown(x,z)?'g':k}:o);return out})(gndBuild);
// terr-5 (Alex must SEE hills; terr-4 lead 2): the Frankfurt Taunus backdrop, built like athRidge (ring TRN_RD around the camera, fitted
// into the far plane by TRN_ridgeFit). Real bearings from the Römer: Großer Feldberg 310°, Altkönig 308°, Hohe Wurzel (Wiesbaden) 277°,
// Winterstein 355°; real apparent heights are 1-2°, too small on a phone (and under the city's own hills, 3-4°), so x6.6 (Feldberg 14°, ?taux=<k> tunes). Two layers: blue-hazed main ridge, green
// Vortaunus foothills in front. Tops are stepped in brick-like terraces (LEGO look). ?tau=0 = no backdrop.
// terr-5: the Athens backdrop (Ymittos 6.2°, Parnitha 3.8°...) stood only 1-3° over the city roofs: x1.6 in height (?athx=<k>)
const TRN_RX=CID==='fra'?1:+(new URLSearchParams(location.search).get('athx')||1.6);
// ...and its pre-hazed violet/beige vertex colours matched the pale horizon sky (invisible in shots even where the test counted it):
// slate blue at the ridge line, grey-blue at the foot
function TRN_athRecolor(R){R.userData.rc=1;const top=new THREE.Color('#4f5d80'),low=new THREE.Color('#8a90a2');R.traverse(o=>{if(!o.isMesh||!o.userData.ridge)return;const p=o.geometry.attributes.position,c=o.geometry.attributes.color;if(!c)return;
  for(let i=0;i<p.count;i++){const C=p.getY(i)>-39?top:low;c.setXYZ(i,C.r,C.g,C.b)}c.needsUpdate=true})}
const TRN_TAUX=+(new URLSearchParams(location.search).get('taux')||2.2),TRN_TAU=(()=>{try{return TR_H4.on&&new URLSearchParams(location.search).get('tau')!=='0'}catch(e){return false}})();
function TRN_fraRidge(){const g0=new THREE.Group(),r=mul(5150),pos=[],col=[],c=new THREE.Color(),c2=new THREE.Color(),Q=TRN_RD*Math.tan(.3*Math.PI/180);
  const L=[{D:TRN_RD,top:'#3e7468',low:'#86a99a',k:[[256,0],[263,1.5],[272,2.3],[281,2.8],[292,3.5],[301,4.5],[307,5.8],[310,6.4],[314,5.4],[323,4.4],[333,4.9],[342,3.9],[351,3.3],[360,2.4],[368,1.4],[374,0]]},
    {D:TRN_RD*.96,top:'#3f8a3a',low:'#7cab6c',k:[[270,0],[279,1.2],[291,2],[301,2.7],[311,2.3],[321,3],[332,2.3],[342,1.7],[353,0]]}];
  for(const Y of L){const K=Y.k,top=new THREE.Color(Y.top),low=new THREE.Color(Y.low),at=b=>{for(let i=1;i<K.length;i++)if(b<=K[i][0]){const t=(b-K[i-1][0])/(K[i][0]-K[i-1][0]);return K[i-1][1]+(K[i][1]-K[i-1][1])*t}return 0};
    for(let b=K[0][0],n=0;b<K[K.length-1][0];b+=1.5,n++){const deg=at(b+.75)*TRN_TAUX;if(deg<=.05)continue;const h=Math.max(Q,Math.round(Y.D*Math.tan(deg*Math.PI/180)*(.9+r()*.2)/Q)*Q),a0=b*Math.PI/180,a1=(b+1.5)*Math.PI/180;
      const p=[-Math.sin(a0)*Y.D,Math.cos(a0)*Y.D],q=[-Math.sin(a1)*Y.D,Math.cos(a1)*Y.D],k=n%2?.93:1;c2.copy(low).lerp(top,.85).multiplyScalar(k);
      for(const w of[[p[0],-40,p[1],0],[q[0],-40,q[1],0],[q[0],h,q[1],1],[p[0],-40,p[1],0],[q[0],h,q[1],1],[p[0],h,p[1],1]]){pos.push(w[0],w[1],w[2]);c.copy(w[3]?c2:low);col.push(c.r,c.g,c.b)}}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
  const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({vertexColors:true,fog:false,side:THREE.DoubleSide}));m.frustumCulled=false;m.renderOrder=-1;m.userData.ridge=1;g0.add(m);g0.userData.tau=1;return g0}
// terr-5 STRICT skyline test (Alex must SEE hills; terr-4 lead 3): same 100 street spots and driving view, but a hill counts only when its
// silhouette clears the buildings and nearer ground by >= 1° (a band ~6 px tall on a phone) and stands >= 3° and >= 40 m above the eye
// (or the backdrop ridge clears them by 1°). terr-4's test passed on a 0.01° sliver. GO terr5/terrain-sky-fra/-ath.
const TRN_SKY={va:3,vh:40,mg:1,key:'sky'},TRN_NEED_SKY={fra:80,ath:55};
function TRN_skyGo(){if(!TERR.on)return'📍 PENDING · terrain is OFF in this build';const o=TRN_view(100,undefined,TRN_SKY),need=TRN_NEED_SKY[CID==='fra'?'fra':'ath'],ok=o.pct>=need;
  const s=o.L.filter(q=>q.fwd).sort((a,b)=>b.fwd.d-a.fwd.d)[0];if(s){roamWarp(s.x,s.z,s.fwd.a);RO.v=0}
  return'📍 HILL SKYLINE · '+o.n+' street spots: '+o.sees+' see a hill or the backdrop ridge along the road (±30°) standing ≥'+TRN_SKY.va+'° and ≥'+TRN_SKY.vh+' m above the eye AND ≥'+TRN_SKY.mg+'° clear above every building in front: '+o.pct+'% (need ≥'+need+'%) · all-round '+o.all+'%'+(s?' · you face one ('+s.fwd.d+' m)':'')+(ok?' ✅':' ❌')}
window.__trn.sky=()=>TRN_view(100,undefined,TRN_SKY);
// terr-5 GO terrain-crown-fra: buildings (HUB.bld colliders) whose centre or corners lie on a crown = 0; ground class under 200 crown samples
// = grass; park blocks exist. Parks you on a street crossing the biggest crown.
function TRN_crownGo(){if(!TR_GT.on)return'📍 PENDING · green crowns are OFF (?tgt=0)';let onC=0;for(const b of HUB.bld||[]){if(b.y0||!b.h)continue;const hw=b.hw||0,hd=b.hd||0;if([[0,0],[hw,hd],[-hw,hd],[hw,-hd],[-hw,-hd]].some(([a,c])=>TR_onCrown(b.x+a*.8,b.z+c*.8)))onC++}
  const rnd=TRN_rng(31),P=[];for(let t=0;P.length<200&&t<20000;t++){const x=HX0+rnd()*(HX1-HX0),z=HZS+rnd()*(HZN-HZS);if(TR_onCrown(x,z))P.push([x,z])}
  let grass=0,road=0;for(const[x,z]of P){const q=cityAt(x,z);let f=null;try{f=fillAt(x,z)}catch(e){}if((q&&q.d<q.road.w/2+3)||(f&&f.d<f.r.w/2+3)){road++;continue}if(TRN_gmat(x,z)==='g')grass++}
  const parks=ZONES.filter(Z=>Z.t==='grass'&&TR_onCrown((Z.x0+Z.x1)/2,(Z.z0+Z.z1)/2)).length,n=P.length-road,ok=onC===0&&n>0&&grass>=n*.95&&parks>0;
  const S=TRN_roads().filter(r=>r.cls!=='ab'&&r.P.length>2);let best=null;for(const r of S)for(let i=1;i<r.P.length-1;i+=2){const c=r.P[i];if(!TR_onCrown(c[0],c[1]))continue;const e=r.P[i+1],m=TR_crown(c[0],c[1]);if(!best||m>best.m)best={x:c[0],z:c[1],a:Math.atan2(e[0]-c[0],e[1]-c[1]),m}}if(best){roamWarp(best.x,best.z,best.a);RO.v=0}
  return'📍 GREEN CROWNS · buildings on a crown: '+onC+' (need 0) · crown ground off the roads: '+grass+'/'+n+' grass (need ≥95 %) · park blocks on crowns: '+parks+(ok?' ✅':' ❌')}
// the city ground mesh actually drawn under a point (ray down onto gndBuild meshes, userData.trG): 'g' = grass texture, 'w' = other
const TRN_RC=new THREE.Raycaster();
function TRN_gmat(x,z){const G=TRN.gm||(TRN.gm=(()=>{const o=[];HUB.grp.traverse(m=>{if(m.isMesh&&m.userData.trG)o.push(m)});return o})());TRN_RC.set(new THREE.Vector3(x,3000,z),new THREE.Vector3(0,-1,0));TRN_RC.far=4000;
  const h=TRN_RC.intersectObjects(G,false)[0];if(!h)return null;const M=h.object.material,mm=Array.isArray(M)?M[0]:M;return h.object.userData.gk==='g'?'g':'w'}
// ---------- terr-6 (Alex b60: car sunk to the roof on grass, deep bowl near the Battle Arena). State asserts, no pictures.
// gap: 200 random off-road terrain points in the hub, ray onto the drawn ground (trG meshes) vs groundY (= what the car drives on); grass above
//   groundY = a sunk car / sunk props. Need ≤ 0.05 m. slope: the steepest terrain 6-25 m beside the roads (info + the spot the pit test uses).
// pit: the car is put at the steepest off-road spot found (≤25 m from a road it is the bowl rim, else the worst spot overall), gas held 10 s of
//   physics steps (roamStep, no rendering): it must end on a road or ≥ 20 m from the start (TR6_stuck lifts it after 3 s).
function TR6_rnd(sd){let s=sd;return()=>(s=(s*16807)%2147483647)/2147483647}
function TR6_gap(n=200){const G=[];HUB.grp.updateMatrixWorld(true);HUB.grp.traverse(m=>{if(m.isMesh&&m.userData.trG)G.push(m)});const RC=new THREE.Raycaster(),r=TR6_rnd(4242);let k=0,mx=0,mn=0,ex=null,bad=0;
  for(let t=0;t<20000&&k<n;t++){const x=HX0+(HX1-HX0)*r(),z=HZS+(HZN-HZS)*r();if(ART7_rd(x,z)<2||rivClear(x,z)<8)continue;const g=groundY(x,z);if(g<-1)continue;
    RC.set(new THREE.Vector3(x,g+400,z),new THREE.Vector3(0,-1,0));RC.far=800;const h=RC.intersectObjects(G,false)[0];if(!h)continue;k++;const d=h.point.y-g;if(d>.05)bad++;if(d>mx){mx=d;ex=[Math.round(x),Math.round(z)]}if(d<mn)mn=d}
  return{n:k,max:+mx.toFixed(3),min:+mn.toFixed(3),bad,ex}}
function TR6_slope(){const r=TR6_rnd(77);let best={th:0};const S=TRN_roads().filter(q=>q.cls!=='ab'&&q.P.length>2);let k=0;
  for(const q of S)for(let i=0;i<q.P.length-1;i+=3){const a=q.P[i],b=q.P[i+1],L=Math.hypot(b[0]-a[0],b[1]-a[1])||1,nx=-(b[1]-a[1])/L,nz=(b[0]-a[0])/L;
    for(const sd of[-1,1])for(const o of[6,12,18,25]){const x=a[0]+nx*sd*((q.hw||4)+o),z=a[1]+nz*sd*((q.hw||4)+o);if(ART7_rd(x,z)<1||rivClear(x,z)<8)continue;k++;const[gx,gz]=TR_grad(x,z,2),th=Math.atan(Math.hypot(gx,gz))*57.3;if(th>best.th)best={th:+th.toFixed(1),x:Math.round(x),z:Math.round(z)}}}
  best.n=k;return best}
function TR6_pit(){const s=TR6_slope();if(!s.x)return{ok:true,why:'no slope'};roamWarp(s.x,s.z,0);RO.v=0;RO.t6n=0;const x0=RO.x,z0=RO.z,thr=CTL.thr;
  try{for(let i=0;i<300;i++){CTL.thr=1;roamStep(1/30)}}finally{CTL.thr=thr}
  const q=cityAt(RO.x,RO.z),f=fillAt(RO.x,RO.z),onR=(q&&q.d<q.road.w/2+3)||(f&&f.d<f.r.w/2+3),mv=Math.hypot(RO.x-x0,RO.z-z0);return{ok:onR||mv>=20,onR:!!onR,mv:Math.round(mv),lifts:RO.t6n||0,s}}
function TR6_go(kind){try{
  if(kind==='gap'){const o=TR6_gap(),ok=o.n>=150&&o.max<=.05;return'📍 GRASS ON THE PHYSICS GROUND · '+o.n+' off-road points: drawn ground up to '+o.max+' m above the drive height (need ≤0.05), '+o.bad+' over · lowest '+o.min+' m'+(o.ex?' · worst ('+o.ex+')':'')+(ok?' ✅':' ❌')}
  if(kind==='slope'){const o=TR6_slope();return'📍 SLOPES BESIDE ROADS · steepest terrain 6-25 m beside a road: '+o.th+'° at ('+o.x+','+o.z+') of '+o.n+' points (info; the car climbs ≤29°, TR6_stuck lifts it out of anything steeper) ✅'}
  if(kind==='pit'){const o=TR6_pit();return'📍 PIT ESCAPE · start on '+(o.s.th||0)+'° at ('+o.s.x+','+o.s.z+'), gas 10 s: '+(o.onR?'on a road':'moved '+o.mv+' m')+', lifted '+o.lifts+'×'+(o.ok?' ✅':' ❌')}
 }catch(e){return'📍 terr6 '+kind+' ERROR '+e.message+' ❌'}}
