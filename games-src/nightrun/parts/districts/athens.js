/* ---------- ATHINA: night Athens as a fifth district and a fourth story act (stages 13-16) ----------
   Acropolis with the lit temple on its hill, Plaka rooftops, Lycabettus with its chapel, neon kiosks, and the sea at Piraeus.
   Own waves (phalanx, wedge, pillars) and its own bosses: TALOS (district boss) and HOPLITE (mini-boss). Original names and art only. */
DISTRICTS.push({name:'ATHINA',sub:'Plaka · 02:10',sky:['#04061a','#0f1a4a','#2b4488'],a:'#ffcf4a',b:'#2ee6d6',win:['#ffe9a8','#fff4d6','#2ee6d6'],
  lm:['acropolis','plaka','lycabettus','kiosk'],near:'sea',low:1,
  signs:['KAFENEIO','PERIPTERO','SOUVLAKI','OUZERI','FARMAKEIO','TAXI','GYROS','KIOSKI','METRO','PLAKA','LIMANI','PEIRAIAS','FOURNOS','IKARIA'],
  ad:'PEIRAIAS FERRY · KATHE NYHTA 23:00',root:38,
  waves:['phalanx','wedge','turret','pillars','chargers','gunship','droneSine'],boss:6,bossName:'TALOS',bossSub:'Bronze guardian, harbour class'});
const ATH=DISTRICTS.length-1;
WAVES.phalanx=function(){const y=gr(150,H-210);for(let c=0;c<2;c++)for(let r=-1;r<=1;r++)en('drone',{x:W+30+c*70,y:y+r*54,amp:0});return 3.2;};   // a block of nine drones
WAVES.wedge=function(){const y=gr(150,H-190);for(let i=-2;i<=2;i++)en('charger',{x:W+30+Math.abs(i)*72,y:y+i*52});return 3;};                  // five chargers in a V
WAVES.pillars=function(){en('gate',{x:W+30,gy:gr(150,H-200),gap:124});en('gate',{x:W+420,gy:gr(150,H-200),gap:124});return 4.8;};             // two narrow gates in a row
const ATAB={6:['fan7','spiral','laser','summon','ring','laser','fan9'],7:['fan5','ring','fan7','spiral']};
HOOK.spawnBoss(_spawnBoss=>function(o){const b=_spawnBoss(o);if(b.k===6&&!b.lbl)b.lbl='T';return b;});

/* ----- bosses: TALOS (bronze guardian) and HOPLITE (mini-boss with a shield) ----- */
function drawBossX(e,t){ctx.fillStyle='#100a1c';ctx.strokeStyle=e.col;ctx.lineWidth=2.5;
  if(e.k===6){for(let i=0;i<6;i++){ctx.save();ctx.rotate(-t*.5+i*Math.PI/3);ctx.beginPath();ctx.moveTo(e.r+2,-5);ctx.lineTo(e.r+26,0);ctx.lineTo(e.r+2,5);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();}
    ctx.beginPath();ctx.arc(0,-e.r-4,16,Math.PI,0);ctx.lineTo(10,-e.r-4);ctx.lineTo(-10,-e.r-4);ctx.closePath();ctx.fill();ctx.stroke();}                       // crest of the helmet
  else{ctx.beginPath();ctx.arc(-e.r*.9,0,e.r*.75,-Math.PI/2,Math.PI/2);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillRect(e.r*.6,-3,e.r*1.2,6);ctx.strokeRect(e.r*.6,-3,e.r*1.2,6);}}   // shield and spear

/* story act V: the stages are in story.js (CITYS) */
BOSS_SUB[7]='Shield wall, spear rig';
DISTRICTS[ATH].song='athina';
