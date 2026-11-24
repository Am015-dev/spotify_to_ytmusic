// Thornbound scenario lessons (lessons.js on shell/gx-scenario-tutor.js): node thornbound/game/lessons-test.js [402x874,1366x768]
// Every lesson: a wrong move fails with a message, Retry restarts it, the scripted solution wins with 3 stars; nothing of the kit covers a hand card;
// a non-lesson button (Rules) opens mid-lesson; hint nudge then show; 0 JS errors; runs at machine speed (scripts/turbo.js), budget 60 s per size.
const PW = (() => { try { return require('playwright'); } catch (e) { return require('../../../node_modules/playwright'); } })();
const fs = require('fs'), path = require('path');
const { turbo, budget } = require('../../scripts/turbo.js');
const html = fs.readFileSync(path.join(__dirname, 'thornbound.html'));
const SIZES = (process.argv[2] || '402x874,1366x768').split(',').map(s => s.split('x').map(Number));
const PROOF = path.join(__dirname, '..', 'proof'); fs.mkdirSync(PROOF, { recursive: true });
const probs = [], T0 = Date.now();
const SOLVE = { bid: ['b:10', 'gr:1'], steal: ['b:10', 'st:1:0'], place: ['p:9', 'p:4', 'p:7'], supporters: ['supp|1n3'], tie: ['c10'], herald: ['l5'], journey: ['journey|9', 's:15'], favour: ['l2'], govern: ['govern|1relics'] };
const WRONG = { bid: ['b:2', 'gr:0'], steal: ['b:5', 'gr:0'], place: ['p:4', 'p:9', 'p:7'], supporters: ['supp|1n1'], tie: ['pass'], herald: ['l4'], journey: ['journey|4'], favour: ['l3'], govern: [] };
async function run(b, W, H) {
  const tag = W + 'x' + H, phone = W < 600, note = m => { probs.push(tag + ': ' + m); if (process.env.DBG) console.log('  NOTE', m, (Date.now() - T0) / 1000); }, stop = budget(60000, 'lessons ' + tag);
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, isMobile: phone, hasTouch: true }); await turbo(ctx);
  await ctx.route('**/*', r => new URL(r.request().url()).host === 'gns.test' ? r.fulfill({ status: 200, contentType: 'text/html', body: html }) : r.abort());
  const p = await ctx.newPage(); p.setDefaultTimeout(20000);
  p.on('pageerror', e => note('PAGE ERROR ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/net::|Failed to load|favicon/.test(m.text())) note('console error ' + m.text().slice(0, 140)); });
  await p.goto('https://gns.test/?phone=' + (phone ? 1 : 0), { waitUntil: 'commit' });
  await p.waitForFunction(() => window.TBL && window.GXST && GXST.state(), null, { timeout: 30000 });
  await p.evaluate(() => { try { ANIM = 0; } catch (e) { } window.__ev = []; window.L_n = () => TBL.L.n; window.wins_ = () => G.log.filter(e => /^Reedfolk wins the Clash/.test(e.t)).length; addEventListener('gxst', e => __ev.push(e.detail.type)); });
  const st = () => p.evaluate(() => GXST.state());
  const phase = (w, ms) => p.waitForFunction(w => GXST.state().phase === w, w, { timeout: ms || 20000 }).then(() => true, () => false);
  const start = async id => { await p.evaluate(id => GXST.start(id), id); await p.waitForFunction(id => { const s = GXST.state(); return s.id === id && s.phase === 'play' && s.live && window.G && G.q && whoActs().hum.length && !UI.busy && !UI.card; }, id, { timeout: 25000 }).catch(() => note(id + ': did not start')); };
  // play a list of move keys with the real engine path (humanMove); any other prompt: Done/Pass/first
  const play = (keys) => p.evaluate(async keys => {
    const wait = () => new Promise(res => { const t0 = performance.now(); (function w() { if (GXST.state().phase !== 'play') return res(false); if (window.G && G.q && whoActs().hum.length && !UI.busy && !UI.card) return res(true); if (performance.now() - t0 > 400000) return res(false); setTimeout(w, 5); })(); });
    for (let i = 0; i < 80; i++) {
      if (!(await wait())) return GXST.state().phase;
      const mv = legal(viewSeatForQ() == null ? 0 : viewSeatForQ()); if (!mv.length) return 'nomoves';
      const want = keys.length ? mv.find(m => m.k === keys[0]) : null;
      let m = want; if (want) keys.shift();
      if (!m) m = mv.find(x => /^(done|seldone|pass)/.test(x.k)) || mv[0];
      humanMove(m.k); await new Promise(r => setTimeout(r, 20));
    } return 'long';
  }, keys.slice());
  let s = await st(); await p.evaluate(() => GXST.picker()); s = await st();
  const n = await p.evaluate(() => document.querySelectorAll('.gxst-pick').length); if (n !== s.count || n < 6) note('picker shows ' + n + ' of ' + s.count);
  const ids = await p.evaluate(() => [...document.querySelectorAll('.gxst-pick')].map(e => e.dataset.id));
  const shots = [];
  for (const id of ids.filter(i => !process.env.ONLY || process.env.ONLY.split(',').includes(i))) {
    if (process.env.DBG) console.log('lesson', id, (Date.now() - T0) / 1000); await start(id);
    shots.push(await p.screenshot({ type: 'jpeg', quality: 70 }));
    if (id === 'game') { // a short real game: played to the end by the suggested moves
      const r = await p.evaluate(async () => { for (let i = 0; i < 400 && !(G.over); i++) { await new Promise(res => { const t0 = performance.now(); (function w() { if (G.over || (G.q && whoActs().hum.length && !UI.busy && !UI.card) || performance.now() - t0 > 300000) return res(); setTimeout(w, 5); })(); }); if (G.over) break; const m = aiChoose(0, 'easy') || legal(0)[0]; if (!m) break; humanMove(m.k); } return G.over ? G.over.winner : -1; });
      if (!(await phase('win', 30000)) && !(await phase('fail', 1000))) note('game: no result (winner ' + r + ')'); else if ((await st()).phase === 'fail') note('game: scripted AI play lost (winner ' + r + ')');
      continue;
    }
    // 1) tap anything: no hand card sits under the lesson card, Rules opens mid-lesson
    const cov = await p.evaluate(() => [...document.querySelectorAll('#handw .hc, #act button, #cstrip')].filter(e => { const r = e.getBoundingClientRect(); if (r.width < 4) return false; const u = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return u && u.closest('.gxst-card'); }).length);
    if (cov) note(id + ': ' + cov + ' hand cards under the lesson card');
    if (id === 'bid') {
      const open = await p.evaluate(() => { const b = document.querySelector('[data-gx="rulesd"]'); if (!b) return -1; b.click(); return document.querySelector('.gx-drawer') ? 1 : 0; }); if (open !== 1) note('Rules did not open mid-lesson (' + open + ')');
      await p.evaluate(() => { try { GX.close(); } catch (e) { } });
      await p.evaluate(() => GXST.hint()); await p.evaluate(() => GXST.hint()); s = await st(); if (s.hint !== 2) note('hint did not reach show');
    }
    // 2) a wrong move fails with a message; Retry restarts
    await play(WRONG[id]); if (!(await phase('fail', process.env.DBG ? 3000 : 20000))) { if (process.env.DBG) console.log(await p.evaluate(() => JSON.stringify({ step: G.step, ph: G.phase, rd: G.round, q: G.q && G.q.kind, done: G.reg.map(r => r.done), wins: wins_(), log: G.log.slice(-6).map(e => e.t) }, null, 1))); note(id + ': wrong move did not fail (phase ' + (await st()).phase + ')'); } else { s = await st(); if (!(s.msg || '').length > 12) note(id + ': fail has no message'); }
    await p.evaluate(() => GXST.retry()); await p.waitForFunction(id => { const s = GXST.state(); return s.id === id && s.phase === 'play' && s.live && G.q && whoActs().hum.length && !UI.busy; }, id, { timeout: 25000 }).catch(() => note(id + ': retry did not restart'));
    // 3) the scripted solution wins, 3 stars if no hint
    const r = await play(SOLVE[id]); if (!(await phase('win', 6000))) { s = await st(); note(id + ': solution did not win (phase ' + s.phase + ', ' + r + (s.msg ? ', ' + s.msg : '') + ')'); }
    else { s = await st(); if (process.env.DBG) console.log('  moves', id, await p.evaluate(() => L_n())); if (id !== 'bid' && s.stars !== 3) note(id + ': clean win gave ' + s.stars + ' stars'); }
  }
  // progress + events
  s = await st(); if (Object.keys(s.best).length < ids.length) note('progress saved for ' + Object.keys(s.best).length + '/' + ids.length);
  const ev = await p.evaluate(() => __ev.join(',')); ['start', 'fail', 'retry', 'hint', 'win'].forEach(t => { if (ev.indexOf(t) < 0) note('no ' + t + ' event'); });
  await ctx.close(); stop(); return { shots, ids };
}
// contact sheet of every lesson start (phone and pc): proof/thornbound-lessons-<size>-sheet.jpg
async function sheet(b, W, H, { shots, ids }) {
  const phone = W < 600, cols = phone ? 5 : 3, cw = phone ? 260 : 455, ch = Math.round(cw * H / W);
  const cells = shots.map((x, i) => '<figure><img src="data:image/jpeg;base64,' + x.toString('base64') + '"><figcaption>' + (i + 1) + ' ' + ids[i] + '</figcaption></figure>').join('');
  const pg = await b.newPage({ viewport: { width: cols * (cw + 8) + 8, height: Math.ceil(shots.length / cols) * (ch + 30) + 8 } });
  await pg.setContent('<style>body{margin:4px;background:#222;display:flex;flex-wrap:wrap;font:14px sans-serif;color:#fff}figure{margin:4px;width:' + cw + 'px}img{width:100%;display:block}figcaption{padding:2px}</style>' + cells);
  await pg.screenshot({ path: path.join(PROOF, 'thornbound-lessons-' + W + 'x' + H + '-sheet.jpg'), type: 'jpeg', quality: 75, fullPage: true }); await pg.close();
}
(async () => {
  const b = await PW.chromium.launch(fs.existsSync('/opt/pw-browsers/chromium') ? { executablePath: '/opt/pw-browsers/chromium' } : {});
  for (const [W, H] of SIZES) { const n = probs.length, t0 = Date.now(); const out = await run(b, W, H).catch(e => { probs.push(W + 'x' + H + ': CRASH ' + e.message.split('\n')[0]); return null; }); if (out) await sheet(b, W, H, out); console.log((probs.length === n ? 'PASS ' : 'FAIL ') + W + 'x' + H + ' ' + ((Date.now() - t0) / 1000).toFixed(1) + 's'); }
  await b.close(); probs.forEach(x => console.log('  ' + x)); process.exit(probs.length ? 1 : 0);
})();
