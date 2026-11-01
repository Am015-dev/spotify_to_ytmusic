// Mainhattan Nightrun desktop shell (W298). Serves the packaged game folder (./game) on 127.0.0.1 and opens it in a window,
// so the service worker, music and pictures behave exactly like the web build. No network access is needed.
// Flags: --smoke=<png> saves a screenshot of the title after it has loaded, then quits (used by release/desktop/build.sh).
const { app, BrowserWindow, Menu } = require('electron');
const http = require('http'), fs = require('fs'), path = require('path');
const MIME = { html: 'text/html', js: 'text/javascript', json: 'application/json', webp: 'image/webp', png: 'image/png', mp3: 'audio/mpeg', webmanifest: 'application/manifest+json', txt: 'text/plain' };
const ROOT = path.join(__dirname, 'game');
const smoke = (process.argv.find(a => a.startsWith('--smoke=')) || '').slice(8);
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
function serve() {
  return new Promise(res => {
    const s = http.createServer((q, r) => {
      let u = decodeURIComponent(q.url.split('?')[0]); if (u === '/') u = '/index.html';
      const f = path.normalize(path.join(ROOT, u));
      if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.statusCode = 404; return r.end(); }
      r.setHeader('content-type', MIME[f.split('.').pop()] || 'application/octet-stream'); fs.createReadStream(f).pipe(r);
    }).listen(0, '127.0.0.1', () => res(s.address().port));
  });
}
app.whenReady().then(async () => {
  const port = await serve();
  Menu.setApplicationMenu(null);
  const w = new BrowserWindow({ width: 1280, height: 720, backgroundColor: '#050510', autoHideMenuBar: true, title: 'Mainhattan Nightrun', show: !smoke || true });
  w.webContents.on('before-input-event', (e, i) => { if (i.type === 'keyDown' && i.key === 'F11') { w.setFullScreen(!w.isFullScreen()); e.preventDefault(); } });
  await w.loadURL('http://127.0.0.1:' + port + '/index.html');
  if (smoke) {
    const t0 = Date.now();
    const ready = async () => w.webContents.executeJavaScript("!!window.__mnr && document.documentElement.classList.contains('rdy')").catch(() => false);
    while (!(await ready()) && Date.now() - t0 < 25000) await new Promise(r => setTimeout(r, 300));
    await new Promise(r => setTimeout(r, 3000));
    const img = await w.webContents.capturePage();
    fs.writeFileSync(smoke, img.toPNG());
    const info = await w.webContents.executeJavaScript("JSON.stringify({game:!!window.__mnr,title:!!document.getElementById('title')&&!document.getElementById('title').hidden})");
    console.log('SMOKE ' + info); app.quit();
  }
});
app.on('window-all-closed', () => app.quit());
