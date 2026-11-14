// One-helper sampler (R57). Injected with addInitScript: every second it records which kinds of helper are VISIBLY on screen, judged by
// computed style (a gold drop-shadow / box-shadow / lit ring), not by class names, plus every running animation with Infinity iterations.
// Kinds: hand (playable-card glow), suggest (the suggested card), target (spot / region / location / Kingdom Card glow),
// bubble (coach, hint or tutorial bubble together with ITS own pointer: ring, finger, spotlight), button (a highlighted button).
// summary(samples) -> {n, max, multi, combos, loops, loopNames}
function inPage(){
  window.__tbHS=[];window.__tbHSmark=0;
  const vis=e=>{if(!e||!e.isConnected)return false;const r=e.getBoundingClientRect();if(!r.width||!r.height||r.bottom<0||r.top>innerHeight||r.right<0||r.left>innerWidth)return false;
    for(let a=e;a&&a.nodeType===1;a=a.parentElement){const c=getComputedStyle(a);if(c.display==='none'||c.visibility==='hidden'||+c.opacity<0.05)return false}return true};
  const glowF=e=>{if(!e)return false;const f=getComputedStyle(e).filter;return !!f&&f!=='none'&&/drop-shadow\(rgb\(255, 2[0-5][0-9], [0-9]+\)/.test(f)};   // a GOLD glow (the game's help colour), not a plain shadow
  const lit=e=>{const c=getComputedStyle(e);return c.boxShadow&&c.boxShadow!=='none'};
  function sample(){try{const H=new Set(),D={};const desc=e=>(e.id?'#'+e.id:'')+'.'+String((e.className&&(e.className.baseVal!=null?e.className.baseVal:e.className))||e.tagName).replace(/\s+/g,'.').slice(0,40);const add=(k,e)=>{if(!H.has(k)){H.add(k);D[k]=desc(e)}};
    for(const e of document.querySelectorAll('#handw .hc')){if(!vis(e))continue;const s=e.querySelector('svg');if(glowF(s))add(e.classList.contains('rg')?'suggest':'hand',e)}
    for(const e of document.querySelectorAll('.kcb')){if(!vis(e))continue;if([...e.children].some(glowF)||glowF(e.querySelector('svg')))add(e.classList.contains('rg')?'suggest':'target',e)}
    for(const e of document.querySelectorAll('.bspot')){if(vis(e)&&lit(e))add('target',e)}
    for(const e of document.querySelectorAll('.tbx-pan g[data-reg] rect')){if(!vis(e))continue;const c=getComputedStyle(e);if(parseFloat(c.strokeWidth)>=6&&+c.strokeOpacity>0.4)add('target',e.parentNode)}
    for(const e of document.querySelectorAll('.tb-map .tb-loc.glow .tb-ring, .tb-map .tb-loc.rec .tb-ring')){if(vis(e)&&+getComputedStyle(e).opacity>0.5)add('target',e.parentNode)}
    for(const e of document.querySelectorAll('.gxh-bub.on, .gxt-bub, .gxt-ring, .gxh-ring, .gxh-finger')){if(vis(e)){add('bubble',e);break}}
    {const f=document.getElementById('finger');if(f&&!f.hidden&&vis(f))add('bubble',f)}
    for(const e of document.querySelectorAll('.coachhl, .pulse')){if(vis(e)){add('button',e);break}}
    const loops=document.getAnimations().filter(a=>a.playState==='running'&&a.effect&&a.effect.getTiming().iterations===Infinity).map(a=>{const t=a.effect.target;return (a.animationName||a.id||'anim')+'@'+(t?(t.id?'#'+t.id:String((t.className&&(t.className.baseVal!=null?t.className.baseVal:t.className))||t.tagName)).slice(0,24):'')});
    const tut=typeof GXT!=='undefined'&&GXT.state&&(()=>{try{return !!GXT.state().active}catch(e){return false}})();
    window.__tbHS.push({t:Date.now(),H:[...H],D,loops,tut,mark:window.__tbHSmark});if(window.__tbHS.length>4000)window.__tbHS.shift()}catch(e){}}
  setInterval(sample,1000);window.__tbSample=sample}
function summary(S){const multi=S.filter(r=>r.H.length>1),combos={};for(const r of multi){const k=r.H.slice().sort().join('+');combos[k]=(combos[k]||0)+1;if(!combos[k+' e.g.'])combos[k+' e.g.']=JSON.stringify(r.D)+(r.tut?' (tutorial on)':'')}
  const lp=S.filter(r=>r.loops.length),loopNames={};lp.forEach(r=>r.loops.forEach(n=>loopNames[n]=(loopNames[n]||0)+1));
  const kinds={};S.forEach(r=>r.H.forEach(k=>kinds[k]=(kinds[k]||0)+1));
  return {kinds,n:S.length,max:Math.max(0,...S.map(r=>r.H.length)),multi:multi.length,combos,loops:lp.length,loopNames}}
const line=(tag,s)=>'HELPERS '+tag+': samples '+s.n+' maxHelpers '+s.max+' multiSamples '+s.multi+' '+JSON.stringify(s.combos)+' seen '+JSON.stringify(s.kinds)+' | infinite-loop samples '+s.loops+' '+JSON.stringify(s.loopNames);
module.exports={inPage,summary,line};
