// Asset-usage gate: how much of the art/models/music a game ships is actually requested in a played game?
//   node games-src/scripts/asset-usage.js <slug...>      |      node games-src/scripts/asset-usage.js --all
//   options: --secs 180 (play time per game)  --jobs 2 (games in parallel)  --min 90 (pass mark in %)  --no-write (skip qa/asset-usage.json)
// Per game: runs qa-bot.js's quick phase (same driver: "Just play"/quick start, UI-only bot to the result screen or the time cap) at 390x844,
// served from games/ by gx-serve.js, and logs every request under media/, models/ and music/ (hook: QA_REQ_LOG in qa-bot.js).
// Output: games-src/qa/asset-usage.json + one line per game. Exit 1 if a game is below --min % or loads 0 .glb while it ships .glb.
// --all = every games/<slug>/ with an index.html and media/models/music, except asset-viewer, look and mainhattan-*.
// qa-bot's own results go to a scratch dir (QA_DIR), so qa/<slug>.json is not touched.
const fs = require('fs'), path = require('path'), os = require('os'), { spawn } = require('child_process');
const ROOT = path.resolve(__dirname, '..', '..'), GAMES = path.join(ROOT, 'games'), OUT = path.join(ROOT, 'games-src', 'qa', 'asset-usage.json');
const args = process.argv.slice(2), opt = (n, d) => { const i = args.indexOf('--' + n); return i >= 0 ? args[i + 1] : d; };
const SECS = +opt('secs', 180), JOBS = Math.max(1, +opt('jobs', 2)), MIN = +opt('min', 90), WRITE = !args.includes('--no-write');
const SKIP = /^(asset-viewer|look|mainhattan-.*)$/, DIRS = ['media', 'models', 'music'];
const flagVals = new Set(['--secs', '--jobs', '--min']);
const slugsArg = args.filter((a, i) => !a.startsWith('--') && !flagVals.has(args[i - 1]));
if (!slugsArg.length && !args.includes('--all')) { console.log('usage: node asset-usage.js <slug...> | --all  [--secs 180] [--jobs 2] [--min 90] [--no-write]'); process.exit(2); }

function walk(dir, base, out) {
  let ents; try { ents = fs.readdirSync(dir, { withFileTypes: true }); } catch (e) { return out; }
  for (const e of ents) { const p = path.join(dir, e.name); if (e.isDirectory()) walk(p, base, out); else if (e.isFile()) out.push(path.relative(base, p).split(path.sep).join('/')); }
  return out;
}
const shipped = slug => DIRS.flatMap(d => walk(path.join(GAMES, slug, d), path.join(GAMES, slug), [])).sort();
const prefix = f => { const [d, ...r] = f.split('/'); if (r.length > 1) return d + '/' + r[0] + '/'; const m = /^([A-Za-z]+)/.exec(r[0]); return d + '/' + (m ? m[1] : r[0]) + '*'; };   // media/camp-farid.webp -> media/camp*
const group = list => { const g = {}; for (const f of list) (g[prefix(f)] = g[prefix(f)] || []).push(f); return Object.fromEntries(Object.entries(g).sort((a, b) => b[1].length - a[1].length)); };

function allSlugs() {
  return fs.readdirSync(GAMES, { withFileTypes: true }).filter(e => e.isDirectory() && !SKIP.test(e.name) && fs.existsSync(path.join(GAMES, e.name, 'index.html')) && shipped(e.name).length).map(e => e.name).sort();
}

function playOne(slug) {
  return new Promise(resolve => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'asset-usage-')), log = path.join(tmp, 'req.log'); fs.writeFileSync(log, '');
    const env = Object.assign({}, process.env, { QA_REQ_LOG: log, QA_DIR: tmp, QA_VIEW_H: '844', QA_SHOTS: path.join(tmp, 'shots') });
    const scale = (SECS / 220).toFixed(3);   // qa-bot's quick phase cap is 220 s at --scale 1
    const t0 = Date.now(), p = spawn('node', [path.join(__dirname, 'qa-bot.js'), slug, '--size', 'phone', '--phases', 'quick', '--scale', scale], { env, stdio: ['ignore', 'pipe', 'pipe'] });
    let tail = ''; p.stdout.on('data', d => { tail = (tail + d).slice(-600); }); p.stderr.on('data', d => { tail = (tail + d).slice(-600); });
    const kill = setTimeout(() => p.kill('SIGKILL'), (SECS + 150) * 1000);
    p.on('close', () => {
      clearTimeout(kill);
      const loaded = new Set(fs.readFileSync(log, 'utf8').split('\n').filter(Boolean).map(u => u.replace(/^\/[^/]+\//, '')));   // strip "/<slug>/"
      let quick = null; try { quick = JSON.parse(fs.readFileSync(path.join(tmp, slug + '.json'), 'utf8')).quick; } catch (e) { }
      fs.rmSync(tmp, { recursive: true, force: true });
      resolve({ loaded, quick, secs: Math.round((Date.now() - t0) / 1000), tail });
    });
  });
}

(async () => {
  const slugs = args.includes('--all') ? allSlugs() : slugsArg;
  const results = {}, queue = slugs.slice();
  const worker = async () => {
    for (let slug; (slug = queue.shift());) {
      const ship = shipped(slug), r = ship.length ? await playOne(slug) : { loaded: new Set(), quick: null, secs: 0 };
      const stem = f => f.replace(/-lite\.glb$/i, '.glb'), seen = new Set([...r.loaded].map(stem));   // a -lite .glb counts as its model loaded (phones load the lite file)
      const hit = ship.filter(f => r.loaded.has(f) || seen.has(stem(f))), never = ship.filter(f => !hit.includes(f));
      const glbShip = ship.filter(f => /\.glb$/i.test(f)), glbLoaded = hit.filter(f => /\.glb$/i.test(f));
      const pct = ship.length ? Math.round(1000 * hit.length / ship.length) / 10 : 100;
      const fail = ship.length > 0 && (pct < MIN || (glbShip.length > 0 && glbLoaded.length === 0));
      results[slug] = { shipped: ship.length, loaded: hit.length, pct, glbShipped: glbShip.length, glbLoaded: glbLoaded.length, anyGlb: glbLoaded.length > 0,
        playedSecs: r.secs, end: r.quick ? r.quick.result : null, clicks: r.quick ? r.quick.clicks : null, fail, neverLoaded: group(never) };
      const top = Object.entries(results[slug].neverLoaded).slice(0, 4).map(([k, v]) => `${k}(${v.length})`).join(' ');
      console.log(`${fail ? 'FAIL' : 'PASS'} ${slug.padEnd(18)} ${String(hit.length).padStart(4)}/${String(ship.length).padEnd(4)} ${String(pct).padStart(5)}%  glb ${glbLoaded.length}/${glbShip.length}  end ${results[slug].end}  ${r.secs}s${top ? '  never: ' + top : ''}`);
    }
  };
  await Promise.all(Array.from({ length: Math.min(JOBS, slugs.length) }, worker));
  const sorted = Object.fromEntries(Object.entries(results).sort());
  if (WRITE) {
    let prev = {}; try { prev = JSON.parse(fs.readFileSync(OUT, 'utf8')).games || {}; } catch (e) { }   // a partial run keeps the other games' last result
    fs.mkdirSync(path.dirname(OUT), { recursive: true });
    fs.writeFileSync(OUT, JSON.stringify({ when: new Date().toISOString().slice(0, 16) + 'Z', view: '390x844', secs: SECS, min: MIN, games: Object.assign(prev, sorted) }, null, 1) + '\n');
  }
  const bad = Object.keys(sorted).filter(s => sorted[s].fail);
  console.log(bad.length ? `asset-usage: ${bad.length} below the gate: ${bad.join(', ')}` : 'asset-usage: all games pass');
  process.exit(bad.length ? 1 : 0);
})();
