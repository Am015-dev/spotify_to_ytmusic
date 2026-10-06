// ===================== Short Fuse: the page (stage 2) =====================
// Every human input goes through act(move, seat) (the hook for the stage-3 network layer).
// Every seat's view is drawn from knowledge(seat) only (the hidden-information rule for hot-seat and online play).
AIDELAY=1250;ANIM=1;UI.sim=0;
Object.assign(UI,{started:false,holder:-1,sel:null,pause:false,speed:1,tickRate:1,help:false,xray:true,prev:null,aiT:null,seen:{},
  holdUntil:0,clockAcc:0,setup:null,wwk:null,offSeat:null,mode:'solo',rt:false,camp:null,ghost:null});
const SEATC=['#ff8a1f','#16b3a6','#8f5bff','#52c23a','#ff5c9a'];
const DEFNAMES=['Amber','Teal','Plum','Fern','Rosa'];
const LV_NAME={easy:'Easy',normal:'Normal',hard:'Hard'};
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c])}
const LET=k=>String.fromCharCode(65+k);
const VNm=v=>v==='Y'?'yellow':v==='R'?'red':String(v);
function lsGet(k,d){try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}}
function lsSet(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
// ---------- icons (inline SVG, one consistent stroke style) ----------
const ICO={
 bomb:'<circle cx="11" cy="14" r="7" fill="#1c1838"/><path d="M15 8l2-2m0 0l1.5 1.5M17 6c1-2 3-2 4-1" stroke="#ffc928" stroke-width="2" fill="none" stroke-linecap="round"/><circle cx="8.5" cy="11.5" r="1.6" fill="#fff" opacity=".8"/>',
 target:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1" fill="currentColor"/>',
 gear:'<path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/><circle cx="12" cy="12" r="4"/>',
 bulb:'<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.8.8 1 1.6 1 2.5h6c0-.9.2-1.7 1-2.5A6 6 0 0 0 12 3z"/>',
 scroll:'<path d="M7 4h11v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2h3V4z"/><path d="M10 8h5M10 12h5"/>',
 book:'<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5z"/><path d="M4 19a2 2 0 0 1 2-2h13"/>',
 cards:'<rect x="3" y="6" width="11" height="15" rx="2"/><path d="M8 3h11a2 2 0 0 1 2 2v13"/>',
 menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
 pause:'<path d="M8 5v14M16 5v14"/>',play:'<path d="M7 5l12 7-12 7z"/>',clock:'<circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2M10 2h4"/>',
 cut:'<circle cx="6" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M8.5 7.5L20 18M8.5 16.5L20 6"/>',
 hand:'<path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V11m0-6a1.5 1.5 0 0 1 3 0v6m0-4.5a1.5 1.5 0 0 1 3 0V14a6 6 0 0 1-6 6h-1a6 6 0 0 1-5-3l-2.5-4a1.5 1.5 0 0 1 2.5-1.6L8 13"/>',
 order:'<path d="M4 7h10M4 12h7M4 17h4M17 4v16m0 0l-3-3m3 3l3-3"/>',user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/>',
 mask:'<path d="M3 8c3-2 15-2 18 0 0 6-3 9-6 9-2 0-2-2-3-2s-1 2-3 2c-3 0-6-3-6-9z"/><circle cx="8.5" cy="11" r="1.5"/><circle cx="15.5" cy="11" r="1.5"/>',
 eye:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',x:'<path d="M6 6l12 12M18 6L6 18"/>',
 gift:'<rect x="4" y="9" width="16" height="11" rx="1"/><path d="M12 9v11M4 13h16M12 9c-2-4-6-4-6-1s6 1 6 1 6 2 6-1-4-3-6 1"/>',
 four:'<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
 mute:'<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M17 9l4 6M21 9l-4 6"/>',ban:'<circle cx="12" cy="12" r="9"/><path d="M6 6l12 12"/>',
 bus:'<rect x="3" y="5" width="18" height="12" rx="2"/><path d="M3 11h18M7 17v2M17 17v2"/>',flip:'<path d="M4 12a8 8 0 0 1 14-5l2-2v6h-6l2-2a5 5 0 0 0-9 3M20 12a8 8 0 0 1-14 5l-2 2v-6h6l-2 2a5 5 0 0 0 9-3"/>',
 snare:'<path d="M3 17c3-6 6 6 9 0s6 6 9 0"/><circle cx="12" cy="7" r="3"/>',star:'<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
 robot:'<rect x="5" y="8" width="14" height="11" rx="3"/><path d="M12 4v4M9 13h.01M15 13h.01M9 16h6"/>',bubble:'<circle cx="9" cy="14" r="5"/><circle cx="17" cy="7" r="3"/><circle cx="18" cy="15" r="2"/>',
 seven:'<path d="M6 5h12l-7 15"/>',calc:'<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M9 13h.01M12 13h.01M15 13h.01M9 17h.01M12 17h.01M15 17h.01"/>',
 drop:'<path d="M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11z"/>',trophy:'<path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8 21h8M9 17h6"/>',
 probe:'<path d="M4 20l7-7M11 13l3-9 6 6-9 3z"/>',map:'<path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z"/><path d="M9 4v14M15 6v14"/>',
 snd:'<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/>',music:'<path d="M9 18V6l11-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/>',
 plus:'<path d="M12 5v14M5 12h14"/>',back:'<path d="M15 6l-6 6 6 6"/>',fwd:'<path d="M9 6l6 6-6 6"/>',lock:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
 check:'<path d="M5 13l4 4 10-10"/>',swap:'<path d="M4 8h13l-3-3M20 16H7l3 3"/>',fuse:'<path d="M4 20c4-1 4-6 8-7s5-5 8-9"/><circle cx="20" cy="4" r="1.6" fill="currentColor"/>'};
function ico(n,cls){return `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"${cls?` class="${cls}"`:''}>${ICO[n]||''}</svg>`}
function paintIcons(root){for(const el of (root||document).querySelectorAll('[data-ico]')){if(el.dataset.icoDone)continue;el.dataset.icoDone=1;el.insertAdjacentHTML('afterbegin',el.dataset.ico==='bomb'?`<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">${ICO.bomb}</svg>`:ico(el.dataset.ico))}}
// ---------- seats and views ----------
function humans(){return G?G.seats.filter(q=>q.human).map(q=>q.i):[]}
function isHuman(s){return !!(G&&G.seats[s]&&G.seats[s].human)}
function modeOf(){if(NET.on)return NET.mySeat>=0?'solo':'watch';const h=humans().length;return h===0?'watch':h===1?'solo':'hot'}
function nm(s){return G&&G.seats[s]?G.seats[s].nm:'?'}
// ---- newcomer-review additions (all new UI strings live here) ----
const noGear=()=>!!G&&G.mission===1;
const GLOSSARY=[['Stand','The rack in front of you that holds your wires, sorted from low to high. Only you see the faces of your own stand. With 2 or 3 players some people hold two stands.'],
 ['Foreman','The player marked with a star (★). Starts the job and takes the first turn; the turn then passes clockwise.'],
 ['Info token','A marker placed in front of a wire that tells everyone its number (or, in some jobs, only even/odd or "not this number").'],
 ['Tag','To tag a wire is to put an info token in front of it. Everyone places one opening token at the start; a missed cut tags the wire that was pointed at.'],
 ['Fuse','The bomb timer. Every miss burns one step; when no step is left, the bomb goes off.'],
 ['Dual cut','Point at one wire of a crewmate and say a number you hold. If it matches, both wires are cut. If not, it is a miss.'],
 ['Solo cut','Cut every wire of one value yourself, when you hold all the wires of that value still uncut. It never fails.'],
 ['Equipment (gear)','Cards on the table that unlock when the crew cuts certain numbers. Some jobs have none.'],
 ['Personal tool','A tool on your crew card (for example the Twin Probe) that you can use once per job.'],
 ['Validation token','Goes on the track when all four wires of a value are cut: that value is finished.'],
 ['Red wire','Never match a red wire. Pointing at one blows up the bomb. A player holding only reds reveals them and is done.']];
const GLOSS_HTML='<h3>Glossary</h3><dl class="gloss">'+GLOSSARY.map(g=>`<dt>${g[0]}</dt><dd>${g[1]}</dd>`).join('')+'</dl>';
function hintify(t){return String(t).replace(/The fuse is lit\./,'Round 1 begins: the foreman (★) takes the first turn.').replace(/(reveals \d+ red wires? and is done\.)/,'$1 (a player who holds only red wires shows them and is finished)').replace(/(validation token (\d+) goes on the track\.)/,'$1 (every wire of value $2 is cut, so $2 is finished)')}
const DOING={infoStd:'choosing an opening info token',tagPick:'choosing which wire gets the info token',pickMatch:'choosing which wire to cut',swapPick:'choosing a wire to trade',designate:'choosing who must cut',declare:'turning over a number card'};
function doing(q){return (q&&DOING[q.kind])||'answering a question'}
function wLabel(u){const f=findU(u);if(!f)return {s:0,k:0,t:'?'};const sl=G.st[f.s].w[f.k];const v=sl&&ownerOf(f.s)===(UI.V&&UI.V.seat)?cv(sl.id):null;return {s:f.s,k:f.k,t:`wire ${LET(f.k)}${v!=null?' ('+VNm(v)+')':''}`}}
function decider(){if(!G||G.over)return -1;return sideToAct()}
// hot-seat: the device must change hands when a human other than the holder must decide
function passTo(){if(NET.on||modeOf()!=='hot'||!G||G.over)return -1;if(UI.offSeat!=null)return UI.offSeat===UI.holder?-1:UI.offSeat;const s=decider();
  if(s>=0&&isHuman(s)&&s!==UI.holder)return s;
  if(s<0&&(G.step==='claim'||G.step==='snip')){const h=humans();if(UI.holder<0&&h.length)return h[0]}
  if(UI.holder<0){const h=humans();return h.length?h[0]:-1}return -1}
// the seat whose eyes the page shows: solo = the human, hot-seat = the holder (none while passing), watch = nobody
function viewer(){if(NET.on)return NET.mySeat;const m=modeOf();if(m==='watch')return -1;if(m==='solo')return humans()[0];if(passTo()>=0)return -1;return UI.holder}
// the seat at the bottom of the table
function kitMe(){if(NET.on&&NET.mySeat<0)return 0;const v=viewer();if(v>=0)return v;const p=passTo();if(p>=0)return p;const h=humans();return h.length?h[0]:0}
// a spectator view (watch mode with x-ray, or the neutral hot-seat view with every hidden wire turned away)
function spectatorView(xray){const K=knowledge(kitMe());
  for(const st of K.stands){st.mine=false;const S=G.st[st.i];st.slots.forEach((x,k)=>{const sl=S.w[k];if(xray){x.v=cv(sl.id);x.s=WIRES[sl.id].s;x.c=WIRES[sl.id].c}else if(!x.cut){x.v=null;x.s=null;x.c=null}})}
  K.seat=-1;K.legal=null;K.q=G.q?{who:G.q.who,kind:G.q.kind}:null;K.off=[];if(!xray)for(const q of K.seats){q.cards=G.mission===65?q.cards:null;if(q.con&&G.ms.mole)q.con='?'}return K}
function view(){const v=viewer();if(v>=0)return knowledge(v);return spectatorView(modeOf()==='watch'&&UI.xray&&!NET.on)}
function posOf(s){return G.pos[s]}
function seatStands(seat){return standsOf(seat).slice().sort((a,b)=>a-b)}
function wireName(si,k,V){const own=ownerOf(si);const ss=seatStands(own);const two=ss.length>1;const who=V&&own===V.seat?'your':nm(own)+'\'s';return `${who} wire ${LET(k)}${two?' (stand '+(ss.indexOf(si)+1)+')':''}`}
// engine texts say "stand 3, slot 2": rewrite to the letters on the table
function nice(t,V){return hintify(t).replace(/Miss: none of those is ([^.]+)\./g,'Miss: wrong number (not $1).').replace(/\b(Cut|Tag) slot (\d+)\b/g,(m,a,b)=>a+' wire '+LET(+b-1)).replace(/stand (\d+),? slots? ([\d,]+)/g,(m,a,b)=>{const si=+a-1;if(!G.st[si])return m;const ks=b.split(',').map(x=>+x-1);return ks.length>1?wireName(si,ks[0],V).replace(/wire [A-Z]/,'wires '+ks.map(LET).join(', ')):wireName(si,ks[0],V)})}
// ---------- the one entry point for human input (stage 3 intercepts here) ----------
function act(m,seat){if(!G||G.over)return {success:false,error:'no game'};if(seat==null)seat=viewer();
  if(!isHuman(seat))return {success:false,error:'not a human seat'};
  if(typeof window.NET_INTERCEPT==='function'){const r=window.NET_INTERCEPT(m,seat);if(r)return r}
  const err=legal(m,seat);if(err){toast(err);sfx('buzzer');return {success:false,error:err}}
  if(isClient()){if(seat!==NET.mySeat||(NET.pend===G.logN&&Date.now()-NET.pendT<2500))return {success:false,error:'wait'};NET.pend=G.logN;NET.pendT=Date.now();UI.sel=null;sfx('click');netSend(m);refresh();return {success:true,sent:1}}
  UI.sel=null;UI.offSeat=null;UI.lastActor=seat;if(modeOf()==='solo'){UI.aiNotBefore=Date.now()+1700/UI.speed}sfx('click');return applyMove(m,seat)}
function applyMove(m,seat){const r=performMove(m,seat);if(!r.success){console.error('move rejected: '+r.error+' '+JSON.stringify(m));refresh()}return r}
// ---------- snapshots: what changed since the last refresh (drives sounds, effects and the result banner) ----------
function snap(){const cut=new Set(),tok={};for(const s of G.st)for(const x of s.w){if(x.cut)cut.add(x.u);tok[x.u]=x.tok.length}let side=0;for(const s of G.st)side+=s.side.length;
  return {g:G.seed+':'+G.mission,logN:G.logN,dial:G.dial,cut,tok,side,valid:G.valid.length,over:!!G.over,rf:G.ms.rf?G.ms.rf.at:null,turn:G.turn}}
// whose turn a log turn number was (from the "— X's turn —" line); -1 for the opening
// a later result on the same turn of yours (the tag after a miss, the fuse step) belongs to the same card
function turnActor(t){const l=G.log.find(x=>x.turn===t&&x.c==='turn');if(!l)return -1;const m=/— (.+)'s turn —/.exec(l.t);const q=m&&G.seats.find(x=>x.nm===m[1]);return q?q.i:-1}
function diffFx(a,b){if(!a||a.g!==b.g){UI.lastActor=null;return}const newLog=G.log.filter(l=>l.i>a.logN).reverse();if(!newLog.length&&b.dial===a.dial){UI.lastActor=null;return}
  const newCut=[...b.cut].filter(u=>!a.cut.has(u));const newTok=Object.keys(b.tok).filter(u=>b.tok[u]>(a.tok[u]||0)).map(Number);
  const txt=newLog.map(l=>l.t).join(' ');
  const dialDown=b.dial!=null&&a.dial!=null&&b.dial<a.dial||(b.rf!=null&&a.rf!=null&&b.rf>a.rf&&/miss/i.test(txt)),dialUp=b.dial!=null&&a.dial!=null&&b.dial>a.dial;
  let kind=null;
  if(b.over&&!a.over)kind=G.over.win?'win':'boom';
  else if(/Miss|miss:|missed|wrong/.test(txt)&&dialDown||(/Miss/.test(txt)&&!newCut.length))kind='miss';
  else if(newCut.length&&/solo/i.test(txt))kind='solo';
  else if(newCut.length&&/Hit!|cuts|reveals|all at once|cut at once/i.test(txt))kind=/reveals/.test(txt)?'reveal':'hit';
  else if(dialUp)kind='phew';
  else if(newCut.length)kind='hit';
  else if(dialDown)kind='miss';
  UI.lastActor=null;
  UI.lastKind=kind;
  if(!ANIM)return;
  if(kind==='hit'||kind==='solo'||kind==='reveal'){newCut.forEach((u,i)=>fx('cut',u));sfx(kind==='solo'?'solo_cut':kind==='reveal'?'reveal':newCut.length>1?'double_cut':'cut')}
  if(kind==='miss'){fx('miss',newTok[0]!=null?newTok[0]:null);sfx('wrong');sfx('dial',{at:.25});if(newTok.length)sfx('info',{at:.45});
    if(G.dial===1)setTimeout(()=>sfx('tick_last'),700);else sfx('tick',{at:.6})}
  if(kind==='phew'){fx('phew');sfx('phew')}
  if(b.valid>a.valid){fx('coin');sfx('validate',{at:.35})}
  if(/is unlocked|turns up/.test(txt))sfx('gadget',{at:.2});
  if(/Sweep for|sweeps/.test(txt))sfx('scanner');
  if(/Handsets|trade|pulls/.test(txt)&&!kind)sfx('flip');
  if(kind==='win'){musicStop(.4);sndLoop('clock_loop',false);fx('win');sfx('phew');sfx('win',{at:.8})}
  if(kind==='boom'){musicStop(.3);sndLoop('clock_loop',false);fx('boom',newTok[0]!=null?newTok[0]:null);sfx('boom');sfx('lose',{at:1.6})}}
// ---------- refresh: called by the engine after every move ----------
function refresh(){if(!G||!UI.started)return;try{if(window.PerfHUD)PerfHUD.wake()}catch(e){}
  const s=snap();diffFx(UI.prev,s);UI.prev=s;
  saveNow();
  if(G.prompt&&(!UI.lastPrompt||UI.lastPrompt.t!==G.prompt.t||UI.lastPrompt.say!==G.prompt.say)){UI.lastPrompt=Object.assign({},G.prompt);UI.holdUntil=Date.now()+(ANIM?1500:0);sfx('radar');if(UI.rt)toast(G.prompt.say)}
  if(G.over&&!UI.campDone){UI.campDone=1;recordResult();try{campOver()}catch(e){console.error(e)}}
  const V=view();UI.V=V;
  if(UI.sel&&!selValid(V))UI.sel=null;
  renderTable(V);renderOpenDrawer();audioMood(V);
  const need=humanNeeded();
  if(need&&need!==UI.lastNeed){UI.lastNeed=need;if(ANIM)sfx('turn')}if(!need)UI.lastNeed=null;
  schedule();netAfter()}
function humanNeeded(){if(!G||G.over)return null;const p=passTo();if(p>=0)return 'pass'+p;const v=viewer();if(v<0)return null;const s=decider();if(s===v)return 'me'+G.turn+':'+(G.q?G.q.kind:G.step);return null}
function saveNow(){if(NET.on)return;try{if(G&&!G.over&&humans().length)localStorage.setItem(SAVE,JSON.stringify({G,ui:{holder:UI.holder,rt:UI.rt,camp:UI.camp?UI.camp.id:null}}));else if(G&&G.over)localStorage.removeItem(SAVE)}catch(e){}}
// ---------- the computer crew ----------
function aiHeld(){return !!(G&&!G.over&&UI.brief)}
function schedule(){if(isClient()||UI.aiT||!G||G.over||UI.pause||!UI.started||aiHeld())return;
  if(UI.sel&&UI.sel.off)return;                 // a human is choosing an any-time card: wait
  const s=decider();const open=G.step==='claim'||G.step==='snip';
  if(s>=0&&isHuman(s)&&!open){if(UI.offChecked!==G.logN){UI.offChecked=G.logN;const st=aiStep();if(st&&!isHuman(st.seat))UI.aiT=setTimeout(()=>{UI.aiT=null;if(G&&!G.over&&!UI.pause&&!legal(st.m,st.seat))applyMove(st.m,st.seat)},ANIM?AIDELAY/UI.speed:0)}return}
  if(passTo()>=0&&!open)return;
  let d=ANIM?AIDELAY/UI.speed:0;if(open&&humans().length&&ANIM)d=Math.max(d,2200/UI.speed);if(ANIM&&UI.aiNotBefore)d=Math.max(d,UI.aiNotBefore-Date.now());
  if(!ANIM&&open&&humans().length)d=AIDELAY;
  UI.aiT=setTimeout(()=>{UI.aiT=null;if(!G||G.over||UI.pause)return;if(UI.sel&&UI.sel.off){schedule();return}
    let st=null;try{st=aiStep()}catch(e){console.error(e);return}if(!st)return;if(isHuman(st.seat))return;
    const go=()=>{UI.aiT=null;if(!G||G.over||UI.pause)return;if(legal(st.m,st.seat)){refresh();return}applyMove(st.m,st.seat)};
    if(ANIM&&st.m.a==='dual'){try{announce(st.m,st.seat)}catch(e){}UI.aiT=setTimeout(go,620/UI.speed)}else go()},d)}
// ---------- the real-time clock (timed jobs) ----------
function timedJob(){return !!(G&&UI.rt)}
function clockLeft(K){const ms=K.ms;if(ms.timer)return {left:ms.timer.show,real:ms.timer.left,label:'Clock'};if(ms.redTide)return {left:ms.redTide.left,real:ms.redTide.left,label:'Air'};
  if(ms.bus){const e=ms.bus.finalEnd!=null?ms.bus.finalEnd:ms.bus.ends;return e!=null?{left:Math.max(0,e-K.clock),real:Math.max(0,e-K.clock),label:ms.bus.finalEnd!=null?'Final dash':'Target'}:null}
  if(ms.bunker&&ms.bunker.ends!=null)return {left:Math.max(0,ms.bunker.ends-K.clock),real:Math.max(0,ms.bunker.ends-K.clock),label:'Objective'};
  if(ms.circus&&ms.circus.next!=null)return {left:Math.max(0,ms.circus.next-K.clock),real:999,label:'Next act'};return null}
function clockRunning(){return !isClient()&&timedJob()&&UI.started&&!UI.pause&&!UI.brief&&G&&!G.over&&G.phase==='turn'&&!G.q&&passTo()<0&&Date.now()>=UI.holdUntil&&!(document.hidden)}
function clockTick(){if(!clockRunning()){UI.clockAcc=0;sndLoop('clock_loop',false);return}
  UI.clockAcc+=.25*UI.tickRate;sndLoop('clock_loop',SND.on&&!!ANIM);if(UI.clockAcc>=1){const n=Math.floor(UI.clockAcc);UI.clockAcc-=n;tick(n)}}
const fmt=s=>{s=Math.max(0,Math.round(s));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')};
function togglePause(){if(isClient()){toast('Only the host can pause the job.');return}UI.pause=!UI.pause;if(!UI.pause){clearTimeout(UI.aiT);UI.aiT=null}toast(UI.pause?'Paused: the clock and the computer crew wait.':'Play resumes.');refresh()}
// ---------- music mood ----------
function audioMood(V){if(!G||G.over)return;const c=timedJob()?clockLeft(V):null;const low=(G.dial!=null&&G.dial<=1)||(G.ms.rf&&G.ms.rf.at>=10)||(c&&c.real<30);musicMood(low?'tension':'main')}
function tid(u){return 'g'+(UI.gameN||0)+'u'+u}
function uOf(id){const m=/u(\d+)$/.exec(String(id));return m?+m[1]:null}
function kitReset(){UI.gameN=(UI.gameN||0)+1;UI.fuseG=null;UI.fuseMax=0;UI.sel=null}
function shortEq(id){return ({eq1:'Tag two different neighbours',eq2:'Trade a wire face down',eq3:'Probe three wires',eq4:'Show one of your values',eq5:'Probe a whole stand',eq6:'Fuse back one step',eq7:'Wake spent tools',eq8:'Everyone says yes or no',eq9:'Your miss burns nothing',eq10:'Say two values',eq11:'Skip, pick who is next',eq12:'Tag two equal neighbours',eqY:'Two more gear cards',eq22:'Mark a lone value',eq33:'Used gear works again',eq99:'Solo-cut two',eq1010:'Cut a random number',eq1111:'Pull a crewmate wire'})[id]||''}
function missionCards(V){const n=G.mission,M=MISSIONS[n],ms=V.ms;const o={mission:{number:n,name:M.nm,text:M.text,difficulty:Math.min(5,1+Math.floor((n-1)/13))},numbers:[],constraints:[],challenges:[]};
  if(ms.gate){o.numbers=ms.gate.vals.map((v,i)=>({value:v,done:i<ms.gate.at}));o.sequence={side:ms.gate.req===4?'B':'A',at:ms.gate.at}}
  if(ms.fakeRed&&ms.fakeRed.v!=null)o.numbers=[{value:ms.fakeRed.v}];
  if(ms.eqDeckReveal&&ms.eqDeckReveal.face!=null)o.numbers=[{value:ms.eqDeckReveal.face}];
  if(ms.searchlight&&ms.searchlight.v!=null)o.numbers=[{value:ms.searchlight.v}];
  if(ms.special4&&ms.special4.v!=null)o.numbers=[{value:ms.special4.v,done:!!ms.special4.done}];
  if(ms.declare&&ms.declare.v!=null)o.numbers=[{value:ms.declare.v}];
  if(ms.line5)o.numbers=ms.line5.vals.map(v=>({value:v}));
  if(ms.meteor)o.numbers=ms.meteor.vals.map(v=>({value:v,done:!!G.fin[v]}));
  if(ms.volunteer&&ms.volunteer.v!=null)o.numbers=[{value:ms.volunteer.v}];
  if(ms.sir&&ms.sir.v!=null)o.numbers=[{value:ms.sir.v}];
  if(ms.robotLine&&ms.robotLine.line)o.numbers=ms.robotLine.line.map(v=>({value:v,done:!!G.fin[v]}));
  if(ms.math&&ms.math.up)o.numbers=ms.math.up.map(v=>({value:v}));
  if(ms.globCon&&ms.globCon.con)o.constraints.push({letter:ms.globCon.con});
  V.seats.forEach(q=>{if(q.con&&q.con!=='?')o.constraints.push({letter:q.con,seat:q.pos,faceDown:!!q.conDown});else if(q.con==='?')o.constraints.push({letter:'?',seat:q.pos,faceDown:true})});
  if(ms.challenges)o.challenges=ms.challenges.cards.map(c=>({n:c.id,done:!!c.dead}));
  if(ms.bunker)o.bunker={floor:(ms.bunker.f||0)+1};
  return o}
// which wires glow now
function toolN(t){return t==='dd'?2:t==='eq3'||t==='pt3'?3:t==='eq5'?99:1}
function eq5Slots(si){return G.st[si].w.map((x,k)=>k).filter(k=>{const x=G.st[si].w[k];return !x.cut&&!x.x&&!x.flip})}
function onTile(si,k){const V=UI.V;if(!V||V.seat<0||G.over)return;const sl=G.st[si].w[k];
  // a question that names wires
  if(V.q&&V.q.who===V.seat&&V.q.opts){const i=V.q.opts.findIndex(o=>o.d&&(o.d.u===sl.u||(o.d.st===si&&o.d.k===k)));if(i>=0){answer(i);return}toast('Pick one of the glowing wires, or use the buttons.');return}
  const sel=UI.sel;
  if(sel&&sel.mode==='choose'){const step=nextStep(sel);if(step&&step.board){const ok=selRemaining(sel).filter(m=>m[step.board[0]]===si&&m[step.board[1]]===k);if(ok.length){sel.fixed[step.board[0]]=si;sel.fixed[step.board[1]]=k;sel.picked=[{s:si,k}];sfx('select');refresh();return}}toast('That wire cannot be used for this.');return}
  if(sel&&sel.mode==='multi'){if(sl.cut)return;const i=sel.tg.findIndex(t=>t.s===si&&t.k===k);if(i>=0)sel.tg.splice(i,1);else if(sel.tg.length<sel.n)sel.tg.push({s:si,k});sfx('select');refresh();return}
  const L=V.legal;if(!L){toast(G.actor>=0?`It is ${nm(G.actor)}'s turn.`:'Not now.');return}
  if(sel&&sel.mode==='flipown'){toast('Pick which of your flipped wires you mean with the buttons.');return}
  const isTarget=L.plain.some(m=>m.st===si&&m.ks[0]===k);
  if(sel&&sel.mode==='dual'&&sel.tg.length){const st0=sel.tg[0].st;const need=toolN(sel.tool);
    const j=sel.tg.findIndex(t=>t.st===si&&t.k===k);if(j>=0){sel.tg.splice(j,1);if(!sel.tg.length)sel.v=null;sfx('select');refresh();return}
    if(si===st0&&need>sel.tg.length&&need!==99&&isTarget){sel.tg.push({st:si,k});sel.tg.sort((a,b)=>a.k-b.k);sfx('select');refresh();return}
    if(!isTarget){toast(ownerOf(si)===V.seat?'Point at a crewmate\'s wire, not your own.':'That wire cannot be pointed at now.');return}
    sel.tg=[{st:si,k}];if(sel.tool==='eq5')sel.tg=eq5Slots(si).map(x=>({st:si,k:x}));sel.v=keepV(sel);sfx('select');refresh();return}
  if(!isTarget){toast(ownerOf(si)===V.seat?'Those are your own wires: point at a crewmate\'s wire.':sl.cut?'That wire is already cut.':'That wire cannot be pointed at now.');return}
  UI.sel=Object.assign(sel&&sel.mode==='dual'?sel:{mode:'dual',tool:null,v:null,v2:null,two:null,fu:null},{tg:[{st:si,k}]});if(UI.sel.tool==='eq5')UI.sel.tg=eq5Slots(si).map(x=>({st:si,k:x}));UI.sel.v=keepV(UI.sel);sfx('select');refresh()}
function keepV(sel){if(sel.v==null)return null;return dualVals(sel).includes(sel.v)?sel.v:null}
function selValid(V){const s=UI.sel;if(!s)return true;if(s.off)return s.offSeat===V.seat||modeOf()!=='hot';if(!V.legal&&s.mode!=='choose')return false;if(s.mode==='choose'&&!s.off&&!V.legal)return false;return true}
// ---------- building a dual cut ----------
function dualVals(sel){const L=UI.V&&UI.V.legal;if(!L||!sel.tg.length)return [];const t=sel.tg[0];const src=sel.fu!=null?L.flip.filter(m=>m.fu===sel.fu):L.plain;
  let vs=[...new Set(src.filter(m=>m.st===t.st&&m.ks[0]===t.k).map(m=>m.v))];if(sel.tool)vs=vs.filter(v=>v!=='Y');return vs.sort((a,b)=>(a==='Y'?99:a)-(b==='Y'?99:b))}
function buildDual(sel){if(!sel||!sel.tg.length||sel.v==null)return null;const L=UI.V.legal;const t=sel.tg[0];
  const src=(sel.fu!=null?L.flip:L.plain).find(m=>m.st===t.st&&m.v===sel.v&&(sel.fu==null||m.fu===sel.fu));
  const m={a:'dual',st:t.st,ks:sel.tg.map(x=>x.k),v:sel.v};if(src)for(const key in src)if(!['a','st','ks','v'].includes(key))m[key]=src[key];
  if(sel.tool)m.tool=sel.tool;if(sel.two&&sel.v2!=null){m.two=sel.two;m.v2=sel.v2}if(sel.fu!=null){m.own='flip';m.fu=sel.fu}return m}
function heldCount(V,v){let n=0;for(const st of V.stands)if(st.mine)for(const x of st.slots)if(!x.cut&&x.v===v&&!x.flip)n++;return n}
// ---------- the generic chooser (equipment, tools, job actions with parameters) ----------
const STEPS={eq1:[{board:['s','k']}],eq12:[{board:['s','k']}],eq2:[{board:['s','k']},{key:'to'}],eq4:[{board:['s','k']},{key:'fv'}],eq6:[],eq7:[{key:'who'}],eq8:[{key:'v'}],eq9:[],eq11:[{key:'next'}],eq22:[{board:['s','k']}],
  eq1111:[{board:['ts','tk']},{key:'s'}],'item:sweep':[{key:'v'}],'item:handsets':[{board:['s','k2']},{key:'to'}],trip:[{board:['s','k']}],redcall:[{board:['s','k']}],accuse:[{key:'who'},{key:'con'}]};
function moveKey(m){return m.a==='eq'?m.id:m.a==='item'?'item:'+m.k:m.a}
function keyName(m){const k=moveKey(m);if(k.startsWith('item:'))return ITEMS[m.k].n;if(m.a==='eq')return EQUIP[m.id].n;return ({trip:'Point at a snare wire',redcall:'Call RED on a wire',accuse:'Accuse the mole',swapCon:'Swap your restriction',pass:'Pass',claim:'Claim the next turn',snip:'"Snip!" I will cut it',nosnip:'Nobody calls',snipReveal:'Reveal my reds',tada:'Shout "ta-da!"',signal:'Signal: I need oxygen',reveal:'Reveal my reds'})[k]||k}
function stepsOf(key){return STEPS[key]||[]}
function selRemaining(sel){return sel.opts.filter(m=>Object.keys(sel.fixed).every(k=>JSON.stringify(m[k])===JSON.stringify(sel.fixed[k])))}
function nextStep(sel){for(const st of stepsOf(sel.key)){const rem=selRemaining(sel);if(!rem.length)return null;
  if(st.board){if(!(st.board[0] in sel.fixed))return st;continue}if(st.key in sel.fixed)continue;
  const vals=new Set(rem.map(m=>JSON.stringify(m[st.key])));if(vals.size>1)return st}return null}
function paramLabel(key,v,m,V){if(key==='to'||key==='next')return nm(v);if(key==='who')return Array.isArray(v)?v.map(nm).join(' and '):nm(v);if(key==='v')return VNm(v);if(key==='fv')return 'Show "NOT '+v+'"';
  if(key==='con')return v+': '+(CONSTRAINTS[v]?CONSTRAINTS[v].n:'');if(key==='s')return 'Into your stand '+(seatStands(V.seat).indexOf(v)+1);return String(v)}
function startChoose(moves,off){const key=moveKey(moves[0]);UI.sel={mode:'choose',key,opts:moves,fixed:{},picked:[],off:!!off,offSeat:off?UI.V.seat:null};sfx('select');
  if(off&&(UI.aiT)){clearTimeout(UI.aiT);UI.aiT=null}refresh()}
// ---------- answering questions ----------
function answer(i){const V=UI.V;act({a:'q',i},V.seat)}
function sugText(m,V){if(!m)return '';switch(m.a){case 'dual':return `Say ${VNm(m.v)}${m.v2!=null?' or '+VNm(m.v2):''} at ${m.ks.length>1?nm(ownerOf(m.st))+'\'s wires '+m.ks.map(LET).join(', '):wireName(m.st,m.ks[0],V)}${m.tool?' with the '+toolName(m.tool):''}`;case 'solo':return `Solo cut your ${VNm(m.v)}s`;case 'reveal':return 'Reveal your reds';
  case 'eq':return 'Use '+EQUIP[m.id].n;case 'item':return 'Use '+ITEMS[m.k].n;case 'multi':return 'Point at '+m.tg.length+' wires at once';default:return keyName(m)}}
function toolHelp(t){return ({dd:'Twin Probe (once per job): point at 2 wires on one rack and say one number. A hit if either matches.',pt3:'Triple Probe (once per job): point at 3 wires on one rack and say one number. A hit if any matches.',eq3:'Point at 3 wires on one rack and say one number. A hit if any matches.',eq5:'Point at a whole rack and say one number. A hit if any wire matches.',pt10:'Say two numbers at once: a hit if the wire is either.',eq10:'Say two numbers at once: a hit if the wire is either.'})[t]||''}
function toolName(t){return t==='dd'?'Twin Probe':t==='pt3'?'Pocket Triple Probe':t==='pt10'?'Pocket Two-Value Probe':EQUIP[t]?EQUIP[t].n:t}
// the cached "what we know" for the current position
function wwk(V){if(V.seat<0)return null;const key=G.logN+':'+V.seat+':'+G.turn;if(UI.wwk&&UI.wwk.key===key)return UI.wwk.W;let W=null;try{W=whatWeKnow(V.seat,ANIM?80:24)}catch(e){console.error(e)}UI.wwk={key,W};return W}
function multiName(k){return ({red3:'Grab the three reds',four:'Point at all four',sevens:'Cut the four 7s',y3:'Point at the three yellows',lever:'Pull the lever (two yellows)',rush:'Yellow rush'})[k]||'All at once'}
// ---------- drawers ----------
function renderOpenDrawer(){const id=GX.open;if(!id||!G)return;if(id==='logd')renderLog();else if(id==='missiond')renderMission();else if(id==='geard')renderGear();else if(id==='setd')renderSettings()}
function renderLog(){const V=UI.V||view();$('#logbody').innerHTML=G?`<div class="loglist">${G.log.map(l=>`<div class="lg-${l.c||'n'}">${esc(nice(l.t,V))}</div>`).join('')}</div>`:'<p>No job yet.</p>'}
function mixHTML(n,np){const M=MISSIONS[n];const two=np===2&&M.two||{};const R=two.red!==undefined?two.red:M.red,Y=two.yel!==undefined?two.yel:M.yel;let h=`<span class="mix"><span class="mw b">1</span>…<span class="mw b">${M.blue}</span> <b>×4</b>`;
  if(Y){const n=Y.n==='players_max_4'?'1/player':Y.n;h+=` + ${Y.m==='of'?`<span class="mw y">${n}</span> of ${Y.of}`:`<span class="mw y">${n}</span>`} yellow`}if(R){h+=` + ${R.m==='of'?`<span class="mw r">${R.n}</span> of ${R.of}`:`<span class="mw r">${R.n}</span>`} red`}return h+'</span>'}
function fuseStart(n,np){const d=MISSIONS[n].dial;return d==='players'?np:d==='players+1'?Math.min(DIAL_MAX,np+1):d==null?'robot':d}
function ruleChips(n){const M=MISSIONS[n];const out=[];for(const r of M.rules){const d=RULE_DOC[r.k];if(d)out.push(d)}if(TOKFAM_DOC[M.tok])out.push(['eye','Tokens',TOKFAM_DOC[M.tok]]);if(INFO_DOC[M.info])out.push(['info','Opening',INFO_DOC[M.info]]);return out}
function renderMission(){const n=G.mission,M=MISSIONS[n],V=UI.V||view();const chips=ruleChips(n);
  let h=`<div class="mcard"><div class="mh"><b>${n}</b><h3>${esc(M.nm)}</h3></div><div class="mb"><p class="flav">${esc(BRIEFS[n]||'')}</p>
  <div class="tags"><span class="tag b">${mixHTML(n,G.np)}</span><span class="tag">${ico('fuse')}Fuse starts at ${fuseStart(n,G.np)}</span><span class="tag e">${ico('gear')}${G.eq.length} gear card${G.eq.length===1?'':'s'}</span>${M.audio||hasRule(n,'timer')?`<span class="tag t">${ico('clock')}Timed</span>`:''}</div>
  <p>${esc(M.text)}</p>${chips.length?chips.map(c=>`<div class="rule"><span class="ri">${ico(c[0])}</span><div><b>${esc(c[1])}</b><p>${esc(c[2])}</p></div></div>`).join(''):'<div class="rule"><span class="ri">'+ico('check')+'</span><div><b>No special rules</b><p>Just the basic game: dual cuts, solo cuts and the fuse.</p></div></div>'}
  ${cardsRow(V)}${jobNow(V)}</div></div>`;$('#missionbody').innerHTML=h}
function cardsRow(V){const mc=missionCards(V);let h='';if(mc.numbers.length)h+=`<div><div class="lbl">Number cards on the table</div><div class="mix">${mc.numbers.map((c,i)=>`<span class="mw b" style="width:30px;height:40px;font-size:1rem;${c.done?'opacity:.45':''}${mc.sequence&&mc.sequence.at===i?';outline:3px solid #8f5bff':''}">${esc(c.value)}</span>`).join('')}</div></div>`;
  if(mc.constraints.length)h+=`<div><div class="lbl">Restrictions</div>${mc.constraints.map(c=>`<div class="rule"><span class="ri" style="background:#ffd9d4;font:1.3rem var(--fd)">${esc(c.letter)}</span><div><b>${c.seat!=null?esc(nm(G.pos.indexOf(c.seat)))+': ':'Everyone: '}${c.letter==='?'?'hidden':esc(CONSTRAINTS[c.letter].n)}${c.faceDown&&c.letter!=='?'?' (turned down)':''}</b><p>${c.letter==='?'?'Face down.':esc(CONSTRAINTS[c.letter].text)}</p></div></div>`).join('')}</div>`;
  if(mc.challenges.length)h+=`<div><div class="lbl">Dares</div>${mc.challenges.map(c=>`<div class="rule"><span class="ri" style="background:#dff7e8;font:1.3rem var(--fd)">${c.n}</span><div><b>${esc(CHALLENGES[c.n].n)}${c.done?' (cannot be met any more)':''}</b><p>${esc(CHALLENGES[c.n].text)}</p></div></div>`).join('')}</div>`;return h}
function jobNow(V){const lines=jobState(V);return lines.length?`<div class="now"><b>Right now</b><ul class="ann">${lines.map(l=>`<li>${esc(l)}</li>`).join('')}</ul></div>`:''}
function jobState(V){const ms=V.ms,o=[];const N=s=>nm(s);
  if(ms.gate)o.push(`Order: ${ms.gate.vals.join(' → ')}. ${ms.gate.at>0?'Cleared: '+ms.gate.vals.slice(0,ms.gate.at).join(', ')+'. ':''}${ms.gate.at<ms.gate.vals.length?'Next in the order: '+ms.gate.vals[ms.gate.at]+' (cut '+ms.gate.req+' of it to open the next one).':'All order cards are cleared.'}`);
  if(ms.timer)o.push(`The clock shows ${fmt(ms.timer.show)}.`);if(ms.freeTurns&&ms.freeTurns.last!=null)o.push(`${N(ms.freeTurns.last)} played last and may not claim the next turn.`);
  if(ms.fakeRed&&ms.fakeRed.v!=null)o.push(`Blue ${ms.fakeRed.v} acts as red: never cut it.`);
  if(ms.eqCover)o.push('Covers: '+G.eq.map((e,i)=>e.cover!=null?`${EQUIP[e.id].n} needs two ${e.cover}s`:null).filter(Boolean).join('; ')+'.');
  if(ms.rookie&&ms.rookie.rookie!=null)o.push(`The rookie is ${N(ms.rookie.rookie)}.`);if(ms.liar&&ms.liar.liar!=null)o.push(`The fibber is ${N(ms.liar.liar)}.`);
  if(ms.eqDeckReveal)o.push(`Shown number: ${ms.eqDeckReveal.face!=null?ms.eqDeckReveal.face:'none'} (${ms.eqDeckReveal.left} cards left).`);
  if(ms.searchlight&&ms.searchlight.v!=null)o.push(`Searchlight on ${ms.searchlight.v}${ms.searchlight.who!=null?`: ${N(ms.searchlight.who)} must cut it`:''}.`);
  if(ms.xWire)o.push(ms.xWire.locked?'X wires are locked until every yellow is cut.':'X wires may be cut (but no gear can touch them).');
  if(ms.special4&&ms.special4.v!=null)o.push(`All-four value: ${ms.special4.v}${ms.special4.done?' (done)':''}.`);
  if(ms.declare)o.push(`Face-up number cards: ${ms.declare.up.join(', ')||'none'}${ms.declare.v!=null?`. Called: ${ms.declare.v}`:''}.`);
  if(ms.mindRead&&ms.mindRead.counts)o.push('Secret cards in hand: '+ms.mindRead.counts.map((c,i)=>N(i)+' '+c).join(', ')+'.');
  if(ms.bus)o.push(`Targets: ${ms.bus.tg.join(', ')||'none'}${ms.bus.lock?' (only these may be cut)':''}.`);
  if(ms.globCon&&ms.globCon.con)o.push(`Shared restriction ${ms.globCon.con}: ${CONSTRAINTS[ms.globCon.con].text}`);
  for(const q of V.seats)if(q.con)o.push(`${q.nm}: restriction ${q.con==='?'?'hidden':q.con+(q.conDown?' (turned down)':': '+CONSTRAINTS[q.con].text)}`);
  if(ms.mole)o.push(ms.mole.hidden?'The weak link is still hidden.':'The weak link was found.');
  if(ms.line5)o.push(`Line: ${ms.line5.vals.join(' · ')}. The arrow points at ${ms.line5.head}.`);
  if(ms.circus)o.push(`Next act at ${fmt(ms.circus.next||0)} of play${ms.circus.tada?'. Shout "ta-da!" when you cut':''}.`);
  if(ms.robotPatrol)o.push(`The robot stands on ${ms.robotPatrol.at}, walking ${ms.robotPatrol.dir>0?'up':'down'}, holding ${ms.robotPatrol.n} wire${ms.robotPatrol.n===1?'':'s'}.`);
  if(ms.oxygen)o.push(`Oxygen: reserve ${ms.oxygen.res}; `+V.seats.map(q=>q.nm+' '+q.ox).join(', ')+'.');
  if(ms.volunteer&&ms.volunteer.v!=null)o.push(`Card: ${ms.volunteer.v}${ms.volunteer.who!=null?`, called by ${N(ms.volunteer.who)}`:''}.`);
  if(ms.math&&ms.math.up)o.push(`Face-up cards: ${ms.math.up.join(', ')}.`);
  if(ms.sir&&ms.sir.v!=null)o.push(`The boss calls ${ms.sir.v}${ms.sir.who!=null?' for '+N(ms.sir.who):''}.`);
  if(ms.robotFuse)o.push(`The robot fuse is at ${ms.robotFuse.at} of 12.`);if(ms.redTide)o.push(`${ms.redTide.pile} reds still in the pile; ${fmt(ms.redTide.left)} left.`);
  if(ms.challenges)o.push('Dares: '+ms.challenges.cards.map(c=>`${CHALLENGES[c.id].n}${c.dead?' (cannot be met)':''}`).join('; ')+(ms.challenges.done.length?`. Met: ${ms.challenges.done.length}`:'')+'.');
  if(ms.robotLine)o.push(`Robot on ${ms.robotLine.line[ms.robotLine.at]} in the line ${ms.robotLine.line.join(' ')}.`);
  if(ms.meteor)o.push(`Meteor values: ${ms.meteor.vals.map(v=>v+(G.fin[v]?' ✓':'')).join(', ')}.`);
  if(ms.hotPotato)o.push('Cards: '+ms.hotPotato.cards.map((c,i)=>`${N(i)} ${c.map(x=>x.v).join('/')}`).join('; ')+'.');
  if(ms.bunker){const b=ms.bunker;o.push(`Bunker ${b.f?'basement':'ground floor'}, crew on row ${b.r+1} column ${b.c+1}. Goal: ${b.goal}. Sides: up ${b.sides.U}, right ${b.sides.R}, down ${b.sides.D}, left ${b.sides.L}.`)}
  if(V.robot)o.push(`The robot holds ${V.robot.n} wire${V.robot.n===1?'':'s'}.`);
  for(const st of V.stands)if(st.side.length)o.push(`Beside ${nm(st.owner)}'s stand: `+st.side.map(t=>(t.mean==='none'?'no ':'')+VNm(t.v)).join(', ')+'.');
  return o}
function renderGear(){const V=UI.V||view();if(noGear()){$('#gearbody').innerHTML='<p><b>This training job has no equipment cards.</b> Your crew card still has its <b>Twin Probe</b>: once per job, point at two wires of one crewmate and say one value; if either matches, it is a hit. Gear cards appear in later jobs: they unlock when the crew cuts certain numbers, and this drawer will show them.</p>';return}let h='<p class="tiny">The row of cards on the table mat is the crew\'s equipment. A card is <b>locked</b> until the crew cuts the numbers named on it, then it is <b>ready</b> for one use (or every turn, if it says so) and then <b>used</b>. Personal tools sit on each player\'s crew card.</p><div class="eqgrid">';
  V.eq.forEach((e,i)=>{if(e.down||!e.id){h+=`<div class="eqc locked"><div class="et"><b>?</b>Face-down card</div><div class="ex">It turns up during the job.</div><div class="es">face down</div></div>`;return}const E=EQUIP[e.id];
    h+=`<div class="eqc ${e.st}"><div class="et"><b>${E.v==='Y'?'Y':E.v}</b>${esc(E.n)}<span class="tm">${{any:'any time',turn:'your turn',start:'start of turn',instant:'instant'}[E.timing]}</span></div><div class="ex">${esc(E.text)}</div><div class="es">${e.st==='locked'?`${ico('lock')} locked: cut ${E.need===4?'all four':'two'} ${E.v==='Y'?'yellows':E.v+'s'}${e.cover!=null?' and two '+e.cover+'s':''}`:e.st==='ready'?'ready to use'+(e.perm?' (every turn)':''):'used'}</div></div>`});
  h+='</div><h3>Crew and personal tools</h3><div class="eqgrid">';
  for(const q of V.seats){const c=q.ch?CHARS[q.ch]:null;const it=c?ITEMS[c.item]:null;h+=`<div class="eqc ${q.chUsed?'used':'ready'}"><div class="et" style="background:${SEATC[q.pos%5]}"><b>${q.i===G.captain?'★':''}</b>${esc(q.nm)}: ${esc(c?c.n:q.chDown?'face-down card':'no crew card')}</div><div class="ex">${it?`<b>${esc(it.n)}</b>: ${esc(it.text)}`:'No personal tool.'}</div><div class="es">${q.chUsed?'tool used':q.chDown?'face down':it?'tool ready':''}</div></div>`}
  $('#gearbody').innerHTML=h+'</div>'}
function renderRef(){const E=refEntries();let h='',sec='';for(const e of E){if(e.s!==sec){if(sec)h+='</div>';sec=e.s;h+=`<h3>${esc(sec)}</h3><div class="reflist">`}
    h+=`<div class="ref"><span class="rc">${e.c!=null?'×'+e.c:'·'}</span><div><b>${esc(e.n)}</b>${e.tags.map(t=>`<small>${esc(t)}</small>`).join('')}<br>${esc(e.t)}</div></div>`}
  $('#refbody').innerHTML=h+'</div>'}
// ---------- settings ----------
function saveSettings(){lsSet('sf_set',{speed:UI.speed})}
function loadSettings(){const s=lsGet('sf_set',{});if(s.speed)UI.speed=s.speed}
function renderSettings(){const sp=[[.5,'Slow'],[1,'Normal'],[2,'Fast'],[5,'Very fast']];
  $('#setbody').innerHTML=`<div class="setgrid">
  <div><div class="lbl">Sound</div><div class="row"><button class="btn${SND.on?' on':''}" data-a="snd" id="sndbtn">${ico('snd')}Sound ${SND.on?'on':'off'}</button><button class="btn${SND.music?' on':''}" data-a="mus" id="musbtn">${ico('music')}Music ${SND.music?'on':'off'}</button></div></div>
  <div><div class="lbl">Computer crew speed</div><div class="row">${sp.map(([v,l])=>`<button class="btn small${UI.speed===v?' on':''}" data-a="speed" data-v="${v}">${l}</button>`).join('')}</div></div>
  <div><div class="lbl">Game</div><div class="row">${isClient()?`<button class="btn small" data-a="netleave">${ico('back')}Leave the online game</button>`:`${G&&!G.over?`<button class="btn small" data-a="pause">${ico(UI.pause?'play':'pause')}${UI.pause?'Resume':'Pause'}</button><button class="btn small" data-a="restart">${ico('flip')}Restart</button>`:''}<button class="btn small" data-a="newgame">${ico('map')}Jobs</button>`}</div></div>
  <div><div class="lbl">More</div><div class="row"><button class="btn small" data-gx="logd">${ico('scroll')}Log</button><button class="btn small" data-gx="refd">${ico('cards')}Cards</button><button class="btn small" data-gx="credd">${ico('info')}Credits</button></div></div></div>`}
// ---------- campaign progress ----------
function jobProg(){if(!UI.prog)UI.prog=lsGet('sf_camp',{v:1,jobs:{}});return UI.prog}
function unlocked(n){const c=jobProg();return n===1||!!(c.jobs[n-1]&&c.jobs[n-1].w)||!!(c.jobs[n]&&c.jobs[n].p)}
function recordResult(){if(!humans().length)return;const c=jobProg();const n=G.mission;const j=c.jobs[n]=c.jobs[n]||{p:0,w:0,best:null};j.p++;
  if(G.over.win){j.w++;const r={left:G.dial,turns:G.turn,np:G.np};if(!j.best||(r.left!=null&&(j.best.left==null||r.left>j.best.left))||(r.left===j.best.left&&r.turns<j.best.turns))j.best=r}lsSet('sf_camp',c)}
