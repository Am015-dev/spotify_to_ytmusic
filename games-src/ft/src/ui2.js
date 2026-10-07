// ---------- UI part 2: fitting the grid, animating what changed between two renders, the chooser pop-over, the ghost finger ----------
function fit(){const gw=$('#gw'),g=$('#grid');if(!gw||!g||!G)return;const W=G.W,H=G.H,gap=3;const bw=gw.clientWidth,bh=gw.clientHeight;if(bw<20||bh<20)return;
  let cw=Math.floor((bw-(W-1)*gap)/W),ch=Math.floor((bh-(H-1)*gap)/H);ch=Math.min(ch,Math.round(cw*1.55));cw=Math.min(cw,Math.round(ch*1.6));
  g.style.width=(cw*W+(W-1)*gap)+'px';g.style.height=(ch*H+(H-1)*gap)+'px';
  const ms=Math.max(10,Math.min(26,Math.round(Math.min(cw*.27,(ch-27)/2.36))));g.style.setProperty('--ms',ms+'px');g.style.setProperty('--cw',cw+'px');g.style.setProperty('--ch',ch+'px');
  // how many people fit on a tile in two rows: past that they are drawn smaller
  const cap=Math.max(1,Math.floor((cw-10)/(ms+2)))*Math.max(1,Math.floor((ch-27)/(ms*1.18+2)));
  for(const e of g.querySelectorAll('.tile[data-n]')){const n=+e.dataset.n;e.classList.toggle('m7',n>cap&&n<=cap*1.7);e.classList.toggle('m10',n>cap*1.7)}}
function relayout(sz){const R=document.documentElement;R.classList.toggle('land',sz.w>sz.h&&sz.w>=520);R.classList.toggle('short',sz.h<=600);if(G){fit();placeChz();placeFinger()}}
if(typeof GXV!=='undefined')GXV.watch(relayout);else addEventListener('resize',()=>relayout({w:innerWidth,h:innerHeight}));
// ---------- flights ----------
const ctr=r=>({x:r.left+r.width/2,y:r.top+r.height/2});
const spd=()=>UI.speed>1?UI.speed:1;
function flyEl(inner,cls,from,to,o){o=o||{};const fx=$('#fx');if(!fx||!ANIM)return null;const el=document.createElement('div');el.className='fl '+(cls||'');el.innerHTML=inner;const ms=getComputedStyle($('#grid')).getPropertyValue('--ms')||'18px';el.style.setProperty('--ms',ms);
  el.style.left=from.x+'px';el.style.top=from.y+'px';fx.appendChild(el);const dur=(o.dur||420)/spd();
  const dx=to.x-from.x,dy=to.y-from.y;const lift=Math.min(26,Math.hypot(dx,dy)*.25);let done=false;const fin=()=>{if(done)return;done=true;el.remove();if(o.end)o.end()};
  try{const a=el.animate([{transform:'translate(-50%,-50%) scale(1)',opacity:1},{transform:`translate(calc(-50% + ${dx/2}px),calc(-50% + ${dy/2-lift}px)) scale(${o.big||1.25})`,opacity:1,offset:.5},{transform:`translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px)) scale(${o.end2==null?1:o.end2})`,opacity:o.fade?0:1}],{duration:dur,delay:(o.delay||0)/spd(),easing:'cubic-bezier(.4,.1,.3,1)',fill:'both'});
    a.onfinish=fin;setTimeout(fin,dur+(o.delay||0)/spd()+400)}catch(e){fin()}return el}
function tileEl(i){return document.querySelector(`#grid [data-tile="${i}"]`)}
function seatEl(i){return document.querySelector(`#seats [data-seat="${i}"]`)}
function floatText(txt,at,cls){const fx=$('#fx');if(!fx||!ANIM)return;const el=document.createElement('div');el.className='ft '+(cls||'');el.textContent=txt;el.style.left=at.x+'px';el.style.top=at.y+'px';fx.appendChild(el);setTimeout(()=>el.remove(),1500/spd())}
function animate(prev){const cur=snapState();if(!ANIM||!prev||document.hidden)return;const flights=[];const gains={},loss={};
  for(let i=0;i<cur.tiles.length;i++){const a=prev.tiles[i],b=cur.tiles[i];if(!a||!b)continue;const ca={},cb={};for(const c of a.m.concat(a.hand))ca[c]=(ca[c]||0)+1;for(const c of b.m.concat(b.hand))cb[c]=(cb[c]||0)+1;
    for(const c of new Set([...Object.keys(ca),...Object.keys(cb)])){const d=(cb[c]||0)-(ca[c]||0);for(let k=0;k<Math.abs(d);k++)(d>0?(gains[c]=gains[c]||[]):(loss[c]=loss[c]||[])).push(i)}}
  const W=G.W,dist=(a,b)=>Math.abs(a%W-b%W)+Math.abs(Math.floor(a/W)-Math.floor(b/W));
  const actor=prev.cur!=null&&prev.cur>=0?prev.cur:cur.cur;const killing=prev.step==='tribe'&&prev.act&&prev.act.color==='assassin';
  for(const c of new Set([...Object.keys(gains),...Object.keys(loss)])){const g=(gains[c]||[]).slice(),l=(loss[c]||[]).slice();
    while(g.length&&l.length){let bi=0,bj=0,bd=1e9;for(let x=0;x<l.length;x++)for(let y=0;y<g.length;y++){const d=dist(l[x],g[y]);if(d<bd){bd=d;bi=x;bj=y}}flights.push({c,from:{tile:l[bi]},to:{tile:g[bj]}});l.splice(bi,1);g.splice(bj,1)}
    for(const t of l)flights.push({c,from:{tile:t},to:killing?null:{seat:actor}})}
  let n=0;const nHide={};
  for(const f of flights){const fe=f.from.tile!=null?tileEl(f.from.tile):null;if(!fe)continue;const fr=fe.querySelector('.ms')||fe;const from=ctr(fr.getBoundingClientRect());let to,hid=null,fadeOnly=false;
    if(f.to&&f.to.tile!=null){const te=tileEl(f.to.tile);if(!te)continue;const nodes=[...te.querySelectorAll(`.mp[data-c="${f.c}"]`)].filter(x=>!x.classList.contains('fhid'));hid=nodes[nodes.length-1]||null;to=ctr((hid||te).getBoundingClientRect());if(hid)hid.classList.add('fhid')}
    else if(f.to&&f.to.seat!=null){const se=seatEl(f.to.seat);if(!se)continue;to=ctr(se.getBoundingClientRect())}else{to={x:from.x,y:from.y-20};fadeOnly=true}
    flyEl(`<i class="mp" data-c="${f.c}"></i>`,'',from,to,{delay:n*70,end:()=>{if(hid)hid.classList.remove('fhid')},fade:!!(f.to&&f.to.seat!=null)||fadeOnly,end2:f.to&&f.to.seat!=null?.4:fadeOnly?1.6:1});n++}
  // the goods row and the djinn row: a card that left flies to whoever took it; new ones slide in
  const take=(oldA,newA)=>{const left=[];let j=0;const used=[];for(let i=0;i<oldA.length;i++){if(j<newA.length&&newA[j]===oldA[i]){j++}else left.push(i)}return {left,added:Math.max(0,newA.length-(oldA.length-left.length))}};
  const mk=take(prev.market,cur.market);const rows=$('#mkt');
  if(mk.left.length&&rows){const slots=rows.querySelectorAll('.mrow .mcard');for(const i of mk.left){const s=slots[i];if(!s)continue;flyEl(`<span class="mi">${RICON[prev.market[i]]}</span>`,'card',ctr(s.getBoundingClientRect()),seatPoint(actor),{delay:n*70,fade:true,end2:.4});n++}}
  if(mk.added&&rows){const slots=rows.querySelectorAll('.mrow .mcard:not(.empty)');for(let k=Math.max(0,slots.length-mk.added);k<slots.length;k++){slots[k].classList.add('newc')}}
  const dj=take(prev.djRow,cur.djRow);if(dj.left.length&&rows){const dr=rows.querySelector('.drow');const r=dr.getBoundingClientRect();for(const i of dj.left){flyEl(`<span class="mi">🧞</span>`,'card',{x:r.left+r.width*(i+.5)/Math.max(3,prev.djRow.length),y:r.top+r.height/2},seatPoint(actor),{delay:n*70,fade:true,end2:.4});n++}}
  if(dj.added&&rows){const cs=rows.querySelectorAll('.drow .dcard:not(.th)');for(let k=Math.max(0,cs.length-dj.added);k<cs.length;k++)cs[k].classList.add('newc')}
  // tokens that appeared: camels, tents, palms, palaces
  for(let i=0;i<cur.tiles.length;i++){const a=prev.tiles[i],b=cur.tiles[i];if(!a)continue;const te=tileEl(i);if(!te)continue;
    if((b.camel!=null&&a.camel!==b.camel)||(b.tent!=null&&a.tent!==b.tent)){const o=te.querySelector('.own');if(o)o.classList.add('popin')}
    if(b.palm>a.palm||b.pal>a.pal){for(const o of te.querySelectorAll('.tok'))o.classList.add('popin')}}
  // scores pop up where they are earned
  const tf=cur.act&&cur.act.tile!=null?tileEl(cur.act.tile):null;
  cur.tot.forEach((t,i)=>{const d=t-(prev.tot[i]||0);if(!d)return;const se=seatEl(i);if(!se)return;const ss=se.querySelector('.ss');if(ss){ss.classList.add('bump')}
    const at=tf&&i===actor?ctr(tf.getBoundingClientRect()):ctr(se.getBoundingClientRect());floatText((d>0?'+':'−')+Math.abs(d),at,d>0?'up':'dn');if(tf&&i===actor){const p2=ctr(se.getBoundingClientRect());if(Math.hypot(p2.x-at.x,p2.y-at.y)>40)floatText((d>0?'+':'−')+Math.abs(d),p2,d>0?'up':'dn')}})}
function seatPoint(i){const se=seatEl(i);return se?ctr(se.getBoundingClientRect()):{x:innerWidth/2,y:20}}
// ---------- the pop-over for a choice on a tile, a seat or a card ----------
function placeChz(){const el=$('#chz');if(!el)return;const c=UI.chz;if(!c||!G){el.hidden=true;el.innerHTML='';return}
  el.innerHTML=c.opts.map((o,i)=>`<button class="chb glow" data-chz="${i}">${o.html}</button>`).join('');el.hidden=false;
  const a=c.anchor;const ae=a.tile!=null?tileEl(a.tile):a.seat!=null?seatEl(a.seat):a.dj?document.querySelector(`[data-dj="${a.dj}"],[data-th="${String(a.dj).replace('t:','')}"]`):null;if(!ae){el.hidden=true;return}
  const r=ae.getBoundingClientRect(),w=el.offsetWidth,h=el.offsetHeight;let x=r.left+r.width/2-w/2;x=Math.max(6,Math.min(innerWidth-w-6,x));let y=r.top-h-8;if(y<50)y=r.bottom+8;
  el.style.left=x+'px';el.style.top=y+'px'}
// ---------- the ghost finger: shows one real, legal move to the new player, and stays away after a few moves ----------
const FING={n:0,max:10,key:'',t:null};try{FING.n=+localStorage.getItem('soq_fing')||0}catch(e){}
function fingerUsed(m){FING.n++;try{localStorage.setItem('soq_fing',String(FING.n))}catch(e){}const f=$('#finger');if(f){f.hidden=true;FING.key=''}}
function fingerEl(m){const q=s=>document.querySelector(s);
  switch(m.act){case 'bid':case 'sell':case 'end':case 'undo':case 'tribe':return [...document.querySelectorAll('[data-mv]')].find(b=>b.dataset.mv===JSON.stringify(m))||null;
  case 'start':case 'step':return tileEl(m.tile);
  case 'q':{const o=G.q&&G.q.opts[m.i];const t=o?qBoardTile(o):null;if(t!=null)return tileEl(t);return [...document.querySelectorAll('[data-mv]')].find(b=>b.dataset.mv===JSON.stringify(m))||null}
  case 'tile':if(m.place!=null)return tileEl(m.place)||q('#acts .ab.go');if(m.take)return q(`[data-mk="${m.take[0]}"]`);if(m.dj)return q(`[data-dj="${m.dj}"]`);if(m.thief)return q(`[data-th="${m.thief}"]`);if(m.skip||m.work)return [...document.querySelectorAll('[data-mv]')].find(b=>b.dataset.mv===JSON.stringify(m))||null}
  return null}
function fingerTarget(){if(!G||G.over||UI.modal||GX.open||UI.chz||UI.autoOn||FING.n>=FING.max)return null;if(typeof GXH!=='undefined'){const hs=GXH.state();if(!hs.on||hs.cur||hs.rules)return null}const hp=me();if(!hp||online()&&isClient())return null;
  const k=G.seed+'|'+G.logN+'|'+G.phase+'|'+G.step+'|'+(G.q?1:0)+'|'+(G.move?G.move.path.length:0);if(FING.key!==k){FING.key=k;FING.m=null;
    try{FING.m=typeof hlpAdvice==='function'?hlpAdvice():null}catch(e){FING.m=null}}
  const m=FING.m;if(!m)return null;if(!validMoves(hp.i).some(x=>same(x,m))&&m.act!=='start')return null;return fingerEl(m)}
function placeFinger(){const f=$('#finger');if(!f)return;let el=null;try{el=fingerTarget()}catch(e){el=null}if(!el||!el.getBoundingClientRect){f.hidden=true;return}
  const r=el.getBoundingClientRect();if(r.width<4||r.bottom<0||r.top>innerHeight){f.hidden=true;return}
  f.hidden=false;f.style.left=Math.round(r.left+r.width/2)+'px';f.style.top=Math.round(r.top+r.height*.55)+'px';f.dataset.on=el.dataset.tile!=null?'tile':'btn';
  if(f.dataset.k!==FING.key){f.dataset.k=FING.key;f.classList.remove('go');void f.offsetWidth}f.classList.add('go')}
// a small note next to a card the player touched (not a panel: any other touch closes it and goes through)
function showTip(anchor,html){const el=document.getElementById('tip');if(!el||!anchor)return;el.innerHTML=html;el.hidden=false;const r=anchor.getBoundingClientRect(),w=el.offsetWidth,h=el.offsetHeight;
  let x=Math.max(6,Math.min(innerWidth-w-6,r.left+r.width/2-w/2));let y=r.top-h-8;if(y<44)y=r.bottom+8;el.style.left=x+'px';el.style.top=y+'px';clearTimeout(UI.tipT);UI.tipT=setTimeout(()=>{el.hidden=true},4500)}
