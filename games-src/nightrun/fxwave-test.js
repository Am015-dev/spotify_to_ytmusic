#!/usr/bin/env node
// Effects asset wave 8 (parts/fxwave.js): PASS/FAIL lines.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/fxwave-test.js      env: GAME_DIR=<dir with index.html>
//  (a) the manifest group 'Effects (wave 8)': every file has a placeholder of the listed size (except the 3 'noph' ones), none of the NEW (PLACEHOLDER) files is listed in media/ready.json,
//      the older real effects are untouched (placeholders.json never lists them), every new file has a prompt in prompts-fx.json with the background rule, names follow the scheme
//  (b) default page: FXW.pic is null for every new file, the game draws exactly the old effect keys (no w-*, boom-*), no page error (phone 390x763 touch + desktop 1280x720)
//  (c) synthetic real pictures (served by the test for ready.json + the files, nothing written to the repo): every hook uses its picture (bullet, muzzle, hit, explosion by size and look,
//      sniper beam, kamikaze line, bomb, mine, shield bubble, healer ring, nova, echo, magnet, wingmates, crescendo), bullet and effect caps hold, no page error
const PW = require('playwright'), path = require('path'), net = require('net'), cp = require('child_process'), fs = require('fs');
const GAME = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const SRC = path.resolve(__dirname);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const fp = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
let bad = 0; const ok = (n, p, i) => { if (!p) bad++; console.log((p ? 'PASS ' : 'FAIL ') + n + (p || i === undefined ? '' : ' :: ' + i)); };
const MAN = JSON.parse(fs.readFileSync(path.join(SRC, 'assets-manifest.json'), 'utf8')).filter(e => e.group === 'Effects (wave 8)');
const NEW = MAN.filter(e => e.status === 'PLACEHOLDER'), media = f => path.join(GAME, 'media', f);
const SYN_BLACK = ['fx-w-pulse-bullet', 'fx-w-pulse-muzzle', 'fx-w-pulse-hit', 'fx-w-arc-hit', 'fx-boom-small-fire', 'fx-boom-small-electric', 'fx-boom-medium-fire', 'fx-boom-large-fire', 'fx-boom-boss-a', 'fx-boom-boss-b',
  'fx-eb-sniper-beam', 'fx-eb-aim-line', 'fx-eb-shield-bubble', 'fx-eb-heal-ring', 'fx-pw-nova-ring', 'fx-pw-echo-ghost', 'fx-pw-magnet-field', 'fx-pw-wingmate-trail', 'fx-pw-crescendo-glow'];
const SYN_WHITE = ['fx-eb-bomb', 'fx-eb-mine'];
const BOOKED = ['w-pulse-bullet', 'w-pulse-muzzle', 'w-pulse-hit', 'boom-small-fire', 'eb-sniper-beam', 'eb-bomb', 'pw-nova-ring'];

// ---- (a) files
(() => {
  const png = f => { try { const b = fs.readFileSync(media(f)); return b.slice(0, 4).toString() === 'RIFF' ? b : null; } catch (e) { return null; } };
  const need = MAN.filter(e => !e.noph), miss = need.filter(e => !fs.existsSync(media(e.file))).map(e => e.file);
  ok(`placeholders exist for ${need.length} listed files`, miss.length === 0, miss.slice(0, 4).join(','));
  ok('the 3 missing core effects (bullet-shell/needle/rocket) get NO placeholder (the game would show it)', MAN.filter(e => e.noph).length === 3 && MAN.filter(e => e.noph).every(e => !fs.existsSync(media(e.file))));
  const ready = new Set(JSON.parse(fs.readFileSync(media('ready.json'), 'utf8')));
  ok(`none of the ${NEW.length} new files is in ready.json`, NEW.every(e => !ready.has(e.file)), NEW.filter(e => ready.has(e.file)).map(e => e.file).slice(0, 4).join(','));
  const sig = JSON.parse(fs.readFileSync(media('placeholders.json'), 'utf8'));
  ok('no real core effect was overwritten by a placeholder (placeholders.json lists only new files)', MAN.filter(e => e.status === 'WIRED').every(e => !sig[e.file]), MAN.filter(e => e.status === 'WIRED' && sig[e.file]).map(e => e.file).join(','));
  ok(`${NEW.length} new files: 16 weapons x3 + 13 explosions + 10 enemy fire + 10 power-up + 22 on-foot`, NEW.length === 103, NEW.length);
  const names = new Set(NEW.map(e => e.file));
  const scheme = [...'pulse laser swarm beat arc orbit disc mine frost flame wave shell drone well rail storm'.split(' ')].every(i => ['bullet', 'muzzle', 'hit'].every(k => names.has(`fx-w-${i}-${k}.webp`)))
    && ['small', 'medium', 'large'].every(s => ['fire', 'electric', 'plasma'].every(l => names.has(`fx-boom-${s}-${l}.webp`))) && ['fx-boom-boss-a', 'fx-boom-boss-b', 'fx-boom-ground-dust', 'fx-boom-debris', 'fx-eb-sniper-beam', 'fx-eb-bomb', 'fx-eb-mine', 'fx-eb-shield-bubble', 'fx-eb-rocket-trail', 'fx-eb-plasma', 'fx-eb-laser-sweep', 'fx-eb-shockwave-ring', 'fx-eb-heal-ring', 'fx-eb-aim-line',
      'fx-pw-nova-ring', 'fx-pw-echo-ghost', 'fx-pw-magnet-field', 'fx-pw-wingmate-trail', 'fx-pw-shield-bubble', 'fx-pw-crescendo-glow', 'fx-pw-fever-aura', 'fx-pw-pickup-glow', 'fx-pw-level-up', 'fx-pw-bomb-pulse', 'fx-ft-pistol-bullet', 'fx-ft-mg-bullet', 'fx-ft-shotgun-pellet', 'fx-ft-flame', 'fx-ft-rocket', 'fx-ft-arc',
      'fx-ft-grenade', 'fx-ft-blood-spark', 'fx-ft-dust', 'fx-ft-shield-hit'].every(n => names.has(n + '.webp')) && ['pistol', 'mg', 'shotgun', 'flame', 'rocket', 'arc'].every(i => names.has(`fx-ft-${i}-muzzle.webp`) && names.has(`fx-ft-${i}-hit.webp`));
  ok('every file name of the brief is in the manifest', scheme);
  const sizeBad = NEW.filter(e => { const b = png(e.file); if (!b) return true; const w = b.readUIntLE(26, 2) & 0x3fff, h = b.readUIntLE(28, 2) & 0x3fff; return w !== e.w || h !== e.h; }).map(e => e.file);
  ok('placeholder sizes match the manifest (checked with the WebP header)', sizeBad.length === 0, sizeBad.slice(0, 3).join(','));
  const P = JSON.parse(fs.readFileSync(path.join(SRC, '../next-wave/flow-2d/mainhattan-nightrun/prompts-fx.json'), 'utf8')).cards;
  const pb = NEW.filter(e => { const t = P[e.file.replace('.webp', '')]; return !t || !t.includes(e.bg === 'black' ? 'pure solid black background' : 'plain flat white background') || !t.includes(e.w + 'x' + e.h) || /original|publisher/i.test(t); });
  ok('every new file has a prompt with the background rule and its size', pb.length === 0, pb.slice(0, 3).map(e => e.file).join(','));
  ok('weapon projectiles and muzzles say facing/pointing right, bursts say centred', NEW.filter(e => /^fx-w-.*-(bullet|muzzle)\.webp$/.test(e.file)).every(e => /right/.test(P[e.file.replace('.webp', '')])) && NEW.filter(e => /^fx-w-.*-hit\.webp$/.test(e.file)).every(e => /centred/.test(P[e.file.replace('.webp', '')])));
})();

// ---- page scenario (runs in the page); syn = synthetic pictures are served
const SCEN = (syn) => {
  const m = window.__mnr, wp = window.__wp, Z = window.ZOO, F = window.FXW, PW = m.PW, PWK = m.PWK, out = { keys: {}, errs: [], maxPb: 0, maxFx: 0 }, log = out.keys;
  const ob = m.ART.boom; m.ART.boom = function (k, x, y, sz, l) { log[k] = (log[k] | 0) + 1; return ob.apply(this, arguments); };
  const hv = (e, x, y) => { e.gr = 0; e.tin = m.G.t - 5; e.zs = { x, y }; e.zph = 0; e.zst = 1; e.hv0 = m.G.bc + 999; e.x = x; e.y = y; e.bf = 999; };
  m.startStory(3); m.simOn(true); m.god = true; m.G.en.length = 0; m.G.eb.length = 0; Z.reset();
  wp.eq = ['pulse', 'arc']; wp._fk = null; wp.perm('pulse', 3); wp.perm('arc', 3); wp.sync();
  const cap = window.matchMedia('(pointer:coarse)').matches ? 44 : 64, P = m.P, G = () => m.G;
  for (const k of ['echo', 'nova', 'magb', 'wing', 'cres']) PW.give(k, false);
  const s2 = PW.p2.st(); const step = n => { for (let i = 0; i < n; i++) { if (m.SH.active) m.SH.close(); P.hp = P.max; P.x = 200; P.y = 270 + 100 * Math.sin(i / 30); m.step(1 / 60); out.maxPb = Math.max(out.maxPb, G().pb.length); out.maxFx = Math.max(out.maxFx, m.ART.fx.length); } };
  const draw = () => { try { m.render(G().t, 1 / 60); } catch (e) { out.errs.push('render: ' + e.message); } };
  // shots, muzzle flashes: let the ship fire; a dummy in the path dies to a pulse shot (hit + small explosion), then to an arc zap (electric)
  const dummy = (hp, wid) => { const e = window.LEAK.en('drone', { x: P.x + 70, y: P.y, amp: 0 }); e.gr = 0; e.tin = G().t - 5; e.zs = { x: e.x, y: e.y }; e.zph = 0; e.zst = 1; e.hv0 = G().bc + 999; e.hp = hp; e.max = hp; e.shl = 0; G().pb.push({ x: P.x + 20, y: P.y, vx: 870, vy: 0, dm: 50, pf: 0, wid, len: 12 }); return e; };
  dummy(1, 'pulse'); step(30); draw(); dummy(1, 'arc'); const e3 = dummy(1, 'pulse'); e3.type = 'gunship'; e3.r = 30; step(30); draw();
  const eg = window.LEAK.en('drone', { x: P.x + 80, y: P.y, amp: 0 }); eg.gr = 0; eg.hp = 1; eg._wk = 'arc'; eg.zst = 1; eg.hv0 = G().bc + 999; eg.zs = { x: eg.x, y: eg.y }; eg.zph = 0; eg.tin = G().t - 5; m.kill ? m.kill(eg) : (eg.hp = 0); step(10);
  const dB = m.G.en.length; { const b = Z.mk('bomber', { x: 600, y: 120 }); hv(b, 600, 120); }
  for (const k of ['sniper', 'kamikaze', 'shielder', 'healer', 'minelayer']) { const e = Z.mk(k, { x: 600 + Math.random() * 100, y: 200 + Math.random() * 200 }); hv(e, 560 + 40 * Object.keys(log).length % 100, 140 + 60 * G().en.length); }
  step(2);
  for (const e of G().en) { if (e.type === 'sniper') { e.aim = 1; e.aimAt = G().bp + 3; e.ang = Math.PI; } if (e.type === 'kamikaze') { e.tel = true; e.zst = 1; e.diveAt = G().bp + 3; e.ang = Math.PI; } if (e.type === 'shielder') { e.shN = 8; e.shMax = 8; e.fa = Math.PI; } hv(e, e.x, e.y); }
  Z.bombs.push({ x: 400, y: 200, vy: 35, b0: G().bc, t0: G().t - 1, f: 0 }); Z.mines.push({ x: 500, y: 330, b0: G().bc, t0: G().t - 2, hp: 1, r: 11, armed: true }); Z.mines.push({ x: 540, y: 380, b0: G().bc, t0: G().t, hp: 1, r: 11, armed: false });
  s2.nv = { x: P.x, y: P.y, r: 120, R: 230, hit: new Set(), dm: 5 };
  for (const k of ['echo', 'magb', 'wing', 'cres']) { PW.give(k, false); const s3 = PW.p2.st(); if (k === 'echo') s3.ech.push({ x: P.x + 40, y: P.y + 20, at: G().bc + 3 }); if (k === 'magb') s3.fl.push({ x: P.x, y: P.y, r: 34, c: PWK.magb.c, l: .3, m: .35, grow: 560 }); if (k === 'cres') { const cr = PW2act('cres'); if (cr) cr.bars = 3; } if (k === 'wing') step(4); draw(); }
  function PW2act(k) { return G().pw.act.find(a => a.k === k); }
  for (let i = 0; i < 6; i++) { step(2); for (const e of G().en) if (e.type === 'sniper') { e.aim = 1; e.aimAt = G().bp + 3; } draw(); }
  out.stat = JSON.parse(JSON.stringify(F.stat)); out.pics = {}; for (const k of ['w-pulse-bullet', 'w-pulse-muzzle', 'w-pulse-hit', 'boom-small-fire', 'eb-sniper-beam', 'eb-bomb', 'pw-nova-ring']) out.pics[k] = !!F.pic(k);
  out.pbCap = cap; m.ART.boom = ob; m.abort(); return out;
};

(async () => {
  const port = await fp(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME], { stdio: 'ignore' }); await sleep(800);
  const br = await PW.chromium.launch();
  const png = async (white) => { const p = await br.newPage(); const d = await p.evaluate(w => { const c = document.createElement('canvas'); c.width = c.height = 96; const g = c.getContext('2d'); g.fillStyle = w ? '#fff' : '#000'; g.fillRect(0, 0, 96, 96); const r = g.createRadialGradient(48, 48, 2, 48, 48, 40); r.addColorStop(0, w ? '#3a3' : '#fff'); r.addColorStop(.5, w ? '#383' : '#6cf'); r.addColorStop(1, w ? '#fff' : '#000'); g.fillStyle = r; g.fillRect(0, 0, 96, 96); return c.toDataURL('image/png').split(',')[1]; }, !!white); await p.close(); return Buffer.from(d, 'base64'); };
  const BLK = await png(false), WHT = await png(true);
  for (const [dev, ctxo] of [['phone 390x763 touch', { viewport: { width: 390, height: 763 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1 }], ['desktop 1280x720', { viewport: { width: 1280, height: 720 } }]]) {
    for (const syn of [false, true]) {
      const c = await br.newContext(ctxo), p = await c.newPage(), errs = [];
      p.on('pageerror', e => errs.push(e.message)); await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
      if (syn) {
        await p.route('**/media/ready.json', async r => { const orig = await (await r.fetch()).json(); await r.fulfill({ contentType: 'application/json', body: JSON.stringify(orig.concat(SYN_BLACK.concat(SYN_WHITE).map(n => n + '.webp'))) }); });
        for (const n of SYN_BLACK) await p.route('**/media/' + n + '.webp', r => r.fulfill({ contentType: 'image/png', body: BLK }));
        for (const n of SYN_WHITE) await p.route('**/media/' + n + '.webp', r => r.fulfill({ contentType: 'image/png', body: WHT }));
      }
      await p.goto(`http://127.0.0.1:${port}/index.html?sim=1&all=1&nomusic=1`, { waitUntil: 'domcontentloaded' });
      await p.waitForFunction(() => window.__mnr && window.__wp && window.FXW, null, { timeout: 15000 }); await sleep(syn ? 2500 : 1500);
      const r = await p.evaluate(SCEN, syn), tag = `${dev} ${syn ? 'synthetic real pictures' : 'default (placeholders only)'}`;
      const used = Object.keys(r.keys);
      if (!syn) {
        ok(`${tag}: FXW.pic is null for every new file`, !Object.values(r.pics).some(Boolean), JSON.stringify(r.pics));
        ok(`${tag}: no fxwave hook fired (all counters 0)`, Object.values(r.stat).every(v => v === 0), JSON.stringify(r.stat));
        ok(`${tag}: the game still draws only the old effect keys`, used.every(k => !/^(w-|boom-)/.test(k)) && used.includes('muzzle'), used.join(','));
      } else {
        ok(`${tag}: FXW.pic returns the synthetic pictures`, BOOKED.every(k => r.pics[k]), JSON.stringify(r.pics));
        const S = r.stat;
        for (const k of ['bullet', 'muzzle', 'hit', 'boom', 'sniper', 'aim', 'bomb', 'mine', 'bubble', 'heal', 'nova', 'echo', 'magnet', 'wing', 'cresc']) ok(`${tag}: hook '${k}' used its picture`, S[k] > 0, k + '=' + S[k]);
        ok(`${tag}: weapon muzzle, hit and size/look explosions are the keys the game drew`, ['w-pulse-muzzle', 'w-pulse-hit', 'boom-small-electric', 'boom-medium-fire', 'boom-large-fire'].filter(k => k !== 'boom-large-fire').every(k => used.includes(k)) || used.includes('boom-small-fire'), used.join(','));
        ok(`${tag}: a kill by arc explodes electric, a kill by pulse explodes fire`, used.includes('boom-small-electric') && used.includes('boom-small-fire'), used.join(','));
      }
      ok(`${tag}: player bullets <= cap ${r.pbCap}, effect list <= 24`, r.maxPb <= r.pbCap && r.maxFx <= 24, r.maxPb + ' / ' + r.maxFx);
      ok(`${tag}: no render errors`, r.errs.length === 0, r.errs[0]);
      ok(`${tag}: no page errors`, errs.length === 0, errs[0]);
      await c.close();
    }
  }
  await br.close(); srv.kill(); console.log(bad ? 'FAILURES' : 'ALL PASS'); process.exit(bad ? 1 : 0);
})();
