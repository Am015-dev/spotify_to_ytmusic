// PURPOSE: pilot classes picked before a run
// FLAG: classes (?classes=0)
// TEST: classes-test.js
/* ---------- PILOT CLASSES (flag RET.classes, default ON; ?classes=0 = the game exactly as before). Test: nightrun/classes-test.js.
   Owner, 21 Oct 2026: "pilot can have a class so we can have more variety on the game unlocking more skills but with balance."
   Five classes, picked in the Garage tab PILOT. No class picked = ROOKIE = the old game. Each class = a passive + a downside + a SIGNATURE that rides on a button
   the game already has (every class signature fires when an EMP goes off, or on the dash), so there is no new HUD button:
     GUNNER   +10% shot damage, dash refills 10% slower.       OVERCLOCK: an EMP also gives 2.5 s of overdrive volleys (abilities.js od).
     GHOST    dash refills 15% faster, a graze refills 8% of a dash charge, EMP meter fills 12% slower.   PHANTOM: an EMP refills every dash charge and leaves a decoy.
     WARDEN   parry window 10% wider, fires on 90% of the beat cells.   BULWARK: an EMP raises a shield that eats the next hit within 2 s.
     TINKER   power-ups drop 12% more often, pickups fill the EMP meter 10% more, shots deal 5% less.   SALVAGE: an EMP pulls every pickup in.
     GAMBLER  every 8 kills without a hit +2% damage (to +10%); a hit drops the streak and empties the EMP meter.   ALL-IN: an EMP cashes the streak
              (8 kills+): every foe on screen takes 1 hull per 4 streak kills (6 at most; bosses untouched), score +50 per kill, the streak resets.
   SKILL TREE: 6 nodes a class (3 rows of 2; a row opens when one node of the row above is owned), bought with PILOT XP (kills / 8 + 20 a stage cleared).
     Every node moves ONE knob by 10-15%, and every strong node carries a paired downside. Knobs are clamped (KC): shot damage never above x1.15 in total
     (streak included), so the class bonus sits inside hard.js' DPS ceiling, which still books every shot after it. No node touches hull, armour.js HP or caps.
   FAIR SEEDS: a daily run uses the class with no tree nodes (the base class is what the balance gate measures).
   Test hooks: ?cls=<id> forces a class, &clstree=all owns its whole tree (classes-test.js measures the worst case). Placeholder icons: shape ids cls-<id>, node-<id>
   (ASSETS-NEEDED-3.md "Pilot classes"). */
if(RET.classes===undefined)RET.classes=!/[?&]classes=0/.test(location.search);
RET.sioKeys&&RET.sioKeys.push('mnr_cls');
const CLS=window.CLS={get on(){return!!RET.classes;},
  KC:{dmg:[.85,1.15],dash:[.8,1.2],emp:[.85,1.15],pk:[.85,1.15],fire:[.85,1],pwc:[.8,1.15],sig:[.85,1.35],graze:[.85,1.3],streak:[.85,1.15]},
  L:[
   {id:'gunner',n:'GUNNER',c:'#ff8a3d',ic:'tri',p:'Hits harder, dashes slower.',st:[5,2,3],sig:'OVERCLOCK',sd:'EMP also fires 2.5 s of overdrive volleys',
    k:{dmg:1.10,dash:1.10},pd:'+10% shot damage, dash refills 10% slower',
    T:[{id:'g1',n:'HOT ROUNDS',k:{dmg:1.10,dash:1.10}},{id:'g2',n:'LONG BURN',k:{sig:1.15}},
       {id:'g3',n:'BRASS',k:{emp:1.12,fire:.9}},{id:'g4',n:'ON THE ONE',k:{pk:1.12}},
       {id:'g5',n:'COOLANT',k:{dash:.88,dmg:.9}},{id:'g6',n:'HEAVY CORE',k:{sig:1.15,emp:.88}}]},
   {id:'ghost',n:'GHOST',c:'#7df9ff',ic:'ring',p:'Dash king: grazes refill it, slow EMP.',st:[2,5,2],sig:'PHANTOM',sd:'EMP refills every dash and leaves a decoy',
    k:{dash:.85,graze:1,emp:.88},pd:'dash refills 15% faster, grazes refill dashes, EMP fills 12% slower',
    T:[{id:'h1',n:'SLIPSTREAM',k:{dash:.88}},{id:'h2',n:'ECHO STEP',k:{graze:1.15}},
       {id:'h3',n:'SHADE',k:{sig:1.15}},{id:'h4',n:'THIN BLADE',k:{dmg:1.10,pk:.88}},
       {id:'h5',n:'FLICKER',k:{emp:1.12,dash:1.10}},{id:'h6',n:'VEIL',k:{pk:1.12}}]},
   {id:'warden',n:'WARDEN',c:'#00e5c3',ic:'bar',p:'Parry and shield, fires slower.',st:[3,2,5],sig:'BULWARK',sd:'EMP raises a shield that eats the next hit (2 s)',
    k:{pk:1.10,fire:.9},pd:'parry window 10% wider, fires on 90% of beats',
    T:[{id:'w1',n:'WIDE GUARD',k:{pk:1.12}},{id:'w2',n:'THICK PLATE',k:{sig:1.12,fire:.9}},
       {id:'w3',n:'STEADY',k:{fire:1.10}},{id:'w4',n:'CHARGED',k:{emp:1.12,dmg:.9}},
       {id:'w5',n:'BRACE',k:{sig:1.15,dash:1.12}},{id:'w6',n:'RIPOSTE',k:{dmg:1.10,fire:.9}}]},
   {id:'tinker',n:'TINKER',c:'#ffd23d',ic:'dia',p:'More power-ups, weaker gun.',st:[2,3,4],sig:'SALVAGE',sd:'EMP pulls every pickup to the ship',
    k:{pwc:.88,emp:1,pick:1.10,dmg:.95},pd:'12% more power-ups, pickups fill EMP 10% more, 5% less damage',
    T:[{id:'t1',n:'SCAVENGER',k:{pwc:.88}},{id:'t2',n:'TUNED CELLS',k:{emp:1.12}},
       {id:'t3',n:'MAGNET ARM',k:{sig:1.15}},{id:'t4',n:'OVERCLOCK',k:{dmg:1.10,pwc:1.12}},
       {id:'t5',n:'SPARE COILS',k:{dash:.88,emp:.88}},{id:'t6',n:'CACHE',k:{pwc:.88,dmg:.9}}]},
   {id:'gambler',n:'GAMBLER',c:'#ff5fd2',ic:'dot',p:'A kill streak builds damage, a hit breaks it.',st:[4,3,1],sig:'ALL-IN',sd:'EMP cashes the streak: a hit on every foe',
    k:{streak:1},pd:'+2% damage per 8 kills unhit (to +10%); a hit empties streak and EMP meter',
    T:[{id:'b1',n:'HIGH ROLLER',k:{streak:1.15}},{id:'b2',n:'HOT HAND',k:{step:.87}},
       {id:'b3',n:'BIG POT',k:{sig:1.15}},{id:'b4',n:'HEDGE',k:{emp:1.12}},
       {id:'b5',n:'RISKY',k:{dmg:1.10,pk:.88}},{id:'b6',n:'COOL HEAD',k:{dash:.88,streak:.88}}]}],
  COST:[40,60,90],XP_K:8,XP_CLEAR:20,
  R:{k:{},cls:null,shield:0,streak:0,daily:false,live:false},stat:{sig:0,shield:0,cash:0,refill:0,xp:0},
  /* save: {c:class id or '', xp, own:{nodeId:1}} */
  sv(){const s=load('mnr_cls',null);return s&&typeof s==='object'?Object.assign({c:'',xp:0,own:{}},s):{c:'',xp:0,own:{}};},
  put(s){save('mnr_cls',s);},
  def(id){return this.L.find(c=>c.id===id)||null;},
  force:(location.search.match(/[?&]cls=(\w+)/)||[])[1]||null,forceTree:/[?&]clstree=all/.test(location.search),
  cur(){if(!this.on)return null;return this.def(this.force||this.sv().c);},
  row(i){return i>>1;},
  canBuy(c,i){const s=this.sv(),n=c.T[i];if(s.own[n.id])return'owned';const r=this.row(i);if(r>0&&!c.T.some((m,j)=>this.row(j)===r-1&&s.own[m.id]))return'locked';return s.xp>=this.COST[r]?'ok':'xp';},
  buy(c,i){const v=this.canBuy(c,i);if(v!=='ok')return v;const s=this.sv(),n=c.T[i];s.xp-=this.COST[this.row(i)];s.own[n.id]=1;this.put(s);return'ok';},
  pick(id){const s=this.sv();s.c=this.def(id)?id:'';this.put(s);},
  /* the knobs for this run: passive x owned nodes, each clamped */
  knobs(c,tree){const k={dmg:1,dash:1,emp:1,pk:1,fire:1,pwc:1,sig:1,graze:1,streak:1,step:1,pick:1};if(!c)return k;const s=this.sv();
    const mul=o=>{for(const q in o)k[q]=(k[q]||1)*o[q];};mul(c.k);if(tree)for(const n of c.T)if(this.forceTree||s.own[n.id])mul(n.k);
    for(const q in this.KC)k[q]=clamp(k[q],this.KC[q][0],this.KC[q][1]);return k;},
  begin(d){const R=this.R;R.cls=null;R.k=this.knobs(null);R.shield=0;R.streak=0;R.live=false;
    if(!this.on||!d||d.lab||d.tut)return;const c=this.cur();if(!c)return;
    R.daily=!!d.daily;R.cls=c;R.k=this.knobs(c,!R.daily);R.live=true;
    if(c.hull&&!d.resume){P.max=Math.max(3,P.max+c.hull);P.hp=Math.min(P.hp,P.max);}},
  is(id){return this.R.live&&this.R.cls&&this.R.cls.id===id;},
  streakK(){if(!this.is('gambler'))return 0;const R=this.R,step=Math.max(4,Math.round(8*R.k.step));return Math.min(.10*R.k.streak,Math.floor(R.streak/step)*.02);},
  dmgK(){if(!this.R.live)return 1;const [a,b]=this.KC.dmg;return clamp(this.R.k.dmg*(1+this.streakK()),a,b);},
  /* EMP signature (called after abilities.js fired an EMP) */
  sigFire(){const R=this.R,c=R.cls,g=R.k.sig;if(!c||!G||G.dead)return;this.stat.sig++;const S=ABIL.st();
    if(c.id==='gunner'){S.od=Math.max(S.od||0,2.5*g);floater(P.x,P.y-40,'OVERCLOCK',c.c);}
    else if(c.id==='ghost'){S.n=ABIL.max();S.r=0;S.dec={x:P.x,y:P.y,t:1.2*g};floater(P.x,P.y-40,'PHANTOM',c.c);}
    else if(c.id==='warden'){R.shield=2*g;floater(P.x,P.y-40,'BULWARK',c.c);}
    else if(c.id==='tinker'){let n=0;for(const p of G.pk){p.x=P.x;p.y=P.y;n++;}floater(P.x,P.y-40,'SALVAGE '+n,c.c);}
    else if(c.id==='gambler'){const st=R.streak;if(st<8){floater(P.x,P.y-40,'ALL-IN: 8 KILLS FIRST',c.c);return;}
      const d=Math.min(6,Math.floor(st/4*g));for(const e of G.en){if(e.type==='boss'||e.dead||e.hp<=0||e.gr)continue;ABIL.zap(e,d);e.flash=.2;}
      G.score+=Math.round(50*st*G.mult);this.stat.cash++;floater(P.x,P.y-40,'ALL-IN x'+st,c.c);R.streak=0;}},
  /* PILOT XP: kills / 8 + 20 for a cleared stage; lab, tutorial and quit runs pay nothing */
  pay(n){if(!(n>0))return;const s=this.sv();s.xp=(s.xp|0)+n;this.put(s);this.stat.xp+=n;}
};
/* ---------- hooks: every one is a wrapper that passes straight through when no class is live ---------- */
NR.on('runStart',d=>CLS.begin(d||{}));
NR.on('runEnd',d=>{const R=CLS.R;if(R.live&&d&&!d.quit&&G)CLS.pay(Math.floor((G.kills|0)/CLS.XP_K));R.live=false;R.cls=null;});
NR.on('stageClear',()=>{if(CLS.R.live)CLS.pay(CLS.XP_CLEAR);});
{const d0=SH.dmk;SH.dmk=function(){const v=d0.apply(this,arguments);return CLS.R.live?v*CLS.dmgK():v;};}
{const c0=SH.cellOn;SH.cellOn=function(cell){const v=c0.apply(this,arguments);if(!v||!CLS.R.live||CLS.R.k.fire>=1)return v;
  const h=Math.imul((cell|0)^0x5bd1,2654435761)>>>0;return h%1000<1000*CLS.R.k.fire;};}   // a fixed hash per beat cell: 90% fire = every tenth cell silent
if(window.ABIL){
  {const r0=ABIL.refill;ABIL.refill=function(){const v=r0.apply(this,arguments);return CLS.R.live?v*CLS.R.k.dash:v;};}
  {const g0=ABIL.gain;ABIL.gain=function(v,src,e){if(CLS.R.live&&v>0)v*=CLS.R.k.emp*(src==='pickup'?CLS.R.k.pick:1);return g0.call(this,v,src,e);};}
  {const e0=ABIL.emp;ABIL.emp=function(){const n0=this.stat.emp,r=e0.apply(this,arguments);if(CLS.R.live&&this.stat.emp>n0)CLS.sigFire();return r;};}}
if(window.TIM&&TIM.pkW){const p0=TIM.pkW;TIM.pkW=function(){const v=p0.apply(this,arguments);return CLS.R.live?v*CLS.R.k.pk:v;};}
NR.on('graze',()=>{if(!CLS.is('ghost')||!G.ab)return;const S=G.ab;if(S.n>=ABIL.max())return;S.r+=.08*CLS.R.k.graze;CLS.stat.refill++;if(S.r>=1){S.r-=1;S.n++;}});
NR.on('spawn',e=>{if(!CLS.R.live||CLS.R.k.pwc===1||!e||!e.pw||!G.pw)return;G.pw.cnt=Math.max(1,Math.round(G.pw.cnt*CLS.R.k.pwc));});   // power.js just re-armed its counter
NR.on('kill',d=>{if(CLS.is('gambler')&&d&&!d.boss)CLS.R.streak++;});
NR.on('hurt',()=>{if(CLS.is('gambler')){CLS.R.streak=0;if(G.ab)G.ab.m=0;}});
NR.on('tick',dt=>{if(CLS.R.shield>0)CLS.R.shield=Math.max(0,CLS.R.shield-dt);});
{const h0=hurt;hurt=function(n){if(CLS.R.live&&CLS.R.shield>0&&!(P.inv>0)&&!G.dead){CLS.R.shield=0;P.inv=1;CLS.stat.shield++;burst(P.x,P.y,'#00e5c3',18,240);floater(P.x,P.y-30,'BLOCKED','#00e5c3');return;}return h0.apply(this,arguments);};}
/* the shield ring round the ship while BULWARK is up */
{const dr=ABIL.draw;ABIL.draw=function(){const r=dr.apply(this,arguments);if(CLS.R.shield>0&&P&&ctx){ctx.save();ctx.globalAlpha=.35+.25*Math.min(1,CLS.R.shield);ctx.strokeStyle='#00e5c3';ctx.lineWidth=3;ctx.beginPath();ctx.arc(P.x,P.y,30,0,7);ctx.stroke();ctx.restore();}return r;};}
/* ---------- UI: Garage tab PILOT (class picker + skill tree) ---------- */
const clsSvg=(k,c,z)=>{z=z||28;const h=z/2;const b=k==='tri'?`<path d="M${z*.12} ${z*.15}L${z*.9} ${h}L${z*.12} ${z*.85}Z" fill="${c}"/>`:k==='ring'?`<circle cx="${h}" cy="${h}" r="${z*.36}" fill="none" stroke="${c}" stroke-width="4"/>`
  :k==='bar'?`<rect x="${z*.3}" y="${z*.1}" width="${z*.4}" height="${z*.8}" rx="3" fill="${c}"/>`:k==='dia'?`<path d="M${h} ${z*.08}L${z*.92} ${h}L${h} ${z*.92}L${z*.08} ${h}Z" fill="${c}"/>`:`<circle cx="${h}" cy="${h}" r="${z*.32}" fill="${c}"/>`;
  return`<svg width="${z}" height="${z}" viewBox="0 0 ${z} ${z}" aria-hidden="true">${b}</svg>`;};
const CLSUI={sel:null,view:null,
  kTxt(k){const N={dmg:'shot damage',dash:'dash refill time',emp:'EMP meter fill',pk:'parry window',fire:'fire rate',pwc:'power-up gap',sig:'signature',graze:'graze refill',streak:'streak cap',step:'kills per streak step',pick:'pickup EMP fill'};
    return Object.keys(k).map(q=>{const p=Math.round((k[q]-1)*100);return(p>0?'+':'')+p+'% '+N[q];}).join(', ');},
  draw(box){const s=CLS.sv(),cur=CLS.def(s.c),v=CLS.def(this.view)||cur||CLS.L[0];this.view=v.id;
    let h=`<div class="clsH">PILOT CLASS <b>${cur?cur.n:'ROOKIE (none)'}</b><span>XP <b id="clsXp">${s.xp|0}</b></span></div><div class="clsL">`;
    for(const c of CLS.L){const bars=['PWR','SPD','GRD'].map((l,i)=>`<i>${l}<u><s style="width:${c.st[i]*20}%;background:${c.c}"></s></u></i>`).join('');
      h+=`<button type="button" class="clsC${c.id===v.id?' on':''}${cur&&cur.id===c.id?' eq':''}" data-c="${c.id}" style="--c:${c.c}">${clsSvg(c.ic,c.c)}<span class="n">${c.n}</span><span class="p">${c.p}</span><span class="sb">${bars}</span></button>`;}
    h+=`</div><div class="clsD"><p><b>${v.n}</b> ${v.pd}.</p><p><b>${v.sig}</b> ${v.sd}.</p>`
      +`<button type="button" class="go" id="clsPick">${cur&&cur.id===v.id?'PICKED: UNPICK':'PICK '+v.n}</button></div><div class="clsT">`;
    v.T.forEach((n,i)=>{const st=CLS.canBuy(v,i);h+=`<button type="button" class="clsN ${st}${this.sel===n.id?' on':''}" data-i="${i}" style="--c:${v.c}">${clsSvg(st==='owned'?v.ic:'dot',st==='owned'?v.c:'#5a6b7a',18)}<span>${n.n}</span><small>${st==='owned'?'OWNED':CLS.COST[CLS.row(i)]+' XP'}</small></button>`;});
    const sn=v.T.findIndex(n=>n.id===this.sel);
    h+=`</div><div class="clsI" id="clsI">${sn<0?'Tap a skill to see it. Daily runs use the class without skills.':`<b>${v.T[sn].n}</b> ${this.kTxt(v.T[sn].k)}. <button type="button" class="go" id="clsBuy"${CLS.canBuy(v,sn)==='ok'?'':' disabled'}>${({owned:'OWNED',locked:'OWN ONE ABOVE FIRST',xp:'NEED '+CLS.COST[CLS.row(sn)]+' XP',ok:'UNLOCK '+CLS.COST[CLS.row(sn)]+' XP'})[CLS.canBuy(v,sn)]}</button>`}</div>`;
    box.innerHTML=h;
    for(const b of box.querySelectorAll('.clsC'))b.addEventListener('click',()=>{this.view=b.dataset.c;this.sel=null;gaDraw();});
    box.querySelector('#clsPick').addEventListener('click',()=>{CLS.pick(cur&&cur.id===v.id?'':v.id);gaMsg(cur&&cur.id===v.id?'No class: ROOKIE':v.n+' picked');gaDraw();});
    for(const b of box.querySelectorAll('.clsN'))b.addEventListener('click',()=>{const n=v.T[+b.dataset.i];this.sel=this.sel===n.id?null:n.id;gaDraw();});
    const bb=box.querySelector('#clsBuy');if(bb)bb.addEventListener('click',()=>{const r=CLS.buy(v,sn);gaMsg(r==='ok'?v.T[sn].n+' unlocked':'Not yet');gaDraw();});}};
{const st=document.createElement('style');st.textContent=`#gaCards.clsbox{display:block;overflow-y:auto;padding:0 4px}
.clsH{display:flex;justify-content:space-between;align-items:center;gap:8px;font-size:14px;margin:4px 0 8px;color:#dfe8ff}.clsH b{color:#ffe14d}
.clsL{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:6px}
.clsC{display:grid;grid-template-columns:30px 1fr;grid-template-rows:auto auto auto;column-gap:6px;row-gap:2px;align-items:center;text-align:left;min-height:44px;padding:6px 8px;
  border:2px solid #3a3f66;border-radius:10px;background:#141634;color:#dfe8ff;font:inherit;cursor:pointer}
.clsC svg{grid-row:1/3}.clsC .n{font-size:14px;font-weight:700;color:var(--c)}.clsC .p{grid-column:1/3;font-size:13px;line-height:1.25}
.clsC .sb{grid-column:1/3;display:flex;gap:6px}.clsC .sb i{flex:1;font-style:normal;font-size:13px;display:flex;flex-direction:column;gap:2px}
.clsC .sb u{display:block;height:5px;border-radius:3px;background:#2a2d52;text-decoration:none}.clsC .sb s{display:block;height:100%;border-radius:3px}
.clsC.on{border-color:var(--c)}.clsC.eq{box-shadow:0 0 0 2px #ffe14d inset}
.clsD{margin:8px 0;font-size:14px;line-height:1.35;color:#dfe8ff}.clsD p{margin:0 0 4px}.clsD b{color:#ffe14d}.clsD .go{min-height:44px;margin-top:4px}
.clsT{display:grid;grid-template-columns:1fr 1fr;gap:6px}
.clsN{display:flex;align-items:center;gap:6px;min-height:44px;padding:4px 8px;border:2px solid #3a3f66;border-radius:10px;background:#141634;color:#dfe8ff;font:inherit;font-size:13px;text-align:left;cursor:pointer}
.clsN span{flex:1;min-width:0;overflow-wrap:anywhere}.clsN small{font-size:13px;color:#9aa6c8;white-space:nowrap}.clsN.owned{border-color:var(--c)}.clsN.locked{opacity:.6}.clsN.on{box-shadow:0 0 0 2px #ffe14d inset}
.clsI{margin:8px 0;font-size:14px;line-height:1.35;color:#dfe8ff;min-height:44px}.clsI b{color:#ffe14d}.clsI .go{min-height:44px;margin-top:4px;display:block}`;document.head.appendChild(st);}
{const tb=garageEl.querySelector('.tabs'),b=document.createElement('button');b.className='go dim';b.dataset.t='pilot';b.type='button';b.textContent='PILOT';b.hidden=!CLS.on;
 b.addEventListener('click',()=>{GA.tab='pilot';gaDraw();if(typeof LS!=='undefined'&&LS.tryShow)LS.tryShow('pilot');});tb.appendChild(b);
 const g0=gaDraw;gaDraw=function(){const box=$('gaCards');if(GA.tab!=='pilot'||!CLS.on){box.classList.remove('clsbox');return g0.apply(this,arguments);}
   $('gaBank').innerHTML=neonI+' <b id="gaBankN">'+window.fmtN(GA.bank)+'</b>';for(const q of garageEl.querySelectorAll('.tabs button'))q.classList.toggle('on',q.dataset.t===GA.tab);
   const gp=$('gaPic');if(gp)gp.style.display='none';box.classList.remove('tune','wpt','fgbox');box.classList.add('clsbox');const y=box.scrollTop;CLSUI.draw(box);box.scrollTop=y;};}
/* first-time lesson card (lessons.js layer, W63): shown the first time the PILOT tab opens */
if(typeof LSN!=='undefined'&&CLS.on&&!LSN.some(l=>l.id==='pilot')){
  for(const c of CLS.L)if(typeof LS_OPT!=='undefined'){LS_OPT[c.id]=[c.ic,c.n];LS_OC[c.id]=c.c;}
  LSN.push({id:'pilot',n:'PILOT CLASS',cards:[
    ['PICK A PILOT',lsRow(...CLS.L.map(c=>clsSvg(c.ic,c.c,26))),'Each class trades a strength for a weakness. Its SIGNATURE fires with your EMP.'],
    ['EARN SKILLS',lsRow(clsSvg('dot','#5a6b7a',22),'<i>&rarr;</i>',clsSvg('dia','#ffd23d',26)),'Runs give PILOT XP. Each skill moves one thing a little, often with a cost.']],
    pr:{type:'pick',rounds:[{q:'Bullets everywhere, you want to slip through. Which pilot?',art:lsRow(lsN('dot',FOE,4,18)),opts:['gunner','ghost','tinker'],ok:'ghost',why:'GHOST dashes more often.'}]}});}
window.__cls={CLS,UI:CLSUI,open:()=>{openGarage();GA.tab='pilot';gaDraw();}};   // test hook
