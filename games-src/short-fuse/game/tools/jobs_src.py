# Short Fuse: the 66 jobs, our own authored set. Run: python3 game/tools/jobs_src.py
# Writes missions.json (the job list), the MISSION_SETUP / MISSION_INFO blocks of game/src/data.js and BRIEFS / BOXES of game/texts.js.
# Every job is a new combination of the engine's rule handlers, wire mix, fuse and gear. Names, story lines and texts are our own.
import json,re,os
H=os.path.dirname(os.path.abspath(__file__));ROOT=os.path.join(H,'..','..')
def ex(n,**k):d={'m':'exact','n':n};d.update(k);return d
def of(n,m):return {'m':'of','n':n,'of':m}
J=[]
def job(n,nm,brief,text,rules=None,red=None,yel=None,two='auto',info=None,tok=None,audio=False,**s):
  J.append(dict(n=n,nm=nm,brief=brief,text=text,rules=rules or [],red=red,yel=yel,two=two,info=info,tok=tok,audio=audio,s=s))
# ---------- depot training (1-3) and first call-outs (4-8) ----------
job(1,'First Snip','Day one at the depot. Brix rolls in a practice charge. Seven blue numbers, no tricks.',
 'Training. Blue wires 1 to 7 only, no gear. Learn the dual cut and the solo cut.',blue=7,eq={'n':0},two=None)
job(2,'Yellow Tape','Same practice charge, now with yellow tape on four leads. Yellow only matches yellow.',
 'Blue 1 to 9, plus four yellow wires from 1.1 to 8.1. A yellow is just "yellow". To cut one, you must hold one. No gear.',
 yel=ex(4,cand=[1.1,8.1]),blue=9,eq={'n':0},two=None)
job(3,'The Red Lead','The trainers hide one red lead in the bundle. Touch it and the paint charge pops. Your first gear arrives.',
 'Blue 1 to 11, plus one red from 2.5 to 10.5. Pointing at a red ends the job. A hand of only reds is shown at turn start. Gear arrives, one card each. Hand-Off and Spare Batteries stay in the van.',
 red=ex(1,cand=[2.5,10.5]),blue=11,eq={'ex':['eq11','eq7']},two=None)
job(4,'Cinema Basement','A real call-out under the old cinema. All the blues, a low red and two high yellows. Nothing new.',
 'All 48 blue wires from now on. One low red, from 1.5 to 6.5. Two high yellows, from 5.1 to 11.1. No new rules.',red=ex(1,cand=[1.5,6.5]),yel=ex(2,cand=[5.1,11.1]))
job(5,'Greenhouse','A grumpy gardener wired the greenhouse. Two red tags hang there. Only one lead is real.',
 'Two red values are marked with "?". Only one of those reds is really in play. Two yellows too.',red=of(1,2),yel=ex(2))
job(6,'Ice-Cream Plant','Four yellow tags in the freezer room. Two leads are real. Gloves on.',
 'Four yellow values are marked. Only two of those yellows are really in play. Two red tags, one real.',red=of(1,2),yel=of(2,4))
job(7,'Bowling Lanes','Three red tags under lane seven. One of them is real. Guess wrong and it is a strike.',
 'Three red values are marked, one red is real. The Fuse Pinch stays in the van.',red=of(1,3),eq={'ex':['eq6']})
job(8,'Pier Exam','Exam day on the pier. The chief listens to every word. Keep the numbers to yourself.',
 'Two red tags, one real. Four yellows. Nobody may say a wire number out loud.',red=of(1,2),yel=ex(4),rules=[{'k':'speech','what':'numbers'}])
# ---------- calling cards (9-19) ----------
job(9,'Paint Shop','The first brass key turns up at the paint shop. One blue number is painted red.',
 'A random number card marks one blue value. It acts like red: never cut it. It is shown at the end. Three yellow tags, two real.',
 yel=of(2,3),rules=[{'k':'fakeRed'}])
job(10,'Permit Office','Every gear card at the permit office is pinned under a form. Two stamps to unlock each.',
 'A number card covers each gear card. A card unlocks only when both are done. Cut two wires of its own value. Cut two of the covering value too.',
 red=ex(1),yel=ex(2),rules=[{'k':'eqCover'}])
job(11,'Lighthouse','The keeper left one tool: a roll call that never runs out. The lamp picks the numbers.',
 'Only the Roll Call is on the board, always ready. No opening tokens. Each turn a number card turns up. Roll call it. Then pick who must cut it.',
 red=ex(2),yel=ex(2),info='none',eq={'n':0,'fixed':['eq8']},rules=[{'k':'searchlight'}])
job(12,'Town Hall Steps','Four numbers chalked on the town hall steps. The Clockmaker wants them climbed in order.',
 'Four number cards set an order. Cut two wires of each before the next one opens. Other values are free.',
 red=ex(2),rules=[{'k':'gate','cards':4,'req':2}])
job(13,'Fake Countdown','A screen in the station shows 15:00. The Clockmaker never plays fair with time.',
 'Timed job. The screen shows 15:00, but the clock cheats. Real play time is about 11 minutes. If it hits zero, boom.',
 red=ex(1),yel=of(2,4),two=None,audio=True,timer={'s':668},rules=[{'k':'timer','script':'m19'}])
job(14,'Two-Faced Gardener','The gardener is back, hiding in the crew. Whoever draws the foreman card fibs all job.',
 'Crew cards are dealt at random. Whoever gets the foreman card is the fibber. They open with two false tokens. Every token in their hand means "NOT this value". The fibber may not use gear.',
 red=ex(1),yel=ex(2),chars='random_deal',rules=[{'k':'liar'}])
job(15,'Rush Hour','A charge on the tram line. No time for turns: whoever is ready grabs the next cut.',
 'Against the clock: 13 minutes, 11 with two crew. No fixed order. After a turn, anyone may claim the next one. Never two in a row. Hand-Off stays in the van.',
 red=of(1,2),eq={'ex':['eq11']},timer={'s':780,'s2':660},rules=[{'k':'freeTurns'},{'k':'timer','script':'plain'}])
job(16,'Chalk Lines','The school gym. Everyone chalks two numbers they do NOT hold. Yellows bring a gift.',
 'Each player lays two tokens for values they do NOT hold. After the first two yellows go, each player passes a supply token left. The receiver places it truthfully.',
 red=ex(2),yel=ex(4),info='neg',rules=[{'k':'yellowGift'}])
job(17,'Bare Toolbelts','The tool lockers are glued shut. No personal tools. Yellows unlock a token draft.',
 'No personal tools. After the first two yellows are cut, draw one token per player. From the foreman, each player takes one and places it truthfully.',
 red=ex(2),yel=ex(2),chars='no_personal_items',eq={'ex':['eq6']},rules=[{'k':'yellowDraft'}])
job(18,'Back to Front','The foreman wakes up with one wire flipped the wrong way. Everyone sees it but Brix.',
 'The foreman flips one own wire at random. They cannot see it, everyone else can. Only the foreman may cut it, with a plain cut. A miss on it is a boom.',
 red=ex(1),yel=ex(4),rules=[{'k':'flip','who':'captain','n':1}])
job(19,'Seven Bells','The church bells ring seven times. The four 7s wait for the very end.',
 'The four 7s must go last. They go all at once, by a player holding only 7s. Four yellows at 2.1, 6.1, 9.1 and 11.1. One red.',
 red=ex(1),yel={'m':'fixed','vals':[2.1,6.1,9.1,11.1],'n':4},two=None,rules=[{'k':'sevens'}])
# ---------- night shift (20-30) ----------
job(20,'Odd Socks','A laundry van, wired in a hurry. The last wire on each stand never got sorted.',
 'The last wire dealt to each stand is not sorted. It sits at the far right with an X. No gear or personal tool can touch X wires. The Swap Bag stays in the van.',
 red=of(1,2),yel=ex(2),eq={'ex':['eq2']},rules=[{'k':'xWire','mode':'last'}])
job(21,'Heads or Tails','A casino coin sorter. The tokens only say even or odd tonight.',
 'Info tokens only show even or odd, all job long. One red, two yellows.',red=ex(1),yel=ex(2),tok='par')
job(22,'Number Wheel','A fairground wheel with twelve numbers. Spin, then cut what it shows.',
 'All twelve number cards lie face up. Each turn, turn one over and cut that value. When none are left, turn them all up again. Hold none of the shown values: skip.',
 red=ex(2),rules=[{'k':'declare'}])
job(23,'Red Trio','Three red leads, one in each of three pockets. They must come out together.',
 'The three reds are dealt one each from the foreman. Reds go only by a special action: point at three uncut wires at once. If any is not red, boom. Gear cannot pick reds.',
 red=ex(3,deal='one_per_player_from_captain'),yel=ex(4),info='rand',two={'capNoInfo':1},rules=[{'k':'redTriple'}])
job(24,'Rush Delivery','A parcel van with a ticking parcel. Targets flash up and the clock does not wait.',
 'Timed job. Quick number targets with rewards and penalties. Then a three-value rush. Then a final dash.',
 red=ex(1),yel=ex(2),two=None,audio=True,rules=[{'k':'bus'}])
job(25,'Locked Van','The gear is locked in the van. One number opens it, but only all four at once.',
 'Seven gear cards wait face down in the van. A number card is shown. Its four wires go only all at once: point at all four, boom if wrong. Until then one van card burns each round.',
 red=ex(2),yel=ex(2),rules=[{'k':'special4','reward':'eqDeck'}])
job(26,'Power Cut','The lights die in the museum. Tokens lie beside the stand. Remember where they pointed.',
 'No validation tokens or markers. Tokens lie beside the stand, not in front of a wire. Remember where they pointed.',
 red=of(1,2),yel=ex(4),info='memory',rules=[{'k':'memory'}])
job(27,'Pier Lights','Five bulbs along the pier. Only the bulb under the arrow may be cut.',
 'Five number cards in a row. The arrow starts at the end the foreman picks. Cut two of the arrowed value to clear it. Whoever does picks the end the arrow goes to next.',
 red=ex(3),rules=[{'k':'line5'}])
job(28,'Sealed Crates','The gear arrives in sealed crates. Finish a number to open one.',
 'Gear lies face down. A number deck turns up one card at a time. Cut all four wires of the shown value. Then one gear card turns up, ready at once.',
 red=ex(2),yel=ex(2),rules=[{'k':'eqDeckReveal'}])
job(29,'Three Lemons','A lemonade stand with three yellow leads, one per pocket. All three go at once.',
 'Three yellows, dealt one each. They go only all three at once, by pointing at them. A miss tags every pointed wire and burns one step. A red among them still explodes. No personal tools.',
 red=of(2,3),chars='no_personal_items',yel=ex(3,deal='one_per_player_from_captain'),two={'yel':ex(3,deal='one_per_player_from_captain_captain_gets_2')},rules=[{'k':'yellowTrio'}])
job(30,'Hands Up','A quiz show set. A number lights up and the first hand up must cut it.',
 'No fixed order. A number card turns up. The first to call it must cut that value. A false call burns a step. If nobody calls, the foreman picks.',
 red=ex(1),eq={'ex':['eq11']},rules=[{'k':'volunteer'}])
# ---------- crew trouble (31-42) ----------
job(31,'Bell Tower Climb','The bell tower stairs. Three numbers in order, four wires each, and no saying numbers.',
 'Three number cards set an order. Cut all four wires of a value before the next one opens. Nobody may say a wire number out loud.',
 red=ex(2),yel=ex(2),rules=[{'k':'gate','cards':3,'req':4},{'k':'speech','what':'numbers'}])
job(32,'First Shift','A new hire joins at random. Whoever draws the foreman card is green as grass.',
 'Crew cards are dealt at random. Whoever gets the foreman card is the rookie. If the rookie misses a dual cut, boom. The rookie may not use the Blast Blanket.',
 red=ex(1),yel=ex(2),chars='random_deal',rules=[{'k':'rookie'}])
job(33,'Shaky Hands','Brix broke a finger. No crew card for the foreman, and one slip blows the job.',
 'The foreman has no crew card and may not use gear. A missed dual cut by the foreman blows up the job.',
 red=ex(1),yel=ex(2),chars='captain_has_none',rules=[{'k':'butterfingers'}])
job(34,'Tally Marks','The accountant\'s office. Tokens count how many of a number sit on a stand.',
 'Count tokens (x1, x2, x3) replace info tokens. They show how many of that value are on that stand, cut wires included. Never on a red.',
 red=ex(2),yel=ex(2),tok='cnt')
job(35,'Moving Rules','A rulebook factory. The house rule changes every time a number is finished.',
 'A shared restriction deck. The card changes each time a value is finished. If nobody can play for a whole round, the fuse burns and the card changes.',
 red=ex(2),yel=ex(2),rules=[{'k':'globCon','mode':'onFinish','roundBlock':'dial'}])
job(36,'Hard Lines','Each stand gets one extra blue, glued at the far right. The yellows unlock them.',
 'Each stand gets one extra blue wire, unsorted, at the far right with an X. X wires can be cut only after every yellow is cut. No gear or tool may touch them.',
 red=ex(1),yel=ex(2),eq={'ex':['eq2']},rules=[{'k':'xWire','mode':'extra','lockYellow':True}])
job(37,'Carnival Night','The carnival is in town and its acts keep crashing the job.',
 'No time limit, but carnival acts keep cutting in. Wires come back, seats move, cut wires get swapped or thrown away.',
 red=ex(2),yel=ex(2),two=None,audio=True,rules=[{'k':'circus'}])
job(38,'Personal Quirks','Everyone draws a quirk card and must live with it. Until they cannot.',
 'Each player drafts a restriction card (A to E) and obeys it. At turn start, a player who cannot obey turns it down and plays free.',
 red=ex(1),yel=ex(2),rules=[{'k':'persCon','pick':'draft'}])
job(39,'Four of a Kind','The card club. One number must go all four at once. Spare cards become tips.',
 'No gear. A number card is shown. Its four wires go only all at once, boom if wrong. A deck of eight cards burns one per round until then. Then the rest become extra tokens. Opening tokens are random.',
 red=ex(1),yel=ex(2),info='rand',eq={'n':0},rules=[{'k':'special4','reward':'numInfo'}])
job(40,'Snare Line','The yellows are snares, one per player. The fuse is already short.',
 'The yellows are snare wires, one per player. The fuse starts two steps from the end. A snare goes only by pointing at a crewmate\'s snare. Right: the fuse turns back a step. Wrong: a token and a burnt step.',
 red=ex(1),yel={'m':'exact','n':'players_max_4','deal':'one_per_player_from_captain_skip_captain_at_5'},
 two={'red':ex(1),'yel':ex(2,deal='one_per_player_from_captain')},info='rand',dial=2,eq={'ex':['eqY']},rules=[{'k':'tripwire'}])
job(41,'Inside Job','Someone on the crew works for the Clockmaker. Find them before the fuse does.',
 'Crew cards and restrictions are dealt face down. The foreman card holder is the secret weak link. Only they obey a restriction. No personal tools until they are unmasked. At your turn start you may accuse.',
 red=ex(2),yel=ex(2),pl=[3,4,5],two=None,chars='hidden_random_deal',rules=[{'k':'mole'}])
job(42,'Star Shower','Shooting stars over the observatory. Each finished star number buys back a step.',
 'One number card per player. The fuse starts one step from the end. Each finished card value turns it back a step.',
 red=ex(2),yel=ex(2),dial=1,rules=[{'k':'meteor'}])
# ---------- deep water (43-54) ----------
job(43,'Walking Robot','A robot guard walks the number track. It carries wires of its own.',
 'A robot holds a few unseen wires. It walks the 1-12 track one step after every turn. Cut the value it stands on and take one of its wires. Its wires must be cut too.',
 red=ex(2),yel=ex(2),two={'red':ex(3),'capRandInfo':1},rules=[{'k':'robotPatrol'}])
job(44,'Mind Games','A fortune teller\'s tent. Your neighbour guesses your next number in secret.',
 'Everyone holds secret number cards. Before each turn, the player on the right lays one face down. If the active player cuts that value, the fuse burns a step.',
 red=ex(2),yel=ex(2),rules=[{'k':'mindRead'}])
job(45,'Deep Well','A charge at the bottom of a well. Air is shared, deep cuts cost more, and nobody talks.',
 'A shared oxygen reserve, two per player. Each cut costs 1, 2 or 3 by depth. It refills each round, when the turn passes the foreman. Cannot pay: skip and burn a step. No talking.',
 red=ex(1),yel=ex(2),eq={'ex':['eq6']},rules=[{'k':'oxygen','variant':'shared'},{'k':'speech','what':'all'}])
job(46,'Boss Calls','A boss of the moment barks the orders. Each turn a new number and a new victim.',
 'Each turn, the boss of the moment turns up a number card. They pick who must cut it. Two reds, two yellows.',
 red=ex(2),yel=ex(2),rules=[{'k':'sir'}])
job(47,'Hall of Lies','The mirror maze. Every token in here lies.',
 'Every token in this job is false. It means "this wire is NOT this value". Each player opens with two false tokens.',
 red=ex(2),yel=ex(2),info='false2',tok='false',eq={'ex':['eq1','eq12']})
job(48,'Flood Tide','The harbour pump room floods. Reds leak into hands and the air runs low.',
 'Timed job, 10 minutes. All eleven reds wait in a pile and leak into hands. Oxygen by depth. Finished numbers bring fresh air.',
 red=ex(11,deal='facedown_pile_not_dealt'),two={'red':ex(11,deal='facedown_pile_not_dealt')},audio=True,eq={'ex':['eq10']},chEx=['ch_new4'],timer={'s':600},
 rules=[{'k':'redTide'},{'k':'oxygen','variant':'depth'}])
job(49,'Clockwork Fuse','The Clockmaker built the fuse himself: a little robot marching to 12.',
 'No fuse dial: the robot is the fuse. It steps forward after cuts, two steps after a miss. It steps back when the cut matches its space. At 12, boom.',
 red=ex(1),yel=ex(2),dial=None,eq={'ex':['eq6','eq9']},rules=[{'k':'robotFuse'}])
job(50,'Dare Night','The crew plays dares to buy time. Meet one and the fuse turns back.',
 'One challenge card per player. The fuse starts one step from the end. Each challenge met turns it back a step.',
 red=ex(1),yel=ex(2),dial=1,rules=[{'k':'challenges'}])
job(51,'Domino Rules','Every finished number knocks a new rule into place. Do not get boxed in.',
 'Each number is paired with a restriction. Each finished value switches its paired restriction on for everyone. If nobody can play for a whole round, boom.',
 red=ex(2),eq={'ex':['eq1010']},rules=[{'k':'globCon','mode':'paired','roundBlock':'explode'}])
job(52,'Robot Road','A robot rolls along a road of numbers. It only goes forward.',
 'Number cards in a line with the robot on the 7. Move it forward, never back, to a value you hold. Then cut that value. Stuck: skip, burn a step, turn it round.',
 red=ex(1),rules=[{'k':'robotLine'}])
job(53,'Probe Frenzy','No tokens at all, but every two-prong tester works every turn.',
 'No info tokens at all. Every Two-Prong Tester works every turn. Base crew only.',
 red=ex(1),yel=ex(2),info='none',tok='none',chars='base_only',eq={'ex':['eq4','eq7']},rules=[{'k':'unlimitedDD'}])
job(54,'Quirk Swap','Quirk cards again, and they move around the table.',
 'Each player gets a restriction (A to E). Each round the crew may rotate them all. Burn a step to swap yours for a random F-L card. If nobody can play for a whole round, boom.',
 red=ex(1),yel=ex(2),rules=[{'k':'persCon','pick':'random','rotate':True,'swap':True,'roundBlock':'explode'}])
# ---------- the clock tower (55-66) ----------
job(55,'Sums','The tower\'s first floor is a giant abacus. Every cut is a sum.',
 'Twelve number cards face up. To cut, add or subtract two of them. The result is the value you must cut. Cannot or will not: burn a step.',
 eq={'ex':['eq10']},chEx=['ch_new4'],rules=[{'k':'math'}])
job(56,'Haywire','Every crew member gets one wire flipped blind to the far right.',
 'Each player flips one own wire unseen to the far right. You must cut your own flipped wire yourself, with a plain cut. A miss is a boom. Cutting a crewmate\'s flipped wire costs a step.',
 red=ex(1),yel=ex(2),rules=[{'k':'flip','who':'each','n':1,'others':1}])
job(57,'Air Mail','The tower lift is stuck. Pay for each cut with air sent to a crewmate. Silence.',
 'Each player keeps oxygen. To cut value V, first hand V oxygen to a crewmate. Cannot pay: skip and burn a step. No talking.',
 red=ex(1),rules=[{'k':'oxygen','variant':'gift'},{'k':'speech','what':'all'}])
job(58,'Ringmaster','The foreman holds the house rule and may change it every turn.',
 'A shared restriction deck. Everyone obeys the face-up card. The foreman may swap it at the start of each turn. A blocked player skips.',
 red=ex(1),yel=ex(2),rules=[{'k':'globCon','mode':'captain'}])
job(59,'Even Dares','Dares again, but the tokens only say even or odd.',
 'One challenge card per player. The fuse starts two steps from the end. Each challenge met turns it back a step. Info tokens only show even or odd.',
 red=ex(1),dial=2,tok='par',rules=[{'k':'challenges'}])
job(60,'Pass the Parcel','Number cards travel round the table. You may only cut what you are holding.',
 'Number cards are dealt face up. You may only cut values on your cards. None: skip and burn a step. After each turn hand one card to a crewmate.',
pl=[3,4,5],two=None,rules=[{'k':'hotPotato'}])
job(61,'One Tank','One air tank for the whole crew. It starts with the foreman and moves left.',
 'The foreman starts with all the oxygen. Cut value V: pay V into the reserve. Pass all your oxygen left after your turn. Each round the foreman collects the reserve. No talking.',
rules=[{'k':'oxygen','variant':'bundle'},{'k':'speech','what':'all'}])
job(62,'Both Ends','Two blind wires each, one at each end of every hand.',
 'Each player flips two own wires unseen. The lower goes far left, the higher far right. Same rules as Haywire.',
 red=ex(1),rules=[{'k':'flip','who':'each','n':2,'others':1}])
job(63,'Meteor Count','Stars again, now counted. Tokens say how many, and the fuse is short.',
 'One number card per player. The fuse starts one step from the end. Each finished card value turns it back a step. Count tokens replace info tokens.',
 red=ex(2),dial=1,tok='cnt',rules=[{'k':'meteor'}])
job(64,'Bunker Raid','The Clockmaker\'s bunker under the tower. Race the clock room to room.',
 'Timed job on the bunker map. Every cut moves the crew toward the side whose restriction it met. Reach the key, guard, stairs, lever and doctor in time. Then finish the bomb.',
 red=ex(1),yel=ex(2),two=None,audio=True,rules=[{'k':'bunker'}])
job(65,'The Apprentice','The Clockmaker\'s apprentice hides in the crew, and one blue number is painted red.',
 'Crew cards are dealt at random. The foreman card holder is the rookie: their missed dual cut is a boom. A random blue value acts like red. Never cut it.',
 red=ex(1),chars='random_deal',rules=[{'k':'rookie'},{'k':'fakeRed'}])
job(66,'The Masterpiece','The top of the clock tower. The Clockmaker\'s last device, against the clock.',
 'Timed job: 15 minutes, 13 with two crew. Three number cards set an order, two wires each. Count tokens replace info tokens. Two reds, two yellows.',
 red=ex(2),yel=ex(2),timer={'s':900,'s2':780},tok='cnt',rules=[{'k':'gate','cards':3,'req':2},{'k':'timer','script':'plain'}])
assert [j['n'] for j in J]==list(range(1,67)),[j['n'] for j in J]
BOXES=[[1,3,'Depot training'],[4,8,'First call-outs'],[9,18,'Act 1: calling cards'],[19,31,'Act 2: night shift'],[32,44,'Act 3: crew trouble'],[45,55,'Act 4: deep water'],[56,66,'Act 5: the clock tower']]
def autotwo(j):
  t=j['two']
  if t is None:return {}
  if t!='auto':return t
  o={}
  r=j['red']
  if r and r['m']=='exact' and isinstance(r['n'],int) and r['n']<3 and 'deal' not in r:o['red']=ex(r['n']+1)
  if r and r['m']=='of':o['red']=of(min(r['n']+1,r['of']),r['of']+(1 if r['n']+1>=r['of'] else 0))
  y=j['yel']
  if y and y['m']=='exact' and isinstance(y['n'],int) and y['n']<4 and 'deal' not in y:o['yel']=ex(4)
  return o
setup=[];info={}
for j in J:
  o={'n':j['n']};s=j['s']
  if 'pl' in s:o['pl']=s['pl']
  if 'blue' in s:o['blue']=s['blue']
  if j['red']:o['red']=j['red']
  if j['yel']:o['yel']=j['yel']
  t=autotwo(j)
  if t:o['two']=t
  for k in ['dial','eq','chars','chEx','timer']:
    if k in s:o[k]=s[k]
  setup.append(o)
  i={'nm':j['nm'],'text':j['text']}
  if j['info']:i['info']=j['info']
  if j['tok']:i['tok']=j['tok']
  if j['rules']:i['rules']=j['rules']
  if j['audio']:i['audio']=True
  info[j['n']]=i
# missions.json: the readable job list (our own content)
json.dump({'meta':{'title':'Short Fuse jobs','count':66,'note':'Our own authored job set. Generated by game/tools/jobs_src.py; edit that file, not this one.','boxes':BOXES},
  'missions':[dict(number=j['n'],name=j['nm'],brief=j['brief'],text=j['text'],setup=setup[k],rules=info[j['n']].get('rules',[]),info=j['info'] or 'std',tokens=j['tok'] or 'num',audio=j['audio']) for k,j in enumerate(J)]},
  open(os.path.join(ROOT,'missions.json'),'w'),indent=1)
# data.js blocks
D=os.path.join(ROOT,'game','src','data.js');d=open(D).read()
blk='const MISSION_SETUP=[\n'+',\n'.join(json.dumps(o,separators=(',',':')) for o in setup)+'];\n'
d=re.sub(r'const MISSION_SETUP=\[\n.*?\];\n',lambda m:blk,d,flags=re.S)
def js(v):return json.dumps(v,separators=(',',':'),ensure_ascii=False)
lines=[]
for n in range(1,67):
  i=info[n];p=["nm:"+js(i['nm']),"text:"+js(i['text'])]
  for k in ['info','tok']:
    if k in i:p.append(k+':'+js(i[k]))
  if 'rules' in i:p.append('rules:'+re.sub(r'"(\w+)":',r'\1:',js(i['rules'])))
  if i.get('audio'):p.append('audio:true')
  lines.append(f"{n}:{{{','.join(p)}}}")
d=re.sub(r'const MISSION_INFO=\{\n.*?\n\};\n',lambda m:'const MISSION_INFO={\n'+',\n'.join(lines)+'\n};\n',d,flags=re.S)
open(D,'w').write(d)
T=os.path.join(ROOT,'game','texts.js');t=open(T).read()
b='const BRIEFS={\n'+',\n'.join(f"{j['n']}:{js(j['brief'])}" for j in J)+'};\n'
t=re.sub(r'const BRIEFS=\{\n.*?\};\n',lambda m:b,t,count=1,flags=re.S)
t=re.sub(r'const BOXES=\[.*?\];',lambda m:'const BOXES='+js(BOXES)+';',t,count=1)
open(T,'w').write(t)
print('ok',len(J))
