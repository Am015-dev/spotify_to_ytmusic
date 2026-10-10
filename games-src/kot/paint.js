// ---------- painted extras: title and end banners, table skins (campaign unlocks), music per screen + the Music picker ----------
// Files live in media/ next to index.html. Everything is optional: a missing file leaves the old look.
(function(){
const MEDIA='media/',R=document.documentElement,IMG_OK={};
const unl=t=>{try{const u=GXC.unlocked().filter(x=>x.type===t);return u.length?u[u.length-1].id:null}catch(e){return null}};
const pre=(f,cb)=>{if(IMG_OK[f]!==undefined){cb&&IMG_OK[f]&&cb();return}IMG_OK[f]=0;const i=new Image();i.onload=()=>{IMG_OK[f]=1;cb&&cb()};i.src=MEDIA+f+'.webp'};
const phone=()=>!!(window.matchMedia&&matchMedia('(max-width:700px)').matches);
function artVars(){const set=(k,f)=>pre(f,()=>R.style.setProperty(k,'url('+MEDIA+f+'.webp)'));
  set('--cc-title',phone()?'title-phone':'title');const tf=tableFile();if(tf)set('--cc-table',tf);else R.style.removeProperty('--cc-table');set('--cc-end-win','end-win');set('--cc-end-lose','end-lose')}
// ---- table skins: the campaign unlocks Harbor Night and Spire Gold paint a map under the plaza (the built city stays around it); nothing for the default
let skinPl=null,skinFile='';
function tableFile(){const u=unl('table');return u==='harbor-night'||u==='spire-gold'?'table-'+u:null}
function skin(){if(typeof V3==='undefined'||!V3.on||!V3.scene||typeof THREE==='undefined')return;const f=tableFile();
  if(!f){if(skinPl)skinPl.visible=false;return}
  if(skinFile!==f){pre(f,()=>{});if(IMG_OK[f]){skinFile=f;new THREE.TextureLoader().load(MEDIA+f+'.webp',tx=>{try{tx.colorSpace=THREE.SRGBColorSpace;tx.anisotropy=4;
      if(!skinPl){skinPl=new THREE.Mesh(new THREE.PlaneGeometry(64,36),new THREE.MeshStandardMaterial({map:tx,roughness:.9,metalness:0,envMapIntensity:.2}));skinPl.rotation.x=-Math.PI/2;skinPl.position.y=.03;skinPl.receiveShadow=true;V3.scene.add(skinPl)}
      else{if(skinPl.material.map)skinPl.material.map.dispose();skinPl.material.map=tx;skinPl.material.needsUpdate=true}}catch(e){}})}}
  if(skinPl)skinPl.visible=V3.q!=='low'}
// ---- banners: the start panel and the final panel get painted tops
const _ss=window.startScreen;if(typeof _ss==='function')startScreen=function(){return _ss.apply(this,arguments).replace('<div class="dlg start" role="dialog" aria-modal="true">','<div class="dlg start" role="dialog" aria-modal="true"><div class="cc-hero" aria-hidden="true"></div>')};
function humanWon(){try{return !G.pl.some(p=>p.human)||G.pl.some(p=>p.human&&G.winner==='P'+(p.i+1))}catch(e){return true}}
const _sh=window.statsHTML;if(typeof _sh==='function')statsHTML=function(){return _sh.apply(this,arguments).replace(/<div class="dlg([^"]*)"([^>]*)>/,(m,c,a)=>'<div class="dlg'+c+'"'+a+'><div class="cc-endart '+(humanWon()?'win':'lose')+'" aria-hidden="true"></div>')};
const st=document.createElement('style');st.textContent=
'.cc-hero{height:130px;margin:-14px -16px 6px;border-radius:14px 14px 0 0;background:linear-gradient(180deg,rgba(255,250,240,0) 45%,#fffaf0),var(--cc-title,none) center/cover}'+
'.cc-endart{height:120px;margin:-14px -16px 6px;border-radius:14px 14px 0 0;background:var(--cc-end-win,none) center/cover;-webkit-mask-image:linear-gradient(#000 55%,transparent);mask-image:linear-gradient(#000 55%,transparent)}'+
'.cc-endart.lose{background:var(--cc-end-lose,none) center/cover}'+
'@media (max-width:700px){.cc-endart{height:84px}}'+
'body:not(.three) .gx-board{background:linear-gradient(rgba(27,15,46,.25),rgba(27,15,46,.25)),var(--cc-table,none) center/cover,radial-gradient(ellipse at 50% 20%,#4a1f6a,#1b0f2e 70%)}';
document.head.appendChild(st);
// ---- music
const SLOTS=[['tavern','Menu'],['main','Smash'],['fight','Boss or final stretch'],['victory','Victory'],['defeat','Defeat']];
function slot(){
  if(!G||UI.info)return['tavern',0];
  if(G.winner)return[humanWon()?'victory':'defeat',1];
  if(!UI.tut&&((UI.camp&&UI.camp.boss&&campOn())||G.pl.some(p=>p.vp>=15)))return['fight',0];
  return['main',0]}
function boot(){
  try{GXSK.init({dark:true})}catch(e){}
  try{GXMUS.init({key:'ccs',slots:SLOTS,slot,on:()=>SND.on&&SND.music,toggle:()=>toggleMusic()})}catch(e){}
  document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-a="musicpick"]');if(b){e.stopPropagation();GXMUS.open()}},true);
  artVars();setInterval(()=>{try{artVars();skin()}catch(e){}},800)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
