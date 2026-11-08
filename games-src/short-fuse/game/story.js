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
   goal:[1,'brix','Prologue',n=>'Quill taped a ticking rig to the shop door. Cut all '+n+' wires together before the fuse dies.'],
   mine:[1,'brix','Your wires','Rookie, these wires are yours. Only you see the numbers, lowest on the left.'],
   crew:[1,'brix','Your crew','Teal and Plum hold the rest. You see their backs, they never see yours. Trust them.'],
   fuse:[1,'brix','The fuse','Three steps stand between us and Quill. A wrong cut burns one. A red wire ends it.'],
   token:[1,'brix','Show a wire','First, the crew shows one wire each. Tap your 3 and a token tells everyone its number.'],
   tokens2:[1,'brix','Their tokens','Teal and Plum showed theirs. Tokens are clues the whole crew shares. Use them.'],
   point:[1,'brix','Your turn','Teal\'s token says 2. Tap that wire to point at it.'],
   name:[1,'brix','Say a number','Say a number you hold. Tap one of your 2s: if Teal has a 2 too, you both cut.'],
   hit:[1,'brix','Clean cut','Both 2s cut! Rewind just unlocked. One cut per turn, then it passes clockwise.'],
   crew1:[2,'brix','Crew turns','Watch: Teal used your token to cut your 3. Plum held the last 3s and cut them alone.'],
   wrong1:[2,'brix','A wrong guess','Quill\'s rigs punish guesses, so we practise failing. Tap Plum\'s second wire.'],
   wrong2:[2,'brix','Say a number','Say 2. It is really a 1, so this will miss.'],
   wrongres:[2,'quill','Tick, tick',()=>{const t=G.st[2].w[tutIdx(2,3)].tok[0];return 'Tick, tick. The fuse burned a step, and a token shows the true number: a '+(t?t.v:1)+'.'}],
   crew2:[2,'brix','Use the clue','Teal used that token to cut a 1, Plum cut the last. A green check marks a finished number.'],
   probe:[3,'brix','Twin Probe','Your trick: once per job, point at two wires and say one number. It hits if either matches.'],
   gear:[3,'brix','Gear','Rewind is ready. Tap it to turn the fuse back one step. Gear works once.'],
   yellow1:[3,'brix','Yellow wires','Quill loves yellow: a yellow only matches a yellow. You hold one, so tap Plum\'s last wire.'],
   yellow2:[3,'brix','Say yellow','Say your yellow wire. That is the only way a yellow ever matches.'],
   red:[3,'quill','Never red','Never point at red or it blows. If red is all you hold, it reveals itself.'],
   solo:[4,'brix','Solo cut','You hold every 2 left, so cut them alone. Tap one: both go, no risk.'],
   win:[4,'brix','Defused!','Every wire cut. The rig is silent, and Quill\'s brass key falls off the door. You are on the crew.']},
  endTitle:'The rig is silent',endText:'Quill\'s key lies on the step. You know every rule. Chapter 1 is next.',
  endTextPlain:'Quill\'s key lies on the step. You know every rule. Real jobs add twists: the lightbulb explains them.'},
 // Help: "How a turn works" in five short lines, before any detail
 turn:['<b>1.</b> On your turn, tap a crewmate\'s wire you want to guess.','<b>2.</b> Then tap one of YOUR numbers to say it. Your number must be one you hold.','<b>3.</b> Match: you both cut. Miss: the fuse burns one step.','<b>4.</b> Then the next player goes, clockwise. The computer crew plays step by step.','<b>5.</b> Cut every wire before the fuse runs out. Red wires blow up: never point at one.']
};

STORY.coach={
 // id:[speaker,title,text]. Just-in-time: shown the first time the rule matters, one at a time, never blocking.
 goal:['brix','Prologue',()=>'We win when all '+G.st.reduce((a,s)=>a+s.w.length,0)+' wires are cut, before the fuse burns out. Quill rigged the shop door. Let\'s go.'],
 mine:['brix','Your wires','Rookie, the wires at the bottom are yours. Only you see the numbers, lowest on the left.'],
 crew:['brix','Your crew','Teal and Plum hold the rest. You see their backs, they never see yours. Trust them.'],
 fuse:['brix','The fuse','Three steps stand between us and Quill. A wrong cut burns one. A red wire ends it.'],
 token:['brix','Show a wire','First, everyone shows one wire. Tap one of yours and a token tells the crew its number.'],
 tokens2:['brix','Tokens','Teal and Plum showed theirs. Tokens are clues the whole crew shares. Use them.'],
 point:['brix','Your turn','Tap a crewmate\'s wire you want to guess, then tap one of your own numbers to say it. It must be a number you hold.'],
 hit:['brix','A hit','Both wires are cut. One cut per turn, then it passes clockwise.'],
 good:['brix','Good read','Nice. The token and the sorted order told you what it had to be.'],
 miss:['quill','Tick, tick','The fuse burned a step, and a token now shows the wire\'s true number. Your wire stays hidden.'],
 poor:['brix','Use the clues','A miss costs the whole crew. Check the tokens and the sort order before you guess.'],
 solo:['brix','Solo cut','You hold every one of that number left, so you cut them alone. No guessing, no risk.'],
 crew1:['brix','Crew solo','Plum held every one left of that number, so he cut them alone.'],
 crew2:['brix','Crew teamwork','Your crew plays by the same rules. They guess from tokens and sort order too.'],
 check:['brix','All four done','Every wire of that number is cut: the green check goes up. That number is finished.'],
 gear:['brix','Gear unlocked','Rewind is ready: it turns the fuse back one step. Tap it on your turn. Gear works once.'],
 probe:['brix','Twin Probe','Your trick, once per job: point at two wires and say one number. It hits if either matches.'],
 yellow:['brix','Yellow wires','Quill loves yellow. A yellow only matches a yellow, and you must hold one to say "yellow".'],
 rmiss:['quill','Even they slip','Ha! Your crew just burned a fuse step. Everyone misses sometimes. Watch the tokens it leaves.'],
 red:['quill','Never red','Never point at red or it blows. If red is all you hold, it reveals itself.'],
 winTitle:'The rig is silent',winText:'Every wire cut. Quill\'s brass key falls off the door. You are on the crew. Here is how it counted:',
 loseTitle:'The rig went off',loseText:'Brix dusts you off: "Everybody breathes. Again." Here is how it counted:'};
STORY.later={goal:'The goal: cut every wire together before the fuse runs out.',mine:'Your stand is face up to you, sorted low to high.',crew:'The crew\'s wires are hidden from you, and yours from them.',fuse:'A miss burns a fuse step; none left, or a red wire, and it explodes.',
 token:'Everyone starts by showing one wire with a token.',tokens2:'Tokens are clues the whole crew shares.',point:'A turn: point at a crew wire, then name a number you hold.',hit:'A hit cuts both wires.',miss:'A miss burns the fuse and shows the true number on a token.',
 solo:'Solo cut: if you hold every wire left of a number, cut them alone.',crew1:'The computer crew can solo cut too.',crew2:'The computer crew guesses from tokens and sort order.',check:'When all four of a number are cut, a green check goes up.',
 gear:'Gear cards unlock when two of their number are cut, and work once.',probe:'Twin Probe: point at two wires, say one number, once per job.',yellow:'Yellow wires only match yellow, and you must hold one to say it.',red:'Never point at a red wire; a hand of only reds reveals itself.',rmiss:'A computer crewmate can miss too; the miss burns the fuse the same way.'};
