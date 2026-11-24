// Every printed faction card's one-line hint (cardLine in src/ui1.js) is checked against THAT card's own text and engine params
// (cm.self, cm.x, fx). No generic keyword pass: each card is compared one by one, with the line the player would really see.
require('./src/data.js');require('./src/engine.js');
const fs=require('fs');
const src=fs.readFileSync(__dirname+'/src/ui1.js','utf8');
const a=src.indexOf('const CMD_L='),b=src.indexOf('function cardLine(id)');
if(a<0||b<0){console.log('FAIL: cardLine code not found');process.exit(1)}
const cardLineI=new Function(src.slice(a,b).replace(/^function cardWords.*$/m,'')+';return cardLineI')();
const F=['nobility','clans','uprising','gathering'];
const G=TB.newGame({players:F.map((f,i)=>({faction:f,name:'P'+i})),seed:3});
let fails=0,n=0;const bad=(id,i,line,why)=>{fails++;console.log('FAIL',id,i.name,'|',why,'| hint:',line,'| card:',i.text)};
for(let s=0;s<4;s++)for(let k=0;k<19;k++){const id=s*100+k;const i=TB.cardInfo(G,id);if(!i||!i.name)continue;n++;
  const line=cardLineI(i),t=i.text||'',cp=i.cmp||{};
  // the printed card: basic cards print their command in the text; Site cards print it as an icon (the data's cm list)
  const def=k<14?TB.DATA.BASIC[k]:TB.DATA.SITE[F[s]][k-14];const raw={};for(const c of def.cm)raw[c.n]=c;
  const basicTxt=k<14;const cmdPart=line.split('. ').filter(x=>/^(Day|Night|Autumn):/.test(x)).join('. ');
  if(JSON.stringify(Object.keys(raw).sort())!==JSON.stringify(i.commands.slice().sort()))bad(id,i,line,'engine commands '+i.commands+' vs printed '+Object.keys(raw));
  for(const c in raw)for(const f of ['x','self'])if(+(raw[c][f]||0)!==+((cp[c]||{})[f]||0))bad(id,i,line,c+'.'+f+' printed '+raw[c][f]+' engine '+(cp[c]||{})[f]);
  // 1. every command the engine gives this card is described with this card's own params
  for(const c of i.commands){const P=cp[c]||{};
    if(c==='rally'){if(P.self){if(!/returns this card to your hand/.test(line))bad(id,i,line,'Rally (self) must return THIS card');if(/your Active cards|up to/.test(cmdPart))bad(id,i,line,'Rally (self) described as a multi-card Rally');if(basicTxt&&!/Rally \(self\)/.test(t))bad(id,i,line,'engine self but text is not Rally (self)')}
      else{if(!new RegExp('returns up to '+P.x+' of your Active cards').test(line))bad(id,i,line,'Rally x='+P.x+' not stated');if(basicTxt&&P.x===2&&!/any two/.test(t))bad(id,i,line,'Rally 2 but text differs')}}
    if(c==='deploy'){const m=t.match(/Deploy \((\d)\)/);if(basicTxt&&(!m||+m[1]!==P.x))bad(id,i,line,'text Deploy ('+(m&&m[1])+') vs engine x='+P.x);
      if(!/puts this card from your hand face-up next to a region/.test(line))bad(id,i,line,'Deploy must move THIS card');
      if(!new RegExp('stays '+P.x+' more Winter'+(P.x>1?'s':'')+'\\b').test(line))bad(id,i,line,'Deploy duration X='+P.x+' missing')}
    if(c==='flank'&&!/moves this card to another region/.test(line))bad(id,i,line,'Flank');
    if(c==='deadly'){if(!/Eliminates ALL rival Active cards/.test(line))bad(id,i,line,'Deadly');
      const dr=i.fx.includes('agentDrawback');if(dr!==/Follower Eliminates this card/.test(line))bad(id,i,line,'Deadly drawback shown='+!dr);if(dr&&basicTxt&&!/Drawback/.test(t))bad(id,i,line,'drawback not in text')}
    if(c==='ambret'&&!(/Ambush or Retreat/.test(line)&&(!basicTxt||/Ambush OR Retreat/.test(t))))bad(id,i,line,'Ambush OR Retreat');
    if(c==='ambush'&&!/Ambush, adds a face-down card/.test(line))bad(id,i,line,'Ambush');
    if(c==='retreat'&&!/Retreat, sends your cards here back/.test(line))bad(id,i,line,'Retreat');}
  // 2. no command in the hint that the card does not have
  for(const w of ['Rally','Deploy','Flank','Deadly','Ambush','Retreat']){const k=w.toLowerCase();if(new RegExp('\\b'+w+',').test(line)&&!i.commands.includes(k)&&!(i.commands.includes('ambret')&&/Ambush|Retreat/.test(w)))bad(id,i,line,'hint names '+w+' the card lacks')}
  // 3. command words printed on the card are in the hint
  if(basicTxt)for(const w of ['Rally','Deploy','Flank','Deadly','Ambush','Retreat'])if(new RegExp('\\b'+w+'\\b').test(t)&&!new RegExp('\\b'+w+'\\b').test(line))bad(id,i,line,'card prints '+w+', hint does not');
  // 4. a card with its own (non-command) text shows that text; "No power" only on blank cards
  if(i.kind!=='basic'&&i.kind!=='heir'&&t&&!line.includes(t))bad(id,i,line,'own text missing from hint');
  if(/No power/.test(line)&&(t||i.commands.length))bad(id,i,line,'says No power');
  if(/Cannot be Eliminated/.test(line)&&!i.traits.includes('inv'))bad(id,i,line,'Invulnerable claimed')}
// (the engine side of each line, e.g. a Deploy (1) card surviving exactly 1 Winter and Rally (self) returning only itself, is in rules-test.js)
// tutorial and coach lines that teach a rule must match the engine (R57)
{const tut=fs.readFileSync(__dirname+'/src/ui12.js','utf8'),sto=fs.readFileSync(__dirname+'/src/story.js','utf8');
  const step=id=>{const m=tut.match(new RegExp("\\{id:'"+id+"',title:'[^']*',say:(?:'([^']*)'|\\(\\)=>([^\\n]*?),target)"));return m?(m[1]||m[2]):''};
  const cmds=step('cmds');if(!(/Night/.test(cmds)&&/before|only then|then Strength|then is Strength|Strength is counted/.test(cmds))||/Night ones after/.test(cmds)){fails++;console.log('FAIL tutorial step cmds must say Night effects come BEFORE the count:',cmds)}
  const rnd=(sto.match(/round:'([^']*)'/)||[])[1]||'';if(!/Lost Pile/.test(rnd)||/go home/.test(rnd)){fails++;console.log('FAIL coach.round must send Supporters to the Lost Pile:',rnd)}
  const sup=(sto.match(/supp:'([^']*)'/)||[])[1]||'';if(!/first fight/.test(sup)){fails++;console.log('FAIL coach.supp must say Supporters count in the first fight only:',sup)}
  if(!/Lost Pile/.test(step('round'))){fails++;console.log('FAIL tutorial Winter step must send Supporters to the Lost Pile')}
  if(/higher seat/.test(tut)){fails++;console.log('FAIL bid ties go to the higher on the Order Track')}}
// 5. every Site of Power card's printed commands (cards.json, the card images) match the game's data.js cm list
{const CJ=JSON.parse(fs.readFileSync(__dirname+'/../cards.json','utf8'));const out=[];
  (function walk(o){if(Array.isArray(o))o.forEach(walk);else if(o&&typeof o==='object'){if(o.id&&Array.isArray(o.commands))out.push(o);Object.values(o).forEach(walk)}})(CJ);
  const norm=c=>c.name==='rally_self'?'rally:self1':c.name==='ambush_or_retreat'?'ambret':c.name+(c.x?':x'+c.x:'');
  const dnorm=c=>c.n+(c.self?':self1':'')+(c.x&&!(c.n==='rally'&&c.self)?':x'+c.x:'');
  let sites=0;for(const f of F)for(const d of TB.DATA.SITE[f]){const j=out.find(o=>o.id===d.id);if(!j){if(d.kind!=='hq'){fails++;console.log('FAIL site',d.id,'not in cards.json')}continue}
    sites++;const a=j.commands.map(norm).sort().join(','),b=d.cm.map(dnorm).sort().join(',');
    if(a!==b){fails++;console.log('FAIL site',d.id,d.nm,'| cards.json',a||'(none)','| data.js',b||'(none)')}
    const TR={resilient:'res',invulnerable:'inv',pathfinder:'path'};const ta=(j.traits||[]).map(t=>TR[t]||t).sort().join(','),tb=(d.tr||[]).slice().sort().join(',');
    if(ta!==tb){fails++;console.log('FAIL site traits',d.id,d.nm,'| cards.json',ta||'(none)','| data.js',tb||'(none)')}
    for(const [jk,dk] of [['strength','s'],['archetype','ar'],['lore_cost','lc']])if(j[jk]!=null&&String(j[jk])!==String(d[dk])){fails++;console.log('FAIL site',jk,d.id,d.nm,'| cards.json',j[jk],'| data.js',d[dk])}}
  if(sites<14){fails++;console.log('FAIL only',sites,'Site cards compared with cards.json')}else console.log('site commands, traits, strength, archetype, cost vs cards.json:',sites,'cards')}
// 6. the Great Road's discard line stays within phone-check's 8-word limit for every Kingdom Card name (R64 flake)
{const es=fs.readFileSync(__dirname+'/src/engine.js','utf8');const m=es.match(/lg\('([^']*)'\+kname\(road\[i\]\)\+'([^']*)'\)/);
  const words=t=>t.replace(/[^a-zA-Z0-9'’]+/g,' ').trim().split(' ').filter(w=>/[a-z][a-z]/i.test(w)).length;
  if(!m){fails++;console.log('FAIL Great Road discard line not found in engine.js')}else{let worst='',wn=0;for(const k of TB.DATA.KC){const t=m[1]+k.nm+m[2];if(words(t)>wn){wn=words(t);worst=t}}
    if(wn>8){fails++;console.log('FAIL road discard line has',wn,'words:',worst)}else console.log('road discard line: at most',wn,'words ('+worst+')')}}
console.log(fails?'hint-test FAIL '+fails:'hint-test PASS ('+n+' cards, each hint vs its own text and params)');
process.exit(fails?1:0);
