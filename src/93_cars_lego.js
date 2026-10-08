// ---------- presets (built through the same snapping rules, so they sit on any chassis)
// ---------- CAR1: LEGO-proportioned part library (1 stud = GB_U, 1 plate = GB_PH), bevelled glossy parts, glass, spinning wheels, Speed-Champions-style preset
let CR_G=null,CR_W=null,CR_LO=0;const CR_E=.022,CR_K='#1b2a34',CR_DG='#3a4048';
const CR_bb=(x0,x1,y0,y1,z0,z1,c,e=CR_E)=>{if(CR_LO===1)return GB_box(x0,x1,y0,y1,z0,z1,c);e=Math.min(e,(x1-x0)/3,(y1-y0)/3,(z1-z0)/3);const sh=new THREE.Shape();sh.moveTo(x0+e,y0+e);sh.lineTo(x1-e,y0+e);sh.lineTo(x1-e,y1-e);sh.lineTo(x0+e,y1-e);sh.closePath();
 const g=new THREE.ExtrudeGeometry(sh,{depth:z1-z0-2*e,bevelEnabled:true,bevelThickness:e,bevelSize:e,bevelSegments:1,curveSegments:1});g.translate(0,0,z0+e);return GB_col(g,c)};
// side profile [z,y] (or ['q',cz,cy,z,y] quadratic) extruded across x0..x1
function CR_side(P,x0,x1,c,e=CR_E){if(CR_LO===1)e=0;const sh=new THREE.Shape();let f=1;for(const p of P){if(p[0]==='q'){sh.quadraticCurveTo(-p[1],p[2],-p[3],p[4])}else if(f){sh.moveTo(-p[0],p[1]);f=0}else sh.lineTo(-p[0],p[1])}sh.closePath();
 const g=new THREE.ExtrudeGeometry(sh,{depth:x1-x0-2*e,bevelEnabled:e>0,bevelThickness:e,bevelSize:e*.8,bevelSegments:1,curveSegments:CR_LO?4:8});g.rotateY(Math.PI/2);g.translate(x0+e,0,0);return GB_col(g,c)}
// top outline [x,z] extruded y0..y1
function CR_top(P,y0,y1,c,e=CR_E){if(CR_LO===1)e=0;const sh=new THREE.Shape();P.forEach((p,i)=>i?sh.lineTo(p[0],p[1]):sh.moveTo(p[0],p[1]));sh.closePath();
 const g=new THREE.ExtrudeGeometry(sh,{depth:y1-y0-2*e,bevelEnabled:true,bevelThickness:e,bevelSize:e*.8,bevelSegments:1,curveSegments:1});g.rotateX(Math.PI/2);g.translate(0,y1-e,0);return GB_col(g,c)}
const CR_stud=(M,x,y,z,c)=>{if(CR_LO===1)return;if(CR_LO){M.push(GB_cyl(.18,.11,x,y,z,c,6));return}M.push(GB_cyl(.18,.11,x,y,z,c,12));M.push(GB_cyl(.15,.02,x,y+.11,z,c,12))};
const CR_studs=(M,w,d,y,c,ok)=>{for(let i=0;i<w;i++)for(let j=0;j<d;j++){const x=(i+.5-w/2)*GB_U,z=(j+.5-d/2)*GB_U;if(!ok||ok(x,z))CR_stud(M,x,y,z,c)}};
const CR_WH={wS:{r:.62,w:.6,rim:.36},wM:{r:.76,w:.72,rim:.46},wL:{r:.9,w:.9,rim:.56},wXL:{r:1.25,w:1.2,rim:.62}};
const CR_wgeo={};
function CR_wheel(t){if(CR_LO){const k=t+'lo';if(CR_wgeo[k])return CR_wgeo[k];const W=CR_WH[t],a=new THREE.CylinderGeometry(W.r,W.r,W.w,20);a.rotateZ(Math.PI/2);const b=new THREE.CylinderGeometry(W.rim,W.rim,W.w*1.04,16);b.rotateZ(Math.PI/2);const h=new THREE.CylinderGeometry(W.rim*.35,W.rim*.35,W.w*1.08,12);h.rotateZ(Math.PI/2);return CR_wgeo[k]=mergeGeometries([GB_col(a,'#17191c'),GB_col(b,'#b9c0c8'),GB_col(h,'#2a2f36')])}if(CR_wgeo[t])return CR_wgeo[t];const W=CR_WH[t],r=W.r,hw=W.w/2,ri=W.rim,A=[];
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
  cs12:{n:'Curve 1×2',w:1,d:2,h:2,ic:'◠'},cs22:{n:'Curve 2×2',w:2,d:2,h:2,ic:'◠'},cs14:{n:'Curve 1×4',w:1,d:4,h:3,ic:'◠'},
 inv:{n:'Inv. slope',w:2,d:1,h:3,ic:'◥'},wl:{n:'Wedge L',w:2,d:4,h:1,ic:'◸'},wr:{n:'Wedge R',w:2,d:4,h:1,ic:'◹'},
 arch:{n:'Mudguard',w:2,d:4,h:6,ic:'⌒'},ws4:{n:'Screen 2×4',w:4,d:2,h:4,ic:'◪'},ws6:{n:'Screen 3×6',w:6,d:3,h:5,ic:'◪'},
 hl:{n:'Headlight',w:1,d:1,h:3,ic:'◐'},tl:{n:'Taillight',w:1,d:1,h:3,ic:'◑'},grl:{n:'Grille',w:1,d:2,h:1,ic:'▤'},rp:{n:'Round 1×1',w:1,d:1,h:1,ic:'•'},
 jmp:{n:'Jumper',w:1,d:2,h:1,ic:'⊡'},stw:{n:'Wheel (steer)',w:2,d:1,h:2,ic:'⊙'},drv:{n:'Driver',w:2,d:2,h:9,ic:'🧑'},
 wS:{n:'Wheel S',w:1,d:4,h:5,ic:'◎'},wM:{n:'Wheel M',w:1,d:4,h:6,ic:'◎'},wL:{n:'Wheel L',w:1,d:4,h:8,ic:'◎'},wXL:{n:'Monster wheel',w:2,d:5,h:10,ic:'◎'}});
GB_PC.drvR=Object.assign({},GB_PC.drv,{hide:1});GB_PC.spoiler.w=6;GB_PC.spoiler.d=2;GB_PC.spoiler.h=4;
GB_piece=(f=>function(t,c,M,L){CR_reg(t);const P=GB_PC[t];if(!P)return;const W=P.w*GB_U,D=P.d*GB_U,H=P.h*GB_PH,g=.008,col=GB_BC[c]||c,x0=-W/2+g,x1=W/2-g,z0=-D/2+g,z1=D/2-g,GL=CR_G||M;
 const k=P.g||t[0],big=!!P.g||/^[PBTC]\d/.test(t);
 if(big&&k==='C'){M.push(CR_side([[z1,0],[z1,H],[z1-Math.min(.12,D*.15),H],['q',z0+D*.18,H,z0,H*.28],[z0,0]],x0,x1,col))}
 else if(big||['b11','b12','b22','b24','tile'].includes(t)){M.push(CR_bb(x0,x1,0,H,z0,z1,col));if(k!=='T'&&t!=='tile')CR_studs(M,P.w,P.d,H,col)}
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
 else if(t==='drv'||t==='drvR'){const fg=t==='drvR'?Object.assign({},GB_figGet(),{c:col,t:'racer',x:'helmet',h:'grin'}):GB_figGet(),tm=[],tl=[];GB_figGeo(fg,tm,tl,true);const s=1.5*(typeof SC_S!=='undefined'&&SC_S&&SC_S.drv?SC_K.drv:1),k=1.95;
  for(const[A,B]of[[tm,M],[tl,L]])for(const g2 of A){g2.translate(0,-(.74-.42*s),1.55);g2.scale(k/s,k/s,k/s);g2.translate(0,.1,.25);B.push(g2)}
  M.push(CR_bb(-W/2+.15,W/2-.15,0,.25,-D/2+.1,D/2-.1,CR_K));M.push(CR_bb(-W/2+.2,W/2-.2,.25,1.6,D/2-.32,D/2-.08,CR_K))}
 else if(!CR_more(t,P,W,D,H,x0,x1,z0,z1,col,M,L))f(t,c,M,L)})(GB_piece);

// ---------- CAR1b: bigger 2K-Drive-style catalogue, grouped in tabs
const CR_CATS=['Bricks','Plates','Tiles','Slopes','Round','Vehicle','Power','Lights','Deco'];
(()=>{const G=(g,w,d,cat,ic)=>({n:(g==='B'?'Brick ':g==='P'?'Plate ':'Tile ')+w+'×'+d,w,d,h:g==='B'?3:1,g,cat,ic});
 for(const[w,d]of[[1,3],[1,4],[1,6],[1,8],[2,3],[2,6],[2,8]])GB_PC['b'+w+d]=G('B',w,d,'Bricks','▮');
 for(const[w,d]of[[1,1],[1,2],[1,3],[1,4],[1,6],[1,8],[2,2],[2,3],[2,4],[2,6],[2,8],[4,4],[4,6],[6,6]])GB_PC['p'+w+d]=G('P',w,d,'Plates','▬');
 for(const[w,d]of[[1,1],[1,3],[1,4],[1,6],[2,2],[2,4],[4,4]])GB_PC['t'+w+d]=G('T',w,d,'Tiles','▭');
 const C=(o,cat)=>{for(const k in o)GB_PC[k]=Object.assign(o[k],{cat})};
 C({s21:{n:'Slope 45 2×1',w:1,d:2,h:3,ic:'◢'},s22:{n:'Slope 45 2×2',w:2,d:2,h:3,ic:'◢'},ch:{n:'Cheese 1×1',w:1,d:1,h:2,ic:'◿'},s31:{n:'Slope 33 3×1',w:1,d:3,h:3,ic:'◢'},cs24:{n:'Curve 2×4',w:2,d:4,h:3,ic:'◠'},ics:{n:'Inv. curve 1×2',w:1,d:2,h:2,ic:'◡'}},'Slopes');
 C({rb22:{n:'Round 2×2',w:2,d:2,h:3,ic:'⬤'},rp22:{n:'Round plate 2×2',w:2,d:2,h:1,ic:'◯'},rt:{n:'Round tile 1×1',w:1,d:1,h:1,ic:'•'},qt:{n:'Quarter tile 2×2',w:2,d:2,h:1,ic:'◜'},cone:{n:'Cone 1×1',w:1,d:1,h:3,ic:'▲'},ab14:{n:'Arch 1×4',w:1,d:4,h:3,ic:'∩'}},'Round');
 C({mir:{n:'Mirror',w:1,d:1,h:2,ic:'◧'},pipes:{n:'Twin pipes',w:2,d:1,h:2,ic:'⁼'},scoop:{n:'Hood scoop',w:2,d:2,h:2,ic:'⏏'},seat:{n:'Seat',w:2,d:2,h:4,ic:'⑁'},lp:{n:'Number plate',w:2,d:1,h:2,ic:'▭'},diff:{n:'Diffuser',w:4,d:1,h:2,ic:'≡'},fin:{n:'Shark fin',w:1,d:3,h:5,ic:'◭'},ladder:{n:'Ladder',w:2,d:8,h:2,ic:'☷'}},'Vehicle');
 C({bar:{n:'Light bar',w:4,d:1,h:2,ic:'🚨'},siren:{n:'Beacon',w:1,d:1,h:2,ic:'🔵'},sign:{n:'Taxi sign',w:2,d:1,h:3,ic:'🚕'}},'Lights');
 C({ant:{n:'Antenna',w:1,d:1,h:8,ic:'📡'},flame:{n:'Flame decal',w:1,d:4,h:1,ic:'🔥'}},'Deco');
 C({eng:{n:'V8 engine',w:4,d:3,h:4,ic:'⚙'},stack:{n:'Exhaust stack',w:1,d:1,h:7,ic:'🎺'},roll:{n:'Roll bar',w:6,d:1,h:7,ic:'⊓'},bump:{n:'Chrome bumper',w:8,d:1,h:2,ic:'▬'},wing:{n:'Big wing',w:8,d:2,h:8,ic:'✈'},bigl:{n:'Big headlight',w:1,d:1,h:3,ic:'◉'},fender:{n:'Cycle fender',w:1,d:4,h:4,ic:'⌒'},sidep:{n:'Side pipe',w:1,d:6,h:2,ic:'═'},nitro:{n:'Nitro tanks',w:2,d:3,h:2,ic:'🧪'},bubble:{n:'Bubble canopy',w:4,d:4,h:5,ic:'◓'},teeth:{n:'Shark grille',w:4,d:1,h:3,ic:'🦈'},hull:{n:'Boat hull',w:8,d:16,h:6,ic:'⛵'},pont:{n:'Pontoon',w:2,d:16,h:4,ic:'⛴'},fan:{n:'Airboat fan',w:6,d:2,h:10,ic:'❂'}},'Vehicle');
 C({rocket:{n:'Rocket booster',w:2,d:4,h:4,ic:'🚀'},jet:{n:'Jet engine',w:2,d:3,h:4,ic:'✇'},prop:{n:'Propeller',w:2,d:1,h:5,ic:'✣'},cannon:{n:'Stud shooter',w:2,d:3,h:3,ic:'🔫'}},'Power');
 C({horns:{n:'Bull horns',w:4,d:1,h:4,ic:'🐂'},crown:{n:'Crown',w:2,d:2,h:2,ic:'👑'},skull:{n:'Skull',w:2,d:2,h:3,ic:'💀'},cup:{n:'Trophy',w:1,d:1,h:4,ic:'🏆'}},'Deco');
 const cat={b11:'Bricks',b12:'Bricks',b22:'Bricks',b24:'Bricks',tile:'Tiles',round:'Round',slope:'Slopes',wedge:'Slopes',cs12:'Slopes',cs22:'Slopes',cs14:'Slopes',inv:'Slopes',wl:'Plates',wr:'Plates',jmp:'Plates',grl:'Tiles',rp:'Round',
  arch:'Vehicle',ws4:'Vehicle',ws6:'Vehicle',stw:'Vehicle',drv:'Vehicle',wS:'Vehicle',wM:'Vehicle',wL:'Vehicle',wXL:'Vehicle',spoiler:'Vehicle',exhaust:'Vehicle',hl:'Lights',tl:'Lights',light:'Lights',flag:'Deco'};
 for(const k in cat)if(GB_PC[k])GB_PC[k].cat=cat[k];
 // palette order: by tab
 const E=Object.entries(GB_PC);for(const[k]of E)delete GB_PC[k];for(const ct of CR_CATS.concat([undefined]))for(const[k,v]of E)if(v.cat===ct)GB_PC[k]=v})();
function CR_cat(ct){GB_.ct=ct;document.querySelectorAll('#gbBkPc .gbPc').forEach(b=>b.style.display=b.dataset.ct===ct?'':'none');document.querySelectorAll('#gbBkCt .gbCt').forEach(b=>b.classList.toggle('on',b.dataset.ct===ct))}
const CR_lp=(M,x0,x1,y0,y1,z,bg,fg)=>{M.push(CR_bb(x0,x1,y0,y1,z,z+.05,bg,.01));for(let i=0;i<5;i++){const a=x0+.1+i*(x1-x0-.2)/5;M.push(GB_box(a+.03,a+(x1-x0-.2)/5-.03,y0+.06,y1-.06,z-.006,z,fg))}};
function CR_more(t,P,W,D,H,x0,x1,z0,z1,col,M,L){const U=GB_U,K=CR_K;
 if(t==='s21'||t==='s22'||t==='s31'){const back=t==='s31'?U*.5:U;M.push(CR_side([[z1,0],[z1,H],[z1-back,H],[z0,H*.2],[z0,0]],x0,x1,col));CR_studs(M,P.w,1,H,col);for(let i=M.length-P.w*2;i<M.length;i++)M[i].translate(0,0,D/2-U/2)}
 else if(t==='ch')M.push(CR_side([[z1,0],[z1,H],[z0,H*.22],[z0,0]],x0,x1,col));
 else if(t==='ics'){M.push(CR_side([[z0,H],[z1,H],[z1,0],['q',z0+D*.15,0,z0,H*.7]],x0,x1,col));CR_studs(M,P.w,P.d,H,col)}
 else if(t==='cs24')M.push(CR_side([[z1,0],[z1,H],[z1-.12,H],['q',z0+D*.2,H,z0,H*.25],[z0,0]],x0,x1,col));
 else if(t==='rb22'){M.push(GB_cyl(W/2-.01,H,0,0,0,col,24));CR_studs(M,2,2,H,col)}
 else if(t==='rp22'){M.push(GB_cyl(W/2-.01,H,0,0,0,col,24));CR_stud(M,0,H,0,col)}
 else if(t==='rt'){M.push(GB_cyl(U/2-.01,H,0,0,0,col,16))}
 else if(t==='qt'){const Q=[[x1,z1],[x1,z0]];for(let i=1;i<12;i++){const a=-Math.PI/2-Math.PI/2*i/12;Q.push([x1+Math.cos(a)*(W-.02),z1+Math.sin(a)*(D-.02)])}Q.push([x0,z1]);M.push(CR_top(Q,0,H,col))}
 else if(t==='cone'){M.push(GB_col(new THREE.CylinderGeometry(.13,U/2-.01,H*.9,16).translate(0,H*.45,0),col));M.push(GB_cyl(.12,H*.12,0,H*.9,0,col,12))}
 else if(t==='ab14'){const R=D/2-U+.02,ry=H*.62,N=14,pts=[[z0,0],[-R,0]];for(let i=1;i<N;i++){const a=Math.PI-Math.PI*i/N;pts.push([Math.cos(a)*R,Math.sin(a)*ry])}pts.push([R,0],[z1,0],[z1,H],[z0,H]);M.push(CR_side(pts,x0,x1,col));CR_studs(M,1,4,H,col)}
 else if(t==='mir'){M.push(CR_bb(-.06,.06,0,H*.7,-.06,.06,K));M.push(CR_bb(-.05,.3,H*.55,H,-.12,.1,col,.015));const g=GB_box(.02,.28,H*.6,H*.95,-.125,-.12,'#cfe6ff');M.push(g)}
 else if(t==='pipes'){for(const sx of[-1,1]){const p=new THREE.CylinderGeometry(.13,.13,.5,14);p.rotateX(Math.PI/2);p.translate(sx*.3,H*.45,.1);M.push(GB_col(p,'#c9ced6'));const q=new THREE.CircleGeometry(.09,12);q.translate(sx*.3,H*.45,.351);M.push(GB_col(q,'#121418'))}}
 else if(t==='scoop'){M.push(CR_side([[z1,0],[z1,H],[z0+.25,H],[z0,0]],x0+.1,x1-.1,col));M.push(GB_box(x0+.2,x1-.2,H*.25,H*.9,z0+.2,z0+.3,'#0d0e10'))}
 else if(t==='seat'){M.push(CR_bb(x0+.08,x1-.08,0,H*.3,z0+.05,z1-.05,K));const b=CR_bb(x0+.08,x1-.08,H*.25,H,z1-.28,z1-.06,K);M.push(b)}
 else if(t==='lp')CR_lp(M,x0+.15,x1-.15,H*.15,H*.85,z1-.05,'#f4f4f4','#1b2a34');
 else if(t==='diff'){M.push(CR_bb(x0,x1,0,H*.6,z0,z1,K));for(let i=0;i<5;i++){const x=x0+.2+i*(W-.4)/4;M.push(CR_bb(x-.03,x+.03,0,H*.6,z1-.02,z1+.18,K,.01))}}
 else if(t==='fin')M.push(CR_side([[z1,0],[z1,H*.3],[z1-.25,H],[z0,0]],-.1,.1,col,.015));
 else if(t==='ladder'){for(const sx of[-1,1])M.push(CR_bb(sx*W*.35-.07,sx*W*.35+.07,H*.2,H,z0,z1,'#c9ced6',.015));for(let i=0;i<9;i++){const z=z0+.2+i*(D-.4)/8;M.push(GB_box(-W*.35,W*.35,H*.55,H*.75,z-.03,z+.03,'#c9ced6'))}M.push(CR_bb(-.2,.2,0,H*.2,-.2,.2,K))}
 else if(t==='bar'){M.push(CR_bb(x0,x1,0,H*.35,z0+.05,z1-.05,K));for(const[sx,lc]of[[-1,'#2f6bff'],[1,'#ff2a2a']])L.push(CR_bb(sx<0?x0+.06:.02,sx<0?-.02:x1-.06,H*.35,H,z0+.1,z1-.1,lc,.03))}
 else if(t==='siren'){M.push(GB_cyl(.26,H*.25,0,0,0,K,14));L.push(GB_col(new THREE.SphereGeometry(.22,14,8,0,Math.PI*2,0,Math.PI/2).translate(0,H*.25,0),col,2.2))}
 else if(t==='sign'){M.push(CR_side([[z0+.12,0],[z1-.12,0],[z1-.12,H*.7],[z0+.12,H*.7]],x0+.05,x1-.05,col));for(const z of[z0+.115,z1-.115])for(let i=0;i<4;i++){const x=x0+.2+i*(W-.4)/4;M.push(GB_box(x,x+(W-.4)/8,H*.25,H*.45,z-.004,z+.004,'#1b2a34'))}}
 else if(t==='ant'){M.push(GB_cyl(.16,.08,0,0,0,K,10));M.push(GB_cyl(.025,H-.1,0,.08,0,K,6));L.push(GB_col(new THREE.SphereGeometry(.07,8,6).translate(0,H,0),col,1.6))}
 else if(t==='eng'){const CH='#d8dde4';M.push(CR_bb(x0+.1,x1-.1,0,H*.55,z0+.05,z1-.05,'#2a2f36'));for(const sx of[-1,1]){const hd=CR_bb(sx<0?x0+.05:.15,sx<0?-.15:x1-.05,H*.35,H*.7,z0+.1,z1-.1,CH);hd.rotateZ(-sx*.35);M.push(hd);for(let i=0;i<3;i++){const z=z0+.35+i*(D-.7)/2;M.push(CR_bb(sx<0?x0+.1:.4,sx<0?-.4:x1-.1,H*.7,H*.78,z-.12,z+.12,'#c9ced6',.01))}}
  M.push(CR_bb(-.45,.45,H*.55,H*.95,z0+.2,z1-.2,'#d01712'));M.push(GB_cyl(.34,H*.12,0,H*.95,0,CH,18));const bl=new THREE.CylinderGeometry(.2,.2,.08,16);bl.rotateX(Math.PI/2);bl.translate(0,H*.35,z0-.02);M.push(GB_col(bl,'#c9ced6'))}
 else if(t==='stack'){const p=GB_cyl(.13,H*.92,0,0,0,'#d8dde4',14);M.push(p);M.push(GB_cyl(.17,.08,0,H*.92,0,'#d8dde4',14));const q=new THREE.CircleGeometry(.11,12);q.rotateX(-Math.PI/2);q.translate(0,H+.002,0);M.push(GB_col(q,'#121418'));M.push(GB_cyl(.2,.1,0,0,0,'#2a2f36',12))}
 else if(t==='roll'){for(const sx of[-1,1])M.push(CR_bb(sx*W*.42-.08,sx*W*.42+.08,0,H,-.08,.08,'#2a2f36',.02));M.push(CR_bb(-W*.42-.08,W*.42+.08,H-.16,H,-.08,.08,'#2a2f36',.02));const d=CR_bb(-.08,.08,H*.15,H-.1,-.08,.08,'#2a2f36',.02);d.rotateZ(.9);d.translate(0,0,0);M.push(d)}
 else if(t==='bump'){M.push(CR_side([[z1,0],[z1,H],[z0+.1,H],['q',z0,H,z0,H*.5],['q',z0,0,z0+.1,0]],x0,x1,'#d8dde4',.03));for(let i=0;i<4;i++){const x=-.6+i*.4;M.push(GB_box(x-.06,x+.06,H*.2,H*.8,z0-.005,z0+.02,'#2a2f36'))}}
 else if(t==='wing'){for(const sx of[-1,1]){const s=CR_bb(sx*W*.28-.07,sx*W*.28+.07,0,H*.86,-.1,.1,'#2a2f36',.02);s.rotateX(.18);M.push(s)}
  M.push(CR_side([[z1,H*.86],[z1,H*.98],['q',z0+.2,H*1.06,z0,H*.84],[z0,H*.78]],x0+.12,x1-.12,col,.03));for(const sx of[-1,1])M.push(CR_bb(sx<0?x0:x1-.1,sx<0?x0+.1:x1,H*.62,H*1.08,z0-.05,z1+.05,col,.02))}
 else if(t==='bigl'){M.push(CR_bb(x0,x1,0,H*.45,z0,z1,'#2a2f36'));const b=new THREE.CylinderGeometry(.3,.27,.3,20);b.rotateX(Math.PI/2);b.translate(0,H*.62,0);M.push(GB_col(b,'#d8dde4'));const d=new THREE.CircleGeometry(.24,20);d.rotateY(Math.PI);d.translate(0,H*.62,-.155);L.push(GB_col(d,'#fff4cf',2.6))}
 else if(t==='fender'){const R=.98,th=.12,cy=H*.0,pts=[];for(let i=0;i<=12;i++){const a=Math.PI*.95-Math.PI*.9*i/12;pts.push([Math.cos(a)*R,cy+Math.sin(a)*R])}for(let i=12;i>=0;i--){const a=Math.PI*.95-Math.PI*.9*i/12;pts.push([Math.cos(a)*(R+th),cy+Math.sin(a)*(R+th)])}const g=CR_side(pts,x0,x1+.05,col,.02);g.translate(0,0,0);M.push(g);M.push(CR_bb(x1-.05,x1+.15,0,H*.7,-.06,.06,'#2a2f36',.015))}
 else if(t==='sidep'){const p=new THREE.CylinderGeometry(.14,.14,D-.1,14);p.rotateX(Math.PI/2);p.translate(0,H*.5,0);M.push(GB_col(p,'#d8dde4'));for(let i=0;i<3;i++){const z=z0+.6+i*(D-1.2)/2,r=new THREE.TorusGeometry(.15,.03,6,14);r.translate(0,H*.5,z);M.push(GB_col(r,'#8a8f99'))}const e=new THREE.CircleGeometry(.1,12);e.translate(0,H*.5,z1-.045);M.push(GB_col(e,'#121418'))}
 else if(t==='nitro'){for(const sx of[-1,1]){const p=new THREE.CapsuleGeometry(.22,D-.6,6,14);p.rotateX(Math.PI/2);p.translate(sx*.3,H*.55,0);M.push(GB_col(p,'#2f7bff'));const b=new THREE.TorusGeometry(.23,.03,6,14);b.translate(sx*.3,H*.55,0);M.push(GB_col(b,'#d8dde4'))}M.push(CR_bb(x0+.1,x1-.1,0,H*.25,z0+.3,z1-.3,'#2a2f36'))}
 else if(t==='bubble'){const g=new THREE.SphereGeometry(1,20,12,0,Math.PI*2,0,Math.PI/2);g.scale(W/2-.05,H,D/2-.05);(CR_G||M).push(GB_col(g,'#4a6a82'));M.push(CR_bb(x0,x1,0,.08,z0,z1,'#2a2f36'))}
 else if(t==='teeth'){M.push(CR_bb(x0,x1,0,H,z0+.1,z1,'#1b2a34'));for(let i=0;i<6;i++){const x=x0+.15+i*(W-.3)/6,w=(W-.3)/6;for(const up of[0,1]){const tr=new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(up?[x,H-.08,z0+.09,x+w,H-.08,z0+.09,x+w/2,H*.5,z0+.09]:[x,.08,z0+.09,x+w/2,H*.48,z0+.09,x+w,.08,z0+.09],3));tr.computeVertexNormals();M.push(GB_col(tr,'#f4f4f4'))}}}
 else if(t==='rocket'){const b=new THREE.CylinderGeometry(.45,.5,D-.5,20);b.rotateX(Math.PI/2);b.translate(0,H*.5,-.1);M.push(GB_col(b,col));const n=new THREE.ConeGeometry(.45,.6,20);n.rotateX(-Math.PI/2);n.translate(0,H*.5,z0+.15);M.push(GB_col(n,'#f4f4f4'));const z=new THREE.CylinderGeometry(.5,.35,.35,20);z.rotateX(Math.PI/2);z.translate(0,H*.5,z1-.25);M.push(GB_col(z,'#2a2f36'));const f=new THREE.CircleGeometry(.32,16);f.translate(0,H*.5,z1-.07);L.push(GB_col(f,'#ff8a2a',3));for(const a of[0,2.1,4.2]){const fin=CR_side([[z1-.3,0],[z1-.3,.5],[z1-1.0,0]],-.04,.04,col,.01);fin.translate(0,.45,0);fin.rotateZ(a);fin.translate(0,H*.5,0);M.push(fin)}}
 else if(t==='jet'){const b=new THREE.CylinderGeometry(.55,.45,D-.2,20,1,true);b.rotateX(Math.PI/2);b.translate(0,H*.5,0);M.push(GB_col(b,'#c9ced6'));const bi=b.clone();M.push(GB_col(new THREE.CylinderGeometry(.5,.4,D-.25,20).rotateX(Math.PI/2).translate(0,H*.5,0),'#2a2f36'));for(let i=0;i<8;i++){const bl=new THREE.BoxGeometry(.06,.45,.05);bl.translate(0,.22,z0+.2);bl.rotateZ(i/8*Math.PI*2);bl.translate(0,H*.5,0);M.push(GB_col(bl,'#d8dde4'))}const f=new THREE.CircleGeometry(.36,16);f.translate(0,H*.5,z1-.08);L.push(GB_col(f,'#7ff3ff',3))}
 else if(t==='prop'){M.push(CR_bb(-.12,.12,0,H*.5,-.12,.12,'#2a2f36'));const hub=new THREE.ConeGeometry(.14,.3,12);hub.rotateX(Math.PI/2);hub.translate(0,H*.5,z1);M.push(GB_col(hub,'#d8dde4'));for(let i=0;i<3;i++){const bl=CR_bb(-.09,.09,0,.7,-.02,.02,col,.01);bl.rotateY(.4);bl.rotateZ(i/3*Math.PI*2);bl.translate(0,H*.5,z1-.05);M.push(bl)}}
 else if(t==='cannon'){M.push(CR_bb(x0+.1,x1-.1,0,H*.45,z0+.2,z1-.1,'#2a2f36'));const b=new THREE.CylinderGeometry(.16,.2,D-.2,14);b.rotateX(Math.PI/2);b.translate(0,H*.65,-.05);M.push(GB_col(b,'#8a8f99'));const m=new THREE.TorusGeometry(.18,.05,6,14);m.translate(0,H*.65,z0+.05);M.push(GB_col(m,col))}
 else if(t==='horns'){for(const sx of[-1,1]){const h=new THREE.TorusGeometry(.7,.09,8,14,Math.PI*.55);h.rotateY(Math.PI/2);h.rotateX(0);h.translate(0,0,0);h.rotateZ(sx>0?0:Math.PI);h.translate(sx*.35,H*.25,0);M.push(GB_col(h,'#efe6cf'))}M.push(CR_bb(x0+.4,x1-.4,0,H*.35,z0+.1,z1-.1,col))}
 else if(t==='crown'){M.push(GB_col(new THREE.CylinderGeometry(.45,.4,H*.55,16,1,true).translate(0,H*.28,0),'#f5c20c'));for(let i=0;i<6;i++){const a=i/6*Math.PI*2,sp=new THREE.ConeGeometry(.08,.25,6);sp.translate(Math.sin(a)*.43,H*.55+.12,Math.cos(a)*.43);M.push(GB_col(sp,'#f5c20c'))}M.push(GB_cyl(.4,.06,0,0,0,'#d01712',16))}
 else if(t==='skull'){const s=new THREE.SphereGeometry(.42,14,10);s.scale(1,.9,1);s.translate(0,H*.6,0);M.push(GB_col(s,'#f4f4f4'));M.push(CR_bb(-.25,.25,0,H*.4,-.42,-.1,'#f4f4f4'));for(const sx of[-1,1]){const e=new THREE.CircleGeometry(.1,10);e.rotateY(Math.PI);e.translate(sx*.16,H*.62,-.405);M.push(GB_col(e,'#121418'))}}
 else if(t==='cup'){M.push(GB_cyl(.22,.1,0,0,0,'#f5c20c',12));M.push(GB_cyl(.05,H*.35,0,.1,0,'#f5c20c',8));M.push(GB_col(new THREE.CylinderGeometry(.26,.08,H*.45,14,1,true).translate(0,H*.65,0),'#f5c20c'));for(const sx of[-1,1]){const h=new THREE.TorusGeometry(.1,.025,6,10,Math.PI);h.rotateY(Math.PI/2);h.rotateZ(-sx*Math.PI/2);h.translate(sx*.27,H*.68,0);M.push(GB_col(h,'#f5c20c'))}}
 else if(t==='hull'){const Q=[[x0,z1-.3],[x0+.3,z1],[x1-.3,z1],[x1,z1-.3],[x1,z0+D*.3],[x1*.55,z0+D*.08],[0,z0],[x0*.55,z0+D*.08],[x0,z0+D*.3]];const g=CR_top(Q,0,H,col,.04);
  GB_shape(g,(x,y,z)=>{if(y<H*.5){const k=.12+.88*Math.max(0,Math.min(1,(z-z0)/(D*.35)))*.35;return[x*k,y+(z<z0+D*.3?(1-(z-z0)/(D*.3))*H*.45:0),z]}return null});M.push(g);
  const st=CR_top(Q.map(([x,z])=>[x*1.005,z]),H*.62,H*.8,col==='#f4f4f4'?'#0055bf':'#1b2a34',.01);st.translate(0,0,-.005);M.push(st);M.push(CR_bb(x0+.15,x1-.15,H-.06,H,z0+D*.35,z1-.15,'#e4cd9e',.01))}
 else if(t==='pont'){const Q=[[x0,z1-.2],[x0+.2,z1],[x1-.2,z1],[x1,z1-.2],[x1,z0+D*.25],[0,z0],[x0,z0+D*.25]];const g=CR_top(Q,0,H,col,.03);GB_shape(g,(x,y,z)=>y<H*.4?[x*.55,y+(z<z0+D*.25?(1-(z-z0)/(D*.25))*H*.5:0),z]:null);M.push(g);M.push(CR_top(Q.map(([x,z])=>[x*1.01,z]),H*.55,H*.7,'#1b2a34',.01))}
 else if(t==='fan'){const R=W/2-.1,cy=H*.55;const ring=new THREE.TorusGeometry(R,.07,8,28);ring.translate(0,cy,0);M.push(GB_col(ring,'#d8dde4'));for(let i=0;i<6;i++){const sp=CR_bb(-.025,.025,0,R,-.02,.02,'#d8dde4',.01);sp.rotateZ(i/6*Math.PI*2);sp.translate(0,cy,.12);M.push(sp)}
  for(let i=0;i<3;i++){const bl=CR_bb(-.12,.12,0,R*.92,-.03,.03,col,.01);bl.rotateY(.35);bl.rotateZ(i/3*Math.PI*2+.4);bl.translate(0,cy,-.12);M.push(bl)}const hb=new THREE.CylinderGeometry(.22,.22,.4,14);hb.rotateX(Math.PI/2);hb.translate(0,cy,0);M.push(GB_col(hb,'#2a2f36'));
  for(const sx of[-1,1])M.push(CR_bb(sx*R*.6-.07,sx*R*.6+.07,0,cy-R*.6,-.07,.07,'#2a2f36',.02));M.push(CR_bb(-.1,.1,0,cy,-.1,.1,'#2a2f36',.02))}
 else if(t==='flame'){const Q=[[x0,z1],[x0,z0+.3],[x0+W*.35,z0],[x0+W*.3,z0+D*.25],[x1,z0+D*.12],[x0+W*.65,z0+D*.45],[x1-.02,z0+D*.4],[x0+W*.7,z0+D*.7],[x1,z1]];M.push(CR_top(Q,0,H,col,.012));const Q2=Q.map(([x,z])=>[x*.55,(z-z1)*.7+z1]);M.push(CR_top(Q2,H*.5,H*1.15,'#fac80a',.01))}
 else return 0;return 1}
function PH_(n){return n*GB_PH}
// brick placement: wheels to CR_W, glass to CR_G follow the same transform
GB_brickGeo=(f=>function(b,M,L){CR_reg(b.t);const g0=CR_G?CR_G.length:0,w0=CR_W?CR_W.length:0;f(b,M,L);const[fw,fd]=GB_dims(b),cx=(b.x+fw/2)*GB_U,cz=(b.z+fd/2)*GB_U;
 if(CR_G)for(let i=g0;i<CR_G.length;i++){if(b.m)GB_mirX(CR_G[i]);CR_G[i].rotateY(b.r*Math.PI/2);CR_G[i].translate(cx,b.y*GB_PH,cz)}
 if(CR_W)for(let i=w0;i<CR_W.length;i++){const w=CR_W[i];w.o.applyAxisAngle(V3(0,1,0),b.r*Math.PI/2);w.o.add(V3(cx,b.y*GB_PH,cz));w.r=b.r}})(GB_brickGeo);
GB_geo=(f=>function(bricks,fig){const hasD=(bricks||[]).some(b=>b.t==='drv');CR_G=[];CR_W=[];let G;try{G=f(bricks,hasD||(bricks||[]).length?null:fig)}finally{G=G||{};G.g=CR_G.length?mergeGeometries(CR_G):null;G.w=CR_W;CR_G=null;CR_W=null}return G})(GB_geo);
const CR25A=1,CR_GM=new THREE.MeshPhysicalMaterial({color:new THREE.Color(.42,.48,.56),vertexColors:true,transparent:true,opacity:.7,roughness:.04,metalness:.15,clearcoat:1,clearcoatRoughness:.03,envMapIntensity:2.2,depthWrite:false});
function CR_spin(o){const p=V3();o.onBeforeRender=function(){this.getWorldPosition(p);const l=this.userData.lp;if(l){const e=this.matrixWorld.elements,fx=-e[8],fy=-e[9],fz=-e[10],n=Math.hypot(fx,fy,fz)||1,d=((p.x-l.x)*fx+(p.y-l.y)*fy+(p.z-l.z)*fz)/n;
 if(Math.abs(d)<5){const s=Math.hypot(e[0],e[1],e[2])||1;this.rotation.x-=d/(this.userData.r*s)}}else this.userData.lp=V3();this.userData.lp.copy(p)}}
const CR_isW=b=>!!CR_WH[b.t]||b.t==='hull';let CR_D0=null;const CR_DEF=()=>CR_D0||(CR_D0=CR_ROD.map(([t,x,z,r,c,y])=>({t,x,z,y,r:r%4,m:0,c})));
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
 if(o.bubble){add('T6x6',-3,-3,0,K,6);add('bubble',-2,-2,0,B,6)}else{add('ws6',-3,-3,0,B,6);add('ws6',-3,0,2,B,6);add('T6x2',-3,-1,0,B,11);add('T2x2',-1,-1,0,S,12)}
 // rear deck, spoiler, tail
 add('T4x4',-2,3,0,K,3);add('T4x4',-2,3,0,B,4);sym('T1x4',-2,3,0,B,5);add('T2x4',-1,3,0,S,5);
 sym('tl',-4,7,2,B,1);sym('B1x1',-3,7,0,B,1);add('B4x1',-2,7,0,K,1);add('C8x1',-4,7,2,B,4);
 if(!o.noWing)add('spoiler',-3,5,0,o.wing||K,6);sym('mir',-4,-3,0,B,6);add('pipes',-1,8,0,K,1);add('lp',-1,-9,0,K,1);add('lp',-1,8,2,K,3);
 for(const e of o.x||[])add(...e);return A}
// W8 SUV (v87f): 8-wide Speed-Champions-style SUV from real part types: raised hood with curved nose, chrome grille, chunky grey bumpers,
// mudguard arches, raked 3x6 windscreen, tall greenhouse (side windows split by pillars), flat roof with dark roof rails, tailgate window
function CR_suv(o){const A=[],B=o.body,K=CR_K,D='#1d2630',G='#3a4048',CH='#d8dde4',add=(t,x,z,r,c,y)=>{CR_reg(t);A.push([t,x,z,r,c,y])},
 sym=(t,x,z,r,c,y)=>{CR_reg(t);const fw=(r%2?GB_PC[t].d:GB_PC[t].w);add(t,x,z,r,c,y);if(x!==-x-fw)add(t,-x-fw,z,(4-r)%4,c,y)},wy=(.12-CR_WH.wL.r)/GB_PH;
 add('T6x16',-3,-8,0,K,0);sym('T1x6',-4,-3,0,K,0);sym('T1x1',-4,-8,0,K,0);sym('T1x1',-4,7,0,K,0);
 for(const z of[-7,3]){sym('arch',-4,z,0,B,0);sym('wL',-4,z,0,K,wy)}
 // front: grey bumper, headlights + chrome grille, raised hood with a curved lip
 add('P8x1',-4,-9,0,G,1);add('T8x1',-4,-9,0,G,2);add('B8x1',-4,-8,0,B,0);add('B8x1',-4,-8,0,B,3);add('B4x4',-2,-7,0,K,1);add('B4x4',-2,-7,0,B,3);
 sym('hl',-4,-9,0,B,3);for(const y of[3,4,5]){sym('rp',-3,-9,0,B,y);for(const x of[-2,0])add('grl',x,-9,1,CH,y)}
 add('C8x1',-4,-9,0,B,6);add('P8x5',-4,-8,0,B,6);add('T8x4',-4,-8,0,B,7);add('T8x1',-4,-4,0,B,7);
 // sides: doors between the arches, grey rocker, belt line
 sym('P1x6',-4,-3,0,G,1);sym('B1x6',-4,-3,0,B,2);sym('P1x6',-4,-3,0,B,5);sym('P1x6',-4,-3,0,o.acc||B,6);sym('P1x11',-4,-3,0,B,7);add('B4x6',-2,-3,0,K,1);add('P4x6',-2,-3,0,K,4);
 // rear: deck over the rear arches, taillights, tailgate, grey bumper
 add('B4x4',-2,3,0,B,3);add('P8x5',-4,3,0,B,6);add('B8x1',-4,7,0,B,0);sym('tl',-4,7,2,B,3);add('B6x1',-3,7,0,B,3);add('P8x1',-4,8,0,G,1);add('T8x1',-4,8,0,G,2);
 // greenhouse: raked screen, A/B/D pillars, dark side + rear windows, cabin filler
 add('ws6',-3,-4,0,B,8);sym('C1x2',-4,-4,0,B,8);sym('B1x1',-4,-2,0,B,8);sym('P1x1',-4,-2,0,B,11);
 for(const y of[8,11]){const P=y===8?'B':'P';sym(P+'1x3',-4,-1,0,D,y);sym(P+'1x1',-4,2,0,B,y);sym(P+'1x3',-4,3,0,D,y);sym(P+'1x1',-4,6,0,B,y);add(P+'6x1',-3,7,0,D,y);sym(P+'1x1',-4,7,0,B,y)}
 add('B6x8',-3,-1,0,K,8);add('P6x8',-3,-1,0,K,11);
 // roof: body plate, inset roof tile, dark roof rails, rear lip
 sym('T1x1',-4,-2,0,B,12);add('P8x9',-4,-1,0,B,12);add('T6x8',-3,-1,0,B,13);sym('T1x7',-4,0,0,K,13);add('C8x1',-4,7,2,B,13);
 for(const e of o.x||[])add(...e);return A}
function CR_rod(o={}){const A=[],R=o.body||'#d01712',Y=o.acc||'#fe8a18',K=CR_K,CH='#d8dde4',add=(t,x,z,r,c,y)=>A.push([t,x,z,r,c,y]),
 sym=(t,x,z,r,c,y)=>{CR_reg(t);const fw=(r%2?GB_PC[t].d:GB_PC[t].w);add(t,x,z,r,c,y);if(x!==-x-fw)add(t,-x-fw,z,(4-r)%4,c,y)},wy=(t,ax)=>(ax-GB_PC[t].h*GB_PH/2)/GB_PH;
 add('T4x9',-2,-8,0,K,2);add('T8x7',-4,1,0,K,1);
 // nose: open front wheels, chrome bumper, big headlights, V8 + exhaust stacks
 sym('wM',-4,-7,0,K,wy('wM',.22));add('bump',-4,-9,0,CH,1);sym('bigl',-3,-8,0,R,3);
 add('P4x2',-2,-8,0,R,3);add('C4x2',-2,-8,0,R,4);add('B4x6',-2,-6,0,R,3);add('eng',-2,-6,0,CH,6);sym('stack',-3,-6,0,CH,3);sym('stack',-3,-4,0,CH,3);
 // cockpit + roll bar
 sym('B1x4',-3,-1,0,R,3);sym('B1x5',-4,-2,0,R,2);add('drv',-1,-1,0,R,3);add('roll',-3,1,0,K,3);
 // rear: big wheels in tall arches, flat deck, flames, giant wing at the very back
 sym('arch',-4,3,0,R,1);sym('wL',-5,3,0,K,wy('wL',.36));
 add('B4x5',-2,2,0,R,2);add('P4x5',-2,2,0,R,5);add('T4x5',-2,2,0,R,6);
 add('T8x1',-4,7,0,K,1);sym('B2x1',-4,7,0,R,2);sym('tl',-4,7,2,R,4);sym('B1x1',-3,7,0,R,4);add('diff',-2,7,0,K,2);add('B4x1',-2,7,0,R,4);
 sym('pipes',-3,8,0,K,2);add('wing',-4,6,0,R,7);sym('fender',-4,-7,0,R,2);sym('sidep',-5,-2,0,K,1);add('nitro',-1,2,0,K,7);
 for(const e of o.x||[])add(...e);return A}
const CR_ROD=CR_rod();
function CR_monster(o={}){const A=[],G=o.body||'#a5ca18',K=CR_K,CH='#d8dde4',add=(t,x,z,r,c,y)=>A.push([t,x,z,r,c,y]),
 sym=(t,x,z,r,c,y)=>{CR_reg(t);const fw=(r%2?GB_PC[t].d:GB_PC[t].w);add(t,x,z,r,c,y);if(x!==-x-fw)add(t,-x-fw,z,(4-r)%4,c,y)},wy=(.36-GB_PC.wXL.h*GB_PH/2)/GB_PH;
 sym('wXL',-6,-8,0,K,wy);sym('wXL',-6,3,0,K,wy);add('T6x16',-3,-8,0,K,3);sym('B1x14',-4,-7,0,K,1);
 add('bump',-4,-9,0,CH,4);sym('hl',-3,-8,0,G,4);add('teeth',-2,-8,0,K,4);add('B6x4',-3,-7,0,G,4);add('T6x5',-3,-8,0,G,7);add('scoop',-1,-7,0,K,8);
 add('B6x5',-3,-3,0,G,4);add('ws6',-3,-3,0,G,7);add('B6x2',-3,0,0,G,7);add('P6x2',-3,0,0,G,10);add('P6x2',-3,0,0,G,11);add('T6x3',-3,-1,0,G,12);add('bar',-2,-1,0,K,13);
 sym('B1x5',-3,2,0,G,4);add('T4x5',-2,2,0,K,4);sym('stack',-3,2,0,CH,7);add('nitro',-1,3,0,K,5);
 sym('tl',-3,7,2,G,4);add('B4x1',-2,7,0,G,4);sym('flame',-3,-7,0,o.acc||'#fe8a18',7);
 for(const e of o.x||[])add(...e);return A}
function CR_boat(o={}){const A=[],W=o.hull||'#f4f4f4',B=o.body||'#0055bf',S=o.acc||'#ff2a1a',K=CR_K,add=(t,x,z,r,c,y)=>A.push([t,x,z,r,c,y]),
 sym=(t,x,z,r,c,y)=>{CR_reg(t);const fw=(r%2?GB_PC[t].d:GB_PC[t].w);add(t,x,z,r,c,y);if(x!==-x-fw)add(t,-x-fw,z,(4-r)%4,c,y)},st=o.style||'speed';
 if(st==='cat'){sym('pont',-5,-8,0,W,-2);add('T8x11',-4,-4,0,B,2);add('T8x3',-4,-7,0,W,2);add('ws6',-3,-3,0,B,3);add('drv',-1,-1,0,B,3);add('T6x2',-3,2,0,S,3);sym('jet',-5,6,0,S,0);add('flag',-1,5,0,S,3)}
 else if(st==='air'){add('hull',-4,-8,0,W,-3);add('T6x8',-3,-4,0,B,3);add('seat',-1,-1,0,K,3);add('drv',-1,-1,0,B,5);add('fan',-3,4,0,S,3);sym('light',-3,-5,0,S,3);add('T2x3',-1,-6,0,S,3)}
 else{add('hull',-4,-8,0,W,-3);add('ws4',-2,-3,0,B,3);add('drv',-1,-1,0,B,3);add('T4x2',-2,1,0,B,3);sym('jet',-3,5,0,W,1);add('flag',-1,6,0,B,3);
  sym('light',-3,-5,0,S,3);sym('T1x4',-3,1,0,B,3);add('T2x3',-1,-6,0,B,3)}
 for(const e of o.x||[])add(...e);return A}
function CR_buggy(o={}){const A=[],R=o.body||'#fe8a18',Y=o.acc||'#1b2a34',K=CR_K,CH='#d8dde4',add=(t,x,z,r,c,y)=>A.push([t,x,z,r,c,y]),
 sym=(t,x,z,r,c,y)=>{CR_reg(t);const fw=(r%2?GB_PC[t].d:GB_PC[t].w);add(t,x,z,r,c,y);if(x!==-x-fw)add(t,-x-fw,z,(4-r)%4,c,y)},wy=(.36-GB_PC.wL.h*GB_PH/2)/GB_PH-1.5;
 sym('wL',-5,-7,0,K,wy);sym('wL',-5,3,0,K,wy);add('T6x15',-3,-8,0,K,1);sym('fender',-5,-7,0,R,1);sym('fender',-5,3,0,R,1);
 add('bump',-4,-9,0,CH,1);add('B6x3',-3,-7,0,R,2);add('C6x2',-3,-8,0,R,2);sym('bigl',-2,-8,0,R,5);add('T6x3',-3,-7,0,Y,5);
 sym('B1x6',-3,-4,0,R,2);add('drv',-1,-2,0,R,2);add('roll',-3,-3,0,K,2);add('roll',-3,1,0,K,2);add('T6x5',-3,-3,0,R,9);add('bar',-2,-3,0,K,10);
 add('eng',-2,2,0,CH,2);sym('stack',-3,5,0,CH,2);add('T6x2',-3,5,0,R,2);sym('tl',-3,6,2,R,2);add('spoiler',-3,5,0,Y,6);
 for(const e of o.x||[])add(...e);return A}
const CR_OFF=CR_monster(),CR_BOAT=CR_boat();
// loadout: street / off-road / water, each with its own stats and perk (2K-Drive style)
const CR_LOAD={car:{name:'HOT ROD',k:'Street',st:{top:1.05,acc:1.04,han:.98,hull:1},w:'Medium',perk:'slip'},'4x4':{name:'GUACAMONSTER',k:'Off-road',st:{top:.96,acc:1.01,han:.97,hull:1.12},w:'Heavy',perk:'heal'},
 boat:{name:'AEGEAN',k:'Water',st:{top:1.02,acc:1.05,han:1.04,hull:.95},w:'Light',perk:'refill'}};
let CR_MODE='car';const CR_VC={};
function CR_grp(br,key){let G=CR_VC[key];if(!G&&!br)return new THREE.Group();if(!G)G=CR_VC[key]=GB_geo(br.map(([t,x,z,r,c,y])=>({t,x,z,y,r:r%4,m:0,c})),null);const g=new THREE.Group();g.userData.gb=1;
 const mk=(geo,mat)=>{const o=new THREE.Mesh(geo,mat);o.userData.gb=1;o.userData.gbc=1;g.add(o);return o};if(G.m)mk(G.m,GB_MAT);if(G.l)mk(G.l,GB_LMAT);if(G.g)mk(G.g,CR_GM).renderOrder=2;
 for(const w of G.w||[]){const o=mk(CR_wheel(w.t),GB_MAT);o.position.copy(w.o);o.userData.r=CR_WH[w.t].r;CR_spin(o)}return g}
function CR_attachV(g,team){const U=g.userData,host=U.carG||U.m,id=team&&CR_RIVS[team.id]?team.id:null;for(const k in U.gbV||{})host.remove(U.gbV[k]);const dr=a=>a.map(e=>e[0]==='drv'?['drvR',...e.slice(1)]:e);U.gbV={'4x4':CR_grp(id?dr(CR_RIVS[id][2]()):CR_OFF,'off'+(id||'')),boat:CR_grp(id?dr(CR_RIVS[id][3]()):CR_BOAT,'boat'+(id||''))};for(const k in U.gbV){U.gbV[k].visible=false;host.add(U.gbV[k])}}
function CR_vis(s,ud){const v=s.vmode||'car';for(const o of ud.gbM||[])o.visible=v==='car';for(const k in ud.gbV)ud.gbV[k].visible=k===v;if(ud.boat)ud.boat.visible=false;if(ud.wheels)ud.wheels.visible=false;
 if(s.isPlayer){CR_MODE=v;if(s.stats&&s._crv!==v){s._crv=v;s._st0=s._st0||{top:s.stats.top,acc:s.stats.acc,han:s.stats.han,hull:s.stats.hull};const m=CR_LOAD[v]||CR_LOAD.car;for(const k in m.st)s.stats[k]=s._st0[k]*m.st[k]}}}
function CR_statHTML(v){const L=CR_LOAD[v],p=(typeof PERKS!=='undefined'?PERKS:[]).find(q=>q.id===L.perk)||{},bar=(n,x)=>`<div><span>${n}</span><i><b style="width:${Math.round(Math.max(.1,Math.min(1,(x-.9)/.2))*100)}%"></b></i></div>`;
 return `<b>${L.k.toUpperCase()} · ${L.name}</b>${bar('Top speed',L.st.top)}${bar('Acceleration',L.st.acc)}${bar('Handling',L.st.han)}${bar('Health',L.st.hull)}<div><span>Weight</span><em>${L.w}</em></div><div class="crPk">${p.icon||'★'} ${p.name||''}<small>${p.d||''}</small></div>`}
function CR_showStat(v){const e=document.getElementById('crSt');if(e){e.innerHTML=CR_statHTML(v);e.hidden=false}}

const CR_SPEED=CR_car({body:'#d01712',acc:'#f4f4f4',wing:CR_K,wh:'wL'});

// ---------- rivals + boss: each rival's vehicle shows its signature weapon; plain AI teams get LEGO cars in team colours
const CR_RIVS={
 v_rossi:['ROSSI · Fulmine Rosso',()=>CR_car({body:'#d01712',acc:'#fac80a',noWing:1,x:[['jet',-3,4,0,'#f4f4f4',6],['jet',1,4,0,'#f4f4f4',6]]}),()=>CR_buggy({body:'#d01712',acc:'#fac80a',x:[['jet',-1,3,0,'#f4f4f4',6]]}),()=>CR_boat({hull:'#d01712',body:'#fac80a',acc:'#f4f4f4'})],
 v_weber:['WEBER · Mainschiff',()=>CR_car({body:'#36aebf',acc:'#f4f4f4',bubble:1,wing:'#f4f4f4',x:[['siren',-1,3,0,'#2f6bff',6]]}),()=>CR_monster({body:'#36aebf',acc:'#f4f4f4',x:[['siren',-1,4,0,'#2f6bff',5]]}),()=>CR_boat({style:'cat',hull:'#f4f4f4',body:'#36aebf',acc:'#2f6bff'})],
 v_moreau:['MOREAU · Lame de Nuit',()=>CR_car({body:'#5b1a7a',acc:'#ff698f',wing:'#ff698f',x:[['fin',-1,0,0,'#ff698f',12],['wl',-6,-2,0,'#5b1a7a',4],['wr',4,-2,0,'#5b1a7a',4]]}),()=>CR_buggy({body:'#5b1a7a',acc:'#ff698f',x:[['fin',-1,-7,0,'#ff698f',6]]}),()=>CR_boat({style:'air',hull:'#5b1a7a',body:'#1b2a34',acc:'#ff698f'})],
 v_okafor:['OKAFOR · Piste Bulldozer',()=>CR_monster({body:'#fac80a',acc:'#1b2a34',x:[['horns',-2,-10,0,'#1b2a34',8]]}),()=>CR_monster({body:'#fac80a',acc:'#1b2a34',x:[['horns',-2,-10,0,'#efe6cf',8]]}),()=>CR_boat({style:'cat',hull:'#fac80a',body:'#1b2a34',acc:'#fac80a',x:[['horns',-2,-9,0,'#efe6cf',3]]})],
 v_ferreira:['FERREIRA · Míssil Verde',()=>CR_rod({body:'#00852b',acc:'#a5ca18',acc2:'#f4f4f4',x:[['rocket',-6,-1,0,'#f4f4f4',3],['rocket',4,-1,0,'#f4f4f4',3]]}),()=>CR_buggy({body:'#00852b',acc:'#a5ca18',x:[['rocket',-6,-2,0,'#f4f4f4',4],['rocket',4,-2,0,'#f4f4f4',4]]}),()=>CR_boat({hull:'#00852b',body:'#a5ca18',acc:'#f4f4f4',x:[['rocket',-1,1,0,'#f4f4f4',3]]})],
 v_celik:['ÇELIK · Mayın',()=>CR_car({body:'#fe8a18',acc:'#1b2a34',wing:'#1b2a34',x:[['cannon',-1,4,2,'#fe8a18',6],['nitro',-3,3,0,CR_K,6]]}),()=>CR_monster({body:'#fe8a18',acc:'#1b2a34',x:[['cannon',-1,4,2,'#fe8a18',5]]}),()=>CR_boat({style:'air',hull:'#fe8a18',body:'#1b2a34',acc:'#fe8a18'})],
 v_brandt:['BRANDT · Voltwerk',()=>CR_car({body:'#0055bf',acc:'#fac80a',wing:'#fac80a',x:[['ant',-3,1,0,'#7ff3ff',12],['ant',2,1,0,'#7ff3ff',12],['siren',-1,0,0,'#7ff3ff',12]]}),()=>CR_buggy({body:'#0055bf',acc:'#fac80a',x:[['ant',-3,0,0,'#7ff3ff',10],['ant',2,0,0,'#7ff3ff',10]]}),()=>CR_boat({style:'cat',hull:'#0055bf',body:'#fac80a',acc:'#7ff3ff',x:[['ant',-1,2,0,'#7ff3ff',4]]})],
 v_naka:['NAKAMURA · Kage Rail',()=>CR_car({body:'#1b2a34',acc:'#ff698f',wing:'#ff698f',x:[['cannon',-1,-2,0,'#ff698f',12],['cannon',-1,-5,0,'#ff698f',6]]}),()=>CR_monster({body:'#1b2a34',acc:'#ff698f',x:[['cannon',-1,3,0,'#ff698f',5]]}),()=>CR_boat({hull:'#1b2a34',body:'#ff698f',acc:'#ff698f',x:[['cannon',-1,1,0,'#ff698f',3]]})],
 v_kaiser:['BOSS · KAISER · Kaiserkrone',()=>CR_rod({body:'#16121c',acc:'#ff1e3c',acc2:'#f5c20c',x:[['horns',-2,-11,0,'#f5c20c',2],['crown',-1,0,0,'#f5c20c',13],['skull',-1,-9,0,'#f4f4f4',4],['rocket',-6,0,0,'#ff1e3c',3],['rocket',4,0,0,'#ff1e3c',3]]}),()=>CR_monster({body:'#16121c',acc:'#ff1e3c',x:[['horns',-2,-10,0,'#f5c20c',8],['crown',-1,-1,0,'#f5c20c',14],['skull',-1,-7,0,'#f4f4f4',8]]}),()=>CR_boat({style:'cat',hull:'#16121c',body:'#ff1e3c',acc:'#f5c20c',x:[['crown',-1,0,0,'#f5c20c',8],['rocket',-1,-7,0,'#ff1e3c',3]]})],
 v_taxi:['Taxi Turbo',()=>CR_car({body:'#fac80a',acc:'#1b2a34',noWing:1,x:[['sign',-1,-1,0,'#fac80a',13]]}),()=>CR_buggy({body:'#fac80a',acc:'#1b2a34',x:[['sign',-1,-3,0,'#fac80a',11]]}),()=>CR_boat({hull:'#fac80a',body:'#1b2a34',acc:'#fac80a'})]};
CR_RIVS.shadow=CR_RIVS.v_kaiser;
const CR_RB={};
function CR_rivB(team){const id=team&&team.id;if(!id||id.startsWith('cu_'))return null;if(CR_RB[id])return CR_RB[id];let A;
 if(CR_RIVS[id])A=CR_RIVS[id][1]();else if(team.a){const h=[...id].reduce((a,ch)=>a+ch.charCodeAt(0),0);A=h%2?CR_car({body:team.a,acc:team.b||'#f4f4f4',wing:team.b}):CR_rod({body:team.a,acc:team.b||'#fac80a'})}else return null;
 return CR_RB[id]=A.map(([t,x,z,r,c,y])=>({t:t==='drv'?'drvR':t,x,z,y,r:r%4,m:0,c}))}

function CR_paintBody(){const L=GB_list();if(!L.length)return 0;const hx=c=>String(GB_BC[c]||c).toLowerCase(),skip=new Set(['#1b2a34','#d8dde4','#2a2f36','#c9ced6']),n={};
 for(const b of L){const h=hx(b.c);if(!skip.has(h))n[h]=(n[h]||0)+1}const top=Object.keys(n).sort((a,b)=>n[b]-n[a])[0];if(!top)return 0;GB_snap();let k=0;for(const b of L)if(hx(b.c)===top){b.c=GB_.col;k++}
 GB_refresh();try{AU.sfx('pick')}catch(e){}GB_msg&&GB_msg('Body painted · '+k+' parts');return k}

// wheels stay on the road: each wheel keeps its tyre bottom at a fixed height below the car's root, so pitch/roll moves only the body
const _crWP=new THREE.Vector3();
function CR_clamp(w){let R=w.userData.root;if(!R){R=w;while(R.parent&&!R.parent.isScene)R=R.parent;w.userData.root=R}if(R===w||typeof state==='undefined'||state!=='roam')return;
 const e=w.matrixWorld.elements,s=Math.hypot(e[4],e[5],e[6])||1;w.getWorldPosition(_crWP);let g;try{g=groundY(_crWP.x,_crWP.z)}catch(x){return}if(!(g>-1e4)||Math.abs(g-R.position.y)>4)return;
 const bot=_crWP.y-w.userData.r*s,d=Math.max(-.35,Math.min(.35,g+.03-bot));if(Math.abs(d)>.004)w.position.y+=d/s;else if(Math.abs(w.position.y-w.userData.by)>.6/s)w.position.y=w.userData.by}
CR_spin=(f=>function(o){f(o);o.userData.by=o.position.y;const ob=o.onBeforeRender;o.onBeforeRender=function(...a){if(this.userData.crSim)return;CR_clamp(this);return ob.apply(this,a)}})(CR_spin);
// ---------- city traffic in LEGO (instanced, body parts in white so each instance's paint tints them)
function CR_van(o){const A=[],B=o.body,K=CR_K,add=(t,x,z,r,c,y)=>A.push([t,x,z,r,c,y]),sym=(t,x,z,r,c,y)=>{CR_reg(t);const fw=(r%2?GB_PC[t].d:GB_PC[t].w);add(t,x,z,r,c,y);if(x!==-x-fw)add(t,-x-fw,z,(4-r)%4,c,y)},wy=(.12-GB_PC.wM.h*GB_PH/2)/GB_PH;
 add('T8x20',-4,-10,0,K,0);for(const z of[-9,5])sym('arch',-4,z,0,B,0),sym('wM',-4,z,0,K,wy);sym('B1x10',-4,-5,0,B,1);sym('B1x10',-4,-5,0,B,4);sym('B1x1',-4,-10,0,B,1);sym('hl',-4,-10,0,B,3);add('B6x1',-3,-10,0,K,1);add('C8x1',-4,-10,0,B,6);
 add('ws6',-3,-9,0,B,6);sym('B1x14',-4,-9,0,B,6);sym('B1x14',-4,-9,0,B,9);add('B6x11',-3,-6,0,B,6);add('B6x11',-3,-6,0,B,9);add('T8x16',-4,-6,0,B,12);sym('tl',-4,9,2,B,3);add('B6x1',-3,9,0,B,1);sym('B1x1',-4,9,0,B,1);
 add('T6x1',-3,9,0,K,4);return A}
function CR_truck(o){const A=[],B=o.body,K=CR_K,W='#f4f4f4',add=(t,x,z,r,c,y)=>A.push([t,x,z,r,c,y]),sym=(t,x,z,r,c,y)=>{CR_reg(t);const fw=(r%2?GB_PC[t].d:GB_PC[t].w);add(t,x,z,r,c,y);if(x!==-x-fw)add(t,-x-fw,z,(4-r)%4,c,y)},wy=(.12-GB_PC.wL.h*GB_PH/2)/GB_PH;
 add('T8x32',-4,-16,0,K,0);for(const z of[-15,5,10])sym('arch',-5,z,0,K,1),sym('wL',-4,z,0,K,wy);add('bump',-4,-17,0,'#d8dde4',1);
 add('B8x6',-4,-16,0,B,1);add('B8x6',-4,-16,0,B,4);add('ws6',-3,-16,0,B,7);sym('B1x1',-4,-16,0,B,7);sym('B1x2',-4,-15,0,K,7);for(const y of[3,4])for(const x of[-3,-1,1])add('grl',x,-17,1,'#d8dde4',y);add('B8x3',-4,-13,0,B,7);add('T8x6',-4,-16,0,B,12);sym('hl',-4,-17,0,B,2);sym('stack',-4,-11,0,'#d8dde4',7);
 for(const y of[3,6,9,12])CR_boxWall(add,sym,W,y);add('T8x21',-4,-10,0,W,15);sym('tl',-4,11,2,K,1);return A}
function CR_trParts(k){if(k>3)return null;const T=TRT[k],Wt='#ffffff';let A=k===0?CR_cab(CR_car({body:Wt,acc:Wt,wing:CR_K,noWing:1})):k===1?CR_cab(CR_car({body:Wt,acc:CR_K,noWing:1,x:[['sign',-1,-1,0,'#ffd12c',13]]})):k===2?CR_van({body:Wt}):CR_truck({body:Wt});
 const br=A.map(([t,x,z,r,c,y])=>({t:t==='drv'?'drvR':t,x,z,y,r:r%4,m:0,c})).filter(b=>!['drvR','stw','mir','lp'].includes(b.t));CR_LO=1;CR_G=[];CR_W=[];const M=[],L=[];for(const b of br)GB_brickGeo(b,M,L);const G=CR_G;CR_G=null;
 for(const w of CR_W){const g=CR_wheel(w.t).clone();g.translate(w.o.x,w.o.y,w.o.z);M.push(g)}CR_W=null;
 const box=new THREE.Box3().setFromBufferAttribute(mergeGeometries(M).attributes.position),wid=box.max.x-box.min.x,s=T.wid/wid,fix=g=>{g.translate(0,-box.min.y,0);g.scale(s,s,s);return g};
 CR_LO=0;const tiny=y=>GB_col(new THREE.BoxGeometry(.01,.01,.01).translate(0,y,0),'#ffffff');return{body:fix(mergeGeometries(M)),glass:G.length?fix(mergeGeometries(G)):tiny(-.5),lamp:L.length?fix(mergeGeometries(L)):tiny(-.5),neon:tiny(-.5)}}

// ---------- LEGO city traffic (all kinds): opaque glossy bodies, separate tyre/rim instances, suspension pitch + roll
const CR_CM=new THREE.MeshPhysicalMaterial({vertexColors:true,roughness:.2,metalness:0,clearcoat:1,clearcoatRoughness:.05,envMapIntensity:1.7});
const CR_CG={};
function CR_cityGeo(nm){if(!nm||nm[0]==='#')return null;if(CR_CG[nm]!==undefined)return CR_CG[nm];const W='#ffffff',K=CR_K,ath=CID!=='fra';let A,wid=2.0;
 try{switch(nm){case'sedan':A=CR_car({body:W,acc:W,noWing:1});break;case'sedan-sports':A=CR_car({body:W,acc:K,wing:K});break;
  case'taxi':A=CR_car({body:ath?'#f5d000':W,acc:ath?'#f5d000':K,noWing:1,x:[['sign',-1,-1,0,ath?'#f4f4f4':'#ffd12c',13]]});break;
  case'police':A=CR_car({body:'#f4f4f4',acc:'#0055bf',noWing:1,x:[['bar',-2,-1,0,K,13]]});break;
  case'suv':A=CR_suv({body:W,acc:W});wid=2.15;break;
  case'van':A=CR_van({body:W});wid=2.2;break;case'delivery':A=CR_truck({body:W});wid=2.4;break;case'truck':A=CR_truck({body:W});wid=2.55;break;
  case'garbage-truck':A=CR_truck({body:'#2c8a5a'});wid=2.6;break;default:return CR_CG[nm]=null}
  if(['sedan','sedan-sports','taxi','police'].includes(nm))A=CR_cab(A);if(['sedan','sedan-sports','taxi','police','suv'].includes(nm))A.push(['T1x6',-4,-3,0,K,-1],['T1x6',3,-3,0,K,-1],['T8x1',-4,-8,0,K,-1],['T8x1',-4,7,0,K,-1]);
  const br=A.map(([t,x,z,r,c,y])=>({t,x,z,y,r:r%4,m:0,c})).filter(b=>!['drv','drvR','stw','mir','lp','pipes','flag'].includes(b.t));CR_LO=2;CR_G=[];CR_W=[];const M=[],L=[];for(const b of br)GB_brickGeo(b,M,L);
  const Wg=CR_W.map(w=>{const g=CR_wheel(w.t).clone();g.translate(w.o.x,w.o.y,w.o.z);return g});const MD=M.filter(CR_isDark),MB=M.filter(g=>!CR_isDark(g));const body=mergeGeometries(MB.concat(L)),wheels=mergeGeometries(Wg),glass=(CR_G.length||MD.length)?mergeGeometries(CR_G.concat(MD)):null;
  const box=new THREE.Box3().setFromBufferAttribute(body.attributes.position),bw=new THREE.Box3().setFromBufferAttribute(wheels.attributes.position),s=wid/(box.max.x-box.min.x),y0=Math.min(box.min.y,bw.min.y);
  for(const g of[body,wheels,glass].filter(Boolean)){g.translate(0,-y0,0);g.scale(s,s,s);g.rotateY(Math.PI);g.translate(0,.04,0)}return CR_CG[nm]={body,wheels,glass}}
 catch(e){console.warn('CR city',nm,e);return CR_CG[nm]=null}finally{CR_LO=0;CR_G=null;CR_W=null}}
function CR_cityPost(im,nm,k,n){const G=CR_cityGeo(nm);if(!G)return;const w=new THREE.InstancedMesh(G.wheels,CR_WM||(CR_WM=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.8,metalness:0,envMapIntensity:.5})),n);w.frustumCulled=false;w.instanceMatrix.setUsage(THREE.DynamicDrawUsage);_m.makeScale(0,0,0);for(let j=0;j<n;j++)w.setMatrixAt(j,_m);im.userData.w=w;im.parent&&im.parent.add(w);if(G.glass){const gl=new THREE.InstancedMesh(G.glass,CR_WM||(CR_WM=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.8,metalness:0,envMapIntensity:.5})),n);gl.frustumCulled=false;gl.instanceMatrix.setUsage(THREE.DynamicDrawUsage);for(let j=0;j<n;j++)gl.setMatrixAt(j,_m);gl.renderOrder=2;im.userData.g=gl;im.parent&&im.parent.add(gl)}
 const cc=new THREE.Color();for(let j=0;j<n;j++){cc.set(HCOL[(j*3+k)%HCOL.length]).lerp(new THREE.Color('#ffffff'),.08);im.setColorAt(j,cc)}im.instanceColor&&(im.instanceColor.needsUpdate=true);
 im.material=ART9_cabMat();if(nm==='police'||nm==='garbage-truck'||(nm==='taxi'&&CID!=='fra')){const c=new THREE.Color('#ffffff');for(let j=0;j<n;j++)im.setColorAt(j,c);im.instanceColor&&(im.instanceColor.needsUpdate=true)}}
const _crM=new THREE.Matrix4(),_crR=new THREE.Matrix4(),_crE=new THREE.Euler(),_crT1=new THREE.Matrix4().makeTranslation(0,.45,0),_crT2=new THREE.Matrix4().makeTranslation(0,-.45,0);
// FX19: seat traffic on all four tyres (as the player car): pitch/roll to the ground under the wheel contacts, height = their mean
let FX19_R=260;const _fxA=new THREE.Vector3(),_fxR=new THREE.Matrix4(),_fxE=new THREE.Euler();
function FX19_seat(c,dx,dz,im,M){const w=im.userData.w;if(!w||!w.geometry)return;let B=im.userData.fxWB;if(!B){w.geometry.computeBoundingBox();const b=w.geometry.boundingBox,r=(b.max.y-b.min.y)/2;B=im.userData.fxWB={l:Math.max(.3,(b.max.z-b.min.z)/2-r),w:(b.max.x-b.min.x)/2*.85,cz:(b.max.z+b.min.z)/2,by:b.min.y}}
 _fxA.setFromMatrixPosition(M);const x=_fxA.x,z=_fxA.z;if(Math.abs(x-camera.position.x)+Math.abs(z-camera.position.z)>FX19_R)return;const y0=c.y+2.5,G=(a,b)=>groundAt(x+dx*(a+B.cz)+dz*b,z+dz*(a+B.cz)-dx*b,y0),
  fl=G(B.l,B.w),fr=G(B.l,-B.w),bl=G(-B.l,B.w),br=G(-B.l,-B.w);if(Math.max(fl,fr,bl,br)-Math.min(fl,fr,bl,br)>1.2)return;
 // local +x is (dz,0,-dx): b>0 is the right side
 const pt=-Math.atan2((fl+fr-bl-br)/2,2*B.l),rl=Math.atan2((fl+bl-fr-br)/2,2*B.w);M.multiply(_fxR.makeRotationFromEuler(_fxE.set(pt,0,rl)));M.elements[13]=(fl+fr+bl+br)/4-B.by+CR_TYRE_Y}
function CR_susp(c,dx,dz,dt,im,M){const w=im.userData.w;if(!w){im.setMatrixAt(c.j,M);return}try{FX19_seat(c,dx,dz,im,M)}catch(e){}w.setMatrixAt(c.j,M);const h=Math.atan2(dx,dz);if(c.hh==null)c.hh=h;let dh=h-c.hh;dh=Math.atan2(Math.sin(dh),Math.cos(dh));c.hh=h;const d=Math.max(dt,1e-3),v=c.cv||0,ac=(v-(c.pv??v))/d;c.pv=v;
 const tr=clamp(dh/d*v*.012,-.06,.06),tp=clamp(-ac*.015,-.045,.045),k=Math.min(1,dt*5);c.rl=(c.rl||0)+(tr-(c.rl||0))*k;c.pt=(c.pt||0)+(tp-(c.pt||0))*k;
 _crR.makeRotationFromEuler(_crE.set(c.pt,0,c.rl));_crM.copy(M).multiply(_crT1).multiply(_crR).multiply(_crT2);im.setMatrixAt(c.j,_crM);if(im.userData.g)im.userData.g.setMatrixAt(c.j,_crM)}


// ---------- CAR5 HUD: one objective line
(()=>{const st=document.createElement('style');st.textContent=`
#m1Next b,#m1Next small{display:none!important}#m1Next{border-radius:18px!important;padding:3px 12px 3px 8px!important;gap:6px!important}#m1Next span{font-size:13px!important;max-width:min(300px,46vw)!important}
#m1Next .crD{display:block;flex:none;font:800 12px system-ui;color:#4ceaff;white-space:nowrap}body.crMerge #roamArrow{visibility:hidden!important}
body.crMerge #m1Next{top:calc(54px + env(safe-area-inset-top,0px))!important}@media (max-height:520px){body.crMerge #m1Next{top:calc(26px + env(safe-area-inset-top,0px))!important}}
#roamPlate{transition:opacity .45s}#roamPlate.crHide{opacity:0!important}
body.touch #roamPlate{left:calc(114px + env(safe-area-inset-left,0px))!important}`;document.head.appendChild(st)})();
const CR_hudS={k:'',t:0};
function CR_hud(){const n=document.getElementById('m1Next'),a=document.getElementById('roamArrow'),pl=document.getElementById('roamPlate'),tu=document.getElementById('roamTut');
 const vis=e=>!!e&&!e.hidden&&getComputedStyle(e).display!=='none'&&getComputedStyle(e).visibility!=='hidden'&&e.getClientRects().length>0;
 const m=vis(n)&&!!a;document.body.classList.toggle('crMerge',m);
 if(m){let d=n.querySelector('.crD');if(!d){d=document.createElement('em');d.className='crD';n.appendChild(d)}const sp=a.querySelector('span');d.textContent=sp?sp.textContent.trim():''}
 if(pl){const k=pl.textContent;const now=performance.now();if(k!==CR_hudS.k){CR_hudS.k=k;CR_hudS.t=now}pl.classList.toggle('crHide',now-CR_hudS.t>2000||vis(tu))}}
setInterval(CR_hud,250);
// tutorial card: keep >= 8 px clear of the touch controls (between ▶ and BRAKE)
function CR_tutFit(){const t=document.getElementById('roamTut');if(!t||!document.body.classList.contains('touch')||t.hidden||!t.getClientRects().length){return}
 const bs=[...document.querySelectorAll('button,.tbtn,div')].filter(e=>/^(▶|BRAKE)$/.test((e.textContent||'').trim())&&e.getClientRects().length&&e.offsetWidth>30&&e.offsetWidth<160);
 const rb=bs.find(e=>e.textContent.trim()==='▶'),bk=bs.find(e=>e.textContent.trim()==='BRAKE');if(!rb||!bk)return;const L=rb.getBoundingClientRect().right+18,Rr=bk.getBoundingClientRect().left-18;
 if(Rr-L<200)return;const S=(k,v)=>t.style.setProperty(k,v,'important');S('left',L+'px');S('right','auto');S('transform','none');S('max-width',(Rr-L)+'px');S('box-sizing','border-box')}
setInterval(CR_tutFit,300);

let CR_WM=null;
function CR_cab(A){const ar=A.find(e=>e[0]==='arch'),B=ar?ar[4]:'#ffffff',D='#1d2630',out=A.filter(e=>!['ws6','ws4','bubble'].includes(e[0])&&!((e[0]==='T6x2'||e[0]==='T2x2')&&e[5]>=11));
 for(const e of out)if(e[5]>=12&&e[0]!=='T6x6')e[5]-=2;
 for(const e of out){if(e[0]==='T2x4'&&e[5]===5&&(e[2]===-7||e[2]===3))e[0]='P2x4';if(e[0]==='T1x6'&&e[5]===4&&(e[1]===-4||e[1]===3))e[4]='#2a2f36'}
 const add=(t,x,z,c,y)=>out.push([t,x,z,0,c,y]);
 add('s21',-3,-3,B,6);add('s21',2,-3,B,6);add('s22',-2,-3,D,6);add('s22',0,-3,D,6);
 add('B1x3',-3,-1,D,6);add('B1x3',2,-1,D,6);add('P1x3',-3,-1,D,9);add('P1x3',2,-1,D,9);
 add('B1x1',-3,2,B,6);add('B1x1',2,2,B,6);add('P1x1',-3,2,B,9);add('P1x1',2,2,B,9);add('B4x1',-2,2,D,6);add('P4x1',-2,2,D,9);
 add('P1x1',-3,-2,B,9);add('P1x1',2,-2,B,9);add('P4x1',-2,-2,D,9);add('T6x5',-3,-2,B,10);return out}


const CR_WIN=new THREE.Color('#1d2630');
function CR_isDark(g){const c=g.attributes.color;if(!c)return false;const r=c.getX(0),gg=c.getY(0),b=c.getZ(0);if(Math.abs(r-CR_WIN.r)+Math.abs(gg-CR_WIN.g)+Math.abs(b-CR_WIN.b)<.004)return false;return .2126*r+.7152*gg+.0722*b<.035}


function CR_tow(col){const A=[],B=col,K=CR_K,CH='#d8dde4',add=(t,x,z,r,c,y)=>A.push([t,x,z,r,c,y]),sym=(t,x,z,r,c,y)=>{CR_reg(t);const fw=(r%2?GB_PC[t].d:GB_PC[t].w);add(t,x,z,r,c,y);if(x!==-x-fw)add(t,-x-fw,z,(4-r)%4,c,y)},wy=(.12-GB_PC.wL.h*GB_PH/2)/GB_PH;
 add('T8x22',-4,-11,0,K,0);for(const z of[-10,4])sym('arch',-4,z,0,B,0),sym('wL',-4,z,0,K,wy);add('bump',-4,-12,0,CH,1);sym('hl',-4,-11,0,B,1);add('B6x1',-3,-11,0,K,1);
 add('B8x4',-4,-11,0,B,4);add('T8x4',-4,-11,0,B,7);add('B8x5',-4,-6,0,B,1);sym('B1x5',-4,-6,0,B,4);
 add('s21',-3,-6,0,B,7);add('s21',2,-6,0,B,7);add('s22',-2,-6,0,'#1d2630',7);add('s22',0,-6,0,'#1d2630',7);sym('B1x3',-4,-4,0,'#1d2630',7);add('B6x3',-3,-4,0,B,7);sym('P1x5',-4,-6,0,B,10);add('P6x5',-3,-6,0,B,10);
 add('T8x5',-4,-6,0,B,11);add('bar',-2,-4,0,K,12);sym('stack',-4,-2,0,CH,4);
 add('T8x10',-4,-1,0,'#6c6e68',1);sym('B1x10',-4,-1,0,B,2);add('B2x2',-1,5,0,K,2);add('B2x2',-1,5,0,K,5);
 const boom=[['B1x6',-1,1,0,'#fac80a',8],['B1x6',0,1,0,'#fac80a',8]];for(const e of boom)add(...e);add('B2x1',-1,7,0,K,5);add('B2x1',-1,7,0,K,8);
 sym('tl',-4,9,2,B,2);add('T8x1',-4,9,0,K,1);return A}
const CR_NPCS=[];
function CR_npcVeh(geo,col){let A;if(geo==='truck')A=CR_tow(col);else if(geo==='sedan-sports')A=CR_cab(CR_car({body:col,acc:'#1b2a34',wing:CR_K}));else if(geo==='van'||geo==='delivery')A=CR_van({body:col});else A=CR_cab(CR_car({body:col,acc:'#1b2a34',noWing:1}));
 const br=A.map(([t,x,z,r,c,y])=>({t:t==='drv'?'drvR':t,x,z,y,r:r%4,m:0,c})).filter(b=>!['drvR','stw','mir','lp','pipes','flag'].includes(b.t));
 const G=GB_geo(br,null),g=new THREE.Group(),h=new THREE.Group();g.add(h);const mk=(geo2,mat)=>{const o=new THREE.Mesh(geo2,mat);o.castShadow=true;h.add(o);return o};
 if(G.m)mk(G.m,GB_MAT);if(G.l)mk(G.l,GB_LMAT);if(G.g)mk(G.g,CR_GM).renderOrder=2;for(const w of G.w||[]){const o=mk(CR_wheel(w.t),GB_MAT);o.position.copy(w.o);o.userData.r=CR_WH[w.t].r;CR_spin(o)}
 const bb=new THREE.Box3().setFromObject(h),s=(geo==='truck'?2.5:2.05)/(bb.max.x-bb.min.x);h.scale.setScalar(s);h.rotation.y=Math.PI;h.position.y=-bb.min.y*s+.03;
 g.userData.crHalf={L:(bb.max.z-bb.min.z)*s/2,W:(bb.max.x-bb.min.x)*s/2};g.rotation.order='YXZ';g.userData.crH=h;g.userData.crY=h.position.y;CR_NPCS.push(g);return g}
// sit on all four tyres: pitch/roll to the ground under the wheels, centre height = mean of the four contacts
function CR_npcTilt(g){const H=g.userData.crHalf,h=g.rotation.y,fx=Math.sin(h),fz=Math.cos(h),dl=H.L*.72,dw=H.W*.8,x=g.position.x,z=g.position.z,y0=g.position.y+4,G=(a,b)=>groundAt(x+fx*a+fz*b,z+fz*a-fx*b,y0),
 yF=(G(dl,dw)+G(dl,-dw))/2,yB=(G(-dl,dw)+G(-dl,-dw))/2,yR=(G(dl,dw)+G(-dl,dw))/2,yL=(G(dl,-dw)+G(-dl,-dw))/2,yC=groundAt(x,z,y0);
 g.rotation.x=clamp(-Math.atan2(yF-yB,2*dl),-.25,.25);g.rotation.z=clamp(Math.atan2(yR-yL,2*dw),-.25,.25);g.userData.crH.position.y=g.userData.crY+clamp((yF+yB)/2-yC,-.5,.5)}
// keep the player out of mission vehicles: push out of the oriented footprint and bleed speed
// FX19: never draw a story vehicle the chase camera is inside (was a translucent orange wall over the screen); hide its body until the camera is out
function FX19_camIn(g,H,fx,fz){const b=g.userData.crH;if(!b)return;const c=camera.position,cx=c.x-g.position.x,cz=c.z-g.position.z,al=cx*fx+cz*fz,sd=cx*fz-cz*fx,m=.9;
 b.visible=!(Math.abs(al)<H.L+m&&Math.abs(sd)<H.W+m&&c.y<g.position.y+4.5)}
function CR_npcPush(){if(typeof RO==='undefined'||!RO.on)return;for(let i=CR_NPCS.length-1;i>=0;i--){const g=CR_NPCS[i];if(!g.parent){CR_NPCS.splice(i,1);continue}if(!g.visible)continue;CR_npcTilt(g);const H=g.userData.crHalf,h=g.rotation.y,fx=Math.sin(h),fz=Math.cos(h),dx=RO.x-g.position.x,dz=RO.z-g.position.z;FX19_camIn(g,H,fx,fz);
 if(Math.abs(RO.y-g.position.y)>3)continue;const al=dx*fx+dz*fz,sd=dx*fz-dz*fx,pl=H.L+CR_PLH.l-Math.abs(al),ps=H.W+CR_PLH.w-Math.abs(sd);if(pl<=0||ps<=0)continue;
 if(ps<pl){const k=Math.sign(sd)||1;RO.x+=fz*k*ps;RO.z-=fx*k*ps}else{const k=Math.sign(al)||1;RO.x+=fx*k*pl;RO.z+=fz*k*pl}RO.v*=.6}}


(()=>{const st=document.createElement('style');st.textContent=`
body.crQ #qTrk{display:none!important}body.crQ #raceW .cp,body.crQ #raceW .lst{display:none!important}
body.crQ #raceW .tm{font-size:15px!important;padding:2px 10px!important;min-width:0!important}body.crQ #raceW{top:calc(6px + env(safe-area-inset-top,0px))!important}
body.crQ #roamArrow{top:calc(44px + env(safe-area-inset-top,0px))!important;transform:translateX(-50%)!important;background:rgba(20,20,19,.86);border:2px solid #ffd400;border-radius:18px;padding:3px 12px}
#roamPause [data-p=evr],#roamPause [data-p=eva]{display:flex!important;align-items:center;justify-content:center;white-space:nowrap!important;word-break:normal!important;overflow-wrap:normal!important;font-size:clamp(12px,2.4vw,17px)!important}
body.crQ #m1Hp{top:calc(82px + env(safe-area-inset-top,0px))!important;bottom:auto!important}
#roamArrow .crQn{font:900 12px system-ui;color:#fff;white-space:nowrap;margin-right:4px}`;document.head.appendChild(st)})();
function CR_mhud(){const q=document.getElementById('qTrk'),a=document.getElementById('roamArrow');const on=!!q&&!q.hidden&&q.textContent.trim().length>0&&getComputedStyle(q).display!=='none'||document.body.classList.contains('crQ')&&!!q&&!q.hidden&&q.textContent.trim().length>0;
 document.body.classList.toggle('crQ',!!on);if(a){let n=a.querySelector('.crQn');if(on){if(!n){n=document.createElement('b');n.className='crQn';a.insertBefore(n,a.firstChild)}const b=q.querySelector('.qh b'),sp=q.querySelector('.qh .qs');n.textContent=((b?b.textContent.trim():'')+(sp?' · '+sp.textContent.trim():'')+' ·')}else if(n)n.remove()}
 const pz=document.getElementById('roamPause');if(!pz)return;for(const[k,id]of[['evr','qRst'],['eva','qAbn']]){const b=pz.querySelector(`[data-p="${k}"]`);if(!b)continue;if(on){b.hidden=false;b.dataset.crq=1}else if(b.dataset.crq){b.hidden=true;delete b.dataset.crq}
  if(!b.dataset.crb){b.dataset.crb=1;b.addEventListener('click',e=>{if(!document.body.classList.contains('crQ'))return;e.stopImmediatePropagation();const r=pz.querySelector('[data-p="resume"]');r&&r.click();setTimeout(()=>{const t=document.getElementById(id);t&&t.click()},60)},true)}}}
setInterval(CR_mhud,250);


let CR_WB=2.7,CR_PLH={l:1.3,w:1.05};const CR_CAMK=1/.15; // CR_WB: let, set per car size by 98bc_bigcars.js
const C26_cityMu=(terr,veh)=>(C26.muCity[terr]||C26.muCity.road)*(veh==='offroad'&&terr!=='road'?C26.muOff:1)*((carStat().han)||1);
function CR_yaw(c,dt,ytg,maxR,air){const v=RO.v||0,sp=Math.abs(v),st=clamp(c.steer||0,-1,1),base=-st*maxR*Math.sign(v||1),dm=TUNE.stAng/(1+sp/TUNE.stFall),tg=st*dm,d0=RO.dl||0;
 RO.dl=d0+(tg-d0)*Math.min(1,dt*(Math.abs(tg)>Math.abs(d0)&&tg*d0>=0?TUNE.stIn:TUNE.stOut));
 if(RO.dDir||air)return(RO.yr||0)+(ytg-(RO.yr||0))*Math.min(1,dt*6.5);
 const cap=Math.max(.35,maxR),pv=Math.max(0,1-sp/9),dS=v>.3?1:v<-.3?-1:(c.brk&&!c.thr?-1:1);return clamp(-(v/CR_WB)*Math.tan(RO.dl)-st*1.15*pv*pv*dS,-Math.max(cap,1.15),Math.max(cap,1.15))+(ytg-base)}
const CR_roll=()=>clamp(-(RO.yr||0)*(RO.v||0)/26,-1,1)*.055;
const CR_PS={};
function CR_bodyPts(ud){const host=ud.m,key=host.uuid+'|'+(ud.gbM?ud.gbM.length:0)+'|'+(typeof CR_MODE!=='undefined'?CR_MODE:'');if(CR_PS.k===key)return CR_PS.p;
 const inv=new THREE.Matrix4().copy(host.matrixWorld).invert(),B=new THREE.Box3(),bb=new THREE.Box3(),m4=new THREE.Matrix4();host.updateMatrixWorld(true);
 host.traverse(o=>{if(!o.isMesh||o.userData.r)return;let v=true,q=o;while(q&&q!==host){if(!q.visible)v=false;q=q.parent}if(!v||o.material&&(o.material.transparent||o.material.depthWrite===false))return;
  if(!o.geometry.boundingBox)o.geometry.computeBoundingBox();bb.copy(o.geometry.boundingBox).applyMatrix4(m4.multiplyMatrices(inv,o.matrixWorld));B.union(bb)});
 const P=[];if(!B.isEmpty())for(const x of[B.min.x,(B.min.x+B.max.x)/2,B.max.x])for(const z of[B.min.z,(B.min.z+B.max.z)/2,B.max.z])if(x!==(B.min.x+B.max.x)/2||z!==(B.min.z+B.max.z)/2)P.push(new THREE.Vector3(x,B.min.y,z));
 CR_PS.k=key;CR_PS.p=P;CR_PS.b=B.isEmpty()?null:B.clone();return P}
const _crA=new THREE.Vector3(),_crS=new THREE.Vector3();
// no hover-ship leftovers on the player car: underglow, thruster ribbons/flares, stock ship parts and the 7 m ship shadow go;
// a tight soft contact shadow sits under the body and BOOST lights flames at the tailpipes
let CR_SH=null;
function CR_shTex(){const c=document.createElement('canvas');c.width=64;c.height=128;const g=c.getContext('2d');g.shadowColor='rgba(0,0,0,.92)';g.shadowBlur=9;g.shadowOffsetX=400;g.fillStyle='#000';g.fillRect(12-400,12,40,104);const t=new THREE.CanvasTexture(c);if(typeof KEEP_TEX!=='undefined')KEEP_TEX.add(t);return t}
function CR_fx(s,ud){const host=ud.m,boat=(s.boatK||0)>.5;if(ud.under)ud.under.visible=false;for(const r of ud.ribbons||[])r.visible=false;for(const f of ud.flares||[])f.visible=false;if(ud.shadow)ud.shadow.visible=false;
 if(ud.carG)for(const o of ud.carG.children)if(o.visible&&!(o.userData.gb||o.userData.gbG||o.userData.crKeep||o===ud.boat||o===ud.wheels||Object.values(ud.gbV||{}).includes(o)))o.visible=false;
 if(!CR_SH){CR_SH=new THREE.Mesh(new THREE.PlaneGeometry(1,1).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({map:CR_shTex(),color:0,transparent:true,opacity:.6,depthWrite:false,fog:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));CR_SH.renderOrder=1;CR_SH.userData.keep=1;CR_SH.frustumCulled=false;scene.add(CR_SH)}
 if(!CR_SH.parent)scene.add(CR_SH);CR_bodyPts(ud);const B=CR_PS.b;CR_SH.visible=!boat&&!!B&&state==='roam';
 if(CR_SH.visible){host.getWorldScale(_crS);_crA.set((B.min.x+B.max.x)/2,B.min.y,(B.min.z+B.max.z)/2).applyMatrix4(host.matrixWorld);const g=groundAt(_crA.x,_crA.z,RO.y+1.5);
  CR_SH.position.set(_crA.x,g+.025,_crA.z);CR_SH.rotation.y=RO.h;CR_SH.scale.set((B.max.x-B.min.x)*_crS.x*1.12,1,(B.max.z-B.min.z)*_crS.z*1.06);CR_SH.material.opacity=.6*clamp(1-(RO.y-g)/5,0,1)}
 if(B&&!ud.crFl){const m=new THREE.MeshBasicMaterial({color:0xff8a1c,transparent:true,opacity:.9,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}),geo=new THREE.ConeGeometry(.5,1,10).rotateX(Math.PI/2).translate(0,0,.5);
  ud.crFl=[-1,1].map(sd=>{const c=new THREE.Mesh(geo,m);c.userData.crKeep=1;c.userData.sd=sd;c.visible=false;host.add(c);return c})}
 if(ud.crFl&&B){const W=B.max.x-B.min.x,H=B.max.y-B.min.y,L=B.max.z-B.min.z,on=!!s.nitro&&!boat;for(const c of ud.crFl){c.visible=on;if(on){const k=.75+Math.random()*.5;c.position.set((B.min.x+B.max.x)/2+c.userData.sd*W*.2,B.min.y+H*.2,B.max.z-L*.01);c.scale.set(W*.07*k,W*.07*k,L*.2*k)}}}}

// wheels on the ground + spin + steer, body never below the ground (runs every sim step, independent of rendering)
function CR_carPose(s,dt){const ud=s.mesh&&s.mesh.userData;if(!ud||!ud.m)return;CR_fx(s,ud);if((s.boatK||0)>.5){RO.crPX=RO.x;RO.crPZ=RO.z;return}const host=ud.m,W=[];
 host.traverse(w=>{if(!w.isMesh||!w.userData.r)return;let v=true,q=w;while(q&&q!==host){if(!q.visible)v=false;q=q.parent}if(v)W.push(w)});
 if(!W.length){RO.crPX=RO.x;RO.crPZ=RO.z;return}if(s.air){for(const w of W){w.userData.crSim=1;w.updateMatrixWorld();w.getWorldScale(_crS);w.rotation.x-=(RO.v||0)*dt/(w.userData.r*_crS.y)}RO.crPX=RO.x;RO.crPZ=RO.z;return}s.mesh.updateMatrixWorld(true);const need=[];let mx=-9;
 for(const w of W){w.userData.crSim=1;if(w.userData.by==null)w.userData.by=w.position.y;w.position.y=w.userData.by;w.updateMatrixWorld(true);w.getWorldPosition(_crA);w.getWorldScale(_crS);
  const r=w.userData.r*_crS.y,g=groundAt(_crA.x,_crA.z,_crA.y+1),d=g+CR_TYRE_Y-(_crA.y-r);need.push([w,d,_crS.y,r]);mx=Math.max(mx,d)}
 let lift=Math.max(Math.min(0,mx),mx-.22);
 for(const p of CR_bodyPts(ud)){_crA.copy(p).applyMatrix4(host.matrixWorld);lift=Math.max(lift,groundAt(_crA.x,_crA.z,_crA.y+1.5)+.02-_crA.y)}
 lift=clamp(lift,-.3,1.2);const gx=RO.x-(RO.crPX??RO.x),gz=RO.z-(RO.crPZ??RO.z);RO.crPX=RO.x;RO.crPZ=RO.z;let gd=gx*Math.sin(RO.h)+gz*Math.cos(RO.h);if(Math.abs(gd)>5)gd=0;host.position.y+=lift/(s.mesh.scale.y||1);
 for(const[w,d,sc,r]of need){w.position.y=w.userData.by+clamp(d-lift,-.12,.22)/(sc/(w.scale.y||1));w.rotation.x-=gd/r;if(w.position.z<-.2){w.rotation.order='YXZ';w.rotation.y=-(RO.dl||0)}}}

const GB_PRE=[['🛣 HOT ROD',CR_ROD,'car'],['⛰ MONSTER',CR_OFF,'4x4'],['🌊 AEGEAN',CR_BOAT,'boat'],['SPEEDSTER',CR_SPEED,'car']];const GB_PRE0=[['RACER',[['spoiler',-2,6,0,0],['exhaust',-2,5,0,10],['exhaust',1,5,0,10],['light',-1,-6,0,2],['b24',-4,0,0,11],['slope',-4,-2,0,0],['b12',-3,3,0,0],['tile',-1,1,0,9],['flag',-5,4,0,9]]],
 ['DOZER',[['b24',-3,-1,0,2],['b24',-5,-1,0,11],['b22',-3,3,0,2],['b24',-3,-1,0,11],['slope',-3,-3,0,2],['b22',-5,3,0,2],['b11',-6,1,0,0],['light',-6,-1,0,9],['exhaust',-1,4,0,10],['round',-4,5,0,11]]],
 ['PARADE',[['tile',-1,1,0,6],['tile',-1,3,0,6],['flag',-6,2,0,0],['flag',-4,5,0,2],['round',-3,1,0,9],['round',-3,2,0,8],['wedge',-6,4,0,6],['light',-2,-5,0,8],['b22',-5,0,0,9],['round',-5,0,0,6],['light',-1,5,0,5]]]];
function CR_perkAdd(a){const v=CR_LOAD[CR_MODE];if(v&&!a.includes(v.perk))a.push(v.perk);return a}
function GB_preset(k){const P=GB_PRE[k];if(P&&P[2])CR_showStat(P[2]);if(!P||!GB_.base)return 0;GB_snap();GB.d.bricks=[];if(!GB.d.bp){GB.d.bp=1;GB_scanBase();GB_gridMesh()}if(P[1][0]&&P[1][0].length>5){GB.d.bricks=P[1].map(([t,x,z,r,c,y])=>({t,x,z,y,r:r%4,m:0,c}));GB_refresh();return GB_list().length}const m=GB_.mir;GB_.mir=1;let n=0;for(const[t,x,z,r,c]of P[1]){let ok=0;for(let dz=0;dz<4&&!ok;dz++)for(const dx of[0,1,-1,2]){if(GB_add(t,x+dx,z+(dz%2?-1:1)*Math.ceil(dz/2),r,c,true)){ok=1;break}}n+=ok}GB_.mir=m;GB_refresh();return GB_list().length}
