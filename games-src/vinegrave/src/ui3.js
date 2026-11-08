// ===================== part 3: starting games, title, pass-the-device, result, drawers, menu, help, music =====================
const RIVALS = ['Tamsin Reed', 'Dr Okoro Bell', 'Mira Holt'];
function startGame(mode, o) {
  o = o || {}; closeInsp(); clearTimeout(schedule.t);
  const np = o.np || 2, seats = [];
  for (let i = 0; i < np; i++) {
    if (mode === 'hot') seats.push({ name: 'Player ' + (i + 1) });
    else seats.push(i === 0 ? { name: 'You' } : { name: (o.names && o.names[i - 1]) || RIVALS[(i - 1) % 3], ai: (o.lvBy && o.lvBy[i]) || o.lvl || 'normal' });
  }
  G = VG.newGame({ np, seats, seed: o.seed, solo: !!o.solo, rivalLevel: o.rivalLevel || o.lvl, rivalName: o.rivalName, twist: o.twist || null, rounds: o.rounds });
  if (mode !== 'tutorial') UI.coachFree = false;   /* the coach belongs to the tutorial game only */
  UI.mode = mode; UI.humans = seats.map((s, i) => s.ai ? -1 : i).filter(i => i >= 0); UI.view = UI.humans[0] || 0; UI.camp = o.camp || null;
  UI.prefs.played = UI.prefs.played || mode !== 'tutorial'; savePrefs();
  enterGame();
  if (window.GXH) try { GXH.setEnabled(hintsOn()); GXH.hide(); } catch (e) { }
  return G;
}
function enterGame() {
  $('#start').hidden = true; $('#rs').hidden = true; $('#pass').hidden = true; UI.started = true;
  try { GX.close(); } catch (e) { }
  if (window.GX && GX.undo) try { GX.undo.clear(); } catch (e) { }
  render(); musicSync(); UI.bannerFor = null;
  if (!UI.fast && UI.mode !== 'tutorial' && G.round === 1 && !G.log.some(l => /plays|digs|buys|discovers|passes/.test(l.t || ''))) { showGoal(); return; }
  turnBanner(); goOn();
}
function goOn() {
  const s = VG.actor(G); if (!isHuman(s)) schedule(); else if (s !== UI.view && UI.humans.length > 1) showPass(s);
}
function showTitle() {
  clearTimeout(schedule.t); closeInsp(); UI.camp = null; if ($('#goal') && !$('#goal').hidden) { $('#goal').hidden = true; UI.busy = false; } const st = $('#start'), o = UI.opts, sv = hasSave(), first = !UI.prefs.played;
  const learn = `<button type="button" class="${first ? 'tbtn primary' : 'tsb'}" data-a="tut">Learn to play</button>`, play = `<button type="button" class="${first ? 'tsb' : 'tbtn primary'}" data-a="start">Play</button>`;
  const who = o.hot ? 'Friends on this device' : o.opp === 0 ? 'Solo vs a rival crew' : o.opp + ' computer ' + (o.opp === 1 ? 'rival' : 'rivals');
  st.innerHTML = `<div class="tbox">
    <h1 class="logo">Vinegrave</h1><p class="tag2">Dig the ruins. Wake the guardians. Reach the temple.</p>
    ${first ? learn + play : play + learn}${sv ? '<button type="button" class="tsb" data-a="loadsave">Continue your expedition</button>' : ''}
    <button type="button" class="tsb" data-a="story">Story<small>${esc(campLine() || '3 regions, 10 stages')}</small></button>
    <button type="button" class="tset" data-a="tset" aria-expanded="${!!UI.tset}">Game settings: ${esc(who)}, ${o.lvl}</button>
    <div class="tsets" ${UI.tset ? '' : 'hidden'}><div class="lbl">Rivals</div>
    <div class="seg">${[[1, '1'], [2, '2'], [3, '3'], [0, 'Solo']].map(([v, l]) => `<button type="button" class="chipb${o.opp === v && !o.hot ? ' on' : ''}" data-a="opt" data-k="opp" data-v="${v}" aria-pressed="${o.opp === v}">${l}</button>`).join('')}<button type="button" class="chipb${o.hot ? ' on' : ''}" data-a="opt" data-k="hot" data-v="${o.hot ? 0 : 1}" aria-pressed="${!!o.hot}">Friends</button></div>
    <div class="lbl">Computer skill</div><div class="seg">${['easy', 'normal', 'hard'].map(v => `<button type="button" class="chipb${o.lvl === v ? ' on' : ''}" data-a="opt" data-k="lvl" data-v="${v}" aria-pressed="${o.lvl === v}">${v[0].toUpperCase() + v.slice(1)}</button>`).join('')}</div></div>
  </div>`;
  st.hidden = false; if (typeof artApply === 'function') artApply(st); musicSync();
}
UIACT.tset = () => { UI.tset = !UI.tset; showTitle(); };
UIACT.opt = t => { const k = t.dataset.k, v = t.dataset.v; UI.opts[k] = k === 'lvl' ? v : +v; if (k === 'hot') UI.opts.hot = !!+v; if (k === 'opp') UI.opts.hot = false; showTitle(); };
UIACT.quick = () => {
  const o = UI.opts;
  if (o.hot) return startGame('hot', { np: Math.max(2, o.opp + 1) });
  if (o.opp === 0) return startGame('solo', { np: 1, solo: true, rivalLevel: o.lvl, rivalName: 'Vane\'s expedition' });
  startGame('vs', { np: o.opp + 1, lvl: o.lvl });
};
UIACT.loadsave = () => { if (!loadSave()) { clearSave(); showTitle(); } };
UIACT.title = () => { closeRes(); showTitle(); };
UIACT.showres = () => showResult();
UIACT.again = () => { closeRes(); UIACT.quick(); };
UIACT.campfin = () => { closeRes(); try { GXC.finish(G); campBest(); } catch (e) { console.error(e); showTitle(); } };
UIACT.campretry = () => { closeRes(); try { GXC.finish(G); const b = document.querySelector('.gxc-res .gxc-btn.go'); if (b) b.click(); campBest(); } catch (e) { console.error(e); showTitle(); } };
/* best score per stage: the shared Story code keeps best:null, so the game records it and writes it back after every save */
function campBest(id, sc) {
  try { const K = 'vinegrave-camp-best', b = JSON.parse(localStorage.getItem(K) || '{}'); if (id && sc != null && (b[id] == null || sc > b[id])) b[id] = sc; localStorage.setItem(K, JSON.stringify(b));
    const pk = 'gns-campaign-vinegrave', P = JSON.parse(localStorage.getItem(pk) || 'null'); if (!P || !P.ch) return;
    Object.keys(b).forEach(k => { if (P.ch[k] && (P.ch[k].best == null || b[k] > P.ch[k].best)) P.ch[k].best = b[k]; }); localStorage.setItem(pk, JSON.stringify(P)); } catch (e) { }
}
UIACT.look = () => closeRes();
UIACT.iam = () => { UI.view = VG.actor(G); $('#pass').hidden = true; render(); };
function showGoal() {   /* one card before turn 1: how you win in one sentence, three ways to score */
  const g = $('#goal') || document.body.appendChild(Object.assign(document.createElement('div'), { id: 'goal', className: 'ov' }));
  const q = V.STORY.quick.intro, flavour = UI.camp && UI.camp.twist ? UI.camp.twist.text : q[(G.rng >>> 0) % q.length];
  g.innerHTML = `<div class="tbox gbox" role="dialog" aria-label="Goal"><p class="gk">How to win</p><p class="gl">${UI.camp ? esc(UI.camp.goal.text) : 'Have the most points after ' + G.rounds + ' rounds.'}</p>
    <ul class="gu"><li>${ic('up', 'research')}<span>Climb the research track. Higher rows score more.</span></li><li>${ic('idol', 'idol')}<span>Explore ruins. Idols are 3 points, guardians 5.</span></li><li>${ic('card', 'cards')}<span>Buy cards with points. Dread cards cost 1.</span></li></ul>
    <p class="gf">${esc(flavour)}</p><button type="button" class="tbtn" data-a="goalgo">Start the expedition</button></div>`;
  g.hidden = false; UI.busy = true; render();
}
UIACT.goalgo = () => { const g = $('#goal'); if (g) g.hidden = true; UI.busy = false; render(); turnBanner(); goOn(); };
function showPass(s) {
  const p = $('#pass'); p.innerHTML = `<div class="tbox"><h2 class="logo" style="font-size:28px">Pass the device</h2><p class="tag2">Hand it to ${esc(G.p[s].name)}. Your cards stay hidden.</p><button type="button" class="tbtn" data-a="iam">I am ${esc(G.p[s].name)}</button></div>`;
  p.hidden = false;
}
function closeRes() { $('#rs').hidden = true; }
function rows(i) { const s = VG.score(G, i); return [['Research track', s.research], ['Temple tiles', s.temple], ['Idols (3 each)', s.idols], ['Empty shrine slots', s.slots], ['Guardians (5 each)', s.guards], ['Card points', s.cards], ['Dread (-1 each)', s.fear], ['Total', s.total]]; }
const CATS = [['research', 'up', 'Research'], ['temple', 'star', 'Temple'], ['idols', 'idol', 'Idols'], ['slots', 'leaf', 'Shrines'], ['guards', 'guard', 'Guardians'], ['cards', 'card', 'Cards'], ['fear', 'exile', 'Dread']];
function showResult() {
  if (!G || G.phase !== 'over') return; const r = $('#rs');
  const camp = UI.camp && typeof GXC !== 'undefined' && GXC.active();
  const iWon = UI.humans.length === 1 ? G.winner === UI.humans[0] : G.winner >= 0, def = camp ? UI.camp : null;
  const cWon = def ? campIsWon(G, def) : iWon, m = def ? campMetrics(G) : null;
  let goals = '', line = '';
  if (def) {   /* Story: the goals met (the stars the map will show), the cast's line */
    const got = def.stars.map((st, i) => cWon && (i === 0 || (GXC.testStar ? GXC.testStar(st.test, m) : false)));
    goals = `<div class="rstars" aria-label="${got.filter(Boolean).length} of 3 stars">${got.map(g => `<span class="${g ? 'on' : ''}">★</span>`).join('')}</div><ul class="rgoals">${def.stars.map((st, i) => `<li class="${got[i] ? 'on' : ''}">${got[i] ? '✓' : '·'} ${esc(st.text)}</li>`).join('')}</ul>`;
    const op = def.opponent || {}, q = cWon ? op.praise : op.taunt;
    if (q) line = `<p class="rquote"><b>${esc(op.name)}:</b> “${esc(q)}”</p>`;
  }
  // everyone, winner first: a big total, then each kind of points with its icon
  const P = G.p.map((p, i) => ({ i, name: i === UI.humans[0] && UI.humans.length === 1 ? 'You' : p.name, sc: VG.score(G, i) })).concat(G.rival ? [{ i: -2, name: G.rival.name, sc: { research: V.GLASS_VP[Math.min(V.TOP, G.rival.rows)], cards: G.rival.vp, total: VG.rivalScore(G) } }] : []);
  P.sort((a, b) => (b.i === G.winner) - (a.i === G.winner) || b.sc.total - a.sc.total);
  const me = UI.humans[0] || 0, myT = VG.score(G, me).total, best = Math.max.apply(null, P.filter(x => x.i !== me).map(x => x.sc.total).concat([0]));
  const wn = G.winner === -1 ? 'A tie!' : G.winner === -2 ? short(-2) + ' wins.' : (UI.humans.length === 1 && G.winner === me ? 'You win!' : short(G.winner) + ' wins.');
  const head = def ? (cWon ? 'Stage won!' : 'Stage lost') : iWon ? 'Victory!' : G.winner === -1 ? 'A tie' : 'Defeat';
  const sub = def && !cWon ? (G.winner === 0 ? 'You won, but missed the goal: ' + def.goal.text : esc(wn) + ' Goal: ' + def.goal.text) + ' Try again.'
    : UI.humans.length === 1 && P.length > 1 ? (myT > best ? `You won by ${myT - best} points.` : myT < best ? `${esc(wn)} You were ${best - myT} points short.` : esc(wn)) : esc(wn);
  const blk = (x, k) => `<div class="rp${k === 0 ? ' first' : ''}"><div class="rph"><span class="crest" style="--pc:${x.i >= 0 ? HEX[x.i] : '#9a9486'}"></span><span class="rpn">${esc(x.name)}</span><span class="rpt"><b data-n="${x.sc.total}">${x.sc.total}</b> points</span></div>
    <div class="rcats">${CATS.filter(c => x.sc[c[0]]).map(c => `<span class="rcat${x.sc[c[0]] < 0 ? ' neg' : ''}">${ic(c[1], c[2])}<b data-n="${x.sc[c[0]]}">${x.sc[c[0]]}</b><small>${c[2]}</small></span>`).join('') || '<span class="rcat"><small>No points yet</small></span>'}</div></div>`;
  const btns = def ? (cWon ? '<button type="button" class="tbtn" data-a="campfin">Continue the story</button>' : '<button type="button" class="tbtn" data-a="campretry">Try again</button>')
    : '<button type="button" class="tbtn" data-a="again">Play again</button>';
  r.innerHTML = `<div class="tbox rbox ${cWon ? 'won' : 'lost'}"><div class="rart" data-art="${cWon ? 'result-win' : 'result-lose'}" aria-hidden="true"></div><p class="rban">${head}</p><p class="win">${sub}</p>${goals}${line}<div class="rplayers">${P.map(blk).join('')}</div>
    <div class="trow2">${btns}</div>
    <div class="trow2"><button type="button" class="tsb" data-a="look">See the island</button>${def ? (cWon ? '' : '<button type="button" class="tsb" data-a="campfin">Story map</button>') : '<button type="button" class="tsb" data-a="title">Title screen</button>'}</div></div>`;
  if (!def && UI.mode !== 'tutorial') { const fl = document.createElement('p'); fl.className = 'rquote'; fl.textContent = cWon ? V.STORY.quick.win : V.STORY.quick.lose; const w = r.querySelector('.win'); if (w) w.after(fl); }
  if (!UI.fast && !reducedMo()) r.querySelectorAll('[data-n]').forEach((b, k) => { const n = +b.dataset.n; if (!isFinite(n)) return; b.textContent = '0'; const t0 = performance.now() + 300 + k * 60; const tick = t => { const f = Math.max(0, Math.min(1, (t - t0) / 1000)); b.textContent = String(Math.round(n * (1 - Math.pow(1 - f, 3)))); if (f < 1) requestAnimationFrame(tick); }; requestAnimationFrame(tick); });   /* every number counts up */
  r.hidden = false; if (typeof artApply === 'function') artApply(r); $('#toast').classList.remove('on'); musicSync(); try { sfx.play(cWon ? 'win' : 'fear'); } catch (e) { }
  if (def && m) campBest(def.id, m.score);
  if (!UI.resDone && UI.mode !== 'tutorial' && !camp && window.GNS && GNS.result) { UI.resDone = true; try { GNS.result({ game: 'vinegrave', mode: UI.mode === 'hot' ? 'hot' : UI.mode === 'solo' ? 'solo' : 'vs', level: UI.opts.lvl, seats: G.p.map((p, i) => ({ name: p.name, me: UI.humans.indexOf(i) >= 0, ai: p.ai || undefined })), winner: G.winner, scores: G.p.map((p, i) => VG.score(G, i).total), turns: G.turns }); } catch (e) { } }
}
// ---------------------------------------------------------------- drawers: scores, log, rules
function scoresEl() {
  const d = document.createElement('div'); if (!G) { d.textContent = 'No game yet.'; return d; }
  let t = `<table class="sct"><tr><th></th>${G.p.map(p => `<th>${esc(p.name.split(' ')[0])}</th>`).join('')}</tr>`;
  const cols = G.p.map((p, i) => rows(i)); rows(0).forEach((row, k) => { t += `<tr><td>${row[0]}</td>${cols.map(c => `<td>${c[k][1]}</td>`).join('')}</tr>`; });
  t += `<tr><td>Cards owned</td>${G.p.map(p => `<td>${p.deck.length + p.hand.length + p.play.length + p.disc.length}</td>`).join('')}</tr></table>`;
  if (G.rival) t += `<p>${esc(G.rival.name)}: <b>${VG.rivalScore(G)}</b> points (research row ${G.rival.rows}). It plays one card after each of your actions.</p>`;
  d.innerHTML = t; return d;
}
function logEl() { const d = document.createElement('div'); d.className = 'loglist'; d.innerHTML = G ? G.log.slice(-80).reverse().map(l => `<div>${esc(l.t)}</div>`).join('') : ''; return d; }
const RULES_HTML = `<div class="rules">
<h3>How a turn works</h3><ol class="howturn"><li>Do <b>one</b> action, then the next explorer goes.</li><li><b>Play a card</b> from your hand for its goods.</li><li><b>Go to a site</b>: pay its travel icons with cards.</li><li><b>Buy a card</b>. Items cost coins. Artifacts cost compasses.</li><li>Nothing to do? <b>Pass</b>. After 5 rounds, most points wins.</li></ol>
<p><button type="button" class="btn" data-a="morerules" aria-expanded="false">Show all the rules</button></p><div class="allrules" hidden>
<h3>The goal</h3><p>Play 5 rounds. Most points wins. Each Dread card costs 1 point.</p>
<h3>Your turn</h3><p>Do one action, then the next explorer goes. Pass to sit out.</p>
<ul><li><b>Play a card</b> for its effect. Artifacts cost 1 tablet to play. Dread does nothing.</li>
<li><b>Dig</b>: send one of your 2 explorers to a free site. Pay its travel icons. Take its loot.</li><li>A card pays one travel icon, then is discarded. A Plane pays any icon.</li>
<li><b>Explore</b> a hidden ruin: pay 3 compasses (deep ruins 6) and travel. A <b>guardian wakes</b>.</li>
<li><b>Fight</b> a guardian where your explorer stands. Pay its cost for 5 points and a boon.</li>
<li><b>Buy</b>: items go under your deck. Artifacts work at once.</li>
<li><b>Research</b>: climb the track. Pay each row's cost for its bonus.</li></ul>
<h3>Free actions</h3><p>Use a boon, or set one idol in a shrine.</p>
<h3>End of a round</h3><p>Explorers come home. Anyone with a guardian gains Dread.</p>
<h3>Solo</h3><p>A rival plays after each action. Beat its score.</p>
<h3>Simplified on purpose</h3><ul><li>All card, site, guardian and idol numbers are this game's own.</li><li>One idol a turn into a shrine. 4 shrine slots. Boons come at once.</li><li>No helpers and no research bonus tiles. First arrivals get rewards.</li><li>No expansions and no second board.</li><li>The solo rival deck is this game's own.</li></ul></div></div>`;
function rulesEl() { const d = document.createElement('div'); d.innerHTML = RULES_HTML + '<p style="display:flex;gap:8px;flex-wrap:wrap"><button type="button" class="btn go" data-a="cards">All cards</button>' + (window.GXT ? '<button type="button" class="btn" data-a="tut">Play the guided round</button>' : '') + '</p>'; return d; }
// card reference: every card, guardian, ruin, camp site and idol, searchable, tap for the large view (shared gx-kit drawer, no extra bar button)
function refInit() {
  if (!GX.reference) return;
  const cardItem = id => { const c = V.CARDS[id]; return { id: 'c-' + id, name: c.name, text: c.text + (c.t !== 'fear' ? ' Travel: ' + V.TNAME[c.tr] + '.' : ' Travel: Boot.'), count: c.t === 'item' || c.t === 'art' ? 1 : (id === 'dread' ? 19 : 2), tags: [c.t === 'item' ? 'Item' : c.t === 'art' ? 'Artifact' : c.t === 'fear' ? 'Dread' : 'Starting card', V.TNAME[c.tr]], meta: (c.t === 'item' ? c.cost + (c.cost === 1 ? ' coin' : ' coins') : c.t === 'art' ? c.cost + (c.cost === 1 ? ' compass' : ' compasses') : 'start deck') + ' · ' + (c.vp || 0) + (Math.abs(c.vp || 0) === 1 ? ' point' : ' points'), pic: { card: id } }; };
  const S = [
    { id: 'items', title: 'Items', items: V.ITEMS.map(cardItem) },
    { id: 'arts', title: 'Artifacts', items: V.ARTS.map(cardItem) },
    { id: 'basic', title: 'Starting cards', items: ['grant', 'trail', 'dread'].map(cardItem) },
    { id: 'guards', title: 'Guardians', items: V.GUARDS.map(g => ({ id: 'g-' + g, name: V.GUARD[g].name, text: 'Overcome: pay ' + V.resText(V.GUARD[g].cost) + '. ' + V.GUARD[g].text, tags: ['Guardian'], meta: '5 points', pic: { guard: g } })) },
    { id: 'ruins', title: 'Ruins', items: V.S1.concat(V.S2).map(t => ({ id: 's-' + t, name: V.SITE[t].name, text: 'Dig: gain ' + V.resText(V.SITE[t].rew) + '.', tags: ['Level ' + V.SITE[t].lvl], meta: 'Discover for ' + V.DISC[V.SITE[t].lvl] + ' compasses', pic: { site: t } })) },
    { id: 'camp', title: 'Camp sites', items: V.CAMP.map(c => ({ id: 's-' + c.id, name: c.name, text: 'Dig: gain ' + V.resText(c.rew) + '. Travel: ' + c.cost.map(t => V.TNAME[t]).join(' + ') + '.', tags: ['Camp'], meta: 'always open', pic: { site: c.id } })) },
    { id: 'idols', title: 'Idols', items: V.IDOLS.map(i => ({ id: 'i-' + i, name: V.IDOL[i].name, text: 'Found when you discover a ruin: gain ' + V.resText(V.IDOL[i].gift) + '. Worth 3 points.', tags: ['Idol'], meta: '3 points', pic: { idol: i } })) }
  ];
  GX.reference(S, { id: 'refd', title: 'All cards', label: 'Cards', button: false,
    picture: (it, big) => { const w = big ? 150 : 52, P = it.pic;
      if (P.card) return `<div style="width:${w}px;--cw:${w}px">${cardHTML(P.card, {})}</div>`;
      const st = P.guard ? 'guard-' + P.guard : P.site ? 'site-' + P.site : P.idol, sym = P.guard ? 'guard' : P.site ? 'leaf' : 'idol';
      const d = document.createElement('div'); d.style.cssText = `width:${w}px;height:${w}px;border-radius:12px;background:#3c5a3f;display:flex;align-items:center;justify-content:center`; d.setAttribute('data-art', st);
      d.innerHTML = `<svg width="60%" height="60%" aria-hidden="true"><use href="#s-${sym}"/></svg>`; setTimeout(() => { if (typeof artApply === 'function') artApply(d.parentNode || document); }, 0); return d; },
    inGame: it => !!G && it.pic && it.pic.card && (G.row.indexOf(it.pic.card) >= 0 || G.p.some(p => p.hand.concat(p.deck, p.disc, p.play).indexOf(it.pic.card) >= 0)) });
}
function cardsOpen(id) { closeInsp(); try { if (id) GX.refOpen(id); else GX.show('refd'); } catch (e) { } }
UIACT.morerules = t => { const d = t.closest('.rules') && t.closest('.rules').querySelector('.allrules'); if (!d) return; d.hidden = !d.hidden; t.setAttribute('aria-expanded', String(!d.hidden)); t.textContent = d.hidden ? 'Show all the rules' : 'Hide the full rules'; };
UIACT.cards = t => cardsOpen(t.dataset.id ? 'c-' + t.dataset.id : null);
function drawers() {
  GX.drawer('scored', 'Scores', scoresEl()); GX.drawer('logd', 'Log', logEl()); GX.drawer('rulesd', 'How to play', rulesEl());
  GX.onShow = id => { if (id === 'scored') GX.drawer('scored', 'Scores', scoresEl()); if (id === 'logd') GX.drawer('logd', 'Log', logEl()); closeInsp(); };
}
function menu() {
  const b = (label, fn, cls) => { const e = document.createElement('button'); e.type = 'button'; e.className = 'btn ' + (cls || ''); e.textContent = label; e.addEventListener('click', () => { GX.close(); fn(); }); return e; };
  GX.settings({ id: 'setd', title: 'Menu',
    game: S => { S.appendChild(GX.row('This game', [b('Restart', restartGame), b('Title', showTitle), b('Story map', storyOpen)])); },
    sound: S => { S.appendChild(GX.row('Sound effects', GX.onoff(UI.prefs.sound !== false, v => { UI.prefs.sound = v; savePrefs(); }))); S.appendChild(GX.row('Music', [GX.onoff(UI.prefs.music !== false, v => { UI.prefs.music = v; savePrefs(); musicSync(); }), b('Pick songs', () => { try { GXMUS.open(); } catch (e) { } })])); },
    help: S => { S.appendChild(GX.row('Hints', GX.onoff(!!UI.prefs.hints, v => { UI.prefs.hints = v; savePrefs(); try { GXH.setEnabled(hintsOn()); if (!hintsOn()) GXH.hide(); } catch (e) { } render(); }))); S.appendChild(GX.row('Learn', [b('Rules', () => setTimeout(() => GX.show('rulesd'), 50)), b('Tutorial', () => tutStart()), b('All cards', () => setTimeout(() => cardsOpen(), 50))])); if (window.GXH) { const w = document.createElement('div'); w.innerHTML = GXH.settingsHTML({ rowClass: 'gx-row', btnClass: 'btn' }); S.appendChild(w); } },
    about: { name: 'Vinegrave', version: '1.0', text: 'An original jungle-expedition game for the Game Night Shelf. Temporary icons made by Lorc, Delapouite and Caro Asercion, game-icons.net, CC BY 3.0.' } });
}
// Restart: the same kind of game again (a Story stage restarts that stage)
function restartGame() { if (UI.camp && typeof GXC !== 'undefined') { const id = UI.camp.id; closeRes(); try { GXC.play(id); } catch (e) { UIACT.quick(); } return; } if (G && UI.mode === 'hot') return startGame('hot', { np: G.np }); closeRes(); UIACT.quick(); }
// ---------------------------------------------------------------- help kit (coach bubbles + lightbulb)
function helpPhase() {
  if (!G || UI.mode === 'tutorial' || !myTurn()) return null;
  if (G.q) return 'q-' + G.q.h;
  const me = G.p[UI.view];
  if (G.sites.some(x => x.occ === UI.view && x.guard)) return 'guard';
  if (me.idols.some(d => !d.used)) return 'idol';
  return 'turn';
}
function moveTarget(m) {
  if (!m) return null;
  if (m.t === 'play') return $(`#hand .cd[data-i="${m.i}"]`); if (m.s != null) return $(`.site[data-i="${m.s}"]`); if (m.t === 'buy') return $(`#row .cd[data-r="${m.r}"]`);
  if (m.t === 'res' || m.t === 'temple') return $('#track'); if (m.t === 'pass') return $('#passbtn'); if (m.t === 'boon') return $(`#extra [data-a=guard][data-k="${m.k}"]`); if (m.t === 'idol') return $(`#extra [data-a=idol][data-k="${m.k}"]`);
  if (m.t === 'ans') { if (G.q.h === 'site' && m.v != null) return $(`.site[data-i="${m.v}"]`); if (G.q.h === 'buy' && m.v != null) return $(`#row .cd[data-r="${m.v}"]`); return $('#qbox'); }
  return null;
}
function helpInit() {
  if (!window.GXH) return;
  const P = (t) => () => `<svg viewBox="0 0 24 24" width="48" height="48"><use href="#s-${t}"/></svg>`;
  GXH.init({ game: 'vinegrave', defaultOn: false,
    steps: { guard: { target: () => $('.site .gd'), title: 'A guardian wakes', text: 'Overcome it for 5 points, or flee and take a Dread card.', pic: P('guard') },
      idol: { target: () => $('#extra [data-a=idol]'), title: 'You found an idol', text: 'Worth 3 points. Set it in a shrine for a boon too.', pic: P('idol') },
      'q-exile': { target: () => $('#qbox'), title: 'Exile a card', text: 'Removing Dread cards helps your deck.', pic: P('exile') } },
    rules: [{ title: 'How a turn works', text: 'One action, then the next explorer. Nothing to do? Pass.', pic: P('star') },
      { title: 'The goal', text: 'Five rounds. Score from research, idols, guardians and cards. Dread costs 1.', pic: P('star') },
      { title: 'Travel', text: 'Each card pays one travel icon. A Plane pays any icon.', pic: P('boot') },
      { title: 'Discover', text: 'Three compasses flip a hidden ruin. You get an idol and loot.', pic: P('compass') },
      { phase: 'guard', title: 'Overcome', text: 'Pay its cost while you are there: 5 points and a boon.', pic: P('guard') },
      { phase: 'idol', title: 'Shrines', text: 'Set one idol a turn in a shrine for a boon.', pic: P('idol') }],
    avoid: '.glow,#pacts .btn,#qbox .btn,#insp' });
  if (0) GXH.bulb({ el: '#bulbbtn', suggest: () => { if (!myTurn()) return null; const m = VAI.choose(G, 'hard'); const t = moveTarget(m); return t ? { target: () => moveTarget(m), why: VAI.why(G, m) } : null; }, rulesFor: () => helpPhase() });
}
// ---------------------------------------------------------------- music (silent until files exist in media/music)
function musicSlot() { if (!G || !$('#start').hidden) return ['tavern', 0]; if (G.phase === 'over') return [G.winner === UI.humans[0] ? 'victory' : 'defeat', 1]; if (UI.camp && UI.camp.boss) return ['fight', 0]; return ['main', 0]; }
function musicInit() {
  try { const m = {}; (window.VG_MUSIC || []).forEach(n => m[n] = 'url:music/' + n + '.mp3'); if (window.GA) GA.init({ sfx: {}, music: m, key: 'vg' }); } catch (e) { }
  try { GXMUS.init({ key: 'vg', slots: [['tavern', 'Menu'], ['main', 'Expedition'], ['fight', 'Boss'], ['victory', 'Victory'], ['defeat', 'Defeat']], loops: ['tavern', 'main', 'fight'], slot: musicSlot, on: () => UI.prefs.music !== false }); } catch (e) { }
}
function musicSync() { try { GXMUS.sync(); } catch (e) { } }
