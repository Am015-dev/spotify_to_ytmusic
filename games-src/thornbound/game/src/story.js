// All story text for the tutorial, the turn strip and the quick game lives here, so it can be edited in one place. (Story-mode scenes: ../../campaign.json.)
// Guide: Old Ysolde the Bog Chieftain (you lead the Reedfolk). Rival: Tamsin of the Gate (the Salt Crown). Names come from campaign.json `cast`.
// A function value gets helpers from the game (G, cinfo, ...) at the moment it is shown. Bubbles: at most 2 short lines.
var TBSTORY={
  guide:'ysolde', rival:'tamsin',
  quick:{intro:'The king is dead. The reed beds are yours to hold.',
    win:'The crown is yours, and the marshes sing your name.',lose:'{W} take the throne this time. Gather your people and ride again.',tie:'Neither banner falls. The Favour decides the crown.'},
  // chapters of the tutorial prologue: first step id, title, opening beat, payoff beat (shown after the last step of the chapter)
  // the tutorial's lines live in ui12.js (tutSteps): one sentence per step, no story pop-ups over the board
  chapters:[],
  tut:{},
  // the Goal card (first screen of Learn to play, start of every quick game, Goal button): one sentence, at most 3 bullets
  goalCard:{learn:'Learn to play',win:'Have the most Influence when the last round ends.',
    how:['Win a region\u2019s Clash to claim a location. It pays Influence.','Your Herald on that location adds +1 and steals from rivals.','Bid high to take a Kingdom Card first. You keep its power.']},
  // coached first game (free play): one line the first time a rule matters; a function gets the live game. id = rule in TUTORIAL-COVERAGE.md
  coach:{
    welcome:'The king is dead. Three regions, six locations: hold them and you hold the Throne. Play any card you like; I will speak up when a rule matters.',
    goal:'Influence is your score. The most when the last round ends wears the crown.',
    bid:'Each round starts with a secret bid. Tap a card, then the glowing spot.',
    bids:()=>{const b=G.bstr||[],m=b[0],t=b[1];return m>t?'Your '+m+' beats Tamsin\'s '+t+': you choose first.':m<t?'Tamsin\'s '+t+' beats your '+m+': she chooses first.':'A tie goes to the higher on the Order Track.'},
    kc:'The top bid takes a Kingdom Card first. You keep its power.',
    herald:'Place your Herald on a location. It pays if you win that region.',
    place:'Hide one card at each region. Put big cards where you want to win.',
    supp:'Each Supporter adds +1 in a region\u2019s first fight. Tap a region, then Done.',
    order:'You pick which region fights first. Tap them in order.',
    clash:()=>{const ev=UI.card&&UI.card.ev;if(!ev||!ev.tot)return '';const t=ev.tot,me=t[0],o=Math.max(...Object.keys(t).filter(s=>+s!==0).map(s=>t[s]));return ev.winner===0?'Cards flip: your '+me+' beats '+o+'. The region is yours.':ev.winner<0?'Cards flip: '+me+' each. Nobody wins here.':'Cards flip: Tamsin\'s '+o+' beats your '+me+'. Hide bigger cards where you want to win.'},
    claim:'You won the region. Claim one of its two locations.',
    score:()=>'You have '+myInf()+' Influence now. Tamsin has '+rivInf()+'.',
    round:'Round over. Supporters on the map go to the Lost Pile and played cards are discarded.',
    later:['Day and Night commands (Ambush, Retreat, Flank, Deadly)','Autumn: Govern and Journey, Lore, your Site of Power','Councils, the Favour and Tactics','Attrition when your deck runs out','Tied Clashes: the tied players may add a card and clash again; if nobody adds one, nobody scores']
  },
  // the always-visible line, by decision kind (<= 2 short lines)
  ask:{bid:'Now: bid one card, then bids open.',
    bidRes:'Now: take a glowing card, then rivals pick.',
    herald:'Now: tap a location, then hide cards.',
    place:'Now: hide a card per region, then Clashes.',
    clashOrder:'Now: tap regions in fight order, then Clash.',
    location:'Now: claim a location, then take its reward.',
    applause:'Now: pick your turn slot, then play on.',
    discardPick:'Now: tap a card to discard, then play on.',
    menu:'Now: use a power or Done, then next step.',
    menuSpring:'Now: send Supporters to regions, then Done.',
    menuDay:'Now: use a power, then Done to count.',
    menuAutumn:'Now: Govern or Journey, then tap Done.',
    menuAutumnCard:'Now: Journey for Lore or Govern, then Done.'},
  wait:'Waiting for {n} to choose...'
};
