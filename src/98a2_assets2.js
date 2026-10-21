// ---- A2 assets-r21p (2026-10-20): city + race props from small PART LISTS (garage-builder approach: bricks, cylinders, slopes with palette colours)
// merged into ONE vertex-coloured geometry per prop and drawn instanced with ONE shared material. Alex: "more variety on assets (city, race)".
// Catalogue = A2_DEF below (data table: id, name, category, city tag, collider kind, parts); docs/ASSET_CATALOGUE.md is generated from window.__a2.table().
// Limits (GO assets/catalogue): <= 400 triangles, <= 3 palette colours per prop, one shared material. All brick-built by us: no external licence.
// Placement is ON by default after review #9 (?assets2=0 turns it off): roam = kerb slots like 98la_ath_dress (Athens set only
// Athens/both-tagged props, Frankfurt set only Frankfurt/both), <= A2.K instanced draws; race = every prop baked into ONE static mesh per track (1 draw).
// Colliders: roam solids get a plain push-out here; the box/radius recorded in the table is what the collision lane wires.
const A2={on:!/[?&]assets2=0\b/.test(location.search),K:5,R:115,mat:null,G:null,T:null,M:null,C:new Map(),occ:new Set(),fr:0,px:1e9,pz:1e9,grp:null,n:{},race:null};
const A2_PAL={w:'#F4F4F4',st:'#A0A5A9',k:'#1B2A34',tc:'#B8552B',wd:'#8A5A32',ol:'#6F7F3A',ol2:'#A3AE5E',lg:'#00852B',dg:'#00451A',pn:'#2F6B3A',ag:'#5E8F7A',mg:'#C2307E',bl:'#0D5EAF',y:'#FAC80A',r:'#B40000',o:'#E8761C',
 tn:'#D7BA8C',cc:'#9AA0A3',tb:'#4A2E1A',cr:'#EFE3C8',tk:'#7A6B5A',mb:'#E9E4D8',gr:'#58AB41',bz:'#7C8FB0'};
// part helpers: y = base of the part (centre for rotated parts is the centre of the unrotated part); r = [rx,ry,rz] ('YXZ')
const A2_b=(w,h,d,x,y,z,k,r)=>['b',w,h,d,x,y+h/2,z,k,r],A2_c=(r1,r2,h,x,y,z,k,sg,r)=>['c',r1,r2,h,x,y+h/2,z,k,sg||8,r],A2_g=(w,h,d,x,y,z,k,r)=>['g',w,h,d,x,y,z,k,r];
const A2_blades=(n,len,w,r0,y0,tilt,k,k2)=>{const L=[];for(let i=0;i<n;i++){const f=i*Math.PI*2/n,t=tilt*(i%2?.7:1),s=Math.sin(t),c=Math.cos(t);L.push(['b',w,len,.04,Math.sin(f)*(r0+len/2*s),y0+len/2*c,Math.cos(f)*(r0+len/2*s),i%2?k2:k,[t,f,0]])}return L};
const A2_ring=(n,R,w,h,d,y,k)=>{const L=[];for(let i=0;i<n;i++){const a=i*Math.PI*2/n;L.push(['b',w,h,d,Math.sin(a)*R,y+Math.cos(a)*R,0,k,[0,0,-a]])}return L};
// apartment block: floors of height fh, front (+z) window band + balconies with awnings on floors 1..n-1 (nb per floor), flat roof with water tank, optional setback top floor
const A2_apt=(fl,W,D,fh,nb,aw,set)=>{const H=fl*fh,L=[A2_b(W,H-(set?fh:0),D,0,0,0,'w'),A2_b(W+.5,.3,D+.5,0,H-(set?fh:0),0,'w'),A2_b(1.4,1.1,1.4,-W*.28,H+(set?.05:.3),-D*.2,'tc')];
 if(set)L.push(A2_b(W*.72,fh,D*.72,0,H-fh+.3,0,'w'),A2_b(W*.72+.4,.25,D*.72+.4,0,H+.3,0,'w'));
 for(let f=0;f<fl;f++){const y=f*fh;if(f===0)L.push(A2_b(1.3,2.3,.1,0,0,D/2+.04,'tc'));else L.push(A2_b(W*.84,.9,.1,0,y+1.1,D/2+.04,'bl'));
  if(f>0&&f<fl-(set?1:0))for(let j=0;j<nb;j++){const x=nb===1?0:(j-(nb-1)/2)*W*.4;L.push(A2_b(W*.3,.14,1.15,x,y,D/2+.55,'w'),A2_b(W*.32,.07,1.35,x,y+2.2,D/2+.75,aw,[.38,0,0]))}}return L};
// ---- the catalogue. city: 'ath' | 'fra' | 'both' | 'race' (race = drawn on the race tracks of both cities); cat: tree|bush|building|street|food|ruin|vehicle|race; col: 'c' (trunk/pole circle, cr = radius) | 'b' (footprint box) | 0
const A2_DEF=[
 {id:'olive',n:'Olive tree',cat:'tree',city:'ath',col:'c',cr:.35,sc:[1.3,1.7],p:[A2_c(.22,.32,1.5,0,0,0,'tk',6),A2_c(1.7,1.4,.9,0,1.4,0,'ol',7),A2_c(1.3,1,.8,.15,2.1,.1,'ol2',7),A2_c(.8,.5,.6,-.2,2.75,0,'ol',6)]},
 {id:'cypress',n:'Cypress',cat:'tree',city:'ath',col:'c',cr:.3,sc:[1.3,1.9],p:[A2_c(.2,.25,.6,0,0,0,'tk',5),A2_c(.9,.55,1.8,0,.5,0,'dg',6),A2_c(.7,.35,1.8,0,1.9,0,'dg',6),A2_c(.5,.05,1.9,0,3.2,0,'dg',6)]},
 {id:'aleppo',n:'Aleppo pine',cat:'tree',city:'ath',col:'c',cr:.3,sc:[1.2,1.6],p:[A2_c(.18,.26,3,0,0,0,'tk',5,[0,0,.06]),A2_c(1.8,1.5,.7,.2,3,0,'pn',8),A2_c(1.2,.9,.6,-.3,3.65,.1,'pn',7),A2_c(.7,.3,.5,.1,4.2,0,'lg',6)]},
 {id:'plane',n:'Plane tree',cat:'tree',city:'both',col:'c',cr:.4,sc:[1.2,1.6],p:[A2_c(.3,.4,2.2,0,0,0,'st',6),A2_b(3.2,1.2,3.2,0,2.1,0,'lg'),A2_b(2.4,1,2.4,0,3.2,0,'gr'),A2_b(1.4,.8,1.4,0,4.1,0,'lg')]},
 {id:'bougain',n:'Bougainvillea bush',cat:'bush',city:'ath',col:0,sc:[1,1.5],p:[A2_c(.5,.42,.45,0,0,0,'tc',7),A2_c(.7,.5,.5,0,.45,0,'lg',7),A2_c(.62,.35,.45,.05,.85,0,'mg',7),A2_c(.4,.2,.35,-.1,1.25,.05,'mg',6)]},
 {id:'agave',n:'Agave in pot',cat:'bush',city:'ath',col:0,sc:[1,1.6],p:[A2_c(.4,.33,.35,0,0,0,'tc',6),...A2_blades(8,.95,.12,.12,.3,.7,'ag','ol2')]},
 {id:'apt1',n:'Whitewashed apartment block (5 floors)',cat:'building',city:'ath',col:'b',sc:[1,1],p:A2_apt(5,9,8,3,2,'bl',0)},
 {id:'apt2',n:'Whitewashed apartment block (6 floors, setback)',cat:'building',city:'ath',col:'b',sc:[1,1],p:A2_apt(6,7,7,2.8,1,'tc',1)},
 {id:'kiosk',n:'Periptero kiosk',cat:'street',city:'ath',col:'b',sc:[1,1],p:[A2_b(2.2,2.3,1.6,0,0,0,'cr'),A2_b(2.7,.18,2.1,0,2.3,0,'r'),A2_b(1.9,.9,.05,0,1.2,.82,'bl'),A2_b(2.3,.1,.5,0,1.05,.95,'bl'),...[0,1,2,3].map(j=>A2_b(.3,.45,.05,-.66+j*.44,1.6,.83,'r')),A2_b(.6,1.4,.5,1.5,0,.2,'cr')]},
 {id:'taverna',n:'Taverna table + parasol',cat:'food',city:'ath',col:'c',cr:1.3,sc:[1,1],p:[A2_c(.55,.55,.06,0,.72,0,'w',8),A2_c(.05,.05,.72,0,0,0,'wd',5),A2_c(.04,.04,2.4,.0,0,0,'wd',5),...[[.8,.8],[-.8,.8],[.8,-.8],[-.8,-.8]].map(([x,z])=>A2_c(.2,.2,.45,x,0,z,'wd',6)),A2_c(1.65,1.35,.22,0,2.1,0,'w',8),A2_c(1.35,.05,.3,0,2.32,0,'r',8)]},
 {id:'column',n:'Marble column',cat:'ruin',city:'ath',col:'c',cr:.5,sc:[1,1.3],p:[A2_c(.62,.62,.2,0,0,0,'st',8),A2_c(.42,.36,3.2,0,.2,0,'mb',8),A2_c(.5,.62,.3,0,3.4,0,'mb',8),A2_b(1.1,.18,1.1,0,3.7,0,'mb')]},
 {id:'temple',n:'Temple fragment',cat:'ruin',city:'ath',col:'b',sc:[1,1],p:[A2_b(6,.3,3.5,0,0,0,'st'),A2_b(5.4,.3,3,0,.3,0,'st'),...[-2,0,2].map(x=>A2_c(.42,.36,3.4,x,.6,0,'mb',8)),...[-2,0].map(x=>A2_c(.5,.5,.25,x,4,0,'mb',8)),A2_b(4.2,.5,.9,-1,4.25,0,'mb'),A2_c(.4,.4,.8,2.6,.6,1.1,'tn',8,[0,0,1.5708])]},
 {id:'church',n:'Church with blue dome',cat:'building',city:'ath',col:'b',sc:[1,1],p:[A2_b(5,4,6,0,0,0,'w'),A2_g(5.4,1.4,6.4,0,4,0,'tc'),A2_c(1.8,1.8,1.2,0,4,0,'w',8),A2_c(1.9,1.4,.5,0,5.2,0,'bl',8),A2_c(1.4,.7,.5,0,5.7,0,'bl',8),A2_c(.7,.05,.45,0,6.2,0,'bl',8),A2_b(.1,.9,.1,0,6.6,0,'w'),A2_b(.5,.1,.1,0,7.1,0,'w'),A2_b(1.2,5.5,1.2,2.7,0,2.2,'w'),A2_c(.9,.05,1,2.7,5.5,2.2,'bl',6)]},
 {id:'scooter',n:'Parked scooter',cat:'vehicle',city:'ath',col:0,sc:[1,1],p:[A2_b(.36,.45,1.1,0,.2,0,'r'),A2_b(.34,.1,.5,0,.65,-.15,'k'),A2_b(.36,.7,.12,0,.2,.52,'r'),A2_b(.6,.05,.05,0,1.05,.5,'k'),A2_c(.03,.03,.5,0,.55,.5,'k',4),A2_b(.15,.1,.05,0,.85,.6,'w'),A2_c(.22,.22,.12,0,.0,.52,'k',8,[0,0,1.5708]),A2_c(.22,.22,.12,0,0,-.5,'k',8,[0,0,1.5708])]},
 {id:'taxi',n:'Yellow taxi (parked)',cat:'vehicle',city:'ath',col:'b',sc:[1,1],p:[A2_b(1.8,.65,4.2,0,.3,0,'y'),A2_b(1.6,.5,2.2,0,.95,-.2,'k'),A2_b(1.65,.08,2,0,1.45,-.2,'y'),A2_b(.5,.18,.2,0,1.53,-.2,'w'),...[[.9,1.4],[-.9,1.4],[.9,-1.4],[-.9,-1.4]].map(([x,z])=>A2_c(.33,.33,.22,x,0,z,'k',6,[0,0,1.5708]))]},
 {id:'trolley',n:'Trolley-bus stop',cat:'street',city:'ath',col:'b',sc:[1,1],p:[A2_b(4,.12,1.6,0,0,0,'st'),A2_b(4.2,.12,1.9,0,2.5,0,'y'),A2_b(.1,2.4,.1,-1.9,.12,-.7,'st'),A2_b(.1,2.4,.1,1.9,.12,-.7,'st'),A2_b(3.8,1.6,.06,0,.5,-.75,'bl'),A2_b(2,.08,.45,0,.45,-.5,'st'),A2_c(.04,.04,3,2.6,0,.2,'st',5),A2_b(.6,.6,.06,2.6,2.6,.2,'bl')]},
 {id:'wall',n:'Stone wall segment',cat:'street',city:'ath',col:'b',sc:[1,1],p:[A2_b(1.35,.4,.6,-1.4,0,0,'st'),A2_b(1.35,.4,.6,0,0,0,'tn'),A2_b(1.35,.4,.6,1.4,0,0,'st'),A2_b(.7,.4,.6,-1.75,.4,0,'tn'),A2_b(1.4,.4,.6,-.7,.4,0,'st'),A2_b(1.4,.4,.6,.7,.4,0,'tn'),A2_b(.7,.4,.6,1.75,.4,0,'st'),A2_b(1.35,.4,.6,-1.4,.8,0,'tn'),A2_b(1.35,.4,.6,0,.8,0,'st'),A2_b(1.35,.4,.6,1.4,.8,0,'tn'),A2_b(4.4,.16,.76,0,1.2,0,'cc')]},
 {id:'rgate',n:'Start/finish gate arch',cat:'race',city:'race',col:'b',sc:[1,1],p:[A2_b(.9,6,.9,-5,0,0,'r'),A2_b(.9,6,.9,5,0,0,'r'),A2_b(1.3,.4,1.3,-5,0,0,'k'),A2_b(1.3,.4,1.3,5,0,0,'k'),A2_b(11,1.1,.8,0,6,0,'r'),A2_b(9,.9,.1,0,6.1,.45,'w'),...[0,1,2,3,4,5,6,7,8].map(i=>A2_b(.9,.45,.12,-4+i*.9+0,6.1+(i%2)*.45,.5,'k'))]},
 {id:'rflags',n:'Banner flags',cat:'race',city:'race',col:0,sc:[1,1],p:[0,1,2,3].flatMap(i=>[A2_c(.05,.05,5,i*1.8,0,0,'k',4),A2_b(1.4,.8,.05,i*1.8+.7,4.1,0,i%2?'w':'r')])},
 {id:'rtyres',n:'Tyre stack',cat:'race',city:'race',col:'c',cr:1,sc:[1,1],p:[[0,0],[1,0],[2,0]].flatMap(([x,z],j)=>[A2_c(.45,.45,.3,x*.95,0,0,'k',8),...(j<2?[A2_c(.45,.45,.3,x*.95,.3,0,'r',8)]:[]),...(j<1?[A2_c(.45,.45,.3,x*.95,.6,0,'w',8)]:[])])},
 {id:'rcones',n:'Cone set',cat:'race',city:'race',col:0,sc:[1,1],p:[[0,0],[1.6,0],[0,1.6],[1.6,1.6]].flatMap(([x,z])=>[A2_b(.7,.05,.7,x,0,z,'k'),A2_c(.3,.04,.7,x,.05,z,'o',6),A2_c(.2,.14,.14,x,.3,z,'w',6)])},
 {id:'rbarrier',n:'Concrete barrier',cat:'race',city:'race',col:'b',sc:[1,1],p:[0,1,2].flatMap(i=>[A2_b(.7,.45,2.1,0,0,i*2.2,'cc'),A2_b(.4,.45,2.1,0,.45,i*2.2,i%2?'w':'r')])},
 {id:'rstand',n:'Grandstand segment',cat:'race',city:'race',col:'b',sc:[1,1],p:[...[0,1,2,3,4,5].flatMap(i=>[A2_b(10,.5*(i+1),1.1,0,0,-i*1.1,'cc'),A2_b(10,.12,.7,0,.5*(i+1),-i*1.1+.15,i%2?'bl':'r')]),A2_b(10,3.4,.2,0,0,-6.8,'cc'),A2_b(10.6,.25,7.4,0,5.4,-3.2,'cc'),...[-4.8,4.8].flatMap(x=>[A2_b(.2,5.4,.2,x,0,.5,'cc')])]},
 {id:'rpit',n:'Pit sign',cat:'race',city:'race',col:'c',cr:.3,sc:[1,1],p:[A2_c(.06,.06,3.2,0,0,0,'k',5),A2_b(1.6,.9,.1,0,2.4,0,'bl'),A2_b(.1,.5,.04,.5,2.6,.07,'w'),A2_b(.25,.1,.04,.42,2.97,.07,'w'),A2_b(.1,.5,.04,0,2.6,.07,'w'),A2_b(.1,.5,.04,-.5,2.6,.07,'w'),A2_b(.4,.1,.04,-.5,2.97,.07,'w')]},
 {id:'rring',n:'Checkpoint ring',cat:'race',city:'race',col:0,sc:[1,1],p:[...A2_ring(10,2.6,1,.3,.3,2.9,'y')]},
 {id:'rboost',n:'Boost pad marker',cat:'race',city:'race',col:0,sc:[1,1],p:[A2_b(2.6,.06,3.2,0,0,0,'k'),...[-.9,0,.9].flatMap(z=>[A2_b(1.2,.07,.3,-.45,.06,z,'y',[0,.7,0]),A2_b(1.2,.07,.3,.45,.06,z,'y',[0,-.7,0])])]},
 {id:'timber',n:'Half-timbered house',cat:'building',city:'fra',col:'b',sc:[1,1],p:[A2_b(5,3.2,7,0,0,0,'cr'),A2_b(5.4,3,7.4,0,3.2,0,'cr'),A2_g(6,3.4,7.8,0,6.2,0,'tc'),A2_b(1,2,.1,0,0,3.54,'tb'),...[-2.5,-1.25,0,1.25,2.5].map(x=>A2_b(.15,3,.12,x,3.2,3.76,'tb')),A2_b(5.4,.15,.12,0,3.1,3.76,'tb'),A2_b(5.4,.15,.12,0,6.1,3.76,'tb'),...[-2.4,2.4].map(x=>A2_b(.15,3.2,.12,x,0,3.56,'tb')),A2_b(.2,3.4,.12,-1.2,3.2,3.77,'tb',[0,0,.7]),A2_b(.2,3.4,.12,1.2,3.2,3.77,'tb',[0,0,-.7]),A2_b(1,1.6,1,1.6,6.2,-1.5,'tc')]},
 {id:'tram',n:'Tram stop',cat:'street',city:'fra',col:'b',sc:[1,1],p:[A2_b(4.4,.12,1.8,0,2.4,0,'cc'),A2_b(.1,2.4,.1,-2,0,-.8,'cc'),A2_b(.1,2.4,.1,2,0,-.8,'cc'),A2_b(4,1.8,.05,0,.6,-.85,'bz'),A2_b(2.2,.08,.45,0,.45,-.55,'cc'),A2_c(.04,.04,3,2.8,0,.4,'cc',5),A2_b(.55,.55,.06,2.8,2.5,.4,'y')]},
 {id:'ebbelwoi',n:'Apple-wine tavern table',cat:'food',city:'fra',col:'b',sc:[1,1],p:[A2_b(2.4,.08,.7,0,.78,0,'wd'),...[[-1.1,-.28],[1.1,-.28],[-1.1,.28],[1.1,.28]].map(([x,z])=>A2_b(.08,.78,.08,x,0,z,'wd')),...[-.75,.75].flatMap(z=>[A2_b(2.4,.06,.35,0,.45,z,'wd'),A2_b(.1,.45,.3,-1,0,z,'wd'),A2_b(.1,.45,.3,1,0,z,'wd')]),A2_c(.16,.12,.3,-.4,.86,0,'bz',6),A2_c(.16,.12,.3,.5,.86,.1,'bz',6),A2_c(.06,.05,.12,.1,.86,-.15,'ol2',6),A2_c(.06,.05,.12,-.9,.86,.1,'ol2',6)]}
];
const A2_BY={};for(const d of A2_DEF)A2_BY[d.id]=d;
// gable prism (ridge along z): triangle (-w/2,0)(w/2,0)(0,h) extruded over d, origin at the base centre; 8 triangles
function A2_gable(w,h,d){const a=[-w/2,0,-d/2],b=[w/2,0,-d/2],c=[0,h,-d/2],e=[-w/2,0,d/2],f=[w/2,0,d/2],g=[0,h,d/2],T=[];
 const q=(p,r,s,t)=>T.push(p,r,s,p,s,t),tr=(p,r,s)=>T.push(p,r,s);tr(e,f,g);tr(b,a,c);q(a,e,g,c);q(f,b,c,g);q(a,b,f,e);
 const P=new Float32Array(T.length*3);T.forEach((v,i)=>P.set(v,i*3));const G=new THREE.BufferGeometry();G.setAttribute('position',new THREE.BufferAttribute(P,3));G.computeVertexNormals();return G}
const A2_e=new THREE.Euler();
function A2_geo(def){const list=[],cols=new Set();for(const p of def.p){const k=p[7],r=p[0]==='c'?p[9]:p[8];let g;
  if(p[0]==='b')g=new THREE.BoxGeometry(p[1],p[2],p[3]);else if(p[0]==='c')g=new THREE.CylinderGeometry(p[1],p[2],p[3],p[8]);else g=A2_gable(p[1],p[2],p[3]);
  if(r){A2_e.set(r[0],r[1],r[2],'YXZ');g.applyMatrix4(new THREE.Matrix4().makeRotationFromEuler(A2_e))}
  g.translate(p[4],p[5],p[6]);cols.add(k);list.push(colorize(g.index?g.toNonIndexed():g,new THREE.Color(A2_PAL[k])))}
 const G=mergeG(list);G.computeBoundingBox();const bb=G.boundingBox;G.userData.a2={tris:G.attributes.position.count/3,cols:[...cols],bb};return G}
const A2_mat=()=>A2.mat||(A2.mat=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.45}));
function A2_geos(){if(A2.G)return A2.G;A2.G={};for(const d of A2_DEF){try{A2.G[d.id]=A2_geo(d)}catch(e){console.warn('A2 geo',d.id,e)}}return A2.G}
// catalogue rows (also what docs/ASSET_CATALOGUE.md is generated from): box = [w,h,d] metres, off = [x,z] of the box centre from the origin
function A2_table(){const G=A2_geos();return A2_DEF.map(d=>{const g=G[d.id],a=g&&g.userData.a2,bb=a&&a.bb;return{id:d.id,name:d.n,cat:d.cat,city:d.city,tris:a?a.tris:-1,colours:a?a.cols.length:-1,cols:a?a.cols.join(','):'',mats:1,
  box:bb?[+(bb.max.x-bb.min.x).toFixed(2),+(bb.max.y-bb.min.y).toFixed(2),+(bb.max.z-bb.min.z).toFixed(2)]:null,off:bb?[+((bb.max.x+bb.min.x)/2).toFixed(2),+((bb.max.z+bb.min.z)/2).toFixed(2)]:null,collider:d.col||'none',cr:d.cr||0,scale:d.sc}})}
// pools per city: [id, weight, extra kerb offset]; Athens uses ONLY ath/both-tagged props, Frankfurt only fra/both (race props are never in a city pool)
const A2_POOL={ath:[['olive',.16,.6],['cypress',.1,.6],['aleppo',.06,.6],['plane',.08,.6],['bougain',.1,.5],['agave',.07,.5],['kiosk',.02,.5],['taverna',.05,.9],['column',.025,.6],['wall',.07,.7],['scooter',.06,.5],['taxi',.03,1],['trolley',.025,.5],['apt1',.012,1.5],['apt2',.012,1.5],['church',.004,2],['temple',.005,2]],
 fra:[['plane',.1,.8],['timber',.018,1.5],['tram',.025,.5],['ebbelwoi',.05,.9]]};
function A2_city(){return CID==='fra'?'fra':'ath'}
// park / plaza edges and slipways: a car leaving the road there must not meet a prop (xf1/grass, xf1/water): keep m metres clear of every PARKS rectangle and slipway
function A2_verge(x,z,m){if(typeof PARKS!=='undefined')for(const R of PARKS)if(x>R.x0-m&&x<R.x1+m&&z>R.z0-m&&z<R.z1+m)return true;if(typeof SLIPS!=='undefined')for(let _k1=0,_c1=SLIPS,S;_k1<_c1.length&&(S=_c1[_k1],true);_k1++)if((x-S.x)**2+(z-S.z)**2<m*m)return true;return false}
// open verge: nothing solid within 30 m behind the kerb (n = direction away from the road): a car leaving the road there drives onto open ground (xf1/grass picks exactly these edges), so keep the kerb clear
function A2_open(x,z,nx,nz){for(let d=6;d<=30;d+=6){const px=x+nx*d,pz=z+nz*d;if(roamHit(px,pz,3,groundY(px,pz)+.5))return false}return true}
function A2_free(x,z,r){const k=Math.round(x/3)+'|'+Math.round(z/3);if(A2.occ.has(k))return false;if(LV_onRoad(x,z,.9+Math.min(r,3)*.4))return false;if(typeof OC_roadE==='function'&&OC_roadE(x,z)<Math.min(r,3)+.8)return false;if(A2_verge(x,z,14))return false;if(roamHit(x,z,r+.3,groundY(x,z)+.5))return false;A2.occ.add(k);return true}
function A2_cell(cx,cz){const key=cx*100000+cz;let a=A2.C.get(key);if(a)return a;a=[];A2.C.set(key,a);const N=HUB.nodes,E=LV_eGrid().get(key),seen=new Set(),C=A2_city(),P=A2_POOL[C],G=A2_geos(),PT=P.reduce((t,e)=>t+e[1],0);if(!E)return a;
 for(let e=0;e<E.length;e+=2){let i=E[e],bi=E[e+1];if(i>bi){const t=i;i=bi;bi=t}const ek=i*1e6+bi;if(seen.has(ek))continue;seen.add(ek);const A=N[i],B=N[bi];if(!A||!B||A.ab||B.ab)continue;
  const L=Math.hypot(B.x-A.x,B.z-A.z);if(L<2)continue;const ux=(B.x-A.x)/L,uz=(B.z-A.z)/L,W=Math.min(A.w||20,B.w||20);if(W<7)continue;const j0=A.nb.length>2?10:0,j1=L-(B.nb&&B.nb.length>2?10:0),rn=mul(i*7919+bi*104729+77);
  for(const sd of[-1,1]){const off=Math.max(W/2+1.15,(Math.min(A.pw||0,B.pw||0)||W/2+.5)+1.0);
   for(let s=rn()*8;s<L;s+=8){const q=rn(),h0=rn(),sc=rn(),ku=rn()*PT;if(s<j0||s>j1||q>.5)continue;let u=ku,pick=null;for(const it of P){if(u<it[1]){pick=it;break}u-=it[1]}if(!pick)continue;
    const d=A2_BY[pick[0]],g=G[pick[0]];if(!g)continue;const a2=g.userData.a2,bb=a2.bb,fw=bb.max.x-bb.min.x,fd=bb.max.z-bb.min.z,rad=Math.max(.5,Math.hypot(fw,fd)/2),o=off+pick[2]+(d.cat==='building'?fd/2:0),
     X=A.x+ux*s-uz*o*sd,Z=A.z+uz*s+ux*o*sd;if(Math.floor(X/40)!==cx||Math.floor(Z/40)!==cz)continue;if(A2_open(X,Z,-uz*sd,ux*sd))continue;if(!A2_free(X,Z,rad))continue;
    const y=Math.max(0,groundY(X,Z)),hh=d.cat==='building'||d.id==='kiosk'||d.id==='trolley'||d.id==='tram'?A2_faceRoad(ux,uz,sd):d.id==='wall'?Math.atan2(-uz,ux):d.cat==='vehicle'?Math.atan2(ux,uz)+(sd>0?0:Math.PI):h0*6.28;/* parked vehicles lie parallel to the street: a random yaw swung a 4 m taxi into the lane and stalled bot/nav */// street-facing props look at the road, the wall runs along it
    const s0=d.sc[0]+(d.sc[1]-d.sc[0])*sc;a.push({d:pick[0],x:X,z:Z,nx:-uz*sd,nz:ux*sd,y,h:hh,s:s0,r:d.col==='c'?d.cr*s0:rad,hw:fw/2*s0,hd:fd/2*s0,ox:(bb.max.x+bb.min.x)/2*s0,oz:(bb.max.z+bb.min.z)/2*s0})}}}
 A2.n.items=(A2.n.items||0)+a.length;A2.n.cells=A2.C.size;return a}
// yaw so the prop's +z side looks at the road: the prop sits at kerb + n*o with n = (-uz*sd, ux*sd), so the road is in direction -n
function A2_faceRoad(ux,uz,sd){const nx=-uz*sd,nz=ux*sd;return Math.atan2(-nx,-nz)}
function A2_init(){A2.grp=HUB.grp;A2.C=new Map();A2.occ=new Set();A2.n={};A2.px=A2.pz=1e9;A2.dead=new Set();A2.drawn=[];const G=A2_geos();A2.M={};
 for(const it of A2_POOL[A2_city()]){const id=it[0];if(A2.M[id]||!G[id])continue;const cap=A2_BY[id].cat==='building'?10:A2_BY[id].cat==='tree'?70:50,m=new THREE.InstancedMesh(G[id],A2_mat(),cap);m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);m.userData.keep=1;m.frustumCulled=false;m.castShadow=false;m.receiveShadow=false;m.count=0;m.visible=false;m.name='a2_'+id;A2.M[id]=m;HUB.grp.add(m)}}
function A2_fill(){const R0=A2.R,cx=Math.floor(RO.x/40),cz=Math.floor(RO.z/40),cr=Math.ceil(R0/40),near=[],t0=performance.now();let todo=false;
 for(let a=cx-cr;a<=cx+cr;a++)for(let b=cz-cr;b<=cz+cr;b++){const k=a*100000+b;if(!A2.C.has(k)&&performance.now()-t0>4){todo=true;continue}for(const it of A2_cell(a,b)){const d2=(it.x-RO.x)**2+(it.z-RO.z)**2;if(d2<R0*R0)near.push([d2,it])}}
 near.sort((p,q)=>p[0]-q[0]);const GR=new Set(['tree','bush']),nk=new Set(),gk=[],ok=[];// kinds by nearest instance; quota: 2 greenery kinds + the nearest other kinds (kiosk, taxi, tables, columns, buildings...)
 for(const[,it]of near)if(!nk.has(it.d)){nk.add(it.d);(GR.has(A2_BY[it.d].cat)?gk:ok).push(it.d)}
 const use=new Set([...gk.slice(0,2),...ok.slice(0,A2.K-Math.min(2,gk.length)),...gk.slice(2)].slice(0,A2.K));
 for(const id in A2.M)A2.M[id].count=0;const cnt={};A2.drawn=[];
 for(const[,it]of near){if(!use.has(it.d))continue;const m=A2.M[it.d],n=cnt[it.d]||0;if(n>=m.instanceMatrix.count)continue;cnt[it.d]=n+1;A2.drawn.push(it);LV_set(m,n,it.x,it.y,it.z,0,it.h,0,it.s)}
 for(const id in A2.M){const m=A2.M[id];m.count=cnt[id]||0;m.visible=m.count>0;m.instanceMatrix.needsUpdate=true}
 A2.n.drawn=Object.keys(cnt).length;A2.n.inst=near.length;if(todo)A2.px=1e9}
// plain push-out for solids (trunk circle, footprint box in the prop frame); no speed loss beyond a small scrub, no smash (collision lane owns colliders)
function A2_hit(){if(!A2.drawn||!A2.drawn.length)return;const now=performance.now(),dt=Math.min(.05,(now-(A2.t||now))/1000||.016);A2.t=now;
 for(const it of A2.drawn){const d=A2_BY[it.d];if(!d.col)continue;if(Math.abs((RO.y||0)-it.y)>3)continue;// only props that are drawn this fill can block (no invisible walls)
   const ex=RO.x-it.x,ez=RO.z-it.z;let nx,nz,pen;
   if(d.col==='c'){const rr=it.r+1.1,e2=ex*ex+ez*ez;if(e2>=rr*rr)continue;const e=Math.sqrt(e2)||1;nx=ex/e;nz=ez/e;pen=rr-e}
   else{const c=Math.cos(it.h),s=Math.sin(it.h),lx=ex*c-ez*s-it.ox,lz=ex*s+ez*c-it.oz,hx=it.hw+1.1,hz=it.hd+1.1;if(Math.abs(lx)>=hx||Math.abs(lz)>=hz)continue;
    const px=hx-Math.abs(lx),pz=hz-Math.abs(lz);let wx=0,wz=0;if(px<pz){wx=lx<0?-1:1;pen=px}else{wz=lz<0?-1:1;pen=pz}nx=wx*c+wz*s;nz=-wx*s+wz*c}
   RO.x+=nx*pen;RO.z+=nz*pen;const sg=RO.v<0?-1:1,hx2=Math.sin(RO.h)*sg,hz2=Math.cos(RO.h)*sg,cin=-(hx2*nx+hz2*nz);
   if(cin>0){RO.v*=Math.exp(-2.5*cin*dt);/* time based, glancing hits cost little (was x0.65 per frame: 71 -> 0 km/h scraping a park edge) */if(sg>0&&cin<.95){const sd=hx2*-nz+hz2*nx>=0?1:-1;RO.h+=angDiff(Math.atan2(-nz*sd,nx*sd),RO.h)*.25}A2.n.hit=(A2.n.hit||0)+1;A2.n.last=it.d+'@'+Math.round(it.x)+','+Math.round(it.z)+' car '+Math.round(RO.x)+','+Math.round(RO.z)+' v'+Math.round(RO.v)}}}
function A2_step(){if(!A2.on||!HUB.grp||!HUB.nodes||!HUB.bld||!HUB.bld.length)return;if(A2.grp!==HUB.grp)A2_init();A2.fr++;if(A2.fr%12===0||Math.hypot(RO.x-A2.px,RO.z-A2.pz)>25){A2.px=RO.x;A2.pz=RO.z;const t0=performance.now();A2_fill();const ms=performance.now()-t0;A2.n.fillMax=Math.max(A2.n.fillMax||0,+ms.toFixed(1));A2.n.fills=(A2.n.fills||0)+1;if(ms>8)A2.n.slow=(A2.n.slow||0)+1}A2_hit()}
{const _a2LS=LV_step;LV_step=dt=>{_a2LS(dt);if(!A2.on||!RO.on||!LV.init)return;try{A2_step()}catch(e){if(!A2.e){A2.e=1;console.warn('A2 step',e)}}}}
// ---- race: every prop of the track baked into ONE static mesh (1 draw call, no shadows). Slots in lap distance s (m) with a lateral offset from the centreline.
const A2_RACE=[// [id, s as fraction of the lap or metres (negative = from the start line backwards), side (-1/0/1 or 2 = both), lateral (m beyond the road edge, or 'c' centre), extra yaw, scale]
 ['rgate',0.5,0,'c',0,1],['rstand',8,2,10,'f',1],['rpit',-18,1,3.2,'f',1],['rflags',-30,2,2.5,'x',1],['rflags',30,2,2.5,'x',1],['rflags',-90,2,2.5,'x',1],
 ['rbarrier',-70,2,2.2,0,1],['rbarrier',-100,2,2.2,0,1],['rcones',-45,1,1.8,0,1],['rcones',-44,-1,1.8,0,1],['rring',.25,0,'c',0,1],['rring',.75,0,'c',0,1],
 ['rboost',.15,-1,.55,0,1],['rboost',.4,1,.55,0,1],['rboost',.65,-1,.55,0,1],['rboost',.9,1,.55,0,1]];
function A2_race(){if(!A2.on||!WORLD||!TD)return;const G=A2_geos(),f=mkF(),L=TD.L,list=[],M=new THREE.Matrix4(),Q=new THREE.Quaternion(),S=new THREE.Vector3(),P=new THREE.Vector3(),Y=new THREE.Vector3(0,1,0),sides=[];
 const put=(id,s,sd,lat,ex,sc)=>{const g=G[id];if(!g)return;frameAt(TD,s<0?L+s:s<=1&&s>0?s*L:s,f);const half=HALF,off=lat==='c'?0:(half+lat)*sd,yaw=ex==='f'?Math.atan2(-f.r.x*sd,-f.r.z*sd):ex==='x'?Math.atan2(-f.t.z,f.t.x):Math.atan2(f.t.x,f.t.z)+ex,y=f.p.y+f.r.y*off;
  let sx=sc;if(id==='rgate')sx=(2*half+4)/10;P.set(f.p.x+f.r.x*off,y,f.p.z+f.r.z*off);Q.setFromAxisAngle(Y,yaw);S.set(sx,sc,sc);M.compose(P,Q,S);const c=g.clone();c.applyMatrix4(M);list.push(c)};
 // curvature spots: tyre stacks on the outside of the 4 sharpest corners
 let ks=[];for(let i=0;i<TD.N;i+=Math.max(1,Math.floor(TD.N/160)))ks.push([Math.abs(TD.K[i]),i*TD.ds,Math.sign(TD.K[i])||1]);ks.sort((a,b)=>b[0]-a[0]);const used=[];
 for(const k of ks){if(used.length>=4)break;if(used.every(u=>Math.abs(u-k[1])>60&&Math.abs(Math.abs(u-k[1])-L)>60)){used.push(k[1]);sides.push(k)}}
 for(const[id,s,sd,lat,ex,sc]of A2_RACE){if(sd===2){put(id,s,-1,lat,ex,sc);put(id,s,1,lat,ex,sc)}else put(id,s,sd,lat,ex,sc)}
 for(const k of sides)for(const sd of[-1,1])put('rtyres',k[1],sd*k[2]*-1,2.2,'x',1);// outside = away from the turn centre
 if(!list.length)return;const geo=mergeG(list);for(const c of list)c.dispose();const m=new THREE.Mesh(geo,A2_mat());m.name='a2_race';m.frustumCulled=false;m.castShadow=false;m.receiveShadow=false;WORLD.add(m);A2.race=m;A2.n.race=list.length}
{const _a2LT=loadTrack;loadTrack=function(id){const r=_a2LT.apply(this,arguments);if(A2.on){A2.mat=null;try{A2_race()}catch(e){console.warn('A2 race',e)}}return r}}
// dev helper (tools/a2/probe.js sheet): contact sheet of props on a grey floor, returns a jpeg data URL
function A2_sheet(ids){const G=A2_geos(),T=A2_table(),use=ids&&ids.length?ids:T.map(t=>t.id),sc=new THREE.Scene(),n=use.length,cols=Math.ceil(Math.sqrt(n*2.1)),rows=Math.ceil(n/cols),cell=7;
 sc.background=new THREE.Color('#5aa8e8');sc.add(new THREE.HemisphereLight('#ffffff','#7a8a6a',1.1));const dl=new THREE.DirectionalLight('#fff4e0',2.2);dl.position.set(-8,14,10);sc.add(dl);
 const gnd=new THREE.Mesh(new THREE.PlaneGeometry(cols*cell+8,rows*cell+8),new THREE.MeshLambertMaterial({color:'#6e7480'}));gnd.rotation.x=-Math.PI/2;gnd.position.y=-.02;sc.add(gnd);
 use.forEach((id,i)=>{const t=T.find(q=>q.id===id),m=new THREE.Mesh(G[id],A2_mat()),k=Math.min(1,5.2/Math.max(t.box[0],t.box[1],t.box[2])),c=i%cols,r=Math.floor(i/cols);
  m.scale.setScalar(k);m.position.set((c-(cols-1)/2)*cell-t.off[0]*k,0,(r-(rows-1)/2)*cell-t.off[1]*k);m.rotation.y=-.5;sc.add(m)});
 const cam=new THREE.PerspectiveCamera(32,852/393,.1,300),W=cols*cell,H=rows*cell;cam.position.set(0,(Math.max(W*.42,H*1.1)+3)*1.3,(H*.9+W*.5)*1.3);cam.lookAt(0,0,.5);
 const rt=renderer.getRenderTarget(),Wd=852,Hd=393,T2=new THREE.WebGLRenderTarget(Wd,Hd);T2.texture.colorSpace=THREE.SRGBColorSpace;renderer.setRenderTarget(T2);const d0=typeof TQ!=='undefined'?TQ.draw:0;if(typeof TQ!=='undefined')TQ.draw=1;renderer.render(sc,cam);if(typeof TQ!=='undefined')TQ.draw=d0;const px=new Uint8Array(Wd*Hd*4);renderer.readRenderTargetPixels(T2,0,0,Wd,Hd,px);renderer.setRenderTarget(rt);T2.dispose();
 const cv=document.createElement('canvas');cv.width=Wd;cv.height=Hd;const cx=cv.getContext('2d'),im=cx.createImageData(Wd,Hd);for(let y=0;y<Hd;y++)im.data.set(px.subarray((Hd-1-y)*Wd*4,(Hd-y)*Wd*4),y*Wd*4);cx.putImageData(im,0,0);return cv.toDataURL('image/jpeg',.88)}
// city-wide scan (GO assets2/scan): generate EVERY cell of the street graph, count props on a carriageway (graph lanes + Athens/fill/autobahn roads via OC_roadE) and the kinds placed
function A2_scan(){if(!HUB.nodes||!HUB.nodes.length)return null;const save=[A2.C,A2.occ];A2.C=new Map();A2.occ=new Set();const cells=new Set(),N=HUB.nodes;
 for(const A of N){if(!A||!A.nb)continue;cells.add(Math.floor(A.x/40)+','+Math.floor(A.z/40));for(const bi of A.nb){const B=N[bi];if(B)cells.add(Math.floor((A.x+B.x)/80)+','+Math.floor((A.z+B.z)/80))}}
 const kinds={},bad=[];let n=0;for(const c of cells){const[cx,cz]=c.split(',').map(Number);for(const it of A2_cell(cx,cz)){n++;kinds[it.d]=(kinds[it.d]||0)+1;
   const e=typeof OC_roadE==='function'?OC_roadE(it.x,it.z):1e9;if(LV_onRoad(it.x,it.z,0)||e<=0||A2_verge(it.x,it.z,6)||A2_open(it.x,it.z,it.nx,it.nz))bad.push(it.d+'@'+Math.round(it.x)+','+Math.round(it.z)+' e='+(e>1e8?'-':e.toFixed(1)))}}
 A2.C=save[0];A2.occ=save[1];A2.px=1e9;return{n,cells:cells.size,kinds,bad}}
window.__a2={parks:()=>PARKS.map(R=>[R.name,Math.round(R.x0),Math.round(R.x1),Math.round(R.z0),Math.round(R.z1)]),verge:A2_verge,scan:A2_scan,info:()=>({calls:renderer.info.render.calls,tris:renderer.info.render.triangles,vis:Object.values(A2.M||{}).filter(q=>q.visible).length,inst:Object.values(A2.M||{}).reduce((s,q)=>s+q.count,0)}),sheet:A2_sheet,state:A2,def:A2_DEF,pool:A2_POOL,table:A2_table,geos:A2_geos,pal:A2_PAL,hash:()=>A2.on?1:0};
// ---- GO assets/catalogue: state asserts only (no graphics, no play). Pass line: every prop <= 400 tris, <= 3 palette colours, 1 shared material, box + city tag + collider kind recorded,
// Athens pool = Athens/both tags only (no palm), Frankfurt pool = Frankfurt/both only, placement hook on by default (?assets2=0 off).
(function A2_reg(i){const C=window.__chk;if(C&&C.GO&&C.items){if(!C.items.some(q=>q.ver==='assets2'&&q.id==='catalogue')){
 C.items.push({ver:'assets2',id:'catalogue',area:'world',text:'assets-r21p · prop catalogue (docs/ASSET_CATALOGUE.md): 📍 GO checks all 29 part-list props (no graphics). Pass line: every prop ≤ 400 triangles, ≤ 3 palette colours, 1 shared material, box + city tag + collider kind set; the Athens set has only Athens/both props and no palm; the Frankfurt set only Frankfurt/both; placement is off unless ?assets2=1.'});
 C.items.push({ver:'assets2',id:'scan',area:'world',text:'assets-r21p · props stay off the road (review fix): 📍 GO generates every placed prop of the whole city (no graphics). Pass line: 0 props on a carriageway, within 6 m of a park/slipway or at an open verge (nothing solid 30 m behind the kerb) (street graph + Athens streets, fill, autobahn) and ≥ 6 prop kinds placed in Athens / ≥ 3 in Frankfurt.'});
 C.items.push({ver:'assets2',id:'place',area:'world',text:'assets-r21p · placement hook (?assets2=1): 📍 GO builds the kerb slots around you and the race bake. Pass line: with the flag on, ≥ 1 new prop stands within 115 m and ≤ 5 extra instanced draws; with the flag off nothing is added.'})}
 C.GO['assets2/catalogue']=['fra','ath'].map(c=>({c,n:c+' prop catalogue limits',secs:6,fn:()=>{let msg;try{const T=A2_table(),bad=[];for(const t of T){if(!(t.tris>0&&t.tris<=400))bad.push(t.id+' tris '+t.tris);if(t.colours>3||t.colours<1)bad.push(t.id+' colours '+t.colours);if(!t.box||!(t.box[0]>0))bad.push(t.id+' box');if(!t.city)bad.push(t.id+' city')}
   const pool=A2_POOL[c].map(e=>A2_BY[e[0]]),wrong=pool.filter(d=>!(d.city===c||d.city==='both')),pal=pool.filter(d=>/palm/i.test(d.id+d.n));if(wrong.length)bad.push('wrong-city '+wrong.map(d=>d.id).join('/'));if(pal.length)bad.push('palm in set');
   const maxT=Math.max(...T.map(t=>t.tris)),ok=!bad.length&&T.length>=29;msg='📍 CATALOGUE '+c.toUpperCase()+' · '+T.length+' props, max '+maxT+' tris (≤ 400), ≤ 3 colours each, 1 shared material, '+pool.length+' in the '+c+' set (no palm, tags ok), placement '+(A2.on?'on':'off by default')+(bad.length?' · '+bad.slice(0,4).join('; '):'')+' → '+(ok?'✅ PASS':'❌ FAIL')}catch(e){msg='📍 CATALOGUE · error '+e+' ❌ FAIL'}return msg}}));
 C.GO['assets2/scan']=['fra','ath'].map(c=>({c,n:c+' placed props off every carriageway',secs:25,fn:()=>{if(state!=='roam'||!RO.on)return'📍 Start free roam first';let msg;try{const r=A2_scan();if(!r)return'📍 SCAN · street graph not ready';const nk=Object.keys(r.kinds).length,ok=!r.bad.length&&r.n>0&&nk>=(c==='ath'?6:3);msg='📍 SCAN '+c.toUpperCase()+' · '+r.n+' props in '+r.cells+' cells, '+nk+' kinds, '+r.bad.length+' on a carriageway'+(r.bad.length?' ('+r.bad.slice(0,3).join('; ')+')':'')+' → '+(ok?'✅ PASS':'❌ FAIL')}catch(e){msg='📍 SCAN · error '+e+' ❌ FAIL'}return msg}}));
 C.GO['assets2/place']=['fra','ath'].map(c=>({c,n:c+' placement hook',secs:10,fn:()=>{if(state!=='roam'||!RO.on)return'📍 Start free roam first';let msg;try{if(!A2.on){const n=Object.values(A2.M||{}).reduce((s,m)=>s+m.count,0);msg='📍 PLACE '+c.toUpperCase()+' · flag off, '+n+' instances (must be 0) → '+(n===0?'✅ PASS':'❌ FAIL')}
   else{A2_step();A2_fill();const ms=Object.values(A2.M||{}).filter(m=>m.visible),n=ms.reduce((s,m)=>s+m.count,0),ok=n>=1&&ms.length<=A2.K;msg='📍 PLACE '+c.toUpperCase()+' · '+n+' instances in '+ms.length+' kinds within '+A2.R+' m (≥ 1, kinds ≤ '+A2.K+') → '+(ok?'✅ PASS':'❌ FAIL')}}catch(e){msg='📍 PLACE · error '+e+' ❌ FAIL'}return msg}}));return}
 if(i<600)setTimeout(()=>A2_reg(i+1),100)})(0);
