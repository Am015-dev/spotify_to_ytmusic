// Browser API test: pick round trip, player counts 2..5 (with 2-stand seats), resize to portrait, dispose.
const PW = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
const fs = require('fs'), path = require('path'); const HERE = __dirname, OUT = path.resolve(process.argv[2] || 'shots/api'); fs.mkdirSync(OUT, { recursive: true });
const html = fs.readFileSync(path.join(HERE, 'demo.html')), fcss = fs.readFileSync(path.join(HERE, 'fontcache', 'fonts.css'));
(async () => {
  const br = await PW.chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const ctx = await br.newContext({ viewport: { width: 1366, height: 768 } });
  await ctx.route('**/*', r => { const u = new URL(r.request().url()); if (u.host === 'gns.test') return r.fulfill({ status: 200, contentType: 'text/html', body: html }); if (u.host === 'fonts.googleapis.com') return r.fulfill({ status: 200, contentType: 'text/css', body: fcss }); if (u.host === 'fonts.gstatic.com') { const f = path.join(HERE, 'fontcache', path.basename(u.pathname)); if (fs.existsSync(f)) return r.fulfill({ status: 200, contentType: 'font/woff2', body: fs.readFileSync(f) }); } return r.abort(); });
  const pg = await ctx.newPage(); pg.setDefaultTimeout(150000); const errs = []; pg.on('pageerror', e => errs.push(String(e)));
  await pg.goto('https://gns.test/?static&noqbar&gfx=medium'); await pg.waitForFunction(() => window.DEMO_READY === true); await pg.waitForTimeout(1000);
  let fails = 0; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) fails++; };
  // pick round trip on 5 tiles of different seats
  const res = await pg.evaluate(() => { const out = []; const ids = ['w0', 'w5', 'w14', 'w30', 'w44']; const rc = document.getElementById('c3').getBoundingClientRect(); for (const id of ids) { const s = SFKit.screenOf(id); const p = SFKit.pick(rc.left + s.x, rc.top + s.y); out.push([id, p && p.kind, p && p.id]); } return out; });
  res.forEach(r => ok(r[1] === 'tile' && r[2] === r[0], 'pick tile ' + r[0] + ' -> ' + r[2]));
  const pd = await pg.evaluate(() => { const K = SFKit._K, s = SFKit.screenOf('dial'); const p = SFKit.pick(s.x, s.y + 40); return p && p.kind; }); ok(pd === 'dial', 'pick dial -> ' + pd);
  const pe = await pg.evaluate(() => { const K = SFKit._K; const o = Object.values(K.eqCards)[0]; const v = o.getWorldPosition(new THREE.Vector3()); const s = SFKit.screenOf(v); const p = SFKit.pick(s.x, s.y); return p && p.kind + ':' + p.id; }); ok(/^equipment:/.test(pe), 'pick equipment -> ' + pe);
  await pg.evaluate(() => SFKit.highlight([{ kind: 'equipment', id: 'eq2' }, { kind: 'track', value: 4 }, { kind: 'stand', seat: 3 }, { kind: 'character', seat: 0 }, 'w20']));
  await pg.waitForTimeout(2500); await pg.screenshot({ path: path.join(OUT, 'hl-mixed.png') });
  // player counts
  for (const n of [5, 3, 2]) {
    await pg.evaluate(n => {
      SFKit.setSpeed(1000); const total = 48 + 2 + 2; const stands = n === 2 ? [[0, 0], [0, 1], [1, 0], [1, 1]] : n === 3 ? [[0, 0], [0, 1], [1, 0], [2, 0]] : Array.from({ length: n }, (_, s) => [s, 0]);
      for (const k in SFKit._K.st.stands) SFKit.setStand(+k.split(':')[0], +k.split(':')[1], []);
      SFKit._K.st.stands = {}; SFKit.setPlayers(n, 0, { names: ['You', 'Ash', 'Bo', 'Cy', 'Di'], captain: 0 });
      const per = Math.floor(total / stands.length); let id = 0;
      stands.forEach(([s, st], j) => { const t = []; for (let i = 0; i < per + (j < total % stands.length ? 1 : 0); i++) { const v = 1 + Math.floor(i * 12 / per); t.push({ id: 'n' + n + '-' + (id++), known: s === 0, color: 'blue', value: v, cut: i % 5 === 2, infoToken: i % 7 === 4 ? v : null }); } SFKit.setStand(s, st, t); });
      SFKit.setCharacters(Array.from({ length: n }, (_, s) => ({ seat: s, name: ['Tally', 'Wren', 'Pike', 'Moss', 'Echo'][s], item: 'double_probe', captain: s === 0 })));
      SFKit.highlight([]); SFKit.setSpeed(1);
    }, n);
    await pg.waitForTimeout(3500); await pg.screenshot({ path: path.join(OUT, 'players-' + n + '.png') });
    const st = await pg.evaluate(() => ({ rows: SFKit._K.rows.length, tiles: Object.values(SFKit._K.recs).filter(r => r.key !== '__gone').length, mode: SFKit._K.layout.mode }));
    ok(st.tiles === 52, n + ' players: ' + JSON.stringify(st));
  }
  await pg.setViewportSize({ width: 390, height: 844 }); await pg.evaluate(() => SFKit.resize(390, 844)); await pg.waitForTimeout(3500); await pg.screenshot({ path: path.join(OUT, 'players-2-phone.png') });
  ok(await pg.evaluate(() => SFKit._K.layout.mode) === 'column', 'portrait switches to column layout');
  await pg.evaluate(() => SFKit.dispose()); ok(await pg.evaluate(() => SFKit._K.on === false), 'dispose');
  ok(errs.length === 0, 'no page errors ' + errs.join(' | '));
  console.log(fails ? fails + ' FAILED' : 'ALL PASSED'); await br.close(); process.exit(fails ? 1 : 0);
})();
