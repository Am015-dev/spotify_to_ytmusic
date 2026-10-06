// ---------- story and guidance texts: bios, briefing, radio chatter, sorties, crit explanations (no rules here) ----------
const FACTION_BIO=['Tough, shielded ships flown by veterans.','Swarms of fast, unshielded fighters.','Hired guns in patched-up ships: unpredictable.'];
const SHIP_BIO={lancer:'a sturdy, shielded Lancer heavy fighter',talon:'a fast Talon light fighter with no shields',anvil:'a slow, armoured Anvil bomber',talonx:'a shielded Talon Prime',
  needle:'a nimble Needle interceptor',razor:'a hard-hitting Razor interceptor',hauler:'a big Longhaul freighter with a turret',warden:'a Warden gunship with a rear arc',
  keel:'a heavily shielded Keel strike fighter',kestrel:'a Kestrel courier with a turret',maul:'a Talon Maul bomber loaded with ordnance',herald:'a heavy Herald shuttle'};
const PILOT_BIO={kael:'veteran Lancer pilot who slips shots at the last second',brink:'loyal wingman who draws fire away from friends',knife:'fast, fragile, deadly up close',
  hex:'a jinx: attackers can’t use focus or rerolls against her',nightjar:'rides green lines and turns them into focus',wren:'squadron ace whose shots strip an enemy’s agility',
  garrick:'shares his focus with nearby wingmates',brannoc:'bomber lead who shares his target locks',horace:'patient gunner who rerolls blanks at long range',
  gutter:'brawler who turns hits into crits up close',shiv:'a knife in the back: an extra die from outside your arc',wailer:'screaming wing leader; friends near him reroll a die',
  varn:'picks the cruellest damage card for his victims',castigan:'the Armada’s dark lord, who takes two actions every turn',tamsin:'unflappable: keeps acting while stressed',
  arlo:'close-quarters daredevil who shoots even when touching',grudge:'too angry to die before combat ends',tarn:'shoots, then slips away with a free roll or boost',
  sorin:'the Armada’s top ace: stress only sharpens his focus',grawl:'hulking captain who shrugs off crits',lark:'smooth talker who hands out free actions',
  jax:'smuggler with nothing to lose: rerolls everything',kira:'hunter whose crits leave her prey stressed',bram:'bounty hunter who switches banks at the last moment',
  krell:'gunship brute with a steady cannon hand',oren:'strike pilot whose crits always land',iveth:'thrives under pressure: rerolls while stressed',
  quill:'courier who lets a friend shoot first',kellan:'passes his focus to a friend in need',juno:'takes stress so a friend rolls an extra die',
  joren:'bomber captain who guides his wing’s missiles',rhane:'missile expert who stretches every range',kade:'draws every enemy lock onto himself',
  varek:'hands his lock to a nearby wingmate',orrin:'soaks up stress for his squadron'};
function pilotBio(s){return PILOT_BIO[s.pilot]||SHIP_BIO[s.type]||''}
// short names for tags and chatter: "Knifepoint", "Slate #1", "Varro"
function shortName(s){const raw=s.name.replace(/"/g,'');if(/Squadron|Pilot|Wing|Group|Runner|Operative|Tracker/.test(raw)){const same=G.ships.filter(o=>o.side===s.side&&o.name===s.name);return raw.split(' ')[0]+(same.length>1?' #'+(same.indexOf(s)+1):'')}
  return raw.length<=12?raw:raw.split(' ')[0]}
function callSign(s){const raw=s.name.replace(/"/g,'');if(/"/.test(s.name))return raw;if(/Squadron|Pilot|Wing|Group|Runner|Operative|Tracker/.test(raw))return raw.split(' ')[0]+' '+(shortName(s).split('#')[1]||'Lead');const w=raw.split(' ');return w[w.length-1]}
// what a faceup damage card does, in plain words, for the ship that has it
function critPlain(c,s){const D=DAMAGE[c];const fix=D.fix==='any'?' Your action can put it out.':D.fix==='hit'?' Action: roll 1 die, a hit repairs it.':D.fix==='hitcrit'?' Action: roll 1 die, a hit or crit repairs it.':'';
  const m={weak:`attack is now ${primary(s)} until repaired.`,frame:`agility is now ${agility(s)} until repaired.`,noact:'no actions from the action bar until repaired.',direct:'counts as 2 hull damage.',
    fire:'rolls a die for damage at the start of each combat phase.',cockpit:'pilot skill counts as 0 from next round.',engine:'every turn counts as a red maneuver.',blinded:'the next attack rolls no dice.',
    wounded:'the pilot ability no longer works.',breach:'rolls a die for damage after each red move.',stunned:'takes 1 damage after any bump or asteroid hit.'}[D.k];
  return (m?m:D.t)+(m?fix:'')}
const NUMW=['no','one','two','three','four','five','six','seven','eight'];
function groupText(ships){const by={};ships.forEach(s=>{by[s.type]=(by[s.type]||0)+1});return Object.keys(by).map(t=>`${NUMW[by[t]]||by[t]} ${SHIPS[t].n.replace(/ (light|heavy) fighter$/,' $1 fighter')}${by[t]>1?'s':''}`).join(' and ')}
// ---- sorties: a light campaign for the Free Compact against the Iron Armada ----
const SORTIES=[
  {sector:'Sector Nebula-7',title:'Convoy escort',win:'Convoy saved.',lose:'The convoy is lost.',size:'core',hook:'Next sortie: the Armada sends a bomber.'},
  {sector:'The Ashfall Belt',title:'Bomber intercept',win:'Bomber down: the convoy slips through.',lose:'The bomber got through to the convoy.',ex:{w3:true},
    sq:[[{p:'kael',u:['u_plasma','u_tinker']}],[{p:'hammer',u:[]},{p:'slate',u:[]}]],hook:'Next sortie: Knifepoint’s wingmates want revenge.',
    text:'A Talon Maul bomber is inbound for the convoy with an escort. It is slow and tough: stay out of its front arc and wear it down.'},
  {sector:'Veil Station',title:'Ambush at the station',win:'Ambush broken.',lose:'The station falls to the ambush.',
    sq:[[{p:'kael',u:['u_plasma','u_tinker']},{p:'ember',u:[]}],[{p:'hex',u:[]},{p:'nightjar',u:[]},{p:'onyx',u:[]},{p:'drill',u:[]}]],hook:'Next sortie: Lord Castigan takes the field himself.',
    text:'Four Armada fighters wait in the station’s shadow. You have a wingman this time: fly together so they can’t gang up on one of you.'},
  {sector:'The Crown Rift',title:'The dark lord',win:'Castigan retreats. The Compact holds the Rift.',lose:'Castigan holds the Rift.',ex:{w1:true},
    sq:[[{p:'kael',u:['u_plasma','u_tinker']},{p:'wren',u:[]}],[{p:'castigan',u:[]},{p:'wailer',u:[]},{p:'slate',u:[]}]],hook:'Campaign complete! Replay any sortie, or try a Standard 100 battle.',
    text:'Lord Castigan leads in person: two actions every turn. Focus your fire on his wingmen first, or on him if you catch him at range 1.'}];
function campaign(){try{return JSON.parse(localStorage.getItem('na_camp')||'null')||{i:0,won:0}}catch(e){return {i:0,won:0}}}
function saveCampaign(c){try{localStorage.setItem('na_camp',JSON.stringify(c))}catch(e){}}
// the side the single human plays (solo mode), else -1
function soloSide(){if(!G)return -1;if(typeof NET!=='undefined'&&NET.on)return NET.mySide;// online: this page's own side (-1 when watching)
  const h=[0,1].filter(k=>G.players[k].human);return h.length===1?h[0]:-1}
function briefingHTML(){const me=soloSide()>=0?soloSide():0,fo=1-me;const mine=G.ships.filter(s=>s.side===me),foe=G.ships.filter(s=>s.side===fo);const so=G.sortie!=null?SORTIES[G.sortie]:null;
  const lead=mine.slice().sort((a,b)=>b.ps-a.ps)[0],boss=foe.slice().sort((a,b)=>(PILOTS[b.pilot].uniq?1:0)-(PILOTS[a.pilot].uniq?1:0)||b.ps-a.ps)[0];
  const F=k=>FACTIONS[G.fac[k]].n;
  let t=`${so?so.sector:'Sector Nebula-7'}. The ${F(fo)} patrol has found the ${F(me)}’s supply route. `;
  t+=mine.length===1?`${esc(lead.name)}, ${pilotBio(lead)}, is the only fighter between ${groupText(foe)} and the convoy. `:`${mine.map(s=>esc(s.name)).join(', ')} stand between ${groupText(foe)} and the convoy. `;
  t+=`${esc(boss.name)} leads them: ${pilotBio(boss)}.`;
  if(so&&so.text)t+=' '+so.text;
  const full=t.replace(/<[^>]+>/g,'')+' Win: destroy every enemy ship. You fly '+(mine.length===1?'1 ship':mine.length+' ships')+' (orange tags at the bottom edge); the enemy starts at the top.';
  // phone: one short line plus icons; the whole story is a long-press away (data-full)
  return `<div class="brief" data-full="${esc(full)}"><h3>📡 ${so?`Sortie ${G.sortie+1}: ${esc(so.title)}`:'Skirmish'}</h3><p class="bico">🎯 Destroy ${foe.length===1?'the enemy ship':'all '+foe.length+' enemy ships'}</p><p class="bico2"><span title="your ships">🛩 ${mine.length}</span> <span title="their ships">👾 ${foe.length}</span> <span class="hold">☝ hold: story</span></p></div>`}
// ---- radio chatter for the key beats (shown in the dock, never in the battle log) ----
const CHAT={
  fire:[[`Got you in my sights, {t}!`,`Steady… steady…`,`Lining up… firing!`,`{t}, you're mine.`],[`Got you in my sights, {t}!`,`Target acquired. Firing.`,`For the Armada!`,`Hold still, {t}.`],[`Nothing personal, {t}.`,`Payday!`]],
  shields:[`Shields holding… barely.`,`Shields took that one.`],shieldsdown:[`Shields are down!`,`I've lost my shields!`],
  hull:[`I'm hit! Hull damage!`,`That hurt. Still flying.`],crit:[`Critical hit: {c}!`,`Something's burning… {c}!`],
  miss:[`Too slow!`,`Missed me!`,`Not today.`],boom:[`{v} is going down!`,`Scratch one!`,`{v} is gone!`],lost:[`We lost {v}!`,`{v}! No!`],
  bump:[`Watch it! Pulling up!`,`Collision alert!`],stress:[`Pulling hard… that one strained the engines.`],rock:[`Rocks! I clipped a rock!`],
  round:[[`Stay sharp, everyone.`,`Keep your turns tight.`,`Convoy's counting on us.`],[`Slate Squadron, break left!`,`Box them in!`,`Close the net.`],[`Spread out.`]]};
const pickLine=a=>a[Math.floor(Math.random()*a.length)];
