// ---------- scenarios: goals, book and totem effects, special actions (the rules of scenario sheets 1, 2, 3 and 6) ----------
// extra scenario data (sheets 3 and 6); 1 and 2 live in data.js
SCENARIOS.stranded={ref:'scen-3-jenny',n:'Stranded Friend',no:3,rounds:8,x:'Your shipmate Ada is stuck on a rock off the coast. Build the Rescue Raft, row out to bring her back (an explore action), then build the Lifeboat. Do both to win. If Ada dies, you lose.',
  wx:{5:['animals'],6:['animals'],7:['animals'],8:['animals']},
  finds:[{n:'Soothing Herbs',x:'Heal 1 wound.',ops:[['heal','choose',1]]},{n:'Ruined Hut',x:'Gain 2 wood.',ops:[['res','wood',2]]},{n:'Old Pistol',x:'+3 weapon for one fight.',ops:[['keep','sc_pistol']]},{n:'Tough Vines',x:'Palisade +1.',ops:[['pal',1,'shelter']]}],
  invs:{jraft:{n:'Rescue Raft',kind:'scen',it:['rope'],r:{wood:2},x:'Lets you row out to rescue Ada (an explore action; a "?" means a wound, not an adventure).'},lifeboat:{n:'Lifeboat',kind:'scen',it:['rope','knife'],r:{wood:6,fur:4},x:'With Ada back in camp, you sail away and win.'}},
  book:'storm',totem:'stranded'};
SCENARIOS.settlers={ref:'scen-6-settlers',n:'Settlers',no:6,rounds:12,normals:9,x:'No rescue is coming, so make a home. Build a shelter, get roof, palisade and weapon to 1 or more, and make all 9 inventions dealt at the start. Children arrive in rounds 7, 9 and 11: each eats 1 food a night, and if a child goes hungry you lose.',
  wx:{3:['rain'],4:['rain'],5:['snow'],6:['snow'],7:['rain','animals'],8:['rain','animals'],9:['snow','animals'],10:['snow','animals'],11:['rain','animals'],12:['rain','animals']},wxFood:{7:1,8:1,9:2,10:2,11:3,12:3},
  finds:[{n:'Gunpowder',x:'Reroll the hungry-animals die once.',ops:[['keep','sc_powder']]},{n:'Seeds',x:'Gain 1 dry food.',ops:[['res','pfood',1]]},{n:'Old Tools',x:'Make Rope, Pot or Knife for free.',ops:[['buildFree',['rope','pot','knife']]]},{n:'Plough',x:'Remove 1 black marker from the island.',ops:[['unexhaust','any']]}],
  invs:{fence:{n:'Fence',kind:'scen',it:['shovel'],x:'Palisade +1.'},garden:{n:'Garden',kind:'scen',it:['shovel'],r:{food:2},x:'Gain 4 food.'}},
  book:'badcrops',totem:'wasteland'};
CHARS.ada={n:'Ada',die:11,arrows:[],inv:null,npc:1,skills:[]};
ITEMLIKE.sc_pistol={uses:1};ITEMLIKE.sc_powder={uses:1};
const PILE_CUM=[1,3,6,10,15];
const SCEN={
 marooned:{
  setup(){G.sc={pile:0,stageRound:0}},
  goal(){return `Fire ${has('fire')?'✓':'✗'} · signal pile ${G.sc.pile}/15 · rescue possible in rounds 10–12`},
  pileRoom(){if(G.sc.pile>=15||G.sc.stageRound===G.round||G.phase!=='plan')return 0;const s=PILE_CUM.findIndex(c=>c>G.sc.pile);return PILE_CUM[s]-G.sc.pile},
  pileAdd(n){const room=this.pileRoom();const free=G.res.wood-committed().wood;n=Math.min(n,room,free);if(n<=0)return false;G.res.wood-=n;G.sc.pile+=n;if(PILE_CUM.includes(G.sc.pile))G.sc.stageRound=G.round;lg(`${n} wood goes onto the signal pile (${G.sc.pile}/15).`,'good');fx('build');return true},
  pileWood(n){G.sc.pile=Math.min(15,G.sc.pile+n);lg(`+${n} wood straight onto the signal pile (${G.sc.pile}/15).`,'good')},
  check(){if(G.round>=10&&has('fire')&&G.sc.pile>=15)win('A sail on the horizon! The signal fire blazes and the ship turns toward the island.')},
  afterActions(){this.check()},endRound(){this.check()}},
 hexed:{
  setup(){G.sc={crosses:[],totemN:0,temple:null,templeDone:false}},
  goal(){return `Crosses raised: ${G.sc.crosses.length}/5 (each on a different tile)`},
  book(ctx){const o=fogCandidates();if(!o.length)return;push({f:'fn',k:'fogPick',n:Math.min(2,o.length)})},
  totem(pos,ctx){const n=++G.sc.totemN;
    if(n===1){G.sc.temple=pos;lg('A dark temple stands here. An explore action on this tile can search it once (4 mystery cards: up to 3 treasures and 1 creature).','big')}
    else if(n===2){lg('An altar of death: whoever explored it pays in blood.','bad');if(ctx.actor!=null&&ctx.actor>=0)wound(P(ctx.actor),2,'the altar')}
    else{G.map[pos].fog=1;lg('A cultist hideout: fog rolls over this tile.','bad')}},
  built(k,actor,pos){if(k==='cross'){G.sc.crosses.push(pos);lg(`✝ A cross rises at place ${pos+1} (${G.sc.crosses.length}/5).`,'big');fx('build');if(G.sc.crosses.length>=5)win('The fifth cross is raised. The curse breaks and the island falls quiet.')}
    if(k==='bell'){doOp(['unfog',3],{});lg('The sacred bell rings out over the island.','good')}},
  specials:{temple:{n:'Search the dark temple',dice:'explore',why(){if(G.sc.temple==null)return 'no temple found yet';if(G.sc.templeDone)return 'already searched';if(dist(G.camp.pos,G.sc.temple)>2)return 'too far from camp';return null},pos(){return G.sc.temple},
    win(ctx){G.sc.templeDone=true;push({f:'fn',k:'mystery',spec:{treasure:3,creature:1,draw:4},ctx,drawn:0,res:{},got:[]})}}}},
 stranded:{
  setup(){G.sc={ada:0,rescued:false,totemN:0};if(G.items.some(i=>i.k==='stormglass')){const pool=Object.keys(ITEMS).filter(k=>!G.items.some(i=>i.k===k));G.items=G.items.filter(i=>i.k!=='stormglass');G.items.push({k:pool[rnd(pool.length)],uses:2})}},
  goal(){return `Ada: ${G.sc.rescued?'rescued':'on the rock, '+(CHARS.ada.die-G.sc.ada)+' life left'} · Rescue Raft ${has('jraft')?'✓':'✗'} · Lifeboat ${has('lifeboat')?'✓':'✗'}`},
  book(){lg('A storm hits the camp.','bad');roofPal('pal',-1,false,false,living())},
  totem(pos,ctx){const n=++G.sc.totemN;
    if(n===1){lg('Slippery rocks!','bad');if(ctx.actor!=null&&ctx.actor>=0)wound(P(ctx.actor),2,'slippery rocks')}
    else if(n===2){lg('An old graveyard: spirits sink.','bad');morale(-2)}
    else if(n===3){lg('Masts and spars wash up: you can make rope from them.','good');if(!has('rope'))completeInv('rope',null,true)}
    else{lg('The wreck of a balloon: good cloth.','good');gain('fur',2,ctx)}},
  specials:{ada:{n:'Row out and rescue Ada',dice:'explore',advWound:1,why(){if(G.sc.rescued)return 'Ada is already safe';if(!has('jraft'))return 'build the Rescue Raft first';return null},
    win(ctx){G.sc.rescued=true;const c={i:G.chars.length,k:'ada',nm:'Ada',w:G.sc.ada,det:0,dead:false,used:{},sp:{},cov:[],human:G.chars.some(hum),lv:'normal',pawnMinus:0,only:null,noSkills:true,out:null,rr:0,rrNext:0,pmNext:0,npc:1};if(G.net){c.hh=false;c.human=false}G.chars.push(c);lg('⛵ Ada is safe in camp! She can only rest, but she eats and feels the weather like everyone.','big');fx('build');SCEN.stranded.check()}}},
  afterWeather(){},
  night(){if(!G.sc.rescued){G.sc.ada+=2;lg(`Out on the rock, Ada suffers through the night (${G.sc.ada}/${CHARS.ada.die}).`,'bad');if(G.sc.ada>=CHARS.ada.die){G.over={win:false,why:'Ada did not survive on the rock.'};lg('☠ Ada is gone. The castaways have lost.','bad');fx('lose')}}},
  built(){},
  check(){if(G.sc.rescued&&has('lifeboat'))win('With Ada aboard, the lifeboat pushes through the surf. You are going home!')},
  afterActions(){this.check()},endRound(){this.check()}},
 settlers:{
  setup(){G.sc={kids:0,goals:G.inv.board.filter(k=>INVENTIONS[k]&&INVENTIONS[k].kind==='normal')}},
  goal(){const g=G.sc.goals.filter(has).length;return `Home: shelter ${hasShelter()?'✓':'✗'}, roof ${G.camp.roof}, palisade ${G.camp.pal}, weapon ${G.weapon} (each 1+) · inventions ${g}/${G.sc.goals.length} · children ${G.sc.kids}`},
  book(){G.prod.half=1;lg('Bad crops: production is halved this round.','bad')},
  totem(pos,ctx){const t=tileAt(pos);const other=G.map.some(m=>m.id!==pos&&tileAt(m.id)&&tileAt(m.id).terr===t.terr&&!m.waste);if(!other){G.map[pos].waste=1;lg(`Wasteland: this ${t.terr} is barren and counts as unexplored.`,'bad')}},
  roundStart(){if([7,9,11].includes(G.round)){G.sc.kids++;lg(`👶 A child is born! (${G.sc.kids} now, each needs 1 food a night)`,'big')}},
  specials:{reclaim:{n:'Reclaim the land (remove a black marker)',dice:null,need:2,why(){return blackMarkers().length?null:'no black markers on the island'},win(ctx){push({f:'fn',k:'reclaimPick'})}}},
  nightKids(){if(!G.sc.kids)return;const have=G.res.food+G.res.pfood;if(have<G.sc.kids){G.over={win:false,why:'A child went hungry.'};lg('There is not enough food for the children. The settlement fails.','bad');fx('lose');return}pay('food',G.sc.kids,[],true);lg(`The children eat (${G.sc.kids} food).`)},
  check(){if(hasShelter()&&G.camp.roof>=1&&G.camp.pal>=1&&G.weapon>=1&&G.sc.goals.every(has))win('Snug house, strong walls, every tool you need: the settlers are home.')},
  afterActions(){this.check()},endRound(){this.check()}}};
function win(why){if(G.over)return;G.over={win:true,why};lg('🏆 '+why,'big');fx('win')}
function fogCandidates(){return G.map.filter(m=>!m.fog&&!m.down).map(m=>m.id)}
FN.fogPick=fr=>{if(!fr.n)return;const o=fogCandidates().sort((a,b)=>fogHarm(a)-fogHarm(b)).map(p=>({l:`${tileAt(p)?'Tile '+tileAt(p).no+' ('+tileAt(p).terr+')':'Unexplored space '+p}${p===G.camp.pos?' — the camp!':''}`,frames:[{f:'fn',k:'fogPut',p,n:fr.n-1}],pos:p}));
  ask('team',`Mysterious fog: choose a space for fog (${fr.n} left)`,o,{kind:'fog'})};
FN.fogPut=fr=>{G.map[fr.p].fog=1;lg(`Fog settles on ${tileAt(fr.p)?'tile '+tileAt(fr.p).no:'space '+fr.p}.`,'bad');push({f:'fn',k:'fogPick',n:fr.n})};
function fogHarm(p){const t=tileAt(p);let h=0;if(p===G.camp.pos)h+=20;if(t){h+=5+t.src.length*2;h-=dist(G.camp.pos,p)}else h+=MAP[p].adj.some(q=>tileAt(q))?2:0;return h}
function blackMarkers(){const o=[];for(const m of G.map){const t=tileAt(m.id);if(!t)continue;if(m.waste)o.push({p:m.id,w:1});for(const i in m.exh)o.push({p:m.id,i})}return o}
FN.reclaimPick=fr=>{const o=blackMarkers().map(b=>({l:b.w?`Place ${b.p+1}: barren land becomes usable`:`Place ${b.p+1}: ${tileAt(b.p).src[b.i]||'extra'} source recovers`,frames:[{f:'fn',k:'reclaim',b}]}));ask('team','Which black marker is removed?',o,{kind:'reclaim'})};
FN.reclaim=fr=>{const b=fr.b;if(b.w)delete G.map[b.p].waste;else delete G.map[b.p].exh[b.i];lg('The land recovers.','good')};
