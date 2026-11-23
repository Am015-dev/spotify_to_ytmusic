// ===================== Feel: juice on every move (R34 row 7) =====================
// Every effect is decoration only: pointer-events none, never blocks a tap, never longer than ~0.6 s, never changes G.
// 1 each drop dips its tile and plays a note one step higher than the last, so a walk builds up like a phrase
// 2 the last drop LANDS: the tile squashes and a ring in the collected tribe's colour bursts out of it
// 3 points fly as a gold spark from where they were earned into the score star, which counts up and glows
// 4 coins jingle out of the tile into the seat; a big haul (12+ pts at once) flashes the board edge gold
const JU={drops:0,at:-1,raf:{}};
const JU_COL={vizier:'#f2c230',elder:'#f4f1ea',merchant:'#3fa34d',builder:'#2f6fd6',assassin:'#d23a2e',artisan:'#9a5bd0'};
function juOk(){return typeof ANIM!=='undefined'&&ANIM&&!document.hidden&&!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)}
function juNote(k){try{if(!SND.on||!SND.ctx||SND.ctx.state!=='running')return;const f=392*Math.pow(1.122,Math.min(k,9));tone(f,.09,{type:'triangle',v:.07})}catch(e){}}
function juCls(el,c,ms){if(!el)return;el.classList.remove(c);void el.offsetWidth;el.classList.add(c);setTimeout(()=>el.classList.remove(c),ms||600)}
function juRing(at,col,big){const fx=$('#fx');if(!fx)return;const r=document.createElement('div');r.className='jring'+(big?' big':'');r.style.left=at.x+'px';r.style.top=at.y+'px';r.style.setProperty('--jc',col||'#ffd35a');fx.appendChild(r);setTimeout(()=>r.remove(),600)}
function juCount(i,from,to){const se=seatEl(i);const b=se&&se.querySelector('.ss');if(!b)return;const n=[...b.childNodes].find(x=>x.nodeType===3);if(!n)return;
  cancelAnimationFrame(JU.raf[i]);const t0=performance.now(),dur=480;const step=t=>{const k=Math.min(1,(t-t0)/dur);const v=Math.round(from+(to-from)*(1-Math.pow(1-k,3)));
    const live=[...b.childNodes].find(x=>x.nodeType===3);if(live!==n||!n.isConnected)return;n.nodeValue=String(k>=1?to:v);if(k<1)JU.raf[i]=requestAnimationFrame(step)};JU.raf[i]=requestAnimationFrame(step)}
function juMove(cur){const mv=G.move;const n=mv?mv.drops.length:0;
  if(mv&&n>JU.drops&&(mv.start===JU.at||JU.at<0||JU.drops===0)){const te=tileEl(mv.at);juCls(te,'jdip',320);juNote(n-1)}
  JU.drops=mv?n:0;JU.at=mv?mv.start:-1}
function juice(prev,cur){if(!G||!prev||!cur)return;juMove(cur);if(!juOk()||G.over)return;
  const actor=prev.cur!=null&&prev.cur>=0?prev.cur:cur.cur;
  // 2 the landing
  if(prev.step==='move'&&cur.step!=='move'&&cur.act&&cur.act.tile!=null){const te=tileEl(cur.act.tile);if(te){juCls(te,'jland',560);juRing(ctr(te.getBoundingClientRect()),JU_COL[cur.act.color])}}
  const src=cur.act&&cur.act.tile!=null&&tileEl(cur.act.tile)?ctr(tileEl(cur.act.tile).getBoundingClientRect()):null;
  // 3 points into the star
  cur.tot.forEach((t,i)=>{const d=t-(prev.tot[i]||0);if(!d)return;const se=seatEl(i);if(!se)return;const ss=se.querySelector('.ss')||se;const to=ctr(ss.getBoundingClientRect());
    juCount(i,prev.tot[i]||0,t);if(d<0){juCls(se,'jhurt',520);return}
    const from=src&&i===actor?src:{x:to.x,y:to.y+40};const sparks=Math.min(5,1+Math.floor(d/4));
    for(let k=0;k<sparks;k++)flyEl('<i class="jsp"></i>','jgold',{x:from.x+(k-(sparks-1)/2)*10,y:from.y},to,{delay:k*25,dur:320,big:1.6,end2:.5,fade:true,end:k===0?()=>juCls(se,'jglow',260):null});   // R38: the whole chain (sparks + star pulse) ends by 0.6 s: last spark lands at 420 ms, the pulse runs 320-580 ms, no second ring
    if(d>=12&&G.pl[i]&&G.pl[i].human){const fx=$('#fx');if(fx){const v=document.createElement('div');v.className='jhaul';fx.appendChild(v);setTimeout(()=>v.remove(),600)}}});
  // 4 coins out of the tile
  cur.coins.forEach((c,i)=>{const d=c-(prev.coins[i]||0);if(d<=0||!src||i!==actor)return;const to=seatPoint(i);const n=Math.min(6,1+Math.floor(d/3));
    for(let k=0;k<n;k++)flyEl('<i class="jcoin"></i>','jcn',{x:src.x+(k%3-1)*9,y:src.y+Math.floor(k/3)*8},to,{delay:k*30,dur:380,big:1.4,end2:.6,fade:true});
    try{if(SND.on&&typeof sfx==='function')sfx('coins')}catch(e){}})}
(function(){if(typeof animate!=='function')return;const o=animate;animate=function(prev){o.apply(this,arguments);try{juice(prev,snapState())}catch(e){console.error(e)}}})();
// ===================== Claims made obvious (iPhone report) =====================
// A claim (camel or tent), a palm or a palace, yours or the rival's: the tile flashes once (0.8 s, finite) in the owner's colour and ONE line
// says what happened. The first time only, a legend line tells what the marks on the board mean. Decoration only: never blocks a tap, never changes G.
function claimNote(f){if(!G||UI.sim||G.over||f.p==null||f.x==null)return;const t=G.board[f.x],p=G.pl[f.p];if(!t||!p)return;const you=p.nm==='You'||(p.human&&G.pl.filter(q=>q.human).length===1);
  const who=you?'You':p.nm,nm=TILEDEF[t.k].n,pl=tileCoord(t.i);let line;
  if(f.t==='camel')line=f.w==='tent'?`${who} pitched the tent on ${nm} ${pl}: ${t.v} at end`:you?`You claimed ${nm} ${pl}: +${t.v} at end`:`${who} claimed ${nm} ${pl}: +${t.v} at end`;
  else line=f.w==='pal'?`${who} raised a palace on ${nm} ${pl}: +5 at end`:`${who} planted a palm on ${nm} ${pl}: +3 at end`;
  UI.cflash={i:t.i,until:Date.now()+800};
  let el=document.getElementById('cnote');if(!el){el=document.createElement('div');el.id='cnote';el.setAttribute('role','status');el.setAttribute('data-help','');document.body.appendChild(el)}
  el.style.setProperty('--pc',PCOL[p.i]);el.textContent=line;const g=document.getElementById('grid');if(g){const r=g.getBoundingClientRect();el.style.top=Math.max(4,r.top-40)+'px'}
  el.classList.remove('on');void el.offsetWidth;el.classList.add('on');clearTimeout(UI.cnT);UI.cnT=setTimeout(()=>el.classList.remove('on'),2600);
  let seen=0;try{seen=localStorage.getItem('soq_legend')}catch(e){}
  if(!seen){try{localStorage.setItem('soq_legend','1')}catch(e){}let lg=document.getElementById('clegend');if(!lg){lg=document.createElement('div');lg.id='clegend';lg.setAttribute('data-help','');document.body.appendChild(lg)}
    lg.innerHTML='🐪 = claimed (owner’s colour) · 🌴 +3 · 🏰 +5';const gr=g?g.getBoundingClientRect():null;const mk=document.getElementById('mkt'),mr=mk?mk.getBoundingClientRect():null;let tb=gr?gr.bottom:100;document.querySelectorAll('#grid .tile').forEach(x=>{tb=Math.max(tb,x.getBoundingClientRect().bottom)});lg.style.top=(tb+4)+'px';lg.classList.add('on');setTimeout(()=>lg.classList.remove('on'),5200)}
  setTimeout(()=>{try{renderGrid()}catch(e){}},0)}
