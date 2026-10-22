#!/usr/bin/env node
// SAFETY HARNESS for the consolidation refactor (CONSOLIDATION-PLAN.md): a seeded, deterministic headless drive of 8 scenarios.
// Every 60 frames it hashes game state (time, ship x/y/hp, score, every enemy's type/x/y/hp, every enemy bullet, spawn count, RNG draws)
// and the draw calls of one rendered frame (count per sprite key + per drawImage destination size bucket, no pixels, no screenshots).
//   NODE_PATH=$(npm root -g) node games-src/nightrun/fingerprint-test.js            compare with fingerprints.json (one PASS/FAIL line per scenario)
//   UPDATE=1 ... writes fingerprints.json (only when a step explicitly changes behaviour and the owner approved)
//   env: PAGE=<built html> (default: a fresh NR_OUT build in a temp dir), ONLY=fly2,boss (subset), TWICE=1 (run each scenario twice, check run-to-run stability),
//        COVER=<file> (write V8 function coverage of the page script, used by CONSOLIDATION-PLAN.md), FRAMES=1800 (frames per scenario), Q='&grit=0' (extra URL flags: proves the fingerprint sees a change)
// Determinism: Math.random is a seeded generator per scenario, performance.now / Date.now / requestAnimationFrame are a virtual clock that
// only moves with the sim (1/60 s per frame), localStorage starts empty (fresh context per scenario), all images are awaited before frame 0.
const PW = require(process.env.PW || 'playwright'), path = require('path'), cp = require('child_process'), fs = require('fs'), os = require('os'), net = require('net'), crypto = require('crypto');
const ROOT = path.resolve(__dirname, '../..'), GAME = path.join(ROOT, 'games/mainhattan-nightrun'), FP = path.join(__dirname, 'fingerprints.json');
const FRAMES = +process.env.FRAMES || 1800, ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null;
const SCN = [
  { id: 'fly2', kind: 'story', n: 2, diff: 'normal', seed: 101 }, { id: 'fly6', kind: 'story', n: 6, diff: 'normal', seed: 102 },
  { id: 'fly10', kind: 'story', n: 10, diff: 'normal', seed: 103 }, { id: 'fly14', kind: 'story', n: 14, diff: 'normal', seed: 104 },
  { id: 'boss', kind: 'boss', diff: 'normal', seed: 105 }, { id: 'endless10', kind: 'endless', wave: 10, diff: 'normal', seed: 106 },
  { id: 'legend10', kind: 'story', n: 10, diff: 'legend', seed: 107 }, { id: 'street', kind: 'foot', st: 'zeil', seed: 108, secs: 4, frames: 7200 }];
// runs before any page script: seeded RNG with a draw counter, virtual clock, rAF queued and fired only by the drive (simOn drives fly frames)
const INIT = (seed) => `(()=>{let a=${seed}|0;window.__rng=0;Math.random=function(){window.__rng++;a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};
  window.__reseed=v=>{a=v|0;};window.__vt=0;const T0=Date.UTC(2026,9,21,12,0,0);performance.now=()=>window.__vt;Date.now=()=>T0+window.__vt;const D=Date;
  window.Date=class extends D{constructor(...x){x.length?super(...x):super(T0+window.__vt);}static now(){return T0+window.__vt;}};
  window.__raf=[];window.requestAnimationFrame=f=>(window.__raf.push(f),window.__raf.length);window.cancelAnimationFrame=()=>{};
  const B=window.__dc={};const pr=CanvasRenderingContext2D.prototype,di=pr.drawImage;window.__dcOn=false;
  pr.drawImage=function(im,...r){if(window.__dcOn){const s=im&&(im.src||im.__k)||(im&&im.width+'x'+im.height)||'?',k=String(s).replace(/^.*\\/media\\//,'').replace(/^data:.{0,24}.*/,'data');
    const w=r.length>=8?r[6]:r.length>=4?r[2]:im.width,h=r.length>=8?r[7]:r.length>=4?r[3]:im.height,bk=(Math.round(Math.log2(Math.max(1,Math.abs(w))))+'_'+Math.round(Math.log2(Math.max(1,Math.abs(h)))));
    B['k:'+k]=(B['k:'+k]||0)+1;B['b:'+bk]=(B['b:'+bk]||0)+1;}return di.call(this,im,...r);};})();`;
const DRIVE = async (o) => {
  const m = window.__mnr, dt = 1 / 60, H = [], r6 = v => Math.round(v * 100) / 100, out = { samples: [] };
  const draw = () => { window.__dcOn = true; try { m.render(); } catch (e) { out.renderErr = String(e.message || e); } window.__dcOn = false; };
  if (o.kind === 'foot') {
    document.getElementById('fMenu') && (document.getElementById('fMenu').hidden = true); const sv = FOOT.save(); if (sv && sv.seen) sv.seen.b = 1; m.simOn(true); window.__god = 1; FOOT.start(o.st);   // god mode as footstage-test's foot-bot: the street must reach section 3 to be fingerprinted
    let i = 0;   // skip the one-time story card before the street
    FOOT.ctl = (S, I) => { for (const k in I) I[k] = 0; const P = S.P; // fixed rule bot: walk right, turn round for a while when a foe is close behind
      let b = null; for (const f of S.E) if (f.hp > 0 && f.x < P.x - 8 && P.x - f.x < 260) b = f; if (b && i % 60 < 24) I.l = 1; else I.r = 1; const up = S.E.some(f => f.hp > 0 && Math.abs(f.x - P.x) < 300 && f.y < P.y - 60); if (up && i % 50 < 30) { I.u = 1; I.fire = 1; if (i % 50 < 15) I.l = I.r = 0; } if (i % 150 === 75) { I.bomb = 1; I.bombP = 1; } if (i % 70 === 35) { I.jump = 1; I.jumpP = 1; } I.fire = (i % 20) < 10 ? 1 : 0; if (i % 90 === 0) I.jump = 1; if (P.hp < 4) P.hp = 4; };   // never dies (hp floor 4): hits still count in S.hurts
    while (FOOT.S && !FOOT.S.end && i < o.frames && (FOOT.S.cpN || 0) < o.secs) { window.__vt += 1000 / 60; i++; window.__dcOn = i % 600 === 0; const q = window.__raf.splice(0); if (q.length) q.forEach(f => f(window.__vt)); else FOOT.sim(dt, dt); window.__dcOn = false;   // the street's own rAF loop (update + draw) runs on the virtual clock
      if (i % 60 === 0) { const S = FOOT.S, P = S.P; H.push([r6(S.time), Math.round(P.x), Math.round(P.y), P.hp, S.kills, S.score, S.cpN | 0, S.hurts | 0, S.E.map(e => [e.k || e.type, Math.round(e.x), Math.round(e.y), e.hp]), S.eb.length, Math.round(S.eb.reduce((s, b) => s + b.x + b.y, 0)), S.pk.length, window.__rng].join('|')); } }
    out.frames = i; out.end = FOOT.S && FOOT.S.end ? (FOOT.S.end.cleared ? 'cleared' : 'ended') + ' at section ' + (FOOT.S.cpN | 0) : 'section ' + (FOOT.S && FOOT.S.cpN | 0) + ' x ' + Math.round(FOOT.S.P.x) + (FOOT.S.lock ? ' lock ' + FOOT.S.lock.id : '') + ' foes ' + FOOT.S.E.length; out.sec = FOOT.S && FOOT.S.cpN; FOOT.ctl = null; FOOT.stop();
    out.H = H; return out;
  }
  m.SET.diff = o.diff; if (o.kind === 'endless' || o.kind === 'boss') { m.ST.on = false; document.getElementById('startBtn').click(); } else m.startStory(o.n); m.simOn(true);
  if (o.kind === 'endless' && window.ENDR) { ENDR.w = o.wave - 1; ENDR.nextWave(); }
  const G = m.G, P = m.P; let i = 0, boss = 0;
  while (m.running && i < o.frames) {
    if (m.SH.active) m.SH.close(); if (m.ST.over) break; if (o.kind === 'boss' && i >= 120 && !G.boss && i % 30 === 0) m.bossNow();   // arcade run, first district: asks for the boss until it is on screen (the story's DIR.tick never forces one)
    m.touchTo(220 + 70 * Math.sin(i * .009), 270 + 170 * Math.sin(i * .018)); if (i % 20 === 0) m.press('Fire'); if (i % 240 === 120) m.press('Dash'); if (i % 900 === 450) m.press('Emp');
    window.__vt += 1000 / 60; m.step(dt); i++;
    if (i % 60 === 0) { H.push([r6(G.t), Math.round(P.x), Math.round(P.y), r6(P.hp), G.score | 0, (G.spawns || []).length, G.en.map(e => [e.type, Math.round(e.x), Math.round(e.y), r6(e.hp)]), G.eb.length, Math.round(G.eb.reduce((s, b) => s + b.x + b.y, 0)), G.boss ? r6(G.boss.hp) : -1, window.__rng].join('|'));
      if (i % 600 === 0) draw(); }
    if (G.boss) boss++; if (G.dead) break; }
  if (o.kind === 'boss') out.end = (boss ? 'boss on screen ' + boss + ' frames' : 'NO BOSS') + (G.dead ? ', dead' : '');
  out.frames = i; out.dead = !!G.dead; out.H = H; m.abort(); return out;
};
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const sha = s => crypto.createHash('sha1').update(s).digest('hex').slice(0, 16);
(async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'fp-')); let page = process.env.PAGE;
  if (!page) { page = path.join(tmp, 'index.html'); cp.execFileSync('python3', [path.join(__dirname, 'parts/build.py')], { env: { ...process.env, NR_OUT: page }, stdio: 'ignore' }); }
  else fs.copyFileSync(page, path.join(tmp, 'index.html'));
  // the __STAMP__ (build hash + time) is the one thing that differs between two builds of the same source: pin it
  fs.writeFileSync(path.join(tmp, 'index.html'), fs.readFileSync(path.join(tmp, 'index.html'), 'utf8').replace(/[0-9a-f]{10} \d{4}-\d\d-\d\d \d\d:\d\d UTC/g, '0000000000 2026-10-21 00:00 UTC'));
  for (const d of ['media', 'music', 'icons']) try { fs.symlinkSync(path.join(GAME, d), path.join(tmp, d)); } catch (e) { }
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', tmp], { stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 700));
  const br = await PW.chromium.launch(), res = {}, errs = [], cov = process.env.COVER ? [] : null;
  const one = async (s) => {
    const ctx = await br.newContext({ viewport: { width: 1280, height: 720 }, serviceWorkers: 'block' }), p = await ctx.newPage();
    p.on('pageerror', e => errs.push(s.id + ': ' + e.message)); await p.addInitScript(INIT(s.seed));
    if (cov) await p.coverage.startJSCoverage({ resetOnNavigation: false, reportAnonymousScripts: true });
    await p.goto(`http://127.0.0.1:${port}/index.html?sim=1&all=1${process.env.Q || ''}`);
    await p.waitForFunction(() => window.__mnr && window.__mnr.TR.list.length > 0, null, { timeout: 20000 }).catch(() => { });
    await p.evaluate(() => Promise.all([...document.images].map(im => im.complete ? 0 : new Promise(r => { im.onload = im.onerror = r; })))).catch(() => { });
    await p.waitForTimeout(400);   // ART.img decodes; the virtual clock does not move while we wait
    await p.waitForFunction(() => { const A = __mnr.ART; return !A.ANIM || Object.keys(A.ANIM.s).filter(k => /^ship-e[a-z]+\/(flame|volley|death)$/.test(k)).map(k => A.anim(k)).every(Boolean); }, null, { timeout: 20000, polling: 100 }).catch(() => { });   // every enemy ship sheet decoded before frame 0, so which draw path runs never depends on decode timing
    await p.evaluate(() => { window.__rng = 0; for (const k in window.__dc) delete window.__dc[k]; });
    const r = await p.evaluate(DRIVE, { ...s, frames: s.frames || FRAMES });
    const dc = await p.evaluate(() => window.__dc);
    if (cov) cov.push(...(await p.coverage.stopJSCoverage()).filter(e => /index\.html/.test(e.url)));
    await ctx.close();
    return { state: sha(r.H.join('\n')), draw: sha(JSON.stringify(Object.keys(dc).sort().map(k => [k, dc[k]]))), frames: r.frames, samples: r.H.length, rng: r.H.length ? +r.H[r.H.length - 1].split('|').pop() : 0, dcalls: Object.keys(dc).filter(k => k[0] === 'k').reduce((a, k) => a + dc[k], 0), end: r.end || (r.dead ? 'dead' : null), err: r.renderErr };
  };
  const t0 = Date.now(), want = SCN.filter(s => !ONLY || ONLY.includes(s.id));
  for (const s of want) { res[s.id] = await one(s); if (process.env.TWICE) { const b = await one(s); res[s.id].stable = b.state === res[s.id].state && b.draw === res[s.id].draw; } }
  await br.close(); srv.kill();
  if (cov) fs.writeFileSync(process.env.COVER, JSON.stringify(cov));
  const old = fs.existsSync(FP) ? JSON.parse(fs.readFileSync(FP, 'utf8')) : {};
  let bad = 0;
  for (const s of want) { const a = res[s.id], b = old[s.id], st = process.env.TWICE ? (a.stable ? ' stable x2' : ' UNSTABLE run to run') : '';
    if (process.env.TWICE && !a.stable) bad++;
    if (process.env.UPDATE) { console.log(`SET  ${s.id}: state ${a.state} draw ${a.draw} (${a.frames} frames, ${a.samples} samples, ${a.rng} rng, ${a.dcalls} sprite draws${a.end ? ', ' + a.end : ''})${st}`); continue; }
    const okk = b && b.state === a.state && b.draw === a.draw; if (!okk) bad++;
    console.log(`${okk ? 'PASS' : 'FAIL'} ${s.id}: state ${a.state}${b && b.state !== a.state ? ' (was ' + b.state + ')' : ''} draw ${a.draw}${b && b.draw !== a.draw ? ' (was ' + b.draw + ')' : ''}${b ? '' : ' (no stored fingerprint)'}${st}`); }
  if (process.env.UPDATE) { const o = { ...old }; for (const s of want) { const { stable, ...k } = res[s.id]; o[s.id] = k; } fs.writeFileSync(FP, JSON.stringify(o, null, 1) + '\n'); }
  if (errs.length) { bad++; console.log('FAIL page errors: ' + [...new Set(errs)].slice(0, 3).join(' / ')); }
  console.log(`${bad ? 'FAIL' : 'PASS'} fingerprint: ${want.length} scenarios in ${((Date.now() - t0) / 1000).toFixed(0)} s`);
  process.exit(bad ? 1 : 0);
})().catch(e => { console.log('FAIL fingerprint: ' + e.message); process.exit(1); });
