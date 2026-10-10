// ---------- painted extras: 3D table, title and end banners, music per screen + the Music picker ----------
// Files live in media/ next to index.html. Everything is optional: a missing file leaves the old look (wood table, plain panels).
(function(){
const MEDIA='media/',R=document.documentElement,IMG_OK={};
const unl=t=>{try{const u=GXC.unlocked().filter(x=>x.type===t);return u.length?u[u.length-1].id:null}catch(e){return null}};
const pre=(f,cb)=>{if(IMG_OK[f]!==undefined){cb&&IMG_OK[f]&&cb();return}IMG_OK[f]=0;const i=new Image();i.onload=()=>{IMG_OK[f]=1;cb&&cb()};i.src=MEDIA+f+'.webp'};
const phone=()=>!!(window.matchMedia&&matchMedia('(max-width:700px)').matches);
const TBL={dawn:1,storm:1,lantern:1};
function artVars(){const set=(k,f)=>pre(f,()=>R.style.setProperty(k,'url('+MEDIA+f+'.webp)'));
  set('--tw-title',phone()?'title-phone':'title');set('--tw-end-win','end-win');set('--tw-end-lose','end-lose')}
// ---- 3D table: a painted sheet under the board, over the wood (the unlocked table replaces the default); wood while loading and on Low
let skinPl=null,skinFile='';
function tableFile(){const u=unl('table');if(u&&TBL[u])return 'table-'+u;return null}
function skin(){const K=window.TWKit&&TWKit._K;if(!K||!K.on||!K.scene||!K.gBoard||typeof THREE==='undefined')return;
  const port=innerHeight>innerWidth*1.05,f=tableFile()||(port?'table-default-phone':'table-default');
  if(skinFile!==f){pre(f,()=>{});if(IMG_OK[f]){skinFile=f;new THREE.TextureLoader().load(MEDIA+f+'.webp',tx=>{try{tx.colorSpace=THREE.SRGBColorSpace;tx.anisotropy=4;
      if(!skinPl){skinPl=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshStandardMaterial({map:tx,roughness:.9,metalness:0,envMapIntensity:.2}));skinPl.rotation.x=-Math.PI/2;skinPl.position.y=-.29;skinPl.receiveShadow=true;K.gBoard.add(skinPl)}
      else{if(skinPl.material.map)skinPl.material.map.dispose();skinPl.material.map=tx;skinPl.material.needsUpdate=true}}catch(e){}})}}
  if(!skinPl)return;const w=port?13:24,h=port?24:13.5;skinPl.scale.set(w,h,1);skinPl.visible=(K.q||K.quality)!=='low'}
// ---- banners
const _oh=window.overHTML;
function myWin(){try{const w=G.over.win||[];return w.some(i=>G.seats[i].human)||(!humans().length&&w.length>0)}catch(e){return true}}
if(typeof _oh==='function')overHTML=function(){const r=_oh.apply(this,arguments);return r.replace('data-over="1">','data-over="1"><div class="tw-endart '+(myWin()?'win':'lose')+'" aria-hidden="true"></div>')};
const st=document.createElement('style');st.textContent=
'#start{background:linear-gradient(180deg,rgba(11,42,51,.55) 0,rgba(11,42,51,.15) 130px,rgba(11,42,51,.3) 420px,rgba(11,42,51,.85) 900px),var(--tw-title,none) center top/cover no-repeat,#0b2a33}'+
'#start h1,#start .lede{text-shadow:0 2px 8px #000}'+
'.tw-endart{height:120px;margin:-12px -14px 8px;border-radius:12px 12px 0 0;background:linear-gradient(180deg,rgba(0,0,0,0) 45%,rgba(251,242,214,.96)),var(--tw-end-win,none) center/cover}'+
'@media (max-width:700px){.tw-endart{height:64px;margin:-12px -14px 4px}}'+
'.tw-endart.lose{background:linear-gradient(180deg,rgba(0,0,0,0) 45%,rgba(251,242,214,.96)),var(--tw-end-lose,none) center/cover}';
document.head.appendChild(st);
// ---- music
const SLOTS=[['tavern','Menu'],['main','Voyage'],['fight','Leviathans close'],['victory','Victory'],['defeat','Defeat']];
function slot(){const s=document.getElementById('start');
  if(!G||!UI.started||(s&&!s.hidden))return['tavern',0];
  if(G.over)return[myWin()?'victory':'defeat',1];
  if(!UI.tut&&(SND.mood==='tension'||(UI.camp&&UI.camp.boss&&campOn())))return['fight',0];
  return['main',0]}
function boot(){
  try{GXMUS.init({key:'tw',slots:SLOTS,slot,on:()=>SND.music,toggle:()=>toggleMusic()})}catch(e){}
  document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-a="musicpick"]');if(b){e.stopPropagation();GXMUS.open()}},true);
  artVars();setInterval(()=>{try{artVars();skin()}catch(e){}},800)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
