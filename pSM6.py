# pSM6: the minimap streams too (seamless Athens only). Instead of painting the whole 10 x 10 km city (71k buildings, every street)
# into one canvas plus a world canvas at load (9 s here), MINI is a 13 x 13 window of 250 m tiles around the car at the old district
# resolution (0.34 px/m). Tiles are painted by the game's own miniPaint with HUB.bld / CITY_S / LAZY narrowed to the tile, nearest
# first, one tile per frame; when the car is 2 tiles off-centre the window recentres (old pixels are copied, new tiles queued).
exec(open('P.py').read())
R("async function SM_qvLoad(a,b){","""const SMM={T:250,N:13,q:[],have:new Set(),st:{tiles:0,max:0,ms:0,shift:0}};
function SMM_grids(){if(SMM.bg)return;const K=(x,z)=>Math.floor(x/250)*100000+Math.floor(z/250),G=new Map(),S=new Map();
  for(const b of HUB.bld){const k=K(b.x,b.z);let L=G.get(k);if(!L)G.set(k,L=[]);L.push(b)}
  for(const s of CITY_S){const ks=new Set();for(const p of s.pts)ks.add(K(p.x,p.z));for(const k of ks){let L=S.get(k);if(!L)S.set(k,L=[]);L.push(s)}}SMM.bg=G;SMM.sg=S}
function SMM_tile(tx,tz){const T=SMM.T,x0=tx*T,x1=x0+T,z0=tz*T,z1=z0+T,m=60,B=[],Ss=new Set();
  for(let a=Math.floor((x0-m)/250);a<=Math.floor((x1+m)/250);a++)for(let c=Math.floor((z0-m)/250);c<=Math.floor((z1+m)/250);c++){const k=a*100000+c,L=SMM.bg.get(k),Q=SMM.sg.get(k);if(L)for(const b of L)B.push(b);if(Q)for(const s of Q)Ss.add(s)}
  for(const L of LAZY){const r=L.rect;if(r[1]<x0-m||r[0]>x1+m||r[3]<z0-m||r[2]>z1+m)continue;for(const b of L.bld)if(b.x>x0-m&&b.x<x1+m&&b.z>z0-m&&b.z<z1+m)B.push(b)}
  const sb=HUB.bld,sl=LAZY.splice(0),ss=CITY_S.splice(0,CITY_S.length,...Ss),sh=TR_shade;HUB.bld=B;TR_shade=SMM_shade;let t;
  try{t=miniPaint(x0,x1,z0,z1,SMM.k)}finally{HUB.bld=sb;LAZY.push(...sl);CITY_S.splice(0,CITY_S.length,...ss);TR_shade=sh}
  // canvas pixel of world (x,z) = ((MINI.x1-x)*k, (MINI.z1-z)*k)
  MINI.c.getContext('2d').drawImage(t.c,Math.round((MINI.x1-x1)*SMM.k),Math.round((MINI.z1-z1)*SMM.k));SMM.have.add(tx+'|'+tz);SMM.st.tiles++}
// tile relief: same hillshade as TR_shade, sampled from the terrain raster (TR_G) instead of the road-shelf ground (7k shelf queries per tile)
function SMM_shade(c,x1,z1,k){const W=c.width,H=c.height,st=4,sw=Math.ceil(W/st),sh=Math.ceil(H/st),[c2,g2]=cv(sw,sh),im=g2.createImageData(sw,sh),d=im.data,cs=st/k,L=[.55,.64,-.55],ll=Math.hypot(...L);
  for(let j=0;j<sh;j++)for(let i=0;i<sw;i++){const x=x1-(i+.5)*cs,z=z1-(j+.5)*cs,hx=(TR_G(x-cs,z)-TR_G(x+cs,z))/(2*cs),hz=(TR_G(x,z-cs)-TR_G(x,z+cs))/(2*cs),nl=Math.hypot(hx,1,hz),
      l=(-hx*L[0]+L[1]-hz*L[2])/(nl*ll)-L[1]/ll,o=(j*sw+i)*4;if(l<0){d[o]=d[o+1]=d[o+2]=30;d[o+3]=Math.min(95,-l*300)}else{d[o]=d[o+1]=d[o+2]=255;d[o+3]=Math.min(55,l*180)}}
  g2.putImageData(im,0,0);const g=c.getContext('2d');g.save();g.imageSmoothingEnabled=true;g.drawImage(c2,0,0,W,H);g.restore()}
function SMM_center(x,z){const T=SMM.T,h=SMM.N>>1,tx=Math.floor(x/T),tz=Math.floor(z/T),k=SMM.k,W=Math.round(SMM.N*T*k);
  const c=document.createElement('canvas');c.width=c.height=W;const g=c.getContext('2d');g.fillStyle=CCF.gnd;g.fillRect(0,0,W,W);
  const x1=(tx+h+1)*T,z1=(tz+h+1)*T;if(MINI&&MINI.smm){g.drawImage(MINI.c,Math.round((x1-MINI.x1)*k),Math.round((z1-MINI.z1)*k));SMM.st.shift++}
  const old=SMM.have;SMM.have=new Set();SMM.q=[];for(let a=tx-h;a<=tx+h;a++)for(let b=tz-h;b<=tz+h;b++){const key=a+'|'+b;if(old.has(key))SMM.have.add(key);else SMM.q.push([a,b])}
  SMM.q.sort((p,q)=>Math.hypot(p[0]-tx,p[1]-tz)-Math.hypot(q[0]-tx,q[1]-tz));SMM.ct=[tx,tz];MINI={c,k,x1,z1,w:null,smm:1};return MINI}
function SMM_tick(budget){if(!MINI||!MINI.smm)return;const tx=Math.floor(RO.x/SMM.T),tz=Math.floor(RO.z/SMM.T);if(Math.abs(tx-SMM.ct[0])>1||Math.abs(tz-SMM.ct[1])>1)SMM_center(RO.x,RO.z);
  const t0=performance.now();while(SMM.q.length){const[a,b]=SMM.q.shift();const t1=performance.now();SMM_tile(a,b);const d=performance.now()-t1;SMM.st.ms+=d;if(d>SMM.st.max)SMM.st.max=d;if(performance.now()-t0>(budget||4))break}}
miniBase=(f=>function(){if(!SM_ON)return f();SMM_grids();SMM.k=SET.q==='low'?.25:.34;MINI=null;SMM_center(RO.x,RO.z);return MINI})(miniBase);
miniDraw=(f=>function(){if(SM_ON&&MINI&&MINI.smm&&RO.on&&!(HUB.mf&1))SMM_tick(4);return f()})(miniDraw);
async function SM_qvLoad(a,b){""")
# the loader only buckets buildings / streets; the window paints from the first frames on (centre tiles first)
R("try{if(!MINI&&HUB.built){const t1=performance.now();MINI=miniBase();SM3.miniMs=Math.round(performance.now()-t1)}}catch(e){}}",
  "try{if(HUB.built&&SM_ON){const t1=performance.now();SMM_grids();SM3.miniMs=Math.round(performance.now()-t1)}else if(!MINI&&HUB.built){const t1=performance.now();MINI=miniBase();SM3.miniMs=Math.round(performance.now()-t1)}}catch(e){console.error(e)}}")
# one-map Athens: the window canvas is always the one to draw
R("inC=RO.x-HX0>rr&&HX1-RO.x>rr&&RO.z-HZT>rr&&HZN-RO.z>rr;","inC=SM_ON||RO.x-HX0>rr&&HX1-RO.x>rr&&RO.z-HZT>rr&&HZN-RO.z>rr;")
# full map: zoom steps stay district-sized (2.2 km = the old A box) instead of fitting the whole 10 km city; pinch out shows all of Athens
R("const base=Math.min(W/(HX1-HX0),Hh/(HZN-HZT))","const base=SM_ON?Math.min(W,Hh)/2200:Math.min(W/(HX1-HX0),Hh/(HZN-HZT))")
R("const sc=Math.min(C.width/(HX1-HX0),C.height/(HZN-HZT))*RO.mapZ/DPR2();RO.mapC.x+=dx/sc;","const sc=SM_ON&&RO.mapSc?RO.mapSc/DPR2():Math.min(C.width/(HX1-HX0),C.height/(HZN-HZT))*RO.mapZ/DPR2();RO.mapC.x+=dx/sc;")
R("window.__sm3=SM3;","window.__sm3=SM3;window.__smm=SMM;SMM.fn={tile:(a,b)=>SMM_tile(a,b),center:(x,z)=>SMM_center(x,z)};")
save()
