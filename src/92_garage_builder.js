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
 const s=sit?1.5*(SC_S&&SC_S.drv?SC_K.drv:1):1,tf=g=>{g.scale(s,s,s);if(sit)g.translate(0,.74-.42*s,-1.55)};for(const g of P){tf(g);M.push(g)}for(const g of Q){tf(g);L.push(g)}}
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
const GB_MAT=new THREE.MeshPhysicalMaterial({vertexColors:true,roughness:.3,metalness:0,clearcoat:.8,clearcoatRoughness:.1,envMapIntensity:1.3});GB_MAT.onBeforeCompile=s=>{s.fragmentShader=s.fragmentShader.replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\ntotalEmissiveRadiance+=diffuseColor.rgb*.16;')};
const GB_LMAT=new THREE.MeshBasicMaterial({vertexColors:true,toneMapped:false});
function GB_geo(bricks,fig){const M=[],L=[],tri=[],ltri=[];for(let i=0;i<(bricks||[]).length;i++){const m0=M.length,l0=L.length;GB_brickGeo(bricks[i],M,L);for(let k=m0;k<M.length;k++)tri.push([i,M[k].attributes.position.count/3]);for(let k=l0;k<L.length;k++)ltri.push([i,L[k].attributes.position.count/3])}
 if(fig)GB_figGeo(fig,M,L,true);const mk=(A,T)=>{if(!A.length)return null;const g=mergeGeometries(A);const id=new Int16Array(g.attributes.position.count/3).fill(-1);let o=0;for(const[i,n]of T){id.fill(i,o,o+n);o+=n}g.userData.bid=id;return g};
 return{m:mk(M,tri),l:mk(L,ltri)}}
function GB_plate(){const M=[],u=GB_U,P='#3b4452';M.push(GB_box(-4*u,4*u,-.2,0,-6*u,6*u,P));M.push(GB_box(-4*u+.05,4*u-.05,-.05,.0,-6*u+.05,-6*u+.12,'#ffd12c'));
 for(const sx of[-1,1])for(const sz of[-1,1]){const w=GB_cyl(.44,.34,0,-.17,0,'#15181d',14);w.rotateZ(Math.PI/2);w.translate(sx*(4*u+.08),-.12,sz*2.5);M.push(w);const h=GB_cyl(.2,.4,0,-.2,0,'#c9ced6',10);h.rotateZ(Math.PI/2);h.translate(sx*(4*u+.1),-.12,sz*2.5);M.push(h)}return mergeGeometries(M)}
function GB_attach(g,bricks,fig,cache,bp){const U=g.userData,host=U.carG||U.m;for(const o of U.gbM||[]){host.remove(o);if(!o.userData.gbc)o.geometry.dispose()}U.gbM=[];for(const o of U.gbHid||[])o.visible=true;U.gbHid=[];
 if(bp)host.traverse(o=>{if((o.isMesh||o.isSprite)&&o.visible&&!o.userData.gb&&!o.userData.gbG){o.visible=false;U.gbHid.push(o)}});
 if(bp&&!(bricks||[]).some(CR_isW)){const o=new THREE.Mesh(GB_plate(),GB_MAT);o.userData.gb=1;host.add(o);U.gbM.push(o)}
 if(!(bricks&&bricks.length)&&!fig)return;
 const key=JSON.stringify([bricks,fig]);let G=cache&&GB_.gc.get(key);if(!G){G=GB_geo(bricks,fig);if(cache){GB_.gc.set(key,G);if(GB_.gc.size>4)GB_.gc.delete(GB_.gc.keys().next().value)}}
 if(G.m){const o=new THREE.Mesh(G.m,GB_MAT);o.userData.gb=1;o.userData.gbc=!!cache;host.add(o);U.gbM.push(o)}if(G.l){const o=new THREE.Mesh(G.l,GB_LMAT);o.userData.gb=1;o.userData.gbc=!!cache;host.add(o);U.gbM.push(o)}
 if(G.g){const o=new THREE.Mesh(G.g,CR_GM);o.renderOrder=2;o.userData.gb=1;o.userData.gbc=!!cache;host.add(o);U.gbM.push(o)}
 for(const w of G.w||[]){const o=new THREE.Mesh(CR_wheel(w.t),GB_MAT);o.position.copy(w.o);o.userData.gb=1;o.userData.gbc=1;o.userData.r=CR_WH[w.t].r;CR_spin(o);host.add(o);U.gbM.push(o)}}
// ---------- handling modifiers: small and clamped (never more than -5 % / +6 % per stat)
function GB_mods(bricks){const n=(bricks||[]).length,w=n/GB_MAX,cnt=t=>bricks.filter(b=>b.t===t).length,o={top:1-.012*w,acc:1-.03*w,han:1,hull:1+.06*w};if(!n)return null;
 const s=Math.min(2,cnt('spoiler')),e=Math.min(3,cnt('exhaust'));o.han*=1+s*.02;o.top*=1-s*.005;o.acc*=1+e*.012;for(const k in o)o[k]=clamp(o[k],.95,1.06);return o}
gbTeam=(f=>function(base,b){let t=f(base,b);const br=b&&b.on&&b.bricks&&b.bricks.length?b.bricks:null;if(t===base)t=Object.assign({},base);const md=GB_mods(br);if(md)for(const k in md)t[k]=(t[k]||1)*md[k];t.gbB=br;t.gbP=!!(b&&b.on&&b.bp);if(!br&&!(b&&b.on)){t.gbB=CR_DEF();t.gbP=true}t.gbF=GB_figGet();return t})(gbTeam);
shipMesh=(f=>function(team){const g=f(team);if(team&&(team.gbB||team.gbF))try{GB_attach(g,team.gbB,team.gbF,true,team.gbP);if(team.gbP)CR_attachV(g)}catch(e){console.warn('GB',e)}else if(team&&!team.gbB){const rb=CR_rivB(team);if(rb)try{GB_attach(g,rb,null,true,true);CR_attachV(g,team)}catch(e){console.warn('GB',e)}}return g})(shipMesh);
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
