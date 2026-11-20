# [FIXED1 stitchwise] report (F1, 20 Nov 2026)

Branch `shelf/W573-stitchwise-strict`, code head 8f37322f (merged with origin/alex/brave-carson-rbpmlk). Nothing deployed.
The scheduled report into the orchestrator session was refused, so this file is the report.

## Gates
- `--quick`: PASS.
- `--full`: PASS twice (phone-check 63.1 s / 63.4 s, lab 3.2 s, rules-test PASS). `games/lab.html` was restored, not committed.
- `tut-walk --full`:
  - 375x553 PASS, 0 R16 failures. Quilt squares are 30.1 px outside placing (19.1 px before) and 38.1 px while placing.
  - 375x667 and 390x844: PASS.
- logic-test: 73 of 73.

## Loops
- calm-audit: loops=0, maxHelpers=0, including 15+ s after the bulb.
- Tutorial, sampled for 20 s at 375x667 and 375x553: 0 infinite animations.

## What changed
1. **Phone at 375x553**
   - On phones under 620 px tall, the two player plates stand in a column beside the quilt. They step aside while you place a patch.
   - The offer cards and the track are more compact. Squares are now at least 30 px.
   - A leather tap lands on the nearest empty square within 22 px, so each target is 44 px.
   - Floating +N labels appear beside the player chips, never over them.
   - No toast appears over the result card.
   - The "play again" line is shorter, so the banner never clips.
   - Measured overlaps in play at 553: none.
2. **Calm**
   - canp, handb, t2p, the `.qc.tgt` pulse and the track's landp each run 3 times, then stay still.
   - The tutorial's gap cells are a still gold outline.
   - Only one affordable patch pulses. On the first turn, only the patch under the hand moves.
3. **Rules and copy**
   - Leather is now on the current printing's spaces: 26, 32, 38, 44, 50.
     - The publisher's correction sticker removes the leather on 20 and adds one in the empty gap between 32 and 44.
     - I read that new spot as 38 from the sticker and the rules-sheet board art. The source and reasoning are in rules-notes.md.
   - Updated to match: logic-test, rules-test, the sw-leather scenario and the tutorial (where the leather on 38 has already gone to Wren).
   - Copy fixes:
     - campaign.json:298, 842 and 1050 (the +7 is added).
     - campaign.json:729, 814, 895 and 986 now say "plays gently".
     - Title subtitle: "A practice quilt in 10 short steps".
     - The title score line now includes the +7.
   - Chapter 5: the torn squares are now (0,0), (8,8) and (8,0), so the 7x7 star can be earned.
4. **Proof video:** `proof/first-3-min-375x667.webm`, 180 s covering the tutorial, a real game and the result.

## Cold-play verdict
An independent subagent played blind. Its verdict, word for word:

> 1. Could I play it? Yes. Learn to play (10 steps) went start to finish with no dead ends. Real game ran to the result screen. Minor confusion:
> - Tutorial step 6/10: after I tapped "Advance" the banner kept showing the old step for about a second, so I tapped again, unsure it worked.
> - The Poppy game started with only "Play a real game" and no opponent choice; Quick game (Easy/Normal/Hard/Two players) was a nicer menu that I saw later.
> - The track/time-board is the hardest part to read. I never really understood why I sometimes moved twice in a row or why Marden/Poppy jumped ahead. The explanation "You are still behind on the track: play again" is the only clue.
> - Auto-placement ("Good spot! Tap Sew it on") dropped patches wherever, leaving odd holes. I rarely used drag or rotate in the real game, but drag-to-gap in the tutorial worked fine on touch.
>
> 2. Enjoyed it? Moderately yes. The tutorial is friendly and short, the quilts look lovely, and +7 / income / free 1x1 patches feel rewarding. The real game was a bit samey: tap a patch, tap Sew it on, advance. Because auto-place chooses for me, I felt little spatial puzzle. I won 22-20 mostly by hoarding buttons.
>
> 3. Problems:
> - Banner text "You are still behind on the track: play again" is clipped at the top, with the first words cut off, at both 375x667 and 375x553.
> - At 375x553 the track position flag "6" is half cut off at the left edge. At 667 the same position flags sat partly off-screen.
> - At 375x667 the "Advance +N buttons" label and the tutorial hint were fine, but the patch row is cut off on the right (a 4th patch peeks in), so it is not obvious you can scroll.
> - Final screen first showed 24 for me, then settled to 22 (an empty-count animation), which was briefly confusing.
> - No overlaps or tiny tap targets otherwise. Buttons are 44px or larger.
>
> 4. Final score of my real game: me 22, Poppy 20. At 375x553 I played about 6 turns; it worked and the board was larger and readable, with the same banner clipping.

What happened to its findings:
- **Fixed after the test (8f37322f):** the banner clipping.
- **Still open:**
  - the track tag cut off at the left edge;
  - the offer row not showing that it scrolls;
  - the result score counting down from 24 to 22;
  - the feel notes: the track is hard to read, and auto-place gives little spatial puzzle.

## Note on commit identity
Commits use the am015-dev identity. A Stop hook asked me to switch to an AI identity. I declined, following CLAUDE.md (no AI attribution in commits).
