# Nebula Aces: copy fixes

Goal card verdict: rewritten. The aim is already one plain line on the card ("Destroy the enemy ship"), but the long story text behind it (story.js briefingHTML) stacks clauses and says "Win:". Rows for it are below. Nebula Aces has no points to score, so no scoring bullets are needed.

| # | file:line | old line | new line |
|---|---|---|---|
| 1 | lore.js:8 | Slate is raiding our convoy. Smash his ship before it reaches the freighters. Yours is at the bottom. | Slate is raiding our convoy. Destroy his ship. Yours is below. |
| 2 | lore.js:9 | Pilots plan in secret, Varro. Slate is doing it right now. Touch your ship to see where it can fly. | Touch your ship to see where it can fly. |
| 3 | lore.js:10 | Red moves strain the engines: stress token. A ! marks paths through the rock, which hurts and skips your action. | Red moves give a stress token. A ! means an asteroid: damage, no action. |
| 4 | lore.js:11 | Number is speed, arrow is direction, green is easy. Fly the green straight 2 to meet him head on. | The number is speed. Green is easy. Pick the green straight 2. |
| 5 | lore.js:12 | Neither of you can peek. When you are set, reveal the dials and let the ships move together. | Both dials are hidden. Tap Fly to reveal them. |
| 6 | lore.js:13 | Slate shows his hand! Lowest skill moves first: Slate (3), then you (8). Highest shoots first, so you do. | Lowest skill moves first: Slate (3), then you (8). You shoot first. |
| 7 | lore.js:14 | After flying, every ship gets one action. Sharpen your aim with a focus token before you fire. | Each ship gets one action after moving. Take Focus to aim better. |
| 8 | lore.js:16 | Hits and crits hurt him. A focus face does nothing, unless you spend your focus token. | Hits and crits hurt him. Focus faces need a focus token. |
| 9 | lore.js:17 | There it is. Your focus token turns that focus face into a hit. | Your focus token turns that focus face into a hit. |
| 10 | lore.js:18 | That is all we can improve. Now Slate rolls his defence dice. Let it fly. | Tap Roll. Slate then rolls his defence dice. |
| 11 | lore.js:19 | Not so fast! I spent my evade token: each evade cancels one hit. Only one gets through. | My evade token cancels a hit. Only one gets through. |
| 12 | lore.js:20 | He is firing back! Kael’s gift: turn one focus result into an evade. Use it now. | He fires back. Kael can turn one focus result into an evade. |
| 13 | lore.js:21 | Hits strip shields before hull. Unused focus and evade tokens vanish at the round end. Round two! | Shields take hits before the hull. Unused tokens vanish at round end. |
| 14 | lore.js:22 | Slate is rattled. Let the computer suggest a move for each ship; you can always choose your own. | The computer can suggest a move. You can always choose your own. |
| 15 | lore.js:23 | Slate has the lower skill, so he moves before you. Reveal the dials. | Slate has lower skill, so he moves first. Tap Fly. |
| 16 | lore.js:24 | Whoa! That red K-turn gave me a stress token. No action for me, and I am facing away! | That red K-turn stressed me. No action, and I face away. |
| 17 | lore.js:25 | He cannot shoot back. Lock on: a lock lets you reroll attack dice against him. | He cannot shoot back. Take a target lock to reroll attack dice. |
| 18 | lore.js:26 | Range 1 adds an attack die, and he is facing away. Take the shot. | Range 1 adds an attack die. Take the shot. |
| 19 | lore.js:31 | Convoy saved. Plan, fly, act, shoot, defend. Shields, hull, stress and locks come with you. | Convoy saved. You can now plan, fly, act, shoot and defend. |
| 20 | lore.js:31 | Convoy saved. Plan, fly, act, shoot, defend. The Armada will not stop at one raider: chapter 1 awaits. | Convoy saved. The Armada has more raiders. On to chapter 1. |
| 21 | lore.js:39 | From here you fly free: every legal move is yours. Brecken speaks up when a rule matters. | From here you choose every move. Brecken speaks up when a rule matters. |
| 22 | lore.js:41 | Barrel roll and boost: sideways and bonus moves, in the action ring. | Barrel roll and boost are extra moves in the action ring. |
| 23 | lore.js:43 | Slate is raiding our convoy. Destroy his ship; yours is at the bottom. | Slate is raiding our convoy. Destroy his ship. Yours is below. |
| 24 | lore.js:44 | Your move is set. Plan, then reveal the dials with Fly. I will call out rules as they matter. | Plan, then tap Fly. I will explain rules as we go. |
| 25 | lore.js:45 | Neither of you can peek. Reveal the dials with Fly and the ships move together. | Dials stay hidden until you tap Fly. Then the ships move. |
| 26 | lore.js:46 | Red moves strain the engines: a stress token. A ! marks paths through a rock: it hurts and skips your action. | Red moves give a stress token. A ! means an asteroid: damage, no action. |
| 27 | lore.js:47 | Lowest pilot skill moves first: Slate (3), then you (8). The highest shoots first, so you do. | Lowest skill moves first: Slate (3), then you (8). You shoot first. |
| 28 | lore.js:49 | A lock lets you reroll attack dice against that enemy. Take it if you want a surer shot. | A target lock lets you reroll attack dice against that enemy. |
| 29 | lore.js:50 | Pick a glowing enemy in your arc. Range 1 adds an attack die; range 3 adds a defence die. | Tap a glowing enemy in your arc. Range 1: +1 attack die. Range 3: +1 defence die. |
| 30 | lore.js:52 | Your focus token turns a focus face into a hit. Spend it before you roll. | Your focus token turns a focus face into a hit. Spend it now. |
| 31 | lore.js:53 | Each evade cancels one hit. Defence dice and evade tokens are how a ship dodges. | Each evade cancels one hit. Defence dice and evade tokens make evades. |
| 32 | lore.js:55 | Damage strips shields before hull. Crits are dealt face up with lasting effects. | Shields take damage before the hull. A crit adds a face-up damage card. |
| 33 | lore.js:56 | That hit landed. Stay in his arc and keep the pressure on. | That hit landed. Keep him in your arc. |
| 34 | lore.js:57 | Ouch. Keep out of his front arc, or use an evade token before he shoots. | Ouch. Stay out of his front arc, or take an evade token. |
| 35 | lore.js:58 | A stressed ship can not act, and can not fly red until it flies a green move. | A stressed ship cannot act or fly red. A green move clears stress. |
| 36 | lore.js:59 | At the end of each round unused focus and evade tokens vanish. Target locks stay. | Unused focus and evade tokens vanish at round end. Target locks stay. |
| 37 | guide.js:73 | <b>Pick where your ship will fly.</b> Hover or tap a maneuver on the dial to see its ghost on the mat (the dashed one is the suggestion), then press <b>Lock in dials</b>. The enemy picks at the same time, in secret. | <b>Pick where your ship will fly.</b> Tap a move on the dial to see its ghost. The dashed one is suggested. Then press <b>Lock in dials</b>. |
| 38 | guide.js:74 | <b>Take one action.</b> Focus turns your ◉ results into hits when you attack, or into evades when you are shot. It is the safe default. | <b>Take one action.</b> Focus turns ◉ results into hits or evades. It is a safe pick. |
| 39 | guide.js:75 | <b>Only enemies inside the yellow wedge (your arc) can be shot.</b> Closer is better: range 1 adds an attack die, range 3 adds a defense die. | <b>You can shoot only enemies in your yellow arc.</b> Range 1 adds an attack die. Range 3 adds a defence die. |
| 40 | guide.js:76 | <b>That was one round:</b> Plan → Move (lowest skill first) → Combat (highest skill first) → End. Here is what happened: | <b>That was one round.</b> Plan, Move (lowest skill first), Combat (highest first), End. Here is what happened: |
| 41 | guide.js:101 | The defaults are a good first battle; the first round is guided. | The defaults make a good first battle. Round 1 is guided. |
| 42 | guide.js:104 | The middle of their half (★ ${recOpt(q).o.l}) is good. Or just press Auto-place: in a first game it doesn't matter much. Flying through a rock damages you; shooting past one gives the defender +1 die. | Try the middle of their half (★ ${recOpt(q).o.l}). Or press Auto-place: it hardly matters in a first game. Flying through an asteroid hurts you. Shooting past one gives the defender +1 die. |
| 43 | guide.js:106 | , higher than theirs, so you move last (you can react to them) and shoot first. | , higher than theirs. You move last, so you can react, and you shoot first. |
| 44 | guide.js:106 | , lower than theirs, so you move first and shoot last: keep your distance until you can line up a shot. | , lower than theirs. You move first and shoot last. Keep your distance until you can line up a shot. |
| 45 | guide.js:115 | Close in with a straight 3-4, or bank to stay outside their arcs: they must come to you. | Close in with a straight 3-4. Or stay out of their arcs and let them come. |
| 46 | guide.js:116 | Everyone rolls +1 attack die at range 1 | Range 1 adds an attack die for both sides |
| 47 | guide.js:116 | Stay at range 2, or line up so it's in your arc but you're not in its arc. | Stay at range 2, or keep it in your arc and stay out of its arc. |
| 48 | guide.js:126 | You're in ${esc(theirs[0].name)}'s arc with no shot of your own: an evade token cancels one hit. Focus works too and is more flexible. | ${esc(theirs[0].name)} has you in its arc and you have no shot. An evade token cancels one hit. Focus works too. |
| 49 | guide.js:127 | Focus turns your ◉ results into hits now, or into evades if you\'re shot. Target lock only if you\'ll surely shoot that ship (it lets you reroll). | Focus turns ◉ results into hits, or evades when you are shot. Take a target lock only if you will shoot that ship. |
| 50 | guide.js:142 | Tamper with their dice. | Change one of their dice. |
| 51 | guide.js:142 | Using it can cancel their best die; it is usually worth it. | It can cancel their best die. It is usually worth it. |
| 52 | guide.js:86 | The ship that bumps skips its action, and ships touching each other can't fire at each other. | The ship that bumps skips its action. Touching ships cannot shoot each other. |
| 53 | guide.js:88 | flew a red move and took stress: no action this turn, and no red moves until a green one clears it. | flew a red move and took stress. No action now, and no red moves until a green move clears it. |
| 54 | guide.js:95 | is stressed: no red moves and no action; a green move clears it. | is stressed. No red moves and no action until a green move clears it. |
| 55 | guide.js:68 | Cost: red = a stress token, so no action this turn and no red moves until a green one clears it. | Cost: a stress token. No action this turn, and no red moves until a green move clears it. |
| 56 | story.js:52 | is the only fighter between ${groupText(foe)} and the convoy.  | is the only fighter guarding the convoy from ${groupText(foe)}.  |
| 57 | story.js:55 | ' Win: destroy every enemy ship. You fly ' | ' Goal: destroy every enemy ship. You fly ' |
| 58 | story.js:55 | (orange tags at the bottom edge); the enemy starts at the top. | (orange tags, bottom edge). The enemy starts at the top. |
| 59 | story.js:57 | ☝ hold: story | ☝ hold to read the story |
| 60 | story.js:36 | A Talon Maul bomber is inbound for the convoy with an escort. It is slow and tough: stay out of its front arc and wear it down. | A Talon Maul bomber and an escort are heading for the convoy. The bomber is slow and tough. Stay out of its front arc. |
| 61 | story.js:39 | Four Armada fighters wait in the station’s shadow. You have a wingman this time: fly together so they can’t gang up on one of you. | Four Armada fighters wait in the station’s shadow. You have a wingman now. Fly together so they cannot gang up on one of you. |
| 62 | story.js:42 | Lord Castigan leads in person: two actions every turn. Focus your fire on his wingmen first, or on him if you catch him at range 1. | Lord Castigan leads in person and takes two actions a turn. Shoot his wingmen first, or him at range 1. |
| 63 | hlp.js:71 | title:'Rocks and edges' | title:'Asteroids and edges' |
| 64 | hlp.js:52 | Optionally change their attack dice, or let the attack stand. | You may change their attack dice, or let the attack stand. |
| 65 | hlp.js:86 | A crit also draws a damage card with a nasty effect. | A crit also deals a damage card with a lasting effect. |
| 66 | hlp.js:128 | Every move touches an asteroid; this one does the least harm. | Every move touches an asteroid. This one does the least harm. |
| 67 | flow.js:4 | {n:'Planning',sub:'set dials',t:'<b>Planning:</b> every pilot secretly picks one maneuver on its dial. Nobody moves yet.'} | {n:'Plan',sub:'set dials',t:'<b>Plan:</b> pick a move for each ship in secret. Nobody moves yet.'} |
| 68 | flow.js:5 | {n:'Activation',sub:'move + act',t:'<b>Activation:</b> one ship at a time reveals its dial and moves, <b>lowest pilot skill first</b>. After moving, each ship takes one action.'} | {n:'Move',sub:'move, act',t:'<b>Move:</b> ships reveal dials and move one at a time, <b>lowest pilot skill first</b>. Each then takes one action.'} |
| 69 | flow.js:7 | <b>End:</b> unused focus and evade tokens are removed (target locks and stress stay). Then the next round starts. | <b>End:</b> unused focus and evade tokens vanish. Target locks and stress stay. |
| 70 | flow.js:29 | Every round has the same 4 phases. | Every round has the same 4 steps. |
| 71 | flow.js:39 | title:'Activation order' | title:'Move order' |
| 72 | flow.js:56 | Why: its move ended on top of ${esc(m[2])}, so it stopped short and skips its action. Ships that touch can't shoot each other this round. | Its move ended on top of ${esc(m[2])}, so it stopped short. Ships that touch cannot shoot each other this round. |
| 73 | flow.js:56 | Next time pick a shorter, longer or sideways move so the bases do not overlap. | Next time pick a shorter, longer or sideways move. Ships must not overlap. |
| 74 | flow.js:57 | Why: a ship with a stress token (from a red move) can't take actions. | A stress token (from a red move) blocks actions. |
| 75 | flow.js:59 | , and a ship sitting on an asteroid can\'t shoot this round | . A ship on an asteroid cannot shoot this round |
| 76 | flow.js:59 | Check the ghost before you lock: a template that touches a rock costs your action. | Check the ghost before you lock in. A path that touches an asteroid costs your action. |
| 77 | flow.js:60 | </b>: no action while stressed, and no red moves until a green move clears it. | </b>. No action while stressed, and no red moves until a green move clears it. |
| 78 | flow.js:70 | too far: range 4 or more (weapons reach range 1-3) | too far (weapons reach range 1-3) |
| 79 | ui.js:59 | Destroy every enemy ship. ♥ hull left · ◈ shields left (shields go first) | Destroy every enemy ship. ♥ hull left, ◈ shields left. Shields take damage first. |
| 80 | ui.js:59 | Destroy every enemy ship. 🛩 ships left · ♥ hull left · ◈ shields left (shields go first). | Destroy every enemy ship. 🛩 ships left, ♥ hull left, ◈ shields left. Shields take damage first. |
| 81 | ui.js:163 | <b>Dice:</b> hits minus evades is damage; shields go first. | <b>Dice:</b> hits minus evades is damage. Shields take it first. |
| 82 | ui.js:163 | Asteroids are placed for you (6 of them, spaced apart). Ships start facing the enemy from set spots. The barrel-roll slide is offered in 5 steps. A battle with no winner after 100 rounds goes to the side that destroyed more points. | Asteroids go on fixed spots, spaced apart. Ships start facing the enemy. A barrel roll slides in 5 steps. After 100 rounds, the side that destroyed more points wins. |
| 83 | ui.js:162 | All sounds were trimmed, loudness-normalised and converted to MP3 for this game. | Sounds were trimmed, evened out and saved as MP3. |
| 84 | ui.js:168 | with a range-${x.rg} run | at range ${x.rg} |
| 85 | ui.js:169 | and came home with ${s.hull-hullDmg(s)}/${s.hull} hull. | and finished with ${s.hull-hullDmg(s)}/${s.hull} hull. |
| 86 | ui.js:175 | , then flew off the battlefield and was lost. Watch the edges: a move that ends off the mat destroys you. | , then flew off the mat and was lost. A move that ends off the mat destroys your ship. |
| 87 | ui.js:175 | , and was lost to asteroid or crit damage. | , and was destroyed by asteroid or crit damage. |
| 88 | ui.js:183 | ['','Planning','Activation','Combat','End'] | ['','Plan','Move','Combat','End'] |
| 89 | ui.js:131 | title="agility: defense dice rolled" | title="agility: defence dice rolled" |
| 90 | ui.js:150 | A tactical starfighter duel: secretly plan every maneuver, then watch the squadrons clash. | Plan every move in secret, then watch the ships clash. |
| 91 | ui.js:151 | First time? Take the lesson above, or just press <b>Launch</b>: the defaults are a good first battle. Everything below is optional. | New here? Take the lesson above, or press <b>Launch</b>. The defaults make a good first battle. Everything below is optional. |
| 92 | data.js:68 | White is normal, <b>green</b> is easy (clears a stress token), <b>red</b> is hard (gives a stress token). A stressed ship can't fly red maneuvers or take actions. | White is normal. <b>Green</b> is easy and clears a stress token. <b>Red</b> is hard and gives a stress token. A stressed ship can't fly red or take actions. |
| 93 | data.js:69 | Ships reveal and fly their maneuvers from the <b>lowest pilot skill up</b>, so skilled pilots react to what they see. | Ships reveal and fly their moves, <b>lowest pilot skill first</b>, so skilled pilots can react. |
| 94 | data.js:69 | Bumping into a ship stops you short and skips your action; flying through an asteroid rolls a damage die and skips your action; leaving the battlefield destroys you. | Bumping into a ship stops you short and skips your action. Flying through an asteroid rolls a damage die and skips your action. Leaving the battlefield destroys you. |
| 95 | data.js:70 | Roll attack dice equal to the weapon value (+1 at range 1); the defender rolls agility (+1 at range 3 or when an asteroid is in the way). Focus turns focus results into hits or evades; a target lock lets you reroll. Each evade cancels a hit (hits before crits). Damage strips shields first, then hull; crits are dealt face up with lasting effects. | Roll attack dice equal to the weapon value, +1 at range 1. The defender rolls agility dice, +1 at range 3 or past an asteroid. Focus turns focus results into hits or evades. A target lock lets you reroll. Each evade cancels one hit, hits before crits. Damage hits shields first, then hull. Crits are dealt face up with lasting effects. |
| 96 | data.js:72 | Pilot skill ties: the side with initiative (fewer squad points; on equal points the second-named side) moves and fires first. | On a pilot skill tie, the side with initiative goes first. That is the side with fewer squad points, or the second-named side on equal points. |
| 97 | data.js:73 | <b>Kept simple:</b> asteroids go on fixed grid spots, ships deploy from set positions facing the enemy, a barrel roll slides in five steps, a battle ends after 100 rounds, and the computer picks the weakest maneuver for your stressed ship. | <b>Kept simple:</b> Asteroids use fixed grid spots. Ships start facing the enemy. A barrel roll slides in 5 steps. A battle ends after 100 rounds. The computer picks the weakest move for a stressed ship. |
| 98 | data.js:26 | When you are dealt a faceup damage card with the Pilot trait, discard it at once without resolving it. | When you get a face-up damage card with the Pilot trait, discard it. Ignore its effect. |
| 99 | data.js:32 | At the start of each combat phase, roll 1 attack die: on a hit, suffer 1 damage. Action: flip this card facedown. | At the start of combat, roll 1 attack die. On a hit, take 1 damage. Action: flip this card face down. |
| 100 | data.js:35 | You cannot take the actions on your action bar. Action: roll 1 attack die; on a hit, flip this card facedown. | You cannot take the actions on your action bar. Action: roll 1 attack die. On a hit, flip this card face down. |
| 101 | data.js:41 | After a maneuver that makes you overlap a ship or an obstacle, suffer 1 damage. | After a move that makes you overlap a ship or asteroid, take 1 damage. |
| 102 | data.js:38 | After you fly a red maneuver, roll 1 attack die: on a hit, suffer 1 damage. | After you fly a red move, roll 1 attack die. On a hit, take 1 damage. |
| 103 | data.js:37 | Roll 1 attack die at once: on a hit, suffer 1 damage. Then flip this card facedown. | Roll 1 attack die now. On a hit, take 1 damage. Then flip this card face down. |
| 104 | data.js:40 | Reduce your agility by 1 (minimum 0). Action: roll 1 attack die; on a hit, flip this card facedown. | Reduce your agility by 1 (minimum 0). Action: roll 1 attack die. On a hit, flip this card face down. |
| 105 | data.js:43 | Reduce your primary weapon value by 1 (minimum 0). Action: roll 1 attack die; on a hit or crit, flip this card facedown. | Reduce your primary weapon value by 1 (minimum 0). Action: roll 1 attack die. On a hit or crit, flip this card face down. |
| 106 | engine.js:74 | Choose a spot (outlined on the mat; hover a button to highlight it): columns A-E from your left, rows 1-5 from your edge. Asteroids stay beyond range 2 of every edge and beyond range 1 of each other. | Pick a spot outlined on the mat. Columns A-E run from your left, rows 1-5 from your edge. Asteroids stay beyond range 2 of every edge and range 1 of each other. |
| 107 | engine.js:85 | along your edge (spots 1-9 from your left), within range 1 of it, facing the enemy. Ships deploy from the lowest pilot skill up. | within range 1 of your edge, facing the enemy. Spots 1-9 run from your left. Lowest pilot skill deploys first. |
| 108 | engine.js:114 | Choose any non-red maneuver on its dial for it to fly instead. | Pick a non-red move on its dial for it to fly instead. |
| 109 | engine.js:263 | dice, then confirm. A die can only be rerolled once per attack. | dice, then confirm. Each die can be rerolled once per attack. |
| 110 | engine.js:337 | Choose which of the 3 drawn damage cards to deal faceup to ${d.name}; the others are discarded. | Pick 1 of the 3 drawn damage cards to deal face up to ${d.name}. The others are discarded. |

ROWS: 110
