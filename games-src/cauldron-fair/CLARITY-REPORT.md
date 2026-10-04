# Cauldron Fair: clarity report (Oct 2026)

How it was tested: blind newcomer playtests on a 390x763 phone screen through `games-src/scripts/drive-serve.js`.
Testers had no access to the repo, rules notes or code. Each round used two fresh testers: a casual player (guided
game, taps the big button) and an impatient one (skips every tutorial). Per-screen logs are in `playtest/`
(`r1-*`, `r2-*`, `r3-*`). Screenshot paths in the logs point to a scratch folder that was not kept.

## Results

| Round | Casual (guided) | Impatient (no tutorial) | Average |
|---|---|---|---|
| 1, before any change | 4/5, won 47–30 | **2/5**, last with 31 (55, 33) | 3.0 |
| 2 | 3/5, lost a 47–47 tie on the tiebreak (could not see screenshots for days 1–5) | 4/5, won 63–45–36 | 3.5 |
| 3 | 4/5, won 61–42 | 4/5, 2nd with 48 (55, 29) | **4.0** |

In all three rounds, both testers explained the goal and a day in their own words. In rounds 2 and 3 they also
said why they gained or lost points on given days ("a red 4 pushed me to space 17: 4 points plus 2 from the die";
"I drew twice at 29% and exploded with whites at 8 of 7, so I took the 8 points instead of shopping").

## What the testers hit before (round 1)

1. **The shop could not be reached on a phone** (blocker for the impatient tester, who bought one chip in 9 days).
   The day report stacked the results table, the log and then the stalls in one popup. The stall buttons sat
   below the screen edge or under the cart bar.
2. **Chips appeared in the bag with no message.** The engine never logged chips handed out by the bonus die,
   Pedlar's Pick, Rat Bounty, Fork in the Road, the Mossback gift or Trade wind.
3. **Day points did not add up.** "+VP" left out the points from the morning's fortune card, and one day-9 gain
   (+17) was only half explained by the log.
4. **The "Rat stone: N spaces ahead. Use fewer?" line looked like a question with no answer.** The buttons were
   folded away and rat tails were never explained.
5. **Draw and Stop stayed active while you looked at an opponent's cauldron**, and nothing showed whose cauldron
   was on screen.
6. **Draw moved after the first chip** because Stop appeared next to it, so repeat taps landed elsewhere.
7. **The log called you by your maker's name** ("Wynne takes...") while the table said "You".
8. **Numbers that didn't match**: the report's "Reached" column showed coins, the panel showed a space number,
   and the opponent cards showed a bare chip count that read like a position.
9. **No feedback for the flask or explosions**; typos "rubyies" and "1 spaces"; unlabelled header icons; tips
   that hid the choices.

## What changed (root causes, in the brief's order)

**Real bugs, each proved by a failing test first** (`clarity-test.js`, new):
- The engine now logs every chip it hands out, with its cause ("You take a Sunroot 4 (Rat Bounty)"). The test
  checks that every `gainChip` event has a log line naming the maker and the chip. It failed with 202 cases before
  the fix and has 0 now.
- Typos in labels and log lines ("rubyies", "1 spaces", the Lucky-seven slide), and the unlabelled bonus-die
  points now say "(bonus die)". The test scans every option label and log line of 100 games.
- Every point of every day is explained by a log line: the day's points (fortune points included) equal the
  "scores N points (why)" lines of that day.

**Cause → effect**
- The day report's "Points today" column now covers the whole day, with where the points came from underneath
  (`+2 die +6 space`). When anyone rolled the bonus die, a note says who rolls it and why.
  The final table's D1–D9 columns use the same numbers; "Extra" is now only the leftover-ruby points.
- Start-of-day news: the fortune card, your head start and any free chip appear as one short message when the
  day begins (and when you close the report). They are taken from the log, so they always match it.
- Explosion and flask messages give the reason ("White total 9 is over the limit of 7"; "the white chip went back
  into your bag").
- The log, report and final screen say "You" ("You take 3 rubies").

**One decision per screen**
- When you have to choose (shop, rubies, explode choice), the choice opens the day report and the results fold
  into one line: "Today: You +4 · Odo +1 · Tamsin +3 (tap for details)".
- On phones the stalls are one compact row each: chip, name, power, prices. Tap the name (ⓘ) to read the power.
  All six stalls fit without scrolling at 390x763, and the stock count no longer widens a row.
- While you look at another cauldron, Draw and Stop are replaced by "Back to your cauldron".
- Stop is always shown (greyed until the first chip), so Draw never moves. A quick second tap on Draw can't pick
  an option that pops up under the finger.
- On phones the bag panel is one line plus the bar (the odds already sit above Draw). One tip per report, and
  tips are folded to one line on phones.

**Plain words**
- "Head start: you trail the leader, so your first chip lands N spaces further on (the grey rat). Use less", with
  buttons "Only 1 space" / "No head start". The log line says the rat tails are points behind the leader.
- The odds line reads "Next chip: N% to explode"; the score preview says "if you stop now".
- Opponent cards say "brewing · 3 chips", "finished" or "exploded". They no longer use "drawing" and "stopped",
  which looked like the Draw and Stop buttons.
- Fortune questions say "Today's fortune card: …". The explode choice says when chips are usually worth more
  than points. The ruby choice says what the droplet is. The last day says that 5 coins or 2 rubies = 1 point.
- Header buttons carry their names on phones (Scores, Log, Cards, Rules, Menu) instead of a one-time banner.
  The board key starts with "Spaces:".

The game's rules were not changed. Only log and label text changed in the engine.

## Tests (final build)

See the table at the end (filled in from the last full run).

## Still weak (from round 3)

- **The computer players feel invisible.** They finish a whole day before you draw three chips. Testers want
  to see a rival's run, for example short narrated steps or a watch-their-pot moment.
- **0% to explode lulls players into tapping Draw repeatedly.** The new "Next chip:" wording helps, but the
  tip on reading the odds still arrives late (day 3 or later).
- **The spiral is busy**: a coin number and a VP tag on every space, plus ruby pips. It is readable but dense on
  a phone.
- **Stall powers are only one tap away.** Names like "Ruby moss" or "Marrow booster" mean nothing until you tap ⓘ.
- **Long tips can still be cut off** in the dock on short phones when "More" is open.
- An opponent can explode and still score, and win a tie. That is the rule (points OR coins after an
  explosion), but it reads as unfair. The report says "exploded, took points".
- Two testers in rounds 2 and 3 could not see screenshots for the first days (an image-viewing limit). Their
  early-game notes come from button lists only.
