// ===== terr-1 (Alex: "both cities are flat, not realistic"): terrain STATE tests (tag terrain:, no driving). Each returns one pass line.
// Roads = CITY_S streets (+ Frankfurt filler grid FILL_R and Autobahn AB) sampled every 8 m; heights = groundY (the physics/road surface).
const TRN={};
function TRN_rng(s){let a=s>>>0;return()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
function TRN_roads(){const R=[];for(const S of CITY_S)R.push({P:S.pts.map(p=>[p.x,p.z]),hw:S.r.w/2,id:S.r.id||S.r.name,cls:S.r.cls});
  if(CID==='fra'){try{hubRoads()}catch(e){}for(const r of FILL_R||[]){const P=[],n=Math.max(1,Math.round(r.L/8));for(let i=0;i<=n;i++)P.push([r.x0+r.ux*r.L*i/n,r.z0+r.uz*r.L*i/n]);R.push({P,hw:r.w/2,id:'fill'+r.g,cls:'fill'})}
    for(const A of AB||[]){const P=[];for(let i=1;i<A.pts.length;i++){const a=A.pts[i-1],b=A.pts[i],n=Math.max(1,Math.round(Math.hypot(b[0]-a[0],b[1]-a[1])/8));for(let k=0;k<n;k++){const x=a[0]+(b[0]-a[0])*k/n,z=a[1]+(b[1]-a[1])*k/n;if(x>WX0+50&&x<WX1-50&&z>WZS+50&&z<WZN-50)P.push([x,z])}}R.push({P,hw:A.w/4,id:A.k||A.id,cls:'ab'})}}
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
    const d=Math.max(Math.abs(groundY(c[0]+nx*hw,c[1]+nz*hw)-y),Math.abs(groundY(c[0]-nx*hw,c[1]-nz*hw)-y));out.push({d,x:Math.round(c[0]),z:Math.round(c[1]),id:r.id})}
  out.sort((a,b)=>b.d-a.d);const o={n:out.length,max:+out[0].d.toFixed(2),worst:out[0],over:out.filter(q=>q.d>.3).length};TRN.edge=o;return o}
// deck (bridge / ramp) ends: deck surface vs the ground just past the joint
function TRN_ramp(){let mx=0,w=null,n=0;for(const b of ALL_DECKS){for(const s of[-1,1]){const a=s*(b.half-.3),y=deckY(b,a);if(y==null)continue;const[x,z]=deckPt(b,s*(b.half+.6));if(CID==='fra'&&inRiver(x,z))continue;n++;
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
    roamWarp(S[k][0],S[k][1],S[k][2]);RO.v=0;setTimeout(()=>{G.push(TRN_gapNow());step(k+1)},1500)};step(0);return'📍 TYRE GAP · checking 5 road spawns…'}
// draw load at 3 fixed views (same spots every run); fps is shown, the pass line is triangles/calls ≤ +5% of the pre-terrain build
const TRN_VIEWS={fra:[[200,354,0],[-1100,-1200,3.6],[2121,150,1.6]],ath:[[0,0,0],[300,-700,3.1],[-600,300,1.2]]};
const TRN_LOAD0={fra:null,ath:null};
function TRN_fps(say){if(TRN.fpRun)return'📍 FPS VIEWS running…';TRN.fpRun=1;const V=TRN_VIEWS[CID==='fra'?'fra':'ath'],out=[];
  const step=k=>{if(k>=V.length){TRN.fpRun=0;TRN.fps=out;const L0=TRN_LOAD0[CID==='fra'?'fra':'ath'];let ok=true;if(L0)for(let i=0;i<out.length;i++)if(out[i].tris>L0[i].tris*1.05||out[i].calls>L0[i].calls*1.05)ok=false;
      say('📍 FPS VIEWS · '+(out.every(o=>!o.calls)?'(page not drawing: draw=0 test mode) · ':'')+out.map(o=>o.fps+' fps / '+Math.round(o.tris/1000)+'k tris / '+o.calls+' calls').join(' · ')+(L0?ok?' · load ≤ +5% ✅':' · load > +5% ❌':' · (no baseline) ✅'));return}
    const q=rfSnap(V[k][0],V[k][1],200)||V[k];roamWarp(q[0],q[1],V[k][2]);RO.v=0;setTimeout(()=>{let n=0,t0=performance.now(),tr=0,ca=0;const I=renderer.info,ar=I.autoReset;I.autoReset=false;I.reset();const f=()=>{n++;tr=Math.max(tr,I.render.triangles);ca=Math.max(ca,I.render.calls);I.reset();if(performance.now()-t0>=2000)I.autoReset=ar;
      if(performance.now()-t0<2000)requestAnimationFrame(f);else{out.push({fps:Math.round(n*1000/(performance.now()-t0)),tris:tr,calls:ca});step(k+1)}};requestAnimationFrame(f)},2500)};step(0);return'📍 FPS VIEWS · measuring 3 views…'}
function TRN_go(kind,say){try{
  if(kind==='lyka'||kind==='muehl')return TRN_hill(kind);
  if(kind==='grade'){const o=TRN_grade();return'📍 ROAD GRADE · '+o.n+' road steps of 8 m · p50 '+o.p50+'% p99 '+o.p99+'% max '+o.max+'% at '+o.worst.id+' ('+o.worst.x+','+o.worst.z+') (need ≤12%)'+(o.max<=12?' ✅':' ❌')}
  if(kind==='edge'){const o=TRN_edge();return'📍 ROAD FLAT ACROSS · 50 road points · max centre-to-edge drop '+o.max+' m at '+o.worst.id+' ('+o.worst.x+','+o.worst.z+') (need ≤0.3)'+(o.max<=.3?' ✅':' ❌')}
  if(kind==='ramp'){const o=TRN_ramp();return'📍 RAMP JOINTS · '+o.n+' deck ends · max step '+o.max+' m'+(o.worst?' at '+o.worst.id:'')+' (need <0.1)'+(o.max<.1?' ✅':' ❌')}
  if(kind==='base'){const o=TRN_base();return'📍 BUILDING BASES · '+o.n+' buildings · '+o.bad+' float above the ground (max '+o.max+' m) (need 0)'+(o.bad?' ❌':' ✅')}
  if(kind==='tyre')return TRN_tyre(say);if(kind==='fps')return TRN_fps(say)}catch(e){return'📍 terrain test error '+e.message+' ❌'}}
window.__trn={TRN,go:TRN_go,grade:TRN_grade,edge:TRN_edge,ramp:TRN_ramp,base:TRN_base,relief:TRN_relief,roads:TRN_roads,gap:TRN_gapNow};
// slope colours on the open land (outer ground heightfields with a col callback): grass → dry grass (15-30 %) → dirt (30-55 %) → rock (>55 %);
// Athens also dries out with height (macchia above ~120 m)
const TRN_C={dry:new THREE.Color(CID==='fra'?'#b3a85e':'#c2ae72'),dirt:new THREE.Color('#9a7a52'),rock:new THREE.Color('#8e8a82')};
function TRN_slopeCol(c,x,z){if(!c||!c.isColor)return c;let s=0,h=0;try{h=groundY(x,z);const a=groundY(x+5,z)-groundY(x-5,z),b=groundY(x,z+5)-groundY(x,z-5);s=Math.hypot(a,b)/10}catch(e){return c}
  const ss=(a,b,v)=>{const t=clamp((v-a)/(b-a),0,1);return t*t*(3-2*t)};let d=ss(.12,.3,s)*.55;if(CID!=='fra')d=Math.max(d,ss(110,220,h)*.45);if(d>0)c.lerp(TRN_C.dry,d);const r=ss(.3,.55,s);if(r>0)c.lerp(TRN_C.dirt,r*.7);const k=ss(.55,.9,s);if(k>0)c.lerp(TRN_C.rock,k*.8);return c}
if(TERR.on&&new URLSearchParams(location.search).get('trc')!=='0'){const _g=gndBuild;gndBuild=(grp,x0,x1,z0,z1,o)=>{if(o&&o.col&&!o.trc){const c0=o.col;o={...o,trc:1,col:(x,z)=>TRN_slopeCol(c0(x,z),x,z)}}return _g(grp,x0,x1,z0,z1,o)}}
