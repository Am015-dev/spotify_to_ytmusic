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
// ---------- GAR2: vehicle sets (street + off-road + boat, swapped by terrain) in rarity tiers, and visible upgrades
// GAR_gt: 8-wide Speed-Champions-style supercar, low, curved hood with stripes, raked screen, side intakes, diffuser, wing
function GAR_gt(o={}){const A=[],B=o.body||'#0055bf',S=o.acc||'#f4f4f4',K=CR_K,add=(t,x,z,r,c,y)=>{CR_reg(t);A.push([t,x,z,r,c,y])},
 sym=(t,x,z,r,c,y)=>{CR_reg(t);const fw=(r%2?GB_PC[t].d:GB_PC[t].w);add(t,x,z,r,c,y);if(x!==-x-fw)add(t,-x-fw,z,(4-r)%4,c,y)},wh=o.wh||'wL',wy=(.12-CR_WH[wh].r)/GB_PH;
 add('T6x16',-3,-8,0,K,0);sym('T1x6',-4,-3,0,K,0);sym('T1x1',-4,-8,0,K,0);sym('T1x1',-4,7,0,K,0);
 for(const z of[-7,3]){sym('arch',-4,z,0,B,0);sym(wh,-4,z,0,K,wy)}
 // nose: headlights, black intake, low curved lip, curved hood with twin stripes
 sym('hl',-4,-8,0,B,1);sym('B1x1',-3,-8,0,K,1);add('grl',-2,-8,1,K,1);add('grl',0,-8,1,K,1);add('C8x1',-4,-8,0,B,4);
 add('B4x4',-2,-7,0,K,1);sym('cs14',-2,-7,0,B,4);sym('cs14',-1,-7,0,S,4);
 // flanks: doors, side intake, sill stripe
 sym('B1x6',-4,-3,0,B,1);sym('grl',-4,1,0,K,3);sym('T1x6',-4,-3,0,S,4);sym('T1x6',-4,-3,0,B,5);
 // cabin: floor, driver (seat + wheel), raked screen, roof with stripes
 add('T6x6',-3,-3,0,K,1);add('drvL',-1,-1,0,B,2);
 if(o.bubble){add('T6x6',-3,-3,0,K,6);add('bubble',-2,-2,0,o.glass||B,6)}else{add('ws6',-3,-3,0,B,6);add('ws6',-3,0,2,B,6);add('T6x2',-3,-1,0,B,11);sym('T1x2',-1,-1,0,S,12)}
 // rear deck: engine cover, intakes, tail lights, diffuser, pipes
 add('T4x4',-2,3,0,K,3);sym('cs14',-2,3,2,B,4);sym('cs14',-1,3,2,S,4);
 sym('tl',-4,7,2,B,1);sym('B1x1',-3,7,0,B,1);add('B4x1',-2,7,0,K,1);add('C8x1',-4,7,2,B,4);add('diff',-2,8,0,K,0);
 if(!o.noWing)add(o.big?'wing':'spoiler',o.big?-4:-3,5,0,o.wing||K,o.big?5:6);sym('mir',-4,-3,0,B,6);add('lp',-1,-9,0,K,1);add('lp',-1,8,2,K,3);
 for(const e of o.x||[])add(...e);return A}
window.__gar.gt=GAR_gt;window.__gar.grpA=(A,key)=>CR_grp(A,key||('garA'+Math.random()));
// ---- vehicle sets: each = street + off-road + boat, swapped by terrain (LEGO 2K Drive style). Rarity tiers are this game's own.
CK.push('mho_gar');
const GAR_TIER={c:['COMMON','#9aa3b0'],r:['RARE','#2f9bff'],e:['EPIC','#b05cff'],l:['LEGENDARY','#ffb000']};
const GAR_SETS=[
 {id:'rod',n:'Hot Rod',tier:'c',req:null,car:()=>CR_ROD,off:()=>CR_OFF,boat:()=>CR_BOAT,
  load:{car:{name:'HOT ROD',k:'Street',st:{top:1.05,acc:1.04,han:.98,hull:1},w:'Medium',perk:'slip'},'4x4':{name:'GUACAMONSTER',k:'Off-road',st:{top:.96,acc:1.01,han:.97,hull:1.12},w:'Heavy',perk:'heal'},boat:{name:'AEGEAN',k:'Water',st:{top:1.02,acc:1.05,han:1.04,hull:.95},w:'Light',perk:'refill'}}},
 {id:'ebbel',n:'Ebbelwoi Express',tier:'r',req:{cost:3000},car:()=>CR_car({body:'#2f7d3a',acc:'#f4f4f4',wing:'#f4f4f4',wh:'wL'}),off:()=>CR_buggy({body:'#2f7d3a',acc:'#f4f4f4'}),boat:()=>CR_boat({hull:'#f4f4f4',body:'#2f7d3a',acc:'#ffd12c'}),
  load:{car:{name:'EBBELWOI GT',k:'Street',st:{top:1.04,acc:1.06,han:1.02,hull:.98},w:'Light',perk:'start'},'4x4':{name:'APFEL BUGGY',k:'Off-road',st:{top:1,acc:1.05,han:1.03,hull:1},w:'Light',perk:'drift'},boat:{name:'MAIN FERRY',k:'Water',st:{top:1.02,acc:1.04,han:1.05,hull:1},w:'Light',perk:'refill'}}},
 {id:'posei',n:'Poseidon GT',tier:'e',req:{stars:15},car:()=>GAR_gt({body:'#0055bf',acc:'#f4f4f4'}),off:()=>CR_monster({body:'#0055bf',acc:'#f4f4f4'}),boat:()=>CR_boat({style:'cat',hull:'#f4f4f4',body:'#0055bf',acc:'#22c5e4'}),
  load:{car:{name:'POSEIDON GT',k:'Street',st:{top:1.07,acc:1.04,han:1.04,hull:1},w:'Medium',perk:'slip'},'4x4':{name:'TRITON CRUSHER',k:'Off-road',st:{top:.98,acc:1.02,han:1,hull:1.14},w:'Super Heavy',perk:'armor'},boat:{name:'TRIDENT CAT',k:'Water',st:{top:1.06,acc:1.04,han:1.05,hull:.98},w:'Medium',perk:'shield'}}},
 {id:'gold',n:'Goldrausch',tier:'l',req:{stars:30},car:()=>GAR_gt({body:'#16121c',acc:'#f5c20c',wing:'#f5c20c',bubble:1,big:1}),off:()=>CR_monster({body:'#16121c',acc:'#f5c20c'}),boat:()=>CR_boat({style:'air',hull:'#16121c',body:'#f5c20c',acc:'#ff1e3c'}),
  load:{car:{name:'GOLDRAUSCH',k:'Street',st:{top:1.08,acc:1.06,han:1.03,hull:1.02},w:'Medium',perk:'luck'},'4x4':{name:'NUGGET',k:'Off-road',st:{top:1,acc:1.04,han:1.01,hull:1.12},w:'Heavy',perk:'heal'},boat:{name:'GOLD RUSH',k:'Water',st:{top:1.07,acc:1.06,han:1.04,hull:.98},w:'Light',perk:'refill'}}}];
const GAR_get=()=>Object.assign({sel:'rod',own:['rod'],up:{},br:{}},store.get('mho_gar',{})),GAR_put=G=>store.set('mho_gar',G);
const GAR_set=id=>GAR_SETS.find(s=>s.id===(id||GAR_get().sel))||GAR_SETS[0];
const GAR_owned=s=>!s.req||GAR_get().own.includes(s.id)||(!s.req.cost&&gbReq(s.req,'veh_'+s.id));
// ---- upgrades: 4 slots × 3 levels, visible parts on every form + small stat perks
const GAR_UP=[['sp','SPOILER','han','Handling'],['ex','EXHAUSTS','acc','Acceleration'],['wh','WHEELS','hull','Health'],['bo','BOOSTER','top','Top speed']],GAR_UPC=[600,1200,2400]; // rims: chrome → gold → red
const GAR_ups=id=>Object.assign({sp:0,ex:0,wh:0,bo:0},GAR_get().up[id||GAR_get().sel]||{});
const GAR_upMul=(u,stat)=>{let m=1;for(const[k,,s]of GAR_UP)if(s===stat)m*=1+(k==='wh'?.03:.02)*(u[k]||0);return m};
// wheel rims: same tyre size (tyre gap unchanged), recoloured rims: c chrome, g gold, r red
const GAR_RIM={c:'#eef3f8',g:'#f5c20c',r:'#e01e2b'};
for(const t of['wS','wM','wL','wXL'])for(const v of['c','g','r']){CR_WH[t+v]=CR_WH[t];GB_PC[t+v]=Object.assign({},GB_PC[t],{hide:1})}
CR_wheel=(f=>function(t){const m=/^(wS|wM|wL|wXL)([cgr])$/.exec(t);if(!m)return f(t);const k='gar'+t+(CR_LO?'lo':'');if(CR_wgeo[k])return CR_wgeo[k];const g=f(m[1]).clone(),C=g.attributes.color,T=new THREE.Color(GAR_RIM[m[2]]),R=new THREE.Color('#c4281c');
 for(let i=0;i<C.count;i++){const r=C.getX(i),gg=C.getY(i),b=C.getZ(i);if(r>.35&&Math.abs(r-gg)<.08&&Math.abs(gg-b)<.1){C.setXYZ(i,T.r,T.g,T.b)}}C.needsUpdate=true;return CR_wgeo[k]=g})(CR_wheel);
// heightmap of a brick list (cells → top plate), ignoring decor that upgrades replace
const GAR_DEC=new Set(['spoiler','wing','pipes','stack','nitro','jet','rocket','fin','flag','ant','siren','sign','roll','bar','crown','horns','lp','mir','drv','drvL','drvR','drvLR','stw','bubble','ws6','ws4']);
function GAR_hm(B){const H={};let z1=-99,x0=99,x1=-99;for(const b of B){const P=GB_PC[b.t];if(!P||CR_WH[b.t])continue;const w=b.r%2?P.d:P.w,d=b.r%2?P.w:P.d;z1=Math.max(z1,b.z+d);x0=Math.min(x0,b.x);x1=Math.max(x1,b.x+w);if(GAR_DEC.has(b.t))continue;
  for(let i=0;i<w;i++)for(let j=0;j<d;j++){const k=(b.x+i)+','+(b.z+j);H[k]=Math.max(H[k]||0,(b.y||0)+P.h)}}
 const top=(xa,xb,za,zb)=>{let m=0;for(let x=xa;x<xb;x++)for(let z=za;z<zb;z++)m=Math.max(m,H[x+','+z]||0);return m};return{z1,x0,x1,top}}
// returns the brick list with upgrade parts swapped in (works on street bricks, 4×4 and boat alike)
function GAR_apply(B,u,form){if(!u||!(u.sp||u.ex||u.wh||u.bo))return B;const sx=GB_BC?null:null,c0=(B.find(b=>!CR_WH[b.t]&&b.t!=='T6x16'&&!/^T/.test(b.t))||{}).c||'#2a2f36';
 let A=B.filter(b=>!(u.sp&&(b.t==='spoiler'||b.t==='wing')));if(u.wh)A=A.map(b=>CR_WH[b.t]&&/^(wS|wM|wL|wXL)$/.test(b.t)?Object.assign({},b,{t:b.t+'cgr'[u.wh-1]}):b);
 const h=GAR_hm(A),z1=h.z1,add=(t,x,z,y,c,r=0)=>{CR_reg(t);A.push({t,x,z,y,r,m:0,c})},K=CR_K,CH='#d8dde4';
 if(u.sp===1)add('spoiler',-3,z1-2,h.top(-3,3,z1-2,z1),c0);else if(u.sp>=2){add('wing',-4,z1-2,h.top(-4,4,z1-2,z1),c0);if(u.sp===3){add('fin',-3,z1-6,h.top(-3,-2,z1-6,z1-3),c0);add('fin',2,z1-6,h.top(2,3,z1-6,z1-3),c0)}}
 if(u.ex===1)add('pipes',-1,z1,1,K);else if(u.ex>=2){for(const x of[-3,2])add('stack',x,z1-3,h.top(x,x+1,z1-3,z1-2),CH);if(u.ex===3&&form!=='boat')for(const x of[h.x0-1,h.x1])add('sidep',x,-3,1,K)}
 if(u.bo===1)add('nitro',-1,z1-6,h.top(-1,1,z1-6,z1-3),K);else if(u.bo===2)for(const x of[-3,1])add('jet',x,z1-6,h.top(x,x+2,z1-6,z1-3),'#f4f4f4');else if(u.bo===3)for(const x of[h.x0-1,h.x1-1])add('rocket',x,z1-8,3,'#ff1e3c');
 return A}
const GAR_arr=A=>A.map(e=>Array.isArray(e)?{t:e[0],x:e[1],z:e[2],r:e[3]%4,c:e[4],y:e[5],m:0}:e);
const GAR_figK=()=>JSON.stringify(GB_figGet());
// player's 4×4 + boat come from the selected set (with its upgrades); rivals unchanged
CR_attachV=(f=>function(g,team){if(team)return f(g,team);const S=GAR_set(),u=GAR_ups(S.id),U=g.userData,host=U.carG||U.m;for(const k in U.gbV||{})host.remove(U.gbV[k]);
 const sig=S.id+JSON.stringify(u)+GAR_figK(),mk=(fm,src)=>{const key='gar|'+fm+'|'+sig;return CR_VC[key]?CR_grp(null,key):CR_grp(GAR_apply(GAR_arr(src()),u,fm).map(b=>[b.t,b.x,b.z,b.r,b.c,b.y]),key)};
 U.gbV={'4x4':mk('off',S.off),boat:mk('boat',S.boat)};for(const k in U.gbV){U.gbV[k].visible=false;host.add(U.gbV[k])}})(CR_attachV);
// street form: upgrades on the player's bricks (not while the brick builder is open: picking uses brick indices) + stat perks
gbTeam=(f=>function(base,b){const t=f(base,b);if(!t||!(b&&b.on))return t;const u=GAR_ups();if(t.gbB&&!(typeof GB_!=='undefined'&&GB_.bk))t.gbB=GAR_apply(t.gbB,u,'car');for(const s of['top','acc','han','hull'])t[s]=(t[s]||1)*GAR_upMul(u,s);t.id=(t.id||'')+'g'+GAR_UP.map(([k])=>u[k]).join('');return t})(gbTeam);
// loadout names/stats/perks follow the selected set
const GAR_L0=JSON.parse(JSON.stringify(CR_LOAD));function GAR_load(){const S=GAR_set();for(const k of['car','4x4','boat'])Object.assign(CR_LOAD[k],JSON.parse(JSON.stringify(S.load[k]||GAR_L0[k])))}GAR_load();
// ---- garage VEHICLES tab: set cards (rarity, lock/buy, select), form preview, upgrades with visible levels
const GAR_={pv:'car'};
function GAR_select(id){const G=GAR_get(),S=GAR_set(id);if(!GAR_owned(S))return;if(GB.d){G.br[G.sel]=JSON.parse(JSON.stringify(GB.d.bricks||[]));GB.d.bricks=(G.br[id]||GAR_arr(S.car())).map(b=>({...b}));GB.d.bp=1;store.set('mho_build',GB.d)}
 G.sel=id;if(!G.own.includes(id))G.own.push(id);GAR_put(G);GAR_load();try{AU.sfx('pick')}catch(e){}}
function GAR_stat(L){const bar=(n,x)=>`<div><span>${n}</span><i><b style="width:${Math.round(Math.max(.08,Math.min(1,(x-.9)/.2))*100)}%"></b></i></div>`,p=PERKS.find(q=>q.id===L.perk)||{};
 return `<div class="garSt"><b>${L.k.toUpperCase()} · ${L.name}</b>${bar('Top speed',L.st.top)}${bar('Acceleration',L.st.acc)}${bar('Handling',L.st.han)}${bar('Health',L.st.hull)}<div><span>Weight</span><em>${L.w}</em></div><div><span>Perk</span><em>${p.icon||''} ${p.name||''}</em></div></div>`}
function GAR_tab(){const B=$('#gbBody'),G=GAR_get(),cur=GAR_set(),u=GAR_ups(cur.id),cr=season().cr;let h=`<div class="gbInfo">🟡 ${cr.toLocaleString('de-DE')} studs · ★ ${totStars()} stars</div><h5>VEHICLES · street, off-road and boat swap automatically</h5><div class="gbRow garSets">`;
 for(const S of GAR_SETS){const own=GAR_owned(S),[tn,tc]=GAR_TIER[S.tier],buy=!own&&S.req&&S.req.cost;h+=`<button class="gbP garSet ${S.id===cur.id?'on':''}" style="--tc:${tc}" ${own||buy?'':'disabled'} data-gset="${S.id}"><em style="color:${tc}">${tn}</em><b>${own?'':buy?'🛒 ':'🔒 '}${S.n}</b><small>${own?(S.id===cur.id?'driving':'tap to drive'):buy?S.req.cost.toLocaleString('de-DE')+' studs':gbReqTxt(S.req)}</small></button>`}
 h+=`</div><h5>PREVIEW</h5><div class="gbRow">${[['car','🚗 STREET'],['4x4','🛻 OFF-ROAD'],['boat','🚤 WATER']].map(([k,n])=>`<button class="gbP ${GAR_.pv===k?'on':''}" data-gpv="${k}"><b>${n}</b></button>`).join('')}</div>${GAR_stat(CR_LOAD[GAR_.pv])}`;
 h+=`<h5>UPGRADES · ${cur.n.toUpperCase()} (shown on all three forms)</h5><div class="gbRow">`;
 for(const[k,n,s,sn]of GAR_UP){const l=u[k],nx=l<3?GAR_UPC[l]:0,pips='●'.repeat(l)+'○'.repeat(3-l);h+=`<button class="gbP garUp" ${l<3?'':'disabled'} data-gup="${k}"><b>${n} <span class="garPip">${pips}</span></b><small>${sn} +${Math.round((GAR_upMul({[k]:l},s)-1)*100)}%${l<3?` · next ${nx.toLocaleString('de-DE')} studs`:' · MAX'}</small></button>`}
 h+='</div>';B.innerHTML=h;
 B.querySelectorAll('[data-gset]').forEach(b=>b.onclick=()=>{const S=GAR_set(b.dataset.gset);if(!GAR_owned(S)){if(!(S.req&&S.req.cost))return;const S2=season();if(S2.cr<S.req.cost){b.querySelector('small').textContent='need '+(S.req.cost-S2.cr).toLocaleString('de-DE')+' more studs';try{AU.sfx('bump')}catch(e){}return}S2.cr-=S.req.cost;saveSeason(S2);const G=GAR_get();G.own.push(S.id);GAR_put(G)}GAR_select(S.id);gbRender()});
 B.querySelectorAll('[data-gpv]').forEach(b=>b.onclick=()=>{GAR_.pv=b.dataset.gpv;gbRender()});
 B.querySelectorAll('[data-gup]').forEach(b=>b.onclick=()=>{const k=b.dataset.gup,G=GAR_get(),id=G.sel,l=GAR_ups(id)[k];if(l>=3)return;const c=GAR_UPC[l],S2=season();if(S2.cr<c){b.querySelector('small').textContent='need '+(c-S2.cr).toLocaleString('de-DE')+' more studs';try{AU.sfx('bump')}catch(e){}return}
  S2.cr-=c;saveSeason(S2);G.up[id]=Object.assign(GAR_ups(id),{[k]:l+1});GAR_put(G);try{AU.sfx('brick')}catch(e){}const sc=B.scrollTop;gbRender();$('#gbBody').scrollTop=sc})}
function GAR_pvApply(){const m=GB.mesh;if(!m)return;const ud=m.userData;if(GB.tab!=='veh'||!ud.gbV)return;const v=GAR_.pv;for(const o of ud.gbM||[])o.visible=v==='car';for(const k in ud.gbV)ud.gbV[k].visible=k===v}
gbRender=(f=>function(){if(GB.tab!=='veh')return f();const t0=GB.tab;GB.tab='parts';f();GB.tab=t0;document.querySelectorAll('#gbx .gbTabs button').forEach(b=>b.classList.toggle('on',b.dataset.t==='veh'));GAR_tab();GAR_pvApply()})(gbRender);
gbOpen=(f=>function(){GAR_load();return f.apply(this,arguments)})(gbOpen);
{const tabs=$('#gbx .gbTabs'),b=document.createElement('button');b.dataset.t='veh';b.textContent='RIDES';b.onclick=()=>{GB.tab='veh';gbRender()};tabs.insertBefore(b,tabs.firstChild);
 const st=document.createElement('style');st.textContent='.garSet{border-color:var(--tc)!important;min-width:118px}.garSet em{font:900 9px system-ui;letter-spacing:.14em;font-style:normal}.garPip{color:#ffd12c;letter-spacing:1px}.garSt{display:grid;gap:3px;font:600 12px system-ui;color:#dfe9f2;margin:4px 0}.garSt>div{display:grid;grid-template-columns:96px 1fr;gap:6px;align-items:center}.garSt i{height:7px;background:#203040;border-radius:4px;overflow:hidden}.garSt i b{display:block;height:100%;background:linear-gradient(90deg,#22e4ff,#5dffb0)}.garSt em{font-style:normal;color:#ffd12c}#gbx .gbTabs{flex-wrap:wrap}';document.head.appendChild(st)}
Object.assign(window.__gar,{SETS:GAR_SETS,get:GAR_get,select:GAR_select,ups:GAR_ups,apply:GAR_apply,load:GAR_load,tab:()=>GAR_tab()});
window.__gar.cheat=(cr,st)=>{const S=season();S.cr=cr;saveSeason(S);if(st!=null)store.set('mho_stars',{gar_test:st})};

// ---- v87c: SMASH!/hit pop-ups never cover the tutorial card (move above it, or below when there is no room)
(()=>{const PAD=8,fit=el=>{try{el.style.removeProperty('top');if(!el.classList.contains('on'))return;const t=document.getElementById('roamTut');if(!t||t.hidden||!t.getClientRects().length)return;
  const T=t.getBoundingClientRect(),h=el.offsetHeight,w=el.offsetWidth,ju=el.id==='juPop',pt=el.offsetParent?el.offsetParent.getBoundingClientRect().top:0,cy=pt+el.offsetTop+(ju?0:h/2),hh=h*.63,hw=w*.63,cx=innerWidth/2;
  const hit=c=>c-hh-30<T.bottom+PAD&&c+hh>T.top-PAD&&cx-hw<T.right+PAD&&cx+hw>T.left-PAD;if(!hit(cy))return;
  let c=T.top-PAD-hh;if(c-hh-30<40)c=T.bottom+PAD+hh+30;el.style.setProperty('top',(c-pt-(ju?0:h/2))+'px','important')}catch(e){}};
 const obs=new MutationObserver(R=>{for(const r of R)if(r.target.id==='hitPop'||r.target.id==='juPop')fit(r.target)}),watch=el=>{if(el&&!el.__nit){el.__nit=1;obs.observe(el,{attributes:true,attributeFilter:['class']})}};
 watch(document.getElementById('hitPop'));new MutationObserver(()=>watch(document.getElementById('juPop'))).observe(document.body,{childList:true});watch(document.getElementById('juPop'))})();

/*ART<art8.js>*/// ==== ART pART8 · crisp car-shaped sun shadows (player, AI, race and city traffic), LEGO 2K Drive style.
// Each car mesh gets a shadow twin (same geometry) whose vertices are projected along the sun direction onto the car's ground plane
// (through the tyre contact points, normal = the car's up axis). One flat dark silhouette per car: the stencil stops overlapping
// parts (body, wheels, glass) and neighbouring cars from darkening twice. Only cars within ~70 m of the camera draw one.
// The ART6 tyre patches stay on top as contact darkening.
const ART8={tri:{ab:0,ps:0},L:{value:new THREE.Vector3(.45,-.75,.35).normalize()},op:.6,far:70,cars:new Set(),ims:[]};
const ART8_VS=`uniform vec3 uL;uniform vec3 uP0;uniform vec3 uN;uniform float uGy;uniform float uFar;
void main(){mat4 M=modelMatrix;vec3 n=uN,p0=uP0;
#ifdef USE_INSTANCING
 M=M*instanceMatrix;vec3 up=mat3(M)*vec3(0.,1.,0.);if(dot(up,up)<1e-8){gl_Position=vec4(2.,2.,2.,1.);return;}n=normalize(up);p0=(M*vec4(0.,uGy,0.,1.)).xyz;
#endif
 if(distance(p0,cameraPosition)>uFar){gl_Position=vec4(2.,2.,2.,1.);return;}
 vec4 w=M*vec4(position,1.);float d=min(dot(n,uL),-.35);w.xyz+=uL*(dot(p0-w.xyz,n)/d)+n*.07;gl_Position=projectionMatrix*viewMatrix*w;}`;
const ART8_FS=`uniform float uOp;void main(){gl_FragColor=vec4(0.,0.,0.,uOp);}`;
function ART8_mat(gy){return new THREE.ShaderMaterial({uniforms:{uL:ART8.L,uP0:{value:new THREE.Vector3()},uN:{value:new THREE.Vector3(0,1,0)},uGy:{value:gy||0},uFar:{value:ART8.far},uOp:{value:ART8.op}},
  vertexShader:ART8_VS,fragmentShader:ART8_FS,side:THREE.DoubleSide,transparent:true,depthWrite:false,fog:false,toneMapped:false,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-16,
  stencilWrite:true,stencilRef:1,stencilFunc:THREE.NotEqualStencilFunc,stencilZPass:THREE.ReplaceStencilOp,stencilFail:THREE.KeepStencilOp,stencilZFail:THREE.KeepStencilOp})}
const ART8_skip=o=>{const m=o.material;if(!m||Array.isArray(m))return false;return m.blending===THREE.AdditiveBlending||(m.transparent&&m.opacity<.3&&!m.vertexColors)||o.userData.art6||o.userData.keep};
const ART8_lock=(o,k,v)=>Object.defineProperty(o,k,{configurable:true,get:typeof v==='function'?v:()=>v,set(){}});
// a shadow twin under every visible part of a ship-style car (player, AI racers, garage cars)
function ART8_car(s){if(!s||!s.mesh)return;if(!s.a8m)s.a8m=ART8_mat(0);const m=()=>s.a8m;
  s.mesh.traverse(o=>{if(!o.isMesh||o.isInstancedMesh||o.userData.a8s||o.userData.a8d||!o.geometry||!o.geometry.attributes.position)return;o.userData.a8d=1;if(ART8_skip(o))return;
    const t=new THREE.Mesh(o.geometry);t.userData.a8s=1;ART8_lock(t,'material',m);ART8_lock(t,'castShadow',false);ART8_lock(t,'receiveShadow',false);t.frustumCulled=false;t.renderOrder=1;t.raycast=()=>{};o.add(t)});ART8.cars.add(s)}
// shadow twins of instanced traffic: same geometry, own 16-slot instance buffer filled each frame with the cars near the camera only
// (the traffic pools hold hundreds of parked/dead slots); the plane sits at the model's tyre bottom
function ART8_inst(im,gy){if(!im||!im.isInstancedMesh||im.userData.a8)return;const t=new THREE.InstancedMesh(im.geometry,ART8_mat(gy),16);
  t.instanceMatrix.setUsage(THREE.DynamicDrawUsage);t.count=0;t.frustumCulled=false;t.renderOrder=1;t.userData.a8s=1;t.userData.keep=1;t.raycast=()=>{};im.add(t);im.userData.a8=t;ART8.ims.push(t)}
const ART8_minY=(...g)=>{let y=1e9;for(const x of g){if(!x||!x.geometry)continue;if(!x.geometry.boundingBox)x.geometry.computeBoundingBox();y=Math.min(y,x.geometry.boundingBox.min.y)}return y<1e8?y:0};
// wheel: axle = the thinnest box axis; radius = the farthest vertex from the axle (exact for a spinning wheel, any modelling axis)
function ART8_whl(g){if(g.userData.a8w)return g.userData.a8w;if(!g.boundingBox)g.computeBoundingBox();const b=g.boundingBox,c=b.getCenter(new THREE.Vector3()),e=b.getSize(new THREE.Vector3()),ax=e.x<=e.y&&e.x<=e.z?0:e.y<=e.z?1:2,P=g.attributes.position;let r=0;
  for(let i=0;i<P.count;i++){const d=[P.getX(i)-c.x,P.getY(i)-c.y,P.getZ(i)-c.z];d[ax]=0;r=Math.max(r,d[0]*d[0]+d[1]*d[1]+d[2]*d[2])}return g.userData.a8w={c,r:Math.sqrt(r)}}
let ART8_t=0;function ART8_sweep(){const t=performance.now();if(t-ART8_t<500)return;ART8_t=t;
  // filler roads and trails also win the depth test against the grass at a distance (city streets already had an offset)
  try{for(const k of['road','dirt']){const m=HUB.M&&HUB.M[k];if(m&&!m.polygonOffset){m.polygonOffset=true;m.polygonOffsetFactor=-1;m.polygonOffsetUnits=-2}}}catch(e){}
  try{for(const s of[pl,...(ships||[])])if(s&&s.mesh)ART8_car(s)}catch(e){}
  try{for(const k in HUB.cim||{}){const im=HUB.cim[k];if(!im)continue;const w=im.userData.w,gy=w?ART8_minY(w):ART8_minY(im);ART8_inst(im,gy);if(w)ART8_inst(w,gy);if(im.userData.g)ART8_inst(im.userData.g,gy)}}catch(e){}
  try{for(const o of TRM||[]){const L=Object.values(o).filter(x=>x&&x.isInstancedMesh&&x.material&&x.material.blending!==THREE.AdditiveBlending),gy=ART8_minY(...L);for(const x of L)ART8_inst(x,gy)}}catch(e){}}
const ART8_M=new THREE.Matrix4(),ART8_C=new THREE.Vector3();const ART8_put=(im,j)=>{const t=im&&im.userData.a8;if(!t||t.count>=16)return;im.getMatrixAt(j,ART8_M);t.setMatrixAt(t.count++,ART8_M)};
const ART8_V=new THREE.Vector3(),ART8_W=new THREE.Vector3(),ART8_Q=new THREE.Quaternion(),ART8_S=new THREE.Vector3();
function ART8_step(){ART8_sweep();
  // sun direction from the key light (its target may follow the player)
  moonL.getWorldPosition(ART8_V);moonL.target.getWorldPosition(ART8_W);const L=ART8.L.value.copy(ART8_W).sub(ART8_V);if(L.lengthSq()<1e-6)L.set(.45,-.75,.35);L.normalize();if(L.y>-.88){const h=Math.hypot(L.x,L.z)||1;L.x*=.475/h;L.z*=.475/h;L.y=-.88}
  for(const s of ART8.cars){const m=s.a8m;if(!m)continue;let ok=s.mesh&&s.mesh.visible&&s.mesh.parent&&!s.air&&(s.boatK||0)<=.5&&!(state==='roam'&&(s!==pl||RO.vy!==0));
    if(ok){let v=s.mesh;for(;v;v=v.parent)if(!v.visible){ok=false;break}}
    if(ok){s.mesh.getWorldQuaternion(ART8_Q);m.uniforms.uN.value.set(0,1,0).applyQuaternion(ART8_Q);
      // plane through the lowest wheel points (ART6 found the wheel meshes); fallback: the car origin
      let n=0;ART8_W.set(0,0,0);for(const w of s.art6w||[]){let vis=true;for(let a=w;a&&a!==s.mesh;a=a.parent)if(!a.visible){vis=false;break}if(!vis)continue;const q=ART8_whl(w.geometry);w.getWorldScale(ART8_S);ART8_V.copy(q.c).applyMatrix4(w.matrixWorld);
        ART8_V.addScaledVector(m.uniforms.uN.value,-q.r*Math.max(ART8_S.x,ART8_S.y,ART8_S.z));ART8_W.add(ART8_V);n++}
      if(n)ART8_W.multiplyScalar(1/n);else s.mesh.getWorldPosition(ART8_W);m.uniforms.uP0.value.copy(ART8_W)}
    m.visible=!!ok}
  for(const t of ART8.ims)t.count=0;camera.getWorldPosition(ART8_C);const f2=(ART8.far+10)**2;
  if(state==='roam'&&HUB.cars&&HUB.cim)for(const c of HUB.cars){if(c.dead>0||c.x==null)continue;const dx=c.x-ART8_C.x,dz=c.z-ART8_C.z;if(dx*dx+dz*dz>f2)continue;const im=HUB.cim[c.k];if(!im)continue;ART8_put(im,c.j);ART8_put(im.userData.w,c.j);ART8_put(im.userData.g,c.j)}
  if(state!=='roam')for(const c of traffic||[]){const o=TRM[c.k];if(c.i==null||!o||!o.body)continue;o.body.getMatrixAt(c.i,ART8_M);const e=ART8_M.elements,dx=e[12]-ART8_C.x,dz=e[14]-ART8_C.z;if(dx*dx+dz*dz>f2||e[0]*e[0]+e[1]*e[1]+e[2]*e[2]<1e-6)continue;for(const k in o)ART8_put(o[k],c.i)}
  for(const t of ART8.ims)t.instanceMatrix.needsUpdate=true}
renderer.render=(f=>function(sc,cam){if(sc===scene)try{ART8_step()}catch(e){}return f.call(this,sc,cam)})(renderer.render);
// ---- roads always on top of the grass: road strips used to have vertices only at their path points and at the two edges, so on humps
// the asphalt chord sagged under the (now exact) grass. Strips are refined where the ground is not linear: ≤ 2.5 m along, ≤ 4 m across.
function ART8_err(ax,az,bx,bz){return Math.abs(groundY((ax+bx)/2,(az+bz)/2)-(groundY(ax,az)+groundY(bx,bz))/2)}
function ART8_lin(ax,az,bx,bz){return ART8_err(ax,az,bx,bz)<.006}
// chord sag shrinks with the square of the step: split into the fewest pieces that keep it ≤ 4 cm (the asphalt rides 3.5-7 cm above the ground
// and the grass under a road dips 10 cm, ART8_dip)
const ART8_tol=.04,ART8_n=e=>e<ART8_tol?1:Math.ceil(Math.sqrt(e/ART8_tol));
function abStrip(P,i0,i1,oa,ob,ya,yb,uvL){const pos=[],uvs=[],idx=[],Q=[];let nc=1;const W=ob-oa;
  for(let i=i0;i<=i1;i++){const p=P[i],rx=p.tz,rz=-p.tx;if(Math.abs(W)>3)nc=Math.max(nc,Math.min(Math.ceil(Math.abs(W)/2),ART8_n(ART8_err(p.x+rx*oa,p.z+rz*oa,p.x+rx*ob,p.z+rz*ob))));
    Q.push([p.x,p.z,p.tx,p.tz,p.s]);if(i<i1){const q=P[i+1],L=Math.hypot(q.x-p.x,q.z-p.z);if(L>2){const rq=q.tz,rzq=-q.tx;let e=0;for(const o of[oa,(oa+ob)/2,ob])e=Math.max(e,ART8_err(p.x+rx*o,p.z+rz*o,q.x+rq*o,q.z+rzq*o));
      const n=Math.min(Math.ceil(L/3),ART8_n(e));for(let k=1;k<n;k++){const t=k/n;let tx=p.tx+(q.tx-p.tx)*t,tz=p.tz+(q.tz-p.tz)*t;const l=Math.hypot(tx,tz)||1;Q.push([p.x+(q.x-p.x)*t,p.z+(q.z-p.z)*t,tx/l,tz/l,p.s+(q.s-p.s)*t])}}}}
  const C=nc+1;for(let i=0;i<Q.length;i++){const[px,pz,tx,tz,ps]=Q[i],rx=tz,rz=-tx;for(let c=0;c<=nc;c++){const u=c/nc,o=oa+W*u,x=px+rx*o,z=pz+rz*o;pos.push(x,groundY(x,z)+ya+(yb-ya)*u,z);uvs.push(u,ps/uvL)}
    if(i<Q.length-1)for(let c=0;c<nc;c++){const k=i*C+c;idx.push(k,k+C,k+1,k+1,k+C,k+C+1)}}
  ART8.tri.ab+=idx.length/3;const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));g.setIndex(idx);g.computeVertexNormals();return g}
window.__a8={ART8,rc:(x,z)=>rivClear(x,z),get HUB(){return HUB},tH:(x,z)=>tH(x,z),gy:(x,z)=>groundY(x,z),rd:(x,z)=>ART7_rd(x,z),far:(...a)=>ART7_far(...a),near:(...a)=>ART7_near(...a),flat:(...a)=>ART7_flat(...a)};
// filler streets / crossing squares (pART5 drape): 4 m segments only where the ground under them is not linear (pART7 split every street
// 4 m both ways, ~400k extra vertices on flat ground); flat stretches keep 24 m segments
function ART8_ps(x0,z0,ux,uz,w,L){const vx=uz,vz=-ux;let ac=1,bend=false;for(let t=0;t<=L;t+=4){const x=x0+ux*t,z=z0+uz*t;if(w>3)ac=Math.max(ac,Math.min(Math.ceil(w/2),ART8_n(ART8_err(x-vx*w/2,z-vz*w/2,x+vx*w/2,z+vz*w/2))));
    }const nl=Math.max(1,Math.ceil(L/24)),sl=L/nl;let m=1;for(let k=0;k<nl;k++)for(const o of[-w/2,0,w/2]){const x=x0+ux*sl*k+vx*o,z=z0+uz*sl*k+vz*o;m=Math.max(m,ART8_n(ART8_err(x,z,x+ux*sl,z+uz*sl)))}
  const r=[ac,Math.min(Math.max(1,Math.ceil(L/4)),nl*m)];ART8.tri.ps+=2*r[0]*r[1];return r}
function ART8_pq(cx,cz,wa,wb){const a=wa/2,b=wb/2;let e=0;for(const t of[-1,-.5,0,.5,1]){e=Math.max(e,ART8_err(cx-a,cz+b*t,cx+a,cz+b*t),ART8_err(cx+a*t,cz-b,cx+a*t,cz+b))}return e>=ART8_tol?[Math.max(1,Math.ceil(wa/4)),Math.max(1,Math.ceil(wb/4))]:[1,1]}
/*ART</art8.js>*/
/*ART<art9.js>*/// ==== ART pART9 · the van-chase "dropped crate" obstacle reads as a crate (was a bare 3.5×2.2×3.5 m flat brown box,
// BoxGeometry(1.6,1,1.6) scaled 2.2: from behind the player it looked like a brown wall on the road).
// Now: a 1.8×1.3×1.8 m LEGO crate, plank texture with a darker frame and cross brace, four studs on top; origin at its base.
const ART9={};
function ART9_tex(){if(ART9.tx)return ART9.tx;const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');
 x.fillStyle='#c98b4b';x.fillRect(0,0,128,128);for(let i=0;i<5;i++){x.fillStyle=i%2?'#bf8043':'#d29657';x.fillRect(0,i*25.6,128,25.6);x.fillStyle='#8a5526';x.fillRect(0,i*25.6,128,2)}
 x.strokeStyle='#7a4a20';x.lineWidth=14;x.strokeRect(7,7,114,114);x.lineWidth=11;x.beginPath();x.moveTo(12,12);x.lineTo(116,116);x.stroke();
 x.strokeStyle='#e0a868';x.lineWidth=2;x.strokeRect(14,14,100,100);
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return ART9.tx=t}
function ART9_crate(){if(!ART9.g){const w=1.8,h=1.3;ART9.m=new THREE.MeshStandardMaterial({map:ART9_tex(),roughness:.55});
  ART9.ms=new THREE.MeshStandardMaterial({color:0xc98b4b,roughness:.45});ART9.g=new THREE.BoxGeometry(w,h,w).translate(0,h/2,0);
  ART9.sg=new THREE.CylinderGeometry(.24,.24,.16,12).translate(0,h+.08,0)}
 const o=new THREE.Group(),b=new THREE.Mesh(ART9.g,ART9.m);o.add(b);
 for(const[a,c]of[[-.45,-.45],[.45,-.45],[-.45,.45],[.45,.45]]){const s=new THREE.Mesh(ART9.sg,ART9.ms);s.position.set(a,0,c);o.add(s)}return o}
// Race haze: the bloom pass (threshold 1.0, strength .95, radius .6) bloomed the large over-bright neon track surfaces
// (cyan wall chevrons, floor hexes, horizon glow) into a screen-wide cyan wash that sat over the player car (pink, see-through look);
// worst in the SMASH frame, when the lunge swings the view toward the bright wall. In races only real light sources bloom now
// (threshold 1.5: neon signs, lamps, pillars); the city keeps threshold 1.0.
composer.render=(f=>function(...a){try{bloom.threshold=RO.on?1:1.5}catch(e){}return f.apply(this,a)})(composer.render);
// Teal truck blob + boxy one-colour pickup: city traffic built by CR_cityGeo (HUB.cim) took the per-instance HCOL tint on EVERY
// vertex, so a truck's whole 21-stud cargo box (white walls + grey ribs) became one mint/teal striped block and the suv/pickup's
// black windows, roof rack and trim turned the body colour (one flat blue box). Now only the pure-white body bricks (vertex colour
// #ffffff) take the instance colour; cargo boxes (#f4f4f4), ribs (#c9ced6), black trim/windows and grey parts keep their own.
function ART9_cabMat(){if(ART9.cab)return ART9.cab;const m=CR_CM.clone();m.onBeforeCompile=sh=>{sh.vertexShader=sh.vertexShader.replace('#include <color_vertex>',
 '#include <color_vertex>\n#if defined(USE_COLOR) && defined(USE_INSTANCING_COLOR)\n{float lo=min(color.r,min(color.g,color.b)),hi=max(color.r,max(color.g,color.b));\n if(instanceColor.r*instanceColor.g*instanceColor.b>1e-6&&(lo<.99||hi>1.01))vColor.xyz/=instanceColor.xyz;}\n#endif')};
 m.customProgramCacheKey=()=>'art9cab';return ART9.cab=m}
/*ART</art9.js>*/
// ---- GP: garage PAINT tab recolours the real LEGO bricks (v87g). Root cause of "paint does not work": BODY/ACCENT/TRIM only set the
// old ship colours d.a/b/c, but the LEGO car is drawn from per-brick colours (d.bricks[].c) and the set's 4×4/boat bricks, so nothing changed.
// Roles: a = most-used colour, b = 2nd, c = 3rd (frame black #1b2a34 always ranks last; wheels never change). Street bricks are tagged once
// (b.pr) and painted in place (saved in mho_build); 4×4 + boat get the same choice per set from mho_gar.pa[set] through GAR_apply.
const GP_K='#1b2a34';
function GP_rank(B){const n={};for(const b of B||[]){if(CR_WH[b.t]||b.t==='drvL'||b.t==='drvR'||b.t==='drvLR')continue;const c=String(GB_BC[b.c]||b.c).toLowerCase();n[c]=(n[c]||0)+1}
 const o=Object.keys(n).filter(c=>c!==GP_K).sort((x,y)=>n[y]-n[x]);if(n[GP_K])o.push(GP_K);return o}
const GP_pa=id=>(GAR_get().pa||{})[id||GAR_get().sel]||{};
function GP_save(k,v){const G=GAR_get();G.pa=G.pa||{};const p=G.pa[G.sel]=G.pa[G.sel]||{};if(v==null)delete G.pa[G.sel];else p[k]=v;GAR_put(G);for(const key in CR_VC)if(key.startsWith('gar|'))delete CR_VC[key]}
// street car: tag roles on first paint, then recolour the tagged bricks
function GP_paintStreet(k,v){const B=GB.d&&GB.d.bricks;if(!B||!B.length)return 0;if(!B.some(b=>b.pr)){const r=GP_rank(B);for(const b of B){if(CR_WH[b.t])continue;const i=r.indexOf(String(GB_BC[b.c]||b.c).toLowerCase());if(i>=0&&i<3)b.pr='abc'[i]}}
 let n=0;for(const b of B)if(b.pr===k){b.c=v;n++}return n}
// 4×4 + boat: map the form's own colour ranking onto the set's paint
GAR_apply=(f=>function(B,u,form){const r=form==='car'?null:GP_rank(B),A=f(B,u,form),p=GP_pa();if(!r||!(p.a||p.b||p.c))return A;
 const m={};r.slice(0,3).forEach((c,i)=>{const v=p['abc'[i]];if(v)m[c]=v});return A.map(b=>{if(CR_WH[b.t])return b;const c=m[String(GB_BC[b.c]||b.c).toLowerCase()];return c?Object.assign({},b,{c}):b})})(GAR_apply);
{const B=$('#gbBody');B.addEventListener('click',e=>{const b=e.target.closest('button[data-k]');if(!b||b.disabled||GB.tab!=='paint')return;const k=b.dataset.k;if(!'abc'.includes(k)||k.length!==1)return;GP_paintStreet(k,b.dataset.v);GP_save(k,b.dataset.v)},true)}
// swatch highlight follows the set's saved paint; one hint line on top of the PAINT tab
gbRender=(f=>function(){if(GB.tab==='paint'&&GB.d){const p=GP_pa();for(const k of'abc')if(p[k])GB.d[k]=p[k]}f();if(GB.tab!=='paint')return;const B=$('#gbBody'),i=document.createElement('div');i.className='gbInfo';i.textContent='Paints your car, off-road and boat';B.insertBefore(i,B.firstChild)})(gbRender);
// STOCK LOOK also clears the set's paint
$('#gbStock').addEventListener('click',()=>GP_save('a',null),true);
window.__gp={rank:GP_rank,pa:GP_pa,build:()=>{const d=store.get('mho_build',null);return d&&d.bricks?GP_rank(d.bricks):null}};
// ---- GPK: 2K-style vehicle groups + perks in the garage RIDES tab (slice 2). Rarity uses the 2K names (Neat · Cool · Awesome · Super Awesome);
// every set card shows its group; a PERKS row shows driver level, class C/B/A and the 1–3 slots (same rules + store as the pause card: mho_perks).
// Two 2K-style trade-off perks (race only, like Kaiser's Crown): Tank Mode and Glass Cannon.
GAR_TIER.c[0]='NEAT';GAR_TIER.r[0]='COOL';GAR_TIER.e[0]='AWESOME';GAR_TIER.l[0]='SUPER AWESOME';
const GPK_GRP={rod:'Hot rod',ebbel:'Street racer',posei:'Speed Champion',gold:'Hypercar'};
PERKS.push({id:'tank',icon:'🚜',name:'Tank Mode',d:'+30% health, −3% top speed',lvl:3},{id:'glass',icon:'💎',name:'Glass Cannon',d:'+4% top speed, −20% health',lvl:14});
setupRace=(f=>function(cfg){const r=f.apply(this,arguments);try{if(pl&&pl.stats){const s=pl.stats;if(PK.has('tank')){s.hull*=1.3;s.top*=.97;s.top0*=.97}if(PK.has('glass')){s.hull*=.8;s.top*=1.04;s.top0*=1.04}}}catch(e){}return r})(setupRace);
const GPK_={pk:null};
const GPK_cls=L=>L>=20?'A':L>=10?'B':'C';
function GPK_eq(slot,id){let e=perkEq0().filter(x=>x!==id);if(slot<e.length)e.splice(slot,1,id);else e.push(id);store.set('mho_perks',e.slice(0,perkSlots()))}
function GPK_html(){const L=carStat().lvl,n=perkSlots(),e=perkEq0(),P=id=>PERKS.find(p=>p.id===id)||{};
 let h=`<h5>PERKS · DRIVER LEVEL ${L} · CLASS ${GPK_cls(L)} · ${n}/3 SLOTS</h5><div class="gbRow">`;
 for(let i=0;i<3;i++){const p=e[i]&&P(e[i]);h+=i<n?`<button class="gbP gpkS ${GPK_.pk===i?'on':''}" data-gslot="${i}"><b>${p?p.icon+' '+p.name:'＋ EMPTY SLOT'}</b><small>${p?p.d:'tap to pick a perk'}</small></button>`:`<button class="gbP gpkS" disabled><b>🔒 SLOT ${i+1}</b><small>driver level ${i===1?8:16}</small></button>`}
 h+='</div>';if(GPK_.pk!=null&&GPK_.pk<n){h+=`<div class="gbRow">`;for(const p of[...PERKS].sort((a,b)=>perkUnlocked(b)-perkUnlocked(a))){const ok=perkUnlocked(p),on=e.includes(p.id);h+=`<button class="gbP ${on?'on':''}" ${ok?'':'disabled'} data-gpk="${p.id}"><b>${ok?'':'🔒 '}${p.icon} ${p.name}</b><small>${ok?p.d:perkReq(p)}</small></button>`}h+='</div>'}return h}
GAR_tab=(f=>function(){f();const B=$('#gbBody');
 B.querySelectorAll('[data-gset]').forEach(b=>{const s=b.querySelector('small'),g=GPK_GRP[b.dataset.gset];if(s&&g)s.textContent=g+' · '+s.textContent});
 const d=document.createElement('div');d.className='gpkTop';d.innerHTML=GPK_html();const inf=B.querySelector('.gbInfo');if(inf)inf.after(d);else B.prepend(d);
 const re=()=>{const sc=B.scrollTop;gbRender();$('#gbBody').scrollTop=sc};
 d.querySelectorAll('[data-gslot]').forEach(b=>b.onclick=()=>{const i=+b.dataset.gslot;GPK_.pk=GPK_.pk===i?null:i;try{AU.sfx('pick')}catch(e){}re();const l=$('#gbBody [data-gpk]');if(l)l.parentNode.scrollIntoView({block:'nearest'})});
 d.querySelectorAll('[data-gpk]').forEach(b=>b.onclick=()=>{const id=b.dataset.gpk;if(perkEq0().includes(id))store.set('mho_perks',perkEq0().filter(x=>x!==id));else GPK_eq(GPK_.pk,id);GPK_.pk=null;try{AU.sfx('brick')}catch(e){}re();const l=$('#gbBody [data-gslot]');if(l)l.parentNode.scrollIntoView({block:'nearest'})})})(GAR_tab);
{const st=document.createElement('style');st.textContent='#gbx .garSet em{font-size:12px!important;letter-spacing:.04em!important}#gbx .gpkS{min-width:150px}#gbx .gpkTop .gpkS small{display:none}#gbx .gpkTop .gpkS{min-height:44px;min-width:0;flex:1 1 0}#gbx .gbP small,#gbx h5,#gbx .gbHint{font-size:12px!important}#gbx h5{letter-spacing:.06em!important}#gbStats div{font-size:12px!important;letter-spacing:.02em!important;grid-template-columns:84px 1fr 66px!important}';document.head.appendChild(st)}
window.__gpk={html:GPK_html,eq:GPK_eq,cls:GPK_cls};
// ---- GPF: 2K-style driver PROFILE (slice 3). Extends the pause-menu profile (71 profileOpen): driver portrait, VEHICLES collection with
// Neat…Super Awesome rarity, owned/locked and upgrade pips, perk slots with what unlocks next, and a COLLECTION grid. Also opens from the title menu.
function GPF_veh(){const G=GAR_get();return GAR_SETS.map(S=>{const own=GAR_owned(S),[tn,tc]=GAR_TIER[S.tier],u=GAR_ups(S.id),lv=GAR_UP.reduce((a,[k])=>a+u[k],0);
 return`<div class="gpfV ${own?'':'lk'}" style="--tc:${tc}"><em>${tn}</em><b>${own?'':'🔒 '}${S.n}</b><small>${(typeof GPK_GRP!=='undefined'&&GPK_GRP[S.id])||''}${S.id===G.sel?' · driving':''}</small><small>${own?'Upgrades '+'●'.repeat(Math.ceil(lv/4))+'○'.repeat(3-Math.ceil(lv/4))+' '+lv+'/12':gbReqTxt(S.req)}</small></div>`}).join('')}
function GPF_col(){const nOwn=GAR_SETS.filter(GAR_owned).length,lv=GB_PATS.filter(([id,,r])=>gbReq(r,'pat_'+id)).length,hn=GB_HORNS.filter(([id,,r])=>gbReq(r,'horn_'+id)).length,
 parts=Object.values(GB_PARTS).reduce((a,l)=>a+l.length,0),pOwn=Object.values(GB_PARTS).reduce((a,l)=>a+l.filter(([id,,r])=>gbReq(r,id)).length,0),pk=store.get('mho_packs',[]).length,pu=PERKS.filter(perkUnlocked).length;
 const t=(i,n,v,m)=>`<div class="gpfC"><i>${i}</i><b>${v}/${m}</b><small>${n}</small></div>`;
 return t('🚗','vehicles',nOwn,GAR_SETS.length)+t('🧑','drivers',GAR_PRE.length,GAR_PRE.length)+t('⭐','perks',pu,PERKS.length)+t('🎨','liveries',lv,GB_PATS.length)+t('📯','horns',hn,GB_HORNS.length)+t('🔧','parts',pOwn,parts)+t('📦','brick packs',pk,12)}
function GPF_perks(){const L=carStat().lvl,n=perkSlots(),e=perkEq0(),nx=PERKS.filter(p=>p.lvl&&p.lvl>L).sort((a,b)=>a.lvl-b.lvl)[0];
 return`<h5>PERKS · CLASS ${drvClass()} · ${n}/3 SLOTS</h5><div class="pperks">${[0,1,2].map(i=>{const p=e[i]&&PERKS.find(q=>q.id===e[i]);return i<n?(p?`<span><i>${p.icon}</i>${p.name}</span>`:'<span class="gpfE">＋ empty</span>'):`<span class="gpfE">🔒 level ${i===1?8:16}</span>`}).join('')}</div><small>${nx?`Next: ${nx.icon} ${nx.name} at level ${nx.lvl}. `:''}Equip perks in the garage (RIDES tab).</small>`}
profileOpen=(f=>function(){f();const B=$('#pfBody');if(!B)return;
 const d=B.querySelector('.pcard.drv');if(d&&!d.querySelector('.gpfFig')){const im=document.createElement('img');im.className='gpfFig';im.src=GB_portrait();d.insertBefore(im,d.firstChild)}
 for(const c of B.querySelectorAll('.pcard')){const h=(c.querySelector('h5')||{}).textContent||'';
  if(h.startsWith('CAR ·'))c.innerHTML=`<h5>VEHICLES · ${GAR_SETS.filter(GAR_owned).length}/${GAR_SETS.length} OWNED</h5><div class="gpfVs">${GPF_veh()}</div><small class="pnote">Buy, drive and upgrade them in the garage (RIDES).</small>`;
  else if(h.startsWith('PERKS'))c.innerHTML=GPF_perks();
  else if(h.startsWith('COLLECTION'))c.innerHTML=`<h5>COLLECTION</h5><div class="gpfCs">${GPF_col()}</div>`}
 // phone fold: the PERKS card (slots + Next unlock) goes to the top of its column, above VEHICLES
 const pc=[...B.querySelectorAll('.pcard')].find(c=>((c.querySelector('h5')||{}).textContent||'').startsWith('PERKS')),vc=[...B.querySelectorAll('.pcard')].find(c=>((c.querySelector('h5')||{}).textContent||'').startsWith('VEHICLES'));
 if(pc&&vc&&vc.parentNode&&pc.compareDocumentPosition(vc)&Node.DOCUMENT_POSITION_PRECEDING)vc.parentNode.insertBefore(pc,vc)
 const P=$('#profile');if(state!=='roam'){P.classList.add('gpfMenu')}else P.classList.remove('gpfMenu')})(profileOpen);
{const P=$('#profile');document.body.appendChild(P);
 const st=document.createElement('style');st.textContent=`#profile{position:fixed!important;z-index:40!important}.gpfFig{width:64px;height:64px;border-radius:12px;border:3px solid #141413;background:#cfe8ff;flex:none}
.gpfVs{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px}.gpfV{border:3px solid var(--tc);border-radius:10px;padding:4px 8px;background:#f6f4ff}.gpfV.lk{opacity:.6}
.gpfV em{display:block;font:900 12px system-ui;font-style:normal;color:var(--tc);letter-spacing:.04em}.gpfV b{display:block;font:900 13px system-ui}
.gpfCs{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px}.gpfC{text-align:center;border:2px solid #141413;border-radius:10px;padding:4px 2px;background:#fff7d1}.gpfC i{font-style:normal;font-size:18px;display:block}.gpfC b{display:block;font:900 14px system-ui}
.gpfE{opacity:.6}#profile .pstats small,#profile .lvl small{font-size:12px!important}`;document.head.appendChild(st);
 const tb=$('#topBtns');if(tb){const b=document.createElement('button');b.id='gpfBtn';b.textContent='👤 PROFILE';b.onclick=()=>{try{AU.sfx('pick')}catch(e){}profileOpen()};tb.insertBefore(b,tb.firstChild)}}
// the "New in vX" bubble (z 8999) covered the garage tabs and the profile ✕ on the phone: hide it while the garage or profile is open
{const upd=()=>document.body.classList.toggle('gpfHideNew',!$('#gbx').hidden||!$('#profile').hidden),mo=new MutationObserver(upd);for(const s of['#gbx','#profile'])mo.observe($(s),{attributes:true,attributeFilter:['hidden']});
 const st=document.createElement('style');st.textContent='body.gpfHideNew #odNew{display:none!important}';document.head.appendChild(st);upd()}
// ---- GNB: 2K-style "build your own from a chassis" (slice 4). A 5th vehicle "My Build" (Neat) whose street car starts as a bare chassis frame:
// a black frame plate, 4 tyres on axles, the seat with its driver and steering wheel, taken 1:1 from a real set (true 8-wide proportions, tyres already on the road).
// NEW BUILD (builder toolbar or RIDES) → pick a chassis → snap parts on it. The part counter doubles as a build-limit bar plus the 2K weight class.
const GNB_K='#1b2a34',GNB_fr=b=>!!CR_WH[b.t]||/^(drv|drvL|stw|diff)$/.test(b.t)||(String(b.c).toLowerCase()===GNB_K&&/^T\d/.test(b.t));
const GNB_CH=[{id:'sc8',ic:'🏎',n:'SPEED CHAMPION',d:'8 wide · low · 4 sport tyres',src:()=>GAR_set('posei').car()},{id:'rod',ic:'🛣',n:'HOT ROD',d:'open frame · big rear tyres',src:()=>GAR_set('rod').car()}];
const GNB_frame=id=>GAR_arr((GNB_CH.find(c=>c.id===id)||GNB_CH[0]).src()).filter(GNB_fr).map(b=>({...b}));
{const R=GAR_set('rod');GAR_SETS.push({id:'mine',n:'My Build',tier:'c',req:null,car:()=>GNB_frame('sc8').map(b=>[b.t,b.x,b.z,b.r,b.c,b.y]),off:R.off,boat:R.boat,
 load:Object.assign(JSON.parse(JSON.stringify(R.load)),{car:Object.assign({},R.load.car,{name:'MY BUILD',k:'Street'})})});try{GPK_GRP.mine='Built by you'}catch(e){}}
// snap: parts never stack on a tyre (a mudguard wraps its wheel like on the real sets), and a blank base covers the whole floor plate of the chassis
GB_top=(f=>function(i,j,list){return f(i,j,list.filter(b=>!CR_WH[b.t]))})(GB_top);
GB_scanBase=(f=>function(){f();if(!GB.d||!GB.d.bp||!GB_.base)return;for(const b of GB_list()){if(CR_WH[b.t]||b.y>1||!/^T\d/.test(b.t))continue;const[fw,fd]=GB_dims(b);for(let i=b.x;i<b.x+fw;i++)for(let j=b.z;j<b.z+fd;j++){const k=i+','+j;if(GB_.base[k]==null&&i>=GB_N0&&i<=GB_N1&&j>=GB_N0&&j<=GB_N1)GB_.base[k]=0}}})(GB_scanBase);
// a mudguard tapped on or next to a tyre wraps that tyre (the tap ray hits the tyre's outer edge, one stud off)
GB_cand=(f=>function(hit){if(!hit||!/^(arch|fender)$/.test(GB_.pc))return f(hit);const L=GB_list(),P=GB_PC[GB_.pc],r=GB_.rot,[fw,fd]=r%2?[P.d,P.w]:[P.w,P.d];
 const w=L.find(b=>{if(!CR_WH[b.t])return false;const[ww,wd]=GB_dims(b);return hit.i>=b.x-1&&hit.i<=b.x+ww&&hit.j>=b.z-1&&hit.j<=b.z+wd});if(!w)return f(hit);
 const[ww,wd]=GB_dims(w),b={t:GB_.pc,x:w.x<0?w.x:w.x+ww-fw,z:w.z+Math.round((wd-fd)/2),y:0,r,m:0,c:GB_.col},y=GB_fit(b,L);if(y==null)return f(hit);b.y=y;b.bad=L.length>=GB_MAX;return b})(GB_cand);
// mirror: a centred part's twin would overlap the part itself (a doubled windscreen) → skip the twin
GB_fit=(f=>function(b,list){const o=list[list.length-1];if(o&&o!==b&&o.t===b.t&&o.y!=null){const[fw,fd]=GB_dims(b),[ow,od]=GB_dims(o);if(b.x===-o.x-ow&&b.z===o.z&&b.x<o.x+ow&&o.x<b.x+fw)return null}return f(b,list)})(GB_fit);
// builder view: the parts panel covers the bottom third, so the car's nose sat on its buttons and a tap there hit a button. Lift the view by 12 % of the height.
GB_cam=(f=>function(){f();const C=GB.cam,v=C.view,h=$('#gbC').clientHeight,w=$('#gbC').clientWidth,oy=GB_.bk?Math.round(h*.12):0;if(oy){if(!v||!v.enabled||v.offsetY!==oy||v.fullWidth!==w||v.fullHeight!==h)C.setViewOffset(w,h,0,oy,w,h)}else if(v&&v.enabled)C.clearViewOffset();C.updateMatrixWorld()})(GB_cam);
const GNB_W=n=>n<20?'Super Light':n<40?'Light':n<60?'Medium':n<80?'Heavy':n<100?'Super Heavy':'Massive';
GB_ui=(f=>function(){f();const n=$('#gbBkN');if(!n||!GB.d)return;const k=GB_list().length,p=Math.round(100*Math.min(1,k/GB_MAX));n.textContent=`🧱 ${innerWidth>760&&innerHeight>500?'BUILD LIMIT ':''}${k}/${GB_MAX} · ${GNB_W(k)}`;n.title='Build limit';n.style.background=`linear-gradient(90deg,rgba(255,209,44,.38) ${p}%,rgba(6,18,31,.9) ${p}%)`})(GB_ui);
function GNB_pick(){let P=$('#gnbP');if(!P){P=document.createElement('div');P.id='gnbP';$('#gbx .gbv').appendChild(P)}
 P.innerHTML=`<div class="gnbB"><b>NEW BUILD · pick a chassis</b><small>Your build becomes the vehicle "My Build" in RIDES.</small><div class="gnbR">${GNB_CH.map(c=>`<button data-ch="${c.id}"><i>${c.ic}</i><b>${c.n}</b><small>${c.d}</small></button>`).join('')}</div><button class="gnbX">CANCEL</button></div>`;P.hidden=false;
 P.onclick=e=>{const b=e.target.closest('button');if(!b)return;try{AU.sfx('pick')}catch(_){}P.hidden=true;if(b.dataset.ch)GNB_new(b.dataset.ch)}}
function GNB_new(id){if(GAR_get().sel!=='mine')GAR_select('mine');if(!GB_.bk)GB_enter();GB_snap();GB.d.bricks=GNB_frame(id);GB.d.bp=1;GB_scanBase();GB_gridMesh();GB_refresh();GB_.mir=1;GB_.tool='add';GB_.dist=11;GB_.pit=.95;GB_.yaw=Math.PI*.72;GB_ui();try{GB_msg('Bare chassis · tap to add parts')}catch(e){}}
GB_enter=(f=>function(){const r=f.apply(this,arguments);const T=$('#gbBkT');if(T&&!T.querySelector('[data-a="gnb"]')){const b=document.createElement('button');b.dataset.a='gnb';b.textContent='🆕 NEW';b.title='Start from a bare chassis';b.addEventListener('click',e=>{e.stopPropagation();GNB_pick()});T.insertBefore(b,T.querySelector('[data-a="bp"]'))}return r})(GB_enter);
GAR_tab=(f=>function(){f();const B=$('#gbBody'),gs=B.querySelector('.garSets');if(!gs)return;const b=document.createElement('button');b.className='gbP gnbGo';b.innerHTML='<b>🆕 BUILD YOUR OWN</b><small>start from a bare chassis</small>';b.onclick=()=>{try{AU.sfx('pick')}catch(e){}GB_enter();GNB_pick()};gs.appendChild(b)})(GAR_tab);
{const st=document.createElement('style');st.textContent=`#gnbP{position:absolute;inset:0;z-index:5;display:grid;place-items:center;background:rgba(3,8,20,.6)}#gnbP[hidden]{display:none}
.gnbB{background:#0b1626;border:2px solid #4ceaff;border-radius:16px;padding:12px 14px;max-width:96%;color:#fff;font:700 12px system-ui;display:grid;gap:8px;justify-items:center}.gnbB>b{font:900 italic 16px system-ui;color:#ffd12c}
.gnbR{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}.gnbR button{width:150px;display:grid;gap:2px;justify-items:center;padding:8px;border-radius:12px;border:2px solid rgba(76,234,255,.5);background:#12304a;color:#fff;cursor:pointer}
.gnbR i{font-style:normal;font-size:24px}.gnbR b{font:900 13px system-ui}.gnbR small,.gnbB small{font:600 12px system-ui;color:#cfe6f5}.gnbX{border:0;background:transparent;color:#8fb3c7;font:800 12px system-ui;min-height:32px;cursor:pointer}
#gbx .gnbGo{border-color:#ffd12c!important;min-width:118px}
#gbx .gbPc{font-size:12px;width:64px;line-height:1}@media (max-width:760px),(max-height:500px){#gbx #gbBkT button{font-size:12px;padding:0 6px}#gbx #gbBkN{font-size:12px}#gbx .gbPc{width:60px;height:46px}#gbx .gbPc i{font-size:14px}}
#gbx.gbBk #gbBkP{pointer-events:none}#gbx.gbBk #gbBkP button{pointer-events:auto}`;document.head.appendChild(st)}
window.__gnb={dbg:(x,y)=>{const h=GB_pick(x,y),c=GB_cand(h);return JSON.stringify({h:h&&{i:h.i,j:h.j,b:h.brick&&h.brick.t},c,base:GB_.base[(h&&h.i)+","+(h&&h.j)]})},gap:()=>{const m=(typeof RO!=='undefined'&&RO&&RO.mesh)||(pl&&pl.mesh);if(!m)return null;m.updateMatrixWorld(true);const out=[],P=new THREE.Vector3(),S=new THREE.Vector3();m.traverse(o=>{let v=1;for(let q=o;q;q=q.parent)if(!q.visible)v=0;if(o.userData&&o.userData.r&&o.userData.gb&&v){o.getWorldPosition(P);o.getWorldScale(S);out.push(+(P.y-o.userData.r*S.y-groundAt(P.x,P.z,P.y+1)).toFixed(3))}});return out},cam:o=>{window.__gnbCam=o;if(!composer.__gnb){const r=composer.render.bind(composer);composer.render=(...a)=>{const c=window.__gnbCam;if(c){camera.position.set(c[0],c[1],c[2]);camera.lookAt(c[3],c[4],c[5]);camera.updateMatrixWorld()}return r(...a)};composer.__gnb=1}},saved:()=>({sel:GAR_get().sel,saved:(store.get('mho_build',{}).bricks||[]).length,live:GB.d?GB_list().length:null}),fit:(t,x,z,r)=>GB_fit({t,x,z,r:r||0,y:0},GB_list()),set:id=>GAR_arr(GAR_set(id).car()),frame:GNB_frame,pick:GNB_pick,nw:GNB_new,W:GNB_W};
