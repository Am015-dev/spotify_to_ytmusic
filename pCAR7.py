# CAR7: mission vehicles in LEGO (Hilde's tow truck, Kaiser's car and every other M1_car): real wheels in arches, opaque cabins,
# standing on the road; the player is pushed out of their footprint so you stop beside them, never inside. Needs pCAR6.
exec(open('P.py').read())
if 'CR_tow' in s:
    print('OK');raise SystemExit
assert 'CR_cab' in s, 'apply pCAR6 first'
JS=r'''
function CR_tow(col){const A=[],B=col,K=CR_K,CH='#d8dde4',add=(t,x,z,r,c,y)=>A.push([t,x,z,r,c,y]),sym=(t,x,z,r,c,y)=>{CR_reg(t);const fw=(r%2?GB_PC[t].d:GB_PC[t].w);add(t,x,z,r,c,y);if(x!==-x-fw)add(t,-x-fw,z,(4-r)%4,c,y)},wy=(.12-GB_PC.wL.h*GB_PH/2)/GB_PH;
 add('T8x22',-4,-11,0,K,0);for(const z of[-10,4])sym('arch',-4,z,0,B,0),sym('wL',-4,z,0,K,wy);add('bump',-4,-12,0,CH,1);sym('hl',-4,-11,0,B,1);add('B6x1',-3,-11,0,K,1);
 add('B8x4',-4,-11,0,B,4);add('T8x4',-4,-11,0,B,7);add('B8x5',-4,-6,0,B,1);sym('B1x5',-4,-6,0,B,4);
 add('s21',-3,-6,0,B,7);add('s21',2,-6,0,B,7);add('s22',-2,-6,0,'#1d2630',7);add('s22',0,-6,0,'#1d2630',7);sym('B1x3',-4,-4,0,'#1d2630',7);add('B6x3',-3,-4,0,B,7);sym('P1x5',-4,-6,0,B,10);add('P6x5',-3,-6,0,B,10);
 add('T8x5',-4,-6,0,B,11);add('bar',-2,-4,0,K,12);sym('stack',-4,-2,0,CH,4);
 add('T8x10',-4,-1,0,'#6c6e68',1);sym('B1x10',-4,-1,0,B,2);add('B2x2',-1,5,0,K,2);add('B2x2',-1,5,0,K,5);
 const boom=[['B1x6',-1,1,0,'#fac80a',8],['B1x6',0,1,0,'#fac80a',8]];for(const e of boom)add(...e);add('B2x1',-1,7,0,K,5);add('B2x1',-1,7,0,K,8);
 sym('tl',-4,9,2,B,2);add('T8x1',-4,9,0,K,1);return A}
const CR_NPCS=[];
function CR_npcVeh(geo,col){let A;if(geo==='truck')A=CR_tow(col);else if(geo==='sedan-sports')A=CR_cab(CR_car({body:col,acc:'#1b2a34',wing:CR_K}));else if(geo==='van'||geo==='delivery')A=CR_van({body:col});else A=CR_cab(CR_car({body:col,acc:'#1b2a34',noWing:1}));
 const br=A.map(([t,x,z,r,c,y])=>({t:t==='drv'?'drvR':t,x,z,y,r:r%4,m:0,c})).filter(b=>!['drvR','stw','mir','lp','pipes','flag'].includes(b.t));
 const G=GB_geo(br,null),g=new THREE.Group(),h=new THREE.Group();g.add(h);const mk=(geo2,mat)=>{const o=new THREE.Mesh(geo2,mat);o.castShadow=true;h.add(o);return o};
 if(G.m)mk(G.m,GB_MAT);if(G.l)mk(G.l,GB_LMAT);if(G.g)mk(G.g,CR_GM).renderOrder=2;for(const w of G.w||[]){const o=mk(CR_wheel(w.t),GB_MAT);o.position.copy(w.o);o.userData.r=CR_WH[w.t].r;CR_spin(o)}
 const bb=new THREE.Box3().setFromObject(h),s=(geo==='truck'?2.5:2.05)/(bb.max.x-bb.min.x);h.scale.setScalar(s);h.rotation.y=Math.PI;h.position.y=-bb.min.y*s+.03;
 g.userData.crHalf={L:(bb.max.z-bb.min.z)*s/2,W:(bb.max.x-bb.min.x)*s/2};g.rotation.order='YXZ';g.userData.crH=h;g.userData.crY=h.position.y;CR_NPCS.push(g);return g}
// sit on all four tyres: pitch/roll to the ground under the wheels, centre height = mean of the four contacts
function CR_npcTilt(g){const H=g.userData.crHalf,h=g.rotation.y,fx=Math.sin(h),fz=Math.cos(h),dl=H.L*.72,dw=H.W*.8,x=g.position.x,z=g.position.z,y0=g.position.y+4,G=(a,b)=>groundAt(x+fx*a+fz*b,z+fz*a-fx*b,y0),
 yF=(G(dl,dw)+G(dl,-dw))/2,yB=(G(-dl,dw)+G(-dl,-dw))/2,yR=(G(dl,dw)+G(-dl,dw))/2,yL=(G(dl,-dw)+G(-dl,-dw))/2,yC=groundAt(x,z,y0);
 g.rotation.x=clamp(-Math.atan2(yF-yB,2*dl),-.25,.25);g.rotation.z=clamp(Math.atan2(yR-yL,2*dw),-.25,.25);g.userData.crH.position.y=g.userData.crY+clamp((yF+yB)/2-yC,-.5,.5)}
// keep the player out of mission vehicles: push out of the oriented footprint and bleed speed
function CR_npcPush(){if(typeof RO==='undefined'||!RO.on)return;for(let i=CR_NPCS.length-1;i>=0;i--){const g=CR_NPCS[i];if(!g.parent){CR_NPCS.splice(i,1);continue}if(!g.visible)continue;CR_npcTilt(g);const H=g.userData.crHalf,h=g.rotation.y,fx=Math.sin(h),fz=Math.cos(h),dx=RO.x-g.position.x,dz=RO.z-g.position.z;
 if(Math.abs(RO.y-g.position.y)>3)continue;const al=dx*fx+dz*fz,sd=dx*fz-dz*fx,pl=H.L+1.3-Math.abs(al),ps=H.W+1.05-Math.abs(sd);if(pl<=0||ps<=0)continue;
 if(ps<pl){const k=Math.sign(sd)||1;RO.x+=fz*k*ps;RO.z-=fx*k*ps}else{const k=Math.sign(al)||1;RO.x+=fx*k*pl;RO.z+=fz*k*pl}RO.v*=.6}}
'''
i=s.index('const GB_PRE=[')
s=s[:i]+JS+'\n'+s[i:]
R("function M1_car(geo,col,sc,trim){const mat=kmMat('car').clone();","function M1_car(geo,col,sc,trim){if(!/boat/.test(geo))try{const g=CR_npcVeh(geo,col);RO.grp.add(g);return g}catch(e){console.warn('CR npc',e)}const mat=kmMat('car').clone();")
R("function hubTrafficStep(dt){","function hubTrafficStep(dt){CR_npcPush();")
save()
print('OK')
