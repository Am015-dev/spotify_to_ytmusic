// ---------- expansions: waves 1-3 of the 1st edition (numbers exact; names, art and texts original) ----------
EXPS.push({k:'w1',n:'Wave 1: bombers & prime fighters',d:'Anvil bomber, Talon Prime, more Lancer & Talon pilots; turrets, ion, missiles.'},
  {k:'w2',n:'Wave 2: interceptors & big ships',d:'Needle, Razor, the Longhaul freighter and the Warden gunship; bombs, crew, turrets, rear arcs.'},
  {k:'w3',n:'Wave 3: strike craft & shuttles',d:'Keel strike fighter, Kestrel courier, Talon Maul bomber, Herald shuttle; systems, mines.'});
Object.assign(SHIPS,{
  anvil:{n:'Anvil assault bomber',model:'bomber',ex:'w1',fac:0,atk:2,agi:1,hull:5,sh:3,acts:['F','TL'],dial:dialFrom([[0,0,0,0,0,0],[0,1,2,1,0,0],[1,1,2,1,1,0],[3,1,1,1,3,0],[0,0,3,0,0,3]])},
  talonx:{n:'Talon Prime',model:'shard',scale:1.15,ex:'w1',fac:1,atk:2,agi:3,hull:3,sh:2,acts:['F','TL','BR','E'],dial:dialFrom([[0,0,0,0,0,0],[0,2,0,2,0,0],[1,1,2,1,1,0],[1,1,2,1,1,0],[0,0,1,0,0,3],[0,0,1,0,0,0]])},
  needle:{n:'Needle interceptor',model:'needle',ex:'w2',fac:0,atk:2,agi:3,hull:2,sh:2,acts:['F','TL','BO','E'],dial:dialFrom([[0,0,0,0,0,0],[1,0,0,0,1,0],[2,2,2,2,2,0],[1,1,2,1,1,3],[0,0,2,0,0,0],[0,0,2,0,0,3]])},
  razor:{n:'Razor interceptor',model:'razor',ex:'w2',fac:1,atk:3,agi:3,hull:3,sh:0,acts:['F','BR','BO','E'],dial:dialFrom([[0,0,0,0,0,0],[1,0,0,0,1,0],[2,2,2,2,2,0],[1,1,2,1,1,3],[0,0,2,0,0,0],[0,0,1,0,0,3]])},
  hauler:{n:'Longhaul freighter',model:'freighter',ex:'w2',fac:0,base:'L',arc:'T',atk:3,agi:1,hull:8,sh:5,acts:['F','TL'],title:1,dial:dialFrom([[0,0,0,0,0,0],[1,2,2,2,1,0],[1,1,2,1,1,0],[0,1,1,1,0,3],[0,0,1,0,0,3]])},
  warden:{n:'Warden gunship',model:'gunship',ex:'w2',fac:1,base:'L',arc:'A',atk:3,agi:2,hull:6,sh:4,acts:['F','TL','E'],title:1,dial:dialFrom([[0,0,0,0,0,0],[0,2,2,2,0,0],[1,1,2,1,1,0],[1,1,1,1,1,3],[0,0,1,0,0,3]])},
  keel:{n:'Keel strike fighter',model:'wedge',ex:'w3',fac:0,atk:3,agi:1,hull:3,sh:5,acts:['F','TL','BR'],dial:dialFrom([[0,0,0,0,0,0],[3,2,2,2,3,0],[1,1,2,1,1,3],[0,3,1,3,0,0],[0,0,3,0,0,0]])},
  kestrel:{n:'Kestrel courier',model:'hawk',ex:'w3',fac:0,atk:1,agi:2,hull:4,sh:1,acts:['F','TL'],title:1,dial:dialFrom([[0,0,0,0,0],[0,2,2,2,0],[1,1,2,1,1],[0,3,1,3,0],[0,0,3,0,0]])},
  maul:{n:'Talon Maul bomber',model:'maul',ex:'w3',fac:1,atk:2,agi:2,hull:6,sh:0,acts:['F','TL','BR'],dial:dialFrom([[0,0,0,0,0,0],[0,1,2,1,0,0],[3,2,2,2,3,0],[1,1,2,1,1,0],[0,0,1,0,0,0],[0,0,0,0,0,3]])},
  herald:{n:'Herald shuttle',model:'shuttle',ex:'w3',fac:1,base:'L',atk:3,agi:1,hull:5,sh:5,acts:['F','TL'],title:1,dial:dialFrom([[0,0,3,0,0],[0,2,2,2,0],[3,1,2,1,3],[0,3,1,3,0]])}});
SHIPS.lancer.fac=0;SHIPS.talon.fac=1;
Object.assign(PILOTS,{
  wren:{n:'Wren Talvo',ship:'lancer',ex:'w1',ps:9,pts:29,u:['T','Tp','M'],uniq:1,ab:'wedge',t:'When attacking, reduce the defender\'s agility by 1 (minimum 0).'},
  garrick:{n:'Garrick Dray',ship:'lancer',ex:'w1',ps:6,pts:26,u:['Tp','M'],uniq:1,ab:'garven',t:'After you spend a focus token, you may pass it to another friendly ship at range 1-2 instead of discarding it.'},
  ironsq:{n:'Iron Squadron Pilot',ship:'anvil',ps:4,pts:20,u:['Tu','Tp','Tp','M']},
  brannoc:{n:'Brannoc Dale',ship:'anvil',ps:6,pts:23,u:['Tu','Tp','Tp','M'],uniq:1,ab:'dutch',t:'After you acquire a target lock, choose another friendly ship at range 1-2: it may acquire a target lock at once.'},
  horace:{n:'Horace Venn',ship:'anvil',ps:8,pts:25,u:['Tu','Tp','Tp','M'],uniq:1,ab:'horton',t:'When attacking at range 2-3, you may reroll any of your blank results.'},
  rustsq:{n:'Rust Squadron Pilot',ship:'anvil',ps:2,pts:18,u:['Tu','Tp','Tp','M']},
  gutter:{n:'"Gutter"',ship:'talon',ex:'w1',ps:5,pts:15,u:[],uniq:1,ab:'gundark',t:'When attacking at range 1, you may change 1 of your hit results to a crit.'},
  shiv:{n:'"Shiv"',ship:'talon',ex:'w1',ps:6,pts:16,u:[],uniq:1,ab:'backstab',t:'When attacking from outside the defender\'s firing arc, roll 1 additional attack die.'},
  wailer:{n:'"Wailer"',ship:'talon',ex:'w1',ps:8,pts:18,u:['T'],uniq:1,ab:'howl',t:'When another friendly ship at range 1 attacks with its primary weapon, it may reroll 1 attack die.'},
  varn:{n:'Varn Kessik',ship:'talonx',ps:7,pts:27,u:['T','Ms'],uniq:1,ab:'maarek',t:'When your attack deals a faceup damage card, draw 3 instead, deal the one you choose and discard the others.'},
  galesq:{n:'Gale Squadron Pilot',ship:'talonx',ps:2,pts:21,u:['Ms']},
  squallsq:{n:'Squall Squadron Pilot',ship:'talonx',ps:4,pts:23,u:['Ms']},
  castigan:{n:'Lord Castigan',ship:'talonx',ps:9,pts:29,u:['T','Ms'],uniq:1,uid:'vader',ab:'vader',t:'During your action step you may take 2 actions.'},
  tamsin:{n:'Tamsin Coe',ship:'needle',ps:8,pts:26,u:['T','Ms'],uniq:1,ab:'tycho',t:'You may take actions even while you have stress tokens.'},
  arlo:{n:'Arlo Crane',ship:'needle',ps:6,pts:23,u:['Ms'],uniq:1,ab:'arvel',t:'You may attack an enemy ship in your firing arc that you are touching.'},
  jadesq:{n:'Jade Squadron Pilot',ship:'needle',ps:3,pts:19,u:['T','Ms']},
  testfl:{n:'Test Flight Pilot',ship:'needle',ps:1,pts:17,u:['Ms']},
  primew:{n:'Prime Wing Pilot',ship:'razor',ps:1,pts:18,u:[]},
  vengsq:{n:'Vengeance Squadron Pilot',ship:'razor',ps:3,pts:20,u:[]},
  fangsq:{n:'Fang Squadron Pilot',ship:'razor',ps:4,pts:21,u:['T']},
  grudge:{n:'"Grudge"',ship:'razor',ps:5,pts:23,u:[],uniq:1,ab:'felswrath',t:'When your damage reaches your hull, you are not destroyed until the end of the combat phase.'},
  tarn:{n:'Tarn Vessor',ship:'razor',ps:7,pts:25,u:['T'],uniq:1,ab:'turr',t:'After you attack, you may take a free boost or barrel roll action.'},
  sorin:{n:'Sorin Vael',ship:'razor',ps:9,pts:27,u:['T'],uniq:1,ab:'soontir',t:'When you receive a stress token, you may also take a focus token.'},
  fringe:{n:'Fringe Runner',ship:'hauler',ps:1,pts:27,u:['C','C'],ov:{atk:2,agi:1,hull:6,sh:4}},
  grawl:{n:'Grawl',ship:'hauler',ps:5,pts:42,u:['T','Ms','C','C'],uniq:1,uid:'chewbacca',ab:'chewie',t:'When you are dealt a faceup damage card, flip it facedown at once without resolving it.'},
  lark:{n:'Lark Castellan',ship:'hauler',ps:7,pts:44,u:['T','Ms','C','C'],uniq:1,ab:'lando',t:'After you fly a green maneuver, another friendly ship at range 1 may take 1 free action from its action bar.'},
  jax:{n:'Jax Harrow',ship:'hauler',ps:9,pts:46,u:['T','Ms','C','C'],uniq:1,ab:'han',t:'When attacking, you may reroll all of your dice (if you do, you must reroll as many as possible).'},
  kira:{n:'Kira Scald',ship:'warden',ps:7,pts:38,u:['T','Ca','Bo','C','Ms'],uniq:1,ab:'kath',t:'When attacking, the defender receives 1 stress token if it cancels at least 1 crit.'},
  bram:{n:'Bram Voss',ship:'warden',ps:8,pts:39,u:['T','Ca','Bo','C','Ms'],uniq:1,ab:'boba',t:'When you reveal a bank maneuver, you may switch to the other bank of the same speed.'},
  krell:{n:'Krell Tavish',ship:'warden',ps:5,pts:36,u:['Ca','Bo','C','Ms'],uniq:1,ab:'krassis',t:'When attacking with a secondary weapon, you may reroll 1 attack die.'},
  tracker:{n:'Bounty Tracker',ship:'warden',ps:3,pts:33,u:['Ca','Bo','C','Ms']},
  oren:{n:'Oren Vask',ship:'keel',ps:8,pts:31,u:['T','Sy','Ca','Tp','Tp'],uniq:1,ab:'tennumb',t:'When attacking, 1 of your crit results cannot be cancelled by defense dice.'},
  iveth:{n:'Iveth Sarn',ship:'keel',ps:6,pts:28,u:['T','Sy','Ca','Tp','Tp'],uniq:1,ab:'ibtisam',t:'When attacking or defending with at least 1 stress token, you may reroll 1 of your dice.'},
  dirksq:{n:'Dirk Squadron Pilot',ship:'keel',ps:4,pts:24,u:['Sy','Ca','Tp','Tp']},
  azuresq:{n:'Azure Squadron Pilot',ship:'keel',ps:2,pts:22,u:['Sy','Ca','Tp','Tp']},
  operative:{n:'Compact Operative',ship:'kestrel',ps:2,pts:16,u:['Tu','C']},
  quill:{n:'Quill Marren',ship:'kestrel',ps:4,pts:19,u:['Tu','C'],uniq:1,ab:'roark',t:'At the start of combat, choose another friendly ship at range 1-3: it counts as pilot skill 12 until the phase ends.'},
  kellan:{n:'Kellan Stroud',ship:'kestrel',ps:6,pts:21,u:['T','Tu','C'],uniq:1,ab:'kyle',t:'At the start of combat, you may pass 1 of your focus tokens to another friendly ship at range 1-3.'},
  juno:{n:'Juno Arlen',ship:'kestrel',ps:8,pts:25,u:['T','Tu','C'],uniq:1,ab:'jan',t:'When another friendly ship at range 1-3 attacks, if you have no stress, you may take 1 to give it 1 extra attack die.'},
  cleaver:{n:'Cleaver Squadron Pilot',ship:'maul',ps:2,pts:16,u:['Tp','Tp','Ms','Ms','Bo']},
  hammer:{n:'Hammer Squadron Pilot',ship:'maul',ps:4,pts:18,u:['Tp','Tp','Ms','Ms','Bo']},
  joren:{n:'Captain Joren',ship:'maul',ps:6,pts:22,u:['T','Tp','Tp','Ms','Ms','Bo'],uniq:1,ab:'jonus',t:'When another friendly ship at range 1 attacks with a secondary weapon, it may reroll up to 2 attack dice.'},
  rhane:{n:'Major Rhane',ship:'maul',ps:7,pts:26,u:['T','Tp','Tp','Ms','Ms','Bo'],uniq:1,ab:'rhymer',t:'When attacking with a secondary weapon, you may stretch its range by 1 (within range 1-3).'},
  kade:{n:'Captain Kade',ship:'herald',ps:8,pts:27,u:['Sy','Ca','C','C'],uniq:1,ab:'kagi',t:'When an enemy ship acquires a target lock, it must lock onto you if it can.'},
  varek:{n:'Colonel Varek',ship:'herald',ps:6,pts:26,u:['Sy','Ca','C','C'],uniq:1,ab:'jendon',t:'At the start of combat, you may hand your target lock to a friendly ship at range 1 that has none.'},
  orrin:{n:'Captain Orrin',ship:'herald',ps:4,pts:24,u:['Sy','Ca','C','C'],uniq:1,ab:'yorr',t:'When another friendly ship at range 1-2 would receive a stress token, if you have 2 or fewer, you may take it instead.'},
  omega:{n:'Omega Group Pilot',ship:'herald',ps:2,pts:21,u:['Sy','Ca','C','C']}});
// every ship may carry one modification; ships with a title card get a title slot
for(const k in PILOTS){const P=PILOTS[k];if(!P.u.includes('Mo'))P.u.push('Mo');if(SHIPS[P.ship].title&&!P.u.includes('Ti'))P.u.push('Ti');if(!P.ex&&SHIPS[P.ship].ex)P.ex=SHIPS[P.ship].ex}
Object.assign(SLOTN,{Mo:'Modification',Ti:'Title'});
const WPN=(atk,r,o)=>Object.assign({atk,r},o||{});
Object.assign(UPGRADES,{
  u_ionturret:{n:'Ion Pulse Turret',slot:'Tu',pts:5,ex:'w1',t:'Attack 3, range 1-2, any direction. On a hit the target suffers 1 damage and gets an ion token; then cancel all dice.',wpn:WPN(3,[1,2],{arc:'T',ion:1})},
  u_assist:{n:'Mech "Pilot-Assist"',slot:'M',pts:1,ex:'w1',t:'All your speed 1 and 2 maneuvers count as green.',green12:1},
  u_patch:{n:'Mech "Patch"',slot:'M',pts:3,uniq:1,ex:'w1',t:'Action: roll 1 defense die. On an evade or focus, discard 1 of your facedown damage cards.'},
  u_relock:{n:'Mech "Relock"',slot:'M',pts:2,uniq:1,ex:'w1',t:'After you spend a target lock, roll 1 defense die: on an evade, lock the same ship again (not usable in this attack).'},
  u_scrap:{n:'Mech "Scrapper"',slot:'M',pts:1,ex:'w1',t:'In the end phase, you may flip 1 of your faceup Ship-trait damage cards facedown.'},
  u_pack:{n:'Pack Tactics',slot:'T',pts:2,ex:'w1',t:'At the start of combat, you may choose 1 friendly ship at range 1: it counts as having your pilot skill until the phase ends.'},
  u_lead:{n:'Wing Leader',slot:'T',pts:2,uniq:1,ex:'w1',t:'Action: choose 1 friendly ship at range 1-2 with lower pilot skill: it may take 1 free action at once.'},
  u_snap:{n:'Snap Roll',slot:'T',pts:2,ex:'w1',t:'Action: a free barrel roll (take a stress token if barrel roll is not on your action bar); then remove 1 enemy lock from you.'},
  u_shock:{n:'Shock Missiles',slot:'Ms',pts:4,ex:'w1',t:'Attack (target lock): spend your lock and discard this card. Attack 4, range 2-3. You may change 1 blank result to a hit.',wpn:WPN(4,[2,3],{need:'TL',spend:'TL',discard:1,b2h:1})},
  u_swarmm:{n:'Swarm Missiles',slot:'Ms',pts:4,ex:'w1',t:'Attack (target lock): spend your lock and discard this card. Attack 3, range 1-2, twice.',wpn:WPN(3,[1,2],{need:'TL',spend:'TL',discard:1,twice:1})},
  u_hairpin:{n:'Hairpin',slot:'T',pts:3,ex:'w2',t:'Action: fly a white turn 1 left or right, then take a stress token. Without boost on your action bar, also roll 2 attack dice and suffer any hits.'},
  u_slip:{n:'Slippery',slot:'T',pts:2,ex:'w2',t:'When defending, if you have no stress, you may take 1 stress token to choose 1 attack die: the attacker must reroll it.'},
  u_seeker:{n:'Seeker Missiles',slot:'Ms',pts:5,ex:'w2',t:'Attack (target lock): discard this card (keep the lock). Attack 4, range 2-3. The defender cannot spend evade tokens.',wpn:WPN(4,[2,3],{need:'TL',discard:1,noEvade:1})},
  u_redline:{n:'Redline',slot:'T',pts:3,ex:'w2',t:'Once per round, after an action you may take 1 free action from your action bar, then take a stress token.'},
  u_snapeye:{n:'Snapshot Eye',slot:'T',pts:1,ex:'w2',small:1,t:'Weapons that need a target lock can use focus instead: spend a focus token where you would spend a lock.'},
  u_allin:{n:'All-In',slot:'T',pts:4,ex:'w2',t:'Action: until the end of the round, +1 primary weapon value and -1 agility.'},
  u_tailgun:{n:'Tail Gunner',slot:'C',pts:5,ex:'w2',t:'After an attack that does not hit, you may at once make a primary weapon attack (against any legal target). You cannot attack again this round.'},
  u_ionlance:{n:'Ion Lance',slot:'Ca',pts:3,ex:'w2',t:'Attack 3, range 1-3. On a hit the defender suffers 1 damage and gets an ion token; then cancel all dice.',wpn:WPN(3,[1,3],{ion:1})},
  u_beam:{n:'Heavy Beam Cannon',slot:'Ca',pts:7,ex:'w2',t:'Attack 4, range 2-3. Right after rolling, all your crits become hits.',wpn:WPN(4,[2,3],{c2h:1})},
  u_quake:{n:'Quake Charges',slot:'Bo',pts:2,ex:'w2',t:'When you reveal your dial, you may discard this card to drop a quake charge. It detonates at the end of the Activation phase: every ship at range 1 suffers 1 damage.',bomb:'quake'},
  u_hired:{n:'Hired Copilot',slot:'C',pts:2,ex:'w2',t:'When attacking at range 3, you may change 1 hit result to a crit.'},
  u_burst:{n:'Burst Missiles',slot:'Ms',pts:5,ex:'w2',t:'Attack (target lock): spend your lock and discard this card. Attack 4, range 2-3. On a hit, every other ship at range 1 of the defender suffers 1 damage.',wpn:WPN(4,[2,3],{need:'TL',spend:'TL',discard:1,splash:1})},
  u_oldinst:{n:'Old Instincts',slot:'T',pts:1,ex:'w2',t:'Your pilot skill is 2 higher.',psUp:2},
  u_mines:{n:'Contact Mines',slot:'Bo',pts:3,ex:'w2',t:'Action: discard this card to drop a contact mine. When a ship\'s base or template overlaps it, it detonates: that ship rolls 3 attack dice and suffers every hit and crit.'},
  u_fct:{n:'Fire-Control Tech',slot:'C',pts:3,ex:'w2',t:'You may keep 2 target locks (only 1 per enemy ship). When you acquire a target lock, you may lock onto 2 different ships.'},
  u_heat:{n:'Take the Heat',slot:'T',pts:1,ex:'w2',t:'When a friendly ship at range 1 is hit, you may suffer 1 of its uncancelled crits instead.'},
  u_rook:{n:'Sable Rook',slot:'C',pts:7,uniq:1,uid:'luke',fac:0,ex:'w2',t:'After an attack that does not hit, you may at once make a primary weapon attack, and in it you may change 1 focus to a hit. You cannot attack again this round.'},
  u_nib:{n:'Copilot Nib',slot:'C',pts:1,uniq:1,fac:0,ex:'w2',t:'All your straight maneuvers count as green.',greenS:1},
  u_brakk:{n:'Brakk',slot:'C',pts:4,uniq:1,uid:'chewbacca',fac:0,ex:'w2',t:'When you are dealt a damage card, you may discard it and recover 1 shield; then discard Brakk.'},
  u_hplasma:{n:'Heavy Plasma Torpedoes',slot:'Tp',pts:6,ex:'w3',t:'Attack (target lock): spend your lock and discard this card. Attack 5, range 1. You may change up to 3 blank results to focus.',wpn:WPN(5,[1,1],{need:'TL',spend:'TL',discard:1,b2f:3})},
  u_rapid:{n:'Rapid Blaster',slot:'Ca',pts:5,ex:'w3',t:'Attack 3, range 1. Your hits cannot be cancelled by defense dice (the defender may cancel crits first).',wpn:WPN(3,[1,1],{hard:1})},
  u_track:{n:'Tracking Computer',slot:'Sy',pts:2,ex:'w3',t:'After you attack, you may acquire a target lock on the defender.'},
  u_twin:{n:'Twin Blaster Turret',slot:'Tu',pts:4,ex:'w3',t:'Attack (focus): spend 1 focus token. Attack 3, range 1-2, any direction.',wpn:WPN(3,[1,2],{arc:'T',need:'F',spend:'F'})},
  u_scout:{n:'Scout Specialist',slot:'C',pts:3,ex:'w3',t:'When you take a focus action, take 1 extra focus token.'},
  u_sab:{n:'Saboteur',slot:'C',pts:2,ex:'w3',t:'Action: pick an enemy at range 1 and roll 1 attack die. On a hit or crit, flip one of its random facedown damage cards faceup and resolve it.'},
  u_spot:{n:'Spotter',slot:'C',pts:1,ex:'w3',t:'At the start of the Activation phase, choose 1 enemy ship at range 1-2: you may look at its chosen maneuver.'},
  u_pbomb:{n:'Plasma Bombs',slot:'Bo',pts:5,ex:'w3',t:'When you reveal your dial, you may discard this card to drop a plasma bomb. It detonates at the end of the Activation phase: every ship at range 1 is dealt 1 faceup damage card, straight past its shields.',bomb:'plasma'},
  u_adren:{n:'Adrenaline',slot:'T',pts:1,ex:'w3',t:'When you reveal a red maneuver, you may discard this card to treat it as white this activation.'},
  u_early:{n:'Early Warning Sensors',slot:'Sy',pts:3,ex:'w3',t:'Just before you reveal your maneuver, you may take 1 free action; if you do, skip your action step this round.'},
  u_jam:{n:'Jamming Array',slot:'Sy',pts:4,ex:'w3',t:'When defending, you may change 1 of the attacker\'s hits into a focus. The attacker cannot reroll that die.'},
  u_vell:{n:'Inquisitor Vell',slot:'C',pts:3,uniq:1,uid:'vader',fac:1,ex:'w3',t:'After you attack an enemy ship, you may suffer 2 damage to deal it 1 critical damage.'},
  u_captive:{n:'Captive Informant',slot:'C',pts:3,uniq:1,fac:1,ex:'w3',t:'Once per round, the first ship to declare you as a target receives 1 stress token.'},
  u_instr:{n:'Flight Instructor',slot:'C',pts:4,ex:'w3',t:'When defending, you may reroll 1 focus result; against an attacker with pilot skill 2 or lower, you may reroll 1 blank instead.'},
  u_nav:{n:'Navigator',slot:'C',pts:3,ex:'w3',t:'When you reveal a maneuver, you may switch to another maneuver with the same bearing (no red while stressed).'},
  t_warden:{n:'Iron Warden',slot:'Ti',pts:0,ex:'w2',ship:'warden',uniq:1,t:'Your upgrade bar gains a torpedo slot.',addSlot:'Tp'},
  t_lucky:{n:'Lucky Streak',slot:'Ti',pts:1,ex:'w2',ship:'hauler',uniq:1,t:'Your action bar gains evade.',addAct:'E'},
  t_kite:{n:'Rusted Kite',slot:'Ti',pts:3,ex:'w3',ship:'kestrel',uniq:1,t:'In the end phase, do not remove your unused focus tokens.'},
  t_writ:{n:'Writ of Passage',slot:'Ti',pts:3,ex:'w3',ship:'herald',uniq:1,t:'When you acquire a target lock, you may lock any enemy ship on the battlefield.'},
  m_stealth:{n:'Stealth Device',slot:'Mo',pts:3,ex:'w2',t:'+1 agility. If an attack hits you, discard this card.'},
  m_shield:{n:'Shield Upgrade',slot:'Mo',pts:4,ex:'w2',t:'+1 shield value.',onAdd:s=>{s.sh++;s.shMax++}},
  m_engine:{n:'Engine Upgrade',slot:'Mo',pts:4,ex:'w2',t:'Your action bar gains boost.',addAct:'BO'},
  m_apl:{n:'Anti-Pursuit Lasers',slot:'Mo',pts:2,ex:'w3',large:1,t:'After an enemy maneuver makes it overlap you, roll 1 attack die: on a hit or crit, that ship suffers 1 damage.'}});
// restrictions: title to its ship, size-limited cards, faction crew; slots added by a title (the gunship title's torpedo slot) count too [#7]
upgradesFor=function(pk,ex){const P=PILOTS[pk],T=SHIPS[P.ship],fac=T.fac;const slots=P.u.slice();
  for(const k in UPGRADES){const U=UPGRADES[k];if(U.addSlot&&(!U.ship||U.ship===P.ship)&&slots.includes(U.slot))slots.push(U.addSlot)}
  return Object.keys(UPGRADES).filter(k=>{const U=UPGRADES[k];return slots.includes(U.slot)&&(!U.ex||(ex&&ex[U.ex]))&&(!U.ship||U.ship===P.ship)&&(U.fac==null||U.fac===fac)&&(!U.small||T.base!=='L')&&(!U.large||T.base==='L')})};
// ---------- rules hooks ----------
const up=(s,id)=>s.ups.some(u=>u.id===id&&!u.gone);
const upT=(s,id)=>up(s,id)&&!(UPGRADES[id].slot==='T'&&crit(s,'wounded'));// talents are ignored by a wounded pilot
const within=(a,b,r)=>baseDist(a,B(a),b,B(b))<=r*RANGE;
function friendsOf(s){return alive().filter(o=>o.side===s.side&&o!==s)}
function exPS(s){return (upT(s,'u_oldinst')?2:0)}
function exExtraBar(s){const out=[];s.ups.forEach(u=>{const U=UPGRADES[u.id];if(U&&U.addAct&&!u.gone)out.push(U.addAct)});return out}
function exAgility(s){return (up(s,'m_stealth')?1:0)-(s.flags.allin?1:0)}
function exPrimary(s){return s.flags.allin?1:0}
// the colour a maneuver is flown as: greening cards, then Engine Stutter (turns are red) [#2b], then Adrenaline Rush (red counts as white) [H: order]
function exColor(s,m){if(!m)return m;let c=m.c;if(up(s,'u_assist')&&m.s<=2&&m.s>0)c='g';if(up(s,'u_nib')&&m.t==='S')c='g';if(crit(s,'engine')&&m.t==='T')c='r';if(s.flags.adren&&c==='r')c='w';return c===m.c?m:Object.assign({},m,{c})}
function exCanActStressed(s){return pilotHas(s,'tycho')}
function isIonized(s){return s.base==='L'?s.ion>=2:s.ion>=1}// large ships need 2 ion tokens [R15]
// ---- stress: every token goes through here so "receive stress" abilities trigger. Captain Orrin (Yorr) may take a friend's token:
// the computer decides at once; a human's choice waits in G.pendS until the next safe point (flushStress), where it is asked.
function yorrFor(s){return friendsOf(s).find(o=>pilotHas(o,'yorr')&&o.stress<=2&&within(o,s,2))}
function giveStress(t,from){t.stress++;if(from){mark('yorr');lg(t.side,`${sname(t)} takes the stress token meant for ${sname(from)}.`)}
  if(pilotHas(t,'soontir')){t.focus++;mark('soontir');lg(t.side,`${sname(t)} turns the pressure into focus.`)}}// [H] Sorin Vael always takes the focus: it has no downside
function addStress(s,n){n=n||1;for(let i=0;i<n;i++){const y=yorrFor(s);if(y&&isHuman(y.side)){G.pendS.push(s.id);continue}if(y&&aiYorr(y,s))giveStress(y,s);else giveStress(s)}fx('stress',{id:s.id})}
function flushStress(k){if(!G.pendS||!G.pendS.length)return k();const s=ship(G.pendS.shift());if(!s||!s.alive)return flushStress(k);const y=yorrFor(s);if(!y){giveStress(s);return flushStress(k)}
  ask(y.side,'yorr',y.name,`${s.name} is about to receive a stress token. ${y.name} (${y.stress} stress) may take it instead.`,[{k:'y',l:`${y.name} takes it`},{k:'n',l:`${s.name} keeps it`}],a=>{if(a==='y')giveStress(y,s);else giveStress(s);flushStress(k)})}
// ---- reveal chain: optional "when you reveal" choices, asked of humans and decided for computers ----
function exReveal(s,m,k){const human=isHuman(s.side);const yn=(key,title,text,yes,no,fn)=>ask(s.side,key,title,text,[{k:'y',l:yes},{k:'n',l:no}],a=>{G.phase='activate';fn(a==='y')});
  // Early Warning Sensors: a free action just before the reveal, then no action step [the computer keeps its action for after the move]
  const ews=nx=>{if(!(up(s,'u_early')&&human&&canAct(s)))return nx();offerFree(s,()=>true,'early','Early Warning Sensors',`${s.name} may take 1 free action before revealing its dial. If it does, it skips its action step this round.`,ok=>{if(ok){s.flags.skipAct=true;mark('early')}G.phase='activate';nx()})};
  const bomb=nx=>{const u=s.ups.find(u=>!u.gone&&UPGRADES[u.id].bomb);if(!u)return nx();const U=UPGRADES[u.id];
    if(human)return yn('bomb',U.n,`Drop a ${U.bomb==='quake'?'quake charge':'plasma bomb'} behind you? It detonates at the end of the Activation phase, hitting every ship at range 1.`,'Drop it','Keep it',y=>{if(y)dropBomb(s,u);nx()});
    if(aiWantsBomb(s))dropBomb(s,u);nx()};
  const boba=nx=>{if(!(pilotHas(s,'boba')&&m.t==='B'))return nx();const other=dialOf(s).find(x=>x.t==='B'&&x.s===m.s&&x.d===-m.d);if(!other)return nx();
    if(human)return ask(s.side,'boba',`${s.name}: switch banks?`,`You revealed ${mText(m)}. Switch to ${mText(other)}?`,[{k:'n',l:'Keep '+mText(m)},{k:'y',l:'Switch to '+mText(other)}],a=>{G.phase='activate';if(a==='y'){m=other;mark('boba')}nx()});
    if(aiBetter(s,other,m)){m=other;mark('boba')}nx()};
  const nav=nx=>{if(!up(s,'u_nav'))return nx();const opts=dialOf(s).filter(x=>x!==m&&x.t===m.t&&x.d===m.d&&!(s.stress&&exColor(s,x).c==='r'));if(!opts.length)return nx();
    if(human)return ask(s.side,'nav','Navigator',`Switch ${mText(m)} to another maneuver with the same bearing?`,[{k:'-',l:'Keep '+mText(m)}].concat(opts.map(x=>{const c=exColor(s,x).c;return {k:dialOf(s).indexOf(x)+'',l:mText(x)+(c==='r'?' (red)':c==='g'?' (green)':''),p:finalPose(s,B(s),x),b:B(s)}})),a=>{G.phase='activate';if(a!=='-'){m=dialOf(s)[+a];mark('nav')}nx()});
    const b=opts.concat([m]).map(x=>({x,v:aiValue(s,x)})).sort((a,b)=>b.v-a.v)[0];if(b.x!==m)mark('nav');m=b.x;nx()};
  // Adrenaline Rush comes before the stressed-red check, so a stressed ship can use it on a red maneuver [#2c]
  const adren=nx=>{if(!(upT(s,'u_adren')&&exColor(s,m).c==='r'))return nx();const use=()=>{useUp(s,'u_adren');s.flags.adren=true;mark('adren')};
    if(human)return yn('adren','Adrenaline',`Discard Adrenaline to fly the red ${mText(m)} as a white maneuver?${s.stress?' (You are stressed: otherwise your opponent picks a non-red maneuver for you.)':''}`,'Yes','No',y=>{if(y)use();nx()});
    if(s.stress||aiValue(s,m)>0)use();nx()};
  ews(()=>bomb(()=>boba(()=>nav(()=>adren(()=>k(m))))))}
function aiValue(s,m){const enemyPoses=enemiesOf(s).map(e=>[e,[{x:e.x,y:e.y,h:e.h}]]);return scorePose(s,finalPose(s,B(s),m),exColor(s,m),enemyPoses,[],{noise:0})}
function aiBetter(s,a,b){return aiValue(s,a)>aiValue(s,b)+.3}
function aiWantsBomb(s){return enemiesOf(s).some(e=>within(e,s,2))}
function useUp(s,id){const u=s.ups.find(u=>u.id===id&&!u.gone);if(u)u.gone=true}
// ---- Intelligence Agent (Spotter): at the start of the Activation phase, look at the dial of an enemy at range 1-2 [#14] ----
function exIntel(s,k){if(!s.alive)return k();const es=enemiesOf(s).filter(e=>within(e,s,2)&&e.dial!=null&&!isIonized(e));if(!es.length)return k();
  const see=e=>{if(!e)return k();mark('intel');s.flags.peek={id:e.id,m:e.dial};lg(s.side,`${sname(s)}'s spotter reads ${sname(e)}'s dial.`);
    if(isHuman(s.side)){const m=exColor(e,dialOf(e)[e.dial]);return ask(s.side,'intel','Spotter',`${e.name} has chosen ${mText(m)} (${m.c==='r'?'red':m.c==='g'?'green':'white'}).`,[{k:'ok',l:'Got it',p:finalPose(e,B(e),m),b:B(e)}],()=>k())}k()};
  if(isHuman(s.side))return askShip(s.side,'intel','Spotter','Choose an enemy ship at range 1-2: you may look at its chosen maneuver.',es.map(e=>e.id),'Look at none',see);
  see(es.sort((a,b)=>psOf(b)-psOf(a))[0])}// the computer reads the most skilled enemy in reach, the one that moves after it
// ---- bombs and mines ----
function dropBomb(s,u){const U=UPGRADES[u.id];mark('bomb:'+u.id);u.gone=true;const b=B(s);const p=sub(s,mul(fwd(s.h),b/2+GEO.straight/2+8));const t={id:'b'+(++G.nb),k:U.bomb,x:p.x,y:p.y,by:s.side};
  G.bombs.push(t);lg(s.side,`${sname(s)} drops a ${U.bomb==='quake'?'quake charge':U.bomb==='plasma'?'plasma bomb':'contact mine'}.`);fx('bomb',{b:t.id})}
const BOMB_R=12;
function bombPoly(t){const out=[];for(let i=0;i<8;i++){const a=i/8*2*Math.PI;out.push(V(t.x+Math.cos(a)*BOMB_R,t.y+Math.sin(a)*BOMB_R))}return out}
function detonateBombs(){for(const t of G.bombs.filter(t=>t.k==='quake'||t.k==='plasma')){lg(t.by,`The ${t.k==='quake'?'quake charge':'plasma bomb'} detonates!`);fx('blast',{x:t.x,y:t.y});
    for(const s of alive()){const d=Math.max(0,polyPointDist(t,corners(s,B(s)))-BOMB_R);if(d<=RANGE){if(t.k==='quake'){lg(s.side,`${sname(s)} is shaken: 1 damage.`);dealDamage(s,1,0,null)}else{lg(s.side,`${sname(s)} is seared: a faceup damage card, straight past the shields.`);dealCardDirect(s,null)}}}}
  G.bombs=G.bombs.filter(t=>t.k==='mine')}
function checkMines(s,tp){for(const t of G.bombs.filter(t=>t.k==='mine')){const P=bombPoly(t);const hit=polyOverlap(corners(s,B(s)),P)||tp.some(p=>polyPointDist(p,P)<=TPL_W/2);
    if(hit&&s.alive){mark('mine');const d=rollN(ATK_FACES,3);lg(s.side,`${sname(s)} triggers a contact mine: ${diceText(d)}.`);fx('blast',{x:t.x,y:t.y});G.bombs=G.bombs.filter(x=>x!==t);dealDamage(s,cnt(d,'hit'),cnt(d,'crit'),null)}}}
// ---- after a maneuver ----
function exAfterMove(s,m,bumpedInto,tp){checkMines(s,tp);
  if(bumpedInto&&bumpedInto.side!==s.side&&up(bumpedInto,'m_apl')&&s.alive){mark('apl');const f=ATK_FACES[rnd(8)];lg(bumpedInto.side,`${sname(bumpedInto)}'s anti-pursuit lasers fire: ${f}.`);if(f==='hit'||f==='crit')dealDamage(s,1,0,bumpedInto)}}
// Lark Castellan (Lando): after a green maneuver another friendly ship at range 1 may take 1 free action from its own action bar [#12]
function exLando(s,green,k){if(!green||!pilotHas(s,'lando'))return k();const bar=o=>a=>BAR.includes(a.a)&&onBar(o,a.a);const fr=friendsOf(s).filter(o=>within(o,s,1)&&freeActs(o,bar(o)).length);if(!fr.length)return k();
  const go=o=>{if(!o)return k();mark('lando');lg(s.side,`${sname(s)} calls ${sname(o)} to action.`);offerFree(o,bar(o),'lando',`${o.name}: free action`,`${s.name} lets ${o.name} take 1 free action from its action bar.`,()=>k())};
  if(isHuman(s.side))return askShip(s.side,'lando',s.name,'Choose another friendly ship at range 1: it may take 1 free action from its action bar.',fr.map(o=>o.id),'Nobody',go);
  go(aiPickFriend(fr))}
// ---- actions ----
function exActions(s,out){const done=a=>(s.doneR||[]).includes(a);
  if(up(s,'u_patch')&&s.dmg.some(x=>!x.up))out.push({a:'PA',l:'Mech "Patch": repair',d:UPGRADES.u_patch.t});
  if(upT(s,'u_lead')){const t=friendsOf(s).filter(o=>within(o,s,2)&&psOf(o)<psOf(s)&&freeActs(o,a=>a.a!=='SL').length);if(t.length)out.push({a:'SL',l:'Wing Leader',d:UPGRADES.u_lead.t,targets:t.map(o=>o.id)})}
  if(upT(s,'u_snap')&&!done('BR')){const o=rollOptions(s);if(o.length)out.push({a:'EH',l:'Snap Roll',d:UPGRADES.u_snap.t,opts:o})}// its free barrel roll counts as this round's barrel roll [#10]
  if(upT(s,'u_hairpin')){const o=[-1,1].map(d=>({m:{s:1,t:'T',d,c:'w'}})).filter(o=>!offBoard(finalPose(s,B(s),o.m),B(s)));if(o.length)out.push({a:'DD',l:'Hairpin',d:UPGRADES.u_hairpin.t,opts:o})}
  if(upT(s,'u_allin')&&!s.flags.allin)out.push({a:'EX',l:'All-In',d:UPGRADES.u_allin.t});
  if(up(s,'u_mines'))out.push({a:'PM',l:'Drop a contact mine',d:UPGRADES.u_mines.t});
  if(up(s,'u_sab')){const t=enemiesOf(s).filter(o=>within(o,s,1)&&o.dmg.some(x=>!x.up));if(t.length)out.push({a:'SB',l:'Sabotage',d:UPGRADES.u_sab.t,targets:t.map(o=>o.id)})}}
function exDoAction(s,act,arg,rec,k){
  if(act==='PA'){rec();const f=DEF_FACES[rnd(8)];const i=s.dmg.findIndex(x=>!x.up);const ok=(f==='evade'||f==='focus')&&i>=0;if(ok)G.disc.push(s.dmg.splice(i,1)[0].c);lg(s.side,`${sname(s)}'s mech patches the hull (${f}): ${ok?'1 damage repaired':'no luck'}.`);k();return true}
  // Wing Leader (Squad Leader): the chosen ship may take any 1 free action [#12]
  if(act==='SL'){const t=ship(arg);if(!t)return false;rec();mark('lead');lg(s.side,`${sname(s)} orders ${sname(t)} to act.`);offerFree(t,a=>a.a!=='SL','lead',`${t.name}: free action`,`${s.name} (Wing Leader) lets ${t.name} take 1 free action.`,()=>k());return true}
  // Snap Roll (Expert Handling): a free barrel roll (large bases too), stress without the icon, then the owner may remove 1 enemy lock
  if(act==='EH'){const o=rollOptions(s)[arg];if(!o)return false;rec();s.doneR.push('BR');mark('eh');const from={x:s.x,y:s.y,h:s.h};Object.assign(s,{x:o.p.x,y:o.p.y});if(!onBar(s,'BR'))addStress(s);
    lg(s.side,`${sname(s)} snap-rolls.`);fx('move',{id:s.id,path:[from,{x:s.x,y:s.y,h:s.h}],dur:ANIM?420:0,roll:true});
    const ls=enemiesOf(s).filter(e=>e.tl===s.id||e.tl2===s.id);const drop=e=>{if(e){if(e.tl===s.id)e.tl=null;else e.tl2=null;lg(s.side,`${sname(s)} shakes ${sname(e)}'s lock.`)}k()};
    if(!ls.length){k();return true}
    if(isHuman(s.side)){ask(s.side,'ehlock','Snap Roll','You may remove 1 enemy target lock from your ship.',ls.map(e=>({k:e.id,l:`Remove ${e.name}'s lock`})).concat([{k:'-',l:'Keep them all'}]),a=>drop(a==='-'?null:ship(a)));return true}
    drop(ls.sort((a,b)=>psOf(b)-psOf(a))[0]);return true}
  // Hairpin (Daredevil): a white turn 1, a stress token, and 2 attack dice against itself without the boost icon (Engine Upgrade counts) [#20]
  if(act==='DD'){const o=[-1,1].map(d=>({s:1,t:'T',d,c:'w'}))[arg];if(!o)return false;rec();mark('hairpin');lg(s.side,`${sname(s)} pulls a hairpin turn.`);
    executeMove(s,o,()=>{if(s.alive){addStress(s);if(!onBar(s,'BO')&&s.alive){const d=rollN(ATK_FACES,2);lg(s.side,`${sname(s)} strains its frame: ${diceText(d)}.`);dealDamage(s,cnt(d,'hit'),cnt(d,'crit'),null)}}k()});return true}
  if(act==='EX'){rec();s.flags.allin=true;lg(s.side,`${sname(s)} goes all-in: +1 attack, -1 agility this round.`);k();return true}
  if(act==='PM'){rec();dropBomb(s,s.ups.find(u=>u.id==='u_mines'&&!u.gone));G.bombs[G.bombs.length-1].k='mine';k();return true}
  if(act==='SB'){const t=ship(arg);if(!t)return false;rec();mark('sab');const f=ATK_FACES[rnd(8)];lg(s.side,`${sname(s)} sabotages ${sname(t)} (${f}).`);if(f==='hit'||f==='crit'){const down=t.dmg.filter(x=>!x.up);const x=down[rnd(down.length)];if(x){x.up=true;x.r=G.round;lg(t.side,`${sname(t)}: ${DAMAGE[x.c].n} flips faceup.`);critNow(t,x);if(t.alive&&hullDmg(t)>=t.hull)destroy(t,`${sname(t)} is destroyed!`)}}k();return true}
  return false}
function aiWantsRedline(s){return enemiesOf(s).some(e=>within(e,s,3))}
// ---- start of combat: Quill Marren (Roark), Pack Tactics (Swarm Tactics), Kellan Stroud (Kyle), Colonel Varek (Jendon) [#29] ----
function exStartCombat(k){for(const s of alive())s.flags.psT=null;
  seqEach(psOrder(false),(s,nx)=>{if(!s.alive)return nx();const H=isHuman(s.side);
    const roark=n2=>{if(!pilotHas(s,'roark'))return n2();const fr=friendsOf(s).filter(o=>within(o,s,3));if(!fr.length)return n2();
      const set=f=>{if(f){f.flags.psT=12;mark('roark');lg(s.side,`${sname(s)} vectors ${sname(f)}: pilot skill 12 this phase.`)}n2()};
      if(H)return askShip(s.side,'roark',s.name,'Choose another friendly ship at range 1-3: its pilot skill counts as 12 until the end of the Combat phase.',fr.map(o=>o.id),null,set);set(aiPickPS(fr))};
    const pack=n2=>{if(!upT(s,'u_pack'))return n2();const fr=friendsOf(s).filter(o=>within(o,s,1));if(!fr.length)return n2();
      const set=f=>{if(f){f.flags.psT=psOf(s);mark('pack');lg(s.side,`${sname(s)} lends ${sname(f)} its pilot skill.`)}n2()};
      if(H)return askShip(s.side,'pack','Pack Tactics',`You may choose 1 friendly ship at range 1: until the end of this phase its pilot skill counts as ${psOf(s)}.`,fr.map(o=>o.id),'Nobody',set);set(aiPickPS(fr.filter(o=>psOf(o)<psOf(s))))};
    const kyle=n2=>{if(!(pilotHas(s,'kyle')&&s.focus>0))return n2();const fr=friendsOf(s).filter(o=>within(o,s,3));if(!fr.length)return n2();
      const give=f=>{if(f){s.focus--;f.focus++;mark('kyle');lg(s.side,`${sname(s)} passes a focus to ${sname(f)}.`)}n2()};
      if(H)return askShip(s.side,'kyle',s.name,'You may give 1 of your focus tokens to another friendly ship at range 1-3.',fr.map(o=>o.id),'Keep it',give);give(fr.find(o=>!o.focus)||null)};
    const jendon=n2=>{if(!(pilotHas(s,'jendon')&&(s.tl||s.tl2)))return n2();const fr=friendsOf(s).filter(o=>within(o,s,1)&&!o.tl&&!o.tl2);if(!fr.length)return n2();
      const give=(f,which)=>{if(f){const t=s[which];f.tl=t;s[which]=null;if(which==='tl'&&s.tl2){s.tl=s.tl2;s.tl2=null}mark('jendon');lg(s.side,`${sname(s)} hands its lock on ${sname(ship(t))} to ${sname(f)}.`)}n2()};
      if(H){const opts=[];for(const f of fr)for(const w of ['tl','tl2'])if(s[w])opts.push({k:f.id+'|'+w,l:`${f.name} gets the lock on ${ship(s[w]).name}`});opts.push({k:'-',l:'Keep my locks'});
        return ask(s.side,'jendon',s.name,'You may assign 1 of your target locks to a friendly ship at range 1 that has none.',opts,a=>{if(a==='-')return give(null);const [f,w]=a.split('|');give(ship(f),w)})}
      give(fr[0],'tl')};
    roark(()=>pack(()=>kyle(()=>jendon(nx))))},()=>k())}
// ---- weapons and dice ----
// "Snapshot Eye" (Deadeye): an Attack (target lock) weapon may use focus instead; "Hex" (Dark Curse) stops attackers spending focus, so neither a
// focus-cost weapon nor paying a lock cost with focus works against him [#18]
function eyeOK(s,o,w){return s.base!=='L'&&upT(s,'u_snapeye')&&s.focus>0&&!(w.spend==='TL'&&pilotHas(o,'curse'))}
function exWeaponNeedOK(s,w,o){if(w.need==='TL')return s.tl===o.id||s.tl2===o.id||eyeOK(s,o,w);if(w.need==='F')return s.focus>0&&!(w.spend==='F'&&pilotHas(o,'curse'));return !w.need}
function exRange(s,w){if(w.k!=='P'&&pilotHas(s,'rhymer'))return [Math.max(1,w.rmin-1),Math.min(3,w.rmax+1)];return [w.rmin,w.rmax]}
function exTouchOK(s,o){return pilotHas(s,'arvel')}
// "Shiv" (Backstabber): outside the defender's printed firing arc; a turret ship's firing arc is its front arc [#16]
function outsideArc(s,d){return !arcReach(d,B(d),s,B(s),d.arc==='T'?'F':d.arc)}
function exAtkBonus(s,d,w,t){return pilotHas(s,'backstab')&&outsideArc(s,d)?1:0}
// before the attack dice are rolled: Captive Informant's stress, paying the weapon's cost, Juno Arlen's (Jan Ors) extra die
function exPreRoll(s,d,w,t,again,k){const P={extra:0,lockSpent:false};
  if(pilotHas(s,'backstab')&&outsideArc(s,d))mark('backstab');if(pilotHas(s,'wedge'))mark('wedge');if(pilotHas(s,'mauler')&&t.rg===1)mark('mauler');if(pilotHas(d,'curse'))mark('curse');
  if(pilotHas(s,'arvel')&&G.touch.some(p=>p.includes(s.id)&&p.includes(d.id)))mark('arvel');if(w.k!=='P'&&pilotHas(s,'rhymer')){const U=UPGRADES[s.ups[w.ui].id].wpn;if(t.rg<U.r[0]||t.rg>U.r[1])mark('rhymer')}
  if(!again&&up(d,'u_captive')&&!d.flags.captive){d.flags.captive=true;mark('captive');addStress(s);lg(d.side,`${sname(d)}'s informant rattles ${sname(s)}: 1 stress.`)}
  const pay=nx=>{if(again)return nx();
    if(w.spend==='TL'){const lock=s.tl===d.id||s.tl2===d.id,eye=eyeOK(s,d,w);const byLock=()=>{if(s.tl===d.id)s.tl=null;else s.tl2=null;P.lockSpent=true;nx()};
      const byFocus=()=>{mark('snapeye');lg(s.side,`${sname(s)} spends focus in place of a lock.`);spendFocus(s,nx)};
      if(lock&&eye&&isHuman(s.side))return ask(s.side,'pay',w.n,`Pay for ${w.n} with your target lock, or spend a focus token instead (Snapshot Eye)?`,[{k:'l',l:'Spend the target lock'},{k:'f',l:'Spend a focus token'}],a=>a==='l'?byLock():byFocus());
      return lock?byLock():eye?byFocus():nx()}
    if(w.spend==='F'&&s.focus>0)return spendFocus(s,nx);nx()};
  const jan=nx=>{const j=friendsOf(s).find(o=>pilotHas(o,'jan')&&!o.stress&&within(o,s,3));if(!j)return nx();
    const yes=()=>{addStress(j);P.extra++;mark('jan');lg(j.side,`${sname(j)} feeds ${sname(s)} targeting data: +1 attack die.`);nx()};
    if(isHuman(j.side))return ask(j.side,'jan',j.name,`${s.name} is attacking ${d.name}. Take 1 stress token to give it 1 extra attack die?`,[{k:'y',l:'Yes: +1 attack die'},{k:'n',l:'No'}],a=>a==='y'?yes():nx());
    aiJan(j,s,d)?yes():nx()};
  pay(()=>jan(()=>flushStress(()=>k(P))))}
// focus spent anywhere (attack, defence, weapon costs) goes through here: Garrick Dray (Garven) may pass it on [#26]
function spendFocus(s,k){s.focus--;if(!pilotHas(s,'garven'))return k();const fr=friendsOf(s).filter(o=>within(o,s,2));if(!fr.length)return k();
  const give=f=>{if(f){f.focus++;mark('garven');lg(s.side,`${sname(s)} passes the spent focus to ${sname(f)}.`)}k()};
  if(isHuman(s.side))return askShip(s.side,'garven',s.name,'You may place the focus token you just spent on another friendly ship at range 1-2.',fr.map(o=>o.id),'Discard it',give);give(aiPickFocus(fr))}
// defender modifies the attack dice first (1e order) [R11]
function exDAMods(){const A=G.atk,d=ship(A.d),out=[];if(upT(d,'u_slip')&&!d.stress&&!A.used.includes('slip')&&A.dice.some((f,i)=>!A.rr[i]))out.push({k:'slip',l:'Slippery: force a reroll',d:'Take 1 stress token and choose 1 attack die: the attacker must reroll it.'});
  if(up(d,'u_jam')&&!A.used.includes('jam')&&cnt(A.dice,'hit'))out.push({k:'jam',l:'Jamming Array',d:'Change 1 of the attacker\'s hits into a focus. The attacker cannot reroll that die.'});return out}
function exApplyDAMod(k,sel,back){const A=G.atk,d=ship(A.d);
  if(k==='slip'){const pool=A.dice.map((f,i)=>i).filter(i=>!A.rr[i]);
    if(!sel){if(isHuman(d.side))return pickDice(d.side,'atk','Slippery: the attacker must reroll this die',pool,1,x=>{if(x)return exApplyDAMod(k,x,back);G.phase='damod';refresh()});sel=aiSlipDie(pool)}
    mark('damod:slip');A.used.push('slip');addStress(d);const i=sel[0];A.dice[i]=ATK_FACES[rnd(8)];A.rr[i]=true;lg(d.side,`${sname(d)} slips away: the attacker rerolls one die (${diceText(A.dice)}).`);return back()}
  if(k==='jam'){mark('damod:jam');A.used.push('jam');const i=A.dice.indexOf('hit');A.dice[i]='focus';A.jammed=i;A.rr[i]=true;lg(d.side,`${sname(d)} jams one hit: ${diceText(A.dice)}.`);return back()}
  back()}
// attacker options added by pilots and upgrades; the reroll ones pick their dice in applyAtkMod (REROLL_MAX)
function exAMods(out){const A=G.atk,s=ship(A.a),d=ship(A.d);const hex=pilotHas(d,'curse');const U=A.w!=='P'?UPGRADES[s.ups[A.ups].id].wpn:{};const blanks=cnt(A.dice,'blank');const any=rerollPool('howl').length;
  if(!hex&&pilotHas(s,'horton')&&A.rg>=2&&rerollPool('horton').length&&!A.used.includes('horton'))out.push({k:'horton',l:`${s.name}: reroll blanks`,d:'Reroll any of your blank results.'});
  if(!hex&&pilotHas(s,'han')&&!A.used.includes('han')&&any)out.push({k:'han',l:`${s.name}: reroll everything`,d:'Reroll all of your attack dice (as many as possible).'});
  const how=friendsOf(s).find(o=>pilotHas(o,'howl')&&within(o,s,1));if(!hex&&how&&A.w==='P'&&!A.used.includes('howl')&&any)out.push({k:'howl',l:`${how.name}: reroll 1 die`,d:'Reroll 1 attack die.'});
  const jon=friendsOf(s).find(o=>pilotHas(o,'jonus')&&within(o,s,1));if(!hex&&jon&&A.w!=='P'&&!A.used.includes('jonus')&&any)out.push({k:'jonus',l:`${jon.name}: reroll up to 2`,d:'Reroll up to 2 attack dice.'});
  if(!hex&&pilotHas(s,'krassis')&&A.w!=='P'&&!A.used.includes('krassis')&&any)out.push({k:'krassis',l:`${s.name}: reroll 1 die`,d:'Reroll 1 attack die.'});
  if(!hex&&pilotHas(s,'ibtisam')&&s.stress&&!A.used.includes('ibt')&&any)out.push({k:'ibt',l:`${s.name}: reroll 1 die`,d:'While stressed, reroll 1 of your dice.'});
  if(pilotHas(s,'gundark')&&A.rg===1&&cnt(A.dice,'hit')&&!A.used.includes('gundark'))out.push({k:'gundark',l:`${s.name}: hit → crit`,d:'Change 1 hit to a crit.'});
  if(up(s,'u_hired')&&A.rg===3&&cnt(A.dice,'hit')&&!A.used.includes('hired'))out.push({k:'hired',l:'Hired Copilot: hit → crit',d:'Change 1 hit to a crit.'});
  if(U.b2h&&blanks&&!A.used.includes('b2h'))out.push({k:'b2h',l:'Shock Missiles: blank → hit',d:'Change 1 blank to a hit.'});
  if(U.b2f&&blanks&&!A.used.includes('b2f'))out.push({k:'b2f',l:'Heavy torpedo: blanks → focus',d:'Change up to 3 blanks to focus.'});
  if(s.flags.gunnerFocus&&A.gun&&A.w==='P'&&cnt(A.dice,'focus')&&!A.used.includes('rook'))out.push({k:'rook',l:'Sable Rook: focus → hit',d:'Change 1 focus to a hit.'})}
function exApplyAMod(k){const A=G.atk,s=ship(A.a);A.used.push(k);
  if(k==='gundark'||k==='hired'){const i=A.dice.indexOf('hit');A.dice[i]='crit'}
  else if(k==='b2h'){const i=A.dice.indexOf('blank');A.dice[i]='hit'}
  else if(k==='b2f'){let n=3;A.dice=A.dice.map(f=>f==='blank'&&n>0?(n--,'focus'):f)}
  else if(k==='rook'){const i=A.dice.indexOf('focus');A.dice[i]='hit';s.flags.gunnerFocus=false}
  else return false;lg(s.side,`${sname(s)} modifies the attack: ${diceText(A.dice)}.`);return true}
function defPool(k){const A=G.atk,s=ship(A.a);const n=A.defN!=null?A.defN:A.def.length;const idx=A.def.map((f,i)=>i).filter(i=>i<n&&!A.rrd[i]);
  if(k==='instr')return idx.filter(i=>A.def[i]==='focus'||(psOf(s)<=2&&A.def[i]==='blank'));return idx}
function exDMods(out){const A=G.atk,d=ship(A.d);
  if(up(d,'u_instr')&&!A.used.includes('instr')&&defPool('instr').length)out.push({k:'instr',l:'Flight Instructor: reroll 1',d:'Reroll 1 focus result (or 1 blank, against pilot skill 2 or lower).'});
  if(pilotHas(d,'ibtisam')&&d.stress&&!A.used.includes('ibtd')&&defPool('ibtd').length)out.push({k:'ibtd',l:`${d.name}: reroll 1 die`,d:'While stressed, reroll 1 of your dice.'})}
function exApplyDMod(k,sel,back){const A=G.atk,d=ship(A.d);if(k!=='instr'&&k!=='ibtd')return back();const pool=defPool(k);
  if(!sel){if(isHuman(d.side))return pickDice(d.side,'def',k==='instr'?'Flight Instructor: reroll 1 die':`${d.name}: reroll 1 die`,pool,1,x=>{if(x)return exApplyDMod(k,x,back);G.phase='dmod';refresh()});sel=aiRerollDef(d,pool)}
  mark('dmod:'+k);A.used.push(k);for(const i of sel){A.def[i]=DEF_FACES[rnd(8)];A.rrd[i]=true}lg(d.side,`${sname(d)} rerolls a defense die: ${diceText(A.def)}.`);back()}
// how many hits get through, with uncancellable results [R11]
function exPreview(A){const s=ship(A.a),U=A.w!=='P'?UPGRADES[s.ups[A.ups].id].wpn:{};let hits=cnt(A.dice,'hit'),crits=cnt(A.dice,'crit'),ev=cnt(A.def||[],'evade');
  if(U.hard){const c=Math.min(ev,crits);crits-=c;ev-=c;A.critCancelled=c>0;return {hits,crits}}// Rapid Blaster: hits can't be cancelled, crits can (so Kira Scald still triggers) [#21]
  let lockC=pilotHas(s,'tennumb')&&crits?1:0;crits-=lockC;const c1=Math.min(ev,hits);hits-=c1;ev-=c1;const cancelled=Math.min(ev,crits);crits-=cancelled;A.critCancelled=cancelled>0;return {hits,crits:crits+lockC}}
// ---- after an attack: automatic effects, the second Swarm Missiles attack, then the optional ones (Tracking Computer, Inquisitor Vell,
// Tarn Vessor's free move) and finally a gunner's bonus attack [H: order among "after attacking" effects]
function exAfterAttack(s,d,A){const U=A.w!=='P'?UPGRADES[s.ups[A.ups].id].wpn:{};const hit=!!A.hit;
  if(pilotHas(s,'kath')&&A.critCancelled&&d.alive){mark('kath');addStress(d);lg(s.side,`${sname(s)} rattles ${sname(d)}: 1 stress.`)}
  if(U.splash&&hit){mark('splash');for(const o of alive().filter(o=>o!==d&&within(o,d,1))){lg(o.side,`${sname(o)} is caught in the missile burst: 1 damage.`);dealDamage(o,1,0,s)}}
  if(hit&&up(d,'m_stealth')){mark('stealth');useUp(d,'m_stealth');lg(d.side,`${sname(d)}'s stealth device burns out.`)}
  const relock=nx=>{if(!(A.lockSpent&&up(s,'u_relock')&&d.alive&&s.alive))return nx();const f=DEF_FACES[rnd(8)];lg(s.side,`${sname(s)}'s mech "Relock" rolls ${f}.`);if(f!=='evade')return nx();mark('relock');lg(s.side,`${sname(s)} locks ${sname(d)} again.`);acquireLock(s,d,nx)};
  const twice=nx=>{if(!(U.twice&&!A.second&&d.alive&&s.alive))return nx();mark('twice');G.atk=null;G.again=true;s.fired=false;G.phase='target';G.cur=s.id;
    const w=weaponsFor(s).find(x=>x.k===A.w);if(w&&w.targets.some(t=>t.id===d.id)){lg(s.side,`${sname(s)} fires again!`);declare(s,A.w,d.id);return}G.again=false;s.fired=true;nx()};
  const track=nx=>{if(!(up(s,'u_track')&&d.alive&&s.alive&&within(s,d,3)&&s.tl!==d.id))return nx();// Tracking Computer (Fire-Control System): may lock the defender, replacing a lock [#17]
    const lock=()=>{mark('track');lg(s.side,`${sname(s)}'s tracking computer locks ${sname(d)}.`);acquireLock(s,d,nx)};
    if(isHuman(s.side))return ask(s.side,'track','Tracking Computer',`Acquire a target lock on ${d.name}?${s.tl&&ship(s.tl)?` It replaces your lock on ${ship(s.tl).name}.`:''}`,[{k:'y',l:'Lock on'},{k:'n',l:'No'}],a=>a==='y'?lock():nx());
    const cur=s.tl&&ship(s.tl);if(!cur||!cur.alive||!within(s,cur,3)||remaining(d)<remaining(cur))return lock();nx()};
  const vell=nx=>{if(!(up(s,'u_vell')&&d.alive&&s.alive))return nx();const doIt=()=>{mark('vell');lg(s.side,`${sname(s)}'s crew trades 2 damage for a critical on ${sname(d)}.`);dealDamage(s,2,0,null,()=>{if(d.alive)dealDamage(d,0,1,s,nx);else nx()})};
    if(isHuman(s.side))return ask(s.side,'vell','Inquisitor Vell',`Suffer 2 damage to make ${d.name} suffer 1 critical damage?`,[{k:'y',l:'Do it'},{k:'n',l:'No'}],a=>a==='y'?doIt():nx());
    if(remaining(s)>4&&remaining(d)<=3)return doIt();nx()};
  // Tarn Vessor (Turr Phennir): a free boost or barrel roll, with the usual limits: no stress, no Sensor Blackout, not twice a round [#11]
  const turr=nx=>{if(!(pilotHas(s,'turr')&&s.alive))return nx();offerFree(s,a=>a.a==='BR'||a.a==='BO','turr',`${s.name}: free move`,`After attacking, ${s.name} may take a free boost or barrel roll.`,ok=>{if(ok)mark('turr');nx()})};
  // Tail Gunner / Sable Rook (Gunner / Luke crew): after an attack that misses, an optional primary attack against any legal target [#4]
  const gunner=nx=>{if(!(!hit&&!s.flags.gunned&&(up(s,'u_tailgun')||up(s,'u_rook'))&&s.alive))return nx();G.bonus={id:s.id};
    if(!weaponsFor(s).some(w=>w.k==='P')){G.bonus=null;return nx()}s.flags.gunned=true;s.flags.gunnerFocus=up(s,'u_rook');mark('gunner');s.fired=false;G.atk=null;G.phase='target';G.cur=s.id;lg(s.side,`${sname(s)}'s gunner may take a bonus primary attack.`);refresh()};
  relock(()=>twice(()=>track(()=>vell(()=>turr(()=>gunner(()=>flushStress(()=>afterAttackDone(s))))))))}
// ---- damage cards ----
function exKeepFocus(s){return up(s,'t_kite')}
// Mech "Scrapper" (R5 Astromech): in the end phase the owner may flip 1 faceup Ship-trait card facedown [#29]
function exEndPhase(k){seqEach(alive().filter(s=>up(s,'u_scrap')&&s.dmg.some(x=>x.up&&DAMAGE[x.c].tr==='Ship')),(s,nx)=>{const cs=s.dmg.filter(x=>x.up&&DAMAGE[x.c].tr==='Ship');
    const flip=x=>{if(x){mark('scrap');x.up=false;lg(s.side,`${sname(s)}'s mech flips ${DAMAGE[x.c].n} facedown.`)}nx()};
    if(isHuman(s.side))return ask(s.side,'scrap','Mech "Scrapper"','You may flip 1 of your faceup Ship damage cards facedown.',cs.map((x,i)=>({k:''+i,l:`${DAMAGE[x.c].n}: ${DAMAGE[x.c].t}`})).concat([{k:'-',l:'Leave them'}]),a=>flip(a==='-'?null:cs[+a]));
    flip(cs.sort((a,b)=>critRank(b.c)-critRank(a.c))[0])},k)}
function exDelayDeath(s){return pilotHas(s,'felswrath')&&G.phase!=='end'}
function exLockTargets(s,list){const kagi=list.filter(o=>pilotHas(ship(o),'kagi'));if(kagi.length)return kagi;if(up(s,'t_writ'))return enemiesOf(s).map(o=>o.id);return list}
// after acquiring a lock: Fire-Control Tech's second lock on a different ship, then Brannoc Dale's (Dutch) shared lock [#13]
function exAfterLock(s,t,k){
  const we=nx=>{if(!up(s,'u_fct'))return nx();const c=lockTargets(s).filter(id=>id!==t.id&&id!==s.tl2);if(!c.length)return nx();
    const set=o=>{if(o){s.tl2=o.id;mark('we2');lg(s.side,`${sname(s)}'s fire-control tech also locks ${sname(o)}.`);fx('lock',{id:s.id,to:o.id})}nx()};
    if(isHuman(s.side))return askShip(s.side,'we2','Fire-Control Tech','You may also lock onto a second, different enemy ship.',c,s.tl2&&ship(s.tl2)?`Keep the lock on ${ship(s.tl2).name}`:'No second lock',set);
    if(s.tl2&&ship(s.tl2)&&ship(s.tl2).alive)return nx();set(c.map(ship).sort((a,b)=>remaining(a)-remaining(b))[0])};
  const dutch=nx=>{if(!pilotHas(s,'dutch'))return nx();const fr=friendsOf(s).filter(o=>within(o,s,2)&&lockTargets(o).length);if(!fr.length)return nx();
    const pickT=f=>{if(!f)return nx();const ts=lockTargets(f);const go=o=>{if(!o)return nx();mark('dutch');lg(s.side,`${sname(f)} acquires a lock on ${sname(o)} with ${sname(s)}'s help.`);acquireLock(f,o,nx)};
      if(isHuman(f.side))return askShip(f.side,'dutch2',f.name,`${f.name} may acquire a target lock on an enemy at range 1-3 of it.`,ts,'No lock',go);go(aiLockPick(f,ts))};
    if(isHuman(s.side))return askShip(s.side,'dutch',s.name,'Choose another friendly ship at range 1-2: it may acquire a target lock at once.',fr.map(o=>o.id),'Nobody',pickT);
    pickT(fr.sort((a,b)=>(a.tl&&ship(a.tl)&&ship(a.tl).alive?1:0)-(b.tl&&ship(b.tl)&&ship(b.tl).alive?1:0))[0])};
  we(()=>dutch(()=>k()))}
RULES_HTML+=`<h3>Expansions (waves 1-3)</h3><p><b>Turrets</b> fire in any direction; the <b>Warden gunship</b> also fires backwards. <b>Ion</b> hits deal 1 damage and an ion token: an ionised ship drifts a white straight 1 next round (large ships need 2 tokens). <b>Bombs</b> drop behind a ship and blow up at the end of movement, hitting everything at range 1; <b>mines</b> go off when a ship touches them. Some upgrades let the <b>defender tamper with the attack dice</b> before the attacker modifies them. The <b>Herald shuttle</b> can come to a full stop. Build your own squadron with <b>Custom squads</b> on the start screen (100 points; unique names once).</p>`;
