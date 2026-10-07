// ---------- story mode: the shared campaign kit (GXC) with this game's chapters (../campaign.json) ----------
function campMe(){return G.pl.findIndex(p=>p.human)}
function campBoss(){return G.pl.findIndex(p=>!p.human)}
function campMetrics(g){const h=g.pl.findIndex(p=>p.human),b=g.pl.findIndex(p=>!p.human),me=g.pl[h],o=g.pl[b],sum=(p,k)=>p.sc[k]+p.end[k];
  const won=!!g.over&&g.over.win.length===1&&g.over.win[0]===h;
  return {won,score:me.score,margin:me.score-o.score,road:sum(me,'road'),town:sum(me,'town'),priory:sum(me,'priory'),field:sum(me,'field'),goods:sum(me,'goods')}}
function campIsWon(g,def){const m=campMetrics(g);if(!m.won)return false;const t=def.stars&&def.stars[0]&&def.stars[0].test;return t?GXC.testStar(t,m):true}
function campTwist(def){const t=def.twist;if(!t||!G)return;const b=campBoss(),h=campMe(),n=t.param||0;
  if(t.id==='head-start'){G.pl[b].score+=n;G.pl[b].sc.head=n;lg(`${G.pl[b].nm} starts with ${n} points from old deeds.`,'big')}
  else if(t.id==='boss-extra-follower'){G.pl[b].sup.f+=n;G.figTotal[b].f+=n;lg(`${G.pl[b].nm} has ${7+n} followers.`,'big')}
  else if(t.id==='lean-purse'){G.pl[h].sup.f-=n;G.figTotal[h].f-=n}
  else if(t.id==='short-valley'){G.stack.splice(-n);G.total-=n}}
function campStart(def){const s=def.setup||{},op=def.opponent||{},opens=def.twist&&def.twist.id==='boss-opens';
  const seats=opens?['ai','human']:['human','ai'],lv=seats.map(x=>x==='ai'?(op.aiLevel||'normal'):'normal');const names=seats.map(x=>x==='ai'?(op.name||'Rival'):undefined);
  UI.camp=def;UI.lastOpts={camp:def,np:2,seats,lv,names,ex:s.ex||{},seed:s.seed};
  beginGame(UI.lastOpts);if(def.hints&&typeof GXH!=='undefined'){GXH.setEnabled(true);GXH.reset()}campTwist(def);refresh();UI.stepKey='';render()}
function campFinish(){try{const c=UI.camp;const p=GXC.finish(G);UI.camp=null;return p}catch(e){console.error(e);UI.camp=null}}
function campOpen(){if(typeof GXC==='undefined'||!window.CAMPAIGN)return;GXC.open()}
(function campInit(){if(typeof GXC==='undefined'||!window.CAMPAIGN)return;
  GXC.init({game:'rampart',data:window.CAMPAIGN,startChapter:campStart,isWon:campIsWon,metrics:campMetrics,
    onExit:()=>{UI.camp=null;showStart()},scores:g=>g.pl.map(p=>p.score),
    seats:g=>g.pl.map((p,i)=>({name:p.human?'You':p.nm,me:p.human,ai:p.human?undefined:p.lv}))})})();
