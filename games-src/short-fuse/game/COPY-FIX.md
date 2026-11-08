# Short Fuse copy fixes
Game: Short Fuse. Date: 2026-11-08.

## Goal card

The Goal card (tbl.js:193, `renderOverlays`) states the aim in ONE sentence, so it is ok: `Cut all ${wires} wires together before the fuse (${steps} steps) runs out.` No change needed. Its three bullets below it are covered in the table. The Learn-to-play goal bubbles (story.js, first rows) carry two sentences of story; the table trims them to the aim.

| file:line | old line | new line |
|---|---|---|
| hlp.js:26 | `Tap one of your wires. A token with its number goes in front of it for the whole crew.` | `Tap one of your wires. A token shows its number to everyone.` |
| hlp.js:27 | `Tap a crewmate\'s glowing wire, then tap one of your own numbers: the one you think it is.` | `Tap a glowing crew wire, then your own number you think it matches.` |
| hlp.js:28 | `Tap a glowing wire of yours: the number you say. It must be one you hold.` | `Tap a glowing wire of yours to say its number.` |
| hlp.js:29 | `Tap the crewmate\'s wire you think has your number. A match cuts both wires.` | `Tap the crew wire you think matches. A match cuts both.` |
| hlp.js:30 | `You hold every wire left of this number. Tap one: all of them are cut, and it cannot fail.` | `You hold every wire left of this number. Tap one to cut them safely.` |
| hlp.js:31 | `Tap one red wire to show your reds. You are then finished, and nothing blows up.` | `Tap a red wire to show your reds. Nothing blows up.` |
| hlp.js:32 | `Tap a glowing wire to put an info token in front of it. Everyone then sees the number.` | `Tap a glowing wire to tag it. Everyone sees the number.` |
| hlp.js:33 | `Something is asked of you. Tap one of the glowing wires, players or buttons.` | `Tap a glowing wire, player or button to answer.` |
| hlp.js:34 | `Keep tapping the glowing wires, players or buttons. The cross button cancels.` | `Keep tapping glowing items. The cross button cancels.` |
| hlp.js:35 | `In this job anyone may take the next turn. Tap the button if you are ready.` | `Anyone may take the next turn. Tap the button when ready.` |
| hlp.js:40 | `Each wrong cut burns one fuse step. With no step left the bomb goes off. A red wire ends the job at once.` | `Each wrong cut burns a fuse step. With none left, boom.` |
| hlp.js:41 | `You see your own wires, not the crew\'s. Every stand is sorted from the lowest number to the highest.` | `You see only your own wires. Every stand is sorted low to high.` |
| hlp.js:43 | `The crew can use it as a clue: they now know that wire, and where it sits in the order.` | `The crew now knows that wire, and can use it as a clue.` |
| hlp.js:44 | `Point at a crewmate\'s wire and say a number you hold. If they have that number, both wires are cut.` | `Point at a crew wire and say a number you hold. A match cuts both.` |
| hlp.js:45 | `If the wire is not that number, the fuse burns one step. A token then shows the true number.` | `A wrong guess burns one fuse step. A token then shows the true number.` |
| hlp.js:46 | `Wires are sorted low to high, and tokens show numbers. A wire beside a low token must be low too.` | `Wires are sorted low to high. A wire next to a low token is low too.` |
| hlp.js:47 | `Red wires must never be cut. Pointing at one blows up the bomb, so only point at wires you trust.` | `Never point at a red wire. It blows up the bomb.` |
| hlp.js:48 | `You can only say a number that you hold yourself. Tap one of your glowing wires.` | `You can only say a number you hold. Tap a glowing wire.` |
| hlp.js:49 | `A match cuts both wires: theirs and yours. When all four of a number are cut, it is finished.` | `A match cuts both wires. Once all four are cut, that number is done.` |
| hlp.js:50 | `You chose a number. Now tap the crewmate\'s wire you think is that number.` | `Now tap the crew wire you think has that number.` |
| hlp.js:52 | `If you hold every uncut wire of a number, cut them yourself. A solo cut never fails and costs nothing.` | `Hold every uncut wire of a number? Cut them yourself. It never fails.` |
| hlp.js:53 | `Solo cuts make progress without risking the fuse, so they are usually a good move.` | `Solo cuts make progress with no risk to the fuse.` |
| hlp.js:54 | `You hold nothing but red wires. Show them to the crew. You are done, and nothing blows up.` | `You hold only reds. Show them: you are done, and nothing blows up.` |
| hlp.js:56 | `A token goes in front of a wire. Everyone sees its number, and the sort order adds clues.` | `A token shows everyone a wire number. Sort order adds more clues.` |
| hlp.js:58 | `The job asks you something. Tap one of the glowing wires, players or buttons to answer.` | `The job asks you something. Tap a glowing choice to answer.` |
| hlp.js:59 | `The light bulb shows the crew advisor\'s pick, with a reason. You can follow it or choose your own.` | `The light bulb suggests a move and says why. You choose.` |
| hlp.js:60 | `Gear cards unlock when the crew cuts certain numbers. Tap a glowing card to use it once.` | `Gear unlocks when the crew cuts certain numbers. Tap a glowing card.` |
| hlp.js:61 | `Keep tapping glowing wires, players or buttons until the move is done. The cross cancels it.` | `Keep tapping glowing items until the move is done. The cross cancels.` |
| hlp.js:62 | `In this job there is no fixed order. Tap Claim when you can make progress.` | `There is no fixed order. Tap Claim when you can cut.` |
| hlp.js:63 | `If two players claim, the better placed one goes first. Your wires stay your own secret.` | `If two players claim, one goes first. Your wires stay secret.` |
| hlp.js:86 | `The crew advisor\'s best pick here.` | `The advisor\'s top pick.` |
| hlp.js:87 | `The crew advisor\'s best pick here.` | `The advisor\'s top pick.` |
| hlp.js:88 | `The crew advisor\'s best pick here.` | `The advisor\'s top pick.` |
| hlp.js:89 | `The crew advisor\'s best pick here.` | `The advisor\'s top pick.` |
| src/data.js:32 | `Call a number. Every crew member, you included, says yes if they have at least one uncut blue wire of it; two-stand players answer for each stand. Nobody says how many or where. Red and yellow never count.` | `Call a number. Everyone says yes if they hold an uncut blue wire of it.` |
| src/data.js:34 | `Use before your action. If your dual cut this turn misses, the fuse does not burn, and if you pointed at a red nothing goes off. A wrong non-red wire still gets its token; a red one gets none.` | `Use before cutting. A miss this turn burns no fuse, and a red does not blow.` |
| src/data.js:54 | `With your dual cut, name a number (never yellow) and point at two wires on one crewmate stand. It works if either matches; if both do they quietly pick one. If neither matches the fuse burns one step and they tag one of the two. If exactly one is red nothing goes off and the tag goes on the other; if both are red, boom.` | `Point at two crew wires and say a number. Either match hits.` |
| src/data.js:183 | `Blue 1 to 10 plus one red (from 1.5 to 9.5). Pointing at a red ends the job. A hand of only reds is revealed at the start of its turn. Equipment arrives: one card per player (Handsets and Equal Tag are swapped out).` | `Blue 1 to 10 plus one red. Pointing at red ends the job. Gear arrives.` |
| src/data.js:189 | `Three number cards set an order: two wires of the first value must be cut before the second value may be cut, and two of the second before the third. Other values are free.` | `Three number cards set an order. Cut two of each value, in order.` |
| src/data.js:190 | `Against the clock (15 minutes, 12 with two players). No fixed order: when a turn ends, anyone may claim the next one, but never two in a row (unless only two of you, or you are the last with wires). Coffee Break is swapped out.` | `Timed job. Anyone may claim the next turn, never twice running.` |
| src/data.js:193 | `The three reds are dealt one per player from the foreman. Opening tokens are drawn at random. Reds go only by a special action: point at three uncut wires anywhere at once; if any is not red, boom. Equipment and probes cannot choose reds (pointing one at a red is a boom). A hand of only reds must try it.` | `The three reds go only together, by pointing at all three.` |
| src/data.js:194 | `Crew cards are dealt at random; whoever gets the foreman card is the rookie. If the rookie misses a dual cut, boom. The rookie may not use the Damper.` | `Whoever gets the foreman card is the rookie. A rookie miss is a boom.` |
| src/data.js:197 | `Crew cards are dealt at random; the foreman card holder is the fibber. The fibber opens with two false tokens, and every token in the fibber\'s hand means "NOT this value". The fibber may not use equipment, but may join a Handsets trade and answer a Sweep.` | `The foreman-card holder is the fibber. Their tokens mean NOT this value.` |
| src/data.js:198 | `Only the Sweep is on the board, always ready. No opening tokens. Each turn: turn up a number card, sweep it, then pick who must cut that value.` | `Each turn, sweep a number card and pick who cuts it.` |
| src/data.js:203 | `No equipment on the board: seven face-down cards wait in a pile. A number card is shown; its four wires go only all at once, by pointing at all four (boom if wrong). Until then, one card of the pile burns each round. After it, the rest of the pile is ready.` | `Cut all four wires of the shown number at once, or boom.` |
| src/data.js:214 | `Crew cards and restrictions are dealt face down. The foreman card holder is the secret weak link and alone obeys a restriction. No personal tools until the weak link is unmasked. At the start of your turn you may accuse.` | `The foreman-card holder is the secret weak link. Find them.` |
| src/data.js:219 | `No equipment. A number card is shown; its four wires go only all at once (boom if wrong). A deck of eight number cards burns one per round until then; afterwards the rest are dealt out as extra tokens. Opening tokens are drawn at random.` | `No gear. Cut all four wires of the shown number at once.` |
| src/data.js:224 | `A shared oxygen reserve (2 per player). Each cut costs 1, 2 or 3 by depth. It all comes back each round, when the turn passes the foreman\'s seat. Cannot pay: skip and burn a step. No talking.` | `Shared oxygen pays for cuts. Cannot pay? Burn a step. No talking.` |
| src/data.js:243 | `The foreman starts with all the oxygen. Cut value V: pay V into the reserve. Pass all your oxygen left after your turn. Each round the foreman (or the next player with wires) collects the reserve. No talking.` | `Oxygen passes round the table. Pay V to cut V. No talking.` |
| src/data.js:246 | `Timed final job on the bunker map. Every cut moves the crew toward a side whose restriction it met. Reach the key, the guard, the stairs, the lever and the doctor in time, then finish the bomb.` | `Timed finale. Each cut moves the crew on the map. Reach every objective.` |
| start.js:90 | `<b>Digital safeguard:</b> if four full rounds pass with no wire cut, the bomb explodes, so a game can never stall. This is not in the printed rules.` | `<b>Safeguard:</b> four rounds with no cut sets off the bomb.` |
| story.js:16 | `Quill taped a ticking rig to the shop door. Cut all '+n+' wires together before the fuse dies.` | `Cut all '+n+' wires together before the fuse dies.` |
| story.js:17 | `Rookie, these wires are yours. Only you see the numbers, lowest on the left.` | `These are your wires, rookie. Lowest number sits on the left.` |
| story.js:18 | `Teal and Plum hold the rest. You see their backs, they never see yours. Trust them.` | `Teal and Plum hold the rest. You only see their backs.` |
| story.js:19 | `Three steps stand between us and Quill. A wrong cut burns one. A red wire ends it.` | `You have three fuse steps. A wrong cut burns one; red ends it.` |
| story.js:20 | `First, the crew shows one wire each. Tap your 3 and a token tells everyone its number.` | `Everyone shows one wire first. Tap your 3 to show it.` |
| story.js:21 | `Teal and Plum showed theirs. Tokens are clues the whole crew shares. Use them.` | `Teal and Plum showed theirs. Tokens are clues for everyone.` |
| story.js:23 | `Say a number you hold. Tap one of your 2s: if Teal has a 2 too, you both cut.` | `Tap one of your 2s. If Teal\'s wire is a 2, you both cut.` |
| story.js:24 | `Both 2s cut! Rewind just unlocked. One cut per turn, then it passes clockwise.` | `Both 2s cut! Rewind unlocked. You get one cut per turn.` |
| story.js:25 | `Watch: Teal used your token to cut your 3. Plum held the last 3s and cut them alone.` | `Teal used your token to cut your 3. Plum cut the last 3s alone.` |
| story.js:26 | `Quill\'s rigs punish guesses, so we practise failing. Tap Plum\'s second wire.` | `Let us practise a miss. Tap Plum\'s second wire.` |
| story.js:28 | `Tick, tick. The fuse burned a step, and a token shows the true number: a ` | `Tick, tick. A fuse step burned. The token shows the true number: a ` |
| story.js:29 | `Teal used that token to cut a 1, Plum cut the last. A green check marks a finished number.` | `Teal cut a 1 using that token. A green check means done.` |
| story.js:30 | `Your trick: once per job, point at two wires and say one number. It hits if either matches.` | `Once per job: point at two wires, say one number. Either match hits.` |
| story.js:31 | `Rewind is ready. Tap it to turn the fuse back one step. Gear works once.` | `Rewind is ready. Tap it to restore one fuse step.` |
| story.js:32 | `Quill loves yellow: a yellow only matches a yellow. You hold one, so tap Plum\'s last wire.` | `A yellow only matches a yellow. You hold one, so tap Plum\'s last wire.` |
| story.js:33 | `Say your yellow wire. That is the only way a yellow ever matches.` | `Tap your yellow wire to say yellow.` |
| story.js:34 | `Never point at red or it blows. If red is all you hold, it reveals itself.` | `Never point at red: it blows up. A hand of only reds shows itself.` |
| story.js:35 | `You hold every 2 left, so cut them alone. Tap one: both go, no risk.` | `You hold every 2 left. Tap one to cut them safely.` |
| story.js:38 | `Quill\'s key lies on the step. You know every rule. Real jobs add twists: the lightbulb explains them.` | `Quill\'s key lies on the step. Real jobs add twists; the lightbulb explains them.` |
| story.js:40 | `<b>2.</b> Then tap one of YOUR numbers to say it. Your number must be one you hold.` | `<b>2.</b> Then tap one of YOUR numbers to say it.` |
| story.js:40 | `<b>4.</b> Then the next player goes, clockwise. The computer crew plays step by step.` | `<b>4.</b> Then play passes clockwise. The computer crew plays step by step.` |
| story.js:40 | `<b>5.</b> Cut every wire before the fuse runs out. Red wires blow up: never point at one.` | `<b>5.</b> Cut every wire before the fuse runs out. Never point at red.` |
| story.js:46 | `Rookie, the wires at the bottom are yours. Only you see the numbers, lowest on the left.` | `The bottom wires are yours, rookie. Lowest number is on the left.` |
| story.js:47 | `Teal and Plum hold the rest. You see their backs, they never see yours. Trust them.` | `Teal and Plum hold the rest. You only see their backs.` |
| story.js:48 | `Three steps stand between us and Quill. A wrong cut burns one. A red wire ends it.` | `You have three fuse steps. A wrong cut burns one; red ends it.` |
| story.js:50 | `Teal and Plum showed theirs. Tokens are clues the whole crew shares. Use them.` | `Teal and Plum showed theirs. Tokens are clues for everyone.` |
| story.js:51 | `Tap a crewmate\'s wire you want to guess, then tap one of your own numbers to say it. It must be a number you hold.` | `Tap a crewmate\'s wire, then tap a number you hold to say it.` |
| story.js:52 | `Both wires are cut. One cut per turn, then it passes clockwise.` | `Both wires are cut. Play now passes clockwise.` |
| story.js:53 | `Nice. The token and the sorted order told you what it had to be.` | `Nice read. The token and sort order gave it away.` |
| story.js:54 | `The fuse burned a step, and a token now shows the wire\'s true number. Your wire stays hidden.` | `A fuse step burned. A token now shows the wire\'s number.` |
| story.js:55 | `A miss costs the whole crew. Check the tokens and the sort order before you guess.` | `A miss costs the whole crew. Check tokens and sort order first.` |
| story.js:56 | `You hold every one of that number left, so you cut them alone. No guessing, no risk.` | `You hold every wire left of that number. Cut them safely, alone.` |
| story.js:58 | `Your crew plays by the same rules. They guess from tokens and sort order too.` | `Your crew guesses from tokens and sort order, like you.` |
| story.js:59 | `Every wire of that number is cut: the green check goes up. That number is finished.` | `All four are cut, so the green check goes up.` |
| story.js:60 | `Rewind is ready: it turns the fuse back one step. Tap it on your turn. Gear works once.` | `Rewind is ready. On your turn, tap it to restore one fuse step.` |
| story.js:61 | `Your trick, once per job: point at two wires and say one number. It hits if either matches.` | `Once per job: point at two wires, say one number. Either match hits.` |
| story.js:62 | `Quill loves yellow. A yellow only matches a yellow, and you must hold one to say "yellow".` | `A yellow only matches a yellow. You must hold one to say it.` |
| story.js:63 | `Ha! Your crew just burned a fuse step. Everyone misses sometimes. Watch the tokens it leaves.` | `Ha! Your crew burned a fuse step. Check the token it left.` |
| story.js:64 | `Never point at red or it blows. If red is all you hold, it reveals itself.` | `Never point at red: it blows up. A hand of only reds shows itself.` |
| tbl.js:193 | `Point at a crew wire and say a number you hold: a match cuts both wires.` | `Point at a crew wire, say a number you hold. A match cuts both.` |
| texts.js:4 | `Day one at the depot. Brix wheels in a practice charge: six colours of blue, no tricks. Learn to point, call and snip.` | `Day one. Brix brings a practice bomb: six blue numbers, no tricks.` |
| texts.js:5 | `Same practice rig, now with two yellow leads taped in. Yellow is just "yellow": you can only match it with one of your own.` | `Same practice bomb, plus two yellow wires. Match a yellow with your own yellow.` |
| texts.js:6 | `The trainers hid a red lead in the bundle. Touch it and the paint bomb goes off all over the depot. Your first gear arrives.` | `A red wire hides in the bundle. Touch it and it blows. Gear arrives.` |
| texts.js:7 | `A real call-out: an old cinema basement. Every blue colour, one red, two yellows. Nothing new, so nothing to blame.` | `An old cinema basement. All the blue wires, one red, two yellows.` |
| texts.js:73 | `Number cards set an order: cut the shown count of each value before the next one opens.` | `Number cards set an order. Finish each value before the next opens.` |
| texts.js:74 | `No fixed order: after a turn, anyone eligible may claim the next one (never twice in a row).` | `Anyone may claim the next turn, but never twice in a row.` |
| texts.js:77 | `Each gear card also needs two wires of its cover number cut before it unlocks.` | `Each gear card also needs its cover number cut twice to unlock.` |
| texts.js:79 | `The foreman-card holder is the rookie: a missed dual cut is a boom, and no Damper.` | `The foreman-card holder is the rookie: a miss is a boom.` |
| texts.js:86 | `Big Ears (job 25): no numbers out loud. Deep Dive, Bottle Post and Unsinkable (44, 49, 63): no talking at all, only a thumbs-up for "I need oxygen". The page lets you talk through the rules anyway.` | `Job 25: no numbers aloud. Jobs 44, 49, 63: no talking at all.` |
| texts.js:119 | `Every miss burns one step, and the last step is the explosion. Point at wires the crew knows more about (tokens, sorted order), use a Twin Probe on a 50/50, and keep Rewind for the last step.` | `Guess wires the tokens and sort order point to. Keep Rewind for the last step.` |
| texts.js:120 | `Red wires go off when pointed at. Watch the red markers on the track: they show which values a red sits between. A wire whose neighbours are close to a red value is risky.` | `Watch the red markers on the track. Wires near a red value are risky.` |
| texts.js:121 | `In timed jobs, quick certain cuts are worth more than careful 50/50s. Solo cuts and probes save turns.` | `In timed jobs, take safe cuts fast. Solo cuts and probes save turns.` |
| texts.js:123 | `Your own flipped wire is the one you cannot see: cut it only when the crew\'s tokens and the sort order leave one value.` | `Cut your flipped wire only when tokens and sort order leave one value.` |
| texts.js:124 | `When nobody can cut, the bomb goes off. Keep options open: do not leave a value spread so thin that nobody can match it.` | `When nobody can cut, the bomb goes off. Keep matches possible.` |
| texts.js:126 | `In the bunker every cut moves the crew. Pick cuts whose value meets the restriction on the side you need to go.` | `Choose cuts that meet the restriction on your target side.` |
| texts.js:131 | `You defuse the bomb together. <b>Cut every wire</b> on every stand to win. The <b>fuse</b> (top of the panel) burns one step on every miss: when it is gone, boom.` | `Defuse the bomb together: <b>cut every wire</b>. Each miss burns one <b>fuse</b> step.` |
| texts.js:132 | `Your wires stand at the front of the table, face up for you and sorted from low to high. Your crewmates see only the backs, and you see only theirs. Their wires are sorted too.` | `Your wires face you, sorted low to high. Crewmates see only their backs.` |
| texts.js:133 | `Everyone starts by showing one wire to the crew: a token with its number goes in front of it. Pick one of yours.` | `Everyone starts by showing one wire with a token. Pick one of yours.` |
| texts.js:134 | `Tap a <b>glowing wire of a crewmate</b>, then say a number <b>you hold</b>. Right: both wires are cut. Wrong: the fuse burns a step. Clues: the shown numbers, and every rack is sorted low to high.` | `Tap a <b>glowing crew wire</b>, then say a number <b>you hold</b>. A match cuts both.` |
| texts.js:135 | `Now pick the number you think it is. You can only say numbers you hold yourself. Tokens and the sort order are your clues.` | `Pick the number you think it is. Tokens and sort order are clues.` |
| texts.js:136 | `Check the summary and press the big button. The "What we know" box suggests a move and says why.` | `Check the summary, then press the big button.` |
| texts.js:137 | `A hit cuts their wire and one of yours of the same value. When all four of a value are cut, a green check goes on the track.` | `A hit cuts both wires. All four of a number cut earns a green check.` |
| texts.js:138 | `A miss burns one step of the fuse, and the crewmate puts a token showing the true number in front of that wire. Now everyone knows it.` | `A miss burns a fuse step. A token then shows the true number.` |
| texts.js:139 | `If you hold <b>all</b> the wires still left of a value (all four, or the last two), you may cut them yourself without pointing: a solo cut never fails. Look for the solo button.` | `Hold <b>all</b> the wires left of a number? Cut them yourself, safely.` |
| texts.js:140 | `The bulb button opens the full table of what every wire could be. Use it whenever you are unsure.` | `The bulb shows what every wire could be. Use it when unsure.` |
| texts.js:157 | `If <b>every</b> remaining uncut wire of a value is in your hand (all four, or the last two after a pair was cut), you may cut them all at once. It never fails. You can never solo cut three.` | `Hold <b>every</b> uncut wire of a number? Cut them all at once. It never fails.` |
| texts.js:163 | `A hand with no legal cut skips its turn (only jobs 9, 16 and 36 blow the bomb). If the crew makes no progress for four rounds, the bomb goes off so a game cannot run forever. When only red wires remain, they are revealed for you. Earlier answers stay visible on the page.` | `If the crew cuts nothing for four rounds, the bomb goes off.` |
| texts.js:164 | `You may not tell crewmates what you hold. The page enforces that: the only ways to share are the moves themselves, the tokens and the answers the rules ask for.` | `Never tell crewmates what you hold. Share only through moves and tokens.` |
| texts.js:165 | `It starts with one step per player (some jobs start lower) and can never go above 6. A miss burns one step; at zero the bomb explodes.` | `One step per player, never above 6. A miss burns one step.` |
| texts.js:166 | `From job 3, one gear card per player lies on the board, locked. Each card unlocks the moment two wires of its number are cut (double cards: all four). It then works once. "Any time" cards may be used even when it is not your turn (not in the middle of a question). "Your turn" cards are part of your action. Open <b>Gear</b> to read them all.` | `From job 3, each player gets a locked gear card. Cut two of its number to unlock it.` |
| texts.js:167 | `Everyone has a crew card with a personal tool, usually a <b>Twin Probe</b>: once per job, point at two wires on one crewmate stand and say a number; it works if either matches (one red plus one other: no explosion and the token goes on the other wire; both red: boom). From job 31 new crew members bring other tools.` | `Your crew card has a tool, usually a <b>Twin Probe</b>, usable once per job.` |
| texts.js:168 | `From job 9 most jobs add a twist: an order to follow, a timer, restrictions, robots, oxygen... The <b>Job</b> button opens the job card with every special rule as a picture and a line of text.` | `From job 9, most jobs add a twist. The <b>Job</b> button explains it.` |
| texts.js:169 | `The <b>dock</b> (right, or under the board on a phone) always says what the game is waiting for, with a button for every option.` | `The <b>dock</b> says what the game waits for, with a button per option.` |
| ui.js:195 | `Pick one of the glowing wires, or use the buttons.` | `Tap a glowing wire or a button.` |
| ui.js:200 | `Pick which of your flipped wires you mean with the buttons.` | `Choose your flipped wire with the buttons.` |
| ui.js:207 | `Those are your own wires: point at a crewmate\'s wire.` | `Those are yours. Point at a crewmate\'s wire.` |
| ui.js:290 | `The row of cards on the table mat is the crew\'s equipment. A card is <b>locked</b> until the crew cuts the numbers named on it, then it is <b>ready</b> for one use (or every turn, if it says so) and then <b>used</b>. Personal tools sit on each player\'s crew card.` | `Gear starts <b>locked</b>, turns <b>ready</b> when its numbers are cut, then <b>used</b>.` |
| ui.js:290 | `<b>This training job has no equipment cards.</b> Your crew card still has its <b>Twin Probe</b>: once per job, point at two wires of one crewmate and say one value; if either matches, it is a hit. Gear cards appear in later jobs: they unlock when the crew cuts certain numbers, and this drawer will show them.` | `<b>This job has no gear.</b> Your <b>Twin Probe</b> still works once. Gear comes later.` |

Lines fixed: 129
