// W242: time from tap to a moving ship / moving Kai, and bytes fetched before that first playable frame (phone 4x CPU, or PC), fast-4G network, second visit for ON FOOT.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/benchmark/playability-start.js <baseUrl> <phone|pc> <flight|foot>
const { chromium } = require('playwright');
const BASE = process.argv[2] || 'http://127.0.0.1:8765/', PROFILE = process.argv[3] || 'phone', MODE = process.argv[4] || 'flight';
const NET = { offline: false, latency: 165, downloadThroughput: 9 * 1e6 / 8, uploadThroughput: 1.5 * 1e6 / 8 };   // DevTools "fast 4G"
(async () => {
  const b = await chromium.launch(); const ph = PROFILE === 'phone';
  const ctx = await b.newContext(ph ? { viewport: { width: 390, height: 763 }, deviceScaleFactor: 3, hasTouch: true, isMobile: true } : { viewport: { width: 1440, height: 860 }, deviceScaleFactor: 1 });
  const p = await ctx.newPage(); const cdp = await ctx.newCDPSession(p);
  await cdp.send('Network.enable'); await cdp.send('Network.emulateNetworkConditions', NET);
  if (ph) await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  let bytes = 0, mp3 = 0; const sizes = {}; cdp.on('Network.dataReceived', e => { bytes += e.dataLength; sizes[e.requestId] = (sizes[e.requestId] || 0) + e.dataLength; });
  const urls = {}; cdp.on('Network.requestWillBeSent', e => { urls[e.requestId] = e.request.url; });
  const mp3bytes = () => Object.keys(sizes).filter(k => /\.mp3/.test(urls[k] || '')).reduce((a, k) => a + sizes[k], 0);
  const errs = []; p.on('pageerror', e => errs.push(String(e.message).slice(0, 120)));
  const sel = MODE === 'flight' ? '#focFlight' : '#focFoot';
  const visit = async (label) => {
    bytes = 0; for (const k in sizes) delete sizes[k];
    const t = Date.now(); await p.goto(BASE + 'index.html', { waitUntil: 'domcontentloaded', timeout: 120000 });
    await p.waitForFunction(s => { const e = document.querySelector(s); return e && e.getBoundingClientRect().width > 0; }, sel, { timeout: 120000 }); const btn = Date.now() - t;
    await new Promise(r => setTimeout(r, 1500)); const pre = bytes;
    const b0 = bytes, t2 = Date.now(); let cards = 0, mv = null, runAt = null, runBytes = 0; await p.evaluate(f => { window.MODE_FLIGHT = f; }, MODE === 'flight');
    await (ph ? p.tap(sel) : p.click(sel));
    const probe = MODE === 'flight' ? () => { const m = window.__mnr; if (!m || !m.running || !m.G) return false; window.__x0 = window.__x0 === undefined ? m.G.t : window.__x0; return m.G.t - window.__x0 > 0.3; } : () => { const F = window.FOOT; if (!F || !F.on || !F.S) return false; const P = F.S.P; window.__x0 = window.__x0 === undefined ? P.x : window.__x0; return Math.abs(P.x - window.__x0) > 4; };
    await p.evaluate(() => { window.__x0 = undefined; });
    for (let i = 0; i < 400; i++) {
      const c = await p.evaluate(() => { const c = document.getElementById('taleCard'); if (c && !c.hidden) { c.querySelector('.tc').click(); return 1; } return 0; }); cards += c;
      if (MODE === 'foot') await p.keyboard.down('ArrowRight').catch(() => { });
      if (process.env.DBG && MODE === 'foot' && i % 10 === 0) console.log(label, i * 50, await p.evaluate(() => { const Q = FOOT.q; try { return 'pics:' + Q.picsReady() + ' kaiwait:' + Q.kai().filter(k => Q.state(k) === 'wait').length + ' pend:' + __mnr.ART.pend + ' hold:' + !!document.getElementById('footQ') + ' ' + (document.getElementById('footQ') || {}).textContent; } catch (e) { return String(e); } })); if (i === 40 && !process.env.DBG) console.log('needs@2s', await p.evaluate(() => { try { const id = __mnr.ART && 'std'; return 'pend=' + __mnr.ART.pend + ' nulls=' + Object.keys(__mnr.ART.bm).filter(k => __mnr.ART.bm[k] === null).join(',').slice(0, 300) + ' stale=' + __mnr.ART.stale + ' veil=' + !!document.getElementById('stageQ') + ' ' + [...document.querySelectorAll('img')].length; } catch (e) { return String(e); } })); if (runAt === null && await p.evaluate(() => MODE_FLIGHT ? !!(window.__mnr && __mnr.running) : !!(window.FOOT && FOOT.on && FOOT.S && !document.getElementById('footQ')))) { runAt = Date.now() - t2; runBytes = bytes; }
      if (await p.evaluate(probe)) { mv = Date.now() - t2; break; } await new Promise(r => setTimeout(r, 50)); }
    if (process.env.TOP) console.log(Object.keys(sizes).map(k => [(urls[k] || '').split('/').slice(-2).join('/'), sizes[k]]).sort((a, b) => b[1] - a[1]).slice(0, 12).map(x => x[0] + ' ' + (x[1] / 1e6).toFixed(2)).join(' | '));
    console.log(JSON.stringify({ label, mode: MODE, profile: PROFILE, flightBtnMs: btn, bytesBeforeBtn: +(pre / 1e6).toFixed(1), tapToRunningMs: runAt, MBatRunning: +(runBytes / 1e6).toFixed(1), tapToMovingMs: mv, cardsSkipped: cards, MBbeforeFirstPlayable: +((bytes - b0 + pre) / 1e6).toFixed(1), mp3MB: +(mp3bytes() / 1e6).toFixed(1), errs, pl: await p.evaluate(() => JSON.stringify(window.PRELOAD && PRELOAD.last)), mpA: await p.evaluate(() => JSON.stringify(Object.keys(__mnr.TR.bufs)))  }));
  };
  await visit('first'); await visit('second'); await b.close();
})();
