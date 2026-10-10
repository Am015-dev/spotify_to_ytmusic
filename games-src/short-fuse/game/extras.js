// ===================== Short Fuse: painted extras =====================
// card paintings (SF_ART, embedded), card backs, table, title and ending art (media/), music picker panel.
// Everything has a plain-colour fallback: the CSS keeps working if a file is missing or "Low graphics" is on.
const MEDIA='media/';
let LOWGFX=false;try{LOWGFX=localStorage.getItem('sf_gfx')==='low'}catch(e){}
const ART_URL={};
function artBoot(){if(typeof SF_ART==='undefined')return;
  for(const k in SF_ART){if(ART_URL[k])continue;try{const d=SF_ART[k],bin=atob(d.slice(d.indexOf(',')+1)),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);ART_URL[k]=URL.createObjectURL(new Blob([u],{type:'image/webp'}))}catch(e){ART_URL[k]=''}}}
// paintings reach the cards as CSS variables --a-<key>; with Low graphics on they are simply not set, so the colour fallbacks show
function artApply(){const R=document.documentElement;R.toggleAttribute('data-lowgfx',LOWGFX);
  for(const k in ART_URL){if(!LOWGFX&&ART_URL[k])R.style.setProperty('--a-'+k,'url('+ART_URL[k]+')');else R.style.removeProperty('--a-'+k)}}
const unl=t=>{try{const u=GXC.unlocked().filter(x=>x.type===t);return u.length?u[u.length-1].id:null}catch(e){return null}};
const IMG_OK={};const preImg=f=>{const i=new Image();i.onload=()=>{IMG_OK[f]=1};i.src=MEDIA+f+'.webp'};
// ---- card backs: face-down equipment cards; the campaign unlock replaces the default
let backCur='';
function backApply(){const R=document.documentElement,id=unl('cardback')||'default';if(LOWGFX){R.style.removeProperty('--back-img');backCur='';return}
  if(id===backCur)return;backCur=id;R.style.setProperty('--back-img','url('+MEDIA+'back-'+id+'.webp)')}
// ---- tables: painted workbench behind the board (the CSS teal stays while it loads and if the file is missing)
const tblSeen={};let tblCur='';
function tableApply(){const R=document.documentElement,id=unl('table')||'workbench';
  if(LOWGFX){R.removeAttribute('data-timg');tblCur='';return}
  const f='table-'+id+(id==='workbench'&&innerHeight>innerWidth?'-phone':'');if(f===tblCur)return;   // the phone workbench when held upright
  const go=()=>{tblCur=f;R.style.setProperty('--tbl-img','url('+MEDIA+f+'.webp)');R.dataset.timg='1'};
  if(tblSeen[f])return go();const im=new Image();im.onload=()=>{tblSeen[f]=1;go()};im.src=MEDIA+f+'.webp'}
// ---- title key art behind the start screen
function titleArt(){const R=document.documentElement,s=document.getElementById('start');if(!s)return;
  if(LOWGFX){s.classList.remove('art');return}
  if(R.dataset.tart){s.classList.add('art');return}
  const im=new Image();im.onload=()=>{R.dataset.tart='1';const s2=document.getElementById('start');if(s2&&!LOWGFX)s2.classList.add('art')};im.src=MEDIA+'title.webp'}
// ---- end art: the painted banner is in the result card (renderOverlays); here we only pick the picture
function endArt(){const R=document.documentElement;R.style.setProperty('--end-win','url('+MEDIA+'end-win.webp)');R.style.setProperty('--end-lose','url('+MEDIA+'end-lose.webp)')}
// ---- music panel: five slots, two songs each, plus shuffle and off
function renderMusic(){const b=document.getElementById('musicbody');if(!b)return;
  let vol=.45;try{vol=GA.state().musVol}catch(e){}
  const on=SND.music;
  const chip=(cls,at,label)=>`<button type="button" class="mchip${cls}" ${at}>${label}</button>`;
  let h=`<div class="mtop">${chip(on?' on':'','data-a="mmus"','Music: '+(on?'on':'off'))}<label class="mvol">Volume <input type="range" id="mvol" min="0" max="1" step=".05" value="${vol}" aria-label="Music volume"></label></div>`;
  const allOn=MLOOPS.every(k=>MUS.pick[k]==='all');h+=`<div class="mtop">${chip(allOn?' on':'','data-a="mall"','⇄ Shuffle all songs')}</div>`;
  for(const [k,nm] of MSLOTS){const cur=MUS.pick[k],act=SND.slot===k&&on&&cur!=='off'&&!MUS.prev;
    let row='';
    for(const v of 'ab')row+=chip(cur===v?' on':'',`data-a="mpick" data-s="${k}" data-c="${v}"`,esc(MTITLE[k+'-'+v]));
    row+=chip(cur==='shuffle'?' on':'',`data-a="mpick" data-s="${k}" data-c="shuffle"`,'⇄ Shuffle');
    if(MLOOPS.includes(k))row+=chip(cur==='all'?' on':'',`data-a="mpick" data-s="${k}" data-c="all"`,'⇄ All songs');
    row+=chip(cur==='off'?' on':'',`data-a="mpick" data-s="${k}" data-c="off"`,'Off');
    if(MUS.prev===k)row+=chip(' prev',`data-a="mprevx" data-s="${k}"`,'■ Stop preview');
    else if(!act&&cur!=='off'&&on)row+=chip(' prev',`data-a="mprev" data-s="${k}"`,'▶ Preview');
    h+=`<div class="mrow2"><h3>${nm}${act?'<small> playing now</small>':''}</h3><div class="mchips">${row}</div></div>`}
  b.innerHTML=h;const sl=document.getElementById('mvol');if(sl)sl.addEventListener('input',()=>{try{GA.setVolume('music',+sl.value)}catch(e){}})}
document.addEventListener('click',e=>{const t=e.target.closest('[data-a]');if(!t)return;const a=t.dataset.a;
  if(a==='mpick'){musicPick(t.dataset.s,t.dataset.c);renderMusic()}
  else if(a==='mall'){const on=MLOOPS.every(k=>MUS.pick[k]==='all');MLOOPS.forEach(k=>musicPick(k,on?'a':'all'));renderMusic()}
  else if(a==='mprev'){musicPreview(t.dataset.s);renderMusic()}
  else if(a==='mprevx'){musicPreviewStop();renderMusic()}
  else if(a==='mmus'){toggleMusic();renderMusic();try{renderSettings()}catch(x){}}
  else if(a==='gfx'){LOWGFX=!LOWGFX;try{localStorage.setItem('sf_gfx',LOWGFX?'low':'hi')}catch(x){}artApply();backApply();tableApply();titleArt();renderSettings()}});
function extrasBoot(){artBoot();artApply();endArt();backApply();tableApply();titleArt();
  ['back-default','back-clock-key','camp-brix','camp-tally','camp-wren','end-win','end-lose'].forEach(preImg);
  setInterval(()=>{try{backApply();tableApply();if(SND.wantMusic&&SND.music&&MUS.pick[SND.slot]==='all')musSync()}catch(e){}},800)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',extrasBoot);else extrasBoot();
