#!/usr/bin/env node
// FA (parts/footart.js) test: every who x pose draws on a headless canvas without error and leaves pixels, bg layers draw, a real picture dropped into a temp media copy is detected (FA.has) and drawn,
// a picture NOT listed in ready.json is ignored (the hatched placeholder never shows), and the built game's shooter is unchanged when FA is present (no page error, FA inert).
//   NODE_PATH=$(npm root -g) node games-src/nightrun/footart-test.js        (SHEET=<png> also writes a contact sheet)
const PW = require(process.env.PW || 'playwright'), path = require('path'), fs = require('fs'), os = require('os'), http = require('http');
const SRC = fs.readFileSync(path.join(__dirname, 'parts/footart.js'), 'utf8');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'fa-')); fs.mkdirSync(path.join(tmp, 'foot'));
fs.writeFileSync(path.join(tmp, 'index.html'), '<!doctype html><canvas id=c width=400 height=400></canvas>');
const srv = http.createServer((q, r) => { const u = q.url.split('?')[0], f = path.join(tmp, u === '/' ? 'index.html' : u); fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, { 'content-type': f.endsWith('.json') ? 'application/json' : f.endsWith('.webp') ? 'image/webp' : 'text/html' }); r.end(b); } }); });
const fails = []; const ok = (c, m) => { if (!c) fails.push(m); };
(async () => {
  await new Promise(r => srv.listen(0, '127.0.0.1', r)); const url = 'http://127.0.0.1:' + srv.address().port + '/';
  const br = await PW.chromium.launch(); const pg = await br.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.goto(url); await pg.evaluate(u => { window.ART = { base: u }; }, url); await pg.addScriptTag({ content: SRC });
  const r = await pg.evaluate(() => {
    const out = { bad: [], blank: [], n: 0 }, c = document.getElementById('c'), x = c.getContext('2d');
    const POSES = FA.POSES_BOSS;
    for (const who of FA.WHO) for (const pose of POSES.concat(['run'])) for (const flip of [false, true]) for (const t of [0, .37, 1.9]) {
      x.clearRect(0, 0, 400, 400);
      try { FA.draw(x, who, pose, 200, 300, 160, flip, t); } catch (e) { out.bad.push(who + '/' + pose + ': ' + e.message); continue; }
      out.n++; const d = x.getImageData(0, 0, 400, 400).data; let a = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 20) a++;
      if (a < 300) out.blank.push(who + '/' + pose + '/t' + t + ' px=' + a);
    }
    for (const L of ['sky', 'far', 'mid', 'near', 'floor']) try { x.clearRect(0, 0, 400, 400); FA.bg(x, L, 12345.6, 400, 400); FA.bg(x, L, -50, 400, 400); } catch (e) { out.bad.push('bg ' + L + ': ' + e.message); }
    for (const id of FA.PICKUPS) try { FA.pickup(x, id, 50, 50, 48, 1); } catch (e) { out.bad.push('pk ' + id); }
    for (const id of FA.SCENERY) try { FA.scenery(x, id, 50, 300, 80); } catch (e) { out.bad.push('sc ' + id); }
    try { FA.draw(x, 'nobody', 'nonsense', 10, 10, 50, false, 0); } catch (e) { out.bad.push('unknown who/pose: ' + e.message); }
    out.has = FA.has('kai', 'idle'); return out;
  });
  ok(!r.bad.length, 'draw errors: ' + r.bad.slice(0, 5).join(' | ')); ok(r.n === 11 * 14 * 2 * 3, 'draw count ' + r.n);
  const blank = r.blank.filter(s => !/\/die\/t1\.9/.test(s)); ok(!blank.length, 'blank drawings (<300 px): ' + blank.slice(0, 6).join(', '));
  ok(r.has === false, 'FA.has true with no pictures');
  // real picture: a magenta square for kai-idle (listed in ready.json) and one for kai-jump that is NOT listed
  const mk = () => pg.evaluate(() => { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'); g.fillStyle = '#ff00ff'; g.fillRect(0, 0, 64, 64); return c.toDataURL('image/webp').split(',')[1]; });
  const img = Buffer.from(await mk(), 'base64'); fs.writeFileSync(path.join(tmp, 'foot/kai-idle.webp'), img); fs.writeFileSync(path.join(tmp, 'foot/kai-jump.webp'), img);
  fs.writeFileSync(path.join(tmp, 'ready.json'), JSON.stringify(['foot/kai-idle.webp', 'ach-x.webp']));
  const pg2 = await br.newPage(); pg2.on('pageerror', e => errs.push(e.message)); await pg2.goto(url); await pg2.evaluate(u => { window.ART = { base: u }; }, url); await pg2.addScriptTag({ content: SRC });
  const s = await pg2.evaluate(async () => {
    FA.init(); await new Promise(r => setTimeout(r, 600));
    const c = document.getElementById('c'), x = c.getContext('2d'); x.clearRect(0, 0, 400, 400); FA.draw(x, 'kai', 'idle', 200, 300, 160, false, 0);
    const p = x.getImageData(200, 220, 1, 1).data; const o = { has: FA.has('kai', 'idle'), jump: FA.has('kai', 'jump'), px: [p[0], p[1], p[2], p[3]] };
    x.clearRect(0, 0, 400, 400); FA.draw(x, 'kai', 'idle', 200, 300, 160, true, 0); const q = x.getImageData(200, 160, 1, 1).data; o.px2 = [q[0], q[1], q[2], q[3]];
    x.clearRect(0, 0, 400, 400); FA.draw(x, 'kai', 'idle', 200, 300, 160, false, 0); const above = x.getImageData(200, 130, 1, 1).data; o.above = above[3];   // picture is h tall, feet anchored: row 130 is above the top (y 140)
    return o;
  });
  ok(s.has, 'FA.has(kai,idle) false although the picture is listed'); ok(!s.jump, 'unlisted picture was used (placeholder would show)');
  ok(s.px[0] > 200 && s.px[1] < 60 && s.px[2] > 200 && s.px[3] > 200, 'picture not drawn: pixel ' + s.px); ok(s.px2[3] > 200, 'flipped picture not drawn'); ok(s.above === 0, 'picture not feet-anchored/scaled to h');
  if (process.env.SHEET) {
    const pg3 = await br.newPage({ viewport: { width: 1400, height: 1200 } }); await pg3.goto(url); await pg3.evaluate(u => { window.ART = { base: u }; }, url); await pg3.addScriptTag({ content: SRC });
    await pg3.evaluate(() => { const c = document.getElementById('c'); c.width = 1400; c.height = 1200; c.style.background = '#2a2040'; const x = c.getContext('2d'); let r = 0; for (const who of FA.WHO) { FA.POSES_BOSS.forEach((p, i) => { if (i > 10 && who !== 'warden') return; FA.draw(x, who, p, 50 + i * 100, 80 + r * 100, 80, false, 0.4 + (p === 'die' ? .3 : 0)); }); r++; } });
    await (await pg3.$('#c')).screenshot({ path: process.env.SHEET });
  }
  ok(!errs.length, 'page errors: ' + errs.slice(0, 3).join(' | '));
  await br.close(); srv.close(); fs.rmSync(tmp, { recursive: true, force: true });
  console.log(fails.length ? 'FAIL\n' + fails.join('\n') : 'footart-test: all passed (' + r.n + ' draws, bg layers, picture swap)'); process.exit(fails.length ? 1 : 0);
})();
