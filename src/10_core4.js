const PD=Object.fromEntries([...PDL,{n:'KAISER',full:'Vex Kaiser',flag:'🏴',team:'shadow',style:'aggressor',r:1}].map(p=>[p.n,p]));
const teamOf=pd=>pd.team==='shadow'?BOSS_TEAM:TEAMS.find(t=>t.id===pd.team)||TEAMS[0];
// LEGO-2K-style world events: beat rivals one-on-one for their flags, 5 flags open the Grand Arena boss race
const SIG={boost:'Turbo burst',shield:'Iron shield',missile:'Homing missiles',mines:'Mine trail',emp:'EMP pulse',rail:'Rail sniper',ram:'Battering ram'};
const RIVAL_EV=[{p:'ROSSI',track:'grand',mood:'brick',sig:'boost',line:'Show me what you have, rookie!'},{p:'WEBER',track:'hafen',mood:'dawn',sig:'shield',line:'Clean racing on the river. Ready?'},
 {p:'MOREAU',track:'sky',mood:'fog',sig:'boost',line:'Up in the towers you will lose me.'},{p:'OKAFOR',track:'fraport',mood:'night',sig:'ram',line:'The piste is MY yard.'},
 {p:'FERREIRA',track:'hafen',mood:'storm',sig:'missile',line:'Locking on…'},{p:'ÇELIK',track:'grand',mood:'storm',sig:'mines',line:'Watch where you drive.'},
 {p:'BRANDT',track:'fraport',mood:'dawn',sig:'emp',line:'Systems ready. Are yours?'},{p:'NAKAMURA',track:'sky',mood:'night',sig:'rail',line:'One shot is all I need.'}];
const BOSS_EV={p:'KAISER',track:'grand',mood:'storm',sig:'boss',need:5,line:'Flags? Cute. The Sky Cup is mine. It always will be.'};
const flagsR=()=>store.peek('mho_flags',{}),flags=()=>store.get('mho_flags',{});
const BOSS_LINES=['Rules are for rookies.','Did you see that? No? Good.','Shortcut privileges, sorry!','The Sky Cup is MINE.','Catch me if you can. You cannot.'];
function radioLine(s,line){const p=PD[s.pid];const el=$('#radio');if(!el||!p)return;el.querySelector('img').src=avatar(p.n);el.querySelector('b').textContent=`${p.flag} ${p.n}${p.n==='KAISER'||p.n==='DRAKOS'?' · BOSS':''}`;el.querySelector('span').textContent=line;el.classList.add('on');clearTimeout(radioT);radioT=setTimeout(()=>el.classList.remove('on'),2800)}
function worldCfg(ev){const boss=ev===BOSS_EV||!!ev.boss,td=TRACK_DEFS.find(t=>t.id===ev.track);return{type:'race',laps:boss?3:Math.max(2,td.laps-1),traffic:boss?10:14,items:true,aggr:boss?.4:(ev.sig==='ram'?.45:.15),track:ev.track,mood:ev.mood,world:ev,rival:boss?null:ev.p,boss}}
function sigTick(s){if(!s.sig||s.dead>0||s.eliminated||state!=='race'||!pl)return;s.sigT=(s.sigT??rr(4,7))-H;const ahead=tdd(s.dist,pl.dist)>0,gap=Math.abs(tdd(s.dist,pl.dist));
  if(s.sig==='boss'){if(!ahead&&gap>30)s.v=Math.max(s.v,pl.v*.98);if(s.sigT<=0){s.sigT=rr(6,9);if(ahead&&gap<120){s.item='mines';useItem(s)}else if(gap<40){s.item='emp';useItem(s)}else s.boost=2.5;if(R()<.5){const BL=s.pid==='DRAKOS'?DRAKOS_LINES:BOSS_LINES;radioLine(s,BL[Math.floor(R()*BL.length)])}}return}
  if(s.sigT>0)return;s.sigT=rr(7,11);const k=s.sig;
  if(k==='boost'||k==='ram'){s.boost=2.2;if(k==='ram')s.attackT=1.4}else if(k==='shield')s.shield=3;
  else if(k==='mines'){if(!ahead)return;s.item='mines';useItem(s)}else if(k==='missile'||k==='rail'){if(ahead)return;s.item=k;useItem(s)}else if(k==='emp'){if(gap>40)return;s.item='emp';useItem(s)}
  if(near(s))feed(`${s.pid} · ${SIG[k].toUpperCase()}`,0,'#ff7ac0')}
const STYLE_NAME={clean:'Clean racer',aggressor:'Aggressor',gunner:'Gunner',showman:'Showman'};
const TAUNT={aggressor:{gloat:['Out of my way, rookie.','Stay down.','That is how we drive here.'],hurt:['You will pay for that.','Cheap shot!','See you next lap…'],pass:['Too slow!','Coming through!','Move!']},
 clean:{gloat:['Sorry, racing incident.','Nothing personal.'],hurt:['Hey! Keep it clean!','Was that necessary?'],pass:['Inside line, thanks.','Better luck next corner.']},
 gunner:{gloat:['Target down.','Lock, fire, done.'],hurt:['Lucky shot.','Systems hit. I will remember.'],pass:['Watch your six.','Missiles warm.']},
 showman:{gloat:['Did you get that on camera?','Style points!'],hurt:['Ouch, the paint!','My sponsors saw that.'],pass:['Smile for the crowd!','Ciao!']}};
const NEM_LINES=['Again? I have been waiting for you.','This time you are mine.','Not you again.','Remember me?'];
const LEAGUES=[{name:'Rookie Cup',sh:'Rookie',cls:'rookie'},{name:'Main Series',sh:'Main',cls:'pro'},{name:'Elite Series',sh:'Elite',cls:'elite'},{name:'Master Series',sh:'Master',cls:'master'},{name:'Mainhattan Grand Prix',sh:'Grand Prix',cls:'legend'}];
const RND_NAMES=['Opening Round','Pure Speed','Eliminator','Contact Sport','Grand Final'];
const SPTS=[25,18,15,12,10,8,6,4],SCRED=[5000,3500,2600,2000,1500,1100,800,600],UPC=[4000,8000,14000,22000,32000],UPS=[0,6,15,28,45];
const UPG=[{k:'eng',name:'Engine',fx:'+3% top speed'},{k:'thr',name:'Thrusters',fx:'+6% acceleration'},{k:'han',name:'Handling',fx:'+4% grip'},{k:'arm',name:'Armour',fx:'+10% hull'}];
// Four circuits through one Frankfurt. cp: [x, height, z, sector] (x/z scaled by S). Jumps are found on the built track:
// river = where the road crosses the Main inside [xmin,xmax]; pit/sky = a gap of ±half metres around the sample nearest `at`.
const TRACK_DEFS=[
 {id:'grand',name:'Mainhattan Grand Prix',short:'Grand Prix',laps:3,tunnel:'U-BAHN · HAUPTWACHE',
  desc:'The full city: the Bankenviertel canyon, the Zeil, the EZB, the broken Flößerbrücke, the U-Bahn and the Messe.',
  cp:[[-600,4,-120,'BANKENVIERTEL'],[-600,4,-300,'BANKENVIERTEL'],[-560,6,-800,'BANKENVIERTEL'],[-350,10,-1050,'ESCHENHEIMER TOR'],[100,8,-1100,'ZEIL'],[600,8,-1080,'ZEIL'],
 [1000,14,-950,'KONSTABLERWACHE'],[1400,26,-700,'OSTEND'],[1650,30,-350,'OSTEND · EZB'],[1650,40,150,'OSTEND · EZB'],[1550,55,600,'FLÖSSERBRÜCKE'],[1300,45,1000,'SACHSENHAUSEN'],
 [800,20,1100,'SACHSENHAUSEN'],[300,10,1050,'MUSEUMSUFER'],[-100,12,950,'MUSEUMSUFER'],[-300,22,600,'EISERNER STEG'],[-300,0,100,'RÖMERBERG'],[-450,-30,-150,'U-BAHN TUNNEL'],
 [-800,-30,-300,'U-BAHN TUNNEL'],[-1150,-5,-350,'WESTEND'],[-1550,5,-450,'MESSE'],[-1900,10,-300,'MESSE'],[-2050,12,50,'FESTHALLE'],[-1800,8,300,'GALLUS'],[-1300,4,300,'GLEISFELD'],
 [-900,4,300,'HAUPTBAHNHOF'],[-680,4,260,'HAUPTBAHNHOF'],[-600,4,100,'BANKENVIERTEL']],
  jumps:[{id:'main',name:'MAIN',kind:'river',xmin:0,xmax:9e9,jw:70,msg:'INTO THE MAIN'},{id:'gleis',name:'GLEISFELD',kind:'pit',at:[-1110,300],half:32,floor:-12,style:'rail',msg:'INTO THE RAIL YARD'}],clear:[]},
 {id:'hafen',name:'Westhafen Loop',short:'Westhafen',laps:3,tunnel:'',
  desc:'A harbour circuit with a splash: dive off the flyover into the Main, race the river as a boat over waves and boost rings, then ramp back onto the road.',
  cp:[[-650,6,390,'WESTHAFEN'],[-1000,6,400,'WESTHAFEN'],[-1350,8,370,'WESTHAFEN · KRANE'],[-1650,12,300,'GUTLEUT'],[-1830,16,150,'GUTLEUT'],[-1800,22,-50,'GALLUS'],
   [-1550,28,-150,'GALLUS'],[-1250,32,-110,'MAINZER LANDSTRASSE'],[-1080,34,60,'MAINZER LANDSTRASSE'],[-1050,36,300,'HAFEN-FLYOVER'],[-1062,30,420,'HAFEN-FLYOVER'],[-1120,9,540,'MAIN · RAMPE'],[-1270,-6.6,615,'MAIN · WASSER'],[-1550,-6.6,640,'MAIN · WASSER'],[-1790,-6.6,610,'MAIN · WASSER'],[-1960,-6.6,640,'MAIN · WASSER'],[-2000,-6.6,700,'MAIN · WASSER'],
   [-1950,4,790,'NIEDERRAD · RAMPE'],[-1700,16,870,'NIEDERRAD'],[-1330,24,900,'NIEDERRAD'],[-980,28,880,'NIEDERRAD'],[-700,22,980,'SACHSENHAUSEN WEST'],[-420,24,900,'SACHSENHAUSEN WEST'],[-330,30,700,'FRIEDENSBRÜCKE'],[-400,20,470,'FRIEDENSBRÜCKE'],[-480,10,390,'WESTHAFEN']],
  jumps:[],clear:[[-1480,250,-760,440,'harbour']]},
 {id:'fraport',name:'Fraport Nachtflug',short:'Fraport',laps:4,tunnel:'',
  desc:'Flat out around the runway while jets land over your head. Long straights, an off-road piste through the Nordwestbahn construction site and a jump over the A5.',
  cp:[[-1900,5,1150,'TERMINAL 1'],[-2400,5,1130,'VORFELD'],[-2950,7,1120,'VORFELD'],[-3180,1.2,1250,'NORDWESTBAHN · PISTE'],[-3270,1.2,1390,'NORDWESTBAHN · PISTE'],[-3200,1.2,1530,'NORDWESTBAHN · PISTE'],[-2950,18,1760,'STARTBAHN WEST'],
   [-2450,16,1820,'STARTBAHN WEST'],[-1950,14,1790,'CARGO CITY'],[-1550,12,1680,'CARGO CITY'],[-1330,10,1470,'A5 · JUMP'],[-1380,8,1260,'GATEWAY GARDENS'],[-1600,6,1160,'TERMINAL 2']],
  jumps:[{id:'a5',name:'A5',kind:'pit',at:[-1440,1575],half:32,floor:-12,style:'autobahn',msg:'ONTO THE A5'}],clear:[[-3000,1270,-1650,1670,'runway']]},
 {id:'sky',name:'Skyline Spiral',short:'Skyline',laps:5,tunnel:'',gates:true,
  desc:'An elevated ring through the towers, up to 130 m high. Light gates, a dive into the Gallus and a gap between two skyscrapers.',
  cp:[[-300,60,-300,'TAUNUSANLAGE'],[-280,80,-600,'COMMERZBANK'],[-400,110,-950,'ESCHENHEIMER TURM'],[-700,130,-1100,'OPERNPLATZ'],[-1100,120,-1150,'WESTEND'],[-1300,100,-900,'WESTEND'],
   [-1250,90,-600,'MESSE-NORD'],[-1050,70,-420,'MAINZER LANDSTRASSE'],[-900,40,-200,'GALLUS-TAL'],[-650,20,-100,'BANKENVIERTEL'],[-450,40,-150,'TAUNUSANLAGE']],
  jumps:[{id:'turm',name:'HOCHHAUS',kind:'sky',at:[-900,-1125],half:36,msg:'INTO THE STREET'}],clear:[]},
 {id:'nord',name:'Nordend Nordschleife',short:'Nordschleife',laps:3,tunnel:'',
  desc:'A long, hilly run through the north: up the Bornheimer Hang to the Lohrberg viewpoint, down through Seckbach and a jump over the rail cutting.',
  cp:[[0,4,-1300,'NORDEND'],[500,6,-1350,'NORDEND'],[850,14,-1500,'BORNHEIM'],[950,26,-1800,'BORNHEIMER HANG'],[750,40,-2050,'LOHRBERG'],[350,48,-2150,'LOHRBERG · AUSSICHT'],[0,42,-2000,'LOHRBERG'],
   [-200,30,-1750,'SECKBACH'],[-500,24,-1950,'SECKBACH'],[-850,34,-2100,'HUTHPARK'],[-1100,20,-1850,'HUTHPARK'],[-1000,10,-1550,'PREUNGESHEIM'],[-650,6,-1450,'PREUNGESHEIM'],[-350,4,-1250,'NORDEND']],
  jumps:[{id:'gleis2',name:'BAHNEINSCHNITT',kind:'pit',at:[-1050,-1700],half:32,floor:-12,style:'rail',msg:'OVER THE RAILS'}],clear:[]},
 {id:'sachs',name:'Sachsenhausen Twister',short:'Twister',laps:4,tunnel:'',
  desc:'Short and twisty south of the Main: cider lanes, up the Lerchesberg to the Goetheturm and back through the Stadtwald. Drift every corner.',
  cp:[[200,6,1250,'SACHSENHAUSEN'],[600,8,1200,'SCHWEIZER STRASSE'],[900,12,1330,'LERCHESBERG'],[1000,24,1550,'LERCHESBERG'],[800,30,1760,'GOETHETURM'],[450,34,1810,'GOETHETURM'],[250,20,1620,'STADTWALD'],
   [-50,14,1760,'STADTWALD'],[-400,10,1720,'OBERRAD'],[-600,6,1480,'OBERRAD'],[-450,8,1250,'MÜHLBERG'],[-150,6,1150,'ÄPPELWOI-GASSE']],
  jumps:[],clear:[]}];
const TDF=TRACK_DEFS.slice();// the Frankfurt circuits: menus, career map and the Frankfurt daily use only these
// Athens circuits on real streets: cp = [e, n, height, sector] with e/n in metres from Monastiraki square (Nominatim), mapped per circuit x=(e-e0)*k, z=-(n-n0)*k
const ATH_TRACKS=[
 {id:'akro',city:'ath',name:'Akropolis Circuit',short:'Akropolis',laps:3,tunnel:'',mood:'athens',map:[1.6,0,-300],
  desc:'Around the sacred rock: Dionysiou Areopagitou under the Parthenon, down Apostolou Pavlou to Thiseio, a jump over the ISAP line, Ermou to Monastiraki and back through Plaka.',
  cp:[[250,-745,14,'DIONYSIOU AREOPAGITOU'],[40,-712,18,'DIONYSIOU AREOPAGITOU'],[-160,-690,22,'ODEON HERODES ATTICUS'],[-300,-668,24,'AREOPAGUS'],[-355,-612,28,'AREOPAGUS'],[-285,-560,36,'THEORIAS CLIMB'],[-205,-535,41,'PROPYLAEA HAIRPIN'],[-140,-508,44,'PROPYLAEA HAIRPIN'],[-140,-458,44,'PROPYLAEA HAIRPIN'],[-245,-445,39,'PROPYLAEA HAIRPIN'],[-380,-440,28,'APOSTOLOU PAVLOU'],[-500,-250,10,'APOSTOLOU PAVLOU'],
   [-555,-60,4,'THISEIO'],[-520,110,4,'THISEIO'],[-330,135,4,'ERMOU'],[-140,100,4,'ERMOU'],[40,60,4,'MONASTIRAKI'],[245,-15,4,'MITROPOLEOS'],[440,-80,6,'MITROPOLI'],[520,-230,8,'PLAKA'],[470,-420,12,'PLAKA · ADRIANOU'],
   [460,-600,14,'LYSICRATES'],[430,-735,14,'ACROPOLIS MUSEUM']],
  jumps:[{id:'isap',name:'ISAP',kind:'pit',at:[-552,-20],half:32,floor:-12,style:'rail',msg:'OVER THE ISAP LINE'}],clear:[]},
 {id:'synt',city:'ath',name:'Syntagma Sprint Loop',short:'Syntagma',laps:3,tunnel:'ΥΠΟΓΕΙΑ · OMONIA',mood:'athens',map:[1,700,200],
  desc:'Downtown sprint: Panepistimiou past the Academy, Syntagma and the Parliament, Amalias by the National Garden, Vasilissis Olgas, up to Kolonaki and back to Omonia.',
  cp:[[560,600,4,'PANEPISTIMIOU'],[730,350,4,'PANEPISTIMIOU'],[880,100,6,'SYNTAGMA'],[880,-110,6,'SYNTAGMA · PARLIAMENT'],[860,-290,8,'AMALIAS'],[760,-440,8,'AMALIAS · ZAPPEION'],[700,-560,8,"HADRIAN'S ARCH"],
   [860,-690,8,'VASILISSIS OLGAS'],[1060,-760,8,'VASILISSIS OLGAS'],[1220,-640,10,'IRODOU ATTIKOU'],[1320,-330,12,'MAXIMOS MANSION'],[1320,-110,12,'IRODOU ATTIKOU'],[1400,30,12,'KOLONAKI'],[1290,230,16,'SKOUFA'],
   [1080,520,12,'SKOUFA'],[870,760,8,'AKADIMIAS'],[600,1000,-6,'AKADIMIAS'],[340,1020,-24,'OMONIA · UNDERPASS'],[300,880,-24,'OMONIA · UNDERPASS'],[420,780,-8,'PANEPISTIMIOU']],
  jumps:[{id:'metro',name:'METRO',kind:'pit',at:[650,470],half:32,floor:-12,style:'rail',msg:'OVER THE METRO WORKS'}],clear:[]},
 {id:'kifi',city:'ath',name:'Kifisias Night Run',short:'Kifisias',laps:2,tunnel:'ΥΠΟΓΕΙΑ · AMBELOKIPI',mood:'athdusk',map:[.6,4500,2800],
  desc:'Evening run up Leoforos Kifisias to Chalandri: the Ambelokipi underpass, Psychiko and Filothei, back through Cholargos and down Mesogeion with a jump over the Periferiaki Ymittou.',
  cp:[[2960,1205,-12,'ALEXANDRAS · UNDERPASS'],[3158,1160,-28,'AMBELOKIPI · UNDERPASS'],[3330,1390,-28,'AMBELOKIPI · UNDERPASS'],[3533,1668,-6,'KIFISIAS'],[3696,2035,12,'PANORMOU FLYOVER'],[3813,2388,24,'KATECHAKI FLYOVER'],
   [4049,2652,18,'KIFISIAS FLYOVER'],[4237,2940,6,'FAROS FLYOVER'],[4425,3229,2,'FAROS PSYCHIKOU'],[4797,3759,10,'FILOTHEI'],[5232,4373,16,'KIFISIAS · FILOTHEI'],[5554,4889,16,'CHALANDRI'],[6000,4780,16,'CHALANDRI'],[6300,4600,16,'PLATEIA CHALANDRIOU'],
   [6150,4100,14,'CHOLARGOS'],[5800,3500,12,'CHOLARGOS'],[5400,2900,10,'ETHNIKI AMYNA'],[5100,2480,8,'MESOGEION'],[4500,1975,6,'MESOGEION · KATECHAKI'],[3900,1520,6,'MESOGEION'],[3400,1150,4,'MESOGEION'],
   [3061,990,4,'ATHENS TOWER'],[2860,820,4,'AMBELOKIPI'],[2650,900,4,'AMBELOKIPI'],[2700,1120,4,'ALEXANDRAS']],
  jumps:[{id:'ymit',name:'PERIFERIAKI',kind:'pit',at:[4560,2020],half:32,floor:-12,style:'autobahn',msg:'OVER THE PERIFERIAKI YMITTOU'}],clear:[]},
 {id:'pana',city:'ath',name:'Panathenaic Stadium Finale',short:'Kallimarmaro',laps:3,tunnel:'',mood:'golden',map:[.9,1000,200],stadium:[1325,-880],
  desc:'The finale: start inside the marble Kallimarmaro, out along Olgas and Amalias, Mitropoleos, Athinas to Omonia, Panepistimiou, Vasilissis Sofias to the Hilton and Konstantinou back into the stadium for the hairpin.',
  cp:[[1265,-820,4,'PANATHENAIC STADIUM'],[1265,-750,4,'KALLIMARMARO'],[1215,-690,4,'KALLIMARMARO'],[1110,-715,4,'VASILISSIS OLGAS'],[960,-745,6,'VASILISSIS OLGAS'],[720,-600,6,'AMALIAS'],[850,-330,6,'AMALIAS'],
   [800,-150,6,'SYNTAGMA'],[600,-100,4,'MITROPOLEOS'],[330,-45,4,'MITROPOLEOS'],[90,40,4,'MONASTIRAKI'],[120,330,4,'ATHINAS'],[170,640,4,'ATHINAS · VARVAKIOS'],[190,860,4,'OMONIA'],[300,930,4,'OMONIA'],
   [440,790,4,'PANEPISTIMIOU'],[680,440,6,'PANEPISTIMIOU'],[890,120,8,'SYNTAGMA'],[1100,-10,10,'VASILISSIS SOFIAS'],[1520,-80,12,'VASILISSIS SOFIAS'],[1900,25,12,'EVANGELISMOS'],[2150,30,12,'HILTON'],[2280,-80,12,'HILTON'],
   [2140,-200,10,'VAS. KONSTANTINOU'],[1844,-200,8,'VAS. KONSTANTINOU'],[1560,-460,6,'VAS. KONSTANTINOU'],[1440,-600,4,'KALLIMARMARO'],[1385,-720,4,'PANATHENAIC STADIUM'],[1385,-870,4,'PANATHENAIC STADIUM'],
   [1367,-922,4,'SPHENDONE'],[1325,-942,4,'SPHENDONE'],[1283,-922,4,'SPHENDONE'],[1265,-870,4,'PANATHENAIC STADIUM']],
  jumps:[{id:'athinas',name:'ATHINAS',kind:'pit',at:[135,420],half:32,floor:-12,style:'rail',msg:'OVER THE METRO'}],clear:[]}];
const ATH_TH={akro:{w:38,bank:.35,mood:'athgold',road:'marble',wall:['#efe4cc','#b5643c'],tree:'olive',neo:.55,haz:'drum',traf:.6},
 synt:{w:60,bank:.5,mood:'athnoon',road:'tram',wall:['#f6f3ec','#0d5eaf'],tree:'palm',neo:.32,haz:'tram',traf:1},
 kifi:{w:52,bank:.5,mood:'athnight',road:'asph',wall:['#c8d0d8','#ff2d95'],tree:'plane',neo:.04,office:.55,villa:1,neon:1,traf:1.8},
 pana:{w:46,bank:.6,mood:'athdusk',road:'marble',wall:['#f8f5ee','#d8b86a'],tree:'cypress',neo:.1,fire:1,traf:.8}};
for(const t of ATH_TRACKS)Object.assign(t,ATH_TH[t.id]);
const athW=(t,e,n)=>[(e-t.map[1])*t.map[0],-(n-t.map[2])*t.map[0]];// real e,n → race world x,z for an Athens circuit
for(const t of ATH_TRACKS){t.cp=t.cp.map(([e,n,y,nm])=>{const[x,z]=athW(t,e,n);return[x/S,y,z/S,nm]});for(const j of t.jumps){const[x,z]=athW(t,...j.at);j.at=[x/S,z/S]}TRACK_DEFS.push(t)}
const ATH_IDS=ATH_TRACKS.map(t=>t.id),isAthT=id=>ATH_IDS.includes(id);
// Athens tracks open with the city: in Athens, after 4 Frankfurt flags, or with the preview flag
const athOpen=()=>{if(ALL_OPEN||CID==='ath')return true;try{if(localStorage.getItem('mho_athpre')==='1')return true}catch(e){}const F=flagsR();return RIVAL_EV.filter(e=>F[e.p]).length>=4};
// Athens rivals race the circuits from the World tab; Drakos waits in the Kallimarmaro
const ATH_PD=[{n:'PAPPAS',full:'Yiannis Pappas',flag:'🇬🇷',team:'zeil',style:'showman',r:.1},{n:'LAMBROU',full:'Katerina Lambrou',flag:'🇬🇷',team:'kronos',style:'clean',r:.25},{n:'KOSTA',full:'Dimitra Kosta',flag:'🇬🇷',team:'ostend',style:'aggressor',r:.4},
 {n:'VLACHOS',full:'Leonidas Vlachos',flag:'🇬🇷',team:'nordend',style:'aggressor',r:.55},{n:'ANTONIOU',full:'Marios Antoniou',flag:'🇬🇷',team:'helix',style:'gunner',r:.7},{n:'GALANI',full:'Sofia Galani',flag:'🇬🇷',team:'aeppler',style:'clean',r:.85}];
for(const p of ATH_PD)PD[p.n]=PD[p.n]||p;PD.DRAKOS=PD.DRAKOS||{n:'DRAKOS',full:'Thanos Drakos',flag:'🏴',team:'shadow',style:'aggressor',r:1};
const ATH_TRK_EV=[{p:'PAPPAS',track:'akro',mood:'athens',sig:'boost',line:'Welcome to Athens! Try to keep up under the Parthenon.'},{p:'LAMBROU',track:'synt',mood:'athens',sig:'shield',line:'I know every lane from Omonia to Syntagma.'},
 {p:'KOSTA',track:'akro',mood:'golden',sig:'mines',line:'Plaka is my delivery zone. Mind the parcels.'},{p:'VLACHOS',track:'synt',mood:'athdusk',sig:'ram',line:'Trolleys do not brake. Neither do I.'},
 {p:'ANTONIOU',track:'pana',mood:'golden',sig:'missile',line:'Kolonaki money buys the best missiles.'},{p:'GALANI',track:'kifi',mood:'athdusk',sig:'rail',line:'Kifisias at night is a rally stage. My stage.'}];
const ATH_BOSS_EV={p:'DRAKOS',track:'pana',mood:'athdusk',sig:'boss',need:5,boss:1,line:'A tourist in my stadium? The Akropolis Cup never leaves my hands.'};
const DRAKOS_LINES=['Athens belongs to the Schattenwerk.','Enjoy the view of the Parthenon. From behind.','My stadium, my rules.','The Akropolis Cup is MINE.','Go home, tourist.'];
const athNF=F=>ATH_TRK_EV.filter(e=>F[e.p]).length;
let TRK=TRACK_DEFS[0],CP=TRK.cp;
// Light and weather presets. sky: top/mid/horizon/below-horizon colours (linear), sun glow, stars, milky band, moon, clouds
const MOODS=[
 {id:'night',wet:0.55,name:'Neon Night',de:'Nacht',top:[.016,.012,.05],mid:[.07,.04,.17],hor:[.30,.10,.34],gnd:[.03,.02,.06],sun:[0,0,0],star:1,band:1,moon:1,cloud:0,
  fog:'#1c1030',fogD:.00042,hemi:['#6a5ab0','#180e2c',.6],key:['#c9d2ff',.45,[-400,600,-300]],exp:1.12,bloom:[.95,.6],win:1,rain:[1200,.22,140,.3],road:[.42,.3,1],env:.8,lamps:1},
 {id:'dawn',wet:0.18,name:'Dawn',de:'Morgengrauen',top:[.05,.08,.22],mid:[.38,.28,.4],hor:[1.15,.5,.28],gnd:[.07,.05,.07],sun:[1.6,.72,.3],star:.25,band:.15,moon:.35,cloud:0,
  fog:'#8a6450',fogD:.00030,hemi:['#e8c8b0','#3a2030',1.05],key:['#ffb070',1.45,[700,170,-900]],exp:1.0,bloom:[.7,.55],win:.5,rain:[0,0,0,0],road:[.38,.3,1.2],env:1.15,lamps:.35},
 {id:'storm',wet:1.15,name:'Storm',de:'Gewitter',top:[.008,.01,.02],mid:[.03,.035,.06],hor:[.09,.08,.14],gnd:[.02,.02,.03],sun:[0,0,0],star:0,band:0,moon:0,cloud:1,
  fog:'#151b2b',fogD:.00072,hemi:['#4a5a80','#10141c',.5],key:['#9fb0ff',.3,[-300,600,-200]],exp:1.16,bloom:[1.0,.6],win:1.1,rain:[2400,.4,240,1.6],road:[.14,.62,1.7],env:.75,lamps:1,lightning:true},
 {id:'fog',wet:0.45,name:'Fog',de:'Nebel',top:[.05,.045,.1],mid:[.13,.1,.2],hor:[.24,.18,.3],gnd:[.12,.09,.17],sun:[0,0,0],star:.12,band:.08,moon:.3,cloud:0,
  fog:'#6a5b80',fogD:.0021,hemi:['#8a7aa8','#2a2036',.85],key:['#c9d2ff',.3,[-400,600,-300]],exp:1.08,bloom:[1.3,.85],win:.9,rain:[500,.1,90,.2],road:[.3,.35,1],env:.8,lamps:1.3}];
MOODS.push({id:'brick',wet:0,name:'Brick Day',de:'Sonnig',top:[.07,.33,.98],mid:[.30,.60,1.0],hor:[.80,.90,1.0],gnd:[.34,.40,.30],sun:[2.4,2.2,1.8],star:0,band:0,moon:0,cloud:0,
  fog:'#d6e6f8',fogD:.0002,hemi:['#fff8ee','#6f8a52',.8],key:['#fff2dc',2.5,[500,800,300]],exp:.98,bloom:[.03,.4],win:0,rain:[0,0,0,0],road:[.6,.1,.6],env:.4,lamps:0});
if(CID==='ath')MOODS.push({...MOODS.find(m=>m.id==='brick'),id:'athens',name:'Attic Sun',de:'Attische Sonne',sun:[2.7,2.35,1.7],hor:[.98,.9,.76],mid:[.36,.62,.98],top:[.09,.36,.96],gnd:[.42,.40,.30],fog:'#efe2c8',hemi:['#fff4e0','#9a8a5a',.8],key:['#fff0d6',2.6,[500,800,300]]});
MOODS.push({id:'day',wet:0,name:'Day',de:'Tag',top:[.16,.38,.92],mid:[.42,.64,1.0],hor:[.92,.9,.86],gnd:[.32,.32,.3],sun:[2.6,2.3,1.8],star:0,band:0,moon:0,cloud:0,
  fog:'#c4d8ee',fogD:.0003,hemi:['#fff6ea','#6b6458',.8],key:['#fff2dc',2.5,[400,700,250]],exp:.98,bloom:[.04,.45],win:0,rain:[0,0,0,0],road:[.6,.1,.6],env:1.1,lamps:0});
MOODS.push({id:'golden',wet:0,name:'Golden Hour',de:'Abendsonne',top:[.10,.22,.62],mid:[.38,.48,.86],hor:[1.0,.72,.52],gnd:[.3,.28,.26],sun:[1.1,.75,.42],star:0,band:0,moon:0,cloud:0,
  fog:'#d8c4c0',fogD:.00022,hemi:['#e8ecff','#7a6a5a',1.35],key:['#ffe2c0',2.4,[600,430,-500]],exp:1.0,bloom:[.3,.5],win:.35,rain:[0,0,0,0],road:[.55,.15,.7],env:1.0,lamps:.4});
const ATHM=(()=>{const b=MOODS.find(m=>m.id==='brick'),A=MOODS.find(m=>m.id==='athens')||{...b,id:'athens',name:'Attic Sun',de:'Attische Sonne',sun:[2.7,2.35,1.7],hor:[.98,.9,.76],mid:[.36,.62,.98],top:[.09,.36,.96],gnd:[.42,.40,.30],fog:'#efe2c8',hemi:['#fff4e0','#9a8a5a',.8],key:['#fff0d6',2.6,[500,800,300]]};
 const D={...b,id:'athdusk',name:'Attic Dusk',de:'Abenddämmerung',top:[.04,.05,.17],mid:[.32,.26,.42],hor:[1.0,.5,.28],gnd:[.07,.05,.06],sun:[1.5,.62,.24],star:.4,band:.12,moon:.6,fog:'#7a5a4a',fogD:.00036,hemi:['#e0c0a0','#3a2830',.9],key:['#ffb07a',1.2,[700,160,-900]],exp:1.06,bloom:[.8,.55],win:.85,road:[.4,.28,1.1],env:1,lamps:1};
 const G={...b,id:'athgold',name:'Attic Gold',de:'Goldenes Licht',top:[.12,.26,.66],mid:[.45,.52,.8],hor:[1.05,.74,.45],gnd:[.3,.26,.2],sun:[1.5,.95,.45],fog:'#e2c49a',fogD:.00042,hemi:['#ffe2b8','#7a5a38',1.05],key:['#ffcf90',2.3,[600,380,-500]],exp:.94,bloom:[.32,.5],win:.15,lamps:.2,env:1},
 N2={...b,id:'athnoon',name:'Attic Noon',de:'Mittag',top:[.05,.3,.98],mid:[.34,.6,1],hor:[.95,.95,.92],gnd:[.42,.42,.38],sun:[3,2.8,2.4],fog:'#f2f0ea',fogD:.00032,hemi:['#ffffff','#a09880',1.55],key:['#ffffff',3.3,[200,1000,150]],exp:1.02,bloom:[.12,.4],win:0,lamps:0},
 K={...MOODS.find(m=>m.id==='night'),id:'athnight',name:'Attic Night',de:'Athener Nacht',wet:.25,top:[.01,.012,.04],mid:[.03,.035,.09],hor:[.17,.1,.2],gnd:[.02,.02,.03],fog:'#151628',fogD:.00042,hemi:['#5a6aa0','#141020',.6],key:['#c9d2ff',.42,[-400,600,-300]],exp:1.15,bloom:[.9,.6],win:1,rain:[0,0,0,0],road:[.36,.34,1.1],env:.8,lamps:1};
 if(CID==='ath')MOODS.push(D,G,N2,K);return[A,D,G,N2,K]})();
let MOOD=MOODS[0];
const RIVER=[450*S,750*S];
const BRANDS=[['KRONOS BANK','IHR LEBEN. UNSERE ZINSEN.','#f5c20c','#ff2d95'],['HELIX FINANZ','SCHULDEN SIND FREIHEIT','#22e4ff','#8c55ff'],['ÄPPLER','EBBELWOI 3.0','#36d17a','#ffd12c'],['VANTA-X','NEURAL LINK · 0% ZINS','#ff2d95','#22e4ff'],
 ['DATENHAFEN','DEINE DATEN, UNSER HAFEN','#8c55ff','#4ceaff'],['NORDEND','FREIGHT · 24/7','#ff7a1c','#ffd12c'],['NEUROWARE','THINK FASTER','#4ceaff','#ff2d95'],['MESSE 2099','ALLES IST ZU VERKAUFEN','#ffd12c','#ff3b55']];
const VSIGNS=['HOTEL','BAR','KIOSK','SPÄTI','ZEIL','APFELWEIN','IMBISS','U-BAHN','NEON','CASINO','SUSHI','DATEN'];
const ITEMS={emp:{name:'EMP',col:'#4ceaff'},rail:{name:'RAIL GUN',col:'#e8f3ff'},turbo:{name:'TURBO',col:'#ffc23d'},rockets:{name:'ROCKETS',col:'#ff5a2d'},missile:{name:'MISSILE',col:'#c15bff'},mines:{name:'MINES',col:'#ff2a3a'},shield:{name:'SHIELD',col:'#31f5c4'},tornado:{name:'TORNADO',col:'#b48cff'},wall:{name:'BRICK WALL',col:'#ff8a3c'},storm:{name:'STORM',col:'#fff27a'},magnet:{name:'MAGNET',col:'#ff3b6b'},oil:{name:'OIL SLICK',col:'#5dffb0'}};
const ITEM_KEYS=Object.keys(ITEMS);
const ICON={};function itemIcon(k){if(ICON[k])return ICON[k];const[c,g]=cv(96,96),col=ITEMS[k].col;g.translate(48,48);g.lineCap=g.lineJoin='round';g.shadowColor=col;g.shadowBlur=14;g.strokeStyle=col;g.fillStyle=col;g.lineWidth=6;
  const P=(pts)=>{g.beginPath();pts.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath()};
  if(k==='turbo'){for(const o of[-14,6])P([[o-12,-22],[o+10,0],[o-12,22],[o-4,0]]),g.fill()}
  else if(k==='rockets'){for(const o of[-20,0,20]){P([[o,-30],[o+7,-16],[o+7,18],[o-7,18],[o-7,-16]]);g.fill();g.fillStyle='#ffd27a';P([[o-5,20],[o,32],[o+5,20]]);g.fill();g.fillStyle=col}}
  else if(k==='missile'){g.rotate(-.6);P([[0,-34],[9,-18],[9,20],[16,30],[-16,30],[-9,20],[-9,-18]]);g.fill();g.rotate(.6);g.lineWidth=3;g.beginPath();g.arc(20,-20,12,0,7);g.moveTo(20,-36);g.lineTo(20,-4);g.moveTo(4,-20);g.lineTo(36,-20);g.stroke()}
  else if(k==='mines'){g.beginPath();g.arc(0,0,18,0,7);g.fill();for(let i=0;i<8;i++){const a=i*Math.PI/4;g.beginPath();g.moveTo(Math.cos(a)*16,Math.sin(a)*16);g.lineTo(Math.cos(a)*30,Math.sin(a)*30);g.stroke()}g.fillStyle='#fff';g.beginPath();g.arc(-5,-5,5,0,7);g.fill()}
  else if(k==='shield'){P([[0,-34],[28,-22],[24,12],[0,34],[-24,12],[-28,-22]]);g.globalAlpha=.35;g.fill();g.globalAlpha=1;g.stroke()}
  else if(k==='emp'){g.lineWidth=4;for(const r of[14,26,36]){g.globalAlpha=r===36?.5:1;g.beginPath();g.arc(0,0,r,0,7);g.stroke()}g.globalAlpha=1;P([[4,-16],[-8,3],[1,3],[-4,16],[8,-3],[-1,-3]]);g.fillStyle='#fff';g.fill()}
  else if(k==='rail'){g.lineWidth=5;g.beginPath();g.moveTo(-34,0);g.lineTo(34,0);g.stroke();g.lineWidth=2;g.strokeStyle='#fff';for(let x=-30;x<=30;x+=12){g.beginPath();g.ellipse(x,0,4,13,0,0,7);g.stroke()}}
  else if(k==='tornado'){g.lineWidth=5;for(let i=0;i<5;i++){g.beginPath();g.ellipse((i%2?4:-4),-26+i*13,30-i*5,6,0,0,7);g.stroke()}}
  else if(k==='wall'){for(let r=0;r<3;r++)for(let i=-1;i<2;i++){const x=i*22+(r%2?11:0)-11;if(x>30)continue;g.fillRect(x-10,-30+r*21,20,17)}}
  else if(k==='storm'){P([[8,-38],[-16,4],[-2,4],[-10,38],[18,-8],[3,-8],[14,-38]]);g.fill()}
  else if(k==='magnet'){g.lineWidth=13;g.beginPath();g.moveTo(-20,-30);g.lineTo(-20,2);g.arc(0,2,20,Math.PI,0,true);g.lineTo(20,-30);g.stroke();g.fillStyle='#fff';g.fillRect(-27,-36,14,11);g.fillRect(13,-36,14,11)}
  else if(k==='oil'){g.beginPath();g.ellipse(0,14,32,14,0,0,7);g.fill();g.fillStyle='#fff';g.globalAlpha=.6;g.beginPath();g.ellipse(-10,10,8,3,0,0,7);g.fill();g.globalAlpha=1;g.fillStyle=col;for(const[x,y]of[[-14,-20],[10,-28]]){g.beginPath();g.arc(x,y,7,0,7);g.fill()}}
  return ICON[k]=c.toDataURL()}
let itemSpinUntil=0,itemShown='';
const EVENTS=[
 {id:'e1',mood:'night',name:'After Hours',sub:'Rookie · 3 laps',type:'race',cls:'rookie',laps:3,traffic:16,items:true,aggr:0,
  goal:'Your first night shift. Win the race. Boost refills as you drive (drifts and air fill it faster), then hold <b>Shift</b>. Keep speed up for the two jumps.',med:'place',m:[1,3,5]},
 {id:'e2',mood:'dawn',name:'Rush Hour',sub:'Pro · 2 laps · no weapons',type:'race',cls:'pro',laps:2,traffic:46,items:false,aggr:0,
  goal:'No weapons on this run. Boost refills as you drive; drifts and air fill it faster. SMASH rivals into the walls.',med:'place',m:[1,2,4]},
 {id:'e3',mood:'fog',name:'Bridge Closed',sub:'Pro · time attack · 1 lap',type:'tt',cls:'pro',laps:1,traffic:10,items:false,aggr:0,
  goal:'The Flößerbrücke is down. Jump the Main, then the rail yard. Beat the clock: <b>gold 1:03 · silver 1:07 · bronze 1:12</b>.',med:'time',m:[63,67,72]},
 {id:'e4',mood:'storm',name:'Last Train',sub:'Pro · eliminator',type:'elim',cls:'pro',laps:99,traffic:12,items:true,aggr:.2,
  goal:'Every 20 seconds the craft in last place is shut down. Be the last one flying.',med:'place',m:[1,2,3]},
 {id:'e5',mood:'night',name:'Takedown Frenzy',sub:'Pro · 2 laps · takedowns',type:'race',cls:'pro',laps:2,traffic:16,items:true,aggr:.35,
  goal:'Pin rivals against the wall, ram them while boosting, or barrel-roll into them. <b>Takedowns</b>: gold 5 · silver 3 · bronze 1. You must finish.',med:'takedowns',m:[5,3,1]},
 {id:'e6',mood:'storm',name:'Night Finale',sub:'Elite · 3 laps · aggressive rivals',type:'race',cls:'elite',laps:3,traffic:18,items:true,aggr:.45,
  goal:'The final. Elite speed and rivals who sideswipe. Win it.',med:'place',m:[1,2,3]}];

/* ============================================================ 2 · renderer & post */
const canvas=$('#c');
let renderer;
try{renderer=new THREE.WebGLRenderer({canvas,antialias:false,stencil:true,powerPreference:'high-performance'})}catch(e){$('#loading').textContent='THIS BROWSER CANNOT RUN WEBGL';throw e}
renderer.debug.checkShaderErrors=false;renderer.toneMapping=THREE.NeutralToneMapping;renderer.toneMappingExposure=1.12;
const scene=new THREE.Scene();
const FOGC=new THREE.Color('#1c1030');scene.fog=new THREE.FogExp2(FOGC,0.00042);
const camera=new THREE.PerspectiveCamera(64,1,.4,9000);scene.add(camera);
let lowGfx=matchMedia('(pointer:coarse)').matches;
// adaptive difficulty: rating -1..1 moves after each race; AI pace = setting x (1 +- 6%)
const adaptR=()=>store.get('mho_adapt',0),adaptMul=()=>SET.adapt==='off'?1:1+.06*adaptR(),diffMul=()=>({relaxed:.93,normal:1,hard:1.06}[SET.diff]||1)*adaptMul();
function adaptAfter(place,n,margin){if(n<2)return;let d=place===1?(margin>4?.3:.15):place<=3?.05:place>=Math.max(4,Math.ceil(n*.6))?-.25:-.1;const r=clamp(adaptR()+d,-1,1);store.set('mho_adapt',+r.toFixed(2));return r}
const SET_DEF={cc:'full',perf:false,dres:lowGfx?'on':'off',res:lowGfx?'sharp':'auto',thr:'city',q:lowGfx?'med':'high',fx:'full',fov:'normal',camd:'normal',vol:.8,mus:.6,sfx:.9,diff:'normal',adapt:'on',rcam:'chase',steer:'normal',units:'kph',touch:'buttons',assist:'on',tiltInv:'off',sens:3};
const SET=Object.assign({},SET_DEF,store.get('mho_set',{}));if(!SET.thrV){SET.thr='city';SET.thrV=1}SET.touch='buttons';const thrEff=()=>SET.thr==='city'?(state==='roam'?'pedal':'auto'):SET.thr;const saveSet=()=>store.set('mho_set',SET);
const fxK=()=>({full:1,reduced:.4,off:0})[SET.fx];let rainScale=1;
const rt=new THREE.WebGLRenderTarget(16,16,{type:THREE.HalfFloatType,stencilBuffer:true,samples:SET.q==='high'?4:0});
const composer=new EffectComposer(renderer,rt);
composer.addPass(new RenderPass(scene,camera));
const SCRUB=new ShaderPass({uniforms:{tDiffuse:{value:null}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:'uniform sampler2D tDiffuse;varying vec2 vUv;float ok(float x){return (x>=0.&&x<=256.)?x:(x>256.?256.:0.);}void main(){vec4 c=texture2D(tDiffuse,vUv);gl_FragColor=vec4(ok(c.r),ok(c.g),ok(c.b),1.);}'});
composer.addPass(SCRUB);
// only what is brighter than 1.0 in HDR blooms: unlit neon (toneMapped:false, colour pushed above 1), road glow lines, engine cores
const bloom=new UnrealBloomPass(new THREE.Vector2(512,512),.95,.6,1.0);composer.addPass(bloom);
// grade (HDR, before tone mapping) · radial speed blur with RGB split · vignette · grain · flash
const FX=new ShaderPass({defines:{TAPS:lowGfx?5:9},uniforms:{tDiffuse:{value:null},uSpeed:{value:0},uBoost:{value:0},uCA:{value:0},uTime:{value:0},uFlash:{value:0},uHit:{value:0},uMirror:{value:0}},
  vertexShader:'varying vec2 vUv0;void main(){vUv0=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:`uniform sampler2D tDiffuse;uniform float uSpeed,uBoost,uCA,uTime,uFlash,uHit,uMirror;varying vec2 vUv0;
  float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
  vec3 grade(vec3 c){c=c*vec3(1.03,1.0,.99);c=max(c,0.);float l=dot(c,vec3(.2126,.7152,.0722));c=mix(vec3(l),c,1.3);c=(c-.18)*1.1+.18;return max(c,0.);}
  void main(){vec2 vUv=vec2(uMirror>.5?1.-vUv0.x:vUv0.x,vUv0.y);vec2 d=vUv-vec2(.5,.47);vec2 dq=vec2(d.x,d.y*.62);float r=length(dq)*1.35;float edge=smoothstep(.1,.85,r);
    float k=(uSpeed*uSpeed*.05+uBoost*.05)*edge;float ab=.0011*(.3+uSpeed*.7+uBoost)*r+uCA*r*r;
    vec3 col=vec3(0.);if(k*length(d)<.0004)col=vec3(texture2D(tDiffuse,vUv+d*ab).r,texture2D(tDiffuse,vUv).g,texture2D(tDiffuse,vUv-d*ab).b);else{for(int i=0;i<TAPS;i++){float t=float(i)/float(TAPS-1);vec2 uv=vUv-d*k*t;col+=vec3(texture2D(tDiffuse,uv+d*ab).r,texture2D(tDiffuse,uv).g,texture2D(tDiffuse,uv-d*ab).b);}col/=float(TAPS);}
    col=grade(col);col*=1.-.32*smoothstep(.28,1.,r*1.3)-uBoost*.12*smoothstep(.4,1.,r);col+=uHit*vec3(.32,0.,.05)*smoothstep(.45,1.,r);
    col+=uFlash*vec3(.5,.6,.9)*.3;col+=(h(vUv*vec2(1733.,997.)+uTime)-.5)*.018;gl_FragColor=vec4(col,1.);}`});
composer.addPass(FX);{const bs=bloom.setSize.bind(bloom);bloom.setSize=(w,h)=>bs(Math.max(64,Math.round(w*(lowGfx?.5:1))),Math.max(64,Math.round(h*(lowGfx?.5:1))))}
composer.addPass(new OutputPass());
const SPRSCALE={value:400};
const pFov=f=>{const a=camera.aspect;return a<.9?Math.min(100,f*(1+.5*Math.min(1,(.9-a)/.45))):f};
const DPR2=()=>Math.min(devicePixelRatio||1,2);
// dynamic resolution: average frame time >22 ms over 2 s steps the pixel ratio down (floor .75), <15 ms steps it back up
const DRES={s:1,t:0,n:0,sum:0,sq:0,skip:0};function dresStep(ms){if(SET.dres!=='on'||paused||document.hidden||!(state==='roam'||state==='race'||state==='countdown')||ms>150||ms<=0){DRES.t=DRES.n=DRES.sum=DRES.sq=0;return}DRES.t+=ms;DRES.sum+=ms;DRES.sq+=ms*ms;DRES.n++;if(DRES.t<2000)return;const a=DRES.sum/DRES.n,sd=Math.sqrt(Math.max(0,DRES.sq/DRES.n-a*a)),cap30=Math.abs(a-33.3)<3&&sd<4;DRES.t=DRES.n=DRES.sum=DRES.sq=0;if(DRES.skip>0){DRES.skip--;return}
  // a steady ~33 ms is the browser's 30 fps cap (iOS low power mode), not the GPU struggling: keep the resolution
  const s=a>22&&!cap30?Math.max(.6,DRES.s-.15):a<15||cap30&&DRES.s<1?Math.min(1,DRES.s+.1):DRES.s;if(s!==DRES.s){const p0=renderer.getPixelRatio();DRES.s=s;resize();if(renderer.getPixelRatio()===p0&&a>22)DRES.s=s+.15;DRES.skip=1}}
function resize(){const w=innerWidth,h=innerHeight;const cap={std:1.5,sharp:2,max:3}[SET.res]||{low:1,med:1.5,high:2}[SET.q],bud=lowGfx?3.4e6:2.8e6;let pr=Math.min(devicePixelRatio||1,cap);if(w*h*pr*pr>bud)pr=Math.sqrt(bud/(w*h));if(SET.dres==='on'&&DRES.s<1)pr=Math.max(Math.min(pr,1),pr*DRES.s);renderer.setPixelRatio(pr);renderer.setSize(w,h,false);composer.setPixelRatio(pr);composer.setSize(w,h);bloom.resolution.set(w*pr/2,h*pr/2);SPRSCALE.value=h*pr*.5/Math.tan(THREE.MathUtils.degToRad(34));camera.aspect=w/h;camera.updateProjectionMatrix()}
addEventListener('resize',resize);resize();
const hemi=new THREE.HemisphereLight(0x6a5ab0,0x180e2c,.6);scene.add(hemi);
const moonL=new THREE.DirectionalLight(0xc9d2ff,.45);moonL.position.set(-400,600,-300);scene.add(moonL);
const shipKey=new THREE.PointLight(0xe4ecff,70,40,2);scene.add(shipKey);
const glowCol=(hex,k=2.2)=>new THREE.Color(hex).multiplyScalar(k);            // HDR colour for bloomed neon
const neonMat=(hex,k=2.2,extra={})=>new THREE.MeshBasicMaterial({color:glowCol(hex,k),toneMapped:false,...extra});

/* ============================================================ 3 · sky */
const SKY_VS='varying vec3 vD;void main(){vD=normalize(position);vec4 p=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*p;gl_Position.z=gl_Position.w;}';
const SKY_FS=`varying vec3 vD;uniform float uT,uStar,uBand,uMoon,uLit,uCloud;uniform vec3 uTop,uMid,uHor,uGround,uSun;
float hash(vec3 p){p=fract(p*.3183099+.1);p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float n3(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fbm(vec3 p){float a=.5,s=0.;for(int i=0;i<4;i++){s+=a*n3(p);p*=2.03;a*=.5;}return s;}
float stars(vec3 d,float K,float th){vec3 p=d*K;vec3 id=floor(p);vec3 f=fract(p)-.5;float h=hash(id);if(h<th)return 0.;vec3 o=vec3(hash(id+1.3),hash(id+2.7),hash(id+4.1))-.5;float r=length(f-o*.6);float w=fwidth(r)*1.5+.02;return smoothstep(w+.06,.0,r)*(.5+.5*sin(uT*(1.5+h*3.)+h*40.))*(h-th)/(1.-th);}
void main(){vec3 d=normalize(vD);float h=d.y;vec3 top=uTop,mid=uMid,hor=uHor;
  vec3 c=mix(hor,mid,smoothstep(0.,.16,h));c=mix(c,top,smoothstep(.1,.7,h));if(h<0.)c=mix(hor,uGround,smoothstep(0.,.07,-h));
  if(h>0.){float bd=dot(d,normalize(vec3(.35,.55,-.76)))*3.2;float band=exp(-bd*bd);float dust=fbm(d*6.);c+=vec3(.16,.09,.28)*band*(.4+dust)*smoothstep(0.,.25,h)*uBand;
    float st=stars(d,95.,.93)+stars(d,190.,.965)*.7;c+=vec3(1.,.95,1.)*st*1.6*smoothstep(0.,.18,h)*uStar;
    vec3 md=normalize(vec3(-.42,.62,-.66));float sd=dot(d,md);float disc=smoothstep(.99958,.9997,sd);float cr=fbm(d*180.);c+=(vec3(.95,.93,1.)*disc*(1.6-cr*.8)+vec3(.55,.6,1.)*(pow(max(sd,0.),900.)*.5+pow(max(sd,0.),60.)*.07))*uMoon;}
  vec3 sn=normalize(vec3(.6,.06,-.8));float sg=max(dot(d,sn),0.);c+=uSun*(pow(sg,48.)*2.+pow(sg,5.)*.3)*smoothstep(-.06,.12,h);
  if(uCloud>0.){float cl=smoothstep(.42,.78,fbm(d*vec3(2.4,5.,2.4)+vec3(uT*.012,0.,uT*.02)))*smoothstep(-.02,.2,h)*uCloud;c=mix(c,vec3(.035,.04,.06)+vec3(.5,.55,.8)*uLit*.6,cl*.85);}
  c+=vec3(.45,.5,.8)*uLit*.35*smoothstep(-.1,.4,h);
  gl_FragColor=vec4(c,1.);}`;
const V=(r,g,b)=>new THREE.Vector3(r,g,b);
const SKYU={uT:{value:0},uTop:{value:V(.016,.012,.05)},uMid:{value:V(.07,.04,.17)},uHor:{value:V(.30,.10,.34)},uGround:{value:V(.03,.02,.06)},uSun:{value:V(0,0,0)},uStar:{value:1},uBand:{value:1},uMoon:{value:1},uLit:{value:0},uCloud:{value:0}};
const skyMat=new THREE.ShaderMaterial({vertexShader:SKY_VS,fragmentShader:SKY_FS,uniforms:SKYU,side:THREE.BackSide,depthWrite:false,fog:false,extensions:{derivatives:true}});
const sky=new THREE.Mesh(new THREE.SphereGeometry(8000,48,24),skyMat);sky.frustumCulled=false;sky.renderOrder=-1;scene.add(sky);sky.onBeforeRender=(r,sc,cam)=>{sky.position.copy(cam.position);sky.updateMatrixWorld()};
// reflections: a prefiltered environment of the sky plus a ring of neon so metal and wet road pick up the city colours
const ENVSC=new THREE.Scene();(function(){const env=ENVSC;env.add(new THREE.Mesh(new THREE.SphereGeometry(100,32,16),new THREE.ShaderMaterial({vertexShader:SKY_VS,fragmentShader:SKY_FS,uniforms:SKYU,side:THREE.BackSide,depthWrite:false})));
  const cols=['#ff2d95','#22e4ff','#ffb46a','#8c55ff','#4ceaff'];for(let i=0;i<40;i++){const a=i/40*Math.PI*2,h=rr(4,26);const m=new THREE.Mesh(new THREE.BoxGeometry(rr(4,10),h,1),new THREE.MeshBasicMaterial({color:glowCol(cols[i%5],rr(.6,1.6))}));m.position.set(Math.cos(a)*80,h/2-8,Math.sin(a)*80);m.lookAt(0,m.position.y,0);env.add(m)}
})();
