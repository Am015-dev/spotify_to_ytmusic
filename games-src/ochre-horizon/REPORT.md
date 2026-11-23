# [NEW4 ochre-horizon] Ochre Horizon: build report

Branch `shelf/W563-new-mars`. Final code commit `8eeeb997`. Not deployed and no shelf card, as the brief says.

## What it is
A 2-player terraforming card-engine game: you against a computer rival (Easy, Normal or Hard), with an optional draft.
- **Rules:** identical to the original (rules-notes.md).
- **Card pool:** 208 project cards split 118 automated / 48 active / 42 events, plus 12 corporations and a beginner corporation. Every card and corporation is our own design, with the same structure, tag mix, cost bands, requirement types and power curve (COMPONENTS.md).
- **Map:** 61 spaces, 12 of them ocean spaces. The named spaces are 4 volcanic spaces, 1 reserved city site and 2 off-map spaces, all with our own names and positions.
- **Goals:** 5 milestones and 5 awards, our own designs.
- **Art style:** a retro 1970s sci-fi poster look in sunset orange and teal, with halftone, grain, a striped sun and a stylised planet, all drawn in code.

## Gates
- `build-all.py --quick ochre-horizon`: **PASS**. All 8 scenario tests pass at 390x763: menu, board, zoom, cards, placement, projects and research.
- `build-all.py --full ochre-horizon`: **PASS** three times, alone in the foreground. That covers phone-check (6 phone scenarios, including rotation) and rules-test. games/lab.html was restored and not committed.
- `game/rules-test.js`: **54/54**. It checks every component count and every rule in RULES-CHECKLIST.md.
- `game/e2e.js`: the real page plays whole games through the UI with no page errors, and the end screen shows.
- Gauntlet, computer against computer (`game/gauntlet.js`), with zero invariant failures across all runs:
  - **Normal vs Normal, 120 games:** seats split 64-56, about 18 generations per game.
  - **Corporations:** in a forced-pick run every corporation wins 40-60%. Four weak corporations were buffed.
  - **Normal vs Easy, 80 games:** 54-26. A newcomer following the hints plays at roughly Normal strength, so Easy is beatable but not free.
- The card data checker (`data/validate.js`) passes. It checks the counts, tag mix, cost bands, requirement mix and the curve.

## Simplified on purpose (interface only)
- **Payment:** chosen automatically, using titanium and steel first.
- **Production attacks:** "decrease production" always targets the rival.
- **Draft:** an option, off by default; normal research is "buy from 4".

## [unverified] items, from memory, for the orchestrator to check
- The exact automated/active/event split and the tag and cost-band counts of the original pool. Ours sit within ±3 of the targets in data/targets.json.
- The number of special-tile cards in the original: ours has 8, my memory says about 11.
- The original corporation count: we use 12 corporate-era corporations plus a beginner corporation.

## Assets
- **Fonts:** Righteous (Astigmatic) and Space Grotesk (Florian Karsten), both SIL OFL 1.1, from Google Fonts, embedded in the page.
- **Everything else:** code art, and sounds synthesised with Web Audio.
- **Not used:** CC0 packs and Sprite Fusion effects. The poster style worked better as pure code art.
- **Credits:** the fonts are logged in games-src/THIRD-PARTY.md.

## Cold play (independent tester with no knowledge of the build)
Round 1 (first build): fun 2/5, 3 dead taps, 4 lost moments.
- Its main complaints were a passive, invisible rival, tips after every action, and an unexplained credit income.
- All of these were fixed, and the computer now values terraforming more.

Round 2: fun 3/5, 3 dead taps, 2 lost moments. Its final verdict, verbatim:
> 1. Full turn without reading? Mostly yes. The orange Cards button, "Can play N", "Play it / Pay X" and "Tap a glowing space, then Place city/ocean here" carried me through. The tips arrive one beat late: right after Keep all 10, the board sat silent and I didn't know what to do.
> 2. Fun: 3/5 every round, flat. The best moment was placing my first ocean (+1 card, +1 rating) and taking the lead. Funding the Stoker award was a close second, because my score jumped by 5.
> 3. Confused: the rival's turns are mostly silent; two numbers per player in the top bar; a card listed as playable gave nothing; card counts were off (20 after keeping 10); the keep-cards tip appeared while the beginner company keeps all 10 free; the Cards sheet reopens on the last tab; the suggestion "Fund the stoker award" didn't say where.
> 4. Goal: raise temperature, oxygen and oceans to score more points than the rival before all three gauges hit their goals.
> 5. 3 dead taps, 2 lost moments after the first minute.
> 6. Play again? Yes, but only if the rival's moves were clearly shown.

Fixed after round 2 (commit 8eeeb997, gates re-run and passing):
- **Card count bug:** the beginner company drew 10 extra cards.
- **Rival's turn:** a toast now lists the rival's moves when your turn comes back.
- **Score strip:** reads "You · points / rating N".
- **Card preview:** a "You get now: …" line shows before Play, with a warning when a card gives nothing right now.
- **Tips:** the keep-cards tip no longer shows for the beginner company.
- **Cards sheet:** always opens on "Can play".
- **Suggestions:** they say where to go (Projects, Awards).

Round 3 was not run, so these fixes have not been tried by a cold player.

## Proof
- games-src/ochre-horizon/proof/first-3-minutes-375x667.webm: the first 3 minutes of Learn to play at 375x667, played with real taps. It reaches generation 9 with no errors.
- games-src/ochre-horizon/proof/1-title.png
- games-src/ochre-horizon/proof/2-cards.png
- games-src/ochre-horizon/proof/3-place.png: the placement preview, showing the bonus before you commit.
- games-src/ochre-horizon/proof/4-board.png
