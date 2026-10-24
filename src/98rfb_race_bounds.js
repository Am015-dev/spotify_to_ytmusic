// racefree-r24l: race freedom runtime (lazy chunk, src/LAZY): rival cars planted on their wheels (TK_pY, used by src/98tk_city_duel.js tkStep and src/70_roam_world.js),
// soft course bounds for city races (TK_near, TK_bd, called from tkStep). GO race/racefree (src/99crf_racefree_go.js).
// Alex, beta.160: "enemies are flying above the road": rival cars kept the old hover-ship bob (body 1.6 m up, wheels 0.7 m over the road). Dry: the player's wheel-base offset (ART4_base); afloat: the bob.
function TK_pY(g,ud,wet){if(wet||typeof ART4_base!=='function')return 1.6+Math.sin(T*6)*.1;try{return ART4_base({mesh:g},ud,false)}catch(e){return 1.6}}
// Alex, beta.160: "should have the freedom of the games given as benchmark but not go wherever i want"): soft course bounds, 2K style.
// The whole street, its verges and the course's own split route are free (TK_OFF m from the nearer route line); further out a BACK TO TRACK warning,
// and after TK_OFF_T s (or at once past TK_OFF2) a gentle respawn on the route at the nearest point, facing the course. Driving the course backwards shows WRONG WAY.
const TK_OFF=30,TK_OFF2=90,TK_OFF_T=3;
function TK_near(G,x,z){let bd=1e9,bp=null;for(const P of[G.pA,G.pB])for(let i=1;i<P.length;i++){const a=P[i-1],b=P[i],L=Math.hypot(b[0]-a[0],b[1]-a[1])||1,t=clamp(((x-a[0])*(b[0]-a[0])+(z-a[1])*(b[1]-a[1]))/(L*L),0,1),px=a[0]+(b[0]-a[0])*t,pz=a[1]+(b[1]-a[1])*t,d=Math.hypot(px-x,pz-z);if(d<bd){bd=d;bp={x:px,z:pz,h:Math.atan2(b[0]-a[0],b[1]-a[1])}}}return{d:bd,p:bp}}
function TK_bd(sp,G,dt){if(sp.cd>0||sp.done||!G)return;const n=TK_near(G,RO.x,RO.z);sp.offD=n.d;
  if(n.d>TK_OFF){sp.offT=(sp.offT||0)+dt;if(!sp.offW){sp.offW=1;say('BACK TO TRACK','',1.2);AU.sfx('beep')}
    if(sp.offT>TK_OFF_T||(n.d>TK_OFF2&&sp.offT>1)){const q=n.p;RO.x=q.x;RO.z=q.z;RO.y=groundAt(q.x,q.z,99);RO.h=RO.vh=q.h;RO.v=Math.min(Math.abs(RO.v),12);RO.vy=0;RO.yr=0;camSnap=true;sp.offT=0;sp.offW=0;sp.resp=(sp.resp||0)+1;feed('BACK ON TRACK',0,'#4ceaff')}}
  else{sp.offT=0;sp.offW=0}
  if(n.p&&RO.v>6&&Math.abs(angDiff(n.p.h,RO.h))>2.2){sp.wwT=(sp.wwT||0)+dt;if(sp.wwT>1.5&&!sp.wwW){sp.wwW=1;say('WRONG WAY','',1.2)}}else{sp.wwT=0;sp.wwW=0}}
