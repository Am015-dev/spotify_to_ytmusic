// builds games/doorkick-dungeon/cards.html (every card with its painting) from cards.js + art/. Run: node cards-page.js
const fs=require('fs'),path=require('path');
const C=new Function(fs.readFileSync('cards.js','utf8')+';return CARDS')();
const man=JSON.parse(fs.readFileSync('art/manifest.json')).items;
const OUT=path.join('..','..','games','doorkick-dungeon'),IMG=path.join(OUT,'cards');fs.mkdirSync(IMG,{recursive:true});
const SEC=[['monster','Monsters'],['item','Items'],['oneshot','One-shot treasure'],['level','Level cards'],['curse','Curses'],['class','Classes'],['race','Races'],['special','Specials'],['enh','Monster boosts']];
const esc=s=>String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const stat=c=>c.t==='monster'?`Level ${c.lvl} · ${c.tr} treasure${c.tr>1?'s':''}`+(c.lv>1?` · ${c.lv} levels`:''):c.t==='item'?[c.b?'+'+c.b:'',c.slot||(c.hands?c.hands+' hand'+(c.hands>1?'s':''):''),c.g?c.g+' gold':''].filter(Boolean).join(' · '):c.t==='oneshot'?[c.b?'+'+c.b:'',c.g?c.g+' gold':''].filter(Boolean).join(' · '):'';
let n=0,h='';
for(const [t,title] of SEC){const cs=C.filter(c=>c.t===t);if(!cs.length)continue;
  h+=`<h2>${title} <small>${cs.length}</small></h2><div class="grid">`;
  for(const c of cs){const f=man[c.k]+'.webp';fs.copyFileSync(path.join('art',f),path.join(IMG,f));n++;
    h+=`<figure class="c" data-s="${esc((c.n+' '+(c.x||'')+' '+(c.badt||'')).toLowerCase())}"><img src="cards/${f}" alt="${esc(c.n)}" loading="lazy" width="224" height="224"><figcaption><b>${esc(c.n)}</b>${stat(c)?`<em>${esc(stat(c))}</em>`:''}<span>${esc(c.x||'')}</span>${c.badt?`<span class="bad">Bad stuff: ${esc(c.badt)}</span>`:''}</figcaption></figure>`}
  h+='</div>'}
const page=`<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>Doorkick Dungeon cards</title>
<style>
:root{--bg:#1d1712;--card:#2a221b;--fg:#f3e9da;--mut:#bba98f;--acc:#f0b04a;--red:#f09a8a;--line:#3d3227}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.45 system-ui,-apple-system,"Segoe UI",sans-serif;padding:calc(16px + env(safe-area-inset-top)) 16px 28px}
h1{font-size:1.5rem;margin:0 0 4px}h2{font-size:1.15rem;margin:22px 0 8px;color:var(--acc)}h2 small{color:var(--mut);font-weight:400}p{color:var(--mut);margin:0 0 12px}
input{width:100%;font:inherit;padding:10px 12px;border-radius:10px;border:1px solid var(--line);background:var(--card);color:var(--fg);margin:0 0 6px;position:sticky;top:6px;z-index:2}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px}
.c{margin:0;background:var(--card);border:1px solid var(--line);border-radius:12px;overflow:hidden}.c[hidden]{display:none}
.c img{display:block;width:100%;height:auto;aspect-ratio:1;object-fit:cover;background:#120e0a}
figcaption{padding:8px 10px 10px;display:grid;gap:3px;font-size:.82rem}figcaption b{font-size:.95rem}figcaption em{font-style:normal;color:var(--acc);font-weight:700}
figcaption span{color:var(--mut)}figcaption .bad{color:var(--red)}
a{color:var(--acc)}
</style></head><body>
<h1>Doorkick Dungeon: all ${n} cards</h1>
<p>Every card with its painting. <a href="./">Play the game</a> · <a href="../previews.html">Game status</a></p>
<input id="q" type="search" placeholder="Search cards" aria-label="Search cards">
${h}
<script>
var q=document.getElementById("q");q.addEventListener("input",function(){var v=q.value.trim().toLowerCase();document.querySelectorAll(".c").forEach(function(c){c.hidden=v&&c.dataset.s.indexOf(v)<0})})
</script></body></html>`;
fs.writeFileSync(path.join(OUT,'cards.html'),page);console.log(n,'cards',page.length);
