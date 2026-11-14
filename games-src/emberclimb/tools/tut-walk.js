// W494 guided tutorial walk: fresh storage, opens Learn to play from the title, and does every step by a real touch tap at the centre
// of the spotlit element (or the bubble's Next). Fails if a step line is over 12 words, if any rule step in EC_TUT_RULES is missing or out
// of order, if the run does not continue as a real climb (kit stopped, coach on, a room entered), or on any page error.
// Phone 390x844 (writes playable-shots/w494/tut-N.png) + 375x667. Run: node tools/tut-walk.js
const { chromium } = require('playwright'), path = require('path'), fs = require('fs'), { serve, sleep } = require('./tap-lib');
const OUT = path.join(__dirname, '..', 'playable-shots', 'w494'); fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const { srv, base } = await serve(); const br = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] }); let bad = 0;
  const fail = m => { bad++; console.log('FAIL', m); };
  for (const [name, vp, shots] of [['390x844', { width: 390, height: 844 }, true], ['375x667', { width: 375, height: 667 }, false]]) {
    const ctx = await br.newContext({ viewport: vp, hasTouch: true, isMobile: true, deviceScaleFactor: shots ? 2 : 1 }); const pg = await ctx.newPage(), errs = [];
    pg.on('pageerror', e => errs.push(e.message)); pg.on('console', m => { if (m.type() === 'error' && !/404/.test(m.text())) errs.push(m.text()); });
    await pg.goto(base); await pg.waitForSelector('#title'); await pg.evaluate(() => localStorage.clear()); await pg.goto(base); await pg.waitForSelector('#title'); await sleep(400);
    const tapXY = async (x, y) => { await pg.touchscreen.tap(x, y); await sleep(160); };
    const centre = async sel => pg.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return r.width ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : null; }, sel);
    const m0 = await centre('.gxt-menu'); if (!m0) { fail(name + ': no Learn to play button'); continue; } await tapXY(m0.x, m0.y); await sleep(900);
    const seen = [], says = {}; let n = 0, lastKey = '', stuck = 0;
    for (let i = 0; i < 900; i++) {
      await sleep(200);
      const s = await pg.evaluate(() => { const c = window.GXT && GXT.active() ? GXT.current() : null; const b = document.querySelector('.gxt-bub'); return { id: c && c.id, next: c && !c.wait, bub: b ? (b.querySelector('.gxh-tx') || {}).textContent : null, shown: !!b }; });
      if (!s.id || s.id === 'free') break;
      const k = JSON.stringify(s); if (k === lastKey) stuck++; else stuck = 0; lastKey = k; if (stuck > 150) { fail(name + ': stuck at ' + s.id); await pg.screenshot({ path: path.join(OUT, 'stuck-' + name + '.png') }); break; }
      if (!s.shown) continue;
      if (seen[seen.length - 1] !== s.id) { seen.push(s.id); says[s.id] = s.bub; if (shots) { n++; await sleep(250); await pg.screenshot({ path: path.join(OUT, 'tut-' + n + '.png') }); } }
      if (s.next) { await sleep(650); const c = await centre('.gxt-next'); if (c) await tapXY(c.x, c.y); continue; }
      await sleep(650);
      // every spotlit target must answer one tap: each element under a hole must be live (not a dim cell); on the room step, tap the LAST glowing room
      const dead = await pg.evaluate(() => { const st = GXT.current(); const els = [st.target && st.target()].concat(st.also ? st.also() : []).filter(Boolean); return els.filter(e => { const r = e.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return !(h && (h === e || e.contains(h))); }).length; });
      if (dead) fail(name + ': step ' + s.id + ' has ' + dead + ' highlighted target(s) that ignore a tap');
      if (s.id === 'go') { const g = await pg.evaluate(() => { const ns = document.querySelectorAll('#map .node.glow'); const e = ns[ns.length - 1]; if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, n: ns.length, t: e.className }; }); if (g) { console.log(name + ': room step, ' + g.n + ' glowing, tapping ' + g.t); await tapXY(g.x, g.y); continue; } }
      const c = await pg.evaluate(() => { const st = GXT.current(); const t = st && st.target && st.target(); if (!t || !t.getBoundingClientRect) return null; const r = t.getBoundingClientRect(); return { x: r.left + r.width / 2, y: Math.min(r.top + r.height / 2, innerHeight - 4) }; });
      if (c) await tapXY(c.x, c.y);
    }
    await sleep(1500);
    const RULES = await pg.evaluate(() => window.EC_TUT_RULES || []);
    let at = -1; RULES.forEach(r => { const j = seen.indexOf(r); if (j < 0) fail(name + ': rule step missing: ' + r); else if (j < at) fail(name + ': rule step out of order: ' + r); else at = j; });
    Object.keys(says).forEach(id => { const w = String(says[id] || '').replace(/[^a-zA-Z0-9'’+]+/g, ' ').trim().split(' ').filter(Boolean).length; if (w > 12) fail(name + ': step ' + id + ' has ' + w + ' words'); });
    const end = await pg.evaluate(() => ({ kit: !!(window.GXT && GXT.active()), coach: UI.coachOn && UI.coachOn(), scr: EC.E.G().scr, at: EC.E.G().at }));
    if (end.kit || !end.coach || end.scr === 'map') fail(name + ': run did not continue after the tutorial ' + JSON.stringify(end));
    if (errs.length) fail(name + ' errors: ' + errs.slice(0, 3).join(' | '));
    console.log(name, 'steps', seen.length + ':', seen.join(' > '), '| after:', JSON.stringify(end));
    await ctx.close();
  }
  await br.close(); srv.close(); console.log(bad ? 'TUT WALK FAIL' : 'TUT WALK PASS'); process.exit(bad ? 1 : 0);
})();
