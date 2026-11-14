// Measures, over N real touch games: (a) smallest tap target (visible interactive elements), (b) helpers shown at once in normal play,
// (c) animations that never stop. Samples the page every second while a newcomer plays by touchscreen.tap (follows the glow).
// node measure.js [games=2] [WxH=375x667] [file=vinegrave.html]   (file: the built page or the staged games-src/.staging/vinegrave/index.html)
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path');
const N = +(process.argv[2] || 2), [W, H] = (process.argv[3] || '375x667').split('x').map(Number), FILE = path.resolve(process.argv[4] || path.join(__dirname, 'vinegrave.html'));
const REPO = path.resolve(__dirname, '../..');
const serve = () => new Promise(res => { const s = http.createServer((q, r) => { const u = decodeURIComponent(q.url.split('?')[0]); let f = u.endsWith('/vinegrave/') ? FILE : u.startsWith('/vinegrave/') ? path.join(REPO, 'games', u.slice(1)) : null;
  if (!f || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'content-type': { '.html': 'text/html', '.webp': 'image/webp', '.mp3': 'audio/mpeg' }[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
  s.listen(0, '127.0.0.1', () => res({ url: 'http://127.0.0.1:' + s.address().port + '/vinegrave/', close: () => s.close() })); });
const SAMPLE = () => {
  const vis = e => { const q = e.getBoundingClientRect(); if (q.width < 2 || q.height < 2) return null; const cs = getComputedStyle(e); if (cs.visibility === 'hidden' || cs.display === 'none' || cs.pointerEvents === 'none' || e.disabled) return null;
    const cx = Math.min(innerWidth - 1, Math.max(0, q.left + q.width / 2)), cy = Math.min(innerHeight - 1, Math.max(0, q.top + q.height / 2)); if (q.right < 0 || q.bottom < 0 || q.left > innerWidth || q.top > innerHeight) return null;
    const hit = document.elementFromPoint(cx, cy); if (!hit || !(hit === e || e.contains(hit))) return null; return q; };
  const tg = []; document.querySelectorAll('button,[role=button],a[href],.site,.cd,.pawn,#track,input,select,[data-a]').forEach(e => { if (e.closest('[hidden]')) return; const par = e.parentElement && e.parentElement.closest('button,[role=button],a[href],.site,.cd,#track,[data-a]'); if (par) return; if (e.tagName === 'SPAN' && e.classList.contains('pawn')) return; const q = vis(e); if (q) tg.push({ s: (e.id ? '#' + e.id : '') + '.' + String(e.className).split(' ').slice(0, 2).join('.') + '/' + (e.dataset.a || e.tagName), w: Math.round(q.width), h: Math.round(q.height) }); });
  const hpS = new Set(); document.querySelectorAll('.glow,.nudge,.aimark,.gxh-finger,.nx,[data-badge]').forEach(e => { const q = e.getBoundingClientRect(); if (q.width < 2) return; const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) return; const o = e.closest('.site,.cd,#track,.pawn,.btn') || e; o.__k = (o.__k || '') ; hpS.add(o); o.setAttribute('data-hk', ['glow','nudge','aimark','gxh-finger','nx'].filter(c => e.classList.contains(c)).concat(e.dataset.badge ? ['badge'] : []).join('+')); }); const hp = [...hpS].map(e => (e.id || String(e.className).split(' ').slice(0, 2).join('.')) + '[' + e.getAttribute('data-hk') + ']');
  const inf = document.getAnimations().filter(a => { try { return a.effect.getComputedTiming().iterations === Infinity && a.playState === 'running'; } catch (x) { return false; } }).map(a => (a.effect.target && (a.effect.target.id || String(a.effect.target.className).split(' ')[0])) + ':' + (a.animationName || a.constructor.name));
  const tk = document.querySelector('#track'), tq = tk && tk.getBoundingClientRect(), mq = document.querySelector('#map').getBoundingClientRect(); const dbg = tq && tq.height < 44 ? 'TRACK ' + Math.round(tq.width) + 'x' + Math.round(tq.height) + ' top ' + Math.round(tq.top) + ' cls ' + tk.className + ' map ' + Math.round(mq.height) + ' fx ' + (document.querySelector('#fx') && !document.querySelector('#fx').hidden) + ' vis ' + innerHeight + ' scroll ' + scrollY + ' DOCK ' + [...document.querySelector('#dock').children].map(c => (c.id || c.className) + ':' + Math.round(c.getBoundingClientRect().height)).join(',') + ' extra ' + (document.querySelector('#extra') ? Math.round(document.querySelector('#extra').getBoundingClientRect().height) : '-') : '';
  return { dbg, tg, hp, inf, q: !!(window.G && G.q), tut: !!(window.UI && UI.mode === 'tutorial') };
};
(async () => {
  const S = await serve(), b = await chromium.launch(); let wins = 0; const rows = [], allMin = {}, hpMax = [], infSeen = {}; let hpOver = 0, samples = 0;
  for (let g = 0; g < N; g++) {
    const ctx = await b.newContext({ viewport: { width: W, height: H }, hasTouch: true, isMobile: true });
    await ctx.addInitScript(() => { try { localStorage.setItem('vinegrave-prefs', JSON.stringify({ played: true })); localStorage.setItem('gxt-vinegrave', JSON.stringify({ done: true })); } catch (e) { } });
    const p = await ctx.newPage(), errs = []; p.on('pageerror', e => errs.push(String(e)));
    let rs = 9001 + g * 7919; const R = () => ((rs = (rs * 16807) % 2147483647) / 2147483647);
    const tapSel = async (sel, nth) => { const r = await p.evaluate(([s, n]) => { const e = [...document.querySelectorAll(s)].filter(x => { const q = x.getBoundingClientRect(); return q.width > 0 && q.height > 0; })[n || 0]; if (!e) return null; e.scrollIntoView({ block: 'nearest' }); const q = e.getBoundingClientRect(), x = q.left + q.width / 2, y = q.top + q.height / 2, t = document.elementFromPoint(x, y); return { x, y, ok: !!t && (t === e || e.contains(t)) }; }, [sel, nth]);
      if (!r || !r.ok) return false; await p.touchscreen.tap(r.x, r.y); await p.waitForTimeout(350); return true; };
    await p.goto(S.url); await p.waitForSelector('#start .tbtn'); await tapSel('#start .tbtn'); await p.waitForSelector('#goal .tbtn', { timeout: 8000 }); await tapSel('#goal .tbtn');
    let done = false, t0 = Date.now(), prevInf = {};
    const sampler = (async () => { while (!done) { await p.waitForTimeout(1000); if (done) break; const s = await p.evaluate(SAMPLE).catch(() => null); if (!s) continue; samples++;
      s.tg.forEach(t => { const k = t.s, m = Math.min(t.w, t.h); if (!(k in allMin) || m < allMin[k].m) allMin[k] = { m, w: t.w, h: t.h }; });
       hpMax.push(s.hp.length); if (s.hp.length > 1 && !s.tut && !s.q) { hpOver++; if (hpOver < 6) console.log('  >1 helper:', s.hp.join(' | ')); }
      s.inf.forEach(k => { infSeen[k] = (infSeen[k] || 0) + 1; }); } })();
    for (let k = 0; k < 700 && Date.now() - t0 < 300000; k++) {
      await p.waitForFunction(() => (window.G && myTurn()) || G.phase === 'over' || !document.querySelector('#fx').hidden, null, { timeout: 60000 }).catch(() => { });
      if (await p.evaluate(() => G.phase === 'over')) break;
      if (await p.evaluate(() => !document.querySelector('#fx').hidden)) { await tapSel('#fx .fxcard'); continue; }
      if (!(await p.evaluate(() => myTurn()))) continue;
      if (await p.locator('#qbox:not([hidden]) .btn').count()) { if (!(await tapSel('#qbox .cd.glow')) && !(await tapSel('#qbox .btn.go:not([disabled])'))) await tapSel('#qbox .btn:not([disabled])', 0); continue; }
      if (await p.evaluate(() => !!(G.q && myTurn()))) { if (!(await tapSel('.site.glow')) && !(await tapSel('#row .cd.glow'))) await tapSel('#qbox .btn'); continue; }
      const els = await p.evaluate(() => ['.site.glow', '#hand .cd.glow', '#row .cd.glow', '#track.glow'].flatMap(s => [...document.querySelectorAll(s)].map((e, i) => [s, i])));
      if (!els.length) { await tapSel('#passbtn'); await p.waitForTimeout(400); continue; }
      const [s, i] = els[0]; if (!(await tapSel(s, i))) { await tapSel('#passbtn'); continue; }
      if (await p.locator('#gobtn').count()) await tapSel('#gobtn'); else if (await p.locator('#qbox:not([hidden]) .btn.go').count()) await tapSel('#qbox .btn.go');
      await p.waitForTimeout(300);
    }
    await p.screenshot({ path: '/tmp/claude-0/over-' + W + 'x' + H + '-' + g + '.png' }); done = true; await sampler;
    const sc = await p.evaluate(() => G.p.map((x, i) => VG.score(G, i).total).concat([G.rival ? VG.rivalScore(G) : 0])); const won = sc[0] > sc[1]; if (won) wins++; rows.push(sc);
    console.log(`game ${g + 1} ${W}x${H}: you ${sc[0]} - rival ${sc[1]} ${won ? 'WIN' : 'loss'} ${Math.round((Date.now() - t0) / 1000)} s errs ${errs.length}`);
    await ctx.close();
  }
  const small = Object.entries(allMin).sort((a, b) => a[1].m - b[1].m);
  console.log('SMALLEST TAP TARGETS (min side px):'); small.slice(0, 12).forEach(([k, v]) => console.log('  ', v.m, v.w + 'x' + v.h, k));
  console.log(`MIN TAP ${small.length ? small[0][1].m : '?'} px; samples ${samples}; max helpers at once ${Math.max(0, ...hpMax)}; samples with >1 helper ${hpOver}; infinite animations seen: ${JSON.stringify(infSeen)}`);
  console.log(`SUMMARY ${W}x${H}: won ${wins}/${N}`); await b.close(); S.close();
})();
