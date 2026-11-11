// ---------- procedural art for the 3D bazaar: every texture is painted here with canvas 2D (no images) ----------
// Only called from init3D (real WebGL), never in jsdom.
const ART={};
function artRnd(s){s=(s|0)%2147483647;if(s<=0)s+=2147483646;return()=>{s=(s*16807)%2147483647;return(s-1)/2147483646}}
function mkCanvas(w,h){const c=document.createElement('canvas');c.width=w;c.height=h||w;return c}
function rr(x,X,Y,w,h,r){x.beginPath();x.moveTo(X+r,Y);x.arcTo(X+w,Y,X+w,Y+h,r);x.arcTo(X+w,Y+h,X,Y+h,r);x.arcTo(X,Y+h,X,Y,r);x.arcTo(X,Y,X+w,Y,r);x.closePath()}
// soft fractal noise: random low-res layers scaled up with smoothing
function noiseLayer(x,w,h,seed,alpha,octaves,dark,light){const R=artRnd(seed);for(let o=0;o<octaves;o++){const n=4<<o;const c=mkCanvas(n,n);const cx=c.getContext('2d');const id=cx.createImageData(n,n);
    for(let i=0;i<n*n;i++){const v=R();const col=v<.5?dark:light;id.data[i*4]=col[0];id.data[i*4+1]=col[1];id.data[i*4+2]=col[2];id.data[i*4+3]=Math.abs(v-.5)*2*255}
    cx.putImageData(id,0,0);x.save();x.globalAlpha=alpha/(o*.6+1);x.imageSmoothingEnabled=true;x.drawImage(c,0,0,w,h);x.restore()}}
function grain(x,w,h,seed,a){const R=artRnd(seed);const id=x.getImageData(0,0,w,h);const d=id.data;for(let i=0;i<d.length;i+=4){const v=(R()-.5)*a;d[i]+=v;d[i+1]+=v;d[i+2]+=v}x.putImageData(id,0,0)}
function hex(c){return '#'+c.toString(16).padStart(6,'0')}
function shade(h,f){const n=parseInt(h.slice(1),16);let r=n>>16,g=n>>8&255,b=n&255;if(f<0){r*=1+f;g*=1+f;b*=1+f}else{r+=(255-r)*f;g+=(255-g)*f;b+=(255-b)*f}return `rgb(${r|0},${g|0},${b|0})`}

// ---- wood ----
// long grain lines along x; used for the table, the tray and (pale) for painted pieces
function woodCanvas(w,h,base,dark,seed,opt){opt=opt||{};const c=mkCanvas(w,h),x=c.getContext('2d');const R=artRnd(seed);x.fillStyle=base;x.fillRect(0,0,w,h);
  noiseLayer(x,w,h,seed+3,.35,4,[0,0,0],[255,240,210]);
  const planks=opt.planks||0;const ph=planks?h/planks:h;
  for(let p=0;p<Math.max(1,planks);p++){const y0=p*ph;const off=R()*w;
    x.save();x.beginPath();x.rect(0,y0,w,ph);x.clip();x.fillStyle=`rgba(${R()<.5?'0,0,0':'255,230,190'},${.04+R()*.08})`;x.fillRect(0,y0,w,ph);
    const lines=opt.lines||60;for(let i=0;i<lines;i++){const y=y0+R()*ph;const amp=2+R()*6,fr=.004+R()*.01,ph2=R()*6;x.strokeStyle=dark;x.globalAlpha=.05+R()*.18;x.lineWidth=.6+R()*2.2;x.beginPath();
      for(let X=-10;X<=w+10;X+=8){const yy=y+Math.sin((X+off)*fr+ph2)*amp+Math.sin((X+off)*fr*3.1)*amp*.3;X<0?x.moveTo(X,yy):x.lineTo(X,yy)}x.stroke()}
    // knots
    for(let k=0;k<(opt.knots||0);k++){const kx=R()*w,ky=y0+R()*ph;for(let r=14;r>2;r-=3){x.globalAlpha=.12;x.strokeStyle=dark;x.lineWidth=1.5;x.beginPath();x.ellipse(kx,ky,r*2.4,r,0,0,7);x.stroke()}}
    x.restore();x.globalAlpha=1;if(planks&&p){x.fillStyle='rgba(0,0,0,.45)';x.fillRect(0,y0-1.5,w,3);x.fillStyle='rgba(255,230,200,.08)';x.fillRect(0,y0+1.5,w,1.5)}}
  grain(x,w,h,seed+9,10);return c}
// linen finish (for bump and roughness on printed board parts)
function linenCanvas(n){const c=mkCanvas(n),x=c.getContext('2d');x.fillStyle='#808080';x.fillRect(0,0,n,n);const R=artRnd(77);
  for(let i=0;i<n;i+=2){x.fillStyle=`rgba(255,255,255,${.05+R()*.12})`;x.fillRect(0,i,n,1);x.fillStyle=`rgba(0,0,0,${.05+R()*.12})`;x.fillRect(i,0,1,n)}grain(x,n,n,5,30);return c}
// height noise -> tangent-space normal map
function normalFromHeight(src,strength){const w=src.width,h=src.height;const sx=src.getContext('2d').getImageData(0,0,w,h).data;const c=mkCanvas(w,h),x=c.getContext('2d');const o=x.createImageData(w,h);
  const H=(i,j)=>sx[(((j+h)%h)*w+((i+w)%w))*4]/255;for(let j=0;j<h;j++)for(let i=0;i<w;i++){const dx=(H(i+1,j)-H(i-1,j))*strength,dy=(H(i,j+1)-H(i,j-1))*strength;const l=Math.hypot(dx,dy,1);const k=(j*w+i)*4;
    o.data[k]=(-dx/l*.5+.5)*255;o.data[k+1]=(dy/l*.5+.5)*255;o.data[k+2]=(1/l*.5+.5)*255;o.data[k+3]=255}x.putImageData(o,0,0);return c}
function waterHeight(n){const c=mkCanvas(n),x=c.getContext('2d');x.fillStyle='#808080';x.fillRect(0,0,n,n);const R=artRnd(31);
  for(let i=0;i<70;i++){const cx=R()*n,cy=R()*n,r=6+R()*26;const g=x.createRadialGradient(cx,cy,0,cx,cy,r);g.addColorStop(0,`rgba(255,255,255,${.25+R()*.3})`);g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;
    for(const ox of [-n,0,n])for(const oy of [-n,0,n]){x.save();x.translate(ox,oy);x.fillRect(cx-r,cy-r,r*2,r*2);x.restore()}}return c}
// soft radial sprite (dust, glow, blob shadow)
function radialCanvas(n,stops){const c=mkCanvas(n),x=c.getContext('2d');const g=x.createRadialGradient(n/2,n/2,0,n/2,n/2,n/2);for(const [o,col] of stops)g.addColorStop(o,col);x.fillStyle=g;x.fillRect(0,0,n,n);return c}
function sparkleCanvas(n){const c=mkCanvas(n),x=c.getContext('2d');const h=n/2;const g=x.createRadialGradient(h,h,0,h,h,h*.5);g.addColorStop(0,'rgba(255,250,220,1)');g.addColorStop(1,'rgba(255,200,90,0)');x.fillStyle=g;x.fillRect(0,0,n,n);
  x.fillStyle='rgba(255,246,210,.95)';for(const a of [0,Math.PI/2]){x.save();x.translate(h,h);x.rotate(a);x.beginPath();x.moveTo(-h,0);x.quadraticCurveTo(0,-h*.07,h,0);x.quadraticCurveTo(0,h*.07,-h,0);x.fill();x.restore()}return c}

// ---- rug (a kilim under the board) ----
function rugCanvas(w,h){const c=mkCanvas(w,h),x=c.getContext('2d');const R=artRnd(19);const red='#8f1f1c',red2='#a8302a',ind='#1f2c55',gold='#d9a441',cream='#efdcb4',teal='#23646b';
  x.fillStyle=red;x.fillRect(0,0,w,h);
  // border bands
  const band=(m,col)=>{x.fillStyle=col;x.fillRect(m,m,w-2*m,h-2*m)};band(0,ind);band(14,cream);band(20,ind);band(64,gold);band(70,red2);band(74,red);
  // running-dog border motif in the indigo band
  x.fillStyle=gold;const bw=w-40,bh=h-40;for(let s=0;s<2;s++){for(let X=40;X<w-40;X+=34){x.save();x.translate(X,s?h-42:42);x.beginPath();x.moveTo(-10,0);x.lineTo(0,-12);x.lineTo(10,0);x.lineTo(0,12);x.closePath();x.fill();x.fillStyle=red2;x.beginPath();x.arc(0,0,4,0,7);x.fill();x.fillStyle=gold;x.restore()}
    for(let Y=40;Y<h-40;Y+=34){x.save();x.translate(s?w-42:42,Y);x.beginPath();x.moveTo(-10,0);x.lineTo(0,-12);x.lineTo(10,0);x.lineTo(0,12);x.closePath();x.fill();x.fillStyle=red2;x.beginPath();x.arc(0,0,4,0,7);x.fill();x.fillStyle=gold;x.restore()}}
  // field: rows of stepped lozenges (gul)
  const cols=6,rows=Math.round(cols*h/w);for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){const cx=100+(i+.5)*(w-200)/cols,cy=100+(j+.5)*(h-200)/rows;const s=Math.min((w-200)/cols,(h-200)/rows)*.42;
    const col=[(i+j)%2?ind:teal,gold,cream][0];x.save();x.translate(cx,cy);
    for(const [k,cl] of [[1,col],[.72,gold],[.5,red2],[.3,cream],[.14,ind]]){x.fillStyle=cl;x.beginPath();const st=6;for(let a=0;a<4;a++){const ang=a*Math.PI/2;for(let q=0;q<st;q++){const t=q/st;const px=Math.cos(ang)*(1-t)+Math.cos(ang+Math.PI/2)*t,py=Math.sin(ang)*(1-t)+Math.sin(ang+Math.PI/2)*t;const sx=Math.round(px*st)/st,sy=Math.round(py*st)/st;x.lineTo(sx*s*k,sy*s*k)}}x.closePath();x.fill()}
    x.restore()}
  // large central medallion
  x.save();x.translate(w/2,h/2);for(const [r,cl] of [[.3,ind],[.26,gold],[.23,red2],[.17,cream],[.12,teal],[.06,gold]]){x.fillStyle=cl;x.beginPath();for(let a=0;a<16;a++){const rr_=(a%2?.82:1)*r*Math.min(w,h);x.lineTo(Math.cos(a*Math.PI/8)*rr_,Math.sin(a*Math.PI/8)*rr_)}x.closePath();x.fill()}x.restore();
  // wool texture: weft lines + wear
  for(let Y=0;Y<h;Y+=3){x.fillStyle=`rgba(0,0,0,${.05+R()*.07})`;x.fillRect(0,Y,w,1)}for(let X=0;X<w;X+=5){x.fillStyle=`rgba(255,240,220,${.02+R()*.03})`;x.fillRect(X,0,1,h)}
  noiseLayer(x,w,h,23,.28,4,[40,10,5],[255,220,180]);grain(x,w,h,3,14);return c}
function fringeCanvas(){const c=mkCanvas(256,64),x=c.getContext('2d');const R=artRnd(4);for(let i=0;i<64;i++){const X=i*4+2;x.strokeStyle=`rgb(${230+R()*20|0},${210+R()*20|0},${170+R()*20|0})`;x.lineWidth=2.4;x.beginPath();x.moveTo(X,0);x.quadraticCurveTo(X+(R()-.5)*6,32,X+(R()-.5)*8,50+R()*12);x.stroke()}return c}

// ---- printed board field inside the tray: indigo with a gold lattice ----
function fieldCanvas(w,h,W,H){const c=mkCanvas(w,h),x=c.getContext('2d');const g=x.createRadialGradient(w/2,h/2,0,w/2,h/2,w*.7);g.addColorStop(0,'#2a3a70');g.addColorStop(1,'#141c3c');x.fillStyle=g;x.fillRect(0,0,w,h);
  x.strokeStyle='rgba(224,170,70,.55)';x.lineWidth=2;const cw=w/W,ch=h/H;for(let i=0;i<=W;i++){x.beginPath();x.moveTo(i*cw,0);x.lineTo(i*cw,h);x.stroke()}for(let j=0;j<=H;j++){x.beginPath();x.moveTo(0,j*ch);x.lineTo(w,j*ch);x.stroke()}
  // 8-point stars at the grid crossings
  x.fillStyle='#d9a441';for(let i=0;i<=W;i++)for(let j=0;j<=H;j++){x.save();x.translate(i*cw,j*ch);for(const a of [0,Math.PI/4]){x.save();x.rotate(a);x.fillRect(-9,-9,18,18);x.restore()}x.fillStyle='#8f1f1c';x.beginPath();x.arc(0,0,4,0,7);x.fill();x.fillStyle='#d9a441';x.restore()}
  noiseLayer(x,w,h,8,.2,3,[0,0,0],[120,140,220]);return c}
// engraved title plaque for the front of the tray
function plaqueCanvas(){const c=mkCanvas(1024,128),x=c.getContext('2d');const g=x.createLinearGradient(0,0,0,128);g.addColorStop(0,'#f7d98a');g.addColorStop(.5,'#c98f2e');g.addColorStop(1,'#8a5a18');rr(x,4,8,1016,112,54);x.fillStyle=g;x.fill();
  rr(x,16,20,992,88,44);x.fillStyle='#2a160b';x.fill();x.strokeStyle='rgba(247,217,138,.7)';x.lineWidth=3;rr(x,24,28,976,72,36);x.stroke();
  x.font='700 58px "Reem Kufi",Georgia,serif';x.textAlign='center';x.textBaseline='middle';x.fillStyle='#f3cf7a';x.shadowColor='rgba(0,0,0,.6)';x.shadowBlur=4;x.fillText('SANDS  OF  QAMAR',512,68);
  x.shadowBlur=0;for(const s of [-1,1]){x.save();x.translate(512+s*400,64);x.rotate(Math.PI/4);x.fillStyle='#f3cf7a';x.fillRect(-10,-10,20,20);x.restore()}return c}

// ---- tile tops: printed, illustrated, a frame in the value colour and a name cartouche ----
const TART={oasis:{g:['#e2c47a','#c99f52']},village:{g:['#e6bd84','#c8955a']},sacred:{g:['#dcae8c','#b98262']},small:{g:['#eab468','#cc8f44']},large:{g:['#e6a656','#c47f36']},
  workshop:{g:['#d6ae96','#b48470']},exchange:{g:['#eab072','#c98544']},city:{g:['#efe4cc','#d8c8a8']},ravine:{g:['#9a7654','#6e4e33']},lake:{g:['#9fd0df','#5ea3c1']},default:{g:['#e7cc9c','#cfae7c']}};
function tileArt(t,i,coord,S){const c=mkCanvas(S),x=c.getContext('2d');const R=artRnd(i*977+13+(t.v||0)*7);const k=S/512;x.save();x.scale(k,k);
  const vcol=t.blue?'#2d5f9f':'#b34a2a',vdark=t.blue?'#1b3a66':'#7a2d17';
  // outer print border in the value colour, then a gold hairline
  x.fillStyle=vcol;x.fillRect(0,0,512,512);const bg=x.createLinearGradient(0,0,512,512);bg.addColorStop(0,'rgba(255,255,255,.18)');bg.addColorStop(1,'rgba(0,0,0,.18)');x.fillStyle=bg;x.fillRect(0,0,512,512);
  for(let a=0;a<48;a++){x.fillStyle='rgba(255,236,190,.14)';const p=a*512/48;x.beginPath();x.arc(p,9,3,0,7);x.arc(p,503,3,0,7);x.fill();x.beginPath();x.arc(9,p,3,0,7);x.arc(503,p,3,0,7);x.fill()}
  rr(x,20,20,472,472,26);x.fillStyle='#e7b14a';x.fill();rr(x,25,25,462,462,22);x.save();x.clip();
  const A=TART[t.k]||TART.default;const gg=x.createRadialGradient(220,200,20,256,256,380);gg.addColorStop(0,A.g[0]);gg.addColorStop(1,A.g[1]);x.fillStyle=gg;x.fillRect(0,0,512,512);
  noiseLayer(x,512,512,i*11+5,.22,4,[120,70,30],[255,245,220]);
  (TPAINT[t.k]||TPAINT.dunes)(x,R,t);
  // soft vignette inside the frame
  const vg=x.createRadialGradient(256,240,150,256,256,360);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(60,25,5,.35)');x.fillStyle=vg;x.fillRect(0,0,512,512);x.restore();
  // corner ornaments
  x.fillStyle='#e7b14a';for(const [cx,cy] of [[25,25],[487,25],[25,487],[487,487]]){x.save();x.translate(cx,cy);x.rotate(Math.PI/4);x.fillRect(-11,-11,22,22);x.fillStyle=vdark;x.fillRect(-5,-5,10,10);x.restore()}
  // name cartouche along the near edge (big enough to read from the table)
  const name=TILEDEF[t.k].n,y0=384;x.save();x.shadowColor='rgba(0,0,0,.4)';x.shadowBlur=10;x.shadowOffsetY=4;rr(x,34,y0,444,96,48);x.fillStyle='#f8ead0';x.fill();x.restore();
  rr(x,41,y0+7,430,82,41);x.strokeStyle=vcol;x.lineWidth=4;x.stroke();
  const tx=t.v?140:70,room=(t.v?470:470)-tx;x.textAlign='left';x.textBaseline='middle';const cf='800 40px "Alegreya Sans","Segoe UI",sans-serif';x.font=cf;const cw=x.measureText(coord).width+14;
  let fs=54;const nf=f=>`700 ${f}px "Reem Kufi","Trebuchet MS",sans-serif`;x.font=nf(fs);while(x.measureText(name).width>room-cw&&fs>30){fs-=2;x.font=nf(fs)}
  x.fillStyle='#2e1809';x.fillText(name,tx,y0+50);const nw=x.measureText(name).width;x.font=cf;x.fillStyle=vdark;x.fillText(coord,tx+nw+12,y0+51);
  if(t.v){x.save();x.shadowColor='rgba(0,0,0,.45)';x.shadowBlur=8;x.beginPath();x.arc(88,y0+48,58,0,7);x.fillStyle='#e7b14a';x.fill();x.restore();x.beginPath();x.arc(88,y0+48,51,0,7);const mg=x.createRadialGradient(74,y0+30,4,88,y0+48,51);mg.addColorStop(0,shade(vcol,.3));mg.addColorStop(1,vdark);x.fillStyle=mg;x.fill();
    x.font='800 60px Georgia,"Times New Roman",serif';x.textAlign='center';x.fillStyle='#fff6e0';x.fillText(String(t.v),88,y0+52)}
  x.restore();grain(x,S,S,i+2,9);return c}
// helpers for top-down illustration
function blob(x,cx,cy,rx,ry,col,R,j){x.fillStyle=col;x.beginPath();const n=14;for(let a=0;a<=n;a++){const ang=a/n*Math.PI*2;const f=1+(R()-.5)*(j||.18);x.lineTo(cx+Math.cos(ang)*rx*f,cy+Math.sin(ang)*ry*f)}x.closePath();x.fill()}
function palmTop(x,cx,cy,r,R){x.save();x.translate(cx,cy);x.fillStyle='rgba(60,35,10,.28)';x.beginPath();x.ellipse(r*.35,r*.35,r,r*.9,0,0,7);x.fill();
  for(let k=0;k<9;k++){const a=k/9*Math.PI*2+R();x.save();x.rotate(a);const g=x.createLinearGradient(0,0,r,0);g.addColorStop(0,'#2f6b2a');g.addColorStop(1,'#6fae45');x.fillStyle=g;x.beginPath();x.moveTo(0,0);x.quadraticCurveTo(r*.5,-r*.28,r,0);x.quadraticCurveTo(r*.5,r*.28,0,0);x.fill();
    x.strokeStyle='rgba(20,50,10,.5)';x.lineWidth=1;x.beginPath();x.moveTo(0,0);x.lineTo(r*.95,0);x.stroke();x.restore()}x.fillStyle='#6b4420';x.beginPath();x.arc(0,0,r*.12,0,7);x.fill();x.restore()}
function ripples(x,R,n,col){x.strokeStyle=col;for(let k=0;k<n;k++){const y=R()*512,a=6+R()*10;x.lineWidth=1.5+R()*2;x.globalAlpha=.25+R()*.25;x.beginPath();for(let X=-10;X<530;X+=16){const yy=y+Math.sin(X*.02+k)*a;X<0?x.moveTo(X,yy):x.lineTo(X,yy)}x.stroke()}x.globalAlpha=1}
function water(x,cx,cy,rx,ry,R){blob(x,cx+6,cy+8,rx*1.08,ry*1.1,'rgba(80,60,20,.25)',R,.12);blob(x,cx,cy,rx*1.06,ry*1.08,'#6f9a4a',R,.14);
  const g=x.createRadialGradient(cx-rx*.3,cy-ry*.3,4,cx,cy,Math.max(rx,ry));g.addColorStop(0,'#7fd3e4');g.addColorStop(.6,'#2f8fb4');g.addColorStop(1,'#1d5f86');blob(x,cx,cy,rx,ry,g,R,.1);
  x.strokeStyle='rgba(255,255,255,.35)';x.lineWidth=2;for(let k=0;k<4;k++){x.beginPath();x.ellipse(cx+(R()-.5)*rx*.6,cy+(R()-.5)*ry*.6,rx*.25,ry*.08,0,0,Math.PI);x.stroke()}}
function house(x,X,Y,w,h,col,R){x.fillStyle='rgba(60,30,10,.3)';x.fillRect(X+6,Y+6,w,h);x.fillStyle=col;x.fillRect(X,Y,w,h);x.fillStyle='rgba(255,255,255,.25)';x.fillRect(X,Y,w,4);x.fillRect(X,Y,4,h);x.fillStyle='rgba(0,0,0,.18)';x.fillRect(X+w-4,Y,4,h);x.fillRect(X,Y+h-4,w,4);
  if(R()<.6){x.fillStyle='rgba(70,40,20,.35)';x.fillRect(X+w*.3,Y+h*.3,w*.35,h*.35)}}
function dome(x,cx,cy,r,col,hi){x.fillStyle='rgba(60,30,10,.3)';x.beginPath();x.arc(cx+r*.3,cy+r*.3,r,0,7);x.fill();const g=x.createRadialGradient(cx-r*.35,cy-r*.35,r*.1,cx,cy,r);g.addColorStop(0,hi);g.addColorStop(1,col);x.fillStyle=g;x.beginPath();x.arc(cx,cy,r,0,7);x.fill();
  x.strokeStyle='rgba(255,255,255,.25)';x.lineWidth=1.5;for(let a=0;a<8;a++){x.beginPath();x.moveTo(cx,cy);x.lineTo(cx+Math.cos(a*Math.PI/4)*r,cy+Math.sin(a*Math.PI/4)*r);x.stroke()}x.fillStyle='#f3cf7a';x.beginPath();x.arc(cx,cy,r*.14,0,7);x.fill()}
function awning(x,X,Y,w,h,c1,c2,rot){x.save();x.translate(X+w/2,Y+h/2);x.rotate(rot||0);x.fillStyle='rgba(60,30,10,.3)';x.fillRect(-w/2+7,-h/2+7,w,h);const n=6;for(let k=0;k<n;k++){x.fillStyle=k%2?c1:c2;x.fillRect(-w/2+k*w/n,-h/2,w/n+.5,h)}
  const g=x.createLinearGradient(0,-h/2,0,h/2);g.addColorStop(0,'rgba(255,255,255,.22)');g.addColorStop(1,'rgba(0,0,0,.22)');x.fillStyle=g;x.fillRect(-w/2,-h/2,w,h);x.fillStyle='rgba(0,0,0,.25)';for(let k=0;k<n;k++){x.beginPath();x.arc(-w/2+(k+.5)*w/n,h/2,w/n/2,0,Math.PI);x.fill()}x.restore()}
function pots(x,cx,cy,R){for(let k=0;k<5;k++){const px=cx+(R()-.5)*60,py=cy+(R()-.5)*30;const r=7+R()*6;const col=['#b5562e','#d69a3a','#7a3b1c','#2f7fb8','#e0c070'][k];const g=x.createRadialGradient(px-r*.3,py-r*.3,1,px,py,r);g.addColorStop(0,shade(col,.4));g.addColorStop(1,col);x.fillStyle='rgba(50,25,5,.3)';x.beginPath();x.arc(px+3,py+3,r,0,7);x.fill();x.fillStyle=g;x.beginPath();x.arc(px,py,r,0,7);x.fill()}}
const TPAINT={
  dunes(x,R){ripples(x,R,14,'rgba(150,95,40,.6)')},
  oasis(x,R){ripples(x,R,8,'rgba(150,95,40,.5)');blob(x,250,210,170,130,'rgba(120,150,60,.35)',R,.25);water(x,190,215,105,78,R);for(let k=0;k<5;k++)palmTop(x,[330,370,300,110,80][k]+R()*10,[120,230,330,110,320][k]+R()*10,44+R()*14,R);
    for(let k=0;k<30;k++){x.fillStyle=`rgba(${60+R()*40|0},${110+R()*40|0},40,.7)`;x.beginPath();x.arc(80+R()*350,90+R()*280,2+R()*3,0,7);x.fill()}},
  village(x,R){ripples(x,R,6,'rgba(150,95,40,.4)');x.strokeStyle='rgba(160,110,60,.6)';x.lineWidth=18;x.beginPath();x.moveTo(40,300);x.quadraticCurveTo(250,230,480,320);x.stroke();
    const cols=['#e7c79a','#d9b07a','#efd6b0','#caa070'];for(let k=0;k<11;k++){const w=46+R()*38,h=40+R()*34;house(x,50+(k%4)*105+R()*20,50+Math.floor(k/4)*110+R()*25,w,h,cols[k%4],R)}palmTop(x,420,90,40,R);palmTop(x,80,360,34,R)},
  sacred(x,R){x.fillStyle='rgba(120,70,40,.25)';rr(x,70,55,372,330,20);x.fill();x.fillStyle='#e8d2b4';rr(x,80,65,352,310,16);x.fill();
    for(let i=0;i<8;i++)for(let j=0;j<7;j++){if((i+j)%2)continue;x.fillStyle=(i*j)%3?'rgba(47,111,160,.35)':'rgba(111,59,178,.3)';x.fillRect(90+i*42,75+j*42,42,42)}
    const g=x.createRadialGradient(256,215,10,256,215,150);g.addColorStop(0,'rgba(255,240,180,.8)');g.addColorStop(1,'rgba(255,240,180,0)');x.fillStyle=g;x.fillRect(0,0,512,512);dome(x,256,215,92,'#2f7f94','#9fe0e8');
    for(const [px,py] of [[110,95],[402,95],[110,340],[402,340]])dome(x,px,py,24,'#c9a060','#f3dcb0')},
  small(x,R){ripples(x,R,5,'rgba(150,95,40,.4)');awning(x,80,70,170,110,'#c7462f','#f2e2c0',-.05);awning(x,280,90,150,100,'#2f7fb8','#f2e2c0',.06);pots(x,170,250,R);pots(x,350,260,R);
    x.fillStyle='rgba(120,70,30,.5)';x.fillRect(60,320,390,10)},
  large(x,R){ripples(x,R,4,'rgba(150,95,40,.4)');awning(x,50,50,190,110,'#c7462f','#f2e2c0',-.04);awning(x,270,55,190,110,'#2d63c8','#f7e7c8',.04);awning(x,60,190,160,100,'#3b9a4a','#f2e2c0',.05);awning(x,290,200,160,100,'#e0a53a','#7a3b1c',-.05);
    x.save();x.translate(256,340);x.fillStyle='#8f1f1c';x.fillRect(-90,-30,180,56);x.strokeStyle='#e0a53a';x.lineWidth=4;x.strokeRect(-82,-22,164,40);x.restore();pots(x,110,330,R);pots(x,410,330,R)},
  workshop(x,R){for(let i=0;i<8;i++)for(let j=0;j<7;j++){x.fillStyle=(i+j)%2?'rgba(120,80,60,.18)':'rgba(255,255,255,.08)';x.fillRect(30+i*56,30+j*56,56,56)}
    const g=x.createRadialGradient(160,170,8,160,170,80);g.addColorStop(0,'#ffd27a');g.addColorStop(.35,'#e0641f');g.addColorStop(.7,'#6a3a2a');g.addColorStop(1,'#4a2a20');x.fillStyle=g;x.beginPath();x.arc(160,170,80,0,7);x.fill();
    x.fillStyle='#5a5a62';x.beginPath();x.moveTo(300,150);x.lineTo(420,150);x.lineTo(400,190);x.lineTo(330,190);x.closePath();x.fill();x.fillStyle='#7c7c86';x.fillRect(340,190,40,50);x.fillStyle='rgba(255,255,255,.3)';x.fillRect(300,150,120,6);
    x.strokeStyle='#6b4420';x.lineWidth=10;x.beginPath();x.moveTo(300,290);x.lineTo(410,330);x.stroke();x.fillStyle='#5a5a62';x.fillRect(395,310,34,30)},
  exchange(x,R){ripples(x,R,4,'rgba(150,95,40,.4)');const cols=['#c7362a','#e08a2a','#f2c230','#7a3b1c','#3b7a3a','#b5562e'];for(let k=0;k<6;k++){const cx=110+(k%3)*145,cy=130+Math.floor(k/3)*150;
      blob(x,cx+5,cy+6,62,52,'rgba(60,30,10,.3)',R,.1);blob(x,cx,cy,62,52,'#d9c08a',R,.12);const g=x.createRadialGradient(cx-12,cy-14,4,cx,cy,46);g.addColorStop(0,shade(cols[k],.45));g.addColorStop(1,cols[k]);x.fillStyle=g;x.beginPath();x.arc(cx,cy,44,0,7);x.fill()}},
  city(x,R){x.fillStyle='rgba(140,110,70,.25)';for(let k=0;k<6;k++)x.fillRect(30,40+k*62,452,6);for(let k=0;k<9;k++){house(x,40+(k%3)*150+R()*20,40+Math.floor(k/3)*112+R()*14,96,78,'#f4ecdc',R)}
    for(let k=0;k<5;k++)dome(x,90+k*85+R()*12,90+(k%2)*170+R()*20,28+R()*10,'#1f8b9a','#9fe8ee')},
  ravine(x,R){x.fillStyle='#5a3c26';x.beginPath();x.moveTo(0,160);for(let X=0;X<=512;X+=32)x.lineTo(X,170+Math.sin(X*.03)*40+(R()-.5)*30);for(let X=512;X>=0;X-=32)x.lineTo(X,300+Math.sin(X*.025)*40+(R()-.5)*30);x.closePath();x.fill();
    const g=x.createLinearGradient(0,170,0,300);g.addColorStop(0,'rgba(0,0,0,.2)');g.addColorStop(.5,'rgba(0,0,0,.7)');g.addColorStop(1,'rgba(0,0,0,.2)');x.fillStyle=g;x.fillRect(0,150,512,180);
    for(let k=0;k<14;k++)blob(x,R()*512,R()<.5?120+R()*40:330+R()*40,14+R()*18,10+R()*12,'#8a6a4a',R,.4)},
  lake(x,R){x.fillStyle='#d9c08a';x.fillRect(0,0,512,512);water(x,256,220,230,190,R);x.strokeStyle='rgba(255,255,255,.25)';for(let k=0;k<10;k++){x.lineWidth=2;x.beginPath();x.ellipse(256+(R()-.5)*260,220+(R()-.5)*220,40+R()*50,8,0,0,Math.PI);x.stroke()}}};

// ---- pieces ----
function paleGrain(seed){return woodCanvas(256,256,'#eee6da','#b39c80',seed,{lines:40})}
function barkCanvas(){const c=mkCanvas(64,256),x=c.getContext('2d');x.fillStyle='#8a6a42';x.fillRect(0,0,64,256);for(let y=0;y<256;y+=14){x.fillStyle='#5a4128';x.fillRect(0,y,64,5);x.fillStyle='#a4845a';x.fillRect(0,y+5,64,2)}grain(x,64,256,3,20);return c}
function leafCanvas(){const c=mkCanvas(256,64),x=c.getContext('2d');x.clearRect(0,0,256,64);
  for(let k=0;k<30;k++){const X=8+k*8;const L=24*(1-k/34);const g=x.createLinearGradient(X,32,X+10,32-L);g.addColorStop(0,'#1f5020');g.addColorStop(1,'#5f9e3a');x.strokeStyle=g;x.lineWidth=7;x.lineCap='round';
    x.beginPath();x.moveTo(X,32);x.quadraticCurveTo(X+6,32-L*.6,X+12,32-L);x.stroke();x.beginPath();x.moveTo(X,32);x.quadraticCurveTo(X+6,32+L*.6,X+12,32+L);x.stroke()}
  x.strokeStyle='#5a4a20';x.lineWidth=3;x.beginPath();x.moveTo(0,32);x.lineTo(250,32);x.stroke();return c}
function archCanvas(){const c=mkCanvas(256,256),x=c.getContext('2d');const g=x.createLinearGradient(0,0,0,256);g.addColorStop(0,'#fbf4e6');g.addColorStop(1,'#e8d8bc');x.fillStyle=g;x.fillRect(0,0,256,256);
  x.fillStyle='#d9a441';x.fillRect(0,0,256,16);x.fillRect(0,240,256,16);x.fillStyle='#2f7f94';for(let k=0;k<16;k++){x.fillRect(k*16+4,4,8,8)}
  for(const cx of [64,192]){x.fillStyle='#3a2a20';x.beginPath();x.moveTo(cx-30,240);x.lineTo(cx-30,120);x.quadraticCurveTo(cx-30,70,cx,52);x.quadraticCurveTo(cx+30,70,cx+30,120);x.lineTo(cx+30,240);x.closePath();x.fill();
    x.strokeStyle='#d9a441';x.lineWidth=5;x.stroke()}noiseLayer(x,256,256,6,.12,3,[80,50,20],[255,255,255]);return c}
function stripeCanvas(col){const c=mkCanvas(128,128),x=c.getContext('2d');for(let k=0;k<8;k++){x.fillStyle=k%2?col:'#f1e3c4';x.fillRect(k*16,0,16,128)}x.fillStyle='#d9a441';x.fillRect(0,110,128,10);grain(x,128,128,2,16);return c}
function cardBackCanvas(){const c=mkCanvas(256,360),x=c.getContext('2d');x.fillStyle='#f3e4c2';rr(x,0,0,256,360,22);x.fill();x.fillStyle='#6b1f1c';rr(x,12,12,232,336,14);x.fill();x.strokeStyle='#d9a441';x.lineWidth=4;rr(x,22,22,212,316,10);x.stroke();
  x.save();x.translate(128,180);for(let k=0;k<8;k++){x.rotate(Math.PI/4);x.fillStyle=k%2?'#d9a441':'#efd28a';x.fillRect(-4,20,8,60)}x.beginPath();x.arc(0,0,26,0,7);x.fillStyle='#d9a441';x.fill();x.restore();return c}
// badge sprites: a brass-rimmed enamel pill with text and tiny drawn icons
function badgeCanvas(parts,opt){opt=opt||{};const c=mkCanvas(256,96),x=c.getContext('2d');const g=x.createLinearGradient(0,6,0,90);g.addColorStop(0,'#fbe3a0');g.addColorStop(.5,'#d9a441');g.addColorStop(1,'#8a5a18');
  x.shadowColor='rgba(0,0,0,.45)';x.shadowBlur=8;x.shadowOffsetY=3;rr(x,6,8,244,78,39);x.fillStyle=g;x.fill();x.shadowColor='transparent';rr(x,12,14,232,66,33);const f=x.createLinearGradient(0,14,0,80);f.addColorStop(0,opt.fill||'#5a2414');f.addColorStop(1,opt.fill2||'#2b1208');x.fillStyle=f;x.fill();
  x.fillStyle='rgba(255,255,255,.14)';rr(x,18,16,220,24,12);x.fill();
  x.font='800 46px "Alegreya Sans","Segoe UI",sans-serif';x.textBaseline='middle';x.textAlign='left';let w=0;for(const p of parts)w+=p.icon?40:x.measureText(p.t).width+4;let X=128-w/2;
  for(const p of parts){if(p.icon){drawIcon(x,p.icon,X+18,48);X+=40}else{x.fillStyle=opt.ink||'#fff1cf';x.fillText(p.t,X,50);X+=x.measureText(p.t).width+4}}return c}
function drawIcon(x,k,cx,cy){x.save();x.translate(cx,cy);if(k==='palm'){x.strokeStyle='#b58a4a';x.lineWidth=4;x.beginPath();x.moveTo(0,18);x.quadraticCurveTo(3,4,0,-6);x.stroke();x.fillStyle='#7cc04e';for(let a=0;a<6;a++){x.save();x.translate(0,-6);x.rotate(a*Math.PI/3-.3);x.beginPath();x.ellipse(9,0,10,3.5,0,0,7);x.fill();x.restore()}}
  if(k==='palace'){x.fillStyle='#fbf4e6';x.fillRect(-12,0,24,16);x.fillStyle='#e0a53a';x.beginPath();x.moveTo(-10,1);x.quadraticCurveTo(-11,-12,0,-18);x.quadraticCurveTo(11,-12,10,1);x.fill();x.fillStyle='#3a2a20';x.fillRect(-4,6,8,10)}x.restore()}
