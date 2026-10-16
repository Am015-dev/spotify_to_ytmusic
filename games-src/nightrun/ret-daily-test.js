#!/usr/bin/env node
// RETENTION test B11 (daily streak + weekly challenge): fake clock, streak math, rewards, no double claim, weekly seed, flag off, no clipped text. Headless, no screenshots.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/ret-daily-test.js     env: GAME_DIR=...
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const res = [], ok = (n, p, i) => { res.push(p); console.log((p ? 'PASS ' : 'FAIL ') + n + (p || i == null ? '' : ' :: ' + i)); };
(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME_DIR], { stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 800));
  const br = await PW.chromium.launch(), url = `http://127.0.0.1:${port}/index.html?sim=1&all=1`, errs = [];
  const open = async (w, h) => { const p = await br.newPage({ viewport: { width: w, height: h } }); p.on('pageerror', e => errs.push(e.message));
    await p.goto(url); await p.waitForFunction(() => window.__mnr && window.RET && window.DY, null, { timeout: 8000 }); return p; };
  const p = await open(960, 540);
  // day 0 = Mon 5 Oct 2026, noon local; claim(d, hours) plays the daily run on that day and returns the Neon paid
  const claim = (d, h = 12) => p.evaluate(({ d, h }) => { RET.setClock(new Date(2026, 9, 5 + d, h).getTime()); const b = __mnr.GA.bank; return { p: RET.dailyClaim(), db: __mnr.GA.bank - b, st: DY.status() }; }, { d, h });
  const seq = []; for (let d = 0; d < 9; d++) seq.push(await claim(d));
  const want = [60, 70, 80, 90, 100, 110, 120, 120, 120];
  ok('streak days 1-9 pay 50+10n, capped at 7', seq.every((s, i) => s.p === want[i] && s.db === want[i]), JSON.stringify(seq.map(s => s.p)));
  ok('streak counts 9 after 9 days', seq[8].st.streak === 9, seq[8].st.streak);
  const again = await claim(8, 20); ok('no double claim on the same day', again.p === 0 && again.db === 0 && again.st.claimed, JSON.stringify(again));
  const back1 = await claim(8, 1), back2 = await claim(7, 12);
  ok('clock set back (hours, one day): no grant', back1.p === 0 && back2.p === 0 && back2.db === 0, JSON.stringify([back1, back2]));
  const n1 = await claim(9); ok('after clock skew the next real day continues the streak (10)', n1.p === 120 && n1.st.streak === 10, JSON.stringify(n1));
  const g = await claim(11); ok('miss one day = grace: streak continues (11)', g.p === 120 && g.st.streak === 11, JSON.stringify(g));
  const r = await claim(14); ok('miss two days = reset: streak 1 pays 60', r.p === 60 && r.st.streak === 1, JSON.stringify(r));
  const pre = await p.evaluate(() => { RET.setClock(new Date(2026, 9, 25, 9).getTime()); return DY.status(); });
  ok('status before a long gap shows streak 0 and a 60 reward', pre.streak === 0 && pre.reward === 60 && !pre.claimed, JSON.stringify(pre));
  const clockFix = await p.evaluate(() => { RET.setClock(new Date(2026, 11, 1, 9).getTime()); DY.today(); RET.setClock(new Date(2026, 9, 25, 9).getTime()); return { p: RET.dailyClaim(), st: DY.status() }; });
  ok('a clock set back by weeks is taken as a fix, not a lock-out', clockFix.p === 60, JSON.stringify(clockFix));
  const tz = await p.evaluate(() => { const a = DY.dn(Date.UTC(2026, 9, 5, 12)); return Number.isInteger(a); }); ok('day number is an integer', tz);
  // weekly seed
  const wk = await p.evaluate(() => { const at = (m, d) => { RET.setClock(new Date(2026, m, d, 12).getTime()); const w = RET.week(); return JSON.stringify([w.key, w.seed, w.muts]); };
    return { mon: at(9, 5), sun: at(9, 11), next: at(9, 12), wed: at(9, 7), ny: at(0, 1).split(',')[0], ny2: at(11, 31).split(',')[0], k: DY.weekKey(Math.floor(Date.UTC(2026, 0, 1) / 864e5)) }; });
  ok('weekly seed + mutators are the same Mon-Sun', wk.mon === wk.sun && wk.mon === wk.wed, JSON.stringify(wk));
  ok('weekly seed changes next week', wk.mon !== wk.next, JSON.stringify(wk));
  ok('ISO week keys: 2026-01-01 is week 1 of 2026 (Thursday), 2026-12-31 is 2026-W53', wk.k === 202601 && wk.ny2 === '[202653', JSON.stringify([wk.k, wk.ny2]));
  const wm = await p.evaluate(() => { const o = {}; for (let w = 0; w < 30; w++) { RET.setClock(new Date(2026, 9, 5 + 7 * w, 12).getTime()); const m = RET.week().muts; o.ok = (o.ok !== false) && m.length === 2 && m[0] !== m[1]; } return o; });
  ok('every week has 2 different mutators', wm.ok === true);
  // weekly run through the real UI: button, mutators, seed, clear pays once
  const run = await p.evaluate(() => { const m = __mnr; RET.setClock(new Date(2026, 9, 5, 12).getTime()); const w = RET.week(); const b0 = m.GA.bank;
    document.getElementById('wkBtn').click(); const r = { weekly: m.G.weekly === w.key, daily: m.G.daily, mut: m.DIR.mut.join(), want: w.muts.join(), note: m.G.note.txt };
    NR.emit('districtEnd', { di: 0 }); r.pay1 = m.GA.bank - b0; NR.emit('districtEnd', { di: 1 }); r.pay2 = m.GA.bank - b0; r.cleared = RET.week().cleared; return r; });
  ok('weekly button starts a seeded run with the two weekly mutators', run.weekly && run.daily && run.mut === run.want && /Weekly/.test(run.note), JSON.stringify(run));
  ok('weekly clear pays 300 once', run.pay1 === 300 && run.pay2 === 300 && run.cleared, JSON.stringify(run));
  const end = await p.evaluate(() => { const b0 = __mnr.GA.bank; const d0 = DY.s.last; NR.emit('runEnd', { score: 4321, di: 1, kills: 3 }); return { bank: __mnr.GA.bank - b0, last: DY.s.last === d0, eye: RET.weeklyBestLine() }; });
  ok('a weekly run does not claim the daily bonus', end.last, JSON.stringify(end));
  // a daily run end claims the daily bonus once
  const dr = await p.evaluate(() => { const m = __mnr; m.abort && m.abort(); RET.setClock(new Date(2026, 9, 5 + 40, 12).getTime()); document.getElementById('dailyBtn').click();
    const b0 = m.GA.bank; NR.emit('runEnd', { score: 10, di: 0, kills: 1 }); const a = m.GA.bank - b0; NR.emit('runEnd', { score: 11, di: 0, kills: 1 }); return { a, b: m.GA.bank - b0 - a, daily: m.G.daily, weekly: !!m.G.weekly, txt: document.getElementById('retDy').textContent }; });
  ok('daily run end pays once (60 after a reset) and shows it', dr.daily && !dr.weekly && dr.a === 60 && dr.b === 0 && /Daily bonus/.test(dr.txt), JSON.stringify(dr));
  const sv = await p.evaluate(() => { const s = JSON.parse(localStorage.getItem('mnr_streak')); return Object.values(s).every(Number.isFinite) && s.streak >= 1; }); ok('streak saved in local storage', sv);
  const nn = await p.evaluate(() => { const b = __mnr.GA.bank; DY.pay(-50); DY.pay(NaN); return __mnr.GA.bank === b && __mnr.GA.bank >= 0; }); ok('wallet: no negative or NaN pay', nn);
  // flag off = old screen
  const off = await p.evaluate(() => { RET.daily = false; RET.dailyShow(); const b0 = __mnr.GA.bank; const c = RET.dailyClaim(); const t = document.getElementById('retTt');
    return { c, hid: t.hidden, bank: __mnr.GA.bank - b0, clockUsed: (RET.setClock(0), 1) }; });
  ok('flag off: status block hidden, no claim, no pay', off.c === 0 && off.hid && off.bank === 0, JSON.stringify(off));
  await p.close();
  // no clipped text, no scroll, buttons on screen (fresh page, real clock)
  for (const [w, h] of [[390, 763], [1280, 720], [375, 553]]) {
    const q = await open(w, h);
    const m = await q.evaluate(() => { const e = document.getElementById('retTt'), r = e.getBoundingClientRect(), b = document.getElementById('wkBtn').getBoundingClientRect(), s = document.getElementById('startBtn').getBoundingClientRect(), t = document.querySelector('#title .in');
      return { clip: e.scrollWidth > e.clientWidth + 1, left: r.left, right: r.right, bot: b.bottom, sbot: s.bottom, hs: document.documentElement.scrollWidth > innerWidth, W: innerWidth, H: innerHeight, scrollable: t.scrollHeight > t.clientHeight + 1, txt: e.textContent }; });
    ok(`title status fits ${w}x${h} (no clip, no horizontal scroll, buttons on screen)`, !m.clip && m.left >= 0 && m.right <= m.W && !m.hs && (m.bot <= m.H || m.scrollable) && m.sbot <= m.H, JSON.stringify(m));
    await q.close();
  }
  ok('no page errors', errs.length === 0, errs[0]);
  await br.close(); srv.kill(); process.exit(res.every(Boolean) ? 0 : 1);
})().catch(e => { console.error(e); process.exit(2); });
