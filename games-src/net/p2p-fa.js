// Real WebRTC test for Final Approach: host + guest in separate Chromium contexts (NO proxy), local Nostr relay.
// PW=<path>/playwright PORT=17793 node net/p2p-fa.js final-approach/game/final-approach.html SCENARIO
//   SCENARIO: full (host + guest, two flights through Play again, hidden-dice checks on every poll) | leave (forged messages, guest leaves, computer takes the seat, guest rejoins)
//             | ui (lobby: code, link, Esc, backdrop, copy) | hostleft | touch (phone) | shots
// PHONE=1 (or p2p-fa-phone.js): 390x844 touch contexts, ?phone=1, plus layout checks for the online badge and the lobby.
const { chromium } = require(process.env.PW); const fs = require('fs'); const { spawn } = require('child_process'); const path = require('path');
const file = process.argv[2], SC = process.argv[3] || 'full'; const html = fs.readFileSync(file); const PORT = +process.env.PORT || 17793; const PHONE = process.env.PHONE === '1';
const sleep = ms => new Promise(r => setTimeout(r, ms)); let b, relay;
async function page(ctx, label, hash) {
  const p = await ctx.newPage(); p.setDefaultTimeout(150000); const errs = []; p.on('pageerror', e => errs.push(label + ' pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push(label + ' console: ' + m.text()); });
  await p.goto('https://gns.test/' + (PHONE ? '?phone=1' : '') + (hash || ''), { waitUntil: 'domcontentloaded', timeout: 120000 });
  await p.waitForFunction(() => typeof NET !== 'undefined' && NET.ready && typeof UI !== 'undefined' && document.querySelector('#start .ttl,#start .scard'), null, { timeout: 120000, polling: 300 }); return { p, ctx, label, errs };
}
async function ctxNew() {
  const c = await b.newContext(PHONE ? { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } : { viewport: { width: 1100, height: 760 } });
  await c.addInitScript(port => { window.NETROOM_RELAYS = ['ws://127.0.0.1:' + port]; window.NETROOM_ICE = []; }, PORT);
  await c.route('**/*', r => { const u = r.request().url(); if (u.startsWith('https://gns.test/')) return r.fulfill({ body: html, contentType: 'text/html; charset=utf-8' }); return r.abort(); }); return c;
}
async function setup(opt) {
  const H = await page(await ctxNew(), 'host'); const C = [await page(await ctxNew(), 'guest')];
  console.log('host', JSON.stringify(await H.p.evaluate(() => ({ avail: netAvail(), trystero: typeof Trystero }))));
  await H.p.evaluate(o => { AIDELAY = o.delay || 80; UI.opt = Object.assign(UI.opt || {}, { scenario: o.sc || 'g2', level: 'normal', role: 0 }); if (!document.querySelector('#onl')) document.querySelector('#start [data-a=online]').click(); document.getElementById('netname').value = 'Hosty'; document.querySelector('[data-a=nethost]').click(); }, opt || {});
  let code = ''; for (let k = 0; k < 60 && !code; k++) { await sleep(100); code = await H.p.evaluate(() => NET.on ? NET.code : ''); }
  await C[0].p.evaluate(code => { AIDELAY = 80; if (!document.querySelector('#onl')) document.querySelector('#start [data-a=online]').click(); document.getElementById('netname').value = 'Friend1'; document.getElementById('joincode').value = code; document.getElementById('joincode').dispatchEvent(new Event('input', { bubbles: true })); document.querySelector('[data-a=netjoin]').click(); }, code);
  const t0 = Date.now(); while (Date.now() - t0 < 40000) { const n = await H.p.evaluate(() => NET.peers.length); const m = await C[0].p.evaluate(() => NET.peers.length); if (n >= 2 && m >= 2) break; await sleep(250); }
  await sleep(1500); const lobby = await H.p.evaluate(() => netPlayers().map(p => p.nm)); console.log('lobby after', Date.now() - t0, 'ms host sees', JSON.stringify(lobby)); return { H, C, code };
}
const startHost = H => H.p.evaluate(() => document.querySelector('[data-a=netstart]').click());
// one random click through the page's own DOM, for the page's own seat only
const tick = () => {
  if (typeof G === 'undefined' || !G || !UI.started) return 0; const d = document, R = Math.random, rnd = a => a[Math.floor(R() * a.length)], q = s => [...d.querySelectorAll(s)].filter(b => !b.disabled && !b.closest('[hidden]')), click = el => { el.dispatchEvent(new MouseEvent('click', { bubbles: true })); return 1; };
  const nb = d.getElementById('netbox'); if (nb && !nb.hidden && UI.netOpen && R() < .5) { UI.netOpen = false; netRender(); }
  const rs = d.getElementById('rs'); if (rs && !rs.hidden) { const sc = rs.querySelector('.stbox [data-a=rsclose]'); if (sc) return click(sc); return 0; } if (G.result) return 0;
  const tip = q('#pc [data-a=tipok],#pc [data-a=tipoff]'); if (tip.length) return click(tip[0]);
  const s = NET.mySeat; if (s < 0 || !FA.pending(G).includes(s) || G.ai[s]) return 0;
  if (R() < .03) { const t = rnd(q('.gx-bar [data-gx]')); if (t) { click(t); const x = d.querySelector('.gx-drawer.on .gx-x'); if (x) click(x); return 0; } }
  // the page's computer-crew logic proposes a move; it is carried out with taps on the page's own dice, spaces and buttons (a random click now and then keeps the tests honest)
  const mv = R() < .12 ? null : FA.AI.move(G, s, 'normal');
  if (G.phase === 'brief') { if (R() < .3) { const sy = q('.say'); if (sy.length) click(rnd(sy)); } const rd = q('#acts [data-a=ready]'); return rd.length ? click(rd[0]) : 0; }
  const dieBtn = i => d.querySelector('#pz .die[data-s="' + s + '"][data-d="' + i + '"]:not([disabled])');
  if (mv && mv.t === 'place') { const b = dieBtn(mv.d); if (b) { click(b); UI.cof = mv.c || 0; render(); const sl = d.querySelector('#pz .slot[data-slot="' + mv.to + '"]'); if (sl) return click(sl); } }
  else if (mv && mv.t === 'rr') { const b = q('#acts [data-a=rr]'); if (b.length) return click(b[0]); }
  else if (mv && mv.t === 'rrpick') { mv.m.forEach((on, i) => { if (on !== !!UI.rrm[i]) { const b = dieBtn(i); if (b) click(b); } }); const rp = q('#acts [data-a=rrpick]'); if (rp.length) return click(rp[0]); }
  else if (mv && (mv.t === 'toss' || mv.t === 'antic' || mv.t === 'adapt' || mv.t === 'wt' || mv.t === 'wt2')) { const b = dieBtn(mv.d); if (b) { click(b); const a = q('#acts [data-a=' + mv.t + ']'); if (a.length) return click(a[0]); } }
  const rp = q('#acts [data-a=rrpick]'); if (rp.length) return click(rp[0]);
  const sel = UI.sel, legal = q('#pz .slot.legal'); if ((typeof sel === 'number' && sel >= 0 || sel === 'p') && legal.length) return click(rnd(legal));
  const dice = q('#pz .die'); if (dice.length) return click(rnd(dice)); return 0;
};
// ---- hidden-information checks: truth = the host's real G; a page may only hold what its own seat may see ----
const hostTruth = () => ({ gid: NET.gid, dice: G.dice.map(h => h.map(d => d.v)), seed: G.seed, rng: G.rng, hostSeat: NET.hostSeat });
const pageCheck = T => {
  const out = []; const v = NET.mySeat; if (!G || NET.gid !== T.gid) return out;
  for (const el of document.querySelectorAll('#pz .die')) { const s = +el.getAttribute('data-s'), dv = el.querySelector('.dv'); if (dv && /^[1-6]$/.test(dv.textContent) && s !== v) out.push('dom: die of seat ' + s + ' shows ' + dv.textContent + ' on the page of seat ' + v); }
  if (NET.role === 'client') {
    if (G.seed || G.rng) out.push('state: rng/seed'); if ('script' in G) out.push('state: script');
    const o = 1 - v; G.dice[o].forEach((d, i) => { if (d.v !== 0) out.push('state: die of seat ' + o + ' visible'); });
    const same = JSON.stringify(G) === JSON.stringify(netStrip(window.__hostG || G, v)); // overwritten below by the harness for hosts only
    for (const k of Object.keys(G)) if (!['v', 'seed', 'rng', 'sid', 'tk', 'alt', 'row0', 'mods', 'abil', 'names', 'ai', 'round', 'phase', 'first', 'turn', 'ready', 'say', 'pl', 'planes', 'coffee', 'rrHand', 'rrTaken', 'dice', 'slots', 'keys', 'pend', 'fl', 'adaptUsed', 'intern', 'internUsed', 'speed', 'landSpeed', 'result', 'log', 'events', 'logN', 'evN', 'used', 'nolog'].includes(k)) out.push('state: unlisted field ' + k);
  }
  return out;
};
const dbg = {};
async function play(P, H, secs, hook) {
  let clicks = 0, remoteClicks = 0, checks = 0; const viol = []; const t0 = Date.now(); let n = 0, lastK = '', lastT = Date.now();
  while (Date.now() - t0 < secs * 1000) {
    const g = await H.p.evaluate(() => G && { over: !!G.result && !!UI.overShown, k: G.logN + '/' + G.round + '/' + G.phase }).catch(() => null); if (!g || g.over) break;
    if (g.k !== lastK) { lastK = g.k; lastT = Date.now(); } else if (Date.now() - lastT > 40000) { lastT = Date.now(); console.log('STALL?', g.k); }
    if (hook && global.HOOK_FIRST) await hook(g, n);
    for (const x of P) { if (x.dead || global.FREEZE === x || global.FREEZE === 1) continue; const k = await x.p.evaluate(tick).catch(e => { x.errs.push(x.label + ' tick ' + e.message); return 0; }); clicks += k; if (x !== H) remoteClicks += k; }
    if (++n % 6 === 0) { const T = await H.p.evaluate(hostTruth).catch(() => null); if (T) for (const x of P) { if (x.dead) continue; const o = await x.p.evaluate(pageCheck, T).catch(() => []); checks++; if (o.length && viol.length < 8) viol.push(x.label + ': ' + o.slice(0, 3).join('; ')); } }
    if (hook && !global.HOOK_FIRST) await hook(g, n); await sleep(global.DELAY || 40);
  }
  return { clicks, remoteClicks, checks, viol, secs: Math.round((Date.now() - t0) / 1000) };
}
const seatOf = async x => { x.seat = await x.p.evaluate(() => NET.mySeat).catch(() => -2); return x.seat; };
async function finish(P, H, tag, extra) {
  for (let k = 0; k < 80; k++) { const f = await Promise.all(P.filter(x => !x.dead).map(x => x.p.evaluate(() => !!(G && G.result && UI.overShown && !document.querySelector('#rs').hidden)).catch(() => false))); if (f.every(Boolean)) break; await sleep(250); }
  await sleep(800); const alive = P.filter(x => !x.dead); for (const x of alive) await seatOf(x);
  for (let k = 0; k < 60; k++) { const hs = await H.p.evaluate(() => G.logN); const ok = await Promise.all(alive.filter(x => x !== H).map(x => x.p.evaluate(l => G && !!G.result && G.logN === l, hs).catch(() => false))); if (ok.every(Boolean)) break; await sleep(250); }
  const sum = () => ({ over: !!G.result, win: G.result && G.result.win, why: G.result && G.result.why, round: G.round, logN: G.logN, seat: NET.mySeat, shown: !document.querySelector('#rs').hidden });
  const hs = await H.p.evaluate(sum); const cs = await Promise.all(alive.filter(x => x !== H).map(x => x.p.evaluate(sum).catch(() => null)));
  const agree = cs.every(c => c && c.over && c.win === hs.win && c.why === hs.why && c.logN === hs.logN && c.round === hs.round);
  const exact = await Promise.all(alive.filter(x => x !== H).map(async x => { let j = ''; for (let k = 0; k < 40; k++) { j = await x.p.evaluate(() => JSON.stringify(G)); const e0 = await H.p.evaluate(([j, s]) => JSON.stringify(netStrip(G, s)) === j, [j, x.seat]); if (e0) break; await sleep(250); } const eq = await H.p.evaluate(([j, s]) => { const a = JSON.stringify(netStrip(G, s)); if (a === j) return true; let i = 0; while (i < a.length && a[i] === j[i]) i++; window.__diff = 'host strip: ' + a.slice(Math.max(0, i - 30), i + 50) + ' <> guest: ' + j.slice(Math.max(0, i - 30), i + 50) + ' | host dice ' + JSON.stringify(G.dice) + ' seat ' + s; return false; }, [j, x.seat]); if (!eq) dbg.exactInfo = await H.p.evaluate(() => window.__diff); return eq; }));
  const stats = await H.p.evaluate(() => ({ remote: NET.remote, rejected: NET.rejected, inv: FA.checkInvariants(G).length })); const errors = P.flatMap(x => x.errs);
  const finals = cs.every(c => c && c.shown) && hs.shown;
  const r = Object.assign({ tag, host: hs, guests: cs.map(c => c && { seat: c.seat, over: c.over }), agree, exactStrip: exact.every(Boolean), exactInfo: dbg.exactInfo, finalCardEverywhere: finals, stats, nErrors: errors.length + (stats.inv ? 1 : 0), errors: errors.slice(0, 4) }, extra || {});
  console.log(JSON.stringify(r)); return r;
}
async function again(P, H) { // the host presses Play again; the guest must show a fresh flight
  await H.p.evaluate(() => { const b = document.querySelector('#rs [data-a=again]'); if (b) b.click(); });
  for (let k = 0; k < 80; k++) { await sleep(250); const ok = await Promise.all(P.filter(x => !x.dead && x !== H).map(x => x.p.evaluate(() => G && !G.result && G.round === 0 && UI.started).catch(() => false))); if (ok.every(Boolean)) break; }
}
async function layout(x, tag) {
  const r = await x.p.evaluate(() => {
    const R = s => { const e = document.querySelector(s); if (!e || e.hidden) return null; const r = e.getBoundingClientRect(); return [r.left, r.top, r.right, r.bottom]; };
    const ov = (A, B) => A && B && A[0] < B[2] - .5 && A[2] > B[0] + .5 && A[1] < B[3] - .5 && A[3] > B[1] + .5; const board = R('#bd'), st = R('#netst'); const bad = [];
    if (!st) bad.push('no badge'); else { if (ov(st, board)) bad.push('badge over board'); if (st[0] < -.5 || st[2] > innerWidth + .5) bad.push('badge off screen'); if (st[3] - st[1] < (document.documentElement.classList.contains('ph') ? 43.9 : 28)) bad.push('badge too small');
      for (const b of document.querySelectorAll('.gx-bar button:not(#netst)')) { const r = b.getBoundingClientRect(); if (r.width && ov(st, [r.left, r.top, r.right, r.bottom])) bad.push('badge overlaps ' + (b.dataset.gx || b.id)); } }
    for (const e of document.querySelectorAll('#pz .slot,#pz .die:not([disabled])')) { const r = e.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2; const t = document.elementFromPoint(x, y); if (!t || !(e === t || e.contains(t) || t.contains(e) || t.closest('.slot,.die'))) bad.push('covered ' + (e.dataset.slot || e.dataset.d) + ' by ' + (t && (t.id || t.className))); }
    return { bad: bad.slice(0, 6), w: document.documentElement.scrollWidth, vw: innerWidth, h: document.documentElement.scrollHeight, vh: innerHeight, txt: (document.querySelector('#netst') || {}).textContent };
  });
  const probs = [...r.bad]; if (r.w > r.vw + 1 || r.h > r.vh + 1) probs.push('page scroll ' + r.w + 'x' + r.h); console.log('layout', tag, x.label, JSON.stringify(r), probs.length ? 'PROBLEMS ' + probs : 'ok'); return probs;
}
(async () => {
  relay = spawn('node', [__dirname + '/relay.js', String(PORT)]); await sleep(600);
  b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }); const res = [];
  try {
    if (SC === 'full') {
      const { H, C } = await setup({ sc: 'g2' }); const P = [H, ...C]; await startHost(H); for (const x of P) await seatOf(x); const lp = []; await sleep(1500); for (const x of P) await x.p.evaluate(() => { const c = document.querySelector('#rs.story [data-a=rsclose]'); if (c) c.click(); }); await sleep(600); for (const x of P) lp.push(...await layout(x, 'mid-start'));
      let pr = await play(P, H, 420); const r1 = await finish(P, H, 'flight 1', pr); r1.layout = lp; res.push(r1);
      await again(P, H); for (const x of P) await seatOf(x); pr = await play(P, H, 420); res.push(await finish(P, H, 'flight 2 (Play again)', pr));
    }
    else if (SC === 'ui') {
      const { H, C } = await setup({}); const vis = x => x.p.evaluate(() => !document.getElementById('netbox').hidden); const out = {};
      out.openAtStart = await vis(H); await H.p.keyboard.press('Escape'); out.afterEsc = await vis(H);
      await H.p.evaluate(() => document.querySelector('[data-a=netopen]').click()); out.reopened = await vis(H); await H.p.mouse.click(3, 3); out.afterBackdrop = await vis(H);
      await H.p.evaluate(() => document.querySelector('[data-a=netopen]').click()); await H.p.evaluate(() => document.querySelector('[data-a=netclose]').click()); out.afterX = await vis(H);
      await H.p.evaluate(() => document.querySelector('[data-a=netopen]').click()); await H.p.evaluate(() => document.querySelector('[data-a=netcopy]').click()); await sleep(300); out.copy = await H.p.evaluate(() => ({ copied: NET.copied }));
      out.link = await H.p.evaluate(() => document.querySelector('.invlink').value); out.code = await H.p.evaluate(() => NET.code); out.clientEsc = await (async () => { await C[0].p.keyboard.press('Escape'); return vis(C[0]); })();
      out.players = await H.p.evaluate(() => [...document.querySelectorAll('#netbox .plist li')].map(e => e.textContent)); out.noDevOnline = await H.p.evaluate(() => !document.querySelector('[data-start=hot]'));
      const ok = out.openAtStart && !out.afterEsc && out.reopened && !out.afterBackdrop && !out.afterX && new RegExp('#join-' + out.code + '$').test(out.link) && /^[a-z0-9]{5}$/.test(out.code) && !out.clientEsc && out.players.some(t => /Hosty.*host/.test(t)) && out.players.length === 2;
      console.log('UI', JSON.stringify(out)); res.push({ tag: 'ui', agree: !!ok, errors: [...H.errs, ...C[0].errs], nErrors: H.errs.length + C[0].errs.length });
    }
    else if (SC === 'leave') {
      global.DELAY = 200; const { H, C, code } = await setup({ sc: 'g2' }); const P = [H, ...C]; await H.p.evaluate(() => { AIDELAY = 1500; }); await startHost(H); for (const x of P) await seatOf(x); const ev = {};
      const hook = async (g, n) => {
        if (!ev.bad && n > 12) {
          ev.bad = true; global.FREEZE = 1; await sleep(700);
          const before = await H.p.evaluate(() => ({ n: G.logN, rej: NET.rejected, remote: NET.remote, ss: JSON.stringify(Object.keys(G.slots)) }));
          await C[0].p.evaluate(() => { const R = NET.room, h = NET.hostPeer; const junk = [null, 5, 'x', [1, 2], { m: null }, { m: 'x' }, { m: [] }, { m: {} }, { m: { t: 5 } }, { m: { t: 'zzz' } }, { m: { t: 'place', d: 9, to: 'ax0' } }, { m: { t: 'place', d: 0, to: '__proto__' } }, { m: { t: 'place', d: 0, to: 'ax0', c: 99 } }, { m: { t: 'rrpick', m: 'x' } }, { m: { t: 'ready', x: 1 } }, { m: { t: 'say', c: '<img>' } }, { m: { t: 'place', d: 0, to: 'ax0', pad: 'z'.repeat(400) } }, { hi: 1 }];
            for (const j of junk) { R.sendTo(h, 'act', j); R.emit('act', j); } R.emit('st', { s: 1e9, i: 0, n: 1, d: 'zz' }); R.sendTo(h, 'act', JSON.parse('{"m":{"t":"ready","__proto__":{"x":1}}}')); });
          await sleep(1500); const mid = await H.p.evaluate(() => ({ n: G.logN, rej: NET.rejected, remote: NET.remote, inv: FA.checkInvariants(G).length, pol: ({}).x !== undefined }));
          ev.badResult = { junkRejected: mid.rej - before.rej, stateUnchanged: mid.n === before.n || mid.remote === before.remote, invariants: mid.inv, protoPolluted: mid.pol }; global.FREEZE = 0;
        }
        if (ev.bad && !ev.left && n > 30) { ev.left = true; ev.seat = await C[0].p.evaluate(() => NET.mySeat); ev.uid = await C[0].p.evaluate(() => NetRoom.uid()); await C[0].ctx.close(); C[0].dead = true; ev.leftAt = Date.now(); let away = false; for (let k = 0; k < 80 && !away; k++) { await sleep(250); away = await H.p.evaluate(s => !!G.ai[s], ev.seat); } ev.leave = { aiTookOver: away }; }
        if (ev.left && !ev.rejoin && Date.now() - ev.leftAt > 3000) {
          ev.rejoin = true; const cx = await ctxNew(); await cx.addInitScript(u => { try { localStorage.setItem('gns-uid', u); localStorage.setItem('gns-name', 'Friend1'); } catch (e) { } }, ev.uid); const x = await page(cx, 'guest-again', '#join-' + code);
          const pre = await x.p.evaluate(() => ({ code: UI.joinCode, field: document.getElementById('joincode').value })); await x.p.evaluate(() => { AIDELAY = 80; document.querySelector('[data-a=netjoin]').click(); });
          let back = false; for (let k = 0; k < 200 && !back; k++) { await sleep(250); back = await H.p.evaluate(s => !G.ai[s] && !NET.away, ev.seat); }
          for (let k = 0; k < 40 && !(await x.p.evaluate(() => NET.mySeat >= 0)); k++) await sleep(250); const mine = await x.p.evaluate(() => ({ seat: NET.mySeat, g: !!G, started: UI.started })); ev.rejoinRes = { prefilled: pre, back, mine }; P.push(x); x.seat = mine.seat; ev.remoteBefore = await H.p.evaluate(() => NET.remote);
        }
      };
      const pr = await play(P, H, 420, hook); const remAfter = await H.p.evaluate(() => NET.remote);
      const r = await finish(P, H, 'forged messages, leave, rejoin', Object.assign(pr, { bad: ev.badResult, leave: ev.leave, rejoin: ev.rejoinRes, remoteMovesAfterRejoin: remAfter - (ev.remoteBefore || 0) }));
      const ok = ev.badResult && ev.badResult.junkRejected >= 12 && !ev.badResult.invariants && !ev.badResult.protoPolluted && ev.leave && ev.leave.aiTookOver && ev.rejoinRes && ev.rejoinRes.back && ev.rejoinRes.mine.seat === ev.seat && r.agree; r.agree = !!ok; res.push(r);
    }
    else if (SC === 'touch') {
      const { H, C } = await setup({ sc: 'g2' }); const P = [H, ...C]; await startHost(H); for (const x of P) await seatOf(x); const c = C[0]; const out = {};
      for (let k = 0; k < 100 && !(await c.p.evaluate(() => NET.mySeat === 1 && UI.started)); k++) await sleep(150);
      { const sc = await c.p.$('#rs.story [data-a=rsclose]'); if (sc) { await sc.tap(); await sleep(300); } } await H.p.evaluate(() => { const c = document.querySelector('#rs.story [data-a=rsclose]'); if (c) c.click(); });
      const r0 = await c.p.evaluate(() => { const r = document.querySelector('#netst').getBoundingClientRect(); return [r.width, r.height]; }); out.badge = r0; await c.p.tap('#netst'); await sleep(300); out.lobbyOpen = await c.p.evaluate(() => !document.getElementById('netbox').hidden);
      const xr = await c.p.evaluate(() => { const r = document.querySelector('#netbox .lbx').getBoundingClientRect(); return [r.width, r.height]; }); out.xSize = xr; await c.p.tap('#netbox .lbx'); await sleep(300); out.lobbyClosed = await c.p.evaluate(() => document.getElementById('netbox').hidden);
      let moves = 0; const n0 = await H.p.evaluate(() => NET.remote);
      for (let k = 0; k < 900 && moves < 6; k++) {
        await H.p.evaluate(tick).catch(() => 0);
        const tp = await c.p.$('#pc:not([hidden]) [data-a=tipoff]'); if (tp) await tp.tap().catch(() => { });
        const rd = await c.p.$('#acts [data-a=ready]'); if (rd) { await rd.tap().catch(() => { }); await sleep(300); continue; }
        const mine = await c.p.evaluate(() => G && !G.result && FA.pending(G).includes(NET.mySeat)); if (!mine) { await sleep(120); continue; }
        const d = await c.p.$('#pz .die:not([disabled]):not(.used)'); if (!d) { await sleep(120); continue; }
        await d.tap(); await sleep(150); const sl = await c.p.$('#pz .slot.legal'); if (!sl) continue; await sl.tap(); moves++; await sleep(400);
      }
      out.touchMoves = moves; out.hostRemote = (await H.p.evaluate(() => NET.remote)) - n0; out.probs = await layout(c, 'touch');
      res.push({ tag: 'touch', agree: moves >= 4 && out.hostRemote >= moves - 1 && out.lobbyOpen && out.lobbyClosed && out.badge[0] >= 43.9 && out.badge[1] >= 43.9 && out.xSize[0] >= 43.9 && !out.probs.length, out, errors: [...H.errs, ...c.errs], nErrors: H.errs.length + c.errs.length }); console.log('TOUCH', JSON.stringify(out));
    }
    else if (SC === 'hostleft') {
      const { H, C } = await setup({ sc: 'g2' }); const P = [H, ...C]; await startHost(H); await sleep(1500);
      await H.p.close(); H.dead = true; let msg = ''; for (let k = 0; k < 120 && !msg; k++) { await sleep(300); msg = await C[0].p.evaluate(() => NET.hostGone ? NET.err : 'gone'); if (msg === 'gone' && !(await C[0].p.evaluate(() => NET.hostGone))) msg = ''; }
      const vis = await C[0].p.evaluate(() => ({ modal: !document.getElementById('netbox').hidden, text: document.getElementById('netbox').textContent.slice(0, 200) }));
      res.push({ tag: 'host leaves', msg, vis, agree: vis.modal && /host/i.test(vis.text), errors: C[0].errs, nErrors: C[0].errs.length }); console.log(JSON.stringify(res[res.length - 1]));
      await C[0].p.evaluate(() => document.querySelector('[data-a=netleave]').click()); await sleep(800); console.log('after leave', JSON.stringify(await C[0].p.evaluate(() => ({ on: NET.on, start: !document.getElementById('start').hidden }))));
    }
    else if (SC === 'shots') {
      const SH = path.join(__dirname, '..', 'final-approach', 'game', 'shots'); try { fs.mkdirSync(SH, { recursive: true }); } catch (e) { } const { H, C } = await setup({ sc: 'g2' }); const tag = PHONE ? 'ph' : 'desk';
      const P = [H, ...C]; await sleep(500); await H.p.screenshot({ path: `${SH}/net_${tag}_lobby_host.png` }); await C[0].p.screenshot({ path: `${SH}/net_${tag}_lobby_client.png` });
      await H.p.evaluate(() => netClose()); await startHost(H); let shot = 0;
      await play(P, H, 60, async (g, n) => { if (shot < 2 && n % 25 === 10) { await sleep(500); await C[0].p.screenshot({ path: `${SH}/net_${tag}_client_${shot}.png` }); await H.p.screenshot({ path: `${SH}/net_${tag}_host_${shot}.png` }); shot++; } });
      console.log('errors', JSON.stringify([H, ...C].flatMap(x => x.errs).slice(0, 10)));
    }
  } catch (e) { console.log('HARNESS ERROR', e && e.stack || e); res.push({ tag: 'harness', agree: false, nErrors: 1 }); }
  await b.close(); relay.kill();
  const bad = res.filter(r => !r.agree || r.nErrors || (r.layout && r.layout.length) || (r.viol && r.viol.length) || r.exactStrip === false || r.finalCardEverywhere === false);
  console.log('SUMMARY', SC, PHONE ? 'phone' : 'desktop', res.length, 'runs,', bad.length, 'bad'); process.exit(0);
})();
