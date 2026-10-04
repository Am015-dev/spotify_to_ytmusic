/* ===== CV · traffic signals + rules (both cities), city variety (rooflines, colours, medians, plazas, parks) ===== */
const CV={G:new Map(),t:0,acc:0,sig:[],yl:[],seg:new Map(),JG:new Map(),K:2097152,pedOK:0,pedBad:0,dd:0,bs:[],fv:[],tick:0,last:null},CV_MAJ={arterial:1,main:1,ring:1};
function CV_h(x,z,k=0){const h=Math.sin(x*12.9898+z*78.233+k*37.719)*43758.5453;return h-Math.floor(h)}
function CV_pal(a,h){return a[Math.floor(h*a.length)%a.length]}
// phase of approach k at junction J: 'g' green, 'y' amber, 'r' red; walk = last WALK s of the cycle (all cars red)
const CV_AM=2.5,CV_AR=2,CV_WK=9;
function CV_u(J){const u=(CV.t-J.off)%J.C;return u<0?u+J.C:u}
function CV_st(J,k){const u=CV_u(J),s=J.s[k],g=J.g[k];return u>=s&&u<s+g?'g':u>=s+g&&u<s+g+CV_AM?'y':'r'}
function CV_walk(J){const u=CV_u(J)-J.Cw;return u>=0?u:-1}
function CV_near(x,z,f){const kx=Math.floor(x/64),kz=Math.floor(z/64);for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const L=CV.JG.get((kx+a)*100000+kz+b);if(L)for(const J of L)if(f(J))return J}return null}
function CV_sigBuild(){const N=HUB.nodes,NG=N.ng,K=CV.K;CV.sig=[];CV.yl=[];CV.seg=new Map();CV.JG=new Map();const all=[];
  for(const J of JUNC){if(!(J.r>0))continue;const nm=new Set(),nm2=new Set();let road=0;for(const i of J.ids||[]){const S=CITY_S[i];if(!S||S.r.cls==='ped'||S.r.cls==='hill'||S.r.cls==='quay')continue;road++;const id=S.r.id??S.r.name??i;if(CV_MAJ[S.r.cls])nm.add(id);if(S.r.cls==='sec')nm2.add(id)}
    if(road<2)continue;const C={x:J.x,z:J.z,r:J.r,R0:J.r+1.5,sig:nm.size>=2,s2:nm.size===1&&nm2.size>=1,ed:[],ap:[],pd:1e9};all.push(C)}
  if(CID==='fra')for(const X of FILL_X)all.push({x:X.x,z:X.z,r:Math.max(X.wa,X.wb)/2,R0:Math.max(X.wa,X.wb)/2+1.5,sig:false,ed:[],ap:[],pd:1e9});
  if(all.filter(C=>C.sig).length<8)for(const C of all)if(C.s2)C.sig=true;
  for(let i=0;i<all.length;i++){const A=all[i];if(A.dead)continue;for(let j=i+1;j<all.length;j++){const B=all[j];if(B.dead||Math.abs(A.x-B.x)>60||Math.abs(A.z-B.z)>60)continue;const d=Math.hypot(A.x-B.x,A.z-B.z);if(d<A.R0+B.R0-2){const x=(A.x+B.x)/2,z=(A.z+B.z)/2,R0=Math.max(Math.hypot(A.x-x,A.z-z)+A.R0,Math.hypot(B.x-x,B.z-z)+B.R0);if(R0>32)continue;A.x=x;A.z=z;A.R0=R0;A.r=R0-1.5;A.sig=A.sig||B.sig;B.dead=1;j=i}}}
  for(let i=all.length-1;i>=0;i--)if(all[i].dead)all.splice(i,1);all.forEach((C,i)=>C.id=i);
  for(const C of all){const k=Math.floor(C.x/64)*100000+Math.floor(C.z/64);if(!CV.JG.has(k))CV.JG.set(k,[]);CV.JG.get(k).push(C)}
  // incoming edges: start outside the stop circle, run into it, towards the centre
  for(let i=0;i<NG;i++){const A=N[i];if(A.ab)continue;for(const j of A.nb){if(j>=NG)continue;const B=N[j],mx=(A.x+B.x)/2,mz=(A.z+B.z)/2;let best=null,bd=1e9;
    const kx=Math.floor(mx/64),kz=Math.floor(mz/64),ex=B.x-A.x,ez=B.z-A.z,L2=ex*ex+ez*ez||1;
    for(let a=-2;a<=2;a++)for(let b=-2;b<=2;b++){const L=CV.JG.get((kx+a)*100000+kz+b);if(L)for(const C of L){const dA=Math.hypot(A.x-C.x,A.z-C.z);if(dA<C.R0||dA>140)continue;if(ex*(C.x-A.x)+ez*(C.z-A.z)<=0)continue;const t=Math.max(0,Math.min(1,((C.x-A.x)*ex+(C.z-A.z)*ez)/L2)),dm=Math.hypot(A.x+ex*t-C.x,A.z+ez*t-C.z);if(dm<C.R0*.9&&dA-(C.sig?60:0)<bd){bd=dA-(C.sig?60:0);best=C}}}
    if(best)best.ed.push([i,j])}}
  const need=new Map();
  for(const C of all){const G=[];for(const e of C.ed){const A=N[e[0]],l=Math.hypot(C.x-A.x,C.z-A.z)||1,dx=(C.x-A.x)/l,dz=(C.z-A.z)/l;let g=G.find(q=>q.dx*dx+q.dz*dz>.82);if(!g)G.push(g={dx:0,dz:0,e:[],w:0});g.dx+=dx;g.dz+=dz;g.e.push(e);g.w=Math.max(g.w,A.w||14)}
    if(G.length<2){C.sig=false}
    for(const g of G){const l=Math.hypot(g.dx,g.dz)||1;g.dx/=l;g.dz/=l;let lat=0;for(const[i]of g.e)lat+=(N[i].x-C.x)*g.dz-(N[i].z-C.z)*g.dx;g.lat=lat/g.e.length}
    G.sort((a,b)=>b.w-a.w);C.ap=G;const hw=q=>Math.min(14,q.w/2);
    G.forEach((g,k)=>{for(const[i,j]of g.e){CV.seg.set(i*K+j,{J:C,k});need.set(i,[C,k])}});
    if(!C.sig){CV.yl.push(C);continue}
    C.s=[];C.g=[];let t=0;G.forEach((g,k)=>{C.s.push(t);C.g.push(g.w>=16?12:8);t+=C.g[k]+CV_AM+CV_AR});C.Cw=t;C.C=t+CV_WK;
    const a0=G[0];C.off=((C.x*a0.dx+C.z*a0.dz)/13)%C.C;CV.sig.push(C)}
  // the edge before each incoming edge is part of the approach too (braking room)
  for(let i=0;i<NG;i++){for(const j of N[i].nb){const q=need.get(j);if(!q||CV.seg.has(i*K+j))continue;const[C,k]=q;if(Math.hypot(N[i].x-C.x,N[i].z-C.z)>C.R0)CV.seg.set(i*K+j,{J:C,k,pre:1})}}
  CV_sigMesh()}
function CV_sigMesh(){const S=CV.sig,grp=HUB.grp;let nh=0;for(const J of S)nh+=J.ap.length;if(!nh)return;
  const pg=mergeG([ccyl(.16,.2,6.2,0,3.1,0,'#3b4148',8),cbox(3.8,.18,.18,1.9,5.95,0,'#3b4148'),cbox(.6,1.75,.55,3.6,5.2,0,'#20242a'),cbox(.75,.12,.7,3.6,6.12,0,'#20242a'),cbox(.42,.55,.42,0,2.75,0,'#20242a')]).scale(1.5,1.5,1.5);
  const pm=new THREE.InstancedMesh(pg,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.5,metalness:.4}),nh),
    lm=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(.36,1),new THREE.MeshBasicMaterial({toneMapped:false}),nh*4),
    sm=new THREE.InstancedMesh(new THREE.BoxGeometry(1,.05,.55),new THREE.MeshStandardMaterial({color:'#f4f4ef',roughness:.8,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-4}),nh);
  const m=new THREE.Matrix4(),q=new THREE.Quaternion(),up=V3(0,1,0),v=V3(),sc=V3(),c=new THREE.Color();let h=0;
  for(const J of S){J.li=h*4;J.lc=[];J.ap.forEach((g,k)=>{const hw=Math.min(14,g.w/2),sd=Math.abs(g.lat)<1?1:Math.sign(g.lat),lx=g.dz,lz=-g.dx,ry=Math.atan2(g.dx,g.dz),
      bx=J.x-g.dx*J.R0,bz=J.z-g.dz*J.R0,one=Math.abs(g.lat)<1,sx=bx+lx*(one?0:sd*hw/2),sz=bz+lz*(one?0:sd*hw/2);
      m.compose(v.set(sx,groundY(sx,sz)+.07,sz),q.setFromAxisAngle(up,ry),sc.set(one?hw*2-1:hw-.6,1,1));sm.setMatrixAt(h,m);
      const px=bx-g.dx*1.2+lx*sd*(hw+1.3),pz=bz-g.dz*1.2+lz*sd*(hw+1.3),gy=groundY(px,pz),ar=sd>0?ry+Math.PI:ry,ax=-lx*sd,az=-lz*sd;
      m.compose(v.set(px,gy,pz),q.setFromAxisAngle(up,ar),sc.set(1,1,1));pm.setMatrixAt(h,m);
      const hx=px+ax*5.4-g.dx*.48,hz=pz+az*5.4-g.dz*.48;for(let n=0;n<3;n++){m.makeTranslation(hx,gy+8.62-n*.82,hz);lm.setMatrixAt(h*4+n,m)}
      m.makeTranslation(px+ax*.36-g.dx*.15,gy+4.12,pz+az*.36-g.dz*.15);lm.setMatrixAt(h*4+3,m);for(let n=0;n<4;n++)lm.setColorAt(h*4+n,c.setRGB(.1,.1,.1));h++})}
  for(const o of[pm,lm,sm]){o.frustumCulled=false;o.userData.cv=1;grp.add(o)}lm.instanceColor.needsUpdate=true;CV.lm=lm;
  // turn indicators: small amber blinkers at the car corners (near the player only)
  const im=new THREE.InstancedMesh(new THREE.BoxGeometry(.5,.35,.5),new THREE.MeshBasicMaterial({color:new THREE.Color(3,1.6,.1),toneMapped:false}),160);im.count=0;im.frustumCulled=false;grp.add(im);CV.im=im}
const CV_LC={g:[[.2,.04,.03],[.25,.15,.02],[.15,2.8,.7]],y:[[.2,.04,.03],[3,1.7,.1],[.03,.15,.06]],r:[[3,.25,.15],[.25,.15,.02],[.03,.15,.06]]};
function CV_lamps(){const L=CV.lm;if(!L)return;let ch=0;const c=new THREE.Color();for(const J of CV.sig){if(Math.abs(J.x-RO.x)>700||Math.abs(J.z-RO.z)>700)continue;const w=CV_walk(J)>=0;
  J.ap.forEach((g,k)=>{const s=CV_st(J,k)+(w?'w':'');if(J.lc[k]===s)return;J.lc[k]=s;const T=CV_LC[s[0]];for(let n=0;n<3;n++)L.setColorAt(J.li+k*4+n,c.setRGB(...T[n]));L.setColorAt(J.li+k*4+3,w?c.setRGB(2.6,2.6,2.6):c.setRGB(1.6,.45,.08));ch=1})}if(ch)L.instanceColor.needsUpdate=true}
// AI: fixed 10 Hz tick near the player (leaders, junction occupancy), per-frame speed caps from lights / leaders / yields
function CV_tick(){const N=HUB.nodes,G=new Map(),near=[];CV.tick++;
  for(const c of HUB.cars){c.CVn=0;c.CVl=null;if(c.dead>0||(c.route&&!c.CVr))continue;const A=N[c.a],B=N[c.b];if(!A||!B||A.ab)continue;if(Math.abs(c.x-RO.x)>320||Math.abs(c.z-RO.z)>320)continue;
    const L=Math.hypot(B.x-A.x,B.z-A.z)||1;c.CVhx=(B.x-A.x)/L;c.CVhz=(B.z-A.z)/L;c.CVn=1;near.push(c);const k=Math.floor(c.x/16)*100000+Math.floor(c.z/16);if(!G.has(k))G.set(k,[]);G.get(k).push(c);}
  CV.G=G;for(const c of near){const kx=Math.floor(c.x/16),kz=Math.floor(c.z/16);let bd=18,b=null;for(let a=-1;a<=1;a++)for(let e=-1;e<=1;e++){const L=G.get((kx+a)*100000+kz+e);if(L)for(const o of L){if(o===c)continue;const rx=o.x-c.x,rz=o.z-c.z,al=rx*c.CVhx+rz*c.CVhz;if(al<.5||al>=bd)continue;if(Math.abs(rx*c.CVhz-rz*c.CVhx)<2.4&&o.CVhx*c.CVhx+o.CVhz*c.CVhz>.3){bd=al;b=o}}}c.CVl=b}
  CV_lamps()}
function CV_pre(dt){const N=HUB.nodes;CV.acc+=dt;CV.fr=(CV.fr||0)+1;if(CV.acc>=.1){CV.acc=0;CV_tick()}
  // box reservations: a junction admits one path at a time (followers in the same lane to the same exit may share it)
  const same=(o,c)=>o.CVf===c.CVf&&o.CVx!=null&&o.CVx===c.CVx&&Math.hypot(o.x-c.x,o.z-c.z)>10&&o.CVhx*c.CVhx+o.CVhz*c.CVhz>.9&&Math.abs((o.x-c.x)*c.CVhz-(o.z-c.z)*c.CVhx)<1.8;
  for(const c of HUB.cars){if(!c.CVn||c.dead>0)continue;const A=N[c.a],B=N[c.b];if(A&&B){const L=Math.hypot(B.x-A.x,B.z-A.z)||1;c.CVhx=(B.x-A.x)/L;c.CVhz=(B.z-A.z)/L}
    c.CVin=null;CV_near(c.x,c.z,J=>{if(Math.hypot(J.x-c.x,J.z-c.z)>=J.R0)return false;if(!c.CVin||J.sig)c.CVin=J;if(J.of!==CV.fr){J.of=CV.fr;J.oc=[]}J.oc.push(c);if(J.sig&&c.CVgh!==J){const r=J.res||(J.res=new Map());if(!r.has(c))r.set(c,CV.t)}return false})}
  for(const J of CV.act||[])if(J.res)for(const[c,t]of J.res){const rx=J.x-c.x,rz=J.z-c.z,l=Math.hypot(rx,rz);if(CV.t-t>7&&c.CVin===J)c.CVgh=J;if(c.dead>0||!c.CVn||CV.t-t>7||l>J.R0+1&&rx*c.CVhx+rz*c.CVhz<0||l>J.R0+30)J.res.delete(c)}
  CV.act=new Set();
  for(const c of HUB.cars){if(c.CVr&&c.route&&!c.route.length){c.route=null;c.CVr=0}if(!c.CVn||c.dead>0)continue;const A=N[c.a],B=N[c.b];if(!A||!B)continue;let vm=1e9;const g=CV.seg.get(c.a*CV.K+c.b),In=c.CVin;if(In)CV.act.add(In);
    let J=null,jd=1e9;if(!In||!In.sig)CV_near(c.x,c.z,Q=>{if(Q===In)return false;const rx=Q.x-c.x,rz=Q.z-c.z,l=Math.hypot(rx,rz),e=l-(Q.sig?1e3:0);if(l<Q.R0+(Q.sig?40:16)&&e<jd&&rx*c.CVhx+rz*c.CVhz>l*.45&&Math.abs(rx*c.CVhz-rz*c.CVhx)<Q.R0*.8){jd=e;J=Q}return false});
    if(J){CV.act.add(J);let d=Math.hypot(J.x-c.x,J.z-c.z)-J.R0,k=-1,bd=-2;J.ap.forEach((a,i)=>{const v=a.dx*c.CVhx+a.dz*c.CVhz;if(v>bd){bd=v;k=i}});if(k>=0)d=(J.x-c.x)*J.ap[k].dx+(J.z-c.z)*J.ap[k].dz-J.R0;c.CVf=J.id*8+k;const res=J.res||(J.res=new Map());
      if(J.sig&&J.ap.length>1){if(!res.has(c)){const s=k<0?'r':CV_st(J,k);let go=s==='g'||s==='y'&&d<(c.cv||0)**2/12+2;const l=c.CVl;
        if(go&&l&&!(l.dead>0)&&(l.cv||0)<3&&Math.hypot(l.x-J.x,l.z-J.z)<J.R0+8)go=false;
        if(go)for(const o of res.keys()){if(o===c||same(o,c))continue;const ox=o.x-J.x,oz=o.z-J.z;if(ox*o.CVhx+oz*o.CVhz>0&&Math.hypot(ox,oz)>J.R0*.45)continue;go=false;break}
        if(go&&d<6)res.set(c,CV.t);else if(!go)vm=Math.sqrt(10*Math.max(0,d-3.2))}}
      else{vm=Math.min(vm,6+Math.max(0,d)*.6);const o=J.of===CV.fr?J.oc.find(o=>o!==c&&Math.abs(o.CVhx*c.CVhx+o.CVhz*c.CVhz)<.7):null;if(o&&d>2&&(c.CVw=(c.CVw||0)+dt)<4)vm=Math.min(vm,Math.sqrt(10*Math.max(0,d-3.2)));else if(!o)c.CVw=0}}
    if(g&&!g.pre&&!c.route&&!c.CVp){let nx=B.nb.filter(n=>n!==c.a&&n<N.ng);if(c.tr)nx=nx.filter(n=>N[n].tr);if(nx.length){const n=nx[Math.floor(Math.random()*nx.length)],C=N[n],l=Math.hypot(C.x-B.x,C.z-B.z)||1,s=((C.x-B.x)*c.CVhz-(C.z-B.z)*c.CVhx)/l;c.route=[n];c.CVx=n;c.CVr=1;c.CVp=1;if(Math.abs(s)>.4){c.CVi=s>0?1:-1;c.CViT=6}}}
    if(!g){c.CVp=0;if(!J&&!In)c.CVx=null}
    const Jb=In&&In.sig?In:J;if(Jb&&Jb.sig&&(In===Jb||Jb.res&&Jb.res.has(c))){const R=Jb.res,pc=R&&R.has(c)?R.get(c):1e9;let hold=0;const kx=Math.floor(c.x/16),kz=Math.floor(c.z/16);
      for(let a=-1;a<=1;a++)for(let e=-1;e<=1;e++)for(const o of CV.G.get((kx+a)*100000+kz+e)||[]){if(o===c||o.dead>0)continue;const rx=o.x-c.x,rz=o.z-c.z,dd=Math.hypot(rx,rz);if(dd>8)continue;const al=rx*c.CVhx+rz*c.CVhz;if(al<-.5)continue;
        const po=R&&R.has(o)?R.get(o):1e9;if(po<pc||po===pc&&o.j+o.k*997<c.j+c.k*997||dd<6&&al>0&&Math.abs(rx*c.CVhz-rz*c.CVhx)<3)hold=1}
      if(hold){vm=0;c.CVst=(c.CVst||0)+dt;if(c.CVst>5&&In&&Math.hypot(c.x-RO.x,c.z-RO.z)>50){c.dead=.05;c.CVst=0;c.route=null;c.CVr=0;CV.rc=(CV.rc||0)+1;for(const Q of[In,J])if(Q&&Q.res)Q.res.delete(c)}}else c.CVst=0}
    const o=c.CVl;if(o&&!(o.dead>0)){const rx=o.x-c.x,rz=o.z-c.z,al=rx*c.CVhx+rz*c.CVhz;if(al>0&&Math.abs(rx*c.CVhz-rz*c.CVhx)<2.6)vm=Math.min(vm,al<7.5?0:(o.cv||0)+Math.sqrt(8*(al-7.5)))}
    if(vm<1e9){c.CVv=c.v;c.v=Math.min(c.v,vm);c.cv=Math.min(c.cv??c.v,vm);if(vm<.5)c.CVfz=[c.a,c.b,c.t]}}}
function CV_post(dt){for(const c of HUB.cars){if(c.CVv!=null){c.v=c.CVv;c.CVv=null}if(c.CVfz){if(!(c.dead>0)){[c.a,c.b,c.t]=c.CVfz;c.cv=0}c.CVfz=null}}
  const im=CV.im;if(im){let n=0;const on=(CV.t*3|0)%2===0;for(const c of HUB.cars){if(!(c.CViT>0))continue;c.CViT-=dt;if(!on||!c.CVn||n>=158||c.dead>0)continue;const rx=c.CVhz*c.CVi*1.55,rz=-c.CVhx*c.CVi*1.55;for(const f of[2.7,-2.7]){_m.makeTranslation(c.x+rx+c.CVhx*f,c.y+1.1,c.z+rz+c.CVhz*f);im.setMatrixAt(n++,_m)}}im.count=n;im.instanceMatrix.needsUpdate=true}
  // the player is free: running a red is just cheeky
  if(RO.on){const hx=Math.sin(RO.h),hz=Math.cos(RO.h);if(CV.ddT>0)CV.ddT-=dt;CV_near(RO.x,RO.z,J=>{if(!J.sig)return false;const d=Math.hypot(RO.x-J.x,RO.z-J.z),pd=J.pd;J.pd=d;if(!(pd>=J.R0&&d<J.R0)||Math.abs(RO.v)<4||CV.ddT>0)return false;let k=-1,bd=.6;J.ap.forEach((g,i)=>{const v=g.dx*hx+g.dz*hz;if(v>bd){bd=v;k=i}});
    if(k>=0&&CV_st(J,k)==='r'){CV.dd++;CV.ddT=3;try{const S2=season();S2.cr+=10;saveSeason(S2);feed('+10 studs DAREDEVIL',0,'#ff7a1c');AU.sfx('near')}catch(e){}}return false})}}
// pedestrians: wait at the kerb of a signalled junction, enter only in the first seconds of the walk phase, hurry across
function CV_pedPre(dt){const P=HUB.peds,N=HUB.nodes;if(!P)return;for(const p of P){p.CVj=null;const A=N[p.a],B=N[p.b];if(!A||!B||p.jy>0)continue;const g=CV.seg.get(p.a*CV.K+p.b),J=g&&!g.pre&&g.J.sig?g.J:null;
  const bx=A.x+(B.x-A.x)*p.t,bz=A.z+(B.z-A.z)*p.t;if(p.CVh){p.v=p.CVh;p.CVh=0}const In=CV_near(bx,bz,J=>J.sig&&Math.hypot(J.x-bx,J.z-bz)<J.R0);if(In){p.CVh=p.v;p.v*=2.2}
  if(!J)continue;const dr=Math.hypot(bx-J.x,bz-J.z)-J.R0;p.CVj=J;p.CVd=dr;if(dr<=0)continue;const w=CV_walk(J);if(w>=0&&w<3.5)continue;
  const L=Math.hypot(B.x-A.x,B.z-A.z)||1;if(dr-p.v*dt*2-.4<0){p.CVs=p.v;p.v=0}}}
function CV_pedPost(){const P=HUB.peds,N=HUB.nodes;if(!P)return;for(const p of P){if(p.CVs!=null){p.v=p.CVs;p.CVs=null}const J=p.CVj;if(!J||!(p.CVd>0))continue;const A=N[p.a],B=N[p.b];if(!A||!B)continue;
  const bx=A.x+(B.x-A.x)*p.t,bz=A.z+(B.z-A.z)*p.t;if(Math.hypot(bx-J.x,bz-J.z)<J.R0&&Math.hypot(bx-J.x,bz-J.z)>J.R0-6){if(CV_walk(J)>=0)CV.pedOK++;else CV.pedBad++}}}
{const _bt=buildHubTraffic;buildHubTraffic=()=>{_bt();try{CV_sigBuild();if(CID==='fra')CV_fraVar()}catch(e){console.warn('CV',e)}}
 const _ht=hubTrafficStep;hubTrafficStep=dt=>{if(!CV.sig.length&&!CV.yl.length||!HUB.cars)return _ht(dt);CV.t+=dt;CV_pre(dt);_ht(dt);CV_post(dt)}
 const _ps=pedStep;pedStep=dt=>{if(!CV.sig.length)return _ps(dt);CV_pedPre(dt);_ps(dt);CV_pedPost()}
 const _ce=CE_streets;CE_streets=(add,rnd,D)=>{_ce(add,rnd,D);try{CV_streets(add,D)}catch(e){console.warn('CV',e)}}}
// ---------- city variety: Athens units (hooked into athBuildG put), per-building seed for height, colour, roof, balconies, shopfront
const CV_AP={poly:['#f4f1ea','#efe3c8','#f2d9b0','#e9e4dc','#f3dcd2','#dfe9ee','#e8d5c0','#f0e0a8','#d8e4d0','#f6e2d6','#cfd8e0','#e9c9a8'],neo:['#efe0bf','#f2d7a0','#e8cfa6','#e6b8a0','#f0c8b8','#dcc8a8','#f3e9d8','#e8d0b0','#c9d6c0'],
  plaka:['#f7f3ea','#f3e3c3','#e8c9a0','#d9e6ef','#f4d8c8','#ffffff','#f1e6b8','#e8b890'],villa:['#ffffff','#fbf6ea','#f6eedc','#fff8f0','#f0e0c8','#e8eef0','#f4e4d4'],glass:['#2f5d73','#3a6a80','#4a7a8a','#2a4a5a','#5a8a98','#3a5a6a']};
function CV_put(E,U,x,z,ry,c,s,fr){const k=U.k,h0=CV_h(x,z),h1=CV_h(x,z,1),h2=CV_h(x,z,2),L=(lx,lz)=>[x+lx*c+lz*s,z-lx*s+lz*c],hx=v=>parseInt(v.slice(1),16),q=cityAt(x,z),
  kif=k==='poly'&&q&&q.d<q.road.w/2+32&&/kifis/i.test((q.road.name||'')+(q.road.id||'')),dn=districtAt(x,z)||'';let deco=0,pal=CV_AP[kif?'glass':k]||CV_AP.poly;
  if(k==='poly')U.fl=kif?7+Math.floor(h0*6):Math.max(3,Math.min(9,U.fl+[-1,0,0,1,2][Math.floor(h0*5)]));else if(k==='neo'&&!/Plaka/.test(dn))U.fl=Math.max(2,Math.min(4,U.fl+(h0<.3?1:0)));
  let ci=Math.floor(h1*pal.length),P=CV.last;if(P&&Math.hypot(P[0]-x,P[1]-z)<30&&P[2]===U.fl&&P[3]===pal[ci])ci=(ci+1)%pal.length;U.cvc=hx(pal[ci]);
  const{w,d,fh}=U,fl=U.fl,h=fl*fh+(k==='villa'?.4:.6);
  if(kif){E('box',x,.5,z,ry,w+.24,h-.8,d+.24,U.cvc);for(let f=1;f<fl;f++)E('box',x,f*fh-.1,z,ry,w+.34,.32,d+.34,0xd8dde0);E('box',x,h,z,ry,w*.55,2.6,d*.55,0x9aa4aa);deco=9}
  else if(k==='poly'&&fr&&!U.nb){deco=1+Math.floor(h2*4);const ac=hx(CV_pal(['#3f8a4a','#e8822a','#2f7fd0','#c8302a','#d8b030','#7a4a8a','#2a8a8a'],h0*7%1)),[fx,fz]=L(0,d/2+1.05);
    for(let f=1;f<fl;f++){if(deco===2&&(f+Math.floor(h1*3))%3)E('box',fx,f*fh+2.05,fz,ry,w*.8,.1,1.3,ac);else if(deco===3)E('box',fx,f*fh-.2,fz,ry,w-.9,.85,.08,0x8fc4d8);else if(deco===4&&f%2)E('box',fx,f*fh-.2,fz,ry,w*.55,.35,.35,0x4a8a3a)}
    if(h0>.55){const[gx,gz]=L(0,d/2+.08);E('box',gx,.1,gz,ry,w-.6,2.7,.14,hx(CV_pal(['#2c3e48','#4a3a34','#2a4a3a','#3a3a48'],h2)));const[sx,sz]=L(0,d/2+.3);E('box',sx,2.9,sz,ry,w*(.5+h1*.4),.7,.4,hx(CV_pal(['#e8302a','#2a7ad8','#ffcc00','#3aa04a','#ff7a1c','#d6337f','#1fb5b0'],h0*11%1)));deco+=10}}
  else if(k==='neo'){const n=2+Math.floor(h2*3);for(let i=0;i<n;i++){const[px,pz]=L((i/(n-1)-.5)*(w-1.2),d/2+.12);E('box',px,.2,pz,ry,.55,h-.6,.26,0xf8f4ea)}deco=n;if(h1>.5){const[bx,bz]=L(0,d/2+.5);E('box',bx,fh-.05,bz,ry,w*.4,.18,1,0xf6f2e8)}}
  else if(k==='plaka'){const sc=hx(CV_pal(['#2f6f9a','#3a7a4a','#8a2a2a','#5a8aa8','#a8642a'],h2)),[dx,dz]=L((h0-.5)*w*.4,d/2+.06);E('box',dx,0,dz,ry,1.1,2.3,.1,sc);for(let f=0;f<fl;f++)for(const sx of[-.3,.3]){if(f===0&&Math.abs(sx-(h0-.5)*.4)<.2)continue;const[wx,wz]=L(sx*w,d/2+.06);E('box',wx,f*3.3+1.2,wz,ry,.9,1.3,.08,sc)}deco=Math.floor(h2*5)}
  else if(k==='villa'){E('box',x,.02,z,ry,w+7,.07,d+7,0x6a9a4a);for(const[a,b,lw,ld]of[[0,d/2+3.6,w+7.6,.8],[0,-d/2-3.6,w+7.6,.8],[w/2+3.6,0,.8,d+7.6],[-w/2-3.6,0,.8,d+7.6]]){if(b>0&&h1<.5){const[gx,gz]=L(a-(w+7.6)/4-1.5,b);E('box',gx,0,gz,ry,(w+7.6)/2-3,1.3,.8,0x4f7f3a);continue}const[gx,gz]=L(a,b);E('box',gx,0,gz,ry,lw,1.3,ld,0x4f7f3a)}deco=1}
  CV.last=[x,z,U.fl,pal[ci]];CV.bs.push([Math.round(x),Math.round(z),U.fl,U.cvc,deco,k])}
// ---------- Frankfurt: Kenney instances re-shaped per district (height, glass colour, crowns, half-timber) after the build
function CV_fsty(x,z){const n=districtAt(x,z)||'';return /Banken|Bahnhof|Innenstadt|Westhafen|Messe|City/i.test(n)?'bank':/R[öo]mer|Altstadt|Sachsen/i.test(n)?'old':/Westend|Nordend|Bornheim|Bockenheim/i.test(n)?'grz':/Osthafen|Hafen/i.test(n)?'ware':/Ostend|Gallus|Europa/i.test(n)?'off':'mix'}
const CV_FP={bank:['#9ec8e8','#a8e0d8','#d8c8a0','#c8d4e0','#8fb0d8','#e0e8f0','#b8d8c0'],old:['#fff4e0','#f6e0c8','#f8f0d8','#f0d8d0','#e8eef0','#fbe8c0'],grz:['#e8b8a0','#f0d8b0','#e0c8a8','#d8c0b8','#f4e8d0','#c8d0d8'],off:['#d0d8e0','#e8ecf0','#b8c8d8','#c0d0c8','#f0f0f0'],ware:['#c87850','#b86848','#d89068','#a86040','#c8a080'],mix:['#ffffff','#fff0e0','#e8f0ff','#f0ffe8','#ffe8f0','#fff8d8','#f0e8ff']};
function CV_fraVar(){const grp=HUB.grp,BI=new Map();for(const b of HUB.bld)BI.set(Math.round(b.x)+'|'+Math.round(b.z),b);const pos=V3(),qu=new THREE.Quaternion(),sc=V3(),c=new THREE.Color(),cr=[],tb=[];
  for(const im of grp.children){if(!im.isInstancedMesh||!im.userData.ks||im.userData.cv)continue;const g=im.geometry;if(!g.boundingBox)g.computeBoundingBox();const bb=g.boundingBox,hy=bb.max.y,wx=bb.max.x-bb.min.x,wz=bb.max.z-bb.min.z;
    for(let i=0;i<im.count;i++){im.getMatrixAt(i,_m);_m.decompose(pos,qu,sc);const st=CV_fsty(pos.x,pos.z),h0=CV_h(pos.x,pos.z),h1=CV_h(pos.x,pos.z,1),H=hy*sc.y,tall=H>45;
      const f=st==='bank'?(tall?.8+h0*.95:.9+h0*.5):st==='old'?.9+h0*.25:st==='grz'?.95+h0*.2:st==='off'?1+h0*.45:st==='ware'?.75+h0*.2:.88+h0*.35;sc.y*=f;_m.compose(pos,qu,sc);im.setMatrixAt(i,_m);
      im.setColorAt(i,c.set(CV_pal(CV_FP[tall&&st!=='bank'?'off':st],h1)));const b=BI.get(Math.round(pos.x)+'|'+Math.round(pos.z));if(b)b.h*=f;
      if(st==='bank'&&tall||st==='off'&&H*f>60)cr.push([pos.x,pos.z,H*f,wx*sc.x,wz*sc.z,qu.clone(),h0,h1]);else if(st==='old'&&!tall)tb.push([pos.x,pos.z,H*f*.55,wx*sc.x,wz*sc.z,qu.clone()]);CV.fv.push([Math.round(pos.x),Math.round(pos.z),im.id,+(sc.y).toFixed(2),c.getHex()])}
    im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true;im.computeBoundingSphere()}
  const mk=(geo,L,mat,fn)=>{if(!L.length)return;const m=new THREE.InstancedMesh(geo,mat,L.length);L.forEach((e,i)=>{fn(e,i,m)});m.userData.cv=1;m.computeBoundingSphere();grp.add(m)},Q=V3();
  const st=mergeG([cbox(1,.3,1,0,.15,0,'#ffffff'),cbox(.74,.3,.74,0,.45,0,'#ffffff'),cbox(.48,.3,.48,0,.75,0,'#ffffff'),ccyl(.03,.05,.6,0,1.2,0,'#ffffff',6)]),py=mergeG([(()=>{const g=new THREE.ConeGeometry(.72,1,4);g.rotateY(Math.PI/4);g.translate(0,.5,0);return colorize(g,new THREE.Color('#ffffff'))})(),cbox(1,.08,1,0,.04,0,'#ffffff')]);
  const cm=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.25,metalness:.6,emissive:0x223344,emissiveIntensity:.4});
  for(const[geo,L]of[[st,cr.filter(e=>e[6]<.55)],[py,cr.filter(e=>e[6]>=.55)]])mk(geo,L,cm,(e,i,m)=>{_m.compose(Q.set(e[0],e[2]-.05,e[1]),e[5],V3(e[3]*.92,10+e[7]*18,e[4]*.92));m.setMatrixAt(i,_m);m.setColorAt(i,new THREE.Color(CV_pal(['#e8f0ff','#ffd27a','#c8d0d8','#9ad8ff','#ff8a6a'],e[7])))});
  // half-timber: dark beams (posts, rails, braces) on all four walls of the old-town houses
  const B=[],bm='#4a2e1c';for(const s of[1,-1]){for(const x of[-.5,-.17,.17,.5])B.push(cbox(.035,1,.02,x,.5,s*.5,bm),cbox(.02,1,.035,s*.5,.5,x,bm));for(const y of[.02,.5,.98])B.push(cbox(1.02,.035,.02,0,y,s*.5,bm),cbox(.02,.035,1.02,s*.5,y,0,bm));
    for(const x of[-.335,.335]){const g=new THREE.BoxGeometry(.03,.6,.02);g.rotateZ(x>0?.6:-.6);g.translate(x,.25,s*.5);B.push(colorize(g,new THREE.Color(bm)));const g2=new THREE.BoxGeometry(.02,.6,.03);g2.rotateX(x>0?.6:-.6);g2.translate(s*.5,.25,x);B.push(colorize(g2,new THREE.Color(bm)))}}
  mk(mergeG(B),tb,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.8}),(e,i,m)=>{_m.compose(Q.set(e[0],.3,e[1]),e[5],V3(e[3]+.12,e[2],e[4]+.12));m.setMatrixAt(i,_m)});CV.cr=cr.length;CV.tb=tb.length}
// ---------- street types: tree-lined boulevard medians, tiled pedestrian streets, plaza fountains, small parks
function CV_streets(add,D){const rd=mul(9090),grp=HUB.grp,MP=[],MC=[],TP=[],TU=[],TI=[];let nm=0,nt=0,nf=0,np=0;const has=t=>D[t]?t:'tree',nearJ=(x,z,m)=>JUNC.some(J=>Math.abs(J.x-x)<J.r+m&&Math.abs(J.z-z)<J.r+m&&Math.hypot(J.x-x,J.z-z)<J.r+m);
  const quad=(A,a,b,c,d)=>A.push(...a,...b,...c,...a,...c,...d);
  for(const S of CITY_S){const cl=S.r.cls,P=S.pts,w=S.r.w;if((cl==='arterial'||cl==='ring')&&w>=17&&!S.prof&&S.L>80){for(let i=2;i<P.length-3;i+=2){const p=P[i],o=P[i+2];if(nearJ(p.x,p.z,14)||nearJ(o.x,o.z,14)||onAnyDeck(p.x,p.z)||onAnyDeck(o.x,o.z)||inRiver(p.x,p.z,-2)||(HUB.gates||[]).some(g=>Math.hypot(g.x-p.x,g.z-p.z)<40))continue;
      const y1=Math.max(groundY(p.x,p.z),p.y||0)+.16,y2=Math.max(groundY(o.x,o.z),o.y||0)+.16,hw=.85,a=[p.x-p.tz*hw,y1,p.z+p.tx*hw],b=[p.x+p.tz*hw,y1,p.z-p.tx*hw],c=[o.x+o.tz*hw,y2,o.z-o.tx*hw],d=[o.x-o.tz*hw,y2,o.z+o.tx*hw];quad(MP,a,b,c,d);for(let k=0;k<6;k++)MC.push(.38,.56,.27);
      for(const[e,f]of[[a,d],[c,b]]){quad(MP,[e[0],e[1]-.2,e[2]],e,f,[f[0],f[1]-.2,f[2]]);for(let k=0;k<6;k++)MC.push(.85,.83,.8)}nm++;if(i%4===2){add(has(CID==='fra'?'tree':'CE_cypress'),p.x,p.z,rd()*6.28);nt++}else if(rd()<.5)add(has(CID==='fra'?'planter':'bush'),(p.x+o.x)/2,(p.z+o.z)/2,rd()*6.28)}}
    if(cl==='ped'&&S.L>20){const hw=w/2-.6;let u=0;for(let i=0;i<P.length-1;i++){const p=P[i],o=P[i+1],y1=Math.max(groundY(p.x,p.z),p.y||0)+.075,y2=Math.max(groundY(o.x,o.z),o.y||0)+.075,l=Math.hypot(o.x-p.x,o.z-p.z);
      quad(TP,[p.x-p.tz*hw,y1,p.z+p.tx*hw],[p.x+p.tz*hw,y1,p.z-p.tx*hw],[o.x+o.tz*hw,y2,o.z-o.tx*hw],[o.x-o.tz*hw,y2,o.z+o.tx*hw]);const u2=u+l/4,v=hw/2;TU.push(0,u,v,u,v,u2,0,u,v,u2,0,u2);u=u2}np++}}
  const mesh=(P,mat,C,U)=>{if(!P.length)return;const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));if(C)g.setAttribute('color',new THREE.Float32BufferAttribute(C,3));if(U)g.setAttribute('uv',new THREE.Float32BufferAttribute(U,2));g.computeVertexNormals();const m=new THREE.Mesh(g,mat);m.userData.cv=1;grp.add(m)};
  mesh(MP,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.9,side:THREE.DoubleSide}),MC);
  if(TP.length){const[cvs,gx]=cv(128,128);gx.fillStyle='#a89a86';gx.fillRect(0,0,128,128);const r=mul(55);for(let y=0;y<8;y++)for(let x=0;x<4;x++){const v=200+r()*40|0;gx.fillStyle=(x+y)%2?`rgb(${v},${v-14},${v-34})`:`rgb(${v-30},${v-46},${v-60})`;gx.fillRect(x*32+(y%2)*16-16+1,y*16+1,30,14);gx.fillRect(x*32+(y%2)*16+16+1,y*16+1,30,14)}
    const t=tex(cvs);t.wrapS=t.wrapT=THREE.RepeatWrapping;KEEP_TEX.add(t);mesh(TP,new THREE.MeshStandardMaterial({map:t,roughness:.8,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-4}),null,TU)}
  // plazas: a fountain in every square big enough that has none; parks: tree clumps, benches along a cross path
  const F=[];for(const B of HUB.blocks||[]){const w=B.x1-B.x0,d=B.z1-B.z0,cx=(B.x0+B.x1)/2,cz=(B.z0+B.z1)/2;
    if(B.t==='plaza'&&w*d>700&&!/Syntagmat|Avissinias/.test(B.name||'')&&!roamHit(cx,cz,6)){const y=groundY(cx,cz),b={x:cx,z:cz,hw:3.3,hd:3.3,h:y+1.6};F.push(ccyl(3.4,3.6,.75,cx,y+.37,cz,'#e4dccb',20),ccyl(3.05,3.05,.1,cx,y+.66,cz,'#4aa8d8',20),ccyl(.35,.5,2.2,cx,y+1.1,cz,'#e4dccb',10),ccyl(1.3,.8,.4,cx,y+2.3,cz,'#e4dccb',14),ccyl(1.15,1.15,.06,cx,y+2.48,cz,'#7fc8ec',14),ccyl(.08,.3,1.6,cx,y+3.2,cz,'#d8f0ff',8));HUB.bld.push(b);hubGridAdd([b]);nf++}
    if(B.t==='park'&&w>30&&d>30){let n=0;for(let x=B.x0+7;x<B.x1-6;x+=13)for(let z=B.z0+7;z<B.z1-6;z+=13){if(n>60)break;const jx=x+(rd()-.5)*7,jz=z+(rd()-.5)*7;if(Math.abs(jx-cx)<3||Math.abs(jz-cz)<3)continue;const r=rd();if(r<.55){add(has(r<.2&&CID!=='fra'?'CE_olive':'tree'),jx,jz);n++}else if(r<.68)add(has('bush'),jx,jz)}
      for(let s=-1;s<=1;s+=2){add(has('bench'),cx+s*7,cz+2.5,0);add(has('bench'),cx-2.5,cz+s*7,Math.PI/2)}TI.push(n)}}
  if(F.length){const m=new THREE.Mesh(mergeG(F),new THREE.MeshStandardMaterial({vertexColors:true,roughness:.5}));m.userData.cv=1;grp.add(m)}
  CV.st={median:nm,medTrees:nt,fountains:nf,pedStreets:np,parks:TI.length,parkTrees:TI.reduce((a,b)=>a+b,0)}}
window.__cvCars=()=>HUB.cars;window.__cvPeds=()=>HUB.peds;window.__cvNodes=()=>HUB.nodes;window.__cvDist=n=>{const D=DIST_R.find(d=>d.name===n);return D&&[(D.x0+D.x1)/2,(D.z0+D.z1)/2]};
window.__cv={CV,st:CV_st,walk:CV_walk,
 info:()=>({rc:CV.rc||0,sig:CV.sig.length,yl:CV.yl.length,heads:CV.sig.reduce((a,J)=>a+J.ap.length,0),seg:CV.seg.size,dd:CV.dd,pedOK:CV.pedOK,pedBad:CV.pedBad,st:CV.st,bs:CV.bs.length,fv:CV.fv.length,cr:CV.cr,tb:CV.tb,dist:[...new Set(DIST_R.map(d=>d.name))]}),
 sigs:()=>CV.sig.map((J,i)=>({i,x:J.x,z:J.z,R0:J.R0,C:J.C,n:J.ap.length,ap:J.ap.map(g=>({dx:g.dx,dz:g.dz,ne:g.e.length,w:g.w}))})),
 // neighbours differ: Athens = consecutive units on a street side; Frankfurt = nearest other building instance
 nbr:()=>{let n=0,df=0;if(CV.bs.length){for(let i=1;i<CV.bs.length;i++){const a=CV.bs[i-1],b=CV.bs[i];if(Math.hypot(a[0]-b[0],a[1]-b[1])>30)continue;n++;if(a[2]!==b[2]||a[3]!==b[3]||a[4]!==b[4]||a[5]!==b[5])df++}}
  else{const L=CV.fv;for(let i=0;i<L.length;i++){let bj=-1,bd=40;for(let j=0;j<L.length;j++){if(i===j)continue;const d=Math.hypot(L[i][0]-L[j][0],L[i][1]-L[j][1]);if(d<bd){bd=d;bj=j}}if(bj<0)continue;n++;const a=L[i],b=L[bj];if(a[2]!==b[2]||Math.abs(a[3]-b[3])>.03||a[4]!==b[4])df++}}return{n,df,frac:n?df/n:0}}};
