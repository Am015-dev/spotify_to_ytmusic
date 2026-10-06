// Phone text diet: nothing on screen during play is longer than 8 words. A longer text block is cut to its first
// words and keeps the whole text in data-full; a long-press (about half a second) shows it in a small popup.
// Desktop (no html.ph) keeps the full text. The goal is "the board, not paragraphs": blocks with buttons, dice or
// SVG in them are never touched, and everything is idempotent (re-running changes nothing).
(function(){
const R=document.documentElement,MAXW=8,KEEP=7;
const words=t=>(t||'').replace(/[^a-zA-Z0-9'’]+/g,' ').trim().split(' ').filter(w=>/[a-z][a-z]/i.test(w));
const SKIP='button,a,input,select,textarea,svg,.die,[data-a],[data-act],[data-ph],[data-ship],[data-start],[data-mode],canvas,.gx-dock-head,.roadmap';
function cut(text,n){const toks=text.trim().split(/\s+/);let out=[],c=0;for(const t of toks){if(/[a-z][a-z]/i.test(t.replace(/[^a-zA-Z]/g,'')))c++;if(c>n)break;out.push(t)}return out.join(' ').replace(/[·,;:\-–—]+$/,'')+'…'}
function clamp(){if(!R.classList.contains('ph'))return;
  const roots=document.querySelectorAll('.gx-dock,#bf,#notice,#coach,.gxbanner,#banner');
  for(const root of roots){for(const e of root.querySelectorAll('*')){
    if(e.dataset&&e.dataset.tl)continue;if(e.matches(SKIP)||e.closest(SKIP.replace(',.gx-dock-head,.roadmap','')))continue;
    if(![...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim()))continue;
    if(e.querySelector(SKIP))continue;
    const full=(e.innerText||e.textContent||'').trim();if(words(full).length<=MAXW)continue;
    if(!e.dataset.full)e.dataset.full=e.dataset.full||full;
    e.textContent=cut(full,KEEP);e.dataset.tl='1';e.classList.add('tl')}}}
let q=0;const sched=()=>{if(q)return;q=requestAnimationFrame(()=>{q=0;try{clamp()}catch(e){console.warn('brief',e)}})};
function start(){try{const mo=new MutationObserver(sched);mo.observe(document.body,{childList:true,subtree:true,characterData:true})}catch(e){}sched()}
// ---- long-press popup ----
let tip=null,timer=0,shown=0;
function hide(){if(tip){tip.remove();tip=null}}
function show(text){hide();tip=document.createElement('div');tip.id='fulltip';tip.setAttribute('role','note');tip.textContent=text;document.body.appendChild(tip);shown=Date.now()}
document.addEventListener('pointerdown',e=>{clearTimeout(timer);if(tip&&Date.now()-shown>300){hide();return}
  const el=e.target.closest&&e.target.closest('[data-full]');if(!el)return;timer=setTimeout(()=>{show(el.dataset.full)},480)},true);
['pointerup','pointercancel','pointermove','scroll'].forEach(k=>document.addEventListener(k,e=>{if(k==='pointermove'&&e.pointerType==='mouse')return;clearTimeout(timer)},true));
document.addEventListener('contextmenu',e=>{if(e.target.closest&&e.target.closest('[data-full]'))e.preventDefault()},true);
document.addEventListener('click',e=>{if(tip&&Date.now()-shown>300){hide();e.stopPropagation()}},true);
window.BRIEF={clamp,show,hide,words};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
