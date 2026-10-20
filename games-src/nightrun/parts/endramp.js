/* ---------- ENDRAMP: endless mode climbs in difficulty (flag RET.endramp, default ON; ?endramp=0 = the old fixed difficulty). Test: nightrun/endramp-test.js.
   Owner 20 Oct 2026: "endless should gradually increase difficulty, even if normal it should go to legend, else the game is very easy for an experienced player; more tactics and patterns so enemies are never predictable."
   A WAVE is one director phase (8 bars, DIR.pickTheme). Plain endless only: never story, daily, weekly, the tutorial or the Lab.
   DIFFICULTY  The selected difficulty is the start. Every wave the per-difficulty knobs (DF: d, bs, fr, dn, fan, heal, el, aq) move a step toward Legend (hull drops, heal, stay as chosen: sustain is not part of the ramp) along a curve that starts gently (progress^2); Normal reaches Legend at wave 31 (Easy 43, Hard 15,
               Very hard 8). The difficulty key the other systems read (SET.diff: boss movesets, telegraph times, zoo counts, hazards) steps up the same ladder over the last 45% of the climb (the oracle dodger cannot live through those systems earlier, bot numbers in endramp-test), so bosses follow. After Legend the knobs keep rising
               slowly for 30 more waves up to a ceiling (d +22%, fire +15%, density +15%, bullet speed +6%, elites +15%, one more bullet in fans). armour.js hull / caps and hard.js DPS ceiling are untouched.
               The player's chosen difficulty is restored at the end of the run (and on page hide, so a mid-run settings save never keeps the stepped key).
   VERBS       From wave 2 each wave has a signature verb (flankers, rain, pincer, mines, swarm ring, convoy ...) chosen from a seeded bag (GR), fired on bar 5 of the wave (and bar 2 from wave 12); patterns the last two waves used are
               left out of the pool (widened to every unlocked pattern when the theme pool is too small); the tier floor unlocks the rarer formations by wave; the rules.js mechanic changes every 3 waves; the
               novelty clock (twists, epochs) never trails the wave count. No three consecutive waves share a pattern set. ---------- */
if(RET.endramp===undefined)RET.endramp=!/[?&]endramp=0/.test(location.search);
const ENDR=window.ENDR={KEYS:['easy','normal','hard','vhard','legend'],L:{easy:42,normal:30,hard:14,vhard:7,legend:0},X:30,P:2,KL:.55,HK:0,CE:{d:.22,fr:.15,dn:.15,bs:.06,el:.15},
  o:{cap:4,diff:1,tier:1,sig:1,pool:1,rules:1,nov:1},w:0,real:'normal',eff:'',bi:0,act:false,firing:0,sig:null,sets:[],sigs:[],stat:{waves:0,sig:0,keys:[]},
  on(){return!!RET.endramp&&this.act&&running&&!ST.on&&!G.tut&&!G.lab&&!G.daily&&!G.weekly;},
  /* pure: the knobs and key for a base key at wave w */
  at(key,w){const B=DIFFS[key]||DIFFS.normal,Lg=DIFFS.legend,L=this.L[key]==null?28:this.L[key],k=L<=0?1:Math.pow(clamp((w-1)/L,0,1),this.P),e=clamp((w-L-1)/this.X,0,1),o={};
    for(const f in Lg){if(typeof Lg[f]!=='number')continue;const a=B[f]||0;o[f]=a+(Lg[f]-a)*k*(f==='heal'?this.HK:1);}
    if(!B.el&&k<.3)o.el=0;                                   // el decides laser cadence and elite hull: it switches on at 30% of the climb, not at wave 1
    for(const f in this.CE)o[f]*=1+this.CE[f]*e;
    o.fan=Math.round(o.fan+e);o.aq=Math.round(o.aq);
    const i0=this.KEYS.indexOf(key),ti=i0+clamp((k-this.KL)/(1-this.KL),0,1)*(4-i0);   // the key (hard-only systems: walls, strikes, boss tier) lags the knobs: it steps up over the last 45% of the climb
    return{k,e,key:this.KEYS[Math.min(this.o.cap,i0>this.o.cap?i0:4,Math.floor(ti+1e-9))],knobs:o};},
  tier(w){return Math.min(2.2,.1+.08*w);},                   // the formation tier floor: rarer patterns unlock by wave (DIR.tierv never goes below it)
  apply(){const r=this.at(this.real,this.w);if(this.o.diff){DF=r.knobs;SET.diff=r.key;HARD=HARDS.includes(r.key);}else r.key=this.real;this.eff=r.key;return r;},
  restore(){if(!this.eff)return;SET.diff=this.real;DF=DIFFS[this.real]||DIFFS.normal;HARD=HARDS.includes(this.real);this.eff='';},
  nextWave(){if(this.eff&&SET.diff!==this.eff&&DIFFS[SET.diff])this.real=SET.diff;                      // the player changed it in the pause menu: that is the new start
    this.w++;this.bi=0;this.stat.waves=this.w;this.sets[this.w]=new Set();const r=this.apply();if(this.stat.keys[this.stat.keys.length-1]!==r.key)this.stat.keys.push(r.key);
    if(this.o.nov&&window.NOV&&NOV.T<this.w*50)NOV.T=this.w*50;
    this.sig=this.w>=2&&this.o.sig?this.pickSig():null;
    if(this.sig&&this.sig.fresh&&G.live&&!G.boss)G.note={t:3.2,txt:'New: '+this.sig.nm};},
  SIG:[{id:'flankPair',nm:'flank pair',t:.4},{id:'snake',nm:'snake line',t:.2},{id:'turretLine',nm:'turret line',t:.6},{id:'swarm',nm:'swarm',t:.8},{id:'phalanx',nm:'phalanx',t:1},{id:'wedge',nm:'wedge',t:1},
    {id:'mines',nm:'mine field',t:1.2},{id:'pincer',nm:'pincer',t:1.4},{id:'pillars',nm:'pillars',t:1.5},{id:'swarmRing',nm:'swarm ring',t:1.6},{id:'eliteV',nm:'elite V',t:1.8},{id:'convoy',nm:'convoy',t:2.2},
    {id:'rain',nm:'hail curtain',t:.5,run:()=>DIR.rain(3+Math.min(2,ENDR.w>>3))},{id:'flank',nm:'edge flankers',t:.3,run:()=>DIR.flank(2+(ENDR.w>12?1:0),ENDR.w%2===0)}],
  pickSig(){const t=this.tier(this.w)+.01,a=this.sets[this.w-1]||new Set(),b=this.sets[this.w-2]||new Set(),rc=this.sigs.slice(-2);
    let c=this.SIG.filter(s=>s.t<=t&&!a.has(s.id)&&!b.has(s.id)&&!rc.includes(s.id));
    if(!c.length)c=this.SIG.filter(s=>s.t<=t&&!a.has(s.id)&&!rc.includes(s.id));
    if(!c.length)c=this.SIG.filter(s=>s.t<=t);
    const s=c[Math.floor(GR()*c.length)],first=!this.sigs.includes(s.id);this.sigs.push(s.id);return Object.assign({fresh:first},s);},
  fire(){const s=this.sig;if(!s||G.boss||G.dead)return;this.stat.sig++;
    if(s.run)s.run();else if(PATS[s.id])PATS[s.id].f();else return;
    this.mark(s.id);NR.emit('pattern',{id:s.id});},
  mark(id){const S=this.sets[this.w];if(S)S.add(id);}};
NR.on('runStart',d=>{const E=ENDR;E.restore();E.w=0;E.bi=0;E.sets=[];E.sigs=[];E.sig=null;E.stat={waves:0,sig:0,keys:[]};
  E.act=!!RET.endramp&&!(d&&(d.daily||d.story||d.lab||d.tut||d.resume));E.real=DIFFS[SET.diff]?SET.diff:'normal';});
NR.on('runEnd',()=>{ENDR.restore();ENDR.act=false;});
NR.on('pattern',d=>{if(ENDR.on()&&d&&d.id&&ENDR.w>0)ENDR.mark(d.id);});
window.addEventListener('pagehide',()=>{if(ENDR.eff){ENDR.restore();try{saveSet();}catch(e){}}});
{const pt=DIR.pickTheme;DIR.pickTheme=function(bar){pt.call(this,bar);if(ENDR.on())ENDR.nextWave();};}
{const bl=DIR.barLine;DIR.barLine=function(i){bl.call(this,i);if(ENDR.on()&&ENDR.w>0&&!G.boss){ENDR.bi++;if(ENDR.bi===5||(ENDR.bi===2&&ENDR.w>=12))ENDR.fire();}};}
{const tv=DIR.tierv;DIR.tierv=function(){const t=tv.call(this);return ENDR.on()&&ENDR.o.tier?Math.max(t,ENDR.tier(ENDR.w)):t;};}
{const po=DIR.pool;DIR.pool=function(){const base=po.call(this);if(!ENDR.on()||ENDR.w<2||!ENDR.o.pool)return base;
  const a=ENDR.sets[ENDR.w-1]||new Set(),b=ENDR.sets[ENDR.w-2]||new Set();
  let c=base.filter(p=>!a.has(p.id)&&!b.has(p.id));if(c.length>=2)return c;
  const t=this.tierv()+.01;c=Object.keys(PATS).map(k=>PATS[k]).filter(p=>p.t<=t&&!a.has(p.id)&&!b.has(p.id));if(c.length>=2)return c;
  c=base.filter(p=>!a.has(p.id));return c.length?c:base;};}
{const ri=RU.idx;RU.idx=function(){const n=ri.call(this);return ENDR.on()&&ENDR.o.rules?Math.max(n,2+Math.floor(ENDR.w/3)):n;};}
