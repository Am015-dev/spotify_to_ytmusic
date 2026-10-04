// ===== GB: LEGO brick builder + driver minifigure (extends the garage #gbx). All globals GB_*. =====
// Bricks live in the ship's local frame (m, before SHIP_K): stud pitch GB_U, plate height GB_PH. A brick = {t,x,z,y,r,m,c}
// (type, min cell x/z, bottom in plates, rotation 0-3, mirrored, colour index). The whole build + the driver merge into
// ONE geometry (+1 emissive geometry for lights) -> ≤ 2 draw calls in the world. Bricks are visual; stats get small clamped mods.
const GB_U=.6,GB_PH=.24,GB_N0=-9,GB_N1=8,GB_MAX=120,GB_CAP=15;
const GB_BC=['#d01712','#fe8a18','#fac80a','#a5ca18','#00852b','#36aebf','#0055bf','#8a12a8','#ff698f','#f4f4f4','#a0a5a9','#1b2a34'];
const GB_PC={b11:{n:'1×1',w:1,d:1,h:3,s:1,ic:'▪'},b12:{n:'1×2',w:1,d:2,h:3,s:1,ic:'▮'},b22:{n:'2×2',w:2,d:2,h:3,s:1,ic:'■'},b24:{n:'2×4',w:2,d:4,h:3,s:1,ic:'█'},
 slope:{n:'Slope',w:2,d:2,h:3,ic:'◢'},tile:{n:'Tile',w:1,d:2,h:1,ic:'▭'},round:{n:'Round',w:1,d:1,h:3,s:1,ic:'●'},wedge:{n:'Wedge',w:2,d:2,h:1,ic:'◣'},
 spoiler:{n:'Spoiler',w:4,d:1,h:3,ic:'⊓'},exhaust:{n:'Exhaust',w:1,d:1,h:3,ic:'💨'},light:{n:'Light',w:1,d:1,h:1,ic:'💡'},flag:{n:'Flag',w:1,d:1,h:3,ic:'🚩'}};
const GB_={bk:0,tool:'add',pc:'b22',col:0,rot:0,mir:1,undo:[],yaw:.7,pit:.62,dist:14,ptr:new Map(),base:null,hull:[],ghost:null,hov:null,noDraw:0,rc:new THREE.Raycaster(),gc:new Map()};
CK.push('mho_gbfig');
// ---------- geometry helpers (non-indexed, position+normal+color)
function GB_col(g,c,k=1){g=g.index?g.toNonIndexed():g;if(g.attributes.uv)g.deleteAttribute('uv');const n=g.attributes.position.count,a=new Float32Array(n*3),C=new THREE.Color(c);for(let i=0;i<n;i++){a[i*3]=C.r*k;a[i*3+1]=C.g*k;a[i*3+2]=C.b*k}g.setAttribute('color',new THREE.BufferAttribute(a,3));return g}
const GB_box=(x0,x1,y0,y1,z0,z1,c,k)=>GB_col(new THREE.BoxGeometry(x1-x0,y1-y0,z1-z0).translate((x0+x1)/2,(y0+y1)/2,(z0+z1)/2),c,k);
const GB_cyl=(r,h,x,y0,z,c,n=10,k)=>GB_col(new THREE.CylinderGeometry(r,r,h,n).translate(x,y0+h/2,z),c,k);
function GB_mirX(g){g.scale(-1,1,1);for(const key of['position','normal','color']){const A=g.attributes[key].array;for(let i=0;i<A.length;i+=9)for(let k=0;k<3;k++){const t=A[i+3+k];A[i+3+k]=A[i+6+k];A[i+6+k]=t}}return g}
function GB_shape(g,f){const P=g.attributes.position;for(let i=0;i<P.count;i++){const v=f(P.getX(i),P.getY(i),P.getZ(i));if(v)P.setXYZ(i,v[0],v[1],v[2])}g.computeVertexNormals();return g}
const GB_dims=b=>{const P=GB_PC[b.t];return b.r%2?[P.d,P.w]:[P.w,P.d]};
// one piece in its own frame (centre of footprint, y=0 at its bottom), r=0: front = -z
function GB_piece(t,c,M,L){const P=GB_PC[t],W=P.w*GB_U,D=P.d*GB_U,H=P.h*GB_PH,g=.012,col=GB_BC[c]||c,dk='#2a2f38',stud=(x,z)=>M.push(GB_cyl(.17,.1,x,H,z,col,8)),studs=(ok)=>{for(let i=0;i<P.w;i++)for(let j=0;j<P.d;j++){const x=(i+.5)*GB_U-W/2,z=(j+.5)*GB_U-D/2;if(!ok||ok(x,z))stud(x,z)}};
 if(t==='round'){M.push(GB_cyl(GB_U*.46,H,0,0,0,col,14));stud(0,0)}
 else if(t==='slope'){M.push(GB_box(-W/2+g,W/2-g,0,H,0,D/2-g,col));studs((x,z)=>z>0);M.push(GB_shape(GB_box(-W/2+g,W/2-g,0,H,-D/2+g,0,col),(x,y,z)=>y>H/2&&z<-D/4?[x,H*.22,z]:null))}
 else if(t==='wedge'){M.push(GB_shape(GB_box(-W/2+g,W/2-g,0,H,-D/2+g,D/2-g,col),(x,y,z)=>x>0&&z<0?[-W/2+g,y,z]:null));studs((x,z)=>!(x>0&&z<0))}
 else if(t==='tile')M.push(GB_box(-W/2+g,W/2-g,0,H,-D/2+g,D/2-g,col));
 else if(t==='spoiler'){for(const sx of[-1,1])M.push(GB_box(sx*W*.3-.06,sx*W*.3+.06,0,H*.85,-.08,.08,dk));const w=GB_box(-W/2,W/2,-.05,.05,-D*.7,D*.7,col);w.rotateX(-.22);w.translate(0,H*.9,0);M.push(w);for(const sx of[-1,1])M.push(GB_box(sx*W/2-.04,sx*W/2+.04,H*.55,H*1.25,-D*.6,D*.6,col))}
 else if(t==='exhaust'){M.push(GB_box(-W/2+g,W/2-g,0,H*.35,-D/2+g,D/2-g,dk));const p=new THREE.CylinderGeometry(.13,.16,GB_U*1.1,10);p.rotateX(Math.PI/2-.35);p.translate(0,H*.6,GB_U*.15);M.push(GB_col(p,'#c9ced6'));const f=new THREE.CircleGeometry(.11,10);f.rotateX(-.35);f.translate(0,H*.6+GB_U*.19,GB_U*.67);L.push(GB_col(f,'#ff8a2a',3))}
 else if(t==='light'){M.push(GB_cyl(GB_U*.46,H*.5,0,0,0,dk,12));L.push(GB_cyl(GB_U*.38,H*.6,0,H*.45,0,col,12,2.6))}
 else if(t==='flag'){M.push(GB_cyl(GB_U*.4,H*.3,0,0,0,dk,10));M.push(GB_cyl(.045,H*4,0,H*.3,0,'#d8dde4',6));M.push(GB_box(-.02,.02,H*3.1,H*4.2,.03,GB_U*1.3,col));M.push(GB_box(-.025,.025,H*3.1,H*3.65,.03,GB_U*.67,'#f4f4f4'))}
 else{M.push(GB_box(-W/2+g,W/2-g,0,H,-D/2+g,D/2-g,col));studs()}}
function GB_brickGeo(b,M,L){const m0=M.length,l0=L.length;GB_piece(b.t,b.c,M,L);const[fw,fd]=GB_dims(b),cx=(b.x+fw/2)*GB_U,cz=(b.z+fd/2)*GB_U;
 for(const A of[M,L])for(let i=(A===M?m0:l0);i<A.length;i++){if(b.m)GB_mirX(A[i]);A[i].rotateY(b.r*Math.PI/2);A[i].translate(cx,b.y*GB_PH,cz)}}
// ---------- driver minifigure
const GB_FIG={h:[['smile','Smile'],['grin','Big grin'],['wink','Wink'],['shades','Shades',{stars:5}],['angry','Game face'],['shock','Shocked'],['freckle','Freckles',{pack:4}],['visor','Cyber visor',{pack:6}]],
 x:[['helmet','Racing helmet'],['none','Bald'],['short','Short hair'],['long','Long hair'],['cap','Cap'],['cowboy','Cowboy hat',{flag:'BRANDT'}],['mohawk','Mohawk',{pack:3}],['crown','Kaiser crown',{flag:'SKYCUP'}]],
 t:[['racer','Racing suit'],['plain','Plain'],['hoodie','Hoodie'],['logo','Team logo'],['suit','Sharp suit',{stars:10}],['police','Police',{pack:1}],['flames','Flames',{flag:'FERREIRA'}],['armor','Armour',{flag:'ÇELIK'}]],
 l:[['#2b3a67','Blue'],['#1b1d22','Black'],['#c4281c','Red'],['#f2f2f2','White'],['#c9a66b','Tan'],['#2f7d3a','Green'],['#8a8f99','Grey'],['#e0b020','Gold',{flag:'MOREAU'}]],
 c:[['#e01e2b','Red'],['#2f7bff','Blue'],['#ffd12c','Yellow'],['#36d17a','Green'],['#ff7a1c','Orange'],['#8c55ff','Purple'],['#f4f4f4','White'],['#f5c20c','Chrome gold',{stars:25}]]};
const GB_FCAT={h:'HEAD / FACE',x:'HAIR / HAT',t:'TORSO',l:'LEGS',c:'COLOUR'};
const GB_figGet=()=>Object.assign({h:'smile',x:'helmet',t:'racer',l:'#2b3a67',c:'#e01e2b'},store.get('mho_gbfig',{}));
function GB_figOk(cat,id){const o=GB_FIG[cat].find(e=>e[0]===id);return !!o&&gbReq(o[2],'fig_'+id)}
function GB_figGeo(f,M,L,sit){const sk='#ffd84a',c=f.c,dk='#1b1d22',P=[],Q=[],B=(x0,x1,y0,y1,z0,z1,cl,k)=>P.push(GB_box(x0,x1,y0,y1,z0,z1,cl,k)),C=(r,h,y,cl,n=14,x=0,z=0)=>P.push(GB_cyl(r,h,x,y,z,cl,n));
 if(!sit){B(-.23,-.01,0,.42,-.13,.13,f.l);B(.01,.23,0,.42,-.13,.13,f.l)}B(-.24,.24,.42,.5,-.13,.13,f.l);
 const tc=f.t==='suit'?'#1b1d22':f.t==='police'?'#1c2c55':f.t==='armor'?'#c9ced6':c;P.push(GB_shape(GB_box(-.24,.24,.5,.92,-.13,.13,tc),(x,y,z)=>y>.8?[x*.84,y,z]:null));
 for(const sx of[-1,1]){const a=GB_box(-.06,.06,-.3,0,-.07,.07,tc);a.rotateX(sit?-.9:-.15);a.translate(sx*.27,.88,0);P.push(a);const h=GB_cyl(.055,.08,0,-.38,0,sk,8);h.rotateX(sit?-.9:-.15);h.translate(sx*.27,.88,0);P.push(h)}
 const F=-.135,dec=(x0,x1,y0,y1,cl,k)=>B(x0,x1,y0,y1,F-.01,F,cl,k);
 if(f.t==='racer'){dec(-.05,.05,.5,.92,'#f4f4f4');dec(-.2,-.14,.5,.84,'#f4f4f4')}else if(f.t==='hoodie'){dec(-.12,.12,.55,.66,'#222831');C(.17,.05,.9,c,12)}else if(f.t==='logo'){P.push(GB_col(new THREE.CircleGeometry(.09,14).rotateY(Math.PI).translate(0,.72,F-.012),'#f4f4f4'))}
 else if(f.t==='suit'){P.push(GB_col(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute([-.1,.92,F-.01,.1,.92,F-.01,0,.62,F-.01],3)).computeVertexNormals(),'#f4f4f4'));dec(-.025,.025,.6,.86,'#d01712')}
 else if(f.t==='police'){dec(.06,.16,.76,.84,'#ffd12c');dec(-.2,.2,.5,.55,'#f4f4f4')}else if(f.t==='flames'){dec(-.2,-.06,.5,.7,'#ff8a2a');dec(.04,.2,.5,.66,'#fac80a');dec(-.06,.04,.5,.6,'#ff5a1a')}else if(f.t==='armor'){dec(-.16,.16,.6,.86,c)}
 C(.07,.04,.92,sk,10);C(.15,.26,.96,sk,16);C(.08,.06,1.22,sk,10);
 const E=-.152,eye=(x,y,w=.022,h=.032)=>B(x-w,x+w,y-h,y+h,E-.008,E+.004,dk);
 if(f.h==='shades')B(-.13,.13,1.07,1.12,E-.012,E+.004,dk);else if(f.h==='visor')Q.push(GB_box(-.14,.14,1.06,1.12,E-.014,E+.004,'#22e4ff',2.4));else if(f.h==='wink'){eye(-.055,1.1);B(.03,.08,1.095,1.105,E-.008,E+.004,dk)}else{eye(-.055,1.1);eye(.055,1.1)}
 if(f.h==='angry'){B(-.09,-.02,1.14,1.155,E-.008,E+.004,dk);B(.02,.09,1.14,1.155,E-.008,E+.004,dk)}
 if(f.h==='shock')B(-.025,.025,1.0,1.045,E-.008,E+.004,dk);else if(f.h==='grin'){B(-.07,.07,1.0,1.04,E-.008,E+.004,dk);B(-.06,.06,1.025,1.04,E-.012,E+.004,'#f4f4f4')}else B(-.05,.05,1.01,1.025,E-.008,E+.004,dk);
 if(f.h==='freckle')for(const sx of[-1,1])B(sx*.09-.012,sx*.09+.012,1.05,1.065,E-.006,E+.004,'#d07a2a');
 const hair='#5a3a1e';if(f.x==='helmet'){P.push(GB_col(new THREE.SphereGeometry(.2,16,10,0,Math.PI*2,0,Math.PI*.62).translate(0,1.1,0),c));B(-.16,.16,.96,1.04,-.02,.18,c);B(-.02,.02,1.12,1.31,-.2,.12,'#f4f4f4')}
 else if(f.x==='short'){B(-.16,.16,1.16,1.27,-.13,.16,hair);B(-.16,.16,1.0,1.2,.06,.16,hair)}else if(f.x==='long'){B(-.17,.17,1.16,1.28,-.14,.17,'#e0b020');B(-.17,.17,.86,1.2,.04,.17,'#e0b020')}
 else if(f.x==='cap'){C(.165,.1,1.18,c,16);B(-.12,.12,1.18,1.21,-.32,-.1,c)}else if(f.x==='cowboy'){C(.3,.03,1.18,'#7a4a22',18);C(.15,.16,1.2,'#7a4a22',14);B(-.15,.15,1.22,1.25,-.15,.15,'#2a1a0e')}
 else if(f.x==='mohawk')B(-.035,.035,1.2,1.4,-.14,.16,'#ff2d95');else if(f.x==='crown'){C(.17,.1,1.2,'#f5c20c',16);for(let i=0;i<6;i++){const a=i/6*Math.PI*2;B(Math.sin(a)*.15-.025,Math.sin(a)*.15+.025,1.3,1.38,Math.cos(a)*.15-.025,Math.cos(a)*.15+.025,'#f5c20c')}}
 const s=sit?1.5:1,tf=g=>{g.scale(s,s,s);if(sit)g.translate(0,.74-.42*s,-1.55)};for(const g of P){tf(g);M.push(g)}for(const g of Q){tf(g);L.push(g)}}
// portrait (2D canvas, cached) for cutscenes and the driver tab
const GB_PT={};function GB_portrait(f){f=f||GB_figGet();const k=JSON.stringify(f);if(GB_PT[k])return GB_PT[k];const[c,g]=cv(96,96);
 const gr=g.createRadialGradient(48,40,6,48,48,52);gr.addColorStop(0,f.c);gr.addColorStop(1,'#020812');g.fillStyle=gr;g.fillRect(0,0,96,96);
 const tc=f.t==='suit'?'#1b1d22':f.t==='police'?'#1c2c55':f.t==='armor'?'#c9ced6':f.c,R=(x,y,w,h,cl)=>{g.fillStyle=cl;g.fillRect(x,y,w,h)};
 g.fillStyle=tc;g.beginPath();g.moveTo(26,96);g.lineTo(32,62);g.lineTo(64,62);g.lineTo(70,96);g.fill();R(18,66,10,26,tc);R(68,66,10,26,tc);
 if(f.t==='racer'){R(45,62,6,34,'#f4f4f4')}else if(f.t==='logo'){g.fillStyle='#fff';g.beginPath();g.arc(48,80,7,0,7);g.fill()}else if(f.t==='suit'){g.fillStyle='#f4f4f4';g.beginPath();g.moveTo(40,62);g.lineTo(56,62);g.lineTo(48,80);g.fill();R(46,66,4,16,'#d01712')}
 else if(f.t==='police')R(56,70,8,6,'#ffd12c');else if(f.t==='flames'){R(32,80,12,16,'#ff8a2a');R(50,84,14,12,'#fac80a')}else if(f.t==='armor')R(36,68,24,22,f.c);else if(f.t==='hoodie')R(38,82,20,8,'rgba(0,0,0,.3)');
 R(43,56,10,7,'#ffd84a');g.fillStyle='#ffd84a';g.beginPath();g.roundRect?g.roundRect(30,24,36,34,8):g.rect(30,24,36,34);g.fill();R(41,19,14,6,'#ffd84a');
 const dk='#1b1d22';if(f.h==='shades')R(34,35,28,6,dk);else if(f.h==='visor')R(32,34,32,7,'#22e4ff');else{R(38,35,4,6,dk);if(f.h==='wink')R(53,38,6,2,dk);else R(54,35,4,6,dk)}
 if(f.h==='angry'){R(36,31,8,2,dk);R(52,31,8,2,dk)}if(f.h==='shock')R(45,46,6,6,dk);else if(f.h==='grin'){R(39,45,18,6,dk);R(41,46,14,3,'#fff')}else R(41,47,14,2,dk);if(f.h==='freckle'){R(34,43,3,3,'#d07a2a');R(59,43,3,3,'#d07a2a')}
 if(f.x==='helmet'){g.fillStyle=f.c;g.beginPath();g.arc(48,34,21,Math.PI,0);g.fill();R(27,34,6,20,f.c);R(63,34,6,20,f.c);R(46,13,4,20,'#f4f4f4')}
 else if(f.x==='short')R(29,20,38,9,'#5a3a1e');else if(f.x==='long'){R(28,20,40,9,'#e0b020');R(26,24,6,34,'#e0b020');R(64,24,6,34,'#e0b020')}else if(f.x==='cap'){R(29,18,38,10,f.c);R(16,25,20,4,f.c)}
 else if(f.x==='cowboy'){R(16,22,64,5,'#7a4a22');R(32,8,32,15,'#7a4a22')}else if(f.x==='mohawk')R(45,6,6,20,'#ff2d95');else if(f.x==='crown'){R(31,14,34,10,'#f5c20c');for(let i=0;i<4;i++)R(31+i*10,8,5,7,'#f5c20c')}
 return GB_PT[k]=c.toDataURL()}
// ---------- merged mesh (bricks + driver) -> ≤ 2 draw calls
const GB_MAT=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.32,metalness:.05,envMapIntensity:1.4});GB_MAT.onBeforeCompile=s=>{s.fragmentShader=s.fragmentShader.replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\ntotalEmissiveRadiance+=diffuseColor.rgb*.28;')};
const GB_LMAT=new THREE.MeshBasicMaterial({vertexColors:true,toneMapped:false});
function GB_geo(bricks,fig){const M=[],L=[],tri=[],ltri=[];for(let i=0;i<(bricks||[]).length;i++){const m0=M.length,l0=L.length;GB_brickGeo(bricks[i],M,L);for(let k=m0;k<M.length;k++)tri.push([i,M[k].attributes.position.count/3]);for(let k=l0;k<L.length;k++)ltri.push([i,L[k].attributes.position.count/3])}
 if(fig)GB_figGeo(fig,M,L,true);const mk=(A,T)=>{if(!A.length)return null;const g=mergeGeometries(A);const id=new Int16Array(g.attributes.position.count/3).fill(-1);let o=0;for(const[i,n]of T){id.fill(i,o,o+n);o+=n}g.userData.bid=id;return g};
 return{m:mk(M,tri),l:mk(L,ltri)}}
function GB_attach(g,bricks,fig,cache){const U=g.userData,host=U.carG||U.m;for(const o of U.gbM||[]){host.remove(o);if(!o.userData.gbc)o.geometry.dispose()}U.gbM=[];if(!(bricks&&bricks.length)&&!fig)return;
 const key=JSON.stringify([bricks,fig]);let G=cache&&GB_.gc.get(key);if(!G){G=GB_geo(bricks,fig);if(cache){GB_.gc.set(key,G);if(GB_.gc.size>4)GB_.gc.delete(GB_.gc.keys().next().value)}}
 if(G.m){const o=new THREE.Mesh(G.m,GB_MAT);o.userData.gb=1;o.userData.gbc=!!cache;host.add(o);U.gbM.push(o)}if(G.l){const o=new THREE.Mesh(G.l,GB_LMAT);o.userData.gb=1;o.userData.gbc=!!cache;host.add(o);U.gbM.push(o)}}
// ---------- handling modifiers: small and clamped (never more than -5 % / +6 % per stat)
function GB_mods(bricks){const n=(bricks||[]).length,w=n/GB_MAX,cnt=t=>bricks.filter(b=>b.t===t).length,o={top:1-.012*w,acc:1-.03*w,han:1,hull:1+.06*w};if(!n)return null;
 const s=Math.min(2,cnt('spoiler')),e=Math.min(3,cnt('exhaust'));o.han*=1+s*.02;o.top*=1-s*.005;o.acc*=1+e*.012;for(const k in o)o[k]=clamp(o[k],.95,1.06);return o}
gbTeam=(f=>function(base,b){let t=f(base,b);const br=b&&b.on&&b.bricks&&b.bricks.length?b.bricks:null;if(t===base)t=Object.assign({},base);const md=GB_mods(br);if(md)for(const k in md)t[k]=(t[k]||1)*md[k];t.gbB=br;t.gbF=GB_figGet();return t})(gbTeam);
shipMesh=(f=>function(team){const g=f(team);if(team&&(team.gbB||team.gbF))try{GB_attach(g,team.gbB,team.gbF,true)}catch(e){console.warn('GB',e)}return g})(shipMesh);
// ---------- builder state helpers
function GB_cells(){const B=GB_.base;return B?Object.keys(B).map(k=>k.split(',').map(Number)):[]}
function GB_top(i,j,list){let t=GB_.base[i+','+j];if(t==null)t=-1e9;for(const b of list){const[fw,fd]=GB_dims(b);if(i>=b.x&&i<b.x+fw&&j>=b.z&&j<b.z+fd)t=Math.max(t,b.y+GB_PC[b.t].h)}return t}
function GB_fit(b,list){const[fw,fd]=GB_dims(b);let y=-1e9,bmax=-1e9;for(let i=b.x;i<b.x+fw;i++)for(let j=b.z;j<b.z+fd;j++){if(i<GB_N0||i>GB_N1||j<GB_N0||j>GB_N1)return null;y=Math.max(y,GB_top(i,j,list))}
 if(y<-1e8)return null;for(const k in GB_.base)bmax=Math.max(bmax,GB_.base[k]);if(y+GB_PC[b.t].h>bmax+GB_CAP)return null;return y}
const GB_twin=b=>{const[fw]=GB_dims(b);return{...b,x:-b.x-fw,r:(4-b.r)%4,m:b.m?0:1}};
const GB_same=(a,b)=>a.t===b.t&&a.x===b.x&&a.z===b.z&&a.y===b.y;
const GB_list=()=>(GB.d.bricks=GB.d.bricks||[]);
function GB_snap(){GB_.undo.push(JSON.stringify(GB_list()));if(GB_.undo.length>80)GB_.undo.shift()}
function GB_add(t,x,z,r,c,noUndo){const L=GB_list(),P=GB_PC[t];if(!P)return 0;const b={t,x,z,y:0,r:r%4,m:0,c};const y=GB_fit(b,L);if(y==null)return 0;b.y=y;
 const add=[b];if(GB_.mir){const w=GB_twin(b),wy=GB_fit(w,L.concat([b]));if(wy!=null&&!(w.x===b.x)){w.y=wy;add.push(w)}}
 if(L.length+add.length>GB_MAX){if(L.length+1>GB_MAX){GB_msg('Brick budget full · '+GB_MAX);AU.sfx('bump');return 0}add.length=1}
 if(!noUndo)GB_snap();L.push(...add);return add.length}
function GB_hitBrick(b){const L=GB_list(),i=L.indexOf(b);if(i<0)return[];const out=[b];if(GB_.mir){const w=GB_twin(b),j=L.findIndex(o=>o!==b&&o.t===w.t&&o.x===w.x&&o.z===w.z&&o.y===w.y);if(j>=0)out.push(L[j])}return out}
function GB_del(b){const set=GB_hitBrick(b);if(!set.length)return 0;GB_snap();GB.d.bricks=GB_list().filter(o=>!set.includes(o));return set.length}
function GB_paint(b){const set=GB_hitBrick(b);if(!set.length)return 0;GB_snap();for(const o of set)o.c=GB_.col;return set.length}
function GB_undo(){if(!GB_.undo.length)return 0;GB.d.bricks=JSON.parse(GB_.undo.pop());GB_refresh();AU.sfx('pick');return 1}
// ---------- presets (built through the same snapping rules, so they sit on any chassis)
const GB_PRE=[['RACER',[['spoiler',-2,6,0,0],['exhaust',-2,5,0,10],['exhaust',1,5,0,10],['light',-1,-6,0,2],['b24',-4,0,0,11],['slope',-4,-2,0,0],['b12',-3,3,0,0],['tile',-1,1,0,9],['flag',-5,4,0,9]]],
 ['DOZER',[['b24',-3,-1,0,2],['b24',-5,-1,0,11],['b22',-3,3,0,2],['b24',-3,-1,0,11],['slope',-3,-3,0,2],['b22',-5,3,0,2],['b11',-6,1,0,0],['light',-6,-1,0,9],['exhaust',-1,4,0,10],['round',-4,5,0,11]]],
 ['PARADE',[['tile',-1,1,0,6],['tile',-1,3,0,6],['flag',-6,2,0,0],['flag',-4,5,0,2],['round',-3,1,0,9],['round',-3,2,0,8],['wedge',-6,4,0,6],['light',-2,-5,0,8],['b22',-5,0,0,9],['round',-5,0,0,6],['light',-1,5,0,5]]]];
function GB_preset(k){const P=GB_PRE[k];if(!P||!GB_.base)return 0;GB_snap();GB.d.bricks=[];const m=GB_.mir;GB_.mir=1;let n=0;for(const[t,x,z,r,c]of P[1]){let ok=0;for(let dz=0;dz<4&&!ok;dz++)for(const dx of[0,1,-1,2]){if(GB_add(t,x+dx,z+(dz%2?-1:1)*Math.ceil(dz/2),r,c,true)){ok=1;break}}n+=ok}GB_.mir=m;GB_refresh();return GB_list().length}
// ---------- builder scene
function GB_hullMeshes(){const U=GB.mesh.userData,out=[];(U.carG||U.m).traverse(o=>{if(o.isMesh&&!o.userData.gb&&!o.userData.gbG&&o.visible&&o.material&&!o.material.transparent&&!o.material.isShaderMaterial)out.push(o)});return out}
function GB_scanBase(){GB.mesh.updateMatrixWorld(true);const m=GB.mesh.userData.m,H=GB_hullMeshes(),rc=GB_.rc,B={};GB_.hull=H;
 for(let i=GB_N0;i<=GB_N1;i++)for(let j=GB_N0;j<=GB_N1;j++){const x=(i+.5)*GB_U,z=(j+.5)*GB_U;if(Math.abs(x)<.95&&z>-3.1&&z<-.2)continue;
  let best=null;for(const[ox,oz]of[[0,0],[-.2,-.2],[.2,.2],[-.2,.2],[.2,-.2]]){const o=m.localToWorld(V3(x+ox,30,z+oz));rc.set(o,V3(0,-1,0));const h=rc.intersectObjects(H,false)[0];if(h){const y=m.worldToLocal(h.point.clone()).y;best=best==null?y:Math.max(best,y)}}
  if(best!=null&&best>-.5)B[i+','+j]=Math.round(best/GB_PH)}
 GB_.base=B}
function GB_gridMesh(){const U=GB.mesh.userData,host=U.carG||U.m;if(GB_.grid){host.remove(GB_.grid);GB_.grid.geometry.dispose()}const A=[];for(const k in GB_.base){const[i,j]=k.split(',').map(Number);A.push(GB_cyl(.16,.07,(i+.5)*GB_U,GB_.base[k]*GB_PH,(j+.5)*GB_U,'#9fefff',8))}
 if(!A.length)return;GB_.grid=new THREE.Mesh(mergeGeometries(A),new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,opacity:.45,depthWrite:false}));GB_.grid.userData.gbG=1;host.add(GB_.grid)}
function GB_refresh(){if(!GB.mesh)return;GB_attach(GB.mesh,GB_list(),GB_figGet(),false);GB_ghostSet(null);GB_ui()}
function GB_ghostSet(b){const U=GB.mesh&&GB.mesh.userData;if(!U)return;const host=U.carG||U.m;if(GB_.ghost){host.remove(GB_.ghost);GB_.ghost.geometry.dispose();GB_.ghost=null}GB_.hov=b;if(!b)return;
 const M=[],L=[];GB_brickGeo(b,M,L);const g=mergeGeometries(M.concat(L).map(x=>x));GB_.ghost=new THREE.Mesh(g,new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,opacity:b.bad?.25:.55,depthWrite:false,color:b.bad?0xff4040:0xffffff}));GB_.ghost.userData.gbG=1;host.add(GB_.ghost)}
// pointer -> what is under it: a brick (index) or a chassis cell
function GB_pick(cx,cy){const cvs=$('#gbC'),r=cvs.getBoundingClientRect(),rc=GB_.rc;GB_cam();rc.setFromCamera(new THREE.Vector2((cx-r.left)/r.width*2-1,-((cy-r.top)/r.height)*2+1),GB.cam);
 const U=GB.mesh.userData,m=U.m,objs=(U.gbM||[]).concat(GB_.hull);const h=rc.intersectObjects(objs,false)[0];if(!h)return null;const p=m.worldToLocal(h.point.clone());let bi=-1;
 if(h.object.userData.gb&&h.object.geometry.userData.bid)bi=h.object.geometry.userData.bid[h.faceIndex];const n=h.face?h.face.normal.clone():V3(0,1,0);if(!h.object.userData.gb)n.transformDirection(h.object.matrixWorld).transformDirection(m.matrixWorld.clone().invert());
 const q=p.clone().addScaledVector(n,GB_U*.35);return{brick:bi>=0?GB_list()[bi]:null,i:Math.floor(q.x/GB_U),j:Math.floor(q.z/GB_U)}}
function GB_cand(hit){if(!hit)return null;const P=GB_PC[GB_.pc],r=GB_.rot,[fw,fd]=r%2?[P.d,P.w]:[P.w,P.d];const b={t:GB_.pc,x:hit.i-Math.floor((fw-1)/2),z:hit.j-Math.floor((fd-1)/2),y:0,r,m:0,c:GB_.col},y=GB_fit(b,GB_list());if(y==null)return null;b.y=y;b.bad=GB_list().length>=GB_MAX;return b}
function GB_act(cx,cy,del){const h=GB_pick(cx,cy);let n=0;if(del||GB_.tool==='del'){if(h&&h.brick)n=GB_del(h.brick);if(n)AU.sfx('bump')}else if(GB_.tool==='paint'){if(h&&h.brick)n=GB_paint(h.brick);if(n)AU.sfx('pick')}
 else{const b=GB_cand(h);if(b)n=GB_add(b.t,b.x,b.z,b.r,b.c);if(n)AU.sfx('brick')}if(n)GB_refresh();return n}
function GB_msg(t){const e=$('#gbBkN');if(!e)return;e.textContent=t;clearTimeout(GB_msg.t);GB_msg.t=setTimeout(GB_ui,1400)}
// ---------- UI
{const st=document.createElement('style');st.textContent=`#gbx .gbTabs{flex-wrap:wrap}#gbx .gbTabs button{min-width:56px}
#gbx.gbBk .gbw{width:100%;height:100%;grid-template-columns:1fr;grid-template-rows:100%;gap:0}#gbx.gbBk .gbv{border-radius:0;border:0;min-height:0}#gbx.gbBk #gbC{position:absolute;inset:0}#gbx.gbBk .gbp,#gbx.gbBk #gbStats,#gbx.gbBk .gbHint{display:none}
#gbBkT,#gbBkP{display:none}#gbx.gbBk #gbBkT{display:flex}#gbx.gbBk #gbBkP{display:grid}
#gbBkT{position:absolute;left:8px;right:8px;top:calc(8px + env(safe-area-inset-top,0px));flex-wrap:wrap;gap:6px;align-items:center;pointer-events:none}
#gbBkT>*{pointer-events:auto}#gbBkT button{height:36px;min-width:38px;padding:0 9px;border-radius:10px;border:1px solid rgba(76,234,255,.45);background:rgba(6,18,31,.9);color:#fff;font:800 11px system-ui;letter-spacing:.04em;cursor:pointer}
#gbBkT button.on{background:linear-gradient(90deg,#22c5e4,#8c55ff);color:#05030f}#gbBkT .gbDone{background:linear-gradient(90deg,#ffd12c,#ff7a1c);color:#141413;border:0}
#gbBkN{font:900 12px system-ui;color:#ffd12c;background:rgba(6,18,31,.9);border-radius:10px;padding:0 10px;height:36px;display:flex;align-items:center;white-space:nowrap}
#gbBkP{position:absolute;left:0;right:0;bottom:0;gap:6px;padding:10px 8px calc(8px + env(safe-area-inset-bottom,0px));background:linear-gradient(rgba(3,10,20,0),rgba(3,10,20,.94) 26%)}
.gbBkR{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;padding:2px}.gbBkR::-webkit-scrollbar{display:none}
.gbPc{flex:none;width:56px;height:50px;border-radius:10px;border:1px solid rgba(76,234,255,.35);background:rgba(6,18,31,.92);color:#fff;font:800 10px system-ui;display:grid;place-items:center;padding:2px;cursor:pointer;line-height:1.05}.gbPc i{font-style:normal;font-size:17px}
.gbPc.on{border-color:#5dffb0;box-shadow:0 0 10px rgba(93,255,176,.6)}.gbCl{flex:none;width:32px;height:32px;border-radius:50%;border:2px solid rgba(255,255,255,.3);background:var(--c);cursor:pointer}.gbCl.on{border-color:#fff;box-shadow:0 0 0 2px #22e4ff}
.gbFig{display:flex;gap:10px;align-items:center;margin:4px 0}.gbFig img{width:72px;height:72px;border-radius:14px;border:2px solid rgba(76,234,255,.45)}.gbFig p{margin:0;font-size:11px;color:#8fb3c7}
#m1Cs .tk .gbMe{flex:none;display:grid;justify-items:center;gap:1px;margin-left:auto}#m1Cs .tk .gbMe img{width:48px;height:48px;border-radius:12px;background:#222;border:2px solid #22e4ff}#m1Cs .tk .gbMe small{opacity:.8;font-size:9px}
@media (max-width:760px),(max-height:500px){#gbBkT button{height:34px;padding:0 7px;font-size:10px}#gbBkN{height:34px;font-size:11px}.gbPc{width:50px;height:44px}.gbPc i{font-size:15px}.gbCl{width:28px;height:28px}}`;document.head.appendChild(st)}
{const tabs=$('#gbx .gbTabs');for(const[t,n]of[['bricks','BRICKS'],['driver','DRIVER']]){const b=document.createElement('button');b.dataset.t=t;b.textContent=n;b.onclick=()=>{if(t==='bricks')return GB_enter();GB.tab=t;gbRender()};tabs.appendChild(b)}
 const v=$('#gbx .gbv'),T=document.createElement('div');T.id='gbBkT';T.innerHTML=`<span id="gbBkN"></span><button data-a="undo" title="Undo (Ctrl+Z)">↶</button><button data-a="rot" title="Rotate (R)">⟳</button><button data-a="mir" title="Symmetric mode (M)">⇋ MIRROR</button><button data-a="add" title="Place">✚</button><button data-a="paint" title="Recolour">🖌</button><button data-a="del" title="Delete (right-click)">🗑</button>${GB_PRE.map((p,i)=>`<button data-a="pre${i}">${p[0]}</button>`).join('')}<button data-a="clr">CLEAR</button><button data-a="done" class="gbDone">✔ DONE</button>`;
 const P=document.createElement('div');P.id='gbBkP';P.innerHTML=`<div class="gbBkR" id="gbBkPc">${Object.entries(GB_PC).map(([k,p])=>`<button class="gbPc" data-p="${k}"><i>${p.ic}</i>${p.n}</button>`).join('')}</div><div class="gbBkR" id="gbBkCl">${GB_BC.map((c,i)=>`<button class="gbCl" data-c="${i}" style="--c:${c}" title="colour ${i+1}"></button>`).join('')}</div>`;v.appendChild(T);v.appendChild(P);
 T.onclick=e=>{const b=e.target.closest('button');if(!b)return;const a=b.dataset.a;AU.sfx('pick');if(a==='undo')GB_undo();else if(a==='rot'){GB_.rot=(GB_.rot+1)%4;GB_hover()}else if(a==='mir')GB_.mir=GB_.mir?0:1;else if(a==='add'||a==='paint'||a==='del')GB_.tool=a;else if(a.startsWith('pre'))GB_preset(+a[3]);else if(a==='clr'){GB_snap();GB.d.bricks=[];GB_refresh()}else if(a==='done')GB_exit();GB_ui()};
 P.onclick=e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.p){GB_.pc=b.dataset.p;GB_.tool='add'}else if(b.dataset.c!=null){GB_.col=+b.dataset.c;if(GB_.tool==='del')GB_.tool='paint'}AU.sfx('pick');GB_ui();GB_hover()};
 // pointer: tap = act, drag = orbit, two fingers = orbit + pinch zoom, wheel = zoom, right click = delete
 const cvs=$('#gbC'),pt=e=>({x:e.clientX,y:e.clientY});
 v.addEventListener('pointerdown',e=>{if(!GB_.bk||e.target!==cvs)return;e.stopPropagation();cvs.setPointerCapture(e.pointerId);const p=pt(e);GB_.ptr.set(e.pointerId,{...p,x0:p.x,y0:p.y,t:performance.now(),b:e.button});if(GB_.ptr.size>1)GB_.multi=1;else GB_.multi=0;GB_.drag=0},true);
 v.addEventListener('pointermove',e=>{if(!GB_.bk||e.target!==cvs)return;e.stopPropagation();const q=GB_.ptr.get(e.pointerId),p=pt(e);
  if(!q){if(e.pointerType==='mouse'){GB_.mx=p;GB_hover()}return}
  if(GB_.ptr.size===1){if(Math.hypot(p.x-q.x0,p.y-q.y0)>8)GB_.drag=1;if(GB_.drag){GB_.yaw-=(p.x-q.x)*.01;GB_.pit=clamp(GB_.pit+(p.y-q.y)*.008,.12,1.4)}q.x=p.x;q.y=p.y;if(e.pointerType==='mouse'){GB_.mx=p;if(!GB_.drag)GB_hover()}return}
  const A=[...GB_.ptr.values()],d0=Math.hypot(A[0].x-A[1].x,A[0].y-A[1].y),mx0=(A[0].x+A[1].x)/2,my0=(A[0].y+A[1].y)/2;q.x=p.x;q.y=p.y;const d1=Math.hypot(A[0].x-A[1].x,A[0].y-A[1].y),mx1=(A[0].x+A[1].x)/2,my1=(A[0].y+A[1].y)/2;
  GB_.yaw-=(mx1-mx0)*.012;GB_.pit=clamp(GB_.pit+(my1-my0)*.01,.12,1.4);if(d0>10&&d1>10)GB_.dist=clamp(GB_.dist*d0/d1,7,26)},true);
 const up=e=>{if(!GB_.bk)return;const q=GB_.ptr.get(e.pointerId);if(!q)return;e.stopPropagation();GB_.ptr.delete(e.pointerId);if(e.type==='pointerup'&&!GB_.multi&&!GB_.drag&&performance.now()-q.t<900)GB_act(q.x0,q.y0,q.b===2);if(!GB_.ptr.size)GB_.multi=0};
 v.addEventListener('pointerup',up,true);v.addEventListener('pointercancel',up,true);v.addEventListener('wheel',e=>{if(!GB_.bk)return;e.preventDefault();GB_.dist=clamp(GB_.dist*(1+e.deltaY*.001),7,26)},{passive:false});
 v.addEventListener('contextmenu',e=>{if(GB_.bk)e.preventDefault()});
 addEventListener('keydown',e=>{if(!GB_.bk||$('#gbx').hidden)return;const k=e.code;if(k==='Escape'){e.preventDefault();e.stopImmediatePropagation();GB_exit();return}
  if(k==='KeyZ'&&(e.ctrlKey||e.metaKey))GB_undo();else if(k==='KeyR'){GB_.rot=(GB_.rot+1)%4;GB_hover()}else if(k==='KeyM')GB_.mir=GB_.mir?0:1;else if(k==='Delete'||k==='Backspace')GB_.tool=GB_.tool==='del'?'add':'del';else return;e.preventDefault();GB_ui()},true)}
function GB_hover(){if(!GB_.bk||!GB_.mx||GB_.tool!=='add')return GB_ghostSet(null);const b=GB_cand(GB_pick(GB_.mx.x,GB_.mx.y));const o=GB_.hov;if(o&&b&&GB_same(o,b)&&o.r===b.r&&o.c===b.c)return;GB_ghostSet(b)}
function GB_ui(){if(!GB.d)return;const L=GB_list(),md=GB_mods(L),fx=md?Object.entries(md).filter(([k,v])=>Math.abs(v-1)>.004).map(([k,v])=>`${{top:'top',acc:'acc',han:'grip',hull:'hull'}[k]} ${v>1?'+':''}${Math.round((v-1)*100)}%`).join(' · '):'';
 const n=$('#gbBkN');if(n)n.textContent=`🧱 ${L.length}/${GB_MAX}${fx?' · '+fx:''}`;document.querySelectorAll('#gbBkT button').forEach(b=>{const a=b.dataset.a;b.classList.toggle('on',a==='mir'?!!GB_.mir:a===GB_.tool)});
 document.querySelectorAll('#gbBkPc .gbPc').forEach(b=>b.classList.toggle('on',b.dataset.p===GB_.pc));document.querySelectorAll('#gbBkCl .gbCl').forEach(b=>b.classList.toggle('on',+b.dataset.c===GB_.col))}
function GB_enter(){if(!GB.mesh||!GB.d)return;GB.tab='bricks';document.querySelectorAll('#gbx .gbTabs button').forEach(b=>b.classList.toggle('on',b.dataset.t==='bricks'));GB_.bk=1;$('#gbx').classList.add('gbBk');GB_.undo=[];GB_.ptr.clear();
 GB_.yaw=GB.rot;GB_scanBase();GB_gridMesh();GB_refresh();GB_ui()}
function GB_exit(){if(!GB_.bk)return;GB_.bk=0;GB_ghostSet(null);if(GB_.grid&&GB.mesh){(GB.mesh.userData.carG||GB.mesh.userData.m).remove(GB_.grid);GB_.grid=null}$('#gbx').classList.remove('gbBk');GB.rot=GB_.yaw;GB.tab='parts';if(!$('#gbx').hidden)gbRender()}
function GB_cam(){const cvs=$('#gbC'),w=cvs.clientWidth,h=cvs.clientHeight;if(cvs.width!==Math.round(w*DPR2())||GB_.cw!==w+'x'+h){GB_.cw=w+'x'+h;GB.r.setPixelRatio(DPR2());GB.r.setSize(w,h,false);GB.cam.aspect=w/h;GB.cam.updateProjectionMatrix()}
 const d=GB_.dist*clamp(.95/GB.cam.aspect,1,2.2),ty=.5;GB.cam.position.set(Math.sin(GB_.yaw)*Math.cos(GB_.pit)*d,ty+Math.sin(GB_.pit)*d,Math.cos(GB_.yaw)*Math.cos(GB_.pit)*d);GB.cam.lookAt(0,ty,0);GB.cam.updateMatrixWorld()}
gbLoop=(f=>function(){if(!GB_.bk||$('#gbx').hidden)return f();GB_cam();if(!GB_.noDraw)GB.r.render(GB.sc,GB.cam);GB.raf=requestAnimationFrame(gbLoop)})(gbLoop);
gbRender=(f=>function(){f();if(GB.tab==='bricks'&&!GB_.bk)GB.tab='parts';if(GB_.stand){GB.sc.remove(GB_.stand);GB_.stand=null}document.querySelectorAll('#gbx .gbTabs button').forEach(b=>b.classList.toggle('on',b.dataset.t===GB.tab));if(GB.tab!=='driver')return;
 const fig=GB_figGet(),M=[],L=[];GB_figGeo(fig,M,L,false);GB_.stand=new THREE.Group();GB_.stand.add(new THREE.Mesh(mergeGeometries(M),GB_MAT));if(L.length)GB_.stand.add(new THREE.Mesh(mergeGeometries(L),GB_LMAT));GB_.stand.scale.setScalar(2.6);GB_.stand.position.set(5.2,-.25,3.2);GB_.stand.rotation.y=.5;GB.sc.add(GB_.stand);
 let h=`<div class="gbFig"><img id="gbFigImg" src="${GB_portrait(fig)}"><p>Your driver rides in the cockpit and appears in story scenes. Locked parts unlock through the story and Brick Packs.</p></div>`;
 for(const cat in GB_FIG){h+=`<h5>${GB_FCAT[cat]}</h5><div class="gbRow">`;for(const[id,nm,req]of GB_FIG[cat]){const ok=gbReq(req,'fig_'+id),sw=cat==='l'||cat==='c';h+=`<button class="gbP ${fig[cat]===id?'on':''}" ${ok?'':'disabled'} data-fc="${cat}" data-fv="${id}">${sw?`<b><span style="display:inline-block;width:10px;height:10px;border-radius:3px;background:${id};margin-right:5px"></span>${ok?'':'🔒 '}${nm}</b>`:`<b>${ok?'':'🔒 '}${nm}</b>`}${ok?'':`<small>${gbReqTxt(req)}</small>`}</button>`}h+='</div>'}
 const B=$('#gbBody');B.innerHTML=h;B.querySelectorAll('button[data-fc]').forEach(b=>b.onclick=()=>{const F=GB_figGet();if(!GB_figOk(b.dataset.fc,b.dataset.fv))return;F[b.dataset.fc]=b.dataset.fv;store.set('mho_gbfig',F);AU.sfx('pick');const sc=B.scrollTop;gbRender();$('#gbBody').scrollTop=sc})})(gbRender);
gbClose=(f=>function(save){if(GB_.bk){GB_.bk=0;GB_ghostSet(null);$('#gbx').classList.remove('gbBk');GB.tab='parts'}if(GB_.stand&&GB.sc){GB.sc.remove(GB_.stand);GB_.stand=null}return f(save)})(gbClose);
// garage stays blocked while an event / race-in-the-city runs (BF2 hides the pause button; this also covers every other entry point)
gbOpen=(f=>function(){if(state==='roam'&&(RO.ch||RO.sp)){try{say('GARAGE CLOSED','FINISH THE EVENT FIRST')}catch(e){}AU.sfx('bump');return}return f()})(gbOpen);
roamPauseOpen=(f=>function(){f();const b=document.querySelector('#roamPause [data-p="garage"]');if(b)b.hidden=!!(RO.ch||RO.sp)})(roamPauseOpen);{const e=$('#roamExit');if(e)e.onclick=()=>roamPauseOpen()}
// cutscenes: the player's minifig portrait listens in on every line
M1_csNext=(f=>function(){f();const tk=document.querySelector('#m1Cs .tk');if(!tk||!M1.cs)return;let me=tk.querySelector('.gbMe');if(!me){me=document.createElement('div');me.className='gbMe';me.innerHTML='<img alt=""><small>YOU</small>';tk.appendChild(me)}me.querySelector('img').src=GB_portrait()})(M1_csNext);
M1_av=(f=>function(w){return w==='YOU'?GB_portrait():f(w)})(M1_av);M1_WHO.YOU={n:'You',col:'#22e4ff',em:'🧑'};
window.__gb={GB_,d:()=>GB.d,render:()=>gbRender(),PC:GB_PC,FIG:GB_FIG,enter:()=>GB_enter(),exit:()=>GB_exit(),list:()=>GB.d?GB_list():null,cells:GB_cells,undo:GB_undo,preset:GB_preset,add:GB_add,mods:GB_mods,fig:GB_figGet,portrait:()=>GB_portrait(),
 scene:()=>M1_scene({lines:[['HILDE','Nice driver. Now show me that car.'],['YOU','Ready when you are.']]}),
 // screen point of the top of chassis cell (i,j) at the current stack height (for real-input tests)
 scr:(i,j)=>{const t=GB_top(i,j,GB_list());if(t<-1e8)return null;const m=GB.mesh.userData.m;GB.mesh.updateMatrixWorld(true);GB_cam();const p=m.localToWorld(V3((i+.5)*GB_U,t*GB_PH+.02,(j+.5)*GB_U)).project(GB.cam),r=$('#gbC').getBoundingClientRect();return{x:r.left+(p.x+1)/2*r.width,y:r.top+(1-p.y)/2*r.height}},
 calls:()=>{const o=pl&&pl.mesh;if(!o)return null;let n=0,list=[];o.traverse(x=>{if(x.userData&&x.userData.gb){list.push(x);if(x.visible)n++}});return{n,tris:list.map(x=>x.geometry.attributes.position.count/3)}}};
