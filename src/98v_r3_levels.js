// ===== R3 "Levels matter" (PRO_PLAN items 4, 5, 6). 2K facts (official PC manual + racinggames.gg/ggrecon, see docs/research/LEGO2K_RESEARCH.md):
// one perk slot per performance class (C, B, A = 3 max); the driver level sets the 4 base stats (Top Speed, Acceleration, Handling, Health);
// the perks screen shows a big LVL + XP bar, the class badge, 4 tall bars with a white level line and the C/B/A slot column.
// Ours: slots unlock with the class at driver level 1 / 10 / 20; every level-up shows a reward card; PERKS and DRIVER modes of the garage
// shell get the 2K perks/profile screen; RIDES gets a full-screen SHOWROOM (carousel + filter tabs + 3-card loadout). Tag: R3_.
perkSlots=function(){const l=carStat().lvl;return l>=20?3:l>=10?2:1};
const R3_SL=[1,10,20],R3_CL=['C','B','A'];
// 2K-style stat perks (race only, like Tank Mode): small, inside the race caps. st = stat deltas, also drawn as ticks on the bars.
PERKS.push({id:'hanb',icon:'🛞',name:'Handling Boost',d:'+5% grip in races',lvl:2,st:{han:.05}},{id:'accb',icon:'🚀',name:'Acceleration Boost',d:'+5% acceleration in races',lvl:6,st:{acc:.05}},
 {id:'topb',icon:'⏩',name:'Top Speed Boost',d:'+2% top speed in races',lvl:8,st:{top:.02}},{id:'hpb',icon:'❤️',name:'Health Boost',d:'+20% health in races',lvl:24,st:{hull:.2}});
{const S={tank:{hull:.3,top:-.03},glass:{top:.04,hull:-.2},crown:{top:.03}};for(const p of PERKS)if(S[p.id])p.st=S[p.id]}
setupRace=(f=>function(cfg){const r=f.apply(this,arguments);try{if(pl&&pl.stats){const s=pl.stats;for(const id of['hanb','accb','topb','hpb'])if(PK.has(id)){const d=PERKS.find(p=>p.id===id).st;
  for(const k in d){s[k]*=1+d[k];if(k==='top'&&s.top0)s.top0*=1+d[k]}}}}catch(e){}return r})(setupRace);
// ---------- level road: what each level gives (stats every level; class + slot at 10/20; perks at their level)
function R3_road(L){const r=[];if(L===10)r.push(['🅱','CLASS B','2nd perk slot · boost lock: double-tap boost']);if(L===20)r.push(['🅰','CLASS A','3rd perk slot · rivals go all out']);
 for(const p of PERKS)if(p.lvl===L)r.push([p.icon,'NEW PERK: '+p.name.toUpperCase(),p.d]);return r}
function R3_next(L){for(let n=L+1;n<=30;n++){const r=R3_road(n);if(r.length)return`Lvl ${n} · ${r[0][1].replace('NEW PERK: ','')}`}return L>=30?'MAX LEVEL':''}
const R3_xp=()=>{const x=(store.peek('mho_prof',{}).xp)||0,L=lvlOf(x),x0=150*(L-1)**2,x1=150*L**2;return{x,L,a:x-x0,m:x1-x0,max:L>=30}};
const R3_base=L=>Math.round(40+60*(L-1)/29);
// bars: level line (base for the level) + the equipped car's −3…+3 chips (3 points each) + the equipped perks' stat deltas
const R3_ST=[['top','TOP SPEED'],['acc','ACCEL'],['hull','HEALTH'],['han','HANDLING']];
function R3_stats(L){const b=R3_base(L),eq=perkEq0(),o={};let t=null,base=null;try{base=TEAMS[teamIdx];t=gbTeam(base,GB.d||gbBuild())}catch(e){}
 for(const[k]of R3_ST){const ch=t&&base?R1_chip(t[k],base[k]):0;let pc=0;for(const id of eq){const p=PERKS.find(q=>q.id===id);if(p&&p.st&&p.st[k])pc+=p.st[k]}
  o[k]={line:b,car:ch*3,perk:Math.round(b*pc),v:clamp(Math.round(b+ch*3+b*pc),2,100)}}return o}
function R3_hero(L,big){const X=R3_xp(),c=R3_CL[L>=20?2:L>=10?1:0],xl=L===X.L;
 return`<div class="r3Hero ${big?'big':''}"><div class="r3Cls r3C${c}"><b>${c}</b><small>CLASS</small></div><div class="r3Lv"><small>LVL</small><b>${L}</b></div>
  <div class="r3Xp"><span><i style="width:${xl?(X.max?100:Math.round(100*X.a/X.m)):0}%"></i></span><small>${xl?(X.max?'MAX LEVEL':X.a.toLocaleString('en-US')+' / '+X.m.toLocaleString('en-US')+' XP'):''}</small><em>${L<30?L+1:'★'}</em></div></div>`}
function R3_bars(L,from){const S=R3_stats(L),F=from?R3_base(from):null;
 return`<div class="r3Bars">${R3_ST.map(([k,n])=>{const s=S[k],d=s.v-s.line;return`<div class="r3B" data-k="${k}"><i style="height:${s.v}%" ${F!=null?`data-from="${F}"`:''}></i><u style="bottom:${s.line}%"></u>${d?`<s class="${d>0?'up':'dn'}" style="bottom:${Math.min(s.v,s.line)}%;height:${Math.abs(d)}%"></s>`:''}<b>${s.v}</b><span>${n}</span></div>`}).join('')}</div>`}
// R3b: the C/B/A slot column is gone (reviewer: one scheme, SLOT 1/2/3 in the bottom bar); kept for reference
function R3_slots(L,tap){const e=perkEq0(),n=perkSlots();return`<div class="r3Sl">${[2,1,0].map(i=>{const p=e[i]&&PERKS.find(q=>q.id===e[i]),open=i<n;
  return`<button class="r3S ${open?'':'lk'} ${tap&&GPK_.pk===i&&open?'on':''}" ${tap&&open?`data-r3sl="${i}"`:'disabled'}><em>${R3_CL[i]}</em><b>${open?(p?p.icon+' '+p.name:'＋ EMPTY'):'🔒 LVL '+R3_SL[i]}</b></button>`}).join('')}</div>`}
const R3_nextHtml=L=>{const n=R3_next(L);return n?`<p class="r3Nx">Next: <b>${n}</b></p>`:''};
// R3b: logbook TO DO lists the mission you are on (it said "No picked events yet" during HOT DROP); tap = back to the drive
journalRender=(f=>function(){const r=f.apply(this,arguments);try{if((RO.jTab||'todo')!=='todo'||!RO.ch)return r;const ch=RO.ch,B=$('#jBody');if(!B||B.querySelector('.r3Act'))return r;
 let nm='',kd='Mission',vb='';try{nm=ch.m?markTitle(ch.m):''}catch(e){}nm=nm||ch.name||(ch.m&&ch.m.ev&&ch.m.ev.name)||'Current mission';try{kd=KIND_N[ch.m&&ch.m.kind]||KIND_N[ch.kind]||'Mission'}catch(e){}try{vb=v85Verb(ch)||''}catch(e){}
 const em=B.querySelector('p.jempty');if(em&&/No picked events/.test(em.textContent))em.remove();
 B.insertAdjacentHTML('afterbegin',`<button class="jrow r3Act"><i>▶</i><div><b>${nm}</b><small>${kd} · active now${vb?' · '+vb:''}</small></div><span></span><u>ON IT</u></button>`);
 B.querySelector('.r3Act').onclick=()=>journalClose()}catch(e){console.warn('R3b log',e)}return r})(journalRender);
// ---------- garage: PERKS mode = the 2K perks screen; DRIVER mode = driver profile card on top of the parts
gbRender=(f=>function(){const r=f.apply(this,arguments);try{R3_garage()}catch(e){console.warn('R3',e)}return r})(gbRender);
function R3_garage(){const B=$('#gbBody');if(!B||$('#gbx').hidden)return;const L=carStat().lvl;
 if(GB.tab==='veh'&&!B.querySelector('.r3Pk')){const d=document.createElement('div');d.className='r3Pk';d.dataset.r2='perks';
  d.innerHTML=R3_hero(L)+`<div class="r3Mid">${R3_bars(L)}</div>`+R3_nextHtml(L)+`<p class="r3Hint">Pick a slot, then a perk below. Perks work in races.</p>`;B.prepend(d);
  d.addEventListener('click',e=>{const b=e.target.closest('[data-r3sl]');if(!b)return;const i=+b.dataset.r3sl;if(GPK_.pk===i)return;GPK_.pk=i;try{AU.sfx('pick')}catch(_){}gbRender()});
  const h=B.querySelector('.gpkTop h5');if(h)h.textContent='CHOOSE A PERK · SLOT '+((GPK_.pk||0)+1)}
 if(GB.tab==='driver'&&!B.querySelector('.r3Drv')){const d=document.createElement('div');d.className='r3Drv';const F=flags(),nf=RIVAL_EV.filter(e=>F[e.p]).length;
  d.innerHTML=`<div class="r3DT"><img alt="" src="${GB_portrait()}"><div><b>${(store.get('mho_name','')||'Rookie').toUpperCase()}</b><small>DRIVER PROFILE</small></div></div>`+R3_hero(L)+R3_nextHtml(L)+
   `<div class="r3Cn"><span>🚩 <b>${nf}/8</b> flags</span><span>🚗 <b>${GAR_SETS.filter(GAR_owned).length}/${GAR_SETS.length}</b> rides</span><span>⚡ <b>${PERKS.filter(perkUnlocked).length}/${PERKS.length}</b> perks</span></div>`;B.prepend(d)}}
// ---------- pause/title PROFILE: hero + level line first; the counters fold into MORE STATS
profileOpen=(f=>function(){f();const B=$('#pfBody');if(!B)return;const L=carStat().lvl;
 const d=B.querySelector('.pcard.drv');if(d&&!d.querySelector('.r3Hero')){const lv=d.querySelector('.lvl');if(lv)lv.remove();const w=d.querySelector('div:not(.lvl)');if(w){w.querySelectorAll('.pbar,small:last-child').forEach(e=>{if(e!==w.querySelector('small'))e.remove()});w.insertAdjacentHTML('beforeend',R3_hero(L))}}
 const st=[...B.querySelectorAll('.pcard')].find(c=>((c.querySelector('h5')||{}).textContent||'')==='STATS');
 if(st&&!st.classList.contains('r3Fold')){st.classList.add('r3Fold');const h=st.querySelector('h5');h.innerHTML='<button class="r3More">MORE STATS ▾</button>';h.firstChild.onclick=()=>{st.classList.toggle('open');try{AU.sfx('pick')}catch(e){}}
  st.insertAdjacentHTML('beforebegin',`<div class="pcard r3PfL"><h5>LEVEL LINE · CLASS ${R3_CL[L>=20?2:L>=10?1:0]}</h5><div class="r3Mid">${R3_bars(L)}</div>${R3_nextHtml(L)}</div>`)}})(profileOpen);
// ---------- level-up card (2K-style): hero, bars rising from the old level line, rewards, next. Menus: modal with CONTINUE; free roam: a small
// card at the top that never blocks driving (auto-hides); races: queued until the race is over.
const R3U={q:[]};
addXP=(f=>function(n,why){const l0=lvlOf(prof().xp),s0=say;say=function(a){if(a==='LEVEL UP')return;return s0.apply(this,arguments)};let r;try{r=f.apply(this,arguments)}finally{say=s0}
 const l1=lvlOf(prof().xp);if(l1>l0){R3U.q.push([l0,l1]);R3_upPump()}return r})(addXP);
const R3_racing=()=>state==='race'||state==='countdown'||state==='finished'||state==='loading';
function R3_upPump(){if(!R3U.q.length||!$('#r3Up').hidden||R3_racing())return;const[l0,l1]=R3U.q.shift();R3_up(l0,l1)}
setInterval(()=>{try{R3_upPump()}catch(e){}},600);
function R3_up(l0,l1,mini){const U=$('#r3Up');let rw=[['📈','STATS UP','top speed, acceleration, handling, health']];for(let L=l0+1;L<=l1;L++)rw=rw.concat(R3_road(L));
 mini=mini!=null?mini:state==='roam';U.classList.toggle('mini',!!mini);
 U.innerHTML=`<div class="r3UC"><div class="r3URib">LEVEL UP!</div>${R3_hero(l1,1)}<div class="r3UB">${R3_bars(l1,l0)}<ul>${rw.slice(0,mini?2:4).map(([i,t,s])=>`<li><i>${i}</i><b>${t}</b><small>${s}</small></li>`).join('')}</ul></div>${R3_nextHtml(l1)}
  ${mini?'':`<div class="r3UBt">${rw.some(r=>/PERK/.test(r[1]))?'<button class="r3Go alt" data-r3u="perks">⚡ PERKS</button>':''}<button class="r3Go" data-r3u="ok">CONTINUE ▶</button></div>`}</div>`;
 U.hidden=false;try{AU.sfx('finish')}catch(e){}
 requestAnimationFrame(()=>U.querySelectorAll('.r3UB .r3B i[data-from]').forEach(i=>{const h=i.style.height;i.style.transition='none';i.style.height=i.dataset.from+'%';i.offsetHeight;i.style.transition='height 1.1s cubic-bezier(.2,.9,.3,1.2) .25s';i.style.height=h}));
 clearTimeout(R3U.t);if(mini)R3U.t=setTimeout(()=>{U.hidden=true},5200)}
{const U=document.createElement('div');U.id='r3Up';U.hidden=true;document.body.appendChild(U);
 U.addEventListener('click',e=>{const b=e.target.closest('[data-r3u]');if(!b)return;U.hidden=true;try{AU.sfx('pick')}catch(_){}
  if(b.dataset.r3u==='perks'&&state!=='roam'){try{gbOpen();setTimeout(()=>{try{R2_go('perks')}catch(_){}},60)}catch(_){}}setTimeout(R3_upPump,300)})}
// ---------- SHOWROOM (RIDES → 🏁 SHOWROOM): full screen, filter tabs, a carousel of big cards, the 3-card loadout (street + off-road + boat)
const R3S={f:'car'};
function R3_show(on){const X=$('#gbx');let S=$('#r3Sh');if(!S){S=document.createElement('div');S.id='r3Sh';S.hidden=true;X.appendChild(S);S.addEventListener('click',R3_shTap)}
 if(on===false){S.hidden=true;return}R3S.f=G9C.type||'car';S.hidden=false;R3_shDraw()}
function R3_card(S,f,eq,sm){const own=GAR_owned(S),[tn,tc]=GAR_TIER[S.tier],k=G9C_key(S,f);let w='';try{w=R1_weight(G9C_bricks(S,f).length)}catch(e){}
 return`<div class="r3Cd ${sm?'sm':''} ${S.id===eq?'on':''} ${own?'':'lk'}" style="--tc:${tc}" data-r3c="${S.id}" data-f="${f}"><img data-k="${k}" data-s="${S.id}" data-f="${f}" alt=""><i class="r3Rr">${tn}</i>
  <b>${own?'':'🔒 '}${G9C_name(S,f)}</b><small>${S.id===eq?'✔ EQUIPPED':own?((typeof GPK_GRP!=='undefined'&&GPK_GRP[S.id])||(S.tpl?'LEGO design':'tap to equip')):gbReqTxt(S.req)}</small>${w&&!sm?`<em>⚖ ${w}</em>`:''}</div>`}
function R3_shDraw(){const S=$('#r3Sh'),f=R3S.f,{A}=G9C_list(f),eq=G9C_eq(f);const TY=G9C_TY;
 S.innerHTML=`<div class="r3ShH"><div class="r2Rib"><b>SHOWROOM</b></div>${TY.map(([k,ic,n])=>{const L=G9C_list(k);return`<button class="r2T ${k===f?'on':''}" data-r3t="${k}">${ic} ${n} <small>${L.own}/${L.all}</small></button>`}).join('')}<span class="r2Sp"></span><button class="r2T" data-r3x><i>✕</i>BACK</button></div>
  <div class="r3Car">${A.map(e=>R3_card(e.S,f,eq)).join('')}</div>
  <div class="r3Lo"><b class="r3LoT">LOADOUT</b>${TY.map(([k,ic,n])=>{const id=G9C_eq(k),s=GAR_set(id);return`<div class="r3LoC ${k===f?'on':''}" data-r3t="${k}"><small>${ic} ${n}</small>${s?R3_card(s,k,id,1):''}</div>`}).join('')}</div>`;
 const c=S.querySelector('.r3Car .r3Cd.on');if(c)c.scrollIntoView({inline:'center',block:'nearest'});R3_shPump()}
function R3_shTap(e){const t=e.target.closest('[data-r3x],[data-r3t],[data-r3c]');if(!t)return;e.stopPropagation();
 if(t.hasAttribute('data-r3x')){try{AU.sfx('pick')}catch(_){}R3_show(false);try{gbRender()}catch(_){}return}
 if(t.dataset.r3c&&!t.closest('.r3Lo')){const S=GAR_set(t.dataset.r3c);if(G9C_equip(S,t.dataset.f)){GAR_.pv=t.dataset.f==='off'?'4x4':t.dataset.f}R3_shDraw();return}
 const k=t.dataset.r3t||(t.closest('[data-r3t]')||{}).dataset?.r3t;if(k){R3S.f=k;G9C.type=k;GAR_.pv=k==='off'?'4x4':k;try{AU.sfx('pick')}catch(_){}R3_shDraw()}}
function R3_shPump(){if(R3S.busy)return;R3S.busy=1;const next=()=>{const im=document.querySelector('#r3Sh:not([hidden]) img[data-k]:not([src])');if(!im){R3S.busy=0;return}
  let u=null;try{u=G9C_render(GAR_set(im.dataset.s),im.dataset.f)}catch(e){u=null}document.querySelectorAll(`#r3Sh img[data-k="${im.dataset.k}"]`).forEach(i=>{if(u)i.src=u;else i.removeAttribute('data-k')});setTimeout(next,16)};setTimeout(next,30)}
gbClose=(f=>function(){R3_show(false);return f.apply(this,arguments)})(gbClose);
// ---------- styles (garage tile style: white, black outline, italic 900; 2K perks colours: navy, purple bars, yellow class badge)
{const st=document.createElement('style');st.textContent=`
.r3Hero{display:flex;align-items:center;gap:8px;margin:2px 0 6px}.r3Cls{width:46px;height:46px;flex:none;border-radius:10px;background:#ffd12c;border:3px solid #141413;color:#141413;display:grid;place-items:center;line-height:1;transform:skewX(-8deg)}
.r3Cls b{font:italic 900 24px var(--hud)}.r3Cls small{font:italic 900 12px var(--hud);margin-top:-6px}.r3CA{background:#ff5a3c}.r3CB{background:#ffd12c}.r3CC{background:#5fd1ff}
.r3Lv{display:flex;align-items:baseline;gap:3px;flex:none;color:#fff}.r3Lv small{font:italic 900 14px var(--hud);color:#7fd3ff}.r3Lv b{font:italic 900 40px/1 var(--hud);text-shadow:0 3px 0 #141413}
.r3Xp{flex:1;min-width:0;display:grid;grid-template-columns:1fr auto;align-items:center;gap:1px 6px}.r3Xp span{height:12px;border-radius:6px;background:#1d2a55;border:2px solid #141413;overflow:hidden}.r3Xp span i{display:block;height:100%;background:linear-gradient(90deg,#ffb000,#ffd12c)}
.r3Xp small{grid-row:2;font:700 12px system-ui;color:#c9d6ff}.r3Xp em{font:italic 900 14px var(--hud);color:#7fd3ff;font-style:italic}
.r3Hero.big .r3Cls{width:58px;height:58px}.r3Hero.big .r3Cls b{font-size:32px}.r3Hero.big .r3Lv b{font-size:56px}
.r3Mid{display:flex;gap:8px;align-items:stretch}.r3Bars{flex:1;display:grid;grid-template-columns:repeat(4,1fr);gap:5px;height:132px}
.r3B{position:relative;border-radius:8px;background:#2a1450;border:2px solid #141413;overflow:hidden}.r3B i{position:absolute;left:0;right:0;bottom:0;background:linear-gradient(#d65cff,#9a2fe0);transition:height .4s}
.r3B u{position:absolute;left:-2px;right:-2px;height:3px;margin-bottom:-1px;background:#fff;box-shadow:0 0 6px #fff;text-decoration:none}.r3B s{position:absolute;left:0;right:0;text-decoration:none;opacity:.9}.r3B s.up{background:#3fd46a}.r3B s.dn{background:#ff4d4d}
.r3B b{position:absolute;top:3px;left:0;right:0;text-align:center;font:italic 900 13px var(--hud);color:#fff;text-shadow:0 1px 2px #000}
.r3B span{position:absolute;left:50%;bottom:6px;transform:translateX(-50%) rotate(180deg);writing-mode:vertical-rl;font:italic 900 12px var(--hud);color:#fff;letter-spacing:.03em;text-shadow:0 1px 2px #000;white-space:nowrap}
.r3Sl{display:flex;flex-direction:column;gap:4px;width:104px;flex:none}.r3S{all:unset;box-sizing:border-box;position:relative;flex:1;min-height:44px;display:flex;align-items:center;gap:5px;padding:2px 6px 2px 4px;border-radius:9px;background:#fff;border:3px solid #141413;color:#141413;cursor:pointer}
.r3S em{flex:none;width:20px;font:italic 900 15px var(--hud);color:#141413;background:#ffd12c;border-radius:5px;text-align:center}.r3S b{flex:1;min-width:0;font:italic 900 12px/1.1 var(--hud);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.r3S.on{background:#ffd12c}.r3S.on em{background:#fff}.r3S.lk{background:#c9cfdb;cursor:default}.r3S.lk em{background:#9aa3b0}
.r3Nx{margin:6px 0 2px;font:700 12px system-ui;color:#c9d6ff}.r3Nx b{color:#ffd12c;font:italic 900 13px var(--hud)}.r3Hint{margin:2px 0 6px;font:700 12px system-ui;color:#8fb3c7}
#gbx.r2m-perks #gbStats{display:none!important}#gbx.r2m-rides #gbBody .r3Pk{display:none!important}
.r3Drv{margin:0 0 8px;padding:8px;border-radius:12px;background:linear-gradient(135deg,#1d2a6e,#2a1450);border:2px solid #141413}.r3DT{display:flex;gap:8px;align-items:center;margin-bottom:4px}.r3DT img{width:48px;height:48px;border-radius:10px;border:3px solid #141413;background:#cfe8ff}
.r3DT b{display:block;font:italic 900 16px var(--hud);color:#fff}.r3DT small{font:italic 900 12px var(--hud);color:#7fd3ff}.r3Cn{display:flex;flex-wrap:wrap;gap:4px 10px;font:700 12px system-ui;color:#c9d6ff}.r3Cn b{color:#fff}
#gbx .gbFig+.r3Drv,#gbx .r3Drv~.gbInfo{display:none}
#profile .r3Hero .r3Lv b{color:#141413;text-shadow:none}#profile .r3Hero .r3Lv small,#profile .r3Xp em{color:#6a3df0}#profile .r3Xp small{color:#4a5468}#profile .r3Hero{margin:4px 0 0}
#profile .r3PfL{background:#1d2a6e}#profile .r3PfL h5{color:#ffd12c}#profile .r3PfL .r3Nx{color:#c9d6ff}#profile .r3Fold:not(.open)>:not(h5){display:none}
#profX{min-width:44px!important;min-height:44px!important;display:inline-grid;place-items:center}
.r3More{all:unset;cursor:pointer;min-height:44px;display:inline-flex;align-items:center;padding:0 12px;border-radius:999px;background:#fff;border:3px solid #141413;font:italic 900 13px var(--hud);color:#141413}
#r3Up{position:fixed;inset:0;z-index:60;display:grid;place-items:center;background:rgba(5,3,15,.62);font-family:system-ui}#r3Up[hidden]{display:none}body:has(#r3Up:not([hidden])) #odNew{display:none!important}
#r3Up .r3UC{position:relative;width:min(560px,94vw);max-height:calc(100vh - 28px);margin-top:14px;overflow:visible;box-sizing:border-box;padding:16px 16px 12px;border-radius:18px;background:linear-gradient(135deg,#1d2a6e,#2a1450);border:4px solid #141413;box-shadow:0 8px 0 #141413,0 0 40px rgba(214,92,255,.5);color:#fff}
#r3Up .r3URib{position:absolute;left:-6px;top:-16px;padding:4px 16px;background:#e01e2b;border:3px solid #141413;color:#ffd12c;font:italic 900 18px var(--hud);transform:rotate(-4deg);box-shadow:0 4px 0 #141413}
#r3Up .r3UB{display:flex;gap:10px}#r3Up .r3UB .r3Bars{flex:0 0 190px;height:120px}#r3Up ul{flex:1;min-width:0;list-style:none;margin:0;padding:0;display:grid;gap:5px;align-content:start}
#r3Up li{display:grid;grid-template-columns:26px 1fr;column-gap:6px;padding:4px 8px;border-radius:9px;background:rgba(255,255,255,.1)}#r3Up li i{grid-row:1/3;font-style:normal;font-size:20px;align-self:center}#r3Up li b{font:italic 900 13px var(--hud);color:#ffd12c}#r3Up li small{font:700 12px system-ui;color:#dfe6ff}
#r3Up .r3UBt{display:flex;justify-content:flex-end;gap:8px;margin-top:6px}.r3Go{all:unset;cursor:pointer;min-height:44px;display:inline-flex;align-items:center;padding:0 18px;border-radius:12px;background:#3fd46a;border:3px solid #141413;box-shadow:0 4px 0 #141413;font:italic 900 15px var(--hud);color:#141413}.r3Go.alt{background:#fff}
#r3Up.mini{inset:auto;left:50%;top:calc(8px + env(safe-area-inset-top,0px));transform:translateX(-50%) scale(.62);transform-origin:top center;background:none;pointer-events:none}#r3Up.mini .r3UC{width:560px}
@media (max-height:430px){#r3Up:not(.mini) .r3UC{padding:12px 12px 8px}#r3Up:not(.mini) .r3Hero.big .r3Lv b{font-size:44px}#r3Up:not(.mini) .r3UB .r3Bars{height:104px}}
#r3Sh{position:absolute;inset:0;z-index:20;display:flex;flex-direction:column;background:radial-gradient(ellipse at 50% 30%,#2a4fb0,#141c4a 75%);font-family:system-ui;color:#fff;padding:0 0 env(safe-area-inset-bottom,0px)}#r3Sh[hidden]{display:none}
#r3Sh .r3ShH{display:flex;align-items:center;gap:6px;height:52px;box-sizing:border-box;padding:0 max(8px,env(safe-area-inset-right,0px)) 0 0;background:#fff;border-bottom:3px solid #141413}
#r3Sh .r2Rib{flex:none;height:100%;display:flex;align-items:center;padding:0 18px 0 calc(10px + env(safe-area-inset-left,0px));background:#e8202a;clip-path:polygon(0 0,100% 0,88% 100%,0 100%)}#r3Sh .r2Rib b{font:italic 900 18px var(--hud);color:#ffd400;-webkit-text-stroke:1px #141413}#r3Sh .r2Sp{flex:1}
#r3Sh .r2T small{font-size:12px;opacity:.75}#r3Sh .r3Car{flex:1;min-height:0;display:flex;gap:12px;overflow-x:auto;overflow-y:hidden;scroll-snap-type:x mandatory;padding:12px max(14px,env(safe-area-inset-left,0px));align-items:center}
.r3Cd{position:relative;flex:0 0 196px;scroll-snap-align:center;display:grid;gap:1px;padding:8px 8px 10px;border-radius:14px;background:#fff;border:3px solid #141413;border-bottom:7px solid var(--tc);box-shadow:0 5px 0 rgba(0,0,0,.35);color:#141413;cursor:pointer;transform:skewX(-4deg)}
.r3Cd>*{transform:skewX(4deg)}.r3Cd img{width:100%;aspect-ratio:168/104;border-radius:9px;background:radial-gradient(ellipse at 50% 70%,#dfe8ff,#9fb4e0 80%)}.r3Cd.on{background:#ffd12c;box-shadow:0 0 0 3px #fff,0 5px 0 rgba(0,0,0,.35)}.r3Cd.lk img{filter:grayscale(1) brightness(.75)}
.r3Cd .r3Rr{position:absolute;left:12px;top:12px;font:italic 900 12px var(--hud);color:#141413;background:var(--tc);border:2px solid #141413;border-radius:6px;padding:0 6px}
.r3Cd b{font:italic 900 15px var(--hud);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.r3Cd small{font:700 12px system-ui;color:#4a5468}.r3Cd em{font:italic 900 12px var(--hud);color:#141413}
#r3Sh .r3Lo{display:flex;gap:8px;align-items:stretch;padding:6px max(10px,env(safe-area-inset-left,0px)) 8px;background:rgba(5,3,15,.45)}#r3Sh .r3LoT{writing-mode:vertical-rl;transform:rotate(180deg);font:italic 900 13px var(--hud);color:#ffd12c;text-align:center}
#r3Sh .r3LoC{flex:1;min-width:0;display:grid;gap:2px;cursor:pointer}#r3Sh .r3LoC>small{font:italic 900 12px var(--hud);color:#c9d6ff}#r3Sh .r3LoC.on>small{color:#ffd12c}
.r3Cd.sm{flex:none;display:grid;grid-template-columns:72px 1fr;column-gap:6px;padding:3px 6px;border-bottom-width:4px;transform:none;min-height:44px;align-items:center}.r3Cd.sm>*{transform:none}.r3Cd.sm img{grid-row:1/3;width:72px}.r3Cd.sm .r3Rr{display:none}.r3Cd.sm b{font-size:13px}
@media (max-height:430px){.r3Cd{flex-basis:178px}#r3Sh .r3Car{padding-top:8px;padding-bottom:8px}}`;document.head.appendChild(st)}
window.__r3={up:(a,b,m)=>R3_up(a,b,m),road:R3_road,next:R3_next,stats:L=>R3_stats(L||carStat().lvl),show:o=>R3_show(o),slots:()=>perkSlots(),eq:()=>perkEq0(),
 setLvl:L=>{const p=prof();p.xp=150*(L-1)**2;store.set('mho_prof',p);return lvlOf(p.xp)},q:()=>R3U.q.length};
