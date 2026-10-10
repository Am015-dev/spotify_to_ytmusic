// ---------- painted extras: table skin (3D), title and end banners, music per screen + the Music picker ----------
// Files live in media/ next to index.html. Everything is optional: a missing file leaves the old look (walnut table, plain panels).
(function(){
const MEDIA='media/',R=document.documentElement,IMG_OK={};
const unl=t=>{try{const u=GXC.unlocked().filter(x=>x.type===t);return u.length?u[u.length-1].id:null}catch(e){return null}};
const pre=(f,cb)=>{if(IMG_OK[f]!==undefined){cb&&IMG_OK[f]&&cb();return}IMG_OK[f]=0;const i=new Image();i.onload=()=>{IMG_OK[f]=1;cb&&cb()};i.src=MEDIA+f+'.webp'};
const phone=()=>!!(window.matchMedia&&matchMedia('(max-width:700px)').matches);
const TBL={'prism-light':1,'unmarked-slate':1,'sun-palace':1};
function artVars(){const set=(k,f)=>pre(f,()=>R.style.setProperty(k,'url('+MEDIA+f+'.webp)'));
  set('--sg-title',phone()?'title-phone':'title');set('--sg-table',tableFile()||(innerHeight>innerWidth?'table-default-phone':'table-default'));set('--sg-end-win','end-win');set('--sg-end-lose','end-lose')}
// ---- 3D table: a painted top laid on the walnut (the unlocked table replaces the default); plain walnut while loading and on Low graphics
let skinPl=null,skinFile='',skinKey='';
function tableFile(){const u=unl('table');if(u&&TBL[u])return 'table-'+u;return null}
function skin(){if(typeof V3==='undefined'||!V3.table||!V3.scene||typeof THREE==='undefined'||!V3.table.geometry.attributes.position)return;
  const bb=new THREE.Box3().setFromObject(V3.table);if(!isFinite(bb.max.x))return;const w=bb.max.x-bb.min.x,d=bb.max.z-bb.min.z;if(w<5||d<5)return;
  const f=tableFile()||(d>w*1.05?'table-default-phone':'table-default');
  if(skinFile!==f){pre(f,()=>{});if(IMG_OK[f]){skinFile=f;new THREE.TextureLoader().load(MEDIA+f+'.webp',tx=>{try{tx.colorSpace=THREE.SRGBColorSpace;tx.anisotropy=4;
      if(!skinPl){skinPl=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshStandardMaterial({map:tx,roughness:.95,metalness:0,envMapIntensity:.15,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));
        skinPl.rotation.x=-Math.PI/2;skinPl.receiveShadow=true;V3.scene.add(skinPl)}else{if(skinPl.material.map)skinPl.material.map.dispose();skinPl.material.map=tx;skinPl.material.needsUpdate=true}skinKey='';if(typeof V3.dirty!=='undefined')V3.dirty=true}catch(e){}})}}
  if(!skinPl)return;const k=[bb.min.x,bb.max.x,bb.min.z,bb.max.z,bb.max.y].map(x=>x.toFixed(2)).join();
  if(k!==skinKey){skinKey=k;skinPl.scale.set(w-.5,d-.5,1);skinPl.position.set((bb.min.x+bb.max.x)/2,bb.max.y+.01,(bb.min.z+bb.max.z)/2)}
  skinPl.visible=V3.q!=='low'}
// ---- banners: the start panel and the final panel get painted tops (CSS variables above)
const _sh=window.startHtml;if(typeof _sh==='function')startHtml=function(){return _sh.apply(this,arguments).replace('<div class="mbox">','<div class="mbox sg-title"><div class="sg-hero" aria-hidden="true"></div>')};
function humanWon(){try{return !G.pl.some(p=>p.human)||G.pl.some((p,i)=>p.human&&G.over.win.indexOf(i)>=0)}catch(e){return true}}
if(typeof endHtml==='function'){const e0=endHtml;endHtml=function(){return '<div class="sg-endart '+(humanWon()?'win':'lose')+'" aria-hidden="true"></div>'+e0.apply(this,arguments)}}
// ---- music
const SLOTS=[['tavern','Menu'],['main','Game'],['fight','Last round'],['victory','Victory'],['defeat','Defeat']];
function slot(){
  if(!G||UI.modal==='start'||UI.modal==='story'||UI.modal==='lobby')return['tavern',0];
  if(G.over)return[humanWon()?'victory':'defeat',1];
  if(!UI.tut&&((UI.cmp&&UI.cmp.boss)||G.round>=5))return['fight',0];
  return['main',0]}
function boot(){
  try{GXMUS.init({key:'sgz',slots:SLOTS,slot,on:()=>SND.music,toggle:()=>toggleMusic()})}catch(e){}
  document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-a="musicpick"]');if(b){e.stopPropagation();GXMUS.open()}},true);
  artVars();setInterval(()=>{try{artVars();skin()}catch(e){}},800)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
