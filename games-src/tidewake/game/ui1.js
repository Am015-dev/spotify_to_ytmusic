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
