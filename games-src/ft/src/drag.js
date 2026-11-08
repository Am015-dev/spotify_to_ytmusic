// ===================== drag the real piece (W480): lift a tile's people by dragging them off it, drop them on a glowing neighbour =====================
// Taps still work (onTile). A drag from a glowing start tile lifts everyone, a ghost group follows the finger, glowing tiles light up under it,
// letting go on one drops a person there (snap + vibrate tick from go()). From a tile you are standing on, drag on to the next glowing tile.
const DRG={on:false,from:-1,x0:0,y0:0,ghost:null,over:-1,moved:false,until:0};
function drgTile(x,y){const e=document.elementFromPoint(x,y);const t=e&&e.closest?e.closest('#grid [data-tile]'):null;return t?+t.dataset.tile:-1}
function drgClear(){if(DRG.ghost){DRG.ghost.remove();DRG.ghost=null}document.querySelectorAll('#grid .dragover').forEach(e=>e.classList.remove('dragover'));DRG.on=false;DRG.from=-1;DRG.over=-1;DRG.moved=false;document.documentElement.classList.remove('dragging')}
function drgGhost(){if(!DRG.ghost){const g=document.createElement('div');g.className='dragghost';g.setAttribute('aria-hidden','true');g.setAttribute('data-help','');document.body.appendChild(g);DRG.ghost=g}
  const hand=G&&G.move?G.move.hand:[];DRG.ghost.innerHTML=hand.map(c=>mpHtml(c,true)).join('');return DRG.ghost}
document.addEventListener('pointerdown',e=>{
  if(e.button>0||!G||G.over||UI.modal||UI.chz||!me()||G.phase!=='turn'||G.step!=='move'||(G.q))return;
  const t=e.target.closest&&e.target.closest('#grid [data-tile]');if(!t)return;const i=+t.dataset.tile;
  const ok=G.move?G.move.at===i:UI.pick.includes(i);if(!ok)return;
  try{document.documentElement.setPointerCapture(e.pointerId)}catch(x){}   // the grid is redrawn on lift: keep the events
  DRG.pid=e.pointerId;DRG.on=true;DRG.from=i;DRG.x0=e.clientX;DRG.y0=e.clientY;DRG.moved=false;DRG.over=-1},true);
document.addEventListener('pointermove',e=>{
  if(!DRG.on)return;
  if(!DRG.moved){if(Math.hypot(e.clientX-DRG.x0,e.clientY-DRG.y0)<10)return;DRG.moved=true;document.documentElement.classList.add('dragging');
    if(!G.move){onTile(DRG.from)}      // lift everyone: the glowing tiles are now the first drops
    if(!G.move){drgClear();return}}
  const g=drgGhost();g.style.left=e.clientX+'px';g.style.top=e.clientY+'px';
  const j=drgTile(e.clientX,e.clientY);if(j!==DRG.over){document.querySelectorAll('#grid .dragover').forEach(x=>x.classList.remove('dragover'));DRG.over=j;
    if(j>=0&&UI.pick.includes(j)){const el=tileEl(j);if(el)el.classList.add('dragover');try{if(navigator.vibrate)navigator.vibrate(6)}catch(x){}}}
  e.preventDefault()},true);
function drgEnd(e){
  if(!DRG.on)return;const moved=DRG.moved;let j=-1;if(moved&&e.type==='pointerup')j=drgTile(e.clientX,e.clientY);
  const ok=moved&&j>=0&&G&&G.move&&UI.pick.includes(j);try{document.documentElement.releasePointerCapture(DRG.pid)}catch(x){}drgClear();
  if(moved)DRG.until=Date.now()+350;
  if(ok){onTile(j);requestAnimationFrame(()=>{const el=tileEl(j);if(el){el.classList.remove('snap');void el.offsetWidth;el.classList.add('snap')}})}}
document.addEventListener('pointerup',drgEnd,true);document.addEventListener('pointercancel',drgEnd,true);
document.addEventListener('click',e=>{if(Date.now()<DRG.until&&e.target.closest&&e.target.closest('#grid [data-tile]')){e.stopPropagation();e.preventDefault()}},true);
window.GXDRAG=DRG;
