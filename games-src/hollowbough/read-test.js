// Readability test: plays into a real game vs the computer and checks every visible card text (hand, meadow, my city, zoom, rivals' cities).
//   NODE_PATH=/opt/node-tools/node_modules node read-test.js [outPrefix=read] [sizes=390x763,375x553,1280x800] [shots=1]
// Fails when: font size (effective on-screen px) < 11 for names/costs/points (phones; 10 on desktop) or < 10 for rules text,
// or the contrast of the text against the pixels really rendered behind it is < 4.5:1 (mean) / over 12% of its pixels under 3:1.
// Writes playtest/<prefix>-<scene>-<WxH>.png. Prints "FAIL ..." lines and "READ PASS" or "READ FAIL n".
const PW = (() => { try { return require('playwright'); } catch (e) { return require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright'); } })();
const fs = require('fs'), path = require('path');
const html = fs.readFileSync(path.join(__dirname, 'game', 'hollowbough.html'));
const PREFIX = process.argv[2] || 'read', SIZES = (process.argv[3] || '390x763,375x553,1280x800').split(',').map(s => s.split('x').map(Number)), SHOTS = process.argv[4] !== '0';
const OUT = path.join(__dirname, 'playtest'); fs.mkdirSync(OUT, { recursive: true });
const MEDIA = path.join(__dirname, '..', '..', 'games', 'hollowbough', 'media');
const sleep = ms => new Promise(r => setTimeout(r, ms));
let bad = 0; const seen = new Set();
const groups = new Map();
const fail = (tag, msg, key, val) => { bad++; if (!key) { console.log('FAIL', tag, msg); return; } const g = groups.get(tag + '|' + key) || { tag, key, n: 0, worst: val, ex: msg }; g.n++; if (val < g.worst) { g.worst = val; g.ex = msg; } groups.set(tag + '|' + key, g); };

// runs in the page: every visible card text element with its effective font size, colour and box
function collect() {
  const out = [], vw = innerWidth, vh = innerHeight;
  const vis = (e, r) => {
    if (r.width < 1 || r.height < 1 || r.right <= 0 || r.bottom <= 0 || r.left >= vw || r.top >= vh) return false;
    for (let n = e; n && n.nodeType === 1; n = n.parentElement) { const s = getComputedStyle(n); if (s.display === 'none' || s.visibility === 'hidden' || +s.opacity < .05) return false; if (n.hidden) return false; }
    return true;
  };
  const cardNames = new Set((G ? HB.DATA.cards : []).map(c => c.name));
  document.querySelectorAll('svg[data-art] text').forEach(t => {
    const r = t.getBoundingClientRect(); if (!vis(t, r)) return;
    const svg = t.closest('svg[data-art]'), m = t.getScreenCTM(), sc = Math.hypot(m.a, m.b), fs = parseFloat(t.getAttribute('font-size')) * sc;
    const txt = t.textContent.trim(); if (!txt) return;
    { const cx = Math.min(vw - 1, Math.max(0, (r.left + r.right) / 2)), cy = Math.min(vh - 1, Math.max(0, (r.top + r.bottom) / 2)), top = document.elementsFromPoint(cx, cy).find(e => !e.matches('.glow,.gxh-ring')); if (!top || !(svg === top || svg.contains(top) || top.contains(svg) && !top.matches('body,html,#bd,#app,main'))) return; }   // covered by something else = not visible
    const cat = [...cardNames].some(n => n === txt || n.split(/\s+/).join(' ').includes(txt)) && /[a-z]/.test(txt) && txt === txt.replace(/^[A-Z ]+$/, '') ? 'name' : /^\d+$/.test(txt) ? 'num' : /^[A-Z ]{4,}$/.test(txt) ? 'label' : /^(Critter|Construction|Unique|Common)$/.test(txt) ? 'label' : t.querySelector('tspan') ? 'rules' : 'other';
    const cr = svg.getBoundingClientRect();
    out.push({ kind: 'svg', cat, txt: txt.slice(0, 40), fs, cardW: cr.width, rect: [r.left, r.top, r.right, r.bottom], color: getComputedStyle(t).fill, id: svg.closest('[data-card]') ? svg.closest('[data-card]').dataset.card : '' });
  });
  document.querySelectorAll('.zinfo b,.zinfo p,.zinfo .sm,.rc b,.rc .sm,.cb b,.cb span').forEach(t => {
    const r = t.getBoundingClientRect(); if (!vis(t, r)) return; if (!t.childNodes.length || ![...t.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) return;
    const s = getComputedStyle(t), txt = t.textContent.trim();
    out.push({ kind: 'html', cat: t.matches('p') || t.matches('.sm') ? 'rules' : 'name', txt: txt.slice(0, 40), fs: parseFloat(s.fontSize), cardW: 0, rect: [r.left, r.top, r.right, r.bottom], color: s.color, id: '' });
  });
  return out;
}
async function measure(p, tag, scene, phone) {
  await p.evaluate(() => { if (!document.getElementById('rt-nofinger')) { const st = document.createElement('style'); st.id = 'rt-nofinger'; st.textContent = '[class*=finger],[id*=finger],.gxh-bub,.gxh-ring{display:none!important}'; document.head.appendChild(st); } });   // the tutorial hand is a pointer, not card text
  const items = await p.evaluate(collect);
  // contrast: hide the measured texts, screenshot what is really behind them, sample the pixels in each text box
  await p.evaluate(() => { const st = document.createElement('style'); st.id = 'rt-hide'; st.textContent = 'svg[data-art] text,.zinfo b,.zinfo p,.zinfo .sm,.rc b,.rc .sm,.cb b,.cb span{visibility:hidden!important}'; document.head.appendChild(st); });
  await sleep(60);
  const buf = await p.screenshot({ type: 'png' });
  const res = await p.evaluate(async ([b64, items]) => {
    const img = await createImageBitmap(await (await fetch('data:image/png;base64,' + b64)).blob()), c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
    const x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(img, 0, 0);
    const lum = (r, g, b) => { const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }; return .2126 * f(r) + .7152 * f(g) + .0722 * f(b); };
    const cr = (a, b) => (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
    return items.map(it => {
      const m = it.color.match(/[\d.]+/g).map(Number), tl = lum(m[0], m[1], m[2]);
      const [l, t, r, bt] = it.rect, x0 = Math.max(0, Math.floor(l)), y0 = Math.max(0, Math.floor(t)), w = Math.min(c.width, Math.ceil(r)) - x0, h = Math.min(c.height, Math.ceil(bt)) - y0;
      if (w < 1 || h < 1) return { mean: 21, low: 0 };
      const d = x.getImageData(x0, y0, w, h).data; let sum = 0, n = 0, low = 0;
      for (let i = 0; i < d.length; i += 4) { const L = lum(d[i], d[i + 1], d[i + 2]); sum += L; n++; if (cr(tl, L) < 3) low++; }
      return { mean: cr(tl, sum / n), low: low / n };
    });
  }, [buf.toString('base64'), items]);
  await p.evaluate(() => { const s = document.getElementById('rt-hide'); if (s) s.remove(); });
  const MIN = { name: phone ? 11 : 10, num: phone ? 11 : 10, rules: 10, label: 8, other: 8 };
  items.forEach((it, i) => {
    const c = res[i], where = `${tag} ${scene}`, what = `${it.cat} "${it.txt}"${it.id ? ' #' + it.id : ''} (card ${Math.round(it.cardW)}px)`;
    if (it.fs < MIN[it.cat] - .05) fail(where, `font ${it.fs.toFixed(1)}px < ${MIN[it.cat]} ${what}`, scene + ' font ' + it.cat + ' <' + MIN[it.cat], it.fs);
    if (c.mean < 4.5) fail(where, `contrast ${c.mean.toFixed(1)}:1 < 4.5 ${what}`, scene + ' contrast ' + it.cat, c.mean);
    else if (c.low > .12) fail(where, `${Math.round(c.low * 100)}% of the pixels behind the text under 3:1 ${what}`, scene + ' patchy ' + it.cat, 1 - c.low);
  });
  return items.length;
}
async function play(p) {   // the human seat plays like the computer until the city has cards
  return p.evaluate(async () => {
    const sl = ms => new Promise(r => setTimeout(r, ms));
    for (let i = 0; i < 400; i++) {
      if (G.phase === 'over') break;
      if (UI.cards.length) { const ok = document.querySelector('#pc:not([hidden]) [data-a=cont],#pc:not([hidden]) [data-a=take]'); if (ok) ok.click(); await sl(80); continue; }
      const a = HB.actor(G);
      if (UI.animBusy || a < 0 || G.players[a].ai) { await sl(60); continue; }
      if (G.players[0].city.length >= 5 && G.players.every(q => q.city.length >= 2) && G.players[0].hand.length >= 4) break;
      try { act(HB.AI.choose(G, a, 'normal')); } catch (e) { return 'err ' + e.message; }
      await sl(60);
    }
    return G.players.map(q => q.city.length + '/' + q.hand.length).join(' ');
  });
}
(async () => {
  const browser = await PW.chromium.launch();
  for (const [W, H] of SIZES) {
    const phone = W < 700, tag = `${W}x${H}`;
    const ctx = await browser.newContext({ viewport: { width: W, height: H }, isMobile: phone, hasTouch: phone, deviceScaleFactor: 1 });
    await ctx.route('**/*', r => { const u = new URL(r.request().url()); if (u.host !== 'gns.test') return r.abort();
      if (u.pathname.startsWith('/media/')) { const f = path.join(MEDIA, path.basename(u.pathname)); return fs.existsSync(f) ? r.fulfill({ status: 200, contentType: 'image/webp', body: fs.readFileSync(f) }) : r.abort(); }
      if (u.pathname.startsWith('/music/')) return r.abort();
      return r.fulfill({ status: 200, contentType: 'text/html', body: html }); });
    const p = await ctx.newPage(); p.setDefaultTimeout(8000);
    p.on('pageerror', e => fail(tag, 'pageerror ' + e.message));
    await p.goto('https://gns.test/'); await sleep(500);
    // vs computer, tutorial skipped (fresh profile, no tutorial offered, tips off)
    await p.evaluate(() => { try { localStorage.clear(); localStorage.setItem('hb-tut-done', '1'); } catch (e) { } UI.seed = 23; AIDELAY = 30; UI.opt = { np: 3, level: 'normal', solo: 1 }; newGame('vs'); try { GXH.setEnabled(false); } catch (e) { } });
    await sleep(500); await p.evaluate(() => { document.querySelectorAll('.gxh-bub,.gxh-finger,.gxh-ring').forEach(e => e.remove()); try { GXH.hide(); } catch (e) { } });
    console.log(tag, 'played to', await play(p)); await sleep(900);
    console.log(tag, 'hand card widths', await p.evaluate(() => [...document.querySelectorAll('.sc svg[data-art]')].map(e => Math.round(e.getBoundingClientRect().width)).join(',')));
    const shot = async name => { if (SHOTS) await p.screenshot({ path: path.join(OUT, `${PREFIX}-${name}-${tag}.png`) }); };
    // 1) the table: meadow cards and my hand
    await shot('hand'); const n1 = await measure(p, tag, 'table', phone);
    // 2) zoom on a meadow card and a hand card
    for (const [sel, nm] of [['.mc [data-card]', 'zoom-meadow'], ['.sc [data-card]', 'zoom-hand']]) {
      const id = await p.evaluate(s => { const e = document.querySelector(s); return e ? e.dataset.card : null; }, sel);
      if (id == null) { fail(tag, 'no card for ' + nm); continue; }
      await p.evaluate(id => openZoom('card:' + id), id); await sleep(250); await shot(nm); await measure(p, tag, nm, phone); await p.evaluate(() => closeZoom());
    }
    // 3) my city
    await p.evaluate(() => { UI.sel = null; UI.cityOpen = { logN: G.logN }; render(); }); await sleep(400); await shot('city'); const n3 = await measure(p, tag, 'my city', phone);
    const cid = await p.evaluate(() => { const e = document.querySelector('#cityov [data-card]'); return e ? e.dataset.card : null; });
    if (cid != null) { await p.evaluate(id => openZoom('card:' + id), cid); await sleep(250); await shot('zoom-city'); await measure(p, tag, 'city zoom', phone); await p.evaluate(() => closeZoom()); }
    await p.evaluate(() => { UI.cityOpen = null; render(); }); await sleep(200);
    // 4) the rivals' cities
    for (const s of [1, 2]) {
      await p.evaluate(s => { GX.show('rivald'); renderRival(s); }, s); await sleep(400); await shot('rival' + s); await measure(p, tag, 'rival ' + s, phone);
      await p.evaluate(() => { try { GX.hide(); } catch (e) { } try { GX.close(); } catch (e) { } });
    }
    console.log(tag, 'texts checked: table', n1, 'city', n3);
    await ctx.close();
  }
  await browser.close();
  for (const g of groups.values()) console.log('FAIL', g.tag, g.key, 'x' + g.n, 'worst:', g.ex);
  console.log(bad ? 'READ FAIL ' + bad : 'READ PASS'); process.exit(bad ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
