// ===================== PC side panel: the last moves (W480 polish) =====================
// On a wide screen the wood under the score cards stays empty, so it lists the last few moves, newest on top, each with its player's colour.
// Phones do not show it (the instruction line already tells the current step).
const FEED={n:0,key:''};
function feedEl(){let e=document.getElementById('feed');if(!e){e=document.createElement('div');e.id='feed';e.setAttribute('data-help','');const bd=document.getElementById('bd');if(!bd)return null;bd.appendChild(e)}return e}
function feedRender(){const e=feedEl();if(!e)return;if(!G||G.over||G.phase==='bid'||!document.documentElement.classList.contains('land')){e.hidden=true;FEED.key='';return}   // the bid chips need that corner
  const rows=[];for(const l of G.log){if(l.c==='turn'||l.c==='round'||/opens for|coached/.test(l.t))continue;rows.push(l);if(rows.length>=6)break}
  const key=G.logN+':'+rows.length+':'+G.pl.length;e.hidden=!rows.length;if(e.dataset.k!==key||!e.firstChild){e.dataset.k=key}feedHtml(e,rows);feedPlace(e)}
function feedPlace(e){if((typeof PLQB!=='undefined'&&PLQB)||document.querySelector('.plpop')){e.style.visibility='hidden';return}   // a score pop is up: keep clear of it
    // between the status rows above and the buttons below, never over either
  let top=0;for(const id of ['seats','line','trk','trk2','whatbtn']){const x=document.getElementById(id);if(x&&!x.hidden&&x.getClientRects().length){const r=x.getBoundingClientRect();if(r.bottom>top&&r.left>innerWidth*.6)top=r.bottom}}
  let bot=innerHeight;for(const id of ['acts','mine']){const x=document.getElementById(id);if(x&&!x.hidden&&x.getClientRects().length){const r=x.getBoundingClientRect();if(r.top<bot&&r.height>4&&r.left>innerWidth*.6)bot=r.top}}
  const h=bot-top-24;if(h<130){e.style.visibility='hidden';return}e.style.visibility='';e.style.top=(top+10)+'px';e.style.bottom='auto';e.style.maxHeight=h+'px';while(e.scrollHeight>e.clientHeight+1&&e.querySelectorAll('.fd-row').length>1)e.lastElementChild.remove()}
function feedHtml(e,rows){
  const dot=t=>{for(const p of G.pl)if(t.indexOf(p.nm)>=0)return PCOL[p.i];return '#b0702a'};
  e.innerHTML='<h4>Last moves</h4>'+rows.map(l=>{const t=plShort(l.t).split(/\s+/).slice(0,12).join(' ');return `<div class="fd-row"><i class="fd-dot" style="background:${dot(l.t)}"></i><span>${esc(t)}</span></div>`}).join('')}
setInterval(()=>{try{if(G)feedRender()}catch(e){}},500);
(function(){const o=render;render=function(){o.apply(this,arguments);try{feedRender()}catch(e){console.error(e)}}})();
