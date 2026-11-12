// ===================== Learn to play: a guided first game (W493). One short line + one highlighted tap per step, in rule order, then a real game.
// Runs on the staged deal of tutor.js (tutBegin: Marooned, Carpenter + Cook + Friday, kind decks, Chill Rain on day 2).
// Day 1: goal, death, the six phases, no event yet, morale, production, pawns, explore (1 pawn = dice, 2 = sure), build a shelter,
// make an invention (Shovel), Start day, weather vs roof, night (eat or 2 wounds, no shelter = 1 wound), wounds.
// Day 2: event card, adventure token, threat (Dig a Drain needs the Shovel), morale, gather, rest, a real hunt (one beast seeded), rain cloud. Day 3: tidy the camp.
// Then the end card: Keep playing turns it into a normal game. Only the highlighted thing answers while a step shows; scenes nobody explains play by themselves.
// window.GXGUIDE = {running, step, seen:[ids], rules:[ids], done}.  ?coach=1 keeps the older coached game.
const GUIDE={on:false,i:0,seen:[],t:0,shown:null,tapped:false,done:false,exp:null,tips:null};
const gdq=s=>document.querySelector(s);
const gBeat=()=>{try{if(!G||PHO.st!=='story')return null;const i=storyIdx();const b=i>=0?UI.beats[i]:null;return b?b.kind:null}catch(e){return null}};
const gPlan=()=>{try{return !!G&&PHO.st==='plan2'}catch(e){return false}};
const gPop=()=>{try{return PHO.pop&&PHO.pop.k==='tile'?PHO.pop.id:null}catch(e){return null}};
const gRes=n=>gdq('#bfres .tk:nth-child('+n+')');
const gPawn=id=>gdq('#bf .bfpw[data-pawn="'+id+'"]');
const gFri=()=>{for(const e of document.querySelectorAll('#bf .bfpw[data-pawn]'))if(/^Friday/.test(e.title||''))return e;return null};
const gGlow=t=>gdq('#bfglow .bfgl[data-t="'+t+'"]');
const gNext=()=>gdq('#bf [data-a=next]');
const gRow=(type,k)=>{for(const e of document.querySelectorAll('#ppop .bfr[data-place]')){let o=null;try{o=JSON.parse(decodeURIComponent(e.dataset.place))}catch(err){}if(!o||o.type!==type)continue;if(k==null||o.tgt&&(o.tgt.k===k||o.tgt===k))return e}return null};
const gAct=(type,k)=>{try{return G.plan.acts.find(a=>a.pw.length&&a.type===type&&(k==null||a.tgt&&a.tgt.k===k))||null}catch(e){return null}};
const gCamp=()=>{try{return G.camp.pos}catch(e){return -1}};
const gExp=()=>{if(GUIDE.exp!=null)return GUIDE.exp;try{const c=gCamp();for(const e of document.querySelectorAll('#bfglow .bfgl')){const t=+e.dataset.t;if(t!==c&&!tileAt(t)){GUIDE.exp=t;return t}}}catch(e){}return null};
// day 3's real roll: another unknown place next to the camp (one pawn there rolls), and the scene that shows a roll
const gExp2=()=>{if(GUIDE.exp2!=null&&!tileAt(GUIDE.exp2))return GUIDE.exp2;try{const c=gCamp();let best=null;for(const e of document.querySelectorAll('#bfglow .bfgl')){const t=+e.dataset.t;if(t===c||tileAt(t))continue;const n=actNeed({type:'explore',tgt:t,pw:[]}).need;if(best==null||n<best.n)best={t,n}}if(best){GUIDE.exp2=best.t;return best.t}}catch(e){}return null};
const gDiceBeat=()=>{try{const i=storyIdx();const b=UI.beats[i];return !!(b&&b.kind==='act'&&b.data&&b.data.dice&&b.data.type==='explore')}catch(e){return false}};
const gPicked=id=>{try{return UI.sel===id||(gPawn(id)||{}).classList.contains('on')}catch(e){return false}};
// kind: 'info' = tap the highlight to go on (the tap does nothing else); 'pass' = the tap also does its normal job; 'act' = done when the game state says so.
// beat: the step waits for that scene and holds it on screen. Every line: one sentence, 12 words or fewer.
const GUIDE_STEPS=[
 {id:'goal',day:1,rule:'goal',kind:'info',say:'Day 1 of 12. Light a fire and stack 15 wood.',tgt:()=>gRes(1)},
 {id:'death',day:1,rule:'death',kind:'info',say:'Life left. If any castaway dies, everyone loses.',tgt:()=>gRes(4)},
 {id:'phases',day:1,rule:'phases',kind:'info',say:'Every day: event, morale, production, action, weather, night.',tgt:()=>gdq('#phlabel')},
 {id:'event0',day:1,rule:'event',kind:'info',say:'Day 1 has no event card. One comes each day after.',tgt:()=>null},
 {id:'morale0',day:1,rule:'morale',kind:'info',say:'Morale gives or takes determination ✊ each morning.',tgt:()=>null},
 {id:'prod',day:1,rule:'production',kind:'info',say:'Production: the camp gives 1 food and 1 wood.',tgt:()=>gRes(2)},
 {id:'pawns',day:1,rule:'pawns',when:gPlan,kind:'pass',say:'Each castaway has 2 pawns. Tap the Carpenter.',tgt:()=>gPawn('c0_0'),done:()=>gPicked('c0_0')},
 {id:'explore',day:1,rule:'explore',when:gPlan,kind:'act',say:'Tap a glowing unknown place. One pawn there rolls dice.',tgt:()=>gGlow(gExp()),done:()=>gPop()===gExp()||!!gAct('explore')},
 {id:'one',day:1,rule:'dice',when:gPlan,skip:()=>!!gAct('explore'),kind:'act',say:'Explore. One pawn alone rolls the dice.',tgt:()=>gRow('explore'),done:()=>!!gAct('explore')},
 {id:'dice',day:1,rule:'dice',when:gPlan,kind:'info',say:'Dice can fail, wound you, or start an adventure.',tgt:()=>gdq('#bfchips .bfg[data-t="'+gExp()+'"]')},
 {id:'pawn2',day:1,rule:'sure',when:gPlan,kind:'pass',say:'Now tap the Carpenter’s second pawn.',tgt:()=>gPawn('c0_1'),done:()=>gPicked('c0_1')},
 {id:'same',day:1,rule:'sure',when:gPlan,kind:'act',say:'Tap the same place. Two pawns never roll: a sure success.',tgt:()=>gGlow(gExp()),done:()=>{const a=gAct('explore');return gPop()===gExp()||!!a&&a.pw.length>=2}},
 {id:'sure',day:1,rule:'sure',when:gPlan,skip:()=>{const a=gAct('explore');return !!a&&a.pw.length>=2},kind:'act',say:'Join in. Two pawns never roll: a sure success.',tgt:()=>gRow('explore'),done:()=>{const a=gAct('explore');return !!a&&a.pw.length>=2}},
 {sel:'c1_0',id:'camp1',day:1,rule:'build',when:gPlan,kind:'act',say:'The Cook joins. Tap the camp. Building happens there.',tgt:()=>gGlow(gCamp()),done:()=>gPop()===gCamp()},
 {id:'shelter',day:1,rule:'shelter',when:gPlan,kind:'act',say:'Build a shelter for 2 wood. It stops night wounds.',tgt:()=>gRow('build','shelter'),done:()=>!!gAct('build','shelter')},
 {sel:'c1_1',id:'camp2',day:1,rule:'invention',when:gPlan,kind:'act',say:'Tap the camp again.',tgt:()=>gGlow(gCamp()),done:()=>gPop()===gCamp()},
 {id:'shovel',day:1,rule:'invention',when:gPlan,kind:'act',say:'Inventions are tools. Make the Shovel; the beach allows it.',tgt:()=>gRow('build','shovel'),done:()=>!!gAct('build','shovel')},
 {sel:'FRI',id:'camp3',day:1,rule:'invention',when:gPlan,kind:'act',say:'Friday helps. Tap the camp once more.',tgt:()=>gGlow(gCamp()),done:()=>gPop()===gCamp()},
 {id:'shovel2',day:1,rule:'invention',when:gPlan,kind:'act',say:'Help with the Shovel, so it surely gets made.',tgt:()=>gRow('build','shovel'),done:()=>{const a=gAct('build','shovel');return !!a&&a.pw.length>=2}},
 {id:'go',day:1,rule:'action',when:gPlan,kind:'act',say:'Every pawn has a job. Tap Start day.',tgt:()=>gdq('#bf [data-a=go]'),done:()=>!gPlan()},
 {id:'weather',day:1,rule:'weather',beat:'weather',kind:'act',say:'Weather: each cloud above your roof ruins food and wood.',tgt:gNext,done:()=>gBeat()!=='weather'},
 {id:'eat',day:1,rule:'night',beat:'night',kind:'info',say:'Night: each castaway eats 1 food, or takes 2 wounds.',tgt:()=>gRes(2)},
 {id:'outside',day:1,rule:'night',beat:'night',kind:'info',say:'No shelter? Everyone takes 1 wound sleeping outside.',tgt:()=>gRes(5)},
 {id:'wounds',day:1,rule:'wounds',beat:'daysum',kind:'info',say:'Wounds use up life. Life at zero means death.',tgt:()=>gRes(4)},
 {id:'event',day:2,rule:'event',beat:'event',kind:'info',say:'An event card. Its effect happens right now.',tgt:()=>gdq('#bfcard')},
 {id:'adv',day:2,rule:'adventure',beat:'event',kind:'info',say:'Its ? token: the next explore draws an adventure card.',tgt:()=>gdq('#bfcard')},
 {id:'threat',day:2,rule:'threat',beat:'event',kind:'info',say:'Then this card waits as a threat. Deal with it in time.',tgt:()=>gdq('#bfcard')},
 {id:'morale',day:2,rule:'morale',when:()=>gDay()===2,kind:'info',say:'Morale: high morale gives determination, low takes it.',tgt:()=>null},
 {sel:'c0_0',id:'t2',day:2,rule:'threat',when:gPlan,kind:'act',say:'Tap the camp. Threats are handled there.',tgt:()=>gGlow(gCamp()),done:()=>gPop()===gCamp()},
 {id:'t3',day:2,rule:'threat',when:gPlan,kind:'act',say:'Dig a Drain with the Shovel. The threat is gone.',tgt:()=>gRow('threat'),done:()=>!!gAct('threat')},
 {sel:'c1_0',id:'g2',day:2,rule:'gather',when:gPlan,kind:'act',say:'Tap the land you found yesterday.',tgt:()=>gGlow(gExp()),done:()=>gPop()===gExp()},
 {id:'g3',day:2,rule:'gather',when:gPlan,skip:()=>!!gAct('gather'),kind:'act',say:'Gather fish. Food and wood arrive after all jobs.',tgt:()=>{let f=null;for(const e of document.querySelectorAll('#ppop .bfr[data-place]'))if(/fish|food/i.test(e.textContent)&&/gather/.test(decodeURIComponent(e.dataset.place)))f=f||e;return f||gRow('gather')},done:()=>!!gAct('gather')},
 {sel:'c1_1',id:'r2',day:2,rule:'rest',when:gPlan,kind:'act',say:'Tap the camp.',tgt:()=>gGlow(gCamp()),done:()=>gPop()===gCamp()},
 {id:'r3',day:2,rule:'rest',when:gPlan,kind:'act',say:'Rest heals 1 wound.',tgt:()=>gRow('rest'),done:()=>!!gAct('rest')},
 {sel:'c0_1',id:'h2',day:2,rule:'hunt',when:gPlan,kind:'act',say:'A beast was spotted. Tap the camp. Hunts start there.',tgt:()=>gGlow(gCamp()),done:()=>gPop()===gCamp()},
 {id:'h3',day:2,rule:'hunt',when:gPlan,kind:'act',say:'Hunt. Each point your weapon is short costs a wound.',tgt:()=>gRow('hunt'),done:()=>!!gAct('hunt')||(()=>{try{return G.plan.acts.some(a=>a.type==='hunt'&&a.pw.length)}catch(e){return false}})()},
 {sel:'FRI',id:'h5',day:2,rule:'hunt',when:gPlan,kind:'act',say:'A hunt needs 2 pawns: Friday joins. Tap the camp.',tgt:()=>gGlow(gCamp()),done:()=>{const a=gAct('hunt');return gPop()===gCamp()||!!a&&a.pw.length>=2}},
 {id:'h6',day:2,rule:'hunt',when:gPlan,kind:'act',skip:()=>{const a=gAct('hunt');return !!a&&a.pw.length>=2},say:'Join the hunt. No dice: weapon against strength.',tgt:()=>gRow('hunt'),done:()=>{const a=gAct('hunt');return !!a&&a.pw.length>=2}},
 {id:'go2',day:2,rule:'action',when:gPlan,kind:'act',say:'Every pawn has a job. Tap Start day.',tgt:()=>gdq('#bf [data-a=go]'),done:()=>!gPlan()},
 {id:'rain',day:2,rule:'roof',beat:'weather',kind:'act',say:'Rain cloud, no roof: lose 1 food and 1 wood.',tgt:gNext,done:()=>gBeat()!=='weather'},
 {sel:'c0_1',id:'c2',day:3,rule:'camp',when:gPlan,kind:'act',say:'Tap the camp.',tgt:()=>gGlow(gCamp()),done:()=>gPop()===gCamp()},
 {id:'c3',day:3,rule:'camp',when:gPlan,kind:'act',say:'Tidy the camp: 2 determination and morale up.',tgt:()=>gRow('camp'),done:()=>!!gAct('camp')},
 {sel:'c0_0',id:'x2',day:3,rule:'roll',when:gPlan,kind:'act',say:'A real roll: tap this unknown place, and go alone.',tgt:()=>gGlow(gExp2()),done:()=>gPop()===gExp2()||!!gAct('explore')},
 {id:'x3',day:3,rule:'roll',when:gPlan,skip:()=>!!gAct('explore'),kind:'act',say:'Explore alone. The ? token adds an adventure card.',tgt:()=>gRow('explore'),done:()=>!!gAct('explore')},
 {id:'x4',day:3,rule:'roll',when:gPlan,kind:'act',say:'Tap ✨ to give the other pawns jobs.',tgt:()=>gdq('#bf [data-a=suggest]'),done:()=>{try{return !planProblems().length}catch(e){return false}}},
 {id:'go3',day:3,rule:'roll',when:gPlan,kind:'act',say:'Tap Start day and watch the dice.',tgt:()=>gdq('#bf [data-a=go]'),done:()=>!gPlan()},
 {id:'roll',day:3,rule:'roll',beat:'act',when:gDiceBeat,kind:'info',say:'The dice: ✔ success, 🩸 a wound, ❓ an adventure.',tgt:()=>null},
 {id:'advc',day:3,rule:'adventure',beat:'adventure',kind:'info',say:'The ? token drew this adventure card. It happens now.',tgt:()=>gdq('#bfcard')},
 {id:'end',day:3,rule:'real',beat:'daysum',kind:'info',say:'That is every rule. Play on, or start a real game!',tgt:()=>null}
];
const GUIDE_RULES=[...new Set(GUIDE_STEPS.map(s=>s.rule))];
window.GXGUIDE={get running(){return GUIDE.on},get step(){const s=GUIDE_STEPS[GUIDE.i];return s?s.id:null},get seen(){return GUIDE.seen.slice()},rules:GUIDE_RULES,steps:GUIDE_STEPS.map(s=>({id:s.id,rule:s.rule,say:s.say})),get done(){return GUIDE.done}};
function gEl(){let e=gdq('#coachb');if(!e){coachEl();e=gdq('#coachb')}return e}
function gRing(){let r=gdq('#tutring');if(!r){r=document.createElement('div');r.id='tutring';r.setAttribute('aria-hidden','true');document.body.appendChild(r)}return r}
const gCur=()=>GUIDE.on?GUIDE_STEPS[GUIDE.i]:null;
// is the current step on screen (its scene or moment has come)?
const GORD={dawn:0,event:1,threat:1,morning:2,prod:3,plan:4,go:5,act:5,adventure:5,mystery:5,fight:5,finds:6,weather:7,night:8,daysum:9};
function gDay(){try{if(PHO.st==='story'){for(let i=storyIdx();i>=0;i--){const b=UI.beats[i];if(b&&b.kind==='dawn'&&b.data)return b.data.round}}return G.round}catch(e){return 0}}
const gNow=()=>gPlan()?'plan':gBeat();
function gReady(s){if(!s||!G||G.over)return false;if(UI.modal)return false;if(gDay()!==s.day)return false;if(s.beat)return gBeat()===s.beat&&(!s.when||!!s.when());if(s.when){let ok=false;try{ok=!!s.when()}catch(e){}if(!ok)return false}return true}
// a scene step whose scene has already gone by (or never shows, like calm weather) is passed over
function gPassed(s){if(!s.beat||GUIDE.shown===s.id)return false;const d=gDay();if(d>s.day)return true;const n=gNow();return d===s.day&&n!=null&&GORD[n]!=null&&GORD[n]>GORD[s.beat]}
function gTarget(s){let el=null;try{el=s.tgt&&s.tgt()}catch(e){el=null}if(el&&el.getBoundingClientRect){const r=el.getBoundingClientRect();if(r.width>2&&r.height>2&&!(el.closest&&el.closest('[hidden]')))return el}return null}
// the scene a step explains waits on screen until the step is done (bf.js asks tutClaimed before auto-advancing a scene)
function tutClaimed(i){if(!GUIDE.on)return false;const s=gCur();if(!s)return false;if(GUIDE.shown===s.id)return true;
  // a scene that one of the next steps explains waits too (the scenes play by themselves in the guided game)
  try{const k=UI.beats[i]&&UI.beats[i].kind;for(let j=GUIDE.i+1;j<Math.min(GUIDE_STEPS.length,GUIDE.i+4);j++){const t=GUIDE_STEPS[j];if(t.day===gDay()&&t.beat===k)return true}}catch(e){}
  try{const k=UI.beats[i]&&UI.beats[i].kind;if(s.day!==gDay())return false;if(s.beat)return k===s.beat&&(!s.when||!!s.when());return s.kind==='info'&&!s.when}catch(e){return false}}
function gAdvance(){try{if(typeof V3!=='undefined'){V3.pts&&V3.pts.clear();V3.drag=null;V3.pinch=null}}catch(e){}const s=gCur();if(s&&!GUIDE.seen.includes(s.id))GUIDE.seen.push(s.id);GUIDE.i++;GUIDE.shown=null;GUIDE.tapped=false;gHide();
  if(GUIDE.i>=GUIDE_STEPS.length)gFinish();else setTimeout(gTick,30)}
function gHide(){const e=gdq('#coachb');if(e&&e.classList.contains('guide')){e.hidden=true;e.classList.remove('guide')}const r=gdq('#tutring');if(r)r.hidden=true;document.body.classList.remove('guiding')}
function gSel(s){if(!s||!s.sel||GUIDE.selDone===s.id)return;GUIDE.selDone=s.id;try{let id=s.sel;if(id==='FRI'){const f=gFri();id=f&&f.dataset.pawn}if(id&&!placedIds().has(id)){UI.sel=id;refresh()}}catch(e){}}
function gShow(s,el){const e=gEl();const r=gRing();e.classList.add('guide');e.hidden=false;e.dataset.rule=s.rule;e.dataset.step=s.id;e.dataset.kind='guide';
  const n=GUIDE.i+1,N=GUIDE_STEPS.length;
  e.innerHTML='<b class="cn">'+n+'/'+N+'</b><span class="ct"></span>'+(el&&s.kind!=='info'?'':'<button type="button" class="gnext" data-guide="next">Next ▶</button>');e.querySelector('.ct').textContent=s.say;
  if(el&&el.closest&&el.closest('#ppop')){try{el.scrollIntoView({block:'center'})}catch(err){}}
  const tgt=el||e.querySelector('.gnext');const tr=tgt.getBoundingClientRect();const pad=6;
  r.hidden=false;r.style.left=(tr.left-pad)+'px';r.style.top=(tr.top-pad)+'px';r.style.width=(tr.width+pad*2)+'px';r.style.height=(tr.height+pad*2)+'px';
  document.body.classList.add('guiding');
  // the bubble sits away from the highlight
  const pp=el&&el.closest&&el.closest('#ppop');   // G6 review: inside a place's job list the bubble sits outside the list, never over its rows
  if(pp){const h=innerHeight,pr=pp.getBoundingClientRect();if(pr.top>110){e.style.top='auto';e.style.bottom=(h-pr.top+8)+'px'}else{e.style.bottom='auto';e.style.top=Math.min(h-120,pr.bottom+8)+'px'}}
  else if(el){const h=innerHeight;if(tr.top+tr.height/2<h*0.55){e.style.top=Math.min(h-180,Math.max(180,tr.bottom+16))+'px';e.style.bottom='auto'}else{e.style.top='auto';e.style.bottom=Math.max(12,h-tr.top+16)+'px'}}
  else{e.style.top='38%';e.style.bottom='auto';const t2=e.querySelector('.gnext').getBoundingClientRect();r.style.left=(t2.left-pad)+'px';r.style.top=(t2.top-pad)+'px';r.style.width=(t2.width+pad*2)+'px';r.style.height=(t2.height+pad*2)+'px'}}
function gTick(){try{
  if(!GUIDE.on)return;if(!G){guideStop();return}
  try{GXH.hide()}catch(e){}
  try{if(G.round===2&&gPlan()&&!G.hunt.length&&G.beast.length&&!GUIDE.seeded){GUIDE.seeded=1;G.hunt.push(G.beast.shift());refresh()}}catch(e){}
  const s=gCur();if(!s)return;
  if(s.sel&&gPlan()&&GUIDE.selDone!==s.id){gSel(s);setTimeout(gTick,60);return}
  if(GUIDE.shown===s.id&&s.done&&(s.kind!=='pass'||GUIDE.tapped)){let d=false;try{d=!!s.done()}catch(e){}if(d){gAdvance();return}}
  if(GUIDE.shown!==s.id&&s.skip&&(()=>{try{return s.skip()}catch(e){return false}})()){GUIDE.i++;setTimeout(gTick,30);return}
  if(!gReady(s)){if(gPassed(s)){if(!GUIDE.seen.includes(s.id))GUIDE.seen.push(s.id);GUIDE.i++;GUIDE.shown=null;gHide();setTimeout(gTick,30);return}
    if(GUIDE.shown===s.id){GUIDE.shown=null;gHide()}return}
  const el=s.kind==='info'&&!s.tgt?null:gTarget(s);
  if(s.kind!=='info'&&!el){gHide();return}   // wait for the thing to appear (a popup row, a glow)
  if(GUIDE.shown===s.id){if(el){const r=gdq('#tutring'),tr=el.getBoundingClientRect();if(r){r.style.left=(tr.left-6)+'px';r.style.top=(tr.top-6)+'px';r.style.width=(tr.width+12)+'px';r.style.height=(tr.height+12)+'px'}}return}
  GUIDE.shown=s.id;gShow(s,el)}catch(e){console.error(e)}}
// only the highlight (and the bubble's own buttons, Skip) answers while a step shows
function gInside(x,y,el,pad){if(!el)return false;const r=el.getBoundingClientRect();pad=pad||10;return x>=r.left-pad&&x<=r.right+pad&&y>=r.top-pad&&y<=r.bottom+pad}
function gPt(ev){const t=ev.changedTouches&&ev.changedTouches[0]||ev.touches&&ev.touches[0];return t?[t.clientX,t.clientY]:[ev.clientX,ev.clientY]}
function gGate(ev){if(!GUIDE.on||!GUIDE.shown)return;const s=gCur();if(!s||GUIDE.shown!==s.id)return;
  const t=ev.target;if(t&&t.closest&&(t.closest('#coachskip')||t.closest('#coachb button')||t.closest('.gx-top,.gx-bar,#topbar')&&false))return;
  const [x,y]=gPt(ev);const el=s.kind==='info'&&!s.tgt?null:gTarget(s);
  // G6 review: the big Continue button is where a new player taps first; on an info step it moves the step on too (never a dead tap)
  const nx=s.kind==='info'?gNext():null;if(nx&&gInside(x,y,nx,2)){ev.stopPropagation();if(ev.type==='click'){ev.preventDefault();gAdvance()}return}
  if(el&&gInside(x,y,el)){if(ev.type==='click'){if(s.kind==='info'){ev.stopPropagation();ev.preventDefault();gAdvance()}else if(s.kind==='pass'){GUIDE.tapped=true;setTimeout(gTick,60)}}
    else if(s.kind==='info'){ev.stopPropagation()}   // an info tap never reaches the board under it
    return}
  ev.stopPropagation();if(ev.cancelable&&ev.type!=='touchstart')ev.preventDefault();
  if(ev.type==='click'){const r=gdq('#tutring');if(r){r.classList.remove('nudge');void r.offsetWidth;r.classList.add('nudge')}}}
['pointerdown','pointerup','mousedown','mouseup','click','touchend'].forEach(k=>window.addEventListener(k,gGate,true));
document.addEventListener('click',ev=>{const b=ev.target.closest&&ev.target.closest('#coachb [data-guide]');if(!b)return;const k=b.dataset.guide;ev.stopPropagation();
  if(k==='next'){const s=gCur();if(s&&s.kind==='info')gAdvance()}else if(k==='keep'||k==='new'||k==='menu')guideEnd(k)},true);
function gFinish(){GUIDE.done=true;clearInterval(GUIDE.t);GUIDE.t=0;gHide();const e=gEl();e.classList.add('guide');e.hidden=false;e.dataset.kind='final';e.dataset.rule='real';e.style.top='96px';e.style.bottom='auto';
  e.innerHTML='<b class="cn">You know the rules!</b><ul class="walk"><li>Fire and 15 wood by day 12.</li><li>Keep everyone fed, sheltered and alive.</li></ul><div class="cbs"><button type="button" class="cb pri" data-guide="keep">Keep playing</button><button type="button" class="cb" data-guide="new">New game</button></div>';
  try{coachMark({done:1,open:0,step:0})}catch(err){}try{GXT.markDone&&GXT.markDone(TUT_GAME)}catch(err){}}
function guideEnd(k){const e=gdq('#coachb');if(e){e.hidden=true;e.classList.remove('guide')}guideStop();
  if(k==='keep'){try{delete G.tut;delete G.coach;BF.ghostDone=TUT_KEEP.ghost!=null?TUT_KEEP.ghost:BF.ghostDone;refresh()}catch(err){}return}
  tutLeave();if(k==='new'){try{UI.guide.on=false;UI.cmpDef=null;beginGame()}catch(err){openStart()}}else openStart()}
function guideStop(){GUIDE.on=false;clearInterval(GUIDE.t);GUIDE.t=0;gHide();const k=gdq('#coachskip');if(k)k.remove();try{if(GUIDE.tips!=null)GXH.setEnabled(GUIDE.tips)}catch(e){}GUIDE.tips=null}
function guideStart(){GUIDE.on=true;GUIDE.i=0;GUIDE.seen=[];GUIDE.shown=null;GUIDE.done=false;GUIDE.exp=null;GUIDE.seeded=0;
  try{GUIDE.tips=GXH.enabled();GXH.setEnabled(false);GXH.hide()}catch(e){}
  tutBegin();G.coach=1;try{coachMark({open:1,done:0,skipped:0})}catch(e){}
  const sk=coachSkipEl();sk.addEventListener('click',()=>guideStop());
  clearInterval(GUIDE.t);GUIDE.t=setInterval(gTick,250);gTick()}
// Learn to play = the guided game (?coach=1 keeps the older coached game)
{const coachFlag=/[?&]coach=1/.test(location.search);const t0=tutStart;tutStart=function(o){if(coachFlag||o&&o.prologue)return t0.apply(this,arguments);COACH.pro=false;guideStart()}}
