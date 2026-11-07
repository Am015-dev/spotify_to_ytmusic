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
function tutAI(s) { if (s !== 1) return null; const ms = VG.moves(G); return ms.find(m => m.t === 'dig' && G.sites[m.s].lvl === 0) || ms.find(m => m.t === 'pass'); }
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
function tutSteps() {   /* the prologue: Pell's story reason in every bubble, one real action per step, a whole short game to the final count */
  const st = (id, o) => Object.assign({ id }, TS(id), o);
  return [
    st('hand', { target: tq(() => $('#hand .cd[data-id="trail"]')), wait: { type: 'tap', match: a => a.what === 'hand' && a.id === 'trail' }, ready: () => tmine() }),
    st('play', { target: tq(tinsp('Play it')), wait: { type: 'tap', match: a => a.what === 'mv' && a.m.t === 'play' }, ready: () => !!(UI.insp && tinsp('Play it')()) }),
    st('ruin', { target: tq(() => $(`.site[data-i="${TUT_SITE}"]`)), wait: { type: 'tap', match: a => a.what === 'site' && a.x === TUT_SITE }, ready: () => tmine() && G.p[1].ex < 2 }),
    st('disc', { target: tq(tinsp('Discover')), wait: { type: 'tap', match: a => a.what === 'mv' && a.m.t === 'disc' }, ready: () => !!(UI.insp && tinsp('Discover')()) }),
    st('idol', { target: tq('#extra [data-a=idol]'), wait: { type: 'tap', match: a => a.what === 'idol' }, ready: () => tmine() && !!G.sites[TUT_SITE].guard && !!$('#extra [data-a=idol]') && G.p[1].ex < 1 }),
    st('shrine', { target: tq(tinsp('Shrine: 3 coins')), wait: { type: 'tap', match: a => a.what === 'mv' && a.m.t === 'idol' }, ready: () => !!(UI.insp && tinsp('Shrine: 3 coins')()) }),
    st('beat', { target: tq(() => $(`.site[data-i="${TUT_SITE}"]`)), wait: { type: 'tap', match: a => a.what === 'site' && a.x === TUT_SITE }, ready: () => tmine() && !UI.insp }),
    st('over', { target: tq(tinsp('Overcome')), wait: { type: 'tap', match: a => a.what === 'mv' && a.m.t === 'beat' }, ready: () => !!(UI.insp && tinsp('Overcome')()) }),
    st('boon', { target: tq('#extra [data-a=guard]'), wait: { type: 'tap', match: a => a.what === 'guard' }, ready: () => tmine() && G.p[0].guards.length > 0 && !!$('#extra [data-a=guard]') }),
    st('useboon', { target: tq(tinsp('Use the boon')), wait: { type: 'tap', match: a => a.what === 'mv' && a.m.t === 'boon' }, ready: () => !!(UI.insp && tinsp('Use the boon')()) }),
    st('market', { target: tq('#row .cd[data-r="0"]'), wait: { type: 'tap', match: a => a.what === 'row' && a.x === 0 }, ready: () => tmine() && !UI.insp }),
    st('buy', { target: tq(tinsp('Buy it')), wait: { type: 'tap', match: a => a.what === 'mv' && a.m.t === 'buy' }, ready: () => !!(UI.insp && tinsp('Buy it')()) }),
    st('pass', { target: tq('#acts .btn'), wait: { type: 'tap', match: a => a.what === 'mv' && a.m.t === 'pass' }, ready: () => tmine() && G.round === 1 }),
    st('dig', { target: tq(tglow('#map .site.l0.glow, #map .site.glow')), wait: { type: 'tap', match: a => a.what === 'site' }, ready: () => tmine() && G.round === 2 && !!tglow('#map .site.glow')() }),
    st('digit', { target: tq(() => tinsp('Dig here')() || tinsp('Discover')()), wait: { type: 'tap', match: a => a.what === 'mv' && (a.m.t === 'dig' || a.m.t === 'disc') }, ready: () => !!(UI.insp && (tinsp('Dig here')() || tinsp('Discover')())) }),
    st('pass2', { target: tq('#acts .btn'), wait: { type: 'tap', match: a => a.what === 'mv' && a.m.t === 'pass' }, ready: () => tmine() && G.round === 2 }),
    st('score', { say: () => { const a = VG.score(G, 0).total, b = VG.score(G, 1).total; return `You ${a}, Tamsin ${b}. ` + (a >= b ? V.STORY.endWin : V.STORY.endLose); },
      target: tq('#rs table'), wait: null, ready: () => !!(G && G.phase === 'over' && $('#rs table') && !$('#rs').hidden) })
  ];
}
function tutStart(o) {
  if (typeof GXT === 'undefined') return; o = o && o.prologue ? o : null; closeInsp();
  const first = window.CAMPAIGN && window.CAMPAIGN.chapters[0];
  GXT.start({ game: TUT_GAME, steps: tutSteps(), story: !!(window.CAMPAIGN && typeof GXC !== 'undefined'),
    endTitle: 'Prologue complete', endText: o ? 'Pell: "You played a whole expedition. Now the coast, and Tamsin, are waiting."' : 'Pell: "A whole expedition, start to count. A real game is 5 rounds. The lightbulb helps any time."',
    endButtons: o && first ? [{ id: 'chapter', label: 'Start stage 1' }] : null,
    setup: tutSetup,
    onDone: r => { const c = r && r.choice; clearTimeout(schedule.t); G = null; UI.mode = 'vs'; closeInsp();
      if (c === 'chapter' && first) GXC.play(first.id); else if (c === 'story') { $('#start').hidden = true; GXC.open(); } else if (c === 'play') UIACT.quick(); else showTitle(); },
    onExit: () => { clearTimeout(schedule.t); G = null; UI.mode = 'vs'; closeInsp(); showTitle(); } });
}
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
