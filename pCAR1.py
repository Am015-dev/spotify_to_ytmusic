# CAR1: LEGO part library + Speed-Champions-style SPEEDSTER (supersedes pLG1; apply onto v85 instead of pLG1).
# New parts (curved slopes, inverted slope, wedge plates, mudguard arch, glass windscreens, head/tail-light bricks, grille, round plate,
# jumper, spoiler, steering wheel, seated helmet driver, wheels S/M/L that spin), bevelled glossy ABS look; the default player car is SPEEDSTER.
exec(open('P.py').read())
if 'CR_SPEED' in s:
    print('OK');raise SystemExit
CAR=r'''// ---------- CAR1: LEGO-proportioned part library (1 stud = GB_U, 1 plate = GB_PH), bevelled glossy parts, glass, spinning wheels, Speed-Champions-style preset
let CR_G=null,CR_W=null;const CR_E=.022,CR_K='#1b2a34',CR_DG='#3a4048';
const CR_bb=(x0,x1,y0,y1,z0,z1,c,e=CR_E)=>{e=Math.min(e,(x1-x0)/3,(y1-y0)/3,(z1-z0)/3);const sh=new THREE.Shape();sh.moveTo(x0+e,y0+e);sh.lineTo(x1-e,y0+e);sh.lineTo(x1-e,y1-e);sh.lineTo(x0+e,y1-e);sh.closePath();
 const g=new THREE.ExtrudeGeometry(sh,{depth:z1-z0-2*e,bevelEnabled:true,bevelThickness:e,bevelSize:e,bevelSegments:1,curveSegments:1});g.translate(0,0,z0+e);return GB_col(g,c)};
// side profile [z,y] (or ['q',cz,cy,z,y] quadratic) extruded across x0..x1
function CR_side(P,x0,x1,c,e=CR_E){const sh=new THREE.Shape();let f=1;for(const p of P){if(p[0]==='q'){sh.quadraticCurveTo(-p[1],p[2],-p[3],p[4])}else if(f){sh.moveTo(-p[0],p[1]);f=0}else sh.lineTo(-p[0],p[1])}sh.closePath();
 const g=new THREE.ExtrudeGeometry(sh,{depth:x1-x0-2*e,bevelEnabled:e>0,bevelThickness:e,bevelSize:e*.8,bevelSegments:1,curveSegments:8});g.rotateY(Math.PI/2);g.translate(x0+e,0,0);return GB_col(g,c)}
// top outline [x,z] extruded y0..y1
function CR_top(P,y0,y1,c,e=CR_E){const sh=new THREE.Shape();P.forEach((p,i)=>i?sh.lineTo(p[0],p[1]):sh.moveTo(p[0],p[1]));sh.closePath();
 const g=new THREE.ExtrudeGeometry(sh,{depth:y1-y0-2*e,bevelEnabled:true,bevelThickness:e,bevelSize:e*.8,bevelSegments:1,curveSegments:1});g.rotateX(Math.PI/2);g.translate(0,y1-e,0);return GB_col(g,c)}
const CR_stud=(M,x,y,z,c)=>{M.push(GB_cyl(.18,.11,x,y,z,c,12));M.push(GB_cyl(.15,.02,x,y+.11,z,c,12))};
const CR_studs=(M,w,d,y,c,ok)=>{for(let i=0;i<w;i++)for(let j=0;j<d;j++){const x=(i+.5-w/2)*GB_U,z=(j+.5-d/2)*GB_U;if(!ok||ok(x,z))CR_stud(M,x,y,z,c)}};
const CR_WH={wS:{r:.62,w:.6,rim:.36},wM:{r:.76,w:.72,rim:.46},wL:{r:.9,w:.9,rim:.56}};
const CR_wgeo={};
function CR_wheel(t){if(CR_wgeo[t])return CR_wgeo[t];const W=CR_WH[t],r=W.r,hw=W.w/2,ri=W.rim,A=[];
 // tyre: lathe around x (rounded shoulders, slightly bulged tread)
 const tp=[[ri*.98,-hw*.92],[r*.9,-hw],[r*.985,-hw*.82],[r,-hw*.5],[r,hw*.5],[r*.985,hw*.82],[r*.9,hw],[ri*.98,hw*.92]].map(p=>new THREE.Vector2(p[0],p[1]));
 const ty=new THREE.LatheGeometry(tp,28);ty.rotateZ(Math.PI/2);A.push(GB_col(ty,'#17191c'));
 // tread grooves
 for(let i=0;i<14;i++){const g=new THREE.BoxGeometry(W.w*.7,.025,.07);g.translate(0,r+.004,0);g.rotateX(i/14*Math.PI*2);A.push(GB_col(g,'#0d0e10'))}
 // rim (silver), dark recess, 5-spoke look and hub, both faces
 const rim=new THREE.CylinderGeometry(ri,ri,W.w*.86,24);rim.rotateZ(Math.PI/2);A.push(GB_col(rim,'#a9b0b8'));
 for(const sx of[-1,1]){const d=new THREE.CylinderGeometry(ri*.8,ri*.8,.02,24);d.rotateZ(Math.PI/2);d.translate(sx*W.w*.435,0,0);A.push(GB_col(d,'#2a2f36'));
  for(let k=0;k<5;k++){const sp=new THREE.BoxGeometry(.03,ri*.72,ri*.2);sp.translate(sx*W.w*.445,ri*.38,0);sp.rotateX(k/5*Math.PI*2);A.push(GB_col(sp,'#c9ced6'))}
  const h=new THREE.CylinderGeometry(ri*.28,ri*.32,.05,14);h.rotateZ(Math.PI/2);h.translate(sx*W.w*.45,0,0);A.push(GB_col(h,'#dfe3e8'))}
 return CR_wgeo[t]=mergeGeometries(A)}
// dynamic sized plates/bricks/tiles/curved: 'P2x6','B1x4','T4x4','C8x1'
function CR_reg(t){if(GB_PC[t])return 1;const m=/^([PBTC])(\d+)x(\d+)$/.exec(t);if(!m)return 0;const h={P:1,B:3,T:1,C:2}[m[1]];GB_PC[t]={n:t,w:+m[2],d:+m[3],h,s:m[1]!=='T'&&m[1]!=='C',hide:1,ic:'▭'};return 1}
Object.assign(GB_PC,{
 p12:{n:'Plate 1×2',w:1,d:2,h:1,ic:'▬'},p24:{n:'Plate 2×4',w:2,d:4,h:1,ic:'▬'},t22:{n:'Tile 2×2',w:2,d:2,h:1,ic:'□'},
 cs12:{n:'Curve 1×2',w:1,d:2,h:2,ic:'◠'},cs22:{n:'Curve 2×2',w:2,d:2,h:2,ic:'◠'},cs14:{n:'Curve 1×4',w:1,d:4,h:3,ic:'◠'},
 inv:{n:'Inv. slope',w:2,d:1,h:3,ic:'◥'},wl:{n:'Wedge L',w:2,d:4,h:1,ic:'◸'},wr:{n:'Wedge R',w:2,d:4,h:1,ic:'◹'},
 arch:{n:'Mudguard',w:2,d:4,h:6,ic:'⌒'},ws4:{n:'Screen 2×4',w:4,d:2,h:4,ic:'◪'},ws6:{n:'Screen 3×6',w:6,d:3,h:5,ic:'◪'},
 hl:{n:'Headlight',w:1,d:1,h:3,ic:'◐'},tl:{n:'Taillight',w:1,d:1,h:3,ic:'◑'},grl:{n:'Grille',w:1,d:2,h:1,ic:'▤'},rp:{n:'Round 1×1',w:1,d:1,h:1,ic:'•'},
 jmp:{n:'Jumper',w:1,d:2,h:1,ic:'⊡'},stw:{n:'Wheel (steer)',w:2,d:1,h:2,ic:'⊙'},drv:{n:'Driver',w:2,d:2,h:9,ic:'🧑'},
 wS:{n:'Wheel S',w:1,d:4,h:5,ic:'◎'},wM:{n:'Wheel M',w:1,d:4,h:6,ic:'◎'},wL:{n:'Wheel L',w:1,d:4,h:8,ic:'◎'}});
GB_PC.spoiler.w=6;GB_PC.spoiler.d=2;GB_PC.spoiler.h=4;
GB_piece=(f=>function(t,c,M,L){CR_reg(t);const P=GB_PC[t];if(!P)return;const W=P.w*GB_U,D=P.d*GB_U,H=P.h*GB_PH,g=.008,col=GB_BC[c]||c,x0=-W/2+g,x1=W/2-g,z0=-D/2+g,z1=D/2-g,GL=CR_G||M;
 const k=t[0],big=/^[PBTC]\d/.test(t);
 if(big&&k==='C'){M.push(CR_side([[z1,0],[z1,H],[z1-Math.min(.12,D*.15),H],['q',z0+D*.18,H,z0,H*.28],[z0,0]],x0,x1,col))}
 else if(big||['b11','b12','b22','b24','p12','p24','tile','t22'].includes(t)){M.push(CR_bb(x0,x1,0,H,z0,z1,col));if(k!=='T'&&t!=='tile'&&t!=='t22')CR_studs(M,P.w,P.d,H,col)}
 else if(t==='cs12'||t==='cs22'||t==='cs14')M.push(CR_side([[z1,0],[z1,H],[z1-Math.min(.12,D*.12),H],['q',z0+D*.2,H,z0,H*.25],[z0,0]],x0,x1,col));
 else if(t==='inv'){M.push(CR_side([[z0,H],[z1,H],[z1,0],[z1-.06,0],[z0,H*.62]],x0,x1,col))}
 else if(t==='wl'||t==='wr'){const s=t==='wr'?1:-1,Q=[[-W/2,D/2],[W/2,D/2],[W/2,0],[-W/2+.3,-D/2],[-W/2,-D/2]].map(p=>[p[0]*s,p[1]]);if(s<0)Q.reverse();M.push(CR_top(Q,0,H,col));
  CR_studs(M,P.w,P.d,H,col,(x,z)=>z>0||(s>0?x<0:x>0))}
 else if(t==='arch'){const R=.98,cy=.12,cx=Math.sqrt(R*R-cy*cy),N=18,a=Math.asin(cy/R),pts=[[z0,0],[-cx,0]];for(let i=1;i<N;i++){const th=Math.PI+a-(Math.PI+2*a)*i/N;pts.push([Math.cos(th)*R,cy+Math.sin(th)*R])}
  pts.push([cx,0],[z1,0],[z1,H],[z0,H]);M.push(CR_side(pts,x0,x1,col))}
 else if(t==='ws4'||t==='ws6'){const sh=[[z0,0],['q',z0+D*.55,H*.98,z1,H],[z1,0]];GL.push(CR_side(sh,x0,x1,'#4a6a82',.03));M.push(CR_bb(x0,x1,0,PH_(1)*.5,z0,z1,CR_K))}
 else if(t==='hl'||t==='tl'){M.push(CR_bb(x0,x1,0,H,z0,z1,col));CR_studs(M,1,1,H,col);const lc=t==='hl'?'#fff4cf':'#ff2a1a',d=new THREE.CircleGeometry(.2,16);d.rotateY(Math.PI);d.translate(0,H*.5,z0-.006);L.push(GB_col(d,lc,t==='hl'?2.4:2.2));
  const ring=new THREE.RingGeometry(.2,.25,16);ring.rotateY(Math.PI);ring.translate(0,H*.5,z0-.004);M.push(GB_col(ring,'#c9ced6'))}
 else if(t==='grl'){M.push(CR_bb(x0,x1,0,H,z0,z1,col));for(let i=0;i<5;i++){const z=z0+.1+i*(D-.2)/4;M.push(GB_box(x0+.06,x1-.06,H-.01,H+.004,z-.025,z+.025,'#0d0e10'))}}
 else if(t==='rp'){M.push(GB_cyl(.29,H,0,0,0,col,16));CR_stud(M,0,H,0,col)}
 else if(t==='jmp'){M.push(CR_bb(x0,x1,0,H,z0,z1,col));CR_stud(M,0,H,0,col)}
 else if(t==='stw'){const cb=CR_bb(-.12,.12,0,.32,-.1,.1,CR_K);cb.rotateX(-.5);M.push(cb);const r=new THREE.TorusGeometry(.17,.035,6,16);r.rotateX(-.9);r.translate(0,.42,.06);M.push(GB_col(r,'#202428'))}
 else if(t==='spoiler'){for(const sx of[-1,1]){M.push(CR_bb(sx*W*.3-.08,sx*W*.3+.08,0,H*.75,-.12,.12,CR_K));M.push(CR_bb(sx*W/2-(sx>0?.07:0)-(sx<0?0:0),sx*W/2+(sx<0?.07:0),H*.5,H*1.02,z0+.05,z1-.05,col))}
  const w=CR_side([[z1,H*.88],[z1,H],['q',0,H*1.05,z0,H*.8],[z0,H*.7]],x0+.07,x1-.07,col);M.push(w)}
 else if(CR_WH[t]){if(CR_W)CR_W.push({t,o:new THREE.Vector3(0,H/2,0)});else{const w=CR_wheel(t).clone();w.translate(0,H/2,0);M.push(w)}}
 else if(t==='drv'){const fg=GB_figGet(),tm=[],tl=[];GB_figGeo(fg,tm,tl,true);const s=1.5*(typeof SC_S!=='undefined'&&SC_S&&SC_S.drv?SC_K.drv:1),k=1.95;
  for(const[A,B]of[[tm,M],[tl,L]])for(const g2 of A){g2.translate(0,-(.74-.42*s),1.55);g2.scale(k/s,k/s,k/s);g2.translate(0,.1,.25);B.push(g2)}
  M.push(CR_bb(-W/2+.15,W/2-.15,0,.25,-D/2+.1,D/2-.1,CR_K));M.push(CR_bb(-W/2+.2,W/2-.2,.25,1.6,D/2-.32,D/2-.08,CR_K))}
 else f(t,c,M,L)})(GB_piece);
function PH_(n){return n*GB_PH}
// brick placement: wheels to CR_W, glass to CR_G follow the same transform
GB_brickGeo=(f=>function(b,M,L){CR_reg(b.t);const g0=CR_G?CR_G.length:0,w0=CR_W?CR_W.length:0;f(b,M,L);const[fw,fd]=GB_dims(b),cx=(b.x+fw/2)*GB_U,cz=(b.z+fd/2)*GB_U;
 if(CR_G)for(let i=g0;i<CR_G.length;i++){if(b.m)GB_mirX(CR_G[i]);CR_G[i].rotateY(b.r*Math.PI/2);CR_G[i].translate(cx,b.y*GB_PH,cz)}
 if(CR_W)for(let i=w0;i<CR_W.length;i++){const w=CR_W[i];w.o.applyAxisAngle(V3(0,1,0),b.r*Math.PI/2);w.o.add(V3(cx,b.y*GB_PH,cz));w.r=b.r}})(GB_brickGeo);
GB_geo=(f=>function(bricks,fig){const hasD=(bricks||[]).some(b=>b.t==='drv');CR_G=[];CR_W=[];let G;try{G=f(bricks,hasD?null:fig)}finally{G=G||{};G.g=CR_G.length?mergeGeometries(CR_G):null;G.w=CR_W;CR_G=null;CR_W=null}return G})(GB_geo);
const CR_GM=new THREE.MeshPhysicalMaterial({vertexColors:true,transparent:true,opacity:.62,roughness:.04,metalness:.15,clearcoat:1,clearcoatRoughness:.03,envMapIntensity:2.2,depthWrite:false});
function CR_spin(o){const p=V3();o.onBeforeRender=function(){this.getWorldPosition(p);const l=this.userData.lp;if(l){const e=this.matrixWorld.elements,fx=-e[8],fy=-e[9],fz=-e[10],n=Math.hypot(fx,fy,fz)||1,d=((p.x-l.x)*fx+(p.y-l.y)*fy+(p.z-l.z)*fz)/n;
 if(Math.abs(d)<5){const s=Math.hypot(e[0],e[1],e[2])||1;this.rotation.x-=d/(this.userData.r*s)}}else this.userData.lp=V3();this.userData.lp.copy(p)}}
const CR_isW=b=>!!CR_WH[b.t];
// ---------- Speed-Champions-style car (8 wide, 16 long, front = -z); entries [t,x,z,r,c,y]
function CR_car(o){const A=[],B=o.body,K=CR_K,S=o.acc||B,add=(t,x,z,r,c,y)=>A.push([t,x,z,r,c,y]),
 sym=(t,x,z,r,c,y)=>{CR_reg(t);const fw=(r%2?GB_PC[t].d:GB_PC[t].w);add(t,x,z,r,c,y);if(x!==-x-fw)add(t,-x-fw,z,(4-r)%4,c,y)},wy=(.12-CR_WH[o.wh||'wL'].r)/GB_PH;
 add('T6x16',-3,-8,0,K,0);sym('T1x6',-4,-3,0,K,0);sym('T1x1',-4,-8,0,K,0);sym('T1x1',-4,7,0,K,0);
 for(const z of[-7,3]){sym('arch',-4,z,0,B,0);sym(o.wh||'wL',-4,z,0,K,wy)}
 // nose: headlights, dark grille, curved hood lip
 sym('hl',-4,-8,0,B,1);sym('B1x1',-3,-8,0,B,1);add('B4x1',-2,-8,0,K,1);add('C8x1',-4,-8,0,B,4);
 add('T4x4',-2,-7,0,K,3);add('T4x4',-2,-7,0,B,4);sym('T1x4',-2,-7,0,B,5);add('T2x4',-1,-7,0,S,5);
 // doors with side stripe
 sym('B1x6',-4,-3,0,B,1);sym('T1x6',-4,-3,0,S,4);sym('T1x6',-4,-3,0,B,5);
 // cabin floor, seat, driver, steering wheel, glass canopy + roof
 add('T6x6',-3,-3,0,K,1);add('drv',-1,-1,0,B,2);add('stw',-1,-2,0,K,5);
 add('ws6',-3,-3,0,B,6);add('ws6',-3,0,2,B,6);add('T6x2',-3,-1,0,B,11);add('T2x2',-1,-1,0,S,12);
 // rear deck, spoiler, tail
 add('T4x4',-2,3,0,K,3);add('T4x4',-2,3,0,B,4);sym('T1x4',-2,3,0,B,5);add('T2x4',-1,3,0,S,5);
 sym('tl',-4,7,2,B,1);sym('B1x1',-3,7,0,B,1);add('B4x1',-2,7,0,K,1);add('C8x1',-4,7,2,B,4);
 add('spoiler',-3,5,0,o.wing||K,6);
 return A}
const CR_SPEED=CR_car({body:'#d01712',acc:'#f4f4f4',wing:CR_K,wh:'wL'});
'''
# preset also switches to the baseplate; cell lookups fall back harmlessly
R("function GB_preset(k){const P=GB_PRE[k];if(!P||!GB_.base)return 0;GB_snap();GB.d.bricks=[];",
  "function GB_preset(k){const P=GB_PRE[k];if(!P||!GB_.base)return 0;GB_snap();GB.d.bricks=[];if(!GB.d.bp){GB.d.bp=1;GB_scanBase();GB_gridMesh()}")
# baseplate base grid
R("function GB_scanBase(){GB.mesh.updateMatrixWorld(true);",
  "function GB_scanBase(){GB.mesh.updateMatrixWorld(true);if(GB.d.bp){GB_.hull=[];const B={};for(let i=-4;i<=3;i++)for(let j=-6;j<=5;j++)B[i+','+j]=0;GB_.base=B;return}")
# attach: hide hull + draw plate
R("function GB_attach(g,bricks,fig,cache){const U=g.userData,host=U.carG||U.m;for(const o of U.gbM||[]){host.remove(o);if(!o.userData.gbc)o.geometry.dispose()}U.gbM=[];if(!(bricks&&bricks.length)&&!fig)return;\n const key=JSON.stringify([bricks,fig]);",
  """function GB_plate(){const M=[],u=GB_U,P='#3b4452';M.push(GB_box(-4*u,4*u,-.2,0,-6*u,6*u,P));M.push(GB_box(-4*u+.05,4*u-.05,-.05,.0,-6*u+.05,-6*u+.12,'#ffd12c'));
 for(const sx of[-1,1])for(const sz of[-1,1]){const w=GB_cyl(.44,.34,0,-.17,0,'#15181d',14);w.rotateZ(Math.PI/2);w.translate(sx*(4*u+.08),-.12,sz*2.5);M.push(w);const h=GB_cyl(.2,.4,0,-.2,0,'#c9ced6',10);h.rotateZ(Math.PI/2);h.translate(sx*(4*u+.1),-.12,sz*2.5);M.push(h)}return mergeGeometries(M)}
function GB_attach(g,bricks,fig,cache,bp){const U=g.userData,host=U.carG||U.m;for(const o of U.gbM||[]){host.remove(o);if(!o.userData.gbc)o.geometry.dispose()}U.gbM=[];for(const o of U.gbHid||[])o.visible=true;U.gbHid=[];
 if(bp)host.traverse(o=>{if((o.isMesh||o.isSprite)&&o.visible&&!o.userData.gb&&!o.userData.gbG){o.visible=false;U.gbHid.push(o)}});
 if(bp){const o=new THREE.Mesh(GB_plate(),GB_MAT);o.userData.gb=1;host.add(o);U.gbM.push(o)}
 if(!(bricks&&bricks.length)&&!fig)return;
 const key=JSON.stringify([bricks,fig]);""")
R("GB_attach(g,team.gbB,team.gbF,true)","GB_attach(g,team.gbB,team.gbF,true,team.gbP)")
R("t.gbB=br;","t.gbB=br;t.gbP=!!(b&&b.on&&b.bp);")
R("GB_attach(GB.mesh,GB_list(),GB_figGet(),false);","GB_attach(GB.mesh,GB_list(),GB_figGet(),false,!!GB.d.bp);")
# new designs start blank on the baseplate
R("GB_.yaw=GB.rot;GB_scanBase();","if(GB.d.bp==null&&!GB_list().length)GB.d.bp=1;GB_.yaw=GB.rot;GB_scanBase();")
# toolbar: presets in a 12 px side column, CHASSIS toggle
R("${GB_PRE.map((p,i)=>`<button data-a=\"pre${i}\">${p[0]}</button>`).join('')}<button data-a=\"clr\">CLEAR</button>",
  "<button data-a=\"bp\" title=\"Blank baseplate or jet chassis\">⬛ BASE</button><button data-a=\"clr\">CLEAR</button><div id=\"gbBkS\">${GB_PRE.map((p,i)=>`<button data-a=\"pre${i}\">${p[0]}</button>`).join('')}</div>")
R("else if(a==='clr'){GB_snap();GB.d.bricks=[];GB_refresh()}",
  "else if(a==='clr'){GB_snap();GB.d.bricks=[];GB_refresh()}else if(a==='bp'){GB_snap();GB.d.bricks=[];GB.d.bp=GB.d.bp?0:1;GB_scanBase();GB_gridMesh();GB_refresh()}")
R("#gbBkT>*{pointer-events:auto}",
  "#gbBkT>*{pointer-events:auto}#gbBkS{position:fixed;right:8px;top:calc(96px + env(safe-area-inset-top,0px));display:grid;grid-template-columns:auto auto;gap:5px}#gbBkS button{height:30px!important;padding:0 8px!important;font-size:12px!important;letter-spacing:0!important;white-space:nowrap}")
R("GB_attach=(f=>function(g,b,fig,cache){SC_S.drv=!!cache&&SC_S.on;try{return f(g,b,fig,cache)}finally{SC_S.drv=false}})(GB_attach);","GB_attach=(f=>function(g,b,fig,cache,bp){SC_S.drv=!!cache&&SC_S.on;try{return f(g,b,fig,cache,bp)}finally{SC_S.drv=false}})(GB_attach);")
R("window.__gb={GB_,","window.__gb={mesh:()=>GB.mesh,GB_,")

# library + presets go in front of the preset table (after GB_piece/GB_geo/GB_attach exist)
i=s.index('const GB_PRE=[')
s=s[:i]+CAR+'\nconst GB_PRE=[[\'SPEEDSTER\',CR_SPEED]];const GB_PRE0=['+s[i+len('const GB_PRE=['):]
R("function GB_preset(k){const P=GB_PRE[k];if(!P||!GB_.base)return 0;GB_snap();GB.d.bricks=[];if(!GB.d.bp){GB.d.bp=1;GB_scanBase();GB_gridMesh()}",
  "function GB_preset(k){const P=GB_PRE[k];if(!P||!GB_.base)return 0;GB_snap();GB.d.bricks=[];if(!GB.d.bp){GB.d.bp=1;GB_scanBase();GB_gridMesh()}if(P[1][0]&&P[1][0].length>5){GB.d.bricks=P[1].map(([t,x,z,r,c,y])=>({t,x,z,y,r:r%4,m:0,c}));GB_refresh();return GB_list().length}")
R("if(bp){const o=new THREE.Mesh(GB_plate(),GB_MAT);","if(bp&&!(bricks||[]).some(CR_isW)){const o=new THREE.Mesh(GB_plate(),GB_MAT);")
R("if(G.l){const o=new THREE.Mesh(G.l,GB_LMAT);o.userData.gb=1;o.userData.gbc=!!cache;host.add(o);U.gbM.push(o)}}",
  "if(G.l){const o=new THREE.Mesh(G.l,GB_LMAT);o.userData.gb=1;o.userData.gbc=!!cache;host.add(o);U.gbM.push(o)}\n if(G.g){const o=new THREE.Mesh(G.g,CR_GM);o.renderOrder=2;o.userData.gb=1;o.userData.gbc=!!cache;host.add(o);U.gbM.push(o)}\n for(const w of G.w||[]){const o=new THREE.Mesh(CR_wheel(w.t),GB_MAT);o.position.copy(w.o);o.userData.gb=1;o.userData.gbc=1;o.userData.r=CR_WH[w.t].r;CR_spin(o);host.add(o);U.gbM.push(o)}}")
R("const GB_MAT=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.32,metalness:.05,envMapIntensity:1.4});GB_MAT.onBeforeCompile=s=>{s.fragmentShader=s.fragmentShader.replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\\ntotalEmissiveRadiance+=diffuseColor.rgb*.28;')};",
  "const GB_MAT=new THREE.MeshPhysicalMaterial({vertexColors:true,roughness:.3,metalness:0,clearcoat:.8,clearcoatRoughness:.1,envMapIntensity:1.3});GB_MAT.onBeforeCompile=s=>{s.fragmentShader=s.fragmentShader.replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\\ntotalEmissiveRadiance+=diffuseColor.rgb*.16;')};")
R("${Object.entries(GB_PC).map(","${Object.entries(GB_PC).filter(e=>!e[1].hide).map(")
# default player car: SPEEDSTER on its own chassis when no brick design is active
R("t.gbB=br;t.gbP=!!(b&&b.on&&b.bp);","t.gbB=br;t.gbP=!!(b&&b.on&&b.bp);if(!br&&!(b&&b.on)){t.gbB=CR_DEF();t.gbP=true}")
R("const CR_isW=b=>!!CR_WH[b.t];","const CR_isW=b=>!!CR_WH[b.t];let CR_D0=null;const CR_DEF=()=>CR_D0||(CR_D0=CR_SPEED.map(([t,x,z,r,c,y])=>({t,x,z,y,r:r%4,m:0,c})));")
R("for(const rb of ud.ribbons)rb.visible=s.bt<.5}","for(const rb of ud.ribbons)rb.visible=s.bt<.5&&!(ud.gbHid&&ud.gbHid.length)}")
R("ud.under.visible=s.bt<.5;","ud.under.visible=s.bt<.5&&!(ud.gbHid&&ud.gbHid.length);")
save()
print('OK')
