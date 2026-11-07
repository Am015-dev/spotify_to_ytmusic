// ===================== part 4: Story (gx-campaign) and the guided first round (gx-tutor), then boot =====================
const CAMP_OTHERS = { tamsin: ['Dr Okoro Bell'], quell: ['Tamsin Reed'], okoro: ['Mira Holt'], mira: ['Dr Okoro Bell'], sallow: ['Sallow (the other twin)'], vane: ['Mira Holt'], warden: [] };
function campStart(def) {
  const s = def.setup || {}, op = def.opponent || {}, np = s.players || 2, lv = op.aiLevel || 'normal';
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
function tutSetup() {
  try { GX.close(); } catch (e) { } closeRes(); UI.fast = false;
  startGame('tutorial', { np: 2, seed: 77, lvl: 'easy', names: ['Tamsin Reed'] });
  const me = G.p[0], tm = G.p[1];
  const back = me.hand.concat(me.deck); me.hand = ['trail', 'dread', 'grant', 'dread', 'trail']; me.deck = ['grant'];
  me.res = { coin: 2, compass: 2, tablet: 0, arrow: 0, jewel: 0 };
  tm.hand = ['dread', 'grant', 'dread', 'trail', 'grant']; tm.deck = ['trail'];
  const li = G.items.indexOf('lamp'); if (li >= 0) { G.items[li] = G.row[0]; G.row[0] = 'lamp'; } else { const ri = G.row.indexOf('lamp'); if (ri > 0) { G.row[ri] = G.row[0]; G.row[0] = 'lamp'; } }
  G.turn = 0; G.first = 0; render();
}
function tutSteps() {
  return [
    { id: 'goal', title: 'Welcome to Vinegrave', say: 'Explore for 5 rounds; most points wins. This practice is one round against Tamsin.', target: tq('#map'), wait: null, ready: () => tmine() },
    { id: 'hand', title: 'Your cards', say: 'Play a card for its effect, or spend it to pay travel. Tap Trail Notes.', target: tq(() => $('#hand .cd[data-id="trail"]')),
      wait: { type: 'tap', match: a => a.what === 'hand' && a.id === 'trail' }, ready: () => tmine() },
    { id: 'play', title: 'Play it', say: 'Trail Notes gives a compass. One main action ends your turn.', target: tq(tinsp('Play it')), wait: { type: 'tap', match: a => a.what === 'mv' && a.m.t === 'play' }, ready: () => !!(UI.insp && tinsp('Play it')()) },
    { id: 'watch', title: 'Tamsin\'s turn', say: 'Tamsin sent an explorer to a camp site. Now you have 3 compasses.', target: tq('#opp'), wait: null, ready: () => tmine() && G.p[1].ex < 2 },
    { id: 'ruin', title: 'A hidden ruin', say: '3 compasses and 2 Boots discover it. Tap the hidden ruin.', target: tq(() => $(`.site[data-i="${TUT_SITE}"]`)),
      wait: { type: 'tap', match: a => a.what === 'site' && a.x === TUT_SITE }, ready: () => tmine() },
    { id: 'disc', title: 'Discover it', say: 'Your two Dread cards pay the Boots. Tap Discover.', target: tq(tinsp('Discover')), wait: { type: 'tap', match: a => a.what === 'mv' && a.m.t === 'disc' }, ready: () => !!(UI.insp && tinsp('Discover')()) },
    { id: 'guard', title: 'A guardian wakes!', say: 'You took loot and an idol, but a guardian now shares the ruin with your explorer.', target: tq(() => $(`.site[data-i="${TUT_SITE}"]`)), wait: null, ready: () => tmine() && !!G.sites[TUT_SITE].guard },
    { id: 'idol', title: 'Your idol', say: 'Keep it for 3 points, or set it in a shrine for a boon.', target: tq('#extra [data-a=idol]'), wait: null, ready: () => tmine() && !!$('#extra [data-a=idol]') },
    { id: 'market', title: 'The market', say: 'Items cost coins; artifacts cost compasses. Tap the Tin Lamp.', target: tq('#row .cd[data-r="0"]'), wait: { type: 'tap', match: a => a.what === 'row' && a.x === 0 }, ready: () => tmine() },
    { id: 'buy', title: 'Buy it', say: 'Bought items go under your deck. Tap Buy it.', target: tq(tinsp('Buy it')), wait: { type: 'tap', match: a => a.what === 'mv' && a.m.t === 'buy' }, ready: () => !!(UI.insp && tinsp('Buy it')()) },
    { id: 'track', title: 'Research', say: 'Climb this track with tablets, arrowheads and jewels for points. The top is the temple.', target: tq('#track'), wait: null, ready: () => tmine() },
    { id: 'pass', title: 'Pass', say: 'Done for this round? Pass. The round ends when all have passed.', target: tq('#acts .btn'), wait: { type: 'tap', match: a => a.what === 'mv' && a.m.t === 'pass' }, ready: () => tmine() },
    { id: 'fear', title: 'Fleeing costs', say: 'Your explorer fled the guardian: a Dread card joins your deck. Overcome guardians to avoid it.', target: tq('#myres'), wait: null, ready: () => !!(G && G.round === 2 && !UI.busy) },
    { id: 'end', title: 'Ready to explore', say: 'Guardians give 5 points and a boon. A full game lasts 5 rounds. Good luck!', target: tq('#map'), wait: null, ready: () => !!(G && G.round === 2) }
  ];
}
function tutStart(o) {
  if (typeof GXT === 'undefined') return; o = o && o.prologue ? o : null; closeInsp();
  const first = window.CAMPAIGN && window.CAMPAIGN.chapters[0];
  GXT.start({ game: TUT_GAME, steps: tutSteps(), story: !!(window.CAMPAIGN && typeof GXC !== 'undefined'),
    endTitle: 'You know the basics', endText: o ? 'Dig, discover, buy, research, pass. Now the Story begins.' : 'Dig, discover, buy, research, pass. The lightbulb helps any time.',
    endButtons: o && first ? [{ id: 'chapter', label: 'Start stage 1' }] : null,
    setup: tutSetup,
    onDone: r => { const c = r && r.choice; clearTimeout(schedule.t); G = null; UI.mode = 'vs'; closeInsp();
      if (c === 'chapter' && first) GXC.play(first.id); else if (c === 'story') { $('#start').hidden = true; GXC.open(); } else if (c === 'play') UIACT.quick(); else showTitle(); },
    onExit: () => { clearTimeout(schedule.t); G = null; UI.mode = 'vs'; closeInsp(); showTitle(); } });
}
// ---------------------------------------------------------------- boot
function boot() {
  GX.init({ key: 'vg' }); drawers(); menu(); helpInit(); campInit(); musicInit();
  if (typeof artLoad === 'function') artLoad();
  if (window.GNS && GNS.achievements) try { GNS.achievements('vinegrave', [{ id: 'win', name: 'Expedition leader', how: 'Win a game against computer explorers.', test: r => r.won && r.mode === 'vs' }, { id: 'sixty', name: 'Temple scholar', how: 'Score 60 or more.', test: r => r.score >= 60 }]); } catch (e) { }
  if (window.GXV) GXV.watch(() => { if (G) render(); });
  const q = new URLSearchParams(location.search); UI.fast = q.get('fast') === '1';
  if (window.GXS && GXS.on) { showTitle(); return; }
  showTitle();
  if (!UI.prefs.played && typeof GXT !== 'undefined' && !GXT.status(TUT_GAME).seen) setTimeout(() => { if (!G && !$('#start').hidden) tutStart(); }, 600);
}
window.UI = UI; Object.defineProperty(window, 'G', { get: () => G, configurable: true });
boot();
