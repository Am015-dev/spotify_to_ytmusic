#!/usr/bin/env node
// TALE (parts/story/tale.js): cast, story beats, dialogue card, STORY LOG timeline. Runs with ?story=0 (saga.js replaces the tale when RET.story is on). Headless, no screenshots. Prints PASS/FAIL lines only.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/tale-test.js     env: GAME_DIR=...
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process'), fs = require('fs');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const res = [], ok = (n, p, i) => { res.push(p); console.log((p ? 'PASS ' : 'FAIL ') + n + (p || i == null ? '' : ' :: ' + i)); };
const SIZES = [[390, 763, 'phone'], [1280, 720, 'desktop']];
// everything visible inside root: stays inside the viewport, buttons >= 44 px, text >= 14 px
const AUDIT = root => { const R = document.querySelector(root); if (!R) return { missing: true }; const o = { out: [], btn: [], txt: [] }, W = innerWidth, H = innerHeight;
  const vis = e => { for (let x = e; x && x !== document.body; x = x.parentElement) { const cs = getComputedStyle(x); if (x.hidden || cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) return false; } return true; };
  for (const e of R.querySelectorAll('button')) { if (!vis(e)) continue; const r = e.getBoundingClientRect(); if (r.width < 43.5 || r.height < 43.5) o.btn.push((e.id || e.className) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height)); }
  const w = document.createTreeWalker(R, NodeFilter.SHOW_TEXT);
  for (let n; (n = w.nextNode());) { if (!n.textContent.trim()) continue; const p = n.parentElement; if (!vis(p)) continue; if (p.classList.contains('h')) continue; const fs = parseFloat(getComputedStyle(p).fontSize); if (fs < 13.9) o.txt.push(p.className + ' ' + fs + 'px'); }
  const cr = R.getBoundingClientRect(); if (cr.left < -.5 || cr.top < -.5 || cr.right > W + .5 || cr.bottom > H + .5) o.out.push('root ' + [cr.left, cr.top, cr.right, cr.bottom].map(Math.round).join(','));
  return o; };
(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME_DIR], { stdio: 'ignore' });
  await sleep(700);
  const br = await PW.chromium.launch(), errs = [];
  const open = async (w, h, q = '', opt = {}) => { const ctx = opt.ctx || await br.newContext({ viewport: { width: w, height: h }, hasTouch: true, isMobile: w < 800, reducedMotion: opt.rm ? 'reduce' : 'no-preference' });
    const p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message)); await p.goto(`http://127.0.0.1:${port}/index.html?nomusic=1&story=0${q}`, { waitUntil: 'domcontentloaded' });
    await p.waitForFunction(() => window.__mnr && document.getElementById('moreBtn') || /tale=0/.test(location.search), null, { timeout: 10000 }); await sleep(250); p.ctx = ctx; return p; };
  const vis = (p, sel) => p.evaluate(s => { const e = document.querySelector(s); if (!e) return false; for (let x = e; x && x !== document.body; x = x.parentElement) if (x.hidden || getComputedStyle(x).display === 'none') return false; return true; }, sel);
  try {
    // ---- data table
    const src = fs.readFileSync(path.join(__dirname, 'parts/story/tale.js'), 'utf8'), man = JSON.parse(fs.readFileSync(path.join(__dirname, 'assets-manifest.json'), 'utf8'));
    {
      const p = await open(390, 763);
      const d = await p.evaluate(() => { const T = window.TALE; const bad = []; let maxLine = 0; const ids = new Set();
        for (const b of T.beats) { if (ids.has(b.id)) bad.push('dup ' + b.id); ids.add(b.id); if (b.st < 1 || b.st > 40) bad.push('stage ' + b.id); if (b.lines.length < 1 || b.lines.length > 4) bad.push('lines ' + b.id);
          for (const l of b.lines) { maxLine = Math.max(maxLine, l.text.length); if (l.who !== 'boss' && !T.cast[l.who]) bad.push('who ' + b.id); if (l.who === 'boss' && b.when !== 'before') bad.push('boss after ' + b.id); }
          if (b.down) maxLine = Math.max(maxLine, b.down.length); }
        return { n: T.beats.length, before: T.beats.filter(b => b.when === 'before' && b.lines[0].who !== 'boss').length, after: T.beats.filter(b => b.when === 'after').length, boss: T.beats.filter(b => b.down).length, maxLine, bad, cast: Object.keys(T.cast).length }; });
      ok('data: 6 cast, 5 boss lines, ~30 beats, lines <= 160 chars, valid ids/stages', d.cast === 6 && d.boss === 5 && d.n >= 25 && d.before >= 10 && d.after >= 12 && d.maxLine <= 160 && !d.bad.length, JSON.stringify(d));
      ok('assets manifest has char-<id>.webp 256x256 for every cast member', ['courier', 'dispatch', 'rival', 'mechanic', 'lumen', 'ally'].every(i => man.some(e => e.file === `char-${i}.webp` && e.w === 256 && e.h === 256 && e.notes && e.group)), '');
      ok('placeholder files exist', ['courier', 'dispatch', 'rival', 'mechanic', 'lumen', 'ally'].every(i => fs.existsSync(path.join(GAME_DIR, `media/char-${i}.webp`))), '');
      ok('mnr_tale is in the save export list', await p.evaluate(() => RET.sioKeys.includes('mnr_tale')), '');
      await p.ctx.close();
    }
    // ---- flag off = no new UI, run starts directly
    {
      const p = await open(390, 763, '&tale=0');
      const o = await p.evaluate(() => ({ btn: !!document.getElementById('taleBtn'), card: !!document.getElementById('taleCard'), log: !!document.getElementById('taleLog'), dot: !!document.querySelector('.tdot'), api: !!window.TALE, flag: RET.tale }));
      ok('flag off (?tale=0): no STORY LOG button, card, log, dot or API', !o.btn && !o.card && !o.log && !o.dot && !o.api && o.flag === false, JSON.stringify(o));
      await p.click('#moreBtn'); await sleep(150); await p.click('#storyBtn'); await sleep(500); await p.evaluate(() => { const d = document.getElementById('stDet'); if (d.hidden || d.dataset.n !== '1') document.querySelector('.nd[data-n="1"]').click(); }); await sleep(300);
      ok('flag off: stage plate has no story preview', !(await p.evaluate(() => !!document.getElementById('talePv'))), '');
      await p.click('#stPlay'); await sleep(500);
      ok('flag off: PLAY starts the run at once', !(await vis(p, '#title')) && !(await vis(p, '#stsel')), '');
      await p.ctx.close();
    }
    for (const [w, h, nm] of SIZES) {
      const p = await open(w, h);
      // ---- fresh log
      ok(`${nm}: fresh save has no NEW dot and a STORY LOG button in the menu`, await p.evaluate(() => { const d0 = document.getElementById('taleDot0'); return !!document.getElementById('taleBtn') && d0 && d0.hidden && TALE.unread() === 0; }), '');
      await p.click('#moreBtn'); await sleep(150); await p.click('#taleBtn'); await sleep(250);
      ok(`${nm}: STORY LOG opens`, await vis(p, '#taleLog'), '');
      const lg = await p.evaluate(() => ({ items: document.querySelectorAll('#taleList .ti').length, lock: document.querySelectorAll('#taleList .ti.lock').length, q: [...document.querySelectorAll('#taleList .ti.lock .tw')].every(e => e.textContent === '???'), why: [...document.querySelectorAll('#taleList .ti.lock .lk')].every(e => /^Clear stage \d+ · .+ to unlock$/.test(e.textContent)), acts: [...document.querySelectorAll('#taleList .ta b')].map(e => e.textContent), n: TALE.beats.length }));
      ok(`${nm}: every beat is locked ("???" + the stage that unlocks it), act progress 0/n`, lg.items === lg.n && lg.lock === lg.n && lg.q && lg.why && lg.acts.length === 5 && lg.acts.every(a => /^0\/\d+ beats$/.test(a)), JSON.stringify(lg));
      const a1 = await p.evaluate(AUDIT, '#taleLog'); ok(`${nm}: log inside viewport, buttons >= 44, text >= 14`, !a1.missing && !a1.out.length && !a1.btn.length && !a1.txt.length, JSON.stringify(a1));
      const noX = await p.evaluate(() => { const l = document.getElementById('taleList'); return l.scrollWidth <= l.clientWidth + 1; }); ok(`${nm}: log has no horizontal scroll`, noX, '');
      await p.click('#taleBack'); await sleep(150);
      ok(`${nm}: BACK closes the log`, !(await vis(p, '#taleLog')), '');
      // ---- first clear unlocks exactly its beats
      const u = await p.evaluate(() => { const ids = () => TALE.beats.filter(b => TALE.unlocked(b.id)).map(b => b.id).join(',');
        NR.emit('runEnd', { story: 1, cleared: false, score: 1 }); const failed = ids(); NR.emit('runEnd', { story: 2, quit: true }); const quit = ids();
        NR.emit('runEnd', { story: 1, cleared: true, score: 1 }); const first = ids(); const seq = JSON.stringify(TALE.save.u);
        NR.emit('runEnd', { story: 1, cleared: true, score: 1 }); const again = JSON.stringify(TALE.save.u); NR.emit('runEnd', { story: 41, cleared: true });
        return { failed, quit, first, same: seq === again, after41: ids(), unread: TALE.unread(), dot: !document.getElementById('taleDot0').hidden }; });
      ok(`${nm}: a failed run or a quit unlocks nothing`, u.failed === '' && u.quit === '', JSON.stringify(u));
      ok(`${nm}: first clear of stage 1 unlocks exactly its beats; a second clear changes nothing`, u.first === 't01,t02' && u.same && u.after41 === 't01,t02', JSON.stringify(u));
      ok(`${nm}: NEW dot on the MENU button`, u.unread === 2 && u.dot, JSON.stringify(u));
      await sleep(900);   // the stage-1 timer ran with the clear screen hidden: no card
      ok(`${nm}: no after-scene while the clear screen is not shown`, !(await p.evaluate(() => TALE.shown())), '');
      // ---- after-scene on the clear screen
      await p.evaluate(() => { document.getElementById('stres').hidden = false; NR.emit('runEnd', { story: 8, cleared: true, score: 1 }); });
      await sleep(1000);
      const sc = await p.evaluate(() => ({ card: !document.getElementById('taleCard').hidden, n: document.getElementById('taleN').textContent }));
      ok(`${nm}: boss clear shows the defeat line then the after-scene (card opens on the clear screen)`, sc.card && /SEK-ADLER/.test(sc.n), JSON.stringify(sc));
      const nl = await p.evaluate(() => document.getElementById('taleNx').textContent); ok(`${nm}: not-last line says "tap to continue"`, /tap to continue/.test(nl), nl);
      const a2 = await p.evaluate(AUDIT, '#taleCard .tc'); ok(`${nm}: dialogue card inside viewport, buttons >= 44, text >= 14`, !a2.missing && !a2.out.length && !a2.btn.length && !a2.txt.length, JSON.stringify(a2));
      // first tap completes the typing, the second advances; keys work too
      const t0 = await p.evaluate(() => document.getElementById('taleT').textContent.length);
      await p.click('#taleTc'); await sleep(80);
      const txt = await p.evaluate(() => ({ shown: document.querySelector('#taleT span').textContent, all: document.getElementById('taleT').textContent }));
      ok(`${nm}: tap finishes the typing first`, txt.shown === txt.all && t0 === txt.all.length, JSON.stringify(txt));
      await p.keyboard.press('Space'); await sleep(80);
      ok(`${nm}: Space advances to the next line (ODA)`, await p.evaluate(() => /ODA/.test(document.getElementById('taleN').textContent)), '');
      await p.keyboard.press('Space'); await sleep(40); await p.keyboard.press('Enter'); await sleep(120);   // 1st finishes the typing, 2nd closes (the scene has two lines)
      ok(`${nm}: Space/Enter close the card at the end`, !(await p.evaluate(() => TALE.shown())) && !(await vis(p, '#taleCard')), '');
      // ---- log after unlocks
      await p.evaluate(() => { document.getElementById('stres').hidden = true; });
      await p.click('#moreBtn'); await sleep(150); await p.click('#taleBtn'); await sleep(250);
      const lg2 = await p.evaluate(() => ({ un: document.querySelectorAll('#taleList .ti:not(.lock)').length, latest: [...document.querySelectorAll('#taleList .ti.latest')].map(e => e.dataset.id), nw: document.querySelectorAll('#taleList .nw').length, acts: [...document.querySelectorAll('#taleList .ta b')].map(e => e.textContent), t01: document.querySelector('#taleList [data-id=t01] .tx').textContent, t03lock: document.querySelector('#taleList [data-id=t03]').classList.contains('lock'), sum: document.getElementById('taleSum').textContent, dotsHidden: document.getElementById('taleDot0').hidden }));
      ok(`${nm}: unlocked beats show text, the newest is highlighted, others stay "???"`, lg2.un === 4 && lg2.latest.length === 1 && lg2.latest[0] === 't08' && lg2.t03lock && /Courier|COURIER/.test(lg2.t01 + 'COURIER'), JSON.stringify(lg2));
      ok(`${nm}: act progress counts unlocked beats (Act I 4/n)`, /^4\/\d+ beats$/.test(lg2.acts[0]) && lg2.acts[1].startsWith('0/') && /4 of/.test(lg2.sum), JSON.stringify(lg2));
      ok(`${nm}: opening the log clears the NEW dot`, lg2.dotsHidden && (await p.evaluate(() => TALE.unread())) === 0, JSON.stringify(lg2));
      const a3 = await p.evaluate(AUDIT, '#taleLog'); ok(`${nm}: unlocked log inside viewport, buttons >= 44, text >= 14 (NEW badge aside)`, !a3.out.length && !a3.btn.length && a3.txt.every(t => /^nw /.test(t)), JSON.stringify(a3));
      await p.keyboard.press('Escape'); await sleep(120); ok(`${nm}: Escape closes the log`, !(await vis(p, '#taleLog')), '');
      // ---- save round trip
      const st = await p.evaluate(() => ({ raw: localStorage.getItem('mnr_tale'), pack: RET.sio.parse(RET.sio.pack()) }));
      ok(`${nm}: saved in localStorage mnr_tale and exported/imported with the save`, !!st.raw && st.pack.ok && 'mnr_tale' in st.pack.keys, JSON.stringify(st).slice(0, 200));
      const ctx = p.ctx; await p.close();
      const p2 = await open(w, h, '', { ctx });
      const rt = await p2.evaluate(() => ({ u: TALE.beats.filter(b => TALE.unlocked(b.id)).map(b => b.id).join(','), unread: TALE.unread() }));
      ok(`${nm}: reload keeps the unlocked beats and the read state`, rt.u === 't01,t02,t07,t08' && rt.unread === 0, JSON.stringify(rt));
      await p2.ctx.close();
    }
    // ---- before-card on the stage plate (phone and desktop)
    for (const [w, h, nm] of SIZES) {
      const p = await open(w, h);
      await p.click('#moreBtn'); await sleep(150); await p.click('#storyBtn'); await sleep(600); await p.evaluate(() => { const d = document.getElementById('stDet'); if (d.hidden || d.dataset.n !== '1') document.querySelector('.nd[data-n="1"]').click(); }); await sleep(300);
      const pv = await p.evaluate(() => { const e = document.getElementById('talePv'), d = document.getElementById('stDet'); if (!e) return null; const r = d.getBoundingClientRect(), pr = document.getElementById('stPlay').getBoundingClientRect(), vr = e.getBoundingClientRect(); return { inside: r.top >= 0 && r.bottom <= innerHeight + 1 && r.left >= 0 && r.right <= innerWidth + 1, noOverlap: vr.bottom <= pr.top + 1, txt: e.textContent }; });
      ok(`${nm}: stage plate shows a one-line story preview that fits and does not cover PLAY`, !!pv && pv.inside && pv.noOverlap && /ODA/.test(pv.txt), JSON.stringify(pv));
      await p.click('#stPlay'); await sleep(300);
      ok(`${nm}: PLAY opens the before-card first (run not started yet)`, (await p.evaluate(() => TALE.shown())) && (await vis(p, '#stsel')) !== undefined && !(await p.evaluate(() => document.getElementById('taleCard').hidden)), '');
      await p.click('#taleSkip'); await sleep(500);
      ok(`${nm}: one tap on SKIP starts the run`, !(await p.evaluate(() => TALE.shown())) && !(await vis(p, '#stsel')) && !(await vis(p, '#title')), '');
      ok(`${nm}: the card never opens during a run`, await p.evaluate(() => TALE.show([{ who: 'dispatch', text: 'x' }], 1) === false), '');
      ok(`${nm}: the before-card is marked seen`, await p.evaluate(() => TALE.save.b.t01 === 1), '');
      await p.ctx.close();
    }
    // ---- title PLAY / CONTINUE starts at once (one tap, as before)
    {
      const p = await open(390, 763); await p.click('#playBtn'); await sleep(500);
      ok('title PLAY starts the run in one tap, no card', !(await p.evaluate(() => TALE.shown())) && !(await vis(p, '#title')), '');
      await p.ctx.close();
    }
    // ---- second start of the same stage does not repeat the card; reduced motion = instant text
    {
      const p = await open(390, 763, '', { rm: true });
      await p.click('#moreBtn'); await sleep(150); await p.click('#storyBtn'); await sleep(600); await p.evaluate(() => { const d = document.getElementById('stDet'); if (d.hidden || d.dataset.n !== '1') document.querySelector('.nd[data-n="1"]').click(); }); await sleep(300); await p.click('#stPlay'); await sleep(200);
      const t = await p.evaluate(() => { const s = document.querySelector('#taleT span'); return { shown: s.textContent.length, all: document.getElementById('taleT').textContent.length, rm: document.getElementById('taleCard').classList.contains('talerm') }; });
      ok('reduced motion: the line is there at once (no typewriter)', t.shown === t.all && t.all > 0 && t.rm, JSON.stringify(t));
      await p.keyboard.press('Escape'); await sleep(400);
      ok('Escape skips the card and the run starts', !(await p.evaluate(() => TALE.shown())) && !(await vis(p, '#title')), '');
      await p.ctx.close();
      const q = await open(390, 763, '&sim=1');
      ok('?sim=1 test pages never get a card', await q.evaluate(() => { __mnr.startStory(1); return !TALE.shown() && !!__mnr.G.live; }), '');
      await q.ctx.close();
    }
    ok('no page errors', !errs.length, errs.slice(0, 3).join(' | '));
  } catch (e) { ok('test crashed', false, e && e.stack || String(e)); }
  await br.close(); srv.kill();
  const f = res.filter(x => !x).length; console.log(f ? `FAILED ${f}/${res.length}` : `ALL PASS ${res.length}`); process.exit(f ? 1 : 0);
})();
