/* ---------- ATHINA must be Athens in every orientation ----------
   Landscape: moon and glint on the water, olive groves on the shore, on top of the lit Acropolis, Plaka and Lycabettus that were already there.
   Portrait: its own backdrop. A big floodlit Acropolis with the Parthenon on its hill passes by all the time (once per layer, always on screen somewhere), Lycabettus with its chapel,
   olive groves, whitewashed Plaka roofs with a blue church dome and string lights, and the sea with moon glints along the left edge. Original art only, no bullet-coloured pixels. */
{const as0=athSprite;athSprite=function(kind,D){
  if(kind==='acropolis'){const r=as0(kind,D),k=1.45,[c,g]=mk(r.w*k,r.h*k);g.drawImage(r.c,0,0,r.w*k,r.h*k);return{c,w:r.w*k,h:r.h*k};}      // the Acropolis is the hero of the skyline: bigger
  if(kind!=='olive')return as0(kind,D);
  const[c,g]=mk(260,120),r=mul(77);g.fillStyle='#050309';g.fillRect(0,108,260,12);
  for(let i=0;i<9;i++){const x=14+i*28+r()*10,h=30+r()*16;g.fillStyle='#0a0710';g.fillRect(x-1.5,120-h*.8,3,h*.6);
    for(let k=0;k<4;k++){g.fillStyle=['#14211c','#1c2e26','#2a4034','#3c5a48'][k];g.beginPath();g.ellipse(x+(k-1.5)*5,120-h-4+k*2,15-k*2,10-k,0,0,7);g.fill();}
    g.fillStyle='#b8d8b0';g.globalAlpha=.35;g.beginPath();g.ellipse(x-4,120-h-9,8,3,0,0,7);g.fill();g.globalAlpha=1;}
  return{c,w:260,h:120};};
 DISTRICTS[ATH].lm.push('olive','olive');}
{const ds=drawSea;drawSea=function(bg,t,scroll){ds(bg,t,scroll);
  const D=bg.D,wy=H-70,mx=W*.64;ctx.save();ctx.globalCompositeOperation='lighter';
  const gl=ctx.createLinearGradient(0,wy,0,H);gl.addColorStop(0,'#cfe6ff44');gl.addColorStop(1,'#cfe6ff00');                       // the moon's glint column on the water
  ctx.fillStyle=gl;ctx.beginPath();ctx.moveTo(mx-14,wy);ctx.lineTo(mx+14,wy);ctx.lineTo(mx+46,H-26);ctx.lineTo(mx-46,H-26);ctx.closePath();ctx.fill();
  ctx.fillStyle='#e8f2ff';for(let i=0;i<16;i++){const y=wy+4+i*(H-30-wy)/16,hw=3+i*2.2,j=Math.sin(t*1.7+i*1.9);ctx.globalAlpha=.55-.025*i;ctx.fillRect(mx+j*(2+i*.9)-hw,y,hw*2,1.4);}
  ctx.globalAlpha=1;ctx.restore();};}
{const db=drawBG;drawBG=function(bg,t,dt,scroll){db(bg,t,dt,scroll);
  if(bg.D.name!=='ATHINA')return;ctx.save();ctx.globalCompositeOperation='lighter';const mx=W*.64,my=H*.2;G_(mx,my,120,'#bcd6ff',.2);ctx.globalCompositeOperation='source-over';
  ctx.fillStyle='#f4f1e6';ctx.beginPath();ctx.arc(mx,my,17,0,7);ctx.fill();ctx.fillStyle='#d6d9e8';ctx.beginPath();ctx.arc(mx+5,my-3,5,0,7);ctx.arc(mx-6,my+6,3.5,0,7);ctx.fill();ctx.restore();};}

/* ----- portrait ----- */
const AW=PW_,AH_FAR=1000,AH_LYC=1900,AH_NEAR=1500;
let ATHP=null;
function buildAthensP(){const D=DISTRICTS[ATH],r=mul(2026),gd=(g,x,y,rad,col,a)=>{const q=g.createRadialGradient(x,y,0,x,y,rad);q.addColorStop(0,col+Math.round(a*255).toString(16).padStart(2,'0'));q.addColorStop(1,col+'00');g.fillStyle=q;g.fillRect(x-rad,y-rad,rad*2,rad*2);};
  const olive=(g,x,y,s)=>{g.fillStyle='#0a0710';g.fillRect(x-1.5*s,y-6*s,3*s,9*s);for(let k=0;k<4;k++){g.fillStyle=['#12201a','#1b2f26','#294036','#3b5a49'][k];g.beginPath();g.ellipse(x+(k-1.5)*4*s,y-12*s+k*1.5*s,13*s-k*2*s,9*s-k*s,0,0,7);g.fill();}
    g.fillStyle='#bcd9b4';g.globalAlpha=.3;g.beginPath();g.ellipse(x-4*s,y-17*s,7*s,2.6*s,0,0,7);g.fill();g.globalAlpha=1;};
  /* two far layers: Lycabettus and the sea (540 x 1900, slow) and the Acropolis (540 x 1000, so one is always on screen) */
  const[fc,fg]=mk(AW,AH_FAR),[lc,lg]=mk(AW,AH_LYC);
  // the sea along the left edge with moon glints
  {const sg=lg.createLinearGradient(0,0,150,0);sg.addColorStop(0,'#0b2e52');sg.addColorStop(.7,'#0a2a4acc');sg.addColorStop(1,'#0a2a4a00');lg.fillStyle=sg;lg.fillRect(0,0,150,AH_LYC);
    lg.globalCompositeOperation='lighter';lg.fillStyle='#cfe6ff';for(let i=0;i<70;i++){const y=r()*AH_LYC,x=10+r()*80,w=8+r()*26;lg.globalAlpha=.1+r()*.3;lg.fillRect(x,y,w,1.5);}
    lg.globalAlpha=1;lg.globalCompositeOperation='source-over';}
  // the Acropolis rock with the lit Parthenon (front view), floodlit
  {const cx=330,by=560;gd(fg,cx,by-170,230,D.a,.34);
    fg.fillStyle='#0b0816';fg.beginPath();fg.moveTo(80,by+60);fg.lineTo(120,by+10);fg.lineTo(170,by-70);fg.lineTo(205,by-96);fg.lineTo(460,by-96);fg.lineTo(500,by-60);fg.lineTo(540,by+20);fg.lineTo(540,by+60);fg.closePath();fg.fill();
    fg.strokeStyle=D.a;fg.globalAlpha=.55;fg.lineWidth=2;fg.beginPath();fg.moveTo(120,by+10);fg.lineTo(170,by-70);fg.lineTo(205,by-96);fg.lineTo(460,by-96);fg.lineTo(500,by-60);fg.lineTo(540,by+20);fg.stroke();fg.globalAlpha=1;
    // rock face lit from below
    for(let i=0;i<14;i++){const x=150+r()*340,y=by-90+r()*140;fg.fillStyle='#ffcf4a';fg.globalAlpha=.05+r()*.06;fg.fillRect(x,y,6+r()*30,2);}fg.globalAlpha=1;
    // fortress wall
    fg.fillStyle='#1a1424';fg.fillRect(205,by-112,255,16);fg.fillStyle='#e8d9a8';fg.globalAlpha=.5;fg.fillRect(205,by-112,255,2);fg.globalAlpha=1;
    // temple: floor, 8 columns, beam, pediment
    const tx=232,tw=200,ty=by-112;fg.fillStyle='#e8d9a8';fg.fillRect(tx-6,ty-6,tw+12,6);
    for(let i=0;i<8;i++){const x=tx+i*(tw-9)/7;fg.fillStyle='#f2e6bd';fg.fillRect(x,ty-78,9,72);fg.fillStyle='#ffffff';fg.globalAlpha=.25;fg.fillRect(x+1.5,ty-78,2,72);fg.globalAlpha=1;fg.fillStyle='#b8a672';fg.fillRect(x+7,ty-78,2,72);}
    fg.fillStyle='#e8d9a8';fg.fillRect(tx-6,ty-90,tw+12,12);
    fg.fillStyle='#f6ecc8';fg.beginPath();fg.moveTo(tx-12,ty-90);fg.lineTo(tx+tw/2,ty-124);fg.lineTo(tx+tw+12,ty-90);fg.closePath();fg.fill();
    fg.fillStyle='#0b0816';fg.beginPath();fg.moveTo(tx+8,ty-93);fg.lineTo(tx+tw/2,ty-117);fg.lineTo(tx+tw-8,ty-93);fg.closePath();fg.fill();
    fg.fillStyle='#ffe9a8';fg.globalAlpha=.4;for(let i=0;i<7;i++)fg.fillRect(tx+9+i*(tw-9)/7+2,ty-72,(tw-9)/7-6,62);fg.globalAlpha=1;
    gd(fg,cx-6,ty-40,150,'#fff0c0',.22);
    // floodlight beams up the hill
    fg.save();fg.globalCompositeOperation='lighter';for(const x of[190,330,470]){const q=fg.createLinearGradient(x,by+40,x,by-170);q.addColorStop(0,D.a+'30');q.addColorStop(1,D.a+'00');fg.fillStyle=q;fg.beginPath();fg.moveTo(x-8,by+40);fg.lineTo(x+8,by+40);fg.lineTo(x+46,by-170);fg.lineTo(x-46,by-170);fg.closePath();fg.fill();}fg.restore();
    // olive groves at the foot, a small Odeon arch and a few pines
    for(let i=0;i<9;i++)olive(fg,150+i*42+r()*12,by+58+r()*14,1+r()*.5);
    fg.fillStyle='#050309';for(const x of[168,498]){fg.beginPath();fg.ellipse(x,by-20,5,20,0,0,7);fg.fill();}}
  // Lycabettus with its white chapel on the far side of the layer
  {const cx=380,by=900;gd(lg,cx,by-120,150,'#bcd6ff',.14);lg.fillStyle='#0b0816';lg.beginPath();lg.moveTo(180,by+90);lg.quadraticCurveTo(300,by+40,340,by-60);lg.quadraticCurveTo(375,by-120,410,by-60);lg.quadraticCurveTo(450,by+40,540,by+90);lg.closePath();lg.fill();
    lg.strokeStyle=D.b;lg.globalAlpha=.4;lg.lineWidth=1.5;lg.beginPath();lg.moveTo(340,by-60);lg.quadraticCurveTo(375,by-120,410,by-60);lg.stroke();lg.globalAlpha=1;
    gd(lg,cx,by-132,38,'#ffffff',.4);lg.fillStyle='#f4f1e6';lg.fillRect(cx-11,by-136,22,16);lg.fillStyle='#0b0816';lg.fillRect(cx-3,by-130,6,10);lg.fillStyle='#f4f1e6';lg.fillRect(cx-1.5,by-152,3,16);lg.fillRect(cx-6,by-147,12,3);
    lg.fillStyle='#ffd27a';lg.globalAlpha=.7;for(let i=0;i<14;i++)lg.fillRect(cx-50+Math.sin(i*1.9)*44+i*6,by-30+i*7,2,2);lg.globalAlpha=1;
    for(let i=0;i<6;i++)olive(lg,230+i*50+r()*10,by+84+r()*6,.9+r()*.4);}
  /* near layer: whitewashed Plaka roofs along both edges (540 x 1500) */
  const[nc,ng]=mk(AW,AH_NEAR);
  {const roofs=(x0,x1)=>{let y=10;while(y<AH_NEAR-60){const rh=70+Math.floor(r()*70);let x=x0;while(x<x1-40){const bw=Math.min(x1-x,52+Math.floor(r()*56));
        if(r()<.88){const bx=x+5,by=y+5,w=bw-10,h=rh-10,terra=r()<.22;
          ng.fillStyle=terra?'#4a2a2c':'#2d3558';ng.fillRect(bx,by,w,h);ng.fillStyle=terra?'#6c3a34':'#3b4670';ng.fillRect(bx,by,w,h*.55);               // roof top and its shaded half
          ng.strokeStyle=terra?'#b8765e':'#cfd6f0';ng.globalAlpha=.55;ng.lineWidth=1.4;ng.strokeRect(bx+.5,by+.5,w-1,h-1);ng.globalAlpha=1;
          if(!terra&&r()<.5){ng.fillStyle='#8aa2e0';ng.globalAlpha=.5;ng.fillRect(bx+4,by+4,w-8,3);ng.globalAlpha=1;}
          for(let k=0,n=1+Math.floor(r()*3);k<n;k++){const px=bx+6+r()*Math.max(1,w-18),py=by+h*.62+r()*Math.max(1,h*.3-6);ng.fillStyle=['#2f4a36','#a85a3a','#caa05a'][Math.floor(r()*3)];ng.beginPath();ng.arc(px,py,3+r()*2,0,7);ng.fill();}   // pots and rooftop plants
          for(let yy=by+h*.62;yy<by+h-6;yy+=11)for(let xx=bx+7;xx<bx+w-9;xx+=12)if(r()<.4){ng.fillStyle='#ffe0a0';ng.globalAlpha=.35+r()*.5;ng.fillRect(xx,yy,5,6);}
          ng.globalAlpha=1;
          if(r()<.07){ng.fillStyle='#e8ecf8';ng.beginPath();ng.arc(bx+w/2,by+h*.4,Math.min(w,h)*.27,0,7);ng.fill();ng.fillStyle='#3a6ad8';ng.beginPath();ng.arc(bx+w/2,by+h*.4,Math.min(w,h)*.2,Math.PI,0);ng.fill();ng.fillStyle='#f4f1e6';ng.fillRect(bx+w/2-1,by+h*.4-Math.min(w,h)*.27-8,2,8);}     // a whitewashed church with its blue dome
        }
        x+=bw;}
      // string lights across the lane
      ng.strokeStyle='#ffd27a';ng.globalAlpha=.4;ng.lineWidth=1;ng.beginPath();ng.moveTo(x0,y+rh);ng.quadraticCurveTo((x0+x1)/2,y+rh+10,x1,y+rh);ng.stroke();ng.globalAlpha=.9;ng.fillStyle='#ffe0a0';for(let k=0;k<7;k++)ng.fillRect(x0+(x1-x0)*k/6-1,y+rh+(k%2?4:2),2,2);ng.globalAlpha=1;
      y+=rh;}};
    roofs(0,150);roofs(400,540);
    for(let i=0;i<22;i++)olive(ng,r()<.5?158+r()*18:376+r()*20,40+r()*(AH_NEAR-80),.8+r()*.4);}
  return{far:{c:fc,h:AH_FAR},lyc:{c:lc,h:AH_LYC},near:{c:nc,h:AH_NEAR}};}
const drawAthensP=(bg,t,dt,scroll)=>{const D=bg.D,L=ATHP||(ATHP=buildAthensP());
  const sk=ctx.createLinearGradient(0,0,0,PH_);sk.addColorStop(0,D.sky[2]);sk.addColorStop(.5,D.sky[1]);sk.addColorStop(1,D.sky[0]);ctx.fillStyle=sk;ctx.fillRect(0,0,PW_,PH_);
  ctx.globalCompositeOperation='lighter';G_(PW_*.72,PH_*.16,200,'#bcd6ff',.16);ctx.globalCompositeOperation='source-over';
  ctx.fillStyle='#f4f1e6';ctx.beginPath();ctx.arc(PW_*.74,PH_*.1,15,0,7);ctx.fill();ctx.fillStyle='#d6d9e8';ctx.beginPath();ctx.arc(PW_*.74+5,PH_*.1-3,4.5,0,7);ctx.fill();   // the moon
  {const o=(scroll*.12)%L.lyc.h;ctx.drawImage(L.lyc.c,0,o-L.lyc.h,PW_,L.lyc.h);ctx.drawImage(L.lyc.c,0,o,PW_,L.lyc.h);}
  {const o=(scroll*.2)%L.far.h;ctx.drawImage(L.far.c,0,o-L.far.h,PW_,L.far.h);ctx.drawImage(L.far.c,0,o,PW_,L.far.h);}
  {const o=(scroll*.5)%L.near.h;ctx.globalAlpha=.86;ctx.drawImage(L.near.c,0,o-L.near.h,PW_,L.near.h);ctx.drawImage(L.near.c,0,o,PW_,L.near.h);ctx.globalAlpha=1;}
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.fillStyle='#e8f2ff';for(let i=0;i<12;i++){const y=((i*83+scroll*.35)%PH_+PH_)%PH_,x=24+((i*47)%70);ctx.globalAlpha=.16+.1*Math.sin(t*2+i);ctx.fillRect(x,y,12+(i%4)*5,1.5);}ctx.restore();   // glints on the sea
  const hz=ctx.createLinearGradient(0,PH_-260,0,PH_);hz.addColorStop(0,D.a+'00');hz.addColorStop(1,D.a+'30');ctx.fillStyle=hz;ctx.fillRect(0,PH_-260,PW_,260);};
{const dbp=drawBGP;drawBGP=function(bg,t,dt,scroll){if(bg.D.name==='ATHINA')drawAthensP(bg,t,dt,scroll);else dbp(bg,t,dt,scroll);};}
setTimeout(()=>{if(!running&&!ATHP)ATHP=buildAthensP();},4300);                      // build the portrait Athens while the title is up (no hitch when the district starts)
// the colour theme switch clears the caches
{const pc=applyPal;applyPal=function(){const was=palOn;pc();if(palOn!==was)ATHP=null;};}
