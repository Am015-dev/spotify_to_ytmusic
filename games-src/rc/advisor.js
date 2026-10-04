// ---------- the advisor: today's priorities in plain words, each with a one-tap "Do it" ----------
// One source of truth: priorities() decides what matters, doJob() is the only way the advisor places pawns
// (it never leaves an illegal plan), and suggestPlan() fills the priorities in order before the computer adds the rest.
function humanFree(){const hs=new Set(G.chars.filter(c=>c.human).map(c=>c.i));const placed=placedIds();const hm=typeof helperMine!=='function'||helperMine();return allPawns().filter(p=>!placed.has(p.id)&&(p.c==null?hm:hs.has(p.c)))}
function jobPlanned(type,tgt){const key=JSON.stringify(tgt);return G.plan.acts.some(a=>a.type===type&&JSON.stringify(a.tgt)===key)}
const lifeLeft=c=>CHARS[c.k].die-c.w;
const NEAR_DEATH=3;
// hard rule: a castaway this close to death rests (unless the rules forbid it this round)
function nearDeath(c){return !!c&&!c.dead&&!c.npc&&!c.out&&lifeLeft(c)<=NEAR_DEATH}
function restPlanned(ci){return G.plan.acts.some(a=>a.type==='rest'&&a.pw.some(p=>{const q=pawnInfo(p);return q&&q.c===ci}))}
function pawnGroup(ids){const n={};for(const id of ids){const p=pawnInfo(id);const k=p?pawnLabel(p):'?';n[k]=(n[k]||0)+1}return Object.entries(n).map(([k,v])=>v>1?`${k} ×${v}`:k).join(' + ')}
function planLegal(){return !planProblems().some(x=>!/still has a pawn/.test(x))}
function planSig(){return G?JSON.stringify(G.plan.acts.map(a=>[a.type,a.tgt,a.pw]))+G.round+G.phase:''}
// who will be first player tomorrow (the marker passes at the end of the round)
function nextFirst(){const n=G.chars.length;if(n<2)return firstC();let i=G.first;for(let k=0;k<n;k++){i=(i+1)%n;if(!P(i).dead&&!P(i).npc)break}return P(i)}
// place pawns for a job: a sure success if the pawns allow it, otherwise the minimum that rolls the dice.
// On any problem the plan is put back exactly as it was and the reason is returned.
function doJob(type,tgt,alt,lead){if(!planOpen())return 'not planning now';
  const snap=JSON.stringify(G.plan),la=UI.lastAct;const fail=m=>{G.plan=JSON.parse(snap);UI.lastAct=la;return m};
  if(lead!=null&&!P(lead).human)return hum(P(lead))?`Another player plans the ${P(lead).nm}.`:`${P(lead).nm} is a computer castaway and plans their own pawns.`;
  const n=actNeed({type,tgt,alt:alt||0,pw:[]});const free=humanFree();
  const chars=free.filter(p=>p.c!=null&&!P(p.c).npc&&!placeWhy(p.id,type,tgt,alt));
  // the healthiest castaway leads; someone close to death is kept for resting
  const score=p=>lifeLeft(P(p.c))-(nearDeath(P(p.c))&&type!=='rest'?100:0);
  let leadP=lead!=null?chars.find(p=>p.c===lead):chars.slice().sort((a,b)=>score(b)-score(a))[0];
  if(!leadP&&lead==null)leadP=free.find(p=>p.f&&!placeWhy(p.id,type,tgt,alt));
  if(!leadP){const cs=free.filter(p=>p.c!=null);if(lead!=null)return `${P(lead).nm} has no free pawn.`;if(!cs.length)return 'Every castaway pawn already has a job.';const w=placeWhy(cs[0].id,type,tgt,alt);return w?w.charAt(0).toUpperCase()+w.slice(1)+'.':'No free castaway can do that.'}
  let e=place(leadP.id,type,tgt,alt);if(e)return fail(e);const act=G.plan.acts.find(x=>x.id===UI.lastAct);
  let want=n.max-act.pw.length;const add=p=>{if(want<=0||pawnWhy(p.id,act))return;const q=pawnInfo(p.id);if(q.c!=null)act.pw.unshift(p.id);else act.pw.push(p.id);want--};
  for(const p of humanFree().filter(p=>p.x))add(p);for(const p of humanFree().filter(p=>p.f))add(p);
  // a second character pawn only when it turns a gamble into a sure thing (or the job needs it); never the pawn someone near death rests with
  const needMin=()=>n.need-act.pw.length;
  for(const p of humanFree().filter(p=>p.c!=null&&!P(p.c).npc&&!(nearDeath(P(p.c))&&!restPlanned(p.c))).sort((a,b)=>(a.c===leadP.c?-1:1)))if(want>0&&(needMin()>0||want<=1))add(p);
  if(act.pw.length<n.need)return fail(`Needs ${n.need} pawns: you have ${free.length} free.`);
  if(!afford(act)){const c=actCost(act);const need=Object.entries(c).filter(([r,v])=>v).map(([r,v])=>v+' '+RNAME[r]).join(' + ');return fail(`${actLabel(act)} needs ${need}: you have ${G.res.wood-committed(act.id).wood} wood free.`)}
  const bad=planProblems().filter(x=>!/still has a pawn/.test(x));if(bad.length)return fail(bad[0]);
  return null}
// can the advisor do this job now? If not, can it free a pawn from a less important job? (plan is left untouched)
function jobCheck(p,keep){const snap=JSON.stringify(G.plan),la=UI.lastAct;const back=()=>{G.plan=JSON.parse(snap);UI.lastAct=la};
  const r=doJob(p.act.type,p.act.tgt,p.act.alt,p.lead);back();if(!r)return {ok:true};
  if(p.lead!=null&&!P(p.lead).human)return {why:r};
  // try moving one human pawn off a job that no higher priority needs
  const donors=[];for(const a of G.plan.acts){if(keep.some(k=>k.type===a.type&&JSON.stringify(k.tgt)===JSON.stringify(a.tgt)))continue;if(a.type==='rest'&&a.pw.some(id=>{const q=pawnInfo(id);return q&&q.c!=null&&nearDeath(P(q.c))}))continue;
    for(const id of a.pw){const q=pawnInfo(id);if(q&&q.c!=null&&P(q.c).human&&(p.lead==null||q.c===p.lead))donors.push({id,a,label:actLabel(a),nm:P(q.c).nm})}}
  const f0=plannedFood();const short0=eatersNeed()-food()-f0;const done0=allPriorities().filter(q=>q.done).map(q=>q.title);
  for(const d of donors){unplace(d.id);const r2=doJob(p.act.type,p.act.tgt,p.act.alt,p.lead);let ok=!r2&&planLegal()&&(p.key!=='food'||plannedFood()>f0);
    if(ok&&p.key!=='food'&&eatersNeed()-food()-plannedFood()>Math.max(0,short0))ok=false;if(ok){const done1=new Set(allPriorities().filter(q=>q.done).map(q=>q.title));if(done0.some(t=>!done1.has(t)&&t!==p.title))ok=false}back();if(ok)return {move:d}}
  return {why:r}}
function applyMove(p){if(!p.move)return 'nothing to move';unplace(p.move.id);const r=doJob(p.act.type,p.act.tgt,p.act.alt,p.lead);if(r)return r;return null}
// ---------- food: every way to get some today, including threat rewards and the hunt ----------
function foodIn(list){let n=0;for(const op of list||[]){if(op[0]==='res'&&(op[1]==='food'||op[1]==='pfood'))n+=op[2];if(op[0]==='resPer'&&(op[1]==='food'||op[1]==='pfood'))n+=living().length;if(op[0]==='gatherExtra')n+=0}return n}
function gatherYield(pos,i){const m=G.map[pos];const s=srcs(pos).find(x=>x.i===i);if(!s)return 0;let n=1;if(s.s!=='wood'&&m.tok.food)n++;return n}
function foodOpts(){const o=[];
  for(const m of G.map){const t=tileAt(m.id);if(!t||m.id===G.camp.pos||dist(G.camp.pos,m.id)>2)continue;for(const s of srcs(m.id)){if(s.ex||s.s==='wood')continue;const tgt={pos:m.id,i:s.i};if(targetWhy('gather',tgt))continue;const n=actNeed({type:'gather',tgt});
    o.push({type:'gather',tgt,food:gatherYield(m.id,s.i),pawns:n.max,title:`${s.s==='fish'?'🐟 Fish':'🦜 Birds'} at place ${m.id+1}`,sure:true,v:gatherYield(m.id,s.i)/n.max-(m.tok.beast&&G.weapon<1?.3:0)})}}
  G.ev.threat.forEach((k,i)=>{if(!k)return;const th=CARD[k].th;const f=th.pw==='1-2'?foodIn(th.rw2):foodIn(th.rw);if(!f)return;const alt=threatAlt(i);if(alt<0)return;
    const pw=th.pw==='1-2'?2:th.pw;o.push({type:'threat',tgt:i,alt,food:f,pawns:pw,title:th.n,sure:true,v:f/pw+.2})});
  if(!targetWhy('hunt',null)&&G.weapon>=2)o.push({type:'hunt',tgt:null,food:2,pawns:2,title:'Hunt a beast',sure:true,v:.9-Math.max(0,3-G.weapon)*.3});
  return o.sort((a,b)=>b.v-a.v)}
// food already coming from today's plan
function plannedFood(){let n=0;for(const a of G.plan.acts){if(a.type==='gather'){const s=srcs(a.tgt.pos).find(x=>x.i===a.tgt.i);if(s&&s.s!=='wood')n+=gatherYield(a.tgt.pos,a.tgt.i)}
  if(a.type==='threat'){const k=G.ev.threat[a.tgt];if(k){const th=CARD[k].th;n+=foodIn(th.pw==='1-2'?(a.pw.length>=2?th.rw2:th.rw1):th.rw)}}if(a.type==='hunt')n+=2}return n}
// the first alternative of a threat card that the camp can meet right now (-1: none)
function threatAlt(i){const k=G.ev.threat[i];if(!k)return -1;const r=CARD[k].th.req||{};const n=r.alt?r.alt.length:1;for(let al=0;al<n;al++){if(targetWhy('threat',i,al))continue;if(!afford({id:-1,type:'threat',tgt:i,alt:al,pw:[]}))continue;return al}return -1}
function haveText(r){if(!r)return '';const parts=[];const one=o=>{for(const x of o.items||[])parts.push(has(x)?`a ${(INVENTIONS[x]||{}).n}`:'');if(o.weapon)parts.push(`weapon ${G.weapon}`);for(const k in o.res||{})parts.push(`${G.res[k]-committed()[k]} ${RNAME[k]}`)};(r.alt||[r]).forEach(one);const p=[...new Set(parts.filter(Boolean))];return p.length?`you have ${p.join(', ')}`:"you have none of these"}
// ---------- what can hurt tonight or at dawn ----------
function wxFoodLoss(){const c=clouds();return Math.max(0,Math.floor(c.est)-G.camp.roof)}
function clouds(){const S=SCENARIOS[G.scen];const wx=S.wx[G.round]||[];return {dice:wx,est:wx.filter(x=>x!=='animals').length*1.5+G.wx.rain+G.wx.snow}}
function allPriorities(){const o=[];if(!planOpen())return o;const S=SCENARIOS[G.scen];const add=p=>{o.push(p);return p};
  const need=eatersNeed(),have=food(),planF=plannedFood();
  // near death: the hard rule
  for(const c of living()){if(c.npc||c.out)continue;const life=lifeLeft(c);if(!nearDeath(c))continue;
    add({w:100,red:true,icon:'😴',title:`${c.nm} must rest: ${life} ${life>1?'wounds':'wound'} from death`,why:`${c.human?'Put one of '+c.nm+'’s pawns on Rest':hum(c)?c.nm+'’s player should put a pawn on Rest':c.nm+' (computer) rests by itself'}: rest heals 1. If anyone dies, you all lose.`,act:{type:'rest',tgt:null},lead:c.i,done:restPlanned(c.i),confirm:`⚠ ${c.nm} is ${life} ${life>1?'wounds':'wound'} from death and not resting.`})}
  // the story chapter's checkpoint (campaign only)
  if(G.cmp&&G.cmp.goal&&G.cmp.goal.type==='custom'){const v=G.cmp.goal.value;const late=v.byDay&&G.round>=v.byDay-1;
    if(v.build==='shelter'&&!hasShelter())add({w:92,red:late,icon:'📖',title:'Chapter goal: build the Shelter',why:`Build ▸ Shelter by the end of day ${v.byDay}. It costs wood: gather some first if you are short. Two pawns make it certain.`,act:{type:'build',tgt:{k:'shelter'}},done:G.plan.acts.some(x=>x.type==='build'&&x.tgt&&x.tgt.k==='shelter')});
    if(v.explored&&G.stats.explored<v.explored){let t=null;try{const r=catRows('explore').find(x=>!x.why);if(r)t=r.tgt}catch(e){}
      add({w:91,red:late,icon:'📖',title:`Chapter goal: explore (${G.stats.explored}/${v.explored} places)`,why:`Explore ${v.explored-G.stats.explored} more place${v.explored-G.stats.explored>1?'s':''} by the end of day ${v.byDay}. Each explored ❔ place turns over a new tile.`,act:t!=null?{type:'explore',tgt:t}:null,cant:t==null?'no unexplored place in reach':null,done:G.plan.acts.some(x=>x.type==='explore')})}}
  // food for tonight
  // rain above the roof ruins food before supper: count the likely loss too
  const wxl=wxFoodLoss();const short=need+wxl-have-planF;
  if(short>0){const fo=foodOpts();const f=fo[0];const enough=f&&f.food>=short;
    const why=`${need} food needed tonight${wxl?` plus about ${wxl} the rain will likely ruin (clouds above your roof)`:''}, ${have} in store${planF?`, ${planF} planned`:''}. Anyone who goes hungry takes 2 wounds.`+(f?` Best source: ${f.title}, ${f.pawns} pawn${f.pawns>1?'s':''}${f.type==='gather'?'':' (a sure thing)'}, +${f.food} food${enough?' (enough for tonight)':''}.`:' No fish, birds or food reward in reach yet: explore to find some.');
    add({w:95,red:true,key:'food',icon:'🍖',title:planF&&have+planF>=need?'More food: the rain will ruin some':'Find food for tonight',why,act:f?{type:f.type,tgt:f.tgt,alt:f.alt}:null,cant:f?null:planF?'every food source in reach is already in the plan':'no food source in reach',done:false,confirm:`⚠ Only ${have+planF} of ${need+wxl} food for tonight${wxl?' (with the rain)':''}: someone may go hungry (2 wounds).`})}
  if(short<=0&&planF>0)add({w:95,info:true,done:true,icon:'🍖',title:`Food for tonight: covered (${have+planF} for ${need}${wxl?`, +${wxl} for rain`:''})`,why:''});
  if(short<=0&&(have+planF>need||G.res.food>0)){const sp=Math.max(0,G.res.food+planF-need);if(sp>0&&!has('cellar')&&!G.kept.m_boxes){const ck=living().find(c=>c.k==='cook');const hurt=living().some(c=>c.w>0);const rem=ck&&hurt&&ck.det>=2;
    add({w:34,info:true,icon:'🥫',title:`${sp} food will spoil tonight`,why:`Fresh food keeps only one night (dry food 🥫 keeps).${rem?` ${ck.nm}: Home Remedy heals 2 wounds for 1 food, and you are offered it at night.`:' Spend pawns on wood or exploring instead of more food.'}`,skill:rem&&ck.human&&!skillWhy(ck.i,'remedy')?`${ck.i}:remedy`:null})}}
  // shelter
  if(!hasShelter()){const tb=SRP_COST[Math.min(4,Math.max(2,G.np))];const probe={id:-1,type:'build',tgt:{k:'shelter'},pw:[],pay:'wood'};const can=jobPlanned('build',{k:'shelter'})||afford(probe)||afford(Object.assign({},probe,{pay:'fur'}));
    if(can)add({w:90,icon:'🏠',title:'Build a shelter',why:`${tb.wood} wood or ${tb.fur} fur. Without one, every castaway takes a wound each night.`,act:{type:'build',tgt:{k:'shelter'}},done:jobPlanned('build',{k:'shelter'})});
    else{const wd=bestWood(),ex=bestExplore();const freeW=G.res.wood-committed().wood;const wg=G.plan.acts.filter(a=>a.type==='gather'&&(srcs(a.tgt.pos).find(s=>s.i===a.tgt.i)||{}).s==='wood').length;
      add({w:88,icon:'🪵',title:'Collect wood for a shelter',why:`A shelter needs ${tb.wood} wood (you have ${freeW} free). Without one, everyone takes a wound each night.${wd?'':' No wood in reach yet: explore.'}`,act:wd?{type:'gather',tgt:wd}:ex!=null?{type:'explore',tgt:ex}:null,done:freeW+wg>=tb.wood})}}
  // storm tonight
  if(G.wx.storm){const hurt=Math.max(0,G.wx.storm-G.camp.pal);const planned=G.plan.acts.filter(a=>a.type==='build'&&a.tgt.k==='pal').length;
    if(hurt>0)add({w:hurt>=Math.min(...living().map(lifeLeft))?99:78,red:hurt>=Math.min(...living().map(lifeLeft)),icon:'⛈️',title:'Storm tonight',why:`The storm knocks the palisade down by ${G.wx.storm}: palisade ${G.camp.pal} → everyone −${hurt} life. Each palisade level soaks up one storm hit.`,act:hasShelter()||jobPlanned('build',{k:'shelter'})?{type:'build',tgt:{k:'pal'}}:null,cant:hasShelter()||jobPlanned('build',{k:'shelter'})?null:'a palisade needs a shelter first',done:planned>=hurt})}
  // a beast waiting at dawn
  if(G.ev.wait){const B=BEAST[G.ev.wait];const who=nextFirst();const pw=G.plan.acts.filter(a=>a.type==='build'&&a.tgt.k==='weapon').length;const dmg=Math.max(0,B.str-G.weapon);
    if(dmg>0){const lethal=dmg>=lifeLeft(who);add({w:lethal?99:74,red:lethal,icon:'🐾',title:`${B.n} attacks at dawn`,why:`Strength ${B.str} against weapon ${G.weapon}: ${who.nm} (first player tomorrow) takes ${dmg} wound${dmg>1?'s':''}. Weapon +1 costs ${1+G.cost.weapon} wood.`,act:{type:'build',tgt:{k:'weapon'}},done:pw>=dmg||pw>=2,confirm:lethal?`⚠ The ${B.n} at dawn would kill ${who.nm}.`:null})}}
  // weather against the roof
  const cl=clouds();
  if(cl.est>G.camp.roof&&(hasShelter()||jobPlanned('build',{k:'shelter'}))){const names=cl.dice.map(x=>({rain:'🌧 rain die',snow:'❄️ winter die',animals:'🐾 animals die'}[x])).concat(G.wx.rain?[`+${G.wx.rain} rain`]:[],G.wx.snow?[`+${G.wx.snow} snow`]:[]);
    const tb=SRP_COST[Math.min(4,Math.max(2,G.np))];const rp={id:-1,type:'build',tgt:{k:'roof'},pw:[],pay:'wood'};const canPay=jobPlanned('build',{k:'roof'})||afford(rp)||afford(Object.assign({},rp,{pay:'fur'}));
    add({w:80,icon:'☂️',title:'Raise the roof',why:`Weather tonight (${names.join(', ')}): each cloud above roof ${G.camp.roof} ruins 1 food and 1 wood, and what you can’t pay is a wound each. Roof +1 costs ${tb.wood+G.cost.roof} wood or ${tb.fur} fur.`,act:{type:'build',tgt:{k:'roof'}},cant:canPay?null:`needs ${tb.wood+G.cost.roof} wood or ${tb.fur} fur: you have ${G.res.wood-committed().wood} wood and ${G.res.fur-committed().fur} fur free`,done:jobPlanned('build',{k:'roof'})})}
  else if(!cl.dice.length&&(S.wx[G.round+1]||[]).length&&G.camp.roof<2)add({w:40,icon:'☂️',title:'Get ready for the weather',why:`Weather dice start tomorrow. A roof keeps the clouds off your food and wood.`,act:hasShelter()||jobPlanned('build',{k:'shelter'})?{type:'build',tgt:{k:'roof'}}:null,cant:hasShelter()||jobPlanned('build',{k:'shelter'})?null:'needs a shelter first',done:jobPlanned('build',{k:'roof'})});
  if((S.wx[G.round]||[]).includes('snow')&&G.res.wood-committed().wood<2)add({w:60,icon:'🪵',title:'Wood for the fire',why:'Snow is coming: each snow cloud burns 1 wood for warmth, or everyone takes a wound.',act:bestWood()?{type:'gather',tgt:bestWood()}:null,cant:bestWood()?null:'no wood in reach',done:G.plan.acts.some(a=>a.type==='gather'&&(srcs(a.tgt.pos).find(s=>s.i===a.tgt.i)||{}).s==='wood')});
  // the threat that strikes at the next dawn
  if(G.ev.threat[0]&&G.ev.threat[1]){const k=G.ev.threat[0],c=CARD[k];const harm=opsValue(c.te);if(harm<0){const r=c.th.req;const al=threatAlt(0);const rq=reqText(r);
    add({w:70,icon:'⚠️',title:`Deal with “${c.th.n}”`,why:`It strikes at the next dawn if nobody deals with it: ${opsText(c.te)} ${c.th.pw==='1-2'?'1–2':c.th.pw} pawn${c.th.pw===1?'':'s'}${rq?`, needs ${rq}: ${haveText(r)}`:''}.`,act:al>=0?{type:'threat',tgt:0,alt:al}:null,cant:al>=0?null:`needs ${rq}`,done:jobPlanned('threat',0)})}}
  for(const g of goalSteps())add(g);
  if(G.morale<0){const nf=nextFirst();add({w:G.morale<=-2?68:50,icon:'🎶',title:`Lift the mood (morale ${G.morale})`,why:`Tomorrow morning ${nf.nm} (first player) loses ${-G.morale} ✊ determination, and each one they can’t pay is a wound (they have ${nf.det}). Arranging the camp gives morale +1.`,act:{type:'camp',tgt:null},done:G.plan.acts.some(a=>a.type==='camp')})}
  if(G.round<=3&&bestExplore()!=null)add({w:45,icon:'🧭',title:'Explore the island',why:'New land brings wood, food, discoveries and the terrain your inventions need.',act:{type:'explore',tgt:bestExplore()},done:G.plan.acts.some(a=>a.type==='explore')});
  return o.filter(p=>p.act||p.cant||p.pile||p.info)}
// the list shown in the panel: not-done first by weight, each checked against the plan and the free pawns
// the same game state always gives the same list: keep it while nothing changes (the panel asks several times per render)
function priorities(){if(!planOpen())return[];const key=planSig()+'|'+G.logN+'|'+JSON.stringify(G.res)+'|'+G.chars.map(c=>c.w+':'+c.det).join(',')+'|'+G.morale+'|'+G.camp.roof+'|'+G.weapon;if(UI.prioMemo&&UI.prioMemo.key===key&&UI.prioMemo.G===G)return UI.prioMemo.v.slice();const v=prioritiesRaw();UI.prioMemo={key,v,G};return v.slice()}
function prioritiesRaw(){const all=allPriorities().sort((a,b)=>(!!a.done-!!b.done)||(b.w-a.w));const open=all.filter(p=>!p.done).slice(0,5);const keep=[];
  for(const p of all)if(p.done&&p.act)keep.push(p.act);
  for(const p of open){if(!p.act||p.cant)continue;const r=jobCheck(p,keep);if(r.ok)p.can=true;else if(r.move)p.move=r.move;else p.cant=r.why.replace(/\.$/,'');keep.push(p.act)}
  return open.concat(all.filter(p=>p.done))}
function bestWood(){let best=null,bv=-1;for(const m of G.map){const t=tileAt(m.id);if(!t||m.id===G.camp.pos||dist(G.camp.pos,m.id)>2)continue;for(const s of srcs(m.id)){if(s.ex||s.s!=='wood')continue;if(targetWhy('gather',{pos:m.id,i:s.i}))continue;const v=10-dist(G.camp.pos,m.id)*3;if(v>bv){bv=v;best={pos:m.id,i:s.i}}}}return best}
function bestExplore(){let best=null,bv=-99;for(const m of MAP){if(targetWhy('explore',m.id))continue;const v=-dist(G.camp.pos,m.id)*3+m.adj.filter(p=>G.map[p].tile==null).length;if(v>bv){bv=v;best=m.id}}return best}
function missingTerrain(k){const I=invReq(k);return I&&I.t&&!explored().has(I.t)?I.t:null}
// the next step toward the scenario goal
function goalSteps(){const o=[];const inv=(k,w,why)=>{const m=missingTerrain(k);if(m){const e=bestExplore();o.push({w,icon:'🧭',title:`Find ${m} for ${invReq(k).n}`,why:`${invReq(k).n} ${why}, but it needs ${m} explored. Explore any ❔ place next to the land you know.`,act:e!=null?{type:'explore',tgt:e}:null,cant:e==null?'nothing within reach to explore':null,done:G.plan.acts.some(a=>a.type==='explore')});return}
  for(const it of invReq(k).it||[])if(!has(it)){inv(it,w-1,`is needed for ${invReq(k).n}`);return}
  const I=invReq(k);const probe={id:-1,type:'build',tgt:{k},pw:[],pay:'wood'};const tw=targetWhy('build',{k});
  o.push({w,icon:'🔨',title:`Make ${I.n}`,why:`${I.n} ${why}. It needs ${invNeedPlain(I)}.`,act:{type:'build',tgt:{k}},cant:tw&&tw!=='already planned'?tw:(jobPlanned('build',{k})||afford(probe)?null:`needs ${invNeedPlain(I)}`),done:jobPlanned('build',{k})})};
  switch(G.scen){
  case 'marooned':{if(!has('fire'))inv('fire',G.round>=5?75:55,'is half of the rescue signal: sailors look for smoke');
    const s=PILE_CUM.findIndex(c=>c>G.sc.pile);const prev=s>0?PILE_CUM[s-1]:0;const room=SCEN.marooned.pileRoom();
    if(G.sc.pile<15&&G.round>=4){const stage=`Stage ${s+1} of 5: ${G.sc.pile-prev} of ${PILE_CUM[s]-prev} wood placed`;const daysLeft=Math.max(0,12-G.round+1);const woodLeft=15-G.sc.pile;
      if(room&&G.res.wood-committed().wood>0&&G.round>=5)o.push({w:65,icon:'🔥',title:`Add wood to the signal pile (${G.sc.pile}/15)`,why:`${stage}. One stage per day: 1, then 2, 3, 4 and 5 wood. It must be full, with Fire, on day 10, 11 or 12.`,pile:1,done:false});
      else if(G.sc.stageRound===G.round)o.push({w:30,icon:'🔥',title:`Signal pile: today’s stage is done (${G.sc.pile}/15)`,why:'Save wood for tomorrow’s stage.',done:true,pile:1,info:true});
      else if(room&&G.round>=5)o.push({w:55,icon:'🔥',title:`Signal pile ${G.sc.pile}/15: no spare wood`,why:`${stage}. Gather wood today: you need ${woodLeft} more wood in all.`,act:bestWood()?{type:'gather',tgt:bestWood()}:null,cant:bestWood()?null:'no wood in reach',done:G.plan.acts.some(a=>a.type==='gather'&&(srcs(a.tgt.pos).find(q=>q.i===a.tgt.i)||{}).s==='wood')})}
    if(G.round>=8){const need=15-G.sc.pile;const stages=5-PILE_CUM.filter(c=>c<=G.sc.pile).length;o.push({w:66,info:true,icon:'⛵',title:G.round>=10?'The rescue window is open':'The rescue window opens on day 10',why:`Fire ${has('fire')?'✓':'✗'}, pile ${G.sc.pile}/15: you need ${need} more wood (${stages} stage${stages===1?'':'s'}, one a day)${has('fire')?'':', plus Fire'}. A ship can come on day 10, 11 or 12.`,done:false})}
    break}
  case 'hexed':{const t=G.map.filter(m=>tileAt(m.id)&&!G.sc.crosses.includes(m.id)).sort((a,b)=>(a.fog?1:0)-(b.fog?1:0)||dist(G.camp.pos,a.id)-dist(G.camp.pos,b.id))[0];if(t){const tgt={k:'cross',cross:t.id};const tw=targetWhy('build',tgt);o.push({w:G.round>=5?78:58,icon:'✝️',title:`Raise a cross (${G.sc.crosses.length}/5)`,why:`Five crosses on five different places break the curse. Each costs 2 wood.`,act:{type:'build',tgt},cant:tw&&tw!=='already planned'?tw:(G.plan.acts.some(a=>a.type==='build'&&a.tgt.k==='cross')||G.res.wood-committed().wood>=2?null:'needs 2 wood: gather some'),done:G.plan.acts.some(a=>a.type==='build'&&a.tgt.k==='cross')})}if(G.sc.temple!=null&&!G.sc.templeDone)o.push({w:50,icon:'🛕',title:'Search the dark temple',why:'An explore action there draws mystery cards: up to 3 treasures.',act:{type:'special',tgt:'temple'},cant:targetWhy('special','temple')==='already planned'?null:targetWhy('special','temple'),done:jobPlanned('special','temple')})}break;
  case 'stranded':if(!has('jraft'))inv('jraft',88,'lets us row out to Ada');else if(!G.sc.rescued)o.push({w:98,icon:'⛵',title:'Row out and rescue Ada',why:`Ada loses 2 life every night on the rock (${CHARS.ada.die-G.sc.ada} left).`,act:{type:'special',tgt:'ada'},cant:targetWhy('special','ada')==='already planned'?null:targetWhy('special','ada'),done:jobPlanned('special','ada')});else inv('lifeboat',80,'takes everyone home');break;
  case 'settlers':{const next=G.sc.goals.filter(k=>!has(k)).sort((a,b)=>(missingTerrain(a)?1:0)-(missingTerrain(b)?1:0))[0];if(next)inv(next,60,'is one of the nine things our settlement needs');if(G.camp.pal<1&&hasShelter())o.push({w:45,icon:'🧱',title:'Build a palisade',why:'The settlement needs a palisade of 1 or more.',act:{type:'build',tgt:{k:'pal'}},done:jobPlanned('build',{k:'pal'})});if(G.weapon<1)o.push({w:45,icon:'🗡️',title:'Make a weapon',why:'The settlement needs a weapon of 1 or more.',act:{type:'build',tgt:{k:'weapon'}},done:jobPlanned('build',{k:'weapon'})})}break}
  return o}
// the red priorities that are still open and could be fixed: Start the day asks first
function uncoveredRed(){return priorities().filter(p=>p.red&&!p.done&&(p.can||p.move))}
// ---------- 💡 Suggest: the priorities in order, then the computer's best plan for the pawns left ----------
// keep: plan only the free pawns (the recommendation in plan step 2); otherwise start from an empty human plan
function suggestCore(keep){const hs=G.chars.filter(c=>c.human&&!c.dead).map(c=>c.i);if(!keep)clearPlan(hs);const lines=[];const whyBy={};
  const who=id=>{const p=pawnInfo(id);return p?pawnLabel(p):'?'};
  const note=(before,why)=>{for(const a of G.plan.acts){const ids=a.pw.filter(id=>{const p=pawnInfo(id);return !before.has(id)&&p&&(p.c==null||P(p.c).human)});if(ids.length){lines.push(`${pawnGroup(ids)} → ${actLabel(a)}${why?' ('+why+')':''}`);const k=JSON.stringify([a.type,a.tgt]);if(why&&!whyBy[k])whyBy[k]=why}}};
  // 1. the hard rule
  for(const c of living().filter(c=>c.human&&nearDeath(c)&&!restPlanned(c.i))){const p=humanFree().find(p=>p.c===c.i);if(p&&!place(p.id,'rest',null)){lines.push(`${c.nm} → Rest (${lifeLeft(c)} life left)`);whyBy[JSON.stringify(['rest',null])]=`${c.nm} has only ${lifeLeft(c)} life left`}}
  // 2. every open priority, most important first
  for(let g=0;g<10;g++){if(!humanFree().some(p=>p.c!=null))break;const pr=priorities().filter(p=>!p.done&&p.act&&p.can&&p.w>=(typeof ADVMINW!=='undefined'?ADVMINW:0));if(!pr.length)break;let did=false;
    for(const p of pr){const before=placedIds();if(!doJob(p.act.type,p.act.tgt,p.act.alt,p.lead)){note(before,p.title.replace(/\s*\(.*\)$/,''));did=true;break}}if(!did)break}
  // 3. the computer plans what is left
  const before=placedIds(),mark=G.logN;if(humanFree().some(p=>p.c!=null)){aiPlanBest(hs.concat(G.chars.filter(c=>c.npc).map(c=>c.i)));note(before,'the computer’s pick')}
  const also=G.log.filter(l=>l.i>mark&&(l.c==='step'||/signal pile/.test(l.t))).reverse().map(l=>l.t.replace(/\.$/,''));if(also.length)lines.push('Also: '+also.join('; '));
  // safety net: the rules for the advisor must hold (checked by adv-test.js)
  for(const c of living())if(c.human&&nearDeath(c)&&!restPlanned(c.i)){const p=humanFree().find(q=>q.c===c.i)||allPawns().find(q=>q.c===c.i);if(p&&!placeWhy(p.id,'rest',null)||p&&placedIds().has(p.id)){const snap=JSON.stringify(G.plan);unplace(p.id);if(place(p.id,'rest',null))G.plan=JSON.parse(snap)}}
  if(!planLegal()&&!keep){clearPlan(hs);aiPlan(hs.concat(G.chars.filter(c=>c.npc).map(c=>c.i)))}
  return {lines,why:whyBy}}
function suggestPlan(){if(!planOpen())return '';const r=suggestCore(false);UI.sugWhy=r.why;refresh();return r.lines.join('\n')}
// plan step 2: the job the advisor would give each free pawn, worked out on a copy of the game (the real plan is untouched)
// The advice stays the same while you follow it; it is worked out again only when the plan leaves it (or resources change).
function recValid(r){if(!r||r.round!==G.round||r.res!==JSON.stringify(G.res)||r.logN!==G.logN)return false;const now={};for(const a of G.plan.acts)for(const id of a.pw)now[id]=JSON.stringify([a.type,a.tgt]);
  for(const id in r.bkey)if(now[id]!==r.bkey[id])return false;for(const id in now){if(id in r.bkey)continue;const m=r.map[id];if(!m||JSON.stringify([m.type,m.tgt])!==now[id])return false}return true}
function recPlan(){if(!planOpen())return {map:{}};if(recValid(UI.rec))return UI.rec;if(UI.recBusy)return {map:{}};const bkey={};for(const a of G.plan.acts)for(const id of a.pw)bkey[id]=JSON.stringify([a.type,a.tgt]);const res0=JSON.stringify(G.res),log0=G.logN;
  const save=JSON.stringify(G),fx=UI.fx.length,la=UI.lastAct,mate=UI.mate,sw=UI.sugWhy;const before=placedIds();const map={};UI.recBusy=1;
  try{const r=suggestCore(true);for(const a of G.plan.acts){const n=actNeed(a);const k=a.pw.length;const key=JSON.stringify([a.type,a.tgt]);const dt=dtype(a);
      for(const id of a.pw)if(!before.has(id))map[id]={type:a.type,tgt:a.tgt,alt:a.alt||0,label:actLabel(a),why:r.why[key]||'',sure:!n.roll||k>=n.max,k,with:a.pw.filter(x=>x!==id).map(x=>{const p=pawnInfo(x);return p?pawnLabel(p):'?'}),odds:n.roll&&k<n.max&&dt&&typeof diceOdds==='function'?diceOdds(dt):null}}}
  catch(e){console.error(e)}finally{G=JSON.parse(save);UI.fx.length=Math.min(UI.fx.length,fx);UI.lastAct=la;UI.mate=mate;UI.sugWhy=sw;UI.recBusy=0}
  UI.rec={round:G.round,res:res0,logN:log0,bkey,map};return UI.rec}
// ---------- first-game walkthrough ----------
UI.tut=0;try{UI.tut=localStorage.getItem('swi_tut')==='done'?99:0}catch(e){}
function tutHtml(){if(UI.tut>=99||!G||G.round>1||!planOpen()||allAI())return '';
  const steps=['<b>Each day has two halves.</b> First you plan: every castaway has 2 pawns to give jobs to. Then the day plays out as a story.',
    '<b>Start with Today’s priorities.</b> They say what matters most right now, most urgent first. Tap <b>Do it</b> on the first one.',
    '<b>Pawns and dice.</b> One pawn on a job rolls the dice (it may fail or hurt); one more pawn makes it a sure thing. Places 2 steps from camp need +1 pawn.',
    '<b>The island is yours to read.</b> Every place has a number (❔3 is unexplored place 3). Tap one to see what you can do there.',
    '<b>Give every pawn a job</b> (or tap 💡 Suggest for a full plan), then press <b>Start the day</b>.'];
  const s=Math.min(UI.tut,steps.length-1);return `<div class="coach"><div class="cn">Tip ${s+1} of ${steps.length}</div><p>${steps[s]}</p><div class="cb">${s<steps.length-1?`<button class="btn xs" data-tut="next">Got it</button>`:''}<button class="btn xs ghost" data-tut="off">Hide tips</button></div></div>`}
// ---------- the guided first game: one idea per screen, each shown once ----------
UI.guide={on:false,seen:{}};
const GUIDE={
  plan1:'<b>How a day works.</b> Every day you <b>plan</b> first, then <b>watch the day play out</b>. This page shows what the camp needs tonight: <b>red rows are trouble</b>. Your goal is in the bar under the island (🎯). In the top bar, ♥ is the life of your most hurt castaway. Press <b>Next</b>.',
  plan2:'<b>Give every pawn a job.</b> Each castaway has 2 pawns (workers); Friday and the dog are helpers. The <b>recommended job</b> comes with a reason: tap ✔ if you agree.',
  plan3:'<b>Risks.</b> One pawn on a job rolls the dice (it can fail or hurt). Two pawns make it <b>certain</b>. Anything red is not covered today.',
  plan4:'<b>Start the day.</b> The plan is fixed after this, and the day plays out scene by scene.',
  event:'<b>An event card</b> comes every morning. Its <b>threat</b> sits in a slot and strikes later unless you send pawns to deal with it.',
  act:'<b>Your jobs play out one by one.</b> Food and wood you win arrive in the evening, after every job is done.',
  dice:'<b>Dice:</b> ✔ or ✖ says whether the job worked, 🩸 is a wound, ❓ draws an adventure card. Two pawns on a job means no dice.',
  choice:'<b>Your choice.</b> Pick one of the buttons. The card text under it explains what each one does.',
  weather:'<b>Weather.</b> Each cloud above your roof ruins 1 food and 1 wood. Snow also needs 1 wood each to keep warm.',
  night:'<b>Night.</b> Everyone eats 1 food; anyone hungry takes 2 wounds. Without a shelter, everyone takes 1 wound.',
  morning:'<b>Morale.</b> Each morning the first player (★) gains or loses <b>✊ determination</b>, the points you spend on skills. Low morale costs ✊; anyone who can’t pay takes a wound.',
  prod:'<b>Production.</b> Your camp’s place gives its food and wood every morning, for free.',
  daysum:'<b>End of the day:</b> what changed and why, and the one thing to do first tomorrow. <b>If any castaway dies, you all lose.</b>'};
function guideTip(k){if(!UI.guide.on||UI.guide.seen[k]||!GUIDE[k]||!G||G.round>3)return '';return `<div class="coach gtip" role="note"><div class="cn">Tip</div><p>${GUIDE[k]}</p><div class="cb"><button class="btn xs" data-gtip="${k}">Got it</button><button class="btn xs ghost" data-gtip="off">No more tips</button></div></div>`}
function tutAdvance(to){if(UI.tut<99)UI.tut=Math.max(UI.tut,to)}
function tutDone(){UI.tut=99;try{localStorage.setItem('swi_tut','done')}catch(e){}}
