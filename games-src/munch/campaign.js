// ---------- story mode: the shared chapter map (gx-campaign.js) wired to Doorkick Dungeon. Data: campaign.json ----------
// A chapter is a normal game with its own table, computer levels and (at most) one twist. Twists exist only here; the rules never change.
UI.cmp=null;UI.hintsUser=null;var CMP_FIN=null,CMP_OVER=0,CMP_GO=false;
function campBoss(def){const nm=def.opponent.name;const s=G.pl.find(p=>p.nm===nm);return s?s.i:1}
function campMetrics(g){const me=g.pl[0],ca=g.camp||{};const riv=g.pl.slice(1).map(p=>p.lvl);const won=g.winner==='P1';
  let curses=0;for(const v in (g.rv||{})){const r=g.rv[v]&&g.rv[v][0];if(r)curses+=r.curse||0}
  const worn=me.eq.filter(e=>e.on).length;
  return {won,level:me.lvl,margin:me.lvl-Math.max.apply(null,riv),rounds:Math.ceil(g.turn/g.pl.length),kills:me.st.kills,deaths:me.st.deaths,helps:me.st.helps,runs:me.st.runs,
    cursesPlayed:curses,wornWin:won?worn:0,soldWin:won?(ca.sold||0):0,soldLevels:ca.sold||0,helpedKills:ca.helped||0}}
function campIsWon(g,def){const m=campMetrics(g);if(!m.won)return false;const gl=def.goal||{};
  if(gl.type==='custom'&&gl.value!=null){const need=def.easy&&def.id==='c2'?3:gl.value;if(def.id==='c2')return m.wornWin>=need;if(def.id==='c5')return m.soldWin>=need}
  return true}
// ---- tallies the metrics need (campaign games only) ----
{const _rw=resolveWin;resolveWin=function(){const cb=G.cb;const had=cb&&G.camp&&cb.who===0&&cb.help>=0&&(cb.mons.length||cb.killed.length);const r=_rw.apply(this,arguments);if(had)G.camp.helped++;return r};
 const _ds=doSell;doSell=function(p,ids){const b=p.lvl;const r=_ds.apply(this,arguments);if(G.camp&&p.i===0)G.camp.sold+=Math.max(0,p.lvl-b);return r}}
// ---- twists (setup hooks) ----
function campApplyTwist(def){const t=def.twist;if(!t)return;const B=campBoss(def),nm=def.opponent.name,n=G.pl.length;
  if(t.id==='boss-head-start'){P(B).lvl=Math.min(9,1+t.param);lg(-1,`Boss rule: ${nm} starts at level ${P(B).lvl}.`)}
  else if(t.id==='boss-extra-treasure'){drawTo(P(B),'treasure',t.param);lg(-1,`Twist: ${nm} starts with ${t.param} extra treasure cards.`)}
  else if(t.id==='boss-first'){G.active=G.first=B;G.setupOrd=G.pl.map((_,j)=>(B+j)%n);G.setupI=0;
    for(const e of G.log)if(/rolls highest and goes first/.test(e.t)){e.t=`${nm} takes the first turn (Vault rule).`;break}}
  else if(t.id==='light-pack'){const me=P(0);let k=0;for(let i=0;i<t.param;i++){const tr=me.hand.filter(id=>D(G.C[id]).d!=='door');if(!tr.length)break;const id=tr[rnd(tr.length)];me.hand.splice(me.hand.indexOf(id),1);G.td.push(id);k++}
    lg(-1,`Vault rule: you start with ${k} fewer treasure card${k===1?'':'s'}.`)}}
// ---- starting a chapter ----
function campStart(def){const s=def.setup||{};const n=Math.max(3,Math.min(6,s.n||(s.names&&s.names.length)||3));
  const names=(s.names||[null].concat(HERO_NAMES.filter(h=>h!==def.opponent.name).slice(0,n-1))).slice(0,n);names[0]=names[0]||'Rookie';
  if(!names.includes(def.opponent.name))names[1]=def.opponent.name;
  const lv=(s.lvmix&&s.lvmix.slice(0,n))||null;
  if(UI.hintsUser==null)UI.hintsUser=UI.hints;
  const kNames=UI.names,kLvl=UI.lvl;UI.names=names;if(s.lvl)UI.lvl=s.lvl;LVMIX=lv;CMP_GO=true;UI.pass=null;UI.lastSeat=-1;UI.mode='F';
  try{newGame('F',n)}finally{UI.names=kNames;UI.lvl=kLvl;LVMIX=null;CMP_GO=false}
  G.campId=def.id;G.camp={sold:0,helped:0};G.learn=!!def.hints;UI.cmp=def;CMP_OVER=0;UI.hints=false;
  campApplyTwist(def);G.ex=Object.assign({},DEFEX);render();clearInterval(CMP_FIN);CMP_FIN=setInterval(campWatch,400)}
// a normal game leaves story mode and gives the player their own hints setting back
{const _ng=newGame;newGame=function(){if(!CMP_GO){if(UI.cmp||UI.hintsUser!=null){UI.cmp=null;clearInterval(CMP_FIN);if(UI.hintsUser!=null)UI.hints=UI.hintsUser;UI.hintsUser=null}LVMIX=null}return _ng.apply(this,arguments)}}
// the chapter's result screen replaces the normal end dialog
{const _eh=endHTML;endHTML=function(){return UI.cmp?'':_eh.apply(this,arguments)}}
function campWatch(){if(!UI.cmp||!G)return;if(!G.winner){CMP_OVER=0;return}
  if(!CMP_OVER){CMP_OVER=Date.now();return}if(Date.now()-CMP_OVER<(window.CMP_WAIT!=null?window.CMP_WAIT:2200))return;
  clearInterval(CMP_FIN);const g=G;UI.cmp=null;if(UI.hintsUser!=null){UI.hints=UI.hintsUser;UI.hintsUser=null}
  if(GXC.active())GXC.finish(g)}
function campInit(){if(typeof GXC==='undefined'||!window.CAMPAIGN)return;
  GXC.init({game:'doorkick',data:window.CAMPAIGN,startChapter:campStart,isWon:campIsWon,metrics:campMetrics,
    onExit(){clearInterval(CMP_FIN);UI.cmp=null;if(UI.hintsUser!=null){UI.hints=UI.hintsUser;UI.hintsUser=null}G=null;UI.info=true;render()},
    scores:g=>g.pl.map(p=>p.lvl),seats:g=>g.pl.map((p,i)=>({name:p.nm,me:i===0,ai:i?p.lv:undefined}))})}
function campOpen(){if(typeof GXC==='undefined')return;if(GX.open)GX.close();GXC.open()}
function campLine(){try{const p=GXC.progress();const ch=window.CAMPAIGN.chapters;const n=ch.filter(c=>p.ch[c.id]&&p.ch[c.id].beaten).length;
  if(!n)return '';const nx=ch.find(c=>!(p.ch[c.id]&&p.ch[c.id].beaten));return `<p class="small"><b>Story: ${n} of ${ch.length} chapters done${nx?`, next: “${esc(nx.title)}”`:''}.</b></p>`}catch(e){return ''}}
document.addEventListener('click',e=>{const t=e.target.closest('[data-a="story"]');if(t){e.preventDefault();campOpen()}});
campInit();
if(!G)render();
