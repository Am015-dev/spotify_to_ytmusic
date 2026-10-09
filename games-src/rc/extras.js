// ---------- painted extras: card paintings (art/*.webp, separate files), the card back, and the music (per screen + picker) ----------
const ART_DIR='art/',MEDIA='media/';
const ART_NO={};   // ART_HAVE: the paintings that exist (build.py lists art/)
const artOk=n=>ART_HAVE.indexOf(n)>=0&&!ART_NO[n];   // names whose file failed to load: never asked for twice
// <img> for a card painting: kind 'beast' | 'inv' | 'item', key from the data. Empty string when there is no painting (the text card stands alone).
function artImg(kind,key,cls){const n=kind+'-'+key;if(!kind||!key||!artOk(n))return '';
  return `<img class="cart ${cls||''}" src="${ART_DIR}${n}.webp" alt="" width="64" height="64" loading="lazy" draggable="false" onerror="ART_NO['${n}']=1;this.remove()">`}
// the same painting by card name (beasts and items are asked about by name in the shared question dialog)
function artBy(kind,key){return key?artImg(kind,key):''}
// a small stack of card backs with a count, for the deck list
function backStack(label,n){return `<span class="dk" title="${esc(label)}"><i class="cb" aria-hidden="true"></i><b>${n}</b><em>${esc(label)}</em></span>`}
(function(){const R=document.documentElement;R.style.setProperty('--back-img','url('+MEDIA+'back-default.webp)')})();

// ---- music: five slots (Menu, Game, Fight, Victory, Defeat), two Treblo tracks each; saved choice a / b / shuffle / off
const MSLOTS=[['tavern','Menu'],['main','Game'],['fight','Fight'],['victory','Victory'],['defeat','Defeat']];
const MTITLE={'tavern-a':'Island Menu Theme','tavern-b':'Gentle Shoreline','main-a':'Patient Sunrise','main-b':'Quiet Provision','fight-a':'Storm Rumble','fight-b':'Beast in the Dark','victory-a':'Harbor Horn Rising','victory-b':'Safe Return','defeat-a':'Fading Tide','defeat-b':'The Last Watch Ashore'};
const MDEF={tavern:'a',main:'a',fight:'a',victory:'a',defeat:'a'};
const MUS={pick:Object.assign({},MDEF),res:{},sh:{},want:null,wslot:null,prev:null,prevT:0,last:null,since:0};
// 'all' = shuffle through every looping song (menu, game and fight tracks), a new one every ~2.5 min
const MLOOPS=['tavern','main','fight'],MALL=Object.keys(MTITLE).filter(k=>MLOOPS.includes(k.split('-')[0])),MALL_MS=150000;
try{Object.assign(MUS.pick,JSON.parse(localStorage.getItem('swi_mpick')||'{}'))}catch(e){}
function musicSlot(){
  if(!G||UI.modal==='start')return ['tavern',0];
  if(G.over)return [G.over.win?'victory':'defeat',1];
  try{const d=typeof campDef==='function'?campDef():null;if(d&&d.boss)return ['fight',0]}catch(e){}
  if(G.rounds>2&&G.round>=G.rounds-1)return ['fight',0];
  return ['main',0]}
function musicName(slot){const c=MUS.pick[slot]||MDEF[slot];if(c==='off')return '-';
  if(c==='all'){if(!MUS.res[slot]){const pool=MALL.filter(k=>k!==MUS.last);MUS.res[slot]=pool[Math.floor(Math.random()*pool.length)]}return MUS.res[slot]}
  if(c==='shuffle'){if(!MUS.res[slot]){MUS.sh[slot]=MUS.sh[slot]===undefined?(Math.random()<.5?0:1):1-MUS.sh[slot];MUS.res[slot]=slot+'-'+'ab'[MUS.sh[slot]]}return MUS.res[slot]}
  return slot+'-'+(c==='b'?'b':'a')}
function musicOn(){return !!(window.GA&&SND.on&&SND.music)}
function musicSync(){
  if(!musicOn()||MUS.prev)return;
  const w=musicSlot();if(MUS.wslot!==w[0]){MUS.wslot=w[0];MUS.res[w[0]]=null}
  else if(MUS.pick[w[0]]==='all'&&!w[1]&&MUS.since&&Date.now()-MUS.since>MALL_MS)MUS.res[w[0]]=null;
  const n=musicName(w[0]);if(MUS.want===n)return;MUS.want=n;MUS.since=Date.now();if(n!=='-')MUS.last=n;
  if(n==='-'){GA.music(null,{fade:1});return}
  GA.music(n,{fade:w[1]?.6:1.2,once:!!w[1]});
  if(w[0]==='tavern'||w[0]==='main')setTimeout(()=>{try{const nx=w[0]==='tavern'?'main':'fight',c=MUS.pick[nx];if(c!=='off'&&c!=='shuffle'&&c!=='all')GA.preload(musicName(nx))}catch(e){}},4000)}
function musicForget(){MUS.want=null}
function musicPick(slot,c){MUS.pick[slot]=c;MUS.res[slot]=null;try{localStorage.setItem('swi_mpick',JSON.stringify(MUS.pick))}catch(e){}
  if(window.GA&&c!=='off'&&c!=='shuffle'&&c!=='all')try{GA.preload(musicName(slot))}catch(e){}
  if(MUS.wslot===slot&&!MUS.prev){MUS.want=null;musicSync()}}
function musicPreview(slot){if(!musicOn()||MUS.wslot===slot)return;const n=musicName(slot);if(n==='-')return;
  clearTimeout(MUS.prevT);MUS.prev=slot;MUS.want=null;GA.music(n,{fade:.5,once:true});
  MUS.prevT=setTimeout(()=>{MUS.prev=null;MUS.want=null;musicSync();renderMusic()},8000)}
function musicPreviewStop(){if(!MUS.prev)return;clearTimeout(MUS.prevT);MUS.prev=null;MUS.want=null;musicSync()}
function renderMusic(){const b=document.getElementById('musicbody');if(!b)return;
  const on=SND.music&&SND.on;let vol=.5;try{vol=GA.state().musVol}catch(e){}
  const chip=(cls,at,label)=>`<button type="button" class="mchip${cls}" ${Object.entries(at).map(([k,v])=>`${k}="${esc(v)}"`).join(' ')}>${label}</button>`;
  let h=`<div class="mtop">${chip(on?' on':'',{'data-a':'mmus'},'Music: '+(on?'on':'off'))}<label class="mvol">Volume <input id="mvol" type="range" min="0" max="1" step=".05" value="${vol}" aria-label="Music volume"></label></div>`;
  const allOn=MLOOPS.every(k=>MUS.pick[k]==='all');h+=`<div class="mtop">${chip(allOn?' on':'',{'data-a':'mall'},'⇄ Shuffle all songs')}</div>`;
  for(const [k,nm] of MSLOTS){const cur=MUS.pick[k],act=MUS.wslot===k&&on&&cur!=='off';
    let row='';for(const v of ['a','b'])row+=chip(cur===v?' on':'',{'data-a':'mpick','data-s':k,'data-c':v},esc(MTITLE[k+'-'+v]));
    row+=chip(cur==='shuffle'?' on':'',{'data-a':'mpick','data-s':k,'data-c':'shuffle'},'⇄ Shuffle')+(MLOOPS.includes(k)?chip(cur==='all'?' on':'',{'data-a':'mpick','data-s':k,'data-c':'all'},'⇄ All songs'):'')+chip(cur==='off'?' on':'',{'data-a':'mpick','data-s':k,'data-c':'off'},'Off');
    if(MUS.prev===k)row+=chip(' prev',{'data-a':'mprevx','data-s':k},'■ Stop preview');else if(!act&&cur!=='off'&&on)row+=chip(' prev',{'data-a':'mprev','data-s':k},'▶ Preview');
    h+=`<div class="mrow2"><h3>${nm}${act?' <small>playing now</small>':''}</h3><div class="mchips">${row}</div></div>`}
  b.innerHTML=h;const s=document.getElementById('mvol');if(s)s.addEventListener('input',()=>{try{GA.setVolume('music',+s.value)}catch(e){}})}
document.addEventListener('click',e=>{const t=e.target.closest('[data-a]');if(!t)return;const a=t.dataset.a;
  if(a==='musicopen'){try{document.getElementById('moremenu').classList.remove('on')}catch(x){}renderMusic();GX.show('musicd')}
  else if(a==='mpick'){musicPick(t.dataset.s,t.dataset.c);renderMusic()}
  else if(a==='mall'){const on=MLOOPS.every(k=>MUS.pick[k]==='all');MLOOPS.forEach(k=>musicPick(k,on?MDEF[k]:'all'));renderMusic()}
  else if(a==='mprev'){musicPreview(t.dataset.s);renderMusic()}
  else if(a==='mprevx'){musicPreviewStop();renderMusic()}
  else if(a==='mmus'){toggleMusic();renderMusic()}});
function extrasBoot(){const d=GX.drawer('musicd','Music',(()=>{const x=document.createElement('div');x.id='musicbody';return x})());
  setInterval(()=>{try{musicSync()}catch(e){}},800)}
extrasBoot();
