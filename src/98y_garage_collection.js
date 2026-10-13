// ---- G9C: 2K-style vehicle COLLECTION + real-LEGO starter templates (garage worker 9, docs/GARAGE2K_COLLECTION.md)
// Templates: 8 street cars + 1 off-road truck rebuilt from the builder's own parts after real sets (references in docs/shots/garage9/ref).
// 8 wide, wheelbase 10 studs, roof at ~12 plates like a Speed Champions car. They join GAR_SETS, so they can be driven and opened in the builder.
// COLLECTION (RIDES tab): STREET / OFF-ROAD / WATER tabs, rarity stripes, sort + filter, owned/locked counts, ★ favourites, 3D cards, one tap equips.
// Off-road and water forms can be mixed with any street car (2K loadout): mho_gar.off / mho_gar.boat.
function G9_sc(o){const A=[],B=o.B,S=o.S||B,H=o.H||B,R=o.R||B,K=CR_K,W=o.W||K,add=(t,x,z,r,c,y)=>{CR_reg(t);A.push([t,x,z,r,c,y])},
 sym=(t,x,z,r,c,y)=>{CR_reg(t);const fw=(r%2?GB_PC[t].d:GB_PC[t].w);add(t,x,z,r,c,y);if(x!==-x-fw)add(t,-x-fw,z,(4-r)%4,c,y)},wh=o.wh||'wL',wy=(.12-CR_WH[wh].r)/GB_PH;
 add('T6x16',-3,-8,0,K,0);sym('T1x6',-4,-3,0,K,0);sym('T1x1',-4,-8,0,K,0);sym('T1x1',-4,7,0,K,0);
 for(const z of[-7,3]){sym('arch',-4,z,0,o.A||B,0);sym(wh,-4,z,0,K,wy)}
 // nose
 // wedge: knife-edge nose 2 plates high, hood of Slope 33 3x1s rising to the screen (76908-style)
 if(o.nose==='wedge'){add('P8x1',-4,-8,0,K,1);add('T8x1',-4,-8,0,B,2);add('P4x4',-2,-7,0,K,1);add('P4x4',-2,-7,0,K,2);
  for(let x=-2;x<2;x++)add('s31',x,-7,0,H,3);add('P4x1',-2,-4,0,H,3);add('P4x1',-2,-4,0,H,4);add('T4x1',-2,-4,0,H,5)}
 else{if(o.tw){sym('bigl',-4,-8,0,K,1);sym('bigl',-3,-8,0,K,1)}else{sym('hl',-4,-8,0,o.L||B,1);sym('B1x1',-3,-8,0,K,1)}add('grl',-2,-8,1,K,1);add('grl',0,-8,1,K,1);add('C8x1',-4,-8,0,o.N||B,4);
  add('B4x4',-2,-7,0,K,1);sym('cs14',-2,-7,0,H,4);sym('cs14',-1,-7,0,S,4)}
 if(o.bump){add('bump',-4,-9,0,o.bump,1);add('bump',-4,8,0,o.bump,1)}
 // flanks
 const cy=o.low?5:6;sym('B1x6',-4,-3,0,B,1);sym('grl',-4,1,0,o.I||K,3);sym('T1x6',-4,-3,0,o.sill||S,4);if(!o.low)sym('T1x6',-4,-3,0,B,5);
 // cabin: the roof plate sits 1 plate down into the screens' crown, flush (no "hat")
 add('T6x6',-3,-3,0,K,1);add('drvL',-1,-1,0,B,o.low?1:2);
 if(o.cab==='open'){add('ws4',-2,-3,0,o.G||K,cy);sym('B1x3',-4,0,0,B,cy)}
 else{add('ws6',-3,-3,0,R,cy);add('ws6',-3,0,2,R,cy);if(o.rs){sym('T2x2',-3,-1,0,R,cy+4);add('T2x2',-1,-1,0,o.rs,cy+4)}else add('T6x2',-3,-1,0,R,cy+4)}
 // rear deck (o.eng: grey block + V8 + scoop standing out behind an open cockpit, 31100-style)
 if(o.eng){add('T4x4',-2,3,0,K,3);add('B4x3',-2,3,0,o.eng,4);add('eng',-2,3,0,o.eng,7);add('scoop',-1,4,0,o.eng,9);add('T4x1',-2,6,0,K,4)}
 else{add('T4x4',-2,3,0,K,3);sym('cs14',-2,3,2,B,4);sym('cs14',-1,3,2,o.rs||S,4)}
 sym('tl',-4,7,2,B,1);sym('B1x1',-3,7,0,B,1);add('B4x1',-2,7,0,K,1);add('C8x1',-4,7,2,B,4);add('diff',-2,8,0,K,0);
 if(o.rear==='wing')add('wing',-4,o.eng?6:5,0,W,o.wy||5);else if(o.rear==='spoiler')add('spoiler',-2,o.eng?6:5,0,W,o.eng?4:6);
 for(const e of o.x||[])add(...e);return A}
// open-wheel formula car (narrow tub, sidepods, wings, exposed wheels)
function G9_f1(o){const A=[],B=o.B,K=CR_K,S=o.S||K,add=(t,x,z,r,c,y)=>{CR_reg(t);A.push([t,x,z,r,c,y])},sym=(t,x,z,r,c,y)=>{CR_reg(t);const fw=(r%2?GB_PC[t].d:GB_PC[t].w);add(t,x,z,r,c,y);if(x!==-x-fw)add(t,-x-fw,z,(4-r)%4,c,y)},
 wh='wL',wy=(.12-CR_WH[wh].r)/GB_PH;
 add('T2x18',-1,-9,0,K,0);add('T8x2',-4,-11,0,K,0);sym('T1x2',-4,-11,0,B,1);add('B2x4',-1,-9,0,B,1);add('cs12',-1,-11,0,K,1);add('cs12',0,-11,0,K,1);
 for(const z of[-8,3])sym(wh,-4,z,0,K,wy);sym('T2x2',-3,-7,0,K,2);sym('T2x2',-3,4,0,K,2);
 sym('B2x6',-3,-2,0,B,1);sym('T1x6',-3,-2,0,S,4);sym('cs14',-2,-2,0,B,4);
 add('B2x4',-1,-5,0,B,1);add('T2x4',-1,-5,0,S,4);add('drv',-1,-1,0,B,1);add('ab14',-2,-2,1,K,6);
 add('B2x4',-1,1,0,B,1);add('cs24',-1,1,2,B,4);add('B2x2',-1,5,0,K,1);add('T2x2',-1,7,0,K,0);add('wing',-4,7,0,o.W||K,1);sym('T1x2',-4,7,0,B,9);return A}
// off-road monster truck after City 60402: XL tyres outside a raised dark-blue body, azure fenders, black roof + roll bar, yellow lights
function G9_mt(o){const A=[],B=o.B,AZ=o.AZ,K=CR_K,Y='#fac80a',G='#a0a5a9',add=(t,x,z,r,c,y)=>{CR_reg(t);A.push([t,x,z,r,c,y])},sym=(t,x,z,r,c,y)=>{CR_reg(t);const fw=(r%2?GB_PC[t].d:GB_PC[t].w);add(t,x,z,r,c,y);if(x!==-x-fw)add(t,-x-fw,z,(4-r)%4,c,y)},
 wy=(.36-GB_PC.wXL.h*GB_PH/2)/GB_PH,b=4;
 // short 14-stud body on a black frame; tyres almost touch front to back like the set
 sym('wXL',-6,-7,0,K,wy);sym('wXL',-6,2,0,K,wy);add('T6x14',-3,-7,0,K,b);sym('B1x2',-4,-6,0,G,b-1);sym('B1x2',-4,3,0,G,b-1);
 // front: black bumper, grey grille, yellow lamps, azure fenders, hood + scoop
 add('P8x1',-4,-8,0,K,b);add('P8x1',-4,-8,0,K,b+1);add('B4x1',-2,-7,0,K,b+1);add('grl',-2,-7,1,G,b+4);add('grl',0,-7,1,G,b+4);sym('hl',-3,-7,0,Y,b+1);sym('flame',-3,-7,0,AZ,b+4);
 sym('B1x3',-3,-6,0,AZ,b+1);add('B4x3',-2,-6,0,B,b+1);add('T4x3',-2,-6,0,B,b+4);add('scoop',-1,-5,0,G,b+5);
 // cab: screen, rear wall, black studded roof, flames on the doors, roll bar behind
 add('B6x6',-3,-3,0,B,b+1);sym('T1x6',-3,-3,0,AZ,b+3);add('ws6',-3,-3,0,B,b+4);add('B6x3',-3,0,0,B,b+4);add('P6x3',-3,0,0,K,b+7);add('P6x3',-3,0,0,K,b+8);add('P6x4',-3,-1,0,K,b+9);
 add('roll',-3,3,0,K,b+4);
 // short bed + tail
 sym('B1x3',-3,3,0,B,b+1);add('T4x3',-2,3,0,K,b+1);add('nitro',-1,3,0,K,b+2);sym('tl',-3,6,2,B,b+1);add('B4x1',-2,6,0,K,b+1);add('P8x1',-4,7,0,K,b);add('P8x1',-4,7,0,K,b+1);
 for(const e of o.x||[])add(...e);return A}
const G9_T=[
 {id:'t_rosso',n:'Rosso V12',tier:'e',ref:'76914',k:'Front-engine V12 GT',car:()=>G9_sc({B:'#d01712',S:'#fac80a',rs:'#fac80a',wh:'wL',x:[['grl',-3,-6,0,CR_K,6],['grl',2,-6,0,CR_K,6]]}),st:{top:1.07,acc:1.05,han:1.03,hull:1}},
 {id:'t_bianco',n:'Bianco Wedge',tier:'l',ref:'76908',k:'Wedge supercar',car:()=>G9_sc({B:'#f4f4f4',S:'#f4f4f4',nose:'wedge',low:1,rear:'wing',W:'#f4f4f4',wy:6,I:CR_K,wh:'wL',x:[['B1x3',-4,0,0,'#f4f4f4',5],['B1x3',3,0,0,'#f4f4f4',5],['grl',-4,1,0,CR_K,8],['grl',3,1,0,CR_K,8]]}),st:{top:1.08,acc:1.06,han:1.02,hull:.98}},
 {id:'t_papaya',n:'Papaya F1',tier:'l',ref:'76919',k:'Formula car',car:()=>G9_f1({B:'#fe8a18',S:'#36aebf',W:'#fe8a18'}),st:{top:1.09,acc:1.07,han:1.06,hull:.92}},
 {id:'t_silver',n:'Silver Street GT',tier:'r',ref:'76917',k:'Street tuner',car:()=>G9_sc({B:'#a0a5a9',S:'#0055bf',rs:'#0055bf',rear:'wing',W:'#0055bf',L:'#1b2a34',wh:'wL'}),st:{top:1.06,acc:1.05,han:1.04,hull:1}},
 {id:'t_patrol',n:'City Patrol',tier:'c',ref:'60312',k:'Police car',car:()=>G9_sc({B:'#0055bf',S:'#f4f4f4',H:'#f4f4f4',R:'#f4f4f4',sill:'#a5ca18',wh:'wM',bump:CR_K,x:[['bar',-2,-1,0,'#36aebf',11],['scoop',-1,-6,0,'#a0a5a9',7]]}),st:{top:1.03,acc:1.04,han:1.03,hull:1.08}},
 {id:'t_viola',n:'Viola Muscle',tier:'r',ref:'60408',k:'Muscle car',car:()=>G9_sc({B:'#8a12a8',S:'#8a12a8',R:'#f4f4f4',wh:'wL',bump:'#d8dde4',x:[['scoop',-1,-6,0,CR_K,7]]}),st:{top:1.06,acc:1.07,han:.99,hull:1.03}},
 {id:'t_flame',n:'Flame Rod',tier:'r',ref:'60408',k:'Hot rod',car:()=>G9_sc({B:'#fac80a',S:CR_K,H:'#fac80a',R:CR_K,A:CR_K,wh:'wL',bump:'#d8dde4',rear:'spoiler',x:[['flame',-4,-7,0,'#fe8a18',6],['flame',3,-7,0,'#fe8a18',6]]}),st:{top:1.05,acc:1.06,han:1,hull:1.02}},
 {id:'t_racer',n:'Red Racer',tier:'c',ref:'31100',k:'Roadster',car:()=>G9_sc({B:'#d01712',S:'#f4f4f4',sill:'#d01712',cab:'open',G:'#c9a66b',eng:'#a0a5a9',tw:1,rear:'wing',W:'#f4f4f4',wy:6,wh:'wM'}),st:{top:1.04,acc:1.06,han:1.02,hull:1}}];
// off-road template: a blue monster truck after the City monster truck (60402)
{const R=GAR_set('rod'),L=n=>JSON.parse(JSON.stringify(R.load[n]));
 for(const T of G9_T)GAR_SETS.push({id:T.id,n:T.n,tier:T.tier,req:null,car:T.car,off:R.off,boat:R.boat,tpl:1,ref:T.ref,forms:['car'],
  load:{car:{name:T.n.toUpperCase(),k:'Street',st:T.st,w:T.tier==='l'?'Light':'Medium',perk:T.tier==='c'?'start':'slip'},'4x4':L('4x4'),boat:L('boat')}});
 GAR_SETS.push({id:'t_beast',n:'Blue Beast',tier:'r',req:null,car:R.car,off:()=>G9_mt({B:'#0d2a6b',AZ:'#36aebf'}),boat:R.boat,tpl:1,ref:'60402',forms:['off'],
  load:{car:L('car'),'4x4':{name:'BLUE BEAST',k:'Off-road',st:{top:.98,acc:1.03,han:.99,hull:1.15},w:'Super Heavy',perk:'armor'},boat:L('boat')}});
 const M=GAR_SETS.find(s=>s.id==='mine');if(M)M.forms=['car']}
// ---------- collection model: one entry per (vehicle set, form)
const G9C={ry:2.35,type:'car',sort:'rar',filt:'all',th:new Map(),q:[],busy:0};
const G9C_TY=[['car','🚗','STREET'],['off','🛻','OFF-ROAD'],['boat','🚤','WATER']],G9C_RK={l:0,e:1,r:2,c:3};
const G9C_key=(S,f)=>S.id+'|'+f;
const G9C_forms=S=>S.forms||['car','off','boat'];
const G9C_name=(S,f)=>{const L=S.load&&S.load[f==='off'?'4x4':f];return f==='car'?S.n:(L&&L.name?L.name.charAt(0)+L.name.slice(1).toLowerCase():S.n)};
function G9C_eq(f){const G=GAR_get();return f==='car'?G.sel:(G[f]&&GAR_owned(GAR_set(G[f]))?G[f]:G.sel)}
function G9C_list(f){const G=GAR_get(),fav=G.fav||[];let A=[];GAR_SETS.forEach((S,i)=>{if(G9C_forms(S).includes(f))A.push({S,f,i,own:GAR_owned(S),fav:fav.includes(G9C_key(S,f))})});
 const all=A.length,own=A.filter(e=>e.own).length;if(G9C.filt==='own')A=A.filter(e=>e.own);else if(G9C.filt==='fav')A=A.filter(e=>e.fav);else if(G9C.filt==='rac')A=A.filter(e=>e.S.grp==='racers');
 const nm=e=>G9C_name(e.S,e.f);A.sort(G9C.sort==='az'?(a,b)=>nm(a).localeCompare(nm(b)):G9C.sort==='new'?(a,b)=>b.i-a.i:(a,b)=>(b.own-a.own)||G9C_RK[a.S.tier]-G9C_RK[b.S.tier]||a.i-b.i);return{A,all,own}}
function G9C_equip(S,f){if(!GAR_owned(S)){try{AU.sfx('bump')}catch(e){}return 0}if(f==='car')GAR_select(S.id);else{const G=GAR_get();G[f]=S.id;GAR_put(G);GAR_load();try{AU.sfx('pick')}catch(e){}}gbRender();return 1}
function G9C_favT(S,f){const G=GAR_get(),k=G9C_key(S,f),F=G.fav=G.fav||[],i=F.indexOf(k);if(i<0)F.push(k);else F.splice(i,1);GAR_put(G);try{AU.sfx('pick')}catch(e){}}
// ---------- 3D card renders: GS's small offscreen renderer, resized to 168×104, one vehicle at a time, cached
// the selected car's live edits are in GB.d (mho_build); other cars' edits in mho_gar.br
const G9C_live=S=>{if(GAR_get().sel!==S.id)return null;const d=GB.d||gbBuild();return d&&d.bricks&&d.bricks.length?d.bricks:null};
function G9C_bricks(S,f){if(f==='car'){const b=G9C_live(S)||GAR_get().br[S.id];return(b&&b.length?b:GAR_arr(S.car())).map(o=>({...o}))}return GAR_arr(f==='off'?S.off():S.boat())}
function G9C_render(S,f,W=168,Hh=104){const key=W+'|'+G9C_key(S,f)+'|'+(f==='car'?JSON.stringify(G9C_live(S)||GAR_get().br[S.id]||0).length:0);if(G9C.th.has(key))return G9C.th.get(key);
 if(!GS.th)GS_thumb('b11',0);const T=GS.th;if(!T)return null;let url=null;try{const host=new THREE.Group(),g={userData:{m:host}};GB_attach(g,G9C_bricks(S,f),null,false,false);
  host.rotation.y=G9C.ry;host.updateMatrixWorld(true);const bb=new THREE.Box3().setFromObject(host),ce=bb.getCenter(new THREE.Vector3()),sz=bb.getSize(new THREE.Vector3());host.position.sub(ce);T.s.add(host);
  T.r.setSize(W,Hh,false);T.cam.aspect=W/Hh;T.cam.updateProjectionMatrix();const d=Math.max(sz.x,sz.z,sz.y*1.6)*1.75;T.cam.position.set(0,d*.42,d*.9);T.cam.lookAt(0,-sz.y*.04,0);
  T.r.setClearColor(0,0);T.r.render(T.s,T.cam);url=T.r.url();T.s.remove(host);host.traverse(m=>{if(m.isMesh&&!m.userData.gbc)m.geometry.dispose()})}catch(e){console.warn('G9C',e);url=null}
 finally{T.r.setSize(112,112,false);T.cam.aspect=1;T.cam.updateProjectionMatrix()}G9C.th.set(key,url);return url}
function G9C_pump(){if(G9C.busy)return;const next=()=>{const L=[...document.querySelectorAll('#g9Col img[data-k]:not([src])')],V=$('#g9Col'),vr=V&&V.getBoundingClientRect(),vis=e=>{const r=e.getBoundingClientRect();return vr&&r.bottom>vr.top&&r.top<vr.bottom&&r.right>vr.left&&r.left<vr.right},im=L.find(vis)||L[0];/* v90e: on-screen cards first (the newest rides sit at the end of the list) */if(!im||$('#gbx').hidden){G9C.busy=0;return}
  const S=GAR_set(im.dataset.s),u=G9C_render(S,im.dataset.f);if(u)im.src=u;else im.removeAttribute('data-k');setTimeout(next,16)};G9C.busy=1;setTimeout(next,30)}
// ---------- UI: replaces the VEHICLES row at the top of RIDES
function G9C_html(){const f=G9C.type,{A,all,own}=G9C_list(f),eq=G9C_eq(f),SL={rar:'RARITY',az:'A–Z',new:'NEW'},FL={all:'ALL',own:'OWNED',fav:'★ FAVS',rac:'🏁 RACERS'};
 let h=`<div id="g9Col"><div class="g9Bar">${G9C_TY.map(([k,ic,n])=>{const L=G9C_list(k);return`<button class="g9Ty ${k===f?'on':''}" data-gty="${k}">${ic} ${n} <small>${L.own}/${L.all}</small></button>`}).join('')}
 <button class="g9Ch" data-gso>⇅ ${SL[G9C.sort]}</button><button class="g9Ch" data-gfi>${FL[G9C.filt]}</button></div>
 <div class="g9Cnt">owned ${own} / ${all} · locked ${all-own}</div><div class="g9Grid">`;
 for(const e of A){const S=e.S,[tn,tc]=GAR_TIER[S.tier],on=S.id===eq,k=G9C_key(S,f);
  h+=`<div class="g9Card ${on?'on':''} ${e.own?'':'lock'}" style="--tc:${tc}" data-gc="${S.id}"><img data-k="${k}" data-s="${S.id}" data-f="${f}" alt=""><i class="g9R">${tn}</i>
   <button class="g9Fav ${e.fav?'on':''}" data-gfav="${S.id}" aria-label="favourite">${e.fav?'★':'☆'}</button><b>${e.own?'':'🔒 '}${G9C_name(S,f)}</b>
   <small>${on?'✔ EQUIPPED':e.own?(S.tpl?'LEGO design':'tap to equip'):gbReqTxt(S.req)}</small>${f==='car'&&e.own?`<button class="g9Ed" data-ged="${S.id}">✎ BUILD</button>`:''}</div>`}
 if(!A.length)h+=`<p class="g9None">${G9C.filt==='fav'?'No favourites yet · tap ☆ on a card':'Nothing here yet'}</p>`;return h+'</div></div>'}
GAR_tab=(f=>function(){f();const B=$('#gbBody');if(!B)return;const row=B.querySelector('.garSets');if(!row)return;const h5=row.previousElementSibling,nb=row.querySelector('.gnbGo');const w=document.createElement('div');w.innerHTML=G9C_html();row.replaceWith(w.firstChild);
 if(nb&&G9C.type==='car'){nb.classList.add('g9New');const g=$('#g9Col .g9Grid');if(g)g.prepend(nb)}
 const C=$('#g9Col');if(h5&&h5.tagName==='H5'){h5.textContent='COLLECTION · tap a card to equip it';const inf=B.querySelector('.gbInfo');if(inf)inf.after(h5,C)}
 C.addEventListener('click',e=>{const t=e.target.closest('button,.g9Card');if(!t)return;e.stopPropagation();
  if(t.dataset.gty){G9C.type=t.dataset.gty;GAR_.pv=t.dataset.gty==='off'?'4x4':t.dataset.gty;try{AU.sfx('pick')}catch(_){}gbRender();return}
  if(t.hasAttribute('data-gso')){G9C.sort={rar:'az',az:'new',new:'rar'}[G9C.sort];gbRender();return}
  if(t.hasAttribute('data-gfi')){G9C.filt={all:'own',own:'fav',fav:'rac',rac:'all'}[G9C.filt];gbRender();return}
  if(t.dataset.gfav){G9C_favT(GAR_set(t.dataset.gfav),G9C.type);gbRender();return}
  if(t.dataset.ged){const S=GAR_set(t.dataset.ged);if(GAR_get().sel!==S.id)GAR_select(S.id);GB_enter();return}
  if(t.dataset.gc){const S=GAR_set(t.dataset.gc);G9C_equip(S,G9C.type);GAR_.pv=G9C.type==='off'?'4x4':G9C.type}});G9C_pump()})(GAR_tab);
{const st=document.createElement('style');st.textContent=`#g9Col{margin:2px 0 6px}#g9Col .g9Bar{display:flex;flex-wrap:wrap;gap:6px;align-items:center}
#g9Col .g9Ty,#g9Col .g9Ch{height:34px;padding:0 10px;border-radius:17px;border:1px solid rgba(76,234,255,.45);background:rgba(6,18,31,.9);color:#fff;font:900 12px system-ui;white-space:nowrap;cursor:pointer}
#g9Col .g9Ty.on{background:linear-gradient(90deg,#22c5e4,#8c55ff);color:#05030f}#g9Col .g9Ty small{font-size:12px;opacity:.8}#g9Col .g9Ch{border-color:rgba(255,209,44,.6);color:#ffd12c}
#g9Col .g9Cnt{font:700 12px system-ui;color:#8fb3c7;margin:5px 0}#g9Col .g9Grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px}
#g9Col .g9Card{position:relative;display:grid;gap:1px;padding:6px 6px 8px;border-radius:12px;background:linear-gradient(#1b2a3c,#0b1522);border:2px solid rgba(255,255,255,.12);border-bottom:5px solid var(--tc);cursor:pointer;color:#fff;min-height:132px}
#g9Col .g9Card.on{border-color:#5dffb0;box-shadow:0 0 12px rgba(93,255,176,.5);border-bottom-color:var(--tc)}#g9Col .g9Card.lock{opacity:.55}#g9Col .g9Card.lock img{filter:grayscale(1) brightness(.6)}
#g9Col .g9Card img{width:100%;aspect-ratio:168/104;border-radius:8px;background:radial-gradient(ellipse at 50% 70%,#3a4a5e,#152232 70%)}
#g9Col .g9R{position:absolute;left:10px;top:10px;font:900 12px system-ui;font-style:normal;letter-spacing:.04em;color:#05030f;background:var(--tc);border-radius:6px;padding:1px 6px}
#g9Col .g9Fav{position:absolute;right:8px;top:6px;width:36px;height:36px;border:0;background:none;color:#ffd12c;font-size:22px;cursor:pointer;text-shadow:0 1px 3px #000}
#g9Col .g9Card b{font:900 13px system-ui;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#g9Col .g9Card small{font:700 12px system-ui;color:#8fb3c7}#g9Col .g9Card.on small{color:#5dffb0}
#g9Col .g9Ed{justify-self:start;height:30px;margin-top:3px;padding:0 10px;border-radius:9px;border:0;background:linear-gradient(90deg,#ffd12c,#ff7a1c);color:#141413;font:900 12px system-ui;cursor:pointer}
#g9Col .g9New{min-height:120px;border-radius:12px;border:2px dashed #ffd12c!important;background:rgba(255,209,44,.08)!important;display:grid;place-content:center;text-align:center;gap:4px}#g9Col .g9New b{font:900 13px system-ui;color:#ffd12c}#g9Col .g9New small{font:700 12px system-ui}
#g9Col .g9None{font:700 12px system-ui;color:#8fb3c7;grid-column:1/-1}
@media (max-height:500px){#g9Col .g9Grid{grid-template-columns:repeat(auto-fill,minmax(138px,1fr))}#g9Col .g9Card{min-height:0}}`;document.head.appendChild(st)}
window.__g9c={S:G9C,list:f=>G9C_list(f||G9C.type).A.map(e=>e.S.id),eq:f=>G9C_eq(f),T:G9_T,render:(id,f,w,h)=>G9C_render(GAR_set(id),f||'car',w,h),bricks:(id,f)=>G9C_bricks(GAR_set(id),f||'car')};
