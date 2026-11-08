// Phone text diet: nothing on screen during play is longer than 8 words. A longer text block is cut to its first
// words and keeps the whole text in data-full; a long-press (about half a second) shows it in a small popup.
// Desktop (no html.ph) keeps the full text. The goal is "the board, not paragraphs": blocks with buttons, dice or
// SVG in them are never touched, and everything is idempotent (re-running changes nothing).
(function(){
const R=document.documentElement,MAXW=8,KEEP=7;
const words=t=>(t||'').replace(/[^a-zA-Z0-9'’]+/g,' ').trim().split(' ').filter(w=>/[a-z][a-z]/i.test(w));
const SKIP='button,a,input,select,textarea,svg,.die,[data-a],[data-act],[data-ph],[data-ship],[data-start],[data-mode],canvas,.gx-dock-head,.roadmap,[data-keep],[data-keep] *';
function cut(text,n){const toks=text.trim().split(/\s+/);let out=[],c=0;for(const t of toks){if(/[a-z][a-z]/i.test(t.replace(/[^a-zA-Z]/g,'')))c++;if(c>n)break;out.push(t)}return out.join(' ').replace(/[·,;:\-–—]+$/,'')+'…'}
function clamp(){if(!R.classList.contains('ph'))return;
  const roots=document.querySelectorAll('.gx-dock,#bf,#notice,#coach,.gxbanner,#banner');
  for(const root of roots){for(const e of root.querySelectorAll('*')){
    if(e.dataset&&e.dataset.tl&&e.textContent===e.dataset.tl)continue;if(e.matches(SKIP)||e.closest('svg,canvas,.die'))continue;
    if(![...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim()))continue;
    if(e.querySelector(SKIP))continue;
    const full=(e.innerText||e.textContent||'').trim();if(words(full).length<=MAXW)continue;
    e.dataset.full=full;
    const cutT=cut(full,KEEP);e.textContent=cutT;e.dataset.tl=cutT;e.classList.add('tl')}}}
let busy=false,mo=null;
// owner rule (8 Nov): no phone text under 14 px. Any element whose own text renders smaller is raised to 14 px inline (keeps
// the size hierarchy above 14). Zero-size labels draw nothing and the F9 perf panel is a dev overlay: both are marked as not text.
function floor(){if(!R.classList.contains('ph'))return;const hud=document.getElementById('perfhud');if(hud)hud.setAttribute('data-fa-skip','');
  const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);const seen=new Set();
  for(let n;(n=w.nextNode());){const e=n.parentElement;if(!e||seen.has(e)||!n.nodeValue.trim()||e.closest('script,style,svg,[data-fa-skip]'))continue;seen.add(e);
    const f=parseFloat(getComputedStyle(e).fontSize);const bb=e.closest('.gx-bar>.btn');if(f===0||(bb&&parseFloat(getComputedStyle(bb).fontSize)===0)){e.setAttribute('data-fa-skip','');continue}if(f<14)e.style.setProperty('font-size','14px','important')}}
let ft=0;function run(){if(busy)return;busy=true;try{clamp();clearTimeout(ft);ft=setTimeout(()=>{busy=true;try{floor()}catch(e){}finally{busy=false;if(mo)mo.takeRecords()}},60)}catch(e){console.warn('brief',e)}finally{busy=false;if(mo)mo.takeRecords()}}
// a MutationObserver callback is a microtask: the text is cut before the browser paints or a test looks at it
function fix(e){if(!e||e.nodeType!==1||e.closest('script,style,svg,[data-fa-skip]'))return;if(e.closest('.gx-bar>.btn')&&parseFloat(getComputedStyle(e.closest('.gx-bar>.btn')).fontSize)===0){e.setAttribute('data-fa-skip','');return}if(e.id==='perfhud'){e.setAttribute('data-fa-skip','');return}const f=parseFloat(getComputedStyle(e).fontSize);if(f===0&&e.textContent.trim()){e.setAttribute('data-fa-skip','');return}if(f<14&&[...e.childNodes].some(n=>n.nodeType===3&&n.nodeValue.trim()))e.style.setProperty('font-size','14px','important')}
// added nodes are raised at once (before paint), the full sweep in floor() catches the rest
function floorRecs(recs){if(!R.classList.contains('ph'))return;for(const r of recs){const ns=r.type==='characterData'?[r.target.parentElement]:[...r.addedNodes];for(const n of ns){if(!n||n.nodeType!==1)continue;fix(n);n.querySelectorAll&&n.querySelectorAll('*').forEach(fix)}}}
function start(){try{mo=new MutationObserver(recs=>{try{floorRecs(recs)}catch(e){}run()});mo.observe(document.body,{childList:true,subtree:true,characterData:true})}catch(e){}run()}
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
