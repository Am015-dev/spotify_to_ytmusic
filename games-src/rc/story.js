// ---------- the story player: every scene of the day, one beat at a time, with the island showing that moment ----------
const FL=()=>typeof FLAVOR!=='undefined'?FLAVOR:{ev:{},adv:{},mys:{},beast:{},scen:{},chars:{},phase:{}};
const pickL=(arr,seed)=>arr&&arr.length?arr[Math.abs(seed|0)%arr.length]:'';
UI.auto=false;try{UI.auto=localStorage.getItem('swi_auto')==='1'}catch(e){}
function beatLines(i){const b=UI.beats[i];if(!b||!G)return[];const nx=UI.beats[i+1];const end=nx?nx.n0:G.logN;return G.log.filter(l=>l.i>b.n0&&l.i<=end).reverse()}
const MEANINGFUL=l=>l.c!=='step'&&!/^— Round|^Event:|^Adventure:|^Mystery:|^Plan the day|^The castaways set off|^Night falls/.test(l.t);
function skippable(i){const b=UI.beats[i];const last=i===UI.beats.length-1;if(last&&humanQ())return false;
  if(b.kind==='plan')return true;
  // "quick days": from day 2 the automatic steps and the actions opener are left out (their results show in the day summary)
  if(quickOn(b.round)&&['morning','prod','weather','go'].includes(b.kind))return true;
  return false}
function humanQ(){return !!(G&&G.q&&P(G.q.who)&&P(G.q.who).human)}
// index of the beat on screen, or -1 when the story has caught up
function storyIdx(){if(!G)return -1;let i=UI.shown+1;while(i<UI.beats.length&&skippable(i)){UI.shown=i;i++}
  if(i<UI.beats.length)return i;if(humanQ())return UI.beats.length-1;return -1}
function storyActive(){return storyIdx()>=0}
// the state the island and HUD should show right now
function viewState(){const i=storyIdx();if(i<0||i>=UI.beats.length-1)return null;const b=UI.beats[i];if(!b.snap)return null;if(!b.obj)b.obj=JSON.parse(b.snap);return b.obj}
function withView(fn){const s=viewState();if(!s)return fn();const b=UI.beats[storyIdx()];const real=G;G=Object.assign({},s,{log:real.log,stk:[],phase:b.phase==='start'?'event':b.phase,round:b.round});try{return fn()}finally{G=real}}
function storyNext(){const i=storyIdx();if(i<0)return;if(i===UI.beats.length-1&&humanQ())return;UI.shown=i;UI.seenBeat=null;sfx('click');refresh()}
function storySkip(){if(humanQ())UI.shown=UI.beats.length-2;else UI.shown=UI.beats.length-1;UI.seenBeat=null;refresh()}
function charBark(ci,kind,seed){const c=ci!=null&&ci>=0?P(ci):null;if(!c)return '';const f=FL().chars&&FL().chars[c.k];const l=f&&pickL(f[kind],seed);return l?`<div class="bark" style="--pc:${PCOL[c.i%6]}"><b>${esc(c.nm)}:</b> “${esc(l)}”</div>`:''}
const KIND_ICON={prod:'🧺',daysum:'📋',go:'🧭',finds:'🎒',intro:'🏝️',dawn:'🌅',event:'📜',threat:'⚠️',morning:'☀️',act:'🧭',adventure:'❓',mystery:'🗝️',fight:'⚔️',weather:'⛈️',night:'🌙',over:'🏁'};
const ACT_ICON={threat:'⚠️',hunt:'🏹',build:'🔨',gather:'🧺',explore:'🧭',camp:'🏕️',rest:'😴',special:'⭐',tmap:'🗺️'};
function beatHtml(i){const b=UI.beats[i];const d=b.data;const F=FL();const lines=beatLines(i).filter(MEANINGFUL);const S=SCENARIOS[G.scen];const fs=(F.scen||{})[G.scen]||{};
  let kicker='',title='',story='',card='',extra='',icon=KIND_ICON[b.kind]||'📖';
  switch(b.kind){
  case 'intro':kicker=`Chapter ${SCEN_ORDER.indexOf(G.scen)+1} · ${esc(S.n)}`;title=esc(fs.title||S.n);story=esc(fillCrew(d.text,d.page));if(d.page===d.of-1)extra=`<div class="goalbox"><b>Your goal</b> ${esc(S.x)}</div>`;break;
  case 'dawn':kicker=`Day ${d.round} of ${G.rounds}`;title=esc((fs.days&&fs.days[d.round])||pickL((F.phase||{}).dawn,b.id)||'A new day');{const wx=S.wx[d.round]||[];extra=`<div class="fore">Weather dice tonight: ${wx.length?wx.map(x=>({rain:'🌧 rain die',snow:'❄️ winter die',animals:'🐾 hungry-animals die'}[x])).join(' · '):'none, calm unless a card adds clouds'}</div>`+threadHtml(d.round)}break;
  case 'event':case 'threat':{const c=CARD[d.card];const fe=(F.ev||{})[d.card]||(F.adv||{})[d.card]||(F.mys||{})[d.card]||{};
    if(b.kind==='threat'){kicker='Too late';title=esc(c.th?c.th.n:c.n)+' — we never got to it';story=esc(fe.x||'')}
    else if(d.late){kicker='It comes back to haunt us';title=esc(c.ev.n);story=esc(fe.e||'')}
    else{kicker='Something happens';title=esc(c.n);story=esc(fe.s||'');card=c.th?`<div class="scard"><div><b>Now:</b> ${opsText(c.ev)||'nothing yet.'}</div><div><b>It stays as a threat:</b> ${esc(c.th.n)} (${c.th.pw==='1-2'?'1–2':c.th.pw} pawn${c.th.pw===1?'':'s'}${reqText(c.th.req)?', needs '+esc(reqText(c.th.req)):''}) to earn: ${opsText(c.th.rw||c.th.rw2||c.th.rw1)||'peace of mind'}</div><div class="bad"><b>If we ignore it for two days:</b> ${opsText(c.te)||'nothing'}</div></div>`:''}
    break}
  case 'morning':{kicker='Morning';title='The camp wakes';const up=lines.some(l=>/Morale \+/.test(l.t)||/gains/.test(l.t)),dn=lines.some(l=>/loses|Morale -/.test(l.t));story=esc(pickL((F.phase||{})[dn?'moraleDown':up?'moraleUp':'prod'],b.id));
    if(!lines.length){const m=(beatState(i)||G).morale;extra=`<p class="rs">Morale is ${m>0?'+'+m:m}: ${m===0?'nothing changes today':m>0?'the first player gains determination':'the first player loses determination'}.</p>`}break}
  case 'prod':{kicker='Morning';title='What the camp gives';story=esc(pickL((F.phase||{}).prod,b.id));break}
  case 'daysum':{const s=daySumHtml(i);kicker=s.kicker;title=s.title;card=s.body;break}
  case 'act':{const c=d.actor>=0?P(d.actor):null;icon=ACT_ICON[d.type]||icon;kicker=c?esc(c.nm):'Friday';title=esc(d.label);
    const ok=lines.some(l=>l.c==='good'||l.c==='big')&&!lines.some(l=>/fails\./.test(l.t));const failed=lines.some(l=>/fails\./.test(l.t));
    if(d.type==='explore'){const t=lines.find(l=>/New land/.test(l.t));const terr=t&&/place \d+: (\w+)/.exec(t.t);story=esc(terr?((F.phase||{}).explore||{})[terr[1]]||'':pickL((F.phase||{}).exploreFail,b.id));if(terr&&terr[1]==='mountains'&&G.scen==='marooned')story+=' From the peak we can see the shipping lane: this is where a signal fire could be seen.'}
    else if(d.type==='build')story=esc(failed?'':pickL((F.phase||{}).build,b.id));else if(d.type==='gather')story=esc(failed?'':pickL((F.phase||{}).gather,b.id));else if(d.type==='threat')story=esc(((F.ev||{})[d.card]||{}).t||pickL((F.phase||{}).threatDone,b.id));
    {const k0=jobNo(i);const res=failed?'<div class="outcome bad">Result: it failed.</div>':ok?'<div class="outcome good">Result: it worked.</div>':'';
     extra=`<div class="jobhd">${k0?`Job ${k0.k} of ${k0.n} · `:''}${d.dice?'Too few pawns to be sure: the dice were rolled.':'Enough pawns: certain, no dice.'}</div>`+(d.dice?diceHtml(d.dice,b.id):'')+res}
    extra+=charBark(d.actor,lines.some(l=>/wound/.test(l.t)&&l.c==='bad')?'hurt':failed?'fail':'success',b.id);break}
  case 'adventure':{const c=CARD[d.card];kicker=`Adventure while we ${({build:'build',gather:'gather',explore:'explore'})[d.deck]||'work'}`;title=esc(c.n);story=esc(((F.adv||{})[d.card]||{}).s||'');card=`<div class="scard">${cardText(c)}</div>`;break}
  case 'mystery':{const c=CARD[d.card];kicker=`Mystery · ${c.type}`;title=esc(c.n);story=esc(((F.mys||{})[d.card]||{}).s||'');card=`<div class="scard">${cardText(c)}</div>`;break}
  case 'fight':{kicker=d.hunted?'The hunt':'A fight';title=esc(String(d.name||'').replace(/^./,x=>x.toUpperCase()));story=esc(d.beast&&(F.beast||{})[d.beast]||'');const B=d.beast&&BEAST[d.beast];if(B)card=`<div class="scard">Strength <b>${B.str}</b> against our weapon <b>${(viewState()||G).weapon}</b> before the fight. Every point short is a wound; the weapon then loses ${B.wl}. It feeds us ${B.food} food${B.fur?' and '+B.fur+' fur':''}.</div>`;break}
  case 'weather':{const w=(viewState()||G).lastWx;kicker='Weather';const r=w&&w.rain,s=w&&w.snow,st=w&&w.storm,an=w&&w.animal&&w.animal!=='blank';const parts=[st?'A storm':'',r?r+' rain cloud'+(r>1?'s':''):'',s?s+' snow cloud'+(s>1?'s':''):'',an?'hungry animals':''].filter(Boolean);title=parts.length?parts.join(', ').replace(/^./,x=>x.toUpperCase()):'A calm day';story=esc(pickL((F.phase||{})[st?'storm':s?'snow':r?'rain':an?'animals':'calm'],b.id));
    if(w&&(r||s))extra=`<div class="fore">Roof ${(viewState()||G).camp.roof}: every cloud above it ruins 1 food and 1 wood${s?'; each snow cloud also burns 1 wood for warmth':''}.</div>`;break}
  case 'night':{kicker='Night';const hungry=lines.some(l=>/hunger/.test(l.t)),open=lines.some(l=>/in the open/.test(l.t));const fire=has('fire');title=hungry?'Empty stomachs':open?'Under the open sky':fire?'Around the fire':'Huddled under the shelter';story=esc(pickL((F.phase||{})[hungry?'nightHungry':open?'nightOpen':fire?'nightFire':'nightFed'],b.id));break}
  case 'plan':kicker='Planning';title='Before we set off';break;
  case 'finds':kicker='Evening';title='Back at camp';story='We unpack what the day brought in.';break;
  case 'go':{kicker='Setting off';title='Everyone to work';const st=beatState(i);extra=withState(st,()=>`<ol class="golist">${st.plan.acts.slice().sort((x,y)=>ORDER_T.indexOf(x.type)-ORDER_T.indexOf(y.type)).map(a=>{const n=actNeed(a);const sure=!n.roll||a.pw.length>=n.max;return `<li><b>${esc(actLabel(a))}</b> <small>${esc(pawnGroup(a.pw))}</small> ${sure?'<em class="sure">certain</em>':'<em class="roll">rolls dice</em>'}</li>`}).join('')}</ol>`);break}
  case 'over':{const w=G.over&&G.over.win;kicker=w?'The end':'The end';title=w?'Rescued!':'Lost on the island';story=esc(endLine());extra=`<p class="why">${esc(G.over?G.over.why:'')}</p>`;break}}
  const chips=lines.slice(0,14).map(l=>`<li class="${l.c}">${esc(l.t)}</li>`).join('');
  return {icon,kicker,title,story,card,extra,chips}}
function diceHtml(d,seed){const f=[['wound',d.w,d.w?'🩸':'·','wound','no wound'],['success',d.s,d.s?'✔':'✖','success','failure'],['adventure',d.q,d.q?'❓':'·','adventure','no adventure']];
  return `<div class="dice3">${f.map(([k,v,g,a,n],j)=>`<div class="d3 ${k} ${k==='success'?(v?'good':'bad'):(v?'bad':'good')}" style="animation-delay:${j*.12}s"><span>${g}</span><small>${v?a:n}</small></div>`).join('')}</div>`}
function renderStory(){const el=$('#story');if(!el)return;if(!G||UI.modal==='start'){el.hidden=true;document.body.classList.remove('storying');return}const i=storyIdx();document.body.classList.toggle('storying',i>=0);if(i<0){el.hidden=true;el.dataset.id='';if(V3.on)V3.focus=null;return}
  const b=UI.beats[i];const h=beatHtml(i);const q=i===UI.beats.length-1&&humanQ()?G.q:null;
  // sound and camera, once per new scene
  if(UI.seenBeat!==b.id){UI.seenBeat=b.id;beatFx(b);UI.toTop=1}
  const who=q&&G.chars.filter(c=>c.human).length>1?`<div class="qwho" style="--pc:${PCOL[q.who%6]}">${esc(P(q.who).nm)} decides</div>`:'';
  const qd=q&&q.kind==='dice'?diceHtml(q.dice,b.id):'';
  const pk=beatPhase(b);const auto=AUTO_PH.includes(pk)&&b.kind!=='daysum';const res=beatLines(i).filter(MEANINGFUL).slice(0,14);
  const outs=auto?`<div class="result"><b>Result</b>${res.length?`<ul>${res.map(l=>`<li class="${l.c}">${esc(l.t)}</li>`).join('')}</ul>`:`<p>Nothing happened.</p>`}</div>`:h.chips?`<ul class="outs">${h.chips}</ul>`:'';
  const last=i>=UI.beats.length-1;const nextL=b.kind==='daysum'&&!last?`Start day ${b.data.round+1} ▶`:last?(G.over?'See how it ended ▶':'Plan the day ▶'):'Continue ▶';const jn=b.kind==='act'?jobNo(i):null;
  const qk=b.kind==='daysum'?`<label class="chk qk"><input type="checkbox" data-a="quick" ${UI.quick?'checked':''}> Quick days: from day 2, skip the automatic steps (Morale, Production, Weather)</label>`:'';
  const body=`${phaseHeadHtml(i)}<div class="sk">${h.icon} ${h.kicker}</div><h2>${h.title}</h2>${h.story?`<p class="story">${h.story}</p>`:''}${h.card}${h.extra}${outs}${qk}
    ${q?`<div class="qbox">${who}<div class="qk">Your choice</div><h3>${esc(q.title)}</h3>${qd}<div class="opts">${q.opts.map((o,j)=>`<button class="btn opt" data-ans="${j}">${esc(o.l)}</button>`).join('')}</div></div>`:
     `<div class="sctl"><button class="btn go" data-a="next" autofocus>${nextL}</button>${allAI()?'':`<button class="btn ghost ${UI.auto?'on':''}" data-a="auto" title="Play the scenes by themselves, one after another">▶▶ Play by itself: ${UI.auto?'on':'off'}</button>`}${i<UI.beats.length-2?`<button class="btn ghost" data-a="skip" title="Jump straight to your next decision (everything is still in the Log)">Skip to my next choice</button>`:''}${jn?`<span class="prog">Job ${jn.k} of ${jn.n}</span>`:''}</div>`}`;
  el.hidden=false;if(el.dataset.id!==b.id+':'+(q?q.title:'')+':'+G.logN+':'+UI.auto){el.dataset.id=b.id+':'+(q?q.title:'')+':'+G.logN+':'+UI.auto;el.innerHTML=`<div class="scene ${b.kind}">${body}</div>`;const f=el.querySelector('[autofocus],.opt');if(f&&!UI.noFocus)f.focus({preventScroll:true})}
  if(UI.toTop){UI.toTop=0;const bd=document.querySelector('.gx-dock-body');if(bd)bd.scrollTop=0}
  clearTimeout(UI.autoT);if(!q&&(UI.auto||allAI())&&!UI.pause){const n=beatLines(i).length;UI.autoT=setTimeout(storyNext,(1600+Math.min(8,n)*380)/(UI.speed||1))}}
function lastPlanBeat(i){for(let k=i;k>=0;k--)if(UI.beats[k].kind==='go'||UI.beats[k].kind==='plan')return k;return -1}
function beatFx(b){const d=b.data;const s={intro:null,dawn:'round',event:'event',threat:'bad',morning:null,adventure:'mystery',mystery:'mystery',fight:'fight',night:'night'}[b.kind];
  if(s)sfx(s);if(b.kind==='act')sfx(d.dice?'dice':d.type==='build'?'build':d.type==='explore'?'explore':'place');
  if(b.kind==='weather'){const w=(viewState()||G).lastWx;if(w&&(w.rain||w.snow))sfx('thunder');if(V3.on&&w&&w.rain+w.snow>1)V3.flash=1}
  if(b.kind==='over')sfx(G.over&&G.over.win?'win':'lose');
  // camera: fly to where it happens
  if(V3.on){const pos=d.pos!=null?d.pos:['dawn','morning','weather','night','fight'].includes(b.kind)?G.camp.pos:null;V3.focus=pos!=null&&MAP[pos]?pos:null}}
// ---------- the story around the rules: crew, the thread toward the goal, the ending by cause ----------
const NUMW=['None','One','Two','Three','Four','Five'];
function crewLine(){const cs=G.chars.filter(c=>!c.npc);const a=n=>(/^[AEIOU]/.test(n)?'an ':'a ')+n;const names=cs.map(c=>a(c.nm));
  const list=names.length>1?names.slice(0,-1).join(', ')+' and '+names[names.length-1]:names[0];
  return (cs.length===1?`I am the only one who made it: ${list}${G.dog?', and the ship’s very soggy dog':''}. Not much of a crew, but a stubborn one.`:`We are ${list}${G.dog?', plus a very soggy dog':''}. Not much of a crew, but a stubborn one.`)+friLine()}
function friLine(){return G.fri?' On the first morning a friendly islander walks out of the trees. He calls himself Friday, knows every path, and offers to help.':''}
function fillCrew(t,page){let o=String(t||'');const n=G.chars.filter(c=>!c.npc).length;return o.replace('{crew}',crewLine()).replace('{Count}',NUMW[n]||n).replace('{fri}',friLine())}
function threadHtml(round){let t='';const pileW=p=>p>=15?'ready to light':p>=10?'as tall as a man':p>=6?'waist-high':p>=3?'knee-high':p>0?'ankle-high':'still just a plan';
  if(G.scen==='marooned'){const s=PILE_CUM.findIndex(c=>c>G.sc.pile);const parts=[];
    if(!has('fire'))parts.push(explored().has('mountains')?'From the peak we can see the shipping lane. Now we need Fire.':'Sailors look for smoke, and Fire needs the mountains: we have not found them yet.');
    if(round>=3)parts.push(`The signal pile is ${pileW(G.sc.pile)} (${G.sc.pile} of 15 wood${s>=0?`, stage ${s+1} of 5`:''}).`);
    if(round===9)parts.push('The ships pass in the next three days (days 10 to 12).');else if(round>=10)parts.push('A ship could pass today. Is the fire ready?');
    t=parts.join(' ')}
  if(G.scen==='hexed')t=`Crosses raised: ${G.sc.crosses.length} of 5.`;
  if(G.scen==='stranded')t=G.sc.rescued?'Ada is safe in camp. Now the Lifeboat.':`Ada has ${CHARS.ada.die-G.sc.ada} life left on the rock.`;
  if(G.scen==='settlers')t=`Settlement goals made: ${G.sc.goals.filter(k=>has(k)).length} of ${G.sc.goals.length}.`;
  return t?`<div class="fore thread">🧵 ${esc(t)}</div>`:''}
const DEATH_LINE={hunger:'wasted away from hunger','sleeping in the open':'caught a deadly chill sleeping in the open','soaked and cold':'never got dry again','the cold':'froze in the night','low morale':'lost the will to go on','not enough determination':'lost the will to go on','a mishap':'was hurt once too often at work','no palisade left':'was crushed when the storm tore through the camp','hungry animals':'was mauled by hungry animals','fever':'burned up with fever'};
function endLine(){const fs=(FL().scen||{})[G.scen]||{};if(!G.over)return '';if(G.over.win)return fs.win||'';const w=G.over.why;
  if(/died\.$/.test(w)){const m=G.log.map(l=>/☠ (.+) dies(?: \(([^)]*)\))?/.exec(l.t)).find(Boolean);const who=m?m[1]:w.replace(/ died\.$/,'');const why=m&&m[2]||'';
    const how=DEATH_LINE[why]||(BEASTS.some(b=>b.n===why)?`was killed by the ${why}`:why?`died (${why})`:'died of their wounds');
    return `${who} ${how}. We bury our friend above the tide line. Without them the rest of us cannot hold out, and the journal ends here.`}
  if(/cut off/.test(w))return 'The ground gives way beneath the camp. Everything we built slides into the dark, and the journal ends here.';
  if(/Time ran out/.test(w))return G.scen==='marooned'?(has('fire')?`The last day passes. The pile never reached the top (${G.sc.pile} of 15), and the ships sailed by without seeing us.`:`The last day passes. Without a fire nobody saw our pile (${G.sc.pile} of 15), and the ships sailed by.`):fs.lose||'';
  return fs.lose||''}
