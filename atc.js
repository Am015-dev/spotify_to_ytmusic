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
  hi:'My bakery van! Drakos’ boys took it, with three hundred koulouria inside!',win:'My koulouria! Still warm. You eat first, paidi mou.',lose:'Ach, they got away. Again, paidi mou!',
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
  hi:'All of Plaka is coming to my taverna to watch you before the big race. Give them a show!',win:'Opa! The whole of Plaka is shouting your name.',lose:'The crowd went home early. Try again!',
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
Object.assign(M1_RADIO,{atc_koulouri:{1:['DRAKOS','You hit my van? My boys will hit <b>you</b>.'],2:['YIAYIA','My van! Bring it home to Psyrri, paidi mou!']},atc_mopeds:{2:['SPIROS','You wrecked my riders? I drop mines, slow car!'],3:['ELENI','Bags back to Monastiraki. The tourists are waiting.']},
 atc_climb:{2:['PAPPAS','The Parthenon is watching. Do not embarrass yourself!']},atc_pappas:{0:['PAPPAS','Gates on the road, items in the ? boxes. <b>Pame!</b>']},
 atc_amphora:{1:['ELENI','Got the amphora? Now the <b>DRIVE TO</b> gate. The mission carries on in the next district.'],3:['DRAKOS','That amphora is mine. Boys, take it back!']},atc_metro:{1:['ELENI','Through the gate! The train leaves when you cross.']},
 atc_lyka:{2:['ELENI','Stay inside the summit zone! Leave it too long and the hill is his.'],3:['DRAKOS','My lieutenant will throw you off my hill.']},atc_lambrou:{0:['LAMBROU','Sofias is mine. Try to keep up.']},
 atc_blackout:{1:['DRAKOS','You turned my lights back on? Riot, boys!']},atc_kifisias:{1:['ELENI','He is crossing into Chalandri! Follow him through the <b>DRIVE TO</b> gate.'],2:['ELENI','The convoy splits! Ram both trucks!']},
 atc_taverna:{1:['YIAYIA','Opa! Now drift for them!']},atc_drakos:{0:['DRAKOS','Three laps of my city would be too kind. One run. <b>Go.</b>']}});
const ATC_TAUNT={PAPPAS:[['Bravo, but too slow!','The Parthenon has seen faster donkeys!'],['Hey! Nobody passes Pappas on his street!']],LAMBROU:[['Clean lines win races, rookie.','I can see you in my mirror. Small.'],['Lucky gap. It will not last.']],
 DRAKOS:[['Enjoy the view of my city, tourist.','The Cup stays in the Kallimarmaro.'],['Impossible! Boys, stop that car!']],METRO:[['Next stop: Panepistimio.','Please mind the gap.'],['The metro is delayed. Hurry, it will catch up!']]};
// ---------- state
function ATC_st(){if(ATC.slot!==SLOT){ATC.slot=SLOT;ATC.s=null;ATC.mk=0}if(!ATC.s)ATC.s=store.get('mho_atc',null)||{v:1,step:0,done:{},rw:{},pend:null};return ATC.s}
function ATC_save(){store.set('mho_atc',ATC.s)}
const ATC_isA=ch=>!!(ch&&ch.m&&ch.m.atc),ATC_chN=id=>ATC_DEF[id]?ATC_DEF[id].ch:0;
// ---------- marks (only the current story step, only in its start district)
function ATC_mkMark(id){const D=ATC_DEF[id],a=D.d0===ATHD?ATC_P(D.at[0],D.at[1],300):M1_P(RO.x,RO.z,300);const ev={id:id,mid:id,kind:'m1',npc:D.npc,name:D.name,em:D.em,col:D.col,hi:D.hi,win:D.win,lose:D.lose,d:D.d2,items:D.items};QAV[ev.id]=M1_av(D.who);
 const m=qvMk({kind:'quest',m1:1,atc:1,ev,x:a.x,z:a.z,h:0,icon:D.em,col:D.col});const r2=new THREE.Mesh(new THREE.TorusGeometry(12,.5,8,48),neonMat('#ffd400',2.6));r2.rotation.x=Math.PI/2;r2.position.y=.6;m.g.add(r2);if(RO.ch||RO.sp)m.g.visible=false;return m}
const ATC_mark=id=>RO.marks.find(m=>m.atc&&m.ev.mid===id);
function ATC_marks(){for(const m of RO.marks.filter(q=>q.atc)){RO.marks.splice(RO.marks.indexOf(m),1);RO.grp.remove(m.g)}ATC.mk=1;if(CID!=='ath')return;const s=ATC_st(),id=ATC_ORDER[s.step];if(!id||s.pend)return;if(ATC_DEF[id].d0===ATHD)ATC_mkMark(id)}
// ---------- NEXT guidance (Athens): the campaign step, or the district to drive to
function ATC_next(){const s=ATC_st();if(s.pend){const D=ATC_DEF[s.pend.mid];if(s.pend.d===ATHD)return{ic:'↪',t:'Resuming · '+D.name,sub:ATH_DIST[ATHD].name,act:'none'};return{ic:'🚪',t:'Continue · '+D.name,sub:`Drive to ${ATH_DIST[s.pend.d].name} · tap`,act:'dist',d:s.pend.d}}
 const id=ATC_ORDER[s.step];if(!id)return null;const D=ATC_DEF[id],pre=`CH ${D.ch} · `;if(D.d0!==ATHD)return{ic:'🗺',t:pre+D.name,sub:`Starts in ${ATH_DIST[D.d0].name} · tap to go`,act:'dist',d:D.d0};const m=ATC_mark(id);return{ic:D.em,t:pre+D.name,sub:m?districtAt(m.x,m.z):'',m,act:'route'}}
M1_next=(f=>function(){if(CID==='ath'){const n=ATC_next();if(n)return n}return f()})(M1_next);
M1_nextGo=(f=>function(){if(CID==='ath'&&state==='roam'){const n=M1_next();if(n&&n.act==='dist'){M1.lastNextGo=n;athDistPick(n.d);return}if(n&&n.act==='none')return}return f()})(M1_nextGo);
// ---------- start: a mission begun outside its start district resumes at that district's first stage (retry after a transfer)
chStart=(f=>function(m,o){if(m&&m.atc&&!M1.restoring){const D=ATC_DEF[m.ev.mid];if(D.d0!==ATHD){const L=qvPreview(m),i=ATC_cont(L.st,ATHD);if(i<0){say(D.name.toUpperCase(),'STARTS IN '+ATH_DIST[D.d0].name.toUpperCase(),1.8);return}M1.restoring={mid:m.ev.mid,si:i,x:RO.x,z:RO.z,h:RO.h,left:L.st[i].T||90,t:0,hp:100,ph:L.st[i].ph,vanAt:null,rv:null}}}
 const r=f(m,o);if(m&&m.atc&&RO.ch){M1.restoring=null;ATC.tauntT=10;const s=ATC_st();if(s.rw.ghost&&!M1.inv){M1.inv='ghost';M1_tw()}}return r})(chStart);
chEnd=(f=>function(v){const ch=RO.ch,a=ATC_isA(ch),id=a&&ch.m.ev.mid;f(v);if(a&&v!=null)ATC_done(id)})(chEnd);
qvFail=(f=>function(ch,why){if(ATC_isA(ch)){const D=ATC_DEF[ch.m.ev.mid];why=String(why||'').replace('LUCA ROSSI WON THE DUEL',D.rv?D.rv.lose:'YOUR RIVAL WON').replace('KAISER’S CREW','DRAKOS’ CREW').replace('KAISER GOT AWAY','THE COURIER GOT AWAY')}return f(ch,why)})(qvFail);
hitPop=(f=>function(t,col){if(ATC_isA(RO.ch)&&typeof t==='string'){const D=ATC_DEF[RO.ch.m.ev.mid];if(D.rv)t=t.replace('ROSSI',D.rv.n)}return f(t,col)})(hitPop);
qvTgt=(f=>function(ch){if(ATC_isA(ch)&&ch.v2){const S=ch.v2.L.st[ch.v2.si],tg=ch.v2.tg;if(S&&S.t==='atcGate'&&S.x!=null){tg.x=S.x;tg.z=S.z;return tg}
  if(S&&S.koth){const t=f(ch);if(!t||Math.hypot(t.x-S.koth.x,t.z-S.koth.z)>S.koth.r*.7||Math.hypot(RO.x-S.koth.x,RO.z-S.koth.z)>S.koth.r*.6){tg.x=S.koth.x;tg.z=S.koth.z;return tg}return t}}return f(ch)})(qvTgt);
qvEnter=(f=>function(ch,i){f(ch,i);if(ATC_isA(ch)&&ch.v2){const S=ch.v2.L.st[ch.v2.si];if(S&&S.t==='atcGate'&&!S.gs){S.gs=1;ATC_gateSetup(ch,S)}}})(qvEnter);
// ---------- the DRIVE TO gate inside a mission
function ATC_gateSetup(ch,S){const G=(HUB.gates||[]).filter(g=>g.to===S.to);const ref=S.aim||{x:RO.x,z:RO.z};let b=null,bd=1e18;for(const g of G){const d=Math.hypot(g.x-RO.x,g.z-RO.z)+Math.hypot(g.x-ref.x,g.z-ref.z)*.6;if(d<bd){bd=d;b=g}}
 if(!b){const[x,z]=WP(ATH_DIST[S.to].st[0],ATH_DIST[S.to].st[1]);b={x,z,to:S.to}}S.x=b.x;S.z=b.z;const r=new THREE.Mesh(new THREE.TorusGeometry(10,.6,8,40),neonMat(ATH_DIST[S.to].col,3));r.position.set(b.x,groundY(b.x,b.z)+6,b.z);r.rotation.y=Math.atan2(b.x-RO.x,b.z-RO.z);RO.grp.add(r);M1_obj({m:r});
 say('DRIVE TO GATE',ATH_DIST[S.to].name.toUpperCase()+' · THE MISSION CONTINUES THERE',1.8)}
function ATC_transfer(ch,S){const s=ATC_st(),V=ch.v2,D=ATH_DIST[S.to],[tx,tz]=WP(D.st[0],D.st[1]),dx=tx-S.x,dz=tz-S.z,dd=Math.hypot(dx,dz)||1,ax=S.x+dx/dd*45,az=S.z+dz/dd*45;
 s.pend={mid:ch.m.ev.mid,si:V.si+1,d:S.to,left:Math.max(V.left,60),t:+ch.t.toFixed(1),hp:Math.round(Math.max(60,M1.hp)),inv:M1.inv||null,from:ATHD};ATC_save();ATC.xfer=1;
 RO.ch=null;M1.cp=null;hitPop('🚪 '+D.name.toUpperCase(),'#5dffb0');athDistGo(S.to,ax,az,Math.atan2(dx,dz),1)}
function ATC_resume(){const s=ATC_st(),P=s.pend;if(!P||!ATC_DEF[P.mid])return(s.pend=null,ATC_save());const id=P.mid;let m=ATC_mark(id)||ATC_mkMark(id);const L=qvPreview(m),i=Math.min(P.si,L.st.length-1),S=L.st[i];
 s.pend=null;ATC_save();M1.hp=P.hp;if(P.inv)M1.inv=P.inv;M1.restoring={mid:id,si:i,x:RO.x,z:RO.z,h:RO.h,left:P.left,t:P.t,hp:P.hp,ph:S.ph,vanAt:null,rv:null};chStart(m,{O:{x:m.x,z:m.z}});M1.restoring=null;ATC.resumed=(ATC.resumed||0)+1;
 if(RO.ch)setTimeout(()=>{if(RO.ch&&!M1.cs)M1_radio('ELENI',`You made it to <b>${ATH_DIST[ATHD].name}</b>. ${S.txt}!`)},400)}
// ---------- progress + rewards (one new thing per chapter)
const ATC_RW={1:{k:'ghost',t:'GHOST unlocked',lines:[['PAPPAS','You beat me on my own street. Fine. Athens is yours to explore, rookie.'],['ELENI','A gift from my garage: the <b>GHOST</b>. Every mission starts with a ghost charge: press ITEM and pass straight through Drakos’ cars.'],['DRAKOS','Enjoy your little tricks. Chapter two: the narrow streets are <b>mine</b>.']]},
 2:{k:'magnet',t:'MAGNET unlocked',lines:[['LAMBROU','Fast and clean. Drakos will not like you.'],['ELENI','Your second gift: the <b>MAGNET</b>. Item boxes near you fly into your car during missions.'],['DRAKOS','Enough games. Chapter three: <b>O Drakos</b>. Meet me in the Kallimarmaro.']]},
 3:{k:'cup',t:'AKROPOLIS CUP won · Drakos’ car unlocked',lines:[['DRAKOS','...Take the cup. Take my car. Athens is yours, tourist.'],['YIAYIA','Opa! Koulouria for everyone, forever!'],['ELENI','The Akropolis Cup is in Psyrri where it belongs. Campaign complete, champion.']]}};
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
