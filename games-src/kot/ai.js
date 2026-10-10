/* ================= computer players ================= */
/* what a set of dice would give monster p (for previews and computer decisions); follows resolveCore closely */
function scoreDice(p,dice){const c=countsOf(dice);const tf=G.tf||{};const act=p.i===G.active;
  if(act&&tf.void)c[tf.void]=0;if(curseOn('k_ka')&&!(act&&tf.kaOff)){c['1']=c['2']=c['3']=0}if(curseOn('k_hotep')&&scarab()!==p.i)c.C=0;if(act&&tf.noClaw)c.C=0;if(act&&tf.catnip)for(const f in c)c[f]*=2;
  let vp=0,en=0,hl=0,dmg=0,kill=false,targets=[],add=0;const inT=inCity(p.i);
  for(const f of ['1','2','3'])if(c[f]>=3){vp+=(+f)+(c[f]-3);if(f==='1')vp+=2*has(p,'gourmand')+has(p,'w_skul');if(f==='2')add+=2*has(p,'quills')}
  if(has(p,'omni')&&c['1']&&c['2']&&c['3'])vp+=2*has(p,'omni');if(has(p,'spree')&&FACES.every(f=>c[f]))vp+=9;
  if(c['1']){vp+=hasE(p,37);add+=hasE(p,38)}
  if(c.E)en=c.E*(1+has(p,'w_sky'))+has(p,'kidfan');
  if(c.H&&canHealDice(p))hl=Math.max(0,Math.min(c.H*(1+has(p,'w_sky'))+has(p,'regrow'),maxhp(p)-p.hp));
  const rolled=c.C>0;let amt=c.C+add+has(p,'acid')+has(p,'m_nobrain')+(inT?has(p,'tunnel'):0)+(rolled?has(p,'barbed')+(inT?has(p,'street'):0):0)+(act?tf.cheer||0:0);if(amt>0&&has(p,'w_anti'))amt*=2;
  if(amt>0){const H=act&&!G.bug?tf.hunt:null;targets=H&&P(H.t).alive&&H.t!==p.i?[P(H.t)]:has(p,'nova')?others(p):inT?others(p).filter(q=>!inCity(q.i)):others(p).filter(q=>inCity(q.i));
    dmg=amt+(act&&has(p,'c_devil')?1:0)+(act&&tf.mecha?2:0);kill=targets.some(q=>q.hp<=dmg&&!has(q,'c_zombie'))}
  const parts=[];if(vp)parts.push(`${vp} star${vp===1?'':'s'}`);if(en)parts.push(`${en} energy`);if(hl)parts.push(`heal ${hl}`);
  if(c.H&&!canHealDice(p))parts.push('hearts wasted');
  if(dmg&&targets.length)parts.push(`smash ${targets.map(mname).join(', ')} for ${dmg}${kill?' (a knockout!)':''}`);else if(c.C)parts.push('claws hit nobody');
  if(c.H>=3&&G.evoOn)parts.push('an evolution card');
  const val=vp*1.6+en*0.6+hl*(p.hp<=5?1:0.5)+dmg*targets.length*0.7+(kill?5:0)+(c.H>=3&&G.evoOn?2:0);
  return {vp,en,hl,dmg,kill,targets,val,c,text:parts.length?parts.join(', '):'nothing useful'}}
function cityThreat(p){return alive().filter(q=>q.i!==p.i&&!inCity(q.i)).length}
function aiYield(q,lost){
  if(q.hp<=0)return true;
  if(G.twist&&G.twist.id==='stubborn'&&q.i===G.bossSeat&&q.hp>=G.twist.param)return false;
  if(q.lvl==='easy')return q.hp<=5?Math.random()<.7:Math.random()<.15;
  if(q.lvl==='hard'&&!HYOLD){const pd=pDeath(q);if(q.vp+2+has(q,'street')>=winAt(q))return pd>PDW;if(has(q,'vjets')&&q.hp<=7)return true;return pd>PDY}
  if((q.lvl==='hard'||q.lvl==='hard0')){const th=alive().filter(r=>r.i!==q.i&&!inCity(r.i)).length*1.25;if(q.vp+2+has(q,'street')>=winAt(q)&&q.hp>th+.5)return false;if(has(q,'vjets')&&q.hp<=7)return true;return q.hp<th+HYB}
  const threat=cityThreat(q);
  if(q.vp>=18&&q.hp>Math.min(4,threat+1))return false;
  if(has(q,'vjets')&&q.hp<=7)return true;
  return q.hp<=Math.max(YA,threat+YB)}
var PDY=0.2,PDW=0.55,PCL=0.24,HYOLD=true;
// chance that q is knocked out before its next turn if it stays in the city
function pDeath(q){const A=alive().filter(r=>r.i!==q.i&&!inCity(r.i));let n=0,bonus=0;A.forEach(r=>{n+=6+has(r,'skull');bonus+=has(r,'barbed')+has(r,'acid')+(has(r,'nova')?0:0)});
  const hp=q.hp+(has(q,'plated')?.5:0)+(has(q,'wings')&&q.en>=2?3:0);const need=Math.ceil(hp-bonus*.6);if(need<=0)return 1;
  let pr=0,c=1,pk=Math.pow(1-PCL,n);for(let k=0;k<=n;k++){if(k>=need)pr+=pk;pk=pk*(n-k)/(k+1)*PCL/(1-PCL)}return Math.min(1,pr)}
function aiBrainjack(q,roller){if(q.mb<=0&&!has(q,'m_evade'))return false;
  if(q.lvl==='easy')return scoreDice(q,G.dice).val>10&&Math.random()<.5;
  if((q.lvl==='hard'||q.lvl==='hard0')){const mv=evalDice(q,G.dice),tv=evalDice(roller,G.dice);if(q.vp+scoreDice(q,G.dice).vp>=winAt(q))return true;if(tv>=35)return true;return mv+tv*.7>=(q.mb>1?7:9.5)-(G.turn>=6?1.5:0)}
  const mine=scoreDice(q,G.dice),theirs=scoreDice(roller,G.dice);
  if(q.vp+mine.vp>=20)return true;
  if(roller.vp+theirs.vp>=20&&theirs.vp>0)return true;
  if(theirs.kill&&theirs.targets.includes(q))return true;
  const thr=MBT-(q.mb>1?2:0)-(G.turn>=6?1.5:0);
  return mine.val+theirs.val*0.8>=thr}
function aiWantsClaws(p){
  if(has(p,'nova'))return true;
  if(inCity(p.i))return true;
  const occ=[G.city,G.bay].filter(i=>i>=0).map(P);
  if(!occ.length)return false;
  const c=counts().C;
  if(occ.some(o=>o.hp<=c+2))return true;
  return p.hp>=5}
function aiMark(p){
  const c=counts();const inT=inCity(p.i);const miss=maxhp(p)-p.hp;
  let hw=inT?0:(p.hp<=5?miss:p.hp<=7?Math.min(miss,3):Math.min(miss,1));
  if(G.evoOn&&p.edeck.length&&c.H>=2&&(inT||hw<3))hw=Math.max(hw,3);
  const claws=aiWantsClaws(p);
  const keepNum={};for(const f of ['1','2','3'])if(c[f]>=3)keepNum[f]=true;
  const pairs=['3','2','1'].filter(f=>c[f]===2&&!keepNum[f]);
  if(pairs.length&&!(pairs[0]==='1'&&!has(p,'gourmand')&&c.C+c.E>=3))keepNum[pairs[0]]=true;
  if(has(p,'omni')&&c['1']&&c['2']&&c['3']){keepNum['1']=keepNum['2']=keepNum['3']=true}
  const needVP=20-p.vp;let hk=0;
  if(exOn('tower')&&inT&&c['1']>=2)keepNum['1']=true;
  G.dice.forEach(d=>{let k=false;
    if(d.t==='b'){d.k=d.f!=='O';return}
    if(d.t==='f'){d.k=d.f==='FA'||d.f==='FW'||(d.f==='FE'&&curseBad(p));return}
    if(d.f in keepNum)k=true;
    else if(d.f==='E')k=!(hw>=3&&!inT);
    else if(d.f==='C')k=claws&&needVP>3||inT;
    else if(d.f==='H'){k=hk<hw;if(k)hk++}
    d.k=k})}
function curseBad(p){return exOn('curse')&&['k_ego','k_sand','k_hotep','k_set','k_build','k_ra','k_horus','k_false','k_sphinx','k_scribe','k_flood'].includes(G.curse)}
function aiMarkLvl(p){if(p.lvl==='hard'||p.lvl==='hard0'){const sp=G.dice.filter(d=>d.t);const nd=G.dice.length-sp.length;
    if(sp.length||nd>7){const all=G.dice;sp.forEach(d=>{d.k=d.t==='b'?d.f!=='O':(d.f==='FA'||d.f==='FW'||(d.f==='FE'&&curseBad(p)))});G.dice=all.filter(d=>!d.t);
      try{if(nd>7)aiMark(p);else if(p.lvl==='hard0'||nd>6)aiMarkHard0(p);else aiMarkHard(p)}finally{G.dice=all}return}}if(p.lvl==='hard0')aiMarkHard0(p);else if(p.lvl==='hard'&&!ANIM_FASTTEST)aiMarkHard(p);else{aiMark(p);if(p.lvl==='easy')G.dice.forEach(d=>{if(Math.random()<.3)d.k=!d.k})}}
var ANIM_FASTTEST=false, HYB=1.5, HEW=0.75;
function evalDice(p,dice){const s=scoreDice(p,dice);const c=countsOf(dice);const nc=countsOf(dice.filter(d=>!d.t));const inT=inCity(p.i);
  const need=winAt(p)-p.vp;const others=alive().filter(q=>q.i!==p.i);const lead=others.reduce((a,q)=>q.vp>a.vp?q:a,{vp:-1});
  let v=s.vp*(1.5+(p.vp>=12?0.9:0)+(need<=4?1.2:0));if(s.vp>0&&s.vp>=need)v+=60;
  // energy: worth more when it unlocks a strong card
  let ev=HEW;if(s.en){const bc=hardCardCost(p);if(bc&&p.en<bc&&p.en+s.en>=bc)ev+=0.45}
  v+=s.en*ev;
  v+=s.hl*(p.hp<=3?2:p.hp<=6?1:0.25);
  if(s.dmg&&s.targets.length){for(const q of s.targets){let w=0.8;if(q.vp>=15)w+=0.9;if(q===lead&&lead.vp>=12)w+=0.4;v+=s.dmg*w;
      if(q.hp<=s.dmg)v+=(others.length<=1?80:6)+q.vp*0.35+(q.vp>=16?12:0)}
    if(!inT){const occ=s.targets.filter(q=>inCity(q.i));const mayEnter=occ.some(q=>q.hp-s.dmg<=Math.max(YA,3));v+=mayEnter?(p.hp>=7?2:(p.hp<=4?-3.5:0)):0}}
  if(!inT&&G.city===-1)v+=p.hp>=6?0:(p.hp<=3?-1.5:0);
  if(c.H>=3&&G.evoOn&&p.edeck.length)v+=2.2;
  if(exOn('cult')&&Object.values(nc).some(x=>x>=4))v+=2.5;
  if(exOn('bers')&&!p.tok.berserk&&c.C>=4)v+=2;
  if(exOn('tower')&&inT&&nc['1']>=4)v+=G.tower.filter(o=>o===p.i).length>=2?90:7;
  if(exOn('wick')){if(c['1']>=3)v+=2.2;if(c['2']>=3)v+=1.1}
  const fd=dice.find(d=>d.t==='f');if(fd){if(fd.f==='FS')v-=2;if(fd.f==='FA')v+=2}
  v-=dice.filter(d=>d.f==='O').length*(p.hp<=2?20:1.2);
  return v}
let HC={k:null,c:0};
function hardCardCost(p){const key=p.i+':'+G.market.join()+':'+p.en;if(HC.k!==key){const b=G.market.map(id=>({c:costOf(p,id),v:cardValue(p,id)+costOf(p,id)})).filter(x=>x.v>=x.c+1).sort((a,b)=>a.c-b.c)[0];HC={k:key,c:b?b.c:0}}return HC.c}
// second-stage policy for the lookahead: what would we keep on the last reroll? (cheap one-step search)
function bestFinal(p,dice,S){const n=dice.length;let best=-1e9;
  for(let m=0;m<(1<<n);m++){const unk=[];for(let k=0;k<n;k++)if(!(m>>k&1))unk.push(k);
    if(!unk.length){const v=evalDice(p,dice);if(v>best)best=v;continue}
    if(unk.length>4&&m!==0)continue; // prune: keep at most the useful masks
    let tot=0;for(let t=0;t<S;t++){const d1=dice.map(d=>({f:d.f,t:d.t}));unk.forEach(k=>d1[k].f=faceOf(d1[k]));tot+=evalDice(p,d1)}
    const a=tot/S;if(a>best)best=a}
  return best}
function aiMarkHard(p){const dice=G.dice,n=dice.length,R=G.rolls,S=n>7?10:16;let best=-1e9,bm=(1<<n)-1;
  for(let m=0;m<(1<<n);m++){const unk=[];for(let k=0;k<n;k++)if(!(m>>k&1))unk.push(k);
    if(!unk.length){const v=evalDice(p,dice)+0.3;if(v>best){best=v;bm=m}continue}
    let tot=0;const S1=R>=2?6:S;
    for(let t=0;t<S1;t++){const d1=dice.map(d=>({f:d.f,t:d.t}));unk.forEach(k=>d1[k].f=faceOf(d1[k]));
      tot+=R>=2?bestFinal(p,d1,4):evalDice(p,d1)}
    const avg=tot/S1;if(avg>best){best=avg;bm=m}}
  dice.forEach((d,k)=>d.k=!!(bm>>k&1))}
function evalDice0(p,dice){const s=scoreDice(p,dice);const c=countsOf(dice);const nc=countsOf(dice.filter(d=>!d.t));const inT=inCity(p.i);
  const need=winAt(p)-p.vp;let v=s.vp*(1.5+(p.vp>=12?0.9:0));if(s.vp>0&&s.vp>=need)v+=40;
  v+=s.en*HEW;v+=s.hl*(p.hp<=3?1.8:p.hp<=6?0.9:0.25);
  if(s.dmg&&s.targets.length){v+=s.dmg*s.targets.length*0.8;for(const q of s.targets)if(q.hp<=s.dmg)v+=(alive().length<=2?60:6)+q.vp*0.2;
    if(!inT)v+=p.hp>=7?1.5:(p.hp<=4?-2.5:0)}
  if(c.H>=3&&G.evoOn&&p.edeck.length)v+=2.2;
  if(exOn('cult')&&Object.values(nc).some(x=>x>=4))v+=2.5;
  if(exOn('bers')&&!p.tok.berserk&&c.C>=4)v+=2;
  if(exOn('tower')&&inT&&nc['1']>=4)v+=6;
  if(exOn('wick')){if(c['1']>=3)v+=2.2;if(c['2']>=3)v+=1.1}
  const fd=dice.find(d=>d.t==='f');if(fd){if(fd.f==='FS')v-=2;if(fd.f==='FA')v+=2}
  v-=dice.filter(d=>d.f==='O').length*(p.hp<=2?20:1.2);
  return v}
function aiMarkHard0(p){const dice=G.dice,n=dice.length,R=G.rolls,S=n>7?12:20;let best=-1e9,bm=(1<<n)-1;
  for(let m=0;m<(1<<n);m++){const unk=[];for(let k=0;k<n;k++)if(!(m>>k&1))unk.push(k);
    if(!unk.length){const v=evalDice0(p,dice)+0.3;if(v>best){best=v;bm=m}continue}
    let tot=0;for(let t=0;t<S;t++){const d1=dice.map(d=>({f:d.f,t:d.t}));unk.forEach(k=>d1[k].f=faceOf(d1[k]));let v=evalDice0(p,d1);
      if(R>=2){const d2=dice.map(d=>({f:d.f,t:d.t}));unk.forEach(k=>d2[k].f=faceOf(d2[k]));v=Math.max(v,evalDice0(p,d2))}tot+=v}
    const avg=tot/S;if(avg>best){best=avg;bm=m}}
  dice.forEach((d,k)=>d.k=!!(bm>>k&1))}
function aiRollStep(p){
  if(!G.aiMarked){aiMarkLvl(p);G.dice.forEach(d=>{if(noReroll(d))d.k=true});G.aiMarked=true;refresh();return}
  G.aiMarked=false;
  const free=G.dice.filter(d=>!d.k&&!noReroll(d)).length;
  if(free&&G.rolls>0){doReroll('roll');return}
  if(free>=2&&p.cult>0&&!G.tf.uses.cr&&p.lvl!=='easy'){G.tf.uses.cr=1;useCult(p,'r');return}
  if(free>=2&&has(p,'smoke')&&p.tok.smoke>0){doReroll('smoke');return}
  if(free>=2&&has(p,'mind')&&p.en>=4){doReroll('mind');return}
  const c=counts();
  if(has(p,'lurker')&&c['3']>0&&c['3']<3&&(G.tf.uses.lurk||0)<3){G.tf.uses.lurk=(G.tf.uses.lurk||0)+1;const d=G.dice.find(d=>d.f==='3'&&!noReroll(d));if(d){d.f=faceOf(d);G.rollId++;cov('card:lurker');lg(p.i,`${mname(p)} lurks and rerolls a 3.`);refresh();return}}
  if(hasE(p,622)&&!onceUsed('genius')&&c.E>0&&c.E<3&&p.en>=5){doAct(p,'genius');return}
  if(aiTweak(p)){refresh();return}
  const k=aiRollEvo(p);if(k>=0){playEvo(p,k);return}
  resolve()}
/* single-die changes the computer can make before resolving; returns true when something changed */
function aiTweak(p){const c=counts();const U=G.tf.uses;
  const junk=()=>{let k=G.dice.findIndex(d=>!d.t&&!d.fz&&['1','2','3'].includes(d.f)&&c[d.f]===1);if(k<0&&!canHealDice(p))k=G.dice.findIndex(d=>!d.t&&!d.fz&&d.f==='H');return k};
  if(has(p,'pack')&&!U.pack&&c['1']===2){const k=junk();if(k>=0&&G.dice[k].f!=='1'){G.dice[k].f='1';U.pack=1;cov('card:pack');lg(p.i,`${mname(p)} turns a die into a 1 (Pack Hunter).`);return true}}
  if(hasE(p,58)&&!U.tsweep){for(const f of ['2','1'])if(c[f]===2){const k=junk();if(k>=0&&G.dice[k].f!==f){G.dice[k].f=f;U.tsweep=1;cov('evo:58');return true}}}
  for(const f of ['3','2']){if(c[f]===2){const k=junk();if(k<0||G.dice[k].f===f)continue;
    if(has(p,'rubber')&&p.en>=4){G.dice[k].f=f;p.en-=2;cov('card:rubber');lg(p.i,`${mname(p)} bends a die into a ${f} (Rubber Limbs).`);return true}
    if(has(p,'twist')&&f==='3'){G.dice[k].f=f;discardCard(p,'twist');cov('card:twist');lg(p.i,`${mname(p)} twists a die into a 3 (Twist Ending).`);return true}}}
  if(G.tf.alloy&&!U.alloy){const k=G.dice.findIndex(d=>d.f==='1'&&!d.fz&&c['1']<3);if(k>=0){const f=aiBestFace(p,k);if(f!=='1'){G.dice[k].f=f;U.alloy=1;cov('card:m_alloy');return true}}}
  if(has(p,'c_clown')&&!U.clownAI&&clownReady()){U.clownAI=1;G.tf.clown=true;cov('cost:clown');let best=null,bv=evalDice(p,G.dice);
    for(const f of FACES){const d1=G.dice.map(d=>({f:d.t||d.fz?d.f:f,t:d.t}));const v=evalDice(p,d1);if(v>bv+1){bv=v;best=f}}
    if(best){G.dice.forEach(d=>{if(!d.t&&!d.fz)d.f=best});lg(p.i,`${mname(p)} honks and turns all its dice into ${fname(best)}s.`)}return true}
  const s=scoreDice(p,G.dice);
  if(hasE(p,57)&&!U.gamma&&s.targets.length&&aiWantsClaws(p)){const k=junk();if(k>=0){G.dice[k].f='C';U.gamma=1;cov('evo:57');return true}}
  if(hasE(p,632)&&!U.devour&&p.en>=1&&!canHealDice(p)&&s.targets.length){const k=G.dice.findIndex(d=>d.f==='H'&&!d.fz&&!d.t);if(k>=0){G.dice[k].f='C';p.en--;U.devour=1;cov('evo:632');return true}}
  if(hasE(p,613)&&!U.sap&&p.en>=1&&!canHealDice(p)){const hs=G.dice.filter(d=>d.f==='H'&&!d.fz&&!d.t);if(hs.length>=2){G.dice=G.dice.filter(d=>d!==hs[0]&&d!==hs[1]);G.dice.push({f:'C',k:true,x:true});p.en--;U.sap=1;cov('evo:613');return true}}
  return false}
function aiRollEvo(p){const c=counts();const s=scoreDice(p,G.dice);
  for(let k=0;k<p.hand.length;k++){if(!evoUsable(p,k))continue;const e=p.hand[k];
    if(e===61&&s.dmg>=2&&s.targets.length)return k;
    if(e===617&&c.H===3)return k;
    if(e===618&&c.E===3&&G.market.length)return k;
    if(e===54&&!canHealDice(p)&&c.H>=2&&s.targets.length)return k}
  return -1}
function aiEvoToPlay(p){for(let k=0;k<p.hand.length;k++){if(!evoUsable(p,k))continue;const e=p.hand[k],E=EVO[e];
    if(E.w==='perm'||E.w==='city')return k;
    if(E.w!=='now')continue;
    if(e===23&&(G.tf.lost[p.i]||0)<2)continue;if(e===44&&maxhp(p)-p.hp<2)continue;if(e===62&&(G.tf.clawsRolled||0)<2)continue;if(e===621&&p.en<8)continue;
    if(e===52&&maxhp(p)-p.hp<1&&p.en>6)continue;
    return k}
  return -1}
function aiStep(){
  if(!G||G.winner||UI.choice||UI.busy)return;if(typeof NET!=='undefined'&&NET.on&&NET.role==='client')return;const p=cur();if(p.human)return;
  if(G.phase==='roll')aiRollStep(p);else if(G.phase==='buy')aiBuyStep(p)}
function schedule(){if(!G||G.winner||UI.choice||UI.busy||UI.info||UI.rules||UI.pending||UI.paused||((UI.intro||(UI.coach>=0&&UI.freeze))&&!(typeof NET!=='undefined'&&NET.on)))return;if(typeof NET!=='undefined'&&(NET.role==='client'&&NET.on))return;if(!['roll','buy'].includes(G.phase)||isHuman(G.active))return;
  UI.pending=true;setTimeout(()=>{UI.pending=false;aiStep()},ANIM?(G.phase==='roll'&&!G.aiMarked?AIDELAY*1.1:AIDELAY):0)}
function cardKeepValue(p,id){const C=CARDS[base(id)];return C.v!==undefined?C.v:3}
function cardValue(p,id){const b=base(id),C=CARDS[b],oth=others(p);
  const lead=Math.max(0,...oth.map(q=>q.vp));const late=p.vp>=12||lead>=14;const vpv=late?2.2:1.5;
  const hpv=h=>p.hp-h<=0?-99:(p.hp-h<=3?-2.5*h:-0.7*h);
  const cost=costOf(p,id);
  if(C.t==='D'){
    const vp={kiosk:1,train:2,tower:3,needle:4,refinery:2,reactor:2,jetsq:5,militia:2,tanks:4,cyclone:2,skydive:2}[b]||0;
    if(vp&&p.vp+vp>=winAt(p)&&!({jetsq:4,militia:2,tanks:3}[b]>=p.hp))return 99;
    let v=vp*vpv;
    if(b==='jetsq')v+=hpv(4);if(b==='militia')v+=hpv(2);if(b==='tanks')v+=hpv(3);if(b==='carpet')v=oth.filter(q=>q.hp<=3).length*6+oth.length*1.5+hpv(3);
    if(b==='flame')v=oth.length*1.3+oth.filter(q=>q.hp<=2).length*6;if(b==='refinery')v+=oth.length*1.8+oth.filter(q=>q.hp<=3).length*6;
    if(b==='patch')v=Math.min(2,maxhp(p)-p.hp)*1.2;if(b==='reactor')v+=Math.min(3,maxhp(p)-p.hp)*1.1;
    if(b==='sirens')v=oth.reduce((a,q)=>a+Math.min(5,q.vp),0)*0.6+(lead>=15?6:0);
    if(b==='surge')v=9;if(b==='cyclone')v+=oth.reduce((a,q)=>a+Math.floor(q.en/2),0)*0.5;
    if(b==='rush')v=G.bug?-9:7+(inCity(p.i)?2:0);if(b==='skydive')v+=inCity(p.i)?-1:(p.hp>=6?4:-2);
    if(b==='m_bug')v=4.5;if(b==='m_dysf'){const hit=alive().filter(q=>q.mb>0);v=hit.filter(q=>q.i!==p.i).length*1.8+hit.filter(q=>q.i!==p.i&&q.hp<=3).length*6+(p.mb>0?hpv(3):0)}
    if(b==='m_treas')v=G.disc.some(x=>CARDS[base(x)].t==='C')?2.5:-5;if(b==='m_mirac')v=p.hp<=3?6-p.vp*0.8:-9;
    return v-cost}
  if(C.t==='C'){const kv={Hunter:3.2,Sneaky:3,Poison:3,Tough:3.8,Frenzy:5.5};let cv=Math.max(...C.kws.map(w=>kv[w]));
    if(b==='m_bold'&&p.hp<=6)cv-=4;if(b==='m_gift')cv-=Math.min(5,p.vp)*0.4;if(b==='m_earm')cv+=1;if(b==='m_trap'||b==='m_legend')cv+=0.5;if(b==='m_strange')cv-=1;if(b==='m_scept')cv+=G.disc.some(x=>CARDS[base(x)].t==='C')?2:0;
    return cv+1-cost-(p.cards.filter(c=>CARDS[base(c)].t==='C').length>=3?2:0)}
  let v=C.v!==undefined?C.v:3;const early=G.turn<=4;
  if(['cosmic','news','kidfan','brain','skull','battery','cell','lab','opp','para'].includes(b))v+=early?1.5:-1;
  if(b==='carrion')v+=oth.length>=3?1.5:0;if(b==='street'||b==='tunnel')v+=inCity(p.i)?1:0;
  if(b==='growth'||b==='regrow'||b==='mend')v+=p.hp<=6?1.5:0;
  if(b==='egg')v+=p.hp<=5?2:0;if(b==='underdog')v+=p.vp<lead-3?1:0;
  if(b==='m_free'&&p.mb>0)v=-9;if(b==='m_evade')v+=oth.length*0.3;if(b==='m_nobrain')v-=p.mb*0.5;
  if(b==='mimic'){const t=mimicTargets(p);v=t.length?Math.max(...t.map(x=>cardKeepValue(p,x.id)))-1:0}
  if(late&&!['skull','brain','barbed','acid','nova','m_nobrain','c_astro'].includes(b))v-=2;
  if(has(p,b)&&!['skull'].includes(b))v-=3;
  return v-cost}
function aiBuyStep(p){const U=G.tf.uses;
  if(has(p,'mend')&&p.hp<=4&&p.en>=2&&p.hp<maxhp(p)){mend();return}
  if(G.tf.ances&&G.tf.ances[p.i]&&p.hp<=5&&p.en>=2&&p.hp<maxhp(p)){doAct(p,'ances');return}
  if(hasE(p,27)&&!U.mother&&p.en>=1&&p.hp<=6&&p.hp<maxhp(p)){doAct(p,'mother');return}
  const k=aiEvoToPlay(p);if(k>=0){playEvo(p,k);return}
  if(p.cult&&p.hp<=4&&p.lvl!=='easy'){useCult(p,'h');return}
  if(has(p,'lab')&&!U.lab&&G.deck.length){labPeek(p);return}
  if(hasE(p,12)&&!U.catch&&G.disc.length){luckyScoop(p);return}
  if(has(p,'para')&&!U.paraAI){U.paraAI=1;if(paraList(p).some(x=>cardValue(p,x.id)>1)){paraBuy(p);return}}
  let best=-1,bv=(p.lvl==='hard'||p.lvl==='hard0')?-0.2:-0.5;G.market.forEach((id,k)=>{if(!canBuy(p,k))return;const v=cardValue(p,id)+(p.lvl==='easy'?Math.random()*6-3:0);if(v>bv){bv=v;best=k}});
  if(best>=0){buy(best);return}
  const maxv=Math.max(-99,...G.market.map(id=>cardValue(p,id)));
  if(hasE(p,24)&&p.tok.adapt>0&&!U.adaptAI&&maxv<-1){U.adaptAI=1;doAct(p,'adapt');return}
  if(!G.aiSwept&&p.en>=8&&maxv<-2){G.aiSwept=true;sweep();return}
  endTurn()}
/* ---- small decisions ---- */
function aiEvoPick(p,two){return two.slice().sort((a,b)=>(EVOV[b]||(EVO[b].t==='T'?3:3))-(EVOV[a]||3))[0]}
function aiFreezeFace(o,p){const s=inCity(p.i)||inCity(o.i)?'C':'H';return p.vp>=14?'1':s}
function aiMimic(p,t,moving){const cur0=moving&&p.tok.mim?cardKeepValue(p,p.tok.mim.id):-9;const b=t.slice().sort((a,c)=>cardKeepValue(p,c.id)-cardKeepValue(p,a.id))[0];if(moving&&cardKeepValue(p,b.id)<cur0+2)return 'n';return b.o+':'+b.id}
function aiStartEvo(p,L){if(L.includes(64)&&!inCity(p.i)&&p.hp<=5)return 'e64';if(L.includes(34)&&p.lvl!=='easy'&&Math.random()<.35)return 'e34';return 'n'}
function aiExotic(p){return p.en>=5&&(inCity(p.i)||G.city>=0)&&p.hp>=5}
function aiKwStart(p,opts){const lead=mostOf('vp',others(p))[0];for(const o of opts){if(/:Hunter$/.test(o.k)&&lead&&(lead.hp<=4||lead.vp>=13))return o.k;if(/:Sneaky$/.test(o.k)&&Math.random()<.5)return o.k}return 'n'}
function aiHunt(p,src,id){const oth=others(p);if(src==='e'&&id===636){const m=oth.slice().sort((a,b)=>b.en-a.en)[0];return m.i}return oth.slice().sort((a,b)=>(a.hp-b.vp*0.3)-(b.hp-a.vp*0.3))[0].i}
function aiIceLock(r){if(!others(r).some(q=>has(q,'probe')||has(q,'c_witch')))return -1;const k=G.dice.findIndex(d=>d.f==='C'||d.f==='C2');return k}
function aiCheer(q,r){const s=scoreDice(r,G.dice);if(!s.targets.length||s.targets.includes(q))return false;const lead=mostOf('vp',others(q))[0];return !!lead&&s.targets.includes(lead)&&lead!==r}
/* the die of r whose reroll hurts r most (an index), or -1 */
function aiMeddle(q,r,claws){const base0=evalDice(r,G.dice);let best=-1,bd=claws?0.2:1.2;
  G.dice.forEach((d,k)=>{if(d.fz||d.t==='f')return;let tot=0;for(let f=0;f<6;f++){const d1=G.dice.map(x=>({f:x.f,t:x.t}));d1[k].f=FACES[f];tot+=evalDice(r,d1)}const drop=base0-tot/6+(claws&&(d.f==='C'||d.f==='C2')?1:0);if(drop>bd){bd=drop;best=k}});return best}
function aiPuppet(q,r){const s=scoreDice(r,G.dice);return s.vp+r.vp>=winAt(r)||s.targets.includes(q)&&s.dmg>=3||s.val>=11}
function aiStare(q,r){const s=scoreDice(r,G.dice);return s.targets.includes(q)&&(s.dmg>=3||s.dmg>=q.hp)}
function aiHearts(p,left,opts){const ks=opts.map(o=>o.k);if(ks.includes('shrink')&&p.hp>=5)return 'shrink';if(ks.includes('poison'))return 'poison';if(ks.includes('self')&&p.hp<maxhp(p))return 'self';
  const r=opts.find(o=>o.k[0]==='r'&&P(+o.k.slice(1)).en>=2);if(r)return r.k;return ks.includes('self')?'self':'done'}
function aiGrabCity(q){return q.hp>=7}
function aiHit(q,a,src,kind,o){const ks=o.map(x=>x.k);const lethal=a>=q.hp;
  const tough=ks.find(k=>k.startsWith('t:'));const poison=ks.find(k=>k.startsWith('p:'));
  if(tough&&(lethal||a>=3))return tough;
  if(ks.includes('tail')&&(lethal||a>=4))return 'tail';if(ks.includes('scurry')&&(lethal||a>=4))return 'scurry';
  if(ks.includes('wings')&&(lethal||(a>=3&&q.en>=6)))return 'wings';
  if(poison&&a>=2&&src&&src.alive)return poison;
  if(ks.includes('robot')&&(lethal||q.en>=a+6))return 'robot';
  if(tough&&a>=2)return tough;
  return 'take'}
function aiFood(src,q,a){return q.hp>a+1&&q.vp>0}
function aiBestFace(p,k){let best='C',bv=-1e9;for(const f of FACES){const d1=G.dice.map(x=>({f:x.f,t:x.t}));if(k!==undefined&&k>=0)d1[k].f=f;else d1.push({f});const v=evalDice(p,d1);if(v>bv){bv=v;best=f}}return best}
function aiWorstDie(p){let w=-1,wv=1e9;G.dice.forEach((d,k)=>{if(d.t==='f'||d.fz)return;const d1=G.dice.filter((x,j)=>j!==k);const v=evalDice(p,d1);if(-v<wv){wv=-v;w=k}});return w}
function aiShiftFrom(p){const c=counts();return !canHealDice(p)&&c.H?'H':Object.keys(c).filter(f=>c[f]>0).sort((a,b)=>c[a]-c[b])[0]}
function aiShiftTo(p,from){let best='C',bv=-1e9;for(const f of FACES){if(f===from)continue;const d1=G.dice.map(x=>({f:x.f===from&&!x.t?f:x.f,t:x.t}));const v=evalDice(p,d1);if(v>bv){bv=v;best=f}}return best}
function aiFrenzy(p,L){const c=L[0];const b=c.src==='c'?base(c.id):c.id;if(b==='m_bold'&&p.hp<=7)return 'n';if(b===638&&p.hp<=4)return 'n';return c.src+':'+c.id}
function aiMeta(p,L){const w=L.filter(c=>base(c)!=='meta').sort((a,b)=>cardKeepValue(p,a)-cardKeepValue(p,b))[0];if(w&&cardKeepValue(p,w)<=2&&CARDS[base(w)].c>=3)return w;return 'n'}
