// PURPOSE: short tactics lessons the first time a feature appears
// FLAG: lessons (?lessons=0)
// TEST: lessons-test.js
/* ---------- LESSONS: tactics taught as MINI STAGES the first time a feature appears (owner, 20-21 Oct 2026: "better tutorials teaching tactics when they
   appear first time ... users can practice"; W63: "lessons must be mini stages, not plain text cards").
   Flag RET.lessons (default ON; ?lessons=0 = the old game: no lesson, no LESSONS button).
   Six lessons, each a short playable mini stage (20-40 s) of one to two phases: weapons (first WEAPONS sheet / Garage WEAPONS tab), merge (first Garage FORGE
   tab), slots (next FORGE / first LOAD tab), ship (first Garage SHIPS tab), counter (first story stage >= 3, where shielded foes start), timing (first story
   stage >= 2 when FLIGHT SCHOOL was not finished). On screen: one short prompt line, a progress ring, a green success / red TRY AGAIN state, SKIP.
   The mini stage is its own little world on its own canvas (shapes only: triangle ship, circle foes, ring shields, bar plates). There is no hull: a hit only
   says TRY AGAIN and restarts the wave. Nothing in it touches the run, Neon, the forge save or the stats: a lesson only opens while no run is live, and the
   only thing it writes is mnr_lessons {id: 1 seen, 2 cleared}. Replay: MENU > LESSONS. Auto-show is off under a test driver unless ?lessons=1.
   Test: nightrun/lessons-test.js. */
if(RET.lessons===undefined)RET.lessons=!/[?&]lessons=0/.test(location.search);
const LS={cur:null,done:null,log:[],raf:0,m:null,get on(){return!!RET.lessons;},auto:!!RET.lessons&&(!navigator.webdriver||/[?&]lessons=1/.test(location.search))};
LS.seen=()=>load('mnr_lessons',{})||{};
LS.mark=(id,v)=>{const s=LS.seen();if((s[id]|0)<v){s[id]=v;save('mnr_lessons',s);}};
/* chip shapes (DOM) */
const lsS=(k,c,z)=>{z=z||26;const h=z/2,sv=b=>`<svg width="${z}" height="${z}" viewBox="0 0 ${z} ${z}" aria-hidden="true">${b}</svg>`;
  if(k==='tri')return sv(`<path d="M${z*.12} ${z*.15}L${z*.9} ${h}L${z*.12} ${z*.85}Z" fill="${c}"/>`);
  if(k==='dia')return sv(`<path d="M${h} ${z*.08}L${z*.92} ${h}L${h} ${z*.92}L${z*.08} ${h}Z" fill="${c}"/>`);
  if(k==='ring')return sv(`<circle cx="${h}" cy="${h}" r="${z*.36}" fill="none" stroke="${c}" stroke-width="3"/>`);
  return sv(`<circle cx="${h}" cy="${h}" r="${z*.3}" fill="${c}"/>`);};
const lsRecipe=(a,b)=>{if(typeof FGR==='undefined')return null;const r=FGR.find(r=>(r[0]===a&&r[1]===b)||(r[0]===b&&r[1]===a));return r?r[3]:null;};
const FOE='#ff5a7a';
/* ----- the sandbox weapons (a simplified copy of each job: spread, pierce, homing, seeds; ships: steady, triplet, heavy pierce) ----- */
const LSW={
 pulse:{n:'PULSE',c:'#ff8ad8',cd:.3,f:(m,s)=>{for(const a of[-.24,0,.24])lsShot(m,s,a,{c:'#ff8ad8'});}},
 laser:{n:'LANCE',c:'#7dffd8',cd:.1,beam:1},
 swarm:{n:'SWARM',c:'#ffb020',cd:.34,f:(m,s)=>lsShot(m,s,0,{c:'#ffb020',hk:1})},
 seedfan:{n:'SEED FAN',c:'#ffe14d',cd:.3,f:(m,s)=>{for(const a of[-.24,0,.24])lsShot(m,s,a,{c:'#ffe14d',seeds:2});}},
 std:{n:'COURIER',c:'#19e3ff',cd:.2,f:(m,s)=>lsShot(m,s,0,{c:'#19e3ff'})},
 tri:{n:'TRIPLET',c:'#ffb020',cd:.45,f:(m,s)=>{for(const d of[-12,0,12])lsShot(m,s,0,{c:'#ffb020',dy:d});}},
 hv:{n:'HEAVY',c:'#ff3d6a',cd:.6,f:(m,s)=>lsShot(m,s,0,{c:'#ff3d6a',d:3,px:1,r:7})}};
function lsShot(m,s,a,o){m.sh.push({x:s.x+14,y:s.y+(o.dy||0),vx:420*Math.cos(a),vy:420*Math.sin(a),d:o.d||1,px:!!o.px,r:o.r||3.5,c:o.c,hk:o.hk||0,seeds:o.seeds||0,hit:[]});}
const lsFoe=(m,o)=>{const f=Object.assign({x:m.w*.7,y:m.h*.5,r:13,hp:2,k:'dot',vx:0,vy:0,t:Math.random()*6,sh:0},o);f.max=f.hp;m.fo.push(f);return f;};
/* damage: a line / plate foe only takes piercing hits, a shield eats every hit until an EMP */
function lsHurt(m,f,d,px){if((f.k==='line'||f.k==='plate')&&!px){m.clink++;m.fx.push({x:f.x-f.r,y:f.y,t:.25,c:'#c9d3e0'});return false;}
  if(f.sh>0){m.block++;f.fl=.15;return false;}
  f.hp-=d;f.fl=.1;if(f.hp<=0&&!f.dead){f.dead=1;m.kills++;m.fx.push({x:f.x,y:f.y,t:.4,c:f.c||FOE,big:1});}return true;}
const lsWall=(m,o)=>{const n=12,id=++m.wid;for(let i=0;i<n;i++)m.eb.push({x:m.w+10,y:m.h*(i+.5)/n,vx:-(o&&o.v||120),r:6,w:id});return id;};
const lsWallX=m=>{let x=1e9;for(const b of m.eb)if(b.w)x=Math.min(x,b.x);return x===1e9?null:x;};
/* ----- the lessons: phases of a mini stage. Each phase: id, say (the one line), chips, want (the right chip), init, tick (calls m.win / m.fail), prog ----- */
const LS_PACK=[[0,0],[0,-24],[0,24],[0,-48],[0,48],[30,-12],[30,12]];   // a tight pack: one lance row only catches one or two of it
const lsWave=m=>{for(const[dx,dy]of LS_PACK)lsFoe(m,{x:m.w+30+dx,y:m.h*.5+dy,r:10,hp:2,vx:-80});};
const LSN=[
 {id:'weapons',n:'WEAPONS',ph:[
   {id:'w-line',say:'Armoured line: pick LANCE to pierce it',chips:['pulse','laser','swarm'],want:'laser',init:m=>{m.wp=['pulse'];for(let i=0;i<4;i++)lsFoe(m,{x:m.w*.58+i*30,y:m.h*.5,k:'line',hp:3,r:12});},
    tick:m=>{if(m.fo.every(f=>f.dead))m.win('LANCE pierces the whole line');else if(m.clink>=6){m.clink=0;m.fail('shots bounce off: they need piercing');}},prog:m=>m.kills/4},
   {id:'w-swarm',say:'Wide swarm: pick PULSE to spread',chips:['pulse','laser','swarm'],want:'pulse',init:m=>{m.esc=0;m.kills=0;lsWave(m);},
    tick:m=>{for(const f of m.fo)if(!f.dead&&f.x<-12){f.dead=1;m.esc++;}
      if(m.kills>=6)m.win('a wide spread covers the swarm');else if(m.esc>=2){m.fail('too many got past: spread wider');m.reset();}},prog:m=>m.kills/6}]},
 {id:'merge',n:'MERGE',ph:[
   {id:'m-forge',say:'Tap two weapons, then FORGE',chips:['pulse','laser','swarm','forge'],fly:0,init:m=>{m.wp=[];m.pick=[];},
    chip:(m,v)=>{if(v==='forge'){if(m.pick.length<2){m.fail('pick two weapons first');return;}const nm=lsRecipe(m.pick[0],m.pick[1]);
        if(nm){m.hy=nm.toUpperCase();m.win(LSW[m.pick[0]].n+' + '+LSW[m.pick[1]].n+' = '+m.hy);}else{m.fail('no recipe for '+LSW[m.pick[0]].n+' + '+LSW[m.pick[1]].n);m.pick=[];}}
      else{const k=m.pick.indexOf(v);if(k>=0)m.pick.splice(k,1);else{if(m.pick.length>=2)m.pick.shift();m.pick.push(v);}}m.chipSync();},
    sel:(m,v)=>m.pick.includes(v),prog:m=>m.pick.length/3},
   {id:'m-fly',say:'Fly your SEED FAN: clear the wave',chips:[],init:m=>{m.wp=['seedfan'];for(let i=0;i<8;i++)lsFoe(m,{x:m.w*(.58+.07*(i%3)),y:m.h*(.12+.1*i),hp:4,vy:30*(i%2?1:-1)});},
    tick:m=>{if(m.fo.every(f=>f.dead))m.win('each hit seeds two seekers');},prog:m=>m.kills/8}]},
 {id:'slots',n:'SLOTS',ph:[
   {id:'s-equip',say:'Tap an item, then the slot it fits',chips:['i:w1','i:w2','i:c','i:p','s:0','s:1','s:2','s:3'],fly:0,init:m=>{m.wp=[];m.sel=null;m.fill=[null,null,null,null];},
    chip:(m,v)=>{const[t,k]=v.split(':');if(t==='i'){if(!m.fill.includes(k))m.sel=k;}
      else{const i=+k,need=['w','w','c','p'][i];if(!m.sel){m.fail('tap an item first');return;}if(m.fill[i]){m.fail('that slot is full');return;}
        if(m.sel[0]!==need){m.fail(['WEAPON','WEAPON','CORE','PASSIVE'][i]+' slot takes a '+(need==='w'?'weapon':need==='c'?'core':'passive')+' only');return;}
        m.fill[i]=m.sel;m.sel=null;if(m.fill.every(Boolean))m.win('2 weapons, a core and a passive');}m.chipSync();},
    sel:(m,v)=>v==='i:'+m.sel||m.fill.includes(v.slice(2))&&v[0]==='i'||(v[0]==='s'&&!!m.fill[+v[2]]),prog:m=>m.fill.filter(Boolean).length/4},
   {id:'s-fly',say:'Test flight: both weapons fire together',chips:[],init:m=>{m.wp=['pulse','laser'];for(let i=0;i<3;i++)lsFoe(m,{x:m.w*.6+i*30,y:m.h*.5,k:'line',hp:4,r:12});
      for(let i=0;i<6;i++)lsFoe(m,{x:m.w*(.78+.06*(i%2)),y:m.h*(.1+.16*i),hp:2,r:10,vy:24*(i%2?1:-1)});},
    tick:m=>{if(m.fo.every(f=>f.dead))m.win('spread for crowds, lance for armour');},prog:m=>m.kills/9}]},
 {id:'ship',n:'SHIPS',ph:[
   {id:'sh-plate',say:'Plated foe: pick the HEAVY ship',chips:['std','tri','hv'],want:'hv',init:m=>{m.wp=['std'];lsFoe(m,{x:m.w*.72,k:'plate',r:22,hp:9,vy:28});},
    tick:m=>{if(m.fo.every(f=>f.dead))m.win('HEAVY\'s piercing blast breaks plates');else if(m.clink>=8){m.clink=0;m.fail('plates stop light shots');}},prog:m=>1-Math.max(0,m.fo[0].hp)/9},
   {id:'sh-swarm',say:'Many small foes: TRIPLET fires three',chips:['std','tri','hv'],want:'tri',init:m=>{m.esc=0;m.kills=0;for(let i=0;i<6;i++)lsFoe(m,{x:m.w+20+i*40,y:m.h*.5+[0,-20,20][i%3],r:9,hp:1,vx:-70});},
    tick:m=>{for(const f of m.fo)if(!f.dead&&f.x<-12){f.dead=1;m.esc++;}if(m.kills>=5)m.win('three shots catch a tight pack');else if(m.esc>=2){m.fail('they slipped past: more shots');m.reset();}},prog:m=>m.kills/5}]},
 {id:'counter',n:'COUNTERS',ph:[
   {id:'c-shield',say:'Shielded foes: tap EMP, then shoot',chips:['emp'],init:m=>{m.wp=['pulse'];for(let i=0;i<4;i++)lsFoe(m,{x:m.w*(.62+.08*(i%2)),y:m.h*(.2+.2*i),sh:1,hp:2,vy:18*(i%2?1:-1)});},
    tick:m=>{if(m.fo.every(f=>f.dead))m.win('EMP strips shields, then anything hits');else if(m.block>=10){m.block=0;m.fail('the shield eats your shots: EMP');}},prog:m=>m.kills/4},
   {id:'c-wall',say:'Bullet wall: EMP when it is close',chips:['emp'],init:m=>{m.wp=[];m.cleared=0;lsWall(m,{v:110});},
    tick:m=>{if(m.cleared>=4&&!m.eb.length)m.win('EMP wipes the bullets near you');else if(!m.eb.length)lsWall(m,{v:110});},
    hit:m=>{m.fail('hit: EMP as it gets close');m.reset();},prog:m=>m.cleared?1:0}]},
 {id:'timing',n:'TIMING',ph:[
   {id:'t-dash',say:'DASH as the ring touches you',chips:['dash'],init:m=>{m.wp=[];m.beat=1;m.n=0;m.lane=1;lsWall(m,{v:130});},
    tick:m=>{if(!m.eb.length){if(m.n>=2)m.win('on the beat, a dash goes through bullets');else lsWall(m,{v:130});}},
    hit:m=>{m.fail('hit: dash on the beat as the wall arrives');m.eb.length=0;},prog:m=>m.n/2}]}];
const LS_CH={pulse:['tri','#ff8ad8','PULSE'],laser:['tri','#7dffd8','LANCE'],swarm:['tri','#ffb020','SWARM'],forge:['dia','#ffe14d','FORGE'],
  std:['tri','#19e3ff','COURIER'],tri:['tri','#ffb020','TRIPLET'],hv:['tri','#ff3d6a','HEAVY'],emp:['ring','#3dffb0','EMP'],dash:['tri','#ffe14d','DASH'],
  'i:w1':['tri','#ff8ad8','PULSE'],'i:w2':['tri','#7dffd8','LANCE'],'i:c':['dia','#3dffb0','CORE'],'i:p':['dot','#ffe14d','PASSIVE'],
  's:0':['tri','#8890a8','WEAPON'],'s:1':['tri','#8890a8','WEAPON'],'s:2':['dia','#8890a8','CORE'],'s:3':['dot','#8890a8','PASSIVE']};
/* older lesson format (cards + pr:{type:'pick',rounds}), still pushed by other parts (classes.js: 'pilot'): each round becomes a one-tap pick phase over a
   small drifting scene; the cards are dropped (one line of text at a time). lsRow / lsN / LS_OPT / LS_OC stay so those parts keep loading. */
const lsRow=()=>'',lsN=()=>'',LS_OPT={},LS_OC={};
function lsLegacy(L){const rs=(L.pr&&L.pr.rounds)||[];return rs.map((R,i)=>{for(const o of R.opts)if(!LS_CH[o])LS_CH[o]=[(LS_OPT[o]||[])[0]||'dot',LS_OC[o]||'#19e3ff',String((LS_OPT[o]||[])[1]||o).toUpperCase()];
  return{id:L.id+'-'+(i+1),say:String(R.q).slice(0,60),chips:R.opts.slice(),want:R.ok,fly:0,
    init:m=>{m.wp=[];for(let k=0;k<4;k++)lsFoe(m,{x:m.w*(.55+.1*k),y:m.h*(.25+.17*k),hp:1,r:10,vy:26*(k%2?1:-1)});},
    chip:(m,v)=>{if(v===R.ok)m.win(String(R.why||'').replace(/\.$/,''));else m.fail('think about what you face');},sel:()=>false};});}
/* ----- the overlay ----- */
{const st=document.createElement('style');st.textContent=`#lsC{position:fixed;inset:0;z-index:9300;display:flex;align-items:center;justify-content:center;background:rgba(5,3,12,.86);padding:16px;box-sizing:border-box}
#lsC[hidden]{display:none}#lsC .lc{width:min(440px,100%);height:min(640px,100%);background:#0d0820;border:2px solid var(--cyan);border-radius:14px;padding:12px;box-sizing:border-box;color:var(--ink);font:600 15px var(--display);text-align:center;display:flex;flex-direction:column;gap:8px}
#lsC .lc.ls{height:auto;max-height:100%;overflow:auto;padding:16px;gap:12px}
#lsC .lk{font-size:13px;color:#c9c2e0;letter-spacing:.12em}#lsC .ln{min-height:20px;font-size:15px;line-height:1.3}#lsC .ln.ok{color:#3dffb0}#lsC .ln.bad{color:#ff8a9a}
#lsC h3{margin:0;font:700 19px var(--display);letter-spacing:.06em;color:var(--cyan)}#lsC p{margin:0}
#lsC .cw{flex:1;min-height:150px;position:relative;border-radius:10px;overflow:hidden;background:#07041a;touch-action:none}#lsC canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
#lsC .op{display:grid;grid-template-columns:repeat(auto-fit,minmax(78px,1fr));gap:6px}#lsC .op:empty{display:none}
#lsC .lo{min-height:48px;background:#1b1236;border:2px solid #4a3c7a;border-radius:10px;color:var(--ink);font:700 13px var(--display);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;padding:4px;cursor:pointer}
#lsC .lo.sel{border-color:#ffe14d;box-shadow:0 0 0 2px #ffe14d66}#lsC .lo small{font-size:13px;color:#c9c2e0}
#lsC .rw{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}#lsC .rw button{min-height:48px;min-width:110px}`;document.head.appendChild(st);}
const lsC=document.createElement('div');lsC.id='lsC';lsC.hidden=true;lsC.setAttribute('role','dialog');lsC.setAttribute('aria-label','Lesson');document.body.appendChild(lsC);
for(const ev of['touchstart','touchmove','touchend','pointerdown','pointermove','mousedown'])lsC.addEventListener(ev,e=>e.stopPropagation(),{passive:true});
const LSK={};
addEventListener('keydown',e=>{if(lsC.hidden)return;const m=LS.m;
  if(e.code==='Escape'){const b=$('lsSkip')||$('lsBack');if(b)b.click();}
  else if(m&&/^(Arrow|Key[WASD]$)/.test(e.code))LSK[e.code]=1;
  else if(m&&(e.code==='Space'||e.code==='ShiftLeft'||e.code==='ShiftRight')&&m.P.chips.includes('dash'))lsChip('dash');
  else if(m&&(e.code==='KeyX'||e.code==='KeyE')&&m.P.chips.includes('emp'))lsChip('emp');
  else if(e.code==='Enter'||e.code==='Space'){const b=document.activeElement&&lsC.contains(document.activeElement)?document.activeElement:lsC.querySelector('.rw .go:not(.dim)');if(b)b.click();}
  else return;e.stopImmediatePropagation();e.preventDefault();},true);
addEventListener('keyup',e=>{if(LSK[e.code]){delete LSK[e.code];e.stopImmediatePropagation();}},true);
function lsBtn(row,id,label,cls,fn){const b=document.createElement('button');b.type='button';b.className=cls||'go';b.id=id;b.innerHTML=label;
  b.addEventListener('click',e=>{e.stopPropagation();fn(b);});row.appendChild(b);return b;}
const lsLine=(t,c)=>{const l=$('lsLine');if(l){l.textContent=t;l.className='ln'+(c?' '+c:'');}};
/* ----- the mini stage ----- */
function lsShow(id,done){const L=LSN.find(l=>l.id===id);if(L&&!L.ph)L.ph=lsLegacy(L);if(!L||!LS.on||!L.ph.length){if(done)done();return false;}
  cancelAnimationFrame(LS.raf);LS.cur=L;LS.done=done||null;LS.mark(id,1);LS.log.push({id,ev:'show'});
  lsC.innerHTML=`<div class="lc"><div class="lk" id="lsHead"></div><div class="ln" id="lsLine"></div><div class="cw" id="lsCw"><canvas id="lsCv"></canvas></div><div class="op" id="lsChips"></div><div class="rw"></div></div>`;
  lsC.hidden=false;lsBtn(lsC.querySelector('.rw'),'lsSkip','SKIP','go dim',()=>lsEnd(false));
  const cw=$('lsCw'),aim=e=>{const r=cw.getBoundingClientRect(),m=LS.m;if(!m)return;m.s.tx=Math.min(m.w*.45,e.clientX-r.left);m.s.ty=e.clientY-r.top;};
  cw.addEventListener('pointerdown',e=>{aim(e);try{cw.setPointerCapture(e.pointerId);}catch(_){}});cw.addEventListener('pointermove',e=>{if(e.buttons||e.pointerType==='touch')aim(e);});
  const m=LS.m={L,pi:-1,w:300,h:300,t:0,s:{x:60,y:150,tx:60,ty:150,inv:0,dx:0},fo:[],sh:[],eb:[],fx:[],wp:[],cd:{},clink:0,block:0,kills:0,fails:0,state:'',okT:0,flash:0,wid:0,emp:0,empR:0,
    log:[],chipSync:()=>lsChipSync()};
  m.win=why=>{if(m.state)return;m.state='ok';m.okT=1.1;lsLine('WELL DONE: '+why,'ok');m.log.push({ph:m.P.id,ev:'ok',fails:m.pf});LS.log.push({id:L.id,ev:'ok',ph:m.P.id});};
  m.fail=why=>{if(m.state)return;m.fails++;m.pf++;m.flash=.5;lsLine('TRY AGAIN: '+why,'bad');m.sayT=2.2;LS.log.push({id:L.id,ev:'miss',ph:m.P.id});};
  m.reset=()=>{m.fo=[];m.sh=[];m.eb=[];m.kills=0;m.clink=0;m.block=0;m.P.init(m);};
  lsSize();lsPhase(0);let last=performance.now();
  const loop=now=>{if(LS.m!==m)return;const dt=Math.min(.05,(now-last)/1000);last=now;lsSize();lsTick(m,dt);lsDraw(m);LS.raf=requestAnimationFrame(loop);};LS.raf=requestAnimationFrame(loop);
  return true;}
function lsSize(){const m=LS.m,cv=$('lsCv'),cw=$('lsCw');if(!m||!cv)return;const w=cw.clientWidth||300,h=cw.clientHeight||300,d=Math.min(2,devicePixelRatio||1);
  if(cv.width!==Math.round(w*d)||cv.height!==Math.round(h*d)){cv.width=Math.round(w*d);cv.height=Math.round(h*d);}
  if(m.w!==w||m.h!==h){const fx=w/m.w,fy=h/m.h;for(const o of[m.s,...m.fo,...m.eb]){o.x*=fx;o.y*=fy;}m.s.tx*=fx;m.s.ty*=fy;m.w=w;m.h=h;}m.dpr=d;}
function lsPhase(i){const m=LS.m,L=m.L;m.pi=i;m.P=L.ph[i];m.state='';m.pf=0;m.t=0;m.fo=[];m.sh=[];m.eb=[];m.kills=0;m.clink=0;m.block=0;m.beat=0;m.lane=0;m.emp=1;m.empR=0;
  m.s.x=m.s.tx=m.w*.16;m.s.y=m.s.ty=m.h*.5;$('lsHead').textContent=L.n+' · '+(i+1)+'/'+L.ph.length;lsLine(m.P.say);m.P.init(m);
  const op=$('lsChips');op.innerHTML='';for(const v of m.P.chips){const c=LS_CH[v]||['tri','#fff',v];lsBtn(op,'lsC_'+v.replace(':','_'),lsS(c[0],c[1],22)+'<span>'+c[2]+'</span>','lo',()=>lsChip(v)).dataset.v=v;}lsChipSync();}
function lsChipSync(){const m=LS.m;if(!m)return;for(const b of lsC.querySelectorAll('#lsChips .lo')){const v=b.dataset.v;
  b.classList.toggle('sel',m.P.sel?!!m.P.sel(m,v):m.wp.includes(v));}}
function lsChip(v){const m=LS.m;if(!m||m.state)return;
  if(m.P.chip){m.P.chip(m,v);return;}
  if(v==='emp'){if(m.emp<=0){m.fail('EMP is recharging');return;}m.emp=0;m.empR=1.6;m.fx.push({x:m.s.x,y:m.s.y,t:.5,ring:1,c:'#3dffb0'});
    for(const f of m.fo)f.sh=0;const n0=m.eb.length;m.eb=m.eb.filter(b=>Math.abs(b.x-m.s.x)>150);m.cleared+=n0-m.eb.length;
    if(m.P.id==='c-wall'&&n0&&n0===m.eb.length)m.fail('too early: let it come closer');return;}
  if(v==='dash'){if(m.s.dash>0)return;const ph=lsBeat(m);m.s.dash=.25;
    if(ph>.82||ph<.08){m.s.inv=.55;m.fx.push({x:m.s.x,y:m.s.y,t:.4,ring:1,c:'#ffe14d'});const n0=m.eb.length;m.eb=m.eb.filter(b=>!(b.x>m.s.x-10&&b.x<m.s.x+140&&Math.abs(b.y-m.s.y)<46));
      if(n0>m.eb.length){m.n++;m.wallOk=1;lsLine('ON BEAT: '+m.n+'/2','ok');}else lsLine('On beat, but no wall in the lane yet');}
    else m.fail(ph<.5?'too late: wait for the ring':'too early: let the ring close');return;}
  m.wp=[v];lsChipSync();}
const lsBeat=m=>(m.t%1);
function lsTick(m,dt){m.t+=dt;const s=m.s;
  if(m.state==='ok'){m.okT-=dt;if(m.okT<=0){if(m.pi<m.L.ph.length-1)lsPhase(m.pi+1);else lsClear();}}
  if(m.sayT>0){m.sayT-=dt;if(m.sayT<=0&&!m.state)lsLine(m.P.say);}
  if(m.flash>0)m.flash-=dt;if(m.empR>0){m.empR-=dt;if(m.empR<=0)m.emp=1;}if(s.inv>0)s.inv-=dt;if(s.dash>0)s.dash-=dt;
  const kx=(LSK.ArrowRight||LSK.KeyD?1:0)-(LSK.ArrowLeft||LSK.KeyA?1:0),ky=(LSK.ArrowDown||LSK.KeyS?1:0)-(LSK.ArrowUp||LSK.KeyW?1:0);
  if(kx||ky){s.tx=s.x+kx*40;s.ty=s.y+ky*40;}
  s.tx=Math.max(14,Math.min(m.w*.45,s.tx));s.ty=Math.max(14,Math.min(m.h-14,s.ty));
  const dx=s.tx-s.x,dy=s.ty-s.y,dd=Math.hypot(dx,dy),sp=360*dt;if(dd>sp){s.x+=dx/dd*sp;s.y+=dy/dd*sp;}else{s.x=s.tx;s.y=s.ty;}
  if(m.P.fly!==0&&!m.state)for(const id of m.wp){const W=LSW[id];if(!W)continue;m.cd[id]=(m.cd[id]||0)-dt;if(m.cd[id]>0)continue;m.cd[id]=W.cd;
    if(W.beam){for(const f of m.fo)if(!f.dead&&f.x>s.x&&Math.abs(f.y-s.y)<f.r+5)lsHurt(m,f,.5,1);}else W.f(m,s);}
  for(const f of m.fo){if(f.dead)continue;f.t+=dt;f.x+=f.vx*dt;f.y+=f.vy*dt;if(f.vy&&(f.y<f.r+6||f.y>m.h-f.r-6))f.vy=-f.vy;if(f.fl>0)f.fl-=dt;}
  for(const b of m.sh){if(b.hk){const t=m.fo.filter(f=>!f.dead).sort((a,c)=>Math.hypot(a.x-b.x,a.y-b.y)-Math.hypot(c.x-b.x,c.y-b.y))[0];
      if(t){const a=Math.atan2(t.y-b.y,t.x-b.x),v=Math.hypot(b.vx,b.vy),c=Math.atan2(b.vy,b.vx),na=c+Math.max(-4*dt*b.hk,Math.min(4*dt*b.hk,((a-c+9.42)%6.28)-3.14));b.vx=v*Math.cos(na);b.vy=v*Math.sin(na);}}
    b.x+=b.vx*dt;b.y+=b.vy*dt;
    for(const f of m.fo){if(f.dead||b.hit.includes(f)||Math.hypot(f.x-b.x,f.y-b.y)>f.r+b.r)continue;b.hit.push(f);const ok=lsHurt(m,f,b.d,b.px);
      if(ok&&b.seeds)for(let k=0;k<b.seeds;k++)m.sh.push({x:b.x,y:b.y,vx:200,vy:k?-200:200,d:1,px:false,r:2.5,c:'#ffe14d',hk:1.5,seeds:0,hit:[f]});
      if(!b.px||!ok){b.gone=1;break;}}}
  m.sh=m.sh.filter(b=>!b.gone&&b.x>-20&&b.x<m.w+20&&b.y>-20&&b.y<m.h+20);
  for(const b of m.eb){b.x+=b.vx*dt;if(Math.hypot(b.x-s.x,b.y-s.y)<b.r+9){if(s.inv>0){b.gone=1;continue;}b.gone=1;m.hitNow=1;}}
  m.eb=m.eb.filter(b=>!b.gone&&b.x>-20);
  if(m.hitNow){m.hitNow=0;if(!m.state){if(m.P.hit)m.P.hit(m);else m.fail('hit');}m.eb=m.eb.filter(b=>!b.w||b.x>s.x+40);}
  for(const f of m.fx)f.t-=dt;m.fx=m.fx.filter(f=>f.t>0);
  if(!m.state&&m.P.tick)m.P.tick(m,dt);}
function lsDraw(m){const cv=$('lsCv');if(!cv)return;const c=cv.getContext('2d'),s=m.s;c.setTransform(m.dpr,0,0,m.dpr,0,0);c.clearRect(0,0,m.w,m.h);
  c.strokeStyle='#1c1440';c.lineWidth=1;for(let x=(-m.t*40)%40+40;x<m.w;x+=40){c.beginPath();c.moveTo(x,0);c.lineTo(x,m.h);c.stroke();}
  if(m.lane){c.fillStyle='rgba(255,225,77,.10)';c.fillRect(s.x,s.y-46,m.w-s.x,92);c.setLineDash([8,8]);c.strokeStyle='#ffe14d88';c.beginPath();c.moveTo(s.x,s.y-46);c.lineTo(m.w,s.y-46);c.moveTo(s.x,s.y+46);c.lineTo(m.w,s.y+46);c.stroke();c.setLineDash([]);}
  if(m.P.id==='m-forge'||m.P.id==='s-equip'){const n=m.P.id==='m-forge'?2:4,gap=m.w/(n+1);c.lineWidth=3;
    for(let i=0;i<n;i++){const x=gap*(i+1),y=m.h*.5,v=m.P.id==='m-forge'?m.pick[i]:m.fill[i];c.strokeStyle=v?'#ffe14d':'#4a3c7a';c.setLineDash(v?[]:[6,6]);c.beginPath();c.arc(x,y,26,0,7);c.stroke();c.setLineDash([]);
      if(v){const col=m.P.id==='m-forge'?LSW[v].c:LS_CH['i:'+v][1];c.fillStyle=col;c.beginPath();c.moveTo(x-12,y-12);c.lineTo(x+14,y);c.lineTo(x-12,y+12);c.closePath();c.fill();}}
    if(m.hy){c.fillStyle='#ffe14d';c.beginPath();c.moveTo(m.w*.5-18,m.h*.5-18);c.lineTo(m.w*.5+22,m.h*.5);c.lineTo(m.w*.5-18,m.h*.5+18);c.closePath();c.fill();}}
  for(const f of m.fo){if(f.dead)continue;c.globalAlpha=1;c.fillStyle=f.fl>0?'#ffffff':(f.c||FOE);c.beginPath();c.arc(f.x,f.y,f.r,0,7);c.fill();
    if(f.k==='line'||f.k==='plate'){c.fillStyle='#c9d3e0';c.fillRect(f.x-f.r-6,f.y-f.r,5,f.r*2);}
    if(f.sh>0){c.strokeStyle='#4ad1ff';c.lineWidth=3;c.beginPath();c.arc(f.x,f.y,f.r+6,0,7);c.stroke();}
    if(f.max>1){c.fillStyle='#ffffff55';c.fillRect(f.x-f.r,f.y+f.r+4,f.r*2,3);c.fillStyle='#3dffb0';c.fillRect(f.x-f.r,f.y+f.r+4,f.r*2*Math.max(0,f.hp)/f.max,3);}}
  for(const b of m.sh){c.fillStyle=b.c;c.beginPath();c.arc(b.x,b.y,b.r,0,7);c.fill();}
  if(m.wp.includes('laser')&&m.P.fly!==0&&!m.state){c.strokeStyle='#7dffd8';c.globalAlpha=.8;c.lineWidth=3;c.beginPath();c.moveTo(s.x+14,s.y);c.lineTo(m.w,s.y);c.stroke();c.globalAlpha=1;}
  c.fillStyle='#ff5a7a';for(const b of m.eb){c.beginPath();c.arc(b.x,b.y,b.r,0,7);c.fill();}
  if(m.P.fly!==0){if(m.beat){const ph=lsBeat(m),r=12+44*(1-ph);c.strokeStyle='#ffe14d';c.globalAlpha=.4+.6*ph;c.lineWidth=3;c.beginPath();c.arc(s.x,s.y,r,0,7);c.stroke();c.globalAlpha=1;}
    c.fillStyle=s.inv>0?'#ffe14d':'#19e3ff';const ox=s.dash>0?18*Math.sin(s.dash/.25*3.14):0;c.beginPath();c.moveTo(s.x-12+ox,s.y-11);c.lineTo(s.x+14+ox,s.y);c.lineTo(s.x-12+ox,s.y+11);c.closePath();c.fill();}
  for(const f of m.fx){c.strokeStyle=f.c;c.globalAlpha=Math.min(1,f.t*3);c.lineWidth=f.ring?4:2;c.beginPath();c.arc(f.x,f.y,f.ring?150*(1-f.t/.5)+10:f.big?24*(1-f.t/.4)+6:8,0,7);c.stroke();}c.globalAlpha=1;
  const pr=Math.max(0,Math.min(1,m.state==='ok'?1:m.P.prog?m.P.prog(m):0)),px=m.w-24,py=24;c.lineWidth=5;c.strokeStyle='#2a2050';c.beginPath();c.arc(px,py,14,0,7);c.stroke();
  c.strokeStyle=m.state==='ok'?'#3dffb0':'#19e3ff';c.beginPath();c.arc(px,py,14,-1.571,-1.571+6.283*pr);c.stroke();
  if(m.state==='ok'){c.strokeStyle='#3dffb0';c.globalAlpha=Math.min(1,m.okT);c.lineWidth=6;c.strokeRect(3,3,m.w-6,m.h-6);c.globalAlpha=1;}
  if(m.flash>0){c.fillStyle='rgba(255,48,80,'+(m.flash*.5).toFixed(2)+')';c.fillRect(0,0,m.w,m.h);}}
function lsClear(){const m=LS.m;if(!m)return;m.state='clear';LS.mark(m.L.id,2);LS.log.push({id:m.L.id,ev:'done'});lsLine('LESSON CLEAR','ok');
  $('lsChips').innerHTML='';const rw=lsC.querySelector('.rw');rw.innerHTML='';lsBtn(rw,'lsDone','GOT IT','go',()=>lsEnd(true)).focus();}
function lsEnd(ok){cancelAnimationFrame(LS.raf);const L=LS.cur;if(L&&!ok)LS.log.push({id:L.id,ev:'skip'});
  for(const k in LSK)delete LSK[k];LS.cur=null;LS.m=null;lsC.hidden=true;lsC.innerHTML='';const d=LS.done;LS.done=null;if(d)d();}
/* ----- the list (MENU > LESSONS) ----- */
function lsList(){cancelAnimationFrame(LS.raf);LS.m=null;LS.cur=null;const sv=LS.seen();
  lsC.innerHTML='<div class="lc ls"><div class="lk">HELP</div><h3>LESSONS</h3><p>Replay any mini stage.</p><div class="op" id="lsL"></div><div class="rw"></div></div>';lsC.hidden=false;
  for(const L of LSN)lsBtn($('lsL'),'lsL_'+L.id,'<span>'+L.n+'</span><small>'+(sv[L.id]===2?'cleared':sv[L.id]?'seen':'new')+'</small>','lo',()=>lsShow(L.id,lsList));
  lsBtn(lsC.querySelector('.rw'),'lsBack','BACK','go',()=>{lsC.hidden=true;lsC.innerHTML='';}).focus();}
/* ----- triggers: first time each feature appears, never while a run is live ----- */
LS.want=id=>LS.auto&&!running&&lsC.hidden&&!(LS.seen()[id]);
LS.tryShow=(id,done)=>{if(!LS.want(id))return false;return lsShow(id,done);};
if(LS.on){
  {const s0=WP.show;WP.show=function(mode){const r=s0.apply(this,arguments);LS.tryShow('weapons');return r;};}
  const gaChk=()=>{if(garageEl.hidden)return;const t=GA.tab;
    if(t==='weapons')LS.tryShow('weapons');else if(t==='ships')LS.tryShow('ship');else if(t==='load')LS.tryShow('slots');
    else if(t==='forge'){if(!LS.tryShow('merge'))LS.tryShow('slots');}};
  garageEl.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('.tabs button');if(b)setTimeout(gaChk,0);});
  {const o0=openGarage;openGarage=function(){const r=o0.apply(this,arguments);setTimeout(gaChk,0);return r;};}
  {const ss=startStory;startStory=function(n){if(running)return ss.apply(this,arguments);const a=arguments,go=()=>{if(!running)ss.apply(this,a);};
    if(n>=3&&LS.tryShow('counter',go))return;
    if(n>=2&&load('mnr_tut',0)!==2&&window.TIM&&TIM.on&&LS.tryShow('timing',go))return;
    return ss.apply(this,a);};}
  setTimeout(function add(){const g=document.querySelector('#mnMore .mg');if(!g){if((add.n=(add.n|0)+1)<40)setTimeout(add,50);return;}
    const b=document.createElement('button');b.type='button';b.className='go dim';b.id='lsBtn';b.textContent='LESSONS';b.addEventListener('click',()=>{if(!running)lsList();});
    const t=$('tutBtn');if(t&&t.parentNode===g)t.after(b);else g.appendChild(b);},0);}
window.__lessons={get ids(){return LSN.map(l=>l.id);},get phases(){return Object.fromEntries(LSN.map(l=>[l.id,(l.ph||(l.ph=lsLegacy(l))).map(p=>p.id)]));},seen:()=>LS.seen(),show:(id,d)=>lsShow(id,d),list:()=>lsList(),
  get open(){return!lsC.hidden},get id(){return LS.cur?LS.cur.id:null},get log(){return LS.log},get auto(){return LS.auto},get on(){return LS.on},
  get ms(){const m=LS.m;if(!m)return null;return{ph:m.P.id,want:m.P.want||null,state:m.state,fails:m.pf,wp:m.wp.slice(),w:m.w,h:m.h,s:{x:m.s.x,y:m.s.y},emp:m.emp,
    foes:m.fo.filter(f=>!f.dead).map(f=>({x:f.x,y:f.y,k:f.k,sh:f.sh})),wall:lsWallX(m),beat:lsBeat(m),pick:(m.pick||[]).slice(),fill:(m.fill||[]).slice()};},
  steer:(x,y)=>{const m=LS.m;if(m){m.s.tx=x;m.s.ty=y;}},
  start:n=>startStory(n),quit:()=>{if(running)quitToTitle();},get running(){return running}};
