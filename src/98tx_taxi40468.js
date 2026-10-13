// ---- TX (garage-14/15, 2026-10-10). Alex asked for the LEGO 40468 Yellow Taxi, built from the official instructions (docs/TAXI_40468_STEPS.md).
// 1) OFFSETS: optional brick fields ox / oz (studs) and oy (plates) move a part off the stud grid (SNOT faces, the ½-stud cabin and roof).
//    Footprint, stacking and collision stay cell based; only the drawn part moves. Mirror twins get −ox.
// 2) NUDGE: in SELECT, ✥ NUDGE on the selection bar opens ← → ↑ ↓ ⤒ ⤓ (x/z ¼ stud, y ½ plate); on PC Alt+arrows and Alt+PgUp/PgDn.
// 3) COLOURS: c = '~#hex' builds the part in glass (trans-clear, trans-red …), c = '*#hex' makes it a lit part (tail lights).
// 4) PRINTED / NEW PARTS: TAXI door brick, LDC-812 number plate, the two roof-sign tiles, curved plate 2×4×2/3 (88930),
//    lamp holder (41632), bearing element (18892). Prints are vertex-colour geometry (no textures).
// 5) TILTED PARTS FIX: a tipped part ('<part>@xzq') was built from the parts chain that existed BEFORE the tilt wrapper, so tipped
//    G13 parts (bracket, SNOT bricks …) and these new parts drew as plain boxes. The tilt is now applied over the whole chain.
// 6) PRESET "Yellow Taxi (40468)" (id t_taxi) in RIDES: 6 wide, solid yellow, SNOT ends, ½-stud cabin/roof, black TAXI doors,
//    green/blue roof sign, no chequer stripe (the real set has none).
const TX={pad:0};
// ---------- new parts
const TX_NEW={tx12:['Brick 1×2 TAXI print',2,1,3,'Bricks',3004],lp12:['Tile 1×2 number plate',1,2,1,'Tiles',3069],
 sg14g:['Tile 1×4 sign BRICK OVEN!',1,4,1,'Tiles',2431],sg14b:['Tile 1×4 sign stars',1,4,1,'Tiles',2431],
 cp24:['Curved plate 2×4×2/3',4,2,2,'Slopes',88930],lh11:['Lamp holder 1×1',1,1,1,'Vehicle',41632],be24:['Bearing element 2×4',4,2,3,'Vehicle',18892]};
for(const k in TX_NEW){const[n,w,d,h,cat,id]=TX_NEW[k];GB_PC[k]={n,w,d,h,cat,ic:'▭',g:cat==='Tiles'?'T':undefined};G13_ID[k]=id}
Object.assign(G13_AL,{tx12:'taxi door sticker print',lp12:'license number plate print ldc',sg14g:'taxi roof sign pizza print',sg14b:'taxi roof sign stars print',
 cp24:'bow curved slope hood',lh11:'lamp holder clip mirror',be24:'wheel holder axle'});
// 3×5 pixel font for the prints
const TX_F={T:'111010010010010',A:'010101111101101',X:'101101010101101',I:'111010010010111',L:'100100100100111',D:'110101101101110',C:'011100100100011',
 '-':'000000111000000','8':'111101111101111','1':'010110010010111','2':'111001111100111',B:'110101110101110',R:'110101110101101',K:'101101110101101',
 O:'111101101101111',V:'101101101101010',E:'111100110100111',N:'101111111101101','!':'010010010000010',' ':'000000000000000'};
// text centred on (cu,cv), pixel p; R(u0,u1,v0,v1) gets one rectangle per horizontal run of pixels
function TX_txt(s,cu,cv,p,R){const W=(s.length*4-1)*p,H=5*p;for(let i=0;i<s.length;i++){const g=TX_F[s[i]]||TX_F[' '];
 for(let r=0;r<5;r++){let k=0;while(k<3){if(g[r*3+k]!=='1'){k++;continue}let e=k;while(e<3&&g[r*3+e]==='1')e++;const u0=cu-W/2+(i*4+k)*p,v0=cv+H/2-(r+1)*p;R(u0,u0+(e-k)*p,v0,v0+p);k=e}}}}
GB_piece=(f=>function(t,c,M,L){if(!TX_NEW[t])return f(t,c,M,L);
 const P=GB_PC[t],U=GB_U,W=P.w*U,D=P.d*U,H=P.h*GB_PH,g=.008,col=GB_BC[c]||c,x0=-W/2+g,x1=W/2-g,z0=-D/2+g,z1=D/2-g,PH=GB_PH,dk='#1b1d22';
 // a print on the top face: u runs along +z, v along +x (a tipped tile reads the right way round on both car sides)
 const top=(u0,u1,v0,v1,cl,l)=>M.push(GB_box(v0,v1,H,H+.003*l,u0,u1,cl));
 if(t==='tx12'){M.push(CR_bb(x0,x1,0,H,z0,z1,col));CR_studs(M,2,1,H,col);
  // the −z face: u to the viewer's right (−x), v up
  const fr=(u0,u1,v0,v1,cl,l)=>M.push(GB_box(-u1,-u0,v0,v1,z0-.004*l,z0,cl));const cv=H/2;
  fr(-.45,.45,cv-.21,cv+.21,dk,1);fr(-.41,.41,cv-.17,cv+.17,'#f7d117',2);TX_txt('TAXI',0,cv,.045,(a,b,v0,v1)=>fr(a,b,v0,v1,dk,3))}
 else if(t==='lp12'){M.push(CR_bb(x0,x1,0,H,z0,z1,col));top(-.56,.56,.15,.25,'#0055bf',1);TX_txt('LDC-812',0,-.04,.031,(a,b,v0,v1)=>top(a,b,v0,v1,dk,2))}
 else if(t==='sg14g'){M.push(CR_bb(x0,x1,0,H,z0,z1,col));top(-1.13,1.13,-.24,.24,'#00852b',1);TX_txt('BRICK OVEN!',-.3,.02,.026,(a,b,v0,v1)=>top(a,b,v0,v1,'#f4f4f4',2));
  top(-.98,.4,-.17,-.155,'#f4f4f4',2);// dashed underline
  for(let i=0;i<5;i++){const w=.17-i*.035;top(.62+i*.07,.69+i*.07,-w,w,i?'#f2b33d':'#c9822b',2)}for(const[u,v]of[[.72,.07],[.8,-.05],[.9,.03]])top(u-.022,u+.022,v-.022,v+.022,'#c8102e',3)}
 else if(t==='sg14b'){M.push(CR_bb(x0,x1,0,H,z0,z1,col));top(-1.13,1.13,-.24,.24,'#1d3f94',1);
  for(const u of[-.95,-.72,-.49]){top(u-.06,u+.06,-.018,.018,'#f4f4f4',2);top(u-.018,u+.018,-.06,.06,'#f4f4f4',2)}
  top(.05,.42,-.12,.04,'#f2c400',2);top(.13,.34,.04,.11,'#f2c400',2);// little taxi
  top(.66,.84,-.17,.0,'#3fa66b',2);top(.71,.79,0,.17,'#3fa66b',2);top(.62,.72,.12,.2,'#3fa66b',2)}// statue
 else if(t==='cp24')M.push(CR_side([[z1,0],[z1,H],['q',z0+D*.3,H,z0,H*.18],[z0,0]],x0,x1,col));
 else if(t==='lh11'){M.push(CR_bb(x0,x1,0,H,z0,z1,col));CR_stud(M,0,H,0,col);M.push(GB_box(-.06,.06,.03,H-.03,z0-.16,z0,col));
  const r=new THREE.TorusGeometry(.1,.035,6,14);r.translate(0,H/2,z0-.22);M.push(GB_col(r,col))}
 else if(t==='be24'){M.push(CR_bb(x0+.25,x1-.25,H*.35,H,z0+.1,z1-.1,col));const a=new THREE.CylinderGeometry(.09,.09,W-.04,10);a.rotateZ(Math.PI/2);a.translate(0,H*.45,0);M.push(GB_col(a,col));
  for(const s of[-1,1])M.push(CR_bb(s>0?x1-.32:x0+.12,s>0?x1-.12:x0+.32,H*.15,H,z0+.25,z1-.25,col))}})(GB_piece);
// ---------- tipped parts over the whole chain (fix 5); same maths as the G13 tilt wrapper
GB_piece=(f=>function(t,c,M,L){const m=typeof t==='string'&&G13_RX.exec(t);if(!m||!GB_PC[t])return f(t,c,M,L);
 const P=GB_PC[m[1]],Q=GB_PC[t],m0=M.length,l0=L.length,G=typeof CR_G!=='undefined'?CR_G:null,g0=G?G.length:0;f(m[1],c,M,L);
 const X=new THREE.Matrix4().makeTranslation(0,-P.h*GB_PH/2,0).premultiply(G13_mat(+m[2],+m[3],+m[4])).premultiply(new THREE.Matrix4().makeTranslation(0,Q.h*GB_PH/2,0));
 for(let i=m0;i<M.length;i++)M[i].applyMatrix4(X);for(let i=l0;i<L.length;i++)L[i].applyMatrix4(X);if(G)for(let i=g0;i<G.length;i++)G[i].applyMatrix4(X)})(GB_piece);
// ---------- glass '~#hex' / lit '*#hex' colours (outermost: the part is built into a temporary list, then moved)
GB_piece=(f=>function(t,c,M,L){if(typeof c!=='string'||(c[0]!=='~'&&c[0]!=='*'))return f(t,c,M,L);const T=[];f(t,c.slice(1),T,L);
 const D=c[0]==='*'?L:(typeof CR_G!=='undefined'&&CR_G?CR_G:M);for(const g of T)D.push(g)})(GB_piece);
// ---------- offsets
const TX_o=b=>[+b.ox||0,+b.oy||0,+b.oz||0];
GB_brickGeo=(f=>function(b,M,L){const[ox,oy,oz]=TX_o(b);if(!ox&&!oy&&!oz)return f.apply(this,arguments);
 const m0=M.length,l0=L.length,G=typeof CR_G!=='undefined'?CR_G:null,g0=G?G.length:0,Wl=typeof CR_W!=='undefined'?CR_W:null,w0=Wl?Wl.length:0;const r=f.apply(this,arguments);
 const X=ox*GB_U,Y=oy*GB_PH,Z=oz*GB_U;for(let i=m0;i<M.length;i++)M[i].translate(X,Y,Z);for(let i=l0;i<L.length;i++)L[i].translate(X,Y,Z);
 if(G)for(let i=g0;i<G.length;i++)G[i].translate(X,Y,Z);if(Wl)for(let i=w0;i<Wl.length;i++)Wl[i].o.add(new THREE.Vector3(X,Y,Z));return r})(GB_brickGeo);
// ---------- NUDGE (select one part, or a few: each moves; the mirror twin moves the mirrored way)
const TX_AX={xl:['x',-.25],xr:['x',.25],zf:['z',-.25],zb:['z',.25],yu:['y',.5],yd:['y',-.5]};
function TX_off(o,ax,d){const k='o'+ax,lim=ax==='y'?3:1,v=Math.round(clamp((+o[k]||0)+d,-lim,lim)*1000)/1000;if(v)o[k]=v;else delete o[k]}
function TX_nudge(a){const A=TX_AX[a];if(!A||!GB_.bk||GB_.tool!=='sel'||!SL.sel.length||SL.carry)return 0;const[ax,d]=A,S=SL.sel.slice(),b=S[0],tw=GB_.mir?SL_twin(b):null;
 GB_snap();const done=new Set();for(const o of S){if(done.has(o))continue;TX_off(o,ax,d);done.add(o);const w=GB_.mir?SL_twin(o):null;if(w&&!done.has(w)&&w!==o){TX_off(w,ax,ax==='x'?-d:d);done.add(w)}}
 GB_refresh();SL_set(S);const[ox,oy,oz]=TX_o(b),f=v=>(v>0?'+':'')+v;try{AU.sfx('pick')}catch(e){}
 GS_tip('✥ Nudged · x '+f(ox)+' · z '+f(oz)+' studs · y '+f(oy)+' plates'+(GS.pt==='mouse'?' · Alt+arrows':''));return 1}
G13_keys=(f=>function(e){if(e.altKey&&!e.ctrlKey&&!e.metaKey){const a={ArrowLeft:'xl',ArrowRight:'xr',ArrowUp:'zf',ArrowDown:'zb',PageUp:'yu',PageDown:'yd'}[e.code];
 if(a&&GB_.bk){e.preventDefault();if(!TX_nudge(a))GS_tip('Select a part (S) to nudge it');GB_ui();return 1}}return f.apply(this,arguments)})(G13_keys);
function TX_mk(){const B=$('#slBar');if(B&&!B.querySelector('[data-txs]')){B.insertAdjacentHTML('beforeend','<button data-txs="nudge"><i>✥</i><span>NUDGE</span></button>');
  B.addEventListener('click',e=>{const x=e.target.closest('[data-txs]');if(!x)return;e.stopPropagation();try{AU.sfx('pick')}catch(_){}TX.pad=TX.pad?0:1;if(TX.pad){G13.pad=0;G13_gizHide()}G13_ui()},true)}
 if(!$('#txPad')){const v=$('#gbx .gbv');if(v){const D=document.createElement('div');D.id='txPad';D.hidden=true;
  D.innerHTML=[['xl','←','X −'],['xr','→','X +'],['zf','↑','FRONT'],['zb','↓','BACK'],['yu','⤒','UP ½'],['yd','⤓','DOWN ½']].map(([a,i,n])=>`<button data-txa="${a}"><i>${i}</i>${n}</button>`).join('');
  v.appendChild(D);for(const k of['pointerdown','pointerup'])D.addEventListener(k,e=>e.stopPropagation());
  D.addEventListener('click',e=>{const x=e.target.closest('[data-txa]');if(!x)return;e.stopPropagation();TX_nudge(x.dataset.txa)})}}}
// Alex (2026-10-10): "maybe including the lego ids would make it more easy to find the items" → every part tile shows its LEGO design id; search takes ids
function TX_ids(){for(const b of GX_tiles()){if(b.querySelector('.txId'))continue;const id=G13_ID[b.dataset.p];if(!id)continue;const e=document.createElement('b');e.className='txId';e.textContent=id;b.appendChild(e)}
 const I=$('#g13Qi');if(I&&!I.dataset.tx){I.dataset.tx=1;I.placeholder='Part or LEGO id'}}
function TX_ui(){const D=$('#txPad');if(!GB_.bk){TX.pad=0;if(D)D.hidden=true;return}TX_mk();try{TX_ids()}catch(e){}const sel=GB_.tool==='sel'&&SL.sel.length>0&&!SL.carry;if(!sel||G13.pad)TX.pad=0;
 const S=$('#slBar'),P=$('#txPad');if(S){const n=S.querySelector('[data-txs]');if(n)n.classList.toggle('on',!!TX.pad)}
 if(P){P.hidden=!TX.pad;const X=$('#gbx');if(TX.pad&&S&&!S.hidden&&X){const r=S.getBoundingClientRect(),q=X.getBoundingClientRect();P.style.left=(r.right-q.left+12)+'px';P.style.top=(r.top-q.top)+'px'}}}
G13_ui=(f=>function(){const r=f.apply(this,arguments);try{TX_ui()}catch(e){console.warn('TX',e)}return r})(G13_ui);
{const st=document.createElement('style');st.textContent=`#txPad{position:absolute;z-index:31;display:grid;grid-template-columns:repeat(2,64px);gap:8px;pointer-events:auto}#txPad[hidden]{display:none}
#txPad button{height:44px;border-radius:10px;border:2px solid #141413;background:#fff;color:#141413;font:italic 900 12px system-ui;display:flex;flex-direction:column;align-items:center;justify-content:center;line-height:1;box-shadow:0 2px 0 #141413}
#txPad button i{font-style:normal;font-size:16px}#gbx.r2 #slBar [data-txs].on{background:#ffd400}#gbx.r2 #slBar.g13X [data-txs]{display:none}
#gbBkPc .gbPc:has(.g13Ct:not([hidden])) .txId{display:none}
#gbBkPc .txId{position:absolute;top:2px;left:4px;font:800 12px/14px system-ui;color:#5a6270;font-style:normal;pointer-events:none}`;document.head.appendChild(st)}
// palette tiles for the new parts
{const S=$('#gbBkPc');if(S)for(const k in TX_NEW){const P=GB_PC[k];if(S.querySelector(`.gbPc[data-p="${k}"]`))continue;const b=document.createElement('button');b.className='gbPc';b.dataset.p=k;b.dataset.ct=P.cat;b.dataset.n=P.n;b.innerHTML=`<i>${P.ic}</i>${P.n}`;b.style.display=GB_.ct===P.cat?'':'none';
  const last=[...S.querySelectorAll(`.gbPc[data-ct="${P.cat}"]`)].pop();if(last)last.after(b);else S.appendChild(b)}}
// ---------- the 40468 preset, step by step from docs/TAXI_40468_STEPS.md (x across −3..3, z front −7 … back 7, y in plates; front = −z)
function TX_CAR(){const A=[],Y='#fac80a',W='#f4f4f4',K=CR_K,DSG='#6c6e68',MSG='#a0a5a9',BL='#0055bf',G='#00852b',TC='~#b4dcff',TR='*#ff3b2a';
 const dim=(t,r)=>{CR_reg(t);const P=GB_PC[t];return[r%2?P.d:P.w,r%2?P.w:P.d,P.h]};
 // C: centre (studs, studs, plates) → cell + offsets; B: footprint box + bottom
 const C=(t,r,c,cx,cz,cy)=>{const[fw,fd,h]=dim(t,r),x=Math.round(cx-fw/2+1e-6),z=Math.round(cz-fd/2+1e-6),y=Math.round(cy-h/2+1e-6),b={t,x,z,y,r,m:0,c},
  q=v=>Math.round(v*1000)/1000,ox=q(cx-fw/2-x),oz=q(cz-fd/2-z),oy=q(cy-h/2-y);if(ox)b.ox=ox;if(oz)b.oz=oz;if(oy)b.oy=oy;A.push(b)};
 const B=(t,r,c,xa,xb,za,zb,y0)=>C(t,r,c,(xa+xb)/2,(za+zb)/2,y0+dim(t,r)[2]/2);
 const S=[[-3,-1],[1,3]];
 // 1-3 chassis
 B('P2x14',0,DSG,-1,1,-7,7,0);B('p16',1,Y,-3,3,-7,-6,1);B('p16',1,Y,-3,3,6,7,1);
 B('p24',0,K,-1,1,-6,-2,1);B('p24',0,K,-1,1,2,6,1);B('p46',1,Y,-3,3,-2,2,1);B('p13',0,MSG,-2,-1,-1.5,1.5,0);B('p13',0,MSG,1,2,-1.5,1.5,0);
 // 4-11 back
 B('b24',0,W,-1,1,3,7,2);for(const[a,b]of S){B('inv22',0,Y,a,b,5,7,2);B('inv22',2,Y,a,b,1,3,2)}
 B('tx12',1,Y,-3,-2,-1,1,2);B('tx12',3,Y,2,3,-1,1,2);
 B('p23',0,BL,-1,1,3,6,5);for(const x of[-2,0,2])C('br22@020',2,Y,x,6.9,3.5);for(const[a,b]of S)B('p26',0,Y,a,b,0,6,5);
 C('p14@010',1,DSG,0,7.6,2.25);C('t14@010',1,Y,0,8,2.25);C('lp12@010',1,W,0,7.6,4.75);
 for(const s of[-1,1]){C('t11@010',1,K,s*1.5,7.6,4.75);C('t11@010',1,TR,s*2.5,7.6,4.75)}C('ch@110',0,Y,-2.5,7.8,2.25);C('ch@130',0,Y,2.5,7.8,2.25);
 // 12-18 front
 B('b26',0,MSG,-1,1,-7,-1,2);for(const[a,b]of S){B('inv22',2,Y,a,b,-7,-5,2);B('inv22',0,Y,a,b,-3,-1,2)}
 B('p12',1,G,-1,1,-6,-5,5);for(const x of[-2,0,2])C('br22@020',0,Y,x,-6.9,3.5);B('p24',0,K,-1,1,-5,-1,5);for(const[a,b]of S)B('p26',0,Y,a,b,-6,0,5);
 C('p16@010',3,Y,0,-7.6,2.25);C('p14@010',3,DSG,0,-8,2.25);C('lp12@010',3,W,0,-8.4,2.25);for(const s of[-1,1])C('t11@010',3,Y,s*1.5,-8.4,2.25);
 C('ch@330',0,Y,-2.5,-8.2,2.25);C('ch@310',0,Y,2.5,-8.2,2.25);
 C('p14@010',3,DSG,0,-7.6,4.75);for(const s of[-1,1])C('grl@010',3,K,s,-8,4.75);C('ch@330',0,TC,-2.5,-7.8,4.75);C('ch@310',0,TC,2.5,-7.8,4.75);
 // 19-22 boot, jumpers (the ½-stud offset seats)
 B('cp24',2,Y,-2,2,5,7,6);for(const x of[-1,0,1])C('jmp',0,MSG,x,4,6.5);B('t13',0,Y,-3,-2,4,7,6);B('t13',0,Y,2,3,4,7,6);
 for(let z=-1;z<4;z++)for(const[a,b]of S)B('jmp',1,Y,a,b,z,z+1,6);for(const a of[-3,-1,1])for(const z of[-3,-2])B('jmp',1,Y,a,a+2,z,z+1,6);
 // 23-25 cabin: windscreen, side windows, pillars, rear window (on the ½ offset)
 for(const a of[-3,-1,1])B('s22',0,TC,a,a+2,-3,-1,7);for(const[a,b]of S)B('b12',1,TC,a,b,-1,0,7);
 B('b11',0,K,-2.5,-1.5,0,1,7);B('b14',1,K,-1.5,2.5,0,1,7);B('b11',0,TC,-2.5,-1.5,1,2,7);B('b11',0,TC,1.5,2.5,1,2,7);
 B('s21',2,Y,-2.5,-1.5,2,4,7);B('s21',2,Y,1.5,2.5,2,4,7);B('s21',2,TC,-1.5,-.5,3,5,7);B('s21',2,TC,.5,1.5,3,5,7);
 // garage-16 (readability, not in the set): black seats + dash inside the cabin, so the windows read as windows through the glass in the drive camera
 B('b22',0,K,-1,1,-1,1,2);B('b22',0,K,-1,1,1,3,2);B('p12',1,K,-1,1,0,1,5);B('p12',1,K,-1,1,2,3,5);
 // 26-30 hood, mirrors, roof (5 wide on the ½ offset)
 B('p24',1,Y,-2,2,-5,-3,6);B('lh11',1,Y,-3,-2,-4,-3,6);B('lh11',3,Y,2,3,-4,-3,6);
 B('p14',1,Y,-2,2,-7,-6,6);B('t13',0,Y,-3,-2,-7,-4,6);B('t13',0,Y,2,3,-7,-4,6);
 B('p16',0,Y,-.5,.5,-2,4,10);for(const a of[-2.5,-1.5,.5,1.5])B('t16',0,Y,a,a+1,-2,4,10);
 B('cp24',0,Y,-2,2,-7,-5,7);B('t23',0,Y,-2,0,-5,-2,7);B('t23',0,Y,0,2,-5,-2,7);
 C('t11h@010',0,K,-3.35,-3.5,7.5);C('t11h@030',0,K,3.35,-3.5,7.5);
 // 31 wheels: bearing elements under the black seats, tyres Ø21 mm (wM is the true size), ground ≈ 4.8 plates under the chassis
 B('be24',0,K,-2,2,-5,-3,-3);B('be24',0,K,-2,2,3,5,-3);for(const z of[-6,2])for(const x of[-3,2])A.push({t:'wM',x,z,y:-4.6,r:0,m:0,c:K});
 // 32 roof sign: SNOT bricks, the two printed faces (stars on the left, BRICK OVEN! on the right), double-slope roof
 for(const z of[0,2])C('b12s4',1,W,0,z,12.5);C('sg14b@010',0,W,-.7,1,12.5);C('sg14g@010',2,W,.7,1,12.5);for(let z=-1;z<3;z++)C('s11d',1,W,0,z+.5,15);
 return A}
{const R=GAR_set('rod'),L=n=>JSON.parse(JSON.stringify(R.load[n]));
 GAR_SETS.push({id:'t_taxi',n:'Yellow Taxi (40468)',tier:'c',req:null,car:TX_CAR,off:R.off,boat:R.boat,tpl:1,ref:'40468',forms:['car'],
  load:{car:{name:'YELLOW TAXI',k:'Street',st:{top:1.03,acc:1.04,han:1.04,hull:1.04},w:'Medium',perk:'start'},'4x4':L('4x4'),boat:L('boat')}})}
// garage-16: in roam every car is squeezed to 75 % width (SC_K.shipX, made for the old winged ships). The taxi is a true 6-wide build at real
// scale (1.9 m wide unsqueezed, a real car is 1.8 m), so the squeeze made it read long and flat. Builds with the TAXI door brick keep their width.
GB_attach=(f=>function(g,bricks){const r=f.apply(this,arguments);try{if(g&&g.userData)g.userData.txW=!!(bricks||[]).some(b=>b&&b.t==='tx12')}catch(e){}return r})(GB_attach);
SC_ship=(f=>function(g){const r=f.apply(this,arguments);const ud=g&&g.userData;if(ud&&ud.txW&&ud.scOn&&ud.m&&ud.m.scale.x!==ud.m.scale.y)ud.m.scale.x=ud.m.scale.y;return r})(SC_ship);
window.__tx={car:TX_CAR,nudge:TX_nudge,o:TX_o,S:TX,txt:TX_txt};
