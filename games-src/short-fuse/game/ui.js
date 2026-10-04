// ===================== Short Fuse: the page (stage 2) =====================
// Every human input goes through act(move, seat) (the hook for the stage-3 network layer).
// Every seat's view is drawn from knowledge(seat) only (the hidden-information rule for hot-seat and online play).
AIDELAY=900;ANIM=1;UI.sim=0;
Object.assign(UI,{started:false,holder:-1,sel:null,pause:false,speed:1,tickRate:1,help:true,coach:true,xray:true,prev:null,res:null,aiT:null,tut:null,seen:{},kitSig:{},
  lastPrompt:null,holdUntil:0,clockAcc:0,setup:null,wwk:null,offSeat:null,lastHumanRes:null,mode:'solo',rt:false,camp:null});
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
(function(){const set=(id,o)=>{const t=TUTORIAL.find(x=>x.id===id);if(t)Object.assign(t,o)};
 set('hello',{p:'You defuse the bomb together. <b>Cut every wire</b> on every stand to win. The <b>fuse</b> (the bomb timer, top of the panel) burns one step on every miss: when it is gone, boom. The <b>foreman</b> (marked ★) starts.'});
 set('stand',{p:'A <b>stand</b> is the rack that holds a player\'s wires. Yours is at the front of the table, face up for you and sorted from low to high. Your crewmates see only the backs of your wires, and you see only theirs.'});
 set('open',{p:'Everyone starts by placing an <b>info token</b>: a marker in front of one of your wires that tells the whole crew its number (placing one is called <b>tagging</b> the wire). Pick one of yours.'});
 set('confirm',{p:'Check the summary and press the big button. The <b>Suggested move</b> card shows a good move and says why.'});
 set('solo',{p:'If you hold <b>all</b> the wires still left of a value (all four, or the last two), you may cut them yourself without pointing: a solo cut never fails. The <b>Solo cut</b> button is at the top of this panel.'});
 set('know',{p:'The bulb button (Know) opens the full table of what every wire could be. Use it whenever you are unsure.'})})();
// who must decide next (question owner, actor, or a claimer)
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
function nice(t,V){return hintify(t).replace(/stand (\d+),? slots? ([\d,]+)/g,(m,a,b)=>{const si=+a-1;if(!G.st[si])return m;const ks=b.split(',').map(x=>+x-1);return ks.length>1?wireName(si,ks[0],V).replace(/wire [A-Z]/,'wires '+ks.map(LET).join(', ')):wireName(si,ks[0],V)})}
// ---------- the one entry point for human input (stage 3 intercepts here) ----------
function act(m,seat){if(!G||G.over)return {success:false,error:'no game'};if(seat==null)seat=viewer();
  if(!isHuman(seat))return {success:false,error:'not a human seat'};
  if(typeof window.NET_INTERCEPT==='function'){const r=window.NET_INTERCEPT(m,seat);if(r)return r}
  const err=legal(m,seat);if(err){toast(err);sfx('buzzer');return {success:false,error:err}}
  if(isClient()){if(seat!==NET.mySeat||(NET.pend===G.logN&&Date.now()-NET.pendT<2500))return {success:false,error:'wait'};NET.pend=G.logN;NET.pendT=Date.now();UI.sel=null;sfx('click');netSend(m);refresh();return {success:true,sent:1}}
  UI.sel=null;UI.offSeat=null;UI.lastActor=seat;if(modeOf()==='solo'){UI.aiNotBefore=Date.now()+2800/UI.speed;UI.myAck=false}sfx('click');return applyMove(m,seat)}
function applyMove(m,seat){const r=performMove(m,seat);if(!r.success){console.error('move rejected: '+r.error+' '+JSON.stringify(m));refresh()}return r}
// ---------- snapshots: what changed since the last refresh (drives sounds, effects and the result banner) ----------
function snap(){const cut=new Set(),tok={};for(const s of G.st)for(const x of s.w){if(x.cut)cut.add(x.u);tok[x.u]=x.tok.length}let side=0;for(const s of G.st)side+=s.side.length;
  return {g:G.seed+':'+G.mission,logN:G.logN,dial:G.dial,cut,tok,side,valid:G.valid.length,over:!!G.over,rf:G.ms.rf?G.ms.rf.at:null,turn:G.turn}}
function diffFx(a,b){if(!a||a.g!==b.g)return;const newLog=G.log.filter(l=>l.i>a.logN).reverse();if(!newLog.length&&b.dial===a.dial)return;
  const newCut=[...b.cut].filter(u=>!a.cut.has(u));const newTok=Object.keys(b.tok).filter(u=>b.tok[u]>(a.tok[u]||0));
  const txt=newLog.map(l=>l.t).join(' ');const ev={cuts:newCut,toks:newTok,lines:newLog};
  const dialDown=b.dial!=null&&a.dial!=null&&b.dial<a.dial||(b.rf!=null&&a.rf!=null&&b.rf>a.rf&&/miss/i.test(txt)),dialUp=b.dial!=null&&a.dial!=null&&b.dial>a.dial;
  let kind=null;
  if(b.over&&!a.over)kind=G.over.win?'win':'boom';
  else if(/Miss|miss:|missed|wrong/.test(txt)&&dialDown||(/Miss/.test(txt)&&!newCut.length))kind='miss';
  else if(newCut.length&&/solo/i.test(txt))kind='solo';
  else if(newCut.length&&/Hit!|cuts|reveals|all at once|cut at once/i.test(txt))kind=/reveals/.test(txt)?'reveal':'hit';
  else if(dialUp)kind='phew';
  else if(newCut.length)kind='hit';
  else if(dialDown)kind='miss';
  const lines=newLog.filter(l=>l.c!=='turn');
  if(kind||lines.some(l=>l.c==='eq'||l.c==='good'||l.c==='bad'||l.c==='big'))UI.res={kind:kind||'info',lines:lines.slice(-6),turn:G.turn,actor:UI.lastActor!=null?UI.lastActor:G.actor,t:Date.now()};
  if(UI.res&&modeOf()==='solo'&&UI.lastActor!=null&&UI.lastActor===humans()[0]){UI.myRes=UI.res;UI.myAck=false}
  UI.lastActor=null;
  if(!ANIM)return;
  const tileAt=u=>tid(u);
  if(kind==='hit'||kind==='solo'||kind==='reveal'){newCut.forEach((u,i)=>setTimeout(()=>{try{SFKit.fx('cut',tileAt(u))}catch(e){}},i*260));sfx(kind==='solo'?'solo_cut':kind==='reveal'?'reveal':newCut.length>1?'double_cut':'cut')}
  if(kind==='miss'){const at=newTok[0]!=null?tileAt(newTok[0]):'dial';try{SFKit.fx('buzz',at)}catch(e){}sfx('wrong');sfx('dial',{at:.25});if(newTok.length)sfx('info',{at:.45});
    if(G.dial===1)setTimeout(()=>sfx('tick_last'),700);else sfx('tick',{at:.6})}
  if(kind==='phew'){try{SFKit.fx('phew','dial')}catch(e){}sfx('phew')}
  if(b.valid>a.valid)sfx('validate',{at:.35});
  if(/is unlocked|turns up/.test(txt))sfx('gadget',{at:.2});
  if(/Sweep for|sweeps/.test(txt))sfx('scanner');
  if(/Handsets|trade|pulls/.test(txt)&&!kind)sfx('flip');
  if(kind==='win'){musicStop(.4);sndLoop('clock_loop',false);setTimeout(()=>{try{SFKit.fx('win')}catch(e){}},newCut.length?500:0);sfx('phew');sfx('win',{at:.8})}
  if(kind==='boom'){musicStop(.3);sndLoop('clock_loop',false);try{SFKit.fx('boom',newTok[0]!=null?tileAt(newTok[0]):null)}catch(e){}setTimeout(()=>{try{SFKit.fx('lose')}catch(e){}},900);sfx('boom');sfx('lose',{at:1.6})}}
// ---------- refresh: called by the engine after every move ----------
function refresh(){if(!G||!UI.started)return;try{if(window.PerfHUD)PerfHUD.wake()}catch(e){}
  const s=snap();diffFx(UI.prev,s);UI.prev=s;
  saveNow();
  if(G.prompt&&(!UI.lastPrompt||UI.lastPrompt.t!==G.prompt.t||UI.lastPrompt.say!==G.prompt.say)){UI.lastPrompt=Object.assign({},G.prompt);UI.holdUntil=Date.now()+(ANIM?3000:0);sfx('radar')}
  if(G.over&&!UI.campDone){UI.campDone=1;recordResult()}
  const V=view();UI.V=V;
  if(UI.sel&&!selValid(V))UI.sel=null;
  syncBoard(V);renderDock(V);renderOpenDrawer();audioMood(V);
  const need=humanNeeded();if(need||UI.brief)GX.showDock();
  if(need&&need!==UI.lastNeed){UI.lastNeed=need;if(ANIM)sfx('turn')}if(!need)UI.lastNeed=null;
  schedule();netAfter()}
function humanNeeded(){if(!G||G.over)return null;const p=passTo();if(p>=0)return 'pass'+p;const v=viewer();if(v<0)return null;const s=decider();if(s===v)return 'me'+G.turn+':'+(G.q?G.q.kind:G.step);return null}
function saveNow(){if(NET.on)return;try{if(G&&!G.over&&humans().length)localStorage.setItem(SAVE,JSON.stringify({G,ui:{holder:UI.holder,help:UI.help,tut:UI.tut,rt:UI.rt}}));else if(G&&G.over)localStorage.removeItem(SAVE)}catch(e){}}
// ---------- the computer crew ----------
function aiHeld(){if(!G||G.over)return false;if(UI.brief)return true;if(UI.tut&&UI.coach&&!NET.on){try{if(tutStep(view()))return true}catch(e){}if(ANIM&&UI.myRes&&!UI.myAck&&modeOf()==='solo'&&decider()!==humans()[0])return true}return false}
function schedule(){if(isClient()||UI.aiT||!G||G.over||UI.pause||!UI.started||aiHeld())return;
  if(UI.sel&&UI.sel.off)return;                 // a human is choosing an any-time card: wait
  const s=decider();const open=G.step==='claim'||G.step==='snip';
  if(s>=0&&isHuman(s)&&!open){if(UI.offChecked!==G.logN){UI.offChecked=G.logN;const st=aiStep();if(st&&!isHuman(st.seat))UI.aiT=setTimeout(()=>{UI.aiT=null;if(G&&!G.over&&!UI.pause&&!legal(st.m,st.seat))applyMove(st.m,st.seat)},ANIM?AIDELAY/UI.speed:0)}return}
  if(passTo()>=0&&!open)return;
  let d=ANIM?AIDELAY/UI.speed:0;if(open&&humans().length&&ANIM)d=Math.max(d,2600/UI.speed);if(ANIM&&UI.aiNotBefore)d=Math.max(d,UI.aiNotBefore-Date.now());
  if(!ANIM&&open&&humans().length)d=AIDELAY;
  UI.aiT=setTimeout(()=>{UI.aiT=null;if(!G||G.over||UI.pause)return;if(UI.sel&&UI.sel.off){schedule();return}
    let st=null;try{st=aiStep()}catch(e){console.error(e);return}if(!st)return;if(isHuman(st.seat))return;applyMove(st.m,st.seat)},d)}
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
// ---------- the board (SFKit: 3D, or its 2D fallback) ----------
function tok2kit(t){if(!t)return null;if(t.t==='n')return t.v==='Y'?'yellow':String(t.v);if(t.t==='y')return 'yellow';if(t.t==='p')return t.v==='e'?'even':'odd';if(t.t==='c')return 'x'+t.v;if(t.t==='f')return '!'+VNm(t.v);return null}
function tileOf(x){const known=x.v!=null;const col=known?({b:'blue',r:'red',y:'yellow'})[x.c]||'blue':null;
  const t={id:tid(x.u),cut:!!x.cut,known,color:col,value:known?(x.c==='b'?x.s:x.s):null};const tk=x.tok.find(q=>q.t!=='x')||null;if(tk)t.infoToken=tok2kit(tk);if(x.x)t.marker='x';return t}
function tid(u){return 'g'+(UI.gameN||0)+'u'+u}
function uOf(id){const m=/u(\d+)$/.exec(String(id));return m?+m[1]:null}
// a new job: drop every stand of the last one (tile ids also change per job, so old tiles never collide with new ones)
function kitReset(){UI.gameN=(UI.gameN||0)+1;try{const S=SFKit._K.st.stands;for(const key of Object.keys(S)){const a=key.split(':').map(Number);SFKit.setStand(a[0],a[1],[]);delete S[key]}SFKit.highlight([])}catch(e){}UI.kitSig={}}
function kitCall(key,sig,fn){if(UI.kitSig[key]===sig)return;UI.kitSig[key]=sig;try{fn()}catch(e){console.error(e)}}
function syncBoard(V){if(!window.SFKit)return;const np=G.np;const me=kitMe();const myPos=posOf(me);
  const names=[];for(const q of G.seats)names[G.pos[q.i]]=q.i===V.seat?(modeOf()==='solo'&&!NET.on?'You':q.nm+' (you)'):q.nm;
  window.SF_HIDEME=!!window.SF_PHONE&&V.seat>=0;   // phone: my own rack is the strip under the table (not drawn in 3D) while somebody holds the device
  kitCall('players',JSON.stringify([np,myPos,names,posOf(G.captain),window.SF_HIDEME]),()=>SFKit.setPlayers(np,myPos,{names,captain:posOf(G.captain)}));
  for(let p=0;p<np;p++){const seat=G.pos.indexOf(p);const ss=V.stands.filter(st=>posOf(st.owner)===p).map(st=>st.i).sort((a,b)=>a-b);
    ss.forEach((si,j)=>{const tiles=V.stands[si].slots.map(tileOf);kitCall('st'+p+':'+j,JSON.stringify(tiles),()=>SFKit.setStand(p,j,tiles))})}
  kitCall('turn',String(G.actor>=0?posOf(G.actor):-1),()=>SFKit.setTurn(G.actor>=0?posOf(G.actor):null));
  const dial=G.dial!=null?[G.dial,DIAL_MAX]:G.ms.rf?[Math.max(0,12-G.ms.rf.at),12]:[0,DIAL_MAX];
  kitCall('dial',dial.join(),()=>SFKit.setDial(dial[0],dial[1]));
  const T={validation:V.validOff?[]:V.valid.filter(v=>v!=='Y'),markers:[]};const M=V.markers||{};
  if(!V.validOff){(M.red||[]).forEach(v=>T.markers.push({color:'red',value:v,unknown:(M.redN||0)<(M.red||[]).length}));(M.yel||[]).forEach(v=>T.markers.push({color:'yellow',value:v,unknown:(M.yelN||0)<(M.yel||[]).length}))}
  for(const mk of V.marks||[]){const S=G.st[mk.s];if(!S)continue;const a=S.w[mk.a],b=S.w[mk.b];if(!a||!b)continue;T[mk.t==='eq'||mk.t==='='?'equal':'notEqual']={tiles:[tid(a.u),tid(b.u)]}}
  if(V.ms.oxygen){const per={};V.seats.forEach(q=>per[q.pos]=q.ox);T.oxygen={reserve:V.ms.oxygen.res,perSeat:per}}
  if(V.ms.robotPatrol)T.robot={pos:V.ms.robotPatrol.at};
  if(V.ms.robotFuse)T.robot={pos:Math.max(1,Math.min(12,V.ms.robotFuse.at||1))};
  if(V.ms.robotLine&&V.ms.robotLine.line){T.robot={pos:V.ms.robotLine.line[V.ms.robotLine.at],on:'numbers'}}
  if(V.ms.bunker)T.hero={cell:[V.ms.bunker.r,V.ms.bunker.c]};
  kitCall('tok',JSON.stringify(T),()=>SFKit.setTokens(T));
  const eq=V.eq.map((e,i)=>{if(e.down||!e.id)return {id:'d'+i,name:'Face down',timing:'',unlock:{value:'?',count:2},state:'locked',effect:'Turns up during the job.'};const E=EQUIP[e.id];
    return {id:e.id,name:E.n,timing:{any:'any_time',turn:'your_turn',start:'start_of_your_turn',instant:'instant'}[E.timing],unlock:{value:E.v==='Y'?'Y':E.v,count:E.need},state:e.st,effect:E.text,short:shortEq(e.id)+(e.cover!=null?' (cover '+e.cover+')':'')}});
  kitCall('eq',JSON.stringify(eq),()=>SFKit.setEquipment(eq));
  const mc=missionCards(V);kitCall('mc',JSON.stringify(mc),()=>SFKit.setMissionCards(mc));
  const ch=V.seats.map(q=>({seat:q.pos,name:q.ch?CHARS[q.ch].n:'No crew card',item:q.ch?ITEMS[CHARS[q.ch].item].n:'No tool',captain:q.i===G.captain,used:!!q.chUsed||!!q.chDown}));
  kitCall('ch',JSON.stringify(ch),()=>SFKit.setCharacters(ch));
  const hl=highlights(V);kitCall('hl',JSON.stringify(hl),()=>SFKit.highlight(hl));
  chipSet();const zb=$('#zoombtn');if(zb){zb.hidden=!G||G.over||!(window.SFKit&&SFKit._K&&SFKit._K.on);zb.lastChild.textContent=UI.zoomI>=0?' Zoom: '+nm(zoomSeats()[UI.zoomI]||0)+' (tap to change)':' Zoom'}}
function zoomSeats(){const me=kitMe();return G.seats.map(q=>q.i).filter(i=>i!==me&&G.st.some(st=>ownerOf(st.i)===i))}
function zoomNext(){const z=zoomSeats();UI.zoomI=(UI.zoomI==null?-1:UI.zoomI)+1;if(UI.zoomI>=z.length)UI.zoomI=-1;try{if(UI.zoomI<0)SFKit.focus(null);else SFKit.focus({kind:'stand',seat:posOf(z[UI.zoomI])},2.2)}catch(e){}refresh()}
function chipSet(){const chip=$('#chip');if(!chip||!G)return;const s=decider();chip.classList.toggle('hv',!!UI.hoverTxt);chip.textContent=UI.hoverTxt||(G.over?'':UI.pause?'Paused':s>=0&&!isHuman(s)?`${nm(s)} is thinking…`:'')}
function hoverTile(p){let t='';try{if(p&&p.kind==='tile'&&p.id&&G&&UI.V){const f=findU(uOf(p.id));if(f){const sl=G.st[f.s].w[f.k];const own=ownerOf(f.s)===UI.V.seat;const v=sl.cut?'cut':own?cv(sl.id):'';t=wireName(f.s,f.k,UI.V)+(v?' ('+VNm(v)+')':'')+(sl.tok&&sl.tok.length?', has an info token':'')}}}catch(e){}if(t!==UI.hoverTxt){UI.hoverTxt=t;chipSet()}}
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
function highlights(V){const sel=UI.sel,u=(si,k)=>{const sl=G.st[si]&&G.st[si].w[k];return sl?tid(sl.u):null};const out=new Set();
  if(!V||V.seat<0||G.over)return [];
  if(V.q&&V.q.who===V.seat&&V.q.opts){for(const o of V.q.opts){const d=o.d||{};if(d.u!=null){const f=findU(d.u);if(f)out.add(tid(d.u))}else if(d.st!=null&&d.k!=null){const x=u(d.st,d.k);if(x)out.add(x)}}return [...out]}
  if(sel&&sel.mode==='choose'){const step=nextStep(sel);if(step&&step.board){for(const m of selRemaining(sel)){const x=u(m[step.board[0]],m[step.board[1]]);if(x)out.add(x)}}for(const t of sel.picked||[])out.add(u(t.s,t.k));return [...out].filter(Boolean)}
  if(sel&&sel.mode==='multi'){for(const st of V.stands)st.slots.forEach((x,k)=>{if(!x.cut)out.add(tid(x.u))});return [...out]}
  const L=V.legal;if(!L)return [];
  if(sel&&sel.mode==='dual'&&sel.tg.length){const st=sel.tg[0].st;const need=toolN(sel.tool);if(sel.tool==='eq5'){return eq5Slots(st).map(k=>u(st,k))}
    if(need>sel.tg.length)for(const m of L.plain)if(m.st===st)out.add(u(m.st,m.ks[0]));for(const t of sel.tg)out.add(u(t.st,t.k));return [...out].filter(Boolean)}
  if(sel&&sel.mode==='flipown'){for(const m of L.flip)out.add(u(m.st,m.ks[0]));return [...out].filter(Boolean)}
  for(const m of L.plain)out.add(u(m.st,m.ks[0]));return [...out].filter(Boolean)}
function toolN(t){return t==='dd'?2:t==='eq3'||t==='pt3'?3:t==='eq5'?99:1}
function eq5Slots(si){return G.st[si].w.map((x,k)=>k).filter(k=>{const x=G.st[si].w[k];return !x.cut&&!x.x&&!x.flip})}
// ---------- board clicks ----------
function onPick(p){if(!p||!G||!UI.started)return;if(p.kind==='equipment'){GX.show('geard');return}if(p.kind==='mission'||p.kind==='number'||p.kind==='sequence'||p.kind==='constraint'||p.kind==='challenge'||p.kind==='bunker'){GX.show('missiond');return}
  if(p.kind==='dial'||p.kind==='track'){GX.show('knowd');return}
  if(p.kind!=='tile'||!p.id)return;const u=uOf(p.id);const f=u!=null&&findU(u);if(!f)return;onTile(f.s,f.k)}
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
// ---------- the dock ----------
function rsHTML(V){let h='';const order=[];for(let p=0;p<G.np;p++)order.push(G.pos.indexOf(p));const startP=posOf(G.captain);order.sort((a,b)=>((posOf(a)-startP+G.np)%G.np)-((posOf(b)-startP+G.np)%G.np));
  for(const s of order){const q=V.seats[s];const now=s===G.actor&&!G.over;h+=`<div class="rs${now?' now':''}${q.nUncut?'':' out'}" style="--sc:${SEATC[posOf(s)%5]}"><b>${s===G.captain?'<span title="Foreman: starts the job and takes the first turn">★</span> ':''}${esc(q.nm)}</b>${q.nUncut} wire${q.nUncut===1?'':'s'}<br><i>${q.human?(s===V.seat?'you':'human'):LV_NAME[q.lv]||'computer'}</i></div>`}return h}
function statHTML(V){let h='';if(G.dial!=null){const on=G.dial;let pp='';for(let i=1;i<=Math.max(G.dial,G.np,DIAL_MAX>6?6:Math.max(on,G.np));i++)pp+=`<i class="${i<=on?'':'off'}"></i>`;
    h+=`<span class="pill fuse${on<=1?' danger':''}" title="Fuse: ${on} step${on===1?'':'s'} left">${ico('fuse')}Fuse <span class="pp">${pp}</span> ${on}</span>`}
  else if(V.ms.robotFuse)h+=`<span class="pill fuse${V.ms.robotFuse.at>=10?' danger':''}">${ico('robot')}Robot ${V.ms.robotFuse.at}/12</span>`;
  const tot=G.st.reduce((a,s)=>a+s.w.length,0),cut=G.st.reduce((a,s)=>a+s.w.filter(x=>x.cut).length,0);h+=`<span class="pill" title="Wires cut">${ico('cut')}${cut}/${tot} cut</span>`;
  const c=timedJob()?clockLeft(V):null;if(c)h+=`<span class="pill timer${c.real<30?' low':''}${UI.pause?' paused':''}" id="timerpill" title="${esc(c.label)}">${ico('clock')}${esc(c.label)} ${fmt(c.left)}${UI.pause?' ⏸':''}</span>`;if(c&&c.real<30&&c.real>0)h+=`<span class="pill lowtime">Hurry: under 30 seconds!</span>`;
  if(V.ms.oxygen){const me=V.seat>=0?V.seats[V.seat].ox:null;h+=`<span class="pill">${ico('bubble')}O₂ ${V.ms.oxygen.v==='gift'||V.ms.oxygen.v==='bundle'?(me!=null?'you '+me:''):'reserve '+V.ms.oxygen.res}</span>`}
  return h}
function dockTitle(V){if(!G)return 'Short Fuse';if(G.over)return G.over.win?'Defused!':'BOOM!';const p=passTo();if(p>=0)return 'Pass to '+nm(p);const s=decider();
  if(UI.brief)return 'Job briefing';if(G.step==='claim'&&!G.q)return 'Who goes next? Claim it!';if(V.seat>=0&&s===V.seat)return G.q?'Your answer, '+nm(V.seat):'Your turn, '+nm(V.seat);if(s>=0)return G.q&&!isHuman(G.q.who)?nm(G.q.who)+' is '+doing(G.q):isHuman(s)?nm(s)+' decides':nm(s)+' (computer)';if(G.step==='claim')return 'Who takes the next turn?';if(G.step==='snip')return 'Who calls it?';return 'Job '+G.mission}
function renderDock(V){$('#dockt').textContent=dockTitle(V);$('#road').innerHTML=rsHTML(V);$('#stat').innerHTML=statHTML(V);
  const pb=$('#pausebtn');pb.hidden=!UI.started||!!G.over;pb.innerHTML=ico(UI.pause?'play':'pause');pb.setAttribute('aria-label',UI.pause?'Resume':'Pause');
  setHTML('#res',resHTML(V));setHTML('#coach',coachHTML(V));
  const sig=dockSig(V);if(sig!==UI.dockSig){const newTurn=!UI.dockSig||JSON.parse(UI.dockSig)[3]!==G.turn||JSON.parse(UI.dockSig)[2]!==G.actor;UI.dockSig=sig;$('#main').innerHTML=mainHTML(V);$('#tip').innerHTML=tipHTML(V);if(newTurn||UI.brief){const db=$('#dockbody');if(db)db.scrollTop=0}}
  $('#logmini').innerHTML=G.log.filter(l=>l.c!=='turn').slice(0,4).map(l=>`<div class="lg-${l.c||'n'}">${esc(nice(l.t,V))}</div>`).join('');
  const jc=$('#jobchip');jc.hidden=false;jc.innerHTML=`Job ${G.mission}<span class="jn">: ${esc(MISSIONS[G.mission].nm)}</span>`;paintIcons($('.gx-dock'))}
function setHTML(sel,h){const el=$(sel);if(el._h!==h){el._h=h;el.innerHTML=h}}
function dockSig(V){return JSON.stringify([G.logN,G.step,G.actor,G.turn,!!G.q,G.q&&G.q.kind,G.q&&G.q.who,V.seat,passTo(),UI.sel,UI.pause,UI.help,UI.coach,!!UI.brief,UI.myAck,!!G.over,G.prompt&&G.prompt.t,UI.holder,modeOf()==='watch'&&UI.xray,UI.wwkN])}
function resBox(r,V,cls2){const big={hit:'SNIP!',solo:'SNIP SNIP!',reveal:'REVEALED',miss:'BUZZ!',phew:'PHEW!',info:'',win:'DEFUSED!',boom:'BOOM!'}[r.kind];
  const cls={hit:'hit',solo:'hit',reveal:'hit',miss:'miss',phew:'phew',info:'info',win:'win',boom:'boom'}[r.kind];
  let why='';if(r.kind==='miss'){const line=r.lines.find(l=>/Miss/.test(l.t));const pl=r.lines.find(l=>/ points at | says /.test(l.t));why=`${pl?`<p>${esc(nice(pl.t,V))}</p>`:''}<p>${esc(line?nice(line.t,V):'A miss.')} The fuse burned a step${G.dial!=null?', '+G.dial+' left':''}.</p>`}
  const body=r.lines.filter(l=>!/^Narrator/.test(l.t)).slice(-3).map(l=>`<p class="lg-${l.c}">${esc(nice(l.t,V))}</p>`).join('');
  return {cls,big,html:r.kind==='miss'?why+body.split('</p>').slice(0,0).join(''):body}}
function resHTML(V){if(!G||G.over)return '';const mine=UI.myRes,r=UI.res;let h='';
  const mineOn=mine&&modeOf()==='solo'&&mine.turn>=G.turn-3&&(!UI.myAck||decider()===V.seat);
  if(mineOn){const b=resBox(mine,V);const myTurn=decider()===V.seat&&!G.q;
    if(myTurn)h+=`<div class="res later" role="status"><p><b>Your last move</b> (${esc(nm(V.seat))}): ${esc(mine.lines.filter(l=>!/^Narrator/.test(l.t)).map(l=>nice(l.t,V)).slice(-2).join(' '))}</p></div>`;
    else h+=`<div class="res mine shrink ${b.cls}" role="status"><p class="who">You (${esc(nm(V.seat))}) just played:</p>${b.big?`<big>${b.big}</big>`:''}${b.html}${UI.tut&&UI.coach&&!UI.myAck?`<div class="cont"><button class="btn small go" data-a="myack">${ico('check')}Continue</button></div>`:''}</div>`;
    if(r&&r!==mine&&r.turn>=G.turn-1&&!myTurn)h+=`<div class="res later"><p><b>Then:</b> ${esc(r.lines.filter(l=>!/^Narrator/.test(l.t)).map(l=>nice(l.t,V)).slice(-2).join(' '))}</p></div>`;
    return h+(G.dial===1?'<div class="lastlife">⚠ Last step on the fuse: the next miss is a BOOM!</div>':'')}
  if(!r||r.turn<G.turn-1)return '';const b=resBox(r,V);
  return `<div class="res ${b.cls}" role="status">${b.big?`<big>${b.big}</big>`:''}${b.html}</div>${G.dial===1?'<div class="lastlife">⚠ Last step on the fuse: the next miss is a BOOM!</div>':''}`}
function coachHTML(V){if(!UI.tut||G.over)return '';const s=tutStep(V);if(!s)return '';
  if(!UI.coach)return `<button class="btn small resume" data-a="coachon">${ico('play')}Resume lesson</button>`;
  if(UI.coachAsk)return `<div class="card coach"><h3>Turn off the tips?</h3><p>You can turn them back on any time: press "Resume lesson" in this panel, or Menu, then Guide.</p><div class="row"><button class="btn small go" data-a="coachoff">Turn off tips</button><button class="btn small" data-a="coachkeep">Keep the tips</button></div></div>`;
  return `<div class="card coach"><h3>${esc(s.t)}</h3><p>${s.p}</p><div class="row"><button class="btn small go" data-a="coach" data-id="${s.id}">${ico('check')}Got it</button><button class="linkbtn" data-a="coachask">Turn off tips</button></div></div>`}
function tutStep(V){const T=UI.tut,d=T.done;const me=V.seat;if(me<0)return null;const pick=id=>d[id]?null:TUTORIAL.find(x=>x.id===id);
  if(G.phase==='turn'&&!d.open)d.open=1;
  if(!d.hello)return pick('hello');if(!d.stand)return pick('stand');
  if(V.q&&V.q.who===me&&V.q.kind==='infoStd')return pick('open');
  if(UI.res&&UI.res.actor===me&&UI.res.turn>=G.turn-1){if(UI.res.kind==='miss'&&!d.miss)return pick('miss');if((UI.res.kind==='hit')&&!d.hit)return pick('hit')}
  if(V.legal&&decider()===me){const s=UI.sel;if(!s&&!d.dual)return pick('dual');if(s&&s.mode==='dual'&&s.tg.length&&s.v==null&&!d.value)return pick('value');if(s&&s.v!=null&&!d.confirm)return pick('confirm');if(V.legal.solo.length&&!d.solo&&!s)return pick('solo')}
  if(G.turn>=4&&!d.know)return pick('know');return null}
function tipHTML(V){if(!UI.help||V.seat<0||G.over||!V.legal)return '';const W=wwk(V);if(!W||!W.suggestion)return '';const S=W.suggestion;if(noGear()&&S.m&&(S.m.tool||S.m.two||S.m.a==='eq'||S.m.a==='item'))return '';
  return `<div class="card"><h3>${ico('bulb')} Suggested move</h3><p><b>${esc(nice(sugText(S.m,V),V))}</b></p><p class="why">${esc(nice(S.why||'',V))}</p><div class="row"><button class="btn small" data-a="sugg">Set it up for me</button><button class="btn small" data-gx="knowd">${ico('bulb')}What we know</button></div></div>`}
function sugText(m,V){if(!m)return '';switch(m.a){case 'dual':return `Say ${VNm(m.v)}${m.v2!=null?' or '+VNm(m.v2):''} at ${m.ks.length>1?nm(ownerOf(m.st))+'\'s wires '+m.ks.map(LET).join(', '):wireName(m.st,m.ks[0],V)}${m.tool?' with the '+toolName(m.tool):''}`;case 'solo':return `Solo cut your ${VNm(m.v)}s`;case 'reveal':return 'Reveal your reds';
  case 'eq':return 'Use '+EQUIP[m.id].n;case 'item':return 'Use '+ITEMS[m.k].n;case 'multi':return 'Point at '+m.tg.length+' wires at once';default:return keyName(m)}}
function toolName(t){return t==='dd'?'Twin Probe':t==='pt3'?'Pocket Triple Probe':t==='pt10'?'Pocket Two-Value Probe':EQUIP[t]?EQUIP[t].n:t}
// the cached "what we know" for the current position
function wwk(V){if(V.seat<0)return null;const key=G.logN+':'+V.seat+':'+G.turn;if(UI.wwk&&UI.wwk.key===key)return UI.wwk.W;let W=null;try{W=whatWeKnow(V.seat,ANIM?80:24)}catch(e){console.error(e)}UI.wwk={key,W};return W}
function briefHTML(V){const n=G.mission,M=MISSIONS[n];const chips=ruleChips(n);const ng=noGear();
  return `<div class="card brief"><h3>Job ${n}: ${esc(M.nm)}</h3><div class="row"><button class="btn go" data-a="briefok">${ico('play')}Continue</button><button class="linkbtn" data-gx="rulesd">Rules and glossary</button></div><p>${esc(BRIEFS[n]||'')}</p><p><b>The job:</b> ${esc(M.text)}</p>${chips.length?`<div class="new"><b>New this job</b><ul>${chips.map(c=>`<li><b>${esc(c[1])}:</b> ${esc(c[2])}</li>`).join('')}</ul></div>`:''}<p class="tiny">Wires: ${mixHTML(n,G.np)} Fuse: ${fuseStart(n,G.np)} steps. Gear: ${ng?'none in this job':(V.eq?V.eq.length:0)+' cards (Gear button)'}.</p></div>`}
function mainHTML(V){if(G.over)return overHTML(V);if(UI.brief)return briefHTML(V);
  const p=passTo();if(p>=0)return `<div class="card pass"><h3>Pass to ${esc(nm(p))}</h3><p>${UI.holder>=0?`${esc(nm(UI.holder))}, hand the device to <b>${esc(nm(p))}</b>. `:''}Everyone else looks away: the table now shows only the backs of the wires.</p>${G.q&&G.q.who===p?`<p class="hint">${esc(nm(p))} must answer: ${esc(G.q.title)}</p>`:''}<button class="btn go wide" data-a="take" data-seat="${p}">${ico('eye')}I am ${esc(nm(p))}: show my wires</button></div>`;
  let h='';if(G.prompt&&G.clock-G.prompt.t<40&&UI.rt)h+=`<div class="card q"><h3>${ico('radar'in ICO?'radar':'clock')} Narrator</h3><p>${esc(G.prompt.say)}</p></div>`;
  const me=V.seat,s=decider();
  if(me<0){h+=`<div class="card wait"><h3>${s>=0?esc(nm(s))+(G.q?' is '+esc(doing(G.q)):' is thinking…'):'Watching the computer crew'}</h3><p class="hint">${UI.xray?'All wires are shown face up (x-ray).':'Wire faces are hidden.'} Change the speed in the menu.</p><div class="row"><button class="btn small" data-a="xray">${ico('eye')}${UI.xray?'Hide':'Show'} all wires</button><button class="btn small" data-a="pause">${ico(UI.pause?'play':'pause')}${UI.pause?'Resume':'Pause'}</button></div></div>`;return h}
  if(V.q&&V.q.who===me&&V.q.opts)return h+qHTML(V);
  if(UI.sel&&UI.sel.off)return h+chooseHTML(V);
  if(V.legal&&s===me)return h+turnHTML(V);
  // waiting: off-turn options
  const off=(V.off||[]).filter(m=>!(noGear()&&(m.a==='eq'||m.a==='item')));let w=`<div class="card wait"><h3>${s>=0?(isHuman(s)?esc(nm(s))+' decides…':esc(nm(s))+(G.q&&G.q.who===s?' is '+esc(doing(G.q)):' is thinking…')):G.step==='claim'?'Who goes next? Claim it!':G.step==='snip'?'Who calls the number?':'Waiting…'}</h3>`;
  if(G.q&&G.q.who!==me)w+=`<p class="hint">${esc(nm(G.q.who))} is ${esc(doing(G.q))}.</p>`;
  if(G.step==='claim')w+=`<p>This job has no fixed order. Press <b>Claim the next turn</b> to go next. The player who just went cannot go twice in a row.</p>`;
  if(G.step==='snip'&&V.ms.volunteer)w+=`<p>The card shows <b>${esc(VNm(V.ms.volunteer.v))}</b>. Call "Snip!" only if you hold one: whoever calls must cut that value. A false call burns a step.</p>`;
  if(off.length)w+=`<div class="row">${off.map((m,i)=>`<button class="btn ${m.a==='claim'||m.a==='snip'?'go':''}" data-a="off" data-i="${(V.off||[]).indexOf(m)}">${esc(keyName(m))}</button>`).join('')}</div>`;
  w+=anyTimeHTML(V)+otherGearHTML(V)+'</div>';return h+w+annHTML(V)}
function qHTML(V){const q=V.q;const wires=q.opts.some(o=>o.d&&(o.d.u!=null||(o.d.st!=null&&o.d.k!=null)));
  const byU=(q.kind==='infoStd'||q.kind==='tagPick')&&q.opts.every(o=>o.d&&o.d.u!=null);let btns;
  if(byU){const gr={};q.opts.forEach((o,i)=>{const w=wLabel(o.d.u);(gr[w.s]=gr[w.s]||[]).push([o,i,w])});const keys=Object.keys(gr).sort((a,b)=>a-b);const multi=keys.length>1;
    btns=keys.map(k=>{const ss=seatStands(ownerOf(+k));return (multi?`<div class="tagrp">${esc(ownerOf(+k)===V.seat?'Your':nm(ownerOf(+k))+'\'s')} stand ${ss.indexOf(+k)+1}</div>`:'')+`<div class="row">${gr[k].map(([o,i,w])=>`<button class="btn" data-a="q" data-i="${i}">${q.kind==='infoStd'?'Tag your ':'Tag '}${esc(w.t)}${multi?esc(', stand '+(ss.indexOf(+k)+1)):''}</button>`).join('')}</div>`}).join('');
    const reds=[];for(const st of V.stands)if(st.mine)st.slots.forEach((x,k)=>{if(!x.cut&&x.c==='r')reds.push(LET(k))});
    if(q.kind==='infoStd'&&reds.length)btns+=`<p class="tiny">Your red wire${reds.length>1?'s':''} ${reds.join(', ')} cannot be tagged: red wires never get an opening token.</p>`}
  else btns=`<div class="row">${q.opts.map((o,i)=>`<button class="btn" data-a="q" data-i="${i}">${esc(nice(o.l,V))}</button>`).join('')}</div>`;
  return `<div class="card q"><h3>${esc(nice(q.title,V))}</h3>${wires?'<p class="hint">Tap a glowing wire on the table, or pick below.</p>':''}${btns}${qHelp(q)}</div>`}
function qHelp(q){const h={infoStd:'An info token is a marker in front of a wire that tells everyone its number. Everyone places one (tags one of their own blue wires): pick one that helps the crew, such as a value you hold once or twice.',pickMatch:'Two of your wires match: choose which one is cut.',tagPick:'The cut missed. To tag a wire is to put an info token with its true number in front of it, so everyone knows it: choose which pointed wire gets it.',swapPick:'A trade: pick the wire you give back.',designate:'Pick who must cut this value.',declare:'Turn over a number card: you must then cut that value.'}[q.kind];return h?`<p class="tiny">${esc(h)}</p>`:''}
function turnHTML(V){const L=V.legal,sel=UI.sel;let h='';
  // special all-at-once actions
  if(sel&&sel.mode==='multi'){const m={a:'multi',kind:sel.kind,tg:sel.tg};const err=sel.tg.length===sel.n?legal(m,V.seat):`pick ${sel.n-sel.tg.length} more`;
    return `<div class="card you"><h3>${esc(multiName(sel.kind))}</h3><p>Tap ${sel.n} wires on the table (${sel.tg.length} picked). If any is wrong, the job may blow up.</p><div class="row"><button class="btn go" data-a="domulti" ${err?'disabled':''}>${ico('cut')}Point at all ${sel.n}</button><button class="btn small" data-a="cancel">Cancel</button></div>${err&&sel.tg.length===sel.n?`<p class="hint">${esc(err)}</p>`:''}</div>`}
  if(sel&&sel.mode==='choose')return chooseHTML(V);
  if(sel&&sel.mode==='flipown'){const fus=[...new Set(L.flip.map(m=>m.fu))];return `<div class="card you"><h3>Which flipped wire?</h3><p>You cannot see your flipped wires. Pick the one you want to cut with this dual cut.</p><div class="row">${fus.map(u=>{const f=findU(u);return `<button class="btn" data-a="fu" data-u="${u}">${esc(wireName(f.s,f.k,V))}</button>`}).join('')}<button class="btn small" data-a="cancel">Cancel</button></div></div>`}
  const step=!sel||!sel.tg.length?1:sel.v==null?2:3;
  h+=`<div class="card you"><h3>${ico('cut')} Dual cut</h3><div class="steps"><span class="${step===1?'on':'ok'}">1 Point</span><span class="${step===2?'on':step>2?'ok':''}">2 Say a value</span><span class="${step===3?'on':''}">3 Snip</span></div>`;
  if(step===1)h+=`<p>Tap a <b>glowing wire</b> of a crewmate: you will say a value you hold.</p>`+pointList(V,null);
  else{const t=sel.tg[0];h+=`<p>Pointing at <b>${esc(sel.tg.length>1?nm(ownerOf(t.st))+'\'s wires '+sel.tg.map(x=>LET(x.k)).join(', '):wireName(t.st,t.k,V))}</b>${sel.tool?' with the <b>'+esc(toolName(sel.tool))+'</b>':''}. <button class="btn small" data-a="untarget">Change</button></p>`;
    const need=toolN(sel.tool);if(need>1&&need<99&&sel.tg.length<need)h+=`<p class="hint">The ${esc(toolName(sel.tool))} points at ${need} wires on one stand: tap ${need-sel.tg.length} more.</p>`+pointList(V,t.st);
    const vs=dualVals(sel);h+=`<div class="vals">${vs.map(v=>`<button class="vb${v==='Y'?' y':''}${sel.v===v?' sel':''}" data-a="v" data-v="${v}">${v==='Y'?'⚡':v}<small>you hold ${heldCount(V,v)}</small></button>`).join('')}</div>`;
    if(sel.two&&sel.v!=null){h+=`<p class="hint">Second value for the ${esc(toolName(sel.two))}:</p><div class="vals">${vs.filter(v=>v!==sel.v).map(v=>`<button class="vb${v==='Y'?' y':''}${sel.v2===v?' sel':''}" data-a="v2" data-v="${v}">${v==='Y'?'⚡':v}</button>`).join('')}</div>`}
    if(sel.v!=null){const m=buildDual(sel);const err=legal(m,V.seat);let risk='';if(UI.help&&sel.tg.length===1){const W=wwk(V);const sl=W&&W.slots.find(x=>x.st===t.st&&x.k===t.k);if(sl){const p=sl.prob[String(sel.v==='Y'?'yellow':sel.v)]||0;const pr=sl.prob.red||0;risk=`<p class="why">Chance it is ${esc(VNm(sel.v))}: <b>${Math.round(p*100)}%</b>${pr>0?` · red: <b>${Math.round(pr*100)}%</b>`:''}</p>`}}
      h+=risk+`<button class="btn go wide" data-a="dual" ${err?'disabled':''}>${ico('cut')}Snip: say ${esc(VNm(sel.v))}${sel.v2!=null?' / '+esc(VNm(sel.v2)):''}</button>${err?`<p class="hint">${esc(err)}</p>`:''}`}}
  // tools and probes
  const T=noGear()?{}:L.tools,tools=[];for(const t of ['dd','pt3','eq3','eq5'])if(T[t])tools.push(t);const twos=['pt10','eq10'].filter(t=>T[t]);
  if(tools.length||twos.length||L.flip.length){h+=`<div class="gear" style="margin-top:6px">`+tools.map(t=>`<button class="gbtn tool${sel&&sel.tool===t?' on':''}" data-a="tool" data-t="${t}"><b>${toolN(t)===99?'∀':toolN(t)}</b><span>${esc(toolName(t))}<small>${t==='eq5'?'a whole stand':'point at '+toolN(t)+' wires'}</small></span></button>`).join('')+
      twos.map(t=>`<button class="gbtn tool${sel&&sel.two===t?' on':''}" data-a="two" data-t="${t}"><b>2</b><span>${esc(toolName(t))}<small>say two values</small></span></button>`).join('')+(L.flip.length?`<button class="gbtn tool${sel&&sel.fu!=null?' on':''}" data-a="flipmode"><b>↺</b><span>Use my flipped wire<small>you cannot see it</small></span></button>`:'')+`</div>`}
  if(sel)h+=`<div class="row" style="margin-top:6px"><button class="btn small" data-a="cancel">Start again</button></div>`;
  h+='</div>';
  // other actions
  const solos=L.solo;const others=L.other.filter(m=>m.a!=='eq'&&!(noGear()&&m.a==='item'));const coffee=noGear()?[]:L.other.filter(m=>m.a==='eq');
  let oa='';if(solos.length||others.length||L.special.length){oa+=`<div class="card"><h3>Other actions</h3><div class="row">`;
    for(const m of solos)oa+=`<button class="btn go" data-a="solo" data-v="${m.v}" data-ep="${m.ep?1:''}" data-fu="${m.fu!=null?m.fu:''}">${ico('cut')}Solo cut ${esc(VNm(m.v))}${m.ep?' (Express Pass)':''}${m.flip?' + flipped wire':''}</button>`;
    for(const m of L.special)oa+=`<button class="btn" data-a="multi" data-kind="${m.kind}" data-n="${m.tg.length}">${ico('four')}${esc(multiName(m.kind))}</button>`;
    const groups={};for(const m of others){const k=moveKey(m);(groups[k]=groups[k]||[]).push(m)}
    for(const k in groups)oa+=`<button class="btn" data-a="grp" data-k="${esc(k)}">${esc(keyName(groups[k][0]))}${groups[k].length>1&&!stepsOf(k).length?' ('+groups[k].length+')':''}</button>`;
    oa+=`</div>${solos.length?'<p class="hint">A solo cut never fails: you hold every wire of that value still uncut.</p>':''}</div>`}
  if(solos.length)h=oa+h;else h+=oa;
  // equipment
  const eqm=noGear()?[]:L.eq.concat(coffee);h+=gearButtons(eqm,false,V);const og=otherGearHTML(V);if(og)h+=`<div class="card">${og}</div>`;
  return h+annHTML(V)}
// the same choice as tapping a glowing wire on the table, as a list of buttons (keyboard, screen readers, tiny racks)
function tokLabel(x){const t=x.tok&&x.tok[0];if(!t)return '';const v=t.v==='Y'?'yellow':t.v;return t.t==='n'||t.t==='y'?String(v):t.t==='p'?(t.v==='e'?'even':'odd'):t.t==='c'?'×'+t.v:t.t==='f'?'not '+t.v:''}
function pointList(V,onlySt){const L=V.legal;if(!L)return '';const by=new Map();
  for(const m of L.plain){if(onlySt!=null&&m.st!==onlySt)continue;const k=m.ks[0];const key=m.st+':'+k;if(UI.sel&&UI.sel.tg&&UI.sel.tg.some(t=>t.st===m.st&&t.k===k))continue;
    const own=ownerOf(m.st);if(!by.has(own))by.set(own,new Map());const sm=by.get(own);if(!sm.has(m.st))sm.set(m.st,new Set());sm.get(m.st).add(k)}
  if(!by.size)return '';let rows='';
  for(const [own,sm] of by){for(const [si,ks] of sm){const two=seatStands(own).length>1;const st=V.stands.find(x=>x.i===si);
    rows+=`<div class="parow"><b>${esc(nm(own))}${two?' · stand '+(seatStands(own).indexOf(si)+1):''}</b><span>${[...ks].sort((a,b)=>a-b).map(k=>{const x=st&&st.slots[k];const tl=x?tokLabel(x):'';return `<button class="pa" data-a="pointat" data-st="${si}" data-k="${k}" aria-label="Point at ${esc(wireName(si,k,V))}${tl?', token '+esc(tl):''}">${LET(k)}${tl?`<small>${esc(tl)}</small>`:''}</button>`}).join('')}</span></div>`}}
  return `<details class="palist"${document.documentElement.classList.contains('ph')?'':' open'}><summary>Point from a list</summary>${rows}</details>`}
function multiName(k){return ({red3:'Grab the three reds',four:'Point at all four',sevens:'Cut the four 7s',y3:'Point at the three yellows',lever:'Pull the lever (two yellows)',rush:'Yellow rush'})[k]||'All at once'}
function gearButtons(moves,off,V){if(!moves.length)return '';const groups={};for(const m of moves){const k=moveKey(m);(groups[k]=groups[k]||[]).push(m)}
  let h=`<div class="card"><h3>${ico('gear')} ${off?'Any-time gear':'Gear you can use'}</h3><div class="gear">`;
  for(const k in groups){const m=groups[k][0];const E=m.a==='eq'?EQUIP[m.id]:null;h+=`<button class="gbtn" data-a="${off?'offgrp':'grp'}" data-k="${esc(k)}"><b>${E?(E.v==='Y'?'Y':E.v):'★'}</b><span>${esc(keyName(m))}<small>${esc(E?shortEq(m.id):ITEMS[m.k]?'personal tool':'')}</small></span></button>`}
  return h+`</div></div>`}
function anyTimeHTML(V){if(V.seat<0||G.over||noGear())return '';let moves=[];try{moves=validMoves(V.seat).filter(m=>m.a==='eq'||m.a==='item')}catch(e){}let h=moves.length?gearButtons(moves,true,V):'';
  if(UI.offSeat===V.seat)h+=`<div class="row"><button class="btn small" data-a="offdone">${ico('back')}Done: pass the device back</button></div>`;return h}
function otherGearHTML(V){if(noGear()||modeOf()!=='hot'||G.over||G.q)return '';const o=humans().filter(s=>s!==V.seat&&(()=>{try{return validMoves(s).some(m=>m.a==='eq'||m.a==='item')}catch(e){return false}})());
  if(!o.length)return '';return `<p class="tiny">Any-time gear can be used by anyone, even off-turn:</p><div class="row">${o.map(s=>`<button class="btn small" data-a="offseat" data-seat="${s}">${ico('gear')}${esc(nm(s))} wants to use gear</button>`).join('')}</div>`}
function chooseHTML(V){const sel=UI.sel;const rem=selRemaining(sel);const step=nextStep(sel);const m0=sel.opts[0];const E=m0.a==='eq'?EQUIP[m0.id]:m0.a==='item'?ITEMS[m0.k]:null;
  let h=`<div class="card you"><h3>${esc(keyName(m0))}</h3>${E?`<p class="tiny">${esc(E.text)}</p>`:''}`;
  if(step&&step.board)h+=`<p>Tap a <b>glowing wire</b> on the table.</p>`;
  else if(step){const vals=[...new Set(rem.map(m=>JSON.stringify(m[step.key])))].map(x=>JSON.parse(x));h+=`<div class="row">${vals.map(v=>`<button class="btn" data-a="param" data-k="${step.key}" data-v="${esc(JSON.stringify(v))}">${esc(paramLabel(step.key,v,m0,V))}</button>`).join('')}</div>`}
  else if(rem.length>1){h+=`<div class="row">${rem.map((m,i)=>`<button class="btn" data-a="pickmove" data-i="${i}">${esc(nice(describeMove(m),V))}</button>`).join('')}</div>`}
  else{const m=rem[0];const err=m?legal(m,V.seat):'nothing to do';h+=`${sel.picked&&sel.picked.length?`<p>On ${esc(wireName(sel.picked[0].s,sel.picked[0].k,V))}.</p>`:''}<button class="btn go wide" data-a="choose" ${err?'disabled':''}>${ico('check')}Use ${esc(keyName(m0))}</button>${err?`<p class="hint">${esc(err)}</p>`:''}`}
  return h+`<div class="row" style="margin-top:6px"><button class="btn small" data-a="cancel">Cancel</button></div></div>`}
function annHTML(V){const A=(V.ann||[]).slice(-5).reverse();if(!A.length)return '';return `<div class="card"><h3>${ico('mute')} Crew calls</h3><ul class="ann">${A.map(a=>`<li>${esc(annText(a,V))}</li>`).join('')}</ul><p class="tiny">The only talk allowed: the answers the rules ask for.</p></div>`}
function annText(a,V){switch(a.k){case 'sweep':return `Sweep for ${a.v}: `+a.res.map(r=>`${nm(ownerOf(r.st))}${seatStands(ownerOf(r.st)).length>1?' (stand '+(seatStands(ownerOf(r.st)).indexOf(r.st)+1)+')':''} ${r.yes?'yes':'no'}`).join(', ');case 'holds':return `${nm(a.seat)} ${a.yes?'holds':'holds no'} ${VNm(a.v)}`;
  case 'side':return `${nm(ownerOf(a.st))}: ${a.mean==='none'?'holds no':'holds'} ${VNm(a.v)}`;case 'needOx':return `${nm(a.seat)} signals: I need oxygen`;case 'yel':return `${nm(a.seat)} holds ${a.n} yellow`;default:return Object.entries(a).filter(([k])=>k!=='turn').map(([k,v])=>k==='seat'?nm(v):typeof v==='object'?'':v).filter(Boolean).join(' ')}}
function gearWords(t){const o=[];try{for(const id of Object.keys(EQUIP)){const E=EQUIP[id];if(E&&E.n&&new RegExp('\\b'+E.n+'\\b').test(t)&&shortEq(id))o.push(`<b>${esc(E.n)}</b>: a gear card that unlocks mid-job (${esc(shortEq(id).toLowerCase())}).`)}if(/Twin Probe/.test(t))o.push('<b>Twin Probe</b>: a personal tool on a crew card; it points at two wires at once.')}catch(e){}return o.length?`<p class="tiny">${o.join(' ')}</p>`:''}
function overHTML(V){const w=G.over.win;const [title,tip]=w?['Every wire is safe.','']:lossHelp(G.over.why);const st=G.stats||{};const n=G.mission;const next=n<66?n+1:null;
  return `<div class="card over ${w?'win':'lose'}"><h3>${w?'DEFUSED!':'BOOM!'}</h3><p><b>${esc(w?G.winText:title)}</b></p>${w?'':`<p class="why"><b>Why it failed:</b> ${esc(G.over.why)}. ${esc(tip)}</p>${gearWords(tip)}`}
  <div class="statgrid"><div><b>${G.turn}</b>turns</div><div><b>${G.dial!=null?G.dial:'-'}</b>fuse left</div><div><b>${st.miss||0}</b>misses</div><div><b>${st.dualOk||0}/${st.dual||0}</b>dual hits</div><div><b>${st.solo||0}</b>solo cuts</div><div><b>${st.eqUse||0}</b>gear used</div></div>
  ${isClient()?'<p class="hint">Waiting for the host to pick the next job.</p>':`<div class="row">${w&&next?`<button class="btn go" data-a="next">${ico('fwd')}Next job: ${next}</button>`:''}<button class="btn ${w?'':'go'}" data-a="again">${ico('flip')}Play job ${n} again</button><button class="btn" data-a="board">${ico('target')}Mission board</button></div>`}</div>`}
function toast(t){const el=$('#res');if(!el)return;el._h=null;const d=document.createElement('div');d.className='res info';d.innerHTML=`<p>${esc(t)}</p>`;el.innerHTML='';el.appendChild(d);$('#live').textContent=t;GX.showDock()}
// ---------- dock clicks ----------
document.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b||b.disabled)return;const a=b.dataset.a;const V=UI.V;
  if(netClick(a))return;
  switch(a){
  case 'take':UI.holder=+b.dataset.seat;UI.sel=null;sfx('click');refresh();return;
  case 'pause':togglePause();return;
  case 'xray':UI.xray=!UI.xray;refresh();return;
  case 'q':answer(+b.dataset.i);return;
  case 'off':{const m=(V.off||[])[+b.dataset.i];if(m)act(m,V.seat);return}
  case 'v':{const v=b.dataset.v==='Y'?'Y':+b.dataset.v;UI.sel.v=v;if(UI.sel.v2===v)UI.sel.v2=null;sfx('select');refresh();return}
  case 'v2':{const v=b.dataset.v==='Y'?'Y':+b.dataset.v;UI.sel.v2=v;sfx('select');refresh();return}
  case 'dual':{const m=buildDual(UI.sel);if(m)act(m,V.seat);return}
  case 'untarget':UI.sel.tg=[];UI.sel.v=null;refresh();return;
  case 'pointat':onTile(+b.dataset.st,+b.dataset.k);return;
  case 'cancel':UI.sel=null;refresh();return;
  case 'tool':{const t=b.dataset.t;const s=UI.sel||(UI.sel={mode:'dual',tool:null,tg:[],v:null,v2:null,two:null,fu:null});s.tool=s.tool===t?null:t;s.fu=null;if(s.v==='Y')s.v=null;
    if(s.tg.length){const st=s.tg[0].st;s.tg=s.tool==='eq5'?eq5Slots(st).map(k=>({st,k})):s.tg.slice(0,1)}refresh();return}
  case 'two':{const t=b.dataset.t;const s=UI.sel||(UI.sel={mode:'dual',tool:null,tg:[],v:null,v2:null,two:null,fu:null});s.two=s.two===t?null:t;s.v2=null;refresh();return}
  case 'flipmode':{const s=UI.sel;if(s&&s.fu!=null){s.fu=null;refresh();return}UI.sel={mode:'flipown',prev:s};refresh();return}
  case 'fu':{const prev=UI.sel&&UI.sel.prev;UI.sel=Object.assign(prev&&prev.mode==='dual'?prev:{mode:'dual',tg:[],v:null,v2:null,two:null},{fu:+b.dataset.u,tool:null});UI.sel.v=null;refresh();return}
  case 'solo':{const m={a:'solo',v:b.dataset.v==='Y'?'Y':+b.dataset.v};if(b.dataset.ep)m.ep=1;if(b.dataset.fu!==''){m.flip=1;m.fu=+b.dataset.fu}act(m,V.seat);return}
  case 'multi':UI.sel={mode:'multi',kind:b.dataset.kind,n:+b.dataset.n,tg:[]};refresh();return;
  case 'domulti':act({a:'multi',kind:UI.sel.kind,tg:UI.sel.tg},V.seat);return;
  case 'grp':case 'offgrp':{const k=b.dataset.k;let moves=a==='grp'&&V.legal?V.legal.eq.concat(V.legal.other).filter(m=>moveKey(m)===k):validMoves(V.seat).filter(m=>moveKey(m)===k);if(!moves.length)return;
    if(moves.length===1&&!stepsOf(k).length){act(moves[0],V.seat);return}startChoose(moves,a==='offgrp'||!V.legal);return}
  case 'param':{const s=UI.sel;s.fixed[b.dataset.k]=JSON.parse(b.dataset.v);sfx('select');const rem=selRemaining(s);if(rem.length===1&&!nextStep(s)){const m=rem[0];act(m,V.seat);return}refresh();return}
  case 'pickmove':{const m=selRemaining(UI.sel)[+b.dataset.i];if(m)act(m,V.seat);return}
  case 'offseat':UI.offSeat=+b.dataset.seat;UI.sel=null;refresh();return;
  case 'offdone':UI.offSeat=null;UI.sel=null;refresh();return;
  case 'choose':{const rem=selRemaining(UI.sel);if(rem[0])act(rem[0],V.seat);return}
  case 'sugg':{const W=wwk(V);const m=W&&W.suggestion&&W.suggestion.m;if(!m)return;if(m.a==='dual'){UI.sel={mode:'dual',tool:m.tool||null,tg:m.ks.map(k=>({st:m.st,k})),v:m.v,v2:m.v2!=null?m.v2:null,two:m.two||null,fu:m.fu!=null?m.fu:null}}else if(m.a==='multi'){UI.sel={mode:'multi',kind:m.kind,n:m.tg.length,tg:m.tg.slice()}}else{act(m,V.seat);return}refresh();return}
  case 'coach':UI.tut.done[b.dataset.id]=1;refresh();return;
  case 'zoom':zoomNext();return;
  case 'coachask':UI.coachAsk=true;refresh();return;
  case 'coachkeep':UI.coachAsk=false;refresh();return;
  case 'coachoff':UI.coach=false;UI.coachAsk=false;saveSettings();refresh();return;
  case 'myack':UI.myAck=true;UI.aiNotBefore=0;refresh();return;
  case 'briefok':UI.brief=null;sfx('click');refresh();return;
  case 'next':startJob(Object.assign({},UI.lastSetup,{job:G.mission+1,captain:(G.captain+1)%G.np}));return;
  case 'again':startJob(Object.assign({},UI.lastSetup,{captain:G.captain}));return;
  case 'board':showStart();return;
  // settings
  case 'snd':toggleSound();renderSettings();return;
  case 'mus':toggleMusic();renderSettings();return;
  case 'speed':UI.speed=+b.dataset.v;saveSettings();renderSettings();return;
  case 'gfx':setGfx(b.dataset.v);renderSettings();return;
  case 'help':UI.help=!UI.help;saveSettings();renderSettings();refresh();return;
  case 'coachon':UI.coach=!UI.coach;if(UI.coach&&!UI.tut)UI.tut={done:{}};saveSettings();renderSettings();refresh();return;
  case 'newgame':GX.close();showStart();return;
  case 'restart':GX.close();if(UI.lastSetup)startJob(UI.lastSetup);return;
  // start screen
  case 'job':UI.setup.job=+b.dataset.n;fixSetup();if(UI.sv==='board')UI.sv='setup';renderStart();sfx('select');return;
  case 'sttitle':UI.sv='title';renderStart();return;
  case 'stplay':UI.sv='setup';renderStart();return;
  case 'stonline':UI.sv='setup';UI.onl=true;renderStart();return;
  case 'stboard':UI.sv='board';renderStart();return;
  case 'stsetup':UI.sv='setup';renderStart();return;
  case 'strules':GX.show('rulesd');return;
  case 'np':UI.setup.np=+b.dataset.v;fixSetup();renderStart();return;
  case 'seatkind':{const i=+b.dataset.i;UI.setup.seats[i]=UI.setup.seats[i]==='human'?'ai':'human';renderStart();return}
  case 'lv':UI.setup.lv=b.dataset.v;renderStart();return;
  case 'preset':preset(b.dataset.v);return;
  case 'helpset':UI.setup.help=!UI.setup.help;UI.setup.helpTouched=1;renderStart();return;
  case 'start':startJob(UI.setup);return;
  case 'tutorial':startTutorial();return;
  case 'resume':resumeSaved();return;
  case 'closestart':if(G){hideStart()}return;
  }});
document.addEventListener('change',e=>{const t=e.target;if(t.dataset.ch!=null){UI.setup.chars[+t.dataset.ch]=t.value;return}if(t.dataset.nm!=null){UI.setup.names[+t.dataset.nm]=t.value.slice(0,14)||DEFNAMES[+t.dataset.nm]}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&UI.sel&&!GX.open){UI.sel=null;refresh()}});
// ---------- settings ----------
function saveSettings(){lsSet('sf_set',{speed:UI.speed,help:UI.help,coach:UI.coach})}
function loadSettings(){const s=lsGet('sf_set',{});if(s.speed)UI.speed=s.speed;if(s.coach===false)UI.coach=false}
function gfxState(){try{return SFKit.getQuality()}catch(e){return {pref:'auto',active:'2d'}}}
function setGfx(q){try{SFKit.setQuality(q)}catch(e){}try{if(window.PerfHUD)PerfHUD.hitch()}catch(e){}}
function renderSettings(){const g=gfxState();const on3=window.SFKit&&SFKit._K&&SFKit._K.on;const sp=[[.5,'Slow'],[1,'Normal'],[2,'Fast'],[5,'Very fast']];
  $('#setbody').innerHTML=`<div class="setgrid">
  <div><div class="lbl">Sound</div><div class="row"><button class="btn${SND.on?' on':''}" data-a="snd" id="sndbtn">${ico('snd')}Sound ${SND.on?'on':'off'}</button><button class="btn${SND.music?' on':''}" data-a="mus" id="musbtn">${ico('music')}Music ${SND.music?'on':'off'}</button></div></div>
  <div><div class="lbl">Computer crew speed</div><div class="row">${sp.map(([v,l])=>`<button class="btn small${UI.speed===v?' on':''}" data-a="speed" data-v="${v}">${l}</button>`).join('')}</div></div>
  <div><div class="lbl">Graphics ${on3?`(now: ${esc(g.active)})`:'(2D board: no WebGL here)'}</div><div class="row">${['auto','high','medium','low'].map(q=>`<button class="btn small${g.pref===q?' on':''}" data-a="gfx" data-v="${q}" ${on3?'':'disabled'}>${q[0].toUpperCase()+q.slice(1)}</button>`).join('')}</div>
   <p class="tiny">Auto picks Low on a software graphics driver and steps down by itself if frames drop.</p><div id="perfslot">${window.PerfHUD&&PerfHUD.buttonsHTML?PerfHUD.buttonsHTML('btn small'):''}</div></div>
  <div><div class="lbl">Help</div><div class="row"><button class="swt${UI.help?' on':''}" role="switch" aria-checked="${!!UI.help}" data-a="help"><i></i>Suggested move: ${UI.help?'On':'Off'}</button><button class="swt${UI.coach?' on':''}" role="switch" aria-checked="${!!UI.coach}" data-a="coachon"><i></i>Lesson tips: ${UI.coach?'On':'Off'}</button></div></div>
  <div><div class="lbl">Game</div><div class="row">${isClient()?`<button class="btn small" data-a="netleave">${ico('back')}Leave the online game</button>`:`${G&&!G.over?`<button class="btn small" data-a="pause">${ico(UI.pause?'play':'pause')}${UI.pause?'Resume':'Pause'}</button><button class="btn small" data-a="restart">${ico('flip')}Restart this job</button>`:''}<button class="btn small" data-a="newgame">${ico('target')}Mission board</button>`}<button class="btn small" data-gx="credd">${ico('info')}Credits</button></div></div></div>`}
// ---------- drawers ----------
function renderOpenDrawer(){const id=GX.open;if(!id||!G)return;if(id==='logd')renderLog();else if(id==='missiond')renderMission();else if(id==='geard')renderGear();else if(id==='knowd')renderKnow();else if(id==='setd')renderSettings()}
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
function renderGear(){const V=UI.V||view();if(noGear()){$('#gearbody').innerHTML='<p><b>This training job has no equipment and no personal tools.</b> Gear cards appear in later jobs: they unlock when the crew cuts certain numbers, and this drawer will show them.</p>';return}let h='<p class="tiny">The row of cards on the table mat is the crew\'s equipment. A card is <b>locked</b> until the crew cuts the numbers named on it, then it is <b>ready</b> for one use (or every turn, if it says so) and then <b>used</b>. Personal tools sit on each player\'s crew card.</p><div class="eqgrid">';
  V.eq.forEach((e,i)=>{if(e.down||!e.id){h+=`<div class="eqc locked"><div class="et"><b>?</b>Face-down card</div><div class="ex">It turns up during the job.</div><div class="es">face down</div></div>`;return}const E=EQUIP[e.id];
    h+=`<div class="eqc ${e.st}"><div class="et"><b>${E.v==='Y'?'Y':E.v}</b>${esc(E.n)}<span class="tm">${{any:'any time',turn:'your turn',start:'start of turn',instant:'instant'}[E.timing]}</span></div><div class="ex">${esc(E.text)}</div><div class="es">${e.st==='locked'?`${ico('lock')} locked: cut ${E.need===4?'all four':'two'} ${E.v==='Y'?'yellows':E.v+'s'}${e.cover!=null?' and two '+e.cover+'s':''}`:e.st==='ready'?'ready to use'+(e.perm?' (every turn)':''):'used'}</div></div>`});
  h+='</div><h3>Crew and personal tools</h3><div class="eqgrid">';
  for(const q of V.seats){const c=q.ch?CHARS[q.ch]:null;const it=c?ITEMS[c.item]:null;h+=`<div class="eqc ${q.chUsed?'used':'ready'}"><div class="et" style="background:${SEATC[q.pos%5]}"><b>${q.i===G.captain?'★':''}</b>${esc(q.nm)}: ${esc(c?c.n:q.chDown?'face-down card':'no crew card')}</div><div class="ex">${it?`<b>${esc(it.n)}</b>: ${esc(it.text)}`:'No personal tool.'}</div><div class="es">${q.chUsed?'tool used':q.chDown?'face down':it?'tool ready':''}</div></div>`}
  $('#gearbody').innerHTML=h+'</div>'}
function renderKnow(){const V=UI.V||view();if(V.seat<0){$('#knowbody').innerHTML='<p>"What we know" is shown for a human crew member. In watch mode, use "Show all wires".</p>'+annHTML(V);return}
  const W=wwk(V);let h=`<p class="tiny">From ${esc(nm(V.seat))}'s point of view: the sort order, every token, failed probes, tags and the crew's calls.</p><div class="legend"><b>How to read this:</b> "Could be" lists every number the wire can still be. "Most likely" gives the best guesses and their chances. "certain" means only one number fits.</div>`;
  if(W&&W.suggestion)h+=`<div class="now"><b>Suggested:</b> ${esc(nice(sugText(W.suggestion.m,V),V))}. <i>${esc(nice(W.suggestion.why||'',V))}</i></div>`;
  for(const st of V.stands){if(st.mine)continue;const cells=W?W.slots.filter(x=>x.st===st.i):[];
    h+=`<h4>${esc(nm(st.owner))}${seatStands(st.owner).length>1?' (stand '+(seatStands(st.owner).indexOf(st.i)+1)+')':''}</h4><table class="wk"><tr><th>Wire</th><th>Could be</th><th>Most likely</th></tr>`;
    const cutL=[];st.slots.forEach((x,k)=>{if(x.cut){cutL.push(LET(k)+'='+VNm(x.v));return}const c=cells.find(y=>y.k===k);if(x.v!=null){h+=`<tr><td>${LET(k)}</td><td class="c" colspan="2">${esc(VNm(x.v))} (you can see it)</td></tr>`;return}
      const pr=c?Object.entries(c.prob).sort((a,b)=>b[1]-a[1]).slice(0,3):[];const tk=x.tok.map(t=>tok2kit(t)).filter(Boolean).join(', ');
      h+=`<tr><td>${LET(k)}${tk?` <small>token ${esc(tk)}</small>`:''}</td><td>${c?esc(c.possible.join(', ')):'?'}${x.not.length?` <small>not ${esc(x.not.map(VNm).join(', '))}</small>`:''}</td><td${c&&c.certain!=null?' class="c"':''}>${c&&c.certain!=null?'certain: '+esc(c.certain):pr.length?pr.map(([v,p])=>`${esc(v)} ${Math.round(p*100)}%`).join(' · '):'no favourite yet'}</td></tr>`});if(cutL.length)h+=`<tr><td colspan="3"><small>Already cut: ${esc(cutL.join(', '))}</small></td></tr>`;h+='</table>'}
  h+=annHTML(V);const lines=jobState(V);if(lines.length)h+=`<h4>The job</h4><ul class="ann">${lines.map(l=>`<li>${esc(l)}</li>`).join('')}</ul>`;
  $('#knowbody').innerHTML=h}
function renderRef(){const E=refEntries();let h='',sec='';for(const e of E){if(e.s!==sec){if(sec)h+='</div>';sec=e.s;h+=`<h3>${esc(sec)}</h3><div class="reflist">`}
    h+=`<div class="ref"><span class="rc">${e.c!=null?'×'+e.c:'·'}</span><div><b>${esc(e.n)}</b>${e.tags.map(t=>`<small>${esc(t)}</small>`).join('')}<br>${esc(e.t)}</div></div>`}
  $('#refbody').innerHTML=h+'</div>'}
// ---------- campaign progress ----------
function camp(){if(!UI.camp)UI.camp=lsGet('sf_camp',{v:1,jobs:{}});return UI.camp}
function unlocked(n){const c=camp();return n===1||!!(c.jobs[n-1]&&c.jobs[n-1].w)||!!(c.jobs[n]&&c.jobs[n].p)}
function recordResult(){if(!humans().length)return;const c=camp();const n=G.mission;const j=c.jobs[n]=c.jobs[n]||{p:0,w:0,best:null};j.p++;
  if(G.over.win){j.w++;const r={left:G.dial,turns:G.turn,np:G.np};if(!j.best||(r.left!=null&&(j.best.left==null||r.left>j.best.left))||(r.left===j.best.left&&r.turns<j.best.turns))j.best=r}lsSet('sf_camp',c)}
// ---------- start screen ----------
function defaultSetup(){const s=lsGet('sf_setup',null);const d={job:1,np:3,seats:['human','ai','ai','ai','ai'],lv:'normal',chars:[],names:DEFNAMES.slice(),help:true};if(s)Object.assign(d,s,{helpTouched:0},{names:(s.names||DEFNAMES).slice()});fixSetup(d);return d}
function fixSetup(s){s=s||UI.setup;const M=MISSIONS[s.job];if(!M.pl.includes(s.np))s.np=M.pl.find(x=>x>=s.np)||M.pl[M.pl.length-1];if(!s.helpTouched)s.help=true;const ok=allowedChars(s.job,s.np);s.chars=s.chars||[];for(let i=0;i<5;i++)if(s.chars[i]&&!ok.includes(s.chars[i]))s.chars[i]='';return s}
function preset(v){const s=UI.setup;if(v==='solo')s.seats=['human','ai','ai','ai','ai'];if(v==='hot')s.seats=['human','human','human','human','human'];if(v==='watch')s.seats=['ai','ai','ai','ai','ai'];renderStart()}
function showStart(){if(isClient()){hideStart();return}clearTimeout(UI.aiT);UI.aiT=null;UI.setup=UI.setup||defaultSetup();if(G||UI.onl||NET.on)UI.sv=UI.sv==='board'?'board':'setup';sndLoop('hum',true);musicStop(.8);$('#start').hidden=false;renderStart();sndLoop('clock_loop',false)}
function hideStart(){$('#start').hidden=true;sndLoop('hum',false)}
function renderStart(){const s=UI.setup,n=s.job,M=MISSIONS[n],c=camp();const saved=savedGame();
  let jobs='';for(const [a,b,label] of BOXES){jobs+=`<div class="box">${esc(label)}</div><div class="jobs">`;for(let k=a;k<=b;k++){const j=c.jobs[k];const lk=!unlocked(k);
      jobs+=`<button class="jt${j&&j.w?' done':''}${lk?' locked':''}${k===n?' sel':''}" data-a="job" data-n="${k}" aria-pressed="${k===n}" title="${esc(MISSIONS[k].nm)}${lk?' (not unlocked yet, still playable)':''}"><b>${k}</b><span>${esc(MISSIONS[k].nm)}</span>${j&&j.w?'<i>✓</i>':lk?'<i>🔒</i>':''}${MISSIONS[k].audio||hasRule(k,'timer')?'<i class="t">⏱</i>':''}</button>`}jobs+='</div>'}
  const j=c.jobs[n];const chips=ruleChips(n);const ok=allowedChars(n,s.np);
  const onl=isHost(),nOnl=onl?Math.min(s.np,NET.peers.length||1):0;const seats=[];for(let i=0;i<s.np;i++)seats.push(`<div class="seat" style="--sc:${SEATC[i]}"><span class="dot"></span><span class="nm">${onl&&i<nOnl?`<b>${esc(netPlan(s).names&&netPlan(s).names[i]||'Player')}</b>`:`<input data-nm="${i}" value="${esc(s.names[i])}" aria-label="Name of seat ${i+1}" maxlength="14" style="width:7.5em;font:800 .9rem var(--fb);border:2px solid var(--ink);border-radius:8px;padding:3px 5px;background:#fff7e8">`}<select data-ch="${i}" aria-label="Crew card for seat ${i+1}"><option value="">Crew: random</option>${ok.map(id=>`<option value="${id}"${s.chars[i]===id?' selected':''}>${esc(CHARS[id].n)} (${esc(ITEMS[CHARS[id].item].n)})</option>`).join('')}</select></span>${onl?`<span class="tag${i<nOnl?' b':''}">${i<nOnl?ico('user')+'Online player':ico('robot')+'Computer'}</span>`:`<button class="btn small${s.seats[i]==='human'?' on':''}" data-a="seatkind" data-i="${i}">${s.seats[i]==='human'?ico('user')+'Human':ico('robot')+'Computer'}</button>`}</div>`);
  const nh=s.seats.slice(0,s.np).filter(x=>x==='human').length;
  // title -> setup; on narrow screens the mission board is its own full-screen view (UI.sv: 'title' | 'setup' | 'board')
  const narrow=startNarrow(),sv=UI.sv||'title';
  const head=`<div class="st-head">${sv!=='title'?`<button class="btn small sback" data-a="${sv==='board'&&narrow?'stsetup':'sttitle'}" aria-label="Back">${ico('back')}</button>`:''}<svg viewBox="0 0 24 24" width="42" height="42" aria-hidden="true">${ICO.bomb}</svg><div><h1>Short Fuse</h1><p>A cartoon demolition crew defuses rigged charges together. 2-5 players, 66 jobs.</p></div><span style="flex:1"></span>${G&&!G.over?'<button class="btn small" data-a="closestart">Back to the job</button>':''}</div>
  `;
  const quick=`<div class="quick"><button class="btn blue" data-a="tutorial">${ico('info')}Guided first game<small>Job 1 with a coach: best for new players</small></button>${saved?`<button class="btn go" data-a="resume">${ico('play')}Continue<small>Job ${saved.G.mission}, turn ${saved.G.turn}</small></button>`:`<button class="btn" data-a="preset" data-v="solo">${ico('user')}Me + computers<small>one human seat</small></button>`}<button class="btn" data-a="preset" data-v="${saved?'solo':'hot'}">${ico(saved?'user':'swap')}${saved?'Me + computers':'Hot-seat'}<small>${saved?'one human seat':'pass the device'}</small></button></div>
    `,board=`<h2>${ico('map')} Mission board</h2><p class="tiny">Win a job to unlock the next. Every job can still be played at any time. ✓ = defused, ⏱ = timed.</p>${jobs}`,setup=`<div class="setup"><div><div class="lbl">Crew size</div><div class="seg">${[2,3,4,5].map(k=>`<button class="btn small${s.np===k?' on':''}" data-a="np" data-v="${k}" ${M.pl.includes(k)?'':'disabled'}>${k}</button>`).join('')}</div></div>
    <div><div class="lbl">Seats</div>${onl?`<p class="tiny">Online: seats go to the players in the lobby in join order; the rest are played by the computer.</p>`:`<div class="seg" style="margin-bottom:4px"><button class="btn small" data-a="preset" data-v="solo">Me + computers</button><button class="btn small" data-a="preset" data-v="hot">All human (hot-seat)</button><button class="btn small" data-a="preset" data-v="watch">Watch the computer</button></div>`}${seats.join('')}</div>
    <div><div class="lbl">Computer level</div><div class="seg">${['easy','normal','hard'].map(l=>`<button class="btn small${s.lv===l?' on':''}" data-a="lv" data-v="${l}">${LV_NAME[l]}</button>`).join('')}</div></div>
    ${nh||onl?`<div><button class="swt${s.help?' on':''}" role="switch" aria-checked="${!!s.help}" data-a="helpset"><i></i>Suggested move: ${s.help?'On':'Off'}</button><p class="tiny">Shows a good move and why, on every turn of yours.</p></div>`:''}
    <button class="btn go wide" data-a="start">${ico('play')}${onl?'Start job '+n+' online ('+nOnl+' player'+(nOnl>1?'s':'')+')':nh===0?'Watch job '+n:nh===1?'Start job '+n:'Start job '+n+' (hot-seat, '+nh+' humans)'}</button></div>`;
  const brief=`<div class="brief"><div class="bt"><b>${n}</b><h3>${esc(M.nm)}</h3>${narrow?`<span style="flex:1"></span><button class="btn small" data-a="stboard">${ico('map')}Change job</button>`:''}</div><p class="flav">${esc(BRIEFS[n]||'')}</p>
    <div class="tags"><span class="tag b">${mixHTML(n,s.np)}</span><span class="tag">${ico('fuse')}Fuse ${fuseStart(n,s.np)}</span>${MISSIONS[n].audio||hasRule(n,'timer')?`<span class="tag t">${ico('clock')}Timed</span>`:''}<span class="tag">${M.pl[0]}-${M.pl[M.pl.length-1]} players</span>${j&&j.w?`<span class="tag e">${ico('check')}Defused ${j.w}×${j.best&&j.best.left!=null?', best: '+j.best.left+' fuse left':''}</span>`:j&&j.p?`<span class="tag r">Tried ${j.p}×</span>`:''}</div>
    <p class="tiny">${esc(M.text)}</p>${chips.map(c=>`<span class="tag" style="margin:2px 2px 0 0">${ico(c[0])}${esc(c[1])}</span>`).join('')}</div>
    `;
  let h;
  if(sv==='title')h=titleHTML(saved);
  else if(narrow&&sv==='board')h=head+`<div class="st-body one"><div class="pane">${board}</div></div>`;
  else if(narrow)h=head+`<div class="st-body one"><div class="pane">${UI.onl||NET.on?onlineBlock():''}${brief}${setup}</div></div>`;
  else h=head+`<div class="st-body"><div class="pane">${quick}${onlineBlock()}${board}</div>\n   <div class="pane">${brief}${setup}</div></div>`;
  $('#start').dataset.v=sv==='title'?'title':narrow?'one':'two';$('#start').innerHTML=h;paintIcons($('#start'))}
function startNarrow(){return innerWidth<=820&&innerHeight>=innerWidth*.9}
// the first screen: what to do now in one tap (a saved job first, the guided game first for a new player)
function titleHTML(saved){const first=!lsGet('sf_guided_done',false)&&!Object.keys(camp().jobs).length;
  const b=(a,cls,ic,t,sub,extra)=>`<button class="tbtn btn${cls}" data-a="${a}"${extra||''}>${ico(ic)}<span><b>${t}</b><small>${sub}</small></span></button>`;
  return `<div class="ttl"><div class="ttl-in"><svg class="ttl-bomb" viewBox="0 0 24 24" aria-hidden="true">${ICO.bomb}</svg><h1>Short Fuse</h1><p class="ttag">Cut every wire before the fuse burns down. A co-op deduction game for 2 to 5 players.</p>
  <div class="tbtns">${saved?b('resume',' go','play','Continue','Job '+saved.G.mission+', turn '+saved.G.turn):''}
  ${first?b('tutorial',saved?'':' go','info','Guided first game','Job 1 with a coach, one step at a time'):''}
  ${b('stplay',!saved&&!first?' go':'','map','Play','Pick a job: computer crew, hot-seat or watch')}
  ${b('stonline','','user','Play online','With friends, free, peer to peer')}
  ${first?'':b('tutorial','','info','Guided first game','Job 1 with a coach')}</div>
  <button class="tlink" data-a="strules">How to play</button></div></div>`}
function savedGame(){try{const s=JSON.parse(localStorage.getItem(SAVE)||'null');return s&&s.G&&!s.G.over?s:null}catch(e){return null}}
function realtimeJob(n){const M=MISSIONS[n];return !!(M.audio||hasRule(n,'timer'))}
function startJob(s){if(isClient())return;s=Object.assign({},s);s.names=(s.names||DEFNAMES).slice();let plan=null;if(isHost()){plan=netPlan(s);if(plan.err){NET.err=plan.err;UI.netOpen=true;netRender();return}NET.err='';s.np=plan.np;s.seats=plan.seats;s.names=plan.names;fixSetup(s)}
  if(!plan&&!s.tutorial)lsSet('sf_setup',{job:s.job,np:s.np,seats:s.seats,lv:s.lv,chars:s.chars,names:s.names,help:s.help});UI.lastSetup=s;
  const seats=s.seats.slice(0,s.np);const chars={};let any=0;for(let i=0;i<s.np;i++)if(s.chars[i]){chars[i]=s.chars[i];any=1}
  UI.rt=realtimeJob(s.job);UI.started=false;clearTimeout(UI.aiT);UI.aiT=null;UI.sel=null;UI.res=null;UI.prev=null;UI.holder=-1;UI.offSeat=null;UI.campDone=0;UI.kitSig={};UI.wwk=null;UI.lastPrompt=null;UI.pause=false;UI.dockSig=null;
  UI.help=s.help!==false;UI.tut=s.tutorial?{done:{}}:(s.job<=3?{done:{hello:1,stand:1}}:null);if(s.tutorial)UI.coach=true;UI.coachAsk=false;UI.myRes=null;UI.myAck=true;UI.aiNotBefore=0;UI.brief=(NET.on||isHost())?null:{n:s.job};
  const o={np:s.np,mission:s.job,seats,level:s.lv,names:s.names.slice(0,s.np),realtime:UI.rt};if(any){try{const ch=[];for(let i=0;i<s.np;i++)ch[i]=chars[i]||null;o.chars=ch}catch(e){}}if(s.captain!=null&&s.captain<s.np)o.captain=s.captain;if(s.seed!=null)o.seed=s.seed;
  kitReset();UI.started=true;hideStart();NET.starting=true;try{try{newGame(o)}catch(e){try{delete o.chars;newGame(o)}catch(e2){console.error(e2);UI.started=false;showStart();return}}
  if(plan)netBound(plan)}finally{NET.starting=false}
  if(humans().length===1&&!NET.on)UI.holder=humans()[0];
  UI.prev=snap();try{if(window.PerfHUD)PerfHUD.hitch()}catch(e){}if(SND.gesture)musicStart();else SND.wantMusic=1;refresh()}
function startTutorial(){const s=Object.assign(defaultSetup(),{job:1,np:3,seats:['human','ai','ai'],lv:'easy',help:true,tutorial:true,chars:[]});UI.setup=s;startJob(s)}
function resumeSaved(){const s=savedGame();if(!s)return;kitReset();G=s.G;UI.holder=s.ui.holder;UI.help=s.ui.help;UI.tut=s.ui.tut;UI.rt=!!s.ui.rt;UI.brief=null;UI.myRes=null;UI.myAck=true;UI.started=true;UI.prev=snap();UI.kitSig={};UI.sel=null;UI.res=null;UI.dockSig=null;UI.campDone=0;hideStart();if(SND.gesture)musicStart();refresh()}
// ---------- boot ----------
function detectSoftGPU(){if(/jsdom/i.test(navigator.userAgent))return false;try{const c=document.createElement('canvas');const gl=c.getContext('webgl');if(!gl)return false;const e=gl.getExtension('WEBGL_debug_renderer_info');const r=e?gl.getParameter(e.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER);const lose=gl.getExtension('WEBGL_lose_context');if(lose)lose.loseContext();return /swiftshader|llvmpipe|software|softpipe/i.test(String(r))}catch(e){return false}}
function perfHooks(){const PH=window.PerfHUD;if(!PH||!SFKit._K||!SFKit._K.on)return;const K=SFKit._K;const DPR={high:2,medium:1.5,low:1};
  PH.register({game:'Short Fuse',renderer:K.r,levels:['high','medium','low'],names:{high:'High',medium:'Medium',low:'Low'},anchor:'.gx-board',corner:'bl',
    getLevel:()=>SFKit.getQuality().active,isAuto:()=>SFKit.getQuality().pref==='auto',autoTop:()=>window.SF_SOFTGPU?'low':(Math.min(innerWidth,innerHeight)<600?'medium':'high'),
    setLevel:(l,why)=>{if(why==='apply')SFKit.setQuality(l);else SFKit._applyQ(l);if(GX.open==='setd')renderSettings()},
    basePR:()=>Math.min(window.devicePixelRatio||1,DPR[SFKit.getQuality().active]||1),onPixelRatio:v=>{K.r.setPixelRatio(v);const b=GX.boardSize();SFKit.resize(b.w,b.h)},
    orbit:t=>{const C=K.camState;if(!C)return;if(t==null){if(UI.orb0){C.pos.copy(UI.orb0.p);C.look.copy(UI.orb0.l);UI.orb0=null}return}if(!UI.orb0)UI.orb0={p:C.pos.clone(),l:C.look.clone()};const a=Math.sin(t*Math.PI*2)*.5;const d=UI.orb0.p.clone().sub(UI.orb0.l);const x=d.x*Math.cos(a)-d.z*Math.sin(a),z=d.x*Math.sin(a)+d.z*Math.cos(a);C.pos.set(UI.orb0.l.x+x,UI.orb0.p.y,UI.orb0.l.z+z)},
    isAnimating:()=>{try{return SFKit.isAnimating()}catch(e){return false}},beforeTest:()=>GX.close()})}
function boot(){window.SF_COLAT=1.05;GX.init({key:'sf'});paintIcons();loadSettings();window.SF_SOFTGPU=detectSoftGPU();
  const cv=$('#c3'),fb=$('#fb');const P=new URLSearchParams(location.search);let res={ok:false};
  try{res=SFKit.init(cv,{fallback:fb,force2D:P.has('2d')})}catch(e){console.error(e)}
  if(!res.ok){cv.hidden=true;fb.hidden=false;fb._wired=1;fb.addEventListener('click',e=>{const p=SFKit.pick2D(e.target);if(p)onPick(p)})}
  else{let down=null;cv.addEventListener('pointermove',e=>{try{hoverTile(SFKit.hover(e.clientX,e.clientY))}catch(x){}});cv.addEventListener('pointerleave',()=>{try{SFKit.hover(null)}catch(x){}hoverTile(null)});
    cv.addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY}});
    // a lost WebGL context (GPU reset, memory pressure on phones): carry on with the kit's 2D board instead of a blank table
    cv.addEventListener('webglcontextlost',e=>{e.preventDefault();window.SF_LOST=(window.SF_LOST||0)+1;console.warn('WebGL context lost: switching to the 2D board');setTimeout(()=>{try{SFKit._K.loopOn=false;SFKit.init(cv,{fallback:fb,force2D:true});cv.hidden=true;fb.hidden=false;
      if(!fb._wired){fb._wired=1;fb.addEventListener('click',e2=>{const p=SFKit.pick2D(e2.target);if(p)onPick(p)})}UI.kitSig={};if(G){const S=SFKit._K.st;S.stands={};refresh()}}catch(x){console.error(x)}},0)},false);cv.addEventListener('click',e=>{if(down&&Math.abs(e.clientX-down.x)+Math.abs(e.clientY-down.y)>8)return;const pk=SFKit.pick(e.clientX,e.clientY);hoverTile(pk);onPick(pk)});perfHooks()}
  GX.onResize((w,h)=>{try{SFKit.resize(w,h);SFKit.renderOnce()}catch(e){}});{const b=GX.boardSize();try{SFKit.resize(b.w,b.h)}catch(e){}}
  GX.onShow=id=>{sfx('open');if(id==='rulesd')$('#rulesbody').innerHTML=RULES_HTML+GLOSS_HTML+'<h3>Credits</h3><p>Names, card text and art are original. <button class="btn small" data-gx="credd">Full credits</button></p>';if(id==='refd')renderRef();if(id==='setd')renderSettings();if(G)renderOpenDrawer();else if(id==='logd'||id==='missiond'||id==='geard'||id==='knowd')$('#'+id+' .gx-drawer-body').innerHTML='<p>Start a job first.</p>'};
  GX.onClose=()=>sfx('close');
  setInterval(clockTick,250);setInterval(()=>{if(G&&UI.started&&timedJob()&&!G.over){const p=$('#timerpill');if(p&&UI.V){const c=clockLeft(knowledge(Math.max(0,UI.V.seat)));if(c)p.lastChild.textContent=` ${c.label} ${fmt(c.left)}${UI.pause?' ⏸':''}`}}},1000);
  netInit();showStart();if(UI.netOpen)netRender()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
