// ---------- the painted dusk over the sultanate (start screen banner) ----------
function paintOpening(){const c=document.getElementById('opencv');if(!c)return;let x=null;try{x=c.getContext('2d')}catch(e){}if(!x)return;const w=c.width,h=c.height;
  // golden-hour sky with a low sun and soft rays
  let g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,'#5a2a4a');g.addColorStop(.35,'#d8744a');g.addColorStop(.62,'#f6c070');g.addColorStop(1,'#f2b765');x.fillStyle=g;x.fillRect(0,0,w,h);
  const sx=w*.72,sy=h*.5;let rg=x.createRadialGradient(sx,sy,0,sx,sy,h*.9);rg.addColorStop(0,'rgba(255,245,210,.95)');rg.addColorStop(.12,'rgba(255,225,150,.6)');rg.addColorStop(1,'rgba(255,200,120,0)');x.fillStyle=rg;x.fillRect(0,0,w,h);
  x.save();x.globalAlpha=.12;x.fillStyle='#fff3d0';for(let k=0;k<9;k++){const a=-Math.PI*.95+k*Math.PI*.11;x.beginPath();x.moveTo(sx,sy);x.lineTo(sx+Math.cos(a)*w,sy+Math.sin(a)*w);x.lineTo(sx+Math.cos(a+.04)*w,sy+Math.sin(a+.04)*w);x.fill()}x.restore();
  x.fillStyle='#fff6dc';x.beginPath();x.arc(sx,sy,h*.09,0,7);x.fill();
  // three layers of skyline, fading with distance
  const dome=(cx,base,r,hh)=>{x.fillRect(cx-r,base-hh,r*2,hh);x.beginPath();x.moveTo(cx-r*1.05,base-hh);x.bezierCurveTo(cx-r*1.25,base-hh-r*1.1,cx-r*.2,base-hh-r*1.2,cx,base-hh-r*1.9);x.bezierCurveTo(cx+r*.2,base-hh-r*1.2,cx+r*1.25,base-hh-r*1.1,cx+r*1.05,base-hh);x.fill();x.fillRect(cx-1,base-hh-r*2.3,2,r*.5)};
  const mina=(cx,base,wd,hh)=>{x.fillRect(cx-wd/2,base-hh,wd,hh);x.fillRect(cx-wd*.8,base-hh*.72,wd*1.6,3);x.beginPath();x.moveTo(cx-wd*.6,base-hh);x.lineTo(cx,base-hh-wd*2.2);x.lineTo(cx+wd*.6,base-hh);x.fill()};
  const layer=(col,base,sc,seed)=>{x.fillStyle=col;let s=seed;const R=()=>{s=(s*16807)%2147483647;return s/2147483647};x.fillRect(0,base,w,h-base);for(let X=-20;X<w+20;){const t=R();if(t<.4){const r=(10+R()*14)*sc;dome(X+r,base,r,(8+R()*20)*sc);X+=r*2+6*sc}else if(t<.6){const wd=6*sc;mina(X+wd,base,wd,(40+R()*40)*sc);X+=wd*3}else{const bw=(20+R()*40)*sc;x.fillRect(X,base-(10+R()*18)*sc,bw,40*sc);X+=bw}}};
  layer('rgba(170,90,80,.55)',h*.62,.7,7);layer('rgba(130,60,50,.8)',h*.68,.95,19);layer('#5e2718',h*.74,1.2,31);
  // dunes in the foreground with a rim of light
  g=x.createLinearGradient(0,h*.72,0,h);g.addColorStop(0,'#e7a55c');g.addColorStop(1,'#b8672f');x.fillStyle=g;x.beginPath();x.moveTo(0,h*.8);x.quadraticCurveTo(w*.3,h*.7,w*.55,h*.8);x.quadraticCurveTo(w*.8,h*.9,w,h*.78);x.lineTo(w,h);x.lineTo(0,h);x.fill();
  x.strokeStyle='rgba(255,230,170,.7)';x.lineWidth=2;x.beginPath();x.moveTo(0,h*.8);x.quadraticCurveTo(w*.3,h*.7,w*.55,h*.8);x.stroke();
  // a caravan crossing the dune
  x.fillStyle='#3a160c';const camel=(cx,cy,s)=>{x.save();x.translate(cx,cy);x.scale(s,s);x.beginPath();x.moveTo(-20,0);x.bezierCurveTo(-18,-14,-8,-24,0,-16);x.bezierCurveTo(6,-22,12,-14,14,-8);x.lineTo(20,-20);x.lineTo(26,-20);x.lineTo(24,-16);x.lineTo(18,-4);x.lineTo(14,2);x.lineTo(-18,2);x.fill();for(const lx of [-15,-10,8,12])x.fillRect(lx,0,2.5,16);x.restore()};
  camel(w*.2,h*.74,1.1);camel(w*.29,h*.72,1);camel(w*.37,h*.71,.9);
  // the tribes as turned pawns, lit from the sun
  const cols=['#f0b72a','#f3eee2','#3a9a48','#2c62c6','#c9312a'];for(let k=0;k<5;k++){const px=w*(.58+k*.075),py=h*.93;const gg=x.createLinearGradient(px-10,0,px+10,0);gg.addColorStop(0,'rgba(0,0,0,.25)');gg.addColorStop(.6,'rgba(255,255,255,.25)');gg.addColorStop(1,'rgba(0,0,0,.1)');
    x.fillStyle='rgba(60,20,5,.35)';x.beginPath();x.ellipse(px+6,py+2,16,4,0,0,7);x.fill();for(const f of [cols[k],gg]){x.fillStyle=f;x.beginPath();x.moveTo(px-12,py);x.quadraticCurveTo(px-12,py-6,px-7,py-8);x.quadraticCurveTo(px-4,py-20,px-4,py-26);x.lineTo(px+4,py-26);x.quadraticCurveTo(px+4,py-20,px+7,py-8);x.quadraticCurveTo(px+12,py-6,px+12,py);x.fill();x.fillRect(px-6,py-29,12,3);x.beginPath();x.arc(px,py-36,7.5,0,7);x.fill()}}
  // gilded arch frame
  x.strokeStyle='rgba(224,165,58,.9)';x.lineWidth=3;x.strokeRect(6,6,w-12,h-12);x.strokeStyle='rgba(255,230,170,.35)';x.lineWidth=1;x.strokeRect(11,11,w-22,h-22)}
