// ---- map
function picks(){return store.peek('mho_pick',[])}
function pickAdd(m){if(!m||!m.ev&&m.kind!=='rival'&&m.kind!=='boss'&&m.kind!=='flight'||['garage','season','cruise'].includes(m.kind))return;let k;try{k=markKey(m)}catch(e){return}const L=picks().filter(x=>x!==k);L.unshift(k);store.set('mho_pick',L.slice(0,40))}
function pickDrop(k){store.set('mho_pick',picks().filter(x=>x!==k))}
function journalOpen(){RO.jOpen=true;RO.frozen=true;$('#journal').hidden=false;journalRender()}
function journalClose(){RO.jOpen=false;RO.frozen=false;$('#journal').hidden=true;camSnap=true}
const KIND_N={flight:'Flight',rival:'Rival duel',boss:'Boss race',sprint:'Sprint',otg:'Side challenge',quest:'Side quest',challenge:'Challenge',mode:'Mode',cup:'Cup',season:'Grand Prix'};
function journalRender(){const T=RO.jTab||'todo',B=$('#jBody');document.querySelectorAll('#journal .jt button').forEach(b=>b.classList.toggle('on',b.dataset.t===T));const st=n=>'<span class="jst">'+'★'.repeat(n)+'<i>'+'★'.repeat(3-n)+'</i></span>';let h='';
  if(T==='todo'){const P=picks(),L=P.map(k=>RO.marks.find(m=>{try{return markKey(m)===k}catch(e){return false}})).filter(m=>m&&!markLocked(m)&&!markDone(m)&&!['garage','season'].includes(m.kind));
    h=L.length?L.map((m,i)=>`<button class="jrow" data-i="${RO.marks.indexOf(m)}"><i>${mapIcon(m)}</i><div><b>${markTitle(m)}</b><small>${KIND_N[m.kind]||m.kind} · ${districtAt(m.x,m.z)} · ${Math.round(Math.hypot(m.x-RO.x,m.z-RO.z))} m</small></div>${st(markStars(m))}<u>${RO.wp===m?'ON ROUTE':'SET ROUTE'}</u><s class="jdrop" data-k="${markKey(m)}" title="Remove from logbook">✕</s></button>`).join(''):'<p class="jempty">No picked events yet. Story races, missions and side quests appear here once you pick them: open 🏁 EVENTS or tap an icon on the 🗺️ MAP and choose SET ROUTE, or drive into a beacon and start it.</p>';
    const und=RO.marks.filter(m=>!markLocked(m)&&!markKnown(m)).length;if(und)h+=`<p class="jempty">${und} more side events are still undiscovered. Explore the districts to find them.</p>`}
  else if(T==='done'){const L=Object.values(store.get('mho_log',{})).sort((a,b)=>b.last-a.last),fmt=t=>new Date(t).toLocaleDateString('de-DE',{day:'2-digit',month:'2-digit'})+' '+new Date(t).toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'});
    h=L.length?L.map(o=>`<div class="jrow"><i>${o.s===3?'🏆':'✔'}</i><div><b>${o.n}</b><small>${KIND_N[o.k]||o.k}${o.d?' · best '+o.d:''} · ${fmt(o.last)}</small></div>${st(o.s)}</div>`).join(''):'<p class="jempty">Your finished races, sprints, challenges and quests will be written here.</p>'}
  else if(T==='col'){const gb=(roamSave().gb||[]).length,pk=packs().length,ts=totStars(),own=gbOwn().length;h=`<div class="jgrid"><div><i>🧱</i><b>${gb} / ${RO.gbs?RO.gbs.length:30}</b><small>Golden bricks</small></div><div><i>📦</i><b>${pk} / 12</b><small>Brick packs</small></div><div><i>★</i><b>${ts}</b><small>Stars earned</small></div><div><i>🔧</i><b>${own}</b><small>Parts bought or won</small></div><div><i>📍</i><b>${disc().length}</b><small>Places discovered</small></div><div><i>🟡</i><b>${season().cr.toLocaleString('de-DE')}</b><small>Studs</small></div></div><p class="jempty">Collectibles are not shown on the map: look for the golden light beams (bricks) and blue beams (brick packs).</p>`}
  else{const D={};for(const m of RO.marks){if(['garage','season'].includes(m.kind)||markLocked(m))continue;const d=districtAt(m.x,m.z)||'Mainhattan';(D[d]=D[d]||{n:0,done:0,st:0,max:0});D[d].n++;if(markDone(m))D[d].done++;D[d].st+=markStars(m);D[d].max+=3}
    h=Object.entries(D).sort((a,b)=>b[1].n-a[1].n).map(([d,o])=>`<div class="jrow"><i>📍</i><div><b>${d}</b><small>${o.done} / ${o.n} events done · ${o.st} / ${o.max} ★</small><div class="jbar"><i style="width:${Math.round(o.st/Math.max(1,o.max)*100)}%"></i></div></div></div>`).join('')}
  B.innerHTML=h;B.querySelectorAll('.jdrop').forEach(x=>x.onclick=ev=>{ev.stopPropagation();const m=RO.wp;pickDrop(x.dataset.k);try{if(m&&markKey(m)===x.dataset.k)RO.wp=null}catch(e){}journalRender()});B.querySelectorAll('.jrow[data-i]').forEach(b=>b.onclick=()=>{RO.wp=RO.marks[+b.dataset.i];journalClose();say('',('ROUTE · '+markTitle(RO.wp)).toUpperCase(),1.4)})}
function toggleMap(on){RO.mapOpen=on??!RO.mapOpen;$('#roamMap').hidden=!RO.mapOpen;if(CID==='ath'&&!document.getElementById('athDP')){const m=$('#roamMap'),dv=document.createElement('div');dv.id='athDP';dv.style.cssText='position:absolute;left:50%;transform:translateX(-50%);bottom:14px;display:flex;gap:6px;z-index:5;flex-wrap:wrap;justify-content:center';for(const d in ATH_DIST){const b=document.createElement('button');b.textContent=(d===ATHD?'● ':'')+d+' · '+ATH_DIST[d].name;b.style.cssText=`font:800 12px system-ui;padding:6px 10px;border-radius:8px;border:2px solid ${ATH_DIST[d].col};background:${d===ATHD?ATH_DIST[d].col:'rgba(5,11,24,.85)'};color:${d===ATHD?'#141413':'#fff'};cursor:pointer`;b.onclick=e=>{e.stopPropagation();athDistPick(d)};dv.appendChild(b)}m.appendChild(dv)}if(!RO.mapOpen)ftShow(null);if(RO.mapOpen){RO.mapC={x:RO.x,z:RO.z};drawRoamMap()}}
function buildWorld(){if(CID==='ath')return buildWorldAth();const F=flags(),nf=RIVAL_EV.filter(e=>F[e.p]).length,open=nf>=BOSS_EV.need;
  $('#wHead').innerHTML=`<button class="go" id="roamBtn" style="float:right;margin-left:8px">🌍 FREE ROAM</button><b>Frankfurt flags ${nf}/8</b> · beat each rival one-on-one to win their flag. ${open?(F.SKYCUP?'🏆 <b>Sky Cup champion!</b>':'<b style="color:#ff2d95">Grand Arena open: beat Vex Kaiser!</b>'):`${BOSS_EV.need-nf} more flags open the Grand Arena boss race.`}`;
  const L=$('#wList');L.innerHTML='';[...RIVAL_EV,BOSS_EV].forEach(ev=>{const boss=ev===BOSS_EV,lock=boss&&!open,p=PD[ev.p],td=TRACK_DEFS.find(t=>t.id===ev.track);const b=document.createElement('button');b.className='wev'+(worldPick===ev?' on':'')+(boss?' boss':'');b.disabled=lock;
    b.innerHTML=`<img class="av" src="${avatar(p.n)}" alt=""><span><b>${lock?'🔒 ':''}${p.flag} ${p.full}</b><em>${boss?'GRAND ARENA · boss':SIG[ev.sig]} · ${td.short}${ev.track==='hafen'?' (water)':ev.track==='fraport'?' (off-road)':''}</em></span><i>${boss?(F.SKYCUP?'🏆':''):F[ev.p]?'🚩':''}</i>`;
    b.onclick=()=>{worldPick=ev;buildWorld();refreshAttract()};L.appendChild(b)});$('#roamBtn').onclick=()=>enterRoam()}
function buildWorldAth(){const F=flags(),nf=athNF(F),open=nf>=ATH_BOSS_EV.need;
  $('#wHead').innerHTML=`<button class="go" id="roamBtn" style="float:right;margin-left:8px">🌍 FREE ROAM</button><b>Athens flags ${nf}/6</b> · beat each rival one-on-one on the Athens circuits. ${open?(F.AKROCUP?'🏛 <b>Akropolis Cup champion!</b>':'<b style="color:#ff2d95">Akropolis Cup Final open: beat Thanos Drakos!</b>'):`${ATH_BOSS_EV.need-nf} more flags open the Akropolis Cup Final.`}`;
  const L=$('#wList');L.innerHTML='';[...ATH_TRK_EV,ATH_BOSS_EV].forEach(ev=>{const boss=!!ev.boss,lock=boss&&!open,p=PD[ev.p],td=TRACK_DEFS.find(t=>t.id===ev.track);const b=document.createElement('button');b.className='wev'+(worldPick===ev?' on':'')+(boss?' boss':'');b.disabled=lock;
    b.innerHTML=`<img class="av" src="${avatar(p.n)}" alt=""><span><b>${lock?'🔒 ':''}${p.flag} ${p.full}</b><em>${boss?'AKROPOLIS CUP FINAL · boss':SIG[ev.sig]} · ${td.short}</em></span><i>${boss?(F.AKROCUP?'🏛':''):F[ev.p]?'🚩':''}</i>`;
    b.onclick=()=>{worldPick=ev;buildWorld();refreshAttract()};L.appendChild(b)});$('#roamBtn').onclick=()=>enterRoam()}
function buildSeason(){const S=season(),L=S.L,lg=LEAGUES[L],rd=seasonRound(L,S.r),nm=nemesis();
  $('#seaHead').innerHTML=`<b>${lg.name}</b> · Round ${S.r+1}/5: <b>${rd.name}</b> · ${rd.short}${rd.dbl?' · ×2 pts':''}${nm?` · <span class="nem">Nemesis ${nm}</span>`:''}`;
  const lgE=$('#segLeague');lgE.innerHTML='';LEAGUES.forEach((x,i)=>{const b=document.createElement('button');b.className='rnd'+(i===L?' cur':'');b.textContent=(i>S.max?'🔒 ':'')+x.sh;b.disabled=i>S.max;b.onclick=()=>{if(i===L)return;S.L=i;S.r=0;S.pts={};saveSeason(S);buildMenu();refreshAttract()};lgE.appendChild(b)});
  $('#seaRounds').innerHTML=RND_NAMES.map((n,i)=>{const q=seasonRound(L,i);return`<span class="rnd ${i===S.r?'cur':i<S.r?'done':''}" title="${n}">R${i+1} ${q.short}</span>`}).join('');
  const tb=$('#seaTabs');tb.innerHTML='';[['table','Standings'],['garage','Garage'],['rivals','Rivals']].forEach(([v,l])=>{const b=document.createElement('button');b.className='rnd'+(seaView===v?' cur':'');b.textContent=l;b.onclick=()=>{seaView=v;buildSeason()};tb.appendChild(b)});const cr=document.createElement('span');cr.className='rnd';cr.style.marginLeft='auto';cr.style.border='0';cr.innerHTML=`Credits <b style="color:var(--gold)">${S.cr.toLocaleString('de-DE')}</b>`;tb.appendChild(cr);
  const body=$('#seaBody');
  if(seaView==='table'){body.innerHTML='<table>'+standings(S).map((e,i)=>{const p=PD[e.k];return`<tr class="${e.k==='YOU'?'me':''}"><td>${i+1}</td><td>${p?`<img class="av" src="${avatar(e.k)}" alt="">${p.flag} ${p.full}`:'YOU · '+TEAMS[teamIdx].name}${e.k===nm?' <span class="nem">NEMESIS</span>':''}</td><td>${p?(TEAMS.find(t=>t.id===p.team)||{}).name:''}</td><td class="n">${e.p} pts</td></tr>`}).join('')+'</table>'}
  else if(seaView==='garage'){body.innerHTML='';UPG.forEach(u=>{const lv=S.up[u.k]||0,cost=UPC[lv];const d=document.createElement('div');d.className='upg';d.innerHTML=`<div><b>${u.name}</b> <small>${u.fx} per level</small></div><span class="pips">${[0,1,2,3,4].map(i=>`<i class="${i<lv?'on':''}"></i>`).join('')}</span>`;
      const b=document.createElement('button');b.className='rnd';const needS=UPS[lv]||0,haveS=totStars(),lockS=lv<5&&haveS<needS;b.textContent=lv>=5?'MAX':lockS?'🔒 '+needS+' ★':cost.toLocaleString('de-DE')+' cr';b.title=lockS?`Level ${lv+1} needs ${needS} ★ (you have ${haveS}). Win events to earn stars.`:'';b.disabled=lv>=5||lockS||S.cr<cost;b.onclick=()=>{const S2=season();if(S2.cr<cost||totStars()<needS)return;S2.cr-=cost;S2.up[u.k]=lv+1;saveSeason(S2);AU.sfx&&AU.sfx('pick');buildSeason()};d.appendChild(b);body.appendChild(d)})}
  else{const rv=rivals();body.innerHTML='<table>'+PDL.slice().reverse().map(p=>`<tr><td><img class="av" src="${avatar(p.n)}" alt="">${p.flag} ${p.full}${p.n===nm?' <span class="nem">NEMESIS</span>':''}</td><td>${(TEAMS.find(t=>t.id===p.team)||{}).name}</td><td>${STYLE_NAME[p.style]}</td><td class="n">${'★'.repeat(Math.round(1+p.r*4))}</td><td class="n">${rv[p.n]?'⚔ '+rv[p.n]:''}</td></tr>`).join('')+'</table>'}}
function buildMenu(){const pts=medalPts();
  document.querySelectorAll('#tabs button').forEach(b=>{b.setAttribute('aria-selected',b.dataset.t===menuTab);b.onclick=()=>{const was=menuTab;menuTab=b.dataset.t;store.set('mho_tab',menuTab);buildMenu();if(was!==menuTab)refreshAttract()}});
  const setup=['quick','tt','zone','arena','derby','junction'].includes(menuTab);$('#pCareer').hidden=menuTab!=='career';$('#pSeason').hidden=menuTab!=='season';if(menuTab==='season')buildSeason();$('#pWorld').hidden=menuTab!=='world';if(menuTab==='world')buildWorld();$('#pSetup').hidden=!setup;$('#pDaily').hidden=menuTab!=='daily';$('#pCup').hidden=menuTab!=='cup';if(menuTab==='cup')buildCup();
  const car=career();if(!unlocked(evIdx))evIdx=0;
  $('#events').innerHTML='';EVENTS.forEach((ev,i)=>{const b=document.createElement('button');b.className='ev';const m=car[ev.id]||0,lock=!unlocked(i);b.setAttribute('aria-pressed',i===evIdx);if(lock)b.setAttribute('aria-disabled','true');
    const md=MOODS.find(x=>x.id===ev.mood);b.innerHTML=`<span class="n">${pad2(i+1)}</span><b>${lock?'🔒 ':''}${ev.name}</b><em>${ev.sub}${md&&md.id!=='night'?' · '+md.name.toLowerCase():''}</em><span class="med" aria-label="${['no medal','bronze','silver','gold'][m]}"><i class="b ${m>=1?'on':''}"></i><i class="s ${m>=2?'on':''}"></i><i class="g ${m>=3?'on':''}"></i></span>`;
    b.onclick=()=>{if(lock)return;const ch=evIdx!==i;evIdx=i;store.set('mho_ev',i);buildMenu();if(ch)refreshAttract()};$('#events').appendChild(b)});
  const ev=EVENTS[evIdx];$('#evGoal').innerHTML=ev.goal;
  if(setup){$('#modeGoal').innerHTML=menuTab==='tt'?GOALS[ttFormat==='duel'?'ttduel':'ttlap']:GOALS[menuTab];
    const tw=$('#tracks');tw.innerHTML='';const ao=athOpen(),tcy=trkCity||(isAthT(menuTrack)?'ath':'fra');
    let ct=$('#trkCity');if(!ct){ct=document.createElement('div');ct.id='trkCity';ct.className='seg';tw.before(ct)}ct.innerHTML='';
    for(const[c,l]of[['fra','FRANKFURT'],['ath',(ao?'':'🔒 ')+'ATHENS']]){const b=document.createElement('button');b.textContent=l;b.dataset.c=c;b.setAttribute('aria-pressed',tcy===c);b.onclick=()=>{trkCity=c;if(c==='ath'&&ao&&!isAthT(menuTrack)){const id=store.get('mho_trk_ath','akro');menuTrack=isAthT(id)?id:'akro';menuMood=TRACK_DEFS.find(t=>t.id===menuTrack).mood;store.set('mho_trk',menuTrack);refreshAttract()}else if(c==='fra'&&isAthT(menuTrack)){menuTrack=store.get('mho_trk_fra','grand');if(!TDF.some(t=>t.id===menuTrack))menuTrack='grand';if(!MOODS.some(m=>m.id===menuMood))menuMood='night';store.set('mho_trk',menuTrack);refreshAttract()}buildMenu()};ct.appendChild(b)}
    for(const d of tcy==='ath'?ATH_TRACKS:TDF){const lock=tcy==='ath'&&!ao,b=document.createElement('button');b.className='trk';b.setAttribute('aria-pressed',d.id===menuTrack);b.disabled=lock;b.append(trackThumb(d));
      b.insertAdjacentHTML('beforeend',`<b>${lock?'🔒 ':''}${d.short}</b><em>${lock?'4 Frankfurt flags':d.km+' km · '+d.laps+' laps'}</em>`);b.title=lock?'Win 4 rival flags in Frankfurt to unlock Athens.':d.desc;b.onclick=()=>{if(lock||menuTrack===d.id)return;menuTrack=d.id;store.set('mho_trk',d.id);store.set(isAthT(d.id)?'mho_trk_ath':'mho_trk_fra',d.id);if(d.mood)menuMood=d.mood;buildMenu();refreshAttract()};tw.appendChild(b)}
    let dsc=$('#trkDesc');if(!dsc){dsc=document.createElement('div');dsc.id='trkDesc';tw.after(dsc)}dsc.textContent=TRACK_DEFS.find(t=>t.id===menuTrack).desc}
  if(menuTab==='daily'){const c=dailyCfg(),L=dailyLabel(c),prev=store.get('mho_daily_'+c.daily,null),days=Object.keys(localStorage).filter(k=>k.startsWith('mho_daily_')).length;
    $('#dailyCard').innerHTML=`<h4>Daily challenge · ${c.daily.split('-').reverse().join('.')}</h4>Everyone gets the same set-up today. A new one arrives at midnight.<div class="tagrow"><span>${L.t.short}</span><span>${L.m.name}</span><span>${L.mode}</span><span>${CLASSES.find(x=>x.id===c.cls).name}</span>${c.dir==='rev'?'<span>Reverse</span>':''}${c.mirror?'<span>Mirror</span>':''}${c.traffic?`<span>Traffic ${c.traffic}</span>`:''}</div>${prev?`Your best today: <b>${prev.txt}</b>`:'Not played yet today.'} · Days played: <b>${days}</b>`}
  const tw=$('#teams');tw.innerHTML='';if(teamLocked(TEAMS[teamIdx]))teamIdx=0;
  TEAMS.forEach((t,i)=>{const b=document.createElement('button');b.className='team';b.style.setProperty('--c2',t.c2);b.setAttribute('aria-pressed',i===teamIdx);const lock=teamLocked(t);if(lock)b.setAttribute('aria-disabled','true');
    const bar=(l,v)=>`<span>${l}</span><i><u style="width:${clamp((v-.8)/.5,0.08,1)*100}%"></u></i>`;
    b.innerHTML=`<b>${t.name}</b><div class="st">${bar('SPD',t.top)}${bar('THR',t.acc)}${bar('HDL',t.han)}${bar('HUL',t.hull)}</div>${lock?`<span class="lock">🔒 ${t.unlock} MEDAL PTS</span>`:''}`;b.prepend(teamCard(t));b.onclick=()=>{if(!lock)selTeam(i)};tw.appendChild(b)});
  const seg=(id,opts,get,set,show=true)=>{const el=$(id);el.hidden=!show;el.querySelectorAll('button').forEach(b=>b.remove());opts.forEach(([v,l])=>{const b=document.createElement('button');b.textContent=l;b.setAttribute('aria-pressed',get()===v);b.onclick=()=>{set(v);buildMenu()};el.appendChild(b)})};
  const cSet=v=>{userCls=CLASSES.find(c=>c.id===v);store.set('mho_cls',v)},dSet=v=>{userDir=v;store.set('mho_dir',v)};
  seg('#segMood',(CID!=='ath'&&isAthT(menuTrack)?[...MOODS,...ATHM]:MOODS).map(m=>[m.id,m.name]),()=>menuMood,v=>{menuMood=v;store.set('mho_mood',v);applyMood(v)});
  seg('#segClass',CLASSES.filter(c=>!c.hide||season().max>=(c.id==='master'?3:4)).map(c=>[c.id,c.name]),()=>userCls.id,cSet,menuTab!=='zone');
  seg('#segDir',[['fwd','Normal'],['rev','Reverse']],()=>userDir,dSet);seg('#segMirror',[[false,'Off'],[true,'On']],()=>menuMirror,v=>{menuMirror=v;store.set('mho_mir',v)});
  seg('#segTraffic',[[true,'On'],[false,'Off']],()=>quickTraffic,v=>{quickTraffic=v;store.set('mho_traf',v)},menuTab!=='tt');
  seg('#segTT',[['lap','Best lap'],['duel','Ghost duel · 3 laps']],()=>ttFormat,v=>{ttFormat=v;store.set('mho_ttf',v)},menuTab==='tt');
  $('#startBtn').textContent={cup:(()=>{const s=cupState();return s&&s.id===cupSel.id&&s.c===cupSel.c&&s.r>0?`CONTINUE CUP · RACE ${s.r+1}/4`:'START CUP'})(),career:`START · ${ev.name}`,tt:ttFormat==='duel'?'START GHOST DUEL':'START TIME TRIAL',zone:'START ZONE RUN',arena:'ENTER THE ARENA',daily:'START DAILY'}[menuTab]||'START RACE';showRec()}
// ---------- Cup Series: four races, points table, trophy, stars per class
const CUPS=[{id:'main',name:'Mainhattan Cup',ic:'🏆',races:[{t:'grand',m:'night'},{t:'hafen',m:'dawn'},{t:'fraport',m:'night'},{t:'sky',m:'golden'}],roster:['ROSSI','WEBER','VOSS','KAYA','ADLER','LINDQVIST','MOREAU']},
 {id:'storm',name:'Storm Cup',ic:'⛈',races:[{t:'hafen',m:'storm'},{t:'grand',m:'fog',d:'rev'},{t:'sky',m:'storm'},{t:'fraport',m:'fog',d:'rev'}],roster:['OKAFOR','FERREIRA','BRANDT','KAYA','VOSS','ÇELIK','ADLER']},
 {id:'hills',name:'Hill Cup',ic:'⛰',races:[{t:'nord',m:'golden'},{t:'sachs',m:'dawn'},{t:'nord',m:'night',d:'rev'},{t:'sachs',m:'storm',mir:1}],roster:['WEBER','LINDQVIST','OKAFOR','ADLER','KAYA','MOREAU','BRANDT'],need:3},
 {id:'mirror',name:'Mirror Cup',ic:'🪞',races:[{t:'sky',m:'night',mir:1},{t:'fraport',m:'day',mir:1},{t:'grand',m:'dawn',mir:1},{t:'hafen',m:'night',mir:1}],roster:['MOREAU','NAKAMURA','LINDQVIST','WEBER','ROSSI','BRANDT','FERREIRA'],need:6},
 {id:'kaiser',name:'Kaiser Cup',ic:'👑',races:[{t:'grand',m:'storm',d:'rev'},{t:'sky',m:'night',mir:1},{t:'hafen',m:'golden',d:'rev'},{t:'fraport',m:'storm',mir:1}],roster:['NAKAMURA','BRANDT','ÇELIK','FERREIRA','OKAFOR','MOREAU','ROSSI'],need:15}];
CUPS.push({id:'akro',name:'Akropolis Cup',ic:'🏛',ath:1,races:[{t:'akro',m:'athgold'},{t:'synt',m:'athnoon'},{t:'kifi',m:'athnight'},{t:'pana',m:'athdusk'}],roster:['PAPPAS','LAMBROU','KOSTA','VLACHOS','ANTONIOU','GALANI','DRAKOS']});
const CUP_CLS=[['rookie','C',1000],['pro','B',1500],['elite','A',2200]];
const totStars=()=>Object.values(store.get('mho_stars',{})).reduce((a,b)=>a+b,0);
let cupSel=store.get('mho_cupsel',{id:'main',c:0});{const cs0=store.get('mho_cupst',null);if(CID==='ath'&&!(cs0&&cs0.id===cupSel.id&&cs0.r>0))cupSel={id:'akro',c:cupSel.c||0};if(cupSel.id==='akro'&&!athOpen())cupSel={id:'main',c:cupSel.c||0}}
const cupState=()=>store.get('mho_cupst',null),cupSave=v=>store.set('mho_cupst',v);
function cupCfg(){let st=cupState();const C=CUPS.find(c=>c.id===cupSel.id);if(!st||st.id!==C.id||st.c!==cupSel.c){st={id:C.id,c:cupSel.c,r:0,pts:{}};cupSave(st)}const rd=C.races[st.r],td=TRACK_DEFS.find(t=>t.id===rd.t);
  cls=CLASSES.find(c=>c.id===CUP_CLS[st.c][0]);dir=rd.d||'fwd';return{type:'race',laps:Math.max(2,td.laps-1),traffic:quickTraffic?14:0,items:true,aggr:.12+.1*st.c,track:rd.t,mood:rd.m,mirror:!!rd.mir,cup:true,cupR:st.r,roster:C.roster}}
function buildCup(){const st=cupState(),best=store.get('mho_cups',{}),ts=totStars();
  $('#cupHead').innerHTML=`<b>Cup Series</b> · four races, points after each (25-18-15-12-10-8-6-4). Top 3 overall win a trophy: 🥇 ★★★ · 🥈 ★★ · 🥉 ★. Higher class = more studs per ★. Your stars: <b>${ts} ★</b>`;
  const L=$('#cupList');L.innerHTML='';for(const C of CID==='ath'?[...CUPS.filter(c=>c.ath),...CUPS.filter(c=>!c.ath)]:CUPS.filter(c=>!c.ath||athOpen())){const lock=C.need&&ts<C.need,b=document.createElement('button');b.className='cupC'+(cupSel.id===C.id?' on':'');b.disabled=!!lock;
    const tr=CUP_CLS.map((k,i)=>{const s=best[C.id+':'+i]||0;return`<span title="class ${k[1]}">${k[1]} ${s?['','🥉','🥈','🥇'][s]:'—'}</span>`}).join('');
    b.innerHTML=`<i>${lock?'🔒':C.ic}</i><b>${C.name}</b><small>${lock?`needs ${C.need} ★`:C.races.map(r=>TRACK_DEFS.find(t=>t.id===r.t).short+(r.d==='rev'?' ↺':'')+(r.mir?' ⇋':'')).join(' · ')}</small><em>${tr}</em>`;b.onclick=()=>{cupSel.id=C.id;store.set('mho_cupsel',cupSel);buildMenu()};L.appendChild(b)}
  const sg=$('#segCupCls');sg.innerHTML='<span>Class</span>';CUP_CLS.forEach(([id,n,pay],i)=>{const b=document.createElement('button');b.textContent=`${n} · ${pay}/★`;b.setAttribute('aria-pressed',cupSel.c===i);b.onclick=()=>{cupSel.c=i;store.set('mho_cupsel',cupSel);buildMenu()};sg.appendChild(b)});
  const T=$('#cupTable');if(st&&st.id===cupSel.id&&st.c===cupSel.c&&st.r>0){const C=CUPS.find(c=>c.id===st.id),rows=['YOU',...C.roster].map(k=>({k,p:st.pts[k]||0})).sort((a,b)=>b.p-a.p);
    T.innerHTML=`<div class="goal">In progress · race ${st.r+1}/4 next: <b>${TRACK_DEFS.find(t=>t.id===C.races[st.r].t).short}</b> <button class="go alt" id="cupQuit" style="padding:3px 8px;font-size:11px;margin-left:6px">ABANDON</button></div><table class="cupT">${rows.map((r,i)=>`<tr class="${r.k==='YOU'?'me':''}"><td>${i+1}</td><td>${r.k==='YOU'?'YOU':PD[r.k].full}</td><td class="n">${r.p}</td></tr>`).join('')}</table>`;$('#cupQuit').onclick=()=>{cupSave(null);buildMenu()}}else T.innerHTML=''}
function cupResults(order){const st=cupState();if(!st)return;const C=CUPS.find(c=>c.id===st.id);const gain={};order.forEach((s,i)=>{const k=s.isPlayer?'YOU':s.pid;if(!k)return;gain[k]=SPTS[i]||0;st.pts[k]=(st.pts[k]||0)+gain[k]});
  const rows=['YOU',...C.roster].map(k=>({k,p:st.pts[k]||0})).sort((a,b)=>b.p-a.p),pos=rows.findIndex(r=>r.k==='YOU')+1,last=st.r>=3;
  $('#resEy').textContent=`${C.name} · class ${CUP_CLS[st.c][1]} · race ${st.r+1}/4`;
  $('#resTable').innerHTML='<tr><th>Pos</th><th>Pilot</th><th class="n">+Pts</th><th class="n">Total</th></tr>'+rows.map((r,i)=>`<tr class="${r.k==='YOU'?'me':''}"><td>${i+1}</td><td>${r.k==='YOU'?'YOU':PD[r.k].full}</td><td class="n">+${gain[r.k]||0}</td><td class="n">${r.p}</td></tr>`).join('');
  if(!last){st.r++;cupSave(st);$('#resNote').textContent=`Cup standings: ${ord(pos)} after ${st.r} of 4 races.`;$('#nextBtn').textContent=`NEXT RACE · ${st.r+1}/4`;$('#nextBtn').hidden=false;return}
  cupSave(null);const stars=pos===1?3:pos===2?2:pos===3?1:0,key=C.id+':'+st.c,best=store.get('mho_cups',{});if(stars>(best[key]||0)){best[key]=stars;store.set('mho_cups',best)}
  const all=store.get('mho_stars',{}),sk='cup:'+key,b0=all[sk]||0,pay=CUP_CLS[st.c][2],fresh=Math.max(0,stars-b0),cr=Math.round(pay*fresh+pay*.3*Math.min(stars,b0)),xp=100*stars,gift=stars===3&&b0<3?rewardItem():'';logDone(sk,C.name+' · '+CUP_CLS[st.c][1],'cup',stars);if(stars>b0){all[sk]=stars;store.set('mho_stars',all)}if(cr){const S=season();S.cr+=cr;saveSeason(S)}if(xp)addXP(xp);
  $('#resTitle').textContent=stars?['','🥉 BRONZE CUP','🥈 SILVER CUP','🥇 CUP WINNER'][stars]:ord(pos)+' IN THE CUP';const el=$('#resStars');el.hidden=false;el.innerHTML=`<span class="st">${'★'.repeat(stars)}<i>${'★'.repeat(3-stars)}</i></span><span>${C.name} · +<b>${cr.toLocaleString('de-DE')}</b> studs · +<b>${xp}</b> XP${fresh?` · ${fresh} new ★`:stars?' · replay (30%)':''}${gift?`<br>🎁 <b>NEW GARAGE PART: ${gift}</b>`:''}</span>`;
  $('#resNote').textContent=stars?`Trophy won in class ${CUP_CLS[st.c][1]}!`:'Top 3 overall wins a trophy. Upgrade and try again.';$('#nextBtn').hidden=true;if(stars===3)AU.sfx('finish')}
function selTeam(i){teamIdx=i;store.set('mho_team',i);[...$('#teams').children].forEach((b,j)=>b.setAttribute('aria-pressed',j===i))}
function showRec(){const tg=menuTrack==='grand'&&!menuMirror?'':menuTrack+(menuMirror?'M':'')+'_',mm=menuMirror?'M':'';let txt='';
  if(menuTab==='zone'){const z=store.get(`mho_zone_${menuTrack}${mm}`,null);txt=z?`Best · zone <b>${z.zone}</b> · <b>${z.km.toFixed(2)} km</b>`:''}
  else if(menuTab==='season'){const S=season();txt=`Credits <b>${S.cr.toLocaleString('de-DE')}</b> · ${S.champ.length} seasons raced`}
  else if(menuTab==='arena'||menuTab==='derby'){const a=store.get(`mho_${menuTab}_${menuTrack}`,null);txt=a?`Best · <b>${ord(a)}</b>`:''}
  else if(menuTab==='junction'){const a=store.get(`mho_jn_${menuTrack}`,null);txt=a?`Best · <b>${eur(a)}</b>`:''}
  else if(menuTab==='tt'&&ttFormat==='duel'){const g=store.get(`mho_duel_${menuTrack}${mm}_${userCls.id}_${userDir}`,null);txt=g?`Ghost · <b>${fmt2(g.t)}</b>`:'No ghost yet'}
  else if(menuTab!=='daily'){const key=menuTab==='career'?`mho_rec_${EVENTS[evIdx].id}`:`mho_rec_${tg}${userCls.id}_${userDir}_${menuTab==='tt'?'tt':'race'}`;const r=store.get(key,{});txt=r.race||r.lap?`Best${r.race?` · race <b>${fmt2(r.race)}</b>`:''}${r.lap?` · lap <b>${fmt2(r.lap)}</b>`:''}`:''}
  $('#rec').innerHTML=(txt?txt+' · ':'')+`Medal points <b>${medalPts()}</b>`}
function toMenu(){if(['world','season','career'].includes(menuTab))menuTab='quick';if(pl)AU.engine(pl,0,false);AU.scrape(false);state='menu';paused=false;$('#results').hidden=true;$('#pause').hidden=true;$('#hud').hidden=true;$('#touch').hidden=true;$('#menu').hidden=false;
  cls=CLASSES[1];dir='fwd';state='menu';buildMenu();refreshAttract();$('#startBtn').focus({preventScroll:true});document.body.classList.remove('racing')}
const SPR_TRACK={sp_zeil:'grand',sp_kai:'hafen',sp_bridge:'sachs',sp_wald:'nord',sp_slalom:'sky',sp_tour:'fraport'};
function startRace(){if(!RO.launching)RO.sprId=null;$('#tF').textContent='FIRE';if(teamLocked(TEAMS[teamIdx]))teamIdx=0;PK=perkSet();RO.fromRoam=false;AU.init();$('#menu').hidden=true;$('#results').hidden=true;$('#pause').hidden=true;$('#hud').hidden=false;$('#touch').hidden=!TOUCH.on;paused=false;pressed={};TOUCH.sid=null;TOUCH.steer=0;SZ.classList.remove('on');requestAnimationFrame(steerHome);
  let cfg;if(menuTab==='world'){const ev=worldPick||(CID==='ath'?ATH_TRK_EV[0]:RIVAL_EV[0]),dc=drvClass();cls=CLASSES.find(c=>c.id===(ev===BOSS_EV||ev.boss?'elite':dc==='A'?'elite':dc==='B'?'pro':'rookie'));dir='fwd';cfg=worldCfg(ev);if(dc==='A')cfg.aggr+=.2}
  else if(menuTab==='season'){const S=season(),rd=seasonRound(S.L,S.r);cls=CLASSES.find(c=>c.id===LEAGUES[S.L].cls);dir='fwd';cfg={type:rd.type,laps:rd.laps,traffic:rd.traffic,items:rd.items,aggr:rd.aggr,season:true,round:rd,track:rd.track,mood:rd.mood}}
  else if(menuTab==='career'){const ev=EVENTS[evIdx];cls=CLASSES.find(c=>c.id===ev.cls);dir='fwd';cfg={type:ev.type,laps:ev.laps,traffic:ev.traffic,items:ev.items,aggr:ev.aggr,ev,track:ev.track||'grand',mood:ev.mood}}
  else if(menuTab==='cup'){cfg=cupCfg()}
  else if(menuTab==='daily'){cfg=dailyCfg();cls=CLASSES.find(c=>c.id===cfg.cls);dir=cfg.dir}
  else{cls=menuTab==='zone'?CLASSES[0]:userCls;dir=userDir;const tk=TRACK_DEFS.find(t=>t.id===menuTrack);
    cfg=menuTab==='tt'?(ttFormat==='duel'?{type:'duel',laps:3,traffic:0,items:false,aggr:0}:{type:'tt',laps:99,traffic:0,items:false,aggr:0})
      :menuTab==='zone'?{type:'zone',laps:9999,traffic:quickTraffic?18:0,items:false,aggr:0}
      :menuTab==='arena'?{type:'arena',laps:9999,traffic:quickTraffic?8:0,items:true,aggr:.2}
      :menuTab==='derby'?{type:'arena',derby:true,laps:9999,traffic:0,items:false,aggr:.75}
      :menuTab==='junction'?{type:'junction',laps:9999,traffic:46,items:false,aggr:0}
      :{type:'race',laps:tk.laps,traffic:quickTraffic?20:0,items:true,aggr:.15};cfg.track=menuTrack;cfg.mirror=menuMirror;cfg.mood=menuMood}
  setupRace(cfg);if(pl&&PK.has('crown')){pl.stats.top*=1.03;pl.stats.top0*=1.03}if(pl&&PK.has('start')&&cfg.items)pl.item=pickItem(pl);prevPlace=0;radioCd=0;if(RC.world){const r=ships.find(s=>s.pid===RC.world.p);say(RC.boss?(RC.world.p==='DRAKOS'?'AKROPOLIS CUP FINAL':'GRAND ARENA'):'RIVAL RACE',PD[RC.world.p].full.toUpperCase()+' · '+(RC.boss?'BOSS':SIG[RC.world.sig].toUpperCase()),2.2);if(r){const ln=RC.world.line;setTimeout(()=>{if(state==='race'||state==='countdown')radioLine(r,ln)},2500)}}if(RC.season){const S=season();say(RC.round.name.toUpperCase(),LEAGUES[S.L].name.toUpperCase()+' · ROUND '+(S.r+1)+'/5'+(RC.round.dbl?' · DOUBLE POINTS':''),2.2)}const nm=ships.find(s=>s.nem);if(nm)setTimeout(()=>{if(state==='countdown'||state==='race')radio(nm,'intro')},2600);if(RC.season){}else if(RC.ev)say(RC.ev.name.toUpperCase(),RC.ev.sub.toUpperCase(),2.2);else if(RC.type==='duel'&&!duelGhost)say('GHOST DUEL','NO GHOST YET · SET THE PACE',2.2);else say(RC.daily?'DAILY':'',RC.daily?setLabel().toUpperCase():'',RC.daily?2.2:0);document.body.classList.add('racing')}
$('#startBtn').onclick=startRace;

const PERF={js:0};let last=performance.now(),acc=0,T=0;
function frame(now){requestAnimationFrame(frame);if(LD.on)return;if(ENVD)buildEnv();const pf0=performance.now(),fms=now-last;let dt=Math.min(.05,fms/1000);last=now;dresStep(fms);if(paused)dt=0;T+=dt;
  ccCool=Math.max(0,ccCool-dt);if(CC){CC.t+=dt;dt*=.2;if(CC.t>=CC.dur||state!=='race')endCrashCam()}else if(slowmo>0){slowmo-=dt;dt*=.35}
  if(state==='countdown'){cdT-=dt;const lit=clamp(Math.floor((4.2-cdT)/.8),0,5);startLights.forEach((l,i)=>l.material.color.set(cdT<=0?glowCol('#2dff7a',2.5):i<lit?glowCol('#ff2030',2.5):new THREE.Color(0x220a0e)));
    if(lastLit!==lit&&lit>=1&&lit<=4&&cdT>0){AU.sfx('beep');say(String(5-lit),'',.6)}lastLit=lit;
    if(cdT<=0){state='race';AU.sfx('go');const held=CTL.thr>0||K.ArrowUp||K.KeyW;
      tiltZero();if((held&&thrPressT!=null&&thrPressT<1.1&&thrPressT>.1)||(TOUCH.used)){pl.v=pl.stats.top*.33;pl.bm=Math.min(100,pl.bm+30);say('GO','PERFECT START',1.1);feed('PERFECT START',300,'#5dffb0');pl.style+=300;fovKick=10}
      else if(held&&thrPressT!=null&&thrPressT>=1.9){pl.stall=.7;say('GO','TOO EARLY · ENGINE STALL',1.1)}else say('GO','',.8)}}
  if(state==='race'||state==='menu'||state==='finished'){acc+=dt;let n=0;while(acc>=H&&n<12){stepSim();raceT+=H;acc-=H;n++;
      if(pl&&lapAttack()&&state==='race'){const lt=raceT-pl.lapStart;if(Math.floor(lt*20)*2>=ghostRec.length&&pl.lap>=0)ghostRec.push(mod(pl.dist,TD.L),pl.x)}}
    if(n===12)acc=0;lapLogic();if(state==='menu')for(const s of ships)s.finished=false}
  else if(state==='countdown')CTL=ctlPlayer();
  if(state==='finished'){finishT+=dt;if(finishT>4.5)showResults()}
  if(state==='roam'){if(!RO.frozen){roamStep(dt);studSync()}else if(pl){AU.engine(pl,0,false);AU.scrape(false)}roamCam(dt)}else{for(const s of ships)posShip(s,dt);updateCam(dt)}drawTraffic(dt);updWorld(dt,T);updPool(SPARK,dt,20);updPool(FIRE,dt,-2);updPool(SMOKE,dt,-1.5);updPool(FIREB,dt,-3);updDebris(dt);waterTick(dt);updStreaks();updPool(WATER,dt,24);updPool(GLOWP,0);shake=Math.max(0,shake-dt*3);
  if(msgTimer>0){msgTimer-=dt;if(msgTimer<=0){$('#msg').style.opacity=0;$('#sub').style.opacity=0}}
  if(pl&&(state==='race'||state==='countdown'||state==='finished')){updHud();AU.engine(pl,CTL.thr,!paused&&!pl.dead&&!pl.eliminated);AU.scrape(pl.wall>0&&!paused);if(pl.wrong>1&&state==='race'&&msgTimer<=0)say('','WRONG WAY',.5)}
  PERF.js=lerp(PERF.js,performance.now()-pf0,.1);if(!(CM.on&&CM.light))composer.render();
  if(SET.perf){PERF.fps=lerp(PERF.fps||60,1000/Math.max(1,now-(PERF.last||now-16)),.05);PERF.last=now;if((PERF.tick=(PERF.tick||0)+1)%20===0){const el=$('#fps');el.hidden=false;el.textContent=`${Math.round(PERF.fps)} fps · ${innerWidth}×${innerHeight} @${renderer.getPixelRatio().toFixed(2)}x · ${renderer.info.render.calls} draws · ${SET.q}`}}else if(PERF.tick){$('#fps').hidden=true;PERF.tick=0}}

/* ---------- loading screen: first free-roam entry builds Frankfurt in time slices with a real progress bar */
const LD={on:false,busy:null,ti:0,k:0};const nextFrame=()=>new Promise(r=>requestAnimationFrame(()=>r()));
const LDTIPS=CID==='ath'?['Eleni’s garage in Psyrri repairs your car, and your flight home leaves right beside it.','Ermou is a marble pedestrian street: no traffic, all style.','Vasilissis Sofias runs straight out to Ambelokipi: flat out!','Tap the map or a logbook entry to set a route.','Hold DRIFT and steer to slide, release for a mini-turbo.','Studs, XP, cars and garage parts flew with you from Frankfurt.']:['Weave past commuters for near misses: they fill the boost bar.','Hold DRIFT and steer to slide, release for a mini-turbo.','Smash traffic while boosting to shove it out of the way.','Garages fix your car and are fast-travel points on the map.','Tap the map or a logbook entry to set a route.','Long, unbroken drifts score the most points.','Ramps and jumps give air time: keep your speed up.','Collect studs around the city to unlock new parts.','Beat rivals in each district to unlock the boss.','Bumped too hard? HOP over obstacles and kerbs.'];
function ldTip(){const w=$('#ldTipW');w.style.opacity=0;setTimeout(()=>{$('#ldTip').textContent=LDTIPS[LD.k++%LDTIPS.length];w.style.opacity=1},180)}
function ldSet(f,t){const p=Math.round(clamp(f,0,1)*100);$('#ldBar').style.width=p+'%';$('#ldPct').textContent=p+'%';if(t)$('#ldStep').textContent=t;if(LD.fly){const q=LD.fly.arr?15+p*.85:p*.15,i=$('#ldFly i');if(i)i.style.left=q.toFixed(1)+'%';$('#ldFt').textContent=q<20?'Boarding · '+CITYCFG[LD.fly.to==='ath'?'fra':'ath'].flight:q<70?'Over the Alps':'Approaching '+(LD.fly.to==='ath'?'Athens':'Fraport')}}
function ldShow(t){const el=$('#ld2');LD.on=true;el.hidden=false;el.classList.remove('out');LD.k=Math.floor(Math.random()*LDTIPS.length);$('#ldTip').textContent=LDTIPS[LD.k++%LDTIPS.length];$('#ldTipW').style.opacity=1;{const F=$('#ldFly');if(F){F.hidden=!LD.fly;if(LD.fly){$('#ldFa').textContent=LD.fly.a;$('#ldFb').textContent=LD.fly.b}}}ldSet(0,t);clearInterval(LD.ti);LD.ti=setInterval(ldTip,2800)}
function ldHide(){clearInterval(LD.ti);LD.on=false;LD.fly=null;const el=$('#ld2');el.classList.add('out');setTimeout(()=>{if(!LD.on&&el.classList.contains('out'))el.hidden=true},260)}
// link all programs the hub scene needs before the first drive (KHR_parallel_shader_compile polls without blocking; otherwise one program per slice)
async function ldPrewarm(a,b){if(ENVD)buildEnv();await nextFrame();try{renderer.compile(scene,camera)}catch(e){return}const P=renderer.info.programs.slice();let t=performance.now(),i=0;
  for(const p of P){let w=0;while(!p.isReady()&&w++<120){await nextFrame();t=performance.now()}try{p.getUniforms()}catch(e){}i++;if(performance.now()-t>12){ldSet(a+(b-a)*i/P.length);await nextFrame();t=performance.now()}}}
const SM3={n:0,mb:0,ms:0,on:CID==='ath'&&(()=>{try{return localStorage.getItem('mho_sm3')!=='0'}catch(e){return true}})()};
const SMM={T:250,N:13,q:[],have:new Set(),st:{tiles:0,max:0,ms:0,shift:0}};
function SMM_grids(){if(SMM.bg)return;const K=(x,z)=>Math.floor(x/250)*100000+Math.floor(z/250),G=new Map(),S=new Map();
  for(const b of HUB.bld){const k=K(b.x,b.z);let L=G.get(k);if(!L)G.set(k,L=[]);L.push(b)}
  for(const s of CITY_S){const ks=new Set();for(const p of s.pts)ks.add(K(p.x,p.z));for(const k of ks){let L=S.get(k);if(!L)S.set(k,L=[]);L.push(s)}}SMM.bg=G;SMM.sg=S}
function SMM_tile(tx,tz){const T=SMM.T,x0=tx*T,x1=x0+T,z0=tz*T,z1=z0+T,m=60,B=[],Ss=new Set();
  for(let a=Math.floor((x0-m)/250);a<=Math.floor((x1+m)/250);a++)for(let c=Math.floor((z0-m)/250);c<=Math.floor((z1+m)/250);c++){const k=a*100000+c,L=SMM.bg.get(k),Q=SMM.sg.get(k);if(L)for(const b of L)B.push(b);if(Q)for(const s of Q)Ss.add(s)}
  for(const L of LAZY){const r=L.rect;if(r[1]<x0-m||r[0]>x1+m||r[3]<z0-m||r[2]>z1+m)continue;for(const b of L.bld)if(b.x>x0-m&&b.x<x1+m&&b.z>z0-m&&b.z<z1+m)B.push(b)}
  const sb=HUB.bld,sl=LAZY.splice(0),ss=CITY_S.splice(0,CITY_S.length,...Ss),sh=TR_shade;HUB.bld=B;TR_shade=SMM_shade;let t;
  try{t=miniPaint(x0,x1,z0,z1,SMM.k)}finally{HUB.bld=sb;LAZY.push(...sl);CITY_S.splice(0,CITY_S.length,...ss);TR_shade=sh}
  // canvas pixel of world (x,z) = ((MINI.x1-x)*k, (MINI.z1-z)*k)
  MINI.c.getContext('2d').drawImage(t.c,Math.round((MINI.x1-x1)*SMM.k),Math.round((MINI.z1-z1)*SMM.k));SMM.have.add(tx+'|'+tz);SMM.st.tiles++}
// tile relief: same hillshade as TR_shade, sampled from the terrain raster (TR_G) instead of the road-shelf ground (7k shelf queries per tile)
function SMM_shade(c,x1,z1,k){const W=c.width,H=c.height,st=4,sw=Math.ceil(W/st),sh=Math.ceil(H/st),[c2,g2]=cv(sw,sh),im=g2.createImageData(sw,sh),d=im.data,cs=st/k,L=[.55,.64,-.55],ll=Math.hypot(...L);
  for(let j=0;j<sh;j++)for(let i=0;i<sw;i++){const x=x1-(i+.5)*cs,z=z1-(j+.5)*cs,hx=(TR_G(x-cs,z)-TR_G(x+cs,z))/(2*cs),hz=(TR_G(x,z-cs)-TR_G(x,z+cs))/(2*cs),nl=Math.hypot(hx,1,hz),
      l=(-hx*L[0]+L[1]-hz*L[2])/(nl*ll)-L[1]/ll,o=(j*sw+i)*4;if(l<0){d[o]=d[o+1]=d[o+2]=30;d[o+3]=Math.min(95,-l*300)}else{d[o]=d[o+1]=d[o+2]=255;d[o+3]=Math.min(55,l*180)}}
  g2.putImageData(im,0,0);const g=c.getContext('2d');g.save();g.imageSmoothingEnabled=true;g.drawImage(c2,0,0,W,H);g.restore()}
function SMM_center(x,z){const T=SMM.T,h=SMM.N>>1,tx=Math.floor(x/T),tz=Math.floor(z/T),k=SMM.k,W=Math.round(SMM.N*T*k);
  const c=document.createElement('canvas');c.width=c.height=W;const g=c.getContext('2d');g.fillStyle=CCF.gnd;g.fillRect(0,0,W,W);
  const x1=(tx+h+1)*T,z1=(tz+h+1)*T;if(MINI&&MINI.smm){g.drawImage(MINI.c,Math.round((x1-MINI.x1)*k),Math.round((z1-MINI.z1)*k));SMM.st.shift++}
  const old=SMM.have;SMM.have=new Set();SMM.q=[];for(let a=tx-h;a<=tx+h;a++)for(let b=tz-h;b<=tz+h;b++){const key=a+'|'+b;if(old.has(key))SMM.have.add(key);else SMM.q.push([a,b])}
  SMM.q.sort((p,q)=>Math.hypot(p[0]-tx,p[1]-tz)-Math.hypot(q[0]-tx,q[1]-tz));SMM.ct=[tx,tz];MINI={c,k,x1,z1,w:null,smm:1};return MINI}
function SMM_tick(budget){if(!MINI||!MINI.smm)return;const tx=Math.floor(RO.x/SMM.T),tz=Math.floor(RO.z/SMM.T);if(Math.abs(tx-SMM.ct[0])>1||Math.abs(tz-SMM.ct[1])>1)SMM_center(RO.x,RO.z);
  const t0=performance.now();while(SMM.q.length){const[a,b]=SMM.q.shift();const t1=performance.now();SMM_tile(a,b);const d=performance.now()-t1;SMM.st.ms+=d;if(d>SMM.st.max)SMM.st.max=d;if(performance.now()-t0>(budget||4))break}}
miniBase=(f=>function(){if(!SM_ON)return f();SMM_grids();SMM.k=SET.q==='low'?.25:.34;MINI=null;SMM_center(RO.x,RO.z);return MINI})(miniBase);
miniDraw=(f=>function(){if(SM_ON&&MINI&&MINI.smm&&RO.on&&!(HUB.mf&1))SMM_tick(4);return f()})(miniDraw);
async function SM_qvLoad(a,b){const N=HUB.nodes;if(!N||!N.length||(QV.g&&QV.g.N===N))return;if(!QV.gi||QV.giN!==N){QV.gi=qvGraphGen(N);QV.giN=N}
  let t=performance.now();const t0=t;while(!(QV.g&&QV.g.N===N)){if(QV.gi.next().done)break;if(performance.now()-t>12){ldSet(a+(b-a)*Math.min(1,(performance.now()-t0)/6000),'Mapping every street');await nextFrame();t=performance.now()}}
  SM3.qvMs=Math.round(performance.now()-t0);try{if(HUB.built&&SM_ON){const t1=performance.now();SMM_grids();SM3.miniMs=Math.round(performance.now()-t1)}else if(!MINI&&HUB.built){const t1=performance.now();MINI=miniBase();SM3.miniMs=Math.round(performance.now()-t1)}}catch(e){console.error(e)}}
async function SM_upload(a,b){if(!SM3.on||!HUB.grp||SM3.done)return;SM3.done=1;const t0=performance.now(),use=new Map(),L=[];
  HUB.grp.traverse(o=>{if(o.isMesh&&o.geometry)use.set(o.geometry,(use.get(o.geometry)||0)+1)});
  HUB.grp.traverse(o=>{if(!o.isMesh||o.isInstancedMesh||o.isSkinnedMesh||o.userData.pw||!o.geometry||use.get(o.geometry)!==1)return;const g=o.geometry;
    if(g.morphAttributes&&Object.keys(g.morphAttributes).length)return;const P=g.attributes.position;if(!P||!P.array||P.isInterleavedBufferAttribute)return;L.push(g)});
  const sc=new THREE.Scene(),mt=new THREE.MeshBasicMaterial(),rt=new THREE.WebGLRenderTarget(1,1),prev=renderer.getRenderTarget(),rel=function(){SM3.mb+=this.array.byteLength;this.array=null};
  let t=performance.now(),i=0;
  try{while(i<L.length){const B=L.slice(i,i+120),dr=[];i+=B.length;
    for(const g of B){if(!g.boundingSphere)g.computeBoundingSphere();if(!g.boundingBox)g.computeBoundingBox();for(const k in g.attributes)g.attributes[k].onUpload(rel);if(g.index)g.index.onUpload(rel);
      dr.push(g.drawRange.count);g.drawRange.count=0;const m=new THREE.Mesh(g,mt);m.frustumCulled=false;sc.add(m)}
    renderer.setRenderTarget(rt);renderer.render(sc,camera);renderer.setRenderTarget(prev);
    B.forEach((g,k)=>{g.drawRange.count=dr[k]});sc.clear();SM3.n+=B.length;
    if(performance.now()-t>12){if(a!=null)ldSet(a+(b-a)*i/L.length,'Loading the city into the GPU');await nextFrame();t=performance.now()}}}
  finally{renderer.setRenderTarget(prev);rt.dispose();mt.dispose()}SM3.ms=Math.round(performance.now()-t0)}
async function roamLoad(atMark){const st=state;ldShow('Warming up the engine');try{await nextFrame();await nextFrame();state='loading';roamPre();setupRace(ROAMCFG);state='loading';ldSet(.06,CCF.raise);await nextFrame();
    let t=performance.now();for(const [f,lab] of buildHubG()){if(performance.now()-t>12){ldSet(.06+f*.6,lab);await nextFrame();t=performance.now()}else if(lab)$('#ldStep').textContent=lab}
    ldSet(.68,'Switching on the street lights');await nextFrame();hubEnter();ldSet(.74,'Placing rivals & events');await nextFrame();if(!RO.built)buildRoam();{const sv=roamSave(),fm=RO.arrive&&flightMark(),sp=atMark&&atMark.x!=null?[atMark.x,atMark.z]:fm?[fm.x,fm.z]:sv.pos&&sv.lay===LAYOUT_VER?[sv.pos.x,sv.pos.z]:null,need=sp?lzNeed(sp[0],sp[1]):[];if(need.length){ldSet(.76,LZT[need[0].id]||'Outskirts');await lzLoad(need,.76,.8)}}
    ldSet(.8,'Painting the sky');await nextFrame();await SM_qvLoad(.82,.86);await ldPrewarm(.86,.95);await SM_upload(.95,.99);ldSet(1,'Ready');await nextFrame();
    roamPost(atMark);try{composer.render()}catch(e){}}
  catch(e){console.error(e);if(state==='loading')state=st;throw e}finally{LD.busy=null;ldHide()}}
// far fast travel: short loader instead of the black flash
async function ldFlash(fn){ldShow('Fast travel');fn();LD.on=false;try{renderer.compile(scene,camera)}catch(e){}ldSet(.45,'Arriving');for(const f of[.7,.9,1]){await nextFrame();ldSet(f)}ldHide()}

/* ============================================================ boot */
let booted=false;
function boot(){MAT.roof=new THREE.MeshStandardMaterial({color:0x0c0e1e,roughness:.6,metalness:.4});buildAmbient();buildTrafficMeshes();loadTrack(menuTrack);
  SPARK=linePool(700);FIRE=pointPool(900,5);SMOKE=spritePool(520,false);FIREB=spritePool(320,true);buildDebris();buildPropMeshes();buildStreaks();GLOWP=pointPool(120,6);WATER=pointPool(400,3);
  toMenu();const done=()=>{booted=true;$('#loading').hidden=true;{const d=document.createElement('div');d.id='gfxNote';d.textContent='Graphics: '+TEXVAR.name;d.style.cssText='font:11px system-ui,sans-serif;opacity:.5;margin-top:10px;letter-spacing:.04em';$('.mpanel').appendChild(d)}$('#topBtns').hidden=false;$('#muteBtn').textContent=$('#pMute').textContent=AU.muted?'SOUND OFF':'SOUND ON';requestAnimationFrame(frame);if(BOOTF&&BOOTF.go==='roam'){if(BOOTF.arrive){RO.arrive=BOOTF.arrive;LD.fly={a:BOOTF.from==='ath'?'ATH':'FRA',b:CCF.code,to:CID,arr:1}}setTimeout(()=>{homeShow(false);enterRoam()},0)}};
  warmTextures(scene);const warm=[V3(0,0,-5),V3(0,-5,-5)];for(const w of warm){emitS(SMOKE,camera.position.clone().add(w),V3(),.05,new THREE.Color(0,0,0),1,1,0,true);emitS(FIREB,camera.position.clone().add(w),V3(),.05,new THREE.Color(0,0,0),1,1,0,false)}
  renderer.compile(scene,camera);setTimeout(done,0)}
setTimeout(boot,30);
// ---- Career map: neon Frankfurt hub screen (nodes for every career event; free roam is the optional Cruise node)
const CM={on:false,nodes:[],raf:0,t:0,P:null};
const TCOL={grand:'#ff2d95',hafen:'#22e4ff',fraport:'#ffd12c',sky:'#a070ff'};
const CMB=[-3450,1950,-1300,2000];
function cmCatalog(){const L=roamCatalog().filter(m=>m.kind!=='flight'&&m.kind!=='otg'&&m.kind!=='sprint'&&m.kind!=='quest'&&(m.kind!=='garage'||markKey(m)==='garage'));
  const at=(m)=>m.kind==='garage'?[-250,180]:m.kind==='cruise'?[-60,420]:m.kind==='boss'?[-700,-1150]:null;const per={};
  for(const m of L){const p=at(m);if(p){m.wx=p[0];m.wz=p[1];continue}const tr=m.kind==='season'||m.kind==='challenge'?'grand':(m.ev&&m.ev.track)||'grand';(per[tr]=per[tr]||[]).push(m)}
  for(const tr in per){const cp=TRACK_DEFS.find(t=>t.id===tr).cp,n=per[tr].length;per[tr].forEach((m,j)=>{const c=cp[Math.floor((j+.5)*cp.length/n)%cp.length];m.wx=c[0];m.wz=c[2];m.tr=tr})}
  return L}
function cmProj(){const el=$('#cmapC'),W=el.clientWidth,H=el.clientHeight,top=56,bot=16,pad=30,rot=H>W*1.1;const ww=CMB[1]-CMB[0],wh=CMB[3]-CMB[2];
  const aw=W-pad*2,ah=H-top-bot-pad,sc=rot?Math.min(aw/wh,ah/ww):Math.min(aw/ww,ah/wh),cx=W/2,cy=top+(H-top-bot)/2,mx=(CMB[0]+CMB[1])/2,mz=(CMB[2]+CMB[3])/2;
  CM.P=(x,z)=>rot?[cx-(z-mz)*sc,cy-(x-mx)*sc]:[cx+(x-mx)*sc,cy+(z-mz)*sc];CM.sc=sc;CM.W=W;CM.H=H}
function cmDraw(){const el=$('#cmapC'),d=DPR2(),W=el.clientWidth,H=el.clientHeight;if(el.width!==Math.round(W*d)||el.height!==Math.round(H*d)){el.width=Math.round(W*d);el.height=Math.round(H*d)}
  const g=el.getContext('2d');g.setTransform(d,0,0,d,0,0);const P=CM.P,t=CM.t;
  const bg=g.createRadialGradient(W/2,H/2,0,W/2,H/2,Math.max(W,H)*.7);bg.addColorStop(0,'#1a0c38');bg.addColorStop(1,'#05030f');g.fillStyle=bg;g.fillRect(0,0,W,H);
  g.strokeStyle='rgba(76,234,255,.07)';g.lineWidth=1;for(let x=-3400;x<=1900;x+=200){const a=P(x,CMB[2]),b=P(x,CMB[3]);g.beginPath();g.moveTo(...a);g.lineTo(...b);g.stroke()}for(let z=-1200;z<=2000;z+=200){const a=P(CMB[0],z),b=P(CMB[1],z);g.beginPath();g.moveTo(...a);g.lineTo(...b);g.stroke()}
  // the Main
  const r0=450,r1=750,q=[P(CMB[0],r0),P(CMB[1],r0),P(CMB[1],r1),P(CMB[0],r1)];g.fillStyle='rgba(20,90,180,.35)';g.beginPath();g.moveTo(...q[0]);for(const p of q)g.lineTo(...p);g.fill();
  g.save();g.shadowColor='#2f9bff';g.shadowBlur=12;g.strokeStyle='rgba(80,170,255,.8)';g.lineWidth=2;for(const z of[r0,r1]){g.beginPath();g.moveTo(...P(CMB[0],z));g.lineTo(...P(CMB[1],z));g.stroke()}g.restore();
  g.save();g.fillStyle='rgba(120,190,255,.55)';g.font='800 13px system-ui';g.textAlign='center';for(const x of[-2800,-900,1200]){const p=P(x,600);g.fillText('M A I N',p[0],p[1]+4)}g.restore();
  // districts
  const D={};for(const T of TDF)for(const c of T.cp){const n=String(c[3]).split(' · ')[0];(D[n]=D[n]||[]).push(c)}
  g.save();g.font='700 10px system-ui';g.textAlign='center';g.fillStyle='rgba(200,180,255,.38)';const used=[];for(const n in D){const a=D[n],x=a.reduce((s,c)=>s+c[0],0)/a.length,z=a.reduce((s,c)=>s+c[2],0)/a.length,p=P(x,z);if(used.some(u=>Math.hypot(u[0]-p[0],u[1]-p[1])<70))continue;used.push(p);g.fillText(n,p[0],p[1]-14)}g.restore();
  // circuits: glowing loops with a running light
  for(const T of TDF){const pts=T.cp.map(c=>P(c[0],c[2])),col=TCOL[T.id];g.save();g.lineJoin='round';g.shadowColor=col;g.shadowBlur=18;g.strokeStyle=col;g.globalAlpha=.35;g.lineWidth=9;g.beginPath();pts.forEach((p,i)=>i?g.lineTo(...p):g.moveTo(...p));g.closePath();g.stroke();
    g.globalAlpha=1;g.lineWidth=2.5;g.stroke();g.setLineDash([10,26]);g.lineDashOffset=-t*60;g.strokeStyle='#fff';g.lineWidth=2;g.shadowBlur=8;g.stroke();g.restore();
    const a=pts.reduce((m,p)=>p[1]<m[1]?p:m,pts[0]);g.save();g.font='900 12px system-ui';g.textAlign='center';g.fillStyle=col;g.shadowColor=col;g.shadowBlur=10;g.fillText(T.short.toUpperCase(),a[0],a[1]-30);g.restore()}
  // links from nodes to their anchor point
  g.save();g.strokeStyle='rgba(255,255,255,.18)';g.lineWidth=1;for(const m of CM.nodes){const a=P(m.wx,m.wz);g.beginPath();g.moveTo(...a);g.lineTo(m.sx,m.sy);g.stroke();g.fillStyle=m.col;g.beginPath();g.arc(a[0],a[1],2.5,0,7);g.fill()}g.restore()}
function cmLoop(){if(!CM.on)return;CM.t+=1/60;cmDraw();CM.raf=requestAnimationFrame(cmLoop)}
function cmLayout(){cmProj();const R=Math.max(17,Math.min(25,Math.min(CM.W,CM.H*1.8)/40)),N=CM.nodes;for(const m of N){[m.sx,m.sy]=CM.P(m.wx,m.wz);m.ax=m.sx;m.ay=m.sy}
  for(let it=0;it<140;it++){for(let i=0;i<N.length;i++)for(let j=i+1;j<N.length;j++){const a=N[i],b=N[j];let dx=b.sx-a.sx,dy=b.sy-a.sy,d=Math.hypot(dx,dy)||.01;const mn=R*((a.lk&&b.lk)?1.6:2.3);if(d<mn){const k=(mn-d)/2/d;a.sx-=dx*k;a.sy-=dy*k;b.sx+=dx*k;b.sy+=dy*k}}
    for(const m of N){m.sx+=(m.ax-m.sx)*.02;m.sy+=(m.ay-m.sy)*.02;m.sx=clamp(m.sx,R+4,CM.W-R-4);m.sy=clamp(m.sy,62+R,CM.H-R-14)}}
  for(const m of N){m.el.style.left=m.sx+'px';m.el.style.top=m.sy+'px';m.el.style.setProperty('--r',R+'px')}}
function cmBuild(){const box=$('#cmapN');box.innerHTML='';CM.nodes=cmCatalog().filter(m=>!markLocked(m));const F=flags(),next=CM.nodes.find(m=>m.kind==='rival'&&!markLocked(m)&&!markDone(m))||(roamBossOpen()&&!F.SKYCUP?CM.nodes.find(m=>m.kind==='boss'):null);
  for(const m of CM.nodes){const b=document.createElement('button'),lock=markLocked(m),done=markDone(m);m.lk=lock;b.className='cmn'+(lock?' lock':'')+(done?' done':'')+(m===next?' next':'')+(m.kind==='boss'?' boss':'');b.style.setProperty('--c',m.col);
    const ic=(m.kind==='rival'||m.kind==='boss')?`<img src="${avatar(m.ev.p)}" alt="">`:`<i>${m.icon}</i>`;b.innerHTML=`${ic}<span>${m.kind==='rival'||m.kind==='boss'?PD[m.ev.p].full.split(' ').pop():markTitle(m)}</span>${lock?'<em>🔒</em>':done?'<em>✔</em>':''}${m===next?'<u>NEXT</u>':''}`;
    b.onclick=()=>{if(RO.story)return;roamOpen(m)};m.el=b;box.appendChild(b)}
  const pr=prof(),l=lvlOf(pr.xp||0),nf=RIVAL_EV.filter(e=>F[e.p]).length,ch=chapter();
  $('#cmapTop').innerHTML=`<b>MAINHATTAN CAREER</b><span>CHAPTER ${ch} · ${CHAPTERS[ch-1].title.toUpperCase()}</span><span>LV ${l} · CLASS ${drvClass(l)}</span><span>🚩 ${nf}/8</span><span>${season().cr.toLocaleString('de-DE')} cr</span>`;cmLayout()}
function openCareerMap(){if(CID!=='fra'){if(state==='roam'&&RO.on)toggleMap(true);else enterRoam();return}CM.fromRoam=RO.on;$('#cmMenu').textContent=CM.fromRoam?'◀ DRIVE':'◀ MENU';if(RO.on){if(RO.sp)sprintEnd();if(!(pl&&pl.air))roamSavePos();RO.on=false;chAbort();clearTimeout(chEnd.q)}$('#roam').hidden=true;if(CM.fromRoam){CM.light=1;RO.frozen=true;if(pl){AU.engine(pl,0,false);AU.scrape(false)}$('#touch').hidden=true}else{CM.light=0;toMenu()}$('#menu').hidden=true;
  const el=$('#cmap');el.hidden=false;el.appendChild($('#roamCard'));el.appendChild($('#story'));$('#roamCard').hidden=true;RO.card=null;CM.on=true;cmBuild();cancelAnimationFrame(CM.raf);cmLoop();storyCheck()}
function cmResume(){if(TOUCH.park)parkSet(false);if(CM.light&&state==='roam'){CM.light=0;RO.on=true;RO.frozen=false;RO.cool=1;$('#roam').hidden=false;$('#touch').hidden=!TOUCH.on;camSnap=true}else enterRoam()}
function cmClose(){CM.on=false;cancelAnimationFrame(CM.raf);$('#cmap').hidden=true;$('#roamCard').hidden=true;const r=$('#roam');r.appendChild($('#story'));r.appendChild($('#roamCard'))}
addEventListener('resize',()=>{if(CM.on)cmLayout()});
$('#cmMenu').onclick=()=>{cmClose();if(CM.fromRoam)cmResume();else toMenu()};$('#cmSlots').onclick=()=>{cmClose();toMenu();showSlots()};$('#cmStory').onclick=()=>storyShow(CHAPTERS[chapter()-1]);
addEventListener('keydown',e=>{if(!CM.on)return;if(RO.story&&/Enter|Escape|Space/.test(e.code)){e.preventDefault();e.stopImmediatePropagation();storyClose();return}if(e.code==='Enter'&&RO.card){e.preventDefault();e.stopImmediatePropagation();roamGo()}else if(e.code==='Escape'){e.preventDefault();e.stopImmediatePropagation();if(RO.card){RO.card=null;$('#roamCard').hidden=true}else{cmClose();if(CM.fromRoam)cmResume();else toMenu()}}},true);
