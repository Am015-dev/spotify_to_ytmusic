
// ===================== part 8: Story mode (campaign.json + the shared chapter kit gx-campaign.js) =====================
// Each chapter is a normal game with its own crew and (at most) one twist. Twists live only here: boss-cannon (engine option bossCannon), boss-first (newGame first:1), harrier (ai.js CAMP_PUSH).
UI.camp=null;UI.campHints=0;UI.campSunk=0;UI.campCan=0;
{const _el=eliminate;eliminate=function(seat,why,bonus){const was=G&&G.ships[seat]&&G.ships[seat].alive;const r=_el.apply(this,arguments);if(was&&bonus&&G.cur===0&&seat!==0&&UI.camp)UI.campSunk++;return r}}
{const _cp=AG.cannonPlay;AG.cannonPlay=function(d){if(G.cur===0&&UI.camp)UI.campCan++;return _cp.apply(this,arguments)}}
{const _dc=QH.dCannon;QH.dCannon=function(d){if(d.seat===0&&UI.camp)UI.campCan++;return _dc.apply(this,arguments)}}
function campWon(g){return !!(g&&g.over&&(g.over.win||[]).includes(0))}
function campMetrics(g){return {won:campWon(g),sunk:UI.campSunk,turns:g.turn,cannons:UI.campCan,hintsUsed:UI.campHints}}
function campIsWon(g,def){if(!campWon(g))return false;if(def.goal&&def.goal.type==='custom'&&def.goal.value)return UI.campSunk>=def.goal.value;return true}
{const _sg=startGame;startGame=function(s,o){if(!(o&&o.camp)){UI.camp=null;CAMP_PUSH=null}return _sg.apply(this,arguments)}}
function campStart(def){
  const st=def.setup||{},op=def.opponent||{},tw=def.twist||null,lv=op.aiLevel||'normal',n=st.variant==='solo'||st.variant==='easysolo'?1:(st.players||2);
  const s=defaultSetup();s.mode='me';s.np=n;s.variant=st.variant||null;s.noMon=!!st.noMon;s.exp=Object.assign({rift:0,wave:0,maelstrom:0,cannon:0},st.exp||{});
  for(let i=0;i<8;i++)s.seats[i]={h:i===0,lv,col:[0,3,2,1,4,5,6,7][i]};
  UI.setup=s;UI.campHints=0;UI.campSunk=0;UI.campCan=0;CAMP_PUSH=tw&&tw.id==='harrier'?{seat:1,v:tw.param||30}:null;
  const o={camp:def,names:st.names,goalTurns:st.goalTurns};
  if(tw&&tw.id==='boss-first')o.first=1;
  if(tw&&tw.id==='boss-cannon'){o.bossCannon=tw.param||1;o.bossSeat=1}
  startGame(JSON.parse(JSON.stringify(s)),o);UI.camp=def;
  UI.guide=def.hints?'full':'light';UI.seen={};UI.trig={};render();
  try{toast('Goal: '+def.goal.text)}catch(e){}}
function campFinish(){try{GXC.finish(G)}catch(e){console.error(e)}}
function campOpen(){if(typeof GXC==='undefined')return;try{GX.close()}catch(e){}GXC.open()}
function campOn(){return !!(UI.camp&&typeof GXC!=='undefined'&&GXC.active())}
function campLine(){try{if(typeof GXC==='undefined'||!window.CAMPAIGN)return '';const p=GXC.progress(),ch=window.CAMPAIGN.chapters,n=ch.filter(c=>p.ch[c.id]&&p.ch[c.id].beaten).length;return n?n+' of '+ch.length+' chapters done':'Ten chapters, three bosses'}catch(e){return ''}}
function campInit(){if(typeof GXC==='undefined'||!window.CAMPAIGN)return;
  GXC.init({game:'tidewake',headButtons:()=>{const b=document.createElement('button');b.type='button';b.className='gxc-ib';b.textContent='Tutorial';b.setAttribute('aria-label','Replay the tutorial');b.addEventListener('click',()=>{GXC.close();tutStart()});return [b]},data:window.CAMPAIGN,startChapter:campStart,isWon:campIsWon,metrics:campMetrics,
    onExit:()=>{UI.camp=null;showStart()},
    scores:g=>g.ships.map(s=>s.alive?1:0),seats:g=>g.seats.map((x,i)=>({name:i===0?'You':x.nm,me:i===0,ai:x.human?undefined:x.lv}))})}
campInit();
