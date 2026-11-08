// ===================== part 13: the turn layer: a banner for whose turn it is, one always-visible instruction line, the rivals' draws one chip at a time,
// the story voice in the tutorial bubbles and a loss outro for Story chapters. It only READS the game (G, UI) and never sends a move. =====================
const RF = { n: -1, q: [], cur: null, tm: 0, seen: -1 };
const rfOn = () => G && UI.started && !UI.sim && !hotSeat() && !(typeof NET !== 'undefined' && NET.on && false) && viewSeat() >= 0;
function rfBox() { let e = $('#rfeed'); if (!e) { e = h('div#rfeed', { role: 'status', 'aria-live': 'polite' }); document.body.appendChild(e); e.addEventListener('click', () => { rfNext(true); }); } return e; }
function rfCaption(e) {
  const p = G.players[e.seat]; if (!p) return null; const nm = p.name;
  if (e.t === 'place' && e.how !== 'side' && e.chip) { const k = e.chip.c + e.chip.v; return { seat: e.seat, key: k, text: nm + ' draws ' + nameOf(k) + ' and moves to space ' + e.pos + '.' }; }
  if (e.t === 'boom') return { seat: e.seat, text: nm + '\'s pot EXPLODES! Too many white chips.', boom: 1 };
  if (e.t === 'flask') return { seat: e.seat, text: nm + ' tips the flask: a white chip goes back.' };
  if (e.t === 'stop') { const last = p.pot[p.pot.length - 1]; return { seat: e.seat, text: e.boom ? nm + ' is out of the brew.' : nm + ' stops' + (last ? ' at space ' + last.pos : '') + ' and keeps the score.' }; }
  return null;
}
function rfNext(fast) {
  clearTimeout(RF.tm); RF.tm = 0; const box = rfBox();
  const c = RF.q.shift();
  if (!c) { RF.cur = null; box.classList.remove('on'); return; }
  RF.cur = c; box.className = 'on' + (c.boom ? ' bm' : '');
  box.innerHTML = '<span class="rfav">' + avHTML(c.seat, 30) + '</span>' + (c.key ? '<span class="rfchip">' + chipHTML(c.key, 30) + '</span>' : '') + '<span class="rft">' + c.text.replace(/</g, '&lt;') + '</span>';
  RF.tm = setTimeout(() => rfNext(), fast ? 200 : (RF.q.length > 3 ? 450 : 1000));
}
function rfScan() {
  if (!G) return; if (RF.n < 0 || G.evN < RF.n) { RF.n = G.evN; RF.q = []; return; }
  const v = viewSeat(), ev = G.events.filter(e => e.n > RF.n); RF.n = G.evN;
  if (!rfOn()) return;
  for (const e of ev) { if (e.seat == null || e.seat === v || !G.players[e.seat] || !G.players[e.seat].ai) continue; const c = rfCaption(e); if (c) RF.q.push(c); }
  if (RF.q.length > 8) RF.q.splice(0, RF.q.length - 8);
  if (RF.q.length && !RF.cur) rfNext();
}
// ---- the instruction line
function instrInfo() {
  if (!G || !UI.started || G.phase === 'over' || UI.rsOpen || UI.sim || tutOn() || (UI.start && !$('#start').hidden)) return null;
  const v = viewSeat(); if (v < 0 || hotSeat() || UI.pass != null) return null;
  const me = G.players[v], wait = G.players.filter(p => p.seat !== v && ((G.phase === 'brew' && (p.st === 'draw')) || (G.phase !== 'brew' && p.q))).map(p => p.name);
  if (G.phase === 'brew' && me.st === 'draw' && !me.lock && !me.q) {
    if (G.round === LASTD()) return { who: 'YOUR TURN', text: 'Last day: pick Draw or Stop in secret. Everyone reveals together.' };
    if (!me.pot.length) return { who: 'YOUR TURN', text: 'Tap the bag to draw your first chip.' };
    const ws = CF.whiteSum(me), lim = CF.limitOf(G, me), safe = lim - ws;
    return { who: 'YOUR TURN', text: safe <= 0 ? 'The pot is full of white (' + ws + '/' + lim + '). Another white chip explodes it. Draw, or Stop and score.' : 'White ' + ws + ' of ' + lim + '. Draw another chip, or Stop to keep your space.' };
  }
  if (me.q && !EVAL_Q[me.q.h]) { const t = promptInfo().text; return { who: 'YOUR TURN', text: t || 'Make your choice.' }; }
  if (G.phase === 'brew') { if (me.lock) return { who: 'WAITING', text: 'You decided. Waiting for ' + (wait.join(' and ') || 'everyone') + '.', rival: 1 }; return { who: wait.length ? wait[0].toUpperCase() + '\'S TURN' : 'DAY ENDS', text: (me.boom ? 'Your pot exploded. ' : 'You stopped. ') + (wait.length ? 'Watch ' + wait.join(' and ') + ' draw, one chip at a time.' : 'Counting the day.'), rival: 1 }; }
  return null;
}
function instrBar() {
  let e = $('#instr'); if (!e) { e = h('div#instr', { role: 'status', 'aria-live': 'polite' }); document.body.appendChild(e); }
  const i = instrInfo(); document.documentElement.classList.toggle('hasinstr', !!i); if (!i) { e.hidden = true; return; }
  e.hidden = false; e.className = i.rival ? 'rv' : '';
  const html = '<b>' + i.who.replace(/</g, '&lt;') + '</b><span>' + i.text.replace(/</g, '&lt;') + '</span>'; if (e.dataset.h !== html) { e.dataset.h = html; e.innerHTML = html; }
  const db = $('#dockbody'), pd = $('#promptDock'), vis = pd && pd.getBoundingClientRect().width > 0;
  if (vis) { e.hidden = true; return; }           // wide screens already show the prompt line in the panel
  const top = db ? db.getBoundingClientRect().top : innerHeight - 200; e.style.bottom = Math.max(0, innerHeight - top + 4) + 'px';
}
// ---- the turn banner: slides in when the turn changes hands
let TB = { key: '', tm: 0 };
function turnBanner() {
  if (!G || !UI.started || UI.sim || tutOn() || hotSeat()) { return; }
  const v = viewSeat(); if (v < 0) return; const me = G.players[v];
  let key, text = '', cls = '';
  if (G.phase === 'brew') {
    const wait = G.players.filter(p => p.seat !== v && p.st === 'draw');
    if (me.st === 'draw' && !me.lock) { key = 'my' + G.round; text = 'Day ' + G.round + ' · Your turn to brew'; }
    else { key = 'wt' + G.round + (wait[0] ? wait[0].seat : 'x'); if (wait.length) { text = wait[0].name + '\'s turn to brew'; cls = 'rv'; } else key = 'none'; }
  } else if (G.phase === 'eval') { key = 'ev' + G.round; text = 'Day ' + G.round + ' · Counting up'; cls = 'ev'; } else return;
  if (key === TB.key) return; TB.key = key; if (!text) return;
  let b = $('#tbanner'); if (!b) { b = h('div#tbanner', { role: 'status', 'aria-live': 'polite' }); document.body.appendChild(b); }
  b.textContent = text; b.className = cls; void b.offsetWidth; b.classList.add('on'); clearTimeout(TB.tm); TB.tm = setTimeout(() => b.classList.remove('on'), 1700);
}
setInterval(() => { try { rfScan(); instrBar(); turnBanner(); } catch (e) { } }, 200);
// ---- story voice in the tutorial: text from story-data.js, the guide's portrait on the bubble
(function () {
  const ts = tutSteps; tutSteps = function () {
    return ts().map(s => { const t = STORY.steps[s.id]; if (t) { s.title = t[0]; s.say = t[1]; } return s; });
  };
  const mo = new MutationObserver(() => { document.querySelectorAll('.gxt-bub .gxh-bd:not([data-por])').forEach(bd => { bd.dataset.por = 1; const im = h('img.tutpor', { src: STORY.guide.img, alt: STORY.guide.name, width: 36, height: 36 }); bd.insertBefore(im, bd.firstChild); }); });
  try { mo.observe(document.body, { childList: true, subtree: true }); } catch (e) { }
})();
// ---- Story chapters: a lost chapter plays its own outro (the shared kit shows one outro; we swap it just before the result)
(function () {
  const cf = campFinish; campFinish = function () {
    try { const ch = window.CAMPAIGN && UI.camp && window.CAMPAIGN.chapters.find(c => c.id === UI.camp.id); if (ch) { ch.outroWin = ch.outroWin || ch.outro; ch.outro = !campIsWon(G) && STORY.outroLose[ch.id] ? STORY.outroLose[ch.id] : ch.outroWin; } } catch (e) { console.error(e); }
    return cf.apply(this, arguments);
  };
})();
// ---- Quick game: a flavour line on day 1 and one in the result
(function () {
  const ng = newGame; newGame = function (mode) { const r = ng.apply(this, arguments); try { if (mode === 'ai' || mode === 'vs' || mode === undefined) setTimeout(() => { if (G && G.round === 1 && UI.started && !UI.camp && !tutOn() && UI.mode !== 'tutorial') goalCard(); }, 600); } catch (e) { } return r; };
})();
// ---- Quick game result: one line in the game's voice under the winner
(function () {
  const sf = showFinal; showFinal = function () { const r = sf.apply(this, arguments); try { if (!UI.camp && UI.mode !== 'tutorial' && G) { const v = viewSeat(), w = $('#rs .win > div'); if (w && !w.querySelector('.rsvoice')) { const line = G.winners.length > 1 ? STORY.quickTie : v >= 0 && G.winners.indexOf(v) >= 0 ? STORY.quickWin : STORY.quickLose; w.appendChild(h('div.rsvoice', line)); } } } catch (e) { console.error(e); } return r; };
})();
// ===================== the coached first game (replaces the forced tap steps): a real two-day game with free choices from turn 1.
// The guide speaks just-in-time, one bubble at a time, never blocking input; it can be dismissed. No spotlight, no forced taps.
// Rules that did not come up are named on the "Things you'll meet later" card at the end. window.COACH.shown / .later feed the test. =====
const COACH = window.COACH = { on: false, shown: [], later: [], q: [], cur: null, prologue: false, tm: 0, ids: [] };
const coachBox = () => { let e = $('#coach'); if (!e) { e = h('div#coach.coach', { role: 'status', 'aria-live': 'polite' }); document.body.appendChild(e); e.addEventListener('click', ev => { if (ev.target.closest('[data-cx=ok]')) coachNext(); else if (ev.target.closest('[data-cx=leave]')) coachLeave(); }); } return e; };
const cMe = () => G && G.players[0];
const COACH_RULES = [
  ['goal', () => G.phase !== 'over' && G.round === 1, 'How you win', 'Have the most points after two days. \u2022 Tap the bag to drop chips in your pot. \u2022 Stop before the white chips pass 7. \u2022 Your last space pays coins and points.'],
  ['fortune', () => cMe().q && cMe().q.h === 'pick', 'Fortune card', 'Hask: "Each day the fair draws a fortune. Purple happens now: pick whichever reward you fancy."'],
  ['draw', () => G.phase === 'brew' && cMe().st === 'draw' && !cMe().q && cMe().pot.length === 0 && G.round === 1, 'Your bag', 'Hask: "Tap the bag to pull a chip. It walks as many spaces along the spiral as its number."'],
  ['spiral', () => G.phase === 'brew' && cMe().pot.length >= 1 && G.round === 1, 'The spiral', () => 'Hask: "Your chip stands on space ' + cMe().pot[cMe().pot.length - 1].pos + '. Stop now and you keep that space\'s coins and points."'],
  ['whites', () => cMe().pot.some(c => c.c === 'W'), 'White Fizzpods', () => 'Hask: "White chips fill the meter: ' + CF.whiteSum(cMe()) + ' of ' + CF.limitOf(G, cMe()) + '. Go over and the pot explodes."'],
  ['flask', () => G.phase === 'brew' && cMe().flask !== false && CF.whiteSum(cMe()) >= 4 && cMe().st === 'draw', 'The flask', 'Hask: "Getting hot? The flask puts your last white chip back in the bag, once a day."'],
  ['seven', () => G.phase === 'brew' && cMe().st === 'draw' && CF.whiteSum(cMe()) === CF.limitOf(G, cMe()), 'Exactly seven', 'Hask: "Seven is still safe. Any white chip now explodes the pot. Brave, or wise?"'],
  ['boom', () => cMe().boom && G.round === 1, 'Boom!', 'Hask: "Exploded! You pick points OR coins for the day and skip the bonus die. Stopping sooner is the cure."'],
  ['stopped', () => cMe().st === 'done' && !cMe().boom && G.round === 1 && G.phase === 'brew', 'Safe stop', 'Hask: "Good: you keep your space. Safe pots may roll the bonus die when the day is counted."'],
  ['rival2', () => G.players[1] && G.players[1].st === 'done' && !G.players[1].boom && G.round === 1 && G.phase === 'brew', 'Wynne', 'Hask: "Wynne stopped early: a safe, smaller score. You may be bolder, or not."'],
  ['rival', () => G.players[1] && G.players[1].boom && G.round === 1, 'Wynne', 'Hask: "Wynne\'s pot exploded. That is the price of pushing your luck."'],
  ['report', () => UI.rsOpen && UI.rsMode === 'report' && G.round === 1, 'Counting the day', 'Hask: "The fair counts each pot: coins, points, and a bonus die for safe pots."'],
  ['shop', () => cMe().q && cMe().q.h === 'shop', 'The stalls', 'Hask: "Spend coins: up to two chips, different colours. Each colour has a power. Press and hold a chip to read it."'],
  ['rubies', () => cMe().q && cMe().q.h === 'shop' && cMe().rubies >= 2, 'Rubies', 'Hask: "Two rubies move your droplet on, or refill a used flask. Your next brew starts further along."'],
  ['day2', () => G.round === 2 && G.phase === 'brew', 'The last day', 'Hask: "Day two is the last: blue fortune cards last all day, and the rat stone helps whoever trails."'],
  ['lastday', () => G.round === LASTD() && G.phase === 'brew' && cMe().st === 'draw', 'Secret choice', 'Hask: "Today you and Wynne pick Draw or Stop in secret, then reveal together. No shop today."'],
  ['peek', () => cMe().q && cMe().q.h === 'crow', 'Peek and pick', 'Hask: "A feather chip peeks ahead: place the chip, or send it back."'],
  ['d2count', () => UI.rsOpen && UI.rsMode === 'report' && G.round === 2, 'Final count', 'Hask: "Last day rule: every 5 coins and every 2 rubies become 1 point."']
];
Object.defineProperty(window, 'GXCOACH', { get: () => ({ running: !!COACH.on, explained: COACH.shown.filter(i => i !== 'end'), later: COACH.later, done: !!COACH.finished }), configurable: true });
COACH.ids = COACH_RULES.map(r => r[0]).concat(['end']);
const COACH_LATER = [['The purple book (days 3+) and the black chips', 'purple'], ['The other 22 fortune cards', 'cards'], ['Rat tails: trailing players start the stone ahead', 'rat'], ['Nine days, and ties go to the furthest last chip', 'ties']];
function coachShow(id, title, text) {
  const b = coachBox(), t = typeof text === 'function' ? text() : text;
  const tp = t.replace(/</g, '&lt;').split(' \u2022 '), body = '<span>' + tp[0] + '</span>' + (tp.length > 1 ? '<ul class="cxl">' + tp.slice(1).map(x => '<li>' + x + '</li>').join('') + '</ul>' : '');
  b.innerHTML = '<img class="tutpor" src="' + STORY.guide.img + '" alt="" width="36" height="36"><div class="cxb"><b>' + title.replace(/</g, '&lt;') + '</b>' + body + '</div><div class="cxr"><button type="button" data-cx="ok">Got it</button><button type="button" data-cx="leave" class="lv">Leave tutorial</button></div>';
  b.className = 'on' + (UI.rsOpen ? ' top' : ''); COACH.cur = id; COACH.shown.push(id); clearTimeout(COACH.tm); COACH.tm = setTimeout(coachNext, Math.max(9000, 4000 + 1000 * Math.ceil(t.split(/\s+/).length / 10)));   // reading time: at least 4 s + 1 s per 10 words
}
function coachNext() { clearTimeout(COACH.tm); const b = coachBox(); COACH.cur = null; b.className = ''; let n = COACH.q.shift(); while (n && !(() => { try { return n[3](); } catch (e) { return false; } })()) n = COACH.q.shift(); if (n) setTimeout(() => { if (COACH.on && !COACH.cur) coachShow(n[0], n[1], n[2]); }, 250); }
function coachTick() {
  { const b = $('#coach'); if (b) b.classList.toggle('top', !!(typeof UI !== 'undefined' && UI.rsOpen)); }
  if (!COACH.on || !G || UI.mode !== 'tutorial') return;
  if (G.phase === 'over' && UI.rsMode === 'final') { if (COACH.shown.indexOf('end') < 0 && !$('#coachend')) coachEnd(); return; }
  for (const [id, when, title, text] of COACH_RULES) {
    if (COACH.shown.indexOf(id) >= 0 || COACH.q.some(q => q[0] === id)) continue;
    let ok = false; try { ok = !!when(); } catch (e) { }
    if (ok) { if (!COACH.cur) coachShow(id, title, text); else COACH.q.push([id, title, text, when]); break; }
  }
}
setInterval(() => { try { coachTick(); } catch (e) { } }, 300);
function coachEnd() {
  const a = G.players[0], b = G.players[1]; COACH.shown.push('end'); COACH.finished = 1; coachNext(); COACH.q = [];
  COACH.later = COACH.ids.filter(i => COACH.shown.indexOf(i) < 0 && i !== 'end');
  const lines = COACH_RULES.filter(r => COACH.later.indexOf(r[0]) >= 0).map(r => r[2]).concat(COACH_LATER.map(x => x[0]));
  const win = G.winner === 0 ? 'You win ' + a.vp + ' to ' + b.vp + '!' : G.winner < 0 ? 'A tie, ' + a.vp + ' each!' : b.name + ' wins ' + b.vp + ' to ' + a.vp + '.';
  const d = h('div#coachend', { role: 'dialog', 'aria-label': 'Tutorial finished' });
  d.innerHTML = '<div class="ce"><img class="tutpor" src="' + STORY.guide.img + '" alt="" width="36" height="36"><h3>' + win + '</h3><p>Final count with your numbers: you made ' + a.vp + ' points and hold ' + a.rubies + ' rubies. Last day, every 5 coins and every 2 rubies were worth 1 point. ' + b.name + ' made ' + b.vp + '.</p><h4>Things you\'ll meet later</h4><ul>' + lines.map(l => '<li>' + l.replace(/</g, '&lt;') + '</li>').join('') + '</ul><p>Hask: "Tomorrow it is for real."</p><div class="cb">' + (COACH.prologue ? '<button type="button" data-ce="chapter">Start chapter 1</button>' : '') + '<button type="button" data-ce="play">Play a game</button></div></div>';
  document.body.appendChild(d); d.addEventListener('click', ev => { const k = ev.target.closest('[data-ce]'); if (k) coachFinish(k.dataset.ce); });
}
function coachClean() { COACH.on = false; clearTimeout(COACH.tm); COACH.q = []; COACH.cur = null; ['#coach', '#coachend'].forEach(s => { const e = $(s); if (e) e.remove(); }); }
function coachFinish(choice) {
  const first = window.CAMPAIGN && window.CAMPAIGN.chapters && window.CAMPAIGN.chapters[0];
  coachClean(); try { GXT.markDone(TUT_GAME); } catch (e) { } tutLeave();
  if (choice === 'chapter' && first && typeof GXC !== 'undefined') { showStart(); GXC.play(first.id); } else { UI.sv = 'setup'; UI.cfgOpen = false; showStart(); UI.sv = 'setup'; renderStart(); }
}
function coachLeave() { coachClean(); try { GXT.markDone(TUT_GAME); } catch (e) { } tutLeave(); showStart(); }
tutStart = function (o) {
  coachClean(); try { GX.close(); } catch (e) { } const st = $('#start'); if (st) st.hidden = true; closeRS(true); UI.seed = TUT_SEED; UI.tut = {}; BF.pulling = false;
  newGame('tutorial'); Object.assign(COACH, { on: true, finished: 0, shown: [], later: [], q: [], cur: null, prologue: !!(o && o.prologue) });
};

// ---- W471 Goal card: one plain sentence and three bullets. Opens on day 1 of a Quick game and from the Day chip; stays until tapped.
function goalCard() {
  let e = $('#goalcard'); if (e) e.remove(); if (!G) return;
  const n = LASTD();
  e = h('div#goalcard', { role: 'dialog', 'aria-label': 'How you win' });
  e.innerHTML = '<div class="gc"><div class="gck">How you win</div><h3>Have the most points after ' + n + ' days.</h3><ul><li>Tap the bag. Each chip moves along your pot.</li><li>Stop before the white chips pass 7, or it explodes.</li><li>Your last space pays coins and points.</li></ul><button type="button" class="gcok">Let\u2019s brew</button></div>';
  e.addEventListener('click', () => { e.remove(); });
  document.body.appendChild(e);
}
window.goalCard = goalCard;
document.addEventListener('click', ev => { const d = ev.target.closest && ev.target.closest('#barstat .dayn'); if (d && !UI.camp) goalCard(); });
