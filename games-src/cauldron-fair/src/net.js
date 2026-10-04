// ---------- online play: free peer-to-peer rooms (net/netroom.js over WebRTC) ----------
// The host's page runs the game: it holds the real G (bag orders, the fortune deck, the seed), runs the engine and the computer seats.
// Every other player's page only draws what ITS seat may see: the host sends each peer its own copy made by netStrip(G, seat)
// (src/netstrip.js: a whitelist built on CF.stripView) and the peer sends back small move messages. Drawing is SIMULTANEOUS: every human
// page may send "draw" / "stop" / its answers at any time; the host collects them per seat, checks the sender owns that seat, that the
// message carries the seat's current version number (so a double click cannot draw two chips) and that the move is one of CF.moves(G, seat),
// then applies the host's OWN move object through commit() (the code path of a local click). Who is still drawing is public (seat state).
// A player who leaves is replaced by the computer and gets the seat back when the same browser (same NetRoom.uid()) rejoins via #join-CODE.
// If the host leaves the game is over: the others never hold the hidden state, so nobody can take over fairly (no host migration).
const NET = { on: false, role: null, code: '', room: null, lobby: null, uid: null, peer: null, mySeat: -1, seq: 0, last: 0, timer: null, parts: {}, hostPeer: null, peers: [],
  err: '', busy: false, ready: false, lastRx: 0, gid: null, myName: '', copied: false, opt: null, hostGone: false, remote: 0, rejected: 0, sent: 0, rx: 0,
  seatPeer: [], seatUid: [], away: [], pend: 0, pendT: 0, conn: null, lastSt: '', trace: null, applied: 0, rejLog: [], lastTxt: '', lvl: 'normal', bad: 0 };
const isClient = () => NET.on && NET.role === 'client';
const isHost = () => NET.on && NET.role === 'host';
const netAvail = () => !!NET.lobby;
const cleanName = s => String(s == null ? '' : s).replace(/[<>&"'`]/g, '').trim().slice(0, 24);
function netInit() {
  try { if (typeof NetRoom !== 'undefined' && NetRoom.available()) { NET.lobby = NetRoom.lobby('cauldron'); NET.uid = NetRoom.uid(); NET.myName = NetRoom.name(); const lc = NetRoom.linkCode(); if (lc) { UI.joinCode = lc; UI.onl = true; } } } catch (e) { console.error(e); }
  NET.ready = true;
}
function netIdle() { Object.keys(UI.tm).forEach(k => clearTimeout(UI.tm[k])); UI.tm = {}; G = null; window.G = null; UI.seq++; UI.started = false; UI.pop = null; UI.tip = null; try { closeRS(true); } catch (e) { } const pc = $('#pc'); if (pc) { pc.hidden = true; pc.innerHTML = ''; } try { GX.close(); } catch (e) { } }
async function netJoin(role, code) {
  if (NET.busy || !NET.lobby) return; NET.err = ''; code = NetRoom.cleanCode(code);
  if (!code) { NET.err = 'Type the invite code first.'; netRender(); return; }
  NET.busy = true; netRender(); let room;
  try { if (NET.room) { try { await NET.room.leave(); } catch (e) { } NET.room = null; } room = await NET.lobby.join('cf-' + code); } catch (e) { NET.busy = false; NET.err = 'Could not open the game room.'; netRender(); return; }
  if (G || UI.started) netIdle();
  Object.assign(NET, { busy: false, code, role, on: true, room, mySeat: -1, hostPeer: null, parts: {}, applied: 0, lastRx: 0, gid: null, hostGone: false, peer: room.self, peers: [], opt: null, seatPeer: [], seatUid: [], away: [], pend: 0, lastTxt: '', err: '' });
  document.documentElement.classList.add('net');
  room.presence({ role, uid: NET.uid, name: NET.myName || '' }).catch(() => { });
  room.on('st', onNetState); room.on('act', onNetAct); room.on('rej', onNetRej);
  room.onPeers(onNetPeers); room.onConnection(c => { NET.conn = c; netRender(); });
  UI.netOpen = true; renderStart(); netRender();
  if (role === 'host') netPush(true);
}
async function netLeave() {
  const r = NET.room, was = NET.on;
  Object.assign(NET, { on: false, role: null, room: null, mySeat: -1, hostPeer: null, err: '', hostGone: false, peers: [], gid: null, opt: null, seatPeer: [], seatUid: [], away: [], lastTxt: '' });
  document.documentElement.classList.remove('net');
  try { if (r) await r.leave(); } catch (e) { }
  if (!was) return; UI.netOpen = false; netIdle(); UI.sv = 'title'; renderStart(); netRender();
}
// ---- peers: seats follow the room ----
function onNetPeers(ch) {
  NET.peers = ch.peers || [];
  if (isClient()) {
    const hp = NET.peers.find(p => !p.isMe && p.presence && p.presence.role === 'host'); if (hp) NET.hostPeer = hp.peer;
    if (NET.hostPeer && (ch.left || []).some(p => p.peer === NET.hostPeer)) { NET.hostGone = true; NET.err = G ? 'The host left. The game is over.' : 'The host closed the room.'; UI.netOpen = true; }
  }
  if (isHost()) {
    let chg = false;
    (ch.left || []).forEach(l => { const i = NET.seatPeer.indexOf(l.peer); if (G && i >= 0 && !NET.away[i] && G.phase !== 'over') { netAway(i); chg = true; } });
    (ch.joined || []).forEach(j => { if (j.isMe || !G || !j.by) return; const i = NET.seatUid.findIndex(u => u && u === j.by); if (i >= 0 && NET.seatPeer[i] !== j.peer) { netRestore(i, j.peer); chg = true; } else if (i >= 0 && NET.away[i]) { netRestore(i, j.peer); chg = true; } });
    if (chg && G) { render(); schedule(); }
    netPush(true);
  }
  netRender();
}
function netLog(t) { G.logN++; G.log.push({ i: G.logN, round: G.round, t }); }
// the computer takes the seat (a pending question or draw is answered by schedule())
function netAway(i) { const p = G.players[i]; NET.away[i] = true; NET.seatPeer[i] = null; p.ai = NET.lvl || 'normal'; netLog(p.name + ' left the game: the computer plays for them now.'); }
function netRestore(i, peer) { const p = G.players[i]; NET.seatPeer[i] = peer; NET.away[i] = false; p.ai = null; Object.keys(UI.tm).forEach(k => { clearTimeout(UI.tm[k]); UI.tm[k] = 0; }); netLog(p.name + ' is back and takes their seat again.'); }
// ---- the lobby: players in join order (the host first); seat i goes to player i ----
function netHumans() {
  const hum = [];
  for (const p of NET.peers) { if (hum.length >= 4) break; hum.push({ peer: p.peer, uid: p.isMe ? NET.uid : (p.by || null), nm: cleanName(p.isMe ? NET.myName : (p.presence && p.presence.name)), host: !!p.isMe }); }
  if (!hum.some(x => x.peer === NET.peer)) hum.unshift({ peer: NET.peer, uid: NET.uid, nm: cleanName(NET.myName), host: true });
  const seen = {}; hum.forEach((x, i) => { let n = x.nm || 'Player ' + (i + 1); while (seen[n.toLowerCase()]) n = n.slice(0, 20) + ' ' + (i + 1); seen[n.toLowerCase()] = 1; x.nm = n; });
  return hum;
}
function netPlan() {
  const o = UI.opt || DEF, hum = netHumans(), np = Math.min(4, Math.max(2, o.np || 2, hum.length)), lvl = o.level || 'normal';
  return { hum, np, lvl, sets: o.sets == null ? 1 : o.sets };
}
function netPlayers() {
  if (isClient()) return Array.isArray(NET.opt && NET.opt.pl) ? NET.opt.pl.slice(0, 12).map(p => ({ nm: cleanName(p && p.nm) || 'Player', by: p && typeof p.by === 'string' ? p.by.slice(0, 40) : '', host: !!(p && p.host), seat: p && Number.isInteger(p.seat) ? p.seat : -1 })) : [];
  return NET.peers.map((p, k) => { const by = p.isMe ? NET.uid : (p.by || ''); const i = G ? NET.seatUid.indexOf(by) : -1; return { nm: cleanName(p.isMe ? NET.myName : (p.presence && p.presence.name)) || 'Player', by, host: !!p.isMe, seat: i >= 0 ? i : (G ? -1 : k < 4 ? k : -1) }; });
}
function netOpt() { const pl = netPlan(); return { np: pl.np, lv: pl.lvl, sets: pl.sets, pl: netPlayers() }; }
// host: start (or restart) a game for everyone in the room
function netStart() {
  if (!isHost()) return;
  const pl = netPlan(); const names = pl.hum.map(x => x.nm), ai = pl.hum.map(() => null), chars = pl.hum.map((x, i) => i);
  const used = new Set(names.map(n => n.toLowerCase())); let k = pl.hum.length;
  while (names.length < pl.np) { let ch = names.length, n = PN[ch % 4]; while (used.has(n.toLowerCase())) n += ' ' + (k++); used.add(n.toLowerCase()); names.push(n); ai.push(pl.lvl); chars.push(ch % 4); }
  NET.seatPeer = pl.hum.map(x => x.peer); NET.seatUid = pl.hum.map(x => x.uid); NET.away = []; NET.mySeat = 0; NET.lvl = pl.lvl;
  NET.gid = NetRoom.newCode() + Date.now().toString(36); UI.netOpen = false;
  startNetGame({ players: pl.np, names, ai, chars, setMode: pl.sets });
  netRender(); netPush(true);
}
function startNetGame(o) {
  Object.keys(UI.tm).forEach(k => clearTimeout(UI.tm[k])); UI.tm = {}; UI.seq++;
  G = CF.newGame(Object.assign({ seed: (Date.now() ^ (Math.random() * 1e9)) | 0 }, o)); window.G = G;
  Object.assign(UI, { mode: 'net', cfg: o, started: true, holder: -1, focus: 0, evN: G.evN, over: null, overShown: false, rsOpen: false, rsMode: '', repSeen: 0, shopSel: [], potSig: '', tip: null, tipq: [] });
  UI.coach = { level: 'off', seen: {} }; const st = $('#start'); if (st) st.hidden = true; try { closeRS(true); } catch (e) { } try { GX.close(); } catch (e) { }
  afterApply(true); sndMusic();
}
// ---- state packets: JSON, deflate-compressed, cut into chunks ----
function b64(u8) { let s = ''; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000)); return btoa(s); }
function unb64(s) { const b = atob(s), u = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; }
async function packStr(s) { if (window.CompressionStream) { try { const cs = new CompressionStream('deflate-raw'); const w = cs.writable.getWriter(); w.write(new TextEncoder().encode(s)).catch(() => { }); w.close().catch(() => { }); return 'z' + b64(new Uint8Array(await new Response(cs.readable).arrayBuffer())); } catch (e) { } } return 'j' + b64(new TextEncoder().encode(s)); }
async function unpackStr(s) { const u = unb64(s.slice(1)); if (s[0] === 'z') { const ds = new DecompressionStream('deflate-raw'); const w = ds.writable.getWriter(); w.write(u).catch(() => { }); w.close().catch(() => { }); return await new Response(ds.readable).text(); } return new TextDecoder().decode(u); }
function sendPacked(room, target, txt, seq) { packStr(txt).then(z => { const CH = 3200, n = Math.ceil(z.length / CH); for (let i = 0; i < n; i++) { const d = { s: seq, i, n, d: z.slice(i * CH, (i + 1) * CH) }; (target ? room.sendTo(target, 'st', d) : room.emit('st', d)).catch(() => { }); } }); }
function netPush(force) {
  if (!isHost() || !NET.room) return; const now = Date.now();
  if (!force && now - NET.last < 250) { if (!NET.timer) NET.timer = setTimeout(() => { NET.timer = null; netPush(true); }, 260); return; }
  NET.last = now; const seq = ++NET.seq, room = NET.room, opt = netOpt();
  if (!G || !UI.started) { sendPacked(room, null, JSON.stringify({ code: NET.code, lobby: true, opt }), seq); return; }
  // every peer gets ITS OWN stripped copy: no other bag, no held chips of others, no fortune deck order, no seed
  for (const p of NET.peers) {
    if (p.isMe) continue; const seat = NET.seatPeer.indexOf(p.peer);
    sendPacked(room, p.peer, JSON.stringify({ code: NET.code, gid: NET.gid, seat, opt, g: netStrip(G, seat) }), seq);
  }
}
setInterval(() => { if (isHost()) netPush(true); }, 3000);
function onNetState(msg) {
  NET.rx++; if (!NET.on || msg.isMe || !isClient()) return; const d = msg.data;
  if (!d || typeof d.d !== 'string' || !(d.n > 0 && d.n < 80) || !(d.i >= 0 && d.i < d.n) || !Number.isInteger(d.s)) return;
  if (!NET.hostPeer || msg.peer !== NET.hostPeer) return;
  const k = msg.peer + ':' + d.s, P2 = NET.parts[k] = NET.parts[k] || { n: d.n, got: 0, c: [] };
  if (P2.c[d.i] === undefined) { P2.c[d.i] = d.d; P2.got++; }
  if (P2.got < P2.n) return; delete NET.parts[k];
  Object.keys(NET.parts).forEach(x => { const i = x.lastIndexOf(':'); if (x.slice(0, i) === msg.peer && +x.slice(i + 1) < d.s) delete NET.parts[x]; });
  unpackStr(P2.c.join('')).then(txt => { const o = JSON.parse(txt); if (!o || o.code !== NET.code || !NET.on) return; if (d.s <= NET.applied) return; NET.applied = d.s; NET.lastRx = Date.now(); if (window.NET_TRACE) (NET.trace = NET.trace || []).push(txt); applyNet(o); }).catch(e => { NET.bad++; NET.badE = String(e); });
}
function validState(g) {
  const num = x => Number.isFinite(x);
  return !!g && typeof g === 'object' && Number.isInteger(g.np) && g.np >= 2 && g.np <= 4 && Array.isArray(g.players) && g.players.length === g.np && Array.isArray(g.log) && Array.isArray(g.hist) && Array.isArray(g.events) &&
    (g.phase === 'prep' || g.phase === 'brew' || g.phase === 'eval' || g.phase === 'over') && num(g.logN) && num(g.round) && num(g.evN) && g.supply && typeof g.supply === 'object' && g.sets && typeof g.sets === 'object' &&
    g.players.every(p => p && typeof p === 'object' && Array.isArray(p.bag) && Array.isArray(p.pot) && Array.isArray(p.hold) && Array.isArray(p.side) && Array.isArray(p.newChips) && typeof p.name === 'string' && num(p.vp) && num(p.rubies) && num(p.droplet));
}
function applyNet(o) {
  NET.opt = o.opt && typeof o.opt === 'object' ? o.opt : NET.opt;
  if (o.lobby || !o.g) { if (G || UI.started) { netIdle(); renderStart(); } NET.gid = null; NET.lastTxt = ''; netRender(); return; }
  if (!validState(o.g) || typeof o.gid !== 'string') return;
  const g = o.g, fresh = o.gid !== NET.gid, seat = Number.isInteger(o.seat) && o.seat >= 0 && o.seat < g.np ? o.seat : -1;
  const txt = JSON.stringify(g) + '|' + seat; if (!fresh && txt === NET.lastTxt) { netRender(); return; }
  NET.lastTxt = txt;
  g.players.forEach(p => { p.name = cleanName(p.name) || '?'; });
  G = g; window.G = g; NET.mySeat = seat; NET.pend = 0;
  if (fresh) {
    NET.gid = o.gid; Object.keys(UI.tm).forEach(k => clearTimeout(UI.tm[k])); UI.tm = {}; UI.seq++; try { closeRS(true); } catch (e) { }
    Object.assign(UI, { mode: 'net', started: true, holder: -1, focus: seat >= 0 ? seat : 0, evN: g.evN, over: null, overShown: false, rsOpen: false, rsMode: '', repSeen: g.rep ? g.rep.round : 0, shopSel: [], potSig: '', tip: null });
    UI.coach = { level: 'off', seen: {} }; const st = $('#start'); if (st) st.hidden = true; try { GX.close(); } catch (e) { } UI.netOpen = false;
    placePrompt(); netRender(); render(); sndMusic(); if (g.phase === 'over') { UI.overShown = true; showFinal(); } return;
  }
  playEvents(false);
  netRender(); checkReport(); render(); checkFinal();
}
function onNetRej(msg) { if (!isClient() || msg.peer !== NET.hostPeer) return; const e = msg.data && typeof msg.data.e === 'string' ? msg.data.e.slice(0, 160) : ''; NET.pend = 0; if (e && G && !/moved on/.test(e)) toast(e); }
// ---- client -> host ----
function netAct(m) {
  if (!NET.room || !NET.hostPeer || !G || G.phase === 'over') { toast('Not connected to the host yet.'); return false; }
  if (NET.mySeat < 0) { toast('You are watching this game.'); return false; }
  const p = G.players[NET.mySeat], key = p.ver;
  if (NET.pend === key + 1 && Date.now() - NET.pendT < 2500) return false;            // the last message of this version is still on its way
  NET.pend = key + 1; NET.pendT = Date.now(); NET.sent++;
  NET.room.sendTo(NET.hostPeer, 'act', { m, v: key }).catch(() => { }); UI.potSig = ''; return true;
}
function netRej(peer, e, why) { NET.rejected++; NET.rejLog.push(String(e).slice(0, 40) + (why ? ' ' + String(why).slice(0, 120) : '')); if (NET.rejLog.length > 30) NET.rejLog.shift(); try { NET.room.sendTo(peer, 'rej', { e }).catch(() => { }); } catch (x) { } }
const sigM = m => { const o = {}; Object.keys(m).sort().forEach(k => { if (k !== 'label') o[k] = m[k]; }); return JSON.stringify(o); };
function onNetAct(msg) {
  if (!isHost() || !G || msg.isMe) return; const d = msg.data;
  if (!d || typeof d !== 'object' || Array.isArray(d)) { NET.rejected++; return; }
  let seat = NET.seatPeer.indexOf(msg.peer);
  if (seat < 0) { const i = msg.by ? NET.seatUid.findIndex(u => u && u === msg.by) : -1; if (i >= 0) { netRestore(i, msg.peer); render(); seat = i; } else { NET.rejected++; return; } }
  if (G.phase === 'over') { NET.rejected++; return; }
  let js; try { js = JSON.stringify(d.m); } catch (e) { }
  if (typeof js !== 'string' || js.length > 400 || js[0] !== '{') { NET.rejected++; return; }
  const m = JSON.parse(js);
  if (typeof m.t !== 'string' || m.t.length > 12 || Object.keys(m).length > 6) { NET.rejected++; return; }
  const p = G.players[seat];
  if (p.ai) { netRej(msg.peer, 'That seat is played by the computer.'); return; }
  if (d.v !== p.ver) { netRej(msg.peer, 'The game moved on. Look again and retry.', 'v' + d.v + '/' + p.ver); return; }
  const want = sigM(m), real = CF.moves(G, seat).find(x => sigM(x) === want);
  if (!real) { netRej(msg.peer, 'That move is not allowed now.', want.slice(0, 60)); return; }
  let ok = false; try { ok = commit(seat, stripM(real)); } catch (e) { console.error(e); }
  if (ok) NET.remote++; else netRej(msg.peer, 'That move did not work.');
}
// ---- status, bar badge, lobby, start-screen panel ----
function netStatus() {
  const n = NET.peers.length;
  if (NET.hostGone || NET.err) return { t: NET.err || 'The host left.', c: 'bad', n };
  if (NET.conn === false) return { t: 'Connecting...', c: 'wait', n };
  if (isClient() && !NET.hostPeer) return { t: 'Looking for the host...', c: 'wait', n };
  if (isClient() && NET.lastRx && Date.now() - NET.lastRx > 12000) return { t: 'Reconnecting...', c: 'wait', n };
  if (n <= 1) return { t: 'Looking for players...', c: 'wait', n };
  return { t: n + ' players online', c: 'ok', n };
}
function netDock() {
  const el = $('#netst'); if (!el) return; if (!NET.on) { el.hidden = true; return; } el.hidden = false;
  const s = netStatus(), key = NET.code + '|' + s.t + '|' + s.c + '|' + s.n + '|' + NET.mySeat; if (el._k === key) return; el._k = key;
  el.innerHTML = ''; el.appendChild(h('span.nd.' + s.c)); el.appendChild(h('span.nl', 'Room ' + NET.code.toUpperCase() + ' · ' + s.t));
  el.setAttribute('aria-label', 'Online room ' + NET.code + ': ' + s.t + '. Open the lobby.'); el.title = 'Room ' + NET.code + ' · ' + s.t;
}
function renderNetBadge() { netDock(); }
function netLobbyEl() {
  const host = isHost(), ps = netPlayers(), st = netStatus(), o = host ? netOpt() : (NET.opt || null);
  const box = h('div.nbox', { role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Online game' }, h('button.px.lbx', { 'data-a': 'netclose', type: 'button', 'aria-label': 'Close' }, '×'), h('h2', 'Online game'));
  box.appendChild(h('p', 'Invite code: ', h('b.code#netcode', NET.code)));
  box.appendChild(h('div.invrow', h('input.invlink', { readonly: true, value: NetRoom.inviteLink(NET.code), 'aria-label': 'Invite link' }), h('button.btn.small', { 'data-a': 'netcopy', type: 'button' }, NET.copied ? 'Copied ✓' : 'Copy link')));
  box.appendChild(h('p.sm', 'Friends open the link, or tap Online and type the code. Everybody brews at the same time; nobody can see another bag.'));
  box.appendChild(h('p.sm.nst.' + st.c, st.t));
  if (NET.hostGone) { box.appendChild(h('div.acts2', h('button.btn.alt', { 'data-a': 'netleave', type: 'button' }, 'Back to the start'))); return box; }
  box.appendChild(h('h3', 'Players (' + ps.length + ')'));
  const ul = h('ul.plist');
  ps.forEach((p, i) => { const sIdx = p.seat >= 0 ? p.seat : i; ul.appendChild(h('li', h('span', { html: KIT.avatarSVG(sIdx % 4, { size: 26 }) }), h('b', p.nm || 'Player'), p.by && p.by === NET.uid ? ' (you)' : '', p.host ? ' · host' : '', G && p.seat < 0 ? ' · watching' : '')); });
  if (!ps.length) ul.appendChild(h('li.muted', 'Connecting...'));
  box.appendChild(ul);
  if (o && o.np) {
    const hum = Math.min(ps.length, o.np), ai = Math.max(0, o.np - hum);
    if (host) {
      const oo = UI.opt = UI.opt || Object.assign({}, DEF);
      const seg = (l, key, vals, lab) => h('div.seg', h('span.lbl', l), vals.map(v => h('button.chipb' + (oo[key] === v ? '.on' : ''), { 'data-a': 'netopt', 'data-k': key, 'data-v': v, type: 'button' }, lab ? lab(v) : v)));
      box.appendChild(h('div.opts', seg('Makers', 'np', [2, 3, 4]), seg('Computer level', 'level', ['easy', 'normal', 'hard']), seg('Books', 'sets', [1, 2, 3, 4, 'random'], v => v === 1 ? 'Beginner' : v === 'random' ? 'Random' : 'Set ' + v)));
    }
    box.appendChild(h('p.sm', o.np + ' makers' + (ai > 0 ? ' · ' + ai + ' computer seat' + (ai > 1 ? 's' : '') + ' (' + (o.lv || 'normal') + ')' : '') + '. Empty seats go to the computer; a friend who leaves is replaced by it.'));
  }
  if (host) box.appendChild(h('div.acts2', h('button.btn.go', { 'data-a': 'netstart', type: 'button' }, G && G.phase !== 'over' ? 'Start a new game' : 'Start game'), h('button.btn.alt', { 'data-a': 'netleave', type: 'button' }, 'Close the room')));
  else box.appendChild(h('div', h('p.sm', NET.hostGone ? '' : (G && G.phase !== 'over' ? 'The game is running.' : 'Waiting for the host to start...')), h('div.acts2', h('button.btn.alt', { 'data-a': 'netleave', type: 'button' }, NET.hostGone ? 'Back to the start' : 'Leave'))));
  return box;
}
function netInner() {
  if (!NET.ready) return [h('p.sm.muted', 'Checking online play...')];
  if (!netAvail()) return [h('p.sm.muted', 'Online play needs a recent browser with WebRTC (Chrome, Edge, Firefox or Safari).')];
  return [h('p.sm.muted', 'Free and direct: your browsers connect to each other. Host a game, then send friends the code or the link.'),
    h('div.nrow', h('input#netname', { placeholder: 'Your name', maxlength: 24, autocomplete: 'off', value: NET.myName || '' }), h('button.btn.small', { 'data-a': 'nethost', type: 'button' }, 'Host')),
    h('div.nrow', h('input#joincode', { placeholder: 'Invite code', maxlength: 10, autocomplete: 'off', autocapitalize: 'off', value: UI.joinCode || '' }), h('button.btn.small', { 'data-a': 'netjoin', type: 'button' }, 'Join')),
    NET.busy ? h('p.sm.muted', 'Opening the room...') : null, NET.err ? h('p.sm.warn', NET.err) : null];
}
function netStartScreen(s) {
  const st = netStatus();
  s.appendChild(h('div.scard', h('h1', 'Cauldron Fair'), h('p.sm.nst.' + st.c, st.t), h('div.acts2', h('button.btn', { 'data-a': 'netopen', type: 'button' }, 'Open the lobby'), h('button.btn.alt', { 'data-a': 'netleave', type: 'button' }, isHost() ? 'Close the room' : 'Leave the room'))));
}
function netRender() {
  netDock(); const box = $('#netbox');
  if (box) { if (UI.netOpen && NET.on) { box.hidden = false; const ae = document.activeElement; const keep = ae && box.contains(ae) && ae.tagName === 'INPUT'; if (!keep || !box.firstChild) { box.innerHTML = ''; box.appendChild(netLobbyEl()); } } else { box.hidden = true; box.innerHTML = ''; } }
  const nb = $('#netblock'); if (nb && !(document.activeElement && nb.contains(document.activeElement) && document.activeElement.tagName === 'INPUT')) { nb.innerHTML = ''; add(nb, netInner()); }
  const sn = $('#start .nst'); if (sn && NET.on) { const st = netStatus(); sn.textContent = st.t; sn.className = 'sm nst ' + st.c; }
}
function netCopy() {
  const t = NetRoom.inviteLink(NET.code), sel = () => { const i = document.querySelector('.invlink'); if (i) { i.focus(); i.select(); } };
  const done = () => { NET.copied = true; netRender(); setTimeout(() => { NET.copied = false; netRender(); }, 2500); };
  try { navigator.clipboard.writeText(t).then(done, sel); } catch (e) { sel(); }
}
function netClose() { UI.netOpen = false; netRender(); }
// returns true when the click was an online-play button (or a local-game button that makes no sense online)
function netClick(a, t) {
  switch (a) {
    case 'nethost': { const i = $('#netname'); if (i) NET.myName = NetRoom.setName(i.value); netJoin('host', NetRoom.newCode()); return true; }
    case 'netjoin': { const i = $('#netname'); if (i) NET.myName = NetRoom.setName(i.value); netJoin('client', ($('#joincode') || {}).value); return true; }
    case 'netstart': netStart(); return true;
    case 'netleave': netLeave(); return true;
    case 'netcopy': netCopy(); return true;
    case 'netclose': netClose(); return true;
    case 'netopen': try { GX.close(); } catch (e) { } UI.netOpen = true; netRender(); return true;
    case 'netopt': { if (isHost() && t && t.dataset) { UI.opt = UI.opt || Object.assign({}, DEF); const v = t.dataset.v; UI.opt[t.dataset.k] = (v === 'random' || isNaN(+v)) ? v : +v; netRender(); netPush(true); } return true; }
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
document.addEventListener('keydown', e => {
  const t = e.target;
  if (t && t.id === 'joincode' && e.key === 'Enter') { e.preventDefault(); netClick('netjoin'); return; }
  if (t && t.id === 'netname' && e.key === 'Enter') { e.preventDefault(); netClick('nethost'); return; }
  if (e.key === 'Escape' && UI.netOpen) { e.preventDefault(); netClose(); }
});
document.addEventListener('click', e => { if (UI.netOpen && e.target && e.target.id === 'netbox') netClose(); });
document.addEventListener('toggle', e => { if (e.target && e.target.id === 'onl') UI.onl = e.target.open; }, true);
setInterval(() => { if (!NET.on) return; const st = netStatus(), k = st.t + '|' + NET.peers.length; if (k !== NET.lastSt) { NET.lastSt = k; netRender(); } }, 1000);
