// ===================== help (gx-help kit): coach bubbles the first time, the lightbulb on demand =====================
// Bubbles: once per phase, short, pointing at a glowing thing on the board. The bulb: the game's own advice (suggestDial / recAct / the best-shot
// maths / recMod / recOpt, the same ones that draw the stars and the ghost finger) + a short why + rules cards. No advice appears on its own.
// ---------------------------------------------------------------- pictures for the rules cards (small inline SVG in the game's colours)
const HP=(()=>{
  const S=(inner)=>'<svg viewBox="0 0 64 64" aria-hidden="true">'+inner+'</svg>';
  const shipP=(x,y,rot,col)=>`<g transform="translate(${x} ${y}) rotate(${rot})"><path d="M0-12L8 10 0 5-8 10z" fill="${col||'#f08a3a'}" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></g>`;
  const dieP=(sym,col)=>S(`<path d="M32 5L56 19V45L32 59 8 45V19z" fill="${col||'#c21830'}" stroke="#fff" stroke-width="2.5" stroke-linejoin="round"/>${sym}`);
  const star=(n,r0,r1,cx,cy)=>{let d='';for(let i=0;i<n*2;i++){const a=i/(n*2)*Math.PI*2-Math.PI/2,r=i%2?r1:r0;d+=(i?'L':'M')+(cx+Math.cos(a)*r).toFixed(1)+' '+(cy+Math.sin(a)*r).toFixed(1)}return d+'Z'};
  return {
    me:()=>S(shipP(32,38,0,'#f08a3a')),
    foe:()=>S(shipP(32,28,180,'#e0304a')),
    two:()=>S(shipP(32,50,0,'#f08a3a')+shipP(32,14,180,'#e0304a')+'<path d="M32 38V26" stroke="#ffc86b" stroke-width="2.5" stroke-dasharray="3 3"/>'),
    arc:()=>S('<path d="M32 40L10 4h44z" fill="rgba(255,200,107,.35)" stroke="#ffc86b" stroke-width="2.5" stroke-linejoin="round"/>'+shipP(32,46,0,'#f08a3a')+shipP(32,14,180,'#e0304a')),
    range:()=>S('<g fill="none" stroke="#ffc86b" stroke-width="2"><path d="M10 52Q32 8 54 52"/><path d="M18 52Q32 24 46 52" stroke-dasharray="3 3"/></g><text x="32" y="22" text-anchor="middle" font-size="13" font-weight="800" fill="#fff">1 2 3</text>'+shipP(32,54,0,'#f08a3a')),
    dial:()=>S('<g stroke="#fff" stroke-width="1.5"><rect x="8" y="8" width="14" height="14" rx="3" fill="#56e39a"/><rect x="25" y="8" width="14" height="14" rx="3" fill="#56e39a"/><rect x="42" y="8" width="14" height="14" rx="3" fill="#f3f3ff"/><rect x="8" y="25" width="14" height="14" rx="3" fill="#f3f3ff"/><rect x="25" y="25" width="14" height="14" rx="3" fill="#f3f3ff"/><rect x="42" y="25" width="14" height="14" rx="3" fill="#ff5a6a"/><rect x="8" y="42" width="14" height="14" rx="3" fill="#f3f3ff"/><rect x="25" y="42" width="14" height="14" rx="3" fill="#56e39a"/><rect x="42" y="42" width="14" height="14" rx="3" fill="#ff5a6a"/></g>'),
    path:()=>S('<path d="M20 56C20 36 44 36 44 14" fill="none" stroke="#7fd4ff" stroke-width="4" stroke-dasharray="6 5" stroke-linecap="round"/>'+shipP(20,52,0,'#f08a3a')+'<g opacity=".6">'+shipP(44,16,20,'#7fd4ff')+'</g>'),
    stress:()=>S('<circle cx="32" cy="32" r="22" fill="#ff5a6a" stroke="#fff" stroke-width="3"/><text x="32" y="42" text-anchor="middle" font-size="30" font-weight="800" fill="#fff">!</text>'),
    rock:()=>S('<path d="M12 40l6-18 16-8 16 10 4 18-14 12-18-2z" fill="#8a8794" stroke="#4a4852" stroke-width="3" stroke-linejoin="round"/><circle cx="28" cy="32" r="3" fill="#6a6772"/><circle cx="40" cy="42" r="4" fill="#6a6772"/>'),
    rockOff:()=>S('<path d="M8 8h48v48H8z" fill="none" stroke="#ffc86b" stroke-width="3" stroke-dasharray="5 4"/><path d="M40 30l12 0" stroke="#ff5a6a" stroke-width="4" stroke-linecap="round"/>'+shipP(56,30,90,'#f08a3a')),
    shield:()=>S('<path d="M32 6L54 14v18c0 14-10 22-22 26C20 54 10 46 10 32V14z" fill="#4aa8ff" stroke="#fff" stroke-width="3" stroke-linejoin="round"/>'),
    hull:()=>S('<path d="M32 56C10 40 8 24 18 16c6-4 12-2 14 4 2-6 8-8 14-4 10 8 8 24-14 40z" fill="#ff5a6a" stroke="#fff" stroke-width="3" stroke-linejoin="round"/>'),
    hit:()=>dieP(`<path d="${star(8,16,7,32,32)}" fill="#fff3ea"/>`),
    crit:()=>dieP(`<path d="${star(4,18,5,32,32)}" fill="#fff3ea"/><circle cx="32" cy="32" r="5" fill="#c21830"/>`),
    focus:()=>dieP('<circle cx="32" cy="32" r="14" fill="none" stroke="#fff3ea" stroke-width="3.5"/><circle cx="32" cy="32" r="6" fill="#fff3ea"/>'),
    evade:()=>dieP('<path d="M32 14Q35 29 50 32Q35 35 32 50Q29 35 14 32Q29 29 32 14z" fill="#effff5"/>','#1fa45a'),
    blank:()=>dieP('','#7a0a18'),
    tFocus:()=>S('<circle cx="32" cy="32" r="22" fill="#2a2a5a" stroke="#ffc86b" stroke-width="3"/><circle cx="32" cy="32" r="12" fill="none" stroke="#ffc86b" stroke-width="3"/><circle cx="32" cy="32" r="4" fill="#ffc86b"/>'),
    tEvade:()=>S('<circle cx="32" cy="32" r="22" fill="#14463a" stroke="#56e39a" stroke-width="3"/><path d="M32 16Q35 29 48 32Q35 35 32 48Q29 35 16 32Q29 29 32 16z" fill="#56e39a"/>'),
    tLock:()=>S('<circle cx="32" cy="32" r="22" fill="#4a1420" stroke="#ff5a6a" stroke-width="3"/><path d="M32 8v12M32 44v12M8 32h12M44 32h12" stroke="#ff5a6a" stroke-width="3.5"/><circle cx="32" cy="32" r="8" fill="none" stroke="#ff5a6a" stroke-width="3"/>'),
    tap:()=>S('<circle cx="32" cy="32" r="18" fill="rgba(255,200,107,.2)" stroke="#ffc86b" stroke-width="4"/><path d="M30 14v26l-6-5-4 4 14 14h14l4-20-8-2-4-4-4 1-2-4z" fill="#fff" stroke="#231a10" stroke-width="2.5" stroke-linejoin="round"/>'),
    fly:()=>S('<path d="M10 32h36M34 18l14 14-14 14" fill="none" stroke="#ffc86b" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>'),
    round:()=>S('<g fill="none" stroke="#ffc86b" stroke-width="3"><circle cx="32" cy="32" r="22"/></g><g font-size="13" font-weight="800" fill="#fff" text-anchor="middle"><text x="32" y="17">Plan</text><text x="50" y="36">Fly</text><text x="32" y="55">Shoot</text><text x="13" y="36">End</text></g>'),
    ask:()=>S('<rect x="10" y="14" width="44" height="36" rx="7" fill="#1c1944" stroke="#ffc86b" stroke-width="3"/><path d="M20 26h24M20 34h16" stroke="#fff" stroke-width="3" stroke-linecap="round"/>'),
    skip:()=>S('<circle cx="32" cy="32" r="22" fill="none" stroke="#a3a0cc" stroke-width="5"/><path d="M16 48L48 16" stroke="#a3a0cc" stroke-width="5"/>')
  }})();
function hpics(items){return '<div class="gxh-pics">'+items.map(it=>it==='>'?'<span class="gxh-ar">&rarr;</span>':'<figure>'+(HP[it[0]]?HP[it[0]]():'')+(it[1]?'<figcaption>'+it[1]+'</figcaption>':'')+'</figure>').join('')+'</div>'}
// ---------------------------------------------------------------- where each bubble points (the glowing thing of the phase)
const hv=sel=>{for(const e of document.querySelectorAll(sel)){if(e.closest('[hidden],[data-help]'))continue;const r=e.getBoundingClientRect();if(r.width>2&&r.height>2&&getComputedStyle(e).visibility!=='hidden')return e}return null};
const hfirst=(...sels)=>()=>{for(const s of sels){const e=hv(s);if(e)return e}return null};
const HLP_STEPS={
 brief:{target:hfirst('[data-bf=brief]'),title:'Your battle',text:'Destroy every enemy ship. Tap Start to place the asteroids and begin.',pic:()=>HP.two()},
 setup:{target:hfirst('.bfspot.rec','#bfbtns .btn','#prompt [data-a=autoplace]'),title:'Place your ship',text:'Tap the glowing spot, or press Auto-place all.',pic:()=>HP.tap()},
 planShip:{target:hfirst('.bfring.need','.ps-chip.need','#prompt .btn.primary'),title:'Plan your move',text:'Tap your ship, then choose where it will fly.',pic:()=>HP.me()},
 planMove:{target:hfirst('.bfm.sug','.mv.sugg','.bfm:not(.small)','.mv'),title:'Pick a maneuver',text:'Tap a ghost ship to fly there. The starred one is suggested.',pic:()=>HP.path()},
 planFly:{target:hfirst('[data-bf=fly]','[data-a=lock]'),title:'Ready? Fly!',text:'Every ship has a move. Tap Fly to reveal the dials.',pic:()=>HP.fly()},
 action:{target:hfirst('.bfact.rec','.bfact:not(.skip)','#prompt .btn.rec','#prompt [data-act=action]'),title:'Take an action',text:'Tap an icon next to your ship. Focus is a safe choice.',pic:()=>HP.tFocus()},
 sub:{target:hfirst('.bftgt.lock','.bfm.w'),title:'Choose where',text:'Tap the glowing spot, or the enemy you want to lock on.',pic:()=>HP.tLock()},
 target:{target:hfirst('.bftgt.rec','.bftgt','#prompt .btn.rec','#prompt [data-act=fire]'),title:'Take your shot',text:'Tap a glowing enemy in your arc. Numbers are attack against defence dice.',pic:()=>HP.arc()},
 amod:{target:hfirst('#bfbtns .btn.rec','#bfbtns .btn.primary','#prompt .btn.rec','#prompt .btn.primary'),title:'Improve your dice',text:'Use a token to improve the roll, then tap Roll.',pic:()=>HP.hit()},
 dmod:{target:hfirst('#bfbtns .btn.rec','#bfbtns .btn.primary','#prompt .btn.rec','#prompt .btn.primary'),title:'Defend yourself',text:'Spend a token to cancel hits, or tap Done.',pic:()=>HP.evade()},
 damod:{target:hfirst('#bfbtns .btn.primary','#prompt .btn.primary'),title:'Tamper with dice',text:'Optionally change their attack dice, or let the attack stand.',pic:()=>HP.blank()},
 reroll:{target:hfirst('#bfdice .die.pick:not(.on)','#bfbtns .btn.primary','#prompt [data-act=ask]'),title:'Pick dice to reroll',text:'Tap the dice you want to roll again, then tap Reroll.',pic:()=>HP.blank()},
 ask:{target:hfirst('#bfbtns .btn.primary','#prompt [data-act=ask].primary','#prompt [data-act=ask]','.bfm.w'),title:'Your choice',text:'Tap the highlighted button, or another one to decline.',pic:()=>HP.ask()}
};
// ---------------------------------------------------------------- the rules cards (<= 20 words each, a picture each)
const HLP_RULES=[
 {title:'The goal',text:'Destroy every enemy ship before yours are destroyed. Shields go first, then the hull.',pic:()=>hpics([['two','Fight']])},
 {title:'One round',text:'Plan secret moves. Ships fly, lowest pilot skill first. Then ships shoot, highest skill first.',pic:()=>hpics([['round','4 steps']])},
 {title:'Hull and shields',text:'Shields soak up damage first. When the hull runs out, the ship is destroyed.',pic:()=>hpics([['shield','Shields'],'>',['hull','Hull']])},
 {phase:'brief',title:'Your goal',text:'Destroy every enemy ship. Yours are at the bottom, theirs at the top.',pic:()=>hpics([['me','You'],['foe','Enemy']])},
 {phase:'brief',title:'Hull and shields',text:'Shields soak up damage first. When the hull runs out, the ship is destroyed.',pic:()=>hpics([['shield','Shields'],'>',['hull','Hull']])},
 {phase:'brief',title:'Four steps a round',text:'Plan secret moves. Ships fly, lowest pilot skill first. Then ships shoot, highest skill first.',pic:()=>hpics([['round','Round']])},
 {phase:'setup',title:'Asteroids',text:'Flying into an asteroid hurts and skips your action. Shooting past one gives the defender an extra die.',pic:()=>hpics([['rock','Asteroid'],'>',['hit','Damage']])},
 {phase:'setup',title:'Where to start',text:'Start near the middle so you can turn either way. Auto-place picks sensible spots for you.',pic:()=>hpics([['tap','Tap a spot'],'>',['me','Your ship']])},
 {phase:'planShip',title:'Plan in secret',text:'Every ship picks one maneuver on its dial. The enemy picks at the same time, in secret.',pic:()=>hpics([['dial','Dial'],['foe','Enemy too']])},
 {phase:'planShip',title:'Tap your ship',text:'Tap a ship with a pulsing ring to choose its move. Plan every ship, then press Fly.',pic:()=>hpics([['tap','Tap'],'>',['path','Move']])},
 {phase:'planMove',title:'Speed and direction',text:'Each maneuver has a speed, 1 to 5, and a direction: straight, bank, turn or K-turn.',pic:()=>hpics([['dial','Dial'],'>',['path','Ghost']])},
 {phase:'planMove',title:'Green, white, red',text:'Green is easy and clears stress. Red adds a stress token: no action, and no red moves next.',pic:()=>hpics([['dial','Colours'],'>',['stress','Stress']])},
 {phase:'planMove',title:'Aim with your arc',text:'You can only shoot enemies inside your yellow arc, at range 1 to 3. Plan moves that end facing one.',pic:()=>hpics([['arc','Your arc'],['range','Range']])},
 {phase:'planMove',title:'Rocks and edges',text:'A red mark means the move hits an asteroid. Flying off the battlefield destroys your ship.',pic:()=>hpics([['rock','Asteroid'],['rockOff','Edge']])},
 {phase:'planFly',title:'Lock in the plan',text:'Press Fly when every ship has a move. Then ships move one at a time, lowest skill first.',pic:()=>hpics([['dial','Planned'],'>',['fly','Fly']])},
 {phase:'planFly',title:'Pilot skill',text:'Pilot skill sets the order. Low skill moves first, high skill shoots first.',pic:()=>hpics([['me','Low: moves first'],['foe','High: shoots first']])},
 {phase:'action',title:'One action',text:'After moving, each ship takes one action. Stressed or bumped ships cannot. Skip is always allowed.',pic:()=>hpics([['me','Ship'],'>',['tFocus','Action']])},
 {phase:'action',title:'Focus',text:'Focus turns each focus result on your dice into a hit when you attack, or an evade when shot.',pic:()=>hpics([['focus','Focus result'],'>',['hit','Hit']])},
 {phase:'action',title:'Evade and Lock',text:'Evade adds a dodge when shot. Target lock lets you reroll dice against the enemy you locked.',pic:()=>hpics([['tEvade','Evade'],['tLock','Lock']])},
 {phase:'sub',title:'Choose where',text:'Tap a ghost ship to move there, or tap the enemy to lock on. Back cancels.',pic:()=>hpics([['path','Ghost'],['tLock','Lock']])},
 {phase:'sub',title:'Locks last',text:'A target lock stays on that enemy until you spend it to reroll dice.',pic:()=>hpics([['tLock','Lock'],'>',['blank','Reroll']])},
 {phase:'target',title:'Pick a target',text:'Tap an enemy inside your arc. The numbers show your attack dice against their defence dice.',pic:()=>hpics([['arc','In your arc']])},
 {phase:'target',title:'Range matters',text:'Range 1 adds an attack die. Range 3 adds a defence die. Range 2 is even.',pic:()=>hpics([['range','Range 1-3']])},
 {phase:'target',title:'Hold fire',text:'No good shot? Tap Hold fire. Nothing is lost.',pic:()=>hpics([['skip','Hold fire']])},
 {phase:'amod',title:'Attack dice',text:'A hit or a crit is damage. A blank does nothing. Focus results count only if you spend focus.',pic:()=>hpics([['hit','Hit'],['crit','Crit'],['focus','Focus'],['blank','Blank']])},
 {phase:'amod',title:'Improve the roll',text:'Spend focus to turn focus results into hits. Spend a target lock to reroll your blanks.',pic:()=>hpics([['tFocus','Focus'],['tLock','Lock']])},
 {phase:'amod',title:'Then they dodge',text:'After Roll, the defender rolls evade dice. Each evade cancels one hit.',pic:()=>hpics([['hit','Hits'],'>',['evade','Evade']])},
 {phase:'dmod',title:'Defend',text:'Spend focus or an evade token to cancel more hits before the damage lands.',pic:()=>hpics([['tFocus','Focus'],['tEvade','Evade']])},
 {phase:'dmod',title:'Damage',text:'Shields absorb damage first, then hull. A crit also draws a damage card with a nasty effect.',pic:()=>hpics([['shield','Shields'],'>',['hull','Hull']])},
 {phase:'dmod',title:'Nothing to spend?',text:'Tap Done. Unused focus and evade tokens vanish at the end of the round.',pic:()=>hpics([['skip','Done']])},
 {phase:'damod',title:'Tamper with dice',text:'Some ships can change an enemy die before it counts. Tap the option you want.',pic:()=>hpics([['hit','Their die'],'>',['blank','Changed']])},
 {phase:'damod',title:'It is optional',text:'Tap the main button to let the attack stand. Nothing is lost by skipping.',pic:()=>hpics([['skip','Skip']])},
 {phase:'reroll',title:'Reroll dice',text:'Tap each die you want to roll again, then tap Reroll. Each die can be rerolled only once.',pic:()=>hpics([['blank','Blank'],'>',['hit','Better?']])},
 {phase:'reroll',title:'Which dice?',text:'Reroll the blanks. Reroll focus results too if you have no focus to spend.',pic:()=>hpics([['blank','Blank'],['focus','Focus']])},
 {phase:'ask',title:'A choice',text:'Some pilots and cards offer an optional power. The highlighted button is the usual pick.',pic:()=>hpics([['ask','Choice']])},
 {phase:'ask',title:'Saying no',text:'No keeps the card for later. You never have to use it.',pic:()=>hpics([['skip','No']])}
];
// ---------------------------------------------------------------- phases
// the moment the player is deciding in (null when there is nothing to decide on the board)
function hlpPhase(){try{
  if(typeof tutOn==='function'&&tutOn())return null;
  if(!G||G.winner||UI.info||UI.stats||UI.rules||UI.build!=null||UI.hold)return null;
  if(typeof PHN!=='undefined'&&PHN.pop)return null;
  if(typeof BF!=='undefined'&&BF.on&&(BF.wave||performance.now()<BF.flyUntil))return null;
  if(sumPending())return null;
  if(G.phase==='plan'&&UI.pass!=null&&UI.pass!==planSide()&&planSide()>=0&&typeof bothHuman==='function'&&bothHuman())return null;
  if(document.querySelector('#modal:not(.hidden) .dlg,.gxc:not([hidden])'))return null;
  const bf=typeof BF!=='undefined'&&BF.on,ht=humanTurn();
  if(G.round===0){if(bf&&BF.seenBrief!==G.seed&&(isHuman(0)||isHuman(1)))return 'brief';
    if(G.phase==='ask'&&ht&&G.q&&(G.q.key==='rock'||G.q.key==='deploy'))return 'setup'}
  if(G.phase==='plan'){const ps=planSide();if(ps<0)return null;const my=alive().filter(s=>s.side===ps);
    if(bf&&BF.sel)return 'planMove';if(my.every(s=>UI.draft[s.id]!=null))return 'planFly';return bf?'planShip':'planMove'}
  if(!ht)return null;
  if(G.phase==='action')return bf&&BF.sub?'sub':'action';
  if(G.phase==='target')return 'target';
  if(G.phase==='amod'&&G.atk)return 'amod';
  if(G.phase==='dmod'&&G.atk)return defMods().length?'dmod':null;   // nothing to spend: the game carries on by itself
  if(G.phase==='damod'&&G.atk)return 'damod';
  if(G.phase==='ask'&&G.q)return G.q.key==='dice'?'reroll':'ask';
  return null}catch(e){return null}}
// ---------------------------------------------------------------- the suggestion (one function per phase, from the game's own advice)
const hplain=t=>{const d=document.createElement('div');d.innerHTML=String(t||'');return (d.textContent||'').replace(/[★◉✦⌖]/g,m=>m==='★'?'':m==='◉'?'focus':m==='✦'?'evade':'lock').replace(/\s+/g,' ').trim()};
const hcap=(t,n)=>{const w=hplain(t).split(' ').filter(Boolean);return w.length<=n?w.join(' '):''};
function whyDial(s,sg){const m=dialOf(s)[sg];const si=sugInfo(s,sg);const w=hplain(si.why);let t='';
  let r;
  if(r=/^puts (.+) in your arc at range (\d) while you stay out/.exec(w))t='Puts '+r[1]+' in your arc at range '+r[2]+', while you stay out of its arc.';
  else if(r=/^lines up a shot on (.+) at range (\d)/.exec(w))t='Lines up a shot on '+r[1]+' at range '+r[2]+'. It may shoot back.';
  else if(/^closes in/.test(w))t='Closes in, but stays out of their arcs.';
  else if(/^stays out of their arcs/.test(w))t='Stays out of their arcs: they must come to you.';
  else if(/^the best of the moves left/.test(w))t='The best move left, though you may end in an enemy arc.';
  else if(/^every move from here touches an asteroid/.test(w))t='Every move touches an asteroid; this one does the least harm.';
  if(t&&exColor(s,m).c==='r'&&hcap(t+' Red: stress.',15))t+=' Red: stress.';
  return hcap(t,15)}
function shotOpts(s){const o=[];for(const w of weaponsFor(s))for(const t of w.targets){const d=ship(t.id);const sd=shotDice(s,w,t,d);o.push({w,t,d,n:sd.atk,m:sd.def,e:expDmg(sd.atk,sd.def,s.focus>0||s.tl===d.id,d.focus>0)})}return o}
const hcenter=sel=>()=>hv(sel);
function hlpSuggest(){try{const ph=hlpPhase();if(!ph||!G)return null;const bf=typeof BF!=='undefined'&&BF.on;const s=G.cur&&ship(G.cur);
  if(ph==='setup'){const q=G.q,r=recOpt(q);if(!r||!r.o)return null;const el=()=>hv('.bfspot.rec');if(!el())return null;
    const why=hcap(advice().say,15)||'This spot is a good start.';return {why,target:el}}
  if(ph==='planShip'){const el=()=>hv('.bfring.need');if(!el())return null;return {why:'Tap your ship, then choose where it flies.',target:el}}
  if(ph==='planMove'){const sh=ship((bf&&BF.sel)||UI.sel);if(!sh||!sh.alive||sh.side!==planSide())return null;const sg=suggestDial(sh);if(sg==null||sg<0)return null;
    const why=whyDial(sh,sg);if(!why)return null;const el=()=>hv(bf?'.bfm.sug':'.mv.sugg');if(!el())return null;return {why,target:el}}
  if(ph==='planFly'){const el=()=>hv('[data-bf=fly],[data-a=lock]');if(!el())return null;return {why:'Every ship has a move. Tap Fly.',target:el}}
  if(ph==='action'&&s){const rec=recAct(s);if(!rec)return null;const sel=bf?`.bfact[data-bfa="${rec}"]`:`[data-act=action][data-a2="${rec}"]`;const el=()=>hv(sel);if(!el())return null;
    const mi=inArcOf(s),th=arcsOnMe(s);let why;
    if(/^RP\d/.test(rec))why='Repair the damage first. It is worth more than one focus.';
    else if(rec==='E'&&!mi.length&&th.length)why=`${shortName(th[0].e)} has you in its arc. An evade cancels a hit.`;
    else if(rec==='F'&&mi.length)why=`${shortName(mi[0].e)} is in your arc. Focus turns your focus results into hits.`;
    else if(rec==='F')why='Focus turns your focus results into hits, or evades when shot.';
    else why='An evade token cancels one hit when you are shot.';
    why=hcap(why,15)||hcap(rec==='F'?'Focus makes your focus results count.':'An evade cancels one hit.',15);return {why,target:el}}
  if(ph==='target'&&s){const o=shotOpts(s).sort((a,b)=>b.e-a.e)[0];if(!o)return null;const el=()=>hv(bf?'.bftgt.rec':'#prompt [data-act=fire].rec');if(!el())return null;
    return {why:hcap(`Range ${o.t.rg}: you roll ${o.n} attack dice, they roll ${o.m}.`,15)||`Range ${o.t.rg} is your best shot.`,target:el}}
  if((ph==='amod'||ph==='dmod')&&G.atk){const rk=recMod();if(!rk)return null;const sel=`[data-act="${G.phase}"][data-k="${rk}"]`;const el=()=>hv('#bfbtns '+sel+',#prompt '+sel);if(!el())return null;
    const W={tl:'Spend your target lock to reroll your blanks.',focus:G.phase==='amod'?'Spend focus: your focus results become hits.':'Spend focus: your focus results become evades.',evade:'Spend your evade token to cancel one more hit.',kael:'Use your pilot ability: a focus result becomes an evade.',
      done:G.phase==='amod'?'Nothing left to improve. Tap Roll.':'Every hit is already cancelled. Tap Done.'};const why=W[rk];if(!why)return null;return {why:hcap(why,15),target:el}}
  return null}catch(e){return null}}
// ---------------------------------------------------------------- wiring
let _hlpInit=false,_hlpT=0;
function hlpInit(){if(_hlpInit||typeof GXH==='undefined')return;_hlpInit=true;
  GXH.init({game:'nebula-aces',defaultOn:true,steps:HLP_STEPS,rules:HLP_RULES,avoid:'#bfhint,.bfm.sug,.bfm.on,.bfact,.bftgt,.bfring.need,.bfspot.rec,#bfbtns .btn,#bfdice .die.pick,.mv.sugg,.rec,.ps-chip.need,#prompt .btn.primary'});
  GXH.bulb({el:'#bulbbtn',suggest:hlpSuggest,rulesFor:hlpPhase});
  const m=document.getElementById('more');if(m&&!m.querySelector('.gxh-set'))m.insertAdjacentHTML('beforeend',GXH.settingsHTML({rowClass:'gxh-mrow',btnClass:'btn'}));
  setInterval(hlpAfter,300);setInterval(hlpFollow,250)}
// while the bulb's finger is up the camera or a marker may still be moving: keep the finger and ring on the suggestion
function hlpFollow(){try{const s=GXH.state().cur;if(!s||s.kind!=='bulb')return;const f=document.querySelector('.gxh-finger');if(!f)return;const sg=hlpSuggest();if(!sg){GXH.hide();return}
  const e=sg.target();if(!e)return;const r=e.getBoundingClientRect();if(Math.abs(r.left+r.width/2-(+f.dataset.tx))>2||Math.abs(r.top+r.height/2-(+f.dataset.ty))>2)GXH.relayout()}catch(err){}}
// the camera eases for half a second after a pick: show the bubble only once the board holds still
function hlpAfter(){hlpInit();if(typeof GXH==='undefined')return;if(document.hidden)return;
  const ph=hlpPhase();if(ph&&typeof V3!=='undefined'&&V3.on&&V3.ez){clearTimeout(_hlpT);_hlpT=setTimeout(hlpAfter,160);return}
  GXH.phase(ph)}
(function(){const _r=render;render=function(){const r=_r.apply(this,arguments);try{hlpAfter()}catch(e){console.error(e)}return r};try{hlpInit()}catch(e){console.error(e)}})();
