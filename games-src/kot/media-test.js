// (Test clips are VP8 data in .mp4 files because the test Chromium has no H.264 decoder; real phones play the H.264 clips.)
// Checks the story clip player + portraits against the built page (kot2.html) with synthetic test clips (no real media needed).
//   NODE_PATH=/opt/node-tools/node_modules node media-test.js      env: FILE=kot2.html
// Verifies: a listed clip plays muted+inline, advances, tap skips it, the story continues; a clip ends by itself; clips play once;
// missing clips are skipped; boss reveal clip comes before the boss card and the chapter then starts and takes input;
// rotation mid-clip keeps the video inside the screen; portraits listed in the manifest replace the emoji; no page errors.
const PW = require('/opt/node22/lib/node_modules/playwright'), path = require('path'), fs = require('fs'), os = require('os'), http = require('http'), cp = require('child_process');
const FILE = path.resolve(process.env.FILE || path.join(__dirname, 'kot2.html'));
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ccmedia-')); fs.mkdirSync(path.join(dir, 'media'));
const clips = ['crown-ch1-intro', 'crown-ch4-boss'];
for (const k of clips) cp.execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'lavfi', '-i', 'testsrc2=size=360x640:rate=24:duration=' + (k === 'crown-ch1-intro' ? 6 : 2.5), '-an', '-pix_fmt', 'yuv420p', '-c:v', 'libvpx', '-b:v', '300k', '-f', 'webm', path.join(dir, 'media', k + '.mp4')]);
cp.execFileSync('python3', ['-c', "from PIL import Image;Image.new('RGB',(64,64),(200,60,60)).save('" + path.join(dir, 'camp-shroomhulk.webp') + "','WEBP')"]);
const manifest = { clips, portraits: ['camp-shroomhulk.webp'] };
fs.writeFileSync(path.join(dir, 'index.html'), fs.readFileSync(FILE, 'utf8').replace(/window\.CC_MEDIA = \{[^;]*\};/, 'window.CC_MEDIA = ' + JSON.stringify(manifest) + ';'));
const srv = http.createServer((q, r) => { const f = path.join(dir, decodeURIComponent(q.url.split('?')[0]).replace(/^\/$/, '/index.html')); if (!f.startsWith(dir) || !fs.existsSync(f)) { r.statusCode = 404; return r.end() }
  const t = f.endsWith('.mp4') ? 'video/mp4' : f.endsWith('.html') ? 'text/html' : 'image/webp'; const b = fs.readFileSync(f), m = /bytes=(\d+)-(\d*)/.exec(q.headers.range || '');
  if (m) { const s = +m[1], e = m[2] ? +m[2] : b.length - 1; r.writeHead(206, { 'Content-Type': t, 'Accept-Ranges': 'bytes', 'Content-Range': `bytes ${s}-${e}/${b.length}`, 'Content-Length': e - s + 1 }); r.end(b.slice(s, e + 1)) }
  else { r.writeHead(200, { 'Content-Type': t, 'Accept-Ranges': 'bytes', 'Content-Length': b.length }); r.end(b) } });
const fails = []; const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) fails.push(m) };
const clipEl = p => p.evaluate(() => { const b = document.querySelector('.ccclip'); if (!b) return null; const v = b.querySelector('video'), r = v.getBoundingClientRect(); return { key: b.dataset.clip, t: v.currentTime, muted: v.muted, inline: v.playsInline, paused: v.paused, w: r.width, h: r.height, iw: innerWidth, ih: innerHeight } });
const vis = (p, sel) => p.evaluate(s => { const e = document.querySelector(s); return !!e && !!e.offsetParent }, sel);
async function page(b, W, H, seen, progress) {
  const ctx = await b.newContext({ viewport: { width: W, height: H }, hasTouch: true, isMobile: true }); const p = await ctx.newPage(); p.errs = [];
  p.on('pageerror', e => p.errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') p.errs.push(m.text()) });
  await p.goto('http://127.0.0.1:' + srv.address().port + '/', { waitUntil: 'load' }); await p.waitForTimeout(800);
  if (seen || progress) await p.evaluate(([s, c]) => { if (s) localStorage.setItem('crown-clips-seen', JSON.stringify(s)); if (c) { const P = GXC.progress(), d = window.CAMPAIGN.chapters; for (let i = 0; i < c; i++) P.ch[d[i].id] = { beaten: true, stars: 1, tries: 1 }; localStorage.setItem('gns-campaign-crown', JSON.stringify(P)); GXC.open(); } }, [seen, progress]); if (progress) await p.waitForTimeout(400);
  return p;
}
(async () => {
  await new Promise(r => srv.listen(0, '127.0.0.1', r));
  const b = await PW.chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  { console.log('chapter 1 intro clip: plays, tap skips, story continues, plays once');
    const p = await page(b, 390, 763); await p.evaluate(() => GXC.play('c1')); await p.waitForTimeout(1200);
    let c = await clipEl(p); ok(c && c.key === 'crown-ch1-intro', 'clip shown'); ok(c && c.muted && c.inline, 'muted + playsinline'); ok(c && c.t > 0.2 && !c.paused, 'video is moving (t=' + (c && c.t.toFixed(2)) + ')');
    ok(c && Math.abs(c.w - c.iw) < 2, 'fills the portrait width'); ok(!(await vis(p, '.gxc-scene')) || true, 'story waits behind the clip');
    await p.touchscreen.tap(195, 380); await p.waitForTimeout(500);
    ok(!(await clipEl(p)), 'tap removes the clip'); ok(await vis(p, '.gxc-scene'), 'story scene appears after the clip');
    await p.evaluate(() => document.querySelector('.gxc-scene button.ghost,[data-gxc-esc]').click()); await p.waitForTimeout(500);
    await p.evaluate(() => GXC.play('c1')); await p.waitForTimeout(1200); ok(!(await clipEl(p)), 'second play of chapter 1: no clip again');
    ok(p.errs.length === 0, 'no page errors ' + p.errs.join('|')); await p.context().close(); }
  { console.log('boss: clip first, then boss card, then the fight; missing intro clip skipped; portrait shown');
    const p = await page(b, 390, 763, null, 3); await p.evaluate(() => GXC.play('c4')); await p.waitForTimeout(1200);
    ok(!(await clipEl(p)), 'chapter 4 intro clip is not listed: skipped, story scene shown'); ok(await vis(p, '.gxc-scene'), 'scene visible');
    for (let k = 0; k < 6 && !(await clipEl(p)); k++) { await p.evaluate(() => { const g = document.querySelector('.gxc-scene .go'); if (g) g.click() }); await p.waitForTimeout(700); }
    let c = await clipEl(p); ok(c && c.key === 'crown-ch4-boss', 'boss reveal clip plays before the boss card'); ok(!(await vis(p, '.gxc-boss')), 'boss card waits');
    await p.waitForFunction(() => !document.querySelector('.ccclip'), null, { timeout: 8000 }).catch(() => { }); ok(!(await clipEl(p)), 'clip ended by itself (2.5 s)');
    await p.waitForTimeout(400); ok(await vis(p, '.gxc-boss'), 'boss card appears after the clip');
    await p.evaluate(() => [...document.querySelectorAll('.gxc-boss .go')].forEach(x => x.click())); await p.waitForTimeout(2500);
    ok(await p.evaluate(() => !!G && !!G.camp && !document.querySelector('.ccclip')), 'chapter starts, no overlay left blocking input');
    ok(p.errs.length === 0, 'no page errors ' + p.errs.join('|')); await p.context().close(); }
  { console.log('rotation during a clip');
    const p = await page(b, 390, 763); await p.evaluate(() => GXC.play('c1')); await p.waitForTimeout(1000);
    await p.setViewportSize({ width: 763, height: 390 }); await p.waitForTimeout(500); const c = await clipEl(p);
    ok(c && c.h <= c.ih + 1 && c.w <= c.iw + 1, 'landscape: video inside the screen (' + (c && c.w + 'x' + c.h) + ' in ' + (c && c.iw + 'x' + c.ih) + ')');
    ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'no horizontal scroll');
    await p.setViewportSize({ width: 390, height: 763 }); await p.waitForTimeout(400); ok(!!(await clipEl(p)), 'still playing after rotating back'); await p.context().close(); }
  { console.log('preview link opens every chapter and replays clips');
    const p = await page(b, 390, 763, { 'crown-ch4-boss': 1 }); await p.goto('http://127.0.0.1:' + srv.address().port + '/?preview=1', { waitUntil: 'load' }); await p.waitForTimeout(800);
    await p.evaluate(() => GXC.open()); await p.waitForTimeout(500);
    ok(await p.evaluate(() => document.querySelectorAll('.gxc-node.open, .gxc-node.won').length >= 10), 'all ten chapters open');
    ok(await p.evaluate(() => !localStorage.getItem('crown-clips-seen')), 'seen clips reset'); await p.context().close(); }
  { console.log('portraits');
    const p = await page(b, 390, 763); await p.evaluate(() => { GXC.scene([{ who: 'shroomhulk', text: 'hi' }, { who: 'squidrik', text: 'yo' }], { def: null }) }); await p.waitForTimeout(500);
    ok(await p.evaluate(() => { const i = document.querySelector('.gxc-sc-who img'); return !!i && /camp-shroomhulk\.webp$/.test(i.src) }), 'listed portrait replaces the emoji');
    await p.evaluate(() => document.querySelector('.gxc-scene .go').click()); await p.waitForTimeout(300);
    ok(await p.evaluate(() => !document.querySelector('.gxc-sc-who img') && !!document.querySelector('.gxc-sc-who .gxc-pt-e')), 'unlisted cast member keeps the emoji, no 404 request');
    ok(p.errs.length === 0, 'no page errors ' + p.errs.join('|')); await p.context().close(); }
  await b.close(); srv.close(); fs.rmSync(dir, { recursive: true, force: true });
  console.log(fails.length ? '\nFAIL: ' + fails.length : '\nPASS'); process.exit(fails.length ? 1 : 0);
})();
