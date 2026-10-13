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
const MKP=['dm','cr','mh','dr','rv','sh','hl','fr','mg','ck','wd','hm','dc','sc','pc','cl','bt','as','bd','sm','lk','ni','rc'].filter(id=>UBY[id]);
const MK={s:(()=>{const o=load('mnr_mkt',null);return o&&o.day===day()?o:{day:day(),b:[]};})(),
  offers(){const r=mul(hash(day()));const pool=MKP.slice(),o=[];while(o.length<3&&pool.length)o.push(pool.splice(Math.floor(r()*pool.length),1)[0]);return o;},
  price(id){return Math.round(UBY[id].p*3.2/5)*5;},max:2,left(){return this.max-this.s.b.length;},save(){save('mnr_mkt',this.s);}};
const gd0=gaDraw;
gaDraw=function(){if(garageEl.hidden&&labEl&&!labEl.hidden){garageDirty=true;return;}if(!['load','mkt','soon'].includes(GA.tab)){gd0();return;}
  $('gaBank').innerHTML=neonI+' <b id="gaBankN">'+GA.bank+'</b>';for(const b of garageEl.querySelectorAll('.tabs button'))b.classList.toggle('on',b.dataset.t===GA.tab);
  const box=$('gaCards');box.innerHTML='';box.classList.add('tune');
  if(GA.tab==='load')loadDraw(box);else if(GA.tab==='mkt')mktDraw(box);else soonDraw(box);affUpd();};
function loadDraw(box){const sl=eqSlots(),n=eqCount(),own=TP_DEF.filter(d=>TP.raw(d.id)>0);
  const h=document.createElement('div');h.className='slots';h.style.gridColumn='1/-1';h.innerHTML=`SLOTS <b style="color:#ffb020">${n}/${sl}</b> · only equipped perks work · +1 slot per 15 story stars (${ST.totalStars()} now) · selling returns 60%`;box.append(h);
  if(!own.length){const e=document.createElement('div');e.className='slots';e.style.gridColumn='1/-1';e.textContent='Buy perks in TUNE first.';box.append(e);}
  for(const d of own){const l=TP.raw(d.id),on=!!GA.eq[d.id],c=document.createElement('div');c.className='card d'+(on?' sel':'');c.style.setProperty('--c',on?d.c:'#8c86b8');c.dataset.id='lo_'+d.id;c.dataset.kind='load';
    const refund=Math.round(tpPrice(d,l-1)*.6);
    c.innerHTML=perkIcon(d)+`<div class="tx"><div class="n">${d.n}<span class="lv">${l}/${d.max}</span></div><div class="t">${d.t(l)}</div></div><div class="bt"><button class="go ${on?'':'alt'}" data-a="eq" type="button">${on?'UNEQUIP':'EQUIP'}</button><button class="go dim" data-a="sell" type="button">SELL +${refund}</button></div>`;
    c.querySelector('[data-a=eq]').addEventListener('click',()=>{if(!on&&eqCount()>=eqSlots()){gaMsg('All '+eqSlots()+' slots are full: unequip one first');return;}GA.eq[d.id]=!on;eqsave();SH.recalc();AU.sfx('up');gaDraw();});
    c.querySelector('[data-a=sell]').addEventListener('click',()=>{GA.bank+=refund;GA.tune[d.id]=l-1;if(l-1<=0)GA.eq[d.id]=false;tsave();eqsave();gsave();SH.recalc();gaMsg(d.n+' sold for '+refund);gaDraw();});
    box.append(c);}}
function mktDraw(box){const h=document.createElement('div');h.className='slots';h.style.gridColumn='1/-1';h.innerHTML=`TODAY'S MARKET · <b style="color:#ffb020">${MK.left()}</b> of ${MK.max} purchases left · applies to your next run only · new offers every day`;box.append(h);
  const q=document.createElement('div');q.className='slots';q.style.gridColumn='1/-1';q.innerHTML=GA.queue.length?'In your cargo: '+GA.queue.map(id=>UBY[id].n).join(', '):'Cargo empty';box.append(q);
  for(const id of MK.offers()){const u=UBY[id],pr=MK.price(id),got=MK.s.b.includes(id),c=document.createElement('button');c.type='button';c.className='card'+(got?' sold':GA.bank<pr||!MK.left()?' no':'');c.style.setProperty('--c',u.c);c.dataset.id='mk_'+id;c.dataset.kind='market';
    c.innerHTML=svgI(u.ic)+`<div class="tx"><div class="n">${u.n}</div><div class="t">${lvText(u,1)}</div></div><div class="pr">${got?'BOUGHT':neonI+' '+pr}</div>`;
    c.addEventListener('click',()=>{if(got)return;if(!MK.left()){gaMsg('No purchases left today');return;}if(GA.bank<pr){c.classList.remove('shake');void c.offsetWidth;c.classList.add('shake');gaMsg('Need '+(pr-GA.bank)+' more Neon');return;}
      GA.bank-=pr;MK.s.b.push(id);MK.save();GA.queue.push(id);qsave();gsave();AU.sfx('up');gaMsg(u.n+' is in your cargo');gaDraw();});box.append(c);}}
const SOON=[['Weapon Forge','Craft and swap weapon mods between runs.','weapon-forge'],['Contracts','Three daily missions that pay Neon and slots.','contracts'],['Pilot Ranks','Level up your pilot for passive bonuses.','pilot-ranks'],
  ['Boss Trophies','A gallery of the bosses you beat, with their stats.','boss-trophies'],['Ship Skins','Paint jobs for every ship.','ship-skins'],['Squad Roster','Hire and level wingmen with their own skills.','squad-roster'],['Leaderboards','Daily and weekly scores, friends first.','leaderboards']];
function soonDraw(box){for(const [n,t,im] of SOON){const c=document.createElement('div');c.className='card d no';c.style.setProperty('--c','#8c86b8');c.dataset.kind='soon';c.innerHTML=`${ART.isReal('soon-'+im)?'':'<span class="ph">PLACEHOLDER</span>'}${soonIcon(im)}<div class="tx"><div class="n">${n}</div><div class="t">${t}</div></div><div class="pr">SOON</div>`;box.append(c);}}
/* the market cargo goes into the next run (story or endless) */
NR.on('runStart',()=>setTimeout(()=>{if(!GA.queue.length)return;for(const id of GA.queue)SH.add(id);G.note={t:4,txt:'Cargo: '+GA.queue.map(id=>UBY[id].n).join(', ')};GA.queue=[];qsave();},60));
/* the LAB is its own stage now: see lab.js */
let labEl=null,garageDirty=false;
