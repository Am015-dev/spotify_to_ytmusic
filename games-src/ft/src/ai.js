// ---------- computer players: plan the whole move (start, path, colour), then play it step by step ----------
let AIPLAN=null;
const LVL={easy:{noise:.9,depth:3000},normal:{noise:.25,depth:20000},hard:{noise:0,depth:60000}};
function aiNoise(p){return (LVL[p.lv]||LVL.normal).noise}
// every legal outcome of picking up tile s: {s,e,c,n,path}
function outcomes(s,cap){const t=G.board[s];const hand=t.m.slice();const saved=t.m;t.m=[];const hc=handCounts(hand);const L=hand.length;const res={};let nodes=0;
  const path=[s];const visits={};
  const rec=(at,prev,left)=>{if(nodes++>cap)return;for(const nx of ADJ(at)){if(nx===prev)continue;path.push(nx);
      if(left===1){const had=G.board[nx].m;for(const c in hc){const pre=had.filter(x=>x===c).length;const extra=Math.min(visits[nx]||0,hc[c]-1);if(pre||extra){const n=pre+extra+1;const key=nx+c;if(!res[key]||res[key].n<n)res[key]={s,e:nx,c,n,path:path.slice()}}}}
      else{visits[nx]=(visits[nx]||0)+1;rec(nx,at,left-1);visits[nx]--}path.pop()}};
  rec(s,-1,L);t.m=saved;return Object.values(res)}
function goodsGain(p,cards){const base=goodsBest(p);const q=Object.assign({},p,{res:p.res.concat(cards.filter(r=>r!=='fakir')),fk:p.fk+cards.filter(r=>r==='fakir').length});return goodsBest(q)-base+cards.filter(r=>r==='fakir').length*1.2}
function djValue(p,k){const d=DJ[k];let v=d.vp;const left=Math.max(1,12-G.round*1.2);
  if(d.cost)v+=Math.min(6,left*.6);if(k==='nakhla')v+=G.board.filter(t=>owner(t)===p.i).reduce((a,t)=>a+t.palm*2,0)+2;if(k==='wazira')v+=p.vz*2+2;if(k==='hikma')v+=p.el*2+2;if(k==='zarifa')v+=Math.floor(p.fk/2)*3;if(k==='majlis')v+=5*(p.dj.length+1);
  if(['harith','qasra','khanjar','tariq','amir'].includes(k))v+=left*.8;return v}
function bestSummon(p){let b=null,bv=-1e9;for(const k of G.djRow)for(const pay of summonPays(p)){const cost=pay.el*2+pay.fk*1.5;const v=djValue(p,k)-cost;if(v>bv){bv=v;b={k,pay}}}return {b,v:bv}}
function vizierValue(p,n){const others=G.pl.filter(q=>q.i!==p.i);let v=n*(hasDj(p,'wazira')?3:1);for(const q of others){const before=q.vz<p.vz,after=q.vz<p.vz+n;if(!before&&after)v+=10*(G.round>3?1:.7);else if(!after&&q.vz-p.vz<=n+2)v+=2}return v}
function killValue(p,n,tile){let best=0;for(const q of G.pl){if(q.i===p.i||hasDj(q,'sadim'))continue;if(q.vz){const leader=G.pl.every(x=>x.vz<=q.vz);best=Math.max(best,leader?6:2)}if(q.el)best=Math.max(best,3+(q.el>=2?1:0))}
  for(const t of G.board){if(t.block||!t.m.length||MDIST(tile,t.i)>n+p.fk)continue;if(t.m.length===1&&t.camel==null&&t.tent==null)best=Math.max(best,tileWorth(t)-2)}return best}
function evalOutcome(p,o){const t=G.board[o.e];let v=0;
  // after the move: what remains on the end tile?
  const baseM=o.e===o.s?[]:t.m;const visitsE=o.path.slice(1,-1).filter(i=>i===o.e).length;const extraC=o.n-1-baseM.filter(x=>x===o.c).length;const remain=baseM.filter(x=>x!==o.c).length+Math.max(0,visitsE-extraC);
  const mine=owner(t)===p.i||(owner(t)==null&&remain<=0&&p.camels>0);const theirs=owner(t)!=null&&owner(t)!==p.i;
  if(owner(t)==null&&remain<=0&&p.camels>0)v+=tileWorth(t)+(t.k==='city'?6:0)+(G.endTrig?0:1)-(p.camels<=2&&!aiAhead(p)?6:0);
  switch(o.c){case 'vizier':v+=vizierValue(p,o.n);break;case 'elder':v+=o.n*(hasDj(p,'hikma')?4:2)+(G.djRow.length?o.n*1.5:0);break;
    case 'merchant':v+=goodsGain(p,G.market.slice(0,o.n));break;case 'builder':{const blues=AROUND(o.e).filter(i=>G.board[i].blue&&!G.board[i].block).length;v+=o.n*blues;break}
    case 'assassin':v+=killValue(p,o.n,o.e);break;case 'artisan':v+=o.n*2.6+(G.items.length?4:0);break}
  switch(t.k){case 'village':v+=mine?5:theirs?-4:1;break;case 'oasis':v+=mine?(hasDj(p,'nakhla')?5:3):theirs?-2.5:1;break;
    case 'sacred':{const pe=Object.assign({},p,{el:p.el+(o.c==='elder'?o.n:0)});const s=bestSummon(pe);if(s.b)v+=Math.max(0,s.v);break}
    case 'small':if(p.coins>=3)v+=Math.max(0,Math.max(...G.market.slice(0,3).map(r=>goodsGain(p,[r])))-3);break;
    case 'large':if(p.coins>=6){const f=G.market.slice(0,6);let b=0;for(let x=0;x<f.length;x++)for(let y=x+1;y<f.length;y++)b=Math.max(b,goodsGain(p,[f[x],f[y]]));v+=Math.max(0,b-6)}break;
    case 'exchange':if(p.coins>=4)v+=Math.max(0,Math.max(0,...G.market.map(r=>goodsGain(p,[r])))-4);break;
    case 'workshop':if(G.items.length&&(p.art||p.fk>=2))v+=3;break}
  if(G.boss&&G.boss.seat===p.i&&o.c===G.boss.favour)v+=6;// campaign boss rule: this boss prefers one tribe
  return v+(Math.random()-.5)*aiNoise(p)*6}
function aiAhead(p){const s=scoreOf(p).total;return G.pl.every(q=>q.i===p.i||scoreOf(q).total<=s)}
function planTurn(p){const cap=(LVL[p.lv]||LVL.normal).depth;let best=null,bv=-1e9;for(const s of legalStarts())for(const o of outcomes(s,cap)){const v=evalOutcome(p,o);if(v>bv){bv=v;best=o}}return best&&Object.assign(best,{v:bv})}
function bestTurnValue(p){const b=planTurn(Object.assign({},p,{lv:'hard'}));return b?b.v:0}
// the next concrete move for side s
function aiMove(s){const p=P(s);const vm=validMoves(s);if(!vm.length)return null;const by=a=>vm.filter(m=>m.act===a);
  if(G.q)return {act:'q',i:aiAnswer(G.q)};
  if(G.phase==='bid'){const v=bestTurnValue(p);const budget=Math.max(0,v*.35-2);let pick=vm[vm.length-1];let pv=-1;for(const m of vm){const pr=bidPrice(p,m.spot,m.fk);if(pr<=budget&&G.track[m.spot].cost>pv){pv=G.track[m.spot].cost;pick=m}}return pick}
  const dj=aiDjinn(p,vm);if(dj)return dj;const it=aiItem(p,vm);if(it)return it;
  switch(G.step){
  case 'move':{if(!G.move){AIPLAN=planTurn(p);if(!AIPLAN)return vm[0];return {act:'start',tile:AIPLAN.s}}
    const pl=AIPLAN;const k=G.move.path.length;const nx=pl&&pl.path[k];const steps=by('step');if(nx==null)return steps[0];const here=steps.filter(m=>m.tile===nx);if(!here.length)return steps[0];
    const last=G.move.hand.length===1;const want=pl.c;const cnt=G.move.hand.filter(x=>x===want).length;
    if(last)return here.find(m=>m.c===want)||here[0];if(nx===pl.e&&cnt>1){const m=here.find(m=>m.c===want);if(m)return m}
    return here.find(m=>m.c!==want)||here[0]}
  case 'tribe':{const th=by('thief')[0];if(th)return th;const tr=by('tribe');if(G.act.color==='builder'){const blues=AROUND(G.act.tile).filter(i=>G.board[i].blue&&!G.board[i].block).length;if(blues>=4&&p.fk)return tr[tr.length-1]||tr[0];return tr[0]}
    if(G.act.color==='assassin')return bestKill(p,tr);return tr[0]}
  case 'tile':{const tm=by('tile');const t=G.board[G.act.tile];
    if(t.k==='village'||t.k==='oasis'){let b=tm[0],bv=-1e9;for(const m of tm){if(m.place==null)continue;const tt=G.board[m.place];const v=owner(tt)===p.i?3:owner(tt)==null?0:-3;if(v>bv){bv=v;b=m}}return b}
    if(t.k==='sacred'){const s=bestSummon(p);if(s.b&&s.v>0)return tm.find(m=>m.dj===s.b.k&&same(m.pay,s.b.pay))||tm[tm.length-1];const th=tm.find(m=>m.thief);if(th&&G.round>2&&Math.random()<.3)return th;return tm[tm.length-1]}
    let b=tm[tm.length-1],bv=0;for(const m of tm){if(!m.take)continue;const cost=t.k==='small'?3:t.k==='large'?6:4;const v=goodsGain(p,m.take.map(j=>G.market[j]))-cost;if(v>bv){bv=v;b=m}}
    if(t.k==='workshop'){const w=tm.find(m=>m.work==='art')||tm.find(m=>m.work==='fk');if(w)return w}return b}
  case 'sell':{// sell only when coins would win a close bid next round? keep it simple: sell duplicate-heavy sets late
    if(G.endTrig&&false)return by('sell')[0];return by('end')[0]}}
  return vm[0]}
function bestKill(p,tr){let b=tr[0],bv=-1e9;for(const m of tr){if(m.none)return m;const k=m.kill;let v=-k.fk*1.2;
    if(k.pl!=null){const q=P(k.pl);if(k.c==='vizier')v+=G.pl.every(x=>x.vz<=q.vz)?6:2;if(k.c==='elder')v+=3;if(k.c==='artisan')v+=2.5;v+=scoreOf(q).total>scoreOf(p).total?1.5:0}
    else{const t=G.board[k.tile];const left=t.m.length-(k.c2?2:1);if(left<=0&&t.camel==null&&t.tent==null&&p.camels>0)v+=tileWorth(t)-1;else v+=.5}
    if(k.c2)v+=1.5;if(v>bv){bv=v;b=m}}return b}
function aiDjinn(p,vm){const ds=vm.filter(m=>m.act==='djinn');if(!ds.length)return null;
  for(const m of ds){const cheap=m.pay.fk?1.5:m.pay.el*2;
    if(m.k==='suqra')return m;
    if((m.k==='wahha'||m.k==='nuraya')&&owner(G.board[m.t])===p.i&&cheap<=2.5)return m;
    if((m.k==='jamal'||m.k==='fath')&&tileWorth(G.board[m.t])>=8+cheap&&!aiShort(p))return m;
    if(m.k==='qirsh'){const blues=AROUND(G.act.tile).filter(i=>G.board[i].blue).length;if(G.act.n*blues>=cheap+6)return m}
    if(m.k==='ruya'&&p.el>=3&&m.pay.el<=1)return m}return null}
function aiShort(p){return p.camels<=1}
function aiItem(p,vm){const it=vm.filter(m=>m.act==='item');for(const m of it){if(m.k==='lamp'){const s=G.djRow.map(k=>({k,v:djValue(p,k)})).sort((a,b)=>b.v-a.v)[0];if(s&&s.k===m.dj)return m}
    if(m.k==='horn'&&G.step==='sell')return m}return null}
function aiWantsTent(p,e){const t=G.board[e];const red=AROUND(e).filter(j=>!G.board[j].blue&&!G.board[j].block).length;return red>=5||(tileWorth(t)>=10&&red>=3)}
function aiAnswer(q){const p=P(q.who);switch(q.kind){
  case 'claim':return aiWantsTent(p,q.opts[1].d.e)?1:0;
  case 'item':{let b=0,bv=-1;q.opts.forEach((o,i)=>{const k=o.d.drawn[o.d.keep];const v=ITEMS[k].kind==='precious'?ITEMS[k].vp:k==='lamp'?7:k==='scimitar'?5:3;if(v>bv){bv=v;b=i}});return b}
  case 'djinn':{let b=0,bv=-1;q.opts.forEach((o,i)=>{const k=q.cards[i];const v=djValue(p,k);if(v>bv){bv=v;b=i}});return b}
  case 'flute':return q.opts.length>1&&Math.random()<.7?1:0;
  case 'thief':return 0;default:return 0}}
