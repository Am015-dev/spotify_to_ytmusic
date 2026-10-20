/* ---------- STRATEGY: build paths, synergies, a heat budget, slot limits, stock that rotates per run, selling at a loss and boss-weakness picks ----------
   Everything here is a layer on top of the pit stop (shop.js), the garage perks (upgrades.js) and the market (meta.js). The data tables come first.
   PATHS     three builds: Glass Cannon (damage), Tank (survive), Beat Combo (live on the beat). Every upgrade and perk belongs to one or none.
   SYNS      pairs of items that do more together; SETS: bonuses for owning 2 and 4 pieces of one path (the 4-piece bonus has a price).
   HEAT      damage upgrades make every shot hotter (overheat locks the gun); Coolant and Heat Sink pay it back. One budget to balance.
   SLOTS     a run holds at most 6 different pit-stop upgrades (7 from story stage 14, 8 from stage 28).
   BOSSW     what a boss or mini-boss fires decides which upgrades are recommended against it (read from its real pattern list). */
function nextFoe(){if(typeof ST!=='undefined'&&ST.on)return nextFoeFrom(ST.n+(ST.over?1:0));
  const D=DISTRICTS[G&&G.di||0];if(!D)return null;const pats=BPATS(D.boss),tags=[];if(pats.includes('laser'))tags.push('dodge');if(pats.includes('summon'))tags.push('spread');if(pats.some(p=>/^(ring|spiral|fan9|fan7)$/.test(p)))tags.push('guard');tags.push('dps');
  return{nm:D.bossName,tags,pats};}
/* ----- what you own, the active synergies and set bonuses, and the numbers they add ----- */
const SYN={v:{},act:[],sets:{},cnt:{gc:0,tk:0,bc:0},owned:new Set(),hg:0,
  lvl(id){let l=SH.n(id);for(const d of TP_DEF)if(canon(d.id)===id)l=Math.max(l,TP.l(d.id));return l;},
  scan(){const o=new Set();for(const id in SH.got)if(SH.got[id]>0)o.add(canon(id));for(const d of TP_DEF)if(TP.l(d.id)>0)o.add(canon(d.id));this.owned=o;return o;},
  muted:false,   // tests of a single upgrade switch the synergy layer off
  calc(){const o=this.scan(),v={dmg:0,crit:0,inv:0,ck:0,win:0,sharp:0,nx:0,db:0,hull:0,off:0,heat:0,fr0:0},add=fx=>{for(const k in fx)v[k]=(v[k]||0)+fx[k];};
    if(this.muted){this.act=[];for(const p in PATHS){this.cnt[p]=0;this.sets[p]=[];}this.v=v;return v;}
    this.act=SYNS.filter(s=>o.has(s.a)&&o.has(s.b));for(const s of this.act)add(s.fx);
    for(const p in PATHS){let n=0;for(const id of o)if(PATHOF[id]===p)n++;this.cnt[p]=n;this.sets[p]=SETS[p].filter(t=>n>=t.n);for(const t of this.sets[p])add(t.fx);}
    this.v=v;return v;},
  heat(){let h=1+this.v.heat;for(const id in HEATL){if(id==='fr'&&this.v.fr0)continue;h+=HEATL[id]*this.lvl(id);}h-=.1*this.lvl('cool')+.1*TP.l('hsk');return Math.max(.55,Math.min(2.4,h));},
  /* the heat line of an upgrade card: what one more level of it costs */
  heatOf(id){return HEATL[id]?Math.round(HEATL[id]*100):0;},
  // would buying this complete a synergy? (the chip on the card)
  completes(id){const c=canon(id),o=this.owned;return SYNS.find(s=>!(o.has(s.a)&&o.has(s.b))&&((s.a===c&&o.has(s.b))||(s.b===c&&o.has(s.a))));},
  /* the 4-piece bonus is a trade: say so before the pieces are bought */
  hullDelta(){return (this.v.hull||0)-TP.l('glc');},
  applyHull(){if(!P||!G||!G.live)return;const t=this.hullDelta(),d=t-this.hg;if(!d)return;this.hg=t;P.max=Math.max(3,P.max+d);P.hp=Math.max(1,Math.min(P.max,P.hp+(d>0?d:0)));}};
{const rc=SH.recalc;SH.recalc=function(){rc.call(this);const v=SYN.calc(),n=id=>TP.l(id);
    this.ck+=v.ck;NR.mod.win+=v.win+10*n('bea');this.sharp+=v.sharp;this.nx*=(1+v.nx)*(1+.1*n('grd'));
    NR.mod.mag*=1-.15*n('grd');TP.nx0=this.nx;TP.mag0=NR.mod.mag;SYN.applyHull();};
  const ab=SH.absorb;SH.absorb=function(){const r=ab.call(this);if(r&&SYN.v.inv)P.inv=Math.max(P.inv,1.3+SYN.v.inv);return r;};
  const sh0=SH.shot;SH.shot=function(){const r=sh0.call(this);r.heat*=SYN.heat();return r;};}
NR.on('runStart',()=>{SYN.hg=0;SH.stock=[];SH.seen=new Set();SH.sold=0;setTimeout(()=>{if(!G||!G.live)return;
  const l=TP.l('ldp');if(l)SH.sh+=l;const g=TP.l('glc');if(g){P.max=Math.max(3,P.max-g);P.hp=Math.min(P.hp,P.max);SYN.hg=-g;}SH.recalc();},90);});

/* ----- new garage perks. Three have a downside: that is the deal ----- */
{const IC2={glc:'M12 2l3 7 7 .8-5.3 4.7 1.6 7.2L12 18l-6.3 3.7 1.6-7.2L2 9.8 9 9z',grd:'M12 2l8.5 5v10L12 22l-8.5-5V7z',ldp:'M5 8h14v8H5zM3 10h2v4H3zM19 10h2v4h-2z',bea:'M2 12l5-5v3h10V7l5 5-5 5v-3H7v3z',hsk:'M12 2a6 6 0 016 6c0 4-6 8-6 14C12 16 6 12 6 8a6 6 0 016-6z'};
  const NP=[{id:'hsk',n:'Heat Sink',p:80,max:5,c:'#7dffd8',pri:66,ic:IC2.hsk,t:l=>'Shots build '+10*l+'% less heat'},
    {id:'glc',n:'Glass Core',p:90,max:3,c:'#ff5a3d',pri:64,ic:IC2.glc,t:l=>'+'+14*l+'% shot damage',bad:l=>'Max hull -'+l},
    {id:'grd',n:'Greedy Pilot',p:60,max:4,c:'#19e3ff',pri:34,ic:IC2.grd,t:l=>'+'+10*l+'% Neon from kills',bad:l=>'Pickup range -'+15*l+'%'},
    {id:'ldp',n:'Lead Plating',p:110,max:3,c:'#3dffb0',pri:62,ic:IC2.ldp,t:l=>'Start with +'+l+' shield'+(l>1?'s':''),bad:l=>'Shot damage -'+6*l+'%'},
    {id:'bea',n:'Beat Addict',p:100,max:3,c:'#ffe14d',pri:61,ic:IC2.bea,t:l=>'On-beat window +'+10*l+' ms',bad:l=>'Off-beat shots -'+15*l+'%'}];
  const raw=load('mnr_tune',{}),eq=load('mnr_eq',null);
  for(const d of NP){TP_DEF.push(d);TP_BY[d.id]=d;if(raw&&isFinite(raw[d.id]))GA.tune[d.id]=Math.max(0,Math.min(d.max,Math.floor(raw[d.id])));GA.eq[d.id]=!!(eq&&eq[d.id]);}}
/* the pit-stop upgrade that pays the heat back */
{const u={id:'cool',n:'Coolant',t:'Shots build less heat',p:36,max:4,c:'#7dffd8',ic:'M12 2a6 6 0 016 6c0 4-6 8-6 14C12 16 6 12 6 8a6 6 0 016-6z'};SH.UPG.push(u);UBY.cool=u;LVT.cool=l=>'Heat per shot -'+10*l+'%';}
// what the upgrades.js damage formula multiplies in: synergies, set bonuses, the downside perks
SYN.dmg=()=>(1+SYN.v.dmg)*(1+.14*TP.l('glc'))*(1-.06*TP.l('ldp'));
SYN.off=()=>Math.max(.4,1-(SYN.v.off||0)-.15*TP.l('bea'));

/* ----- the pit stop: slots, rotating stock, sell, boss picks, previews ----- */
Object.defineProperty(SH,'slots',{get(){return PIT_SLOTS+(ST.on?(ST.n>=14)+(ST.n>=28):0);}});   // 6 different upgrades, 7 from stage 14, 8 from stage 28
SH.stock=[];SH.seen=new Set();SH.sold=0;SH.armed=null;
SH.pool=function(){const full=this.order.length>=this.slots;return UPG.filter(u=>this.n(u.id)<u.max&&(!u.x||GA.own[u.x])&&(!u.ok||u.ok())&&(!full||this.n(u.id)>0));};
SH.rerollPrice=function(){return 8+4*this.rerolls+3*this.pits;};
SH.restock=function(pool){const by={gc:[],tk:[],bc:[],n:[]},sh=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
  for(const u of pool)by[pathOf(u.id)||'n'].push(u.id);for(const k in by)sh(by[k]);
  const out=[];for(let i=0;i<3;i++)for(const k of['gc','tk','bc'])if(by[k].length&&out.length<9)out.push(by[k].shift());
  const rest=sh([].concat(by.gc,by.tk,by.bc,by.n));while(out.length<11&&rest.length)out.push(rest.shift());this.stock=out;this.seen=new Set();};
SH.buildScore=function(u){const c=canon(u.id),p=pathOf(u.id);let s=0;if(p){const top=Object.keys(SYN.cnt).sort((a,b)=>SYN.cnt[b]-SYN.cnt[a])[0];if(SYN.cnt[p]>0&&p===top)s+=30;s+=8*SYN.cnt[p];if(SYN.cnt[p]===1||SYN.cnt[p]===3)s+=14;}  // one piece short of a set bonus
  if(SYN.completes(u.id))s+=35;if(this.n(u.id)>0)s+=6;if(u.id==='hl'&&P&&P.hp<=P.max-2)s+=70;if(HEATL[c]&&SYN.heat()>1.5)s-=25;return s;};
SH.bossScore=function(u,foe){if(!foe)return 0;const t=UT[canon(u.id)];if(!t)return 0;const i=foe.tags.indexOf(t);return i<0?0:(i===0?60:i===1?45:t==='dps'?15:30)-4*this.n(u.id);};
SH.deal=function(){let pool=this.pool();if(!this.stock.length||!pool.some(u=>this.stock.includes(u.id)))this.restock(pool);
  const cand=pool.filter(u=>this.stock.includes(u.id)),out=[],take=u=>{if(u&&!out.includes(u)){out.push(u);return true;}return false;},foe=nextFoe();
  const best=(f,only)=>cand.filter(u=>!out.includes(u)&&(!only||only(u))).sort((a,b)=>f(b)-f(a)+(this.seen.has(a.id)?.5:0)-(this.seen.has(b.id)?.5:0))[0];
  take(best(u=>this.bossScore(u,foe),u=>this.bossScore(u,foe)>0));            // one card answers the next boss
  take(best(u=>this.buildScore(u)));                                           // one card follows your build
  const rest=cand.filter(u=>!out.includes(u)),unseen=rest.filter(u=>!this.seen.has(u.id));const wild=(unseen.length?unseen:rest);take(wild[Math.floor(Math.random()*wild.length)]);
  while(out.length<3){const more=pool.filter(u=>!out.includes(u));if(!more.length)break;take(more[Math.floor(Math.random()*more.length)]);}
  for(const u of out)this.seen.add(u.id);
  this.cards=out.map(u=>({u,sold:false,why:this.bossScore(u,foe)>0&&u===out[0]?'boss':null}));
  // the badge on the card: boss pick (first card) or build pick
  const bp=this.cards.find(c=>c.why==='boss');if(!bp){const b=this.cards.map((c,i)=>[this.buildScore(c.u),i]).sort((a,b)=>b[0]-a[0])[0];if(b&&b[0]>=20)this.cards[b[1]].why='build';}
  else{const b=this.cards.filter(c=>c!==bp).map(c=>[this.buildScore(c.u),c]).sort((a,b)=>b[0]-a[0])[0];if(b&&b[0]>=20)b[1].why='build';}
  this.foe=foe;this.armed=null;};
SH.sellPrice=function(id){const u=UBY[id],n=this.n(id);if(!u||n<1||NOSELL.has(id))return 0;return Math.max(1,Math.floor(.5*Math.round(1.25*u.p*(1+.5*(n-1)))));};
SH.sell=function(id){if(!this.active||this.lock>0)return false;const pr=this.sellPrice(id);if(!pr)return false;
  if(this.armed!==id){this.armed=id;this.msg('Sell '+UBY[id].n+' for '+pr+'? Tap again');this.draw();return false;}
  this.got[id]--;if(this.got[id]<=0){delete this.got[id];this.order=this.order.filter(x=>x!==id);}this.neon+=pr;this.sold++;this.armed=null;this.recalc();AU.sfx('hit');this.msg(UBY[id].n+' sold +'+pr);this.draw();return true;};
SH.buy0=SH.buy;SH.buy=function(i){this.armed=null;return this.buy0(i);};
/* ----- the pit-stop screen ----- */
{const st=document.createElement('style');st.textContent=`
.pg .card .pc{display:inline-flex;width:1.25em;height:1.25em;border-radius:50%;background:#05030c;border:1.5px solid var(--c);vertical-align:-.25em;margin-right:4px;flex:0 0 auto}
.pg .card .pc svg{width:100%;height:100%;padding:2px;box-sizing:border-box;background:none!important;color:var(--c);height:100%}
.pg .card .pv{font-family:var(--mono);font-size:clamp(11px,calc(var(--u)*2.8),15px);color:var(--dim);line-height:1.2}
.pg .card .chips{display:flex;gap:4px;flex-wrap:wrap;margin-top:2px;font-family:var(--mono);font-size:clamp(11px,calc(var(--u)*2.7),14px)}
.pg .card .chips b{font-weight:700;padding:0 6px;border-radius:8px;background:#05030c;border:1px solid var(--c,#8c86b8);color:var(--c,#ccc);white-space:nowrap}
.pg .card .chips b.heat{--c:#ff9a3d}.pg .card .chips b.syn{--c:#3dffb0}.pg .card .chips b.bad{--c:#ff5a6a}
.pg .card .n .rec{position:static;display:inline-block;margin-left:6px;vertical-align:middle;font-size:11px;padding:0 6px;line-height:1.35;background:#05030c;border:1.5px solid var(--amber,#ffb020);color:var(--amber,#ffb020)}
.pg .card .n .rec.boss{border-color:#ff5a6a;color:#ff9aa5;background:#05030c}
.pg .card .pp i.nx{background:var(--c);animation:pnx 1s ease-in-out infinite}
@keyframes pnx{0%,100%{opacity:.25}50%{opacity:1}}
.pg .bld{display:flex;gap:calc(var(--u)*2);align-items:center;flex:0 0 auto;font-family:var(--mono);font-size:clamp(11px,calc(var(--u)*2.9),15px);color:var(--dim);flex-wrap:wrap}
.pg .bld .bp{display:inline-flex;align-items:center;gap:3px;color:var(--c)}
.pg .bld .bp svg{height:1.5em;width:1.5em}
.pg .bld .bp i{display:inline-block;width:7px;height:7px;border-radius:2px;background:#ffffff22}.pg .bld .bp i.on{background:var(--c)}.pg .bld .bp i.set{box-shadow:0 0 5px var(--c)}
.pg .bld .hs{margin-left:auto;white-space:nowrap}.pg .bld .hs.hot{color:#ff9a3d}
.pg .foe{font-family:var(--mono);font-size:clamp(11px,calc(var(--u)*2.9),15px);color:#7dffd8;flex:0 0 auto;text-align:center;min-height:1.2em}
.pg .own button.oi{display:inline-flex;align-items:center;justify-content:center;gap:2px;min-height:44px;min-width:44px;padding:0 6px;border:1px solid transparent;border-radius:8px;background:#ffffff0a;color:var(--c);font-family:var(--mono);cursor:pointer}
.pg .own button.oi.arm{border-color:#ff5a6a;background:#ff5a6a33;animation:pnx .5s infinite}
.pg .own button.oi.ns{cursor:default;opacity:.85}
.pg .own .sl{margin-left:auto;color:var(--dim);white-space:nowrap}
@container (max-height:640px){.pg .aff{display:none}}
@container (max-height:640px){.pg .card .pv{display:none}}
@container (max-height:600px){.pg .card .chips{display:none}}
@container (max-height:430px){.pg .card .pv,.pg .card .chips,.pg .foe{display:none}.pg .bld{font-size:11px}}
`;document.head.appendChild(st);}
{const bl=document.createElement('div');bl.className='bld';bl.id='shBld';const fo=document.createElement('div');fo.className='foe';fo.id='shFoe';$('shOwn').before(bl,fo);
  $('shOwn').addEventListener('click',e=>{const b=e.target.closest('button.oi');if(b&&!b.classList.contains('ns'))SH.sell(b.dataset.id);});}
const heatTxt=()=>{const h=Math.round((SYN.heat()-1)*100);return 'HEAT '+(h>=0?'+':'')+h+'%';};
function buildBar(){let h='';for(const p in PATHS){const P_=PATHS[p],n=SYN.cnt[p],tier=n>=4?2:n>=2?1:0;h+=`<span class="bp" style="--c:${P_.c}" title="${P_.n}">${svgI(P_.ic)}${[0,1,2,3].map(i=>`<i class="${i<n?'on':''}${(i===1&&n>=2)||(i===3&&n>=4)?' set':''}"></i>`).join('')}</span>`;}
  const hot=SYN.heat()>1.45;return h+`<span class="hs${hot?' hot':''}">${heatTxt()}</span>`;}
SH.draw=function(){const box=$('shCards');box.innerHTML='';SYN.calc();let aff=0;const full=this.order.length>=this.slots;
  this.cards.forEach((c,i)=>{const u=c.u,pr=this.price(u),n=this.n(u.id),b=document.createElement('button'),p=pathOf(u.id),sy=SYN.completes(u.id),hl=SYN.heatOf(canon(u.id)),nw=n?lvText(u,n):'';b.type='button';if(!c.sold&&this.neon>=pr)aff++;
    b.className='card'+(c.sold?' sold':this.neon<pr?' no':'');b.style.setProperty('--c',u.c);b.dataset.id=u.id;
    const chips=(sy?`<b class="syn" title="${sy.t}">+ ${sy.n}</b>`:'')+(hl?`<b class="heat">HEAT +${hl}%</b>`:'')+(u.id==='cool'?'<b class="heat">COOLS</b>':'');
    b.innerHTML=svgI(u.ic)+`<div class="tx"><div class="n">${pathChip(p)}${u.n}${u.max>1?`<span class="lv">${n+1}/${u.max}</span>`:''}${c.why&&!c.sold?`<span class="rec${c.why==='boss'?' boss':''}">${c.why==='boss'?'BOSS PICK':'BUILD PICK'}</span>`:''}</div><div class="t">${lvText(u,n+1)}</div>${nw?`<div class="pv">${nw}</div>`:''}${chips?`<div class="chips">${chips}</div>`:''}${u.max>1?`<div class="pp">${Array.from({length:u.max},(_,k)=>`<i class="${k<n?'on':k===n?'nx':''}"></i>`).join('')}</div>`:''}</div><div class="pr">${c.sold?'FITTED':neonI+' '+pr}</div>`;
    b.addEventListener('click',()=>this.buy(i));box.appendChild(b);});
  $('shN').textContent=this.neon;$('shRe').innerHTML='REROLL '+neonI+' '+this.rerollPrice();$('shRe').classList.toggle('dim',this.neon<this.rerollPrice());
  $('shGo').textContent=this.picks?'GO':'SKIP';
  $('shBld').innerHTML=buildBar();$('shFoe').textContent=this.foe?this.foe.nm+': '+foeTip(this.foe):'';
  $('shOwn').innerHTML=(this.order.length?this.order.map(id=>{const u=UBY[id],sp=this.sellPrice(id);return `<button type="button" class="oi${NOSELL.has(id)?' ns':''}${this.armed===id?' arm':''}" data-id="${id}" style="--c:${u.c}" aria-label="${u.n}${sp?', sell for '+sp:''}">${svgI(u.ic)}${this.n(id)>1?'×'+this.n(id):''}</button>`;}).join(''):'<span style="color:var(--dim)">No upgrades yet</span>')+`<span class="sl">SLOTS ${this.order.length}/${this.slots}${full?' · FULL':''}${this.order.some(id=>!NOSELL.has(id))?' · TAP TO SELL':''}`+'</span>';
  const ga=typeof affordCount==='function'?affordCount():0;$('shAff').innerHTML=(aff?`You can afford <b>${aff}</b> upgrade${aff>1?'s':''}`:'Nothing affordable yet')+(ga?` · Garage: <b>${ga}</b> ready`:'');
  SH.aff=aff;SH.rec=this.cards.findIndex(c=>c.why);};

/* ----- ship preview: one bar of the ship's fire pattern with a moving playhead, and what it does to damage and heat ----- */
const SHIPACC={drift:{every:1,off:0,n:'FAN'},lancer:{every:2,off:1,n:'LANCE'},nova:{every:3,off:2,n:'RING'}};   // what the extra ships add on top of the steady 16th grid (shapes.js)
function shipRhythm(id){const x=typeof SHIPX==='object'?SHIPX[id]:null,ac=SHIPACC[id],gs=x?x.gs:id==='tri'?1/3:id==='hv'?2:id==='ec'?.5:.25,mk=x?x.mk:()=>true,out=[];
  for(let c=0;c*gs<4-1e-6;c++)if(mk(c)){const a=ac&&c%ac.every===ac.off;out.push({t:c*gs/4,cls:id==='hv'||a?'big':'',echo:id==='ec'});}return out;}
function rhythmHTML(id){const shots=shipRhythm(id),x=typeof SHIPX==='object'?SHIPX[id]:null,ac=SHIPACC[id],nb=ac?shots.filter(s=>s.cls).length:0;
  return `<div class="rh" aria-hidden="true">${shots.map(s=>`<i${s.cls?' class="big"':''} style="left:${(s.t*100).toFixed(1)}%"></i>${s.echo&&s.t+.25<1?`<i class="ech" style="left:${((s.t+.25)*100).toFixed(1)}%"></i>`:''}`).join('')}<u></u></div>`
   +`<div class="chips">${id==='ec'?`<b>${shots.length} SHOTS + ${shots.length} ECHOES</b>`:ac?`<b>${nb} ${ac.n}${nb>1?'S':''} A BAR</b>`:`<b>${shots.length} ${id==='hv'?'BLASTS':'SHOTS'} A BAR</b>`}${x?`<b class="heat">HEAT x${x.hk}</b>`:''}</div>`;}
{const st=document.createElement('style');st.textContent=`
.pg .card .rh{position:relative;height:12px;margin-top:3px;background:#ffffff10;border-radius:3px;overflow:hidden}
.pg .card .rh i{position:absolute;top:50%;width:5px;height:5px;margin:-2.5px 0 0 -2px;border-radius:50%;background:var(--c,#ccc)}
.pg .card .rh i.big{width:10px;height:10px;margin:-5px 0 0 -4px}
.pg .card .rh i.ech{opacity:.35}
.pg .card .rh u{position:absolute;top:0;bottom:0;width:2px;background:#fff;box-shadow:0 0 6px #fff;animation:rhp 2s linear infinite}
@keyframes rhp{from{left:0}to{left:100%}}
.pg .presets{display:flex;gap:calc(var(--u)*1.6)}.pg .presets .pst{flex:1 1 0;min-width:0;min-height:44px;display:flex;align-items:center;justify-content:center;gap:4px;padding:.3em .2em;font-size:clamp(11px,calc(var(--u)*2.8),13px);white-space:nowrap}
.pg .presets .pst svg{height:1.3em;width:1.3em;color:var(--c)}
.pg .paths{display:flex;flex-direction:column;gap:3px;text-align:left;width:min(100%,600px);margin:0 auto}
.pg .pth{display:flex;flex-wrap:wrap;gap:0 10px;align-items:center;color:var(--c);font-size:clamp(11px,calc(var(--u)*2.9),13px)}
.pg .pth .pn{display:flex;align-items:center;gap:4px;white-space:nowrap}.pg .pth svg{height:1.4em;width:1.4em}
.pg .pth .pb i{display:inline-block;width:8px;height:8px;margin-right:2px;border-radius:2px;background:#ffffff22}.pg .pth .pb i.on{background:var(--c)}
.pg .pth .pt{text-align:left;color:var(--dim);flex:1 1 100%;padding-left:1.9em}
.pg .syns{display:flex;flex-wrap:wrap;gap:4px;justify-content:center}
.pg .syns b,.pg .cargo button.oi{font-weight:700;padding:2px 8px;border-radius:9px;background:#05030c;border:1px solid #3dffb0;color:#3dffb0;font-size:clamp(11px,calc(var(--u)*2.8),12px);display:inline-flex;align-items:center;gap:3px}
.pg .syns b svg{height:1.2em;width:1.2em}.pg .syns b:not(.on){border-style:dashed;opacity:.6}.pg .syns b.heat{border-color:#ff9a3d;color:#ff9a3d}
.pg .cargo button.oi{border-color:var(--c);color:var(--c);min-height:44px;margin:2px 3px;cursor:pointer}.pg .cargo button.oi svg{height:1.3em;width:1.3em}
.pg .mkbar{display:flex;gap:10px;align-items:center;justify-content:space-between;flex-wrap:wrap}.pg .mkbar .go{flex:0 0 auto;min-height:40px}
.pg .mkbar .foe2{color:#7dffd8;font-size:clamp(11px,calc(var(--u)*2.8),12px);flex:1 1 12em;text-align:left}
.pg .card s{color:var(--dim);margin-right:3px}
.pg .card .pv::before{content:"NOW ";letter-spacing:.08em;color:#ffffff55}
`;document.head.appendChild(st);}

/* test hooks (strategy-test.js) */
window.__nrs={get SYN(){return SYN},SYNS,PATHS,foeOf,foeTip,pathOf,lvText,tpDmg:()=>tpDmg(),get MK(){return MK},TP_BY,nextFoe};

{const st=document.createElement('style');st.textContent=`
#gaCards.tune .card.d{flex-wrap:wrap}
#gaCards.tune .card.d .tx{flex:1 1 150px}
#gaCards.tune .card.d .bt{flex:1 1 100%;justify-content:space-between}
#gaCards.tune .card.d .bt button{flex:1 1 0;min-height:44px}
`;document.head.appendChild(st);}
