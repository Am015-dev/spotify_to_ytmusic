// All story text for the tutorial, the turn strip and the quick game lives here, so it can be edited in one place. (Story-mode scenes: ../../campaign.json.)
// Guide: Old Ysolde the Rune-Reader (you lead the Heathbound Clans). Rival: Tamsin of the Gate (the Gilded Court). Names come from campaign.json `cast`.
// A function value gets helpers from the game (G, cinfo, ...) at the moment it is shown. Bubbles: at most 2 short lines.
var TBSTORY={
  guide:'ysolde', rival:'tamsin',
  quick:{intro:'The king is dead. The heath is yours to take.',
    win:'The crown is yours, and the heath sings your name.',lose:'The Court holds the gate this time. Gather your Clans and ride again.',tie:'Neither banner falls. The Favour decides the crown.'},
  // chapters of the tutorial prologue: first step id, title, opening beat, payoff beat (shown after the last step of the chapter)
  chapters:[
    {at:'map',title:'The Gate Road',open:'The old king is dead. Tamsin holds the gate and wants the crown.',pay:'First pick of the road is yours. Well bid, heir.'},
    {at:'herald',title:'Banners and Secrets',open:'Now the quiet work: where to stand, and what to hide.',pay:'Three cards down. Now the heath will judge them.'},
    {at:'supp',title:'Muster the Heath',open:'Your people have come. Put them where they matter.',pay:'The clans are in place. Let the horns sound.'},
    {at:'clash',title:'The Reckoning',open:'Cards flip, and the heath chooses its heir.',pay:''}],
  // per step: say = the story reason + the one thing to do (the glow shows where); react = the guide's reply once it is done
  tut:{
    map:{say:'The king is dead. Three regions, six locations: hold them and you hold the Throne.'},
    goal:{say:'Influence is how the kingdom counts loyalty. The most when the last round ends wears the crown.'},
    bid1:{say:()=>'Tamsin bids for first pick of the road. Answer with your '+cinfo(tutBidId()).strength+'.'},
    bid2:{say:'Lay it face down. She must not see what you offer.',react:'Hidden well. She will wonder all night.'},
    reveal:{},
    kc:{say:'The winner takes a Kingdom Card, a favour you keep all game. Take the glowing one.',react:'A fine favour. It will serve you through the whole war.'},
    herald:{say:()=>'Send your Herald to '+(UI.bf&&UI.bf.rec?locOf(UI.bf.rec):'the glowing place')+', where Tamsin\'s banner flies too.',react:'The crowd cheers your name. Only a win there makes it pay.'},
    place1:{say:()=>'Now hide one card at every region. Start with your '+cinfo(tutPlace()[0]).strength+'.'},
    place1b:{say:'Slip it into the Uplands. Nobody sees it until the Clash.'},
    place2:{say:'Your Heir is your strongest card. Hide it in the Tablelands, where both Heralds stand.'},
    place3:{say:()=>'Your '+cinfo(tutPlace()[0]).strength+' guards the Sinks. Hide it there.',react:'Three cards down. Tamsin has hidden hers too.'},
    supp:{say:'Supporters are loyal hands: each adds +1 here this round. Send two to the Tablelands.',react:'Two more hands in the Tablelands. That is +2.'},
    spring:{say:'Spring is done. Tell the kingdom you are ready.'},
    order:{say:'You decide which region fights first. Start with the Uplands, then the Tablelands.',react:'The horns sound. The first Clash begins.'},
    clash:{},
    claim:{say:()=>'You won the Tablelands! Claim '+(UI.bf&&UI.bf.rec?locOf(UI.bf.rec):'the glowing place')+'. Your Herald there earns extra.',react:'That is how a crown is won: one region at a time.'},
    score:{},
    round:{},
    end:{react:()=>myInf()>rivInf()?'You did it. Tamsin keeps the gate, and the heath is yours.':'Tamsin wins this one. Real games are longer: try again.'}
  },
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
    supp:'Each Supporter adds +1 in a region. Tap a region, then Done.',
    order:'You pick which region fights first. Tap them in order.',
    clash:()=>{const ev=UI.card&&UI.card.ev;if(!ev||!ev.tot)return '';const t=ev.tot,me=t[0],o=Math.max(...Object.keys(t).filter(s=>+s!==0).map(s=>t[s]));return ev.winner===0?'Cards flip: your '+me+' beats '+o+'. The region is yours.':ev.winner<0?'Cards flip: '+me+' each. Nobody wins here.':'Cards flip: Tamsin\'s '+o+' beats your '+me+'. Hide bigger cards where you want to win.'},
    claim:'You won the region. Claim one of its two locations.',
    score:()=>'You have '+myInf()+' Influence now. Tamsin has '+rivInf()+'.',
    round:'Round over. Supporters go home and played cards are discarded.',
    later:['Day and Night commands (Ambush, Retreat, Flank, Deadly)','Autumn: Govern and Journey, Lore, your Site of Power','Councils, the Favour and Tactics','Attrition when your deck runs out','Tied Clashes: the tied players clash again, then nobody scores']
  },
  // the always-visible line, by decision kind (<= 2 short lines)
  ask:{bid:'Tap a card to bid it in secret. The highest bid picks first.',
    bidRes:'Tap a glowing Kingdom Card to take it.',
    herald:'Tap a glowing location to place your Herald.',
    place:'Tap a card, then tap a region to hide it there.',
    clashOrder:'Tap the regions in the order they should fight.',
    location:'Tap a glowing location to claim it.',
    applause:'Choose where you will stand in the turn order.',
    discardPick:'Tap a card to discard it.',
    menu:'Use a power if you like, then tap Done.'},
  wait:'Waiting for {n} to choose...'
};
