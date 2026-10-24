#!/usr/bin/env node
// SHIPMOVE (parts/enemies/shipmove.js, flag RET.shipmove): stage 1, stepped sim (humanbot.js, faster than x200), measured on (?shipmove=1) and off.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/qa/shipmove-test.js    env: RUNS=8 STAGES=1 GATE=0 (numbers only) OFF=0 (skip the off run) GAME_DIR=<dir>
// Measures: enemy-seconds spent in a constant-velocity stretch longer than 1 s (speed > 15 px/s, velocity within 6 px/s or 5% of the stretch start),
//   longest such stretch, human clear rate. Size: player hull length on a phone (390 short side) and a PC (860 short side) as a share of the short side.
// Gates (on): (a) 0 enemies in a constant-velocity stretch > 1 s  (b) hull >= 1/12 of the short side on both screens  (c) no page errors
const path = require('path'), cp = require('child_process'), fs = require('fs'), os = require('os');
const RUNS = process.env.RUNS || '8', STAGES = process.env.STAGES || '1', GATE = process.env.GATE !== '0';
const pass = [], fail = [], ok = (c, m) => (c ? pass : fail).push(m);
const REC = `window.__rec=(m)=>{const S=window.__cv||(window.__cv={p:new Map(),et:0,cs:0,n:new Set(),mx:0,k:0});const dt=1/60;
  for(const e of m.G.en){if(e.type==='boss'||e.mini||e.dead||e.hp<=0)continue;const r=S.p.get(e);
    if(!r){S.p.set(e,{x:e.x,y:e.y,rx:0,ry:0,t:0,on:0,fl:0});continue;}
    const vx=(e.x-r.x)/dt,vy=(e.y-r.y)/dt,sp=Math.hypot(vx,vy),inF=e.x>0&&e.x<960&&e.y>0&&e.y<540;r.x=e.x;r.y=e.y;
    if(!inF||sp<15||sp>1500){r.t=0;r.on=0;continue;}
    S.et+=dt;
    if(!r.on||Math.hypot(vx-r.rx,vy-r.ry)>Math.max(6,.05*Math.hypot(r.rx,r.ry))){r.rx=vx;r.ry=vy;r.t=0;r.on=1;r.fl=0;}
    else{r.t+=dt;if(r.t>1){S.cs+=dt;if(!r.fl){r.fl=1;S.n.add(e);S.k++;(S.ty=S.ty||{})[e.type+(e.wv?':'+e.wv.st:'')+(e.al?':'+e.al.ph:'')+(e.sl?':sl':'')]=1;}S.mx=Math.max(S.mx,r.t);}}}};
  window.__recOut=()=>{const S=window.__cv||{};window.__cv=null;return{et:S.et||0,cs:S.cs||0,k:S.k||0,mx:S.mx||0,ty:Object.keys(S.ty||{}).join(',')};}`;
const run = (q) => { const out = path.join(os.tmpdir(), 'sm-' + (q ? 'off' : 'on') + '.json');
  const r = cp.spawnSync('node', [path.join(__dirname, '..', 'humanbot.js')], { env: Object.assign({}, process.env, { BOTS: 'human', BUILDS: 'fresh', STAGES, RUNS, PAR: '4', Q: q, PRE: REC, JSON: out }), encoding: 'utf8', maxBuffer: 1 << 26 });
  for (const l of (r.stdout || '').split('\n')) if (/FAIL page error|RUN ERROR/.test(l)) fail.push('(c) ' + (q || 'on') + ' ' + l.trim());
  return JSON.parse(fs.readFileSync(out, 'utf8')); };
const sum = (a) => { const s = { et: 0, cs: 0, k: 0, mx: 0, c: 0, n: 0 }; for (const r of a) { const x = r.px || {}; s.et += x.et || 0; s.cs += x.cs || 0; s.k += x.k || 0; s.mx = Math.max(s.mx, x.mx || 0); if (x.ty) s.ty = (s.ty ? s.ty + ',' : '') + x.ty; s.n++; if (r.clear) s.c++; } return s; };
const line = (s) => `enemies in a constant-velocity stretch > 1 s: ${s.k} (${(100 * s.cs / Math.max(1e-6, s.et)).toFixed(1)}% of ${s.et.toFixed(0)} s moving enemy-time), longest ${s.mx.toFixed(1)} s (${s.ty||'-'}), human clear ${(100 * s.c / Math.max(1, s.n)).toFixed(0)}% of ${s.n}`;
const on = run('&shipmove=1'), off = process.env.OFF === '0' ? null : run('');
const A = sum(on), B = off ? sum(off) : null;
console.log('  on : ' + line(A)); if (B) console.log('  off: ' + line(B));
// ship size: hull length (world units, window.SHM.hullLen()) x screen scale, on both screens
(async () => {
  const PW = require(process.env.PW || 'playwright'), http = require('http');
  const GD = process.env.GAME_DIR || path.resolve(__dirname, '../../../games/mainhattan-nightrun');
  const sizes = {};
  await new Promise((res) => { const srv = http.createServer((q, r) => { let p = path.join(GD, decodeURIComponent(q.url.split('?')[0])); if (p.endsWith('/')) p += 'index.html'; fs.readFile(p, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'content-type': { '.html': 'text/html', '.webp': 'image/webp', '.json': 'application/json' }[path.extname(p)] || 'application/octet-stream' }); r.end(d); }); }).listen(0, '127.0.0.1', async () => {
    const br = await PW.chromium.launch();
    for (const [nm, w, h, touch] of [['phone', 390, 763, true], ['pc', 1440, 860, false]]) {
      const ctx = await br.newContext({ viewport: { width: w, height: h }, hasTouch: touch, isMobile: touch }), p = await ctx.newPage();
      await p.goto(`http://127.0.0.1:${srv.address().port}/index.html?sim=1&all=1&nomusic=1&shipmove=1`); await p.waitForFunction(() => window.__mnr && window.__mnr.TR.list.length > 0, null, { timeout: 8000 }).catch(() => { });
      sizes[nm] = await p.evaluate(() => { const m = window.__mnr; m.startStory(1); m.simOn(true); for (let i = 0; i < 120; i++) m.step(1 / 60); const c = document.querySelector('canvas').getBoundingClientRect(), vp = Math.min(innerWidth, innerHeight);
        const sc = m.rotMode ? c.width / 540 : c.height / 540; return { len: window.SHM ? SHM.hullLen() : 0, share: (window.SHM ? SHM.hullLen() : 0) * sc / vp, foes: window.SHM ? SHM.sample() : null }; });
      await ctx.close(); }
    await br.close(); srv.close(); res(); }); });
  if (GATE) {
    ok(A.k === 0, `(a) enemies with a constant-velocity stretch > 1 s: ${A.k} (must be 0), longest ${A.mx.toFixed(2)} s`);
    for (const nm in sizes) ok(sizes[nm].share >= 1 / 12, `(b) ${nm} hull ${(sizes[nm].share * 100).toFixed(1)}% of the short side (>= 8.3%)`);
  } else for (const nm in sizes) console.log(`  ${nm} hull ${(sizes[nm].share * 100).toFixed(1)}% of the short side`);
  for (const nm in sizes) console.log('  foes ' + nm + ': ' + JSON.stringify(sizes[nm].foes));
  for (const m of pass) console.log('PASS ' + m); for (const m of fail) console.log('FAIL ' + m);
  console.log(fail.length ? 'FAIL shipmove-test' : 'PASS shipmove-test'); process.exit(fail.length ? 1 : 0);
})();
