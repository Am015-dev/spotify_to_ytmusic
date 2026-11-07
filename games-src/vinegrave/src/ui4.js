// ===================== part 4: Story (gx-campaign) and the guided first round (gx-tutor), then boot =====================
const CAMP_OTHERS = { tamsin: ['Dr Okoro Bell'], quell: ['Tamsin Reed'], okoro: ['Mira Holt'], mira: ['Dr Okoro Bell'], sallow: ['Sallow (the other twin)'], vane: ['Mira Holt'], warden: [] };
function campStart(def) {
  const s = def.setup || {}, op = def.opponent || {}, np = s.players || 2, lv = def.id === 'c1' ? 'novice' : (op.aiLevel || 'normal');   /* stage 1: a gentler rival for a newcomer (R3 bug 3) */
  if (s.solo) return startGame('solo', { np: 1, solo: true, rivalLevel: lv, rivalName: 'Vane\'s crew', twist: def.twist, camp: def, seed: s.seed });
  const names = [op.name].concat(CAMP_OTHERS[op.cast] || []).slice(0, np - 1);
  return startGame('vs', { np, lvl: lv, names, twist: def.twist, camp: def, seed: s.seed });
}
function campMetrics(g) {
  const me = VG.score(g, 0), others = g.p.slice(1).map((p, i) => VG.score(g, i + 1).total).concat(g.rival ? [VG.rivalScore(g)] : []);
  const p = g.p[0];
  return { won: g.winner === 0, score: me.total, margin: me.total - Math.max.apply(null, others.length ? others : [0]), guards: p.guards.length, found: p.found || 0, research: me.research, glass: p.glass, idols: p.idols.length, rounds: g.round };
}
function campIsWon(g, def) { const m = campMetrics(g); if (!m.won) return false; if (def.goal.type === 'score') return m.score >= def.goal.value; if (def.id === 'c2') return m.found >= 2; return true; }
function campLine() { try { if (typeof GXC === 'undefined' || !window.CAMPAIGN) return ''; const pr = GXC.progress(), ch = window.CAMPAIGN.chapters, n = ch.filter(c => pr.ch[c.id] && pr.ch[c.id].beaten).length; return n ? n + ' of ' + ch.length + ' stages done' : ''; } catch (e) { return ''; } }
function campInit() {
  if (typeof GXC === 'undefined' || !window.CAMPAIGN) return;
  GXC.init({ game: 'vinegrave', data: window.CAMPAIGN,
    headButtons: () => { const b = document.createElement('button'); b.type = 'button'; b.className = 'gxc-ib'; b.textContent = 'Tutorial'; b.setAttribute('aria-label', 'Replay the tutorial'); b.addEventListener('click', () => { GXC.close(); tutStart(); }); return [b]; },
    startChapter: campStart, isWon: campIsWon, metrics: campMetrics,
    portrait: who => { const f = 'portrait-' + who; return (window.VG_HAVE || []).indexOf(f) >= 0 ? 'media/' + f + '.webp' : null; },
    onExit: () => { UI.camp = null; showTitle(); },
    scores: g => g.p.map((p, i) => VG.score(g, i).total), seats: g => g.p.map((p, i) => ({ name: i === 0 ? 'You' : p.name, me: i === 0, ai: p.ai || undefined })) });
}
function storyOpen() { if (typeof GXC === 'undefined') return; closeInsp(); if (typeof GXT !== 'undefined' && !GXT.isDone(TUT_GAME)) tutStart({ prologue: true }); else { $('#start').hidden = true; GXC.open(); } }
UIACT.story = () => storyOpen();
UIACT.tut = () => { try { GX.close(); } catch (e) { } tutStart(); };
// ---------------------------------------------------------------- the guided first round
// A real game with a fixed hand and market: you play a card, discover a ruin (idol + guardian), buy an item, see the research track, pass,
// and watch the round end bring a Dread card home. Tamsin (the computer) only digs at camp sites, then passes. Nothing is saved.
const TUT_GAME = 'vinegrave', TUT_SITE = 5;   // the first level-1 ruin (travel: 2 boots)
const tq = sel => () => { const e = typeof sel === 'function' ? sel() : $(sel); return e && e.getBoundingClientRect().width ? e : null; };
const tinsp = txt => () => [...document.querySelectorAll('#insp .btn')].find(b => b.textContent.indexOf(txt) === 0) || null;
const tmine = () => !!(G && UI.mode === 'tutorial' && myTurn() && !UI.busy && $('#fx').hidden);
function tutAI() { return null; }   /* coached game: Tamsin is the real (easy) computer */
function tutSetup() {   /* a REAL 2-round game, stacked so every case comes up once (TUTORIAL-COVERAGE.md) */
  try { GX.close(); } catch (e) { } closeRes(); UI.fast = false;
  startGame('tutorial', { np: 2, seed: 77, lvl: 'easy', names: ['Tamsin Reed'], rounds: 2 });
  const me = G.p[0], tm = G.p[1];
  me.hand = ['trail', 'dread', 'grant', 'dread', 'trail']; me.deck = ['grant'];
  me.res = { coin: 2, compass: 2, tablet: 1, arrow: 0, jewel: 1 };
  tm.hand = ['dread', 'grant', 'dread', 'trail', 'grant']; tm.deck = ['trail'];
  const gi = G.guards.indexOf('glass-moth'); if (gi >= 0) { G.guards.splice(gi, 1); G.guards.push('glass-moth'); }
  const li = G.items.indexOf('lamp'); if (li >= 0) { G.items[li] = G.row[0]; G.row[0] = 'lamp'; } else { const ri = G.row.indexOf('lamp'); if (ri > 0) { G.row[ri] = G.row[0]; G.row[0] = 'lamp'; } }
  G.turn = 0; G.first = 0; render();
}
const TS = id => { const t = V.STORY.tut[id]; return { title: t[0], say: t[1] }; };
const tglow = sel => () => { const e = [...document.querySelectorAll(sel)].find(x => x.getBoundingClientRect().width); return e || null; };
// ---------------------------------------------------------------- the coached first game (ADDENDUM 4): 2 forced taps, then free play with Pell's tips
const CO = { seen: {}, q: [], cur: null, t: 0, fb: 0 };
const coachOn = () => !!(G && UI.mode === 'tutorial' && UI.coachFree);
function coachSay(id, text) {   /* one bubble at a time; never blocks input; × dismisses */
  if (!coachOn()) return; if (!id) CO.q = CO.q.filter(x => x.id);   /* rule lines win over move feedback */ if (id && (CO.seen[id] || CO.q.some(x => x.id === id))) return;
  CO.q.push({ id, text: text || V.STORY.coach[id] }); coachPump();
}
function coachPump() {
  if (CO.cur || !CO.q.length) return; const it = CO.q.shift(); CO.cur = it; if (it.id) CO.seen[it.id] = 1;
  let e = $('#coach'); if (!e) { e = document.createElement('div'); e.id = 'coach'; e.setAttribute('role', 'status'); document.body.appendChild(e); }
  e.innerHTML = `<span class="cpor" aria-hidden="true">${esc(V.STORY.guide.mark)}</span><span class="ctx"><b>${esc(V.STORY.guide.short)}</b> ${esc(it.text)}</span><button type="button" class="cx" aria-label="Dismiss tip">×</button>`;
  e.className = 'on'; e.querySelector('.cx').onclick = coachHide;
  try { const d = $('#dock').getBoundingClientRect(), b = $('#board').getBoundingClientRect(), ph = innerWidth < 1000;   /* phone: just above the hand tray; desktop: top of the board */
    e.style.top = (ph ? Math.max(60, d.top - e.offsetHeight - 8) : b.top + 8) + 'px'; e.style.left = (ph ? innerWidth / 2 : b.left + b.width / 2) + 'px'; } catch (x) { }
  clearTimeout(CO.t); CO.t = setTimeout(coachHide, CO.q.length > 1 ? 2600 : Math.max(3400, it.text.length * 55));   /* a backlog moves faster */
}
function coachHide() { clearTimeout(CO.t); const e = $('#coach'); if (e) e.className = ''; CO.cur = null; setTimeout(coachPump, 350); }
function coachCheck(L) {   /* called from render: explain a rule the first time it is a real option for you */
  if (!coachOn() || !myTurn() || UI.busy) return; const t = {}; L.forEach(m => { t[m.t] = 1; });
  const me = G.p[UI.view];
  if (t.dig || t.disc) coachSay('travel');
  if (t.dig) coachSay('dig');
  if (t.disc) coachSay('discover');
  if (L.some(m => m.t === 'disc' && G.sites[m.s].lvl === 2)) coachSay('deep');
  if (L.some(m => (m.t === 'dig' || m.t === 'disc') && (VG.payPlan(G, UI.view, G.sites[m.s].cost) || {}).coins)) coachSay('plane');
  if (t.idol) { coachSay('shrine'); coachSay('slots'); }
  if (t.beat) coachSay('overcome');
  if (t.boon) coachSay('boon');
  if (L.some(m => m.t === 'res' && m.k === 'g')) coachSay('research');
  if (L.some(m => m.t === 'res' && m.k === 'n')) coachSay('notebook');
  if (t.temple) coachSay('temple');
  if (L.some(m => m.t === 'buy' && V.CARDS[G.row[m.r]].t === 'item')) coachSay('buyitem');
  if (L.some(m => m.t === 'buy' && V.CARDS[G.row[m.r]].t === 'art')) coachSay('buyart');
  if (G.q && G.q.h === 'exile') coachSay('exile');
  if (me.idols.length) coachSay('idol');
}
function coachEvent(e, s) {   /* events: guardian wakes, round end, fleeing, the rival's moves */
  if (!coachOn()) return;
  if (e.k === 'guardian') coachSay('guardian'); if (e.k === 'round') coachSay('roundend'); if (e.k === 'fear') coachSay('fear');
  if (e.k === 'idolfind' && s === UI.view) coachSay('idol');
}
function coachRival(m) {   /* a short lesson on every rival move */
  if (!coachOn() || !m) return; coachSay('rival'); if (m.t === 'pass') { coachSay('pass'); return; }
  const L = { dig: 'Tamsin dug a camp: that site is closed to you until the round ends.', disc: 'Tamsin explored a ruin: an idol for her, and a guardian now sits with her explorer.',
    beat: 'Tamsin overcame a guardian: 5 points and a boon for her.', buy: 'Tamsin bought from the market: a new card slides in.', play: 'Tamsin played a card for its goods.',
    res: 'Tamsin climbed the research track: those rows score at the end.', temple: 'Tamsin bought a temple tile: big points.', boon: 'Tamsin used a guardian boon.', idol: 'Tamsin set an idol in a shrine for a boon.' };
  if (L[m.t]) coachSay(null, L[m.t]);
}
window.GXCOACH = { get running() { return !!(G && UI.mode === 'tutorial' && UI.coachFree); }, get explained() { return Object.keys(CO.seen).filter(id => CO.seen[id]); }, get done() { return typeof GXT !== 'undefined' && GXT.isDone(TUT_GAME); } };
function coachMove(m, best) {   /* one line why, for a strong or a weaker move (first few times) */
  if (!coachOn() || !best || m.free || m.t === 'ans' || CO.fb >= 2 || CO.q.length > 1) return; CO.fb++;
  const same = VG.same ? VG.same(m, best) : JSON.stringify(m) === JSON.stringify(best);
  let why = ''; try { why = VAI.why(G, best) || ''; } catch (x) { }
  if (same) coachSay(null, V.STORY.coachGood + (why || 'that was the strongest option.'));
  else if (best.t !== 'pass') coachSay(null, V.STORY.coachTip + 'next time consider this: ' + (why || 'look at what each glowing thing gives.'));
}
const COVER = () => Object.keys(V.STORY.coach);
window.coachReport = () => { const all = COVER(), seen = all.filter(id => CO.seen[id]); return { all, seen, later: all.filter(id => !CO.seen[id]) }; };
function coachScoreStart() {   /* game over in the coached game: a second tutor run walks the score and shows the end card */
  if (typeof GXT === 'undefined' || !UI.coachFree) return; UI.coachFree = false; coachHide();
  const steps = tutSteps().filter(x => /^score/.test(x.id)), c = Object.assign({}, TUTCFG, { steps, setup: () => { } });
  TUTCFG = c; GXT.start(c);
}
function tutSteps() {
  const sc = () => { const a = VG.score(G, 0), b = VG.score(G, 1); return [a, b]; };
  const scoreTarget = () => (G && G.phase === 'over' && !$('#rs').hidden && $('#rs table')) || $('#opp');
  return [
    { id: 'hand', title: 'Ch 1 · Landfall', say: 'The boat is gone and Tamsin is ashore. Trail Notes point inland: start with it.', target: tq(() => $('#hand .cd[data-id="trail"]')),
      wait: { type: 'tap', match: a => a.what === 'hand' && a.id === 'trail' }, ready: () => tmine(), onEnter: () => { CO.seen.setup = CO.seen.oneaction = 1; } },
    { id: 'play', title: 'Ch 1 · Landfall', say: 'Playing it gives +1 compass. That is your one action. After this, the island is yours to explore.', target: tq(tinsp('Play it')),
      wait: { type: 'tap', match: a => a.what === 'mv' && a.m.t === 'play' }, ready: () => !!(UI.insp && tinsp('Play it')()), onEnter: () => { CO.seen.play = 1; } },
    { id: 'free', title: 'Your expedition', say: 'Free play.', target: tq('#map'), wait: null, ready: () => true,
      onEnter: () => { UI.coachFree = true; setTimeout(() => { try { GXT.stop(); } catch (x) { } render(); }, 0); } },   /* the tutor steps aside: free play, Pell coaches */
    { id: 'score1', title: 'Ch 2 · The count', say: () => { const [a, b] = sc(); document.body.classList.remove('vg-coached'); coachHide(); CO.seen.score = 1; return `Research: you ${a.research}, Tamsin ${b.research}. Temple tiles: ${a.temple} vs ${b.temple}. Higher on the track, more points.`; },
      target: tq(scoreTarget), wait: null, ready: () => true },
    { id: 'score2', title: 'Ch 2 · The count', say: () => { const [a, b] = sc(); return `Idols ${a.idols} vs ${b.idols}, empty shrine slots ${a.slots} vs ${b.slots}, guardians ${a.guards} vs ${b.guards}.`; }, target: tq(scoreTarget), wait: null, ready: () => true },
    { id: 'score3', title: 'Ch 2 · The count', say: () => { const [a, b] = sc(); CO.seen.tiebreak = CO.seen.rounds = 1; const r = window.coachReport();
        TUTCFG.endText = (a.total >= b.total ? V.STORY.endWin : V.STORY.endLose) + (r.later.length ? ' Things you’ll meet later: ' + r.later.map(id => V.STORY.coach[id]).join(' ') : '') + ' A full game is 5 rounds.';
        return `Cards ${a.cards} vs ${b.cards}, Dread ${a.fear} vs ${b.fear}. Total: you ${a.total}, Tamsin ${b.total}. Ties go to the first into the temple.`; }, target: tq(scoreTarget), wait: null, ready: () => true }
  ];
}
let TUTCFG = null;
function tutStart(o) {
  if (typeof GXT === 'undefined') return; o = o && o.prologue ? o : null; closeInsp();
  const first = window.CAMPAIGN && window.CAMPAIGN.chapters[0];
  CO.seen = {}; CO.q = []; CO.cur = null; CO.fb = 0;
  UI.coachFree = false;
  TUTCFG = { game: TUT_GAME, steps: tutSteps().filter(x => !/^score/.test(x.id)), story: !!(window.CAMPAIGN && typeof GXC !== 'undefined'),
    endTitle: 'Prologue complete', endText: o ? 'Pell: "You played a whole expedition. Now the coast, and Tamsin, are waiting."' : 'Pell: "A whole expedition, start to count. A real game is 5 rounds. The lightbulb helps any time."',
    endButtons: o && first ? [{ id: 'chapter', label: 'Start stage 1' }] : null,
    setup: tutSetup,
    onDone: r => { const c = r && r.choice; coachEnd(); clearTimeout(schedule.t); G = null; UI.mode = 'vs'; closeInsp();
      if (c === 'chapter' && first) GXC.play(first.id); else if (c === 'story') { $('#start').hidden = true; GXC.open(); } else if (c === 'play') UIACT.quick(); else showTitle(); },
    onExit: () => { coachEnd(); clearTimeout(schedule.t); G = null; UI.mode = 'vs'; closeInsp(); showTitle(); } };
  GXT.start(TUTCFG);
}
function coachEnd() { document.body.classList.remove('vg-coached'); UI.coachFree = false; CO.q = []; coachHide(); }
UIACT.tutleave = () => { coachEnd(); try { GXT.markDone(TUT_GAME); } catch (x) { } clearTimeout(schedule.t); G = null; UI.mode = 'vs'; closeInsp(); showTitle(); };
// ---------------------------------------------------------------- the Story map fits the screen (no scrolling: every stage visible at once)
// gx-campaign lays the stages out 74 px apart (about 900 px for 10 stages); here the rows are pulled closer so the whole map fits the
// viewport. Text sizes are untouched; only the vertical positions, the path height and the painted road scale.
function fitMap() {
  const path = document.querySelector('.gxc-path'); if (!path) return;
  const map = path.closest('.gxc-map') || path.parentElement; if (!map) return;
  const H0 = +(path.dataset.h0 || parseFloat(path.style.height) || 0); if (!H0) return; path.dataset.h0 = H0;
  const r = map.getBoundingClientRect(), avail = Math.max(300, (window.innerHeight || 700) - r.top - 8);
  const f = Math.min(1, Math.max(0.72, avail / H0)); if (path.dataset.f && Math.abs(+path.dataset.f - f) < 0.01) return; path.dataset.f = f;
  [...path.children].forEach(c => { if (c.tagName.toLowerCase() === 'svg') { c.style.height = (H0 * f) + 'px'; return; } const t0 = +(c.dataset.t0 || parseFloat(c.style.top)); if (isNaN(t0)) return; c.dataset.t0 = t0; c.style.top = (t0 * f) + 'px'; });
  path.style.height = (H0 * f) + 'px';
}
new MutationObserver(() => { if (document.querySelector('.gxc-path')) fitMap(); }).observe(document.body, { childList: true, subtree: true });
window.addEventListener('resize', () => fitMap());
// ---------------------------------------------------------------- boot
function boot() {
  GX.init({ key: 'vg' }); drawers(); refInit(); menu(); helpInit(); campInit(); musicInit();
  if (typeof artLoad === 'function') artLoad();
  if (window.GNS && GNS.achievements) try { GNS.achievements('vinegrave', [{ id: 'win', name: 'Expedition leader', how: 'Win a game against computer explorers.', test: r => r.won && r.mode === 'vs' }, { id: 'sixty', name: 'Temple scholar', how: 'Score 60 or more.', test: r => r.score >= 60 }]); } catch (e) { }
  if (window.GXV) GXV.watch(() => { if (G) render(); });
  const q = new URLSearchParams(location.search); UI.fast = q.get('fast') === '1';
  // the Story map's locked stages and header buttons answer every tap (a short note), never a dead tap
  document.addEventListener('click', e => { const n = e.target.closest && e.target.closest('.gxc-node.locked,.gxc-head .gxc-ib'); if (!n) return; if (n.classList.contains('locked')) { e.stopPropagation(); e.preventDefault(); }
    toast(n.classList.contains('locked') ? 'Win the stage before it to open this one.' : /star/i.test(n.getAttribute('aria-label') || n.textContent) ? 'Win stages to earn stars and unlock portraits.' : /back/i.test(n.textContent) ? 'Back to the title.' : 'One moment…', 1800); }, true);
  // Escape leaves the guided round
  document.addEventListener('keydown', e => { if (e.key !== 'Escape') return;
    if (typeof GXT !== 'undefined' && GXT.active() && UI.mode === 'tutorial') { try { GXT.stop(); } catch (x) { } clearTimeout(schedule.t); G = null; UI.mode = 'vs'; showTitle(); return; }
    const ov = document.querySelector('body > .gxc:not([hidden])'); if (ov && !(typeof GXC !== 'undefined' && GXC.active())) { try { GXC.close(); } catch (x) { } if (!G || G.phase !== 'play') showTitle(); } });
  if (window.GXS && GXS.on) { showTitle(); return; }
  showTitle();

}
window.UI = UI; Object.defineProperty(window, 'G', { get: () => G, configurable: true });
boot();
