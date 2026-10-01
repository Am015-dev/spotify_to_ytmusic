// ---------- online play: what a remote seat may see ----------
// netStrip(G, seat) returns a copy of the state for ONE seat with everything that seat may not see overwritten by neutral values:
// the identity of every wire it cannot place (crewmates' uncut wires, its own flipped wires, the robot's wires, the red pile, the unused
// out-of-N wires, the box), face-down equipment, every deck, other seats' secret number cards / roles / restrictions, the RNG state and the
// seed. knowledge(seat) and validMoves(seat) give the SAME answer on the copy as on the real state (tools/net-strip-test.js checks it).
// seat -1 = a watcher: every uncut wire is hidden. Pure function: no DOM, no globals except G's engine tables.
function netStrip(G0,seat){
  const P=JSON.parse(JSON.stringify(G0));const mine=seat>=0;
  const vis=(s,sl)=>{if(sl.cut)return true;if(!mine)return false;const own=P.pos[seat]===s.pos;return (own&&!sl.flip)||(!own&&sl.flip)};
  // job 13 offers the red-triple action only while a red wire is still uncut (public: markers.redN minus the reds cut), so one hidden slot,
  // chosen by position and not by content, keeps a red id when the real state has a hidden uncut red; every other hidden wire is blanked
  const holes=[];let anyRed=false;
  for(const s of P.st)for(const sl of s.w)if(!vis(s,sl)){holes.push(sl);if(!sl.cut&&WIRES[sl.id].c==='r')anyRed=true}
  for(const sl of holes)sl.id=0;
  if(anyRed){const h=holes.find(sl=>!sl.cut);if(h)h.id=RED_IDS[0]}
  if(P.robot)P.robot.w=P.robot.w.map(()=>0);
  P.pile=P.pile.map(()=>0);P.aside=P.aside.map(()=>0);P.box=P.box.map(()=>0);
  const e0=Object.keys(EQUIP)[0];
  for(const e of P.eq)if(e.down)e.id=e0;
  P.eqDeck=P.eqDeck.map(()=>e0);P.eqPool=P.eqPool.map(()=>e0);
  const blank=a=>a.map(x=>typeof x==='number'?0:typeof x==='string'?'':Array.isArray(x)?[]:x&&typeof x==='object'?{}:x);
  const scr=o=>{if(!o||typeof o!=='object')return;for(const k in o){const v=o[k];if(Array.isArray(v)&&(k==='deck'||k==='fl'||k==='box'))o[k]=blank(v);else if(v&&typeof v==='object'&&!Array.isArray(v))scr(v)}};scr(P.ms);
  if(P.ms.mr&&P.ms.mr.fd&&P.ms.mr.fd.from!==seat)P.ms.mr.fd.v=1;
  for(const q of P.seats){if(q.i===seat)continue;if(P.mission===29||P.mission===39)q.cards=q.cards.map(()=>1);
    if(P.ms.mole&&P.ms.mole.hidden&&q.con){q.con='A';if(q.role==='weak'&&!(mine&&P.seats[seat].role==='weak'))q.role=null}
    if(P.ms.roleHidden&&q.chDown)q.ch='ch_base1'}
  if(P.q&&P.q.who!==seat)P.q={who:P.q.who,kind:P.q.kind,title:P.q.title,opts:[]};
  P.ag=[];delete P.rng;P.seed=0;P.log=P.log.slice(0,60);
  return P}
