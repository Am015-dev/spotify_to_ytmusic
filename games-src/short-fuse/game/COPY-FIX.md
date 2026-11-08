Game: Short Fuse
Date: 2026-11-08

## Goal card

The Goal card (tbl.js:193, `renderOverlays`) states the aim in ONE sentence, so it is ok: `Cut all ${wires} wires together before the fuse (${steps} steps) runs out.` No change needed. Its three bullets below it are covered in the table. The Learn-to-play goal bubbles (story.js, first rows) carry two sentences of story; the table trims them to the aim.

| file:line | old line | new line |
|---|---|---|
| hlp.js:26 | `Tap one of your wires. A token with its number goes in front of it for the whole crew.` | `Tap one of your wires. A token shows its number to everyone.` |
| hlp.js:27 | `Tap a crewmate\'s glowing wire, then tap one of your own numbers: the one you think it is.` | `Tap a glowing crew wire, then one of your numbers.` |
| hlp.js:28 | `Tap a glowing wire of yours: the number you say. It must be one you hold.` | `Tap a glowing wire of yours to say its number.` |
| hlp.js:29 | `Tap the crewmate\'s wire you think has your number. A match cuts both wires.` | `Tap the crew wire you think matches. A match cuts both.` |
| hlp.js:30 | `You hold every wire left of this number. Tap one: all of them are cut, and it cannot fail.` | `You hold all wires left of this number. Tap one: safe cut.` |
| hlp.js:31 | `Tap one red wire to show your reds. You are then finished, and nothing blows up.` | `Tap a red wire to show your reds. Nothing blows up.` |
| hlp.js:40 | `Each wrong cut burns one fuse step. With no step left the bomb goes off. A red wire ends the job at once.` | `Each wrong cut burns a fuse step. With none left, boom.` |
| hlp.js:44 | `Point at a crewmate\'s wire and say a number you hold. If they have that number, both wires are cut.` | `Point at a crew wire, say a number you hold.` |
| hlp.js:45 | `If the wire is not that number, the fuse burns one step. A token then shows the true number.` | `A wrong guess burns a fuse step and shows a token.` |
| hlp.js:47 | `Red wires must never be cut. Pointing at one blows up the bomb, so only point at wires you trust.` | `Never point at a red wire. It blows up the bomb.` |
| hlp.js:48 | `You can only say a number that you hold yourself. Tap one of your glowing wires.` | `You can only say a number you hold. Tap a glowing wire.` |
| hlp.js:49 | `A match cuts both wires: theirs and yours. When all four of a number are cut, it is finished.` | `A match cuts both wires. Four cut means the number is done.` |
| hlp.js:52 | `If you hold every uncut wire of a number, cut them yourself. A solo cut never fails and costs nothing.` | `Hold every uncut wire of a number? Cut them, risk free.` |
| hlp.js:59 | `The light bulb shows the crew advisor\'s pick, with a reason. You can follow it or choose your own.` | `The light bulb suggests a move and says why. You choose.` |
| hlp.js:60 | `Gear cards unlock when the crew cuts certain numbers. Tap a glowing card to use it once.` | `Gear unlocks when the crew cuts certain numbers. Tap a glowing card.` |
| src/data.js:183 | `Blue 1 to 10 plus one red (from 1.5 to 9.5). Pointing at a red ends the job. A hand of only reds is revealed at the start of its turn. Equipment arrives: one card per player (Handsets and Equal Tag are swapped out).` | `Blue 1 to 10, one red. Pointing at red ends the job.` |
| src/data.js:190 | `Against the clock (15 minutes, 12 with two players). No fixed order: when a turn ends, anyone may claim the next one, but never two in a row (unless only two of you, or you are the last with wires). Coffee Break is swapped out.` | `Timed job. Anyone may claim the next turn, never twice running.` |
| src/data.js:193 | `The three reds are dealt one per player from the foreman. Opening tokens are drawn at random. Reds go only by a special action: point at three uncut wires anywhere at once; if any is not red, boom. Equipment and probes cannot choose reds (pointing one at a red is a boom). A hand of only reds must try it.` | `The three reds go only together, by pointing at all three.` |
| src/data.js:194 | `Crew cards are dealt at random; whoever gets the foreman card is the rookie. If the rookie misses a dual cut, boom. The rookie may not use the Damper.` | `The foreman-card holder is the rookie. A rookie miss is a boom.` |
| src/data.js:197 | `Crew cards are dealt at random; the foreman card holder is the fibber. The fibber opens with two false tokens, and every token in the fibber\'s hand means "NOT this value". The fibber may not use equipment, but may join a Handsets trade and answer a Sweep.` | `The foreman-card holder is the fibber. Their tokens mean NOT this value.` |
| src/data.js:203 | `No equipment on the board: seven face-down cards wait in a pile. A number card is shown; its four wires go only all at once, by pointing at all four (boom if wrong). Until then, one card of the pile burns each round. After it, the rest of the pile is ready.` | `Cut all four wires of the shown number at once, or boom.` |
| src/data.js:219 | `No equipment. A number card is shown; its four wires go only all at once (boom if wrong). A deck of eight number cards burns one per round until then; afterwards the rest are dealt out as extra tokens. Opening tokens are drawn at random.` | `No gear. Cut all four wires of the shown number at once.` |
| src/data.js:224 | `A shared oxygen reserve (2 per player). Each cut costs 1, 2 or 3 by depth. It all comes back each round, when the turn passes the foreman\'s seat. Cannot pay: skip and burn a step. No talking.` | `Shared oxygen pays for cuts. Cannot pay? Burn a step. No talking.` |
| story.js:16 | `Quill taped a ticking rig to the shop door. Cut all '+n+' wires together before the fuse dies.` | `Cut all '+n+' wires together before the fuse dies.` |
| story.js:17 | `Rookie, these wires are yours. Only you see the numbers, lowest on the left.` | `These are your wires, rookie. Lowest number sits on the left.` |
| story.js:18 | `Teal and Plum hold the rest. You see their backs, they never see yours. Trust them.` | `Teal and Plum hold the rest. You only see their backs.` |
| story.js:19 | `Three steps stand between us and Quill. A wrong cut burns one. A red wire ends it.` | `You have three fuse steps. A miss burns one; red ends it.` |
| story.js:20 | `First, the crew shows one wire each. Tap your 3 and a token tells everyone its number.` | `Everyone shows one wire first. Tap your 3 to show it.` |
| story.js:23 | `Say a number you hold. Tap one of your 2s: if Teal has a 2 too, you both cut.` | `Tap a 2. If Teal\'s wire is a 2, you both cut.` |
| story.js:24 | `Both 2s cut! Rewind just unlocked. One cut per turn, then it passes clockwise.` | `Both 2s cut! Rewind unlocked. You get one cut per turn.` |
| story.js:25 | `Watch: Teal used your token to cut your 3. Plum held the last 3s and cut them alone.` | `Teal cut your 3 using your token. Plum cut the rest.` |
| story.js:28 | `Tick, tick. The fuse burned a step, and a token shows the true number: a ` | `Tick, tick. A fuse step burned. The true number is a ` |
| story.js:29 | `Teal used that token to cut a 1, Plum cut the last. A green check marks a finished number.` | `Teal cut a 1 using that token. A green check means done.` |
| story.js:30 | `Your trick: once per job, point at two wires and say one number. It hits if either matches.` | `Once per job: two wires, one number. Either match hits.` |
| story.js:31 | `Rewind is ready. Tap it to turn the fuse back one step. Gear works once.` | `Rewind is ready. Tap it to restore one fuse step.` |
| story.js:32 | `Quill loves yellow: a yellow only matches a yellow. You hold one, so tap Plum\'s last wire.` | `Yellow matches only yellow. You hold one, so tap Plum\'s last wire.` |
| story.js:34 | `Never point at red or it blows. If red is all you hold, it reveals itself.` | `Never point at red. A hand of only reds shows itself.` |
| story.js:35 | `You hold every 2 left, so cut them alone. Tap one: both go, no risk.` | `You hold every 2 left. Tap one to cut them safely.` |
| story.js:38 | `Quill\'s key lies on the step. You know every rule. Real jobs add twists: the lightbulb explains them.` | `Real jobs add twists. The lightbulb explains them.` |
| story.js:40 | `<b>5.</b> Cut every wire before the fuse runs out. Red wires blow up: never point at one.` | `<b>5.</b> Cut every wire before the fuse ends. Never point at red.` |
| story.js:46 | `Rookie, the wires at the bottom are yours. Only you see the numbers, lowest on the left.` | `The bottom wires are yours, rookie. Lowest number is on the left.` |
| story.js:47 | `Teal and Plum hold the rest. You see their backs, they never see yours. Trust them.` | `Teal and Plum hold the rest. You only see their backs.` |
| story.js:48 | `Three steps stand between us and Quill. A wrong cut burns one. A red wire ends it.` | `You have three fuse steps. A miss burns one; red ends it.` |
| story.js:51 | `Tap a crewmate\'s wire you want to guess, then tap one of your own numbers to say it. It must be a number you hold.` | `Tap a crewmate\'s wire, then a number you hold.` |
| story.js:52 | `Both wires are cut. One cut per turn, then it passes clockwise.` | `Both wires are cut. Play now passes clockwise.` |
| story.js:54 | `The fuse burned a step, and a token now shows the wire\'s true number. Your wire stays hidden.` | `A fuse step burned. A token now shows the wire\'s number.` |
| story.js:56 | `You hold every one of that number left, so you cut them alone. No guessing, no risk.` | `You hold every wire left of that number. Cut them safely, alone.` |
| story.js:59 | `Every wire of that number is cut: the green check goes up. That number is finished.` | `All four are cut, so the green check goes up.` |
| story.js:60 | `Rewind is ready: it turns the fuse back one step. Tap it on your turn. Gear works once.` | `Rewind is ready. Tap it to restore one fuse step.` |
| story.js:61 | `Your trick, once per job: point at two wires and say one number. It hits if either matches.` | `Once per job: two wires, one number. Either match hits.` |
| story.js:62 | `Quill loves yellow. A yellow only matches a yellow, and you must hold one to say "yellow".` | `Yellow matches only yellow. You must hold one to say it.` |
| story.js:63 | `Ha! Your crew just burned a fuse step. Everyone misses sometimes. Watch the tokens it leaves.` | `Ha! Your crew burned a fuse step. Check the token it left.` |
| story.js:64 | `Never point at red or it blows. If red is all you hold, it reveals itself.` | `Never point at red. A hand of only reds shows itself.` |
| tbl.js:193 | `Point at a crew wire and say a number you hold: a match cuts both wires.` | `Point at a crew wire, say a number you hold.` |
| texts.js:79 | `The foreman-card holder is the rookie: a missed dual cut is a boom, and no Damper.` | `The foreman-card holder is the rookie: a miss is a boom.` |
| texts.js:86 | `Big Ears (job 25): no numbers out loud. Deep Dive, Bottle Post and Unsinkable (44, 49, 63): no talking at all, only a thumbs-up for "I need oxygen". The page lets you talk through the rules anyway.` | `Job 25: say no numbers. Jobs 44, 49, 63: no talking.` |
| texts.js:119 | `Every miss burns one step, and the last step is the explosion. Point at wires the crew knows more about (tokens, sorted order), use a Twin Probe on a 50/50, and keep Rewind for the last step.` | `Guess using tokens and sort order. Save Rewind for the last step.` |
| texts.js:120 | `Red wires go off when pointed at. Watch the red markers on the track: they show which values a red sits between. A wire whose neighbours are close to a red value is risky.` | `Watch the red markers on the track. Nearby wires are risky.` |
| texts.js:123 | `Your own flipped wire is the one you cannot see: cut it only when the crew\'s tokens and the sort order leave one value.` | `Cut a flipped wire only when one value is possible.` |
| texts.js:126 | `In the bunker every cut moves the crew. Pick cuts whose value meets the restriction on the side you need to go.` | `Choose cuts that meet the restriction on your target side.` |
| texts.js:131 | `You defuse the bomb together. <b>Cut every wire</b> on every stand to win. The <b>fuse</b> (top of the panel) burns one step on every miss: when it is gone, boom.` | `Defuse together: <b>cut every wire</b>. Each miss burns a <b>fuse</b> step.` |
| texts.js:134 | `Tap a <b>glowing wire of a crewmate</b>, then say a number <b>you hold</b>. Right: both wires are cut. Wrong: the fuse burns a step. Clues: the shown numbers, and every rack is sorted low to high.` | `Tap a <b>glowing crew wire</b>, then a number <b>you hold</b>.` |
| texts.js:137 | `A hit cuts their wire and one of yours of the same value. When all four of a value are cut, a green check goes on the track.` | `A hit cuts both wires. Four cut earns a green check.` |
| texts.js:138 | `A miss burns one step of the fuse, and the crewmate puts a token showing the true number in front of that wire. Now everyone knows it.` | `A miss burns a fuse step. A token shows the number.` |
| texts.js:139 | `If you hold <b>all</b> the wires still left of a value (all four, or the last two), you may cut them yourself without pointing: a solo cut never fails. Look for the solo button.` | `Hold <b>all</b> the wires left of a number? Cut them yourself, safely.` |
| texts.js:143 | `A villain has wired a bomb. Your crew of 2 to 5 defuses it <b>together</b>: you win when <b>every wire</b> on every stand is cut or revealed. You lose if the fuse burns down, if anyone points at a red wire, or if the job's own special rule says so.` | `Defuse <b>together</b>: cut or reveal <b>every wire</b> before the fuse ends.` |
| texts.js:157 | `If <b>every</b> remaining uncut wire of a value is in your hand (all four, or the last two after a pair was cut), you may cut them all at once. It never fails. You can never solo cut three.` | `Hold <b>every</b> uncut wire of a number? Cut them all, risk free.` |
| texts.js:163 | `A hand with no legal cut skips its turn (only jobs 9, 16 and 36 blow the bomb). If the crew makes no progress for four rounds, the bomb goes off so a game cannot run forever. When only red wires remain, they are revealed for you. Earlier answers stay visible on the page.` | `If the crew cuts nothing for four rounds, the bomb goes off.` |
| texts.js:164 | `You may not tell crewmates what you hold. The page enforces that: the only ways to share are the moves themselves, the tokens and the answers the rules ask for.` | `Never tell crewmates what you hold. Share only through moves and tokens.` |
| texts.js:165 | `It starts with one step per player (some jobs start lower) and can never go above 6. A miss burns one step; at zero the bomb explodes.` | `One step per player, never above 6. A miss burns one step.` |
| texts.js:166 | `From job 3, one gear card per player lies on the board, locked. Each card unlocks the moment two wires of its number are cut (double cards: all four). It then works once. "Any time" cards may be used even when it is not your turn (not in the middle of a question). "Your turn" cards are part of your action. Open <b>Gear</b> to read them all.` | `From job 3, each player has a locked gear card.` |
| texts.js:167 | `Everyone has a crew card with a personal tool, usually a <b>Twin Probe</b>: once per job, point at two wires on one crewmate stand and say a number; it works if either matches (one red plus one other: no explosion and the token goes on the other wire; both red: boom). From job 31 new crew members bring other tools.` | `Your crew card has a tool, often a <b>Twin Probe</b>.` |
| texts.js:168 | `From job 9 most jobs add a twist: an order to follow, a timer, restrictions, robots, oxygen... The <b>Job</b> button opens the job card with every special rule as a picture and a line of text.` | `From job 9, jobs add twists. The <b>Job</b> button explains.` |
| ui.js:290 | `The row of cards on the table mat is the crew\'s equipment. A card is <b>locked</b> until the crew cuts the numbers named on it, then it is <b>ready</b> for one use (or every turn, if it says so) and then <b>used</b>. Personal tools sit on each player\'s crew card.` | `Gear starts <b>locked</b>, turns <b>ready</b> when its numbers are cut, then <b>used</b>.` |
| ui.js:290 | `<b>This training job has no equipment cards.</b> Your crew card still has its <b>Twin Probe</b>: once per job, point at two wires of one crewmate and say one value; if either matches, it is a hit. Gear cards appear in later jobs: they unlock when the crew cuts certain numbers, and this drawer will show them.` | `<b>No gear in this job.</b> Your <b>Twin Probe</b> still works once.` |

Lines fixed: 75
