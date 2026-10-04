// ---------- storytelling and guidance: opening scene, chapters, plan picker, advisor, turn recaps. Reads G; never changes the rules. ----------
const CHAPTERS=['The Sultan is dead','Whispers in the bazaar','The caravans arrive','Djinn-smoke over the shrines','The Masons raise their walls','Shadows at noon',
  'A market of rumours','The oasis blooms','Palaces on the hills','The long afternoon','Sandstorm season','The last caravans','Night falls on Qamar','The final reckoning'];
function chapterTitle(r){return CHAPTERS[Math.min(r-1,CHAPTERS.length-1)]}
const OPENING=[
  'The old Sultan of Qamar has died, and he named no heir.',
  'Its peoples still live across the sultanate: Advisors, Sages, Traders, Masons and Shadows. Whoever guides them best will rule.',
  'Each turn you lift the people off one tile and lead them across the land, leaving one on every tile you pass. Where the last one stops, you gather everyone of that tribe and put them to work.',
  'Claim land with your camels, build palaces, plant palms, trade in the bazaar and bargain with djinns. When the last camel is placed, the richest in points takes the throne.'];
// flavour spoken by the narrator when a tribe is put to work
const TRIBE_FLAVOUR={vizier:'The Advisors bow and join your court.',elder:'The Sages bring old wisdom, and the djinns listen to them.',merchant:'The Traders unpack their wares for you.',
  builder:'The Masons get to work, and the coins pile up.',assassin:'The Shadows slip away into the alleys.',artisan:'The Crafters open their workshops for you.'};

// ---- the plan picker: every complete turn available now, described in plain words ----
function planGains(p,o){const t=G.board[o.e];const g=[];
  const baseM=o.e===o.s?[]:t.m;const visitsE=o.path.slice(1,-1).filter(i=>i===o.e).length;const extraC=o.n-1-baseM.filter(x=>x===o.c).length;const remain=baseM.filter(x=>x!==o.c).length+Math.max(0,visitsE-extraC);
  const claim=owner(t)==null&&remain<=0&&p.camels>0;
  switch(o.c){
  case 'vizier':g.push(`keep ${o.n} Advisor${o.n>1?'s':''}`);break;
  case 'elder':g.push(`keep ${o.n} Sage${o.n>1?'s':''}`);break;
  case 'merchant':{const cards=G.market.slice(0,o.n);g.push(`take ${cards.map(r=>RICON[r]).join('')} goods`);break}
  case 'builder':{const blues=AROUND(o.e).filter(i=>G.board[i].blue&&!G.board[i].block).length;g.push(`earn ${o.n*blues}🪙 (${o.n} Mason${o.n>1?'s':''} × ${blues} blue tiles)`);break}
  case 'assassin':g.push(`Shadows strike (range ${o.n})`);break;
  case 'artisan':g.push(`keep ${o.n} Crafter${o.n>1?'s':''} + an item`);break}
  if(claim)g.push(`🐪 claim ${tileName(t)} (+${t.v})`);
  const mine=claim||owner(t)===p.i;
  if(t.k==='village')g.push(mine?'🏰 your palace (+5)':owner(t)!=null?'(builds a palace for '+P(owner(t)).nm+')':'🏰 a palace (+5 to whoever claims it)');
  if(t.k==='oasis')g.push(mine?'🌴 your palm (+3)':owner(t)!=null?'(plants a palm for '+P(owner(t)).nm+')':'🌴 a palm (+3 to whoever claims it)');
  if(t.k==='sacred'){const el=p.el+(o.c==='elder'?o.n:0);if(el>=2||(el>=1&&p.fk>=1))g.push('✨ you can summon a djinn');else g.push('(a Shrine, but you need 2 Sages to summon)')}
  if(t.k==='small'&&p.coins>=3)g.push('🛒 buy 1 good for 3🪙');if(t.k==='large'&&p.coins>=6)g.push('🛒 buy 2 goods for 6🪙');
  if(t.k==='exchange'&&p.coins>=4)g.push('🛒 buy any good for 4🪙');if(t.k==='workshop'&&(p.art||p.fk>=2))g.push('🔨 an item');
  return g}
function allPlans(p,max){const lv=p.lv;p.lv='hard';const seen={};let list=[];
  try{for(const s of legalStarts())for(const o of outcomes(s,20000)){const k=o.s+'_'+o.e+'_'+o.c;const v=evalOutcome(p,o);if(!seen[k]||seen[k].v<v)seen[k]=Object.assign({},o,{v})}}
  finally{p.lv=lv}
  list=Object.values(seen).sort((a,b)=>b.v-a.v);
  // merge plans with the same outcome (same landing tile, tribe and number): show one card with its route count
  const out=[],by={};for(const o of list){const k=o.e+'_'+o.c+'_'+o.n;if(by[k]){by[k].routes++;continue}o.routes=1;by[k]=o;out.push(o)}
  // variety: the best plan of each tribe first, then the rest by value
  const firsts=[],rest=[],seenC=new Set();for(const o of out){if(!seenC.has(o.c)){seenC.add(o.c);firsts.push(o)}else rest.push(o)}
  const mixed=firsts.slice(0,4).concat(firsts.slice(4),rest).sort((a,b)=>(firsts.indexOf(b)>=0&&firsts.indexOf(b)<4)-(firsts.indexOf(a)>=0&&firsts.indexOf(a)<4)||b.v-a.v);
  return max?mixed.slice(0,max):mixed}
function planHtml(p,o,i){const s=G.board[o.s],e=G.board[o.e];const g=planGains(p,o);
  return `<div class="plan ${UI.showPlan===i?'on':''}" data-plani="${i}"><div class="ph"><span class="pn">${i+1}</span>${mdot(o.c,1)}<b>${o.n} ${o.n>1?MPLUR[o.c]:MNAME[o.c]}</b><span class="pv">+${Math.max(0,Math.round(o.v))} ★</span></div>
    <div class="pg">${g.map(x=>`<span class="${x.startsWith('(')?'no':''}">${esc(x)}</span>`).join(' · ')}</div>
    <div class="pr">from <b>${esc(tileName(s))}</b> → ${o.path.length-1} steps → <b>${esc(tileName(e))}</b>${o.routes>1?` · ${o.routes} routes`:''}</div>
    <div class="acts"><button class="btn sm" data-planshow="${i}">👁 Show</button><button class="btn sm go" data-plando="${i}">Do this ▶</button></div></div>`}
// step the chosen plan through the real moves, one drop at a time so the player can watch
function planNext(pl){const vm=validMoves(G.cur);const by=a=>vm.filter(m=>m.act===a);
  if(!G.move)return by('start').find(m=>m.tile===pl.s)||null;
  const k=G.move.path.length;const nx=pl.path[k];const here=by('step').filter(m=>m.tile===nx);if(!here.length)return null;
  const last=G.move.hand.length===1;const cnt=G.move.hand.filter(x=>x===pl.c).length;
  if(last)return here.find(m=>m.c===pl.c)||here[0];if(nx===pl.e&&cnt>1){const m=here.find(m=>m.c===pl.c);if(m)return m}
  return here.find(m=>m.c!==pl.c)||here[0]}
function runPlan(){if(typeof NET!=='undefined'&&NET.on&&NET.wait&&UI.autoPlan){setTimeout(runPlan,60);return}const pl=UI.autoPlan;if(!pl||!G||G.step!=='move'){UI.autoPlan=null;return}const m=planNext(pl);
  if(!m){UI.autoPlan=null;toast('That plan is no longer possible here: finish the move by hand.');render();return}
  go(m);if(G.step==='move'&&UI.autoPlan)setTimeout(runPlan,ANIM?Math.max(120,420/(UI.speed||1)):0);else UI.autoPlan=null}

// ---- the advisor: what the normal computer would do now, and why ----
function advice(){const p=me();if(!p)return null;const vm=validMoves(p.i);if(!vm.length)return null;
  if(G.q){const i=aiAnswer(G.q);return {text:`I would choose “${G.q.opts[i].l}”.`,move:{act:'q',i}}}
  if(G.phase==='bid'){const pl=allPlans(p,1)[0];const v=pl?Math.round(pl.v):0;const lv=p.lv;p.lv='normal';let m;try{m=aiMove(p.i)}finally{p.lv=lv}
    const pr=bidPrice(p,m.spot,m.fk);return {text:`Your best turn this round is worth about ${v} points${pl?` (${tileName(G.board[pl.s])} → ${tileName(G.board[pl.e])})`:''}. Spending ${pr} coin${pr===1?'':'s'} on turn order ${pr?'lets you play before rivals take it':'is enough: the good moves are not in danger'}. Coins are points too, so don't overpay.`,move:m}}
  if(G.step==='move'&&!G.move){const pl=allPlans(p,1)[0];if(!pl)return null;return {text:`Best plan: lift from ${tileName(G.board[pl.s])} and land on ${tileName(G.board[pl.e])} to take ${pl.n} ${pl.n>1?MPLUR[pl.c]:MNAME[pl.c]}: ${planGains(p,pl).join(', ')}.`,plan:pl}}
  const lv=p.lv;p.lv='normal';let m;try{m=aiMove(p.i)}finally{p.lv=lv}if(!m)return null;
  return {text:`I would ${moveWords(m)}.`,move:m}}
function moveWords(m){switch(m.act){
  case 'step':return `drop a ${MNAME[m.c]} on ${tileName(G.board[m.tile])}`;case 'tribe':return m.kill?killLabel(m.kill).replace('🗡 ','remove ')
    :G.act.color==='builder'?`collect the Masons' pay${m.fk?` using ${m.fk} Mystic${m.fk>1?'s':''}`:''}`:G.act.color==='merchant'?'take the goods':'keep them';
  case 'tile':return m.skip?'skip the tile action':m.place!=null?`put it on ${tileName(G.board[m.place])}`:m.dj?`summon ${DJ[m.dj].n}`:m.take?`buy ${m.take.map(j=>RNAME[G.market[j]]).join(' and ')}`:m.thief?`hire the ${THIEVES[m.thief].n}`:'use the tile';
  case 'djinn':return `call on ${DJ[m.k].n}`;case 'item':return `use the ${ITEMS[m.k].n}`;case 'thief':return `send the ${THIEVES[m.k].n}`;
  case 'sell':return 'sell those goods';case 'end':return 'end the turn (keep your goods for a bigger set)';case 'undo':return 'put them back';default:return m.act}}

// ---- recap of other players' turns, told as a story ----
function recapLines(){return recapGroups().flatMap(g=>[{t:g.head,c:'turn'}].concat(g.items))}
// every turn since the human last played, oldest first; each turn's events in the order they happened
function recapGroups(){if(!G||!G.log.length)return[];const humans=typeof NET!=='undefined'&&NET.on&&NET.mySeat>=0?[P(NET.mySeat).nm]:G.pl.filter(p=>p.human).map(p=>p.nm);const groups=[];let cur=[];
  for(const l of G.log){if(l.c==='turn'||l.c==='round'){groups.push({head:l.t.replace(/—/g,'').trim(),items:cur.reverse()});cur=[];
      if(l.c==='turn'&&humans.some(n=>l.t.includes(n+"'s"))&&groups.length>1)break;if(groups.length>10)break;continue}cur.push(l)}
  if(cur.length)groups.push({head:'Earlier',items:cur.reverse()});
  // drop the empty group of the turn now in progress, and the human's own finished turn at the end
  const out=groups.filter(g=>g.items.length).reverse();return out.slice(-6)}
function narrate(l){let t=l.t;for(const c in TRIBE_FLAVOUR)if(t.includes('takes')&&(t.includes(MNAME[c])||t.includes(MPLUR[c])))return t+' '+TRIBE_FLAVOUR[c];return t}
// the round banner over the board (not blocking)
function showChapter(){const b=document.getElementById('banner');if(!b||!G)return;if(UI.chapterShown===G.round+'_'+G.seed)return;UI.chapterShown=G.round+'_'+G.seed;
  const sc=G.pl.map(p=>({p,t:scoreOf(p).total})).sort((x,y)=>y.t-x.t);const low=G.pl.filter(p=>p.camels<=3);
  const line=G.round===1?'Bid for turn order, then each player takes their turn.':`${esc(sc[0].p.nm)} leads with ${sc[0].t} points.`+(low.length?` Only ${Math.min(...low.map(p=>p.camels))} camels left for ${esc(low[0].nm)}: the end is near.`:'');
  b.classList.toggle('late',!!low.length);b.innerHTML=`<small>Round ${G.round}</small><b>${esc(chapterTitle(G.round))}</b><span>${line}</span>`;b.hidden=false;b.classList.remove('go');void b.offsetWidth;b.classList.add('go');clearTimeout(UI.bt);UI.bt=setTimeout(()=>b.hidden=true,3200)}
// opening scene: a painted sunset over the sultanate
function openingHtml(){return `<div class="mbox story"><canvas id="opencv" width="640" height="220" aria-hidden="true"></canvas><h2>The throne of Qamar</h2>${OPENING.map(t=>`<p>${esc(t)}</p>`).join('')}
  <label class="chk"><input type="checkbox" data-coach ${UI.coach?'checked':''}> <b>Guide me through my first turns</b> <small>shows the best plans and explains every step</small></label>
  <div class="acts"><button class="btn go" data-ui="guided" data-start="guided">Guided first game ▶</button><button class="btn" data-ui="play">Choose players ▶</button></div><p class="small muted">New here? The guided game explains one step at a time, with a reason for every suggestion.</p></div>`}
function paintOpening(){const c=document.getElementById('opencv');if(!c)return;let x=null;try{x=c.getContext('2d')}catch(e){}if(!x)return;const w=c.width,h=c.height;
  // golden-hour sky with a low sun and soft rays
  let g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,'#5a2a4a');g.addColorStop(.35,'#d8744a');g.addColorStop(.62,'#f6c070');g.addColorStop(1,'#f2b765');x.fillStyle=g;x.fillRect(0,0,w,h);
  const sx=w*.72,sy=h*.5;let rg=x.createRadialGradient(sx,sy,0,sx,sy,h*.9);rg.addColorStop(0,'rgba(255,245,210,.95)');rg.addColorStop(.12,'rgba(255,225,150,.6)');rg.addColorStop(1,'rgba(255,200,120,0)');x.fillStyle=rg;x.fillRect(0,0,w,h);
  x.save();x.globalAlpha=.12;x.fillStyle='#fff3d0';for(let k=0;k<9;k++){const a=-Math.PI*.95+k*Math.PI*.11;x.beginPath();x.moveTo(sx,sy);x.lineTo(sx+Math.cos(a)*w,sy+Math.sin(a)*w);x.lineTo(sx+Math.cos(a+.04)*w,sy+Math.sin(a+.04)*w);x.fill()}x.restore();
  x.fillStyle='#fff6dc';x.beginPath();x.arc(sx,sy,h*.09,0,7);x.fill();
  // three layers of skyline, fading with distance
  const dome=(cx,base,r,hh)=>{x.fillRect(cx-r,base-hh,r*2,hh);x.beginPath();x.moveTo(cx-r*1.05,base-hh);x.bezierCurveTo(cx-r*1.25,base-hh-r*1.1,cx-r*.2,base-hh-r*1.2,cx,base-hh-r*1.9);x.bezierCurveTo(cx+r*.2,base-hh-r*1.2,cx+r*1.25,base-hh-r*1.1,cx+r*1.05,base-hh);x.fill();x.fillRect(cx-1,base-hh-r*2.3,2,r*.5)};
  const mina=(cx,base,wd,hh)=>{x.fillRect(cx-wd/2,base-hh,wd,hh);x.fillRect(cx-wd*.8,base-hh*.72,wd*1.6,3);x.beginPath();x.moveTo(cx-wd*.6,base-hh);x.lineTo(cx,base-hh-wd*2.2);x.lineTo(cx+wd*.6,base-hh);x.fill()};
  const layer=(col,base,sc,seed)=>{x.fillStyle=col;let s=seed;const R=()=>{s=(s*16807)%2147483647;return s/2147483647};x.fillRect(0,base,w,h-base);for(let X=-20;X<w+20;){const t=R();if(t<.4){const r=(10+R()*14)*sc;dome(X+r,base,r,(8+R()*20)*sc);X+=r*2+6*sc}else if(t<.6){const wd=6*sc;mina(X+wd,base,wd,(40+R()*40)*sc);X+=wd*3}else{const bw=(20+R()*40)*sc;x.fillRect(X,base-(10+R()*18)*sc,bw,40*sc);X+=bw}}};
  layer('rgba(170,90,80,.55)',h*.62,.7,7);layer('rgba(130,60,50,.8)',h*.68,.95,19);layer('#5e2718',h*.74,1.2,31);
  // dunes in the foreground with a rim of light
  g=x.createLinearGradient(0,h*.72,0,h);g.addColorStop(0,'#e7a55c');g.addColorStop(1,'#b8672f');x.fillStyle=g;x.beginPath();x.moveTo(0,h*.8);x.quadraticCurveTo(w*.3,h*.7,w*.55,h*.8);x.quadraticCurveTo(w*.8,h*.9,w,h*.78);x.lineTo(w,h);x.lineTo(0,h);x.fill();
  x.strokeStyle='rgba(255,230,170,.7)';x.lineWidth=2;x.beginPath();x.moveTo(0,h*.8);x.quadraticCurveTo(w*.3,h*.7,w*.55,h*.8);x.stroke();
  // a caravan crossing the dune
  x.fillStyle='#3a160c';const camel=(cx,cy,s)=>{x.save();x.translate(cx,cy);x.scale(s,s);x.beginPath();x.moveTo(-20,0);x.bezierCurveTo(-18,-14,-8,-24,0,-16);x.bezierCurveTo(6,-22,12,-14,14,-8);x.lineTo(20,-20);x.lineTo(26,-20);x.lineTo(24,-16);x.lineTo(18,-4);x.lineTo(14,2);x.lineTo(-18,2);x.fill();for(const lx of [-15,-10,8,12])x.fillRect(lx,0,2.5,16);x.restore()};
  camel(w*.2,h*.74,1.1);camel(w*.29,h*.72,1);camel(w*.37,h*.71,.9);
  // the tribes as turned pawns, lit from the sun
  const cols=['#f0b72a','#f3eee2','#3a9a48','#2c62c6','#c9312a'];for(let k=0;k<5;k++){const px=w*(.58+k*.075),py=h*.93;const gg=x.createLinearGradient(px-10,0,px+10,0);gg.addColorStop(0,'rgba(0,0,0,.25)');gg.addColorStop(.6,'rgba(255,255,255,.25)');gg.addColorStop(1,'rgba(0,0,0,.1)');
    x.fillStyle='rgba(60,20,5,.35)';x.beginPath();x.ellipse(px+6,py+2,16,4,0,0,7);x.fill();for(const f of [cols[k],gg]){x.fillStyle=f;x.beginPath();x.moveTo(px-12,py);x.quadraticCurveTo(px-12,py-6,px-7,py-8);x.quadraticCurveTo(px-4,py-20,px-4,py-26);x.lineTo(px+4,py-26);x.quadraticCurveTo(px+4,py-20,px+7,py-8);x.quadraticCurveTo(px+12,py-6,px+12,py);x.fill();x.fillRect(px-6,py-29,12,3);x.beginPath();x.arc(px,py-36,7.5,0,7);x.fill()}}
  // gilded arch frame
  x.strokeStyle='rgba(224,165,58,.9)';x.lineWidth=3;x.strokeRect(6,6,w-12,h-12);x.strokeStyle='rgba(255,230,170,.35)';x.lineWidth=1;x.strokeRect(11,11,w-22,h-22)}
