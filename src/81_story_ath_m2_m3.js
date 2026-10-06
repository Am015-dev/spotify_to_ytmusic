// ===== ATC: Athens campaign "Drakos' Akropolis" (docs/fun_redesign.md §3.4): 3 chapters × (3 story missions + a rival race) + a reward.
// Built on m1.js: missions are M1_DEF entries (kind 'm1'), so the M1 scene, goon, checkpoint and stage engine run them unchanged.
// 4-district split: every stage is tagged with its district; a mission either stays inside one district or routes through an
// 'atcGate' stage (a real DRIVE TO gate). At the gate the mission state is saved, the district reloads, and the mission resumes
// at the first stage of the new district. Self-contained: globals are prefixed ATC_, existing functions are wrapped by re-binding.
CK.push('mho_atc');CITYK.push('mho_atc');
const ATC={s:null,slot:null,mk:0,pendT:0,away:0,awT:0,tauntT:8};
Object.assign(M1_WHO,{ELENI:{n:'Eleni',col:'#0d5eaf',em:'🔧'},YIAYIA:{n:'Yiayia Froso',col:'#ffb347',em:'🥨'},MARIA:{n:'Kyria Maria',col:'#c9a227',em:'🏺'},
 PAPPAS:{n:'Yiannis Pappas',col:'#ff2d55',em:'🏎'},LAMBROU:{n:'Katerina Lambrou',col:'#4ab0e8',em:'🏎'},DRAKOS:{n:'Thanos Drakos',col:'#9dff3c',em:'🐉'},SPIROS:{n:'Spiros',col:'#d02a2a',em:'🛵'}});
M1_GK.moped={geo:'sedan-sports',sc:2.2,hp:1,dmg:6,v:1.15,col:'#d02a2a'};
// Drakos' moped riders: a scooter + minifig rider instead of the car body
M1_goon=(f=>function(kind,x,z,o){const g=f(kind,x,z,o);if(kind==='moped'){const m=g.m,b=m.children[0];if(b)b.visible=false;const M=new THREE.MeshStandardMaterial({color:0xd02a2a,roughness:.5}),D=new THREE.MeshStandardMaterial({color:0x18181d,roughness:.6});
  box(m,M,1.1,1.2,3.4,0,1.1,0);box(m,D,.4,1.4,.4,0,2.1,1.2);for(const zz of[-1.3,1.3]){const w=new THREE.Mesh(new THREE.CylinderGeometry(.75,.75,.5,10).rotateZ(Math.PI/2),D);w.position.set(0,.75,zz);m.add(w)}const fg=minifig('#18181d');fg.scale.setScalar(.75);fg.position.set(0,1.5,-.3);m.add(fg)}return g})(M1_goon);
const ATC_W=(e,n)=>{const[x,z]=WP(e,n);return{x,z}},ATC_P=(e,n,R)=>{const[x,z]=WP(e,n);return M1_P(x,z,R)};
const ATC_D=(x,z)=>{const[e,n]=RW(x,z);return athDistAt(e,n)};
// race builder: gates along a street path, three phases, item boxes on the line (spawned in ATC_tick)
function ATC_race(c,pts,lab){const W=pts.map(p=>ATC_P(p[0],p[1]));W[0]={x:c.O.x,z:c.O.z};const R=M1_path(W),L=R.L;c.L.rp=R;const n=clamp(Math.round(L/380),10,24);let lj=-1;
 for(let k=1;k<=n;k++){const a=qvSnap(R.P,R.C,L*k/n);if(a.j===lj&&k<n)continue;lj=a.j;const f=k/n,ph=f<=.36?1:f<=.72?2:3;c.st.push({t:'go',ring:1,x:a.x,z:a.z,h:a.h,r:12,ph,cp:0,txt:k<n?`Gate ${k}/${n} · ${lab}`:'Finish line!',ic:k<n?'🏁':'🏆',T:0,q:k>1&&k<n})}
 let last=0;for(const S of c.st){if(S.ph!==last){S.cp=1;last=S.ph}}const s2=c.st.find(S=>S.ph===2);if(s2)s2.hunt=2}
const ATC_G=(to,ph,txt,T)=>({t:'atcGate',to,ph,cp:1,txt:txt||`DRIVE TO ${ATH_DIST[to].name.toUpperCase()} ▶`,ic:'🚪',T:T||180});
// ---------- the 12 campaign entries (real Athens places in metres east/north of Plateia Monastirakiou)
const ATC_DEF={
 atc_koulouri:{name:'Koulouri Rush',npc:'Yiayia Froso',who:'YIAYIA',em:'🥨',col:'#ffb347',g:[240,300,380],story:1,ch:1,d:'A',at:[30,40],
  hi:'My bakery van! Drakos’ boys took it, with three hundred koulouria inside!',win:'My koulouria! Still warm. You eat first, my child.',lose:'Oh no, they got away. Again, my child!',
  d2:'Yiayia’s bakery van was hijacked in Monastiraki. Ram it through Plaka before it hides in Koukaki, fight off Drakos’ boys, bring the bread home.',ph:['Van Chase','Plaka Brawl','Fresh Koulouria'],
  build(c){const H=ATC_P(120,-1120),M=ATC_P(30,40),B=ATC_P(-60,250);c.st.push({t:'chase',ph:1,cp:1,x:H.x,z:H.z,rams:4,txt:'Ram Yiayia’s bakery van 4× before it hides in Koukaki',ic:'🚐',T:150,scene:'atc_koulouri',x2:40},
   {t:'goons',ph:2,cp:1,wave:[['rammer',3]],need:3,txt:'Drakos’ boys want the van back: take down 3',ic:'💥',T:90,bonus:10,x2:40},
   {t:'go',ph:3,cp:1,ring:1,x:M.x,z:M.z,r:14,txt:'Back through Monastiraki square',ic:'⭕',T:90},{t:'go',ph:3,x:B.x,z:B.z,stop:1,txt:'Park at Yiayia’s bakery in Psyrri',ic:'🥨',T:90})}},
 atc_mopeds:{name:'Moped Swarm',npc:'Eleni',who:'ELENI',em:'🛵',col:'#d02a2a',g:[230,290,360],story:1,ch:1,d:'A',at:[480,10],
  hi:'Drakos’ moped gang is snatching tourist bags on Ermou. Twelve riders. Clear the street!',win:'Ermou is quiet. The tourists are buying you frappé.',lose:'The mopeds are quick. Ram them before they turn!',
  d2:'Take down 12 moped riders on Ermou in two swarms, then their leader Spiros, and return the bags.',ph:['First Swarm','Second Swarm','Spiros','Bags Back'],
  build(c){const M=ATC_P(30,40);c.st.push({t:'goons',ph:1,cp:1,wave:[['moped',6]],need:6,txt:'Swarm 1: take down 6 moped riders',ic:'🛵',T:100,bonus:8,scene:'atc_mopeds',x2:40},
   {t:'goons',ph:2,cp:1,wave:[['moped',5],['rammer',1]],need:6,txt:'Swarm 2: 6 more riders',ic:'🛵',T:100,bonus:8,x2:40},
   {t:'goons',ph:3,cp:1,wave:[['lt',1]],need:1,txt:'Spiros, the gang leader: 4 HP, drops mines',ic:'😈',T:80,x2:30},
   {t:'go',ph:4,cp:1,x:M.x,z:M.z,stop:1,txt:'Return the bags at Monastiraki square',ic:'👜',T:120})}},
 atc_climb:{name:'Acropolis Climb',npc:'Eleni',who:'ELENI',em:'🏛',col:'#e8b04a',g:[200,250,320],story:1,ch:1,d:'A',at:[-330,-200],
  hi:'Pappas says no rookie can climb to the Parthenon road in style. Prove him wrong.',win:'Under the Parthenon, sideways. Pappas saw it. He wants a race.',lose:'Too slow for the sacred rock. Again!',
  d2:'A stunt climb: up Apostolou Pavlou, along Dionysiou Areopagitou under the Parthenon, a drift through Plaka, then the photo spot.',ph:['Apostolou Pavlou','Under the Parthenon','Plaka Drift','Photo Finish'],
  build(c){const F=ATC_P(240,-430),R=M1_path([{x:c.O.x,z:c.O.z},ATC_P(-230,-560),ATC_P(-160,-690),ATC_P(250,-745)]),n=clamp(Math.round(R.L/260),4,10);let lj=-1;
   for(let k=1;k<=n;k++){const q=qvSnap(R.P,R.C,R.L*k/n);if(q.j===lj&&k<n)continue;lj=q.j;const ph=k<=n/2?1:2;c.st.push({t:'go',ph,cp:k===1||(ph===2&&!c.st.some(S=>S.ph===2))?1:0,ring:1,x:q.x,z:q.z,r:14,txt:ph===1?`Climb to the Parthenon road · ring ${k}/${n}`:`Under the Parthenon · ring ${k}/${n}`,ic:'⭕',T:Math.round(R.L/n/22+20),scene:k===1?'atc_climb':null})}
   c.st.push({t:'driftzone',ph:3,cp:1,win:28,p:450,txt:'Drift 450 points in 28 s through Plaka',ic:'🌀',T:40,x2:20},{t:'go',ph:4,cp:1,x:F.x,z:F.z,stop:1,txt:'Stop at the Anafiotika photo spot',ic:'📸',T:90})}},
 atc_pappas:{name:'Street Duel: Yiannis Pappas',npc:'Yiannis Pappas',who:'PAPPAS',em:'🏎',col:'#ff2d55',g:[240,290,350],story:1,race:1,ch:1,d:'A',at:[60,60],items:1,rv:{n:'PAPPAS',col:'#ff2d55',base:37,lose:'PAPPAS WON THE DUEL'},
  hi:'Welcome to Athens, rookie! Monastiraki, Ermou, the Parthenon road and back. Items on.',win:'Bravo! You drive like a local. Here, take Eleni’s little secret.',lose:'Ha! Athens is not Frankfurt. Again?',
  d2:'Point-to-point race against Yiannis Pappas around the Historic Centre with item boxes on. Drakos’ boys join halfway.',ph:['Ermou','Parthenon Road','Home Straight'],
  build(c){ATC_race(c,[[60,60],[480,10],[700,-60],[700,-380],[572,-640],[250,-745],[-160,-690],[-300,-330],[-350,-60],[-150,40],[60,60]],'beat Pappas to Monastiraki')}},
 atc_amphora:{name:'The Stolen Amphora',npc:'Kyria Maria',who:'MARIA',em:'🏺',col:'#c9a227',g:[330,400,480],story:1,ch:2,d:'A',at:[261,-800],
  hi:'They stole the Panathenaic amphora from the Acropolis Museum! Two vans, rookie!',win:'The amphora is safe in the Benaki. Twenty-five centuries and one rookie.',lose:'The amphora! Careful, it is older than Athens’ traffic!',
  d2:'Ram the two thief vans in the Historic Centre, carry the amphora through the DRIVE TO gate into Syntagma · Kolonaki, survive the ambush, deliver it to the Benaki Museum.',ph:['Museum Thieves','Through the Gate','Ambush','Benaki Museum'],
  build(c){const V=ATC_P(1110,-40),Bk=ATC_P(1170,-20);c.st.push({t:'thieves',ph:1,cp:1,txt:'Two thief vans! Ram each one 3×',ic:'🚐',T:200,scene:'atc_amphora',list:[{to:ATC_P(-600,250),rams:3},{to:ATC_P(300,700),rams:3,drop:1}],x2:60},
   ATC_G('B',2,'Amphora on board · DRIVE TO SYNTAGMA · KOLONAKI ▶'),
   {t:'go',ph:3,cp:1,ring:1,x:V.x,z:V.z,r:16,txt:'Onto Vasilissis Sofias',ic:'⭕',T:120},{t:'survive',ph:3,cp:1,dur:45,max:3,txt:'Ambush! Survive 45 s, keep the amphora',ic:'🛡',T:90,x2:40},
   {t:'go',ph:4,cp:1,x:Bk.x,z:Bk.z,stop:1,txt:'Deliver the amphora to the Benaki Museum',ic:'🏺',T:120})}},
 atc_metro:{name:'Beat the Metro',npc:'Eleni',who:'ELENI',em:'🚇',col:'#36d17a',g:[200,250,310],story:1,ch:2,d:'B',at:[880,-60],rv:{n:'METRO',col:'#36d17a',base:30,lose:'THE METRO REACHED OMONIA FIRST',metro:1,from:2},
  hi:'Line 2 leaves Syntagma for Omonia in one minute. Lambrou says you cannot beat it over ground.',win:'Omonia before the train! Lambrou owes you a souvlaki.',lose:'The metro was faster. Rush hour is no excuse!',
  d2:'Race the metro from Syntagma to Omonia over ground: out through the DRIVE TO gate into the Historic Centre, then Stadiou to Omonia before the train.',ph:['Syntagma','Through the Gate','Stadiou Sprint'],
  build(c){const S0=ATC_P(900,60),PT=[[600,260],[470,520],[330,720],[192,877]];if(ATHD==='A')c.L.rp=M1_path([{x:RO.x,z:RO.z},...PT.map(p=>ATC_P(p[0],p[1]))]);c.st.push({t:'go',ph:1,cp:1,ring:1,x:S0.x,z:S0.z,r:16,txt:'Round Syntagma square',ic:'⭕',T:60,scene:'atc_metro'},ATC_G('A',2,'DRIVE TO THE HISTORIC CENTRE ▶ · the metro is running',90));
   PT.forEach((p,k)=>{const q=ATC_P(p[0],p[1]);c.st.push({t:'go',ph:3,cp:k===0?1:0,ring:k<3?1:0,stop:k===3?1:0,x:q.x,z:q.z,r:k<3?14:16,txt:k<3?`Stadiou gate ${k+1}/3 · beat the train`:'Stop at Omonia before the metro',ic:k<3?'🚇':'🏁',T:k===0?70:45})})}},
 atc_lyka:{name:'King of Lycabettus',npc:'Eleni',who:'ELENI',em:'⛰',col:'#6ad06a',g:[220,270,340],story:1,ch:2,d:'B',at:[1335,130],
  hi:'Drakos wants a flag on Lycabettus so all Athens can see it. Take the hill and hold it.',win:'Your flag over Athens. Even Drakos can see it from Marousi.',lose:'They pushed you off the hill. Hold the summit!',
  d2:'Climb the Lycabettus road, hold the summit zone for 60 s against Drakos’ cars, then wreck his lieutenant.',ph:['The Climb','Hold the Summit','The Lieutenant'],
  build(c){const A=ATC_P(1420,420),Sm=ATC_P(1552,643);c.st.push({t:'go',ph:1,cp:1,ring:1,x:A.x,z:A.z,r:16,txt:'Up the Lycabettus road',ic:'⛰',T:90,scene:'atc_lyka'},{t:'go',ph:1,ring:1,x:Sm.x,z:Sm.z,r:16,txt:'Reach the summit',ic:'🚩',T:90},
   {t:'survive',ph:2,cp:1,dur:60,max:4,koth:{x:Sm.x,z:Sm.z,r:120},txt:'Hold the summit 60 s · stay inside the zone',ic:'👑',T:120,x2:50},{t:'goons',ph:3,cp:1,wave:[['lt',1]],need:1,txt:'Drakos’ lieutenant: 4 HP, drops mines',ic:'😈',T:80,x2:30})}},
 atc_lambrou:{name:'Street Duel: Katerina Lambrou',npc:'Katerina Lambrou',who:'LAMBROU',em:'🏎',col:'#4ab0e8',g:[260,310,380],story:1,race:1,ch:2,d:'B',at:[900,-90],items:1,rv:{n:'LAMBROU',col:'#4ab0e8',base:39,lose:'LAMBROU WON THE DUEL'},
  hi:'I know every lane from Syntagma to the Hilton. Vasilissis Sofias, the long way. Items on.',win:'Clean driving. Take this, you will need it against Drakos.',lose:'Sofias is my avenue. Come back faster.',
  d2:'Race Katerina Lambrou down Vasilissis Sofias past the Hilton and the Megaro, back by Kolonaki. Item boxes on.',ph:['Vasilissis Sofias','Megaro','Kolonaki Sprint'],
  build(c){ATC_race(c,[[900,-90],[1200,-40],[1700,-40],[2348,-42],[2512,520],[2100,450],[1700,300],[1335,130],[1150,0],[900,-90]],'beat Lambrou to Syntagma')}},
 atc_blackout:{name:'Blackout at Syntagma',npc:'Eleni',who:'ELENI',em:'⚡',col:'#ffd12c',g:[260,320,400],story:1,ch:3,d:'B',at:[880,-30],
  hi:'Drakos hooked four generators to the Syntagma lights. One switch and the whole centre goes dark.',win:'Lights on, Syntagma! Drakos is furious. Good.',lose:'Dark again. Smash those generators faster!',
  d2:'Smash Drakos’ 4 generators around Syntagma at 80+ km/h, survive the riot, then wreck his lieutenant.',ph:['Generators','Riot','The Lieutenant'],
  build(c){const it=[[880,-60],[1000,-150],[960,110],[1120,-260]].map(p=>{const q=ATC_P(p[0],p[1]);return[q.x,q.z,0]});
   c.st.push({t:'booths',ph:1,cp:1,items:it,guards:2,txt:'Smash the 4 generators at 80+ km/h',ic:'⚡',T:160,scene:'atc_blackout',x:it[0][0],z:it[0][1],x2:50},
   {t:'survive',ph:2,cp:1,dur:60,max:3,txt:'Riot! Survive 60 s, wreck what you can',ic:'💥',T:110,x2:50},{t:'goons',ph:3,cp:1,wave:[['lt',1],['shield',1]],need:2,txt:'The lieutenant + a shield car (BOOST-ram it)',ic:'😈',T:100,x2:40})}},
 atc_kifisias:{name:'Kifisias Convoy',npc:'Eleni',who:'ELENI',em:'🚚',col:'#d07ad0',g:[340,420,520],story:1,ch:3,d:'C',at:[3099,943],
  hi:'Drakos moves the Akropolis Cup up Kifisias tonight. Tail his courier, do not lose him.',win:'You found his garage in Chalandri. Now he has to race you.',lose:'The convoy got away up Kifisias!',
  d2:'Tail Drakos’ courier up Leoforos Kifisias, follow him through the DRIVE TO gate into Chalandri · Marousi, then ram the convoy and reach Plateia Chalandriou.',ph:['Tail the Courier','Kifisias Gate','Convoy Split','Chalandri'],
  build(c){const K=[[3350,1350],[3750,2050],[4150,2750],[4600,3400]].map(p=>ATC_P(p[0],p[1])),Ch=ATC_P(6350,5073);
   c.st.push({t:'tail',ph:1,cp:1,via:K.slice(0,3),to:K[3],txt:'Tail the courier up Kifisias · stay within 180 m',ic:'🐉',T:200,max:180,scene:'atc_kifisias',x2:40},ATC_G('D',2,'The courier crossed! DRIVE TO CHALANDRI · MAROUSI ▶'),
   {t:'thieves',ph:3,cp:1,txt:'The convoy splits! Ram both trucks 3×',ic:'🚚',T:200,list:[{to:ATC_P(6800,5600),rams:3},{to:ATC_P(5900,4300),rams:3,drop:1}],x2:60},
   {t:'go',ph:4,cp:1,x:Ch.x,z:Ch.z,stop:1,txt:'Stop at Plateia Chalandriou',ic:'🏁',T:150})}},
 atc_taverna:{name:'Taverna Night',npc:'Yiayia Froso',who:'YIAYIA',em:'🍷',col:'#ff2d95',g:[150,190,240],story:1,ch:3,d:'A',at:[300,-300],
  hi:'All of Plaka is coming to my taverna to watch you before the big race. Give them a show!',win:'Yes! The whole of Plaka is shouting your name.',lose:'The crowd went home early. Try again!',
  d2:'The Plaka street party: a 15-smash chain, a drift show for the crowd, then a grand arrival at Yiayia’s taverna.',ph:['Smash Show','Drift Show','Grand Arrival'],
  build(c){const T2=ATC_P(240,-420);c.st.push({t:'chain',ph:1,cp:1,need:15,txt:'Smash 15 things in one CHAIN for the crowd',ic:'💥',T:60,scene:'atc_taverna',x2:30},{t:'driftzone',ph:2,cp:1,win:30,p:520,txt:'Drift show: 520 points in 30 s',ic:'🌀',T:40,x2:20},
   {t:'go',ph:3,cp:1,x:T2.x,z:T2.z,stop:1,txt:'Arrive at Yiayia’s taverna',ic:'🍷',T:90})}},
 atc_drakos:{name:'Finale: Thanos Drakos',npc:'Thanos Drakos',who:'DRAKOS',em:'🐉',col:'#9dff3c',g:[260,310,380],story:1,race:1,ch:3,d:'B',at:[1369,-830],items:1,rv:{n:'DRAKOS',col:'#101014',base:41,lose:'DRAKOS KEEPS THE CUP'},
  hi:'A tourist in my stadium? From the Kallimarmaro and back. The Akropolis Cup never leaves my hands.',win:'...Take the cup. Take my car. Athens is yours, tourist.',lose:'The marble remembers only one name. Mine.',
  d2:'The finale: race Thanos Drakos from the Panathenaic Stadium around Syntagma · Kolonaki and back into the Kallimarmaro. His whole crew joins in.',ph:['Out of the Stadium','Vasilissis Sofias','Into the Kallimarmaro'],
  build(c){ATC_race(c,[[1369,-830],[1290,-480],[1200,-40],[1700,-40],[2348,-42],[2250,-400],[1800,-600],[1500,-760],[1369,-830]],'beat Drakos to the Kallimarmaro');const s3=c.st.find(S=>S.ph===3);if(s3)s3.hunt=2}}};
const ATC_ORDER=Object.keys(ATC_DEF);
for(const id of ATC_ORDER){const D=ATC_DEF[id];D.d0=D.d;D.atc=1;M1_DEF[id]={...D,d:D.d2,build(c){D.build(c);ATC_tag(c.st,D.d0)}}}
// district of every stage (positionless stages inherit it); the first stage of each district is where a mission resumes
function ATC_tag(st,d){for(const S of st){S.dd=d;if(S.t==='atcGate')d=S.to}for(let i=0;i<st.length;i++)if(st[i].t==='atcGate'&&st[i+1])st[i].aim=st.slice(i+1).find(S=>S.x!=null)||null}
function ATC_cont(st,d){for(let i=0;i<st.length;i++)if(st[i].dd===d&&(i===0||st[i-1].t==='atcGate'))return i;return -1}
// ---------- scenes and radio
function ATC_car(col,trim){return M1_obj({m:M1_car('sedan-sports',col,2.9,trim||'#ffffff')}).m}
function ATC_ahead(d){return{x:RO.x+Math.sin(RO.h)*d,z:RO.z+Math.cos(RO.h)*d}}
Object.assign(M1_SC,{
 atc_koulouri:(ch,S)=>{const a=ATC_ahead(18),Y=ATC_car('#ffb347');M1_put(Y,RO.x+Math.cos(RO.h)*9,RO.z-Math.sin(RO.h)*9,RO.h);M1_scene({cam:{a:()=>({x:RO.x,z:RO.z}),b:()=>a},lines:[['YIAYIA','Help! Drakos’ boys took my bakery van, with three hundred koulouria inside!'],['ELENI','Welcome to Athens, rookie. Ram that van until it gives up. Plaka is narrow, mind the stalls.'],['DRAKOS','Athens belongs to the Schattenwerk now, tourist. <b>Go home.</b>']],end(){Y.visible=false}})},
 atc_mopeds:(ch,S)=>M1_scene({cam:{mode:'orbit',a:()=>({x:RO.x,z:RO.z}),r:40,h:16},lines:[['ELENI','Ermou, the marble street. Drakos’ moped gang is snatching bags from every tourist.'],['SPIROS','Beep beep, slow car! Catch us if you can!']]}),
 atc_climb:(ch,S)=>M1_scene({cam:{mode:'orbit',a:()=>ATC_W(65,-490),r:160,h:70},lines:[['PAPPAS','The Parthenon road is for drivers, not tourists. Show me some style under the rock.'],['ELENI','Rings up Apostolou Pavlou, then Dionysiou Areopagitou. And drift, he loves a drift.']]}),
 atc_amphora:(ch,S)=>M1_scene({cam:{mode:'orbit',a:()=>({x:RO.x,z:RO.z}),r:50,h:20},lines:[['MARIA','They took the Panathenaic amphora from the museum! Two vans, heading into the old town!'],['ELENI','Ram them, then take the amphora to the Benaki on Vasilissis Sofias. That means the <b>DRIVE TO</b> gate.']]}),
 atc_metro:(ch,S)=>M1_scene({cam:{mode:'orbit',a:()=>({x:RO.x,z:RO.z}),r:44,h:18},lines:[['LAMBROU','Line 2, Syntagma to Omonia. Nobody beats it over ground. Nobody.'],['ELENI','Out through the gate, down Stadiou, stop at Omonia. The train is the green car. <b>Go!</b>']]}),
 atc_lyka:(ch,S)=>M1_scene({cam:{mode:'orbit',a:()=>ATC_W(1552,643),r:180,h:90},lines:[['DRAKOS','I will plant my flag on Lycabettus. All Athens will look up and see the dragon.'],['ELENI','Then the hill is ours first. Climb, hold the top, push his cars off.']]}),
 atc_blackout:(ch,S)=>M1_scene({cam:{mode:'orbit',a:()=>({x:RO.x,z:RO.z}),r:60,h:26},lines:[['DRAKOS','Lights out, Syntagma. Let the city see who really runs it.'],['ELENI','Four generators around the square. Hit them at 80 or more, rookie!']]}),
 atc_kifisias:(ch,S)=>M1_scene({cam:{mode:'orbit',a:()=>({x:RO.x,z:RO.z}),r:50,h:22},lines:[['ELENI','That black car carries the Akropolis Cup up Kifisias. Tail it. Do not ram it yet.'],['DRAKOS','Follow me if you like. Marousi is a long way from home, tourist.']]}),
 atc_taverna:(ch,S)=>M1_scene({cam:{mode:'orbit',a:()=>({x:RO.x,z:RO.z}),r:36,h:14},lines:[['YIAYIA','The whole of Plaka is here! Smash, drift, make them shout. Then come in and eat!'],['ELENI','Tomorrow is the finale against Drakos. Tonight, give them a show.']]})});
Object.assign(M1_RADIO,{atc_koulouri:{1:['DRAKOS','You hit my van? My boys will hit <b>you</b>.'],2:['YIAYIA','My van! Bring it home to Psyrri, my child!']},atc_mopeds:{2:['SPIROS','You wrecked my riders? I drop mines, slow car!'],3:['ELENI','Bags back to Monastiraki. The tourists are waiting.']},
 atc_climb:{2:['PAPPAS','The Parthenon is watching. Do not embarrass yourself!']},atc_pappas:{0:['PAPPAS','Gates on the road, items in the ? boxes. <b>Let’s go!</b>']},
 atc_amphora:{1:['ELENI','Got the amphora? Now the <b>DRIVE TO</b> gate. The mission carries on in the next district.'],3:['DRAKOS','That amphora is mine. Boys, take it back!']},atc_metro:{1:['ELENI','Through the gate! The train leaves when you cross.']},
 atc_lyka:{2:['ELENI','Stay inside the summit zone! Leave it too long and the hill is his.'],3:['DRAKOS','My lieutenant will throw you off my hill.']},atc_lambrou:{0:['LAMBROU','Sofias is mine. Try to keep up.']},
 atc_blackout:{1:['DRAKOS','You turned my lights back on? Riot, boys!']},atc_kifisias:{1:['ELENI','He is crossing into Chalandri! Follow him through the <b>DRIVE TO</b> gate.'],2:['ELENI','The convoy splits! Ram both trucks!']},
 atc_taverna:{1:['YIAYIA','Now! Drift for them!']},atc_drakos:{0:['DRAKOS','Three laps of my city would be too kind. One run. <b>Go.</b>']}});
const ATC_TAUNT={PAPPAS:[['Bravo, but too slow!','The Parthenon has seen faster donkeys!'],['Hey! Nobody passes Pappas on his street!']],LAMBROU:[['Clean lines win races, rookie.','I can see you in my mirror. Small.'],['Lucky gap. It will not last.']],
 DRAKOS:[['Enjoy the view of my city, tourist.','The Cup stays in the Kallimarmaro.'],['Impossible! Boys, stop that car!']],METRO:[['Next stop: Panepistimio.','Please mind the gap.'],['The metro is delayed. Hurry, it will catch up!']]};
// ---------- state
function ATC_st(){if(ATC.slot!==SLOT){ATC.slot=SLOT;ATC.s=null;ATC.mk=0}if(!ATC.s)ATC.s=store.get('mho_atc',null)||{v:1,step:0,done:{},rw:{},pend:null};return ATC.s}
function ATC_save(){store.set('mho_atc',ATC.s)}
const ATC_isA=ch=>!!(ch&&ch.m&&ch.m.atc),ATC_chN=id=>ATC_DEF[id]?ATC_DEF[id].ch:0;
// ---------- marks (only the current story step, only in its start district)
function ATC_mkMark(id){const D=ATC_DEF[id],a=SM_ON||D.d0===ATHD?ATC_P(D.at[0],D.at[1],300):M1_P(RO.x,RO.z,300);const ev={id:id,mid:id,kind:'m1',npc:D.npc,name:D.name,em:D.em,col:D.col,hi:D.hi,win:D.win,lose:D.lose,d:D.d2,items:D.items};QAV[ev.id]=M1_av(D.who);
 const m=qvMk({kind:'quest',m1:1,atc:1,ev,x:a.x,z:a.z,h:0,icon:D.em,col:D.col});const r2=new THREE.Mesh(new THREE.TorusGeometry(12,.5,8,48),neonMat('#ffd400',2.6));r2.rotation.x=Math.PI/2;r2.position.y=.6;m.g.add(r2);if(RO.ch||RO.sp)m.g.visible=false;return m}
const ATC_mark=id=>RO.marks.find(m=>m.atc&&m.ev.mid===id);
function ATC_marks(){for(const m of RO.marks.filter(q=>q.atc)){RO.marks.splice(RO.marks.indexOf(m),1);RO.grp.remove(m.g)}ATC.mk=1;if(CID!=='ath')return;const s=ATC_st(),id=ATC_ORDER[s.step];if(!id||s.pend)return;if(SM_ON||ATC_DEF[id].d0===ATHD)ATC_mkMark(id)}
// ---------- NEXT guidance (Athens): the campaign step, or the district to drive to
function ATC_next(){const s=ATC_st();if(s.pend){const D=ATC_DEF[s.pend.mid];if(s.pend.d===ATHD)return{ic:'↪',t:'Resuming · '+D.name,sub:ATH_DIST[ATHD].name,act:'none'};return{ic:'🚪',t:'Continue · '+D.name,sub:`Drive to ${ATH_DIST[s.pend.d].name} · tap`,act:'dist',d:s.pend.d}}
 const id=ATC_ORDER[s.step];if(!id)return null;const D=ATC_DEF[id],pre=`CH ${D.ch} · `;if(!SM_ON&&D.d0!==ATHD)return{ic:'🗺',t:pre+D.name,sub:`Starts in ${ATH_DIST[D.d0].name} · tap to go`,act:'dist',d:D.d0};const m=ATC_mark(id);return{ic:D.em,t:pre+D.name,sub:m?districtAt(m.x,m.z):'',m,act:'route'}}
M1_next=(f=>function(){if(CID==='ath'){const n=ATC_next();if(n)return n}return f()})(M1_next);
M1_nextGo=(f=>function(){if(CID==='ath'&&state==='roam'){const n=M1_next();if(n&&n.act==='dist'){M1.lastNextGo=n;athDistPick(n.d);return}if(n&&n.act==='none')return}return f()})(M1_nextGo);
// ---------- start: a mission begun outside its start district resumes at that district's first stage (retry after a transfer)
chStart=(f=>function(m,o){if(m&&m.atc&&!M1.restoring){const D=ATC_DEF[m.ev.mid];if(!SM_ON&&D.d0!==ATHD){const L=qvPreview(m),i=ATC_cont(L.st,ATHD);if(i<0){say(D.name.toUpperCase(),'STARTS IN '+ATH_DIST[D.d0].name.toUpperCase(),1.8);return}M1.restoring={mid:m.ev.mid,si:i,x:RO.x,z:RO.z,h:RO.h,left:L.st[i].T||90,t:0,hp:100,ph:L.st[i].ph,vanAt:null,rv:null}}}
 const r=f(m,o);if(m&&m.atc&&RO.ch){M1.restoring=null;ATC.tauntT=10;const s=ATC_st();if(s.rw.ghost&&!M1.inv){M1.inv='ghost';M1_tw()}}return r})(chStart);
chEnd=(f=>function(v){const ch=RO.ch,a=ATC_isA(ch),id=a&&ch.m.ev.mid;f(v);if(a&&v!=null)ATC_done(id)})(chEnd);
qvFail=(f=>function(ch,why){if(ATC_isA(ch)){const D=ATC_DEF[ch.m.ev.mid];why=String(why||'').replace('LUCA ROSSI WON THE DUEL',D.rv?D.rv.lose:'YOUR RIVAL WON').replace('KAISER’S CREW','DRAKOS’ CREW').replace('KAISER GOT AWAY','THE COURIER GOT AWAY')}return f(ch,why)})(qvFail);
hitPop=(f=>function(t,col){if(ATC_isA(RO.ch)&&typeof t==='string'){const D=ATC_DEF[RO.ch.m.ev.mid];if(D.rv)t=t.replace('ROSSI',D.rv.n)}return f(t,col)})(hitPop);
qvTgt=(f=>function(ch){if(ATC_isA(ch)&&ch.v2){const S=ch.v2.L.st[ch.v2.si],tg=ch.v2.tg;if(S&&S.t==='atcGate'&&S.x!=null){tg.x=S.x;tg.z=S.z;return tg}
  if(S&&S.koth){const t=f(ch);if(!t||Math.hypot(t.x-S.koth.x,t.z-S.koth.z)>S.koth.r*.7||Math.hypot(RO.x-S.koth.x,RO.z-S.koth.z)>S.koth.r*.6){tg.x=S.koth.x;tg.z=S.koth.z;return tg}return t}}return f(ch)})(qvTgt);
qvEnter=(f=>function(ch,i){f(ch,i);if(ATC_isA(ch)&&ch.v2){const S=ch.v2.L.st[ch.v2.si];if(S&&S.t==='atcGate'&&!S.gs){S.gs=1;ATC_gateSetup(ch,S)}}})(qvEnter);
// ---------- the DRIVE TO gate inside a mission
function SM_gates(){if(SM_GT)return SM_GT;SM_GT=[];for(const S of CITY_S){if(!['arterial','main','sec','res','link'].includes(S.r.cls))continue;const P=S.pts;
  for(let i=1;i<P.length;i++){const a=athDistAt(...RW(P[i-1].x,P[i-1].z)),b=athDistAt(...RW(P[i].x,P[i].z));if(!a||!b||a===b)continue;
    for(const[q,to]of[[P[i],b],[P[i-1],a]])if(!SM_GT.some(g=>g.to===to&&Math.hypot(g.x-q.x,g.z-q.z)<70))SM_GT.push({x:q.x,z:q.z,to})}}return SM_GT}
function ATC_gateSetup(ch,S){const G=(SM_ON?SM_gates():HUB.gates||[]).filter(g=>g.to===S.to);const ref=S.aim||{x:RO.x,z:RO.z};let b=null,bd=1e18;for(const g of G){const d=Math.hypot(g.x-RO.x,g.z-RO.z)+Math.hypot(g.x-ref.x,g.z-ref.z)*.6;if(d<bd){bd=d;b=g}}
 if(!b){const[x,z]=WP(ATH_DIST[S.to].st[0],ATH_DIST[S.to].st[1]);b={x,z,to:S.to}}S.x=b.x;S.z=b.z;const r=new THREE.Mesh(new THREE.TorusGeometry(10,.6,8,40),neonMat(ATH_DIST[S.to].col,3));r.position.set(b.x,groundY(b.x,b.z)+6,b.z);r.rotation.y=Math.atan2(b.x-RO.x,b.z-RO.z);RO.grp.add(r);M1_obj({m:r});
 say('DRIVE TO GATE',ATH_DIST[S.to].name.toUpperCase()+' · THE MISSION CONTINUES THERE',1.8)}
function ATC_transfer(ch,S){if(SM_ON){const s=ATC_st(),V=ch.v2;s.pend={mid:ch.m.ev.mid,si:V.si+1,d:S.to,left:Math.max(V.left,60),t:+ch.t.toFixed(1),hp:Math.round(Math.max(60,M1.hp)),inv:M1.inv||null,from:ATHD};ATC_save();
  hitPop('📍 '+ATH_DIST[S.to].name.toUpperCase(),'#5dffb0');ATHD=S.to;chAbort();M1_clear();M1.cp=null;ATC.xfer=1;SM.xfer=(SM.xfer||0)+1;ATC_resume();return}const s=ATC_st(),V=ch.v2,D=ATH_DIST[S.to],[tx,tz]=WP(D.st[0],D.st[1]),dx=tx-S.x,dz=tz-S.z,dd=Math.hypot(dx,dz)||1,ax=S.x+dx/dd*45,az=S.z+dz/dd*45;
 s.pend={mid:ch.m.ev.mid,si:V.si+1,d:S.to,left:Math.max(V.left,60),t:+ch.t.toFixed(1),hp:Math.round(Math.max(60,M1.hp)),inv:M1.inv||null,from:ATHD};ATC_save();ATC.xfer=1;
 RO.ch=null;M1.cp=null;hitPop('🚪 '+D.name.toUpperCase(),'#5dffb0');athDistGo(S.to,ax,az,Math.atan2(dx,dz),1)}
function ATC_resume(){const s=ATC_st(),P=s.pend;if(!P||!ATC_DEF[P.mid])return(s.pend=null,ATC_save());const id=P.mid;let m=ATC_mark(id)||ATC_mkMark(id);const L=qvPreview(m),i=Math.min(P.si,L.st.length-1),S=L.st[i];
 s.pend=null;ATC_save();M1.hp=P.hp;if(P.inv)M1.inv=P.inv;M1.restoring={mid:id,si:i,x:RO.x,z:RO.z,h:RO.h,left:P.left,t:P.t,hp:P.hp,ph:S.ph,vanAt:null,rv:null};chStart(m,{O:{x:m.x,z:m.z}});M1.restoring=null;ATC.resumed=(ATC.resumed||0)+1;
 if(RO.ch)setTimeout(()=>{if(RO.ch&&!M1.cs)M1_radio('ELENI',`You made it to <b>${ATH_DIST[ATHD].name}</b>. ${S.txt}!`)},400)}
// ---------- progress + rewards (one new thing per chapter)
const ATC_RW={1:{k:'ghost',t:'GHOST unlocked',lines:[['PAPPAS','You beat me on my own street. Fine. Athens is yours to explore, rookie.'],['ELENI','A gift from my garage: the <b>GHOST</b>. Every mission starts with a ghost charge: press ITEM and pass straight through Drakos’ cars.'],['DRAKOS','Enjoy your little tricks. Chapter two: the narrow streets are <b>mine</b>.']]},
 2:{k:'magnet',t:'MAGNET unlocked',lines:[['LAMBROU','Fast and clean. Drakos will not like you.'],['ELENI','Your second gift: the <b>MAGNET</b>. Item boxes near you fly into your car during missions.'],['DRAKOS','Enough games. Chapter three: <b>O Drakos</b>. Meet me in the Kallimarmaro.']]},
 3:{k:'cup',t:'AKROPOLIS CUP won · Drakos’ car unlocked',lines:[['DRAKOS','...Take the cup. Take my car. Athens is yours, tourist.'],['YIAYIA','Hooray! Koulouria for everyone, forever!'],['ELENI','The Akropolis Cup is in Psyrri where it belongs. Campaign complete, champion.']]}};
const ATC_TITLE={2:'Chapter 2 · Ta Stena',3:'Chapter 3 · O Drakos'};
function ATC_done(id){const s=ATC_st();s.done[id]=Math.max(s.done[id]||0,1);if(ATC_ORDER[s.step]===id){s.step++;const D=ATC_DEF[id];if(D.race){const R=ATC_RW[D.ch];s.rw[R.k]=1;if(R.k==='ghost'){M1_st().wpn=1;M1_save()}
   if(R.k==='cup'){try{const F=flags();if(!F.DRAKOS){F.DRAKOS=1;store.set('mho_flags',F)}}catch(e){}}studGain(D.ch*1500,1);M1.pend=()=>ATC_rewardScene(D.ch)}}ATC_save();ATC.mk=0;M1.pT=0;M1.pillH=''}
function ATC_rewardScene(n){const R=ATC_RW[n];M1_scene({cam:{mode:'orbit',a:()=>({x:RO.x,z:RO.z}),r:26,h:9},lines:R.lines,end(){say('🎁 '+R.t,ATC_TITLE[n+1]?ATC_TITLE[n+1].toUpperCase():'ATHENS IS YOURS',2.6);if(R.k==='ghost'){M1.inv='ghost';M1_tw()}}})}
// ---------- per-frame: marks, gate trigger, resume after the district reload, rival, king of the hill, magnet
function ATC_tick(dt){if(CID!=='ath'||!RO.on)return;const s=ATC_st();if(!ATC.mk&&QV.g&&QV.g.N===HUB.nodes)ATC_marks();
 if(s.pend&&s.pend.d===ATHD&&!RO.ch&&!RO.sp&&!M1.cs&&!RO.card&&state==='roam'&&QV.g&&QV.g.N===HUB.nodes){ATC.pendT+=dt;if(ATC.pendT>.5){ATC.pendT=0;ATC_resume()}}
 const ch=RO.ch;if(!ATC_isA(ch)||!ch.v2)return;const V=ch.v2,S=V.L.st[V.si],D=ATC_DEF[ch.m.ev.mid];if(!S)return;
 if(S.t==='atcGate'&&S.x!=null&&!M1.cs&&Math.hypot(S.x-RO.x,S.z-RO.z)<18)return ATC_transfer(ch,S);
 if(D.rv&&V.L.rp&&!M1.rv&&V.si>=(D.rv.from||0)&&S.dd===ATC_D(RO.x,RO.z)){M1_rivalInit(ch,M1.cp&&M1.cp.mid===ch.m.ev.mid?M1.cp.rv:null);const R2=M1.rv;if(R2){R2.lt=1e9;R2.base=D.rv.base;
   if(D.rv.metro){R2.m.children[0].visible=false;const mt=new THREE.MeshStandardMaterial({color:0xe8ece8,roughness:.5}),gr=new THREE.MeshStandardMaterial({color:0x36d17a,roughness:.5});box(R2.m,mt,3.4,3.6,14,0,1.9,0);box(R2.m,gr,3.5,.9,14.1,0,2.2,0);box(R2.m,mt,3.4,3.6,10,0,1.9,-12.5);box(R2.m,gr,3.5,.9,10.1,0,2.2,-12.5)}
   else R2.m.children[0].material.color.set(D.rv.col);
   if(D.items&&!M1.boxes.some(b=>b.mis)){const rp=V.L.rp;for(let q=500;q<rp.L-300;q+=650){const a=qvAt(rp.P,rp.C,q);M1_box(a.x,a.z,1)}}}}
 if(M1.rv&&D.rv&&!M1.cs){ATC.tauntT-=dt;if(ATC.tauntT<=0){ATC.tauntT=20+Math.random()*8;const L=ATC_TAUNT[D.rv.n];if(L){const a=L[M1.rv.gap>0?0:1];const w=D.rv.n==='METRO'?'ELENI':D.rv.n;M1_radio(w,D.rv.n==='METRO'?'🚇 '+a[Math.floor(Math.random()*a.length)]:a[Math.floor(Math.random()*a.length)])}}}
 if(S.koth&&S.t==='survive'&&!M1.cs){const d=Math.hypot(S.koth.x-RO.x,S.koth.z-RO.z);if(d>S.koth.r){ATC.away+=dt;ATC.awT-=dt;if(ATC.awT<=0){ATC.awT=1;hitPop(`⚠ BACK TO THE SUMMIT · ${Math.max(0,Math.ceil(8-ATC.away))} s`,'#ff4d6d')}if(ATC.away>8){ATC.away=0;return qvFail(ch,'DRAKOS TOOK THE HILL')}}else ATC.away=Math.max(0,ATC.away-dt*2)}
 if(s.rw.magnet)for(const b of M1.boxes){if(b.t>0||!b.m.visible)continue;const d=Math.hypot(b.x-RO.x,b.z-RO.z);if(d<50&&d>2){const k=Math.min(1,dt*1.6);b.x+=(RO.x-b.x)*k;b.z+=(RO.z-b.z)*k;b.m.position.x=b.x;b.m.position.z=b.z}}}
qvTick=(f=>function(dt){f(dt);ATC_tick(dt)})(qvTick);
window.__atc={ATC,order:ATC_ORDER,st:()=>ATC_st(),next:()=>ATC_next(),def:id=>{const D=ATC_DEF[id];return D&&{name:D.name,ch:D.ch,d:D.d0,ph:D.ph.slice(),race:!!D.race}},
 start:id=>{const m=ATC_mark(id)||ATC_mkMark(id);M1.hp=100;chStart(m,{O:{x:m.x,z:m.z}});return !!RO.ch},marks:()=>RO.marks.filter(m=>m.atc).map(m=>({id:m.ev.mid,x:m.x,z:m.z})),
 stages:()=>RO.ch&&RO.ch.v2&&RO.ch.v2.L.st.map(S=>({t:S.t,ph:S.ph,dd:S.dd,cp:!!S.cp})),si:()=>RO.ch&&RO.ch.v2?RO.ch.v2.si:-1,setStep:n=>{const s=ATC_st();s.step=n;s.pend=null;ATC_save();ATC.mk=0},
 rebuild:()=>ATC_marks(),resumed:()=>ATC.resumed||0};
queueMicrotask(()=>{if(window.__mho)window.__mho.atc=window.__atc});

// ===== M2 "Frankfurt Chapter 2 · Die Hafenbande": 3 authored story missions at Osthafen / the Main / the Polizeipräsidium, a 3-car rival
// street race (Jana Weber + Inès Moreau, Osthafen → EZB), reward Mainschiff (v_weber) + RAM PLOUGH (smash the 4 reinforced Schattenwerk walls).
// Registers into the M1 system (M1_DEF / M1_STORY / M1_SC / M1_RADIO / M1_END) and extends M1 functions by re-binding; every new global is M2_*.
// Chapter 2 starts when the Rossi duel is won (M1 step 4). On completion: M1 save state gets M2_done=1 (Chapter 3 keys off it).
const M2={rv:[],walls:null,wn:0,plough:null,log:{boat:0,stack:0,wall:0,bounce:0,rvHit:0,shield:0}};
Object.assign(M1_WHO,{WEBER:{n:'Jana Weber',col:'#2f7bff',em:'📷'},MOREAU:{n:'Inès Moreau',col:'#8c55ff',em:'🗡'},HAAK:{n:'Käpt’n Haak',col:'#3fa7d6',em:'⚓'}});
const M2_IDS=['marked','river','crane','m2duel'];{const i=M1_STORY.indexOf('duel');if(!M1_STORY.includes('marked'))M1_STORY.splice(i+1,0,...M2_IDS)}
const M2_mine=()=>RO.ch&&RO.ch.m.m1&&M2_IDS.includes(RO.ch.m.ev.mid);
// landmarks (world coords: +x = west, +z = north)
const M2_LM={dock:[-2230,-250],dockS:[-2050,-170],hanau:[-1800,90],ostb:[-1650,250],ezb:[-1485,-60],zoo:[-1450,620],friedb:[-900,1250],nordend:[-300,1700],hqA:[120,1700],hq:[230,1990],
 mainkai:[-150,-185],quay2:[-1000,-230],werft:[-1150,-240],haven:[-2300,-120],crane:[-2450,-200],weberMk:[-2150,-150],craneMk:[-2380,-60]};
const M2_L=k=>M1_P(M2_LM[k][0],M2_LM[k][1]);
// river path helper: MAINR points from the one nearest (x,z), walking dir (+1/-1) for len metres, then back (ping-pong) for boats that never escape
function M2_river(x,z,dir,len,laps=2){const P=MAINR.pts;let i0=0,bd=1e18;P.forEach((p,i)=>{const d=(p.x-x)**2+(p.z-z)**2;if(d<bd){bd=d;i0=i}});const seg=[];let L=0,i=i0;while(i>0&&i<P.length-1&&L<len){seg.push([P[i].x,P[i].z]);const n=P[i+dir];L+=Math.hypot(n.x-P[i].x,n.z-P[i].z);i+=dir}let out=seg.slice();for(let k=1;k<laps*2;k++){const s=k%2?seg.slice().reverse():seg.slice();out=out.concat(s.slice(1))}return out}
const M2_rivAt=(x,z)=>{const P=MAINR.pts;let b=P[0],bd=1e18;for(const p of P){const d=(p.x-x)**2+(p.z-z)**2;if(d<bd){bd=d;b=p}}return{x:b.x,z:b.z}};
// ---------- mission definitions (stage lists from landmark anchors)
Object.assign(M1_DEF,{
 marked:{name:'Marked Man: Hafen',npc:'Jana Weber',who:'WEBER',em:'📦',col:'#2f7bff',g:[300,370,450],story:1,
  hi:'You’re Hilde’s rookie? I photographed the Hafenbande loading Kaiser’s gold at Osthafen. Get my evidence to the Polizeipräsidium!',win:'It’s in the evidence room. Kaiser’s harbour crew is finished... almost.',lose:'They smashed the crates. Again, and keep them away from you!',
  d:'Burnout Marked Man: carry Jana Weber’s evidence crates from the Osthafen quay to the Polizeipräsidium while the Hafenbande tries to wreck you.',
  ph:['Quay Ambush','Hanauer Run','EZB Blockade','Detour North','Gate Closing'],
  build(c){const D=M2_L('dock'),H=M2_L('hanau'),O=M2_L('ostb'),E=M2_L('ezb'),Z=M2_L('zoo'),F=M2_L('friedb'),N=M2_L('nordend'),A=M2_L('hqA'),Q=M2_L('hq');
   c.st.push({t:'go',ph:1,cp:1,x:D.x,z:D.z,stop:1,txt:'Meet Jana at the Osthafen quay and load the evidence',ic:'📷',T:120,scene:'marked',x2:10},
    {t:'survive',ph:1,cp:0,dur:95,max:3,load:3,carry:1,txt:'Hafenbande ambush! Survive while Jana loads the crates',ic:'⚓',T:120,x2:40},
    {t:'go',ph:2,cp:1,ring:1,x:H.x,z:H.z,r:14,carry:1,hunt:3,txt:'West on the Hanauer Landstraße · 3 crew cars hunt you',ic:'📦',T:90,x2:20},
    {t:'go',ph:2,ring:1,x:O.x,z:O.z,r:14,carry:1,txt:'Past the Ostbahnhof · keep the crates',ic:'📦',T:80},
    {t:'m2boss',ph:3,cp:1,carry:1,boss:'heavy',bhp:9,bn:'HAAK’S BLOCKER',adds:2,max:3,at:E,txt:'The Hafenbande blocks the EZB! BOOST-ram the blocker truck (9 HP)',ic:'🚧',T:150,x2:50},
    {t:'go',ph:4,cp:1,ring:1,x:Z.x,z:Z.z,r:14,carry:1,txt:'Detour north past the Zoo',ic:'🦒',T:90,x2:20},
    {t:'goons',ph:4,cp:1,carry:1,wave:[['rammer',3],['shield',1]],need:4,txt:'Zoo ambush! 3 crew cars + a shield car (BOOST-ram it)',ic:'🛡',T:100,bonus:10,x2:30},
    {t:'go',ph:4,ring:1,x:F.x,z:F.z,r:14,carry:1,hunt:2,txt:'Up the Friedberger Landstraße · 2 more chasers',ic:'📦',T:90},
    {t:'go',ph:4,ring:1,x:N.x,z:N.z,r:14,carry:1,heavy:1,d:Math.hypot(N.x-F.x,N.z-F.z),txt:'Through the Nordend · a goon truck blocks the road',ic:'📦',T:90},
    {t:'go',ph:5,cp:1,ring:1,x:A.x,z:A.z,r:14,carry:1,txt:'Onto the Adickesallee',ic:'🚓',T:90,x2:10},
    {t:'go',ph:5,x:Q.x,z:Q.z,stop:1,carry:1,txt:'The HQ gate is closing! Park inside in 20 s',ic:'🚓',T:20,x2:20,gate:1})}},
 river:{name:'River Rampage',npc:'Oma Hilde',who:'HILDE',em:'🚤',col:'#3fa7d6',g:[300,370,450],story:1,
  hi:'Haak’s smugglers run Kaiser’s gold down the Main by boat. Your car floats, rookie. I built it that way.',win:'Haak’s fleet is scrap. And you came out of the river dry!',lose:'The river is his turf. Go again, ram harder!',
  d:'Drive into the Main (your car turns into a boat), ram the smuggler boats, dodge the mines under the bridges, sink Haak’s tug, then fight your way up the quay.',
  ph:['Into the Main','Smuggler Boats','Under the Bridges','Haak’s Tug','Quay Brawl'],
  build(c){const K=M2_L('mainkai'),W0=M2_rivAt(-150,-260),U=[[-404,-221],[-755,-297],[-905,-320],[-1250,-260]].map(p=>M2_rivAt(p[0],p[1])),Wq=M2_L('werft');
   c.st.push({t:'go',ph:1,cp:1,ring:1,x:K.x,z:K.z,r:14,scene:'river',txt:'Down to the Mainkai quay',ic:'⚓',T:90,x2:10},
    {t:'go',ph:1,ring:1,x:W0.x,z:W0.z,r:18,txt:'Drive straight into the Main: the car turns into a boat!',ic:'🚤',T:60},
    {t:'boats',ph:2,cp:1,list:[{dir:1,rams:4},{dir:-1,rams:4,drop:1},{dir:1,rams:4,off:120}],txt:'Ram the 3 smuggler boats (4× each)',ic:'🚤',T:200,x2:70},
    ...U.map((p,k)=>({t:'go',ph:3,cp:k?0:1,ring:1,x:p.x,z:p.z,r:18,mines:k<3?1:0,txt:`Under the bridges ${k+1}/4 · Haak drops mines`,ic:'💣',T:k?45:70,x2:k?0:20})),
    {t:'boats',ph:4,cp:1,boss:1,list:[{dir:-1,rams:8,drop:1,geo:'boat-tug-a'}],txt:'Haak’s tug: ram it 8×, dodge the crates',ic:'⚓',T:150,x2:50},
    {t:'go',ph:5,cp:1,ring:1,x:Wq.x,z:Wq.z,r:16,txt:'Back onto the quay at the Weseler Werft',ic:'🛞',T:80,x2:10},
    {t:'survive',ph:5,cp:0,dur:75,max:3,txt:'Quay brawl: the Hafenbande wants revenge',ic:'💥',T:120,x2:40})}},
 crane:{name:'Crane Crash',npc:'Jana Weber',who:'WEBER',em:'🏗',col:'#ffb000',g:[290,360,440],story:1,
  hi:'Haak hides behind a wall of containers at Osthafen. Knock the stacks down and the crane drops its wrecking ball.',win:'Haak is in handcuffs. Now the Hafenbande has no captain.',lose:'Haak got away. The containers are back up. Again!',
  d:'Smash 4 container stacks (90+ km/h, 2 hits each), survive the crane dropping containers on you, bowl its wrecking ball through the hideout gate, clear the hideout, then catch Käpt’n Haak on land and on the water.',
  ph:['Container Wall','Crane Ambush','Wrecking Ball','Hideout','Haak’s Escape'],
  build(c){const O=c.O;const st=[];for(const[a,r]of[[0,70],[1.6,85],[3.2,75],[4.8,90]]){const p=M1_P(O.x+Math.sin(a)*r,O.z+Math.cos(a)*r,160);st.push([p.x,p.z,a])}
   let B=M1_P(O.x+60,O.z+20,200),Gl=M1_P(O.x+260,O.z-40,250);{let best=null;for(const L of[230,190,150])for(let k=0;k<24&&!best;k++){const a=k/24*6.283,sx=Math.sin(a),sz=Math.cos(a);let ok=true;for(let d=15;d<=L+20;d+=5){const x=O.x+sx*d,z=O.z+sz*d;if(roamHit(x,z,6)||inRiver(x,z,-4)){ok=false;break}}if(ok)best={B:{x:O.x+sx*30,z:O.z+sz*30},Gl:{x:O.x+sx*L,z:O.z+sz*L}}}if(best){B=best.B;Gl=best.Gl}}
   c.st.push({t:'stacks',ph:1,cp:1,items:st,guards:2,txt:'Smash the 4 container stacks at 90+ km/h (2 hits each)',ic:'📦',T:160,scene:'crane',x:st[0][0],z:st[0][1],x2:50},
    {t:'survive',ph:2,cp:1,dur:100,max:3,drops:1,txt:'Haak’s crane drops containers on you! Survive 100 s',ic:'🏗',T:110,x2:40},
    {t:'push',ph:3,cp:1,bx:B.x,bz:B.z,x:Gl.x,z:Gl.z,r:15,m2gate:1,txt:'The crane dropped its wrecking ball! Bowl it through the hideout gate',ic:'🏗',T:90,x2:40,d0:Math.hypot(Gl.x-B.x,Gl.z-B.z)},
    {t:'goons',ph:4,cp:1,wave:[['rammer',4]],need:4,txt:'Hideout open! Take down 4 crew cars',ic:'💥',T:100,bonus:10,x2:30},
    {t:'goons',ph:4,wave:[['rammer',2],['shield',1]],need:3,txt:'Second wave + a shield car (BOOST-ram it)',ic:'🛡',T:100,bonus:10},
    {t:'m2boss',ph:4,boss:'heavy',bhp:5,bn:'HAAK’S FORKLIFT',adds:1,max:2,txt:'Haak’s forklift truck! BOOST-ram it 5×',ic:'🚜',T:120},
    {t:'m2boss',ph:5,cp:1,boss:'lt',bhp:6,bn:'KÄPT’N HAAK',adds:2,max:3,txt:'Käpt’n Haak runs! Ram him 6× · he drops mines',ic:'⚓',T:150,x2:40},
    {t:'boats',ph:5,list:[{dir:1,rams:5}],txt:'Haak jumped into a speedboat! Drive into the river, ram it 5×',ic:'🚤',T:150,x2:30})}},
 m2duel:{name:'Harbour Duel: Weber vs Moreau',npc:'Jana Weber',who:'WEBER',em:'🏁',col:'#2f7bff',g:[260,310,370],story:1,items:1,
  hi:'Inès Moreau races for Kaiser now. Three cars, Osthafen to the EZB, items on. Clean racing... from me, at least.',win:'You beat us both. Take the Mainschiff, it’s yours.',lose:'Not today, rookie. The harbour is still ours.',
  d:'3-car street race through the city against Jana Weber (shield) and Inès Moreau (boosts, drops mines), Osthafen → EZB, items on. The Hafenbande crashes the race.',
  ph:['Osthafen → Zeil','Hafenbande Crash','Moreau’s Mines'],
  build(c){const W=[[-2150,-150],[-2600,100],[-1800,90],[-1650,250],[-1450,620],[-444,455],[-120,430],[200,354],[790,700],[1300,1100],[2100,200],[1392,-380],[383,-451],[160,-700],[-500,-800],[-404,-345],[-404,-150],[-900,-180],[-1300,-100],[-1485,-60]].map(p=>M1_P(p[0],p[1]));W[0]={x:c.O.x,z:c.O.z};const R=M1_path(W),L=R.L;c.L.rp=R;const n=clamp(Math.round(L/380),12,30);let lj=-1;
   for(let k=1;k<=n;k++){const a=qvSnap(R.P,R.C,L*k/n);if(a.j===lj&&k<n)continue;lj=a.j;const f=k/n,ph=f<=.36?1:f<=.72?2:3;c.st.push({t:'go',ring:1,x:a.x,z:a.z,h:a.h,r:12,ph,cp:0,txt:k<n?`Gate ${k}/${n} · beat Weber and Moreau to the EZB`:'Finish at the EZB!',ic:k<n?'🏁':'🏆',T:0,q:k>1&&k<n})}
   let last=0;for(const S of c.st){if(S.ph!==last){S.cp=1;last=S.ph}}const s2=c.st.find(S=>S.ph===2);if(s2)s2.hunt=3;const s3=c.st.find(S=>S.ph===3);if(s3)s3.m2fin=1}}});
Object.assign(M1_RADIO,{
 marked:{1:['WEBER','Three crates. Every ram costs you one, so <b>ram them first</b>!'],2:['BRIX','Bzzt! Crew cars on your tail. The crates rattle on every hit.'],4:['HAAK','You won’t pass the EZB, Bürschchen. My truck is bigger than your car.'],5:['WEBER','Sonnemannstraße is blocked. Go north, past the Zoo!'],9:['WEBER','The night shift closes the HQ gate at midnight sharp. <b>BOOST!</b>']},
 river:{1:['HILDE','Don’t brake! Straight off the quay. Trust Oma.'],2:['HAAK','Boys, the rookie is swimming. Sink him!'],3:['BRIX','Bzzt! Mines under the bridges. Steer around the red lights.'],7:['HAAK','Enough! I’ll do it myself.'],8:['HILDE','Up the ramp at the Weseler Werft. The wheels come back out on land!']},
 crane:{1:['HAAK','Crane, drop the boxes on him!'],2:['WEBER','The ball is loose! Push it straight into the gate.'],3:['HAAK','My hideout! Get him, all of you!'],6:['KAISER','Haak, you fool. If they catch you, you never knew me.'],7:['WEBER','He’s in the water! Follow him, your car floats!']},
 m2duel:{0:['MOREAU','Kaiser pays well, Jana. Tell your rookie to stay behind me.']}});
// ---------- scenes
Object.assign(M1_SC,{
 marked:(ch,S)=>{const J=M1_obj({m:M1_car('sedan-sports','#1d5fd6',2.9,'#9fc8ff')}).m;M1_put(J,RO.x+Math.sin(RO.h+.5)*16,RO.z+Math.cos(RO.h+.5)*16,RO.h+Math.PI);
  M1_scene({cam:{a:()=>({x:RO.x,z:RO.z}),b:()=>({x:J.position.x,z:J.position.z})},lines:[['WEBER','Jana Weber. I race clean, and I photographed the <b>Hafenbande</b> loading Kaiser’s gold on this quay.'],['HAAK','That evidence belongs to the harbour, Fräulein. Boys, <b>close the gates!</b>'],['WEBER','Three crates to the <b>Polizeipräsidium</b>. Every ram costs one. Don’t lose them all!']],end(){}})},
 river:(ch,S)=>{const T=M1_obj({m:M1_car('boat-tug-a','#2a2a31',3.2,'#ffd12c')}).m,p=M2_rivAt(RO.x,RO.z-120);M1_put(T,p.x,p.z,0);
  M1_scene({cam:{a:()=>({x:RO.x,z:RO.z}),b:()=>({x:T.position.x,z:T.position.z})},lines:[['HAAK','Welcome to my river, rookie. Kaiser’s gold moves by boat tonight.'],['HILDE','Your car floats, I built it that way. <b>Drive straight into the Main</b> and ram his boats!']],end(){if(T.parent)T.parent.remove(T)}})},
 crane:(ch,S)=>{M1_scene({cam:{mode:'orbit',a:()=>({x:S.x,z:S.z}),r:70,h:30,a0:.6},lines:[['WEBER','Haak’s hideout is behind those container stacks. Ninety plus, <b>two hits each</b>.'],['HAAK','Nobody knocks on my door, rookie. Nobody!']],end(){}})}});
// ---------- end-of-mission scenes (M1_END is consumed by M1_done)
Object.assign(M1_END,{
 marked:()=>{M1_scene({cam:{mode:'orbit',a:()=>({x:RO.x,z:RO.z}),r:30,h:12},lines:[['WEBER','Evidence delivered. Haak’s boats still run the gold down the Main tonight, though.'],['KAISER','Cute, rookie. The police night shift works for <b>me</b>. Enjoy your swim.'],['HILDE','Next: the Mainkai. Haak’s smugglers are on the river!']],end(){M1_autoRoute()}})},
 river:()=>{M1_scene({cam:{mode:'orbit',a:()=>({x:RO.x,z:RO.z}),r:30,h:12},lines:[['HILDE','Haak swam home to Osthafen. He hides in his container fortress.'],['WEBER','I know the way in. Meet me at the <b>Osthafen cranes</b>.']],end(){M1_autoRoute()}})},
 crane:()=>{const W=M1_obj({m:M1_car('sedan-sports','#8c55ff',2.9,'#d9b8ff')}).m;M1_put(W,RO.x+Math.sin(RO.h)*14,RO.z+Math.cos(RO.h)*14,RO.h+Math.PI);
  M1_scene({cam:{a:()=>({x:RO.x,z:RO.z}),b:()=>({x:W.position.x,z:W.position.z})},lines:[['MOREAU','Inès Moreau. Kaiser pays me to finish what Haak started. A race, <b>you, me and little Jana</b>.'],['WEBER','Osthafen to the EZB, items on. If you win, Moreau leaves the harbour for good.'],['MOREAU','And when I win, the rookie works for Kaiser. À tout à l’heure.']],end(){if(W.parent)W.parent.remove(W);M1.act=M1.act.filter(o=>o.m!==W);M1_autoRoute()}})},
 m2duel:()=>{M2_plough();M2_wallsBuild();M1_scene({cam:{mode:'orbit',a:()=>({x:RO.x,z:RO.z}),r:24,h:8},lines:[['WEBER','You beat us both. The <b>Mainschiff</b> is yours: calm, stable, tough. Find it in your garage.'],['HILDE','And I welded a <b>RAM PLOUGH</b> on your nose. Kaiser walled off 4 shortcuts with reinforced walls. <b>Ram them at 60+ km/h!</b>'],['BRIX','Bzzt! Reinforced walls are marked on the map. Chapter 2 complete!']],
  end(){const show=()=>storyShow({who:'HILDE',title:'Chapter 2 complete · The Harbour Gang',txt:'The Hafenbande is broken and Moreau left the harbour. You won the <b>Mainschiff</b> and the <b>Ram Plough</b>: smash the 4 reinforced walls to open their shortcuts. Kaiser is not done with you...'});if(RO.ch||RO.sp)M1.pend=show;else show();M1_autoRoute()}})}});
// ---------- new stage types: boats (river chase), stacks (container stacks), m2boss (named boss + adds)
const M2_T=new Set(['boats','stacks','m2boss']);
function M2_setup(ch,S,i){
 if(S.t==='boats'){S.th=[];const at=M2_rivAt(RO.x,RO.z);S.list.forEach((q,k)=>{const st=M2_river(at.x,at.z,q.dir,q.off||0,0),s0=st.length?st[st.length-1]:[at.x,at.z];const fx=s0[0],fz=s0[1];const P=M2_river(fx,fz,q.dir,1500,3);const g=M1_goon('thief',P[0][0],P[0][1],{S,hp:q.rams,P,drop:q.drop,geo:q.geo||'boat-speed-a',col:q.geo?'#2a2a31':'#1b1c22'});g.C=qvCum(P);g.s=Math.min(60+k*25,g.C[g.C.length-1]-10);g.noEsc=1;g.boat=1;if(q.geo)g.m.scale.setScalar(1.25);S.th.push(g)});
  if(S.boss){say('KÄPT’N HAAK!',S.list[0].rams>4?'RAM HIS TUG '+S.list[0].rams+'×':'HE ESCAPES BY BOAT · RAM IT',1.8)}else say('SMUGGLERS!','3 BOATS · RAM THEM ALL',1.8)}
 else if(S.t==='stacks'){const C=['#d9472b','#2f7bff','#36d17a','#ffb000','#8c55ff'];S.it=S.items.map(([x,z,h],k)=>{const g=new THREE.Group();for(let j=0;j<3;j++){const M=new THREE.MeshStandardMaterial({color:C[(k+j)%C.length],roughness:.7});box(g,M,6,2.8,12,0,1.4+j*2.9,0);box(g,new THREE.MeshStandardMaterial({color:0x1b1c22,roughness:.6}),6.2,.25,12.2,0,2.85+j*2.9,0)}g.position.set(x,groundAt(x,z,40),z);g.rotation.y=h;RO.grp.add(g);M1_obj({m:g});return{x,z,m:g,hp:2,done:false}});S.n=0;S.cd=0;S.x=S.it[0].x;S.z=S.it[0].z;M1_spawn(S,'rammer',S.guards||0,{x:S.x,z:S.z},90,160)}
 else if(S.t==='m2boss'){S.el=0;S.spT=6;const at=S.at||null;S.bg=M1_spawn(S,S.boss,1,at,at?40:120,at?90:180)[0];S.bg.hp=S.bg.hp0=S.bhp;if(S.adds)M1_spawn(S,'rammer',S.adds,at,at?60:140,at?140:220);say(S.bn+'!',S.txt.toUpperCase(),2);
  if(at){const g=new THREE.Group(),M=new THREE.MeshStandardMaterial({color:0xffd12c,roughness:.6}),Mk=new THREE.MeshStandardMaterial({color:0x18181d,roughness:.6});for(let k=-2;k<=2;k++){box(g,k%2?Mk:M,4,1.4,1.2,k*4,1.2,0);box(g,Mk,.5,1.2,.5,k*4,.6,0)}g.position.set(at.x,groundY(at.x,at.z),at.z);RO.grp.add(g);M1_obj({m:g})}}}
function M2_stage(ch,S,dt){const kmh=Math.abs(RO.v)*3.6;
 if(S.t==='boats'){if(S.th.every(g=>g.dead)){M2.log.boat+=S.th.length;return qvNext(ch)}return}
 if(S.t==='stacks'){S.cd-=dt;for(const o of S.it){if(o.done)continue;if(Math.hypot(o.x-RO.x,o.z-RO.z)<8&&Math.abs(RO.y-o.m.position.y)<7&&S.cd<=0){S.cd=1.1;if(kmh>=90){o.hp--;const at=V3(o.x,4+o.hp*3,o.z);debris(at,V3(Math.sin(RO.vh)*RO.v*.4,12,Math.cos(RO.vh)*RO.v*.4),26,[new THREE.Color('#d9472b'),new THREE.Color('#2f7bff'),new THREE.Color('#ffb000')],1.4,0);M1_snd('crash');shake=.7;slowmo=Math.max(slowmo,.3);
     if(o.hp<=0){o.done=true;o.m.visible=false;S.n++;M2.log.stack++;for(let q=0;q<6;q++)studBurst(at,V3(0,0,0),30);studGain(120,1);hitPop(`📦 STACK ${S.n}/${S.it.length} DOWN`,'#5dffb0')}else{o.m.scale.y=.62;hitPop('📦 TOP CONTAINER OFF · hit it again!','#ffd400')}RO.v=-Math.max(8,Math.abs(RO.v)*.3)}
    else{RO.v=-Math.max(6,Math.abs(RO.v)*.3);M1_snd('bump');say('','TOO SLOW · '+Math.round(kmh)+' km/h · need 90',1.2)}}}const nx=S.it.find(o=>!o.done);if(nx){S.x=nx.x;S.z=nx.z}if(S.n>=S.it.length)return qvNext(ch);return}
 if(S.t==='m2boss'){S.el+=dt;S.spT-=dt;if(S.bg.dead)return qvNext(ch);const al=M1.goons.filter(g=>!g.dead&&g.S===S&&g!==S.bg);if(S.spT<=0&&al.length<(S.max||2)){S.spT=7;M1_spawn(S,'rammer',1,null,140,220)}return}}
M1_setup=(f=>function(ch,S,i){if(M2_T.has(S.t))return M2_setup(ch,S,i);return f(ch,S,i)})(M1_setup);
M1_stage=(f=>function(ch,S,dt){if(M2_T.has(S.t))return M2_stage(ch,S,dt);return f(ch,S,dt)})(M1_stage);
qvTgt=(f=>function(ch){if(!ch.m.m1)return f(ch);const V=ch.v2,S=V.L.st[V.si],tg=V.tg;if(!S||!M2_T.has(S.t))return f(ch);
 if(S.t==='stacks'){tg.x=S.x;tg.z=S.z;return tg}const L=S.t==='m2boss'&&!S.bg.dead?[S.bg]:M1.goons.filter(g=>!g.dead&&g.S===S);let b=null,bd=1e18;for(const g of L){const d=Math.hypot(g.x-RO.x,g.z-RO.z);if(d<bd){bd=d;b=g}}if(!b)return null;tg.x=b.x;tg.z=b.z;return tg})(qvTgt);
// boats are a bit slower than road thieves (the player is a boat too) — scale their path progress after M1_goonStep moved them
M1_goonStep=(f=>function(dt){const B=M1.goons.filter(g=>g.boat&&!g.dead&&g.C),s0=B.map(g=>g.s);f(dt);B.forEach((g,k)=>{if(g.dead||!g.C)return;g.s=s0[k]+(g.s-s0[k])*.78;const a=qvAt(g.P0,g.C,g.s);g.x=a.x;g.z=a.z;g.h=a.h;g.y=groundAt(g.x,g.z,g.y+4);g.m.position.set(g.x,g.y+(g.K===M1_GK.thief?.4:0),g.z);g.m.rotation.y=g.h})})(M1_goonStep);
M1_loseCrate=(f=>function(){if(!M2_mine())return f();const ch=RO.ch;if(!ch||!ch.crates||!(ch.n>0))return;ch.bh=(ch.bh||0)+1;if(ch.bh%2){feed('📦 CRATES RATTLE · next hit breaks one',0,'#ffb000');return}ch.n--;const c=ch.crates.children[ch.crates.children.length-1];if(c){debris(c.getWorldPosition(V3()),V3(0,6,0),10,[new THREE.Color('#9a6a3a'),new THREE.Color('#ffffff')],.8,RO.y);ch.crates.remove(c)}feed('📦 EVIDENCE CRATE LOST · '+ch.n+' left',0,'#ff5a2d')})(M1_loseCrate);
qvFail=(f=>function(ch,why){if(ch&&ch.m&&ch.m.m1&&M2_IDS.includes(ch.m.ev.mid)&&why==='ALL BARRELS LOST')why='THE EVIDENCE IS GONE';return f(ch,why)})(qvFail);
// enter hooks: mines under the bridges, gate for the wrecking ball, final sprint in the duel, checkpoint stores rival positions
M1_hooks=(f=>function(ch,S,i){f(ch,S,i);if(!M2_mine())return;const e=ch.m.ev;
 if(S.mines){const nx=S;for(let k=0;k<5;k++){const t=(k+1)/6,x=RO.x+(nx.x-RO.x)*t+(Math.random()-.5)*30,z=RO.z+(nx.z-RO.z)*t+(Math.random()-.5)*30;if(inRiver(x,z,0))M1.mines.push(M1_mine(x,z,'enemy',true))}}
 if(S.m2gate){const g=new THREE.Group(),M=new THREE.MeshStandardMaterial({color:0x5a5f6a,roughness:.5,metalness:.4}),Y=new THREE.MeshStandardMaterial({color:0xffd12c,roughness:.6});box(g,M,22,9,1.2,0,4.5,0);box(g,Y,22.4,.8,1.4,0,9.2,0);box(g,Y,1.4,10,1.4,-11.2,5,0);box(g,Y,1.4,10,1.4,11.2,5,0);g.position.set(S.x,groundY(S.x,S.z),S.z);g.rotation.y=Math.atan2(S.x-S.bx,S.z-S.bz);RO.grp.add(g);M1_obj({m:g});M2.gate=g}
 if(S.t==='goons'&&M2.gate&&e.mid==='crane'&&S.cp){const g=M2.gate;M2.gate=null;g.visible=false;debris(g.position.clone().add(V3(0,5,0)),V3(0,10,0),40,[new THREE.Color('#5a5f6a'),new THREE.Color('#ffd12c')],1.6,g.position.y);M1_snd('boom');shake=.8}
 if(S.m2fin){M1_radio('MOREAU','Final sprint, rookie. Mind the <b>mines</b>.');M2.rv.forEach(r=>r.base*=1.04);const mo=M2.rv.find(r=>r.who==='MOREAU');if(mo)mo.mines=1}
 if(S.gate&&!M1.noScene){slowmo=Math.max(slowmo,.4);say('GATE CLOSING!','20 SECONDS',1.6)}
 if(M1.cp&&M1.cp.mid===e.mid&&M2.rv.length)M1.cp.rv2=M2.rv.map(r=>r.s)})(M1_hooks);
M1_restore=(f=>function(ch,cp){f(ch,cp);if(ch.m.ev.mid==='m2duel'){M2_rivInit(ch,cp.rv2);M1.cp=cp}})(M1_restore);
M1_clear=(f=>function(){f();for(const r of M2.rv)if(r.m.parent)r.m.parent.remove(r.m);M2.rv=[];M2.gate=null})(M1_clear);
// ---------- 3-car rival race: Weber (shield absorbs the first item hit) and Moreau (boost bursts, mines in the final phase); rubber band like Rossi
function M2_rivInit(ch,ss){for(const r of M2.rv)if(r.m.parent)r.m.parent.remove(r.m);M2.rv=[];const rp=ch.v2.L.rp;if(!rp)return;
 [['WEBER','#1d5fd6','#9fc8ff',38.5,-8,3],['MOREAU','#8c55ff','#d9b8ff',39.5,-16,-3]].forEach(([who,col,trim,base,s0,side],k)=>{const m=M1_car('sedan-sports',col,2.9,trim);const r={who,m,P:rp.P,C:rp.C,s:ss&&ss[k]!=null?ss[k]:s0,base,side,x:rp.P[0][0],z:rp.P[0][1],pi:0,gap:0,stall:0,shield:who==='WEBER'?1:0,bt:6+k*5,mt:8};const a=qvAt(rp.P,rp.C,Math.max(0,r.s));M1_put(m,a.x+side,a.z+side,a.h);M2.rv.push(r)})}
function M2_rivHit(r,why){if(r.shield){r.shield=0;M2.log.shield++;hitPop('🛡 WEBER’S SHIELD BLOCKED IT','#9fc8ff');M1_snd('shield');return}r.stall=2.4;M2.log.rvHit++;M1.log.hit++;hitPop(`${why} ${M1_WHO[r.who].n.toUpperCase()} SPINS OUT!`,'#5dffb0');if(Math.random()<.5)M1_radio(r.who,r.who==='WEBER'?'Hey! That was not clean racing!':'Merde! You will pay for that.')}
function M2_rivStep(ch,dt){if(!M2.rv.length||ch.m.ev.mid!=='m2duel')return;const P=M2.rv[0].P,C=M2.rv[0].C,L=C[C.length-1];let bi=M2.pi||0,bd=1e18;for(let i=Math.max(0,bi-3);i<Math.min(P.length,bi+40);i++){const d=(P[i][0]-RO.x)**2+(P[i][1]-RO.z)**2;if(d<bd){bd=d;bi=i}}M2.pi=bi;const ps=C[bi];
 for(const r of M2.rv){if(r.done)continue;r.stall=Math.max(0,r.stall-dt);r.gap=r.s-ps;let v=r.base*(r.gap>140?.8:r.gap<-140?1.12:1);if(r.s>L*.86)v=r.base;if(r.stall>0)v*=.25;r.bt-=dt;if(r.bt<=0){r.bt=(r.who==='MOREAU'?10:16)+Math.random()*6;r.boost=r.who==='MOREAU'?2.2:1.4}if(r.boost>0){r.boost-=dt;v*=1.35}r.s+=v*dt;const a=qvAt(P,C,r.s),ox=Math.cos(a.h)*r.side,oz=-Math.sin(a.h)*r.side;r.x=a.x+ox;r.z=a.z+oz;r.m.position.set(r.x,groundAt(r.x,r.z,(r.m.position.y||0)+4),r.z);r.m.rotation.y=a.h;
  if(r.mines){r.mt-=dt;if(r.mt<=0&&r.gap>15&&r.gap<200){r.mt=7;M1.mines.push(M1_mine(r.x-Math.sin(a.h)*6,r.z-Math.cos(a.h)*6,'enemy',true));feed('💣 MOREAU DROPS A MINE',0,'#c46bff')}}
  for(const p of M1.proj){if(p.dead)continue;if(!p.tg&&Math.hypot(r.x-p.x,r.z-p.z)<260&&Math.abs(angDiff(Math.atan2(r.x-p.x,r.z-p.z),p.h))<1.1)p.tg=r;if(Math.hypot(r.x-p.x,r.z-p.z)<6){p.dead=1;if(p.m.parent)p.m.parent.remove(p.m);burst(FIRE,V3(p.x,r.m.position.y+2,p.z),30,24,.7,new THREE.Color(2.2,1,.3));M1_snd('boom');M2_rivHit(r,'🚀')}}
  for(const q of M1.mines){if(q.dead||q.own!=='pl'||q.arm>0)continue;if(Math.hypot(r.x-q.x,r.z-q.z)<5){q.dead=1;if(q.m.parent)q.m.parent.remove(q.m);burst(FIRE,V3(q.x,groundY(q.x,q.z)+1.5,q.z),34,24,.8,new THREE.Color(2.2,1,.3));M1_snd('boom');M2_rivHit(r,'💣')}}
  r.lt=(r.lt||0)-dt;if(r.lt<=0&&Math.random()<.01){r.lt=26;M1_radio(r.who,r.who==='WEBER'?(r.gap>0?'Clean lines, rookie. Watch and learn.':'Nice pass! Now hold it.'):(r.gap>0?'Kaiser sends his regards, rookie.':'Enjoy the lead. It will not last.'))}
  if(r.s>=L-3){r.done=1;return qvFail(ch,(M1_WHO[r.who].n.toUpperCase())+' WON THE RACE')}}}
M1_rivalStep=(f=>function(ch,dt){f(ch,dt);if(RO.ch===ch)M2_rivStep(ch,dt)})(M1_rivalStep);
const M2_pos=()=>1+M2.rv.filter(r=>r.gap>0).length;
qvHud=(f=>function(){f();const ch=RO.ch;if(!ch||!ch.m.m1||!ch.v2||!M2_mine())return;const V=ch.v2,S=V.L.st[V.si];if(!S)return;const p=huQ('#qTrk p');if(!p)return;let x='';
 if(S.t==='boats')x=` · ${S.th.filter(g=>g.dead).length}/${S.th.length}`;else if(S.t==='stacks')x=` · ${S.n}/${S.it.length}`;else if(S.t==='m2boss')x=` · ❤ ${Math.max(0,S.bg.hp)}/${S.bg.hp0}`;
 if(ch.crates&&ch.n>0&&S.carry)x+=` · 📦 ${ch.n}`;if(M2.rv.length)x+=` · 🏁 P${M2_pos()}/3`;if(x&&!p.textContent.endsWith(x))huT(p,S.txt+x)})(qvHud);
qvMiniQ=(f=>function(pin,R0,s){f(pin,R0,s);for(const r of M2.rv)pin(r.x,r.z,M1_WHO[r.who].col,'🏎',false);if(M2.walls&&!RO.ch)for(const w of M2.walls)if(!w.done)pin(w.x,w.z,'#ffb000','▮',false)})(qvMiniQ);
M1_hint=(f=>function(){const o=f();const ch=RO.ch;if(!o||!ch)return o;const S=ch.v2.L.st[ch.v2.si];if(!S||!M2_T.has(S.t))return o;if(S.t==='stacks'){o.mode='smash';o.v=34}else{o.mode='ram';o.v=S.t==='m2boss'&&S.bg&&!S.bg.dead&&S.bg.K.shield?38:30}return o})(M1_hint);
// ---------- marks + progression
const M2_MK={marked:'weberMk',river:'mainkai',crane:'craneMk',m2duel:'dockS'};
M1_mkMark=(f=>function(id){if(!M2_MK[id])return f(id);const D=M1_DEF[id],a=M2_L(M2_MK[id]);const ev={id:'m1_'+id,mid:id,kind:'m1',npc:D.npc,name:D.name,em:D.em,col:D.col,hi:D.hi,win:D.win,lose:D.lose,d:D.d,items:D.items};QAV[ev.id]=M1_av(D.who);
 const m=qvMk({kind:'quest',m1:1,ev,x:a.x,z:a.z,h:0,icon:D.em,col:D.col});const ring2=new THREE.Mesh(new THREE.TorusGeometry(12,.5,8,48),neonMat('#ffd400',2.6));ring2.rotation.x=Math.PI/2;ring2.position.y=.6;m.g.add(ring2);return m})(M1_mkMark);
M1_done=(f=>function(id,ch){const s=M1_st(),was=s.step;f(id,ch);if(id==='m2duel'&&was===M1_STORY.indexOf('m2duel')&&s.step>was){s.M2_done=1;s.plough=1;const F=flags();if(!F.WEBER){F.WEBER=1;store.set('mho_flags',F)}M1_save()}if(was===M1_STORY.indexOf('duel')&&s.step>was)setTimeout(()=>{try{M2_wallsBuild()}catch(e){}},100)})(M1_done);
// ---------- RAM PLOUGH: 4 reinforced Schattenwerk walls across shortcuts (visible from chapter 2, locked); with the plough a 60+ km/h hit smashes them
const M2_WP=[[-60,-90],[300,-760],[-1600,30],[900,820]];
function M2_wallsBuild(){if(M2.walls||CID!=='fra'||!qvGraph())return;const s=M1_st();if(s.step<M1_STORY.indexOf('marked'))return;const G=qvGraph();M2.walls=[];s.m2w=s.m2w||{};
 M2_WP.forEach(([x0,z0],k)=>{const p=M1_P(x0,z0,250);const P=qvPath(p.x,p.z,p.x+60,p.z+60);let h=0;if(P.length>1){const a=P[0],b=P[1];h=Math.atan2(b[0]-a[0],b[1]-a[1])}const g=new THREE.Group(),M=new THREE.MeshStandardMaterial({color:0x6b6f78,roughness:.8}),Y=new THREE.MeshStandardMaterial({color:0xffd12c,roughness:.6}),K=new THREE.MeshStandardMaterial({color:0x18181d,roughness:.6});
  box(g,M,22,6,2.4,0,3,0);for(let j=-5;j<=5;j++)box(g,j%2?Y:K,2,1.2,2.6,j*2,5.4,0);box(g,Y,4,1.6,2.6,0,2.6,0);g.position.set(p.x,groundY(p.x,p.z),p.z);g.rotation.y=h;RO.grp.add(g);const w={k,x:p.x,z:p.z,h,m:g,done:!!s.m2w[k]};g.visible=!w.done;M2.walls.push(w)})}
function M2_plough(){if(!pl||!pl.mesh||M2.plough&&M2.plough.parent===pl.mesh)return;const g=new THREE.Group(),Y=new THREE.MeshStandardMaterial({color:0xffd12c,roughness:.45,metalness:.5}),K=new THREE.MeshStandardMaterial({color:0x18181d,roughness:.6});box(g,Y,3.6,1,.5,0,.7,3.3);box(g,K,3.8,.25,.55,0,1.25,3.3);for(const sd of[-1,1])box(g,Y,.4,.4,1,sd*1.3,.7,2.8);pl.mesh.add(g);M2.plough=g}
function M2_wallStep(dt){if(!M2.walls)return;const s=M1_st(),on=!RO.ch&&!RO.sp;M2.wcd=Math.max(0,(M2.wcd||0)-dt);for(const w of M2.walls){if(w.done)continue;w.m.visible=on;if(!on)continue;const dx=RO.x-w.x,dz=RO.z-w.z,c=Math.cos(w.h),sn=Math.sin(w.h),lx=dx*c-dz*sn,lz=dx*sn+dz*c;if(Math.abs(lx)>12.5||Math.abs(lz)>3.4||RO.y>groundY(w.x,w.z)+7)continue;const kmh=Math.abs(RO.v)*3.6;
  if(s.plough&&kmh>=60){w.done=true;w.m.visible=false;s.m2w[w.k]=1;M1_save();M2.log.wall++;const n=Object.keys(s.m2w).length;debris(V3(w.x,4,w.z),V3(Math.sin(RO.vh)*RO.v*.5,10,Math.cos(RO.vh)*RO.v*.5),34,[new THREE.Color('#6b6f78'),new THREE.Color('#ffd12c')],1.5,0);for(let q=0;q<8;q++)studBurst(V3(w.x,3,w.z),V3(0,0,0),30);studGain(300,1);M1_snd('takedown');shake=.8;slowmo=Math.max(slowmo,.35);RO.v*=.85;hitPop(`🚜 WALL SMASHED ${n}/4 · SHORTCUT OPEN`,'#5dffb0');continue}
  const sd=Math.sign(lz)||1;RO.x+=sn*sd*(3.6-Math.abs(lz))+Math.sin(RO.vh)*-1.5;RO.z+=c*sd*(3.6-Math.abs(lz))+Math.cos(RO.vh)*-1.5;RO.v=-Math.max(4,Math.abs(RO.v)*.3);if(M2.wcd<=0){M2.wcd=1.5;M2.log.bounce++;M1_snd('bump');shake=.4;say('',s.plough?'REINFORCED WALL · ram it at 60+ km/h':'REINFORCED WALL · you need the RAM PLOUGH (Chapter 2)',1.6)}}}
qvTick=(f=>function(dt){f(dt);if(!RO.on||CID!=='fra')return;const s=M1_st();{const c=RO.ch,S=c&&c.m.m1&&c.v2&&c.v2.L.st[c.v2.si];if(S&&S.drops&&!M1.cs&&(S.el||0)<S.dur){S.dT=(S.dT==null?2:S.dT)-dt;if(S.dT<=0){S.dT=2.4;const a=RO.vh+(Math.random()-.5)*.6,d=24+Math.random()*20,x=RO.x+Math.sin(a)*d,z=RO.z+Math.cos(a)*d;if(!roamHit(x,z,2)&&!inRiver(x,z,0)){M1_crate(x,z);burst(SPARK,V3(x,groundY(x,z)+2,z),20,14,.5,new THREE.Color(2,1.4,.5));M2.log.drop=(M2.log.drop||0)+1}}}}if(!M2.walls&&M1.mk&&s.step>=M1_STORY.indexOf('marked'))M2_wallsBuild();if(s.plough)M2_plough();M2_wallStep(dt);
 const ch=RO.ch;if(ch&&ch.m.m1&&ch.m.ev.mid==='m2duel'&&!M2.rv.length&&ch.v2){M2_rivInit(ch,null);const rp=ch.v2.L.rp;if(rp&&!M1.boxes.some(b=>b.mis))for(let d=500;d<rp.L-300;d+=650){const a=qvAt(rp.P,rp.C,d);M1_box(a.x,a.z,1)}}})(qvTick);
window.__m2={M2,rv:()=>M2.rv.map(r=>({who:r.who,s:r.s,gap:r.gap,shield:r.shield,stall:r.stall})),walls:()=>(M2.walls||[]).map(w=>({k:w.k,x:w.x,z:w.z,h:w.h,done:w.done})),wallsBuild:()=>M2_wallsBuild(),owned:id=>!teamLocked(TEAMS.find(t=>t.id===id)),ids:M2_IDS,story:()=>M1_STORY.slice()};

// ===== M3 "Kaisers Schatten" + "Das Finale": Frankfurt chapters 3 and 4 and the Vex Kaiser boss chase, built on the m1.js mission system.
// Gated on the chapter-2 flag M1.s.M2_done (written by the chapter-2 module); dev unlock: __m3.unlock() or ?m3dev in the URL.
// Missions are registered into M1_DEF / M1_SC / M1_END and run on the M1 stage engine; M1 functions are extended by re-binding only.
// New stage type 'heat' (police heat, hide in a car wash); new race opponents (rivals with weapons, S-Bahn, cargo jet); Rocket Hop ability
// (G key / touch 🚀) and its chapter-4 upgrade Shockwave Landing. All globals are prefixed M3_.
const M3={R:null,rest:null,hcd:0,air:0,airT:0,hops:0,shocks:0,eproj:[],khp:0,log:{hop:0,shock:0,ehit:0}};
Object.assign(M1_WHO,{FERREIRA:{n:'Rui Ferreira',col:'#19d3c5',em:'🚀'},'ÇELIK':{n:'Deniz Çelik',col:'#ff9a3c',em:'💣'},BRANDT:{n:'Ole Brandt',col:'#4ceaff',em:'🎯'},NAKAMURA:{n:'Aoi Nakamura',col:'#c46bff',em:'⚡'},WEBER:{n:'Jana Weber',col:'#5dffb0',em:'🚓'},COP:{n:'Police Radio',col:'#2d7bff',em:'🚨'}});
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
function M3_intro(){M1_scene({cam:{mode:'orbit',a:()=>({x:RO.x,z:RO.z}),r:28,h:10},lines:[['KAISER','Rookie! The police just found a truck of stolen Ebbelwoi... <b>in your name</b>. Funny, isn’t it?'],['HILDE','He framed you! Every patrol in Mainhattan is looking for your car now.'],['WEBER','Jana Weber here. I believe you, rookie. Meet me at the Commerzbank and we clear your name.']],end(){const s=()=>storyShow({who:'KAISER',title:'Chapter 3 · Kaiser’s Shadow',txt:'Kaiser framed you and the police are hunting you. Clear your name, beat Ferreira and Çelik, and win the <b>Rocket Hop</b>. Follow the <b>NEXT</b> bar.'});if(RO.ch||RO.sp)M1.pend=s;else s();M1_autoRoute()}})}
Object.assign(M1_END,{
 duel3:()=>M1_scene({cam:{mode:'orbit',a:()=>({x:RO.x,z:RO.z}),r:26,h:9},lines:[['FERREIRA','Obrigado for the race. Our flags are yours.'],['HILDE','And I bolted a rocket under your seat: <b>ROCKET HOP</b>! '+(TOUCH.on?'Tap 🚀':'Press <b>G</b>')+' to launch over traffic, walls and raised bridges.'],['BRIX','Bzzt! Chapter 4 unlocked: <b>The Finale</b>. Kaiser is flying in the Sky Cup.']],end(){const s=()=>storyShow({who:'HILDE',title:'Chapter 4 · The Finale',txt:'Chapter 3 complete! You have the <b>Rocket Hop</b>. Kaiser brings the Sky Cup to Mainhattan: race his jet, beat the blackout, stop the Crown hauler, then face him.'});if(RO.ch||RO.sp)M1.pend=s;else s();M3_tw();M1_autoRoute()}}),
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

