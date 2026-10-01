// ---------- computer castaways: choices, camp moves and the day's plan ----------
// rough worth of an op list for the team (positive = good)
function opsValue(list){let v=0;const np=Math.max(1,living().length);for(const op of list||[]){const [k,a,b]=op;switch(k){
  case 'res':v+=(a==='wood'?1:a==='fur'?1:a==='pfood'?1.5:1.2)*b;break;case 'resPer':v+=np;break;case 'lose':v-=1.2*b;break;case 'loseAllRes':v-=G.res.food+G.res.wood+G.res.fur;break;
  case 'wound':v-=3*b*(a==='all'?np:1);break;case 'det':v+=.5*(b||0)*(a==='all'?np:1);break;case 'ldet':v-=.7*b*(a==='all'?np:1);break;case 'ldetAll':v-=2;break;
  case 'heal':v+=1.5*b;break;case 'morale':v+=2*a;break;case 'roof':case 'pal':case 'weapon':v+=2*a;break;case 'roofOrPal':v+=2*a;break;case 'halfRoofOrPal':v-=Math.max(1,G.camp.roof/2);break;
  case 'wx':v-=2.5;break;case 'actTok':v-=1;break;case 'beastStr':v-=1;break;case 'nightFood':v-=2*np;break;case 'nightWound':v-=3*np;break;case 'prod':v-=2;break;
  case 'discardInv':v-=.4*a;break;case 'drawInv':case 'pickInv':v+=1;break;case 'loseItem':v-=4;break;case 'buildFree':v+=4;break;case 'mystery':v+=.5;break;case 'disc':v+=1.2*a;break;
  case 'fight':v-=3*Math.max(0,(a.str||0)-G.weapon)-(a.wl||0)*2-(a.pal||0)*2-(living().length>1?0:1);v+=(a.food||0)+(a.fur||0);break;
  case 'exhaustClosest':case 'exhaustAdj':case 'exhaustTileAdj':case 'coverTerr':v-=2;break;case 'inaccessAdj':v-=4;break;case 'moveCamp':v-=4;break;case 'flushThreats':v-=5;break;
  case 'spWound':v-=2.5;break;case 'keep':v+=2;break;case 'keepPawn':v+=3;break;case 'passFirst':break;case 'pick':v+=Math.max(...a.map(opsValue));break;
  case 'ifItem':v+=opsValue(has(a)?b:op[3]);break;case 'ifWeapon':v+=opsValue(G.weapon>=a?b:op[3]);break;case 'pileWood':v+=1.5*a;break;case 'unfog':v+=2*a;break;
  default:v-=.3}}return v}
function aiChoose(title,opts,c,extra){const kind=extra&&extra.kind;const val=o=>(o.ops?opsValue(o.ops):0);
  const best=f=>{let bi=0,bv=-1e9;opts.forEach((o,i)=>{const v=f(o,i);if(v>bv){bv=v;bi=i}});return bi};
  switch(kind){
  case 'roofpal':{if(extra.sign>0)return best(o=>/Roof/.test(o.l)?(G.camp.roof<=G.camp.pal?2:1):1.5);return best(o=>/oof/.test(o.l)?G.camp.roof-(weatherAhead()?1.5:0):G.camp.pal)}
  case 'inv':return best(o=>{const k=(o.frames&&o.frames[0]&&o.frames[0].key);return invValue(k)});
  case 'loseitem':return best(o=>-invValue(o.frames[0].key));
  case 'exh':return best((o,i)=>o.frames&&o.frames[0]&&o.frames[0].p!=null?dist(G.camp.pos,o.frames[0].p)+(/wood/.test(o.l)?.5:0):i);
  case 'tile':return best(o=>{const p=o.frames[0].p;return dist(G.camp.pos,p)*2-(tileAt(p)?tileAt(p).src.length:0)});
  case 'fog':return best(o=>-fogHarm(o.pos));
  case 'move':return best(o=>{if(!o.frames.length)return 0;const p=o.frames[0].p;const t=tileAt(p);return (t.shelter?3:0)+t.src.length-(G.camp.shelter?2:0)});
  case 'boost':{const f=G.stk.length;const m=/strength (\d+) with weapon (\d+)(?: \+(\d+))?/.exec(title);const short=m?(+m[1])-(+m[2])-(+(m[3]||0)):0;const who=c;const danger=who&&(CHARS[who.k].die-who.w)<=short+2;
    if(short>=2||danger){const i=opts.findIndex(o=>/Pistol|Musket|Blade|Old Pistol/.test(o.l));if(i>=0)return i;const r=opts.findIndex(o=>/Rage/.test(o.l));if(r>=0&&short>=3)return r;const w=opts.findIndex(o=>/wound/.test(o.l));if(w>=0&&short>=3&&!danger)return w}return opts.length-1}
  case 'dice':{const d=extra.dice;const who=c;let bi=0;opts.forEach((o,i)=>{if(!i)return;if(/success die/.test(o.l)&&!d.s)bi=i;else if(/wound die/.test(o.l)&&d.w&&who&&(CHARS[who.k].die-who.w)<=3&&bi===0)bi=i});return bi}
  case 'adv':{const o0=opsValue(opts[0].ops),o1=opsValue(opts[1].ops)-2;return o1>o0?1:0}
  case 'morale':return c&&c.w>2?1:0;
  case 'camp':return G.morale<1?1:0;
  case 'weather':return opts.length-1;
  case 'nheal':{const hurt=living().filter(x=>x.w>0);if(!hurt.length)return 0;const i=opts.findIndex(o=>/Rum|Cask|Brandy|vegetables|Fireplace|Pot/.test(o.l)&&!(/Pot|Fireplace/.test(o.l)&&G.res.food<1&&!has('cellar')&&G.res.pfood<2));return i>=0?i:(opts.findIndex(o=>/Remedy/.test(o.l)&&hurt.some(x=>CHARS[x.k].die-x.w<=4))>=0?opts.findIndex(o=>/Remedy/.test(o.l)):0)}
  case 'starve':return 0;
  case 'heal':return 0;case 'disc':return best(o=>discValue(o.frames[0].k1));
  case 'tiles':return best(o=>{const n=o.frames[0].n;const t=TILES.find(x=>x.no===n);return (explored().has(t.terr)?0:3)+t.src.length+(t.shelter?1:0)});
  case 'track':{const k=extra.beast;return BEAST[k].str>G.weapon+1?1:0}
  case 'fortify':return hasShelter()&&G.camp.pal<G.weapon?0:opts.length-1;
  case 'reclaim':return 0;
  default:return best(val)}}
function weatherAhead(){const S=SCENARIOS[G.scen];for(let r=G.round;r<=Math.min(G.rounds,G.round+2);r++)if((S.wx[r]||[]).length)return true;return false}
// how many clouds the roof should hold in the next rounds
function cloudsAhead(){const S=SCENARIOS[G.scen];let m=0;for(let r=G.round;r<=Math.min(G.rounds,G.round+3);r++){const d=S.wx[r]||[];let c=0;if(d.includes('rain'))c+=1.5;if(d.includes('snow'))c+=1.7;m=Math.max(m,c)}return m+G.wx.rain+G.wx.snow}
const INV_BASE={fire:5,knife:7,rope:7,shovel:5,pot:5,medicine:3,map:3,bricks:4,dam:4,snare:9,fireplace:4,shortcut:6,spear:5,basket:5,sack:5,bed:2,belts:3,bow:4,cellar:3,corral:5,diary:3,drums:4,furnace:2,lantern:3,moat:3,pit:3,raft:3,shield:2,sling:3,wall:3,
  hatchet:5,mast:8,cross:10,bell:3,jraft:13,lifeboat:22,fence:3,garden:4};
function invValue(k){if(!k)return 0;let v=INV_BASE[k]||2;const I=invReq(k)||{};
  // enablers: worth more when other boards cards need them
  for(const b of G.inv.board.concat(Object.keys(SCENARIOS[G.scen].invs||{}))){const J=invReq(b);if(J&&(J.it||[]).includes(k)&&!has(b))v+=b==='jraft'||b==='lifeboat'||b==='mast'?4:1.2}
  if(G.scen==='marooned'&&k==='fire')v+=G.round>=5?10:5;if(G.scen==='settlers'&&G.sc.goals&&G.sc.goals.includes(k))v+=6;if(k==='furnace'&&!Object.values(SCENARIOS[G.scen].wx).some(d=>d.includes('snow')))v=0;
  if(k==='bell')v+=G.map.filter(m=>m.fog).length*1.5;if(['bricks','fire','wall','moat','fence'].includes(k)&&!hasShelter())v-=1;
  if(G.round>G.rounds-2&&!['cross','lifeboat','jraft','mast','fire'].includes(k)&&!(G.scen==='settlers'&&G.sc.goals&&G.sc.goals.includes(k)))v*=.4;return v}
function aiMoveCamp(){const m=G.map[G.camp.pos];const t=campTile();if(!t)return null;const bad=m.fog||t.src.every((s,i)=>m.exh[i]);if(!bad||G.camp.shelter)return null;
  let best=null,bv=0;for(const p of MAP[G.camp.pos].adj){const u=tileAt(p);if(!u||G.map[p].fog)continue;const v=u.src.filter((s,i)=>!G.map[p].exh[i]).length+(u.shelter?2:0);if(v>bv){bv=v;best=p}}return best}
// ---------- the planner ----------
var AIW=Object.assign({wp:2.2,ap:1.4,stop:.9,food:6,wood:2,camp:1.2,roof:8,hunt:4,expl:3.5},typeof AIWX!=='undefined'?AIWX:{});
const PSUCC={build:4/6,gather:5/6,explore:5/6},PWOUND={build:4/6,gather:1/6,explore:3/6},PADV={build:3/6,gather:3/6,explore:5/6};
function eatersNeed(){const n=living().filter(c=>!c.out).length;return n*(1+G.night.food)+((G.sc&&G.sc.kids)||0)}
function aiCandidates(st){const o=[];const ex=explored();const np=living().length;const r=G.round;
  const add=(type,tgt,v,extra)=>{if(v<=0.2)return;if(!MULTI.includes(type)&&findAct(type,tgt))return;const why=targetWhy(type,tgt,extra&&extra.alt||0,extra&&extra.forC);if(why)return;o.push(Object.assign({type,tgt,v},extra||{}))};
  // threats
  G.ev.threat.forEach((k,i)=>{if(!k)return;const th=CARD[k].th;const harm=-opsValue(CARD[k].te);const rw=opsValue(th.rw||th.rw2||th.rw1||[]);const r0=th.req||{};const alts=r0.alt?r0.alt.length:1;
    for(let al=0;al<alts;al++)add('threat',i,(i===0?harm+1:harm*.35)+rw*.8+(k==='crates'?2:0),{alt:al})});
  // camp buildings
  const cl=cloudsAhead();
  if(!hasShelter())add('build',{k:'shelter'},r<=2?9:12);
  else{if(G.camp.roof<Math.ceil(cl))add('build',{k:'roof'},weatherAhead()?AIW.roof-G.camp.roof:4);else add('build',{k:'roof'},1.2);
    add('build',{k:'pal'},G.camp.pal<1?3:G.camp.pal<2?2:1)}
  add('build',{k:'weapon'},G.weapon<2?4:G.weapon<4?2.2:1);
  for(const k of new Set(G.inv.board.concat(Object.keys(SCENARIOS[G.scen].invs||{})).concat(Object.keys(INVENTIONS).filter(x=>INVENTIONS[x].kind==='personal')))){if(has(k)&&!(invReq(k)||{}).multi)continue;if(k==='cross')continue;
    const own=INVENTIONS[k]&&INVENTIONS[k].kind==='personal'?G.chars.find(c=>c.k===INVENTIONS[k].owner&&!c.dead):null;if(INVENTIONS[k]&&INVENTIONS[k].kind==='personal'&&!own)continue;add('build',{k},invValue(k),{forC:own||undefined,owner:own?own.i:null})}
  if(G.scen==='hexed'){for(const m of G.map){if(tileAt(m.id)&&!G.sc.crosses.includes(m.id))add('build',{k:'cross',cross:m.id},10-(m.fog?2:0)+(G.round>6?4:0))}}
  // gathering
  const rainNow=(SCENARIOS[G.scen].wx[G.round]||[]).filter(d=>d!=='animals').length*1.5+G.wx.rain+G.wx.snow;const soak=Math.max(0,Math.round(rainNow)-G.camp.roof);
  const fneed=Math.max(0,eatersNeed()+soak-st.food);
  const wdef=(hasShelter()?0:2)+Math.max(0,Math.ceil(cl)-G.camp.roof)*2+soak+((SCENARIOS[G.scen].wx[G.round]||[]).includes('snow')?2:0)+(G.scen==='marooned'&&G.sc.pile<15?2:0)+(G.scen==='hexed'?2:0)-st.wood;
  for(const m of G.map){const t=tileAt(m.id);if(!t||m.id===G.camp.pos)continue;for(const s of srcs(m.id)){if(s.ex)continue;const d=dist(G.camp.pos,m.id);const pen=d>=2?1.5:0;
    if(s.s==='wood')add('gather',{pos:m.id,i:s.i},AIW.wood+Math.max(0,Math.min(4,wdef))*.9-pen*.5);
    else add('gather',{pos:m.id,i:s.i},(fneed>0?AIW.food+2*fneed:has('cellar')?1.5:.6)-pen*.5)}}
  // arranging the camp lifts morale (and every point of morale is determination each round)
  const campN=G.plan.acts.filter(a=>a.type==='camp').length;
  if(actNeed({type:'camp'}).need===1)add('camp',null,AIW.camp+Math.max(0,1-G.morale-campN)*1.6+(living().some(c=>c.det<2)&&!campN?1:0));
  for(const c of living())if(!c.npc&&c.w>=CHARS[c.k].die*.4&&!G.plan.acts.some(a=>a.type==='rest'&&a.pw.some(p=>pawnInfo(p)&&pawnInfo(p).c===c.i)))add('rest',null,1.5+c.w/CHARS[c.k].die*6,{owner:c.i})
  // exploring
  const need=new Set();for(const k of G.inv.board.concat(Object.keys(SCENARIOS[G.scen].invs||{})))if(!has(k)){const I=invReq(k);if(I&&I.t&&!ex.has(I.t))need.add(I.t)}
  if(G.tileDeck.length)for(const m of MAP){if(G.map[m.id].tile!=null)continue;if(!m.adj.some(p=>tileAt(p)))continue;add('explore',m.id,(need.size?AIW.expl+need.size*.6:2)+(r<=3?1.5:0)+(G.scen==='hexed'?1.2:0)-(G.round>G.rounds-2?2:0))}
  // hunting
  if(G.hunt.length){const top=BEAST[G.hunt[0]];const short=Math.max(0,4-G.weapon);add('hunt',null,AIW.hunt-short*1.8+(G.res.fur<2?1:0))}
  // scenario actions
  for(const k in (SC().specials||{})){const v={temple:6,ada:18,reclaim:1.5}[k]||3;add('special',k,v)}
  if(G.kept.m_tmap)add('tmap',null,4);
  return o}
function aiPawnPool(forChars){const placed=placedIds();return allPawns().filter(p=>!placed.has(p.id)&&(p.c==null?(typeof helperAI!=='function'||helperAI()):forChars.includes(p.c)))}
function aiPlan(forChars){if(!planOpen())return;forChars=forChars||G.chars.filter(c=>!c.dead).map(c=>c.i);
  for(const c of forChars.map(P))if(c.npc){const pid='c'+c.i+'_0';if(!placedIds().has(pid))place(pid,'rest',null)}
  // hard rule: a castaway close to death rests before anything else
  for(const c of forChars.map(P))if(c&&!c.dead&&!c.npc&&!c.out&&CHARS[c.k].die-c.w<=3&&!G.plan.acts.some(a=>a.type==='rest'&&a.pw.some(p=>{const q=pawnInfo(p);return q&&q.c===c.i}))){const p=aiPawnPool(forChars).find(p=>p.c===c.i);if(p)place(p.id,'rest',null)}
  aiPrePlan(forChars);if(!planOpen())return;
  const st={food:food(),wood:G.res.wood};let guard=0;const bad=new Set();
  while(guard++<30){const pool=aiPawnPool(forChars);const chars=pool.filter(p=>p.c!=null&&!P(p.c).npc);if(!chars.length)break;
    const cands=aiCandidates(st).map(c=>AIW.noise?Object.assign(c,{v:c.v*Math.exp((Math.random()*2-1)*AIW.noise)}):c).filter(c=>!bad.has(c.type+JSON.stringify(c.tgt)));let best=null,bs=-1;
    for(const cd of cands){const probe={id:-9,type:cd.type,tgt:cd.tgt,alt:cd.alt||0,pw:[],pay:'wood'};const n=actNeed(probe);
      // affordability
      if(cd.type==='build'&&['shelter','roof','pal'].includes(cd.tgt.k)){if(!afford(probe)){probe.pay='fur';if(!afford(probe))continue}cd.pay=probe.pay}else if(!afford(probe))continue;
      const dt=dtype(probe);const typed=pool.filter(p=>p.x&&p.t.includes(cd.type)).length+(pool.some(p=>p.f)?1:0);
      const opts=[{k:n.max,sure:true}];if(n.roll&&n.max>n.need)opts.push({k:n.need,sure:false});
      for(const op of opts){const helpers=Math.min(typed,op.k-1);const cp=op.k-helpers;if(cp>chars.length)continue;
        let ev=cd.v;if(!op.sure&&dt){ev=cd.v*PSUCC[dt]-PWOUND[dt]*AIW.wp-PADV[dt]*AIW.ap+(1-PSUCC[dt])*.8}
        const cost=cp+helpers*.25;const sc=ev/cost;if(sc>bs){bs=sc;best={cd,k:op.k,cp,helpers}}}}
    if(!best||bs<AIW.stop)break;
    // assign pawns: the leader first (owner for a personal invention), then helpers
    const cd=best.cd;const life=p=>CHARS[P(p.c).k].die-P(p.c).w;const leadP=cd.owner!=null?chars.find(p=>p.c===cd.owner):chars.slice().sort((a,b)=>best.k<actNeed({type:cd.type,tgt:cd.tgt,alt:cd.alt||0,pw:[]}).max?life(b)-life(a):(P(a.c).det-P(b.c).det)||(life(b)-life(a)))[0];
    if(!leadP)break;let err=place(leadP.id,cd.type,cd.tgt,cd.alt,cd.pay);if(err){if(globalThis.AIDBG)console.log('fail',cd.type,JSON.stringify(cd.tgt),err);bad.add(cd.type+JSON.stringify(cd.tgt));continue}
    const act=G.plan.acts.find(x=>x.id===UI.lastAct);let left=best.k-1;const addTo=pid=>{const why=pawnWhy(pid,act);if(why)return why;const p=pawnInfo(pid);if(p.c!=null)act.pw.unshift(pid);else act.pw.push(pid);return null};
    for(const p of aiPawnPool(forChars).filter(p=>p.x&&p.t.includes(cd.type)))if(left>0&&!addTo(p.id))left--;
    if(left>0){const f=aiPawnPool(forChars).find(p=>p.f);if(f&&!addTo(f.id))left--}
    for(const p of aiPawnPool(forChars).filter(p=>p.c!=null&&!P(p.c).npc).sort((a,b)=>(a.c===leadP.c?-1:1)))if(left>0&&!addTo(p.id))left--;
    if(planProblems().some(x=>x.startsWith(actLabel(act))&&!/still has/.test(x))){if(globalThis.AIDBG)console.log('prob',planProblems());for(const pid of act.pw.slice())unplace(pid);bad.add(cd.type+JSON.stringify(cd.tgt));continue}
    if(cd.type==='gather'){const s=srcs(cd.tgt.pos).find(x=>x.i===cd.tgt.i);if(s&&s.s==='wood')st.wood++;else st.food+=1}
    if(cd.type==='hunt')st.food+=2;
    if(cd.type==='build'||cd.type==='threat'){const k2=actCost(act);st.wood-=k2.wood}}
  // Friday alone takes a gamble on a gather (a "?" only costs him a wound)
  const fr=aiPawnPool(forChars).find(p=>p.f);if(fr&&G.fri.w<FRIDAY.die-1){const c2=aiCandidates(st).filter(c=>c.type==='gather'&&!findAct(c.type,c.tgt)&&actNeed({type:'gather',tgt:c.tgt,pw:[]}).need===1).sort((a,b)=>b.v-a.v)[0];if(c2)place(fr.id,'gather',c2.tgt)}
  // leftover character pawns: rest when hurt, otherwise arrange the camp
  for(const p of aiPawnPool(forChars).filter(p=>p.c!=null)){const c=P(p.c);const hurt=c.w>0&&(c.w>=CHARS[c.k].die*.35||G.round>=G.rounds-1);const campOk=actNeed({type:'camp'}).need===1;if(!place(p.id,hurt||!campOk?'rest':'camp',null))continue;if(campOk&&!place(p.id,'camp',null))continue;place(p.id,'rest',null)}
  // spare helpers raise dice actions to sure success
  for(const p of aiPawnPool(forChars).filter(p=>p.c==null))for(const a of G.plan.acts){const n=actNeed(a);if(n.roll&&a.pw.length<n.max&&!pawnWhy(p.id,a)){a.pw.push(p.id);break}}
  if(G.plan.acts.some(a=>a.type==='build')&&living().some(c=>forChars.includes(c.i)&&c.k==='carpenter'&&!skillWhy(c.i,'thrifty')&&c.det>=4))useSkill(living().find(c=>c.k==='carpenter').i,'thrifty')}
// cheap boosts before planning: tokens, items, skills, the signal pile
function aiPrePlan(forChars){const hum=forChars.some(i=>P(i)&&P(i).human);for(let i=G.own.length-1;i>=0&&!hum;i--){const k=G.own[i]&&G.own[i].k;if(!k||k==='leaves'||k==='veggies'&&!living().some(c=>c.w>=3))continue;if(!discWhy(i))discUse(i);if(!planOpen())return}
  for(const it of G.items.slice()){if(it.k==='biscuits'&&food()<eatersNeed())useItem('biscuits');if(it.k==='bottle')useItem('bottle');if(it.k==='pipe')useItem('pipe');if(it.k==='stormglass'&&!G.wxEarly&&(SCENARIOS[G.scen].wx[G.round]||[]).length)useItem('stormglass')}
  for(const c of living().filter(c=>forChars.includes(c.i)&&!c.npc)){const tr=[['peptalk',()=>G.morale<2&&c.det>=5],['broth',()=>c.det>=4&&food()<eatersNeed()],['remedy',()=>living().some(x=>x.w>=4)&&c.det>=3],['keeneye',()=>c.det>=6],['fortify',()=>c.det>=5],['drive',()=>c.det>=7&&G.weapon>=4],['idea',()=>c.det>=6&&G.inv.deck.length]];
    // for a human castaway (💡 Suggest) only skills that need no answer: a question would stop the plan half-made
    for(const [k,f] of tr)if(!skillWhy(c.i,k)&&f()&&!(c.human&&['idea','keeneye','recon','track','fortify','remedy'].includes(k))){useSkill(c.i,k);if(!planOpen())return}}
  if(G.scen==='marooned'){const room=SCEN.marooned.pileRoom();const spare=G.res.wood-(hasShelter()?0:2)-(G.round>=6?2:0);const stagesLeft=5-PILE_CUM.filter(c=>c<=G.sc.pile).length;const late=(10-G.round)<=stagesLeft;if(room&&spare>0&&(late||spare>=5))pileAdd(Math.min(room,spare))}}
// ---------- driving the computer ----------
let aiTimer=null;
function allAI(){return !G.chars.some(c=>hum(c)&&!c.dead)}
function schedule(){if(aiTimer||!G||G.over||UI.pause)return;if(typeof isClient==='function'&&isClient())return;if(G.q)return;if(typeof storyActive==='function'&&storyActive())return;if(G.phase!=='plan')return;
  const ai=G.chars.filter(c=>!hum(c)&&!c.dead&&!c.npc).map(c=>c.i);const need=ai.filter(i=>allPawns().some(p=>p.c===i&&!placedIds().has(p.id)));
  if(need.length||allAI()){aiTimer=setTimeout(()=>{aiTimer=null;aiStep()},Math.max(0,AIDELAY/(UI.speed||1)))}}
function aiStep(){if(!G||G.over||!planOpen())return;if(typeof isClient==='function'&&isClient())return;const ai=G.chars.filter(c=>!hum(c)&&!c.dead).map(c=>c.i);
  if(allAI())aiPlanBest(ai);else{const need=ai.filter(i=>allPawns().some(p=>p.c===i&&!placedIds().has(p.id)));if(need.length){const before=placedIds(),mark=G.logN;aiPlanBest(need.concat(G.chars.filter(c=>c.npc).map(c=>c.i)));if(typeof mateNews==='function')mateNews(before,mark,need)}}
  if(allAI()&&planOpen()){const e=startActions();if(e){console.error('AI plan invalid: '+e);clearPlan();for(const c of living())for(const p of allPawns().filter(p=>p.c===c.i))place(p.id,c.w?'rest':'camp',null);startActions()}}refresh()}

// ---------- lookahead: try several plans, play each out to the next dawn a few times on reshuffled decks, keep the best ----------
var AIPLANS=8,AISIMS=4,AIHOR=1;
function stateScore(g){if(g.over)return g.over.win?5000:-5000+g.round*60;let s=0;const S=SCENARIOS[g.scen];
  for(const c of g.chars){if(c.dead)continue;const life=CHARS[c.k].die-c.w;s+=life*3-(life<=3?(4-life)*12:0)+Math.min(c.det,8)*.4}
  if(g.fri&&!g.fri.dead)s+=3;s+=g.morale*2.5;s+=(g.res.food+g.res.pfood*1.3)*1.2+g.res.wood*1.3+g.res.fur*1.1;
  const shel=g.camp.shelter||!!((TILES.find(t=>t.no===g.map[g.camp.pos].tile)||{}).shelter);s+=shel?15:0;s+=Math.min(g.camp.roof,4)*4+Math.min(g.camp.pal,3)*1.5+Math.min(g.weapon,5)*2;
  for(const k in g.inv.built)s+=(INV_BASE[k]||2)*.8;s+=g.map.filter(m=>m.tile!=null&&!m.down).length*1.2;
  if(g.scen==='marooned')s+=g.sc.pile*2.5+(g.inv.built.fire?15:0);
  if(g.scen==='hexed')s+=g.sc.crosses.length*25-g.map.filter(m=>m.fog).length*2;
  if(g.scen==='stranded')s+=(g.sc.rescued?70:0)+(g.inv.built.jraft?20:0)+(g.inv.built.lifeboat?40:0)+(g.inv.built.rope?5:0)+(g.inv.built.knife?4:0)-(g.sc.rescued?0:g.sc.ada*2);
  if(g.scen==='settlers')s+=g.sc.goals.filter(k=>g.inv.built[k]).length*8-(g.sc.kids||0)*2;
  return s}
function simOnce(json,seed){const keep=G;G=JSON.parse(json);G.rng=seed>>>0;for(const c of G.chars){c.human=false;if(c.hh!==undefined)c.hh=false}
  // hidden order is unknown to the planner: reshuffle every face-down pile
  shuffle(G.ev.deck);shuffle(G.tileDeck);shuffle(G.mys.deck);shuffle(G.hunt);shuffle(G.beast);shuffle(G.discs);for(const d in G.adv)shuffle(G.adv[d]);
  G.stk.push({f:'fn',k:'go'});const r0=G.round;let n=0;while(!G.over&&n++<80){run();if(G.phase==='plan'&&G.round>=r0+AIHOR)break;if(G.phase==='plan'&&!G.q){aiPlan();G.stk.push({f:'fn',k:'go'});continue}if(!G.stk.length)break}
  const sc=stateScore(G);G=keep;return sc}
function aiPlanBest(forChars){if(UI.sim||AIPLANS<=1)return aiPlan(forChars);const base=JSON.stringify(G);const fxn=UI.fx.length;UI.sim=1;let best=null,bs=-1e9;const seen=new Set();
  try{for(let i=0;i<AIPLANS;i++){G=JSON.parse(base);AIW.noise=i?.45:0;aiPlan(forChars);AIW.noise=0;if(planProblems().length)continue;const js=JSON.stringify(G);const key=JSON.stringify(G.plan.acts.map(a=>[a.type,a.tgt,a.pw.length]))+G.res.wood;if(seen.has(key))continue;seen.add(key);
    let t=0;for(let k=0;k<AISIMS;k++)t+=simOnce(js,(G.seed*31+G.round*977+k*7919)>>>0);if(t/AISIMS>bs){bs=t/AISIMS;best=js}}}
  finally{UI.sim=0;AIW.noise=0;UI.fx.length=Math.min(UI.fx.length,fxn)}
  if(best){G=JSON.parse(best)}else{G=JSON.parse(base);aiPlan(forChars)}}
