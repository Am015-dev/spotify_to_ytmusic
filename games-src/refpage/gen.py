# builds reference.html: every card, tile, die face and token in each game, from the games' own data tables
import json,html
k=json.load(open('ref_kot.json'));x=json.load(open('ref_xw.json'));d=json.load(open('ref_dk.json'))
E=[]  # entries: game, section, name, tags[], text, sub(optional lines)
def add(g,sec,n,tags,t,sub=None,count=None):E.append({'g':g,'s':sec,'n':n,'tags':[t for t in tags if t],'t':t,'sub':sub or [],'c':count})
TY={'K':'Keep','D':'Discard','C':'Consumable','U':'Costume','W':'Wicked tile'}
# ---- Crown City Smash ----
from collections import Counter as _C
_bd=_C(key.split('#')[0] for key in k['BASEDECK'])
for key,n in _bd.items():
  c=k['CARDS'][key];add('crown','Power cards (base game)',c['n'],[f"{c['c']} energy",TY[c['t']],f"\u00d7{n}" if n>1 else None],c['x'])
for key in k['MBDECK']:
  c=k['CARDS'][key];add('crown','Mindbug cards',c['n'],[f"{c['c']} energy",TY[c['t']],c.get('kw')],c['x'])
for kw,t in k['KWHELP'].items():add('crown','Mindbug keywords',kw.upper(),['keyword'],t)
WH={'perm':'stays in play','now':'play at once','roll':'play when you roll','start':'start of your turn','react':'reaction','city':'in the city','kw':'keyword'}
for mi,grp in enumerate(k['MEVO']):
  mon=k['MONS'][mi]['n']
  for eid,e in sorted(k['EVO'].items(),key=lambda a:int(a[0])):
    g=int(eid)//10
    if g==grp:add('crown','Power Up! evolutions',e['n'],[mon,'permanent' if e['t']=='P' else 'temporary'],e['x'])
for key,c in k['COSTUMES'].items():add('crown','Halloween costumes',c['n'],[f"{c['c']} energy",'costume'],c['x'])
for key,c in sorted(k['WTILES'].items(),key=lambda a:a[1]['lv']):add('crown','Wickedness tiles',c['n'],[f"at wickedness {c['lv']}"],c['x'])
for key,c in k['CURSES'].items():add('crown','Anubis curses',c['n'],['curse'],c['x'],[('Ankh',c['a']),('Snake',c['s'])])
T=[('Hearts','track','Your life. You start with 10 and can’t go above 10 unless a card says so. At 0 you are knocked out.'),
 ('Stars','track','Victory points. Reach 20 stars to win (a Space Helmet wins at 17).'),
 ('Energy cubes','token','Currency for power cards and costumes. Every energy die you resolve gives 1.'),
 ('Tokyo City and Tokyo Bay','board','The city: +1 star when you enter, +2 stars if you start your turn there, but no healing with hearts there. With 5 or more monsters, Tokyo Bay opens as a second spot; it closes at 4 or fewer.'),
 ('Dice: 1, 2, 3','die face','Three of a kind scores that many stars, and each extra die of that number scores 1 more.'),
 ('Dice: heart','die face','Heal 1 heart (not in the city).'),('Dice: energy','die face','Gain 1 energy.'),('Dice: claw','die face','Smash: every monster in the other place (city or outside) loses 1 heart.'),
 ('Mindbug token','token','Every monster starts with 1. When another monster is about to resolve its dice, spend one to take over its roll: you resolve the dice, enter and buy; then that monster rolls again and plays its turn.'),
 ('Poison token','token','From Toxic Spittle. Lose 1 heart per token at the end of your turn. A resolved heart can remove one instead of healing.'),
 ('Shrink token','token','From Shrink Beam. Roll 1 die fewer per token. A resolved heart can remove one instead of healing.'),
 ('Smoke puffs','token','Smoke Screen comes with 3. Spend one for an extra reroll; the card goes when they are gone.'),
 ('Cultist','token (Cultists)','Resolve four of the same face to gain one (one per face). Spend it on your turn for a heart, an energy or an extra reroll.'),
 ('Tokyo Tower levels','token (Tower)','If you are already in the city, resolve four 1s to climb a level. Levels 1 and 2 give hearts and energy each turn; the top level wins at once.'),
 ('Berserk die','die (Berserk)','Rolled with your dice while you are berserk (after resolving four claws). Faces: double claw, double energy, ouch (you lose a heart), claw, claw, energy. Healing with hearts calms you down.'),
 ('Die of Fate','die (Anubis)','Rolled with your dice while curses are in play. Eye of fate: a new curse replaces the current one. Water: nothing happens. Snake: the curse’s Snake effect hits you. Ankh: you get the curse’s Ankh effect.'),
 ('Golden Scarab','token (Anubis)','Starts with the last player. Some curses spare or reward its holder; some effects make you take it.'),
 ('Wickedness gauge','track (Wickedness)','Each set of three 1s gives 2 wickedness, each set of three 2s gives 1, up to 10. At 3, 6 and 10 you take a wicked tile.'),
 ('Evolution hand','cards (Power Up!)','Start with 1 of 2 evolutions; each time you resolve three hearts, look at 2 and keep 1. Keep them secret and play them when their text allows.')]
for n,tag,t in T:add('crown','Tokens, dice and tracks',n,[tag],t)
# ---- Nebula Aces ----
WAVE={None:'core set','w1':'wave 1','w2':'wave 2','w3':'wave 3'}
FAC=[f['n'] for f in x['FACTIONS']]
ACT={'F':'focus','TL':'target lock','BR':'barrel roll','E':'evade','BO':'boost'}
for key,s in x['SHIPS'].items():
  tags=[FAC[s['fac']],WAVE[s.get('ex')],'large base' if s.get('base')=='L' else 'small base']
  arc={'T':'360° turret primary','A':'front and rear arcs'}.get(s.get('arc'),'front arc')
  sp=[m for m in s['dial']];spd=sorted(set(m['s'] for m in sp));reds=sum(1 for m in sp if m['c']=='r');greens=sum(1 for m in sp if m['c']=='g')
  t=f"Attack {s['atk']} · Agility {s['agi']} · Hull {s['hull']} · Shields {s['sh']}. Actions: {', '.join(ACT[a] for a in s['acts'])}. {arc[0].upper()+arc[1:]}. Dial: {len(sp)} maneuvers at speeds {spd[0]}–{spd[-1]}, {greens} green, {reds} red."
  add('nebula','Ships',s['n'],tags,t)
SL=x['SLOTN']
for key,p in sorted(x['PILOTS'].items(),key=lambda a:(list(x['SHIPS']).index(a[1]['ship']),-a[1]['ps'])):
  s=x['SHIPS'][p['ship']]
  add('nebula','Pilots',p['n'],[s['n'],f"skill {p['ps']}",f"{p['pts']} points",'unique' if p.get('uniq') else None,WAVE[p.get('ex')]],p.get('t') or 'No special ability.',[('Upgrade slots',', '.join(SL[u] for u in p['u']) or 'none')])
for key,u in sorted(x['UPGRADES'].items(),key=lambda a:(SL[a[1]['slot']],a[1]['n'])):
  add('nebula','Upgrades',u['n'],[SL[u['slot']],f"{u['pts']} points",'unique' if u.get('uniq') else None,WAVE[u.get('ex')]],u['t'])
for key,c in x['DAMAGE'].items():add('nebula','Damage deck',c['n'],[f"{c['x']} cop{'y' if c['x']==1 else 'ies'}",c['tr']+' trait'],c['t'])
TX=[('Focus token','action token','Spend when attacking to turn every focus result into a hit, or when defending to turn every focus result into an evade. Removed at the end of the round.'),
 ('Evade token','action token','Spend when defending to add one evade result. Removed at the end of the round.'),
 ('Target lock','action token (pair)','Put a lock on an enemy at range 1–3. When attacking it, spend the lock to reroll any of your attack dice (each die once). Needed by torpedoes and most missiles. Stays until used; a new lock replaces the old one.'),
 ('Stress token','token','From red maneuvers. A stressed ship can’t take actions or fly red maneuvers (the opponent picks a replacement if it reveals one). A green maneuver removes one.'),
 ('Ion token','token (waves 1–3)','From ion weapons. An ionised ship (2 tokens for a large ship) must fly a white straight 1 and skips its action, then the tokens go.'),
 ('Shield token','token','Absorbs one hit or crit before damage cards are dealt.'),
 ('Damage card, face down','card','A normal hit: counts 1 against your hull.'),
 ('Damage card, face up','card','A crit: counts 1 against hull and applies the card’s effect. Some can be flipped face down with an action or a roll.'),
 ('Attack die','die','8 faces: 3 hit, 1 crit, 2 focus, 2 blank. Range 1 adds a die for primary weapons.'),
 ('Defence die','die','8 faces: 3 evade, 2 focus, 3 blank. Range 3 and obstructed shots add a die.'),
 ('Maneuver dial','component','Set in secret each round. Colours: green removes stress, white is normal, red gives stress.'),
 ('Maneuver templates','component','Straights 1–5, banks 1–3, turns 1–3, K-turns (straight then turn around), and the full stop for the shuttle.'),
 ('Range ruler','component','Three 100 mm bands: range 1, 2 and 3.'),
 ('Asteroids','obstacle','Six rocks. Flying onto one skips your action and rolls a damage die; a ship on one can’t attack; a shot through one is obstructed.'),
 ('Quake charge, plasma bomb','bomb token (waves 1–3)','Dropped behind the ship with the straight 1 template; they go off at the end of the activation and hit ships at range 1.'),
 ('Contact mine','bomb token (wave 3)','Stays on the table and goes off when a base or template touches it (3 attack dice).'),
 ('Initiative','marker','The side with fewer squad points (random on a tie). It moves first and shoots first on equal pilot skill, and wins if both last ships die together.')]
for n,tag,t in TX:add('nebula','Tokens, dice and components',n,[tag],t)
# ---- Doorkick Dungeon ----
TR=d['TRAITNAME']
SEC={'race':'Races and classes','class':'Races and classes','monster':'Monsters','enh':'Monster boosts','curse':'Curses','level':'Go up a level','item':'Items','oneshot':'One-shot treasures','special':'Other door and treasure cards'}
def slot(c):
  if c.get('slot'):return {'head':'headgear','foot':'footgear','armor':'armor'}[c['slot']]
  return {1:'1 hand',2:'2 hands'}.get(c.get('hands'),'no slot')
for c in sorted(d['CARDS'],key=lambda c:(list(SEC).index(c['t']),c.get('lvl',0),c['n'])):
  cp=c.get('cp',1);deck='door' if c['d']=='door' else 'treasure'
  tags=[deck+' deck',f"×{cp}" if cp>1 else None];sub=[]
  if c['t']=='monster':tags=[f"level {c['lvl']}",f"{c['tr']} treasure{'s' if c['tr']!=1 else ''}",f"{c.get('lv',1)} level{'s' if c.get('lv',1)>1 else ''}",'undead' if c.get('undead') else None]+tags;sub=[('Bad Stuff',c['badt'])]
  elif c['t']=='item':
    req=[] if not c.get('req') else [(('not '+TR.get(r[1:],r[1:])) if r.startswith('!') else (TR.get(r,r)+' only')) for r in ([c['req']] if isinstance(c['req'],str) else c['req'])]
    tags=[slot(c),f"+{c.get('b',0)}",f"{c.get('g',0)} gold",'Big' if c.get('big') else None]+req+tags
  elif c['t']=='oneshot':tags=[f"+{c['b']} either side" if c.get('b') else 'special',f"{c.get('g',0)} gold"]+tags
  elif c['t']=='enh':tags=[(f"{'+' if c['b']>0 else ''}{c['b']}" if c.get('b') else 'copy'),(f"{'+' if c.get('trb',0)>0 else ''}{c.get('trb',0)} treasure" if c.get('trb') else None)]+tags
  add('doorkick',SEC[c['t']],c['n'],tags,c.get('x','') or '',sub)
TD=[('Level counter','track','Everyone starts at level 1 and can’t drop below it. Level 10 wins, but only from killing a monster (Heavenly Favor lets Clerics win too).'),
 ('Six-sided die','die','Running away: 5 or 6 escapes, with modifiers (Elf +1, Halfling −1, items, monsters). Also used for theft (4+), the Goblin Horde and the Turbo Slugs.'),
 ('Combat strength','number','Your level plus the bonuses of the items you wear, plus one-shots and powers in the fight. A helper adds theirs. Ties go to the monster unless a Warrior is fighting.'),
 ('Hand','cards','Keep up to 5 cards (6 for a Dwarf) at the end of your turn; give the rest to the lowest-level player, or discard if you are the lowest.'),
 ('Carried or worn items','cards in play','Items in play are either worn (they give their bonus) or carried (turned sideways, no bonus). One headgear, armor and footgear, two hands of weapons, and one Big item.'),
 ('Curse reminders','cards in play','Lasting curses (Hen Hat Hex, Spiteful Mirror) stay in front of you until they end; they survive death.'),
 ('Porter','card in play','Carries one extra Big item for you. Fire the Porter discards it.')]
for n,tag,t in TD:add('doorkick','Tokens and components',n,[tag],t)
# ---- Shipwreck Isle ----
for e in json.load(open('ref_rc.json')):add('shipwreck',e['s'],e['n'],e['tags'],e['t'],[tuple(x) for x in e['sub']])
# ---- Sands of Qamar ----
for e in json.load(open('ref_ft.json')):add('sands',e['s'],e['n'],e['tags'],e['t'],[tuple(x) for x in e['sub']],e.get('c'))
# ---- Sunglaze ----
for e in json.load(open('ref_azul.json')):add('sunglaze',e['s'],e['n'],e.get('tags',[]),e['t'],[tuple(x) for x in e.get('sub',[])],e.get('c'))
# ---- Rampart & Vine ----
for e in json.load(open('ref_carc.json')):add('rampart',e['s'],e['n'],e.get('tags',[]),e['t'],[tuple(x) for x in e.get('sub',[])],e.get('c'))
GAMES=[('crown','Crown City Smash','Dice brawl · plays like King of Tokyo'),('nebula','Nebula Aces','Starfighter duel · plays like X-Wing 1st edition'),('doorkick','Doorkick Dungeon','Card brawl · plays like Munchkin'),('shipwreck','Shipwreck Isle','Co-op survival · plays like Robinson Crusoe'),('sands','Sands of Qamar','Tile-and-meeple bazaar · plays like Five Tribes'),('sunglaze','Sunglaze','Tile drafting · plays like Azul'),('rampart','Rampart & Vine','Tile laying · plays like Carcassonne')]
data=json.dumps({'E':E,'G':GAMES},ensure_ascii=False)
tpl=open('refpage/template.html').read()
out=tpl.replace('/*DATA*/null',data)
open('refpage/reference.html','w').write(out)
from collections import Counter
print(len(E),Counter((e['g'],e['s']) for e in E))
