// ---------- Doorkick Dungeon engine: all rules live here. State is G (plain JSON); every move goes through gameAct(ds, seat). ----------
// Rule ids [R..]/[H..] refer to rules-notes.md.
var ANIM=1, AIDELAY=700, DEFN=4, DEFEX={}, LVMIX=null, DEFSEED=null;
const R={WIN:10,HAND:5,DWARF_HAND:6,START:4,RUN:5,SELL:1000,BERSERK:3,TURN:3,TURN_B:3,FLIGHT:3,CAP:400,THEFT:4,MAXTURN:600};
const SAVE='dkd_save2',TOUR='dkd_tour1';
let G=null;const UI={menu:null,zoom:null,info:true,rules:false,fx:[],busy:false,pause:false,hints:true,speed:1,pass:null,lastSeat:-1,sell:null};
// ---- random ----
function rnd(n){let t=(G.rng+=0x6D2B79F5);t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return Math.floor(((t^t>>>14)>>>0)/4294967296*n)}
function setSeed(s){DEFSEED=s>>>0;if(G)G.rng=s>>>0}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=rnd(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
const d6=()=>1+rnd(6);
// ---- cards ----
const D=k=>DEF[k];
const cd=id=>DEF[G.C[id]];
const cname=id=>cd(id).n;
const tagged=(id,t)=>(cd(id).tags||[]).includes(t);
function lg(s,t){G.ln=(G.ln||0)+1;G.log.unshift({s,t,n:G.ln});if(G.log.length>R.CAP)G.log.length=R.CAP}
function fx(t,x){UI.fx.push({t,x,at:Date.now()+Math.random()});if(UI.fx.length>30)UI.fx.shift()}
function drawOne(deck){const k=deck==='door'?'door':'tr',dk=deck==='door'?'dd':'td';if(!G[k].length){if(!G[dk].length)return null;G[k]=shuffle(G[dk]);G[dk]=[];lg(-1,`The ${deck==='door'?'door':'treasure'} discards are shuffled into a new deck.`)}return G[k].pop()}
function discard(id){if(id==null)return;const c=cd(id);(c.d==='door'?G.dd:G.td).push(id)}
// a card arriving in a hand; some cards act the moment you get them [R: Treasure Pile!, Heavenly Favor]
function gain(p,id){if(id==null)return;const c=cd(id);
  if(c.sp==='hoard'){lg(p.i,`${p.nm} finds ${c.n} and draws 3 more treasures!`);discard(id);for(let i=0;i<3;i++)gain(p,drawOne('treasure'));return}
  if(c.sp==='divine'){discard(id);lg(p.i,`${p.nm} reveals ${c.n}: every Cleric goes up a level!`);for(const o of alive())if(isCls(o,'cleric'))gainLv(o,1,c.n,true);return}
  p.hand.push(id)}
function drawTo(p,deck,n){for(let i=0;i<n;i++){const id=drawOne(deck);if(id==null)break;gain(p,id)}}
// ---- player helpers ----
const P=i=>G.pl[i];
const alive=()=>G.pl.filter(p=>!p.gone);
function races(p){const r=p.race.map(id=>cd(id).race);return r.length?r:['human']}
function classes(p){return p.cls.map(id=>cd(id).cls)}
const isRace=(p,r)=>races(p).includes(r);
const isCls=(p,c)=>classes(p).includes(c);
const has=(p,f)=>isRace(p,f)||isCls(p,f);
// Mixed Heritage / Double Major with a single card: all perks, no drawbacks [R §9]
const pureRace=p=>p.half!=null&&p.race.length===1, pureCls=p=>p.sup!=null&&p.cls.length===1;
function fixDual(p){if(!p.race.length&&p.half!=null){discard(p.half);p.half=null}if(!p.cls.length&&p.sup!=null){discard(p.sup);p.sup=null}}
function handLimit(p){return isRace(p,'dwarf')?R.DWARF_HAND:R.HAND}
function eqItems(p){return p.eq.filter(e=>e.on).map(e=>e.id)}
function itemBonus(p,cb){let b=0;const mirror=p.curse.some(id=>cd(id).pers&&cd(id).pers.noweap);
  for(const e of p.eq){if(!e.on)continue;const c=cd(e.id);if(mirror&&cb&&c.hands)continue;b+=(c.elfb&&isRace(p,'elf'))?c.elfb:(c.b||0)}return b}
function persMod(p,k){let b=0;for(const id of p.curse){const c=cd(id);if(c.pers&&c.pers[k])b+=c.pers[k]}if(k==='str'&&p.sexPen)b-=5;return b}
function pStr(p){return p.lvl+itemBonus(p,G&&G.cb)+persMod(p,'str')}
const highestLvl=()=>Math.max(...alive().map(o=>o.lvl));
// ---- equipment rules [R §8] ----
const SLOTS=['head','armor','foot'];
function reqOK(p,c,e){if(e&&e.cheat!=null)return true;const q=c.req;if(!q)return true;
  for(const r of [].concat(q)){const neg=r[0]==='!',k=neg?r.slice(1):r;let ok;
    if(k==='male'||k==='female')ok=p.sex===(k==='male'?'m':'f');
    else if(k==='human')ok=p.race.length===0;
    else ok=has(p,k);
    if(neg&&ok){if((pureRace(p)&&isRace(p,k))||(pureCls(p)&&isCls(p,k)))continue;return false}
    if(!neg&&!ok)return false}
  return true}
// why p can't wear item id now (null = it can); ignore = an item to leave out of the check
function equipWhy(p,id,ignore){const c=cd(id);if(c.t!=='item')return 'not an item';const e=p.eq.find(x=>x.id===id);if(!reqOK(p,c,e))return 'your race, class or sex can’t use it';
  if(e&&e.cheat!=null)return null;
  const on=p.eq.filter(x=>x.on&&x.id!==id&&x.id!==ignore&&x.cheat==null).map(x=>cd(x.id));
  if(c.slot&&on.some(o=>o.slot===c.slot))return `you already wear ${c.slot==='head'?'headgear':c.slot==='foot'?'footgear':'armor'}`;
  if((c.hands||0)+on.reduce((a,o)=>a+(o.hands||0),0)>2)return 'your hands are full';
  return null}
function bigCap(p){return isRace(p,'dwarf')?99:1+(p.hire!=null?1:0)}
function bigCount(p,ex){return p.eq.filter(e=>e.id!==ex&&cd(e.id).big&&e.cheat==null).length}
function bigWhy(p,id){const c=cd(id);if(!c.big)return null;return bigCount(p,id)>=bigCap(p)?'you can carry only one Big item (Dwarves and a Porter help)':null}
// ---- setup ----
function newGame(mode,n){n=n||DEFN;const seed=DEFSEED!=null?DEFSEED:Math.floor(Math.random()*2**31);
  const ids=[];const C={};let k=0;for(const def of CARDS){if(def.x3&&!DEFEX[def.x3])continue;for(let c=0;c<(def.cp||1);c++){C[k]=def.k;ids.push(k++)}}
  G={v:2,gid:Date.now()%1e9,rng:seed,seed,mode,C,door:[],tr:[],dd:[],td:[],pl:[],turn:1,active:0,phase:'setup',cb:null,q:null,ops:[],then:null,log:[],winner:null,winText:'',ex:Object.assign({},DEFEX),kicked:null,fought:false,lastRoll:null,win:null};
  for(const id of ids)(D(C[id]).d==='door'?G.door:G.tr).push(id);shuffle(G.door);shuffle(G.tr);
  const names=UI.names||HERO_NAMES;
  for(let i=0;i<n;i++){const human=mode==='hot'?true:mode==='ai'?false:i===0;
    G.pl.push({i,nm:names[i]||('Hero '+(i+1)),sex:(UI.sexes&&UI.sexes[i])||(i%2?'f':'m'),lvl:1,hand:[],eq:[],race:[],cls:[],curse:[],half:null,sup:null,hire:null,human,lv:(LVMIX&&LVMIX[i])||UI.lvl||'normal',gone:false,dead:false,fresh:false,soldT:false,halfT:false,sexPen:false,st:{kills:0,helps:0,deaths:0,runs:0,cursed:0,levels:0}})}
  lg(-1,'A new dungeon opens. Everyone draws 4 door and 4 treasure cards.');
  for(const p of G.pl){drawTo(p,'door',R.START);drawTo(p,'treasure',R.START)}
  // who starts: everyone rolls, highest goes first [R: "roll dice and argue about it"]
  let best=-1,who=[];for(const p of G.pl){const r=d6();if(r>best){best=r;who=[p.i]}else if(r===best)who.push(p.i)}G.active=who[rnd(who.length)];
  G.first=G.active;G.rv={};G.mom=[];lg(-1,`${P(G.active).nm} rolls highest and goes first.`);
  G.phase='setup';G.setupOrd=G.pl.map((_,j)=>(G.active+j)%n);G.setupI=0;
  UI.info=false;UI.menu=null;UI.fx=[];UI.sell=null;refresh()}
const HERO_NAMES=['Pip','Morwen','Grub','Tansy','Bodkin','Wrenna'];
// ---- levels and victory [R §12] ----
function gainLv(p,n,why,canWin){if(n<=0||p.dead)return 0;const cap=canWin?R.WIN:R.WIN-1;const before=p.lvl;p.lvl=Math.max(before,Math.min(cap,p.lvl+n));const got=p.lvl-before;if(got>0){p.st.levels+=got;fx('lvl',p.i)}
  if(got<n&&!canWin&&p.lvl===R.WIN-1)lg(p.i,`${p.nm} stays at level ${R.WIN-1}: the last level only comes from killing a monster.`);
  if(p.lvl>=R.WIN&&!G.winner){G.winner='P'+(p.i+1);G.winText=`${p.nm} reaches level ${R.WIN} by ${why}!`;lg(p.i,G.winText);fx('win',p.i)}return got}
function loseLv(p,n){const b=p.lvl;p.lvl=Math.max(1,p.lvl-n);return b-p.lvl}
// ---- choices: anything a player must decide mid-effect becomes G.q (humans answer through validMoves, the AI through aiPick) ----
function choose(who,why,opts,cont,text){if(!opts.length){resume(cont,null);return}
  if(!P(who).human){resume(cont,aiPick(P(who),why,opts,cont));return}
  G.q={who,kind:'pick',why,opts,cont,text:text||''}}
function resume(cont,v){const h=CONT[cont.k];if(!h){console.error('no continuation '+cont.k);return}h(cont,v);if(!G.q)runOps()}
// the op queue: Bad Stuff and curses are lists of ops applied in order; a choice pauses the queue
function queue(p,ops,src,front){const it=ops.map(op=>({p:p.i,op,src}));if(front)G.ops.unshift(...it);else G.ops.push(...it)}
function runOps(){while(G.ops.length&&!G.q&&!G.winner){const o=G.ops.shift();applyOp(P(o.p),o.op,o.src)}
  if(!G.q&&!G.ops.length&&G.then){const t=G.then;G.then=null;THEN[t]()}}
const THEN={run:()=>nextRun(),reopen:()=>{if(G.cb)reopen()},none:()=>{},charity:()=>{},lootdone:()=>{}};
function itemPool(p,what){let es=p.eq.slice();
  switch(what){case 'head':case 'foot':case 'armor':es=es.filter(e=>cd(e.id).slot===what);break;
  case 'headW':case 'footW':case 'armorW':es=es.filter(e=>e.on&&cd(e.id).slot===what.slice(0,-1));break;
  case 'big':es=es.filter(e=>cd(e.id).big);break;case 'small':es=es.filter(e=>!cd(e.id).big);break;
  case 'below':es=es.filter(e=>cd(e.id).slot==='foot'||tagged(e.id,'below'));break;
  case 'best':{const bb=e=>e.on?((cd(e.id).elfb&&isRace(p,'elf'))?cd(e.id).elfb:(cd(e.id).b||0)):-1;const m=Math.max(-1,...es.map(bb));es=m<0?[]:es.filter(e=>bb(e)===m);break}}
  return es.map(e=>e.id)}
function loseCard(p,id,why){const i=p.eq.findIndex(e=>e.id===id);if(i>=0){const e=p.eq[i];p.eq.splice(i,1);if(e.cheat!=null)discard(e.cheat);
    if(cd(id).slot==='head'){const hen=p.curse.findIndex(x=>cd(x).pers&&cd(x).pers.die);if(hen>=0){discard(p.curse.splice(hen,1)[0]);lg(p.i,`The hen flaps off with ${p.nm}'s headgear.`)}}}
  else{const j=p.hand.indexOf(id);if(j>=0)p.hand.splice(j,1)}
  discard(id);lg(p.i,`${p.nm} loses ${cd(id).n}${why?' ('+why+')':''}.`)}
function applyOp(p,op,src){const [k,a,b]=op;const srcN=src?cd(src).n:'';
  switch(k){
  case 'lvl':{const n=a==='all'?p.lvl-1:a;const l=loseLv(p,n);if(l)lg(p.i,`${p.nm} loses ${l} level${l>1?'s':''}.`);break}
  case 'lvlIf':{const n=vsHit(p,a)?b:op[3];const l=loseLv(p,n);if(l)lg(p.i,`${p.nm} loses ${l} level${l>1?'s':''}.`);break}
  case 'death':die(p,srcN);break;
  case 'item':{const pool=itemPool(p,a);if(!pool.length)break;if(b==='all'){pool.forEach(id=>loseCard(p,id));break}
    if(pool.length===1){loseCard(p,pool[0]);break}choose(p.i,'lose',pool,{k:'lose',p:p.i});break}
  case 'pick':{const pool=itemPool(p,a);if(pool.length)choose(p.i,'lose',pool,{k:'lose',p:p.i},`Choose a ${a==='big'?'Big':'small'} item to lose.`);break}
  case 'itemOr':{const pool=itemPool(p,a);if(pool.length)loseCard(p,pool[0]);else{const l=loseLv(p,b);if(l)lg(p.i,`${p.nm} has nothing to lose there, so loses ${l} level.`)}break}
  case 'clsOr':{if(p.cls.length){p.cls.forEach(id=>{discard(id);lg(p.i,`${p.nm} loses ${cd(id).n}.`)});p.cls=[];fixDual(p);revalidate(p)}else{const l=loseLv(p,a);if(l)lg(p.i,`${p.nm} has no class and loses ${l} levels.`)}break}
  case 'clsOr1':{if(!p.cls.length){const l=loseLv(p,1);if(l)lg(p.i,`${p.nm} has no class and loses a level.`);break}if(p.cls.length===1){dropTrait(p,p.cls[0]);break}choose(p.i,'trait',p.cls.slice(),{k:'trait',p:p.i},'Choose the class to lose.');break}
  case 'race':{if(p.race.length){p.race.slice().forEach(id=>dropTrait(p,id))}break}
  case 'cls':{if(p.cls.length){p.cls.slice().forEach(id=>dropTrait(p,id))}break}
  case 'hand':{const n=a==='all'?p.hand.length:Math.min(a,p.hand.length);for(let i=0;i<n;i++)discard(p.hand.splice(rnd(p.hand.length),1)[0]);if(n)lg(p.i,`${p.nm} discards ${n} card${n>1?'s':''} from hand.`);break}
  case 'handOr':{if(!p.hand.length){const l=loseLv(p,a);if(l)lg(p.i,`${p.nm} loses ${l} levels.`);break}choose(p.i,'handOr',['hand','lvl'],{k:'handOr',p:p.i,n:a},`Discard your whole hand (${p.hand.length} cards), or lose ${a} levels?`);break}
  case 'orcs':{const r=d6();G.lastRoll={v:r,mod:0,need:3,who:p.i,ok:r>2,id:(G.lastRoll?G.lastRoll.id:0)+1,what:'horde'};if(r<=2){lg(p.i,`${p.nm} rolls ${r}: trampled!`);die(p,srcN)}else{const l=loseLv(p,r);lg(p.i,`${p.nm} rolls ${r} and loses ${l} levels.`)}break}
  case 'lowest':{const low=Math.min(...alive().map(o=>o.lvl));if(p.lvl>low){lg(p.i,`${p.nm} drops to level ${low}.`);p.lvl=low}break}
  case 'gold':{let need=a;const pool=p.eq.map(e=>e.id).sort((x,y)=>(itemWorth(p,x))-(itemWorth(p,y)));
    const tot=pool.reduce((s,id)=>s+(cd(id).g||0),0);if(tot<=need){pool.forEach(id=>loseCard(p,id));break}
    // lose the cheapest set of items (by usefulness) that reaches the amount [H4: chosen automatically]
    const byVal=pool.slice().sort((x,y)=>itemWorth(p,x)/((cd(x).g||1))-itemWorth(p,y)/((cd(y).g||1)));for(const id of byVal){if(need<=0)break;if(!(cd(id).g))continue;need-=cd(id).g;loseCard(p,id)}break}
  case 'hippo':{const ord=[];for(let j=1;j<G.pl.length;j++){const o=P((p.i-j+G.pl.length)%G.pl.length);if(!o.gone&&!o.dead)ord.push(o.i)}G.take={v:p.i,ord,i:0,what:'hippo'};takeNext();break}
  case 'lawyer':{const ord=[];for(let j=1;j<G.pl.length;j++){const o=P((p.i+j)%G.pl.length);if(!o.gone&&!o.dead)ord.push(o)}for(const o of ord){if(!p.hand.length)break;const id=p.hand.splice(rnd(p.hand.length),1)[0];o.hand.push(id);lg(o.i,`${o.nm} draws a card from ${p.nm}'s hand.`)}
    const n=p.hand.length;while(p.hand.length)discard(p.hand.pop());if(n)lg(p.i,`${p.nm} discards the other ${n}.`);break}
  case 'pixie':{const L=P((p.i+1)%G.pl.length),Rt=P((p.i-1+G.pl.length)%G.pl.length);const ord=[L.i];if(Rt.i!==L.i)ord.push(Rt.i);G.take={v:p.i,ord:ord.filter(i=>i!==p.i&&!P(i).dead),i:0,what:'pixie'};takeNext();break}
  case 'troll':{const top=Math.max(...alive().filter(o=>o!==p).map(o=>o.lvl));G.take={v:p.i,ord:alive().filter(o=>o!==p&&o.lvl===top&&!o.dead).map(o=>o.i),i:0,what:'troll'};takeNext();break}
  case 'slugs':{const r=d6();G.lastRoll={v:r,mod:0,need:0,who:p.i,ok:false,id:(G.lastRoll?G.lastRoll.id:0)+1,what:'slugs'};lg(p.i,`${p.nm} rolls ${r}: that many items or cards must go.`);G.slug={p:p.i,left:r};slugNext();break}
  case 'dread':if(isCls(p,'wizard')){const w=p.cls.find(id=>cd(id).cls==='wizard');dropTrait(p,w);lg(p.i,`${p.nm} survives as a mere ex-Wizard.`)}else die(p,srcN);break;
  case 'swap':{const zone=a==='cls'?p.cls:p.race;if(!zone.length){lg(p.i,'Nothing to change.');break}const key=a==='cls'?'class':'race';const j=G.dd.map((id,i)=>[id,i]).reverse().find(([id])=>cd(id).t===key);zone.slice().forEach(id=>dropTrait(p,id,true));
    if(j){G.dd.splice(j[1],1);zone.push(j[0]);lg(p.i,`${p.nm} becomes ${cd(j[0]).n}.`);revalidate(p)}else lg(p.i,`No ${key} in the discards: ${p.nm} is left without one.`);fixDual(p);break}
  case 'sex':p.sex=p.sex==='m'?'f':'m';p.sexPen=true;lg(p.i,`${p.nm} is now ${p.sex==='m'?'male':'female'} (-5 in the next fight).`);revalidate(p);break;
  case 'pers':p.curse.push(src);src=null;break;
  case 'tax':taxStart(p,src);break;
  case 'grab':{const L=P((p.i+1)%G.pl.length),Rt=P((p.i-1+G.pl.length)%G.pl.length);for(const o of [L,Rt]){if(o===p||!p.hand.length||o.dead)continue;const id=p.hand.splice(rnd(p.hand.length),1)[0];o.hand.push(id);lg(o.i,`${o.nm} grabs a card from ${p.nm}'s hand.`)}break}
  case 'noop':break;
  default:console.error('unknown op '+k)}}
function itemWorth(p,id){const c=cd(id);const e=p.eq.find(x=>x.id===id);return (e&&e.on?(c.b||0)*3:0)+(c.run||0)*2+(c.g||0)/400}
function dropTrait(p,id,quiet){for(const z of ['race','cls']){const j=p[z].indexOf(id);if(j>=0){p[z].splice(j,1);discard(id);if(!quiet)lg(p.i,`${p.nm} loses ${cd(id).n}.`)}}fixDual(p);revalidate(p)}
// others take things from a victim one by one (Skygrif, Pixie, Forum Troll)
function takeNext(){const t=G.take;if(!t)return;const v=P(t.v);
  while(t.i<t.ord.length){const o=P(t.ord[t.i]);t.i++;const pool=t.what==='hippo'?v.eq.map(e=>e.id).concat(v.hand.filter(id=>cd(id).d==='tr').length?['hand']:[]):v.eq.map(e=>e.id);if(!pool.length)continue;
    choose(o.i,'take',pool,{k:'take',o:o.i},`Take one ${t.what==='hippo'?'treasure':'item'} from ${v.nm}.`);return}
  G.take=null}
function slugNext(){const s=G.slug;if(!s)return;const p=P(s.p);while(s.left>0&&(p.hand.length||p.eq.length)){const pool=p.eq.map(e=>e.id).concat(p.hand);if(pool.length<=s.left){pool.forEach(id=>loseCard(p,id,'slugs'));s.left=0;break}
    choose(p.i,'slug',pool,{k:'slug'},`Lose ${s.left} more item${s.left>1?'s':''} or cards: pick one.`);return}G.slug=null}
// Tax Collector [R card]
function taxStart(p,src){const pool=p.eq.map(e=>e.id);if(!pool.length){lg(p.i,`${p.nm} has no items, so nobody pays tax.`);return}choose(p.i,'taxpay',pool,{k:'tax0',p:p.i},'Choose an item to discard for the tax.')}
function taxOthers(v,val){for(const o of alive()){if(o.i===v)continue;const pool=o.eq.map(e=>e.id);const tot=pool.reduce((a,id)=>a+(cd(id).g||0),0);
  if(tot<val){pool.forEach(id=>loseCard(o,id,'tax'));if(val>0){const l=loseLv(o,1);lg(o.i,`${o.nm} can't pay ${val} gold of tax: loses all items${l?' and a level':''}.`)}continue}
  let need=val;const by=pool.slice().sort((x,y)=>itemWorth(o,x)/((cd(x).g||1))-itemWorth(o,y)/((cd(y).g||1)));for(const id of by){if(need<=0)break;if(!cd(id).g)continue;need-=cd(id).g;loseCard(o,id,'tax')}}}
const CONT={
  lose:(c,v)=>{if(v!=null)loseCard(P(c.p),v)},
  trait:(c,v)=>{if(v!=null)dropTrait(P(c.p),v)},
  handOr:(c,v)=>{const p=P(c.p);if(v==='hand'){applyOp(p,['hand','all'])}else{const l=loseLv(p,c.n);lg(p.i,`${p.nm} loses ${l} levels.`)}},
  take:(c,v)=>{const t=G.take,vp=P(t.v),o=P(c.o);if(v==='hand'){const tr=vp.hand.filter(id=>cd(id).d==='tr');const id=tr[rnd(tr.length)];vp.hand.splice(vp.hand.indexOf(id),1);o.hand.push(id);lg(o.i,`${o.nm} grabs a card from ${vp.nm}'s hand.`)}
    else if(v!=null){const i=vp.eq.findIndex(e=>e.id===v);if(i>=0){const e=vp.eq.splice(i,1)[0];if(e.cheat!=null)discard(e.cheat);o.hand.push(v);lg(o.i,`${o.nm} takes ${cname(v)} from ${vp.nm}.`)}}
    takeNext()},
  slug:(c,v)=>{const s=G.slug;loseCard(P(s.p),v,'slugs');s.left--;slugNext()},
  tax0:(c,v)=>{const p=P(c.p);const val=cd(v).g||0;loseCard(p,v,'tax');lg(p.i,`Everyone else owes ${val} gold of tax.`);taxOthers(p.i,val)},
  loot:(c,v)=>{const L=G.loot;const o=P(c.o);const i=L.pool.indexOf(v);if(i>=0){L.pool.splice(i,1);o.hand.push(v);lg(o.i,`${o.nm} loots ${cname(v)} from the body.`)}lootNext()},
  tongue:(c,v)=>{if(v!=null)loseCard(P(c.p),v,'before the fight')},
  dowse:(c,v)=>{const p=P(c.p);for(const z of ['dd','td']){const i=G[z].indexOf(v);if(i>=0){G[z].splice(i,1);gain(p,v);lg(p.i,`${p.nm} digs ${cname(v)} out of the discards.`);break}}},
  sell:()=>{},
  none:()=>{}};
// ---- death and looting the body [R §7] ----
function die(p,why){if(p.dead)return;p.st.deaths++;fx('death',p.i);lg(p.i,`💀 ${p.nm} dies${why?` to ${why}`:''}! Level, race, class and curses stay; the rest is looted.`);
  const pool=p.eq.map(e=>e.id).concat(p.hand);for(const e of p.eq)if(e.cheat!=null)discard(e.cheat);p.eq=[];p.hand=[];if(p.hire!=null){pool.push(p.hire);p.hire=null}p.dead=true;p.sexPen=false;
  const ord=alive().filter(o=>o!==p&&!o.dead).sort((a,b)=>b.lvl-a.lvl||rnd(3)-1).map(o=>o.i);
  G.loot={v:p.i,pool,ord,i:0};
  if(G.cb){for(const r of G.cb.runs||[])if(r.w===p.i)r.done=true}
  lootNext()}
function lootNext(){const L=G.loot;if(!L)return;while(L.i<L.ord.length&&L.pool.length){const o=L.ord[L.i];L.i++;choose(o,'loot',L.pool.slice(),{k:'loot',o},`Loot one card from ${P(L.v).nm}'s body.`);return}
  L.pool.forEach(discard);G.loot=null}
// ---- curses [R §10] ----
function applyCurse(p,id,by,kicked){const c=cd(id);p.st.cursed++;if(by!==p.i)note(p.i,by,'curse');
  lg(by,by===p.i&&kicked?`${p.nm} is hit by a curse: ${c.n}. ${c.x}`:`${P(by).nm} curses ${by===p.i?'themselves':p.nm}: ${c.n}. ${c.x}`);fx('curse',p.i);
  if(kicked&&eqItems(p).some(x=>cd(x).sp==='sandals')){lg(p.i,`${p.nm}'s Lucky Flip-Flops shrug it off.`);discard(id);return}
  const ring=p.hand.find(x=>cd(x).sp==='ward');
  if(ring!==undefined){if(p.human){G.q={who:p.i,kind:'ward',curse:id,ring,by,kicked:!!kicked};return}if(aiWantsWard(p,c)){wardOff(p,ring,id);return}}
  landCurse(p,id)}
function wardOff(p,ring,id){p.hand.splice(p.hand.indexOf(ring),1);discard(ring);lg(p.i,`${p.nm} cancels the curse with ${cd(ring).n}.`);discard(id)}
function landCurse(p,id){const c=cd(id);const pers=(c.ops||[]).some(o=>o[0]==='pers');queue(p,c.ops||[],id,true);if(!pers)discard(id);if(!G.then&&G.cb)G.then='reopen';runOps()}
// story bookkeeping only: v was hurt by `by` (curse / boost against their fight / backstab); read by the interface for the rivalry thread and the recap
function note(v,by,k){if(by==null||by<0||v===by)return;G.rv=G.rv||{};const a=G.rv[v]=G.rv[v]||{};const b=a[by]=a[by]||{curse:0,boost:0,stab:0};b[k]++}
// ---- combat [R §5] ----
function mdef(m){return cd(m.like!=null?m.like:m.id)}
function vsHit(p,v){if(v.race){if(pureRace(p)&&isRace(p,v.race))return false;return isRace(p,v.race)}if(v.cls){if(pureCls(p)&&isCls(p,v.cls))return false;return isCls(p,v.cls)}if(v.sex)return p.sex===v.sex;return false}
function fighters(cb){return [cb.who].concat(cb.help>=0?[cb.help]:[]).map(P)}
function mStr(m,cb){const c=mdef(m);const src=m.like!=null?cb.mons.find(x=>x.id===m.src):null;const enh=m.enh.concat(src?src.enh:(m.snap||[]));
  let s=Math.max(1,c.lvl+enh.reduce((a,id)=>a+(cd(id).b||0),0));
  for(const v of c.vs||[])if(fighters(cb).some(f=>vsHit(f,v)))s+=v.b;
  return s}
function special(cb,sp){return cb.mons.some(m=>mdef(m).sp===sp)}
function sideStr(cb){const fs=fighters(cb);let s;
  if(special(cb,'lvlonly'))s=fs.reduce((a,f)=>a+f.lvl,0);
  else{s=fs.reduce((a,f)=>a+(special(cb,'bonusonly')?0:f.lvl)+itemBonus(f,cb)+persMod(f,'str'),0)+cb.pb+cb.bers+cb.turnB;
    s+=cb.water*2*fs.filter(f=>isRace(f,'elf')).length}
  if(cb.dbl)s*=1+cb.dbl;return s}
function monStr(cb){return cb.mons.reduce((a,m)=>a+mStr(m,cb),0)+cb.mb}
function winning(cb){if(!cb.mons.length)return true;const a=sideStr(cb),b=monStr(cb);return a>b||(a===b&&fighters(cb).some(f=>isCls(f,'warrior')&&!(pureCls(f)&&false)))}
function cbTreasure(cb){return cb.mons.reduce((a,m)=>a+monTr(m,cb),0)+cb.killed.reduce((a,k)=>a+k.tr,0)}
function monTr(m,cb){const c=mdef(m);const src=m.like!=null?cb.mons.find(x=>x.id===m.src):null;const enh=m.enh.concat(src?src.enh:(m.snap||[]));const t=c.tr+enh.reduce((a,id)=>a+(cd(id).trb||0),0);return enh.some(id=>(cd(id).trb||0)<0)?Math.max(1,t):Math.max(0,t)}
function newCb(who,how){return {who,orig:G.active,mons:[],help:-1,offer:0,pb:0,mb:0,os:[],stage:'act',ord:[],oi:0,bers:0,turnB:0,water:0,dbl:0,how,used:{},asked:[],runs:null,tr:0,killed:[],fire:false,plus:0,nohelp:false}}
function startCombat(who,id,how){G.cb=newCb(who,how);G.phase='combat';G.fought=true;const c=cd(id);
  lg(who,`${P(who).nm} ${how==='kick'?'kicks open the door and finds':'goes looking for trouble with'} ${c.n} (level ${c.lvl}).`);fx('monster',id);
  enterMonster(id,who,true)}
// a monster joins the fight; "will not attack" and "before combat" effects [R §5.4]
function enterMonster(id,by,first){const cb=G.cb;const c=cd(id);const f=P(cb.who);cb.mons.push({id,enh:[]});
  if(c.sp==='amazon'&&fighters(cb).some(x=>x.sex==='f')){cb.mons.pop();lg(cb.who,`${c.n} won't fight a woman: she hands over 1 treasure and leaves.`);gain(f,drawOne('treasure'));discard(id);return checkEmpty()}
  if(c.sp==='lawyer'&&isCls(f,'thief')){cb.mons.pop();discard(id);lg(cb.who,`${c.n} won't sue a fellow Thief and walk away.`);const tr=f.hand.filter(x=>cd(x).d==='tr');if(tr.length>=2&&f.human){G.q={who:f.i,kind:'lawyer'};return}if(tr.length>=2&&aiLawyerSwap(f))lawyerSwap(f);return checkEmpty()}
  if(c.sp==='nohelp'&&cb.help>=0){lg(cb.help,`${P(cb.help).nm} has to leave: nobody can help against ${c.n}.`);cb.help=-1;cb.offer=0}
  if(c.sp==='nohelp')cb.nohelp=true;
  if(c.sp==='tongue'&&first){const pool=f.eq.map(e=>e.id);if(pool.length){lg(cb.who,`${c.n} demands an item before the fight.`);choose(f.i,'lose',pool,{k:'tongue',p:f.i},'Discard one item before fighting the Slobber Fiend.')}}}
function lawyerSwap(f){const tr=f.hand.filter(x=>cd(x).d==='tr').sort((a,b)=>cardValue(f,a)-cardValue(f,b)).slice(0,2);tr.forEach(x=>{f.hand.splice(f.hand.indexOf(x),1);discard(x)});drawTo(f,'treasure',2);lg(f.i,`${f.nm} swaps 2 treasures for 2 new ones.`)}
function checkEmpty(){const cb=G.cb;if(cb&&!cb.mons.length){if(cb.killed.length)resolveWin();else{lg(-1,'The fight is over.');endCombat()}return true}return false}
// any play in combat hands priority back to the fighter
function reopen(){const cb=G.cb;if(!cb)return;cb.stage='act';cb.oi=0}
function endCombat(){const cb=G.cb;if(!cb)return;
  for(const m of cb.mons){discard(m.id);m.enh.forEach(discard)}for(const o of cb.os)discard(o.id);for(const k of cb.killed){discard(k.id);k.enh.forEach(discard)}
  for(const f of fighters(cb)){f.sexPen=false;const mi=f.curse.findIndex(id=>cd(id).pers&&cd(id).pers.once);if(mi>=0)discard(f.curse.splice(mi,1)[0])}
  const lv=fighters(cb).map(f=>({i:f.i,d:f.lvl-((cb.lv0||{})[f.i]!=null?cb.lv0[f.i]:f.lvl)}));
  G.out={turn:G.turn,who:cb.who,help:cb.help,won:!!cb.won,lv:cb.wonLv||0,tr:cb.wonTr||0,mons:cb.mons.map(m=>mdef(m).n).concat(cb.killed.map(k=>k.def.n)),mlvl:Math.max(0,...cb.mons.map(m=>mdef(m).lvl||0),...cb.killed.map(k=>k.def.lvl||0)),runs:(cb.runs||[]).map(r=>({w:r.w,ok:!!r.ok})),lost:lv,dead:fighters(cb).filter(f=>f.dead).map(f=>f.i),stolen:!!cb.transfer};
  const tr=cb.transfer;G.cb=null;G.phase=tr?'after':'post';if(tr)G.fought=false;G.afterFight=true}
// ---- resolving a won fight [R §5.6] ----
function resolveWin(){const cb=G.cb,p=P(cb.who);let lv=0,tr=cb.tr||0;const all=cb.mons.map(m=>({id:m.id,def:mdef(m),tr:monTr(m,cb),enh:m.enh,kill:true})).concat(cb.killed);
  for(const k of all){tr+=k.tr;if(!k.kill)continue;lv+=(k.def.lv||1);if(k.def.sp==='fire'&&cb.fire)lv++;if(k.def.sp==='pure'&&cb.help<0&&cb.pb===0&&cb.bers===0&&itemBonus(p,cb)===0)lv++;if(k.def.sp==='plant'&&isRace(p,'elf'))tr++}
  const kills=all.filter(k=>k.kill);  const gone=all.filter(k=>!k.kill);
  lg(cb.who,kills.length?`${p.nm} defeats ${kills.map(k=>k.def.n).join(' and ')}${cb.help>=0?` with ${P(cb.help).nm}'s help`:''}${gone.length?` (${gone.map(k=>k.def.n).join(' and ')} already sent away)`:''}!`:`${p.nm} sees off ${gone.map(k=>k.def.n).join(' and ')} and keeps the treasure.`);fx('win',cb.who);
  cb.won=true;cb.wonLv=lv;cb.wonTr=tr;G.mom=G.mom||[];G.mom.push({k:'kill',who:cb.who,help:cb.help,mon:all[0].def.n,lvl:Math.max(...all.map(k=>k.def.lvl||0)),stolen:!!cb.transfer&&cb.thief===cb.who,turn:G.turn});
  p.st.kills+=kills.length;
  if(cb.help>=0){const h=P(cb.help);h.st.helps++;if(isRace(h,'elf')&&kills.length)gainLv(h,kills.length,'helping as an Elf',false)}
  // treasure: the helper takes the promised number first [H1]
  const got=[];for(let i=0;i<tr;i++){const t=drawOne('treasure');if(t==null)break;got.push(t)}
  const give=cb.help>=0?Math.min(cb.offer,got.length):0;if(give){const h=P(cb.help);got.splice(0,give).forEach(t=>gain(h,t));lg(cb.help,`${P(cb.help).nm} takes ${give} treasure${give>1?'s':''} as agreed.`)}
  got.forEach(t=>gain(p,t));if(got.length)lg(cb.who,`${p.nm} draws ${got.length} treasure${got.length>1?'s':''}.`);
  const lvName=all[0].def.n;endCombat();if(lv)gainLv(p,lv,`defeating ${lvName}`,true)}
// ---- running away [R §6] ----
function runMod(p,cb,m){let x=0;if(isRace(p,'elf'))x+=1;if(isRace(p,'halfling')&&!pureRace(p))x-=1;for(const id of eqItems(p))x+=cd(id).run||0;x+=mdef(m).runm||0;if(m.like!=null)x-=1;return x}
function startRun(){const cb=G.cb;cb.stage='run';cb.runs=[];cb.lv0={};for(const f of fighters(cb))cb.lv0[f.i]=f.lvl;for(const w of fighters(cb))for(const m of cb.mons)cb.runs.push({w:w.i,m:m.id,r:null,ok:null,done:false,auto:!!cb.wall,pen:false});
  lg(cb.who,`${P(cb.who).nm} can't win and runs for it!`);nextRun()}
function runMon(r){return G.cb.mons.find(m=>m.id===r.m)}
function nextRun(){const cb=G.cb;if(!cb)return;const r=cb.runs.find(x=>!x.done);if(!r){endCombat();return}
  const p=P(r.w),m=runMon(r),c=mdef(m);
  if(p.dead){r.done=true;return nextRun()}
  // fleeing costs levels even when it works [card: Pharaoh, Grave Twins, Rattlebones]
  if(!r.pen){r.pen=true;if(c.sp==='escape2'&&p.lvl>3){const l=loseLv(p,2);if(l)lg(p.i,`${p.nm} loses ${l} levels just for fleeing ${c.n}.`)}if(c.sp==='escape1'){const l=loseLv(p,1);if(l)lg(p.i,`${p.nm} loses a level fleeing ${c.n}.`)}}
  if(c.sp==='noescape'){r.ok=false;lg(r.w,`Nobody gets away from ${c.n}!`);return finishRun(r)}
  if(c.nop&&p.lvl<=c.nop&&!(c.sp==='nopNotElf'&&isRace(p,'elf'))){r.ok=true;lg(r.w,`${c.n} won't chase anyone of level ${c.nop} or lower: ${p.nm} walks away.`);return finishRun(r)}
  if(r.auto){r.ok=true;lg(r.w,`${p.nm} gets away from ${c.n}.`);return finishRun(r)}
  if(c.sp==='fetch'&&!r.fetchAsked){r.fetchAsked=true;const pole=p.eq.find(e=>tagged(e.id,'pole'));if(pole){if(p.human){G.q={who:p.i,kind:'fetch',run:cb.runs.indexOf(r),card:pole.id};return}loseCard(p,pole.id,'thrown for the hound');r.ok=true;lg(p.i,`${c.n} chases the stick instead.`);return finishRun(r)}}
  roll(r)}
function roll(r){const cb=G.cb,p=P(r.w),m=runMon(r),c=mdef(m);const v=d6(),mod=runMod(p,cb,m)+(r.w===cb.who||r.w===cb.help?(cb.used['f'+r.w]||0):0)+persMod(p,'die');r.r=v;r.mod=mod;r.ok=v+mod>=R.RUN;p.st.runs++;
  G.lastRoll={v,mod,need:R.RUN,who:r.w,ok:r.ok,id:(G.lastRoll?G.lastRoll.id:0)+1,what:'run'};fx('roll',r.w);
  lg(r.w,`${p.nm} rolls ${v}${mod?` ${mod>0?'+':''}${mod}`:''} to escape ${c.n}: ${r.ok?'gets away!':'caught!'}`);
  if(!r.ok&&rescueOpts(p,r).length){G.q={who:r.w,kind:'rescue',run:cb.runs.indexOf(r)};return}
  finishRun(r)}
function rescueOpts(p,r){const c=mdef(runMon(r));const o=[];for(const id of p.hand){const x=cd(id);if(x.sp==='invis'||x.sp==='die'||(x.sp==='lamp'&&p.i===G.active&&!G.cb.transfer))o.push(id)}for(const e of p.eq)if(cd(e.id).sp==='ratstick'&&c.lvl<=8)o.push(e.id);return o}
// after a successful escape, a holder of Sticky Paste may force a reroll
function finishRun(r){const cb=G.cb;
  if(r.ok&&!r.glued){const holders=alive().filter(o=>o.i!==r.w&&o.hand.some(id=>cd(id).sp==='glue'));for(const o of holders){if(o.human){G.q={who:o.i,kind:'glue',run:cb.runs.indexOf(r)};return}if(aiGlue(o,r)){useGlue(o,r);return}}}
  r.done=true;if(!r.ok){const p=P(r.w),c=mdef(runMon(r));lg(p.i,`Bad Stuff from ${c.n}: ${c.badt}`);fx('bad',p.i);queue(p,c.bad||[],runMon(r).id);G.then='run';runOps();return}
  nextRun()}
function useGlue(o,r){const id=o.hand.find(x=>cd(x).sp==='glue');o.hand.splice(o.hand.indexOf(id),1);discard(id);r.glued=true;r.auto=false;lg(o.i,`${o.nm} throws ${cd(id).n}: ${P(r.w).nm} is stuck and must roll again!`);roll(r)}
// ---- turn flow [R §4] ----
function curPl(){return P(G.active)}
function nextTurn(){const n=G.pl.length;let i=G.active;do{i=(i+1)%n}while(P(i).gone&&i!==G.active);G.active=i;G.turn++;const p=curPl();
  for(const o of G.pl)if(o.dead){o.dead=false;o.fresh=true}
  G.phase='main';G.fought=false;G.afterFight=false;G.kicked=null;G.cb=null;G.q=null;G.stole=false;p.soldT=false;p.halfT=false;
  lg(p.i,`— ${p.nm}'s turn (level ${p.lvl}) —`);fx('turn',p.i);
  if(p.fresh){p.fresh=false;drawTo(p,'door',R.START);drawTo(p,'treasure',R.START);lg(p.i,`${p.nm} is back with a fresh hand of cards.`)}
  if(G.turn>R.MAXTURN&&!G.winner){const b=alive().sort((a,b)=>b.lvl-a.lvl)[0];G.winner='P'+(b.i+1);G.winText=`Time's up: ${b.nm} leads at level ${b.lvl}.`}
  openWindow()}
function kick(){const p=curPl();const id=drawOne('door');if(id==null){G.phase='after';return}takeKicked(p,id)}
function takeKicked(p,id,res){const kv=res?'reaches into the discards':'kicks open the door';G.kicked=id;const c=cd(id);fx('door',id);
  if(c.t==='monster'){startCombat(p.i,id,'kick');return}
  if(c.t==='curse'){lg(p.i,`${p.nm} ${kv}… a curse!`);G.phase='after';applyCurse(p,id,p.i,true);return}
  if(c.sp==='divine'){lg(p.i,`${p.nm} ${kv}…`);G.phase='after';gain(p,id);G.kicked=null;return}
  lg(p.i,`${p.nm} ${res?'takes back':'kicks open the door and finds'} ${c.n}, which goes to hand.`);p.hand.push(id);G.phase='after'}
function lootRoom(){const p=curPl();const id=drawOne('door');if(id!=null){gain(p,id);lg(p.i,`${p.nm} loots the room and draws a face-down door card.`)}G.phase='post'}
function endTurn(){const p=curPl();if(p.hand.length>handLimit(p)&&!p.dead){G.phase='charity';return}afterEnd()}
function afterEnd(){if(G.winner)return;nextTurn()}
// charity: extras go to the lowest-level player(s); if you are the lowest (or tied), discard them [R §4]
function charityTargets(p){const others=alive().filter(o=>o!==p&&!o.dead);if(!others.length)return[];const low=Math.min(...others.map(o=>o.lvl));if(p.lvl<=low)return[];return others.filter(o=>o.lvl===low).map(o=>o.i)}
// a start-of-turn window: before the active player acts, others may curse or level up [H2]
function openWindow(){if(G.winner)return;const ord=[];for(let j=1;j<G.pl.length;j++){const o=P((G.active+j)%G.pl.length);if(o.gone)continue;if(o.human?humanWindow(o):aiWantsWindow(o))ord.push(o.i)}
  if(!ord.length)return;G.win={ord,i:0,back:G.phase};G.phase='window'}
function humanWindow(o){const ph=G.phase;G.phase='window';let ok=false;try{ok=playsFor(o.i).some(m=>{const c=cd(m.card);return c.t==='curse'||c.t==='level'||c.sp==='steal'})}finally{G.phase=ph}return ok}
// ---- valid moves (the single source of truth for what a seat may do) ----
function sideToAct(){if(!G||G.winner)return -1;if(G.q)return G.q.who;
  if(G.phase==='setup')return G.setupOrd[G.setupI];
  if(G.phase==='combat'){const cb=G.cb;if(cb.stage==='act')return cb.who;if(cb.stage==='others')return cb.ord[cb.oi];return cb.who}
  if(G.phase==='window')return G.win.ord[G.win.i];
  return G.active}
const calmPh=()=>['main','after','post'].includes(G.phase);
// cards a seat may play from hand now, with their targets
function playsFor(s){const p=P(s),out=[];const cb=G.cb;const my=s===G.active;const setup=G.phase==='setup';const calm=(my&&calmPh())||setup;
  const inCb=G.phase==='combat'&&cb&&(cb.stage==='act'||cb.stage==='others');const fighter=inCb&&s===cb.who;const inFight=inCb&&(s===cb.who||s===cb.help);
  const anyTime=calm||inCb||G.phase==='window';
  for(const id of p.hand){const c=cd(id);
    switch(c.t){
    case 'race':case 'class':if(calm)out.push({act:'play',card:id});break;
    case 'monster':if(my&&G.phase==='after'&&!G.fought)out.push({act:'trouble',card:id});if(inCb&&c.undead&&cb.mons.some(m=>mdef(m).undead))out.push({act:'join',card:id});break;
    case 'curse':if(anyTime)for(const o of alive())out.push({act:'play',card:id,tgt:o.i});break;
    case 'level':if(anyTime&&levelOK(p,c))for(const o of alive())if(o.lvl<R.WIN-1&&!o.dead&&(o.i===s||!setup))out.push({act:'play',card:id,tgt:o.i});break;
    case 'enh':if(inCb)cb.mons.forEach((m,j)=>out.push({act:'play',card:id,tgt:j}));break;
    case 'item':if(calm)out.push({act:'play',card:id});break;
    case 'oneshot':if(inCb)out.push(...cbPlays(s,id,c));if(calm&&c.sp==='dowse')out.push({act:'play',card:id});break;
    case 'special':switch(c.sp){
      case 'half':if(calm&&p.race.length&&p.half==null)out.push({act:'play',card:id});break;
      case 'super':if(calm&&p.cls.length&&p.sup==null)out.push({act:'play',card:id});break;
      case 'wander':if(inCb)for(const x of p.hand)if(x!==id&&cd(x).t==='monster')out.push({act:'play',card:id,tgt:x});break;
      case 'cheat':if(calm)for(const e of p.eq)if(e.cheat==null&&(!reqOK(p,cd(e.id))||equipWhy(p,e.id)||bigWhy(p,e.id)))out.push({act:'play',card:id,tgt:e.id});break;
      case 'illusion':if(inCb)cb.mons.forEach((m,j)=>{for(const x of p.hand)if(x!==id&&cd(x).t==='monster')out.push({act:'play',card:id,tgt:j,opt:x})});break;
      case 'lunch':if(inCb)out.push({act:'play',card:id});break;
      case 'borrow':if(fighter&&!winning(cb))for(const o of alive())if(o.i!==s)for(const e of o.eq){if(!e.on&&!cd(e.id).b)continue;const c2=cd(e.id);if(reqOK(p,c2)&&sideStr(cb)+(c2.b||0)>monStr(cb))out.push({act:'play',card:id,tgt:o.i,opt:e.id})}break;
      case 'hire':if(anyTime&&p.hire==null)out.push({act:'play',card:id});break;
      case 'divine':if(anyTime)out.push({act:'play',card:id});break;
      case 'steal':if(anyTime)for(const o of alive())if(o.i!==s&&o.lvl>1&&p.lvl<R.WIN-1)out.push({act:'play',card:id,tgt:o.i});break;
      }break;
    }}
  return out}
function levelOK(p,c){if(c.sp==='killhire')return G.pl.some(o=>o.hire!=null);if(c.sp==='after')return G.phase==='post'&&G.afterFight;if(c.sp==='whine')return p.lvl<highestLvl();return true}
// one-shots in a fight
function cbPlays(s,id,c){const cb=G.cb,p=P(s);const o=[];const fighter=s===cb.who;
  switch(c.sp){
  case undefined:o.push({act:'play',card:id,tgt:'p'},{act:'play',card:id,tgt:'m'});break;
  case 'garlic':o.push({act:'play',card:id,tgt:'p'},{act:'play',card:id,tgt:'m'});cb.mons.forEach((m,j)=>{if(mdef(m).sp==='nose')o.push({act:'play',card:id,tgt:j})});break;
  case 'elfwater':if(fighters(cb).some(f=>isRace(f,'elf')))o.push({act:'play',card:id,tgt:'p'});break;
  case 'dbl':if(cb.help<0&&(fighter))o.push({act:'play',card:id});break;
  case 'flee':o.push({act:'play',card:id});break;
  case 'wall':if((fighter||s===cb.help)&&!winning(cb))o.push({act:'play',card:id});break;
  case 'poly':cb.mons.forEach((m,j)=>o.push({act:'play',card:id,tgt:j}));break;
  case 'lamp':if(s===G.active&&(fighter||s===cb.help)&&!cb.transfer)cb.mons.forEach((m,j)=>o.push({act:'play',card:id,tgt:j}));break;
  case 'transfer':for(const x of alive())if(x.i!==cb.who&&!x.dead)o.push({act:'play',card:id,tgt:x.i});break;
  case 'dowse':o.push({act:'play',card:id});break;
  }
  return o}
function validMoves(s){if(!G||G.winner)return[];if(s===undefined)s=sideToAct();const who=sideToAct();const p=P(s);if(!p)return[];const mv=[];
  if(G.q){if(G.q.who!==s)return[];return qMoves(G.q)}
  if(s!==who)return[];
  const ph=G.phase;
  if(ph==='setup'){mv.push(...playsFor(s),...equipMoves(p));mv.push({act:'ready'});return mv}
  if(ph==='window'){mv.push(...playsFor(s).filter(m=>{const c=cd(m.card);return c.t==='curse'||c.t==='level'||c.sp==='steal'||c.sp==='hire'}));mv.push({act:'pass'});return mv}
  if(ph==='combat'){const cb=G.cb;
    if(cb.stage==='act'){mv.push(...playsFor(s),...abilityMoves(s));const win=winning(cb);
      if(cb.help<0&&!win&&!cb.nohelp&&!cb.dbl)for(const o of alive())if(o.i!==s&&!cb.asked.includes(o.i)&&!o.dead){const allure=eqItems(p).some(x=>cd(x).sp==='allure');for(let n=0;n<=(allure?0:Math.min(6,cbTreasure(cb)));n++)mv.push({act:'ask',tgt:o.i,opt:n})}
      for(const [j,m] of cb.mons.entries()){const c=mdef(m);if(c.sp==='golem'&&!isRace(P(cb.who),'halfling'))mv.push({act:'skip',tgt:j});if(c.sp==='vamp'&&fighters(cb).some(f=>isCls(f,'cleric')))mv.push({act:'shoo',tgt:j});
        if(c.sp==='nose'&&!win)for(const id of p.eq.map(e=>e.id).concat(p.hand))if(cd(id).t==='item'&&(cd(id).g||0)>=200)mv.push({act:'bribe',card:id,tgt:j})}
      mv.push({act:win?'fight':'run'});return dedupe(mv)}
    if(cb.stage==='others'){mv.push(...playsFor(s),...abilityMoves(s));mv.push({act:'pass'});return dedupe(mv)}
    return[]}
  if(ph==='main'){mv.push(...playsFor(s),...calmMoves(p));mv.push({act:'kick'});if(isCls(p,'cleric')&&G.dd.length&&p.hand.length)for(const id of p.hand)mv.push({act:'resurrect',card:id});return mv}
  if(ph==='after'){mv.push(...playsFor(s),...calmMoves(p));mv.push({act:'loot'});return mv}
  if(ph==='post'){mv.push(...playsFor(s),...calmMoves(p));mv.push({act:'end'});return mv}
  if(ph==='charity'){const t=charityTargets(p);for(const id of p.hand){if(t.length)for(const o of t)mv.push({act:'give',card:id,tgt:o});else mv.push({act:'toss',card:id})}return mv}
  return mv}
function dedupe(mv){const seen=new Set();return mv.filter(m=>{const k=mvKey(m);if(seen.has(k))return false;seen.add(k);return true})}
function equipMoves(p){const mv=[];for(const e of p.eq){if(e.on)mv.push({act:'unequip',card:e.id});else if(!equipWhy(p,e.id))mv.push({act:'equip',card:e.id})}for(const id of p.race.concat(p.cls))mv.push({act:'drop',card:id});return mv}
function calmMoves(p){const mv=equipMoves(p);if(sellable(p).length&&maxSell(p)>=R.SELL&&p.lvl<R.WIN-1)mv.push({act:'sell'});
  if(isCls(p,'thief')&&p.hand.length)for(const o of alive())if(o!==p)for(const e of o.eq)if(!cd(e.id).big)mv.push({act:'steal',card:e.id,tgt:o.i});
  if(p.hire!=null)mv.push({act:'drop',card:p.hire});
  return mv}
function sellable(p){return p.hand.concat(p.eq.map(e=>e.id)).filter(id=>cd(id).g!=null&&(cd(id).t==='item'||cd(id).t==='oneshot'))}
function maxSell(p){const ids=sellable(p);let t=ids.reduce((a,id)=>a+(cd(id).g||0),0);if(isRace(p,'halfling')&&!p.halfT&&ids.length)t+=Math.max(...ids.map(id=>cd(id).g||0));return t}
function sellValue(p,ids){let t=ids.reduce((a,id)=>a+(cd(id).g||0),0);if(isRace(p,'halfling')&&!p.halfT&&ids.length)t+=Math.max(...ids.map(id=>cd(id).g||0));return t}
// class and race powers in combat
function abilityMoves(s){const p=P(s),cb=G.cb,mv=[];if(!p.hand.length)return mv;const inFight=s===cb.who||s===cb.help;
  if(isCls(p,'warrior')&&inFight&&(cb.used['b'+s]||0)<R.BERSERK&&!special(cb,'lvlonly'))for(const id of p.hand)mv.push({act:'berserk',card:id});
  if(isCls(p,'cleric')&&inFight&&(cb.used['t'+s]||0)<R.TURN&&cb.mons.some(m=>mdef(m).undead))for(const id of p.hand)mv.push({act:'turn',card:id});
  if(isCls(p,'wizard')&&inFight&&!cb.used['c'+s])cb.mons.forEach((m,j)=>mv.push({act:'charm',tgt:j}));
  if(isCls(p,'wizard')&&inFight&&!winning(cb)&&(cb.used['f'+s]||0)<R.FLIGHT)for(const id of p.hand)mv.push({act:'flight',card:id});
  if(isCls(p,'thief'))for(const t of fighters(cb))if(t.i!==s&&!cb.used['s'+s+'_'+t.i])for(const id of p.hand)mv.push({act:'backstab',card:id,tgt:t.i});
  return mv}
function qMoves(q){const mv=[];const p=P(q.who);
  switch(q.kind){
  case 'help':case 'glue':case 'lawyer':case 'fetch':mv.push({act:'opt',opt:'yes'},{act:'opt',opt:'no'});break;
  case 'ward':mv.push({act:'opt',opt:'yes'},{act:'opt',opt:'no'});break;
  case 'rescue':{const r=G.cb.runs[q.run];for(const id of rescueOpts(p,r))mv.push({act:'use',card:id});mv.push({act:'opt',opt:'no'});break}
  case 'pick':q.opts.forEach((v,i)=>mv.push({act:'pick',opt:i}));break}
  return mv}
const mvKey=m=>[m.act,m.card,m.tgt,m.opt].map(x=>x===undefined?'':x).join('|');
// ---- performing a move ----
function performMove(m,seat){if(!G)return{success:false,error:'no game'};if(G.winner)return{success:false,error:'the game is over'};
  if(seat===undefined)seat=sideToAct();const n=norm(m);
  if(n.act==='sell'&&n.cards){const p=P(seat);const ok=validMoves(seat).some(x=>x.act==='sell');const own=new Set(sellable(p));if(!ok||!n.cards.length||!n.cards.every(id=>own.has(id))||new Set(n.cards).size!==n.cards.length)return{success:false,error:'you can’t sell those now'};
    if(sellValue(p,n.cards)<R.SELL)return{success:false,error:`sell at least ${R.SELL} gold at once (these make ${sellValue(p,n.cards)})`};doSell(p,n.cards);return{success:true}}
  if(n.act==='sell')return{success:false,error:'choose the items to sell (cards=id,id,...)'};
  const vm=validMoves(seat);const k=mvKey(n);
  if(!vm.some(x=>mvKey(x)===k))return{success:false,error:`not a legal move for seat ${seat} now (${G.phase}); legal: ${vm.slice(0,6).map(mvKey).join(', ')}`};
  apply(n,seat);return{success:true}}
function norm(m){const o={act:String(m.act)};if(m.card!==undefined&&m.card!==''&&m.card!==null)o.card=+m.card;if(m.tgt!==undefined&&m.tgt!==''&&m.tgt!==null)o.tgt=isNaN(+m.tgt)?String(m.tgt):+m.tgt;if(m.opt!==undefined&&m.opt!==''&&m.opt!==null)o.opt=isNaN(+m.opt)?String(m.opt):+m.opt;
  if(m.cards!==undefined)o.cards=String(m.cards).split(',').filter(Boolean).map(Number);return o}
function gameAct(ds,seat){const r=performMove(ds,seat);if(!r.success){UI.rej=(UI.rej||0)+1;UI.lastErr=r.error;return false}refresh();return true}
function apply(m,s){const p=P(s);const cb=G.cb;
  switch(m.act){
  case 'ready':G.setupI++;if(G.setupI>=G.setupOrd.length){G.phase='main';lg(G.active,`— ${curPl().nm}'s turn (level ${curPl().lvl}) —`);openWindow()}break;
  case 'kick':kick();break;
  case 'resurrect':{const id=G.dd.pop();spend(p,m.card);lg(s,`${p.nm} resurrects ${cname(id)} from the door discards instead of kicking a new door.`);takeKicked(p,id,1);break}
  case 'loot':lootRoom();break;
  case 'trouble':p.hand.splice(p.hand.indexOf(m.card),1);startCombat(s,m.card,'trouble');break;
  case 'end':endTurn();break;
  case 'equip':{const e=p.eq.find(e=>e.id===m.card);e.on=true;lg(s,`${p.nm} equips ${cname(m.card)}.`);break}
  case 'unequip':{const e=p.eq.find(e=>e.id===m.card);e.on=false;lg(s,`${p.nm} takes off ${cname(m.card)} and carries it.`);break}
  case 'drop':if(p.hire===m.card){discard(p.hire);p.hire=null;lg(s,`${p.nm} lets the Porter go.`);fixBig(p)}else dropTrait(p,m.card);break;
  case 'play':playCard(p,m.card,m.tgt,m.opt);break;
  case 'join':p.hand.splice(p.hand.indexOf(m.card),1);lg(s,`${p.nm} adds undead ${cname(m.card)} to the fight.`);enterMonster(m.card,s,false);reopen();break;
  case 'give':{p.hand.splice(p.hand.indexOf(m.card),1);P(m.tgt).hand.push(m.card);lg(s,`${p.nm} gives a card to ${P(m.tgt).nm} (charity).`);if(p.hand.length<=handLimit(p))afterEnd();break}
  case 'toss':{p.hand.splice(p.hand.indexOf(m.card),1);discard(m.card);lg(s,`${p.nm} discards ${cname(m.card)} (charity).`);if(p.hand.length<=handLimit(p))afterEnd();break}
  case 'ask':{cb.asked.push(m.tgt);const allure=eqItems(p).some(x=>cd(x).sp==='allure');lg(s,`${p.nm} asks ${P(m.tgt).nm} for help${allure?' (the Charming Kneepads leave no choice)':`, offering ${m.opt} treasure${m.opt===1?'':'s'}`}.`);
    if(allure){cb.help=m.tgt;cb.offer=0;reopen();break}G.q={who:m.tgt,kind:'help',from:s,n:m.opt};break}
  case 'opt':answer(m.opt,s);break;
  case 'pick':{const q=G.q;G.q=null;resume(q.cont,q.opts[m.opt]);break}
  case 'use':useRescue(p,m.card);break;
  case 'fight':cb.stage='others';cb.ord=[];for(let j=1;j<G.pl.length;j++){const o=P((cb.who+j)%G.pl.length);if(!o.gone)cb.ord.push(o.i)}cb.oi=0;if(!cb.ord.length)resolveWin();else lg(s,`${p.nm} is ready to fight. Last chance to interfere!`);break;
  case 'pass':if(G.phase==='window'){G.win.i++;if(G.win.i>=G.win.ord.length){G.phase=G.win.back;G.win=null}break}
    cb.oi++;if(cb.oi>=cb.ord.length){if(winning(cb))resolveWin();else reopen()}break;
  case 'run':startRun();break;
  case 'skip':{const mm=cb.mons.splice(m.tgt,1)[0];lg(s,`${p.nm} tiptoes past ${cname(mm.id)}.`);discard(mm.id);mm.enh.forEach(discard);if(!checkEmpty())reopen();break}
  case 'shoo':{const mm=cb.mons.splice(m.tgt,1)[0];cb.killed.push({id:mm.id,def:mdef(mm),tr:monTr(mm,cb),enh:mm.enh,kill:false});lg(s,`Boo! ${cname(mm.id)} runs off, leaving his treasure.`);if(!checkEmpty())reopen();break}
  case 'bribe':{loseCard(p,m.card,'a bribe');const mm=cb.mons.splice(m.tgt,1)[0];discard(mm.id);mm.enh.forEach(discard);lg(s,`${cname(mm.id)} sniffs the bribe and floats off.`);if(!checkEmpty())reopen();break}
  case 'berserk':spend(p,m.card);cb.used['b'+s]=(cb.used['b'+s]||0)+1;cb.bers+=1;lg(s,`${p.nm} goes berserk (+1).`);after(s);break;
  case 'turn':spend(p,m.card);cb.used['t'+s]=(cb.used['t'+s]||0)+1;cb.turnB+=R.TURN_B;lg(s,`${p.nm} turns the undead (+${R.TURN_B}).`);after(s);break;
  case 'flight':spend(p,m.card);cb.used['f'+s]=(cb.used['f'+s]||0)+1;lg(s,`${p.nm} readies a flight spell (+1 to run away).`);after(s);break;
  case 'charm':{const n=p.hand.length;while(p.hand.length)discard(p.hand.pop());const mm=cb.mons.splice(m.tgt,1)[0];cb.used['c'+s]=1;cb.killed.push({id:mm.id,def:mdef(mm),tr:monTr(mm,cb),enh:mm.enh,kill:false});
    lg(s,`${p.nm} discards ${n} card${n===1?'':'s'} and charms ${cname(mm.id)}: it wanders off and leaves its treasure.`);if(!checkEmpty())reopen();break}
  case 'backstab':spend(p,m.card);note(m.tgt,s,'stab');cb.used['s'+s+'_'+m.tgt]=1;cb.pb-=2;lg(s,`${p.nm} backstabs ${P(m.tgt).nm} (-2).`);after(s);break;
  case 'steal':{spend(p,p.hand.slice().sort((a,b)=>cardValue(p,a)-cardValue(p,b))[0]);const v=P(m.tgt);const r=d6()+persMod(p,'die');G.stole=true;G.lastRoll={v:r,mod:0,need:R.THEFT,who:s,ok:r>=R.THEFT,id:(G.lastRoll?G.lastRoll.id:0)+1,what:'steal'};
    if(r>=R.THEFT){const e=v.eq.find(e=>e.id===m.card);v.eq.splice(v.eq.indexOf(e),1);if(e.cheat!=null)discard(e.cheat);p.eq.push({id:m.card,on:false});lg(s,`${p.nm} rolls ${r} and steals ${cname(m.card)} from ${v.nm}!`);fixBig(p)}else{loseLv(p,1);lg(s,`${p.nm} rolls ${r}, gets caught stealing from ${v.nm} and is whacked down a level.`)}break}
  }
  checkEnd()}
function after(s){const cb=G.cb;if(cb&&s!==cb.who&&cb.stage==='others')reopen()}
function checkEnd(){}
function spend(p,id){if(id==null)return;const i=p.hand.indexOf(id);if(i>=0){p.hand.splice(i,1);discard(id)}}
function fixBig(p){while(bigCount(p)>bigCap(p)){const bs=p.eq.filter(e=>cd(e.id).big&&e.cheat==null).sort((a,b)=>itemWorth(p,a.id)-itemWorth(p,b.id));loseCard(p,bs[0].id,'too many Big items')}}
function answer(opt,s){const q=G.q;G.q=null;const p=P(s);
  switch(q.kind){
  case 'help':{const cb=G.cb;if(opt==='yes'){cb.help=s;cb.offer=q.n;lg(s,`${p.nm} agrees to help${q.n?` for ${q.n} treasure${q.n>1?'s':''}`:''}.`);reopen()}else lg(s,`${p.nm} refuses to help.`);break}
  case 'rescue':finishRun(G.cb.runs[q.run]);break;
  case 'glue':{const r=G.cb.runs[q.run];if(opt==='yes')useGlue(p,r);else{r.glued=true;finishRun(r)}break}
  case 'lawyer':if(opt==='yes')lawyerSwap(p);checkEmpty();break;
  case 'fetch':{const r=G.cb.runs[q.run];if(opt==='yes'){loseCard(p,q.card,'thrown for the hound');r.ok=true;lg(s,`The hound chases the stick instead.`);finishRun(r)}else roll(r);break}
  case 'ward':if(opt==='yes')wardOff(p,q.ring,q.curse);else landCurse(p,q.curse);break}
  if(!G.q)runOps()}
function useRescue(p,id){const q=G.q;G.q=null;const cb=G.cb;const r=cb.runs[q.run];const c=cd(id);
  if(c.sp==='invis'){spend(p,id);r.ok=true;lg(p.i,`${p.nm} drinks ${c.n} and vanishes!`);r.glued=r.glued||false;return finishRun(r)}
  if(c.sp==='die'){spend(p,id);r.r=6;r.ok=6+r.mod>=R.RUN;G.lastRoll=Object.assign({},G.lastRoll,{v:6,ok:r.ok,id:G.lastRoll.id+1});lg(p.i,`${p.nm} uses ${c.n}: it's a 6${r.ok?'':' and still not enough'}!`);if(!r.ok&&rescueOpts(p,r).length){G.q={who:p.i,kind:'rescue',run:q.run};return}return finishRun(r)}
  if(c.sp==='ratstick'){loseCard(p,id,'tossed as a snack');r.ok=true;return finishRun(r)}
  if(c.sp==='lamp'){spend(p,id);const mi=cb.mons.findIndex(m=>m.id===r.m);const mm=cb.mons.splice(mi,1)[0];discard(mm.id);mm.enh.forEach(discard);cb.runs.filter(x=>x.m===r.m).forEach(x=>{x.done=true;x.ok=true});lg(p.i,`${p.nm} rubs ${c.n}: ${cname(mm.id)} vanishes!`);return nextRun()}}
// ---- playing a card ----
function playCard(p,id,tgt,opt){const c=cd(id);const cb=G.cb;const s=p.i;
  const take=()=>{const i=p.hand.indexOf(id);if(i>=0)p.hand.splice(i,1)};take();
  switch(c.t){
  case 'race':case 'class':{const z=c.t==='race'?p.race:p.cls;const dual=c.t==='race'?p.half!=null:p.sup!=null;
    const same=z.findIndex(x=>cd(x).k===c.k);
    if(!dual){z.forEach(discard);z.length=0}else if(same>=0)discard(z.splice(same,1)[0]);else if(z.length>=2)discard(z.shift());
    z.push(id);lg(s,`${p.nm} becomes ${c.n==='Elf'||c.n==='Dwarf'||c.n==='Halfling'?'a'+(c.n==='Elf'?'n':'')+' ':'a '}${c.n}.`);revalidate(p);break}
  case 'monster':break;
  case 'curse':applyCurse(P(tgt),id,s,false);if(cb&&!G.q)reopen();break;
  case 'level':{discard(id);const t=P(tgt);if(c.sp==='killhire'){const o=G.pl.find(o=>o.hire!=null);discard(o.hire);o.hire=null;fixBig(o);lg(o.i,`${o.nm}'s Porter is fired.`)}
    gainLv(t,1,c.n,false);lg(s,`${p.nm} plays ${c.n}: ${t===p?'':t.nm+' '}go${t===p?'':'es'} up a level.`);if(cb)reopen();break}
  case 'enh':{const m=cb.mons[tgt];if(c.sp==='mate'){cb.mons.push({id,enh:[],like:m.like!=null?m.like:m.id,src:m.id,snap:m.enh.slice()});lg(s,`${p.nm} plays ${c.n}: ${cname(m.like!=null?m.like:m.id)} brings a date!`);fx('monster',id)}
    else{m.enh.push(id);if(c.b>0&&s!==cb.who&&s!==cb.help)note(cb.who,s,'boost');lg(s,`${p.nm} makes ${mdef(m).n} ${c.b>0?'tougher':'weaker'} with ${c.n} (${c.b>0?'+':''}${c.b}).`)}reopen();break}
  case 'item':{const e={id,on:false};p.eq.push(e);if(!equipWhy(p,id)){e.on=true;lg(s,`${p.nm} puts on ${c.n}.`)}else lg(s,`${p.nm} puts ${c.n} into play, carried (${equipWhy(p,id)}).`);fixBig(p);break}
  case 'oneshot':playOneShot(p,id,c,tgt);break;
  case 'special':
    switch(c.sp){
    case 'half':p.half=id;lg(s,`${p.nm} plays ${c.n}: two races allowed.`);revalidate(p);break;
    case 'super':p.sup=id;lg(s,`${p.nm} plays ${c.n}: two classes allowed.`);revalidate(p);break;
    case 'wander':{discard(id);p.hand.splice(p.hand.indexOf(tgt),1);lg(s,`${p.nm} sends in ${cname(tgt)} (level ${cd(tgt).lvl}) as an uninvited guest!`);fx('monster',tgt);enterMonster(tgt,s,false);reopen();break}
    case 'cheat':{const e=p.eq.find(e=>e.id===tgt);e.cheat=id;e.on=true;lg(s,`${p.nm} finds a loophole: ${cname(tgt)} is worn against the rules.`);break}
    case 'illusion':{discard(id);const mm=cb.mons[tgt];discard(mm.id);mm.enh.forEach(discard);p.hand.splice(p.hand.indexOf(opt),1);cb.mons.splice(tgt,1);lg(s,`${p.nm}: smoke and mirrors! ${cname(mm.id)} becomes ${cname(opt)}.`);enterMonster(opt,s,false);reopen();break}
    case 'lunch':{discard(id);lg(s,`${p.nm} plays ${c.n}: the monsters leave. ${P(cb.who).nm} draws 2 treasures.`);const f=P(cb.who);for(const m of cb.mons){discard(m.id);m.enh.forEach(discard)}cb.mons=[];drawTo(f,'treasure',2);endCombat();break}
    case 'borrow':{discard(id);const o=P(tgt);const e=o.eq.splice(o.eq.findIndex(e=>e.id===opt),1)[0];if(e.cheat!=null)discard(e.cheat);const why=equipWhy(p,opt);if(why){const clash=p.eq.find(x=>x.on&&((cd(x.id).slot&&cd(x.id).slot===cd(opt).slot)||(cd(opt).hands&&cd(x.id).hands)));if(clash)loseCard(p,clash.id,'to make room')}
      p.eq.push({id:opt,on:!equipWhy(p,opt)});lg(s,`${p.nm} borrows ${cname(opt)} from ${o.nm} for keeps!`);fixBig(p);reopen();break}
    case 'hire':p.hire=id;lg(s,`${p.nm} hires ${c.n}.`);break;
    case 'divine':p.hand.push(id);p.hand.splice(p.hand.indexOf(id),1);gain(p,id);break;
    case 'steal':{discard(id);const t=P(tgt);loseLv(t,1);gainLv(p,1,c.n,false);lg(s,`${p.nm} plays ${c.n} and steals a level from ${t.nm}.`);if(cb)reopen();break}
    }break;
  }}
function playOneShot(p,id,c,tgt){const cb=G.cb;const s=p.i;
  switch(c.sp){
  case 'dowse':{discard(id);const pool=G.dd.concat(G.td).filter(x=>x!==id);lg(s,`${p.nm} rummages through the discards…`);choose(s,'dowse',pool,{k:'dowse',p:s},'Take any one card from the discard piles.');return}
  case 'flee':discard(id);lg(s,`${p.nm} uses ${c.n}: all the monsters leave. No treasure.`);for(const m of cb.mons){discard(m.id);m.enh.forEach(discard)}cb.mons=[];cb.killed=cb.killed.filter(k=>k.kill);checkEmpty();return;
  case 'dbl':cb.dbl++;cb.os.push({id,side:'p'});lg(s,`${p.nm} uses ${c.n}: their strength is doubled.`);after(s);return;
  case 'wall':cb.os.push({id,side:'p'});cb.wall=true;lg(s,`${p.nm} throws up ${c.n}!`);startRun();return;
  case 'elfwater':cb.water++;cb.os.push({id,side:'p'});lg(s,`${p.nm} pours ${c.n}: +2 for each Elf.`);after(s);return;
  case 'poly':{discard(id);const mm=cb.mons.splice(tgt,1)[0];cb.killed.push({id:mm.id,def:mdef(mm),tr:monTr(mm,cb),enh:mm.enh,kill:false});lg(s,`${p.nm} throws ${c.n}: ${mdef(mm).n} becomes a parrot and flies off, leaving its treasure.`);if(!checkEmpty())reopen();return}
  case 'lamp':{discard(id);const only=cb.mons.length===1&&!cb.killed.length;const mm=cb.mons.splice(tgt,1)[0];if(only)cb.killed.push({id:mm.id,def:mdef(mm),tr:monTr(mm,cb),enh:mm.enh,kill:false});else{discard(mm.id);mm.enh.forEach(discard)}lg(s,`${p.nm} rubs ${c.n}: ${mdef(mm).n} vanishes${only?', leaving its treasure':''}!`);if(!checkEmpty())reopen();return}
  case 'transfer':{discard(id);const t=P(tgt);cb.thief=t.i===s?s:-1;lg(s,`${p.nm} uses ${c.n}: ${t.nm} now has to fight!`);cb.who=t.i;cb.help=-1;cb.offer=0;cb.asked=[];cb.transfer=true;cb.used={};cb.bers=0;cb.turnB=0;cb.dbl=0;reopen();return}
  case 'garlic':if(typeof tgt==='number'){discard(id);const mm=cb.mons.splice(tgt,1)[0];cb.killed.push({id:mm.id,def:mdef(mm),tr:monTr(mm,cb),enh:mm.enh,kill:true});lg(s,`${p.nm} gargles garlic: ${mdef(mm).n} keels over!`);if(!checkEmpty())reopen();return}break;
  }
  const b=c.b||0;if(tgt==='p')cb.pb+=b;else{cb.mb+=b;if(b>0&&s!==cb.who&&s!==cb.help)note(cb.who,s,'boost')}cb.os.push({id,side:tgt});if(tgt==='p'&&tagged(id,'fire'))cb.fire=true;
  lg(s,`${p.nm} throws ${c.n}: +${b} for ${tgt==='p'?'the heroes':'the monsters'}.`);fx('shot',s);
  if(s!==cb.who||tgt==='m')reopen()}
function revalidate(p){for(const e of p.eq)if(e.on&&e.cheat==null&&!reqOK(p,cd(e.id))){e.on=false;lg(p.i,`${p.nm} can no longer use ${cd(e.id).n} and carries it instead.`)}fixBig(p)}
function doSell(p,ids){let g=sellValue(p,ids);const half=isRace(p,'halfling')&&!p.halfT;if(half)p.halfT=true;
  ids.forEach(id=>{const e=p.eq.findIndex(x=>x.id===id);if(e>=0){const x=p.eq.splice(e,1)[0];if(x.cheat!=null)discard(x.cheat)}else p.hand.splice(p.hand.indexOf(id),1);discard(id)});
  const lv=Math.floor(g/R.SELL);const got=gainLv(p,lv,'selling',false);p.soldT=true;fixBig(p);
  lg(p.i,`${p.nm} sells ${ids.map(cname).join(', ')} for ${g} gold${half?' (Halfling: one item at double price)':''}: +${got} level${got===1?'':'s'}.`)}
// ---- invariants and test hooks ----
function checkInvariants(){if(!G)return[];const v=[];const seen={};const note=(id,z)=>{if(seen[id]!==undefined)v.push(`card ${id} in ${z} and ${seen[id]}`);seen[id]=z};
  G.door.forEach(i=>note(i,'door'));G.tr.forEach(i=>note(i,'tr'));G.dd.forEach(i=>note(i,'dd'));G.td.forEach(i=>note(i,'td'));
  for(const p of G.pl){p.hand.forEach(i=>note(i,'hand'+p.i));p.eq.forEach(e=>{note(e.id,'eq'+p.i);if(e.cheat!=null)note(e.cheat,'cheat'+p.i)});p.race.forEach(i=>note(i,'race'+p.i));p.cls.forEach(i=>note(i,'cls'+p.i));p.curse.forEach(i=>note(i,'curse'+p.i));
    for(const z of ['half','sup','hire'])if(p[z]!=null)note(p[z],z+p.i);
    if(p.lvl<1||p.lvl>R.WIN)v.push(`${p.nm} level ${p.lvl}`);if(p.race.length>(p.half!=null?2:1))v.push(`${p.nm} has too many races`);if(p.cls.length>(p.sup!=null?2:1))v.push(`${p.nm} has too many classes`);
    const on=p.eq.filter(e=>e.on&&e.cheat==null).map(e=>cd(e.id));for(const s of SLOTS)if(on.filter(c=>c.slot===s).length>1)v.push(`${p.nm} wears two ${s}`);if(on.reduce((a,c)=>a+(c.hands||0),0)>2)v.push(`${p.nm} uses more than two hands`);
    if(bigCount(p)>bigCap(p))v.push(`${p.nm} carries too many Big items`);for(const e of p.eq)if(e.on&&!reqOK(p,cd(e.id),e))v.push(`${p.nm} wears ${cd(e.id).n} illegally`)}
  if(G.cb){for(const m of G.cb.mons){note(m.id,'combat');m.enh.forEach(i=>note(i,'enh'))}G.cb.os.forEach(o=>note(o.id,'os'));G.cb.killed.forEach(k=>{note(k.id,'killed');k.enh.forEach(i=>note(i,'kenh'))})}
  if(G.loot)G.loot.pool.forEach(i=>note(i,'loot'));
  if(G.q&&G.q.kind==='ward')note(G.q.curse,'pending curse');
  const total=Object.keys(G.C).length;if(Object.keys(seen).length!==total)v.push(`card count ${Object.keys(seen).length} != ${total}`);
  if(!G.winner&&sideToAct()>=0&&!validMoves(sideToAct()).length)v.push(`no legal move for seat ${sideToAct()} in ${G.phase}${G.q?' q '+G.q.kind:''}`);
  if(!G.winner&&(G.ops.length||G.then)&&!G.q)v.push('ops left unprocessed');
  return v}
function render_game_to_text(){if(!G)return JSON.stringify({screen:'start'});const me=typeof mySeat==='function'?mySeat():0;
  return JSON.stringify({phase:G.phase,turn:G.turn,active:G.active,toAct:sideToAct(),winner:G.winner,q:G.q&&{who:G.q.who,kind:G.q.kind,why:G.q.why},
    players:G.pl.map(p=>({nm:p.nm,lvl:p.lvl,str:pStr(p),sex:p.sex,race:races(p),cls:classes(p),dead:p.dead,hand:p.i===me?p.hand.map(cname):p.hand.length,eq:p.eq.map(e=>cname(e.id)+(e.on?'':' (carried)'))})),
    combat:G.cb?{who:G.cb.who,help:G.cb.help,mons:G.cb.mons.map(m=>mdef(m).n),side:sideStr(G.cb),mon:monStr(G.cb),stage:G.cb.stage}:null,
    moves:me>=0?validMoves(me).slice(0,20).map(mvKey):[],log:G.log.slice(0,5).map(l=>l.t)})}
function getPlayerView(g,seat){const v=JSON.parse(JSON.stringify(g));v.pl.forEach(p=>{if(p.i!==seat)p.hand=p.hand.map(()=>-1)});v.door=v.door.length;v.tr=v.tr.length;delete v.rng;return v}
