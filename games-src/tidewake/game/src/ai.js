// ===================== Tidewake: computer captains =====================
// Every decision is a pure function of knowledge(seat) (plus a salt): the AI never reads G. A placement is simulated on a copy of the
// public board (path following through chained currents, edge, leviathan tiles, collisions), then scored:
//  * dying is terrible, sinking a rival is great (and sinking the last rival wins), a teammate's loss counts too
//  * the next daikaiju rolls are looked up by expected risk: every leviathan's five arrows (and its spawn on a 6) against my front square and my tile,
//    over the rolls that happen before my next turn; a held Deck Cannon / Rift Gate softens the risk
//  * edges are avoided; safe options for the next turn are counted from my remaining tiles (normal) and, for hard, also the odds that the tile I
//    draw gives a safe option, plus a one-turn look-ahead and a push on rivals toward the edge
// easy: often picks a random non-suicidal move, ignores monster risk. normal: 1-ply. hard: adds the look-ahead and rival pressure.
const AILV={easy:{noise:30,rnd:.45,rk:0,mob:2,look:0,kill:250,push:0,draw:0},normal:{noise:4,rnd:.2,rk:420,mob:7,look:0,kill:320,push:0,draw:1},hard:{noise:0,rnd:0,rk:420,mob:7,look:0,kill:380,push:0,draw:1,mc:40}};
let AISALT=12345;function setAiSeed(s){AISALT=s>>>0}
function mkRng(seed){let a=seed>>>0;return ()=>{a=(a+0x6D2B79F5)|0;let t=Math.imul(a^a>>>15,a|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296}}
function kHash(K){let h=AISALT^(K.seat*2654435761);const mix=x=>{h=Math.imul(h^x,2246822519)>>>0;h^=h>>>13};mix(K.turn);mix(K.sp);mix(K.mons.length);
  for(const s of K.ships){mix((s.x==null?9:s.x)*7+(s.y==null?9:s.y));mix(s.e==null?9:s.e)}for(const c of K.hands[K.seat])mix(c+1);mix(K.q?K.q.n:0);return h>>>0}
const mineTeam=(K,i)=>sameTeam(K,i,K.seat);
function hypo(K,S,tile,rot){const sim=simPlace(K,S.x,S.y,tile,rot);const B=Object.assign({},K,{bd:K.bd.slice(),ships:K.ships.map(s=>Object.assign({},s))});B.bd[S.y*BW+S.x]=[tile,rot];
  const dead=new Set(sim.coll);
  for(const i in sim.res){const r=sim.res[i],sh=B.ships[i];if(r.st==='ok'){sh.x=r.x;sh.y=r.y;sh.e=r.e;sh.on=r.on}else if(r.st==='gate'){sh.x=null;sh.on=[r.x,r.y]}else dead.add(+i)}
  for(const i of dead)B.ships[i].alive=false;return {B,dead:[...dead],sim}}
// chance that a leviathan (or the maelstrom) ends up in the front square / on the tile before my next turn
function monRisk(B,front,on,L,handAfter){if(!L.rk)return 0;let pf=0,po=0;
  for(const m of B.mons){if(m.k==='L'){for(let die=1;die<=5;die++){const a=LEV[m.id].arr[die-1];if(a==='R')continue;const dd=DIR[(DIRN[a]+m.r)%4],tx=m.x+dd[0],ty=m.y+dd[1];
        if(front&&tx===front[0]&&ty===front[1])pf+=1/6;if(on&&tx===on[0]&&ty===on[1])po+=1/6}
      pf+=1/216;po+=1/216}
    else{for(let die=1;die<=4;die++){const dd=DIR[DIRN[MAEL_ARR[die-1]]],tx=m.x+dd[0],ty=m.y+dd[1];const w=20/36*0.6;
        if(front&&tx===front[0]&&ty===front[1])pf+=w/6;if(on&&tx===on[0]&&ty===on[1])po+=w/6}}}
  const alive=B.ships.filter(s=>s.alive).length;const per=Math.min(.95,(16/36)*(pf+po));let risk=1-Math.pow(1-per,Math.max(1,alive));
  if(handAfter){if(handAfter.some(isCannon))risk*=.4;if(handAfter.some(isGate))risk*=.75}return risk}
// hard: Monte Carlo of the leviathans for every roll before my next turn (their order, arrows, spawns on a 6, collisions): chance my tile is crushed or my front square is blocked
let CUR_RNG=null,MCC=null;
function mcRisk(B,front,on,hand,N){const key=front[0]+','+front[1]+'/'+(on?on[0]+','+on[1]:'-');if(MCC&&MCC[key]!=null)return MCC[key];const rng=CUR_RNG;
  const events=B.ships.filter(s=>s.alive).length;let dead=0;
  for(let n=0;n<N;n++){let mons=B.mons.filter(m=>m.k==='L').map(m=>({id:m.id,x:m.x,y:m.y,r:m.r}));let died=false;
    for(let e=0;e<events&&!died;e++){if(rng()>=16/36)continue;
      const order=mons.slice().sort((a,b)=>LEV[a.id].order-LEV[b.id].order||LEV[b.id].gold-LEV[a.id].gold);
      for(const m of order){if(!mons.includes(m))continue;const die=1+Math.floor(rng()*6);
        if(die===6){if(B.mdeck.some(x=>x<10)){const x=Math.floor(rng()*6),y=Math.floor(rng()*6);if(on&&x===on[0]&&y===on[1])died=true;mons=mons.filter(o=>!(o.x===x&&o.y===y));mons.push({id:m.id,x,y,r:0,spawn:1,nm:1})}continue}
        const a=LEV[m.id].arr[die-1];if(a==='R'){m.r=(m.r+LEV[m.id].rd+4)%4;continue}
        const dd=DIR[(DIRN[a]+m.r)%4],tx=m.x+dd[0],ty=m.y+dd[1];
        if(!inB(tx,ty)){mons=mons.filter(o=>o!==m);continue}
        if(on&&tx===on[0]&&ty===on[1])died=true;
        mons=mons.filter(o=>o===m||!(o.x===tx&&o.y===ty));m.x=tx;m.y=ty}}
    if(!died&&mons.some(m=>m.x===front[0]&&m.y===front[1]))died=true;if(died)dead++}
  let r=dead/N;if(hand){if(hand.some(isCannon))r*=.4;if(hand.some(isGate))r*=.75}
  if(MCC)MCC[key]=r;return r}
function distMon(B,sq){let d=9;for(const m of B.mons)if(m.k==='L')d=Math.min(d,Math.abs(m.x-sq[0])+Math.abs(m.y-sq[1]));return d}

function safeOpts(B,S,hand){let n=0;if(S.x==null)return 0;for(const c of hand){if(!isCur(c))continue;for(let r=0;r<4;r++){const sim=simPlace(B,S.x,S.y,c,r);const o=sim.res[S.i];if(o&&(o.st==='ok'||o.st==='gate')&&!sim.coll.includes(S.i))n++}}return n}
// probability that a random fresh current offers at least one safe rotation from this ship's front square
const SF_CACHE={};
function drawSafe(B,S){if(S.x==null)return .5;const key=S.x+','+S.y+','+S.e+','+B.mons.map(m=>m.x+':'+m.y).join(';')+'|'+B.bd.filter(Boolean).length;if(SF_CACHE[key]!=null)return SF_CACHE[key];
  let ok=0;for(let t=0;t<35;t++){let any=false;for(let r=0;r<4&&!any;r++){const o=simPlace(B,S.x,S.y,t,r).res[S.i];if(o&&(o.st==='ok'||o.st==='gate'))any=true}if(any)ok++}
  const f=ok/35;if(Object.keys(SF_CACHE).length>4000)for(const k in SF_CACHE)delete SF_CACHE[k];SF_CACHE[key]=f;return f}
function evalPos(B,seat,L,handAfter){let sc=0;
  for(const S of B.ships){if(!S.alive)continue;const mine=mineTeam(B,S.i),w=S.i===seat?1:mine?.55:0;
    if(S.x==null){if(w)sc-=70*w;continue}
    const front=[S.x,S.y];
    if(w){const risk=L.mc&&S.i===seat&&CUR_RNG?mcRisk(B,front,S.on,handAfter,L.mc):monRisk(B,front,S.on,L,S.i===seat?handAfter:null);sc-=L.rk*risk*w;
      const d=Math.min(S.x,S.y,BW-1-S.x,BW-1-S.y);sc-=(d===0?(L.e0!=null?L.e0:26):d===1?(L.e1!=null?L.e1:7):0)*w;
      if(B.wave&&inRowK(front,B))sc-=45*w;
      if(S.i===seat&&handAfter){const n=safeOpts(B,S,handAfter);sc+=Math.min(n,7)*L.mob;
        if(L.draw){const fd=drawSafe(B,S);if(n===0)sc-=380*(1-fd)+60}else if(n===0)sc-=150}
      sc-=Math.max(0,3-distMon(B,front))*5*w}
    else if(L.push){const d=Math.min(S.x,S.y,BW-1-S.x,BW-1-S.y);sc+=(d===0?L.push*2:d===1?L.push*.6:0)}}
  return sc}
function inRowK(sq,B){const w=B.wave;if(!w||!sq)return false;return (w.r&1)?sq[0]===w.x:sq[1]===w.y}
function scoreMove(K,seat,m,L){const hand=K.hands[seat];let sc=0,B,dead=[];
  if(m.a==='place'){const S=K.ships[m.s];const h=hypo(K,S,hand[m.t],m.r);B=h.B;dead=h.dead;
    const after=hand.filter((c,i)=>i!==m.t);
    for(const i of dead){if(i===seat)sc-=1000;else if(mineTeam(K,i))sc-=600;else sc+=L.kill}
    const alive=B.ships.filter(s=>s.alive);if(alive.length&&!alive.some(s=>!mineTeam(K,s.i)))sc+=4000;
    if(B.ships[seat].alive)sc+=evalPos(B,seat,L,after);
    if(L.look&&B.ships[seat].alive&&B.ships[seat].x!=null){let best=-9999;const S2=B.ships[seat];
      for(const c of after){if(!isCur(c))continue;for(let r=0;r<4;r++){const sim=simPlace(B,S2.x,S2.y,c,r);const o=sim.res[seat];if(!o||o.st==='edge'||o.st==='mon'||sim.coll.includes(seat))continue;
        const f2=o.st==='ok'?[o.x,o.y]:null;const rk=f2?monRisk(B,f2,o.on,L,null):.3;const dd=f2?Math.min(f2[0],f2[1],BW-1-f2[0],BW-1-f2[1]):0;
        let v=-L.rk*.5*rk-(dd===0?20:dd===1?4:0);for(const i in sim.res)if(!mineTeam(K,+i)&&(sim.res[i].st==='edge'||sim.res[i].st==='mon'))v+=60;if(v>best)best=v}}
      if(best>-9999)sc+=best;else sc-=250}
    return sc}
  if(m.a==='gate')return -140+(L.rk?0:0);
  if(m.a==='cannon'){B=Object.assign({},K,{mons:K.mons.filter(x=>x.id!==m.m)});return -45+evalPos(B,seat,L,hand.filter((c,i)=>i!==m.t))}
  if(m.a==='pass')return evalPos(K,seat,L,hand);
  return 0}
function startScore(K,seat,m,L,rng){const front=[m.x,m.y];let sc=0;const B=K;sc-=monRisk(B,front,null,L,null)*L.rk;
  const corner=(m.x===0||m.x===BW-1)&&(m.y===0||m.y===BW-1);if(corner)sc-=40;
  let dmin=9;for(const s of K.ships)if(s.i!==seat&&s.x!=null)dmin=Math.min(dmin,Math.abs(s.x-m.x)+Math.abs(s.y-m.y));sc+=Math.min(dmin,6)*3;
  sc-=Math.max(0,3-distMon(K,front))*10;
  // prefer the port whose tile paths curve away from the nearest edge
  sc+=rng()*6;return sc}
function aiAnswer(K,seat,L,rng){const q=K.q;const opts=q.opts;const hand=K.hands[seat];const byH=h=>opts.findIndex(o=>o.h===h);
  switch(q.kind){
    case 'doom':{let i=byH('dCannon');if(i>=0)return i;i=byH('dGate');if(i>=0)return i;
      let best=-1,bs=-1e9;opts.forEach((o,k)=>{if(o.h!=='dReloc')return;const sc=-monRisk(K,[o.d.x,o.d.y],null,L,null)-distMon(K,[o.d.x,o.d.y])*.01+rng()*.01;if(sc>bs){bs=sc;best=k}});
      return best>=0?best:Math.max(0,byH('dAccept'))}
    case 'cannonDraw':return L.rnd&&rng()<.4?byH('cDiscard'):byH('cKeep');
    case 'gateSq':{let best=0,bs=-1e9;opts.forEach((o,k)=>{const sq=[o.d.x,o.d.y];const dd=Math.min(sq[0],sq[1],BW-1-sq[0],BW-1-sq[1]);const sc=dd*3+distMon(K,sq)+rng();if(sc>bs){bs=sc;best=k}});return best}
    case 'gatePlace':{let best=0,bs=-1e9;const tx=q.ctx.tx,ty=q.ctx.ty;opts.forEach((o,k)=>{const c=hand[o.d.i];let bw=-1e9;
        for(let p=0;p<8;p++){const B2=Object.assign({},K,{bd:K.bd.slice()});B2.bd[ty*BW+tx]=[c,o.d.r];const r=follow(B2,tx,ty,p);bw=Math.max(bw,posVal(K,seat,r,L))}
        const sc=bw+rng()*.1;if(sc>bs){bs=sc;best=k}});return best}
    case 'gateWake':{let best=0,bs=-1e9;opts.forEach((o,k)=>{const r=follow(K,o.d.tx,o.d.ty,o.d.p);const sc=posVal(K,seat,r,L)+rng()*.1;if(sc>bs){bs=sc;best=k}});return best}
    case 'bonus':{const pool=K.pool;let best=byH('bDone'),bs=0;const val=c=>isCannon(c)?40:isGate(c)?30:0;
      opts.forEach((o,k)=>{if(o.h!=='bSwap')return;const g=val(pool[o.d.j])-val(hand[o.d.i])+(isCur(pool[o.d.j])&&isCur(hand[o.d.i])?0:0);if(g>bs+.5){bs=g;best=k}});return best}
    default:return Math.floor(rng()*opts.length)}}
function posVal(K,seat,r,L){if(r.st==='edge'||r.st==='mon')return -1000;if(r.st==='gate')return -200;const f=[r.x,r.y];const d=Math.min(f[0],f[1],BW-1-f[0],BW-1-f[1]);return -monRisk(K,f,r.on,L,null)*(L.rk||1)-(d===0?26:d===1?7:0)}
function decide(K,seat,lv){const L=AILV[lv]||AILV.normal;const rng=mkRng(kHash(K));CUR_RNG=rng;MCC={};
  if(K.q){if(K.q.who!==seat)return null;return {a:'q',i:aiAnswer(K,seat,L,rng)}}
  const mv=genMoves(K,seat);if(!mv.length)return null;
  if(K.phase==='setup'){let best=mv[0],bs=-1e9;for(const m of mv){const sc=startScore(K,seat,m,L,rng);if(sc>bs){bs=sc;best=m}}return best}
  if(mv.length===1)return mv[0];
  const sc=mv.map(m=>scoreMove(K,seat,m,L)+(L.noise?(rng()-.5)*L.noise:0));
  if(L.rnd&&rng()<L.rnd){const ok=mv.filter((m,i)=>sc[i]>-500);if(ok.length)return ok[Math.floor(rng()*ok.length)]}
  let bi=0;for(let i=1;i<mv.length;i++)if(sc[i]>sc[bi])bi=i;return mv[bi]}
function aiMove(seat,lv){return decide(knowledge(seat),seat,lv||(G&&G.seats[seat]&&G.seats[seat].lv)||'normal')}
function aiStep(force){if(!G||G.phase==='over')return null;const s=sideToAct();if(s<0)return null;if(G.seats[s].human&&!force)return null;const m=aiMove(s);return m?{seat:s,m}:null}
