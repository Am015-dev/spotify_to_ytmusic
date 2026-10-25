/* racedress-r24n (2026-10-24, lazy chunk src/LAZY, ON for city races, kill switch ?rd=0): every city race (quick, rival, boss, sprint; fra + ath) is dressed as a
   closed race course, LEGO 2K Drive / LEGO Racers style. Alex, beta.161: "the races dont look like races more free roam with opponents".
   Generalises the Westend proto stretch (src/98pr_proto.js) to the whole course of every race:
   - red/white studded kerbs + a red/white brick barrier along both sides of every route (start, A, B, finish); the barrier is SOLID (HUB.grid colliders, rh 1.6)
     and runs straight across side-street mouths, which also get a blue arrow board (course goes on). Gaps only where another part of the course runs
     (split / rejoin / self crossing: a SHORTCUT board) and on park cuts / river legs (verges stay open). The soft bounds (98rfb_race_bounds.js) are unchanged.
   - traffic, parked cars and pedestrians inside the course corridor are moved off it at the start and every frame while racing (nothing is deleted:
     the city fills back in after the race).
   - start gantry with 5 lights over a chequered line, a 2-wide staggered grid (rivals beside and ahead), 3-2-1-GO countdown ('3' shows at once, the race name under it), flags and crowd stands
     at start and finish, yellow chevron boards on the outside of every corner > 45 deg, a chequered FINISH banner on the finish arch (checkpoint arches: tkArch).
   Pieces are InstancedMeshes in 250 m cells (distance culled at 330 m), 3 materials (MeshStandard solid + instance colour, MeshStandard atlas, MeshBasic lights),
   linked under the countdown against the composer's linear target (RDS_warm). GO race/dressed (src/99c9rd_racedress_go.js). */
const RDS={on:(()=>{try{return new URLSearchParams(location.search).get('rd')!=='0'}catch(e){return true}})(),g:null,M:null,G:null,cols:[],cells:[],st:null,cor:null,far:null,clrT:0,lights:null,warmN:0,bans:[]};window.RDS=RDS;
const RDS_CELL=250,RDS_VIS=330,RDS_MINW=7;   // barrier at >= 8.1 m from the centre line: the whole street + verge stays free (racefree), a bot on an 8 m Athens street drives 4.4 m off centre
function RDS_mats(){if(RDS.M)return RDS.M;const[c,g]=cv(512,256);
  // atlas: [0,0] chevron (points +u), [128,0] arrow (points +u), [256,0] chequer + FINISH (256 wide), row 2: SHORTCUT board (512 wide)
  g.fillStyle='#ffcd03';g.fillRect(0,0,128,128);g.fillStyle='#1b1c22';for(const o of[0,52]){g.beginPath();g.moveTo(14+o,18);g.lineTo(44+o,18);g.lineTo(78+o,64);g.lineTo(44+o,110);g.lineTo(14+o,110);g.lineTo(48+o,64);g.closePath();g.fill()}g.lineWidth=8;g.strokeStyle='#1b1c22';g.strokeRect(4,4,120,120);
  g.fillStyle='#0a5fbf';g.fillRect(128,0,128,128);g.fillStyle='#fff';g.beginPath();g.moveTo(146,50);g.lineTo(196,50);g.lineTo(196,26);g.lineTo(240,64);g.lineTo(196,102);g.lineTo(196,78);g.lineTo(146,78);g.closePath();g.fill();g.strokeStyle='#fff';g.lineWidth=6;g.strokeRect(131,3,122,122);
  for(let i=0;i<32;i++)for(let j=0;j<16;j++){g.fillStyle=(i+j)%2?'#111':'#fff';g.fillRect(256+i*8,j*8,8,8)}g.fillStyle='#d01712';g.fillRect(300,36,168,56);g.font='italic 900 60px system-ui';g.textAlign='center';g.textBaseline='middle';g.fillStyle='#fff';g.save();g.translate(384,66);g.scale(.5,1);g.fillText('FINISH',0,0);g.restore();   // shown 2x wide on the 13 x 3.2 m banner
  g.fillStyle='#ffcd03';g.fillRect(0,128,512,128);g.fillStyle='#1b1c22';g.fillRect(0,128,512,10);g.fillRect(0,246,512,10);g.font='italic 900 70px system-ui';g.fillText('SHORTCUT',236,194);g.beginPath();g.moveTo(430,166);g.lineTo(492,192);g.lineTo(430,218);g.closePath();g.fill();
  const t=tex(c);KEEP_TEX.add(t);
  return RDS.M={solid:new THREE.MeshStandardMaterial({color:0xffffff,roughness:.35,metalness:0}),board:new THREE.MeshStandardMaterial({map:t,roughness:.45,metalness:0}),
    ban:new THREE.MeshStandardMaterial({map:t,roughness:.4,metalness:0,side:THREE.DoubleSide}),lamp:new THREE.MeshBasicMaterial({color:0xffffff,toneMapped:false})}}
const RDS_COL={red:0xd01712,wht:0xf4f4f4,yel:0xffcd03,blu:0x0a5fbf,grn:0x237841,blk:0x1d1e24,gry:0x8a8f99,org:0xff7a1a};
function RDS_geos(){if(RDS.GE)return RDS.GE;const mg=L=>{const g=mergeGeometries(L,false);for(const x of L)x.dispose();return g},T=(g,x,y,z,rx)=>{if(rx)g.rotateX(rx);g.translate(x,y,z);return g};
  const uv=(g,u0,v0,u1,v1,flip)=>{const a=g.attributes.uv;for(let i=0;i<a.count;i++){let u=a.getX(i);if(flip)u=1-u;a.setXY(i,u0+(u1-u0)*u,v0+(v1-v0)*a.getY(i))}return g};
  // atlas v: canvas row 0 is the TOP (flipY): tile rows v 0.5-1 (row 1 of canvas) and 0-0.5 (row 2)
  return RDS.GE={kerb:mg([T(new THREE.BoxGeometry(.9,.22,1.96),0,.11,0),T(new THREE.CylinderGeometry(.24,.24,.16,8),0,.3,-.5),T(new THREE.CylinderGeometry(.24,.24,.16,8),0,.3,.5)]),
    bar:mg([T(new THREE.BoxGeometry(.6,.62,3.9),0,.31,0),T(new THREE.CylinderGeometry(.3,.3,3.9,8),0,.66,0,Math.PI/2),T(new THREE.CylinderGeometry(.2,.2,.16,8),0,.98,-1),T(new THREE.CylinderGeometry(.2,.2,.16,8),0,.98,1)]),
    post:new THREE.BoxGeometry(.18,1,.18).translate(0,.5,0),pole:new THREE.CylinderGeometry(.14,.14,1,6).translate(0,.5,0),flag:new THREE.BoxGeometry(.12,2.4,1.7),
    box:new THREE.BoxGeometry(1,1,1),body:new THREE.BoxGeometry(.7,.8,.42).translate(0,.4,0),head:new THREE.CylinderGeometry(.27,.27,.42,8).translate(0,1.02,0),lamp:new THREE.CylinderGeometry(.42,.42,.2,12).rotateX(Math.PI/2),
    chevR:uv(new THREE.PlaneGeometry(2.4,2.4),0,.5,.25,1),chevL:uv(new THREE.PlaneGeometry(2.4,2.4),0,.5,.25,1,true),arwR:uv(new THREE.PlaneGeometry(2.6,2.6),.25,.5,.5,1),arwL:uv(new THREE.PlaneGeometry(2.6,2.6),.25,.5,.5,1,true),
    cut:uv(new THREE.PlaneGeometry(6,1.5),0,0,1,.5),fin:uv(new THREE.PlaneGeometry(1,1),.5,.5,1,1)}}
// a course polyline with cumulative lengths: at(s) -> {x,z,h} (forward = (sin h, cos h), the driver's left = (cos h, -sin h)); s outside [0,L] extrapolates
function RDS_line(P){const c=[0];for(let i=1;i<P.length;i++)c.push(c[i-1]+Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]));const L=c[c.length-1];let j=1;
  const at=s=>{if(s<=0||s>=L){const i=s<=0?1:P.length-1,a=P[i-1],b=P[i],l=Math.hypot(b[0]-a[0],b[1]-a[1])||1,h=Math.atan2(b[0]-a[0],b[1]-a[1]),o=s<=0?s:s-L,p=s<=0?a:b;return{x:p[0]+Math.sin(h)*o,z:p[1]+Math.cos(h)*o,h,i}}
    if(c[j-1]>s)j=1;while(j<P.length-1&&c[j]<s)j++;const a=P[j-1],b=P[j],l=(c[j]-c[j-1])||1,t=(s-c[j-1])/l;return{x:a[0]+(b[0]-a[0])*t,z:a[1]+(b[1]-a[1])*t,h:Math.atan2(b[0]-a[0],b[1]-a[1]),i:j}};return{P,c,L,at}}
// the road under (x,z): named city street (cityAt) or fill road (fillAt), whichever reaches nearer; e = distance past its kerb (< 0 inside the carriageway)
function RDS_road(x,z){const c=cityAt(x,z,-1,true),f=typeof fillAt==='function'?fillAt(x,z):null;let o=null;if(c&&c.road){const w=c.road.w||12;o={e:Math.abs(c.d)-w/2,w,si:c.si}}
  if(f&&f.r){const w=f.r.w||12,e=f.d-w/2;if(!o||e<o.e)o={e,w,si:f.r}}return o}
// road half width at a course point, null off-road (park cut)
function RDS_hw(x,z){const r=RDS_road(x,z);if(!r||r.e>3)return null;return{hw:clamp(r.w/2,4,16),si:r.si}}
// every course segment in a 32 m hash: near(x,z,skip) -> {d, hw} of the nearest course segment (skip = own segment id)
function RDS_index(lines){const H=new Map(),S=[];for(const ln of lines){const P=ln.P;for(let i=1;i<P.length;i++){const a=P[i-1],b=P[i],mx=(a[0]+b[0])/2,mz=(a[1]+b[1])/2,r=RDS_hw(mx,mz),id=S.length;S.push([a[0],a[1],b[0],b[1],Math.max(r?r.hw:6,RDS_MINW)]);/* the same minimum the barrier uses */ln.sid=ln.sid||[];ln.sid[i]=id;
    const n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/16)+1;for(let k=0;k<=n;k++){const x=a[0]+(b[0]-a[0])*k/n,z=a[1]+(b[1]-a[1])*k/n;for(let u=-1;u<=1;u++)for(let v=-1;v<=1;v++){const key=(Math.floor(x/32)+u)*100000+Math.floor(z/32)+v;let A=H.get(key);if(!A)H.set(key,A=[]);if(A[A.length-1]!==id)A.push(id)}}}}
  const sd2=(s,x,z)=>{const dx=s[2]-s[0],dz=s[3]-s[1],l2=dx*dx+dz*dz||1,t=clamp(((x-s[0])*dx+(z-s[1])*dz)/l2,0,1);return Math.hypot(s[0]+dx*t-x,s[1]+dz*t-z)};
  // cx,cz: the own centre point: a segment passing within 4 m of it runs along the same street (routes A and B sharing it), not a crossing course road
  const near=(x,z,skip,cx,cz)=>{const A=H.get(Math.floor(x/32)*100000+Math.floor(z/32));let bd=1e9,hw=0;if(A)for(const id of A){if(skip>=0&&Math.abs(id-skip)<=1)continue;   /* own segment and its neighbours (inside corners: the apex rule in RDS_build) */const s=S[id];if(cx!=null&&sd2(s,cx,cz)<4)continue;const d=sd2(s,x,z);if(d<bd){bd=d;hw=s[4]}}return{d:bd,hw}};return{near,S}}
function RDS_build(sp){RDS_drop();const M=RDS_mats(),GE=RDS_geos(),C=sp.C,Gm=tkGeoOf(C),lines=['start','A','B','fin'].map(k=>Object.assign(RDS_line(Gm.seg[k]),{k})),IX=RDS_index(lines);
  const I=new Map(),m4=new THREE.Matrix4(),qn=new THREE.Quaternion(),e=new THREE.Euler(),v3=new THREE.Vector3(),sc=new THREE.Vector3(),col=new THREE.Color();
  // put an instance: type -> cell (250 m) -> [matrix, colour]
  const put=(ty,x,y,z,h,c,sx=1,sy=1,sz=1,glob)=>{const key=glob?0:Math.floor(x/RDS_CELL)*100000+Math.floor(z/RDS_CELL);let T=I.get(ty);if(!T)I.set(ty,T=new Map());let A=T.get(key);if(!A)T.set(key,A=[]);
    e.set(0,h,0,'YXZ');qn.setFromEuler(e);m4.compose(v3.set(x,y,z),qn,sc.set(sx,sy,sz));A.push([m4.clone(),c])};
  const st=RDS.st={len:0,bar:0,open:0,offr:0,kerbs:0,mouths:0,closed:0,cutOpen:0,corners:[],chev:0,arrows:0,cuts:0,flags:0,stands:0,crowd:0,cols:0},water=!!C.water&&typeof inRiver==='function';
  const DU=new Map(),dup=(x,z,r)=>{const k=Math.floor(x/4)*100000+Math.floor(z/4);for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const L=DU.get(k+a*100000+b);if(L)for(const p of L)if(p[2]===r&&Math.hypot(p[0]-x,p[1]-z)<r)return true}let L=DU.get(k);if(!L)DU.set(k,L=[]);L.push([x,z,r]);return false};   // routes sharing a street: one barrier / kerb, not two
  const yAt=(x,z,yc)=>{const g=groundAt(x,z,yc+3);return Math.abs(g-yc)>1.5?yc:g};
  const cols=[];const wall=(x,z,h,y)=>{const c=Math.cos(h),s=Math.sin(h);cols.push({x,z,hw:.35,hd:2.05,c,s,h:y+1.6,rh:1.6,y0:y-.5,rd:1})};
  // chevrons: every corner sharper than 45 deg (heading change over 30 m), 3 boards across the outside wall, facing the driver, pointing into the bend
  for(const ln of lines){let best=null;const flush=()=>{if(!best)return;const s=(best.a+best.b)/2,dh=best.dh;best=null;const a=ln.at(s-12),b=ln.at(s+12),sd=dh<0?1:-1;
      // the corner = middle of the run of samples over 45 deg (a sharp vertex: the run is vertex +- 15 m); the boards stand past it along the in heading
      const r=RDS_hw(a.x,a.z),hwO=(RDS_hw(b.x,b.z)||r||{hw:8}).hw,q=ln.at(s),bx0=q.x+Math.sin(a.h)*(hwO+2.2),bz0=q.z+Math.cos(a.h)*(hwO+2.2);let n0=0;
      for(const o of[-3.2,0,3.2]){const x=bx0+Math.cos(a.h)*o,z=bz0-Math.sin(a.h)*o,y=groundAt(x,z,groundAt(q.x,q.z,99)+3);if(IX.near(x,z,-1).d<(hwO-1))continue;
        put(sd>0?'chevR':'chevL',x,y+1.9,z,a.h+Math.PI,0xffffff,1,1,1,1);put('post',x,y,z,a.h,RDS_COL.blk,1,.8,1);n0++}
      // no free wall straight ahead (a curve, or the course itself runs there): boards on the outside verge just before the apex
      if(!n0)for(const ds of[-14,-8,-2]){const p=ln.at(s+ds),w=(RDS_hw(p.x,p.z)||{hw:hwO}).hw,x=p.x+Math.cos(p.h)*sd*(w+1.7),z=p.z-Math.sin(p.h)*sd*(w+1.7),y=groundAt(x,z,groundAt(p.x,p.z,99)+3);if(IX.near(x,z,-1,p.x,p.z).d<w)continue;
        put(sd>0?'chevR':'chevL',x,y+1.9,z,p.h+Math.PI,0xffffff,1,1,1,1);put('post',x,y,z,p.h,RDS_COL.blk,1,.8,1);n0++}
      st.corners.push({k:ln.k,s,dh:+dh.toFixed(2),n:n0,x:+q.x.toFixed(1),z:+q.z.toFixed(1)});(ln.cin=ln.cin||[]).push([s,-sd]);st.chev+=n0};
    for(let s=15;s<ln.L-15;s+=4){const dh=angDiff(ln.at(s+15).h,ln.at(s-15).h);if(Math.abs(dh)>Math.PI/4){if(!best)best={a:s,b:s,dh};best.b=s;if(Math.abs(dh)>Math.abs(best.dh))best.dh=dh}else flush()}flush()}
  for(const ln of lines){const L=ln.L;if(L<4)continue;const s0=ln.k==='start'?-30:0,s1=ln.k==='fin'?L+20:L;
    for(const sd of[-1,1]){let mouth=null;const endM=()=>{if(!mouth)return;st.mouths++;if(mouth.open)st.cutOpen++;else st.closed+=mouth.bar===mouth.n?1:0;mouth.miss=mouth.n-mouth.bar;(st.mouthL=st.mouthL||[]).push(mouth);
        const q=ln.at((mouth.a+mouth.b)/2),hw0=mouth.hw,x=q.x+Math.cos(q.h)*sd*(hw0+2.1),z=q.z-Math.sin(q.h)*sd*(hw0+2.1),y=yAt(x,z,groundAt(q.x,q.z,99));
        if(mouth.open){if(!mouth.nearSplit){put('cut',x,y+2.6,z,q.h+(sd>0?-1:1)*Math.PI/2,0xffffff,1,1,1,1);put('post',x+Math.sin(q.h)*2.2,y,z+Math.cos(q.h)*2.2,q.h,RDS_COL.blk,1,1.9,1);put('post',x-Math.sin(q.h)*2.2,y,z-Math.cos(q.h)*2.2,q.h,RDS_COL.blk,1,1.9,1);st.cuts++}}
        else{put(sd>0?'arwR':'arwL',x,y+1.9,z,q.h+(sd>0?-1:1)*Math.PI/2,0xffffff,1,1,1,1);put('post',x,y,z,q.h,RDS_COL.blk,1,.9,1);st.arrows++}mouth=null};
      for(let s=s0,k=0;s<s1;s+=4,k++){const q=ln.at(s+2),r=RDS_hw(q.x,q.z),own=ln.sid[Math.min(q.i,ln.P.length-1)];st.len+=4;
        if(!r||(water&&inRiver(q.x,q.z,0))){st.offr+=4;endM();continue}
        const hw=Math.max(r.hw,RDS_MINW),lx=Math.cos(q.h)*sd,lz=-Math.sin(q.h)*sd,yc=groundAt(q.x,q.z,99);
        for(const o of[-1,1]){const kx=q.x+lx*(r.hw-.45)+Math.sin(q.h)*o,kz=q.z+lz*(r.hw-.45)+Math.cos(q.h)*o,n=IX.near(kx,kz,own,q.x,q.z);if(n.d<n.hw-.3||dup(kx,kz,1.2))continue;put('kerb',kx,yAt(kx,kz,yc),kz,q.h,(k*2+(o>0?1:0))%2?RDS_COL.wht:RDS_COL.red);st.kerbs++}
        const bx=q.x+lx*(hw+1.1),bz=q.z+lz*(hw+1.1),n=IX.near(bx,bz,own,q.x,q.z),open=n.d<n.hw+1;   // another course road (split, rejoin, self crossing): leave it open
        if(typeof inRiver==='function'&&inRiver(bx,bz,0)){st.offr+=4;continue}   // the river side of a quay: water, no barrier
        // side street: the street under a point 4 m past the kerb is another one and we are inside its carriageway
        const mx=q.x+lx*(r.hw+4),mz=q.z+lz*(r.hw+4),cs=RDS_road(mx,mz),side=!!cs&&cs.si!==r.si&&cs.e<0;
        if(side){if(!mouth)mouth={a:s,b:s,n:0,bar:0,open:false,hw,ln:ln.k,sd};mouth.b=s+4;mouth.n++;if(open){mouth.open=true;const p0=lines[0].at(lines[0].L),p1=lines[3].at(0);mouth.nearSplit=Math.min(Math.hypot(q.x-p0.x,q.z-p0.z),Math.hypot(q.x-p1.x,q.z-p1.z))<40}}else endM();
        // inside of a sharp corner, 26 m before to 14 m after the apex: the racing line cuts it (a bot clipped the barrier), so the barrier steps back 4.5 m and has no collider;
        // where that lands on the course's own next leg it stays open (that mouth is the course itself)
        if(!open&&ln.cin&&ln.cin.some(c=>c[1]===sd&&s>c[0]-26&&s<c[0]+14)){const x2=q.x+lx*(hw+5.6),z2=q.z+lz*(hw+5.6),n2=IX.near(x2,z2,own,q.x,q.z);
          if(n2.d<n2.hw+1||(typeof inRiver==='function'&&inRiver(x2,z2,0))){if(side&&mouth)mouth.open=mouth.nearSplit=true;st.open+=4;continue}
          if(!dup(x2,z2,2.2)){const y=yAt(x2,z2,yc);put('bar',x2,y,z2,q.h,k%2?RDS_COL.wht:RDS_COL.red)}   /* visual only: the cut across an inside plaza stays drivable */st.bar+=4;if(side&&mouth)mouth.bar++;continue}
        if(open){st.open+=4;continue}
        if(dup(bx,bz,2.2)){st.bar+=4;if(side&&mouth)mouth.bar++;continue}const y=yAt(bx,bz,yc);put('bar',bx,y,bz,q.h,k%2?RDS_COL.wht:RDS_COL.red);wall(bx,bz,q.h,y);st.bar+=4;if(side&&mouth)mouth.bar++}
      endM()}}
  // start: grid (rivals beside and ahead), chequered line, gantry with 5 lights; flags + stands at start and finish
  const S=lines[0],F=lines[3],at=(ln,s,o)=>{const q=ln.at(s);return{x:q.x+Math.cos(q.h)*o,z:q.z-Math.sin(q.h)*o,h:q.h,y:groundAt(q.x,q.z,99)}};
  const nA=sp.ai.length;sp.ai.forEach((a,i)=>{a.s=7.5+(i>>1)*7+(i&1)*3.5;a.lane=i&1?4:-4});   // 2 wide, staggered: rival 0 beside-left, the rest ahead
  const r0=RDS_hw(S.at(10).x,S.at(10).z),hwS=Math.max(r0?r0.hw:8,RDS_MINW),sL=Math.max(12+((nA-1)>>1)*7+6,Math.min(34,S.L*.12-12)),lines2=[];
  for(const[s,ln]of[[4,4],...sp.ai.map(a=>[a.s,a.lane])]){for(const o of[-1.7,1.7]){const a=at(S,s,ln+o);put('box',a.x,a.y+.03,a.z,a.h,RDS_COL.wht,.22,.05,4.6)}const f=at(S,s+2.5,ln);put('box',f.x,f.y+.03,f.z,f.h,RDS_COL.wht,3.6,.05,.25)}
  {const a=at(S,sL,0);for(let i=-Math.floor(hwS);i<hwS;i++)for(let j=0;j<2;j++){const p=at(S,sL+j*.8-.4,i+.5);put('box',p.x,p.y+.03,p.z,p.h,(i+j)&1?RDS_COL.blk:RDS_COL.wht,1,.05,.8)}
    const gs=sL+3;for(const sd of[-1,1]){const p=at(S,gs,sd*(hwS+1.6));put('pole',p.x,p.y,p.z,p.h,RDS_COL.blu,4.4,8.4,4.4);for(const yy of[1.6,4.2,6.8])put('pole',p.x,p.y+yy-.17,p.z,p.h,RDS_COL.wht,5.4,.34,5.4)}
    const c=at(S,gs,0),bw=hwS*2+5.6;put('box',c.x,c.y+9.7,c.z,c.h,RDS_COL.blu,bw,2.6,1.2);RDS.lights=[];
    for(let i=0;i<5;i++){const o=(i-2)*1.6,x=c.x+Math.cos(c.h)*o-Math.sin(c.h)*.7,z=c.z-Math.sin(c.h)*o-Math.cos(c.h)*.7;put('box',x,c.y+7.7,z,c.h,RDS_COL.blk,1.2,1.4,.4);put('lamp',x-Math.sin(c.h)*.25,c.y+7.7,z-Math.cos(c.h)*.25,c.h,0x2a2b33,1,1,1,1);RDS.lights.push(i)}
    RDS.gant={x:c.x,z:c.z,h:c.h,y:c.y,bw}}
  const furn=(ln,a,b,tag)=>{const fc=[RDS_COL.yel,RDS_COL.blu,RDS_COL.red,RDS_COL.grn];for(const sd of[-1,1]){for(let s=a,k=0;s<b;s+=12,k++){const q=ln.at(s),r=RDS_hw(q.x,q.z);if(!r)continue;const o=sd*(Math.max(r.hw,RDS_MINW)+2.6),p=at(ln,s,o);if(IX.near(p.x,p.z,-1).d<r.hw+1||roamHit(p.x,p.z,.5,p.y))continue;
        put('pole',p.x,p.y,p.z,p.h,RDS_COL.wht,1,7.5,1);put('flag',p.x+Math.sin(p.h)*.85,p.y+6.2,p.z+Math.cos(p.h)*.85,p.h,fc[(k+(sd>0?1:0))%4]);st.flags++}
      // crowd stand: 3 stepped tiers, 12 m long, behind the barrier, if the pavement is free of buildings
      const sm=(a+b)/2,q=ln.at(sm),r=RDS_hw(q.x,q.z);if(!r)continue;const o0=Math.max(r.hw,RDS_MINW)+3.4;let ok=true;for(const ds of[-6,0,6])for(const dd of[0,2,4]){const p=at(ln,sm+ds,sd*(o0+dd));if(roamHit(p.x,p.z,.6,p.y)||IX.near(p.x,p.z,-1).d<r.hw+1)ok=false}if(!ok)continue;
      for(let t=0;t<3;t++){const p=at(ln,sm,sd*(o0+t*1.6+.8));put('box',p.x,p.y+(t+1)*.45,p.z,p.h,t%2?RDS_COL.gry:0x6f7480,1.6,(t+1)*.9,12);
        for(let u=-5.5;u<=5.5;u+=.9){const f=at(ln,sm+u,sd*(o0+t*1.6+.8)),cc=[RDS_COL.red,RDS_COL.blu,RDS_COL.yel,RDS_COL.grn,RDS_COL.wht,RDS_COL.org][Math.floor(Math.abs(Math.sin(u*12.9+t*7.1+s0x(tag)))*6)];
          put('body',f.x,f.y+(t+1)*.9,f.z,f.h+(sd>0?-1:1)*Math.PI/2,cc);put('head',f.x,f.y+(t+1)*.9,f.z,f.h,RDS_COL.yel);st.crowd++}}st.stands++}};
  const s0x=t=>t==='fin'?3.3:1.1;furn(S,-20,sL+30,'start');furn(F,Math.max(0,F.L-70),F.L+10,'fin');
  // build: one InstancedMesh per (type, cell); boards / lamps / grid furniture are one global mesh per type
  const G=new THREE.Group();G.name='racedress';RDS.cells=[];let draws=0;const mat=ty=>ty==='lamp'?M.lamp:/^(chev|arw|cut)/.test(ty)?M.board:M.solid;
  for(const[ty,T]of I)for(const[key,A]of T){const im=new THREE.InstancedMesh(GE[ty],mat(ty),A.length),ca=new Float32Array(A.length*3);
    for(let i=0;i<A.length;i++){im.setMatrixAt(i,A[i][0]);col.setHex(A[i][1]);ca[i*3]=col.r;ca[i*3+1]=col.g;ca[i*3+2]=col.b}im.instanceColor=new THREE.InstancedBufferAttribute(ca,3);
    im.instanceMatrix.needsUpdate=true;im.computeBoundingSphere();im.matrixAutoUpdate=false;im.updateMatrix();im.userData.rdT=ty;G.add(im);draws++;if(ty==='lamp')RDS.lamp=im;
    if(key)RDS.cells.push({im,x:im.boundingSphere.center.x,z:im.boundingSphere.center.z,r:im.boundingSphere.radius})}
  // finish arch: chequered FINISH banner on both faces of the beam (tkArch: span along local x, beam at y 12.8, 3.2 deep)
  const fa=sp.G[sp.G.length-1];if(fa&&fa.mesh){for(const sd of[-1,1]){const b=new THREE.Mesh(GE.fin,M.ban);b.scale.set(13,3.2,1);RDS.bans.push(b);b.position.set(0,12.8,sd*1.66);b.rotation.y=sd>0?0:Math.PI;b.userData.rdBan=1;fa.mesh.add(b)}st.finBan=1}
  // solid barrier: colliders into the 40 m building grid (removed in RDS_drop)
  if(HUB.grid){for(const b of cols){for(let k=Math.floor((b.x-3)/40);k<=Math.floor((b.x+3)/40);k++)for(let j=Math.floor((b.z-3)/40);j<=Math.floor((b.z+3)/40);j++){const key=k*10000+j;let L=HUB.grid.get(key);if(!L)HUB.grid.set(key,L=[]);L.push(b)}}RDS.cols=cols;st.cols=cols.length}
  RDS.IX=IX;RDS.lines=lines;st.draws=draws;st.cells=RDS.cells.length;RDS_corridor();
  RO.grp.add(G);RDS.g=G;RDS_cull();RDS_warm(G);st.trafPre=(HUB.cars||[]).filter(c=>c&&!c.fake&&c.x!=null&&!(c.dead>0)&&RDS_inCor(c.x,c.z)).length;RDS_clear(true);return G}
// corridor: within (that segment's road half width + 8 m) of any course line (the GO judges + 6 m)
function RDS_corridor(){const N=HUB.nodes||[],far=[];for(let i=0;i<N.length;i+=3){const n=N[i];if(n&&n.nb&&n.nb.length&&!n.ab&&!RDS_inCor(n.x,n.z,30))far.push(i)}RDS.cor=1;RDS.far=far}
function RDS_inCor(x,z,pad=8){const I=RDS.IX;if(!I)return false;const n=I.near(x,z,-1);return n.d<n.hw+pad}
// move traffic / parked cars / pedestrians in the corridor to a node off the course, >= 250 m from the player (nothing is removed: the city fills back in)
function RDS_clear(force){if(!RDS.cor||!RDS.far||!RDS.far.length)return 0;const N=HUB.nodes,F=RDS.far;let n=0,t=0;const pick=()=>{for(let k=0;k<12;k++){const i=F[Math.floor(Math.random()*F.length)],q=N[i];if(Math.hypot(q.x-RO.x,q.z-RO.z)>250)return i}return F[Math.floor(Math.random()*F.length)]};
  for(let _k=0,_c=HUB.cars||[],c;_k<_c.length&&(c=_c[_k],true);_k++){if(!c||c.fake||c.x==null||c.dead>0||!RDS_inCor(c.x,c.z))continue;const i=pick(),q=N[i];
    Object.assign(c,{pk:0,tr:0,dz:0,route:null,ivx:null,CVv:null,CVfz:null,RDfz:null,a:i,b:q.nb[0],t:.1,x:q.x,z:q.z,v:6,cv:6});n++}
  try{for(let _k=0,_p=HUB.peds||[],p;_k<_p.length&&(p=_p[_k],true);_k++)if(p&&p.x!=null&&RDS_inCor(p.x,p.z)){pedPlace(p,250,500);if(RDS_inCor(p.x,p.z))pedPlace(p,250,500);t++}}catch(e){}
  RDS.moved=(RDS.moved||0)+n;RDS.pedMoved=(RDS.pedMoved||0)+t;return n}
// the grid holds until GO (gas is on by default on touch: the car crept 2 m during the countdown)
function RDS_hold(sp){if(sp.cd>0&&sp.rdHold){const H=sp.rdHold;RO.x=H.x;RO.z=H.z;RO.h=RO.vh=H.h;RO.v=0}}
function RDS_cull(){const c=camera.position;for(const k of RDS.cells)k.im.visible=Math.hypot(k.x-c.x,k.z-c.z)<RDS_VIS+k.r}
function RDS_lights(sp){const im=RDS.lamp;if(!im||!im.instanceColor)return;const cd=sp.cd||0,a=im.instanceColor.array;for(let i=0;i<5;i++){const on=cd<=0?2:(3-cd)>=i*.55?1:0,c=on===2?[.25,2.2,.5]:on?[2.4,.25,.15]:[.16,.16,.2];a[i*3]=c[0];a[i*3+1]=c[1];a[i*3+2]=c[2]}im.instanceColor.needsUpdate=true}
// link the 3 programs now (under the countdown), against the composer's linear target like TLL_warm (98bp): srgb-linear is part of the program key
function RDS_warm(G){const R=renderer,rt=R.getRenderTarget(),P=R.info.programs,n0=P.length;try{R.setRenderTarget(composer.readBuffer);R.compile(G,camera,scene);for(let j=n0;j<P.length;j++){try{P[j].getUniforms()}catch(e){}}}catch(e){}finally{R.setRenderTarget(rt)}RDS.warmN=P.length-n0;RDS.progs=P.length}
function RDS_drop(){for(const b of RDS.bans)if(b.parent)b.parent.remove(b);RDS.bans=[];const G=RDS.g;if(G){RO.grp.remove(G);G.traverse(m=>{if(m.isInstancedMesh)m.dispose()})}RDS.g=null;RDS.cells=[];RDS.lamp=null;RDS.cor=null;RDS.far=null;RDS.IX=null;
  if(RDS.cols.length&&HUB.grid){for(const[k,L]of HUB.grid)if(L.some(b=>b.rd))HUB.grid.set(k,L.filter(b=>!b.rd))}RDS.cols=[]}
if(RDS.on&&typeof tkStart==='function'){const _st=tkStart,_step=tkStep,_end=sprintEnd;
  tkStart=function(m,C0){const sp=_st.apply(this,arguments);try{if(sp&&sp.tk&&!(window.PROTO&&PROTO.g)){RDS_build(sp);sp.rd=1;try{say('3',(C0||sp.C).name.toUpperCase(),.9);AU.sfx('beep')}catch(e){}sp.rdHold={x:RO.x,z:RO.z,h:RO.h}}else RDS_drop()}catch(err){console.warn('racedress',err);try{RDS_drop()}catch(e){}}return sp};
  tkStep=function(dt){const sp=RO.sp,r=_step.apply(this,arguments);   // the countdown stays 3 s (tests time it): '3' + the race name at the start, then tkStep's own 2, 1, GO!
   
    try{if(RDS.g&&sp&&sp.rd){RDS_hold(sp);RDS_lights(sp);RDS_cull()}}catch(err){}return r};
  // after the traffic step (it also parks cars, LV_step): the corridor is cleared and the grid held at the end of every race frame
  {const _ht=hubTrafficStep;hubTrafficStep=function(dt){const r=_ht.apply(this,arguments);try{const sp=RO.sp;if(RDS.g&&sp&&sp.rd){RDS_hold(sp);RDS_clear()}}catch(err){}return r}}
  sprintEnd=function(){RDS_drop();return _end.apply(this,arguments)}}
