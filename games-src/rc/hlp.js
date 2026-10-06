// ===================== help (gx-help kit): coach bubbles the first time, the lightbulb on demand, pawn role icons =====================
// Bubbles: once per phase, short, pointing at the board. The bulb: the advisor's own move (recPlan for a pawn's job, aiChoose for a choice) + a short why + rules cards.
// ---------- pawn role icons: the castaway buttons show a small picture, the name is on long-press ----------
const ROLE_IC={
 carpenter:'<path d="M5 20l8-8"/><path d="M10 6l3-3 8 8-3 3z"/>',
 cook:'<path d="M5 11h14v5a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4z"/><path d="M3 11h18M9 7c0-2 3-2 3-4M15 7c0-2 3-2 3-4"/>',
 explorer:'<circle cx="12" cy="12" r="9"/><path d="M16 8l-2.2 5.8L8 16l2.2-5.8z"/>',
 soldier:'<path d="M12 3l7 3v6c0 4-3 7-7 9-4-2-7-5-7-9V6z"/><path d="M12 8v8M9 11h6"/>',
 friday:'<circle cx="12" cy="9" r="4"/><path d="M5 21c0-4 3-7 7-7s7 3 7 7"/><path d="M16 5l4-3"/>',
 dog:'<circle cx="6.5" cy="10" r="2"/><circle cx="12" cy="6.5" r="2"/><circle cx="17.5" cy="10" r="2"/><path d="M12 12c-4 0-6 3-6 5a3 3 0 0 0 3 3c1.5 0 2-1 3-1s1.5 1 3 1a3 3 0 0 0 3-3c0-2-2-5-6-5z"/>',
 helper:'<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/>'};
function roleOf(p){if(!p)return 'helper';if(p.c!=null){try{return P(p.c).k}catch(e){return 'helper'}}if(p.f)return 'friday';if(p.id==='dog')return 'dog';return 'helper'}
function pawnIcon(p){const k=roleOf(p);return '<svg class="role" viewBox="0 0 24 24" aria-hidden="true">'+(ROLE_IC[k]||ROLE_IC.helper)+'</svg>'}
// hold a pawn for half a second: its name appears on the status line
(function(){let tm=null;const stop=()=>{clearTimeout(tm);tm=null};
  document.addEventListener('pointerdown',e=>{const b=e.target.closest&&e.target.closest('.bfpw');if(!b||typeof G==='undefined'||!G)return;stop();
    tm=setTimeout(()=>{tm=null;try{const p=pawnInfo(b.dataset.pawn);if(p&&typeof BF!=='undefined'&&BF.on)BF.say(pawnNice(p),2200)}catch(err){}},450)},true);
  for(const t of['pointerup','pointercancel','pointermove'])document.addEventListener(t,stop,true)})();
// ---------------------------------------------------------------- pictures for the rules cards (inline SVG, small and flat)
const HP={
 hex:t=>'<svg viewBox="0 0 64 64"><path d="M32 6l22 13v26L32 58 10 45V19z" fill="#8fb77a" stroke="#3d5a2f" stroke-width="3" stroke-linejoin="round"/>'+(t?'<text x="32" y="40" text-anchor="middle" font-size="20" font-weight="800" fill="#1d2a14" font-family="sans-serif">'+t+'</text>':'')+'</svg>',
 pawn:c=>'<svg viewBox="0 0 64 64"><circle cx="32" cy="20" r="11" fill="'+(c||'#4f8fe6')+'" stroke="#1d2a3a" stroke-width="3"/><path d="M14 56Q32 22 50 56z" fill="'+(c||'#4f8fe6')+'" stroke="#1d2a3a" stroke-width="3" stroke-linejoin="round"/></svg>',
 pawn2:()=>'<svg viewBox="0 0 64 64"><circle cx="21" cy="22" r="9" fill="#4f8fe6" stroke="#1d2a3a" stroke-width="3"/><path d="M6 54Q21 26 36 54z" fill="#4f8fe6" stroke="#1d2a3a" stroke-width="3" stroke-linejoin="round"/><circle cx="44" cy="22" r="9" fill="#e0625c" stroke="#1d2a3a" stroke-width="3"/><path d="M29 54Q44 26 59 54z" fill="#e0625c" stroke="#1d2a3a" stroke-width="3" stroke-linejoin="round"/></svg>',
 die:n=>{const d={1:[[32,32]],2:[[20,20],[44,44]],3:[[18,18],[32,32],[46,46]]}[n]||[[32,32]];return '<svg viewBox="0 0 64 64"><rect x="10" y="10" width="44" height="44" rx="9" fill="#fffaf0" stroke="#1d2a3a" stroke-width="3"/>'+d.map(p=>'<circle cx="'+p[0]+'" cy="'+p[1]+'" r="4.5" fill="#1d2a3a"/>').join('')+'</svg>'},
 tick:()=>'<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="22" fill="#57b36a" stroke="#1d4a2a" stroke-width="3"/><path d="M20 33l8 8 17-18" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
 cross:()=>'<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="22" fill="#e0625c" stroke="#6a1a16" stroke-width="3"/><path d="M22 22l20 20M42 22L22 42" stroke="#fff" stroke-width="6" stroke-linecap="round"/></svg>',
 drop:()=>'<svg viewBox="0 0 64 64"><path d="M32 6C22 22 14 31 14 41a18 18 0 0 0 36 0C50 31 42 22 32 6z" fill="#c0392b" stroke="#5a120c" stroke-width="3" stroke-linejoin="round"/></svg>',
 ask:()=>'<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="22" fill="#e8ad45" stroke="#6b4a00" stroke-width="3"/><text x="32" y="43" text-anchor="middle" font-size="30" font-weight="800" fill="#3b2800" font-family="sans-serif">?</text></svg>',
 heart:()=>'<svg viewBox="0 0 64 64"><path d="M32 54C10 38 8 22 18 15c6-4 12-1 14 5 2-6 8-9 14-5 10 7 8 23-14 39z" fill="#e0625c" stroke="#6a1a16" stroke-width="3" stroke-linejoin="round"/></svg>',
 tent:()=>'<svg viewBox="0 0 64 64"><path d="M8 54L32 10l24 44z" fill="#e8ad45" stroke="#6b4a00" stroke-width="3" stroke-linejoin="round"/><path d="M32 54L24 54 32 30 40 54z" fill="#6b4a00"/></svg>',
 cloud:()=>'<svg viewBox="0 0 64 64"><path d="M18 42a10 10 0 0 1 2-19 14 14 0 0 1 27 3 8 8 0 0 1-1 16z" fill="#c9d6e0" stroke="#3a4a58" stroke-width="3" stroke-linejoin="round"/><path d="M22 50l-3 7M32 50l-3 7M42 50l-3 7" stroke="#4f8fe6" stroke-width="3" stroke-linecap="round"/></svg>',
 moon:()=>'<svg viewBox="0 0 64 64"><path d="M40 8a24 24 0 1 0 16 36A20 20 0 0 1 40 8z" fill="#f3e6bf" stroke="#6b5a2a" stroke-width="3" stroke-linejoin="round"/></svg>',
 wood:()=>'<svg viewBox="0 0 64 64"><rect x="8" y="22" width="48" height="22" rx="5" fill="#a8743a" stroke="#4a2f14" stroke-width="3"/><circle cx="50" cy="33" r="7" fill="#d9a766" stroke="#4a2f14" stroke-width="2.5"/></svg>',
 food:()=>'<svg viewBox="0 0 64 64"><ellipse cx="30" cy="30" rx="20" ry="16" fill="#c9783a" stroke="#5a2f10" stroke-width="3"/><path d="M46 40l10 10" stroke="#f3e6bf" stroke-width="7" stroke-linecap="round"/></svg>',
 fog:()=>'<svg viewBox="0 0 64 64"><path d="M10 26h34M18 36h38M10 46h30" stroke="#b9c4cf" stroke-width="7" stroke-linecap="round"/><path d="M32 6l18 10v14" fill="none" stroke="#5a6a78" stroke-width="3" stroke-linecap="round"/></svg>',
 scroll:()=>'<svg viewBox="0 0 64 64"><rect x="14" y="10" width="36" height="44" rx="4" fill="#fbf1d2" stroke="#8a6a1a" stroke-width="3"/><path d="M21 22h22M21 31h22M21 40h14" stroke="#7a1f31" stroke-width="3" stroke-linecap="round"/></svg>',
 btn:t=>'<svg viewBox="0 0 64 64"><rect x="4" y="20" width="56" height="24" rx="12" fill="#d98a1e" stroke="#7a4a08" stroke-width="3"/><text x="32" y="37" text-anchor="middle" font-size="12" font-weight="800" fill="#fff" font-family="sans-serif">'+t+'</text></svg>',
 tap:()=>'<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="18" fill="rgba(255,211,122,.5)" stroke="#d98a1e" stroke-width="4"/><path d="M30 14v26l-6-5-4 4 14 14h14l4-20-8-2-4-4-4 1-2-4z" fill="#fff" stroke="#231a10" stroke-width="2.5" stroke-linejoin="round"/></svg>',
 role:k=>'<svg viewBox="0 0 24 24" style="stroke:#1d2a3a;fill:none;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round;background:#fffaf0;border-radius:50%;border:3px solid #4f8fe6;padding:9px;box-sizing:border-box">'+ROLE_IC[k]+'</svg>'
};
function hpics(items){return '<div class="gxh-pics">'+items.map(it=>it==='>'?'<span class="gxh-ar">&rarr;</span>':'<figure>'+(HP[it[0]]?HP[it[0]](it[2]):'')+(it[1]?'<figcaption>'+it[1]+'</figcaption>':'')+'</figure>').join('')+'</div>'}
// ---------------------------------------------------------------- where each bubble points
const hq=s=>()=>document.querySelector(s);
const hfirst=(...sels)=>()=>{for(const s of sels){const e=document.querySelector(s);if(e&&e.getBoundingClientRect().width)return e}return null};
const hpt=p=>p?{left:p.ox+p.x-26,top:p.oy+p.y-26,width:52,height:52}:null;
const hlpOpts=()=>{const q=G&&G.q;return q&&humanQ()?q:null};
// the glowing place a bubble points at: the recommended one, else the first
function hlpJobTarget(){try{const cur=curPawn();const rt=cur&&BF.recTile(cur);if(rt){const r=hpt(BF.tilePt(rt.id));if(r)return r}}catch(e){}
  return hfirst('#bfglow .bfgl','#bf .bfpw.on')()}
function hlpPostTarget(){try{const o=BF.posQ();if(o){const r=hpt(BF.tilePt(o[0].pos));if(r)return r}}catch(e){}return hfirst('#bfglow .bfgl')()}
const HLP_STEPS={
 job:{target:hlpJobTarget,title:'Give a job',text:'Tap a glowing place on the island to send this castaway to work there.',pic:()=>HP.tap()},
 ready:{target:hfirst('#bf .btn.go'),title:'Start the day',text:'Every pawn has a job. Check the chips on the island, then tap Start day.',pic:()=>HP.btn('Start')},
 confirm:{target:hfirst('#bf .btn.go','#bf .btn'),title:'Start anyway?',text:'Something is not covered today. Go back to fix it, or start anyway.',pic:()=>HP.cross()},
 place:{target:hlpPostTarget,title:'Choose a place',text:'The fog has to settle somewhere. Tap a glowing place on the island.',pic:()=>HP.fog()},
 choice:{target:hfirst('#bf .bf-opts','#story .opts'),title:'Your choice',text:'Tap one button. The card text explains what each option does.',pic:()=>HP.scroll()},
 dice:{target:hfirst('#bf .bf-opts','#story .opts'),title:'Keep this roll?',text:'Keep the dice as they fell, or tap an option to fix a die.',pic:()=>HP.die(3)},
 intro:{target:hfirst('#bf .btn.go','#story .sctl .btn.go'),title:'The story',text:'Read the scene, then tap Continue. Your goal is under the i button.',pic:()=>HP.scroll()},
 daysum:{target:hfirst('#bf .btn.go','#story .sctl .btn.go'),title:'End of day',text:'See what changed today. Then tap Start day to plan the next one.',pic:()=>HP.moon()}
};
// ---------------------------------------------------------------- the rules cards (<= 20 words each, a picture each)
const HLP_RULES=[
 {title:'The goal',text:'Meet your chapter\'s goal before the last day. If any castaway dies, everyone loses.',pic:()=>hpics([['tent','Camp'],'>',['tick','Rescued']])},
 {title:'One day',text:'Plan a job for every pawn, then watch the day play out. Night brings hunger and weather.',pic:()=>hpics([['pawn','Plan'],'>',['die','Work',2],'>',['moon','Night']])},
 {title:'Pawns and dice',text:'One pawn on a job rolls dice and can fail. Add a second pawn to make it sure.',pic:()=>hpics([['pawn','One: dice'],['pawn2','Two: sure']])},
 {phase:'job',title:'Give every pawn a job',text:'Tap a glowing place to send the castaway there. Tap a place with one job to place it at once.',pic:()=>hpics([['pawn','Pawn'],'>',['hex','Place']])},
 {phase:'job',title:'Risk and sure things',text:'A lone pawn rolls dice and may fail or get hurt. Two pawns on a job never roll.',pic:()=>hpics([['die','Alone',2],'>',['cross','May fail'],['pawn2','Two'],'>',['tick','Sure']])},
 {phase:'job',title:'Far places cost more',text:'A place two steps from camp needs one extra pawn. Explore unknown places to reveal new land.',pic:()=>hpics([['tent','Camp'],'>',['hex','Near'],'>',['hex','Far +1']])},
 {phase:'job',title:'Hold a pawn',text:'Hold a round pawn button to see its name. A helper pawn can only join a job someone else leads.',pic:()=>hpics([['role','Castaway','carpenter'],['role','Helper','helper']])},
 {phase:'ready',title:'Read the chips',text:'Chips on the island show each job: a tick is sure, a die rolls, red needs more pawns.',pic:()=>hpics([['tick','Sure'],['die','Dice',2],['cross','Needs +1']])},
 {phase:'ready',title:'Change your mind',text:'Tap a chip on the island to take back its last pawn. Then give that pawn a new job.',pic:()=>hpics([['pawn','Take back'],'>',['hex','New job']])},
 {phase:'ready',title:'Start the day',text:'Press Start day. The plan is fixed, then the day plays out as a story.',pic:()=>hpics([['btn','Start day'],'>',['scroll','Story']])},
 {phase:'confirm',title:'Not everything is covered',text:'A warning means something may go wrong tonight, such as hunger. Go back to fix it, or start anyway.',pic:()=>hpics([['cross','Warning'],'>',['moon','Tonight']])},
 {phase:'confirm',title:'Hunger hurts',text:'At night everyone eats 1 food. A hungry castaway takes 2 wounds. Plan food every day.',pic:()=>hpics([['food','1 food'],'>',['heart','Each night']])},
 {phase:'place',title:'Choose a place',text:'The game asks where. Tap one of the glowing places on the island to choose it.',pic:()=>hpics([['hex','Choose'],'>',['fog','Fog']])},
 {phase:'place',title:'What fog does',text:'A fogged place needs one extra pawn and hides its land. Pick a place you need least.',pic:()=>hpics([['fog','Fog'],'>',['pawn','+1 pawn']])},
 {phase:'choice',title:'Your choice',text:'Tap one button. Read the card text first: it explains what each option does.',pic:()=>hpics([['scroll','Read'],'>',['tap','Tap']])},
 {phase:'choice',title:'Wounds and life',text:'Each castaway can take wounds until their life runs out. Protect the hurt ones.',pic:()=>hpics([['heart','Life'],'>',['drop','Wounds']])},
 {phase:'dice',title:'The three dice',text:'Tick: the job worked. Blood drop: a wound. Question mark: you draw an adventure card.',pic:()=>hpics([['tick','Worked'],['drop','Wound'],['ask','Adventure']])},
 {phase:'dice',title:'Keep or fix',text:'You may keep the roll, or use an item or skill to roll a die again.',pic:()=>hpics([['die','Roll',3],'>',['die','Again',1]])},
 {phase:'dice',title:'Failing helps a little',text:'A failed job gives its castaway 2 determination, which pays for skills.',pic:()=>hpics([['cross','Failed'],'>',['scroll','+2 skill points']])},
 {phase:'intro',title:'The story',text:'Each scene sets up the day. Tap Continue to read on, or the fast-forward button to skip.',pic:()=>hpics([['scroll','Scene'],'>',['btn','Continue']])},
 {phase:'intro',title:'Where is my goal?',text:'Tap the i button for your goal. Tap the top chip for food, wood and life.',pic:()=>hpics([['tent','Camp status'],['scroll','Goal']])},
 {phase:'daysum',title:'End of the day',text:'This shows what changed and why. Check your food, wood and the castaways\' life.',pic:()=>hpics([['food','Food'],['wood','Wood'],['heart','Life']])},
 {phase:'daysum',title:'Plan again',text:'Tap Start day to plan the next day. Fix whatever hurt you most today.',pic:()=>hpics([['moon','Night'],'>',['pawn','New plan']])},
 {phase:'beatEvent',title:'Morning event',text:'An event card comes each morning. Its threat waits in a slot and strikes later unless you send pawns.',pic:()=>hpics([['scroll','Event'],'>',['cross','Threat']])},
 {phase:'beatEvent',title:'Morale',text:'Each morning the first player gains or loses determination, which pays for skills. Low morale costs it, then wounds.',pic:()=>hpics([['heart','Morale'],'>',['scroll','Skills']])},
 {phase:'beatEvent',title:'Camp production',text:'Your camp\'s place gives its food and wood every morning, for free.',pic:()=>hpics([['tent','Camp'],'>',['food','Food'],['wood','Wood']])},
 {phase:'beatWork',title:'Jobs play out',text:'Jobs play one by one. The food and wood you win arrive in the evening.',pic:()=>hpics([['pawn','Work'],'>',['food','Food'],['wood','Wood']])},
 {phase:'beatWork',title:'The dice',text:'Tick: the job worked. Blood drop: a wound. Question mark: an adventure card. Two pawns mean no dice.',pic:()=>hpics([['tick','Worked'],['drop','Wound'],['ask','Adventure']])},
 {phase:'beatWeather',title:'Weather',text:'Each cloud above your roof ruins 1 food and 1 wood. Snow also needs 1 wood each to keep warm.',pic:()=>hpics([['cloud','Cloud'],'>',['food','-1'],['wood','-1']])},
 {phase:'beatWeather',title:'Roof and palisade',text:'Build the roof before the rain. Build the palisade before storms: each level soaks up one hit.',pic:()=>hpics([['tent','Roof'],'>',['cloud','Soaked up']])},
 {phase:'beatNight',title:'Night',text:'Everyone eats 1 food. Anyone hungry takes 2 wounds. Without a shelter, everyone takes 1 wound.',pic:()=>hpics([['moon','Night'],'>',['food','Eat'],['heart','Wounds']])},
 {phase:'beatNight',title:'Build a shelter early',text:'Build a shelter on day 1 or 2. It costs 2 wood and spares everyone a wound each night.',pic:()=>hpics([['tent','Shelter'],'>',['heart','Safe']])}
];
// ---------------------------------------------------------------- phases
const hnet=()=>typeof NET!=='undefined'&&NET.on;
// the phase the player is deciding in (null when there is nothing to decide)
function hlpPhase(){try{if(!G||typeof UI==='undefined'||UI.modal||G.over||hnet()||allAI())return null;
  if(storyActive()){const i=storyIdx();if(i<0)return null;const b=UI.beats[i];const last=i>=UI.beats.length-1;
    if(last&&humanQ()){if(BF.on&&typeof PHO!=='undefined'&&PHO.on&&BF.posQ())return 'place';return G.q.kind==='dice'?'dice':'choice'}
    if(b.kind==='intro')return 'intro';if(b.kind==='daysum')return 'daysum';return null}
  if(planOpen()&&BF.on){if(UI.confirm)return 'confirm';return curPawn()?'job':'ready'}
  return null}catch(e){return null}}
// the rules cards the bulb opens: the decision's own, or (while a scene plays) the scene's
function hlpRulesPhase(){const ph=hlpPhase();if(ph)return ph;
  try{if(!G||UI.modal||G.over||!storyActive())return null;const b=UI.beats[storyIdx()];if(!b)return null;
    if(['dawn','event','threat','morning','prod'].includes(b.kind))return 'beatEvent';
    if(['go','act','finds','adventure','mystery','fight'].includes(b.kind))return 'beatWork';
    if(b.kind==='weather')return 'beatWeather';if(b.kind==='night')return 'beatNight'}catch(e){}return null}
// ---------------------------------------------------------------- the lightbulb: what the game's own advisor would do
const wcount=t=>String(t||'').replace(/[^a-zA-Z0-9'’+]+/g,' ').trim().split(' ').filter(Boolean).length;
const cap15=t=>{t=String(t||'').replace(/\s+/g,' ').trim();return t&&wcount(t)<=15?t:''};
// the plan for the pawn in hand: the same recommended job the glowing star and the ghost finger use
function hlpPlan(){if(!BF.on||PHO.st!=='plan2'||UI.confirm)return null;const cur=curPawn();if(!cur)return null;
  const rt=BF.recTile(cur);if(!rt)return null;const p=BF.tilePt(rt.id);if(!p)return null;
  const fromEl=document.querySelector('#bf [data-pawn="'+cur.id+'"]');
  const rowEl=PHO.pop&&PHO.pop.k==='tile'&&PHO.pop.id===rt.id?document.querySelector('#ppop [data-rec="1"]'):null;
  return {id:rt.id,rec:rt.rec,cur,to:{x:p.ox+p.x,y:p.oy+p.y},fromEl,rowEl}}
function whyJob(rec){return cap15(rec.label+(rec.why?': '+rec.why:''))||cap15(rec.why)||cap15(rec.label)||cap15('The advisor\'s best job for this pawn.')}
// the choice the computer would make for the human's question
function hlpChoice(){const q=hlpOpts();if(!q||!q.opts||q.opts.length<2)return null;let i=-1;try{i=aiChoose(q.title,q.opts,P(q.who),q)}catch(e){return null}
  if(!(i>=0&&i<q.opts.length))return null;return {i,o:q.opts[i],q}}
function whyChoice(c){const k=c.q.kind,l=String(c.o.l||'').replace(/[.]+$/,'');
  if(k==='dice')return /success die/.test(l)?'Rolling the failed success die again can save the job.':/wound die/.test(l)?'Rolling the wound die again protects a castaway with low life.':'Keeping the roll is best here.';
  if(k==='fog')return 'The fog hurts this place least.';
  return cap15('The computer\'s pick: '+l)||'The computer picks this option here.'}
const hbtn=i=>()=>document.querySelector('#bf [data-ans="'+i+'"]')||document.querySelector('#story [data-ans="'+i+'"]');
function hlpSuggest(){try{const ph=hlpPhase();if(!ph||typeof UI==='undefined')return null;
  if(ph==='job'){const p=hlpPlan();if(!p)return null;const why=whyJob(p.rec);if(!why)return null;
    return {why,key:'job:'+p.cur.id+':'+p.id,target:()=>{const q=hlpPlan();return q?(q.rowEl||{x:q.to.x,y:q.to.y}):null},from:()=>{const q=hlpPlan();return q&&q.fromEl}}}
  if(ph==='ready'){const pb=planProblems();
    if(!pb.length)return {why:'Every pawn has a job. Start the day.',key:'ready',target:hfirst('#bf .btn.go')};
    const bad=document.querySelector('#bf .bfpw.bad');const why=cap15(pb[0]);if(bad&&why&&badActs().size)return {why,key:'fix',target:()=>document.querySelector('#bf .bfpw.bad')};return null}
  if(ph==='place'){const c=hlpChoice();if(!c||c.o.pos==null)return null;const t=()=>hpt(BF.tilePt(c.o.pos));if(!t())return null;return {why:whyChoice(c),key:'pos:'+c.i,target:t}}
  if(ph==='choice'||ph==='dice'){const c=hlpChoice();if(!c)return null;return {why:whyChoice(c),key:'ans:'+c.i,target:hbtn(c.i)}}
  return null}catch(e){console.warn('hlpSuggest',e);return null}}
// ---------------------------------------------------------------- wiring
let _hlpInit=false;
function hlpInit(){if(_hlpInit||typeof GXH==='undefined')return;_hlpInit=true;
  GXH.init({game:'shipwreck-isle',defaultOn:true,steps:HLP_STEPS,rules:HLP_RULES,avoid:'.bfgl,#bf .bfpw,#bf .btn,#bf .opt,.bfa,.bfcard,#ppop .bfr,#bfzoom .gx-ibtn'});
  GXH.bulb({el:'#bulbbtn',suggest:hlpSuggest,rulesFor:hlpRulesPhase});
  for(const [sel,pos] of [['#hlpset',null],['#rulesd .gx-drawer-head','afterend']]){const e=document.querySelector(sel);if(!e)continue;
    if(!pos)e.innerHTML=GXH.settingsHTML();else{const d=document.createElement('div');d.className='hlp-rules-set';d.innerHTML=GXH.settingsHTML();e.insertAdjacentElement(pos,d)}}}
// no bubble while something else is open on top of the island (a pop-up, a drawer, the start or end screen)
const hlpBusy=()=>!!(!G||UI.modal||G.over||(typeof GX!=='undefined'&&GX.open)||(typeof PHO!=='undefined'&&(PHO.pop||PHO.zoom)));
function hlpAfter(){hlpInit();if(typeof GXH==='undefined'||!G)return;
  if(UI.guide&&UI.guide.on&&!UI.guide.kit){UI.guide.kit=1;GXH.setEnabled(true);GXH.reset()}   // the guided game: every bubble again
  GXH.phase(hlpBusy()?null:hlpPhase())}
{const s0=PHO.sync;PHO.sync=function(){const r=s0.apply(this,arguments);try{hlpAfter()}catch(e){console.error(e)}return r}}
