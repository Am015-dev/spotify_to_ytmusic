// ---- R2 (worker R2, docs/PRO_PLAN.md §4): ONE 2K-style Body Shop shell for the whole garage. Alex: "The garage builder frontend needs to be
// more organised, it's like a mess." Before: a side-panel garage (6 tabs + 3 footer buttons, car squeezed into the left half, stat box over it)
// and a second full-screen BRICKS UI (14-button toolbar in 4 styles + 3 palette rows, ~50 tap targets). Now, in every mode:
//  - one header: GARAGE badge, car name, brick budget bar + weight, studs; UNDO / REDO (build only), SAVE & DRIVE, BACK;
//  - a 5-mode rail: RIDES / BUILD / PAINT / PERKS / DRIVER (the old PARTS + HORN tabs live in BUILD as KITS / HORN);
//  - one context bar of ≤ 6 tiles at the bottom; one button style (white tile, black outline, heavy italic) everywhere;
//  - the car is framed in the free area (camera view offset); the side panel never covers it and has no footer to hide rows under.
// Also: locked kits / driver parts / liveries / horns show a picture under a lock; PAINT has finishes GLOSS / MATTE / METAL / CHROME / PEARL
// (per vehicle set, saved with the set's paint in mho_gar.pa[set].fin, also used on the player's car while driving).
// The old DOM and handlers stay (tests and other modules use them): the shell restyles, moves or proxies them.
const R2={pk:0,skip:0,pop:null,af:0,area:null,bz:1.75};
const R2_M=[['rides','🚗','RIDES'],['build','🧱','BUILD'],['paint','🎨','PAINT'],['perks','⚡','PERKS'],['driver','👤','DRIVER']];
// current mode from the old state: builder on = BUILD/bricks; tab veh = RIDES (or PERKS); parts/horn = BUILD/kits|horn
function R2_cur(){if(GB_.bk)return['build','bricks'];const t=GB.tab;if(t==='veh')return[R2.pk?'perks':'rides',''];if(t==='parts')return['build','kits'];if(t==='horn'||t==='bricks')return['build','horn'];return[t,'']}
function R2_slot(){const n=perkSlots(),e=perkEq0();return Math.min(n-1,e.length<n?e.length:0)}
function R2_tipOff(){const t=$('#gsTip');if(t){t.classList.remove('on');clearTimeout(GS_tip.t)}}
function R2_go(m,sub){const[cm,cs]=R2_cur();sub=m==='build'?(sub||'bricks'):'';if(m===cm&&sub===cs)return;try{AU.sfx('pick')}catch(e){}R2_pop(null);R2_tipOff();
 if(m==='build'&&sub==='bricks'){R2.pk=0;if(!GB_.bk)GB_enter();R2_sync();return}
 R2.pk=m==='perks'?1:0;if(R2.pk&&GPK_.pk==null)GPK_.pk=R2_slot();
 if(GB_.bk){R2.skip=1;try{GB_exit()}finally{R2.skip=0}}GB.tab={rides:'veh',perks:'veh',paint:'paint',driver:'driver',build:sub==='horn'?'horn':'parts'}[m];gbRender();const B=$('#gbBody');if(B)B.scrollTop=0}
// ---------- DOM: header, rail, context bar (built once, inside #gbx)
function R2_dom(){const X=$('#gbx');if(!X||$('#r2H'))return;X.classList.add('r2');
 const H=document.createElement('div');H.id='r2H';H.innerHTML=`<div class="r2Rib"><b>GARAGE</b></div><div class="r2Nm"><b id="r2Name"></b><small id="r2Sub"></small></div>
  <div class="r2Bud" title="Build limit"><span>🧱</span><i><b id="r2BrB"></b></i><em id="r2BrN"></em></div><em class="r2W" id="r2W"></em><em class="r2Cr" id="r2Cr"></em><span class="r2Sp"></span>
  <button class="r2T r2Ud" data-r2h="undo" title="Undo (Ctrl+Z)"><i>↶</i></button><button class="r2T r2Ud" data-r2h="redo" title="Redo (Ctrl+Y)"><i>↷</i></button>`;
 const sv=$('#gbSave'),bk=$('#gbBack');if(sv){sv.className='r2T r2Go';sv.innerHTML='<i>✔</i>SAVE &amp; DRIVE';H.appendChild(sv)}if(bk){bk.className='r2T';bk.innerHTML='<i>✕</i>BACK';H.appendChild(bk)}
 H.addEventListener('click',e=>{const b=e.target.closest('[data-r2h]');if(!b)return;if(b.dataset.r2h==='undo')GB_undo();else GB_redo();GB_ui()});X.appendChild(H);
 const R=document.createElement('div');R.id='r2R';R.innerHTML=R2_M.map(([m,i,n])=>`<button class="r2T" data-r2m="${m}"><i>${i}</i><span>${n}</span></button>`).join('');
 R.addEventListener('click',e=>{const b=e.target.closest('[data-r2m]');if(b)R2_go(b.dataset.r2m)});X.appendChild(R);
 const gs=$('#gbStats'),gp=$('#gbx .gbp');if(gs&&gp)gp.insertBefore(gs,$('#gbBody'));
 const C=document.createElement('div');C.id='r2C';C.addEventListener('click',R2_ctxTap);X.appendChild(C);
 // BUILD: the old palette (#gbBkP) becomes the context bar: [CATEGORY ▾] [part strip] [COLOUR] [SELECT] [MIRROR] [⋯ MORE]
 const P=$('#gbBkP'),pc=$('#gbBkPc');if(P&&pc){const a=document.createElement('button');a.className='r2T r2Cat';a.dataset.r2b='cat';P.insertBefore(a,pc);
  const z=document.createElement('div');z.className='r2BkT';z.innerHTML=`<button class="r2T r2Col" data-r2b="col"><i class="r2Sw"></i>COLOUR</button><button class="r2T" data-r2b="sel"><i>☝</i>SELECT</button><button class="r2T" data-r2b="mir"><i>⇋</i>MIRROR</button><button class="r2T" data-r2b="more"><i>⋯</i>MORE</button>`;P.appendChild(z);
  const ct=$('#gbBkCt');if(ct){ct.insertAdjacentHTML('beforeend','<button class="gbCt r2Sub" data-r2s="kits">🔩 Kits</button><button class="gbCt r2Sub" data-r2s="horn">📯 Horn</button>');}
  const mo=document.createElement('div');mo.id='r2More';mo.className='gbBkR';mo.innerHTML=[['gnb','🆕','NEW BUILD'],['pbody','🎨','PAINT BODY'],['paint','🖌','PAINT ONE'],['del','🗑','DELETE'],['rot','⟳','TURN'],['bp','⬛','BASE'],['clr','🧹','CLEAR']].map(([a,i,n])=>`<button class="r2T" data-r2a="${a}"><i>${i}</i>${n}</button>`).join('')+
   (typeof GB_PRE!=='undefined'?GB_PRE.map((p,i)=>`<button class="r2T" data-r2a="pre${i}">${p[0]}</button>`).join(''):'');P.appendChild(mo);
  P.addEventListener('click',R2_bkTap)}}
function R2_pop(k){const P=$('#gbBkP');R2.pop=k;if(P){P.classList.toggle('r2PopCt',k==='cat');P.classList.toggle('r2PopCl',k==='col');P.classList.toggle('r2PopMo',k==='more')}R2_bkSync()}
function R2_bkTap(e){const b=e.target.closest('button');if(!b)return;const T=$('#gbBkT'),px=a=>{const t=T&&T.querySelector(`[data-a="${a}"]`);if(t)t.click()};
 if(b.dataset.r2s){R2_go('build',b.dataset.r2s);return}
 if(b.classList.contains('gbCt')||b.classList.contains('gbCl')){setTimeout(()=>R2_pop(null),0);return}
 const k=b.dataset.r2b;if(k){if(k==='cat'||k==='col'||k==='more')R2_pop(R2.pop===k?null:k);else if(k==='sel'){R2_pop(null);if(GB_.tool==='sel'){GB_.tool='add';try{SL_set([])}catch(_){}}else px('sel');GB_ui()}else if(k==='mir'){R2_pop(null);px('mir')}return}
 const a=b.dataset.r2a;if(a){R2_pop(null);if(a==='gnb'&&typeof GNB_pick==='function'){GNB_pick();return}px(a);GB_ui()}}
// ---------- context bar for RIDES / PERKS / PAINT / DRIVER / BUILD-kits|horn (≤ 6 tiles; most are proxies of the panel's own buttons)
const R2_FN=[['gloss','✨','GLOSS'],['matte','◼','MATTE'],['metal','⚙','METAL'],['chrome','◎','CHROME'],['pearl','◇','PEARL']];
function R2_ctx(){const C=$('#r2C'),B=$('#gbBody');if(!C||!B)return;const[m,s]=R2_cur();let h='';
 if(m==='rides')h=[...B.querySelectorAll('#g9Col .g9Bar button')].map((b,i)=>`<button class="r2T ${b.classList.contains('on')?'on':''}" data-r2px="${i}">${b.innerHTML}</button>`).join('')+(typeof R3_show==='function'?'<button class="r2T r3ShB" data-r3show><i>🏁</i>SHOWROOM</button>':'');
 else if(m==='perks')h=[...B.querySelectorAll('.gpkTop .gbRow:first-of-type button')].map((b,i)=>`<button class="r2T r2Slot ${GPK_.pk===i&&!b.disabled?'on':''}" ${b.disabled?'disabled':''} data-r2sl="${i}"><small>SLOT ${i+1}</small>${b.disabled?'🔒 '+((b.querySelector('small')||{}).textContent||'').toUpperCase():b.querySelector('b').innerHTML}</button>`).join('');
 else if(m==='paint'){const f=R2_fin();h=R2_FN.map(([k,i,n])=>`<button class="r2T ${f===k?'on':''}" data-r2fn="${k}"><i>${i}</i>${n}</button>`).join('')+`<button class="r2T" data-r2stock><i>↺</i>STOCK</button>`}
 else if(m==='driver')h=[...B.querySelectorAll('h5')].slice(0,6).map((e,i)=>`<button class="r2T" data-r2h5="${i}">${e.textContent.split(/[ ·/]/)[0]}</button>`).join('');
 else if(m==='build')h=[['bricks','🧱','BRICKS'],['kits','🔩','KITS'],['horn','📯','HORN']].map(([k,i,n])=>`<button class="r2T ${s===k?'on':''}" data-r2bs="${k}"><i>${i}</i>${n}</button>`).join('');
 if(C.innerHTML!==h)C.innerHTML=h}
function R2_ctxTap(e){const b=e.target.closest('button');if(!b||b.disabled)return;const B=$('#gbBody'),d=b.dataset;
 if(d.r3show!=null){try{AU.sfx('pick')}catch(_){}R3_show(true);return}
 if(d.r2px!=null){const t=B.querySelectorAll('#g9Col .g9Bar button')[+d.r2px];if(t)t.click();return}
 if(d.r2sl!=null){const i=+d.r2sl;if(GPK_.pk===i)return;GPK_.pk=i;try{AU.sfx('pick')}catch(_){}gbRender();return}
 if(d.r2fn){R2_finPick(d.r2fn);return}
 if(d.r2stock!=null){const t=$('#gbStock');if(t)t.click();return}
 if(d.r2h5!=null){const h=B.querySelectorAll('h5')[+d.r2h5];if(h)B.scrollTo({top:h.offsetTop-B.offsetTop-4,behavior:'smooth'});return}
 if(d.r2bs){R2_go('build',d.r2bs)}}
// ---------- header + rail + builder tile states
function R2_hdr(){if(!$('#r2H')||!GB.d)return;const k=GB_list().length,S=GAR_set(),p=Math.min(1,k/GB_MAX);
 $('#r2Name').textContent=S.n;$('#r2Sub').textContent=(GAR_TIER[S.tier]||[''])[0];$('#r2BrB').style.width=Math.round(p*100)+'%';$('#r2BrN').textContent=k+'/'+GB_MAX;
 $('#r2W').textContent='⚖ '+(typeof R1_weight==='function'?R1_weight(k):GNB_W(k).toUpperCase());$('#r2Cr').textContent='🟡 '+season().cr.toLocaleString('de-DE');
 const[m]=R2_cur();document.querySelectorAll('#r2R [data-r2m]').forEach(b=>b.classList.toggle('on',b.dataset.r2m===m));
 const u=$('#r2H [data-r2h="undo"]'),r=$('#r2H [data-r2h="redo"]');if(u)u.disabled=!GB_.undo.length;if(r)r.disabled=!(G8.redo&&G8.redo.length)}
function R2_bkSync(){const P=$('#gbBkP');if(!P)return;const c=P.querySelector('.r2Cat');if(c)c.innerHTML=`<i>▤</i>${(GB_.ct||'Bricks').toUpperCase()} ▾`;const sw=P.querySelector('.r2Sw');if(sw)sw.style.background=GB_BC[GB_.col]||'#fff';
 const t=(k,on)=>{const e=P.querySelector(`[data-r2b="${k}"]`);if(e)e.classList.toggle('on',!!on)};t('cat',R2.pop==='cat');t('col',R2.pop==='col');t('more',R2.pop==='more');t('sel',GB_.tool==='sel');t('mir',GB_.mir);
 P.querySelectorAll('#r2More [data-r2a]').forEach(b=>{const a=b.dataset.r2a;b.classList.toggle('on',(a==='paint'||a==='del')&&GB_.tool===a)})}
function R2_sync(){R2_dom();const X=$('#gbx');if(!X)return;const[m,s]=R2_cur();for(const c of[...X.classList])if(c.startsWith('r2m-'))X.classList.remove(c);X.classList.add('r2m-'+m);if(s)X.classList.add('r2m-'+s);
 R2_hdr();R2_ctx();R2_bkSync();R2.af=0}
// ---------- panel content: group the RIDES tab into rides/perks parts, pictures for locked items
const R2_CIC={nose:'🔺',wing:'🪽',rear:'🔧',roof:'🚨',side:'🛡'},R2_KIC={none:'—',crown:'👑',antenna:'📡',siren:'🚨',sfin:'🦈',flag:'🚩',dish:'📡',pilot:'🧑‍✈️',floats:'🛟'},R2_HIC={classic:'📯',train:'🚆',goose:'🪿',duck:'🦆',bells:'🔔',fanfare:'🎺',truck:'🚚'};
function R2_post(){const B=$('#gbBody');if(!B)return;
 if(GB.tab==='veh'){let g='rides';for(const e of B.children){if(e.classList.contains('gbInfo')){e.dataset.r2='x';continue}if(e.classList.contains('gpkTop')){e.dataset.r2='perks';continue}
   if(e.tagName==='H5'){const t=e.textContent;g=/^UPGRADES/.test(t)?'perks':/^PREVIEW/.test(t)?'x':'rides'}else if(g==='x'&&e.classList.contains('gbRow')){e.dataset.r2='x';g='rides';continue}e.dataset.r2=g}
  const h=B.querySelector('[data-r2="rides"]');if(h&&h.tagName==='H5')h.textContent='COLLECTION · tap a card to equip'}
 const pic=(b,inner)=>{if(b.querySelector('.r2Pic'))return;const lk=b.disabled||/^🔒/.test((b.querySelector('b')||{}).textContent||'');b.classList.add('r2Pk');const s=document.createElement('span');s.className='r2Pic';s.innerHTML=inner+(lk?'<em class="r2Lk">🔒</em>':'');b.prepend(s);
  const t=b.querySelector('b');if(t&&t.firstChild&&t.firstChild.nodeType===3)t.firstChild.textContent=t.firstChild.textContent.replace(/^🔒 /,'')};
 B.querySelectorAll('.gbP[data-cat][data-id]').forEach(b=>{const id=b.dataset.id,u=R2_KT.get(id);pic(b,R2_KIC[id]?`<i>${R2_KIC[id]}</i>`:`<i class="r2Fb">${R2_CIC[b.dataset.cat]||'🔩'}</i>`+(u?`<img alt="" src="${u}">`:u===null?'':`<img alt="" data-r2kit="${id}">`))});
 B.querySelectorAll('.gbP[data-horn]').forEach(b=>pic(b,`<i>${R2_HIC[b.dataset.horn]||'📯'}</i>`));
 B.querySelectorAll('.gbP[data-pat]').forEach(b=>pic(b,`<img alt="" src="${R2_patTh(b.dataset.pat)}">`));
 B.querySelectorAll('.gbP[data-fc][data-fv]').forEach(b=>{if(!'hxt'.includes(b.dataset.fc))return;pic(b,`<img alt="" data-r2fig="${b.dataset.fc}|${b.dataset.fv}">`)});
 R2_pump()}
function R2_pump(){if(R2.busy)return;R2.busy=1;const next=()=>{let im=null;try{im=document.querySelector('#gbBody img[data-r2kit]:not([src]),#gbBody img[data-r2fig]:not([src])');if(!im||$('#gbx').hidden){R2.busy=0;return}
  let u=null;try{if(im.dataset.r2kit)u=R2_kitTh(im.dataset.r2kit);else{const[c,v]=im.dataset.r2fig.split('|');u=GB_portrait(Object.assign({},GB_figGet(),{[c]:v}))}}catch(e){u=null;R2.perr=String(e)}
  if(u)im.src=u;else{im.removeAttribute('data-r2kit');im.removeAttribute('data-r2fig')}}catch(e){R2.perr=String(e);if(im){im.removeAttribute('data-r2kit');im.removeAttribute('data-r2fig')}}setTimeout(next,16)};setTimeout(next,30)}
// kit picture: the kit's own geometry (kitParts) in red on a see-through grey body, drawn once by the 3D thumbnail renderer
const R2_KT=new Map();
function R2_kitTh(k){if(R2_KT.has(k))return R2_KT.get(k);if(!GS.th)GS_thumb('b11',0);const T=GS.th;if(!T)return null;let url=null;const host=new THREE.Group(),mt=c=>new THREE.MeshStandardMaterial({color:c,roughness:.45}),ms=[mt('#e01e2b'),mt('#d8dde4'),mt('#2a2f38')];
 try{const n0=host.children.length;
  kitParts(k,host,ms[0],ms[1],ms[2],{glow:'#22e4ff',a:'#e01e2b',b:'#ffd12c',c:'#ffffff'});if(host.children.length>n0){const bb=new THREE.Box3().setFromObject(host),ce=bb.getCenter(new THREE.Vector3()),rad=Math.max(.15,bb.getSize(new THREE.Vector3()).length()/2);host.position.sub(ce);T.s.add(host);
   const d=rad/Math.sin(15*Math.PI/180)*.9;T.cam.position.set(d*.62,d*.45,-d*.64);T.cam.lookAt(0,0,0);T.r.setClearColor(0,0);T.r.render(T.s,T.cam);url=T.cv.toDataURL('image/png');T.s.remove(host)}}catch(e){url=null}
 host.traverse(o=>{if(o.isMesh){o.geometry.dispose();if(!ms.includes(o.material)&&o.material.dispose&&!o.material.isShaderMaterial)o.material.dispose()}});ms.forEach(m=>m.dispose());R2_KT.set(k,url);return url}
const R2_PT=new Map();
function R2_patTh(p){if(R2_PT.has(p))return R2_PT.get(p);let u='';try{const[c,g]=cv(512,512),d=GB.d||{};g.fillStyle=d.a||'#e01e2b';g.fillRect(0,0,512,512);liveryPat({a:d.a||'#e01e2b',b:d.b||'#ffd12c',c:d.c||'#ffffff',pat:p,num:d.num||7},g);
  const[c2,g2]=cv(64,44);g2.drawImage(c,0,0,512,352,0,0,64,44);u=c2.toDataURL()}catch(e){u=''}R2_PT.set(p,u);return u}
// ---------- paint finishes (one cached material per finish; the shared LEGO material stays for everything else)
// gloss = clear-coated LEGO plastic; matte = no coat, rough; metal = metallic flake under a clear coat; chrome = mirror (base hue mixed toward silver,
// metalness 1, roughness .04, strong env); pearl = the base colour kept, a soft iridescent sheen on top (thin-film), no lightening
// gloss = clear-coated LEGO plastic; matte = no coat, rough; metal = metallic flake under a clear coat; chrome = mirror (base hue mixed toward silver,
// metalness 1, roughness .04, its own bright studio reflection map); pearl = the base colour kept, a soft cool pearly sheen toward the rim
const R2_FP={gloss:{roughness:.15,clearcoat:1,clearcoatRoughness:.05,envMapIntensity:1.6,k:1},matte:{roughness:1,clearcoat:0,metalness:0,envMapIntensity:.15,k:.92,em:.12},
 metal:{metalness:.7,roughness:.26,clearcoat:.8,clearcoatRoughness:.12,envMapIntensity:1.4,k:1.1,em:.12,env:1},
 chrome:{metalness:1,roughness:.05,clearcoat:1,clearcoatRoughness:.03,envMapIntensity:1.25,k:1,mix:.7,em:.03,env:1},
 // chrome on the street car: the world sky dominates a pure mirror (it read blue/see-through), so less metal, a mid-steel base (#8d939b) and real shading (no glow)
 chromeD:{metalness:.6,roughness:.3,clearcoat:.5,clearcoatRoughness:.1,envMapIntensity:.9,k:1,mix:.85,mixC:'.55,.58,.61',em:0,env:1},
 pearl:{roughness:.2,clearcoat:1,clearcoatRoughness:.05,envMapIntensity:1.5,k:1,em:.16,pearl:1}};
const R2_MC={};
// studio reflection map for chrome/metal: a plain canvas (works in the garage renderer and the game renderer alike): bright sky, soft-box strips, horizon, grey floor
let R2_ENV=null;
function R2_env(){if(R2_ENV)return R2_ENV;const[c,g]=cv(512,256),s=g.createLinearGradient(0,0,0,256);s.addColorStop(0,'#f4f4f4');s.addColorStop(.38,'#c9cbcf');s.addColorStop(.48,'#ffffff');s.addColorStop(.52,'#26282c');s.addColorStop(.7,'#6b6e74');s.addColorStop(1,'#3a3c40');g.fillStyle=s;g.fillRect(0,0,512,256);
 g.fillStyle='#fff';for(let i=0;i<4;i++)g.fillRect(40+i*128,24,52,70);g.fillStyle='#1a1b1e';for(let i=0;i<8;i++)g.fillRect(i*64+20,150,14,90);const t=new THREE.CanvasTexture(c);t.mapping=THREE.EquirectangularReflectionMapping;t.colorSpace=THREE.SRGBColorSpace;return R2_ENV=t}
function R2_mat(f){if(!R2_FP[f])return GB_MAT;if(R2_MC[f])return R2_MC[f];const{k,mix,mixC,em,env,pearl,...P}=R2_FP[f],m=GB_MAT.clone();Object.assign(m,P);m.color.setScalar(k);if(env)m.envMap=R2_env();
 const e=em==null?.16:em;m.onBeforeCompile=s=>{s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>'+(mix?`\ndiffuseColor.rgb=mix(diffuseColor.rgb,vec3(${mixC||'.93,.95,.98'}),${mix.toFixed(2)});`:''))
  .replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\ntotalEmissiveRadiance+=diffuseColor.rgb*'+e.toFixed(2)+';'+(pearl?'\n{float r2v=1.-clamp(dot(normalize(normal),normalize(vViewPosition)),0.,1.);totalEmissiveRadiance+=mix(diffuseColor.rgb,vec3(.45,.62,1.),.55)*(.5*r2v*r2v*r2v);}':''))};
 m.customProgramCacheKey=()=>'r2'+f;m.userData.r2=f;return R2_MC[f]=m}
const R2_fin=()=>{try{const f=GP_pa().fin;return R2_FP[f]&&f!=='chromeD'?f:'gloss'}catch(e){return'gloss'}};
function R2_finSet(o,f){if(!o)return 0;const M=R2_mat(f);let n=0;o.traverse(x=>{if(!x.isMesh||x.userData.r!=null||!x.material)return;if(x.material===GB_MAT||(x.material.userData&&x.material.userData.r2)){if(x.material!==M)x.material=M;n++}});return n}
function R2_finPick(f){GP_save('fin',f==='gloss'?'gloss':f);if(GB.mesh)R2_finSet(GB.mesh,f);try{AU.sfx('pick')}catch(e){}R2_ctx()}
// the player's car while driving: re-applied when the mesh or the set changes (cheap: a few dozen meshes, twice a second)
setInterval(()=>{try{if(typeof pl==='undefined'||!pl||!pl.mesh||state==='menu')return;const f=R2_fin();R2_finSet(pl.mesh,f==='chrome'?'chromeD':f)}catch(e){}},500);
// ---------- camera: frame the car in the free area (right of the rail, under the header, above the context bar, left of the panel)
function R2_calc(){const c=$('#gbC');if(!c)return null;const r=c.getBoundingClientRect();if(!r.width)return null;const vis=e=>e&&e.offsetParent&&getComputedStyle(e).display!=='none';
 const R=$('#r2R'),H=$('#r2H'),p=$('#gbx .gbp'),C=GB_.bk?$('#gbBkP'):$('#r2C');let l=0,t=0,R0=r.width,b=r.height;
 if(vis(R))l=R.getBoundingClientRect().right-r.left;if(GB_.bk)l+=(parseFloat(getComputedStyle($('#gbx')).getPropertyValue('--r2pad'))||62)+10;if(vis(H))t=H.getBoundingClientRect().bottom-r.top;if(!GB_.bk&&vis(p))R0=p.getBoundingClientRect().left-r.left;
 if(vis(C)){const q=C.querySelector('#gbBkPc')||C;const y=q.getBoundingClientRect().top-r.top;if(y>t+60)b=y}return{l,t,r:R0,b,w:r.width,h:r.height}}
function R2_frame(C,bk){if(!C||$('#gbx').hidden)return;if(!R2.area||++R2.af>20){R2.area=R2_calc();R2.af=1}const A=R2.area;if(!A||A.r-A.l<80||A.b-A.t<60)return;
 const ox=Math.round(A.w/2-(A.l+A.r)/2),oy=Math.round(A.h/2-(A.t+A.b)/2),z=Math.max(.8,Math.min(1.8,(bk?R2.bz:2.6)*Math.min((A.r-A.l)/A.w,(A.b-A.t)/A.h)));const v=C.view;
 if(!v||!v.enabled||v.offsetX!==ox||v.offsetY!==oy||v.fullWidth!==A.w||v.fullHeight!==A.h||C.zoom!==z){C.zoom=z;C.setViewOffset(A.w,A.h,ox,oy,A.w,A.h)}C.updateMatrixWorld()}
G8_band=function(){const A=R2.area||R2_calc();const c=$('#gbC').getBoundingClientRect();return A?[A.t+G8.T.top,A.b-G8.T.bot,c.height,c.width]:[0,c.height,c.height,c.width]};
GB_cam=(f=>function(){f();R2_frame(GB.cam,GB_.bk)})(GB_cam);
gbLoop=(f=>function(){R2.fr=(R2.fr||0)+1;if(!GB_.bk&&GB.cam&&!$('#gbx').hidden)R2_frame(GB.cam,0);return f.apply(this,arguments)})(gbLoop);
addEventListener('resize',()=>{R2.af=99});
// ---------- hooks
gbRender=(f=>function(){if(R2.skip)return;if(R2.pk&&GB.tab==='veh'&&GPK_.pk==null)GPK_.pk=R2_slot();const r=f.apply(this,arguments);try{R2_post();R2_sync();if(GB.mesh)R2_finSet(GB.mesh,R2_fin())}catch(e){console.warn('R2',e)}return r})(gbRender);
GB_refresh=(f=>function(){const r=f.apply(this,arguments);try{if(GB.mesh)R2_finSet(GB.mesh,R2_fin())}catch(e){}return r})(GB_refresh);
GB_ui=(f=>function(){const r=f.apply(this,arguments);try{R2_hdr();R2_bkSync();R2_pads()}catch(e){}return r})(GB_ui);
GB_enter=(f=>function(){const r=f.apply(this,arguments);R2.pk=0;R2_sync();return r})(GB_enter);
GB_exit=(f=>function(){R2_pop(null);const r=f.apply(this,arguments);if(!R2.skip)R2_sync();return r})(GB_exit);
const R2_PL={place:'PLACE',rot:'TURN',cancel:'DROP'},R2_SL={rot:'TURN',up:'UP',none:'NONE'};
function R2_pads(){const B=$('#gsBar');if(B)B.querySelectorAll('button').forEach(b=>{const t=b.dataset.g?R2_PL[b.dataset.g]:b.dataset.g8?(+b.dataset.g8>0?'UP':'DOWN'):null;if(t&&!b.dataset.r2l){b.dataset.r2l=1;b.innerHTML=`<i>${(b.querySelector('i')||{}).textContent||''}</i><span>${t}</span>`}});
 const S=$('#slBar');if(S)S.querySelectorAll('button[data-s]').forEach(b=>{const t=R2_SL[b.dataset.s],sp=b.querySelector('span');if(t&&sp&&sp.textContent!==t)sp.textContent=t});
 const h=!!(GS.held||(typeof SL!=='undefined'&&SL.carry));if(R2.held&&!h)R2_tipOff();R2.held=h}
GS_ui=(f=>function(){const r=f.apply(this,arguments);try{R2_pads()}catch(e){}return r})(GS_ui);
GPK_html=(f=>function(){return String(f.apply(this,arguments)).replace(/ · (\d)\/3 SLOTS/,' · $1/3').replace('DRIVER LEVEL','LV')})(GPK_html);
GB_msg=(f=>function(t){f(t);try{if(GB_.bk&&t)GS_tip(t)}catch(e){}})(GB_msg);
CR_cat=(f=>function(ct){const r=f(ct);try{R2_bkSync()}catch(e){}return r})(CR_cat);
gbOpen=(f=>function(){if(!GB.tab||GB.tab==='parts'||GB.tab==='bricks')GB.tab='veh';R2.pk=0;R2.af=99;R2_dom();const r=f.apply(this,arguments);R2_sync();return r})(gbOpen);
R2_dom();
// ---------- style: one tile style for every button in the garage (title-menu look: white tile, black outline, heavy italic; yellow = on)
{const st=document.createElement('style');st.textContent=`
#gbx.r2{--r2hh:52px;--r2rw:72px;--r2pad:62px;--r2ch:52px;--r2pw:300px;--r2k:#141413;background:#0d1730;place-items:stretch}
#gbx.r2 .gbw{position:absolute;inset:0;display:block;width:auto;height:auto}#gbx.r2 .gbv{position:absolute;inset:0;border:0;border-radius:0;background:none}#gbx.r2 #gbC{position:absolute;inset:0}
#gbx.r2 .gbp>h2,#gbx.r2 .gbTabs,#gbx.r2 .gbp>.row,#gbx.r2 #gbBkT,#gbx.r2 #crSt{display:none!important}
#gbx .r2T,#gbx.r2 .gbP,#gbx.r2 .g9Ty,#gbx.r2 .g9Ch,#gbx.r2 .g9Ed,#gbx.r2 .gbCt,#gbx.r2 #gsBar button,#gbx.r2 #slBar button,#gbx.r2 .gnbR button,#gbx.r2 .gnbX{border:2px solid var(--r2k,#141413);background:#fff;color:#141413;border-radius:10px;
 box-shadow:0 3px 0 #141413;font:italic 900 12px var(--hud);letter-spacing:.02em;cursor:pointer}
#gbx .r2T{display:inline-flex;align-items:center;justify-content:center;gap:5px;min-width:44px;height:44px;padding:0 10px;white-space:nowrap;flex:none;box-sizing:border-box}
#gbx .r2T i{font-style:normal;font-size:16px;line-height:1}#gbx .r2T.on,#gbx.r2 .gbP.on,#gbx.r2 .g9Ty.on,#gbx.r2 .gbCt.on{background:#ffd400;color:#141413}
#gbx .r2T:disabled{opacity:.6;background:#c9ced8;cursor:default}#gbx .r2T:active:not(:disabled),#gbx.r2 .gbP:active:not(:disabled){transform:translateY(2px);box-shadow:0 1px 0 #141413}
#gbx .r2T.r2Go,#gbx.r2 #gsBar .gsPl{background:#38d16a;color:#141413}
/* R1 stat chips: on top of the side panel in RIDES + PERKS only (name + weight are in the header) */
#gbx.r2 #gbStats{display:none;position:static;flex:none;margin:0 0 6px;padding:6px 8px;gap:2px;background:rgba(0,0,0,.25);border:0;border-radius:10px}
#gbx.r2m-rides #gbStats,#gbx.r2m-perks #gbStats{display:grid}#gbx.r2 #gbStats h4{display:none}#gbx.r2 #gbStats div{grid-template-columns:84px 1fr 44px!important;gap:6px}
/* header */
#r2H{position:absolute;left:0;right:0;top:0;height:var(--r2hh);display:flex;align-items:center;gap:8px;padding:0 6px 0 0;background:#fff;box-shadow:0 4px 0 rgba(0,0,0,.25);z-index:6;color:#141413;box-sizing:border-box;padding-top:env(safe-area-inset-top,0px)}
#r2H .r2Rib{flex:none;height:100%;display:flex;align-items:center;padding:0 14px 0 calc(10px + env(safe-area-inset-left,0px));background:#e8202a;clip-path:polygon(0 0,100% 0,88% 100%,0 100%)}
#r2H .r2Rib b{font:italic 900 16px var(--hud);color:#ffd400;-webkit-text-stroke:1px #141413;letter-spacing:.02em}
#r2H .r2Nm{min-width:0;flex:0 1 auto;display:grid;line-height:1.05}#r2H .r2Nm b{font:italic 900 15px var(--hud);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#r2H .r2Nm small{font:800 12px var(--hud);color:#5a6375;white-space:nowrap}
#r2H .r2Bud{flex:none;display:flex;align-items:center;gap:4px;font:900 12px var(--hud)}#r2H .r2Bud i{width:64px;height:10px;border-radius:5px;background:#dfe3ea;border:2px solid #141413;overflow:hidden}#r2H .r2Bud i b{display:block;height:100%;background:#ffd400}
#r2H .r2Bud em,#r2H .r2W,#r2H .r2Cr{font:italic 900 12px var(--hud);font-style:italic;white-space:nowrap;flex:none}#r2H .r2W{padding:2px 6px;border-radius:6px;background:#141413;color:#ffd400}
#r2H .r2Sp{flex:1 1 0;min-width:0}#r2H .r2T{height:44px;min-height:44px}#gbx:not(.gbBk) #r2H .r2Ud{display:none}
/* rail */
#r2R{position:absolute;left:0;top:var(--r2hh);bottom:0;width:var(--r2rw);display:flex;flex-direction:column;justify-content:space-evenly;align-items:center;padding:6px 0 calc(6px + env(safe-area-inset-bottom,0px)) env(safe-area-inset-left,0px);z-index:6;background:rgba(10,18,40,.82);border-right:2px solid #141413;box-sizing:border-box}
#r2R .r2T{flex-direction:column;gap:2px;width:calc(var(--r2rw) - 10px);height:auto;flex:1 1 0;max-height:66px;margin:3px 0;padding:2px 0}#r2R .r2T i{font-size:19px}#r2R .r2T span{font-size:12px}
#r2R .r2T.on{box-shadow:0 3px 0 #141413,inset 5px 0 0 #e8202a}
/* context bar */
#r2C{position:absolute;left:calc(var(--r2rw) + 6px);right:6px;bottom:calc(6px + env(safe-area-inset-bottom,0px));height:var(--r2ch);display:flex;align-items:center;gap:6px;overflow-x:auto;scrollbar-width:none;z-index:5;padding:0 2px 3px}
#r2C::-webkit-scrollbar{display:none}#r2C:empty{display:none}#gbx.gbBk #r2C{display:none}#r2C .r2T{flex:1 1 0;min-width:0;max-width:170px}#r2C .r2T small{font-size:12px;opacity:.7}
#r2C .r2Slot{flex-direction:column;gap:0;line-height:1.1;overflow:hidden}#r2C .r2Slot small{font:800 12px var(--hud);opacity:.6}#r2C .r2Slot{max-width:200px;text-overflow:ellipsis}
/* side panel */
#gbx.r2 .gbp{position:absolute;top:calc(var(--r2hh) + 6px);right:6px;bottom:calc(var(--r2ch) + 12px + env(safe-area-inset-bottom,0px));width:var(--r2pw);padding:8px 8px 8px 10px;border-radius:14px;background:rgba(22,38,86,.95);border:2px solid #141413;box-shadow:0 4px 0 rgba(0,0,0,.35);z-index:5;box-sizing:border-box}
#gbx.r2.gbBk .gbp{display:none}#gbx.r2 #gbBody{padding:2px 4px 8px 2px}#gbx.r2 #gbBody h5{color:#ffd400;margin:8px 0 6px}#gbx.r2 .gbRow{gap:7px}
#gbx.r2m-rides #gbBody [data-r2="perks"],#gbx.r2m-perks #gbBody [data-r2="rides"],#gbx.r2 #gbBody [data-r2="x"]{display:none!important}
#gbx.r2m-perks .gpkTop .gbRow:first-of-type{display:none}#gbx.r2 .gbP{min-height:44px;padding:5px 9px}#gbx.r2 .gbP b{font:italic 900 12px var(--hud)}#gbx.r2 .gbP small{color:#4a5468;font-style:normal;font-weight:700}
#gbx.r2 .gbP:disabled{background:#c9ced8;color:#3a4252;opacity:1;cursor:default}#gbx.r2 .gbP:disabled small{color:#3a4252}
#gbx.r2 .gbSw{gap:6px}#gbx.r2 .gbSw button{width:44px;height:44px;border:2px solid #141413;border-radius:10px;box-shadow:0 3px 0 #141413}#gbx.r2 .gbSw button.on{box-shadow:0 3px 0 #141413,0 0 0 3px #ffd400}
#gbx.r2 .gbP.r2Pk{display:grid;grid-template-columns:48px 1fr;column-gap:7px;align-items:center;text-align:left;width:100%;box-sizing:border-box;padding:4px 6px}@media (min-width:900px) and (min-height:501px){#gbx.r2 .gbP.r2Pk{width:calc(50% - 4px)}}#gbx.r2 .gbP.r2Pk>*:not(.r2Pic){grid-column:2}
#gbx.r2 .r2Pic{grid-row:1/span 2;position:relative;width:48px;height:40px;border-radius:7px;background:#e9edf3;display:grid;place-items:center;overflow:hidden}#gbx.r2 .r2Pic img{width:48px;height:40px;object-fit:contain;display:block}
#gbx.r2 .r2Pic i{font-style:normal;font-size:22px}#gbx.r2 .r2Pic img{position:relative;z-index:1}#gbx.r2 .r2Pic img:not([src]){display:none}#gbx.r2 .r2Pic img[src]~.r2Lk{z-index:2}#gbx.r2 .r2Pic i.r2Fb{position:absolute;inset:0;display:grid;place-items:center}#gbx.r2 .r2Pic img[src]{background:#e9edf3}#gbx.r2 .gbP:disabled .r2Pic img,#gbx.r2 .gbP:disabled .r2Pic i{filter:grayscale(.7);opacity:.9}
#gbx.r2 .r2Lk{position:absolute;right:1px;bottom:1px;width:20px;height:20px;border-radius:6px;display:grid;place-items:center;font-style:normal;font-size:12px;background:#141413}
#gbx.r2 .garPre .gbP img{width:44px;height:44px}
/* collection: 2 columns of white cards; the type/sort/filter bar moves to the context bar */
#gbx.r2 #g9Col .g9Bar{display:none}#gbx.r2 #g9Col .g9Cnt{color:#cfe0ff}#gbx.r2 #g9Col .g9Grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
#gbx.r2 #g9Col .g9Card{background:#fff;color:#141413;border:2px solid #141413;border-bottom:6px solid var(--tc);box-shadow:0 3px 0 #141413;min-height:120px}#gbx.r2 #g9Col .g9Card b{color:#141413}#gbx.r2 #g9Col .g9Card small{color:#4a5468}
#gbx.r2 #g9Col .g9Card.on{box-shadow:0 3px 0 #141413,0 0 0 3px #ffd400}#gbx.r2 #g9Col .g9Card.lock{opacity:1;background:#c9ced8}#gbx.r2 #g9Col .g9Ed{min-height:44px;margin-top:3px}
#gbx.r2 #g9Col .g9Fav{min-width:44px;min-height:44px;background:none;border:0;box-shadow:none;color:#141413}#gbx.r2 .gnbGo{border:2px dashed #141413!important}
#gbx.r2 .garSt{color:#e8eeff}
/* builder: the palette is the context bar; categories / colours / more open as one-row pop-ups above it */
#gbx.r2.gbBk #gbBkP{display:flex;align-items:center;gap:6px;left:calc(var(--r2rw) + 6px);right:6px;bottom:calc(6px + env(safe-area-inset-bottom,0px));height:var(--r2ch);padding:0 2px 3px;background:none;overflow:visible}
#gbx.r2 #gbBkPc{flex:1 1 0;min-width:0;height:100%;align-items:center;padding:0 2px 3px;gap:5px}#gbx.r2 #gbBkPc .gbPc{width:54px;height:44px;border:2px solid #141413;background:#fff;color:#141413;box-shadow:0 3px 0 #141413;border-radius:10px}
#gbx.r2 #gbBkPc .gbPc.gsTh{background:#fff}#gbx.r2 #gbBkPc .gbPc.on{background:#ffd400;box-shadow:0 3px 0 #141413}#gbx.r2 #gbBkPc .gbPc{font:italic 900 12px var(--hud);line-height:1}
#gbx.r2 #gbBkPc .gbPc.gsTh{color:transparent;font-size:12px;line-height:0;overflow:hidden}#gbx.r2 #gbBkPc .gbPc.gsTh img{width:46px;height:34px}
#gbx.r2 .r2BkT{display:flex;gap:6px;flex:none}#gbx.r2 .r2Cat{flex:none;max-width:120px}#gbx.r2 .r2Sw{display:inline-block;width:18px;height:18px;border-radius:50%;border:2px solid #141413}
#gbx.r2 #gbBkCt,#gbx.r2 #gbBkCl,#gbx.r2 #r2More{position:absolute;left:0;bottom:calc(100% + 8px);display:none;flex-wrap:wrap;gap:6px;padding:8px;max-width:calc(100% - 16px);background:rgba(22,38,86,.96);border:2px solid #141413;border-radius:14px;box-shadow:0 4px 0 rgba(0,0,0,.35);overflow:visible}
#gbx.r2 #r2More{left:auto;right:0;max-width:430px}#gbx.r2 #gbBkCl{left:auto;right:150px}
#gbx.r2 #gbBkP.r2PopCt #gbBkCt,#gbx.r2 #gbBkP.r2PopCl #gbBkCl,#gbx.r2 #gbBkP.r2PopMo #r2More{display:flex}
#gbx.r2 #gbBkCt .gbCt{height:44px;padding:0 12px}#gbx.r2 #gbBkCl .gbCl{width:44px;height:44px;border:2px solid #141413}#gbx.r2 #gbBkCl .gbCl.on{box-shadow:0 0 0 3px #ffd400}
#gbx.r2 #gsBar,#gbx.r2 #slBar{left:calc(var(--r2rw) + 6px);top:calc(var(--r2hh) + 6px);gap:5px}#gbx.r2 #gsBar{display:flex;flex-direction:column}#gbx.r2 #gsBar[hidden],#gbx.r2 #slBar[hidden]{display:none}#gbx.r2 #slBar{grid-template-columns:repeat(2,auto)}
#gbx.r2 #gsBar button,#gbx.r2 #slBar button{width:var(--r2pad);height:46px;flex-direction:column;justify-content:center;gap:1px;padding:0;font-size:12px;letter-spacing:0;line-height:1}#gbx.r2 #gsBar .gsPl{grid-column:auto;width:var(--r2pad)}
#gbx.r2 #gsBar button i,#gbx.r2 #slBar button i{font-size:15px;width:auto}#gbx.r2 #slBar [data-s="move"]{background:#22c5e4}#gbx.r2 #slBar [data-s="del"]{background:#ff8a8a}#gbx.r2 #gsBar .gsPl:disabled{opacity:.5}
#gbx.r2 #gsTip{top:calc(var(--r2hh) + 8px);left:calc(50% + var(--r2rw) / 2)}#gbx.r2 .gbHint{left:calc(var(--r2rw) + 10px)!important;right:auto!important;top:auto!important;bottom:calc(var(--r2ch) + 16px);font-size:12px}
#gbx.r2 #gnbP{z-index:7}#gbx.r2:not(.gbBk) #gsTip{display:none}#gbx.r2 .gbFig p{font-size:12px}
@media (min-height:501px) and (min-width:900px){#gbx.r2{--r2hh:58px;--r2rw:92px;--r2ch:60px;--r2pw:400px}#gbx .r2T{height:48px;font-size:13px}#r2H .r2Rib b{font-size:20px}#r2H .r2Nm b{font-size:18px}#r2H .r2Bud i{width:110px}#r2R .r2T{max-height:84px}#r2R .r2T i{font-size:24px}#r2R .r2T span{font-size:13px}#gbx.r2 #gbBkPc .gbPc{width:62px;height:50px}}
@media (max-width:760px),(max-height:500px){#gbx.r2 #gbBkPc .gbPc{width:52px;height:44px}#gbx.r2 .r2BkT .r2T{padding:0 7px}#gbx.r2 .r2BkT .r2T{font-size:12px}}`;document.head.appendChild(st)}
window.__r2={mode:()=>R2_cur(),fr:()=>R2.fr,mats:()=>{const o={};GB.mesh&&GB.mesh.traverse(x=>{if(!x.isMesh)return;let v=x.visible;for(let p=x.parent;p;p=p.parent)v=v&&p.visible;const k=(x.material===GB_MAT?'GB':(x.material.userData&&x.material.userData.r2)||x.material.type)+(v?'':'(hid)')+(x.userData.r!=null?'w':'');o[k]=(o[k]||0)+1});return o},busy:()=>R2.busy+' '+(R2.perr||''),cand:(x,y)=>{const h=GB_pick(x,y),c=GB_cand(h);return{h:h&&{i:h.i,j:h.j,b:!!h.brick},c:c&&{x:c.x,z:c.z,y:c.y,bad:!!c.bad},cap:!!GB_.capHit}},go:(m,s)=>R2_go(m,s),fin:()=>R2_fin(),finMat:f=>R2_mat(f),area:()=>R2_calc(),kitTh:k=>R2_kitTh(k),
 plFin:()=>{try{let f=null;pl.mesh.traverse(x=>{if(x.isMesh&&x.material&&x.material.userData&&x.material.userData.r2)f=x.material.userData.r2});return(f||'gloss').replace('chromeD','chrome')}catch(e){return null}},
 gbFin:()=>{let f=null;GB.mesh&&GB.mesh.traverse(x=>{if(x.isMesh&&x.material&&x.material.userData&&x.material.userData.r2)f=x.material.userData.r2});return f||'gloss'}};
