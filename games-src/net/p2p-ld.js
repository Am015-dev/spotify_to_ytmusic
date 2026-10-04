// Real WebRTC test for Lantern Dive: host + clients in separate Chromium contexts (NO proxy), local Nostr relay.
// PW=<path>/playwright PORT=17791 node net/p2p-ld.js lantern-dive/game/lantern-dive.html SCENARIO
//   SCENARIO: full (host + 1 client, 2 seats, 2 dives through Play again) | full3 (host + 2 clients) | full2 (host + 2 clients + 1 computer, 4 seats)
//             | full5 (host + 4 clients) | leave (host + 2: bad actions, leave, rejoin) | ui | hostleft | touch | shots
// PHONE=1 (or p2p-ld-phone.js): 390x844 touch contexts, ?phone=1, plus layout checks for the online badge and the lobby.
const { chromium } = require(process.env.PW); const fs = require('fs'); const { spawn } = require('child_process'); const path = require('path');
const file = process.argv[2], SC = process.argv[3] || 'full'; const html = fs.readFileSync(file); const PORT = +process.env.PORT || 17791; const PHONE = process.env.PHONE === '1';
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
  await H.p.evaluate(o => { AIDELAY = o.delay || 80; ANIM = 0; const oo = optObj(); oo.kind = 'log'; oo.mission = o.mission || 7; setNp(o.np); if (!document.querySelector('#onl')) document.querySelector('#start [data-a=online]').click(); if (!document.querySelector('#onl').open) document.querySelector('#onl summary').click(); document.getElementById('netname').value = 'Hosty'; document.querySelector('[data-a=nethost]').click(); }, opt);
  let code = ''; for (let k = 0; k < 60 && !code; k++) { await sleep(100); code = await H.p.evaluate(() => NET.on ? NET.code : ''); }
  for (const [i, c] of C.entries()) await c.p.evaluate(([code, i]) => { AIDELAY = 80; ANIM = 0; if (!document.querySelector('#onl')) document.querySelector('#start [data-a=online]').click(); if (!document.querySelector('#onl').open) document.querySelector('#onl summary').click(); document.getElementById('netname').value = 'Friend' + (i + 1); document.getElementById('joincode').value = code; document.querySelector('[data-a=netjoin]').click(); }, [code, i]);
  const t0 = Date.now(); while (Date.now() - t0 < 40000) { const n = await H.p.evaluate(() => NET.peers.length); const m = await Promise.all(C.map(c => c.p.evaluate(() => NET.peers.length))); if (n >= ncl + 1 && m.every(x => x >= ncl + 1)) break; await sleep(250); }
  await sleep(1500); const lobby = await H.p.evaluate(() => netPlayers().map(p => p.nm)); const cl = await Promise.all(C.map(c => c.p.evaluate(() => ({ open: UI.netOpen, pl: netPlayers().map(p => p.nm), opt: !!NET.opt, hostPeer: !!NET.hostPeer }))));
  console.log('lobby after', Date.now() - t0, 'ms host sees', JSON.stringify(lobby), 'clients see', JSON.stringify(cl)); return { H, C, code };
}
const startHost = H => H.p.evaluate(() => document.querySelector('[data-a=netstart]').click());
// one random human step through the page's own DOM, for the page's own seat only (port of click.js)
const tick = () => {
  if (typeof G === 'undefined' || !G || !UI.started) return 0; const d = document, R = Math.random, rnd = a => a[Math.floor(R() * a.length)], q = s => [...d.querySelectorAll(s)].filter(b => !b.disabled && !b.closest('[hidden]')), click = el => { el.dispatchEvent(new MouseEvent('click', { bubbles: true })); return 1; };
  const nb = d.getElementById('netbox'); if (nb && !nb.hidden && UI.netOpen && R() < .5) { UI.netOpen = false; netRender(); }
  const rs = d.getElementById('rs'); if (rs && !rs.hidden) return 0;
  if (G.phase === 'over') return 0;
  const v = NET.mySeat; const mine = v >= 0 && iMustAct() && canAct();
  if (!mine) { if (R() < .04) { const all = q('.op[data-seat],.jc,#hand .hc'); if (all.length) click(rnd(all)); } else if (R() < .03) { const x = d.querySelector('#ppop [data-a=popx]'); if (x) click(x); } return 0; }
  const r = R(); if (d.querySelector('#ppop:not([hidden])') && r < .5) { click(d.querySelector('#ppop [data-a=popx]')); return 0; }
  const ph = G.phase, acts = q('#acts [data-a]'), A = a => acts.filter(b => b.dataset.a === a);
  if (r < .03) { const c = q('.jc'); if (c.length) { click(rnd(c)); return 0; } }
  if (r < .06) { const em = q('[data-a=emote]'); if (em.length) { click(rnd(em)); return 0; } }
  if (ph === 'assign') { const pool = q('#pool .jcard'); if (pool.length && UI.job < 0 && A('take').length) { click(rnd(pool)); return 1; } if (pool.length && UI.job >= 0 && A('take').length && !A('take')[0].disabled) return click(A('take')[0]); const o = acts.filter(b => ['pass', 'done', 'keep', 'offer', 'accept', 'decline', 'yes', 'no', 'vote'].includes(b.dataset.a)); if (o.length) return click(rnd(o)); if (pool.length) return click(rnd(pool)); return 0; }
  if (ph === 'distress') { const b = rnd(acts); return b ? click(b) : 0; }
  if (ph === 'pass') { if (UI.giveSel < 0) { const cs = q('#hand .hc:not(.dim)'); if (cs.length) return click(rnd(cs)); return 0; } const g = A('give'); return g.length && !g[0].disabled ? click(g[0]) : 0; }
  if (ph === 'predict') { const b = rnd(A('predict')); return b ? click(b) : 0; }
  if (ph === 'signal' || ph === 'play') {
    if (UI.pingSel) { if (UI.sel < 0) { const cs = q('#hand .hc.pk'); if (cs.length) return click(rnd(cs)); if (A('noping').length) return click(A('noping')[0]); return 0; } const dp = A('doping'); return dp.length ? click(dp[0]) : 0; }
    if (ph === 'signal') { if (R() < .5 && A('signal').length) return click(A('signal')[0]); const ns = A('nosig'); return ns.length ? click(ns[0]) : 0; }
    if (R() < .05 && A('signal').length) return click(A('signal')[0]);
    const helper = G.players[G.trick.turn].helper; const cards = helper ? q('#opp .dc.can') : q('#hand .hc:not(.dim)'); if (!cards.length) { window.__noCard = (window.__noCard || 0) + 1; return 0; }
    const pb = A('playcard'); if (UI.sel >= 0 && pb.length && R() < .5) return click(pb[0]);
    const c = rnd(cards); click(c); if (R() < .5 && UI.sel >= 0) { const c2 = d.querySelector(helper ? `#opp .dc[data-id="${UI.sel}"]` : `#hand .hc[data-id="${UI.sel}"]`); if (c2) click(c2); } return 1;
  }
  return 0;
};
// ---- hidden-information checks. Truth = the host's real G; a page may only hold what its own seat may see ----
const hostTruth = () => ({ gid: NET.gid, att: G.att, hands: G.players.map(p => p.hand.slice()), rng: G.rng, seed: G.seed });
const ALLOWED = 'v hn np two helper att logN evN mission distress clock clockLeft clockRun timerOn comm unk pool tasks pl pings tricks phase result trick left offered ntr firstW lastCard as cap actor sig pass tdeck tdisc used players log events rng seed nolog'.split(' ');
const PLF = 'seat name ai hand stacks pingUsed mem helper'.split(' ');
const pageCheck = T => {
  const out = []; const v = NET.mySeat; if (!G || NET.gid !== T.gid) return out;
  const bad = (g, s, where) => {
    g.players.forEach((p, i) => { for (const k of Object.keys(p)) if (!PLF.includes(k)) out.push(where + ': player field ' + k); if (i !== s && !p.helper) { if (p.hand.some(c => c >= 0)) out.push(where + ': hand of seat ' + i); if (p.mem && Object.keys(p.mem).length) out.push(where + ': memory of seat ' + i); } if (p.helper && p.stacks) for (const st of p.stacks) for (let j = 1; j < st.length; j++) if (st[j] >= 0) out.push(where + ': card under the drone pile'); });
    if (typeof g.tdeck !== 'number') out.push(where + ': deck order'); if (g.rng || g.seed) out.push(where + ': rng/seed');
    for (const k of Object.keys(g)) if (!ALLOWED.includes(k)) out.push(where + ': unlisted field ' + k);
    if (g.as && g.as.votes) for (const k in g.as.votes) if (+k !== s && g.as.votes[k] !== -1) out.push(where + ': vote of ' + k);
    if (g.pass && g.pass.give) for (const k in g.pass.give) if (+k !== s && g.pass.give[k] !== -1) out.push(where + ': pass choice of ' + k);
  };
  const mine = v >= 0 ? G.players[v].hand : []; for (const el of document.querySelectorAll('#hand .hc')) if (!mine.includes(+el.dataset.id)) out.push('dom: card ' + el.dataset.id + ' in the hand strip of seat ' + v);
  if (NET.role === 'client') {
    bad(G, v, 'state');
    for (const t of (NET.trace || [])) { const o = JSON.parse(t); if (!o.g) continue; bad(o.g, o.seat, 'packet'); if (o.evs) for (const e of o.evs) if (!['deal', 'play', 'trick', 'swap', 'take', 'ping', 'over', 'job', 'att'].includes(e.t) && !/^[a-z]+$/.test(e.t)) out.push('packet: odd event ' + e.t); }
    if (NET.trace && NET.trace.length > 30) NET.trace = NET.trace.slice(-12);
  }
  return out;
};
const dbg = { game: 0 };
async function play(P, H, secs, hook) {
  let clicks = 0, remoteClicks = 0, checks = 0; const viol = []; const t0 = Date.now(); let n = 0, lastK = '', lastT = Date.now();
  while (Date.now() - t0 < secs * 1000) {
    const g = await H.p.evaluate(() => G && { over: G.phase === 'over', att: G.att, k: G.logN + '/' + G.phase + '/' + (G.trick ? G.trick.plays.length : 0) }).catch(() => null); if (!g || g.over) break;
    if (g.k !== lastK) { lastK = g.k; lastT = Date.now(); } else if (Date.now() - lastT > 40000) { lastT = Date.now(); const v = await Promise.all(P.filter(x => !x.dead).map(x => x.p.evaluate(() => ({ seat: NET.mySeat, k: G && G.logN, phase: G && G.phase, pend: G && LD.pending(G), rx: NET.rx, bad: NET.bad, badE: NET.badE, rej: NET.rejected, peers: NET.peers.length, busy: UI.busy, must: iMustAct() && canAct() })).catch(e => String(e)))); console.log('STALL?', JSON.stringify(v)); }
    if (hook) await hook(g, n);
    for (const x of P) { if (x.dead || global.FREEZE === x || global.FREEZE === 1) continue; const k = await x.p.evaluate(tick).catch(e => { x.errs.push(x.label + ' tick ' + e.message); return 0; }); clicks += k; if (x !== H) remoteClicks += k; }
    if (++n % 6 === 0) { const T = await H.p.evaluate(hostTruth).catch(() => null); if (T) for (const x of P) { if (x.dead) continue; const o = await x.p.evaluate(pageCheck, T).catch(() => []); checks++; if (o.length && viol.length < 8) viol.push(x.label + ': ' + o.slice(0, 3).join('; ')); } }
    await sleep(global.DELAY || 40);
  }
  return { clicks, remoteClicks, checks, viol, secs: Math.round((Date.now() - t0) / 1000) };
}
async function again(P, H) {
  console.log('again: host before', JSON.stringify(await H.p.evaluate(() => ({ phase: G.phase, gid: NET.gid, rs: !!document.querySelector('#rs [data-a=again]'), btns: [...document.querySelectorAll('#rs button')].map(b => b.dataset.a), host: isHost() })))); // the host presses Play again (a won dive) or Try again (a lost one) on the result card; clients must show a fresh attempt
  for (let k = 0; k < 30; k++) { const a = await H.p.evaluate(() => { const b = document.querySelector('#rs [data-a=again],#rs [data-a=retrysame],#rs [data-a=retrynew]'); if (b) { b.click(); return 1; } return 0; }); if (a) break; await sleep(150); }
  for (let k = 0; k < 80; k++) { await sleep(250); const ok = await Promise.all(P.filter(x => !x.dead && x !== H).map(x => x.p.evaluate(() => G && G.phase !== 'over' && UI.started).catch(() => false))); if (ok.every(Boolean)) break; }
  console.log('again: host after', JSON.stringify(await H.p.evaluate(() => ({ phase: G.phase, gid: NET.gid, att: G.att }))));
}
async function games(P, H, tag, max, secs, done, hook) { const out = []; for (let g = 0; g < max; g++) { dbg.game = g; const pr = await play(P, H, secs, hook); const r = await finish(P, H, tag + ' #' + (g + 1), pr); out.push(r); if (done() || !r.agree) break; await again(P, H); } return out; }
const seatOf = async x => { x.seat = await x.p.evaluate(() => NET.mySeat).catch(() => -2); return x.seat; };
async function finish(P, H, tag, extra) {
  for (let k = 0; k < 60; k++) { const f = await Promise.all(P.filter(x => !x.dead).map(x => x.p.evaluate(() => G && G.phase === 'over' && !!document.querySelector('#rs [data-a=again],#rs [data-a=rsclose]')).catch(() => false))); if (f.every(Boolean)) break; await sleep(300); }
  await sleep(800); const alive = P.filter(x => !x.dead); for (const x of alive) await seatOf(x);
  for (let k = 0; k < 60; k++) { const hs = await H.p.evaluate(() => G.logN); const ok = await Promise.all(alive.filter(x => x !== H).map(x => x.p.evaluate(l => G && G.phase === 'over' && G.logN === l, hs).catch(() => false))); if (ok.every(Boolean)) break; await sleep(400); }
  const sum = () => ({ over: G.phase === 'over', ok: G.result && G.result.ok, why: G.result && G.result.why, att: G.att, tricks: G.tricks.length, logN: G.logN, jobs: G.tasks.map(t => t.owner + ':' + (t.done ? 1 : 0)).join(','), seat: NET.mySeat, role: NET.role, names: G.players.map(p => p.name + (p.ai ? '(cpu)' : '')), shown: !!document.querySelector('#rs .rsbox'), tricksW: JSON.stringify(G.tricks.map(t => t.w)) });
  const hs = await H.p.evaluate(sum); const cs = await Promise.all(alive.filter(x => x !== H).map(x => x.p.evaluate(sum).catch(() => null)));
  const agree = cs.every(c => c && c.over && c.ok === hs.ok && c.why === hs.why && c.tricks === hs.tricks && c.logN === hs.logN && c.tricksW === hs.tricksW);
  const exact = await Promise.all(alive.filter(x => x !== H).map(async x => { const j = await x.p.evaluate(() => JSON.stringify(G)); const eq = await H.p.evaluate(([j, s]) => { const a = JSON.stringify(netStrip(G, s)); if (a === j) return true; let i = 0; while (i < a.length && a[i] === j[i]) i++; return 'diff@' + i + ' host:' + a.slice(Math.max(0, i - 60), i + 80) + ' | client:' + j.slice(Math.max(0, i - 60), i + 80); }, [j, x.seat]); if (eq !== true) dbg.exactInfo = eq; return eq === true; }));
  const stats = await H.p.evaluate(() => ({ remote: NET.remote, rejected: NET.rejected, rejLog: NET.rejLog.slice(-6), inv: LD.checkInvariants(G).length })); const errors = P.flatMap(x => x.errs);
  const finals = cs.every(c => c && c.shown) && hs.shown;
  const r = Object.assign({ tag, host: { ok: hs.ok, why: hs.why, tricks: hs.tricks, att: hs.att, names: hs.names }, clients: cs.map(c => c && { seat: c.seat, over: c.over }), agree, exactStrip: exact.every(Boolean), exactInfo: dbg.exactInfo, finalCardEverywhere: finals, hostStats: stats }, extra || {}, { errors: errors.slice(0, 5), nErrors: errors.length + stats.inv + ((extra && extra.viol && extra.viol.length) || 0) });
  if (stats.inv) r.nErrors++; console.log(JSON.stringify(r)); return r;
}
async function layout(x, tag) { // phone/desktop: the online badge fits, nothing covers the board
  const r = await x.p.evaluate(() => {
    const R = s => { const e = document.querySelector(s); if (!e || e.hidden) return null; const r = e.getBoundingClientRect(); return [r.left, r.top, r.right, r.bottom]; };
    const ov = (A, B) => A && B && A[0] < B[2] - .5 && A[2] > B[0] + .5 && A[1] < B[3] - .5 && A[3] > B[1] + .5; const board = R('#bd'), st = R('#netst'); const bad = [];
    if (!st) bad.push('no badge'); else { if (ov(st, board)) bad.push('badge over board'); if (st[0] < -.5 || st[2] > innerWidth + .5) bad.push('badge off screen'); if (st[3] - st[1] < (document.documentElement.classList.contains('ph') ? 43.9 : 28)) bad.push('badge too small ' + (st[3] - st[1]));
      for (const b of document.querySelectorAll('.gx-bar button:not(#netst)')) { const r = b.getBoundingClientRect(); if (r.width && ov(st, [r.left, r.top, r.right, r.bottom])) bad.push('badge overlaps ' + (b.dataset.gx || b.id)); } }
    for (const e of document.querySelectorAll('#hand .hc:not(.dim),#opp .op')) { const r = e.getBoundingClientRect(); let x = r.left + 6; const y = r.top + r.height / 2; if (e.closest('#hand')) { const bl = document.querySelector('#hand').getBoundingClientRect(); if (x < bl.left + 1 || x > bl.right - 1) continue; } else x = r.left + r.width / 2; const hit = document.elementFromPoint(x, y); if (!hit || !e.contains(hit)) bad.push('covered ' + (e.dataset.a || e.className) + ' by ' + (hit && (hit.id || hit.className))); }
    const pr = document.querySelector('#prompt'); const prr = pr && pr.getBoundingClientRect(); if (!prr || prr.width < 40) bad.push('prompt too narrow ' + (prr && prr.width));
    return { bad: bad.slice(0, 6), w: document.documentElement.scrollWidth, vw: innerWidth, h: document.documentElement.scrollHeight, vh: innerHeight, pw: prr && Math.round(prr.width), txt: (document.querySelector('#netst') || {}).textContent };
  });
  const probs = [...r.bad]; if (r.w > r.vw + 1 || r.h > r.vh + 1) probs.push('page scroll ' + r.w + 'x' + r.h); console.log('layout', tag, x.label, JSON.stringify(r), probs.length ? 'PROBLEMS ' + probs : 'ok'); return probs;
}
(async () => {
  relay = spawn('node', [__dirname + '/relay.js', String(PORT)]); await sleep(600);
  b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }); const res = [];
  try {
    if (SC === 'full') { const { H, C } = await setup(1, { np: 2, mission: 3 }); const P = [H, ...C]; await startHost(H); for (const x of P) await seatOf(x); const lp = []; await sleep(1500); for (const x of P) lp.push(...await layout(x, 'mid-start')); res.push(...await games(P, H, 'host+1, 2 seats (drone), Try again / Play again', 2, 420, () => false)); res.forEach(r => { if (lp.length) r.nErrors += lp.length; }); }
    else if (SC === 'full3') { const { H, C } = await setup(2, { np: 3, mission: 7 }); const P = [H, ...C]; await startHost(H); for (const x of P) await seatOf(x); const lp = []; await sleep(1500); for (const x of P) lp.push(...await layout(x, 'mid-start')); const pr = await play(P, H, 420); const r = await finish(P, H, 'host+2 (3 humans)', pr); r.nErrors += lp.length; res.push(r); }
    else if (SC === 'full2') { const { H, C } = await setup(2, { np: 4, mission: 6 }); const P = [H, ...C]; await startHost(H); for (const x of P) await seatOf(x); const pr = await play(P, H, 420); res.push(await finish(P, H, 'host+2 +1 computer (4 seats, vote)', pr)); }
    else if (SC === 'full5') { const { H, C } = await setup(4, { np: 5, mission: 9 }); const P = [H, ...C]; await startHost(H); for (const x of P) await seatOf(x); const pr = await play(P, H, 500); res.push(await finish(P, H, 'host+4 (5 humans, murky)', pr)); }
    else if (SC === 'ui') {
      const { H, C } = await setup(1, { np: 3 }); const vis = x => x.p.evaluate(() => !document.getElementById('netbox').hidden); const out = {};
      out.openAtStart = await vis(H); await H.p.keyboard.press('Escape'); out.afterEsc = await vis(H);
      await H.p.evaluate(() => document.querySelector('[data-a=netopen]').click()); out.reopened = await vis(H); await H.p.mouse.click(3, 3); out.afterBackdrop = await vis(H);
      await H.p.evaluate(() => document.querySelector('[data-a=netopen]').click()); await H.p.evaluate(() => document.querySelector('[data-a=netclose]').click()); out.afterX = await vis(H);
      await H.p.evaluate(() => document.querySelector('[data-a=netopen]').click()); await H.p.evaluate(() => document.querySelector('[data-a=netcopy]').click()); await sleep(300); out.copy = await H.p.evaluate(() => ({ copied: NET.copied }));
      out.link = await H.p.evaluate(() => document.querySelector('.invlink').value); out.code = await H.p.evaluate(() => NET.code); out.clientEsc = await (async () => { await C[0].p.keyboard.press('Escape'); return vis(C[0]); })();
      out.players = await H.p.evaluate(() => [...document.querySelectorAll('#netbox .plist li')].map(e => e.textContent)); out.startCard = await C[0].p.evaluate(() => document.querySelector('#start .scard').textContent.slice(0, 120));
      out.noDevOnline = await H.p.evaluate(() => !document.querySelector('[data-start=hot]'));
      const ok = out.openAtStart && !out.afterEsc && out.reopened && !out.afterBackdrop && !out.afterX && new RegExp('#join-' + out.code + '$').test(out.link) && /^[a-z0-9]{5}$/.test(out.code) && !out.clientEsc && out.players.some(t => /Hosty.*host/.test(t)) && out.players.some(t => /Friend1/.test(t)) && out.noDevOnline;
      console.log('UI', JSON.stringify(out)); res.push({ tag: 'ui', agree: ok, errors: [...H.errs, ...C[0].errs], nErrors: H.errs.length + C[0].errs.length });
    }
    else if (SC === 'leave') {
      global.DELAY = 250; const { H, C, code } = await setup(2, { np: 4, mission: 7 }); const P = [H, ...C]; await H.p.evaluate(() => { AIDELAY = 300; }); await startHost(H); for (const x of P) await seatOf(x); const ev = {};
      const hook = async (g, n) => {
        if (!ev.bad && g.k.split('/')[1] === 'play') {
          ev.bad = true; global.FREEZE = 1; await sleep(700);
          const before = await H.p.evaluate(() => ({ n: G.logN, rej: NET.rejected, remote: NET.remote, hands: G.players.map(p => p.hand.length) }));
          await C[1].p.evaluate(() => { const R = NET.room, h = NET.hostPeer; const junk = [null, 5, 'x', [1, 2], { m: null }, { m: 'x' }, { m: [] }, { m: {} }, { m: { t: 5 } }, { m: { t: 'play', c: '99' } }, { m: { t: 'play', c: -1 } }, { m: { t: 'play', c: 1e9 } }, { m: { t: 'play', c: 0, extra: 1 } }, { m: { t: 'play', c: { a: 1 } } }, { m: { t: 'zzzzzzzzzzzzzzzz' } }, { m: { t: 'play', c: 0 }, x: 1 }, { m: { t: 'play', c: 99 } }, { m: { t: 'take', i: 'x' } },
            JSON.parse('{"m":{"__proto__":{"x":1},"t":"play","c":0}}'), { m: { t: 'x'.repeat(500) } }, { hi: 1 }]; for (const j of junk) { R.sendTo(h, 'act', j); R.emit('act', j); } R.emit('st', { s: 1e9, i: 0, n: 1, d: 'zzzz' }); R.emit('st', { junk: 1 }); R.sendTo(h, 'st', { s: 1e9, i: 0, n: 1, d: 'zzzz' }); });
          await sleep(1200); const mid = await H.p.evaluate(() => ({ n: G.logN, rej: NET.rejected, remote: NET.remote, inv: LD.checkInvariants(G).length, pol: ({}).x !== undefined, hands: G.players.map(p => p.hand.length) }));
          // a card the sender does not hold, and the other seat's card
          await C[0].p.evaluate(() => { const other = G.players.find((p, i) => i !== NET.mySeat && !p.helper); NET.room.sendTo(NET.hostPeer, 'act', { m: { t: 'play', c: 39 } }); NET.room.sendTo(NET.hostPeer, 'act', { m: { t: 'play', c: 0 } }); NET.room.sendTo(NET.hostPeer, 'act', { m: { t: 'pass' } }); });
          await sleep(1200); const after = await H.p.evaluate(() => ({ n: G.logN, rej: NET.rejected, remote: NET.remote, inv: LD.checkInvariants(G).length, pol: ({}).x !== undefined, hands: G.players.map(p => p.hand.length) }));
          ev.badResult = { junkRejected: mid.rej - before.rej, otherRejected: after.rej - mid.rej, stateUnchanged: JSON.stringify(after.hands) === JSON.stringify(before.hands) && after.remote === before.remote, invariants: after.inv, protoPolluted: after.pol }; global.FREEZE = 0;
        }
        if (!ev.left && ev.bad && !global.FREEZE && g.k.split('/')[1] === 'play' && (await H.p.evaluate(() => G.tricks.length)) >= 2) { ev.left = true; ev.seat = await C[0].p.evaluate(() => NET.mySeat); ev.uid = await C[0].p.evaluate(() => NetRoom.uid()); await C[0].ctx.close(); C[0].dead = true; let away = false; for (let k = 0; k < 80 && !away; k++) { await sleep(250); away = await H.p.evaluate(s => !!G.players[s].ai && NET.away[s], ev.seat); } ev.leave = { seat: ev.seat, aiTookOver: away }; ev.leftAt = Date.now(); }
        if (ev.left && !ev.rejoin && Date.now() - ev.leftAt > 3000) {
          ev.rejoin = true; const cx = await ctxNew(); await cx.addInitScript(u => { try { localStorage.setItem('gns-uid', u); localStorage.setItem('gns-name', 'Friend1'); } catch (e) { } }, ev.uid); const x = await page(cx, 'c1-again', '#join-' + code);
          const pre = await x.p.evaluate(() => ({ code: UI.joinCode, field: document.getElementById('joincode').value })); await x.p.evaluate(() => { AIDELAY = 80; ANIM = 0; document.querySelector('[data-a=netjoin]').click(); });
          let back = false; for (let k = 0; k < 200 && !back; k++) { await sleep(250); back = await H.p.evaluate(s => !G.players[s].ai && !NET.away[s], ev.seat); }
          const mine = await x.p.evaluate(() => ({ seat: NET.mySeat, g: !!G, started: UI.started })); ev.rejoinRes = { prefilled: pre, back, mine }; P.push(x); x.seat = mine.seat; ev.remoteBefore = await H.p.evaluate(() => NET.remote);
        }
      };
      const pr = await play(P, H, 420, hook); const remAfter = await H.p.evaluate(() => NET.remote); const rj = P[P.length - 1]; const rjMoves = ev.rejoin ? await rj.p.evaluate(() => NET.sent) : 0;
      const r = await finish(P, H, 'host+2: bad actions, leave, rejoin', Object.assign(pr, { bad: ev.badResult, leave: ev.leave, rejoin: ev.rejoinRes, remoteMovesAfterRejoin: remAfter - (ev.remoteBefore || 0), rejoinedClientSent: rjMoves }));
      const ok = ev.badResult && ev.badResult.junkRejected >= 10 && ev.badResult.otherRejected >= 2 && ev.badResult.stateUnchanged && !ev.badResult.invariants && !ev.badResult.protoPolluted && ev.leave && ev.leave.aiTookOver && ev.rejoinRes && ev.rejoinRes.back && ev.rejoinRes.prefilled.field === code && rjMoves > 0; if (!ok) r.agree = false; res.push(r);
    }
    else if (SC === 'touch') {
      const { H, C } = await setup(1, { np: 2, mission: 3 }); const P = [H, ...C]; await startHost(H); for (const x of P) await seatOf(x); const c = C[0]; const out = {};
      const wait = async f => { for (let k = 0; k < 200; k++) { if (await c.p.evaluate(f).catch(() => false)) return true; await sleep(150); } return false; };
      await wait(() => NET.mySeat === 1 && UI.started);
      const r0 = await c.p.evaluate(() => { const r = document.querySelector('#netst').getBoundingClientRect(); return [r.width, r.height]; }); out.badge = r0; await c.p.tap('#netst'); await sleep(300); out.lobbyOpen = await c.p.evaluate(() => !document.getElementById('netbox').hidden);
      const xr = await c.p.evaluate(() => { const r = document.querySelector('#netbox .lbx').getBoundingClientRect(); return [r.width, r.height]; }); out.xSize = xr; await c.p.tap('#netbox .lbx'); await sleep(300); out.lobbyClosed = await c.p.evaluate(() => document.getElementById('netbox').hidden);
      let moves = 0; const n0 = await H.p.evaluate(() => NET.remote);
      for (let k = 0; k < 900 && moves < 6; k++) {
        await H.p.evaluate(tick).catch(() => 0);
        const st = await c.p.evaluate(() => G && G.phase !== 'over' && iMustAct() && canAct() && G.phase === 'play' && !UI.pingSel); if (!st) { // other phases: step through the page's own buttons by tap
          const b = await c.p.evaluate(() => { const A = [...document.querySelectorAll('#acts [data-a]')].filter(x => !x.disabled); if (!(G && G.phase !== 'over' && iMustAct() && canAct())) return null; const pool = document.querySelector('#pool .jcard'); if (G.phase === 'assign' && UI.job < 0 && pool && A.some(x => x.dataset.a === 'take')) return '#pool .jcard'; const pr = ['take', 'pass', 'done', 'keep', 'accept', 'yes', 'vote', 'predict', 'nosig', 'give']; const a = A.find(x => pr.includes(x.dataset.a)); return a ? '#acts [data-a=' + a.dataset.a + ']' : null; }); if (b) { await c.p.tap(b + ' >> nth=0').catch(() => { }); await sleep(120); } else await sleep(80); continue; }
        const key = await c.p.evaluate(() => G.logN); await c.p.tap('#hand .hc:not(.dim) >> nth=0'); await sleep(200); await c.p.tap('#hand .hc.sel').catch(() => { }); moves++;
        for (let j = 0; j < 80; j++) { await sleep(120); if (await c.p.evaluate(k2 => G.logN !== k2 || G.phase === 'over', key)) break; await H.p.evaluate(tick).catch(() => 0); }
      }
      out.touchMoves = moves; out.dbg = await c.p.evaluate(() => ({ ph: G.phase, must: iMustAct(), can: canAct(), busy: UI.busy, pend: LD.pending(G), seat: NET.mySeat, acts: [...document.querySelectorAll('#acts [data-a]')].map(b => b.dataset.a), tip: !!UI.tip, cards: UI.cards.length })); out.hostRemote = (await H.p.evaluate(() => NET.remote)) - n0; out.probs = await layout(c, 'touch');
      res.push({ tag: 'touch', agree: moves >= 4 && out.hostRemote >= moves - 1 && out.lobbyOpen && out.lobbyClosed && out.badge[0] >= 43.9 && out.badge[1] >= 43.9 && out.xSize[0] >= 43.9 && !out.probs.length, out, errors: [...H.errs, ...c.errs], nErrors: H.errs.length + c.errs.length }); console.log(JSON.stringify(res[res.length - 1]));
    }
    else if (SC === 'hostleft') {
      const { H, C } = await setup(1, { np: 3 }); const P = [H, ...C]; await startHost(H);
      await play(P, H, 200, async g => { if (g.k.split('/')[1] === 'play') throw 'stop'; }).catch(e => { if (e !== 'stop') throw e; });
      await H.p.close(); H.dead = true; let msg = ''; for (let k = 0; k < 120 && !msg; k++) { await sleep(300); msg = await C[0].p.evaluate(() => NET.hostGone ? NET.err : ''); }
      const vis = await C[0].p.evaluate(() => ({ modal: !document.getElementById('netbox').hidden, text: document.getElementById('netbox').textContent.slice(0, 200) }));
      res.push({ tag: 'host leaves', msg, vis, agree: !!msg && vis.modal && /host left/i.test(vis.text), errors: C[0].errs, nErrors: C[0].errs.length }); console.log(JSON.stringify(res[res.length - 1]));
      await C[0].p.evaluate(() => document.querySelector('[data-a=netleave]').click()); await sleep(800); console.log('after leave', JSON.stringify(await C[0].p.evaluate(() => ({ on: NET.on, start: !document.getElementById('start').hidden }))));
    }
    else if (SC === 'shots') {
      const SH = path.join(__dirname, '..', 'lantern-dive', 'game', 'shots'); try { fs.mkdirSync(SH, { recursive: true }); } catch (e) { } const { H, C } = await setup(1, { np: 3 }); const tag = PHONE ? 'ph' : 'desk';
      const P = [H, ...C]; await sleep(500); await H.p.screenshot({ path: `${SH}/net_${tag}_lobby_host.png` }); await C[0].p.screenshot({ path: `${SH}/net_${tag}_lobby_client.png` });
      await H.p.evaluate(() => netClose()); await sleep(300); await H.p.screenshot({ path: `${SH}/net_${tag}_start_inroom.png` }); await H.p.evaluate(() => { UI.netOpen = true; netRender(); }); await startHost(H);
      let shot = 0; await play(P, H, 120, async (g, n) => { if (shot < 2 && g.k.split('/')[1] === 'play' && n % 10 === 0) { await sleep(500); await C[0].p.screenshot({ path: `${SH}/net_${tag}_client_${shot}.png` }); await H.p.screenshot({ path: `${SH}/net_${tag}_host_${shot}.png` }); for (const x of P) await layout(x, 'shot' + shot); shot++; } });
      console.log('errors', JSON.stringify([H, ...C].flatMap(x => x.errs).slice(0, 10)));
    }
  } catch (e) { console.log('HARNESS ERROR', e && e.stack || e); res.push({ tag: 'harness', agree: false, nErrors: 1 }); }
  await b.close(); relay.kill();
  const bad = res.filter(r => !r.agree || r.nErrors || (r.viol && r.viol.length) || r.exactStrip === false || r.finalCardEverywhere === false);
  console.log('SUMMARY', SC, PHONE ? 'phone' : 'desktop', res.length, 'runs,', bad.length, 'bad'); process.exit(0);
})();
