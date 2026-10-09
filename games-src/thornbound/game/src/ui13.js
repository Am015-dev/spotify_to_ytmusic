// ===================== part 13: painted extras (media/*.webp beside the page): card back and table =====================
// The drawn card back and the CSS table stay while a picture loads, in jsdom, and (table only) on Low graphics.
const PX=(function(){
  if(/jsdom/i.test(navigator.userAgent||''))return {tick(){}};
  const R=document.documentElement,seen={};let curT='',curB='';
  function unl(t){try{const u=GXC.unlocked().filter(x=>x.type===t);return u.length?u[u.length-1].id:null}catch(e){return null}}
  function load(f,cb){if(seen[f])return cb();const im=new Image();im.onload=()=>{seen[f]=1;cb()};im.src='media/'+f+'.webp'}
  // face-down cards: the thorn-crown back, or the latest card back unlocked in the story
  function backApply(){let pb='default';try{pb=localStorage.getItem('tb_back')==='court'?'court':'default'}catch(e){}
    const id=unl('cardback')||pb;if(id===curB)return;
    load('back-'+id,()=>{curB=id;TBKit.setBack('media/back-'+id+'.webp')})}
  // table: the candlelit court (phone version in portrait), or an unlocked table, behind the map
  function tableApply(){R.dataset.gfx=UI.lowGfx?'low':'high';
    const id=unl('table')||'court',ph=id==='court'&&matchMedia('(orientation:portrait)').matches,f=ph?'table-court-phone':'table-'+id;
    if(f===curT)return;load(f,()=>{curT=f;R.style.setProperty('--tbl-img','url(media/'+f+'.webp)');R.dataset.timg='1'})}
  // painted kingdom map (map.webp / map-phone.webp), used when present; locations stay on top
  let curM='';
  function mapApply(){const f=matchMedia('(orientation:portrait)').matches?'map-phone':'map';if(f===curM||UI.lowGfx)return;
    const im=new Image();im.onload=()=>{curM=f;TBKit.setMapImg('media/'+f+'.webp');R.dataset.mapimg='1'};im.src='media/'+f+'.webp'}
  // Basic cards: art/basic-<faction>.webp (embedded in TB_ART, already in PA) when it exists, else a crop of the faction's campaign portrait
  const BFB={gilded:'camp-halvard',heath:'camp-ysolde',lantern:'camp-rook',choir:'camp-orlen'};let bdone=false;
  function basicApply(){if(bdone)return;bdone=true;const extra={};let n=0;const fin=()=>{if(--n>0)return;TBKit.setArt(Object.assign({},PA,extra));if(typeof renderAll==='function'&&typeof G!=='undefined'&&G)try{renderAll()}catch(e){}};
    const ks=Object.keys(BFB).filter(f=>!PA['basic-'+f]);n=ks.length;if(!n)return;
    ks.forEach(f=>{const im=new Image();im.onload=()=>{extra['basic-'+f]='media/'+BFB[f]+'.webp';fin()};im.onerror=fin;im.src='media/'+BFB[f]+'.webp'})}
  function tick(){backApply();tableApply();mapApply();basicApply()}
  ['back-default','back-court','table-court','table-court-phone'].forEach(n=>{new Image().src='media/'+n+'.webp'});
  return {tick};
})();
