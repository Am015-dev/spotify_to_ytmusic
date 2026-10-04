# Cauldron Fair: board-first report (Oct 2026)

Brief: `games-src/clarity-briefs/BOARD-FIRST.md`. Owner's verdict on the clarity build: "completely useless, not like
the game, very confusing". This rework makes the **bag** the hero of the screen and puts the push-your-luck moment at the
centre: pull a chip, watch the white total climb, decide whether to stop.

## Blind phone testers (second pass, Oct 2026)

Run with `games-src/scripts/drive-serve.js`. Testers read only the first 8 words of any text and decide in about 2 seconds.

| Run | Phone | Lost (after 1st min) | Lost (1st min) | Dead taps | Fun avg | Exciting moment | Goal in a sentence |
|---|---|---|---|---|---|---|---|
| Baseline (PR #47 build) | 390x763 | 2 | 0 | 0 | 3.7 | yes (pulled at 43% red, safe) | yes |
| Round 1 A | 390x763 | 3 | 0 | 0 | 3.7 | yes ("BOOM! White 8 > 7") | yes |
| Round 1 B | 375x553 | 2 | 0 | 0 | 3.7 | yes (flask save at 6/7) | yes |
| Round 2 A | 390x763 | 4 | 1 | 1 | 3.3 | yes | yes |
| Round 2 B | 375x553 | 2 | 0 | 0 | 3.7 | yes | yes |
| Round 3 A | 390x763 | 1 | 0 | 0 | 4.0 | yes (stopped just in time) | yes |
| Round 3 B | 375x553 | 3 | 0 | 0 | 3.7 | yes (pushed at 75%, exploded) | yes |
| **Final 1** | 390x763 | 3 | 0 | 0 | 3.7 | yes ("BOOM! White 9 > 7") | yes |
| **Final 2** | 375x553 | 0 | 0 | 0 | 4.0 | yes (BOOM at 14% risk) | yes |
| **Final 3** | 390x763 | 2 | 0 | 0 | 3.7 | yes (0% to 50% in one chip, stopped) | yes |

**Final against the bar:** dead taps 0 (pass), exciting moment 3/3 (pass), goal 3/3 (pass), lost moments 3/0/2
(fails for 1 of 3), fun average 3.8 (fails narrowly; needs 4). Final 1's lost moments were all "I just followed the
best tag" on chip, ruby and explosion pop-ups.

### Second-pass changes
- **A glowing "best" pick on every choice**: shop chips ("buy"), the ruby trade, the explosion choice, fortune cards and
  the pop-ups in the middle of a brew. The suggestion comes from the computer maker's own decision code for your seat. The
  ghost finger in the shop points at the suggested chip. If the extra chip it would place is white, "Place none" is
  suggested instead.
- **Tap the pot to pull a chip**, the same as tapping the bag (this removed the one dead tap).
- The shop fits a 375px phone (no clipped column).
- "Waiting…" replaces "Choose above first" while a rival is still choosing.
- A rival's explosion reads "boom! ★ or 🪙, not both", so it's clear why they still scored.
- On phones, pop-ups show their title only, without a paragraph. The free "white chip back" action sits below Draw/Stop,
  so the two big buttons never move. A pop-up that has just opened ignores a tap for 0.45 s, so a fast tap meant for the
  bag doesn't place a chip.
- Shots: `board-first/v2-before-1-brew.png`, `v2-before-2-choice.png`, `v2-after-1-brew.png`, `v2-after-2-choice.png`.

### Still weak
- The computer maker brews out of sight ("finished" at once), so there's no race.
- The odds on the danger meter can jump from 0% to 60% in one chip. That is correct, but it feels untrustworthy.
- Chip names (Fizzpod, Mossback…) mean nothing at a glance. Players buy what the tag says.
- The day results can show up after the shop.

### Tests (second pass)
`rules-test.js` 95/95, `click.js` 0 errors / 0 hidden-info violations, `hidden-test.js` passed, `lay-phone.js` PROBLEMS 0.

## First pass (PR #47): blind testers were blocked
In the first pass, the permission system blocked the driver calls, so that build shipped without tester numbers.
The baseline row above measures that build.

## What changed (by the brief's checklist)

1. **The board is the screen.** On phones the cauldron fills the middle. The top strip holds the day, your points,
   rubies and flask, plus the rivals' small cauldrons. The "Spaces:" key row, the stat row and the bag-contents text
   panel are gone on phones. Log and Cards moved into the Menu.
2. **Touch the thing itself.** The **bag** is the Draw button: a big painted bag with its chip count, gently glowing
   when it's your move. Stop is the one other big button. It shows what you keep (points and coins). The shop is
   chips on stalls: tap a chip and it flies into a bag drawn at the bottom. Tap it there to take it out, then **Done**,
   and the chips drop into the bag. The explosion choice and the ruby choice are picture tiles (★ +2 points / 🪙 12
   coins to shop; 💎 −2 → 💧 +1 start / flask).
3. **One short line.** A single line above the meter changes with the risk: "Tap the bag to pull a chip!", "Safe!
   Pull another chip", "Risky… one more, or Stop?", "Very risky! Stop now?". Guided tips are one sentence with an OK
   button, with no counters and no "More". A **ghost finger** shows the first bag tap, the first Stop on a risky pot
   (guided game) and the first shop pick. The start-of-day news is a short headline on phones ("✨ Haggler's Hour ·
   🐀 Head start +1").
4. **Cause and effect.** The chip visibly pops out of the bag, hangs for a beat (glowing red if it's white) and flies
   onto its space. The danger meter's new cells pop in one by one and the meter shakes. The pot's glow and bubbles
   rise with the risk. The day report shows one card per maker with the points they earned; the table is under
   "Details".
5. **The fun moment is the centrepiece.** Tap the bag, and a hand rummages in it while the bag wobbles. The pause is
   short when the pot is safe and up to 1.3 s when the next chip may explode it. A tick sound plays on long pulls. A
   second tap hurries the pull and never draws twice. The **danger meter** is a row of cells, one per white point up to
   the limit, with the odds next to it. It goes green, amber, then red, and the 💥 at its end throbs near the limit.
   The **pot** bubbles more and faster as the risk grows, glows red and rumbles near the limit. The **explosion**
   has a full-screen flash, a huge "BOOM!", the reason ("White 9 > 7"), flying shards, a screen quake, a phone
   vibration and a bigger painted smoke burst. The day report waits until the explosion has played.
6. **First game without reading.** The guided game opens on the board with the finger on the bag. After that the
   meter and the line under the bag carry the game.
7. **Portrait first.** 390x763 and 375x553 are both fully playable one-handed: everything you tap sits in the bottom
   third. A compact variant is used on short phones. Desktop and landscape keep the side panel, with the same deck in it.

The rules engine, the AI, online play, hot-seat and saves were not changed. `src/ui6.js` is the new part (the bag,
pull, meter, boil, boom, ghost finger and shop). Small hooks were added in `ui2.js` (the deck), `ui3.js` (events, the
short news), `ui4.js` (report cards, choice tiles, short tips), `ui5.js` (the pull on Draw, menu entries) and
`ui7.js` (the chip launches from the bag after the reveal, bubbles follow the risk, bigger boom).

## Before / after (390x763)

| | Before | After |
|---|---|---|
| Start of the first game | ![](board-first/before-1-start.jpg) | ![](board-first/after-1-start.jpg) |
| Brewing near the limit | ![](board-first/before-2-brew.jpg) | ![](board-first/after-2-brew.jpg) |
| The explosion | ![](board-first/before-3-boom.jpg) | ![](board-first/after-3-boom.jpg) |
| The shop | ![](board-first/before-4-shop.jpg) | ![](board-first/after-4-shop.jpg) |

## Tests (final build)

- `rules-test.js`: 95 passed, 0 failed. `clarity-test.js`: all passed (76,674 checks, 40 games).
- `click.js 0 12` (jsdom, humans only through the page's buttons): 13 games, 0 errors, 0 stalls, 0 hidden-info
  violations.
- `hidden-test.js 10`, `net-strip-test.js 10`: passed.
- `px-test.js`: PROBLEMS 0 (WebGL high/low/medium, canvas renderer, hot-seat, DOM fallback; chips fly, land and end
  where the engine says).
- `lay-phone.js`: PROBLEMS 0 at all 7 sizes (390x844, 390x763, 390x664, 375x553, 412x780, 844x390, 750x342); the baseline had 2 landscape failures. The test now opens Log and Cards through the Menu on phones, because they left the
  header.
- `lay.js` (desktop/tablet, 4 sizes): PROBLEMS 0. The test used to hang on the build before this rework too: it tapped a rival's
  cauldron, then auto-played without going back. It now taps "Back to your cauldron" first.
- `bf-shot.js` (new): a real-tap walk-through of two days at any size: `node bf-shot.js 390x763 bf [--vs]`.

## Found on a real iPhone after publishing

- The tip card and the question sheet showed **under** the painted cauldron. iOS Safari puts the fixed children of a touch-scrolling
  container (`-webkit-overflow-scrolling:touch` on the dock body) in that container's own layer, below the board's canvas. Fix: the dock
  sits above the board (`z-index:4`) and the legacy touch scrolling is off. On portrait phones the dock also keeps its height, so the
  cauldron no longer jumps when a question sheet opens. Desktop Chromium never showed this, so check it on the phone itself.

## Still open

- Blind-tester numbers are now in the second-pass table at the top.
- The computer makers still brew in parallel and finish fast. Their small cauldrons update at the top, but you can't
  watch a rival's pull.
- Rare fortune cards (Haggler's Hour, Wren Feather…) still open a text sheet with chip buttons.
