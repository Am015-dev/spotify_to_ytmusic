#!/usr/bin/env node
// Cut-off sprite check (owner, 22 Oct 2026: "I see already several sprites are cut down for foes"). One summary line + the list.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/qa/spritecut.js [--json out.json] [--all]     env: GAME_DIR=<dir with index.html>
// Every strip in media/anim (bosses, ships, fx too with --all; default = on-foot actors and props) is sliced exactly as art.js does it
// (frame i = x i*w .. i*w+w of a sheet whose json says frames, w, h) and every media/foot still is read whole. Flags:
//   EDGE  a frame whose opaque pixels (alpha > 32) touch a frame edge in a run longer than 2 px (top / left / right; the bottom only when the
//         feet are not anchored there, i.e. not an on-foot actor)
//   BODY  a loop (idle, run, walk, hover, loop, spin, glow, flame) whose visible body box height changes by more than 15% from the loop's median
//   COUNT the sheet width is not frames x w, its height is not h, or the json is missing
// The result is also kept for the Lab viewer: --json writes {key:{edge:[[frame,edges]],body:[frames],count:''}}.
const fs = require('fs'), path = require('path');
const { boot, sleep, GAME_DIR } = require('./lib.js');
const SD = path.resolve(__dirname, '../../anims/mainhattan-nightrun/sheets');
const FOOTWHO = new Set('kai grunt gunman shield bruiser knife sniper drone turret mech warden jetpack hound flamer ninja medic'.split(' '));
const LOOP = new Set(['idle', 'run', 'walk', 'hover', 'loop', 'spin', 'glow', 'flame']);
const all = process.argv.includes('--all'), ji = process.argv.indexOf('--json'), jout = ji > 0 ? process.argv[ji + 1] : null;
(async () => {
  const md = path.join(GAME_DIR, 'media/anim'), list = [];
  for (const who of fs.readdirSync(md).sort()) {
    if (!all && !(FOOTWHO.has(who) || who.startsWith('prop-') || who.startsWith('pk-') || who.startsWith('kai-'))) continue;
    for (const f of fs.readdirSync(path.join(md, who)).sort()) {
      if (!f.endsWith('-strip.webp')) continue; const act = f.slice(0, -11), jf = path.join(SD, who, f.slice(0, -5) + '.json');
      let j = null; try { j = JSON.parse(fs.readFileSync(jf, 'utf8')); } catch (e) { }
      list.push({ key: who + '/' + act, url: 'media/anim/' + who + '/' + f, j: j && { n: j.frames, w: j.w, h: j.h }, feet: FOOTWHO.has(who.replace(/^kai-.*/, 'kai')), loop: LOOP.has(act) });
    }
  }
  for (const f of fs.readdirSync(path.join(GAME_DIR, 'media/foot')).sort()) if (f.endsWith('.webp') && !/^bg-/.test(f)) list.push({ key: 'foot/' + f.slice(0, -5), url: 'media/foot/' + f, still: true, feet: false, loop: false });
  const b = await boot();
  let out;
  try {
    const p = await (await b.br.newContext()).newPage();
    await p.goto(b.base.replace('index.html', 'media/anim/kai/idle-strip.webp'));
    out = await p.evaluate(async list => {
      const A = 32, R = {};
      for (const s of list) {
        const r = R[s.key] = { edge: [], body: [], count: '', n: 0, w: 0, h: 0 };
        let im; try { im = new Image(); im.src = '/' + s.url; await im.decode(); } catch (e) { r.count = 'cannot decode'; continue; }
        const W = im.naturalWidth, H = im.naturalHeight, j = s.still ? { n: 1, w: W, h: H } : s.j;
        if (!j) { r.count = 'no json'; continue; }
        if (W !== j.n * j.w || H !== j.h) r.count = 'sheet ' + W + 'x' + H + ' but json ' + j.n + ' x ' + j.w + 'x' + j.h;
        r.n = j.n; r.w = j.w; r.h = j.h;
        const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d'); g.drawImage(im, 0, 0); const d = g.getImageData(0, 0, W, H).data;
        const a = (x, y) => (x < W && y < H) ? d[(y * W + x) * 4 + 3] : 0, hs = [];
        for (let i = 0; i < j.n; i++) {
          const x0 = i * j.w, run = (pts) => { let m = 0, k = 0; for (const [x, y] of pts) { if (a(x, y) > A) { k++; if (k > m) m = k; } else k = 0; } return m; }, row = y => { const o = []; for (let x = 0; x < j.w; x++)o.push([x0 + x, y]); return o; }, col = x => { const o = []; for (let y = 0; y < j.h; y++)o.push([x0 + x, y]); return o; };
          const e = []; if (run(row(0)) > 2) e.push('top'); if (run(col(0)) > 2) e.push('left'); if (run(col(j.w - 1)) > 2) e.push('right'); if (!s.feet && run(row(j.h - 1)) > 2) e.push('bottom');
          if (e.length) r.edge.push([i, e]);
          let t = j.h, bt = -1; for (let y = 0; y < j.h; y++) for (let x = 0; x < j.w; x++) if (a(x0 + x, y) > A) { if (y < t) t = y; bt = y; break; }
          hs.push(bt >= t ? bt - t + 1 : 0);
        }
        if (s.loop && hs.length > 1) { const m = hs.slice().sort((p, q) => p - q)[hs.length >> 1]; hs.forEach((v, i) => { if (m && Math.abs(v - m) / m > .15) r.body.push(i); }); }
      }
      return R;
    }, list);
  } finally { await b.close(); }
  const bad = Object.entries(out).filter(([k, r]) => r.edge.length || r.body.length || r.count);
  const nE = bad.filter(([k, r]) => r.edge.length).length, nF = bad.reduce((s, [k, r]) => s + r.edge.length, 0), nB = bad.filter(([k, r]) => r.body.length).length, nC = bad.filter(([k, r]) => r.count).length;
  for (const [k, r] of bad) {
    if (r.count) console.log('COUNT ' + k + ' :: ' + r.count);
    if (r.edge.length) { const by = {}; for (const [i, e] of r.edge) for (const x of e) (by[x] = by[x] || []).push(i + 1); console.log('EDGE  ' + k + ' (' + r.n + ' frames) :: ' + Object.entries(by).map(([x, f]) => x + ' frames ' + f.join(',')).join('; ')); }
    if (r.body.length) console.log('BODY  ' + k + ' :: frames ' + r.body.map(i => i + 1).join(','));
  }
  console.log(`SPRITECUT ${list.length} sheets/stills: ${nE} with edge cuts (${nF} frames), ${nB} loops with body jumps, ${nC} count errors`);
  if (jout) fs.writeFileSync(jout, JSON.stringify(Object.fromEntries(bad.map(([k, r]) => [k, { edge: r.edge, body: r.body, count: r.count }]))));
})().catch(e => { console.log('FAIL spritecut ' + e.message); process.exit(1); });
