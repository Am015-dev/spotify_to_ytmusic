// ===================== part 13: painted extras (media/*.webp beside the page): card back and table =====================
// The drawn card back and the CSS table stay while a picture loads, in jsdom, and (table only) on Low graphics.
var TBP={tok:{}};
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
  // painted track lane tile and throne centrepiece (media/track.webp, media/throne.webp)
  let curS=0;
  function surfApplyUI(){if(curS||UI.lowGfx)return;curS=1;
    load('track',()=>TBKit.setTrackImg('media/track.webp'));load('throne',()=>TBKit.setThroneImg('media/throne.webp'))}
  // Basic cards: art/basic-<faction>.webp (embedded in TB_ART, already in PA) when it exists, else a crop of the faction's campaign portrait
  const BFB={gilded:'camp-halvard',heath:'camp-ysolde',lantern:'camp-rook',choir:'camp-orlen'};let bdone=false;
  function basicApply(){if(bdone)return;bdone=true;const extra={};let n=0;const fin=()=>{if(--n>0)return;TBKit.setArt(Object.assign({},PA,extra));if(typeof renderAll==='function'&&typeof G!=='undefined'&&G)try{renderAll()}catch(e){}};
    const ks=Object.keys(BFB).filter(f=>!PA['basic-'+f]);n=ks.length;if(!n)return;
    ks.forEach(f=>{const im=new Image();im.onload=()=>{extra['basic-'+f]='media/'+BFB[f]+'.webp';fin()};im.onerror=fin;im.src='media/'+BFB[f]+'.webp'})}
  // painted UI kit (gx-skin) and extras: strength seals, round shield, faction emblems, resource icons; each switches on only after its file loaded
  let skd=0;
  function skinInit(){if(skd||UI.lowGfx||typeof GXSK==='undefined')return;skd=1;GXSK.init({});
    ['token-strength-green','token-strength-orange','token-strength-red'].forEach(f=>{const im=new Image();im.onload=()=>{TBP.tok[f.slice(15)]=1;if(typeof drawOverlay==='function'&&MAP&&MAP.m)try{drawOverlay()}catch(e){}};im.src='media/'+f+'.webp'});
    const sh=new Image();sh.onload=()=>{window.TBP_SHIELD=1;try{if(MAP.m&&G)MAP.m.setRound(Math.max(1,G.round),G.rounds)}catch(e){}};sh.src='media/ui-round-shield-c.webp';
    [['clans','heath'],['gathering','choir'],['nobility','gilded'],['uprising','lantern']].forEach(([f,k])=>{const im=new Image();im.onload=()=>{R.classList.add('sk-e-'+k);try{if(typeof renderAll==='function'&&G)renderAll()}catch(e){}};im.src='media/emblem-'+f+'.webp'});
    ['influence','lore','pledge','supporter'].forEach(f=>{const im=new Image();im.onload=()=>R.classList.add('sk-i-'+f);im.src='media/icon-'+f+'.webp'});
    ['ui-sheet-head','ui-bubble-c'].forEach(f=>{const im=new Image();im.onload=()=>R.classList.add('sk-'+f.replace('ui-','').replace('-c',''));im.src='media/'+f+'.webp'})}
  function tick(){skinInit();backApply();tableApply();mapApply();surfApplyUI();basicApply()}
  ['back-default','back-court','table-court','table-court-phone'].forEach(n=>{new Image().src='media/'+n+'.webp'});
  return {tick};
})();
