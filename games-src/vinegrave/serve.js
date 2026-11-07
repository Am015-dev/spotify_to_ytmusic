// Tiny static server for local tests: /vinegrave/ -> vinegrave.html, /vinegrave/media/... -> games/vinegrave/media (the deployed pictures).
const http = require('http'), fs = require('fs'), path = require('path');
const D = __dirname, REPO = path.resolve(D, '../..');
module.exports = () => new Promise(res => {
  const srv = http.createServer((q, r) => {
    const u = decodeURIComponent(q.url.split('?')[0]);
    let f = null;
    if (u === '/vinegrave/' || u === '/vinegrave/index.html') f = path.join(D, 'vinegrave.html');
    else if (u.startsWith('/vinegrave/')) f = path.join(REPO, 'games', u.slice(1));
    if (!f || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); r.end(); return; }
    const ext = path.extname(f); r.writeHead(200, { 'content-type': { '.html': 'text/html', '.webp': 'image/webp', '.mp3': 'audio/mpeg', '.js': 'text/javascript' }[ext] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r);
  });
  srv.listen(0, '127.0.0.1', () => res({ url: 'http://127.0.0.1:' + srv.address().port + '/vinegrave/', close: () => srv.close() }));
});
if (require.main === module) module.exports().then(s => console.log('GX_URL', s.url));
