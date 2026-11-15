// One-helper sampler (R57). Injected with addInitScript: every second it records which kinds of helper are VISIBLY on screen, judged by
// help CLASSES (F14: the old gold-filter test missed every current glow), minus glows the page's CSS has switched off, plus every running animation with Infinity iterations.
// Counted kinds: suggest (the suggested move: its .rg card, .rec/.rrec spot, the ghost finger), bubble2 (a bubble pointing at two places),
// Not counted (affordance, as on the shelf's calm games): legal (every other visible .glow / .rglow), reported as 'legal' samples.
// bubble (coach, hint or tutorial bubble together with ITS own pointer: ring, finger, spotlight), button (a highlighted button).
// summary(samples) -> {n, max, multi, combos, loops, loopNames}
function inPage(){
  window.__tbHS=[];window.__tbHSmark=0;
  const vis=e=>{if(!e||!e.isConnected)return false;const r=e.getBoundingClientRect();if(!r.width||!r.height||r.bottom<0||r.top>innerHeight||r.right<0||r.left>innerWidth)return false;
    for(let a=e;a&&a.nodeType===1;a=a.parentElement){const c=getComputedStyle(a);if(c.display==='none'||c.visibility==='hidden'||+c.opacity<0.05)return false}return true};
  // F14: class-based. An element with a help class (.glow / .rglow = a legal target, .rg / .rec / .rrec = the suggestion) counts while it is visible,
  // unless the page's own CSS has switched its glow off (the bulb's calm mode: no filter on the card art, a 0-opacity ring, a thin region frame, no spot shadow).
  const off=e=>{try{
    if(e.matches('#handw .hc, .kcb')){const s=e.querySelector('svg');const kids=[e,...e.children,s].filter(Boolean);return !kids.some(k=>{const c=getComputedStyle(k);return (c.filter&&c.filter!=='none')||(c.boxShadow&&c.boxShadow!=='none')||(c.outlineStyle&&c.outlineStyle!=='none'&&parseFloat(c.outlineWidth)>0)})}
    if(e.matches('.tb-loc')){const r=e.querySelector('.tb-ring');return !r||+getComputedStyle(r).opacity<0.3}
    if(e.matches('g[data-reg], g.rglow')){const r=e.querySelector('rect');if(!r)return false;const c=getComputedStyle(r);return parseFloat(c.strokeWidth)<3||+c.strokeOpacity<0.4}
    if(e.matches('.opt, .lbtn, .orow, .offer')){const c=getComputedStyle(e);return !/255, 210, 74/.test(c.borderTopColor)}
    if(e.matches('.nb')){const c=getComputedStyle(e);return !c.boxShadow||c.boxShadow==='none'}
    if(e.matches('.bspot')){const c=getComputedStyle(e);return (!c.boxShadow||c.boxShadow==='none')&&(!c.outlineStyle||c.outlineStyle==='none')}
    return false}catch(x){return false}};
  const SUG='.rg, .rec, .rrec',TGT='.glow, .rglow';
  function sample(){try{const H=new Set(),D={};const desc=e=>(e.id?'#'+e.id:'')+'.'+String((e.className&&(e.className.baseVal!=null?e.className.baseVal:e.className))||e.tagName).replace(/\s+/g,'.').slice(0,40);const add=(k,e)=>{if(!H.has(k)){H.add(k);D[k]=desc(e)}};
    const inHelp=e=>!!e.closest('.gxh-bub,.gxt-bub,.gxh-rules,.gxt-root,[data-help],#start,.gx-drawer');
    // the thing a bubble's own ring sits on is that bubble's target, not a second helper
    const rings=[...document.querySelectorAll('.gxh-ring:not(.from), .gxt-ring')].filter(vis).map(e=>{const r=e.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2}});
    const underRing=e=>{const r=e.getBoundingClientRect();return rings.some(c=>c.x>=r.left-8&&c.x<=r.right+8&&c.y>=r.top-8&&c.y<=r.bottom+8)};
    for(const e of document.querySelectorAll(SUG)){if(inHelp(e)||!vis(e)||off(e)||underRing(e))continue;add('suggest',e)}
    {const f=document.getElementById('finger');if(f&&!f.hidden&&vis(f)&&!underRing(f))add('suggest',f)}
    // legal-move glows are the board's affordance (every place you may tap, a soft steady edge), not a helper: recorded, not counted
    const L=new Set();for(const e of document.querySelectorAll(TGT)){if(e.matches(SUG)||inHelp(e)||!vis(e)||off(e))continue;L.add(desc(e).split('.').slice(0,3).join('.'));if(L.size>3)break}
    for(const e of document.querySelectorAll('.gxh-bub.on, .gxt-bub, .gxt-ring, .gxh-ring, .gxh-finger')){if(vis(e)){add('bubble',e);break}}
    // a bubble whose own pointers (rings) mark two different places is two lit targets (R71: the bulb's ring on a region plus a ring and finger on a card)
    {const rs=[...document.querySelectorAll('.gxh-ring, .gxt-ring:not(.soft)')].filter(vis).map(e=>e.getBoundingClientRect());const far=rs.some((a,i)=>rs.some((b,j)=>j>i&&Math.hypot(a.left+a.width/2-b.left-b.width/2,a.top+a.height/2-b.top-b.height/2)>24));if(far)add('bubble2',document.querySelector('.gxh-ring, .gxt-ring'))}
    for(const e of document.querySelectorAll('.coachhl, .pulse')){if(vis(e)&&!inHelp(e)){add('button',e);break}}
    const loops=document.getAnimations().filter(a=>a.playState==='running'&&a.effect&&a.effect.getTiming().iterations===Infinity).map(a=>{const t=a.effect.target;return (a.animationName||a.id||'anim')+'@'+(t?(t.id?'#'+t.id:String((t.className&&(t.className.baseVal!=null?t.className.baseVal:t.className))||t.tagName)).slice(0,24):'')});
    const tut=typeof GXT!=='undefined'&&GXT.state&&(()=>{try{return !!GXT.state().active}catch(e){return false}})();
    window.__tbHS.push({t:Date.now(),H:[...H],L:[...L],D,loops,tut,mark:window.__tbHSmark});if(window.__tbHS.length>4000)window.__tbHS.shift()}catch(e){}}
  setInterval(sample,1000);window.__tbSample=sample}
function summary(S){const multi=S.filter(r=>r.H.length>1),combos={};for(const r of multi){const k=r.H.slice().sort().join('+');combos[k]=(combos[k]||0)+1;if(!combos[k+' e.g.'])combos[k+' e.g.']=JSON.stringify(r.D)+(r.tut?' (tutorial on)':'')}
  const lp=S.filter(r=>r.loops.length),loopNames={};lp.forEach(r=>r.loops.forEach(n=>loopNames[n]=(loopNames[n]||0)+1));
  const kinds={};S.forEach(r=>r.H.forEach(k=>kinds[k]=(kinds[k]||0)+1));kinds.legal=S.filter(r=>r.L&&r.L.length).length;
  return {kinds,n:S.length,max:Math.max(0,...S.map(r=>r.H.length)),multi:multi.length,combos,loops:lp.length,loopNames}}
const line=(tag,s)=>'HELPERS '+tag+': samples '+s.n+' maxHelpers '+s.max+' multiSamples '+s.multi+' '+JSON.stringify(s.combos)+' seen '+JSON.stringify(s.kinds)+' | infinite-loop samples '+s.loops+' '+JSON.stringify(s.loopNames);
module.exports={inPage,summary,line};
