// builds games/hollowbough/cards.html (every card with its painting) from cards.json + art/. Run from this folder: node cards-page.js
const fs=require('fs'),path=require('path');
const man=JSON.parse(fs.readFileSync('art/manifest.json')).items;
const OUT=path.join('..','..','games','hollowbough'),IMG=path.join(OUT,'cards');fs.mkdirSync(IMG,{recursive:true});
const D=JSON.parse(fs.readFileSync('cards.json'));
const esc=s=>String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

const TY={traveler:'Travelers',production:'Production',destination:'Destinations',governance:'Governance',prosperity:'Prosperity'};
const cost=o=>Object.entries(o||{}).map(([k,v])=>v+' '+k).join(', ');
const K=D.cards.map(c=>({key:c.role,name:c.new_name,type:c.type,stat:[c.kind,cost(c.cost)&&'cost '+cost(c.cost),c.base_points+' pt'+(c.base_points===1?'':'s'),c.copies>1?c.copies+' copies':'1 copy',c.unique?'unique':''].filter(Boolean).join(' · '),text:c.new_text||''}));
const SEC=Object.keys(TY).map(t=>[TY[t],K.filter(c=>c.type===t)]);
let n=0,missing=[],h='';
for(const [title,cs] of SEC){if(!cs.length)continue;
  h+=`<h2>${title} <small>${cs.length}</small></h2><div class="grid">`;
  for(const c of cs){n++;const f=man[c.key]&&fs.existsSync(path.join('art',man[c.key]+'.webp'))?man[c.key]+'.webp':null;
    if(f)fs.copyFileSync(path.join('art',f),path.join(IMG,f));else missing.push(c.name);
    const pic=f?`<img src="cards/${f}" alt="${esc(c.name)}" loading="lazy" width="224" height="224">`:`<div class="ph" role="img" aria-label="No painting yet">${esc(c.name.charAt(0))}<small>painting soon</small></div>`;
    h+=`<figure class="c" data-s="${esc((c.name+' '+c.stat+' '+c.text+' '+title).toLowerCase())}">${pic}<figcaption><b>${esc(c.name)}</b>${c.stat?`<em>${esc(c.stat)}</em>`:''}<span>${esc(c.text)}</span></figcaption></figure>`}
  h+='</div>'}
const page=`<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>Hollowbough cards</title>
<style>
:root{--bg:#17201a;--card:#222e25;--fg:#f6ecd6;--mut:#b5c0a6;--acc:#e3b02e;--line:#36473a}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.45 system-ui,-apple-system,"Segoe UI",sans-serif;padding:calc(16px + env(safe-area-inset-top)) 16px 28px}
h1{font-size:1.5rem;margin:0 0 4px}h2{font-size:1.15rem;margin:22px 0 8px;color:var(--acc)}h2 small{color:var(--mut);font-weight:400}p{color:var(--mut);margin:0 0 12px}
input{width:100%;font:inherit;padding:10px 12px;border-radius:10px;border:1px solid var(--line);background:var(--card);color:var(--fg);margin:0 0 6px;position:sticky;top:6px;z-index:2}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px}
.c{margin:0;background:var(--card);border:1px solid var(--line);border-radius:12px;overflow:hidden}.c[hidden]{display:none}
.c img,.ph{display:block;width:100%;height:auto;aspect-ratio:1;object-fit:cover;background:var(--bg)}
.ph{display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:3rem;color:var(--acc);background:repeating-linear-gradient(45deg,var(--bg),var(--bg) 10px,var(--card) 10px,var(--card) 20px)}.ph small{font-size:.7rem;color:var(--mut)}
figcaption{padding:8px 10px 10px;display:grid;gap:3px;font-size:.82rem}figcaption b{font-size:.95rem}figcaption em{font-style:normal;color:var(--acc);font-weight:700}
figcaption span{color:var(--mut)}
a{color:var(--acc)}
</style></head><body>
<h1>Hollowbough: all ${n} cards</h1>
<p><a href="index.html">&larr; Back to the game</a></p>
<input id="q" type="search" placeholder="Search cards" aria-label="Search cards">
${h}
<script>
var q=document.getElementById("q");q.addEventListener("input",function(){var v=q.value.trim().toLowerCase();document.querySelectorAll(".c").forEach(function(c){c.hidden=v&&c.dataset.s.indexOf(v)<0})})
</script></body></html>`;
fs.writeFileSync(path.join(OUT,'cards.html'),page);console.log(n,'cards; no painting:',missing.join(', ')||'none');
