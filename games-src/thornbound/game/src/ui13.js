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
    let rt='court';try{if(typeof G!=='undefined'&&G&&UI.started&&!G.over&&G.rounds>1){if(G.round>=G.rounds)rt='throne-hall';else if(G.round>Math.floor(G.rounds/2))rt='lantern-night'}}catch(e){}
    const id=unl('table')||rt,ph=id==='court'&&matchMedia('(orientation:portrait)').matches,f=ph?'table-court-phone':'table-'+id;
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

// ---------------------------------------------------------------- owner art in normal play: rival card backs and the story cast on the title
// face-down rival bids show that faction's painted back (TB_BACK, ui1.js); a back switches on only after its file loaded
const TBBK={on:{}};
function tbBacks(){if(/jsdom/i.test(navigator.userAgent||'')||UI.lowGfx||typeof G==='undefined'||!G)return;
  for(const p of G.pl){const k=FK[p.fac],f=TB_BACK[k];if(!f||TBBK.on[k]!==undefined)continue;TBBK.on[k]=0;
    const im=new Image();im.onload=()=>{TBBK.on[k]=1;document.documentElement.classList.add('tb-bk-'+k)};im.src='media/'+f+'.webp'}}
// the Story button shows the road ahead: the guide, then each chapter's rival on a chapter disc (done, open, locked, boss)
function tbCastRow(){const b=document.querySelector('#start .tbtn.story');if(!b||b.querySelector('.castrow')||UI.lowGfx||!window.CAMPAIGN)return;
  let pr={ch:{}};try{pr=GXC.progress()}catch(e){}
  const ch=window.CAMPAIGN.chapters||[],seen=new Set(),items=[{p:'camp-ysolde.webp',st:'done'}];let open=false;
  ch.forEach(c=>{const o=c.opponent||{},f=o.portrait;if(!f||seen.has(f))return;seen.add(f);const won=pr.ch&&pr.ch[c.id]&&pr.ch[c.id].beaten;
    const st=won?'done':(!open?(open=true,'open'):(c.boss?'boss':'locked'));items.push({p:f,st})});
  const row=document.createElement('span');row.className='castrow';row.setAttribute('aria-hidden','true');
  row.innerHTML=items.map(it=>'<i class="cr cr-'+it.st+'"><img src="media/'+it.p+'" alt="" draggable="false" onerror="this.parentNode.remove()"></i>').join('');
  b.appendChild(row)}
(function(){const o=renderStart;renderStart=function(){const r=o.apply(this,arguments);try{tbCastRow()}catch(e){}return r}})();
(function(){const o=renderAll;renderAll=function(){const r=o.apply(this,arguments);try{tbBacks()}catch(e){}return r}})();
// the snap: a short vibrate tick when a card lands on its spot (tap or drag), where the device has one
(function(){const o=commitCard;commitCard=function(){try{if(navigator.vibrate)navigator.vibrate(14)}catch(e){}return o.apply(this,arguments)}})();
