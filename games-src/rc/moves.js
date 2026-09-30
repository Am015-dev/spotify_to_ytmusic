function R(){if(!UI.sim)refresh()}
// ---------- player moves during planning (validated; the UI and the AI both go through these) ----------
function planOpen(){return G&&!G.over&&!G.q&&G.phase==='plan'}
// find or make the planned action for a target
const MULTI=['rest','camp','hunt'];
function findAct(type,tgt){const key=JSON.stringify(tgt);const l=G.plan.acts.filter(a=>a.type===type&&JSON.stringify(a.tgt)===key);if(MULTI.includes(type))return l.find(a=>a.pw.length<actNeed(a).max)||null;return l[0]||null}
function placeWhy(pid,type,tgt,alt){if(!planOpen())return 'not planning now';const a=findAct(type,tgt)||{id:-1,type,tgt,alt:alt||0,pw:[]};
  const p=pawnInfo(pid);if(!p)return 'no such pawn';const lead=a.pw.map(pawnInfo).find(q=>q&&q.c!=null);
  const w=targetWhy(type,tgt,a.alt,p.c!=null?P(p.c):lead?P(lead.c):null);if(w&&!(w==='already planned'&&a.id>=0))return w;
  return pawnWhy(pid,a)}
function place(pid,type,tgt,alt,pay){const why=placeWhy(pid,type,tgt,alt);if(why)return why;let a=findAct(type,tgt);
  if(!a){a=addAct(type,tgt,alt,pay);if(type==='build'&&['shelter','roof','pal'].includes(tgt.k)&&!pay){if(!afford(a)){a.pay='fur';if(!afford(a))a.pay='wood'}}}
  // never plan something the camp can't pay for (the plan would only be refused at Start the day)
  if(!a.pw.length&&!afford(a)){const c=actCost(a);G.plan.acts.splice(G.plan.acts.indexOf(a),1);const m=committed(a.id);return `not enough resources: it needs ${Object.entries(c).filter(([r,v])=>v).map(([r,v])=>v+' '+RNAME[r]).join(' + ')} and you have ${G.res.wood-m.wood} wood, ${G.res.fur-m.fur} fur free`}
  // a character goes on top (acts); extra pawns only help
  const p=pawnInfo(pid);if(p.c!=null)a.pw.unshift(pid);else a.pw.push(pid);UI.lastAct=a.id;return null}
function unplace(pid){for(const a of G.plan.acts){const i=a.pw.indexOf(pid);if(i>=0){a.pw.splice(i,1);if(!a.pw.length){G.plan.acts.splice(G.plan.acts.indexOf(a),1);if(G.plan.thrifty===a.id)G.plan.thrifty=null}return true}}return false}
function clearPlan(onlyFor){for(const a of G.plan.acts.slice()){const other=onlyFor&&a.pw.some(id=>{const q=pawnInfo(id);return q&&q.c!=null&&!onlyFor.includes(q.c)});for(const pid of a.pw.slice()){const p=pawnInfo(pid);if(!onlyFor||(p&&p.c!=null&&onlyFor.includes(p.c))||(p&&p.c==null&&!other))unplace(pid)}}}
function setPay(id,pay){const a=G.plan.acts.find(x=>x.id===id);if(a){a.pay=pay}}
function setAlt(id,alt){const a=G.plan.acts.find(x=>x.id===id);if(a){a.alt=alt}}
function startActions(){if(!planOpen())return 'not planning now';const pr=planProblems();if(pr.length)return pr[0];
  for(const a of G.plan.acts){a.pw.sort((x,y)=>{const px=pawnInfo(x),py=pawnInfo(y);return (py.c!=null)-(px.c!=null)})}
  G.stk.push({f:'fn',k:'go'});run();R();return null}
// ---------- skills ----------
const PLANSKILLS=['thrifty','idea','hands','remedy','broth','peptalk','keeneye','recon','track','fortify','drive'];
function skillWhy(ci,k){const c=P(ci);if(!c||c.dead)return 'not here';const s=CHARS[c.k].skills.find(x=>x.k===k);if(!s)return 'not this character';if(c.noSkills)return "can't use skills this round";if(c.used[k])return 'already used this round';if(c.det<s.c)return `needs ${s.c} determination`;
  if(!PLANSKILLS.includes(k))return s.reroll?'offered when you roll the dice':k==='rage'?'offered when you fight':k==='moonshine'?'offered in the weather phase':'not now';
  if(G.phase!=='plan'||G.q||G.over)return 'use it while planning';
  switch(k){case 'thrifty':return thriftyTarget()?null:'plan a build that costs wood first';case 'idea':return G.inv.deck.length?null:'no inventions left in the deck';case 'hands':return G.plan.hands?'already active':null;
  case 'remedy':return food()<1?'needs 1 food':living().some(x=>x.w>0)?null:'nobody is wounded';case 'keeneye':return G.discs.length?null:'no tokens left';case 'recon':return G.tileDeck.length>1?null:'no tiles left';
  case 'track':return G.hunt.length?null:'no beasts in the hunting deck';case 'drive':return G.beast.length?null:'the beast deck is empty';case 'fortify':return null}return null}
function thriftyTarget(){let best=null,bw=0;for(const a of G.plan.acts){if(a.type!=='build')continue;const w=actCost(a).wood;if(w>bw){bw=w;best=a}}return best}
function useSkill(ci,k){const why=skillWhy(ci,k);if(why)return why;const c=P(ci);const s=CHARS[c.k].skills.find(x=>x.k===k);c.det-=s.c;c.used[k]=1;lg(`${c.nm} uses ${s.n}.`,'step');fx('skill',ci);
  switch(k){
  case 'thrifty':{const t=thriftyTarget();lg(`${actLabel(t)} costs 1 wood less.`,'good');G.plan.thrifty=t.id;break}
  case 'idea':{const top=G.inv.deck.slice(0,5);ask(ci,'Bright Idea: put one invention on the board',top.map(x=>({l:`${INVENTIONS[x].n}: ${INVENTIONS[x].x}`,frames:[{f:'fn',k:'addInv',key:x}]})),{kind:'inv',force:1});break}
  case 'hands':G.plan.hands=1;lg('An extra pawn for a build action this round.','good');break;
  case 'remedy':{pay('food',1,[],true);const o=living().filter(x=>x.w>0).map(x=>({l:`${x.nm} heals 2`,ops:[['heal',x.i,2]]}));if(living().filter(x=>x.w>0).length>1)o.push({l:'Split: 1 each to the two most hurt',ops:living().filter(x=>x.w>0).sort((a,b)=>b.w-a.w).slice(0,2).map(x=>['heal',x.i,1])});ask(ci,'Home Remedy: who is treated?',o,{kind:'heal'});break}
  case 'broth':gain('food',1,{});break;
  case 'peptalk':morale(1);break;
  case 'keeneye':{const a=G.discs.shift(),b=G.discs.shift();const o=[a,b].filter(Boolean).map((x,i,arr)=>({l:`Keep ${discName(x)}: ${discText(x)}`,frames:[{f:'fn',k:'keepDisc',k1:x,k2:arr[1-i]||null}]}));ask(ci,'Keen Eye: keep one token',o,{kind:'disc',force:1});break}
  case 'recon':{const top=G.tileDeck.slice(0,3);ask(ci,'Scout Ahead: which tile goes on top?',top.map(n=>({l:`Tile ${n}: ${TILES.find(t=>t.no===n).terr}${TILES.find(t=>t.no===n).src.length?' ('+TILES.find(t=>t.no===n).src.join(', ')+')':''}`,frames:[{f:'fn',k:'tileTop',n}]})),{kind:'tiles',force:1});break}
  case 'track':{const k2=G.hunt[0];ask(ci,`Tracker: the next beast is ${cname(k2)} (strength ${BEAST[k2].str}).`,[{l:'Leave it on top',frames:[]},{l:'Put it at the bottom',ops:[['huntTopBottom']]}],{kind:'track',force:1,beast:k2});break}
  case 'fortify':{const o=[{l:'Weapon +1',ops:[['weapon',1]]}];if(hasShelter())o.unshift({l:'Palisade +1',ops:[['pal',1]]});ask(ci,'Fortify',o,{kind:'fortify'});break}
  case 'drive':{const k2=G.beast.shift();G.hunt.push(k2);shuffle(G.hunt);lg('Another beast is driven into the hunting grounds.');break}}
  run();R();return null}
FN.keepDisc=fr=>{G.own.push({k:fr.k1,fut:false});if(fr.k2)G.discs.push(fr.k2);lg(`Kept: ${discName(fr.k1)}.`,'good')};
FN.tileTop=fr=>{const i=G.tileDeck.indexOf(fr.n);G.tileDeck.splice(i,1);G.tileDeck.unshift(fr.n);lg(`Tile ${fr.n} will be the next one found.`)};
function discText(k){const d=DISCS[k];if(d.sc!=null)return SCENARIOS[G.scen].finds[d.sc].x;return d.x}
// ---------- starting items ----------
const PLANITEMS=['biscuits','bottle','pipe','stormglass'];
function itemWhy(k){const it=G.items.find(i=>i.k===k);if(!it||it.uses<1)return 'not available';if(!PLANITEMS.includes(k))return {rum:'used at night',hammer:'place it as a build pawn',pistol:'offered when you fight',bible:'used by arranging the camp'}[k]||'not now';
  if(G.phase!=='plan'||G.q||G.over)return 'use it while planning';if(k==='stormglass'&&G.wxEarly)return 'already read this round';if(k==='stormglass'&&!(SCENARIOS[G.scen].wx[G.round]||[]).length)return 'no weather dice this round';return null}
function useItem(k,ci){const why=itemWhy(k);if(why)return why;const it=G.items.find(i=>i.k===k);it.uses--;lg(`Used: ${ITEMS[k].n}${it.uses?' ('+it.uses+' use left)':' (used up)'}.`,'step');
  switch(k){case 'biscuits':gain('pfood',1,{});break;case 'bottle':weapon(1);break;
  case 'pipe':{const c=ci!=null?P(ci):living().sort((a,b)=>a.det-b.det)[0];gainDet(c,2);break}
  case 'stormglass':{const r={};for(const d of SCENARIOS[G.scen].wx[G.round]){if(d==='rain')r.rain=DICE['weather-rain'][rnd(6)];if(d==='snow')r.snow=DICE['weather-winter'][rnd(6)];if(d==='animals')r.animals=DICE['weather-animals'][rnd(6)]}G.wxEarly=r;lg(`The storm glass reads the sky: ${Object.values(r).join(', ')}.`,'big');break}}
  G.items=G.items.filter(i=>i.uses>0);R();return null}
// ---------- discovery tokens ----------
function discWhy(i){const o=G.own[i];if(!o)return 'gone';if(o.fut)return 'usable after the actions';const d=DISCS[o.k];if(G.over||G.q)return 'not now';
  if(d.pot&&!has('pot'))return 'needs the Pot';if(o.k==='leaves')return 'used in the weather phase';if(o.k==='goat'&&G.weapon<1)return 'needs weapon 1';if(o.k==='thorns'&&!hasShelter())return 'needs a shelter';if(o.k==='healherbs'&&has('medicine'))return 'medicine is already made';if(o.k==='veggies'&&!living().some(c=>c.w))return 'nobody is wounded';
  if(G.phase!=='plan'&&!['night','weather'].includes(G.phase))return 'use it while planning';return null}
function discUse(i){const why=discWhy(i);if(why)return why;useDisc(i);run();R();return null}
// ---------- the signal pile (Marooned) ----------
function pileWhy(n){if(G.scen!=='marooned')return 'not this scenario';if(!planOpen())return 'only while planning';const room=SCEN.marooned.pileRoom();if(!room)return G.sc.pile>=15?'the pile is complete':'one stage per round: done for this round';if(G.res.wood-committed().wood<1)return 'no spare wood';return null}
function pileAdd(n){const w=pileWhy(n);if(w)return w;SCEN.marooned.pileAdd(n);R();return null}
