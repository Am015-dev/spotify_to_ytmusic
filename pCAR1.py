# CAR1: LEGO part library + Speed-Champions-style SPEEDSTER (supersedes pLG1; apply onto v85 instead of pLG1).
# New parts (curved slopes, inverted slope, wedge plates, mudguard arch, glass windscreens, head/tail-light bricks, grille, round plate,
# jumper, spoiler, steering wheel, seated helmet driver, wheels S/M/L that spin), bevelled glossy ABS look; the default player car is SPEEDSTER.
exec(open('P.py').read())
if 'CR_SPEED' in s:
    print('OK');raise SystemExit
CAR=r'''// ---------- CAR1: LEGO-proportioned part library (1 stud = GB_U, 1 plate = GB_PH), bevelled glossy parts, glass, spinning wheels, Speed-Champions-style preset
let CR_G=null,CR_W=null,CR_LO=0;const CR_E=.022,CR_K='#1b2a34',CR_DG='#3a4048';
const CR_bb=(x0,x1,y0,y1,z0,z1,c,e=CR_E)=>{if(CR_LO)return GB_box(x0,x1,y0,y1,z0,z1,c);e=Math.min(e,(x1-x0)/3,(y1-y0)/3,(z1-z0)/3);const sh=new THREE.Shape();sh.moveTo(x0+e,y0+e);sh.lineTo(x1-e,y0+e);sh.lineTo(x1-e,y1-e);sh.lineTo(x0+e,y1-e);sh.closePath();
 const g=new THREE.ExtrudeGeometry(sh,{depth:z1-z0-2*e,bevelEnabled:true,bevelThickness:e,bevelSize:e,bevelSegments:1,curveSegments:1});g.translate(0,0,z0+e);return GB_col(g,c)};
// side profile [z,y] (or ['q',cz,cy,z,y] quadratic) extruded across x0..x1
function CR_side(P,x0,x1,c,e=CR_E){if(CR_LO)e=0;const sh=new THREE.Shape();let f=1;for(const p of P){if(p[0]==='q'){sh.quadraticCurveTo(-p[1],p[2],-p[3],p[4])}else if(f){sh.moveTo(-p[0],p[1]);f=0}else sh.lineTo(-p[0],p[1])}sh.closePath();
 const g=new THREE.ExtrudeGeometry(sh,{depth:x1-x0-2*e,bevelEnabled:e>0,bevelThickness:e,bevelSize:e*.8,bevelSegments:1,curveSegments:CR_LO?3:8});g.rotateY(Math.PI/2);g.translate(x0+e,0,0);return GB_col(g,c)}
// top outline [x,z] extruded y0..y1
function CR_top(P,y0,y1,c,e=CR_E){if(CR_LO)e=0;const sh=new THREE.Shape();P.forEach((p,i)=>i?sh.lineTo(p[0],p[1]):sh.moveTo(p[0],p[1]));sh.closePath();
 const g=new THREE.ExtrudeGeometry(sh,{depth:y1-y0-2*e,bevelEnabled:true,bevelThickness:e,bevelSize:e*.8,bevelSegments:1,curveSegments:1});g.rotateX(Math.PI/2);g.translate(0,y1-e,0);return GB_col(g,c)}
const CR_stud=(M,x,y,z,c)=>{if(CR_LO)return;M.push(GB_cyl(.18,.11,x,y,z,c,12));M.push(GB_cyl(.15,.02,x,y+.11,z,c,12))};
const CR_studs=(M,w,d,y,c,ok)=>{for(let i=0;i<w;i++)for(let j=0;j<d;j++){const x=(i+.5-w/2)*GB_U,z=(j+.5-d/2)*GB_U;if(!ok||ok(x,z))CR_stud(M,x,y,z,c)}};
const CR_WH={wS:{r:.62,w:.6,rim:.36},wM:{r:.76,w:.72,rim:.46},wL:{r:.9,w:.9,rim:.56},wXL:{r:1.25,w:1.2,rim:.62}};
const CR_wgeo={};
function CR_wheel(t){if(CR_LO){const k=t+'lo';if(CR_wgeo[k])return CR_wgeo[k];const W=CR_WH[t],a=new THREE.CylinderGeometry(W.r,W.r,W.w,10);a.rotateZ(Math.PI/2);const b=new THREE.CylinderGeometry(W.rim,W.rim,W.w*1.02,8);b.rotateZ(Math.PI/2);return CR_wgeo[k]=mergeGeometries([GB_col(a,'#17191c'),GB_col(b,'#a9b0b8')])}if(CR_wgeo[t])return CR_wgeo[t];const W=CR_WH[t],r=W.r,hw=W.w/2,ri=W.rim,A=[];
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
const CR_GM=new THREE.MeshPhysicalMaterial({vertexColors:true,transparent:true,opacity:.62,roughness:.04,metalness:.15,clearcoat:1,clearcoatRoughness:.03,envMapIntensity:2.2,depthWrite:false});
function CR_spin(o){const p=V3();o.onBeforeRender=function(){this.getWorldPosition(p);const l=this.userData.lp;if(l){const e=this.matrixWorld.elements,fx=-e[8],fy=-e[9],fz=-e[10],n=Math.hypot(fx,fy,fz)||1,d=((p.x-l.x)*fx+(p.y-l.y)*fy+(p.z-l.z)*fz)/n;
 if(Math.abs(d)<5){const s=Math.hypot(e[0],e[1],e[2])||1;this.rotation.x-=d/(this.userData.r*s)}}else this.userData.lp=V3();this.userData.lp.copy(p)}}
const CR_isW=b=>!!CR_WH[b.t]||b.t==='hull';
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
function CR_rod(o={}){const A=[],R=o.body||'#d01712',Y=o.acc||'#fe8a18',K=CR_K,CH='#d8dde4',add=(t,x,z,r,c,y)=>A.push([t,x,z,r,c,y]),
 sym=(t,x,z,r,c,y)=>{CR_reg(t);const fw=(r%2?GB_PC[t].d:GB_PC[t].w);add(t,x,z,r,c,y);if(x!==-x-fw)add(t,-x-fw,z,(4-r)%4,c,y)},wy=(t,ax)=>(ax-GB_PC[t].h*GB_PH/2)/GB_PH;
 add('T4x9',-2,-8,0,K,2);add('T8x7',-4,1,0,K,1);
 // nose: open front wheels, chrome bumper, big headlights, V8 + exhaust stacks
 sym('wM',-4,-7,0,K,wy('wM',.22));add('bump',-4,-9,0,CH,1);sym('bigl',-3,-8,0,R,3);
 add('P4x2',-2,-8,0,R,3);add('C4x2',-2,-8,0,R,4);add('B4x6',-2,-6,0,R,3);add('eng',-2,-6,0,CH,6);sym('stack',-3,-6,0,CH,3);sym('stack',-3,-4,0,CH,3);
 // cockpit + roll bar
 sym('B1x4',-3,-1,0,R,3);sym('B1x5',-4,-2,0,R,2);sym('flame',-4,-2,2,Y,5);add('drv',-1,-1,0,R,3);add('roll',-3,1,0,K,3);
 // rear: big wheels in tall arches, flat deck, flames, giant wing at the very back
 sym('arch',-4,3,0,R,1);sym('wL',-4,3,0,K,wy('wL',.36));sym('flame',-4,3,2,Y,7);sym('flame',-3,3,2,o.acc2||'#fac80a',7);
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

// ---------- city traffic in LEGO (instanced, body parts in white so each instance's paint tints them)
function CR_van(o){const A=[],B=o.body,K=CR_K,add=(t,x,z,r,c,y)=>A.push([t,x,z,r,c,y]),sym=(t,x,z,r,c,y)=>{CR_reg(t);const fw=(r%2?GB_PC[t].d:GB_PC[t].w);add(t,x,z,r,c,y);if(x!==-x-fw)add(t,-x-fw,z,(4-r)%4,c,y)},wy=(.12-GB_PC.wM.h*GB_PH/2)/GB_PH;
 add('T8x20',-4,-10,0,K,0);for(const z of[-9,5])sym('arch',-4,z,0,B,0),sym('wM',-4,z,0,K,wy);sym('B1x10',-4,-5,0,B,1);sym('B1x10',-4,-5,0,B,4);sym('B1x1',-4,-10,0,B,1);sym('hl',-4,-10,0,B,3);add('B6x1',-3,-10,0,K,1);add('C8x1',-4,-10,0,B,6);
 add('ws6',-3,-9,0,B,6);sym('B1x14',-4,-9,0,B,6);sym('B1x14',-4,-9,0,B,9);add('B6x11',-3,-6,0,B,6);add('B6x11',-3,-6,0,B,9);add('T8x16',-4,-6,0,B,12);sym('tl',-4,9,2,B,3);add('B6x1',-3,9,0,B,1);sym('B1x1',-4,9,0,B,1);
 add('T6x1',-3,9,0,K,4);return A}
function CR_truck(o){const A=[],B=o.body,K=CR_K,W='#f4f4f4',add=(t,x,z,r,c,y)=>A.push([t,x,z,r,c,y]),sym=(t,x,z,r,c,y)=>{CR_reg(t);const fw=(r%2?GB_PC[t].d:GB_PC[t].w);add(t,x,z,r,c,y);if(x!==-x-fw)add(t,-x-fw,z,(4-r)%4,c,y)},wy=(.12-GB_PC.wL.h*GB_PH/2)/GB_PH;
 add('T8x32',-4,-16,0,K,0);for(const z of[-15,5,10])sym('arch',-4,z,0,K,0),sym('wL',-4,z,0,K,wy);add('bump',-4,-17,0,'#d8dde4',1);
 add('B8x6',-4,-16,0,B,1);add('B8x6',-4,-16,0,B,4);add('ws6',-3,-16,0,B,7);sym('B1x3',-4,-16,0,B,7);add('B8x3',-4,-13,0,B,7);add('T8x6',-4,-16,0,B,12);sym('hl',-4,-17,0,B,2);sym('stack',-4,-11,0,'#d8dde4',7);
 add('B8x21',-4,-10,0,W,3);add('B8x21',-4,-10,0,W,6);add('B8x21',-4,-10,0,W,9);add('B8x21',-4,-10,0,W,12);add('T8x21',-4,-10,0,W,15);sym('tl',-4,11,2,K,1);return A}
function CR_trParts(k){if(k>3)return null;const T=TRT[k],Wt='#ffffff';let A=k===0?CR_car({body:Wt,acc:Wt,wing:CR_K,noWing:1}):k===1?CR_car({body:Wt,acc:CR_K,noWing:1,x:[['sign',-1,-1,0,'#ffd12c',13]]}):k===2?CR_van({body:Wt}):CR_truck({body:Wt});
 const br=A.map(([t,x,z,r,c,y])=>({t:t==='drv'?'drvR':t,x,z,y,r:r%4,m:0,c})).filter(b=>!['drvR','stw','mir','lp'].includes(b.t));CR_LO=1;CR_G=[];CR_W=[];const M=[],L=[];for(const b of br)GB_brickGeo(b,M,L);const G=CR_G;CR_G=null;
 for(const w of CR_W){const g=CR_wheel(w.t).clone();g.translate(w.o.x,w.o.y,w.o.z);M.push(g)}CR_W=null;
 const box=new THREE.Box3().setFromBufferAttribute(mergeGeometries(M).attributes.position),wid=box.max.x-box.min.x,s=T.wid/wid,fix=g=>{g.translate(0,-box.min.y,0);g.scale(s,s,s);return g};
 CR_LO=0;const tiny=y=>GB_col(new THREE.BoxGeometry(.01,.01,.01).translate(0,y,0),'#ffffff');return{body:fix(mergeGeometries(M)),glass:G.length?fix(mergeGeometries(G)):tiny(-.5),lamp:L.length?fix(mergeGeometries(L)):tiny(-.5),neon:tiny(-.5)}}
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
  "<button data-a=\"bp\" title=\"Blank baseplate or jet chassis\">⬛ BASE</button><button data-a=\"clr\">CLEAR</button><div id=\"gbBkS\">${GB_PRE.map((p,i)=>`<button data-a=\"pre${i}\">${p[0]}</button>`).join('')}</div><div id=\"crSt\" hidden></div>")
R("else if(a==='clr'){GB_snap();GB.d.bricks=[];GB_refresh()}",
  "else if(a==='clr'){GB_snap();GB.d.bricks=[];GB_refresh()}else if(a==='bp'){GB_snap();GB.d.bricks=[];GB.d.bp=GB.d.bp?0:1;GB_scanBase();GB_gridMesh();GB_refresh()}")
R("#gbBkT>*{pointer-events:auto}",
  "#gbBkT>*{pointer-events:auto}#gbBkS{position:fixed;right:8px;top:calc(96px + env(safe-area-inset-top,0px));display:grid;grid-template-columns:auto auto;gap:5px}#gbBkS button{height:30px!important;padding:0 8px!important;font-size:12px!important;letter-spacing:0!important;white-space:nowrap}#crSt{position:fixed;left:8px;top:calc(56px + env(safe-area-inset-top,0px));width:196px;padding:8px 10px;border-radius:12px;background:rgba(6,18,31,.88);border:1px solid rgba(76,234,255,.35);color:#fff;font:700 12px system-ui;pointer-events:none}#crSt>b{display:block;margin-bottom:4px;color:#ffd12c}#crSt div{display:flex;align-items:center;gap:6px;margin:2px 0}#crSt span{width:84px;opacity:.85}#crSt i{flex:1;height:6px;border-radius:3px;background:rgba(255,255,255,.15)}#crSt i b{display:block;height:100%;border-radius:3px;background:linear-gradient(90deg,#22c5e4,#7dffa0)}#crSt em{font-style:normal;color:#7dffa0}#crSt .crPk{display:block;margin-top:5px;color:#ffd12c}#crSt .crPk small{display:block;color:#cfe;font-weight:600}")
R("GB_attach=(f=>function(g,b,fig,cache){SC_S.drv=!!cache&&SC_S.on;try{return f(g,b,fig,cache)}finally{SC_S.drv=false}})(GB_attach);","GB_attach=(f=>function(g,b,fig,cache,bp){SC_S.drv=!!cache&&SC_S.on;try{return f(g,b,fig,cache,bp)}finally{SC_S.drv=false}})(GB_attach);")
R("window.__gb={GB_,","window.__gb={mesh:()=>GB.mesh,GB_,")

# library + presets go in front of the preset table (after GB_piece/GB_geo/GB_attach exist)
i=s.index('const GB_PRE=[')
s=s[:i]+CAR+'\nconst GB_PRE=[[\'🛣 HOT ROD\',CR_ROD,\'car\'],[\'⛰ MONSTER\',CR_OFF,\'4x4\'],[\'🌊 AEGEAN\',CR_BOAT,\'boat\'],[\'SPEEDSTER\',CR_SPEED,\'car\']];const GB_PRE0=['+s[i+len('const GB_PRE=['):]
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
R("const CR_isW=b=>!!CR_WH[b.t]||b.t==='hull';","const CR_isW=b=>!!CR_WH[b.t]||b.t==='hull';let CR_D0=null;const CR_DEF=()=>CR_D0||(CR_D0=CR_ROD.map(([t,x,z,r,c,y])=>({t,x,z,y,r:r%4,m:0,c})));")
R("for(const rb of ud.ribbons)rb.visible=s.bt<.5}","for(const rb of ud.ribbons)rb.visible=s.bt<.5&&!(ud.gbHid&&ud.gbHid.length)}")
R("ud.under.visible=s.bt<.5;","ud.under.visible=s.bt<.5&&!(ud.gbHid&&ud.gbHid.length);")
R('<div class="gbBkR" id="gbBkPc">${Object.entries(GB_PC).filter(e=>!e[1].hide).map(([k,p])=>`<button class="gbPc" data-p="${k}">',
  '<div class="gbBkR" id="gbBkCt">${CR_CATS.map(c=>`<button class="gbCt" data-ct="${c}">${c}</button>`).join(\'\')}</div><div class="gbBkR" id="gbBkPc">${Object.entries(GB_PC).filter(e=>!e[1].hide).map(([k,p])=>`<button class="gbPc" data-p="${k}" data-ct="${p.cat||\'Deco\'}">')
R("v.appendChild(T);v.appendChild(P);","v.appendChild(T);v.appendChild(P);P.addEventListener('click',e=>{const b=e.target.closest('.gbCt');if(b)CR_cat(b.dataset.ct)});CR_cat(GB_.ct||'Bricks');")
R(".gbBkR{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;padding:2px}",".gbBkR{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;padding:2px}#gbBkCt .gbCt{height:28px;padding:0 11px;border-radius:14px;border:1px solid rgba(76,234,255,.45);background:rgba(6,18,31,.9);color:#fff;font:800 12px system-ui;white-space:nowrap;flex:none}#gbBkCt .gbCt.on{background:linear-gradient(90deg,#22c5e4,#8c55ff);color:#05030f}")
R("window.__gb={mesh:()=>GB.mesh,","window.__gb={mesh:()=>GB.mesh,refresh:()=>GB_refresh(),")
R("GB_.yaw=GB.rot;GB_scanBase();","GB_.yaw=Math.PI*.78;GB_.pit=Math.max(GB_.pit||0,.3);GB_scanBase();")
R("opacity:b.bad?.25:.55,depthWrite:false,color:b.bad?0xff4040:0xffffff}","opacity:b.bad?.3:.6,depthWrite:false,color:b.bad?0xff4040:0x7dffa0}")
# 3-vehicle loadout in the world: off-road + boat brick vehicles swap in by terrain, with their own stats and perk
R("shipMesh=(f=>function(team){const g=f(team);if(team&&(team.gbB||team.gbF))try{GB_attach(g,team.gbB,team.gbF,true,team.gbP)}catch(e){console.warn('GB',e)}",
  "shipMesh=(f=>function(team){const g=f(team);if(team&&(team.gbB||team.gbF))try{GB_attach(g,team.gbB,team.gbF,true,team.gbP);if(team.gbP)CR_attachV(g)}catch(e){console.warn('GB',e)}")
R("for(const rb of ud.ribbons)rb.visible=s.bt<.5&&!(ud.gbHid&&ud.gbHid.length)}","for(const rb of ud.ribbons)rb.visible=s.bt<.5&&!(ud.gbHid&&ud.gbHid.length);if(ud.gbV)CR_vis(s,ud)}")
R("function perkEq(){return store.get('mho_perks',[])","function perkEq(){return CR_perkAdd(perkEq0())}function perkEq0(){return store.get('mho_perks',[])")
R("function GB_preset(k){const P=GB_PRE[k];","function CR_perkAdd(a){const v=CR_LOAD[CR_MODE];if(v&&!a.includes(v.perk))a.push(v.perk);return a}\nfunction GB_preset(k){const P=GB_PRE[k];if(P&&P[2])CR_showStat(P[2]);")
R("catch(e){console.warn('GB',e)}return g})(shipMesh);","catch(e){console.warn('GB',e)}else if(team&&!team.gbB){const rb=CR_rivB(team);if(rb)try{GB_attach(g,rb,null,true,true);CR_attachV(g,team)}catch(e){console.warn('GB',e)}}return g})(shipMesh);")
R("window.__gb={mesh:()=>GB.mesh,","window.__cr={RIVS:CR_RIVS,rivB:CR_rivB};window.__gb={mesh:()=>GB.mesh,")
# LEGO traffic: carParts -> LEGO geometry; body material takes vertex colours so black/chrome details stay while paint tints the white parts
R("function buildTrafficMeshes(){const mats={body:new THREE.MeshStandardMaterial({color:0xffffff,roughness:.28,metalness:.75,envMapIntensity:1.6}),glass:new THREE.MeshStandardMaterial({color:0x0b1522,roughness:.06,metalness:.9,envMapIntensity:2.2,emissive:0x0a1a2a}),",
  "function buildTrafficMeshes(){const mats={body:new THREE.MeshPhysicalMaterial({color:0xffffff,vertexColors:true,roughness:.3,metalness:0,clearcoat:.8,clearcoatRoughness:.1,envMapIntensity:1.3}),glass:new THREE.MeshStandardMaterial({color:0x3a5a72,roughness:.05,metalness:.3,envMapIntensity:2.2,emissive:0x0a1a2a}),")
R("function carParts(k){","function carParts(k){try{const q=CR_trParts(k);if(q)return q}catch(e){console.warn('CR traffic',e)}finally{CR_LO=0;CR_G=null;CR_W=null}")
save()
print('OK')
