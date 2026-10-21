#!/usr/bin/env node
// arthooks.js (21 Oct 2026): the literal id table (AH.IDS) matches files in media/, and every hook draws its picture only when the id is listed in ready.json.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/arthooks-test.js          (prints pass/fail lines only)
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process'), fs = require('fs');
const GAME = path.resolve(__dirname, '../../games/mainhattan-nightrun');
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
let fails = 0, perr = 0; const line = (ok, s) => { if (!ok) fails++; console.log((ok ? 'PASS ' : 'FAIL ') + s); };
const SCENES = () => {
  const m = window.__mnr, ART = m.ART, AH = window.AH, out = { ids: Object.values(AH.IDS).flat() }, d = k => AH.stat[k] | 0;
  const t0 = {}; const mark = () => { for (const k in AH.stat) t0[k] = AH.stat[k]; }; const got = id => (AH.stat[id] | 0) > (t0[id] | 0);
  m.SET.diff = 'normal'; try { m.applySet(); } catch (e) { } m.startStory(3); m.simOn(true); m.god = true;
  for (let i = 0; i < 200 && m.running; i++) { if (m.SH.active) m.SH.close(); m.step(1 / 60); }
  const G = m.G, P = m.P; G.dead = false; P.hp = 99; out.drawn = {};
  const scene = (name, ids, f) => { mark(); try { f(); m.render(m.G.t, 1 / 60); m.render(m.G.t + .01, 1 / 60); } catch (e) { out[name + '!err'] = e.message; } out.drawn[name] = ids.filter(got); };
  scene('player', ['fx-pw-shield-bubble', 'fx-pw-fever-aura', 'fx-pw-bomb-pulse'], () => { m.SH.sh = 1; RET.fv.on = true; G.empT = .3; });
  RET.fv.on = false; m.SH.sh = 0; G.empT = 0;
  scene('eb', ['fx-eb-rocket-trail', 'fx-eb-plasma'], () => { G.eb.push({ x: 300, y: 200, vx: 60, vy: 0, r: 5, k: 'r', dmg: 1, c: '#f00' }, { x: 400, y: 260, vx: 60, vy: 0, r: 6, k: 's', dmg: 1, c: '#f00' }); });
  G.eb.length = 0;
  scene('boom', ['fx-pw-pickup-glow', 'fx-eb-shockwave-ring', 'fx-boom-debris'], () => { NR.emit('pickup', { x: 200, y: 200, k: 'shield', t: 'pw' }); AH.ring(300, 200); AH.debris(400, 200, 100); });
  scene('level', ['fx-pw-level-up'], () => { AH.lvChk(0); AH.lvChk(3); });
  // on-foot helpers on a plain canvas
  const cv = document.createElement('canvas'); cv.width = cv.height = 200; const c = cv.getContext('2d'); mark(); const L = [];
  AH.ftBul(c, { wid: 'pistol', kind: 'bul', x: 50, y: 50, vx: 1, vy: 0, r: 4, life: 1 }); AH.ftBul(c, { wid: 'hmg', kind: 'bul', x: 50, y: 50, vx: 1, vy: 0, r: 4, life: 1 });
  AH.ftBul(c, { wid: 'shot', kind: 'pel', x: 50, y: 50, vx: 1, vy: 0, r: 4, life: 1 }); AH.ftBul(c, { wid: 'flame', kind: 'fire', x: 50, y: 50, vx: 1, vy: 0, r: 8, life: .3 }); AH.ftBul(c, { wid: 'rocket', kind: 'rkt', x: 50, y: 50, vx: 1, vy: 0, r: 6, life: 1 });
  for (const w of ['pistol', 'hmg', 'shot', 'flame', 'rocket', 'arc']) AH.ftMuz(c, w, 80, 80, 0);
  for (const w of ['pistol', 'hmg', 'shot', 'flame', 'rocket', 'arc']) AH.ftHit(L, w, 80, 80);
  for (const id of ['fx-ft-grenade', 'fx-ft-dust', 'fx-ft-blood-spark', 'fx-ft-shield-hit', 'fx-ft-rocket-hit', 'fx-boom-ground-dust']) AH.ftPush(L, id, 90, 90, 50);
  for (const f of L) AH.ftFx(c, f); AH.ftDraw(c, 'fx-ft-grenade', 50, 50, 22, 1); AH.ftArc(c, { arc: [[10, 10], [60, 30], [120, 50]] });
  out.drawn.foot = out.ids.filter(id => id.startsWith('fx-ft-') && got(id)); out.footPush = L.length;
  return out;
};
(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME], { stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 800)); const br = await PW.chromium.launch();
  const run = async listed => {
    const ctx = await br.newContext({ viewport: { width: 1280, height: 720 } }), p = await ctx.newPage(); p.on('pageerror', e => { perr++; console.log('FAIL page error ' + e.message); });
    await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    const ids = JSON.parse(fs.readFileSync(path.join(GAME, 'media/ready.json'), 'utf8'));
    await p.route('**/media/ready.json', async r => { const a = await (await r.fetch()).json(); if (listed) for (const id of await ALL()) if (!a.includes(id + '.webp')) a.push(id + '.webp'); r.fulfill({ contentType: 'application/json', body: JSON.stringify(a) }); });
    await p.goto(`http://127.0.0.1:${port}/index.html?sim=1&all=1&nomusic=1`);
    await p.waitForFunction(() => window.__mnr && __mnr.ART.rd && __mnr.ART.rd.size > 0 && window.AH, null, { timeout: 20000 });
    if (listed) await p.waitForFunction(() => Object.values(AH.IDS).flat().filter(i => i.startsWith('fx-')).every(id => __mnr.ART.bm[id]), null, { timeout: 30000 }).catch(() => { });
    const o = await p.evaluate(`(${SCENES.toString()})()`); await ctx.close(); return o;
  };
  let all = null; const ALL = async () => all || (all = (() => { const t = fs.readFileSync(path.join(GAME, 'index.html'), 'utf8'); const m = t.match(/IDS:\{([\s\S]*?)\n  \},\n  WK/); return [...m[1].matchAll(/'([^']+)'/g)].map(x => x[1]).filter(x => x.startsWith('fx-')); })());
  const Lr = await run(true), U = await run(false);
  const ids = Lr.ids; line(ids.length >= 220 && new Set(ids).size === ids.length, `table has ${ids.length} unique ids`);
  const miss = ids.filter(i => !fs.existsSync(path.join(GAME, 'media', i + '.webp'))); line(!miss.length, 'every id has a file in media/ ' + miss.slice(0, 5));
  for (const k of Object.keys(Lr)) if (k.endsWith('!err')) line(false, 'scene error ' + k + ' ' + Lr[k]);
  const want = { player: ['fx-pw-shield-bubble', 'fx-pw-fever-aura', 'fx-pw-bomb-pulse'], eb: ['fx-eb-rocket-trail', 'fx-eb-plasma'], boom: ['fx-pw-pickup-glow', 'fx-eb-shockwave-ring', 'fx-boom-debris'], level: ['fx-pw-level-up'],
    foot: ['fx-ft-pistol-bullet', 'fx-ft-mg-bullet', 'fx-ft-shotgun-pellet', 'fx-ft-flame', 'fx-ft-rocket', 'fx-ft-pistol-muzzle', 'fx-ft-mg-muzzle', 'fx-ft-shotgun-muzzle', 'fx-ft-flame-muzzle', 'fx-ft-rocket-muzzle', 'fx-ft-arc-muzzle', 'fx-ft-pistol-hit', 'fx-ft-mg-hit', 'fx-ft-shotgun-hit', 'fx-ft-flame-hit', 'fx-ft-rocket-hit', 'fx-ft-arc-hit', 'fx-ft-arc', 'fx-ft-grenade', 'fx-ft-dust', 'fx-ft-blood-spark', 'fx-ft-shield-hit'] };
  for (const s in want) for (const id of want[s]) { line(Lr.drawn[s].includes(id), `${s}: ${id} draws when listed`); line(!U.drawn[s].includes(id), `${s}: ${id} not drawn while unlisted (code shape)`); }
  line(perr === 0, 'no page errors');
  srv.kill(); await br.close(); console.log(fails ? `FAILED ${fails}` : 'ALL PASS'); process.exit(fails ? 1 : 0);
})();
