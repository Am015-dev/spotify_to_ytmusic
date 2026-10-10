// ---------- painted art (field textures under the tile drawing, table, tile backs, pieces, title and end art) and music (per screen + the Music picker) ----------
// Every picture is a separate file in media/. Each layer switches itself on only after its file has loaded, so the flat drawn board stays as the fallback
// while loading, on "Pictures: simple" and if a file is missing. The tile geometry (edges, roads, walls) is untouched: textures only replace the flat fills.
const MEDIA='media/',HR=document.documentElement;
let PAINT_ON=true;try{PAINT_ON=localStorage.getItem('rv_paint')!=='0'}catch(e){}
const PIMG={};
function pimg(f,cb){if(PIMG[f]!==undefined){if(cb&&PIMG[f]===1)cb();return}PIMG[f]=0;const i=new Image();i.onload=()=>{PIMG[f]=1;if(cb)cb()};i.src=(f.includes('/')?f:MEDIA+f)+'.webp'}
function unl(t){try{const u=GXC.unlocked().filter(x=>x.type===t);return u.length?u[u.length-1].id:null}catch(e){return null}}
// texture name -> [file, size of one repeat in tile units]
const TEXD={field:60,road:30,river:40,lake:34,garden:20,hedge:20,hub:20,wall:25,mon:40,'town-basilica':50,town:50,roof:24};
function texDefs(){let d='';for(const k in TEXD){if(PIMG['tex-'+k]!==1)continue;const s=TEXD[k];d+=`<pattern id="tx-${k}" patternUnits="userSpaceOnUse" width="${s}" height="${s}"><image href="${MEDIA}tex-${k}.webp" width="${s}" height="${s}" preserveAspectRatio="none"/></pattern>`}return d}
function texApply(){TEXSET={};let any=false;
  if(PAINT_ON)for(const k in TEXD)if(PIMG['tex-'+k]===1){TEXSET[k]=1;any=true}
  let el=document.getElementById('txdefs');if(!el){el=document.createElement('div');el.id='txdefs';el.setAttribute('aria-hidden','true');el.style.cssText='position:absolute;width:0;height:0;overflow:hidden';document.body.insertBefore(el,document.body.firstChild)}
  el.innerHTML=any?`<svg width="0" height="0" style="position:absolute"><defs>${texDefs()}</defs></svg>`:'';
  if(typeof G!=='undefined'&&G&&typeof UI!=='undefined'){try{for(const k in UI.tl){const T=G.tiles[k];if(T)UI.tl[k].innerHTML=tileSvg(T.t,T.r)}UI.handKey=null;if(G.cur&&!G.over){renderHand();renderGlows()}}catch(e){}}}
// pieces: painted figure on a player-coloured disc (seat chips keep the drawn icons: they are tiny and need the colour)
const PCF={meeple:'models/piece-meeple',champ:'models/piece-champ',mason:'models/piece-mason',hog:'models/piece-hog'};   // 3D renders of the follower models (transparent, 3/4 view); the player colour is the disc behind them
function pcHtml(n){return PAINT_ON&&PIMG[PCF[n]]===1?`<span class="pc"><img src="${PCF[n]}.webp" alt="" draggable="false"></span>`:ico(n)}
const TABLES=['harvest','riverbank','sable-hall'],BACKS=['tavern','raven'];
function paintApply(){
  HR.classList.toggle('ti',PAINT_ON&&PIMG['title']===1);
  const tb=unl('table'),tf=TABLES.includes(tb)?'table-'+tb:'';
  if(PAINT_ON&&tf)pimg(tf,()=>{HR.style.setProperty('--tbl','url('+MEDIA+tf+'.webp)');HR.classList.add('tbl','tbl-u')});
  else{HR.style.removeProperty('--tbl');HR.classList.remove('tbl-u');HR.classList.toggle('tbl',PAINT_ON&&PIMG['table-default']===1)}
  const cb=unl('cardback'),cf=BACKS.includes(cb)?'back-'+cb:'back-default';
  if(PAINT_ON)pimg(cf,()=>HR.style.setProperty('--cb','url('+MEDIA+cf+'.webp)'));
  HR.classList.toggle('cb',PAINT_ON&&PIMG[cf]===1)}
function paintBoot(){const all=Object.keys(TEXD).map(k=>'tex-'+k);let left=all.length;
  all.forEach(f=>pimg(f,()=>{if(--left===0)texApply()}));
  ['title','title-phone','table-default','table-default-phone','back-default','end-win','end-lose',...Object.values(PCF)].forEach(f=>pimg(f,paintApply));
  ['table-harvest','table-riverbank','table-sable-hall','back-tavern','back-raven'].forEach(f=>pimg(f));paintApply()}
function paintToggle(){PAINT_ON=!PAINT_ON;try{localStorage.setItem('rv_paint',PAINT_ON?'1':'0')}catch(x){}texApply();paintApply()}
// end banner on the result card and on the story result screen
function endBanner(box,won){if(!box||box.querySelector('.endart')||!PAINT_ON)return;const f=won?'end-win':'end-lose';if(PIMG[f]!==1)return;
  const d=document.createElement('div');d.className='endart '+(won?'win':'lose');d.setAttribute('aria-hidden','true');d.style.backgroundImage='url('+MEDIA+f+'.webp)';box.insertBefore(d,box.firstChild)}
(function(){const sr=showResult;showResult=function(){sr.apply(this,arguments);try{const win=G.over.win,me=G.pl.find(p=>p.human),w=!human()||(me&&win.includes(me.i)&&win.length===1);endBanner($('#modal .card[aria-label=Result]'),w)}catch(e){}}})();
new MutationObserver(()=>{const r=document.querySelector('.gxc-res-on .gxc-res');if(r&&!r.querySelector('.endart'))endBanner(r,/\bwon\b/.test(r.closest('.gxc-res-on').className))}).observe(document.body,{childList:true,subtree:true});
// ---------- music: five slots (Menu, Game, Last tiles, Victory, Defeat), two tracks each; choice a / b / shuffle / all / off ----------
const MSLOTS=[['tavern','Menu'],['main','Game'],['fight','Last tiles'],['victory','Victory'],['defeat','Defeat']];
const MTITLE={'tavern-a':'Lute of the Meadow Fair','tavern-b':'Hearthlight Jig','main-a':"The Mason's Morning",'main-b':'Lute and Limewash','fight-a':'Keep of Hours','fight-b':'Ramshackle Round','victory-a':"The Jester's Triumph",'victory-b':'Crown of Green Fields','defeat-a':'Wistful Vale','defeat-b':'Fading to Grey'};
const MDEF={tavern:'all',main:'all',fight:'all',victory:'a',defeat:'a'};
const MUS={pick:Object.assign({},MDEF),res:{},sh:{},want:null,wslot:null,prev:null,prevT:0,last:null,since:0};
const MLOOPS=['tavern','main','fight'],MALL=Object.keys(MTITLE).filter(k=>MLOOPS.includes(k.split('-')[0])),MALL_MS=150000;
try{Object.assign(MUS.pick,JSON.parse(localStorage.getItem('rv_mpick')||'{}'))}catch(e){}
function musicSlot(){
  if(typeof G==='undefined'||!G||document.querySelector('#modal .card[aria-label=Start]'))return['tavern',0];
  if(G.over&&!UI.tut){const me=G.pl.find(p=>p.human),w=!me||(G.over.win.includes(me.i)&&G.over.win.length===1);return[w?'victory':'defeat',1]}
  if(!UI.tut&&((UI.camp&&UI.camp.boss)||tilesLeft()<=5))return['fight',0];
  return['main',0]}
function musicName(slot){const c=MUS.pick[slot]||MDEF[slot];if(c==='off')return'-';
  if(c==='all'){if(!MUS.res[slot]){const pool=MALL.filter(k=>k!==MUS.last);MUS.res[slot]=pool[Math.floor(Math.random()*pool.length)]}return MUS.res[slot]}
  if(c==='shuffle'){if(!MUS.res[slot]){MUS.sh[slot]=MUS.sh[slot]===undefined?(Math.random()<.5?0:1):1-MUS.sh[slot];MUS.res[slot]=slot+'-'+'ab'[MUS.sh[slot]]}return MUS.res[slot]}
  return slot+'-'+(c==='b'?'b':'a')}
function musicPick(slot,c){MUS.pick[slot]=c;MUS.res[slot]=null;try{localStorage.setItem('rv_mpick',JSON.stringify(MUS.pick))}catch(e){}
  if(GAOK&&c!=='off'&&c!=='shuffle'&&c!=='all')try{GA.preload(musicName(slot))}catch(e){}
  if(MUS.wslot===slot&&!MUS.prev){MUS.want=null;musicSync()}}
function musicSync(){if(!GAOK||MUS.prev)return;
  if(!SND.music){MUS.want=null;GA.music(null,{fade:.6});return}
  const w=musicSlot();if(MUS.wslot!==w[0]){MUS.wslot=w[0];MUS.res[w[0]]=null}
  else if(MUS.pick[w[0]]==='all'&&!w[1]&&MUS.since&&Date.now()-MUS.since>MALL_MS)MUS.res[w[0]]=null;
  const n=musicName(w[0]);if(MUS.want===n)return;MUS.want=n;MUS.since=Date.now();if(n!=='-')MUS.last=n;
  if(n==='-'){GA.music(null,{fade:1});return}
  GA.music(n,{fade:w[1]?.6:1,once:!!w[1]});
  if(w[0]==='tavern'||w[0]==='main')setTimeout(()=>{try{const nx=w[0]==='tavern'?'main':'fight',c=MUS.pick[nx];if(c!=='off'&&c!=='shuffle'&&c!=='all')GA.preload(musicName(nx))}catch(e){}},4000)}
function musicPreview(slot){if(!GAOK||!SND.music||MUS.wslot===slot)return;try{GA.unlock()}catch(e){}
  const n=musicName(slot);if(n==='-')return;clearTimeout(MUS.prevT);MUS.prev=slot;MUS.want=null;GA.music(n,{fade:.5,once:true});
  MUS.prevT=setTimeout(()=>{MUS.prev=null;MUS.want=null;musicSync();renderMusic()},8000)}
function musicPreviewStop(){if(!MUS.prev)return;clearTimeout(MUS.prevT);MUS.prev=null;MUS.want=null;musicSync();renderMusic()}
function musicOpen(){let m=document.getElementById('musicm');if(!m){m=document.createElement('div');m.id='musicm';m.className='scrim';m.innerHTML='<div class="card drawer mus" role="dialog" aria-label="Music"><h2>Music</h2><div id="musicbody"></div><button class="btn big" data-m="close">Done</button></div>';document.body.appendChild(m)}m.hidden=false;const b=$('#musicbody');b._sig=null;renderMusic()}
function renderMusic(){const b=$('#musicbody');if(!b)return;const on=SND.music;let vol=.5;try{vol=GA.state().musVol}catch(e){}
  const chip=(cls,at,t)=>`<button type="button" class="mchip${cls}" ${Object.entries(at).map(([k,v])=>`${k}="${v}"`).join(' ')}>${t}</button>`;
  const sig=JSON.stringify([on,MUS.pick,MUS.prev,MUS.wslot]);if(b._sig===sig)return;b._sig=sig;
  const allOn=MLOOPS.every(k=>MUS.pick[k]==='all');
  b.innerHTML=`<div class="mtop">${chip(on?' on':'',{'data-m':'mus'},'Music: '+(on?'on':'off'))}<label class="mvol">Volume <input id="mvol" type="range" min="0" max="1" step="0.05" value="${vol}" aria-label="Music volume"></label></div>
   <div class="mtop">${chip(allOn?' on':'',{'data-m':'all'},'⇄ Shuffle all songs')}</div>`+MSLOTS.map(([k,nm])=>{const cur=MUS.pick[k],act=MUS.wslot===k&&on&&cur!=='off';
    return `<div class="mrow2"><h5>${nm}${act?' <small>playing now</small>':''}</h5><div class="mchips">`+['a','b'].map(v=>chip(cur===v?' on':'',{'data-m':'pick','data-s':k,'data-c':v},MTITLE[k+'-'+v])).join('')
     +chip(cur==='shuffle'?' on':'',{'data-m':'pick','data-s':k,'data-c':'shuffle'},'⇄ Shuffle')+(MLOOPS.includes(k)?chip(cur==='all'?' on':'',{'data-m':'pick','data-s':k,'data-c':'all'},'⇄ All songs'):'')+chip(cur==='off'?' on':'',{'data-m':'pick','data-s':k,'data-c':'off'},'Off')
     +(MUS.prev===k?chip(' prev',{'data-m':'prevx'},'■ Stop preview'):(!act&&cur!=='off'&&on?chip(' prev',{'data-m':'prev','data-s':k},'▶ Preview'):''))+'</div></div>'}).join('')}
document.addEventListener('input',e=>{if(e.target&&e.target.id==='mvol'&&GAOK)GA.setVolume('music',+e.target.value)});
document.addEventListener('click',e=>{const b=e.target.closest('[data-m]');if(!b)return;const m=b.dataset.m;
  if(m==='close'){const mm=document.getElementById('musicm');if(mm)mm.hidden=true;musicPreviewStop();return}
  if(m==='mus')toggleMusic();else if(m==='all'){const on=MLOOPS.every(k=>MUS.pick[k]==='all');MLOOPS.forEach(k=>musicPick(k,on?MDEF[k]:'all'))}
  else if(m==='pick')musicPick(b.dataset.s,b.dataset.c);else if(m==='prev')musicPreview(b.dataset.s);else if(m==='prevx'){musicPreviewStop();return}
  const mb=$('#musicbody');if(mb)mb._sig=null;renderMusic()});
function paintInit(){paintBoot();setInterval(()=>{try{paintApply();musicSync()}catch(e){}},800);document.addEventListener('pointerdown',()=>setTimeout(()=>{try{musicSync()}catch(e){}},60),{capture:true})}
paintInit();
