// PURPOSE: on-foot street look on phones: one world scale, portrait layout, 3-layer parallax, clip-safe popups, grouped HUD
// FLAG: streetlook (?streetlook=0)
// TEST: streetlook-test.js
/* ---------- STREETLOOK: the on-foot street, art-directed by numbers (owner, 21 Oct 2026, on an iPhone: the field used 65% of the screen, tiny actors, giant floating props, clipped popups).
   Flag RET.streetlook (default ON; ?streetlook=0 = the old look exactly: foot.js draws and lays out as before). Test: nightrun/streetlook-test.js (machine gate on the draw calls).
   One world scale K = 0.225 x visible field height / 64 (Kai standing): a standing character is >= 22% of the field on every screen. Gameplay boxes do not change: every actor, pickup, shot and effect
   is drawn K times bigger about its own spot, and heights above the road are drawn K times taller (compressed above D0 so flyers stay on screen), so a shot still leaves the gun and hits the chest.
   Props: the approved prop sheets only, <= 1.25 characters tall, bottom-centre on the road line; no flying or hanging props. The breakable sign placeholder stands on a plain pole.
   Portrait phones: the field fills everything above the controls (no dead band), road strip + progress bar sit right on the controls; the camera keeps Kai at 25% of a >= 330 unit wide view
   (0.75 x 330 - half bodies = 215 units = 0.83 s at 260 u/s, the fastest walker). Landscape and desktop keep their layout. Popups clamp inside the field, pickups fade out 24 units before the edge.
   Backdrop (no new art, ASSET-POLICY.md): placeholder flat layers labelled bg-street-sky / far (x0.12) / mid (x0.4) / road, prop sheets on the road (x1); real files replace them (ASSETS-NEEDED-STREET.md).
   Kai may walk back (camera eases back <= 35% of the view, not behind the section checkpoint); auto-fire turns Kai to a target behind. Poses without a sheet borrow the nearest act (art.js ART.FB).
   HUD: hearts / weapon / ammo / bombs / power-ups / fever in one panel top-left (14 px+ text), score + time left of the pause button, the hint under both. ---------- */
if(RET.fairstreet===undefined)RET.fairstreet=!/[?&]fairstreet=0/.test(location.search);   // W161: no hits from off-screen foes, a 1 s BEHIND warning, no code-drawn junk over props and pickups
if(RET.cam2===undefined)RET.cam2=!/[?&]cam2=0/.test(location.search);   // W164: the camera leads Kai (30-40% from the left) and the steam stands on fixed vents. W181: ON by default; ?cam2=0 = old
if(RET.occl===undefined)RET.occl=!/[?&]occl=0/.test(location.search);   // W182: a prop drawn in front of Kai (or a foe next to him) fades to 40% so he is never lost behind it; ?occl=0 = old
if(RET.pound2===undefined)RET.pound2=!/[?&]pound2=0/.test(location.search);   // W186: boss bar + progress bar in the HUD stack (see slHud); the boss pound/leap keep one depth line (streetboss.js)
if(RET.streetlook===undefined)RET.streetlook=!/[?&]streetlook=0/.test(location.search);
(function(){
if(!RET.streetlook||!window.FOOT||!FOOT._in)return;
const F=FOOT,IN=F._in,VH=540,FL=470,CH=64,DTOP=260,clamp=(v,a,b)=>v<a?a:v>b?b:v;
const SL=F.look={k:1,s:1,d0:150,t0:0,VV:VH,tag:'',port:false,road:0,speeds:{far:.12,mid:.4,near:1}};
const hs=n=>{n=Math.imul((n|0)^61,0x45d9f3b);n^=n>>>16;n=Math.imul(n,0x45d9f3b);return((n^(n>>>16))>>>0)/4294967296;};   // stable hash per cell

/* ----- portrait layout: controls packed into the smallest band that holds them (<= 4% margins), the field takes the rest ----- */
SL.layout=(L,W,H,dpr,T)=>{SL.port=false;F.camK=undefined;if(!(T&&H>W*1.05))return false;
  SL.port=true;F.camK=.25;const auto=F.autoOn(),big=auto?'jump':'fire';
  let Z=Math.max(184,H-Math.round(W*1.5));const f=clamp(Math.round(Z*.42),92,124),s=clamp(Math.round(Z*.27),60,80),stack=f+s+8;
  let mg=Math.max(10,Math.floor((Z-stack)/2));if(mg>H*.045){mg=Math.round(H*.04);Z=stack+2*mg;}
  const hf=H-Z;let sc=W/330;if(hf/sc>600)sc=hf/600;
  L.sc=sc;L.vw=W/sc;L.mode='port';L.box={x:0,y:0,w:W,h:hf};L.ox=0;L.oy=0;L.exl=0;L.exr=0;L.dpr=dpr;SL.VV=hf/sc;
  const cv=L.cv;cv.style.left='0px';cv.style.top='0px';cv.style.width=W+'px';cv.style.height=hf+'px';cv.width=Math.round(W*dpr);cv.height=Math.round(hf*dpr);
  const set=(el,x,y,z)=>{el.hidden=false;el.style.display='';el.style.left=Math.round(x)+'px';el.style.top=Math.round(y)+'px';if(z)el.style.width=el.style.height=Math.round(z)+'px';};
  const rows=auto?[['dash','jump'],['bomb','melee']]:[['dash','fire'],['bomb','melee','jump']],sz=k=>k===big?f:s,rh=rows.map(r=>Math.max(...r.map(sz)));
  let y=H-mg,minX=W;rows.forEach((r,i)=>{y-=rh[i];let x=W-14;for(let j=r.length-1;j>=0;j--){const z=sz(r[j]);x-=z;set(L.btn[r[j]],x,y+(rh[i]-z)/2,z);x-=8;}minX=Math.min(minX,x+8);y-=8;});
  const fb=L.btn.fire;if(auto){fb.hidden=true;fb.style.display='none';}
  const sk=clamp(Math.min(Z-2*mg,W*.38,minX-16-12),96,160);set(L.stick,16,hf+(Z-sk)/2,sk);
  const pb=L.root.querySelector('#fPause');pb.style.left=(W-52)+'px';pb.style.top='8px';return true;};

/* ----- walking back: the left wall is no longer the camera's furthest point; Kai may retreat while the camera eases back up to 35% of the view, never behind the
   current section's checkpoint (or the stage's mid checkpoint once passed) and never inside an arena lock or the boss arena ----- */
SL.back=(S,P,vw,want)=>{S._camHi=Math.max(S._camHi||0,S.camX);if(S.lock||S.bossOn)return want;
  let cp=0;if(F.SEC&&S.st===F.STAGES[F.main]){for(const q of F.SEC)if(q.x<=P.maxX)cp=q.x;}else if(S.st.cp&&P.maxX>S.st.cp)cp=S.st.cp;
  const floor=Math.max(0,S._camHi-.35*vw,cp-40);SL.floor=floor;
  return P.x-S.camX<vw*.15?Math.max(floor,Math.min(want,P.x-vw*.15)):want;};
/* ----- auto-fire facing: no stick input, nothing to shoot ahead, a target behind on screen = turn round (auto-fire then shoots it) ----- */
SL.face=(P,hit)=>{const S=F.S,vw=IN.L().vw;let ah=0,bh=0;for(const e of S.E){if(e.dead||!e.seen||!hit(e)||e.x<S.camX||e.x>S.camX+vw)continue;if((e.x-P.x)*P.facing>-20)ah=1;else bh=1;}
  if(!ah&&bh)P.facing=-P.facing;};

/* ----- the scale for this frame and the height map (world y -> drawn y; the road line and everything under it stay put) ----- */
function slFrame(L){const VV=SL.port?SL.VV:L.box.h/L.sc,K=Math.max(1,.225*VV/CH),t0=VH-VV,room=FL-t0-14-62*K;   // room: drawn height above the road a 58-unit flyer's feet may use
  SL.VV=VV;SL.k=K;SL.t0=t0;SL.d0=Math.min(150,room*.8/K);SL.s=clamp((room-K*SL.d0)/(DTOP-SL.d0),.25,K);SL.band=RET.belt?Math.round(.27*VV):0;SL.z=null;}   // W173 belt: the floor band is 27% of the view tall, its front edge on the old road line
const my=y=>{const d=FL-y;if(d<=0)return y;const K=SL.k,d0=SL.d0;return FL-(d<=d0?d*K:d0*K+(d-d0)*SL.s);};
SL.my=my;
const at=(c,x,y,k)=>{c.save();const z=SL.z;if(z!=null){k*=.9+.1*z;c.translate(x,my(y)-(1-z)*SL.band);}else c.translate(x,my(y));c.scale(k,k);c.translate(-x,-y);};   // belt: SL.z = depth of what is drawn (higher and up to 10% smaller further back)
const slSh=(c,o,K)=>{const z=o.z,s=(.9+.1*z)*K,air=o.fly?.5:clamp(1-(FL-o.y)/320,.45,1),w=clamp((o.w||28)*.7,16,70)*s*air;c.fillStyle='rgba(0,0,0,.38)';c.beginPath();c.ellipse(o.x,FL-(1-z)*SL.band,w,w*.26,0,0,6.283);c.fill();};   // belt: a floor shadow under every actor   // run the old drawing code for a body at (x,y): mapped and K times bigger about that spot

/* W182: the fade for a prop (1 = solid): 40% at once while Kai or a foe near him stands behind it on screen, easing back to solid after */
const slOcc=(p,AC,K)=>{const pk=K*(.9+.1*p.z),pb=my(p.y)-(1-p.z)*SL.band,pt=pb-p.h*pk;let hid=false;
  for(const a of AC){if(a.z>=p.z)continue;const ak=K*(.9+.1*a.z),yb=my(a.y)-(1-a.z)*SL.band;if(Math.abs(a.x-p.x)<(p.w*pk+(a.w>0?a.w:28)*ak)/2&&yb>pt&&yb-a.h*ak<pb){hid=true;break;}}
  p._oa=hid?.4:Math.min(1,(p._oa==null?1:p._oa)+.08);return p._oa;};
/* ----- backdrop tiles (built once per size): far skyline and mid buildings, drawn in world units, blitted with parallax ----- */
/* ----- backdrop: NO new art (ASSET-POLICY.md). Until the owner delivers the street layers (ASSETS-NEEDED-STREET.md) each layer is a PLACEHOLDER: plain flat rectangles in one tint
   with its asset id as the label. A real file foot/bg-street-<layer>.webp listed in ready.json replaces its placeholder (tiled, parallax kept). The old media/foot/bg-*.webp are mock placeholders: not used. ----- */
const BGL={far:['#140d2a','bg-street-far',960,.34,.44],mid:['#22163f','bg-street-mid',1280,.24,.36]};   // tint, asset id, tile width (units), min / extra height as a share of the sky
let tiles={};
function slTile(kind,Hh,res){const key=kind+'|'+Math.round(Hh)+'|'+res.toFixed(2)+'|'+(window.phText()?1:0);let o=tiles[key];if(o)return o;if(Object.keys(tiles).length>5)tiles={};
  const L_=BGL[kind],TW=L_[2],cv=document.createElement('canvas');cv.width=Math.ceil(TW*res);cv.height=Math.ceil(Hh*res);const g=cv.getContext('2d');g.scale(res,res);g.fillStyle=L_[0];
  let x=0,i=0;while(x<TW-30){const bw=Math.min(TW-x,(kind==='far'?60:150)+60*hs(i*7+3)),bh=Hh*(L_[3]+L_[4]*hs(i*13+5));g.fillRect(x,Hh-bh,bw-4,bh);x+=bw;i++;}
  g.fillStyle='rgba(255,255,255,.35)';g.font='bold 12px monospace';g.textAlign='left';g.textBaseline='bottom';if(window.phText())g.fillText(L_[1]+' (placeholder)',8,Hh-6);
  return tiles[key]={cv,TW,Hh};}
const pkPic=k=>'pk-'+(k==='dbl'?'damage':k.startsWith('w_')?'weapon-'+k.slice(2):k);
function slPic(id){const fa=window.FA;return fa&&fa._pic?fa._pic('foot/'+id+'.webp'):null;}
function slBlit(c,kind,k,cam,x0,w,t0,res){const pic=slPic(BGL[kind][1]),Hh=FL+2-t0;let src,TW;
  if(pic){TW=Hh*pic.width/pic.height;src=pic;}else{const o=slTile(kind,Hh,res);src=o.cv;TW=o.TW;}
  const off=cam*k;let x=x0-((off%TW)+TW)%TW;SL.tag='L-'+kind;for(;x<x0+w;x+=TW)c.drawImage(src,x,t0,TW,Hh);SL.tag='';}

/* ----- near layer (x1, on the road): the approved prop sheets only, each <= 1.25 characters tall, bottom on the road ----- */
const PROPS=[['car',.62],['police',.72],['holo',1.15],['beacon',.95],['steam',.9]];   // [sheet, height in characters]
/* W164 (RET.cam2): steam rises from fixed street vents, one per 1100 units on the road line (every vent is always drawn while on screen, so nothing pops), 1.7 characters tall;
   only the sheet frames holding >= 60% of the fullest frame's pixels are used (ping-pong), so the plume never fades to almost nothing. */
const PROPS4=PROPS.filter(q=>q[0]!=='steam'),STEAM='prop-steam/glow',SV={cell:1100,h:1.7};let steamSeq=null;
function steamFrames(){if(steamSeq)return steamSeq;const o=ART.aS&&ART.aS(STEAM),im=o&&ART.anim(STEAM);if(!o||!im||!im.width)return null;const n=o.m[0],w=o.m[2],h=o.m[3],cv=document.createElement('canvas');cv.width=im.width;cv.height=h;const g=cv.getContext('2d');g.drawImage(im,0,0);
  const cov=[];for(let i=0;i<n;i++){const d=g.getImageData(i*w,0,w,h).data;let k=0;for(let j=3;j<d.length;j+=4)if(d[j]>16)k++;cov.push(k);}
  const mx=Math.max(...cov),ok=[];for(let i=0;i<n;i++)if(cov[i]>=.6*mx)ok.push(i);const seq=ok.slice();for(let i=ok.length-2;i>0;i--)seq.push(ok[i]);   // up, then back down
  return steamSeq={seq,cov,t:seq.map(i=>i?o.cum[i-1]:0),fps:o.m[1]};}
SL.steam=(c,cam,x0,w,fl,t)=>{const C=CH*SL.k,m=ART.ANIM.s[STEAM],sf=steamFrames();if(!m||!sf)return;const h=SV.h*C,i0=Math.floor((cam+x0)/SV.cell)-1,i1=Math.ceil((cam+x0+w)/SV.cell)+1,fi=Math.floor(t*sf.fps)%sf.seq.length;
  for(let i=i0;i<=i1;i++){const px=i*SV.cell-cam+SV.cell*(.3+.4*hs(i*5+11)),k=(fi+i+4*sf.seq.length)%sf.seq.length;SL.tag='prop';SL.steamLast={x:px,frame:sf.seq[k],cov:sf.cov[sf.seq[k]],vent:i};ART.drawAnim(c,STEAM,sf.t[k],px,fl-h*.5+.03*h,h/m[3],false,.95);SL.tag='';}};
if(typeof ART!=='undefined')ART.footProps=(c,cam,w,fl,t)=>{if(!RET.sprites||!ART.drawAnim)return;const C=CH*SL.k,x0=SL.x0||0,cell=400,i0=Math.floor((cam+x0)/cell)-1,i1=Math.ceil((cam+x0+w)/cell)+1;
  for(let i=i0;i<=i1;i++){const r=hs(i*41+7),px=i*cell-cam+cell*(.2+.6*hs(i*5+1));if(r>.58)continue;
    const PL=RET.cam2?PROPS4:PROPS,q=PL[Math.floor(hs(i*97+3)*PL.length)],k='prop-'+q[0]+'/'+(q[0]==='steam'?'glow':'loop'),m=ART.ANIM.s[k];if(!m||!ART.anim(k))continue;
    const h=q[1]*C;SL.tag='prop';ART.drawAnim(c,k,t+i*.37,px,fl-h/2,h/m[3],false,.95);SL.tag='';}
  if(RET.cam2)SL.steam(c,cam,x0,w,fl,t);};   // prop sheets are centre-anchored (build.py): centre = road - h/2 puts the bottom row on the road

/* ----- painted street (22 Oct 2026): foot/bg-sky|far|mid|near|floor, 2048x1024 each, used only when all five are loaded (else the placeholders below). Same convention as footart.js FA.bg: the picture's street line is 80% down,
   scaled so that line lands on the road line FL (top of the picture at the top of the visible sky), tiles are 2:1 and repeat sideways. Sky is opaque and almost fixed, the others scroll slower the further away they are,
   the floor (rows 720-1023, transparent above) moves with the road. Draw order: sky, far, mid, near, floor, then props and actors. ----- */
const PLY=['sky','far','mid','near','floor'],PSP={sky:.02,far:.12,mid:.4,near:.7,floor:1};
SL.paint=0;
function slPainted(c,x0,w,cam,t0){const P={};for(const l of PLY){const q=slPic('bg-'+l);if(!q||!q.width)return false;P[l]=q;}
  const FR=FL-(SL.band||0),DH=(FR-t0)/.8,TW=2*DH,tile=(l,y,h,sy,sh)=>{const off=cam*PSP[l];let x=x0-((off%TW)+TW)%TW;SL.tag='L-'+l;for(;x<x0+w;x+=TW)c.drawImage(P[l],0,sy,P[l].width,sh,x,y,TW+1,h);SL.tag='';};
  const H=P.sky.height;tile('sky',t0-4,FR-t0+8,0,RET.artfix?Math.min(H,Math.round(H*(FR-t0+8)/DH)):H);/* artfix: the sky keeps its own aspect (only the rows above the street line, not the whole picture squeezed into them) */for(const l of ['far','mid','near'])tile(l,t0,DH,0,P[l].height);
  const DF=Math.max(DH,(VH+2-FR)/.2),fy=FR-.8*DF,r0=.69;tile('floor',fy+r0*DF,(1-r0)*DF,Math.round(r0*P.floor.height),P.floor.height-Math.round(r0*P.floor.height));   // only the floor rows (the top of the picture is transparent)
  SL.paint=1;return true;}
function slBackdrop(c,S,vw,exl,exr,t0,res){const x0=-exl,w=vw+exl+exr,cam=S.camX,FR=FL-(SL.band||0),fh=FR-t0;
  if(slPainted(c,x0,w,cam,t0)){SL.x0=x0;if(typeof ART!=='undefined'&&ART.footProps)ART.footProps(c,cam,w,FR,S.time);return;}SL.paint=0;
  const sky=slPic('bg-street-sky');if(sky)c.drawImage(sky,x0,t0-4,w,fh+8);else{c.fillStyle='#0c0820';c.fillRect(x0,t0-4,w,fh+8);if(window.phText()){c.fillStyle='rgba(255,255,255,.35)';c.font='bold 12px monospace';c.textAlign='right';c.textBaseline='top';c.fillText('bg-street-sky (placeholder)',x0+w-8,t0+fh*.35);}}
  slBlit(c,'far',SL.speeds.far,cam,x0,w,t0,res);slBlit(c,'mid',SL.speeds.mid,cam,x0,w,t0,res);
  const rd=slPic('bg-street-road');if(rd){const TW=(VH-FL)*rd.width/rd.height;let x=x0-((cam%TW)+TW)%TW;for(;x<x0+w;x+=TW)c.drawImage(rd,x,FR,TW,VH-FR+2);}
  else{c.fillStyle='#1b1530';c.fillRect(x0,FR,w,VH-FR+2);c.fillStyle='#3a2a60';c.fillRect(x0,FR,w,3);}
  SL.x0=x0;if(typeof ART!=='undefined'&&ART.footProps)ART.footProps(c,cam,w,FR,S.time);}

/* ----- the frame ----- */
SL.draw=c=>{const L=IN.L(),S=F.S;if(!L||!S)return false;slFrame(L);
  const K=SL.k,t0=SL.t0,dpr=L.dpr||1,sc=L.sc*dpr,vw=L.vw,exl=L.exl||0,exr=L.exr||0,P=S.P,u=1/L.sc;
  c.setTransform(1,0,0,1,0,0);c.fillStyle='#05030c';c.fillRect(0,0,L.cv.width,L.cv.height);
  c.setTransform(sc,0,0,sc,(L.box.x-L.ox)*dpr,(L.box.y-L.oy)*dpr-t0*sc);
  const sh=S.shake?IN.ftRnd(-S.shake,S.shake)*.5:0;SL.road=L.box.y+(FL+sh*.5-t0)*L.sc;SL.cam=S.camX;
  c.save();c.translate(sh,sh*.5);slBackdrop(c,S,vw,exl,exr,t0,Math.min(2,sc));
  c.translate(-S.camX,0);const lo=S.camX-exl,hi=S.camX+vw+exr;
  if(!RET.belt)for(const [px,py,pw] of S.st.plats){const y=my(py);c.fillStyle='#3a2a52';c.fillRect(px,y,pw,10);c.fillStyle='#19e3ff';c.fillRect(px,y,pw,2);}
  if(S.cp==null&&S.st.cp){c.fillStyle='#19e3ff55';c.fillRect(S.st.cp-2,FL-1.2*CH*K,4,1.2*CH*K);c.fillStyle='#19e3ff';c.fillRect(S.st.cp-2,FL-1.2*CH*K,22,12);}
  const dP=p=>{if(p.hp<=0&&!p.fl)return;SL.z=p.z;if(p.draw){try{if(p.draw(c,K,at))return;}catch(x){}}const hd=Math.min(p.h,1.25*CH),up=p.y<FL-1;   // street2: props with their own picture
    if(up){const y=my(p.y);c.fillStyle='#1d1834';c.fillRect(p.x-3*K,y,6*K,FL-y);c.fillRect(p.x-12*K,FL-4*K,24*K,4*K);}   // a sign stands on its pole
    at(c,p.x,p.y,K);SL.tag='bprop';c.fillStyle=p.fl>0?'#fff':p.c;c.fillRect(p.x-p.w/2,p.y-hd,p.w,hd);SL.tag='';c.strokeStyle='#ffffff55';c.lineWidth=2;c.strokeRect(p.x-p.w/2+2,p.y-hd+2,p.w-4,hd-4);c.restore();};   // belt: props are drawn inside the depth sort below (W180)
  if(!SL.band)for(const p of S.pr)dP(p);SL.z=null;
  const PK=F.PICKUPS;
  for(const p of S.pk){const d=PK[p.k];if(!d)continue;const bob=Math.sin(p.t*5)*3,r=17*K,sx=p.x,edge=Math.min(sx-r-lo,hi-sx-r),fa=clamp((edge-6)/24,0,1);if(fa<=0)continue;
    const y=p.y+bob,Y=Math.max(my(y),t0+4+r);   // never above the top edge
    const ga=(p.t>13?.5+.5*Math.sin(p.t*20):1)*fa,pz=p.z!=null&&SL.band?p.z:1;c.save();c.translate(p.x,Y-(1-pz)*SL.band);c.scale(K*(.9+.1*pz),K*(.9+.1*pz));c.translate(-p.x,-y);c.globalAlpha=ga;SL.tag='pk';
    if(p.k==='ammo'&&RET.sprites&&typeof ART!=='undefined'&&ART.ANIM.c['pk-ammo/spin']&&ART.anim('pk-ammo/spin'))ART.drawAnim(c,'pk-ammo/spin',p.t,p.x,y,32/ART.ANIM.c['pk-ammo/spin'].bw,false);
    else if(RET.fairstreet&&(()=>{const q=slPic(pkPic(p.k));if(!q||!q.width)return false;const h=40,w=h*q.width/q.height;c.drawImage(q,p.x-w/2,y-h/2-4,w,h);return true;})()){if(!RET.pound2){c.fillStyle=d.c;c.font='bold 11px monospace';c.textAlign='center';c.textBaseline='top';c.fillText(d.n,p.x,y+18);}}   // owner 23 Oct 2026: a sheet picture with its name under it, no flat disc
    else if(RET.fairstreet){c.fillStyle=d.c;c.font='bold '+(RET.pound2?22:13)+'px monospace';c.textAlign='center';c.textBaseline='middle';c.fillText(RET.pound2?d.ic:d.n,p.x,y);}   // picture not loaded yet: the name alone
    else{c.fillStyle=d.c;c.beginPath();c.arc(p.x,y,15,0,6.283);c.fill();c.fillStyle='#05030c';c.font='bold 15px monospace';c.textAlign='center';c.textBaseline='middle';c.fillText(d.ic,p.x,y+1);}
    SL.tag='';c.globalAlpha=1;c.restore();}
  const dE=e=>{if(e.dead&&!(e.ext&&!e.remove))return;const ex=e.h*K*.7;if(e.x-ex>hi||e.x+ex<lo)return;SL.z=e.z;   // fully off screen: nothing to draw (a shape fallback's label would hang past the edge)
    const pose=e.dead?'die':(()=>{try{return e.def.pose?e.def.pose(e):'idle';}catch(x){return'idle';}})(),ey=e.ext&&e.fly?e.y+e.h/2:e.y;
    at(c,e.x,ey,K);
    if(e.tele>0){c.fillStyle='#ff304a';c.globalAlpha=RET.footrun?.55:.35+.35*Math.sin(S.time*30);c.beginPath();c.arc(e.x+e.facing*e.w*.4,e.y-e.h*.62,10+e.w*.1,0,6.283);c.fill();c.globalAlpha=1;}   // footrun: one steady glow while it winds up, no pulse
    if(e.wind>0){c.strokeStyle='#ff304a';c.lineWidth=3;c.strokeRect(e.x-e.w/2-4,e.y-e.h-4,e.w+8,e.h+8);}
    c.globalAlpha=1;   /* owner 23 Oct 2026 "all enemies are transparent": foes died inside their 0.9 s grace and were only ever drawn at .65; always solid now */
    ART.fE=e;SL.tag='actor';IN.drawWho(c,e.id,pose,e.x,ey,e.h,e.facing<0,e.dead?e.dt_||0:e.t,e.flash>0?'#ffffff':(e.def.c||'#d04'));ART.fE=null;SL.tag='';c.globalAlpha=1;
    if(e.def.front&&e.def.fb){c.fillStyle='#a0c0ff';c.fillRect(e.x+e.facing*e.w*.5-3,e.y-e.h*.9,6,e.h*.8);}c.restore();SL.z=null;};
  if(!SL.band)for(const e of S.E)dE(e);
  if(S.st.hook&&S.st.hook.draw){const sw=[];for(const e of S.E)if(e.lane&&!e.dead){const y0=e.lane.y;sw.push([e.lane,y0]);e.lane.y=FL-(FL-my(y0+30))/K-30;}   // lanes: drawn under a plain K stretch, so pre-map their height
    const ft=c.fillText;c.fillText=function(s_,x,y,mw){c.save();c.translate(x,y);c.scale(1,1/K);ft.call(c,s_,0,0,mw);c.restore();};   // no stretched letters
    c.save();c.translate(0,FL);c.scale(1,K);c.translate(0,-FL);try{S.st.hook.draw(c,S);}catch(x){}c.restore();delete c.fillText;for(const [l,y0] of sw)l.y=y0;}
  const dK=()=>{const blink=P.inv>0&&Math.floor(S.time*16)%2;if(!blink||P.hp<=0){SL.z=P.z;at(c,P.x,P.y,K);
    if(P.pw.shield){c.strokeStyle='#5ad1ff';c.lineWidth=2+P.pw.shield.lv;c.beginPath();c.arc(P.x,P.y-34,44,0,6.283);c.stroke();}
    if(P.dashIF>0){c.fillStyle='#19e3ff33';c.fillRect(P.x-24-P.facing*20,P.y-60,48,58);}
    P._xa=IN.kaiX(P);ART.fE=P;IN.drawWho(c,'kai',IN.ppose(P),P.x,P.y,P.crouch?44:P.h,P.facing<0,S.time,S.feverT>0?'#ffd23a':'#19e3ff',P.crouch);ART.fE=null;
    if(P.shotT>0){const a=P.aim,mq=F.mzAt&&F.mzAt(P),mx=mq?mq[0]:P.x+Math.cos(a)*28,mY=mq?mq[1]:P.y-(P.crouch?26:44)+Math.sin(a)*20;if(!(window.AH&&AH.ftMuz(c,P.w,mx,mY,a))&&F.WEAPONS[P.w].kind!=='arc'){c.fillStyle='#fff';c.beginPath();c.arc(mx,mY,5,0,6.283);c.fill();}}c.restore();SL.z=null;}};
  if(SL.band){const A=S.E.filter(e=>e.z!=null&&!(e.dead&&!(e.ext&&!e.remove)));A.push(P);const PS=new Set();for(const p of S.pr)if(p.z!=null){A.push(p);PS.add(p);}A.sort((a,b)=>a.z-b.z);const AC=RET.occl?A.filter(a=>a===P||(!PS.has(a)&&Math.abs(a.x-P.x)<300)):[];for(const a of A){if(PS.has(a)){c.globalAlpha=slOcc(a,AC,K);dP(a);c.globalAlpha=1;SL.z=null;continue;}if(!a.dead&&a.x>lo-80&&a.x<hi+80)slSh(c,a,K);a===P?dK():dE(a);}}   // belt: back to front every frame, shadow first
  else dK();
  for(const b of S.pb){SL.z=b.z;at(c,b.x,b.y,K);if(window.AH&&AH.ftBul(c,b)){c.restore();continue;}c.fillStyle=b.c;if(b.kind==='fire'){c.globalAlpha=Math.max(0,b.life*2);c.beginPath();c.arc(b.x,b.y,b.r,0,6.283);c.fill();c.globalAlpha=1;}else if(b.kind==='rkt'){c.fillRect(b.x-8,b.y-3,16,6);}else{c.fillRect(b.x-6,b.y-2,12,4);}c.restore();}
  for(const g of S.bombsL){SL.z=g.z;at(c,g.x,g.y,K);if(window.AH&&AH.ftDraw(c,'fx-ft-grenade',g.x,g.y,22,S.time*7)){c.restore();continue;}c.fillStyle='#ffb020';c.beginPath();c.arc(g.x,g.y,7,0,6.283);c.fill();c.restore();}
  for(const b of S.eb){SL.z=b.z;at(c,b.x,b.y,K);if(RET.read&&window.READ)READ.footEb(c,b);else{c.fillStyle=b.c;c.beginPath();c.arc(b.x,b.y,b.r,0,6.283);c.fill();c.fillStyle='#fff';c.beginPath();c.arc(b.x,b.y,b.r*.45,0,6.283);c.fill();}c.restore();}
  SL.z=null;for(const f of S.fx){c.globalAlpha=Math.min(1,f.l*3);if(SL.band){if(f.z===undefined){let bz=null,bd=1e9;for(const a of S.E.concat([P]))if(a.z!=null){const d=Math.abs(a.x-f.x)+Math.abs(a.y-a.h/2-f.y);if(d<bd){bd=d;bz=a.z;}}f.z=bz;}SL.z=f.z;}   // belt: a spark sits at the depth of the actor it came from
    if(f.pic&&window.AH){at(c,f.x,f.y,K);AH.ftFx(c,f);c.restore();continue;}
    if(f.arc&&window.AH&&AH.ftArc(c,Object.assign({},f,{arc:f.arc.map(([x,y])=>[x,my(y)])}))){}else if(f.arc){c.strokeStyle=f.c;c.lineWidth=3*K;c.beginPath();f.arc.forEach(([x,y],i)=>{const j=i?IN.ftRnd(-6,6):0;i?c.lineTo(x+j,my(y)+j):c.moveTo(x,my(y));});c.stroke();}
    else{at(c,f.x,f.y,K);if(f.slash){c.strokeStyle=f.c;c.lineWidth=4;c.beginPath();c.arc(f.x,f.y,f.w*.5,-1.2,1.2);c.stroke();}
      else if(f.ring){c.strokeStyle=f.c;c.lineWidth=4;c.beginPath();c.arc(f.x,f.y,f.r*(1-f.l/f.m*.6),0,6.283);c.stroke();}
      else{c.fillStyle=f.c;c.fillRect(f.x-f.r/2,f.y-f.r/2,f.r,f.r);}c.restore();}}c.globalAlpha=1;SL.z=null;
  const fs=n=>Math.max(14,n)*u,ptop=t0+(SL.hudB||100*u)+4*u;c.textAlign='center';c.textBaseline='alphabetic';SL.tag='pop';
  for(const p of S.pop){c.font='bold '+fs(p.big?17:15)+'px monospace';const tw=c.measureText(p.t).width,fh=fs(p.big?17:15),pl=S.camX+tw/2+8*u,pr=S.camX+vw-tw/2-8*u;   // inside the field, under the HUD
    c.globalAlpha=Math.min(1,p.l/p.m*2.5);c.fillStyle=p.c;c.fillText(p.t,pl>pr?S.camX+vw/2:clamp(p.x,pl,pr),Math.max(ptop+fh,Math.min(VH-8*u,my(p.y))));}c.globalAlpha=1;SL.tag='';
  c.restore();slHud(c,L,S,vw,u,fs);return true;};

/* ----- HUD: one panel top-left; score + time left of the pause button; hint below both; boss bar above the progress bar ----- */
function slRR(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();}
function slHud(c,L,S,vw,u,fs){const P=S.P,t0=SL.t0,hb=[],box=(x,y,w,h)=>hb.push({x,y:y-t0,w,h}),m=10*u,pl=!!(typeof UIK!=='undefined'&&ART.bm&&ART.bm['ui-hud-mult']),pd=(pl?13:8)*u,W=F.WEAPONS[P.w],PK=F.PICKUPS;SL.tag='hud';
  c.textBaseline='top';c.textAlign='left';c.font='bold '+fs(14)+'px monospace';
  const wt=W.n+(P.w==='pistol'?'':' LV'+P.lv+' · '+P.ammo),pw=[];for(const k of IN.PW_KEYS){const p=P.pw[k];if(p)pw.push([PK[k].c,PK[k].ic+(PK[k].max>1?p.lv:'')]);}
  const bt='●×'+P.bombs,r3=c.measureText(bt).width+pw.length*36*u;
  const iw=Math.max(P.max*20*u,c.measureText(wt).width,r3,110*u),pw_=iw+2*pd,ph=pd+16*u+6*u+16*u+6*u+16*u+8*u+5*u+pd,x=m,y=t0+m;
  if(pl)UIK.plate(c,'ui-hud-mult',x,y,pw_,ph,20,12*u,33,125);   // tidy: the fly HUD's own plate (same dark fill + painted frame)
  else{c.fillStyle='rgba(5,3,12,.62)';slRR(c,x,y,pw_,ph,8*u);c.fill();c.strokeStyle='rgba(255,255,255,.12)';c.lineWidth=u;c.stroke();}
  for(let i=0;i<P.max;i++){c.fillStyle=i<P.hp?'#ff4060':'#ffffff26';c.beginPath();c.arc(x+pd+8*u+i*20*u,y+pd+8*u,7.5*u,0,6.283);c.fill();}
  let ry=y+pd+22*u;c.fillStyle=W.c;c.fillText(wt,x+pd,ry);ry+=22*u;
  c.fillStyle='#ffb020';c.fillText(bt,x+pd,ry);let px=x+pd+c.measureText(bt).width+14*u;for(const [col,t] of pw){c.fillStyle=col;c.fillText(t,px,ry);px+=36*u;}ry+=24*u;
  c.fillStyle='#ffffff1c';c.fillRect(x+pd,ry,iw,5*u);c.fillStyle=S.feverT>0?'#ffd23a':'#ff2d95';c.fillRect(x+pd,ry,iw*clamp(S.feverT>0?S.feverT/8:S.fever/100,0,1),5*u);
  box(x,y,pw_,ph);
  c.textAlign='right';c.font='bold '+fs(16)+'px monospace';const st=String(S.score),tt=IN.fmtT(S.time),sw=Math.max(c.measureText(st).width,c.measureText(tt).width);
  let sr=vw-60*u,sy=t0+m+2*u;if(x+pw_+10*u>sr-sw){sr=vw-10*u;sy=t0+60*u;}   // narrow screen: under the pause button
  c.fillStyle='#fff';c.fillText(st,sr,sy);c.font='bold '+fs(14)+'px monospace';c.fillStyle='#c9c3e6';c.fillText(tt,sr,sy+20*u);box(sr-sw,sy,sw,38*u);
  const hudB=Math.max(y+ph,sy+38*u)-t0;SL.hudB=hudB+8*u;SL.hudFull=hudB+42*u;   // hudFull: the band with the hint line (tidy keeps flyers under it)
  if(!RET.pound2&&S.boss&&!S.boss.dead){const bw=vw*.7,bx=vw*.15,by=VH-48*u;c.fillStyle='#ffffff22';c.fillRect(bx,by,bw,10*u);c.fillStyle='#ff2050';c.fillRect(bx,by,bw*Math.max(0,S.boss.hp/S.boss.max),10*u);
    c.textAlign='center';c.fillStyle='#fff';c.textBaseline='bottom';c.font='bold '+fs(14)+'px monospace';c.fillText(S.boss.bname||'WARDEN',vw/2,by-2*u);box(bx,by-18*u,bw,28*u);}
  c.textAlign='center';c.textBaseline='top';let hint=null;const line=S.note.t>0?S.note.txt:IN.hintOn()?IN.hintText():'';
  if(line){c.font='bold '+fs(16)+'px monospace';const tw=Math.min(c.measureText(line).width,vw-40*u),hy=t0+hudB+8*u;c.fillStyle='#000b';c.fillRect(vw/2-tw/2-8*u,hy,tw+16*u,26*u);c.fillStyle='#fff';c.fillText(line,vw/2,hy+4*u,vw-40*u);hint={x:vw/2-tw/2-8*u,y:hy-t0,w:tw+16*u,h:26*u};SL.hudB=hudB+42*u;}
  if(RET.fairstreet&&S.behind&&S.time<S.behind.until){const fy=(SL.t0+VH)/2,a=.55+.45*Math.sin(S.time*14);c.globalAlpha=a;c.textAlign='left';c.textBaseline='middle';c.fillStyle='#ffb020';
    c.font='bold '+fs(34)+'px monospace';c.fillText('◀',6*u,fy);c.font='bold '+fs(14)+'px monospace';c.fillText('BEHIND',6*u+30*u,fy-8*u);c.fillText('foe arriving from the left',6*u+30*u,fy+9*u);c.globalAlpha=1;}   // W161: 1 s warning at the edge a foe comes from
  SL.tag='';
  if(RET.pound2){   // W186 (?pound2=1 = on; OFF until its gates pass): boss bar and run-progress bar sit in the HUD stack under the hint line, never on the floor band (they used to cover the front depth)
    const by=t0+SL.hudB,bossOn=S.boss&&!S.boss.dead;
    if(bossOn){const bw=vw*.7,bx=vw*.15;c.fillStyle='#ffffff22';c.fillRect(bx,by+18*u,bw,10*u);c.fillStyle='#ff2050';c.fillRect(bx,by+18*u,bw*Math.max(0,S.boss.hp/S.boss.max),10*u);
      c.textAlign='center';c.fillStyle='#fff';c.textBaseline='top';c.font='bold '+fs(14)+'px monospace';c.fillText(S.boss.bname||'WARDEN',vw/2,by,vw-20*u);box(bx,by-t0,bw,30*u);SL.hudB+=34*u;}
    else if(S.st.hook&&S.st.hook.hud){const dy=by+10*u-(VH-14*u);c.save();c.translate(0,dy);try{S.st.hook.hud(c,vw,u,(x,y,w,h)=>box(x,y+dy,w,h),fs,S);}catch(x){}c.restore();SL.hudB+=24*u;}}
  else if(S.st.hook&&S.st.hook.hud)try{S.st.hook.hud(c,vw,u,box,fs,S);}catch(x){}
  L.hud={hud:hb,hint,vw};IN.ghost();}
})();
