/* ===== Storytelling, tips at the real moment, and the advisor (presentation only: never changes the rules) ===== */
// per-monster verbs for the headline chronicle (index = MONS index)
const MVERB=[
 {e:'CHEWS THROUGH A SUBSTATION',s:'GORES',h:'SNORTS OFF ITS BRUISES',ko:'SHORT-CIRCUITS'},
 {e:'SIPHONS THE STORM DRAINS',s:'STRANGLES',h:'SOAKS IN A PUDDLE',ko:'IS FLUSHED AWAY'},
 {e:'GULPS A GAS MAIN',s:'SCORCHES',h:'RE-MELTS ITS SHELL',ko:'COOLS INTO ROCK'},
 {e:'SPROUTS ON A POWER LINE',s:'FLATTENS',h:'REGROWS ITS CAP',ko:'WILTS'},
 {e:'PLUGS INTO THE GRID',s:'BULLDOZES',h:'WELDS ITSELF SHUT',ko:'FALLS TO PIECES'},
 {e:'FREEZES A POWER PLANT',s:'FROSTBITES',h:'REFREEZES ITS CRACKS',ko:'MELTS AWAY'},
 {e:'DRAINS THE BROADCAST TOWER',s:'MIND-BLASTS',h:'REGROWS A LOBE',ko:'LOSES ITS MIND'},
 {e:'CRACKS OPEN A BATTERY DEPOT',s:'PINCHES',h:'SEALS ITS SHELL',ko:'CLAMS UP FOR GOOD'},
 {e:'DRINKS THE NEON SIGNS',s:'THORN-WHIPS',h:'SPROUTS NEW THORNS',ko:'IS UPROOTED'}];
const UP=s=>String(s).toUpperCase();
function meSeat(){if(!G)return -1;if(NET.on)return NET.mySeat;if(G.mode==='solo'){const h=G.pl.find(q=>q.human);return h?h.i:-1}return -1}
// a newspaper headline for one chronicle line (null when the line is not news)
function headline(l){if(!l||l.s===undefined||l.s<0||!G||!G.pl[l.s])return null;const t=l.t,p=G.pl[l.s],N=UP(mname(p)),V=MVERB[p.m]||MVERB[0];let m;
  if(m=t.match(/ resolves(?: the stolen dice)?: (.+)\.$/)){const x=m[1];const st=[...x.matchAll(/(\d+)★ from/g)].reduce((a,y)=>a+ +y[1],0);const en=(x.match(/(?:^|, )(\d+)⚡/)||[])[1];const hl=(x.match(/healed (\d+)♥/)||[])[1];
    if(st)return `★ ${N} SCORES ${st} STAR${st===1?'':'S'}${en?` AND ${V.e} (+${en}⚡)`:''}`;if(en)return `⚡ ${N} ${V.e} (+${en}⚡)`;if(hl)return `💚 ${N} ${V.h} (+${hl}♥)`;return null}
  if(m=t.match(/ smashes (.+)\.$/))return `💥 ${N} ${V.s} ${UP(m[1])}`;
  if(/ is knocked out!$/.test(t))return `☠ ${N} ${V.ko}: K.O.!`;
  if(m=t.match(/ (?:storms|dashes|wades|marches|drops from the sky|is dragged) into (Downtown|the Harbor) \(\+(\d+) stars?\)/))return m[1]==='Downtown'?`🏙 ${N} STORMS DOWNTOWN! (+${m[2]}★)`:`⚓ ${N} WADES INTO THE HARBOR (+${m[2]}★)`;
  if(/ yields and flees the city/.test(t))return `🏃 ${N} FLEES THE CITY!`;
  if(m=t.match(/ buys “(.+?)”/))return `🛒 ${N} SNAPS UP “${UP(m[1])}”`;
  if(m=t.match(/ starts in (Downtown|the Harbor) and gains (\d+) stars?/))return `👑 ${N} HOLDS ${UP(m[1])} ANOTHER DAY (+${m[2]}★)`;
  if(m=t.match(/ BRAINJACKS (.+) and resolves/))return `🧠 ${N} HIJACKS ${UP(m[1])}’S ROLL!`;
  if(m=t.match(/ plays its evolution “(.+)”/))return `🧬 ${N} EVOLVES: ${UP(m[1])}!`;
  if(/is crowned|takes the crown|wins anyway|rules the city/.test(t))return `🏆 ${N} IS THE NEW KING OF CROWN CITY!`;
  return null}
// read new chronicle lines: rivalries, near-wins, knock-out moments, your best moment
function storyScan(){if(!G)return;if(UI.sgid!==G.gid){UI.sgid=G.gid;UI.lseen=0;UI.news=[];UI.riv={};UI.rivSaid={};UI.near={};UI.best=null;UI.moment=null;UI.hadTurn=false;UI.myTurns=0;UI.myTid=null;
    const mine=meSeat();const q=mine>=0?G.pl[mine]:null;UI.news.push(q?`📰 ${UP(mname(q))} RISES FROM THE PORTAL. THE CITY TREMBLES.`:`📰 ${G.pl.length} MONSTERS RISE FROM THE PORTAL OVER CROWN CITY`)}
  const fresh=G.log.filter(l=>l.n&&l.n>UI.lseen).reverse();if(fresh.length)UI.lseen=Math.max(...fresh.map(l=>l.n));
  const me=meSeat(),myName=me>=0?mname(G.pl[me]):null;
  for(const l of fresh){const h=headline(l);if(h)UI.news.push(h);
    if(me>=0&&l.s!==me&&l.s>=0){const m=l.t.match(/ smashes (.+)\.$/);if(m){const r=new RegExp(myName+' \\(−(\\d+)');const d=m[1].match(r);if(d){UI.riv[l.s]=(UI.riv[l.s]||0)+ +d[1];
      if(UI.riv[l.s]>=4&&!UI.rivSaid[l.s]){UI.rivSaid[l.s]=1;UI.news.push(`😠 RIVALRY: ${UP(mname(G.pl[l.s]))} HAS SMASHED YOU FOR ${UI.riv[l.s]} ♥. PAYBACK TIME?`)}}}}
    if(me>=0&&l.s===me&&h){const x=l.t;let sc=0;const st=[...x.matchAll(/(\d+)★ from/g)].reduce((a,y)=>a+ +y[1],0);sc+=st*2;const dm=[...x.matchAll(/\(−(\d+)/g)].reduce((a,y)=>a+ +y[1],0);if(/ smashes /.test(x))sc+=dm*1.3;if(/BRAINJACKS/.test(x))sc+=4;if(/STORMS DOWNTOWN/.test(h))sc+=2;
      if(sc>0&&(!UI.best||sc>UI.best.sc))UI.best={sc,h,r:G.turn}}
    if(/ is knocked out!$/.test(l.t)&&G.pl[l.s]){const left=G.pl.filter(q=>q.alive).length;UI.moment={h:`💥 ${UP(mname(G.pl[l.s]))} IS DOWN!`,s:left>1?`${left} monsters left in Crown City.`:'The dust settles…',c:MONS[G.pl[l.s].m].c};clearTimeout(UI.momT);UI.momT=setTimeout(()=>{UI.moment=null;if(G)renderPanel()},ANIM?4200:1)}}
  if(!G.winner)G.pl.forEach(q=>{if(!q.alive)return;for(const th of [15,18]){const k=q.i+':'+th;if(q.vp>=th&&!UI.near[k]){UI.near[k]=1;UI.near[q.i+':15']=1;
      UI.news.push(q.i===me?`⭐ YOU HAVE ${q.vp} ★: ${Math.max(1,20-q.vp)} MORE AND THE CROWN IS YOURS`:`⚠ ${UP(mname(q))} HAS ${q.vp} ★. ONE MORE GOOD TURN AND CROWN CITY BOWS TO IT`);break}}});
  if(UI.news.length>60)UI.news.splice(0,UI.news.length-60);
  if(me>=0&&humanTurn()&&G.tid!==UI.myTid&&!G.bug){UI.myTid=G.tid;UI.myTurns++}
  if(me>=0&&humanTurn()&&G.phase==='buy'&&!G.bug)UI.hadTurn=true}
function renderNews(){const n=document.getElementById('news'),m=document.getElementById('moment');if(!n)return;
  if(!G||UI.info){n.innerHTML='';m.classList.add('hidden');return}
  const last=UI.news&&UI.news[UI.news.length-1];n.innerHTML=last?`<button class="newsbtn" data-gx="dr-log" title="Open the chronicle">${esc(last)}</button>`:'';
  if(UI.moment){m.classList.remove('hidden');m.style.setProperty('--mc',UI.moment.c||'#e63946');m.innerHTML=`<b>${esc(UI.moment.h)}</b><span>${esc(UI.moment.s)}</span>`}else{m.classList.add('hidden');m.innerHTML=''}}
// the resolve banner, with the reason things happened
function storyBanner(R){const p=R.p;const out=[...R.out];
  if(R.forced==='city'||(R.yielders.length&&R.forced))out.push(`moves into Downtown 👑 +1★`);else if(R.forced==='bay')out.push('moves into the Harbor ⚓ +1★');
  let h=`${R.bug?'🧠 ':''}<b>${esc(mname(p))}</b>${R.bug?' (borrowed roll)':''}: ${out.length?esc(out.join(' · ')):'nothing useful'}`;const why=[];
  if(R.out.some(o=>/^smashes /.test(o)))why.push(R.inT?'from the city, claws hit every monster outside':`claws from outside hit whoever holds the city${G.city>=0&&G.city!==p.i&&!R.yielders.length?` (${mname(P(G.city))} 👑)`:''}`);
  if(R.out.includes('claws hit nobody'))why.push('nobody was in the city to hit');
  if(R.out.some(o=>/hearts wasted/.test(o)))why.push('hearts cannot heal you inside the city');
  if(R.yielders.length)why.push(`${R.yielders.map(mname).join(' and ')} yielded, so ${mname(p)} ${R.forced?'moved in: +1 ★':'got to stay out'}`);
  else if(R.forced==='city')why.push(`Downtown was empty, so ${mname(p)} had to move in: +1 ★ (👑 = the monster in Downtown)`);
  else if(R.forced==='bay')why.push(`Downtown was taken and the Harbor was empty, so ${mname(p)} moved into the Harbor: +1 ★`);
  if(why.length)h+=`<div class="because">Why: ${esc(why.join('. '))}.</div>`;return h}
// first game: keep the human's only Brainjack token on weak rolls before their first own turn
function mbHold(q){if(!(UI.firstGame&&G.mode==='solo'&&!UI.hadTurn))return false;lg(q.i,`${mname(q)} keeps its Brainjack token for a better roll.`);return true}

// ---------- the opening story card ----------
function introHTML(){const me=meSeat(),q=me>=0?G.pl[me]:null;const names=G.pl.map(x=>mname(x));
  const cast=names.slice(0,-1).join(', ')+' and '+names[names.length-1];
  return `<div class="intro"><h2>📰 Dawn over Crown City</h2><p>The portal over Crown City cracked open at dawn. ${G.pl.length} monsters rose: ${esc(cast)}. Whoever reaches <b>20 ★</b>, or is the <b>last one standing</b>, becomes the city's new King.</p>
   ${q?`<p class="you" style="--mc:${MONS[q.m].c}"><svg viewBox="-66 -70 132 136" aria-hidden="true">${monArt(q.m)}</svg><span>You are <b>${esc(UP(mname(q)))}</b>, ${esc(MONS[q.m].d.charAt(0).toLowerCase()+MONS[q.m].d.slice(1))}.</span></p>`:G.mode==='hot'?'<p>Everyone shares this screen: pass it to the monster whose turn it is.</p>':'<p>Sit back and watch the computer play.</p>'}

   <p class="goal"><b>Your turn:</b> roll 6 dice up to 3 times, keep what you like, then use them. <b>Three of a kind</b> scores stars, claws hit, hearts heal, ⚡ buys cards.</p>
   <div class="acts"><button class="btn primary" data-a="story">▶ Let's smash${G.evoOn&&q?'<small>First you pick a secret power</small>':''}</button></div>
   <ul class="small"><li>The <b>glowing plate</b> on the board shows whose turn it is.</li><li><b>👑</b> marks the monster in Downtown: it scores stars but everyone hits it.</li><li>Stuck? <b>🧭 What now?</b> at the top of this panel says what to do and why.</li></ul></div>`}

// ---------- four tips, each at the real moment ----------
const TIPS={dice:{el:'#dicewrap',t:'Your dice',b:'Tap a die to keep it (it turns yellow), then Roll the others again. Blue dashed outline = our suggestion (💡 keeps exactly those). The line under the dice says what you would get.'},
 city:{el:'#map',t:'Downtown and 👑',b:'👑 = the monster in Downtown: +2 ★ at the start of each of its turns, but it cannot heal and every claw from outside hits it. When hit it may yield. If Downtown is empty after your roll, you move in (+1 ★).'},
 buy:{el:'#buymini',t:'Power cards',b:'Spend energy ⚡ on cards. ONE-SHOT cards happen at once, PERMANENT cards stay with you, SAVE FOR LATER cards wait for their moment. A yellow outline marks our suggestion. Saving ⚡ is fine: it carries over.'},
 bar:{el:'header.gx-bar',t:'While the others play',b:'This panel narrates each computer turn, and your next turn starts with “While you waited” (tap it for every event). Up top: 🃏 cards for sale, 🎴 yours, 👾 monsters, 📰 log, ⚙ rules and speed. 🧭 What now? explains your best move.'}};
const TIPORDER=['dice','city','buy','bar'];
function startTour(){UI.tour=true;UI.tipSeen={};UI.coach=-1;checkTips();renderTour()}
function checkTips(){if(!G||!UI.tour||NET.on||UI.info||UI.intro||G.winner||UI.coach>=0)return;const s=UI.tipSeen||(UI.tipSeen={});const ht=humanTurn(),p=cur();
  let k=null;if(!s.dice&&ht&&G.phase==='roll'&&!G.bug&&G.dice.length&&!UI.choice)k='dice';
  else if(s.dice&&!s.city&&!ht&&!UI.choice)k='city';
  else if(s.city&&!s.buy&&ht&&!UI.choice&&G.phase==='buy'&&G.market.length)k='buy';
  else if(s.buy&&s.city&&!s.bar&&!ht&&!UI.choice)k='bar';
  if(k){UI.coach=TIPORDER.indexOf(k);UI.freeze=k==='bar'||k==='city'}}
function renderTour(){document.querySelectorAll('.hl').forEach(e=>e.classList.remove('hl'));const el=document.getElementById('coach');if(!el)return;
  if(UI.coach<0){el.classList.add('hidden');el.innerHTML='';return}const k=TIPORDER[UI.coach],st=TIPS[k];el.classList.remove('hidden');
  el.innerHTML=`<h3>Tip ${UI.coach+1} of 4: ${esc(st.t)}</h3><p class="small">${esc(st.b)}</p><div class="acts"><button class="btn primary" data-tour="next">Got it</button><button class="btn" data-tour="skip">No more tips</button></div>`;
  const tg=document.querySelector(st.el);if(tg&&tg.id!=='map')tg.classList.add('hl');if(UI.tipShown!==k){UI.tipShown=k;try{el.scrollIntoView({block:'nearest'})}catch(e){}}}
function tourClick(a){const k=TIPORDER[UI.coach];if(k)(UI.tipSeen=UI.tipSeen||{})[k]=1;UI.coach=-1;UI.freeze=false;if(a==='skip')UI.tour=false;render();if(typeof schedule==='function')schedule()}

// ---------- the advisor: what to do now, and why ----------
const FNAME={'1':'1','2':'2','3':'3',E:'⚡',C:'claw',H:'heart'};
function faceList(fs){const c={};fs.forEach(f=>{const k=f==='C2'?'C':f==='E2'?'E':f;c[k]=(c[k]||0)+1});return Object.entries(c).map(([f,n])=>n>1?`${n}× ${FNAME[f]||f}`:(FNAME[f]||f)).join(', ')}
function rivalLine(){const me=meSeat();const r=G.pl.filter(q=>q.alive&&q.i!==me&&q.vp>=16).sort((a,b)=>b.vp-a.vp)[0];if(!r)return '';
  return inCity(r.i)?`${mname(r)} has ${r.vp} ★ and holds the city: every claw you roll from outside hits it.`:`${mname(r)} has ${r.vp} ★. Hit it with claws from Downtown, or keep it out of the city.`}
function advise(){if(!G)return {a:'Press ▶ Play now.',w:'The recommended setup is the easiest way to learn.'};if(G.winner)return {a:'Read the front page, then play again.',w:'Try another monster: each has its own secret powers.'};
  if(UI.intro)return {a:'Read the story card, then press ▶ Let\'s smash.',w:'The computer waits until you are ready.'};
  const me=meSeat();const p=cur();const c=UI.choice&&!(NET.on&&c0Remote())?UI.choice:null;const riv=rivalLine();
  if(c){if(c.why)return {a:c.why.split(':')[0]+'.',w:c.why.split(':').slice(1).join(':').trim()||c.text};
    if(/Stay or yield/.test(c.title)){const q=P(c.who);const th=alive().filter(r=>r.i!==q.i&&!inCity(r.i)).length;const y=c.options.find(o=>o.k==='yield'&&/Recommended\./.test(o.d||''));
      return y?{a:'Yield.',w:`${plu(q.hp,'heart')} and ${th} monster${th===1?'':'s'} can hit you: staying is too risky. Staying pays 2 ★ only if you survive a round.`}:{a:'Stay.',w:`With ${plu(q.hp,'heart')} you can likely survive a round, and starting your turn in the city pays 2 ★. Yield once you are at 3 ♥ or less.`}}
    const r=c.options.find(o=>o.rec||/Recommended\./.test(o.d||''));if(r)return {a:`Choose “${r.l}”.`,w:(r.d||'').replace(/ ?Recommended\.?/,'')||'It is the safer option here.'};
    if(typeof c.ai==='function'&&!c.net){if(c._aiK===undefined){try{c._aiK=String(c.ai())}catch(e){c._aiK=null}}const o=c.options.find(x=>String(x.k)===c._aiK);if(o)return {a:`Choose “${o.l}”.`,w:(o.d?o.d+' ':'')+'That is what an experienced monster would pick right now.'}}
    return {a:'Pick one of the options.',w:'The small text under each option says what it does. The computer waits for you.'}}
  if(!humanTurn()){const w=me>=0?`You are ${mname(G.pl[me])}. You will get a pop-up if you can yield the city${mbOn()&&G.pl[me].mb?' or steal this roll with your 🧠':''}.`:'';return {a:`Watch: ${mname(p)} is playing.`,w:(riv?riv+' ':'')+w}}
  if(G.phase==='roll'){const inT=inCity(p.i);const occ=G.city>=0?P(G.city):null;
    if(G.rolls<=0)return {a:'Press Resolve dice.',w:`No rerolls left. You will get: ${scoreDice(p,G.dice).text}.`};
    const m=suggestMask(p);const keep=G.dice.filter((d,k)=>m[k]).map(d=>d.f);const cnt=countsOf(G.dice);
    let why;if(!inT&&!occ)why='Nobody is in Downtown yet, so claws do nothing now (you will move in anyway). Energy buys cards, and three of a number score stars.';
    else if(inT)why=p.hp<=4?`You cannot heal in the city. At 3 ♥ or less, yield the next time you are hit. Claws hit everyone outside.`:'From the city your claws hit every monster outside; hearts do nothing here.';
    else why=`Claws are your best face: each one hits ${mname(occ)} in Downtown. If it yields, you move in.${p.hp<=5?' You are hurt: hearts heal you out here.':''}`;
    const trip=['1','2','3'].filter(f=>keep.filter(x=>x===f).length>=3);const pair=['1','2','3'].filter(f=>cnt[f]===2&&keep.filter(x=>x===f).length===2);if(trip.length)why=`Your three ${trip[0]}s already score ${trip[0]} ★ (each extra ${trip[0]} adds 1). `+why;else if(pair.length)why=`A third ${pair[0]} would score ${pair[0]} ★. `+why;
    const nk=G.dice.length-keep.length;
    return {a:keep.length?`Keep ${faceList(keep)}; reroll the other ${nk} (${G.rolls} left).`:`Reroll everything (${G.rolls} left).`,w:(riv?riv+' ':'')+why}}
  if(G.phase==='buy'){const sg=suggestCard(p);
    if(G.bug&&sg<0)return {a:'Press Finish borrowed turn.',w:'You used the stolen dice; nothing here is worth buying. Your own turn still comes.'};
    if(sg>=0){const id=G.market[sg],C=CARDS[base(id)];return {a:`Buy ${C.n} (${costOf(p,id)} ⚡).`,w:`${C.t==='K'?'It is PERMANENT: it helps you every turn from now on.':C.t==='C'?'You SAVE it FOR LATER and get a pop-up when it can be used.':'ONE-SHOT: it happens right away.'} ${C.x}`}}
    return {a:'Press End turn and save your energy.',w:`Nothing for sale is worth it yet${p.en<3?' and you only have '+p.en+' ⚡':''}. Energy carries over to your next turn.${riv?' '+riv:''}`}}
  return {a:'Wait a moment.',w:'The game is resolving.'}}
function renderAdvice(){const el=document.getElementById('advice');if(!el)return;const b=document.getElementById('advbtn');if(b)b.setAttribute('aria-expanded',UI.adv?'true':'false');
  if(!UI.adv||!G||UI.info){el.classList.add('hidden');el.innerHTML='';return}const a=advise();el.classList.remove('hidden');
  el.innerHTML=`<button class="gx-x" data-a="advise" aria-label="Close advice">×</button><p><b>🧭 Do:</b> ${esc(a.a)}</p><p class="small"><b>Why:</b> ${esc(a.w)}</p>`}

// ---------- the newspaper front page at the end ----------
function placeOf(){const me=meSeat();const w=G.winner&&G.winner!=='draw'?+G.winner.slice(1)-1:-1;
  const order=G.pl.slice().sort((a,b)=>(b.i===w)-(a.i===w)||b.alive-a.alive||b.vp-a.vp||b.hp-a.hp);return {order,me,w}}
function statsHTML(){const {order,me,w}=placeOf();const W=w>=0?G.pl[w]:null;const ord=n=>n+(['th','st','nd','rd'][n%10>3||Math.floor(n%100/10)===1?0:n%10]);
  const head=W?(W.i===me?`${UP(mname(W))} (THAT'S YOU!) CROWNED KING OF CROWN CITY`:`${UP(mname(W))} CROWNED KING OF CROWN CITY`):'CITY IN RUINS: NO MONSTER LEFT STANDING';
  const myPlace=me>=0?order.findIndex(q=>q.i===me)+1:0;const nem=me>=0?Object.entries(UI.riv||{}).sort((a,b)=>b[1]-a[1])[0]:null;
  const rows=order.map((p,k)=>{const s=p.stats||{};return `<tr class="${p.i===w?'win':''}"><td>${ord(k+1)}</td><td><b style="color:${MONS[p.m].c};-webkit-text-stroke:.6px #1a1320">${esc(mname(p))}</b>${p.i===me?' (you)':''}</td><td>${p.alive?'♥'+p.hp:'K.O.'}</td><td>★${p.vp}</td><td>${s.dmg||0}</td><td>${s.kos||0}</td><td>${s.cards||0}</td><td>${s.city||0}</td></tr>`}).join('');
  return `<div class="dlg paper" role="dialog" aria-modal="true"><div class="mast"><span>Round ${G.turn}</span><b>THE CROWN CITY CLARION</b><span>Late edition</span></div>
  <h2 class="hl1">${esc(head)}</h2><p class="deck">${esc(G.winText)}</p>
  <div class="cols">${me>=0?`<div><h4>Your result</h4><p><b>${myPlace?ord(myPlace):''} of ${G.pl.length}</b> as ${esc(mname(G.pl[me]))}.${myPlace===1?' The city is yours!':G.pl[me].alive?' You survived the rampage.':' You went down fighting.'}</p></div>`:''}
   <div><h4>${me>=0?'Your best moment':'Headline of the day'}</h4><p>${esc(me>=0?(UI.best?UI.best.h+' (round '+UI.best.r+')':'You kept your head down this time.'):((UI.news||[]).filter(x=>/💥|☠/.test(x)).pop()||'A quiet day, by monster standards.'))}</p></div>
   ${nem&&nem[1]>0?`<div><h4>Your nemesis</h4><p>${esc(mname(G.pl[nem[0]]))} smashed you for ${plu(nem[1],'heart')}.</p></div>`:''}</div>
  <table class="stats"><tr><th></th><th>Monster</th><th>Hearts</th><th>Stars</th><th>Claw damage</th><th>K.O.s</th><th>Cards</th><th>Turns in city</th></tr>${rows}</table>
  <div class="acts"><button class="btn primary" data-a="new">Play again</button><button class="btn" data-a="closestats">Look at the city</button></div></div>`}
// sound buttons in the ⚙ menu keep their explanation
function soundBtns(){const a=document.getElementById('sndbtn'),b=document.getElementById('musbtn');if(a)a.innerHTML=(SND.on?'🔊 Sound on':'🔇 Sound off')+'<small>Dice, smashes and cheers</small>';if(b)b.innerHTML=(SND.music?'🎵 Music on':'🎵 Music off')+'<small>Background music</small>'}

// ---------- "While you waited": what the computer turns did, shown when your turn starts ----------
// Snapshot ♥ ★ ⚡ and the log position when the first computer turn after yours begins; at your next turn the result
// line shows the net change per monster, and tapping it lists every logged event since, oldest first.
const RECAP={snap:null,n:0};
function recapMe(){if(!G||G.mode!=='solo')return -1;return G.pl.findIndex(q=>q.human)}
function recapHTML(){const me=recapMe();if(me<0||!RECAP.snap)return '';
  const parts=[];G.pl.forEach((q,k)=>{const s=RECAP.snap[k];if(!s)return;const d=[];
    if(s.alive&&!q.alive){d.push('knocked out')}else{if(q.vp!==s.vp)d.push(`${q.vp>s.vp?'+':'−'}${Math.abs(q.vp-s.vp)}★`);if(q.hp!==s.hp)d.push(`${q.hp>s.hp?'+':'−'}${Math.abs(q.hp-s.hp)}♥`)}
    if(s.city!==(G.city===k)&&q.alive)d.push(G.city===k?'👑in':'👑out');
    if(d.length)parts[k===me?'unshift':'push'](`<b>${k===me?'You':esc(mname(q))}</b> ${d.join(' ')}`)});
  const ev=G.log.filter(l=>l.n>RECAP.n).reverse().map(l=>`<li>${esc(l.t)}</li>`);
  if(!parts.length&&!ev.length)return '';
  return `⏪ <b>While you waited:</b> ${parts.length?parts.join(' · '):'nothing changed'}${ev.length?` <span class="more">· tap: how</span><ol class="recap">${ev.join('')}</ol>`:''}`}
{const _st=startTurn;startTurn=function(){
  const me=recapMe();const nxt=G&&!G.winner?cur():null;
  if(me>=0&&nxt&&nxt.i!==me&&!RECAP.snap){RECAP.snap=G.pl.map((q,k)=>({hp:q.hp,vp:q.vp,alive:q.alive,city:G.city===k}));RECAP.n=G.lseq||0}
  RECAP.turnN=G?G.lseq||0:0;
  const r=_st.apply(this,arguments);
  if(me>=0&&G&&!G.winner&&G.active===me&&RECAP.snap){const h=recapHTML();RECAP.snap=null;if(h){UI.banner=h;try{render()}catch(e){}}}
  return r}}
{const _ng=newGame;newGame=function(){RECAP.snap=null;return _ng.apply(this,arguments)}}
