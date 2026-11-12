// ===================== story.js: ALL the words of the story layer in one place (edit here, nothing else needs touching) =====================
// Cast: Foreman Brix (guide, teaches the prologue), Vesper Quill the Clockmaker (rival: builds the devices, leaves his brass key on every one).
// Chapter intros/outros for Story mode live in ../campaign.json (same cast). See ../STORY.md for the arc.
const STORY={
 guide:{name:'Brix',full:'Foreman Brix'},rival:{name:'Quill',full:'Vesper Quill'},
 // Quick game: a one-line flavour on the brief card, a result line on the end card (voice: dry, warm, a bit smug rival)
 quick:{
  flavour:['A new device is ticking. Cut every wire together before the fuse dies.','Quill left his brass key on this one. Prove him wrong.','The crew has one chance. Talk it through, then cut.'],
  win:['Quiet room, quiet fuse. Quill will have to try harder.','Every wire cut and not a scorch mark. Brix nods.','Defused together. The crew earned that coffee.'],
  lose:['Quill is laughing somewhere. Shake it off and go again.','The fuse won this round. Read the tokens closer next time.','Boom. Brix says: "Everybody breathes. Again."']},
 // the tutorial is the PROLOGUE: Brix teaches on a practice rig Quill left at the shop door
 tut:{
  chapters:[{id:1,name:'Your first turn',beat:'Quill taped a ticking rig to the shop door.'},{id:2,name:'Scoring',beat:'The crew plays. Quill is watching.'},{id:3,name:'Special cases',beat:'Quill hid a few tricks in it.'},{id:4,name:'Defused',beat:'One last cut.'}],
  // step id -> [chapter, who ('brix'|'quill'), title, text]; the text is: the reaction to what you just did, then why it matters, then the one thing to do (the glow shows where)
  s:{
   goal:[1,'brix','Prologue',n=>'Cut all '+n+' wires together; a miss burns fuse, red means boom.'],
   mine:[1,'brix','Your wires','Your wires face you, sorted low to high; the crew\'s stay hidden.'],
   crew:[1,'brix','Your crew','Teal and Plum hide theirs, and they never see yours.'],
   fuse:[1,'brix','The fuse','A miss burns a fuse step; cutting a red means boom.'],
   token:[1,'brix','Show a wire','Everyone first shows one wire: tap your 3 to show it.'],
   tokens2:[1,'brix','Their tokens','Teal and Plum showed one too; tokens are clues for everyone.'],
   point:[1,'brix','Your turn','Teal and Plum showed tokens too: tap Teal\'s 2 to point.'],
   name:[1,'brix','Say a number','Now tap your own 2 to say "2".'],
   hit:[1,'brix','Clean cut','Match: both 2s cut; one cut per turn, and Rewind unlocks.'],
   crew1:[2,'brix','Crew turns','One cut per turn, clockwise: Teal, then Plum, played theirs.'],
   probe:[2,'brix','Twin Probe','Crew played; tap your Twin Probe: once per job, two wires.'],
   wrong1:[2,'brix','A wrong guess','No clue is sure here, so guess: tap Plum\'s second wire.'],
   wrong1b:[2,'brix','Two wires','Now tap his third wire too: the probe covers both.'],
   wrong2:[2,'brix','Say a number','Say 2, a risky guess: nothing proves either is a 2.'],
   wrongres:[2,'quill','Tick, tick',()=>{const t=G.st[2].w[tutIdx(2,3)].tok[0];return 'Both missed: a fuse step burned; Plum\'s token shows '+(t?t.v:1)+'.'}],
   crew2:[2,'brix','Use the clue','Teal used that clue; a check means all four are cut.'],
   gear:[3,'brix','Gear','Teal used that token; tap Rewind to turn the fuse back once.'],
   yellow1:[3,'brix','Yellow wires','Yellow only matches yellow: tap Plum\'s yellow, his last wire.'],
   yellow2:[3,'brix','Say yellow','Tap your yellow to say "yellow".'],
   red:[3,'quill','Never red','Tap your red: never say red or point at one.'],
   solo:[4,'brix','Solo cut','You hold every 2 left: tap one to cut both alone.'],
   win:[4,'brix','Defused!','Your lone red revealed itself, so every wire is cut: we win.']},
  endTitle:'Training done',endText:'Quill\'s key lies on the step. Chapter 1 is a real job.',
  endTextPlain:'Next: job 1, a real bomb with your crew.'},
 // Help: "How a turn works" in five short lines, before any detail
 turn:['<b>1.</b> On your turn, tap a crewmate\'s wire you want to guess.','<b>2.</b> Then tap one of YOUR numbers to say it. Your number must be one you hold.','<b>3.</b> Match: you both cut. Miss: the fuse burns one step.','<b>4.</b> Then the next player goes, clockwise. The computer crew plays step by step.','<b>5.</b> Cut every wire before the fuse ends. Never point at red.']
};

STORY.coach={
 // id:[speaker,title,text]. Just-in-time: shown the first time the rule matters, one at a time, never blocking.
 goal:['brix','Prologue',()=>'We win when all '+G.st.reduce((a,s)=>a+s.w.length,0)+' wires are cut. A miss burns one of three fuse steps. A red wire ends it.'],
 mine:['brix','Your wires','The bottom wires are yours, lowest on the left. Teal and Plum hold the rest.'],
 crew:['brix','Your crew','Teal and Plum hold the rest. You only see their backs.'],
 fuse:['brix','The fuse','You have three fuse steps. A miss burns one; red ends it.'],
 token:['brix','Show a wire','First, everyone shows one wire. Tap one of yours and a token tells the crew its number.'],
 tokens2:['brix','Tokens','Teal and Plum showed theirs. Tokens are clues the whole crew shares. Use them.'],
 point:['brix','Your turn','Tap a crewmate\'s wire to guess it. Then tap your matching number.'],
 hit:['brix','A hit','Both wires are cut. Play now passes clockwise.'],
 good:['brix','Good read','Nice. The token and the order told you what it was.'],
 miss:['quill','Tick, tick','The fuse burned a step. A token now shows the true number. Your wire stays hidden.'],
 poor:['brix','Use the clues','A miss costs the whole crew. Check the tokens and the sort order before you guess.'],
 solo:['brix','Solo cut','You hold every one of that number left. Cut them alone. No guessing, no risk.'],
 crew1:['brix','Crew solo','Plum held every one left of that number. Plum cut them alone.'],
 crew2:['brix','Crew teamwork','Your crew plays by the same rules. They guess from tokens and sort order too.'],
 check:['brix','All four done','All four are cut, so the green check goes up.'],
 gear:['brix','Gear unlocked','Rewind is ready. Tap it to restore one fuse step.'],
 probe:['brix','Twin Probe','Your trick, once per job. Point at two wires and say one number. It hits if either matches.'],
 yellow:['brix','Yellow wires','Quill loves yellow. A yellow only matches a yellow. You must hold one to say it.'],
 rmiss:['quill','Even they slip','Ha! Your crew burned a fuse step. Check the token it left.'],
 red:['quill','Never red','Never point at red. A hand of only reds shows itself.'],
 winTitle:'The rig is silent',winText:'Every wire cut. Quill\'s brass key falls off the door. You are on the crew.',
 loseTitle:'The rig went off',loseText:'Brix dusts you off: "Everybody breathes. Again."'};
STORY.later={goal:'The goal: cut every wire together before the fuse runs out.',mine:'Your stand is face up to you, sorted low to high.',crew:'The crew\'s wires are hidden from you, and yours from them.',fuse:'A miss burns a fuse step. None left, or a red wire, and it explodes.',
 token:'Everyone starts by showing one wire with a token.',tokens2:'Tokens are clues the whole crew shares.',point:'A turn. Point at a crew wire, then name a number you hold.',hit:'A hit cuts both wires.',miss:'A miss burns the fuse. A token shows the true number.',
 solo:'Solo cut. If you hold every wire left of a number, cut them alone.',crew1:'The computer crew can solo cut too.',crew2:'The computer crew guesses from tokens and sort order.',check:'All four of a number cut? A green check goes up.',
 gear:'Gear cards unlock when two of their number are cut. One use each.',probe:'Twin Probe: point at two wires, say one number, once per job.',yellow:'Yellow only matches yellow. You must hold one to say it.',red:'Never point at a red wire. A hand of only reds reveals itself.',rmiss:'A computer crewmate can miss too. The miss burns the fuse the same way.'};
