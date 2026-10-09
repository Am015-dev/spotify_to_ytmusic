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
const _spawnBoss=spawnBoss;spawnBoss=function(o){const b=_spawnBoss(o);if(b.k===6&&!b.lbl)b.lbl='T';return b;};

/* ----- landmark sprites (called from lmSprite's default branch) ----- */
function athSprite(kind,D){let c,g,w,h;const body='#0b0816',lit=D.win[1],rim=D.a;
  const glowAt=(x,y,r,col,a)=>{const gg=g.createRadialGradient(x,y,0,x,y,r);gg.addColorStop(0,col+Math.round(a*255).toString(16).padStart(2,'0'));gg.addColorStop(1,col+'00');g.fillStyle=gg;g.fillRect(x-r,y-r,r*2,r*2);};
  switch(kind){
    case'acropolis':{[c,g]=mk(w=300,h=250);glowAt(150,118,120,D.a,.3);
      g.fillStyle=body;g.beginPath();g.moveTo(0,250);g.lineTo(30,205);g.lineTo(70,168);g.lineTo(95,152);g.lineTo(215,152);g.lineTo(245,170);g.lineTo(272,208);g.lineTo(300,250);g.closePath();g.fill();
      g.strokeStyle=rim;g.globalAlpha=.55;g.lineWidth=1.5;g.beginPath();g.moveTo(30,205);g.lineTo(70,168);g.lineTo(95,152);g.lineTo(215,152);g.lineTo(245,170);g.lineTo(272,208);g.stroke();g.globalAlpha=1;
      g.fillStyle='#d9c58a';g.globalAlpha=.9;g.fillRect(92,144,126,8);                                   // temple floor
      for(let i=0;i<8;i++)g.fillRect(98+i*15.5,104,7,40);                                              // eight columns
      g.fillRect(94,96,122,8);g.beginPath();g.moveTo(90,96);g.lineTo(155,66);g.lineTo(220,96);g.closePath();g.fill();   // beam and gable
      g.globalAlpha=1;g.fillStyle=body;g.beginPath();g.moveTo(104,92);g.lineTo(155,72);g.lineTo(206,92);g.closePath();g.fill();
      g.fillStyle='#ffe9a8';g.globalAlpha=.5;for(let i=0;i<7;i++)g.fillRect(105+i*15.5,108,6,34);g.globalAlpha=1;
      g.fillStyle='#fff6d0';g.fillRect(150,52,2,12);break;}
    case'lycabettus':{[c,g]=mk(w=240,h=230);g.fillStyle=body;g.beginPath();g.moveTo(0,230);g.quadraticCurveTo(70,200,105,120);g.quadraticCurveTo(125,70,145,62);g.quadraticCurveTo(170,70,190,130);g.quadraticCurveTo(215,200,240,230);g.closePath();g.fill();
      g.strokeStyle=D.b;g.globalAlpha=.4;g.lineWidth=1.5;g.beginPath();g.moveTo(105,120);g.quadraticCurveTo(125,70,145,62);g.quadraticCurveTo(170,70,190,130);g.stroke();g.globalAlpha=1;
      glowAt(143,50,34,'#ffffff',.35);g.fillStyle='#f4f1e6';g.fillRect(133,46,20,16);g.fillStyle=body;g.fillRect(140,52,6,10);g.fillStyle='#f4f1e6';g.fillRect(142,34,2.5,12);g.fillRect(138.5,38,10,2.5);   // white chapel and cross
      g.fillStyle='#050309';for(const x of[40,72,168,205]){g.beginPath();g.ellipse(x,214-Math.abs(x-120)*.2,5,17,0,0,7);g.fill();}   // cypress trees
      g.fillStyle='#ffd27a';g.globalAlpha=.7;for(let i=0;i<9;i++)g.fillRect(90+Math.sin(i*1.7)*40+i*6,150+i*7,2,2);g.globalAlpha=1;break;}
    case'plaka':{[c,g]=mk(w=240,h=130);const hs=[[0,62,58],[52,48,48],[96,78,62],[154,54,50],[196,66,44]];
      for(const[x,hh,ww]of hs){g.fillStyle=body;g.fillRect(x,130-hh,ww,hh);g.fillStyle='#14102a';g.fillRect(x-2,130-hh-4,ww+4,5);g.fillStyle=rim;g.globalAlpha=.5;g.fillRect(x-2,130-hh-4,ww+4,1);g.globalAlpha=1;
        for(let yy=130-hh+10;yy<118;yy+=16)for(let xx=x+7;xx<x+ww-9;xx+=15){g.fillStyle=Math.random()<.65?D.win[0]:'#1a1430';g.globalAlpha=.8;g.fillRect(xx,yy,7,9);g.globalAlpha=1;}}
      g.strokeStyle='#ffd27a';g.globalAlpha=.55;g.lineWidth=1;g.beginPath();g.moveTo(8,40);g.quadraticCurveTo(60,60,110,40);g.quadraticCurveTo(160,60,225,38);g.stroke();g.globalAlpha=1;   // string lights
      g.fillStyle='#ffd27a';for(const[x,y]of[[8,40],[34,50],[60,53],[86,50],[110,40],[134,51],[160,54],[190,50],[225,38]]){g.beginPath();g.arc(x,y,2,0,7);g.fill();}break;}
    case'kiosk':{[c,g]=mk(w=84,h=110);g.fillStyle=body;g.fillRect(14,56,56,54);g.fillStyle='#14102a';g.fillRect(8,50,68,8);
      for(let i=0;i<6;i++){g.fillStyle=i%2?D.a:'#14102a';g.globalAlpha=.8;g.fillRect(8+i*11.3,58,11.3,8);}g.globalAlpha=1;
      g.fillStyle='#ffe9a8';g.globalAlpha=.8;g.fillRect(20,72,44,22);g.globalAlpha=1;g.fillStyle=body;g.fillRect(24,76,8,14);g.fillRect(36,76,8,14);g.fillRect(48,76,8,14);
      glowAt(42,26,40,D.b,.4);g.font='700 13px "Chakra Petch",sans-serif';g.textAlign='center';g.fillStyle=D.b;g.shadowColor=D.b;g.shadowBlur=8;g.fillText('KIOSKI',42,30);g.shadowBlur=0;
      g.strokeStyle=D.b;g.lineWidth=1.5;g.strokeRect(10,16,64,20);break;}
    default:return null;}
  return{c,w,h};}

/* ----- the sea at Piraeus, in place of the street (landscape) ----- */
function drawSea(bg,t,scroll){const D=bg.D,wy=H-70;
  const g=ctx.createLinearGradient(0,wy-12,0,H);g.addColorStop(0,'#0a2a4a');g.addColorStop(.35,'#071a36');g.addColorStop(1,'#020812');ctx.fillStyle=g;ctx.fillRect(0,wy,W,H-wy);
  ctx.fillStyle='#16345c';ctx.fillRect(0,wy-2,W,3);                                              // horizon line of the water
  ctx.globalCompositeOperation='lighter';ctx.fillStyle=D.a+'26';                               // a few still gold reflections of the lit hill
  for(let i=0;i<6;i++){const x=((i*173-scroll*.6)%W+W)%W;ctx.fillRect(x,wy+8+i*9,34-i*3,1.5);}
  ctx.globalCompositeOperation='source-over';
  // a ferry at anchor, drifting slowly past
  const span=2200;let fx=((900-scroll*.35)%span+span)%span-420;
  if(fx<W+40){ctx.fillStyle='#0a0612';ctx.fillRect(fx,wy-34,300,30);ctx.beginPath();ctx.moveTo(fx-24,wy-4);ctx.lineTo(fx,wy-34);ctx.lineTo(fx+300,wy-34);ctx.lineTo(fx+330,wy-4);ctx.closePath();ctx.fill();ctx.fillRect(fx+90,wy-60,120,26);
    ctx.fillStyle=D.win[0];for(let k=0;k<22;k++)ctx.fillRect(fx+10+k*13,wy-26,7,5);for(let k=0;k<8;k++)ctx.fillRect(fx+98+k*14,wy-52,7,6);
    ctx.fillStyle=D.b;ctx.fillRect(fx+140,wy-72,40,12);}
  // quay with lamp posts and cranes of the harbour
  ctx.fillStyle='#050309';ctx.fillRect(0,H-26,W,26);ctx.fillStyle='#0e0a1a';ctx.fillRect(0,H-32,W,8);ctx.fillStyle=D.b;ctx.fillRect(0,H-32,W,1.5);
  const lo=(scroll*1.3)%160;ctx.globalCompositeOperation='lighter';for(let x=-lo;x<W+160;x+=160){ctx.fillStyle='#0b0814';ctx.fillRect(x+6,H-62,3,30);G_(x+7.5,H-64,16,D.a,.45);}ctx.globalCompositeOperation='source-over';
  const cr=((1300-scroll*1.3)%1900+1900)%1900-300;ctx.fillStyle='#0b0814';ctx.fillRect(cr,H-130,6,100);ctx.fillRect(cr-60,H-130,150,5);ctx.fillRect(cr+80,H-130,3,36);
  ctx.globalCompositeOperation='lighter';G_(cr+3,H-132,7,'#ff3030',.5);ctx.globalCompositeOperation='source-over';}

/* ----- portrait: the sea along the left edge and the lit Acropolis plateau sliding by ----- */
function athensP(bg,t,scroll){const D=bg.D;
  const g=ctx.createLinearGradient(0,0,PW_*.24,0);g.addColorStop(0,'#0a2a4af0');g.addColorStop(1,'#0a2a4a00');ctx.fillStyle=g;ctx.fillRect(0,0,PW_*.24,PH_);
  ctx.globalCompositeOperation='lighter';ctx.fillStyle='#2ee6d61c';for(let i=0;i<10;i++){const y=((i*131+scroll*.2)%PH_+PH_)%PH_;ctx.fillRect(6+(i*37)%50,y,26,1.5);}ctx.globalCompositeOperation='source-over';
  const span=2600,y=((scroll*.55)%span)-300;                                                          // the hill with the temple, once per ~2600 units of scroll
  if(y>-260&&y<PH_+40){const x=PW_*.66;ctx.globalAlpha=clamp((y-30)/260,0,1)*.9;ctx.globalCompositeOperation='lighter';G_(x,y+90,170,D.a,.16);ctx.globalCompositeOperation='source-over';
    ctx.fillStyle='#0b0816';ctx.fillRect(x-100,y,200,180);ctx.strokeStyle=D.a;ctx.globalAlpha=.3;ctx.lineWidth=2;ctx.strokeRect(x-100,y,200,180);ctx.globalAlpha=1;
    ctx.fillStyle='#e8d9a8';ctx.globalAlpha=.85;ctx.fillRect(x-62,y+40,124,10);ctx.fillRect(x-62,y+130,124,10);
    for(let i=0;i<9;i++){ctx.beginPath();ctx.arc(x-56+i*14,y+45,3.5,0,7);ctx.arc(x-56+i*14,y+135,3.5,0,7);ctx.fill();}ctx.globalAlpha=1;}}

/* ----- bosses: TALOS (bronze guardian) and HOPLITE (mini-boss with a shield) ----- */
function drawBossX(e,t){ctx.fillStyle='#100a1c';ctx.strokeStyle=e.col;ctx.lineWidth=2.5;
  if(e.k===6){for(let i=0;i<6;i++){ctx.save();ctx.rotate(-t*.5+i*Math.PI/3);ctx.beginPath();ctx.moveTo(e.r+2,-5);ctx.lineTo(e.r+26,0);ctx.lineTo(e.r+2,5);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();}
    ctx.beginPath();ctx.arc(0,-e.r-4,16,Math.PI,0);ctx.lineTo(10,-e.r-4);ctx.lineTo(-10,-e.r-4);ctx.closePath();ctx.fill();ctx.stroke();}                       // crest of the helmet
  else{ctx.beginPath();ctx.arc(-e.r*.9,0,e.r*.75,-Math.PI/2,Math.PI/2);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillRect(e.r*.6,-3,e.r*1.2,6);ctx.strokeRect(e.r*.6,-3,e.r*1.2,6);}}   // shield and spear

/* story act V: the stages are in story.js (CITYS) */
BOSS_SUB[7]='Shield wall, spear rig';
DISTRICTS[ATH].song='athina';
setTimeout(()=>{if(!running)bgFor(ATH);},3900);                                                       // build the skyline while the title is up
