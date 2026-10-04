// ===================== part 5: start screens, events, phone mode, boot =====================
function optObj() { return UI.opt = UI.opt || { scenario: 'g1', role: 0, level: 'normal', abil: [] }; }
function logoSVG() { return '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10.5" fill="#2c5f6c" stroke="#fff4dc" stroke-width="1.4"/><path d="M12 3l2.4 7 6.6 2.4-6.6 1.8L12 21l-2.4-6.8L3 12.4 9.6 10z" fill="#fff4dc"/></svg>'; }
function renderStart() {
  const s = $('#start'); s.hidden = false; s.innerHTML = '';
  const rs = $('#rs'); if (rs && !UI.rsOpen) rs.hidden = true;
  if (typeof NET !== 'undefined' && NET.on) { s.dataset.v = 'net'; netStartScreen(s); return; }
  if (!UI.sv) UI.sv = UI.onl ? 'online' : 'title';
  s.dataset.v = UI.sv;
  if (UI.sv === 'title') { s.appendChild(titleEl()); return; }
  if (ART.title) s.appendChild(h('img.ttl-bg.dim', { src: ART.title, alt: '' }));
  if (UI.sv === 'online') { s.appendChild(onlineEl()); return; }
  s.appendChild(setupEl());
}
function titleEl() {
  const bg = ART.title ? h('img.ttl-bg', { src: ART.title, alt: '' }) : h('div.ttl-bg.ttl-plain'), sv = hasSave();
  return h('div.ttl', bg, h('div.ttl-in', h('h1.logo', h('span.ic', { html: logoSVG() }), h('span', 'Final Approach')), h('p.tag', 'Two seats. Eight dice. One runway.'),
    h('div.tbtns', h('button.tbtn.go', { 'data-a': 'play', type: 'button' }, h('b', 'Play'), h('span', 'fly with a computer crewmate')), h('button.tbtn', { 'data-a': 'online', type: 'button' }, h('b', 'Online'), h('span', 'with a friend, free')), sv ? h('button.tbtn', { 'data-a': 'loadsave', type: 'button' }, h('b', 'Resume'), h('span', 'your saved flight')) : null),
    h('button.tlink', { 'data-a': 'rules', type: 'button' }, 'How to play')));
}
function roleCard(s) {
  const o = optObj(), c = D.crew[s], on = o.role === s;
  return h('button.rcardx' + (on ? '.on' : ''), { type: 'button', 'data-a': 'role', 'data-r': s, style: '--dc:' + SEATC[s], 'aria-pressed': on ? 'true' : 'false' }, h('div.top', ART['crew-' + s] ? h('img', { src: ART['crew-' + s], alt: '' }) : null, h('h3', c.role + ': ' + c.short + (on ? ' ✓' : ''))), h('p', c.story), h('p.enjoy', c.enjoy));
}
// the same extras the story card and the rules list: scenario modules, plus Busy Sky / Tight Corridor when the airport's strip has traffic icons / corridor tabs
function scExtras(sc) { const t = D.tracks[sc.trk]; return sc.mods.map(m => D.mods[m].name).concat(t.sp.some(x => x[1]) ? [D.mods.traffic.name] : []).concat(t.sp.some(x => x[2]) ? [D.mods.turns.name] : []); }
function scLine(sc) { const ex = scExtras(sc).concat(sc.ab ? [sc.ab + ' ability card' + (sc.ab > 1 ? 's' : '')] : []); return D.airports[sc.ap].name + (ex.length ? ' · ' + ex.join(', ') : ' · no extras'); }
function setupEl() {
  const o = optObj(), ph = isPh(), open = !!UI.cfgOpen, sc = FA.scen(o.scenario);
  const head = h('div.shead', h('button.px.sback', { 'data-a': 'title', type: 'button', 'aria-label': 'Back to the title' }, '‹'), h('h2', 'Choose your flight'));
  const sum = h('div.ssum', h('span.sline', D.crew[o.role].role + ' · ' + D.airports[sc.ap].name + ' (' + sc.title + ') · computer ' + o.level), h('button.btn.alt', { 'data-a': 'cfgopen', type: 'button', 'aria-expanded': open ? 'true' : 'false' }, 'Configure'));
  const scn = h('div'); for (const col of ['green', 'yellow', 'red', 'black']) { scn.appendChild(h('div.band', h('i', { style: 'background:' + D.diffs[col].c }), D.diffs[col].name)); const g = h('div.scn'); for (const s of D.scenarios.filter(x => x.col === col)) g.appendChild(h('button.scb' + (o.scenario === s.id ? '.on' : ''), { type: 'button', 'data-a': 'scen', 'data-id': s.id, style: 'border-left-color:' + D.diffs[col].c, 'aria-pressed': o.scenario === s.id ? 'true' : 'false' }, UI.won[s.id] ? h('i.ld', '✓') : null, h('b', D.airports[s.ap].name + ': ' + s.title), h('span', scLine(s)))); scn.appendChild(g); }
  const ab = h('div.seg', h('span.lbl', 'Ability cards'));
  if (sc.ab) { const ids = Object.keys(D.abilities), cur = o.abil && o.abil.length ? o.abil : suggestAbil(sc); ids.forEach(id => ab.appendChild(h('button.chipb' + (cur.includes(id) ? '.on' : ''), { type: 'button', 'data-a': 'abil', 'data-id': id, title: D.abilities[id].text, 'aria-pressed': cur.includes(id) ? 'true' : 'false' }, D.abilities[id].name))); ab.appendChild(h('span.sm', 'Take ' + sc.ab + '. ' + cur.map(a => D.abilities[a].name + ': ' + D.abilities[a].text).join(' ') )); }
  else ab.appendChild(h('span.sm', 'This scenario uses no ability cards.'));
  const cfg = h('div.cfg#cfg', { hidden: ph && !open ? true : null, role: ph ? 'dialog' : null, 'aria-label': ph ? 'Configure the flight' : null },
    ph ? h('div.cfghead', h('b', 'Configure the flight'), h('button.btn', { 'data-a': 'cfgclose', type: 'button' }, 'Done')) : null,
    h('div.rolegrid', roleCard(0), roleCard(1)),
    h('div.seg', h('span.lbl', 'Computer crewmate'), ['easy', 'normal', 'hard'].map(v => h('button.chipb' + (o.level === v ? '.on' : ''), { 'data-a': 'level', 'data-v': v, type: 'button', 'aria-pressed': o.level === v ? 'true' : 'false' }, v))),
    scn, ab, ph ? h('div.cfgfoot', h('button.btn.go', { 'data-a': 'cfgclose', type: 'button' }, 'Done')) : null);
  const go = h('div.sgo', h('button.sbtn.big', { 'data-start': 'vs', 'data-a': 'start', 'data-m': 'vs', type: 'button' }, h('b', 'Start the flight'), h('span', D.airports[sc.ap].name + ': you as ' + D.crew[o.role].role + ' with a computer ' + D.crew[1 - o.role].role.toLowerCase())),
    h('div.sgrid3', h('button.sbtn', { 'data-start': 'guided', 'data-a': 'guided', type: 'button' }, h('b', 'Guided first flight'), h('span', 'Port Alder, one control at a time')), h('button.sbtn', { 'data-start': 'hot', 'data-a': 'start', 'data-m': 'hot', type: 'button' }, h('b', 'Hot-seat'), h('span', 'two people, one device')), h('button.sbtn', { 'data-start': 'ai', 'data-a': 'start', 'data-m': 'watch', type: 'button' }, h('b', 'Watch'), h('span', 'a computer crew flies it'))));
  return h('div.setup.scard', head, ph ? sum : h('p.ssub', 'Pick an airport, your seat and how sharp the computer crewmate is. New to the game? Start with the guided first flight.'), cfg, go);
}
function onlineEl() {
  return h('div.scard.onlv', h('div.shead', h('button.px.sback', { 'data-a': 'title', type: 'button', 'aria-label': 'Back to the title' }, '‹'), h('h2', 'Play online')),
    h('p.ssub', 'Host a flight and send a friend the code or the link. Browsers connect directly; each of you only ever sees your own dice. An empty seat goes to the computer.'),
    h('details.online#onl', { open: true }, h('summary', 'Free, peer to peer'), h('div#netblock', netInner())));
}
function showStart() { try { GX.close(); } catch (e) { } closePass(); const pc = $('#pc'); if (pc) { pc.hidden = true; pc.innerHTML = ''; } UI.sv = 'title'; UI.cfgOpen = false; closeRS(); clearTimeout(UI.tm); UI.seq++; renderStart(); }
function loadSave() { try { const o = JSON.parse(localStorage.getItem('fa_save')); if (!o || !o.G) return false; G = o.G; UI.mode = o.mode; UI.seat = o.seat; UI.holder = o.mode === 'hot' ? -1 : o.seat; UI.cfg = o.cfg; UI.started = true; UI.sel = -1; UI.cof = 0; UI.over = null; UI.overShown = false; UI.coach = { level: UI.prefs.guide || 'off', seen: {}, tip: '' }; UI.rt = G.mods.real ? { left: 60000, last: 0 } : null; const st = $('#start'); if (st) st.hidden = true; render(); sndMusic(); schedule(); return true; } catch (e) { return false; } }
// ---------- events ----------
document.addEventListener('click', ev => {
  const t = ev.target.closest('[data-a],[data-start]'); if (!t) return;
  const a = t.dataset.a, d = t.dataset;
  if (typeof netClick === 'function' && netClick(a, t)) return;
  if (d.start && !a) { newGame(d.start); return; }
  switch (a) {
    case 'die': dieTap(+d.s, d.d === 'p' ? 'p' : +d.d); break;
    case 'slot': slotTap(d.slot); break;
    case 'ready': case 'say': case 'rr': case 'rrpick': case 'antic': case 'adapt': case 'wt': case 'toss': case 'cof': case 'hint': doAction(a, t); break;
    case 'tipmore': tipMore(); break;
    case 'unsel': UI.sel = -1; UI.cof = 0; UI.warnK = null; render(); break;
    case 'debrief': showFinal(); break;
    case 'ckopen': UI.ckOpen = !UI.ckOpen; render(); break;
    case 'recapx': hideRecap(); break;
    case 'altinfo': { const R = altRows()[G.round + G.row0]; toast('Altitude ' + R[0] + ' ft, round ' + (G.round + 1) + ' of ' + (D.rounds - G.row0) + '. Blue rows: ' + name(0) + ' (Pilot) places first; orange rows: ' + name(1) + ' (Co-pilot). A purple dot brings a reroll token.'); break; }
    case 'space': { const i = +d.i, s = trackOf().sp[i]; toast('Space ' + (i + 1) + (i === trackOf().sp.length - 1 ? ' (airport)' : '') + ': ' + G.planes[i] + ' plane' + (G.planes[i] === 1 ? '' : 's') + (s[1] ? ', ' + s[1] + ' traffic die roll' + (s[1] > 1 ? 's' : '') + ' when a round starts here' : '') + (s[2] && G.mods.tabs ? ', corridor: axis must be ' + tabText(s[2]) + ' to leave' : '')); break; }
    case 'take': takeDevice(+d.s); break;
    case 'tipok': tipOk(); break;
    case 'tipoff': UI.coach.level = 'off'; tipOk(); UI.prefs.guide = 'off'; savePrefs(); break;
    case 'rsclose': closeRS(); break;
    case 'again': { const c = UI.cfg || {}; const m = UI.mode, off = UI.coach && UI.coach.level === 'off'; closeRS(); if (m === 'net') { netStart(); break; } newGame(m, { scenario: c.scenario, role: c.role, level: c.level, abil: c.abil, tipsOff: off }); break; }
    case 'nextsc': { const c = UI.cfg || {}, i = D.scenarios.findIndex(s => s.id === c.scenario), n = D.scenarios[(i + 1) % D.scenarios.length]; closeRS(); const m = UI.mode === 'guided' ? 'vs' : UI.mode; UI.opt = Object.assign({}, UI.opt, { scenario: n.id, abil: [] }); newGame(m, { scenario: n.id, role: c.role, level: c.level, abil: [] }); break; }
    case 'play': UI.sv = 'setup'; renderStart(); break;
    case 'online': UI.sv = 'online'; UI.onl = true; renderStart(); break;
    case 'title': UI.sv = 'title'; UI.cfgOpen = false; renderStart(); break;
    case 'cfgopen': UI.cfgOpen = true; renderStart(); break;
    case 'cfgclose': UI.cfgOpen = false; renderStart(); break;
    case 'role': optObj().role = +d.r; renderStart(); break;
    case 'level': optObj().level = d.v; renderStart(); break;
    case 'scen': { const o = optObj(); o.scenario = d.id; o.abil = []; renderStart(); break; }
    case 'abil': { const o = optObj(), sc = FA.scen(o.scenario); let cur = (o.abil && o.abil.length ? o.abil : suggestAbil(sc)).slice(); const i = cur.indexOf(d.id); if (i >= 0) cur.splice(i, 1); else { cur.push(d.id); if (cur.length > sc.ab) cur.shift(); } o.abil = cur; renderStart(); break; }
    case 'menu': showStart(); break;
    case 'start': newGame(d.m); break;
    case 'guided': newGame('guided', { scenario: 'g1', role: 0 }); break;
    case 'rules': GX.show('rulesd'); break;
    case 'save': toast(saveGame() ? 'Flight saved.' : 'Could not save.'); break;
    case 'loadsave': if (!loadSave()) toast('No saved flight.'); break;
    case 'speed': AIDELAY = +d.v; savePrefs(); renderMenu(); break;
    case 'story': UI.prefs.story = d.v === '1'; savePrefs(); renderMenu(); break;
    case 'guide': UI.coach.level = d.v; UI.prefs.guide = d.v; savePrefs(); renderMenu(); coachTick(); break;
    case 'gfx': if (typeof setGfx === 'function') setGfx(d.v); UI.prefs.gfx = d.v; savePrefs(); renderMenu(); break;
    case 'sound': UI.prefs.sound = !UI.prefs.sound; savePrefs(); try { if (window.GA) GA.setSfx(UI.prefs.sound); } catch (e) { } renderMenu(); break;
    case 'music': UI.prefs.music = !UI.prefs.music; savePrefs(); try { if (window.GA) GA.setMusic(UI.prefs.music); } catch (e) { } sndMusic(); renderMenu(); break;
  }
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') { hideRecap(); if (UI.rsOpen && G && G.result) closeRS(); else if (UI.sel !== -1 && UI.sel != null) { UI.sel = -1; UI.cof = 0; render(); } } });
// ---------- phone mode ----------
function applyPhone() {
  const q = /[?&]phone=(\d)/.exec(location.search), w = innerWidth, hh = innerHeight, short = Math.min(w, hh);
  let ph = short <= 500 || (window.matchMedia && matchMedia('(pointer:coarse)').matches && short <= 600);
  if (q) ph = q[1] === '1';
  const r = document.documentElement.classList, was = r.contains('ph');
  r.toggle('ph', ph); document.documentElement.style.setProperty('--dockh', (ph && w < hh ? Math.max(108, Math.min(320, Math.round(hh - 44 - FA.layoutLogical('P', 0, (G && G.mods) || {}, 0).ch * w / 800))) : Math.max(172, Math.min(212, Math.round(hh * .25)))) + 'px'); r.toggle('ph-p', ph && w < hh); r.toggle('ph-l', ph && w >= hh);
  if (was !== ph) { if (G && UI.started) render(); const st = $('#start'); if (st && !st.hidden && !(typeof NET !== 'undefined' && NET.on) && UI.sv === 'setup') renderStart(); }
}
let rzT = 0;
function onResize() { clearTimeout(rzT); rzT = setTimeout(() => { applyPhone(); if (G && UI.started) render(); }, 60); }
// ---------- boot ----------
function boot() {
  GX.init({ key: 'fa' });
  const rules = buildRules(); rules.appendChild(h('h2', { style: 'margin-top:18px' }, 'Reference')); rules.appendChild(buildRef());
  GX.drawer('rulesd', 'How to play', rules, true);
  GX.drawer('logd', 'Log', h('div#logbody'));
  GX.drawer('crewd', 'Flight briefing', h('div#crewbody'));
  GX.drawer('setd', 'Menu', h('div#setbody'));
  GX.onShow = id => { renderDrawers(); };
  prefs(); applyPhone();
  addEventListener('resize', onResize); addEventListener('orientationchange', onResize);
  const bd = $('#board'); if (window.ResizeObserver) new ResizeObserver(() => { if (G && UI.started) { clearTimeout(rzT); rzT = setTimeout(() => { if (G && UI.started) render(); }, 40); } }).observe(bd);
  try { if (window.GA) { const A = typeof GA_DATA !== 'undefined' ? GA_DATA : {}; GA.init({ sfx: A.sfx || {}, music: A.music || {}, key: 'fa' }); GA.setSfx(UI.prefs.sound); GA.setMusic(UI.prefs.music); } } catch (e) { }
  if (typeof pxPerfReg === 'function') pxPerfReg();
  if (typeof pxInit === 'function') pxInit().then(ok => { if (ok) { if (typeof pxPerfReg === 'function') pxPerfReg(); if (G && UI.started) render(); } });
  if (/[?&]seed=(\d+)/.test(location.search)) UI.seed = +RegExp.$1;
  if (typeof netInit === 'function') netInit();
  window.render_game_to_text = () => G ? FA.toText(G, viewSeat()) : 'no game';
  renderStart();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
