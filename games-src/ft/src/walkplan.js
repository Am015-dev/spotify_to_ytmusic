// ===================== plan the walk in one tap (F3), end-of-game warning, sale note, Shadow star, lesson wrong-tap feedback =====================
// Hooks live in ui.js (onTile, go, uiAct, buildActs, lineText, render). Rules are untouched: a planned path is played as normal legal step moves.
// Rules are untouched: every drop of a planned path is a normal legal 'step' move, played one by one through go().
const F3={plan:null,ends:null,key:'',warned:'',turn:-1,playing:false};
const f3Mine=()=>!!G&&!G.over&&!online()&&G.phase==='turn'&&G.step==='move'&&!!G.move&&!G.q&&!UI.pendDj&&!UI.pendItem&&!G.tut&&!(typeof gdStep==='function'&&gdStep())&&!!me()&&G.cur===me().i&&G.move.hand.length>=2;
const f3Key=()=>G&&G.move?G.turn+'|'+G.round+'|'+G.move.path.join(','):'';
// every ending still reachable from the walk so far: {e,c,n,path} (same counting as the computer's outcomes())
function f3Outs(){const mv=G.move;if(!mv)return[];const hc=handCounts(mv.hand);const res={};const path=mv.path.slice();const visits={};let nodes=0;
  const rec=(at,prev,left)=>{if(nodes++>20000)return;for(const nx of ADJ(at)){if(nx===prev||G.board[nx].block)continue;path.push(nx);
      if(left===1){const had=G.board[nx].m;for(const c in hc){const pre=had.filter(x=>x===c).length;const extra=Math.min(visits[nx]||0,hc[c]-1);if(pre||extra){const n=pre+extra+1;const key=nx+'|'+c;if(!res[key]||res[key].n<n)res[key]={e:nx,c,n,path:path.slice()}}}}
      else{visits[nx]=(visits[nx]||0)+1;rec(nx,at,left-1);visits[nx]--}path.pop()}};
  rec(mv.at,mv.prev,mv.hand.length);return Object.values(res)}
// try the path on a copy: returns the legal step moves, or null
function f3Try(o,wantFirst){const snap=JSON.stringify(G);const sim=UI.sim;UI.sim=1;const steps=[];let ok=false;
  try{let k=0;while(G.move&&k++<40){const vm=validMoves(G.cur).filter(m=>m.act==='step');const nx=o.path[G.move.path.length];const here=vm.filter(m=>m.tile===nx);if(!here.length)break;
      const last=G.move.hand.length===1;const cnt=G.move.hand.filter(x=>x===o.c).length;let m;
      if(last)m=here.find(x=>x.c===o.c);else if(nx===o.e&&cnt>1)m=here.find(x=>x.c===o.c)||here[0];else m=wantFirst?(here.find(x=>x.c===o.c&&cnt>1)||here[0]):(here.find(x=>x.c!==o.c)||here[0]);
      if(!m)break;const r=performMove(m,G.cur);if(!r.success)break;steps.push(m)}
    ok=!G.move&&!!G.act&&G.act.tile===o.e&&G.act.color===o.c;if(ok)o.n=G.act.n}catch(e){ok=false}
  G=JSON.parse(snap);UI.sim=sim;return ok?steps:null}
function f3Ends(){const k=f3Key();if(F3.key===k&&F3.ends)return F3.ends;F3.key=k;F3.ends={};if(!f3Mine())return F3.ends;
  for(const o of f3Outs()){(F3.ends[o.e]=F3.ends[o.e]||[]).push(o)}return F3.ends}
function f3Plan(o){const steps=f3Try(o,false)||f3Try(o,true);if(!steps){toast('That path does not work. Try another tile.');return}
  F3.plan={key:f3Key(),e:o.e,c:o.c,n:o.n,steps,path:steps.map(m=>m.tile)};render()}
function f3Live(){return F3.plan&&F3.plan.key===f3Key()&&f3Mine()?F3.plan:null}
function f3Go(){const pl=f3Live();if(!pl||F3.playing)return;F3.plan=null;F3.playing=true;const q=pl.steps.slice();
  const tick=()=>{if(!q.length||!G||!G.move){F3.playing=false;return}const m=q.shift();if(!validMoves(G.cur).some(x=>same(x,m))){F3.playing=false;render();return}go(m);setTimeout(tick,ANIM?150:0)};tick()}
// draw: numbered drops on the planned path, a soft ring on every tile where the walk can end
function f3Draw(){document.querySelectorAll('#grid .f3num').forEach(x=>x.remove());document.querySelectorAll('#grid .f3end,#grid .f3last').forEach(x=>x.classList.remove('f3end','f3last'));
  if(!f3Mine()||F3.playing)return;const pl=f3Live();
  if(pl){pl.path.forEach((t,k)=>{const el=tileEl(t);if(!el)return;const b=document.createElement('i');b.className='f3num';b.textContent=String(k+1);b.setAttribute('aria-hidden','true');b.setAttribute('data-help','');el.appendChild(b)});const le=tileEl(pl.e);if(le)le.classList.add('f3last');return}
  const ends=f3Ends();const st=new Set(UI.pick||[]);for(const k in ends){if(st.has(+k))continue;const el=tileEl(+k);if(el)el.classList.add('f3end')}}
// ---------- the end is announced a round ahead; a sale says what coins are worth ----------
function f3Warn(){if(!G||G.over||G.tut||G.coach||online())return;const t=document.getElementById('trk');const r=t&&t.querySelector('.trk-r');
  const low=G.pl.reduce((a,p)=>p.camels<a.camels?p:a,G.pl[0]);const k=G.endTrig?'last':low.camels<=3?'soon':'';
  if(r){r.textContent=k==='last'?'⏳ Last round':k==='soon'?'Round '+G.round+' · ends soon':'Round '+G.round;r.classList.toggle('f3end-tag',!!k)}
  if(k&&F3.warned!==k+G.seed){F3.warned=k+G.seed;const who=seatName(low)==='You'?'You have':plName(low.nm)+' has';
    const msg=k==='last'?'Last round! The game ends after this round.':who+' '+low.camels+' camel'+(low.camels===1?'':'s')+' left. The round with the last camel is the final one.';
    const hs=G.pl.find(p=>p.human);try{if(hs)plPop(hs.i,1,msg)}catch(e){}}}
function f3Sold(){if(!G||!G.log||!G.log.length)return;const e=G.log[0];if(!e||e.i===F3.soldN)return;if(/ sells? \d+ different goods for (\d+) coins/.test(e.t)){F3.soldN=e.i;const v=+RegExp.$1;const hp=me();
    if(hp&&G.cur===hp.i)try{plPop(hp.i,1,'Sold for '+v+' coins. Same points: each coin is 1 point at the end.')}catch(x){}}}
// the djinn drawer closes at every new turn
function f3Turn(){if(G&&F3.turn!==G.turn){F3.turn=G.turn;UI.pwOpen=false;F3.plan=null}}
// Shadows with hints on: a star on the best target
function f3Shadow(){document.querySelectorAll('#grid .f3star,#seats .f3star').forEach(x=>x.remove());if(!G||G.over||!hintsOn()||G.step!=='tribe'||!G.act||G.act.color!=='assassin'||!me()||G.cur!==me().i||(typeof gdStep==='function'&&gdStep()))return;
  const tr=validMoves(G.cur).filter(m=>m.act==='tribe'&&m.kill);if(!tr.length)return;const b=bestKill(me(),tr);if(!b||!b.kill)return;const el=b.kill.tile!=null?tileEl(b.kill.tile):document.querySelector('#seats [data-seat="'+b.kill.pl+'"]');
  if(el){const s=document.createElement('i');s.className='f3star';s.textContent='★';s.setAttribute('aria-hidden','true');s.setAttribute('data-help','');el.appendChild(s)}}
// ---------- the lesson: a wrong tap shakes and says what to tap ----------
function f3Label(st){if(st.who!=='me')return 'Next ▶';const m=st.m;
  if(m.act==='bid')return 'the glowing spot on the bid track';if(m.act==='start'||m.act==='step')return 'the glowing tile';if(m.act==='sell')return 'Sell all';if(m.act==='end')return 'End turn';
  if(m.act==='tribe'&&m.kill&&m.kill.pl!=null)return 'the rival panel at the top';if(m.act==='tribe')return 'Collect';if(m.act==='djinn')return 'the glowing djinn power, then the tile';return 'the glowing button'}
document.addEventListener('click',e=>{try{const st=typeof gdStep==='function'?gdStep():null;if(!st||GD.busy)return;const tgt=e.target.closest&&e.target.closest('[data-tile],[data-seat],[data-mk],[data-dj],[data-mv],[data-ui],[data-sell],[data-chz],[data-pw],.sp-b,#coach button');if(!tgt)return;
  const hl=document.querySelector('.gd-hl');if(hl&&(hl===tgt||hl.contains(tgt)||tgt.contains(hl)))return;if(st.who==='note'&&tgt.closest('#coach'))return;if(tgt.closest('#chz')&&UI.chz)return;
  tgt.classList.remove('f3shake');void tgt.offsetWidth;tgt.classList.add('f3shake');setTimeout(()=>tgt.classList.remove('f3shake'),400);
  if(hl){hl.classList.remove('f3pulse');void hl.offsetWidth;hl.classList.add('f3pulse')}setTimeout(()=>{try{toast('Not that one. Tap '+f3Label(st)+'.')}catch(x){}},30)}catch(x){}},true);

// called from ui.js
function f3TileTap(i){if(F3.playing)return true;try{if(f3Mine()&&!UI.chz){const ends=f3Ends()[i];const vm=validMoves(G.cur);const stepHere=vm.some(m=>m.act==='step'&&m.tile===i);
    if(ends&&ends.length&&!stepHere){const by={};for(const x of ends)if(!by[x.c]||by[x.c].n<x.n)by[x.c]=x;const cs=Object.values(by);
      if(cs.length===1){f3Plan(cs[0]);return true}
      pickChoose({tile:i},cs.map(x=>({html:mdotHtml(x.c)+'<small>take '+x.n+'</small>',m:{act:'f3plan',o:x}})));return true}
    if(stepHere)F3.plan=null}}catch(e){console.error(e)}return false}
function f3ActsHtml(){try{const pl=f3Live();if(pl){const nm=pl.n>1?MPLUR[pl.c]:MNAME[pl.c];
    return `<div class="arow f3row"><button class="ab go f3go" data-ui="f3go">✓ Drop along path · take ${pl.n} ${esc(nm)}</button><button class="ab ghost" data-ui="f3x" aria-label="Clear the path">✕</button></div>`}}catch(e){}return ''}
function f3Line(){try{if(F3.playing&&G&&G.move)return 'Dropping along the path…';if(f3Live())return 'Tap ✓ to drop along this path';if(f3Mine())return 'Tap where the walk ends, or drop one'}catch(e){}return ''}
function f3After(){try{f3Draw();f3Warn();f3Sold();f3Shadow()}catch(e){console.error(e)}}
