// Story mode ("The Crown Rift Run"): wires the shared campaign kit (gx-campaign.js) to this game. Data: campaign.json.
// A chapter sets squads, expansions, the computer's skill and an optional boss twist; the rules never change.
function campOn(){return !!(UI.camp&&typeof GXC!=='undefined'&&GXC.active())}
function campTwistShip(def){const t=def&&def.twist;return t&&t.pilot?G.ships.find(s=>s.pilot===t.pilot):null}
function campIsWon(g,def){if(!g||g.winner!=='P1')return false;const t=def&&def.twist;if(t&&t.id==='protect-lead'){const l=g.ships.find(s=>s.side===0&&s.pilot===t.pilot);if(l&&!l.alive)return false}return true}
function campMetrics(g){const me=g.ships.filter(s=>s.side===0);const def=UI.camp;
  return {won:campIsWon(g,def),rounds:g.round,lost:me.filter(s=>!s.alive).length,dmgTaken:me.reduce((a,s)=>a+hullDmg(s)+Math.max(0,s.shMax-s.sh),0),rockHits:g.campRock||0,
    score:g.pts?g.pts[0]:0,margin:0}}
function campStart(def){
  try{boot3D()}catch(e){}
  if(typeof NET!=='undefined'&&NET.on)netLeave(true);
  const s=def.setup||{};UI.camp=def;UI.mode='solo';UI.hints=!!def.hints;UI.info=false;UI.stats=false;UI.draft={};UI.pass=null;UI.sel=null;UI.sugCache=null;UI.autoSetup=false;UI.advOpen=false;
  newGame({fac:(s.fac||[0,1]).slice(),players:[{human:true},{human:false,lvl:def.opponent.aiLevel||'normal'}],sizeK:s.sizeK,squads:s.squads?s.squads.map(q=>q.map(e=>({p:e.p,u:e.u.slice()}))):null,ex:Object.assign({},s.ex),seed:s.seed});
  G.camp=def.id;G.campRock=0;
  const t=def.twist,sh=campTwistShip(def);
  if(t&&sh&&sh.side===1){if(t.id==='ace-shields'){sh.sh+=t.param;sh.shMax+=t.param}else if(t.id==='opening-focus')sh.focus=t.param;else if(t.id==='veteran-skill')sh.ps=Math.min(12,sh.ps+t.param)}
  else if(t&&t.id==='opening-focus'&&!t.pilot)G.ships.filter(x=>x.side===1).forEach(x=>{x.focus=t.param});
  resetGuide();camView('tilt');try{const hb=document.getElementById('hintbtn');if(hb)hb.textContent=UI.hints?'💡 On':'💡 Off'}catch(e){}render();
  try{banner('<b>Goal</b> '+esc(def.goal.text),4200)}catch(e){}}
// called by render() once a battle is decided; true = the story result screen takes over from the debrief
function campDone(){if(!campOn()||!G||G.camp!==UI.camp.id)return false;try{GXC.finish(G)}catch(e){console.error(e);return false}return true}
{const _fx=fx;fx=function(k,o){if(k==='rock'&&G&&G.camp&&o){const s=G.ships.find(x=>x.id===o.id);if(s&&s.side===0)G.campRock=(G.campRock||0)+1}return _fx.apply(this,arguments)}}
{const _sg=startGame;startGame=function(){UI.camp=null;return _sg.apply(this,arguments)}}
function campLine(){try{if(typeof GXC==='undefined'||!window.CAMPAIGN)return '';const p=GXC.progress(),ch=window.CAMPAIGN.chapters,n=ch.filter(c=>p.ch[c.id]&&p.ch[c.id].beaten).length;return n?n+' of '+ch.length+' chapters done':'Ten chapters, three bosses'}catch(e){return ''}}
function campInit(){if(typeof GXC==='undefined'||!window.CAMPAIGN)return;
  GXC.init({game:window.CAMPAIGN.game,data:window.CAMPAIGN,startChapter:campStart,isWon:campIsWon,metrics:campMetrics,
    onExit:()=>{UI.camp=null;UI.info=true;render()},
    scores:g=>g.pts||[0,0],seats:g=>[{name:'You',me:true},{name:sideName(1),ai:(g.players[1]&&g.players[1].lvl)||'normal'}]})}
campInit();
