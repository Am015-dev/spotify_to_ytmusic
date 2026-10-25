// racedress-r24n: GO race/dressed (phone profile, fra + ath; on-demand GO chunk). Alex, beta.161: "the races dont look like races more free roam with opponents".
// State asserts, no graphics, for EVERY city race (rival/boss marks, track sprints, every quick-race track): barrier along >= 90 % of the route length
// (both sides, park cuts / river legs excluded and reported), every side-street mouth on the route closed (barrier across it; open only where another
// part of the course runs = SHORTCUT / split), a chevron board at every corner > 45 deg, checkpoint arches + FINISH banner + 5-light gantry present,
// rivals on the grid beside/ahead, the countdown (3-2-1-GO) runs before input (full throttle held: the car does not move), 0 traffic cars / pedestrians
// in the course corridor while racing, dressing draws <= 40 (distance-culled cells), barrier solid (a car aimed at it at 15 m/s stays inside),
// restored after the race (no dressing, no colliders left, same traffic count). FAIL on beta.161 (no dressing), PASS with src/98rd_race_dress.js.
function RDG_list(){const L=[...tkWorldEvs().map(tkMarkOf),...(CID==='fra'?RO.marks.filter(m=>m.kind==='sprint'&&m.ev&&typeof SPR_TRACK!=='undefined'&&SPR_TRACK[m.ev.id]):[])].filter(Boolean);
  const quick=(CID==='fra'?['grand','hafen','fraport','sky','nord','sachs']:['akro','synt','kifi','pana','ath_akti']).map(id=>({id,kind:'quick'}));const out=[];
  for(const m of[...L,...quick]){let C;if(m.kind==='quick'){const sv=menuTrack;menuTrack=m.id;try{C=tkBuild(tkQuickSpec())}finally{menuTrack=sv}}else C=tkCourseOf(m);out.push([m,C,m.kind==='quick'?m.id:(m.ev&&(m.ev.p||m.ev.id))||m.kind])}return out}
function RDG_one(m,C,nm,solid){const R={n:nm},said=[],sv=say;let sp;
  const live=()=>(HUB.cars||[]).filter(c=>c&&!c.fake&&c.x!=null&&!(c.dead>0)),inCor=(x,z)=>RDS_inCor(x,z,6);
  const nCars0=(HUB.cars||[]).filter(c=>c&&!c.fake).length;
  try{say=function(a,b){said.push(String(a||''));return sv.apply(this,arguments)};tkStart(m,C);sp=RO.sp}finally{say=sv}
  const D=window.RDS,st=D&&D.st;R.built=!!(D&&D.g&&sp&&sp.rd&&st);if(!R.built){R.ok=false;R.why='no dressing';try{sprintEnd()}catch(e){}return R}
  const ex=st.len-st.offr;R.cov=st.bar/Math.max(1,ex);R.raw=st.bar/Math.max(1,st.len);R.mouths=st.mouths;R.open=st.cutOpen;R.shut=(st.mouthL||[]).filter(q=>!q.open&&q.miss===0).length;R.badM=(st.mouthL||[]).filter(q=>!q.open&&q.miss>0).length;
  R.corners=st.corners.length;R.chevMiss=st.corners.filter(c=>c.n<1).length;R.arches=sp.G.filter(g=>g.mesh&&g.mesh.parent).length;R.nG=sp.G.length;R.fin=!!st.finBan;R.lights=(D.lights||[]).length;R.flags=st.flags;R.stands=st.stands;
  R.grid=sp.ai.every(a=>a.s>=3.5)&&sp.ai.some(a=>Math.abs(a.s-4)<=4&&Math.abs(a.lane-4)>=6);
  // countdown before input: full throttle from the first frame, the car must not move until GO
  const x0=RO.x,z0=RO.z,cd0=sp.cd;let moved=0,said2=[];K.ArrowUp=K.KeyW=true;const sv2=say;say=function(a){said2.push(String(a||''));return sv2.apply(this,arguments)};
  try{tkRun(cd0+.1,s=>{if(s.cd>0)moved=Math.max(moved,Math.hypot(RO.x-x0,RO.z-z0))})}finally{say=sv2;K.ArrowUp=K.KeyW=false}
  const cdSeq=[...said,...said2].filter(x=>/^(3|2|1|GO!)$/.test(x)).join(',');R.cd=cd0>=2.9&&moved<.5&&cdSeq==='3,2,1,GO!';R.cdTxt=`${cd0.toFixed(1)} s, ${cdSeq||'-'}, moved ${moved.toFixed(2)} m`;
  // race 6 s with the bot: traffic / pedestrians in the corridor, dressing draws
  const G=tkGeoOf(C),bot=tkBot(C.water||C.off?G.pB:G.pA,{lag:.15});let tr=0,pd=0,draws=0,P0=renderer.info.programs.length,k=0;
  tkRun(6,s=>{bot(s);if(++k%15)return;for(const c of live())if(inCor(c.x,c.z))tr++;for(const p of HUB.peds||[])if(p&&p.x!=null&&inCor(p.x,p.z))pd++;let n=0;D.g&&D.g.traverse(o=>{if(o.isInstancedMesh&&o.visible&&(!o.parent||o.parent.visible))n++});draws=Math.max(draws,n)});
  K.ArrowUp=K.KeyW=K.ArrowLeft=K.ArrowRight=false;R.tr=tr;R.pd=pd;R.draws=draws;R.links=renderer.info.programs.length-P0;R.pre=st.trafPre;R.warm=D.warmN;
  // solid: aimed at the barrier at 15 m/s from 2.5 m inside the kerb line, 1.2 s later still inside it
  if(solid&&D.lines){const ln=D.lines[0],s=Math.min(ln.L*.5,120),q=ln.at(s),r=RDS_hw(q.x,q.z),hw=Math.max(r?r.hw:6,7);let worst=0;for(const sd of[-1,1]){const lx=Math.cos(q.h)*sd,lz=-Math.sin(q.h)*sd;
      if(D.IX.near(q.x+lx*(hw+1.1),q.z+lz*(hw+1.1),ln.sid[q.i]).d<hw+1){continue}RO.x=q.x+lx*(hw-2.5);RO.z=q.z+lz*(hw-2.5);RO.y=groundAt(RO.x,RO.z,99);RO.h=RO.vh=Math.atan2(lx,lz);RO.v=15;RO.vy=0;RO.yr=0;sp.offT=0;
      for(let i=0;i<36;i++){K.ArrowUp=true;tkStep(1/30);roamStep(1/30)}K.ArrowUp=false;worst=Math.max(worst,(RO.x-q.x)*lx+(RO.z-q.z)*lz)}R.solid=worst>0&&worst<hw+1.1+.3;R.solidTxt=`reached ${worst.toFixed(1)} m (barrier ${(hw+1.1).toFixed(1)} m)`}
  try{$('#spRes').hidden=true}catch(e){}try{if(RO.sp===sp)sprintEnd()}catch(e){}
  let left=0;for(const[,L]of HUB.grid||[])for(const b of L)if(b.rd)left++;R.restored=!window.RDS.g&&left===0&&(HUB.cars||[]).filter(c=>c&&!c.fake).length===nCars0;
  R.ok=R.built&&R.cov>=.9&&R.badM===0&&R.chevMiss===0&&R.arches===R.nG&&R.fin&&R.lights===5&&R.grid&&R.cd&&R.tr===0&&R.pd===0&&R.draws<=40&&R.restored&&(!solid||R.solid)&&R.flags>=8;return R}
(function RDG_reg(i){const C=window.__chk;if(C&&C.GO&&C.items){if(!C.items.some(q=>q.ver==='race'&&q.id==='dressed'))C.items.push({ver:'race',id:'dressed',area:'race',text:'racedress-r24n · race/dressed: every city race is a closed course: barriers + kerbs along >= 90 % of the route, side streets closed (arrow boards), chevrons at corners > 45°, start gantry + 3-2-1-GO before input, staggered grid, flags + stands, checkpoint arches + FINISH banner, 0 traffic in the corridor while racing, restored after'});
  const fn=async()=>{const out=[];let ok=true;try{const L=RDG_list();if(!L.length){ok=false;out.push('✗ no races')}let first=true;
      for(const[m,Cc,nm]of L){if(!Cc){ok=false;out.push('✗ '+nm+': no course');continue}const r=RDG_one(m,Cc,nm,first);first=false;ok=ok&&r.ok;
        out.push((r.ok?'✓ ':'✗ ')+nm+(r.built?`: barrier ${(r.cov*100).toFixed(0)} % (raw ${(r.raw*100).toFixed(0)} %), side streets ${r.shut}/${r.mouths-r.open} closed (${r.open} open = course/SHORTCUT), chevrons ${r.corners-r.chevMiss}/${r.corners} corners, arches ${r.arches}/${r.nG}${r.fin?' + FINISH':''}, gantry ${r.lights} lights, grid ${r.grid?'ok':'bad'}, countdown ${r.cd?'ok':'BAD'} (${r.cdTxt}), traffic in corridor ${r.tr} (start ${r.pre}), peds ${r.pd}, draws ${r.draws} (<= 40), flags ${r.flags}, stands ${r.stands}, links in race ${r.links} (warm ${r.warm})${r.solidTxt?', solid '+(r.solid?'ok':'BAD')+' '+r.solidTxt:''}, restored ${r.restored}`:': '+(r.why||'not dressed')))}}
    catch(e){ok=false;out.push('✗ threw '+String(e).slice(0,160))}finally{K.ArrowUp=K.KeyW=K.ArrowLeft=K.ArrowRight=false}
    return`📍 RACE DRESSED · ${out.join(' · ')} → ${ok?'✅ PASS':'❌ FAIL'}`};
  C.GO['race/dressed']=[{c:'fra',n:'Race dressing (Frankfurt)',secs:240,fn},{c:'ath',n:'Race dressing (Athens)',secs:240,fn}];return}
 if(i<600)setTimeout(()=>RDG_reg(i+1),100)})(0);
