// Phone layout + touch-only play check. node lay-phone.js [WxH,...] [--turns=N]   prints "FAIL <size> <check>" lines, then PROBLEMS n
// Default sizes: 390x844 844x390 360x740 740x360 (isMobile + hasTouch, ?phone=1 is NOT forced: the phone mode must switch on by itself).
const PW = require(process.env.PW || (require('child_process').execSync('npm root -g').toString().trim() + '/playwright'));
const fs = require('fs'), path = require('path'); const HERE = __dirname, OUT = path.join(HERE, 'shots', 'ph'); fs.mkdirSync(OUT, { recursive: true });
const html = fs.readFileSync(path.join(HERE, 'kaiten.html'));
const SIZES = (process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : '390x844,844x390,360x740,740x360,390x763,390x664,375x553,412x780,750x342').split(',').map(s => s.split('x').map(Number));
const TURNS = +((process.argv.find(a => a.startsWith('--turns=')) || '').slice(8)) || 8;
(async () => {
  const b = await PW.chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }); let bad = 0;
  for (const [W, H] of SIZES) {
    const t = W + 'x' + H; const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
    await ctx.route('**/*', r => new URL(r.request().url()).host === 'gns.test' ? r.fulfill({ status: 200, contentType: 'text/html', body: html }) : r.abort());
    const p = await ctx.newPage(); p.setDefaultTimeout(30000); const errs = []; p.on('pageerror', e => errs.push('pageerror ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/net::|Failed to load/.test(m.text())) errs.push(m.text()); });
    const fail = (c, d) => { bad++; console.log('FAIL', t, c, d || ''); }; const log = (...a) => console.log(t, ...a);
    const shot = async n => { await p.screenshot({ path: path.join(OUT, `${t}_${n}.png`) }); };
    const scroll = async tag => { const r = await p.evaluate(() => ({ h: document.documentElement.scrollHeight, w: document.documentElement.scrollWidth, vh: innerHeight, vw: innerWidth })); if (r.h > r.vh + 1 || r.w > r.vw + 1) fail('scroll ' + tag, JSON.stringify(r)); };
    const ov = (A, B) => A[0] < B[2] - .5 && A[2] > B[0] + .5 && A[1] < B[3] - .5 && A[3] > B[1] + .5;
    const rect = sel => p.evaluate(s => { const e = document.querySelector(s); if (!e || e.hidden) return null; const r = e.getBoundingClientRect(); return [r.left, r.top, r.right, r.bottom]; }, sel);
    const insideVP = A => A && A[0] >= -1 && A[1] >= -1 && A[2] <= W + 1 && A[3] <= H + 1;
    const targets = async tag => {
      const r = await p.evaluate(() => {
        const o = []; const vis = e => { const r = e.getBoundingClientRect(); if (!r.width || !r.height) return null; const cs = getComputedStyle(e); if (cs.visibility === 'hidden' || cs.display === 'none') return null; return r; };
        for (const e of document.querySelectorAll('.gx-bar button,#dock button,#belt .hc[data-up="1"],#tbl .grp,#tbl .sh,#ppop button,#pc button,#rs button,.gx-drawer.on button,#start button,#start summary,#netbox button')) {
          if (e.closest('[hidden]')) continue; if (e.closest('.gx-drawer') && !e.closest('.gx-drawer.on')) continue; const r = vis(e); if (!r) continue;
          if (r.width < 43.9 || r.height < 43.9) o.push((e.dataset.a || e.dataset.gx || e.className) + ' ' + Math.round(r.width * 10) / 10 + 'x' + Math.round(r.height * 10) / 10);
        }
        const txt = []; const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n;
        while (n = w.nextNode()) { const s = n.textContent.trim(); if (!s) continue; const e = n.parentElement; if (!e || e.closest('svg,script,style,#start[hidden],[hidden],.sr,#toast,.gx-drawer:not(.on)')) continue; const r = e.getBoundingClientRect(); if (!r.width || !r.height) continue; const cs = getComputedStyle(e); if (cs.visibility === 'hidden' || cs.display === 'none') continue; if (r.right < 0 || r.bottom < 0 || r.left > innerWidth || r.top > innerHeight) continue; if (parseFloat(cs.fontSize) < 12.95) txt.push(s.slice(0, 18) + ':' + cs.fontSize); }
        return { small: o.slice(0, 6), txt: txt.slice(0, 6) };
      });
      if (r.small.length) fail('tap target <44 ' + tag, JSON.stringify(r.small)); if (r.txt.length) fail('text <13px ' + tag, JSON.stringify(r.txt)); await clipped(tag); await primary(tag);
    };
    const clipped = async tag => {
      await p.waitForTimeout(650);
      const r = await p.evaluate(() => { const out = []; const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n;
        while (n = w.nextNode()) { const s = n.textContent.trim(); if (!s) continue; const e = n.parentElement; if (!e || e.closest('svg,script,style,[hidden],.sr,#toast,.gx-drawer:not(.on),#start[hidden]')) continue; const cs0 = getComputedStyle(e); if (cs0.visibility === 'hidden' || cs0.display === 'none') continue;
          const rg = document.createRange(); rg.selectNodeContents(n); const tr = rg.getBoundingClientRect(); if (!tr.width || !tr.height) continue; if (tr.right < 0 || tr.bottom < 0 || tr.left > innerWidth || tr.top > innerHeight) continue;
          if (tr.left < -1 || tr.top < -1 || tr.right > innerWidth + 1 || tr.bottom > innerHeight + 1) { let sc = false; for (let a = e; a; a = a.parentElement) { const c = getComputedStyle(a); if (/auto|scroll/.test(c.overflowY + c.overflowX) && a !== document.documentElement) sc = true; } if (!sc) out.push('outside viewport: ' + s.slice(0, 20)); continue; }
          let sx = false; for (let a = e; a && a !== document.documentElement; a = a.parentElement) { const cs = getComputedStyle(a); if (cs.display === 'none') break; if (/auto|scroll/.test(cs.overflowX)) sx = true;
            const ox = cs.overflowX, oy = cs.overflowY; const hid = v => v === 'hidden' || v === 'clip';
            if (hid(ox) || hid(oy)) { const ar = a.getBoundingClientRect(); const ell = cs.textOverflow === 'ellipsis' || (cs0.textOverflow === 'ellipsis'); if (hid(oy) && (tr.top < ar.top - 1.5 || tr.bottom > ar.bottom + 1.5)) { out.push('clipped (y) ' + (a.id || a.className.toString().slice(0, 18)) + ': ' + s.slice(0, 20) + ' ' + Math.round(tr.top) + '-' + Math.round(tr.bottom) + ' in ' + Math.round(ar.top) + '-' + Math.round(ar.bottom)); break; } if (hid(ox) && !sx && !ell && (tr.left < ar.left - 1.5 || tr.right > ar.right + 1.5) && cs.overflowX !== 'auto') { out.push('clipped (x) ' + (a.id || a.className.toString().slice(0, 18)) + ': ' + s.slice(0, 20)); break; } }
            if (cs.webkitLineClamp && cs.webkitLineClamp !== 'none' && a.scrollHeight > a.clientHeight + 1) { out.push('line-clamped: ' + s.slice(0, 20)); break; } } }
        return out.slice(0, 5); });
      if (r.length) fail('clipped text ' + tag, JSON.stringify(r));
    };
    const primary = async tag => {
      const r = await p.evaluate(() => { const sels = ['#rs [data-a=rsnext]', '#rs [data-a=again]', '#pc [data-a=take]', '#pc [data-a=cont]:not(.px)', '#acts [data-a=serve]']; const ovl = document.querySelector('.gx-drawer.on') || (document.querySelector('#ppop') && !document.querySelector('#ppop').hidden); for (const s of sels) { if (ovl && s.startsWith('#acts')) continue; const e = document.querySelector(s); if (!e || e.closest('[hidden]')) continue; const r = e.getBoundingClientRect(); if (!r.width) continue; const pts = [[.5, .5], [.1, .2], [.9, .8]]; const bad = []; if (r.left < -1 || r.top < -1 || r.right > innerWidth + 1 || r.bottom > innerHeight + 1) bad.push('outside viewport'); for (const q of pts) { const h = document.elementFromPoint(r.left + r.width * q[0], r.top + r.height * q[1]); if (!h || !e.contains(h)) bad.push('covered by ' + (h && (h.id || h.className))); } return { s, bad: bad.slice(0, 2) }; } return null; });
      if (r && r.bad.length) fail('primary button ' + r.s + ' ' + tag, JSON.stringify(r.bad));
    };
    const boardCheck = async tag => {
      const r = await p.evaluate(() => { const B = document.querySelector('#bd').getBoundingClientRect(); const bad = []; let n = 0;
        for (const e of document.querySelectorAll('#belt .hc[data-up="1"],#tbl .sh')) { n++; const r = e.getBoundingClientRect(); if (r.left < B.left - .5 && e.closest('#belt') === null || r.top < B.top - .5 || r.bottom > B.bottom + .5 || r.right > B.right + .5 && e.closest('#belt') === null) bad.push('out ' + (e.dataset.a || 'sh')); const x = r.left + r.width / 2, y = r.top + r.height / 2; if (e.closest('#belt')) { const bl = document.querySelector('#belt').getBoundingClientRect(); if (x < bl.left + 1 || x > bl.right - 1) continue; } if (x < 0 || y < 0 || x >= innerWidth || y >= innerHeight) continue; const hit = document.elementFromPoint(x, y); if (!hit || !e.contains(hit)) bad.push('covered ' + (e.dataset.a || 'sh') + (e.dataset.i || e.dataset.seat) + ' by ' + (hit && (hit.id || (hit.className && hit.className.baseVal) || hit.className))); }
        return { n, bad: bad.slice(0, 5) }; });
      if (r.bad.length) fail('board ' + tag, JSON.stringify(r)); return r;
    };
    const turn = async () => { for (let k = 0; k < 200; k++) { const s = await p.evaluate(() => canPick() || G.phase === 'over' || !document.querySelector('#rs').hidden || !document.querySelector('#pc').hidden); if (s) return; await p.waitForTimeout(120); } };
    const cards = async () => { for (let k = 0; k < 12; k++) { const b = await p.$('#pc:not([hidden]) [data-a=cont],#pc:not([hidden]) [data-a=take]'); if (!b) break; try { await b.tap({ timeout: 3000 }); } catch (e) { } await p.waitForTimeout(150); } };
    const dockOf = () => rect('#dock');
    await p.goto('https://gns.test/'); await p.waitForTimeout(700); await scroll('start'); await shot('0start'); await targets('start');
    const phc = await p.evaluate(() => document.documentElement.className); if (!/\bph\b/.test(phc)) fail('phone class missing', phc);
    // ---- a game against computers, by touch
    await p.evaluate(() => { try { localStorage.clear(); } catch (e) { } UI.seed = 5; AIDELAY = 60; UI.opt = { np: 4, level: 'normal', lv: ['normal', 'normal', 'normal', 'normal'] }; });
    await p.tap('[data-start=vs]'); await p.waitForTimeout(900); await turn(); await cards(); await turn();
    await scroll('game');
    const m = await p.evaluate(() => { const b = document.querySelector('#bd').getBoundingClientRect(); return { w: b.width, h: b.height, short: Math.min(innerWidth, innerHeight), vw: innerWidth, vh: innerHeight, ph: document.documentElement.className }; });
    log('board', JSON.stringify(m));
    const port = m.vw < m.vh; const side = port ? m.w : m.h; if (side < .85 * m.short) fail('board share', side + ' < ' + .85 * m.short); if (!port && m.w < .85 * m.short) fail('board width landscape', m.w); if (port && m.h < .75 * m.w) fail('board height < 0.75 width', m.h);
    await boardCheck('turn'); await targets('turn'); await shot('1turn');
    // lift a plate by touch
    await p.tap('#belt .hc[data-up="1"] >> nth=1'); await p.waitForTimeout(250);
    {
      const sel = await p.evaluate(() => ({ serve: !!document.querySelector('#acts [data-a=serve]'), sel: document.querySelectorAll('#belt .hc.sel').length, info: document.querySelector('#selinfo').textContent.length }));
      if (!sel.serve) fail('no Serve button after lifting'); if (sel.sel !== 1) fail('plate not lifted', sel.sel); if (sel.info < 8) fail('selected plate info missing');
      const sr = await rect('#selinfo'), br = await rect('#bd'), dr = await dockOf(); if (sr && ov(sr, br)) fail('plate info over the board'); if (sr && dr && (sr[2] > dr[2] + 1 || sr[3] > dr[3] + 1)) fail('plate info outside the dock', JSON.stringify([sr, dr]));
      const ab = await p.evaluate(() => [...document.querySelectorAll('#acts button')].map(e => { const r = e.getBoundingClientRect(); return [r.left, r.top, r.right, r.bottom, e.dataset.a]; })); const dd = await dockOf(); for (const a of ab) if (a[2] > dd[2] + 1 || a[3] > dd[3] + 1 || a[0] < dd[0] - 1) fail('action button outside the dock ' + a[4], JSON.stringify([a, dd]));
      await boardCheck('lifted'); await targets('lifted'); await shot('2lifted');
    }
    // tap a group on a counter: details open in the dock, never over the board
    await p.evaluate(() => { const g = [...document.querySelectorAll('#tbl .grp')].find(e => e.dataset.k !== 'pud'); window.__g = g && g.dataset.seat + '|' + g.dataset.k; });
    {
      const g = await p.$('#tbl .grp'); if (!g) fail('no group on the table'); else {
        const gr = await g.evaluate(e => { const r = e.getBoundingClientRect(); return [r.left, r.top, r.right, r.bottom]; }); await g.tap(); await p.waitForTimeout(300);
        const pr = await rect('#ppop'), br = await rect('#bd'), dr = await dockOf();
        if (!pr) fail('group pop-up did not open'); else { if (ov(pr, br)) fail('pop-up over the board', JSON.stringify([pr, br])); if (ov(pr, gr)) fail('pop-up over its group'); if (pr[0] < dr[0] - 1 || pr[2] > dr[2] + 1 || pr[3] > dr[3] + 1 || pr[1] < dr[1] - 1) fail('pop-up outside the dock', JSON.stringify([pr, dr])); await shot('3pop'); await targets('pop');
          await p.tap('#ppop [data-a=popx]'); await p.waitForTimeout(150); if (await rect('#ppop')) fail('x did not close the pop-up');
          await g.tap(); await p.waitForTimeout(250); await p.keyboard.press('Escape'); await p.waitForTimeout(150); if (await rect('#ppop')) fail('Esc did not close the pop-up');
          await g.tap(); await p.waitForTimeout(250); { const r = await rect('#beltz .lab'); await p.touchscreen.tap(r[0] + 40, (r[1] + r[3]) / 2); } await p.waitForTimeout(250); if (await rect('#ppop')) fail('outside tap did not close the pop-up'); }
      }
    }
    // roster chip -> diners drawer
    { const us = await p.$('#acts [data-a=unsel]'); if (us) await us.tap(); await p.waitForTimeout(150); } await p.tap('#roster .chip >> nth=1'); await p.waitForTimeout(500); await scroll('drawer'); await shot('4diners'); await targets('diners drawer'); { const on = await p.evaluate(() => document.getElementById('rivald').classList.contains('on')); if (!on) fail('chip did not open the diners drawer'); } await p.keyboard.press('Escape'); await p.waitForTimeout(300);
    for (const id of ['logd', 'rulesd', 'setd']) { await p.tap(`.gx-bar [data-gx=${id}]`); await p.waitForTimeout(450); await scroll('drawer ' + id); if (!(await p.evaluate(i => document.getElementById(i).classList.contains('on'), id))) fail('drawer did not open', id); if (id === 'setd') { await shot('5menu'); await targets('menu'); } if (id === 'rulesd') await shot('5rules'); await p.keyboard.press('Escape'); await p.waitForTimeout(300); }
    // hint
    { const hb = await p.$('#acts [data-a=hint]'); if (hb) { await hb.tap(); await p.waitForTimeout(400); const st = await p.evaluate(() => ({ rec: document.querySelectorAll('#belt .hc.rec').length, sel: document.querySelectorAll('#belt .hc.sel').length })); if (!st.rec) fail('hint marked no plate'); await shot('6hint'); await targets('hint'); } else fail('no hint button'); }
    // serve with the real animations, look at the cover and the reveal
    await p.tap('#acts [data-a=serve]'); await p.waitForTimeout(500); await shot('7cover'); await scroll('cover'); await targets('cover');
    let rv = false; for (let k = 0; k < 50; k++) { const st = await p.evaluate(() => ({ lift: !!document.querySelector('.kk-cloche.kk-lift'), can: canPick(), busy: UI.busy })); if (st.lift && !rv) { rv = true; await shot('8reveal'); await boardCheck('reveal'); } if (st.can) break; await p.waitForTimeout(120); }
    if (!rv) log('note: reveal frame not caught (timing)');
    await shot('9landed'); await boardCheck('landed');
    // a full human sequence by touch only: tap a plate, tap it again
    let prog = 0, stuck = 0, twin = 0;
    for (let k = 0; k < TURNS * 4 && prog < TURNS; k++) {
      await turn(); await cards(); const st = await p.evaluate(() => ({ over: G.phase === 'over', rs: !document.querySelector('#rs').hidden, can: canPick(), key: G.round * 100 + G.turn, picked: G.players[0].picked })); if (st.over) break;
      if (st.rs) { await shot('10roundpad'); await scroll('round pad'); await targets('round pad'); const rr = await rect('.rsbox'); if (!insideVP(rr)) fail('round pad does not fit', JSON.stringify(rr)); await p.waitForTimeout(500); await p.tap('#rs [data-a=rsnext]'); await p.waitForTimeout(300); prog++; continue; }
      if (!st.can) { await p.waitForTimeout(150); if (++stuck > 80) { fail('stuck: cannot pick'); break; } continue; }
      const n = await p.evaluate(() => document.querySelectorAll('#belt .hc[data-up="1"]').length); const i = (k * 3 + 1) % Math.max(1, n);
      const tw = await p.$('#acts [data-a=twin]'); if (tw && !twin++) { await tw.tap(); await p.waitForTimeout(200); await shot('11twin'); await targets('twin'); await tw.tap(); await p.waitForTimeout(100); }
      await p.tap(`#belt .hc[data-up="1"] >> nth=${i}`); await p.waitForTimeout(150); await p.tap(`#belt .hc[data-up="1"].sel`); await p.waitForTimeout(200); prog++;
      if (k === 4) { await scroll('midgame'); await boardCheck('midgame'); await targets('midgame'); await shot('12mid'); }
    }
    log('human picks by touch', prog); if (prog < Math.min(TURNS, 5)) fail('too few picks by touch', prog);
    // finish the meal fast, then check the final card
    await p.evaluate(() => { AIDELAY = 0; ANIM = 0; });
    for (let k = 0; k < 600; k++) { const st = await p.evaluate(() => ({ fin: G.phase === 'over' && UI.overShown, rs: !document.querySelector('#rs').hidden, pk: canPick(), pc: !document.querySelector('#pc').hidden })); if (st.fin) break; if (st.rs) { await p.evaluate(() => { const n = document.querySelector('#rs [data-a=rsnext]'); if (n) n.click(); }); } else if (st.pc) await cards(); else if (st.pk) await p.evaluate(() => { UI.sel = [0]; serveSel(); }); await p.waitForTimeout(50); }
    await p.waitForTimeout(400); await shot('13final'); await scroll('final'); await targets('final'); { const rr = await rect('.rsbox'); if (!rr) fail('no final result'); else if (!insideVP(rr)) fail('final result does not fit', JSON.stringify(rr)); }
    await p.tap('#rs [data-a=rsclose]'); await p.waitForTimeout(250); await scroll('after final'); await boardCheck('after final');
    // ---- guided game: the tip card sits in the dock
    await p.evaluate(() => { ANIM = 1; AIDELAY = 60; showStart(); }); await p.waitForTimeout(250); await scroll('start2'); await p.tap('[data-start=guided]'); await p.waitForTimeout(900);
    { const tip = await p.evaluate(() => !document.querySelector('#pc').hidden && document.querySelector('#pc').dataset.card); if (tip !== 'coach') fail('guided game shows no tip card', String(tip)); else { const pr = await rect('#pc'), br = await rect('#bd'), dr = await dockOf(); if (ov(pr, br)) fail('tip card over the board', JSON.stringify([pr, br])); if (pr[0] < dr[0] - 1 || pr[2] > dr[2] + 1 || pr[3] > dr[3] + 1 || pr[1] < dr[1] - 1) fail('tip card outside the dock'); const bb = await p.evaluate(() => { const c = document.querySelector('#pc'); const b = c.querySelector('[data-a=cont]:not(.px)'); const r = b && b.getBoundingClientRect(), cr = c.getBoundingClientRect(); return b ? [r.bottom <= cr.bottom + 1, c.scrollHeight <= c.clientHeight + 1] : null; }); if (!bb || !bb[0]) fail('tip button not visible'); await shot('14tip'); await targets('tip'); await p.tap('#pc [data-a=cont]:not(.px)'); await p.waitForTimeout(300); } }
    // ---- hot-seat pass card
    await p.evaluate(() => { showStart(); }); await p.waitForTimeout(250); await p.tap('[data-a=opt][data-k=np][data-v="3"]'); await p.tap('[data-start=hot]'); await p.waitForTimeout(700);
    { const pass = await p.evaluate(() => ({ card: !document.querySelector('#pc').hidden && !!document.querySelector('#pc [data-a=take]'), hand: document.querySelectorAll('#belt [data-up="1"]').length }));
      if (!pass.card) fail('no pass-the-device card in hot-seat'); if (pass.hand) fail('hand visible before the pass card is taken'); const pr = await rect('#pc'), br = await rect('#bd'); if (pr && ov(pr, br)) fail('pass card over the board'); await shot('15pass'); await scroll('pass'); await targets('pass');
      await p.tap('#pc [data-a=take]'); await p.waitForTimeout(400); const hh = await p.evaluate(() => ({ n: document.querySelectorAll('#belt [data-up="1"]').length, own: [...new Set([...document.querySelectorAll('#belt [data-owner]')].map(e => e.dataset.owner))].join(',') })); if (!hh.n) fail('hand not shown after taking the device'); await boardCheck('hot'); }
    // ---- watch computers to the end
    await p.evaluate(() => { showStart(); }); await p.waitForTimeout(200); await p.evaluate(() => { ANIM = 0; AIDELAY = 0; }); await p.tap('[data-start=ai]'); await p.waitForTimeout(300);
    for (let k = 0; k < 800; k++) { const st = await p.evaluate(() => ({ fin: G.phase === 'over' && UI.overShown, rs: !document.querySelector('#rs').hidden })); if (st.fin) break; if (st.rs) await p.evaluate(() => { const n = document.querySelector('#rs [data-a=rsnext]'); if (n) n.click(); }); await p.waitForTimeout(120); }
    { const ok = await p.evaluate(() => G.phase === 'over' && !document.querySelector('#rs').hidden); if (!ok) fail('watch game did not reach the final card'); }
    log('errors', JSON.stringify(errs.slice(0, 3))); bad += errs.length; if (errs.length) console.log('FAIL', t, 'console errors', errs.length);
    await ctx.close();
  }
  console.log('PROBLEMS', bad); await b.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });
