// ---------- painted art (tiles, table, card backs, title and end art) and music (per screen + the Music picker) ----------
// Every picture is a separate file in media/. Each layer switches itself on only after its file has loaded, so the
// drawn board stays as the fallback while loading, on "Simple pictures" and if a file is missing.
const MEDIA='media/',HR=document.documentElement;
let PAINT_ON=true;try{PAINT_ON=localStorage.getItem('soq_paint')!=='0'}catch(e){}
const PIMG={};
function pimg(f,cb){if(PIMG[f]!==undefined){if(cb&&PIMG[f]===1)cb();return}PIMG[f]=0;const i=new Image();i.onload=()=>{PIMG[f]=1;if(cb)cb()};i.src=MEDIA+f+'.webp'}
function unl(t){try{const u=GXC.unlocked().filter(x=>x.type===t);return u.length?u[u.length-1].id:null}catch(e){return null}}
const TABLES=['workshop','court','night','palace'],BACKS=['copper','lamp'];
function paintApply(){
  HR.classList.toggle('tp',PAINT_ON&&PIMG['tile-village']===1);HR.classList.toggle('ti',PAINT_ON&&PIMG['title']===1);
  const tb=unl('table'),tf=TABLES.includes(tb)?'table-'+tb:'';
  if(PAINT_ON&&tf)pimg(tf,()=>{HR.style.setProperty('--tbl','url('+MEDIA+tf+'.webp)');HR.classList.add('tbl','tbl-u')});
  else if(PAINT_ON){HR.style.removeProperty('--tbl');HR.classList.remove('tbl-u');if(PIMG['table-default']===1)HR.classList.add('tbl')}
  if(!PAINT_ON)HR.classList.remove('tbl','tbl-u');
  const cb=unl('cardback'),cf=BACKS.includes(cb)?'back-'+cb:'back-default';
  if(PAINT_ON)pimg(cf,()=>HR.style.setProperty('--cb','url('+MEDIA+cf+'.webp)'));
  HR.classList.toggle('cb',PAINT_ON&&PIMG[cf]===1);
}
function paintBoot(){['tile-village','title','table-default','table-default-phone','back-default','end-win','end-lose'].forEach(f=>pimg(f,paintApply));
  ['sacred','oasis','small','large','workshop','exchange','lake','city','ravine'].forEach(k=>pimg('tile-'+k));paintApply()}
// painted pictures on/off (Settings)
document.addEventListener('click',e=>{const b=e.target.closest('[data-paint]');if(!b)return;PAINT_ON=b.dataset.paint==='1';try{localStorage.setItem('soq_paint',PAINT_ON?'1':'0')}catch(x){}paintApply();if(G)render();renderSettings()});
// modal marker (title art behind the start card) and the end banner
(function(){const rm=renderModal;renderModal=function(){rm.apply(this,arguments);const m=$('#modal');if(m){m.dataset.k=UI.modal||'';if(UI.modal==='over'&&PAINT_ON){const won=G&&G.over&&viewP()&&G.over.win.includes(viewP().i),f=won?'end-win':'end-lose',b=m.querySelector('.mbox.over');
  if(b&&!b.querySelector('.endart')&&PIMG[f]===1){const d=document.createElement('div');d.className='endart '+(won?'win':'lose');d.setAttribute('aria-hidden','true');d.style.backgroundImage='url('+MEDIA+f+'.webp)';b.insertBefore(d,b.firstChild)}}}}})();
// ---------- music: five slots (Menu, Game, Last round, Victory, Defeat), two tracks each; choice a / b / shuffle / all / off ----------
const MSLOTS=[['tavern','Menu'],['main','Game'],['fight','Last round'],['victory','Victory'],['defeat','Defeat']];
const MTITLE={'tavern-a':'Warm Welcome','tavern-b':'Oud Lanterns','main-a':'Desert Evening','main-b':'Ninety Steps','fight-a':'Last Stand','fight-b':'Frame Drum Rising','victory-a':'Golden Gates','victory-b':'Oud and Ney','defeat-a':'Ten Seconds of Dusk','defeat-b':'Softly, Then Still'};
const MDEF={tavern:'all',main:'all',fight:'all',victory:'a',defeat:'a'};
const MUS={pick:Object.assign({},MDEF),res:{},sh:{},want:null,wslot:null,prev:null,prevT:0,last:null,since:0};
const MLOOPS=['tavern','main','fight'],MALL=Object.keys(MTITLE).filter(k=>MLOOPS.includes(k.split('-')[0])),MALL_MS=150000;
try{Object.assign(MUS.pick,JSON.parse(localStorage.getItem('soq_mpick')||'{}'))}catch(e){}
function musicSlot(){
  const st=$('#modal');if(!G||UI.modal==='start'||UI.modal==='lobby'||UI.modal==='offer')return['tavern',0];
  if(G.over&&!G.tut){const mp=viewP(),w=!mp||G.over.win.includes(mp.i);return[w?'victory':'defeat',1]}
  if(!G.tut&&(G.endTrig||(UI.camp&&UI.camp.boss)))return['fight',0];
  return['main',0]}
function musicName(slot){const c=MUS.pick[slot]||MDEF[slot];if(c==='off')return'-';
  if(c==='all'){if(!MUS.res[slot]){const pool=MALL.filter(k=>k!==MUS.last);MUS.res[slot]=pool[Math.floor(Math.random()*pool.length)]}return MUS.res[slot]}
  if(c==='shuffle'){if(!MUS.res[slot]){MUS.sh[slot]=MUS.sh[slot]===undefined?(Math.random()<.5?0:1):1-MUS.sh[slot];MUS.res[slot]=slot+'-'+'ab'[MUS.sh[slot]]}return MUS.res[slot]}
  return slot+'-'+(c==='b'?'b':'a')}
function musicPick(slot,c){MUS.pick[slot]=c;MUS.res[slot]=null;try{localStorage.setItem('soq_mpick',JSON.stringify(MUS.pick))}catch(e){}
  if(window.GA&&c!=='off'&&c!=='shuffle'&&c!=='all')try{GA.preload(musicName(slot))}catch(e){}
  if(MUS.wslot===slot&&!MUS.prev){MUS.want=null;musicSync()}}
// one cross-faded track at a time; called from a slow tick, the first tap and after the music button or a pick
function musicSync(){if(!window.GA||typeof GA_DATA==='undefined'||MUS.prev)return;
  if(!SND.music){MUS.want=null;GA.music(null,{fade:.6});return}
  const w=musicSlot();if(MUS.wslot!==w[0]){MUS.wslot=w[0];MUS.res[w[0]]=null}
  else if(MUS.pick[w[0]]==='all'&&!w[1]&&MUS.since&&Date.now()-MUS.since>MALL_MS)MUS.res[w[0]]=null;
  const n=musicName(w[0]);if(MUS.want===n)return;MUS.want=n;MUS.since=Date.now();if(n!=='-')MUS.last=n;
  if(n==='-'){GA.music(null,{fade:1});return}
  GA.music(n,{fade:w[1]?.6:1,once:!!w[1]});
  if(w[0]==='tavern'||w[0]==='main')setTimeout(()=>{try{const nx=w[0]==='tavern'?'main':'fight',c=MUS.pick[nx];if(c!=='off'&&c!=='shuffle'&&c!=='all')GA.preload(musicName(nx))}catch(e){}},4000)}
function musicPreview(slot){if(!window.GA||!SND.music||MUS.wslot===slot)return;try{GA.unlock()}catch(e){}
  const n=musicName(slot);if(n==='-')return;clearTimeout(MUS.prevT);MUS.prev=slot;MUS.want=null;GA.music(n,{fade:.5,once:true});
  MUS.prevT=setTimeout(()=>{MUS.prev=null;MUS.want=null;musicSync();renderMusic()},8000)}
function musicPreviewStop(){if(!MUS.prev)return;clearTimeout(MUS.prevT);MUS.prev=null;MUS.want=null;musicSync();renderMusic()}
function renderMusic(){const b=$('#musicbody');if(!b)return;const on=SND.music;let vol=.5;try{vol=GA.state().musVol}catch(e){}
  const chip=(cls,at,t)=>`<button type="button" class="mchip${cls}" ${Object.entries(at).map(([k,v])=>`${k}="${v}"`).join(' ')}>${t}</button>`;
  const sig=JSON.stringify([on,MUS.pick,MUS.prev,MUS.wslot]);if(b._sig===sig)return;b._sig=sig;
  const allOn=MLOOPS.every(k=>MUS.pick[k]==='all');
  b.innerHTML=`<div class="mtop">${chip(on?' on':'',{'data-m':'mus'},'Music: '+(on?'on':'off'))}<label class="mvol">Volume <input id="mvol" type="range" min="0" max="1" step="0.05" value="${vol}" aria-label="Music volume"></label></div>
   <div class="mtop">${chip(allOn?' on':'',{'data-m':'all'},'⇄ Shuffle all songs')}</div>`+MSLOTS.map(([k,nm])=>{const cur=MUS.pick[k],act=MUS.wslot===k&&on&&cur!=='off';
    return `<div class="mrow2"><h5>${nm}${act?' <small>playing now</small>':''}</h5><div class="mchips">`+['a','b'].map(v=>chip(cur===v?' on':'',{'data-m':'pick','data-s':k,'data-c':v},MTITLE[k+'-'+v])).join('')
     +chip(cur==='shuffle'?' on':'',{'data-m':'pick','data-s':k,'data-c':'shuffle'},'⇄ Shuffle')+(MLOOPS.includes(k)?chip(cur==='all'?' on':'',{'data-m':'pick','data-s':k,'data-c':'all'},'⇄ All songs'):'')+chip(cur==='off'?' on':'',{'data-m':'pick','data-s':k,'data-c':'off'},'Off')
     +(MUS.prev===k?chip(' prev',{'data-m':'prevx'},'■ Stop preview'):(!act&&cur!=='off'&&on?chip(' prev',{'data-m':'prev','data-s':k},'▶ Preview'):''))+'</div></div>'}).join('')}
document.addEventListener('input',e=>{if(e.target&&e.target.id==='mvol'&&window.GA)GA.setVolume('music',+e.target.value)});
document.addEventListener('click',e=>{const b=e.target.closest('[data-m]');if(!b)return;const m=b.dataset.m;
  if(m==='mus')toggleMusic();else if(m==='all'){const on=MLOOPS.every(k=>MUS.pick[k]==='all');MLOOPS.forEach(k=>musicPick(k,on?MDEF[k]:'all'))}
  else if(m==='pick')musicPick(b.dataset.s,b.dataset.c);else if(m==='prev')musicPreview(b.dataset.s);else if(m==='prevx'){musicPreviewStop();return}
  const mb=$('#musicbody');if(mb)mb._sig=null;renderMusic()});
function paintInit(){paintBoot();if(typeof GX!=='undefined'){const os=GX.onShow;GX.onShow=id=>{if(os)os(id);if(id==='musicd'){const mb=$('#musicbody');if(mb)mb._sig=null;renderMusic()}}}
  setInterval(()=>{try{paintApply();musicSync()}catch(e){}},800);document.addEventListener('pointerdown',()=>setTimeout(()=>{try{musicSync()}catch(e){}},60),{capture:true})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',paintInit);else paintInit();
