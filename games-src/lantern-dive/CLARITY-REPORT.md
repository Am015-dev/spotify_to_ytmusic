# Lantern Dive: clarity report (Oct 2026)

Goal: a first-time player on a phone understands the game and has fun. Method: blind playtests. Each tester was a
fresh agent that could only see the screenshots and the list of tappable things on a 390x763 touch phone. Testers had
no access to the code or the rules notes. Logs and the tester brief are in `playtest/`.

## Before: round 1 (unchanged build)

| Tester | Played | Result | Fun |
|---|---|---|---|
| Casual (took the guided dive) | guided + dives 2, 3 | won 2, lost 1 | 3 / 5 |
| Impatient (skipped every tutorial) | dives 1–5 | won 4, lost 1 | 3.5 / 5 |

Average: **3.25**.

Both testers understood the trick-taking itself. What they hit:

- **A real bug.** The result card showed a green tick on a finished job and also said "Not finished: the dive
  ended first" (both testers).
- **Tips blocked play.**
  - On phones, a tip hid the action buttons ("Take this job" was unreachable under it).
  - Tips came as a chain of walls of text. "Reading the table" was a whole legend, and it came back in dive 2.
- **The Hint could not be trusted.**
  - It never said why when you were leading or not finishing the trick.
  - Its toast covered the Play button.
  - One tester felt it worked against a teammate's job.
- **No cause → effect.**
  - Computer tricks resolved too fast to see.
  - Jobs were handed out before the player saw anything ("I got no job and was never asked").
  - A job turned red with no visible reason until the result card.
- **The guided dive was trivial.** Following Hint ended it in one or two tricks, so it taught nothing.
- **Clutter and covered cards.**
  - The signal badge on a shown card covered the middle of the card above it.
  - The job chip was cut off at the right edge.
  - "The jobs add up to 1 points" / "Worth 2 points" read like a score that does not exist.

## What changed (rules untouched)

1. **Bug, proven first.** `clarity-test.js` reproduced it before the fix and passes after. A done job is never
   labelled "Not finished" (`src/ui4.js`).
2. **Cause → effect: a "what just happened" line in the dock.** One plain sentence per moment:
   - "Trick 3: Bram won with Kelp 9, the highest Kelp." / "…: a Lantern beats every colour."
   - "Nerea took “Most tricks”."
   - "✔ Bram finished “Win with a 6”." / "✖ Your job … can no longer be done."
   - "Sumi showed Coral 5: their lowest Coral. Their signal is now used (red cross)."

   Desktop shows the last three moments; phones show the latest one. A finished trick now stays on the table
   longer (1.0 s + 1.1 s instead of 0.78 s + 0.7 s).
3. **The goal is always on the table.** The table line reads "Trick 3 of 10 · jobs done 1 of 2". During job
   picking it reads "2 jobs left to hand out · every job must be done". The result card now says why a dive ended
   early: "Every job was done after trick 4, so the dive ended at once."
4. **Tips are short and never block.**
   - Each tip is 1–2 sentences, with "Got it" in its title row.
   - The action buttons stay visible under a tip.
   - Acting on the screen answers the tip.
   - The legend tip is gone. Normal dives show only commander, pick a job, flare, signal, follow, no colour,
     trumps and job done, each once per device.
5. **A trustworthy Hint with a "why".**
   - Every suggestion plays the trick out in sampled hands and names the likely winner, plus any job the card
     finishes or may break. For example: "Bram probably wins this trick; you give away your lowest Sunstar and
     keep the strong cards."
   - The toast that covered Play is gone.
   - In the guided dive, Hint suggests a low colour card for the first three tricks, so the lesson is seen
     before the job ends the dive.
6. **Plain words.**
   - "Difficulty" instead of "Worth N points".
   - "The Commander may not take this job" instead of "You cannot take this one".
   - "Follow Coral if you can. With no Coral left you may play anything, and a Lantern would win." This replaces
     "A Lantern wins every trick", which was wrong.
   - A repeated signal round now says "Someone just signalled. Signal now, or skip again?"
   - The Commander tip mentions the gold badge.
7. **Nothing hidden.**
   - The signal badge moved into the card's corner.
   - Row-2 lifted cards rise less, and rows are a little further apart.
   - Signal-pick rings are clipped to the visible part of the card.
   - Job chips wrap instead of being cut off.
   - Title and setup buttons have a space between their two lines, so screen readers and text search read
     "Play a dive…" instead of "Playa dive".
8. **The guided dive is the big button on a first visit**, labelled "Guided first dive (start here)", until a dive
   is in the logbook.

## After: round 2 (two new blind testers, same personas)

| Tester | Played | Result | Fun |
|---|---|---|---|
| Casual | guided + dives 2–4 | won 3, lost 1 | 3.5 / 5 |
| Impatient | dives 1–4 | won 3, lost 1 | 3.5 / 5 |

Average: **3.5** (round 1: 3.25).

- **Goal and round.** Both explained them correctly in their own words: co-op, one job per diver, follow the
  colour, Lanterns are trumps, the dive ends when every job is done or one becomes impossible.
- **Why they lost.** Both explained it.
  - Casual: "I held on to Kelp 9 too long … Trick 8: You won it with Kelp 9."
  - Impatient: "Nerea won a trick with Tide 9 and broke her own 'win no 9s' job; the fail popup says exactly
    which trick."
- **Cause → effect.** The impatient tester: "I understood almost every trick winner and job completion from the
  log line under the table."
- **Bugs.** No unexplained score or card change was reported as a bug, and no option was unreachable.

Fixed after round 2, but **not re-tested blind**:
- Hint reasons were cut off under the news line (on phones the news now hides while a suggestion shows).
- The news said "their" for your own signal.
- Dives ending early were unexplained (the result card line).
- The guided dive was not the big button.
- The repeated signal prompt was unexplained.
- The signal-pick rings drew through the second row.

## Still weak (honest notes)

- **Pace.** Both testers still found computer turns fast and missed some tricks; the trick-by-trick history is
  only one line plus "Last trick". A tap-to-replay of the last few tricks would help.
- **Job names on chips are terse** ("Kelp = Sunstar in a trick", "Trick of odds") until tapped. There is no
  progress counter: a "three 5s" job does not show "2 of 3".
- **Two-step play** (lift, then Play) and the three pre-game gates (job, flare, signal) feel slow to impatient
  players. The flare and signal can't be cut without changing the rules.
- **The guided dive still teaches only one job.** It is now 3+ tricks long, but there is no second lesson with a
  teammate's job to protect.
- **Hint veto.** The audit's "Hint throws away a teammate's card" (P1-1) did not reproduce in a direct test (36
  cases, all levels), so no veto was added. One tester felt Hint worked against a teammate's "most tricks" job.
  That is a strategy weakness, not an instant loss.
- The phone top bar is still icon-only.

## Tests (final run)

Final full run (after the round-2 fixes): rules 99/99, clarity 7/7, hidden-test 0 leaks (30 games, 201 checks), net-strip 0 problems (2690 views), click 18 games 0 errors 0 stalls (instant and animated), px-test 0 problems, lay (4 desktop sizes) 0 problems, lay-phone (all 7 sizes) 0 problems, p2p-ld full desktop and phone 0 bad.

# Round 3: The Descent, bosses and Mara's training (owner: "game is boring, add challenges that get harder with a boss")

The owner picked: a boss with curses, zones with oxygen, and a real tutorial with pop-ups and characters.

## What was added
- **The Descent** (title screen, big button).
  - 4 zones: Sunlit Reef, Kelp Forest, Twilight Trench and The Abyss. Each has 3 dives and then a boss.
  - You play with Nerea, Bram and Sumi.
  - You have 3 oxygen tanks per zone. A failed dive costs a tank; with none left, you go back to the start of the zone.
  - A dive won without a failure earns a star. Beating a boss refills the tanks and opens the next zone.
  - The map shows the zones, stars, tanks and boss portraits, with a tick on beaten bosses.
  - Difficulty rises zone by zone. In `desc-gauntlet.js` (an all-computer crew, 30 games per stage), first-try wins run about 70% → 55% → 35% → 30%.
- **Bosses**: Snapjaw the Eel, the Kelp Witch, the Gloom Angler and the Leviathan.
  - Each has a portrait, a taunt, a health bar (one pip per job) and a hit line when a job is finished.
  - Beating one shows a "defeated!" banner.
  - Curses change only who wins a trick, on a public schedule shown on the boss bar:
    - **Undertow:** the lowest card wins.
    - **Lantern Sleep:** Lanterns played on a colour win nothing.
    - **Riptide:** any colour can win.
  - The first time each curse appears it gets a pop-up; after that it shows as a line in the dock and a red tag on the boss bar.
  - The rules are in `rules-notes.md` ("Descent mode", our own addition) and in `rules-test.js` (4 curse tests).
- **Mara, the instructor**, replaces the tip chain in the guided dive with a step-by-step training dive. Pop-ups wait for you, only the card she names can be led, and the dive teaches:
  - jobs
  - leading
  - following the colour
  - losing on purpose
  - Lanterns as trumps
  - feeding a teammate's trick

  The result screen sends you to The Descent.
- **Teamwork**: in the Descent the computer divers leave a job for you when there are fewer jobs than divers. In round 3 a tester was left without a job in 4 of 5 dives.
- **Bug fixed (failing test first):** mid-trick, a job could show a red cross that turned green when the trick ended. "Win a 6 by playing another 6" didn't count a 6 lying in the unfinished trick. `jobStatus` now treats the open trick's cards as still in play.

## Round 3 blind playtest (before the round-3 fixes above)
| Tester | Played | Fun |
|---|---|---|
| Casual (training, then The Descent) | training won; reef 3 dives with stars, Snapjaw beaten on the 2nd try, then Kelp dive 1 | 3.5 / 5 |
| Impatient (straight into The Descent) | reef 3 dives and Snapjaw on the first try, then lost Kelp dive 1 | 4 / 5 |

Both understood the boss and its curses. The impatient tester said "Undertow really changed my choices" and called the boss fight the high point.

What they disliked, and what was done about it:
- **No job for the player** (casual tester, 4 of 5 dives). Fixed.
- **The "Brace!" curse pop-up on every second trick.** Now it appears once per curse type.
- **The boss health bar was tiny and never moved, and beating a boss had no celebration.** The bar is bigger and there is a defeat banner. Short boss fights still end quickly.
- **No mark for a beaten boss on the map.** A tick is shown now.
- **A false red cross mid-trick.** Fixed.
- **"Attempt 1" on every retry, and "Free dive" in the log.** Retries now show "try N", and the log uses the zone name.

**Not yet re-tested blind**, and still weak:
- The hand jumps when a tip opens in the dock.
- Tips still chain before the first card in a first normal dive.
- Short job names on chips.
- The bosses are code-drawn placeholder art.
- Zone rewards beyond stars are not built yet.
