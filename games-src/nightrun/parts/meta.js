/* ---------- meta game: LOADOUT (equip / unequip / sell perks, limited slots), daily MARKET (strategic one-run purchases), SOON (placeholders), and the LAB (test menu) ----------
   Hooks in through the garage's tab bar and gaDraw; economy changes (prices x1.5, pit stop x1.25, less Neon per kill) live in upgrades.js and shop.js. */
GA.queue=(()=>{const q=load('mnr_q',[]);return Array.isArray(q)?q.filter(id=>UBY[id]).slice(0,12):[];})();
const qsave=()=>save('mnr_q',GA.queue);
{const st=document.createElement('style');st.textContent=`
.pg .card.d{cursor:default}
.pg .card .bt{display:flex;gap:6px;flex:0 0 auto;align-items:center}
.pg .card .bt button{min-height:36px;padding:.2em .8em;font-size:clamp(11px,calc(var(--u)*3.4),15px)}
.pg .card .ph{position:absolute;top:-9px;left:10px;background:#8c86b8;color:#120a1f;font-family:var(--mono);font-weight:700;font-size:clamp(9px,calc(var(--u)*2.6),12px);letter-spacing:.08em;padding:1px 7px;border-radius:9px}
.pg .card img.pi{height:clamp(34px,calc(var(--u)*10),52px);width:auto;aspect-ratio:1;object-fit:contain;opacity:.6;flex:0 0 auto}
.pg .slots{font-family:var(--mono);color:var(--cyan);text-align:center;font-size:clamp(11px,calc(var(--u)*3.3),16px);flex:0 0 auto}
.pg .tabs button{font-size:clamp(10px,calc(var(--u)*3.2),15px)}
#lab{position:absolute;inset:0;z-index:9;display:flex;flex-direction:column;gap:8px;padding:10px 4%;overflow-y:auto;background:#05030c}
#lab .lbar{order:-3;position:sticky;top:-10px;z-index:2;display:flex;align-items:center;gap:10px;margin:-10px -4% 0;padding:8px 4%;background:#05030cf2;border-bottom:1px solid #2a1840}
#lab .lbar .nt{flex:1 1 0;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#lab .lbar .go{min-height:44px}
#lab .first{order:-2}
#lab .db{width:1.7em;height:1.7em}
#lab .rw button{background-image:none!important;clip-path:none;border:1px solid #3a2b5c;border-radius:6px;background-color:#140c26;color:var(--ink);text-shadow:none;padding:.3em .8em;display:inline-flex;align-items:center;gap:.3em}
#lab .rw button.on{background-color:var(--cyan)!important;color:var(--void)}
#labChip{position:absolute;z-index:4;right:6px;top:64px;min-width:44px;min-height:44px;opacity:.55;font:700 12px var(--mono);letter-spacing:.08em;color:var(--ink);background:#05030c99;border:1px solid #3a2b5c;border-radius:8px}
#labChip:active{opacity:1}
#lab h2{margin:0;font:700 clamp(15px,4vw,22px) var(--display);letter-spacing:.14em;color:var(--cyan)}
#lab .sec{font-family:var(--mono);color:var(--dim);font-size:12px;letter-spacing:.12em;margin-top:6px}
#lab .rw{display:flex;flex-wrap:wrap;gap:6px}
#lab .rw button{min-height:44px;font-size:13px}
#lab .rw button:disabled{opacity:.35}
#lab .nt{font-family:var(--mono);color:var(--amber);font-size:12px;min-height:1.2em}
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
gaDraw=function(){if(garageEl.hidden&&!labEl.hidden){garageDirty=true;return;}if(!['load','mkt','soon'].includes(GA.tab)){gd0();return;}
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
/* ----- LAB: the test menu ----- */
const labEl=document.createElement('div');labEl.id='lab';labEl.hidden=true;stage.appendChild(labEl);
let labFrom=null,labChip=null;
labChip=document.createElement('button');labChip.id='labChip';labChip.type='button';labChip.textContent='LAB';labChip.hidden=true;labChip.setAttribute('aria-label','Open the test lab');stage.appendChild(labChip);
labChip.addEventListener('click',()=>{setPause(true);pauseEl.hidden=true;labOpen('pause');});
const _syncUI=syncUI;syncUI=function(){_syncUI();let on=false;try{on=localStorage.getItem('mnr_labchip')==='1';}catch(e){}labChip.hidden=!(on&&running&&!paused&&!SH.active&&labEl.hidden);};   // once the LAB has been opened, a small LAB chip stays in the run (it pauses and opens the LAB)
/* the LAB page is built once; a click only flips the state of the buttons (rebuilding the whole page every click was a visible hitch) */
const LABS=[];
function labRow(l,items,cls){const r=document.createElement('div');r.className='rw'+(cls?' '+cls:'');for(const it of items){const b=document.createElement('button');b.type='button';b.className='go dim';if(it[5])b.innerHTML=it[5]+' '+it[0];else b.textContent=it[0];b.addEventListener('click',()=>{it[1]();labNote(b.textContent);labSync();if(cls==='first'&&running)labGo();});r.append(b);LABS.push({b,it});}   // an in-run action closes the LAB and carries on playing: one tap, no pause > lab > resume dance
  const s=document.createElement('div');s.className='sec'+(cls?' '+cls:'');s.textContent=l;labEl.append(s,r);}
const labNote=t=>{const n=$('labNt');if(n)n.textContent=t+' done';};
function labSync(){const live=running&&G&&!G.dead;for(const {b,it} of LABS){const on=typeof it[2]==='function'?it[2]():false,dis=typeof it[3]==='function'?it[3](live):false;
    b.classList.toggle('on',!!on);b.disabled=!!dis;if(it[4]){const t=it[4](on);if(b.textContent!==t)b.textContent=t;}}}
function labBuild(){labEl.innerHTML='<div class="lbar"><h2>TEST LAB</h2><div class="nt" id="labNt"></div><button class="go" id="labX" type="button">CLOSE</button></div>';LABS.length=0;const live=g=>!g;
  labRow('STORY',[['OPEN ALL STAGES',()=>{sSave.all=!sSave.all;sPersist();},()=>sSave.all,null,on=>on?'ALL STAGES OPEN: ON':'OPEN ALL STAGES'],['RESET STORY',()=>{sSave.stars={};sSave.snap={};sSave.all=false;sPersist();}]]);
  labRow('DIFFICULTY',[['easy','Easy'],['normal','Normal'],['hard','Hard'],['vhard','Very hard'],['legend','Legend']].map(([k,n])=>[n,()=>{SET.diff=k;saveSet();DF=DIFFS[k];HARD=HARDS.includes(k);diffDraw();},()=>SET.diff===k,null,null,diffBadge(k)]));   // no applySet here: it resizes the canvases
  labRow('PLAYER',[['GOD MODE',()=>{godMode=!godMode;},()=>godMode,null,on=>on?'GOD MODE: ON':'GOD MODE'],['FPS COUNTER',()=>{SET.fpsc=!SET.fpsc;saveSet();$('fpsEl').hidden=!SET.fpsc;},()=>!!SET.fpsc,null,on=>on?'FPS COUNTER: ON':'FPS COUNTER'],['BOSS CHEST',()=>{save('mnr_chest',CHEST_ON()?0:1);},()=>CHEST_ON(),null,on=>on?'BOSS CHEST: ON':'BOSS CHEST: OFF']]);
  labRow('NEON',[['+1,000',()=>{GA.bank+=1000;gsave();garageDirty=true;}],['+10,000',()=>{GA.bank+=10000;gsave();garageDirty=true;}],['SET 0',()=>{GA.bank=0;gsave();garageDirty=true;}]]);
  labRow('GARAGE',[['UNLOCK + MAX EVERYTHING',()=>{for(const s of SHIPS)if(s.p)GA.own['ship_'+s.id]=true;for(const c of CREW)GA.own[c.id]=true;for(const h of THEMES)if(h.p)GA.own['th_'+h.id]=true;for(const d of TP_DEF){GA.tune[d.id]=d.max;}tsave();gsave();SH.recalc();garageDirty=true;}],
    ['EQUIP BEST',()=>{GA.eq={};for(const d of TP_DEF.slice().sort((a,b)=>b.pri-a.pri).slice(0,eqSlots()))if(TP.raw(d.id))GA.eq[d.id]=true;eqsave();SH.recalc();}],['EQUIP ALL (TEST)',()=>{for(const d of TP_DEF)if(TP.raw(d.id))GA.eq[d.id]=true;eqsave();SH.recalc();}],
    ['RESET GARAGE',()=>{GA.own={};GA.tune={};GA.eq={};GA.bank=0;GA.ship='std';GA.queue=[];qsave();tsave();eqsave();gsave();SH.recalc();garageDirty=true;}]]);
  const dis=l=>!l,lv='IN A RUN: one tap and you are back in the game';
  labRow(lv,[['BOSS NOW',()=>{G.force=true;G.en=[];},null,dis],['NEXT DISTRICT',()=>{G.en=[];G.eb=[];enterDistrict(nextDi(G.di).di);},null,dis],['FULL HULL',()=>{P.hp=P.max;},null,dis],['+3 EMP',()=>{P.emp=Math.min(9,P.emp+3);},null,dis],
    ['KILL ALL',()=>{for(const e of G.en)if(e.type!=='boss')e.hp=0;G.eb=[];},null,dis],['SPAWN LEADER',()=>{const e=en('drone',{x:W-90,y:H/2,amp:0});if(!e.ldr){e.ldr=1;e.lc=0;e.r=Math.round(e.r*1.35);e.hp=Math.round(e.hp*3.5);e.max=e.hp;}},null,dis],['SPAWN GUNSHIP',()=>{en('gunship',{x:W-90,y:H/2});},null,dis]],'first');
  labRow('BOSS PICKER (spawns it now)',LAB_BOSSES.map(([n,o])=>[n,()=>{if(G.boss)return;G.en=[];G.eb=[];G.force=false;const D2=o.mini?null:DISTRICTS.find(d=>d.boss===o.k);spawnBoss(D2?{...o,sub:D2.bossSub}:o);},null,l=>!l||!!G.boss]),'first');
  $('labX').addEventListener('click',()=>{if(running&&paused&&labFrom==='pause')labGo();else labClose();});}
let garageDirty=false;
const LAB_BOSSES=[['ADLER',{k:0,nm:'SEK-ADLER'}],['KRAKE',{k:1,nm:'FLUSSKRAKE'}],['ICE',{k:2,nm:'ZENTRAL-ICE'}],['KRONOS',{k:3,nm:'KRONOS'}],['TRESOR',{k:5,nm:'TRESOR-WART',r:38,pats:['laser','fan5','ring','laser'],lbl:'T',mini:true}],['BRÜCKE',{mini:true,...MINIS[0]}],['SCHRANKE',{mini:true,...MINIS[1]}],['MESSE',{k:4,nm:'MESSE-WÄCHTER',r:42,pats:['fan7','ring','spiral','fan9'],lbl:'M',mini:true}],['HOPLITE',{mini:true,...MINIS[2]}],['TALOS',{k:6,nm:'TALOS'}]];
function labGo(){labClose();if(running&&paused)setPause(false);}
function labOpen(from){labFrom=from;if(!LABS.length)labBuild();labSync();$('labX').textContent=running&&from==='pause'?'RESUME RUN':'CLOSE';labEl.hidden=false;labEl.scrollTop=0;try{localStorage.setItem('mnr_labchip','1');}catch(e){}if(labChip)labChip.hidden=true;}
function labClose(){labEl.hidden=true;syncUI();if(garageDirty){garageDirty=false;gaDraw();}if(labFrom==='pause'&&running)pauseEl.hidden=false;showBest();}
{const tb=document.createElement('button');tb.className='go dim';tb.id='labBtn';tb.type='button';tb.textContent='LAB';$('setBtn').after(tb);tb.addEventListener('click',()=>labOpen('title'));
  const pr=$('pausem').querySelector('.row'),pb=document.createElement('button');pb.className='go dim';pb.id='labBtn2';pb.type='button';pb.textContent='LAB';(pr||$('pausem').querySelector('.in')).append(pb);pb.addEventListener('click',()=>{pauseEl.hidden=true;labOpen('pause');});}
