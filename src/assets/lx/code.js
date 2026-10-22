// ===== LIFE (life-1, 2026-10-14). Packed into models/lx.js by tools/lx/pack.sh and evaluated in the page's module scope by the stub src/98lx_life.js
// (page +0.5 KB). Declarations here stay local to that eval; the page reaches LIFE through window.__life. Wraps LV_step.
// Alex "Lively worlds are still very boring and repetitive." Static props don't make life; 2K streets MOVE and react.
// Spec: docs/research/LIFE_2K.md. Behind LIFE.on (?life=0 turns it off). Everything is placed from the street graph in 40 m cells, the same in every
// session (hash of the cell), built lazily around the player and drawn from fixed instanced pools (≈34 draw calls max, 0 when a pool is empty):
//  · set pieces that move (windmill, wind turbine, fountain, banner, rotating billboard, crane, balloon cart, carousel) + one landmark per city
//    (Frankfurt: Ferris wheel on the Main bank; Athens: big carousel in Pedion tou Areos)
//  · people groups doing something (café, street band, market, football, joggers, dog walker, fans waving, road works). 1.80 m minifigs like every humanoid.
//    They react: jump aside from the car (a direct hit sends them flying, harmless, 2K style) and cheer at jumps and drifts.
//  · smashables (cone, crate, barrel, fruit stand, planter, bin) that burst into bricks + studs, like 2K
//  · pop-up bubbles on the road (SMASH 20 / DRIFT HERE / AIR TIME), one per 100 m square: drive through one to start it (the RO.pop challenge HUD)
const LIFE={on:!/[?&]life=0/.test(location.search),grp:null,C:new Map(),SC:new Map(),dead:new Map(),t:0,fr:0,px:1e9,pz:1e9,ph:0,L:[],P:[],B:[],fly:new Map(),n:{smash:0,dodge:0,fly:0,cheer:0,pop:0},ms:0,msN:0,e:0};
const LIFE_CELL=40,LIFE_STEP=16,LIFE_R=230,LIFE_PG=100;// pop-up bubble square
// terr-1: groundY = terrain/road surface (the Main's water level), what street things stand on; groundAt would add bridge decks
const LIFE_gy=(x,z)=>{try{return groundY(x,z)}catch(e){return groundAt(x,z,999)}};
const LIFE_h=(a,b,c)=>{let h=(a|0)*374761393+(b|0)*668265263+(c|0)*2147483647;h=(h^(h>>>13))*1274126177;h^=h>>>16;return(h>>>0)/4294967296};
// ---------- types
const LIFE_SET=['windmill','turbine','fountain','banner','billboard','crane','balloons','carousel','swings','seesaw','sprinkler','teacups'];// life-2: +4 playground/fair pieces
const LIFE_SETR={windmill:2.2,turbine:1.2,fountain:2.8,banner:.5,billboard:1.4,crane:3.2,balloons:1.4,carousel:3.6,swings:2.2,seesaw:2.3,sprinkler:1,teacups:3.8};// collider radius; room needed = r+1.5
const LIFE_GRP=['cafe','band','market','football','joggers','dog','fans','works','picnic','painter','icecream','juggler','chess','dance','photo'];// life-2: +7 activities
const LIFE_GRPR={cafe:1.3,band:1.3,market:1.7,football:4,joggers:.8,dog:.8,fans:1.2,works:1.4,picnic:1.7,painter:1.3,icecream:1.7,juggler:1.4,chess:1.4,dance:2,photo:1.6};// room each group needs
const LIFE_MOVE=new Set(['joggers','dog','football','dance','juggler','icecream']);// people groups that also count as moving things
const LIFE_SM=['cone','crate','barrel','fruit','planter','bin'];
const LIFE_POP=[{k:'smash',name:'SMASH 20',goal:20,lim:25,u:'smashed',col:'#ff8a1c'},{k:'drift',name:'DRIFT HERE',goal:4,lim:20,u:'s of drift',col:'#4ceaff'},{k:'air',name:'AIR TIME',goal:2,lim:25,u:'s in the air',col:'#7cff4c'}];
const LIFE_SHIRT=['#e8302a','#2a6be8','#ffd12c','#2fa84a','#ff8ac8','#f2f2f2','#8a4ae8','#ff8a1c','#22b8c8','#333a44'];
// ---------- geometry (one merged, vertex-coloured geometry per part; all instanced)
function LIFE_g(parts){const G=[];for(const [geo,col,x,y,z,rx,ry,rz] of parts){if(rx||ry||rz)geo.rotateX(rx||0).rotateY(ry||0).rotateZ(rz||0);geo.translate(x||0,y||0,z||0);
  const g=geo.index?geo.toNonIndexed():geo;colorize(g,new THREE.Color(col));G.push(g)}return mergeGeometries(G)}
const LB=(w,h,d)=>new THREE.BoxGeometry(w,h,d),LC=(r0,r1,h,s=10)=>new THREE.CylinderGeometry(r0,r1,h,s),LS=(r,s=8)=>new THREE.SphereGeometry(r,s,Math.max(4,s*.6|0));
function LIFE_geos(){const fra=CID==='fra',P=Math.PI;
 const blade=a=>[LB(.55,4.6,.12),'#f4f0e4',Math.sin(a)*2.3,Math.cos(a)*2.3,0,0,0,-a],tb=a=>[LB(.35,5.4,.1),'#f8f8f8',Math.sin(a)*2.7,Math.cos(a)*2.7,0,0,0,-a];
 const hor=a=>[LB(.4,1.1,1.3),['#ffffff','#ffd12c','#e8302a','#5fa8e0','#ff8ac8','#7cc890'][Math.round(a*6/(2*P))%6],Math.sin(a)*2.6,1.3,Math.cos(a)*2.6,0,a,0];
 const S={
  windmill:[LIFE_g([[LC(1.1,1.6,7.2,8),'#f2e6cc',0,3.6,0],[LC(0,1.5,1.8,8),'#b03a2a',0,8.1,0],[LB(.8,.8,1.4),'#6a4a30',0,7.2,1.1]]),
            LIFE_g([blade(0),blade(P/2),blade(P),blade(P*1.5),[LC(.3,.3,.4,8),'#6a4a30',0,0,0,P/2]])],
  turbine:[LIFE_g([[LC(.28,.5,13,8),'#f6f6f6',0,6.5,0],[LB(.9,.9,1.8),'#e8e8e8',0,13.2,.2],[LB(2.6,.5,2.6),'#9aa0a8',0,.25,0]]),
           LIFE_g([tb(0),tb(P*2/3),tb(P*4/3),[LS(.45),'#e8302a',0,0,0]])],
  fountain:[LIFE_g([[LC(2.6,2.8,.7,16),'#d8d4cc',0,.35,0],[LC(2.2,2.2,.2,16),'#3fa8e8',0,.62,0],[LC(.35,.5,1.8,8),'#d8d4cc',0,1.2,0],[LC(1,1.1,.25,12),'#d8d4cc',0,2.1,0]]),
            LIFE_g([[LC(.18,.32,1.6,8),'#8fdcff',0,.8,0],[LS(.55,8),'#bfeeff',0,1.7,0],[LS(.3,6),'#bfeeff',.9,.9,0],[LS(.3,6),'#bfeeff',-.9,.9,0],[LS(.3,6),'#bfeeff',0,.9,.9],[LS(.3,6),'#bfeeff',0,.9,-.9]])],
  banner:[LIFE_g([[LC(.09,.11,6.4,6),'#d8d8d8',0,3.2,0],[LS(.16,6),'#ffd12c',0,6.5,0],[LB(.7,.25,.7),'#666a70',0,.12,0]]),
          LIFE_g(fra?[[LB(2.2,.55,.06),'#111111',1.15,-.28,0],[LB(2.2,.55,.06),'#e8302a',1.15,-.83,0],[LB(2.2,.55,.06),'#ffd12c',1.15,-1.38,0]]:[[LB(2.2,1.65,.06),'#1f5fbf',1.15,-.83,0],[LB(2.2,.3,.07),'#ffffff',1.15,-.83,0],[LB(.3,1.65,.07),'#ffffff',.6,-.83,0]])],
  billboard:[LIFE_g([[LC(.2,.25,4.2,8),'#5a5e66',0,2.1,0],[LB(1.2,.3,1.2),'#5a5e66',0,.15,0]]),
             LIFE_g([[LB(3,2,.15),'#ff2d95',0,0,.87],[LB(3,2,.15),'#22b8c8',.75,0,-.43,0,P*2/3,0],[LB(3,2,.15),'#ffd12c',-.75,0,-.43,0,-P*2/3,0],[LB(3.2,.2,3.2),'#333',0,1.1,0]])],
  crane:[LIFE_g([[LB(.9,19,.9),'#ffc21c',0,9.5,0],[LB(3,1,3),'#7a7e86',0,.5,0],[LB(1.6,1.4,1.6),'#5a6070',0,19.6,0]]),
         LIFE_g([[LB(15,.6,.7),'#ffc21c',4.5,0,0],[LB(2.4,1.4,1.2),'#7a7e86',-3.6,-.2,0],[LB(.08,6,.08),'#222',10,-3,0],[LB(1.4,.6,1.4),'#e8302a',10,-6.2,0]])],
  balloons:[LIFE_g([[LB(1.4,.9,.9),'#e8302a',0,.75,0],[LC(.3,.3,.15,8),'#222',.5,.3,.45,P/2],[LC(.3,.3,.15,8),'#222',-.5,.3,.45,P/2],[LC(.3,.3,.15,8),'#222',.5,.3,-.45,P/2],[LC(.3,.3,.15,8),'#222',-.5,.3,-.45,P/2],[LB(.06,2.6,.06),'#ffffff',0,2.4,0]]),
            LIFE_g([[LS(.55,8),'#ff4040',0,0,0],[LS(.55,8),'#ffd12c',.7,.4,.1],[LS(.55,8),'#4c8cff',-.65,.35,.2],[LS(.55,8),'#4cd860',.15,.9,-.3],[LS(.55,8),'#ff8ac8',-.2,1.1,.5]])],
  carousel:[LIFE_g([[LC(3.8,3.8,.4,16),'#c84060',0,.2,0],[LC(.3,.3,4,8),'#ffd12c',0,2.2,0],[LC(0,4.2,1.6,12),'#ffffff',0,4.9,0],[LC(4.2,4.2,.3,12),'#e8302a',0,4.1,0]]),
            LIFE_g([0,1,2,3,4,5].map(i=>hor(i*P/3)).concat([0,1,2,3,4,5].map(i=>[LC(.05,.05,3.3,4),'#ffd12c',Math.sin(i*P/3)*2.6,2.1,Math.cos(i*P/3)*2.6])))],
  // life-2: playground swings (2 seats swing in turn, kids on them), seesaw (2 kids), lawn sprinkler (2 water arms turn), teacup ride (4 cups + riders)
  swings:[LIFE_g([[LB(.16,2.9,.16),'#e8302a',-1.6,1.35,.55,-.2,0,0],[LB(.16,2.9,.16),'#e8302a',-1.6,1.35,-.55,.2,0,0],[LB(.16,2.9,.16),'#e8302a',1.6,1.35,.55,-.2,0,0],[LB(.16,2.9,.16),'#e8302a',1.6,1.35,-.55,.2,0,0],[LB(3.5,.18,.18),'#ffd12c',0,2.7,0],[LB(3.6,.1,1.6),'#c8b890',0,.05,0]]),
          LIFE_g([[LB(.04,2,.04),'#666',-.25,-1,0],[LB(.04,2,.04),'#666',.25,-1,0],[LB(.62,.08,.32),'#2a6be8',0,-2.04,0]])],
  seesaw:[LIFE_g([[LB(.5,.6,.5),'#2fa84a',0,.3,0],[LB(.7,.12,.7),'#2fa84a',0,.06,0]]),
          LIFE_g([[LB(4,.12,.36),'#ffd12c',0,0,0],[LB(.06,.36,.36),'#e8302a',-1.55,.22,0],[LB(.06,.36,.36),'#e8302a',1.55,.22,0]])],
  sprinkler:[LIFE_g([[LC(.12,.18,.5,8),'#5a5e66',0,.25,0],[LC(1.4,1.4,.04,16),'#4cbf5a',0,.02,0]]),
             LIFE_g([0,1,2,3,4,5,6].flatMap(k=>[[LS(.13+k*.012,5),'#8fdcff',.35*k,Math.sin(k/6*P)*1.1+.5,0],[LS(.13+k*.012,5),'#8fdcff',-.35*k,Math.sin(k/6*P)*1.1+.5,0]]))],
  teacups:[LIFE_g([[LC(3.6,3.6,.35,20),'#ff8ac8',0,.18,0],[LC(3.7,3.7,.12,20),'#ffffff',0,.37,0],[LC(.4,.4,.8,10),'#ffd12c',0,.6,0]]),
           LIFE_g([0,1,2,3].flatMap(i=>{const a=i*P/2,x=Math.sin(a)*2.2,z=Math.cos(a)*2.2,c=['#2a6be8','#e8302a','#2fa84a','#ffd12c'][i];return[[LC(.95,.7,.75,12),c,x,.8,z],[LC(1,1,.08,12),'#ffffff',x,1.2,z],[LB(.15,.4,.15),'#ffffff',x+.95,.85,z]]}))]};
 // people-group props (static) + two moving props (ball, dog)
 const Q={
  cafe:LIFE_g([[LC(.45,.45,.06,12),'#ffffff',0,1.05,0],[LC(.06,.06,1.05,6),'#666',0,.52,0],[LC(.06,.06,2.4,6),'#ddd',0,1.2,0],[LC(0,1.7,.6,8),'#e8302a',0,2.5,0]]),
  market:LIFE_g([[LB(3,1,1.1),'#a8743c',0,.5,0],[LB(3.2,.12,1.6),'#e8302a',0,2.3,.15],[LB(.1,2.3,.1),'#ddd',1.5,1.15,.6],[LB(.1,2.3,.1),'#ddd',-1.5,1.15,.6],[LS(.18,6),'#ff8a1c',-.8,1.1,0],[LS(.18,6),'#ff4040',-.3,1.1,0],[LS(.18,6),'#7cd04c',.3,1.1,0],[LS(.18,6),'#ffd12c',.9,1.1,0]]),
  band:LIFE_g([[LB(.7,.8,.5),'#222',0,.4,0],[LC(.03,.03,1.5,4),'#999',.8,.75,.3],[LC(.35,.35,.1,10),'#333',-.8,.05,.4]]),
  football:LIFE_g([[LB(.08,1.2,.08),'#ffffff',-3,.6,6],[LB(.08,1.2,.08),'#ffffff',-3,.6,4.2],[LB(.08,.08,1.9),'#ffffff',-3,1.2,5.1],[LB(.08,1.2,.08),'#ffffff',3,.6,6],[LB(.08,1.2,.08),'#ffffff',3,.6,4.2],[LB(.08,.08,1.9),'#ffffff',3,1.2,5.1]].map(p=>(p[4]-=5.1,p[2]*=1,p))),
  works:LIFE_g([[LB(2.4,.25,.12),'#e8302a',0,.9,0],[LB(.6,.12,.12),'#ffffff',-.6,.9,.07],[LB(.6,.12,.12),'#ffffff',.6,.9,.07],[LB(.1,.9,.3),'#333',-1.1,.45,0],[LB(.1,.9,.3),'#333',1.1,.45,0],[LB(1.4,.5,1),'#8a6a40',0,.25,1.2]]),
  fans:LIFE_g([[LB(1.8,.12,.5),'#a8743c',0,.5,0],[LB(.12,.5,.4),'#333',-.8,.25,0],[LB(.12,.5,.4),'#333',.8,.25,0]]),
  // life-2 activities: picnic blanket + basket, easel, ice-cream cart, juggler's hat + sign, chess table, dance speaker, photo tripod
  picnic:LIFE_g([[LB(2.4,.04,2.4),'#e8302a',0,.02,0],...[0,1,2,3].flatMap(i=>[0,1,2,3].filter(j=>(i+j)%2).map(j=>[LB(.6,.05,.6),'#ffffff',-.9+i*.6,.03,-.9+j*.6])),[LB(.5,.32,.34),'#a8743c',.2,.2,.2],[LB(.06,.3,.06),'#6a4a30',.2,.45,.2]]),
  painter:LIFE_g([[LB(.06,1.7,.06),'#8a5a30',-.35,.85,.1,.15,0,0],[LB(.06,1.7,.06),'#8a5a30',.35,.85,.1,.15,0,0],[LB(.06,1.6,.06),'#8a5a30',0,.8,-.25,-.25,0,0],[LB(.9,.7,.04),'#ffffff',0,1.35,.2,.15,0,0],
    [LB(.3,.2,.05),'#2a6be8',-.15,1.45,.24,.15,0,0],[LB(.25,.25,.05),'#ffd12c',.2,1.3,.22,.15,0,0],[LB(.4,.12,.05),'#2fa84a',0,1.12,.19,.15,0,0]]),
  icecream:LIFE_g([[LB(1.6,.9,.9),'#ffffff',0,.75,0],[LB(1.62,.15,.92),'#ff8ac8',0,1.05,0],[LC(.22,.22,.08,10),'#333',-.55,.22,.47,0,0,P/2],[LC(.22,.22,.08,10),'#333',.55,.22,.47,0,0,P/2],[LC(.04,.04,2.3,6),'#ddd',.6,1.6,0],
    [LC(0,1.3,.5,8),'#ff8ac8',.6,2.7,0],[LC(.1,.12,.12,8),'#ffffff',.6,2.4,0],[LC(.12,0,.3,8),'#e8b060',-.4,1.35,0,P,0,0],[LS(.16,6),'#ff8ac8',-.4,1.55,0],[LS(.16,6),'#ffffff',-.1,1.3,0]]),
  juggler:LIFE_g([[LC(.22,.26,.2,10),'#222',0,.1,.9],[LC(.36,.36,.03,12),'#222',0,.02,.9],[LB(.05,1,.05),'#8a5a30',-.9,.5,.6],[LB(.7,.4,.04),'#ffd12c',-.9,1.1,.6]]),
  chess:LIFE_g([[LB(.9,.06,.9),'#a8743c',0,.78,0],[LB(.12,.75,.12),'#6a4a30',0,.38,0],...[0,1,2,3].flatMap(i=>[0,1,2,3].map(j=>[LB(.16,.03,.16),(i+j)%2?'#222':'#ffffff',-.24+i*.16,.82,-.24+j*.16])),
    [LB(.4,.45,.4),'#8a5a30',0,.22,.85],[LB(.4,.45,.4),'#8a5a30',0,.22,-.85]]),
  dance:LIFE_g([[LB(.5,.8,.5),'#222',0,.4,0],[LC(.15,.15,.04,10),'#666',0,.55,.26,P/2,0,0],[LC(.1,.1,.04,8),'#666',0,.25,.26,P/2,0,0]]),
  photo:LIFE_g([[LB(.04,1.4,.04),'#333',-.1,.7,-.05,.2,0,.2],[LB(.04,1.4,.04),'#333',.1,.7,-.05,.2,0,-.2],[LB(.04,1.4,.04),'#333',0,.7,.12,-.2,0,0],[LB(.3,.2,.18),'#222',0,1.45,0],[LC(.06,.06,.12,8),'#555',0,1.45,.14,P/2,0,0]])};
 const ball=LIFE_g([[LS(.22,8),'#ffffff',0,.22,0]]),dog=LIFE_g([[LB(.3,.32,.75),'#a8743c',0,.4,0],[LB(.26,.26,.3),'#a8743c',0,.62,.42],[LB(.08,.3,.08),'#6a4a30',.1,.12,.25],[LB(.08,.3,.08),'#6a4a30',-.1,.12,.25],[LB(.08,.3,.08),'#6a4a30',.1,.12,-.25],[LB(.08,.3,.08),'#6a4a30',-.1,.12,-.25]]);
 // minifig 1.80 m: legs + hips + head (fixed colours) / torso (shirt colour) / arms (shirt colour, pivot at the shoulder, y = 0)
 const fig=LIFE_g([[LB(.24,.78,.3),'#2a3a6a',-.14,.39,0],[LB(.24,.78,.3),'#2a3a6a',.14,.39,0],[LB(.56,.12,.32),'#2a3a6a',0,.84,0],[LC(.2,.2,.34,10),'#ffd12c',0,1.58,0],[LC(.12,.12,.06,8),'#ffd12c',0,1.78,0],[LC(.08,.08,.12,8),'#ffd12c',0,1.43,0]]);
 const torso=LIFE_g([[LB(.6,.5,.34),'#ffffff',0,1.15,0]]);
 const arms=LIFE_g([[LB(.15,.5,.17),'#ffffff',-.37,-.22,0],[LB(.15,.5,.17),'#ffffff',.37,-.22,0],[LB(.12,.1,.12),'#ffffff',-.37,-.52,0],[LB(.12,.1,.12),'#ffffff',.37,-.52,0]]);
 // smashables
 const M={cone:LIFE_g([[LC(.06,.32,.75,10),'#ff6a10',0,.42,0],[LB(.7,.08,.7),'#ff6a10',0,.04,0],[LC(.17,.24,.12,10),'#ffffff',0,.48,0]]),
  crate:LIFE_g([[LB(.9,.9,.9),'#c8904c',0,.45,0],[LB(.95,.12,.95),'#8a5a30',0,.86,0],[LB(.95,.12,.95),'#8a5a30',0,.06,0]]),
  barrel:LIFE_g([[LC(.38,.38,1,12),'#2f7dd0',0,.5,0],[LC(.4,.4,.08,12),'#ffffff',0,.75,0],[LC(.4,.4,.08,12),'#ffffff',0,.25,0]]),
  fruit:LIFE_g([[LB(1.2,.7,.7),'#a8743c',0,.35,0],[LS(.16,6),'#ff4040',-.35,.8,0],[LS(.16,6),'#ff8a1c',0,.8,.1],[LS(.16,6),'#7cd04c',.35,.8,0],[LS(.16,6),'#ffd12c',.15,.85,-.15],[LB(1.3,.08,.9),'#38a046',0,1.5,0],[LB(.06,.8,.06),'#ddd',.6,1.1,.4],[LB(.06,.8,.06),'#ddd',-.6,1.1,.4]]),
  planter:LIFE_g([[LB(.9,.55,.9),'#b85a3a',0,.28,0],[LS(.42,7),'#3aa046',0,.75,0],[LS(.14,5),'#ff4c8c',.2,1,.1],[LS(.14,5),'#ffd12c',-.2,.95,-.1]]),
  bin:LIFE_g([[LC(.32,.28,.95,10),'#3a8a4a',0,.48,0],[LC(.35,.35,.08,10),'#2a6a3a',0,.98,0]])};
 const pop=new THREE.IcosahedronGeometry(1.4,1),ring=new THREE.TorusGeometry(2.6,.22,6,24);colorize(pop,new THREE.Color('#ffffff'));colorize(ring,new THREE.Color('#ffffff'));
 const TB=LIFE.pre&&'tb'in LIFE.pre?LIFE.pre.tb:LIFE_ldTurb();LIFE.TB=TB&&TB.hub;if(TB)S.turbine=TB.geo;/* life-2: real 7747 turbine */
 return{S,Q,ball,dog,fig,torso,arms,M,pop,ring}}
// ---------- pools: name → InstancedMesh (count set per frame; invisible while empty, so an empty pool costs no draw call)
const LIFE_CAP={set:14,setM:14,prop:18,ball:14,dog:6,fig:180,sm:44,pop:8,bm:8};if(typeof LOWMEM!=='undefined'&&LOWMEM)LIFE_CAP.bm=3;// crash-5: the batched pools copy every geometry bm times (no addInstance before three r166): 8 -> 3 copies on low-mem phones = -23 MB CPU+GPU in Athens// bm: copies of each type in the batched pools (one draw call for all types)
// dynamic usage + userData.keep: WB city batching (98wb WB_cand) otherwise freezes static instanced meshes into its merged tiles (they vanished in Athens)
// a batched pool: every geometry added LIFE_CAP.bm times (×mul), proxies with the InstancedMesh calls LIFE_put/LIFE_draw use (setMatrixAt, count, visible)
function LIFE_bm(G,st,name,mul={}){let nv=0,n=0;for(const k in G){const c=LIFE_CAP.bm*(mul[k]||1);nv+=G[k].attributes.position.count*c;n+=c}
 const B=new THREE.BatchedMesh(n,nv,nv,LV_mat());B.name=name;B.userData.keep=1;B.userData.bmk=1;B.userData.st=null;B.frustumCulled=false;B.perObjectFrustumCulled=false;B.sortObjects=false;B.castShadow=B.receiveShadow=false;LIFE.grp.add(B);
 const O={},P=[];for(const k in G){const c=LIFE_CAP.bm*(mul[k]||1),ids=[];for(let i=0;i<c;i++){const id=B.addGeometry(G[k]);B.setVisibleAt(id,false);ids.push(id)}
  const x={name:k,isBm:1,B,ids,vis:0,count:0,visible:false,userData:{st},instanceMatrix:{count:c,needsUpdate:false},setMatrixAt:(i,m)=>B.setMatrixAt(ids[i],m)};O[k]=x;P.push(x)}
 B.userData.P=P;O[name]=B;return O}
function LIFE_im(geo,n,mat){const m=new THREE.InstancedMesh(geo,mat||LV_mat(),n);m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);m.userData.keep=1;m.frustumCulled=false;m.castShadow=false;m.receiveShadow=false;m.count=0;m.visible=false;LIFE.grp.add(m);return m}
function LIFE_init(){if(LIFE.grp===HUB.grp)return true;if(!HUB.grp||!HUB.nodes||!HUB.nodes.length||typeof LV_eGrid!=='function')return false;
 const G=LIFE.pre&&LIFE.pre.G||LIFE_geos(),M={};LIFE.grp=HUB.grp;LIFE.C.clear();LIFE.SL=new Map();LIFE.CA=new Map();LIFE.SC.clear();LIFE.dead.clear();LIFE.KK=new Set();LIFE.fly.clear();LIFE.L=[];LIFE.px=1e9;
 // life-2: set-piece bases + group props share ONE BatchedMesh, the moving set-piece parts another (2 draw calls for every type instead of 1-2 each)
 const bs={},bm={};for(const k of LIFE_SET){bs['s_'+k]=G.S[k][0];bm['m_'+k]=G.S[k][1]}for(const k in G.Q)bs['q_'+k]=G.Q[k];
 Object.assign(M,LIFE_bm(bs,true,'bm_s'),LIFE_bm(bm,false,'bm_m',{m_swings:2}));M.ball=LIFE_im(G.ball,LIFE_CAP.ball);M.dog=LIFE_im(G.dog,LIFE_CAP.dog);
 M.fig=LIFE_im(G.fig,LIFE_CAP.fig);M.torso=LIFE_im(G.torso,LIFE_CAP.fig);M.arms=LIFE_im(G.arms,LIFE_CAP.fig);
 const c=new THREE.Color();for(let i=0;i<LIFE_CAP.fig;i++){c.set(LIFE_SHIRT[i%LIFE_SHIRT.length]);M.torso.setColorAt(i,c);M.arms.setColorAt(i,c)}
 for(const k of LIFE_SM)M['x_'+k]=LIFE_im(G.M[k],LIFE_CAP.sm);
 const pm=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.3,emissive:'#ffffff',emissiveIntensity:.35,transparent:true,opacity:.82});
 M.kick=LIFE_im(LIFE_kickGeo(),LIFE_CAP.pop);M.pop=LIFE_im(G.pop,LIFE_CAP.pop,pm);M.ring=LIFE_im(G.ring,LIFE_CAP.pop,pm.clone());
 for(const k in M){M[k].name=k;M[k].userData.st=/^[xsq]_/.test(k)}LIFE.M=M;LIFE_landmark();LIFE.pre=null;return true}
// perf-r12a: when the loader did not build LIFE (low-mem 12 s wait, lx.js after the loader, ?test pages) LIFE_init ran in ONE roam frame: 150-260 ms
// (LDraw turbine + Ferris wheel / carousel geometry, the batched pools). LIFE_pre does one heavy piece per frame first; LIFE_init then reuses them. ?lifestage=0 = old.
const LIFE_STG=!/[?&]lifestage=0/.test(location.search);
function LIFE_pre(){if(!LIFE_STG)return true;if(!HUB.grp||!HUB.nodes||!HUB.nodes.length||typeof LV_eGrid!=='function')return false;
 const Q=LIFE.pre&&LIFE.pre.c===CID?LIFE.pre:(LIFE.pre={c:CID,k:0}),t0=performance.now();try{return LIFE_pre1(Q)}finally{(LIFE.preMs=LIFE.preMs||[]).push(+(performance.now()-t0).toFixed(1))}}
function LIFE_pre1(Q){
 if(Q.k===0){Q.tb=LIFE_ldTurb();Q.k=1;return false}
 if(Q.k===1){Q.G=LIFE_geos();Q.k=2;return false}
 if(Q.k===2){try{Q.lm=LIFE_ldLm(CID==='fra')}catch(e){console.warn('LIFE lm',e)}Q.k=3;return false}
 return true}
// ---------- placement: slots every 16 m on both sides of every street edge (no motorways), owned by the 40 m cell they fall in
// a kerb point s m along edge A→B on side sd, dist m beyond the carriageway edge; h faces the road
function LIFE_side(A,B,s,sd,dist){const L=Math.hypot(B.x-A.x,B.z-A.z)||1,ux=(B.x-A.x)/L,uz=(B.z-A.z)/L,W=Math.min(A.w||(A.g?8:20),B.w||(B.g?8:20)),
  off=W/2+dist;return{x:A.x+ux*s-uz*off*sd,z:A.z+uz*s+ux*off*sd,ux,uz,h:Math.atan2(uz*sd,-ux*sd)}}
// never in a driving lane: the carriageway + 1 m stays clear (coordinator 2026-10-14)
function LIFE_free(x,z,r,y){if(LV_onRoad(x,z,Math.max(1,r*.7+.6)))return false;
 {/* slow1: the hub graph is not the drawn road: set pieces stood ON the real street (Athens -2244,-1487 sprinkler, -2241,-1484 balloons: solid, r+1.2 m, 3 s wedge) — also test the city street and fill roads that the car actually drives on */
  const m=r*.7+.6;if(typeof cityAt==='function'){const q=cityAt(x,z);if(q&&q.road&&q.d<q.road.w/2+m)return false}if(typeof fillAt==='function'){const f=fillAt(x,z);if(f&&f.r&&f.d<f.r.w/2+m)return false}}if(roamHit(x,z,r+.4,y+.5))return false;if(typeof inRiver==='function'&&inRiver(x,z,-2))return false;return true}
// first free spot for something of radius r at this slot: kerb distances tried nearest first (Athens blocks are narrow, so the near ones matter)
// perf-11: the candidate x,z are computed in place (no object per try); the result object is built only for the spot that fits
function LIFE_at(p,r){const A=p.EA,B=p.EB,D=p.D,L=Math.hypot(B.x-A.x,B.z-A.z)||1,ux=(B.x-A.x)/L,uz=(B.z-A.z)/L,W=Math.min(A.w||(A.g?8:20),B.w||(B.g?8:20)),s=p.s,sd=p.sd;
 for(let i=0;i<D.length;i++){const off=W/2+(D[i]+r),x=A.x+ux*s-uz*off*sd,z=A.z+uz*s+ux*off*sd,y=LIFE_gy(x,z);if(!isFinite(y)||y<-2)continue;if(LIFE_free(x,z,r,y)){const q=LIFE_side(A,B,s,sd,D[i]+r);q.y=y;return q}}return null}
let LIFE_SMT=CID==='fra'?18:15;// smashable groups wanted per 5×5 cells (tuned: 10-40 smashables per 100 m window)
const LIFE_D={fra:[1.2,3,4.6,6.5],ath:[.5,1.4,2.4,3.6,5,7,9]};// m beyond the carriageway edge (+ the item's radius); LIFE_free keeps lane + 1 m clear
// kerb slots of a cell (every 16 m, Athens 8 m, both sides), hash-sorted; cached
function LIFE_slots(a,b){const key=a*100000+b;let S=LIFE.SL.get(key);if(S)return S;const N=HUB.nodes,E=LV_eGrid().get(key);if(!E){LIFE.SL.set(key,S=[]);return S}
 S=[];const seen=new Set(),D=LIFE_D[CID]||LIFE_D.fra,step=CID==='fra'?12:8;
 for(let q=0;q<E.length;q+=2){let i=E[q],j=E[q+1];if(i>j){const t=i;i=j;j=t}const ek=i*1e6+j;if(seen.has(ek))continue;seen.add(ek);const A=N[i],B=N[j];if(!A||!B||A.ab||B.ab)continue;
  const L=Math.hypot(B.x-A.x,B.z-A.z);if(L<6)continue;const o0=LIFE_h(i,j,7)*step;
  for(let s=o0;s<L-2;s+=step)for(const sd of[-1,1]){const p=LIFE_side(A,B,s,sd,D[0]);if(Math.floor(p.x/LIFE_CELL)!==a||Math.floor(p.z/LIFE_CELL)!==b)continue;
   Object.assign(p,{EA:A,EB:B,s,sd,D,u:LIFE_h(Math.round(p.x*4),Math.round(p.z*4),11)});S.push(p)}}
 S.sort((p,q)=>p.u-q.u);
 LIFE.SL.set(key,S);return S}
// every smashable-group spot that fits in a cell (≥ 4 m apart), before thinning; cached
function LIFE_cand(a,b){const key=a*100000+b;let L=LIFE.CA.get(key);if(L)return L;L=[];const S=LIFE_slots(a,b);
 for(let k=0;k<S.length;k++){const q=LIFE_at(S[k],.6);if(q&&L.every(o=>(o.q.x-q.x)**2+(o.q.z-q.z)**2>16))L.push({q,k})}LIFE.CA.set(key,L);return L}
function LIFE_cell(a,b){const key=a*100000+b;let C=LIFE.C.get(key);if(C)return C;C=[];LIFE.C.set(key,C);if(!LV_eGrid().has(key))return C;
 const S=LIFE_slots(a,b);
 // pass 1: smashable groups (thinned, below); pass 2: set pieces and people groups, alternating, in the room left.
 // Types rotate per cell from a hashed start, so neighbours differ.
 let nS=0,nM=0,nG=0;const used=[],cap=Math.ceil(S.length*(CID==='fra'?.7:.35)),h0=Math.floor(LIFE_h(a,b,3)*64);
 const room=(x,z,r,g=1.5)=>used.every(u=>(u[0]-x)**2+(u[1]-z)**2>(u[2]+r+Math.min(g,u[3]??g))**2);/* a smashable group only asks .3 m of air */
 const putM=(p,hh)=>{for(let tt=0;tt<LIFE_SET.length;tt++){const t=LIFE_SET[(h0+Math.floor(hh*8)+nM*3+tt)%LIFE_SET.length],r=LIFE_SETR[t],q=LIFE_at(p,r);
   if(!q||!room(q.x,q.z,r))continue;if((t==='turbine'||t==='windmill')&&roamHit(q.x,q.z,15,q.y+.5))continue;/* rev-3 (Alex, Athens @899,-1033): a 16 m turbine stood between apartment blocks; only in open ground, ≥ 15 m from any building */C.push({c:'set',t,x:q.x,z:q.z,y:q.y,h:q.h,r,ph:hh*20,id:key*256+C.length});used.push([q.x,q.z,r]);nM++;return true}return false};
 const putG=(p,hh)=>{for(let tt=0;tt<LIFE_GRP.length;tt++){const t=LIFE_GRP[(h0+Math.floor(hh*8)+nG*3+tt)%LIFE_GRP.length],r=LIFE_GRPR[t],q=LIFE_at(p,r);
   if(!q||!room(q.x,q.z,r))continue;C.push({c:'grp',t,x:q.x,z:q.z,y:q.y,h:q.h,ux:q.ux,uz:q.uz,r,ph:hh*20,id:key*256+C.length});used.push([q.x,q.z,r]);nG++;return true}return false};
 const smPass=()=>{
 // smashables: every spot that fits is a candidate; each is kept with p = min(1, LIFE_SMT / candidates in the 5×5 cells around), so a 100 m window
 // gets ~8-10 groups (10-40 smashables, coordinator cap) on dense grids and everything there is on sparse streets. Same in every session.
 let n25=0;for(let u=-2;u<=2;u++)for(let v=-2;v<=2;v++)n25+=LIFE_cand(a+u,b+v).length;const pk=Math.min(1,LIFE_SMT/Math.max(1,n25));
 for(const {q,k} of LIFE_cand(a,b)){if(S.length<10&&nS>=1)break;const hh=LIFE_h(a*7+k,b*13+k,5);if(LIFE_h(Math.round(q.x*8),Math.round(q.z*8),13)>=pk||!room(q.x,q.z,.8,.4))continue;
  let got=0;for(let m=0;m<2;m++){const t=LIFE_SM[(h0+Math.floor(hh*600)+m*(1+nS)+nS*2)%LIFE_SM.length],d=(m-.5)*1.6,x=q.x+q.ux*d,z=q.z+q.uz*d;
   if(!LIFE_free(x,z,.45,q.y))continue;C.push({c:'sm',t,x,z,y:LIFE_gy(x,z),h:q.h+hh*6,id:key*256+C.length});got++}
  if(got){nS++;used.push([q.x,q.z,1.3,.3])}}
 };
 const mgPass=()=>{
 for(let k=0;k<S.length&&nM+nG<cap;k++){const p=S[k],hh=LIFE_h(a*7+k,b*13+k,5);if(nM*3<=nG*5?(putM(p,hh)||putG(p,hh)):(putG(p,hh)||putM(p,hh)))p.taken=1}/* moving : groups ≈ 5 : 3, the test ratio */
 };
 smPass();mgPass();/* smashables first (they need the least room), then set pieces and people; a cell with few kerb slots keeps ≤ 1 smashable group for them */
 return C}
// pop-up bubbles: one per 100 m square, on the street point nearest the square's centre (in the lane, so you can drive through it)
function LIFE_pop(A,B){const key=A*100000+B;if(LIFE.SC.has(key))return LIFE.SC.get(key);let K=LIFE_POP[Math.floor(LIFE_h(A,B,9)*3)],best=LIFE_pop1(A,B,K.k==='air'?LIFE_KK.half+3:0);
 if(!best&&K.k==='air'){K=LIFE_POP[0];best=LIFE_pop1(A,B,0)}/* life-2: AIR TIME needs a straight 31 m for its kicker, else the square gets a SMASH bubble */
 if(best){const y=LIFE_gy(best.x,best.z);if(!isFinite(y))best=null;else{best.y=y;best.c='pop';best.K=K;best.id='p'+key}}
 LIFE.SC.set(key,best);return best}
// the street point nearest the square's centre, ≥ need m from both ends of its edge
function LIFE_pop1(A,B,need){let best=null,bd=1e18;const N=HUB.nodes,PG=LIFE_PG,cx=(A+.5)*PG,cz=(B+.5)*PG,G=LV_eGrid();
 for(let a=Math.floor(A*PG/40);a<=Math.floor((A+1)*PG/40);a++)for(let b=Math.floor(B*PG/40);b<=Math.floor((B+1)*PG/40);b++){const E=G.get(a*100000+b);if(!E)continue;for(let q=0;q<E.length;q+=2){const P=N[E[q]],Q=N[E[q+1]];if(!P||!Q||P.ab||Q.ab)continue;
  const dx=Q.x-P.x,dz=Q.z-P.z,l2=dx*dx+dz*dz;if(l2<400||l2<4*need*need)continue;const l=Math.sqrt(l2),t=Math.max(.2,need/l,Math.min(.8,1-need/l,((cx-P.x)*dx+(cz-P.z)*dz)/l2)),x=P.x+dx*t,z=P.z+dz*t,d=(x-cx)**2+(z-cz)**2;
  if(d<bd&&Math.floor(x/PG)===A&&Math.floor(z/PG)===B){bd=d;best={x,z,h:Math.atan2(dx,dz)}}}}
 return best}
// ---------- life-2: a real kicker under every AIR TIME bubble: take-off wedge, 5 m gap (the bubble floats over it), landing wedge; works both ways.
// Physics = two RO.ramps entries (the launch code fires at the lip because the gap is road again), registered only while within LIFE_R.
const LIFE_KK={len:9,hgt:1.8,gap:5,w:6,half:11.5,col:'#ffc800'};
function LIFE_kick(it){if(it.kk!==undefined)return it.kk;const K=LIFE_KK,fx=Math.sin(it.h),fz=Math.cos(it.h);it.kk=null;
  // sink-1: never on a garage forecourt (the city starts at a garage: Athens put this kicker under the parked start car, two tyres in its side rail)
  if((RO.marks||[]).some(m=>m.kind==='garage'&&Math.hypot(m.x-it.x,m.z-it.z)<35+K.half))return null;let y0=1e9;
  // ramps-r21q: the 6 m wedge pair spans an 8 m Athens street (75 %); a kicker needs a street >= 15 m wide (<= 40 %, a clear lane beside it)
  {const q=cityAt(it.x,it.z);if(q&&q.road&&q.d<q.road.w/2+8&&q.road.w<K.w/.4)return null}
 for(const a of[-K.half,-K.gap/2,0,K.gap/2,K.half])for(const b of[-K.w/2,K.w/2]){const x=it.x+fx*a+fz*b,z=it.z+fz*a-fx*b,g=LIFE_gy(x,z);
  if(!isFinite(g)||Math.abs(g-it.y)>.8||Math.abs(groundAt(x,z,it.y+1)-g)>.3||roamHit(x,z,.8,g+1))return null;y0=Math.min(y0,g)}
 const m=K.gap/2+K.len/2,R=s=>({x:it.x+fx*m*s,z:it.z+fz*m*s,h:s<0?it.h:it.h+Math.PI,len:K.len,hgt:K.hgt,w:K.w,y0,dk:false,col:0xffcd03,lx:1});
 return it.kk={A:R(-1),B:R(1),y0}}
function LIFE_kickSync(L){const want=new Set();for(const it of L)if(it.c==='pop'&&it.K.k==='air'&&LIFE_kick(it))want.add(it);
 for(const it of LIFE.KK||[])if(!want.has(it))for(const r of[it.kk.A,it.kk.B]){const i=RO.ramps.indexOf(r);if(i>=0)RO.ramps.splice(i,1)}
 for(const it of want)if(!(LIFE.KK||new Set()).has(it))RO.ramps.push(it.kk.A,it.kk.B);LIFE.KK=want}
function LIFE_kickGeo(){const K=LIFE_KK,P=[],wedge=(a0,a1,up)=>{const S=new THREE.Shape();S.moveTo(a0,0);S.lineTo(a1,0);S.lineTo(up>0?a1:a0,K.hgt);S.closePath();
  const g=new THREE.ExtrudeGeometry(S,{depth:K.w,bevelEnabled:false});g.rotateY(-Math.PI/2);g.translate(K.w/2,0,0);return g};
 P.push([wedge(-K.half,-K.gap/2,1),K.col],[wedge(K.gap/2,K.half,-1),K.col]);
 // black/yellow lip bands and red side rails, so it reads as a jump from far away
 for(const s of[-1,1])for(let i=0;i<6;i++)P.push([LB(K.w/6,.3,.5),i%2?'#1b1c22':'#ffffff',-K.w/2+K.w/12+i*K.w/6,K.hgt-.15+.01,s*(K.gap/2+.25)]);
 const sl=Math.atan2(K.hgt,K.len),hy=Math.hypot(K.len,K.hgt);for(const s of[-1,1])for(const b of[-1,1])P.push([LB(.3,.3,hy),'#e8302a',b*(K.w/2-.15),K.hgt/2+.2,s*(K.gap/2+K.len/2),s*sl,0,0]);
 return LIFE_g(P)}
// ---------- life-2: real LEGO sets (src/assets/lx/ld.js, LDraw OMR CCAL 2.0): Ferris wheel 3681 + Merry-Go-Round 3668 (Fabuland, Philo), turbine 7747 (Mad_Marc).
// Each set is split into part groups sharing one frame (base / rotor / seat); one merged geometry per material per group keeps the draw calls low.
const LIFE_DS=new Map();// Fabuland parts are converted with every face (LD_ALL=1): drawn double-sided
function LIFE_ldM(B,ds){const by=new Map();for(const[geo,m0]of LDW_geo(B)){let mat=m0;if(ds){if(!LIFE_DS.has(m0)){const c=m0.clone();c.side=THREE.DoubleSide;LIFE_DS.set(m0,c)}mat=LIFE_DS.get(m0)}if(!by.has(mat))by.set(mat,[]);const g=geo.index?geo.toNonIndexed():geo;for(const k of Object.keys(g.attributes))if(!['position','normal','color'].includes(k))g.deleteAttribute(k);by.get(mat).push(g)}
 return[...by].map(([mat,G])=>[G.length>1?mergeGeometries(G):G[0],mat])}
function LIFE_ldBox(L){const b=new THREE.Box3();for(const[g]of L){g.computeBoundingBox();b.union(g.boundingBox)}return b}
// flag: real sets on (default) unless ?ldlm=0; the turbine: 7747's pylon + head, blades turn about local z, height 16 m
const LIFE_LD=()=>LIFE.ldOn!==false&&!/[?&]ldlm=0/.test(location.search)&&typeof LD_MODELS!=='undefined'&&typeof LDW_geo==='function';
function LIFE_ldTurb(){if(!LIFE_LD()||!LD_MODELS.lxwt_base)return null;const one=L=>{const G=L.map(([g])=>g);const g=G.length>1?mergeGeometries(G):G[0];return g};
 const base=one(LIFE_ldM(LD_br('lxwt_base'))),rot=one(LIFE_ldM(LD_br('lxwt_rotor')));rot.computeBoundingBox();let rs=rot.boundingBox.getSize(new THREE.Vector3());
 if(rs.x<rs.z){base.rotateY(Math.PI/2);rot.rotateY(Math.PI/2)}base.computeBoundingBox();rot.computeBoundingBox();const bb=base.boundingBox.clone().union(rot.boundingBox),c=rot.boundingBox.getCenter(new THREE.Vector3()),bc=bb.getCenter(new THREE.Vector3()),S=16/(bb.max.y-bb.min.y);
 base.translate(-bc.x,-bb.min.y,-bc.z);base.scale(S,S,S);rot.translate(-c.x,-c.y,-c.z);rot.scale(S,S,S);
 for(const g of[base,rot])g.setAttribute('uv',new THREE.BufferAttribute(new Float32Array(g.attributes.position.count*2),2));
 const bs=bb.getSize(new THREE.Vector3());return{geo:[base,rot],hub:{x:(c.x-bc.x)*S,y:(c.y-bb.min.y)*S,z:(c.z-bc.z)*S},w:bs.x*S,d:bs.z*S}}
function LIFE_ldLm(fra){const p=fra?'lxfw':'lxmg';if(!LIFE_LD()||!LD_MODELS[p+'_base']||typeof LDW_geo!=='function')return null;
 const base=LIFE_ldM(LD_br(p+'_base'),1),rot=LIFE_ldM(LD_br(p+'_rotor'),1),rb=LIFE_ldBox(rot),bb=LIFE_ldBox(base).union(rb),c=rb.getCenter(new THREE.Vector3()),sz=rb.getSize(new THREE.Vector3());
 const ax=fra?(sz.x<sz.z?'x':'z'):'y';if(!fra)c.y=0;const inner=new THREE.Group(),piv=new THREE.Group();piv.position.copy(c);
 for(const[g,m]of base)inner.add(new THREE.Mesh(g,m));for(const[g,m]of rot){g.translate(-c.x,-c.y,-c.z);piv.add(new THREE.Mesh(g,m))}inner.add(piv);
 const hang=[],seat=[];if(fra){const SB=LD_br(p+'_seat'),T=SB.find(b=>!b.R)||SB[0],tl=LIFE_ldM([T],1),tb=LIFE_ldBox(tl),tc=tb.getCenter(new THREE.Vector3()),th=tb.max.y-tc.y;
  for(const b of SB){const q=LIFE_ldBox(LIFE_ldM([b])).getCenter(new THREE.Vector3());q.y+=th;hang.push(q.sub(c))}bb.union(LIFE_ldBox(tl));
  for(const[g,m]of tl){g.translate(-tc.x,-tc.y-th,-tc.z);const im=new THREE.InstancedMesh(g,m,SB.length);im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);im.frustumCulled=false;seat.push(im);inner.add(im)}}
 const bs=bb.getSize(new THREE.Vector3()),S=fra?22/bs.y:17/Math.max(bs.x,bs.z),bc=bb.getCenter(new THREE.Vector3());inner.scale.setScalar(S);inner.position.set(-bc.x*S,-bb.min.y*S,-bc.z*S);
 const M=new THREE.Matrix4(),v=new THREE.Vector3();
 const upd=a=>{const ca=Math.cos(a),sa=Math.sin(a);for(let i=0;i<hang.length;i++){const h=hang[i];if(ax==='x')v.set(h.x,h.y*ca-h.z*sa,h.y*sa+h.z*ca);else v.set(h.x*ca-h.y*sa,h.x*sa+h.y*ca,h.z);
  M.makeTranslation(c.x+v.x,c.y+v.y,c.z+v.z);for(const im of seat){im.setMatrixAt(i,M);im.instanceMatrix.needsUpdate=true}}};upd(0);
 return{inner,piv,ax,upd,r:Math.min(bs.x,bs.z)*S/2*.9,w:bs.x*S,d:bs.z*S,h:bs.y*S,S}}
// ---------- landmarks: Frankfurt Ferris wheel on the Main bank; Athens big carousel in Pedion tou Areos (one mesh pair each, always drawn within 900 m)
function LIFE_landmark(){LIFE.lm=null;const fra=CID==='fra';let at=null;
 const tryAt=(x,z,r)=>{for(let k=0;k<60&&!at;k++){const a=k*2.39,d=k*4,px=x+Math.sin(a)*d,pz=z+Math.cos(a)*d,y=LIFE_gy(px,pz);if(isFinite(y)&&LIFE_free(px,pz,r,y))at={x:px,z:pz,y}}};
 if(fra&&typeof MAINR!=='undefined'&&MAINR&&MAINR.pts){const P=MAINR.pts;let bp=P[0],bd=1e18;for(const p of P){const d=(p.x-150)**2+(p.z+120)**2;if(d<bd){bd=d;bp=p}}
  tryAt(bp.x-bp.tz*(bp.hw+22),bp.z+bp.tx*(bp.hw+22),9);if(at)at.h=Math.atan2(bp.tx,bp.tz)}
 else if(!fra)tryAt(1250,-60,7);if(!at)return;
 const g=new THREE.Group(),P=Math.PI,LD=LIFE.pre&&'lm'in LIFE.pre?LIFE.pre.lm:LIFE_ldLm(fra);if(LD){g.add(LD.inner);LIFE.lm={g,spin:LD.piv,ax:LD.ax,upd:LD.upd,ld:LD,k:fra?'Ferris wheel':'big carousel',...at}}
 else if(fra){const base=LIFE_g([[LB(1.2,24,1.2),'#e8e8f0',-3,11,0,0,0,.25],[LB(1.2,24,1.2),'#e8e8f0',3,11,0,0,0,-.25],[LB(1.2,24,1.2),'#e8e8f0',-3,11,4,0,0,.25],[LB(1.2,24,1.2),'#e8e8f0',3,11,4,0,0,-.25],[LB(10,1,7),'#7a7e86',0,.5,2]]);
   const sp=[];for(let i=0;i<16;i++){const a=i*P/8;sp.push([LB(.35,21,.35),'#f2f2f2',0,0,0,0,0,a]);sp.push([LB(1.6,1.6,1.6),LIFE_SHIRT[i%8],Math.sin(a)*10.5,Math.cos(a)*10.5-1.2,0])}
   sp.push([new THREE.TorusGeometry(10.5,.3,6,40),'#e8302a',0,0,0]);sp.push([LC(.8,.8,5,10),'#666',0,0,2,P/2]);const wheel=LIFE_g(sp);
   const mb=new THREE.Mesh(base,LV_mat()),mw=new THREE.Mesh(wheel,LV_mat());mw.position.set(0,23,2);g.add(mb,mw);LIFE.lm={g,spin:mw,ax:'z',k:'Ferris wheel',...at}}
 else{const base=LIFE_g([[LC(8,8,.6,24),'#c84060',0,.3,0],[LC(.6,.6,7,10),'#ffd12c',0,3.5,0],[LC(0,8.6,3,16),'#ffffff',0,8.6,0],[LC(8.6,8.6,.6,16),'#1f5fbf',0,7,0]]);
   const H=[];for(let i=0;i<12;i++){const a=i*P/6;H.push([LB(.7,1.8,2.2),LIFE_SHIRT[i%8],Math.sin(a)*6,2.2,Math.cos(a)*6,0,a,0]);H.push([LC(.08,.08,6,4),'#ffd12c',Math.sin(a)*6,3.6,Math.cos(a)*6])}
   const mb=new THREE.Mesh(base,LV_mat()),mh=new THREE.Mesh(LIFE_g(H),LV_mat());g.add(mb,mh);LIFE.lm={g,spin:mh,ax:'y',k:'big carousel',...at}}
 g.traverse(o=>{o.userData.keep=1});/* not merged by WB city batching: the wheel turns */g.position.set(at.x,at.y,at.z);g.rotation.y=at.h||0;LIFE.grp.add(g);const r=LD?LD.r:fra?6:8.5;LIFE.lm.r=r}
// ---------- fill: items within LIFE_R m, nearest first, into the pools (every 12 frames or 20 m)
function LIFE_fill(){const x0=RO.x,z0=RO.z,cr=Math.ceil(LIFE_R/LIFE_CELL),ca=Math.floor(x0/LIFE_CELL),cb=Math.floor(z0/LIFE_CELL),near=[],t0=performance.now();let todo=false;
 const cl=[];for(let a=ca-cr;a<=ca+cr;a++)for(let b=cb-cr;b<=cb+cr;b++)cl.push([(a-ca)**2+(b-cb)**2,a,b]);cl.sort((p,q)=>p[0]-q[0]);/* r9d: nearest cells first, so the 1.5 ms budget drops the far ring and never the cells around the car (people near the player react on the same frame) */
 const cap=typeof TWG!=='undefined'&&TWG.lvc&&TWG.fr>=0&&TWG.fr<=TWG.fw?1:99;let nb=0;/* ios-r17o: first 120 drivable frames: one new cell build per fill */
 for(const [,a,b] of cl){if(!LIFE.C.has(a*100000+b)){if(performance.now()-t0>1.5||nb>=cap){todo=true;continue}nb++}for(const it of LIFE_cell(a,b)){const d=(it.x-x0)**2+(it.z-z0)**2;if(d<LIFE_R*LIFE_R)near.push([d,it])}}
 const pr=Math.ceil(LIFE_R/LIFE_PG);for(let a=Math.floor(x0/LIFE_PG)-pr;a<=Math.floor(x0/LIFE_PG)+pr;a++)for(let b=Math.floor(z0/LIFE_PG)-pr;b<=Math.floor(z0/LIFE_PG)+pr;b++){const it=LIFE_pop(a,b);if(it){const d=(it.x-x0)**2+(it.z-z0)**2;if(d<LIFE_R*LIFE_R)near.push([d,it])}}
 near.sort((p,q)=>p[0]-q[0]);const keep=new Set(),L=[];for(const [,it] of near){keep.add(it.id);if(!LIFE.dead.has(it.id))L.push(it)}
 for(const id of LIFE.dead.keys())if(!keep.has(id))LIFE.dead.delete(id);// smashed things come back once you are out of range
 LIFE_kickSync(L);LIFE.L=L;LIFE.D=L.filter(it=>it.c==='pop'||it.c==='set'||it.c==='grp'&&(it.x-x0)**2+(it.z-z0)**2<150*150);LIFE.H=L.filter(it=>(it.x-x0)**2+(it.z-z0)**2<40*40);
 LIFE_draw(true);LIFE.todo=todo?LIFE.fr+3:0}/* life-2: unbuilt cells → another ≤ 1.5 ms step 3 frames later (was 3 ms every frame after a teleport) */
// ---------- draw (every frame: the pools are small; static parts are rewritten too, which keeps the code simple and costs ~0.1 ms)
const _lfM=new THREE.Matrix4(),_lfQ=new THREE.Quaternion(),_lfE=new THREE.Euler(),_lfP=new THREE.Vector3(),_lfS=new THREE.Vector3();
// static pools (smashables x_, set-piece bases s_, group props q_) are written only on a refill (LIFE.S), the rest every frame
// perf-r13j: LIFE_put / LIFE_fig / LIFE_pp take their numbers through Float64Array slots (_lfA/_lfF/_lfB, written by the caller), not float args: a non-inlined call boxed every double arg (~137 MB / 60 s in LIFE_draw)
const _lfA=new Float64Array(7),_lfF=new Float64Array(7),_lfB=new Float64Array(6);
function LIFE_put(m,cnt,o){const x=_lfA[0],y=_lfA[1],z=_lfA[2],rx=_lfA[3],ry=_lfA[4],rz=_lfA[5],s=_lfA[6];const k=m.name||'';if(LIFE.S!==!!m.userData.st)return -1;if(cnt[k]==null)cnt[k]=0;if(cnt[k]>=m.instanceMatrix.count)return -1;_lfE.set(rx,ry,rz,o||'YXZ');_lfQ.setFromEuler(_lfE);
 _lfM.compose(_lfP.set(x,y,z),_lfQ,_lfS.set(s,s,s));const i=cnt[k]++;m.setMatrixAt(i,_lfM);return i}
const _lfC=new THREE.Color();
function LIFE_fig(cnt,ci){const x=_lfF[0],y=_lfF[1],z=_lfF[2],h=_lfF[3],arm=_lfF[4],hop=_lfF[5],lean=_lfF[6];const M=LIFE.M,i=cnt.fig||0;if(LIFE.S||i>=LIFE_CAP.fig)return;(_lfA[0]=x,_lfA[1]=y+hop,_lfA[2]=z,_lfA[3]=lean||0,_lfA[4]=h,_lfA[5]=0,_lfA[6]=1,LIFE_put(M.fig,cnt));(_lfA[0]=x,_lfA[1]=y+hop,_lfA[2]=z,_lfA[3]=lean||0,_lfA[4]=h,_lfA[5]=0,_lfA[6]=1,LIFE_put(M.torso,cnt));
 (_lfA[0]=x,_lfA[1]=y+hop+1.38,_lfA[2]=z,_lfA[3]=(lean||0)+arm,_lfA[4]=h,_lfA[5]=0,_lfA[6]=1,LIFE_put(M.arms,cnt));if(ci!=null&&LIFE.ci[i]!==ci){LIFE.ci[i]=ci;_lfC.set(LIFE_SHIRT[ci%LIFE_SHIRT.length]);M.torso.setColorAt(i,_lfC);M.arms.setColorAt(i,_lfC);LIFE.cd=1}}
function LIFE_ringCam(x,y,z){const cp=camera.position;return(cp.x-x)**2+(cp.z-z)**2<7.5*7.5&&Math.abs(cp.y-y)<6}
// perf-r10a: LIFE_draw figure poses go into pooled 6-slot arrays (was a fresh [x,z,h,arm,hop,lean] per figure per frame + one P per group = top Athens allocator)
const LIFE_PA=[];LIFE_PA.n=0;function LIFE_pp(){const P=LIFE_PA,B=_lfB;let r=P[P.n];if(!r)r=P[P.n]=[0,0,0,0,0,0];r[0]=B[0];r[1]=B[1];r[2]=B[2];r[3]=B[3];r[4]=B[4];r[5]=B[5];P.n++}
// perf-r13i: the per-pool instance counters are two reused objects (static / dynamic pass), zeroed per call, not a fresh dictionary per frame
const LIFE_CN=[{},{}];function LIFE_cnt(S){const o=LIFE_CN[S?1:0];for(const k in o)o[k]=0;return o}
function LIFE_draw(S){LIFE.S=!!S;const M=LIFE.M,t=LIFE.t,cnt=LIFE_cnt(S),sp=Math.abs(RO.v),air=!!(typeof pl!=='undefined'&&pl&&pl.air),dr=!!RO.dDir,stunt=air||dr&&sp>8;LIFE.ci=LIFE.ci||[];
 let cheer=0;
 for(const it of S?LIFE.L:LIFE.D){const dx=it.x-RO.x,dz=it.z-RO.z,d2=dx*dx+dz*dz;
  if(it.c==='sm')(_lfA[0]=it.x,_lfA[1]=it.y,_lfA[2]=it.z,_lfA[3]=0,_lfA[4]=it.h,_lfA[5]=0,_lfA[6]=1,LIFE_put(M[it.kx||(it.kx='x_'+it.t)],cnt));
  else if(it.c==='pop'){const kk=it.kk,hy=kk?kk.y0-it.y+LIFE_KK.hgt+2.4:3.2;if(kk)(_lfA[0]=it.x,_lfA[1]=kk.y0,_lfA[2]=it.z,_lfA[3]=0,_lfA[4]=it.h,_lfA[5]=0,_lfA[6]=1,LIFE_put(M.kick,cnt));const busy=it.cd>t;if(busy)continue;/* r8: never draw the 6 m marker ring (2.6 x 2.3) with the camera inside it or within 1.5 m of its rim (v88v torus rule): at the Athens spawn the camera sat 1.7 m from a ring centre = the cyan ellipse/arc over the lower screen. 7.5 m from the centre the car (~6 m ahead of the camera) is already in the 4.2 m pickup */if(LIFE_ringCam(it.x,it.y,it.z)){LIFE.ringCam=(LIFE.ringCam||0)+1;continue}const i=(_lfA[0]=it.x,_lfA[1]=it.y+.35,_lfA[2]=it.z,_lfA[3]=Math.PI/2,_lfA[4]=0,_lfA[5]=0,_lfA[6]=2.3,LIFE_put(M.ring,cnt));/* r3E: a flat ground ring like every other marker; the floating translucent sphere over the lane is gone */if(i>=0){_lfC.set(it.K.col);M.ring.setColorAt(i,_lfC)}}
  else if(it.c==='set'){const T=it.t,tt=t+it.ph;(_lfA[0]=it.x,_lfA[1]=it.y,_lfA[2]=it.z,_lfA[3]=0,_lfA[4]=it.h,_lfA[5]=0,_lfA[6]=1,LIFE_put(M[it.ks||(it.ks='s_'+T)],cnt));const m=M[it.km||(it.km='m_'+T)];
   if(T==='windmill')(_lfA[0]=it.x+Math.sin(it.h)*1.25,_lfA[1]=it.y+7.2,_lfA[2]=it.z+Math.cos(it.h)*1.25,_lfA[3]=0,_lfA[4]=it.h,_lfA[5]=tt*1.4,_lfA[6]=1,LIFE_put(m,cnt));
   else if(T==='turbine'){const H=LIFE.TB;if(H){const c=Math.cos(it.h),sn=Math.sin(it.h);(_lfA[0]=it.x+H.x*c+H.z*sn,_lfA[1]=it.y+H.y,_lfA[2]=it.z-H.x*sn+H.z*c,_lfA[3]=0,_lfA[4]=it.h,_lfA[5]=tt*2.2,_lfA[6]=1,LIFE_put(m,cnt))}else (_lfA[0]=it.x+Math.sin(it.h)*1.2,_lfA[1]=it.y+13.2,_lfA[2]=it.z+Math.cos(it.h)*1.2,_lfA[3]=0,_lfA[4]=it.h,_lfA[5]=tt*2.2,_lfA[6]=1,LIFE_put(m,cnt))}
   else if(T==='fountain'){const i=(_lfA[0]=it.x,_lfA[1]=it.y+2.2,_lfA[2]=it.z,_lfA[3]=0,_lfA[4]=tt,_lfA[5]=0,_lfA[6]=1,LIFE_put(m,cnt));if(i>=0){_lfS.set(1,1+Math.sin(tt*5)*.18+Math.sin(tt*3.1)*.12,1);_lfM.compose(_lfP,_lfQ,_lfS);m.setMatrixAt(i,_lfM)}}
   else if(T==='banner')(_lfA[0]=it.x,_lfA[1]=it.y+6.3,_lfA[2]=it.z,_lfA[3]=0,_lfA[4]=it.h+Math.sin(tt*1.7)*.5,_lfA[5]=Math.sin(tt*4.3)*.06,_lfA[6]=1,LIFE_put(m,cnt));
   else if(T==='billboard')(_lfA[0]=it.x,_lfA[1]=it.y+5.3,_lfA[2]=it.z,_lfA[3]=0,_lfA[4]=tt*.7,_lfA[5]=0,_lfA[6]=1,LIFE_put(m,cnt));
   else if(T==='crane')(_lfA[0]=it.x,_lfA[1]=it.y+18.6,_lfA[2]=it.z,_lfA[3]=0,_lfA[4]=it.h+Math.sin(tt*.18)*1.3,_lfA[5]=0,_lfA[6]=1,LIFE_put(m,cnt));
   else if(T==='balloons')(_lfA[0]=it.x+Math.sin(tt*.9)*.25,_lfA[1]=it.y+4.2+Math.sin(tt*1.3)*.25,_lfA[2]=it.z,_lfA[3]=Math.sin(tt*1.1)*.12,_lfA[4]=tt*.2,_lfA[5]=Math.sin(tt*.8)*.12,_lfA[6]=1,LIFE_put(m,cnt));
   else if(T==='carousel')(_lfA[0]=it.x,_lfA[1]=it.y+Math.sin(tt*2)*.12,_lfA[2]=it.z,_lfA[3]=0,_lfA[4]=tt*.9,_lfA[5]=0,_lfA[6]=1,LIFE_put(m,cnt));
   // life-2 pieces (local x = along the frame/plank: (cos h, -sin h); local z = (sin h, cos h))
   else if(T==='swings'||T==='seesaw'||T==='teacups'||T==='sprinkler'){const ch=Math.cos(it.h),sh=Math.sin(it.h),kid=!LIFE.S&&d2<120*120;
    if(T==='swings')for(let k=0;k<2;k++){const a=Math.sin(tt*2.2+k*Math.PI)*.75,lx=(k?.75:-.75),x=it.x+ch*lx,z=it.z-sh*lx;(_lfA[0]=x,_lfA[1]=it.y+2.7,_lfA[2]=z,_lfA[3]=a,_lfA[4]=it.h,_lfA[5]=0,_lfA[6]=1,LIFE_put(m,cnt));
     if(kid)(_lfF[0]=x+sh*-2.04*Math.sin(a),_lfF[1]=it.y,_lfF[2]=z+ch*-2.04*Math.sin(a),_lfF[3]=it.h+(a>0?0:0),_lfF[4]=-1.9,_lfF[5]=2.7-2.04*Math.cos(a)-.9,_lfF[6]=a*.6,LIFE_fig(cnt,(it.id+k*5)&1023))}
    else if(T==='seesaw'){const a=Math.sin(tt*1.6)*.3;(_lfA[0]=it.x,_lfA[1]=it.y+.68,_lfA[2]=it.z,_lfA[3]=0,_lfA[4]=it.h,_lfA[5]=a,_lfA[6]=1,LIFE_put(m,cnt));if(kid)for(const e of[-1.75,1.75]){const lx=e*Math.cos(a);(_lfF[0]=it.x+ch*lx,_lfF[1]=it.y,_lfF[2]=it.z-sh*lx,_lfF[3]=it.h+(e<0?Math.PI/2:-Math.PI/2),_lfF[4]=-1.6,_lfF[5]=.7+e*Math.sin(a)-.8,_lfF[6]=0,LIFE_fig(cnt,(it.id+(e<0?1:7))&1023))}}
    else if(T==='teacups'){const a=tt*.7;(_lfA[0]=it.x,_lfA[1]=it.y+.3,_lfA[2]=it.z,_lfA[3]=0,_lfA[4]=a,_lfA[5]=0,_lfA[6]=1,LIFE_put(m,cnt));if(kid)for(let k=0;k<4;k++){const b=a+k*Math.PI/2;(_lfF[0]=it.x+Math.sin(b)*2.2,_lfF[1]=it.y,_lfF[2]=it.z+Math.cos(b)*2.2,_lfF[3]=b+tt*2,_lfF[4]=-2.5+Math.sin(tt*6+k)*.3,_lfF[5]=.2,_lfF[6]=0,LIFE_fig(cnt,(it.id+k*3)&1023))}}
    else (_lfA[0]=it.x,_lfA[1]=it.y+.4,_lfA[2]=it.z,_lfA[3]=0,_lfA[4]=tt*1.8,_lfA[5]=0,_lfA[6]=1,LIFE_put(m,cnt))}}
  else if(it.c==='grp'){if(d2>130*130)continue;const T=it.t,tt=t+it.ph,near=d2<45*45,ch=near&&stunt;if(ch)cheer++;
   const fx=Math.sin(it.h),fz=Math.cos(it.h),rx=-fz,rz=fx;// fx,fz: toward the road; rx,rz: along the kerb
   const P=LIFE_PA;P.n=0;// [x,z,h,arm,hop,lean]
   if(T==='cafe'){(_lfA[0]=it.x,_lfA[1]=it.y,_lfA[2]=it.z,_lfA[3]=0,_lfA[4]=0,_lfA[5]=0,_lfA[6]=1,LIFE_put(M.q_cafe,cnt));for(let k=0;k<3;k++){const a=k*2.1+.4,x=it.x+Math.sin(a)*.95,z=it.z+Math.cos(a)*.95;(_lfB[0]=x,_lfB[1]=z,_lfB[2]=a+Math.PI,_lfB[3]=-.5-Math.max(0,Math.sin(tt*2+k*2))*.9,_lfB[4]=0,_lfB[5]=0,LIFE_pp())}}
   else if(T==='market'){(_lfA[0]=it.x,_lfA[1]=it.y,_lfA[2]=it.z,_lfA[3]=0,_lfA[4]=it.h+Math.PI,_lfA[5]=0,_lfA[6]=1,LIFE_put(M.q_market,cnt));(_lfB[0]=it.x-fx*.9,_lfB[1]=it.z-fz*.9,_lfB[2]=it.h+Math.PI,_lfB[3]=-.4+Math.sin(tt*3)*.3,_lfB[4]=0,_lfB[5]=0,LIFE_pp());for(let k=0;k<3;k++){const w=Math.sin(tt*.5+k*2)*1.6;(_lfB[0]=it.x+fx*1.2+rx*(k-1)*1.1+rx*w*.3,_lfB[1]=it.z+fz*1.2+rz*(k-1)*1.1+rz*w*.3,_lfB[2]=it.h+Math.PI+Math.sin(tt+k)*.5,_lfB[3]=-.2,_lfB[4]=0,_lfB[5]=0,LIFE_pp())}}
   else if(T==='band'){(_lfA[0]=it.x,_lfA[1]=it.y,_lfA[2]=it.z,_lfA[3]=0,_lfA[4]=it.h,_lfA[5]=0,_lfA[6]=1,LIFE_put(M.q_band,cnt));for(let k=0;k<3;k++){const b=Math.abs(Math.sin(tt*6+k))*.12;(_lfB[0]=it.x+rx*(k-1)*1.1,_lfB[1]=it.z+rz*(k-1)*1.1,_lfB[2]=it.h,_lfB[3]=-1.1+Math.sin(tt*7+k*1.3)*.5,_lfB[4]=b,_lfB[5]=0,LIFE_pp())}}
   else if(T==='football'){(_lfA[0]=it.x,_lfA[1]=it.y,_lfA[2]=it.z,_lfA[3]=0,_lfA[4]=it.h+Math.PI/2,_lfA[5]=0,_lfA[6]=1,LIFE_put(M.q_football,cnt));const bxp=Math.sin(tt*1.3)*2.4,bzp=Math.sin(tt*2.1)*1.3,bx=it.x+rx*bxp+fx*bzp,bz=it.z+rz*bxp+fz*bzp;
    (_lfA[0]=bx,_lfA[1]=it.y+Math.abs(Math.sin(tt*4))*.5,_lfA[2]=bz,_lfA[3]=tt*4,_lfA[4]=0,_lfA[5]=0,_lfA[6]=1,LIFE_put(M.ball,cnt));for(let k=0;k<4;k++){const a=tt*.9+k*1.57,x=bx+Math.sin(a)*1.4*(1+k*.3),z=bz+Math.cos(a)*1.4*(1+k*.3);(_lfB[0]=x,_lfB[1]=z,_lfB[2]=Math.atan2(bx-x,bz-z),_lfB[3]=Math.sin(tt*8+k)*.6,_lfB[4]=Math.abs(Math.sin(tt*8+k))*.1,_lfB[5]=0,LIFE_pp())}}
   else if(T==='joggers'||T==='dog'){const run=T==='joggers',L=10,u=((tt*(run?.25:.12))%2+2)%2,s=(u<1?u:2-u)*2*L-L,dir=u<1?0:Math.PI,hx=it.h+Math.PI/2+dir;
    for(let k=0;k<(run?2:1);k++){const x=it.x+rx*(s-k*1.2)-fx*k*.7,z=it.z+rz*(s-k*1.2)-fz*k*.7;(_lfB[0]=x,_lfB[1]=z,_lfB[2]=Math.atan2(rx*(u<1?1:-1),rz*(u<1?1:-1)),_lfB[3]=Math.sin(tt*(run?9:5))*.7,_lfB[4]=run?Math.abs(Math.sin(tt*9))*.12:0,_lfB[5]=run?.12:0,LIFE_pp())}
    if(!run){const x=it.x+rx*(s+(u<1?1.6:-1.6)),z=it.z+rz*(s+(u<1?1.6:-1.6));(_lfA[0]=x,_lfA[1]=it.y+Math.abs(Math.sin(tt*10))*.06,_lfA[2]=z,_lfA[3]=0,_lfA[4]=Math.atan2(rx*(u<1?1:-1),rz*(u<1?1:-1)),_lfA[5]=0,_lfA[6]=1,LIFE_put(M.dog,cnt))}}
   else if(T==='fans'){(_lfA[0]=it.x-fx*.8,_lfA[1]=it.y,_lfA[2]=it.z-fz*.8,_lfA[3]=0,_lfA[4]=it.h,_lfA[5]=0,_lfA[6]=1,LIFE_put(M.q_fans,cnt));for(let k=0;k<3;k++){const wv=d2<35*35&&sp>3;(_lfB[0]=it.x+rx*(k-1)*.9,_lfB[1]=it.z+rz*(k-1)*.9,_lfB[2]=it.h,_lfB[3]=wv?-2.7+Math.sin(tt*9+k)*.35:-.15,_lfB[4]=wv?Math.abs(Math.sin(tt*5+k))*.15:0,_lfB[5]=0,LIFE_pp())}}
   else if(T==='works'){(_lfA[0]=it.x,_lfA[1]=it.y,_lfA[2]=it.z,_lfA[3]=0,_lfA[4]=it.h,_lfA[5]=0,_lfA[6]=1,LIFE_put(M.q_works,cnt));for(let k=0;k<2;k++)(_lfB[0]=it.x-fx*.9+rx*(k?1:-1)*1.2,_lfB[1]=it.z-fz*.9+rz*(k?1:-1)*1.2,_lfB[2]=it.h+(k?-2.2:2.2),_lfB[3]=-1.3+Math.abs(Math.sin(tt*5+k*1.7))*1.1,_lfB[4]=0,_lfB[5]=.25*Math.abs(Math.sin(tt*5+k*1.7)),LIFE_pp())}
   // life-2 activities
   else if(T==='picnic'){(_lfA[0]=it.x,_lfA[1]=it.y,_lfA[2]=it.z,_lfA[3]=0,_lfA[4]=it.h,_lfA[5]=0,_lfA[6]=1,LIFE_put(M.q_picnic,cnt));for(let k=0;k<3;k++){const a=k*2.1+.3,x=it.x+Math.sin(a)*.95,z=it.z+Math.cos(a)*.95;(_lfB[0]=x,_lfB[1]=z,_lfB[2]=a+Math.PI,_lfB[3]=-1+Math.max(0,Math.sin(tt*1.7+k*2.3))*-.9,_lfB[4]=-.5,_lfB[5]=0,LIFE_pp())}}
   else if(T==='painter'){(_lfA[0]=it.x,_lfA[1]=it.y,_lfA[2]=it.z,_lfA[3]=0,_lfA[4]=it.h,_lfA[5]=0,_lfA[6]=1,LIFE_put(M.q_painter,cnt));(_lfB[0]=it.x-fx*.75,_lfB[1]=it.z-fz*.75,_lfB[2]=it.h,_lfB[3]=-1.5+Math.sin(tt*4)*.35,_lfB[4]=0,_lfB[5]=Math.sin(tt*.7)*.05,LIFE_pp());const w=Math.sin(tt*.4)*.6;(_lfB[0]=it.x-fx*1.7+rx*(1+w),_lfB[1]=it.z-fz*1.7+rz*(1+w),_lfB[2]=it.h+.4,_lfB[3]=-.1,_lfB[4]=0,_lfB[5]=.12,LIFE_pp())}
   else if(T==='icecream'){(_lfA[0]=it.x,_lfA[1]=it.y,_lfA[2]=it.z,_lfA[3]=0,_lfA[4]=it.h,_lfA[5]=0,_lfA[6]=1,LIFE_put(M.q_icecream,cnt));(_lfB[0]=it.x-fx*.9,_lfB[1]=it.z-fz*.9,_lfB[2]=it.h,_lfB[3]=-1.3+Math.max(0,Math.sin(tt*2))*-.8,_lfB[4]=0,_lfB[5]=0,LIFE_pp());const q=((tt*.15)%1+1)%1;
    for(let k=0;k<3;k++){const d=1.1+k*.8-q*.8;(_lfB[0]=it.x+fx*1.1+rx*d,_lfB[1]=it.z+fz*1.1+rz*d,_lfB[2]=it.h+Math.PI,_lfB[3]=-.2+(k===0?Math.sin(tt*3)*.3:0),_lfB[4]=0,_lfB[5]=0,LIFE_pp())}const w=q*6;(_lfB[0]=it.x+fx*1.6-rx*(1+w),_lfB[1]=it.z+fz*1.6-rz*(1+w),_lfB[2]=it.h-Math.PI/2,_lfB[3]=-1.5,_lfB[4]=Math.abs(Math.sin(tt*6))*.05,_lfB[5]=0,LIFE_pp())}
   else if(T==='juggler'){(_lfA[0]=it.x,_lfA[1]=it.y,_lfA[2]=it.z,_lfA[3]=0,_lfA[4]=it.h,_lfA[5]=0,_lfA[6]=1,LIFE_put(M.q_juggler,cnt));(_lfB[0]=it.x,_lfB[1]=it.z,_lfB[2]=it.h,_lfB[3]=-1.5+Math.sin(tt*9)*.25,_lfB[4]=0,_lfB[5]=0,LIFE_pp());if(!LIFE.S)for(let k=0;k<3;k++){const f=tt*3.4+k*2.09,u=Math.sin(f)*.45;(_lfA[0]=it.x+rx*u+fx*.35,_lfA[1]=it.y+1.25+Math.abs(Math.cos(f))*1.1,_lfA[2]=it.z+rz*u+fz*.35,_lfA[3]=0,_lfA[4]=0,_lfA[5]=0,_lfA[6]=.7,LIFE_put(M.ball,cnt))}
    for(let k=0;k<2;k++){const cl=Math.sin(tt*12+k)>.3;(_lfB[0]=it.x+fx*2.1+rx*(k?1:-1)*.9,_lfB[1]=it.z+fz*2.1+rz*(k?1:-1)*.9,_lfB[2]=it.h+Math.PI,_lfB[3]=cl?-1.4:-1.1,_lfB[4]=0,_lfB[5]=0,LIFE_pp())}}
   else if(T==='chess'){(_lfA[0]=it.x,_lfA[1]=it.y,_lfA[2]=it.z,_lfA[3]=0,_lfA[4]=it.h,_lfA[5]=0,_lfA[6]=1,LIFE_put(M.q_chess,cnt));for(let k=0;k<2;k++){const sd=k?1:-1,mv=Math.sin(tt*.8+k*3)>.85;(_lfB[0]=it.x+fx*.85*sd,_lfB[1]=it.z+fz*.85*sd,_lfB[2]=it.h+(k?Math.PI:0),_lfB[3]=mv?-1.4:-.6,_lfB[4]=-.38,_lfB[5]=mv?.15:.05,LIFE_pp())}(_lfB[0]=it.x+rx*1.2,_lfB[1]=it.z+rz*1.2,_lfB[2]=it.h-Math.PI/2,_lfB[3]=-.15,_lfB[4]=0,_lfB[5]=.18,LIFE_pp())}
   else if(T==='dance'){(_lfA[0]=it.x-fx*1.6,_lfA[1]=it.y,_lfA[2]=it.z-fz*1.6,_lfA[3]=0,_lfA[4]=it.h,_lfA[5]=0,_lfA[6]=1,LIFE_put(M.q_dance,cnt));for(let k=0;k<5;k++){const a=tt*.8+k*1.2566,x=it.x+Math.sin(a)*1.4,z=it.z+Math.cos(a)*1.4;(_lfB[0]=x,_lfB[1]=z,_lfB[2]=a+Math.PI/2,_lfB[3]=-1.6,_lfB[4]=Math.abs(Math.sin(tt*5+k*.4))*.18,_lfB[5]=Math.sin(tt*2.5)*.1,LIFE_pp())}}
   else if(T==='photo'){(_lfA[0]=it.x-fx*1.2,_lfA[1]=it.y,_lfA[2]=it.z-fz*1.2,_lfA[3]=0,_lfA[4]=it.h,_lfA[5]=0,_lfA[6]=1,LIFE_put(M.q_photo,cnt));(_lfB[0]=it.x-fx*1.6,_lfB[1]=it.z-fz*1.6,_lfB[2]=it.h,_lfB[3]=-2.2,_lfB[4]=0,_lfB[5]=.05,LIFE_pp());for(let k=0;k<3;k++){const pose=Math.sin(tt*.9+k)>0;(_lfB[0]=it.x+fx*1+rx*(k-1)*.8,_lfB[1]=it.z+fz*1+rz*(k-1)*.8,_lfB[2]=it.h+Math.PI,_lfB[3]=pose?-2.8:-.3,_lfB[4]=pose&&k===1?Math.abs(Math.sin(tt*6))*.2:0,_lfB[5]=0,LIFE_pp())}}
   // reactions: jump aside from the car (or fly, harmless, on a direct hit) and cheer at stunts
   for(let k=0;k<P.n;k++){let [x,z,h,arm,hop,lean]=P[k];const fid=it.id*8+k,F=LIFE.fly.get(fid);
    if(F){const e=t-F.t0;if(e>F.T){LIFE.fly.delete(fid)}else{const f=e/F.T;x+=F.dx*Math.min(1,f*1.6);z+=F.dz*Math.min(1,f*1.6);hop+=F.up*4*f*(1-f);arm=-2.8;lean=F.fly?e*9:0}}
    else if(near){const ex=x-RO.x,ez=z-RO.z,e2=ex*ex+ez*ez;if(sp>4&&e2<7*7){const vx=Math.sin(RO.vh??RO.h),vz=Math.cos(RO.vh??RO.h),ahead=ex*vx+ez*vz,lat=ex*vz-ez*vx;
      if(ahead>-1){const hit=e2<1.6*1.6,sd=lat>=0?1:-1,D=hit?6:2.6;LIFE.fly.set(fid,{t0:t,T:hit?1.4:.7,dx:vz*sd*D+(hit?vx*4:0),dz:-vx*sd*D+(hit?vz*4:0),up:hit?3.2:.9,fly:hit});LIFE.n[hit?'fly':'dodge']++;if(hit){try{AU.sfx('brick')}catch(e){}}}}
     if(ch&&!F){arm=-2.8+Math.sin(tt*10+k)*.3;hop=Math.abs(Math.sin(tt*7+k))*.35}}
    (_lfF[0]=x,_lfF[1]=it.y,_lfF[2]=z,_lfF[3]=h,_lfF[4]=arm,_lfF[5]=hop,_lfF[6]=lean,LIFE_fig(cnt,(it.id+k*3)&1023))}}}
 if(cheer&&!S)LIFE.n.cheer++;
 for(const k in M){const m=M[k];if(m.userData.st!==LIFE.S)continue;const n=cnt[k]||0;if(m.isBm){if(n!==m.vis){for(let i=0;i<m.ids.length;i++)m.B.setVisibleAt(m.ids[i],i<n);m.vis=n}m.count=n;m.visible=n>0;continue}m.count=n;m.visible=n>0;if(n){m.instanceMatrix.needsUpdate=true;if(m.instanceColor&&(k==='pop'||k==='ring'||LIFE.cd&&(k==='torso'||k==='arms')))m.instanceColor.needsUpdate=true}}for(const k in M){const B=M[k];if(B.userData.bmk)B.visible=B.userData.P.some(x=>x.visible)}if(!S)LIFE.cd=0;LIFE.S=false;LIFE.cnt=Object.assign(LIFE.cnt||{},cnt)}
// ---------- collisions: smash small things, bump set pieces, drive through pop-up bubbles
// rev-2 (monkey STUCK, Athens start seesaw): a round set-piece collider took 20 % of the speed EVERY frame whatever the angle, so even a glancing
// touch stalled the car against it. Now only the into-the-piece part costs speed and a glancing hit turns the car along the rim (CLAUDE.md lesson 3).
function LIFE_slide(nx,nz,k){const s=RO.v<0?-1:1,hx=Math.sin(RO.h)*s,hz=Math.cos(RO.h)*s,cin=-(hx*nx+hz*nz);if(cin<=0)return;RO.v*=1-k*cin;
 if(s>0&&cin<.95){const side=hx*-nz+hz*nx>=0?1:-1;RO.h+=angDiff(Math.atan2(-nz*side,nx*side),RO.h)*.25}}
function LIFE_hit(){const sp=Math.abs(RO.v),y0=RO.y||0;for(const it of LIFE.H||[]){const ex=RO.x-it.x,ez=RO.z-it.z;if(Math.abs(ex)>9||Math.abs(ez)>9)continue;const e2=ex*ex+ez*ez;
  if(it.c==='sm'){if(e2>1.9*1.9||Math.abs(y0-it.y)>3||LIFE.dead.has(it.id))continue;if(typeof SM2!=='undefined'&&SM2.on&&SM2_life(it,sp,1.9,['#ffffff','#c8904c']))continue;LIFE.dead.set(it.id,1);const at=V3(it.x,it.y+.6,it.z),fw=V3(Math.sin(RO.vh??RO.h),0,Math.cos(RO.vh??RO.h)),
    C={cone:'#ff6a10,#ffffff',crate:'#c8904c,#8a5a30',barrel:'#2f7dd0,#ffffff',fruit:'#a8743c,#ff4040,#7cd04c,#ffd12c',planter:'#b85a3a,#3aa046,#ff4c8c',bin:'#3a8a4a,#2a6a3a'}[it.t];
    try{debris(at,fw.clone().multiplyScalar(Math.max(4,sp)*.4).add(V3(0,6,0)),it.t==='fruit'?14:9,C.split(',').map(c=>new THREE.Color(c)),.7,it.y);studBurst(at,fw,Math.max(6,sp));AU.sfx('brick')}catch(e){}
    HUB.smashed++;comboAdd(1);RO.v*=it.t==='fruit'||it.t==='barrel'?.94:.98;LIFE.n.smash++;LIFE.px=1e9}
  else if(it.c==='set'){const rr=it.r+1.2;if(e2>rr*rr||Math.abs(y0-it.y)>4||LIFE.dead.has(it.id))continue;if(typeof DEST!=='undefined'&&DEST.on&&DEST_set(it,sp,rr))continue;/* dest-1: small set pieces smash / bump */const e=Math.sqrt(e2)||1,o=rr-e;RO.x+=ex/e*o;RO.z+=ez/e*o;LIFE_slide(ex/e,ez/e,typeof DEST!=='undefined'&&DEST.on?.1:.2)}
  else if(it.c==='pop'){if(e2>4.2*4.2||it.cd>LIFE.t||RO.pop||RO.ch||RO.sp||RO.card||(window.__qs&&__qs.act()))continue;/* quiet-start: street pop-up pads never start a side challenge on their own (?intro=1 / ?qs=0 restore) */it.cd=LIFE.t+90;const K=it.K;LIFE.n.pop++;
   RO.pop=Object.assign({},K,{t:0,v:0,s0:HUB.smashed,txt(){return `${this.k==='smash'?Math.floor(this.v):this.v.toFixed(1)} / ${this.goal} ${this.u}`}});try{AU.sfx('go');say(K.name,'POP-UP · '+K.lim+' s',1.6)}catch(e){}}}
 const lm=LIFE.lm;if(lm){const ex=RO.x-lm.x,ez=RO.z-lm.z,rr=lm.r+1.2,e2=ex*ex+ez*ez;if(e2<rr*rr&&Math.abs(y0-lm.y)<6){const e=Math.sqrt(e2)||1,o=rr-e;RO.x+=ex/e*o;RO.z+=ez/e*o;RO.v*=.7}}}
// ---------- per frame (after LV_step: free roam only)
function LIFE_step(dt){if(!LIFE.on||!RO.on||RO.wk){if(LIFE.KK&&LIFE.KK.size)LIFE_kickSync([]);if(LIFE.M&&LIFE.grp)for(const k in LIFE.M){LIFE.M[k].visible=false}if(LIFE.lm)LIFE.lm.g.visible=!!LIFE.on;return}
 if(typeof LOWMEM!=='undefined'&&LOWMEM&&LIFE.grp!==HUB.grp&&(LIFE.w=(LIFE.w||0)+dt)<12)return;// crash-5: low-mem phones build LIFE 12 s into roam, after the boot peak has been collected
 const t0=performance.now();if(LIFE.grp!==HUB.grp&&!LIFE_pre())return;if(!LIFE_init())return;LIFE.t+=dt;LIFE.fr++;
 const P=LIFE.pf||(LIFE.pf={fill:0,hit:0,draw:0,n:0});let q=performance.now();if(LIFE.fr%12===0||LIFE.todo&&LIFE.fr>=LIFE.todo||Math.hypot(RO.x-LIFE.px,RO.z-LIFE.pz)>20){LIFE.px=RO.x;LIFE.pz=RO.z;LIFE_fill()}
 P.fill+=performance.now()-q;q=performance.now();LIFE_hit();P.hit+=performance.now()-q;q=performance.now();LIFE_draw();P.draw+=performance.now()-q;P.n++;/* where LIFE's time goes (window.__life.LIFE.pf) */const lm=LIFE.lm;if(lm){lm.g.visible=(lm.x-RO.x)**2+(lm.z-RO.z)**2<900*900;const a=LIFE.t*(lm.ax==='y'?.5:.12);lm.spin.rotation[lm.ax]=a;if(lm.upd&&lm.g.visible)lm.upd(a)}
 const ms=performance.now()-t0;LIFE.ms=LIFE.ms*.95+ms*.05;LIFE.msN++;if(LIFE.rec){const w=LIFE.tw?t0-LIFE.tw:dt*1000;LIFE.rec.push([ms,w/1000])}LIFE.tw=t0/* life-2: wall-clock frame time (the game's dt is clamped at 50 ms on a slow page) */}
{const _lfLS=LV_step;LV_step=dt=>{_lfLS(dt);try{LIFE_step(dt)}catch(e){if(!LIFE.e){LIFE.e=1;console.warn('LIFE',e)}}}}
// ---------- tests: audit any road window (state asserts, no rendering), cost, GO spots
// a "200 m of road" window = every LIFE item within 100 m of a street point (the stretch 100 m either way + side streets)
function LIFE_win(x,z,R0=100){const o={move:0,grp:0,sm:0,pop:0,lane:0,set:[],smT:[]},cr=Math.ceil(R0/LIFE_CELL);for(let a=Math.floor(x/LIFE_CELL)-cr;a<=Math.floor(x/LIFE_CELL)+cr;a++)for(let b=Math.floor(z/LIFE_CELL)-cr;b<=Math.floor(z/LIFE_CELL)+cr;b++)
  for(const it of LIFE_cell(a,b)){if((it.x-x)**2+(it.z-z)**2>R0*R0)continue;if(LV_onRoad(it.x,it.z,1))o.lane++;if(it.c==='sm'){o.sm++;o.smT.push(it)}else if(it.c==='set'){o.move++;o.set.push(it)}else if(it.c==='grp'){o.grp++;if(LIFE_MOVE.has(it.t))o.move++}}
 for(let a=Math.floor((x-R0)/LIFE_PG);a<=Math.floor((x+R0)/LIFE_PG);a++)for(let b=Math.floor((z-R0)/LIFE_PG);b<=Math.floor((z+R0)/LIFE_PG);b++){const p=LIFE_pop(a,b);if(p&&(p.x-x)**2+(p.z-z)**2<=R0*R0)o.pop++}
 if(LIFE.lm&&(LIFE.lm.x-x)**2+(LIFE.lm.z-z)**2<R0*R0)o.move++;return o}
const LIFE_T={move:5,grp:3,sm:10,pop:1,rep:.3,smMax:40};
// n street points spread over the whole city (deterministic): every k-th node that has a non-motorway edge of ≥ 20 m
function LIFE_samples(n){const N=HUB.nodes,o=[];const st=Math.max(1,Math.floor(N.length/(n*3)));for(let i=Math.floor(st/2);i<N.length&&o.length<n;i+=st){const A=N[i];if(!A||A.ab||!A.nb)continue;
  for(const j of A.nb){const B=N[j];if(!B||B.ab)continue;const L=Math.hypot(B.x-A.x,B.z-A.z);if(L<20)continue;o.push({x:(A.x+B.x)/2,z:(A.z+B.z)/2,h:Math.atan2(B.x-A.x,B.z-A.z)});break}}return o}
// repeat rate: of all pairs of set pieces (and of smashable groups' items) within 100 m of each other, the share that is the same type
function LIFE_rep(L){let s=0,n=0;for(let i=0;i<L.length;i++)for(let j=i+1;j<L.length;j++){if((L[i].x-L[j].x)**2+(L[i].z-L[j].z)**2>1e4)continue;n++;if(L[i].t===L[j].t)s++}return n?s/n:0}
function LIFE_audit(n=60){if(!LIFE_init())return null;const S=LIFE_samples(n),fail=[],min={move:1e9,grp:1e9,sm:1e9,pop:1e9},t0=performance.now();let ok=0,rs=0,rm=0,rn=0,lane=0,smMax=0;
 for(const p of S){const w=LIFE_win(p.x,p.z);for(const k in min)min[k]=Math.min(min[k],w[k]);const f=[];for(const k of['move','grp','sm','pop'])if(w[k]<LIFE_T[k])f.push(k+' '+w[k]);if(w.sm>LIFE_T.smMax)f.push('clutter '+w.sm);if(w.lane)f.push('in lane '+w.lane);lane+=w.lane;smMax=Math.max(smMax,w.sm);
  if(f.length)fail.push([Math.round(p.x),Math.round(p.z),f.join(' ')]);else ok++;rs+=LIFE_rep(w.set);rm+=LIFE_rep(w.smT);rn++}
 return{n:S.length,ok,pct:+(ok/Math.max(1,S.length)*100).toFixed(1),min,repSet:+(rs/rn).toFixed(2),repSm:+(rm/rn).toFixed(2),lane,smMax,fail:fail.slice(0,6),ms:Math.round(performance.now()-t0)}}
// draw calls and instances this frame (the frame-cost metric) + the CPU time of LIFE_step (smoothed)
function LIFE_cost(){let dc=0,inst=0;for(const k in LIFE.M||{}){const m=LIFE.M[k];if(m.userData.bmk){if(m.visible)dc++}else if(m.visible&&m.count){if(!m.isBm)dc++;inst+=m.count}}if(LIFE.lm&&LIFE.lm.g.visible)LIFE.lm.g.traverse(o=>{if(o.isMesh)dc++});return{dc,inst,ms:+LIFE.ms.toFixed(2)}}
// GO: jump to a street spot of the audit, wait, then report density + cost; pass line in the checklist
function LIFE_go(say){if(!LIFE.on)return'📍 LIFE is OFF in this build (remove ?life=0)';const S=LIFE_samples(40),p=S[(LIFE.goI=(LIFE.goI||0)+7)%S.length]||S[0];if(!p||!roamWarp(p.x,p.z,p.h))return'📍 Can\'t jump right now';RO.v=0;LIFE.rec=null;
 /* life-2: cost is measured once the cells around the new spot are built (the teleport warm-up is not driving cost) */
 const w0=performance.now(),wt=setInterval(()=>{if(LIFE.todo&&performance.now()-w0<6000)return;clearInterval(wt);LIFE.rec=[];LIFE_goM(say)},200);return'📍 LIFE '+CID+' · measuring…'}
function LIFE_goM(say){
 setTimeout(()=>{let A,w,c;try{const R=LIFE.rec||[];LIFE.rec=null;c=LIFE_cost();const n=Math.max(1,R.length),m=R.reduce((a,r)=>a+r[0],0)/n,fd=R.reduce((a,r)=>a+r[1],0)/n*1000,md=R.map(r=>r[0]).sort((a,b)=>a-b)[n>>1]||0;c.ms=+md.toFixed(2);c.mean=+m.toFixed(2);c.fr=+fd.toFixed(1);c.lim=+Math.max(1.5,fd*.08).toFixed(2);/* life-2: median (a loaded test machine adds GC/refill spikes), mean ≤ 2× */A=LIFE_audit(60);w=LIFE_win(RO.x,RO.z)}catch(e){say('📍 LIFE ❌ '+e);return}
  const okW=w.move>=5&&w.grp>=3&&w.sm>=10&&w.sm<=LIFE_T.smMax&&w.pop>=1&&!w.lane,okA=A.pct>=95&&!A.lane&&A.repSet<=LIFE_T.rep&&A.repSm<=LIFE_T.rep,okC=c.ms<=c.lim&&c.mean<=2*c.lim&&c.dc<=40;window.__chk=window.__chk||{};window.__chk.life=Object.assign({w,A,c},{ok:okW&&okA&&okC});
  say(`📍 LIFE ${CID} here: ${w.move} moving · ${w.grp} groups · ${w.sm} smashables · ${w.pop} pop-up | city ${A.ok}/${A.n} windows pass (${A.pct}%, min ${A.min.move}/${A.min.grp}/${A.min.sm}/${A.min.pop}) · repeats ${Math.round(A.repSet*100)}% / ${Math.round(A.repSm*100)}% · in lanes ${A.lane} · max ${A.smMax} smashables/window | ${c.dc} draws · ${c.inst} inst · ${c.ms} ms/frame median, ${c.mean} mean (limit ${c.lim}, frame ${c.fr} ms) `+(okW&&okA&&okC?'✅':'❌'))},2500);return'📍 LIFE '+CID+' · measuring…'}
// a run-up of D m to target it, clear of buildings, other LIFE set pieces / groups and city props (2.2 m either side): {bx,bz,h} or null
function LIFE_runup(it,D){const y=it.y+.5,nb=(x,z)=>{if(roamHit(x,z,1.6,y))return true;for(const q of LIFE.L)if(q!==it&&q.c!=='sm'&&q.c!=='pop'&&(q.x-x)**2+(q.z-z)**2<((q.r||1.5)+2.2)**2)return true;
  const G=HUB.pgrid&&HUB.pgrid.get(Math.floor(x/16)*10000+Math.floor(z/16));if(G)for(const p of G)if(p.alive!==false&&(p.x-x)**2+(p.z-z)**2<2.2*2.2)return true;return false};
 for(let k=0;k<24;k++){const h=k*Math.PI/12,bx=it.x-Math.sin(h)*D,bz=it.z-Math.cos(h)*D;if(roamHit(bx,bz,2.5,y))continue;let ok=true;for(let s=3;s<=D&&ok;s+=2)if(nb(it.x-Math.sin(h)*s,it.z-Math.cos(h)*s))ok=false;/* a hill street (Athens, 1933,-1687: 40° rise) stalls the car and rolls it back: the run-up must be drivable, ≤ 20% grade end to end and every 2 m */
  for(let s=0;s<=D&&ok;s+=2)if(Math.abs(groundY(it.x-Math.sin(h)*s,it.z-Math.cos(h)*s)-groundY(it.x-Math.sin(h)*(s+2),it.z-Math.cos(h)*(s+2)))>.4)ok=false;if(ok)return{bx,bz,h}}return null}
// GO: 25 m in front of a smashable group, real keyboard gas for 4 s straight at it → it bursts into bricks and studs
function LIFE_goSmash(say){if(!LIFE.on)return'📍 LIFE is OFF';LIFE_fill();for(let k=0;k<30&&LIFE.todo;k++)LIFE_fill();const T=[];for(const q of LIFE.L){if(q.c!=='sm'||(q.x-RO.x)**2+(q.z-RO.z)**2<30*30)continue;if(T.length&&T.some(t=>(t.it.x-q.x)**2+(t.it.z-q.z)**2<50*50))continue;const R=LIFE_runup(q,22);if(R){R.it=q;T.push(R);if(T.length>=3)break}}if(!T.length)return'📍 no smashable with a clear run-up ❌';
 /* core-loop L1: up to 3 run-ups in turn (a dense plaza start can box the first one in: a solid wall/church corner next to the line); the first one that bursts something wins */
 const s0=LIFE.n.smash,h0=HUB.smashed;let k=0;const go=()=>{if(!roamWarp(T[k].bx,T[k].bz,T[k].h)){say('📍 Can\'t jump right now');return}LIFE_aim(T[k]);RO.v=0;K.ArrowUp=true;
  setTimeout(()=>{K.ArrowUp=false;const n=LIFE.n.smash-s0;if(n<1&&++k<T.length)return go();say(`📍 SMASH: ${n} LIFE things burst (${HUB.smashed-h0} smashes counted) `+(n>=1?"✅":"❌"))},k?2600:4000)};go();return'📍 SMASH · driving…'}
// GO: in front of a people group, real gas through it → people jump aside or fly (harmless) and nobody stands inside the car
function LIFE_goDodge(say){if(!LIFE.on)return'📍 LIFE is OFF';LIFE_fill();for(let k=0;k<30&&LIFE.todo;k++)LIFE_fill();/* r9d: the GO builds every cell (the per-frame budget would leave the warp target half-built on a slow page) */let it=null,R=null;for(const q of LIFE.L){if(q.c!=='grp'||q.t==='football'||(q.x-RO.x)**2+(q.z-RO.z)**2<30*30)continue;R=LIFE_runup(q,24);if(R){it=q;break}}if(!it)return'📍 no people group with a clear run-up ❌';
 /* a group an earlier GO of the batch scattered keeps its fly entries (they only expire while the group is drawn, LIFE.t - t0 > T): reset them so every person reacts like a fresh group */let st=0;for(let k=0;k<8;k++)if(LIFE.fly.delete(it.id*8+k))st++;LIFE.dead.delete(it.id);
 if(!roamWarp(R.bx,R.bz,R.h))return'📍 Can\'t jump right now';LIFE_aim(R);RO.v=0;const d0=LIFE.n.dodge+LIFE.n.fly,t0=performance.now(),T0=LIFE.t;K.ArrowUp=true;let vm=0,dm=1e9;
 /* life-2: gas until somebody reacts or the car is 6 m past the group (max 10 s), so a slow page (low fps) still gets there */
 const iv=setInterval(()=>{vm=Math.max(vm,Math.abs(RO.v));dm=Math.min(dm,Math.hypot(RO.x-it.x,RO.z-it.z));const n=LIFE.n.dodge+LIFE.n.fly-d0,past=(RO.x-it.x)*Math.sin(R.h)+(RO.z-it.z)*Math.cos(R.h)>6;if(!(n>=1||past||performance.now()-t0>10000&&LIFE.t-T0>6||performance.now()-t0>60000))return;clearInterval(iv);K.ArrowUp=false;
  say(`📍 PEOPLE (${it.t}): ${n} jumped aside or flew (${((performance.now()-t0)/1000).toFixed(1)} s)`+(n>=1?' ':` [stale fly ${st}, top ${vm.toFixed(1)} m/s, closest ${dm.toFixed(1)} m, ${(LIFE.t-T0).toFixed(1)} s sim, ${LIFE.L.includes(it)?'in':'NOT in'} LIFE.L, ${LIFE.dead.has(it.id)?'dead':'alive'}] `)+(n>=1?'✅':'❌'))},100);return'📍 PEOPLE · driving…'}
// after roamWarp: keep the GO's run-up spot and heading (the warp may move the car to the right-hand lane of a divided road)
function LIFE_aim(R){RO.x=R.bx;RO.z=R.bz;RO.h=R.h;if(RO.vh!=null)RO.vh=R.h}
// GO: 30 m before a pop-up bubble on the street, real gas → the challenge starts
function LIFE_goPop(say){if(!LIFE.on)return'📍 LIFE is OFF';const a0=Math.floor(RO.x/LIFE_PG),b0=Math.floor(RO.z/LIFE_PG);let p=null;for(let r=0;r<4&&!p;r++)for(let a=a0-r;a<=a0+r&&!p;a++)for(let b=b0-r;b<=b0+r&&!p;b++){const q=LIFE_pop(a,b);if(q&&(q.x-RO.x)**2+(q.z-RO.z)**2>40*40)p=q}
 if(!p)return'📍 no bubble near ❌';const bx=p.x-Math.sin(p.h)*30,bz=p.z-Math.cos(p.h)*30;p.cd=0;RO.pop=null;if(!roamWarp(bx,bz,p.h))return'📍 Can\'t jump right now';RO.v=0;const n0=LIFE.n.pop,t0=performance.now();K.ArrowUp=true;
 /* popup1: the sim runs at ~0.45x real time on software GL (frame dt is capped), so gas until the bubble starts (or 25 s real) instead of a fixed 4 s */
 const iv=setInterval(()=>{if(!(LIFE.n.pop>n0||performance.now()-t0>(window.__qs&&__qs.act()?6000:25000)))return;clearInterval(iv);K.ArrowUp=false;const q=window.__qs&&__qs.act(),ok=q?!(LIFE.n.pop>n0)&&!RO.pop:LIFE.n.pop>n0&&RO.pop;say(`📍 POP-UP ${p.K.name}: `+(q?(ok?'quiet-start: the pad did not start a side challenge ✅':'started by itself ❌'):ok?'started ('+RO.pop.name+') ✅':'not started ❌'))},100);return'📍 POP-UP · driving…'}
// GO: the landmark (Ferris wheel / big carousel) 60 m away, camera on it: it turns
function LIFE_goLm(say){if(!LIFE.on)return'📍 LIFE is OFF';LIFE_init();const lm=LIFE.lm;if(!lm)return'📍 no landmark ❌';let ok=false,bx=0,bz=0,h=0;for(let k=0;k<24&&!ok;k++){h=k*Math.PI/12;bx=lm.x-Math.sin(h)*55;bz=lm.z-Math.cos(h)*55;ok=!roamHit(bx,bz,2.5,groundAt(bx,bz,999)+.5)}
 if(!roamWarp(bx,bz,h))return'📍 Can\'t jump right now';RO.v=0;const r0=lm.spin.rotation[lm.ax],t0=performance.now();for(let i=0;i<36;i++)roamStep(1/30);/* athpush: 1.2 s of stepped sim first (state, not the real clock: after a stepped GO the page loop may be idle, so the watch saw 0 rad) */
 /* popup1: watch until it has turned > 0.1 rad (sim runs < real time on software GL) or 15 s real, instead of a fixed 2 s */
 const iv=setInterval(()=>{if(!(Math.abs(lm.spin.rotation[lm.ax]-r0)>.1||performance.now()-t0>15000))return;clearInterval(iv);const r1=lm.spin.rotation[lm.ax];say(`📍 ${lm.k.toUpperCase()}: turned ${(r1-r0).toFixed(2)} rad in ${((performance.now()-t0)/1000).toFixed(1)} s `+(lm.g.visible&&Math.abs(r1-r0)>.1?'✅':'❌'))},100);return'📍 '+lm.k.toUpperCase()+' · watching…'}
// GO (life-2): 45 m before an AIR TIME kicker, real keyboard gas for 6 s: the car takes off from the lip, flies the gap through the bubble (≥ 0.6 s air), lands and keeps going
function LIFE_goKick(say){if(!LIFE.on)return'📍 LIFE is OFF';const a0=Math.floor(RO.x/LIFE_PG),b0=Math.floor(RO.z/LIFE_PG);let p=null;
 for(let r=0;r<8&&!p;r++)for(let a=a0-r;a<=a0+r&&!p;a++)for(let b=b0-r;b<=b0+r&&!p;b++){if(Math.max(Math.abs(a-a0),Math.abs(b-b0))!==r)continue;const q=LIFE_pop(a,b);if(q&&q.K.k==='air'&&LIFE_kick(q)){const bx=q.x-Math.sin(q.h)*45,bz=q.z-Math.cos(q.h)*45;if(!roamHit(bx,bz,2.5,q.y+.5))p=q}}
 if(!p)return'📍 no AIR TIME kicker near ❌';const bx=p.x-Math.sin(p.h)*45,bz=p.z-Math.cos(p.h)*45;p.cd=0;RO.pop=null;if(!roamWarp(bx,bz,p.h))return'📍 Can\'t jump right now';RO.v=0;LIFE.px=1e9;
 const n0=LIFE.n.pop;let air=0,top=0,last=performance.now(),v1=0;K.ArrowUp=true;const iv=setInterval(()=>{const now=performance.now(),dt=(now-last)/1000;last=now;const g=groundAt(RO.x,RO.z,RO.y+.3);if(RO.y-g>.35){air+=dt;top=Math.max(top,RO.y-p.y)}},40);
 setTimeout(()=>{v1=Math.abs(RO.v)},5200);
 setTimeout(()=>{clearInterval(iv);K.ArrowUp=false;const ok=LIFE.n.pop>n0&&air>=.6&&v1>5,P=RO.pop;window.__chk=window.__chk||{};window.__chk.kick={air:+air.toFixed(2),top:+top.toFixed(1),v1:+v1.toFixed(1),pop:!!P,ok};
  say(`📍 AIR TIME kicker: ${air.toFixed(2)} s in the air, ${top.toFixed(1)} m high, bubble ${LIFE.n.pop>n0?'started ('+(P?P.name+' '+(P.v||0).toFixed(1)+' s':'done')+')':'not hit'}, ${(v1*3.6).toFixed(0)} km/h after landing `+(ok?'✅':'❌'))},6000);return'📍 AIR TIME kicker · driving…'}
// GO (life-2): variety. Parks you on a street; pass = here ≥ 6 different activities / set pieces within 100 m, the same in ≥ 90 % of 60 city windows,
// every one of the 12 set-piece and 15 activity types somewhere in the city, neighbouring windows share ≤ 60 % of their types, LIFE ≤ 40 draw calls
function LIFE_goVar(say){if(!LIFE.on)return'📍 LIFE is OFF';const S=LIFE_samples(60);let best=null,bn=0;const W=S.map(p=>{const w=LIFE_win(p.x,p.z),T=new Set();for(const it of w.set)T.add(it.t);
  for(const a of[-1,0,1])for(const b of[-1,0,1])for(const it of LIFE_cell(Math.floor(p.x/LIFE_CELL)+a,Math.floor(p.z/LIFE_CELL)+b))if(it.c==='grp'&&(it.x-p.x)**2+(it.z-p.z)**2<1e4)T.add(it.t);
  for(const it of w.set)T.add(it.t);if(T.size>bn){bn=T.size;best=p}return T});
 const all=new Set();W.forEach(T=>T.forEach(t=>all.add(t)));let ok6=0,sim=0,sn=0;W.forEach(T=>{if(T.size>=6)ok6++});
 for(let i=0;i<S.length;i++){let j=-1,jd=1e18;for(let k=0;k<S.length;k++){if(k===i)continue;const d=(S[k].x-S[i].x)**2+(S[k].z-S[i].z)**2;if(d<jd){jd=d;j=k}}const A=W[i],B=W[j],u=new Set([...A,...B]).size;if(u){sim+=[...A].filter(t=>B.has(t)).length/u;sn++}}
 const nT=LIFE_SET.length+LIFE_GRP.length,pct=Math.round(ok6/S.length*100),js=sn?sim/sn:0,p=best||S[0];if(!p||!roamWarp(p.x,p.z,p.h))return'📍 Can\'t jump right now';RO.v=0;LIFE.px=1e9;
 setTimeout(()=>{const c=LIFE_cost(),ok=pct>=90&&all.size>=nT&&js<=.6&&c.dc<=40;window.__chk=window.__chk||{};window.__chk.var={pct,types:all.size,nT,js:+js.toFixed(2),dc:c.dc,here:bn,ok};
  say(`📍 VARIETY ${CID}: here ${bn} types within 100 m · ${pct}% of 60 windows have ≥ 6 · ${all.size}/${nT} types in the city (missing: ${[...LIFE_SET,...LIFE_GRP].filter(t=>!all.has(t)).join(',')||'none'}) · neighbours share ${Math.round(js*100)}% · ${c.dc} draws `+(ok?'✅':'❌'))},2000);return'📍 VARIETY '+CID+' · measuring…'}
// GO (life-2): the landmark is the real LEGO set: Frankfurt Ferris wheel 20-30 m tall from ≥ 30 parts, seats level (< 2°) while it turns;
// Athens carousel 14-20 m wide from ≥ 9 parts, top turns; the street wind turbines are the real 7747 turbine (blades turn)
function LIFE_goLmLd(say){if(!LIFE.on)return'📍 LIFE is OFF';LIFE_init();const lm=LIFE.lm,fra=CID==='fra';if(!lm)return'📍 no landmark ❌';const a0=lm.spin.rotation[lm.ax],r=LIFE_goLm(()=>{});
 const D=lm.ld,p=fra?'lxfw':'lxmg',n=D?LD_MODELS[p+'_base'].B.length+LD_MODELS[p+'_rotor'].B.length+(fra?LD_MODELS.lxfw_seat.B.length:0):0;
 setTimeout(()=>{const turn=Math.abs(lm.spin.rotation[lm.ax]-a0);let tilt=0;if(D&&fra){lm.g.updateMatrixWorld(true);const M=new THREE.Matrix4(),Q=new THREE.Quaternion(),u=new THREE.Vector3();lm.g.traverse(o=>{if(!o.isInstancedMesh)return;for(let i=0;i<o.count;i++){o.getMatrixAt(i,M);M.premultiply(o.matrixWorld);M.decompose(u,Q,new THREE.Vector3());u.set(0,1,0).applyQuaternion(Q);tilt=Math.max(tilt,Math.acos(Math.min(1,u.y))*180/Math.PI)}})}
  const sz=D?(fra?D.h:Math.max(D.w,D.d)):0,okS=fra?sz>=20&&sz<=30&&n>=30:sz>=14&&sz<=20&&n>=9,ok=!!D&&okS&&turn>.1&&tilt<2&&!!LIFE.TB;window.__chk=window.__chk||{};window.__chk.lmld={sz,n,turn,tilt,tb:!!LIFE.TB,ok};
  say(`📍 ${lm.k.toUpperCase()} (real LEGO set ${fra?'3681':'3668'}): ${D?sz.toFixed(1)+' m '+(fra?'tall':'wide')+', '+n+' parts':'stand-in ❌'}, turned ${turn.toFixed(2)} rad`+(fra?`, seats tilt ${tilt.toFixed(1)}°`:'')+`, turbines ${LIFE.TB?'7747':'stand-in'} `+(ok?'✅':'❌'))},2000);return r}
// by name, so a hot reload of one GO function takes effect
const LIFE_GOS={'fra-density':{fn:s=>LIFE_go(s)},'ath-density':{fn:s=>LIFE_go(s)},'smash':{fn:s=>LIFE_goSmash(s)},
 'people':{fn:s=>LIFE_goDodge(s)},'popup':{fn:s=>LIFE_goPop(s)},'kicker':{fn:s=>LIFE_goKick(s)},'fra-variety':{fn:s=>LIFE_goVar(s)},'fra-landmark':{fn:s=>LIFE_goLmLd(s)},'ath-landmark':{fn:s=>LIFE_goLmLd(s)},'ath-variety':{fn:s=>LIFE_goVar(s)},'wheel':{fn:s=>LIFE_goLm(s)},'carousel':{fn:s=>LIFE_goLm(s)}};
window.__life={init:LIFE_init,ringCam:LIFE_ringCam,CELL:LIFE_CELL,hit:LIFE_hit,SETR:LIFE_SETR,ldLm:LIFE_ldLm,setSMT:v=>{LIFE_SMT=v;LIFE.C.clear();LIFE.SC.clear();LIFE.px=1e9},GOS:LIFE_GOS,side:LIFE_side,free:LIFE_free,gy:LIFE_gy,LIFE,audit:LIFE_audit,win:LIFE_win,cost:LIFE_cost,samples:LIFE_samples,cell:LIFE_cell,T:LIFE_T};
