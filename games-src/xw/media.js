// ---------- painted extras: table skin, title and end art, endArt on the story result, music per screen + the Music picker ----------
// Files live in media/ next to index.html. Everything is optional: a missing file leaves the old look (dark plate, CSS panels).
(function(){
const MEDIA='media/',R=document.documentElement,IMG_OK={};
const unl=t=>{try{const u=GXC.unlocked().filter(x=>x.type===t);return u.length?u[u.length-1].id:null}catch(e){return null}};
const pre=(f,cb)=>{if(IMG_OK[f]!==undefined){cb&&IMG_OK[f]&&cb();return}IMG_OK[f]=0;const i=new Image();i.onload=()=>{IMG_OK[f]=1;cb&&cb()};i.src=MEDIA+f+'.webp'};
const phone=()=>!!(window.matchMedia&&matchMedia('(max-width:700px)').matches);
// ---- title / end art as CSS variables (the start and debrief panels paint a banner from them)
function artVars(){const set=(k,f)=>pre(f,()=>R.style.setProperty(k,'url('+MEDIA+f+'.webp)'));
  set('--na-title',phone()?'title-phone':'title');set('--na-end-win','end-win');set('--na-end-lose','end-lose');
  const t=unl('table')==='nebula7'?'table-nebula7':'table-default';pre(t,()=>{R.style.setProperty('--tbl-img','url('+MEDIA+t+'.webp)');if(tblWant!==t){tblWant=t;skin()}});
  pre(phone()?'table-default-phone':'table-default',()=>R.style.setProperty('--tbl-flat','url('+MEDIA+(phone()?'table-default-phone':'table-default')+'.webp)'))}
// ---- 3D mat: a painted plane just under the holographic grid (the unlock Nebula-7 dust swaps it); plain dark plate while loading and on Low
let tblWant='',skinPl=null,skinFile='';
function skin(){if(typeof V3==='undefined'||!V3.mat||typeof THREE==='undefined')return;const f=tblWant||'table-default';
  if(skinFile!==f&&IMG_OK[f]){skinFile=f;new THREE.TextureLoader().load(MEDIA+f+'.webp',tx=>{try{tx.colorSpace=THREE.SRGBColorSpace;tx.anisotropy=4;
      if(!skinPl){const M=91.4,g=new THREE.PlaneGeometry(M,M).translate(M/2,M/2,0);skinPl=new THREE.Mesh(g,new THREE.MeshBasicMaterial({map:tx,transparent:true,opacity:.92,depthWrite:false,toneMapped:false}));
        skinPl.rotation.x=-Math.PI/2;skinPl.position.set(0,.01,M);skinPl.renderOrder=-2;V3.mat.add(skinPl)}else{if(skinPl.material.map)skinPl.material.map.dispose();skinPl.material.map=tx;skinPl.material.needsUpdate=true}}catch(e){}})}
  if(skinPl)skinPl.visible=V3.q!=='low'}
// ---- end banner class on the debrief panel (win / lose)
function endMark(){const d=document.querySelector('#modal .dlg.debrief');if(!d)return;const me=typeof soloSide==='function'?soloSide():-1,w=G&&G.winner;d.dataset.end=(me<0||w==='P'+(me+1)||!w)?'win':'lose'}
// ---- music: five slots, two songs each
const SLOTS=[['tavern','Menu'],['main','Battle'],['fight','Boss fight'],['victory','Victory'],['defeat','Defeat']];
function slot(){
  if(!G||UI.info)return['tavern',0];
  if(G.winner&&G.winner!=='draw'){const me=soloSide();return[(me<0||G.winner==='P'+(me+1))?'victory':'defeat',1]}
  if(!UI.tut&&UI.camp&&UI.camp.boss)return['fight',0];
  return['main',0]}
function boot(){
  try{GXMUS.init({key:'na',slots:SLOTS,slot,on:()=>SND.music,toggle:()=>toggleMusic()})}catch(e){}
  document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-a="musicpick"]');if(b){e.stopPropagation();GXMUS.open()}},true);
  artVars();setInterval(()=>{try{artVars();skin();endMark()}catch(e){}},800);
  new MutationObserver(()=>{try{endMark()}catch(e){}}).observe(document.getElementById('modal'),{childList:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
