// ---------------------------------------------------------------- story mode (gx-campaign.js, data: campaign.json)
// A chapter is a normal game with its own table, computer level and at most one twist. Twists exist only here; seat 1 is always the boss.
function campOpts(def){const s=def.setup||{};const np=Math.max(2,Math.min(4,s.np||2));const lv=['normal'];for(let i=1;i<np;i++)lv.push(def.opponent.aiLevel||'normal');
  const o={np,length:s.length||'short',faction:s.faction||'clans',levels:lv,seed:s.seed==null?undefined:s.seed,guide:def.hints?'full':'off',camp:def};
  if(s.seatFactions)o.seatFactions=s.seatFactions.slice(0,np);
  const t=def.twist;if(t&&t.id==='boss-first'){const rest=[];for(let i=2;i<np;i++)rest.push(i);for(let i=rest.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[rest[i],rest[j]]=[rest[j],rest[i]]}o.order=[1].concat(rest,[0])}
  return o}
// twists that change the opening state: called right after TB.newGame
function campApply(def){const t=def.twist;if(!t||!G)return;const nm=G.pl[1]?G.pl[1].name:'The boss';
  if(t.id==='boss-lore'){G.pl[1].lore=t.param==null?2:t.param;lg('Boss rule: '+nm+' starts with '+G.pl[1].lore+' Lore.',1,'big')}
  else if(t.id==='boss-favour'){G.fav={h:1,u:3};lg('Boss rule: '+nm+' starts holding the Kingdom\'s Favour.',1,'big')}
  else if(t.id==='boss-first'){lg('Boss rule: '+nm+' acts first this season.',1,'big')}
  else if(t.id==='sharp-mind'){lg('Boss rule: '+nm+' thinks twice as long before each move.',1,'big')}}
function campMetrics(g){const me=g.pl[0];const rivals=g.pl.slice(1).map(p=>p.inf);const won=!!(g.over&&g.over.winner===0);
  const cnt=re=>g.log.filter(e=>e.s===0&&re.test(e.t)).length;
  let gov=0;try{['relics','secrets','oaths'].forEach(k=>g.council[k].forEach(id=>{if(((id/100)|0)===0)gov++}))}catch(e){}
  return {won,score:me.inf,margin:me.inf-Math.max.apply(null,rivals),rounds:g.round,clashWins:cnt(/wins the Clash/),heraldHits:(g.infl&&g.infl[0]&&g.infl[0]['Herald Reward'])||0,
    kingdomCards:(me.ks||[]).filter(x=>x).length,steals:cnt(/ steals .* from | takes .* from /),siteBought:5-(me.site?me.site.length:5),governs:gov,
    favourUses:g.log.filter(e=>e.m&&e.m.k==='fav'&&e.m.s===0).length,favourHeld:g.fav.h===0,eliminated:g.log.filter(e=>e.m&&e.m.k==='elim'&&e.s===0).length,handSize:me.hs}}
function campIsWon(g,def){return !!(g.over&&g.over.winner===0)}
function campOver(){if(!UI.camp||UI.campDone||typeof GXC==='undefined'||!GXC.active())return;UI.campDone=true;const g=G;
  setTimeout(()=>{if(G===g&&GXC.active()){try{clearSave()}catch(e){}GXC.finish(g)}},window.CAMP_WAIT!=null?window.CAMP_WAIT:2200)}
function campLine(){try{const p=GXC.progress(),ch=window.CAMPAIGN.chapters,n=ch.filter(c=>p.ch[c.id]&&p.ch[c.id].beaten).length;return n?n+' of '+ch.length+' chapters done':'chapters, bosses, three acts'}catch(e){return 'chapters, bosses, three acts'}}
function campInit(){if(typeof GXC==='undefined'||!window.CAMPAIGN)return;
  GXC.init({game:'thornbound',headButtons:()=>{const b=document.createElement('button');b.type='button';b.className='gxc-ib';b.textContent='Tutorial';b.setAttribute('aria-label','Replay the tutorial');b.addEventListener('click',()=>{GXC.close();tutStart()});return [b]},data:window.CAMPAIGN,startChapter:def=>{hideStart();newGame('me',campOpts(def))},isWon:campIsWon,metrics:campMetrics,
    onExit(){showStart()},scores:g=>g.pl.map(p=>p.inf),seats:g=>g.pl.map((p,i)=>({name:p.name,me:i===0,ai:i?p.ai:undefined}))})}
campInit();
