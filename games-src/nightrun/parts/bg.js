/* ---------- districts ---------- */
const SIGNS=['APFELWEIN','IMBISS','24/7 KIOSK','WECHSELSTUBE','ZEIL','SPIELHALLE','KRONOS BANK','HELIX FINANZ','GRÜNE SOSSE','ÄPPLER','U4','S-BAHN','HAUPTWACHE','DATENHAFEN','KONSTABLER','BAR','SPÄTI','HOTEL','PFAND','NEUROWARE'];
const DISTRICTS=[
  {name:'BANKENVIERTEL',sub:'Taunusanlage · 23:47',sky:['#070417','#1d0a36','#4b1250'],a:'#ff2d95',b:'#19e3ff',win:['#ffd27a','#19e3ff','#ff8ad0'],
   lm:['main','commerz','opera'],near:'rail',ad:'KRONOS BANK — IHR LEBEN. UNSERE ZINSEN.',root:45,
   waves:['droneLine','droneV','droneSine','droneSine','turret','chargers'],boss:0,bossName:'SEK-ADLER',bossSub:'Police interceptor, eagle class'},
  {name:'MAINUFER',sub:'Eiserner Steg · 00:12',sky:['#020816','#0a1f3d','#174a70'],a:'#19e3ff',b:'#ffb020',win:['#ffcf6a','#9fe8ff','#ffb020'],
   lm:['dom','roemer','main'],near:'river',ad:'HELIX FINANZ · SCHULDEN SIND FREIHEIT',root:43,
   waves:['droneSine','chargers','chargers','turret','droneV','gunship'],boss:1,bossName:'FLUSSKRAKE',bossSub:'River patrol, hydra rig'},
  {name:'OSTEND',sub:'EZB-Sperrzone · 00:40',sky:['#02100e','#062a28','#0e5049'],a:'#3dffb0',b:'#ff4060',win:['#b8fff0','#3dffb0','#ff4060'],
   lm:['ezb','grossmarkt'],near:'rail',ad:'ZENTRALBANK · STABILITÄT DURCH KONTROLLE',root:41,
   waves:['gate','gate','turret','droneLine','chargers','gunship','droneSine'],boss:2,bossName:'ZENTRAL-ICE',bossSub:'Intrusion countermeasure'},
  {name:'MESSE',sub:'Hammering Man · 01:15',sky:['#10030a','#330818','#6e1a22'],a:'#ff5a2d',b:'#ffd23d',win:['#ffd23d','#ff9a5a','#ff5a2d'],
   lm:['messe','hammer','europa'],near:'street',ad:'MESSE 2099 · ALLES IST ZU VERKAUFEN',root:40,
   waves:['droneV','droneSine','turret','chargers','gate','gunship','gunship','droneLine'],boss:3,bossName:'KRONOS',bossSub:'Corporate warship, flagship'}
];
const DIST_LEN=58;

/* ---------- background generation ---------- */
function skyline(w,h,o){const[c,g]=mk(w,h);const r=mul(o.seed);let x=0;const lights=[];
  while(x<w){let bw=Math.floor(o.minW+r()*(o.maxW-o.minW));if(w-x-bw<o.minW)bw=w-x;const bh=Math.floor(o.minH+r()*(o.maxH-o.minH));const y=h-bh;
    g.fillStyle=o.body;g.fillRect(x,y,bw,bh);
    if(r()<.3){g.fillRect(x+bw*.3,y-14,bw*.4,14);}
    g.fillStyle=o.edge;g.fillRect(x,y,bw,1);
    const cw=o.cell,ch=o.cell+2;for(let yy=y+6;yy<h-4;yy+=ch)for(let xx=x+4;xx<x+bw-4;xx+=cw){if(r()<o.winP){g.globalAlpha=.25+r()*.6;g.fillStyle=o.win[Math.floor(r()*o.win.length)];g.fillRect(xx,yy,cw-3,ch-4);}}
    g.globalAlpha=1;
    if(r()<.45){g.fillStyle=o.body;g.fillRect(x+bw/2-1,y-30,2,30);lights.push([x+bw/2,y-30]);}
    if(o.signs&&bw>44&&bh>120&&r()<.5){const txt=SIGNS[Math.floor(r()*SIGNS.length)],col=r()<.5?o.na:o.nb;g.save();g.shadowColor=col;g.shadowBlur=10;g.fillStyle=col;
      if(r()<.5&&txt.length<=10){g.font='700 13px "Chakra Petch",sans-serif';g.textAlign='center';const sx=x+bw/2,sy=y+24+r()*40;
        g.fillStyle='#0a0612';g.fillRect(sx-9,sy-12,18,txt.length*14+6);g.fillStyle=col;[...txt].forEach((ch2,i)=>g.fillText(ch2,sx,sy+i*14));}
      else{g.font='700 12px "Chakra Petch",sans-serif';const tw=g.measureText(txt).width;const sx=x+(bw-tw)/2,sy=y+30+r()*50;
        g.strokeStyle=col;g.lineWidth=1.5;g.strokeRect(sx-5,sy-12,tw+10,17);g.fillText(txt,sx,sy);}
      g.restore();}
    x+=bw+(o.gap?Math.floor(r()*o.gap):0);}
  return{c,w,lights};}

function lmSprite(kind,D){const body='#0b0816',rim=D.b;let c,g,w,h;
  const winGrid=(x0,y0,w0,h0,col,p,cw=6,ch=7)=>{for(let y=y0;y<y0+h0;y+=ch)for(let x=x0;x<x0+w0;x+=cw)if(Math.random()<p){g.globalAlpha=.3+Math.random()*.6;g.fillStyle=col;g.fillRect(x,y,cw-2,ch-3);}g.globalAlpha=1;};
  switch(kind){
    case'main':[c,g]=mk(w=100,h=470);g.fillStyle=body;g.fillRect(10,90,55,380);g.beginPath();g.moveTo(40,70);g.arc(62,110,36,-Math.PI/2,Math.PI/2);g.lineTo(40,470);g.lineTo(98,470);g.lineTo(98,110);g.fill();
      g.fillRect(40,70,58,400);winGrid(44,80,50,380,'#9fe8ff',.55,5,6);winGrid(14,100,46,360,D.win[0],.35);
      g.fillStyle='#ccc';g.fillRect(66,0,3,72);g.fillStyle=rim;g.fillRect(40,68,58,2);break;
    case'commerz':[c,g]=mk(w=120,h=500);g.fillStyle=body;g.beginPath();g.moveTo(10,500);g.lineTo(18,90);g.lineTo(102,90);g.lineTo(110,500);g.fill();
      for(let i=0;i<3;i++){g.fillStyle='#ffd23d';g.globalAlpha=.8-i*.2;g.fillRect(22+i*6,60+i*10,76-i*12,10);}g.globalAlpha=1;g.fillStyle=body;g.fillRect(20,70,80,20);
      g.fillStyle='#ffd23d';g.globalAlpha=.9;g.fillRect(24,74,72,4);g.globalAlpha=1;g.fillStyle='#ddd';g.fillRect(58,0,3,62);
      winGrid(24,96,72,400,D.win[0],.4);for(let y=130;y<480;y+=90){g.fillStyle='#1b3b2a';g.fillRect(22,y,76,22);g.fillStyle='#3dffb044';g.fillRect(24,y+2,72,18);}break;
    case'opera':[c,g]=mk(w=200,h=150);g.fillStyle=body;g.fillRect(10,60,180,90);g.beginPath();g.moveTo(10,60);g.lineTo(100,20);g.lineTo(190,60);g.fill();
      for(let i=0;i<8;i++){g.fillStyle='#ffcf6a';g.globalAlpha=.55;g.fillRect(22+i*21,80,10,34);}g.globalAlpha=1;g.fillStyle=rim;g.fillRect(10,60,180,2);
      g.font='700 10px "Chakra Petch",sans-serif';g.fillStyle='#ffcf6a';g.textAlign='center';g.fillText('ALTE OPER',100,54);break;
    case'dom':[c,g]=mk(w=110,h=330);g.fillStyle=body;g.fillRect(25,110,60,220);g.fillRect(5,220,100,110);
      g.beginPath();g.moveTo(25,110);g.lineTo(35,70);g.lineTo(75,70);g.lineTo(85,110);g.fill();g.beginPath();g.moveTo(38,70);g.quadraticCurveTo(55,10,72,70);g.fill();
      g.fillRect(53,0,4,30);g.fillStyle='#ffcf6a';g.globalAlpha=.6;for(let y=130;y<320;y+=40){g.fillRect(40,y,6,22);g.fillRect(64,y,6,22);}g.globalAlpha=1;break;
    case'roemer':[c,g]=mk(w=200,h=130);for(let i=0;i<3;i++){const x=i*66+2;g.fillStyle=body;g.beginPath();g.moveTo(x,130);g.lineTo(x,60);
      for(let s=0;s<4;s++){g.lineTo(x+s*8,60-s*12);g.lineTo(x+s*8+8,60-s*12);}g.lineTo(x+32,10);for(let s=3;s>=0;s--){g.lineTo(x+64-s*8-8,60-s*12);g.lineTo(x+64-s*8,60-s*12);}g.lineTo(x+64,130);g.fill();
      g.fillStyle='#ffcf6a';g.globalAlpha=.7;for(let r=0;r<3;r++)for(let k=0;k<3;k++)g.fillRect(x+12+k*16,62+r*20,7,11);g.globalAlpha=1;}
      g.fillStyle=rim;g.fillRect(0,128,200,2);break;
    case'ezb':[c,g]=mk(w=190,h=430);g.fillStyle=body;g.beginPath();g.moveTo(10,430);g.lineTo(18,20);g.lineTo(78,34);g.lineTo(88,430);g.fill();
      g.beginPath();g.moveTo(100,430);g.lineTo(110,40);g.lineTo(172,26);g.lineTo(182,430);g.fill();
      g.strokeStyle='#0e2a26';g.lineWidth=3;for(let y=80;y<420;y+=70){g.beginPath();g.moveTo(84,y);g.lineTo(106,y+35);g.moveTo(106,y);g.lineTo(84,y+35);g.stroke();}
      winGrid(22,44,58,380,D.win[0],.5,5,6);winGrid(112,50,62,370,D.win[1],.45,5,6);g.fillStyle=rim;g.fillRect(0,428,190,2);
      g.font='700 11px "Chakra Petch",sans-serif';g.fillStyle=D.b;g.textAlign='center';g.fillText('€ SPERRZONE €',95,14);break;
    case'grossmarkt':[c,g]=mk(w=260,h=110);g.fillStyle=body;g.fillRect(0,40,260,70);for(let i=0;i<10;i++){g.beginPath();g.moveTo(i*26,40);g.quadraticCurveTo(i*26+13,20,i*26+26,40);g.fill();}
      winGrid(6,50,248,50,D.win[0],.25,8,10);break;
    case'messe':[c,g]=mk(w=90,h=470);g.fillStyle=body;g.fillRect(15,90,60,380);g.beginPath();g.moveTo(15,90);g.lineTo(45,20);g.lineTo(75,90);g.fill();
      g.fillStyle=D.a;g.globalAlpha=.8;g.beginPath();g.moveTo(22,86);g.lineTo(45,32);g.lineTo(68,86);g.closePath();g.stroke();g.strokeStyle=D.a;g.lineWidth=1.5;g.stroke();g.globalAlpha=1;
      for(let x=22;x<75;x+=10){g.fillStyle='#1a0c10';g.fillRect(x,96,3,370);}winGrid(18,96,56,370,D.win[0],.35,5,7);break;
    case'europa':[c,g]=mk(w=80,h=510);g.fillStyle='#120a14';g.fillRect(34,120,12,390);g.beginPath();g.ellipse(40,150,36,14,0,0,7);g.fill();g.fillRect(28,130,24,20);
      g.fillStyle=D.b;g.globalAlpha=.8;g.fillRect(8,148,64,2);g.globalAlpha=1;g.fillStyle='#ccc';g.fillRect(39,0,2,125);break;
    default:return null;}
  return{c,w,h};}

function buildBG(i){const D=DISTRICTS[i];
  const far=skyline(1920,300,{seed:11+i*7,minW:30,maxW:80,minH:60,maxH:220,body:'#0d0a1e',edge:'#1f1a3a',win:D.win,winP:.12,cell:5});
  const mid=skyline(1920,380,{seed:99+i*13,minW:44,maxW:120,minH:110,maxH:330,body:'#07050f',edge:D.a,win:D.win,winP:.22,cell:7,signs:true,na:D.a,nb:D.b,gap:26});
  const lms=D.lm.filter(k=>k!=='hammer').map(k=>lmSprite(k,D));
  return{D,far,mid,lms,hammer:D.lm.includes('hammer')};}
const BGC={};function bgFor(i){return BGC[i]||(BGC[i]=buildBG(i));}

const scan=(()=>{const[c,g]=mk(W,H);g.fillStyle='rgba(0,0,0,.18)';for(let y=0;y<H;y+=3)g.fillRect(0,y,W,1);
  const v=g.createRadialGradient(W/2,H/2,H*.35,W/2,H/2,H*.95);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.6)');g.fillStyle=v;g.fillRect(0,0,W,H);return c;})();

const rain=Array.from({length:150},()=>({x:rnd(0,W),y:rnd(0,H),l:rnd(8,20),s:rnd(500,800)}));
const cars=Array.from({length:16},()=>({x:rnd(0,W),y:rnd(90,300),s:rnd(-60,-220),c:Math.random()<.5}));

function drawBG(bg,t,dt,scroll){const D=bg.D;
  const sk=ctx.createLinearGradient(0,0,0,H);sk.addColorStop(0,D.sky[0]);sk.addColorStop(.55,D.sky[1]);sk.addColorStop(1,D.sky[2]);ctx.fillStyle=sk;ctx.fillRect(0,0,W,H);
  // moon-ish haze and ad
  ctx.globalCompositeOperation='lighter';G_(W*.72,H*.28,260,D.a,.18);ctx.globalCompositeOperation='source-over';
  ctx.save();ctx.globalAlpha=.12+.04*Math.sin(t*3);ctx.font='700 46px "Chakra Petch",sans-serif';ctx.fillStyle=D.b;
  const adw=ctx.measureText(D.ad).width+400;const ax=W-((scroll*.06)%(adw+W));ctx.fillText(D.ad,ax,84);ctx.restore();
  const tile=(L,par,y)=>{const o=(scroll*par)%L.w;blit(L.c,-o,y);blit(L.c,-o+L.w,y);return o;};
  const fo=tile(bg.far,.1,H-300-40);
  // landmarks
  const span=1500;bg.lms.forEach((lm,k)=>{let x=((k*span/bg.lms.length+300)-scroll*.22)%span;if(x<-lm.w)x+=span;const y=H-lm.h-50;blit(lm.c,x,y);
    ctx.globalCompositeOperation='lighter';if(Math.sin(t*4+k)>0)G_(x+lm.w/2,y+2,10,'#ff3030',.9);ctx.globalCompositeOperation='source-over';});
  if(bg.hammer){let x=(900-scroll*.22)%span;if(x<-120)x+=span;drawHammer(x,H-50,t);}
  const mo=tile(bg.mid,.45,H-380);
  ctx.globalCompositeOperation='lighter';const blink=(Math.floor(t*1.5)%2);
  bg.mid.lights.forEach(([lx,ly],k)=>{if((k+blink)%2)return;for(const off of[0,bg.mid.w]){const x=lx-mo+off;if(x>-10&&x<W+10)G_(x,ly+H-380,7,'#ff3030',.8);}});
  // traffic
  for(const c of cars){c.x+=c.s*dt;if(c.x<-30){c.x=W+rnd(20,200);c.y=rnd(90,300);}
    ctx.fillStyle='#ffffffaa';ctx.fillRect(c.x,c.y,4,2);G_(c.x,c.y+1,6,'#ffffff',.5);G_(c.x+12,c.y+1,5,c.c?D.a:'#ff3030',.7);ctx.fillStyle='#ff303066';ctx.fillRect(c.x+4,c.y,24,1);}
  ctx.globalCompositeOperation='source-over';
  // haze
  const hz=ctx.createLinearGradient(0,H-220,0,H);hz.addColorStop(0,D.a+'00');hz.addColorStop(1,D.a+'38');ctx.fillStyle=hz;ctx.fillRect(0,H-220,W,220);
  drawNear(bg,t,scroll);}

function drawHammer(x,base,t){ctx.fillStyle='#0a0508';const hgt=190;const bx=x+40,by=base-hgt;
  ctx.fillRect(bx-10,by+40,22,hgt-40);ctx.beginPath();ctx.arc(bx+1,by+30,12,0,7);ctx.fill();
  const a=-0.2+Math.max(0,Math.sin(t*1.3))*0.9;ctx.save();ctx.translate(bx+8,by+50);ctx.rotate(a);ctx.fillRect(0,-5,70,10);ctx.fillRect(62,-12,18,24);ctx.restore();
  ctx.fillRect(bx-24,by+50,16,6);}

let trainX=2000;
function drawNear(bg,t,scroll){const D=bg.D,ty=H-58;
  if(D.near==='river'){const wy=H-86;const g=ctx.createLinearGradient(0,wy,0,H);g.addColorStop(0,'#08203a');g.addColorStop(1,'#020610');ctx.fillStyle=g;ctx.fillRect(0,wy,W,H-wy);
    ctx.save();ctx.globalAlpha=.22;const mo=(scroll*.45)%bg.mid.w,top=H-380;
    for(let s=0;s<86;s+=4){const off=Math.sin(t*2+s*.3)*4,sy=(wy-s-4)-top;if(sy<0)break;
      const seg=(sx,dx,w)=>{if(w>0)ctx.drawImage(bg.mid.c,sx*PR,sy*PR,w*PR,4*PR,dx+off,wy+s,w,4);};
      const w1=Math.min(W,bg.mid.w-mo);seg(mo,0,w1);seg(0,w1,W-w1);}
    ctx.restore();
    ctx.globalCompositeOperation='lighter';for(let i=0;i<30;i++){const x=(i*97-scroll*1.1)%W;const xx=x<0?x+W:x;ctx.fillStyle=D.a+'40';ctx.fillRect(xx,wy+10+(i*37)%70,20+(i*13)%30,1);}ctx.globalCompositeOperation='source-over';
    // Eiserner Steg
    const span=1300;let bx=(200-scroll*1.3)%span;if(bx<-600)bx+=span;const dy=wy-12;
    ctx.strokeStyle='#1a1428';ctx.lineWidth=3;ctx.fillStyle='#0c0916';ctx.fillRect(bx,dy,560,6);
    for(let k=0;k<2;k++){const ax=bx+40+k*250;ctx.beginPath();ctx.moveTo(ax,dy);ctx.quadraticCurveTo(ax+115,dy-90,ax+230,dy);ctx.stroke();
      for(let j=1;j<10;j++){const u=j/10,xx=ax+230*u,yy=dy-(1-(2*u-1)**2)*45;ctx.beginPath();ctx.moveTo(xx,dy);ctx.lineTo(xx+(j%2?12:-12),yy);ctx.stroke();}}
    ctx.fillRect(bx+20,dy,14,H-dy);ctx.fillRect(bx+270,dy,14,H-dy);ctx.fillRect(bx+520,dy,14,H-dy);
    ctx.globalCompositeOperation='lighter';for(let k=0;k<8;k++)G_(bx+30+k*70,dy-2,8,D.b,.6);ctx.globalCompositeOperation='source-over';
  }else{
    ctx.fillStyle='#050309';ctx.fillRect(0,H-30,W,30);
    const pil=180,po=(scroll*1.3)%pil;ctx.fillStyle='#0b0814';for(let x=-po;x<W+pil;x+=pil){ctx.fillRect(x,ty,16,H-ty);}
    ctx.fillStyle='#0e0a1a';ctx.fillRect(0,ty,W,12);ctx.fillStyle=D.a;ctx.fillRect(0,ty,W,1.5);
    if(D.near==='street'){const lo=(scroll*1.3)%120;ctx.globalCompositeOperation='lighter';for(let x=-lo;x<W+120;x+=120){G_(x+8,ty-4,18,D.b,.5);}ctx.globalCompositeOperation='source-over';}
    trainX-=scroll>0?7:0;if(trainX<-900)trainX=W+rnd(800,2600);
    if(trainX<W){ctx.fillStyle='#120c20';ctx.fillRect(trainX,ty-26,820,24);ctx.fillStyle=D.b;for(let k=0;k<40;k++)ctx.fillRect(trainX+8+k*20,ty-20,12,8);
      ctx.globalCompositeOperation='lighter';G_(trainX,ty-14,20,'#ffffff',.8);ctx.globalCompositeOperation='source-over';
      ctx.font='700 11px "Chakra Petch",sans-serif';ctx.fillStyle=D.a;ctx.fillText('S8 → FLUGHAFEN',trainX+40,ty-30);}
  }
}
