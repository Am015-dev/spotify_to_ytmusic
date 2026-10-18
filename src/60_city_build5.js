function lzTractor(L,x,z,h){const y0=lzY0(x,z,4,6),sx=Math.sin(h),sz=Math.cos(h),rx=Math.cos(h),rz=-Math.sin(h);if(!lzBox(L,x,z,3,5,2,'#3a9a3a',{ry:h,y0:y0+.8}))return;lzBox(L,x-sx*1,z-sz*1,2.4,2.2,2.2,'#2f7a2f',{ry:h,force:1,nc:1,y0:y0+2.8});
  for(const sd of[-1,1]){lzBox(L,x+rx*sd*1.9-sx*1.2,z+rz*sd*1.9-sz*1.2,.8,2.8,2.8,'#222428',{ry:h,force:1,nc:1,y0});lzBox(L,x+rx*sd*1.7+sx*1.8,z+rz*sd*1.7+sz*1.8,.6,1.5,1.5,'#222428',{ry:h,force:1,nc:1,y0})}}
function lzTurbine(L,x,z,ph){if(!lzCyl(L,x,z,1.4,2.4,80,'#f2f4f6',{seg:10}))return;const y0=lzY0(x,z,5,5),hy=y0+82;lzBox(L,x,z+2,4,9,4,'#e8ecf0',{force:1,nc:1,y0:hy-2});for(let k=0;k<3;k++){const a=ph+k*Math.PI*2/3;L.parts.push({k:'e',w:1.4,h:34,d:.5,x:x+Math.sin(a)*17,y:hy+Math.cos(a)*17,z:z+6.6,rz:-a,col:'#ffffff'})}}
function lzFarm(L,x,z,rnd){const h=Math.floor(rnd()*4)*Math.PI/2+.15;if(!lzBox(L,x,z,30,14,10,'#a8402a',{ry:h}))return;lzGab(L,x,lzY0(x,z,30,14)+10,z,14,30,6,'#5a3020',h+Math.PI/2);const sx=Math.sin(h),sz=Math.cos(h),rx=Math.cos(h),rz=-Math.sin(h);
  const hx=x+rx*26,hz=z+rz*26;if(lzBox(L,hx,hz,12,10,8,'#f2ece0',{ry:h}))lzGab(L,hx,lzY0(hx,hz,12,10)+8,hz,10,12,5,'#b8402a',h+Math.PI/2);lzCyl(L,x-rx*22,z-rz*22,4,4,18,'#c8ccd0');lzSph(L,x-rx*22,lzY0(x-rx*22,z-rz*22,8,8)+18,z-rz*22,4,'#c8ccd0');
  lzTractor(L,x+sx*22,z+sz*22,h+.6);for(let k=0;k<6;k++){const bx=x-sx*30+rx*(k*4-10),bz=z-sz*30+rz*(k*4-10);L.parts.push({k:'c',r1:1.6,r2:1.6,h:1.8,x:bx,y:lzY0(bx,bz,3,3)+1.2,z:bz,col:'#e0c060',seg:10})}
  {const fx=x-sx*110,fz=z-sz*110,FCOL=['#d8c060','#9ab850','#c8a848','#7aa040'];if(lzFreeBox(fx,fz,160,120,h))for(let k=0;k<6;k++){const o=(k-2.5)*20;lzBox(L,fx+rx*o,fz+rz*o,18,120,.1,FCOL[(k+Math.abs(Math.floor(x)))%4],{ry:h,force:1,nc:1,y0:-.2,m:'flat'})}}
  for(let k=0;k<4;k++)L.props.push([rnd()<.5?'crate':'bricks',x+sx*(36+rnd()*10)+rx*(rnd()-.5)*30,z+sz*(36+rnd()*10)+rz*(rnd()-.5)*30])}
const lzStudLine=(L,x0,z0,x1,z1,step,big)=>{const d=Math.hypot(x1-x0,z1-z0),n=Math.floor(d/step);for(let i=0;i<=n;i++){const t=i/Math.max(1,n);L.studs.push([x0+(x1-x0)*t,z0+(z1-z0)*t,big&&i%big===big-1?100:10])}};
// --- Fraport: three parallel runways at the real 07/25 heading (~20 degrees off east-west), Startbahn West north-south
lzReg('fraport','Fraport',[4250,6100,-5170,-3330],{tile:1e9,plan(L){const dx=-.938,dz=.346,nx=.346,nz=.938,RC=[4990,-3955],ry=Math.atan2(-dz,dx),ry2=Math.atan2(-nz,nx),at=(a,o)=>[RC[0]+dx*a+nx*o,RC[1]+dz*a+nz*o],F={force:1,nc:1};
  const strip=(x,z,len,w,r,top,col)=>lzBox(L,x,z,len,w,top+.2,col,{...F,ry:r,y0:-.2,m:'flat'});
  // apron, taxiways, runways (layered tops so nothing z-fights), markings
  {const[x,z]=at(420,265);strip(x,z,460,140,ry,.02,'#8a8d92')}
  for(const a of[-300,300,520]){const[x,z]=at(a,40);strip(x,z,440,23,ry2,.035,'#6a6e76')}
  for(const o of[150,0,-180]){const[x,z]=at(0,o);strip(x,z,1400,45,ry,.05,'#5c6068');lzMapLine([at(-700,o),at(700,o)],45,'Runway');for(let a=-630;a<=630;a+=60){const[x2,z2]=at(a,o);strip(x2,z2,30,1.2,ry,.07,'#f4f4f0')}
    for(const e of[-1,1])for(let k=-3;k<=3;k++){const[x2,z2]=at(e*680,o+k*5.5);strip(x2,z2,26,2.4,ry,.07,'#f4f4f0')}for(const a of[-560,-500,500,560])for(const sd of[-1,1]){const[x2,z2]=at(a,o+sd*10);strip(x2,z2,40,4,ry,.07,'#f4f4f0')}
    if(o===0)lzStudLine(L,...at(-600,-8),...at(600,-8),11,8)}
  strip(5835,-4310,45,1540,0,.05,'#5c6068');lzMapLine([[5835,-3540],[5835,-5080]],45,'Startbahn West');for(let z=-3600;z>=-5020;z-=60)strip(5835,z,1.2,30,0,.07,'#f4f4f0');for(const z of[-3555,-5065])for(let k=-3;k<=3;k++)strip(5835+k*5.5,z,2.4,26,0,.07,'#f4f4f0');
  {const[x,z]=at(-760,-90);strip(x,z,300,23,ry,.035,'#6a6e76')}
  // Terminal 1 (glass), three piers with parked jets, the tower and Hangar 7
  const T1=[4697,-3457],a1=(T1[0]-RC[0])*dx+(T1[1]-RC[1])*dz;lzBox(L,T1[0],T1[1],300,40,22,'#9fc4e0',{ry,m:'glass',force:1});lzBox(L,T1[0],T1[1],306,46,1.4,'#d8dde4',{ry,force:1,nc:1,y0:21.6});
  {const[x,z]=at(a1,366+34);lzBox(L,x,z,240,10,1,'#c8ccd2',{ry,force:1,nc:1,y0:7});for(let k=-5;k<=5;k++){const[x2,z2]=at(a1+k*22,366+38);lzBox(L,x2,z2,1,1,7,'#9aa2ac',{ry,force:1})}}
  const TC=['#ffcc00','#1f4fa8','#e8302a','#2c8a5a','#8a3aa0','#ff7a1c'];let ji=0;
  for(const da of[-100,0,100]){const[x,z]=at(a1+da,366-20-55);lzBox(L,x,z,110,14,10,'#c0c8d0',{ry:ry2,m:'glass',force:1});for(const sd of[-1,1]){const[jx,jz]=at(a1+da+sd*34,262);lzJet(L,jx,jz,Math.atan2(nx,nz),TC[ji++%TC.length])}}
  {const[x,z]=at(620,420);if(lzCyl(L,x,z,4.5,6,58,'#d8dde4',{force:1})){lzCyl(L,x,z,10,9,8,'#7fb0d8',{force:1,nc:1,y0:58});lzCyl(L,x,z,11,11,1.2,'#3a3f48',{force:1,nc:1,y0:66});lzCyl(L,x,z,.4,.4,10,'#e8302a',{force:1,nc:1,y0:67})}}
  {const[x,z]=at(760,330);if(lzBox(L,x,z,90,60,22,'#c8ccd4',{ry})){lzGab(L,x,lzY0(x,z,90,60)+22,z,60,90,8,'#8a9098',ry+Math.PI/2);const[dx2,dz2]=at(760,298);lzBox(L,dx2,dz2,70,1,16,'#2f3640',{ry,force:1,nc:1,y0:.2});const[sx2,sz2]=at(760,297);lzBox(L,sx2,sz2,40,.6,5,'#ffcc00',{ry,force:1,nc:1,y0:17})}}
  lzRoad(L,[[4140,-3600],[4350,-3580],[4560,-3545],[4640,-3520]],16,'Flughafenstraße');
  // things to drive through and smash: cargo containers, vans, cones at the runway ends
  for(let i=0;i<5;i++)for(let j=0;j<3;j++){const[x,z]=at(230+i*14,215+j*16);L.props.push(['container',x,z,ry])}for(let i=0;i<8;i++){const[x,z]=at(300+i*40,225);L.props.push(['car4',x,z,ry2])}
  // runway kickers (towards the real west, take-off direction 25) and the Sky Leap at the north end of the Startbahn West
  const hT=Math.atan2(-dx,-dz);{const[x,z]=at(150,0);L.ramps.push([x,z,hT,26,7,18,0xffb020])}
  L.spots.lj2=[5835,-3610,Math.PI];lzStudLine(L,5835,-3720,5835,-4400,13,8)}});
// --- Bad Homburg: Kurhaus, Kurpark, Russian chapel, Thai sala, Schloss with the Weisser Turm, Louisenstrasse
lzReg('homburg','Bad Homburg',[2600,4250,5450,6950],{tile:1e9,plan(L){const rnd=mul(6181);
  const land=lzRoad(L,[[2750,4790],[2900,5150],[3150,5550],[3330,5800],[3330,5990]],18,'Homburger Landstraße'),lou=lzRoad(L,[[2700,6000],[3000,5995],[3330,5990],[3700,5990],[4100,5995]],18,'Louisenstraße');
  const prom=lzRoad(L,[[3100,6130],[3548,6128],[3950,6150]],14,'Kaiser-Friedrich-Promenade');lzRoad(L,[[4100,5995],[4350,5700],[4550,5420],[4700,5250]],16,'Taunusstraße');lzRoad(L,[[3450,6140],[3500,6300],[3550,6420],[3650,6700]],10,'Kurpark-Weg');
  // Kurpark lawn and the Kurhaus with its portico
  lzBox(L,3550,6515,800,560,.08,'#6cb04a',{force:1,nc:1,y0:-.21,m:'flat'});ZONES.push({t:'grass',x0:3150,x1:3950,z0:6235,z1:6795,name:'Kurpark'});
  lzBox(L,3548,6186,130,30,16,'#efe4c8',{m:'brick',force:1});lzBox(L,3548,6186,134,34,1.2,'#b8a888',{force:1,nc:1,y0:15.8});lzGab(L,3548,17,6170,8,40,5,'#b8a888',Math.PI/2);for(let k=-4;k<=4;k++)lzCyl(L,3548+k*5,6166,1,1,13,'#f8f4ea',{force:1,seg:10});
  // Russian chapel with golden onion domes
  {const x=3330,z=6430;if(lzBox(L,x,z,16,16,14,'#f4efe4')){lzCyl(L,x,z,3.2,3.2,6,'#f4efe4',{force:1,nc:1,y0:14});lzSph(L,x,22.5,z,4.2,'#e8b828',1,1.35,1);lzCone(L,x,26.6,z,1,4,'#e8b828');for(const[a,b]of[[-6,-6],[6,-6],[-6,6],[6,6]]){lzCyl(L,x+a,z+b,1.6,1.6,3,'#f4efe4',{force:1,nc:1,y0:14});lzSph(L,x+a,18.8,z+b,2.2,'#e8b828',1,1.35,1)}}}
  // Thai sala (gold roof on red columns)
  {const x=3720,z=6620;if(lzFree(x,z,10)){for(const[a,b]of[[-5,-4],[5,-4],[-5,4],[5,4]])lzCyl(L,x+a,z+b,.5,.5,5,'#c0302a',{force:1});lzGab(L,x,5,z,12,14,4.5,'#e8b828',0);lzBox(L,x,z,12,10,.6,'#c0302a',{force:1,nc:1,y0:4.6})}}
  // Schloss (three wings round the courtyard) and the Weisser Turm
  lzBox(L,2950,6292,90,14,14,'#f2ead8',{force:1});lzBox(L,2950,6208,90,14,14,'#f2ead8',{force:1});lzBox(L,2996,6250,14,70,14,'#f2ead8',{force:1});for(const z of[6292,6208])lzGab(L,2950,14,z,14,90,5,'#8a4a3a',Math.PI/2);lzGab(L,2996,14,6250,14,70,5,'#8a4a3a',0);
  lzCyl(L,2932,6250,6.5,7,42,'#fbfbf8',{force:1,seg:16});lzCone(L,2932,42,6250,8,9,'#4a5560',16);for(let k=0;k<12;k++){const a=k/12*Math.PI*2;L.studs.push([2932+Math.cos(a)*16,6250+Math.sin(a)*16,k===11?100:10])}
  // the town: houses and shops along the streets
  lzFront(L,lou,[...LZH,...LZC.slice(0,4)],20,rnd);lzFront(L,land,LZH,19,rnd,.8);
  for(let i=0;i<170;i++){const x=3160+rnd()*780,z=6245+rnd()*540;if(Math.hypot(x-3800,z-6290)<70||Math.hypot(x-3550,z-6450)<40)continue;L.props.push([rnd()<.4?'tree2':rnd()<.6?'tree':rnd()<.7?'bush':'bench',x,z])}
  for(let i=0;i<14;i++)L.props.push(['bricks',3200+rnd()*700,6260+rnd()*500]);
  L.ramps.push([3800,6290,0,24,6,16,0xffb020]);lzStudLine(L,2760,6000,4080,6000,14,8);L.spots.cl2=[3550,6420,Math.PI]}});
// --- Bad Vilbel: the Wasserburg in its moat, the old town
lzReg('vilbel','Bad Vilbel',[-5200,-1800,3550,5600],{plan(L){const rnd=mul(7307);
  const fs=lzRoad(L,[[-2650,3300],[-3000,3800],[-3395,4300],[-3600,4700],[-3700,5300]],18,'Frankfurter Straße'),fb=lzRoad(L,[[-2900,4420],[-3400,4430],[-3800,4440],[-4300,4460]],16,'Friedberger Straße');
  {const x=-3640,z=4560;lzBox(L,x,z,96,96,.06,'#3a6fa0',{force:1,nc:1,y0:-.18,m:'flat'});lzBox(L,x,z,66,66,.1,'#6cb04a',{force:1,nc:1,y0:-.16,m:'flat'});
   for(const[a,b,w,d]of[[0,-26,52,4],[0,26,52,4],[-26,0,4,52],[26,0,4,52]])lzBox(L,x+a,z+b,w,d,9,'#b8ac94',{force:1});for(const[a,b]of[[-26,-26],[26,-26],[-26,26],[26,26]]){lzCyl(L,x+a,z+b,4.5,5,13,'#a89c84',{force:1});lzCone(L,x+a,13,z+b,5.5,6,'#7a4a3a')}
   lzBox(L,x+8,z+8,14,14,24,'#b8ac94',{force:1});lzCone(L,x+8,24,z+8,10,8,'#7a4a3a',4)}
  lzFront(L,fs,[...LZH,...LZC.slice(0,3)],19,rnd,.85);lzFront(L,fb,LZH,18,rnd,.85);
  for(let i=0;i<10;i++)L.props.push(['bricks',-3300-rnd()*500,4480+rnd()*300]);L.ramps.push([-3900,4445,-Math.PI/2,22,6,14,0xffb020]);lzStudLine(L,-2900,4420,-4250,4455,14,6)}});
// --- Wetterau: farms, tractors, hay, wind turbines and the long straight Feldweg
lzReg('wetterau','Wetterau',[-8000,2600,5000,7000],{plan(L){const rnd=mul(8111);lzRoad(L,[[-7600,5600],[-4000,5600],[600,5600]],14,'Feldweg');lzRoad(L,[[-5000,4700],[-5000,6000],[-5000,6900]],12,'Feldweg Nord');
  for(const[x,z]of[[-7000,5820],[-6050,6250],[-4620,5850],[-3300,6380],[-2000,5850],[-800,6350],[-6800,6620],[-2600,6650],[-5600,5300],[-7400,5250],[-4100,6250],[-1200,5300],[200,6200],[-3700,5300]])lzFarm(L,x,z,rnd);
  [[-7400,6760],[-6600,6820],[-5800,6720],[-1500,6790],[-700,6730],[100,6810],[-3900,6850]].forEach(([x,z],i)=>lzTurbine(L,x,z,i*.7));
  L.spots.sp2=[-6400,5600,Math.PI/2];lzStudLine(L,-7400,5600,-6500,5600,12,8);lzStudLine(L,-5500,5600,-3000,5600,15,10);L.ramps.push([-4300,5600,Math.PI/2,24,6,14,0xffb020]);L.ramps.push([-1200,5600,-Math.PI/2,24,6,14,0xffb020])}});
// --- Offenbach: Kaiserlei towers, Rathaus, Isenburger Schloss, the harbour with gantry cranes and containers
lzReg('offenbach','Offenbach',[-5300,-3440,-1950,250],{plan(L){const rnd=mul(9203);
  const be=lzRoad(L,[[-3480,-1050],[-4200,-1050],[-5200,-1060]],22,'Berliner Straße'),fr=lzRoad(L,[[-3520,-1450],[-4400,-1450],[-5200,-1440]],20,'Frankfurter Straße'),ka=lzRoad(L,[[-4000,-1900],[-4000,-1300],[-4000,-850]],18,'Kaiserstraße'),wa=lzRoad(L,[[-4600,-1900],[-4600,-1200],[-4600,-600]],18,'Waldstraße');
  lzRoad(L,[[-3480,-930],[-3530,-860],[-3600,-800],[-3700,-790],[-3800,-790]],14,'Hafenallee');
  for(const[x,z,w,d,h,col,m]of[[-3560,-700,26,26,92,'#7fa8c8','glass'],[-3650,-790,24,30,112,'#9ab4cc','office'],[-3545,-865,28,22,76,'#6f98bc','glass']])if(lzBox(L,x,z,w,d,h,col,{m}))lzBox(L,x,z,w*.7,d*.7,h*.06,col,{m:'glass',force:1,nc:1,y0:h});
  if(lzBox(L,-4150,-930,70,30,24,'#b8b4ac'))lzBox(L,-4125,-930,20,20,46,'#a8a49c',{force:1});
  {const x=-4170,z=-660;if(lzBox(L,x,z,50,14,16,'#b0604a',{m:'brick'})){lzBox(L,x-22,z-14,12,26,16,'#b0604a',{m:'brick',force:1});lzBox(L,x+22,z-14,12,26,16,'#b0604a',{m:'brick',force:1});for(const a of[-25,25]){lzCyl(L,x+a,z+6,4,4,22,'#a85a44',{force:1});lzCone(L,x+a,22,z+6,5,7,'#4a3a3a')}}}
  // harbour: concrete quay, three gantry cranes with their booms over the Main, container rows (smashable), the harbour jump into the river
  lzBox(L,-3670,-760,280,130,.08,'#9a9a94',{force:1,nc:1,y0:-.2,m:'flat'});for(const x of[-3585,-3665,-3745])lzCrane(L,x,-700,0,'#2f7de1');
  for(let i=0;i<6;i++)for(let j=0;j<2;j++)L.props.push(['container',-3700-i*26,-830-j*14,Math.PI/2]);for(let i=0;i<6;i++)L.props.push(['crate',-3780+rnd()*40,-760+rnd()*20]);
  L.spots.dz2=[-3660,-768,Math.PI/2];L.ramps.push([-3800,-720,0,22,5,14,0xff5a1c]);
  lzFront(L,be,[...LZLD,...LZC],22,rnd,.85);lzFront(L,fr,[...LZLD,...LZH],21,rnd,.85);lzFront(L,ka,[...LZC,...LZLD],22,rnd,.8);lzFront(L,wa,LZH,19,rnd,.8);
  lzStudLine(L,-3500,-1050,-5150,-1060,15,10);L.ramps.push([-4400,-1450,-Math.PI/2,24,7,16,0xffb020])}});
// --- Hoechst: Schloss, Bolongaropalast, the Industriepark with chimneys, tanks, warehouses and a pipe bridge over the Leunastrasse
lzReg('hoechst','Höchst',[4300,7000,-2100,-250],{plan(L){const rnd=mul(1213);
  const le=lzRoad(L,[[4140,-1000],[5000,-1000],[6000,-1000],[6900,-1000]],20,'Leunastraße'),bo=lzRoad(L,[[4700,-1250],[5200,-1250],[5700,-1250]],16,'Bolongarostraße'),ks=lzRoad(L,[[5100,-1240],[5100,-800],[5100,-300]],16,'Königsteiner Straße');
  if(lzBox(L,5260,-1340,13,13,36,'#c8b89a'))lzCone(L,5260,lzY0(5260,-1340,13,13)+36,-1340,10,9,'#5a4a4a',4);lzBox(L,5310,-1356,40,14,14,'#d8c8a8');lzBox(L,5520,-1330,120,18,16,'#e8c88a',{m:'brick'});
  for(const[x,z,h]of[[5950,-1200,78],[6150,-1350,92],[6400,-1150,70],[6650,-1300,88],[6300,-800,84]]){if(!lzCyl(L,x,z,3.4,4.2,8,'#b8b0a8'))continue;const y0=lzY0(x,z,8,8);for(let k=0;k*12<h;k++)lzCyl(L,x,z,2.6,3.2,12,k%2?'#f4f4f0':'#d8302a',{force:1,nc:1,y0:y0+8+k*12});L.studs.push([x+12,z,100])}
  for(let i=0;i<4;i++)for(let j=0;j<2;j++)lzCyl(L,6520+i*34,-640-j*34,12,12,14,'#dcdcd6',{seg:16});
  for(const[x,z]of[[5700,-940],[5900,-1080],[6200,-930],[6500,-1080],[6800,-930],[5400,-1080]])lzBox(L,x,z,60,30,14,'#c8ccd0',{m:'office'});
  if(lzBox(L,5900,-820,100,30,22,'#9a4a32',{m:'brick'}))lzBox(L,5860,-820,16,16,38,'#8a4030',{m:'brick',force:1});
  // pipe bridge across the Leunastrasse (drive underneath) with a jump in front of it
  for(const sd of[-1,1])lzBox(L,6080,-1000+sd*18,3,3,10,'#7a7f88',{force:1});lzBox(L,6080,-1000,4,40,3,'#9aa2ac',{force:1,y0:9,lift:1});L.ramps.push([5700,-1000,Math.PI/2,24,6,16,0xff5a1c]);
  for(let i=0;i<24;i++)L.props.push([rnd()<.5?'container':rnd()<.5?'crate':'dumpster',5800+rnd()*1000,-1300+rnd()*700]);
  lzFront(L,bo,LZH,18,rnd,.8);lzFront(L,ks,[...LZH,...LZLD],19,rnd,.8);lzStudLine(L,4200,-1000,6850,-1000,15,10)}});
// --- Osthafen: gantry cranes on the north quay of the basin, a cargo ship
lzReg('osthafen','Osthafen',[-3000,-1900,-450,250],{plan(L){const B=WATERS.find(w=>w.basin);if(!B)return;let n=0;
  for(let i=8;i<B.pts.length-8&&n<5;i+=22){const p=B.pts[i],o=p.hw+22,x=p.x+p.tz*o,z=p.z-p.tx*o;if(lzCrane(L,x,z,Math.atan2(-p.tz,p.tx),'#e8a020',22))n++}
  {const p=B.pts[Math.floor(B.pts.length*.55)],ry=Math.atan2(-p.tz,p.tx);lzBox(L,p.x,p.z,70,14,8,'#2f4a6a',{ry,force:1,y0:HWY-1.2});lzBox(L,p.x-p.tx*24,p.z-p.tz*24,14,12,9,'#f4f4f0',{ry,force:1,nc:1,y0:HWY+6.8});for(let k=-2;k<=2;k++)lzBox(L,p.x+p.tx*k*9,p.z+p.tz*k*9,8,12,2.6,['#b8322a','#1f5fa8','#e0a020','#2c8a5a','#d85a1a'][k+2],{ry,force:1,nc:1,y0:HWY+6.8})}}});
// --- Stadtwald: the Goetheturm (wooden lookout tower) and a jump on the forest trail
{const L=LAZY.find(q=>q.id==='stadtwald');L.plan=function(L){const[x,z]=WP(1207,-1946);const y0=lzY0(x,z,10,10);if(lzBox(L,x,z,10,10,43,'#8a6a44',{force:1,y0})){L.parts.pop();
    for(const[a,b]of[[-4,-4],[4,-4],[-4,4],[4,4]])lzBox(L,x+a,z+b,.9,.9,43,'#8a6a44',{force:1,nc:1,y0});for(let k=1;k<=4;k++)lzBox(L,x,z,9.4,9.4,.5,'#a07a50',{force:1,nc:1,y0:y0+k*10});lzCone(L,x,y0+43,z,7.5,5,'#5a4a3a',4)}
  const T=TRAILS[0];if(T){const i=Math.floor(T.pts.length*.4),p=T.pts[i];L.ramps.push([p.x,p.z,Math.atan2(p.tx,p.tz),20,5,12,0xffb020]);for(let k=10;k<T.pts.length;k+=4)L.studs.push([T.pts[k].x,T.pts[k].z,k%40===0?100:10])}}}
if(CID!=='fra')LAZY.length=0;// Frankfurt outskirts only; the Athens corridor biomes follow
function athBiomes(){const lzRegW=(id,name,r,o)=>{if(r[1]<WX0||r[0]>WX1||r[3]<WZS||r[2]>WZN)return null;return lzReg(id,name,r,o)};const RB=id=>{const B=(RF.biomes||[]).find(b=>b[0]===id),R=rfRect([B[2],B[3],B[4],B[5]]);return[R.x0,R.x1,R.z0,R.z1]};
  Object.assign(LZT,{psychiko:'Up Kifisias to Psychiko…',papagou:'Through Papagou and Cholargos…',filothei:'Into the villas of Filothei…',chalandri:'Into Chalandri…',tourk:'Up the Tourkovounia…'});
  const clear=(x,z,m)=>{const q=cityAt(x,z);return !(q&&q.d<q.road.w/2+m)&&!roamHit(x,z,m)};
  const trees=(L,n,rnd,K)=>{const R=L.rect;for(let i=0;i<n;i++){const x=R[0]+20+rnd()*(R[1]-R[0]-40),z=R[2]+20+rnd()*(R[3]-R[2]-40);if(hillH(x,z)>3||!clear(x,z,4))continue;L.props.push([K[Math.floor(rnd()*K.length)],x,z])}};
  const along=(L,id,n,big)=>{const R=L.rect,out=[];for(const S of CITY_S){if(S.r.id!==id)continue;for(let i=0;i<S.pts.length;i+=5){const p=S.pts[i];if(p.x>=R[0]&&p.x<R[1]&&p.z>=R[2]&&p.z<R[3])out.push([p.x,p.z])}}const st=Math.max(1,Math.floor(out.length/n));for(let k=0;k<n&&k*st<out.length;k++){const[x,z]=out[k*st];L.studs.push([x,z,k===n-1&&big?100:10])}};
  const snapOn=(id,e,n)=>{const[x,z]=WP(e,n);let b=null,bd=1e9;for(const S of CITY_S){if(S.r.id!==id)continue;for(const p of S.pts){const d=Math.hypot(p.x-x,p.z-z);if(d<bd){bd=d;b=p}}}return b&&bd<300?b:null};
  lzRegW('psychiko','Psychiko',RB('psychiko'),{plan(L){const rnd=mul(3401);trees(L,220,rnd,['tree3','tree3','tree2','bush']);
    {const P=PLAZAS.find(q=>q.name==='Faros Psychikou');if(P){const x=(P.x0+P.x1)/2,z=(P.z0+P.z1)/2;if(lzBox(L,x,z,P.x1-P.x0,P.z1-P.z0,.1,'#ece5d8',{force:1,nc:1,y0:-.16,m:'flat'})){ZONES.push({t:'plaza',x0:P.x0,x1:P.x1,z0:P.z0,z1:P.z1,name:'Faros Psychikou'});for(let k=0;k<3;k++)L.props.push(['post',x-12+k*12,z-8]);for(let k=0;k<6;k++)L.props.push(['table',x-15+k*6,z+8])}}}
    along(L,'kifisias',6,1)}});
  lzRegW('papagou','Papagou · Cholargos',RB('papagou'),{plan(L){const rnd=mul(3402);trees(L,110,rnd,['tree2','tree','tree3']);along(L,'mesog',5,0)}});
  lzRegW('filothei','Filothei',RB('filothei'),{plan(L){const rnd=mul(3403);trees(L,220,rnd,['tree3','tree2','tree3','bush']);along(L,'kifisias',5,1)}});
  lzRegW('chalandri','Chalandri',RB('chalandri'),{plan(L){const rnd=mul(3404),P=PLAZAS.find(q=>q.name==='Plateia Chalandriou');
    if(P){const px=(P.x0+P.x1)/2,pz=(P.z0+P.z1)/2,pw=P.x1-P.x0,pd=P.z1-P.z0;if(lzBox(L,px,pz,pw,pd,.1,'#ece5d8',{force:1,nc:1,y0:-.16,m:'flat'})){ZONES.push({t:'plaza',x0:P.x0,x1:P.x1,z0:P.z0,z1:P.z1,name:'Plateia Chalandriou'});for(let k=0;k<8;k++)L.props.push(['tree2',px-pw*.4+k*pw*.8/7,pz+pd*.4]);for(let k=0;k<10;k++)L.props.push([rnd()<.5?'table':'parasol',px-pw*.3+rnd()*pw*.6,pz-pd*.25+rnd()*pd*.45]);L.props.push(['post',px+pw*.4,pz-pd*.38])}}
    {const C=LM_BY['Agios Ioannis Chalandriou'];if(C&&athRectClr(C.x,C.z,16,32,0,1)&&lzBox(L,C.x,C.z,14,20,9,'#f2ead8',{m:'neo',force:1})){const y0=lzY0(C.x,C.z,14,20);lzCyl(L,C.x,C.z,4.2,4.2,4,'#f2ead8',{force:1,nc:1,y0:y0+9});lzSph(L,C.x,y0+13,C.z,4.4,'#c86a3c',1,.8,1);lzBox(L,C.x,C.z+12,5,5,16,'#f2ead8',{force:1})}}
    {const H=LM_BY['Dimarcheio Chalandriou'];if(H&&athRectClr(H.x,H.z,36,22,0,1)){const q=cityAt(H.x,H.z);lzBox(L,H.x,H.z,34,20,13,'#efe0bf',{m:'neo',force:1,ry:q?Math.atan2(q.p.tx,q.p.tz):0})}}
    trees(L,110,rnd,['tree2','tree3','tree']);along(L,'papandr',5,1);
    {const p=snapOn('pentelis',7002,5325);if(p)L.ramps.push([p.x,p.z,Math.atan2(p.tx,p.tz),24,6,16,0xffb020])}}});
  lzRegW('tourk','Tourkovounia',RB('tourk'),{plan(L){const rnd=mul(3405),T=TRAILS.find(t=>t.id==='tourk'),R=L.rect;for(let i=0;i<160;i++){const x=R[0]+30+rnd()*(R[1]-R[0]-60),z=R[2]+30+rnd()*(R[3]-R[2]-60);if(hillH(x,z)<4||trailDist(x,z)<10)continue;L.props.push(['rock',x,z])}
    if(T)for(let k=6;k<T.pts.length;k+=5)L.studs.push([T.pts[k].x,T.pts[k].z,k%30===1?100:10])}})}
if(CID!=='fra')athBiomes();
function athOuter(){const T=1000,W2=['#ffffff','#fbf6ea','#f6eedc','#f3e9d8','#f2efe8','#efe3c8'],LD=['low-detail-building-a','low-detail-building-c','low-detail-building-e','low-detail-building-g','low-detail-building-wide-a'],[,NZ]=WP(0,2000);
  const cityFree=(x,z,m)=>{const q=cityAt(x,z);return !(q&&q.d<q.road.w/2+m)};
  const laneOK=(x,z)=>x>WX0+70&&x<WX1-70&&z>WZS+70&&z<WZN-70&&!inCity(x,z,30)&&hillH(x,z)<.5&&cityFree(x,z,12)&&lzRoadD(x,z)>10&&!lzHit(x,z,9)&&!GARAGES.some(g=>g.x!=null&&Math.hypot(x-g.x,z-g.z)<60)&&trailDist(x,z)>14;
  let ti=0;for(let x0=WX0;x0<WX1;x0+=T)for(let z0=WZS;z0<WZN;z0+=T){const r=[x0,Math.min(WX1,x0+T),z0,Math.min(WZN,z0+T)];if(SM_ON?[[r[0],r[2]],[r[1],r[2]],[r[0],r[3]],[r[1],r[3]],[(r[0]+r[1])/2,(r[2]+r[3])/2]].every(([x,z])=>inCity(x,z,60)):r[0]>HX0-60&&r[1]<HX1+60&&r[2]>HZS-60&&r[3]<HZN+60)continue;const seed=7100+ti++;
    lzReg('athout'+ti,'Attiki',r,{tile:1400,q:[],lanes:[],pre:function*(L){const N=L.lanes;for(let i=0;i<N.length;i+=4){const[a,b,c,e]=N.slice(i,i+4),len=Math.hypot(c-a,e-b)+12,v=Math.abs(e-b)>Math.abs(c-a);L.parts.push({k:'b',w:v?12:len,d:v?len:12,h:.12,x:(a+c)/2,y:-.16,z:(b+e)/2,ry:0,col:'#62666e',m:'flat'})}const Q=L.q,RC=['#c8643c','#b85a34','#d0704a'];for(let i=0;i<Q.length;i+=9){if((i/9)%300===299)yield;const[x,z,w,d,h,y0,ry,ci,rf]=Q.slice(i,i+9);L.parts.push({k:'b',w,h,d,x,y:y0+h/2,z,ry,col:W2[ci],m:rf>=0?'plaka':'poly'});if(rf>0)L.parts.push({k:'g',x,y:y0+h,z,w:d+.8,d:w+.8,h:2.2,col:RC[rf-1],ry:ry+Math.PI/2});else if(rf<0)L.parts.push({k:'b',w:w+.3,h:.5,d:d+.3,x,y:y0+h+.25,z,ry,col:'#e2ded6',m:'plain'})}},plan(L){const rnd=mul(seed),SP=150,lw=12;
      // lanes: every 150 m both ways, kept where the ground is free (runs of at least 60 m)
      for(const vert of[1,0])for(let c=Math.ceil((vert?r[0]:r[2])/SP)*SP;c<(vert?r[1]:r[3]);c+=SP){let run=[];const fl=()=>{if(run.length>=7){const a=run[0],b=run[run.length-1];L.lanes.push(a[0],a[1],b[0],b[1]);LZ.roads.push({pts:[{x:a[0],z:a[1]},{x:b[0],z:b[1]}],w:lw,name:'Odos'});const n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/20);for(let k=0;k<=n;k++){const x=a[0]+(b[0]-a[0])*k/n,z=a[1]+(b[1]-a[1])*k/n,K=Math.floor(x/64)*100000+Math.floor(z/64);let A=LZ.rg.get(K);if(!A)LZ.rg.set(K,A=[]);A.push({x,z,w:lw})}}run=[]};
        for(let a=(vert?r[2]:r[0])+5;a<(vert?r[3]:r[1]);a+=10){const x=vert?c:a,z=vert?a:c;if(laneOK(x,z))run.push([x,z]);else fl()}fl()}
      // blocks: rows of buildings along each cell edge, facing the lane; gardens and trees in the north
      for(let cx=Math.floor(r[0]/SP)*SP;cx<r[1];cx+=SP)for(let cz=Math.floor(r[2]/SP)*SP;cz<r[3];cz+=SP){const north=cz>NZ+150,sc0=north?13:17;
        for(const side of[0,1,2,3]){const along=side<2;let p=20;while(p<SP-20){const mw=north?11+rnd()*5:14+rnd()*8,md=north?10+rnd()*2:12+rnd()*3,fl=north?2:4+Math.floor(rnd()*3),h=north?6.8:fl*3.1+.6;if(p+mw>SP-18)break;
          const off=lw/2+10+md/2,c0=p+mw/2,x=along?cx+c0:(side===2?cx+off:cx+SP-off),z=along?(side===0?cz+off:cz+SP-off):cz+c0,ry=side===0?Math.PI:side===1?0:side===2?-Math.PI/2:Math.PI/2;
          if(rnd()<(north?.75:.92)&&!inCity(x,z,20)&&hillH(x,z)<.4&&cityFree(x,z,md/2+5)&&lzFreeBox(x,z,mw,md,ry)){const y0=lzY0(x,z,mw,md,ry),b=hubAddB({x,z,hw:mw/2,hd:md/2,h:y0+h,ry},L.bld);gridAddTo(LZ.g,[b]);L.towns++;
            L.q.push(x,z,mw,md,h,y0,ry,Math.floor(rnd()*W2.length),north?(rnd()<.6?1+Math.floor(rnd()*3):0):-1);if(north)L.props.push([rnd()<.5?'tree3':'tree2',x+(rnd()-.5)*mw*1.4,z+(rnd()-.5)*md*1.4])}
          p+=mw+(north?7+rnd()*9:1.5+rnd()*3)}}
        if(rnd()<.6){const x=cx+SP/2+(rnd()-.5)*30,z=cz+SP/2+(rnd()-.5)*30;if(!inCity(x,z,30)&&hillH(x,z)<.4)for(let k=0;k<4;k++)L.props.push([north?'tree3':rnd()<.5?'tree2':'tree',x+(rnd()-.5)*40,z+(rnd()-.5)*40])}}}})}}

// ---------- props: Kenney models where available, smashable, instanced per type
function kmProps(D){const K=(nm,sc,r,st,m,cols,extra)=>Object.assign({g:kmGeo(nm,sc),mat:kmMat(kmKit(nm)),r,st,m,cols},extra||{});
  Object.assign(D,{lamp:K('light-curved',11,1,2,.95,['#3a3f48','#fff3c4']),tree:K('tree_default',6,1.6,3,.85,['#3f8a2e','#6b4a2a'],{tint:['#e0ff80','#ccf070','#f0ff90']}),tree2:K('tree_oak',7,1.8,3,.85,['#4f9a36','#6b4a2a'],{tint:['#e8ff88','#d8f878','#fff0a0']}),tree3:K('tree_cone',7.5,1.5,3,.85,['#2f6a3a','#6b4a2a'],{tint:['#c8f080','#b8e070']}),
    bush:K('plant_bushLarge',7,1.4,1,.95,['#3f8a2e'],{tint:['#e0ff80']}),rock:K('rock_largeA',6,2.6,3,.7,['#8a8a8a']),cone:K('construction-cone',13,.7,1,.99,['#ff7a1c','#ffffff']),barrier:K('construction-barrier',12,1.2,2,.95,['#ff7a1c','#ffffff']),
    clight:K('construction-light',12,.8,2,.97,['#ffd12c','#2f3640']),dumpster:K('dumpster',9,1.8,4,.85,['#2a7a4a','#2f3640']),crate:K('box',2.2,.9,2,.97,['#b07a44']),container:K('cargo-container-a',5.2,4.5,8,.7,['#d8502a','#2a7ad8']),
    parasol:K('detail-parasol-a',10,1.4,2,.97,['#e8502a','#ffffff']),planter:K('planter',9,1.6,2,.95,['#6b4a2a','#4f9a36']),sign:K('road-sign-stop',10,.6,1,.98,['#d8302a','#ffffff']),
    car:K('sedan',2.3,2.6,8,.75,['#d8302a','#2f3640']),car2:K('suv',2.3,2.7,8,.75,['#2a7ad8','#2f3640']),car3:K('taxi',2.3,2.6,8,.75,['#ffd12c','#2f3640']),car4:K('van',2.3,2.7,8,.75,['#ffffff','#2f3640']),
    boat:K('boat-speed-a',2.6,3,8,.8,['#ffffff','#2a7ad8']),tug:K('boat-tug-a',3.2,4,10,.75,['#d8302a','#2f3640']),hboat:K('boat-house-a',3.2,5,10,.75,['#e8c090','#6b4a2a'])});ART_trees(D);
  if(CID==='ath'){const k=5.5/7.43;D.lamp.g=D.lamp.g.clone().scale(k,k,k);D.lamp.g.computeBoundingBox();D.lamp.mat=D.lamp.mat.clone();D.lamp.mat.color=new THREE.Color('#5a5a52');D.lamp.cols=['#2e302c','#fff3c4']}  // R1
  const BR=['#e8302a','#2a7ad8','#ffd12c','#3aa04a','#ffffff','#ff7a1c'],brk=(w,h,d,x,y,z,c)=>{const L=[cbox(w,h,d,x,y+h/2,z,c)];for(let i=0;i<w/1.6;i++)for(let j=0;j<d/1.6;j++)L.push(ccyl(.32,.32,.3,x-w/2+.8+i*1.6,y+h+.15,z-d/2+.8+j*1.6,c,8));return L};
  D.bricks={g:mergeG([...brk(3.2,1.2,1.6,0,0,0,BR[0]),...brk(3.2,1.2,1.6,.3,0,1.7,BR[1]),...brk(3.2,1.2,1.6,-.2,1.2,.8,BR[2]),...brk(1.6,1.2,1.6,1.6,0,-1.4,BR[3]),...brk(1.6,1.2,1.6,.4,2.4,.9,BR[4])]),r:2.2,st:8,m:.96,cols:BR};
  D.tower={g:mergeG([...brk(3.2,1.2,3.2,0,0,0,BR[1]),...brk(3.2,1.2,3.2,0,1.2,0,BR[2]),...brk(3.2,1.2,3.2,0,2.4,0,BR[0]),...brk(3.2,1.2,3.2,0,3.6,0,BR[3]),...brk(1.6,1.2,1.6,0,4.8,0,BR[4])]),r:2.2,st:10,m:.95,cols:BR};
  D.gold={g:mergeG([cbox(2.4,2.4,2.4,0,1.2,0,'#ffc21a'),cbox(2.5,.3,2.5,0,2.3,0,'#fff27a'),cbox(2.5,.3,2.5,0,.15,0,'#c08a10'),ccyl(.45,.45,.35,-.6,2.55,-.6,'#fff27a',8),ccyl(.45,.45,.35,.6,2.55,-.6,'#fff27a',8),ccyl(.45,.45,.35,-.6,2.55,.6,'#fff27a',8),ccyl(.45,.45,.35,.6,2.55,.6,'#fff27a',8)]),r:1.8,st:6,m:.97,cols:['#ffc21a','#fff27a'],gold:true};
  D.fence=K('fence-1x3',9,1.6,1,.97,['#ffffff','#8a6a4a']);D.tlight=K('traffic-light',11,.7,2,.97,['#3a3f48','#ffd12c']);D.awning=K('detail-awning',10,1.2,1,.99,['#e8302a','#ffffff']);
  // where the lamp head sits (for the glow sprite)
  const p=D.lamp.g.attributes.position,bb=D.lamp.g.boundingBox;let sx=0,sz=0,n=0;for(let i=0;i<p.count;i++)if(p.getY(i)>bb.max.y*.9){sx+=p.getX(i);sz+=p.getZ(i);n++}D.lamp.head=V3(sx/n,bb.max.y-.4,sz/n);return D}
// direct-array batch for the Athens units (boxes, gable prisms, balcony quads): no per-unit geometry objects, merged per material and 800 m tile
const _abC=new THREE.Color();class ABatch{constructor(){this.m=new Map()}E(mat,x,z){const k=mat.uuid+'#'+hubTile(x,z);let e=this.m.get(k);if(!e)this.m.set(k,e={mat,p:[],n:[],u:[],c:[]});return e}
  tri(e,V,N,U,ox,oy,oz,cs,sn){const C=_abC;for(let i=0;i<V.length;i+=3){const lx=V[i],lz=V[i+2],j=i/3;e.p.push(ox+lx*cs+lz*sn,oy+V[i+1],oz-lx*sn+lz*cs);const k=Math.floor(j/3)*9;e.n.push(N[k]*cs+N[k+2]*sn,N[k+1],-N[k]*sn+N[k+2]*cs);e.u.push(U[j*2],U[j*2+1]);e.c.push(C.r,C.g,C.b)}}
  box(mat,w,h,d,x,y,z,ry,col,tw,th){_abC.set(col);const e=this.E(mat,x,z),a=w/2,b=h/2,c=d/2,V=[],N=[],U=[],F=[[[a,-b,c],[a,-b,-c],[a,b,-c],[a,b,c],[1,0,0],d],[[-a,-b,-c],[-a,-b,c],[-a,b,c],[-a,b,-c],[-1,0,0],d],[[-a,b,c],[a,b,c],[a,b,-c],[-a,b,-c],[0,1,0],0],[[-a,-b,-c],[a,-b,-c],[a,-b,c],[-a,-b,c],[0,-1,0],0],[[-a,-b,c],[a,-b,c],[a,b,c],[-a,b,c],[0,0,1],w],[[a,-b,-c],[-a,-b,-c],[-a,b,-c],[a,b,-c],[0,0,-1],w]];
    for(const[q0,q1,q2,q3,n,fw]of F){for(const q of[q0,q1,q2,q0,q2,q3])V.push(...q);N.push(...n,0,0,0,0,0,0,...n,0,0,0,0,0,0);if(fw&&tw){const uu=fw/tw,vv=h/th;U.push(0,0,uu,0,uu,vv,0,0,uu,vv,0,vv)}else U.push(.02,.02,.02,.02,.02,.02,.02,.02,.02,.02,.02,.02)}this.tri(e,V,N,U,x,y,z,Math.cos(ry),Math.sin(ry))}
  prism(mat,w,d,h,x,y,z,ry,col){_abC.set(col);const e=this.E(mat,x,z),a=w/2,c=d/2,l=Math.hypot(h,a),nl=[-h/l,a/l,0],nr=[h/l,a/l,0],V=[-a,0,c,a,0,c,0,h,c, a,0,-c,-a,0,-c,0,h,-c, -a,0,-c,-a,0,c,0,h,c, -a,0,-c,0,h,c,0,h,-c, a,0,c,a,0,-c,0,h,-c, a,0,c,0,h,-c,0,h,c],N=[0,0,1,0,0,0,0,0,0, 0,0,-1,0,0,0,0,0,0,...nl,0,0,0,0,0,0,...nl,0,0,0,0,0,0,...nr,0,0,0,0,0,0,...nr,0,0,0,0,0,0];this.tri(e,V,N,new Array(36).fill(.02),x,y,z,Math.cos(ry),Math.sin(ry))}
  bal(mat,w,dp,h,x,y,z,ry,col){_abC.set(col);const e=this.E(mat,x,z),a=w/2,V=[-a,0,dp,a,0,dp,a,h,dp, -a,0,dp,a,h,dp,-a,h,dp, -a,0,0,a,0,dp,-a,0,dp, -a,0,0,a,0,0,a,0,dp],N=[0,0,1,0,0,0,0,0,0, 0,0,1,0,0,0,0,0,0, 0,-1,0,0,0,0,0,0,0, 0,-1,0,0,0,0,0,0,0];this.tri(e,V,N,new Array(24).fill(.02),x,y,z,Math.cos(ry),Math.sin(ry))}
  flush(parent){for(const e of this.m.values()){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(e.p,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(e.n,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(e.u,2));g.setAttribute('color',new THREE.Float32BufferAttribute(e.c,3));parent.add(new THREE.Mesh(g,e.mat))}this.m.clear()}}
function athBal(w,dp,h){const P=[-w/2,0,dp, w/2,0,dp, w/2,h,dp, -w/2,0,dp, w/2,h,dp, -w/2,h,dp, -w/2,0,0, w/2,0,dp, -w/2,0,dp, -w/2,0,0, w/2,0,0, w/2,0,dp],N=[];for(let i=0;i<6;i++)N.push(0,0,1);for(let i=0;i<6;i++)N.push(0,-1,0);const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(N,3));return colorize(g,new THREE.Color('#eef0ee'))}
function athProps(D){D.tree={g:mergeG([ccyl(.2,.3,2.2,0,1.1,0,'#6b4a2a',6),(()=>{const g=new THREE.IcosahedronGeometry(1.8,0);g.scale(1,.9,1);g.translate(0,3.4,0);return colorize(g,new THREE.Color('#3f7a34'))})(),...[[1.35,3.2,.6],[-1.1,3.6,.9],[.4,2.7,-1.4],[-.9,3,-1],[1.1,4,-.6],[-.2,4.6,.7]].map(([a,b,c])=>cbox(.4,.4,.4,a,b,c,'#ff9a1a'))]),r:1.3,st:3,m:.86,cols:['#3f7a34','#ff9a1a']};
  D.post={g:mergeG([cbox(2.6,2.4,1.9,0,1.2,0,'#2f7a4a'),cbox(3.3,.25,2.6,0,2.55,0,'#24603c'),cbox(2.3,1.1,.12,0,1.45,1,'#f2ead2'),...[0,1,2,3].map(k=>cbox(.42,.55,.06,-.8+k*.53,1.5,1.07,['#e8302a','#2a7ad8','#ffcc00','#3aa04a'][k])),cbox(.75,1.7,.7,1.75,.85,.2,'#f6f6f6'),ccyl(.04,.04,1.6,-1.5,3.4,1.2,'#3a3a3a',6),cbox(.6,.4,.04,-1.2,4,1.2,'#ff5a8a')]),r:1.7,st:6,m:.84,cols:['#2f7a4a','#f2ead2','#e8302a']};
  D.hydrant={g:mergeG([cbox(.5,.5,1.5,0,.55,0,'#ffffff'),cbox(.44,.25,.75,0,.95,-.2,'#2a2a2a'),cbox(.08,.9,.08,0,1.05,.66,'#3a3a3a'),cbox(.75,.08,.08,0,1.5,.66,'#3a3a3a'),cbox(.14,.5,.5,0,.25,.7,'#1a1a1a'),cbox(.14,.5,.5,0,.25,-.62,'#1a1a1a')]),r:.9,st:2,m:.97,cols:['#e8302a','#1a1a1a'],tint:['#e8302a','#2a7ad8','#f0f0f0','#3aa04a','#ffcc00','#9a9aa8','#ff7a1c']};
  D.tree3={...D.tree3,tint:['#5f8f4a','#4f7f44','#6a9a50']};D.tree2={...D.tree2,tint:['#9aaa70','#8a9a64','#a8b47a']};return D}
// CE: extra prop types (scooter, café sets, umbrella pine, cypress, olive, parked-car aliases); cd = cull distance (m), grouped in 400 m cells
const CE_RX={car:1,car2:1,car3:1,car4:1,CE_car:1,CE_car2:1,CE_taxi:1,barrier:1,cone:1,clight:1,bricks:1,tower:1,gold:1,crate:1,boat:1,tug:1,hboat:1};
// exact distance (m) from the nearest real-street edge, pruned: only samples within w/2+4.5 m can have an edge within 0.15 m (8 m sample spacing)
function CE_roadE(x,z){const kx=Math.floor(x/64),kz=Math.floor(z/64);let b=1e9;for(let a=-1;a<=1;a++)for(let c=-1;c<=1;c++){const L=CITY_G.get((kx+a)*100000+kz+c);if(!L)continue;for(let j=0;j<L.length;j+=2){const S=CITY_S[L[j]],i=L[j+1],P=S.pts,p0=P[i],hw=S.r.w/2,dx0=p0.x-x,dz0=p0.z-z;if(dx0*dx0+dz0*dz0>(hw+4.5+(b<1e9?0:0))**2)continue;for(const k of[i-1,i]){if(k<0||k+1>=P.length)continue;const p=P[k],q=P[k+1],dx=q.x-p.x,dz=q.z-p.z,l2=dx*dx+dz*dz||1e-9;let t=((x-p.x)*dx+(z-p.z)*dz)/l2;t=t<0?0:t>1?1:t;const e=Math.hypot(p.x+dx*t-x,p.z+dz*t-z)-hw;if(e<b)b=e}}}return b}
function CE_onRoad(x,z){const q=cityAt(x,z);if(q&&q.d-q.road.w/2<.15)return true;if(q&&q.d-q.road.w/2<4.5&&CE_roadE(x,z)<.15)return true;const f=fillAt(x,z);if(f&&f.d-f.r.w/2<.15)return true;const a=abAt(x,z);if(a&&a.d-a.road.w/2<.15)return true;return trailDist(x,z)-7<.15||mtnDist(x,z)-12<.15||lzRoadD(x,z)<.15}
function CE_defs(D){const cone=(r,h,y,col,seg=8)=>{const g=new THREE.ConeGeometry(r,h,seg);g.translate(0,y,0);return colorize(g,new THREE.Color(col))};
  D.CE_moto={g:mergeG([cbox(.42,.42,1.25,0,.55,0,'#ffffff'),cbox(.38,.14,.62,0,.85,-.22,'#1a1a1a'),cbox(.1,.75,.1,0,.95,.5,'#2f3640'),cbox(.72,.06,.06,0,1.32,.5,'#2f3640'),cbox(.14,.5,.5,0,.25,.55,'#1a1a1a'),cbox(.14,.5,.5,0,.25,-.55,'#1a1a1a'),cbox(.44,.36,.1,0,.95,.62,'#ffffff')]),r:.9,st:2,m:.96,cols:['#e8302a','#1a1a1a'],tint:['#e8302a','#2a7ad8','#f0f0f0','#2a2a30','#9aa0a8','#3aa04a','#f0c020'],cd:150};
  const cafe=uc=>mergeG([ccyl(.5,.5,.06,0,.78,0,'#f4efe4',8),cbox(.08,.78,.08,0,.39,0,'#2f3640'),...[0,Math.PI].flatMap(a=>[cbox(.45,.5,.45,Math.sin(a)*.85,.23,Math.cos(a)*.85,'#b8864a',a),cbox(.45,.5,.06,Math.sin(a)*1.07,.72,Math.cos(a)*1.07,'#b8864a',a)]),cbox(.07,2.4,.07,0,1.2,0,'#e8e2d4'),cone(1.5,.55,2.45,uc,6)]);
  D.CE_cafe={g:cafe('#f4ecd8'),r:1.6,st:2,m:.97,cols:['#f4ecd8','#b8864a'],tint:['#ffffff','#f6efe2','#eef4ff'],cd:220};D.CE_cafe2={g:cafe('#c8402a'),r:1.6,st:2,m:.97,cols:['#c8402a','#b8864a'],tint:['#ffffff','#ffe8d8','#e8f8e8'],cd:220};
  D.CE_pine={g:mergeG([ccyl(.22,.34,5.2,0,2.6,0,'#7a5a3a',6),csph(2.6,0,5.9,0,'#3e6b34',1.35,.42,1.35),csph(1.8,1.1,5.5,.7,'#46753a',1.2,.45,1.2),csph(1.6,-1,5.7,-.6,'#3a6430',1.2,.45,1.2)]),r:1.2,st:3,m:.85,cols:['#3e6b34','#7a5a3a'],tint:['#ffffff','#e8f0dc','#f4f8e8'],cd:800};
  D.CE_cypress={g:mergeG([ccyl(.15,.2,1,0,.5,0,'#5a4030',5),cone(.95,7.5,4.6,'#2d5a32',7)]),r:.9,st:2,m:.88,cols:['#2d5a32'],tint:['#ffffff','#e8f0e0'],cd:600};
  D.CE_olive={g:mergeG([ccyl(.18,.3,1.7,0,.85,0,'#6a5848',6),csph(1.6,0,2.6,0,'#8a9a68',1.25,.7,1.25),csph(1.1,.8,2.4,.4,'#7d8f60',1,.7,1)]),r:1,st:2,m:.9,cols:['#8a9a68','#6a5848'],tint:['#ffffff','#f0f4e8','#e8ecdc'],cd:400};
  D.CE_rock={g:mergeG([csph(1.6,0,.5,0,'#b8ab92',1.4,.75,1.1),csph(1,.9,.9,.4,'#a89c84',1,.8,1)]),r:1.8,st:3,m:.6,cols:['#b8ab92'],tint:['#ffffff','#f0e8dc','#e4dccc'],cd:500};
  D.CE_pigeon={g:mergeG([cbox(.22,.2,.36,0,.2,0,'#8a8f9a'),cbox(.14,.14,.14,0,.36,.18,'#6a6f7a'),cbox(.05,.04,.08,0,.34,.29,'#e8a030'),cbox(.24,.04,.2,0,.31,-.04,'#7a7f8a')]),r:.3,st:1,m:.99,cols:['#8a8f9a'],tint:['#ffffff','#e8e8f0','#d8d0c8'],cd:160};
  {const car=(L,H)=>mergeG([cbox(1.9,.75,L,0,.62,0,'#ffffff'),cbox(1.7,.62,L*.5,0,1.3,-L*.05,'#2a3440'),cbox(1.72,.1,L*.48,0,1.66,-L*.05,'#ffffff'),cbox(1.6,.2,.12,0,.62,L/2+.02,'#e8e8e0'),cbox(1.6,.2,.12,0,.62,-L/2-.02,'#c83020'),...[[-1,1],[1,1],[-1,-1],[1,-1]].map(([a,b])=>cbox(.3,.62,.62,a*.85,.31,b*L*.32,'#1a1a1a'))]);const base={r:2.3,st:6,m:.82,cols:['#e8e8e8','#20303a'],cd:200};
    D.CE_car={...base,g:car(4.2),tint:['#e84a3a','#2a6ad8','#f0f0f0','#2a2a30','#9a9aa8','#3aa05a','#c8c0b0','#7a2a2a']};D.CE_car2={...base,g:car(4.6),tint:['#f0f0f0','#2a2a30','#5a6a7a','#e8e0d0']};D.CE_taxi={...base,g:mergeG([car(4.4),cbox(.7,.25,.3,0,1.83,-.2,'#ffffff')]),tint:['#ffd12c','#f8c820']}}
  if(CID!=='fra')for(const[t,c]of[['tree',340],['bin',170],['bench',200],['pot',170],['post',300],['bush',260],['hydrant',150],['planter',200],['table',220],['stall',260]])if(D[t])D[t]={...D[t],cd:c};return D}
// CE: Athens pavements, slot by slot along both sides of every street (style of the block: plaka / old / kolon / poly / town / villa / outer), junction mouths kept clear,
// kiosks near the corners of the big roads; Frankfurt: café terraces at the Römer and on the Sachsenhausen streets
