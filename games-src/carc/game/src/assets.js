// ---------- every owner file is used or ready: rival portraits on the turn line, then an idle cache warm-up ----------
// The camp-* portraits are the computer rivals' faces (turn line). Everything else in media/ and models/ (Story map nodes, panels,
// bubbles, pieces) loads in small idle batches after the first screen, and the music tracks are fetched one by one later, so Story
// mode, the result card and the Music picker open without a wait. Data saver on = no music warm-up.
const RIVAL_PIC=['hob','ferro','mabry','dulcie','wren','corvin','isolde','quill','ostrand','baron','garnet'];
function rivalPic(p){if(!p||p.human)return '';if(UI.coach&&typeof STORY!=='undefined')return STORY.rival.img;const nm=String(p.nm||'').toLowerCase(),hit=RIVAL_PIC.find(k=>nm.includes(k));return MEDIA+'camp-'+(hit||RIVAL_PIC[(p.i-1+RIVAL_PIC.length)%RIVAL_PIC.length])+'.webp'}
(function(){const o=say;say=function(t,tn,rc){o.apply(this,arguments);try{const p=G&&G.cur&&!G.over?P(G.cur.p):null,u=PAINT_ON&&rivalPic(p),b=document.querySelector('#status .tn');if(u&&b){const i=document.createElement('img');i.className='tpic';i.alt='';i.src=u;b.insertBefore(i,b.firstChild)}}catch(e){}}})();
function assetsWarm(){const L=MEDIA_FILES.filter(f=>/\.webp$/.test(f)).map(f=>MEDIA+f).concat((typeof MODEL_FILES!=='undefined'?MODEL_FILES:[]).filter(f=>/\.webp$/.test(f)).map(f=>'models/'+f));
  const next=()=>{L.splice(0,6).forEach(f=>{const i=new Image();i.decoding='async';i.src=f});if(L.length)setTimeout(next,160);else setTimeout(musicWarm,2500)};next()}
function musicWarm(){let save=false;try{save=!!(navigator.connection&&navigator.connection.saveData)}catch(e){}if(save||typeof fetch!=='function'||typeof GA_DATA==='undefined')return;
  const M=[].concat(...Object.values(GA_DATA).map(o=>o&&typeof o==='object'?Object.values(o):[])).filter(v=>typeof v==='string'&&/^url:music\//.test(v)).map(v=>v.slice(4));let i=0;const one=()=>{if(i>=M.length)return;fetch(M[i++]).then(r=>r.blob()).catch(()=>{}).finally(()=>setTimeout(one,1500))};one()}
if(document.readyState==='complete')setTimeout(assetsWarm,1200);else addEventListener('load',()=>setTimeout(assetsWarm,1200));
