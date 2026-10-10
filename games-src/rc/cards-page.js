// builds games/shipwreck-isle/cards.html (beasts, inventions and items with their paintings) from data.js. Run from this folder: node cards-page.js
const fs=require('fs'),path=require('path'),vm=require('vm');
const OUT=path.join('..','..','games','shipwreck-isle');
const ctx={};vm.createContext(ctx);
vm.runInContext(fs.readFileSync('data-gen.js','utf8')+'\n'+fs.readFileSync('data.js','utf8')+';this.O={BEASTS,INVENTIONS,ITEMS,BEAST_SP:typeof BEAST_SP!=="undefined"?BEAST_SP:{},CHARS:typeof CHARS!=="undefined"?CHARS:{}}',ctx);
const {BEASTS,INVENTIONS,ITEMS,BEAST_SP,CHARS}=ctx.O;
const esc=s=>String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const SP={disc:'draw a discovery token after the fight',wound1:'1 extra wound whatever your weapon',nomed2:'2 more wounds unless you have Medicine'};
const RN={wood:'wood',fur:'fur',food:'food'};
const need=I=>{const p=[];if(I.t)p.push(I.t+' tile');for(const it of I.it||[])p.push((INVENTIONS[it]||{}).n||it);const r=I.alt?I.alt.map(o=>Object.entries(o).map(([k,n])=>n+' '+(RN[k]||k)).join(' + ')).join(' or '):I.r?Object.entries(I.r).map(([k,n])=>n+' '+(RN[k]||k)).join(' + '):'';if(r)p.push(r);return p.join(', ')||'nothing'};
const SEC=[
 ['Beasts',BEASTS.map(b=>({art:'beast-'+b.k,name:b.n,stat:`Strength ${b.str} · weapon −${b.wl} · ${b.food} food${b.fur?' + '+b.fur+' fur':''}`,text:BEAST_SP[b.k]?SP[BEAST_SP[b.k]]||'':''}))],
 ['Inventions',Object.entries(INVENTIONS).map(([k,I])=>({art:'inv-'+k,name:I.n,stat:(I.kind==='start'?'starting invention':I.kind==='personal'?'own invention of the '+(CHARS[I.owner]||{n:I.owner}).n:'invention')+' · needs '+need(I),text:I.x||''}))],
 ['Items',Object.entries(ITEMS).map(([k,I])=>({art:'item-'+k,name:I.n,stat:'starting item · 2 uses',text:I.x||''}))]];
let n=0,missing=[],h='';
for(const [title,cs] of SEC){h+=`<h2>${title} <small>${cs.length}</small></h2><div class="grid">`;
  for(const c of cs){n++;const ok=fs.existsSync(path.join('art',c.art+'.webp'));if(!ok)missing.push(c.name);
    const pic=ok?`<img src="art/${c.art}.webp" alt="${esc(c.name)}" loading="lazy" width="224" height="224">`:`<div class="ph" role="img" aria-label="No painting yet">${esc(c.name.charAt(0))}<small>painting soon</small></div>`;
    h+=`<figure class="c" data-s="${esc((c.name+' '+c.stat+' '+c.text+' '+title).toLowerCase())}">${pic}<figcaption><b>${esc(c.name)}</b><em>${esc(c.stat)}</em><span>${esc(c.text)}</span></figcaption></figure>`}
  h+='</div>'}
const page=`<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>Shipwreck Isle cards</title>
<style>
:root{--bg:#10282b;--card:#17383c;--fg:#f6ecd6;--mut:#a9c3bb;--acc:#f0c15a;--line:#2d5a5c}
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
<h1>Shipwreck Isle: ${n} cards</h1>
<p><a href="index.html">&larr; Back to the game</a> · Paintings painted by Am015-dev.</p>
<input id="q" type="search" placeholder="Search cards" aria-label="Search cards">
${h}
<script>
var q=document.getElementById("q");q.addEventListener("input",function(){var v=q.value.trim().toLowerCase();document.querySelectorAll(".c").forEach(function(c){c.hidden=v&&c.dataset.s.indexOf(v)<0})})
</script></body></html>`;
fs.writeFileSync(path.join(OUT,'cards.html'),page);console.log(n,'cards; no painting:',missing.join(', ')||'none');
