/* ---------- meta game: LOADOUT (equip / unequip / sell perks, limited slots), daily MARKET (strategic one-run purchases), SOON (placeholders), and the LAB (test menu) ----------
   Hooks in through the garage's tab bar and gaDraw; economy changes (prices x1.5, pit stop x1.25, less Neon per kill) live in upgrades.js and shop.js. */
GA.queue=(()=>{const q=load('mnr_q',[]);return Array.isArray(q)?q.filter(id=>UBY[id]).slice(0,12):[];})();
const qsave=()=>save('mnr_q',GA.queue);
{const st=document.createElement('style');st.textContent=`
.pg .card.d{cursor:default}
.pg .card .bt{display:flex;gap:6px;flex:0 0 auto;align-items:center}
.pg .card .bt button{min-height:36px;padding:.2em .8em;font-size:clamp(11px,calc(var(--u)*3.4),15px)}
.pg .card .ph{position:absolute;top:-9px;left:10px;background:#8c86b8;color:#120a1f;font-family:var(--mono);font-weight:700;font-size:clamp(11px,calc(var(--u)*2.6),12px);letter-spacing:.08em;padding:1px 7px;border-radius:9px}
.pg .card img.pi{height:clamp(34px,calc(var(--u)*10),52px);width:auto;aspect-ratio:1;object-fit:contain;opacity:.6;flex:0 0 auto}
.pg .slots{font-family:var(--mono);color:var(--cyan);text-align:center;font-size:clamp(11px,calc(var(--u)*3.3),16px);flex:0 0 auto}
.pg .tabs button{font-size:clamp(11px,calc(var(--u)*3.2),15px)}
.pg .tabs button.on{color:var(--ink)}
`;document.head.appendChild(st);}
/* ----- tabs ----- */
{const tabs=garageEl.querySelector('.tabs');for(const [t,l] of [['load','LOAD'],['mkt','SHOP'],['soon','SOON']]){const b=document.createElement('button');b.className='go dim';b.dataset.t=t;b.type='button';b.textContent=l;tabs.append(b);b.addEventListener('click',()=>{GA.tab=t;gaDraw();});}}
const day=()=>new Date().toISOString().slice(0,10);
const hash=s=>{let h=2166136261;for(const c of s){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;};
const MKP=['dm','cr','mh','dr','rv','sh','hl','fr','mg','ck','wd','hm','dc','sc','pc','cl','bt','as','bd','sm','lk','ni','rc','cool','db','sb','nx'].filter(id=>UBY[id]);
/* the daily MARKET: four offers (one per build path where possible, one of them on sale), two purchases a day, a hold for 3 items, a reroll that costs more every time.
   Cargo can be sold back at 60%. Offers show the effect, the build path, a synergy with what you own and whether they answer the next boss. */
const CARGO_MAX=3;
const MK={s:(()=>{const o=load('mnr_mkt',null);return o&&o.day===day()?Object.assign({rr:0},o):{day:day(),b:[],rr:0};})(),
  offers(){const r=mul(hash(day()+'/'+this.s.rr));const by={gc:[],tk:[],bc:[],n:[]};for(const id of MKP)by[pathOf(id)||'n'].push(id);
    const pick=a=>a.length?a.splice(Math.floor(r()*a.length),1)[0]:null,o=[];for(const k of['gc','tk','bc'])o.push(pick(by[k]));
    const rest=[].concat(by.gc,by.tk,by.bc,by.n);while(o.length<4&&rest.length)o.push(pick(rest));return o.filter(Boolean);},
  sale(){const o=this.offers();return o[Math.floor(mul(hash(day()+'/sale/'+this.s.rr))()*o.length)];},
  price(id){const p=Math.round(UBY[id].p*3.2/5)*5;return id===this.sale()?Math.round(p*.7/5)*5:p;},
  full(id){return Math.round(UBY[id].p*3.2/5)*5;},
  rerollPrice(){return 40+40*this.s.rr;},max:2,left(){return this.max-this.s.b.length;},save(){save('mnr_mkt',this.s);}};
const gd0=gaDraw;
gaDraw=function(){if(garageEl.hidden&&labEl&&!labEl.hidden){garageDirty=true;return;}$('gaCards').classList.toggle('wpt',GA.tab==='weapons');if(!['load','mkt','soon'].includes(GA.tab)){gd0();if(GA.tab==='weapons'&&window.wpTabDraw)wpTabDraw();return;}
  $('gaBank').innerHTML=neonI+' <b id="gaBankN">'+GA.bank+'</b>';for(const b of garageEl.querySelectorAll('.tabs button'))b.classList.toggle('on',b.dataset.t===GA.tab);
  const box=$('gaCards');box.innerHTML='';box.classList.add('tune');
  if(GA.tab==='load')loadDraw(box);else if(GA.tab==='mkt')mktDraw(box);else soonDraw(box);affUpd();};
const fullRow=(box,html,cls)=>{const e=document.createElement('div');e.className='slots '+(cls||'');e.style.gridColumn='1/-1';e.innerHTML=html;box.append(e);return e;};
/* build preset: equip the best owned perks of one path */
function loadPreset(p){const sl=eqSlots(),mine=TP_DEF.filter(d=>TP.raw(d.id)>0).sort((a,b)=>((pathOf(b.id)===p)-(pathOf(a.id)===p))||(b.pri-a.pri));GA.eq={};for(const d of mine.slice(0,sl))if(pathOf(d.id)===p||d.pri>=90)GA.eq[d.id]=true;eqsave();SH.recalc();AU.sfx('up');gaMsg(PATHS[p].n+' loadout set');gaDraw();}
function loadDraw(box){const sl=eqSlots(),n=eqCount(),own=TP_DEF.filter(d=>TP.raw(d.id)>0);SYN.calc();
  fullRow(box,`SLOTS <b style="color:#ffb020">${n}/${sl}</b> · only equipped perks work · +1 slot per 20 story stars (${ST.totalStars()} now) · selling returns 60%`);
  const pr=fullRow(box,'','presets');pr.innerHTML=Object.keys(PATHS).map(p=>`<button type="button" class="go dim pst" data-p="${p}" style="--c:${PATHS[p].c}">${svgI(PATHS[p].ic)}${PATHS[p].n.toUpperCase()}</button>`).join('');
  pr.addEventListener('click',e=>{const b=e.target.closest('.pst');if(b)loadPreset(b.dataset.p);});
  // build paths: pieces owned, the next set bonus (the 4-piece bonus has a price)
  fullRow(box,Object.keys(PATHS).map(p=>{const c=SYN.cnt[p],nx=SETS[p].find(t=>c<t.n),have=SETS[p].filter(t=>c>=t.n).pop();
    return `<div class="pth" style="--c:${PATHS[p].c}"><span class="pn">${svgI(PATHS[p].ic)}${PATHS[p].n}</span><span class="pb">${[0,1,2,3].map(i=>`<i class="${i<c?'on':''}"></i>`).join('')}</span><span class="pt">${nx?`${c}/${nx.n}: ${nx.t}`:`Full: ${have.t}`}</span></div>`;}).join(''),'paths');
  const act=SYN.act,near=SYNS.filter(s=>!act.includes(s)&&(SYN.owned.has(s.a)!==SYN.owned.has(s.b)));
  fullRow(box,(act.length?act.map(s=>`<b class="syn on" title="${s.t}">${UBY[s.a]?svgI(UBY[s.a].ic):''}+${UBY[s.b]?svgI(UBY[s.b].ic):''} ${s.n}: ${s.t}</b>`).join(''):'<span style="color:var(--dim)">No synergy yet: pair two perks</span>')
    +near.slice(0,3).map(s=>`<b class="syn" title="${s.t}">${UBY[s.a]?svgI(UBY[s.a].ic):''}+${UBY[s.b]?svgI(UBY[s.b].ic):''} ${s.n}?</b>`).join('')+`<b class="heat">${heatTxt()}</b>`,'syns');
  if(!own.length){fullRow(box,'Buy perks in TUNE first.');}
  for(const d of own){const l=TP.raw(d.id),on=!!GA.eq[d.id],c=document.createElement('div');c.className='card d'+(on?' sel':'');c.style.setProperty('--c',on?d.c:'#8c86b8');c.dataset.id='lo_'+d.id;c.dataset.kind='load';
    const refund=Math.round(tpPrice(d,l-1)*.6);
    c.innerHTML=perkIcon(d)+`<div class="tx"><div class="n">${pathChip(pathOf(d.id))}${d.n}<span class="lv">${l}/${d.max}</span></div><div class="t">${d.t(l)}</div>${d.bad?`<div class="chips"><b class="bad">TRADE-OFF: ${d.bad(l)}</b></div>`:''}</div><div class="bt"><button class="go ${on?'':'alt'}" data-a="eq" type="button">${on?'UNEQUIP':'EQUIP'}</button><button class="go dim" data-a="sell" type="button">SELL +${refund}</button></div>`;
    c.querySelector('[data-a=eq]').addEventListener('click',()=>{if(!on&&eqCount()>=eqSlots()){gaMsg('All '+eqSlots()+' slots are full: unequip one first');return;}GA.eq[d.id]=!on;eqsave();SH.recalc();AU.sfx('up');gaDraw();});
    c.querySelector('[data-a=sell]').addEventListener('click',()=>{GA.bank+=refund;GA.tune[d.id]=l-1;if(l-1<=0)GA.eq[d.id]=false;tsave();eqsave();gsave();SH.recalc();gaMsg(d.n+' sold for '+refund);gaDraw();});
    box.append(c);}}
function mktBuy(id,c){const pr=MK.price(id),u=UBY[id];if(!MK.left()){gaMsg('No purchases left today');return;}if(GA.queue.length>=CARGO_MAX){gaMsg('Cargo hold is full: sell one');return;}
  if(GA.bank<pr){c.classList.remove('shake');void c.offsetWidth;c.classList.add('shake');gaMsg('Need '+(pr-GA.bank)+' more Neon');return;}
  GA.bank-=pr;MK.s.b.push(id);MK.save();GA.queue.push(id);qsave();gsave();AU.sfx('up');gaMsg(u.n+' is in your cargo');gaDraw();}
function mktDraw(box){const foe=nextFoeFrom(mapCurrent()),offers=MK.offers(),sale=MK.sale();SYN.calc();
  fullRow(box,`TODAY'S MARKET · <b style="color:#ffb020">${MK.left()}</b> of ${MK.max} buys left · cargo ${GA.queue.length}/${CARGO_MAX} · next run only`);
  const q=fullRow(box,'','cargo');q.innerHTML=GA.queue.length?'Cargo (tap to sell at 60%): '+GA.queue.map((id,i)=>`<button type="button" class="oi" data-i="${i}" style="--c:${UBY[id].c}" aria-label="Sell ${UBY[id].n}">${svgI(UBY[id].ic)} ${UBY[id].n} +${Math.round(MK.full(id)*.6)}</button>`).join(''):'Cargo empty';
  q.addEventListener('click',e=>{const b=e.target.closest('button.oi');if(!b)return;const i=+b.dataset.i,id=GA.queue[i];if(id==null)return;GA.queue.splice(i,1);GA.bank+=Math.round(MK.full(id)*.6);qsave();gsave();AU.sfx('hit');gaMsg(UBY[id].n+' sold for '+Math.round(MK.full(id)*.6));gaDraw();});
  const best=foe?offers.map(id=>[SH.bossScore(UBY[id],foe),id]).sort((a,b)=>b[0]-a[0])[0]:null;
  for(const id of offers){const u=UBY[id],pr=MK.price(id),got=MK.s.b.includes(id),c=document.createElement('button'),sy=SYN.completes(id)||SYNS.find(s=>(s.a===id&&GA.queue.includes(s.b))||(s.b===id&&GA.queue.includes(s.a))),hl=SYN.heatOf(id);c.type='button';
    c.className='card'+(got?' sold':GA.bank<pr||!MK.left()?' no':'');c.style.setProperty('--c',u.c);c.dataset.id='mk_'+id;c.dataset.kind='market';
    const chips=(id===sale?'<b class="syn">SALE -30%</b>':'')+(sy?`<b class="syn">+ ${sy.n}</b>`:'')+(hl?`<b class="heat">HEAT +${hl}%</b>`:'');
    c.innerHTML=svgI(u.ic)+`<div class="tx"><div class="n">${pathChip(pathOf(id))}${u.n}${best&&best[0]>0&&best[1]===id?'<span class="rec boss">BOSS PICK</span>':''}</div><div class="t">${lvText(u,1)}</div>${chips?`<div class="chips">${chips}</div>`:''}</div><div class="pr">${got?'BOUGHT':(id===sale?'<s>'+MK.full(id)+'</s> ':'')+neonI+' '+pr}</div>`;
    c.addEventListener('click',()=>{if(!got)mktBuy(id,c);});box.append(c);}
  fullRow(box,`<button type="button" class="go dim" id="mkRe">NEW OFFERS ${neonI} ${MK.rerollPrice()}</button>`+(foe?`<span class="foe2">${foe.nm}: ${foeTip(foe)}</span>`:''),'mkbar');
  $('mkRe').addEventListener('click',()=>{const p=MK.rerollPrice();if(GA.bank<p){gaMsg('Need '+(p-GA.bank)+' more Neon');return;}GA.bank-=p;MK.s.rr++;MK.save();gsave();AU.sfx('up');gaDraw();});}
const SOON=[['Weapon Forge','Craft and swap weapon mods between runs.','weapon-forge'],['Contracts','Three daily missions that pay Neon and slots.','contracts'],['Pilot Ranks','Level up your pilot for passive bonuses.','pilot-ranks'],
  ['Boss Trophies','A gallery of the bosses you beat, with their stats.','boss-trophies'],['Ship Skins','Paint jobs for every ship.','ship-skins'],['Squad Roster','Hire and level wingmen with their own skills.','squad-roster'],['Leaderboards','Daily and weekly scores, friends first.','leaderboards']];
function soonDraw(box){for(const [n,t,im] of SOON){const c=document.createElement('div');c.className='card d no';c.style.setProperty('--c','#8c86b8');c.dataset.kind='soon';c.innerHTML=`${ART.isReal('soon-'+im)?'':'<span class="ph">PLACEHOLDER</span>'}${soonIcon(im)}<div class="tx"><div class="n">${n}</div><div class="t">${t}</div></div><div class="pr">SOON</div>`;box.append(c);}}
/* the market cargo goes into the next run (story or endless) */
NR.on('runStart',()=>setTimeout(()=>{if(!GA.queue.length)return;for(const id of GA.queue)SH.add(id);G.note={t:4,txt:'Cargo: '+GA.queue.map(id=>UBY[id].n).join(', ')};GA.queue=[];qsave();},60));
/* the LAB is its own stage now: see lab.js */
let labEl=null,garageDirty=false;
