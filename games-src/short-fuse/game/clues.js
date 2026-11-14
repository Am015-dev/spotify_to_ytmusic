// ===================== clues.js: help reading the table (rule-legal: only what you can see) =====================
// From your own wires, the cut wires, the info tokens, the "≠" marks and the Red at / Yellow at strip, work out what each crew wire
// can still be (the same deduction a careful player does in their head; no odds, no move grades). On your turn:
//  - pick one of your numbers: crew wires that cannot hold it go dim, a wire that must be it gets a green ring, "!" = might be red;
//  - pick a crew wire first: the line says what it can be ("Clues: 5, 6 or 7"), your numbers that cannot match go dim;
//  - a "safe to say" check: pointing at a dim wire or a "!" wire asks for a second tap first.
// Off in the tutorial and when Hints are off.
const CL={key:'',by:null,ok:null,css:0};
function clOn(){if(!G||G.over||!UI.started||UI.tut||UI.brief)return false;try{if(typeof GXH!=='undefined'&&GXH.enabled&&!GXH.enabled())return false}catch(e){}
  const V=UI.V;return !!(V&&V.seat>=0&&V.legal&&decider()===V.seat&&!(V.q&&V.q.who===V.seat))}
function clRead(){const V=UI.V;const key=G.mission+':'+G.logN+':'+G.turn+':'+V.seat;if(CL.key===key)return CL.by;CL.key=key;CL.by=null;CL.ok=null;
  try{const K=knowledge(V.seat);const Z=solve(K,240,mkRng((G.logN*7919+V.seat*104729+G.turn)>>>0),0,3);if(!Z.exact||!Z.samples.length)return null;
    const by={};Z.M.hid.forEach((h,i)=>{const st=K.stands.find(s=>s.i===h.st);if(!st||st.mine)return;const vals=new Set();for(const s of Z.samples)vals.add(s[i]);by[h.u]={vals}});CL.by=by}catch(e){CL.by=null}
  return CL.by}
const clName=c=>c===14?'red':c===13?'yellow':String(c);
function clList(vals){const a=[...vals].sort((x,y)=>x-y).filter(c=>c!==14).map(clName);if(!a.length)return 'red';const s=a.length>4?a[0]+' to '+a[a.length-1]:a.length===1?a[0]:a.slice(0,-1).join(', ')+' or '+a[a.length-1];return s}
function clSel(){const s=UI.sel;return s&&s.mode==='dual'&&!s.tool&&!s.two&&s.fu==null?s:null}
// a risky wire (might be red, or cannot be the picked number) does not glow while a sensible one does: it stays tappable (two-tap warning) as .rk
function clQuiet(sel){const all=[...document.querySelectorAll(sel)];const bad=e=>e.classList.contains('cl-no')||e.classList.contains('cl-red');if(!all.some(e=>!bad(e)))return;
  all.filter(bad).forEach(e=>{e.classList.remove('glow');e.classList.add('rk');if(!e.classList.contains('cl-red')&&!e.querySelector('.clm'))mark2(e)})}
function mark2(e){if(getComputedStyle(e).position==='static')e.style.position='relative';const i=document.createElement('i');i.className='clm';i.textContent='!';i.setAttribute('aria-hidden','true');e.appendChild(i)}
function clDecorate(){
  if(!CL.css){CL.css=1;const st=document.createElement('style');st.textContent=
    '#tb .tile.cl-no{opacity:.35;filter:saturate(.35)}#tb .tile.rk{opacity:.6;filter:saturate(.5);cursor:pointer}#tb .tile.rk.cl-no{opacity:.35}#tb .tile.cl-sure{outline:3px solid #8cf06a;outline-offset:-3px}'+
    '#tb .tile .clm{position:absolute;top:-7px;right:-7px;width:20px;height:20px;border-radius:50%;background:#e8322a;color:#fff;font:800 14px/20px system-ui,sans-serif;text-align:center;pointer-events:none;box-shadow:0 1px 3px rgba(0,0,0,.5);z-index:3;font-style:normal}'+
    '#tb .tile.cl-sure .clm{display:none}'+
    '#tb .tile .clv{position:absolute;left:0;right:0;bottom:2px;text-align:center;font:800 14px/16px system-ui,sans-serif;color:#fff;text-shadow:0 1px 2px #000,0 0 3px #000;pointer-events:none;font-style:normal;white-space:nowrap;letter-spacing:-.5px}';document.head.appendChild(st)}
  document.querySelectorAll('#tb .rk').forEach(e=>{e.classList.remove('rk');e.classList.add('glow')});document.querySelectorAll('#tb .cl-no,#tb .cl-sure,#tb .cl-red').forEach(e=>e.classList.remove('cl-no','cl-sure','cl-red'));document.querySelectorAll('#tb .clm,#tb .clv').forEach(e=>e.remove());
  if(!clOn())return;const by=clRead();if(!by)return;const sel=clSel();
  const mark=e=>{e.classList.add('cl-red');if(getComputedStyle(e).position==='static')e.style.position='relative';const i=document.createElement('i');i.className='clm';i.textContent='!';i.setAttribute('aria-hidden','true');e.appendChild(i)};
  if(sel&&sel.tg.length===1&&sel.v==null){const t=sel.tg[0];const c=by[G.st[t.st].w[t.k].u];if(!c)return;
    document.querySelectorAll('#mine .tile.glow.g-val').forEach(e=>{const sl=G.st[+e.dataset.s].w[+e.dataset.k];if(sl&&sl.v!=null&&!c.vals.has(CODE(sl.v)))e.classList.add('cl-no')});clQuiet('#mine .tile.glow.g-val');return}
  const code=sel&&sel.v!=null&&!sel.tg.length?CODE(sel.v):null;
  document.querySelectorAll('#crew .tile.glow.g-tgt').forEach(e=>{const c=by[+e.dataset.u];if(!c)return;
    if(code!=null){if(!c.vals.has(code))e.classList.add('cl-no');else if(c.vals.size===1)e.classList.add('cl-sure')}
    if(c.vals.has(14)&&!e.classList.contains('cl-no'))mark(e)});
  clQuiet('#crew .tile.glow.g-tgt');
  // a short note on every hidden crew wire the clues narrow to 1-3 values ("7", "5·6", "3-5"): the notes a careful player keeps
  document.querySelectorAll('#crew .tile.back:not(.cut)').forEach(e=>{const c=by[+e.dataset.u];if(!c)return;const t=clNote(c.vals);if(!t)return;
    if(getComputedStyle(e).position==='static')e.style.position='relative';const i=document.createElement('i');i.className='clv';i.textContent=t;i.setAttribute('aria-hidden','true');e.appendChild(i)})}
function clNote(vals){const a=[...vals].filter(c=>c!==14).sort((x,y)=>x-y);if(!a.length||a.length>3)return '';const n=c=>c===13?'Y':String(c);
  if(a.length===3){if(a[0]!==13&&a[2]!==13&&a[2]-a[0]===2)return n(a[0])+'-'+n(a[2]);return ''}return a.map(n).join('\u00b7')}
(function(){const o=refresh;refresh=function(){o();try{clDecorate()}catch(e){console.error(e)}}})();
(function(){const o=sayText;sayText=function(V){const t=o(V);try{if(!clOn())return t;const by=clRead();if(!by)return t;const sel=clSel();
    if(sel&&sel.tg.length===1&&sel.v==null){const tg=sel.tg[0];const c=by[G.st[tg.st].w[tg.k].u];if(c)return 'Clues: '+clList(c.vals)+(c.vals.has(14)?'. Might be red!':'. Not red.')}
    if(sel&&sel.v!=null&&!sel.tg.length)return 'Dim wires can’t be '+VNm(sel.v)+'. ! = maybe red.';
    if(!sel&&/^Your turn: tap a crew wire/.test(t)){const any=Object.values(by).some(c=>c.vals.has(14));return any?'Your turn. A ! wire might be red.':t}}catch(e){}return t}})();
// the "safe to say" check: a dim wire, or a wire that might be red, needs a second tap (each wire warns once per turn, so going
// back and forth between two wires never leaves every tap answered by a warning only)
document.addEventListener('click',e=>{if(!e.target.closest)return;const t=e.target.closest('#tb .tile.rk');if(!t||!clOn())return;
  const u=+t.dataset.u;const tk=G.turn+':'+G.logN;if(CL.okT!==tk){CL.okT=tk;CL.okS=new Set()}if(CL.okS.has(u))return;CL.okS.add(u);e.stopPropagation();e.preventDefault();
  const sel=clSel();const mine=t.classList.contains('mine');let msg;
  if(t.classList.contains('cl-no'))msg=mine?'Clues say that wire can’t match. Tap again to say it.':'Clues say it can’t be '+(sel&&sel.v!=null?VNm(sel.v):'that')+'. Tap again to point.';
  else msg='Careful: this one might be red. Tap again to point.';
  t.classList.remove('buzz');void t.offsetWidth;t.classList.add('buzz');setTimeout(()=>t.classList.remove('buzz'),700);
  const el=document.getElementById('say');if(el){el.textContent=msg;TBL.sayT=Date.now()+2500}try{sfx('select')}catch(_){}},true);
