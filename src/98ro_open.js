// ===== OPN (race worker, 2026-10-09): OPEN race courses in the LEGO 2K Drive style. Alex scored the narrow city races 2/10:
// "lots of freedom to run with multiple roads and terrains/water to leverage the builds of all 3 cars; ours is quite narrow.
//  When the car falls off a cliff it respawns, so the fun is kept." (docs/RACE_PLAN.md §3, refs in docs/race_ref)
// A def with open:1 is a 96 m wide ribbon (HALF 48): asphalt road |x|≤7 with a yellow centre line, drivable mixed terrain
// (grass/dirt/sand → 4×4, cobbles → car) out to ±46.5 with rounded boulders at the edge, ALTERNATIVE ROUTES behind a rounded
// island on the inside of a bend (dirt shortcut / water lane where the boat wins: the inside line is shorter, ds=v/(1−k·x)),
// full-width jumps and a CLIFF side: past the lip you fall → crashJump → RESPAWN at the same progress (place kept).
// Built procedurally on race entry (loadTrack), so it adds no download. Hooks: loadTrack, setupRace, R15_b/_ter/_aiXt/_pads.
const OPN_TER={grass:0,dirt:1,sand:2,cobble:3},OPN_K=[.9,.93,.86,.97],OPN_I0=9,OPN_I1=14,OPN_MOUTH=45,OPN_NOSE=30,OPN_ROAD=7.2;
let OPN=null;const OPN_on=()=>!!(OPN&&TRK&&TRK.open);
const OPN_cp=(a,dx,dz)=>a.map(([x,z,y,n])=>[(x+dx)/S,y,(z+dz)/S,n]);
const OPN_DEFS=[
 {id:'fra_ufer',name:'Main Riverbank Rally',short:'Riverbank Rally',open:1,w:96,w15:96,laps:3,bank:.25,mood:'brick',tunnel:'',clear:[],
  desc:'Open course on the Main bank: wide park hills, a dirt shortcut, a boat lane on the river, two big jumps and the quarry cliff.',
  cp:OPN_cp([[0,0,3,'MAINUFER'],[260,0,3,'MAINUFER'],[520,-30,5,'PARK HILLS'],[700,-140,10,'PARK HILLS'],[780,-300,15,'PARK SHORTCUT'],[740,-460,15,'PARK SHORTCUT'],[600,-540,11,'PARK SHORTCUT'],
   [450,-570,7,'CREEK'],[290,-600,5,'MAIN CROSSING'],[100,-620,3,'MAIN CROSSING'],[-80,-560,3,'MAIN CROSSING'],[-190,-420,9,'QUARRY CLIFF'],[-230,-250,16,'QUARRY CLIFF'],[-200,-110,12,'RAIL CUT'],[-110,-20,6,'COBBLE QUAY']],2600,400),
  jumps:[{id:'ro_creek',name:'CREEK',kind:'pit',at:[(470+2600)/S,(-566+400)/S],half:22,floor:-8,style:'creek',msg:'INTO THE CREEK'},
   {id:'ro_rail',name:'RAIL CUT',kind:'pit',at:[(-170+2600)/S,(-75+400)/S],half:20,floor:-6,style:'rail',msg:'INTO THE RAIL CUT'}],
  ro:{ter:{'MAINUFER':'grass','PARK HILLS':'grass','PARK SHORTCUT':'dirt','CREEK':'grass','MAIN CROSSING':'grass','QUARRY CLIFF':'sand','RAIL CUT':'dirt','COBBLE QUAY':'cobble'},
   routes:[{a:3,b:6,kind:'dirt'},{a:8,b:10,kind:'water'}],cliffs:[{a:11,b:13,lip:20}],sky:1,col:[0x58b43a,0x9b6a3c,0xe2c98a,0x9a948a]}},
 {id:'ath_akti',city:'ath',name:'Saronic Coast Rally',short:'Coast Rally',open:1,w:96,w15:96,laps:3,bank:.25,mood:'athnoon',tunnel:'',clear:[],
  desc:'Open course on the Saronic coast: beach sand, a lagoon lane for the boat, olive hills, a pine shortcut and the cape cliff above the sea.',
  cp:OPN_cp([[0,0,4,'AKTI'],[280,10,4,'AKTI'],[540,-20,5,'BEACH'],[740,-110,4,'BEACH'],[860,-280,3,'LAGOON'],[840,-470,3,'LAGOON'],[720,-590,8,'OLIVE HILLS'],
   [540,-640,15,'OLIVE HILLS'],[330,-650,22,'CAPE CLIFF'],[120,-610,24,'CAPE CLIFF'],[-60,-500,18,'PINE SHORTCUT'],[-170,-330,12,'PINE SHORTCUT'],[-190,-160,8,'TAVERNA'],[-110,-40,5,'TAVERNA']],-3200,2600),
  jumps:[{id:'ro_olive',name:'OLIVE CREST',kind:'pit',at:[(630-3200)/S,(-622+2600)/S],half:22,floor:-8,style:'rock',msg:'OVER THE OLIVE CREST'},
   {id:'ro_taverna',name:'TAVERNA',kind:'pit',at:[(-160-3200)/S,(-95+2600)/S],half:20,floor:-6,style:'rock',msg:'OVER THE TAVERNA STEPS'}],
  ro:{ter:{'AKTI':'cobble','BEACH':'sand','LAGOON':'sand','OLIVE HILLS':'grass','CAPE CLIFF':'dirt','PINE SHORTCUT':'grass','TAVERNA':'cobble'},
   routes:[{a:3,b:5,kind:'water'},{a:10,b:12,kind:'dirt'}],cliffs:[{a:8,b:10,lip:20}],sea:{a:1,b:6},seaCliff:1,acro:1,col:[0xa7a94a,0xa8763e,0xecd9a0,0xd8cdb8]}}];
for(const d of OPN_DEFS){TRACK_DEFS.push(d);if(d.city==='ath'){ATH_TRACKS.push(d);ATH_IDS.push(d.id)}else TDF.push(d)}
try{TCOL.fra_ufer='#5dffb0'}catch(e){}
// ---- per-frame lookup tables (TF index): terrain, route island, cliff lip
function OPN_prep(){const td=TF,N=td.N,L=td.L,o=TRK.ro;
  const cpS=TRK.cp.map(c=>{let bi=0,bd=1e18;for(let i=0;i<N;i++){const d=(td.P[i*3]-c[0]*S)**2+(td.P[i*3+2]-c[2]*S)**2;if(d<bd){bd=d;bi=i}}return bi*td.ds});
  const rng=(a,b)=>{const s0=cpS[a];let s1=cpS[b];if(s1<s0)s1+=L;return[s0,s1]},ix=s=>Math.floor(mod(s,L)/td.ds)%N;
  const meanK=(s0,s1)=>{let m=0,n=0;for(let s=s0;s<=s1;s+=4){m+=kAt(td,s);n++}return m/Math.max(1,n)};
  let turn=0;for(let i=0;i<N;i++)turn+=td.K[i];
  const R={N,L,ds:td.ds,cpS,out:-Math.sign(turn)||1,TER:new Uint8Array(N),RT:new Int8Array(N).fill(-1),IH:new Float32Array(N),SD:new Int8Array(N),CL:new Int8Array(N),LIP:new Float32Array(N).fill(99),SEA:new Uint8Array(N),routes:[],cliffs:[],falls:0,fallsP:0};
  for(let i=0;i<N;i++)R.TER[i]=OPN_TER[o.ter[td.SEC[i]]]||0;
  o.routes.forEach((r,ri)=>{const[s0,s1]=rng(r.a,r.b),sd=r.sd||Math.sign(meanK(s0,s1))||1,Lc=s1-s0;R.routes.push({...r,s0,s1,sd,id:ri,xc:(OPN_I0+OPN_I1)/2,hw:(OPN_I1-OPN_I0)/2,k:meanK(s0,s1)});
    for(let s=s0;s<=s1;s+=td.ds/2){const i=ix(s),d=Math.min(s-s0,s1-s)-OPN_MOUTH;R.RT[i]=ri;R.SD[i]=sd;R.IH[i]=d<=0?0:(OPN_I1-OPN_I0)/2*Math.sqrt(clamp(d/OPN_NOSE,0,1))}});
  o.cliffs.forEach(c=>{const[s0,s1]=rng(c.a,c.b),cd=c.sd||-Math.sign(meanK(s0,s1))||R.out;R.cliffs.push({...c,s0,s1,cd});
    for(let s=s0;s<=s1;s+=td.ds/2){const i=ix(s),t=clamp(Math.min(s-s0,s1-s)/70,0,1);R.CL[i]=cd;R.LIP[i]=MARGIN-(MARGIN-c.lip)*t*t*(3-2*t)}});
  if(o.sea){const[s0,s1]=rng(o.sea.a,o.sea.b);for(let s=s0;s<=s1;s+=td.ds/2)R.SEA[ix(s)]=1}
  OPN=R}
const OPN_i=s=>Math.floor(mod(s,OPN.L)/OPN.ds)%OPN.N;
// lateral limits: ±MARGIN (rounded boulders), the island splits a route from the road, the cliff side has no wall
function OPN_b(s,px){if(s.air&&s.air.j&&s.air.j.id==='ro_cliff')return[-400,400];const i=OPN_i(s.dist);let a=-MARGIN,b=MARGIN;const cd=OPN.CL[i];if(cd>0)b=400;else if(cd<0)a=-400;
  const ih=OPN.IH[i];if(ih>0){const sd=OPN.SD[i],xc=(OPN_I0+OPN_I1)/2;if(px*sd<xc){const hi=xc-ih;if(sd>0)b=Math.min(b,hi);else a=Math.max(a,-hi)}else{const lo=xc+ih;if(sd>0)a=Math.max(a,lo);else b=Math.min(b,-lo)}}
  return[a,b]}
const OPN_lane=r=>r.sd*(OPN_I1+(r.kind==='water'?15:13));
// surface under a car: road / cobbles → car, grass dirt sand → 4×4, a water route lane → boat; past a cliff lip → fall
function OPN_ter(s){const i=OPN_i(s.dist),ax=Math.abs(s.x);s.r15w=false;if(s.air&&s.air.j.id==='ro_cliff'){if(s.air.t>=1.4)OPN_land(s);return s.terrain&&s.terrain!=='road'?s.terrain:null}
  if(OPN.CL[i]&&s.x*OPN.CL[i]>OPN.LIP[i]&&!s.air&&s.dead<=0){OPN_fall(s);s.r15k=1;return s.terrain&&s.terrain!=='road'?s.terrain:null}
  const ri=OPN.RT[i];if(ri>=0&&s.x*OPN.SD[i]>OPN_I1-.5){const r=OPN.routes[ri];if(r.kind==='water'){s.r15w=true;s.r15k=1.1;return'water'}s.r15k=1.1;return'dirt'}
  if(ax<=OPN_ROAD+.6){s.r15k=1;return null}const t=OPN.TER[i];s.r15k=OPN_K[t];if(t===3)return null;
  if(s.isPlayer&&!s.air&&R()<.03)shake=Math.max(shake,.22);return'dirt'}
function OPN_fall(s){frameAt(TD,s.dist,F2);const y0=yAt(TD,s.dist)+1.4,sea=!!TRK.ro.seaCliff;
  s.air={y:y0,vy:2.5,j:{id:'ro_cliff',name:'CLIFF',kind:sea?'river':'pit',s0:-1,s1:mod(s.dist,TD.L)-30,floor:y0-30,g:24,msg:sea?'INTO THE SEA':'OFF THE CLIFF'},t:0,fall:true,cleared:true};
  s.air.off=F2.p.y+F2.r.y*s.x-y0;OPN.falls++;if(s.isPlayer){OPN.fallsP++;say('','OFF THE CLIFF!',.9);try{AU.sfx('crash')}catch(e){}}}
// the fall ends 1.4 s after the lip (the car is out of sight below it), then 1.6 s dead → SPAWN IN 3 in total
function OPN_land(s){crashJump(s);if(s.isPlayer)say('WIPEOUT',TRK.ro.seaCliff?'INTO THE SEA · RESPAWN':'OFF THE CLIFF · RESPAWN',1.4)}
const OPN_falling=s=>!!(s&&s.air&&s.air.j&&s.air.j.id==='ro_cliff');
{const f=RF_rspNow;RF_rspNow=function(){if(OPN_on()&&state==='race'&&OPN_falling(pl)){OPN_land(pl);pl.dead=1e-3;RSP.n++;return}return f()}}
{const f=RF_rsp;RF_rsp=function(){f();const s=pl,e=RSP.el;if(!e||!s||state!=='race'||!OPN_on())return;
  if(OPN_falling(s)){e.style.display='';e.textContent='OFF THE CLIFF! SPAWN IN '+Math.ceil(Math.max(.1,3-s.air.t))+' · TAP'}else if(s.dead>0)e.textContent='SPAWN IN '+Math.ceil(s.dead)+' · TAP'}}
addEventListener('keydown',e=>{if(e.code==='KeyR'&&typeof state!=='undefined'&&state==='race'&&OPN_on()&&OPN_falling(pl)){e.preventDefault();e.stopImmediatePropagation();RF_rspNow()}},true);
// AI: each lap each rival rolls a route (≈half take the alternative), otherwise keeps near the road; nobody aims past a cliff lip
function OPN_aiXt(s,xt){const L=OPN.L,m=mod(s.dist,L),i=OPN_i(s.dist);xt=clamp(xt,-11,11);
  for(const r of OPN.routes){const inR=mod(m-r.s0,L)<r.s1-r.s0,dd=mod(r.s0-m,L);if(!inR&&dd>170)continue;const key=r.id+'@'+s.lap;s.rod=s.rod||{};
    if(s.rod[key]==null)s.rod[key]=R()<.42+.2*clamp(s.skill-.9,0,1);let alt=s.rod[key];if(inR&&OPN.IH[i]>0)alt=s.x*r.sd>(OPN_I0+OPN_I1)/2;
    if(alt)return OPN_lane(r);const lim=OPN_I0-3.5;return r.sd>0?Math.min(xt,lim):Math.max(xt,-lim)}
  for(const d of[0,40,90]){const j=OPN_i(s.dist+d),cd=OPN.CL[j];if(cd){const lim=Math.min(OPN.LIP[j]-9,8);xt=cd>0?Math.min(xt,lim):Math.max(xt,-lim)}}
  return xt}
function OPN_pads(){for(const r of OPN.routes)for(const fr of r.kind==='water'?[.3,.55,.8]:[.4,.7])pads.push({s:r.s0+(r.s1-r.s0)*fr,x:OPN_lane(r),type:'boost'})}
// test hook for tools/tRace.js: window.__roAlt=true → the test driver takes the alternative routes, false → the road
function OPN_rt(s){const L=OPN.L,m=mod(s.dist,L),i=OPN_i(s.dist);
  for(const r of OPN.routes){const inR=mod(m-r.s0,L)<r.s1-r.s0,dd=mod(r.s0-m,L);if(!inR&&dd>170)continue;const alt=window.__roAlt!==false;
    if(inR&&OPN.IH[i]>0)return{want:s.x*r.sd>(OPN_I0+OPN_I1)/2?OPN_lane(r):r.sd*-2,in:r.kind};if(alt)return{want:OPN_lane(r),next:r.kind,dd:Math.round(dd)};return{want:r.sd*-2,road:r.kind}}
  for(const d of[0,40,90]){const j=OPN_i(s.dist+d);if(OPN.CL[j])return{want:-OPN.CL[j]*4,cliff:1}}return null}
{const b=R15_b,t=R15_ter,a=R15_aiXt,p=R15_pads,rt=window.__rt15;
 R15_b=function(s,px){return OPN_on()?OPN_b(s,px):b(s,px)};R15_ter=function(s){return OPN_on()?OPN_ter(s):t(s)};
 R15_aiXt=function(s,xt){return OPN_on()?OPN_aiXt(s,xt):a(s,xt)};R15_pads=function(){return OPN_on()?OPN_pads():p()};
 window.__rt15=s=>{try{return OPN_on()?OPN_rt(s):rt(s)}catch(e){return null}}}
// race entry: open courses run forward, no civilian traffic, a 4-wide grid (the player last, as in RF)
setupRace=(f=>function(cfg){const d=cfg&&TRACK_DEFS.find(t=>t.id===cfg.track);if(d&&d.open){cfg=Object.assign({},cfg,{traffic:0,dir:'fwd'});dir='fwd'}
  const r=f.call(this,cfg);try{if(OPN_on()&&RF_GRID()){const ai=ships.filter(s=>s!==pl).sort((a,b)=>b.skill-a.skill),grid=[...ai,pl];
    grid.forEach((s,i)=>{const row=Math.floor(i/4),col=i%4;s.dist=-14-row*13-(col%2?4:0);s.x=[-10.5,-3.5,3.5,10.5][col];s.v=0;s.place=i+1});ships.forEach(s=>posShip(s,1/60,true));updateCam(1,true)}}catch(e){console.warn('OPN grid',e)}return r})(setupRace);
{const _lt=loadTrack;loadTrack=function(id){const def=TRACK_DEFS.find(t=>t.id===id);if(!def||!def.open){OPN=null;return _lt(id)}
  if(!KEEP_TEX.size)for(const t of[GLOW,FLARE,SHADOW,FACADE,...WINS])KEEP_TEX.add(t),KEEP_TEX.add(t.source);if(WORLD&&TRK===def)return false;
  disposeWorld();TRK=def;CP=def.cp;W=96;HALF=48;MARGIN=HALF-1.5;CR_LS=1;RIVER[0]=RIVER[1]=1e9;ATHG=null;if(typeof traffic3d!=='undefined'&&traffic3d)traffic3d.im.visible=traffic3d.gl.visible=false;
  TF=buildTrackData();TD=TF;TRACKS={fwd:TF,rev:null};indexTrack();lampList=[];LANDMARKS.length=0;searchSpots.length=0;searchlights=[];billboards=[];trains=[];beacons=null;
  WORLD=new THREE.Group();ROOT=WORLD;scene.add(WORLD);R15C=[];R15C.pts=[];
  OPN_prep();try{OPN_build()}catch(e){console.warn('OPN build',e)}buildTrackProps();buildWaterFun();buildMap();applyMoodMaterials();applyQuality();warmTextures(WORLD);return true}}
// ---- the world: ribbon terrain + road, islands, water lanes, cliff faces, hills, boulders, trees, skyline / Acropolis + sea
function OPN_noise(a,b){const v=Math.sin(a*12.9898+b*78.233)*43758.5453;return v-Math.floor(v)}
function OPN_vn(x,y){const i=Math.floor(x),j=Math.floor(y),fx=x-i,fy=y-j,u=fx*fx*(3-2*fx),w=fy*fy*(3-2*fy),n=OPN_noise;return lerp(lerp(n(i,j),n(i+1,j),u),lerp(n(i,j+1),n(i+1,j+1),u),w)}
function OPN_roadTex(){const[c,g]=cv(256,512);g.fillStyle='#5b5f66';g.fillRect(0,0,256,512);for(let i=0;i<2600;i++){const v=Math.random();g.fillStyle=v<.5?'rgba(30,32,36,.25)':'rgba(150,155,165,.2)';g.fillRect(Math.random()*256,Math.random()*512,2,2)}
  g.fillStyle='#f1f1ea';g.fillRect(8,0,8,512);g.fillRect(240,0,8,512);g.fillStyle='#ffc81e';for(let y=0;y<512;y+=128)g.fillRect(122,y+10,12,84);return tex(c)}
function OPN_grainTex(){const[c,g]=cv(128,128);g.fillStyle='#fff';g.fillRect(0,0,128,128);for(let i=0;i<1400;i++){const v=150+Math.random()*105|0;g.fillStyle=`rgb(${v},${v},${v})`;g.fillRect(Math.random()*128,Math.random()*128,3,3)}
  g.strokeStyle='rgba(0,0,0,.08)';g.lineWidth=2;for(let x=0;x<=128;x+=32){g.beginPath();g.moveTo(x,0);g.lineTo(x,128);g.stroke();g.beginPath();g.moveTo(0,x);g.lineTo(128,x);g.stroke()}return tex(c)}
function OPN_build(){const td=TF,N=td.N,o=TRK.ro,ath=TRK.city==='ath',COL=o.col.map(c=>new THREE.Color(c)),st=2;
  const P=(i,x,y,a)=>{const A=(i%N)*3;a.push(td.P[A]+td.R[A]*x+td.U[A]*y,td.P[A+1]+td.R[A+1]*x+td.U[A+1]*y,td.P[A+2]+td.R[A+2]*x+td.U[A+2]*y)};
  const gap=i=>!!jumpAt(td,i*td.ds+.5)||!!jumpAt(td,(i+st)*td.ds-.5);
  const MB=()=>({p:[],c:[],u:[],i:[],n:0});
  const add=(m,mat,shadow)=>{if(!m.i.length)return null;const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(m.p,3));if(m.c.length)g.setAttribute('color',new THREE.Float32BufferAttribute(m.c,3));
    if(m.u.length)g.setAttribute('uv',new THREE.Float32BufferAttribute(m.u,2));g.setIndex(m.i);g.computeVertexNormals();const me=new THREE.Mesh(g,mat);me.receiveShadow=true;me.castShadow=!!shadow;WORLD.add(me);return me};
  // strip: rows along i (step st), K columns given by xs(i)→[[x,y,r,g,b]…]; quads skipped where skip(i) is true
  const strip=(m,xs,skip,uvf)=>{let prev=-1;for(let i=0;i<=N;i+=st){const cols=xs(i);if(!cols){prev=-1;continue}const K=cols.length,b0=m.n;for(const q of cols){P(i,q[0],q[1],m.p);if(q.length>3)m.c.push(q[2],q[3],q[4]);if(uvf)m.u.push(...uvf(i,q))}m.n+=K;
      const inc=cols[K-1][0]>cols[0][0];// faces up: (row→, column→) winding flips with the column direction
      if(prev>=0&&prev===K&&!(skip&&skip(i-st)))for(let k=0;k<K-1;k++){const a=b0-K+k,b=b0+k;if(inc)m.i.push(a,a+1,b,a+1,b+1,b);else m.i.push(a,b,a+1,a+1,b,b+1)}prev=K}};
  const grain=OPN_grainTex(),cTmp=new THREE.Color();
  const terCol=(i,x,sg)=>{const ri=OPN.RT[i%N];let t=OPN.TER[i%N];if(ri>=0&&OPN.SD[i%N]===sg&&Math.abs(x)>=OPN_I1-.6&&OPN.routes[ri].kind==='dirt')t=1;const sv=i*td.ds,bl=OPN_vn(sv/16,x/11),bl2=OPN_vn(sv/7+50,x/5);cTmp.copy(COL[t]);if(t===0&&bl>.72)cTmp.lerp(COL[1],clamp((bl-.72)*6,0,.85));else if(t===1&&bl<.25)cTmp.lerp(COL[0],clamp((.25-bl)*5,0,.7));
    cTmp.multiplyScalar(.82+.3*bl2);return[cTmp.r,cTmp.g,cTmp.b]};
  // terrain both sides (outer edge follows the cliff lip)
  {const m=MB(),XS=[0,.04,.09,.15,.22,.3,.38,.46,.55,.64,.73,.82,.9,.96,1];
    for(const sg of[-1,1])strip(m,i=>{const j=i%N,out=OPN.CL[j]===sg?Math.min(48,OPN.LIP[j]+.5):48;return XS.map(f=>{const x=sg*(OPN_ROAD+(out-OPN_ROAD)*f);return[x,0,...terCol(j,x,sg)]})},gap,(i,q)=>[q[0]/4,i*td.ds/4]);
    add(m,new THREE.MeshStandardMaterial({vertexColors:true,map:grain,roughness:.9,metalness:0}))}
  // road with the yellow centre line
  {const m=MB();strip(m,()=>[[-OPN_ROAD,.012],[OPN_ROAD,.012]],gap,(i,q)=>[q[0]<0?0:1,i*td.ds/32]);const mt=OPN_roadTex();add(m,new THREE.MeshStandardMaterial({map:mt,roughness:.55,metalness:.05}))}
  // islands (rounded mounds) and water lanes
  {const m=MB(),wm=MB(),xc=(OPN_I0+OPN_I1)/2,gc=COL[0];
    strip(m,i=>{const j=i%N,ih=OPN.IH[j];if(!(ih>0.05))return null;const sd=OPN.SD[j];return[-1,-.6,0,.6,1].map((f,k)=>[sd*(xc+f*ih),[0,.7,1,.7,0][k]*Math.min(1.1,ih),gc.r*.85,gc.g*.85,gc.b*.85])},null);
    add(m,new THREE.MeshStandardMaterial({vertexColors:true,map:grain,roughness:.85}));
    strip(wm,i=>{const j=i%N,ri=OPN.RT[j];if(ri<0||OPN.routes[ri].kind!=='water')return null;const sd=OPN.SD[j];return[[sd*(OPN_I1-.6),.06],[sd*30,.06],[sd*47,.06],[sd*160,-.2]]},null,(i,q)=>[q[0]/24,i*td.ds/24]);
    add(wm,new THREE.MeshStandardMaterial({map:R15_tex('water'),color:0xffffff,roughness:.12,metalness:.1,emissive:0x0a3a70,emissiveIntensity:.15}))}
  // cliff faces (rock) down to a quarry floor / the sea
  {const m=MB(),rc=new THREE.Color(ath?0xc9b48e:0x9a8f80);
    strip(m,i=>{const j=i%N,cd=OPN.CL[j];if(!cd)return null;const lp=Math.min(48,OPN.LIP[j]+.5),d=(c,k)=>[c.r*k,c.g*k,c.b*k];return[[cd*lp,0,...d(rc,1)],[cd*(lp+2),-6,...d(rc,.8)],[cd*(lp+5),-18,...d(rc,.7)],[cd*(lp+7),-30,...d(rc,.6)],[cd*(lp+160),-31,...d(ath?rc:COL[2],.75)]]},null,(i,q)=>[q[0]/10,q[1]/10]);
    add(m,new THREE.MeshStandardMaterial({vertexColors:true,map:grain,roughness:.95,flatShading:true}))}
  // red/white kerb on the cliff lip (flat paint: no wall there, the cliff is the point)
  {const m=MB(),c=document.createElement('canvas');c.width=16;c.height=64;const g=c.getContext('2d');g.fillStyle='#e8231c';g.fillRect(0,0,16,32);g.fillStyle='#fff';g.fillRect(0,32,16,32);const kt=new THREE.CanvasTexture(c);kt.wrapS=kt.wrapT=THREE.RepeatWrapping;kt.colorSpace=THREE.SRGBColorSpace;
    strip(m,i=>{const j=i%N,cd=OPN.CL[j];if(!cd||OPN.LIP[j]>45)return null;const lp=Math.min(48,OPN.LIP[j]+.5);return[[cd*(lp-2.2),.05],[cd*lp,.05]]},null,(i,q)=>[0,i*td.ds/8]);add(m,new THREE.MeshStandardMaterial({map:kt,roughness:.6}))}
  // SHORTCUT signs on the island noses (above head height; the island itself is the collider)
  {const fr=mkF();for(const r of OPN.routes){const s0=r.s0+OPN_MOUTH+OPN_NOSE+6;frameAt(td,s0,fr);const sg=new THREE.Mesh(new THREE.PlaneGeometry(9,3.1),new THREE.MeshBasicMaterial({map:R15_signTex(r.kind,r.sd),side:THREE.DoubleSide}));
    const c=fr.p.clone().addScaledVector(fr.r,r.sd*(OPN_I0+OPN_I1)/2).addScaledVector(fr.u,5.2);sg.position.copy(c);sg.lookAt(c.clone().addScaledVector(fr.t,-10));WORLD.add(sg);
    for(const dx of[-2,2]){const po=new THREE.Mesh(new THREE.CylinderGeometry(.18,.18,4,6),new THREE.MeshStandardMaterial({color:0x333333}));po.position.copy(fr.p).addScaledVector(fr.r,r.sd*(OPN_I0+OPN_I1)/2+dx).addScaledVector(fr.u,2.6);WORLD.add(po)}}}
  // hills / beach beyond the edge (not on cliff sides, not on water lanes)
  {const m=MB(),gc=COL[0],sc=COL[2];
    for(const sg of[-1,1])strip(m,i=>{const j=i%N;if(OPN.CL[j]===sg||(OPN.RT[j]>=0&&OPN.SD[j]===sg&&OPN.routes[OPN.RT[j]].kind==='water'))return null;
      if(ath&&OPN.SEA[j]&&sg===OPN.out)return[[sg*48,0,...sc.toArray()],[sg*58,-.4,...sc.toArray()],[sg*72,-3,...sc.toArray()],[sg*240,-10,...sc.toArray()]];
      const s=i*td.ds,H=7+9*(.5+.5*Math.sin(s/170+sg*2.1))+5*Math.sin(s/61+sg),sh=k=>[gc.r*k,gc.g*k,gc.b*k];
      return[[sg*48,0,...sh(.9)],[sg*52,1.2,...sh(.82)],[sg*62,H*.18,...sh(.95)],[sg*90,H*.55,...sh(1)],[sg*140,H,...sh(.9)],[sg*230,H*1.4,...sh(.8)]]},null,(i,q)=>[q[0]/12,i*td.ds/12]);
    add(m,new THREE.MeshStandardMaterial({vertexColors:true,map:grain,roughness:.9}))}
  // jump kickers (hazard chevrons on a low lip) and the gap below
  {const hz=hazardTex();hz.wrapS=hz.wrapT=THREE.RepeatWrapping;const km=MB(),fm=MB();
    for(const j of td.jumps){const i0=Math.floor(j.s0/td.ds),i1=Math.ceil(j.s1/td.ds);
      for(let i=i0-3;i<=i0;i++){const b=km.n,h=.3*clamp((i-(i0-3))/3,0,1);for(const x of[-47,47])P(i,x,.03+h,km.p),km.u.push(x/5,(i-i0)/3);km.n+=2;if(i>i0-3)km.i.push(b-2,b-1,b,b-1,b+1,b)}
      for(let i=i0;i<=i1;i++){const b=fm.n;for(const x of[-60,60])P(i,x,-9,fm.p),fm.u.push(x/20,i*td.ds/20);fm.n+=2;if(i>i0)fm.i.push(b-2,b-1,b,b-1,b+1,b)}}
    add(km,new THREE.MeshStandardMaterial({map:hz,roughness:.6}));add(fm,new THREE.MeshStandardMaterial({map:R15_tex(ath?'dirt':'water'),roughness:.4,emissive:0x0a2a50,emissiveIntensity:ath?0:.2}))}
  // instanced boulders at the edge (rounded), buoys on water lanes, trees on hills and islands
  {const rocks=[],buoys=[],trees=[],v=V3(),fr=mkF();
    for(let i=0;i<N;i+=3){if(gap(i))continue;frameAt(td,i*td.ds,fr);for(const sg of[-1,1]){const water=OPN.RT[i]>=0&&OPN.SD[i]===sg&&OPN.routes[OPN.RT[i]].kind==='water';if(OPN.CL[i]===sg)continue;
        if(ath&&OPN.SEA[i]&&sg===OPN.out&&i%9)continue;v.copy(fr.p).addScaledVector(fr.r,sg*(48.4+OPN_noise(i,sg)*1.2));(water?buoys:rocks).push([v.x,v.y,v.z,OPN_noise(i,sg*3)])}
      if(OPN.IH[i]>2&&i%12===0){v.copy(fr.p).addScaledVector(fr.r,OPN.SD[i]*(OPN_I0+OPN_I1)/2).addScaledVector(fr.u,.8);trees.push([v.x,v.y,v.z,.7])}
      if(i%5===0)for(const sg of[-1,1]){if(OPN.CL[i]===sg||(ath&&OPN.SEA[i]&&sg===OPN.out)||OPN.RT[i]>=0&&OPN.SD[i]===sg&&OPN.routes[OPN.RT[i]].kind==='water')continue;const t=60+OPN_noise(i,sg*7)*150;if(OPN_noise(i,sg*11)<.45)continue;
        const s=i*td.ds,H=7+9*(.5+.5*Math.sin(s/170+sg*2.1))+5*Math.sin(s/61+sg),yy=t<90?H*(.18+.37*(t-62)/28):t<140?H*(.55+.45*(t-90)/50):H*(1+.4*(t-140)/90);v.copy(fr.p).addScaledVector(fr.r,sg*t);trees.push([v.x,v.y+yy-.5,v.z,1+OPN_noise(i,sg)*.6])}}
    const inst=(geo,mat,L,sc)=>{if(!L.length)return;const im=new THREE.InstancedMesh(geo,mat,L.length),M=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler();L.forEach((a,k)=>{e.set(0,a[3]*6.28,0);q.setFromEuler(e);const s=sc(a);M.compose(V3(a[0],a[1]+(s.dy||0),a[2]),q,V3(s.x,s.y,s.z));im.setMatrixAt(k,M)});im.castShadow=false;im.receiveShadow=true;WORLD.add(im)};
    inst(new THREE.IcosahedronGeometry(1,1),new THREE.MeshStandardMaterial({color:ath?0xd8ccb0:0x9da3a8,roughness:.8,flatShading:true}),rocks,a=>({x:1.8+a[3],y:1.2+a[3]*.6,z:2.2,dy:.3}));
    inst(new THREE.SphereGeometry(.7,10,8),new THREE.MeshStandardMaterial({color:0xff6a1a,roughness:.4,emissive:0x401000}),buoys,()=>({x:1,y:1,z:1,dy:.3}));
    const crown=ath?new THREE.IcosahedronGeometry(2.6,1):new THREE.ConeGeometry(3,7,8),tm=new THREE.MeshStandardMaterial({color:ath?0x7a8f3a:0x2f8f3a,roughness:.8,flatShading:true});
    inst(crown,tm,trees,a=>({x:a[3],y:a[3],z:a[3],dy:(ath?3.6:5)*a[3]}));inst(new THREE.CylinderGeometry(.45,.6,3,6),new THREE.MeshStandardMaterial({color:0x6b4423,roughness:.9}),trees,a=>({x:a[3],y:a[3],z:a[3],dy:1.5*a[3]}))}
  // far scenery: ground plane, Frankfurt skyline or the Acropolis + the sea
  {let cx=0,cz=0,y0=1e9;for(let i=0;i<N;i++){cx+=td.P[i*3]/N;cz+=td.P[i*3+2]/N;y0=Math.min(y0,td.P[i*3+1])}
    const gp=new THREE.Mesh(new THREE.PlaneGeometry(9000,9000),new THREE.MeshStandardMaterial({color:ath?0x2a7fc0:0x4f9a3a,roughness:ath?.2:.95,metalness:ath?.1:0}));gp.rotation.x=-Math.PI/2;gp.position.set(cx,ath?y0-2.4:y0-30,cz);WORLD.add(gp);
    if(o.sky){const bm=new THREE.MeshStandardMaterial({color:0x7d8fae,roughness:.6,metalness:.2}),g=[];for(let k=0;k<16;k++){const a=-1.9+k*.09+OPN_noise(k,1)*.05,d=1300+OPN_noise(k,2)*350,h=70+OPN_noise(k,3)*190,w=34+OPN_noise(k,4)*30;
        const b=new THREE.BoxGeometry(w,h,w);b.translate(cx+Math.cos(a)*d,y0+h/2-10,cz+Math.sin(a)*d);g.push(b)}const mg=THREE.BufferGeometryUtils?THREE.BufferGeometryUtils.mergeGeometries(g):null;if(mg)WORLD.add(new THREE.Mesh(mg,bm));else for(const b of g)WORLD.add(new THREE.Mesh(b,bm))}
    if(o.acro){const ax=cx+700,az=cz-1100,hill=new THREE.Mesh(new THREE.CylinderGeometry(150,260,70,12),new THREE.MeshStandardMaterial({color:0xcbb68e,roughness:.9,flatShading:true}));hill.position.set(ax,y0+30,az);WORLD.add(hill);
      const wm=new THREE.MeshStandardMaterial({color:0xf3ecdc,roughness:.6}),base=new THREE.Mesh(new THREE.BoxGeometry(70,4,32),wm);base.position.set(ax,y0+67,az);WORLD.add(base);const roof=new THREE.Mesh(new THREE.BoxGeometry(70,4,32),wm);roof.position.set(ax,y0+85,az);WORLD.add(roof);
      for(let k=0;k<8;k++)for(const zz of[-14,14]){const c=new THREE.Mesh(new THREE.CylinderGeometry(1.5,1.7,14,8),wm);c.position.set(ax-31+k*8.9,y0+76,az+zz);WORLD.add(c)}}}}
// probe for tests: route layout + counters
window.__ro=()=>OPN&&{id:TRK.id,L:Math.round(OPN.L),out:OPN.out,routes:OPN.routes.map(r=>({kind:r.kind,s0:Math.round(r.s0),s1:Math.round(r.s1),sd:r.sd,R:Math.round(1/Math.abs(r.k||1e-9))})),cliffs:OPN.cliffs.map(c=>({s0:Math.round(c.s0),s1:Math.round(c.s1),cd:c.cd})),jumps:TD.jumps.map(j=>[Math.round(j.s0),Math.round(j.s1)]),falls:OPN.falls,fallsP:OPN.fallsP};
// route segment timer (player): OPN.seg[routeId] = [{alt,sec}] from 60 m before the route to 60 m after it
function OPN_segStep(){if(!OPN_on()||!pl||state!=='race')return;const L=OPN.L,m=mod(pl.dist,L);OPN.seg=OPN.seg||{};
  for(const r of OPN.routes){const a=mod(r.s0-60,L),u=mod(m-a,L),len=r.s1-r.s0+120,k='r'+r.id,c=OPN.seg[k]=OPN.seg[k]||{cur:null,list:[]};
    if(u<len){if(!c.cur&&u<30)c.cur={t0:raceT,alt:false};if(c.cur){const i=OPN_i(pl.dist);if(OPN.RT[i]===r.id&&pl.x*r.sd>OPN_I1-.5)c.cur.alt=true}}
    else if(c.cur){if(u-len<40)c.list.push({alt:c.cur.alt,sec:+(raceT-c.cur.t0).toFixed(2)});c.cur=null}}}
// probe for tools/tRace.js (read-only): rivals on screen (in the view frustum, ≤180 m), who is in which route lane, respawns
window.__ro2=()=>{if(!OPN_on()||!pl)return null;const v=V3(),o={vis:0};camera.updateMatrixWorld();
  for(const s of ships){if(s===pl||!s.mesh)continue;const dx=s.mesh.position.x-camera.position.x,dy=s.mesh.position.y-camera.position.y,dz=s.mesh.position.z-camera.position.z,fw=camera.getWorldDirection(V3());if(dx*fw.x+dy*fw.y+dz*fw.z<=0)continue;v.copy(s.mesh.position).project(camera);if(v.z<1&&Math.abs(v.x)<1&&Math.abs(v.y)<1&&s.mesh.position.distanceTo(camera.position)<180)o.vis++}
  const lane=s=>{const i=OPN_i(s.dist),ri=OPN.RT[i];return ri>=0&&s.x*OPN.SD[i]>OPN_I1-.5?OPN.routes[ri].kind+ri+'@'+s.lap:null};
  o.pl=lane(pl);o.ai=ships.filter(s=>s!==pl).map(s=>s.name+'|'+lane(s));o.rsp=typeof RSP!=='undefined'?RSP.n:0;o.fp=OPN.fallsP;o.fa=OPN.falls-OPN.fallsP;o.nr=OPN.routes.length;o.ter=pl.terrain||'road';o.ax=Math.abs(pl.x);OPN_segStep();o.seg=Object.fromEntries(Object.entries(OPN.seg||{}).map(([k,v])=>[k,v.list]));return o};
