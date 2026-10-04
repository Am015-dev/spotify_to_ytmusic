// ===================== part 3: analysis and the dock =====================
function traceSteps(B,x,y,e,over){const st=[];let cx=x,cy=y,ce=e,n=0;
  for(;;){const cell=(cx===x&&cy===y&&over)?over:B.bd[cy*BW+cx];if(!cell)break;const q=exitPort(cell,ce);st.push({c:cx,r:cy,from:ce,to:q});
    const nx=cx+DIR[q>>1][0],ny=cy+DIR[q>>1][1];if(!inB(nx,ny)||monAt(B,nx,ny)||gateAt(B,nx,ny))break;cx=nx;cy=ny;ce=MATE[q];if(++n>90)break}
  return st}
// what a placement does, straight from the engine's own path rules (simPlace / follow)
function analyse(K,seat,m){const S=K.ships[m.s],tile=K.hands[seat][m.t];const sim=simPlace(K,S.x,S.y,tile,m.r);const mine=sim.res[m.s];
  const A={st:mine.st,coll:sim.coll.includes(m.s),mons:[],steps:traceSteps(K,S.x,S.y,S.e,[tile,m.r]),others:[]};
  if(mine.st==='ok'){A.end=[mine.x,mine.y];A.n=mine.path.length;for(const mo of K.mons){if(mo.k!=='L')continue;const near=[[mine.x,mine.y]];if(mine.on)near.push(mine.on);if(near.some(q=>Math.abs(q[0]-mo.x)+Math.abs(q[1]-mo.y)===1))A.mons.push(mo.id)}}
  else if(mine.st==='mon')A.mon=mine.id;
  A.others=sim.movers.filter(i=>i!==m.s).map(i=>({i,st:sim.res[i].st,coll:sim.coll.includes(i)}));
  A.bad=A.st==='edge'||A.st==='mon'||A.coll;return A}
function outcomeHTML(K,seat,m,A){const S=K.ships[m.s],who=m.s===seat?'Your junk':nm(m.s)+"'s junk";const o=[];
  if(A.st==='edge')o.push(`<span class="warn-l">This tile sends ${who.toLowerCase()==='your junk'?'you':nm(m.s)} off the edge: ${who} would sink.</span>`);
  else if(A.st==='mon')o.push(`<span class="warn-l">This current runs into ${levName(A.mon)}: ${who} would sink.</span>`);
  else if(A.st==='gate')o.push(`${who} sails into the Rift Gate and is thrown to a rolled square.`);
  else o.push(`${who} sails ${A.n} current${A.n>1?'s':''} and stops at column ${A.end[0]+1}, row ${A.end[1]+1} (the flag on the board).`);
  if(A.coll)o.push(`<span class="warn-l">Two junks would end on one wake: both sink.</span>`);
  for(const x of A.others)o.push(x.coll?`<span class="warn-l">${nm(x.i)} also sails here and would crash.</span>`:x.st==='edge'||x.st==='mon'?`${nm(x.i)} also sails and would sink.`:`${nm(x.i)} also sails on.`);
  return o.join('<br>')}
const cardBack=()=>`<svg class="cardart" viewBox="0 0 100 100"><rect x="3" y="3" width="94" height="94" rx="10" fill="#14606b" stroke="#e3b24b" stroke-width="3"/><path d="M20 62q10-12 20 0t20 0t20 0M20 44q10-12 20 0t20 0t20 0" fill="none" stroke="#e3b24b" stroke-width="3"/></svg>`;
const gateArt=()=>`<svg class="cardart" viewBox="0 0 100 100"><rect x="3" y="3" width="94" height="94" rx="10" fill="#3b2a66" stroke="#e3b24b" stroke-width="3"/><circle cx="50" cy="50" r="24" fill="#6d3fd0" stroke="#35e0ff" stroke-width="5"/><circle cx="50" cy="50" r="12" fill="#c9b3ff"/></svg>`;
const cannonArt=()=>`<svg class="cardart" viewBox="0 0 100 100"><rect x="3" y="3" width="94" height="94" rx="10" fill="#3a3f46" stroke="#e3b24b" stroke-width="3"/><rect x="22" y="40" width="50" height="20" rx="8" fill="#14171a" transform="rotate(-18 50 50)"/><circle cx="34" cy="68" r="10" fill="#7a5a14"/><circle cx="76" cy="38" r="5" fill="#ffb347"/></svg>`;
function cardBtn(c,t,o){o=o||{};const sel=o.sel;const own=o.owner;
  if(!o.up)return `<button class="hc back" disabled data-owner="${own}" data-up="0" aria-label="Hidden tile">${cardBack()}</button>`;
  if(c===GATE_ID)return `<button class="hc sp${sel?' sel':''}" data-a="card" data-t="${t}" data-owner="${own}" data-up="1" aria-label="Rift Gate"><span class="n">${t+1}</span>${gateArt()}<span class="lbl">Rift Gate</span></button>`;
  if(isCannon(c))return `<button class="hc sp${sel?' sel':''}" data-a="card" data-t="${t}" data-owner="${own}" data-up="1" aria-label="Deck Cannon"><span class="n">${t+1}</span>${cannonArt()}<span class="lbl">Deck Cannon</span></button>`;
  return `<button class="hc${sel?' sel':''}" data-a="card" data-t="${t}" data-owner="${own}" data-up="1" aria-label="Current tile ${t+1}"><span class="n">${t+1}</span><img alt="" src="${TWKit.cardURL(BASE_PATHS[CUR_TYPE[c]],{rot:sel?o.rot:0,selected:!!sel,uid:'c'+t,size:96})}"></button>`}
// who may see a hand right now: the seat that holds the device (hot-seat), the one human (me vs computers); never anyone else's
function viewSeat(){if(!G)return -1;if(NET.on)return NET.mySeat;const h=humans();if(h.length===1)return h[0];if(h.length>=2)return UI.holder;return -1}
function mustPass(d){if(NET.on)return !!G.seats[d].human&&d!==NET.mySeat;return hotSeat()&&G.seats[d].human&&UI.holder!==d}
function handStrip(vs,interactive,sel,rot){if(vs<0||!G.ships[vs].alive&&!G.hands[vs].length)return '';const hd=G.hands[vs];if(!hd.length)return '';
  return `<div class="hand" data-hand="${vs}">${hd.map((c,t)=>cardBtn(c,t,{up:true,owner:vs,sel:interactive&&sel&&sel.t===t,rot})).join('')}</div>`}
function startHTML(d){const info=startInfo(d),K=knowledge(d),adv=startAdvice(K,d,info);const by={};for(const o of info)(by[o.edge+o.idx]=by[o.edge+o.idx]||[]).push(o);
  let g='';for(const ed of EDGES){const hor=ed==='top'||ed==='bottom';g+=`<span>${ed[0].toUpperCase()+ed.slice(1)}</span>`;for(let i=1;i<=6;i++){const l=by[ed+i]||[];
    g+=`<span style="display:flex;gap:2px">${[0,1].map(k=>{const o=l[k],lab=i+(hor?'LR':'UD')[k];return o?`<button class="btn small${adv&&adv.o===o?' on':''}" style="min-width:0;flex:1" data-a="startmark" data-x="${o.m.x}" data-y="${o.m.y}" data-e="${o.m.e}" aria-label="${ed} ${i}, ${o.sideWord} mark">${lab}</button>`:`<button class="btn small" style="min-width:0;flex:1" disabled>${lab}</button>`}).join('')}</span>`}}
  const you=d===viewSeat()||humans().length===1;
  return `<div class="prompt"><h4>${you?'Choose your start':esc(nm(d))+': choose a start'}</h4><p>Tap one of the big pulsing gold marks on the edge of the board. Each number from 1 to 6 has two marks (<b>L</b> left and <b>R</b> right of the number; on the side edges <b>U</b> upper and <b>D</b> lower).</p>
  ${adv?`<div class="rec"><b>Good start:</b> ${esc(adv.why)} <button class="btn small" data-a="startmark" data-x="${adv.o.m.x}" data-y="${adv.o.m.y}" data-e="${adv.o.m.e}">Start here</button></div>`:''}
  <p class="tiny">Tip: a mark in the middle of an edge is safest. Next to a corner you may run out of room. The dice come later: they only decide when the leviathans (the sea monsters already on the board) move.</p>
  <details><summary class="tiny">All marks as a list</summary><div class="startpick" style="grid-template-columns:auto repeat(6,1fr)">${g}</div></details></div>`}
function questionHTML(d,K){const q=G.q;let extra='';const you=d===viewSeat()||humans().length===1;
  if(q.kind==='bonus'&&G.cur===d&&G.pool.length)extra=`<p class="tiny">Sunken crews' tiles (numbered):</p><div class="hand">${G.pool.map((c,j)=>isCur(c)?`<span class="hc"><span class="n">${j+1}</span><img alt="" src="${TWKit.cardURL(BASE_PATHS[CUR_TYPE[c]],{uid:'pl'+j,size:96})}"></span>`:`<span class="hc sp"><span class="n">${j+1}</span>${isGate(c)?gateArt():cannonArt()}</span>`).join('')}</div>`;
  const timed=UI.qTime>0&&q.kind==='doom'||NET.on&&q.kind==='doom';
  let title=String(q.title).replace(/^You drew/,(you?'You':nm(d))+' drew');
  if(q.kind==='cannonDraw'){const n=G.hands[d].filter(isCannon).length;extra=`<p class="tiny">A <b>Deck Cannon</b> is an optional tile you can hold (two at most). Later you can fire it at a leviathan that is about to sink you, even on someone else's turn. You may keep it, or show it and discard it to draw a different tile instead${n?` (you already hold ${n})`:''}.</p>`}
  if(q.kind==='doom')extra=`<p class="warn-l">If you do nothing, your junk sinks. Pick a rescue below, or accept.</p>`+extra;
  return `<div class="prompt ${q.kind==='doom'?'alert':'ask'}" data-qkind="${q.kind}"><h4>${q.kind==='doom'?'Quick: '+(you?'your':esc(nm(d))+"'s")+' junk is in danger!':q.kind==='cannonDraw'?(you?'You':esc(nm(d)))+' drew a Deck Cannon':'Choose'}</h4><p>${esc(title)}</p>${extra}<div class="opts">${q.opts.map((o,i)=>`<button class="btn${/Accept/.test(o.l)?' warn':''}" data-a="q" data-i="${i}">${esc(o.l)}</button>`).join('')}</div>${timed?`<div class="qtimer" title="Time left"><i id="qbar"></i></div><p class="cd" id="qtxt">${UI.qTime>0?UI.qTime:25} s to decide, then the computer's best advice is used.</p>`:''}</div>`}
function placeHTML(d,K){const mv=validMoves(d);const pl=mv.filter(m=>m.a==='place'),gts=mv.filter(m=>m.a==='gate'),cns=mv.filter(m=>m.a==='cannon'),pas=mv.find(m=>m.a==='pass');
  const hand=K.hands[d];let sel=UI.sel;const fronts=[...new Set(pl.map(m=>m.s))];
  if(pl.length){if(!sel||!pl.some(m=>m.t===sel.t)||!fronts.includes(sel.s)){const f=pl.find(m=>m.s===d)||pl[0];sel=UI.sel={t:f.t,r:(sel&&sel.r)||0,s:f.s}}}
  UI.canPlace=pl.length>0;UI.moves=mv;
  const full=UI.guide==='full',multi=hotSeat()||humans().length>1;
  let outcome='',m=null,A=null,btn='',err='';
  if(pl.length&&isCur(hand[sel.t])){m={a:'place',t:sel.t,r:sel.r,s:sel.s};A=analyse(K,d,m);err=legal(m,d);outcome=outcomeHTML(K,d,m,A);
    btn=`<button class="btn pri" data-a="place" ${err?'disabled':''}>Place tile ${sel.t+1}</button>`+(err?`<span class="tiny warn-l">${A.bad?'Not allowed: a safer tile exists.':'Not allowed.'}</span>`:'');UI.A=A}
  else{UI.A=null;if(pl.length&&hand[sel.t]!=null){const c=hand[sel.t];const g=gts.find(x=>x.t===sel.t&&x.s===sel.s);if(g)btn=`<button class="btn pri" data-a="gate" data-t="${g.t}" data-s="${g.s}">Play the Rift Gate here</button>`}}
  const fr=fronts.length>1?`<p class="tiny">Which junk gets the tile? ${fronts.map(s=>`<button class="btn small${sel&&sel.s===s?' on':''}" data-a="target" data-s="${s}">${dot(s)} ${esc(nm(s))}</button>`).join(' ')}</p>`:'';
  const thr=threatHTML(K,d,m,A);
  const rot=pl.length?`<div class="hacts"><button class="btn small" data-a="rot" data-d="-1" aria-label="Turn left" title="Turn left (Q)">&#10226; Left</button><span class="rotl">turned ${(sel.r||0)*90}&deg;</span><button class="btn small" data-a="rot" data-d="1" aria-label="Turn right" title="Turn right (R)">&#10227; Right</button></div>`:'';
  const nT=hand.length;
  UI.pinH=`<div class="pinbox"><div class="hl"><b>${multi?esc(nm(d))+"'s":'Your'} ${nT} tile${nT===1?'':'s'}</b> <span class="tiny">${pl.length?'tap a tile, turn it, then Place':'choose what to do'}</span></div><div class="hand" data-hand="${d}">${hand.map((c,t)=>cardBtn(c,t,{up:true,owner:d,sel:sel&&sel.t===t,rot:sel&&sel.r})).join('')}${rot}</div><div class="row">${btn}${pas?`<button class="btn" data-a="pass">Nothing to play: pass</button>`:''}</div></div>`;
  let h=`<div class="prompt"><h4>${multi?esc(nm(d))+': lay a current':'Your turn: lay a current'}</h4>${fr}`;
  if(outcome)h+=`<p style="margin:6px 0 4px">${outcome}</p>`;if(thr)h+=`<p style="margin:2px 0">${thr}</p>`;
  if(err&&A&&A.bad)h+=`<p class="warn-l" style="margin:4px 0">Not allowed: another tile is safer. The rule: you may not pick a placement that sinks you while any other placement does not. <button class="btn small" data-a="sugg">Show me the safest move</button></p>`;
  const cm={};for(const c of cns){const k=c.m+':'+c.s;if(!cm[k])cm[k]=c}const nc=hand.filter(isCannon).length;
  if(Object.keys(cm).length)h+=`<div class="optrow"><div class="tiny"><b>Deck Cannon</b> (optional, instead of laying a tile; you hold ${nc}):</div><div class="row">${Object.values(cm).map(c=>`<button class="btn warn" data-a="cannon" data-t="${c.t}" data-m="${c.m}" data-s="${c.s}">Fire at ${esc(levName(c.m))}${nc>1?' (x'+nc+' held)':''}</button>`).join('')}</div></div>`;
  else if(nc&&full)h+=`<p class="tiny">You hold a Deck Cannon. It can be fired when a leviathan is next to your front square or about to sink you.</p>`;
  if(nc>=2)h+=`<p class="tiny">You hold two Deck Cannons, the most you may keep: a third you draw is discarded.</p>`;
  const gseen={};const gb=gts.filter(g=>!(pl.length&&isGate(hand[sel.t])&&g.t===sel.t)).filter(g=>{const k=g.t+':'+g.s;if(gseen[k])return false;gseen[k]=1;return true});
  if(gb.length)h+=`<div class="optrow"><div class="tiny"><b>Rift Gate</b> (optional):</div><div class="row">${gb.map(g=>`<button class="btn" data-a="gate" data-t="${g.t}" data-s="${g.s}">Play Rift Gate${g.s!==d?' for '+esc(nm(g.s)):''}</button>`).join('')}</div></div>`;
  h+=`</div>`;
  if(pl.length){if(full||UI.hint)h+=recHTML(K,d,pl,true);else h+=`<div class="row"><button class="btn small" data-a="hint">Show me the safest move</button></div>`}
  else if(cns.length||gts.length||pas)h+=full||UI.hint?recHTML(K,d,pl,true):'';
  return h}
function passHTML(d){return `<div class="prompt passbox"><div class="big">${dot(d)} Pass the device to ${esc(nm(d))}</div><p>Hands are hidden until ${esc(nm(d))} takes the device.${G.q&&G.q.who===d?' '+esc(nm(d))+' must make a quick decision.':''}</p><button class="btn pri" data-a="take" data-seat="${d}">I am ${esc(nm(d))}</button></div>`}
function overHTML(){const o=G.over,w=o.win||[];const me=viewSeat();const hs=humans();const solo=G.variant==='solo'||G.variant==='easysolo';
  const watch=NET.on?me<0:!hs.length;const multi=!NET.on&&hs.length>1;
  const meWin=me>=0&&w.includes(me);let head,cls='';
  if(watch||multi){head=w.length?(w.length>1?'Game over: shared win':'Game over'):'Game over'}
  else if(meWin){head=w.length>1?'Shared victory!':'Victory!'}else{head='Defeat';cls='alert'}
  const names=w.map(i=>dot(i)+' <b>'+esc(nm(i))+'</b>').join(', ');
  let h=`<div class="prompt ${cls}" data-over="1"><h4>${head}</h4><p>${esc(o.why)}</p>`;
  if(me>=0&&!watch&&!multi&&!G.ships[me].alive){const c=causeOf(G.ships[me].out);h+=`<p class="warn-l"><b>You were sunk:</b> ${esc(c.t)}</p>`}
  h+=`<p>${w.length?(solo?'':(w.length>1?'Winners: ':'Winner: ')+names):'Nobody survived.'}</p>`;
  if(G.np>1||solo)h+=`<ul class="crews">${G.order.map(i=>{const s=G.ships[i];return `<li>${dot(i)} ${esc(nm(i))}${G.team?' (team '+'AB'[G.team[i]]+')':''}: ${s.alive?'afloat':'sunk ('+({edge:'sailed off the edge',collision:'head-on collision',wave:'capsized by the Rogue Wave',maelstrom:'swallowed by the Maelstrom',block:'blocked in by a leviathan',mon:'ran into a leviathan',crush:'crushed by a leviathan',rift:'lost in the rift'}[causeOf(s.out).k]||'sunk')+')'}</li>`}).join('')}</ul>`;
  h+=earnedHTML();h+=`<p class="tiny">${G.turn} turns, ${G.ships.filter(s=>s.alive).length} junk(s) afloat, ${G.stats.levMove||0} leviathan moves.</p>`;
  if(!meWin&&!watch&&!multi&&UI.guided)h+=`<p class="tiny">Next time: keep your junk off the edges and corners, and press <b>Show me the safest move</b> before each Place.</p>`;
  if(isClient())h+=`<p class="tiny">Waiting for the host to start another game.</p><div class="row"><button class="btn" data-a="netleave">Leave</button><button class="btn" data-gx="rulesd">Rules</button></div>`;
  else h+=`<div class="row">${!meWin&&!watch&&!multi&&GX.undo.can()&&!NET.on?'<button class="btn pri" data-a="rewind">Take back my last move</button>':''}${UI.guided&&!meWin&&!watch?'<button class="btn" data-a="guided">Try the guided game again</button>':''}<button class="btn${meWin||watch||multi||!GX.undo.can()?' pri':''}" data-a="again">Play again</button><button class="btn" data-a="newgame">New game</button><button class="btn" data-gx="rulesd">Rules</button></div>`;
  return h+'</div>'}
function oppHTML(d){const now=UI.busy&&UI.curTurn!=null&&G.seats[UI.curTurn]?UI.curTurn:d;
  return `<div class="prompt opp"><h4>Opponents</h4><p class="tiny">${now>=0?dot(now)+' <b>'+esc(nm(now))+'</b> is playing':'The sea moves'}. The computers play by themselves; you only act on your turn, in step 2 (Place).</p><div class="row">${UI.busy?'<button class="btn small" data-a="skip">Skip animation</button>':''}${humans().length===0?`<button class="btn small" data-a="pause">${UI.pause?'Resume':'Pause'}</button>`:''}</div></div>`}
function goalHTML(){if(!G)return '';const L=G.mons.filter(m=>m.k==='L').length,toRise=G.mdeck.filter(x=>x<10).length;
  if(G.variant==='solo')return `<div class="goal"><b>Goal:</b> outlast every leviathan. ${toRise} still to rise, ${L} on the board; you win when none are left.</div>`;
  if(G.variant==='easysolo')return `<div class="goal"><b>Goal:</b> stay afloat for ${G.opts.goal} turns (turn ${G.turn} now), or play out the whole tile pile.</div>`;return ''}
function mainHTML(){const gh=goalHTML();const h=mainHTML0();return G.over||!h?h:gh+h}
function mainHTML0(){
  if(G.over)return overHTML();const d=sideToAct(),vs=viewSeat();
  if(UI.busy)return oppHTML(d)+handStrip(vs,false);
  if(d<0)return '';const dh=G.seats[d].human;
  if(NET.on&&dh&&d!==NET.mySeat)return netWaitHTML(d,vs);
  if(dh&&mustPass(d))return passHTML(d);
  if(dh){UI.V={seat:d};
    if(G.q)return questionHTML(d)+handStrip(vs,false);
    if(G.phase==='setup')return startHTML(d);
    if(G.step==='act'){return placeHTML(d,knowledge(d))}return ''}
  return oppHTML(d)+handStrip(vs,false)}
