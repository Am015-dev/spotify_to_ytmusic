#!/usr/bin/env node
// SHIPART PROBE (W207): which sheet does every enemy kind draw, does the volley clip play on each shot, does the death clip play on each kill.
// Stepped at sim speed (no waits); prints PASS/FAIL lines only.   NODE_PATH=$(npm root -g) node games-src/nightrun/qa/shipart-probe.js
//   env: GAME_DIR=<dir with index.html>  STAGES=1-45 (default 1-45)  SEEDS=1  PAR=4  BUDGET=420 (s)  URLX=&shipart=0  V=1 (per-kind table)
//  (a) isolated: one unit of every spawnable id is drawn alone; the sheet key it draws must be its own (kind -> ship-e<kind>, listed owner exceptions)
//  (b) live: human-model bot on each stage; per kind: units drawn from the right sheet / a fallback shape / another kind's sheet,
//      shots with the volley clip on screen right after the shot, kills with the death clip pushed.
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process'), fs = require('fs');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../../games/mainhattan-nightrun');
const PAR = +process.env.PAR || 4, SEEDS = +process.env.SEEDS || 1, BUDGET = +process.env.BUDGET || 420, V = !!process.env.V;
const [S0, S1] = (process.env.STAGES || '1-45').split('-').map(Number);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const hb = fs.readFileSync(path.resolve(__dirname, '../humanbot.js'), 'utf8'), a0 = hb.indexOf('const BOT = (o) => {'), a1 = hb.indexOf('\n};\n(async', a0);
if (a0 < 0 || a1 < 0) { console.log('FAIL shipart: humanbot.js BOT not found'); process.exit(2); }
const BOTSRC = hb.slice(a0 + 'const BOT = '.length, a1 + 3);

/* in the page: hooks (draw key per unit) + the per-run recorder */
const HOOK = () => {
  if (window.__hk) return; window.__hk = 1; window.ART = __mnr.ART; const SPR = __mnr.SPR; let last = null;
  const dA = ART.drawAnim; ART.drawAnim = function (c, key) { last = key; return dA.apply(this, arguments); };
  const fb = FOEART.body; FOEART.body = function (e) { last = null; const r = fb.apply(this, arguments); e.__dk = r ? last : null; return r; };
  const fp = FOEART.post; FOEART.post = function (e) { last = null; const r = fp.apply(this, arguments); if (r) e.__dk = last; return r; };
  const sf = SPR.foe; SPR.foe = function (e) { last = null; const r = sf.apply(this, arguments); if (r) e.__dk = last; return r; };
  const EXC = { bomber: 'ezbomber', zdrn: 'ezdrone', efdrone: 'ecdrone', carrier: 'ecarrier' };
  window.__exp = e => { const id = FOEART.id(e); if (id.startsWith('fk-')) return 'e' + id.slice(3); if (EXC[id]) return EXC[id]; return id.startsWith('e') && ['einterceptor', 'ebomber', 'ecarrier', 'ecruiser'].includes(id) ? id : 'e' + id; };
  window.__base = k => k ? k.replace(/^ship-/, '').replace(/~[^/]*/, '').replace(/\/.*$/, '') : null;
};
const SETUP = (o) => {
  let sd = o.seed * 2654435761 % 4294967296 || 7; Math.random = () => { sd = (sd + 0x6D2B79F5) >>> 0; let t = sd; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const K = {}, kd = id => K[id] || (K[id] = { spawned: 0, seen: 0, own: 0, other: 0, none: 0, otherKeys: {}, shots: 0, vol: 0, kills: 0, death: 0, undrawn: 0 });
  const seen = new Set(), shotsN = { i: 0 }; const mkW = () => new Proxy({ shots: [] }, { get: (t, k) => k in t ? t[k] : (t[k] = []) }); NR.watch = mkW();
  NR.on('kill', ({ e, boss }) => { if (boss || !e) return; const d = kd(FOEART.id(e)); d.kills++; if (e._fs == null) { d.undrawn++; return; }
    const g = ART.gh[ART.gh.length - 1], want = 'ship-' + (window.__base(e.__dk) || window.__exp(e)) + '/death'; if (g && g.key === want && Math.abs(g.x - e.x) < 1 && Math.abs(g.y - e.y) < 1) d.death++; else if (!d.dx) d.dx = `want ${want} got ${g && g.key} gh${ART.gh.length}`; });
  window.__rec = (m, i) => {
    const G = m.G; if (G.dead) return;
    for (let q = ART.gh.length - 1; q >= 0; q--) { const g = ART.gh[q], o = ART.aS(g.key); g.t += 1 / 60; if (!o || g.t > o.tot + .2) ART.gh.splice(q, 1); }   // the ghosts clock (render does it in play; stepping at sim speed renders rarely) if (!NR.watch) NR.watch = mkW();
    for (const e of G.en) { if (e.type === 'boss' || seen.has(e)) continue; seen.add(e); kd(FOEART.id(e)).spawned++; }
    const sh = NR.watch.shots; let fired = null;
    if (sh.length) { for (const s of sh) if (s.by && s.by.type && s.by.type !== 'boss' && G.en.includes(s.by) && s.by.x > 0 && s.by.x < 960 && s.by.y > 0 && s.by.y < 540) fired = fired || s.by; sh.length = 0; }
    if (fired) { try { m.render(G.t, 1 / 60); } catch (_) { } const d = kd(FOEART.id(fired)); d.shots++; if (fired.__dk && /\/volley$/.test(fired.__dk)) d.vol++; }
    if (i % 4 === 0) { try { m.render(G.t, 1 / 60); } catch (_) { }
      for (const e of G.en) { if (e.type === 'boss' || e.dead || e.hp <= 0 || e.x < 0 || e.x > 960 || e.y < -10 || e.y > 550) continue; const d = kd(FOEART.id(e)); d.seen++;
        const b = e.carC && e._fa === FOEART.fr ? 'ecarrier' : window.__base(e.__dk); if (!b || e._fa !== FOEART.fr) { d.none++; if (!d.ex) d.ex = `x${Math.round(e.x)} y${Math.round(e.y)} zst${e.zst} dk${e.__dk} fa${e._fa} fr${FOEART.fr} st${e.st} r${e.r} vz${e.vz}`; } else if (b === window.__exp(e)) d.own++; else { d.other++; d.otherKeys[b] = 1; } } }
  };
  window.__recOut = () => K;
};
const RUNFN = `(async (o) => { (${SETUP.toString()})(o); const BOT = ${BOTSRC};
  let r; try { r = BOT(o); } catch (e) { r = { err: String(e.message).slice(0, 200) }; }
  const K = window.__recOut(); window.__rec = null; try { window.__mnr.abort(); } catch (x) { } return { K, err: r && r.err, t: r && r.t, clear: r && r.clear, dead: r && r.dead }; })`;

(async () => {
  const t0 = Date.now(), port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME_DIR], { stdio: 'ignore' });
  for (let i = 0; i < 60; i++) { try { if ((await fetch(`http://127.0.0.1:${port}/index.html`)).ok) break; } catch (e) { } await sleep(100); }
  const br = await PW.chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const open = async () => {
    const c = await br.newContext({ viewport: { width: 390, height: 763 }, deviceScaleFactor: 1, hasTouch: true, isMobile: true }), p = await c.newPage(); p.errs = [];
    p.on('pageerror', e => p.errs.push(String(e.message).slice(0, 160)));
    await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    await p.addInitScript(() => { try { localStorage.setItem('mnr_tipdone', 'true'); localStorage.setItem('mnr_fscard', '99'); } catch (e) { } });
    await p.goto(`http://127.0.0.1:${port}/index.html?sim=1&all=1&nomusic=1${process.env.URLX || ''}`, { waitUntil: 'domcontentloaded' });
    await p.waitForFunction(() => window.__mnr && window.__mnr.TR.list.length > 0, null, { timeout: 20000 }).catch(() => { }); await sleep(600);
    await p.evaluate(HOOK);
    await p.evaluate(async () => { for (let w = 0; w < 400; w++) { const ks = Object.keys(ART.ANIM.s).filter(k => /^ship-e[a-z]+\/(flame|death|volley)$/.test(k)); if (ks.map(k => ART.anim(k)).every(Boolean)) break; await new Promise(r => setTimeout(r, 25)); } });
    return p;
  };
  const fails = []; const ok = (n, c, i) => { if (!c) { fails.push(n); console.log('FAIL ' + n + (i ? ' :: ' + i : '')); } else console.log('PASS ' + n); };
  /* (a) isolated draw of every spawnable id */
  const p0 = await open(), NST = await p0.evaluate(() => window.__mnr.STAGES.length);
  const iso = await p0.evaluate(async () => {
    const m = window.__mnr, G = m.G, en = VAR.X.en, out = {}; if (m.running) m.abort(); m.SET.diff = 'normal'; m.SET.auto = false; m.startStory(1); m.simOn(true);
    for (let w = 0; w < 400; w++) { m.step(1 / 60); m.render(G.t, 1 / 60); await new Promise(r => setTimeout(r, 25)); if (Object.keys(ART.ANIM.s).filter(k => /^ship-e[a-z]+\/(flame|death|volley)$/.test(k)).map(k => ART.anim(k)).every(Boolean)) break; }
    for (const id of FOEART.ids()) {
      G.en.length = 0; G.eb.length = 0; m.P.hp = 50; m.P.x = 120; m.P.y = 400; if (window.FLEET) FLEET.reset(); let e; const x = 560, y = 250;
      try { if (id.startsWith('fk-')) { e = FLK.mk({ k: id.slice(3), x, y, up: 0, bx: x, by: y }); if (e && !G.en.includes(e)) G.en.push(e); } else if (window.ZOO && ZOO.T[id]) e = ZOO.mk(id, { x, y }); else if (window.FLEET && FLEET.K[id]) e = FLEET.mk(id, { x, y, nd: 2 });
        else if (id === 'gate') e = en('gate', { x, gy: 270, gap: 130 }); else if (['gtank', 'gturret', 'gwalker'].includes(id)) e = en(id, { x, y: 380, gnd: 1 }); else e = en(id, { x, y }); } catch (x2) { out[id] = { err: String(x2.message) }; continue; }
      if (!e) e = G.en[G.en.length - 1]; if (!e) { out[id] = { err: 'not spawned' }; continue; } e.x = x; if (id !== 'gate') e.y = y; e.hp = e.max = Math.max(e.hp, 4);
      for (let k = 0; k < 4; k++) { try { m.render(G.t, 1 / 60); } catch (_) { } await new Promise(r => setTimeout(r, 30)); }
      out[id] = { drawn: window.__base(e.__dk), want: window.__exp(e), fa: e._fa === FOEART.fr };
    }
    return out; });
  await p0.context().close();
  const sheetsDir = fs.readdirSync(path.join(GAME_DIR, 'media/anim')).filter(d => /^ship-e/.test(d) && d !== 'ship-ec');
  const wrong = [], missing = [];
  for (const [id, r] of Object.entries(iso)) { if (r.err) { wrong.push(id + ':' + r.err); continue; } if (V) console.log(`INFO iso ${id} -> ${r.drawn} (want ${r.want})`); if (id === 'gwalker') { console.log('INFO gwalker has no ship sheet (FOEART_NEEDS: ground walker, owner art needed)'); continue; } if (!r.drawn || !r.fa) missing.push(id + '(no sheet)'); else if (r.drawn !== r.want) wrong.push(id + '->' + r.drawn); }
  ok('iso: every kind draws its own sheet, 0 fallbacks / other-kind images (' + Object.keys(iso).length + ' kinds)', !wrong.length && !missing.length, [...wrong, ...missing].join(', '));
  const used = new Set(Object.values(iso).map(r => r.drawn)); const unused = sheetsDir.map(d => d.replace('ship-', '')).filter(s => !used.has(s));
  ok('iso: every enemy ship sheet folder is drawn by some kind', !unused.length, 'unused: ' + unused.join(', '));
  /* (b) live */
  const jobs = []; for (let n = S0; n <= Math.min(S1, NST); n++) for (let s = 1; s <= SEEDS; s++) jobs.push({ n, bot: 'human', seed: s, build: n <= 5 ? 'fresh' : n <= 20 ? 'mid' : 'late', diff: 'normal', MAXT: 300, label: `st${n}/s${s}` });
  const res = []; let next = 0; const pages = [];
  await Promise.all(Array.from({ length: PAR }, async () => { const p = await open(); pages.push(p);
    while (next < jobs.length) { if ((Date.now() - t0) / 1000 > BUDGET) { next = jobs.length; break; } const j = jobs[next++];
      try { res.push({ j, r: await p.evaluate(`${RUNFN}(${JSON.stringify(j)})`) }); } catch (e) { res.push({ j, r: { err: 'harness: ' + String(e.message).slice(0, 120) } }); try { await p.reload({ waitUntil: 'domcontentloaded' }); await sleep(800); await p.evaluate(HOOK); } catch (_) { } } } }));
  const T = {}, perStage = {};
  for (const { j, r } of res) { if (r.err) console.log('INFO run ' + j.label + ' err ' + r.err); for (const [id, d] of Object.entries(r.K || {})) { const a = T[id] || (T[id] = { spawned: 0, seen: 0, own: 0, other: 0, none: 0, otherKeys: {}, shots: 0, vol: 0, kills: 0, death: 0, undrawn: 0 });
    for (const k of Object.keys(d)) if (k === 'ex' || k === 'dx') a[k] = a[k] || d[k]; else if (k === 'otherKeys') Object.assign(a.otherKeys, d[k]); else a[k] += d[k]; } }
  const NOART = { gwalker: 'no ship sheet exists (owner art needed)', gate: 'owner made only a flame strip for the gate pylons: no volley / death clip exists' }; for (const id in NOART) if (T[id]) console.log('INFO excluded from the gates: ' + id + ': ' + NOART[id]);
  const tot = k => Object.entries(T).reduce((s, [id, d]) => s + (id === 'gwalker' ? 0 : id === 'gate' && (k === 'kills' || k === 'death' || k === 'undrawn') ? 0 : d[k]), 0), pct = (a, b) => b ? Math.round(1000 * a / b) / 10 : 100;
  for (const id of Object.keys(T).sort()) { const d = T[id]; console.log(`INFO ${id.padEnd(12)} spawned ${String(d.spawned).padStart(4)} seen ${String(d.seen).padStart(4)} own ${pct(d.own, d.seen)}% other ${d.other} none ${d.none}${d.other ? ' [' + Object.keys(d.otherKeys) + ']' : ''} | shots ${d.shots} volley ${pct(d.vol, d.shots)}% | kills ${d.kills} death ${pct(d.death, d.kills)}% (undrawn ${d.undrawn})${d.ex ? ' ex: ' + d.ex : ''}${d.dx ? ' dx: ' + d.dx : ''}`); }
  console.log(`INFO runs ${res.length} in ${((Date.now() - t0) / 1000).toFixed(0)} s, kinds met ${Object.keys(T).length}`);
  ok('live: 0 draws with another kind\'s or a fallback image', tot('other') === 0 && tot('none') === 0, `other ${tot('other')} none ${tot('none')} of ${tot('seen')}`);
  ok('live: volley on >= 90% of shots', pct(tot('vol'), tot('shots')) >= 90, `${pct(tot('vol'), tot('shots'))}% of ${tot('shots')}`);
  ok('live: death clip on 100% of kills', tot('death') === tot('kills'), `${tot('death')}/${tot('kills')} (undrawn ${tot('undrawn')})`);
  const pe = pages.reduce((s, p) => s + p.errs.length, 0); ok('live: no page errors', pe === 0, pages.flatMap(p => p.errs).slice(0, 3).join(' | '));
  await br.close(); srv.kill();
  console.log(fails.length ? 'FAIL shipart-probe: ' + fails.length : 'PASS shipart-probe'); process.exit(0);
})().catch(e => { console.log('FAIL shipart-probe crashed: ' + e.stack); process.exit(2); });
