// ---------- online play: free peer-to-peer rooms (net/netroom.js over WebRTC) ----------
// The host's page runs the dive: it holds the real G, runs the engine and the computer seats. Every other player's page only draws what ITS
// seat may see: the host sends each peer its own copy of the state made by netStrip(G, seat) (src/netstrip.js: a whitelist built on
// LD.stripView; other hands, the drone's face-down cards, secret predictions, other seats' pending votes and passes, the deck order and the
// seed are never copied) and the peer sends back small move messages that the host checks (the sender owns a human seat, and the move is
// one of LD.moves(G, seat)) before LD.apply runs them. Seats go to the players in join order (host = seat 0, up to 5); the other seats are
// computers. A player who leaves is replaced by the computer and gets the seat back when the same browser (same uid) rejoins. If the host
// leaves the game is over: the others never hold the hidden state, so nobody can take over fairly (no host migration).
// There is NO chat: only the in-game pings and four neutral emotes that carry no card information.
const NET = { on: false, role: null, code: '', room: null, lobby: null, uid: null, peer: null, mySeat: -1, seq: 0, last: 0, timer: null, parts: {}, hostPeer: null, peers: [],
  err: '', busy: false, ready: false, lastRx: 0, gid: null, myName: '', copied: false, opt: null, hostGone: false, remote: 0, rejected: 0, sent: 0, rx: 0,
  seatPeer: [], seatUid: [], away: [], pend: -1, pendT: 0, conn: null, lastSt: '', trace: null, applied: 0, rejLog: [], lastTxt: '', lvl: 'normal', bad: 0, evq: [] };
const isClient = () => NET.on && NET.role === 'client';
const isHost = () => NET.on && NET.role === 'host';
const netAvail = () => !!NET.lobby;
const cleanName = s => String(s == null ? '' : s).replace(/[<>&"'`]/g, '').trim().slice(0, 24);
function netInit() {
  try { if (typeof NetRoom !== 'undefined' && NetRoom.available()) { NET.lobby = NetRoom.lobby('lantern-dive'); NET.uid = NetRoom.uid(); NET.myName = NetRoom.name(); const lc = NetRoom.linkCode(); if (lc) { UI.joinCode = lc; UI.onl = true; } } } catch (e) { console.error(e); }
  NET.ready = true;
}
function netIdle() { clearTimeout(UI.tm); G = null; UI.seq++; UI.rq = []; UI.started = false; UI.cards = []; UI.pop = null; UI.fz = null; UI.busy = false; UI.sel = []; UI.twin = false; closePop(); try { closeRS(); } catch (e) { } const pc = $('#pc'); if (pc) { pc.hidden = true; pc.innerHTML = ''; } try { GX.close(); } catch (e) { } }
async function netJoin(role, code) {
  if (NET.busy || !NET.lobby) return; NET.err = ''; code = NetRoom.cleanCode(code);
  if (!code) { NET.err = 'Type the invite code first.'; netRender(); return; }
  NET.busy = true; netRender(); let room;
  try { if (NET.room) { try { await NET.room.leave(); } catch (e) { } NET.room = null; } room = await NET.lobby.join('ld-' + code); } catch (e) { NET.busy = false; NET.err = 'Could not open the game room.'; netRender(); return; }
  if (G || UI.started) netIdle();
  Object.assign(NET, { busy: false, code, role, on: true, room, mySeat: -1, hostPeer: null, parts: {}, applied: 0, lastRx: 0, gid: null, hostGone: false, peer: room.self, peers: [], opt: null, seatPeer: [], seatUid: [], away: [], pend: -1, lastTxt: '', err: '', evq: [] });
  document.documentElement.classList.add('net');
  room.presence({ role, uid: NET.uid, name: NET.myName || '' }).catch(() => { });
  room.on('st', onNetState); room.on('act', onNetAct); room.on('rej', onNetRej); room.on('em', onNetEmote);
  room.onPeers(onNetPeers); room.onConnection(c => { NET.conn = c; netRender(); });
  UI.netOpen = true; renderStart(); netRender();
  if (role === 'host') netPush(true);
}
async function netLeave() {
  const r = NET.room, was = NET.on;
  Object.assign(NET, { on: false, role: null, room: null, mySeat: -1, hostPeer: null, err: '', hostGone: false, peers: [], gid: null, opt: null, seatPeer: [], seatUid: [], away: [], lastTxt: '', evq: [] });
  document.documentElement.classList.remove('net');
  try { if (r) await r.leave(); } catch (e) { }
  if (!was) return; UI.netOpen = false; netIdle(); renderStart(); netRender();
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
function netLog(t) { G.logN++; G.log.push({ i: G.logN, att: G.att, t }); }
// the computer takes the seat (if it had not chosen yet, schedule() makes its pick)
function netAway(i) { const p = G.players[i]; NET.away[i] = true; NET.seatPeer[i] = null; p.ai = NET.lvl || 'normal'; netLog(p.name + ' left the game: the computer plays for them now.'); }
function netRestore(i, peer) { const p = G.players[i]; NET.seatPeer[i] = peer; NET.away[i] = false; p.ai = null; netLog(p.name + ' is back and takes their seat again.'); }
// ---- the lobby: players in join order (the host first); seat i goes to player i ----
function netHumans() {
  const hum = [];
  for (const p of NET.peers) { if (hum.length >= 5) break; hum.push({ peer: p.peer, uid: p.isMe ? NET.uid : (p.by || null), nm: cleanName(p.isMe ? NET.myName : (p.presence && p.presence.name)), host: !!p.isMe }); }
  if (!hum.some(h => h.peer === NET.peer)) hum.unshift({ peer: NET.peer, uid: NET.uid, nm: cleanName(NET.myName), host: true });
  const seen = {}; hum.forEach((h, i) => { let n = h.nm || 'Player ' + (i + 1); while (seen[n.toLowerCase()]) n = n.slice(0, 20) + ' ' + (i + 1); seen[n.toLowerCase()] = 1; h.nm = n; });
  return hum;
}
function netPlan() {
  const o = UI.opt || DEF, hum = netHumans(), np = Math.min(5, Math.max(2, o.np || 2, hum.length)), lvl = o.level || 'normal';
  return { hum, np, lvl, mission: missionFrom(o), timer: !!o.timer };
}
function netPlayers() { // raw list for the lobby (and for clients inside the packet)
  if (isClient()) return Array.isArray(NET.opt && NET.opt.pl) ? NET.opt.pl.slice(0, 12).map(p => ({ nm: cleanName(p && p.nm) || 'Player', by: p && typeof p.by === 'string' ? p.by.slice(0, 40) : '', host: !!(p && p.host), seat: p && Number.isInteger(p.seat) ? p.seat : -1 })) : [];
  return NET.peers.map((p, k) => { const by = p.isMe ? NET.uid : (p.by || ''); const i = G ? NET.seatUid.indexOf(by) : -1; return { nm: cleanName(p.isMe ? NET.myName : (p.presence && p.presence.name)) || 'Player', by, host: !!p.isMe, seat: i >= 0 ? i : (G ? -1 : k < 5 ? k : -1) }; });
}
function netOpt() { const pl = netPlan(); return { np: pl.np, lv: pl.lvl, pl: netPlayers(), mi: missionLine(UI.opt || DEF) }; }
// host: start (or restart) a game for everyone in the room
function netStart() {
  if (!isHost()) return;
  const pl = netPlan(); const players = pl.hum.map(h => ({ name: h.nm, ai: null }));
  const used = new Set(players.map(p => p.name.toLowerCase())); let k = 1;
  while (players.length < pl.np) { let n = D.names[k++ % 5]; while (used.has(n.toLowerCase())) n += ' ' + k; used.add(n.toLowerCase()); players.push({ name: n, ai: pl.lvl }); }
  NET.seatPeer = pl.hum.map(h => h.peer); NET.seatUid = pl.hum.map(h => h.uid); NET.away = []; NET.mySeat = 0; NET.lvl = pl.lvl; NET.evq = [];
  NET.gid = NetRoom.newCode() + Date.now().toString(36); UI.netOpen = false;
  newGame('net', { players, np: pl.np, level: pl.lvl, mission: pl.mission, timer: pl.timer });
  netRender(); netPush(true);
}
// ---- state packets: JSON, deflate-compressed, cut into chunks ----
function b64(u8) { let s = ''; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000)); return btoa(s); }
function unb64(s) { const b = atob(s), u = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; }
async function packStr(s) { if (window.CompressionStream) { try { const cs = new CompressionStream('deflate-raw'); const w = cs.writable.getWriter(); w.write(new TextEncoder().encode(s)).catch(() => { }); w.close().catch(() => { }); return 'z' + b64(new Uint8Array(await new Response(cs.readable).arrayBuffer())); } catch (e) { } } return 'j' + b64(new TextEncoder().encode(s)); }
async function unpackStr(s) { const u = unb64(s.slice(1)); if (s[0] === 'z') { const ds = new DecompressionStream('deflate-raw'); const w = ds.writable.getWriter(); w.write(u).catch(() => { }); w.close().catch(() => { }); return await new Response(ds.readable).text(); } return new TextDecoder().decode(u); }
function sendPacked(room, target, txt, seq) { packStr(txt).then(z => { const CH = 3200, n = Math.ceil(z.length / CH); for (let i = 0; i < n; i++) { const d = { s: seq, i, n, d: z.slice(i * CH, (i + 1) * CH) }; (target ? room.sendTo(target, 'st', d) : room.emit('st', d)).catch(() => { }); } }); }
// public events of the last applies (a card played, a trick won, a ping, a job taken: never a hidden hand)
function netRecord(evs) { for (const e of evs) if (e.t !== 'picked') NET.evq.push(JSON.parse(JSON.stringify(e))); if (NET.evq.length > 14) NET.evq.splice(0, NET.evq.length - 14); }
function netPush(force) {
  if (!isHost() || !NET.room) return; const now = Date.now();
  if (!force && now - NET.last < 300) { if (!NET.timer) NET.timer = setTimeout(() => { NET.timer = null; netPush(true); }, 310); return; }
  NET.last = now; const seq = ++NET.seq, room = NET.room, opt = netOpt();
  if (!G || !UI.started) { sendPacked(room, null, JSON.stringify({ code: NET.code, lobby: true, opt }), seq); return; }
  // every peer gets ITS OWN stripped copy: no other hand, no other pick, no deck order, no seed
  for (const p of NET.peers) {
    if (p.isMe) continue; const seat = NET.seatPeer.indexOf(p.peer);
    sendPacked(room, p.peer, JSON.stringify({ code: NET.code, gid: NET.gid, seat, opt, g: netStrip(G, seat), evs: NET.evq }), seq);
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
  return !!g && typeof g === 'object' && Number.isInteger(g.np) && g.np >= 3 && g.np <= 5 && Number.isInteger(g.hn) && g.hn >= 2 && g.hn <= 5 && Array.isArray(g.players) && g.players.length === g.np && Array.isArray(g.log) && Array.isArray(g.tasks) && Array.isArray(g.tricks) && Array.isArray(g.pl) && g.pl.length === 40 && Array.isArray(g.pings) &&
    ['assign', 'distress', 'pass', 'predict', 'signal', 'play', 'over'].includes(g.phase) && num(g.logN) && num(g.evN) && num(g.att) && num(g.cap) && g.mission && typeof g.mission === 'object' &&
    g.players.every(p => p && typeof p === 'object' && Array.isArray(p.hand) && typeof p.name === 'string') && g.tasks.every(t => t && Number.isInteger(t.id) && t.id >= 0 && t.id < 96 && Number.isInteger(t.owner));
}
function cleanEvs(a) { return Array.isArray(a) ? a.filter(e => e && typeof e === 'object' && typeof e.t === 'string' && Number.isInteger(e.n)).slice(-30).sort((x, y) => x.n - y.n) : []; }
function applyNet(o) {
  NET.opt = o.opt && typeof o.opt === 'object' ? o.opt : NET.opt;
  if (o.lobby || !o.g) { if (G || UI.started) { netIdle(); renderStart(); } NET.gid = null; NET.lastTxt = ''; netRender(); return; }
  if (!validState(o.g) || typeof o.gid !== 'string') return;
  const g = o.g, fresh = o.gid !== NET.gid, seat = Number.isInteger(o.seat) && o.seat >= 0 && o.seat < g.np && !g.players[o.seat].helper ? o.seat : -1;
  const txt = JSON.stringify(g) + '|' + seat; if (!fresh && txt === NET.lastTxt) { netRender(); return; }
  NET.lastTxt = txt; const prev = fresh ? null : G;
  g.players.forEach(p => { p.name = cleanName(p.name) || '?'; });
  const evs = cleanEvs(o.evs).filter(e => e.n > (UI.evN || 0));
  G = g; NET.mySeat = seat;
  if (fresh) {
    NET.gid = o.gid; clearTimeout(UI.tm); UI.seq++; closePop(); try { closeRS(); } catch (e) { }
    Object.assign(UI, { cards: [], pop: null, over: null, overShown: false, started: true, holder: -1, mode: 'net', sel: -1, job: -1, pingSel: false, giveSel: -1, fz: null, busy: false, enter: 'deal', evN: g.evN, hint: null, tip: null });
    UI.coach = { level: 'off', seen: {}, keep: false };
    UI.chefs = null; UI.timerAt = 0; UI.clockLeft = g.clock || null;
    const st = $('#start'); if (st) st.hidden = true; try { GX.close(); } catch (e) { } UI.netOpen = false;
    placePrompt(); netRender(); render(); sndMusic(); if (g.phase === 'over') showResult(); else if (g.clock && g.clockRun) { UI.timerAt = Date.now(); startClock(); } return;
  }
  if (prev && (prev.att !== g.att)) { UI.sel = -1; UI.job = -1; UI.pingSel = false; UI.giveSel = -1; UI.overShown = false; UI.rsOpen && closeRS(); UI.enter = 'deal'; UI.timerAt = 0; }
  if (prev && prev.phase !== g.phase) { UI.sel = -1; UI.job = -1; UI.pingSel = false; UI.giveSel = -1; }
  UI.evN = Math.max(UI.evN || 0, g.evN);
  if (g.clock && g.clockRun && !UI.timerAt) { UI.timerAt = Date.now(); startClock(); }
  const anim = evs.some(e => e.t === 'play' || e.t === 'trick' || e.t === 'swap' || e.t === 'take' || e.t === 'ping');
  netRender();
  if (anim || (evs.some(e => e.t === 'over'))) { if (UI.busy) UI.rq.push(evs); else playEvs(evs); return; }
  render(); sndMusic(); schedule();
  if (g.phase === 'over' && !UI.overShown && !UI.busy) showResult();
}
function onNetRej(msg) { if (!isClient() || msg.peer !== NET.hostPeer) return; const e = msg.data && typeof msg.data.e === 'string' ? msg.data.e.slice(0, 160) : ''; if (e && G) toast(e); }
// ---- client -> host ----
const MOVE_KEYS = { t: 1, c: 1, i: 1, k: 1, f: 1, n: 1, on: 1, dir: 1, as: 1 };
function cleanMove(m) {
  if (!m || typeof m !== 'object' || Array.isArray(m)) return null; const o = {};
  for (const k of Object.keys(m)) {
    if (!MOVE_KEYS[k]) return null; const v = m[k];
    if (k === 't' || k === 'k') { if (typeof v !== 'string' || v.length > 10) return null; }
    else if (k === 'on') { if (typeof v !== 'boolean') return null; }
    else if (!Number.isInteger(v) || v < -2 || v > 99) return null;
    o[k] = v;
  }
  return typeof o.t === 'string' ? o : null;
}
function netAct(m) {
  if (!NET.room || !NET.hostPeer || !G || G.phase === 'over') { toast('Not connected to the host yet.'); return; }
  if (NET.mySeat < 0) { toast('You are watching this dive.'); return; }
  const mm = cleanMove(m); if (!mm) return;
  NET.sent++; NET.room.sendTo(NET.hostPeer, 'act', { m: mm }).catch(() => { });
  closePop();
}
function netRej(peer, e, why) { NET.rejected++; NET.rejLog.push(String(e).slice(0, 40) + (why ? ' ' + String(why).slice(0, 120) : '')); if (NET.rejLog.length > 30) NET.rejLog.shift(); try { NET.room.sendTo(peer, 'rej', { e }).catch(() => { }); } catch (x) { } }
function sameMove(a, b) { const ka = Object.keys(a), kb = Object.keys(b); if (ka.length !== kb.length) return false; for (const k of ka) if (a[k] !== b[k]) return false; return true; }
function onNetAct(msg) {
  if (!isHost() || !G || msg.isMe) return; const d = msg.data;
  if (!d || typeof d !== 'object' || Array.isArray(d)) { NET.rejected++; return; }
  let seat = NET.seatPeer.indexOf(msg.peer);
  if (seat < 0) { const i = msg.by ? NET.seatUid.findIndex(u => u && u === msg.by) : -1; if (i >= 0) { netRestore(i, msg.peer); render(); seat = i; } else { NET.rejected++; return; } }
  if (G.phase === 'over') { NET.rejected++; return; }
  let js; try { js = JSON.stringify(d.m); } catch (e) { }
  if (typeof js !== 'string' || js.length > 120 || js[0] !== '{') { NET.rejected++; return; }
  const m = cleanMove(JSON.parse(js));
  if (!m) { NET.rejected++; return; }
  if (G.players[seat].ai) { netRej(msg.peer, 'That seat is played by the computer.'); return; }
  const real = LD.moves(G, seat).find(x => sameMove(x, m));
  if (!real) { netRej(msg.peer, 'That move is not allowed now.', m.t); return; }
  let ok = false; try { ok = commit(seat, real); } catch (e) { console.error(e); }
  if (ok) NET.remote++; else netRej(msg.peer, 'That move did not work.');
}
// ---- emotes: four neutral pictures, no words, no card information ----
const EMOTES = ['👍', '👋', '👏', '🫧'];
function netEmote(e) {
  if (!NET.on || !NET.room || !EMOTES.includes(e)) return; if (Date.now() - (NET.emoAt || 0) < 1500) return; NET.emoAt = Date.now();
  showEmote(NET.mySeat, e); try { NET.room.emit('em', { e }).catch(() => { }); } catch (x) { }
}
function showEmote(seat, e) {
  if (!EMOTES.includes(e)) return; const el = document.querySelector('[data-key="seat' + seat + '"]'), bd = $('#bd'); if (!el || !bd) return;
  const r = el.getBoundingClientRect(), b = bd.getBoundingClientRect(); const s = h('div.emo', { style: 'left:' + (r.left - b.left + r.width / 2 - 14) + 'px;top:' + (r.top - b.top + 4) + 'px', 'aria-hidden': 'true' }, e); bd.appendChild(s); setTimeout(() => s.remove(), 2400);
}
function onNetEmote(msg) { if (!NET.on || msg.isMe || !msg.data || typeof msg.data.e !== 'string') return; let seat = NET.seatPeer.indexOf(msg.peer); if (isClient()) { const hp = msg.peer; seat = (NET.opt && Array.isArray(NET.opt.pl) ? NET.opt.pl.findIndex(p => p && p.by && p.by === msg.by) : -1); if (seat >= 0) seat = NET.opt.pl[seat].seat; } if (seat >= 0 && G) showEmote(seat, msg.data.e); }
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
  el.innerHTML = ''; el.appendChild(h('span.nd.' + s.c)); el.appendChild(h('span.nl', 'Room ' + NET.code.toUpperCase() + ' · ' + s.t)); el.appendChild(h('span.ns', String(s.n)));
  el.setAttribute('aria-label', 'Online room ' + NET.code + ': ' + s.t + '. Open the lobby.'); el.title = 'Room ' + NET.code + ' · ' + s.t;
}
function netLobbyEl() {
  const host = isHost(), ps = netPlayers(), st = netStatus(), o = host ? netOpt() : (NET.opt || null);
  const box = h('div.nbox', { role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Online game' }, h('button.px.lbx', { 'data-a': 'netclose', type: 'button', 'aria-label': 'Close' }, '×'), h('h2', 'Online game'));
  box.appendChild(h('p', 'Invite code: ', h('b.code#netcode', NET.code)));
  box.appendChild(h('div.invrow', h('input.invlink', { readonly: true, value: NetRoom.inviteLink(NET.code), 'aria-label': 'Invite link' }), h('button.btn.small', { 'data-a': 'netcopy', type: 'button' }, NET.copied ? 'Copied ✓' : 'Copy link')));
  box.appendChild(h('p.sm', 'Friends open the link, or tap Online and type the code. Nobody can see another player\'s hand, and there is no chat.'));
  box.appendChild(h('p.sm.nst.' + st.c, st.t));
  if (NET.hostGone) { box.appendChild(h('div.acts', h('button.btn.alt', { 'data-a': 'netleave', type: 'button' }, 'Back to the start'))); return box; }
  box.appendChild(h('h3', 'Players (' + ps.length + ')'));
  const ul = h('ul.plist');
  ps.forEach((p, i) => { const sIdx = p.seat >= 0 ? p.seat : i; ul.appendChild(h('li', h('span', { html: avatarC(sIdx === 0 ? YOU : (sIdx - 1) % 4, 64) }), h('b', p.nm || 'Player'), p.by && p.by === NET.uid ? ' (you)' : '', p.host ? ' · host' : '', G && p.seat < 0 ? ' · watching' : '')); });
  if (!ps.length) ul.appendChild(h('li.muted', 'Connecting...'));
  box.appendChild(ul);
  if (o && o.np) {
    const hum = Math.min(ps.length, o.np), ai = Math.max(0, o.np - hum);
    if (host) {
      const oo = UI.opt = UI.opt || Object.assign({}, DEF, { lv: DEF.lv.slice() });
      const seg = (l, key, vals) => h('div.seg', h('span.lbl', l), vals.map(v => h('button.chipb' + (oo[key] === v ? '.on' : ''), { 'data-a': 'netopt', 'data-k': key, 'data-v': v, type: 'button' }, v)));
      box.appendChild(h('div.opts', seg('Divers', 'np', [2, 3, 4, 5]), seg('Computer level', 'level', ['easy', 'normal', 'hard']), h('p.sm', 'Dive: ' + missionLine(UI.opt || DEF) + '. Change it on the setup screen before you host.')));
    }
    box.appendChild(h('p.sm', o.np + ' divers' + (o.np === 2 ? ' + drone' : '') + (ai > 0 ? ' · ' + ai + ' computer seat' + (ai > 1 ? 's' : '') + ' (' + (o.lv || 'normal') + ')' : '') + '. Empty seats go to the computer; a friend who leaves is replaced by it.'));
  }
  if (host) box.appendChild(h('div.acts', h('button.btn.go', { 'data-a': 'netstart', type: 'button' }, G && G.phase !== 'over' ? 'Start a new dive' : 'Start the dive'), h('button.btn.alt', { 'data-a': 'netleave', type: 'button' }, 'Close the room')));
  else box.appendChild(h('div', h('p.sm', NET.hostGone ? '' : (G && G.phase !== 'over' ? 'The dive is running.' : 'Waiting for the host to start...')), h('div.acts', h('button.btn.alt', { 'data-a': 'netleave', type: 'button' }, NET.hostGone ? 'Back to the start' : 'Leave'))));
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
function netBlock() { return h('details.online#onl', { open: UI.onl ? true : null }, h('summary', 'Play online (free, peer to peer)'), h('div#netblock', netInner())); }
// the start screen while in a room: the lobby holds the controls, this card just waits
function netStartScreen(s) {
  const st = netStatus();
  s.appendChild(h('div.scard', h('h1', 'Lantern Dive'), h('p.tag', isHost() ? 'You are hosting room ' + NET.code.toUpperCase() + '. Friends join with the code or the link; press Start the dive in the lobby.' : 'You are in room ' + NET.code.toUpperCase() + '. Waiting for the host to start the dive.'),
    h('p.sm.nst.' + st.c, st.t), h('div.srow2', h('button.btn', { 'data-a': 'netopen', type: 'button' }, 'Open the lobby'), h('button.btn.alt', { 'data-a': 'netleave', type: 'button' }, isHost() ? 'Close the room' : 'Leave the room'))));
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
// hook called from the UI at the end of render()
function netRenderHook() { netDock(); }
function netOverButtons() { return (isHost() ? [{ label: 'Play again', a: 'again' }] : []).concat([{ label: 'Look at the table', a: 'cont', cls: 'alt' }, { label: 'Lobby', a: 'netopen', cls: 'alt' }]); }
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
    case 'netopt': { if (isHost() && t && t.dataset) { UI.opt = UI.opt || Object.assign({}, DEF, { lv: DEF.lv.slice() }); UI.opt[t.dataset.k] = isNaN(+t.dataset.v) ? t.dataset.v : +t.dataset.v; netRender(); netPush(true); } return true; }
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
// the lobby and the badge keep showing the live player count
setInterval(() => { if (!NET.on) return; const st = netStatus(), k = st.t + '|' + NET.peers.length; if (k !== NET.lastSt) { NET.lastSt = k; netRender(); } }, 1000);
