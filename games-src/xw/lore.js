// ===================== story text: ONE data file (edit the words here, nothing else needs to change) =====================
// Cast: Marshal Brecken (guide, camp-brecken), Slate (the rival raider in the tutorial, camp-drill art), Kael Varro (you).
// Bubble rules: title <= 4 words, say <= 20 words, warm and punchy, a story reason first, then what to do (the glow shows where).
const LORE={
  guide:{name:'Brecken',art:'camp-brecken.webp',emoji:'🎖️'},rival:{name:'Slate',art:'camp-drill.webp',emoji:'🎯'},
  // tutorial prologue "Convoy Run": chapters open with a title line, the payoff comes with the next step's first words
  tut:{
    goal:{t:'Ch 1 · Scramble',s:'Slate is raiding our convoy. Smash his ship before it reaches the freighters. Yours is at the bottom.'},
    ship:{t:'Brecken: Plan first',s:'Pilots plan in secret, Varro. Slate is doing it right now. Touch your ship to see where it can fly.'},
    marks:{t:'Brecken: Red and rocks',s:'Red moves strain the engines: stress token. A ! marks paths through the rock, which hurts and skips your action.'},
    dial:{t:'Brecken: Choose a line',s:'Number is speed, arrow is direction, green is easy. Fly the green straight 2 to meet him head on.'},
    fly:{t:'Brecken: Dials are secret',s:'Neither of you can peek. When you are set, reveal the dials and let the ships move together.'},
    order:{t:'Ch 2 · First Contact',s:'Slate shows his hand! Lowest skill moves first: Slate (3), then you (8). Highest shoots first, so you do.'},
    action:{t:'Brecken: One action',s:'After flying, every ship gets one action. Sharpen your aim with a focus token before you fire.'},
    shoot:{t:'Brecken: Fire!',s:'Slate is in your sights! Take the shot.',f:(rg,a,d)=>`Slate is in your sights! Range ${rg}: you roll ${a} dice, he rolls ${d}. Take the shot.`},
    dice:{t:'Brecken: Read the dice',s:'Hits and crits hurt him. A focus face does nothing, unless you spend your focus token.'},
    usefocus:{t:'Brecken: Spend focus',s:'There it is. Your focus token turns that focus face into a hit.'},
    roll:{t:'Brecken: Now roll',s:'That is all we can improve. Now Slate rolls his defence dice. Let it fly.'},
    res1:{t:'Slate: Not so fast',s:'Not so fast! I spent my evade token: each evade cancels one hit. Only one gets through.'},
    defend:{t:'Brecken: Pilot power',s:'He is firing back! Kael’s gift: turn one focus result into an evade. Use it now.'},
    res2:{t:'Brecken: Shields first',s:'Hits strip shields before hull. Unused focus and evade tokens vanish at the round end. Round two!'},
    auto:{t:'Ch 3 · Point Blank',s:'Slate is rattled. Let the computer suggest a move for each ship; you can always choose your own.'},
    fly2:{t:'Brecken: Fly again',s:'Slate has the lower skill, so he moves before you. Reveal the dials.'},
    stress:{t:'Slate: Panic turn',s:'Whoa! That red K-turn gave me a stress token. No action for me, and I am facing away!'},
    lock:{t:'Brecken: Target lock',s:'He cannot shoot back. Lock on: a lock lets you reroll attack dice against him.'},
    shoot2:{t:'Brecken: Point blank',s:'Range 1 adds an attack die, and he is facing away. Take the shot.'},
    reroll:{t:'Brecken: Reroll blanks',s:'Two blanks. Spend your lock to roll them again.'},
    confirm:{t:'Brecken: Choose dice',s:'The blank dice are ticked. Reroll just those.'},
    roll2:{t:'Brecken: Finish him',s:'Better dice! Roll and see if Slate survives.'},
    win:{t:'Ch 4 · Convoy Saved',s:'The convoy is safe! A battle ends when one side has no ships left. Well flown, Varro.'}},
  tutEnd:{title:'You know the rules',text:'Convoy saved. Plan, fly, act, shoot, defend. Shields, hull, stress and locks come with you.',textStory:'Convoy saved. Plan, fly, act, shoot, defend. The Armada will not stop at one raider: chapter 1 awaits.'},
  chapters:[{n:1,name:'Scramble',steps:['goal','ship','marks','dial','fly']},{n:2,name:'First Contact',steps:['order','action','shoot','dice','usefocus','roll','res1','defend','res2']},
    {n:3,name:'Point Blank',steps:['auto','fly2','stress','lock','shoot2','reroll','confirm','roll2']},{n:4,name:'Convoy Saved',steps:['win']}],
  // quick game: a line of flavour before the first turn and a result line in the game's voice
  quick:{intro:'The Armada hits the convoy lane. Clear the way.',win:['The raiders break and run. The convoy slips through.','Clean flying: the lane is clear.'],lose:['Your wing is gone. The convoy scatters.','The Armada owns the lane today.'],draw:'Both wings are spent. The lane stays quiet.'},
  turn:{plan:['Round {r}: plan','Choose a move for each of your ships.'],mine:'Your turn',rival:'Rival’s turn',combat:'Combat'}};

// coached first game (free play): the guide speaks the first time a rule matters. rule:true = counted in TUTORIAL-COVERAGE.md and listed on the end card if it never came up
LORE.coachIntro={title:'Your move, pilot',text:'From here you fly free: every legal move is yours. Brecken speaks up when a rule matters.',btn:'Fly free'};
LORE.coachEnd={win:'Convoy saved! Well flown, Varro.',lose:'The convoy is lost, but you learned the ropes.'};
LORE.laterAlways=['Barrel roll and boost: sideways and bonus moves, in the action ring.','Bumping into a ship stops you short and skips your action.','Flying off the mat destroys your ship.','Torpedoes: spend a target lock for a big shot at range 2-3.','Tied pilot skill: the side with fewer squad points acts first.'];
LORE.coach={
  goal:{rule:1,t:'Brecken: Your goal',s:'Slate is raiding our convoy. Destroy his ship; yours is at the bottom.'},
  fly0:{t:'Brecken: Free flight',s:'Your move is set. Plan, then reveal the dials with Fly. I will call out rules as they matter.'},
  fly:{rule:1,t:'Brecken: Dials are secret',s:'Neither of you can peek. Reveal the dials with Fly and the ships move together.'},
  marks:{rule:1,t:'Brecken: Red and rocks',s:'Red moves strain the engines: a stress token. A ! marks paths through a rock: it hurts and skips your action.'},
  order:{rule:1,t:'Brecken: Who goes first',s:'Lowest pilot skill moves first: Slate (3), then you (8). The highest shoots first, so you do.'},
  action:{rule:1,t:'Brecken: One action',s:'After flying, every ship gets one action. Focus sharpens your next shot.'},
  lock:{rule:1,t:'Brecken: Target lock',s:'A lock lets you reroll attack dice against that enemy. Take it if you want a surer shot.'},
  shoot:{rule:1,t:'Brecken: In your sights',s:'Pick a glowing enemy in your arc. Range 1 adds an attack die; range 3 adds a defence die.'},
  dice:{rule:1,t:'Brecken: Read the dice',s:'Hits and crits hurt him. A focus face does nothing, unless you spend your focus token.'},
  usefocus:{rule:1,t:'Brecken: Spend focus',s:'Your focus token turns a focus face into a hit. Spend it before you roll.'},
  res1:{rule:1,t:'Brecken: Hits minus evades',s:'Each evade cancels one hit. Defence dice and evade tokens are how a ship dodges.'},
  defend:{rule:1,t:'Brecken: Pilot power',s:'Kael can turn one focus result into an evade. Use it when you defend.'},
  res2:{rule:1,t:'Brecken: Shields first',s:'Damage strips shields before hull. Crits are dealt face up with lasting effects.'},
  goodshot:{t:'Brecken: Nice shot',s:'That hit landed. Stay in his arc and keep the pressure on.'},
  gothit:{t:'Slate: Got you!',s:'Ouch. Stay out of his front arc. Or take an evade token first.'},
  stress:{rule:1,t:'Brecken: Stress',s:'A stressed ship can not act. No red moves until it flies green.',who:'brecken'},
  endround:{rule:1,t:'Brecken: Round end',s:'At the end of each round unused focus and evade tokens vanish. Target locks stay.'}};
// the speaker's portrait on a tutorial bubble: the title starts with the speaker's name
(function(){if(typeof MutationObserver==='undefined'||!document.body)return;
  new MutationObserver(ms=>{for(const m of ms)for(const n of m.addedNodes){if(n.nodeType!==1)continue;const b=n.matches&&n.matches('.gxt-bub')?n:(n.querySelector&&n.querySelector('.gxt-bub'));if(!b)continue;
    const t=(b.querySelector('.gxh-tt')||{}).textContent||'';b.classList.toggle('na-slate',/^Slate/.test(t))}}).observe(document.body,{childList:true,subtree:true})})();
