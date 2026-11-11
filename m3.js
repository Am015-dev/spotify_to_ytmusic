// ===== M3 "Kaisers Schatten" + "Das Finale": Frankfurt chapters 3 and 4 and the Vex Kaiser boss chase, built on the m1.js mission system.
// Gated on the chapter-2 flag M1.s.M2_done (written by the chapter-2 module); dev unlock: __m3.unlock() or ?m3dev in the URL.
// Missions are registered into M1_DEF / M1_SC / M1_END and run on the M1 stage engine; M1 functions are extended by re-binding only.
// New stage type 'heat' (police heat, hide in a car wash); new race opponents (rivals with weapons, S-Bahn, cargo jet); Rocket Hop ability
// (G key / touch 🚀) and its chapter-4 upgrade Shockwave Landing. All globals are prefixed M3_.
const M3={R:null,rest:null,hcd:0,air:0,airT:0,hops:0,shocks:0,eproj:[],khp:0,log:{hop:0,shock:0,ehit:0}};
Object.assign(M1_WHO,{FERREIRA:{n:'Rui Ferreira',col:'#19d3c5',em:'🚀'},'ÇELIK':{n:'Deniz Çelik',col:'#ff9a3c',em:'💣'},BRANDT:{n:'Ole Brandt',col:'#4ceaff',em:'🎯'},NAKAMURA:{n:'Aoi Nakamura',col:'#c46bff',em:'⚡'},WEBER:{n:'Jana Weber',col:'#5dffb0',em:'🚓'},COP:{n:'Polizei Funk',col:'#2d7bff',em:'🚨'}});
Object.assign(M1_GK,{police:{geo:'sedan-sports',sc:2.8,hp:3,dmg:8,v:1.08,col:'#e8edf5'},kaiser:{geo:'sedan-sports',sc:3.3,hp:10,dmg:16,v:1.16,col:'#0b0b0e',shield:1}});
const M3_STORY=['framed','train','tower','duel3','airport','blackout','crown','duel4','kaiser'];
const M3_RACE={duel3:1,duel4:1,train:1,airport:1};
function M3_st(){const s=M1_st();return s.M3||(s.M3={step:0,hop:0,shock:0,crown:0,intro:0})}
const M3_on=()=>CID==='fra'&&!!M1_st().M2_done;
const M3_mine=ch=>!!(ch&&ch.m&&ch.m.m1&&M3_STORY.includes(ch.m.ev.mid));
// world anchors (x,z); M1_P snaps them to the street graph
const M3_LM={cbank:[530,-60],mtower:[707,215],dbank:[1007,343],oper:[790,700],westend:[1420,40],messe:[2050,180],festh:[2227,133],hbf:[1392,-431],ezb:[-1485,-128],romer:[75,-5],hauptw:[200,354],esch:[185,675],konst:[-440,480],zeil:[0,420],ostend:[-1000,100],osthafen:[-2200,0],wash:[1250,-250],polizei:[250,1250],nordend:[0,1150],bornheim:[-1200,1200],nordN:[-150,1650],sachs:[600,-700],bocken:[2350,750],taunus:[650,400],gutleut:[900,-700],westN:[1300,850]};
const M3_L=k=>M1_P(M3_LM[k][0],M3_LM[k][1]);
// race gates along a city route (the M1 duel generator, generalised: phases, hunters, radio per phase)
function M3_race(c,keys,o){const W=keys.map(k=>typeof k==='string'?M3_L(k):M1_P(k[0],k[1]));W[0]={x:c.O.x,z:c.O.z};const R=M1_path(W),L=R.L;c.L.rp=R;const np=o.np||3,n=clamp(Math.round(L/380),10,30);let lj=-1;
  for(let k=1;k<=n;k++){const a=qvSnap(R.P,R.C,L*k/n);if(a.j===lj&&k<n)continue;lj=a.j;const ph=Math.min(np,1+Math.floor((k-1)/n*np));c.st.push({t:'go',ring:1,race:1,x:a.x,z:a.z,h:a.h,r:12,ph,cp:0,txt:k<n?`Gate ${k}/${n} · ${o.goal}`:o.fin,ic:k<n?'🏁':'🏆',T:0,q:k>1&&k<n})}
  let last=0;for(const S of c.st){if(S.ph!==last){S.cp=1;last=S.ph;const x=(o.at||{})[S.ph];if(x)Object.assign(S,x)}}return R}
const M3_DEF={
 framed:{name:'Framed',npc:'Jana Weber',who:'WEBER',em:'🚨',col:'#2d7bff',g:[330,400,480],story:1,ch:3,at:'cbank',
  hi:'Kaiser planted his stolen cider on you. Every patrol in Mainhattan has your plate. Lose them, then catch his courier!',win:'Courier caught, evidence delivered. You are clean... for now.',lose:'Busted. Kaiser is laughing somewhere. Again!',
  d:'Kaiser framed you. Shake the police in a Bahnhofsviertel car wash, ram Kaiser’s courier, wreck his fake cops and deliver the evidence to the Polizeipräsidium.',
  ph:['Framed!','The Courier','Fake Cops','Roadblock','Evidence Run'],
  build(c){const W=M3_L('wash'),E=M3_L('ezb'),H=M3_L('polizei'),Z=M3_L('zeil'),S=M3_L('esch');
   c.st.push({t:'heat',ph:1,cp:1,x:W.x,z:W.z,r:15,hide:8,cops:3,txt:'Police! Hide in the car wash: stop inside until the heat is gone',ic:'🚿',T:150,scene:'m3framed',x2:40},
    {t:'chase',ph:2,cp:1,x:E.x,z:E.z,rams:4,txt:'Kaiser’s courier! Ram the van 4× before it reaches the EZB',ic:'📦',T:150,x2:40,r3:['WEBER','That van is Kaiser’s courier. <b>Ram it</b> and we have proof!']},
    {t:'goons',ph:3,cp:1,wave:[['police',4],['rammer',2]],need:6,txt:'Fake cops! Kaiser’s goons in police paint: take down 6',ic:'🚓',T:150,bonus:10,x2:45,r3:['HILDE','Those are no cops, rookie, look at the gold trim. <b>Wreck them!</b>']},
    {t:'survive',ph:4,cp:1,dur:70,max:4,txt:'Kaiser’s roadblock! Survive 70 s, wreck what you can',ic:'🚧',T:110,x2:50,r3:['WEBER','Kaiser’s boys blocked the Zeil. <b>Hold out</b>, my unit is on the way!']},
    {t:'go',ph:5,cp:1,ring:1,x:Z.x,z:Z.z,r:14,cops:2,txt:'Evidence run: up the Zeil · real police on your tail',ic:'📁',T:110,x2:10,r3:['WEBER','Bring the evidence to the Polizeipräsidium. My colleagues haven’t heard yet. <b>Don’t stop!</b>']},
    ...['konst','bornheim','nordN','esch'].map(k=>{const p=M3_L(k);return{t:'go',ph:5,ring:1,x:p.x,z:p.z,r:14,txt:'Evidence run: the long way round, lose the patrols',ic:'📁',T:90}}),
    {t:'go',ph:5,x:H.x,z:H.z,stop:1,txt:'Stop at the Polizeipräsidium',ic:'🚓',T:100})}},
 train:{name:'Train Job',npc:'Oma Hilde',who:'HILDE',em:'🚆',col:'#ff2d55',g:[300,370,450],story:1,ch:3,at:'hauptw',showcase:'train',
  hi:'Kaiser’s real books are on the S-Bahn to the Hauptbahnhof. Beat the train to the platform, rookie!',win:'Books grabbed! Kaiser’s accountant will need a new job.',lose:'The S-Bahn was faster. Deutsche Bahn on time, for once!',
  d:'Showcase: race the S-Bahn from the Hauptwache across the Main and back to the Hauptbahnhof, then ram the accountant’s getaway car.',
  ph:['Departure','Across the Main','Platform Sprint','The Accountant','Defend the Books'],
  build(c){M3_race(c,['hauptw','zeil','konst',[-400,-115],'sachs',[386,-430],'romer','taunus',[1100,-1000],'gutleut','hbf'],{np:3,goal:'beat the S-Bahn to the Hauptbahnhof',fin:'Hauptbahnhof! Beat the train!',at:{2:{hunt:2,r3:['BRIX','Bzzt! Schattenwerk cars on the bridge. Don’t let them slow you!']},3:{r3:['HILDE','Platform sprint! <b>BOOST</b> all the way in!']}}});
   const M=M3_L('bocken');c.st.push({t:'chase',ph:4,cp:1,x:M.x,z:M.z,rams:3,txt:'The accountant runs with the books! Ram his car 3×',ic:'📚',T:150,x2:40,r3:['HILDE','There, the accountant! He’s running for Bockenheim. <b>Ram him!</b>']},
    {t:'survive',ph:5,cp:1,dur:75,max:4,txt:'Kaiser wants his books back! Survive 75 s',ic:'📚',T:120,x2:50,r3:['KAISER','Those books are <b>mine</b>. Boys, get them back!']})}},
 tower:{name:'Tower Party',npc:'BRIX',who:'BRIX',em:'🗼',col:'#ffd12c',g:[300,370,450],story:1,ch:3,at:'mtower',
  hi:'Bzzt! Kaiser’s crew threw a party at the Main Tower plaza. Ferreira and Çelik are guests. Crash it.',win:'Bzzt! Party over. Ferreira and Çelik want a race now.',lose:'Bzzt... the party crashed you.',
  d:'Road Rage on the Main Tower plaza: smash the party barriers, survive two takedown waves, then wreck the Schattenwerk boss truck.',
  ph:['Crash the Party','Road Rage','Lieutenant','Brecher Returns'],
  build(c){const O=c.O,it=[];for(const[dx,dz]of[[90,0],[60,110],[-80,90],[-110,-20],[-40,-120],[80,-100]]){const p=M1_P(O.x+dx,O.z+dz,160);it.push([p.x,p.z,Math.atan2(dx,dz)])}
   c.st.push({t:'booths',ph:1,cp:1,items:it,guards:2,gen:'#ff2d95',txt:`Smash the ${it.length} party barriers at 80+ km/h`,ic:'🎉',T:140,scene:'m3tower',x:it[0][0],z:it[0][1],x2:40},
    {t:'survive',ph:2,cp:1,dur:110,max:4,txt:'Road Rage! The party fights back · survive 110 s',ic:'💥',T:120,x2:45,r3:['BRIX','Bzzt! Wave incoming. Wreck what you can, stay alive.']},
    {t:'goons',ph:3,cp:1,wave:[['rammer',3],['shield',1],['lt',1]],need:5,txt:'Ferreira’s lieutenant + a shield car: take down 5',ic:'😈',T:120,bonus:10,x2:45},
    {t:'survive',ph:4,cp:1,dur:90,max:4,boss:'heavy',txt:'Hold the plaza 90 s, then wreck Brecher’s truck (BOOST-ram)',ic:'🚛',T:180,x2:60,r3:['HILDE','Brecher is back, and he brought his truck. Only a <b>BOOST</b>-ram cracks it!']})}},
 duel3:{name:'Duel: Ferreira & Çelik',npc:'Rui Ferreira',who:'FERREIRA',em:'🚀',col:'#19d3c5',g:[220,270,330],story:1,ch:3,at:'mtower',items:1,duel:1,
  hi:'Main Tower to the EZB, the long way. Two of us, one of you. I bring missiles, Deniz brings mines.',win:'Obrigado... You earned our flags. Kaiser will be furious.',lose:'Too slow! Come back with a faster car.',
  d:'Three-car street race through the whole city with items on. Ferreira fires missiles, Çelik drops mines on the racing line.',
  ph:['Bankenviertel Blast','Westend Mines','Final Sprint'],
  rv:[{who:'FERREIRA',col:'#19d3c5',base:40,gun:1},{who:'ÇELIK',col:'#ff9a3c',base:39,mine:1,s0:-24}],
  build(c){M3_race(c,['mtower','dbank','westend','messe','bocken','oper','hauptw','konst','ostend','ezb'],{np:3,goal:'beat Ferreira and Çelik to the EZB',fin:'Finish at the EZB!',at:{2:{r3:['ÇELIK','Mind the mines, rookie. I paint the road red.']},3:{hunt:2,r3:['KAISER','You won’t embarrass my crew twice. <b>Boys, block the rookie!</b>']}}})}},
 airport:{name:'Cargo Jet Showcase',npc:'Oma Hilde',who:'HILDE',em:'✈',col:'#4ceaff',g:[290,360,440],story:1,ch:4,at:'osthafen',showcase:'plane',
  hi:'Kaiser flies the Sky Cup in on his cargo jet tonight. Race its shadow from the Osthafen to the Messe before it lands!',win:'You beat a jet. A JET! And the Sky Cup crate is ours... almost.',lose:'The jet landed first. Kaiser has the Cup.',
  d:'Showcase: race Kaiser’s cargo jet across the whole city to the Messe, then fight off the unloading crew.',
  ph:['Osthafen Launch','City Flyover','Messe Approach','Cargo Crew','The Crate'],
  build(c){M3_race(c,['osthafen','ezb','ostend','bornheim','nordend','esch','oper','westN','bocken','messe'],{np:3,goal:'beat the cargo jet to the Messe',fin:'Messe! Before it lands!',at:{2:{hunt:2,r3:['BRIX','Bzzt! Kaiser sent goons to slow you down. Ram through!']},3:{r3:['HILDE','The jet is on approach! <b>BOOST</b> or <b>ROCKET HOP</b> over the traffic!']}}});
   const W2=M3_L('westend');c.st.push({t:'goons',ph:4,cp:1,wave:[['heavy',1],['rammer',3]],need:4,txt:'Cargo crew! Take down 4 (the truck needs a BOOST-ram)',ic:'📦',T:120,bonus:10,x2:50,r3:['HILDE','The unloading crew! Wreck them before they drive off with the crate.']},
    {t:'chase',ph:5,cp:1,x:M3_L('ezb').x,z:M3_L('ezb').z,rams:4,txt:'A van has the Sky Cup crate! Ram it 4×',ic:'🏆',T:160,x2:40,r3:['BRIX','Bzzt! The crate is in that van. <b>Ram it!</b>']},
    {t:'survive',ph:5,cp:1,dur:45,max:4,txt:'Hold the crate 45 s until Hilde’s tow truck arrives',ic:'🚚',T:90,x2:30,r3:['HILDE','Hold on to it, rookie, my tow truck is <b>45 seconds</b> out!']})}},
 blackout:{name:'Blackout',npc:'BRIX',who:'BRIX',em:'⚡',col:'#4ceaff',g:[310,380,460],story:1,ch:4,at:'hauptw',
  hi:'Bzzt! Kaiser hooked four generators into the city grid to cut the power. Smash them, district by district.',win:'Bzzt! Lights on, Mainhattan. Kaiser is out of tricks... almost.',lose:'Bzzt... power failure. Mine, not yours.',
  d:'Kaiser cuts the city’s power. Smash 4 guarded generators across the Bankenviertel, Bockenheim, Nordend and Osthafen, then hold off his elite guard.',
  ph:['Bankenviertel','Bockenheim','Nordend','Osthafen','Elite Guard'],
  build(c){const G=[['cbank','Bankenviertel'],['bocken','Bockenheim'],['nordN','Nordend'],['osthafen','Osthafen']];G.forEach(([k,nm],i)=>{const p=M3_L(k);c.st.push({t:'booths',ph:i+1,cp:1,items:[[p.x,p.z,0]],guards:1,gen:'#4ceaff',elite:i>0?1:0,txt:`Generator ${i+1}/4 · ${nm}: smash it at 80+ km/h`,ic:'⚡',T:i?130:110,x:p.x,z:p.z,x2:30,scene:i===0?'m3blackout':null,r3:i===2?['BRIX','Bzzt! Elite guard: shield cars. Only a <b>BOOST</b>-ram cracks them.']:null})});
   c.st.push({t:'survive',ph:5,cp:1,dur:110,max:4,txt:'Kaiser’s elite guard! Survive 110 s',ic:'🛡',T:150,x2:50,r3:['KAISER','You turned my lights back on? <b>Then you won’t see this coming.</b>']})}},
 crown:{name:'The Crown',npc:'Oma Hilde',who:'HILDE',em:'👑',col:'#ffd12c',g:[360,440,530],story:1,ch:4,at:'romer',
  hi:'Kaiser’s armoured hauler is moving the Sky Cup across town. Stop it, rookie. This is the big one.',win:'The hauler is scrap, the Cup is safe. Now it’s just you and Kaiser.',lose:'The hauler got through. Again, rookie!',
  d:'Kaiser’s armoured hauler carries the Sky Cup: ram it, survive its minefield, then tail Kaiser as he boosts onto the Messe ring.',
  ph:['Ram the Hauler','Minefield','Autobahn Boost','Arena Guards'],
  build(c){const Hb=M3_L('hbf'),M=M3_L('messe'),F=M3_L('festh');
   c.st.push({t:'chase',ph:1,cp:1,x:Hb.x,z:Hb.z,rams:5,txt:'Ram the armoured hauler 5× before the Hauptbahnhof',ic:'🚛',T:160,scene:'m3crown',x2:40},
    {t:'thieves',ph:2,cp:1,kz:1,mines:1,list:[{from:M1_P(Hb.x+30,Hb.z+30),to:M,rams:4,drop:1}],txt:'Kaiser takes the wheel at the Hauptbahnhof! Ram him 4× · he drops mines',ic:'👑',T:170,x2:60,r3:['KAISER','Mines, rookie. <b>Lots of mines.</b>']},
    {t:'tail',ph:3,cp:1,via:[M3_L('bocken'),M3_L('nordN'),M3_L('esch'),M3_L('westN'),M3_L('messe')],to:F,max:200,hunt:2,txt:'Kaiser boosts away! Stay within 200 m',ic:'💨',T:260,x2:40,r3:['HILDE','He’s heading for the Festhalle. <b>Don’t lose him!</b>']},
    {t:'survive',ph:4,cp:1,dur:60,max:4,txt:'Arena guards! Survive 60 s at the Festhalle',ic:'🏟',T:100,x2:40,r3:['KAISER','My arena, my guards. <b>See you at the finale, rookie.</b>']},
    {t:'go',ph:4,x:F.x,z:F.z,stop:1,txt:'Park at the Festhalle arena gates',ic:'🏟',T:100,x2:10})}},
 duel4:{name:'Duel: Brandt & Nakamura',npc:'Ole Brandt',who:'BRANDT',em:'🎯',col:'#4ceaff',g:[190,240,300],story:1,ch:4,at:'esch',items:1,duel:1,
  hi:'Before you face Kaiser, you face us. Eschenheimer Turm, around the north, finish at the Alte Oper.',win:'Fine. You’re ready. Go end Kaiser’s little empire.',lose:'Not ready yet. Kaiser would eat you alive.',
  d:'Three-car street race around the north of the city with items on. Brandt fires missiles, Nakamura boosts like a rocket.',
  ph:['Nordend','Bornheim Run','Oper Sprint'],
  rv:[{who:'BRANDT',col:'#4ceaff',base:41,gun:1},{who:'NAKAMURA',col:'#c46bff',base:40,boost:1,s0:-24}],
  build(c){M3_race(c,['esch','nordend','bornheim','ostend','konst','zeil','hauptw','taunus','oper'],{np:3,goal:'beat Brandt and Nakamura to the Alte Oper',fin:'Finish at the Alte Oper!',at:{2:{r3:['NAKAMURA','Watch my boost, rookie. Then watch my tail lights.']},3:{hunt:2,r3:['KAISER','A race? I’ll join. <b>My boys will.</b>']}}})}},
 kaiser:{name:'Finale: Vex Kaiser',npc:'Vex Kaiser',who:'KAISER',em:'👑',col:'#ffd12c',g:[320,400,490],story:1,ch:4,at:'romer',fin:1,
  hi:'You want my city, rookie? Catch me first. Römer to the Hauptbahnhof and back, and I don’t brake for anyone.',win:'Impossible... my Mainhattan...',lose:'Ha! Mainhattan is MINE.',
  d:'The boss chase across the city: ram Kaiser through the streets, break his elite guard, leap the raised Untermainbrücke, tail him through Sachsenhausen, then wreck his armoured car in the final showdown.',
  ph:['The Crown Run','Elite Guard','Bridge Leap','Over the River','Last Stand','Raise the Cup'],
  build(c){const Hb=M3_L('hbf'),R=M3_L('romer'),O=c.O;
   c.st.push({t:'thieves',ph:1,cp:1,kz:1,list:[{from:M1_P(O.x+20,O.z+20),to:M3_L('messe'),rams:6,drop:1}],hunter:1,txt:'Kaiser runs for the Messe! Ram him 6×',ic:'👑',T:180,scene:'m3kaiser',x2:60},
    {t:'survive',ph:2,cp:1,dur:100,max:4,txt:'Kaiser’s elite guard swarms you · survive 100 s',ic:'🛡',T:130,x2:40,r3:['KAISER','My elite guard. Gold-plated, rookie. <b>Like me.</b>']},
    {t:'goons',ph:2,wave:[['shield',2],['lt',1]],need:3,txt:'Guard captains: 2 shield cars + a lieutenant',ic:'🛡',T:120,bonus:10,x2:30},
    {t:'leap',ph:3,cp:1,bridge:'untermain',d:28,txt:'Kaiser raises the Untermainbrücke! ROCKET HOP the gap (28 m+) at the bridgehead',ic:'🛫',T:100,x2:30,r3:['HILDE','He’s raising the bridge! Get to the bridgehead and <b>ROCKET HOP</b> ('+(TOUCH.on?'🚀':'G')+') over the gap!']},
    {t:'tail',ph:4,cp:1,via:[M3_L('gutleut'),M3_L('sachs'),M1_P(-300,-1100),M1_P(-300,-700),M1_P(-400,-115)],to:M3_L('romer'),max:180,hunt:2,txt:'Kaiser flees through Sachsenhausen! Stay within 180 m',ic:'💨',T:200,x2:40,r3:['HILDE','He’s running for the Römer! <b>Stay on him!</b>']},
    {t:'goons',ph:5,cp:1,wave:[['kaiser',1]],need:1,esc:1,txt:'Last stand: wreck Kaiser’s armoured car (10 HP, BOOST-ram)',ic:'👑',T:180,bonus:0,x2:90,r3:['KAISER','Enough games. <b>Me against you.</b>']},
    {t:'go',ph:6,cp:1,x:R.x,z:R.z,stop:1,txt:'Raise the Sky Cup at the Römer',ic:'🏆',T:120,x2:20})}}};
Object.assign(M1_DEF,M3_DEF);
// ---------- scenes
function M3_2shot(K,lines,end,o={}){M1_scene({cam:{a:()=>({x:RO.x,z:RO.z}),b:()=>K?{x:K.position.x,z:K.position.z}:{x:RO.x+Math.sin(RO.h)*30,z:RO.z+Math.cos(RO.h)*30}},lines,dur:o.dur,end(){if(K&&o.rm&&K.parent){K.parent.remove(K);M1.act=M1.act.filter(q=>q.m!==K)}if(end)end()}})}
function M3_carNear(geo,col,trim,d=16){const K=M1_obj({m:M1_car(geo,col,3,trim)}).m;M1_put(K,RO.x+Math.sin(RO.h)*d,RO.z+Math.cos(RO.h)*d,RO.h+Math.PI);return K}
Object.assign(M1_SC,{
 m3framed:()=>M3_2shot(M3_carNear('sedan-sports','#e8edf5','#2d7bff'),[['COP','All units: the cider thief from the Apfelwein market is <b>the rookie</b>. Stop that car!'],['WEBER','I know it’s Kaiser’s work. But my colleagues don’t. <b>Lose them</b>, hide in the car wash on the Bahnhofsviertel.']],null,{rm:1}),
 m3tower:()=>M3_2shot(M3_carNear('sedan-sports','#19d3c5','#ffffff'),[['FERREIRA','The rookie! Welcome to Kaiser’s party. Deniz, show our guest the door.'],['ÇELIK','With pleasure. Boys, <b>wreck the rookie</b>.']],null,{rm:1}),
 m3blackout:()=>M1_scene({cam:{mode:'orbit',a:()=>({x:RO.x,z:RO.z}),r:40,h:22},lines:[['KAISER','Mainhattan, say goodnight. <b>Lights out.</b>'],['BRIX','Bzzt! Four generators are feeding his grid hack. Smash them at <b>80+ km/h</b>.']],end(){}}),
 m3crown:()=>M3_2shot(M3_carNear('truck','#16121c','#ffd12c',22),[['KAISER','The Sky Cup rides in my hauler. Two inches of steel, rookie.'],['HILDE','Steel dents. <b>Ram it</b> until it gives up!']],null,{rm:1}),
 m3kaiser:()=>M3_2shot(M3_carNear('sedan-sports','#0b0b0e','#ffd12c'),[['KAISER','So, the rookie who stole my city. Let’s see how you drive when it’s <b>personal</b>.'],['HILDE','This is it, rookie. Everything you learned: ram, boost, hop. <b>Bring him down!</b>'],['KAISER','Catch me if you can.']],null,{rm:1})});
function M3_intro(){M1_scene({cam:{mode:'orbit',a:()=>({x:RO.x,z:RO.z}),r:28,h:10},lines:[['KAISER','Rookie! The Polizei just found a truck of stolen Ebbelwoi... <b>in your name</b>. Funny, isn’t it?'],['HILDE','He framed you! Every patrol in Mainhattan is looking for your car now.'],['WEBER','Jana Weber here. I believe you, rookie. Meet me at the Commerzbank and we clear your name.']],end(){const s=()=>storyShow({who:'KAISER',title:'Chapter 3 · Kaisers Schatten',txt:'Kaiser framed you and the police are hunting you. Clear your name, beat Ferreira and Çelik, and win the <b>Rocket Hop</b>. Follow the <b>NEXT</b> bar.'});if(RO.ch||RO.sp)M1.pend=s;else s();M1_autoRoute()}})}
Object.assign(M1_END,{
 duel3:()=>M1_scene({cam:{mode:'orbit',a:()=>({x:RO.x,z:RO.z}),r:26,h:9},lines:[['FERREIRA','Obrigado for the race. Our flags are yours.'],['HILDE','And I bolted a rocket under your seat: <b>ROCKET HOP</b>! '+(TOUCH.on?'Tap 🚀':'Press <b>G</b>')+' to launch over traffic, walls and raised bridges.'],['BRIX','Bzzt! Chapter 4 unlocked: <b>Das Finale</b>. Kaiser is flying in the Sky Cup.']],end(){const s=()=>storyShow({who:'HILDE',title:'Chapter 4 · Das Finale',txt:'Chapter 3 complete! You have the <b>Rocket Hop</b>. Kaiser brings the Sky Cup to Mainhattan: race his jet, beat the blackout, stop the Crown hauler, then face him.'});if(RO.ch||RO.sp)M1.pend=s;else s();M3_tw();M1_autoRoute()}}),
 duel4:()=>M1_scene({cam:{mode:'orbit',a:()=>({x:RO.x,z:RO.z}),r:26,h:9},lines:[['NAKAMURA','Not bad. Take this: a <b>Shockwave</b> coil for your rocket.'],['HILDE','Now every <b>ROCKET HOP</b> landing blasts goons around you. Kaiser waits at the Römer.'],['KAISER','Römer. Midnight. <b>Come alone, rookie.</b>']],end(){M1_autoRoute()}}),
 kaiser:()=>M1_scene({cam:{mode:'orbit',a:()=>({x:RO.x,z:RO.z}),r:22,h:8},lines:[['KAISER','My crown... my city... beaten by a rookie with an <b>Oma</b>.'],['HILDE','Not just any Oma, Vex. The Sky Cup stays in Mainhattan!'],['BRIX','Bzzt! Frankfurt campaign complete. The <b>Kaiser crown</b> part is yours. Athens is calling...']],end(){M1_autoRoute()}})});
// ---------- progression, marks, NEXT
function M3_mkMark(id){const D=M3_DEF[id],a=M3_L(D.at);const ev={id:'m1_'+id,mid:id,kind:'m1',npc:D.npc,name:D.name,em:D.em,col:D.col,hi:D.hi,win:D.win,lose:D.lose,d:D.d,items:D.items};QAV[ev.id]=M1_av(D.who);
  const m=qvMk({kind:'quest',m1:1,m3:1,ev,x:a.x,z:a.z,h:0,icon:D.em,col:D.col});const ring2=new THREE.Mesh(new THREE.TorusGeometry(12,.5,8,48),neonMat(D.fin?'#ff2d55':'#ffd400',2.6));ring2.rotation.x=Math.PI/2;ring2.position.y=.6;m.g.add(ring2);if(RO.ch||RO.sp)m.g.visible=false;return m}
const M3_mark=id=>RO.marks.find(m=>m.m3&&m.ev.mid===id);
M1_marks=(f=>function(){f();if(!M3_on()||!qvGraph())return;const id=M3_STORY[M3_st().step];if(id&&!M3_mark(id))M3_mkMark(id)})(M1_marks);
M1_next=(f=>function(){if(M3_on()){const s=M3_st(),id=M3_STORY[s.step];if(id){const D=M3_DEF[id],m=M3_mark(id);return{ic:D.em,t:(D.duel?'RIVAL · ':D.fin?'FINALE · ':'STORY · ')+D.name,sub:`Chapter ${D.ch}`+(m?' · '+districtAt(m.x,m.z):''),m,act:'route'}}}return f()})(M1_next);
M1_done=(f=>function(id,ch){const k=M3_STORY.indexOf(id);if(k>=0){const s=M3_st();if(k===s.step){s.step++;const F=flags();const fl=id==='duel3'?['FERREIRA','ÇELIK']:id==='duel4'?['BRANDT','NAKAMURA']:id==='kaiser'?['SKYCUP']:[];for(const q of fl)F[q]=1;if(fl.length)store.set('mho_flags',F);if(id==='duel3')s.hop=1;if(id==='duel4')s.shock=1;if(id==='kaiser')s.crown=1}M1_save()}return f(id,ch)})(M1_done);
// ---------- race opponents: rivals with weapons, the S-Bahn, the cargo jet (rubber band, items hit rivals, fail if one finishes first)
function M3_train(){const g=new THREE.Group(),Mr=new THREE.MeshStandardMaterial({color:0xd2142a,roughness:.5}),Mw=new THREE.MeshStandardMaterial({color:0xeef1f4,roughness:.5});const cars=[];for(let k=0;k<3;k++){const c=new THREE.Group();box(c,Mw,3.4,2.6,14,0,2.1,0);box(c,Mr,3.5,1.1,14.2,0,1.1,0);box(c,Mr,3.5,.5,14.2,0,3.5,0);const l=new THREE.Mesh(new THREE.BoxGeometry(3.6,.3,14.4),neonMat('#ffd400',2));l.position.y=2.5;c.add(l);RO.grp.add(c);cars.push(c)}return cars}
function M3_plane(){const g=new THREE.Group(),M=new THREE.MeshStandardMaterial({color:0x22222a,roughness:.5}),Gd=new THREE.MeshStandardMaterial({color:0xffd12c,roughness:.4,emissive:new THREE.Color('#4a3a00')});box(g,M,7,7,52,0,0,0);box(g,Gd,56,1.2,10,0,0,2);box(g,Gd,18,1,6,0,5,-22);box(g,M,1,9,7,0,6,-22);g.scale.setScalar(1.3);RO.grp.add(g);return[g]}
function M3_rvInit(ch){const D=M3_DEF[ch.m.ev.mid],rp=ch.v2.L.rp;if(!rp)return;const rs=M3.rest&&M3.rest.mid===ch.m.ev.mid&&M3.rest.m3||null;M3.rest=null;const R={rp,pi:0,ps:0,list:[]};
  if(D.rv)D.rv.forEach((q,k)=>{const m=M1_car('sedan-sports',q.col,2.9,'#ffffff');R.list.push({...q,name:M1_WHO[q.who].n,P:rp.P,C:rp.C,L:rp.L,k:1,s:rs?rs[k]:(q.s0||-12),m:[m],off:k?3.5:-3.5,stall:0,lt:6+k*7,ft:8+k*3,bt:9})});
  else if(D.showcase==='train'){R.list.push({who:'TRAIN',name:'S-Bahn',ic:'🚆',P:rp.P,C:rp.C,L:rp.L,k:1,s:rs?rs[0]:40,base:33,m:M3_train(),seg:15,off:0,stall:0,nostall:1})}
  else if(D.showcase==='plane'){const a=rp.P[0],b=rp.P[rp.P.length-1],P=[a,b],C=qvCum(P),L=C[C.length-1];R.list.push({who:'JET',name:'Cargo jet',ic:'✈',P,C,L,k:L/rp.L,s:rs?rs[0]:0,base:34*L/rp.L,m:M3_plane(),fly:1,off:0,stall:0,nostall:1})}
  for(const r of R.list)if(r.base==null)r.base=33;M3.R=R;M3.Rch=ch;if(!M1.boxes.some(b=>b.mis)&&D.items)for(let s=500;s<rp.L-300;s+=650){const a=qvAt(rp.P,rp.C,s);M1_box(a.x,a.z,1)}}
function M3_rvClear(){const R=M3.R;if(R)for(const r of R.list)for(const m of r.m)if(m.parent)m.parent.remove(m);M3.R=null;M3.Rch=null;for(const p of M3.eproj)if(p.m.parent)p.m.parent.remove(p.m);M3.eproj=[]}
function M3_rvStep(ch,dt){const S=ch.v2.L.st[ch.v2.si];if(!S)return;if(!S.race){if(M3.R)M3_rvClear();return}if(!M3.R||M3.Rch!==ch)M3_rvInit(ch);const R=M3.R;if(!R)return;const P=R.rp.P,C=R.rp.C;
  let bi=R.pi,bd=1e18;for(let i=Math.max(0,bi-3);i<Math.min(P.length,bi+40);i++){const d=(P[i][0]-RO.x)**2+(P[i][1]-RO.z)**2;if(d<bd){bd=d;bi=i}}R.pi=bi;R.ps=C[bi];
  for(const r of R.list){r.stall=Math.max(0,r.stall-dt);r.gap=r.s/r.k-R.ps;let v=r.base*(r.gap>140?.8:r.gap<-140?1.12:1);if(r.s>r.L*.86)v=r.base;if(r.stall>0)v*=.25;
    if(r.boost!=null||!r.nostall){r.bt-=dt;if(r.bt<=0){r.bt=(r.boost?9:14)+Math.random()*6;r.bo=r.boost?2.4:1.6}if(r.bo>0){r.bo-=dt;v*=r.boost?1.5:1.35}}
    r.s+=v*dt;r.m.forEach((m,j)=>{const a=qvAt(r.P,r.C,Math.max(0,r.s-j*(r.seg||0)));const ox=Math.cos(a.h)*r.off,oz=-Math.sin(a.h)*r.off;if(r.fly){const f=clamp(r.s/r.L,0,1);m.position.set(a.x,groundY(a.x,a.z)+90-55*f,a.z);m.rotation.set(0,a.h,0)}else{m.position.set(a.x+ox,groundAt(a.x+ox,a.z+oz,(m.position.y||0)+4),a.z+oz);m.rotation.y=a.h}});const a0=r.m[0].position;r.x=a0.x;r.z=a0.z;r.h=r.m[0].rotation.y;
    // weapons: Ferreira/Brandt fire homing missiles, Çelik drops mines on the racing line
    const dP=Math.hypot(r.x-RO.x,r.z-RO.z);if(r.gun){r.ft-=dt;if(r.ft<=0&&dP>18&&dP<130){r.ft=11+Math.random()*5;M3_efire(r)}}if(r.mine){r.ft-=dt;if(r.ft<=0&&r.gap>15&&dP<200){r.ft=6+Math.random()*3;M1.mines.push(M1_mine(r.x-Math.sin(r.h)*6,r.z-Math.cos(r.h)*6,'enemy'))}}
    r.lt-=dt;if(r.lt<=0&&r.who in M1_WHO){r.lt=20+Math.random()*8;const L={FERREIRA:[['Missile lock, rookie!','Boa! Too easy.'],['Hey! Lucky shot.']],'ÇELIK':[['Watch the road, rookie. Boom.','My mines love you.'],['You passed me? Watch your back.']],BRANDT:[['Target acquired.','Steady, rookie... steady...'],['Hm. Not bad.']],NAKAMURA:[['Boost! Boost! Boost!','See you at the Oper!'],['Interesting. Very interesting.']]}[r.who];if(L){const q=L[r.gap>0?0:1];M1_radio(r.who,q[Math.floor(Math.random()*q.length)])}}
    if(r.s>=r.L-3&&RO.ch===ch){return qvFail(ch,r.who==='TRAIN'?'THE S-BAHN WON':r.who==='JET'?'THE CARGO JET LANDED FIRST':r.name.toUpperCase()+' WON THE DUEL')}}
  // player items vs rivals: missiles home on the nearest rival ahead, mines stall them
  for(const r of R.list){if(r.nostall)continue;for(const p of M1.proj){if(p.dead)continue;if(!p.tg&&Math.hypot(r.x-p.x,r.z-p.z)<260&&Math.abs(angDiff(Math.atan2(r.x-p.x,r.z-p.z),p.h))<1.1)p.tg=r;if(Math.hypot(r.x-p.x,r.z-p.z)<7){p.dead=1;if(p.m.parent)p.m.parent.remove(p.m);burst(FIRE,V3(r.x,groundY(r.x,r.z)+2,r.z),30,24,.7,new THREE.Color(2.2,1,.3));M1_snd('boom');r.stall=2.4;M1.log.hit++;hitPop(`🚀 ${r.name.split(' ')[0].toUpperCase()} HIT!`,'#5dffb0')}}
    for(const q of M1.mines){if(q.dead||q.own!=='pl'||q.arm>0)continue;if(Math.hypot(r.x-q.x,r.z-q.z)<5){q.dead=1;if(q.m.parent)q.m.parent.remove(q.m);burst(FIRE,V3(q.x,groundY(q.x,q.z)+1.5,q.z),34,24,.8,new THREE.Color(2.2,1,.3));M1_snd('boom');r.stall=2.4;M1.log.hit++;hitPop(`💣 ${r.name.split(' ')[0].toUpperCase()} SPINS OUT!`,'#5dffb0')}}}}
function M3_efire(r){const m=new THREE.Mesh(new THREE.ConeGeometry(.5,2.4,8).rotateX(Math.PI/2),neonMat('#19d3c5',2.6));m.position.set(r.x,groundY(r.x,r.z)+1.6,r.z);RO.grp.add(m);M3.eproj.push({x:r.x,z:r.z,h:Math.atan2(RO.x-r.x,RO.z-r.z),v:Math.max(70,Math.abs(RO.v)+30),t:0,m});M1_snd('missile');M1_radio(r.who,'Missile out! <b>Dodge this, rookie!</b>')}
function M3_eprojStep(dt){for(const p of M3.eproj){if(p.dead)continue;p.t+=dt;const w=Math.atan2(RO.x-p.x,RO.z-p.z);p.h+=clamp(angDiff(w,p.h),-1.6*dt,1.6*dt);p.x+=Math.sin(p.h)*p.v*dt;p.z+=Math.cos(p.h)*p.v*dt;const gy=groundY(p.x,p.z)+1.6;p.m.position.set(p.x,gy,p.z);p.m.rotation.y=p.h;if(Math.random()<.6)emit(SPARK,p.m.position.clone(),V3(rr(-2,2),rr(0,2),rr(-2,2)),.3,new THREE.Color(.4,2,2));
    const hit=Math.hypot(RO.x-p.x,RO.z-p.z)<4.5&&Math.abs(RO.y-gy)<5;if(hit||p.t>4||roamHit(p.x,p.z,1,gy)){p.dead=1;if(p.m.parent)p.m.parent.remove(p.m);burst(FIRE,V3(p.x,gy+1,p.z),30,24,.7,new THREE.Color(2.2,1,.3));M1_snd('boom');if(hit&&!(M1.ghost>0)){M3.log.ehit++;RO.v*=.35;M1.hp=Math.max(0,M1.hp-12);M1.hpT=0;shake=.6;hitPop('💥 MISSILE HIT!','#ff4d6d')}}}M3.eproj=M3.eproj.filter(p=>!p.dead)}
M1_rivalStep=(f=>function(ch,dt){if(M3_RACE[ch.m.ev.mid])return M3_rvStep(ch,dt);return f(ch,dt)})(M1_rivalStep);
M1_clear=(f=>function(){f();M3_rvClear()})(M1_clear);
M1_restore=(f=>function(ch,cp){M3.rest=cp;return f(ch,cp)})(M1_restore);
// ---------- new stage 'heat' + extras on M1 stage types (police cars, generator look, Kaiser look, boss HP, escorts, mines)
const M3_SIR=[];function M3_sir(){if(!M3_SIR.length)M3_SIR.push(neonMat('#2d7bff',3),neonMat('#ff2d55',3));return M3_SIR}
M1_goon=(f=>function(kind,x,z,o){const g=f(kind,x,z,o);if(kind==='police'){g.m.children[1].material=M3_sir()[0];g.siren=1}if(kind==='kaiser'){g.m.children[2].material=neonMat('#ffd12c',3.2);g.m.scale.setScalar(1.12)}return g})(M1_goon);
M1_setup=(f=>function(ch,S,i){f(ch,S,i);if(!M3_mine(ch))return;
  if(S.t==='heat'){S.heat=100;S.in=0;const g=new THREE.Group(),Mf=new THREE.MeshStandardMaterial({color:0x2a2f3a,roughness:.6});box(g,Mf,1.5,8,1.5,-9,4,-8);box(g,Mf,1.5,8,1.5,9,4,-8);box(g,Mf,1.5,8,1.5,-9,4,8);box(g,Mf,1.5,8,1.5,9,4,8);box(g,Mf,20,1.2,18,0,8.4,0);const sg=new THREE.Mesh(new THREE.BoxGeometry(20.4,1,18.4),neonMat('#4ceaff',2.4));sg.position.y=7.4;g.add(sg);const fm=new THREE.Mesh(new THREE.CircleGeometry(S.r,24).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:0x9fe8ff,transparent:true,opacity:.35,depthWrite:false}));fm.position.y=.1;g.add(fm);g.position.set(S.x,groundY(S.x,S.z),S.z);RO.grp.add(g);M1_obj({m:g});S.g=g;M1_spawn(S,'police',S.cops||3,null,90,160);say('POLICE!','LOSE THEM · HIDE IN THE CAR WASH',1.8)}
  if(S.t==='leap'){const b=M1_bridge(S.bridge);let p={x:RO.x,z:RO.z};if(b){const[x,z]=deckPt(b,-b.half-6);p=M1_P(x,z,90);for(const sd of[-1,1]){const[x2,z2]=deckPt(b,-8*sd);const pn=new THREE.Mesh(new THREE.BoxGeometry(b.w-4,1.2,22),new THREE.MeshStandardMaterial({color:0x6b6f78,roughness:.6}));pn.position.set(x2,deckY(b,0)+7,z2);pn.rotation.set(sd*.5,Math.atan2(b.ux,b.uz),0,'YXZ');RO.grp.add(pn);M1_obj({m:pn})}}S.x=p.x;S.z=p.z;S.tk=0;S.to=null;const rg=new THREE.Mesh(new THREE.TorusGeometry(10,.6,8,40),neonMat('#ff9a3c',2.6));rg.rotation.x=Math.PI/2;rg.position.set(S.x,groundY(S.x,S.z)+.6,S.z);RO.grp.add(rg);M1_obj({m:rg})}
  if(S.t==='booths'&&S.gen){for(const o of S.it){const c=new THREE.Mesh(new THREE.CylinderGeometry(1.4,1.4,10,10),neonMat(S.gen,2.6));c.position.y=11;o.m.add(c)}if(S.elite)M1_spawn(S,'shield',1,{x:S.x,z:S.z},90,150)}
  if(S.t==='thieves'&&S.kz)for(const g of S.th){g.m.children[0].material=g.m.children[0].material.clone();g.m.children[0].material.color.set('#0b0b0e');g.m.children[2].material=neonMat('#ffd12c',3.2);g.m.scale.setScalar(1.15);g.kz=1;g.mT=3}
  if(S.t==='goons'&&S.bossHp)for(const g of M1.goons)if(g.S===S&&!g.dead){g.hp=g.hp0=S.bossHp}})(M1_setup);
M1_hooks=(f=>function(ch,S,i){if(M3_mine(ch))for(const g of M1.goons)if(!g.dead&&!g.S&&!g.leave){g.leave=1;g.st='flee';g.ft=99}f(ch,S,i);if(!M3_mine(ch))return;
  if(S.cops&&S.t!=='heat')M1_spawn(S,'police',S.cops,null,140,220);if(S.r3&&!M1.noScene)setTimeout(()=>{if(RO.ch===ch&&!M1.cs)M1_radio(S.r3[0],S.r3[1])},S.scene?300:900);
  for(const g of M1.goons)if(g.leave&&!g.dead&&g.S&&g.S!==S&&g.S.cops&&g.S.ph===S.ph&&g.kind==='police'){g.leave=0;g.lt=0;g.st='hunt'}if(S.cp&&M1.cp&&M1.cp.si===i&&M3.R)M1.cp.m3=M3.R.list.map(r=>r.s);if(S.esc){S.escT=12;M3.khp=10}})(M1_hooks);
M1_stage=(f=>function(ch,S,dt){if(M3_mine(ch)&&S.t==='leap'){if(RO.takeoff&&RO.takeoff!==S.to){S.to=RO.takeoff;S.tk=Math.hypot(RO.takeoff.x-S.x,RO.takeoff.z-S.z)<70}if(!S.warn&&ch.v2.left<15){S.warn=1;say('','THE BRIDGE IS ALMOST UP!',1.2)}return}if(!M3_mine(ch)||S.t!=='heat')return f(ch,S,dt);
  const d=Math.hypot(S.x-RO.x,S.z-RO.z),still=Math.abs(RO.v)<4;if(d<S.r&&still){S.heat=Math.max(0,S.heat-dt*100/S.hide);if(!S.in){S.in=1;say('','🚿 CAR WASH · STAY STILL',1.2)}if(Math.random()<.5)emit(SPARK,V3(RO.x+rr(-4,4),RO.y+4,RO.z+rr(-4,4)),V3(0,-3,0),.6,new THREE.Color(1.6,2,2.4))}else{S.in=0;S.heat=Math.min(100,S.heat+dt*(d<S.r?0:3))}
  if(S.heat<=0){for(const g of M1.goons)if(!g.dead&&g.S===S){g.leave=1;g.st='flee';g.ft=99}feed('🚿 HEAT LOST · the police drive past',300,'#4ceaff');M1_snd('style');return qvNext(ch)}})(M1_stage);
qvTgt=(f=>function(ch){const V=ch.v2,S=V&&V.L.st[V.si];if(ch.m.m1&&S&&(S.t==='heat'||S.t==='leap')){V.tg.x=S.x;V.tg.z=S.z;return V.tg}return f(ch)})(qvTgt);
M1_hint=(f=>function(){const o=f(),ch=RO.ch;if(!o||!M3_mine(ch))return o;const S=ch.v2.L.st[ch.v2.si];if(S.t==='heat'||S.t==='leap')o.mode='stop';return o})(M1_hint);
qvLand=(f=>function(ch,d){const V=ch.v2,S=V&&V.L.st[V.si];if(M3_mine(ch)&&S&&S.t==='leap'){if(S.tk&&d>=S.d){feed(`🛫 BRIDGE LEAP ${Math.round(d)} m`,500,'#ff2d95');M1_snd('style');slowmo=Math.max(slowmo,.5);return qvNext(ch)}if(d>8)say('',S.tk?`${Math.round(d)} m · need ${S.d} m · faster!`:'HOP FROM THE BRIDGEHEAD RING',1.4);return}return f(ch,d)})(qvLand);
qvHud=(f=>function(){f();const ch=RO.ch;if(!M3_mine(ch)||!ch.v2)return;const S=ch.v2.L.st[ch.v2.si];if(!S)return;const p=huQ('#qTrk p');if(!p)return;let x='';
  if(S.t==='heat')x=` · 🚨 heat ${Math.ceil(S.heat)}%`;else if(S.race&&M3.R)x=M3.R.list.map(r=>` · ${r.ic||'🏎'} ${r.name.split(' ')[0]} ${r.gap>20?'AHEAD '+Math.round(r.gap)+' m':r.gap<-20?'behind':'level'}`).join('');else if(S.esc){const k=M1.goons.find(g=>g.S===S&&g.kind==='kaiser'&&!g.dead);if(k)x=` · 👑 ${k.hp}/${k.hp0}`}
  if(x&&!p.textContent.endsWith(x))huT(p,S.txt+x)})(qvHud);
qvMiniQ=(f=>function(pin,R0,s){f(pin,R0,s);if(M3.R)for(const r of M3.R.list)pin(r.x,r.z,r.col||'#ffd400',r.ic||'🏎',false)})(qvMiniQ);
// ---------- abilities: Rocket Hop (G / touch 🚀), Shockwave Landing (chapter-4 upgrade)
function M3_hop(){if(state!=='roam'||!RO.on||M1.cs||RO.card||RO.mapOpen||RO.frozen)return false;const s=M3_st();if(!s.hop)return false;if(M3.hcd>0){hitPop(`🚀 RECHARGING · ${Math.ceil(M3.hcd)} s`,'#9fb0c0');return false}
  const g=groundAt(RO.x,RO.z,RO.y+1);if(RO.y>g+.6||RO.vy>0)return false;RO.vy=21;RO.y+=.1;RO.v=(Math.abs(RO.v)<24?24:Math.abs(RO.v))+6;RO.takeoff={x:RO.x,z:RO.z,r:null};M3.hcd=5;M3.air=1;M3.airT=0;M3.log.hop++;
  try{AU.sfx('launch')}catch(e){}fovKick=Math.max(fovKick,10);burst(FIRE,V3(RO.x,RO.y+.5,RO.z),26,18,.6,new THREE.Color(2.4,1.2,.3));feed('🚀 ROCKET HOP',0,'#ff9a3c');M3_tw();return true}
function M3_shock(){M3.log.shock++;const at=V3(RO.x,RO.y+1,RO.z);for(let k=0;k<8;k++){const a=k/8*6.283;burst(SPARK,V3(RO.x+Math.cos(a)*8,RO.y+1,RO.z+Math.sin(a)*8),20,22,.6,new THREE.Color(.6,2,2.6))}shake=Math.max(shake,.6);M1_snd('boom');let n=0;
  for(const g of M1.goons)if(!g.dead&&!g.leave&&Math.hypot(g.x-RO.x,g.z-RO.z)<28){n++;M1_hitGoon(g,2,'⚡ SHOCKWAVE')}if(M3.R)for(const r of M3.R.list)if(!r.nostall&&Math.hypot(r.x-RO.x,r.z-RO.z)<28){r.stall=2.4;n++}hitPop(n?`⚡ SHOCKWAVE ×${n}`:'⚡ SHOCKWAVE','#4ceaff')}
function M3_tw(){let w=$('#tM3');if(!w){const t=$('#touch');if(!t)return;w=document.createElement('button');w.className='tbtn';w.id='tM3';w.textContent='🚀';t.appendChild(w);tb('#tM3',()=>M3_hop(),()=>{})}
  const show=state==='roam'&&TOUCH.on&&!$('#touch').hidden&&!!(M1.s&&M3_st().hop)&&!M1.cs&&CID==='fra';w.style.display=show?'grid':'none';if(!show)return;const L=['#tB','#tD','#tN','#tF','#tG'].map(s=>$(s)).filter(e=>e&&e.offsetParent!==null).map(e=>e.getBoundingClientRect()).filter(r=>r.width>4);if(!L.length)return;
  const top=Math.min(...L.map(r=>r.top)),right=Math.max(...L.map(r=>r.right)),sz=Math.round(clamp(Math.min(innerWidth,innerHeight)*.15,48,64));w.style.width=w.style.height=sz+'px';w.style.fontSize=Math.round(sz*.42)+'px';w.style.left=Math.round(right-2*sz-18)+'px';w.style.top=Math.round(Math.max(56,top-sz-14))+'px';w.style.right='auto';w.style.bottom='auto';w.classList.toggle('dim',M3.hcd>0)}
addEventListener('keydown',e=>{if(state!=='roam'||e.repeat||M1.cs)return;if(e.code==='KeyG'){if(!$('#settings').hidden||RO.jOpen)return;e.preventDefault();M3_hop()}},true);
addEventListener('resize',()=>setTimeout(M3_tw,80));
// ---------- per-frame
function M3_tick(dt){if(!RO.on||CID!=='fra')return;M1_st();const s=M3_st();
  if(!M3.dev){M3.dev=1;try{if(/[?&]m3dev\b/.test(location.search))M3_unlock()}catch(e){}}
  if(M3_on()&&M1.mk&&!s.intro&&s.step===0&&!RO.ch&&!RO.sp&&!RO.card&&!M1.cs&&!RO.story&&!M1.pend&&!qvResOpen()){s.intro=1;M1_save();if(!M3_mark(M3_STORY[0]))M1_marks();M3_intro()}
  M3.hcd=Math.max(0,M3.hcd-dt);if(M3.air){M3.airT+=dt;const g=groundAt(RO.x,RO.z,RO.y+1);if(M3.airT>.3&&RO.vy<=0&&RO.y<=g+.3){M3.air=0;if(s.shock)M3_shock()}}
  M3_eprojStep(dt);const ch=RO.ch;if(ch&&ch.v2&&M3_RACE[ch.m.ev.mid]&&(!M3.R||M3.Rch!==ch)){const S0=ch.v2.L.st[ch.v2.si];if(S0&&S0.race)M3_rvInit(ch)}
  if(M3_mine(ch)&&ch.v2){const S=ch.v2.L.st[ch.v2.si];
    for(const g of M1.goons){if(g.siren&&!g.dead)g.m.children[2].material=M3_sir()[Math.floor(T*5+g.id)%2];if(g.kz&&!g.dead&&S&&S.mines&&g.S===S){g.mT-=dt;if(g.mT<=0&&Math.hypot(g.x-RO.x,g.z-RO.z)<200){g.mT=2.6;M1.mines.push(M1_mine(g.x-Math.sin(g.h)*7,g.z-Math.cos(g.h)*7,'enemy'))}}}
    if(S&&S.esc){const k=M1.goons.find(g=>g.S===S&&g.kind==='kaiser'&&!g.dead);if(k){S.escT-=dt;if(S.escT<=0){S.escT=22;if(M1.goons.filter(g=>!g.dead&&!g.S).length<3){M1_spawn(null,'rammer',2,null,120,200);M1_radio('KAISER',['Boys! <b>Escort!</b>','More of my crew, rookie. Enjoy.','Schattenwerk, to me!'][Math.floor(Math.random()*3)])}}
      if(k.hp<M3.khp){M3.khp=k.hp;if(k.hp>0&&k.hp<k.hp0)M1_radio('KAISER',k.hp>6?'A scratch. <b>Nothing more.</b>':k.hp>2?'My paint! You will <b>pay</b> for that!':'No... not like this!');if(k.hp<=4){for(let q=0;q<3;q++)M1.mines.push(M1_mine(k.x+rr(-8,8),k.z+rr(-8,8),'enemy'))}}}}}
  if((M3.twT=(M3.twT||0)-dt)<=0){M3.twT=.5;M3_tw()}}
qvTick=(f=>function(dt){f(dt);try{M3_tick(dt)}catch(e){if(!M3.err){M3.err=1;console.warn('M3',e)}throw e}})(qvTick);
function M3_unlock(){const s=M1_st();s.M2_done=1;s.step=Math.max(s.step,4);s.wpn=1;s.fresh=0;M1_save();if(RO.on&&CID==='fra'&&qvGraph()){M1_marks();M1_boxesCity()}return true}
window.__m3={M3,st:()=>M3_st(),on:()=>M3_on(),unlock:()=>M3_unlock(),story:M3_STORY.slice(),def:id=>{const D=M3_DEF[id];return D&&{ph:D.ph.slice(),g:D.g,ch:D.ch}},
 start:id=>{const m=M3_mark(id)||M3_mkMark(id);M1.hp=100;chStart(m,{});return !!RO.ch},hop:()=>M3_hop(),setStep:n=>{const s=M3_st();s.step=n;s.hop=n>3?1:0;s.shock=n>7?1:0;s.intro=1;M1_save();M1_marks();return s},
 rv:()=>M3.R&&M3.R.list.map(r=>({who:r.who,s:+r.s.toFixed(1),gap:Math.round(r.gap),x:r.x,z:r.z})),marks:()=>RO.marks.filter(m=>m.m3).map(m=>({id:m.ev.mid,x:m.x,z:m.z})),log:()=>({...M3.log})};
queueMicrotask(()=>{if(window.__mho)window.__mho.m3=window.__m3});
