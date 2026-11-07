/* Wildmark Story (shell/gx-campaign.js): campaign.json chapters -> real games with a twist. Twists live here only; the normal rules never change.
   Twists: boss-acorns (rival seats start with param acorns), short-season (param turns each), no-sweep (nobody may sweep three tokens),
   rival-head (rivals start with param acorns AND you start with none spent... see CAMPAIGN-DESIGN.md). */
function campStart(def) {
  var s = def.setup || {}, op = def.opponent || {}, np = s.players || 2, tw = def.twist || null, acorns = [], names = [];
  for (var i = 0; i < np; i++) { acorns.push(0); names.push(i === 0 ? 'You' : i === 1 ? op.name : (s.others && s.others[i - 2]) || WM.RIVALS[(i + 1) % WM.RIVALS.length]); }
  if (tw && tw.id === 'boss-acorns') for (i = 1; i < np; i++) acorns[i] = tw.param || 2;
  if (tw && tw.id === 'you-acorns') acorns[0] = tw.param || 1;
  UI.mode = 'camp'; UI.camp = def; UI.sv = 'title';
  var g = newGame({ cards: s.cards || null, np: np, humans: 1, ai: op.aiLevel || 'normal', seed: s.seed != null ? s.seed : null, turns: tw && tw.id === 'short-season' ? tw.param : 20, acorns: acorns, no3: !!(tw && tw.id === 'no-sweep'), names: names });
  UI.mode = 'camp';
  try { if (window.GXH) GXH.setEnabled(def.hints !== false); } catch (e) { }
  setTimeout(function () { toast('Goal: ' + def.goal.text + (tw && tw.text ? ' ' + tw.text : ''), 3600); }, 400);
  return g;
}
function campMetrics(g) {
  var sc = g.res || WM.final(g), me = sc[0], other = sc.slice(1).reduce(function (m, x) { return Math.max(m, x.total); }, 0), big = 0;
  WM.TER.forEach(function (t) { big = Math.max(big, me.hab[t]); });
  var pairs = 0; WM.ANI.forEach(function (a) { if (me.ani[a] > 0) pairs++; });
  return { won: g.solo ? true : g.winner === 0, score: me.total, margin: me.total - other, acorns: me.acorns, habitat: me.habT, animals: me.aniT, biggest: big, kinds: pairs };
}
function campIsWon(g, def) {
  var m = campMetrics(g), goal = def.goal || { type: 'win' };
  if (goal.type === 'score') return m.score >= goal.value && (goal.winNotNeeded || m.won);
  if (goal.type === 'margin') return m.won && m.margin >= goal.value;
  if (goal.type === 'custom' && goal.key) return m[goal.key] >= goal.value && (goal.winNotNeeded || m.won);
  return g.winner === 0;
}
function campInit() {
  if (!window.GXC || !window.CAMPAIGN) return;
  GXC.init({
    game: 'wildmark', data: window.CAMPAIGN,
    portrait: function (who, size, c) { var st = c && c.portrait ? c.portrait.replace(/\.webp$/, '') : ''; return st && ART.have.indexOf(st) >= 0 ? artUrl(st) : campPortraitNode(c); },   // only files that exist (no 404s), else a drawn silhouette
    headButtons: function () { var b = document.createElement('button'); b.type = 'button'; b.className = 'gxc-ib'; b.textContent = 'Tutorial'; b.setAttribute('aria-label', 'Replay the tutorial'); b.addEventListener('click', function () { GXC.close(); tutStart(); }); return [b]; },
    endArt: { win: ART.have.indexOf('result-win') >= 0 ? artUrl('result-win') : null, lose: ART.have.indexOf('result-lose') >= 0 ? artUrl('result-lose') : null },
    startChapter: campStart, isWon: campIsWon, metrics: campMetrics,
    onExit: function () { UI.camp = null; UI.mode = 'quick'; UI.sv = 'title'; showTitle(); },
    scores: function (g) { return (g.res || WM.final(g)).map(function (x) { return x.total; }); },
    seats: function (g) { return g.seats.map(function (s, i) { return { name: s.name, me: i === 0, ai: s.ai || undefined }; }); }
  });
}
// code-drawn placeholder portrait (until portrait-<cast>.webp exists): a head-and-shoulders silhouette on the cast colour, no text
function campPortraitNode(c) {
  var col = (c && c.color) || '#3f7a4a', ns = 'http://www.w3.org/2000/svg', s = document.createElementNS(ns, 'svg');
  s.setAttribute('viewBox', '0 0 40 40'); s.setAttribute('class', 'wm-pt'); s.setAttribute('aria-hidden', 'true');
  // no painted portrait yet: a finished-looking crest (character colour, gold ring, their emblem animal, initial on a ribbon), never a grey silhouette
  var stem = c && c.portrait ? c.portrait.replace(/\.webp$/, '').replace('portrait-', '') : '', EMB = { rowan: 'elk', ranger: 'fox', pip: 'salmon', bram: 'bear', sorrel: 'elk', quill: 'hawk', linnet: 'hawk', oake: 'bear', warden: 'fox', frost: 'salmon', snowline: 'hawk' };
  var nm = (c && c.name) || '?', ini = nm.replace(/^(The|Ward|Elder)\s+/g, '').replace(/^(The|Ward|Elder)\s+/g, '').charAt(0).toUpperCase(), uid = 'wmp' + (campPortraitNode.n = (campPortraitNode.n || 0) + 1);
  s.innerHTML = '<defs><radialGradient id="' + uid + '" cx="50%" cy="35%" r="70%"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#000" stop-opacity=".25"/></radialGradient></defs>' +
    '<circle cx="20" cy="20" r="19.5" fill="#f2d27a"/><circle cx="20" cy="20" r="17.3" fill="' + col + '"/><circle cx="20" cy="20" r="17.3" fill="url(#' + uid + ')"/>' +
    (EMB[stem] && typeof tokenSvg === 'function' ? tokenSvg(EMB[stem], 20, 17, 10) : '') +
    '<path d="M8 29 h24 l-2.5 3.5 l2.5 3.5 h-24 l2.5 -3.5Z" fill="#2a1c06" opacity=".85"/><text x="20" y="34.3" text-anchor="middle" font-size="7" font-weight="800" fill="#f3ead2" font-family="Georgia,serif">' + ini + '</text>';
  return s;
}
// menu section chips: show which section was picked (the shared chips only scroll)
document.addEventListener('click', function (e) { var b = e.target.closest && e.target.closest('.gx-set-nav .gx-chip'); if (!b) return; [].forEach.call(b.parentNode.children, function (x) { x.setAttribute('aria-current', x === b ? 'true' : 'false'); }); }, true);
