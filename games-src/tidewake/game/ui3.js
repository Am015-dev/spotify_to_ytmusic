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
  else o.push(`${who} sails ${A.n} current${A.n>1?'s':''} and stops at column ${A.end[0]+1}, row ${A.end[1]+1}.`);
  if(A.coll)o.push(`<span class="warn-l">Two junks would end on one wake: both sink.</span>`);
  for(const x of A.others)o.push(x.coll?`<span class="warn-l">${nm(x.i)} also sails here and would crash.</span>`:x.st==='edge'||x.st==='mon'?`${nm(x.i)} also sails and would sink.`:`${nm(x.i)} also sails on.`);
  if(A.mons.length)o.push(`<span class="warn-l">${A.mons.map(levName).join(' and ')} would be right next to you.</span>`);
  return o.join('<br>')}
function nearWarn(K,seat){const S=K.ships[seat];if(!S||S.x==null)return '';const ids=adjMons(K,S);return ids.length?`<span class="warn-l">${ids.map(levName).join(' and ')} ${ids.length>1?'are':'is'} next to you.</span>`:''}
function recMove(d){const key=G.logN+':'+d;if(UI.recKey===key)return UI.recM;let m=null;try{m=aiMove(d,'hard')}catch(e){}UI.recKey=key;UI.recM=m;return m}
function recHTML(K,d,pl,full){const m=recMove(d);if(!m)return '';let why='',lab='';
  if(m.a==='place'){const A=analyse(K,d,m);const bad=pl.filter(x=>analyse(K,d,x).bad).length;lab=`tile ${m.t+1} turned ${m.r*90} degrees`;
    why=A.st==='ok'?`It carries you ${A.n} current${A.n>1?'s':''} to column ${A.end[0]+1}, row ${A.end[1]+1}`+(A.mons.length?' (a leviathan is close, but the other options are worse)':K.mons.some(q=>q.k==='L')?`, ${distMon(K,A.end)} square${distMon(K,A.end)===1?'':'s'} from the nearest leviathan`:'')+'.':A.st==='gate'?'It leads into the Rift Gate.':'Every placement is risky; this one is the least bad.';
    why+=` ${bad} of ${pl.length} placements would sink you.`}
  else if(m.a==='cannon'){lab=`fire the Deck Cannon at ${levName(m.m)}`;why='It removes a leviathan that is next to you.'}
  else if(m.a==='gate'){lab='play the Rift Gate';why='It moves you away from danger.'}else{lab='pass';why='You have nothing to play.'}
  return `<div class="rec"><b>Safest move:</b> ${lab}.${full?` <span class="tiny">${why}</span>`:''}${m.a==='place'?` <button class="btn small" data-a="sugg">Set it up</button>`:''}</div>`}
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
function startHTML(d){const mv=validMoves(d);const by={};for(const m of mv){const pe=TWKit.portEdge(m.x,m.y,m.e);if(!pe)continue;(by[pe.edge+pe.index]=by[pe.edge+pe.index]||[]).push(m)}
  let g='';for(const ed of EDGES){g+=`<span>${ed[0].toUpperCase()+ed.slice(1)}</span>`;for(let i=1;i<=6;i++){const l=(by[ed+i]||[]).sort((a,b)=>a.e-b.e);
    g+=`<span style="display:flex;gap:2px">${[0,1].map(k=>{const m=l[k];return m?`<button class="btn small" style="min-width:0;flex:1" data-a="startmark" data-x="${m.x}" data-y="${m.y}" data-e="${m.e}" aria-label="${ed} ${i}${'ab'[k]}">${i}${'ab'[k]}</button>`:`<button class="btn small" style="min-width:0;flex:1" disabled>${i}${'ab'[k]}</button>`}).join('')}</span>`}}
  return `<div class="prompt"><h4>${d===viewSeat()||humans().length===1?'Choose your start':nm(d)+': choose a start'}</h4><p>Tap a gold mark on the edge of the chart, or pick one here (edge, number, left/right mark).</p><div class="startpick" style="grid-template-columns:auto repeat(6,1fr)">${g}</div></div>`}
function questionHTML(d,K){const q=G.q;let extra='';
  if(q.kind==='bonus'&&G.cur===d&&G.pool.length)extra=`<p class="tiny">Sunken crews' tiles (numbered):</p><div class="hand">${G.pool.map((c,j)=>isCur(c)?`<span class="hc"><span class="n">${j+1}</span><img alt="" src="${TWKit.cardURL(BASE_PATHS[CUR_TYPE[c]],{uid:'pl'+j,size:96})}"></span>`:`<span class="hc sp"><span class="n">${j+1}</span>${isGate(c)?gateArt():cannonArt()}</span>`).join('')}</div>`;
  const timed=UI.qTime>0&&q.kind==='doom';
  return `<div class="prompt ${q.kind==='doom'?'alert':'ask'}" data-qkind="${q.kind}"><h4>${q.kind==='doom'?'Quick: your junk is in danger!':'Choose'}</h4><p>${esc(q.title)}</p>${extra}<div class="opts">${q.opts.map((o,i)=>`<button class="btn${/Accept/.test(o.l)?' warn':''}" data-a="q" data-i="${i}">${esc(o.l)}</button>`).join('')}</div>${timed?`<div class="qtimer" title="Time left"><i id="qbar"></i></div><p class="tiny" id="qtxt">${UI.qTime} s to decide, then the computer's best advice is used.</p>`:''}</div>`}
function placeHTML(d,K){const mv=validMoves(d);const pl=mv.filter(m=>m.a==='place'),gts=mv.filter(m=>m.a==='gate'),cns=mv.filter(m=>m.a==='cannon'),pas=mv.find(m=>m.a==='pass');
  const hand=K.hands[d];let sel=UI.sel;const fronts=[...new Set(pl.map(m=>m.s))];
  if(pl.length){if(!sel||!pl.some(m=>m.t===sel.t)||!fronts.includes(sel.s)){const f=pl.find(m=>m.s===d)||pl[0];sel=UI.sel={t:f.t,r:(sel&&sel.r)||0,s:f.s}}}
  UI.canPlace=pl.length>0;UI.moves=mv;let h='';
  const full=UI.guide==='full';
  let outcome='',m=null,A=null,btn='';
  if(pl.length&&isCur(hand[sel.t])){m={a:'place',t:sel.t,r:sel.r,s:sel.s};A=analyse(K,d,m);
    const err=legal(m,d);outcome=outcomeHTML(K,d,m,A);
    btn=`<button class="btn pri" data-a="place" ${err?'disabled':''}>Place tile ${sel.t+1}</button>`+(err?`<span class="tiny warn-l">${A.bad?'Not allowed while a safer placement exists.':'Not allowed.'}</span>`:'');
    UI.A=A}
  else{UI.A=null;if(pl.length&&hand[sel.t]!=null){const c=hand[sel.t];const g=gts.find(x=>x.t===sel.t&&x.s===sel.s);if(g)btn=`<button class="btn pri" data-a="gate" data-t="${g.t}" data-s="${g.s}">Play the Rift Gate here</button>`}}
  const fr=fronts.length>1?`<p class="tiny">Which junk gets the tile? ${fronts.map(s=>`<button class="btn small${sel&&sel.s===s?' on':''}" data-a="target" data-s="${s}">${dot(s)} ${esc(nm(s))}</button>`).join(' ')}</p>`:'';
  const wr=nearWarn(K,d);
  const rot=pl.length?`<div class="hacts"><button class="btn small" data-a="rot" data-d="-1" aria-label="Turn left" title="Turn left (Q)">&#10226; Left</button><button class="btn small" data-a="rot" data-d="1" aria-label="Turn right" title="Turn right (R)">&#10227; Right</button></div>`:'';
  h+=`<div class="prompt"><h4>${hotSeat()||humans().length>1?esc(nm(d))+': lay a current':'Your turn: lay a current'}</h4><div class="hand" data-hand="${d}">${hand.map((c,t)=>cardBtn(c,t,{up:true,owner:d,sel:sel&&sel.t===t,rot:sel&&sel.r})).join('')}${rot}</div>${fr}`;
  if(outcome)h+=`<p style="margin:6px 0 4px">${outcome}</p>`;if(wr)h+=`<p style="margin:2px 0">${wr}</p>`;
  h+=`<div class="row">${btn}`;
  for(const c of cns)h+=`<button class="btn warn" data-a="cannon" data-t="${c.t}" data-m="${c.m}" data-s="${c.s}">Fire cannon at ${esc(levName(c.m))}</button>`;
  if(gts.length&&!(pl.length&&isGate(hand[sel.t])))h+=gts.map(g=>`<button class="btn" data-a="gate" data-t="${g.t}" data-s="${g.s}">Play Rift Gate${g.s!==d?' for '+esc(nm(g.s)):''}</button>`).filter((x,i,a)=>a.indexOf(x)===i).join('');
  if(pas)h+=`<button class="btn" data-a="pass">Nothing to play: pass</button>`;
  h+=`</div></div>`;
  if(pl.length){if(full)h+=recHTML(K,d,pl,true);else if(UI.hint)h+=recHTML(K,d,pl,true);else h+=`<div class="row"><button class="btn small" data-a="hint">Show the safest move</button></div>`}
  else if(cns.length||gts.length||pas)h+=full||UI.hint?recHTML(K,d,pl,true):'';
  return h}
function passHTML(d){return `<div class="prompt passbox"><div class="big">${dot(d)} Pass the device to ${esc(nm(d))}</div><p>Hands are hidden until ${esc(nm(d))} takes the device.${G.q&&G.q.who===d?' '+esc(nm(d))+' must make a quick decision.':''}</p><button class="btn pri" data-a="take" data-seat="${d}">I am ${esc(nm(d))}</button></div>`}
function overHTML(){const o=G.over,w=o.win||[];const humansWin=w.some(i=>G.seats[i].human);
  return `<div class="prompt ${w.length?'':'alert'}" data-over="1"><h4>${w.length?(w.length>1?'Shared victory!':'Victory!'):'Lost at sea'}</h4><p>${w.map(i=>dot(i)+' <b>'+esc(nm(i))+'</b>').join(', ')||'Nobody'} ${w.length?'won':''}. ${esc(o.why)}</p><p class="tiny">${G.turn} turns, ${G.ships.filter(s=>s.alive).length} junk(s) afloat, ${G.stats.levMove||0} leviathan moves.</p>${isClient()?'<p class="tiny">Waiting for the host to start another game.</p><div class="row"><button class="btn" data-a="netleave">Leave</button><button class="btn" data-gx="rulesd">Rules</button></div>':'<div class="row"><button class="btn pri" data-a="again">Play again</button><button class="btn" data-a="newgame">New game</button><button class="btn" data-gx="rulesd">Rules</button></div>'}</div>`}
function mainHTML(){
  if(G.over)return overHTML();const d=sideToAct(),vs=viewSeat();
  if(UI.busy)return `<div class="prompt"><h4>${esc(UI.curTurn!=null&&G.seats[UI.curTurn]?nm(UI.curTurn):'The sea')} ...</h4><p class="tiny">Watch the board.</p><button class="btn small" data-a="skip">Skip animation</button></div>`+handStrip(vs,false);
  if(d<0)return '';const dh=G.seats[d].human;
  if(NET.on&&dh&&d!==NET.mySeat)return netWaitHTML(d,vs);
  if(dh&&mustPass(d))return passHTML(d);
  if(dh){UI.V={seat:d};
    if(G.q)return questionHTML(d)+handStrip(vs,false);
    if(G.phase==='setup')return startHTML(d);
    if(G.step==='act'){return placeHTML(d,knowledge(d))}return ''}
  return `<div class="prompt"><h4>${dot(d)} ${esc(nm(d))} is thinking...</h4><div class="row">${humans().length===0?`<button class="btn small" data-a="pause">${UI.pause?'Resume':'Pause'}</button>`:''}</div></div>`+handStrip(vs,false)}
