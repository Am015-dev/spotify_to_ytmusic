// ---------- story mode: the shared chapter map (gx-campaign.js) wired to Sunglaze. Data: campaign.json ----------
// A chapter is a normal game with its own setup, computer level and (at most) one twist. Twists exist only here.
UI.cmp=null;var CMP_LVL0={alpha:LVL.hard.alpha,K:LVL.hard.K,roll:LVL.hard.roll};var CMP_FIN=null,CMP_OVER=0;
var CMP_SLIP0=LVL.easy.slip,CMP_SLIP={c1:.8,c2:.6,c3:.45};// act 1 rivals blunder more often (measured: a sensible beginner wins about 8 in 10 of chapter 1)
var CMP_NAMES={c8:['Lumen','Lux']};
function campLvlReset(){LVL.easy.slip=CMP_SLIP0;LVL.hard.K=CMP_LVL0.K;LVL.hard.roll=CMP_LVL0.roll;LVL.hard.alpha=CMP_LVL0.alpha}
function campBossSeat(){return 1}
function campMetrics(g){const p=g.pl[0];const b=endBonus(p);const rivals=g.pl.slice(1).map(q=>q.score);
  return {won:!!(g.over&&g.over.win.includes(0)),score:p.score,margin:p.score-Math.max.apply(null,rivals),rounds:g.round,breakage:-p.st.floor,cols:b.cols,colours:b.colours,rows:b.rows}}
function campIsWon(g,def){const m=campMetrics(g);if(!m.won)return false;const gl=def.goal||{};
  if(gl.type==='score'&&m.score<gl.value)return false;if(gl.type==='custom'&&gl.value!=null&&m.breakage>gl.value)return false;return true}
// ---- twists (setup and scoring hooks) ----
function campApplyTwist(def){const t=def.twist;campLvlReset();if(!t)return;const B=campBossSeat();const nm=def.opponent.name;
  if(t.id==='boss-sun'){G.first=G.cur=B;lg(`Boss rule: ${nm} holds the Sun token and takes first.`,'big')}
  else if(t.id==='boss-head-start'){P(B).score=t.param;lg(`Boss rule: ${nm} starts with ${t.param} points.`,'big')}
  else if(t.id==='boss-glazed-start'){let n=0;for(let r=0;r<t.param;r++){const k=G.bag.indexOf(0);if(k<0)break;G.bag.splice(k,1);P(B).wall[r][WALLCOL(0,r)]=0;n++}
    lg(`Rival rule: ${nm} starts with ${n} Cobalt tile${n===1?'':'s'} already set.`,'big')}
  else if(t.id==='boss-column-bonus'){G.camp={colBonus:t.param,seat:B}}
  else if(t.id==='boss-deep-sight'){LVL.hard.roll=t.param;LVL.hard.K=14;lg(`Boss rule: ${nm} studies every take twice as deep.`,'big')}}
// scoring twist: after the normal ending, the boss earns extra points per complete column, then the winner is worked out again
var _campFinish=finish;finish=function(){const had=!!G.over;_campFinish.apply(this,arguments);
  if(had||!G.over||!G.camp||!G.camp.colBonus)return;const p=P(G.camp.seat);const b=endBonus(p);const extra=b.cols*G.camp.colBonus;if(!extra)return;
  p.score+=extra;p.st.cols+=extra;lg(`Boss rule: ${p.nm} earns ${extra} extra for ${b.cols} complete column${b.cols===1?'':'s'}.`,'good');
  const sc=G.pl.slice().sort((a,b)=>b.score-a.score||b.fr-a.fr);const top=sc[0];const winners=sc.filter(q=>q.score===top.score&&q.fr===top.fr);
  G.over={scores:sc.map(q=>({p:q.i,s:Object.assign({total:q.score,fr:q.fr},q.st)})),win:winners.map(w=>w.i),tie:sc.filter(q=>q.score===top.score).length>1};G.winner=winners.map(w=>w.nm).join(' & ');
  G.winText=`${G.winner} ${winners.length>1?'share the win':'wins'} with ${top.score} points.`;lg('🏆 '+G.winText,'big')};
// ---- starting a chapter ----
function campStart(def){if(CMP_RES){GXC.scene=CMP_RES.s;GXC.bossCard=CMP_RES.b;const g=CMP_RES.g;CMP_RES=null;campLvlReset();G=g;UI.cmp=def;CMP_OVER=0;UI.guideNote=null;UI.fx.length=0;UI.fxSeen=0;UI.recap=[];UI.sel=null;UI.tgt=null;UI.adv=null;UI.coach=!!def.hints;
    const cb=$('#coachbtn');if(cb)cb.classList.toggle('on',UI.coach);UI.modal=null;const t=def.twist;if(t&&t.id==='boss-deep-sight'){LVL.hard.roll=t.param;LVL.hard.K=14}
    if(def.opponent.aiLevel==='easy'&&CMP_SLIP[def.id]!=null)LVL.easy.slip=Math.min(.9,CMP_SLIP[def.id]+(def.easy?.15:0));resetScene();refresh();clearInterval(CMP_FIN);CMP_FIN=setInterval(campWatch,400);return}
  const s=def.setup||{};const np=Math.max(2,Math.min(4,s.np||2));const ex=Object.assign({gray:false,prism:false},s.ex||{});
  const lv=['normal'];for(let i=1;i<np;i++)lv.push(def.opponent.aiLevel||'normal');const names=['You'].concat(CMP_NAMES[def.id]||(np===2?[def.opponent.name]:[def.opponent.name+' 1',def.opponent.name+' 2']));
  UI.cmp=def;CMP_OVER=0;UI.guideNote=null;UI.fx.length=0;UI.fxSeen=0;UI.recap=[];UI.sel=null;UI.tgt=null;UI.adv=null;UI.lastHuman=null;
  UI.coach=!!def.hints;const cb=$('#coachbtn');if(cb)cb.classList.toggle('on',UI.coach);
  UI.modal=null;const seats=['human'];for(let i=1;i<np;i++)seats.push('ai');
  newGame({np,seats,lv,names,ex,mode:'x'});G.campId=def.id;G.campEasy=!!def.easy;campApplyTwist(def);if(def.opponent.aiLevel==='easy'&&CMP_SLIP[def.id]!=null)LVL.easy.slip=Math.min(.9,CMP_SLIP[def.id]+(def.easy?.15:0));
  try{localStorage.removeItem(SAVE)}catch(e){}resetScene();refresh();clearInterval(CMP_FIN);CMP_FIN=setInterval(campWatch,400)}
// a saved story game resumes inside its chapter: GXC.play with its intro and boss card skipped, then campStart restores the saved state
var CMP_RES=null;
function campResume(){if(!G||!G.campId||typeof GXC==='undefined'||!window.CAMPAIGN||CMP_RES)return false;if(!window.CAMPAIGN.chapters.some(c=>c.id===G.campId))return false;
  CMP_RES={g:G,s:GXC.scene,b:GXC.bossCard};GXC.scene=()=>Promise.resolve();GXC.bossCard=()=>Promise.resolve(true);
  try{GXC.play(G.campId,{easy:!!G.campEasy})}catch(e){}
  setTimeout(()=>{if(CMP_RES){GXC.scene=CMP_RES.s;GXC.bossCard=CMP_RES.b;CMP_RES=null}},1500);return true}
function campWatch(){if(!UI.cmp||!G)return;if(!G.over){CMP_OVER=0;return}
  if(typeof BF!=='undefined'&&BF.busy){CMP_OVER=0;return}
  if(!CMP_OVER){CMP_OVER=Date.now();return}if(Date.now()-CMP_OVER<(window.CMP_WAIT!=null?window.CMP_WAIT:1800))return;
  clearInterval(CMP_FIN);const g=G;UI.cmp=null;campLvlReset();try{if(typeof BF!=='undefined')BF.resHide=true;if(BF.on)bfDraw()}catch(e){}
  if(GXC.active())GXC.finish(g)}
function campInit(){if(typeof GXC==='undefined'||!window.CAMPAIGN)return;
  GXC.init({game:'sunglaze',headButtons:()=>{const b=document.createElement('button');b.type='button';b.className='gxc-ib';b.textContent='Tutorial';b.setAttribute('aria-label','Replay the tutorial');b.addEventListener('click',()=>{GXC.close();tutStart()});return [b]},data:window.CAMPAIGN,artBase:'media/',endArt:{win:'media/end-win.webp',lose:'media/end-lose.webp'},startChapter:campStart,isWon:campIsWon,metrics:campMetrics,
    onExit(){openStart()},scores:g=>g.pl.map(p=>p.score),seats:g=>g.pl.map((p,i)=>({name:p.nm,me:i===0,ai:i?p.lv:undefined}))})}
function campOpen(){if(typeof GXC==='undefined')return;UI.modal=null;const m=$('#modal');if(m){m.hidden=true;m.innerHTML='';m.dataset.h=''}GXC.open()}
// a normal game (Begin) leaves story mode and restores the player's own guide setting
{const _bg=beginGame;beginGame=function(){if(UI.cmp){UI.cmp=null;clearInterval(CMP_FIN);try{UI.coach=localStorage.getItem('sgz_coach')!=='0'}catch(e){UI.coach=true}}campLvlReset();if(G)delete G.camp;return _bg.apply(this,arguments)}}
function campLine(){try{const p=GXC.progress();const ch=window.CAMPAIGN.chapters;const n=ch.filter(c=>p.ch[c.id]&&p.ch[c.id].beaten).length;
  if(!n)return '';const nx=ch.find(c=>!(p.ch[c.id]&&p.ch[c.id].beaten));return `<p class="cmp-line"><b>Story: ${n} of ${ch.length} chapters done${nx?`, next: “${esc(nx.title)}”`:''}.</b></p>`}catch(e){return ''}}
campInit();
