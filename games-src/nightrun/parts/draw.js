function drawPlayer(t){if(G.dead)return;if(P.inv>0&&Math.floor(t*20)%2)return;const D=DISTRICTS[G.di];
  ctx.save();ctx.translate(P.x,P.y);ctx.rotate(P.tilt);
  ctx.globalCompositeOperation='lighter';G_(-20,2,16+Math.random()*5,D.a,.9);G_(0,0,34,D.a,.18);ctx.globalCompositeOperation='source-over';
  ctx.fillStyle='#16102a';ctx.beginPath();ctx.moveTo(26,2);ctx.lineTo(8,-9);ctx.lineTo(-18,-8);ctx.lineTo(-22,-2);ctx.lineTo(-22,8);ctx.lineTo(-14,11);ctx.lineTo(14,10);ctx.closePath();ctx.fill();
  ctx.strokeStyle=D.b;ctx.lineWidth=1.5;ctx.stroke();
  ctx.fillStyle=D.b;ctx.globalAlpha=.85;ctx.beginPath();ctx.moveTo(12,-2);ctx.lineTo(4,-8);ctx.lineTo(-6,-7);ctx.lineTo(-4,-1);ctx.closePath();ctx.fill();ctx.globalAlpha=1;
  ctx.fillStyle=D.a;ctx.fillRect(-16,8,26,2);ctx.fillStyle='#fff';ctx.fillRect(22,1,4,2);
  ctx.restore();
  ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(P.x,P.y,2.5,0,7);ctx.fill();}

function drawEnemy(e,t){const D=DISTRICTS[G.di];ctx.save();ctx.translate(e.x,e.y);const fl=e.flash>0;
  switch(e.type){
    case'drone':{ctx.fillStyle=fl?'#fff':'#141024';ctx.strokeStyle='#5a6aff';ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(0,0,14,8,0,0,7);ctx.fill();ctx.stroke();
      ctx.strokeStyle='#8890c0';ctx.lineWidth=1;for(const s of[-1,1]){ctx.beginPath();ctx.moveTo(s*10,-4);ctx.lineTo(s*16,-10);ctx.stroke();ctx.beginPath();ctx.ellipse(s*16,-11,8*Math.abs(Math.sin(t*40+s)),1.5,0,0,7);ctx.stroke();}
      const red=Math.floor(t*6+e.by)%2;ctx.globalCompositeOperation='lighter';G_(0,-6,10,red?'#ff2030':'#2050ff',.95);ctx.globalCompositeOperation='source-over';
      ctx.fillStyle='#ff3dbb';ctx.fillRect(-12,-1,5,2);break;}
    case'turret':{const a=aim(e);ctx.fillStyle=fl?'#fff':'#1a1020';ctx.strokeStyle='#ffa02d';ctx.lineWidth=2;ctx.beginPath();for(let i=0;i<6;i++){const q=i*Math.PI/3;ctx.lineTo(Math.cos(q)*20,Math.sin(q)*20);}ctx.closePath();ctx.fill();ctx.stroke();
      ctx.rotate(a);ctx.fillStyle='#ffa02d';ctx.fillRect(6,-3,20,6);ctx.rotate(-a);ctx.globalCompositeOperation='lighter';G_(0,0,14,'#ffa02d',.6);ctx.globalCompositeOperation='source-over';break;}
    case'charger':{if(e.aimL){ctx.strokeStyle='#ff304088';ctx.setLineDash([6,6]);ctx.beginPath();ctx.moveTo(-10,0);ctx.lineTo(-W,0);ctx.stroke();ctx.setLineDash([]);}
      ctx.fillStyle=fl?'#fff':'#220a12';ctx.strokeStyle='#ff3040';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-16,0);ctx.lineTo(12,-11);ctx.lineTo(6,0);ctx.lineTo(12,11);ctx.closePath();ctx.fill();ctx.stroke();
      ctx.globalCompositeOperation='lighter';G_(12,0,12,'#ff3040',.8);ctx.globalCompositeOperation='source-over';break;}
    case'gunship':{ctx.fillStyle=fl?'#fff':'#120c1e';ctx.strokeStyle=D.a;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-46,0);ctx.lineTo(-20,-24);ctx.lineTo(40,-20);ctx.lineTo(50,0);ctx.lineTo(40,20);ctx.lineTo(-20,24);ctx.closePath();ctx.fill();ctx.stroke();
      ctx.font='700 10px "Chakra Petch",sans-serif';ctx.fillStyle=D.b;ctx.fillText('KRONOS',-14,4);
      ctx.globalCompositeOperation='lighter';G_(48,0,18,'#ff3dbb',.8);for(let i=0;i<4;i++)G_(-24+i*18,-18,4,'#ffffff',Math.sin(t*5+i)>0?.8:.2);ctx.globalCompositeOperation='source-over';
      hpBar(-30,-36,60,e.hp/e.max);break;}
    case'gate':{ctx.translate(0,-e.y);const top=e.gy-e.gap/2,bot=e.gy+e.gap/2;
      if(e.on){ctx.globalCompositeOperation='lighter';ctx.fillStyle='#ff304055';ctx.fillRect(-7,0,14,top);ctx.fillRect(-7,bot,14,H-bot);ctx.fillStyle='#ffd0d8';ctx.fillRect(-1.5,0,3,top);ctx.fillRect(-1.5,bot,3,H-bot);ctx.globalCompositeOperation='source-over';}
      else if(e.tele&&Math.floor(t*16)%2){ctx.fillStyle='#ff304066';ctx.fillRect(-1,0,2,top);ctx.fillRect(-1,bot,2,H-bot);}
      for(const y of[top,bot]){ctx.fillStyle=fl?'#fff':'#1a0a10';ctx.strokeStyle='#ff3040';ctx.lineWidth=2;ctx.fillRect(-12,y-12,24,24);ctx.strokeRect(-12,y-12,24,24);
        ctx.globalCompositeOperation='lighter';G_(0,y,14,'#ff3040',.7);ctx.globalCompositeOperation='source-over';}
      hpBar(-20,top-24,40,e.hp/e.max);break;}
    case'boss':drawBoss(e,t,fl);break;}
  ctx.restore();}
function hpBar(x,y,w,f){ctx.fillStyle='#00000099';ctx.fillRect(x,y,w,4);ctx.fillStyle='#ff3dbb';ctx.fillRect(x,y,w*clamp(f,0,1),4);}
function drawBoss(e,t,fl){const c=e.col;
  for(const l of e.lasers){ctx.save();ctx.translate(-e.x,-e.y);const tele=l.t<.85;ctx.translate(l.x,l.y);ctx.rotate(l.a);
    if(tele){ctx.strokeStyle=Math.floor(l.t*14)%2?'#ff3040cc':'#ff304044';ctx.lineWidth=1;ctx.setLineDash([10,6]);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(1400,0);ctx.stroke();ctx.setLineDash([]);}
    else{ctx.globalCompositeOperation='lighter';ctx.fillStyle='#ff304066';ctx.fillRect(0,-12,1400,24);ctx.fillStyle='#ffe0e6';ctx.fillRect(0,-3,1400,6);ctx.globalCompositeOperation='source-over';}
    ctx.restore();}
  ctx.globalCompositeOperation='lighter';G_(0,0,e.r*2.2,c,.35);ctx.globalCompositeOperation='source-over';
  ctx.fillStyle=fl?'#fff':'#100a1c';ctx.strokeStyle=c;ctx.lineWidth=2.5;
  if(e.k===0){for(const s of[-1,1]){ctx.beginPath();ctx.moveTo(-10,s*10);ctx.lineTo(30,s*(70+Math.sin(t*4)*8));ctx.lineTo(10,s*64);ctx.lineTo(40,s*52);ctx.lineTo(4,s*40);ctx.lineTo(30,s*30);ctx.closePath();ctx.fill();ctx.stroke();}}
  if(e.k===1){ctx.lineWidth=4;for(let i=0;i<6;i++){ctx.beginPath();ctx.moveTo(10,0);for(let j=1;j<8;j++){const a=(i-2.5)*.35;ctx.lineTo(10+j*12,Math.sin(a)*j*14+Math.sin(t*3+j*.6+i)*8);}ctx.stroke();}ctx.lineWidth=2.5;}
  if(e.k===2){ctx.save();ctx.rotate(t*.8);ctx.strokeRect(-e.r*1.1,-e.r*1.1,e.r*2.2,e.r*2.2);ctx.rotate(.785);ctx.strokeRect(-e.r*.9,-e.r*.9,e.r*1.8,e.r*1.8);ctx.restore();}
  if(e.k===3){ctx.save();ctx.rotate(-t*.6);for(let i=0;i<8;i++){ctx.rotate(Math.PI/4);ctx.fillRect(e.r+4,-5,18,10);ctx.strokeRect(e.r+4,-5,18,10);}ctx.restore();}
  ctx.beginPath();ctx.arc(0,0,e.r,0,7);ctx.fill();ctx.stroke();
  ctx.beginPath();ctx.arc(0,0,e.r*.55,0,7);ctx.strokeStyle='#ffffff55';ctx.stroke();
  const a=aim(e);ctx.fillStyle='#fff';ctx.globalCompositeOperation='lighter';G_(Math.cos(a)*e.r*.3,Math.sin(a)*e.r*.3,e.r*.6,e.hp<e.max*.5?'#ff3040':c,.95);ctx.globalCompositeOperation='source-over';
  ctx.font='700 11px "Chakra Petch",sans-serif';ctx.textAlign='center';ctx.fillStyle='#ffffffcc';ctx.fillText(e.k===2?'€':e.k===0?'ADLER':e.k===1?'':'K',0,e.k===0?-e.r-6:4);}

function drawPickups(t){ctx.globalCompositeOperation='lighter';for(const p of G.pk){const y=p.y+Math.sin(p.bob)*3;
    const col={shard:'#19e3ff',hp:'#3dffb0',up:'#ff2d95',emp:'#ffb020'}[p.t];G_(p.x,y,p.t==='shard'?12:20,col,.8);}
  ctx.globalCompositeOperation='source-over';
  for(const p of G.pk){const y=p.y+Math.sin(p.bob)*3;ctx.save();ctx.translate(p.x,y);
    if(p.t==='shard'){ctx.rotate(t*3);ctx.fillStyle='#dffbff';ctx.beginPath();ctx.moveTo(0,-6);ctx.lineTo(4,0);ctx.lineTo(0,6);ctx.lineTo(-4,0);ctx.fill();}
    else{ctx.fillStyle='#0a0612';ctx.strokeStyle={hp:'#3dffb0',up:'#ff2d95',emp:'#ffb020'}[p.t];ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,10,0,7);ctx.fill();ctx.stroke();
      ctx.fillStyle=ctx.strokeStyle;ctx.font='700 12px "Chakra Petch",sans-serif';ctx.textAlign='center';ctx.fillText({hp:'+',up:'P',emp:'E'}[p.t],0,4);}
    ctx.restore();}}
