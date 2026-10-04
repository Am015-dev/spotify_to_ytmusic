// Tests for games/sync.html + games/sw.js (service worker needs http, so this serves games/ on localhost).
//   PW=<path to node_modules/playwright> node games-src/sync/test.js     (default PW is the session scratchpad copy)
// Prints FAIL lines and a final "N problems". Screenshots go to games-src/sync/shots/ (gitignored).
const PWP = process.env.PW || '/tmp/claude-0/-home-user-spotify-to-ytmusic/5a36d2af-8697-5203-aeea-a0f2a3329615/scratchpad/node_modules/playwright';
const { chromium } = require(PWP);
const http = require('http'), fs = require('fs'), path = require('path'), { spawn } = require('child_process');
const ROOT = process.env.GAMES_DIR ? path.resolve(process.env.GAMES_DIR) : path.resolve(__dirname, '..', '..', 'games'), SHOTS = path.join(__dirname, 'shots');
fs.mkdirSync(SHOTS, { recursive: true });
const PORT = +process.env.PORT || 18090, RELAY = +process.env.RELAY || 17790;
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.webmanifest': 'application/manifest+json', '.md': 'text/plain' };
let problems = 0; const fail = m => { problems++; console.log('FAIL', m); }; const ok = (c, m) => { if (!c) fail(m); else console.log('ok  ', m); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const handler = (q, s) => {
  let p = decodeURIComponent(q.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html'; const f = path.join(ROOT, p);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { s.writeHead(404); return s.end('nf'); }
  s.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream', 'cache-control': 'no-cache' }); fs.createReadStream(f).pipe(s);
};
let server = http.createServer(handler);
// "offline" = the browser is set offline AND the server is really gone, so a service worker that quietly reached the network would be caught
async function down(c) { await c.setOffline(true); server.closeAllConnections(); await new Promise(r => server.close(r)); }
async function up(c) { server = http.createServer(handler); await new Promise(r => server.listen(PORT, r)); await c.setOffline(false); }
const URLB = 'http://localhost:' + PORT + '/';
async function mk(b, opt = {}) {
  const c = await b.newContext(Object.assign({ viewport: { width: 1100, height: 800 }, acceptDownloads: true }, opt));
  await c.addInitScript(([port, o]) => { window.NETROOM_RELAYS = ['ws://127.0.0.1:' + port]; window.NETROOM_ICE = []; Object.assign(window, o || {}); }, [RELAY, opt.flags]);
  return c;
}
async function pg(c, label, url, errs) {
  const p = await c.newPage(); p.setDefaultTimeout(30000);
  p.on('pageerror', e => { errs.push(label + ' pageerror: ' + e.message); });
  p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|net::ERR|fonts\.g/.test(m.text())) errs.push(label + ' console: ' + m.text()); });
  if (url) await p.goto(URLB + url); return p;
}
const seed = (p, o) => p.evaluate(o => { localStorage.clear(); for (const k in o) localStorage.setItem(k, o[k]); }, o);
const ls = p => p.evaluate(() => { const o = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); o[k] = localStorage.getItem(k); } return o; });
const SAVES = { ccs_save2: JSON.stringify({ round: 4, hp: [10, 7], log: 'x'.repeat(500) }), ccs_gfx: 'low', na_squads: '[{"n":"A"}]', sgz_save1: '{"turn":9}', soq_snd: '1', mnr_best: '12345', hb_save1: '{"s":1}', 'oddkey': 'hello', 'gns-name': 'Tester' };

(async () => {
  await new Promise(r => server.listen(PORT, r));
  const relay = spawn('node', [path.join(__dirname, '..', 'net', 'relay.js'), String(RELAY)]); await sleep(700);
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const errs = [];
  try {
    // ================= A. offline =================
    console.log('--- offline');
    const cA = await mk(b); const pA = await pg(cA, 'A', 'sync.html', errs);
    await pA.evaluate(() => navigator.serviceWorker.ready); await pA.waitForFunction(() => navigator.serviceWorker.controller || true);
    const ver = await pA.evaluate(async () => (await caches.keys()).sort());
    ok(ver.includes('gns-shelf-v1'), 'SW installed, shelf cache exists: ' + ver);
    await pA.reload(); await pA.waitForFunction(() => navigator.serviceWorker.controller, null, { timeout: 15000 });
    ok(await pA.locator('#games li').count() === 17, '17 games listed');
    const row = id => pA.locator('[data-id="' + id + '"]');
    ok((await row('crown').locator('.st').textContent()).startsWith('About'), 'size shown before download: ' + await row('crown').locator('.st').textContent());
    await row('mainhattan').locator('.sw').click(); await row('kaiten').locator('.sw').click();
    await pA.waitForFunction(() => /On this device/.test(document.querySelector('[data-id=mainhattan] .st').textContent) && /On this device/.test(document.querySelector('[data-id=kaiten] .st').textContent), null, { timeout: 30000 });
    ok(true, 'two games downloaded: ' + await row('kaiten').locator('.st').textContent());
    ok(/2 of 17/.test(await pA.locator('#stor').textContent()), 'storage line: ' + (await pA.locator('#stor').textContent()).slice(0, 120));
    await sleep(1500); // let the shelf (covers) finish caching
    await pA.screenshot({ path: SHOTS + '/offline-online.png', fullPage: true });
    await down(cA);
    const chk = async (url, label, expect = 200, text) => {
      const pp = await pg(cA, label, null, errs); let r; try { r = await pp.goto(URLB + url, { waitUntil: 'load' }); } catch (e) { fail(label + ' goto threw ' + e.message.split('\n')[0]); await pp.close(); return; }
      const st = r.status(), body = (await pp.content()).length; ok(st === expect && body > 300, label + ' offline -> ' + st + ' (' + body + ' chars, SW ' + r.fromServiceWorker() + ')');
      if (text) ok((await pp.textContent('body')).includes(text), label + ' shows "' + text + '"'); return pp;
    };
    await (await chk('index.html', 'shelf index')).close(); await (await chk('', 'shelf root /')).close(); await (await chk('classic.html', 'classic')).close();
    const ps = await chk('sync.html', 'sync page'); ok(!(await ps.locator('#nettxt').textContent()).startsWith('Online'), 'offline pill: ' + await ps.locator('#nettxt').textContent());
    ok(await ps.locator('#games li').count() === 17, 'sync page lists games offline'); ok(await ps.evaluate(() => document.querySelector('.g img').complete && document.querySelector('.g img').naturalWidth > 0), 'cover image shows offline');
    ok(await ps.locator('#dlall').isDisabled(), 'Download all disabled offline'); await ps.screenshot({ path: SHOTS + '/offline-offline.png', fullPage: true }); await ps.close();
    await (await chk('suggest.html', 'suggest')).close(); await (await chk('reference.html', 'reference')).close();
    await (await chk('mainhattan-nightrun/', 'game1 /slug/')).close(); await (await chk('mainhattan-nightrun/index.html', 'game1 /slug/index.html')).close();
    await (await chk('kaiten-kitchen/', 'game2 /slug/')).close(); await (await chk('kaiten-kitchen/index.html', 'game2 /slug/index.html')).close();
    const pn = await chk('crown-city-smash/', 'not-downloaded game', 503, 'not on this device'); if (pn) await pn.screenshot({ path: SHOTS + '/offline-notdl.png' });
    // the shelf's iframe: classic.html opening a downloaded game offline works (game page itself loaded above); remove -> falls back
    await up(cA); const p2 = await pg(cA, 'A2', 'sync.html', errs); await p2.waitForFunction(() => /On this device/.test(document.querySelector('[data-id=mainhattan] .st').textContent));
    await p2.locator('[data-id=mainhattan] .sw').click(); await p2.waitForFunction(() => /^About/.test(document.querySelector('[data-id=mainhattan] .st').textContent));
    await down(cA); const pr = await chk('mainhattan-nightrun/', 'removed game', 503, 'not on this device'); if (pr) await pr.close();
    await up(cA);
    await p2.locator('#dlall').click(); await p2.waitForFunction(() => /All games are stored|could not/.test(document.getElementById('offmsg').textContent), null, { timeout: 120000 });
    ok(/All games are stored/.test(await p2.locator('#offmsg').textContent()), 'Download all: ' + await p2.locator('#offmsg').textContent());
    await p2.locator('#rmall').click(); await p2.waitForFunction(() => document.querySelectorAll('.g .st.ok').length === 0);
    ok(await p2.evaluate(async () => (await (await caches.open('gns-games-v1')).keys()).length) === 0, 'Remove all empties the game cache');
    await cA.close();

    // ================= B. save file export / import =================
    console.log('--- save file');
    const c1 = await mk(b), p1 = await pg(c1, 'src', 'sync.html', errs); await seed(p1, SAVES); await p1.reload();
    ok(/Crown City Smash/.test(await p1.locator('#savelist').textContent()) && /Other/.test(await p1.locator('#savelist').textContent()), 'summary lists games and Other: ' + (await p1.locator('#savelist').innerText()).replace(/\n/g, ' | '));
    await p1.evaluate(() => localStorage.setItem('gns_backup_last', 'zzz'));
    const [dl] = await Promise.all([p1.waitForEvent('download'), p1.locator('#dlsaves').click()]);
    ok(/^gns-saves-\d{4}-\d\d-\d\d\.json$/.test(dl.suggestedFilename()), 'file name ' + dl.suggestedFilename());
    const fpath = path.join(SHOTS, 'saves-test.json'); await dl.saveAs(fpath); const J = JSON.parse(fs.readFileSync(fpath, 'utf8'));
    ok(J.app === 'game-night-shelf' && J.v === 1 && J.keys === Object.keys(SAVES).length && J.from && /^\d{4}-/.test(J.at), 'meta ok: ' + JSON.stringify({ app: J.app, v: J.v, keys: J.keys, from: J.from }));
    ok(Object.keys(SAVES).every(k => J.data[k] === SAVES[k]) && !('gns_backup_last' in J.data), 'export has all seeded keys, no backup key');
    await c1.close();
    // merge into a device that has a conflicting key + a local-only key
    const c2 = await mk(b), p2b = await pg(c2, 'merge', 'sync.html', errs); await seed(p2b, { ccs_gfx: 'high', local_only: 'keepme', tb_snd: '1' }); await p2b.reload();
    await p2b.setInputFiles('#file', fpath); await p2b.waitForSelector('#imp:not([hidden])');
    const txt = await p2b.locator('#implist').innerText(); ok(/Crown City Smash[\s\S]*1 new[\s\S]*1 overwritten/.test(txt), 'preview per game: ' + txt.replace(/\n/g, ' | '));
    await p2b.screenshot({ path: SHOTS + '/import-preview.png', fullPage: true });
    await p2b.locator('#merge').click(); await p2b.waitForSelector('#impmsg:not([hidden])'); let L = await ls(p2b);
    ok(Object.keys(SAVES).every(k => L[k] === SAVES[k]) && L.local_only === 'keepme' && L.tb_snd === '1', 'Merge: incoming overwrote, local-only kept');
    const bk = JSON.parse(L.gns_backup_last); ok(bk.data.ccs_gfx === 'high' && bk.data.local_only === 'keepme' && !('ccs_save2' in bk.data), 'backup holds the previous saves');
    const [bdl] = await Promise.all([p2b.waitForEvent('download'), p2b.locator('#bkdl').click()]); ok(/^gns-backup-/.test(bdl.suggestedFilename()), 'backup downloadable');
    await p2b.locator('#bkrestore').click(); await p2b.waitForSelector('#imp:not([hidden])'); await p2b.locator('#replace').click(); await p2b.waitForSelector('#impmsg:not([hidden])'); L = await ls(p2b);
    ok(L.ccs_gfx === 'high' && L.local_only === 'keepme' && !('ccs_save2' in L), 'Undo restores the backup');
    await p2b.screenshot({ path: SHOTS + '/import-done.png', fullPage: true });
    // replace
    const c3 = await mk(b), p3 = await pg(c3, 'replace', 'sync.html', errs); await seed(p3, { local_only: 'gone', ccs_gfx: 'high' }); await p3.reload();
    await p3.setInputFiles('#file', fpath); await p3.waitForSelector('#imp:not([hidden])'); ok(/remove 1 item that exists/.test(await p3.locator('#impnote').textContent()), 'replace warns: ' + await p3.locator('#impnote').textContent());
    await p3.locator('#replace').click(); await p3.waitForSelector('#impmsg:not([hidden])'); L = await ls(p3); delete L.gns_backup_last;
    ok(JSON.stringify(Object.keys(L).sort()) === JSON.stringify(Object.keys(SAVES).sort()) && L.ccs_gfx === 'low', 'Replace all: device matches the file exactly');
    ok(!!JSON.parse(await p3.evaluate(() => localStorage.getItem('gns_backup_last'))).data.local_only, 'Replace made a backup');
    // bad files
    for (const [name, content, re] of [['junk.json', 'not json', /not a saves file/], ['other.json', '{"app":"x","v":1,"data":{}}', /not from the Game Night/], ['bad.json', '{"app":"game-night-shelf","v":1,"data":{"a":5}}', /damaged/], ['new.json', '{"app":"game-night-shelf","v":9,"data":{}}', /newer/]]) {
      const fp = path.join(SHOTS, name); fs.writeFileSync(fp, content); await p3.setInputFiles('#file', fp); await p3.waitForFunction(r => new RegExp(r).test(document.getElementById('impmsg').textContent), re.source);
      ok(await p3.locator('#imp').isHidden(), 'bad file rejected: ' + (await p3.locator('#impmsg').textContent()).slice(0, 50));
    }
    ok(Object.keys(await ls(p3)).length >= 9, 'bad files changed nothing');
    await c2.close(); await c3.close();

    // ================= C. device to device =================
    console.log('--- device to device');
    const big = Array.from({ length: 120000 }, () => Math.random().toString(36).slice(2)).join(''); // ~ 500 KB of poorly compressible text
    const SEND = Object.assign({}, SAVES, { ccs_save2: big, shortfuse_save1: '{"w":1}' });
    const cs = await mk(b), cr = await mk(b);
    const ps2 = await pg(cs, 'sender', 'sync.html', errs), pr2 = await pg(cr, 'recv', 'sync.html', errs);
    await seed(ps2, SEND); await ps2.reload(); await seed(pr2, { local_only: 'mine', ccs_gfx: 'high' }); await pr2.reload();
    await ps2.locator('#send').click(); await ps2.waitForFunction(() => /^[A-Z2-9]{6}$/.test(document.getElementById('code').textContent));
    const code = await ps2.locator('#code').textContent(); ok(!/[O0I1L]/.test(code), 'unambiguous code ' + code);
    ok(await ps2.locator('#qr svg').count() === 1, 'QR drawn'); 
    await ps2.screenshot({ path: SHOTS + '/send-code.png', fullPage: true });
    await pr2.locator('#recv').click(); await pr2.locator('#rcode').fill(code.toLowerCase()); ok(await pr2.locator('#rcode').inputValue() === code, 'code typed lowercase is normalised'); await pr2.locator('#rgo').click();
    await pr2.waitForSelector('#accept:not([hidden])'); const at = await pr2.locator('#acctitle').textContent(); ok(/^Accept saves from .+\?$/.test(at) && /Linux PC|Chrome/.test(at), 'accept prompt: ' + at);
    await pr2.screenshot({ path: SHOTS + '/recv-accept.png', fullPage: true });
    // sample progress on both sides
    const rec = p => p.evaluate(() => { window.__w = []; const bar = document.getElementById('p2pbar'); new MutationObserver(() => window.__w.push(bar.firstElementChild.style.width)).observe(bar, { attributes: true, subtree: true, attributeFilter: ['style'] }); });
    await rec(ps2); await rec(pr2);
    await pr2.locator('#accyes').click(); await pr2.waitForSelector('#imp:not([hidden])', { timeout: 60000 });
    const mid = async p => (await p.evaluate(() => window.__w)).filter(w => w && w !== '0%' && w !== '100%').length;
    const midS = await mid(ps2), midR = await mid(pr2);
    ok(midS > 3 && midR > 3, 'progress bars moved (sender steps ' + midS + ', receiver ' + midR + ')');
    await pr2.screenshot({ path: SHOTS + '/recv-preview.png', fullPage: true });
    ok(/Linux PC|Chrome/.test(await pr2.locator('#imptitle').textContent()), 'preview names the sender: ' + await pr2.locator('#imptitle').textContent());
    await ps2.waitForFunction(() => /Sent \d+ items/.test(document.getElementById('p2pmsg').textContent), null, { timeout: 15000 }); ok(true, 'sender confirmed: ' + await ps2.locator('#p2pmsg').textContent());
    await pr2.locator('#merge').click(); await pr2.waitForSelector('#impmsg:not([hidden])'); L = await ls(pr2);
    ok(Object.keys(SEND).every(k => L[k] === SEND[k]) && L.local_only === 'mine', 'received saves merged (big value intact, ' + big.length + ' chars)');
    ok(!!L.gns_backup_last, 'backup made on the receiver');
    // QR-link flow + decline
    await ps2.locator('#send').click(); await ps2.waitForFunction(() => /^[A-Z2-9]{6}$/.test(document.getElementById('code').textContent)); const code2 = await ps2.locator('#code').textContent();
    const pr3 = await pg(cr, 'recv2', 'sync.html#receive=' + code2, errs); await pr3.waitForSelector('#accept:not([hidden])'); ok(true, 'QR link opens, finds the sender');
    await pr3.locator('#accno').click(); await ps2.waitForFunction(() => /declined/.test(document.getElementById('p2pmsg').textContent)); ok(true, 'decline reaches sender');
    ok(await pr3.locator('#imp').isHidden(), 'nothing imported after decline');
    // wrong code
    const cw = await mk(b, { flags: { SYNC_FIND_MS: 3000 } }), pw = await pg(cw, 'wrong', 'sync.html', errs);
    await pw.locator('#recv').click(); await pw.locator('#rcode').fill('AAAAAA'); await pw.locator('#rgo').click();
    await pw.waitForFunction(() => /No device is showing that code/.test(document.getElementById('p2pmsg').textContent), null, { timeout: 15000 }); ok(true, 'wrong code fails cleanly: ' + await pw.locator('#p2pmsg').textContent());
    await pw.locator('#rcode').fill('abc'); await pw.locator('#rgo').click(); ok(/6 letters/.test(await pw.locator('#p2pmsg').textContent()), 'short code rejected');
    await pw.screenshot({ path: SHOTS + '/recv-wrong.png', fullPage: true });
    // expiry
    const ce = await mk(b, { flags: { SYNC_EXPIRY_MS: 2500, SYNC_FIND_MS: 3000 } }), pe = await pg(ce, 'exp', 'sync.html', errs); await seed(pe, SAVES); await pe.reload();
    await pe.locator('#send').click(); await pe.waitForFunction(() => /^[A-Z2-9]{6}$/.test(document.getElementById('code').textContent)); const code3 = await pe.locator('#code').textContent();
    await pe.waitForFunction(() => /expired/.test(document.getElementById('p2pmsg').textContent), null, { timeout: 10000 }); ok(true, 'sender shows expiry: ' + await pe.locator('#p2pmsg').textContent());
    const pr4 = await pg(cw, 'late', 'sync.html', errs); await pr4.locator('#recv').click(); await pr4.locator('#rcode').fill(code3); await pr4.locator('#rgo').click();
    await pr4.waitForFunction(() => /No device is showing/.test(document.getElementById('p2pmsg').textContent), null, { timeout: 15000 }); ok(true, 'expired code fails cleanly on the receiver');
    // sender with nothing to send
    const cn = await mk(b), pn2 = await pg(cn, 'empty', 'sync.html', errs); await pn2.locator('#send').click(); ok(/no saves/.test(await pn2.locator('#p2pmsg').textContent()), 'empty sender is told');
    for (const c of [cs, cr, cw, ce, cn]) await c.close();

    // ================= D. layout =================
    console.log('--- layout');
    for (const [w, h, label, touch, dark] of [[390, 763, 'phone', true, true], [375, 553, 'small', true, false], [1366, 768, 'desktop', false, true]]) {
      const cl = await mk(b, { viewport: { width: w, height: h }, isMobile: touch, hasTouch: touch, colorScheme: dark ? 'dark' : 'light' }); const pl = await pg(cl, 'lay-' + label, 'sync.html', errs); await seed(pl, SAVES); await pl.reload();
      await pl.locator('#send').click(); await pl.waitForFunction(() => document.getElementById('code').textContent.length === 6);
      await pl.locator('#recv').click(); await pl.locator('#rcode').fill('ABC');
      await pl.evaluate(() => { document.getElementById('imptitle').textContent = 'x'; document.getElementById('imp').hidden = false; document.getElementById('implist').innerHTML = '<li><span>Crown City Smash</span><span>3 new · 2 overwritten</span></li>'; document.getElementById('impmsg').hidden = false; document.getElementById('impmsg').textContent = 'Merged: 5 items from Linux PC (Chrome). Your previous saves were backed up.'; });
      await sleep(300);
      const r = await pl.evaluate(() => {
        const sw = document.documentElement.scrollWidth, cw = document.documentElement.clientWidth, small = [], text = [];
        for (const el of document.querySelectorAll('a,button,input,label.btn,.sw')) { const b = el.getBoundingClientRect(); if (!b.width || !b.height || el.closest('[hidden]') || el.classList.contains('sr')) continue; if (b.height < 43.5 || b.width < 43.5) small.push((el.id || el.className || el.tagName) + ' ' + Math.round(b.width) + 'x' + Math.round(b.height)); }
        const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n; while ((n = w.nextNode())) { if (!n.textContent.trim() || !n.parentElement || n.parentElement.closest('[hidden],script,style')) continue; const cs = getComputedStyle(n.parentElement); if (parseFloat(cs.fontSize) < 12.99 && cs.display !== 'none') text.push(n.textContent.trim().slice(0, 30) + ' ' + cs.fontSize); }
        return { sw, cw, small, text };
      });
      ok(r.sw <= r.cw, label + ' no horizontal scroll (' + r.sw + '/' + r.cw + ')'); ok(!r.small.length, label + ' targets >=44px' + (r.small.length ? ': ' + r.small.join('; ') : '')); ok(!r.text.length, label + ' text >=13px' + (r.text.length ? ': ' + r.text.join('; ') : ''));
      await pl.screenshot({ path: SHOTS + '/layout-' + label + '.png', fullPage: true });
      const pl2 = await pg(cl, 'lay2-' + label, 'sync.html', errs); await sleep(300); await pl2.screenshot({ path: SHOTS + '/layout-' + label + '-top.png' }); await cl.close();
    }
  } catch (e) { fail('exception: ' + (e.stack || e).toString().split('\n').slice(0, 4).join(' / ')); }
  errs.forEach(e => fail(e));
  await b.close(); relay.kill(); server.close();
  console.log(problems + ' problems'); process.exit(problems ? 1 : 0);
})();
