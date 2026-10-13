/* ---------- build paths, synergies, set bonuses, heat load and boss counters: the data tables and pure helpers (the runtime is in strategy.js) ---------- */
const PATHS={gc:{n:'Glass Cannon',s:'Hit hard, break fast',c:'#ff5a3d',ic:'M13 2L4 14h6l-1 8 9-12h-6z'},
  tk:{n:'Tank',s:'Outlast every shot',c:'#19e3ff',ic:'M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5z'},
  bc:{n:'Beat Combo',s:'Live on the beat',c:'#ffe14d',ic:'M2 12l5-5v3h10V7l5 5-5 5v-3H7v3z'}};
const PATHOF={fr:'gc',dm:'gc',cr:'gc',sb:'gc',pc:'gc',cl:'gc',sc:'gc',rg:'gc',rc:'gc',og:'gc',dr:'gc',hm:'gc',
  sh:'tk',hl:'tk',mh:'tk',rv:'tk',as:'tk',wn:'tk',lk:'tk',cool:'tk',rgn:'tk',hsk:'tk',
  wd:'bc',ck:'bc',bt:'bc',db:'bc',dc:'bc',bd:'bc',sm:'bc',bea:'bc',lp:'bc'};
const ALIAS={dmg:'dm',rof:'fr',crt:'cr',prc:'pc',sdc:'sc',drn:'dr',shd:'sh',hul:'mh',rev:'rv',ckp:'ck',dsh:'dc',tdl:'bt',mag:'mg',pwd:'lp',nmn:'nx',nint:'ni'};
const canon=id=>{const d=typeof TP_BY!=='undefined'&&TP_BY[id];return d&&d.uid?d.uid:ALIAS[id]||id;};
const pathOf=id=>PATHOF[canon(id)]||null;
const pathChip=p=>p?`<i class="pc" style="--c:${PATHS[p].c}" title="${PATHS[p].n}">${svgI(PATHS[p].ic)}</i>`:'';
const SYNS=[{id:'oc',n:'Overclock',a:'dm',b:'fr',t:'+8% shot damage',fx:{dmg:.08}},
  {id:'bw',n:'Bulwark',a:'sh',b:'mh',t:'Shield pop: 0.8 s extra safe',fx:{inv:.8}},
  {id:'mt',n:'Metronome',a:'wd',b:'ck',t:'Tier lasts 2 beats more',fx:{ck:2}},
  {id:'sl',n:'Slingshot',a:'dc',b:'db',t:'Dash Blast hits 50% harder',fx:{db:.5}},
  {id:'gr',n:'Gold Rush',a:'sb',b:'wd',t:'Gold pulses +15% harder',fx:{sharp:.15}},
  {id:'cc',n:'Cash Cow',a:'nx',b:'mg',t:'+15% Neon from kills',fx:{nx:.15}},
  {id:'cs',n:'Crit Storm',a:'cr',b:'pc',t:'+5% crit chance',fx:{crit:.05}},
  {id:'cb',n:'Cold Barrel',a:'cool',b:'fr',t:'Rapid Fire adds no heat',fx:{fr0:1}}];
const SETS={gc:[{n:2,t:'+8% damage',fx:{dmg:.08}},{n:4,t:'+7% damage, +15% heat',fx:{dmg:.07,heat:.15}}],
  tk:[{n:2,t:'Shield pop: 0.4 s extra safe',fx:{inv:.4}},{n:4,t:'+1 hull, -5% damage',fx:{hull:1,dmg:-.05}}],
  bc:[{n:2,t:'On-beat window +8 ms',fx:{win:8}},{n:4,t:'Tier +3 beats, off-beat -15%',fx:{ck:3,off:.15}}]};
const HEATL={fr:.05,dm:.04,sc:.08,rg:.05,pc:.03,cl:.03,rc:.04,og:.1,dr:.03,sb:.03};          // extra heat per shot, per level
const NOSELL=new Set(['sh','dc','hl','mh','rv','wn','ec','as']);                              // instant or one-shot upgrades cannot be sold back
const PIT_SLOTS=6;                                                                              // different pit-stop upgrades in one run (more in the later story stages)
/* what an upgrade is good against (the same four words are used for the bosses below) */
const UT={bt:'dodge',db:'dodge',dc:'dodge',sc:'spread',rg:'spread',cl:'spread',rc:'spread',bd:'spread',dr:'spread',sh:'guard',hl:'guard',mh:'guard',rv:'guard',as:'guard',wn:'guard',
  fr:'dps',dm:'dps',cr:'dps',sb:'dps',pc:'dps',og:'dps',cool:'dps'};
const CT={dodge:{n:'Dash',w:'lasers'},spread:{n:'Spread',w:'minions'},guard:{n:'Guard',w:'bullet walls'},dps:{n:'Damage',w:'a long fight'}};
const BPATS=k=>[['fan5','summon','fan7','ring'],['spiral','ring','fan5','spiral','summon'],['laser','ring','laser','fan7','spiral'],['spiral','laser','ring','fan9','summon','laser','fan7']][k]||(typeof ATAB!=='undefined'&&ATAB[k])||[];
/* a foe's counters, read from its pattern list: lasers -> dash, summons -> spread, rings / spirals / wide fans -> guard, always some damage */
function foeOf(s){if(!s)return null;const g=s.goal.k;if(g!=='boss'&&g!=='mini')return null;const pats=g==='mini'?s.mini.pats:BPATS(DISTRICTS[s.di].boss),nm=g==='mini'?s.mini.nm:DISTRICTS[s.di].bossName,tags=[];
  if(pats.includes('laser'))tags.push('dodge');if(pats.includes('summon'))tags.push('spread');if(pats.some(p=>/^(ring|spiral|fan9|fan7)$/.test(p)))tags.push('guard');tags.push('dps');
  return{nm,tags,pats,mini:g==='mini'};}
function nextFoeFrom(n){for(let i=Math.max(1,n);i<=MAIN;i++){const f=foeOf(STAGES[i-1]);if(f)return f;}return null;}
const foeTip=f=>{if(!f)return '';const t=f.tags.filter(x=>x!=='dps').slice(0,2).map(x=>CT[x].n);const w=f.tags.filter(x=>x!=='dps').slice(0,2).map(x=>CT[x].w);
  return w.length?'Fires '+w.join(' and ')+'. Bring '+t.join(' + ')+'.':'A long fight. Bring Damage.';};
const stageTip=s=>{const f=foeOf(s);return f?foeTip(f):'';};

