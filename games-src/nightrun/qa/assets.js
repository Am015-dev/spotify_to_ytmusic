#!/usr/bin/env node
// (e) asset-load: every id in media/ready.json loads (no 404, decodes, ART.img / ART.anim non-null = no code-shape placeholder drawn for a ready id), every anim sheet of the bundled ART.ANIM is listed and loads.
const { boot, open, ok, done, sleep } = require('./lib');
(async () => {
  const B = await boot(); const p = await open(B.br, B.base, 390, 763, '');
  const ids = await p.evaluate(() => fetch(ART.base + 'ready.json').then(r => r.json()).then(a => a.slice())).catch(() => null) || await p.evaluate(() => [...window.__mnr.ART.rd]);
  ok('ready.json read', Array.isArray(ids) && ids.length > 100, ids && ids.length);
  // 1) every file answers 200 with the right bytes
  const miss = await p.evaluate(async ids => { const out = []; await Promise.all(ids.map(async f => { try { const r = await fetch(__mnr.ART.base + f); if (!r.ok) out.push(r.status + ' ' + f); else { const b = await r.arrayBuffer(); if (b.byteLength < 100) out.push('tiny ' + f); } } catch (e) { out.push('ERR ' + f); } })); return out; }, ids);
  ok(`${ids.length} listed files answer 200`, !miss.length, miss.slice(0, 6).join(' | '));
  // 2) every webp decodes, and the game's own loader holds a bitmap for it
  const dec = await p.evaluate(async ids => { const out = []; const A = __mnr.ART;
    for (const f of ids) { if (!/\.webp$/.test(f)) continue; try { const r = await fetch(A.base + f), b = await createImageBitmap(await r.blob()); if (!b.width || !b.height) out.push('empty ' + f); } catch (e) { out.push('undecodable ' + f); } }
    return out; }, ids);
  ok('every listed picture decodes to a non-empty bitmap', !dec.length, dec.slice(0, 6).join(' | '));
  const strips = ids.filter(f => /^anim\//.test(f));
  await p.evaluate(ids => { for (const f of ids) if (/\.webp$/.test(f)) __mnr.ART.load(f.replace(/\.webp$/, '')); }, ids);
  await sleep(6000);
  const ph = await p.evaluate(ids => { const A = __mnr.ART, out = []; for (const f of ids) { if (!/\.webp$/.test(f)) continue; const n = f.replace(/\.webp$/, ''); if (!A.bm[n] || !A.rd.has(f)) out.push(n); } return out; }, ids);
  ok(`game loader holds a bitmap for all ${ids.filter(f => /\.webp$/.test(f)).length} ready pictures (no placeholder shape)`, !ph.length, ph.slice(0, 8).join(' | '));
  const sheets = await p.evaluate(() => { const A = __mnr.ART, o = { listed: 0, noStrip: [], noMeta: [] }; const C = A.ANIM && A.ANIM.c || {};
    for (const k in C) { const c = C[k]; /* c.a = acts? probe both shapes */ const acts = c.acts || c.a || (A.ANIM.s ? Object.keys(A.ANIM.s).filter(s => s.startsWith(k + '/')).map(s => s.split('/')[1]) : []); o.listed++; }
    return o; });
  // 3) every anim strip in ready.json: loads and has frame metadata (ART.aS) so ART.anim returns the sheet
  const bad = await p.evaluate(ids => { const A = __mnr.ART, out = []; for (const f of ids) { const m = f.match(/^anim\/(.+)-strip\.webp$/); if (!m) continue; const key = m[1]; if (!A.anim(key)) out.push('no sheet ' + key); else if (!A.aS(key)) out.push('no frame data ' + key); } return out; }, ids);
  ok(`all ${strips.length} anim strips load and have frame data`, !bad.length, bad.slice(0, 8).join(' | '));
  // 4) anim metadata that points at strips ready.json does not list (would draw nothing)
  const unl = await p.evaluate(ids => { const A = __mnr.ART, S = new Set(ids), out = []; const m = A.ANIM && A.ANIM.s; if (m) for (const k in m) { const f = 'anim/' + k + '-strip.webp'; if (!S.has(f)) out.push(k); } return out; }, ids);
  ok('every bundled anim sheet is listed in ready.json', !unl.length, unl.slice(0, 8).join(' | '));
  // 5) the boot itself loaded nothing that 404s
  ok('no 404 / failed request while booting', !p.bad.length, p.bad.slice(0, 6).join(' | '));
  ok('no page errors', !p.errs.length, p.errs[0]);
  await B.close(); done('assets');
})().catch(e => { console.log('FAIL assets crash :: ' + e.message); process.exit(1); });
