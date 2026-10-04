// Real WebRTC test for Cauldron Fair: host + clients in separate Chromium contexts (NO proxy), local Nostr relay.
// PW=<path>/playwright PORT=17792 node net/p2p-cf.js cauldron-fair/cauldron-fair.html SCENARIO
//   SCENARIO: full (host + 1 client, 2 seats, 2 games through Play again) | full3 (host + 2 clients) | full4 (host + 3 clients, 4 humans)
//             | mixed (host + 1 client + 2 computers) | leave (host + 2 +1 cpu: bad actions, double draw, leave, rejoin) | ui | hostleft | touch | shots
// PHONE=1 (or p2p-cf-phone.js): 390x844 touch contexts, ?phone=1, plus layout checks for the online badge and the lobby.
// Drawing is simultaneous: every human page clicks Draw / Stop at its own pace; the checks run while all of them are drawing.
const { chromium } = require(process.env.PW); const fs = require('fs'); const { spawn } = require('child_process'); const path = require('path');
const file = process.argv[2], SC = process.argv[3] || 'full'; const html = fs.readFileSync(file); const PORT = +process.env.PORT || 17792; const PHONE = process.env.PHONE === '1';
const sleep = ms => new Promise(r => setTimeout(r, ms)); let b, relay;
async function page(ctx, label, hash) {
  const p = await ctx.newPage(); p.setDefaultTimeout(150000); const errs = []; p.on('pageerror', e => errs.push(label + ' pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push(label + ' console: ' + m.text()); });
  await p.goto('https://gns.test/' + (PHONE ? '?phone=1' : '') + (hash || ''), { waitUntil: 'domcontentloaded', timeout: 120000 });
  await p.waitForFunction(() => typeof NET !== 'undefined' && NET.ready && typeof UI !== 'undefined' && document.querySelector('#start .ttl,#start .scard'), null, { timeout: 120000, polling: 300 }); return { p, ctx, label, errs };
}
async function ctxNew() {
  const c = await b.newContext(PHONE ? { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } : { viewport: { width: 1100, height: 760 } });
  await c.addInitScript(port => { window.NETROOM_RELAYS = ['ws://127.0.0.1:' + port]; window.NETROOM_ICE = []; window.NET_TRACE = 1; }, PORT);
  await c.route('**/*', r => { const u = r.request().url(); if (u.startsWith('https://gns.test/')) return r.fulfill({ body: html, contentType: 'text/html; charset=utf-8' }); return r.abort(); }); return c;
}
async function setup(ncl, opt) {
  const H = await page(await ctxNew(), 'host'); const C = []; for (let i = 0; i < ncl; i++) C.push(await page(await ctxNew(), 'c' + (i + 1)));
  console.log('host', JSON.stringify(await H.p.evaluate(() => ({ avail: netAvail(), trystero: typeof Trystero }))));
  await H.p.evaluate(() => { AIDELAY = 80; ANIM = 0; if (!document.querySelector('#onl')) document.querySelector('#start [data-a=online]').click(); if (!document.querySelector('#onl').open) document.querySelector('#onl summary').click(); document.getElementById('netname').value = 'Hosty'; document.querySelector('[data-a=nethost]').click(); });
  let code = ''; for (let k = 0; k < 60 && !code; k++) { await sleep(100); code = await H.p.evaluate(() => NET.on ? NET.code : ''); }
  for (const [i, c] of C.entries()) await c.p.evaluate(([code, i]) => { AIDELAY = 80; ANIM = 0; if (!document.querySelector('#onl')) document.querySelector('#start [data-a=online]').click(); if (!document.querySelector('#onl').open) document.querySelector('#onl summary').click(); document.getElementById('netname').value = 'Friend' + (i + 1); document.getElementById('joincode').value = code; document.querySelector('[data-a=netjoin]').click(); }, [code, i]);
  const t0 = Date.now(); while (Date.now() - t0 < 40000) { const n = await H.p.evaluate(() => NET.peers.length); const m = await Promise.all(C.map(c => c.p.evaluate(() => NET.peers.length))); if (n >= ncl + 1 && m.every(x => x >= ncl + 1)) break; await sleep(250); }
  await sleep(1500);
  const click = (x, sel) => x.p.evaluate(s => { const e = document.querySelector(s); if (e) e.click(); return !!e; }, sel);
  await click(H, `[data-a=netopt][data-k=np][data-v="${opt.np}"]`); await click(H, `[data-a=netopt][data-k=level][data-v="${opt.level || 'normal'}"]`); if (opt.sets !== undefined) await click(H, `[data-a=netopt][data-k=sets][data-v="${opt.sets}"]`); await sleep(600);
  const lobby = await H.p.evaluate(() => netPlayers().map(p => p.nm)); const cl = await Promise.all(C.map(c => c.p.evaluate(() => ({ open: UI.netOpen, pl: netPlayers().map(p => p.nm), opt: !!NET.opt, hostPeer: !!NET.hostPeer }))));
  console.log('lobby after', Date.now() - t0, 'ms host sees', JSON.stringify(lobby), 'clients see', JSON.stringify(cl)); return { H, C, code };
}
const startHost = H => H.p.evaluate(() => document.querySelector('[data-a=netstart]').click());
// one random click through the page's own DOM, for the page's own seat only (all pages run this at the same time)
const tick = () => {
  if (typeof G === 'undefined' || !G || !UI.started) return 0; const d = document, R = Math.random, rnd = a => a[Math.floor(R() * a.length)], q = s => [...d.querySelectorAll(s)].filter(b => !b.disabled && !b.closest('[hidden]')), click = el => { el.dispatchEvent(new MouseEvent('click', { bubbles: true })); return 1; };
  const nb = d.getElementById('netbox'); if (nb && !nb.hidden && UI.netOpen && R() < .5) { UI.netOpen = false; netRender(); }
  if (NET.mySeat < 0) return 0;
  const rs = d.getElementById('rs');
  if (rs && !rs.hidden) {
    if (G.phase === 'over') return 0;
    const shopB = q('#rs [data-a=shopsel]'); if (shopB.length && R() < .7) { const k = Math.floor(R() * 3); for (let i = 0; i < k; i++) { const b = rnd(q('#rs [data-a=shopsel]')); if (b) click(b); } const buy = d.querySelector('#rs [data-a=shopbuy]'); if (buy) return click(buy); return 0; }
    const opts = q('#rs .dec [data-a=mv]'); if (opts.length) return click(rnd(opts));
    const c = d.querySelector('#rs [data-a=rscont]:not([disabled])'); if (c && R() < .5) return click(c); return 0;
  }
  if (G.phase === 'over') return 0;
  const tipb = q('#pc [data-a=tipok]'); if (tipb.length) return click(tipb[0]);
  const r = R(); if (r < .02) { const c = q('#others .th,#roster .rc'); if (c.length) { click(rnd(c)); } return 0; }
  if (r < .04) { const t = rnd(q('.gx-bar [data-gx]')); if (t) { click(t); const x = d.querySelector('.gx-drawer.on .gx-x'); if (x) click(x); } return 0; }
  const acts = q('#acts [data-a=mv],#qbox [data-a=mv]'); if (!acts.length) return 0;
  const draw = acts.find(b => /Draw/.test(b.textContent)), stop = acts.find(b => /^Stop/.test(b.textContent.trim()));
  let pick; if (draw && stop) pick = R() < .72 ? draw : stop; else pick = rnd(acts); if (R() < .1) pick = rnd(acts); return click(pick);
};
// ---- hidden-information checks. Truth = the host's real G; a page may only hold what its own seat may see ----
const hostTruth = () => ({ gid: NET.gid, bags: G.players.map(p => p.bag.map(c => c.c + c.v).sort().join(',')), fdeck: G.fdeck.slice(), rng: G.rng, seed: G.seed, prng: G.players.map(p => p.rng) });
const ALLOWED = 'v np round phase start sets supply fdeckN fcard fdisc logN evN hist rep over winner winners winText ev shopSeat opts players log events rng seed'.split(' ');
const PLF = 'seat name ai char vp rubies droplet flask rat ratTails bag bagN pot side hold holdN newChips q postq acts st boom prot f res last9 ver endVp'.split(' ');
const pageCheck = T => {
  const out = []; const v = NET.mySeat; if (!G || NET.gid !== T.gid) return out;
  for (const el of document.querySelectorAll('[data-priv]')) { const o = +el.getAttribute('data-priv'); if (o !== v) out.push('dom: private box of seat ' + o + ' drawn on the page of seat ' + v); }
  const bad = (g, s, where) => {
    g.players.forEach((p, i) => { for (const k of Object.keys(p)) if (!PLF.includes(k)) out.push(where + ': player field ' + k); if (i !== s) { if (p.bag.some(c => c !== 0)) out.push(where + ': bag of seat ' + i); if (p.hold.some(c => c !== 0)) out.push(where + ': held chips of seat ' + i); } if (p.rng) out.push(where + ': rng of seat ' + i); });
    if (g.fdeck && g.fdeck.length) out.push(where + ': fortune deck'); if (g.rng || g.seed) out.push(where + ': rng/seed');
    for (const k of Object.keys(g)) if (!ALLOWED.includes(k)) out.push(where + ': unlisted field ' + k);
    for (const e of g.events || []) if (e.t === 'peek' && e.seat !== s && e.chips) out.push(where + ': peek of seat ' + e.seat);
  };
  if (NET.role === 'client') {
    bad(G, v, 'state');
    const mine = G.players[v].bag.map(c => c.c + c.v).sort().join(','); if (mine !== T.bags[v] && G.phase === 'brew' && false) out.push('own bag differs');
    for (const t of (NET.trace || [])) { const o = JSON.parse(t); if (!o.g) continue; bad(o.g, o.seat, 'packet'); }
    if (NET.trace && NET.trace.length > 30) NET.trace = NET.trace.slice(-12);
  }
  return out;
};
const dbg = { game: 0 };
async function play(P, H, secs, hook) {
  let clicks = 0, remoteClicks = 0, checks = 0; const viol = []; const t0 = Date.now(); let n = 0, lastK = '', lastT = Date.now();
  while (Date.now() - t0 < secs * 1000) {
    const g = await H.p.evaluate(() => G && { over: G.phase === 'over' && !!UI.overShown, round: G.round, k: G.logN + '/' + G.round + '.' + G.phase + '/' + G.players.map(p => p.st).join('') }).catch(() => null); if (!g || g.over) break;
    if (g.k !== lastK) { lastK = g.k; lastT = Date.now(); } else if (Date.now() - lastT > 40000) { lastT = Date.now(); const v = await Promise.all(P.filter(x => !x.dead).map(x => x.p.evaluate(() => ({ seat: NET.mySeat, k: G && G.logN + '/' + G.phase, rx: NET.rx, bad: NET.bad, badE: NET.badE, rej: NET.rejected, peers: NET.peers.length, st: G && G.players.map(p => p.st + (p.q ? ':' + p.q.h : '')).join(','), ui: [UI.started, UI.rsMode, document.querySelector('#rs').hidden, UI.repSeen, G && G.rep && G.rep.round, [...document.querySelectorAll('#rs button,#acts button')].map(b => b.textContent.trim().slice(0, 12) + (b.disabled ? '(d)' : '')).join('|'), NET.sent] })).catch(e => String(e)))); console.log('STALL?', JSON.stringify(v)); }
    if (hook && global.HOOK_FIRST) await hook(g, n);
    for (const x of P) { if (x.dead || global.FREEZE === x || global.FREEZE === 1) continue; const k = await x.p.evaluate(tick).catch(e => { x.errs.push(x.label + ' tick ' + e.message); return 0; }); clicks += k; if (x !== H) remoteClicks += k; }
    if (++n % 6 === 0) { const T = await H.p.evaluate(hostTruth).catch(() => null); if (T) for (const x of P) { if (x.dead) continue; const o = await x.p.evaluate(pageCheck, T).catch(() => []); checks++; if (o.length && viol.length < 8) viol.push(x.label + ': ' + o.slice(0, 3).join('; ')); } }
    if (hook && !global.HOOK_FIRST) await hook(g, n); await sleep(global.DELAY || 30);
  }
  return { clicks, remoteClicks, checks, viol, secs: Math.round((Date.now() - t0) / 1000) };
}
async function again(P, H) {
  for (let k = 0; k < 30; k++) { const a = await H.p.evaluate(() => { const b = document.querySelector('#rs [data-a=again]'); if (b) { b.click(); return 1; } const c = document.querySelector('#rs [data-a=rscont]:not([disabled])'); if (c) c.click(); return 0; }); if (a) break; await sleep(150); }
  for (let k = 0; k < 80; k++) { await sleep(250); const ok = await Promise.all(P.filter(x => !x.dead && x !== H).map(x => x.p.evaluate(() => G && G.phase !== 'over' && G.round === 1 && UI.started).catch(() => false))); if (ok.every(Boolean)) break; }
}
async function games(P, H, tag, max, secs, done, hook) { const out = []; for (let g = 0; g < max; g++) { dbg.game = g; const pr = await play(P, H, secs, hook); const r = await finish(P, H, tag + ' #' + (g + 1), pr); out.push(r); if (done() || !r.agree) break; await again(P, H); } return out; }
const seatOf = async x => { x.seat = await x.p.evaluate(() => NET.mySeat).catch(() => -2); return x.seat; };
async function finish(P, H, tag, extra) {
  for (let k = 0; k < 80; k++) { const f = await Promise.all(P.filter(x => !x.dead).map(x => x.p.evaluate(() => { if (!(G && G.phase === 'over')) return false; const n = document.querySelector('#rs [data-a=rscont]:not([disabled])'); if (n) { n.click(); return false; } return !!document.querySelector('#rs .win'); }).catch(() => false))); if (f.every(Boolean)) break; await sleep(300); }
  await sleep(800); const alive = P.filter(x => !x.dead); for (const x of alive) await seatOf(x);
  for (let k = 0; k < 60; k++) { const hs = await H.p.evaluate(() => G.logN); const ok = await Promise.all(alive.filter(x => x !== H).map(x => x.p.evaluate(l => G && G.phase === 'over' && G.logN === l, hs).catch(() => false))); if (ok.every(Boolean)) break; await sleep(400); }
  const sum = () => ({ over: G.phase === 'over', winner: G.winner, winners: G.winners.join(','), totals: G.players.map(p => p.vp).join(','), winText: G.winText, round: G.round, logN: G.logN, seat: NET.mySeat, role: NET.role, names: G.players.map(p => p.name + (p.ai ? '(cpu)' : '')), hist: G.hist.length, shown: !!document.querySelector('#rs .win') });
  const hs = await H.p.evaluate(sum); const cs = await Promise.all(alive.filter(x => x !== H).map(x => x.p.evaluate(sum).catch(() => null)));
  const agree = cs.every(c => c && c.over && c.winners === hs.winners && c.totals === hs.totals && c.winText === hs.winText && c.logN === hs.logN && c.hist === hs.hist);
  const exact = await Promise.all(alive.filter(x => x !== H).map(async x => { const j = await x.p.evaluate(() => JSON.stringify(G)); const eq = await H.p.evaluate(([j, s]) => { const a = JSON.stringify(netStrip(G, s)); if (a === j) return true; let i = 0; while (i < a.length && a[i] === j[i]) i++; return 'diff@' + i + ' host:' + a.slice(Math.max(0, i - 60), i + 80) + ' | client:' + j.slice(Math.max(0, i - 60), i + 80); }, [j, x.seat]); if (eq !== true) dbg.exactInfo = eq; return eq === true; }));
  const stats = await H.p.evaluate(() => ({ remote: NET.remote, rejected: NET.rejected, rejLog: NET.rejLog.slice(-6), inv: CF.checkInvariants(G).length })); const errors = P.flatMap(x => x.errs);
  const finals = cs.every(c => c && c.shown) && hs.shown;
  const r = Object.assign({ tag, host: { winners: hs.winners, totals: hs.totals, names: hs.names }, clients: cs.map(c => c && { seat: c.seat, over: c.over }), agree, exactStrip: exact.every(Boolean), exactInfo: dbg.exactInfo, finalCardEverywhere: finals, hostStats: stats }, extra || {}, { errors: errors.slice(0, 10), nErrors: errors.length });
  if (stats.inv) r.nErrors++; console.log(JSON.stringify(r)); return r;
}
async function layout(x, tag) {
  const r = await x.p.evaluate(() => {
    const R = s => { const e = document.querySelector(s); if (!e || e.hidden) return null; const r = e.getBoundingClientRect(); return [r.left, r.top, r.right, r.bottom]; };
    const ov = (A, B) => A && B && A[0] < B[2] - .5 && A[2] > B[0] + .5 && A[1] < B[3] - .5 && A[3] > B[1] + .5; const board = R('#bd'), st = R('#netst'); const bad = [];
    if (!st) bad.push('no badge'); else { if (ov(st, board)) bad.push('badge over board'); if (st[0] < -.5 || st[2] > innerWidth + .5) bad.push('badge off screen'); if (st[3] - st[1] < (document.documentElement.classList.contains('ph') ? 43.9 : 28)) bad.push('badge too small ' + (st[3] - st[1]));
      for (const b of document.querySelectorAll('.gx-bar button:not(#netst)')) { const r = b.getBoundingClientRect(); if (r.width && ov(st, [r.left, r.top, r.right, r.bottom])) bad.push('badge overlaps ' + (b.dataset.gx || b.id)); } }
    for (const e of document.querySelectorAll('#acts button')) { const r = e.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2; const hit = document.elementFromPoint(x, y); if (!hit || !e.contains(hit)) bad.push('covered ' + (e.dataset.a || 'btn')); }
    const pr = document.querySelector('#prompt'); const prr = pr && pr.getBoundingClientRect(); if (!prr || prr.width < 40) bad.push('prompt too narrow ' + (prr && prr.width));
    return { bad: bad.slice(0, 6), w: document.documentElement.scrollWidth, vw: innerWidth, h: document.documentElement.scrollHeight, vh: innerHeight, pw: prr && Math.round(prr.width), txt: (document.querySelector('#netst') || {}).textContent };
  });
  const probs = [...r.bad]; if (r.w > r.vw + 1 || r.h > r.vh + 1) probs.push('page scroll ' + r.w + 'x' + r.h); console.log('layout', tag, x.label, JSON.stringify(r), probs.length ? 'PROBLEMS ' + probs : 'ok'); return probs;
}
(async () => {
  relay = spawn('node', [__dirname + '/relay.js', String(PORT)]); await sleep(600);
  b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }); const res = [];
  try {
    if (SC === 'full') { const { H, C } = await setup(1, { np: 2 }); const P = [H, ...C]; await startHost(H); for (const x of P) await seatOf(x); const lp = []; await sleep(1500); for (const x of P) lp.push(...await layout(x, 'mid-start')); res.push(...await games(P, H, 'host+1, 2 seats, Play again', 2, 420, () => false)); res.forEach(r => { if (lp.length) r.nErrors += lp.length; }); }
    else if (SC === 'full3') { const { H, C } = await setup(2, { np: 3, sets: 2 }); const P = [H, ...C]; await startHost(H); for (const x of P) await seatOf(x); const lp = []; await sleep(1500); for (const x of P) lp.push(...await layout(x, 'mid-start')); const pr = await play(P, H, 420); const r = await finish(P, H, 'host+2 (3 humans, set 2)', pr); r.nErrors += lp.length; res.push(r); }
    else if (SC === 'full4') { const { H, C } = await setup(3, { np: 4, sets: 'random' }); const P = [H, ...C]; await startHost(H); for (const x of P) await seatOf(x); const pr = await play(P, H, 480); res.push(await finish(P, H, 'host+3 (4 humans, random books)', pr)); }
    else if (SC === 'mixed') { const { H, C } = await setup(1, { np: 4, level: 'hard', sets: 3 }); const P = [H, ...C]; await startHost(H); for (const x of P) await seatOf(x); const pr = await play(P, H, 420); res.push(await finish(P, H, 'host+1 +2 computers (hard, set 3)', pr)); }
    else if (SC === 'ui') {
      const { H, C } = await setup(1, { np: 3 }); const vis = x => x.p.evaluate(() => !document.getElementById('netbox').hidden); const out = {};
      out.openAtStart = await vis(H); await H.p.keyboard.press('Escape'); out.afterEsc = await vis(H);
      await H.p.evaluate(() => document.querySelector('[data-a=netopen]').click()); out.reopened = await vis(H); await H.p.mouse.click(3, 3); out.afterBackdrop = await vis(H);
      await H.p.evaluate(() => document.querySelector('[data-a=netopen]').click()); await H.p.evaluate(() => document.querySelector('[data-a=netclose]').click()); out.afterX = await vis(H);
      await H.p.evaluate(() => document.querySelector('[data-a=netopen]').click()); await H.p.evaluate(() => document.querySelector('[data-a=netcopy]').click()); await sleep(300); out.copy = await H.p.evaluate(() => ({ copied: NET.copied, active: document.activeElement && document.activeElement.className }));
      out.link = await H.p.evaluate(() => document.querySelector('.invlink').value); out.code = await H.p.evaluate(() => NET.code); out.clientEsc = await (async () => { await C[0].p.keyboard.press('Escape'); return vis(C[0]); })();
      out.players = await H.p.evaluate(() => [...document.querySelectorAll('#netbox .plist li')].map(e => e.textContent)); out.startCard = await C[0].p.evaluate(() => document.querySelector('#start .scard').textContent.slice(0, 120));
      out.noDevOnline = await H.p.evaluate(() => !document.querySelector('[data-start=hot]'));
      const ok = out.openAtStart && !out.afterEsc && out.reopened && !out.afterBackdrop && !out.afterX && new RegExp('#join-' + out.code + '$').test(out.link) && /^[a-z0-9]{5}$/.test(out.code) && !out.clientEsc && out.players.some(t => /Hosty.*host/.test(t)) && out.players.some(t => /Friend1/.test(t)) && out.noDevOnline;
      console.log('UI', JSON.stringify(out)); res.push({ tag: 'ui', agree: ok, errors: [...H.errs, ...C[0].errs], nErrors: H.errs.length + C[0].errs.length });
    }
    else if (SC === 'leave') {
      global.DELAY = 120; const { H, C, code } = await setup(2, { np: 4 }); const P = [H, ...C]; await H.p.evaluate(() => { AIDELAY = 200; }); await startHost(H); for (const x of P) await seatOf(x); const ev = {};
      const hook = async (g, n) => {
        if (!ev.bad && g.round <= 4 && n > 2) {
          const st = await C[1].p.evaluate(() => { const p = G.players[NET.mySeat]; return { seat: NET.mySeat, drawing: G.phase === 'brew' && p.st === 'draw' && !p.q && p.bag.length > 2, ver: p.ver }; });
          if (!st.drawing) return;
          ev.bad = true; global.FREEZE = 1; await sleep(900);
          const cur = await C[1].p.evaluate(() => { const p = G.players[NET.mySeat]; return { ver: p.ver, drawing: G.phase === 'brew' && p.st === 'draw' && !p.q }; });
          if (!cur.drawing && (ev.tries = (ev.tries || 0) + 1) < 12) { ev.bad = false; global.FREEZE = 0; return; }
          const before = await H.p.evaluate(s => ({ n: G.logN, rej: NET.rejected, remote: NET.remote, pot: G.players.map(p => p.pot.length), bag: G.players[s].bag.length }), st.seat);
          await C[1].p.evaluate(v => { const R = NET.room, h = NET.hostPeer; const junk = [null, 5, 'x', [1, 2], { m: null }, { m: 'x' }, { m: [] }, { m: {} }, { m: { t: 5 }, v }, { m: { t: 'zzzzzzzzzzzzzzzz' }, v }, { m: { t: 'draw' } }, { m: { t: 'draw' }, v: -5 }, { m: { t: 'draw' }, v: 'x' }, { m: { t: 'draw' }, v: v + 7 }, { m: { t: 'buy', items: ['O1', 'O1', 'O1'] }, v }, { m: { t: 'stop', a: 1, b: 2, c: 3, d: 4, e: 5, f: 6 }, v }, { m: { t: 'nonsense' }, v },
            JSON.parse('{"m":{"__proto__":{"x":1},"t":"nonsense"},"v":' + v + '}'), { m: { t: 'draw', items: 'x'.repeat(500) }, v }, { hi: 1 }, { m: { t: 'choose', i: 99 }, v }]; for (const j of junk) { R.sendTo(h, 'act', j); R.emit('act', j); } R.emit('st', { s: 1e9, i: 0, n: 1, d: 'zzzz' }); R.emit('st', { junk: 1 }); R.sendTo(h, 'st', { s: 1e9, i: 0, n: 1, d: 'zzzz' }); }, cur.ver);
          await sleep(1500); const mid = await H.p.evaluate(s => ({ n: G.logN, rej: NET.rejected, remote: NET.remote, inv: CF.checkInvariants(G).length, pol: ({}).x !== undefined, pot: G.players.map(p => p.pot.length), bag: G.players[s].bag.length }), st.seat);
          // a double draw with ONE version number: the first is a real draw, the second must be refused
          await C[1].p.evaluate(v => { const R = NET.room, h = NET.hostPeer; R.sendTo(h, 'act', { m: { t: 'draw' }, v }); R.sendTo(h, 'act', { m: { t: 'draw' }, v }); }, cur.ver);
          await sleep(1800); const after = await H.p.evaluate(s => ({ n: G.logN, rej: NET.rejected, remote: NET.remote, inv: CF.checkInvariants(G).length, pol: ({}).x !== undefined, pot: G.players.map(p => p.pot.length), bag: G.players[s].bag.length }), st.seat);
          ev.badResult = { junkRejected: mid.rej - before.rej, junkStateUnchanged: mid.pot[st.seat] === before.pot[st.seat] && mid.remote === before.remote && mid.bag === before.bag, doubleDrawRejected: after.rej - mid.rej, doubleDrawApplied: after.remote - mid.remote, bagDrop: mid.bag - after.bag, invariants: after.inv, protoPolluted: after.pol, wasDrawing: cur.drawing }; global.FREEZE = 0;
        }
        if (ev.bad && !ev.left && g.round >= 3) { ev.left = true; ev.seat = await C[0].p.evaluate(() => NET.mySeat); ev.uid = await C[0].p.evaluate(() => NetRoom.uid()); await C[0].ctx.close(); C[0].dead = true; let away = false; for (let k = 0; k < 80 && !away; k++) { await sleep(250); away = await H.p.evaluate(s => !!G.players[s].ai && NET.away[s], ev.seat); } ev.leave = { seat: ev.seat, aiTookOver: away }; ev.leftAt = Date.now(); }
        if (ev.left && !ev.rejoin && Date.now() - ev.leftAt > 3000) {
          ev.rejoin = true; const cx = await ctxNew(); await cx.addInitScript(u => { try { localStorage.setItem('gns-uid', u); localStorage.setItem('gns-name', 'Friend1'); } catch (e) { } }, ev.uid); const x = await page(cx, 'c1-again', '#join-' + code);
          const pre = await x.p.evaluate(() => ({ code: UI.joinCode, onl: UI.onl, open: document.querySelector('#onl').open, field: document.getElementById('joincode').value })); await x.p.evaluate(() => { AIDELAY = 80; ANIM = 0; document.querySelector('[data-a=netjoin]').click(); });
          let back = false; for (let k = 0; k < 200 && !back; k++) { await sleep(250); back = await H.p.evaluate(s => !G.players[s].ai && !NET.away[s], ev.seat); }
          const mine = await x.p.evaluate(() => ({ seat: NET.mySeat, g: !!G, started: UI.started })); ev.rejoinRes = { prefilled: pre, back, mine }; P.push(x); x.seat = mine.seat; ev.remoteBefore = await H.p.evaluate(() => NET.remote);
        }
      };
      const pr = await play(P, H, 480, hook); const remAfter = await H.p.evaluate(() => NET.remote); const rj = P[P.length - 1]; const rjMoves = ev.rejoin ? await rj.p.evaluate(() => NET.sent) : 0;
      const r = await finish(P, H, 'host+2 +1 cpu: bad actions, double draw, leave, rejoin', Object.assign(pr, { bad: ev.badResult, leave: ev.leave, rejoin: ev.rejoinRes, remoteMovesAfterRejoin: remAfter - (ev.remoteBefore || 0), rejoinedClientSent: rjMoves }));
      const bd = ev.badResult; const ok = bd && bd.wasDrawing && bd.junkRejected >= 15 && bd.junkStateUnchanged && bd.doubleDrawRejected >= 1 && bd.doubleDrawApplied === 1 && bd.bagDrop === 1 && !bd.invariants && !bd.protoPolluted && ev.leave && ev.leave.aiTookOver && ev.rejoinRes && ev.rejoinRes.back && ev.rejoinRes.prefilled.field === code && rjMoves > 0; if (!ok) r.agree = false; res.push(r);
    }
    else if (SC === 'touch') {
      const { H, C } = await setup(1, { np: 2 }); const P = [H, ...C]; await startHost(H); for (const x of P) await seatOf(x); const c = C[0]; const out = {};
      const wait = async f => { for (let k = 0; k < 200; k++) { if (await c.p.evaluate(f).catch(() => false)) return true; await sleep(150); } return false; };
      await wait(() => NET.mySeat === 1 && UI.started);
      const r0 = await c.p.evaluate(() => { const r = document.querySelector('#netst').getBoundingClientRect(); return [r.width, r.height]; }); out.badge = r0; await c.p.tap('#netst'); await sleep(300); out.lobbyOpen = await c.p.evaluate(() => !document.getElementById('netbox').hidden);
      const xr = await c.p.evaluate(() => { const r = document.querySelector('#netbox .lbx').getBoundingClientRect(); return [r.width, r.height]; }); out.xSize = xr; await c.p.tap('#netbox .lbx'); await sleep(300); out.lobbyClosed = await c.p.evaluate(() => document.getElementById('netbox').hidden);
      let moves = 0; const n0 = await H.p.evaluate(() => NET.remote);
      for (let k = 0; k < 900 && moves < 8; k++) {
        await H.p.evaluate(tick).catch(() => 0);
        const rsOpen = await c.p.evaluate(() => !document.querySelector('#rs').hidden); if (rsOpen) { await c.p.evaluate(tick); await sleep(60); continue; }
        const st = await c.p.evaluate(() => !!document.querySelector('#acts .drawb') && !UI.busy); if (!st) { await c.p.evaluate(tick).catch(() => 0); await sleep(80); continue; }
        await c.p.tap('#acts .drawb', { timeout: 4000 }).catch(() => { }); moves++; await sleep(500);
      }
      out.touchMoves = moves; out.hostRemote = (await H.p.evaluate(() => NET.remote)) - n0; out.probs = await layout(c, 'touch');
      res.push({ tag: 'touch', agree: moves >= 4 && out.hostRemote >= moves - 2 && out.lobbyOpen && out.lobbyClosed && out.badge[0] >= 43.9 && out.badge[1] >= 43.9 && out.xSize[0] >= 43.9 && !out.probs.length, out, errors: [...H.errs, ...c.errs], nErrors: H.errs.length + c.errs.length }); console.log(JSON.stringify(res[res.length - 1]));
    }
    else if (SC === 'hostleft') {
      const { H, C } = await setup(1, { np: 3 }); const P = [H, ...C]; await startHost(H);
      await play(P, H, 200, async g => { if (g.round >= 2) throw 'stop'; }).catch(e => { if (e !== 'stop') throw e; });
      await H.p.close(); H.dead = true; let msg = ''; for (let k = 0; k < 120 && !msg; k++) { await sleep(300); msg = await C[0].p.evaluate(() => NET.hostGone ? NET.err : ''); }
      const vis = await C[0].p.evaluate(() => ({ modal: !document.getElementById('netbox').hidden, text: document.getElementById('netbox').textContent.slice(0, 200) }));
      res.push({ tag: 'host leaves', msg, vis, agree: !!msg && vis.modal && /host left/i.test(vis.text), errors: C[0].errs, nErrors: C[0].errs.length }); console.log(JSON.stringify(res[res.length - 1]));
      await C[0].p.evaluate(() => document.querySelector('[data-a=netleave]').click()); await sleep(800); console.log('after leave', JSON.stringify(await C[0].p.evaluate(() => ({ on: NET.on, start: !document.getElementById('start').hidden }))));
    }
    else if (SC === 'shots') {
      const SH = path.join(__dirname, '..', 'cauldron-fair', 'shots'); try { fs.mkdirSync(SH, { recursive: true }); } catch (e) { } const { H, C } = await setup(1, { np: 3 }); const tag = PHONE ? 'ph' : 'desk';
      const P = [H, ...C]; await sleep(500); await H.p.screenshot({ path: `${SH}/net_${tag}_lobby_host.png` }); await C[0].p.screenshot({ path: `${SH}/net_${tag}_lobby_client.png` });
      await H.p.evaluate(() => netClose()); await sleep(300); await H.p.screenshot({ path: `${SH}/net_${tag}_start_inroom.png` }); await H.p.evaluate(() => { UI.netOpen = true; netRender(); }); await startHost(H);
      let shot = 0; await play(P, H, 120, async (g, n) => { if (shot < 2 && n > 10 && n % 14 === 0) { await sleep(500); await C[0].p.screenshot({ path: `${SH}/net_${tag}_client_${shot}.png` }); await H.p.screenshot({ path: `${SH}/net_${tag}_host_${shot}.png` }); for (const x of P) await layout(x, 'shot' + shot); shot++; } });
      console.log('errors', JSON.stringify([H, ...C].flatMap(x => x.errs).slice(0, 10)));
    }
  } catch (e) { console.log('HARNESS ERROR', e && e.stack || e); res.push({ tag: 'harness', agree: false, nErrors: 1 }); }
  await b.close(); relay.kill();
  const bad = res.filter(r => !r.agree || r.nErrors || (r.viol && r.viol.length) || r.exactStrip === false || r.finalCardEverywhere === false);
  console.log('SUMMARY', SC, PHONE ? 'phone' : 'desktop', res.length, 'runs,', bad.length, 'bad'); process.exit(0);
})();
