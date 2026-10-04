/* ================= Crown City Smash engine ================= */
let G=null;
const UI={choice:null,roll:null,pick:null,busy:false,info:true,coach:-1,fx:{},banner:'',pending:false,n:DEFN,mon:0,xp:DEFX,evo:DEFEVO,rollAnim:0,speed:1,ex:{},lvl:'normal',hints:true,paused:false,stats:false};
/* effect counters for coverage tests (not part of the synced state) */
const COV={};function cov(k){COV[k]=(COV[k]||0)+1}
const _mathRandom=Math.random;
function setSeed(n){if(n===null||n===undefined){Math.random=_mathRandom;return}let s=n>>>0;Math.random=function(){s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}

/* ---------- helpers ---------- */
const rnd=n=>Math.floor(Math.random()*n);
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=rnd(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const P=i=>G.pl[i];
const cur=()=>G.pl[G.active];
const base=id=>String(id).split('#')[0];
const CN=id=>CARDS[base(id)].n;
const evoName=e=>EVO[e]?EVO[e].n:'?';
const evoText=e=>EVO[e]?EVO[e].x:'';
const plu=(n,w)=>n+' '+w+(n===1?'':'s');
const evoGist=e=>(typeof EVOG!=='undefined'&&EVOG[e])||'';
function evoWhy(e){const w=EVO[e]&&EVO[e].w;return w==='perm'?'it works by itself every turn, with no timing to learn.':w==='now'?'an instant boost you can play on any of your turns.':w==='react'?'you get a pop-up at the moment it can save you.':w==='city'?'strong once you hold Downtown.':w==='kw'?'a one-time power used at its keyword moment (you get a pop-up).':'a strong one-time play at the right moment.'}
const exOn=k=>!!(G&&G.ex&&G.ex[k]);
const curseOn=k=>exOn('curse')&&G.curse===k;
const gaze=()=>curseOn('k_sphinx');
function rawCount(p,id){let n=0;for(const c of p.cards)if(base(c)===id)n++;return n}
/* how many copies of a power card p has in effect (Stare of the Sphinx switches Keep cards off; Copycat Gland adds one) */
function has(p,id){if(!p||!p.cards)return 0;const C=CARDS[id];if(!C)return 0;if(C.t==='K'&&gaze())return 0;let n=rawCount(p,id);
  if(C.t==='K'&&id!=='mimic'&&p.tok&&p.tok.mim&&rawCount(p,'mimic')&&!gaze()){const o=G.pl[p.tok.mim.o];if(o&&o.cards.includes(p.tok.mim.id)&&base(p.tok.mim.id)===id)n+=rawCount(p,'mimic')}
  return n}
/* how many copies of an evolution p has in play (permanent ones are off under Stare of the Sphinx; Mirror Frost copies one) */
function hasE(p,id){if(!p||!p.evo||!G.evoOn)return 0;const E=EVO[id];if(!E)return 0;if(E.t==='P'&&gaze())return 0;let n=0;for(const e of p.evo)if(e===id)n++;
  if(id!==18&&p.tok&&p.tok.icy&&p.evo.includes(18)&&!gaze()){const o=G.pl[p.tok.icy.o];if(o&&o.evo.includes(id)&&p.tok.icy.e===id)n++}
  return n}
const inHand=(p,id)=>p.hand.indexOf(id);
const maxhp=p=>{if(has(p,'growth'))cov('card:growth');if(has(p,'w_regen'))cov('wick:regen');if(curseOn('k_ra'))cov('curse:ra');let m=10+2*has(p,'growth')+(has(p,'w_regen')?2:0);if(curseOn('k_ra'))m=Math.min(m,8);return m};
const inCity=i=>G.city===i||G.bay===i;
const where=i=>G.city===i?'Downtown':G.bay===i?'the Harbor':'the suburbs';
const alive=()=>G.pl.filter(p=>p.alive);
const others=p=>G.pl.filter(q=>q.alive&&q.i!==p.i);
const isHuman=i=>G.pl[i].human;
const mname=p=>MONS[p.m].n;
const mbOn=()=>G.xp!=='base';
const scarab=()=>G.scarab>=0&&G.pl[G.scarab]&&G.pl[G.scarab].alive?G.scarab:-1;
function costOf(p,id){const b=base(id);if(has(p,'cosmic'))cov('card:cosmic');if(has(p,'w_lair'))cov('wick:lair');if(curseOn('k_offer'))cov('curse:offer');let c=CARDS[b].c-has(p,'cosmic')-has(p,'w_lair')+(curseOn('k_offer')?2:0);if(b==='m_nobrain')c+=2*p.mb;
  if(G.tf&&G.tf.hungry&&p.i===G.active&&!G.tf.bought)c-=3;return Math.max(0,c)}
function lg(s,t){G.lseq=(G.lseq||0)+1;G.log.unshift({s,t,n:G.lseq});if(G.log.length>400)G.log.length=400}
function fx(i,t,c){(UI.fx[i]=UI.fx[i]||[]).push({t,c});if(UI.fx[i].length>30)UI.fx[i].splice(0,10);if(typeof SND!=='undefined'&&G&&G.pl[i])SND.pitch=[1,.8,1.15,.7,1.3,.9,1.05,.85,1.2][G.pl[i].m]||1;fxSound(t,c)}
function fxSound(t,c){if(typeof sfx!=='function')return;if(/K\.O\./.test(t))sfx('ko');else if(/brainjack|jacked/i.test(t))sfx('brainjack');else if(/EVOLVE|HATCH/.test(t))sfx('evolve');else if(t==='YIELD')sfx('whoosh');else if(c==='hurt'){sfx('hurt');if(parseInt(t.slice(1))>=2)sfx('roar')}else if(c==='heal')sfx('heal');else if(c==='star')sfx('star');else if(c==='energy')sfx('energy')}
function snd(n){if(typeof sfx==='function')sfx(n)}
/* resources. Curses can block gains for everyone but the Brass Beetle holder. */
function gainVP(p,n){if(n<=0||!p.alive)return 0;if(curseOn('k_tut')&&scarab()!==p.i){cov('curse:tut');return 0}
  p.vp+=n;if(p.stats)p.stats.stars+=n;fx(p.i,'+'+n+'★','star');
  if(n>=4&&G.evoOn)for(const q of others(p))if(hasE(q,623)){gainVP(q,hasE(q,623));cov('evo:623')}
  return n}
function loseVP(p,n){const d=Math.min(p.vp,Math.max(0,n));p.vp-=d;if(d)fx(p.i,'-'+d+'★','star');return d}
function redirect(p){if(G.tf&&G.tf.redirect===p.i&&p.i===G.active){const s=scarab();if(s>=0&&s!==p.i){cov('curse:confuse:s');return P(s)}}return p}
function gainE(p,n){if(n<=0||!p.alive)return 0;p=redirect(p);if(curseOn('k_thot')&&scarab()!==p.i){cov('curse:thot');return 0}if(has(p,'kidfan'))cov('card:kidfan');n+=has(p,'kidfan');p.en+=n;fx(p.i,'+'+n+'⚡','energy');return n}
function loseE(p,n){const d=Math.min(p.en,Math.max(0,n));p.en-=d;if(d)fx(p.i,'-'+d+'⚡','energy');return d}
function heal(p,n){if(n<=0||!p.alive)return 0;p=redirect(p);if(curseOn('k_isis')&&scarab()!==p.i){cov('curse:isis');return 0}
  n+=has(p,'regrow');if(has(p,'regrow'))cov('card:regrow');const d=Math.max(0,Math.min(n,maxhp(p)-p.hp));p.hp+=d;if(d)fx(p.i,'+'+d+'♥','heal');return d}
function gainMB(p,n){p.mb+=n;fx(p.i,'+'+n+' brainjack','star')}
function neighbours(i){const n=G.pl.length;let l=null,r=null;
  for(let k=1;k<n;k++){const j=(i+k)%n;if(G.pl[j].alive){r=j;break}}for(let k=1;k<n;k++){const j=(i-k+n)%n;if(G.pl[j].alive){l=j;break}}return [...new Set([l,r].filter(x=>x!==null&&x!==i))]}
function countsOf(dice){const c={'1':0,'2':0,'3':0,E:0,C:0,H:0};dice.forEach(d=>{if(d.t==='f')return;const f=d.f;if(f==='C2')c.C+=2;else if(f==='E2')c.E+=2;else if(f in c)c[f]++});return c}
const counts=()=>countsOf(G.dice);
function draw(){if(!G.deck.length){G.deck=shuffle(G.disc);G.disc=[]}return G.deck.pop()||null}
function refill(){for(let k=0;k<3;k++)if(!G.market[k]){const c=draw();if(c){G.market[k]=c;(G.revealed=G.revealed||[]).push(c)}}G.market=G.market.filter(Boolean)}
function seq(list,fn,done){let k=0;const next=()=>{if(k>=list.length){done();return}fn(list[k++],next)};next()}
function nextAlive(i){const n=G.pl.length;for(let k=1;k<=n;k++){const j=(i+k)%n;if(G.pl[j].alive)return j}return i}
function mostOf(key,pool){pool=pool||alive();const m=Math.max(...pool.map(q=>q[key]));return m>0?pool.filter(q=>q[key]===m):[]}

/* ---------- asking (humans get a modal, computers answer at once) ---------- */
function ask(i,title,text,options,aiPick,cb,extra){
  if(!options.length){cb(null);return}
  if(G&&isHuman(i)&&!G.winner){UI.choice=Object.assign({title,text,options,cb,who:i,cid:UI.cidN=(UI.cidN||0)+1,ai:aiPick},extra||{});render();return}
  let k=aiPick();if(!options.some(o=>o.k===k))k=options[0].k;cb(k)}
/* pick one die (optionally filtered); ai returns an index */
function askDie(i,title,text,filter,aiPick,cb,canSkip){
  const opts=G.dice.map((d,k)=>({k:String(k),l:`Die ${k+1}: ${fname(d.f)}`,d:d})).filter(o=>!o.d.fz&&(!filter||filter(o.d,+o.k))).map(o=>({k:o.k,l:o.l}));
  if(canSkip)opts.push({k:'x0',l:'Skip'});
  if(!opts.length){cb(-1);return}
  ask(i,title,text,opts,()=>{const a=aiPick();return a<0?'x0':String(a)},k=>cb(k==='x0'?-1:+k),{dice:true})}
function askFace(i,title,text,faces,aiPick,cb){ask(i,title,text,(faces||FACES).map(f=>({k:f,l:fname(f)})),aiPick,cb,{dice:true})}

/* ---------- setup ---------- */
function newGame(mode,n,mon){
  n=n||UI.n||DEFN;mon=(mon===undefined?UI.mon:mon);const xp=UI.xp||DEFX,evoOn=UI.evo;
  const pool=[0,1,2,3,4,5,6,7,8].filter(m=>xp!=='base'||m<6);
  const oth=shuffle(pool.filter(m=>m!==mon));
  const mons=mode==='solo'?[mon,...oth]:shuffle(pool.slice());
  const lvl=UI.lvl||DEFLV;const pl=[];for(let i=0;i<n;i++)pl.push({i,m:mons[i],hp:10,vp:0,en:0,mb:xp==='base'?0:1,cards:[],evo:[],hand:[],edeck:[],edisc:[],alive:true,human:mode==='hot',tok:{},lvl:LVMIX?LVMIX[i%LVMIX.length]:lvl,cult:0,wk:0,dmod:0});
  if(mode==='solo'){const seat=rnd(n);const hm=pl[0].m;pl[0].m=pl[seat].m;pl[seat].m=hm;pl[seat].human=true}
  if(mode==='net'){const used=new Set();const desc=NET.seats.slice(0,n).map(h=>{let m=h.mon;if(!(Number.isInteger(m)&&pool.includes(m))||used.has(m))m=null;if(m!==null)used.add(m);return Object.assign({},h,{m})});
    const free=shuffle(pool.filter(m=>!used.has(m)));desc.forEach(h=>{if(h.m===null)h.m=free.pop()});
    const all=[...desc,...Array.from({length:n-desc.length},()=>({m:free.pop(),peer:null}))];shuffle(all);
    all.forEach((h,i)=>Object.assign(pl[i],{m:h.m,human:!!h.peer,peer:h.peer||null,uid:h.uid||null}))}
  pl.forEach(p=>p.edeck=shuffle(evoDeckOf(p.m)));
  const deck=xp==='exp'?MBDECK.slice():xp==='trial'?[...BASEDECK,...MBDECK]:BASEDECK.slice();
  const ex=Object.assign({},DEFEX||UI.ex||{});ex.evo=evoOn;
  G={gid:Math.random(),ex,mode,n,xp,evoOn,pl,city:-1,bay:-1,bayOn:n>=5,deck:shuffle(deck),disc:[],market:[],dice:[],rolls:0,phase:'start',active:0,home:0,turn:1,tid:0,log:[],winner:null,winText:'',tf:{},less:0,rollId:0,step:1,
    cold:-1,bliz:-1,frz:null,tgt:{},xq:[],xturn:null,bug:null,revealed:[],scarab:-1,curse:null,curseDeck:[],curseDisc:[]};
  refill();G.revealed=[];UI.choice=null;UI.roll=null;UI.pick=null;UI.busy=false;UI.info=false;UI.fx={};UI.banner='';UI.stats=false;clearTimeout(UI.statsT);
  lg(-1,`A new rampage begins with ${n} monsters: ${pl.map(mname).join(', ')}.`);
  if(xp!=='base')lg(-1,`Brainjack ${xp==='exp'?'Full Set (only the new cards)':'Taster (new cards mixed in)'}: every monster starts with 1 Brainjack token.`);
  if(evoOn)lg(-1,'Evolutions are on: each monster picks a starting evolution, and resolving three hearts lets it pick another.');
  if(G.bayOn)lg(-1,'With 5 or more monsters, the Harbor is open as a second city space.');
  const on=EXPS.filter(e=>e.k!=='evo'&&ex[e.k]).map(e=>e.n);if(on.length)lg(-1,'Expansions: '+on.join(', ')+'.');
  exSetup(()=>{G.ncards=cardTotal();if(evoOn)seq(G.pl.slice(),(p,next)=>pickEvo(p,true,next),()=>startTurn());else startTurn()});
}
function cardTotal(){let n=G.deck.length+G.disc.length+G.market.length+(G.limbo||[]).length;G.pl.forEach(p=>n+=p.cards.filter(c=>CARDS[base(c)].t!=='W').length);return n}
/* Evolutions: look at the top 2 cards of your evolution deck, keep 1 (the other goes to your evolution discard) */
function evoTop(p){if(!p.edeck.length){p.edeck=shuffle(p.edisc);p.edisc=[]}return p.edeck.pop()}
function pickEvo(p,init,done){if(!G.evoOn||!p.alive){done();return}
  const two=[evoTop(p),evoTop(p)].filter(x=>x!==undefined);if(!two.length){done();return}
  p.epick=two.slice();const fin=k=>{p.epick=[];const e=+k;p.hand.push(e);two.filter(x=>x!==e).forEach(x=>p.edisc.push(x));
    lg(p.i,`${mname(p)} ${init?'starts with':'evolves and picks'} an evolution card${p.human||G.mode==='ai'?` (${evoName(e)})`:''}.`);if(!init)fx(p.i,'EVOLVE!','heal');cov('evodraw');done()};
  if(two.length===1){fin(two[0]);return}
  const rec=String(aiEvoPick(p,two));const opts=two.map(e=>({k:String(e),l:evoName(e)+(EVO[e].t==='P'?' · PERMANENT':' · ONE-SHOT'),g:evoGist(e),d:evoText(e),rec:String(e)===rec}));
  if(isHuman(p.i))opts.unshift({k:rec,l:'✨ Pick for me',d:`Takes ${evoName(+rec)}: ${evoWhy(+rec)}`,primary:true});
  ask(p.i,init?'Pick a secret power':'Evolution!',`${mname(p)}, evolutions are secret powers only you can see. Keep one of these two (the other is discarded). You play it later with the 🧬 button when it is allowed.`,
    opts,()=>rec,fin,{nocancel:true,why:`Take ${evoName(+rec)}: ${evoWhy(+rec)}`})}

/* ---------- turn flow ---------- */
function startTurn(){
  if(G.winner)return;
  const p=cur();G.phase='start';G.tid++;G.step=1;UI.banner='';
  const x=G.xturn||{};G.xturn=null;G.less=x.less||0;
  G.tf={dealt:0,lost:{},wound:{},safe:{},left:[],hunt:null,sneaky:[],cheer:0,nofate:!!x.nofate,frenzyTurn:x.frenzy||null,extra:!!x.extra,startIn:[G.city,G.bay],uses:{}};
  if(!x.extra)G.home=G.active;
  if(x.extra)lg(p.i,`${mname(p)} takes an extra turn${x.frenzy?' (ENCORE)':''}${G.less?` with ${G.less} ${G.less===1?'die':'dice'} fewer`:''}.`);
  /* own effects that last until your next turn end now */
  if(G.cold===p.i){G.cold=-1;dropEvo(p,14)}
  if(G.bliz===p.i){G.bliz=-1;dropEvo(p,16)}
  startEffects(p);
  deaths();
  if(checkWin(false)){refresh();return}
  if(!p.alive){endTurn();return}
  seq(startQuestions(p),(f,next)=>{if(G.winner||!p.alive){next();return}f(next)},()=>{
    if(G.winner){refresh();return}if(!p.alive){endTurn();return}
    if(G.tf.skip){lg(p.i,`${mname(p)} skips its roll.`);G.phase='buy';G.step=4;G.dice=[];refresh();return}
    startRoll(p)})}
function startEffects(p){
  if(inCity(p.i)){const b=2+has(p,'street')+hasE(p,47);if(has(p,'street'))cov('card:street');if(hasE(p,47))cov('evo:47');const g=gainVP(p,b);lg(p.i,`${mname(p)} starts in ${where(p.i)} and gains ${plu(g,'star')}.`);
    if(hasE(p,55)){others(p).forEach(q=>loseVP(q,hasE(p,55)));cov('evo:55');lg(p.i,`${mname(p)} guards the city: everyone else loses a star.`)}
    if(p.stats)p.stats.city++}
  if(exOn('tower')){const t0=G.tower[0]===p.i,t1=G.tower[1]===p.i;const h=(t0?1:0)+(t1?1:0);if(h){heal(p,h);cov('tower:heal')}if(t1)gainE(p,1);if(h)lg(p.i,`${mname(p)} draws power from the Crown Spire.`)}
  if(has(p,'cell')&&p.tok.cell>0){const t=Math.min(2,p.tok.cell);p.tok.cell-=t;gainE(p,t);cov('card:cell');lg(p.i,`${mname(p)} drains ${t} energy from its Power Cell.`);if(p.tok.cell<=0){discardCard(p,'cell');delete p.tok.cell;lg(p.i,'The Power Cell is empty and discarded.')}}
  if(has(p,'c_prin')){gainVP(p,has(p,'c_prin'));cov('cost:prin')}
  if(has(p,'w_eter')){heal(p,1);cov('wick:eter')}
  if(has(p,'w_tire')){gainE(p,1);cov('wick:tire')}
  if(curseOn('k_set')){hitSync(p,1,null,'fx');cov('curse:set')}
  if(curseOn('k_build')){loseVP(p,2);cov('curse:build')}
  if(curseOn('k_mighty')){mostOf('hp').forEach(q=>hitSync(q,1,null,'fx'));cov('curse:mighty')}
  if(curseOn('k_wealthy')){mostOf('vp').forEach(q=>loseVP(q,1));cov('curse:wealthy')}
  if(curseOn('k_spirit')){mostOf('en').forEach(q=>loseE(q,1));cov('curse:spirit')}
  if(p.tok.ufo&&p.tok.ufo.length){p.tok.ufo=p.tok.ufo.filter(id=>{if(!p.cards.includes(id))return false;if(rnd(6)===4){const k=p.cards.indexOf(id);G.disc.push(p.cards.splice(k,1)[0]);lg(p.i,`${mname(p)}'s saucer-bought ${CN(id)} breaks down and is discarded.`);cov('evo:28:lost');return false}return true})}
}
/* questions asked at the start of a turn, before the roll */
function startQuestions(p){const Q=[];
  if(curseOn('k_khepri'))Q.push(next=>{const s=scarab();if(s<0||s===p.i){next();return}const h=P(s);
    const opts=[['h','1 heart',h.hp>0],['e','1 energy',h.en>0],['v','1 star',h.vp>0]].filter(o=>o[2]).map(o=>({k:o[0],l:'Give '+o[1]}));if(!opts.length){next();return}
    ask(s,'Beetle’s Uprising',`You hold the Brass Beetle: give ${mname(p)} 1 heart, 1 energy or 1 star.`,opts,()=>h.en>0?'e':h.vp>0?'v':'h',k=>{cov('curse:khepri');if(k==='h'){h.hp--;heal(p,1)}else if(k==='e'){loseE(h,1);gainE(p,1)}else{loseVP(h,1);gainVP(p,1)}deaths();next()})});
  if(G.frz&&G.frz.t===p.i)Q.push(next=>{const o=P(G.frz.o);if(!o.alive){G.frz=null;next();return}
    askFace(o.i,'Frost Beam',`${mname(p)} holds your Frost Beam. Name a die face that does nothing for it this turn.`,FACES,()=>aiFreezeFace(o,p),f=>{G.tf.void=f;cov('evo:11:face');lg(o.i,`${mname(o)} freezes ${mname(p)}'s ${fname(f)} faces this turn.`);next()})});
  if(has(p,'mimic')&&p.en>=1&&p.tok.mim)Q.push(next=>{const t=mimicTargets(p);if(!t.length){next();return}
    ask(p.i,'Copycat Gland','Pay 1 energy to copy a different Keep card?',[{k:'n',l:`Keep copying ${CN(p.tok.mim.id)}`},...t.map(x=>({k:x.o+':'+x.id,l:`${CN(x.id)} (${mname(P(x.o))})`,d:CARDS[base(x.id)].x}))],
      ()=>aiMimic(p,t,true),k=>{if(k!=='n'){p.en--;setMimic(p,k)}next()})});
  if(hasE(p,626))Q.push(next=>{const pledged=[];seq(others(p),(q,nx)=>ask(q.i,'Hive Queen',`${mname(p)} asks for your pledge. If it picks you, you give it 4 stars and gain 1 Brainjack token.`,[{k:'y',l:'Pledge'},{k:'n',l:'Refuse'}],
      ()=>q.vp<=2&&q.mb===0?'y':'n',k=>{if(k==='y')pledged.push(q.i);nx()}),()=>{if(!pledged.length){next();return}
      ask(p.i,'Hive Queen','Pick the monster that pledged to you.',pledged.map(j=>({k:String(j),l:mname(P(j))+` (${P(j).vp} stars)`})),()=>String(pledged.sort((a,b)=>P(b).vp-P(a).vp)[0]),k=>{const q=P(+k);const d=loseVP(q,4);gainVP(p,d);gainMB(q,1);cov('evo:626');lg(p.i,`${mname(q)} pledges to ${mname(p)}.`);next()})})});
  /* Brainjack keywords that are used before rolling: LOCK-ON and SLINK (power cards and evolutions) */
  Q.push(next=>kwStart(p,next));
  const startEvos=p.hand.filter(e=>EVO[e].w==='start');
  if(startEvos.length)Q.push(next=>{const opts=[...new Set(startEvos)].filter(e=>e!==64||!inCity(p.i)).map(e=>({k:'e'+e,l:'Play '+evoName(e),d:evoText(e)}));if(!opts.length){next();return}
    ask(p.i,'Before you roll','Play an evolution now?',[...opts,{k:'n',l:'No'}],()=>aiStartEvo(p,startEvos),k=>{if(k==='n'){next();return}const e=+k.slice(1);playEvoNow(p,p.hand.indexOf(e),next)})});
  if(hasE(p,26)&&p.en>=2)Q.push(next=>ask(p.i,evoName(26),'Put 2 energy on '+evoName(26)+'? With 3+ claws you get them back and hit 2 harder; otherwise you lose them and 2 hearts.',[{k:'y',l:'Bet 2 energy'},{k:'n',l:'No'}],
    ()=>aiExotic(p)?'y':'n',k=>{if(k==='y'){p.en-=2;G.tf.exotic=true;cov('evo:26:bet')}next()}));
  return Q}
function kwCards(p,kws){const out=[];p.cards.forEach((id,k)=>{const C=CARDS[base(id)];if(C.t==='C'&&C.kws&&C.kws.some(w=>kws.includes(w)))out.push({src:'c',id,k,C})});
  p.hand.forEach((e,k)=>{const E=EVO[e];if(E.w==='kw'&&E.kws.some(w=>kws.includes(w)))out.push({src:'e',id:e,k,C:E});});return out}
function kwStart(p,next){if(G.bug){next();return}const L=kwCards(p,['Hunter','Sneaky']);if(!L.length){next();return}
  const opts=[];L.forEach(c=>c.C.kws.filter(w=>w==='Hunter'||w==='Sneaky').forEach(w=>{if(w==='Hunter'&&G.tf.hunt)return;opts.push({k:(c.src==='c'?'c:':'e:')+c.id+':'+w,l:`${KWN[w].toUpperCase()}: ${c.C.n}`,d:c.C.x})}));
  if(!opts.length){next();return}
  ask(p.i,'Before rolling: use a keyword card?',KWHELP.Hunter+' / '+KWHELP.Sneaky,[...opts,{k:'n',l:'Not now'}],()=>aiKwStart(p,opts),k=>{if(k==='n'){next();return}
    const [src,id,w]=k.split(':');activateKw(p,src,src==='c'?id:+id,w,()=>kwStart(p,next))})}
/* take a used keyword card out of play (power cards go to the discard pile, evolutions to your evolution discard) */
function spendKw(p,src,id){if(src==='c'){const k=p.cards.indexOf(id);if(k>=0)G.disc.push(p.cards.splice(k,1)[0])}else{const k=p.hand.indexOf(id);if(k>=0){p.hand.splice(k,1);p.edisc.push(id)}}}
function activateKw(p,src,id,w,done){const C=src==='c'?CARDS[base(id)]:EVO[id];lg(p.i,`${mname(p)} uses ${KWN[w].toUpperCase()}: “${C.n}”.`);fx(p.i,KWN[w].toUpperCase()+'!','star');cov('kw:'+w);cov((src==='c'?'card:':'evo:')+base(id));
  if(w==='Hunter'){const t=others(p);ask(p.i,'Lock-on','Pick the monster to lock on to: it is the only target of your claws this turn.',t.map(q=>({k:String(q.i),l:mname(q)+` (${q.hp}♥ ${q.vp}★ ${q.en}⚡)`})),()=>String(aiHunt(p,src,id)),k=>{
      G.tf.hunt={t:+k,src,id,lost:0};if(src==='c'){const j=p.cards.indexOf(id);if(j>=0)p.cards.splice(j,1);G.limbo=(G.limbo||[]).concat([id])}else{const j=p.hand.indexOf(id);if(j>=0)p.hand.splice(j,1);p.evo.push(id)}
      lg(p.i,`${mname(p)} hunts ${mname(P(+k))}.`);done()});return}
  if(w==='Sneaky'){if(src==='c'){const j=p.cards.indexOf(id);if(j>=0)p.cards.splice(j,1);G.limbo=(G.limbo||[]).concat([id])}else{const j=p.hand.indexOf(id);if(j>=0)p.hand.splice(j,1);p.evo.push(id)}
    G.tf.sneaky.push({src,id});const b=base(id);
    if(b==='m_alloy')G.tf.alloy=true;
    if(b==='m_scept'){const cs=G.disc.filter(x=>CARDS[base(x)].t==='C');if(!cs.length){lg(p.i,'There is no consumable card in the discard pile.');done();return}
      ask(p.i,'Occult Rod','Take any consumable card from the discard pile for free.',cs.map(x=>({k:x,l:CN(x),d:CARDS[base(x)].x})),()=>cs.map(x=>x).sort((a,b)=>cardValue(p,b)-cardValue(p,a))[0],k=>{G.disc.splice(G.disc.indexOf(k),1);p.cards.push(k);cov('card:m_scept:take');lg(p.i,`${mname(p)} takes ${CN(k)} from the discard pile.`);done()});return}
    done();return}
  if(w==='Frenzy'){spendKwLater(p,src,id);G.tf.kwFrenzy={src,id};done();return}
  done()}
function spendKwLater(p,src,id){if(src==='c'){const j=p.cards.indexOf(id);if(j>=0)p.cards.splice(j,1);G.limbo=(G.limbo||[]).concat([id])}else{const j=p.hand.indexOf(id);if(j>=0)p.hand.splice(j,1);p.evo.push(id)}}
/* a keyword card that was put aside while active goes away */
function retireKw(p,src,id){if(src==='c'){const j=(G.limbo||[]).indexOf(id);if(j>=0){G.limbo.splice(j,1);G.disc.push(id)}}else{const j=p.evo.indexOf(id);if(j>=0){p.evo.splice(j,1);p.edisc.push(id)}}}
function startRoll(p){
  const nd=diceCount(p);
  G.dice=[];for(let k=0;k<nd;k++)G.dice.push({f:FACES[rnd(6)],k:false,x:k>=6});G.dice.push(...exDice(p));
  G.rolls=rerollsOf(p);G.rollId++;G.phase='roll';G.step=1;G.aiMarked=false;G.tf.uses={};snd('dice');if(p.human)setTimeout(()=>snd('turn'),650);
  lg(p.i,`${mname(p)} rolls ${nd} dice.`);refresh()}
function diceCount(p){if(has(p,'skull'))cov('card:skull');if(has(p,'w_cyb'))cov('wick:cyb');if(p.tok.shrink)cov('card:shrink:less');if(curseOn('k_flood'))cov('curse:flood');if(curseOn('k_false'))cov('curse:false:dice');let n=6+has(p,'skull')+has(p,'w_cyb')-(p.tok.shrink||0)-(p.dmod||0);if(curseOn('k_flood'))n--;if(curseOn('k_false'))n+=2;if(G.cold>=0&&G.cold!==p.i){n--;cov('evo:14')}n-=G.less;return Math.max(0,n)}
function rerollsOf(p){['brain','w_dev','c_statue','m_free'].forEach(k=>{if(has(p,k))cov((k[0]==='w'?'wick:':k[0]==='c'&&k[1]==='_'?'cost:':'card:')+k.replace(/^[wc]_/,''))});if(curseOn('k_sand'))cov('curse:sand');let r=2+has(p,'brain')+has(p,'w_dev')+has(p,'c_statue')+has(p,'m_free');if(curseOn('k_false'))r++;if(curseOn('k_sand'))r--;
  if(G.bliz>=0&&G.bliz!==p.i){r=0;cov('evo:16')}if(G.tf.catnip)r=0;return Math.max(0,r)}
const noReroll=d=>d.fz||(curseOn('k_horus')&&(d.f==='C'||d.f==='C2'))||(curseOn('k_scribe')&&d.f==='1');
function reroll(){G.dice.forEach(d=>{if(!d.k&&!noReroll(d))d.f=faceOf(d)});G.rollId++;UI.banner='';snd('dice')}
function doReroll(kind){const p=cur();
  if(kind==='mind'){if(p.en<1)return;p.en-=1;cov('card:mind')}else if(kind==='smoke'){if(!(p.tok.smoke>0))return;p.tok.smoke--;cov('card:smoke');if(p.tok.smoke<=0){discardCard(p,'smoke');lg(p.i,`${mname(p)} uses its last puff of smoke.`)}}
  else if(kind==='free'){}
  else{if(G.rolls<=0)return;G.rolls--}
  reroll();refresh()}
function discardCard(p,id){const k=p.cards.findIndex(c=>base(c)===id);if(k>=0){const c=p.cards.splice(k,1)[0];if(CARDS[base(c)].t!=='W')G.disc.push(c);onLoseCard(p,c)}}
function onLoseCard(p,c){if(p.tok.ufo)p.tok.ufo=p.tok.ufo.filter(x=>x!==c);if(base(c)==='smoke')delete p.tok.smoke;if(base(c)==='cell')delete p.tok.cell;if(base(c)==='mimic'&&!rawCount(p,'mimic'))delete p.tok.mim}
function dropEvo(p,e){const k=p.evo.indexOf(e);if(k>=0){p.evo.splice(k,1);p.edisc.push(e)}}

/* ---------- deferred questions (asked at the next calm moment of the flow) ---------- */
let PENDING=[];
function later(f){PENDING.push(f)}
function flushQ(done){if(!PENDING.length){done();return}const L=PENDING;PENDING=[];seq(L,(f,next)=>{if(G.winner){next();return}f(next)},()=>flushQ(done))}

/* ---------- resolving ---------- */
function canHealDice(p){if(curseOn('k_osiris'))return inCity(p.i);return !inCity(p.i)}
function resolve(){const roller=cur();if(G.phase!=='roll')return;G.phase='resolve';UI.busy=true;G.step=2;
  if(G.tf.skipWin){doResolve(roller);return}
  seq(preResolve(roller),(f,next)=>{if(G.winner){next();return}f(next)},()=>{if(G.winner){UI.busy=false;refresh();return}
    brainjackWindow(roller,p=>doResolve(p))})}
/* other monsters may meddle with the dice after the last roll */
function preResolve(r){const Q=[];
  if(hasE(r,15)&&r.en>=1)Q.push(next=>askDie(r.i,evoName(15),'Pay 1 energy to lock one of your dice so nobody can change it this turn?',null,()=>aiIceLock(r),k=>{if(k>=0){r.en--;G.dice[k].fz=true;cov('evo:15');lg(r.i,`${mname(r)} locks a ${fname(G.dice[k].f)} in ice.`)}next()},true));
  others(r).forEach(q=>{
    if(has(q,'c_cheer'))Q.push(next=>{if(!q.alive){next();return}ask(q.i,'Pom-Poms',`Cheer for ${mname(r)}? It adds a claw to its roll.`,[{k:'y',l:'Cheer! (+1 claw)'},{k:'n',l:'No'}],()=>aiCheer(q,r)?'y':'n',k=>{if(k==='y'){G.tf.cheer=(G.tf.cheer||0)+1;cov('cost:cheer');lg(q.i,`${mname(q)} cheers for ${mname(r)}.`)}next()})});
    if(has(q,'probe'))Q.push(next=>{if(!q.alive||!has(q,'probe')){next();return}askDie(q.i,CARDS.probe.n,`Reroll one of ${mname(r)}'s dice? (If it comes up a heart, discard this card.)`,d=>d.t!=='f',()=>aiMeddle(q,r),k=>{if(k>=0){const d=G.dice[k];d.f=faceOf(d);cov('card:probe');lg(q.i,`${mname(q)} peeks into ${mname(r)}'s mind and rerolls a die: ${fname(d.f)}.`);if(d.f==='H'&&!d.t){discardCard(q,'probe');lg(q.i,'A heart! The Mind Peek is discarded.')}}next()},true)});
    if(has(q,'c_witch'))Q.push(next=>{if(!q.alive||!willWound(r,q)){next();return}askDie(q.i,COSTUMES.c_witch.n,`${mname(r)} is about to wound you. Reroll one of its dice?`,d=>d.t!=='f',()=>aiMeddle(q,r,true),k=>{if(k>=0){const d=G.dice[k];d.f=faceOf(d);cov('cost:witch');lg(q.i,`${mname(q)} hexes a die of ${mname(r)}: ${fname(d.f)}.`)}next()},true)});
    if(inHand(q,627)>=0)Q.push(next=>{if(!q.alive||inHand(q,627)<0){next();return}ask(q.i,evoName(627),`Play ${evoName(627)} and reroll 3 of ${mname(r)}'s dice?`,[{k:'y',l:'Play it'},{k:'n',l:'No'}],()=>aiPuppet(q,r)?'y':'n',k=>{if(k!=='y'){next();return}
      q.hand.splice(q.hand.indexOf(627),1);q.edisc.push(627);cov('evo:627');let left=3;const one=()=>{if(left--<=0){next();return}askDie(q.i,evoName(627),`Pick a die of ${mname(r)} to reroll (${left+1} left).`,d=>d.t!=='f',()=>aiMeddle(q,r),k2=>{if(k2<0){next();return}G.dice[k2].f=faceOf(G.dice[k2]);one()},true)};one()})});
    if(inHand(q,628)>=0)Q.push(next=>{if(!q.alive||inHand(q,628)<0||!G.dice.some(d=>(d.f==='C'||d.f==='C2')&&!d.fz)){next();return}ask(q.i,evoName(628),`Play ${evoName(628)}: ${mname(r)} discards all its claws?`,[{k:'y',l:'Play it'},{k:'n',l:'No'}],()=>aiStare(q,r)?'y':'n',k=>{if(k==='y'){q.hand.splice(q.hand.indexOf(628),1);q.edisc.push(628);G.dice=G.dice.filter(d=>!((d.f==='C'||d.f==='C2')&&!d.fz));cov('evo:628');lg(q.i,`${mname(q)} stares ${mname(r)}'s claws away.`)}next()})});
  });
  return Q}
function willWound(r,q){const s=scoreDice(r,G.dice);return s.dmg>0&&s.targets.includes(q)}
function brainjackWindow(roller,done){if(!mbOn()||G.bug){done(roller);return}
  const n=G.pl.length;const cands=[];for(let k=1;k<n;k++){const q=G.pl[(roller.i+k)%n];if(q.alive&&(q.mb>0||has(q,'m_evade')))cands.push(q)}
  let by=null;
  seq(cands,(q,next)=>{if(by||!q.alive){next();return}
    const mine=scoreDice(q,G.dice),theirs=scoreDice(roller,G.dice);const rec=aiBrainjack(q,roller);
    if(isHuman(q.i)&&!rec&&typeof mbHold==='function'&&mbHold(q,mine)){next();return}
    const steal=[];if(q.mb>0)steal.push({k:'y',l:`🧠 Steal this roll (uses your ${q.mb===1?'only ':''}Brainjack token)`,d:`You would get: ${mine.text}. You resolve it and shop; your own turn still comes.`,rec:!!rec&&!has(q,'m_evade')});
    if(has(q,'m_evade'))steal.push({k:'e',l:`🧠 Steal it with ${CARDS.m_evade.n} (keeps your token)`,d:`You would get: ${mine.text}. The card goes to ${mname(roller)}.`,rec:!!rec});
    const letgo={k:'n',l:rec?'Let it go':'Let it go (save your 🧠)',d:`${mname(roller)} gets: ${theirs.text}.${rec?'':' Save your token for a roll worth 3+ ★ or 4+ damage.'}`,rec:!rec};
    const opts=rec?[...steal,letgo]:[letgo,...steal];
    const why=rec?`Steal it: ${mine.text}. You resolve these dice and shop, then ${mname(roller)} rolls again, and your own turn still comes.`:`Save your 🧠: for you this roll is only ${mine.text}. Spend it on a roll worth 3+ ★ or 4+ claws.`;
    ask(q.i,'Brainjack: steal this roll?',`${mname(roller)} finished rolling. You may spend your Brainjack token to use these dice as if you rolled them. ${mname(roller)} then rolls again from scratch.`,opts,
      ()=>rec?(has(q,'m_evade')?'e':'y'):'n',k=>{if(k==='n'){next();return}
      if(k==='e'){const j=q.cards.findIndex(c=>base(c)==='m_evade');const c=q.cards.splice(j,1)[0];roller.cards.push(c);cov('card:m_evade');lg(q.i,`${mname(q)} uses its ${CN(c)} and hands it to ${mname(roller)}.`)}else q.mb--;
      by=q;next()},{dice:true,why})},
   ()=>{if(!by){done(roller);return}
     G.bug={by:by.i,v:roller.i,tf:G.tf};G.tf={dealt:0,lost:G.tf.lost,wound:G.tf.wound,safe:G.tf.safe,left:[],hunt:null,sneaky:[],cheer:0,bug:true,uses:{},startIn:[G.city,G.bay],void:null};
     G.active=by.i;cov('brainjack');lg(by.i,`${mname(by)} BRAINJACKS ${mname(roller)} and resolves its dice!`);fx(by.i,'BRAINJACK!','star');fx(roller.i,'jacked!','hurt');
     done(by)})}
function doResolve(p){G.tf.inT0=inCity(p.i);
  fateStep(p,()=>{if(G.winner){UI.busy=false;refresh();return}if(G.phase==='roll'){UI.busy=false;refresh();return}
    confusedStep(p,()=>resolveCore(p))})}
/* Muddled Senses: the Brass Beetle holder may make you reroll up to 2 dice */
function confusedStep(p,done){const s=scarab();if(!curseOn('k_confuse')||s<0||s===p.i){done();return}const h=P(s);let left=2;
  const one=()=>{if(left--<=0){done();return}askDie(h.i,CURSES.k_confuse.n,`Make ${mname(p)} reroll one of its dice? (${left+1} left)`,d=>d.t!=='f',()=>aiMeddle(h,p),k=>{if(k<0){done();return}G.dice[k].f=faceOf(G.dice[k]);cov('curse:confuse');one()},true)};one()}
function effCounts(p){const c=countsOf(G.dice);const ban=[];
  if(G.tf.void){ban.push(G.tf.void);cov('evo:11:void')}
  if(curseOn('k_ka')&&!G.tf.kaOff)ban.push('1','2','3');if(G.tf.kaFlip)ban.push('C','H','E');
  if(curseOn('k_hotep')&&scarab()!==p.i)ban.push('C');if(G.tf.noClaw)ban.push('C');
  ban.forEach(f=>c[f]=0);
  if(G.tf.catnip){for(const f in c)c[f]*=2;cov('evo:34')}
  return c}
function resolveCore(p){
  const bug=!!G.bug;const inT=inCity(p.i);const c=effCounts(p);
  const R={p,bug,c,add:0,out:[],hurt:[],hitList:[],yielders:[],inT,healed:0,gotE:0};const out=R.out;
  /* numbers */
  let pts=0;
  for(const f of ['1','2','3']){const n=c[f];if(n<3)continue;const v=(+f)+(n-3);pts+=v;let b=0;
    if(f==='1'){if(has(p,'gourmand')){b+=2*has(p,'gourmand');cov('card:gourmand')}if(has(p,'w_skul')){b+=has(p,'w_skul');cov('wick:skul')}if(has(p,'hiccup')&&!bug){G.tf.freeze=true;cov('card:hiccup')}}
    const g=gainVP(p,v+b);out.push(`${g}★ from ${n}×${f}`);
    if(exOn('wick')&&(f==='1'||f==='2'))gainWick(p,(3-(+f))*Math.floor(n/3));
    if(f==='2'){if(has(p,'quills')){R.add+=2*has(p,'quills');cov('card:quills')}if(hasE(p,25)){others(p).forEach(q=>hitSync(q,hasE(p,25),p,'fx'));cov('evo:25');out.push('goofy but deadly')}}}
  if(has(p,'omni')&&c['1']&&c['2']&&c['3']){gainVP(p,2*has(p,'omni'));out.push('2★ munching 1-2-3');cov('card:omni')}
  if(has(p,'spree')&&FACES.every(f=>c[f])){gainVP(p,9*has(p,'spree'));out.push('9★ wrecking spree');cov('card:spree')}
  if(c['1']>=1){if(hasE(p,37)){gainVP(p,hasE(p,37));cov('evo:37')}if(hasE(p,38)){R.add+=hasE(p,38);cov('evo:38')}}
  if(hasE(p,615)&&c['3']===3){const t=mostOf('vp',others(p))[0];if(t){loseVP(t,1);gainVP(p,1);cov('evo:615');out.push('spooky face steals a star')}}
  if(hasE(p,616)&&FACES.some(f=>c[f]===3)){others(p).forEach(q=>hitSync(q,hasE(p,616),p,'fx'));cov('evo:616');out.push('triple thorns')}
  if(G.tf.sneaky.length){for(const s of G.tf.sneaky){const b=s.src==='c'?base(s.id):s.id;
      if(pts>0){others(p).forEach(q=>{const d=loseVP(q,pts);if(b==='m_offp'&&d>0){hitSync(q,d,p,'fx');cov('card:m_offp')}if(b===631&&inCity(q.i)){loseVP(q,1);cov('evo:631')}});cov('kw:Sneaky:hit');out.push(`the others lose ${pts}★ (Slink)`)}
      retireKw(p,s.src,s.id)}G.tf.sneaky=[]}
  if(exOn('tower')&&inT&&c['1']>=4)towerClaim(p);
  if(G.winner){finishResolve(R);return}
  /* energy */
  if(c.E){const e=c.E+(has(p,'w_sky')?c.E*has(p,'w_sky'):0);if(has(p,'w_sky'))cov('wick:sky');R.gotE=gainE(p,e);out.push(`${R.gotE}⚡`)}
  if(G.tf.hungryMug&&c.E===3){G.tf.hungry=true;cov('evo:618')}
  const steps=[];
  /* hearts */
  steps.push(next=>{if(G.tf.think&&c.H===3){heal(p,3);const low=alive().sort((a,b)=>a.hp-b.hp)[0];if(low)heal(low,1);cov('evo:617')}
    if(c.H>0)heartUse(p,c.H,R,next);else next()});
  steps.push(next=>{if(c.H>=3&&G.evoOn)pickEvo(p,false,next);else next()});
  steps.push(next=>{const h=R.healed,e=R.gotE;if(h+e<=0){next();return}
    seq(others(p).filter(q=>inHand(q,625)>=0),(q,nx)=>ask(q.i,evoName(625),`${mname(p)} gained ${plu(h,'heart')} and ${e} energy. Discard ${evoName(625)} to gain the same?`,[{k:'y',l:'Play it'},{k:'n',l:'No'}],()=>h+e>=3?'y':'n',k=>{if(k==='y'){q.hand.splice(q.hand.indexOf(625),1);q.edisc.push(625);heal(q,h);gainE(q,e);cov('evo:625')}nx()}),next)});
  steps.push(next=>{const od=G.dice.filter(d=>d.t==='b'&&d.f==='O').length;if(od){hitSync(p,od,null,'fx');out.push('ouch!');cov('bers:ouch')}next()});
  /* claws */
  steps.push(next=>clawStep(p,R,next));
  /* yield */
  steps.push(next=>yieldStep(p,R,next));
  steps.push(next=>{deaths();next()});
  steps.push(next=>{G.step=3;enterStep(p,R,next)});
  steps.push(next=>{deaths();if(G.tf.hunt)finishHunt(p);next()});
  steps.push(next=>{const woundedCity=R.hitList.some(h=>h.lost>0);if(inHand(p,43)>=0&&woundedCity&&!inCity(p.i)&&!bug)ask(p.i,evoName(43),'You wounded the city and did not move in. Play it to take another turn after this one?',[{k:'y',l:'Play it'},{k:'n',l:'Keep it'}],()=>'y',k=>{if(k==='y'){p.hand.splice(p.hand.indexOf(43),1);p.edisc.push(43);G.tf.jungle=true;cov('evo:43')}next()});else next()});
  steps.push(next=>exAfterResolve(p,R,next));
  steps.push(next=>{if(curseOn('k_false')){const n=new Set(G.dice.filter(d=>!d.t).map(d=>d.f)).size;if(n){hitSync(p,n,null,'fx');cov('curse:false');out.push(`poisoned gift: −${n}♥`)}}next()});
  seq(steps,(f,next)=>{if(G.winner){next();return}f(next)},()=>finishResolve(R))}
function finishResolve(R){const p=R.p;deaths();
  UI.banner=typeof storyBanner==='function'?storyBanner(R):`${R.bug?'🧠 ':''}<b>${esc(mname(p))}</b>${R.bug?' (Brainjack)':''}: ${R.out.length?esc(R.out.join(' · ')):'nothing useful'}`;
  if(R.out.length)lg(p.i,`${mname(p)} resolves${R.bug?' the stolen dice':''}: ${R.out.join(', ')}.`);
  flushQ(()=>{deaths();UI.busy=false;if(G.winner){refresh();return}if(!cur().alive){endTurn();return}G.phase='buy';G.step=4;G.aiSwept=false;refresh()})}
/* heart dice: heal yourself, remove poison/shrink tokens, or (Mending Beam) heal others */
function heartUse(p,h,R,done){const self=canHealDice(p),ray=has(p,'healray')&&!(curseOn('k_osiris')&&!inCity(p.i));let left=h;
  if(!self&&!ray){R.out.push(inCity(p.i)?'hearts wasted (in the city)':'hearts cannot be used');done();return}
  const selfHeal=n=>{const d=heal(p,n+(has(p,'w_sky')?n*has(p,'w_sky'):0));R.healed+=d;if(d){R.out.push(`healed ${d}♥`);if(p.tok.berserk){p.tok.berserk=false;lg(p.i,`${mname(p)} calms down (the rampage is over).`);cov('bers:calm')}}};
  const step=()=>{if(left<=0||!p.alive){done();return}
    const opts=[];if(self)opts.push({k:'self',l:`Heal yourself with ${left===h?'them':'the '+left+' left'}`});
    if(self&&p.tok.poison>0)opts.push({k:'poison',l:`Remove a poison token (${p.tok.poison})`});
    if(self&&p.tok.shrink>0)opts.push({k:'shrink',l:`Remove a shrink token (${p.tok.shrink})`});
    if(ray)others(p).filter(q=>q.hp<maxhp(q)).forEach(q=>opts.push({k:'r'+q.i,l:`Heal ${mname(q)} 1 (it pays you ${Math.min(2,q.en)} ⚡)`}));
    if(opts.length===1&&opts[0].k==='self'){selfHeal(left);left=0;done();return}
    opts.push({k:'done',l:'Leave the rest unused'});
    ask(p.i,'Heart dice',`You have ${left} heart${left===1?'':'s'} to use.`,opts,()=>aiHearts(p,left,opts),k=>{
      if(k==='self'){selfHeal(left);left=0}
      else if(k==='poison'){p.tok.poison--;left--;cov('card:pspit:cure');R.out.push('removes a poison token')}
      else if(k==='shrink'){p.tok.shrink--;left--;cov('card:shrink:cure');R.out.push('removes a shrink token')}
      else if(k[0]==='r'){const q=P(+k.slice(1));const d=heal(q,1);const pay=Math.min(2,q.en);q.en-=pay;p.en+=pay;left--;cov('card:healray');lg(p.i,`${mname(p)}'s Mending Beam heals ${mname(q)} (+${d}♥) for ${pay} energy.`)}
      else left=0;
      step()})};
  step()}
function clawStep(p,R,done){const c=R.c,inT=R.inT;let claws=c.C;const rolled=claws>0;
  let add=R.add+has(p,'acid')+has(p,'m_nobrain')+(inT?has(p,'tunnel'):0)+(rolled?has(p,'barbed')+(inT?has(p,'street'):0):0)+(G.tf.cheer||0);
  if(has(p,'acid'))cov('card:acid');if(has(p,'m_nobrain'))cov('card:m_nobrain');if(inT&&has(p,'tunnel'))cov('card:tunnel');if(rolled&&has(p,'barbed'))cov('card:barbed');if(rolled&&inT&&has(p,'street'))cov('card:street:claw');
  const H=G.tf.hunt;if(H&&H.src==='e'&&H.id===636&&P(H.t).alive&&P(H.t).en===Math.max(...alive().map(q=>q.en))){add+=2;cov('evo:636')}
  let amt=claws+add;if(amt>0&&has(p,'w_anti')){amt*=2;cov('wick:anti')}
  if(G.tf.exotic){G.tf.exotic=false;if(c.C>=3){p.en+=2;G.tf.exoHit=true;cov('evo:26:win')}else{hitSync(p,2,null,'fx');cov('evo:26:lose')}}
  if(rolled&&has(p,'alpha')){gainVP(p,has(p,'alpha'));cov('card:alpha')}
  G.tf.clawsRolled=c.C;
  let tg=[];if(amt>0){if(H&&P(H.t).alive&&H.t!==p.i){tg=[P(H.t)];cov('kw:Hunter:target')}else if(has(p,'nova')){tg=others(p);cov('card:nova')}else tg=inT?others(p).filter(q=>!inCity(q.i)):others(p).filter(q=>inCity(q.i))}
  const items=tg.map(q=>({q,a:amt,src:p,kind:'claw'}));
  if(rolled&&has(p,'scorch'))for(const j of neighbours(p.i)){items.push({q:P(j),a:has(p,'scorch'),src:p,kind:'fx',fire:true});cov('card:scorch')}
  if(!items.length){if(c.C||amt)R.out.push('claws hit nobody');done();return}
  snd('smash');
  hitAll(items,res=>{
    const lostBy={};res.forEach(r=>{if(r.it.kind==='claw'){lostBy[r.q.i]=(lostBy[r.q.i]||0)+r.lost}});
    R.out.push(`smashes ${tg.map(q=>mname(q)+' −'+(lostBy[q.i]||0)).join(', ')||'nobody'}`);
    lg(p.i,`${mname(p)} smashes ${res.map(r=>mname(r.q)+' (−'+r.lost+(r.it.fire?' fire':'')+')').join(', ')}.`);
    tg.forEach(q=>{const l=lostBy[q.i]||0;if(l>0)R.hurt.push(q);if(inCity(q.i))R.hitList.push({j:q.i,lost:l})});
    const woundAny=Object.keys(G.tf.wound[p.i]||{}).length>0;
    if(woundAny&&hasE(p,46)&&!G.tf.alphaMale){G.tf.alphaMale=true;gainVP(p,hasE(p,46));cov('evo:46')}
    if(hasE(p,65)&&!G.tf.doom&&R.hitList.some(h=>h.lost>0)){G.tf.doom=true;others(p).filter(q=>!inCity(q.i)).forEach(q=>hitSync(q,hasE(p,65),p,'fx'));cov('evo:65')}
    R.hurt.forEach(q=>{if(!q.alive)return;if(has(p,'shrink')){q.tok.shrink=(q.tok.shrink||0)+has(p,'shrink');cov('card:shrink')}if(has(p,'pspit')){q.tok.poison=(q.tok.poison||0)+has(p,'pspit');cov('card:pspit')}});
    const post=[];
    if(hasE(p,11)&&p.evo.includes(11)&&!(G.frz&&G.frz.o===p.i)){const cand=R.hurt.filter(q=>q.alive&&inCity(q.i));if(cand.length)post.push(nx=>ask(p.i,evoName(11),'You wounded a monster in the city: hand it your Frost Beam.',cand.map(q=>({k:String(q.i),l:mname(q)})),()=>String(cand.sort((a,b)=>b.vp-a.vp)[0].i),k=>{G.frz={o:p.i,t:+k};cov('evo:11:give');lg(p.i,`${mname(p)} hits ${mname(P(+k))} with its Frost Beam.`);nx()}))}
    if(hasE(p,634))R.hurt.forEach(q=>post.push(nx=>crabClaw(q,p,nx)));
    seq(post,(f,nx)=>f(nx),done)})}
function crabClaw(q,p,done){if(!q.alive){done();return}const L=q.cards.filter(c=>CARDS[base(c)].t!=='W');if(!L.length){done();return}cov('evo:634');
  seq(L,(id,next)=>{if(!q.cards.includes(id)){next();return}const opts=[{k:'d',l:'Discard it'}];if(q.en>=1)opts.unshift({k:'k',l:'Pay 1 energy to keep it'});
    ask(q.i,evoName(634),`${mname(p)}'s pincers grab your ${CN(id)}.`,opts,()=>q.en>=1&&cardKeepValue(q,id)>=2?'k':'d',k=>{if(k==='k')q.en--;else{q.cards.splice(q.cards.indexOf(id),1);G.disc.push(id);onLoseCard(q,id);lg(q.i,`${mname(q)} drops its ${CN(id)}.`)}next()})},()=>{deaths();done()})}
function yieldStep(p,R,done){const canYield=!curseOn('k_ego')&&G.bliz<0;if(!canYield&&R.hitList.some(h=>h.lost>0))cov(curseOn('k_ego')?'curse:ego':'evo:16:noyield');
  const L=R.hitList.filter(h=>h.lost>0&&!R.inT);if(!L.length){done();return}
  seq(L,(h,next)=>{const q=P(h.j);if(!inCity(q.i)){next();return}
    const scurry=inHand(q,42)>=0;const canAsk=canYield&&(q.hp>0||has(q,'vjets')||scurry)&&(q.alive);
    const doYield=(how)=>{leaveCity(q,'yield');if(has(q,'vjets')){q.hp+=h.lost;q.hp=Math.min(q.hp,maxhp(q));fx(q.i,'jets!','heal');cov('card:vjets')}
      else if(how==='scurry'){q.hand.splice(q.hand.indexOf(42),1);q.edisc.push(42);q.hp=Math.min(maxhp(q),q.hp+h.lost);G.tf.safe[q.i]=true;cov('evo:42')}
      if(has(q,'tunnel'))(G.tf.burrow=G.tf.burrow||[]).push(q.i);
      R.yielders.push(q);lg(q.i,`${mname(q)} yields and flees the city.`);fx(q.i,'YIELD','star');next()};
    if(!canAsk){next();return}
    const force=()=>{if(hasE(p,45)&&!inCity(p.i)){ask(p.i,evoName(45),`Force ${mname(q)} to yield the city?`,[{k:'y',l:'Force it out'},{k:'n',l:'Let it choose'}],()=>p.hp>=6?'y':'n',k=>{if(k==='y'){cov('evo:45');lg(p.i,`${mname(p)} bellows spores: ${mname(q)} must leave!`);doYield('force')}else choose()})}else choose()};
    const choose=()=>{const rec=aiYield(q,h.lost);const opts=[{k:'stay',l:`Stay in ${where(q.i)}`,d:`You keep scoring 2 stars at the start of your turn.${rec?'':' Recommended.'}`},{k:'yield',l:'Yield and run!',d:`You leave the city and ${mname(p)} moves in.${has(q,'vjets')?' Your Vapor Jets cancel the damage.':''}${rec?' Recommended.':''}`}];
      if(scurry&&!has(q,'vjets'))opts.push({k:'scurry',l:`Yield with ${evoName(42)}`,d:'You lose no hearts this turn.'});
      ask(q.i,'Stay or yield?',`${mname(p)} smashed you for ${h.lost}. You have ${plu(Math.max(0,q.hp),'heart')} left.`,opts,()=>rec?(scurry&&q.hp<=0?'scurry':'yield'):'stay',k=>{
        if(k==='stay'){if(hasE(q,17)){gainVP(q,hasE(q,17));cov('evo:17:stay')}next()}else doYield(k)})};
    force()},done)}
function enterStep(p,R,done){if(G.winner||!p.alive||inCity(p.i)){done();return}
  const tryOthers=cb=>{if(G.city!==-1){cb();return}let taken=false;
    const cands=others(p).filter(q=>!inCity(q.i)&&((hasE(q,36)&&!G.tf.startIn.includes(q.i))||(inHand(q,41)>=0&&G.tf.cityLeft)));
    seq(cands,(q,next)=>{if(taken||G.city!==-1||!q.alive){next();return}
      const opts=[];if(hasE(q,36)&&!G.tf.startIn.includes(q.i))opts.push({k:'m',l:`Move in (${evoName(36)})`});if(inHand(q,41)>=0&&G.tf.cityLeft)opts.push({k:'r',l:`Play ${evoName(41)} and move in`});opts.push({k:'n',l:'Stay out'});
      ask(q.i,'Downtown is empty',`${mname(p)} is about to move into Downtown. Take it yourself?`,opts,()=>aiGrabCity(q)?opts[0].k:'n',k=>{if(k==='n'){next();return}
        if(k==='r'){q.hand.splice(q.hand.indexOf(41),1);q.edisc.push(41);cov('evo:41')}else cov('evo:36');enterCity(q,'dashes');taken=true;next()})},cb)};
  tryOthers(()=>{if(!G.tf.noEnter&&!inCity(p.i)&&p.alive){if(G.city===-1){enterCity(p,'storms');R.forced='city'}else if(G.bayOn&&G.bay===-1){enterBay(p);R.forced='bay'}}deaths();done()})}
function towerClaim(p){let lv=0;while(lv<3&&G.tower[lv]===p.i)lv++;if(lv>=3)return;const old=G.tower[lv];G.tower[lv]=p.i;fx(p.i,'TOWER '+(lv+1)+'!','star');snd('stomp');cov('tower:'+(lv+1));
  lg(p.i,`${mname(p)} climbs the Crown Spire: level ${lv+1}${old>=0?' (taken from '+mname(P(old))+')':''}!`);
  if(lv===2){G.winner='P'+(p.i+1);G.winText=`Crown Spire: ${mname(p)} reaches the top of the Tower and rules the city!`;G.phase='over';lg(p.i,G.winText)}}
function finishHunt(p){const H=G.tf.hunt;if(!H)return;G.tf.hunt=null;const t=P(H.t);const dead=!t.alive;const b=H.src==='c'?base(H.id):H.id;cov('kw:Hunter:done');
  if(dead){if(b==='m_trap'){gainE(p,5);cov('card:m_trap')}if(b==='m_legend'){gainVP(p,4);cov('card:m_legend')}if(b==='m_spat'){gainVP(p,H.lost);cov('card:m_spat')}}
  if(b==='m_unrel'&&!dead&&t.alive){const j=(G.limbo||[]).indexOf(H.id);if(j>=0)G.limbo.splice(j,1);t.cards.push(H.id);cov('card:m_unrel');lg(p.i,`${mname(p)}'s Wobbly Scope goes to ${mname(t)}.`);return}
  retireKw(p,H.src,H.id)}

/* ---------- losing hearts ---------- */
/* extra damage from the source: Devil Horns, Overdrive Blast, Strange Arms, Lock-On target, Steel Talons */
function hitMods(q,a,src,kind){if(a<=0||!src||src.i===q.i)return a;const act=src.i===G.active;
  if(act&&has(src,'c_devil')){a+=has(src,'c_devil');cov('cost:devil')}
  if(act&&G.tf.mecha){a+=2;cov('evo:61')}
  if(act&&G.tf.exoHit){a+=2;cov('evo:26:hit')}
  if(G.tgt[src.i]===q.i&&hasE(src,68)){a+=hasE(src,68);cov('evo:68:hit')}
  if(act&&a>=3&&hasE(src,67)){a+=hasE(src,67);cov('evo:67')}
  return a}
function immuneNow(q){return !q.alive||G.tf.safe[q.i]||(curseOn('k_skin')&&scarab()===q.i)||(q.hp<=0&&has(q,'c_zombie'))}
/* reactions a monster may choose before losing hearts */
function hitOptions(q,a,src,kind){const o=[];if(a<=0||immuneNow(q))return o;if(a===1&&has(q,'plated'))return o;
  if(has(q,'wings')&&q.en>=2)o.push({k:'wings',l:'Spread your wings (pay 2 ⚡)',d:'No hearts lost for the rest of this turn.'});
  if(inHand(q,51)>=0)o.push({k:'tail',l:`Play ${evoName(51)}`,d:'No hearts lost this turn.'});
  if(inHand(q,42)>=0)o.push({k:'scurry',l:`Play ${evoName(42)}`,d:'No hearts lost this turn.'});
  kwCards(q,['Tough','Poison']).forEach(c=>c.C.kws.forEach(w=>{if(w!=='Tough'&&w!=='Poison')return;if(kind!=='claw'&&!(w==='Tough'&&c.src==='e'&&c.id===635))return;if(w==='Poison'&&(!src||src.i===q.i))return;
    o.push({k:(w==='Tough'?'t:':'p:')+c.src+':'+c.id,l:`${KWN[w].toUpperCase()}: ${c.C.n}`,d:c.C.x})}));
  if(has(q,'c_robot')&&q.en>=1)o.push({k:'robot',l:`Lose ${Math.min(a,q.en)} energy instead of hearts`,d:COSTUMES.c_robot.n});
  return o}
function parseRx(q,k,a){if(k==='wings'||k==='tail'||k==='scurry')return {k};if(k==='robot')return {k:'robot',n:Math.min(a,q.en)};const [t,src,id]=k.split(':');return {k:t==='t'?'tough':'poison',src,id:src==='c'?id:+id}}
function applyLoss(q,a,src,kind,rx){
  if(a<=0||immuneNow(q)){if(a>0&&q.alive&&G.tf.safe[q.i])cov('safe');if(a>0&&curseOn('k_skin')&&scarab()===q.i)cov('curse:skin');return 0}
  if(rx){const C=rx.src==='c'?CARDS[base(rx.id)]:(rx.id?EVO[rx.id]:null);
    if(rx.k==='wings'){q.en-=2;G.tf.safe[q.i]=true;cov('card:wings');fx(q.i,'wings!','heal');lg(q.i,`${mname(q)} spreads its wings: no more hearts lost this turn.`);return 0}
    if(rx.k==='tail'||rx.k==='scurry'){const e=rx.k==='tail'?51:42;q.hand.splice(q.hand.indexOf(e),1);q.edisc.push(e);G.tf.safe[q.i]=true;cov('evo:'+e);fx(q.i,'safe!','heal');lg(q.i,`${mname(q)} plays ${evoName(e)}.`);return 0}
    if(rx.k==='tough'){spendKw(q,rx.src,rx.id);cov('kw:Tough');cov((rx.src==='c'?'card:':'evo:')+(rx.src==='c'?base(rx.id):rx.id));fx(q.i,'HARDENED!','heal');lg(q.i,`${mname(q)} is HARDENED (${C.n}) and loses no hearts.`);const b=rx.src==='c'?base(rx.id):rx.id;
      if(b==='m_earm')gainE(q,a);if(b==='m_ances'){(G.tf.ances=G.tf.ances||{})[q.i]=true}if(b===614&&a===3)heal(q,3);if(b==='m_strange')applyLoss(q,2,q,'fx',null);
      return 0}
    if(rx.k==='robot'){const n=Math.min(rx.n,q.en,a);q.en-=n;a-=n;cov('cost:robot');fx(q.i,'-'+n+'⚡','energy');if(a<=0)return 0}}
  if(a===1&&has(q,'plated')){fx(q.i,'blocked','heal');cov('card:plated');return 0}
  if(has(q,'chameleon')){let s=0;for(let k=0;k<a;k++)if(rnd(6)===5)s++;if(s){a-=s;fx(q.i,'dodged '+s,'heal');cov('card:chameleon')}if(a<=0)return 0}
  const lost=Math.min(a,Math.max(0,q.hp));q.hp=Math.max(0,q.hp-a);fx(q.i,'-'+a+'♥','hurt');
  G.tf.lost[q.i]=(G.tf.lost[q.i]||0)+lost;
  if(src&&src.i!==q.i&&lost>0){const w=G.tf.wound[src.i]=G.tf.wound[src.i]||{};w[q.i]=(w[q.i]||0)+lost;if(src.i===G.active)G.tf.dealt+=lost;if(src.stats&&kind==='claw')src.stats.dmg+=lost;
    if(hasE(q,56)){loseVP(src,hasE(q,56));cov('evo:56')}
    if(has(src,'c_pirate')&&q.en>0){q.en--;src.en++;fx(src.i,'+1⚡','energy');cov('cost:pirate')}
    if(hasE(q,68)&&G.tgt[q.i]!==src.i){G.tgt[q.i]=src.i;cov('evo:68:give');lg(q.i,`${mname(q)} locks on to ${mname(src)}.`)}
    if(G.tf.hunt&&src.i===G.active&&G.tf.hunt.t===q.i&&kind==='claw')G.tf.hunt.lost+=lost}
  if(lost>=2&&has(q,'thick')){gainE(q,has(q,'thick'));cov('card:thick')}
  if(lost>0&&hasE(q,66)){let n=0;for(let k=0;k<lost;k++)if(rnd(6)===4)n++;const a2=cur();cov('evo:66');if(n&&a2.i!==q.i&&a2.alive)applyLoss(a2,n,q,'fx',null)}
  if(rx&&rx.k==='poison'){spendKw(q,rx.src,rx.id);const b=rx.src==='c'?base(rx.id):rx.id;cov('kw:Poison');cov((rx.src==='c'?'card:':'evo:')+b);fx(q.i,'VENOM!','hurt');
    if(src&&src.i!==q.i&&lost>0&&src.alive){lg(q.i,`${mname(q)}'s VENOM (${CARDS[b]?CARDS[b].n:evoName(b)}) strikes back at ${mname(src)}.`);applyLoss(src,lost,q,'fx',null);
      if(b==='m_petal')loseVP(src,lost);if(b==='m_whip')loseE(src,lost);if(b==='m_cryst'){(G.tf.cryst=G.tf.cryst||{})[q.i]={s:src.i,l:lost}}
      if(b===637&&lost>=3)others(q).forEach(r=>applyLoss(r,1,q,'fx',null))}}
  return lost}
/* the async version: humans are asked about reactions */
function hitAll(items,done){const res=[];
  seq(items,(it,next)=>{const q=it.q,src=it.src;let a=hitMods(q,it.a,src,it.kind);
    const go=rx=>{res.push({q,lost:applyLoss(q,a,src,it.kind,rx),it});next()};
    if(!q.alive||a<=0){res.push({q,lost:0,it});next();return}
    const opts=()=>{const o=hitOptions(q,a,src,it.kind);if(!o.length){go(null);return}
      ask(q.i,'You are about to lose hearts',`${src&&src.i!==q.i?mname(src):'An effect'} is about to make you lose ${a} heart${a===1?'':'s'} (you have ${q.hp}).`,[{k:'take',l:'Take it'},...o],()=>aiHit(q,a,src,it.kind,o),k=>go(k==='take'?null:parseRx(q,k,a)))};
    if(src&&src.i===G.active&&it.kind==='claw'&&hasE(src,35)&&inCity(q.i)&&a>=2&&!immuneNow(q))
      ask(src.i,evoName(35),`${mname(q)} must lose ${plu(a,'heart')}. Make it lose 2 fewer and take 1 star and 1 energy from it instead?`,[{k:'y',l:'Leash it'},{k:'n',l:'Full damage'}],()=>aiFood(src,q,a)?'y':'n',k=>{if(k==='y'){a-=2;gainVP(src,loseVP(q,1));src.en+=loseE(q,1);cov('evo:35')}opts()});
    else opts()},()=>done(res))}
/* the immediate version (start/end-of-turn effects and chain reactions): reactions are picked automatically */
function hitSync(q,a,src,kind){a=hitMods(q,a,src,kind);if(!q.alive||a<=0)return 0;const o=hitOptions(q,a,src,kind);const k=o.length?aiHit(q,a,src,kind,o):'take';return applyLoss(q,a,src,kind,k==='take'?null:parseRx(q,k,a))}

/* ---------- the city ---------- */
function onTakeCity(p,why){snd('stomp');const b=1+hasE(p,17)+hasE(p,47);if(hasE(p,17))cov('evo:17');if(hasE(p,47))cov('evo:47');const g=gainVP(p,b);lg(p.i,`${mname(p)} ${why||'storms'} into ${where(p.i)} (+${g} star${g===1?'':'s'}).`);
  if(G.tf.burrow&&G.tf.burrow.length){G.tf.burrow.forEach(j=>{const y=P(j);if(y.alive&&y.i!==p.i&&has(y,'tunnel')){hitSync(p,has(y,'tunnel'),y,'fx');cov('card:tunnel:yield');lg(y.i,`${mname(y)}'s tunnels collapse under ${mname(p)}.`)}});G.tf.burrow=[]}}
function enterCity(p,why){if(G.city>=0&&G.city!==p.i){const o=P(G.city);lg(o.i,`${mname(o)} is pushed out of Downtown.`);leaveCity(o,'kick')}
  if(G.bay===p.i){G.bay=-1;G.city=p.i;lg(p.i,`${mname(p)} moves up from the Harbor to Downtown.`);return}G.city=p.i;onTakeCity(p,why)}
function enterBay(p){G.bay=p.i;onTakeCity(p,'wades')}
function leaveCity(q,why){if(!inCity(q.i))return;const wasCity=G.city===q.i;if(wasCity)G.city=-1;if(G.bay===q.i)G.bay=-1;if(wasCity&&G.tf)G.tf.cityLeft=true;
  if(q.evo.includes(48)){dropEvo(q,48);const d=q.vp;q.vp=0;if(d)fx(q.i,'-'+d+'★','star');cov('evo:48:lost');lg(q.i,`${mname(q)} leaves the city and its crown of mould crumbles: it loses all its stars.`)}
  if(hasE(q,624)&&q.alive&&why!=='ko')later(next=>{if(!q.alive){next();return}ask(q.i,evoName(624),'You left the city: gain 2 energy or 2 hearts?',[{k:'e',l:'2 energy'},{k:'h',l:'2 hearts'}],()=>q.hp<=6?'h':'e',k=>{if(k==='h')heal(q,2);else gainE(q,2);cov('evo:624');next()})})}
/* Skydive Stomp and the curses: take control of Downtown, everyone else leaves the city */
function takeOver(p,why){if(G.bay>=0&&G.bay!==p.i)leaveCity(P(G.bay),'kick');if(G.city>=0&&G.city!==p.i){lg(G.city,`${mname(P(G.city))} is stomped out of Downtown.`);leaveCity(P(G.city),'kick')}
  if(G.bay===p.i){G.bay=-1;G.city=p.i;lg(p.i,`${mname(p)} moves up to Downtown.`)}else if(G.city!==p.i)enterCity(p,why)}

/* ---------- knock-outs and winning ---------- */
function deaths(){G.pl.forEach(q=>{if(q.alive&&q.hp>maxhp(q))q.hp=maxhp(q)});let again=true,guard=0;
  while(again&&guard++<20){again=false;
  for(const q of G.pl){if(!q.alive||q.hp>0)continue;
    if(has(q,'c_zombie')){q.hp=0;if(!q.tok.zomb){q.tok.zomb=1;cov('cost:zombie');lg(q.i,`${mname(q)} is at 0 hearts but keeps shambling on (Zombie Makeup).`)}continue}
    while(q.hp<=0&&has(q,'mend')&&q.en>=2){q.en-=2;if(!heal(q,1))break;fx(q.i,'mend!','heal');cov('card:mend')}
    while(q.hp<=0&&G.tf.ances&&G.tf.ances[q.i]&&q.en>=2){q.en-=2;if(!heal(q,1))break;cov('card:m_ances')}
    while(q.hp<=0&&q.cult>0){q.cult--;if(!heal(q,1))break;fx(q.i,'cultist!','heal');cov('cult:save')}
    if(q.hp>0){lg(q.i,`${mname(q)} patches itself up and survives!`);continue}
    again=true;
    for(const r of G.pl)if(r.alive&&r.i!==q.i){if(has(r,'carrion')){gainVP(r,3*has(r,'carrion'));cov('card:carrion');lg(r.i,`${mname(r)} feasts on the wreckage (+3 stars).`)}if(hasE(r,63)){gainVP(r,3*hasE(r,63));gainE(r,2*hasE(r,63));cov('evo:63')}}
    if(G.winner)return;
    const hyT=q.hand.indexOf(611),hyP=hasE(q,612)?q.evo.indexOf(612):-1;
    if(G.evoOn&&(hyP>=0||hyT>=0)){if(hyP>=0){q.evo.splice(hyP,1);q.edisc.push(612)}else{q.hand.splice(hyT,1);q.edisc.push(611)}q.hp=3;q.dmod=(q.dmod||0)+1;cov('evo:611');fx(q.i,'REGROW!','heal');lg(q.i,`${mname(q)} regrows (${evoName(611)}): 3 hearts, one die fewer from now on.`);continue}
    if(G.evoOn&&q.hand.includes(31)){q.hand.splice(q.hand.indexOf(31),1);q.edisc.push(31);leaveCity(q,'ko');G.disc.push(...q.cards.filter(c=>CARDS[base(c)].t!=='W'));q.cards=q.cards.filter(c=>CARDS[base(c)].t==='W');q.edisc.push(...q.evo,...q.hand);q.evo=[];q.hand=[];q.tok={};q.en=0;q.vp=0;q.hp=9;q.vp=9;cov('evo:31');fx(q.i,'REBOOT!','heal');lg(q.i,`${mname(q)} reboots with 9 hearts and 9 stars!`);continue}
    if(has(q,'egg')){leaveCity(q,'ko');G.disc.push(...q.cards.filter(c=>CARDS[base(c)].t!=='W'));q.cards=q.cards.filter(c=>CARDS[base(c)].t==='W');q.vp=0;q.hp=10;q.tok={};cov('card:egg');lg(q.i,`${mname(q)} falls, but a new ${mname(q)} hatches from the Egg Clutch with 10 hearts and no stars!`);fx(q.i,'HATCH!','heal');continue}
    if(has(q,'w_last')&&q.vp>=16&&!G.winner){G.winner='P'+(q.i+1);G.winText=`${mname(q)} is knocked out with ${q.vp} stars and wins anyway!`;G.phase='over';return}
    q.alive=false;q.hp=0;leaveCity(q,'ko');G.disc.push(...q.cards.filter(c=>CARDS[base(c)].t!=='W'));q.cards=[];q.en=0;q.edisc.push(...q.hand);q.hand=[];q.cult=0;
    if(G.tower)G.tower=G.tower.map(o=>o===q.i?-1:o);if(G.frz&&(G.frz.t===q.i||G.frz.o===q.i))G.frz=null;
    lg(q.i,`${mname(q)} is knocked out!`);fx(q.i,'K.O.','hurt');const a=cur();if(a&&a.stats&&a!==q)a.stats.kos++;
    const cr=G.tf.cryst&&G.tf.cryst[q.i];if(cr&&P(cr.s).alive){cov('card:m_cryst');lg(q.i,`${mname(q)}'s Blast Geode explodes!`);applyLoss(P(cr.s),2*cr.l,q,'fx',null);delete G.tf.cryst[q.i]}
  }}
  if(G.bayOn&&alive().length<=4){G.bayOn=false;lg(-1,'Only four monsters remain: the Harbor closes.');
    if(G.bay>=0){const b=G.bay;G.bay=-1;if(G.city===-1){G.city=b;lg(b,`${mname(P(b))} moves from the Harbor to Downtown.`)}else{lg(b,`${mname(P(b))} is washed out of the Harbor.`);const q=P(b);G.bay=b;leaveCity(q,'close')}}}
  checkWin(false)}
const winAt=p=>has(p,'c_astro')?17:20;
function checkWin(final){
  if(G.winner)return true;const a=alive();
  if(a.length===0){G.winner='draw';G.winText='Everyone falls: the city wins, nobody is crowned.';G.phase='over';lg(-1,G.winText);return true}
  if(a.length===1){G.winner='P'+(a[0].i+1);G.winText=`Last standing: ${mname(a[0])} is the only monster left and takes the crown!`;G.phase='over';lg(a[0].i,G.winText);return true}
  const ast=a.find(p=>has(p,'c_astro')&&p.vp>=17);if(ast){G.winner='P'+(ast.i+1);G.winText=`Space Helmet: ${mname(ast)} reaches ${ast.vp} stars (only 17 needed) and is crowned!`;G.phase='over';cov('cost:astro');lg(ast.i,G.winText);return true}
  if(final){const w=a.filter(p=>p.vp>=20);if(w.length){w.sort((x,y)=>(y.i===G.active)-(x.i===G.active)||y.vp-x.vp);G.winner='P'+(w[0].i+1);G.winText=`20 stars: ${mname(w[0])} reaches ${w[0].vp} stars and is crowned!`;G.phase='over';lg(w[0].i,G.winText);return true}}
  return false}

/* ---------- Curses: the Omen Die ---------- */
function newCurse(){if(G.lockCurse){cov('curse:new');return}if(G.curse)G.curseDisc.push(G.curse);if(!G.curseDeck.length){G.curseDeck=shuffle(G.curseDisc);G.curseDisc=[]}G.curse=G.curseDeck.pop();cov('curse:new');
  lg(-1,`The curse becomes ${CURSES[G.curse].n}: ${CURSES[G.curse].x}`);if(G.curse==='k_ra')G.pl.forEach(q=>{if(q.hp>8)q.hp=8})}
function discardKeep(p,title,done){const L=p.cards.filter(c=>CARDS[base(c)].t==='K');if(!L.length){done();return}
  ask(p.i,title,'Discard one of your Keep cards.',L.map(c=>({k:c,l:CN(c)})),()=>L.slice().sort((a,b)=>cardKeepValue(p,a)-cardKeepValue(p,b))[0],k=>{p.cards.splice(p.cards.indexOf(k),1);G.disc.push(k);onLoseCard(p,k);lg(p.i,`${mname(p)} discards ${CN(k)}.`);deaths();done()})}
function fateStep(p,done){const fd=G.dice.find(d=>d.t==='f');if(!exOn('curse')||!fd||G.tf.fateDone){done();return}G.tf.fateDone=true;
  const K=G.curse,C=CURSES[K];
  if(fd.f==='FE'){fx(p.i,'NEW CURSE','star');newCurse();done();return}
  if(fd.f==='FW'){cov('fate:river');done();return}
  const good=fd.f==='FA';fx(p.i,good?'ANKH!':'SNAKE!',good?'heal':'hurt');lg(p.i,`${good?'Ankh':'Snake'} (${C.n}): ${good?C.a:C.s}`);cov('curse:'+K.slice(2)+(good?':a':':s'));
  const clawsRolled=G.dice.filter(d=>d.f==='C'||d.f==='C2').reduce((a,d)=>a+(d.f==='C2'?2:1),0);
  const takeScarab=q=>{G.scarab=q.i;lg(q.i,`${mname(q)} takes the Brass Beetle.`);cov('scarab')};
  const noEnter=()=>{leaveCity(p,'curse');G.tf.noEnter=true};
  if(good)switch(K){
    case 'k_ego':case 'k_osiris':if(K==='k_ego')noEnter();else takeOver(p,'marches');break;
    case 'k_isis':case 'k_thot':case 'k_tut':case 'k_hotep':case 'k_library':case 'k_confuse':case 'k_skin':takeScarab(p);break;
    case 'k_sand':if(!G.bug){G.phase='roll';G.rolls=1;fd.fz=true;G.tf.skipWin=true;UI.banner='Ankh: take one more reroll, then resolve.';lg(p.i,`${mname(p)} gets one more reroll.`);done();return}break;
    case 'k_flood':askFace(p.i,C.n,'Add an extra die showing the face of your choice.',FACES,()=>aiBestFace(p),f=>{G.dice.push({f,k:true,x:true});done()});return;
    case 'k_set':case 'k_ra':case 'k_mighty':heal(p,2);break;
    case 'k_build':if(!inCity(p.i)&&!G.bug)G.tf.builders=true;break;
    case 'k_offer':{const c=draw();if(c){lg(p.i,`${mname(p)} takes ${CN(c)} for free.`);acquire(p,c,false,()=>{deaths();done()});return}}break;
    case 'k_horus':gainVP(p,clawsRolled);break;
    case 'k_wealthy':gainVP(p,2);break;case 'k_spirit':gainE(p,2);break;
    case 'k_khepri':ask(p.i,C.n,'Give the Brass Beetle to any monster.',alive().map(q=>({k:String(q.i),l:mname(q)})),()=>String(p.i),k=>{takeScarab(P(+k));done()});return;
    case 'k_ka':G.tf.kaOff=true;break;
    case 'k_false':{let left=2;const one=()=>{if(left--<=0){done();return}askDie(p.i,C.n,`Pick a die to reroll or discard (${left+1} left).`,d=>d.t!=='f',()=>aiWorstDie(p),k=>{if(k<0){done();return}
      ask(p.i,C.n,`Die ${k+1} shows ${fname(G.dice[k].f)}.`,[{k:'r',l:'Reroll it'},{k:'d',l:'Discard it'}],()=>'r',a=>{if(a==='r')G.dice[k].f=faceOf(G.dice[k]);else G.dice.splice(k,1);one()})},true)};one();return}
    case 'k_sphinx':if(G.evoOn)ask(p.i,C.n,'Draw an evolution card or gain 3 energy?',[{k:'e',l:'Draw an evolution'},{k:'n',l:'Gain 3 energy'}],()=>'n',k=>{if(k==='e'){const e=evoTop(p);if(e!==undefined)p.hand.push(e)}else gainE(p,3);done()});else{gainE(p,3);done()}return;
    case 'k_scribe':gainE(p,G.dice.filter(d=>d.f==='1').length);break;
  }else switch(K){
    case 'k_ego':takeOver(p,'is dragged');break;
    case 'k_osiris':noEnter();break;
    case 'k_isis':hitSync(p,1,null,'fx');break;case 'k_thot':loseE(p,2);break;case 'k_tut':loseVP(p,2);break;
    case 'k_sand':G.tf.noClaw=true;break;
    case 'k_flood':askDie(p.i,C.n,'Discard one of your dice.',d=>d.t!=='f',()=>aiWorstDie(p),k=>{if(k>=0)G.dice.splice(k,1);done()});return;
    case 'k_hotep':loseE(p,clawsRolled);break;
    case 'k_set':hitSync(p,1,null,'fx');break;case 'k_build':loseVP(p,2);break;
    case 'k_offer':case 'k_library':discardKeep(p,C.n,done);return;
    case 'k_ra':hitSync(p,2,null,'fx');break;
    case 'k_horus':hitSync(p,clawsRolled,null,'fx');break;
    case 'k_mighty':mostOf('hp').forEach(q=>hitSync(q,1,null,'fx'));break;case 'k_wealthy':mostOf('vp').forEach(q=>loseVP(q,1));break;case 'k_spirit':mostOf('en').forEach(q=>loseE(q,1));break;
    case 'k_confuse':G.tf.redirect=p.i;break;
    case 'k_skin':{const s=scarab();if(s<0||s===p.i)break;const h=P(s);let left=2;const one=()=>{if(left--<=0){deaths();done();return}const opts=[['h','1 heart',p.hp>0],['e','1 energy',p.en>0],['v','1 star',p.vp>0]].filter(o=>o[2]).map(o=>({k:o[0],l:'Give '+o[1]}));if(!opts.length){done();return}
      ask(p.i,C.n,`Give the Brass Beetle holder (${mname(h)}) something (${left+1} left).`,opts,()=>p.en>0?'e':p.vp>0?'v':'h',k=>{if(k==='h'){p.hp--;heal(h,1)}else if(k==='e'){loseE(p,1);h.en++}else{loseVP(p,1);gainVP(h,1)}one()})};one();return}
    case 'k_khepri':takeScarab(p);break;
    case 'k_ka':G.tf.kaFlip=true;break;
    case 'k_false':{const l=P(nextAlive(p.i));let left=2;const one=()=>{if(left--<=0){done();return}askDie(l.i,C.n,`Pick one of ${mname(p)}'s dice for it to reroll (${left+1} left).`,d=>d.t!=='f',()=>aiMeddle(l,p),k=>{if(k<0){done();return}G.dice[k].f=faceOf(G.dice[k]);one()},false)};one();return}
    case 'k_sphinx':{const ev=[...p.hand.map(e=>({e,w:'h'})),...p.evo.map(e=>({e,w:'p'}))];if(!ev.length||!G.evoOn){loseE(p,3);break}
      ask(p.i,C.n,'Discard an evolution card or lose 3 energy.',[...ev.map((x,j)=>({k:'x'+j,l:`Discard ${evoName(x.e)}`})),{k:'n',l:'Lose 3 energy'}],()=>p.en>=3?'n':'x0',k=>{if(k==='n')loseE(p,3);else{const x=ev[+k.slice(1)];const arr=x.w==='h'?p.hand:p.evo;arr.splice(arr.indexOf(x.e),1);p.edisc.push(x.e)}done()});return}
    case 'k_scribe':{const k=G.dice.findIndex(d=>d.f==='1'&&!d.fz);if(k>=0)G.dice.splice(k,1);break}
  }
  deaths();done()}

/* ---------- buying ---------- */
function buyOK(p,id){const b=base(id);if(curseOn('k_library')&&scarab()!==p.i)return false;if(b==='m_free'&&p.mb>0)return false;if(b==='m_mirac'&&p.hp>3)return false;
  if(b==='m_treas'&&!G.disc.some(x=>CARDS[base(x)].t==='C'))return false;return true}
function canBuy(p,k){const id=G.market[k];return !!id&&buyOK(p,id)&&p.en>=costOf(p,id)}
/* pay for and take a market card; done() is called after its effect */
function buyCore(p,k,done){const id=G.market[k];if(!id||!canBuy(p,k)){done();return}
  const full=costOf(p,id);const half=Math.ceil(full/2);
  const pay=(c,ufo)=>{p.en-=c;G.market[k]=null;refill();snd('buy');cov('buy');if(p.i===G.active)G.tf.bought=true;if(ufo){(p.tok.ufo=p.tok.ufo||[]).push(id);cov('evo:28')}
    lg(p.i,`${mname(p)} buys “${CN(id)}”${ufo?' at half price ('+evoName(28)+')':''}.`);UI.banner=`<b>${esc(mname(p))}</b> buys ${esc(CN(id))}`;acquire(p,id,true,done)};
  if(hasE(p,28)&&CARDS[base(id)].t==='K'&&(p.tok.ufo||[]).length<3&&half<full)ask(p.i,evoName(28),`Pay ${half} instead of ${full} and put a barnacle token on it (roll each turn: a claw loses it)?`,[{k:'h',l:`Pay ${half} (saucer)`},{k:'f',l:`Pay ${full}`}],()=>full>=4?'h':'f',k=>pay(k==='h'?half:full,k==='h'));
  else pay(full,false)}
function buy(k){const p=cur();if(!canBuy(p,k))return;buyCore(p,k,()=>afterBuy(p))}
function afterBuy(p){deaths();flushOpp(()=>flushQ(()=>{deaths();if(G.winner){refresh();return}if(!cur().alive){endTurn();return}refresh()}))}
/* Bargain Hunter: newly revealed cards may be bought at once by other monsters */
function flushOpp(done){const L=(G.revealed||[]).splice(0);if(!L.length){done();return}
  seq(L,(id,next)=>{const holders=[];const n=G.pl.length;for(let k=1;k<n;k++){const q=G.pl[(G.active+k)%n];if(q.alive&&has(q,'opp'))holders.push(q)}
    seq(holders,(q,nx)=>{const k=G.market.indexOf(id);if(k<0||!canBuy(q,k)){nx();return}
      ask(q.i,CARDS.opp.n,`${CN(id)} was just revealed: ${CARDS[base(id)].x} Buy it now for ${costOf(q,id)} energy?`,[{k:'y',l:'Buy it now'},{k:'n',l:'No'}],()=>cardValue(q,id)>0.5?'y':'n',a=>{if(a==='y'){cov('card:opp');buyCore(q,k,()=>{deaths();nx()})}else nx()})},next)},
    ()=>{if(G.revealed&&G.revealed.length)flushOpp(done);else done()})}
function acquire(p,id,bought,done){const b=base(id),C=CARDS[b];
  if(bought&&has(p,'news')){gainVP(p,has(p,'news'));cov('card:news')}
  if(bought&&p.stats)p.stats.cards++;
  if(C.t==='D'){G.disc.push(id);playDiscard(p,b,done);return}
  p.cards.push(id);
  if(b==='growth')heal(p,2);if(b==='smoke')p.tok.smoke=3;if(b==='cell')p.tok.cell=6;
  if(b==='mimic'){const t=mimicTargets(p);if(t.length){ask(p.i,CARDS.mimic.n,'Pick a Keep card to copy.',t.map(x=>({k:x.o+':'+x.id,l:`${CN(x.id)} (${mname(P(x.o))})`,d:CARDS[base(x.id)].x})),()=>aiMimic(p,t,false),k=>{setMimic(p,k);done()});return}}
  done()}
function mimicTargets(p){const L=[];G.pl.forEach(q=>{if(!q.alive)return;q.cards.forEach(id=>{const b=base(id);if(CARDS[b].t==='K'&&b!=='mimic'&&!(p.tok.mim&&p.tok.mim.id===id))L.push({o:q.i,id})})});return L}
function setMimic(p,k){const j=k.indexOf(':');p.tok.mim={o:+k.slice(0,j),id:k.slice(j+1)};cov('card:mimic');lg(p.i,`${mname(p)}'s Copycat Gland copies ${CN(p.tok.mim.id)}.`)}
function playDiscard(p,b,done){const oth=others(p);const fin=()=>{deaths();done()};cov('card:'+b);
  const hits=(list,a)=>hitAll(list.map(q=>({q,a,src:p,kind:'fx'})),()=>fin());
  switch(b){
    case 'kiosk':gainVP(p,1);break;case 'train':gainVP(p,2);break;case 'tower':gainVP(p,3);break;case 'needle':gainVP(p,4);break;
    case 'sirens':oth.forEach(q=>loseVP(q,5));break;
    case 'surge':gainE(p,9);break;
    case 'flame':hits(oth,2);return;
    case 'refinery':gainVP(p,2);hits(oth,3);return;
    case 'patch':heal(p,2);break;
    case 'carpet':hits(alive(),3);return;
    case 'jetsq':gainVP(p,5);hits([p],4);return;
    case 'militia':gainVP(p,2);hits([p],2);return;
    case 'reactor':gainVP(p,2);heal(p,3);break;
    case 'tanks':gainVP(p,4);hits([p],3);return;
    case 'cyclone':gainVP(p,2);oth.forEach(q=>loseE(q,Math.floor(q.en/2)));break;
    case 'rush':if(G.bug)break;if(p.i===G.active)G.tf.frenzy=true;else(G.tf.oppFrenzy=G.tf.oppFrenzy||[]).push(p.i);lg(p.i,`${mname(p)} will take another turn after this one.`);break;
    case 'skydive':gainVP(p,2);if(!G.tf.noEnter)takeOver(p,'drops from the sky');break;
    case 'm_bug':gainMB(p,1);break;
    case 'm_dysf':hits(alive().filter(q=>q.mb>0),3);return;
    case 'm_mirac':p.vp=0;p.hp=Math.max(p.hp,Math.min(10,maxhp(p)));gainMB(p,1);lg(p.i,`${mname(p)} is reborn: back to 10 hearts, no stars.`);break;
    case 'm_treas':{const cs=G.disc.filter(x=>CARDS[base(x)].t==='C');const ok=cs.filter(x=>p.en>=Math.max(0,costOf(p,x)-3));if(!ok.length){lg(p.i,'Nothing affordable in the loot.');break}
      ask(p.i,CARDS.m_treas.n,'Buy a consumable card from the discard pile for 3 energy less.',[...ok.map(x=>({k:x,l:`${CN(x)} (${Math.max(0,costOf(p,x)-3)} ⚡)`,d:CARDS[base(x)].x})),{k:'n',l:'None'}],()=>ok.slice().sort((a,c)=>cardValue(p,c)-cardValue(p,a))[0],k=>{if(k!=='n'){p.en-=Math.max(0,costOf(p,k)-3);G.disc.splice(G.disc.indexOf(k),1);p.cards.push(k);cov('card:m_treas:buy');lg(p.i,`${mname(p)} digs up ${CN(k)}.`)}fin()});return}
  }
  fin()}
function sweep(){const p=cur();if(p.en<2||!G.market.length)return;p.en-=2;G.disc.push(...G.market);G.market=[];refill();cov('sweep');lg(p.i,`${mname(p)} pays 2 energy to sweep the market.`);afterBuy(p)}
function mend(){const p=cur();if(!has(p,'mend')||p.en<2||p.hp>=maxhp(p))return;p.en-=2;heal(p,1);cov('card:mend');lg(p.i,`${mname(p)} uses Quick Mend.`);refresh()}

/* ---------- evolutions ---------- */
const EVO_STAYS=[14,16,34,61,617,618,623];
function evoUsable(p,k){const e=p.hand[k];if(e===undefined||!G.evoOn||p!==cur()||G.winner||UI.busy)return false;const E=EVO[e];if(!['roll','buy'].includes(G.phase))return false;
  if(E.w==='perm')return e!==18||mirrorTargets(p).length>0;
  if(E.w==='city')return inCity(p.i);
  if(E.w==='roll')return G.phase==='roll';
  if(E.w==='now'){if(e===23)return (G.tf.lost[p.i]||0)>0;if(e===62)return G.phase==='buy'&&(G.tf.clawsRolled||0)>0;if(e===621)return p.en>=6;if(e===633)return others(p).some(q=>q.edeck.length+q.edisc.length>0);if(e===13||e===22)return G.deck.length+G.disc.length>0;return true}
  return false}
function mirrorTargets(p){const L=[];G.pl.forEach(q=>{if(q.alive)q.evo.forEach(e=>{if(EVO[e].t==='P'&&e!==18&&!(q.i===p.i&&false))L.push({o:q.i,e})})});return L}
function playEvo(p,k){if(!evoUsable(p,k))return;UI.busy=true;playEvoNow(p,k,()=>{UI.busy=false;deaths();flushQ(()=>{if(G.winner){refresh();return}if(!cur().alive){endTurn();return}refresh()})})}
function playEvoNow(p,k,done){const e=p.hand.splice(k,1)[0];const E=EVO[e];cov('evo:'+e);
  lg(p.i,`${mname(p)} plays its evolution “${E.n}”.`);fx(p.i,'EVOLVE!','heal');UI.banner=`🧬 <b>${esc(mname(p))}</b> evolves: ${esc(E.n)}`;
  if(E.t==='P'||EVO_STAYS.includes(e))p.evo.push(e);else p.edisc.push(e);
  const oth=others(p);
  switch(e){
    case 18:{const t=mirrorTargets(p);ask(p.i,E.n,'Pick a permanent evolution to copy.',t.map(x=>({k:x.o+':'+x.e,l:`${evoName(x.e)} (${mname(P(x.o))})`,d:evoText(x.e)})),()=>{const b=t.slice().sort((a,c)=>(EVOV[c.e]||3)-(EVOV[a.e]||3))[0];return b.o+':'+b.e},kk=>{const [o,x]=kk.split(':');p.tok.icy={o:+o,e:+x};lg(p.i,`${mname(p)} mirrors ${evoName(+x)}.`);done()});return}
    case 24:p.tok.adapt=3;break;
    case 13:{const top=[];for(let j=0;j<3;j++){const c=G.deck.pop();if(c)top.push(c)}if(!top.length)break;G.limbo=(G.limbo||[]).concat(top);
      ask(p.i,E.n,'Pick a card to play for free. The others go to the bottom of the deck.',top.map(c=>({k:c,l:`${CN(c)} (${CARDS[base(c)].c})`,d:CARDS[base(c)].x})),()=>top.slice().sort((a,b)=>cardValue(p,b)+costOf(p,b)-cardValue(p,a)-costOf(p,a))[0],c=>{
        G.limbo=G.limbo.filter(x=>!top.includes(x));top.filter(x=>x!==c).forEach(x=>G.deck.unshift(x));acquire(p,c,false,done)});return}
    case 14:G.cold=p.i;break;
    case 16:G.bliz=p.i;break;
    case 21:gainVP(p,2);break;
    case 22:{let n=G.deck.length+G.disc.length,got=null;const junk=[];while(n-->0){const c=draw();if(!c)break;const C=CARDS[base(c)];if(C.t==='K'&&C.c<=4){got=c;break}junk.push(c)}G.disc.push(...junk);if(got){lg(p.i,`${mname(p)} drops in ${CN(got)}.`);acquire(p,got,false,done);return}break}
    case 23:gainE(p,G.tf.lost[p.i]||0);break;
    case 32:seq(oth,(q,next)=>{const opts=[];if(q.en>0)opts.push({k:'e',l:'Give 1 energy'});if(q.vp>0)opts.push({k:'v',l:'Give 1 star'});if(!opts.length){next();return}
      ask(q.i,E.n,`${mname(p)} purrs: give it 1 energy or 1 star.`,opts,()=>q.en>0&&(q.vp>=12||q.en>=3||!q.vp)?'e':(q.vp>0?'v':'e'),kk=>{if(kk==='e'){q.en--;p.en++}else{loseVP(q,1);gainVP(p,1)}next()})},done);return;
    case 33:hitAll(oth.map(q=>({q,a:1,src:p,kind:'fx'})),()=>done());return;
    case 44:heal(p,2);break;
    case 52:gainE(p,2);heal(p,1);break;
    case 53:oth.forEach(q=>loseVP(q,2));break;
    case 54:{const present=[...new Set(G.dice.filter(d=>!d.t&&!d.fz).map(d=>d.f))];if(!present.length)break;
      askFace(p.i,E.n,'Pick the face to change.',present,()=>aiShiftFrom(p),from=>askFace(p.i,E.n,`Turn every ${fname(from)} into:`,FACES.filter(f=>f!==from),()=>aiShiftTo(p,from),to=>{G.dice.forEach(d=>{if(!d.t&&!d.fz&&d.f===from)d.f=to});lg(p.i,`${mname(p)} turns its ${fname(from)}s into ${fname(to)}s.`);done()}));return}
    case 61:G.tf.mecha=true;break;
    case 62:gainE(p,G.tf.clawsRolled||0);break;
    case 617:G.tf.think=true;break;
    case 618:G.tf.hungryMug=true;break;
    case 621:p.en-=6;gainMB(p,1);break;
    case 633:{const t=oth.filter(q=>q.edeck.length+q.edisc.length>0);ask(p.i,E.n,'Draw the top card of whose evolution deck?',t.map(q=>({k:String(q.i),l:mname(q)})),()=>String(t[0].i),kk=>{const q=P(+kk);const x=evoTop(q);if(x!==undefined){p.hand.push(x);lg(p.i,`${mname(p)} steals an evolution from ${mname(q)}'s deck.`)}done()});return}
    case 34:G.tf.catnip=true;G.rolls=0;break;
    case 64:G.tf.skip=true;heal(p,4);gainE(p,2);break;
  }
  done()}
/* rough values the computer gives evolutions */
const EVOV={11:4,12:3,15:1,17:4,18:4,24:3,25:3,26:2,27:3,28:4,35:3,36:3,37:4,38:5,45:3,46:5,47:5,48:3,55:4,56:3,57:5,58:4,63:4,65:4,66:3,67:4,68:3,612:5,613:3,615:3,616:4,622:3,624:3,626:3,632:3,634:4};

/* ---------- actions on your turn (buttons for humans; the computer calls the same code) ---------- */
function onceUsed(k){return !!G.tf.uses[k]}
function useOnce(k){G.tf.uses[k]=1}
function actionsFor(p){const A=[];const roll=G.phase==='roll',buy=G.phase==='buy';if(!roll&&!buy)return A;const nk=G.dice.filter(d=>!d.k).length;
  const add=(a,l,dis,sm,cls)=>A.push({a,l,dis:!!dis,sm:sm||'',cls:cls||''});
  if(roll){
    if(has(p,'mind'))add('mind','Mind Link reroll',p.en<1||!nk,'pay 1 ⚡');
    if(has(p,'smoke')&&p.tok.smoke>0)add('smoke','Smoke reroll',!nk,`${p.tok.smoke} puffs left`);
    if(has(p,'lurker'))add('lurker','Reroll a 3',!G.dice.some(d=>d.f==='3'&&!noReroll(d)),'Alley Lurker');
    if(has(p,'pack'))add('pack','Make a die a 1',onceUsed('pack'),'Pack Hunter, once a turn');
    if(has(p,'rubber'))add('rubber','Bend a die',p.en<2,'Rubber Limbs, 2 ⚡');
    if(has(p,'twist'))add('twist','Twist a die','','then discard');
    if(G.tf.alloy&&!onceUsed('alloy'))add('alloy','Shift a 1',!G.dice.some(d=>d.f==='1'&&!d.fz),'Shifty Alloy');
    if(has(p,'c_clown')&&(G.tf.clown||clownReady()))add('clown',G.tf.clown?'Clown: change a die':'Clown: unlock',false,'any die to any face');
    if(hasE(p,57))add('gamma',evoName(57),onceUsed('gamma'),'a die becomes a claw');
    if(hasE(p,58))add('tsweep',evoName(58),onceUsed('tsweep'),'a die becomes 1 or 2');
    if(hasE(p,632))add('devour',evoName(632),onceUsed('devour')||p.en<1||!G.dice.some(d=>d.f==='H'&&!d.fz),'1 ⚡: heart → claw');
    if(hasE(p,622))add('genius','Reroll energy dice',onceUsed('genius')||!G.dice.some(d=>(d.f==='E'||d.f==='E2')&&!noReroll(d)),'Cosmic Intellect');
    if(hasE(p,613))add('sap',evoName(613),onceUsed('sap')||p.en<1||G.dice.filter(d=>!d.t&&!d.fz).length<2,'1 ⚡: 2 dice → any 1');}
  if(buy){add('para','Buy from a monster',!has(p,'para')||!paraList(p).length,'Leech Tendrils');if(!has(p,'para'))A.pop();
    if(has(p,'lab'))add('lab','Peek at the deck',onceUsed('lab')||!G.deck.length,'Garage Lab');
    if(hasE(p,12))add('catch',evoName(12),onceUsed('catch')||!G.disc.length,'random discard, 1 less');
    if(hasE(p,24)&&p.tok.adapt>0)add('adapt','Free sweep',false,`${evoName(24)} (${p.tok.adapt} left)`)}
  if(has(p,'mend'))add('mend','Quick Mend',p.en<2||p.hp>=maxhp(p),'2 ⚡ → heal 1');
  if(G.tf.ances&&G.tf.ances[p.i])add('ances','Elder Ward',p.en<2||p.hp>=maxhp(p),'2 ⚡ → heal 1');
  if(hasE(p,27))add('mother',evoName(27),onceUsed('mother')||p.en<1||p.hp>=maxhp(p),'1 ⚡ → heal 1, once');
  if(p.cult){add('cult:h','🕯 Cultist → heart',p.hp>=maxhp(p),`${p.cult} cultist${p.cult>1?'s':''}`,'cons');add('cult:e','🕯 Cultist → energy','',`${p.cult} left`,'cons');if(roll)add('cult:r','🕯 Cultist → reroll','','one extra reroll','cons')}
  p.hand.forEach((e,k)=>{const E=EVO[e];if(['perm','city','now','roll'].includes(E.w))add('evo:'+k,`🧬 Play evolution: ${evoName(e)}`,!evoUsable(p,k),E.x,'evo')});
  return A}
function clownReady(){const c=countsOf(G.dice);return FACES.every(f=>c[f]>0)}
function paraList(p){const L=[];others(p).forEach(q=>q.cards.forEach(id=>{const b=base(id);if(CARDS[b].t==='K'&&p.en>=costOf(p,id))L.push({o:q.i,id})}));return L}
function doAct(p,a){if(a.startsWith('cult:')){useCult(p,a.slice(5));return true}
  if(a.startsWith('evo:')){playEvo(p,+a.slice(4));return true}
  const roll=G.phase==='roll';const cancel={cancel:true};
  const pickDie=(title,filter,cb)=>{const opts=G.dice.map((d,k)=>({k:String(k),l:`Die ${k+1}: ${fname(d.f)}`,d})).filter(o=>!o.d.fz&&!o.d.t&&(!filter||filter(o.d))).map(o=>({k:o.k,l:o.l}));if(!opts.length)return;UI.choice={title,text:'Pick the die.',options:opts,cancel:true,who:p.i,dice:true,cb:k=>cb(G.dice[+k])};render()};
  const pickFace=(title,faces,cb)=>{UI.choice={title,text:'Pick the new face.',options:faces.map(f=>({k:f,l:fname(f)})),cancel:true,who:p.i,dice:true,cb};render()};
  switch(a){
    case 'mind':case 'smoke':if(roll)doReroll(a);return true;
    case 'lurker':if(!roll)return true;pickDie('Alley Lurker: reroll a 3',d=>d.f==='3'&&!noReroll(d),d=>{d.f=faceOf(d);G.rollId++;cov('card:lurker');lg(p.i,`${mname(p)} lurks and rerolls a 3: ${fname(d.f)}.`);refresh()});return true;
    case 'pack':if(!roll||onceUsed('pack'))return true;pickDie(CARDS.pack.n,d=>d.f!=='1',d=>{d.f='1';useOnce('pack');cov('card:pack');lg(p.i,`${mname(p)} turns a die into a 1 (Pack Hunter).`);refresh()});return true;
    case 'rubber':if(!roll||p.en<2)return true;pickDie(CARDS.rubber.n,null,d=>pickFace(CARDS.rubber.n,FACES,f=>{d.f=f;p.en-=2;cov('card:rubber');lg(p.i,`${mname(p)} bends a die into ${fname(f)}.`);refresh()}));return true;
    case 'twist':if(!roll)return true;pickDie(CARDS.twist.n,null,d=>pickFace(CARDS.twist.n,FACES,f=>{d.f=f;discardCard(p,'twist');cov('card:twist');lg(p.i,`${mname(p)} twists a die into ${fname(f)}.`);refresh()}));return true;
    case 'alloy':if(!roll||onceUsed('alloy'))return true;pickDie(CARDS.m_alloy.n,d=>d.f==='1',d=>pickFace(CARDS.m_alloy.n,FACES,f=>{d.f=f;useOnce('alloy');cov('card:m_alloy');refresh()}));return true;
    case 'clown':if(!roll)return true;if(!G.tf.clown){if(clownReady()){G.tf.clown=true;cov('cost:clown');lg(p.i,`${mname(p)} honks: it may now change any of its dice.`)}refresh();return true}
      pickDie(COSTUMES.c_clown.n,null,d=>pickFace(COSTUMES.c_clown.n,FACES,f=>{d.f=f;refresh()}));return true;
    case 'gamma':if(!roll||onceUsed('gamma'))return true;pickDie(evoName(57),d=>d.f!=='C',d=>{d.f='C';useOnce('gamma');cov('evo:57');refresh()});return true;
    case 'tsweep':if(!roll||onceUsed('tsweep'))return true;pickDie(evoName(58),null,d=>pickFace(evoName(58),['1','2'],f=>{d.f=f;useOnce('tsweep');cov('evo:58');refresh()}));return true;
    case 'devour':if(!roll||onceUsed('devour')||p.en<1)return true;pickDie(evoName(632),d=>d.f==='H',d=>{d.f='C';p.en--;useOnce('devour');cov('evo:632');refresh()});return true;
    case 'genius':if(!roll||onceUsed('genius'))return true;G.dice.forEach(d=>{if((d.f==='E'||d.f==='E2')&&!noReroll(d))d.f=faceOf(d)});G.rollId++;useOnce('genius');cov('evo:622');refresh();return true;
    case 'sap':if(!roll||onceUsed('sap')||p.en<1)return true;pickDie(evoName(613)+': first die to discard',null,d1=>pickDie(evoName(613)+': second die to discard',d=>d!==d1,d2=>pickFace(evoName(613)+': face of the new die',FACES,f=>{G.dice=G.dice.filter(d=>d!==d1&&d!==d2);G.dice.push({f,k:true,x:true});p.en--;useOnce('sap');cov('evo:613');refresh()})));return true;
    case 'para':paraBuy(p);return true;
    case 'lab':labPeek(p);return true;
    case 'catch':luckyScoop(p);return true;
    case 'adapt':if(!(p.tok.adapt>0))return true;p.tok.adapt--;G.disc.push(...G.market);G.market=[];refill();cov('evo:24');lg(p.i,`${mname(p)} swaps the cards for sale with ${evoName(24)}.`);if(p.tok.adapt<=0){dropEvo(p,24);delete p.tok.adapt}afterBuy(p);return true;
    case 'mend':mend();return true;
    case 'ances':if(p.en>=2&&p.hp<maxhp(p)){p.en-=2;heal(p,1);cov('card:m_ances:heal');refresh()}return true;
    case 'mother':if(!onceUsed('mother')&&p.en>=1&&p.hp<maxhp(p)){p.en--;heal(p,1);useOnce('mother');cov('evo:27');refresh()}return true;
  }
  return false}
function paraBuy(p){const L=paraList(p);if(!L.length)return;ask(p.i,CARDS.para.n,'Buy a Keep card from another monster, paying it the cost.',[...L.map(x=>({k:x.o+':'+x.id,l:`${CN(x.id)} from ${mname(P(x.o))} (${costOf(p,x.id)} ⚡)`,d:CARDS[base(x.id)].x})),{k:'n',l:'Never mind'}],
  ()=>{const b=L.slice().sort((a,c)=>cardValue(p,c.id)-cardValue(p,a.id))[0];return b.o+':'+b.id},k=>{if(k==='n'){refresh();return}const j=k.indexOf(':');const q=P(+k.slice(0,j)),id=k.slice(j+1);const c=costOf(p,id);if(p.en<c||!q.cards.includes(id)){refresh();return}
    p.en-=c;q.en+=c;q.cards.splice(q.cards.indexOf(id),1);const b=base(id);if(b==='smoke'){p.tok.smoke=q.tok.smoke;}if(b==='cell'){p.tok.cell=q.tok.cell}onLoseCard(q,id);p.cards.push(id);if(p.i===G.active)G.tf.bought=true;cov('card:para');
    if(has(p,'news'))gainVP(p,has(p,'news'));lg(p.i,`${mname(p)}'s tendrils buy ${CN(id)} from ${mname(q)}.`);deaths();afterBuy(p)})}
function labPeek(p){if(onceUsed('lab')||!G.deck.length)return;useOnce('lab');const id=G.deck[G.deck.length-1];cov('card:lab');const c=costOf(p,id);const ok=p.en>=c&&buyOK(p,id);
  ask(p.i,CARDS.lab.n,`The top card is ${CN(id)} (${c} ⚡): ${CARDS[base(id)].x}`,[...(ok?[{k:'b',l:`Buy it (${c} ⚡)`}]:[]),{k:'n',l:'Put it back'}],()=>ok&&cardValue(p,id)>0?'b':'n',k=>{if(k!=='b'){refresh();return}
    G.deck.pop();p.en-=c;if(p.i===G.active)G.tf.bought=true;cov('card:lab:buy');lg(p.i,`${mname(p)} buys ${CN(id)} straight from the lab.`);acquire(p,id,true,()=>afterBuy(p))})}
function luckyScoop(p){if(onceUsed('catch')||!G.disc.length)return;useOnce('catch');const j=rnd(G.disc.length);const id=G.disc[j];cov('evo:12');const c=Math.max(0,costOf(p,id)-1);const ok=p.en>=c&&buyOK(p,id);
  ask(p.i,evoName(12),`From the discard pile: ${CN(id)} (${c} ⚡): ${CARDS[base(id)].x}`,[...(ok?[{k:'b',l:`Buy it (${c} ⚡)`}]:[]),{k:'n',l:'Put it back'}],()=>ok&&cardValue(p,id)>0?'b':'n',k=>{if(k!=='b'){refresh();return}
    G.disc.splice(G.disc.indexOf(id),1);p.en-=c;if(p.i===G.active)G.tf.bought=true;lg(p.i,`${mname(p)} scoops ${CN(id)} out of the discard pile.`);acquire(p,id,true,()=>afterBuy(p))})}
function useCult(p,kind){if(!p.cult)return;if(kind==='r'&&G.phase!=='roll')return;p.cult--;cov('cult:'+kind);
  if(kind==='h')heal(p,1);else if(kind==='e')gainE(p,1);else G.rolls++;
  lg(p.i,`${mname(p)} sacrifices a cultist for ${kind==='h'?'a heart':kind==='e'?'energy':'an extra reroll'}.`);refresh()}

/* ---------- end of turn ---------- */
function endTurn(){const p=cur();UI.pick=null;if(G.winner){refresh();return}G.step=5;G.phase='end';UI.busy=true;
  if(G.bug){endBrainjack();return}
  seq([next=>askFrenzy(p,next),next=>metamorph(p,next),next=>flushQ(next)],(f,n)=>{if(G.winner){n();return}f(n)},()=>{
    if(!G.winner)endEffects(p);deaths();flushQ(()=>{UI.busy=false;if(checkWin(true)){refresh();return}nextTurn(p)})})}
function askFrenzy(p,next){if(!p.alive||G.tf.kwFrenzy){next();return}const L=kwCards(p,['Frenzy']);if(!L.length){next();return}
  ask(p.i,'ENCORE?',KWHELP.Frenzy,[...L.map(c=>({k:c.src+':'+c.id,l:`ENCORE: ${c.C.n}`,d:c.C.x})),{k:'n',l:'Not now'}],()=>aiFrenzy(p,L),k=>{if(k==='n'){next();return}const j=k.indexOf(':');const src=k.slice(0,j),id=src==='c'?k.slice(j+1):+k.slice(j+1);activateKw(p,src,id,'Frenzy',next)})}
function metamorph(p,next){if(!p.alive||!has(p,'meta')){next();return}
  const loop=()=>{const L=p.cards.filter(c=>CARDS[base(c)].t==='K');if(!L.length){next();return}
    ask(p.i,CARDS.meta.n,'Discard Keep cards for their full cost in energy?',[{k:'n',l:'Done'},...L.map(c=>({k:c,l:`Discard ${CN(c)} (+${CARDS[base(c)].c} ⚡)`}))],()=>aiMeta(p,L),k=>{if(k==='n'){next();return}
      p.cards.splice(p.cards.indexOf(k),1);G.disc.push(k);onLoseCard(p,k);gainE(p,CARDS[base(k)].c);cov('card:meta');lg(p.i,`${mname(p)} sheds its ${CN(k)} for energy.`);deaths();loop()})};loop()}
function endEffects(p){
  if(p.alive){
    const eh=has(p,'battery');if(eh&&p.en>=6){const v=Math.floor(p.en/6)*eh;gainVP(p,v);cov('card:battery');lg(p.i,`${mname(p)}'s Battery Belly hums (+${plu(v,'star')}).`)}
    if(has(p,'sun')&&p.en===0){gainE(p,has(p,'sun'));cov('card:sun')}
    if(has(p,'underdog')&&alive().every(q=>q.i===p.i||q.vp>p.vp)){gainVP(p,has(p,'underdog'));cov('card:underdog')}
    if(has(p,'grazer')&&!G.tf.dealt){gainVP(p,has(p,'grazer'));cov('card:grazer')}
    if(p.tok.poison>0){cov('card:pspit:tick');lg(p.i,`${mname(p)} suffers from poison (−${p.tok.poison}).`);hitSync(p,p.tok.poison,null,'fx')}
    const fr=G.tf.frenzyTurn;if(fr){const b=fr.src==='c'?base(fr.id):fr.id;
      if(b==='m_bold'){hitSync(p,5,p,'fx');cov('card:m_bold')}if(b==='m_gift'){loseVP(p,5);cov('card:m_gift')}if(b==='m_maxe'){p.dmod=(p.dmod||0)+1;cov('card:m_maxe')}
      if(b===638){loseVP(p,2);hitSync(p,2,p,'fx');loseE(p,2);cov('evo:638')}retireKw(p,fr.src,fr.id);G.tf.frenzyTurn=null}}
  for(const q of G.pl){if(!q.alive)continue;
    if(q.evo.includes(48)&&inCity(q.i)){gainVP(q,1);cov('evo:48')}
    if(has(q,'c_ghost')&&(G.tf.lost[q.i]||0)>0){heal(q,1);cov('cost:ghost')}
    if(has(q,'c_vamp')&&Object.values(G.tf.wound[q.i]||{}).some(x=>x>0)){heal(q,1);cov('cost:vamp')}}
  if(G.frz&&G.frz.t===p.i){G.frz=null;cov('evo:11:back')}
  cleanTemp(p);
  if(G.tf.hunt)finishHunt(p);
  (G.tf.sneaky||[]).forEach(s=>retireKw(p,s.src,s.id));G.tf.sneaky=[];
  if(G.tf.kwFrenzy&&!p.alive){retireKw(p,G.tf.kwFrenzy.src,G.tf.kwFrenzy.id);G.tf.kwFrenzy=null}}
function cleanTemp(p){[34,61,617,618].forEach(e=>{while(p.evo.includes(e))dropEvo(p,e)})}
function nextTurn(p){
  if(p.alive){
    if(G.tf.kwFrenzy)G.xq.push({i:p.i,extra:true,frenzy:G.tf.kwFrenzy});
    if(G.tf.frenzy)G.xq.push({i:p.i,extra:true});
    if(G.tf.jungle)G.xq.push({i:p.i,extra:true});
    if(G.tf.builders){G.xq.push({i:p.i,extra:true,nofate:true});cov('curse:build:turn')}
    if(G.tf.freeze)G.xq.push({i:p.i,extra:true,less:(G.less||0)+1})}
  (G.tf.oppFrenzy||[]).forEach(i=>G.xq.push({i,extra:true}));
  while(G.xq.length){const x=G.xq.shift();if(P(x.i).alive){G.active=x.i;G.xturn=x;UI.fx={};startTurn();return}}
  let j=G.home;const n=G.pl.length;for(let k=1;k<=n;k++){const c=(G.home+k)%n;if(G.pl[c].alive){j=c;break}}
  if(j<=G.home)G.turn++;G.active=j;UI.fx={};startTurn()}
/* the Brainjacker's borrowed turn is over: the Brainjacked monster starts its roll again */
function endBrainjack(){const b=G.bug;const by=P(b.by);cleanTemp(by);if(G.tf.hunt)finishHunt(by);
  flushQ(()=>{deaths();UI.busy=false;if(checkWin(true)){refresh();return}
    const safe=G.tf.safe;G.bug=null;G.tf=b.tf;G.tf.safe=safe;G.active=b.v;const v=P(b.v);
    if(!v.alive){endTurn();return}
    G.tf.fateDone=false;G.tf.skipWin=false;G.tf.cheer=0;G.tf.void=G.tf.void||null;cov('brainjack:restart');
    lg(v.i,`${mname(v)} shakes off the Brainjack and rolls again from scratch.`);startRoll(v)})}

/* ---------- expansions after the dice: cultists, berserk, costumes, menace ---------- */
function gainWick(p,n){if(n<=0)return;const before=p.wk;p.wk=Math.min(10,p.wk+n);if(p.wk===before)return;fx(p.i,'+'+(p.wk-before)+' menace','star');cov('wick:gain');
  for(const lv of [3,6,10])if(before<lv&&p.wk>=lv)(G.tf.wkLv=G.tf.wkLv||[]).push(lv)}
function exAfterResolve(p,R,done){const raw=countsOf(G.dice.filter(d=>!d.t));const c=R.c;
  if(exOn('cult')){const n=FACES.filter(f=>raw[f]>=4).length;if(n){p.cult+=n;fx(p.i,'+'+n+' cultist','star');cov('cult:gain');lg(p.i,`${mname(p)} rolls four of a kind and gains ${n===1?'a cultist':n+' cultists'}.`)}}
  if(exOn('bers')&&!p.tok.berserk&&c.C>=4){p.tok.berserk=true;fx(p.i,'RAMPAGE!','hurt');cov('bers:on');lg(p.i,`${mname(p)} goes on a RAMPAGE and will roll the rampage die!`)}
  const steps=[];
  if(exOn('cost')&&c.C>=3){for(const q of R.hurt){q.cards.filter(id=>CARDS[base(id)].t==='U').forEach(id=>steps.push({q,id}))}}
  (G.tf.wkLv||[]).forEach(lv=>steps.push({lv}));G.tf.wkLv=[];
  seq(steps,(s,next)=>{if(G.winner){next();return}
    if(s.id){const C=COSTUMES[base(s.id)];if(p.en<C.c||!s.q.cards.includes(s.id)){next();return}
      ask(p.i,'Steal a costume?',`Your claws ripped into ${mname(s.q)}. Pay ${C.c} energy to take its ${C.n}? (${C.x}) You have ${p.en} energy.`,[{k:'y',l:`Take the ${C.n} (${C.c} ⚡)`},{k:'n',l:'Leave it'}],
        ()=>cardValue(p,s.id)>-1?'y':'n',k=>{if(k==='y'){p.en-=C.c;s.q.cards.splice(s.q.cards.indexOf(s.id),1);p.cards.push(s.id);cov('cost:steal');lg(p.i,`${mname(p)} steals ${mname(s.q)}'s ${C.n}!`);fx(p.i,'COSTUME!','star');deaths()}next()})}
    else{const opts=G.wtiles[s.lv];if(!opts.length){next();return}
      ask(p.i,`Menace ${s.lv}!`,`${mname(p)} is getting menacing. Take a tile:`,opts.map(k=>({k,l:WTILES[k].n,d:WTILES[k].x})),
        ()=>opts.slice().sort((a,b)=>WTILES[b].v-WTILES[a].v)[0],k=>{G.wtiles[s.lv]=opts.filter(x=>x!==k);lg(p.i,`${mname(p)} takes the menace tile ${WTILES[k].n}.`);fx(p.i,'MENACE!','hurt');cov('wick:'+k.slice(2));
          if(k==='w_panic'){others(p).forEach(q=>loseVP(q,4))}else p.cards.push(k);if(k==='w_regen'){p.hp=Math.max(p.hp,maxhp(p))}next()},{nocancel:true})}},
    done)}

/* ---------- checks for tests ---------- */
function checkInvariants(){const bad=[];if(!G||G.winner)return bad;const ids=new Set();
  G.pl.forEach(p=>{['hp','vp','en','mb','wk','cult'].forEach(k=>{if(typeof p[k]!=='number'||!isFinite(p[k])||p[k]<0)bad.push(`${mname(p)} ${k}=${p[k]}`)});
    if(p.alive&&p.hp>maxhp(p))bad.push(`${mname(p)} hp ${p.hp}>${maxhp(p)}`);if(p.wk>10)bad.push('menace>10');
    if(!p.alive&&(inCity(p.i)||p.cards.length))bad.push(`${mname(p)} is out but still in play`);
    if(p.alive&&p.hp<=0&&!has(p,'c_zombie')&&G.phase!=='resolve'&&!UI.busy)bad.push(`${mname(p)} at 0 hearts but alive`);
    p.cards.forEach(c=>{if(!CARDS[base(c)])bad.push('unknown card '+c);if(ids.has(c)&&CARDS[base(c)].t!=='W')bad.push('duplicate card '+c);ids.add(c)})});
  if(G.city>=0&&G.city===G.bay)bad.push('same monster in both city spaces');
  [G.city,G.bay].forEach(x=>{if(x>=0&&(!G.pl[x]||!G.pl[x].alive))bad.push('dead monster in the city')});
  if(G.bay>=0&&!G.bayOn)bad.push('harbor used while closed');
  if(G.market.length>3||G.market.some(x=>!x))bad.push('bad market');
  [...G.deck,...G.disc,...G.market,...(G.limbo||[])].forEach(c=>{if(ids.has(c))bad.push('card in two places '+c);ids.add(c)});
  if(G.ncards!==undefined&&cardTotal()!==G.ncards)bad.push(`card count ${cardTotal()} != ${G.ncards}`);
  if(G.evoOn){const n=G.pl.reduce((a,p)=>a+p.hand.length+p.evo.length+p.edeck.length+p.edisc.length+(p.epick||[]).length,0);if(n!==8*G.pl.length)bad.push(`evolution count ${n}`)}
  G.dice.forEach(d=>{if(!(FACES.includes(d.f)||['C2','E2','O','FE','FW','FS','FA'].includes(d.f)))bad.push('bad die '+d.f)});
  return bad}
function render_game_to_text(){if(!G)return 'no game';const L=[`Turn ${G.turn}, ${mname(cur())} (${G.phase})${G.bug?' [brainjack]':''}${G.winner?' WINNER '+G.winner+': '+G.winText:''}`];
  if(exOn('curse'))L.push(`Curse: ${CURSES[G.curse].n}; scarab: ${scarab()>=0?mname(P(scarab())):'none'}`);
  G.pl.forEach(p=>L.push(`${mname(p)}${p.alive?'':' (out)'}: ${p.hp}♥ ${p.vp}★ ${p.en}⚡${mbOn()?' mb'+p.mb:''}${exOn('wick')?' wk'+p.wk:''} ${where(p.i)} | ${p.cards.map(CN).join(', ')}${p.evo.length?' | evo: '+p.evo.map(evoName).join(', '):''}${p.hand.length?' | hand '+p.hand.length:''}`));
  L.push('Market: '+G.market.map(CN).join(', '));L.push('Dice: '+G.dice.map(d=>fname(d.f)+(d.k?'*':'')).join(' '));return L.join('\n')}
const fname=f=>({'1':'1','2':'2','3':'3',E:'energy',C:'claw',H:'heart',C2:'double claw',E2:'double energy',O:'ouch',FE:'eye of fate',FW:'water',FS:'snake',FA:'ankh'}[f]||f);
function refresh(){render();save();schedule()}
function save(){try{if(G&&!(typeof NET!=='undefined'&&NET.on))localStorage.setItem(SAVE,JSON.stringify(G))}catch(e){}}
function load(){try{const s=localStorage.getItem(SAVE);return s?JSON.parse(s):null}catch(e){return null}}
