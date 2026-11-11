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
  end(){const show=()=>storyShow({who:'HILDE',title:'Chapter 2 complete · Die Hafenbande',txt:'The Hafenbande is broken and Moreau left the harbour. You won the <b>Mainschiff</b> and the <b>Ram Plough</b>: smash the 4 reinforced walls to open their shortcuts. Kaiser is not done with you...'});if(RO.ch||RO.sp)M1.pend=show;else show();M1_autoRoute()}})}});
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
