# R95 strict gameplay review: short-fuse

- Branch reviewed: `shelf/W570-short-fuse-strict` at **f19b37ddffe6380266d6185b7c2d555f3caac42e** ("scrolling crew area is intended")
- Date: 20 Nov 2026 (UTC). Reviewer does not fix games.
- No `F1-REPORT.md` on the branch; F1's claims taken from the brief.
- Proof: `games-src/reviews/R95-proof/` (3-minute webm at 375x667 plus 6 screenshots).

## Verdict: FAIL, average 7.0 (rows 4, 5 and 8 under 7; no stopper)

| # | Row | Score |
|---|-----|------:|
| 1 | Rules fidelity | 8 |
| 2 | Tutorial teaches | 8 |
| 3 | First 10 seconds | 7 |
| 4 | Turn clarity | **6** |
| 5 | Phone play | **6** |
| 6 | AI and pacing | 7 |
| 7 | Feel | 8 |
| 8 | Bugs | **6** |
| | **Average** | **7.0** |

R78 scored 7.4 and failed Phone at 4. F1 really fixed the infinite loops and the 11 px labels, and wires now measure 44 px or more once a stand is open. What fails now is smaller but still real: icons with no labels, a hint switch that gives no feedback, a crowded board at 553 with targets under 44 px until you open the stand, and one dead tap on a glowing card.

## Gates (run alone, 2 runs each)

| Gate | Run 1 | Run 2 |
|---|---|---|
| `build-all.py --quick --out /tmp/x short-fuse` | PASS, 9/9 scenarios, 77 s | PASS, 9/9 scenarios, 76 s |
| `build-all.py --full --out /tmp/x short-fuse` | PASS (phone-check, lab-test, quick sweep), 112 s | PASS, 115 s |

`games/lab.html` was restored after `--full` and is not committed. Also run: `rules-test.js` 101 passed / 0 failed; `logic-test.js` 157 / 157.

## Clutter: helpers and loops (sampled every second)

| Path | Seconds sampled | Max helpers | Seconds with >1 helper | Infinite loops |
|---|---:|---:|---:|---:|
| Tutorial + jobs 1-3, 375x667 (the recorded run) | 182 | 1 | 0 | 0 |
| Tutorial + jobs 1-3, 375x553 | 423 | 1 | 0 | 0 |
| Half-random player, jobs 1-3, 375x667 | 603 | 1 | 0 | 0 |
| 15 s after Hint on (job 1, job 3) | 8 | 0 | 0 | 0 |
| 15 s after "Show me" (job 1, job 3) | 30 | 1 by the audit's count | 30 (see note) | 0 |

Note: after **Show me**, the audit's selectors count 1 helper (a bubble plus its ring). But the yellow **Hint** banner stays visible underneath with the same sentence, so a player sees 2 helpers at once for as long as the bubble stays open (no time limit). The bubble also sits at the top of the screen, and its arrow points at the status line, not at the ringed wire (`R95-proof/showme-375x667-two-helpers.png`). Counting strictly, that breaks the "max 1 helper" rule.

## Rules and components vs the original (from rules-notes.md; never named here)

Engine: matches for every core rule I checked.
- Fuse starts at the number of players.
- Stands: with 2 players everyone has 2; with 3 the foreman (Captain) has 2.
- Opening token goes on one of your own blue wires.
- Dual cut: you must name a value you hold. A hit cuts both wires. A miss burns 1 step and puts a true-value token on the wire. A red wire means boom.
- Solo cut works on all 4 or the last 2, never 3. A hand of only reds is revealed automatically.
- Twin Probe: one red is safe, two reds mean boom. Gear is one card per player from job 3 on, unlocks at 2 cut, and works once.

Job contents also match:
- Job 1 is 24 blue wires (1-6).
- Job 2 is 32 blue wires plus 2 yellows from 1.1-7.1, and no gear.
- Job 3 is 40 blue wires plus 1 red from 1.5-9.5, and 3 gear cards for 3 players.

Rules text: the drawer's rules are right. Deviations:
1. Two house rules, both labelled in the rules drawer and both on by default:
   - A hand with no legal cut skips its turn. The original only covers this for job 9.
   - The bomb goes off after 4 full rounds with no progress (`engine.js:206`). This one is invented. It only fires when everyone keeps skipping, but the owner asked for rules identical to the original.
2. Stale help text, which doesn't match the real flow:
   - The rules drawer says "Tap a glowing wire... Then tap the value. **Then tap the big button.**" (`texts.js:170`).
   - The glossary card says "**press the big button**" (`texts.js:136`).
   - In the game there is no big button: you tap a crew wire, then tap your own number. A first-timer reading Rules looks for a button that doesn't exist.
3. On a phone the rules drawer still says "Keys: Esc..., F9 shows the speed overlay". That's harmless but desktop-only.

## Cold-play evidence (first 3 minutes, 375x667, touch only)

`R95-proof/first-3-min-375x667.webm` (183 s, fresh storage, real media served). The run goes: cover, then **Learn to play** (17 steps, 28 s, one short line and one tap per step), then **Play job 1** (won: 12 turns, 0 misses), then job 2 (lost once to the fuse, then won), then into job 3.

Plain-words verdict:
- **Could a first-timer play it? Yes.** The tutorial uses real taps and covers, in order: showing a wire, the dual cut, a miss with its token, the Twin Probe, gear, yellow, red and the solo cut. Every bubble is one sentence. After that the job brief has a clear goal card, and the status line always says what to tap next ("Now tap your number to say it").
- **Was it fun?** Moderately, yes. The deduction moments land: a token next to a sorted stand really tells you something, and the fuse and "SNIP!" feedback feel good. Three things drag it down:
  - Job 1 is trivial: my bot won it with 0 misses, and the newcomer model wins 97 %.
  - About half of every job is spent waiting: "Plum is thinking... tap to skip" was on screen 84 of 182 s, with a median AI turn of 4 s.
  - From job 2 on, the 2-stand foreman fills the board. At 553 you scroll and open stands to reach targets.
- **Difficulty curve.** 200 headless games per row, 3 crew, teammates on Normal:

  | Player model | Job 1 | Job 2 | Job 3 |
  |---|---:|---:|---:|
  | Engine AI as you | 99 % | 96 % | 90 % |
  | Newcomer model (easy + 12 % random moves) | 97 % | 88 % | 77 % |
  | Weak player (easy + 30 % random moves) | 86 % | 64 % | 53 % |

  The step from job 1 to job 3 is fair; job 1 is just too gentle. In the browser, a bot that played random glowing wires half the time lost job 3 about 16 times in a row. That matches what a careless player would get, so the curve is not unfair.

## Row findings and repro steps (rows under 7)

### Row 4 Turn clarity: 6
- **Top-bar icons have no labels.** The five icons are a target, a sun, a book, a bulb and a menu. Their names exist only as aria/title text, which a touch user never sees, and "Equipment" drawn as a **sun** is misleading. Repro: 375x667, start any job, look at the top bar (`R95-proof/topbar-unlabelled-375x667.png`). F1's cold-play tester raised this too; it is still open.
- **The Hint bulb switches hints on and off silently.** There is no toast, and the icon barely changes. Repro: start job 1, tap the bulb. Hints turn on (`UI.hints` false → true), but nothing says so. Tap again and they turn off, also silently.
- The stale "big button" help text (rules section, point 2) teaches a step that doesn't exist.

### Row 5 Phone play: 6
- **375x553 board is crowded.** Repro: job 3, 3 crew, Teal as foreman, 375x553.
  - The crew area is only y 201-410. Teal's 2 stands (4 rows) fill it, and Plum's stand is pushed below a "more wires below" pill.
  - My own hand (2 stands, 4 rows) takes y 410-553.
  - To point at Plum you scroll, tap the compact strip to open it, then tap the wire: 3 gestures (`R95-proof/job3-375x553-crowded.png`).
- **Targets under 44 px until you open the stand:**
  - Compact-strip tiles are 24x30 at 667 and 22-24 px at 553.
  - The Hint can point at a wire inside a compact strip, which is a 24 px target (`showme-375x667-two-helpers.png`, the ringed "2" in Plum's strip).
  - Player plates are 77x34 and 82x28, and Teal's vertical tab is 18x40.
  - Number chips in a value row are 31-33 px wide (`chip sm g-chip`).
- What passes: in 1,208 sampled seconds, no text was under 11 px. Open-stand wires are 44-51 px, there was no horizontal scroll, and the 3 result buttons are 44 px or more.

### Row 8 Bugs: 6
- **Dead tap on a glowing gear card.** Repro: 375x553, job 3, unlock a number-picking gear card (the Sweep, value 8) and tap it. "Pick one" opens with the 1-12 row. Tap the gear card again: it still glows, but nothing happens (twice in a row; `R95-proof/gear-dead-tap-375x553.png`). The game's own sweep script leaves this case out on purpose (`sweep.js`, "eq while sel==='choose'"). It should either cancel the pick or stop glowing.
- Otherwise clean: 0 page errors and 0 console errors in about 22 minutes of touch play over 4 runs, 0 stuck states, and every job reached its result screen.
- Not a bug: a first tap on a crew wire that might be red shows "Careful: this one might be red. Tap again to point." That's a deliberate confirm step.

### Rows at 7 or above (short notes)
- **Row 1 (8):** engine faithful; points off only for the invented no-progress explosion and the stale help text.
- **Row 2 (8):** teaches every core rule by doing it, then goes straight into job 1.
  - The narrators' names (Brix, Quill) are never introduced.
  - "Reveal reds" is shown, not done by the player.
  - Bubbles sometimes sit on the crew (never on the target, in my runs).
- **Row 3 (7):** big Play button, "Learn to play" right below, a clear goal card. The tagline on the cover is pale text on orange and hard to read (`R95-proof/cover` look in the video, 0-1 s).
- **Row 6 (7):** the AI plays sensibly, and a job lasts 1-2 minutes. But AI turns take 4 s (median) and up to 9 s, and "tap to skip" is on screen about 46 % of the time. Job 1 is too easy (see the table above).
- **Row 7 (8):** strong painted art; the fuse burn, SNIP, "Fuse -1" banner, "+2" pops and illustrated result cards all give feedback (`R95-proof/result-375x667.png`).

## Top fixes (in order)
1. **Label the top-bar icons** (a short word under each, or a first-tap label). Draw Equipment as a card, not a sun. Make the bulb say "Hints on" / "Hints off" when tapped.
2. **"Show me" should replace the Hint banner, not stack on it.** Point the bubble's arrow at the ringed wire. If the wire is in a compact strip, open that stand first.
3. **375x553 layout:**
   - Give the crew area more height: shrink my own stands to 1 row per stand when the foreman's 2 stands are open.
   - Keep the stand you will most likely point at (the one the Hint names) open.
   - Make compact-strip, plate and chip targets 44 px or more.
4. **The gear card glowing during "Pick one" should cancel the pick** (or stop glowing).
5. **Fix the stale help text** ("Then tap the big button", "press the big button"). Hide "Keys: Esc/F9" on touch devices.
6. **Pacing:** cut the AI think time to about 1.5-2 s, and show "tap to skip" only after 2 s.
7. **Job 1:** for the first-time path, consider hiding the deduction aids or starting at 2 crew, so job 1 asks for at least one real deduction.
8. **Rules:** confirm the "4 rounds with no progress" explosion is a house rule the owner accepts, or switch it off by default.

## Method
- I served the branch build (`/tmp/x/short-fuse/index.html`) with the shelf's `games/short-fuse/media`, `models` and `music` folders. A first pass without media showed blank art; that was my serving mistake, not the game's. All judgements above come from the run with media.
- A Playwright touch driver (scripts kept outside the repo) did the playing:
  - In the tutorial it taps bubble buttons or the tutorial's ring.
  - In jobs it taps glowing targets, mostly the move the engine itself would pick; in the half-random run, a random glowing target half the time.
- Helpers and loops were sampled with the calm-audit sampler (`scripts/calm-audit.js` SAMPLE), plus the game's own `#ghost`, `.coachcard` and `.sf-nudge` elements, and a scan for text under 11 px and taps under 44 px.
- The webm is from Playwright's video recorder, re-encoded (VP9, about 5 MB).
