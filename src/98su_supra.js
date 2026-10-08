// ===== SU (supra): the orange street racer after Speed Champions 77260 + 3 variations + 3 similar-style tuners (docs/research/SUPRA.md) =====
// 77260 booklet (lego.com 6649353.pdf): 8-wide chassis 6605193, 4 orange mudguards (2× 6491330 plain, 2× 6614371 printed), silver 5-spoke rims 6610986 on tyres 6575731,
// windscreen 6614372 (orange frame), open targa cockpit with 2 blue seats, black uprights behind the seats, light/dark grey rear wing on 2 struts, lime plates = side graphic,
// low rounded nose of orange curved slopes with dark twin headlight clusters and a black intake. Real proportions: stud 8 mm, plate 3.2, brick 9.6 (GB_U .6 / GB_PH .24).
// UI names are original (no brand names); set numbers live only in comments/docs. All are normal size (≤ 10 wide, 18 long) → BC keeps default handling.
// ---- parts: wheel L with gold rims (wLG, after 77262's gold wheels), same size as wL
CR_WH.wLG=Object.assign({},CR_WH.wL);GB_PC.wLG=Object.assign({},GB_PC.wL,{n:'Wheel L gold',hide:1});
CR_wheel=(f=>function(t){if(t!=='wLG')return f(t);const k='suLG'+(CR_LO?'lo':'');if(CR_wgeo[k])return CR_wgeo[k];const g=f('wL').clone(),C=g.attributes.color,T=new THREE.Color('#c9a227');
 for(let i=0;i<C.count;i++){const r=C.getX(i),gg=C.getY(i),b=C.getZ(i);if(r>.35&&Math.abs(r-gg)<.08&&Math.abs(gg-b)<.1)C.setXYZ(i,T.r,T.g,T.b)}C.needsUpdate=true;return CR_wgeo[k]=g})(CR_wheel);
// ---- body generator. o: B body, G graphic (lime), W wing colour, wing/spoiler/none, cab 'targa'|'coupe'|'open', wide (track flares), wh wheel type, eng (engine through the hood)
function SU_car(o){const A=[],B=o.B,K=CR_K,DG=CR_DG,GR=o.G||'#a5ca18',S=o.S||B,add=(t,x,z,r,c,y)=>{CR_reg(t);A.push([t,x,z,r,c,y])},
 sym=(t,x,z,r,c,y)=>{CR_reg(t);const fw=(r%2?GB_PC[t].d:GB_PC[t].w);add(t,x,z,r,c,y);if(x!==-x-fw)add(t,-x-fw,z,(4-r)%4,c,y)},wh=o.wh||'wL',wy=(.12-CR_WH[wh].r)/GB_PH,w=o.wide?1:0;
 // chassis 6605193 (8 wide) + 4 mudguards over silver-rim wheels, wheelbase 10 studs
 add('T6x16',-3,-8,0,K,0);sym('T1x6',-4,-3,0,K,0);sym('T1x1',-4,-8,0,K,0);sym('T1x1',-4,7,0,K,0);
 for(const z of[-7,3]){sym('arch',-4-w,z,0,o.A||B,0);sym(wh,-4-w,z,0,K,wy);if(w){sym('B1x4',-4,z,0,K,1);sym('C1x4',-5,z,0,o.F||B,6)}}
 if(w){sym('T1x6',-5,-3,0,K,0);sym('B1x6',-5,-3,0,B,1);sym('T1x6',-5,-3,0,GR,4)}
 // nose: black intake + low bumper, dark twin headlight clusters on curved slopes, rounded hood falling to the nose
 add('P8x1',-4,-8,0,K,1);add('grl',-2,-8,1,K,2);add('grl',0,-8,1,K,2);sym('B1x1',-4,-8,0,B,2);sym('B1x1',-3,-8,0,B,2);add('C8x1',-4,-8,0,B,3);
 add('B4x4',-2,-7,0,K,1);sym('cs14',-2,-7,0,B,4);sym('cs14',-1,-7,0,o.H||B,4);
 // twin round lamps flush on top of each front mudguard
 sym('rt',-4-w,-7,0,'#e8eef4',6);sym('rt',-3-w,-7,0,'#e8eef4',6);
 if(o.eng){add('eng',-2,-6,0,'#a0a5a9',6);add('scoop',-1,-6,0,K,10)}
 // flanks: door bricks, lime graphic plate (side stripe), body-colour belt line
 sym('B1x6',-4,-3,0,B,1);sym('T1x6',-4,-3,0,GR,4);sym('grl',-4,1,0,K,3);sym('T1x6',-4,-3,0,B,5);
 // cabin: windscreen 6614372 over an open cockpit, two blue seats, driver on the left seat, black uprights behind the seats (targa)
 add('T6x6',-3,-3,0,K,1);add('drvL',-3,-1,0,B,2);
 const SE=()=>{const c=o.st||'#0055bf';add('P2x2',1,-1,0,c,2);add('B2x1',1,0,0,c,3);add('P2x1',-3,0,0,c,6)};
 if(o.cab==='coupe'){add('ws6',-3,-3,0,o.R||B,6);add('ws6',-3,0,2,o.R||B,6);add('T6x2',-3,-1,0,o.R||B,10);SE()}
 else{add('ws6',-3,-3,0,o.R||B,6);SE();if(o.cab!=='open'){sym('B1x2',-3,1,0,K,6);add('T6x1',-3,2,0,o.R||B,9)}}
 // rear deck: curved slopes sweeping to the tail, round taillights, black diffuser
 add('T4x4',-2,3,0,K,3);sym('cs14',-2,3,2,B,4);sym('cs14',-1,3,2,o.H||B,4);
 // side graphic sweeping over the rear mudguards (the printed arches of the set)
 sym('T1x4',-4-w,3,0,GR,6);
 sym('tl',-4,7,2,'#d01712',1);sym('tl',-3,7,2,'#d01712',1);add('B4x1',-2,7,0,K,1);add('C8x1',-4,7,2,B,4);add('diff',-2,8,0,K,0);
 // rear wing on two struts (light grey blade, dark grey end plates on the real set) or a duck-tail
 if(o.rear==='wing')add('wing',-4,5,0,o.W||'#a0a5a9',o.wy||5);else if(o.rear==='spoiler')add('spoiler',-3,6,0,o.W||B,5);
 if(o.lp)add('lp',-1,8,0,o.lp,1);for(const e of o.x||[])add(...e);return A}
const SU_O='#fe8a18';
// family = 77260 + variations; similar = other Speed Champions street tuners (style only; no brands in the UI)
const SU_T=[
 {id:'t_su',n:'Orange Street Racer',tier:'l',ref:'77260',k:'Street tuner',fam:1,car:()=>SU_car({B:SU_O,rear:'wing'}),st:{top:1.07,acc:1.06,han:1.04,hull:1}},
 {id:'t_su_mid',n:'Midnight Street Racer',tier:'e',ref:'77260',k:'Street tuner · night livery',fam:1,car:()=>SU_car({B:'#1b2a34',G:'#8a12a8',W:'#1b2a34',A:'#1b2a34',H:'#8a12a8',st:'#8a12a8',rear:'wing'}),st:{top:1.07,acc:1.06,han:1.04,hull:1}},
 {id:'t_su_gt',n:'Orange Street GT',tier:'r',ref:'77260',k:'Street tuner · hardtop, no wing',fam:1,car:()=>SU_car({B:SU_O,cab:'coupe',R:SU_O,rear:'spoiler'}),st:{top:1.08,acc:1.05,han:1.03,hull:1.02}},
 {id:'t_su_wide',n:'Widebody Track Racer',tier:'l',ref:'77260',k:'Street tuner · widebody track',fam:1,car:()=>SU_car({B:'#f4f4f4',G:'#d01712',F:'#d01712',H:'#d01712',wide:1,rear:'wing',W:'#1b2a34',wy:6,lp:'#fac80a'}),st:{top:1.08,acc:1.06,han:1.06,hull:.98}},
 {id:'t_su_sky',n:'Silver Night Tuner',tier:'e',ref:'76917',k:'Street tuner coupe',fam:2,car:()=>SU_car({B:'#a0a5a9',G:'#0055bf',H:'#0055bf',cab:'coupe',R:'#a0a5a9',rear:'wing',W:'#a0a5a9'}),st:{top:1.08,acc:1.05,han:1.04,hull:1}},
 {id:'t_su_pink',n:'Pink Roadster',tier:'r',ref:'77241',k:'Roadster',fam:2,car:()=>SU_car({B:'#e4adc8',G:'#f4f4f4',cab:'open',st:CR_K,R:CR_K}),st:{top:1.05,acc:1.06,han:1.05,hull:.98}},
 {id:'t_su_v8',n:'Black Gold V8',tier:'l',ref:'77262',k:'Gymkhana muscle car',fam:2,car:()=>SU_car({B:CR_K,G:'#a0a5a9',A:CR_K,wide:1,F:CR_K,wh:'wLG',eng:1,cab:'coupe',R:CR_K,rear:'spoiler',W:CR_K,st:'#f4f4f4'}),st:{top:1.06,acc:1.08,han:1.03,hull:1.04}}];
{const R=GAR_set('rod'),L=n=>JSON.parse(JSON.stringify(R.load[n]));
 for(const T of SU_T)GAR_SETS.push({id:T.id,n:T.n,tier:T.tier,req:null,car:T.car,off:R.off,boat:R.boat,tpl:1,ref:T.ref,forms:['car'],fam:T.fam,
  load:{car:{name:T.n.toUpperCase(),k:'Street',st:T.st,w:'Medium',perk:'slip'},'4x4':L('4x4'),boat:L('boat')}})}
// ---- RIDES: the street-racer family as its own row at the top of the STREET collection (header, then the 4 family cards, then the 3 similar tuners)
function SU_rows(){const G=$('#g9Col .g9Grid');if(!G||G9C.type!=='car'||G9C.sort!=='rar'||G9C.filt!=='all'||G.querySelector('.suHd'))return;
 const card=id=>G.querySelector(`.g9Card[data-gc="${id}"]`),hd=(t,s)=>{const d=document.createElement('div');d.className='suHd';d.innerHTML=`<b>${t}</b><small>${s}</small>`;return d};
 const F=SU_T.filter(T=>T.fam===1).map(T=>card(T.id)).filter(Boolean),M=SU_T.filter(T=>T.fam===2).map(T=>card(T.id)).filter(Boolean);if(!F.length&&!M.length)return;
 const rest=hd('ALL RIDES',''),first=G.querySelector('.g9Card');G.insertBefore(hd('🧡 STREET RACER FAMILY','the orange racer + 3 variations'),first);for(const c of F)G.insertBefore(c,first);
 if(M.length){G.insertBefore(hd('🏁 TUNER FRIENDS','same street-tuner style'),first);for(const c of M)G.insertBefore(c,first)}G.insertBefore(rest,first)}
GAR_tab=(f=>function(){f();try{SU_rows()}catch(e){}})(GAR_tab);
{const st=document.createElement('style');st.textContent=`#g9Col .suHd{grid-column:1/-1;display:flex;align-items:baseline;gap:8px;padding:6px 2px 0;color:#fff}#g9Col .suHd b{font:900 13px system-ui;letter-spacing:.04em}#g9Col .suHd small{font:700 12px system-ui;color:#8fb3c7}`;document.head.appendChild(st)}
window.__su={T:SU_T,car:SU_car,n:id=>{const S=GAR_set(id);return S&&S.id===id?S.car().length:0}};
