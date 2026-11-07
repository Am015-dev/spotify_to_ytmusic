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
  UI.mode = mode; UI.humans = seats.map((s, i) => s.ai ? -1 : i).filter(i => i >= 0); UI.view = UI.humans[0] || 0; UI.camp = o.camp || null;
  UI.prefs.played = UI.prefs.played || mode !== 'tutorial'; savePrefs();
  enterGame();
  if (UI.camp) toast('Goal: ' + UI.camp.goal.text + (UI.camp.twist ? ' ' + UI.camp.twist.text : ''), 3200);
  return G;
}
function enterGame() {
  $('#start').hidden = true; $('#rs').hidden = true; $('#pass').hidden = true; UI.started = true;
  try { GX.close(); } catch (e) { }
  if (window.GX && GX.undo) try { GX.undo.clear(); } catch (e) { }
  render(); musicSync();
  const s = VG.actor(G); if (!isHuman(s)) schedule(); else if (s !== UI.view && UI.humans.length > 1) showPass(s);
}
function showTitle() {
  clearTimeout(schedule.t); closeInsp(); UI.camp = null; const st = $('#start'), o = UI.opts, sv = hasSave(), first = !UI.prefs.played;
  st.innerHTML = `<div class="tbox">
    <h1 class="logo">Vinegrave</h1><p class="tag2">Dig the ruins. Wake the guardians. Reach the temple.</p>
    ${first ? '<button type="button" class="tbtn primary" data-a="tut">Learn to play</button><button type="button" class="tsb" data-a="quick">Play now<small>skip the guided round</small></button>'
      : '<button type="button" class="tbtn primary" data-a="quick">Play</button>' + (sv ? '<button type="button" class="tsb" data-a="loadsave">Continue<small>your saved expedition</small></button>' : '<button type="button" class="tsb" data-a="tut">Guided round<small>learn or refresh the rules</small></button>')}
    <div class="lbl">Rivals</div>
    <div class="seg">${[[1, '1'], [2, '2'], [3, '3'], [0, 'Solo']].map(([v, l]) => `<button type="button" class="chipb${o.opp === v ? ' on' : ''}" data-a="opt" data-k="opp" data-v="${v}" aria-pressed="${o.opp === v}">${l}</button>`).join('')}</div>
    <div class="seg">${['easy', 'normal', 'hard'].map(v => `<button type="button" class="chipb${o.lvl === v ? ' on' : ''}" data-a="opt" data-k="lvl" data-v="${v}" aria-pressed="${o.lvl === v}">${v[0].toUpperCase() + v.slice(1)}</button>`).join('')}
      <button type="button" class="chipb${o.hot ? ' on' : ''}" data-a="opt" data-k="hot" data-v="${o.hot ? 0 : 1}" aria-pressed="${!!o.hot}">Friends on this device</button></div>
    <div class="trow2"><button type="button" class="tsb" data-a="story">Story<small>${esc(campLine() || '3 regions, 10 stages')}</small></button>
      <button type="button" class="tsb" data-a="tut">How to play<small>Guided first round</small></button></div>
  </div>`;
  st.hidden = false; if (typeof artApply === 'function') artApply(st); musicSync();
}
UIACT.opt = t => { const k = t.dataset.k, v = t.dataset.v; UI.opts[k] = k === 'lvl' ? v : +v; if (k === 'hot') UI.opts.hot = !!+v; showTitle(); };
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
UIACT.campfin = () => { closeRes(); try { GXC.finish(G); } catch (e) { console.error(e); showTitle(); } };
UIACT.look = () => closeRes();
UIACT.iam = () => { UI.view = VG.actor(G); $('#pass').hidden = true; render(); };
function showPass(s) {
  const p = $('#pass'); p.innerHTML = `<div class="tbox"><h2 class="logo" style="font-size:28px">Pass the device</h2><p class="tag2">Hand it to ${esc(G.p[s].name)}. Your cards stay hidden.</p><button type="button" class="tbtn" data-a="iam">I am ${esc(G.p[s].name)}</button></div>`;
  p.hidden = false;
}
function closeRes() { $('#rs').hidden = true; }
function rows(i) { const s = VG.score(G, i); return [['Research', s.research], ['Temple tiles', s.temple], ['Idols', s.idols], ['Guardians', s.guards], ['Card points', s.cards], ['Dread', s.fear], ['Total', s.total]]; }
function showResult() {
  if (!G || G.phase !== 'over') return; const r = $('#rs');
  const names = G.p.map(p => p.name).concat(G.rival ? [G.rival.name] : []), cols = G.p.map((p, i) => rows(i));
  const wn = G.winner === -1 ? 'A tie!' : G.winner === -2 ? G.rival.name + ' wins.' : (UI.humans.length === 1 && G.winner === UI.humans[0] ? 'You win!' : G.p[G.winner].name + ' wins.');
  let t = `<table><tr><th></th>${names.map(n => `<th>${esc(n.split(' ')[0])}</th>`).join('')}</tr>`;
  rows(0).forEach((row, k) => { t += `<tr><td>${row[0]}</td>${cols.map(c => `<td>${k === 6 ? '<b>' + c[k][1] + '</b>' : c[k][1]}</td>`).join('')}${G.rival ? `<td>${k === 6 ? '<b>' + VG.rivalScore(G) + '</b>' : k === 0 ? V.GLASS_VP[Math.min(V.TOP, G.rival.rows)] : k === 4 ? G.rival.vp : '—'}</td>` : ''}</tr>`; });
  t += '</table>';
  const camp = UI.camp && typeof GXC !== 'undefined' && GXC.active();
  r.innerHTML = `<div class="tbox" data-art="${G.winner === 0 ? 'result-win' : 'result-lose'}"><p class="win">${esc(wn)}</p>${t}
    <div class="trow2">${camp ? '<button type="button" class="tbtn" data-a="campfin">Continue the story</button>' : '<button type="button" class="tbtn" data-a="again">Play again</button>'}</div>
    <div class="trow2"><button type="button" class="tsb" data-a="look">Look at the island</button>${camp ? '' : '<button type="button" class="tsb" data-a="title">Title screen</button>'}</div></div>`;
  r.hidden = false; musicSync();
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
<h3>The goal</h3><p>Explore the island for 5 rounds. The most points wins: research track, temple tiles, idols, guardians overcome and card points, minus 1 for every Dread card.</p>
<h3>Your turn</h3><p>Do ONE main action, then the next explorer goes. When you cannot or do not want to act, pass: you are out until the next round. The round ends when everybody has passed.</p>
<ul><li><b>Play a card</b> for its effect. Artifacts played from your hand cost 1 tablet. Dread cards do nothing.</li>
<li><b>Dig</b>: send an explorer (you have 2) to a free site and pay its travel icons, then gain its loot. Each card you hold pays one travel icon (shown top right) and is discarded: a Jeep also pays a Boot; a Plane pays anything; 2 coins buy a Plane.</li>
<li><b>Discover</b> a hidden ruin: pay 3 compasses (deep ruins: 6) plus its travel. Flip it, take an idol, gain its loot, and a <b>guardian wakes</b> there.</li>
<li><b>Overcome</b> a guardian where your explorer stands: pay its cost, take it (5 points) and keep its boon for one free use later.</li>
<li><b>Buy</b> from the market: items with coins (to the bottom of your deck), artifacts with compasses (they work at once).</li>
<li><b>Research</b>: climb with your magnifier, or let the notebook follow it. Pay the row's cost, gain its bonus. Only the magnifier enters the temple (earlier arrivals score more); there it buys temple tiles. Ties go to the first explorer into the temple.</li></ul>
<h3>Free actions</h3><p>Any time on your turn: use a guardian's boon, or set one idol in a shrine for a one-time boon (idols score 3 either way).</p>
<h3>End of a round</h3><p>Explorers come home. An explorer still sharing a site with a guardian brings back a Dread card. Played cards go to your discard; you keep unplayed cards and draw up to 5. The market shifts: the item and the artifact beside the divide leave, and one more artifact slot opens.</p>
<h3>Solo</h3><p>A rival expedition plays one card after each of your actions: it camps on sites, takes market cards, climbs research and hunts guardians. Beat its score.</p></div>`;
function rulesEl() { const d = document.createElement('div'); d.innerHTML = RULES_HTML + (window.GXT ? '<p><button type="button" class="btn go" data-a="tut">Play the guided round</button></p>' : ''); return d; }
function drawers() {
  GX.drawer('scored', 'Scores', scoresEl()); GX.drawer('logd', 'Log', logEl()); GX.drawer('rulesd', 'How to play', rulesEl());
  GX.onShow = id => { if (id === 'scored') GX.drawer('scored', 'Scores', scoresEl()); if (id === 'logd') GX.drawer('logd', 'Log', logEl()); closeInsp(); };
}
function menu() {
  const b = (label, fn, cls) => { const e = document.createElement('button'); e.type = 'button'; e.className = 'btn ' + (cls || ''); e.textContent = label; e.addEventListener('click', () => { GX.close(); fn(); }); return e; };
  GX.settings({ id: 'setd', title: 'Menu',
    game: S => { S.appendChild(GX.row('This game', [b('Restart', restartGame), b('Title', showTitle), b('Story map', storyOpen)])); },
    sound: S => { S.appendChild(GX.row('Sound effects', GX.onoff(UI.prefs.sound !== false, v => { UI.prefs.sound = v; savePrefs(); }))); S.appendChild(GX.row('Music', [GX.onoff(UI.prefs.music !== false, v => { UI.prefs.music = v; savePrefs(); musicSync(); }), b('Pick songs', () => { try { GXMUS.open(); } catch (e) { } })])); },
    help: S => { S.appendChild(GX.row('Learn', [b('Rules', () => setTimeout(() => GX.show('rulesd'), 50)), b('Tutorial', () => tutStart())])); if (window.GXH) { const w = document.createElement('div'); w.innerHTML = GXH.settingsHTML({ rowClass: 'gx-row', btnClass: 'btn' }); S.appendChild(w); } },
    about: { name: 'Vinegrave', version: '1.0', text: 'An original jungle-expedition game for the Game Night Shelf.' } });
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
  if (m.t === 'res' || m.t === 'temple') return $('#track'); if (m.t === 'pass') return $('#acts .btn'); if (m.t === 'boon') return $(`#extra [data-a=guard][data-k="${m.k}"]`); if (m.t === 'idol') return $(`#extra [data-a=idol][data-k="${m.k}"]`);
  if (m.t === 'ans') { if (G.q.h === 'site' && m.v != null) return $(`.site[data-i="${m.v}"]`); if (G.q.h === 'buy' && m.v != null) return $(`#row .cd[data-r="${m.v}"]`); return $('#qbox'); }
  return null;
}
function helpInit() {
  if (!window.GXH) return;
  const P = (t) => () => `<svg viewBox="0 0 24 24" width="48" height="48"><use href="#s-${t}"/></svg>`;
  GXH.init({ game: 'vinegrave', defaultOn: true,
    steps: { guard: { target: () => $('.site .gd'), title: 'A guardian wakes', text: 'Overcome it for 5 points, or flee at round end with a Dread card.', pic: P('guard') },
      idol: { target: () => $('#extra [data-a=idol]'), title: 'You found an idol', text: 'Worth 3 points. Set it in a shrine for a boon too.', pic: P('idol') },
      'q-exile': { target: () => $('#qbox'), title: 'Exile a card', text: 'Removing Dread cards makes your deck stronger.', pic: P('exile') } },
    rules: [{ title: 'The goal', text: 'Five rounds. Points from research, temple, idols, guardians and cards. Dread costs 1 each.', pic: P('star') },
      { title: 'Travel', text: 'Each card pays one travel icon. A Jeep pays a Boot too; a Plane pays anything; 2 coins buy a Plane.', pic: P('boot') },
      { title: 'Discover', text: 'Three compasses and travel flip a hidden ruin: idol, loot, and a guardian wakes.', pic: P('compass') },
      { phase: 'guard', title: 'Overcome', text: 'Pay the guardian\'s cost while your explorer is there: 5 points and a one-time boon.', pic: P('guard') },
      { phase: 'idol', title: 'Shrines', text: 'One idol a turn into a shrine: an instant boon. It still scores 3.', pic: P('idol') }],
    avoid: '.glow,#acts .btn,#qbox .btn,#insp' });
  GXH.bulb({ el: '#bulbbtn', suggest: () => { if (!myTurn()) return null; const m = VAI.choose(G, 'hard'); const t = moveTarget(m); return t ? { target: () => moveTarget(m), why: VAI.why(G, m) } : null; }, rulesFor: () => helpPhase() });
}
// ---------------------------------------------------------------- music (silent until files exist in media/music)
function musicSlot() { if (!G || !$('#start').hidden) return ['tavern', 0]; if (G.phase === 'over') return [G.winner === UI.humans[0] ? 'victory' : 'defeat', 1]; if (UI.camp && UI.camp.boss) return ['fight', 0]; return ['main', 0]; }
function musicInit() {
  try { const m = {}; (window.VG_MUSIC || []).forEach(n => m[n] = 'url:music/' + n + '.mp3'); if (window.GA) GA.init({ sfx: {}, music: m, key: 'vg' }); } catch (e) { }
  try { GXMUS.init({ key: 'vg', slots: [['tavern', 'Menu'], ['main', 'Expedition'], ['fight', 'Boss'], ['victory', 'Victory'], ['defeat', 'Defeat']], loops: ['tavern', 'main', 'fight'], slot: musicSlot, on: () => UI.prefs.music !== false }); } catch (e) { }
}
function musicSync() { try { GXMUS.sync(); } catch (e) { } }
