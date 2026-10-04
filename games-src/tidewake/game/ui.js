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
  const _el=eliminate;eliminate=function(seat,why,bonus){const s=G.ships[seat];const was=s.alive?{x:s.x,y:s.y,e:s.e,on:s.on?s.on.slice():null}:null;_el(seat,why,bonus);if(was){let at=null;const si=UI.sailInfo&&UI.sailInfo[seat];
    if(si&&si.stop&&/edge|ran into/.test(why))at=si.stop;else if(was.on)at=[was.on[0]-2.5,was.on[1]-2.5];else if(was.x!=null){try{const w=TWKit.portWorld(was.x,was.y,was.e);at=[w[0],w[1]]}catch(e){at=[was.x-2.5,was.y-2.5]}}
    rec({t:'sink',seat,why,pos:was,at,cur:G.cur,actor:UI.actor,turn:G.turn,key:seat+':'+why+':'+G.logN,key0:G.turn+':'+(was.on?was.on.join(','):was.x+','+was.y+','+was.e)})}};
  const _ws=waveSlot;waveSlot=function(s){const w=G.wave;const old=w?{x:w.x,y:w.y,r:w.r}:null;const r=_ws(s);if(r&&old)rec({t:'wave',from:old,off:!G.wave,to:G.wave?{x:G.wave.x,y:G.wave.y,r:G.wave.r,n:G.wave.n}:null});return r};
  const _ap=applyRes;applyRes=function(seat,r,o){const s=G.ships[seat];const x=s.x,y=s.y,e=s.e;_ap(seat,r,o);if(x==null)return;
    const steps=[];let ce=e;for(const p of r.path){const cell=cellAt(G,p[0],p[1]);if(!cell)break;const q=exitPort(cell,ce);steps.push({c:p[0],r:p[1],from:ce,to:q});ce=MATE[q]}
    let stop=null;const last=steps[steps.length-1];
    if(r.st==='edge'&&last){const w=TWKit.portWorld(last.c,last.r,last.to),dd=DIR[last.to>>1];stop=[w[0]+dd[0]*.4,w[1]+dd[1]*.4]}
    else if(r.st==='mon'){const m=monById(r.id)||(G.arr&&G.arr.id===r.id?G.arr:null);if(m)stop=[m.x-2.5,m.y-2.5]}
    (UI.sailInfo=UI.sailInfo||{})[seat]={st:r.st,stop};
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
  UI.skip=false;UI.mphLive=true;
  for(const e of evs){if(UI.skip||UI.gen!==gen||!UI.started)break;if(e.t!=='arrive')UI.arrow=null;try{await playEv(e,gen)}catch(x){console.error(x)}ovUpdate()}
  UI.mphLive=false;UI.hiMon=null;UI.arrow=null;
  if(UI.gen===gen){UI.res=null}
}
async function playEv(e,gen){
  switch(e.t){
  case 'log':{if(e.skip)break;if(/^Turn \d+/.test(e.text)){say(e.text,'');await sleep(260)}else{say(e.text,e.c==='bad'?'bad':e.c==='big'?'big':'');await sleep(e.c==='bad'?950:560)}break}
  case 'turn':{UI.curTurn=e.seat;UI.curTurnN=e.n;renderRoad();renderBar();break}
  case 'dice':{const nx=UI.mphNext;if(nx&&nx.d[0]===e.d[0]&&nx.d[1]===e.d[1]){UI.mph=nx;UI.mphNext=null}if(!UI.mph||UI.mph.d!==e.d&&(UI.mph.d[0]!==e.d[0]||UI.mph.d[1]!==e.d[1]))UI.mph={d:e.d.slice(),total:e.d[0]+e.d[1],wake:e.d[0]+e.d[1]>=6&&e.d[0]+e.d[1]<=8,lines:[],seat:e.seat,shown:0};
    UI.mph.roll=true;UI.mph.shown=0;UI.trig.roll=1;sfx('dice_roll');renderRes();await sleep(600);UI.mph.roll=false;renderRes();sfx(UI.mph.wake?'leviathan_roar':'click');await sleep(UI.mph.wake?900:450);break}
  case 'monact':{if(UI.mph&&e.ln!=null){UI.mph.shown=e.ln+1;UI.hiMon=e.id;const m0=monById(e.id);renderRes();ovUpdate();await sleep(700)}if(e.turned){const m=monById(e.id);if(m&&KS.mons[m.x+','+m.y]){TWKit.placeLeviathan(m.x,m.y,{arrows:levArrows(m.id),rot:m.r,animate:false});KS.mons[m.x+','+m.y]=m.id+':'+m.r;sfx('splash');await sleep(350)}}UI.trig.move=1;break}
  case 'place':{const k=e.x+','+e.y;sfx('tile_place');KS.tiles[k]=e.card[0]+':'+e.card[1];TWKit.ghost(null);await kitWait(TWKit.placeTile(e.x,e.y,{paths:pathsOf(e.card[0],e.card[1])}),1800);await sleep(120);break}
  case 'sail':{const id=sid(e.seat),k=KS.ships[id];if(!k||!e.steps.length)break;
    sfx('ship_creak');sfx('ship_glide',{at:.1});if(e.steps.length>2)sfx('wake_swish',{at:.2});
    const last=e.steps[e.steps.length-1];await kitWait(TWKit.moveShip(id,e.steps),4500);KS.ships[id]={c:last.c,r:last.r,port:last.to};
    if(e.st==='edge'||e.st==='mon')KS.hold[e.seat]=1;await sleep(150);break}
  case 'warp':{const id=sid(e.seat);if(!KS.ships[id])break;const a=e.from||[e.to[0],e.to[1]];sfx('rift_gate');await kitWait(TWKit.riftWarp(id,{c:a[0],r:a[1]},{c:e.to[0],r:e.to[1]},{port:0}),3000);KS.ships[id]={c:e.to[0],r:e.to[1],port:0};say(`${nm(e.seat)} is carried through the Rift Gate!`,'big');await sleep(500);break}
  case 'gate':{say(`A Rift Gate opens at column ${e.x+1}, row ${e.y+1}. Junks and leviathans that touch it are thrown to a rolled square.`,'big');sfx('rift_gate');KS.gates[e.x+','+e.y]=1;await kitWait(TWKit.riftGate(e.x,e.y,true,{color:'violet'}),1500);break}
  case 'arrive':{const key=e.x+','+e.y;if(UI.mph&&e.ln!=null){UI.mph.shown=e.ln+1;renderRes()}
    if(e.from){UI.arrow={a:sqW(e.from[0],e.from[1]),b:sqW(e.x,e.y)};UI.hiMon=e.id;ovUpdate();await sleep(520)}else if(e.spawn){UI.hiMon=e.id}
    if(e.k==='M'){if(!e.from)say(`The Maelstrom rises at column ${e.x+1}, row ${e.y+1}. It moves on calm rolls and destroys what it enters.`,'big');if(e.from){TWKit.maelstrom(e.from[0],e.from[1],false);delete KS.mael[e.from[0]+','+e.from[1]]}sfx('maelstrom');if(KS.tiles[key]){TWKit.destroyTile(e.x,e.y);delete KS.tiles[key]}TWKit.maelstrom(e.x,e.y,true);KS.mael[key]=1;await sleep(900);break}
    if(e.from){TWKit.removeLeviathan(e.from[0],e.from[1],{silent:true});delete KS.mons[e.from[0]+','+e.from[1]]}
    if(KS.tiles[key]){sfx('tile_destroyed');TWKit.destroyTile(e.x,e.y);delete KS.tiles[key];await sleep(450)}
    if(KS.mael[key]&&e.k==='L'){}
    sfx('leviathan_spawn');sfx('leviathan_roar',{at:.4});KS.mons[key]=e.id+':'+e.r;UI.trig.lev=1;if(e.spawn)UI.trig.move=1;
    await kitWait(TWKit.placeLeviathan(e.x,e.y,{arrows:levArrows(e.id),rot:e.r,kind:e.id%2?'dragon':'serpent'}),3000);await sleep(200);break}
  case 'destroy':{const key=e.x+','+e.y;if(KS.tiles[key]){sfx('tile_destroyed');TWKit.destroyTile(e.x,e.y);delete KS.tiles[key];await sleep(500)}break}
  case 'rmon':{const key=e.x+','+e.y;
    if(e.why==='cannon'){const sh=KS.ships[sid(e.by!=null?e.by:G.cur)];sfx('cannon');await kitWait(TWKit.cannonShot({from:sh?sid(e.by!=null?e.by:G.cur):{c:e.x,r:e.y},to:{c:e.x,r:e.y},hit:true}),2500)}else sfx('splash');
    if(e.k==='M'){TWKit.maelstrom(e.x,e.y,false);delete KS.mael[key]}else{TWKit.removeLeviathan(e.x,e.y);delete KS.mons[key]}await sleep(700);break}
  case 'sink':{sunkAdd(e);const id=sid(e.seat),k=KS.ships[id];if(!k){await sleep(400);break}const w=e.why;
    if(/collided/.test(w)){const partner=Object.keys(KS.ships).find(o=>o!==id&&!KS.ships[o].dying&&KS.ships[o].c===k.c&&KS.ships[o].r===k.r&&KS.ships[o].port===k.port);
      sfx('crash');if(partner)await kitWait(TWKit.collide(id,partner),1500);sfx('ship_sink',{at:.3});TWKit.sinkShip(id,{how:'crash'});delete KS.ships[id];if(partner){TWKit.sinkShip(partner,{how:'crash'});delete KS.ships[partner]}await sleep(900);try{TWKit.removeShip(id);if(partner)TWKit.removeShip(partner)}catch(x){}break}
    let how='wave',at;if(/Maelstrom/.test(w)){how='maelstrom';const m=G.mons.find(q=>q.k==='M')||(G.arr&&G.arr.k==='M'&&G.arr);if(m)at={c:m.x,r:m.y};sfx('maelstrom')}
    else if(/ran into|crushed|blocked/.test(w)){how='leviathan';const mm=e.pos&&e.pos.on?e.pos.on:(e.pos&&e.pos.x!=null?[e.pos.x,e.pos.y]:null);if(mm)TWKit.leviathanRoar(mm[0],mm[1]);sfx('leviathan_roar')}
    else if(/capsized/.test(w)){how='wave';sfx('rogue_wave')}else sfx('splash');
    sfx('ship_sink',{at:.2});delete KS.hold[e.seat];delete KS.ships[id];UI.trig.sunk=1;await kitWait(TWKit.sinkShip(id,{how,at}),2500);try{TWKit.removeShip(id)}catch(x){}await sleep(250);break}
  case 'wavenew':{kitWave({x:e.x,y:e.y,r:e.r});sfx('rogue_wave');say(`A Rogue Wave arrives: ${(e.r&1)?'column '+(e.x+1):'row '+(e.y+1)}, strength 2. A junk in that band must roll 2 or more or capsize; the wave moves on and gets stronger.`,'big');await sleep(2000);break}
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
  else o.push(`${who} sails ${A.n} current${A.n>1?'s':''} and stops at column ${A.end[0]+1}, row ${A.end[1]+1} (the flag on the board).`);
  if(A.coll)o.push(`<span class="warn-l">Two junks would end on one wake: both sink.</span>`);
  for(const x of A.others)o.push(x.coll?`<span class="warn-l">${nm(x.i)} also sails here and would crash.</span>`:x.st==='edge'||x.st==='mon'?`${nm(x.i)} also sails and would sink.`:`${nm(x.i)} also sails on.`);
  return o.join('<br>')}
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
function startHTML(d){const info=startInfo(d),K=knowledge(d),adv=startAdvice(K,d,info);const by={};for(const o of info)(by[o.edge+o.idx]=by[o.edge+o.idx]||[]).push(o);
  let g='';for(const ed of EDGES){const hor=ed==='top'||ed==='bottom';g+=`<span>${ed[0].toUpperCase()+ed.slice(1)}</span>`;for(let i=1;i<=6;i++){const l=by[ed+i]||[];
    g+=`<span style="display:flex;gap:2px">${[0,1].map(k=>{const o=l[k],lab=i+(hor?'LR':'UD')[k];return o?`<button class="btn small${adv&&adv.o===o?' on':''}" style="min-width:0;flex:1" data-a="startmark" data-x="${o.m.x}" data-y="${o.m.y}" data-e="${o.m.e}" aria-label="${ed} ${i}, ${o.sideWord} mark">${lab}</button>`:`<button class="btn small" style="min-width:0;flex:1" disabled>${lab}</button>`}).join('')}</span>`}}
  const you=d===viewSeat()||humans().length===1;
  return `<div class="prompt"><h4>${you?'Choose your start':esc(nm(d))+': choose a start'}</h4><p>Tap one of the big pulsing gold marks on the edge of the board. Each number from 1 to 6 has two marks (<b>L</b> left and <b>R</b> right of the number; on the side edges <b>U</b> upper and <b>D</b> lower).</p>
  ${adv?`<div class="rec"><b>Good start:</b> ${esc(adv.why)} <button class="btn small" data-a="startmark" data-x="${adv.o.m.x}" data-y="${adv.o.m.y}" data-e="${adv.o.m.e}">Start here</button></div>`:''}
  <p class="tiny">Tip: a mark in the middle of an edge is safest. Next to a corner you may run out of room. The dice come later: they only decide when the leviathans (the sea monsters already on the board) move.</p>
  <details><summary class="tiny">All marks as a list</summary><div class="startpick" style="grid-template-columns:auto repeat(6,1fr)">${g}</div></details></div>`}
function questionHTML(d,K){const q=G.q;let extra='';const you=d===viewSeat()||humans().length===1;
  if(q.kind==='bonus'&&G.cur===d&&G.pool.length)extra=`<p class="tiny">Sunken crews' tiles (numbered):</p><div class="hand">${G.pool.map((c,j)=>isCur(c)?`<span class="hc"><span class="n">${j+1}</span><img alt="" src="${TWKit.cardURL(BASE_PATHS[CUR_TYPE[c]],{uid:'pl'+j,size:96})}"></span>`:`<span class="hc sp"><span class="n">${j+1}</span>${isGate(c)?gateArt():cannonArt()}</span>`).join('')}</div>`;
  const timed=UI.qTime>0&&q.kind==='doom'||NET.on&&q.kind==='doom';
  let title=String(q.title).replace(/^You drew/,(you?'You':nm(d))+' drew');
  if(q.kind==='cannonDraw'){const n=G.hands[d].filter(isCannon).length;extra=`<p class="tiny">A <b>Deck Cannon</b> is an optional tile you can hold (two at most). Later you can fire it at a leviathan that is about to sink you, even on someone else's turn. You may keep it, or show it and discard it to draw a different tile instead${n?` (you already hold ${n})`:''}.</p>`}
  if(q.kind==='doom')extra=`<p class="warn-l">If you do nothing, your junk sinks. Pick a rescue below, or accept.</p>`+extra;
  return `<div class="prompt ${q.kind==='doom'?'alert':'ask'}" data-qkind="${q.kind}"><h4>${q.kind==='doom'?'Quick: '+(you?'your':esc(nm(d))+"'s")+' junk is in danger!':q.kind==='cannonDraw'?(you?'You':esc(nm(d)))+' drew a Deck Cannon':'Choose'}</h4><p>${esc(title)}</p>${extra}<div class="opts">${q.opts.map((o,i)=>`<button class="btn${/Accept/.test(o.l)?' warn':''}" data-a="q" data-i="${i}">${esc(o.l)}</button>`).join('')}</div>${timed?`<div class="qtimer" title="Time left"><i id="qbar"></i></div><p class="cd" id="qtxt">${UI.qTime>0?UI.qTime:25} s to decide, then the computer's best advice is used.</p>`:''}</div>`}
function placeHTML(d,K){const mv=validMoves(d);const pl=mv.filter(m=>m.a==='place'),gts=mv.filter(m=>m.a==='gate'),cns=mv.filter(m=>m.a==='cannon'),pas=mv.find(m=>m.a==='pass');
  const hand=K.hands[d];let sel=UI.sel;const fronts=[...new Set(pl.map(m=>m.s))];
  if(pl.length){if(!sel||!pl.some(m=>m.t===sel.t)||!fronts.includes(sel.s)){const f=pl.find(m=>m.s===d)||pl[0];sel=UI.sel={t:f.t,r:(sel&&sel.r)||0,s:f.s}}}
  UI.canPlace=pl.length>0;UI.moves=mv;
  const full=UI.guide==='full',multi=hotSeat()||humans().length>1;
  let outcome='',m=null,A=null,btn='',err='';
  if(pl.length&&isCur(hand[sel.t])){m={a:'place',t:sel.t,r:sel.r,s:sel.s};A=analyse(K,d,m);err=legal(m,d);outcome=outcomeHTML(K,d,m,A);
    btn=`<button class="btn pri" data-a="place" ${err?'disabled':''}>Place tile ${sel.t+1}</button>`+(err?`<span class="tiny warn-l">${A.bad?'Not allowed: a safer tile exists.':'Not allowed.'}</span>`:'');UI.A=A}
  else{UI.A=null;if(pl.length&&hand[sel.t]!=null){const c=hand[sel.t];const g=gts.find(x=>x.t===sel.t&&x.s===sel.s);if(g)btn=`<button class="btn pri" data-a="gate" data-t="${g.t}" data-s="${g.s}">Play the Rift Gate here</button>`}}
  const fr=fronts.length>1?`<p class="tiny">Which junk gets the tile? ${fronts.map(s=>`<button class="btn small${sel&&sel.s===s?' on':''}" data-a="target" data-s="${s}">${dot(s)} ${esc(nm(s))}</button>`).join(' ')}</p>`:'';
  const thr=threatHTML(K,d,m,A);
  const rot=pl.length?`<div class="hacts"><button class="btn small" data-a="rot" data-d="-1" aria-label="Turn left" title="Turn left (Q)">&#10226; Left</button><span class="rotl">turned ${(sel.r||0)*90}&deg;</span><button class="btn small" data-a="rot" data-d="1" aria-label="Turn right" title="Turn right (R)">&#10227; Right</button></div>`:'';
  const nT=hand.length;
  UI.pinH=`<div class="pinbox"><div class="hl"><b>${multi?esc(nm(d))+"'s":'Your'} ${nT} tile${nT===1?'':'s'}</b> <span class="tiny">${pl.length?'tap a tile, turn it, then Place':'choose what to do'}</span></div><div class="hand" data-hand="${d}">${hand.map((c,t)=>cardBtn(c,t,{up:true,owner:d,sel:sel&&sel.t===t,rot:sel&&sel.r})).join('')}${rot}</div><div class="row">${btn}${pas?`<button class="btn" data-a="pass">Nothing to play: pass</button>`:''}</div></div>`;
  let h=`<div class="prompt"><h4>${multi?esc(nm(d))+': lay a current':'Your turn: lay a current'}</h4>${fr}`;
  if(outcome)h+=`<p style="margin:6px 0 4px">${outcome}</p>`;if(thr)h+=`<p style="margin:2px 0">${thr}</p>`;
  if(err&&A&&A.bad)h+=`<p class="warn-l" style="margin:4px 0">Not allowed: another tile is safer. The rule: you may not pick a placement that sinks you while any other placement does not. <button class="btn small" data-a="sugg">Show me the safest move</button></p>`;
  const cm={};for(const c of cns){const k=c.m+':'+c.s;if(!cm[k])cm[k]=c}const nc=hand.filter(isCannon).length;
  if(Object.keys(cm).length)h+=`<div class="optrow"><div class="tiny"><b>Deck Cannon</b> (optional, instead of laying a tile; you hold ${nc}):</div><div class="row">${Object.values(cm).map(c=>`<button class="btn warn" data-a="cannon" data-t="${c.t}" data-m="${c.m}" data-s="${c.s}">Fire at ${esc(levName(c.m))}${nc>1?' (x'+nc+' held)':''}</button>`).join('')}</div></div>`;
  else if(nc&&full)h+=`<p class="tiny">You hold a Deck Cannon. It can be fired when a leviathan is next to your front square or about to sink you.</p>`;
  if(nc>=2)h+=`<p class="tiny">You hold two Deck Cannons, the most you may keep: a third you draw is discarded.</p>`;
  const gseen={};const gb=gts.filter(g=>!(pl.length&&isGate(hand[sel.t])&&g.t===sel.t)).filter(g=>{const k=g.t+':'+g.s;if(gseen[k])return false;gseen[k]=1;return true});
  if(gb.length)h+=`<div class="optrow"><div class="tiny"><b>Rift Gate</b> (optional):</div><div class="row">${gb.map(g=>`<button class="btn" data-a="gate" data-t="${g.t}" data-s="${g.s}">Play Rift Gate${g.s!==d?' for '+esc(nm(g.s)):''}</button>`).join('')}</div></div>`;
  h+=`</div>`;
  if(pl.length){if(full||UI.hint)h+=recHTML(K,d,pl,true);else h+=`<div class="row"><button class="btn small" data-a="hint">Show me the safest move</button></div>`}
  else if(cns.length||gts.length||pas)h+=full||UI.hint?recHTML(K,d,pl,true):'';
  return h}
function passHTML(d){return `<div class="prompt passbox"><div class="big">${dot(d)} Pass the device to ${esc(nm(d))}</div><p>Hands are hidden until ${esc(nm(d))} takes the device.${G.q&&G.q.who===d?' '+esc(nm(d))+' must make a quick decision.':''}</p><button class="btn pri" data-a="take" data-seat="${d}">I am ${esc(nm(d))}</button></div>`}
function overHTML(){const o=G.over,w=o.win||[];const me=viewSeat();const hs=humans();const solo=G.variant==='solo'||G.variant==='easysolo';
  const watch=NET.on?me<0:!hs.length;const multi=!NET.on&&hs.length>1;
  const meWin=me>=0&&w.includes(me);let head,cls='';
  if(watch||multi){head=w.length?(w.length>1?'Game over: shared win':'Game over'):'Game over'}
  else if(meWin){head=w.length>1?'Shared victory!':'Victory!'}else{head='Defeat';cls='alert'}
  const names=w.map(i=>dot(i)+' <b>'+esc(nm(i))+'</b>').join(', ');
  let h=`<div class="prompt ${cls}" data-over="1"><h4>${head}</h4><p>${esc(o.why)}</p>`;
  if(me>=0&&!watch&&!multi&&!G.ships[me].alive){const c=causeOf(G.ships[me].out);h+=`<p class="warn-l"><b>You were sunk:</b> ${esc(c.t)}</p>`}
  h+=`<p>${w.length?(solo?'':(w.length>1?'Winners: ':'Winner: ')+names):'Nobody survived.'}</p>`;
  if(G.np>1||solo)h+=`<ul class="crews">${G.order.map(i=>{const s=G.ships[i];return `<li>${dot(i)} ${esc(nm(i))}${G.team?' (team '+'AB'[G.team[i]]+')':''}: ${s.alive?'afloat':'sunk ('+({edge:'sailed off the edge',collision:'head-on collision',wave:'capsized by the Rogue Wave',maelstrom:'swallowed by the Maelstrom',block:'blocked in by a leviathan',mon:'ran into a leviathan',crush:'crushed by a leviathan',rift:'lost in the rift'}[causeOf(s.out).k]||'sunk')+')'}</li>`}).join('')}</ul>`;
  h+=`<p class="tiny">${G.turn} turns, ${G.ships.filter(s=>s.alive).length} junk(s) afloat, ${G.stats.levMove||0} leviathan moves.</p>`;
  if(!meWin&&!watch&&!multi&&UI.guided)h+=`<p class="tiny">Next time: keep your junk off the edges and corners, and press <b>Show me the safest move</b> before each Place.</p>`;
  if(isClient())h+=`<p class="tiny">Waiting for the host to start another game.</p><div class="row"><button class="btn" data-a="netleave">Leave</button><button class="btn" data-gx="rulesd">Rules</button></div>`;
  else h+=`<div class="row">${!meWin&&!watch&&!multi&&UI.snap&&!NET.on?'<button class="btn pri" data-a="rewind">Rewind to my last move</button>':''}${UI.guided&&!meWin&&!watch?'<button class="btn" data-a="guided">Try the guided game again</button>':''}<button class="btn${meWin||watch||multi||!UI.snap?' pri':''}" data-a="again">Play again</button><button class="btn" data-a="newgame">New game</button><button class="btn" data-gx="rulesd">Rules</button></div>`;
  return h+'</div>'}
function oppHTML(d){const now=UI.busy&&UI.curTurn!=null&&G.seats[UI.curTurn]?UI.curTurn:d;
  return `<div class="prompt opp"><h4>Opponents</h4><p class="tiny">${now>=0?dot(now)+' <b>'+esc(nm(now))+'</b> is playing':'The sea moves'}. The computers play by themselves; you only act on your turn, in step 2 (Place).</p><div class="row">${UI.busy?'<button class="btn small" data-a="skip">Skip animation</button>':''}${humans().length===0?`<button class="btn small" data-a="pause">${UI.pause?'Resume':'Pause'}</button>`:''}</div></div>`}
function goalHTML(){if(!G)return '';const L=G.mons.filter(m=>m.k==='L').length,toRise=G.mdeck.filter(x=>x<10).length;
  if(G.variant==='solo')return `<div class="goal"><b>Goal:</b> outlast every leviathan. ${toRise} still to rise, ${L} on the board; you win when none are left.</div>`;
  if(G.variant==='easysolo')return `<div class="goal"><b>Goal:</b> stay afloat for ${G.opts.goal} turns (turn ${G.turn} now), or play out the whole tile pile.</div>`;return ''}
function mainHTML(){const gh=goalHTML();const h=mainHTML0();return G.over&&!UI.busy||!h?h:gh+h}
function mainHTML0(){
  if(G.over&&!UI.busy)return overHTML();const d=sideToAct(),vs=viewSeat();
  if(UI.busy)return oppHTML(d)+handStrip(vs,false);
  if(d<0)return '';const dh=G.seats[d].human;
  if(NET.on&&dh&&d!==NET.mySeat)return netWaitHTML(d,vs);
  if(dh&&mustPass(d))return passHTML(d);
  if(dh){UI.V={seat:d};
    if(G.q)return questionHTML(d)+handStrip(vs,false);
    if(G.phase==='setup')return startHTML(d);
    if(G.step==='act'){return placeHTML(d,knowledge(d))}return ''}
  return oppHTML(d)+handStrip(vs,false)}
// ===================== part 4: the rest of the dock, popups, start screen =====================
function renderBar(){const el=$('#barstat');if(!el||!G)return;const L=G.mons.filter(m=>m.k==='L').length;const solo=G.variant==='solo',es=G.variant==='easysolo';
  const toRise=G.mdeck.filter(x=>x<10).length;const R=UI.lastRoll;
  el.innerHTML=G.phase==='setup'?`<span class="lg">Choose start marks</span>`:`<span class="lg" title="Turns played">Turn <b>${G.turn}</b>${es?` of ${G.opts.goal}`:''}</span><span class="lg" title="Current tiles left in the draw pile">Tiles left <b>${G.deck.length}</b></span><span title="Leviathans (sea monsters) on the board now">Monsters<span class="lg2"> on board</span> <b>${L}</b></span>${solo?`<span title="Leviathans that have not risen yet. You win when they are all gone.">Still to rise <b>${toRise}</b></span>`:''}${R?`<span class="lg" title="Leviathans wake when the two dice total 6, 7 or 8">Wake roll <b>${R[0]}+${R[1]}=${R[0]+R[1]}</b> ${R[0]+R[1]>=6&&R[0]+R[1]<=8?'(stir)':'(calm)'}</span>`:''}`;
  $('#dockt').textContent=G.over?'Game over':UI.busy?'Watch the sea':G.phase==='setup'?'Start marks':'What to do now'}
function renderRoad(){const el=$('#road');if(!el||!G)return;const cur=UI.busy&&UI.curTurn!=null?UI.curTurn:G.q?G.q.who:G.phase==='setup'?G.order[G.sp]:G.cur;
  el.innerHTML=G.order.map(i=>{const s=G.ships[i];const me=viewSeat()===i;return `<span class="rs${i===cur&&!G.over?' cur':''}${s.alive?'':' dead'}${me?' me':''}" title="${esc(G.seats[i].human?'Human':'Computer ('+G.seats[i].lv+')')}">${dot(i)}${esc(nm(i))}${G.team?` <small>${'AB'[G.team[i]]}</small>`:''}${s.alive&&G.phase==='play'?` <small>${G.hands[i].length}t</small>`:''}</span>`}).join('')}
function renderSteps(){const el=$('#stepsw');if(!el||!G)return;if(G.phase==='setup'||G.over){el.innerHTML='';el.hidden=true;return}el.hidden=false;
  const st=UI.busy?(UI.stepNow!=null?UI.stepNow:0):(G.step==='act'?1:0);const names=['1 Roll','2 Place','3 Sail','4 Draw'];
  el.innerHTML=names.map((n,i)=>`<span class="${i===st?'on':i<st?'done':''}">${n}</span>`).join('')+(UI.guide==='full'?`<small class="tiny stephint">You only act in step 2. Roll, Sail and Draw happen by themselves.</small>`:'')}
function renderRes(){const el=$('#res');if(!el)return;let h='';
  if(UI.mph)h+=mphHTML();
  if(UI.res)h+=`<div class="res ${UI.res.cls}">${esc(UI.res.text)}</div>`;el.innerHTML=h;el.hidden=!h}
function lessonHTML(c){const g=UI.guide==='full';return `<div class="coach"><h4>${esc(c.t)}<button class="gsw full" data-a="guidetoggle" title="Turn the guide down" aria-label="Guide is Full: tap to turn it down">Guide: Full &#9662; tap to turn down</button></h4><p>${esc(c.x)}</p><button class="btn small" data-a="coachok">Got it</button></div>`}
function nextLesson(){for(const c of COACH){if(c.id==='start'&&G&&G.phase!=='setup')UI.seen.start=1;if(UI.trig[c.id]&&!UI.seen[c.id]){if(G&&G.phase==='play'&&UI.lessonT===G.turn&&c.id!=='end')return null;return c}}return null}
function coachTriggers(){if(!G||G.over&&false)return;const d=sideToAct();const mine=d>=0&&G.seats[d].human&&!UI.busy&&!mustPass(d);
  if(mine&&G.phase==='setup')UI.trig.start=1;
  if(mine&&G.phase==='play'&&G.step==='act'&&!G.q){UI.trig.cur=1;if(UI.seen.cur){if(UI.A&&UI.A.st==='edge'||G.turn>=3)UI.trig.edge=1;if(UI.seen.edge&&(G.turn>=4||(UI.A&&UI.A.coll)))UI.trig.coll=1}
    const S=G.ships[d];if(S&&S.x!=null&&G.mons.some(m=>m.k==='L'&&Math.abs(m.x-S.x)+Math.abs(m.y-S.y)<=2))UI.trig.lev=1}
  if(G.stats&&G.stats.refill)UI.trig.min3=1;if(G.over)UI.trig.end=1}
function renderCoach(){const el=$('#coach');if(!el)return;
  if(UI.confirm){const to=UI.confirm==='light';el.innerHTML=`<div class="coach"><h4>${to?'Turn the guide down?':'Resume the full guide?'}</h4><p>${to?'You will keep warnings and a "safest move" button, and lessons wait for you.':'Lessons you have not seen will continue where they stopped.'}</p><div class="row"><button class="btn small pri" data-a="guideyes">${to?'Yes, Light':'Yes, Full'}</button><button class="btn small" data-a="guideno">Keep ${to?'Full':'Light'}</button></div></div>`;return}
  if(UI.guide==='full'){const c=!UI.busy&&nextLesson();if(c){el.innerHTML=lessonHTML(c);return}el.innerHTML=`<div class="coach light"><button class="gsw full" data-a="guidetoggle" aria-label="Guide is Full: tap to turn it down">Guide: Full &#9662; tap to turn down</button> <span class="tiny">lessons appear as things happen</span></div>`;return}
  el.innerHTML=UI.guided?`<div class="coach light"><button class="gsw" data-a="guidetoggle" aria-label="Guide is Light: tap for full lessons">Guide: Light &#9662; tap for lessons</button></div>`:''}
function kitOverlay(){if(!G||!kitOk())return;let legal=[];const gh=UI.gh;UI.gh=null;
  if(!UI.busy&&!G.over){const d=sideToAct();if(d>=0&&G.seats[d].human&&!mustPass(d)){
    if(G.q){const q=G.q;if(q.kind==='gatePlace'&&q.ctx)legal=[{c:q.ctx.tx,r:q.ctx.ty}];else for(const o of q.opts)if(o.d&&o.d.x!=null&&(o.h==='dGateAt'||o.h==='dReloc'))legal.push({c:o.d.x,r:o.d.y})}
    else if(G.phase==='play'&&G.step==='act'&&UI.canPlace&&UI.fronts)legal=UI.fronts.map(s=>({c:G.ships[s].x,r:G.ships[s].y}))}}
  try{TWKit.setLegal(legal);if(gh&&!UI.busy)TWKit.ghost(gh.x,gh.y,BASE_PATHS[CUR_TYPE[gh.card]],{rot:gh.rot,valid:gh.valid,trace:gh.trace});else TWKit.ghost(null)}catch(e){console.error(e)}}
function musicEval(){if(!G||!G.ships)return;let tense=false;const alive=G.ships.filter(s=>s.alive);if(alive.length<=2&&G.np>2)tense=true;
  for(const s of alive){const p=shipPos(s);if(!p)continue;for(const m of G.mons)if(m.k==='L'&&Math.abs(m.x-p.c)+Math.abs(m.y-p.r)<=2)tense=true}musicMood(tense&&!G.over?'tension':'calm')}
function render(){if(!G||!UI.started)return;try{if(window.PerfHUD)PerfHUD.wake()}catch(e){}
  UI.gh=null;UI.fronts=null;UI.canPlace=false;UI.A=null;UI.pinH='';UI.route=null;
  const d=sideToAct();const key=G.over?'over':d+':'+G.logN+':'+G.phase+(G.q?G.q.kind:'');
  const html=mainHTML();$('#main').innerHTML=html;{const pn=$('#pin');if(pn){pn.innerHTML=UI.pinH||'';pn.hidden=!UI.pinH}}
  if(!UI.busy&&UI.canPlace&&UI.sel){const pl=UI.moves.filter(m=>m.a==='place');UI.fronts=[...new Set(pl.map(m=>m.s))];const c=G.hands[d][UI.sel.t];if(c!=null&&isCur(c)&&UI.A){const S=G.ships[UI.sel.s];UI.gh={x:S.x,y:S.y,card:c,rot:UI.sel.r,valid:!UI.A.bad,trace:UI.A.steps};try{UI.route=routeDesc(UI.A,S)}catch(e){console.error(e)}}}
  if(key!==UI.lastKey){UI.lastKey=key;if(!UI.busy&&d>=0&&G.seats[d].human&&!mustPass(d)&&!G.over)sfx('turn')}
  if(!UI.busy&&d>=0&&G.seats[d].human&&!G.over&&!mustPass(d))GX.showDock();
  coachTriggers();renderBar();renderRoad();renderSteps();renderRes();renderCards();renderCoach();kitOverlay();musicEval();ovUpdate();
  const t=$('#chip');if(t)t.textContent=!UI.busy&&G.phase==='setup'&&d>=0&&G.seats[d].human&&!mustPass(d)?'Tap a gold mark on the edge':'';
  if(GX.open)renderOpenDrawer();qTimerSync();netAfter()}
function refresh(){if(!G||!UI.started||UI.acting)return;kitSync();render()}
// ---------- interrupt timer ----------
function qTimerSync(){const q=G&&G.q;if(!q||q.kind!=='doom'||(UI.qTime<=0&&!NET.on)||UI.busy||!G.seats[q.who].human||(NET.on?isClient()&&q.who!==NET.mySeat:mustPass(q.who))){UI.qKey=null;return}
  const key=G.logN+':'+q.who;if(UI.qKey!==key){UI.qKey=key;UI.qT0=Date.now()}}
setInterval(()=>{try{if(!G||!UI.qKey||UI.pause)return;const q=G.q;if(!q){UI.qKey=null;return}const QT=UI.qTime>0?UI.qTime:25;const el=(Date.now()-UI.qT0)/1000*(UI.tickRate||1),left=QT-el;const b=$('#qbar');if(b)b.style.width=Math.max(0,left/QT*100)+'%';const tx=$('#qtxt');if(tx)tx.textContent=Math.max(0,Math.ceil(left))+' s left to decide, then the computer\'s best advice is used.';
  if(left<=0){if(isClient())return;UI.qKey=null;const who=q.who;let m=null;try{m=aiMove(who,'hard')}catch(e){}if(!m||m.a!=='q')m={a:'q',i:q.opts.length-1};say('Time is up: the computer chose for '+nm(who)+'.','bad');NET.autoDecl++;actAs(m,who)}}catch(e){console.error(e)}},200);
// ---------- acting ----------
function act(m,seat){if(NET.on){const nr=netAct(m,seat);if(nr!==undefined)return nr}if(!G||UI.busy||G.over)return false;
  if(!NET.on&&G.seats[seat]&&G.seats[seat].human&&humans().length===1&&m.a!=='q'){try{UI.snap={json:JSON.stringify(G)}}catch(e){}}
  if(G.seats[seat]&&G.seats[seat].human){UI.sunk=[];UI.marks=[];UI.mph=null}
  UI.rec=[];UI.acting=1;UI.actor=seat;let r;try{r=performMove(m,seat)}finally{UI.acting=0}const evs=UI.rec;UI.rec=null;
  if(!r.success){sfx('error');say(r.error,'bad');return false}
  UI.sel=null;UI.hint=false;if(hotSeat()&&G.seats[seat]&&G.seats[seat].human&&sideToAct()!==seat)UI.holder=-1;
  for(const e of evs){if(e.t==='dice')UI.lastRoll=e.d}
  afterMove(evs);return true}
function afterMove(evs){saveAll();UI.stepNow=0;
  const mp=mphBuild(evs);const anim=ANIM&&evs.some(e=>e.t!=='log')&&UI.started;UI.mphNext=null;if(mp){if(anim){UI.mphNext=mp;UI.mph=null}else UI.mph=mp}
  if(NET.on&&isHost())netEvents(evs);
  const finish=()=>{if(UI.mphNext){UI.mph=UI.mphNext;UI.mphNext=null}UI.busy=false;UI.dice=null;UI.res=null;if(UI.mph){UI.mph.roll=false;UI.mph.shown=UI.mph.lines.length}if(!G.q)KS.hold={};for(const e of evs)if(e.t==='sink')sunkAdd(e);kitSync();render();overCheck();schedule();if(NET.on)netDrain()};
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
  if(netClick(a,t))return;
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
  case 'hint':UI.hint=true;{const m=recMove(d);if(m&&m.a==='place'&&UI.sel){UI.sel={t:m.t,r:m.r,s:m.s}}}render();break;
  case 'sugg':{const m=UI.recM||recMove(d);UI.hint=true;if(m&&m.a==='place'&&UI.sel){UI.sel={t:m.t,r:m.r,s:m.s};sfx('tile_rotate')}render();break}
  case 'sunkok':{const id=D.id;UI.sunk=(UI.sunk||[]).filter(c=>c.id!==id);UI.marks=(UI.marks||[]).filter(c=>c.id!==id);renderCards();ovUpdate();break}
  case 'rewind':rewindLast();break;
  case 'coachok':{const c=nextLesson();if(c){UI.seen[c.id]=1;if(G&&G.phase==='play')UI.lessonT=G.turn;saveAll();render()}break}
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
function renderOpenDrawer(){const id=GX.open;if(id==='crewd')renderCrew();else if(id==='logd')renderLog();else if(id==='setd')renderSettings();else if(id==='piecesd')renderPiecesNow()}
function renderPiecesNow(){const e=$('#piecesnow');if(e)e.innerHTML=piecesNowHTML()}
function rewindLast(){if(!UI.snap||NET.on)return;let g;try{g=JSON.parse(UI.snap.json)}catch(e){return}UI.gen++;clearTimeout(UI.tm);kitReset();G=g;UI.sel=null;UI.hint=false;UI.busy=false;UI.pause=false;UI.overSeen=0;UI.sunk=[];UI.marks=[];UI.sunkSeen={};UI.mph=null;UI.lastKey='';UI.qKey=null;UI.curTurn=null;UI.res=null;UI.myLogI=null;UI.mphNext=null;UI.holder=humans().length===1?humans()[0]:-1;UI.snap=null;
  kitSync();SND.mood='calm';try{sndLoop('sea_loop',true);if(SND.gesture)musicStart()}catch(e){}saveAll();render();schedule()}
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
  return `<div id="piecesnow">${piecesNowHTML()}</div><h3>Current tiles: 56 in the pile</h3><p class="tiny">35 different layouts (every way to join the 8 edge points in 4 pairs). The "x2" ones appear twice: we spread the 21 repeats evenly (our guess, the real list is unknown). A layout can be turned any of 4 ways.</p><div class="pgrid">${Array.from({length:35},(_,t)=>`<div class="pc"><img alt="Current layout ${t+1}" src="${TWKit.cardURL(BASE_PATHS[t],{uid:'pp'+t,size:96})}">${cnt(t)>1?'<span class="x2">x2</span>':''}#${t+1}</div>`).join('')}</div>
  <h3>Leviathans: 10 in the pile (our own layouts)</h3><p class="tiny">Arrow N on the tile = what die face N does. Arrows are shown for the tile facing north; a leviathan's facing is random when it rises and turns the arrows with it. The diagonal arrow is the quarter-turn. Face 6: it stays and another rises. The number is its move order, "gold" wins ties.</p>
  <div class="lgrid">${LEV.map(L=>`<div class="lcard"><img alt="${esc(L.nm)}" src="${TWKit.leviathanURL(levArrows(L.id),{uid:'lv'+L.id,size:84})}"><br><b>${esc(L.nm)}</b><br>Order ${L.order}${L.gold?' (gold)':''}<br>${L.arr.map((a,i)=>(i+1)+(a==='R'?(L.rd>0?'&#8635;':'&#8634;'):a)).join(' ')}</div>`).join('')}</div>
  <h3>Expansion pieces (Deepwater Perils)</h3><div class="xgrid"><div class="xcard">${exIcon.gate}<b>Rift Gate</b> x1<br><small>In the current pile. Stays on its square; sends junks and leviathans to a rolled square.</small></div><div class="xcard">${exIcon.wave}<b>Rogue Wave</b> x1 (+ edge marker)<br><small>In the leviathan pile. Sweeps a row or column; strength 2, then 3, then 4.</small></div><div class="xcard">${exIcon.mael}<b>Maelstrom</b> x1<br><small>In the leviathan pile. Moves on calm turns: 1 E, 2 S, 3 W, 4 N, 5-6 stays. Destroys what it enters.</small></div><div class="xcard">${exIcon.cannon}<b>Deck Cannon</b> x5<br><small>In the current pile, two per hand. Removes a leviathan about to sink you.</small></div></div>
  <h3>Other things on the board</h3><ul><li><b>Gold marks</b> on the edge: where junks start (two per number).</li><li><b>Gold line</b> on a tile preview: the exact path your junk will sail.</li><li><b>Teal frames</b>: squares you may choose.</li><li><b>Blue strip</b>: the Rogue Wave's row or column.</li></ul>`}
// ---------- start screen ----------
function teamN(s){const n=s.np;if(s.variant!=='teams')return n;return [4,6,8].includes(n)?n:n<4?4:n%2?n-1:n}
function defaultSetup(){const s=lsGet('tw_setup',null);const seats=[];for(let i=0;i<8;i++)seats.push({h:i===0,lv:'normal',col:[0,3,2,1,4,5,6,7][i]});
  return Object.assign({mode:'me',np:3,seats,exp:{rift:0,wave:0,maelstrom:0,cannon:0},variant:null,noMon:false},s&&s.seats&&s.seats.length===8?s:{})}
function applyMode(s,mode){s.mode=mode;s.seats.forEach((x,i)=>{x.h=mode==='hot'?true:mode==='me'?i===0:false})}
function modeOf(s){const n=s.variant==='solo'||s.variant==='easysolo'?1:s.np;const h=s.seats.slice(0,n).filter(x=>x.h).length;return h===0?'watch':h===1?'me':'hot'}
function renderStart(){const el=$('#start');const s=UI.setup=UI.setup||defaultSetup();const solo=s.variant==='solo'||s.variant==='easysolo';const n=solo?1:teamN(s);const mode=modeOf(s);const onl=isHost(),nOnl=onl?Math.min(8,NET.peers.length||1):0,onPlan=onl?netPlan(s):null;
  const seg=(act,cur,list,extra)=>`<span class="seg">${list.map(([v,l])=>`<button data-a="${act}" data-v="${v}"${extra||''} class="${String(cur)===String(v)?'on':''}">${l}</button>`).join('')}</span>`;
  const sv=(i)=>{const x=s.seats[i];if(onl&&i<nOnl)return `<div class="seat" data-seat="${i}"><span class="sw" style="background:${COL[x.col].sail}"></span><select data-a="col" data-i="${i}" aria-label="Colour of seat ${i+1}">${COL.map((c,k)=>`<option value="${k}"${k===x.col?' selected':''}>${c.name}</option>`).join('')}</select><span class="tag">Online: <b>${esc((onPlan&&onPlan.hum&&onPlan.hum[i]&&onPlan.hum[i].nm)||'Player')}</b></span></div>`;return `<div class="seat" data-seat="${i}"><span class="sw" style="background:${COL[x.col].sail}"></span><select data-a="col" data-i="${i}" aria-label="Colour of seat ${i+1}">${COL.map((c,k)=>`<option value="${k}"${k===x.col?' selected':''}>${c.name}</option>`).join('')}</select>
    <span class="seg">${[['1','Human'],['0','Computer']].map(([v,l])=>`<button data-a="seath" data-i="${i}" data-v="${v}" class="${(x.h?'1':'0')===v?'on':''}">${l}</button>`).join('')}</span>
    ${x.h?'<span></span>':`<select data-a="lv" data-i="${i}" aria-label="Level of seat ${i+1}">${['easy','normal','hard'].map(l=>`<option value="${l}"${x.lv===l?' selected':''}>${l}</option>`).join('')}</select>`}</div>`};
  const ex=[['rift','Rift Gate','A portal tile that rescues a junk or flings pieces across the sea.'],['wave','Rogue Wave','A wave that sweeps a row or column and can capsize junks.'],['maelstrom','Maelstrom','A whirlpool that moves on calm turns and destroys what it enters.'],['cannon','Deck Cannon','Five cannons in the tile pile: shoot a leviathan about to sink you.']];
  const cont=savedGame();
  el.innerHTML=`<div class="stin"><h1><svg class="ico" viewBox="0 0 24 24" style="width:44px;height:44px;stroke:#e3b24b"><path d="M3 17c3 2 6 2 9 0s6-2 9 0M12 3v11M12 4l6 7h-6M12 6l-5 6h5"/></svg>Tidewake</h1><p class="tag">Lay currents, steer your junk, outlast the leviathans. 1 to 8 captains, computers and hot-seat.</p>
  <div class="stcard"><h2>Quick start</h2><div class="row">${NET.on?'':'<button class="btn pri" data-a="guided">Guided first game (you vs an easy computer)</button>'}${cont&&!NET.on?`<button class="btn" data-a="cont">Continue saved game</button>`:''}<button class="btn" data-a="start" id="quickgo">Play now (settings below)</button></div><p class="tiny">${NET.on?'':'New here? The guided game explains currents, edges, collisions and leviathans one step at a time.'}</p></div>
  <div class="stcard"><h2>Play with friends</h2>${onlineBlock()}</div>
  <div class="stcols"><div class="stcard"><h2>How to play</h2><div class="row">${onl?'<span class="tiny">Online game: captains take seats in join order.</span>':seg('mode',mode,[['me','Me vs computers'],['hot','Hot-seat'],['watch','Watch']])}</div><p class="tiny">${onl?'Seats without an online captain are computers.':mode==='me'?'You are the first captain; the others are computers.':mode==='hot'?'Everyone shares this screen. Hands are hidden between players behind a pass screen.':'The computers play each other. Sit back.'}</p>
   <h2 style="margin-top:8px">Variant</h2><div class="row">${seg('var',s.variant||'std',[['std','Standard'],['solo','Solo'],['easysolo','Easy solo'],['teams','Teams']])}</div><p class="tiny">${s.variant==='solo'?'One junk, six leviathans. Goal: survive until all ten leviathans have risen and are gone. The top bar counts how many are still to rise.':s.variant==='easysolo'?'Easy solo (our variant): one junk, 4 leviathans to start, 24 turns. Survive 24 turns or play out the whole pile. Destroyed tiles are discarded.':s.variant==='teams'?'Two equal teams (every other seat); you may lay a tile for a teammate. 4, 6 or 8 captains.':'Last junk afloat wins.'}</p>
   <label class="opt"><input type="checkbox" data-a="nomon" ${s.noMon?'checked':''}><span>No leviathans (calm seas)<small>The official "no monsters" option.</small></span></label></div>
  <div class="stcard"><h2>Expansions: Deepwater Perils</h2><p class="tiny">Four optional extra pieces that make the sea nastier. <b>Recommended for a first game: none.</b> Add them one at a time later.</p>${ex.map(([k,l,d])=>`<label class="opt"><input type="checkbox" data-a="exp" data-k="${k}" ${s.exp[k]?'checked':''}><span><b>${l}</b><small>${d}</small></span></label>`).join('')}</div></div>
  <div class="stcard"><h2>Captains ${solo?'(solo: one junk)':''}</h2>${solo?'':`<div class="row" style="margin-bottom:6px"><span>Players:</span>${seg('np',n,(s.variant==='teams'?[4,6,8]:[2,3,4,5,6,7,8]).map(k=>[k,k]))}</div>`}${Array.from({length:Math.max(n,nOnl)},(_,i)=>sv(i)).join('')}</div>
  <div class="row"><button class="btn pri" data-a="start" id="startbtn">Set sail</button><button class="btn" data-gx="rulesd">Rules</button><button class="btn" data-gx="piecesd">Pieces</button><button class="btn" data-gx="credd">Credits</button></div></div>`}
function showStart(){if(isClient()){hideStart();return}UI.started=false;clearTimeout(UI.tm);UI.gen++;UI.busy=false;try{sndLoop('sea_loop',false);musicStop(.4);TWKit.setLegal([]);TWKit.ghost(null)}catch(e){}$('#start').hidden=false;GX.close();renderStart()}
function hideStart(){$('#start').hidden=true}
function startAction(a,t){const s=UI.setup=UI.setup||defaultSetup();const D=t.dataset;
  switch(a){
  case 'mode':applyMode(s,D.v);if(D.v==='hot'&&s.np<2)s.np=2;break;
  case 'np':s.np=+D.v;break;
  case 'var':s.variant=D.v==='std'?null:D.v;if(s.variant==='teams')s.np=teamN(s);break;
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
  const solo=s.variant==='solo'||s.variant==='easysolo';let np=solo?1:teamN(s);const seats=s.seats.slice(0,np);
  seats.forEach((x,i)=>{SHIP_NAMES[i]=COL[x.col].name});UI.cols=seats.map(x=>x.col);
  newGame({players:np,seats:seats.map(x=>x.h?'human':'ai'),lv:seats.map(x=>x.lv),exp:Object.assign({},s.exp),variant:s.variant||null,noMon:!!s.noMon});if(plan)netBound(plan);
  UI.lastSetup=s;UI.guided=!!o.guided;UI.guide=o.guided?'full':(lsGet('tw_set',{}).guide||'light');UI.seen=o.guided?{}:UI.seen;if(o.guided)UI.trig={};else UI.trig={};
  UI.sel=null;UI.hint=false;UI.busy=false;UI.pause=false;UI.dice=null;UI.res=null;UI.lastRoll=null;UI.myLogI=null;UI.curTurnN=null;UI.mphNext=null;UI.sunk=[];UI.marks=[];UI.sunkSeen={};UI.mph=null;UI.snap=null;UI.hiMon=null;UI.arrow=null;UI.overSeen=0;UI.confirm=null;UI.lastKey='';UI.qKey=null;UI.curTurn=null;
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
function boot(){phApply();GX.init({key:'tw'});const st=lsGet('tw_set',{});if(st.speed)UI.speed=st.speed;if(st.guide)UI.guide=st.guide;if(st.anim===false){UI.anim=false;ANIM=0}
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
  const tiltFor=(w,h)=>PH.on?89:w<700?82:(w/h<.8?76:61),regFor=()=>PH.on?PH_REGION:null;GX.onResize((w,h)=>{try{frame(w,h);TWKit.resize(w,h);TWKit.setView({tilt:tiltFor(w,h),region:regFor(),immediate:true});PH.zk='?';phZoom();TWKit.renderOnce()}catch(e){}});{const b=GX.boardSize();try{TWKit.resize(b.w,b.h);TWKit.setView({tilt:tiltFor(b.w,b.h),region:regFor(),immediate:true})}catch(e){}}
  $('#rulesbody').innerHTML=RULES_HTML;
  GX.onShow=id=>{sfx('open');if(id==='piecesd'&&!$('#piecesbody').firstChild)$('#piecesbody').innerHTML=piecesHTML();renderOpenDrawer()};GX.onClose=()=>sfx('close');
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!GX.open&&G&&UI.started&&UI.confirm){UI.confirm=null;renderCoach()}});
  netInit();showStart();OV.raf=requestAnimationFrame(ovLoop)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
// ===================== part 6: board overlay (labels, route, markers), advisor, sunk cards, monster-phase card =====================
// ---------- the overlay: HTML/SVG drawn over the board, positioned from the kit's own camera (3D) or the 2D chart ----------
const OV={items:[],sig:'',descs:[],raf:0,proj:null,pk:''};
const sqW=(c,r)=>[c-2.5,r-2.5];
function ovMakeProj(){try{const bd=$('#board');if(!bd)return null;const B=bd.getBoundingClientRect();if(!B.width)return null;
  const c3=$('#c3');
  if(c3&&!c3.hidden){const K=TWKit._K;if(!K||!K.on||!K.cam)return null;const hr=c3.getBoundingClientRect();if(!hr.width)return null;const v=new THREE.Vector3();
    return (x,y,z)=>{v.set(x,y,z).project(K.cam);if(v.z>1)return null;return [hr.left-B.left+(v.x+1)/2*hr.width,hr.top-B.top+(1-v.y)/2*hr.height]}}
  const fb=$('#fb');const svg=fb&&fb.querySelector('svg');if(!svg||!svg.viewBox||!svg.viewBox.baseVal)return null;
  const sr=svg.getBoundingClientRect(),vb=svg.viewBox.baseVal;if(!sr.width||!vb.width)return null;
  const sc=Math.min(sr.width/vb.width,sr.height/vb.height);const ox=sr.left-B.left+(sr.width-vb.width*sc)/2-vb.x*sc,oy=sr.top-B.top+(sr.height-vb.height*sc)/2-vb.y*sc;
  return (x,y,z)=>[ox+x*sc,oy+z*sc-(y||0)*sc*.25]}catch(e){return null}}
function bez(a,c,b,n){const o=[];for(let i=0;i<=n;i++){const t=i/n,u=1-t;o.push([u*u*a[0]+2*u*t*c[0]+t*t*b[0],u*u*a[1]+2*u*t*c[1]+t*t*b[1]])}return o}
function pw(c,r,p){const w=TWKit.portWorld(c,r,p);return [w[0],w[1]]}
// the actual route of a placement, from the engine's own path (analyse -> traceSteps), as world points on the board plane
function routeDesc(A,S){if(!A||!A.steps||!A.steps.length)return null;let pts=[];
  for(const st of A.steps){const a=pw(st.c,st.r,st.from),b=pw(st.c,st.r,st.to),c=sqW(st.c,st.r);const seg=bez(a,c,b,8);if(pts.length)seg.shift();pts.push(...seg)}
  const last=A.steps[A.steps.length-1],dd=DIR[last.to>>1];let stop,label;
  if(A.st==='ok'&&A.end){stop=pw(A.end[0],A.end[1],MATE[last.to]);label=`Stop: column ${A.end[0]+1}, row ${A.end[1]+1}`}
  else if(A.st==='edge'){const b=pw(last.c,last.r,last.to);stop=[b[0]+dd[0]*.4,b[1]+dd[1]*.4];label='Off the edge'}
  else{stop=sqW(last.c+dd[0],last.r+dd[1]);label=A.st==='mon'?`Hits ${levName(A.mon)}`:'Rift Gate'}
  pts.push(stop);
  if(A.coll)label='Collision';
  return {pts,stop,label,bad:!!A.bad,start:pts[0]}}
// start marks with a readable side: "3 L" / "3 R" on the top and bottom edges, "3 U" / "3 D" on the left and right edges
function startInfo(d){const mv=validMoves(d).filter(m=>m.a==='start');const by={};
  for(const m of mv){const pe=TWKit.portEdge(m.x,m.y,m.e);if(!pe)continue;const w=pw(m.x,m.y,m.e);const k=pe.edge+pe.index;(by[k]=by[k]||[]).push({m,edge:pe.edge,idx:pe.index,w})}
  const out=[];for(const k in by){const l=by[k];const hor=l[0].edge==='top'||l[0].edge==='bottom';l.sort((a,b)=>hor?a.w[0]-b.w[0]:a.w[1]-b.w[1]);
    l.forEach((o,i)=>{o.side=hor?'LR'[i]:'UD'[i];o.sideWord=hor?['left','right'][i]:['upper','lower'][i];o.lab=o.idx+o.side;out.push(o)})}
  return out}
function startAdvice(K,d,info){let m=null;try{m=aiMove(d,'hard')}catch(e){}if(!m||m.a!=='start')return null;
  const o=info.find(x=>x.m.x===m.x&&x.m.y===m.y&&x.m.e===m.e);if(!o)return null;const dm=distMon(K,[m.x,m.y]);
  return {o,why:`${o.edge[0].toUpperCase()+o.edge.slice(1)} ${o.idx}, ${o.sideWord} mark: ${(m.x===0||m.x===BW-1)&&(m.y===0||m.y===BW-1)?'a corner square, but the best left':'away from the corners, so you have room to turn'}${K.mons.some(q=>q.k==='L')?`; the nearest leviathan is ${dm} square${dm===1?'':'s'} away`:''}.`}}
const levNm=id=>levName(id);
function monHits(mo,sqs){const f=[];if(!mo||mo.k!=='L')return f;for(let die=1;die<=5;die++){const a=LEV[mo.id].arr[die-1];if(a==='R')continue;const dd=DIR[(DIRN[a]+mo.r)%4],tx=mo.x+dd[0],ty=mo.y+dd[1];if(sqs.some(q=>q&&q[0]===tx&&q[1]===ty))f.push(die)}return f}
// ONE line per leviathan that matters (replaces the two duplicate warnings)
function threatHTML(K,seat,m,A){const S=K.ships[m?m.s:seat];if(!S||S.x==null&&!S.on)return '';let ids,sqs;
  if(A&&A.st==='ok'){ids=A.mons;sqs=[A.end];if(A.on)sqs.push(A.on)}else if(A)return '';else{ids=adjMons(K,S);sqs=[[S.x,S.y]];if(S.on)sqs.push(S.on)}
  const when=A?'where you stop':'you';
  return ids.map(id=>{const mo=K.mons.find(q=>q.id===id&&q.k==='L');if(!mo)return '';const f=monHits(mo,sqs);
    const pc=Math.round(16/36*f.length/6*100);
    return `<span class="warn-l thr" data-mon="${id}">${esc(levName(id))} is next to ${when}. `+(f.length?`If the leviathans wake (dice total 6 to 8) and it rolls ${f.join(' or ')}, it moves onto you and you sink (about ${pc}% each turn).`:`It cannot move onto you right now (its arrows point elsewhere).`)+`</span>`}).filter(Boolean).join('<br>')}
// ---------- the Safest-move advisor: the hard computer's own evaluation (ai.js: scoreMove, hypo, safeOpts, drawSafe, mcRisk) plus a 2-turn look-ahead ----------
// chance (over the tile I will draw) that I can still sail safely this coming turn AND the one after, ignoring leviathan moves: the "am I being trapped" look-ahead
function surv2(B,seat,after){const S=B.ships[seat];if(!S||!S.alive||S.x==null)return .5;let tot=0;
  for(let t=0;t<35;t++){const hand=after.concat([t]);let best=0;
    for(let ci=0;ci<hand.length&&best<1;ci++){const c=hand[ci];if(!isCur(c))continue;
      for(let r=0;r<4&&best<1;r++){const sim=simPlace(B,S.x,S.y,c,r);const o=sim.res[seat];if(!o||o.st==='edge'||o.st==='mon'||sim.coll.includes(seat))continue;
        if(o.st==='gate'){best=Math.max(best,.5);continue}
        const h2=hypo(B,S,c,r),S2=h2.B.ships[seat];if(!S2||!S2.alive||S2.x==null)continue;
        const p=safeOpts(h2.B,S2,hand.filter((x,i)=>i!==ci))>0?1:drawSafe(h2.B,S2);if(p>best)best=p}}
    tot+=best}
  return tot/35}
function advise(K,seat,o){o=o||{};const L=Object.assign({},AILV.hard,{look:o.look!=null?o.look:0});const W2=o.w2!=null?o.w2:700;CUR_RNG=mkRng((kHash(K)^0x5bd1e995)>>>0);MCC={};
  const mv=genMoves(K,seat);const out=[];const hand=K.hands[seat];
  for(const m of mv){let sc=scoreMove(K,seat,m,L),info={tier:3};
    if(m.a==='place'){const S=K.ships[m.s],tile=hand[m.t];const hy=hypo(K,S,tile,m.r);info.sinks=hy.dead.includes(seat);info.hurts=hy.dead.some(i=>i!==seat&&sameTeam(K,i,seat));
      if(info.sinks)info.tier=0;
      else{const S2=hy.B.ships[seat];const after=hand.filter((c,i)=>i!==m.t);
        if(S2&&S2.alive&&S2.x!=null){info.n=safeOpts(hy.B,S2,after);info.fd=drawSafe(hy.B,S2);info.pl=info.n>0?0:1-info.fd;info.s2=surv2(hy.B,seat,after);
          sc+=W2*(info.s2-1);info.trap2=info.s2<.35;
          info.tier=info.pl>=.999||info.s2<.02?1:(info.trap2?2:3)}
        else if(S2&&S2.alive)info.tier=2}
      if(info.hurts)sc-=400}
    out.push({m,sc,info})}
  out.sort((a,b)=>b.info.tier-a.info.tier||b.sc-a.sc);return out}
function recMove(d){const key=G.logN+':'+d+':'+(G.q?1:0);if(UI.recKey===key&&UI.recA)return UI.recM;let a=null;try{a=advise(knowledge(d),d)}catch(e){console.error(e)}
  UI.recKey=key;UI.recA=a;UI.recM=a&&a.length?a[0].m:null;return UI.recM}
function recHTML(K,d,pl,full){const m=recMove(d);if(!m)return '';const a=UI.recA||[];const me=a.find(x=>x.m===m)||a[0];let why='',lab='';
  if(m.a==='place'){const A=analyse(K,d,m);const nb=a.filter(x=>x.m.a==='place'&&x.info.tier===0).length,nt=a.filter(x=>x.m.a==='place'&&(x.info.tier===1||x.info.tier===2)).length;
    lab=`tile ${m.t+1} turned ${m.r*90} degrees`;
    why=A.st==='ok'?`Your junk sails ${A.n} current${A.n>1?'s':''} and stops at column ${A.end[0]+1}, row ${A.end[1]+1}`+(K.mons.some(q=>q.k==='L')?`, ${distMon(K,A.end)} square${distMon(K,A.end)===1?'':'s'} from the nearest leviathan`:'')+'.':A.st==='gate'?'It leads into the Rift Gate.':'Every placement is risky; this one is the least bad.';
    const n=me.info.n;why+=n!=null?(n>0?` Next turn you would still have ${n} safe placement${n>1?'s':''}.`:' Next turn you would depend on the tile you draw.'):'';
    why+=` Right now ${nb} of ${pl.length} placements would sink you`+(nt?`, and ${nt} more would leave you trapped within two turns.`:'.')}
  else if(m.a==='cannon'){lab=`fire the Deck Cannon at ${levName(m.m)}`;why='It removes a leviathan that is next to you.'}
  else if(m.a==='gate'){lab='play the Rift Gate';why='It moves you away from danger.'}else{lab='pass';why='You have nothing to play.'}
  return `<div class="rec"><b>Safest move:</b> ${lab}.${full?` <span class="tiny">${why}</span>`:''}${m.a==='place'?` <button class="btn small" data-a="sugg">Show me the safest move</button>`:''}</div>`}
// ---------- why a junk sank ----------
function causeOf(why){const w=String(why||'');let m;
  if(/off the edge|sailing off/.test(w))return {k:'edge',t:'its wake ran off the edge of the chart. A current that points out of the 6 by 6 sea sinks the junk riding it.'};
  if(/collided/.test(w))return {k:'collision',t:'two junks ended on the same wake heading the same way, so both went down together (a head-on collision).'};
  if(/Maelstrom/.test(w))return {k:'maelstrom',t:'the Maelstrom, the whirlpool, moved onto its square and swallowed it.'};
  if(/Rogue Wave|capsized/.test(w)){const ww=G&&G.wave;return {k:'wave',t:`the Rogue Wave caught it: it was in the wave's band and its capsize roll was too low${ww?` (the wave is on ${(ww.r&1)?'column '+(ww.x+1):'row '+(ww.y+1)}, strength ${waveStr()})`:''}.`}}
  if(m=/blocked in by (.+)$/.exec(w))return {k:'block',t:`${m[1]} sat on the square in front of it when its turn began and nothing could save it.`};
  if(m=/ran into (.+)$/.exec(w))return {k:'mon',t:`its wake ended in the square of ${m[1]}.`};
  if(m=/crushed by (.+)$/.exec(w))return {k:'crush',t:`${m[1]} swam onto the square it was on (or its tile) and crushed it.`};
  if(/rift/.test(w))return {k:'rift',t:'the Rift Gate could not find it a safe landing.'};
  return {k:'other',t:w+'.'}}
const youSeat=()=>{try{return viewSeat()}catch(e){return -1}};
function sunkAdd(e){if(!G||UI.sunkSeen&&UI.sunkSeen[e.key])return;(UI.sunkSeen=UI.sunkSeen||{})[e.key]=1;const c=causeOf(e.why);
  let card=c.k==='collision'?UI.sunk.find(x=>x.k==='collision'&&x.key0===e.key0):null;
  if(card){if(!card.seats.includes(e.seat))card.seats.push(e.seat)}
  else{card={id:Math.random().toString(36).slice(2),seats:[e.seat],k:c.k,t:c.t,key0:e.key0,cur:e.cur,actor:e.actor};UI.sunk.push(card);if(UI.sunk.length>4)UI.sunk.shift()}
  if(e.at)UI.marks=(UI.marks||[]).filter(x=>x.seat!==e.seat).concat([{seat:e.seat,at:e.at,id:card.id}]);
  if(!humans().length){const id=card.id;setTimeout(()=>{UI.sunk=UI.sunk.filter(x=>x.id!==id);UI.marks=(UI.marks||[]).filter(x=>x.id!==id);renderCards();ovUpdate()},9000/(UI.speed||1))}
  renderCards();ovUpdate()}
function sunkNames(seats){const me=youSeat();const l=seats.map(i=>i===me?'Your junk':nm(i)+"'s junk");return l.length>1?l.slice(0,-1).join(', ')+' and '+l[l.length-1]:l[0]}
function renderCards(){const el=$('#cards');if(!el)return;if(!G||!UI.sunk||!UI.sunk.length){el.innerHTML='';el.hidden=true;return}el.hidden=false;
  const me=youSeat();
  el.innerHTML=UI.sunk.map(c=>{const mine=c.seats.includes(me);const who=sunkNames(c.seats);const dots=c.seats.map(dot).join('');
    return `<div class="prompt sunk${mine?' mine':''}" data-sunk="${c.seats.join(',')}"><h4><span class="x">&#10006;</span> Sunk! ${dots} ${esc(who)}</h4><p><b>Because</b> ${esc(c.t)}</p><p class="tiny">${c.k==='collision'?'Both junks are out.':''} It happened on ${c.cur===youSeat()&&!hotSeat()?'your':esc(nm(c.cur))+"'s"} turn. The red mark on the board shows where.${mine?' You are out, but you can watch the rest of the game.':''}</p><button class="btn small" data-a="sunkok" data-id="${c.id}">Got it</button></div>`}).join('')}
function sunkClear(){UI.sunk=[];UI.marks=[];UI.sunkSeen={};renderCards()}
// ---------- the monster-phase card ----------
// builds the card's lines from the recorded events: roll, then one line per leviathan move / rise / swim-off, in the order they happen
function mphBuild(evs){let mp=null;
  for(let i=0;i<evs.length;i++){const e=evs[i];
    if(e.t==='dice'){const t=e.d[0]+e.d[1];mp={d:e.d.slice(),total:t,wake:t>=6&&t<=8,lines:[],seat:e.seat,shown:0}}
    else if(mp&&e.t==='monact'){const pr=evs[i-1];const nmx=levName(e.id);let txt=pr&&pr.t==='log'&&pr.text.indexOf(nmx)===0?pr.text:'';if(txt)pr.skip=true;
      txt=txt?txt.slice(nmx.length+1).replace(/\.$/,''):(e.die===6?'stays put':'moves');
      e.ln=mp.lines.length;mp.lines.push({id:e.id,txt:`rolled ${e.die}: ${txt}`,nm:nmx})}
    else if(mp&&e.t==='arrive'&&(e.spawn||e.k==='M')){const pr=evs[i-1];const txt=pr&&pr.t==='log'?pr.text:(e.k==='M'?'The Maelstrom moves':levName(e.id)+' rises');if(pr&&pr.t==='log')pr.skip=true;
      e.ln=mp.lines.length;mp.lines.push({id:e.id,txt:txt.replace(/\.$/,''),nm:'',plain:1,maelstrom:e.k==='M'})}
    else if(mp&&mp.lines.length&&e.t==='destroy'){const l=mp.lines[mp.lines.length-1];if(!/smashes/.test(l.txt))l.txt+=` and smashes the tile at column ${e.x+1}, row ${e.y+1}`}
    else if(mp&&mp.lines.length&&e.t==='sink'){const l=mp.lines[mp.lines.length-1];l.txt+=`: ${e.seat===youSeat()&&!hotSeat()?'your':nm(e.seat)+"'s"} junk sinks!`;l.bad=1}
    else if(mp&&e.t==='log'&&/^The Maelstrom (churns|drains)/.test(e.text)){e.skip=true;mp.lines.push({id:-1,txt:e.text.replace(/\.$/,''),nm:'',plain:1});e.ln=mp.lines.length-1}}
  return mp}
function mphHTML(){const mp=UI.mph;if(!mp||G&&G.over&&!UI.busy)return '';
  const sc=[];for(let n=2;n<=12;n++)sc.push(`<span class="${n>=6&&n<=8?'w':''}${!mp.roll&&n===mp.total?' cur':''}">${n}</span>`);
  const verdict=mp.roll?'Rolling...':mp.wake?'6, 7 or 8: the leviathans stir!':'Not 6, 7 or 8: calm, nothing moves.';
  const shown=mp.lines.slice(0,mp.shown);
  return `<div class="mph ${mp.wake&&!mp.roll?'wake':''}"><div class="mh"><b>${G&&G.seats[mp.seat]?(mp.seat===youSeat()&&!hotSeat()?'Your':esc(nm(mp.seat))+"'s")+' roll':'The roll'}</b> <span class="tiny">two dice added: 6, 7 or 8 wakes the leviathans</span></div>
  <div class="dice"><span class="die g${mp.roll?' roll':''}">${mp.roll?'?':mp.d[0]}</span><span class="die b${mp.roll?' roll':''}">${mp.roll?'?':mp.d[1]}</span><span class="tot">${mp.roll?'':'= '+mp.total}</span><span class="verdict">${verdict}</span></div>
  <div class="scale" aria-label="Leviathans wake on a total of 6, 7 or 8">${sc.join('')}</div>
  ${shown.length?`<ol class="mlines">${shown.map((l,i)=>`<li class="${i===shown.length-1&&UI.mphLive?'now':''}${l.bad?' bad':''}">${l.plain?'':`<b data-mon="${l.id}">${esc(l.nm)}</b> `}${esc(l.txt)}</li>`).join('')}</ol>`:''}</div>`}
// ---------- the overlay descriptors ----------
function ovUpdate(){if(!G||!UI.started||!kitOk()){ovApply([]);return}const D=[];const busy=UI.busy;const me=youSeat();const d=sideToAct();const myTurn=!busy&&!G.over&&d>=0&&G.seats[d].human&&!mustPass(d);
  const near=new Set();let dq=null;if(G.q&&G.q.kind==='doom'&&G.q.ctx&&G.q.ctx.cause&&G.q.ctx.cause.id!=null&&G.q.who===me)dq=G.q.ctx.cause.id;if(myTurn&&G.phase==='play'){const S=G.ships[d];if(S&&S.x!=null)for(const id of adjMons(G,S))near.add(id)}
  for(const k in KS.mons){const a=k.split(',').map(Number),id=+KS.mons[k].split(':')[0];D.push({k:'tag',id:'m'+id,wx:a[0]-2.5,wy:.95,wz:a[1]-2.5,t:levName(id),cls:'mon'+(UI.hiMon===id||UI.hov===id||dq===id?' hi':'')+(near.has(id)?' near':''),mon:id})}
  for(const k in KS.mael){const a=k.split(',').map(Number);D.push({k:'tag',id:'ma'+k,wx:a[0]-2.5,wy:.5,wz:a[1]-2.5,t:'Maelstrom',cls:'piece mael'})}
  for(const k in KS.gates){const a=k.split(',').map(Number);D.push({k:'tag',id:'g'+k,wx:a[0]-2.5,wy:.55,wz:a[1]-2.5,t:'Rift Gate',cls:'piece gate'})}
  if(KS.wave&&G.wave){const w=G.wave;D.push({k:'tag',id:'wv',wx:w.x-2.5,wy:.55,wz:w.y-2.5,t:`Rogue Wave: ${(w.r&1)?'column '+(w.x+1):'row '+(w.y+1)}, strength ${waveStr()}`,cls:'piece wave'})}
  if(!busy)for(const s of G.ships){const p=shipPos(s);if(!p)continue;const w=p.port!=null?pw(p.c,p.r,p.port):sqW(p.c,p.r);const mine=s.i===me&&me>=0;
    if(!(mine&&UI.route))D.push({k:'tag',id:'s'+s.i,wx:w[0],wy:.5,wz:w[1],t:mine?'You':nm(s.i),cls:'ship'+(mine?' me':'')+(myTurn&&s.i===d?' act':''),sail:colOf(s.i).sail});
    if(mine&&myTurn&&G.phase==='play')D.push({k:'ring',id:'r'+s.i,wx:w[0],wz:w[1]})}
  if(myTurn&&G.phase==='setup'&&!G.q){const info=startInfo(d);const adv=startAdvice(knowledge(d),d,info);for(const o of info)D.push({k:'pip',id:'p'+o.m.x+o.m.y+o.m.e,wx:o.w[0],wz:o.w[1],t:o.lab,best:!!(adv&&adv.o===o)})}
  if(UI.route&&!busy)D.push({k:'route',id:'rt',pts:UI.route.pts,bad:UI.route.bad,stop:UI.route.stop,label:UI.route.label});
  if(UI.arrow)D.push({k:'arrow',id:'ar',a:UI.arrow.a,b:UI.arrow.b});
  for(const m of UI.marks||[])D.push({k:'mark',id:'mk'+m.id+m.seat,wx:m.at[0],wz:m.at[1],t:nm(m.seat)+' sunk'});
  if(PH.on&&PH.pop==='info'){const I=phInfoData(PH.pd);if(I&&I.at)D.push({k:'ring',id:'ri',wx:I.at[0]-2.5,wz:I.at[1]-2.5})}
  if(PH.on&&PH.pop==='start'&&PH.pd)D.push({k:'ring',id:'rs',wx:PH.pd.x-2.5,wz:PH.pd.y-2.5})
  {const seen={};for(const t of D){if(t.k!=='tag')continue;const k=t.wx.toFixed(1)+','+t.wz.toFixed(1);const n=seen[k]=(seen[k]||0)+1;if(n>1)t.wy+=.28*(n-1)}}
  ovApply(D)}
function ovApply(D){const sig=JSON.stringify(D);if(sig===OV.sig&&OV.items.length===D.length)return;OV.sig=sig;OV.descs=D;const root=$('#ov');if(!root)return;
  root.innerHTML='<svg id="ovsvg" width="100%" height="100%"></svg>';const svg=root.firstChild;OV.items=[];
  for(const ds of D){const it={ds};
    if(ds.k==='route'||ds.k==='arrow'){const ns='http://www.w3.org/2000/svg';const g=document.createElementNS(ns,'g');g.setAttribute('class',ds.k==='route'?'rtg'+(ds.bad?' bad':''):'arg');
      const a=document.createElementNS(ns,'polyline'),b=document.createElementNS(ns,'polyline');a.setAttribute('class','out');b.setAttribute('class','ln');g.append(a,b);svg.appendChild(g);it.poly=[a,b];
      if(ds.k==='route'){const f=document.createElement('div');f.className='ostop'+(ds.bad?' bad':'');f.innerHTML=`<i></i><span>${esc(ds.label)}</span>`;root.appendChild(f);it.el=f;
        const s=document.createElement('div');s.className='ostart';s.innerHTML='<span>start</span>';root.appendChild(s);it.el2=s}
      else{const h=document.createElementNS(ns,'polygon');h.setAttribute('class','head');g.appendChild(h);it.head=h}}
    else{const e=document.createElement('div');
      if(ds.k==='tag'){e.className='otag '+ds.cls;e.textContent=ds.t;if(ds.sail){const i=document.createElement('i');i.style.background=ds.sail;e.prepend(i)}if(ds.mon!=null)e.dataset.mon=ds.mon}
      else if(ds.k==='ring')e.className='oring';
      else if(ds.k==='pip'){e.className='opip'+(ds.best?' best':'');e.innerHTML=`<b>${esc(ds.t)}</b>${ds.best?'<u>best</u>':''}`}
      else if(ds.k==='mark'){e.className='omark';e.innerHTML=`<b>&#10006;</b><span>${esc(ds.t)}</span>`}
      root.appendChild(e);it.el=e}
    OV.items.push(it)}
  ovPos(true)}
function ovPos(force){const root=$('#ov');if(!root||!OV.items.length)return;const k=document.getElementById('board').clientWidth+'x'+document.getElementById('board').clientHeight;
  const P=ovMakeProj();if(!P)return;
  const tfm=(el,p)=>{if(!p){el.style.display='none';return}el.style.display='';el.style.transform=`translate(${p[0].toFixed(1)}px,${p[1].toFixed(1)}px)`};
  for(const it of OV.items){const ds=it.ds;
    if(it.poly){const pts=ds.k==='route'?ds.pts:[ds.a,ds.b];const pp=pts.map(q=>P(q[0],.06,q[1]));if(pp.some(x=>!x))continue;const s=pp.map(x=>x[0].toFixed(1)+','+x[1].toFixed(1)).join(' ');it.poly[0].setAttribute('points',s);it.poly[1].setAttribute('points',s);
      if(ds.k==='route'){const e=pp[pp.length-1];tfm(it.el,e);tfm(it.el2,pp[0]);const sp=it.el.lastChild,Bw=document.getElementById('board').clientWidth;if(sp){sp.style.left='0px';const w=sp.offsetWidth;const dx=Math.min(0,Bw-6-(e[0]+w/2))+Math.max(0,6-(e[0]-w/2));sp.style.left=dx.toFixed(0)+'px'}}
      else{const a=pp[pp.length-2]||pp[0],b=pp[pp.length-1];const ang=Math.atan2(b[1]-a[1],b[0]-a[0]);const L=14,W=8;const h=[[b[0],b[1]],[b[0]-L*Math.cos(ang)+W*Math.sin(ang),b[1]-L*Math.sin(ang)-W*Math.cos(ang)],[b[0]-L*Math.cos(ang)-W*Math.sin(ang),b[1]-L*Math.sin(ang)+W*Math.cos(ang)]];it.head.setAttribute('points',h.map(x=>x.join(',')).join(' '))}}
    else tfm(it.el,P(ds.wx,ds.wy||.05,ds.wz))}}
function ovLoop(){try{if(!document.hidden&&OV.items.length)ovPos()}catch(e){}OV.raf=requestAnimationFrame(ovLoop)}
document.addEventListener('mouseover',e=>{const t=e.target.closest&&e.target.closest('[data-mon]');const id=t&&t.dataset.mon!=null&&t.dataset.mon!==''?+t.dataset.mon:null;if(t&&t.classList.contains('otag'))return;if(id!==UI.hov){UI.hov=id;ovUpdate()}});
// ---------- the Pieces drawer: what is on the board right now ----------
function piecesNowHTML(){if(!G||!UI.started)return '<p class="tiny">Start a game to see where the expansion pieces are.</p>';const o=[];
  for(const g of G.gates)o.push(`<li><b>Rift Gate</b> on column ${g.x+1}, row ${g.y+1}: junks and leviathans that touch it are thrown to a rolled square.</li>`);
  if(G.wave){const w=G.wave;o.push(`<li><b>Rogue Wave</b> sweeping ${(w.r&1)?'column '+(w.x+1):'row '+(w.y+1)}, heading ${DNAME[w.r]}, strength ${waveStr()}: any junk in that band rolls a die and must reach ${waveStr()} or capsize.</li>`)}
  for(const m of G.mons)if(m.k==='M')o.push(`<li><b>Maelstrom</b> on column ${m.x+1}, row ${m.y+1}: moves on calm rolls (1 east, 2 south, 3 west, 4 north) and destroys what it enters.</li>`);
  if(!o.length)o.push('<li class="tiny">No expansion piece is on the board right now'+(G.exp&&(G.exp.rift||G.exp.wave||G.exp.maelstrom||G.exp.cannon)?' (they may still be in the piles)':' (the expansions are off in this game)')+'.</li>');
  const hd=viewSeat()>=0&&G.hands[viewSeat()]?G.hands[viewSeat()].filter(isCannon).length:0;
  return `<h3>On the board now</h3><ul>${o.join('')}</ul>${G.exp&&G.exp.cannon?`<p class="tiny">Deck Cannons: ${hd?'you hold '+hd+' (two is the most you may keep)':'you hold none'}.</p>`:''}`}

// ===================== part 7: phone layout (board first, tap to play, pop-ups) =====================
// Only active when html.ph is set (short side <= 500 px, or a touch screen <= 600 px; ?phone=1 / ?phone=0 force it). Desktop and tablets never touch this code.
const PH={on:false,land:false,pop:null,pd:null,zoom:false,zk:'',cur:null,mphHide:null,ovHide:null,swipeT:0,tmr:0,strip:'',pop_h:'',toast:''};
const PH_REGION=[-4.02,4.02,-4.02,4.02];
const PH_ICO={tile:'<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 4q0 8 8 8M4 14q6 0 6 6"/></svg>',mon:'<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 17c2-6 5-8 9-8 3 0 4-3 7-3-1 2-1 3 0 4-2 1-2 3-3 4 3 0 4 2 5 4-3-1-5-2-7-1-3 1-6 1-11 0zM9 12h.01"/></svg>',zoom:'<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="1.5"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/></svg>',rl:'<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12a7 7 0 1 0 2.5-5.4M5 4v4h4"/></svg>',rr:'<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12a7 7 0 1 1-2.5-5.4M19 4v4h-4"/></svg>'};
function phDetect(){try{const P=new URLSearchParams(location.search);if(P.has('phone'))return P.get('phone')!=='0'}catch(e){}
  const s=Math.min(innerWidth,innerHeight);if(s<=500)return true;let c=false;try{c=matchMedia('(pointer:coarse)').matches}catch(e){}return c&&s<=600}
function phInsets(){try{const P=new URLSearchParams(location.search);if(P.has('safe')){const a=P.get('safe').split(',').map(Number);return {t:a[0]||0,r:a[1]||0,b:a[2]||0,l:a[3]||0}}
  let p=document.getElementById('phprobe');if(!p){p=document.createElement('div');p.id='phprobe';p.setAttribute('aria-hidden','true');p.style.cssText='position:fixed;left:0;top:0;width:0;height:0;visibility:hidden;pointer-events:none;padding:env(safe-area-inset-top,0px) env(safe-area-inset-right,0px) env(safe-area-inset-bottom,0px) env(safe-area-inset-left,0px)';document.body.appendChild(p)}
  const c=getComputedStyle(p);return {t:parseFloat(c.paddingTop)||0,r:parseFloat(c.paddingRight)||0,b:parseFloat(c.paddingBottom)||0,l:parseFloat(c.paddingLeft)||0}}catch(e){return {t:0,r:0,b:0,l:0}}}
function phApply(){const R=document.documentElement;const was=PH.on;PH.on=phDetect();R.classList.toggle('ph',PH.on);
  if(!PH.on){R.classList.remove('ph-l','ph-p');for(const k of['--bs','--sat','--sar','--sab','--sal'])R.style.removeProperty(k);return was}
  const w=innerWidth,h=innerHeight,I=phInsets(),bar=44;PH.land=w>h;
  const bs=PH.land?Math.min(h-I.t-I.b,w-I.l-I.r-300):Math.max(Math.round((w-I.l-I.r)*.78),Math.min(w-I.l-I.r,h-I.t-I.b-bar-250));
  R.classList.toggle('ph-l',PH.land);R.classList.toggle('ph-p',!PH.land);
  R.style.setProperty('--bs',Math.max(200,Math.floor(bs))+'px');R.style.setProperty('--sat',I.t+'px');R.style.setProperty('--sar',I.r+'px');R.style.setProperty('--sab',I.b+'px');R.style.setProperty('--sal',I.l+'px');return true}
// ---------- camera: flat top-down, the 6x6 board + edge numbers fill the square ----------
function phZoom(){if(!PH.on||!kitOk())return;let c=null,r=null;
  if(PH.zoom&&G&&UI.started){const vs=viewSeat(),sd=sideToAct(),i=vs>=0?vs:sd;let S=i>=0?G.ships[i]:null;let p=S&&shipPos(S);if(!p){S=G.ships.find(x=>shipPos(x));p=S&&shipPos(S)}if(p){c=p.c;r=p.r}}
  const key=c!=null?c+','+r:'';if(key===PH.zk)return;PH.zk=key;try{if(key)TWKit.focus(c,r,1.7);else TWKit.focus(null)}catch(e){}}
// ---------- mini tile with the route highlighted ----------
const PH_P=[[1/3,0],[2/3,0],[1,1/3],[1,2/3],[2/3,1],[1/3,1],[0,2/3],[0,1/3]],PH_N=[[0,1],[0,1],[-1,0],[-1,0],[0,-1],[0,-1],[1,0],[1,0]];
function phD(a,b){const pa=PH_P[a],pb=PH_P[b],na=PH_N[a],nb=PH_N[b],dd=Math.hypot(pa[0]-pb[0],pa[1]-pb[1]),k=Math.min(.5,Math.max(.17,dd*.55));const f=p=>(6+p[0]*88).toFixed(1)+' '+(6+p[1]*88).toFixed(1);
  return 'M'+f(pa)+'C'+f([pa[0]+na[0]*k,pa[1]+na[1]*k])+' '+f([pb[0]+nb[0]*k,pb[1]+nb[1]*k])+' '+f(pb)}
function phMini(card,rot,A){const ps=TWKit.rotate(BASE_PATHS[CUR_TYPE[card]],rot||0);const st=A&&A.steps&&A.steps[0];const en=st?st.from:-1,ex=st?st.to:-1,bad=A&&A.bad;
  let s=`<svg class="mini" viewBox="0 0 100 100" aria-hidden="true"><rect x="2" y="2" width="96" height="96" rx="11" fill="#1d7c83" stroke="#14232b" stroke-width="3"/>`;
  for(const [a,b] of ps){if(!((a===en&&b===ex)||(a===ex&&b===en)))s+=`<path d="${phD(a,b)}" fill="none" stroke="#c9f2ea" stroke-opacity=".8" stroke-width="3.4" stroke-linecap="round"/>`}
  if(st){const col=bad?'#ff4b36':'#ffd24a',d=phD(en,ex);const q=PH_P[ex],o=PH_N[ex],px=6+q[0]*88,py=6+q[1]*88,tx=px-o[0]*9,ty=py-o[1]*9,nx=-o[1]*7,ny=o[0]*7,bx=px+o[0]*1,by=py+o[1]*1;
    s+=`<path d="${d}" fill="none" stroke="#14232b" stroke-width="11" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${col}" stroke-width="6.5" stroke-linecap="round"/>`;
    s+=`<polygon points="${tx.toFixed(1)},${ty.toFixed(1)} ${(bx+nx).toFixed(1)},${(by+ny).toFixed(1)} ${(bx-nx).toFixed(1)},${(by-ny).toFixed(1)}" fill="${col}" stroke="#14232b" stroke-width="2"/>`;
    const e=PH_P[en];s+=`<circle cx="${6+e[0]*88}" cy="${6+e[1]*88}" r="6.5" fill="#fff" stroke="#14232b" stroke-width="3"/>`}
  return s+'</svg>'}
function phWhy(A){if(!A)return '';if(A.coll)return 'collision';if(A.st==='edge')return 'off the edge';if(A.st==='mon')return 'hits a monster';if(A.st==='gate')return 'Rift Gate';if(A.st==='ok')return (A.n||1)+(A.n>1?' currents':' current')+(A.mons&&A.mons.length?' · monster near':'');return ''}
// ---------- what the player may do right now ----------
function phPlaceCtx(){if(!G||!UI.started||G.over||UI.busy)return null;const d=sideToAct();if(d<0||!G.seats[d].human||mustPass(d))return null;if(NET.on&&d!==NET.mySeat)return null;if(G.q||G.phase!=='play'||G.step!=='act')return null;
  const K=knowledge(d);return {d,K,hand:K.hands[d],sel:UI.sel,pl:(UI.moves||[]).filter(m=>m.a==='place')}}
function phExtras(c){const mv=UI.moves||[];const cm={};for(const x of mv.filter(m=>m.a==='cannon')){const k=x.m+':'+x.s;if(!cm[k])cm[k]=x}let h='';
  for(const x of Object.values(cm))h+=`<button class="pb warn" data-a="cannon" data-t="${x.t}" data-m="${x.m}" data-s="${x.s}">Fire at ${esc(levName(x.m))}</button>`;
  const gs={};for(const g of mv.filter(m=>m.a==='gate')){const k=g.t+':'+g.s;if(gs[k])continue;gs[k]=1;h+=`<button class="pb" data-a="gate" data-t="${g.t}" data-s="${g.s}">Rift Gate${g.s!==c.d?' for '+esc(nm(g.s)):''}</button>`}
  if(mv.find(m=>m.a==='pass'))h+=`<button class="pb" data-a="pass">Pass</button>`;return h}
function phTargets(c){const fr=[...new Set(c.pl.map(m=>m.s))];if(fr.length<2)return '';return `<div class="ps-x">${fr.map(s=>`<button class="pb${c.sel&&c.sel.s===s?' on':''}" data-a="target" data-s="${s}">${dot(s)} ${esc(nm(s))}</button>`).join('')}</div>`}
function phZoomBtn(){const c3=$('#c3');if(!c3||c3.hidden)return '';return `<button class="pb zoom${PH.zoom?' on':''}" data-ph="zoom" aria-pressed="${PH.zoom}" aria-label="Zoom to my ship" title="Zoom to my ship">${PH_ICO.zoom}</button>`}
function phHint(){if(UI.res&&UI.res.text)return esc(UI.res.text);return ''}
// ---------- the control strip ----------
function phStripHTML(){if(!G||!UI.started)return '';const d=sideToAct(),zb=phZoomBtn();
  if(G.over&&!UI.busy)return `<div class="ps-main"><div class="ps-msg"><b>Game over</b></div><div class="ps-ctl">${PH.ovHide===G.over?'<button class="pb pri" data-ph="showover">Result</button>':''}<button class="pb" data-a="again">Play again</button>${zb}</div></div>`;
  if(UI.busy){const now=UI.curTurn!=null&&G.seats[UI.curTurn]?UI.curTurn:d;return `<div class="ps-main"><div class="ps-msg">${now>=0?dot(now)+' '+phWhose(now):'The sea moves'}</div><div class="ps-ctl"><button class="pb" data-a="skip">Skip</button>${zb}</div></div><div class="ps-hint">${phHint()}</div>`}
  if(d<0)return `<div class="ps-main"><div class="ps-ctl">${zb}</div></div>`;
  const dh=G.seats[d].human;
  if(NET.on&&dh&&d!==NET.mySeat)return `<div class="ps-main"><div class="ps-msg">${dot(d)} <b>${esc(nm(d))}</b> is deciding...</div><div class="ps-ctl">${zb}</div></div>`;
  if(dh&&mustPass(d))return `<div class="ps-main"><div class="ps-msg">Pass the device to <b>${esc(nm(d))}</b></div><div class="ps-ctl">${zb}</div></div>`;
  if(!dh)return `<div class="ps-main"><div class="ps-msg">${dot(d)} ${phWhose(d)} <small>(computer)</small></div><div class="ps-ctl">${UI.pause||!humans().length?`<button class="pb" data-a="pause">${UI.pause?'Resume':'Pause'}</button>`:''}${zb}</div></div><div class="ps-hint">${phHint()}</div>`;
  if(G.q)return `<div class="ps-main"><div class="ps-msg">${dot(d)} <b>Decide</b> in the card</div><div class="ps-ctl">${zb}</div></div>`;
  if(G.phase==='setup'){let best='';try{const info=startInfo(d),adv=startAdvice(knowledge(d),d,info);if(adv)best=`<button class="pb pri" data-a="startmark" data-x="${adv.o.m.x}" data-y="${adv.o.m.y}" data-e="${adv.o.m.e}" title="${esc(adv.why)}">Best start</button>`}catch(e){}
    return `<div class="ps-main"><div class="ps-msg">${hotSeat()?'<b>'+esc(nm(d))+',</b> choose':'You sail the '+dot(d)+' <b>'+esc(colOf(d).name||nm(d))+'</b> junk. <b>Choose</b>'} your start: tap <b>Best start</b>, or an edge square and then a gold mark.</div><div class="ps-ctl">${best}${zb}</div></div>`}
  const c=phPlaceCtx();if(!c)return `<div class="ps-main"><div class="ps-ctl">${zb}</div></div>`;
  const {d:dd,K,hand,sel,pl}=c,can=pl.length>0&&!!sel;let tiles='';
  hand.forEach((card,t)=>{const on=can&&sel.t===t;
    if(isCur(card)){const r=sel?sel.r:0;let bd='',lab='';if(can){const A=analyse(K,dd,{a:'place',t,r,s:sel.s});bd=`<i class="bd ${A.bad?'sink':'safe'}">${A.bad?'&#10007;':'&#10003;'}</i>`;lab=A.bad?', sinks':', safe'}
      tiles+=`<button class="pt${on?' sel':''}" data-a="card" data-t="${t}" data-owner="${dd}" data-up="1" aria-label="Tile ${t+1}${lab}"><img alt="" src="${TWKit.cardURL(BASE_PATHS[CUR_TYPE[card]],{rot:r,size:80,uid:'s'+t})}">${bd}</button>`}
    else tiles+=`<button class="pt sp${on?' sel':''}" data-a="card" data-t="${t}" data-owner="${dd}" data-up="1" aria-label="${isGate(card)?'Rift Gate':'Deck Cannon'}">${isGate(card)?gateArt():cannonArt()}</button>`});
  let ctl='';if(can&&isCur(hand[sel.t])){const m={a:'place',t:sel.t,r:sel.r,s:sel.s},err=legal(m,dd);
    ctl=`<button class="pb" data-a="rot" data-d="-1" aria-label="Turn left" title="Turn left (Q)">${PH_ICO.rl}<span class="lbl">Turn</span></button><button class="pb" data-a="rot" data-d="1" aria-label="Turn right" title="Turn right (R)">${PH_ICO.rr}<span class="lbl">Turn</span></button><button class="pb pri" data-a="place"${err?' disabled':''}>Place</button>`}
  const hint=PH.pop==='tiles'?'':(can?phTileHint(K,dd,hand,sel):'Nothing can be laid: pick an option.');
  return `<div class="ps-main"><div class="ps-tiles">${tiles}</div><div class="ps-ctl">${ctl}${zb}</div></div>${phTargets(c)}<div class="ps-x">${phExtras(c)}</div><div class="ps-hint">${PH.toast?esc(PH.toast):hint}</div>`}
function phStrip(){const el=$('#ps');if(!el)return;const h=PH.on?phStripHTML()+phGoal()+phFeed():'';if(h!==PH.strip){PH.strip=h;el.innerHTML=h}}
// whose turn it is, in plain words
function phWhose(i){const me=youSeat();return i===me&&me>=0&&!hotSeat()?'<b>Your turn</b>':'<b>'+esc(nm(i))+"'s turn</b>"}
// what to do with the tiles: pick, turn, place; and when every tile sinks this way round, say that turning can fix it
function phTileHint(K,d,hand,sel){let safeNow=0,safeTurn=0;try{hand.forEach((c,t)=>{if(!isCur(c))return;if(!analyse(K,d,{a:'place',t,r:sel.r,s:sel.s}).bad)safeNow++;else if([0,1,2,3].some(r=>!analyse(K,d,{a:'place',t,r,s:sel.s}).bad))safeTurn++})}catch(e){}
  if(safeNow)return 'Pick a tile (&#10003; safe, &#10007; sinks), turn it if you like, then press Place. The gold line on the board is your route.';
  if(safeTurn)return 'Every tile sinks you this way round. Press Turn to find a &#10003;.';
  return 'Every tile sinks you: pick the one that does least harm.'}
// the goal and the race, always on screen: who is still afloat
function phGoal(){if(!G||!UI.started||G.phase==='setup'&&!G.turn)return '';const so=G.variant==='solo',es=G.variant==='easysolo';const me=youSeat();
  if(so||es){const toRise=G.mdeck.filter(x=>x<10).length,L=G.mons.filter(m=>m.k==='L').length;return `<div class="ps-goal">${so?`Goal: outlast every leviathan &middot; ${toRise} still to rise, ${L} on the board`:`Goal: stay afloat until turn ${G.opts.goal} (now ${G.turn})`}</div>`}
  const live=G.ships.filter(s=>s.alive).length;
  return `<div class="ps-goal">Last junk afloat wins &middot; ${G.order.map(i=>{const s=G.ships[i];const n=i===me&&me>=0&&!hotSeat()?'You':esc(nm(i));return `<i style="background:${colOf(i).sail}"></i>${s.alive?n:'<s>'+n+'</s>'}`}).join(' ')} <small>(${live} afloat)</small></div>`}
// what happened since your last move, in order, so nothing changes off-screen (the replay can be skipped or missed)
function phFeed(){if(!G||!UI.started||UI.busy||G.over||G.phase==='setup'||UI.myLogI==null)return '';
  const L=G.log.filter(l=>l.i>UI.myLogI&&!/^Turn \d+/.test(l.t)&&!/ draws? /.test(l.t)).reverse();if(!L.length)return '';
  const keep=L.slice(-6),more=L.length-keep.length;const me=youSeat(),mn=me>=0&&!hotSeat()?nm(me):null;const you=t=>mn?esc(t).split(esc(mn)).join(esc(mn)+' (you)'):esc(t);
  return `<div class="ps-feed"><h5>Since your last move</h5><ol>${keep.map(l=>`<li class="${l.c==='bad'?'bad':l.c==='big'?'big':''}">${you(l.t)}</li>`).join('')}</ol>${more?`<p class="tiny">${more} earlier line${more>1?'s':''} in the Log.</p>`:''}</div>`}
// ---------- the pop-up: tiles / info / start marks (lives in the free zone next to the board, never over it) ----------
function phTilesHTML(c){const {d,K,hand,sel,pl}=c;if(!pl.length||!sel)return '';const multi=hotSeat()||humans().length>1;
  const m={a:'place',t:sel.t,r:sel.r,s:sel.s};let selA=null,tiles='';
  hand.forEach((card,t)=>{const on=sel.t===t;
    if(isCur(card)){const A=analyse(K,d,{a:'place',t,r:sel.r,s:sel.s});if(on)selA=A;
      tiles+=`<button class="ph-t${on?' sel':''}" data-ph="pcard" data-t="${t}" data-owner="${d}" data-up="1" aria-label="Tile ${t+1}: ${A.bad?'sinks':'safe'}, ${phWhy(A)}">${phMini(card,sel.r,A)}<span class="bd ${A.bad?'sink':'safe'}">${A.bad?'SINKS':'SAFE'}</span><small>${esc(phWhy(A))}</small></button>`}
    else tiles+=`<button class="ph-t sp${on?' sel':''}" data-ph="pcard" data-t="${t}" data-owner="${d}" data-up="1" aria-label="${isGate(card)?'Rift Gate':'Deck Cannon'}">${isGate(card)?gateArt():cannonArt()}<span class="bd">${isGate(card)?'GATE':'CANNON'}</span></button>`});
  const cur=isCur(hand[sel.t]);const err=cur?legal(m,d):'';
  return `<div class="ph-head"><b>${multi?esc(nm(d))+': lay':'Lay'} a current</b><button class="ph-x" data-ph="pclose" aria-label="Close">&times;</button></div>
  <div class="ph-tiles" style="touch-action:pan-y">${tiles}</div>
  <div class="ph-ctl"><button class="pb" data-a="rot" data-d="-1" aria-label="Turn left" title="Turn left (Q)">${PH_ICO.rl}</button><span class="ph-rot" style="touch-action:pan-y">turned ${(sel.r||0)*90}&deg; <small>(swipe or tap)</small></span><button class="pb" data-a="rot" data-d="1" aria-label="Turn right" title="Turn right (R)">${PH_ICO.rr}</button>
  ${cur?`<button class="pb pri" data-a="place"${err?' disabled':''}>Place</button>`:(()=>{const g=(UI.moves||[]).find(x=>x.a==='gate'&&x.t===sel.t&&x.s===sel.s);return g?`<button class="pb pri" data-a="gate" data-t="${g.t}" data-s="${g.s}">Play Gate</button>`:''})()}</div>
  ${phTargets(c)}
  <p class="ph-out">${cur&&selA?outcomeHTML(K,d,m,selA):'This tile cannot be laid on a current.'}${err&&selA&&selA.bad?' <span class="warn-l">Not allowed: another tile is safer.</span> <button class="pb small" data-a="sugg">Safest move</button>':''}</p>
  <div class="ps-x">${phExtras(c)}</div>`}
const phFace=['north','north-east','east','south-east','south','south-west','west','north-west'];
function phMonInfo(m){const L=LEV[m.id];const d=sideToAct(),vs=viewSeat();const S=vs>=0?G.ships[vs]:null;
  const faces=L.arr.map((a,i)=>`<li><b>${i+1}</b> ${a==='R'?'quarter turn '+(L.rd>0?'clockwise':'counter-clockwise'):'swims '+DNAME[(DIRN[a]+m.r)%4]}</li>`).join('')+'<li><b>6</b> stays; another leviathan rises</li>';
  let thr='';if(S&&S.alive&&S.x!=null){const f=monHits(m,[[S.x,S.y]]);thr=f.length?`<p class="warn-l">Faces ${f.join(', ')} move it onto the square in front of your junk.</p>`:`<p class="tiny">It cannot reach the square in front of your junk this turn.</p>`}
  return {t:levName(m.id),at:[m.x,m.y],h:`<div class="ph-info"><img alt="" src="${TWKit.leviathanURL(levArrows(m.id),{rot:m.r,uid:'pi',size:104})}"><div><p><b>A leviathan.</b> When the two dice total 6, 7 or 8 it wakes, rolls one die and swims the way that face points. A junk whose wake ends on its square sinks; so does a tile it swims onto. Move order ${L.order}${L.gold?' (gold: wins ties)':''}.</p></div></div><ul class="ph-faces">${faces}</ul>${thr}`}}
function phInfoData(pd){if(!G||!pd)return null;
  if(pd.k==='ship'){const S=G.ships[pd.i];if(!S)return null;const p=shipPos(S);const me=viewSeat()===pd.i;const sq=S.x!=null?`front square: column ${S.x+1}, row ${S.y+1}`:S.alive?'on a tile':'sunk';
    return {t:(me?'You: ':'')+nm(pd.i)+"'s junk",at:p?[p.c,p.r]:null,h:`<p>${dot(pd.i)} <b>${esc(nm(pd.i))}</b> ${G.seats[pd.i].human?'(human)':'(computer, '+esc(G.seats[pd.i].lv)+')'}${G.team?' team '+'AB'[G.team[pd.i]]:''}.</p><p>${S.alive?'Afloat; '+sq+'.':'Sunk.'} Holds ${G.hands[pd.i].length} tile${G.hands[pd.i].length===1?'':'s'}${S.alive&&S.x!=null?'. Its wake follows the tile laid in front of it, and it sinks if it sails off the edge, into a leviathan, or onto another junk\'s wake.':'.'}</p>`}}
  const m=G.mons.find(x=>x.x===pd.x&&x.y===pd.y);
  if(pd.k==='mon'){if(!m||m.k!=='L')return null;return phMonInfo(m)}
  if(pd.k==='mael'){if(!m||m.k!=='M')return null;return {t:'Maelstrom',at:[m.x,m.y],h:`<p><b>A whirlpool.</b> On a calm wake roll it moves: 1 east, 2 south, 3 west, 4 north, 5 or 6 stays. It destroys the tile and junk it enters.</p>`}}
  if(pd.k==='gate'){if(!G.gates.some(g=>g.x===pd.x&&g.y===pd.y))return null;return {t:'Rift Gate',at:[pd.x,pd.y],h:`<p><b>A rift in the sea.</b> It stays on its square. A junk or leviathan that touches it is thrown to a rolled square.</p>`}}
  if(pd.k==='wave'){const w=G.wave;if(!w)return null;return {t:'Rogue Wave',at:[w.x,w.y],h:`<p><b>A rogue wave</b> sweeping ${(w.r&1)?'column '+(w.x+1):'row '+(w.y+1)}, heading ${DNAME[w.r]}, strength ${waveStr()}. Any junk in that band rolls a die and capsizes if it does not reach ${waveStr()}.</p>`}}
  return null}
function phInfoHTML(){const I=phInfoData(PH.pd);if(!I)return null;return `<div class="ph-head"><b>${esc(I.t)}</b><button class="ph-x" data-ph="pclose" aria-label="Close">&times;</button></div><div class="ph-body">${I.h}</div>`}
function phStartHTML(){const d=sideToAct();const pd=PH.pd;let info=[];try{info=startInfo(d).filter(o=>o.m.x===pd.x&&o.m.y===pd.y)}catch(e){}if(!info.length)return null;let adv=null;try{adv=startAdvice(knowledge(d),d,startInfo(d))}catch(e){}
  return `<div class="ph-head"><b>Start here?</b><button class="ph-x" data-ph="pclose" aria-label="Close">&times;</button></div><div class="ph-body"><p class="tiny">Pick a gold mark on this square. A mark in the middle of an edge is safest; next to a corner you may run out of room.</p><div class="ph-marks">${info.map(o=>`<button class="pb big${adv&&adv.o===o?' pri':''}" data-a="startmark" data-x="${o.m.x}" data-y="${o.m.y}" data-e="${o.m.e}">${o.edge[0].toUpperCase()+o.edge.slice(1)} ${o.idx}, ${o.sideWord} mark${adv&&adv.o===o?' (best)':''}</button>`).join('')}</div></div>`}
function phPopup(){const el=$('#ppop');if(!el)return;let h=null;
  if(PH.on&&G&&UI.started&&!(PH.cur&&PH.cur.block&&PH.pop!=='info')){
    if(PH.pop==='tiles'){const c=phPlaceCtx();h=c?phTilesHTML(c):null}
    else if(PH.pop==='info')h=phInfoHTML();
    else if(PH.pop==='start'){const d=sideToAct();h=d>=0&&G.seats[d].human&&G.phase==='setup'&&!G.q&&!UI.busy&&!mustPass(d)?phStartHTML():null}}
  if(!h){if(PH.pop){PH.pop=null;PH.pd=null}if(!el.hidden){el.hidden=true;el.innerHTML='';PH.pop_h=''}return}
  if(h!==PH.pop_h){const fresh=el.hidden;PH.pop_h=h;el.innerHTML=h;el.hidden=false;el.classList.toggle('in',fresh)}}
function phClose(){PH.pop=null;PH.pd=null;PH.toast='';phPopup();phStrip();try{ovUpdate()}catch(e){}}
function phOpen(kind,pd){PH.pop=kind;PH.pd=pd||null;PH.toast='';phPopup();phStrip();try{ovUpdate()}catch(e){}}
// ---------- cards: coach tips, wake roll, Sunk!, interrupts, pass screen, end card ----------
function phNeed(){if(!G||!UI.started)return null;const d=sideToAct();
  if(!G.over&&d>=0&&G.seats[d].human&&mustPass(d)&&!(NET.on))return 'pass';
  if(!G.over&&!UI.busy&&G.q&&d>=0&&G.seats[d].human&&!mustPass(d)&&!(NET.on&&d!==NET.mySeat))return 'q';
  if(UI.sunk&&UI.sunk.length)return 'sunk';
  if(G.over&&!UI.busy&&PH.ovHide!==G.over)return 'over';
  if(UI.mph&&PH.mphHide!==UI.mph&&(UI.mph.wake||UI.mph.lines.length)&&!(G.over&&!UI.busy))return 'mph';
  if(!UI.busy&&!G.over&&(UI.confirm||UI.guide==='full'&&nextLesson()))return 'coach';
  return null}
const PH_SRC={pass:'#main .passbox',over:'#main [data-over]',q:'#main [data-qkind]',sunk:'#cards > *',mph:'#res .mph',coach:'#coach .coach:not(.light)'};
function phCards(){const pc=$('#pc');if(!pc)return;const kind=PH.on?phNeed():null;
  if(!kind){PH.cur=null;if(!pc.hidden){pc.hidden=true;pc.innerHTML=''}clearTimeout(PH.tmr);PH.tmr=0;try{phPopup()}catch(e){}return}
  const src=document.querySelector(PH_SRC[kind]);let html=null;
  if(src){if(kind==='q'){const w=document.createElement('div');w.className='pc-in';w.appendChild(src);pc.replaceChildren(w);PH.cur={kind,html:'q'+G.logN}}
    else{const w=document.createElement('div');w.className='pc-in';const cl=src.cloneNode(true);w.appendChild(cl);
      for(const b of cl.querySelectorAll('[data-a=sunkok],[data-a=coachok]'))b.textContent='Continue';
      if(kind==='mph'||kind==='over'){const r=document.createElement('div');r.className='row';r.innerHTML=`<button class="btn pri" data-ph="dismiss">Continue</button>`;w.appendChild(r)}
      html=w.innerHTML;if(!PH.cur||PH.cur.kind!==kind||PH.cur.html!==html){const fresh=pc.hidden||!PH.cur||PH.cur.kind!==kind;pc.replaceChildren(w);PH.cur={kind,html};if(fresh){pc.classList.remove('in');void pc.offsetWidth;pc.classList.add('in')}}}}
  else if(!PH.cur||PH.cur.kind!==kind){pc.hidden=true;pc.innerHTML='';PH.cur=null;return}
  pc.hidden=false;PH.cur.block=true;
  if(PH.pop&&(PH.pop!=='info'||kind==='pass'||kind==='over'||kind==='q')){PH.pop=null;PH.pd=null;phPopup()}
  // the wake roll card goes away by itself a few seconds after the animation ends
  if(kind==='mph'&&!UI.busy&&!PH.tmr){const mp=UI.mph;PH.tmr=setTimeout(()=>{PH.tmr=0;if(UI.mph===mp&&!UI.busy){PH.mphHide=mp;phAfter()}},3500/(UI.tickRate||1))}
  if(kind!=='mph'){clearTimeout(PH.tmr);PH.tmr=0}}
// ---------- one pass after every render ----------
function phAfter(){if(!PH.on)return;try{phCards();phPopup();phStrip();phZoom()}catch(e){console.error(e)}}
// ---------- wiring (wrappers around the page's own functions) ----------
{const _render=render;render=function(){_render.apply(this,arguments);phAfter()};
 const _rr=renderRes;renderRes=function(){_rr.apply(this,arguments);if(PH.on)phCards()};
 const _rc=renderCards;renderCards=function(){_rc.apply(this,arguments);if(PH.on)phCards()};
 const _rco=renderCoach;renderCoach=function(){_rco.apply(this,arguments);if(PH.on)phCards()};
 const _rb=renderBar;renderBar=function(){_rb.apply(this,arguments);if(!PH.on||!G)return;const el=$('#barstat');if(!el)return;
   if(G.phase==='setup'){el.innerHTML='<span class="chip" aria-label="Choose start marks"><b>Pick a start</b></span>';return}
   const L=G.mons.filter(m=>m.k==='L').length,toRise=G.mdeck.filter(x=>x<10).length,es=G.variant==='easysolo',so=G.variant==='solo';
   const T=UI.busy&&UI.curTurnN!=null?UI.curTurnN:G.turn;
   el.innerHTML=`<span class="chip" role="status" aria-label="Turn ${T}${es?' of '+G.opts.goal:''}, ${G.deck.length} tiles left, ${L} monsters on the board${so?', '+toRise+' still to rise':''}"><span class="c2"><b>Turn ${T}${es?'/'+G.opts.goal:''}</b><small>${L} monster${L===1?'':'s'}${so?' (+'+toRise+')':''} &middot; ${G.deck.length} tiles</small></span></span>`};
 const _act=act;act=function(m,s){if(G&&G.seats[s]&&G.seats[s].human&&m&&m.a!=='q')UI.myLogI=G.logN;const p=PH.pop,pd=PH.pd;PH.pop=null;PH.pd=null;PH.toast='';const r=_act.apply(this,arguments);if(r===false&&PH.on&&G&&!G.over){PH.pop=p;PH.pd=pd;phAfter()}return r};
 const _onPick=onPick;PH.orig=_onPick;onPick=function(p){if(!PH.on)return _onPick(p);phPick(p)}}
function phPick(p){if(!G||!UI.started)return;if(PH.cur&&PH.cur.block&&PH.cur.kind!=='coach'&&PH.cur.kind!=='mph'&&PH.cur.kind!=='sunk'&&PH.cur.kind!=='q')return;
  const d=sideToAct(),mine=!UI.busy&&!G.over&&d>=0&&G.seats[d].human&&!mustPass(d)&&!(NET.on&&d!==NET.mySeat);
  let sq=null,ship=null;if(p){if(p.kind==='ship')ship=+String(p.id).slice(1);else if(p.kind==='square'||p.kind==='start')sq=[p.c,p.r]}
  if(mine&&G.q){if(sq||ship!=null)PH.orig(p);return}
  if(mine&&G.phase==='setup'){const S=ship!=null?G.ships[ship]:null;if(!sq&&S&&S.x!=null)sq=[S.x,S.y];
    if(sq){let n=0;try{n=startInfo(d).filter(o=>o.m.x===sq[0]&&o.m.y===sq[1]).length}catch(e){}
      if(n){sfx('click');phOpen('start',{x:sq[0],y:sq[1]});return}
      if(!(G.mons.some(x=>x.x===sq[0]&&x.y===sq[1])||G.gates.some(g=>g.x===sq[0]&&g.y===sq[1]))){PH.toast='Tap a square on the edge of the board to pick a start mark.';phClose();return}}
    else{phClose();return}}
  if(mine&&G.phase==='play'&&G.step==='act'&&UI.fronts){let s=null;if(ship!=null&&UI.fronts.includes(ship))s=ship;else if(sq)s=UI.fronts.find(i=>G.ships[i].x===sq[0]&&G.ships[i].y===sq[1]);
    if(s!=null){if(UI.sel)UI.sel.s=s;sfx('click');PH.pop='tiles';PH.pd=null;PH.toast='';render();return}}
  // anything else: what is that piece?
  let pd=null;
  if(ship!=null&&G.ships[ship])pd={k:'ship',i:ship};
  else if(sq){const m=G.mons.find(x=>x.x===sq[0]&&x.y===sq[1]);const sh=G.ships.find(x=>x.alive&&x.x===sq[0]&&x.y===sq[1]);if(m)pd={k:m.k==='L'?'mon':'mael',x:sq[0],y:sq[1]};else if(sh)pd={k:'ship',i:sh.i};
    else if(G.gates.some(g=>g.x===sq[0]&&g.y===sq[1]))pd={k:'gate',x:sq[0],y:sq[1]};
    else if(G.wave&&G.wave.x===sq[0]&&G.wave.y===sq[1])pd={k:'wave'}}
  if(pd&&phInfoData(pd)){sfx('click');phOpen('info',pd)}else if(PH.pop)phClose()}
// taps inside the strip / pop-up / cards
document.addEventListener('click',e=>{if(!PH.on)return;
  if(Date.now()-PH.swipeT<350&&e.target.closest&&e.target.closest('#ppop')){e.stopPropagation();e.preventDefault();return}
  const t=e.target.closest&&e.target.closest('[data-ph]');
  if(t){const a=t.dataset.ph;e.stopPropagation();
    if(a==='pclose')phClose();
    else if(a==='pcard'){if(UI.sel&&!UI.busy){UI.sel.t=+t.dataset.t;sfx('tile_rotate');render()}}
    else if(a==='zoom'){PH.zoom=!PH.zoom;PH.zk='?';sfx('click');phAfter()}
    else if(a==='dismiss'){const k=PH.cur&&PH.cur.kind;if(k==='mph')PH.mphHide=UI.mph;else if(k==='over')PH.ovHide=G.over;sfx('click');phAfter();phStrip()}
    else if(a==='showover'){PH.ovHide=null;phAfter()}
    return}
  // a tap on the board (or anywhere that is not a control) while the tile pop-up is open closes it
  if(PH.pop==='tiles'&&!e.target.closest('#ppop,#ps,#pc,.gx-bar,.gx-drawer,.gx-scrim,#start,#netbox,.gx-dock')){e.stopPropagation();e.preventDefault();phClose()}},true);
document.addEventListener('keydown',e=>{if(!PH.on||e.key!=='Escape'||GX.open)return;if(PH.pop){phClose();e.stopPropagation()}},true);
// swipe inside the tile pop-up turns the selected tile
{let sx=0,sy=0,st=0,down=false;
 document.addEventListener('pointerdown',e=>{if(!PH.on||PH.pop!=='tiles'||!e.target.closest('#ppop'))return;down=true;sx=e.clientX;sy=e.clientY;st=Date.now()});
 document.addEventListener('pointerup',e=>{if(!down)return;down=false;if(!PH.on||PH.pop!=='tiles'||!UI.sel||UI.busy)return;const dx=e.clientX-sx,dy=e.clientY-sy;
   if(Math.abs(dx)>=36&&Math.abs(dx)>Math.abs(dy)*1.5&&Date.now()-st<900){PH.swipeT=Date.now();UI.sel.r=(UI.sel.r+(dx>0?1:3))%4;sfx('tile_rotate');render()}})}
window.addEventListener('resize',()=>{if(!G&&!PH.on&&!phDetect())return;const was=PH.on;phApply();if(PH.on||was){PH.zk='?';PH.strip='';PH.pop_h='';try{if(G&&UI.started)render();else phAfter()}catch(e){}}});
