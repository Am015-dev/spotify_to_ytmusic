<title>Overdrive Shot Wall</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,800&family=IBM+Plex+Sans:wght@400;600&family=IBM+Plex+Mono:wght@500&display=swap">
<style>
/* Layout: sticky worker strip on top, one section per worker, thumbnails in an auto-fill grid; click opens a full-screen viewer */
:root{
 --bg:#f3f4f7;--panel:#ffffff;--fg:#16181f;--muted:#5d6273;--line:#dfe2ea;--accent:#d8231f;--stud:#ffcf1a;
 --display:"Bricolage Grotesque",system-ui,sans-serif;--body:"IBM Plex Sans",system-ui,sans-serif;--mono:"IBM Plex Mono",ui-monospace,monospace;
}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#111318;--panel:#1a1d24;--fg:#eef0f5;--muted:#9aa0b2;--line:#2a2e38;--accent:#ff4a3d;--stud:#ffd43b;color-scheme:dark}}
:root[data-theme="dark"]{--bg:#111318;--panel:#1a1d24;--fg:#eef0f5;--muted:#9aa0b2;--line:#2a2e38;--accent:#ff4a3d;--stud:#ffd43b;color-scheme:dark}
body{background:var(--bg);color:var(--fg);font-family:var(--body);font-size:15px;line-height:1.45}
.wrap{max-width:1400px;margin:0 auto;padding-inline:16px;padding-block:20px 60px}
header h1{font-family:var(--display);font-weight:800;font-size:clamp(28px,5vw,44px);margin:0;letter-spacing:-.01em;text-wrap:balance}
header h1 b{color:var(--accent)}
header p{color:var(--muted);margin:6px 0 0;max-width:65ch}
.strip{position:sticky;top:env(safe-area-inset-top,0px);z-index:5;background:var(--bg);border-bottom:1px solid var(--line);margin-top:16px}
.strip nav{display:flex;gap:6px;overflow-x:auto;padding-block:10px;scrollbar-width:thin}
.strip a{flex:none;font:600 13px var(--body);color:var(--fg);text-decoration:none;border:1px solid var(--line);background:var(--panel);border-radius:999px;padding:6px 12px;display:flex;gap:6px;align-items:center}
.strip a span{font-family:var(--mono);color:var(--muted);font-size:12px}
.strip a:hover,.strip a:focus-visible{border-color:var(--accent);outline:none}
section{padding-top:28px;scroll-margin-top:64px}
section>h2{font-family:var(--display);font-weight:800;font-size:24px;margin:0;display:flex;align-items:baseline;gap:10px;flex-wrap:wrap}
section>h2::before{content:"";width:14px;height:14px;border-radius:50%;background:var(--stud);box-shadow:inset 0 -2px 0 rgba(0,0,0,.18);align-self:center}
section>h2 small{font:500 13px var(--mono);color:var(--muted)}
section>p{color:var(--muted);margin:4px 0 0}
h3{font:500 12px var(--mono);text-transform:uppercase;letter-spacing:.06em;color:var(--muted);margin:18px 0 8px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:10px}
.shot{all:unset;cursor:zoom-in;display:flex;flex-direction:column;background:var(--panel);border:1px solid var(--line);border-radius:6px;overflow:hidden;min-width:0}
.shot:focus-visible,.shot:hover{border-color:var(--accent)}
.shot img{display:block;width:100%;aspect-ratio:852/393;object-fit:cover;background:var(--line)}
.shot span{font:500 12px var(--mono);padding:6px 8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--fg)}
.view{position:fixed;inset:0;z-index:20;background:rgba(8,9,12,.94);display:grid;grid-template-rows:auto 1fr auto;padding:calc(env(safe-area-inset-top,0px) + 10px) 16px calc(env(safe-area-inset-bottom,0px) + 10px)}
.view .top{display:flex;gap:10px;align-items:center;color:#eef0f5;min-width:0}
.view .top div{flex:1;min-width:0;font:500 13px var(--mono);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.view img{max-width:100%;max-height:100%;margin:auto;object-fit:contain;align-self:center;justify-self:center;min-height:0}
.view .nav{display:flex;justify-content:center;gap:10px}
.view button{font:600 14px var(--body);background:#262a33;color:#eef0f5;border:1px solid #3a3f4b;border-radius:6px;padding:8px 14px;cursor:pointer}
.view button:focus-visible{outline:2px solid var(--stud)}
</style>
<div class="wrap">
<header><h1>Overdrive <b>Shot Wall</b></h1><p>Every screenshot the workers took for the LEGO model work, grouped by worker. Tap a shot to open it; use ← → to page through a worker's shots.</p></header>
<div class="strip"><nav id="nav"></nav></div>
<main id="main"></main>
</div>
<div class="view" id="view" hidden><div class="top"><div id="vcap"></div><button id="vclose" type="button">Close</button></div><img id="vimg" alt=""><div class="nav"><button id="vprev" type="button">← Prev</button><button id="vnext" type="button">Next →</button></div></div>
<script>
const DATA=__DATA__;
const nav=document.getElementById('nav'),main=document.getElementById('main');
let flat=[];
DATA.forEach(s=>{
 const count=s.groups.reduce((a,g)=>a+g.items.length,0);
 const a=document.createElement('a');a.href='#'+s.key;a.innerHTML=`${s.who.split(' (')[0]} <span>${count}</span>`;nav.append(a);
 const sec=document.createElement('section');sec.id=s.key;
 sec.innerHTML=`<h2>${s.who} <small>${count} shots</small></h2><p>${s.what}</p>`;
 s.groups.forEach(g=>{
  const h=document.createElement('h3');h.textContent=g.folder+' · '+g.items.length;sec.append(h);
  const grid=document.createElement('div');grid.className='grid';
  g.items.forEach(it=>{const i=flat.length;flat.push({...it,sec:s.who,folder:g.folder});
   const b=document.createElement('button');b.className='shot';b.type='button';
   b.innerHTML=`<img loading="lazy" src="${it.src}" alt="${it.name}"><span>${it.name}</span>`;b.onclick=()=>open(i);grid.append(b)});
  sec.append(grid)});
 main.append(sec)});
const v=document.getElementById('view'),vi=document.getElementById('vimg'),vc=document.getElementById('vcap');let cur=0;
function open(i){cur=(i+flat.length)%flat.length;const it=flat[cur];vi.src=it.src;vi.alt=it.name;vc.textContent=`${cur+1}/${flat.length} · ${it.sec.split(' (')[0]} · ${it.folder} · ${it.name}`;v.hidden=false}
document.getElementById('vclose').onclick=()=>v.hidden=true;
document.getElementById('vprev').onclick=()=>open(cur-1);document.getElementById('vnext').onclick=()=>open(cur+1);
v.onclick=e=>{if(e.target===v||e.target===vi)v.hidden=true};
addEventListener('keydown',e=>{if(v.hidden)return;if(e.key==='Escape')v.hidden=true;if(e.key==='ArrowLeft')open(cur-1);if(e.key==='ArrowRight')open(cur+1)});
</script>
