// Shelf header check. Run: NODE_PATH=/opt/node-tools/node_modules node games-src/shelf-shots/shelf-check.js
const { chromium } = require('playwright'); const path = require('path'), cp = require('child_process');
const OUT = __dirname, ROOT = path.resolve(__dirname, '..', '..'), PORT = 8123;
const srv = cp.spawn('python3', ['-m', 'http.server', PORT, '-d', path.join(ROOT, 'games')], { stdio: 'ignore' });
const SAVED = ['crown', 'nebula', 'doorkick', 'shipwreck', 'sands', 'sunglaze', 'rampart'];
const VPS = [['phone-390', 390, 763, 1], ['phone-375', 375, 553, 1], ['phone-land', 844, 390, 1], ['desk-1280', 1280, 800, 0], ['desk-1920', 1920, 1080, 0], ['desk-2000', 2000, 1055, 0]];
const fails = [];
const hit = (a, b) => a && b && a.w > 0 && b.w > 0 && a.x < b.x + b.w - 1 && b.x < a.x + a.w - 1 && a.y < b.y + b.h - 1 && b.y < a.y + a.h - 1;
(async () => {
  await new Promise(r => setTimeout(r, 800));
  const br = await chromium.launch();
  for (const [name, w, h, mob] of VPS) for (const n of [0, 7]) {
    const tag = `${name}/${n}`, bad = m => { fails.push(tag + ': ' + m); console.log('FAIL', tag, m) };
    const ctx = await br.newContext({ viewport: { width: w, height: h }, hasTouch: !!mob, isMobile: !!mob, deviceScaleFactor: 1 });
    const pg = await ctx.newPage(); const errs = [];
    pg.on('pageerror', e => errs.push(e.message));
    await pg.addInitScript(([n, S]) => { try { if (!sessionStorage.seeded) { sessionStorage.seeded = 1; localStorage.clear(); if (n) { const o = {}; S.slice(0, n).forEach(i => o[i] = { t: 1 }); localStorage.setItem('gns-saves', JSON.stringify(o)); localStorage.setItem('shelf_last', S[4]); } } } catch (e) { } }, [n ? 7 : 0, SAVED]);
    await pg.goto(`http://localhost:${PORT}/index.html`); await pg.waitForTimeout(1800);
    const m = await pg.evaluate(() => {
      const R = e => { if (!e) return null; const r = e.getBoundingClientRect(), cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden' || e.hidden) return null; return { x: r.x, y: r.y, w: r.width, h: r.height } };
      const all = s => [...document.querySelectorAll(s)].map(R).filter(Boolean);
      const hdr = { title: R(document.querySelector('header.top h1')), sub: R(document.querySelector('header.top .sub')), cont: R(document.getElementById('controw')), tools: R(document.querySelector('header.top .tools')) };
      const chips = [...document.querySelectorAll('#controw .crb')].map(R).filter(Boolean);
      const room = { bookcase: R(document.getElementById('bookcase')), boxes: all('.boxbtn'), win: R(document.querySelector('.window')), trophies: all('.trophy'), mantel: R(document.getElementById('mantel')) };
      const bx = [...document.querySelectorAll('.boxbtn')]; const newOv = [];
      bx.forEach(b => { const nw = b.querySelector('.new'), bd = b.querySelector('.band'); const a = R(nw); let c = null; if (bd) { const rg = document.createRange(); rg.selectNodeContents(bd); const q = rg.getBoundingClientRect(); c = { x: q.x, y: q.y, w: q.width, h: q.height } } if (a && c) newOv.push({ a, c, id: b.dataset.id }) });
      const stb = document.querySelectorAll('.stb').length, news = document.querySelectorAll('.new').length;
      return { hdr, chips, room, newOv, stb, news, sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, ph: document.documentElement.classList.contains('ph'), shown: R(document.getElementById('controw')) !== null };
    });
    if (m.sw > m.cw + 1) bad(`horizontal scroll ${m.sw}>${m.cw}`);
    if (m.stb) bad('Story badge present');
    if (n && !m.shown) bad('continue hidden'); if (!n && m.shown) bad('continue shown with 0 saves');
    if (m.chips.length) { const ys = new Set(m.chips.map(c => Math.round(c.y))); if (ys.size > 1) bad('continue chips wrap'); if (m.chips.length !== 2) bad('chips ' + m.chips.length) }
    const H = Object.entries(m.hdr).filter(([k, v]) => v);
    const room = [['bookcase', m.room.bookcase], ['win', m.room.win]].concat(m.room.boxes.map((b, i) => ['box' + i, b])).concat(m.room.trophies.map((b, i) => ['trophy' + i, b]));
    const hdrBottom = Math.max(...H.map(([k, v]) => v.y + v.h));
    for (const [hk, hv] of H) for (const [rk, rv] of room) if (hit(hv, rv)) bad(`${hk} overlaps ${rk}`);
    // header elements must not overlap each other
    for (let i = 0; i < H.length; i++) for (let j = i + 1; j < H.length; j++) if (hit(H[i][1], H[j][1])) bad(`${H[i][0]} overlaps ${H[j][0]}`);
    if (!m.ph && m.hdr.cont && m.hdr.tools) { if (Math.abs(m.hdr.cont.y + m.hdr.cont.h / 2 - m.hdr.tools.y - m.hdr.tools.h / 2) > 3) bad('continue not centred with tools'); if (m.hdr.cont.x + m.hdr.cont.w > m.hdr.tools.x) bad('continue right of tools start') }
    for (const o of m.newOv) if (hit(o.a, o.c)) { bad('New! covers title band ' + o.id + JSON.stringify(o)); break }
    if (m.ph && name === 'phone-390' && 0) { }
    if (name === 'phone-390') { const top = m.room.boxes.length ? Math.min(...m.room.boxes.map(b => b.y)) : 0; console.log(tag, 'hdrBottom', Math.round(hdrBottom), 'first box top', Math.round(top)) }
    await pg.screenshot({ path: path.join(OUT, `${name}-${n ? 'saved' : 'closed'}.png`) });
    if (n) {
      const more = await pg.$('#cmore'); if (!more) bad('no +N'); else {
        await more.click(); await pg.waitForTimeout(250);
        const st = await pg.evaluate(() => { const p = document.getElementById('cpop'), r = p.getBoundingClientRect(), b = document.getElementById('cmore'); return { hidden: p.hidden, items: p.querySelectorAll('.fo').length, exp: b.getAttribute('aria-expanded'), inView: r.left >= 0 && r.right <= innerWidth && r.top >= 0 && r.bottom <= innerHeight, focusIn: p.contains(document.activeElement) } });
        if (st.hidden || st.items !== 6 || st.exp !== 'true' || !st.inView || !st.focusIn) bad('popover ' + JSON.stringify(st));
        if (name === 'desk-2000' || name === 'phone-390') await pg.screenshot({ path: path.join(OUT, `${name}-cont-popover.png`) });
        await pg.keyboard.press('Escape'); await pg.waitForTimeout(150);
        if (!(await pg.evaluate(() => document.getElementById('cpop').hidden))) bad('Esc did not close');
        await more.click(); await pg.waitForTimeout(150);
        const tb = await pg.evaluate(() => { const r = document.querySelector('header.top h1').getBoundingClientRect(); return [r.x + 10, r.y + r.height / 2] }); if (mob) await pg.touchscreen.tap(tb[0], tb[1]); else await pg.mouse.click(tb[0], tb[1]);
        await pg.waitForTimeout(150);
        if (!(await pg.evaluate(() => document.getElementById('cpop').hidden))) bad('outside tap did not close');
        await more.click(); await pg.waitForTimeout(150);
        const first = await pg.$('#cpop .fo'); const id = await first.getAttribute('data-cont');
        if (mob) await first.tap(); else await first.click();
        await pg.waitForTimeout(1500);
        const opened = await pg.evaluate(() => { const t = document.getElementById('table'); return t && !t.hidden });
        if (!opened) bad('popover item did not open game ' + id);
      }
    }
    if (errs.length) bad('page errors ' + errs.join('|'));
    await ctx.close();
  }
  await br.close(); srv.kill();
  console.log(fails.length ? fails.length + ' FAILURES' : 'ALL OK'); process.exit(fails.length ? 1 : 0);
})();
