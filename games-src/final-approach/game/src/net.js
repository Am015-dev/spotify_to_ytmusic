// ---------- online play: free peer-to-peer rooms (net/netroom.js over WebRTC) ----------
// The host's page runs the game: it holds the real G, runs the rules and the computer seat. The other player's page only draws what ITS seat may
// see: the host sends the peer its own copy made by netStrip(G, seat) (src/netstrip.js, a field-by-field whitelist: the partner's dice values, the
// seed and the random state never leave the host) and the peer sends back small move messages that the host validates against FA.validMoves
// before FA.performMove runs them through the same commit() a local tap uses. Host = the seat chosen in the lobby, the guest takes the other,
// an empty seat goes to the computer. A guest who leaves is replaced by the computer and gets the seat back (same browser uid).
// Host leaves = game over (the guest never holds the hidden state).
const NET = { on: false, role: null, code: '', room: null, lobby: null, uid: null, peer: null, mySeat: -1, seq: 0, last: 0, timer: null, parts: {}, hostPeer: null, peers: [],
  err: '', busy: false, ready: false, lastRx: 0, gid: null, myName: '', copied: false, opt: null, hostGone: false, remote: 0, rejected: 0, sent: 0, rx: 0,
  guestPeer: null, guestUid: null, away: false, conn: null, lastSt: '', applied: 0, rejLog: [], lastTxt: '', bad: 0, hostSeat: 0 };
const isClient = () => NET.on && NET.role === 'client';
const isHost = () => NET.on && NET.role === 'host';
const netAvail = () => !!NET.lobby;
const cleanName = s => String(s == null ? '' : s).replace(/[<>&"'`]/g, '').trim().slice(0, 24);
function netInit() {
  try { if (typeof NetRoom !== 'undefined' && NetRoom.available()) { NET.lobby = NetRoom.lobby('finalapproach'); NET.uid = NetRoom.uid(); NET.myName = NetRoom.name(); const lc = NetRoom.linkCode(); if (lc) { UI.joinCode = lc; UI.onl = true; } } } catch (e) { console.error(e); }
  NET.ready = true;
}
function netIdle() { clearTimeout(UI.tm); G = null; UI.seq++; UI.started = false; UI.sel = -1; UI.cof = 0; closeRS(); closePass(); const pc = $('#pc'); if (pc) { pc.hidden = true; pc.innerHTML = ''; } try { GX.close(); } catch (e) { } const pz = $('#pz'); if (pz) pz.innerHTML = ''; }
async function netJoin(role, code) {
  if (NET.busy || !NET.lobby) return; NET.err = ''; code = NetRoom.cleanCode(code);
  if (!code) { NET.err = 'Type the invite code first.'; netRender(); return; }
  NET.busy = true; netRender(); let room;
  try { if (NET.room) { try { await NET.room.leave(); } catch (e) { } NET.room = null; } room = await NET.lobby.join('fa-' + code); } catch (e) { NET.busy = false; NET.err = 'Could not open the game room.'; netRender(); return; }
  if (G || UI.started) netIdle();
  Object.assign(NET, { busy: false, code, role, on: true, room, mySeat: -1, hostPeer: null, parts: {}, applied: 0, lastRx: 0, gid: null, hostGone: false, peer: room.self, peers: [], opt: null, guestPeer: null, guestUid: null, away: false, err: '', lastTxt: '' });
  document.documentElement.classList.add('net');
  room.presence({ role, uid: NET.uid, name: NET.myName || '' }).catch(() => { });
  room.on('st', onNetState); room.on('act', onNetAct); room.on('rej', onNetRej);
  room.onPeers(onNetPeers); room.onConnection(c => { NET.conn = c; netRender(); });
  UI.netOpen = true; renderStart(); netRender();
  if (role === 'host') netPush(true);
}
async function netLeave() {
  const r = NET.room, was = NET.on;
  Object.assign(NET, { on: false, role: null, room: null, mySeat: -1, hostPeer: null, err: '', hostGone: false, peers: [], gid: null, opt: null, guestPeer: null, guestUid: null, away: false, lastTxt: '' });
  document.documentElement.classList.remove('net'); UI.mode = 'vs';
  try { if (r) await r.leave(); } catch (e) { }
  if (!was) return; UI.netOpen = false; netIdle(); renderStart(); netRender();
}
function onNetPeers(ch) {
  NET.peers = ch.peers || [];
  if (isClient()) {
    const hp = NET.peers.find(p => !p.isMe && p.presence && p.presence.role === 'host'); if (hp) NET.hostPeer = hp.peer;
    if (NET.hostPeer && (ch.left || []).some(p => p.peer === NET.hostPeer)) { NET.hostGone = true; NET.err = G ? 'The host left. The flight is over.' : 'The host closed the room.'; UI.netOpen = true; }
  }
  if (isHost()) {
    let chg = false;
    (ch.left || []).forEach(l => { if (G && l.peer === NET.guestPeer && !NET.away && !G.result) { netAway(); chg = true; } });
    (ch.joined || []).forEach(j => { if (j.isMe || !G || !j.by) return; if (NET.guestUid && j.by === NET.guestUid && (NET.guestPeer !== j.peer || NET.away)) { netRestore(j.peer); chg = true; } });
    if (chg && G) { render(); schedule(); }
    netPush(true);
  }
  netRender();
}
const guestSeat = () => 1 - NET.hostSeat;
function netAway() { NET.away = true; NET.guestPeer = null; const s = guestSeat(); G.ai[s] = (UI.opt && UI.opt.level) || 'normal'; G.logN++; G.log.push({ i: G.logN, r: G.round + 1, t: name(s) + ' left: the computer flies the seat now.' }); }
function netRestore(peer) { const s = guestSeat(); NET.guestPeer = peer; NET.away = false; G.ai[s] = null; G.logN++; G.log.push({ i: G.logN, r: G.round + 1, t: name(s) + ' is back in the seat.' }); }
function netGuest() { const g = NET.peers.find(p => !p.isMe); return g ? { peer: g.peer, uid: g.by || null, nm: cleanName(g.presence && g.presence.name) } : null; }
function netPlayers() {
  if (isClient()) return Array.isArray(NET.opt && NET.opt.pl) ? NET.opt.pl.slice(0, 4).map(p => ({ nm: cleanName(p && p.nm) || 'Player', by: p && typeof p.by === 'string' ? p.by.slice(0, 40) : '', host: !!(p && p.host), seat: p && Number.isInteger(p.seat) ? p.seat : -1 })) : [];
  const out = [{ nm: cleanName(NET.myName) || 'Host', by: NET.uid, host: true, seat: NET.hostSeat }]; const g = netGuest(); if (g) out.push({ nm: g.nm || 'Guest', by: g.uid || '', host: false, seat: 1 - NET.hostSeat }); return out;
}
function netOpt() { const o = UI.opt || {}; return { scenario: o.scenario || 'g1', level: o.level || 'normal', role: Number.isInteger(o.role) ? o.role : 0, pl: netPlayers() }; }
function netStart() {
  if (!isHost()) return; const o = optObj(); NET.hostSeat = o.role === 1 ? 1 : 0; const g = netGuest(); NET.guestPeer = g ? g.peer : null; NET.guestUid = g ? g.uid : null; NET.away = !g;
  const ai = [null, null]; if (!g) ai[1 - NET.hostSeat] = o.level || 'normal'; NET.mySeat = NET.hostSeat;
  NET.gid = NetRoom.newCode() + Date.now().toString(36); UI.netOpen = false;
  newGame('net', { scenario: o.scenario, role: NET.hostSeat, level: o.level, abil: o.abil, ai });
  if (g && g.nm) G.names[1 - NET.hostSeat] = cleanName(g.nm) || G.names[1 - NET.hostSeat]; if (NET.myName) G.names[NET.hostSeat] = cleanName(NET.myName) || G.names[NET.hostSeat];
  UI.mode = 'net'; netRender(); netPush(true); render();
}
// ---- state packets: JSON, deflate-compressed, cut into chunks ----
function b64(u8) { let s = ''; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000)); return btoa(s); }
function unb64(s) { const b = atob(s), u = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; }
async function packStr(s) { if (window.CompressionStream) { try { const cs = new CompressionStream('deflate-raw'); const w = cs.writable.getWriter(); w.write(new TextEncoder().encode(s)).catch(() => { }); w.close().catch(() => { }); return 'z' + b64(new Uint8Array(await new Response(cs.readable).arrayBuffer())); } catch (e) { } } return 'r' + b64(new TextEncoder().encode(s)); }
async function unpackStr(s) { const u = unb64(s.slice(1)); if (s[0] === 'z') { const ds = new DecompressionStream('deflate-raw'); const w = ds.writable.getWriter(); w.write(u).catch(() => { }); w.close().catch(() => { }); return await new Response(ds.readable).text(); } return new TextDecoder().decode(u); }
function sendPacked(room, target, txt, seq) { packStr(txt).then(z => { const CH = 3200, n = Math.ceil(z.length / CH); for (let i = 0; i < n; i++) { const d = { s: seq, i, n, d: z.slice(i * CH, (i + 1) * CH) }; (target ? room.sendTo(target, 'st', d) : room.emit('st', d)).catch(() => { }); } }); }
function netPush(force) {
  if (!isHost() || !NET.room) return; const now = Date.now();
  if (!force && now - NET.last < 250) { if (!NET.timer) NET.timer = setTimeout(() => { NET.timer = null; netPush(true); }, 260); return; }
  NET.last = now; const seq = ++NET.seq, room = NET.room, opt = netOpt();
  if (!G || !UI.started) { sendPacked(room, null, JSON.stringify({ code: NET.code, lobby: true, opt }), seq); return; }
  for (const p of NET.peers) { if (p.isMe) continue; const seat = p.peer === NET.guestPeer ? guestSeat() : -1; sendPacked(room, p.peer, JSON.stringify({ code: NET.code, gid: NET.gid, seat, opt, g: netStrip(G, seat) }), seq); }
}
setInterval(() => { if (isHost()) netPush(true); }, 3000);
function onNetState(msg) {
  NET.rx++; if (!NET.on || msg.isMe || !isClient()) return; const d = msg.data;
  if (!d || typeof d.d !== 'string' || !(d.n > 0 && d.n < 80) || !(d.i >= 0 && d.i < d.n) || !Number.isInteger(d.s)) return;
  if (!NET.hostPeer || msg.peer !== NET.hostPeer) return;
  const k = msg.peer + ':' + d.s, P = NET.parts[k] = NET.parts[k] || { n: d.n, got: 0, c: [] };
  if (P.c[d.i] === undefined) { P.c[d.i] = d.d; P.got++; }
  if (P.got < P.n) return; delete NET.parts[k];
  Object.keys(NET.parts).forEach(x => { const i = x.lastIndexOf(':'); if (x.slice(0, i) === msg.peer && +x.slice(i + 1) < d.s) delete NET.parts[x]; });
  unpackStr(P.c.join('')).then(txt => { const o = JSON.parse(txt); if (!o || o.code !== NET.code || !NET.on) return; if (d.s <= NET.applied) return; NET.applied = d.s; NET.lastRx = Date.now(); applyNet(o); }).catch(e => { NET.bad++; NET.badE = String(e); });
}
function validState(g) {
  const num = x => Number.isFinite(x), arr = Array.isArray;
  return !!g && typeof g === 'object' && typeof g.sid === 'string' && !!D.tracks[g.tk] && arr(g.planes) && g.planes.length === D.tracks[g.tk].sp.length && arr(g.dice) && g.dice.length === 2 && g.dice.every(x => arr(x) && x.length === 4) && arr(g.keys) && g.slots && typeof g.slots === 'object' && g.pl && typeof g.pl === 'object' && arr(g.ready) && arr(g.say) && arr(g.intern) && arr(g.log) &&
    (g.phase === 'brief' || g.phase === 'place' || g.phase === 'over') && num(g.round) && num(g.coffee) && num(g.rrHand) && g.mods && typeof g.mods === 'object';
}
function applyNet(o) {
  NET.opt = o.opt && typeof o.opt === 'object' ? o.opt : NET.opt;
  if (o.lobby || !o.g) { if (G || UI.started) { netIdle(); renderStart(); } NET.gid = null; NET.lastTxt = ''; netRender(); return; }
  if (!validState(o.g) || typeof o.gid !== 'string') return;
  const g = o.g, fresh = o.gid !== NET.gid, seat = Number.isInteger(o.seat) && (o.seat === 0 || o.seat === 1) ? o.seat : -1;
  const txt = JSON.stringify(g) + '|' + seat; if (!fresh && txt === NET.lastTxt) { netRender(); return; }
  NET.lastTxt = txt; const prev = fresh ? null : G;
  g.names = (g.names || []).map(n => cleanName(n) || '?');
  G = g; NET.mySeat = seat; NET.hostSeat = seat >= 0 ? 1 - seat : 0;
  if (fresh) {
    NET.gid = o.gid; clearTimeout(UI.tm); UI.seq++; closeRS();
    Object.assign(UI, { sel: -1, cof: 0, hint: null, over: null, overShown: false, started: true, mode: 'net', seat: seat, holder: seat, rrm: [false, false, false, false], lastPlace: null });
    UI.coach = { level: 'off', seen: {}, tip: '' }; UI.rt = null;
    const st = $('#start'); if (st) st.hidden = true; try { GX.close(); } catch (e) { } UI.netOpen = false;
    netRender(); render(); sndMusic(); if (g.result) onEnd(); return;
  }
  if (prev) { const n0 = Object.keys(prev.slots).length, n1 = Object.keys(g.slots).length; if (n1 > n0) snd('dieland'); if (g.round !== prev.round && !g.result) { snd('round'); UI.sel = -1; UI.cof = 0; } if (g.phase === 'place' && prev.phase === 'brief') snd('roll'); if (prev.pend && !g.pend) { UI.rrm = [false, false, false, false]; } if (UI.sel !== -1 && typeof UI.sel === 'number' && g.dice[seat] && g.dice[seat][UI.sel] && g.dice[seat][UI.sel].u) UI.sel = -1; }
  netRender(); render();
  if (g.result && !UI.overShown) onEnd();
}
function onNetRej(msg) { if (!isClient() || msg.peer !== NET.hostPeer) return; const e = msg.data && typeof msg.data.e === 'string' ? msg.data.e.slice(0, 160) : ''; if (e && G) toast(e); }
// ---- client -> host: one small move object
function netAct(m) {
  if (!NET.room || !NET.hostPeer || !G || G.result) { toast('Not connected to the host yet.'); return; }
  if (NET.mySeat < 0) { toast('You are watching this flight.'); return; }
  NET.sent++; NET.room.sendTo(NET.hostPeer, 'act', { m }).catch(() => { });
}
function netRej(peer, e, why) { NET.rejected++; NET.rejLog.push(String(e).slice(0, 40) + (why ? ' ' + String(why).slice(0, 120) : '')); if (NET.rejLog.length > 30) NET.rejLog.shift(); try { NET.room.sendTo(peer, 'rej', { e }).catch(() => { }); } catch (x) { } }
const MV_T = ['say', 'ready', 'place', 'toss', 'rr', 'rrpick', 'antic', 'adapt', 'wt', 'wt2'];
function onNetAct(msg) {
  if (!isHost() || !G || msg.isMe) return; const d = msg.data;
  if (!d || typeof d !== 'object' || Array.isArray(d)) { NET.rejected++; return; }
  if (msg.peer !== NET.guestPeer) { const by = msg.by; if (by && NET.guestUid && by === NET.guestUid) netRestore(msg.peer); else { NET.rejected++; return; } }
  const seat = guestSeat();
  let js; try { js = JSON.stringify(d.m); } catch (e) { }
  if (typeof js !== 'string' || js.length > 120 || js[0] !== '{') { NET.rejected++; return; }
  const m = JSON.parse(js);
  if (typeof m.t !== 'string' || !MV_T.includes(m.t) || Object.keys(m).some(k => !['t', 'c', 'd', 'to', 'm'].includes(k))) { NET.rejected++; return; }
  if (G.ai[seat]) { netRej(msg.peer, 'That seat is played by the computer.'); return; }
  // rebuild the move from checked fields only (nothing from the message is passed on as it came)
  const dOk = x => x === 'p' || (Number.isInteger(x) && x >= 0 && x <= 3);
  let mv = null;
  if (m.t === 'say') { if (typeof m.c === 'string' && FA.SAYS.includes(m.c)) mv = { t: 'say', c: m.c }; }
  else if (m.t === 'place') { if (dOk(m.d) && typeof m.to === 'string' && G.keys.includes(m.to) && Number.isInteger(m.c || 0) && Math.abs(m.c || 0) <= 3) mv = { t: 'place', d: m.d, to: m.to, c: m.c || 0 }; }
  else if (m.t === 'toss' || m.t === 'antic' || m.t === 'adapt' || m.t === 'wt' || m.t === 'wt2') { if (dOk(m.d)) mv = { t: m.t, d: m.d }; }
  else if (m.t === 'rrpick') { if (Array.isArray(m.m) && m.m.length === 4) mv = { t: 'rrpick', m: m.m.map(x => !!x) }; }
  else mv = { t: m.t };
  if (!mv) { netRej(msg.peer, 'Bad move.'); return; }
  if (!FA.validMoves(G, seat).some(x => x.t === mv.t)) { netRej(msg.peer, 'That move is not allowed right now.', js); return; }
  let ok = false; try { ok = commit(seat, mv); } catch (e) { console.error(e); }
  if (ok) NET.remote++; else netRej(msg.peer, 'That move did not work.');
}
// ---- status, bar badge, lobby, start-screen panel
function netStatus() {
  const n = NET.peers.length;
  if (NET.hostGone || NET.err) return { t: NET.err || 'The host left.', c: 'bad', n };
  if (NET.conn === false) return { t: 'Connecting...', c: 'wait', n };
  if (isClient() && !NET.hostPeer) return { t: 'Looking for the host...', c: 'wait', n };
  if (isClient() && NET.lastRx && Date.now() - NET.lastRx > 12000) return { t: 'Reconnecting...', c: 'wait', n };
  if (n <= 1) return { t: 'Waiting for your crewmate...', c: 'wait', n };
  return { t: n + ' crew online', c: 'ok', n };
}
function netDock() {
  const el = $('#netst'); if (!el) return; if (!NET.on) { el.hidden = true; return; } el.hidden = false;
  const s = netStatus(), key = NET.code + '|' + s.t + '|' + s.c + '|' + s.n + '|' + NET.mySeat; if (el._k === key) return; el._k = key;
  el.innerHTML = ''; el.appendChild(h('span.nd.' + s.c)); el.appendChild(h('span.nl', 'Room ' + NET.code.toUpperCase() + ' · ' + s.t)); el.appendChild(h('span.ns', String(s.n)));
  el.setAttribute('aria-label', 'Online room ' + NET.code + ': ' + s.t + '. Open the lobby.'); el.title = 'Room ' + NET.code + ' · ' + s.t;
}
function netLobbyEl() {
  const host = isHost(), ps = netPlayers(), st = netStatus(), o = host ? netOpt() : (NET.opt || null);
  const box = h('div.nbox', { role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Online flight' }, h('button.px.lbx', { 'data-a': 'netclose', type: 'button', 'aria-label': 'Close' }, '×'), h('h2', 'Online flight'));
  box.appendChild(h('p', 'Invite code: ', h('b.code#netcode', NET.code)));
  box.appendChild(h('div.invrow', h('input.invlink', { readonly: true, value: NetRoom.inviteLink(NET.code), 'aria-label': 'Invite link' }), h('button.btn.small', { 'data-a': 'netcopy', type: 'button' }, NET.copied ? 'Copied ✓' : 'Copy link')));
  box.appendChild(h('p.sm', 'Your friend opens the link, or taps Play online and types the code. Nobody can see the other crew member’s dice.'));
  box.appendChild(h('p.sm.nst.' + st.c, st.t));
  if (NET.hostGone) { box.appendChild(h('div.acts', h('button.btn.alt', { 'data-a': 'netleave', type: 'button' }, 'Back to the start'))); return box; }
  box.appendChild(h('h3', 'Crew (' + ps.length + ')'));
  const ul = h('ul.plist'); ps.forEach(p => ul.appendChild(h('li', h('b', p.nm || 'Player'), p.by && p.by === NET.uid ? ' (you)' : '', p.host ? ' · host' : '', p.seat >= 0 ? ' · ' + SEATN[p.seat] : ''))); if (!ps.length) ul.appendChild(h('li.muted', 'Connecting...')); box.appendChild(ul);
  if (host) {
    const oo = optObj(), sc = FA.scen(oo.scenario);
    box.appendChild(h('div.seg', h('span.lbl', 'Your seat'), [0, 1].map(v => h('button.chipb' + (oo.role === v ? '.on' : ''), { 'data-a': 'netopt', 'data-k': 'role', 'data-v': v, type: 'button' }, SEATN[v]))));
    box.appendChild(h('div.seg', h('span.lbl', 'Computer level'), ['easy', 'normal', 'hard'].map(v => h('button.chipb' + (oo.level === v ? '.on' : ''), { 'data-a': 'netopt', 'data-k': 'level', 'data-v': v, type: 'button' }, v))));
    box.appendChild(h('div.seg', h('span.lbl', 'Airport'), h('select#netsc', { 'aria-label': 'Scenario' }, D.scenarios.map(s => h('option', { value: s.id, selected: s.id === sc.id ? true : null }, D.airports[s.ap].name + ': ' + s.title)))));
    box.appendChild(h('p.sm', 'If nobody joins, the other seat is flown by the computer. A friend who leaves is replaced by it.'));
    box.appendChild(h('div.acts', h('button.btn.go', { 'data-a': 'netstart', type: 'button' }, G && !G.result ? 'Start a new flight' : 'Start the flight'), h('button.btn.alt', { 'data-a': 'netleave', type: 'button' }, 'Close the room')));
  } else {
    if (o && o.scenario) { const sc = FA.scen(o.scenario); if (sc) box.appendChild(h('p.sm', 'Flight: ' + D.airports[sc.ap].name + ', ' + sc.title + '.')); }
    box.appendChild(h('div', h('p.sm', G && !G.result ? 'The flight is running.' : 'Waiting for the host to start...'), h('div.acts', h('button.btn.alt', { 'data-a': 'netleave', type: 'button' }, 'Leave'))));
  }
  return box;
}
function netInner() {
  if (!NET.ready) return [h('p.sm.muted', 'Checking online play...')];
  if (!netAvail()) return [h('p.sm.muted', 'Online play needs a recent browser with WebRTC (Chrome, Edge, Firefox or Safari).')];
  return [h('p.sm.muted', 'Free and direct: your browsers connect to each other. Host a flight, then send your friend the code or the link.'),
    h('div.nrow', h('input#netname', { placeholder: 'Your name', maxlength: 24, autocomplete: 'off', value: NET.myName || '' }), h('button.btn.small', { 'data-a': 'nethost', type: 'button' }, 'Host')),
    h('div.nrow', h('input#joincode', { placeholder: 'Invite code', maxlength: 10, autocomplete: 'off', autocapitalize: 'off', value: UI.joinCode || '' }), h('button.btn.small', { 'data-a': 'netjoin', type: 'button' }, 'Join')),
    NET.busy ? h('p.sm.muted', 'Opening the room...') : null, NET.err ? h('p.sm.warn', NET.err) : null];
}
function netStartScreen(s) {
  const st = netStatus();
  s.appendChild(h('div.scard.onlv', h('h2', 'Online flight'), h('p.sm.nst.' + st.c, st.t), h('div.acts', h('button.btn', { 'data-a': 'netopen', type: 'button' }, 'Open the lobby'), h('button.btn.alt', { 'data-a': 'netleave', type: 'button' }, isHost() ? 'Close the room' : 'Leave the room'))));
}
function netRender() {
  netDock(); const box = $('#netbox');
  if (box) { if (UI.netOpen && NET.on) { box.hidden = false; const ae = document.activeElement; const keep = ae && box.contains(ae) && (ae.tagName === 'INPUT' || ae.tagName === 'SELECT'); if (!keep || !box.firstChild) { box.innerHTML = ''; box.appendChild(netLobbyEl()); } } else { box.hidden = true; box.innerHTML = ''; } }
  const nb = $('#netblock'); if (nb && !(document.activeElement && nb.contains(document.activeElement) && document.activeElement.tagName === 'INPUT')) { nb.innerHTML = ''; add(nb, netInner()); }
  const sn = $('#start .nst'); if (sn && NET.on) { const st = netStatus(); sn.textContent = st.t; sn.className = 'sm nst ' + st.c; }
}
function netCopy() {
  const t = NetRoom.inviteLink(NET.code), sel = () => { const i = document.querySelector('.invlink'); if (i) { i.focus(); i.select(); } };
  const done = () => { NET.copied = true; netRender(); setTimeout(() => { NET.copied = false; netRender(); }, 2500); };
  try { navigator.clipboard.writeText(t).then(done, sel); } catch (e) { sel(); }
}
function netClose() { UI.netOpen = false; netRender(); }
function netRenderHook() { netDock(); }
function netClick(a, t) {
  switch (a) {
    case 'nethost': { const i = $('#netname'); if (i) NET.myName = NetRoom.setName(i.value); netJoin('host', NetRoom.newCode()); return true; }
    case 'netjoin': { const i = $('#netname'); if (i) NET.myName = NetRoom.setName(i.value); netJoin('client', ($('#joincode') || {}).value); return true; }
    case 'netstart': netStart(); return true;
    case 'netleave': netLeave(); return true;
    case 'netcopy': netCopy(); return true;
    case 'netclose': netClose(); return true;
    case 'netopen': try { GX.close(); } catch (e) { } UI.netOpen = true; netRender(); return true;
    case 'netopt': { if (isHost() && t && t.dataset) { const o = optObj(); o[t.dataset.k] = isNaN(+t.dataset.v) ? t.dataset.v : +t.dataset.v; netRender(); netPush(true); } return true; }
  }
  if (!NET.on) return false;
  switch (a) {
    case 'again': if (isHost()) netStart(); return true;
    case 'menu': try { GX.close(); } catch (e) { } UI.netOpen = true; netRender(); return true;
    case 'start': case 'guided': case 'save': case 'loadsave': return true;
  }
  return false;
}
document.addEventListener('input', e => { const t = e.target; if (!t) return; if (t.id === 'joincode') UI.joinCode = t.value; if (t.id === 'netname' && typeof NetRoom !== 'undefined') NET.myName = NetRoom.setName(t.value); });
document.addEventListener('change', e => { const t = e.target; if (t && t.id === 'netsc' && isHost()) { const o = optObj(); o.scenario = t.value; o.abil = []; netPush(true); } });
document.addEventListener('keydown', e => {
  const t = e.target;
  if (t && t.id === 'joincode' && e.key === 'Enter') { e.preventDefault(); netClick('netjoin'); return; }
  if (t && t.id === 'netname' && e.key === 'Enter') { e.preventDefault(); netClick('nethost'); return; }
  if (e.key === 'Escape' && UI.netOpen) { e.preventDefault(); netClose(); }
});
document.addEventListener('click', e => { if (UI.netOpen && e.target && e.target.id === 'netbox') netClose(); });
document.addEventListener('toggle', e => { if (e.target && e.target.id === 'onl') UI.onl = e.target.open; }, true);
setInterval(() => { if (!NET.on) return; const st = netStatus(), k = st.t + '|' + NET.peers.length; if (k !== NET.lastSt) { NET.lastSt = k; netRender(); } }, 1000);
