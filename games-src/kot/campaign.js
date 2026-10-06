/* ===== Story mode: wires the shared story kit (GXC) to Crown City Smash. Presentation + setup only; the rules never change. ===== */
var CAMPSAVE=null;
function campOn(){return !!(UI.camp&&typeof GXC!=='undefined'&&GXC.active())}
function campLine(){try{if(typeof GXC==='undefined'||!window.CAMPAIGN)return '';const p=GXC.progress(),ch=window.CAMPAIGN.chapters,n=ch.filter(c=>p.ch[c.id]&&p.ch[c.id].beaten).length;return n?n+' of '+ch.length+' chapters done':'Ten chapters, three bosses'}catch(e){return ''}}
function campStartBtn(){if(typeof GXC==='undefined'||!window.CAMPAIGN)return '';return `<button class="btn camp" data-camp="open">📖 Story mode<small>${esc(campLine())}</small></button>`}
function campMe(){return G?G.pl.find(p=>p.human):null}
function campMyIdx(){const m=campMe();return m?m.i:0}
/* called inside newGame, after the table is built and before the first turn */
function campSetup(){const d=UI.camp;if(!d||!G||G.mode!=='solo')return;const rv=d.setup.rival;
  let boss=G.pl.find(p=>p.m===rv&&!p.human);
  if(!boss){const ai=G.pl.filter(p=>!p.human);boss=ai[rnd(ai.length)];boss.m=rv;boss.edeck=shuffle(evoDeckOf(rv))}
  boss.lvl=d.opponent.aiLevel;if(d.setup.rivalHp)boss.hp=d.setup.rivalHp;/* a gentler rival for the first chapters */
  {const me=G.pl.find(p=>p.human);if(me){if(d.setup.youVp)me.vp=d.setup.youVp;if(d.setup.youEn)me.en=d.setup.youEn}}G.pl.forEach(p=>{if(!p.human)p.lvl=d.opponent.aiLevel});
  G.bossSeat=boss.i;G.camp=d.id;const t=d.twist;G.twist=t?{id:t.id,param:t.param}:null;
  if(t){if(t.id==='boss-energy')boss.en=t.param;else if(t.id==='boss-stars')boss.vp=t.param;else if(t.id==='boss-in-city')G.city=boss.i;
    else if(t.id==='extra-brainjack'&&G.xp!=='base')boss.mb+=t.param;
    else if(t.id==='boss-card'){const k=G.deck.findIndex(c=>base(c)===t.param);if(k>=0){boss.cards.push(G.deck.splice(k,1)[0]);refill()}}}
  lg(-1,`Story: ${d.title}. ${d.opponent.name} is the rival.${t?' '+t.text:''}`)}
{const _ng=newGame;newGame=function(){if(!UI.campNext)UI.camp=null;UI.campNext=false;return _ng.apply(this,arguments)}}
function campStart(def){const s=def.setup||{},sv={n:UI.n,mon:UI.mon,xp:UI.xp,evo:UI.evo,ex:UI.ex,lvl:UI.lvl};
  if(!CAMPSAVE)CAMPSAVE={hints:UI.hints};
  const xp=s.xp||'base',pool=MONS.map((m,k)=>k).filter(k=>xp!=='base'||k<6);
  let mon=sv.mon;if(!pool.includes(mon)||mon===s.rival)mon=pool.find(k=>k!==s.rival);
  UI.n=s.n||2;UI.mon=mon;UI.xp=xp;UI.evo=!!s.evo;UI.ex=Object.assign({},s.ex||{});UI.lvl=def.opponent.aiLevel;UI.hints=!!def.hints;
  UI.camp=def;UI.campNext=true;NET.on=false;
  UI.firstGame=false;UI.intro=true;UI.adv=false;UI.coach=-1;UI.freeze=false;UI.tour=false;UI.tipSeen={};UI.info=false;UI.stats=false;UI.hadTurn=false;UI.myTurns=0;
  if(GX.open)GX.close();
  try{newGame('solo',s.n||2,mon)}finally{Object.assign(UI,sv)}
  UI.camp=def;try{render()}catch(e){}}
function campMetrics(g){const me=g.pl.find(p=>p.human)||g.pl[0],oth=g.pl.filter(p=>p!==me),won=g.winner==='P'+(me.i+1),st=me.stats||{};
  const city=st.city||0,cards=st.cards||0;
  return {won,score:me.vp,margin:me.vp-Math.max(0,...oth.map(p=>p.vp)),rounds:g.turn,hearts:Math.max(0,me.hp),kos:oth.filter(p=>!p.alive).length,city,cards,cityWin:won?city:0,cardsWin:won?cards:0}}
function campIsWon(g,def){const m=campMetrics(g);if(!m.won)return false;const gl=def.goal||{};
  if(def.id==='c2')return m.city>=2;if(def.id==='c3')return m.cards>=2;
  if(gl.type==='score')return m.score>=gl.value;return true}
function campInit(){if(typeof GXC==='undefined'||!window.CAMPAIGN)return;
  GXC.init({game:'crown',data:window.CAMPAIGN,startChapter:campStart,isWon:campIsWon,metrics:campMetrics,
    onExit:()=>{UI.camp=null;if(CAMPSAVE){UI.hints=CAMPSAVE.hints;CAMPSAVE=null}UI.info=true;UI.choice=null;UI.intro=false;render()},
    scores:g=>g.pl.map(p=>p.vp),seats:g=>g.pl.map(p=>({name:mname(p),me:!!p.human,ai:p.human?undefined:p.lvl}))})}
campInit();
document.addEventListener('click',e=>{const t=e.target.closest('[data-camp]');if(!t)return;e.preventDefault();if(typeof GXC!=='undefined')GXC.open()});
/* chapter over: skip the stats card, hand the result to the story kit once the win has been seen */
{const _r=render;render=function(){const r=_r.apply(this,arguments);
  try{if(G&&G.winner&&UI.camp&&G.camp&&!G.campDone&&typeof GXC!=='undefined'&&GXC.active()){G.campDone=true;clearTimeout(UI.statsT);UI.stats=false;const g=G;setTimeout(()=>{if(G===g)try{GXC.finish(g)}catch(x){console.error(x)}},ANIM?1800:0)}}catch(e){}
  return r}}
