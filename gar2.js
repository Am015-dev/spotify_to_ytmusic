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
const GAR_UP=[['sp','SPOILER','han','Handling'],['ex','EXHAUSTS','acc','Acceleration'],['wh','WHEELS','hull','Health'],['bo','BOOSTER','top','Top speed']] // rims: chrome → gold → red,GAR_UPC=[600,1200,2400];
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
