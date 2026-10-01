// ===================== Tidewake: page logic (part 1: helpers, recorders, kit mirror) =====================
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const lsGet=(k,d)=>{try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}};
const lsSet=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
const COL=TWKit.SHIP_COLORS;
const EDGES=['top','right','bottom','left'];
Object.assign(UI,{started:false,speed:1,guide:'light',guided:false,seen:{},trig:{},holder:-1,sel:null,busy:false,skip:false,pause:false,xray:false,gen:0,rec:null,acting:0,cols:[],dice:null,log:'',qTime:25,tickRate:1,setup:null,V:null,confirm:null,hint:false,msgs:[],lastKey:'',anim:true});
let KS={tiles:{},mons:{},ships:{},gates:{},mael:{},wave:null,hold:{}};
const sleep=ms=>new Promise(r=>setTimeout(r,Math.max(0,ms)/(UI.speed||1)));
const nm=i=>G&&G.seats[i]?G.seats[i].nm:'?';
const colOf=i=>COL[(UI.cols[i]!=null?UI.cols[i]:i)%8];
const dot=i=>`<i style="background:${colOf(i).sail}"></i>`;
const sid=i=>'s'+i;
const humans=()=>G?G.seats.filter(s=>s.human).map(s=>s.i):[];
const hotSeat=()=>!NET.on&&humans().length>=2;
const pathsOf=(c,r)=>TWKit.rotate(BASE_PATHS[CUR_TYPE[c]],r||0);
const kitOk=()=>{try{return !!TWKit.getState}catch(e){return false}};
// ---------- event recorders: wrap engine steps (not the engine file) so one performMove can be replayed one beat at a time ----------
function rec(e){if(UI.rec)UI.rec.push(e)}
function wrapAG(k,f){const o=AG[k];AG[k]=function(d){return f(o,d)}}
function installRecorders(){
  const _lg=lg;lg=function(t,c){_lg(t,c);rec({t:'log',text:t,c:c||''})};
  wrapAG('turnStart',(o,d)=>{o(d);if(G&&G.phase==='play')rec({t:'turn',seat:G.cur,n:G.turn})});
  wrapAG('roll',(o,d)=>{const was=G.dice;o(d);if(G.dice!==was)rec({t:'dice',d:G.dice.slice(),seat:G.cur})});
  wrapAG('monAct',(o,d)=>{const m=monById(d.id);const before=m?[m.x,m.y,m.r]:null;o(d);const m2=monById(d.id);rec({t:'monact',id:d.id,die:d.die,r:m2?m2.r:null,turned:!!(m2&&before&&before[2]!==m2.r)})});
  wrapAG('arrFinal',(o,d)=>{const a=G.arr;if(a){const old=monById(a.id),other=monAt(G,a.x,a.y);rec({t:'arrive',id:a.id,k:a.k,x:a.x,y:a.y,r:a.r,spawn:!!a.spawn,from:old&&old.k===a.k?[old.x,old.y]:null,tile:!!cellAt(G,a.x,a.y),other:other&&other.id!==a.id?{id:other.id,k:other.k}:null})}o(d)});
  wrapAG('place',(o,d)=>{const seat=G.cur,S=G.ships[d.s];const fx=S.x,fy=S.y;o(d);rec({t:'place',seat,x:fx,y:fy,card:G.bd[fy*BW+fx]})});
  wrapAG('gateShip',(o,d)=>{const s=G.ships[d.seat];const from=s.on?s.on.slice():null;o(d);if(s.alive&&s.tp)rec({t:'warp',seat:d.seat,from,to:[s.tp.x,s.tp.y]})});
  const _pg=putGate;putGate=function(x,y){_pg(x,y);rec({t:'gate',x,y})};
  const _dt=destroyTile;destroyTile=function(x,y){const had=!!cellAt(G,x,y);_dt(x,y);if(had)rec({t:'destroy',x,y})};
  const _rm=removeMon;removeMon=function(id,why){const m=monById(id)||(G.arr&&G.arr.id===id?G.arr:null);rec({t:'rmon',id,why,k:m?m.k:'L',x:m?m.x:null,y:m?m.y:null,by:UI.actor});_rm(id,why)};
  const _el=eliminate;eliminate=function(seat,why,bonus){const s=G.ships[seat];const was=s.alive?{x:s.x,y:s.y,e:s.e,on:s.on?s.on.slice():null}:null;_el(seat,why,bonus);if(was)rec({t:'sink',seat,why,pos:was})};
  const _ws=waveSlot;waveSlot=function(s){const w=G.wave;const old=w?{x:w.x,y:w.y,r:w.r}:null;const r=_ws(s);if(r&&old)rec({t:'wave',from:old,off:!G.wave,to:G.wave?{x:G.wave.x,y:G.wave.y,r:G.wave.r,n:G.wave.n}:null});return r};
  const _ap=applyRes;applyRes=function(seat,r,o){const s=G.ships[seat];const x=s.x,y=s.y,e=s.e;_ap(seat,r,o);if(x==null)return;
    const steps=[];let ce=e;for(const p of r.path){const cell=cellAt(G,p[0],p[1]);if(!cell)break;const q=exitPort(cell,ce);steps.push({c:p[0],r:p[1],from:ce,to:q});ce=MATE[q]}
    rec({t:'sail',seat,st:r.st,steps,mon:r.id!=null?r.id:null,end:s.x!=null?{x:s.x,y:s.y,e:s.e}:null})};
  const _sp=AG.spawn;AG.spawn=function(d){const w0=G.wave;_sp(d);if(G.wave&&G.wave!==w0)rec({t:'wavenew',x:G.wave.x,y:G.wave.y,r:G.wave.r})};
}
// ---------- the kit mirror: what the kit is told to show, reconciled with G ----------
function kitReset(){try{TWKit.clearBoard();TWKit.rogueMarker('top',1,false);if(KS.wave)TWKit.rogueWaveTile(KS.wave.x,KS.wave.y,false);TWKit.highlightLine(null);for(const k in KS.gates){const a=k.split(',');TWKit.riftGate(+a[0],+a[1],false)}}catch(e){console.error(e)}
  KS={tiles:{},mons:{},ships:{},gates:{},mael:{},wave:null,hold:{}}}
const levArrows=id=>LEV[id].arr.map((a,i)=>({dir:a==='R'?1:DIRN[a]*2,n:i+1}));
function shipPos(s){if(!s.alive)return null;if(s.x==null){if(s.on)return {c:s.on[0],r:s.on[1],port:0};if(s.tp)return {c:s.tp.x,r:s.tp.y,port:0};return null}
  if(s.on)return {c:s.on[0],r:s.on[1],port:MATE[s.e]};return {c:s.x,r:s.y,port:s.e}}
function waveEdge(w){const r=w.r;return {edge:EDGES[r],index:(r&1)?w.y+1:w.x+1}}
function kitMon(m){const key=m.x+','+m.y;if(m.k==='M'){TWKit.maelstrom(m.x,m.y,true);KS.mael[key]=1;return}
  TWKit.placeLeviathan(m.x,m.y,{arrows:levArrows(m.id),rot:m.r,animate:false,kind:m.id%2?'dragon':'serpent'});KS.mons[key]=m.id+':'+m.r}
function kitWave(w,noline){if(KS.wave){TWKit.rogueWaveTile(KS.wave.x,KS.wave.y,false);TWKit.rogueMarker('top',1,false);TWKit.highlightLine(null);KS.wave=null}
  if(!w)return;TWKit.rogueWaveTile(w.x,w.y,true);const e=waveEdge(w);TWKit.rogueMarker(e.edge,e.index,true);TWKit.highlightLine((w.r&1)?{col:w.x}:{row:w.y});KS.wave={x:w.x,y:w.y,r:w.r}}
function kitSync(){if(!G||!kitOk())return;
  const want={};for(let y=0;y<BW;y++)for(let x=0;x<BW;x++){const c=G.bd[y*BW+x];if(c)want[x+','+y]=c[0]+':'+c[1]}
  for(const k in KS.tiles)if(want[k]!==KS.tiles[k]){const a=k.split(',');TWKit.removeTile(+a[0],+a[1]);delete KS.tiles[k]}
  for(const k in want)if(KS.tiles[k]!==want[k]){const a=k.split(',').map(Number),c=G.bd[a[1]*BW+a[0]];TWKit.placeTile(a[0],a[1],{paths:pathsOf(c[0],c[1]),animate:false});KS.tiles[k]=want[k]}
  const wm={},wM={};for(const m of G.mons){const k=m.x+','+m.y;if(m.k==='M')wM[k]=1;else wm[k]=m.id+':'+m.r}
  for(const k in KS.mons)if(wm[k]!==KS.mons[k]){const a=k.split(',');TWKit.removeLeviathan(+a[0],+a[1],{silent:true});delete KS.mons[k]}
  for(const k in KS.mael)if(!wM[k]){const a=k.split(',');TWKit.maelstrom(+a[0],+a[1],false);delete KS.mael[k]}
  for(const m of G.mons){const k=m.x+','+m.y;if(m.k==='M'?!KS.mael[k]:KS.mons[k]!==m.id+':'+m.r)kitMon(m)}
  const wg={};for(const g of G.gates)wg[g.x+','+g.y]=1;for(const k in KS.gates)if(!wg[k]){const a=k.split(',');TWKit.riftGate(+a[0],+a[1],false);delete KS.gates[k]}
  for(const k in wg)if(!KS.gates[k]){const a=k.split(',');TWKit.riftGate(+a[0],+a[1],true);KS.gates[k]=1}
  const w=G.wave,kw=KS.wave;if((w&&(!kw||kw.x!==w.x||kw.y!==w.y||kw.r!==w.r))||(!w&&kw))kitWave(w);
  if(G.q&&G.q.kind!=='doom'&&false){}
  const pend=!!G.q;
  for(const s of G.ships){const id=sid(s.i),k=KS.ships[id],p=shipPos(s);
    if(!s.alive||!p){if(k){TWKit.removeShip(id);delete KS.ships[id];delete KS.hold[s.i]}continue}
    if(!pend)delete KS.hold[s.i];
    if(!k){TWKit.addShip(id,{color:colOf(s.i).id,c:p.c,r:p.r,port:p.port,splash:false});KS.ships[id]={c:p.c,r:p.r,port:p.port};continue}
    if(KS.hold[s.i])continue;
    if(k.c!==p.c||k.r!==p.r||k.port!==p.port){TWKit.setShipAt(id,p);KS.ships[id]={c:p.c,r:p.r,port:p.port}}}
  for(const id in KS.ships)if(!G.ships[+id.slice(1)]){TWKit.removeShip(id);delete KS.ships[id]}
}
// ===================== part 2: replay one move, one beat at a time =====================
function say(text,cls,sub){UI.res={text,cls:cls||'',sub:sub||''};renderRes();const l=$('#live');if(l)l.textContent=text}
async function kitWait(p,max){if(!p||!p.then)return;await Promise.race([p,sleep(max||2500)])}
function stepsLen(steps){return steps.length}
async function playEvents(evs,gen){
  UI.skip=false;
  for(const e of evs){if(UI.skip||UI.gen!==gen||!UI.started)break;try{await playEv(e,gen)}catch(x){console.error(x)}}
  if(UI.gen===gen){UI.res=null}
}
async function playEv(e,gen){
  switch(e.t){
  case 'log':{if(/^Turn \d+/.test(e.text)){say(e.text,'');await sleep(260)}else{say(e.text,e.c==='bad'?'bad':e.c==='big'?'big':'');await sleep(e.c==='bad'?950:720)}break}
  case 'turn':{UI.curTurn=e.seat;renderRoad();break}
  case 'dice':{UI.dice={d:e.d,roll:true,seat:e.seat};UI.trig.roll=1;sfx('dice_roll');renderRes();await sleep(750);UI.dice.roll=false;renderRes();
    const t=e.d[0]+e.d[1];say(`${nm(e.seat)} rolls ${e.d[0]} + ${e.d[1]} = ${t}. `+(t>=6&&t<=8?'The leviathans stir!':'The sea is calm.'),t>=6&&t<=8?'big':'');await sleep(850);break}
  case 'monact':{if(e.turned){const m=monById(e.id);if(m&&KS.mons[m.x+','+m.y]){TWKit.placeLeviathan(m.x,m.y,{arrows:levArrows(m.id),rot:m.r,animate:false});KS.mons[m.x+','+m.y]=m.id+':'+m.r;sfx('splash');await sleep(350)}}UI.trig.move=1;break}
  case 'place':{const k=e.x+','+e.y;sfx('tile_place');KS.tiles[k]=e.card[0]+':'+e.card[1];TWKit.ghost(null);await kitWait(TWKit.placeTile(e.x,e.y,{paths:pathsOf(e.card[0],e.card[1])}),1800);await sleep(120);break}
  case 'sail':{const id=sid(e.seat),k=KS.ships[id];if(!k||!e.steps.length)break;
    sfx('ship_creak');sfx('ship_glide',{at:.1});if(e.steps.length>2)sfx('wake_swish',{at:.2});
    const last=e.steps[e.steps.length-1];await kitWait(TWKit.moveShip(id,e.steps),4500);KS.ships[id]={c:last.c,r:last.r,port:last.to};
    if(e.st==='edge'||e.st==='mon')KS.hold[e.seat]=1;await sleep(150);break}
  case 'warp':{const id=sid(e.seat);if(!KS.ships[id])break;const a=e.from||[e.to[0],e.to[1]];sfx('rift_gate');await kitWait(TWKit.riftWarp(id,{c:a[0],r:a[1]},{c:e.to[0],r:e.to[1]},{port:0}),3000);KS.ships[id]={c:e.to[0],r:e.to[1],port:0};say(`${nm(e.seat)} is carried through the Rift Gate!`,'big');await sleep(500);break}
  case 'gate':{sfx('rift_gate');KS.gates[e.x+','+e.y]=1;await kitWait(TWKit.riftGate(e.x,e.y,true,{color:'violet'}),1500);break}
  case 'arrive':{const key=e.x+','+e.y;
    if(e.k==='M'){if(e.from){TWKit.maelstrom(e.from[0],e.from[1],false);delete KS.mael[e.from[0]+','+e.from[1]]}sfx('maelstrom');if(KS.tiles[key]){TWKit.destroyTile(e.x,e.y);delete KS.tiles[key]}TWKit.maelstrom(e.x,e.y,true);KS.mael[key]=1;await sleep(900);break}
    if(e.from){TWKit.removeLeviathan(e.from[0],e.from[1],{silent:true});delete KS.mons[e.from[0]+','+e.from[1]]}
    if(KS.tiles[key]){sfx('tile_destroyed');TWKit.destroyTile(e.x,e.y);delete KS.tiles[key];await sleep(450)}
    if(KS.mael[key]&&e.k==='L'){}
    sfx('leviathan_spawn');sfx('leviathan_roar',{at:.4});KS.mons[key]=e.id+':'+e.r;UI.trig.lev=1;if(e.spawn)UI.trig.move=1;
    await kitWait(TWKit.placeLeviathan(e.x,e.y,{arrows:levArrows(e.id),rot:e.r,kind:e.id%2?'dragon':'serpent'}),3000);await sleep(200);break}
  case 'destroy':{const key=e.x+','+e.y;if(KS.tiles[key]){sfx('tile_destroyed');TWKit.destroyTile(e.x,e.y);delete KS.tiles[key];await sleep(500)}break}
  case 'rmon':{const key=e.x+','+e.y;
    if(e.why==='cannon'){const sh=KS.ships[sid(e.by!=null?e.by:G.cur)];sfx('cannon');await kitWait(TWKit.cannonShot({from:sh?sid(e.by!=null?e.by:G.cur):{c:e.x,r:e.y},to:{c:e.x,r:e.y},hit:true}),2500)}else sfx('splash');
    if(e.k==='M'){TWKit.maelstrom(e.x,e.y,false);delete KS.mael[key]}else{TWKit.removeLeviathan(e.x,e.y);delete KS.mons[key]}await sleep(700);break}
  case 'sink':{const id=sid(e.seat),k=KS.ships[id];if(!k)break;const w=e.why;
    if(/collided/.test(w)){const partner=Object.keys(KS.ships).find(o=>o!==id&&!KS.ships[o].dying&&KS.ships[o].c===k.c&&KS.ships[o].r===k.r&&KS.ships[o].port===k.port);
      sfx('crash');if(partner)await kitWait(TWKit.collide(id,partner),1500);sfx('ship_sink',{at:.3});TWKit.sinkShip(id,{how:'crash'});delete KS.ships[id];if(partner){TWKit.sinkShip(partner,{how:'crash'});delete KS.ships[partner]}await sleep(900);break}
    let how='wave',at;if(/Maelstrom/.test(w)){how='maelstrom';const m=G.mons.find(q=>q.k==='M')||(G.arr&&G.arr.k==='M'&&G.arr);if(m)at={c:m.x,r:m.y};sfx('maelstrom')}
    else if(/ran into|crushed|blocked/.test(w)){how='leviathan';const mm=e.pos&&e.pos.on?e.pos.on:(e.pos&&e.pos.x!=null?[e.pos.x,e.pos.y]:null);if(mm)TWKit.leviathanRoar(mm[0],mm[1]);sfx('leviathan_roar')}
    else if(/capsized/.test(w)){how='wave';sfx('rogue_wave')}else sfx('splash');
    sfx('ship_sink',{at:.2});delete KS.hold[e.seat];delete KS.ships[id];UI.trig.sunk=1;await kitWait(TWKit.sinkShip(id,{how,at}),2500);await sleep(250);break}
  case 'wavenew':{kitWave({x:e.x,y:e.y,r:e.r});sfx('rogue_wave');await sleep(1000);break}
  case 'wave':{sfx('rogue_wave');TWKit.shake&&TWKit.shake(.04,500);kitWave(e.to);await sleep(1000);break}
  }
}
// ===================== part 3: analysis and the dock =====================
function traceSteps(B,x,y,e,over){const st=[];let cx=x,cy=y,ce=e,n=0;
  for(;;){const cell=(cx===x&&cy===y&&over)?over:B.bd[cy*BW+cx];if(!cell)break;const q=exitPort(cell,ce);st.push({c:cx,r:cy,from:ce,to:q});
    const nx=cx+DIR[q>>1][0],ny=cy+DIR[q>>1][1];if(!inB(nx,ny)||monAt(B,nx,ny)||gateAt(B,nx,ny))break;cx=nx;cy=ny;ce=MATE[q];if(++n>90)break}
  return st}
// what a placement does, straight from the engine's own path rules (simPlace / follow)
function analyse(K,seat,m){const S=K.ships[m.s],tile=K.hands[seat][m.t];const sim=simPlace(K,S.x,S.y,tile,m.r);const mine=sim.res[m.s];
  const A={st:mine.st,coll:sim.coll.includes(m.s),mons:[],steps:traceSteps(K,S.x,S.y,S.e,[tile,m.r]),others:[]};
  if(mine.st==='ok'){A.end=[mine.x,mine.y];A.n=mine.path.length;for(const mo of K.mons){if(mo.k!=='L')continue;const near=[[mine.x,mine.y]];if(mine.on)near.push(mine.on);if(near.some(q=>Math.abs(q[0]-mo.x)+Math.abs(q[1]-mo.y)===1))A.mons.push(mo.id)}}
  else if(mine.st==='mon')A.mon=mine.id;
  A.others=sim.movers.filter(i=>i!==m.s).map(i=>({i,st:sim.res[i].st,coll:sim.coll.includes(i)}));
  A.bad=A.st==='edge'||A.st==='mon'||A.coll;return A}
function outcomeHTML(K,seat,m,A){const S=K.ships[m.s],who=m.s===seat?'Your junk':nm(m.s)+"'s junk";const o=[];
  if(A.st==='edge')o.push(`<span class="warn-l">This tile sends ${who.toLowerCase()==='your junk'?'you':nm(m.s)} off the edge: ${who} would sink.</span>`);
  else if(A.st==='mon')o.push(`<span class="warn-l">This current runs into ${levName(A.mon)}: ${who} would sink.</span>`);
  else if(A.st==='gate')o.push(`${who} sails into the Rift Gate and is thrown to a rolled square.`);
  else o.push(`${who} sails ${A.n} current${A.n>1?'s':''} and stops at column ${A.end[0]+1}, row ${A.end[1]+1}.`);
  if(A.coll)o.push(`<span class="warn-l">Two junks would end on one wake: both sink.</span>`);
  for(const x of A.others)o.push(x.coll?`<span class="warn-l">${nm(x.i)} also sails here and would crash.</span>`:x.st==='edge'||x.st==='mon'?`${nm(x.i)} also sails and would sink.`:`${nm(x.i)} also sails on.`);
  if(A.mons.length)o.push(`<span class="warn-l">${A.mons.map(levName).join(' and ')} would be right next to you.</span>`);
  return o.join('<br>')}
function nearWarn(K,seat){const S=K.ships[seat];if(!S||S.x==null)return '';const ids=adjMons(K,S);return ids.length?`<span class="warn-l">${ids.map(levName).join(' and ')} ${ids.length>1?'are':'is'} next to you.</span>`:''}
function recMove(d){const key=G.logN+':'+d;if(UI.recKey===key)return UI.recM;let m=null;try{m=aiMove(d,'hard')}catch(e){}UI.recKey=key;UI.recM=m;return m}
function recHTML(K,d,pl,full){const m=recMove(d);if(!m)return '';let why='',lab='';
  if(m.a==='place'){const A=analyse(K,d,m);const bad=pl.filter(x=>analyse(K,d,x).bad).length;lab=`tile ${m.t+1} turned ${m.r*90} degrees`;
    why=A.st==='ok'?`It carries you ${A.n} current${A.n>1?'s':''} to column ${A.end[0]+1}, row ${A.end[1]+1}`+(A.mons.length?' (a leviathan is close, but the other options are worse)':K.mons.some(q=>q.k==='L')?`, ${distMon(K,A.end)} square${distMon(K,A.end)===1?'':'s'} from the nearest leviathan`:'')+'.':A.st==='gate'?'It leads into the Rift Gate.':'Every placement is risky; this one is the least bad.';
    why+=` ${bad} of ${pl.length} placements would sink you.`}
  else if(m.a==='cannon'){lab=`fire the Deck Cannon at ${levName(m.m)}`;why='It removes a leviathan that is next to you.'}
  else if(m.a==='gate'){lab='play the Rift Gate';why='It moves you away from danger.'}else{lab='pass';why='You have nothing to play.'}
  return `<div class="rec"><b>Safest move:</b> ${lab}.${full?` <span class="tiny">${why}</span>`:''}${m.a==='place'?` <button class="btn small" data-a="sugg">Set it up</button>`:''}</div>`}
const cardBack=()=>`<svg class="cardart" viewBox="0 0 100 100"><rect x="3" y="3" width="94" height="94" rx="10" fill="#14606b" stroke="#e3b24b" stroke-width="3"/><path d="M20 62q10-12 20 0t20 0t20 0M20 44q10-12 20 0t20 0t20 0" fill="none" stroke="#e3b24b" stroke-width="3"/></svg>`;
const gateArt=()=>`<svg class="cardart" viewBox="0 0 100 100"><rect x="3" y="3" width="94" height="94" rx="10" fill="#3b2a66" stroke="#e3b24b" stroke-width="3"/><circle cx="50" cy="50" r="24" fill="#6d3fd0" stroke="#35e0ff" stroke-width="5"/><circle cx="50" cy="50" r="12" fill="#c9b3ff"/></svg>`;
const cannonArt=()=>`<svg class="cardart" viewBox="0 0 100 100"><rect x="3" y="3" width="94" height="94" rx="10" fill="#3a3f46" stroke="#e3b24b" stroke-width="3"/><rect x="22" y="40" width="50" height="20" rx="8" fill="#14171a" transform="rotate(-18 50 50)"/><circle cx="34" cy="68" r="10" fill="#7a5a14"/><circle cx="76" cy="38" r="5" fill="#ffb347"/></svg>`;
function cardBtn(c,t,o){o=o||{};const sel=o.sel;const own=o.owner;
  if(!o.up)return `<button class="hc back" disabled data-owner="${own}" data-up="0" aria-label="Hidden tile">${cardBack()}</button>`;
  if(c===GATE_ID)return `<button class="hc sp${sel?' sel':''}" data-a="card" data-t="${t}" data-owner="${own}" data-up="1" aria-label="Rift Gate"><span class="n">${t+1}</span>${gateArt()}<span class="lbl">Rift Gate</span></button>`;
  if(isCannon(c))return `<button class="hc sp${sel?' sel':''}" data-a="card" data-t="${t}" data-owner="${own}" data-up="1" aria-label="Deck Cannon"><span class="n">${t+1}</span>${cannonArt()}<span class="lbl">Deck Cannon</span></button>`;
  return `<button class="hc${sel?' sel':''}" data-a="card" data-t="${t}" data-owner="${own}" data-up="1" aria-label="Current tile ${t+1}"><span class="n">${t+1}</span><img alt="" src="${TWKit.cardURL(BASE_PATHS[CUR_TYPE[c]],{rot:sel?o.rot:0,selected:!!sel,uid:'c'+t,size:96})}"></button>`}
// who may see a hand right now: the seat that holds the device (hot-seat), the one human (me vs computers); never anyone else's
function viewSeat(){if(!G)return -1;if(NET.on)return NET.mySeat;const h=humans();if(h.length===1)return h[0];if(h.length>=2)return UI.holder;return -1}
function mustPass(d){if(NET.on)return !!G.seats[d].human&&d!==NET.mySeat;return hotSeat()&&G.seats[d].human&&UI.holder!==d}
function handStrip(vs,interactive,sel,rot){if(vs<0||!G.ships[vs].alive&&!G.hands[vs].length)return '';const hd=G.hands[vs];if(!hd.length)return '';
  return `<div class="hand" data-hand="${vs}">${hd.map((c,t)=>cardBtn(c,t,{up:true,owner:vs,sel:interactive&&sel&&sel.t===t,rot})).join('')}</div>`}
function startHTML(d){const mv=validMoves(d);const by={};for(const m of mv){const pe=TWKit.portEdge(m.x,m.y,m.e);if(!pe)continue;(by[pe.edge+pe.index]=by[pe.edge+pe.index]||[]).push(m)}
  let g='';for(const ed of EDGES){g+=`<span>${ed[0].toUpperCase()+ed.slice(1)}</span>`;for(let i=1;i<=6;i++){const l=(by[ed+i]||[]).sort((a,b)=>a.e-b.e);
    g+=`<span style="display:flex;gap:2px">${[0,1].map(k=>{const m=l[k];return m?`<button class="btn small" style="min-width:0;flex:1" data-a="startmark" data-x="${m.x}" data-y="${m.y}" data-e="${m.e}" aria-label="${ed} ${i}${'ab'[k]}">${i}${'ab'[k]}</button>`:`<button class="btn small" style="min-width:0;flex:1" disabled>${i}${'ab'[k]}</button>`}).join('')}</span>`}}
  return `<div class="prompt"><h4>${d===viewSeat()||humans().length===1?'Choose your start':nm(d)+': choose a start'}</h4><p>Tap a gold mark on the edge of the chart, or pick one here (edge, number, left/right mark).</p><div class="startpick" style="grid-template-columns:auto repeat(6,1fr)">${g}</div></div>`}
function questionHTML(d,K){const q=G.q;let extra='';
  if(q.kind==='bonus'&&G.cur===d&&G.pool.length)extra=`<p class="tiny">Sunken crews' tiles (numbered):</p><div class="hand">${G.pool.map((c,j)=>isCur(c)?`<span class="hc"><span class="n">${j+1}</span><img alt="" src="${TWKit.cardURL(BASE_PATHS[CUR_TYPE[c]],{uid:'pl'+j,size:96})}"></span>`:`<span class="hc sp"><span class="n">${j+1}</span>${isGate(c)?gateArt():cannonArt()}</span>`).join('')}</div>`;
  const timed=UI.qTime>0&&q.kind==='doom';
  return `<div class="prompt ${q.kind==='doom'?'alert':'ask'}" data-qkind="${q.kind}"><h4>${q.kind==='doom'?'Quick: your junk is in danger!':'Choose'}</h4><p>${esc(q.title)}</p>${extra}<div class="opts">${q.opts.map((o,i)=>`<button class="btn${/Accept/.test(o.l)?' warn':''}" data-a="q" data-i="${i}">${esc(o.l)}</button>`).join('')}</div>${timed?`<div class="qtimer" title="Time left"><i id="qbar"></i></div><p class="tiny" id="qtxt">${UI.qTime} s to decide, then the computer's best advice is used.</p>`:''}</div>`}
function placeHTML(d,K){const mv=validMoves(d);const pl=mv.filter(m=>m.a==='place'),gts=mv.filter(m=>m.a==='gate'),cns=mv.filter(m=>m.a==='cannon'),pas=mv.find(m=>m.a==='pass');
  const hand=K.hands[d];let sel=UI.sel;const fronts=[...new Set(pl.map(m=>m.s))];
  if(pl.length){if(!sel||!pl.some(m=>m.t===sel.t)||!fronts.includes(sel.s)){const f=pl.find(m=>m.s===d)||pl[0];sel=UI.sel={t:f.t,r:(sel&&sel.r)||0,s:f.s}}}
  UI.canPlace=pl.length>0;UI.moves=mv;let h='';
  const full=UI.guide==='full';
  let outcome='',m=null,A=null,btn='';
  if(pl.length&&isCur(hand[sel.t])){m={a:'place',t:sel.t,r:sel.r,s:sel.s};A=analyse(K,d,m);
    const err=legal(m,d);outcome=outcomeHTML(K,d,m,A);
    btn=`<button class="btn pri" data-a="place" ${err?'disabled':''}>Place tile ${sel.t+1}</button>`+(err?`<span class="tiny warn-l">${A.bad?'Not allowed while a safer placement exists.':'Not allowed.'}</span>`:'');
    UI.A=A}
  else{UI.A=null;if(pl.length&&hand[sel.t]!=null){const c=hand[sel.t];const g=gts.find(x=>x.t===sel.t&&x.s===sel.s);if(g)btn=`<button class="btn pri" data-a="gate" data-t="${g.t}" data-s="${g.s}">Play the Rift Gate here</button>`}}
  const fr=fronts.length>1?`<p class="tiny">Which junk gets the tile? ${fronts.map(s=>`<button class="btn small${sel&&sel.s===s?' on':''}" data-a="target" data-s="${s}">${dot(s)} ${esc(nm(s))}</button>`).join(' ')}</p>`:'';
  const wr=nearWarn(K,d);
  const rot=pl.length?`<div class="hacts"><button class="btn small" data-a="rot" data-d="-1" aria-label="Turn left" title="Turn left (Q)">&#10226; Left</button><button class="btn small" data-a="rot" data-d="1" aria-label="Turn right" title="Turn right (R)">&#10227; Right</button></div>`:'';
  h+=`<div class="prompt"><h4>${hotSeat()||humans().length>1?esc(nm(d))+': lay a current':'Your turn: lay a current'}</h4><div class="hand" data-hand="${d}">${hand.map((c,t)=>cardBtn(c,t,{up:true,owner:d,sel:sel&&sel.t===t,rot:sel&&sel.r})).join('')}${rot}</div>${fr}`;
  if(outcome)h+=`<p style="margin:6px 0 4px">${outcome}</p>`;if(wr)h+=`<p style="margin:2px 0">${wr}</p>`;
  h+=`<div class="row">${btn}`;
  for(const c of cns)h+=`<button class="btn warn" data-a="cannon" data-t="${c.t}" data-m="${c.m}" data-s="${c.s}">Fire cannon at ${esc(levName(c.m))}</button>`;
  if(gts.length&&!(pl.length&&isGate(hand[sel.t])))h+=gts.map(g=>`<button class="btn" data-a="gate" data-t="${g.t}" data-s="${g.s}">Play Rift Gate${g.s!==d?' for '+esc(nm(g.s)):''}</button>`).filter((x,i,a)=>a.indexOf(x)===i).join('');
  if(pas)h+=`<button class="btn" data-a="pass">Nothing to play: pass</button>`;
  h+=`</div></div>`;
  if(pl.length){if(full)h+=recHTML(K,d,pl,true);else if(UI.hint)h+=recHTML(K,d,pl,true);else h+=`<div class="row"><button class="btn small" data-a="hint">Show the safest move</button></div>`}
  else if(cns.length||gts.length||pas)h+=full||UI.hint?recHTML(K,d,pl,true):'';
  return h}
function passHTML(d){return `<div class="prompt passbox"><div class="big">${dot(d)} Pass the device to ${esc(nm(d))}</div><p>Hands are hidden until ${esc(nm(d))} takes the device.${G.q&&G.q.who===d?' '+esc(nm(d))+' must make a quick decision.':''}</p><button class="btn pri" data-a="take" data-seat="${d}">I am ${esc(nm(d))}</button></div>`}
function overHTML(){const o=G.over,w=o.win||[];const humansWin=w.some(i=>G.seats[i].human);
  return `<div class="prompt ${w.length?'':'alert'}" data-over="1"><h4>${w.length?(w.length>1?'Shared victory!':'Victory!'):'Lost at sea'}</h4><p>${w.map(i=>dot(i)+' <b>'+esc(nm(i))+'</b>').join(', ')||'Nobody'} ${w.length?'won':''}. ${esc(o.why)}</p><p class="tiny">${G.turn} turns, ${G.ships.filter(s=>s.alive).length} junk(s) afloat, ${G.stats.levMove||0} leviathan moves.</p>${isClient()?'<p class="tiny">Waiting for the host to start another game.</p><div class="row"><button class="btn" data-a="netleave">Leave</button><button class="btn" data-gx="rulesd">Rules</button></div>':'<div class="row"><button class="btn pri" data-a="again">Play again</button><button class="btn" data-a="newgame">New game</button><button class="btn" data-gx="rulesd">Rules</button></div>'}</div>`}
function mainHTML(){
  if(G.over)return overHTML();const d=sideToAct(),vs=viewSeat();
  if(UI.busy)return `<div class="prompt"><h4>${esc(UI.curTurn!=null&&G.seats[UI.curTurn]?nm(UI.curTurn):'The sea')} ...</h4><p class="tiny">Watch the board.</p><button class="btn small" data-a="skip">Skip animation</button></div>`+handStrip(vs,false);
  if(d<0)return '';const dh=G.seats[d].human;
  if(NET.on&&dh&&d!==NET.mySeat)return netWaitHTML(d,vs);
  if(dh&&mustPass(d))return passHTML(d);
  if(dh){UI.V={seat:d};
    if(G.q)return questionHTML(d)+handStrip(vs,false);
    if(G.phase==='setup')return startHTML(d);
    if(G.step==='act'){return placeHTML(d,knowledge(d))}return ''}
  return `<div class="prompt"><h4>${dot(d)} ${esc(nm(d))} is thinking...</h4><div class="row">${humans().length===0?`<button class="btn small" data-a="pause">${UI.pause?'Resume':'Pause'}</button>`:''}</div></div>`+handStrip(vs,false)}
// ===================== part 4: the rest of the dock, popups, start screen =====================
function renderBar(){const el=$('#barstat');if(!el||!G)return;const L=G.mons.filter(m=>m.k==='L').length;
  el.innerHTML=G.phase==='setup'?`<span class="lg">Choose start marks</span>`:`<span class="lg">Turn <b>${G.turn}</b></span><span class="lg">Pile <b>${G.deck.length}</b></span><span>Leviathans <b>${L}</b></span>${UI.lastRoll?`<span class="lg">Roll <b>${UI.lastRoll[0]}+${UI.lastRoll[1]}</b></span>`:''}`;
  $('#dockt').textContent=G.over?'Game over':UI.busy?'Watch the sea':G.phase==='setup'?'Start marks':'What to do now'}
function renderRoad(){const el=$('#road');if(!el||!G)return;const cur=UI.busy&&UI.curTurn!=null?UI.curTurn:G.phase==='setup'?G.order[G.sp]:G.cur;
  el.innerHTML=G.order.map(i=>{const s=G.ships[i];const me=viewSeat()===i;return `<span class="rs${i===cur&&!G.over?' cur':''}${s.alive?'':' dead'}${me?' me':''}" title="${esc(G.seats[i].human?'Human':'Computer ('+G.seats[i].lv+')')}">${dot(i)}${esc(nm(i))}${G.team?` <small>${'AB'[G.team[i]]}</small>`:''}${s.alive&&G.phase==='play'?` <small>${G.hands[i].length}t</small>`:''}</span>`}).join('')}
function renderSteps(){const el=$('#stepsw');if(!el||!G)return;if(G.phase==='setup'||G.over){el.innerHTML='';el.hidden=true;return}el.hidden=false;
  const st=UI.busy?(UI.stepNow!=null?UI.stepNow:0):(G.step==='act'?1:0);const names=['1 Roll','2 Place','3 Sail','4 Draw'];
  el.innerHTML=names.map((n,i)=>`<span class="${i===st?'on':i<st?'done':''}">${n}</span>`).join('')}
function renderRes(){const el=$('#res');if(!el)return;let h='';
  if(UI.dice)h+=`<div class="dice"><span class="die g${UI.dice.roll?' roll':''}">${UI.dice.roll?'?':UI.dice.d[0]}</span><span class="die b${UI.dice.roll?' roll':''}">${UI.dice.roll?'?':UI.dice.d[1]}</span><span class="tiny">gold = column, blue = row</span></div>`;
  if(UI.res)h+=`<div class="res ${UI.res.cls}">${esc(UI.res.text)}</div>`;el.innerHTML=h;el.hidden=!h}
function lessonHTML(c){const g=UI.guide==='full';return `<div class="coach"><h4>${esc(c.t)}<button class="gsw full" data-a="guidetoggle" title="Turn the guide down">Guide: Full</button></h4><p>${esc(c.x)}</p><button class="btn small" data-a="coachok">Got it</button></div>`}
function nextLesson(){for(const c of COACH){if(c.id==='start'&&G&&G.phase!=='setup')UI.seen.start=1;if(UI.trig[c.id]&&!UI.seen[c.id])return c}return null}
function coachTriggers(){if(!G||G.over&&false)return;const d=sideToAct();const mine=d>=0&&G.seats[d].human&&!UI.busy&&!mustPass(d);
  if(mine&&G.phase==='setup')UI.trig.start=1;
  if(mine&&G.phase==='play'&&G.step==='act'&&!G.q){UI.trig.cur=1;if(UI.seen.cur){if(UI.A&&UI.A.st==='edge'||G.turn>=3)UI.trig.edge=1;if(UI.seen.edge&&(G.turn>=4||(UI.A&&UI.A.coll)))UI.trig.coll=1}
    const S=G.ships[d];if(S&&S.x!=null&&G.mons.some(m=>m.k==='L'&&Math.abs(m.x-S.x)+Math.abs(m.y-S.y)<=2))UI.trig.lev=1}
  if(G.stats&&G.stats.refill)UI.trig.min3=1;if(G.over)UI.trig.end=1}
function renderCoach(){const el=$('#coach');if(!el)return;
  if(UI.confirm){const to=UI.confirm==='light';el.innerHTML=`<div class="coach"><h4>${to?'Turn the guide down?':'Resume the full guide?'}</h4><p>${to?'You will keep warnings and a "safest move" button, and lessons wait for you.':'Lessons you have not seen will continue where they stopped.'}</p><div class="row"><button class="btn small pri" data-a="guideyes">${to?'Yes, Light':'Yes, Full'}</button><button class="btn small" data-a="guideno">Keep ${to?'Full':'Light'}</button></div></div>`;return}
  if(UI.guide==='full'){const c=!UI.busy&&nextLesson();if(c){el.innerHTML=lessonHTML(c);return}el.innerHTML=`<div class="coach light"><button class="gsw full" data-a="guidetoggle">Guide: Full</button> <span class="tiny">lessons appear as things happen</span></div>`;return}
  el.innerHTML=UI.guided?`<div class="coach light"><button class="gsw" data-a="guidetoggle">Guide: Light</button></div>`:''}
function kitOverlay(){if(!G||!kitOk())return;let legal=[];const gh=UI.gh;UI.gh=null;
  if(!UI.busy&&!G.over){const d=sideToAct();if(d>=0&&G.seats[d].human&&!mustPass(d)){
    if(G.q){const q=G.q;if(q.kind==='gatePlace'&&q.ctx)legal=[{c:q.ctx.tx,r:q.ctx.ty}];else for(const o of q.opts)if(o.d&&o.d.x!=null&&(o.h==='dGateAt'||o.h==='dReloc'))legal.push({c:o.d.x,r:o.d.y})}
    else if(G.phase==='play'&&G.step==='act'&&UI.canPlace&&UI.fronts)legal=UI.fronts.map(s=>({c:G.ships[s].x,r:G.ships[s].y}))}}
  try{TWKit.setLegal(legal);if(gh&&!UI.busy)TWKit.ghost(gh.x,gh.y,BASE_PATHS[CUR_TYPE[gh.card]],{rot:gh.rot,valid:gh.valid,trace:gh.trace});else TWKit.ghost(null)}catch(e){console.error(e)}}
function musicEval(){if(!G||!G.ships)return;let tense=false;const alive=G.ships.filter(s=>s.alive);if(alive.length<=2&&G.np>2)tense=true;
  for(const s of alive){const p=shipPos(s);if(!p)continue;for(const m of G.mons)if(m.k==='L'&&Math.abs(m.x-p.c)+Math.abs(m.y-p.r)<=2)tense=true}musicMood(tense&&!G.over?'tension':'calm')}
function render(){if(!G||!UI.started)return;try{if(window.PerfHUD)PerfHUD.wake()}catch(e){}
  UI.gh=null;UI.fronts=null;UI.canPlace=false;UI.A=null;
  const d=sideToAct();const key=G.over?'over':d+':'+G.logN+':'+G.phase+(G.q?G.q.kind:'');
  const html=mainHTML();$('#main').innerHTML=html;
  if(!UI.busy&&UI.canPlace&&UI.sel){const pl=UI.moves.filter(m=>m.a==='place');UI.fronts=[...new Set(pl.map(m=>m.s))];const c=G.hands[d][UI.sel.t];if(c!=null&&isCur(c)&&UI.A){const S=G.ships[UI.sel.s];UI.gh={x:S.x,y:S.y,card:c,rot:UI.sel.r,valid:!UI.A.bad,trace:UI.A.steps}}}
  if(key!==UI.lastKey){UI.lastKey=key;if(!UI.busy&&d>=0&&G.seats[d].human&&!mustPass(d)&&!G.over)sfx('turn')}
  if(!UI.busy&&d>=0&&G.seats[d].human&&!G.over&&!mustPass(d))GX.showDock();
  coachTriggers();renderBar();renderRoad();renderSteps();renderRes();renderCoach();kitOverlay();musicEval();
  const t=$('#chip');if(t)t.textContent=!UI.busy&&G.phase==='setup'&&d>=0&&G.seats[d].human&&!mustPass(d)?'Tap a gold mark on the edge':'';
  if(GX.open)renderOpenDrawer();qTimerSync();netAfter()}
function refresh(){if(!G||!UI.started||UI.acting)return;kitSync();render()}
// ---------- interrupt timer ----------
function qTimerSync(){const q=G&&G.q;if(!q||q.kind!=='doom'||(UI.qTime<=0&&!NET.on)||UI.busy||!G.seats[q.who].human||(NET.on?isClient()&&q.who!==NET.mySeat:mustPass(q.who))){UI.qKey=null;return}
  const key=G.logN+':'+q.who;if(UI.qKey!==key){UI.qKey=key;UI.qT0=Date.now()}}
setInterval(()=>{try{if(!G||!UI.qKey||UI.pause)return;const q=G.q;if(!q){UI.qKey=null;return}const QT=UI.qTime>0?UI.qTime:25;const el=(Date.now()-UI.qT0)/1000*(UI.tickRate||1),left=QT-el;const b=$('#qbar');if(b)b.style.width=Math.max(0,left/QT*100)+'%';const tx=$('#qtxt');if(tx)tx.textContent=Math.max(0,Math.ceil(left))+' s to decide, then the computer\'s best advice is used.';
  if(left<=0){if(isClient())return;UI.qKey=null;const who=q.who;let m=null;try{m=aiMove(who,'hard')}catch(e){}if(!m||m.a!=='q')m={a:'q',i:q.opts.length-1};say('Time is up: the computer chose for '+nm(who)+'.','bad');NET.autoDecl++;actAs(m,who)}}catch(e){console.error(e)}},200);
// ---------- acting ----------
function act(m,seat){if(NET.on){const nr=netAct(m,seat);if(nr!==undefined)return nr}if(!G||UI.busy||G.over)return false;
  UI.rec=[];UI.acting=1;UI.actor=seat;let r;try{r=performMove(m,seat)}finally{UI.acting=0}const evs=UI.rec;UI.rec=null;
  if(!r.success){sfx('error');say(r.error,'bad');return false}
  UI.sel=null;UI.hint=false;if(hotSeat()&&G.seats[seat]&&G.seats[seat].human&&sideToAct()!==seat)UI.holder=-1;
  for(const e of evs){if(e.t==='dice')UI.lastRoll=e.d}
  afterMove(evs);return true}
function afterMove(evs){saveAll();UI.stepNow=0;
  const finish=()=>{UI.busy=false;UI.dice=null;UI.res=null;if(!G.q)KS.hold={};kitSync();render();overCheck();schedule();if(NET.on)netDrain()};
  if(ANIM&&evs.some(e=>e.t!=='log')&&UI.started){const gen=UI.gen;UI.busy=true;render();playEvents(evs,gen).then(()=>{if(UI.gen!==gen)return;finish()})}
  else finish()}
function overCheck(){if(G&&G.over&&!UI.overSeen){UI.overSeen=1;const w=G.over.win||[];musicStop(.4);sndLoop('sea_loop',false);const mine=w.some(i=>G.seats[i].human)||!humans().length&&w.length;sfx(mine?'win':'lose');UI.trig.end=1;clearSave()}}
function schedule(){clearTimeout(UI.tm);if(isClient()||!G||!UI.started||G.over||UI.busy||UI.pause)return;const d=sideToAct();if(d<0||G.seats[d].human)return;UI.tm=setTimeout(aiAct,Math.max(0,(AIDELAY||0)/(UI.speed||1)))}
function aiAct(){if(isClient()||!G||!UI.started||UI.busy||UI.pause||G.over)return;const d=sideToAct();if(d<0||G.seats[d].human)return;const st=aiStep();if(!st)return;act(st.m,st.seat)}
function doPlace(){const d=sideToAct();const s=UI.sel;if(!s)return;const m={a:'place',t:s.t,r:s.r,s:s.s};act(m,d)&&sfx('confirm')}
function pickSquare(c,r){const d=sideToAct();if(d<0||!G.seats[d].human||UI.busy||mustPass(d))return;
  if(G.q){const o=G.q.opts.findIndex(x=>x.d&&x.d.x===c&&x.d.y===r&&(x.h==='dGateAt'||x.h==='dReloc'));if(o>=0)act({a:'q',i:o},d);return}
  if(G.phase==='play'&&G.step==='act'&&UI.fronts){const s=UI.fronts.find(i=>G.ships[i].x===c&&G.ships[i].y===r);if(s==null)return;if(UI.sel&&UI.sel.s===s&&UI.canPlace&&UI.A&&!UI.A.bad)doPlace();else if(UI.sel&&UI.sel.s!==s){UI.sel.s=s;render()}else if(UI.sel&&UI.A&&UI.A.bad){sfx('error')}else doPlace()}}
function onPick(p){if(!p||!G||!UI.started)return;const d=sideToAct();if(d<0||!G.seats[d].human||UI.busy||mustPass(d))return;
  if(p.kind==='start'){if(G.phase==='setup'&&!G.q)act({a:'start',x:p.c,y:p.r,e:p.port},d);return}
  if(p.kind==='ship'){const i=+String(p.id).slice(1);const S=G.ships[i];if(S&&S.x!=null)pickSquare(S.x,S.y);return}
  if(p.kind==='square')pickSquare(p.c,p.r)}
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-a]');if(!t||t.disabled)return;const a=t.dataset.a,d=G?sideToAct():-1;const D=t.dataset;
  if(netClick(a))return;
  if(['card','rot','sugg','place','startmark'].indexOf(a)<0)sfx('click');
  switch(a){
  case 'card':{if(!UI.sel||UI.busy)break;const ti=+D.t;if(UI.sel.t===ti&&isCur(G.hands[d][ti]))UI.sel.r=(UI.sel.r+1)%4;else{UI.sel.t=ti}sfx('tile_rotate');render();break}
  case 'rot':{if(!UI.sel)break;UI.sel.r=(UI.sel.r+(+D.d)+4)%4;sfx('tile_rotate');render();break}
  case 'place':doPlace();break;
  case 'target':if(UI.sel){UI.sel.s=+D.s;render()}break;
  case 'startmark':act({a:'start',x:+D.x,y:+D.y,e:+D.e},d);break;
  case 'q':sfx('click');act({a:'q',i:+D.i},d);break;
  case 'gate':act({a:'gate',t:+D.t,s:+D.s},d);break;
  case 'cannon':act({a:'cannon',t:+D.t,m:+D.m,s:+D.s},d);break;
  case 'pass':act({a:'pass'},d);break;
  case 'take':sfx('confirm');UI.holder=+D.seat;render();break;
  case 'skip':UI.skip=true;break;
  case 'pause':UI.pause=!UI.pause;if(!UI.pause)schedule();render();break;
  case 'hint':UI.hint=true;render();break;
  case 'sugg':{const m=UI.recM;if(m&&m.a==='place'&&UI.sel){UI.sel={t:m.t,r:m.r,s:m.s};sfx('tile_rotate');render()}break}
  case 'coachok':{const c=nextLesson();if(c){UI.seen[c.id]=1;saveAll();render()}break}
  case 'guidetoggle':UI.confirm=UI.guide==='full'?'light':'full';renderCoach();break;
  case 'guideyes':UI.guide=UI.confirm;UI.confirm=null;saveAll();render();break;
  case 'guideno':UI.confirm=null;render();break;
  case 'again':startGame(UI.lastSetup);break;
  case 'newgame':showStart();break;
  case 'snd':toggleSound();renderSettings();break;case 'mus':toggleMusic();renderSettings();break;
  case 'speed':UI.speed=+D.v;try{TWKit.setSpeed(UI.speed)}catch(x){}saveSettings();renderSettings();break;
  case 'gfx':try{TWKit.setQuality(D.v);if(window.PerfHUD)PerfHUD.hitch()}catch(x){}renderSettings();break;
  case 'animtog':UI.anim=!UI.anim;ANIM=UI.anim?1:0;saveSettings();renderSettings();break;
  case 'guidemenu':UI.guide=UI.guide==='full'?'light':'full';saveSettings();saveAll();renderSettings();if(G)render();break;
  case 'xray':UI.xray=!UI.xray;renderCrew();break;
  case 'restart':if(UI.lastSetup){GX.close();startGame(UI.lastSetup)}break;
  case 'tonew':GX.close();showStart();break;
  default:startAction(a,t)}})
document.addEventListener('keydown',e=>{if(!G||!UI.started||GX.open||!$('#start').hidden||e.ctrlKey||e.metaKey||e.altKey)return;const tg=e.target&&e.target.tagName;if(tg==='INPUT'||tg==='SELECT'||tg==='TEXTAREA')return;
  if(!UI.canPlace||UI.busy||!UI.sel)return;const d=sideToAct();if(d<0||mustPass(d))return;const k=e.key.toLowerCase();
  if(k>='1'&&k<='3'){const t=+k-1;if(G.hands[d][t]!=null){UI.sel.t=t;render()}}else if(k==='r'){UI.sel.r=(UI.sel.r+1)%4;sfx('tile_rotate');render()}else if(k==='q'){UI.sel.r=(UI.sel.r+3)%4;sfx('tile_rotate');render()}
  else if(k==='enter'&&!(tg==='BUTTON')){doPlace()}});
// ---------- popups ----------
function renderOpenDrawer(){const id=GX.open;if(id==='crewd')renderCrew();else if(id==='logd')renderLog();else if(id==='setd')renderSettings()}
function renderLog(){const b=$('#logbody');if(!G){b.innerHTML='<p>Start a game first.</p>';return}b.innerHTML=G.log.slice(0,200).map(l=>`<div class="logl ${l.c}">${esc(l.t)}</div>`).join('')}
function crewCards(h,own){return h.map(c=>isCur(c)?`<img alt="" width="54" height="54" src="${TWKit.cardURL(BASE_PATHS[CUR_TYPE[c]],{uid:'x'+Math.random().toString(36).slice(2,6),size:54})}">`:`<b>${isGate(c)?'Rift Gate':'Cannon'}</b> `).join('')}
function renderCrew(){const b=$('#crewbody');if(!G){b.innerHTML='<p>Start a game first.</p>';return}const watch=!humans().length;const L=G.mons.filter(m=>m.k==='L').length;
  let h=`<table class="lg2"><tr><th>Captain</th><th>Status</th><th>Tiles</th></tr>`+G.order.map(i=>{const s=G.ships[i];const see=watch&&UI.xray;
    return `<tr><td>${dot(i)} <b>${esc(nm(i))}</b>${G.team?' (team '+'AB'[G.team[i]]+')':''}<br><small>${G.seats[i].human?'Human':'Computer, '+G.seats[i].lv}</small></td><td>${s.alive?'afloat':'sunk: '+esc(s.out)}</td><td data-crewhand="${i}" data-up="${see?1:0}">${s.alive?(see?crewCards(G.hands[i]):'<span class="tiny">'+G.hands[i].length+' hidden</span>'):'-'}</td></tr>`}).join('')+`</table>`;
  if(watch)h+=`<p><button class="swt${UI.xray?' on':''}" data-a="xray"><i></i>Show every hand (watch mode)</button></p>`;
  h+=`<h3>Piles</h3><table class="lg2"><tr><td>Current pile</td><td>${G.deck.length} tiles</td></tr><tr><td>Leviathans on the board</td><td>${L}${G.mons.some(m=>m.k==='M')?' + Maelstrom':''}</td></tr><tr><td>Leviathan pile</td><td>${G.mdeck.length}</td></tr><tr><td>Gone for good</td><td>${G.mgone.length} leviathans, ${G.gone.length} tiles</td></tr>${G.gates.length?'<tr><td>Rift Gate</td><td>on column '+(G.gates[0].x+1)+', row '+(G.gates[0].y+1)+'</td></tr>':''}${G.wave?'<tr><td>Rogue Wave</td><td>column '+(G.wave.x+1)+', row '+(G.wave.y+1)+', strength '+waveStr()+'</td></tr>':''}</table>`;b.innerHTML=h}
function renderSettings(){const g=(()=>{try{return TWKit.getQuality()}catch(e){return {pref:'auto',active:'2d'}}})();const on3=!!(TWKit._K&&TWKit._K.on);const sp=[[.5,'Slow'],[1,'Normal'],[2,'Fast'],[5,'Very fast']];
  $('#setbody').innerHTML=`<div class="setgrid">
  <div><div class="lbl">Sound</div><div class="row"><button class="btn${SND.on?' on':''}" data-a="snd">Sound ${SND.on?'on':'off'}</button><button class="btn${SND.music?' on':''}" data-a="mus">Music ${SND.music?'on':'off'}</button></div></div>
  <div><div class="lbl">Computer captains' speed</div><div class="row">${sp.map(([v,l])=>`<button class="btn small${UI.speed===v?' on':''}" data-a="speed" data-v="${v}">${l}</button>`).join('')}<button class="btn small${UI.anim?' on':''}" data-a="animtog">Animations ${UI.anim?'on':'off'}</button></div></div>
  <div><div class="lbl">Graphics ${on3?`(now: ${esc(g.active)})`:'(2D chart: no WebGL here)'}</div><div class="row">${['auto','high','medium','low'].map(q=>`<button class="btn small${g.pref===q?' on':''}" data-a="gfx" data-v="${q}" ${on3?'':'disabled'}>${q[0].toUpperCase()+q.slice(1)}</button>`).join('')}</div><p class="tiny">Auto picks Low on a software graphics driver and steps down by itself if frames drop.</p><div id="perfslot" class="row">${window.PerfHUD&&PerfHUD.buttonsHTML?PerfHUD.buttonsHTML('btn small'):''}</div></div>
  <div><div class="lbl">Guide</div><div class="row"><button class="swt${UI.guide==='full'?' on':''}" role="switch" aria-checked="${UI.guide==='full'}" data-a="guidemenu"><i></i>Guide: ${UI.guide==='full'?'Full lessons':'Light (warnings only)'}</button></div></div>
  <div><div class="lbl">Game</div><div class="row">${isClient()?'<button class="btn small" data-a="netleave">Leave the online game</button>':''}${isClient()?'':G&&UI.started?'<button class="btn small" data-a="restart">Restart this setup</button>':''}${isClient()?'':'<button class="btn small" data-a="tonew">New game...</button>'}<button class="btn small" data-gx="credd">Credits</button></div></div></div>`}
function saveSettings(){lsSet('tw_set',{speed:UI.speed,guide:UI.guide,anim:UI.anim})}
function saveAll(){try{if(!NET.on&&G&&!G.over){saveGame();lsSet('tw_ui1',{cols:UI.cols,guide:UI.guide,seen:UI.seen,trig:UI.trig,guided:UI.guided,setup:UI.lastSetup})}}catch(e){}}
function clearSave(){if(NET.on)return;try{localStorage.removeItem(SAVE)}catch(e){}}
function savedGame(){try{const s=localStorage.getItem(SAVE);if(!s)return null;const g=JSON.parse(s);if(!g||g.phase==='over'||!g.seats)return null;return g}catch(e){return null}}
function piecesHTML(){const cnt=t=>1+(EXTRA_TYPES.indexOf(t)>=0?1:0);
  const exIcon={gate:`<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="16" fill="#6d3fd0" stroke="#e3b24b" stroke-width="4"/><circle cx="24" cy="24" r="7" fill="#c9b3ff"/></svg>`,wave:`<svg viewBox="0 0 48 48"><rect width="48" height="48" rx="8" fill="#1e4aa0"/><path d="M6 30q6-10 12 0t12 0t12 0M6 20q6-10 12 0t12 0t12 0" fill="none" stroke="#ffe9a8" stroke-width="4" stroke-linecap="round"/></svg>`,mael:`<svg viewBox="0 0 48 48"><rect width="48" height="48" rx="8" fill="#14606b"/><path d="M24 24m0-4a4 4 0 1 1-4 4a9 9 0 1 1 9 9a14 14 0 1 1-14-14" fill="none" stroke="#bff" stroke-width="3" stroke-linecap="round"/></svg>`,cannon:`<svg viewBox="0 0 48 48"><rect width="48" height="48" rx="8" fill="#3a3f46"/><rect x="8" y="18" width="26" height="10" rx="5" fill="#14171a" transform="rotate(-18 24 24)"/><circle cx="18" cy="34" r="6" fill="#7a5a14"/><circle cx="38" cy="16" r="3" fill="#ffb347"/></svg>`};
  return `<h3>Current tiles: 56 in the pile</h3><p class="tiny">35 different layouts (every way to join the 8 edge points in 4 pairs). The "x2" ones appear twice: we spread the 21 repeats evenly (our guess, the real list is unknown). A layout can be turned any of 4 ways.</p><div class="pgrid">${Array.from({length:35},(_,t)=>`<div class="pc"><img alt="Current layout ${t+1}" src="${TWKit.cardURL(BASE_PATHS[t],{uid:'pp'+t,size:96})}">${cnt(t)>1?'<span class="x2">x2</span>':''}#${t+1}</div>`).join('')}</div>
  <h3>Leviathans: 10 in the pile (our own layouts)</h3><p class="tiny">Arrow N on the tile = what die face N does. Arrows are shown for the tile facing north; a leviathan's facing is random when it rises and turns the arrows with it. The diagonal arrow is the quarter-turn. Face 6: it stays and another rises. The number is its move order, "gold" wins ties.</p>
  <div class="lgrid">${LEV.map(L=>`<div class="lcard"><img alt="${esc(L.nm)}" src="${TWKit.leviathanURL(levArrows(L.id),{uid:'lv'+L.id,size:84})}"><br><b>${esc(L.nm)}</b><br>Order ${L.order}${L.gold?' (gold)':''}<br>${L.arr.map((a,i)=>(i+1)+(a==='R'?(L.rd>0?'&#8635;':'&#8634;'):a)).join(' ')}</div>`).join('')}</div>
  <h3>Expansion pieces (Deepwater Perils)</h3><div class="xgrid"><div class="xcard">${exIcon.gate}<b>Rift Gate</b> x1<br><small>In the current pile. Stays on its square; sends junks and leviathans to a rolled square.</small></div><div class="xcard">${exIcon.wave}<b>Rogue Wave</b> x1 (+ edge marker)<br><small>In the leviathan pile. Sweeps a row or column; strength 2, then 3, then 4.</small></div><div class="xcard">${exIcon.mael}<b>Maelstrom</b> x1<br><small>In the leviathan pile. Moves on calm turns: 1 E, 2 S, 3 W, 4 N, 5-6 stays. Destroys what it enters.</small></div><div class="xcard">${exIcon.cannon}<b>Deck Cannon</b> x5<br><small>In the current pile, two per hand. Removes a leviathan about to sink you.</small></div></div>
  <h3>Other things on the board</h3><ul><li><b>Gold marks</b> on the edge: where junks start (two per number).</li><li><b>Gold line</b> on a tile preview: the exact path your junk will sail.</li><li><b>Teal frames</b>: squares you may choose.</li><li><b>Blue strip</b>: the Rogue Wave's row or column.</li></ul>`}
// ---------- start screen ----------
function defaultSetup(){const s=lsGet('tw_setup',null);const seats=[];for(let i=0;i<8;i++)seats.push({h:i===0,lv:'normal',col:[0,3,2,1,4,5,6,7][i]});
  return Object.assign({mode:'me',np:3,seats,exp:{rift:0,wave:0,maelstrom:0,cannon:0},variant:null,noMon:false},s&&s.seats&&s.seats.length===8?s:{})}
function applyMode(s,mode){s.mode=mode;s.seats.forEach((x,i)=>{x.h=mode==='hot'?true:mode==='me'?i===0:false})}
function modeOf(s){const n=s.variant==='solo'||s.variant==='easysolo'?1:s.np;const h=s.seats.slice(0,n).filter(x=>x.h).length;return h===0?'watch':h===1?'me':'hot'}
function renderStart(){const el=$('#start');const s=UI.setup=UI.setup||defaultSetup();const solo=s.variant==='solo'||s.variant==='easysolo';const n=solo?1:(s.variant==='teams'&&s.np<4?4:s.np);const mode=modeOf(s);const onl=isHost(),nOnl=onl?Math.min(8,NET.peers.length||1):0,onPlan=onl?netPlan(s):null;
  const seg=(act,cur,list,extra)=>`<span class="seg">${list.map(([v,l])=>`<button data-a="${act}" data-v="${v}"${extra||''} class="${String(cur)===String(v)?'on':''}">${l}</button>`).join('')}</span>`;
  const sv=(i)=>{const x=s.seats[i];if(onl&&i<nOnl)return `<div class="seat" data-seat="${i}"><span class="sw" style="background:${COL[x.col].sail}"></span><select data-a="col" data-i="${i}" aria-label="Colour of seat ${i+1}">${COL.map((c,k)=>`<option value="${k}"${k===x.col?' selected':''}>${c.name}</option>`).join('')}</select><span class="tag">Online: <b>${esc((onPlan&&onPlan.hum&&onPlan.hum[i]&&onPlan.hum[i].nm)||'Player')}</b></span></div>`;return `<div class="seat" data-seat="${i}"><span class="sw" style="background:${COL[x.col].sail}"></span><select data-a="col" data-i="${i}" aria-label="Colour of seat ${i+1}">${COL.map((c,k)=>`<option value="${k}"${k===x.col?' selected':''}>${c.name}</option>`).join('')}</select>
    <span class="seg">${[['1','Human'],['0','Computer']].map(([v,l])=>`<button data-a="seath" data-i="${i}" data-v="${v}" class="${(x.h?'1':'0')===v?'on':''}">${l}</button>`).join('')}</span>
    ${x.h?'<span></span>':`<select data-a="lv" data-i="${i}" aria-label="Level of seat ${i+1}">${['easy','normal','hard'].map(l=>`<option value="${l}"${x.lv===l?' selected':''}>${l}</option>`).join('')}</select>`}</div>`};
  const ex=[['rift','Rift Gate','A portal tile that rescues a junk or flings pieces across the sea.'],['wave','Rogue Wave','A wave that sweeps a row or column and can capsize junks.'],['maelstrom','Maelstrom','A whirlpool that moves on calm turns and destroys what it enters.'],['cannon','Deck Cannon','Five cannons in the tile pile: shoot a leviathan about to sink you.']];
  const cont=savedGame();
  el.innerHTML=`<div class="stin"><h1><svg class="ico" viewBox="0 0 24 24" style="width:44px;height:44px;stroke:#e3b24b"><path d="M3 17c3 2 6 2 9 0s6-2 9 0M12 3v11M12 4l6 7h-6M12 6l-5 6h5"/></svg>Tidewake</h1><p class="tag">Lay currents, steer your junk, outlast the leviathans. 1 to 8 captains, computers and hot-seat.</p>
  <div class="stcard"><h2>Quick start</h2><div class="row">${NET.on?'':'<button class="btn pri" data-a="guided">Guided first game (you vs an easy computer)</button>'}${cont&&!NET.on?`<button class="btn" data-a="cont">Continue saved game</button>`:''}<button class="btn" data-a="start" id="quickgo">Start with these settings</button></div><p class="tiny">${NET.on?'':'New here? The guided game explains currents, edges, collisions and leviathans one step at a time.'}</p></div>
  <div class="stcard"><h2>Play with friends</h2>${onlineBlock()}</div>
  <div class="stcols"><div class="stcard"><h2>How to play</h2><div class="row">${onl?'<span class="tiny">Online game: captains take seats in join order.</span>':seg('mode',mode,[['me','Me vs computers'],['hot','Hot-seat'],['watch','Watch']])}</div><p class="tiny">${onl?'Seats without an online captain are computers.':mode==='me'?'You are the first captain; the others are computers.':mode==='hot'?'Everyone shares this screen. Hands are hidden between players behind a pass screen.':'The computers play each other. Sit back.'}</p>
   <h2 style="margin-top:8px">Variant</h2><div class="row">${seg('var',s.variant||'std',[['std','Standard'],['solo','Solo'],['easysolo','Easy solo'],['teams','Teams']])}</div><p class="tiny">${s.variant==='solo'?'One junk, six leviathans: outlast all ten.':s.variant==='easysolo'?'Easy solo: our goal = survive 24 turns or empty the pile. Destroyed tiles are discarded.':s.variant==='teams'?'Two teams (every other seat); you may lay a tile for a teammate. Needs 4 or more captains.':'Last junk afloat wins.'}</p>
   <label class="opt"><input type="checkbox" data-a="nomon" ${s.noMon?'checked':''}><span>No leviathans (calm seas)<small>The official "no monsters" option.</small></span></label></div>
  <div class="stcard"><h2>Expansions: Deepwater Perils</h2>${ex.map(([k,l,d])=>`<label class="opt"><input type="checkbox" data-a="exp" data-k="${k}" ${s.exp[k]?'checked':''}><span><b>${l}</b><small>${d}</small></span></label>`).join('')}</div></div>
  <div class="stcard"><h2>Captains ${solo?'(solo: one junk)':''}</h2>${solo?'':`<div class="row" style="margin-bottom:6px"><span>Players:</span>${seg('np',n,[2,3,4,5,6,7,8].map(k=>[k,k]))}</div>`}${Array.from({length:Math.max(n,nOnl)},(_,i)=>sv(i)).join('')}</div>
  <div class="row"><button class="btn pri" data-a="start" id="startbtn">Set sail</button><button class="btn" data-gx="rulesd">Rules</button><button class="btn" data-gx="piecesd">Pieces</button><button class="btn" data-gx="credd">Credits</button></div></div>`}
function showStart(){if(isClient()){hideStart();return}UI.started=false;clearTimeout(UI.tm);UI.gen++;UI.busy=false;try{sndLoop('sea_loop',false);musicStop(.4);TWKit.setLegal([]);TWKit.ghost(null)}catch(e){}$('#start').hidden=false;GX.close();renderStart()}
function hideStart(){$('#start').hidden=true}
function startAction(a,t){const s=UI.setup=UI.setup||defaultSetup();const D=t.dataset;
  switch(a){
  case 'mode':applyMode(s,D.v);if(D.v==='hot'&&s.np<2)s.np=2;break;
  case 'np':s.np=+D.v;break;
  case 'var':s.variant=D.v==='std'?null:D.v;if(s.variant==='teams'&&s.np<4)s.np=4;break;
  case 'seath':s.seats[+D.i].h=D.v==='1';break;
  case 'start':if(!$('#start').hidden){lsSet('tw_setup',s);startGame(JSON.parse(JSON.stringify(s)));return}return;
  case 'guided':if(NET.on)return;startGuided();return;
  case 'cont':if(NET.on)return;resumeSaved();return;
  default:return}
  renderStart()}
document.addEventListener('change',e=>{const t=e.target;if(!t.dataset||!t.dataset.a)return;const s=UI.setup=UI.setup||defaultSetup();
  if(t.dataset.a==='col'){const i=+t.dataset.i,v=+t.value;const j=s.seats.findIndex((x,k)=>k!==i&&x.col===v);if(j>=0)s.seats[j].col=s.seats[i].col;s.seats[i].col=v;renderStart()}
  else if(t.dataset.a==='lv'){s.seats[+t.dataset.i].lv=t.value}
  else if(t.dataset.a==='exp'){s.exp[t.dataset.k]=t.checked?1:0}
  else if(t.dataset.a==='nomon'){s.noMon=t.checked}});
function startGuided(){const s=defaultSetup();s.mode='me';s.np=2;s.variant=null;s.noMon=false;s.exp={rift:0,wave:0,maelstrom:0,cannon:0};s.seats[0]={h:true,lv:'normal',col:0};s.seats[1]={h:false,lv:'easy',col:3};UI.setup=s;startGame(JSON.parse(JSON.stringify(s)),{guided:true})}
function startGame(s,o){o=o||{};if(isClient())return;let plan=null;if(isHost()){plan=netPlan(s);if(plan.err){NET.err=plan.err;UI.netOpen=true;netRender();return}NET.err='';s.np=plan.np;s.seats.forEach((x,i)=>{x.h=i<plan.hum.length});o.guided=false}
  UI.gen++;clearTimeout(UI.tm);kitReset();
  const solo=s.variant==='solo'||s.variant==='easysolo';let np=solo?1:s.np;if(s.variant==='teams'&&np<4)np=4;const seats=s.seats.slice(0,np);
  seats.forEach((x,i)=>{SHIP_NAMES[i]=COL[x.col].name});UI.cols=seats.map(x=>x.col);
  newGame({players:np,seats:seats.map(x=>x.h?'human':'ai'),lv:seats.map(x=>x.lv),exp:Object.assign({},s.exp),variant:s.variant||null,noMon:!!s.noMon});if(plan)netBound(plan);
  UI.lastSetup=s;UI.guided=!!o.guided;UI.guide=o.guided?'full':(lsGet('tw_set',{}).guide||'light');UI.seen=o.guided?{}:UI.seen;if(o.guided)UI.trig={};else UI.trig={};
  UI.sel=null;UI.hint=false;UI.busy=false;UI.pause=false;UI.dice=null;UI.res=null;UI.lastRoll=null;UI.overSeen=0;UI.confirm=null;UI.lastKey='';UI.qKey=null;UI.curTurn=null;
  const h=humans();UI.holder=h.length===1?h[0]:-1;UI.started=true;hideStart();GX.close();
  try{if(window.PerfHUD)PerfHUD.hitch()}catch(e){}
  kitSync();SND.mood='calm';sndLoop('sea_loop',true);if(SND.gesture)musicStart();else SND.wantMusic=1;
  saveAll();render();schedule()}
function resumeSaved(){const g=savedGame();if(!g)return;const u=lsGet('tw_ui1',{});kitReset();G=g;UI.cols=u.cols||G.seats.map((_,i)=>i);G.seats.forEach((x,i)=>{SHIP_NAMES[i]=x.nm});
  UI.guide=u.guide||'light';UI.seen=u.seen||{};UI.trig=u.trig||{};UI.guided=!!u.guided;UI.lastSetup=u.setup||UI.setup;UI.sel=null;UI.busy=false;UI.pause=false;UI.overSeen=0;UI.confirm=null;UI.lastKey='';UI.holder=humans().length===1?humans()[0]:-1;UI.started=true;UI.gen++;hideStart();GX.close();
  kitSync();sndLoop('sea_loop',true);if(SND.gesture)musicStart();else SND.wantMusic=1;render();schedule()}
// ===================== part 5: boot, kit wiring, PerfHUD =====================
function detectSoftGPU(){if(/jsdom/i.test(navigator.userAgent))return false;try{const c=document.createElement('canvas');const gl=c.getContext('webgl');if(!gl)return false;const e=gl.getExtension('WEBGL_debug_renderer_info');const r=e?gl.getParameter(e.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER);const lose=gl.getExtension('WEBGL_lose_context');if(lose)lose.loseContext();return /swiftshader|llvmpipe|software|softpipe/i.test(String(r))}catch(e){return false}}
function perfHooks(){const PH=window.PerfHUD;if(!PH||!TWKit._K||!TWKit._K.on)return;const K=TWKit._K;const DPR={high:2,medium:1.5,low:1};
  PH.register({game:'Tidewake',renderer:K.r,levels:['high','medium','low'],names:{high:'High',medium:'Medium',low:'Low'},anchor:'.gx-board',corner:'bl',
    getLevel:()=>TWKit.getQuality().active,isAuto:()=>TWKit.getQuality().pref==='auto',autoTop:()=>window.TW_SOFTGPU?'low':(Math.min(innerWidth,innerHeight)<600?'medium':'high'),
    setLevel:(l,why)=>{if(why==='apply')TWKit.setQuality(l);else TWKit._applyQ(l);if(GX.open==='setd')renderSettings()},
    basePR:()=>Math.min(window.devicePixelRatio||1,DPR[TWKit.getQuality().active]||1),onPixelRatio:v=>{K.r.setPixelRatio(v);const b=GX.boardSize();TWKit.resize(b.w,b.h)},
    orbit:t=>{const C=K.cs;if(!C)return;if(t==null){if(UI.orb0){C.pos.copy(UI.orb0.p);C.look.copy(UI.orb0.l);UI.orb0=null}return}if(!UI.orb0)UI.orb0={p:C.pos.clone(),l:C.look.clone()};const a=Math.sin(t*Math.PI*2)*.5;const d=UI.orb0.p.clone().sub(UI.orb0.l);const x=d.x*Math.cos(a)-d.z*Math.sin(a),z=d.x*Math.sin(a)+d.z*Math.cos(a);C.pos.set(UI.orb0.l.x+x,UI.orb0.p.y,UI.orb0.l.z+z)},
    isAnimating:()=>{try{return TWKit.isAnimating()||UI.busy}catch(e){return false}},beforeTest:()=>GX.close()})}
// board framing: the whole chart (frame, edge numbers, ships on the marks) must stay inside the board area at any aspect
function frame(w,h){const a=w/h;window.TW_PADX=a<1.2?.3:.15;window.TW_PADT=a<.8?.55:.6;window.TW_PADB=.2}
function boot(){GX.init({key:'tw'});const st=lsGet('tw_set',{});if(st.speed)UI.speed=st.speed;if(st.guide)UI.guide=st.guide;if(st.anim===false){UI.anim=false;ANIM=0}
  window.TW_SOFTGPU=detectSoftGPU();installRecorders();
  const cv=$('#c3'),fb=$('#fb');const P=new URLSearchParams(location.search);let res={ok:false};
  {const b=GX.boardSize();frame(b.w,b.h)}
  try{res=TWKit.init(cv,{fallback:fb,force2D:P.has('2d')})}catch(e){console.error(e)}
  try{TWKit.setSpeed(UI.speed)}catch(e){}
  const on2d=()=>{cv.hidden=true;fb.hidden=false;if(!fb._wired){fb._wired=1;fb.addEventListener('click',e=>{let p=null;try{p=TWKit.pick(e.clientX,e.clientY)}catch(x){}if(!p||!isFinite(e.clientX)||!e.clientX&&!e.clientY)p=TWKit.pick2D(e.target)||p;if(p)onPick(p)})}};
  if(!res.ok)on2d();
  else{let down=null;cv.addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY}});
    cv.addEventListener('webglcontextlost',e=>{e.preventDefault();window.TW_LOST=(window.TW_LOST||0)+1;console.warn('WebGL context lost: switching to the 2D chart');setTimeout(()=>{try{TWKit._K.loopOn=false;TWKit.init(cv,{fallback:fb,force2D:true});on2d();KS={tiles:{},mons:{},ships:{},gates:{},mael:{},wave:null,hold:{}};kitSync();render()}catch(x){console.error(x)}},0)},false);
    cv.addEventListener('click',e=>{if(down&&Math.abs(e.clientX-down.x)+Math.abs(e.clientY-down.y)>8)return;onPick(TWKit.pick(e.clientX,e.clientY))});perfHooks()}
  GX.onResize((w,h)=>{try{frame(w,h);TWKit.resize(w,h);TWKit.setView({immediate:true});TWKit.renderOnce()}catch(e){}});{const b=GX.boardSize();try{TWKit.resize(b.w,b.h)}catch(e){}}
  $('#rulesbody').innerHTML=RULES_HTML;
  GX.onShow=id=>{sfx('open');if(id==='piecesd'&&!$('#piecesbody').firstChild)$('#piecesbody').innerHTML=piecesHTML();renderOpenDrawer()};GX.onClose=()=>sfx('close');
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!GX.open&&G&&UI.started&&UI.confirm){UI.confirm=null;renderCoach()}});
  netInit();showStart()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
