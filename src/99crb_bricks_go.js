// bricks-r24i: GO race/racers-bricks (phone profile). State asserts on the Racers power-up bricks (src/98rb_racersbricks.js) in the Westend race, forced on for the test
// (proto stays OFF for players): the course gets 4 colours + white bricks and the ? bricks go; driving into a green brick holds it; 2 whites = level 2; the use is turbo 5 s
// at v_max x176/120 (Racers' StartBoost) and the car really goes past its normal top; whites cap at 3; a blue brick = 4 s shield (+1 s fade) that blocks a rival hit,
// while an unshielded hit halves the speed; a rival that holds a yellow brick drops a hazard.
(function RBG_reg(i){const C=window.__chk;if(C&&C.GO&&C.items){if(!C.items.some(q=>q.ver==='race'&&q.id==='racers-bricks'))C.items.push({ver:'race',id:'racers-bricks',area:'race',text:'bricks-r24i · race/racers-bricks: LEGO Racers colour + white bricks in the Westend race (?proto=1): green + 2 white = level 2 turbo (5 s, v_max x176/120), whites cap at 3, blue shield blocks a hit, rivals use bricks'});
  C.GO['race/racers-bricks']=[{c:'fra',n:'Racers bricks: stack, turbo, shield',secs:60,fn:async()=>{const RBR=window.RBR,W=ms=>new Promise(r=>setTimeout(r,ms)),R=[];if(!RBR)return'📍 BRICKS · window.RBR missing ❌ FAIL';
   const was=RBR.force;RBR.force=true;RBR.enable();
   try{if(RO.sp)sprintEnd();const sp=tkStart(tkMarkOf(RIVAL_EV.find(e=>e.p===TK_C.p)),TK_C),B=RBR.B,p=RBR.p;sp.cd=0;for(const a of sp.ai)a.stun=60;
    const nc=[1,2,3,4].map(c=>B.filter(b=>b.col===c).length),nw=B.filter(b=>b.kind==='w').length;
    R.push([`${B.length} bricks (red/blue/green/yellow ${nc.join('/')}, white ${nw}), ? bricks off ${sp.items.every(t=>t.cd>1e8)}`,nc.every(n=>n>0)&&nw>=6&&sp.items.every(t=>t.cd>1e8&&!t.g.visible)]);
    // drive into a green brick (the per-frame pickup), then 2 whites
    const g=B.find(b=>b.col===3);RO.x=g.x;RO.z=g.z;RO.y=groundAt(g.x,g.z,99);RO.v=0;camSnap=true;for(let k=0;k<20&&p.col!==3;k++)await W(100);
    const w=B.filter(b=>b.kind==='w'&&!b.own);RBR.touch(p,w[0],'me');RBR.touch(p,w[1],'me');
    R.push([`drove into green: held ${p.col}, whites ${p.w}, HUD ${(document.querySelector('#rbHud .rbN')||{}).textContent||'-'}`,p.col===3&&p.w===2]);
    const t=RBR.racer();for(const b of w.slice(2,6))RBR.touch(t,b,'ai');const cap=t.w;for(const b of t.wb)b.own=null;
    R.push([`4 whites -> level ${cap} (cap 3)`,cap===3]);
    // use: level 2 turbo on the start straight, gas held
    const Gm=tkGeoOf(TK_C),L=tkLen(Gm.seg.start),q=tkAt(Gm.seg.start,Math.min(.5,60/L));RO.x=q.x;RO.z=q.z;RO.y=groundAt(q.x,q.z,99);RO.h=RO.vh=q.h;RO.v=15;camSnap=true;K.ArrowUp=K.KeyW=true;
    const ev=RBR.use('me');R.push([`use -> ${ev&&ev.name} L${ev&&ev.lvl} ${ev&&ev.dur} s v_max x${ev&&ev.mul&&ev.mul.toFixed(4)} (Racers 5 s, 176/120 = 1.4667), whites home ${w[0].own==null&&w[1].own==null}`,
      !!ev&&ev.col===3&&ev.lvl===2&&ev.dur===5&&Math.abs(ev.mul-176/120)<1e-9&&Math.abs(p.turboT-5)<.25&&p.col===0&&p.w===0&&w[0].own==null]);
    for(let k=0;k<80&&p.turboT>1.5;k++)await W(100);R.push([`turbo (3.5 s of game time): peak ${p.vPeak.toFixed(2)}x the car's normal top (1.40-1.47, Racers 176/120), ${p.turboT.toFixed(1)} s left`,p.vPeak>=1.4&&p.vPeak<=176/120+.005&&p.turboT>0&&p.turboT<5]);
    K.ArrowUp=K.KeyW=false;
    // blue brick, no whites: shield 4 s + 1 s fade; it blocks a rival hit, an unshielded hit halves the speed
    RBR.ret(p);const bl=B.find(b=>b.col===2&&!(b.cd>0));RBR.touch(p,bl,'me');const e2=RBR.use('me');await W(200);
    R.push([`blue L${e2&&e2.lvl}: shield ${e2&&e2.dur} s (4 + 1 fade), bubble ${RBR.bub&&RBR.bub.visible}`,!!e2&&e2.col===2&&e2.lvl===0&&e2.dur===5&&p.shieldT>4&&sp.shieldT>4&&!!RBR.bub&&RBR.bub.visible]);
    RO.v=20;const blk=!RBR.hitMe(sp.ai[0]),v1=RO.v;p.shieldT=0;sp.shieldT=0;RO.v=20;const hit=RBR.hitMe(sp.ai[0]),v2=RO.v;
    R.push([`rival hit with shield: 20 -> ${v1} (blocked ${p.blocked}); without: 20 -> ${v2}`,blk&&v1===20&&p.blocked===1&&hit&&v2===10]);
    // a rival uses a yellow brick: a hazard is dropped
    const a=sp.ai[0],y=B.find(b=>b.col===4&&!(b.cd>0)),h0=RBR.hz.length;RBR.touch(a.rb,y,'ai');const e3=RBR.use('ai',a);
    R.push([`rival ${a.name} used ${e3&&e3.name}, hazards ${h0} -> ${RBR.hz.length}`,!!e3&&e3.col===4&&RBR.hz.length===h0+1]);
    sprintEnd();R.push([`race ended: HUD hidden ${!document.getElementById('rbHud')||document.getElementById('rbHud').style.display==='none'}, bricks cleared ${RBR.B.length===0}`,RBR.B.length===0])}
   catch(e){R.push(['threw '+e,false])}finally{K.ArrowUp=K.KeyW=false;RBR.force=was;try{if(RO.sp)sprintEnd()}catch(e){}}
   const ok=R.every(r=>r[1]);return`📍 RACERS BRICKS · ${R.map(r=>(r[1]?'✓ ':'✗ ')+r[0]).join(' · ')} → ${ok?'✅ PASS':'❌ FAIL'}`}}];return}
 if(i<600)setTimeout(()=>RBG_reg(i+1),100)})(0);
