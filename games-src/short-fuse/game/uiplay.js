// uiplay.js: plays a Short Fuse job to its result screen by TAPPING visible, uncovered UI only (touchscreen / mouse at element centres).
// The engine is read only to DECIDE (which wire, which number) and to wait; every state change goes through a real tap whose
// target is verified with elementFromPoint. Used by playable-test.js.
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function tapXY(p,x,y,touch){if(touch)await p.touchscreen.tap(x,y);else await p.mouse.click(x,y)}
// centre of an element that is really on top there (not covered); null when covered or off screen
const CENTRE=`(sel)=>{const e=typeof sel==='string'?document.querySelector(sel):sel;if(!e)return null;const r=e.getBoundingClientRect();if(r.width<4||r.height<4)return null;
  const x=Math.round(r.left+r.width/2),y=Math.round(r.top+r.height/2);if(x<0||y<0||x>innerWidth||y>innerHeight)return null;const t=document.elementFromPoint(x,y);if(!t||!(e===t||e.contains(t)||t.contains(e)))return {covered:true,x,y,by:(t&&(t.id||t.className)||'?')+''};return {x,y}}`;
async function tapSel(p,sel,touch,log){const c=await p.evaluate(`(${CENTRE})(${JSON.stringify(sel)})`);if(!c){return false}if(c.covered){if(log)log.push('covered '+sel+' by '+c.by);return false}await tapXY(p,c.x,c.y,touch);return true}
// choose the next UI action from the engine's own suggestion
const PLAN=`(()=>{if(!G||!UI.started)return {k:'none'};if(G.over)return {k:'over'};if(UI.brief)return {k:'brief'};const V=UI.V;if(!V||V.seat<0)return {k:'wait'};
  if(passTo()>=0)return {k:'pass'};
  if(V.q&&V.q.who===V.seat&&V.q.opts){const g=document.querySelector('#mine .tile.glow');if(g)return {k:'tap',sel:'#mine .tile[data-s="'+g.dataset.s+'"][data-k="'+g.dataset.k+'"]'};
    const ch=document.querySelector('#tray .chip');if(ch)return {k:'tap',sel:'#tray .chip'};return {k:'wait'}}
  if(decider()!==V.seat||!V.legal||G.q)return {k:'wait'};
  const m=aiMove(V.seat);if(!m)return {k:'wait'};
  if(m.a==='reveal'){const t=document.querySelector('#mine .tile.glow');return t?{k:'tap',sel:'#mine .tile.glow'}:{k:'wait'}}
  if(m.a==='solo'){const t=[...document.querySelectorAll('#mine .tile.glow')].find(e=>{const v=V.stands[+e.dataset.s].slots[+e.dataset.k];return v&&v.v===m.v});return t?{k:'tap',sel:'#mine .tile[data-s="'+t.dataset.s+'"][data-k="'+t.dataset.k+'"]'}:{k:'wait'}}
  if(m.a==='dual'&&!m.tool&&!m.two){
    if(UI.sel&&UI.sel.mode==='dual'&&UI.sel.tg.length===1&&UI.sel.tg[0].st===m.st&&UI.sel.tg[0].k===m.ks[0]){
      const t=[...document.querySelectorAll('#mine .tile')].find(e=>{const v=V.stands[+e.dataset.s].slots[+e.dataset.k];return v&&!v.cut&&v.v===m.v&&e.classList.contains('glow')});
      return t?{k:'tap',sel:'#mine .tile[data-s="'+t.dataset.s+'"][data-k="'+t.dataset.k+'"]'}:{k:'wait'}}
    return {k:'tap',sel:'#crew .tile[data-s="'+m.st+'"][data-k="'+m.ks[0]+'"]'}}
  // anything else (equipment, double cuts): fall back to the first glowing crew wire so the game always advances without a shortcut
  if(UI.sel&&UI.sel.mode==='dual'&&UI.sel.tg.length){const t=[...document.querySelectorAll('#mine .tile.glow')][0];return t?{k:'tap',sel:'#mine .tile[data-s="'+t.dataset.s+'"][data-k="'+t.dataset.k+'"]'}:{k:'wait'}}
  const c=document.querySelector('#crew .tile.glow');return c?{k:'tap',sel:'#crew .tile[data-s="'+c.dataset.s+'"][data-k="'+c.dataset.k+'"]'}:{k:'wait'}})()`;
// plays until the end card shows; returns {over, taps, covered:[...], steps}
async function playToEnd(p,{touch=true,maxMs=240000,onTurn,log=[]}={}){const t0=Date.now();let taps=0,idle=0,last='';const seen={};
  while(Date.now()-t0<maxMs){
    const pl=await p.evaluate(PLAN);
    if(pl.k==='over'){await sleep(600);const o=await p.evaluate(()=>({win:!!G.over.win,why:G.over.why||'',card:!!document.querySelector('#over:not([hidden]) .end')}));return Object.assign(o,{over:true,taps,log})}
    if(pl.k==='brief'){if(await tapSel(p,'[data-a=briefok]',touch,log)){taps++;await sleep(500)}else await sleep(300);continue}
    if(pl.k==='tap'){const ok=await tapSel(p,pl.sel,touch,log);if(ok){taps++;idle=0;await sleep(350)}else{idle++;await sleep(250)}
      if(idle>40){log.push('stuck tapping '+pl.sel);return {over:false,stuck:pl.sel,taps,log}}continue}
    await sleep(250);idle++;const st=await p.evaluate(()=>G?G.logN+':'+G.turn+':'+(G.q?G.q.kind:''):'');if(st!==last){last=st;idle=0}if(idle>160){log.push('no progress');return {over:false,stuck:'wait',taps,log}}
  }
  return {over:false,stuck:'time',taps,log}}
module.exports={sleep,tapSel,tapXY,CENTRE,playToEnd,PLAN};
