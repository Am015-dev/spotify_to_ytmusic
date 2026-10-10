function drawPlayer(t){if(G.dead)return;if(P.inv>0&&(SET.reduce?Math.floor(t*6)%3===0:Math.floor(t*20)%2))return;const D=DISTRICTS[G.di];
  ctx.save();ctx.translate(P.x,P.y);ctx.rotate(P.tilt);
  const so=ART.sp('spr-ship-'+shipDef().id,60);
  if(so){const bob=Math.sin(t*5)*1.2,en=ART.sp('fx-engine',46);ctx.globalCompositeOperation='lighter';
    if(en)ART.put(en,-24-en.w*.5*(.8+.2*PUL),bob,0,.7+.3*PUL);                  // painted jet, flickers with the beat
    G_(-18,bob,8+Math.random()*3,D.a,.55);G_(0,0,34,D.a,.14);ctx.globalCompositeOperation='source-over';ART.put(so,0,bob);ctx.restore();
    const T=tierOf(C.n);if(T>1){ctx.save();ctx.globalCompositeOperation='lighter';G_(P.x,P.y,26+13*T,TIERC[T-1],.1+.07*T);ctx.restore();}
    ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(P.x,P.y,2.5,0,7);ctx.fill();return;}
  ctx.globalCompositeOperation='lighter';G_(-20,2,16+Math.random()*5,D.a,.9);G_(0,0,34,D.a,.18);ctx.globalCompositeOperation='source-over';
  const shv=SHIPSHAPE[shipDef().id];if(shv)ctx.scale(shv[0],shv[1]);          // the planned ships have no painted sprite yet: the same hull, stretched and coloured
  ctx.fillStyle='#16102a';ctx.beginPath();ctx.moveTo(26,2);ctx.lineTo(8,-9);ctx.lineTo(-18,-8);ctx.lineTo(-22,-2);ctx.lineTo(-22,8);ctx.lineTo(-14,11);ctx.lineTo(14,10);ctx.closePath();ctx.fill();
  ctx.strokeStyle=shv?shv[2]:D.b;ctx.lineWidth=1.5;ctx.stroke();
  ctx.fillStyle=shv?shv[2]:D.b;ctx.globalAlpha=.85;ctx.beginPath();ctx.moveTo(12,-2);ctx.lineTo(4,-8);ctx.lineTo(-6,-7);ctx.lineTo(-4,-1);ctx.closePath();ctx.fill();ctx.globalAlpha=1;
  ctx.fillStyle=D.a;ctx.fillRect(-16,8,26,2);ctx.fillStyle='#fff';ctx.fillRect(22,1,4,2);
  ctx.restore();
  const T=tierOf(C.n);if(T>1){ctx.save();ctx.globalCompositeOperation='lighter';G_(P.x,P.y,26+13*T,TIERC[T-1],.1+.07*T);ctx.restore();}   // each tier: more glow on the ship
  ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(P.x,P.y,2.5,0,7);ctx.fill();}

const arming=e=>!!e.arm&&!G.dead&&e.type!=='boss';          // e.arm: set a whole beat before the shot (b.js)
function drawEnemy(e,t){const D=DISTRICTS[G.di];ctx.save();ctx.translate(e.x,e.y);const fl=e.flash>0;if(e.pw)PW.marker(e,t);
  if(arming(e)){const k=PHF;ctx.save();ctx.globalCompositeOperation='lighter';G_(0,0,e.r*(1.7+1.3*k),'#ff3050',.22+.55*k);ctx.restore();   // fires on the next beat: glow + ring that closes on the beat
    ctx.strokeStyle='#ff7080';ctx.globalAlpha=.35+.65*k;ctx.lineWidth=2+2*k;ctx.beginPath();ctx.arc(0,0,e.r+4+16*(1-k),0,7);ctx.stroke();ctx.globalAlpha=1;}
  if(e.el){ctx.strokeStyle='#ffd23d';ctx.lineWidth=2;ctx.globalAlpha=.9;ctx.beginPath();ctx.arc(0,0,e.r+4,0,7);ctx.stroke();ctx.globalAlpha=1;}
  switch(e.type){
    case'drone':{if(ART.dflash(e.ldr&&ART.have('spr-en-leader')?'spr-en-leader':'spr-en-drone',e.r*2.9,0,Math.sin(t*4+eb_(e))*1.5,0,fl)){ctx.strokeStyle='#8890c0';ctx.lineWidth=1.2;
        for(const s of[-1,1]){ctx.beginPath();ctx.ellipse(s*9,-e.r*.85,8*Math.abs(Math.sin(t*40+s)),1.6,0,0,7);ctx.stroke();}   // spinning rotors
        const red=(Math.floor(G.bp)+Math.floor(e.by))%2;ctx.globalCompositeOperation='lighter';G_(0,-e.r*.55,7,red?'#ff2030':'#2050ff',.9);ctx.globalCompositeOperation='source-over';break;}
      ctx.fillStyle=fl?'#fff':'#141024';ctx.strokeStyle='#5a6aff';ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(0,0,14,8,0,0,7);ctx.fill();ctx.stroke();
      ctx.strokeStyle='#8890c0';ctx.lineWidth=1;for(const s of[-1,1]){ctx.beginPath();ctx.moveTo(s*10,-4);ctx.lineTo(s*16,-10);ctx.stroke();ctx.beginPath();ctx.ellipse(s*16,-11,8*Math.abs(Math.sin(t*40+s)),1.5,0,0,7);ctx.stroke();}
      const red=(Math.floor(G.bp)+Math.floor(e.by))%2;ctx.globalCompositeOperation='lighter';G_(0,-6,10,red?'#ff2030':'#2050ff',.95);ctx.globalCompositeOperation='source-over';
      ctx.fillStyle='#ff3dbb';ctx.fillRect(-12,-1,5,2);break;}
    case'turret':{const a=aim(e);{const bs=ART.sp('spr-en-turret-base',e.r*2.5),br=ART.sp('spr-en-turret-barrel',e.r*1.7);
        if(bs&&br){ART.put(bs,0,e.r*.12);if(fl)ART.put(ART.sil('spr-en-turret-base',e.r*2.5,'#ffffff'),0,e.r*.12,0,.8);
          ctx.save();ctx.translate(0,-e.r*.1);ctx.rotate(a);ctx.drawImage(br.c,-br.h*.5,-br.h/2,br.w,br.h);   // the barrel turns on its hub and keeps aiming
          if(fl){const q=ART.sil('spr-en-turret-barrel',e.r*1.7,'#ffffff');ctx.globalAlpha=.8;ctx.drawImage(q.c,-br.h*.5,-br.h/2,q.w,q.h);ctx.globalAlpha=1;}ctx.restore();
          ctx.globalCompositeOperation='lighter';G_(0,-e.r*.1,10,'#ffa02d',.45);ctx.globalCompositeOperation='source-over';break;}}
      ctx.fillStyle=fl?'#fff':'#1a1020';ctx.strokeStyle='#ffa02d';ctx.lineWidth=2;ctx.beginPath();for(let i=0;i<6;i++){const q=i*Math.PI/3;ctx.lineTo(Math.cos(q)*20,Math.sin(q)*20);}ctx.closePath();ctx.fill();ctx.stroke();
      ctx.rotate(a);ctx.fillStyle='#ffa02d';ctx.fillRect(6,-3,20,6);ctx.rotate(-a);ctx.globalCompositeOperation='lighter';G_(0,0,14,'#ffa02d',.6);ctx.globalCompositeOperation='source-over';break;}
    case'charger':{if(e.aimL){ctx.strokeStyle='#ff304088';ctx.setLineDash([6,6]);ctx.beginPath();ctx.moveTo(-10,0);ctx.lineTo(-W,0);ctx.stroke();ctx.setLineDash([]);}
      if(ART.dflash('spr-en-charger',e.r*3.4,0,Math.sin(t*6+eb_(e))*1,0,fl))break;
      ctx.fillStyle=fl?'#fff':'#220a12';ctx.strokeStyle='#ff3040';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-16,0);ctx.lineTo(12,-11);ctx.lineTo(6,0);ctx.lineTo(12,11);ctx.closePath();ctx.fill();ctx.stroke();
      ctx.globalCompositeOperation='lighter';G_(12,0,12,'#ff3040',.8);ctx.globalCompositeOperation='source-over';break;}
    case'gunship':{if(ART.dflash('spr-en-gunship',e.r*3,0,Math.sin(t*2+eb_(e))*1.5,0,fl)){ctx.globalCompositeOperation='lighter';G_(-e.r*1.3,0,12,D.a,.5);ctx.globalCompositeOperation='source-over';hpBar(-30,-e.r*.8-14,60,e.hp/e.max);break;}
      ctx.fillStyle=fl?'#fff':'#120c1e';ctx.strokeStyle=D.a;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-46,0);ctx.lineTo(-20,-24);ctx.lineTo(40,-20);ctx.lineTo(50,0);ctx.lineTo(40,20);ctx.lineTo(-20,24);ctx.closePath();ctx.fill();ctx.stroke();
      ctx.font='700 10px "Chakra Petch",sans-serif';ctx.fillStyle=D.b;wtxt('KRONOS',-14,4);
      ctx.globalCompositeOperation='lighter';G_(48,0,18,'#ff3dbb',.8);for(let i=0;i<4;i++)G_(-24+i*18,-18,4,'#ffffff',Math.sin(t*5+i)>0?.8:.2);ctx.globalCompositeOperation='source-over';
      hpBar(-30,-36,60,e.hp/e.max);break;}
    case'gate':{ctx.translate(0,-e.y);const top=e.gy-e.gap/2,bot=e.gy+e.gap/2;
      if(e.on){ctx.globalCompositeOperation='lighter';ctx.fillStyle='#ff304055';ctx.fillRect(-7,0,14,top);ctx.fillRect(-7,bot,14,H-bot);ctx.fillStyle='#ffd0d8';ctx.fillRect(-1.5,0,3,top);ctx.fillRect(-1.5,bot,3,H-bot);ctx.globalCompositeOperation='source-over';}
      else if(e.tele&&(SET.reduce||Math.floor(t*16)%2)){ctx.fillStyle='#ff304066';ctx.fillRect(-1,0,2,top);ctx.fillRect(-1,bot,2,H-bot);}
      for(const y of[top,bot]){if(!gatePost(y,y===top,fl)){ctx.fillStyle=fl?'#fff':'#1a0a10';ctx.strokeStyle='#ff3040';ctx.lineWidth=2;ctx.fillRect(-12,y-12,24,24);ctx.strokeRect(-12,y-12,24,24);}
        ctx.globalCompositeOperation='lighter';G_(0,y,14,'#ff3040',.7);ctx.globalCompositeOperation='source-over';}
      hpBar(-20,top-24,40,e.hp/e.max);break;}
    case'boss':drawBoss(e,t,fl);break;}
  ctx.restore();}
const eb_=e=>e._b==null?(e._b=Math.random()*6.28):e._b;      // per-enemy phase for the bob
function gatePost(y,up,fl){const o=ART.sp('spr-en-gate',26);if(!o)return false;const cy=y+(up?-1:1)*(o.h/2-12);ART.put(o,0,cy,0,null,1,up?1:-1);
  if(fl)ART.put(ART.sil('spr-en-gate',26,'#ffffff'),0,cy,0,.8,1,up?1:-1);return true;}
function hpBar(x,y,w,f){ctx.fillStyle='#00000099';ctx.fillRect(x,y,w,4);ctx.fillStyle='#ff3dbb';ctx.fillRect(x,y,w*clamp(f,0,1),4);}
function bossPaint(e,t,fl,c){const ak=ART.artK(e),nm=ART.bossN[ak],b=nm&&ART.bm['spr-boss-'+nm];if(!b)return false;
  const wd=e.k===6?e.r*3.6*b.width/b.height:e.r*[3.6,3.4,3,3.2,3.2,3.6,0,3.4,3.4,3.4][ak],by=Math.sin(t*1.6)*3,tl=Math.sin(t*.9)*.035;
  if(e._ph===undefined){e._ph=e.ph;e.pp=0;}if(e._ph!==e.ph){e._ph=e.ph;e.pp=1;}e.pp=Math.max(0,e.pp-FD*1.4);       // a phase change pulses a glow in the district colour
  if(e.pp>0||e.ph===3){ctx.globalCompositeOperation='lighter';if(e.pp>0)G_(0,0,e.r*(2.4+1.6*e.pp),c,.6*e.pp);if(e.ph===3)G_(0,0,e.r*2.3,'#ff3040',.16+.12*PUL);ctx.globalCompositeOperation='source-over';}
  return ART.dflash('spr-boss-'+nm,wd,0,by,tl,fl,'#ff4058',.32);}   // damage: a red tint
function drawBoss(e,t,fl){const c=e.col;
  for(const l of e.lasers){ctx.save();ctx.translate(-e.x,-e.y);const tele=l.t<2*BT.spb;ctx.translate(l.x,l.y);ctx.rotate(l.a);
    if(tele){ctx.strokeStyle=(SET.reduce||Math.floor(l.t*14)%2)?'#ff3040cc':'#ff304044';ctx.lineWidth=1;ctx.setLineDash([10,6]);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(1400,0);ctx.stroke();ctx.setLineDash([]);}
    else{ctx.globalCompositeOperation='lighter';ctx.fillStyle='#ff304066';ctx.fillRect(0,-12,1400,24);ctx.fillStyle='#ffe0e6';ctx.fillRect(0,-3,1400,6);ctx.globalCompositeOperation='source-over';}
    ctx.restore();}
  ctx.globalCompositeOperation='lighter';G_(0,0,e.r*2.2,c,.35);ctx.globalCompositeOperation='source-over';
  if(bossPaint(e,t,fl,c))return;
  ctx.fillStyle='#100a1c';ctx.strokeStyle=c;ctx.lineWidth=2.5;
  if(e.k>=6)drawBossX(e,t);
  if(e.k===0){for(const s of[-1,1]){ctx.beginPath();ctx.moveTo(-10,s*10);ctx.lineTo(30,s*(70+Math.sin(t*4)*8));ctx.lineTo(10,s*64);ctx.lineTo(40,s*52);ctx.lineTo(4,s*40);ctx.lineTo(30,s*30);ctx.closePath();ctx.fill();ctx.stroke();}}
  if(e.k===1){ctx.lineWidth=4;for(let i=0;i<6;i++){ctx.beginPath();ctx.moveTo(10,0);for(let j=1;j<8;j++){const a=(i-2.5)*.35;ctx.lineTo(10+j*12,Math.sin(a)*j*14+Math.sin(t*3+j*.6+i)*8);}ctx.stroke();}ctx.lineWidth=2.5;}
  if(e.k===2){ctx.save();ctx.rotate(t*.8);ctx.strokeRect(-e.r*1.1,-e.r*1.1,e.r*2.2,e.r*2.2);ctx.rotate(.785);ctx.strokeRect(-e.r*.9,-e.r*.9,e.r*1.8,e.r*1.8);ctx.restore();}
  if(e.k===4){ctx.fillRect(-e.r*1.5,-7,e.r*3,14);ctx.strokeRect(-e.r*1.5,-7,e.r*3,14);for(const s of[-1,1]){ctx.fillRect(s*e.r*1.2-6,-e.r*.9,12,e.r*1.8);ctx.strokeRect(s*e.r*1.2-6,-e.r*.9,12,e.r*1.8);}}
  if(e.k===5){ctx.save();ctx.rotate(t*1.2);for(let i=0;i<4;i++){ctx.rotate(Math.PI/2);ctx.fillRect(e.r*.8,-4,e.r*.7,8);ctx.strokeRect(e.r*.8,-4,e.r*.7,8);}ctx.restore();}
  if(e.k===3){ctx.save();ctx.rotate(-t*.6);for(let i=0;i<8;i++){ctx.rotate(Math.PI/4);ctx.fillRect(e.r+4,-5,18,10);ctx.strokeRect(e.r+4,-5,18,10);}ctx.restore();}
  ctx.beginPath();ctx.arc(0,0,e.r,0,7);ctx.fill();if(fl){ctx.fillStyle='#ffffff38';ctx.fill();}ctx.stroke();   // a hit only tints the boss: constant fire must not turn it into a white disc
  ctx.beginPath();ctx.arc(0,0,e.r*.55,0,7);ctx.strokeStyle='#ffffff55';ctx.stroke();
  const a=aim(e);ctx.fillStyle='#fff';ctx.globalCompositeOperation='lighter';G_(Math.cos(a)*e.r*.3,Math.sin(a)*e.r*.3,e.r*(.6+.3*PUL),e.ph===3?'#ff3040':c,.95);ctx.globalCompositeOperation='source-over';
  ctx.font='700 11px "Chakra Petch",sans-serif';ctx.textAlign='center';ctx.fillStyle='#ffffffcc';wtxt(e.lbl||(e.k===2?'€':e.k===0?'ADLER':e.k===1?'':'K'),0,e.k===0?-e.r-6:4);}

function drawPickups(t){ctx.globalCompositeOperation='lighter';for(const p of G.pk){if(p.t==='pw')continue;const y=p.y+Math.sin(p.bob)*3;
    const col={shard:'#19e3ff',hp:'#3dffb0',up:'#ff2d95',emp:'#ffb020'}[p.t];G_(p.x,y,p.t==='shard'?12:20,col,.8);}
  ctx.globalCompositeOperation='source-over';
  for(const p of G.pk){const y=p.y+Math.sin(p.bob)*3;if(p.t==='pw'){PW.pickup(p,y,t);continue;}ctx.save();ctx.translate(p.x,y);
    if(pkPaint(p,t)){ctx.restore();continue;}
    if(p.t==='shard'){ctx.rotate(t*3);ctx.fillStyle='#dffbff';ctx.beginPath();ctx.moveTo(0,-6);ctx.lineTo(4,0);ctx.lineTo(0,6);ctx.lineTo(-4,0);ctx.fill();}
    else{ctx.fillStyle='#0a0612';ctx.strokeStyle={hp:'#3dffb0',up:'#ff2d95',emp:'#ffb020'}[p.t];ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,10,0,7);ctx.fill();ctx.stroke();
      ctx.fillStyle=ctx.strokeStyle;ctx.font='700 12px "Chakra Petch",sans-serif';ctx.textAlign='center';wtxt({hp:'+',up:'P',emp:'E'}[p.t],0,4);}
    ctx.restore();}}

const PKA={shard:['pk-shard',13],hp:['pk-hp',18],up:['pk-up',26],emp:['pk-emp',26]};
function pkPaint(p,t){const a=PKA[p.t];if(!a)return false;const o=ART.sp(a[0],a[1]);if(!o)return false;
  if(p.t==='shard')ART.put(o,0,0,0,null,.35+.65*Math.abs(Math.cos(t*3+p.bob)),1);else ART.put(o,0,0,Math.sin(t*2+p.bob)*.08);return true;}
