// ---------- game data. Numbers follow the 1st-edition game exactly; every name and text is original. ----------
// Dial rows are speeds 0..5, columns: turn L, bank L, straight, bank R, turn R, K-turn. 0 = none, 1 white, 2 green, 3 red.
const FACTIONS=[{n:'Free Compact',col:0},{n:'Iron Armada',col:1},{n:'Void Syndicate',col:2,ex:'syn'}];
const COLKEY=['w','w','g','r'];
function dialFrom(rows){const out=[];const T=[['T',-1],['B',-1],['S',0],['B',1],['T',1],['K',0]];rows.forEach((r,sp)=>r.forEach((v,j)=>{if(v&&T[j])out.push({s:sp,t:T[j][0],d:T[j][1],c:['','w','g','r'][v]})}));return out}
const SHIPS={
  lancer:{n:'Lancer heavy fighter',model:'lance',atk:3,agi:2,hull:3,sh:2,acts:['F','TL'],dial:dialFrom([[0,0,0,0,0,0],[0,2,2,2,0,0],[1,1,2,1,1,0],[1,1,1,1,1,0],[0,0,1,0,0,3]])},
  talon:{n:'Talon light fighter',model:'shard',atk:2,agi:3,hull:3,sh:0,acts:['F','BR','E'],dial:dialFrom([[0,0,0,0,0,0],[1,0,0,0,1,0],[1,2,2,2,1,0],[1,1,2,1,1,3],[0,0,1,0,0,3],[0,0,1,0,0,0]])}};
// ability keys (ab) are implemented in engine hooks; t is the card text shown to players
const PILOTS={
  kael:{n:'Kael Varro',ship:'lancer',ps:8,pts:28,u:['T','Tp','M'],uniq:1,uid:'kael',ab:'kael',t:'When defending, you may change 1 of your focus results to an evade result.'},
  brink:{n:'Tomas Brink',ship:'lancer',ps:5,pts:25,u:['Tp','M'],uniq:1,ab:'brink',t:'Other friendly ships at range 1 cannot be attacked if the attacker could attack you instead.'},
  ember:{n:'Ember Squadron Pilot',ship:'lancer',ps:4,pts:23,u:['Tp','M']},
  cadet:{n:'Cadet Pilot',ship:'lancer',ps:2,pts:21,u:['Tp','M']},
  knife:{n:'"Knifepoint"',ship:'talon',ps:7,pts:17,u:['T'],uniq:1,ab:'knife',t:'When attacking at range 1, roll 1 additional attack die.'},
  hex:{n:'"Hex"',ship:'talon',ps:6,pts:16,u:[],uniq:1,ab:'hex',t:'When defending, ships attacking you cannot spend focus tokens or reroll attack dice.'},
  nightjar:{n:'"Nightjar"',ship:'talon',ps:5,pts:15,u:[],uniq:1,ab:'nightjar',t:'After you fly a green maneuver, you may take a free focus action.'},
  onyx:{n:'Onyx Squadron Pilot',ship:'talon',ps:4,pts:14,u:['T']},
  slate:{n:'Slate Squadron Pilot',ship:'talon',ps:3,pts:13,u:[]},
  drill:{n:'Drill Wing Pilot',ship:'talon',ps:1,pts:12,u:[]}};
const SLOTN={T:'Talent',Tp:'Torpedo',M:'Mech',Ms:'Missile',Tu:'Turret',C:'Crew',Ca:'Cannon',Bo:'Bomb',Sy:'System'};
const UPGRADES={
  u_plasma:{n:'Plasma Torpedoes',slot:'Tp',pts:4,t:'Attack (target lock): spend your lock and discard this card. Attack 4, range 2-3. You may change 1 focus result to a crit.',wpn:{atk:4,r:[2,3],need:'TL',spend:'TL',discard:true,f2c:1}},
  u_tinker:{n:'Mech "Tinker"',slot:'M',pts:4,uniq:1,t:'After you fly a green maneuver, recover 1 shield (up to your shield value).',afterGreen:'shield'},
  u_juke:{n:'Mech "Juke"',slot:'M',pts:3,uniq:1,t:'Action: increase your agility by 1 until the end of the round.',act:'JK',actL:'Juke (+1 agility)'},
  u_will:{n:'Iron Will',slot:'T',pts:1,t:'When you are dealt a faceup damage card with the Pilot trait, discard it at once without resolving it.'},
  u_dead:{n:'Deadshot Focus',slot:'T',pts:3,t:'Action: when attacking this round, you may change 1 focus result to a crit and all other focus results to hits.',act:'MK',actL:'Deadshot focus'}};
// ---- damage deck (33 cards). k is the engine hook, tr the trait (Ship / Pilot), fix = repair action roll that flips it facedown ----
const DAMAGE={
  rupture:{n:'Hull Rupture',tr:'Ship',k:'direct',t:'This card counts as 2 damage against your hull.',x:7},
  flash:{n:'Flash Blindness',tr:'Pilot',k:'blinded',t:'The next time you attack, roll no attack dice. Then flip this card facedown.',x:2},
  cfire:{n:'Cockpit Fire',tr:'Ship',k:'fire',t:'At the start of each combat phase, roll 1 attack die: on a hit, suffer 1 damage. Action: flip this card facedown.',x:2,fix:'any'},
  canopy:{n:'Shattered Canopy',tr:'Pilot',k:'cockpit',t:'After the round you receive this card, your pilot skill counts as 0.',x:2},
  stutter:{n:'Engine Stutter',tr:'Ship',k:'engine',t:'All your turn maneuvers count as red maneuvers.',x:2},
  blackout:{n:'Sensor Blackout',tr:'Ship',k:'noact',t:'You cannot take the actions on your action bar. Action: roll 1 attack die; on a hit, flip this card facedown.',x:2,fix:'hit'},
  wound:{n:'Wounded Pilot',tr:'Pilot',k:'wounded',t:'Ignore your pilot ability and your Talent upgrades.',x:2},
  blast:{n:'Secondary Blast',tr:'Ship',k:'minor',t:'Roll 1 attack die at once: on a hit, suffer 1 damage. Then flip this card facedown.',x:2},
  breach:{n:'Hull Breach',tr:'Ship',k:'breach',t:'After you fly a red maneuver, roll 1 attack die: on a hit, suffer 1 damage.',x:2},
  jam:{n:'Munitions Jam',tr:'Ship',k:'munitions',t:'Discard 1 of your secondary weapon upgrades at once. Then flip this card facedown.',x:2},
  frame:{n:'Buckled Frame',tr:'Ship',k:'frame',t:'Reduce your agility by 1 (minimum 0). Action: roll 1 attack die; on a hit, flip this card facedown.',x:2,fix:'hit'},
  concuss:{n:'Concussed Pilot',tr:'Pilot',k:'stunned',t:'After a maneuver that makes you overlap a ship or an obstacle, suffer 1 damage.',x:2},
  flare:{n:'Thruster Flare',tr:'Ship',k:'thrust',t:'Receive 1 stress token at once. Then flip this card facedown.',x:2},
  glitch:{n:'Weapon Glitch',tr:'Ship',k:'weak',t:'Reduce your primary weapon value by 1 (minimum 0). Action: roll 1 attack die; on a hit or crit, flip this card facedown.',x:2,fix:'hitcrit'}};
const DAMAGE_TOTAL=Object.values(DAMAGE).reduce((a,d)=>a+d.x,0);
function buildDamageDeck(){const d=[];for(const k in DAMAGE)for(let i=0;i<DAMAGE[k].x;i++)d.push(k);return d}
const EXPS=[];// filled by exp.js
function pilotCost(e){return PILOTS[e.p].pts+(e.u||[]).reduce((a,u)=>a+UPGRADES[u].pts,0)}
function squadCost(sq){return sq.reduce((a,e)=>a+pilotCost(e),0)}
function factionPilots(f,ex){return Object.keys(PILOTS).filter(k=>{const P=PILOTS[k];const fac=SHIPS[P.ship].fac!=null?SHIPS[P.ship].fac:(P.ship==='lancer'?0:1);return (P.fac!=null?P.fac:fac)===f&&(!P.ex||(ex&&ex[P.ex]))&&(!SHIPS[P.ship].ex||(ex&&ex[SHIPS[P.ship].ex]))})}
function upgradesFor(pk,ex){const P=PILOTS[pk];return Object.keys(UPGRADES).filter(k=>{const U=UPGRADES[k];return P.u.includes(U.slot)&&(!U.ex||(ex&&ex[U.ex]))&&(!U.only||U.only(P))})}
// a random legal squadron up to the point limit (unique names only once)
// unique cards: a pilot and a crew card of the same character share one name (uid) and can't both be fielded [#8]
const uname=X=>X.uid||X.n;
// a random legal squadron up to the point limit (unique names only once)
function randomSquad(f,limit,ex,r){r=r||(n=>Math.floor(Math.random()*n));const pool=factionPilots(f,ex);const sq=[],used=new Set();let cost=0,guard=0;
  while(guard++<60){const opts=pool.filter(k=>PILOTS[k].pts+cost<=limit&&!(PILOTS[k].uniq&&used.has(uname(PILOTS[k]))));if(!opts.length)break;const k=opts[r(opts.length)];const e={p:k,u:[]};cost+=PILOTS[k].pts;if(PILOTS[k].uniq)used.add(uname(PILOTS[k]));sq.push(e)}
  // spend leftover points on upgrades, one per slot (a title that adds a slot adds it to the list)
  for(const e of sq){const slots=PILOTS[e.p].u.slice();for(const s of slots){const ups=upgradesFor(e.p,ex).filter(k=>UPGRADES[k].slot===s&&!e.u.includes(k)&&!(UPGRADES[k].uniq&&used.has(uname(UPGRADES[k])))&&UPGRADES[k].pts+cost<=limit);if(ups.length&&r(3)){const u=ups[r(ups.length)];e.u.push(u);cost+=UPGRADES[u].pts;if(UPGRADES[u].uniq)used.add(uname(UPGRADES[u]));if(UPGRADES[u].addSlot)slots.push(UPGRADES[u].addSlot)}}}
  return sq}
const CORE_DUEL=[[{p:'kael',u:['u_plasma','u_tinker']}],[{p:'knife',u:[]},{p:'slate',u:[]}]];// the core-set learning battle: one heavy fighter against two light fighters
function defaultSquad(f){return f===0?CORE_DUEL[0]:CORE_DUEL[1]}
const SIZES=[
  {k:'core',n:'Core duel',d:'1 heavy fighter vs 2 light fighters',squad:(f,ex)=>f===0?CORE_DUEL[0].map(e=>({p:e.p,u:e.u.slice()})):f===1?CORE_DUEL[1].map(e=>({p:e.p,u:[]})):randomSquad(f,36,ex,n=>rnd(n))},
  {k:'sk60',n:'Skirmish 60',d:'random 60-point squadrons',squad:(f,ex)=>randomSquad(f,60,ex,n=>rnd(n))},
  {k:'std',n:'Standard 100',d:'random 100-point squadrons',squad:(f,ex)=>randomSquad(f,100,ex,n=>rnd(n))},
  {k:'custom',n:'Custom squads',d:'build both squadrons yourself (100 points)',squad:(f,ex)=>randomSquad(f,100,ex,n=>rnd(n))}];
var RULES_HTML=`<p>Each round has four steps. The step bar shows where you are.</p>
<h3>1. Plan</h3><p>Secretly choose a maneuver for every ship on its dial. White is normal, <b>green</b> is easy (clears a stress token), <b>red</b> is hard (gives a stress token). A stressed ship can't fly red maneuvers or take actions.</p>
<h3>2. Move</h3><p>Ships reveal and fly their maneuvers from the <b>lowest pilot skill up</b>, so skilled pilots react to what they see. After moving, each ship takes one action: focus, evade, target lock, barrel roll or boost. Bumping into a ship stops you short and skips your action; flying through an asteroid rolls a damage die and skips your action; leaving the battlefield destroys you.</p>
<h3>3. Combat</h3><p>From the <b>highest pilot skill down</b>, each ship may attack one enemy in its firing arc at range 1-3. Roll attack dice equal to the weapon value (+1 at range 1); the defender rolls agility (+1 at range 3 or when an asteroid is in the way). Focus turns focus results into hits or evades; a target lock lets you reroll. Each evade cancels a hit (hits before crits). Damage strips shields first, then hull; crits are dealt face up with lasting effects.</p>
<h3>4. End</h3><p>Unused focus and evade tokens are removed; target locks stay.</p>
<p>Destroy every enemy ship to win. Pilot skill ties: the side with initiative (fewer squad points) moves and fires first.</p>
<p><b>Controls:</b> drag the view to orbit, right-drag or two fingers to pan, wheel or pinch to zoom, T for top-down, Enter for the highlighted button, 1-9 for listed choices, S to skip.</p>`;
