// ===================== tbl.js: the table (board-first view) =====================
// The whole screen is the table: a fuse that burns down, the crew's stands as rows of wire tiles, equipment cards on the felt and
// my own stand along the bottom edge. Every action is a tap or a drag on a piece: glowing pieces are the legal ones.
// Text: one status line of 8 words or fewer; everything else is shown (glows, coins, flips, sparks, a ghost finger).
const TBL={fxq:[],lay:null,sig:'',ann:null,drag:null,sayT:0,ghostSig:'',tray:'',lastG:null,vsig:''};
const TOKC={n:'b',y:'y',p:'p',c:'c',f:'f'};
function tokInfo(t){if(!t)return null;if(t.t==='n')return t.v==='Y'?{c:'y',s:'Y'}:{c:'b',s:String(t.v)};if(t.t==='y')return {c:'y',s:'Y'};
  if(t.t==='p')return {c:'p',s:t.v==='e'?'E':'O'};if(t.t==='c')return {c:'c',s:'×'+t.v};if(t.t==='f')return {c:'f',s:'≠'+(t.v==='Y'?'Y':t.v)};return null}
// ---------- what glows ----------
// returns {u:Map(uid -> kind), plates:Set(seat), solo:Set(value)}; kinds: val (a number I can say), solo (a solo cut), tgt (a wire to point at), opt (an answer), flip (my face-down wire), rev (reveal)
function glowInfo(V){const g={u:new Map(),plates:new Set()};
  if(!V||V.seat<0||G.over||UI.brief||passTo()>=0||UI.paused)return g;
  const me=V.seat,sel=UI.sel,L=V.legal;const add=(u,k)=>{if(u!=null&&!g.u.has(u))g.u.set(u,k)};const addSK=(si,k,kind)=>{const sl=G.st[si]&&G.st[si].w[k];if(sl)add(sl.u,kind)};
  if(V.q&&V.q.who===me&&V.q.opts){const q=V.q;if(q.kind==='designate'){for(const o of q.opts)if(o.d&&o.d.seat!=null)g.plates.add(o.d.seat);return g}
    for(const o of q.opts){const d=o.d||{};if(d.u!=null)add(d.u,'opt');else if(d.st!=null&&d.k!=null)addSK(d.st,d.k,'opt')}return g}
  if(sel&&sel.mode==='choose'){const step=nextStep(sel);if(step&&step.board){for(const m of selRemaining(sel))addSK(m[step.board[0]],m[step.board[1]],'tgt')}
    else if(step&&(step.key==='who'||step.key==='to'||step.key==='next')){for(const m of selRemaining(sel)){const v=m[step.key];(Array.isArray(v)?v:[v]).forEach(s=>g.plates.add(s))}}
    for(const t of sel.picked||[])addSK(t.s,t.k,'tgt');return g}
  if(sel&&sel.mode==='multi'){for(const st of V.stands)st.slots.forEach(x=>{if(!x.cut)add(x.u,'tgt')});return g}
  if(!L)return g;
  const own=V.stands.filter(st=>st.mine);const mineSlots=[];own.forEach(st=>st.slots.forEach((x,k)=>mineSlots.push({st:st.i,k,x})));
  if(sel&&sel.mode==='flipown'){for(const m of L.flip)add(m.fu,'flip');return g}
  if(sel&&sel.mode==='dual'){
    if(sel.tg.length){const t0=sel.tg[0];const need=toolN(sel.tool);
      if(sel.tool==='eq5'){}else if(need>sel.tg.length)for(const m of L.plain)if(m.st===t0.st)addSK(m.st,m.ks[0],'tgt');
      for(const t of sel.tg)add(G.st[t.st].w[t.k].u,'sel');
      const full=sel.tool==='eq5'||need<=sel.tg.length;
      if(full){const vs=dualVals(sel).filter(v=>v!==sel.v||!sel.two);const pick=sel.two&&sel.v!=null?vs.filter(v=>v!==sel.v):vs;
        for(const m of mineSlots)if(!m.x.cut&&m.x.v!=null&&!m.x.flip&&pick.includes(m.x.v))add(m.x.u,'val')}
      return g}
    if(sel.v!=null){for(const m of (sel.fu!=null?L.flip:L.plain))if((m.v===sel.v||sel.fu!=null)&&(sel.fu==null||m.fu===sel.fu))addSK(m.st,m.ks[0],'tgt');
      for(const m of mineSlots)if(m.x.v===sel.v&&!m.x.cut)add(m.x.u,'sel');return g}
    if(sel.fu!=null){for(const m of L.flip)if(m.fu===sel.fu)addSK(m.st,m.ks[0],'tgt');add(sel.fu,'sel');return g}
    if(sel.tool||sel.two){for(const m of L.plain)addSK(m.st,m.ks[0],'tgt');return g}}
  // nothing chosen yet: crew wires I can point at, my numbers I can say, my solo cuts, my reveal
  for(const m of L.plain)addSK(m.st,m.ks[0],'tgt');
  const vals=new Set(L.plain.map(m=>m.v)),solos=new Set(L.solo.filter(m=>!m.flip).map(m=>m.v));
  for(const m of mineSlots){const x=m.x;if(x.cut||x.v==null||x.flip)continue;if(solos.has(x.v))add(x.u,'solo');else if(vals.has(x.v))add(x.u,'val')}
  if(L.flip.length||L.solo.some(m=>m.flip))for(const m of mineSlots)if(m.x.flip&&!m.x.cut)add(m.x.u,'flip');
  if(L.other.some(m=>m.a==='reveal'))for(const m of mineSlots)if(!m.x.cut)add(m.x.u,'rev');
  return g}
// ---------- tiles ----------
function tileHTML(x,si,k,mine,g){const known=x.v!=null;const col=known?(x.c==='r'?'r':x.c==='y'?'y':'b'):'';
  const gk=g.u.get(x.u);let cls='tile '+(mine?'mine':'crew')+(known?' known '+col:' back')+(x.cut?' cut':'')+(x.flip?' flip':'')+(x.x?' xw':'')+(gk&&gk!=='sel'?' glow g-'+gk:'')+(gk==='sel'?' sel':'');
  const face=known?(x.c==='r'?'R':x.c==='y'?'Y':String(x.v)):(mine&&!x.cut?'?':'');
  const small=known&&x.c!=='b'&&x.s!=null?`<small>${esc(String(x.s))}</small>`:'';
  const toks=(x.tok||[]).map(tokInfo).filter(Boolean).slice(0,2).map(t=>`<i class="coin c-${t.c}">${esc(t.s)}</i>`).join('');
  const not=(x.not||[]).length?`<em class="nt">≠${esc((x.not||[]).slice(0,3).map(VNm).map(s=>s==='yellow'?'Y':s).join(','))}</em>`:'';
  const lab=(mine?'Your wire ':'Wire ')+LET(k)+(known&&x.v!=null&&(mine||x.cut)?', '+VNm(x.v):'')+(x.cut?', cut':'');
  const attrs=`data-s="${si}" data-k="${k}" data-u="${x.u}" aria-label="${esc(lab)}"`;
  const inner=`<span class="f">${esc(face)}</span>${small}${not}${toks}<span class="wr"></span>`;
  return gk&&gk!=='sel'?`<button class="${cls}" ${attrs}>${inner}</button>`:`<div class="${cls}" ${attrs}>${inner}</div>`}
function sideHTML(st){if(!st.side||!st.side.length)return '';return `<span class="side">${st.side.map(t=>`<i class="coin c-${t.t==='y'||t.v==='Y'?'y':'b'}${t.mean==='none'?' no':''}">${t.v==='Y'?'Y':esc(t.v)}</i>`).join('')}</span>`}
function standHTML(V,st,mine,g){return `<div class="stand${mine?' mine':''}" data-st="${st.i}">${st.slots.map((x,k)=>tileHTML(x,st.i,k,mine,g)).join('')}${sideHTML(st)}</div>`}
function plateHTML(V,q,mine,g){const cur=!G.over&&decider()===q.i;const ox=V.ms.oxygen?`<u class="ox">O₂${q.ox}</u>`:'';const con=q.con&&!V.ms.mole?`<u class="cn${q.conDown?' dn':''}">${esc(q.con)}</u>`:'';
  const gl=g.plates.has(q.i);const star=q.i===G.captain?'<span class="star" title="Foreman">★</span>':'';
  const tool=q.ch&&ITEMS[CHARS[q.ch].item]?`<u class="tl${q.chUsed?' used':''}" title="${esc(ITEMS[CHARS[q.ch].item].n)}"></u>`:'';
  const tag=gl?'button':'div';
  return `<${tag} class="plate${cur?' cur':''}${gl?' glow g-plate':''}${q.nUncut?'':' out'}${mine?' mine':''}" data-seat="${q.i}" style="--sc:${SEATC[posOf(q.i)%5]}"><i class="pdot"></i><b>${esc(mine&&modeOf()==='solo'?'You':q.nm)}</b>${star}${q.human?'':ico('robot','pbot')}<em>${q.nUncut}</em>${tool}${con}${ox}</${tag}>`}
function crewOrder(V){const me=V.seat>=0?V.seat:kitMe();const o=[];for(let j=1;j<G.np;j++)o.push(G.pos.indexOf((posOf(me)+j)%G.np));return V.seat>=0?o:(function(){const a=[];for(let p=0;p<G.np;p++)a.push(G.pos.indexOf(p));return a})()}
// ---------- the fuse ----------
function fuseTotal(){if(G.dial==null)return G.ms.robotFuse?12:0;const M=MISSIONS[G.mission];let st=M.dial==='players'?G.np:M.dial==='players+1'?Math.min(DIAL_MAX,G.np+1):M.dial;if(G.twist&&G.twist.id==='short-fuse')st-=G.twist.param||1;st=Math.max(1,st);UI.fuseMax=Math.max(UI.fuseMax||0,st,G.dial);if(UI.fuseG!==G.seed+':'+G.mission){UI.fuseG=G.seed+':'+G.mission;UI.fuseMax=Math.max(st,G.dial)}return UI.fuseMax}
function fuseHTML(){const tot=fuseTotal();if(!tot)return '';const left=G.dial!=null?G.dial:Math.max(0,12-(G.ms.robotFuse?G.ms.robotFuse.at:0));const burnt=Math.max(0,Math.min(tot,tot-left));
  let seg='';for(let i=0;i<tot;i++)seg+=`<i class="${i<burnt?'ash':'rope'}${i===burnt?' next':''}"></i>`;
  return `<div class="fz${left<=1?' danger':''}" data-left="${left}" data-tot="${tot}"><span class="lit">${ico('fuse')}</span><div class="rp">${seg}<b class="spark" style="left:${(burnt/tot*100).toFixed(1)}%"></b></div><svg class="bm" viewBox="0 0 24 24" width="26" height="26">${ICO.bomb}</svg></div>`}
function trackHTML(V){if(V.validOff)return '';let h='';for(let v=1;v<=12;v++){if(V.blueMax&&v>V.blueMax)break;const done=V.valid.includes(v);h+=`<i class="cn12${done?' done':''}">${done?'✓':v}</i>`}return `<div class="trk">${h}</div>`}
function cutCountHTML(V){const tot=G.st.reduce((a,s)=>a+s.w.length,0),cut=G.st.reduce((a,s)=>a+s.w.filter(x=>x.cut).length,0);return `<div class="cc"><b>${cut}</b>/${tot}</div>`}
function clockHTML(V){const c=timedJob()?clockLeft(V):null;if(!c)return '';return `<div class="clk${c.real<30?' low':''}" id="timerpill">${ico('clock')}<span>${fmt(c.left)}${UI.pause?' ⏸':''}</span></div>`}
// ---------- the felt: gear cards and job chips ----------
function eqMovesFor(V,id){if(V.seat<0||G.over)return [];let ms=[];try{ms=validMoves(V.seat).filter(m=>m.a==='eq'&&m.id===id)}catch(e){}return ms}
function gearHTML(V){let h='';
  if(!noGear())V.eq.forEach((e,i)=>{if(e.down||!e.id){h+=`<div class="eqk lk" data-gx="geard"><b>?</b><span class="en">Face down</span></div>`;return}
    const E=EQUIP[e.id];const ms=e.st==='ready'?eqMovesFor(V,e.id):[];const gl=ms.length>0;const need=E.need===4?'4×':'2×';
    const badge=`<b>${E.v==='Y'?'Y':E.v}</b>`;
    const st=e.st==='locked'?`<i class="lkc">${ico('lock')}</i><span class="nd">${need}${E.v==='Y'?'Y':E.v}</span>`:'';
    const nm=E.n.replace(/ Probe$/,' Pr.');
    h+=gl?`<button class="eqk ${e.st} glow g-eq" data-eq="${e.id}" aria-label="${esc(E.n)}">${badge}<span class="en">${esc(nm)}</span></button>`:`<div class="eqk ${e.st}" data-gx="geard" role="button" tabindex="0" aria-label="${esc(E.n)}, ${e.st}">${badge}<span class="en">${esc(nm)}</span>${st}</div>`});
  const mc=missionCards(V);
  if(mc.numbers.length)h+=`<div class="jc nums" data-gx="missiond" role="button" tabindex="0" aria-label="Number cards">${mc.numbers.map((c,i)=>`<i class="nc${c.done?' dn':''}${mc.sequence&&mc.sequence.at===i?' cur':''}">${esc(c.value)}</i>`).join('')}</div>`;
  for(const c of mc.constraints)if(c.seat==null)h+=`<div class="jc cn" data-gx="missiond" role="button" tabindex="0" aria-label="Rule card"><u>${esc(c.letter)}</u></div>`;
  if(mc.challenges.length)h+=`<div class="jc chl" data-gx="missiond" role="button" tabindex="0" aria-label="Dares">${mc.challenges.map(c=>`<i class="nc${c.done?' dn':''}">${c.n}</i>`).join('')}</div>`;
  const ms=V.ms;
  if(ms.robotPatrol)h+=`<div class="jc rb" data-gx="missiond" role="button" tabindex="0" aria-label="Robot">${ico('robot')}<b>${ms.robotPatrol.at}</b></div>`;
  if(ms.robotLine&&ms.robotLine.line)h+=`<div class="jc rb" data-gx="missiond" role="button" tabindex="0" aria-label="Robot">${ico('robot')}<b>${ms.robotLine.line[ms.robotLine.at]}</b></div>`;
  if(V.robot)h+=`<div class="jc rb" data-gx="missiond" role="button" tabindex="0" aria-label="Robot">${ico('robot')}<b>${V.robot.n}</b></div>`;
  if(ms.oxygen)h+=`<div class="jc ox" data-gx="missiond" role="button" tabindex="0" aria-label="Oxygen">${ico('bubble')}<b>${ms.oxygen.res}</b></div>`;
  if(ms.bunker)h+=`<div class="jc bk" data-gx="missiond" role="button" tabindex="0" aria-label="Bunker floor">${ico('map')}<b>${(ms.bunker.f||0)+1}</b></div>`;
  const M=V.markers||{};if(!V.validOff&&((M.red||[]).length||(M.yel||[]).length))h+=`<div class="jc mk" data-gx="missiond" role="button" tabindex="0" aria-label="Candidate wires">${(M.red||[]).map(s=>`<i class="mkr r">${esc(s)}</i>`).join('')}${(M.yel||[]).map(s=>`<i class="mkr y">${esc(s)}</i>`).join('')}</div>`;
  return h}
// ---------- the tray: answers that are not wires ----------
function shortOpt(l){let s=String(l||'');s=s.replace(/^Take /,'').replace(/ - .*$/,'').replace(/\s*\(.*\)\s*$/,'');const w=s.split(/\s+/);return w.length>6?w.slice(0,6).join(' ')+'…':s}
function chipLabelOpt(o,q){const d=o.d||{};if(q.kind==='draftCon'&&d.c&&CONSTRAINTS[d.c])return d.c+' '+CONSTRAINTS[d.c].n;return shortOpt(nice(o.l,UI.V))}
function trayItems(V){const items=[];const me=V.seat;if(me<0||G.over||UI.brief||passTo()>=0)return items;const sel=UI.sel;const L=V.legal;
  const grp=(moves,off)=>{const gs={};for(const m of moves){const k=moveKey(m);(gs[k]=gs[k]||[]).push(m)}return Object.keys(gs).map(k=>({k,ms:gs[k],off}))};
  if(V.q&&V.q.who===me&&V.q.opts){const q=V.q;if(q.kind==='designate')return items;
    q.opts.forEach((o,i)=>{const d=o.d||{};if(d.u!=null||(d.st!=null&&d.k!=null))return;items.push({t:'q',i,label:chipLabelOpt(o,q)})});return items}
  if(sel&&sel.mode==='choose'){const step=nextStep(sel);const rem=selRemaining(sel);const m0=sel.opts[0];
    if(step&&step.key&&!(step.key==='who'||step.key==='to'||step.key==='next')){const vals=[...new Set(rem.map(m=>JSON.stringify(m[step.key])))].map(x=>JSON.parse(x));vals.forEach(v=>items.push({t:'param',key:step.key,v,label:paramLabel(step.key,v,m0,V)}))}
    else if(!step&&rem.length>1)rem.forEach((m,i)=>items.push({t:'pick',i,label:shortOpt(nice(describeMove(m),V))}));
    items.push({t:'cancel',label:'✕'});return items}
  if(sel&&sel.mode==='multi'){items.push({t:'cancel',label:'✕'});return items}
  if(sel&&sel.mode==='flipown'){items.push({t:'cancel',label:'✕'});return items}
  if(L&&decider()===me){
    for(const m of L.special)items.push({t:'multi',kind:m.kind,n:m.tg.length,label:multiName(m.kind)});
    for(const g of grp(L.other.filter(m=>m.a!=='reveal'&&m.a!=='eq'&&!(noGear()&&m.a==='item')),false))items.push({t:'grp',k:g.k,label:keyName(g.ms[0])});
    const T=L.tools;const toolOn=t=>sel&&sel.tool===t;
    for(const t of ['dd','pt3','eq3','eq5'])if(T[t])items.push({t:'tool',tool:t,on:toolOn(t),label:toolName(t),mine:1});
    for(const t of ['pt10','eq10'])if(T[t])items.push({t:'two',tool:t,on:sel&&sel.two===t,label:toolName(t),mine:1});
    if(sel)items.push({t:'cancel',label:'✕',mine:1})}
  // any-time and rule moves for the waiting seat (claim, snip ...)
  const off=(V.off||[]);if(off.length)off.forEach((m,i)=>{if(!(noGear()&&(m.a==='eq'||m.a==='item')))items.push({t:'off',i,label:keyName(m),go:m.a==='claim'||m.a==='snip'})});
  if(!L||decider()!==me){let any=[];try{any=validMoves(me).filter(m=>m.a==='item')}catch(e){}for(const g of grp(any,true))if(!noGear())items.push({t:'grp',k:g.k,off:true,label:keyName(g.ms[0])})}
  else{let any=[];try{any=L.other.filter(m=>m.a==='item')}catch(e){}}
  return items}
function trayHTML(V,items,mineSide){return items.map((it,n)=>{if(!!it.mine!==!!mineSide)return '';const cls='chip'+(mineSide?' sm':'')+(it.t==='cancel'?' x':'')+(it.on?' on':'')+(it.go?' go':'')+(it.t==='q'||it.t==='param'||it.t==='pick'||it.t==='off'||it.t==='grp'||it.t==='multi'?' glow g-chip':'');
  return `<button class="${cls}" data-chip="${n}">${esc(it.label)}</button>`}).join('')}
// ---------- the status line (8 words or fewer) ----------
function sayText(V){if(!G)return '';if(G.over)return G.over.win?'Defused!':'BOOM!';if(UI.brief)return 'Ready?';const p=passTo();if(p>=0)return 'Pass the phone';
  const me=V.seat,s=decider();
  if(me<0)return s>=0?nm(s)+(G.q?' is choosing':' is thinking'):'Watching the crew';
  if(V.q&&V.q.who===me&&V.q.opts)return ({infoStd:'Tap one of your wires',tagPick:'Tag a wire',pickMatch:'Which wire is cut?',swapPick:'Pick a wire to give',designate:'Who must cut?',declare:'Turn a card',infoNeg:'Pick a number you lack',infoFalse:'Tag a wire with a lie',lackTag:'Tag one of your wires',draftCon:'Pick your rule',robotStand:'Which stand?',leakStand:'Which stand?',bkMove:'Where to?'})[V.q.kind]||shortOpt(nice(V.q.title,V));
  const sel=UI.sel;
  if(sel&&sel.mode==='choose'){const st=nextStep(sel);return st&&st.board?'Tap a glowing wire':st&&(st.key==='who'||st.key==='to'||st.key==='next')?'Tap a player':'Pick one'}
  if(sel&&sel.mode==='multi')return sel.n-sel.tg.length>0?`Tap ${sel.n-sel.tg.length} more wire${sel.n-sel.tg.length>1?'s':''}`:'Ready';
  if(sel&&sel.mode==='flipown')return 'Tap your face-down wire';
  if(V.legal&&s===me){
    if(sel&&sel.mode==='dual'){if(sel.tg.length){const need=toolN(sel.tool);if(need>sel.tg.length&&need!==99)return `Tap ${need-sel.tg.length} more wire${need-sel.tg.length>1?'s':''}`;return sel.two&&sel.v!=null?'Pick a second number':'Tap your number'}
      if(sel.v!=null)return 'Tap a glowing wire';if(sel.tool||sel.two)return sel.two?'Tap a wire':'Tap '+toolN(sel.tool)+' wires'}
    if(!V.legal.plain.length&&!V.legal.flip.length&&V.legal.solo.length)return 'Tap your glowing wires';
    return 'Tap a glowing wire'}
  if(s>=0&&s!==me)return isHuman(s)?nm(s)+"'s turn":nm(s)+(G.q?' is choosing':' is thinking');
  if(G.step==='claim')return 'Claim the turn!';if(G.step==='snip')return 'Call it?';return 'Wait a moment'}
function setSay(t,hold){const el=document.getElementById('say');if(!el)return;if(hold){TBL.sayT=Date.now()+hold;el.textContent=t;el.classList.add('flash');setTimeout(()=>el.classList.remove('flash'),hold);return}if(Date.now()<TBL.sayT)return;el.textContent=t}
function toast(t){setSay(String(t).split(/\s+/).slice(0,8).join(' '),1700);const l=document.getElementById('live');if(l)l.textContent=t}
// ---------- the whole table ----------
function renderTable(V){if(!G)return;const tb=document.getElementById('tb');if(!tb)return;
  const g=glowInfo(V);TBL.lastG=g;const me=V.seat>=0?V.seat:-1;
  // crew
  const order=crewOrder(V);let crew='';
  for(const s of order){const q=V.seats[s];const sts=V.stands.filter(st=>st.owner===s).sort((a,b)=>a.i-b.i);if(!sts.length)continue;
    crew+=`<div class="sg${decider()===s&&!G.over?' cur':''}${q.nUncut?'':' out'}" data-seat="${s}" style="--sc:${SEATC[posOf(s)%5]}">${plateHTML(V,q,false,g)}${sts.map(st=>standHTML(V,st,false,g)).join('')}</div>`}
  // mine
  let mine='';if(me>=0){const sts=V.stands.filter(st=>st.owner===me).sort((a,b)=>a.i-b.i);const q=V.seats[me];
    const T=V.legal?V.legal.tools:{};const toolBtns=[];
    mine=`<div class="sg me${decider()===me&&!G.over?' cur':''}" style="--sc:${SEATC[posOf(me)%5]}"><div class="mh">${plateHTML(V,q,true,g)}@@MC@@</div>${sts.map(st=>standHTML(V,st,true,g)).join('')}</div>`}
  const items=trayItems(V);TBL.items=items;mine=mine.replace('@@MC@@',trayHTML(V,items,true));
  const set=(id,h,sig)=>{const el=document.getElementById(id);if(!el)return el;if(sig===undefined)sig=h;if(el._s!==sig){el._s=sig;el.innerHTML=h}return el};
  set('fuse',fuseHTML(),fuseHTML());set('cutc',cutCountHTML(V));set('track',trackHTML(V));set('clk',clockHTML(V));
  set('gear',gearHTML(V));set('crew',crew);set('mine',mine);
  const trh=trayHTML(V,items,false);const tr=set('tray',trh);tr.classList.toggle('on',trh.length>0);
  tb.classList.toggle('over',!!G.over);tb.classList.toggle('mineon',!!mine);tb.classList.toggle('dng',G.dial!=null&&G.dial<=1&&!G.over);
  setSay(sayText(V));
  renderOverlays(V);
  layoutTable();flushFx();placeGhost(V)}
// tile sizes: as large as fit; stands wrap to more rows rather than shrink below a thumb
function fitSize(counts,W,H,o){const g=o.gap;const ratio=o.ratio;let best=null;
  for(let tw=o.max;tw>=o.min;tw--){const cols=Math.max(1,Math.floor((W+g)/(tw+g)));const th=Math.round(tw*ratio);let h=0,rows=0;
    for(const grp of counts){h+=o.plate+o.seatGap;for(const n of grp){const r=Math.ceil(Math.max(1,n)/cols);rows+=r;h+=r*(th+g)}}
    if(h<=H+1&&(!best||rows<best.rows))best={tw,rows}}
  return best?best.tw:o.min}
function balance(root,tw,g){root.querySelectorAll('.stand').forEach(st=>{const n=st.querySelectorAll('.tile').length;const side=st.querySelector('.side');const W=st.parentNode.clientWidth||st.clientWidth;const maxc=Math.max(1,Math.floor((W+g)/(tw+g)));const rows=Math.ceil(n/maxc);const cols=Math.max(1,Math.ceil(n/Math.max(1,rows)));st.style.maxWidth=(cols*(tw+g)+(side?44:0))+'px'})}
function layoutTable(){const tb=document.getElementById('tb');if(!tb||!G)return;const W=tb.clientWidth,H=tb.clientHeight;if(W<50||H<50)return;
  const crew=document.getElementById('crew'),mine=document.getElementById('mine'),felt=document.getElementById('felt'),gear=document.getElementById('gear');
  document.documentElement.classList.toggle('short',window.innerHeight<640);
  const land=W>H*1.15&&W>=600;tb.classList.toggle('land',land);
  const plate=window.innerHeight<640?20:24;
  const cs=[...crew.querySelectorAll('.sg')].map(s=>[...s.querySelectorAll('.stand')].map(st=>st.querySelectorAll('.tile').length));
  const ms=[...mine.querySelectorAll('.stand')].map(st=>st.querySelectorAll('.tile').length);
  const used0=[...tb.children].filter(e=>e!==felt&&e!==mine&&getComputedStyle(e).position!=='absolute'&&!e.hidden).reduce((a,e)=>a+e.offsetHeight,0);
  const gh=gear.offsetHeight,cw=W-12;const maxM=land?52:60;
  const crewFit=ch=>{if(land&&cs.length>1){const half=Math.ceil(cs.length/2);return Math.min(fitSize(cs.slice(0,half),(cw-10)/2,ch,{gap:3,ratio:1.3,min:22,max:54,plate,seatGap:6}),fitSize(cs.slice(half),(cw-10)/2,ch,{gap:3,ratio:1.3,min:22,max:54,plate,seatGap:6}))}
    return fitSize(cs,cw,ch,{gap:3,ratio:1.3,min:22,max:land?54:56,plate,seatGap:6})};
  const setMine=tw=>{mine.style.setProperty('--tw',tw+'px');mine.style.setProperty('--th',Math.round(tw*1.32)+'px');balance(mine,tw,4)};
  let tm=0,t1=0;crew.classList.toggle('two',land&&cs.length>1);
  if(ms.length){mine.style.maxHeight='';mine.style.overflow='';
    // my stand first, as big as it can be while the crew keeps a tile a thumb can still tap
    const capC=Math.min(40,crewFit(1e4));let pick=30;
    for(let tw=maxM;tw>=30;tw-=2){setMine(tw);const hm=mine.offsetHeight;const ch=H-used0-hm-gh;if(hm>H*(land?.5:.34))continue;const c=crewFit(ch);if(c>=capC){pick=tw;break}pick=tw}
    setMine(pick);tm=pick}
  const used=used0+(ms.length?mine.offsetHeight:0);
  const ch=Math.max(40,H-used-gh);t1=crewFit(ch);
  for(let i=0;i<24;i++){crew.style.setProperty('--tw',t1+'px');crew.style.setProperty('--th',Math.round(t1*1.3)+'px');balance(crew,t1,3);if(crew.scrollHeight<=crew.clientHeight+1||t1<=22)break;t1-=1}
  crew.classList.toggle('tn',t1<30);mine.classList.toggle('tn',tm<30);
  TBL.lay={W,H,tw:t1,tm};
  placeGhost(UI.V)}
// ---------- overlays: briefing, pass-the-phone, the end ----------
function renderOverlays(V){const ov=document.getElementById('over'),cv=document.getElementById('cover');if(!ov||!cv)return;
  const p=G.over?-1:passTo();
  if(UI.brief&&!G.over){const n=G.mission,M=MISSIONS[n];const chips=ruleChips(n).slice(0,4);cv.hidden=false;
    const h=`<div class="card2 briefc"><div class="bn">${n}</div><h2>${esc(M.nm)}</h2><div class="bch">${chips.map(c=>`<span class="rc">${ico(c[0])}<b>${esc(c[1])}</b></span>`).join('')}</div><button class="big go" data-a="briefok">Go</button></div>`;if(cv._s!==h){cv._s=h;cv.innerHTML=paintHTML(h)}}
  else if(p>=0){cv.hidden=false;const h=`<div class="card2 pass"><h2>${esc(nm(p))}</h2><button class="big go" data-a="take" data-seat="${p}">${ico('eye')}I am ${esc(nm(p))}</button></div>`;if(cv._s!==h){cv._s=h;cv.innerHTML=h}}
  else{cv.hidden=true;cv._s=''}
  if(G.over){if(UI.camp&&UI.campShown){ov.hidden=true}else{ov.hidden=false;const w=!!G.over.win;const next=G.mission<66?G.mission+1:null;const why=w?'':overWhy(G.over.why);
    const h=`<div class="card2 end ${w?'win':'lose'}"><h2>${w?'DEFUSED!':'BOOM!'}</h2>${why?`<p>${esc(why)}</p>`:''}${isClient()?'<p>Wait for the host</p>':`<div class="row">${w&&next&&!UI.camp?`<button class="big go" data-a="next">${ico('fwd')}Next job</button>`:''}<button class="big${w&&next&&!UI.camp?'':' go'}" data-a="again">${ico('flip')}Again</button><button class="big" data-a="board">${ico('map')}Jobs</button></div>`}</div>`;
    if(ov._s!==h){ov._s=h;ov.innerHTML=h}}}
  else{ov.hidden=true;ov._s=''}}
function paintHTML(h){return h}
function overWhy(w){w=String(w||'');if(/fuse|step|burn/i.test(w))return 'The fuse ran out';if(/red/i.test(w))return 'A red wire was cut';return w.split(/\s+/).slice(0,6).join(' ')}
// ---------- effects ----------
// diffFx() queues effects; they are played right after the DOM was rebuilt
function fx(name,arg){TBL.fxq.push([name,arg])}
function tileEl(u){return document.querySelector(`#tb .tile[data-u="${u}"]`)}
function sparks(el,n,col){const f=document.getElementById('fx'),tb=document.getElementById('tb');if(!el||!f||!tb)return;const r=el.getBoundingClientRect(),b=tb.getBoundingClientRect();
  for(let i=0;i<n;i++){const s=document.createElement('i');s.className='sp';const a=Math.random()*Math.PI*2,d=22+Math.random()*34;s.style.cssText=`left:${r.left-b.left+r.width/2}px;top:${r.top-b.top+r.height/2}px;--dx:${Math.cos(a)*d}px;--dy:${Math.sin(a)*d-10}px;background:${col||'#ffc928'}`;f.appendChild(s);setTimeout(()=>s.remove(),800)}}
function pop(el,txt,cls){const f=document.getElementById('fx'),tb=document.getElementById('tb');if(!el||!f||!tb)return;const r=el.getBoundingClientRect(),b=tb.getBoundingClientRect();const p=document.createElement('div');p.className='pop '+(cls||'');p.textContent=txt;
  p.style.left=Math.max(30,Math.min(b.width-30,r.left-b.left+r.width/2))+'px';p.style.top=Math.max(20,r.top-b.top-4)+'px';f.appendChild(p);setTimeout(()=>p.remove(),1100)}
function flushFx(){const q=TBL.fxq;TBL.fxq=[];if(!ANIM||!q.length)return;const tb=document.getElementById('tb');
  for(const [name,arg] of q){try{
    if(name==='cut'){const el=tileEl(arg);if(el){el.classList.add('snap');setTimeout(()=>el&&el.classList.remove('snap'),1000);sparks(el,9,'#ffe066');if(!TBL.popAt||Date.now()-TBL.popAt>500){TBL.popAt=Date.now();pop(el,'SNIP!','good')}}}
    else if(name==='miss'){const el=arg!=null?tileEl(arg):null;if(el){el.classList.add('buzz');setTimeout(()=>el.classList.remove('buzz'),800);sparks(el,6,'#ff7a3a')}
      const fz=document.querySelector('#fuse .fz');if(fz){fz.classList.add('burn');setTimeout(()=>fz.classList.remove('burn'),1200);const sp=fz.querySelector('.spark');if(sp)sparks(sp,14,'#ff9a3a')}pop(el||document.querySelector('#fuse .fz'),'BUZZ!','bad');tb.classList.add('shake');setTimeout(()=>tb.classList.remove('shake'),500)}
    else if(name==='phew'){const fz=document.querySelector('#fuse .fz');if(fz){fz.classList.add('phew');setTimeout(()=>fz.classList.remove('phew'),1200);pop(fz,'PHEW!','good')}}
    else if(name==='win'){tb.classList.add('winfx');setTimeout(()=>tb.classList.remove('winfx'),2500);document.querySelectorAll('#tb .tile.known').forEach((e,i)=>{if(i%3===0)sparks(e,2,'#8cf06a')})}
    else if(name==='boom'){tb.classList.add('boomfx');setTimeout(()=>tb.classList.remove('boomfx'),2500);const el=arg!=null?tileEl(arg):document.querySelector('#fuse .spark');if(el)sparks(el,26,'#ff5a1f')}
    else if(name==='coin'){const el=document.querySelector('#track .cn12.done:last-child');if(el){el.classList.add('flipc');setTimeout(()=>el.classList.remove('flipc'),900)}}
  }catch(e){console.error(e)}}}
// a teammate's move is announced for a moment before it happens: the pointer, the number
function announce(m,seat){if(!ANIM||!m||m.a!=='dual')return;const f=G.st[m.st]&&G.st[m.st].w[m.ks[0]];if(!f)return;const el=tileEl(f.u);if(!el)return;
  const fe=document.getElementById('fx'),tb=document.getElementById('tb');if(!fe||!tb)return;const r=el.getBoundingClientRect(),b=tb.getBoundingClientRect();
  const old=fe.querySelector('.say');if(old)old.remove();const d=document.createElement('div');d.className='say';
  const vv=m.v===undefined?'?':(m.v==='Y'?'Y':m.v)+(m.v2!=null?' / '+(m.v2==='Y'?'Y':m.v2):'');
  d.innerHTML=`<span style="--sc:${SEATC[posOf(seat)%5]}">${esc(nm(seat))}</span><b>${esc(vv)}?</b>`;
  d.style.left=Math.max(34,Math.min(b.width-34,r.left-b.left+r.width/2))+'px';d.style.top=Math.max(26,r.top-b.top-10)+'px';fe.appendChild(d);
  m.ks.forEach(k=>{const t=G.st[m.st].w[k];const e2=t&&tileEl(t.u);if(e2){e2.classList.add('aim');setTimeout(()=>e2.classList.remove('aim'),700)}});
  setTimeout(()=>d.remove(),900);sfx('select')}
// ---------- the ghost finger: shows the very first move ----------
function ghostPlan(V){if(!UI.ghost||G.over||UI.brief||passTo()>=0||V.seat<0)return null;const me=V.seat;
  if(V.q&&V.q.who===me&&V.q.kind==='infoStd'&&UI.ghost.info){const o=V.q.opts.slice().sort((a,b)=>{const cA=heldCount(V,cvOf(V,a.d.u)),cB=heldCount(V,cvOf(V,b.d.u));return cA-cB})[0];if(o)return {kind:'tap',u:o.d.u}}
  if(V.legal&&decider()===me&&!UI.sel&&UI.ghost.turn){const W=wwk(V);const m=W&&W.suggestion&&W.suggestion.m;if(!m)return null;
    if(m.a==='dual'&&!m.tool&&!m.two&&m.ks.length===1&&!m.own&&!legal(m,me)){const t=G.st[m.st].w[m.ks[0]];const mine=V.stands.filter(st=>st.mine).map(st=>st.slots).flat().find(x=>x.v===m.v&&!x.cut&&!x.flip);if(t&&mine)return {kind:'drag',from:mine.u,u:t.u}}
    if(m.a==='solo'&&!legal(m,me)&&!m.ep&&!m.flip){const mine=V.stands.filter(st=>st.mine).map(st=>st.slots).flat().find(x=>x.v===m.v&&!x.cut&&!x.flip);if(mine)return {kind:'tap',u:mine.u}}}
  return null}
function cvOf(V,u){for(const st of V.stands)for(const x of st.slots)if(x.u===u)return x.v;return null}
function placeGhost(V){const gh=document.getElementById('ghost');const tb=document.getElementById('tb');if(!tb)return;let plan=null;try{plan=V&&G&&UI.started?ghostPlan(V):null}catch(e){plan=null}
  const sig=plan?JSON.stringify(plan):'';if(!plan){if(gh)gh.remove();TBL.ghostSig='';return}
  const a=tileEl(plan.from!=null?plan.from:plan.u);if(!a){if(gh)gh.remove();return}
  const tbr=tb.getBoundingClientRect(),ar=a.getBoundingClientRect();let el=gh;if(!el){el=document.createElement('div');el.id='ghost';el.innerHTML='<svg viewBox="0 0 40 48" width="44" height="52"><path d="M14 22V8a3.5 3.5 0 0 1 7 0v12l9 3c3 1 5 3 5 7v6c0 6-4 10-10 10h-3c-5 0-8-2-10-6L6 31c-1-2 1-4 3-3l5 4z" fill="#fff" stroke="#1c1838" stroke-width="2.5" stroke-linejoin="round"/></svg>';tb.appendChild(el)}
  const x0=ar.left-tbr.left+ar.width*.5-14,y0=ar.top-tbr.top+ar.height*.55;el.style.left=x0+'px';el.style.top=y0+'px';el.dataset.kind=plan.kind;
  if(plan.kind==='drag'){const b=tileEl(plan.u);if(b){const br=b.getBoundingClientRect();el.style.setProperty('--dx',(br.left-tbr.left+br.width*.5-14-x0)+'px');el.style.setProperty('--dy',(br.top-tbr.top+br.height*.55-y0)+'px')}}
  TBL.ghostSig=sig}
function ghostDone(kind){if(!UI.ghost)return;if(kind==='info')UI.ghost.info=0;if(kind==='turn')UI.ghost.turn=0;lsSet('sf_ghost',{info:UI.ghost.info,turn:UI.ghost.turn});const gh=document.getElementById('ghost');if(gh)gh.remove()}
// ---------- input ----------
function tapTile(si,k){const V=UI.V;if(!V||V.seat<0||G.over||UI.brief)return;const own=ownerOf(si)===V.seat;
  if(UI.ghost&&UI.ghost.info&&V.q&&V.q.kind==='infoStd'&&own)ghostDone('info');
  if(own)onMine(si,k);else onTile(si,k)}
function autoFire(){const sel=UI.sel,V=UI.V;if(!sel||sel.mode!=='dual'||!sel.tg.length||sel.v==null)return false;if(sel.two&&sel.v2==null)return false;const need=toolN(sel.tool);if(need!==99&&sel.tg.length<need)return false;
  const m=buildDual(sel);if(!m)return false;const err=legal(m,V.seat);if(err){toast(err);return false}if(UI.ghost&&UI.ghost.turn)ghostDone('turn');act(m,V.seat);return true}
function onMine(si,k){const V=UI.V;const sl=G.st[si].w[k];const me=V.seat;
  if(V.q&&V.q.who===me&&V.q.opts){const i=V.q.opts.findIndex(o=>o.d&&(o.d.u===sl.u||(o.d.st===si&&o.d.k===k)));if(i>=0){answer(i);return}toast('Tap a glowing wire');return}
  const sel=UI.sel;if(sel&&(sel.mode==='choose'||sel.mode==='multi'))return onTile(si,k);
  const L=V.legal;if(!L||decider()!==me){toast(G.actor>=0?nm(G.actor)+"'s turn":'Not now');return}
  const view=V.stands[si].slots[k];if(view.cut)return;
  if(sel&&sel.mode==='flipown'){if(view.flip){UI.sel=Object.assign(sel.prev&&sel.prev.mode==='dual'?sel.prev:{mode:'dual',tg:[],v:null,v2:null,two:null},{fu:view.u,tool:null,v:null});sfx('select');refresh()}return}
  if(view.flip){// a face-down wire of mine: use it for a solo or point with it
    const soloF=L.solo.filter(m=>m.flip&&m.fu===view.u);if(soloF.length&&!L.flip.some(m=>m.fu===view.u)){act(soloF[0],me);return}
    if(L.flip.some(m=>m.fu===view.u)){UI.sel=Object.assign(sel&&sel.mode==='dual'?sel:{mode:'dual',tg:[],v:null,v2:null,two:null},{fu:view.u,tool:null});UI.sel.v=null;sfx('select');refresh();return}return}
  if(view.v==null)return;
  if(L.other.some(m=>m.a==='reveal')&&view.c==='r'){act({a:'reveal'},me);return}
  const v=view.v;
  if(sel&&sel.mode==='dual'&&sel.tg.length){const need=toolN(sel.tool);if(need!==99&&need>sel.tg.length){toast('Tap '+(need-sel.tg.length)+' more wire'+(need-sel.tg.length>1?'s':''));return}
    const vs=dualVals(sel);
    if(sel.two&&sel.v!=null&&sel.v2==null){if(v!==sel.v&&vs.includes(v)){sel.v2=v;sfx('select');if(!autoFire())refresh()}return}
    if(vs.includes(v)){sel.v=v;if(sel.v2===v)sel.v2=null;sfx('select');if(!autoFire())refresh();return}
    toast('You cannot say that here');return}
  if(sel&&sel.mode==='dual'&&sel.v===v&&!sel.tg.length){UI.sel=null;refresh();return}
  const solo=L.solo.filter(m=>m.v===v&&!m.flip);
  if(solo.length&&!(sel&&sel.mode==='dual'&&(sel.tool||sel.two))){const m=solo.find(x=>!x.ep)||solo[0];if(UI.ghost&&UI.ghost.turn)ghostDone('turn');act(m,me);return}
  const ok=L.plain.some(m=>m.v===v);if(!ok){toast('Nobody to point at');return}
  UI.sel=Object.assign(sel&&sel.mode==='dual'?sel:{mode:'dual',tool:null,tg:[],v:null,v2:null,two:null,fu:null},{v});sfx('select');refresh()}
// the crew wires: onTile (ui.js) sets the target; a number picked first fires here
function afterTile(){const V=UI.V;if(UI.sel&&UI.sel.mode==='dual')autoFire();else if(UI.sel&&UI.sel.mode==='choose'&&V&&!nextStep(UI.sel)){const rem=selRemaining(UI.sel);if(rem.length===1)act(rem[0],V.seat)}}
document.addEventListener('click',e=>{const t=e.target.closest('#tb .tile.glow,#tb .tile.sel,#tb .plate.glow,#tb .chip,#tb .eqk.glow');if(!t){const tb=e.target.closest('#tb');if(tb&&UI.sel&&!e.target.closest('.tile,.chip,.plate,.eqk,button')&&G&&!G.over&&UI.sel.mode!=='choose'){UI.sel=null;refresh()}return}
  if(TBL.dragEnded&&Date.now()-TBL.dragEnded<300){return}
  if(t.classList.contains('tile')){const si=+t.dataset.s,k=+t.dataset.k;if(UI.sel&&UI.sel.mode==='dual'&&!UI.sel.v&&t.classList.contains('sel')&&t.classList.contains('crew')&&UI.sel.tg.length===1&&!UI.sel.tool){UI.sel=null;refresh();return}tapTile(si,k);afterTile();return}
  if(t.classList.contains('plate')){plateTap(+t.dataset.seat);return}
  if(t.classList.contains('eqk')){eqTap(t.dataset.eq);return}
  if(t.classList.contains('chip')){chipTap(+t.dataset.chip);return}});
function plateTap(seat){const V=UI.V;if(!V||V.seat<0)return;
  if(V.q&&V.q.who===V.seat&&V.q.kind==='designate'){const i=V.q.opts.findIndex(o=>o.d&&o.d.seat===seat);if(i>=0){answer(i);return}}
  const sel=UI.sel;if(sel&&sel.mode==='choose'){const step=nextStep(sel);if(step&&step.key){const vals=[...new Set(selRemaining(sel).map(m=>m[step.key]))];const hit=vals.find(v=>Array.isArray(v)?v.includes(seat):v===seat);if(hit!==undefined){sel.fixed[step.key]=hit;sfx('select');const rem=selRemaining(sel);if(rem.length===1&&!nextStep(sel)){act(rem[0],V.seat);return}refresh()}}}}
function eqTap(id){const V=UI.V;if(!V||V.seat<0)return;let moves=eqMovesFor(V,id);if(!moves.length)return;const k=moveKey(moves[0]);
  if(moves.length===1&&!stepsOf(k).length){act(moves[0],V.seat);return}startChoose(moves,!(V.legal&&decider()===V.seat))}
function chipTap(n){const V=UI.V;const it=TBL.items&&TBL.items[n];if(!it||!V)return;const me=V.seat;
  switch(it.t){
  case 'q':answer(it.i);return;
  case 'cancel':UI.sel=null;sfx('click');refresh();return;
  case 'param':{const s=UI.sel;s.fixed[it.key]=it.v;sfx('select');const rem=selRemaining(s);if(rem.length===1&&!nextStep(s)){act(rem[0],me);return}refresh();return}
  case 'pick':{const m=selRemaining(UI.sel)[it.i];if(m)act(m,me);return}
  case 'multi':UI.sel={mode:'multi',kind:it.kind,n:it.n,tg:[]};sfx('select');refresh();return;
  case 'tool':{const s=UI.sel&&UI.sel.mode==='dual'?UI.sel:(UI.sel={mode:'dual',tool:null,tg:[],v:null,v2:null,two:null,fu:null});s.tool=s.tool===it.tool?null:it.tool;s.fu=null;if(s.v==='Y')s.v=null;
    if(s.tg.length){const st=s.tg[0].st;s.tg=s.tool==='eq5'?eq5Slots(st).map(k=>({st,k})):s.tg.slice(0,1)}sfx('select');refresh();return}
  case 'two':{const s=UI.sel&&UI.sel.mode==='dual'?UI.sel:(UI.sel={mode:'dual',tool:null,tg:[],v:null,v2:null,two:null,fu:null});s.two=s.two===it.tool?null:it.tool;s.v2=null;sfx('select');refresh();return}
  case 'grp':{const k=it.k;let moves=it.off||!V.legal?validMoves(me).filter(m=>moveKey(m)===k):V.legal.eq.concat(V.legal.other).filter(m=>moveKey(m)===k);if(!moves.length)return;
    if(moves.length===1&&!stepsOf(k).length){act(moves[0],me);return}startChoose(moves,!!it.off||!V.legal);return}
  case 'off':{const m=(V.off||[])[it.i];if(m)act(m,me);return}}}
// dragging my own number onto a crewmate's wire
(function(){let d=null;const tb=()=>document.getElementById('tb');
  document.addEventListener('pointerdown',e=>{const t=e.target.closest&&e.target.closest('#mine .tile.glow.g-val,#mine .tile.glow.g-solo');if(!t||e.button>0)return;d={t,x:e.clientX,y:e.clientY,on:false,id:e.pointerId,el:null}},true);
  document.addEventListener('pointermove',e=>{if(!d||e.pointerId!==d.id)return;const dx=e.clientX-d.x,dy=e.clientY-d.y;
    if(!d.on&&Math.hypot(dx,dy)>12){d.on=true;const r=d.t.getBoundingClientRect();const c=d.t.cloneNode(true);c.className+=' dragc';c.style.cssText=`position:fixed;left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;z-index:50;pointer-events:none;margin:0`;document.body.appendChild(c);d.el=c;d.r=r;d.t.classList.add('lift');sfx('select')}
    if(d.on){d.el.style.transform=`translate(${dx}px,${dy}px) scale(1.12) rotate(${Math.max(-12,Math.min(12,dx/8))}deg)`;const o=document.elementFromPoint(e.clientX,e.clientY);const crew=o&&o.closest&&o.closest('#crew .tile');document.querySelectorAll('#crew .tile.hov').forEach(x=>x.classList.remove('hov'));if(crew)crew.classList.add('hov')}},true);
  const end=e=>{if(!d||e.pointerId!==d.id)return;const was=d;d=null;if(!was.on)return;TBL.dragEnded=Date.now();if(was.el)was.el.remove();was.t.classList.remove('lift');document.querySelectorAll('#crew .tile.hov').forEach(x=>x.classList.remove('hov'));
    if(e.type==='pointercancel')return;const o=document.elementFromPoint(e.clientX,e.clientY);const ct=o&&o.closest&&o.closest('#crew .tile');const V=UI.V;if(!ct||!V||V.seat<0||!V.legal)return;
    const si=+ct.dataset.s,k=+ct.dataset.k;const sl=V.stands[si]&&V.stands[si].slots[k];const mv=V.stands.filter(s=>s.mine).map(s=>s.slots).flat().find(x=>x.u===+was.t.dataset.u);if(!sl||!mv||mv.v==null)return;
    if(!V.legal.plain.some(m=>m.st===si&&m.ks[0]===k&&m.v===mv.v)){toast('Not that wire');return}
    if(ownerOf(si)===V.seat)return;UI.sel={mode:'dual',tool:null,tg:[{st:si,k}],v:mv.v,v2:null,two:null,fu:null};if(UI.ghost&&UI.ghost.turn)ghostDone('turn');autoFire()};
  document.addEventListener('pointerup',end,true);document.addEventListener('pointercancel',end,true)})();
// ---------- keeping the layout right on every size change (iOS reports the old size right after a rotation) ----------
(function(){let t=null,t2=null;const go=()=>{try{layoutTable()}catch(e){}};const deb=()=>{clearTimeout(t);clearTimeout(t2);t=setTimeout(go,60);t2=setTimeout(go,420)};
  window.addEventListener('resize',deb);window.addEventListener('orientationchange',deb);if(window.visualViewport)window.visualViewport.addEventListener('resize',deb);
  const init=()=>{const b=document.getElementById('tb');if(b&&window.ResizeObserver)new ResizeObserver(deb).observe(b)};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init()})();
