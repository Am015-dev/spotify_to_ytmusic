// ---------- Shipwreck Isle engine. G is plain JSON; everything that happens runs as frames on G.stk; choices pause on G.q ----------
var ANIM=1, AIDELAY=500, DEFSEED=null, DEFSCEN='marooned', DEFCHARS=null, LVMIX=null;
const SAVE='swi_save1';
let G=null;const UI={beats:[],shown:-1,fx:[],sel:null,pause:false,speed:1,hints:true,tab:'plan',lastSeat:-1};
function rnd(n){let t=(G.rng+=0x6D2B79F5);t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return Math.floor(((t^t>>>14)>>>0)/4294967296*n)}
function setSeed(s){DEFSEED=s>>>0;if(G)G.rng=s>>>0}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=rnd(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
function lg(t,cls){G.logN=(G.logN||0)+1;G.log.unshift({t,r:G.round,c:cls||'',i:G.logN});if(G.log.length>500)G.log.length=500}
// story beats: scene boundaries the UI plays back one at a time (never part of G, never in simulations)
function snapG(){return JSON.stringify(G,(k,v)=>k==='log'||k==='stk'?undefined:v)}
function beat(kind,data){if(UI.sim||typeof document==='undefined')return;const B=UI.beats;const last=B[B.length-1];if(last&&!last.snap)last.snap=snapG();B.push({kind,data:data||{},n0:G.logN||0,round:G.round,phase:G.phase,id:(UI.beatId=(UI.beatId||0)+1)});if(B.length>600){const cut=B.length-600;B.splice(0,cut);UI.shown=Math.max(-1,UI.shown-cut)}}
function beatSet(o){if(UI.sim||typeof document==='undefined')return;const b=UI.beats[UI.beats.length-1];if(b)Object.assign(b.data,o)}
function fx(t,x){UI.fx.push({t,x,at:Date.now()+Math.random()});if(UI.fx.length>40)UI.fx.shift()}
const CARD={};for(const c of [...EVENTS,...WRECKS,...ADVENTURES,...MYSTERIES])CARD[c.k]=c;
const BEAST={};for(const b of BEASTS){BEAST[b.k]=b}
const cname=k=>(CARD[k]||BEAST[k]||{}).n||k;
const TYPES=['threat','hunt','build','gather','explore','camp','rest'];
const TNAME={threat:'Face a threat',hunt:'Hunt',build:'Build',gather:'Gather',explore:'Explore',camp:'Arrange the camp',rest:'Rest'};
const RES=['food','pfood','wood','fur'];const RNAME={food:'food',pfood:'dry food',wood:'wood',fur:'fur'};
// ---------- setup ----------
function newGame(o){o=o||{};const seed=DEFSEED!=null?DEFSEED:Math.floor(Math.random()*2**31);
  const sk=o.scen||DEFSCEN;const S=SCENARIOS[sk];let keys=o.chars||DEFCHARS||['carpenter','cook'];
  G={v:1,rng:seed,seed,scen:sk,round:1,rounds:S.rounds,phase:'start',first:0,log:[],stk:[],q:null,over:null,
    chars:[],fri:null,dog:false,morale:0,res:{food:0,pfood:0,wood:0,fur:0},fut:{food:0,pfood:0,wood:0,fur:0},
    camp:{pos:START_POS,shelter:false,roof:0,pal:0,moved:null},weapon:0,map:MAP.map(m=>({id:m.id,tile:null,down:false,tok:{},exh:{},cov:false})),
    tileDeck:[],inv:{board:[],deck:[],built:{},pending:[],marked:{}},items:[],kept:{},xp:[],pawnsOff:{},
    ev:{deck:[],threat:[null,null],wait:null,disc:[]},adv:{build:[],gather:[],explore:[]},advDisc:[],mys:{deck:[],disc:[]},beast:[],hunt:[],discs:[],own:[],
    tok:{build:{},gather:{},explore:{},camp:{},hunt:{},special:{}},wx:{rain:0,snow:0,storm:0,animals:0},wxEarly:null,night:{food:0,wound:0,marks:{}},prod:{},beastStr:0,cost:{shelter:0,roof:0,pal:0,weapon:0},
    plan:{acts:[],nextId:1,disc:{}},round0:{},noMix:false,sc:{},stats:{explored:1,built:0,fights:0,wounds:0},mode:o.mode||'solo'};
  const np=keys.length;G.np=np;
  keys.forEach((k,i)=>G.chars.push({i,k,nm:CHARS[k].n,w:0,det:0,dead:false,used:{},sp:{},cov:[],human:o.humans?!!o.humans[i]:(o.mode==='ai'?false:true),lv:(LVMIX&&LVMIX[i])||'normal',pawnMinus:0,only:null,noSkills:false,out:null,rr:0,rrNext:0,pmNext:0}));
  if(o.friday!=null?o.friday:np<=2)G.fri={w:0,det:0,dead:false};
  if(o.dog!=null?o.dog:np===1)G.dog=true;
  // island: start tile placed, the rest shuffled
  G.map[START_POS].tile=START_TILE;G.tileDeck=shuffle(TILES.map(t=>t.no).filter(n=>n!==START_TILE));
  // inventions: 9 starting + 5 random (+ scenario ones); personal ones go to their owners
  const normals=Object.keys(INVENTIONS).filter(k=>INVENTIONS[k].kind==='normal');shuffle(normals);
  G.inv.board=Object.keys(INVENTIONS).filter(k=>INVENTIONS[k].kind==='start').concat(normals.slice(0,S.normals||5));G.inv.deck=normals.slice(S.normals||5);
  // decks
  const book=shuffle(EVENTS.filter(e=>e.icon==='book').flatMap(e=>Array(e.cp||1).fill(e.k))),advE=shuffle(EVENTS.filter(e=>e.icon!=='book').flatMap(e=>Array(e.cp||1).fill(e.k)));
  const half=Math.ceil(S.rounds/2);const nb=o.diff==='easy'?Math.max(1,half-2):o.diff==='hard'?half+2:half;G.diff=o.diff||'standard';G.ev.deck=shuffle(book.slice(0,nb).concat(advE.slice(0,2*half-nb)));
  G.ev.threat=[null,'crates'];
  for(const d of ['build','gather','explore'])G.adv[d]=shuffle(ADVENTURES.filter(a=>a.deck===d).flatMap(a=>Array(a.cp||1).fill(a.k)));
  G.mys.deck=shuffle(MYSTERIES.flatMap(m=>Array(m.cp||1).fill(m.k)));
  G.beast=shuffle(BEASTS.map(b=>b.k));
  G.discs=shuffle(Object.keys(DISCS).flatMap(k=>Array(DISCS[k].cp).fill(k)));
  const its=shuffle(Object.keys(ITEMS));G.items=its.slice(0,o.items!=null?o.items:2).map(k=>({k,uses:2}));
  if(o.tutorial&&typeof tutDeal==='function')tutDeal();   // the staged tutorial game (tutor.js): fixed decks
  G.first=0;SC().setup&&SC().setup();if(o.cmp)campSetup(o.cmp);UI.beats.length=0;UI.shown=-1;const fl=typeof FLAVOR!=='undefined'&&FLAVOR.scen&&FLAVOR.scen[sk];if(!o.noIntro)(fl&&fl.intro||[S.x]).forEach((p,i,a)=>beat('intro',{page:i,of:a.length,text:p}));
  lg(`Shipwrecked! ${G.chars.map(c=>c.nm).join(', ')}${G.fri?' and Friday':''}${G.dog?' (with the dog)':''} wash up on the beach. Scenario: ${S.n}.`,'big');
  G.stk.push({f:'round'});run();refresh()}
// ---------- helpers ----------
// hum(c): a person plays this castaway (online games keep that in c.hh, and c.human means "this page plays it")
function hum(c){return !!c&&(c.hh!==undefined?!!c.hh:!!c.human)}
const living=()=>G.chars.filter(c=>!c.dead);
const P=i=>G.chars[i];
const firstC=()=>P(G.first);
const has=k=>!!G.inv.built[k];
const tileAt=pos=>G.map[pos].tile!=null&&!G.map[pos].down?TILES.find(t=>t.no===G.map[pos].tile):null;
function explored(){const s=new Set();for(const m of G.map){const t=tileAt(m.id);if(t&&!m.cov&&!m.fog&&!m.waste)s.add(t.terr)}return s}
function campTile(){return tileAt(G.camp.pos)}
function hasShelter(){return G.camp.shelter||!!(campTile()&&campTile().shelter)}
function dist(from,to){if(from===to)return 0;const seen={[from]:0},q=[from];while(q.length){const a=q.shift();for(const b of MAP[a].adj){if(seen[b]!=null)continue;seen[b]=seen[a]+1;if(b===to)return seen[b];if(tileAt(b))q.push(b)}}return 99}
function wood(){return G.res.wood}
function food(){return G.res.food+G.res.pfood}
// weapon with permanent items is just G.weapon (items add to it when built)
function srcs(pos){const t=tileAt(pos);if(!t)return[];const m=G.map[pos];const o=t.src.map((s,i)=>({s,i,ex:!!m.exh[i]}));if(m.tok.food&&!t.src.some(s=>s!=='wood'))o.push({s:'parrot',i:9,ex:!!m.exh[9],tok:1});return o}
// ---------- the frame interpreter ----------
function run(){let n=0;while(!G.q&&!G.over&&G.stk.length&&n++<5000){const fr=G.stk.pop();const h=FR[fr.f];if(!h){console.error('no frame '+fr.f);continue}h(fr)}if(n>=5000){console.error('frame loop limit '+JSON.stringify(G.stk.slice(-3)).slice(0,400));G.stk=[]}}
function push(...frs){for(let i=frs.length-1;i>=0;i--)G.stk.push(frs[i])}   // push so the first runs first
function ops(list,ctx){if(list&&list.length)push({f:'ops',ops:list.slice(),ctx:ctx||{}})}
// ask: a choice for a character (or the team via the first player). opts: [{l:label, ops:[...], ctx}] or kind-specific
function ask(who,title,opts,extra){const c=who==='team'?firstC():(typeof who==='number'?P(who):who);
  if(!opts.length)return;if(opts.length===1&&!(extra&&extra.force)){pickOpt(opts[0]);return}
  if(c&&!hum(c)){const ix=aiChoose(title,opts,c,extra);const o=opts[ix]||opts[0];if(!UI.sim&&!(extra&&extra.kind==='dice')&&opts.length>1&&G.chars.some(hum))lg(`${c.nm} (computer) chooses: ${o.l.replace(/\.$/,'')}.`,'ai');pickOpt(o);return}
  G.q=Object.assign({who:c?c.i:0,title,opts},extra||{})}
function pickOpt(o){if(o.frames)push(...o.frames);if(o.ops)ops(o.ops,o.ctx)}
function answer(i){const q=G.q;G.q=null;pickOpt(q.opts[i]);run();refresh()}
const FR={};
FR.ops=fr=>{if(!fr.ops.length)return;const [op,...rest]=fr.ops;if(rest.length)G.stk.push({f:'ops',ops:rest,ctx:fr.ctx});doOp(op,fr.ctx)};
FR.fn=fr=>{FN[fr.k](fr)};
const FN={};
// ---------- wounds, determination, morale ----------
function whoList(who,ctx){if(who==='all')return living();if(who==='first')return [firstC()];if(who==='actor')return ctx&&ctx.actor!=null&&ctx.actor>=0?[P(ctx.actor)]:(ctx&&ctx.actor===-1?[]:[firstC()]);if(who==='sp')return ctx.sp!=null?[P(ctx.sp)]:[];if(typeof who==='number')return [P(who)];return [firstC()]}
function wound(c,n,why){if(!c||c.dead||n<=0)return;if(c==='fri'){return}
  for(let k=0;k<n;k++){c.w++;G.lastWound={who:c.i,why:why||''};G.stats.wounds++;if(CHARS[c.k].arrows.includes(c.w)&&!c.cov.includes(c.w)){morale(-1,true)}if(c.w>=CHARS[c.k].die){c.dead=true;lg(`☠ ${c.nm} dies${why?' ('+why+')':''}. The castaways have lost.`,'bad');G.over={win:false,why:`${c.nm} died.`};fx('lose');return}}
  lg(`${c.nm} takes ${n} wound${n>1?'s':''}${why?' ('+why+')':''}.`,'bad');fx('wound',c.i)}
function friWound(n){if(!G.fri||G.fri.dead)return;G.fri.w+=n;if(G.fri.w>=FRIDAY.die){G.fri.dead=true;lg('Friday is killed. The others carry on.','bad')}else lg(`Friday takes ${n} wound${n>1?'s':''}.`,'bad')}
function heal(c,n){if(!c||c.dead)return 0;const h=Math.min(n,c.w);c.w-=h;if(h){lg(`${c.nm} heals ${h} wound${h>1?'s':''}.`,'good');fx('heal',c.i)}return h}
function gainDet(c,n){if(!c||c.dead||n<=0)return;c.det+=n;lg(`${c.nm} gains ${n} determination.`,'good')}
// lose determination: what can't be paid is 1 wound each (unfulfilled demand)
function loseDet(c,n,why){if(!c||c.dead)return;const pay=Math.min(n,c.det);c.det-=pay;if(pay)lg(`${c.nm} loses ${pay} determination.`);if(n>pay)wound(c,n-pay,why||'not enough determination')}
function morale(n,arrow){const b=G.morale;G.morale=Math.max(-3,Math.min(3,G.morale+n));if(G.morale!==b){lg(`Morale ${n>0?'+':''}${G.morale-b} (now ${G.morale>0?'+':''}${G.morale})${arrow?' from a wound':''}.`,n>0?'good':'bad');fx('morale')}}
// resources: gains go to future resources during actions (ctx.fut), otherwise available
function gain(r,n,ctx){if(n<=0)return;const box=ctx&&ctx.fut?G.fut:G.res;box[r]+=n;lg(`+${n} ${RNAME[r]}${ctx&&ctx.fut?' (arrives after the actions)':''}.`,'good');fx('res',r)}
// pay: take from available; food may use non-perishable food; missing units cost wounds to 'who'
function pay(r,n,whoC,ip,why){let miss=0;if(r==='food'){const a=Math.min(n,G.res.food);G.res.food-=a;const b=Math.min(n-a,G.res.pfood);G.res.pfood-=b;miss=n-a-b}else{const a=Math.min(n,G.res[r]);G.res[r]-=a;miss=n-a}
  if(n-miss>0)lg(`-${n-miss} ${RNAME[r]}${why&&!/^no /.test(why)?' ('+why.replace(/: no \S+ to pay$/,'')+')':''}.`);if(miss&&!ip){for(const c of whoC)wound(c,miss,why||`no ${RNAME[r]} to pay`)}return miss}
function roofPal(which,n,needShelter,ip,whoC){if(n>0){if(needShelter&&!hasShelter())return;G.camp[which]+=n;lg(`${which==='roof'?'Roof':'Palisade'} +${n} (now ${G.camp[which]}).`,'good');fx('build');return}
  const d=Math.min(-n,G.camp[which]);G.camp[which]-=d;if(d)lg(`${which==='roof'?'Roof':'Palisade'} -${d} (now ${G.camp[which]}).`,'bad');if(-n>d&&!ip)for(const c of (whoC||living()))wound(c,-n-d,`no ${which==='roof'?'roof':'palisade'} left`)}
function weapon(n,ip,whoC){if(n>0){G.weapon+=n;lg(`Weapon +${n} (now ${G.weapon}).`,'good');return}const d=Math.min(-n,G.weapon);G.weapon-=d;if(d)lg(`Weapon -${d} (now ${G.weapon}).`,'bad');if(-n>d&&!ip)for(const c of (whoC||living()))wound(c,-n-d,'weapon already at 0')}
// ---------- the op interpreter (card effects) ----------
// the cause shown with a wound from a card: its name, and for an ignored threat, that it was ignored
function opWhy(ctx){const c=ctx&&ctx.card&&typeof CARD!=='undefined'&&CARD[ctx.card];if(!c)return '';return ctx.half==='te'&&c.th?`ignored threat “${c.th.n}”`:`“${c.n}”`}
function doOp(op,ctx){const [k,a,b,c2]=op;const who=w=>whoList(w,ctx);
  switch(k){
  case 'res':gain(a,b,ctx);break;
  case 'resPer':gain(a,living().length,ctx);break;
  case 'lose':pay(a,b,ctx.pay?ctx.pay.map(P):living(),!!c2,ctx.card&&CARD[ctx.card]?`${opWhy(ctx)}: no ${RNAME[a]} to pay`:null);break;
  case 'loseAllRes':for(const r of RES){if(G.res[r])lg(`Lose all ${RNAME[r]} (${G.res[r]}).`,'bad');G.res[r]=0}break;
  case 'wound':for(const c of who(a))wound(c,b,opWhy(ctx));break;
  case 'det':if(a==='choose'){const c=living().sort((x,y)=>x.det-y.det)[0];gainDet(c,b)}else for(const c of who(a))gainDet(c,b);break;
  case 'ldet':for(const c of who(a))loseDet(c,b);break;
  case 'ldetAll':for(const c of who(a)){if(c.det)lg(`${c.nm} loses all ${c.det} determination.`,'bad');c.det=0}break;
  case 'heal':if(a==='choose'){const c=living().sort((x,y)=>y.w-x.w)[0];heal(c,b)}else for(const c of who(a))heal(c,b);break;
  case 'morale':morale(a);break;
  case 'roof':roofPal('roof',a,b==='shelter',false);break;
  case 'pal':roofPal('pal',a,b==='shelter',false);break;
  case 'weapon':weapon(a,!!b);break;
  case 'weaponTo':if(G.weapon>a){lg(`Weapon drops to ${a}.`,'bad');G.weapon=a}break;
  case 'roofOrPal':{const need=b==='shelter';if(a>0&&need&&!hasShelter())break;
    const o=[{l:`Roof ${a>0?'+':''}${a}`,ops:[['roof',a]]},{l:`Palisade ${a>0?'+':''}${a}`,ops:[['pal',a]]}];ask('team',a>0?'Which gets better?':'Which one suffers?',o,{kind:'roofpal',sign:a});break}
  case 'halfRoofOrPal':{const o=[{l:`Lose half the roof (${Math.floor(G.camp.roof/2)})`,ops:[['roof',-Math.floor(G.camp.roof/2)]]},{l:`Lose half the palisade (${Math.floor(G.camp.pal/2)})`,ops:[['pal',-Math.floor(G.camp.pal/2)]]}];ask('team','Which one takes the damage?',o,{kind:'roofpal',sign:-1});break}
  case 'halfRoof':roofPal('roof',-Math.floor(G.camp.roof/2),false,true);break;
  case 'wx':G.wx[a]++;lg(`${{rain:'A rain cloud',snow:'A snow cloud',storm:'A storm',animals:'The hungry-animals die'}[a]} is added to this round's weather.`,'bad');break;
  case 'actTok':G.tok[a][b]=1;lg(`A ${{adv:'"?" adventure',reroll:'reroll-a-success',time:'slow-work (+1 pawn)',wood:'+1 wood cost',black:'wasted-effort',beast:'danger'}[b]} marker goes on the ${TNAME[a].toLowerCase()} action.`);break;
  case 'actTokOff':delete G.tok[a][b];break;
  case 'beastStr':G.beastStr++;lg('The next beast you hunt is stronger (+1).','bad');break;
  case 'nightFood':G.night.food++;lg('Tonight everyone needs 1 more food.','bad');break;
  case 'nightWound':G.night.wound+=b;lg('Everyone will take 1 wound tonight.','bad');break;
  case 'prod':G.prod[a]=1;break;
  case 'noMix':G.noMix=true;lg('This round, no action may mix pawns of different characters.','bad');break;
  case 'passFirst':passFirst();break;
  case 'onlyActs':for(const c of who(a)){c.only=b;lg(`${c.nm} can only ${b.map(x=>TNAME[x].toLowerCase()).join(', ')} this round.`,'bad')}break;
  case 'pawnMinus':for(const c of who(a)){c.pawnMinus=1;lg(`${c.nm} has only 1 pawn this round.`,'bad')}break;
  case 'pawnMinusNext':for(const c of who(a)){c.pmNext=1;lg(`${c.nm} will have only 1 pawn next round.`,'bad')}break;
  case 'noSkills':for(const c of who(a)){c.noSkills=true;lg(`${c.nm} can't use skills this round.`,'bad')}break;
  case 'discardInv':{const n=Math.min(a,G.inv.deck.length);G.inv.deck.splice(0,n);lg(`${n} invention idea${n===1?' is':'s are'} lost from the invention deck.`,'bad');break}
  case 'drawInv':{for(let i=0;i<a&&G.inv.deck.length;i++){const k2=G.inv.deck.shift();G.inv.board.push(k2);lg(`New idea: ${INVENTIONS[k2].n} is added to the inventions.`,'good')}break}
  case 'pickInv':{const o=G.inv.deck.slice(0,99).map(k2=>({l:INVENTIONS[k2].n,frames:[{f:'fn',k:'addInv',key:k2}]}));if(o.length)ask('team','Choose a new invention for the board',o,{kind:'inv'});break}
  case 'loseItem':{const built=Object.keys(G.inv.built).filter(x=>G.inv.built[x]&&INVENTIONS[x]);if(!built.length){if(!b)for(const c of living())wound(c,1,'no item to lose');break}
    for(let i=0;i<a;i++)push({f:'fn',k:'askLoseItem'});break}
  case 'itemsAway':G.itemsAway=1;lg('All items are out of reach this round.','bad');break;
  case 'markItems':{const built=Object.keys(G.inv.built).filter(x=>G.inv.built[x]&&INVENTIONS[x]);shuffle(built);G.inv.marked={};built.slice(0,2).forEach(x=>G.inv.marked[x]=1);if(built.length)lg(`${built.slice(0,2).map(x=>INVENTIONS[x].n).join(' and ')} look worn.`);break}
  case 'loseMarked':for(const x in G.inv.marked)if(G.inv.built[x])loseInv(x);G.inv.marked={};break;
  case 'buildFree':{const o=a.filter(x=>!has(x)).map(x=>({l:INVENTIONS[x].n,frames:[{f:'fn',k:'freeBuild',key:x}]}));if(o.length)ask('team','Make one for free',o,{kind:'inv'});break}
  case 'mystery':push({f:'fn',k:'mystery',spec:Object.assign({},a),ctx,drawn:0,res:{},got:[]});break;
  case 'disc':for(let i=0;i<a;i++)drawDisc(ctx);break;
  case 'startItem':{const all=Object.keys(ITEMS).filter(x=>!G.items.some(y=>y.k===x));if(all.length){const k2=all[rnd(all.length)];G.items.push({k:k2,uses:2});lg(`Found: ${ITEMS[k2].n}.`,'good')}break}
  case 'fight':push({f:'fn',k:'fight',beast:Object.assign({n:'the beast'},a),who:b==='first'?G.first:(ctx.actor!=null?ctx.actor:G.first),ctx});break;
  case 'huntDiscard':for(let i=0;i<a;i++)if(G.hunt.length){const x=G.hunt.shift();lg(`${cname(x)} leaves the hunting grounds.`)}break;
  case 'huntTopBottom':if(G.hunt.length>1){G.hunt.push(G.hunt.shift());lg('The top beast of the hunting deck goes to the bottom.')}break;
  case 'huntPeek':if(G.hunt.length)lg(`You glimpse the next beast: ${cname(G.hunt[0])}.`);break;
  case 'huntStrongest3':{const d=G.beast.splice(0,3);if(!d.length)break;d.sort((x,y)=>BEAST[y].str-BEAST[x].str);G.hunt.unshift(d[0]);G.beast.push(...d.slice(1));lg(`The strongest of three beasts, ${cname(d[0])}, comes to the hunting grounds.`,'bad');break}
  case 'huntFightTop':if(G.hunt.length){const x=G.hunt.shift();push({f:'fn',k:'fight',beast:Object.assign({},BEAST[x]),who:G.first,ctx:{}})}break;
  case 'huntLootTop':if(G.hunt.length){const x=G.hunt.shift();const bb=BEAST[x];lg(`You catch ${bb.n} off guard.`,'good');gain('food',bb.food,ctx);gain('fur',bb.fur,ctx)}break;
  case 'beastWaits':if(G.beast.length){G.ev.wait=G.beast.shift();lg(`A beast (${cname(G.ev.wait)}) waits by the camp: you fight it at the start of next round.`,'bad')}break;
  case 'beastWaitToHunt':if(G.ev.wait){G.hunt.push(G.ev.wait);shuffle(G.hunt);G.ev.wait=null;lg('You lure the waiting beast off into the hunting grounds.','good')}break;
  case 'exhaustClosest':push({f:'fn',k:'exhaustClosest',kind:a});break;
  case 'unexhaust':{for(const m of G.map){const t=tileAt(m.id);if(!t)continue;if(a==='any'&&m.waste){delete m.waste;lg('Barren land becomes usable again.','good');return}for(const i in m.exh){const s=t.src[i]||'parrot';if((a==='any'||m.exh[i]===2)&&(a==='any'||(a==='foodsrc'?s!=='wood':s===a))){delete m.exh[i];lg('A used-up source recovers.','good');return}}}break}
  case 'exhaustAdj':for(let i=0;i<a;i++)push({f:'fn',k:'exhaustPick',scope:'adj'});break;
  case 'exhaustTileAdj':push({f:'fn',k:'exhaustTile'});break;
  case 'unexhaustTile':{for(const m of G.map){for(const i in m.exh)if(m.exh[i]===3)delete m.exh[i]}break}
  case 'coverTerr':push({f:'fn',k:'coverTerr',terr:a});break;
  case 'uncoverTerr':for(const m of G.map){const t=tileAt(m.id);if(t&&m.cov===a){m.cov=false;lg(`The ${a} is usable again.`,'good');break}}break;
  case 'inaccessAdj':push({f:'fn',k:'inaccess'});break;
  case 'reaccess':for(const m of G.map){if(m.down==='ev'){m.down=false;lg('The lost tile is reachable again.','good');break}}break;
  case 'moveCamp':push({f:'fn',k:'moveCamp',forced:1});break;
  case 'restoreMove':if(G.camp.moved){G.camp.roof+=G.camp.moved.roof>G.camp.roof?1:0;G.camp.pal+=G.camp.moved.pal>G.camp.pal?1:0;lg('You rebuild some of what the move cost.','good')}break;
  case 'flushThreats':for(let i=0;i<2;i++){const k2=G.ev.threat[i];if(k2){G.ev.threat[i]=null;lg(`${cname(k2)} slips away: its threat happens.`,'bad');ops(CARD[k2].te,{pay:living().map(c=>c.i)})}}break;
  case 'again':if(ctx.card){const e=CARD[ctx.card].ev;ops((Array.isArray(e)?e:e.ops).filter(o=>o[0]!=='again'),ctx)}break;
  case 'book':SC().book&&SC().book(ctx);break;
  case 'pick':{const o=a.map((alt,i)=>({l:b[i],ops:alt,ctx}));ask(ctx.actor!=null&&ctx.actor>=0?ctx.actor:'team','Choose one',o,{kind:'pick'});break}
  case 'ifItem':ops(has(a)?b:c2,ctx);break;
  case 'ifWeapon':ops(G.weapon>=a?b:c2,ctx);break;
  case 'spWound':if(ctx.actor!=null&&ctx.actor>=0){const c=P(ctx.actor);c.sp[a]=(c.sp[a]||0)+1;lg(`${c.nm} gets a nasty ${{head:'head',arm:'arm',belly:'belly',leg:'leg'}[a]} injury (it will come back to haunt them).`,'bad')}break;
  case 'spw':{for(const c of living())if(c.sp[a]){c.sp[a]--;ops(b,Object.assign({},ctx,{sp:c.i}))}break}
  case 'tileTok':if(ctx.pos!=null){G.map[ctx.pos].tok[a]=1;lg(`A ${{time:'slow-going',beast:'danger',food:'+1 food'}[a]} marker goes on that tile.`)}break;
  case 'inaccessTok':for(const m of G.map)if(m.tok[a]&&m.tile!=null){makeDown(m.id,'tok');break}break;
  case 'exhaustTok':for(const m of G.map)if(m.tok[a]){const t=tileAt(m.id);if(t)t.src.forEach((s,i)=>m.exh[i]=1);m.exh[9]=1;delete m.tok[a];lg('That tile is picked clean.','bad')}break;
  case 'exhaustHere':if(ctx.pos!=null&&ctx.srcI!=null){G.map[ctx.pos].exh[ctx.srcI]=1;lg('That source is used up.','bad')}break;
  case 'exhaustHereAny':if(ctx.pos!=null){const t=tileAt(ctx.pos);if(t&&t.src.length){G.map[ctx.pos].exh[0]=1;lg('A source on that tile is ruined.','bad')}else G.map[ctx.pos].tok.scorch=1}break;
  case 'coverTerrHere':if(ctx.pos!=null){const t=tileAt(ctx.pos);if(t){G.map[ctx.pos].cov=t.terr;lg(`The ${t.terr} on that tile can't be used for now.`,'bad')}}break;
  case 'exhaustCampFood':{const m=G.map[G.camp.pos],t=campTile();const i=t?t.src.findIndex((s,j)=>s!=='wood'&&!m.exh[j]):-1;if(i>=0){m.exh[i]=1;lg('The camp’s food source is ruined.','bad')}else for(const c of living())wound(c,1,'no food source to lose');break}
  case 'gatherExtra':if(ctx.gres){gain(ctx.gres,1,ctx)}break;
  case 'extraBuild':G.plan.extraBuild=(G.plan.extraBuild||0)+1;lg('You may add one more build action (it always rolls the dice).','good');break;
  case 'costTok':G.cost[a]++;lg(`Building ${a==='pal'?'the palisade':a==='weapon'?'the weapon':'the '+a} costs 1 more wood from now on.`,'bad');break;
  case 'nightOut':if(ctx.actor!=null&&ctx.actor>=0){P(ctx.actor).out={after:a};lg(`${P(ctx.actor).nm} can't make it back and spends the night in the wild.`,'bad')}break;
  case 'keep':G.kept[a]=(ITEMLIKE[a]&&ITEMLIKE[a].uses)||1;lg(`Kept: ${cname(a)}.`,'good');break;
  case 'keepPawn':G.xp.push({t:a,uses:b||99,src:ctx.card||'find'});lg(`An extra helper pawn for ${a==='any'?'any action':TNAME[a].toLowerCase()} actions.`,'good');break;
  case 'coverArrows':{let n=a;for(const c of living().sort((x,y)=>CHARS[y.k].arrows.length-CHARS[x.k].arrows.length)){for(const ar of CHARS[c.k].arrows){if(n&&ar>c.w&&!c.cov.includes(ar)){c.cov.push(ar);n--}}}lg('Hope returns: two morale-down points on the life tracks are covered.','good');break}
  case 'peekTiles':lg(`You scout the next island tiles: ${G.tileDeck.slice(0,3).map(n=>'#'+n+' '+TILES.find(t=>t.no===n).terr).join(', ')}.`);G.peek=G.tileDeck.slice(0,3);break;
  case 'campTok':G.map[G.camp.pos].tok[a]=1;lg(`The camp tile now makes 1 more ${a}.`,'good');break;
  case 'charReroll':if(ctx.actor!=null&&ctx.actor>=0)P(ctx.actor).rr=1;break;
  case 'charRerollOff':for(const c of G.chars)c.rr=0;break;
  case 'charRerollNext':if(ctx.actor!=null&&ctx.actor>=0)P(ctx.actor).rrNext=1;break;
  case 'strangeDisease':{const n=living().length*2;const cs=living().sort((x,y)=>(CHARS[y.k].die-y.w)-(CHARS[x.k].die-x.w));for(let i=0;i<n;i++){const c=cs[i%cs.length];G.night.marks[c.i]=(G.night.marks[c.i]||0)+1}lg(`A fever spreads: ${n} wounds will land tonight.`,'bad');break}
  case 'loseDrawnTreasures':G.mysLost=1;break;
  case 'reshuffleSelf':break;
  case 'pileWood':SC().pileWood&&SC().pileWood(a,true);break;
  case 'unfog':{let n=a;for(const m of G.map)if(n&&m.fog){m.fog=0;n--}lg('The fog lifts from some tiles.','good');break}
  default:console.error('unknown op '+k)}}
const ITEMLIKE={m_blankets:{uses:3},m_wine:{uses:1},m_herbal:{uses:1},m_rifle:{uses:1},m_amulet:{uses:1},m_tmap:{uses:1},e_surprise:{uses:1},m_web:{uses:1},m_backpack:{uses:1},m_barrel:{uses:1},m_boxes:{uses:1},m_helmet:{uses:1},m_clothes:{uses:1},m_saber:{uses:1},m_hammock:{uses:1},ritualknife:{uses:1}};
function passFirst(){const n=G.chars.length;let i=G.first;for(let k=0;k<n;k++){i=(i+1)%n;if(!P(i).dead&&!P(i).npc)break}G.first=i;lg(`${firstC().nm} is now the first player.`)}
function loseInv(x){delete G.inv.built[x];lg(`${INVENTIONS[x].n} is lost.`,'bad');undoInv(x)}
FN.askLoseItem=fr=>{const built=Object.keys(G.inv.built).filter(x=>G.inv.built[x]&&INVENTIONS[x]);if(!built.length)return;ask('team','Which item is lost?',built.map(x=>({l:INVENTIONS[x].n,frames:[{f:'fn',k:'loseInvK',key:x}]})),{kind:'loseitem'})};
FN.loseInvK=fr=>loseInv(fr.key);
FN.addInv=fr=>{const i=G.inv.deck.indexOf(fr.key);if(i>=0)G.inv.deck.splice(i,1);G.inv.board.push(fr.key);lg(`${INVENTIONS[fr.key].n} is added to the inventions.`,'good')};
FN.freeBuild=fr=>{completeInv(fr.key,null,true)};
// ---------- sources, tiles, camp moves ----------
FN.exhaustClosest=fr=>{const want=s=>fr.kind==='foodsrc'?s!=='wood':s===fr.kind;const order=MAP.map(m=>m.id).filter(p=>tileAt(p)).sort((a,b)=>dist(G.camp.pos,a)-dist(G.camp.pos,b));
  for(const p of order){const t=tileAt(p),m=G.map[p];const i=t.src.findIndex((s,j)=>want(s)&&!m.exh[j]);if(i>=0){m.exh[i]=2;lg(`The ${t.src[i]} source at place ${p+1} is used up.`,'bad');return}}
  for(const c of living())wound(c,1,`no ${fr.kind==='foodsrc'?'food':fr.kind} source to lose`)};
FN.exhaustPick=fr=>{const o=[];for(const p of MAP[G.camp.pos].adj.concat([G.camp.pos])){const t=tileAt(p);if(!t||p===G.camp.pos&&fr.scope==='adj')continue;t.src.forEach((s,i)=>{if(!G.map[p].exh[i])o.push({l:`${s} at place ${p+1}`,frames:[{f:'fn',k:'exh',p,i}]})})}
  if(o.length)ask('team','Which source is used up?',o,{kind:'exh'})};
FN.exh=fr=>{G.map[fr.p].exh[fr.i]=1;lg(`A ${tileAt(fr.p).src[fr.i]} source at place ${fr.p+1} is used up.`,'bad')};
FN.exhaustTile=fr=>{const o=MAP[G.camp.pos].adj.filter(p=>tileAt(p)&&tileAt(p).src.length).map(p=>({l:`Place ${p+1} (${tileAt(p).terr})`,frames:[{f:'fn',k:'exhT',p}]}));if(o.length)ask('team','Which tile loses its sources?',o,{kind:'exh'})};
FN.exhT=fr=>{tileAt(fr.p).src.forEach((s,i)=>G.map[fr.p].exh[i]=3);lg(`Every source at place ${fr.p+1} is used up.`,'bad')};
FN.coverTerr=fr=>{const o=G.map.filter(m=>tileAt(m.id)&&tileAt(m.id).terr===fr.terr&&!m.cov).map(m=>({l:`Place ${m.id+1}`,frames:[{f:'fn',k:'cov',p:m.id}]}));if(o.length)ask('team',`Which ${fr.terr} place is spoiled?`,o,{kind:'tile'})};
FN.cov=fr=>{G.map[fr.p].cov=tileAt(fr.p).terr;lg(`The ${tileAt(fr.p).terr} at place ${fr.p+1} can't be used for now.`,'bad')};
FN.inaccess=fr=>{const o=MAP[G.camp.pos].adj.filter(p=>tileAt(p)).map(p=>({l:`Place ${p+1} (${tileAt(p).terr})`,frames:[{f:'fn',k:'down',p}]}));if(o.length)ask('team','Which place becomes unreachable?',o,{kind:'tile'})};
FN.down=fr=>makeDown(fr.p,'ev');
function makeDown(p,why){const m=G.map[p];m.down=why;m.tok={};m.exh={};lg(`Place ${p+1} is cut off and turned face down.`,'bad');if(p===G.camp.pos){G.over={win:false,why:'The camp was cut off.'};lg('The camp itself is lost!','bad')}}
FN.moveCamp=fr=>{const o=MAP[G.camp.pos].adj.filter(p=>tileAt(p)&&!G.map[p].fog).map(p=>({l:`Move to place ${p+1} (${tileAt(p).terr}${tileAt(p).shelter?', natural shelter':''})`,frames:[{f:'fn',k:'doMove',p}]}));
  if(!fr.forced)o.push({l:'Stay where you are',frames:[]});
  if(!o.length){if(fr.forced){lg('There is nowhere to move the camp.','bad');for(const c of living())wound(c,1,'no place to move the camp')}return}
  ask('team',fr.forced?'The camp must move. Where to?':'Move the camp?',o,{kind:'move'})};
FN.doMove=fr=>{const built=G.camp.shelter;G.camp.moved={roof:G.camp.roof,pal:G.camp.pal};
  if(built){G.camp.roof=Math.floor(G.camp.roof/2);G.camp.pal=Math.floor(G.camp.pal/2)}else{G.camp.roof=0;G.camp.pal=0}
  // camp tokens (+1 wood/food from items) move with the camp
  const old=G.map[G.camp.pos].tok;const nt=G.map[fr.p].tok;for(const t of ['wood','food'])if(old['c_'+t]){delete old['c_'+t];nt['c_'+t]=1}
  G.camp.pos=fr.p;G.shortcut=null;lg(`The camp moves to place ${fr.p+1}. Roof ${G.camp.roof}, palisade ${G.camp.pal}.`,'big');fx('move')};
// ---------- discovery tokens ----------
function drawDisc(ctx){if(!G.discs.length)return;const k=G.discs.shift();if(G.kept.m_backpack&&ctx&&ctx.explore&&G.discs.length){const k2=G.discs.shift();const best=[k,k2].sort((a,b)=>discValue(b)-discValue(a));G.discs.push(best[1]);G.own.push({k:best[0],fut:!!(ctx&&ctx.fut)});lg(`Found: ${discName(best[0])} (the backpack helps you pick).`,'good');return}
  G.own.push({k,fut:!!(ctx&&ctx.fut)});lg(`Found: ${discName(k)}${ctx&&ctx.fut?' (usable after the actions)':''}.`,'good')}
function discName(k){const d=DISCS[k];if(d.sc!=null)return SCENARIOS[G.scen].finds[d.sc].n;return d.n}
function discValue(k){return {larvae:3,fallentree:2,goat:2,machete:3,poison:3,thorns:3,tobacco:3,treasure:2,veggies:2,herbs:2,healherbs:3,candles:2,leaves:2}[k]||3}
// use a token: returns true if it had an effect
function useDisc(i,auto){const o=G.own[i];if(!o||o.fut)return false;const k=o.k,d=DISCS[k];const ctx={};
  if(d.pot&&!has('pot'))return false;
  const rm=()=>G.own.splice(G.own.indexOf(o),1);
  switch(k){
  case 'fallentree':rm();gain('wood',1,ctx);break;case 'larvae':rm();gain('food',2,ctx);break;
  case 'goat':if(G.weapon<1)return false;rm();gain('food',1,ctx);gain('fur',1,ctx);break;
  case 'healherbs':if(has('medicine'))return false;rm();completeInv('medicine',null,true);break;
  case 'herbs':rm();morale(1);break;case 'tobacco':rm();morale(1);break;
  case 'machete':rm();weapon(1);break;case 'poison':rm();weapon(2);break;
  case 'thorns':if(!hasShelter())return false;rm();roofPal('pal',1);break;
  case 'treasure':rm();push({f:'fn',k:'mystery',spec:{treasure:1,until:1},ctx:{actor:G.first},drawn:0,res:{},got:[]});run();break;
  case 'veggies':{const c=living().sort((a,b)=>b.w-a.w)[0];if(!c||!c.w)return false;rm();heal(c,2);break}
  case 'candles':rm();G.xp.push({t:'build',uses:1,src:'candles'});break;
  case 'leaves':return false;
  default:if(d.sc!=null){rm();ops(SCENARIOS[G.scen].finds[d.sc].ops,{actor:G.first});run();break}return false}
  lg(`Used: ${discName(k)}.`);return true}
// ---------- inventions ----------
function invReq(k){const I=INVENTIONS[k]||SCENARIOS[G.scen].invs[k];return I}
function invWhy(k,forC){const I=invReq(k);if(!I)return 'unknown';if(has(k)&&!I.multi)return 'already made';const ex=explored();
  if(I.t&&!ex.has(I.t))return `needs ${I.t} explored`;for(const it of I.it||[])if(!has(it))return `needs ${(INVENTIONS[it]||{}).n||it}`;
  if(I.kind==='personal'&&forC&&forC.k!==I.owner)return `only the ${CHARS[I.owner].n} can make it`;
  if(I.kind==='personal'&&!G.chars.some(c=>c.k===I.owner&&!c.dead))return 'nobody here can make it';
  return null}
function invCost(k){const I=invReq(k);return I.alt?I.alt[0]:(I.r||{})}
function completeInv(k,builder,free){const I=invReq(k);if(I.multi){SC().built&&SC().built(k,builder);return}
  G.inv.built[k]=1;G.stats.built++;lg(`🔨 ${I.n} is made${free?' (for free)':''}!`,'big');fx('build');doInv(k);
  if(I.kind==='personal'&&builder!=null)gainDet(P(builder),2)}
function doInv(k){switch(k){case 'bricks':case 'fire':roofPal('pal',1);break;case 'wall':case 'moat':roofPal('pal',2);break;case 'knife':weapon(1);break;case 'bow':case 'spear':weapon(3);break;case 'sling':weapon(2);break;
  case 'dam':gain('pfood',2,{});break;case 'snare':G.map[G.camp.pos].tok.c_food=1;break;case 'hatchet':G.map[G.camp.pos].tok.c_wood=1;break;
  case 'corral':{for(const p of MAP[G.camp.pos].adj){const t=tileAt(p);if(!t)continue;const i=t.src.findIndex((s,j)=>s==='parrot'&&!G.map[p].exh[j]);if(i>=0){G.map[p].exh[i]=1;break}}G.map[G.camp.pos].tok.c_food2=1;break}
  case 'shortcut':{const o=MAP[G.camp.pos].adj.filter(p=>tileAt(p)&&tileAt(p).src.length);if(o.length)G.shortcut=o.sort((a,b)=>tileAt(b).src.length-tileAt(a).src.length)[0];break}
  case 'mast':SC().pileWood&&SC().pileWood(3,true);break}}
function undoInv(k){switch(k){case 'bricks':case 'fire':roofPal('pal',-1,false,true);break;case 'wall':case 'moat':roofPal('pal',-2,false,true);break;case 'knife':weapon(-1,true);break;case 'bow':case 'spear':weapon(-3,true);break;case 'sling':weapon(-2,true);break;
  case 'snare':delete G.map[G.camp.pos].tok.c_food;break;case 'hatchet':delete G.map[G.camp.pos].tok.c_wood;break;case 'corral':delete G.map[G.camp.pos].tok.c_food2;break;case 'shortcut':G.shortcut=null;break}}
// ---------- mystery cards ----------
FN.mystery=fr=>{const sp=fr.spec;if(fr.stop)return finishMys(fr);
  const left=()=>{let n=0;for(const t of ['treasure','trap','creature','monOrTrap'])n+=Math.max(0,(sp[t]||0)-(fr.res[t]||0));return n};
  if(sp.until){if(fr.res.treasure)return finishMys(fr)}else if(fr.drawn>=(sp.draw||1)||!left())return finishMys(fr);
  if(!G.mys.deck.length){G.mys.deck=shuffle(G.mys.disc);G.mys.disc=[]}if(!G.mys.deck.length)return finishMys(fr);
  const k=G.mys.deck.shift();const m=CARD[k];fr.drawn++;
  let ok=(sp[m.type]||0)>(fr.res[m.type]||0);if(!ok&&(m.type==='trap'||m.type==='creature')&&(sp.monOrTrap||0)>(fr.res.monOrTrap||0)){ok=true;fr.res.monOrTrap=(fr.res.monOrTrap||0)+1}else if(ok)fr.res[m.type]=(fr.res[m.type]||0)+1;
  if(!ok){lg(`Mystery: ${m.n} (${m.type}) is put back.`);fr.back=(fr.back||[]).concat(k);push(fr);return}
  beat('mystery',{card:k});lg(`Mystery: ${m.n} (${m.type}).`,m.type==='treasure'?'good':'bad');fx('mystery');
  if(m.type==='treasure')fr.got.push(k);
  if(m.stop)fr.stop=1;
  const ctx=Object.assign({},fr.ctx,{card:k});push(fr);
  if(m.keep)G.kept[k]=m.uses||1;else if(m.shuffle){G.ev.deck.push(k);shuffle(G.ev.deck)}else if(!m.keep)G.mys.disc.push(k);
  ops(m.ops,ctx)};
function finishMys(fr){if(fr.back){G.mys.deck.push(...fr.back);shuffle(G.mys.deck)}if(G.mysLost){G.mysLost=0;for(const k of fr.got){if(G.kept[k]){delete G.kept[k];lg(`${cname(k)} falls through the trapdoor.`,'bad')}}}}
// ---------- beast fights ----------
FN.fight=fr=>{const b=fr.beast;const c=fr.who>=0?P(fr.who):null;
  if(fr.str==null){beat('fight',{beast:b.k||null,name:b.n,who:fr.who,hunted:!!fr.hunted});fr.str=(b.str||0)+(fr.hunted?G.beastStr:0);if(fr.hunted)G.beastStr=0;G.stats.fights++;fr.boost=0}
  const base={beast:b,who:fr.who,ctx:fr.ctx,str:fr.str,boost:fr.boost};
  // temporary weapon boosts the fighter may use once the beast is known
  const boosts=boostOpts(c);const short=fr.str-(G.weapon+fr.boost);
  if(short>0&&boosts.length){ask(c?c.i:'team',`Fighting ${b.n} (strength ${fr.str}) with weapon ${G.weapon}${fr.boost?' +'+fr.boost:''}: use a boost?`,boosts.map(o=>({l:o.l,frames:[{f:'fn',k:'boost',o:o.k,fr:JSON.parse(JSON.stringify(base))}]})).concat([{l:'No boost, fight now',frames:[{f:'fn',k:'fight2',fr:base}]}]),{kind:'boost',force:1,art:b.k?'beast-'+b.k:null});return}
  push({f:'fn',k:'fight2',fr:base})};
FN.boost=f=>{const fr=f.fr;const k=f.o;const c=fr.who>=0?P(fr.who):null;fr.boost+=3;
  if(k==='pistol'){const it=G.items.find(i=>i.k==='pistol');if(it)it.uses--}else if(k==='rage'&&c){c.used.rage=1;c.det-=3}else if((k==='saber'||k==='ritualknife')&&c){wound(c,1,k==='saber'?'the cutlass bites back':'the ritual knife')}else if(k==='m_rifle'||k==='e_surprise'||k==='sc_pistol'){delete G.kept[k]}
  lg('+3 weapon for this fight.','good');push({f:'fn',k:'fight',beast:fr.beast,who:fr.who,ctx:fr.ctx,str:fr.str,boost:fr.boost})};
function boostOpts(c){const o=[];const it=G.items.find(i=>i.k==='pistol'&&i.uses>0);if(it)o.push({k:'pistol',l:`Flintlock Pistol (+3, ${it.uses} use${it.uses>1?'s':''} left)`});
  if(c&&c.k==='soldier'&&!c.used.rage&&!c.noSkills&&c.det>=3)o.push({k:'rage',l:'Battle Rage (+3, 3 determination)'});
  if(G.kept.m_saber)o.push({k:'saber',l:'Cutlass (+3, you take 1 wound)'});if(G.kept.m_rifle)o.push({k:'m_rifle',l:'Old Musket (+3, one use)'});if(G.kept.e_surprise)o.push({k:'e_surprise',l:'Hidden Blade (+3, one use)'});if(G.kept.ritualknife)o.push({k:'ritualknife',l:'Ritual Knife (+3, you take 1 wound)'});if(G.kept.sc_pistol)o.push({k:'sc_pistol',l:'Old Pistol (+3, one use)'});return o}
FN.fight2=f=>{const fr=f.fr;const b=fr.beast;const c=fr.who>=0?P(fr.who):null;const str=fr.str;const wpn=G.weapon+(fr.boost||0);let short=Math.max(0,str-wpn);
  lg(`⚔ ${c?c.nm:'The castaways'} fight${c?'s':''} ${b.n}: strength ${str} vs weapon ${wpn}.`,'big');fx('fight',fr.who);
  if(short&&G.kept.m_helmet){short--;lg('The iron helmet takes a blow.','good')}
  if(short&&c)wound(c,short,b.n);else if(short&&!c)for(const x of living())wound(x,short,b.n);
  if(G.over)return;
  if(b.wl)weapon(-b.wl,false,c?[c]:living());
  if(b.food)gain('food',b.food,fr.ctx);if(b.fur)gain('fur',b.fur,fr.ctx);
  if(b.pal)roofPal('pal',-b.pal,false,false,c?[c]:living());
  const sp=b.k&&BEAST_SP[b.k];if(sp==='disc')drawDisc(fr.ctx);if(sp==='wound1'&&c)wound(c,1,b.n);if(sp==='nomed2'&&c&&!has('medicine'))wound(c,2,'infected bite')};
