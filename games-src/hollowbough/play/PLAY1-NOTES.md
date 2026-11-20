# PLAY1: why a real person can't get into Hollowbough (20 Nov 2026)

Owner verdict on the live game: "unplayable and not fun"; earlier "very confusing and distracting with the tap button, the rules are not correct".
Method: the deployed build (games/hollowbough, same as live; the live URL answered 503/404 from this sandbox), 375x667 touch, Title > Play > Play now, no tutorial.

## Cold play, first 3 minutes (live build)

| t | What I saw | Lost / dead moment |
|--:|---|---|
| 0:05 | Title: "Play" big, Mode chips (Guided selected), then a "New here?" popup, then a goal card | 3 screens before the board; fine |
| 0:15 | Board: 12 small place tiles, 4 tabs (Places/Meadow/City/Goals), hand of 3 visible (5/8), coach bubble "Tap a glowing place or card" over a hand card, ghost finger, and a **big green "Prepare / 2 workers left" button** at the bottom | The biggest button on screen is the one you must NOT press. Tapping it: toast "Place your workers first" |
| 0:20 | Tapped Twig Heap: worker placed at once (+3 twigs) | No idea what I was choosing until after it happened |
| 0:25 | Rival: top pill "Bramble is playing" for ~1 s, a tiny worker lands somewhere | Missed it completely; only the log says "Bramble places a worker: Bumper Bramble" |
| 0:30 | Tapped a hand card (Gildenfern Court): toast "Needs 3 more resin and 3 more pebbles" | What does the card DO? Not written anywhere on the card. The text is only behind a 0.43 s long-press nobody finds |
| 0:40 | After my 2nd worker the view jumped to Meadow by itself; the finger pointed at a card ("Can build") while a bubble said "Time to prepare. Tap Prepare." | Two helpers asking for two different taps |
| 0:45 | Tapped Dovecote Depot: built at once, 2 points, view jumped to City | Built a card blind: no idea it is a place rivals can visit |
| 1:00 | I suddenly had 2 berries | Bramble's Brother Moss gave them: not in the log, not shown. "Why did that happen?" |
| 1:10 | Prepare: a small "Spring" pill, +1 worker | What did Prepare give? Not said before or after |
| 1:30-3:00 | Same loop: tap tile, things happen, rival flashes, tabs jump | No payoff moment: score goes 0 > 2 in a small chip |

Dead taps in 3 min: 4 (Prepare while workers out x2, unaffordable card x2 gave only a toast). Lost moments after minute 1: 5.

## Full games
Honest scope: one game by hand to Spring (screenshots above), then full games through the real page by touch taps: the newcomer-paced proof bot
(`play/proof/*-taps.txt`, follows the game's own hint) and sweep.js (random glowing targets, 2 full games at 375x553 finish). A 2-player game is
about 35-40 of your moves over 4 seasons; the old build lets a hint-follower reach Autumn in 3 minutes without ever reading a card. Where the fun should be: the engine (a green card paying again in Spring/Autumn, a critter moving in free into its building, a goal claimed, the Long Road). Where it isn't: you can't plan an engine because cards never show what they do, so every build is a guess; free critter plays and green pay-outs happen with no visible "your engine fired" moment; the rival's clever plays (gifts, plants) are invisible.

## Benchmark: the official digital app of the original (phone)
| Screen | Official app | Ours (before) |
|---|---|---|
| Turn | Drag a worker or tap a location; the location's reward is drawn on the board | Tap = instant commit; reward is a tiny label |
| Card choice | Tap a card: it opens BIG with its full text, cost and a Play button; payment confirmed | Card face has no text; tap builds at once or toasts what is missing |
| Choice consequence | You see the card text and the reward before committing | Nothing before; a delta float after |
| Rival turn | Rival worker moves on the board, played card is shown large for a moment, log line | 1 s pill "Bramble is playing"; gifts not shown at all |
| Scoring/feedback | Card lands in your city, points count up; season change has its own screen | Small chip change; season pill |
| Season step | "Prepare for season" appears when your workers are out | A big green Prepare button sits there all the time, disabled |

## The 5 biggest gaps
1. **Blind commit.** One tap does the move; you never see what you are choosing. Card abilities are invisible (long-press only).
2. **No "what do I get" before choosing.** No preview of goods/points/cards a move gives; unaffordable cards hide their text behind a toast.
3. **Competing taps.** Ghost finger, coach bubble and an always-on big green (dead) Prepare button ask for different taps: the owner's "tap button" confusion.
4. **Opaque rival.** The rival's move flashes for ~1 s in a small pill; its effects on you (gifts) are not logged or shown.
5. **No payoff.** Scoring a card or a goal changes a small number; no moment that feels like a reward. Prepare never says what it gives.

## What changed (game files only)
1. **Look sheet** (`src/ui3.js` lookOpen/lookNeed): a tap on a place, card, goal or Prepare opens a bottom sheet: big art, what it does in plain words,
   "What happens" (+3 twigs / -2 berries, +2 points, computed from the real engine), one big button (Send worker / Build it / Claim it / Prepare) and Not now.
   A card you can't pay for opens the same sheet with its text and "You need 2 more berries". Drag-to-place still commits at once. Off in Learn and ?scn= tests.
2. **Prepare says what it gives** (`src/ui2.js`): "Prepare for Spring · +1 worker. Your green cards pay." While workers are out it is a quiet dashed note, not a big green button.
3. **One helper** (`src/ui3.js` fingerWanted): the ghost finger only on your first two moves.
4. **Readable rival** (`src/ui5.js` p1After/rivShow): each rival move as one line ("Bramble built Brother Moss"), held 2.6 s; gifts to you in yellow
   ("Bramble gave you 1 berry"). `src/engine.js` giveRes now logs gifts (they were silent).
5. **Payoff** (`src/ui5.js` ptsPop): "+N points" rises once from your score with a bump (finite animations only).
6. Choice trays: the "Keep one" cards show what they do; effect-order chips grow the tray upward so none sits below a 375x553 screen.
Tests adjusted to the new two-step tap (a real tap on the sheet's button): `sweep.js`, `calm-measure.js`.

## Gates
build-all --quick PASS; --full PASS twice; rules-test 108/108; calm-measure: calm PASS (4 games: loops 0, helpers max 0, silent taps 0);
guided first run 1 FAIL (an effect-choice tray below the 375x553 screen, item 6), after the fix guided PASS (3 games, helpers max 1).

## Blind cold play (independent agent, no knowledge of the changes), verbatim summary
Played one full game (seed 21, ~40 moves, won 34-31). "Could you play it? Yes. Every normal turn has the same shape: tap a place or a card, read the
sheet that slides up (it says what you get or pay), then confirm." Fun 3/5: "Building up a little engine of animals felt good and the art is lovely, but
for the first half I was just doing what was offered, not making plans." Confusing: "shared" and the Goals tab unexplained; Brother Moss/Magpie give
buttons; Fox text "Opens the second Thornhold cell" and cut-off relocate buttons; Hollow Sexton meadow clearing; tapping a meadow card twice scrolled the
row and opened a different card; "Pick which effect goes first" with no reason; rival plan hard to follow. Best: claiming a goal (+3), turning twigs into
tokens to take the lead. First fix: stop the meadow row scrolling on tap; plain prompts for card powers.

## Next (not done)
Meadow row scroll under a tap (wrong card opens); plain-word prompts for rare powers (Fox, Sexton, give/trade); point newcomers at Goals; explain "shared".
