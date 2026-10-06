// Phone text diet: nothing on screen during play is longer than 8 words. A longer text block is cut to its first
// words and keeps the whole text in data-full; a long-press (about half a second) shows it in a small popup.
// Desktop (no html.ph) keeps the full text. The goal is "the board, not paragraphs": blocks with buttons, dice or
// SVG in them are never touched, and everything is idempotent (re-running changes nothing).
(function(){
const R=document.documentElement,MAXW=8,KEEP=7;
const words=t=>(t||'').replace(/[^a-zA-Z0-9'’]+/g,' ').trim().split(' ').filter(w=>/[a-z][a-z]/i.test(w));
const SKIP='button,a,input,select,textarea,svg,.die,[data-act],[data-opt],[data-shop],[data-start],[data-mode],[data-camp],canvas,.gx-dock-head,.pchip';
function cut(text,n){const toks=text.trim().split(/\s+/);let out=[],c=0;for(const t of toks){if(/[a-z][a-z]/i.test(t.replace(/[^a-zA-Z]/g,'')))c++;if(c>n)break;out.push(t)}return out.join(' ').replace(/[·,;:\-–—]+$/,'')+'…'}
function clamp(){if(!R.classList.contains('ph'))return;
  const roots=document.querySelectorAll('.gx-dock,#bfx,#btip,#bmarks,#moment,#advice,#choice,#coach,#news,#banner,#preview,.tip,#pmsg');
  for(const root of roots){for(const e of root.querySelectorAll('*')){
    if(e.dataset&&e.dataset.tl&&e.textContent===e.dataset.tl)continue;if(e.matches(SKIP)||e.closest(SKIP.replace(',.gx-dock-head,.pchip','').replace('svg,','')))continue;
    if(![...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim()))continue;
    if(e.querySelector(SKIP.replace('svg,','')))continue;
    const full=(e.innerText||e.textContent||'').trim();if(words(full).length<=MAXW)continue;
    e.dataset.full=full;
    const cutT=cut(full,KEEP);e.textContent=cutT;e.dataset.tl=cutT;e.classList.add('tl')}}}
let busy=false,mo=null;
function run(){if(busy)return;busy=true;try{clamp()}catch(e){console.warn('brief',e)}finally{busy=false;if(mo)mo.takeRecords()}}
// a MutationObserver callback is a microtask: the text is cut before the browser paints or a test looks at it
function start(){try{mo=new MutationObserver(run);mo.observe(document.body,{childList:true,subtree:true,characterData:true})}catch(e){}run()}
// ---- long-press popup ----
let tip=null,timer=0,shown=0;
function hide(){if(tip){tip.remove();tip=null}}
function show(text){hide();tip=document.createElement('div');tip.id='fulltip';tip.setAttribute('role','note');tip.textContent=text;document.body.appendChild(tip);shown=Date.now()}
document.addEventListener('pointerdown',e=>{clearTimeout(timer);if(tip&&Date.now()-shown>300){hide();return}
  const el=e.target.closest&&e.target.closest('[data-full]');if(!el)return;timer=setTimeout(()=>{show(el.dataset.full)},480)},true);
['pointerup','pointercancel','pointermove','scroll'].forEach(k=>document.addEventListener(k,e=>{if(k==='pointermove'&&e.pointerType==='mouse')return;clearTimeout(timer)},true));
document.addEventListener('contextmenu',e=>{if(e.target.closest&&e.target.closest('[data-full]'))e.preventDefault()},true);
document.addEventListener('click',e=>{if(tip&&Date.now()-shown>300){hide();e.stopPropagation()}},true);
window.BRIEF={clamp:run,show,hide,words};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
