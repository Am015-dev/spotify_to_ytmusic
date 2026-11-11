// ===================== part 2: replay one move, one beat at a time =====================
function say(text,cls,sub){UI.res={text,cls:cls||'',sub:sub||''};renderRes();const l=$('#live');if(l)l.textContent=text}
async function kitWait(p,max){if(!p||!p.then)return;await Promise.race([p,sleep(max||2500)])}
function stepsLen(steps){return steps.length}
async function playEvents(evs,gen){
  UI.skip=!!UI.skipAll;UI.mphLive=true;
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
    if(e.from){UI.arrow={a:sqW(e.from[0],e.from[1]),b:sqW(e.x,e.y)};UI.hiMon=e.id;ovUpdate();await sleep(400)}else if(e.spawn){UI.hiMon=e.id}
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
