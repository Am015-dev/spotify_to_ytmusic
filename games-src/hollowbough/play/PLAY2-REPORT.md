# [PLAY2 hollowbough] report (20 Nov 2026)

Branch `shelf/W550-hollowbough-play`. Code head 03104c8c, with origin/alex/brave-carson-rbpmlk merged in and pushed. Not deployed, no PR.
Earlier PLAY2 commits: a2b84a7f, db96833c, plus merges. (The scheduled report to the orchestrator was refused, so this file is the report.)

## Gates (final code)
- `--quick` PASS: 13/13 scenarios.
- `--full` twice, each run alone: PASS (phone-check and sweep).
- calm-measure PASS.
  - calm mode: 0 looping animations, at most 0 helpers on screen.
  - guided mode: 0 loops, at most 1 helper.
  - 0 silent taps.
- Text >= 11 px and taps >= 44 px at 375x667 and 375x553 over 17 states: 0 offenders.
  - The states: board, goals, meadow, look sheets, Fox choice and its previews, Prepare, the season card, the rival's city.
- Half-visible meadow cards: a tap opens the right card 8/8.
- games/lab.html restored, not committed.
- Honest note: the first `--full` run failed twice.
  - phone-check: the goal line had 10 words, now cut to 8.
  - sweep: the bots tapped 0.1 s after a panel switched itself, and the new tap guard ignored those taps.
  - The fix: the guard is 0.35 s, and sweep.js and calm-measure.js now wait 0.4 s after a self-switch, like a person.

## What changed
Rules are untouched. Changes are in ui2, ui3, ui5, ui6, ui13, skin.css and pv.css.

1. **Meadow.**
   - A tap opens the card that was pressed. The board can redraw, or the row slide, between press and release; the pressed card still wins.
   - Root cause: a half-visible card is focused into view on press, so the click landed on its neighbour.
   - A finger swipe never opens a card.
   - No scroll-snap on the meadow.
   - meadFix never slides the row during a press.
2. **Choice powers.**
   - Covered: Fox, Sexton, give, trade, teach, pigeon, cemetery, mole, chip, ruins, university, inn, queen, judge, waive, scroll, bazaar, stock, recall, tuck, clear, recipient, spend, copy, clock, prisoner, cityDisc.
   - The prompt says in plain words what you pick.
   - Tapping a choice opens a sheet with:
     - the power's card and "You picked ...";
     - "What happens" for every player: goods, tokens, cards, builds, points, meadow cards leaving, "then you pick the next step";
     - Confirm and Pick again buttons.
   - No Prepare or Pass button while a choice is open.
   - A pending choice always shows the panel with its glowing choices.
3. **Goals.**
   - One line on the Goals tab: "Own the cards first, then send a worker."
   - Each open goal shows your progress, like "You: 2 of 4 green" or "1 of 2 cards".
   - Goal sheets say "First to own the cards claims it. You have ...".
   - Place sheets say "Shared: any number of workers fit here." or "Only one worker fits here."
4. **Planning.**
   - Pair labels on meadow and hand cards: "Free: your Depot", "Pairs: Dovecote Depot", "Then Goodman Vole free".
   - Card sheets name the pair. For a green card they say what it pays now and which seasons it pays again.
   - The goal card says "A good start: ...": a pair in your hand or the meadow, otherwise green cards early.
   - A season card after your Prepare shows:
     - what your green cards paid, and from which cards;
     - the workers you gained;
     - the purple end bonus so far;
     - that Autumn opens the Journey;
     - each rival's plan and score, with a "See Bramble's city" button.
5. **Rival.**
   - A plan line, like "Bramble is building toward a green engine (6 green) and the X goal (3 of 4 blue). It can claim Y now."
   - It appears in the rival's Prepare line, the season card and the rival's city drawer.
   - Every rival score rise comes with the reason, like "Bramble +4 points: cards built, a goal".

### Cold-play fixes
- Pass is one tap to a sheet. No more "Sure?" double tap.
- Tapping "Got it" on a help bubble no longer falls through and opens the place under it. That was the "first tap after Got it did nothing".

## Cold-play verdict, as-is
An independent subagent with no knowledge of the changes played a full game by touch at 375x667. This was before the cold-play fixes.

> 1. Could you play it? Yes - I completed a full game against the computer (Bramble) by touch. The glowing places and the "Send worker / Build it" confirmation sheets made each move clear, though a few things required trial and error.
> 2. Was it fun? 3/5. The first two seasons felt rewarding (free Parcel Dove, free building, pairing combo). After that I was mostly doing whatever was glowing; the computer scored in big jumps I couldn't anticipate and I lost.
> 3. Would you play again? Maybe. The worker-send / build / prepare loop is satisfying. I'd want to understand goals and purple bonuses first, since they decided the game.
> 4. What confused you?
> - Pass button on the Places screen: one tap does nothing visible, it turns into "Sure?" briefly and a slow second tap resets it; I thought it was broken for ~5 taps.
> - Screen switches tabs by itself: after sending a worker it jumped to City, Meadow or Goals, so my next tap hit the wrong thing (accidentally sent a worker to my own Dovecote Depot and had to give away cards I wanted).
> - Opponent score jumps (16 to 19 to 23 to 27) with no explanation; only the season pop-ups mentioned its goals.
> - I only saw "Journey 5" and "Purple bonuses 6" on the final screen; never understood them and they cost me the game.
> - The first tap on a place right after "Got it" did nothing.
> - The Pass hint said "tap Pass twice" but I didn't link that to "Sure?".
> 5. Best moment: Parcel Dove came free, then offered a free building (Quietstone Cloister), putting me ahead 6-2.
> 6. Did you make plans? Started around Spring: planned resources for Depot and berries for green cards. From Autumn on I mostly reacted and was behind.
> 7. Final score: Bramble 28, me 19. Played 4 seasons, game ended right after Autumn.

All five confusions were fixed once:
- the Pass sheet;
- the 0.35 s tap guard after a panel switches itself;
- rival points with reasons;
- the purple bonus and the Journey in the season card;
- the "Got it" fall-through.

**Fun 4/5 is not proven: the tester was not re-run after the fixes.**

## Proof
- `games-src/hollowbough/play/proof/after2-first-3min-375x667.webm`: 3 min, 77 taps, 0 errors, reached Autumn. Recorded before the goal line was cut to 8 words.
- `games-src/hollowbough/play/proof/after2-first-3min-375x667-taps.txt`: the tap log.
- `games-src/hollowbough/play/proof-bot.js`: the newcomer-paced bot that drives the video.
