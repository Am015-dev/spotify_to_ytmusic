// ---------- interface ----------
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
Object.assign(UI,{mode:'solo',fac:[0,1],lvl:'normal',size:'core',draft:{},ex:{},hints:true,pass:null,dieFace:{}});
try{const st=JSON.parse(localStorage.getItem('na_setup')||'null');if(st)Object.assign(UI,{lvl:st.lvl||'normal',size:st.size||'core',fac:st.fac||[0,1],ex:st.ex||{}})}catch(e){}
function saveSetup(){try{localStorage.setItem('na_setup',JSON.stringify({lvl:UI.lvl,size:UI.size,fac:UI.fac,ex:UI.ex}))}catch(e){}}
function announce(t){const el=$('live');if(el)el.textContent=t}
// which human side is planning right now (hot-seat hides the other side's dials behind a pass screen)
function planSide(){if(!G||G.phase!=='plan')return -1;const net=(typeof NET!=='undefined'&&NET.on);for(const k of [0,1])if(isHuman(k)&&!planDone(k)&&(!net||k===NET.mySide))return k;return -1}
function humanTurn(){const k=sideToAct();return k>=0&&isHuman(k)&&(typeof NET==='undefined'||!NET.on||k===NET.mySide)}
function refresh(){render();schedule()}
function render(){if(typeof netTick==='function')netTick();try{hpMark()}catch(e){}
  if(G&&G.winner&&UI.wonSnd!==G.seed){UI.wonSnd=G.seed;sfx('win');if(G.sortie!=null&&soloSide()===0&&G.winner==='P1'){const c=campaign();c.i=Math.max(c.i,Math.min(SORTIES.length,G.sortie+1));c.won++;saveCampaign(c)}if(ANIM)setTimeout(()=>{UI.stats=true;render()},2200)}
  attackWatch();flowWatch();trackStats();if(V3.on)sync3D();else render2D();renderFlow();renderPrompt();renderShipCard();renderRoster();renderLog();renderModal();renderDock();renderCoach()}
// ---- step bar ----
function renderSteps(){renderRoad()}
// ---- dial picker ----
const COLS=[['T',-1,'↰'],['B',-1,'↖'],['S',0,'↑'],['B',1,'↗'],['T',1,'↱'],['K',0,'⤺']];
const COLW=['Turn left','Bank left','Straight','Bank right','Turn right','K-turn'];
function dialGrid(s,sug){const d=dialOf(s);const pick=UI.draft[s.id];const has=COLS.map(([t,dd])=>d.some(m=>m.t===t&&(m.d||0)===dd&&m.s>0));
  let h=`<table class="dial" role="grid" aria-label="Maneuver dial: rows are speeds, columns are directions"><thead><tr><th class="sp">speed</th>${COLS.map((c,i)=>`<th class="cw">${has[i]?COLW[i]:''}</th>`).join('')}</tr></thead><tbody>`;
  for(let sp=5;sp>=1;sp--){let row='';let any=false;for(const [t,dd,ic] of COLS){const i=d.findIndex(m=>m.s===sp&&m.t===t&&(m.d||0)===dd);
      if(i<0){row+='<td></td>';continue}any=true;const m=exColor(s,d[i]);const bad=m.c==='r'&&s.stress;
      row+=`<td><button class="mv ${m.c} ${pick===i?'on':''} ${sug===i&&UI.hints?'sugg':''}" data-dial="${i}" data-ship="${s.id}" title="${bad?'Stressed ships cannot fly red maneuvers':mvWords(m)+' · '+colWords(m.c)}" aria-label="${mvWords(m)}, ${m.c==='r'?'red':m.c==='g'?'green':'white'}${sug===i&&UI.hints?', recommended':''}">${ic}<small>${sp}</small>${sug===i&&UI.hints?'<em class="rs">★</em>':''}</button></td>`}
    if(any)h+=`<tr><th>${sp}</th>${row}</tr>`}
  return h+'</tbody></table>'}
// the result line for the player reading it: "You win/lose: …" in a solo or online game, the neutral line in hot-seat or watch
function winLine(){const me=soloSide();if(!G||!G.winner||me<0||G.winner==='draw')return G?G.winText:'';const won=G.winner==='P'+(me+1);
  const why=/both squadrons/.test(G.winText)?`both squadrons fell together, and ${won?'you':sideName(1-me)} had initiative`:/^Time/.test(G.winText)?'on points destroyed when time ran out':won?'every enemy ship is destroyed':'all your ships are destroyed';
  return `${won?'You win':'You lose'}: ${why}.`}
function suggestDial(s){const dk=alive().filter(x=>x.side===s.side&&x!==s&&UI.draft[x.id]!=null).map(x=>x.id+':'+UI.draft[x.id]).join(',');
  if(UI.sugCache&&UI.sugCache.k===G.round+'|'+s.id+'|'+dk)return UI.sugCache.v;const lv={samples:6,noise:0,look:0};
  // wingmen whose dials are already set: don't suggest ending on top of them
  const friends=alive().filter(x=>x.side===s.side&&x!==s&&UI.draft[x.id]!=null).map(x=>({s:x,p:finalPose(x,B(x),dialOf(x)[UI.draft[x.id]])}));
  const save=G.rng;const enemyPoses=enemiesOf(s).map(e=>[e,enemyGuess(e,lv.samples)]);let best=0,bv=-1e9;const sc=[];
  dialOf(s).forEach((m,i)=>{const p=finalPose(s,B(s),m),c=exColor(s,m);let v=scorePose(s,p,c,enemyPoses,friends,lv);
    // a suggestion must be safe first: never a blocked red, an asteroid only when every move touches one, and don't park beside a rock (next round's moves would all clip it)
    if(c.c==='r'&&s.stress)v-=1e6;const rk=rockHits(s,m);if(rk)v-=40*rk;
    else{const P=corners(p,B(s));const near=Math.min(...G.rocks.map(o=>{const R=rockPoly(o);return Math.min(...P.map(q=>polyPointDist(q,R)))}),1e9);if(near<30)v-=(30-near)/6}
    sc[i]=v;if(v>bv){bv=v;best=i}});G.rng=save;
  UI.sugCache={k:G.round+'|'+s.id+'|'+dk,v:best,sc};return best}
function poseReport(s,m){const p=finalPose(s,B(s),m);const b=B(s);const bits=[];if(offBoard(p,b))return '<b class="bad">Flies off the battlefield: the ship would be destroyed!</b>';
  if(G.rocks.some(o=>polyOverlap(corners(p,b),rockPoly(o))))bits.push('<b class="bad">lands on an asteroid (damage roll, no action, no shot)</b>');
  else if(tplPoints(s,b,m,4).some(q=>G.rocks.some(o=>polyPointDist(q,rockPoly(o))<=TPL_W/2)))bits.push('<b class="bad">clips an asteroid (damage roll, no action)</b>');
  for(const e of enemiesOf(s)){const r=arcReach(p,b,e,B(e),s.arc);if(r&&rangeOf(r.d)<=3)bits.push(`${esc(e.name)} in your arc at range ${rangeOf(r.d)}`);const q=arcReach(e,B(e),p,b,e.arc);if(q&&rangeOf(q.d)<=3)bits.push(`<span class="warn">you'd be in ${esc(e.name)}'s arc (range ${rangeOf(q.d)})</span>`)}
  if(m.c==='r')bits.push('red: you take a stress token (no action this turn)');if(m.c==='g'&&s.stress)bits.push('green: clears a stress token');
  return 'If enemies stayed put: '+(bits.join(' · ')||'no enemies in reach')}
// ---- prompt: always one sentence of what to do, then the buttons ----
// the goal and the race, always on top of the dock: who has how many ships and how much hull + shields left
function raceHTML(){if(!G||G.round<1||G.winner)return '';const me=soloSide();const k0=me>=0?me:0;
  const side=k=>{const a=G.ships.filter(s=>s.side===k&&s.alive);const h=a.reduce((x,s)=>x+Math.max(0,s.hull-hullDmg(s)),0),sh=a.reduce((x,s)=>x+s.sh,0);
    return `<b>${me>=0?(k===me?'You':'Enemy'):esc(sideName(k))}</b> ${a.length} ship${a.length===1?'':'s'} <span class="h">♥${h}</span>${sh?` <span class="sh">◈${sh}</span>`:''}`};
  return `<p class="race" title="♥ hull left · ◈ shields left (shields go first)">🎯 Destroy every enemy ship · ${side(k0)} vs ${side(1-k0)}</p>`}
function renderPrompt(){const el=$('prompt');if(!el)return;if(!G){el.innerHTML='';return}
  if(G.winner){el.innerHTML=`<h2>${esc(winLine())}</h2><div class="acts"><button class="btn primary" data-a="stats">Debrief</button>${nextSortieBtn()}<button class="btn" data-a="new">New battle</button></div>`;return}
  if(sumPending()){el.innerHTML=raceHTML()+summaryHTML();return}
  if(UI.hold){if(humanTurn()||planSide()>=0){const ks=UI.holdK.splice(0);UI.hold=null;if(ks.length)setTimeout(()=>{for(const k of ks)k()},0)}else{el.innerHTML=raceHTML()+holdHTML();return}}
  const me=humanTurn();let h='';
  if(G.phase==='plan'){const ps=planSide();h=ps<0?watchHTML():planHTML(ps)}
  else if(G.phase==='action'){h=me?actionHTML(ship(G.cur)):watchHTML()}
  else if(G.phase==='target'){h=me?targetHTML(ship(G.cur)):watchHTML()}
  else if(G.phase==='ask'&&G.q){const q=G.q;if(!humanTurn())h=`<p class="head">Waiting for ${esc((typeof NET!=='undefined'&&NET.on)?netWho(q.side):sideName(q.side))}…</p>`;else{const A=G.atk;h=`<p class="head">${esc(q.title)}</p>${q.key==='rock'||q.key==='deploy'?setupText(q):`<p>${esc(q.text)}</p>`}${A&&['dice','pay','juno','heat','brakk','varn','garrick','munitions'].includes(q.key)?diceRows(A):''}${askButtons(q)}`}}
  else if(G.phase==='damod'){const A=G.atk,d=ship(A.d);h=diceHead(A)+diceRows(A)+`<p class="preview">The defender may tamper with the attack dice first.</p>`;
    if(humanTurn())h+=`<div class="acts col">${exDAMods().map(m=>`<button class="btn" data-act="damod" data-k="${m.k}">${esc(m.l)}<small>${esc(m.d)}</small></button>`).join('')}<button class="btn primary" data-act="damod" data-k="done">Let the attack stand</button></div>`;else h+=`<p class="small muted">${esc(d.name)} is reacting…</p>`}
  else if(G.phase==='amod'||G.phase==='dmod'){const A=G.atk,a=ship(A.a),d=ship(A.d);const r=preview(A);const rk=me?recMod():null;
    h=diceHead(A)+diceRows(A)+`<p class="preview">Right now: <b>${r.hits} hit${r.hits===1?'':'s'}</b>${r.crits?`, <b>${r.crits} crit${r.crits>1?'s':''}</b>`:''}${A.step==='amod'?' before the defence roll':(r.hits+r.crits===1?' gets through':' get through')}${A.step==='amod'?'':` (${r.hits+r.crits?`${esc(shortName(d))} loses ${r.hits+r.crits} shield${r.hits+r.crits===1?'':'s'} or hull`:'no damage'})`}.</p>`;
    if(me){const mods=G.phase==='amod'?atkMods():defMods();const rkFirst=(x,y)=>(y.k===rk)-(x.k===rk);h+=`<div class="acts col">${mods.slice().sort(rkFirst).map(m=>`<button class="btn${m.k===rk?' rec':''}" data-act="${G.phase}" data-k="${m.k}">${m.k===rk?'★ ':''}${esc(m.l)}<small>${esc(m.d)}</small></button>`).join('')}<button class="btn primary" data-act="${G.phase}" data-k="done">${G.phase==='amod'?'Done: the defender rolls':'Done: take the damage'}${rk==='done'?'<small>★ recommended: nothing left to improve</small>':''}</button></div>`}
    else h+=`<p class="small muted">${G.phase==='amod'?esc(a.name)+' is modifying its attack…':esc(d.name)+' is defending…'}</p>`;
    h+=DLEG}
  else h=watchHTML();
  el.innerHTML=(typeof netWaitHTML==='function'?netWaitHTML():'')+raceHTML()+h}
function sugTip(s,sug){const m=dialOf(s)[sug];const si=sugInfo(s,sug);let h=`<p class="tip">💡 <b>${mText(m)}</b> (dashed outline): ${si.why}. <span class="${exColor(s,m).c==='r'?'warn':''}">${si.cost}</span>`;
  if(exColor(s,m).c==='r'){const alt=saferAlt(s);if(alt!=null&&alt!==sug)h+=` Safer: <b>${mText(dialOf(s)[alt])}</b> (${exColor(s,dialOf(s)[alt]).c==='g'?'green':'white'}).`}return h+'</p>'}
function setupText(q){const r=recOpt(q);const rock=q.key==='rock';
  return `<div class="acts"><button class="btn primary big" data-a="autoplace">✨ Auto-place (recommended)<small>Places your ${rock?'asteroids and ship':'ships'} in sensible spots. In a first game it doesn't matter much.</small></button></div>
  ${rock&&G.rocks.length?`<p class="small">The two sides take turns placing 6 asteroids; ${G.rocks.length} ${G.rocks.length===1?'is':'are'} already down (the grey rocks).</p>`:''}${rock?'<p class="small">Asteroids: flying through one damages you and skips your action; shooting past one gives the defender +1 die.</p>':''}
  <p class="small muted"><b>Or place ${rock?'it':'it'} yourself:</b> tap an outlined spot on the mat, or pick one below (${rock?'columns A-E from your left, rows 1-5 from your edge':'spots 1-9 along your edge, left to right'}). ★ <b>${esc(r.o.l)}</b> is suggested: ${r.why}.</p>`}
// long lists of short choices (asteroid spots A1…E5 and the like) become a compact grid; the spots are laid out like the mat
function askButtons(q){const rk=(q.key==='rock'||q.key==='deploy')?recOpt(q).o.k:null;const pri=(o,i)=>rk?(o.k===rk?'primary rec':''):(q.opts.some(x=>x.pri)?o.pri:i===0)?'primary':'';const short=q.opts.length>6&&q.opts.every(o=>String(o.l).length<=14);
  const btn=(o,i,st)=>`<button class="btn ${pri(o,i)}" data-act="ask" data-k="${esc(o.k)}" ${o.p?`data-hov="Q:${i}"`:''} ${st?`style="${st}"`:''} aria-label="${esc(o.l)}">${esc(o.l)}</button>`;
  if(q.key==='rock'&&q.opts.every(o=>/^[A-E][1-5]$/.test(o.l))){let h=`<div class="acts grid" role="group" aria-label="Asteroid spots">`;
    h+=q.opts.map((o,i)=>btn(o,i,`grid-column:${'ABCDE'.indexOf(o.l[0])+1};grid-row:${6-(+o.l[1])}`)).join('');return h+'</div>'}
  if(q.key==='deploy'&&q.opts.every(o=>/^Spot [1-9]$/.test(o.l)))return `<div class="acts grid g9" role="group" aria-label="Deployment spots">${q.opts.map((o,i)=>`<button class="btn ${pri(o,i)}" data-act="ask" data-k="${esc(o.k)}" data-hov="Q:${i}" style="grid-column:${o.l.slice(5)}" aria-label="${esc(o.l)}">${o.l.slice(5)}</button>`).join('')}</div>`;
  if(short)return `<div class="acts tiles">${q.opts.map((o,i)=>btn(o,i)).join('')}</div>`;
  return `<div class="acts col">${q.opts.map((o,i)=>btn(o,i)).join('')}</div>`}
// tapping the mat picks the nearest outlined spot of the current question (asteroid spots, placements)
function matPick(x,y){if(!G||G.phase!=='ask'||!G.q||!humanTurn())return;let best=null,bd=1e9;for(const o of G.q.opts){if(!o.p)continue;const d=Math.hypot(o.p.x-x,o.p.y-y);if(d<bd){bd=d;best=o}}
  if(best&&bd<=(best.b||40)/2+(window.PHN&&PHN.on?80:25)){sfx('click');uiAct({act:'ask',k:best.k})}}
// an eight-sided die drawn as a faceted octahedron (front face, three side facets) with its symbol engraved in the front face;
// when WebGL is on, rendered 3D dice replace the drawing (see makePortraits in three3d.js)
const D8SYM=(()=>{const star=(n,r0,r1)=>{let d='';for(let i=0;i<n*2;i++){const a=i/(n*2)*Math.PI*2-Math.PI/2,r=i%2?r1:r0;d+=(i?'L':'M')+(Math.cos(a)*r).toFixed(3)+' '+(Math.sin(a)*r).toFixed(3)}return d+'Z'};
  const circ=(r,rev)=>`M${r} 0A${r} ${r} 0 1 ${rev?0:1} ${-r} 0A${r} ${r} 0 1 ${rev?0:1} ${r} 0Z`;
  return {hit:star(8,1,.42),crit:star(4,1,.3)+circ(.22,1),focus:circ(.9)+circ(.52,1)+circ(.26),evade:'M0 -1Q.12 -.12 1 0Q.12 .12 0 1Q-.12 .12 -1 0Q-.12 -.12 0 -1Z',blank:''}})();
function die(f,k){const c=k==='atk'?['#ff5a6c','#c21830','#7a0a18','#4a0510','#fff3ea']:['#5ff0a0','#1fa45a','#0c5a30','#06331a','#effff5'];const p=D8SYM[f]||'';const id='d'+k+f;
  const sym=p?`<g transform="translate(24 29) scale(8.2)"><path d="${p}" fill="rgba(0,0,0,.55)" fill-rule="evenodd" transform="translate(.09 .11)"/><path d="${p}" fill="${c[4]}" fill-rule="evenodd"/><path d="${p}" fill="none" stroke="rgba(0,0,0,.35)" stroke-width=".08"/></g>`:'';
  return `<span class="die ${k} ${f}" aria-label="${f}"><svg class="d8" viewBox="0 0 48 52" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c[0]}"/><stop offset="1" stop-color="${c[1]}"/></linearGradient></defs>`+
    `<path d="M24 2L45 14L45 38L24 50L3 38L3 14Z" fill="${c[3]}"/><path d="M24 2L45 14L45 38Z" fill="${c[2]}"/><path d="M3 38L3 14L24 2Z" fill="${c[1]}" opacity=".9"/><path d="M45 38L24 50L3 38Z" fill="${c[3]}"/>`+
    `<path d="M24 3.5L43.6 37.2L4.4 37.2Z" fill="url(#${id})"/><path d="M24 3.5L43.6 37.2" stroke="rgba(255,255,255,.55)" stroke-width="1"/><path d="M24 3.5L4.4 37.2" stroke="rgba(255,255,255,.3)" stroke-width="1"/>${sym}</svg><i>${f}</i></span>`}
// consistent inline-SVG icons in place of the emoji on the bar, the dock head and small buttons
const ICO=(()=>{const s=(d,extra)=>`<svg class="ico" viewBox="0 0 20 20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  return {'🛩':s('<path d="M2 11l7-1 4-7h2l-2 7 5 1v1l-5 1 2 6h-2l-4-6-7-1z" fill="currentColor" fill-opacity=".25"/>'),'📜':s('<path d="M5 3h9a2 2 0 012 2v11a1 1 0 01-1 1H7a2 2 0 01-2-2z"/><path d="M8 7h5M8 10h5M8 13h3"/>'),
    '❔':s('<circle cx="10" cy="10" r="7.5"/><path d="M7.8 7.6a2.3 2.3 0 114 1.6c-.9.7-1.8 1.1-1.8 2.4"/><circle cx="10" cy="14.4" r=".6" fill="currentColor"/>'),'✦':s('<path d="M10 2l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" fill="currentColor" fill-opacity=".3"/>'),
    '🔊':s('<path d="M3 8v4h3l4 3V5L6 8z" fill="currentColor" fill-opacity=".3"/><path d="M13 7.5a3.5 3.5 0 010 5M15.5 5a7 7 0 010 10"/>'),'🔇':s('<path d="M3 8v4h3l4 3V5L6 8z" fill="currentColor" fill-opacity=".3"/><path d="M13 8l4 4M17 8l-4 4"/>'),
    '🎵':s('<path d="M8 15V4l8-2v11"/><circle cx="6" cy="15" r="2" fill="currentColor"/><circle cx="14" cy="13" r="2" fill="currentColor"/>'),'⏩':s('<path d="M3 5l6 5-6 5zM10 5l6 5-6 5z" fill="currentColor" fill-opacity=".35"/>'),
    '💡':s('<path d="M7 13a5 5 0 116 0v2H7z" fill="currentColor" fill-opacity=".2"/><path d="M8 18h4"/>'),'📘':s('<path d="M3 4h5a2 2 0 012 2v11a2 2 0 00-2-2H3zM17 4h-5a2 2 0 00-2 2v11a2 2 0 012-2h5z"/>'),
    '🧭':s('<circle cx="10" cy="10" r="7.5"/><path d="M13 7l-2 4-4 2 2-4z" fill="currentColor"/>'),'⬒':s('<path d="M3 13l7 4 7-4-7-4z"/><path d="M3 9l7 4 7-4-7-4z" fill="currentColor" fill-opacity=".25"/>'),
    'ⓘ':s('<circle cx="10" cy="10" r="7.5"/><path d="M10 9v5"/><circle cx="10" cy="6.3" r=".7" fill="currentColor"/>'),'☰':s('<path d="M4 6h12M4 10h12M4 14h12"/>'),'⚙':s('<circle cx="10" cy="10" r="2.6"/><path d="M10 2.5v2.2M10 15.3v2.2M2.5 10h2.2M15.3 10h2.2M4.7 4.7l1.6 1.6M13.7 13.7l1.6 1.6M4.7 15.3l1.6-1.6M13.7 6.3l1.6-1.6"/><circle cx="10" cy="10" r="5.4"/>')}})();
const ICORE=new RegExp('('+Object.keys(ICO).join('|')+')\\uFE0F?','g');
function iconize(root){(root||document).querySelectorAll('.gx-bar .btn,.gx-dock-head .gx-ibtn,.viewbar .btn,.gx-reopen,#shipcard .more,#coach .adv b').forEach(el=>{if(!ICORE.test(el.innerHTML)){ICORE.lastIndex=0;return}ICORE.lastIndex=0;
  const w=document.createTreeWalker(el,4);const ns=[];while(w.nextNode())ns.push(w.currentNode);ns.forEach(n=>{if(!ICORE.test(n.nodeValue)){ICORE.lastIndex=0;return}ICORE.lastIndex=0;const span=document.createElement('span');span.className='icw';span.innerHTML=n.nodeValue.replace(/[<&>]/g,c=>({'<':'&lt;','&':'&amp;','>':'&gt;'}[c])).replace(ICORE,m=>ICO[m.replace('️','')]||m);n.parentNode.replaceChild(span,n)})})}
if(typeof MutationObserver!=='undefined'){const mo=new MutationObserver(()=>{mo.disconnect();try{iconize()}catch(e){}watchIcons()});const watchIcons=()=>document.querySelectorAll('.gx-bar,.gx-dock-head,#shipcard,#coach,.viewbar,.gx-reopen').forEach(n=>mo.observe(n,{childList:true,subtree:true,characterData:true}));
  document.addEventListener('DOMContentLoaded',()=>{iconize();watchIcons()});if(document.readyState!=='loading'){iconize();watchIcons()}}
// ---- roster: ship cards ----
function renderRoster(){const el=$('roster');if(!el||!G)return;const me=soloSide();el.innerHTML=[0,1].map(k=>`<div class="fac f${FACTIONS[G.fac[k]].col}"><h3>${me<0?'':k===me?'Your ships · ':'Enemy · '}${esc(sideName(k))}${G.init===k?' <i title="initiative: wins pilot-skill ties">★ initiative</i>':''}</h3><p class="small muted">${esc(FACTION_BIO[G.fac[k]]||'')}</p>`+
  G.ships.filter(s=>s.side===k).map(s=>{const T=SHIPS[s.type];const hp=s.hull-hullDmg(s);const ps=psOf(s),at=primary(s),ag=agility(s);const cur=(v,b)=>v!==b?` class="chg" title="base ${b}"`:'';
    const tok=shipTokens(s);
    const art=typeof shipArt==='function'&&shipArt(s);const fc=FACTIONS[G.fac[s.side]].col;
    return `<div class="card pcard fc${fc} ${s.alive?'':'dead'} ${G.cur===s.id?'on':''}" data-sel="${s.id}"><div class="pc-title"><span class="pc-ps" title="pilot skill">${psOf(s)}</span><b>${esc(s.name)}</b>${PILOTS[s.pilot].uniq?'<span class="pc-uq" title="unique pilot">◆</span>':''}</div>
    <div class="pc-art">${art?`<img src="${art}" alt="" loading="lazy">`:SHIP_SIL}</div><div class="pc-type">${esc(T.n)} <span>· ${esc(FACTIONS[G.fac[s.side]].n)}</span></div>
    <div class="stats">${statSpans(s)}</div><div class="pc-text">
    <p class="bio small muted">${esc(pilotBio(s))}</p>${PILOTS[s.pilot].t?`<p class="ab">${esc(PILOTS[s.pilot].t)}</p>`:''}${s.ups.length?`<p class="ups">${s.ups.map(u=>`<span class="${u.gone?'gone':''}" title="${esc(UPGRADES[u.id].t)}">${esc(UPGRADES[u.id].n)}</span>`).join('')}</p>`:''}
    ${s.dmg.filter(x=>x.up).map(x=>`<p class="crit" title="${esc(DAMAGE[x.c].t)}">✸ ${esc(DAMAGE[x.c].n)}: ${esc(critPlain(x.c,s))}</p>`).join('')}${s.alive&&s.dmg.some(x=>!x.up)?`<p class="small muted">${s.dmg.filter(x=>!x.up).length} hull damage</p>`:''}${s.alive&&tok?`<p class="small">${tok}</p>`:''}</div></div>`}).join('')+'</div>').join('')}
const SHIP_SIL='<svg viewBox="0 0 120 60" aria-hidden="true"><path d="M110 30L70 24L52 8H44L50 24L18 26L10 18H6L8 30L6 42H10L18 34L50 36L44 52H52L70 36Z" fill="currentColor" opacity=".5"/></svg>';
function statSpans(s,short){const hp=s.hull-hullDmg(s);const ps=psOf(s),at=primary(s),ag=agility(s);const cur=(v,b)=>v!==b?` class="chg" title="base ${b}"`:'';const L=short?['PS','Atk','Agi','Hull','Shd']:['Skill','Attack','Agility','Hull','Shields'];
  return `<span class="ps${pulse(s,'ps')}" title="pilot skill: higher skill moves later and shoots first"><i>${L[0]}</i> <b${cur(ps,s.ps)}>${ps}</b></span><span class="a${pulse(s,'a')}" title="primary attack: attack dice rolled"><i>${L[1]}</i> <b${cur(at,s.atk)}>${at}</b></span><span class="g${pulse(s,'g')}" title="agility: defense dice rolled"><i>${L[2]}</i> <b${cur(ag,s.agi)}>${ag}</b></span><span class="h${pulse(s,'h')}" title="hull left"><i>${L[3]}</i> ${s.alive?hp:0}/${s.hull}</span><span class="s${pulse(s,'s')}" title="shields left: they soak damage before the hull"><i>${L[4]}</i> ${s.sh}/${s.shMax}</span>`}
function shipTokens(s){const locks=[s.tl,s.tl2].filter(Boolean).map(id=>ship(id)).filter(Boolean);const onMe=G.ships.filter(o=>o.alive&&(o.tl===s.id||o.tl2===s.id));
    return [s.stress?`<span class="warn">stress ${s.stress} (no red moves, no actions)</span>`:'',s.ion?`ion ${s.ion}`:'',s.focus?`focus ${s.focus}`:'',s.evade?`evade ${s.evade}`:'',locks.length?`lock → ${locks.map(o=>esc(o.name)).join(', ')}`:'',onMe.length?`locked by ${onMe.map(o=>esc(o.name)).join(', ')}`:'',
      s.flags.juke?'+1 agility (mech)':'',s.flags.allin?'all-in (+1 attack, −1 agility)':'',s.flags.dead?'deadshot ready':'',s.flags.psT!=null&&G.inCombat?`pilot skill ${s.flags.psT} this phase`:'',s.flags.doomed?'<span class="warn">crippled</span>':''].filter(Boolean).join(' · ')}
// the ship that matters right now (selected while planning, the active ship, or attacker and defender) stays visible in the dock
function focusShips(){if(!G||G.winner)return [];const A=G.atk;if(A&&['amod','dmod','damod','ask','target'].includes(G.phase)&&A.a&&A.d&&ship(A.a)&&ship(A.d)&&G.phase!=='target')return [ship(A.a),ship(A.d)];
  if(G.phase==='plan'){const ps=planSide();const s=ps>=0&&UI.sel&&ship(UI.sel);return s?[s]:[]}const c=G.cur&&ship(G.cur);if(c)return [c];const s=UI.sel&&ship(UI.sel);return s?[s]:[]}
function renderShipCard(){const el=$('shipcard');if(!el)return;const ss=focusShips();if(!ss.length){el.innerHTML='';return}
  const one=s=>{const tok=s.alive?shipTokens(s):'destroyed';const crit=s.dmg.filter(x=>x.up).map(x=>`<span class="crit" title="${esc(DAMAGE[x.c].t)}">✸ ${esc(DAMAGE[x.c].n)}</span>`).join(' ');
    return `<b class="nm" style="color:var(--c${FACTIONS[G.fac[s.side]].col})" title="${esc(PILOTS[s.pilot].t||'')}">${esc(s.name)}</b> <span class="muted small tp">${esc(SHIPS[s.type].n)}</span><div class="row2"><span class="stats">${statSpans(s,G.round>2||ss.length===2)}</span></div>${tok||crit?`<div class="small">${[tok,crit].filter(Boolean).join(' · ')}</div>`:''}`};
  el.innerHTML=ss.length===2?`<div class="shipc two" aria-label="Attacker and defender"><div>${one(ss[0])}</div><div>${one(ss[1])}</div></div>`:`<div class="shipc" aria-label="Selected ship"><button class="btn ghost more" data-gx="d-squads" title="All ship cards">🛩 All</button>${one(ss[0])}</div>`}
function renderLog(){const el=$('log');if(el&&G)el.innerHTML=G.log.slice(0,300).map(l=>`<li class="s${l.s}">${esc(l.t)}</li>`).join('');const ll=$('lastlog');if(ll)ll.innerHTML=G?G.log.slice(0,2).map(l=>`<div class="s${l.s}" title="${esc(l.t)}">${esc(l.t)}</div>`).join(''):''}
// ---- modals: start screen, pass-the-device, rules, stats ----
function renderModal(){const el=$('modal');let h=typeof netModalHTML==='function'?netModalHTML():'';if(h){el.innerHTML=h;el.classList.remove('hidden');return}
  if(typeof GX!=='undefined'&&GX.app){if(UI.build!=null){const d=GX.drawer('d-build','✎ '+FACTIONS[UI.fac[UI.build]].n+' squadron',$('bbody'),true);$('bbody').innerHTML=builderHTML();if(GX.open!=='d-build')GX.show('d-build')}else if(GX.open==='d-build')GX.close()}
  if(UI.build!=null){if(!(typeof GX!=='undefined'&&GX.app))h=`<div class="dlg">${builderHTML()}</div>`}else if(UI.rules)h=rulesHTML();else if(UI.info)h=startHTML();else if(UI.stats&&G)h=statsHTML();
  else if(G&&G.phase==='plan'&&UI.pass!=null&&UI.pass!==planSide()&&planSide()>=0&&bothHuman())h=`<div class="dlg pass"><h2>Pass the device to ${esc(sideName(planSide()))}</h2><p>The other side's dials are hidden. Only ${esc(sideName(planSide()))} should look now.</p><div class="acts"><button class="btn primary" data-a="passok">I'm ${esc(sideName(planSide()))}: show my ships</button></div></div>`;
  el.innerHTML=h;el.classList.toggle('hidden',!h)}
const bothHuman=()=>G&&isHuman(0)&&isHuman(1)&&!(typeof NET!=='undefined'&&NET.on);// online games never show the pass-the-device screen
function startHTML(){const saved=load();const camp=campaign();const campOK=UI.fac[0]===0&&UI.fac[1]===1;return `<div class="dlg start" role="dialog" aria-modal="true"><div class="launchbar"><h1>Nebula Aces</h1>${NET.on?'<button class="btn primary" data-a="netopen">🌐 Lobby ▶</button>':`<button class="btn primary" data-start="${UI.mode}">Launch ▶</button>`}</div><p class="lead">A tactical starfighter duel: secretly plan every maneuver, then watch the squadrons clash.</p>
  <p class="small">First time? Just press <b>Launch</b>: the defaults are a good first battle and the first round is guided. Everything below is optional.</p>
  ${campOK&&UI.mode==='solo'&&camp.i>0&&camp.i<SORTIES.length?`<div class="row"><button class="btn" data-a="sortie" data-k="${camp.i}">▶ Continue the campaign<small>Sortie ${camp.i+1}: ${esc(SORTIES[camp.i].title)}</small></button></div>`:''}
  <h3>Mode</h3><div class="row">${[['solo','Me vs computer'],['hot','Two players, one screen'],['ai','Watch the computer']].map(([k,l])=>`<button class="btn ${UI.mode===k?'on':''}" data-mode="${k}">${l}</button>`).join('')}</div>
  <h3>🌐 Play online</h3>${typeof onlineBlock==='function'?onlineBlock():''}
  <h3>Factions</h3><div class="row">${[0,1].map(k=>`<label>${k?'Opponent':'You'}: <select data-fac="${k}">${FACTIONS.map((f,i)=>`<option value="${i}" ${UI.fac[k]===i?'selected':''} ${f.ex&&!UI.ex[f.ex]?'disabled':''}>${esc(f.n)}</option>`).join('')}</select><small class="bio">${esc(FACTION_BIO[UI.fac[k]]||'')}</small></label>`).join(' ')}</div>
  <h3>Battle size</h3><div class="row">${SIZES.map(z=>`<button class="btn ${UI.size===z.k?'on':''}" data-size="${z.k}">${esc(z.n)}<small>${esc(z.d)}</small></button>`).join('')}</div>
  <h3>Computer skill</h3><div class="row">${['easy','normal','hard'].map(l=>`<button class="btn ${UI.lvl===l?'on':''}" data-lvl="${l}">${l[0].toUpperCase()+l.slice(1)}</button>`).join('')}</div>
  ${EXPS.length?`<h3>Expansions</h3><div class="exps">${EXPS.map(e=>`<button class="ex ${UI.ex[e.k]?'on':''}" data-exk="${e.k}"><b>${UI.ex[e.k]?'✓ ':''}${esc(e.n)}</b><small>${esc(e.d)}</small></button>`).join('')}</div>`:''}
  ${UI.size==='custom'?`<div class="row">${[0,1].map(k=>{const sq=UI.squads&&UI.squads[k];return `<button class="btn" data-a="build" data-k="${k}">✎ ${k?'Opponent':'Your'} squad<small>${sq&&sq.length?`${sq.length} ships · ${squadCost(sq)} pts`:'not built yet (random)'}</small></button>`}).join('')}</div>`:''}
  <div class="acts">${NET.on?'<button class="btn primary" data-a="netopen">🌐 Back to the lobby</button>':`<button class="btn primary" data-start="${UI.mode}">Launch</button>`}${saved&&!NET.on?'<button class="btn" data-start="load">Continue saved battle</button>':''}<button class="btn" data-a="rules">How to play</button></div></div>`}
const CREDITS_HTML=`<section class="credits-audio"><h3>Credits</h3><p>Names, card text and art are original.</p><h4>Audio</h4><p>With thanks to these public-domain (CC0) creators:</p><ul><li>Music: &ldquo;Hostile Fleet Interception&rdquo; by vitalezzz (<a target="_blank" rel="noopener" href="https://opengameart.org/content/hostile-fleet-interception">OpenGameArt</a>, CC0)</li><li>Sound effects: Casino Audio, Digital Audio, Impact Sounds, Interface Sounds, Music Jingles, Sci-fi Sounds, UI Audio by <a target="_blank" rel="noopener" href="https://kenney.nl">Kenney</a> (CC0)</li><li>Sound effects: &ldquo;100 CC0 SFX #2&rdquo; by rubberduck (<a target="_blank" rel="noopener" href="https://opengameart.org/content/100-cc0-sfx-2">OpenGameArt</a>, CC0)</li></ul><p><small>All sounds were trimmed, loudness-normalised and converted to MP3 for this game.</small></p></section>`;
function rulesHTML(){return `<div class="dlg rules"><h2>How to play</h2>${RULES_HTML}${CREDITS_HTML}<div class="acts"><button class="btn primary" data-a="close">Close</button></div></div>`}
function nextSortieBtn(){if(!G||G.sortie==null||soloSide()!==0)return '';const won=G.winner==='P1';const i=won?G.sortie+1:G.sortie;
  if(won&&i>=SORTIES.length)return '';return `<button class="btn" data-a="sortie" data-k="${i}">${won?'Next sortie ▶':'Fly it again ↻'}<small>${won?esc(SORTIES[i].title):esc(SORTIES[G.sortie].title)}</small></button>`}
function debriefHTML(){finishAtk();const me=soloSide();const so=G.sortie!=null?SORTIES[G.sortie]:null;const won=me>=0&&G.winner==='P'+(me+1);const lost=me>=0&&G.winner&&G.winner!=='draw'&&!won;
  const head=me<0?esc(G.winText):won?(so?so.win:'Victory.'):lost?(so?so.lose:'Defeat.'):'A draw.';const lines=[];
  const sides=me<0?[0,1]:[me];for(const k of sides)for(const s of G.ships.filter(x=>x.side===k)){const t=UI.taken[s.id]||0;const ks=UI.kills.filter(x=>x.by===s.id).map(x=>`downed ${esc(ship(x.v).name)} in round ${x.r} with a range-${x.rg} run`);
    const by=UI.kills.find(x=>x.v===s.id);lines.push(`<b>${esc(s.name)}</b> took ${t} hit${t===1?'':'s'}${ks.length?' and '+ks.join(' and '):''}${s.alive?`, and came home with ${s.hull-hullDmg(s)}/${s.hull} hull.`:by?`, then was shot down by ${esc(ship(by.by).name)} in round ${by.r}.`:lostHow(s)}`)}
  const foeLost=G.ships.filter(s=>me>=0&&s.side!==me&&!s.alive&&!UI.kills.some(x=>x.v===s.id));foeLost.forEach(s=>lines.push(`${esc(s.name)}${lostHow(s).replace(/^, (then )?/,' ')}`));
  const hook=so?(won?so.hook:'Regroup and fly this sortie again.'):'Next sortie: pick a bigger battle size, or switch sides.';
  return `<div class="dlg debrief"><h2>${head}</h2><p class="muted">${esc(G.winText)} ${G.round} round${G.round===1?'':'s'}.</p><ul>${lines.map(l=>`<li>${l}</li>`).join('')}</ul>
    <p class="hook">📡 ${esc(hook)}</p><details><summary>Full battle report</summary>${statsTable()}</details>
    <div class="acts">${nextSortieBtn().replace('class="btn"','class="btn primary"')}<button class="btn ${nextSortieBtn()?'':'primary'}" data-a="new">New battle</button><button class="btn" data-a="close">Look at the field</button></div></div>`}
function lostHow(s){const all=[].concat(...Object.values(UI.ev||{}));if(all.some(e=>e.t.startsWith(s.name+' flies off')))return ', then flew off the battlefield and was lost. Watch the edges: a move that ends off the mat destroys you.';return ', and was lost to asteroid or crit damage.'}
function statsTable(){const rows=G.ships.map(s=>{const st=G.stats[s.id]||{shots:0,dmg:0};return `<tr class="${s.alive?'':'dead'}"><td>${esc(s.name)}</td><td>${esc(sideName(s.side))}</td><td>${st.shots}</td><td>${st.dmg}</td><td>${s.alive?`${s.hull-hullDmg(s)}/${s.hull}`:'destroyed'}</td></tr>`}).join('');
  return `<table class="stats"><tr><th>Ship</th><th>Side</th><th>Shots</th><th>Damage dealt</th><th>Hull</th></tr>${rows}</table>`}
function statsHTML(){return debriefHTML()}
// ---- dock (shell): its title always says what is happening; a new human decision re-opens it ----
const NARROW=window.matchMedia?window.matchMedia('(max-width:999px)'):{matches:false};
const PHONE=window.matchMedia?window.matchMedia('(max-width:700px)'):{matches:false};
function renderDock(){const t=$('docktitle');if(!t)return;const pr=$('prompt');const head=pr&&pr.querySelector('.head,h2');
  t.textContent=!G?'Nebula Aces':G.winner?'Battle over':G.round===0?'Setup · '+(head?head.textContent:''):`Round ${roundShown()} · ${['','Planning','Activation','Combat','End'][stepShown()]||''}`;
  if(GX&&GX.app)GX.app.classList.toggle('na-plan',!!(PHONE.matches&&G&&!G.winner&&G.phase==='plan'&&planSide()>=0&&!UI.info));
  const need=G&&!G.winner&&!UI.info&&(planSide()>=0||humanTurn()||!!UI.hold);const sig=need?[G.round,G.phase,G.cur,G.q&&G.q.kid,G.atk&&G.atk.step,!!UI.hold,sumPending()].join('|'):'';
  if(sig&&sig!==UI.needSig&&typeof GX!=='undefined'&&GX.app){GX.showDock();const b=document.querySelector('.gx-dock-body');if(b)b.scrollTop=0}UI.needSig=sig}
if(PHONE.addEventListener)PHONE.addEventListener('change',()=>{render();if(V3.on)resize3D()});
// ---- 2D fallback (no WebGL): a top-down SVG of the field ----
function render2D(){const svg=$('map');if(!svg||!G)return;const F=typeof NET!=='undefined'&&NET.on&&NET.mySide===1,X=x=>F?MAT-x:x,Y=y=>F?y:MAT-y;/* online, side 1 sees the mat from its own edge */let h=`<rect width="${MAT}" height="${MAT}" fill="#0c0a22"/>`;
  for(const o of G.rocks)h+=`<polygon points="${rockPoly(o).map(p=>X(p.x)+','+Y(p.y)).join(' ')}" fill="#6b5a55"/>`;
  const sel=UI.sel&&ship(UI.sel);if(G.phase==='plan'&&sel&&myPlanShip(sel)){const di=UI.hoverDial!=null?UI.hoverDial:UI.draft[sel.id];if(di!=null){const m=dialOf(sel)[di];h+=`<polyline points="${tplPoints(sel,B(sel),m,4).map(p=>X(p.x)+','+Y(p.y)).join(' ')}" stroke="${m.c==='r'?'#f55':m.c==='g'?'#5f8':'#fff'}" stroke-width="20" stroke-opacity=".4" fill="none"/>`;const fp=finalPose(sel,B(sel),m);h+=`<polygon points="${corners(fp,B(sel)).map(p=>X(p.x)+','+Y(p.y)).join(' ')}" fill="none" stroke="#fff" stroke-dasharray="4 3"/>`}}
  for(const s of G.ships){if(!s.alive)continue;const c=FACCOL[FACTIONS[G.fac[s.side]].col].base;const P=corners(s,B(s));const f=add(s,mul(fwd(s.h),B(s)/2));
    h+=`<g data-ship="${s.id}" class="seat"><polygon points="${P.map(p=>X(p.x)+','+Y(p.y)).join(' ')}" fill="#15122e" stroke="${c}" stroke-width="${G.cur===s.id?5:2.5}"/>${window.PHN&&PHN.on?`<circle cx="${X(s.x)}" cy="${Y(s.y)}" r="70" fill="rgba(0,0,0,0.01)"/>`:''}<line x1="${X(s.x)}" y1="${Y(s.y)}" x2="${X(f.x)}" y2="${Y(f.y)}" stroke="${c}" stroke-width="4"/><text x="${X(s.x)}" y="${Y(s.y)-B(s)/2-6}" text-anchor="middle" font-size="16" fill="#fff">${esc(s.name.split(' ')[0])} ${s.hull-hullDmg(s)}</text></g>`}
  if(G.phase==='ask'&&G.q)G.q.opts.forEach((o,i)=>{if(!o.p)return;const on=UI.hoverAct&&UI.hoverAct.a==='Q'&&UI.hoverAct.i===i;h+=`<polygon points="${corners(o.p,o.b||40).map(p=>X(p.x)+','+Y(p.y)).join(' ')}" fill="none" stroke="#6df" stroke-width="${on?4:1.5}" stroke-dasharray="5 4" opacity="${on?1:.55}"/>`})
  svg.innerHTML=h}
// ---- input: every action goes through gameAct(ds, side) ----
function uiAct(ds){if(typeof isClient==='function'&&isClient()){// a client only sends its choice; the host checks it and runs it
    if(ds.ship&&!ds.act){if(G&&G.phase==='target'&&humanTurn()){const s2=ship(G.cur);const w=weaponsFor(s2).find(w=>w.k==='P'&&w.targets.some(t=>t.id===ds.ship))||weaponsFor(s2).find(w=>w.targets.some(t=>t.id===ds.ship));if(w){netSend({act:'fire',w:w.k,t:ds.ship});return}}if(G&&ship(ds.ship)){UI.sel=ds.ship;render()}return}
    netSend(ds);return}
  return gameAct(ds,(typeof NET!=='undefined'&&NET.on)?NET.mySide:sideToAct())}
function gameAct(ds,side){if(!G)return null;
  if(ds.act==='ask')return performMove({act:'ask',k:ds.k},side);
  if(ds.act==='damod')return performMove({act:'damod',k:ds.k},side);
  if(ds.ship&&!ds.act){const s=ship(ds.ship);if(!s)return;if(G.phase==='target'&&humanTurn()){const s2=ship(G.cur);const w=weaponsFor(s2).find(w=>w.k==='P'&&w.targets.some(t=>t.id===s.id))||weaponsFor(s2).find(w=>w.targets.some(t=>t.id===s.id));if(w)return performMove({act:'fire',w:w.k,t:s.id},side)}
    UI.sel=s.id;render();return null}
  if(ds.act==='action'){const mv={act:'action',a:ds.a2};if(ds.arg!=null)mv.arg=['TL','SL','SB'].includes(ds.a2)?ds.arg:+ds.arg;UI.hoverAct=null;return performMove(mv,side)}
  else if(ds.act==='fire'){return performMove(ds.w==='skip'?{act:'fire',w:'skip'}:{act:'fire',w:ds.w,t:ds.t},side)}
  else if(ds.act==='amod'||ds.act==='dmod'){return performMove({act:ds.act,k:ds.k},side)}
  else if(ds.act==='dials'){const ids=Object.keys(ds.dials);if(G.phase!=='plan'||!ids.every(id=>{const s=ship(id);return s&&s.alive&&s.side===side&&s.dial==null&&validMoves(side).some(v=>v.ship===id&&v.m===ds.dials[id])}))return {success:false};
    let r=null;for(const id of ids)r=performMove({act:'dial',ship:id,m:ds.dials[id]},side);return r}
  return null}
const ICON_PAUSE='<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><rect x="3" y="2" width="3.6" height="12" rx="1" fill="currentColor"/><rect x="9.4" y="2" width="3.6" height="12" rx="1" fill="currentColor"/></svg>',ICON_PLAY='<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M4 2l10 6-10 6z" fill="currentColor"/></svg>';
function toggleMenu(open){const m=$('more'),b=document.querySelector('[data-a="menu"]');if(!m)return;const on=open!=null?open:!m.classList.contains('open');m.classList.toggle('open',on);if(b)b.setAttribute('aria-expanded',String(on))}
document.addEventListener('click',e=>{const m=$('more');if(m&&m.classList.contains('open')&&!e.target.closest('[data-a="menu"]')&&(!e.target.closest('#more')||e.target.closest('button')))setTimeout(()=>toggleMenu(false),0)},true);
document.addEventListener('click',e=>{const t=e.target.closest('[data-a],[data-act],[data-dial],[data-sel],[data-start],[data-mode],[data-size],[data-lvl],[data-exk],[data-ship]');if(!t)return;const ds=t.dataset;if(t.disabled)return;sfx('click');
  if(ds.mode){UI.mode=ds.mode;render();return}if(ds.size){UI.size=ds.size;saveSetup();render();return}if(ds.lvl){UI.lvl=ds.lvl;saveSetup();render();return}
  if(ds.exk){UI.ex[ds.exk]=!UI.ex[ds.exk];FACTIONS.forEach((f,i)=>{if(f.ex&&!UI.ex[f.ex]&&UI.fac.includes(i))UI.fac=UI.fac.map(x=>x===i?(i===UI.fac[0]?0:1):x)});saveSetup();render();return}
  if(ds.start){startGame(ds.start);return}
  if(ds.a&&/^net/.test(ds.a)&&typeof netClick==='function'&&netClick(ds.a))return;
  if(ds.dial!=null){UI.draft[ds.ship]=+ds.dial;UI.hoverDial=null;const mine=alive().filter(s=>s.side===planSide());const nxt=mine.find(s=>UI.draft[s.id]==null);if(nxt&&ds.ship===UI.sel)UI.sel=nxt.id;render();return}
  if(ds.sel){UI.sel=ds.sel;render();return}
  if(ds.a==='lock'){const ps=planSide();const dials={};alive().filter(s=>s.side===ps).forEach(s=>dials[s.id]=UI.draft[s.id]);UI.pass=null;sfx('token');uiAct({act:'dials',dials});if(G&&G.phase==='plan'&&planSide()>=0)UI.pass=ps;render();return}
  if(ds.a==='autodial'){alive().filter(s=>s.side===planSide()).forEach(s=>UI.draft[s.id]=suggestDial(s));render();return}
  if(ds.a==='passok'){UI.pass=planSide();render();return}
  if(ds.a==='build'){UI.squads=UI.squads||[[],[]];UI.build=+ds.k;render();return}
  if(ds.a==='bdone'){UI.build=null;render();return}
  if(ds.a==='bclear'){UI.squads[UI.build]=[];saveSquads();render();return}
  if(ds.a==='brand'){UI.squads[UI.build]=randomSquad(UI.fac[UI.build],100,UI.ex).map(e=>({p:e.p,u:e.u.slice()}));saveSquads();render();return}
  if(ds.a==='rules'){UI.rules=true;render();return}if(ds.a==='close'){UI.rules=false;UI.stats=false;render();return}
  if(ds.a==='stats'){UI.stats=true;render();return}if(ds.a==='new'){UI.info=true;UI.stats=false;render();return}
  if(ds.a==='snd'){toggleSound();return}if(ds.a==='mus'){toggleMusic();return}if(ds.a==='top'){UI.top=!UI.top;camView(UI.top?'top':'tilt');return}
  if(ds.a==='hints'){UI.hints=!UI.hints;$('hintbtn').textContent=UI.hints?'💡 On':'💡 Off';render();return}
  if(ds.a==='pause'){UI.paused=!UI.paused;$('pausebtn').innerHTML=UI.paused?ICON_PLAY:ICON_PAUSE;$('pausebtn').setAttribute('aria-label',UI.paused?'Resume the computer':'Pause the computer');if(!UI.paused)schedule();return}
  if(ds.a==='gfx'){if(typeof cycleGfx==='function')cycleGfx();return}
  if(ds.a==='menu'){toggleMenu();return}
  if(ds.a==='legend'){const l=document.querySelector('.legend');if(l)l.classList.toggle('open');return}
  if(ds.a==='autoplace'){autoPlaceAll();return}
  if(ds.a==='advise'){UI.advOpen=!UI.advOpen;const b=document.querySelector('.na-adv');if(b)b.setAttribute('aria-expanded',String(UI.advOpen));render();return}
  if(ds.a==='nextround'){UI.sumSeen=G.round-1;if(guideMode()==='auto'&&!tourOff())LS.set('na_tour','1');UI.roadInfo=null;render();return}
  if(ds.a==='hold'){releaseHold();return}
  if(ds.a==='guide'){LS.set('na_guide',guided()?'light':'full');render();return}
  if(ds.a==='recapok'){UI.recapSeen=G.round-1;render();return}if(ds.a==='recapoff'){UI.recapSeen=G.round-1;LS.set('na_recap','off');render();return}
  if(ds.a==='tourskip'){LS.set('na_tour','1');UI.coachOn=null;render();return}
  if(ds.a==='sortie'){startGame('solo',+ds.k);return}
  if(ds.a==='speed'){const s=['slow','normal','fast'];UI.speed=s[(s.indexOf(UI.speed||'normal')+1)%3];AIDELAY={slow:1100,normal:600,fast:220}[UI.speed];$('speedbtn').textContent='⏩ '+UI.speed;return}
  if(ds.act){uiAct(Object.assign({},ds));return}
  if(ds.ship){uiAct({ship:ds.ship})}});
document.addEventListener('mouseover',e=>{if(window.PHN&&PHN.on)return;/* phone: previews come from taps (armed buttons, the dial pop-up), not from hover */const t=e.target.closest('[data-dial],[data-hov]');const nd=t&&t.dataset.dial!=null?+t.dataset.dial:null;const nh=t&&t.dataset.hov?{a:t.dataset.hov.split(':')[0],i:+t.dataset.hov.split(':')[1]}:null;
  if(nd!==UI.hoverDial||JSON.stringify(nh)!==JSON.stringify(UI.hoverAct)){UI.hoverDial=nd;UI.hoverAct=nh;if(V3.on)drawGuides();else render2D();const info=document.querySelector('.dialinfo .mvread');if(info&&G&&G.phase==='plan'&&UI.sel&&ship(UI.sel)){const s=ship(UI.sel);const di=nd!=null?nd:UI.draft[s.id];if(di!=null)info.innerHTML=moveRead(s,di)}}});
document.addEventListener('change',e=>{if(e.target.dataset.fac!=null){UI.fac[+e.target.dataset.fac]=+e.target.value;saveSetup()}});
document.addEventListener('keydown',e=>{if(e.target&&/INPUT|SELECT|TEXTAREA/.test(e.target.tagName))return;if(e.key==='Escape'){UI.rules=false;UI.stats=false;if(typeof NET!=='undefined'&&NET.on&&NET.inLobby)NET.lobbyMin=true;render();return}
  if(e.key==='p'||e.key==='P'){$('pausebtn').click();return}if(e.key==='t'||e.key==='T'){document.querySelector('[data-a="top"]').click();return}
  if(!G||G.winner||!humanTurn())return;const click=sel=>{const b=document.querySelector(sel);if(b&&!b.disabled){b.click();e.preventDefault()}};
  if(e.key==='Enter')click('#prompt .btn.primary');else if(e.key==='s'||e.key==='S')click('#prompt [data-a2="skip"],#prompt [data-w="skip"]');
  else if(/^[1-9]$/.test(e.key))click(`#prompt .acts button:nth-of-type(${e.key})`)});
function startGame(mode,sortie){if(typeof NET!=='undefined'&&NET.on)netLeave(true);UI.info=false;UI.stats=false;UI.draft={};UI.pass=null;UI.sel=null;UI.sugCache=null;UI.autoSetup=false;UI.advOpen=false;
  if(mode==='load'){const g=load();if(g){G=g;if(!['plan','over'].includes(G.phase)){G.phase='plan';G.step=1;alive().forEach(s=>s.dial=null);G.atk=null}refresh();return}}
  UI.mode=mode;const players=mode==='solo'?[{human:true},{human:false,lvl:UI.lvl}]:mode==='hot'?[{human:true},{human:true}]:[{human:false,lvl:UI.lvl},{human:false,lvl:UI.lvl}];
  const squads=customSquads();
  if(sortie!=null&&SORTIES[sortie]){const so=SORTIES[sortie];UI.mode='solo';
    newGame({fac:[0,1],players:[{human:true},{human:false,lvl:UI.lvl}],sizeK:so.size||'core',squads:so.sq?so.sq.map(sq=>sq.map(e=>({p:e.p,u:e.u.slice()}))):null,ex:Object.assign({},UI.ex,so.ex||{})});G.sortie=sortie}
  else{newGame({fac:UI.fac.slice(),players,sizeK:UI.size,squads,ex:Object.assign({},UI.ex)});if(mode==='solo'&&UI.fac[0]===0&&UI.fac[1]===1&&UI.size==='core'&&!squads)G.sortie=0}
  resetGuide();if(bothHuman())UI.pass=0;camView('tilt');render()}
// the squads built in the squad builder (battle size "custom"), checked; null = use the battle size's squads
function customSquads(){const custom=UI.size==='custom'&&UI.squads?UI.squads.map((sq,k)=>sq&&sq.length&&sq.every(e=>PILOTS[e.p]&&factionPilots(UI.fac[k],UI.ex).includes(e.p))&&squadCost(sq.map(e=>({p:e.p,u:e.u.filter(Boolean)})))<=100?sq.map(e=>({p:e.p,u:e.u.filter(Boolean)})):null):null;
  return custom&&(custom[0]||custom[1])?[custom[0]||randomSquad(UI.fac[0],100,UI.ex),custom[1]||randomSquad(UI.fac[1],100,UI.ex)]:null}
// ---- squad builder: add pilots, pick upgrades per slot, live points and unique checks ----
try{const q=JSON.parse(localStorage.getItem('na_squads')||'null');if(q)UI.squads=q}catch(e){}
function slotsOf(e){const P=PILOTS[e.p];const out=P.u.slice();(e.u||[]).forEach(u=>{const U=UPGRADES[u];if(U&&U.addSlot)out.push(U.addSlot)});return out}
function usedNames(sq,skip){const n=new Set();sq.forEach((e,i)=>{if(PILOTS[e.p].uniq&&i!==skip)n.add(uname(PILOTS[e.p]));(e.u||[]).forEach(u=>{if(u&&UPGRADES[u].uniq)n.add(uname(UPGRADES[u]))})});return n}
function builderHTML(){const k=UI.build,f=UI.fac[k],sq=UI.squads[k];const cost=squadCost(sq.map(e=>({p:e.p,u:e.u.filter(Boolean)})));const used=usedNames(sq);
  const byShip={};factionPilots(f,UI.ex).forEach(pk=>{(byShip[PILOTS[pk].ship]=byShip[PILOTS[pk].ship]||[]).push(pk)});
  const list=sq.map((e,i)=>{const P=PILOTS[e.p];const slots=slotsOf(e);return `<div class="card"><b>${esc(P.n)}</b> <span class="muted">${esc(SHIPS[P.ship].n)} · PS ${P.ps} · ${pilotCost({p:e.p,u:e.u.filter(Boolean)})} pts</span> <button class="btn ghost" data-bdel="${i}" aria-label="Remove">✕</button>
    <div class="row">${slots.map((sl,j)=>{const opts=upgradesFor(e.p,UI.ex).filter(u=>UPGRADES[u].slot===sl);if(!opts.length)return '';return `<label class="small">${esc(SLOTN[sl]||sl)} <select data-bslot="${i}:${j}"><option value="">none</option>${opts.map(u=>`<option value="${u}" ${e.u[j]===u?'selected':''} ${UPGRADES[u].uniq&&used.has(uname(UPGRADES[u]))&&e.u[j]!==u?'disabled':''}>${esc(UPGRADES[u].n)} (${UPGRADES[u].pts})</option>`).join('')}</select></label>`}).join('')}</div></div>`}).join('')||'<p class="muted">No ships yet: add pilots below.</p>';
  return `<div class="bld"><p><b class="${cost>100?'bad':''}">${cost} / 100 points</b>${cost>100?' · over the limit!':''}</p>${list}
   <h3>Add a pilot</h3>${Object.keys(byShip).map(t=>`<p class="small"><b>${esc(SHIPS[t].n)}</b><br>${byShip[t].sort((a,b)=>PILOTS[b].ps-PILOTS[a].ps).map(pk=>`<button class="btn tab" data-badd="${pk}" ${PILOTS[pk].uniq&&used.has(uname(PILOTS[pk]))?'disabled':''} title="${esc(PILOTS[pk].t||'No special ability')}">${esc(PILOTS[pk].n)} ${PILOTS[pk].ps}·${PILOTS[pk].pts}</button>`).join(' ')}</p>`).join('')}
   <div class="acts"><button class="btn primary" data-a="bdone" ${cost>100||!sq.length?'disabled':''}>Done</button><button class="btn" data-a="brand">Randomize</button><button class="btn" data-a="bclear">Clear</button></div></div>`}
function saveSquads(){try{localStorage.setItem('na_squads',JSON.stringify(UI.squads))}catch(e){}}
document.addEventListener('click',e=>{const t=e.target.closest('[data-badd],[data-bdel]');if(!t||UI.build==null)return;const sq=UI.squads[UI.build];
  if(t.dataset.badd){sq.push({p:t.dataset.badd,u:[]})}else sq.splice(+t.dataset.bdel,1);saveSquads();render()});
document.addEventListener('change',e=>{const b=e.target.dataset.bslot;if(!b||UI.build==null)return;const [i,j]=b.split(':').map(Number);const en=UI.squads[UI.build][i];en.u[j]=e.target.value||null;en.u.length=Math.min(en.u.length,slotsOf(en).length);saveSquads();render()});
const SAVE='na_save';
function save(){try{if(G&&!(typeof NET!=='undefined'&&NET.on)&&G.phase==='plan')localStorage.setItem(SAVE,JSON.stringify(G))}catch(e){}}
function load(){try{const s=localStorage.getItem(SAVE);const g=s?JSON.parse(s):null;return g&&g.v===2?g:null}catch(e){return null}}// saves from older rules versions are ignored
const _refresh=refresh;refresh=function(){_refresh();save()};
if(typeof GX!=='undefined'){GX.init({key:'na'});GX.drawer('d-squads','Squads',$('roster'),true);GX.drawer('d-log','Battle log',$('log'));GX.drawer('d-build','Squad builder',$('bbody'),true);
  GX.onClose=id=>{if(id==='d-build'&&UI.build!=null){UI.build=null;render()}}}
render();
window.addEventListener('load',()=>{soundBtns();if(!init3D())document.body.classList.add('flat');if(typeof gfxLabel==='function')gfxLabel();render()});
