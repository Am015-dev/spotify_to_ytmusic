// ===================== part 13: painted extras (media/*.webp beside the page): card back and table =====================
// The drawn card back and the CSS table stay while a picture loads, in jsdom, and (table only) on Low graphics.
const PX=(function(){
  if(/jsdom/i.test(navigator.userAgent||''))return {tick(){}};
  const R=document.documentElement,seen={};let curT='',curB='';
  function unl(t){try{const u=GXC.unlocked().filter(x=>x.type===t);return u.length?u[u.length-1].id:null}catch(e){return null}}
  function load(f,cb){if(seen[f])return cb();const im=new Image();im.onload=()=>{seen[f]=1;cb()};im.src='media/'+f+'.webp'}
  // face-down cards: the thorn-crown back, or the latest card back unlocked in the story
  function backApply(){const id=unl('cardback')||'default';if(id===curB)return;
    load('back-'+id,()=>{curB=id;TBKit.setBack('media/back-'+id+'.webp');try{if(G&&UI.started)renderAll()}catch(e){}})}
  // table: the candlelit court (phone version in portrait), or an unlocked table, behind the map
  function tableApply(){R.dataset.gfx=UI.lowGfx?'low':'high';
    const id=unl('table')||'court',ph=id==='court'&&matchMedia('(orientation:portrait)').matches,f=ph?'table-court-phone':'table-'+id;
    if(f===curT)return;load(f,()=>{curT=f;R.style.setProperty('--tbl-img','url(media/'+f+'.webp)');R.dataset.timg='1'})}
  function tick(){backApply();tableApply()}
  ['back-default','table-court','table-court-phone'].forEach(n=>{new Image().src='media/'+n+'.webp'});
  return {tick};
})();
