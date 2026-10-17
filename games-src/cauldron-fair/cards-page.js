// builds games/cauldron-fair/cards.html (all 24 fortune cards with their paintings) from src/data.js. Run from this folder: node cards-page.js
const fs = require('fs'), path = require('path');
const D = require('./src/data.js');
const OUT = path.join('..', '..', 'games', 'cauldron-fair');
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const SEC = [['Blue cards: last the whole day', 'blue'], ['Purple cards: happen at once', 'purple']];
let n = 0, missing = [], h = '';
for (const [title, kind] of SEC) {
  const cs = D.FORTUNE.filter(c => c.kind === kind); h += `<h2 class="${kind}">${title} <small>${cs.length}</small></h2><div class="grid">`;
  for (const c of cs) {
    n++; const f = 'fortune-' + c.id + '.webp', ok = fs.existsSync(path.join(OUT, 'media', f)); if (!ok) missing.push(c.name);
    const pic = ok ? `<img src="media/${f}" alt="${esc(c.name)}" loading="lazy" width="256" height="256">` : `<div class="ph" role="img" aria-label="No painting yet">${esc(c.name.charAt(0))}<small>painting soon</small></div>`;
    h += `<figure class="c ${kind}" data-s="${esc((c.name + ' ' + c.text + ' ' + kind).toLowerCase())}">${pic}<figcaption><b>${esc(c.name)}</b><em>${kind === 'blue' ? 'ALL DAY' : 'NOW'}</em><span>${esc(c.text)}</span></figcaption></figure>`;
  }
  h += '</div>';
}
const page = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>Cauldron Fair fortune cards</title>
<style>
:root{--bg:#241730;--card:#37254a;--fg:#fff6dc;--mut:#cbbbe0;--acc:#f2b81e;--line:#53396e}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.45 system-ui,-apple-system,"Segoe UI",sans-serif;padding:calc(16px + env(safe-area-inset-top)) 16px 28px}
h1{font-size:1.5rem;margin:0 0 4px}h2{font-size:1.15rem;margin:22px 0 8px;color:var(--acc)}h2.blue{color:#8fc0f5}h2.purple{color:#c9a4f0}h2 small{color:var(--mut);font-weight:400}p{color:var(--mut);margin:0 0 12px}
input{width:100%;font:inherit;padding:10px 12px;border-radius:10px;border:1px solid var(--line);background:var(--card);color:var(--fg);margin:0 0 6px;position:sticky;top:6px;z-index:2}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px}
.c{margin:0;background:var(--card);border:1px solid var(--line);border-radius:12px;overflow:hidden}.c[hidden]{display:none}
.c img,.ph{display:block;width:100%;height:auto;aspect-ratio:1;object-fit:cover;background:var(--bg)}
.ph{display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:3rem;color:var(--acc)}.ph small{font-size:.7rem;color:var(--mut)}
figcaption{padding:8px 10px 10px;display:grid;gap:3px;font-size:.82rem}figcaption b{font-size:.95rem}figcaption em{font-style:normal;font-weight:800;font-size:.72rem;letter-spacing:.04em}
.c.blue em{color:#8fc0f5}.c.purple em{color:#c9a4f0}figcaption span{color:var(--mut)}
a{color:var(--acc)}
</style></head><body>
<h1>Cauldron Fair: all ${n} fortune cards</h1>
<p><a href="index.html">&larr; Back to the game</a></p>
<input id="q" type="search" placeholder="Search cards" aria-label="Search cards">
${h}
<script>
var q=document.getElementById("q");q.addEventListener("input",function(){var v=q.value.trim().toLowerCase();document.querySelectorAll(".c").forEach(function(c){c.hidden=v&&c.dataset.s.indexOf(v)<0})})
</script></body></html>`;
fs.writeFileSync(path.join(OUT, 'cards.html'), page); console.log(n, 'cards; no painting:', missing.join(', ') || 'none');
