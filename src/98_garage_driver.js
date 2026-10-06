// ---------- GAR1: driver minifig rebuilt at real minifig proportions (40 mm tall: legs+hips ≈ torso ≈ 12.8 mm, torso as wide as a 1×2 brick)
// open-face helmet with flipped-up visor (face visible), printed face wrapped on the round head, arms bent forward, C-hands on the steering wheel,
// more faces / hair, 8 ready-made drivers in the garage DRIVER tab. Replaces GB_figGeo / GB_portrait and the 'drv' piece.
GB_FIG.h.push(['lashes','Lashes'],['beard','Beard'],['glasses','Glasses'],['smirk','Smirk']);
GB_FIG.x.push(['ponytail','Ponytail'],['bun','Bun'],['spiky','Spiky'],['beanie','Beanie']);
GB_FIG.t.push(['stripes','Stripes'],['jacket','Leather jacket']);
const GAR_PRE=[['Ace',{h:'smile',x:'helmet',t:'racer',l:'#2b3a67',c:'#e01e2b'}],['Nova',{h:'lashes',x:'ponytail',t:'racer',l:'#1b1d22',c:'#8c55ff'}],
 ['Max',{h:'beard',x:'cap',t:'hoodie',l:'#c9a66b',c:'#ff7a1c'}],['Lena',{h:'lashes',x:'long',t:'logo',l:'#f2f2f2',c:'#36d17a'}],['Doc',{h:'glasses',x:'short',t:'plain',l:'#1b1d22',c:'#2f7bff'}],
 ['Rex',{h:'grin',x:'spiky',t:'jacket',l:'#1b1d22',c:'#ffd12c'}],['Kim',{h:'smirk',x:'bun',t:'stripes',l:'#8a8f99',c:'#2f7bff'}],['Sam',{h:'beard',x:'beanie',t:'stripes',l:'#1c2c55',c:'#e01e2b'}]];
const GAR_HC={short:'#5a3a1e',long:'#e0b020',ponytail:'#7a3a12',bun:'#1b1d22',spiky:'#c4281c',beanie:null};
const GAR_tc=f=>f.t==='suit'?'#1b1d22':f.t==='police'?'#1c2c55':f.t==='armor'?'#c9ced6':f.t==='jacket'?'#2a2320':f.c;
// raw figure in figure units (1 u ≈ 32.5 mm, origin between the feet, face towards -z); sit = seated with arms on a wheel at GAR_W
const GAR_W={y:.6,z:-.3,x:.115};
function GAR_fig(f,M,L,sit,lo){const sk='#ffd84a',c=f.c,dk='#1b1d22',P=M,Q=L,V=THREE.Vector3,B=(x0,x1,y0,y1,z0,z1,cl,k)=>P.push(GB_box(x0,x1,y0,y1,z0,z1,cl,k)),tc=GAR_tc(f),RH=.145,HY=.9;
 // legs + hips (seated: thighs forward, shins down)
 B(-.235,.235,.36,.44,-.12,.12,f.l);
 for(const sx of[-1,1]){const x0=sx<0?-.235:.01,x1=sx<0?-.01:.235;if(sit&&lo){B(x0,x1,.29,.43,-.5,-.02,f.l);B(x0,x1,.29,.5,-.58,-.5,f.l)}else if(sit){B(x0,x1,.3,.42,-.4,-.02,f.l);B(x0,x1,.02,.36,-.4,-.28,f.l);B(x0,x1,0,.06,-.45,-.28,f.l)}else{B(x0,x1,.06,.36,-.11,.11,f.l);B(x0,x1,0,.06,-.14,.11,f.l)}}
 // torso: trapezoid, top 3/4 as wide as the bottom
 P.push(GB_shape(GB_box(-.235,.235,.44,.86,-.12,.12,tc),(x,y,z)=>y>.6?[x*.76,y,z]:null));
 const F=-.124,dec=(x0,x1,y0,y1,cl,k)=>B(x0,x1,y0,y1,F-.006,F+.002,cl,k);
 if(f.t==='racer'){dec(-.035,.035,.44,.86,'#f4f4f4');dec(-.2,-.15,.44,.62,'#f4f4f4');dec(.1,.16,.72,.78,'#fac80a')}else if(f.t==='hoodie'){dec(-.12,.12,.48,.58,'#222831');dec(-.02,-.01,.7,.84,'#f4f4f4');dec(.01,.02,.7,.84,'#f4f4f4');P.push(GB_col(new THREE.TorusGeometry(.13,.035,6,14).rotateX(Math.PI/2).translate(0,.86,.01),c))}
 else if(f.t==='logo'){P.push(GB_col(new THREE.CircleGeometry(.08,14).rotateY(Math.PI).translate(0,.67,F-.007),'#f4f4f4'));P.push(GB_col(new THREE.CircleGeometry(.045,10).rotateY(Math.PI).translate(0,.67,F-.009),c))}
 else if(f.t==='suit'){P.push(GB_col(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute([.09,.86,F-.006,-.09,.86,F-.006,0,.6,F-.006],3)).computeVertexNormals(),'#f4f4f4'));dec(-.02,.02,.6,.84,'#d01712')}
 else if(f.t==='police'){dec(.05,.14,.72,.8,'#ffd12c');dec(-.21,.21,.48,.53,'#f4f4f4');dec(-.15,-.06,.74,.78,'#f4f4f4')}else if(f.t==='flames'){dec(-.2,-.06,.44,.64,'#ff8a2a');dec(.04,.2,.44,.6,'#fac80a');dec(-.06,.04,.44,.54,'#ff5a1a')}
 else if(f.t==='armor'){dec(-.15,.15,.56,.82,c);dec(-.03,.03,.5,.84,'#f4f4f4')}else if(f.t==='stripes'){for(const y of[.5,.6,.7])dec(-.21+(y-.5)*.15,.21-(y-.5)*.15,y,y+.045,'#f4f4f4')}
 else if(f.t==='jacket'){dec(-.01,.01,.46,.86,'#9aa0a8');dec(-.13,-.04,.66,.86,'#3b3330');dec(.04,.13,.66,.86,'#3b3330');dec(-.09,.09,.76,.86,c)}
 // arms (shoulder → hand, tapered), C-shaped hands
 const arm=(S,H)=>{const d=new V().subVectors(H,S),n=d.length(),q=new THREE.Quaternion().setFromUnitVectors(new V(0,-1,0),d.clone().normalize());
  const a=GB_col(new THREE.CylinderGeometry(.062,.05,n-.04,8).translate(0,-(n-.04)/2,0),tc);a.applyQuaternion(q);a.translate(S.x,S.y,S.z);P.push(a);
  const sh=GB_col(new THREE.SphereGeometry(.066,8,6),tc);sh.translate(S.x,S.y,S.z);P.push(sh);
  const w=GB_col(new THREE.CylinderGeometry(.03,.03,.05,6).translate(0,-.025,0),sk);w.applyQuaternion(q);const wp=S.clone().addScaledVector(d,(n-.05)/n);w.translate(wp.x,wp.y,wp.z);P.push(w);
  const h=GB_col(new THREE.TorusGeometry(.04,.02,5,10,Math.PI*1.45).rotateZ(Math.PI*.775).rotateY(Math.PI/2),sk);if(sit)h.rotateX(.45);h.translate(H.x,H.y,H.z);P.push(h)};
 for(const sx of[-1,1]){const S=new V(sx*.215,.8,0);arm(S,sit?new V(sx*GAR_W.x,GAR_W.y,GAR_W.z):new V(sx*.25,.53,-.08))}
 // neck, round head (lathe), stud
 P.push(GB_cyl(.075,.05,0,.86,0,sk,10));
 P.push(GB_col(new THREE.LatheGeometry([[0,0],[.12,0],[.14,.015],[RH,.04],[RH,.24],[.14,.265],[.12,.28],[0,.28]].map(([r,y])=>new THREE.Vector2(r,y)),16).translate(0,HY,0),sk));
 P.push(GB_cyl(.085,.05,0,HY+.28,0,sk,12));
 // face print wrapped on the cylinder (thin slices follow the curve)
 const D=(x0,x1,y0,y1,cl,k)=>{for(let x=x0;x<x1-1e-4;x+=.025){const xb=Math.min(x+.025,x1),m=Math.max(Math.abs(x),Math.abs(xb)),z=-Math.sqrt(Math.max(1e-4,RH*RH-m*m));(k?Q:P).push(GB_box(x,xb,HY+y0,HY+y1,z-.005,z+.012,cl,k))}},
  dot=(x,y,rx,ry,cl,dz=0)=>{const z=-Math.sqrt(RH*RH-x*x)-.004-dz,g=GB_col(new THREE.CircleGeometry(1,12).scale(rx,ry,1).rotateY(Math.PI),cl);g.rotateY(-Math.asin(x/RH));g.translate(x,HY+y,z);P.push(g)},
  eye=(x,y=.15)=>{dot(x,y,.019,.026,dk);dot(x-.006,y+.009,.006,.007,'#f4f4f4',.002)};
 if(f.h==='shades'){D(-.12,.12,.13,.175,dk);D(-.1,-.06,.155,.165,'#5a6a80')}else if(f.h==='visor')D(-.13,.13,.12,.18,'#22e4ff',2.4);
 else if(f.h==='wink'){eye(-.05);D(.03,.075,.145,.155,dk)}else if(f.h==='glasses'){eye(-.05);eye(.05);D(-.085,-.015,.18,.19,dk);D(.015,.085,.18,.19,dk);D(-.085,-.015,.11,.12,dk);D(.015,.085,.11,.12,dk);D(-.015,.015,.155,.165,dk)}
 else{eye(-.05);eye(.05)}
 if(f.h==='lashes'){D(-.075,-.025,.18,.19,dk);D(.025,.075,.18,.19,dk)}
 if(f.h==='angry'){D(-.08,-.02,.195,.21,dk);D(.02,.08,.195,.21,dk)}
 if(f.h==='shock')D(-.022,.022,.045,.09,dk);else if(f.h==='grin'){D(-.065,.065,.05,.09,dk);D(-.055,.055,.075,.09,'#f4f4f4')}else if(f.h==='lashes'){D(-.04,.04,.065,.085,'#c4281c')}
 else if(f.h==='smirk'){D(-.03,.055,.068,.08,dk);D(.045,.06,.078,.095,dk)}else if(f.h==='beard'){D(-.1,.1,.02,.075,'#5a3a1e');D(-.035,.035,.075,.085,dk)}else{const a=Math.PI*.62,g=GB_col(new THREE.TorusGeometry(.05,.0075,4,12,a).rotateZ(-Math.PI/2-a/2),dk);g.translate(0,HY+.12,-RH+.001);P.push(g)}
 if(f.h==='freckle')for(const sx of[-1,1])for(const dx of[0,.02])D(sx*.085+dx-.01,sx*.085+dx-.003,.1,.108,'#d07a2a');
 // hair / headgear. shell = part-sphere that leaves the face open (front sector cut below the brow)
 const shell=(r,cy,cl,thB,thF=.36,open=1.05)=>{P.push(GB_col(new THREE.SphereGeometry(r,16,6,0,Math.PI*2,0,Math.PI*thF).translate(0,cy,0),cl));
  const b=GB_col(new THREE.SphereGeometry(r,14,5,Math.PI*1.5+open,Math.PI*2-2*open,Math.PI*thF,Math.PI*(thB-thF)).translate(0,cy,0),cl);P.push(b);P.push(GB_mirX(b.clone()))},
  hc=GAR_HC[f.x]||'#5a3a1e',x=f.x;
 if(x==='helmet'){shell(.19,HY+.17,c,.74,.33,1.0);B(-.016,.016,HY+.3,HY+.37,-.12,.15,'#f4f4f4');
  const v=GB_col(new THREE.SphereGeometry(.2,12,3,Math.PI*1.5-1.15,2.3,Math.PI*.16,Math.PI*.17).translate(0,HY+.17,0),'#26324a');P.push(v);P.push(GB_mirX(v.clone()));
  for(const sx of[-1,1])P.push(GB_cyl(.035,.03,sx*.19,HY+.26,-.02,'#c9ced6',8).rotateZ(sx*Math.PI/2).translate(0,0,0))}
 else if(x==='short')shell(.155,HY+.17,hc,.62,.3,1.25);
 else if(x==='long'){shell(.158,HY+.17,hc,.64,.3,1.2);B(-.16,.16,HY-.12,HY+.18,.04,.165,hc);for(const sx of[-1,1])B(sx*.16-.035,sx*.16+.035,HY-.06,HY+.2,-.06,.12,hc)}
 else if(x==='ponytail'){shell(.155,HY+.17,hc,.62,.3,1.25);P.push(GB_col(new THREE.SphereGeometry(.06,8,6).scale(1,1.6,1).translate(0,HY+.12,.2),hc));P.push(GB_cyl(.03,.04,0,HY+.2,.16,'#e01e2b',8))}
 else if(x==='bun'){shell(.155,HY+.17,hc,.62,.3,1.25);P.push(GB_col(new THREE.SphereGeometry(.075,10,7).translate(0,HY+.33,.06),hc))}
 else if(x==='spiky'){shell(.155,HY+.17,hc,.6,.3,1.25);for(let i=0;i<7;i++){const a=(i/7-.5)*2.4;P.push(GB_col(new THREE.ConeGeometry(.045,.13,6).rotateX(.5).translate(Math.sin(a)*.09,HY+.33,.05+Math.cos(a)*.05-.06),hc))}}
 else if(x==='beanie'){shell(.16,HY+.15,c,.58,.34,1.35);P.push(GB_col(new THREE.TorusGeometry(.15,.025,5,16).rotateX(Math.PI/2).translate(0,HY+.2,0),c));P.push(GB_col(new THREE.SphereGeometry(.04,8,6).translate(0,HY+.34,0),'#f4f4f4'))}
 else if(x==='cap'){P.push(GB_cyl(.155,.08,0,HY+.22,0,c,16));P.push(GB_col(new THREE.SphereGeometry(.155,16,4,0,Math.PI*2,0,Math.PI/2).scale(1,.5,1).translate(0,HY+.3,0),c));B(-.11,.11,HY+.22,HY+.245,-.29,-.1,c)}
 else if(x==='cowboy'){P.push(GB_cyl(.3,.025,0,HY+.22,0,'#7a4a22',18));P.push(GB_cyl(.15,.16,0,HY+.24,0,'#7a4a22',14));P.push(GB_cyl(.153,.03,0,HY+.25,0,'#2a1a0e',14))}
 else if(x==='mohawk')B(-.03,.03,HY+.24,HY+.42,-.12,.15,'#ff2d95');
 else if(x==='crown'){P.push(GB_cyl(.16,.08,0,HY+.25,0,'#f5c20c',16));for(let i=0;i<6;i++){const a=i/6*Math.PI*2;B(Math.sin(a)*.14-.022,Math.sin(a)*.14+.022,HY+.33,HY+.4,Math.cos(a)*.14-.022,Math.cos(a)*.14+.022,'#f5c20c')}}}
// GB_figGeo keeps its old contract (sit: scaled 1.5 and moved into the old cockpit origin) for callers that undo it
GB_figGeo=function(f,M,L,sit){const P=[],Q=[];GAR_fig(f,P,Q,sit);const s=sit?1.5*(typeof SC_S!=='undefined'&&SC_S&&SC_S.drv?SC_K.drv:1):1,tf=g=>{g.scale(s,s,s);if(sit)g.translate(0,.74-.42*s,-1.55)};for(const g of P){tf(g);M.push(g)}for(const g of Q){tf(g);L.push(g)}};
// 'drv' piece: seat + seated driver + own steering wheel at the hands (k = driver scale in the car, unchanged from live)
const GAR_K=1.95,GAR_TY=.26,GAR_TZ=.06;
function GAR_wheel(M,TY=GAR_TY){const k=GAR_K,cy=GAR_W.y*k+TY,cz=GAR_W.z*k+GAR_TZ-.04,R=GAR_W.x*k+.01,t=.5,put=g=>{g.rotateX(t);g.translate(0,cy,cz);M.push(g)};
 put(GB_col(new THREE.TorusGeometry(R,.045,6,20),'#202428'));put(GB_col(new THREE.CylinderGeometry(.09,.09,.06,10).rotateX(Math.PI/2),'#c9ced6'));
 for(const a of[0,Math.PI*2/3,Math.PI*4/3]){const s=GB_box(-.025,.025,0,R,-.015,.015,'#202428');s.rotateZ(a+Math.PI);put(s)}
 const col=GB_col(new THREE.CylinderGeometry(.05,.05,.7,8).translate(0,-.35,0).rotateX(-t-1.15),'#2a2f36');col.translate(0,cy,cz+.03);M.push(col)}
GB_PC.drvL=Object.assign({},GB_PC.drv,{hide:1});GB_PC.drvLR=Object.assign({},GB_PC.drv,{hide:1});
GB_piece=(f=>function(t,c,M,L){if(t!=='drv'&&t!=='drvR'&&t!=='drvL'&&t!=='drvLR'&&t!=='stw')return f(t,c,M,L);const P=GB_PC[t];if(!P)return;const W=P.w*GB_U,D=P.d*GB_U,col=GB_BC[c]||c,lo=t==='drvL'||t==='drvLR',TY=GAR_TY-(lo?.65:0);if(lo&&typeof CR_LO!=='undefined'&&CR_LO)return; // LOD builds drop drivers (they filter 'drv'/'drvR' by name)

 if(t==='stw'){M.push(CR_bb(-.12,.12,0,.2,-.1,.1,CR_K));return} // the wheel now comes with the driver (drv), so the old wheel would float in front of the hands
 const fg=t==='drvR'||t==='drvLR'?GAR_riv(col):GB_figGet(),tm=[],tl=[];GAR_fig(fg,tm,tl,true,lo);
 for(const[A,B]of[[tm,M],[tl,L]])for(const g of A){g.scale(GAR_K,GAR_K,GAR_K);g.translate(0,TY,GAR_TZ);B.push(g)}
 M.push(CR_bb(-W/2+.15,W/2-.15,0,Math.max(.12,TY+.36*GAR_K),-D/2+.12,D/2-.1,CR_K));M.push(CR_bb(-W/2+.2,W/2-.2,.25,lo?1.4:2.0,D/2-.32,D/2-.08,CR_K));GAR_wheel(M,TY)})(GB_piece);
// closed-roof cars: the driver sits low with legs forward so the helmet stays under the roof (was poking through on rivals' coupés)
CR_car=(f=>function(o){return f(o).map(e=>e[0]==='drv'?['drvL',...e.slice(1)]:e)})(CR_car);
CR_rivB=(f=>{const C={};return function(team){const A=f(team);if(!A)return A;const id=team.id;return C[id]&&C[id].src===A?C[id].v:(C[id]={src:A,v:A.map(b=>b.t==='drvL'?Object.assign({},b,{t:'drvLR'}):b)}).v}})(CR_rivB);
// rivals: helmet in their team colour, but different faces so the grid is not 8 clones
function GAR_riv(col){const h=[...String(col)].reduce((a,ch)=>a*31+ch.charCodeAt(0)|0,7)>>>0,F=['grin','smile','angry','shades','smirk','lashes','beard','glasses'];return{c:col,t:'racer',x:'helmet',h:F[h%F.length],l:'#1b1d22'}}
// portrait (2D) with the new options; same cache as before
GB_portrait=(f0=>function(f){f=f||GB_figGet();const k='g1'+JSON.stringify(f);if(GB_PT[k])return GB_PT[k];
 const nx=['ponytail','bun','spiky','beanie'].includes(f.x),nh=['lashes','beard','glasses','smirk'].includes(f.h),nt=['stripes','jacket'].includes(f.t);
 const base=f0(Object.assign({},f,nx?{x:'none'}:{},nh?{h:f.h==='glasses'||f.h==='lashes'?'smile':'smile'}:{},nt?{t:'plain'}:{}));
 if(!nx&&!nh&&!nt&&f.x!=='helmet')return GB_PT[k]=base;
 const[c,g]=cv(96,96),R=(x,y,w,h,cl)=>{g.fillStyle=cl;g.fillRect(x,y,w,h)},dk='#1b1d22',im=new Image();im.src=base;
 const draw=()=>{g.drawImage(im,0,0);const tc=GAR_tc(f),hc=GAR_HC[f.x]||'#5a3a1e';
  if(f.t==='stripes')for(let i=0;i<3;i++)R(32,68+i*9,32,3,'#f4f4f4');else if(f.t==='jacket'){R(36,62,10,34,'#3b3330');R(50,62,10,34,'#3b3330');R(46,62,4,34,'#9aa0a8')}
  if(f.x==='helmet'){R(30,24,36,7,'#26324a')}
  if(f.h==='lashes'){R(36,33,8,2,dk);R(52,33,8,2,dk);R(42,46,12,3,'#c4281c')}else if(f.h==='beard'){R(32,44,32,14,'#5a3a1e');R(42,47,12,2,dk)}
  else if(f.h==='glasses'){g.strokeStyle=dk;g.lineWidth=2;g.strokeRect(34,32,12,10);g.strokeRect(50,32,12,10);R(46,36,4,2,dk)}else if(f.h==='smirk'){R(45,46,12,3,'#ffd84a');R(44,47,12,2,dk);R(55,45,3,2,dk)}
  if(f.x==='ponytail'){R(29,20,38,9,hc);R(64,26,8,26,hc)}else if(f.x==='bun'){R(29,20,38,9,hc);g.fillStyle=hc;g.beginPath();g.arc(48,14,8,0,7);g.fill()}
  else if(f.x==='spiky'){R(29,20,38,8,hc);g.fillStyle=hc;for(let i=0;i<5;i++){g.beginPath();g.moveTo(30+i*8,22);g.lineTo(34+i*8,8);g.lineTo(38+i*8,22);g.fill()}}else if(f.x==='beanie'){R(28,16,40,14,f.c);R(27,27,42,4,'#f4f4f4');g.fillStyle='#f4f4f4';g.beginPath();g.arc(48,14,5,0,7);g.fill()}};
 if(im.complete&&im.naturalWidth)draw();else{im.onload=()=>{draw();GB_PT[k]=c.toDataURL();const e=document.getElementById('gbFigImg');if(e&&GB_figGet&&JSON.stringify(GB_figGet())===JSON.stringify(f))e.src=GB_PT[k]};return base}
 return GB_PT[k]=c.toDataURL()})(GB_portrait);
// garage DRIVER tab: 8 ready-made drivers on top; any change rebuilds the driver in the car, 4×4 and boat
function GAR_figSet(F){store.set('mho_gbfig',F);for(const key of['off','boat'])delete CR_VC[key];try{if(typeof GB_refresh==='function')GB_refresh()}catch(e){}try{if(pl&&pl.mesh&&pl.mesh.userData.gbV)CR_attachV(pl.mesh,null),CR_vis(pl,pl.mesh.userData)}catch(e){}}
gbRender=(f=>function(){f();if(GB.tab!=='driver')return;if(GB_.stand)GB_.stand.rotation.y=Math.PI+.5;const B=$('#gbBody'),cur=JSON.stringify(GB_figGet()),okP=F=>Object.keys(F).every(k=>GB_figOk(k,F[k]));
 let h='<h5>DRIVERS</h5><div class="gbRow garPre">';GAR_PRE.forEach(([n,F],i)=>{const ok=okP(F),on=JSON.stringify(Object.assign({},GB_figGet(),F))===cur;h+=`<button class="gbP ${on?'on':''}" ${ok?'':'disabled'} data-gpre="${i}"><img src="${GB_portrait(F)}" alt=""><b>${ok?'':'🔒 '}${n}</b></button>`});h+='</div>';
 const fig=B.querySelector('.gbFig');if(fig)fig.insertAdjacentHTML('afterend',h);else B.insertAdjacentHTML('afterbegin',h);
 B.querySelectorAll('button[data-gpre]').forEach(b=>b.onclick=()=>{const F=GAR_PRE[+b.dataset.gpre][1];if(!okP(F))return;GAR_figSet(Object.assign({},F));try{AU.sfx('pick')}catch(e){}const sc=B.scrollTop;gbRender();$('#gbBody').scrollTop=sc});
 B.querySelectorAll('button[data-fc]').forEach(b=>{const o=b.onclick;b.onclick=()=>{o&&o();GAR_figSet(GB_figGet())}})})(gbRender);
(()=>{const s=document.createElement('style');s.textContent='.garPre .gbP{display:inline-flex;flex-direction:column;align-items:center;gap:2px;min-width:64px}.garPre img{width:44px;height:44px;border-radius:8px}';document.head.appendChild(s)})();
window.__gar={PRE:GAR_PRE,fig:GAR_fig,W:GAR_W,set:GAR_figSet};
window.__gar.grp=(id,i)=>id==='off'?CR_grp(CR_OFF,'off'):id==='boat'?CR_grp(CR_BOAT,'boat'):CR_grp(CR_RIVS[id][i]().map(e=>e[0]==='drv'?['drvR',...e.slice(1)]:e[0]==='drvL'?['drvLR',...e.slice(1)]:e),'gar'+id+i);

// ---------- UPDATES screen (title + pause menu) and a one-time "What's new" toast per version; data: OD_CHANGELOG at the top
{const TC={FIXED:'#3ddc84',NEW:'#4ceaff',CHANGED:'#ffd12c'},esc=t=>String(t).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'})[c]);
 const st=document.createElement('style');st.textContent=`#odUpd{position:fixed;inset:0;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;z-index:9000;display:flex;align-items:center;justify-content:center;background:rgba(10,14,30,.6);padding:10px;box-sizing:border-box}#odUpd[hidden],#odNew[hidden]{display:none}
#odUpd .uc{width:min(640px,100%);max-height:100%;display:flex;flex-direction:column;background:#0b1626;border:3px solid #4ceaff;border-radius:16px;color:#e8f2fa;font:600 13px system-ui;box-shadow:0 8px 0 rgba(0,0,0,.35)}
#odUpd .uh{display:flex;align-items:center;gap:10px;padding:10px 14px;border-bottom:2px solid #1d3550}#odUpd .uh b{font:italic 900 22px var(--hud,system-ui);letter-spacing:.04em}#odUpd .uh small{color:#9fb3c8;font-size:12px}#odUpd .uh button{margin-left:auto;font:900 16px system-ui;min-width:44px;min-height:40px;border-radius:10px;border:2px solid #4ceaff;background:#12304a;color:#fff}
#odUpd .ub{overflow-y:auto;-webkit-overflow-scrolling:touch;padding:6px 14px 12px}#odUpd .uv{margin:8px 0 2px;font:900 15px system-ui;color:#fff}#odUpd .uv span{font-weight:600;font-size:12px;color:#9fb3c8;margin-left:6px}#odUpd .uv.cur{color:#4ceaff}
#odUpd ul{list-style:none;margin:2px 0;padding:0}#odUpd li{display:flex;gap:8px;align-items:baseline;margin:3px 0;line-height:1.35}#odUpd li em{font:900 12px system-ui;letter-spacing:.08em;font-style:normal;padding:2px 6px;border-radius:6px;color:#0b1626;flex:none;min-width:58px;text-align:center}
#odNew{position:fixed;top:48px;right:max(10px,env(safe-area-inset-right));z-index:8999;display:flex;gap:8px;align-items:center;background:#0b1626;border:3px solid #4ceaff;border-radius:999px;padding:4px 6px 4px 14px;color:#fff;font:800 13px system-ui;box-shadow:0 4px 0 rgba(0,0,0,.35)}#odNew button{font:900 13px system-ui;min-height:36px;border-radius:999px;border:2px solid #4ceaff;background:#12304a;color:#fff;padding:0 12px}`;document.head.appendChild(st);
 const ov=document.createElement('div');ov.id='odUpd';ov.hidden=true;document.body.appendChild(ov);
 window.odUpdOpen=()=>{const c=OD_CHANGELOG[0];let h=`<div class="uc"><div class="uh"><b>UPDATES</b><small>${esc(c.v)} · ${esc(c.date)}</small><button id="odUpdX">✕</button></div><div class="ub">`;
  OD_CHANGELOG.slice(0,15).forEach((e,i)=>{h+=`<div class="uv ${i?'':'cur'}">${esc(e.v)}<span>${esc(e.date)}${i?'':' · current'}</span></div><ul>${e.items.map(it=>`<li><em style="background:${TC[it.t]||'#ccc'}">${esc(it.t)}</em><span>${esc(it.s)}</span></li>`).join('')}</ul>`});
  ov.innerHTML=h+'</div></div>';ov.hidden=false;try{localStorage.setItem('mho_seenVer',OD_VER)}catch(e){}const t=document.getElementById('odNew');if(t)t.hidden=true;ov.querySelector('#odUpdX').onclick=()=>{ov.hidden=true;try{AU.sfx('pick')}catch(e){}}};
 ov.addEventListener('pointerdown',e=>{if(e.target===ov)ov.hidden=true});
 // title screen: a footer button; pause menu: a row button (the pause handler ignores unknown data-p)
 {const f=document.querySelector('#home .hfoot');if(f){const b=document.createElement('button');b.id='hfUpd';b.textContent='📰 UPDATES';b.onclick=()=>{try{AU.sfx('pick')}catch(e){}odUpdOpen()};f.appendChild(b)}}
 {const g=document.querySelector('#roamPause .pg'),q=g&&g.querySelector('[data-p="quit"]');if(g){const b=document.createElement('button');b.dataset.p='upd';b.textContent='📰 UPDATES';b.addEventListener('click',()=>odUpdOpen());g.insertBefore(b,q)}}
 // one-time toast on the title screen after a new version (never during driving)
 let seen=null;try{seen=localStorage.getItem('mho_seenVer')}catch(e){}
 if(seen!==OD_VER){const t=document.createElement('div');t.id='odNew';t.hidden=true;t.innerHTML=`<span>New in ${esc(OD_VER)}</span><button id="odNewGo">SEE</button><button id="odNewX">✕</button>`;document.body.appendChild(t);
  t.querySelector('#odNewGo').onclick=()=>odUpdOpen();t.querySelector('#odNewX').onclick=()=>{t.hidden=true;try{localStorage.setItem('mho_seenVer',OD_VER)}catch(e){}};
  const chk=()=>{const m=document.getElementById('menu'),on=m&&!m.hidden&&window.__mho&&__mho.state==='menu';if(!document.getElementById('odNew'))return;t.hidden=!on||(localStorage.getItem('mho_seenVer')===OD_VER);setTimeout(chk,700)};setTimeout(chk,700)}
 window.__upd={open:()=>odUpdOpen(),ver:OD_VER,log:OD_CHANGELOG}}

roamPose=(f=>function(s,dt){f(s,dt);try{if(!C26.on||s!==pl||state!=='roam')return;const ud=s.mesh&&s.mesh.userData;if(!ud||!ud.m||!ud.gbM)return;
  if(s.air||(s.boatK||0)>.5||RO.wk){RO.c26p=null;C26_lean(ud,0,0);return}C26_body(RO,RO.c26aL||0,-(RO.c26lat||0),Math.min(dt||0,.1),false);C26_lean(ud,RO.c26p,RO.c26r)}catch(e){}})(roamPose);
window.__cr26={C26,get TD(){return TD},kAt:d=>kAt(TD,d),get ships(){return ships},get traffic(){return traffic},get MARGIN(){return MARGIN}};
