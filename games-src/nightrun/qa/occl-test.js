#!/usr/bin/env node
// OCCL (RET.occl, W182): Kai must never be lost behind a prop. Kai is stood at every ground prop (depth behind the wall line) and swept across it; each frame is drawn with the fade on and off (?occl=0).
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process');
const GAME = process.env.GAME_DIR || path.resolve(__dirname, '../../../games/mainhattan-nightrun'), Q = process.env.Q || '', GATE = process.env.GATE !== '0' && !/fairstreet=0/.test(Q);
const [VW, VH] = (process.env.VP || '390x763').split('x').map(Number);
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const sleep = ms => new Promise(r => setTimeout(r, ms));

//   NODE_PATH=$(npm root -g) node games-src/nightrun/qa/occl-test.js     env: VP=390x763 (phone) or 1280x720 (PC)  Q=''
// Gate: in every frame Kai overlaps a ground prop drawn in front of him, >= 300 pixels differ from the old (?occl=0) frame, and the prop is at 40% (the fade); props were really found.
const RUN = async () => { const M = __mnr, ART = M.ART, RET = M.RET, F = FOOT; RET.tale = false; F.start('zeil');
  for (let i = 0; i < 150 && !ART.anim('kai/run'); i++) await new Promise(r => setTimeout(r, 100));
  for (let i = 0; i < 100 && !(F.q && F.q.picsReady()); i++) await new Promise(r => setTimeout(r, 100));
  F.on = false; await new Promise(r => setTimeout(r, 50)); const S = F.S, P = S.P, L = F._in.L(), c = L.ctx, FL = 470;
  F.ctl = (S_, I) => { I.l = I.u = I.d = 0; I.r = 0; I.fire = 0; I.jump = 0; };
  const snap = () => c.getImageData(0, 0, c.canvas.width, c.canvas.height).data;
  let frames = 0, bad = 0, minDiff = 1e9, props = 0, worst = null; const seen = {};
  for (const p of S.pr.slice(0, 40)) { if (p.y < FL - 1 || p.hp <= 0) continue; props++; seen[p.k] = 1;
    for (let dx = -(p.w / 2 + 12); dx <= p.w / 2 + 12; dx += 12) for (const z of [0, .08]) {
      S.camX = Math.max(0, p.x - L.vw * .4); S.E.length = 0; S.pb.length = 0; P.x = p.x + dx; P.y = FL; P.z = z; P.inv = 0; P.hp = P.max;
      p._oa = 1; RET.occl = true; F.look.draw(c); const a = snap(), oa = p._oa; RET.occl = false; F.look.draw(c); const b = snap(); RET.occl = true;
      let d = 0; for (let i = 0; i < a.length; i += 4) if (a[i] !== b[i] || a[i + 1] !== b[i + 1] || a[i + 2] !== b[i + 2]) d++;
      frames++; minDiff = Math.min(minDiff, d); if (d < 300 || oa > .45) { bad++; worst = worst || { k: p.k, dx, z, d, oa }; } } }
  return { frames, bad, minDiff, props, kinds: Object.keys(seen), worst };
};
(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME], { stdio: 'ignore' }); await sleep(600);
  const b = await PW.chromium.launch({ executablePath: process.env.CHROME || '/opt/pw-browsers/chromium' }), errors = [];
  const p = await b.newPage({ viewport: { width: VW, height: VH }, deviceScaleFactor: 1 }); p.on('pageerror', e => errors.push(e.message));
  await p.goto(`http://127.0.0.1:${port}/index.html?nomusic=1${Q}`, { waitUntil: 'domcontentloaded' }); await p.waitForFunction(() => window.__mnr && window.FOOT, null, { timeout: 20000 }); await sleep(600);
  const r = await p.evaluate(`(${RUN})()`); console.log(JSON.stringify(r));
  let fails = 0; const ok = (q, n) => { if (!q) fails++; console.log((q ? 'PASS ' : 'FAIL ') + n); };
  ok(r.props > 0 && r.frames > 0, `ground props found (${r.props}: ${r.kinds.join(',')}), ${r.frames} frames`);
  ok(r.bad === 0, `Kai visible in every frame he overlaps a prop (min ${r.minDiff} px changed; bad ${r.bad} ${JSON.stringify(r.worst)})`);
  ok(errors.length === 0, `0 page errors ${errors[0] || ''}`);
  await b.close(); srv.kill(); process.exit(fails ? 1 : 0);
})().catch(e => { console.log('FAIL crashed: ' + e.stack); process.exit(2); });
