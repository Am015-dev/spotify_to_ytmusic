function lmBuildAll(bt,BM){const C=c=>new THREE.Color(c),A=(g,col,m=BM.plain)=>{bt.add(col?colorize(g,C(col)):g,m);return g};
  const box=(w,h,d,x,y,z,col,m=BM.plain,ry=0)=>bt.add(cbox(w,h,d,x,y,z,col,ry),m),cyl=(r1,r2,h,x,y,z,col,seg=16,m=BM.plain)=>bt.add(ccyl(r1,r2,h,x,y,z,col,seg),m);
  const fac=(w,h,d,x,y0,z,col,m,ry=0)=>{const g=bxUV(w,h,d,12,11);if(ry)g.rotateY(ry);g.translate(x,y0+h/2,z);bt.add(colorize(g,C(col)),m)};
  const roof=(w,d,h,x,y,z,col,ry=0)=>{const g=roofGeo(w,d,h);if(ry)g.rotateY(ry);g.translate(x,y,z);bt.add(colorize(g,C(col)),BM.roof)};
  const studs=(x0,x1,z0,z1,y,col,st=7)=>{for(let x=x0+st/2;x<x1;x+=st)for(let z=z0+st/2;z<z1;z+=st)bt.add(ccyl(1,1,.7,x,y+.35,z,col,8),BM.plain)};
  const hit=(x,z,hw,hd,h,ry)=>hubAddB(ry!=null?{x,z,hw,hd,h,ry}:{x,z,hw,hd,h});
  const reg=(name,h,top,ph)=>{const L=LM_BY[name];if(L){L.h=h;L.top=top||[L.x,L.z];if(ph)L.ph=WP(ph[0],ph[1])}};
  const glassCyl=(r,h,seg,x,y0,z,col,ry=0)=>{const g=new THREE.CylinderGeometry(r,r,h,seg,1);const uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*r*6.3/12,uv.getY(i)*h/11);if(ry)g.rotateY(ry);g.translate(x,y0+h/2,z);bt.add(colorize(g,C(col)),BM.glass);return g};
  // 1. Römer: five stepped-gable houses facing the Römerberg (real east = world -x), Ostzeile opposite, Gerechtigkeitsbrunnen
  {const L=LM_BY['Römer'],x=L.x,RC=['#d98c7a','#e9d3b0','#d98c7a','#c9a27a','#e9d3b0'];
   for(let k=0;k<5;k++){const z=L.z+(k-2)*12.6,w=12.2,d=20,h=20;box(d,h,w,x,h/2,z,RC[k]);for(let f=0;f<3;f++)for(const o of[-3.4,0,3.4])box(.4,f?3.6:4.6,2,x-d/2-.15,f?6.6+f*5.6:3,z+o,f?'#3a4a5a':'#5a3a28');roof(w,d,8,x,h,z,'#8a3b2e',Math.PI/2);
     for(let i=0;i<4;i++)box(1,3,w*(1-i*.25),x-d/2-.5,h+1.5+i*3,z,i%2?'#f4efe6':RC[k]);box(.6,.8,w+.2,x-d/2-.3,h-.4,z,'#f4efe6');box(.5,h,.6,x-d/2-.25,h/2,z+w/2,'#f4efe6');
     if(k>=1&&k<=3)box(2.2,.5,w*.8,x-d/2-1.1,7,z,'#3a3f48');hit(x,z,d/2,w/2,h+12)}
   reg('Römer',32,[x,L.z],[5,0]);
   const[fx,fz]=WP(-40,-5);cyl(5,5.4,1.2,fx,.6,fz,'#9a9384');cyl(.7,.8,6,fx,4,fz,'#9a9384',8);box(1.2,2.2,1,fx,8.1,fz,'#ffc21a');cyl(.5,.5,.8,fx,9.6,fz,'#ffc21a',8);box(3,.3,.3,fx,8.6,fz,'#ffc21a');hit(fx,fz,5.4,5.4,10)}
  {const L=LM_BY['Ostzeile'];let top=0;for(let k=0;k<6;k++){const z=L.z+(k-2.5)*8.4,x=L.x,w=8,d=14,h=13+(k%3)*1.5,fx=x+d/2+.15;fac(d,h,w,x,0,z,'#f2ece0',BM.gable);
     for(const y of[4.3,8.6,h-.2])box(.3,.45,w,fx,y,z,'#5a3a28');for(const o of[-w/2+.2,0,w/2-.2])box(.3,h,.45,fx,h/2,z+o,'#5a3a28');
     for(const s of[-1,1]){const g=new THREE.BoxGeometry(.3,5.9,.4);g.rotateX(s*.75);g.translate(fx,6.45,z+s*w/4);A(g,'#5a3a28')}
     roof(w,d,7,x,h,z,['#6b4a3a','#8a3b2e','#5a4a4a'][k%3],Math.PI/2);hit(x,z,d/2,w/2,h+7);top=Math.max(top,h+7)}
   reg('Ostzeile',top,[L.x,L.z-4.2],[5,-20])}
  // 2. Kaiserdom: red sandstone nave + transept + apse, the west tower with octagon, drum, dome and lantern
  {const L=LM_BY['Kaiserdom'],z=L.z,S='#b5513c',sl='#4a4f5a',tx=L.x+48;fac(80,22,24,L.x-2,0,z,S,BM.brick);roof(24,80,11,L.x-2,22,z,sl,Math.PI/2);fac(32,22,60,L.x-22,0,z,S,BM.brick);roof(32,60,13,L.x-22,22,z,sl);
   cyl(12,12,22,L.x-44,11,z,S);{const g=new THREE.ConeGeometry(12.5,9,16);g.translate(L.x-44,26.5,z);A(g,sl)}
   fac(20,40,20,tx,0,z,S,BM.brick);for(const sx of[-1,1])for(const sz of[-1,1]){const g=new THREE.ConeGeometry(1.4,6,6);g.translate(tx+sx*9,43,z+sz*9);A(g,S)}
   cyl(9,10,35,tx,57.5,z,S,8);box(21,1.2,21,tx,40.6,z,'#9a3f2c');cyl(6.5,7.5,8,tx,79,z,'#9a3f2c',8);{const g=new THREE.ConeGeometry(8,10,8);g.translate(tx,88,z);A(g,'#9a3f2c')}cyl(1.2,1.6,4,tx,95,z,'#5f9e8f',8);{const g=new THREE.ConeGeometry(1.4,4,8);g.translate(tx,99,z);A(g,'#ffc21a')}
   hit(tx,z,10,10,101);hit(L.x-2,z,40,12,33);hit(L.x-22,z,16,30,35);hit(L.x-44,z,12,12,31);reg('Kaiserdom',101,[tx,z],[200,62])}
  // 3. Paulskirche: elliptical sandstone body, flat dome, square tower with clock and cupola on the real north side
  {const L=LM_BY['Paulskirche'],S='#b0503a',tz=L.z+19;{const g=new THREE.CylinderGeometry(21,21,22,28);g.scale(1,1,.76);g.translate(L.x,11,L.z);A(g,S)}
   for(let k=0;k<14;k++){const a=k/14*Math.PI*2,g=new THREE.BoxGeometry(2.2,8,.5);g.rotateY(Math.atan2(Math.sin(a)/21,Math.cos(a)/16));g.translate(L.x+Math.sin(a)*21.05,12,L.z+Math.cos(a)*16.02);A(g,'#3a3f48')}
   {const g=new THREE.SphereGeometry(21,28,6,0,Math.PI*2,0,Math.PI/2);g.scale(1,.3,.76);g.translate(L.x,22,L.z);A(g,'#6d727a')}cyl(2.5,3,3,L.x,29.6,L.z,'#6d727a',8);
   fac(10,38,10,L.x,0,tz,S,BM.brick);box(11,1,11,L.x,38.5,tz,'#8a3b2e');for(const[nx,nz]of[[-1,0],[0,1]]){const g=new THREE.CircleGeometry(2.6,20);g.rotateY(nx?-Math.PI/2:0);g.translate(L.x+nx*5.06,32,tz+nz*5.06);A(g,'#f4f4f0');const hd=new THREE.BoxGeometry(nx?.1:.3,1.9,nx?.3:.1);hd.translate(L.x+nx*5.12,32.8,tz+nz*5.12);A(hd,'#2a2a2a')}
   cyl(3.6,4.2,4,L.x,41,tz,'#6d727a',8);{const g=new THREE.ConeGeometry(3.4,7,8);g.translate(L.x,46.5,tz);A(g,'#5f9e8f')}
   hit(L.x,L.z,18,13.5,30);hit(L.x,L.z,12,15.5,30);hit(L.x,tz,5,5,50);reg('Paulskirche',50,[L.x,tz],[-60,40])}
  // 4. Alte Oper: sandstone block, raised hall with copper-green mansard, east portico with six columns, pediment, gold quadriga
  {const L=LM_BY['Alte Oper'],x=L.x,z=L.z,S='#e2d3b5',G2='#5f9e8f',fx=x-47.5;fac(95,24,60,x,0,z,S,BM.office);roof(60,95,7,x,24,z,G2,Math.PI/2);fac(40,35,40,x+4,0,z,S,BM.office);roof(40,40,9,x+4,35,z,G2);
   box(9,1.5,38,fx-4,.75,z,'#d8c8a8');for(let k=0;k<6;k++)cyl(1.2,1.2,14,fx-6,8.5,z-12.5+k*5,'#f2ead8',10);box(10,1.6,36,fx-5,16.3,z,'#e9dcc0');
   {const g=roofGeo(36,10,6);g.rotateY(Math.PI/2);g.translate(fx-5,17.1,z);A(g,S)}
   {const Y=23.1,gd='#ffc21a';box(1.6,2,4.4,fx-5,Y+1,z,gd);for(const o of[-1.6,-.5,.6,1.7])box(.9,1.6,1.2,fx-6.4,Y+2.2,z+o,gd);box(1.2,3.6,1,fx-4.2,Y+3.2,z,gd);for(const s of[-1,1]){const g=new THREE.BoxGeometry(.3,1.6,3);g.rotateX(s*.5);g.translate(fx-4,Y+5,z+s*1.6);A(g,gd)}}
   const[ox,oz]=WP(-695,676);cyl(6,6.5,1.2,ox,.6,oz,'#9a9384');cyl(.8,1,3,ox,2.7,oz,'#9a9384',8);cyl(3,1,1,ox,4.6,oz,'#9a9384',12);cyl(.4,.4,2,ox,6,oz,'#bfe6ff',8);hit(ox,oz,6.5,6.5,7);
   hit(x,z,47.5,30,44);hit(fx-4.5,z,5.5,19,24);reg('Alte Oper',44,[x+4,z],[-662,690])}
  // 5. Main Tower: glass cylinder + slab, red/white mast
  {const L=LM_BY['Main Tower'],cx=L.x,cz=L.z;glassCyl(25,200,32,cx,0,cz,'#3d6f9f');cyl(25.6,25.6,3,cx,201.5,cz,'#dfe3ea',32);box(14,5,14,cx,205.5,cz,'#dfe3ea');fac(40,170,25,cx,0,cz-20,'#5a7a98',BM.glass);box(40.6,1,25.6,cx,170.5,cz-20,'#3a3f48');
   for(let k=0;k<8;k++)cyl(.9,.9,5,cx,210.5+5*k,cz,k%2?'#f4f4f4':'#e01e2b',8);hit(cx,cz,25,25,248);hit(cx,cz-20,20,12.5,171);reg('Main Tower',248,[cx,cz]);LMI.sky.push([cx,cz,0,21,200,'#3d6f9f'])}
  // 6. Commerzbank Tower: rounded triangle (one side faces real north), sky gardens spiralling up, yellow crown, antenna
  {const L=LM_BY['Commerzbank'],cx=L.x,cz=L.z,H=259,col='#7d9a8a';glassCyl(35,H,3,cx,0,cz,col,Math.PI/3);
   for(const a of[Math.PI/3,Math.PI,5*Math.PI/3]){glassCyl(6,H,12,cx+31*Math.sin(a),0,cz+31*Math.cos(a),col);hit(cx+31*Math.sin(a),cz+31*Math.cos(a),6,6,H)}
   for(let i=0;i<7;i++){const f=i%3*2*Math.PI/3,g=new THREE.BoxGeometry(46,4,.8);g.rotateY(f);g.translate(cx+17.9*Math.sin(f),22+36*i,cz+17.9*Math.cos(f));A(g,'#7fbf6a')}
   for(let k=0;k<3;k++){const f=k*2*Math.PI/3,g=new THREE.BoxGeometry(60,5,1.2);g.rotateY(f);g.translate(cx+17.5*Math.sin(f),H+2.5,cz+17.5*Math.cos(f));A(g,'#e8c84a');const v=f+Math.PI/3;cyl(1,1,9,cx+31*Math.sin(v),H+4.5,cz+31*Math.cos(v),'#e8c84a',8);hit(cx+8.75*Math.sin(f),cz+8.75*Math.cos(f),30,8.75,H,f)}
   cyl(.7,.9,41,cx,H+20.5,cz,'#dfe3ea',8);cyl(1,1,1.4,cx,H+41,cz,'#e01e2b',8);reg('Commerzbank',H+41.7,[cx,cz]);LMI.sky.push([cx,cz,0,16,255,col])}
  // 7. Messeturm: red granite shaft with dark glass strips, cylinder, pyramid
  {const L=LM_BY['Messeturm'],cx=L.x,cz=L.z;fac(41,160,41,cx,0,cz,'#9b4a3a',BM.office);for(const[dx,dz,ry]of[[0,20.8,0],[0,-20.8,0],[20.8,0,Math.PI/2],[-20.8,0,Math.PI/2]])box(7,156,.8,cx+dx,80,cz+dz,'#3a4a5a',BM.glass,ry);
   glassCyl(19,62,16,cx,160,cz,'#9b4a3a');box(42,1.4,42,cx,160.7,cz,'#7a2f24');{const g=new THREE.ConeGeometry(20,35,4);g.rotateY(Math.PI/4);g.translate(cx,239.5,cz);A(g,'#7a2f24')}
   hit(cx,cz,20.5,20.5,257);reg('Messeturm',257,[cx,cz]);LMI.sky.push([cx,cz,0,17,222,'#9b4a3a'])}
  // 8. Deutsche Bank twin towers on a NE-SW diagonal, podium, blue logo boxes with the white slash
  {const L=LM_BY['Deutsche Bank'],cx=L.x,cz=L.z;fac(70,24,60,cx,0,cz,'#5d6b78',BM.office);studs(cx-35,cx+35,cz-30,cz+30,24,'#5d6b78',10);hit(cx,cz,35,30,24);
   for(const[s,h]of[[1,155],[-1,158]]){const tx=cx-s*17,tz=cz+s*17;glassCyl(18.4,h,8,tx,0,tz,'#9fb7cf',Math.PI/8);cyl(18.6,18.6,1.2,tx,h+.6,tz,'#3a3f48',8);
     for(const[nx,nz]of[[0,1],[-1,0]]){box(12,12,.6,tx+nx*17.15,h-14,tz+nz*17.15,'#0018a8',BM.plain,nx?Math.PI/2:0);const g=new THREE.BoxGeometry(1.8,13,.4);g.rotateZ(-.785);if(nx)g.rotateY(Math.PI/2);g.translate(tx+nx*17.5,h-14,tz+nz*17.5);A(g,'#ffffff')}
     hit(tx,tz,17,17,h);LMI.sky.push([tx,tz,0,15,h-4,'#9fb7cf'])}reg('Deutsche Bank',159.2,[cx+17,cz-17])}
  // 9. EZB: Großmarkthalle (15 barrel vaults) along Sonnemannstraße, the twin glass slabs towards the Main, atrium, antenna
  {const L=LM_BY['EZB'],cx=L.x,hz=WP(0,-110)[1],tz=WP(0,-200)[1];fac(220,18,50,cx,0,hz,'#b8693f',BM.brick);
   for(let k=0;k<15;k++){const g=new THREE.CylinderGeometry(7.2,7.2,50,10,1,false,Math.PI/2,Math.PI);g.rotateX(Math.PI/2);g.translate(cx-110+7.33+k*14.67,18,hz);A(g,'#7a8a7a')}
   for(const s of[-1,1]){fac(12,30,12,cx+s*116,0,hz,'#b8693f',BM.brick);box(13,1,13,cx+s*116,30.5,hz,'#7a8a7a');hit(cx+s*116,hz,6,6,31)}hit(cx,hz,110,25,26);
   for(const[s,h]of[[1,185],[-1,165]]){const z=tz+s*16;fac(55,h/2,20,cx,0,z,'#8aa5b8',BM.glass);const g=bxUV(55,h/2,20,12,11);g.rotateY(s*.07);g.translate(cx,h*.75,z);bt.add(colorize(g,C('#8fb0c4')),BM.glass);box(56,1,21,cx,h+.5,z,'#3a3f48',BM.plain,s*.07);hit(cx,z,27.5,10,h+1);LMI.sky.push([cx,z,0,1,h-4,'#8aa5b8',24,9])}
   fac(40,75,12,cx,45,tz,'#b7cbd8',BM.glass);cyl(.6,.6,16,cx-20,194,tz+16,'#dfe3ea',6);cyl(.9,.9,1,cx-20,202,tz+16,'#e01e2b',6);reg('EZB',202.5,[cx-20,tz+16])}
  // 10. Westend Tower ("the Crown"): glass block, open ring and 24 white fins leaning outwards
  {const L=LM_BY['Westend Tower'],cx=L.x,cz=L.z,H=190;fac(45,H,45,cx,0,cz,'#9bb4c8',BM.glass);box(45.6,1,45.6,cx,H+.5,cz,'#dfe3ea');{const g=new THREE.CylinderGeometry(24,24,6,32,1,true);g.translate(cx,H+3,cz);A(g,'#f2f4f6');A(flipG(g.clone()),'#dfe3ea')}
   for(let k=0;k<24;k++){const g=new THREE.BoxGeometry(1,18,2);g.translate(0,9,0);g.rotateX(.1745);g.translate(0,0,22);g.rotateY(k/24*Math.PI*2);g.translate(cx,H,cz);A(g,'#f2f4f6')}
   hit(cx,cz,22.5,22.5,208);reg('Westend Tower',208,[cx+22,cz]);LMI.sky.push([cx,cz,0,20,188,'#9bb4c8'])}
  // 11. Hauptbahnhof: five barrel-vault halls (open, drivable, platforms between the tracks), front building on the real east side
  //     with two drive-through arches, the clock pavilion and the Atlas group
  {const L=LM_BY['Hauptbahnhof'],X0=L.x,Z0=L.z,hx0=X0-72,hx1=X0+98,hm=(hx0+hx1)/2,hl=hx1-hx0,WH=10,R=[15,18,22,18,15];let zc=Z0-88;
   for(const r of R){const z=zc+r;{const g=new THREE.CylinderGeometry(r,r,hl,18,1,true,Math.PI/2,Math.PI);g.rotateX(Math.PI/2);g.rotateY(Math.PI/2);g.translate(hm,WH,z);A(g,'#6f7c80');A(flipG(g.clone().scale(1,1,1)),'#a9c4d0')}
     for(let k=1;k<6;k++){const g=new THREE.TorusGeometry(r+.15,.35,4,18,Math.PI);g.rotateY(Math.PI/2);g.translate(hx0+k*hl/6,WH,z);A(g,'#4f5a60')}
     for(const sd of[1,-1]){const c=new THREE.CircleGeometry(r-.3,16,0,Math.PI);c.rotateY(sd>0?Math.PI/2:-Math.PI/2);c.translate(hx1+sd*.05,WH,z);A(c,'#bcd4de')}zc+=2*r}
   for(const sz of[-1,1]){box(hl,WH,1.5,hm,WH/2,Z0+sz*88,'#d9c7a6');hit(hm,Z0+sz*88,hl/2,.75,WH+22)}
   const pc=(hx0+20+hx1-18)/2,pl=hx1-18-hx0-20;for(const pz of[Z0-58,Z0-22,Z0,Z0+22,Z0+58]){box(pl,1,8,pc,.5,pz,'#c9c2b4');for(const s of[-1,1])box(pl,.06,.35,pc,1.03,pz+s*3.7,'#ffd12c');box(1,1.5,8,hx0+19.5,.75,pz,'#c0392b');
     if(pz!==Z0)for(let x=hx0+28;x<hx1-20;x+=16)cyl(.5,.5,WH-1,x,1+(WH-1)/2,pz,'#5d6870',8);hit(pc,pz,pl/2,4,1)}
   for(const[a,b]of[[-88,-62],[-54,-26],[-18,-4],[4,18],[26,54],[62,88]]){const zm=Z0+(a+b)/2,w=b-a;box(hl-4,.06,w-1,hm,.05,zm,'#7a7066');for(let t=zm-w/2+4;t<zm+w/2-3;t+=7)for(const o of[-.75,.75])box(hl-4,.18,.2,hm,.14,t+o,'#9aa0a6')}
   const fx=hx0-12.5;for(const[a,b]of[[-100,-49],[-31,31],[49,100]]){box(25,25,b-a,fx,12.5,Z0+(a+b)/2,'#d9c7a6');for(let t=Z0+a+4;t<Z0+b-3;t+=6.5){if(Math.abs(t-Z0)<21)continue;for(const y of[6,15])box(.5,y>10?5:6,3,hx0-25.2,y,t,'#3a4a5a');const c=new THREE.CircleGeometry(1.5,8,0,Math.PI);c.rotateY(-Math.PI/2);c.translate(hx0-25.46,17.5,t);A(c,'#3a4a5a')}hit(fx,Z0+(a+b)/2,12.5,(b-a)/2,25)}
   for(const s of[-1,1]){box(25,12,18,fx,19,Z0+s*40,'#d9c7a6');const c=new THREE.CircleGeometry(8,14,0,Math.PI);c.rotateY(-Math.PI/2);c.translate(hx0-25.06,13.4,Z0+s*40);A(c,'#3a4a5a');box(.8,1.2,19,hx0-25.4,12.6,Z0+s*40,'#b8a888')}
   box(26,1,201,fx,25.5,Z0,'#b8a888');box(40,40,40,hx0-20,20,Z0,'#d9c7a6');for(const y of[8,19])for(const o of[-12,-4,4,12])box(.5,7,3.4,hx0-40.2,y,Z0+o,'#3a4a5a');box(.6,1,41,hx0-40.2,24.5,Z0,'#b8a888');roof(40,40,6,hx0-20,40,Z0,'#4b4f58');hit(hx0-20,Z0,20,20,46);
   {const c=new THREE.CircleGeometry(4.5,24);c.rotateY(-Math.PI/2);c.translate(hx0-40.06,30,Z0);A(c,'#f4f4f0');box(.2,3.4,.4,hx0-40.15,31.4,Z0,'#2a2a2a');box(.2,.4,2.6,hx0-40.15,30,Z0+1,'#2a2a2a')}
   {const ax=hx0-20,g='#4f8a6a',Y=44;box(3.2,4,2,ax,Y+2,Z0,g);for(const s of[-1,1]){box(1.2,3,1.4,ax,Y-1.5,Z0+s*.8,g);box(1,3.2,1,ax,Y+5,Z0+s*2,g)}cyl(.9,.9,1.4,ax,Y+4.8,Z0,g,8);const sp=new THREE.SphereGeometry(3,14,10);sp.translate(ax,Y+9.4,Z0);A(sp,g)}
   reg('Hauptbahnhof',53,[hx0-20,Z0],[-1262,-450]);LMI.hbf={x0:hx0,x1:hx1,z0:Z0-88,z1:Z0+88}}
  // 13. Festhalle: stone base with corner pavilions, drum, ribbed dome, lantern
  {const L=LM_BY['Festhalle'],x=L.x,z=L.z;fac(120,18,110,x,0,z,'#e6d6b8',BM.office);for(const sx of[-1,1])for(const sz of[-1,1]){fac(16,24,16,x+sx*52,0,z+sz*47,'#e6d6b8',BM.office);roof(16,16,5,x+sx*52,24,z+sz*47,'#86a0a0')}
   cyl(38,38,10,x,23,z,'#d8c8a8',32);{const g=new THREE.SphereGeometry(38,32,12,0,Math.PI*2,0,Math.PI/2);g.scale(1,.55,1);g.translate(x,28,z);A(g,'#86a0a0')}
   for(let k=0;k<16;k++){const a=k/16*Math.PI*2,P=[];for(let i=0;i<=5;i++){const f=i/5*Math.PI/2*.92;P.push([Math.cos(f)*38.5,28+Math.sin(f)*21.3])}for(let i=0;i<5;i++){const[r0,y0]=P[i],[r1,y1]=P[i+1],L2=Math.hypot(r1-r0,y1-y0),g=new THREE.BoxGeometry(1,1,L2);g.rotateX(-Math.atan2(y1-y0,r1-r0));g.translate(0,(y0+y1)/2,(r0+r1)/2);g.rotateY(a);g.translate(x,0,z);A(g,'#6f8a8a')}}
   cyl(4,5,8,x,53,z,'#86a0a0',12);{const g=new THREE.ConeGeometry(4.6,5,12);g.translate(x,59.5,z);A(g,'#6f8a8a')}hit(x,z,60,55,62);reg('Festhalle',62,[x,z])}
  // 14. Henninger Turm on the Sachsenhäuser Berg: shaft, drum with the red band and the name, antenna
  {const L=LM_BY['Henninger Turm'],cx=L.x,cz=L.z,gy=groundY(cx,cz)-.3;cyl(9.6,9.6,100,cx,gy+50,cz,'#efe8d6',12);cyl(13,16,3,cx,gy+98.5,cz,'#efe8d6',24);cyl(16,16,18,cx,gy+109,cz,'#efe8d6',24);cyl(16.25,16.25,4,cx,gy+112,cz,'#c0302a',24);cyl(17,17,1.6,cx,gy+118.8,cz,'#dfe3ea',24);
   {const[c,g]=cv(1024,128);g.fillStyle='#c0302a';g.fillRect(0,0,1024,128);g.fillStyle='#fff';g.font='bold 92px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('HENNINGER',512,68);const t=tex(c);t.wrapS=THREE.RepeatWrapping;t.repeat.set(3,1);KEEP_TEX.add(t);
    const m=new THREE.MeshStandardMaterial({map:t,emissiveMap:t,emissive:0xffffff,emissiveIntensity:.25,roughness:.6});const gg=new THREE.CylinderGeometry(16.4,16.4,3.6,48,1,true);gg.translate(cx,gy+112,cz);bt.add(gg,m)}
   cyl(.5,.8,22,cx,gy+130.6,cz,'#dfe3ea',6);hit(cx,cz,9.6,9.6,gy+142);reg('Henninger Turm',gy+141.6,[cx,cz]);LMI.sky.push([cx,cz,gy,8,100,'#efe8d6'])}
  // 15. Goethe-Haus: yellow town house, red sandstone ground floor, slate roof with dormers; Hauptwache; Eschenheimer Turm; Euro
  {const L=LM_BY['Goethe-Haus'],x=L.x,z=L.z;fac(18,20,15,x,0,z,'#e8d9b0',BM.gable);box(18.3,4,15.3,x,2,z,'#a85a44');roof(18,15,7,x,20,z,'#4b4f58');for(let k=-1;k<=1;k++){box(2.4,2.6,2.2,x-5,21.8,z+k*4.5,'#e8d9b0');roof(2.4,2.6,1.4,x-5,23.1,z+k*4.5,'#4b4f58',Math.PI/2)}hit(x,z,9,7.5,27);reg('Goethe-Haus',27,[x,z])}
  {const L=LM_BY['Hauptwache'],x=L.x,z=L.z;fac(30,9,14,x,0,z,'#c0634a',BM.office);roof(14,30,5,x,9,z,'#4b4f58',Math.PI/2);cyl(1.2,1.4,2,x,14.5,z,'#5f9e8f',8);{const g=new THREE.ConeGeometry(1.3,2.4,8);g.translate(x,16.7,z);A(g,'#5f9e8f')}hit(x,z,15,7,18);reg('Hauptwache',17.9,[x,z])}
  {const L=LM_BY['Eschenheimer Turm'],x=L.x,z=L.z;cyl(6,6.4,40,x,20,z,'#c9b28a');box(13.2,1.2,13.2,x,40.6,z,'#b8a078');for(const sx of[-1,1])for(const sz of[-1,1]){cyl(1.4,1.4,5,x+sx*5,43.5,z+sz*5,'#c9b28a',8);const g=new THREE.ConeGeometry(1.7,4,8);g.translate(x+sx*5,48,z+sz*5);A(g,'#4b4f58')}{const g=new THREE.ConeGeometry(5.4,10,12);g.translate(x,46,z);A(g,'#4b4f58')}hit(x,z,6.4,6.4,51);reg('Eschenheimer Turm',51,[x,z])}
  {const L=LM_BY['Euro-Skulptur'],x=L.x,z=L.z,E=OB_euroBuild(bt,BM,x,z);hit(x,z,E.hw,E.hd,E.gy+14);reg('Euro-Skulptur',E.gy+14,[x,z+0])}
  // Brickegickel: the golden rooster on the Alte Brücke
  {const b=BRIDGES.find(q=>q.id==='alte');if(b){const[x,z]=deckPt(b,0,b.w/2+.7),y=deckY(b,0)||0;cyl(.15,.15,6,x,y+3,z,'#3a3f48',6);box(1.3,1,.5,x,y+6.5,z,'#ffc21a');box(.5,.8,.4,x+.7,y+7.2,z,'#ffc21a');box(.3,1.2,.6,x-.7,y+7.1,z,'#ffc21a')}}}
// Eiserner Steg: riveted trusses (two spans per side: arched top chord, verticals every ~6 m, diagonals), stair towers, love locks,
// rail colliders in segments (y0 = deck - 1.6, so boats on the Main pass underneath)
function stegBuild(b,bt,BM){const V=new THREE.Vector3(),O=new THREE.Vector3(),up=new THREE.Vector3(0,1,0),Mx=new THREE.Matrix4(),rust=new THREE.Color('#7b2d26');
  const P3=(a,c,y)=>{const[x,z]=deckPt(b,a,c);return[x,y,z]},dy=a=>Math.max(0,deckY(b,a)??0);
  const beam=(p,q,t)=>{const dx=q[0]-p[0],dyy=q[1]-p[1],dz=q[2]-p[2],L=Math.hypot(dx,dyy,dz);let g;if(Math.abs(dx)+Math.abs(dz)<1e-3)g=new THREE.BoxGeometry(t,L,t);else{g=new THREE.BoxGeometry(t,t,L);Mx.lookAt(V.set(dx,dyy,dz),O.set(0,0,0),up);g.applyMatrix4(Mx)}g.translate((p[0]+q[0])/2,(p[1]+q[1])/2,(p[2]+q[2])/2);bt.add(colorize(g,rust),BM.plain)};
  let topY=0;for(const sd of[-1,1]){const c=sd*(b.w/2+.45);for(const k of[-1,1]){const a0=k*1.5,a1=k*(b.half-3),N=12,T=[],B=[];for(let i=0;i<=N;i++){const a=a0+(a1-a0)*i/N,y=dy(a)+1.2,yt=y+1.5+8.5*Math.sin(Math.PI*i/N);B.push(P3(a,c,y));T.push(P3(a,c,yt));topY=Math.max(topY,yt)}
    for(let i=0;i<N;i++){beam(T[i],T[i+1],.55);beam(B[i],T[i+1],.3)}for(let i=1;i<N;i++)beam(B[i],T[i],.32)}}
  const yaw=Math.atan2(b.ux,b.uz);for(const k of[-1,1])for(const sd of[-1,1]){const[x,z]=deckPt(b,k*(b.hw+2),sd*(b.w/2+4));stegTower(bt,BM,x,z,yaw);hubAddB({x,z,hw:3,hd:3,h:13,ry:yaw})}
  const r=mul(1105),LC=['#e8302a','#ffd12c','#2a7ad8','#3aa04a','#ff7ac0','#ff7a1c','#c0c0c0'];for(let i=0;i<90;i++){const sd=r()<.5?-1:1,a=(r()*2-1)*b.hw*.9,[x,z]=deckPt(b,a,sd*(b.w/2+.3));bt.add(cbox(.32,.4,.22,x,dy(a)+.6+r()*.6,z,LC[Math.floor(r()*LC.length)],yaw),BM.plain)}
  // rail colliders: 14 oriented segments per side (local x along the deck)
  const ry=Math.atan2(-b.uz,b.ux),NS=14;for(const sd of[-1,1])for(let i=0;i<NS;i++){const a0=-b.half+2*b.half*i/NS,a1=a0+2*b.half/NS,am=(a0+a1)/2,[x,z]=deckPt(b,am,sd*(b.w/2+.3)),lo=Math.min(dy(a0),dy(a1)),hi=Math.max(dy(a0),dy(a1));hubAddB({x,z,hw:b.half/NS,hd:.35,h:hi+1.8,ry,y0:lo-1.6})}
  const[tx,tz]=deckPt(b,b.half/2,b.w/2+.45);LM_BY['Eiserner Steg']={id:'steg',name:'Eiserner Steg',x:b.cx,z:b.cz,r:30,h:topY+.3,top:[tx,tz],bridge:b}}
// v88x: Steg stair tower (was a plain 6×12×6 beige box, "windowless pillar"): red Main-sandstone body, light quoins + cornice,
// a door and two windows with sills on every face, rust hip roof + finial. Same 6×6 footprint/collider, merged into the same batch (0 draws)
function stegTower(bt,BM,x,z,yaw){const c=Math.cos(yaw),s=Math.sin(yaw),P=(lx,lz)=>[x+lx*c+lz*s,z-lx*s+lz*c],add=g=>bt.add(g,BM.plain),Lt='#e6dac2',Gl='#26405c';
  add(cbox(6.5,1.1,6.5,x,.55,z,'#8f8474',yaw));add(cbox(6,11.4,6,x,6.6,z,'#b5634b',yaw));add(cbox(6.4,.45,6.4,x,8.1,z,Lt,yaw));add(cbox(6.5,.5,6.5,x,12.05,z,Lt,yaw));
  for(const a of[-1,1])for(const b of[-1,1]){const[px,pz]=P(a*2.75,b*2.75);add(cbox(.75,11,.75,px,6.6,pz,Lt,yaw))}
  for(const f of[0,1,2,3]){const ax=f<2,sg=f%2?-1:1,F=(t,y,w,h,d,col)=>{const[px,pz]=ax?P(sg*(3+d/2),t):P(t,sg*(3+d/2));add(ax?cbox(d,h,w,px,y,pz,col,yaw):cbox(w,h,d,px,y,pz,col,yaw))};
    F(0,2.3,1.7,2.6,.16,'#5a3420');F(0,3.75,2.1,.3,.3,Lt);
    for(const y of[5.9,10.1]){F(0,y,1.15,1.9,.14,Gl);F(0,y-1.08,1.5,.2,.36,Lt);F(0,y+1.08,1.5,.24,.24,Lt)}}
  const r=new THREE.ConeGeometry(4.75,3.2,4,1);r.rotateY(Math.PI/4+yaw);r.translate(x,13.9,z);add(colorize(r,new THREE.Color('#7b2d26')));add(ccyl(.14,.14,1.4,x,15.9,z,'#ffd12c',6));add(ccyl(.3,.3,.3,x,16.7,z,'#ffd12c',8))}
// far skyline: hexagonal prisms hidden inside the real towers (never culled), so the skyline still reads beyond the tile cull range
function skylineBuild(grp){const L=LMI.sky;if(!L.length)return;const g=new THREE.CylinderGeometry(1,1,1,6);g.translate(0,.5,0);const im=new THREE.InstancedMesh(g,new THREE.MeshStandardMaterial({roughness:.55,metalness:.25}),L.length),M4=new THREE.Matrix4(),q=new THREE.Quaternion(),P=new THREE.Vector3(),Sc=new THREE.Vector3(),c=new THREE.Color();
  L.forEach(([x,z,y,r,h,col,sx,sz],i)=>{M4.compose(P.set(x,y,z),q,Sc.set(sx||r,h,sz||r));im.setMatrixAt(i,M4);im.setColorAt(i,c.set(col))});im.frustumCulled=false;im.userData.sky=1;grp.add(im);HUB.sky=im}
// low-detail Kenney towns outside the city box (Offenbach, Höchst, Bad Vilbel): instanced, solid
function outerTownsBuild(grp){const r=mul(5150),T=['low-detail-building-a','low-detail-building-c','low-detail-building-e','low-detail-building-g','low-detail-building-wide-a'],TC=['#ffffff','#ffe8d8','#e8f0ff','#fff4d0','#f0e8ff'],ti={};let n=0;
  for(const[x0,x1,z0,z1]of[[-4700,-3700,-1500,-1000],[3800,4800,-1250,-700],[-700,700,3480,3900]])for(let x=x0;x<x1;x+=44)for(let z=z0;z<z1;z+=44){if(r()<.45)continue;const px=x+(r()-.5)*10,pz=z+(r()-.5)*10;if(!outerFree(px,pz)||!outerFree(px+12,pz+12)||!outerFree(px-12,pz-12))continue;const nm=T[Math.floor(r()*T.length)],sc=18+r()*8,[w,h,d]=kmSize(nm,sc),ry=Math.floor(r()*4)*Math.PI/2;
    (ti[nm]=ti[nm]||new TInst(kmGeo(nm,1),kmMat('com'),1000)).add(px,groundY(px,pz)-.1,pz,ry,sc,TC[Math.floor(r()*TC.length)]);hubAddB({x:px,z:pz,hw:w/2,hd:d/2,h,ry});n++}
  for(const k in ti)for(const im of ti[k].flush(grp))im.userData.ks=26;HUB.towns=n}
// photo spot for a landmark: the nearest clear street point outside the footprint (no junction, no water, no collider)
function lmPhoto(L){if(L.photo)return L.photo;if(L.ph&&!roamHit(L.ph[0],L.ph[1],5)&&!inRiver(L.ph[0],L.ph[1]))return L.photo=L.ph;const min=Math.max(28,L.r*.65),kx=Math.floor(L.x/64),kz=Math.floor(L.z/64);let best=null,bd=1e9;
  for(let a=-4;a<=4;a++)for(let c=-4;c<=4;c++){const C2=CITY_G.get((kx+a)*100000+kz+c);if(!C2)continue;for(let j=0;j<C2.length;j+=2){const S=CITY_S[C2[j]],p=S.pts[C2[j+1]],d=Math.hypot(p.x-L.x,p.z-L.z);if(d<min||d>=bd||d>300)continue;
    if(JUNC.some(J=>Math.hypot(J.x-p.x,J.z-p.z)<J.r+12)||inRiver(p.x,p.z,-4)||roamHit(p.x,p.z,4)||onAnyDeck(p.x,p.z))continue;bd=d;best=[p.x,p.z]}}
  // a plaza next to the landmark gives the classic view (Römerberg, Paulsplatz, Opernplatz, Bahnhofsvorplatz...)
  for(const P of PLAZAS){const px=(P.x0+P.x1)/2,pz=(P.z0+P.z1)/2,d=Math.hypot(px-L.x,pz-L.z);if(d<min||d>Math.max(L.r*2.4,110)||d>=bd+40)continue;for(const[ox,oz]of[[0,0],[.25,0],[-.25,0],[0,.25],[0,-.25]]){const x=px+ox*(P.x1-P.x0),z=pz+oz*(P.z1-P.z0);if(roamHit(x,z,5)||Math.hypot(x-L.x,z-L.z)<min)continue;best=[x,z];bd=d-40;break}}
  return L.photo=best||rfSnap(L.x,L.z,260).slice(0,2)}
// Athens: Acropolis rim walls (N, E and S rims, the west apron stays open for the access road), low kerb walls on the outer side of the
// Lycabettus spiral, ground patches on the landmark reservations (Stage C builds there), and the backdrop mountains
function athTerrainBuild(bt,BM,M,grp,G){const A=HILL_BY.akro;
  if(A&&OC.ring0){const N=64,pt=t=>{const u=Math.sin(t),v=Math.cos(t),de=(u*A.rx*.985)*A.ca+(v*A.rz*.985)*A.sa,dn=-(u*A.rx*.985)*A.sa+(v*A.rz*.985)*A.ca;return[A.cx-de*A.sx,A.cz+dn*A.sz,u]};
    for(let k=0;k<N;k++){const t0=k/N*Math.PI*2,t1=(k+1)/N*Math.PI*2,[x0,z0,u0]=pt(t0),[x1,z1,u1]=pt(t1);if((u0+u1)/2<-.42)continue;const cx=(x0+x1)/2,cz=(z0+z1)/2,L=Math.hypot(x1-x0,z1-z0)+2.2,ry=Math.atan2(-(z1-z0),x1-x0);
      bt.add(cbox(L,4.2,1.8,cx,A.H+.4,cz,'#d8c9a8',ry),BM.plain);bt.add(cbox(L,.5,2.2,cx,A.H+2.55,cz,'#c8b894',ry),BM.plain);hubAddB({x:cx,z:cz,hw:L/2,hd:1.1,h:A.H+2.5,ry})}}
  for(const S of CITY_S){if(S.r.id!=='lyka')continue;const H=HILL_BY.lyka,P=S.pts;for(let i=6;i<P.length-3;i+=2){const p=P[i];if(p.y<6)continue;const ox=p.x-H.cx,oz=p.z-H.cz,sd=(ox*p.tz-oz*p.tx)>0?1:-1,o=S.r.w/2+1.2,x=p.x+p.tz*sd*o,z=p.z-p.tx*sd*o,ry=Math.atan2(-p.tz,p.tx);
      bt.add(cbox(17,1.1,.7,x,p.y+.55,z,i%8<2?'#e8e2d4':'#f4f0e6',ry),BM.plain);hubAddB({x,z,hw:8.5,hd:.35,h:p.y+1.3,y0:p.y-2.5,ry})}}
  for(const L of LMX){if(/^(g_|garaz)/.test(L.id))continue;const ru=/hephaestus|stoa|hadrianlib|olympieion|arch|museum|stadium/.test(L.id),s2=Math.min(L.r*1.5,150);if(hillH(L.x,L.z)>.5)continue;G(s2,s2,L.x,L.z,.011,ru?M.grass:M.cobble,s2/14,s2/14);ZONES.push({t:ru?'grass':'plaza',x0:L.x-s2/2,x1:L.x+s2/2,z0:L.z-s2/2,z1:L.z+s2/2,name:L.name})}
  HUB.ridge=athRidge();grp.add(HUB.ridge)}
// backdrop mountains: low-poly silhouettes on a ring 2300 m around the camera (inside the far plane), at their real bearings and apparent
// heights from the city centre; fogless, pre-hazed vertex colours (violet at the ridge, warm haze at the foot)
function athRidge(){const g0=new THREE.Group(),D=2300,r=mul(3301),pos=[],col=[],top=new THREE.Color('#8f8aa8'),low=new THREE.Color('#d9d2c6'),c=new THREE.Color();
  for(const[b0,b1,ang,nm]of[[88,158,6.2,'Ymittos'],[18,48,3.6,'Penteli'],[318,22,3.8,'Parnitha'],[250,300,2.8,'Aigaleo']]){const B1=b1<b0?b1+360:b1,n=Math.ceil((B1-b0)/1.5),Hm=D*Math.tan(ang*Math.PI/180);
    let prev=null;for(let i=0;i<=n;i++){const t=i/n,b=(b0+(B1-b0)*t)*Math.PI/180,env=Math.sin(Math.PI*Math.min(1,t*1.15))**.7,h=Hm*(.35+.65*env)*(.82+r()*.3),x=-Math.sin(b)*D,z=Math.cos(b)*D,cur=[x,z,h];
      if(prev){for(const[p,q]of[[prev,cur]]){const v=[[p[0],-40,p[1],0],[q[0],-40,q[1],0],[q[0],q[2],q[1],1],[p[0],-40,p[1],0],[q[0],q[2],q[1],1],[p[0],p[2],p[1],1]];for(const w of v){pos.push(w[0],w[1],w[2]);c.copy(low).lerp(top,w[3]?.85:0);col.push(c.r,c.g,c.b)}}}prev=cur}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
  const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({vertexColors:true,fog:false,side:THREE.DoubleSide}));m.frustumCulled=false;m.renderOrder=-1;m.userData.ridge=1;g0.add(m);return g0}
let ATHGT=null;function athGrassTex(){if(ATHGT)return ATHGT;const Z=256,[c,g]=cv(Z,Z),r=mul(707);g.fillStyle='#b4ad78';g.fillRect(0,0,Z,Z);for(let i=0;i<3200;i++){const v=r();g.fillStyle=v<.4?'rgba(120,130,70,.35)':v<.75?'rgba(205,190,130,.35)':'rgba(150,120,80,.25)';g.fillRect(r()*Z,r()*Z,2,3)}ATHGT=tex(c);KEEP_TEX.add(ATHGT);return ATHGT}
function athMarbleTex(){const Z=256,[c,g]=cv(Z,Z),r=mul(708);g.fillStyle='#ece5d8';g.fillRect(0,0,Z,Z);for(let y=0;y<Z;y+=64)for(let x=(y/64%2)*32;x<Z+64;x+=64){const v=226+r()*22|0;g.fillStyle=`rgb(${v},${v-5},${v-14})`;g.fillRect(x+1,y+1,62,62)}g.strokeStyle='rgba(150,140,120,.25)';g.lineWidth=1;for(let i=0;i<14;i++){g.beginPath();g.moveTo(r()*Z,r()*Z);g.lineTo(r()*Z,r()*Z);g.stroke()}const t=tex(c);KEEP_TEX.add(t);return t}
// ---------- Athens buildings from the real street network (raster placement, instanced per tile)
const ATH_STY={plaka:{k:[['plaka',.88],['neo',1]],sb:1.5,gap:[.1,.8],il:6},old:{k:[['neo',.5],['poly',1]],sb:2.5,gap:[.1,1],il:9},kolon:{k:[['poly',.66],['neo',1]],sb:3.5,gap:[.2,1.2],il:9},
  poly:{k:[['poly',.88],['neo',1]],sb:3.5,gap:[.2,1.2],il:9},town:{k:[['poly',.72],['villa',1]],sb:4,gap:[1,4],il:12},villa:{k:[['villa',1]],sb:8,gap:[9,18],il:18},outer:{k:[['poly',.86],['neo',1]],sb:3.5,gap:[1.5,5],il:12}};
const ATH_DS={Plaka:'plaka',Anafiotika:'plaka',Monastiraki:'old',Psyrri:'old',Thiseio:'old',Kerameikos:'old',Gazi:'old',Metaxourgeio:'old',Petralona:'old',Kolonaki:'kolon',Syntagma:'kolon',Evangelismos:'kolon',
  'Palaio Psychiko':'villa',Filothei:'villa','Neo Psychiko':'town',Chalandri:'town','Papagou · Cholargos':'town',Marousi:'town',Tourkovounia:'town'};
const ATH_TA=(RF.tierA||[]).map(r=>rfRect(r)),athInA=(x,z)=>ATH_TA.some(R=>inR(R,x,z));
const ATH_SC=new Map();function athStyleAt(x,z){const k=Math.floor(x/50)*100000+Math.floor(z/50);let v=ATH_SC.get(k);if(v===undefined){v=athStyle0(x,z);ATH_SC.set(k,v)}return v}
function athStyle0(x,z){const d=districtAt(x,z),s=ATH_DS[d];if(s)return s;if(inCity(x,z))return 'poly';return RW(x,z)[1]>2000?'town':'outer'}
function athSpecK(k,sty,rnd){const r=(a,b)=>a+rnd()*(b-a);if(k==='plaka')return{k,w:r(6,10),d:r(8,11),fl:2+(rnd()<.45?1:0),fh:3.3};if(k==='neo')return{k,w:r(11,17),d:r(11,15),fl:sty==='plaka'?2:2+Math.floor(rnd()*(sty==='old'?2:3)),fh:3.3};
  if(k==='villa')return{k,w:r(11,17),d:r(9,13),fl:rnd()<.7?2:1,fh:3.4};const lo=sty==='old'||sty==='town'||sty==='outer'?3:5,hi=sty==='old'?5:sty==='town'?4:sty==='outer'?6:sty==='kolon'?8:7;
  return{k:'poly',w:r(12,21),d:r(12,16),fl:lo+Math.floor(rnd()*(hi-lo+1)),fh:3.1}}
const ATH_COL={poly:['#f4f1ea','#efe3c8','#f2d9b0','#e9e4dc','#f3dcd2','#ffffff','#f6f6f2','#ece8dc'],neo:['#efe0bf','#f2d7a0','#e8cfa6','#f0e6d2','#e6c99a','#f3e9d8','#e9d2b8'],plaka:['#f7f3ea','#f3e3c3','#e8c9a0','#d9e6ef','#f4d8c8','#ffffff','#f1e6b8'],villa:['#ffffff','#fbf6ea','#f6eedc','#fff8f0','#f2efe8']};
// unit geometries (y from 0 to 1, colour attribute white so the instance colours apply)
function athUnitGeos(){const wc=g=>{const n=g.attributes.position.count;g.setAttribute('color',new THREE.Float32BufferAttribute(new Array(n*3).fill(1),3));return g};
  const box=new THREE.BoxGeometry(1,1,1).translate(0,.5,0),nb=box.clone(),ix=Array.from(nb.index.array);ix.splice(18,6);nb.setIndex(ix);
  const tri=(P,N)=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(N,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(new Array(P.length/3*2).fill(.02),2));return wc(g)};
  const l=Math.hypot(1,.5),pr=tri([-.5,0,.5,.5,0,.5,0,1,.5, .5,0,-.5,-.5,0,-.5,0,1,-.5, -.5,0,-.5,-.5,0,.5,0,1,.5, -.5,0,-.5,0,1,.5,0,1,-.5, .5,0,.5,.5,0,-.5,0,1,-.5, .5,0,.5,0,1,-.5,0,1,.5],
    [0,0,1,0,0,1,0,0,1, 0,0,-1,0,0,-1,0,0,-1, ...Array(6).fill([-1/l,.5/l,0]).flat(), ...Array(6).fill([1/l,.5/l,0]).flat()]);
  const bal=tri([-.5,0,1,.5,0,1,.5,1,1, -.5,0,1,.5,1,1,-.5,1,1, -.5,0,0,.5,0,1,-.5,0,1, -.5,0,0,.5,0,0,.5,0,1],[...Array(6).fill([0,0,1]).flat(),...Array(6).fill([0,-1,0]).flat()]);
  return{body:wc(nb),box:wc(box),prism:pr,bal}}
// facade material for instanced bodies: UVs scaled by the instance size (12 m per texture repeat across, 4 floors up)
function athIM(base,fh){const m=base.clone();m.onBeforeCompile=sh=>{sh.vertexShader=sh.vertexShader.replace('#include <uv_vertex>','#include <uv_vertex>\n#ifdef USE_INSTANCING\n{vec3 iS=vec3(length(instanceMatrix[0].xyz),length(instanceMatrix[1].xyz),length(instanceMatrix[2].xyz));vec2 f=abs(normal.x)>.5?vec2(iS.z,iS.y):abs(normal.z)>.5?vec2(iS.x,iS.y):vec2(0.);vec2 q=uv*f/vec2(12.,'+(fh*4).toFixed(2)+');\n#ifdef USE_MAP\nvMapUv=q;\n#endif\n#ifdef USE_EMISSIVEMAP\nvEmissiveMapUv=q;\n#endif\n}\n#endif')};m.customProgramCacheKey=()=>'athIM'+fh;return m}
