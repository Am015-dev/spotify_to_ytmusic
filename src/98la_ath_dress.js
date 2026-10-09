// ===== v88x: Athens street dressing (Alex: "lively city"). Bitter-orange trees, periptero kiosks, parked scooters and "babas" bollards
// along the Athens kerbs. Placed once per city load at the kerb line (behind the kerb, never on a road, never inside a building collider),
// drawn from 4 InstancedMeshes (4 draws, no shadows) refilled around the player every 12 frames. Everything is smashable like the stalls:
// fast contact = brick burst + studs + a little speed loss; slow contact pushes the car out (collider = drawn size). TUNE.lvDress scales it.
const AD={grp:null,I:null,G:null,M:null,dead:new Set(),fr:0,px:1e9,pz:1e9,n:{}};
const AD_T=[{k:'tree',r:.9,cap:260},{k:'kiosk',r:1.7,cap:24},{k:'scoot',r:.8,cap:120},{k:'boll',r:.35,cap:260}];
function AD_geo(){
  const tree=mergeG([ccyl(.22,.26,1.6,0,.8,0,'#7a4a24',6),ccyl(.5,.5,.12,0,.06,0,'#8f8474',8),cbox(1.9,.9,1.9,0,1.95,0,'#2f8a3a'),cbox(1.5,.8,1.5,0,2.75,0,'#38a046'),cbox(.9,.5,.9,0,3.35,0,'#45b450'),
    ...[[.75,2.1,.55],[-.6,2.3,.78],[.3,2.9,-.62],[-.7,2.0,-.5],[.62,2.75,.2],[0,3.5,.3]].map(([x,y,z])=>ccyl(.13,.13,.14,x,y+(Math.abs(x)>.7||Math.abs(z)>.7?0:.42),z,'#ff8c1a',6))]);
  const kiosk=mergeG([cbox(2.3,2.3,1.7,0,1.15,0,'#2f7d4a'),cbox(2.7,.18,2.1,0,2.42,0,'#f2f2f2'),cbox(2.4,.4,.08,0,2.1,.9,'#ffd12c'),cbox(1.9,.9,.1,0,1.2,.89,'#f4f4f4'),
    ...[0,1,2,3].map(j=>cbox(.38,.5,.06,-.66+j*.44,1.25,.95,['#e8302a','#2a7ad8','#ffd12c','#ff7ac0'][j])),cbox(.7,1.6,.6,1.55,.8,.25,'#f8f8f8'),cbox(.62,1.2,.04,1.55,.95,.56,'#9ad0ff'),cbox(.3,.3,.3,-1.3,.15,.6,'#c8282c')]);
  const scoot=mergeG([cbox(.42,.5,1.15,0,.48,0,'#ffffff'),cbox(.36,.14,.6,0,.8,-.18,'#222222'),cbox(.4,.7,.16,0,.75,.55,'#ffffff'),ccyl(.03,.03,.5,0,1.1,.55,'#444444',5),cbox(.6,.06,.06,0,1.34,.55,'#444444'),
    ...[.52,-.48].map(z=>{const g=new THREE.CylinderGeometry(.24,.24,.14,10);g.rotateZ(Math.PI/2);g.translate(0,.24,z);return colorize(g,new THREE.Color('#1c1c1c'))}),cbox(.2,.12,.08,0,1.1,.68,'#ffe9a0')]);
  const boll=mergeG([ccyl(.14,.16,.85,0,.425,0,'#3a4a44',8),ccyl(.15,.15,.12,0,.62,0,'#e8e8e8',8),ccyl(.12,.14,.1,0,.9,0,'#3a4a44',8)]);
  return[tree,kiosk,scoot,boll]}
// one pass over the street graph: slots every 8.5 m on both kerbs of every Athens street longer than 30 m
function* AD_place(){const N=HUB.nodes,r=mul(8817),I=[],G=new Map(),seen=new Set(),occ=new Set(),ng=N.ng||N.length,t0=performance.now();
  const rj=AD.n.rej=[0,0,0],free=(x,z,q)=>{const k=Math.round(x/3)+'|'+Math.round(z/3);if(occ.has(k)){rj[0]++;return false}if(LV_onRoad(x,z,.9)){rj[1]++;return false}if(roamHit(x,z,q+.3,groundY(x,z)+.5)){rj[2]++;return false}occ.add(k);return true};
  for(let i=0;i<ng&&I.length<14000;i++){if(i%10===0)yield 0;const A=N[i];if(!A||A.ab||!A.nb)continue;for(const bi of A.nb){const B=N[bi];if(!B||B.ab||bi>=ng)continue;const ek=i<bi?i+'|'+bi:bi+'|'+i;if(seen.has(ek))continue;seen.add(ek);
    const L=Math.hypot(B.x-A.x,B.z-A.z);if(L<30)continue;const ux=(B.x-A.x)/L,uz=(B.z-A.z)/L,W=Math.min(A.w||20,B.w||20);if(W<7)continue;
    for(const sd of[-1,1]){const off=Math.max(W/2+1.15,(Math.min(A.pw||0,B.pw||0)||W/2+.5)+1.0);/* behind the walkers' line (pw), like the café clusters */let kl=-99;for(let s=12;s<L-12;s+=8.5){const q=r();let t=q<.34?0:q<.56?3:q<.70?2:q<.715&&s-kl>40?1:-1;if(t<0)continue;
      const x=A.x+ux*s-uz*off*sd,z=A.z+uz*s+ux*off*sd,o=t===1?off+.6:off,X=A.x+ux*s-uz*o*sd,Z=A.z+uz*s+ux*o*sd;if(!free(X,Z,AD_T[t].r))continue;if(t===1)kl=s;
      const y=Math.max(0,groundY(X,Z)),h=Math.atan2(ux,uz)+(t===2?(sd>0?1.2:-1.2)+(r()-.5)*.5:t===1?(sd>0?-Math.PI/2:Math.PI/2):r()*6.28);
      const it={t,x:X,z:Z,y,h,s:t===0?.9+r()*.25:1,c:Math.floor(r()*1e6)};I.push(it);if(t===3){const x2=X+ux*1.6,z2=Z+uz*1.6;if(free(x2,z2,.35))I.push({t:3,x:x2,z:z2,y,h:0,s:1,c:0})}}}}}
  for(let j=0;j<I.length;j++){const it=I[j],k=Math.floor(it.x/40)*100000+Math.floor(it.z/40);let a=G.get(k);if(!a)G.set(k,a=[]);a.push(j)}
  AD.I=I;AD.G=G;AD.n.items=I.length;AD.n.placeMs=Math.round(performance.now()-t0)}// (wall time; spread over frames at ≤ 6 ms each)
function AD_init(){AD.grp=HUB.grp;AD.dead.clear();AD.px=AD.pz=1e9;const g=AD_geo(),col=new THREE.Color(),SC=['#ffffff','#e8302a','#2a7ad8','#ffd12c','#3aa04a','#ff7ac0','#2b2b2b','#8fd0ff'];
  AD.M=AD_T.map((T,j)=>{const m=LV_im(g[j],T.cap);m.count=0;m.name='ad_'+T.k;return m});
  for(let i=0;i<AD_T[2].cap;i++)AD.M[2].setColorAt(i,col.set(SC[i%SC.length]));AD.M[2].instanceColor.needsUpdate=true;AD.I=null;AD.gen=AD_place()}
function AD_fill(){const R0=Math.round(115*Math.min(1.6,Math.sqrt(LV_d('lvDress')))),G=AD.G,I=AD.I,cx=Math.floor(RO.x/40),cz=Math.floor(RO.z/40),cr=Math.ceil(R0/40),near=[],cnt=[0,0,0,0];
  for(let a=cx-cr;a<=cx+cr;a++)for(let b=cz-cr;b<=cz+cr;b++){const L=G.get(a*100000+b);if(!L)continue;for(const j of L){const it=I[j],d2=(it.x-RO.x)**2+(it.z-RO.z)**2;if(d2<R0*R0)near.push([d2,j])}}
  near.sort((p,q)=>p[0]-q[0]);const keep=new Set();
  const CL=LV.cl?LV.cl.L.filter(q=>q.on):[];for(const [,j] of near){keep.add(j);if(AD.dead.has(j))continue;const it=I[j],T=AD_T[it.t];if(CL.some(q=>(q.x-it.x)**2+(q.z-it.z)**2<36))continue;/* a café/market/crowd cluster stands here now */if(cnt[it.t]>=T.cap)continue;LV_set(AD.M[it.t],cnt[it.t]++,it.x,it.y,it.z,0,it.h,0,it.s)}
  for(const j of AD.dead)if(!keep.has(j))AD.dead.delete(j);// smashed pieces come back once you are out of range
  for(let t=0;t<4;t++){AD.M[t].count=cnt[t];AD.M[t].instanceMatrix.needsUpdate=true}AD.n.drawn=cnt.join('/')}
function AD_hit(){const sp=Math.abs(RO.v),I=AD.I,cx=Math.floor(RO.x/40),cz=Math.floor(RO.z/40);for(let a=cx-1;a<=cx+1;a++)for(let b=cz-1;b<=cz+1;b++)for(const j of AD.G.get(a*100000+b)||[]){if(AD.dead.has(j))continue;const it=I[j],T=AD_T[it.t],ex=RO.x-it.x,ez=RO.z-it.z,e2=ex*ex+ez*ez,rr=T.r+1.1;
    if(e2>rr*rr||Math.abs((RO.y||0)-it.y)>3)continue;
    if(sp>6){AD.dead.add(j);const at=V3(it.x,it.y+1,it.z),fw=V3(Math.sin(RO.vh),0,Math.cos(RO.vh));debris(at,fw.clone().multiplyScalar(sp*.4).add(V3(0,6,0)),it.t===1?14:8,(['#38a046,#ff8c1a,#7a4a24','#2f7d4a,#ffd12c,#f2f2f2,#e8302a','#ffffff,#222222,#e8302a','#3a4a44,#e8e8e8'][it.t]).split(',').map(c=>new THREE.Color(c)),.7,it.y);
      studBurst(at,fw,sp);HUB.smashed++;comboAdd(1);RO.v*=it.t===1?.9:.97;AU.sfx('crash');AD.n.smash=(AD.n.smash||0)+1;AD.px=1e9}
    else{const e=Math.sqrt(e2)||1,o=rr-e;RO.x+=ex/e*o;RO.z+=ez/e*o;RO.v*=.7}}}
function AD_step(){if(CID==='fra'||!HUB.grp||!HUB.nodes||!HUB.bld||!HUB.bld.length)return;if(LV_d('lvDress')<=0){if(AD.M)for(const m of AD.M)m.count=0;return}
  if(AD.grp!==HUB.grp)AD_init();if(AD.gen){const t=performance.now();while(performance.now()-t<6)if(AD.gen.next().done){AD.gen=null;break}if(AD.gen)return}AD.fr++;if(AD.fr%12===0||Math.hypot(RO.x-AD.px,RO.z-AD.pz)>25){AD.px=RO.x;AD.pz=RO.z;AD_fill()}AD_hit()}
{const _adLS=LV_step;LV_step=dt=>{_adLS(dt);if(!RO.on||!LV.init)return;try{AD_step()}catch(e){if(!AD.e){AD.e=1;console.warn('AD dress',e)}}}}
