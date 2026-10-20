# Kaiten Kitchen — blind playtest, "skipper" persona (skips tutorials)

Viewport 390x763. Screens in `shots/round2/skipper/`. Normal game, me vs Odile and Kofi (2 computer chefs), 3 rounds of 9 turns.

## Per-screen log
Format: what I think is happening | what I'd do | confidence 1-5 | confusion | fun 1-5

- 001 title | tap Play (not How to play) | 5 | the first text tap timed out, tapping by coordinates worked (a driver problem, probably not the game's fault) | 3
- 003 "Who is at the counter?" | skip the guided game, pick Normal game | 5 | the guided game is the big red recommended button; Normal is the second option, which is fine. Configure is there but I didn't need it | 3
- 005 R1 T1 table: 3 seat rows, a hand of 9 plates, green +N badges | it's like conveyor-sushi drafting: pick one, the rest pass on. Took Seaweed Roll +6 | 4 | a faded "custard 0" slot already sits in my row before I've taken anything. What are the bells next to the opponents? The "passes to Odile / from Kofi" arrows are small | 4
- 006 lifted card, detail panel, Serve(+6)/Hint/Cancel | Serve | 5 | two taps per pick is fine | 4
- 008 T2: seats fill with chips ("1st now +6", "=3"), and a "Last turn" log | took Steam Bun | 4 | the +N badges vanished from the hand this turn and only came back once I lifted a card. Turn 1 shows them, later turns don't | 4
- 011 T3: Odile has "×3 next nigiri" | grab Sunset Nigiri so Odile can't get it | 4 | after a misread I picked by position, fine | 4
- 017 T5: my custard placeholder disappeared and a "…" overflow appeared | took a bun | 3 | where did my custard slot go? My row overflows to the right | 3
- 020 T6: my score went 12 -> 11 with "−1" in red even though I took a +2 bun | read the log: "−3 roll race (now 2nd)". The live roll-race score swings on other people's picks | 3 | "what just happened" moment, though the log explains it | 3
- 023 T7: Odile and Kofi tied for 2nd with "2nd now +1" each | took a roll | 4 | the tie-splitting rule is never explained up front | 4
- 029 T9: one forced card | still have to lift and Serve it | 4 | a forced last pick still takes two taps; my custard is hidden in the overflow | 3
- 032/033 Round 1 scores: counting animation, a table by category, then an "Order slip" | Next round | 4 | the order-slip colour dots (Odile teal, Kofi yellow) don't match their seat colours (Odile orange/yellow, Kofi purple) | 4
- 035 R2 T1 | Seaweed Roll +6 | 4 | badges are back on turn 1 again | 4
- 041/044 | meant to take Sunset Nigiri, my tap landed on Crispy Prawn. The cards are packed tightly, so it's easy to mis-tap and only Cancel saves you | 3 | — | 3
- 046 lifting a roll shows 0 because I'm already 1st | switched to a bun by tapping it, which swapped the selection | 4 | badges only count points *right now*, so a roll that protects your lead shows 0 and looks worthless | 3
- 051 3-way tie for 1st, everyone +2, my turn shown as −2 | ok | 3 | big swings from ties | 3
- 060 my roll gave 0, Kofi tied me, −2 | annoyed | 3 | — | 3
- 063 Round 2 scores | Next | 4 | — | 4
- 065/066 R3 T1, tried Hint: Hint lifts Fire Paste and shows a popup "A good pick: Fire Paste…" | followed it | 4 | the hint popup covers the card detail panel and the Hint button. Hint picked a 0 card over a +6 roll without saying why | 4
- 068 Twin Sticks show up with no "New:" intro (Fire Paste had one in R1) | took Custard (I was lowest on cups) | 3 | had to read the tappable text to learn what Twin Sticks does | 4
- 071 Sunset on Fire Paste +6 | nice | 5 | — | 5
- 079-085 Twin Sticks: after serving it, a "Use Twin Sticks (serve 2)" button appears next turn, then "Twin Sticks: pick 2", numbered 1/2 badges on the picks, and "Serve both (+3)" | worked | 4 | each 1-icon roll shows 0 on its own but +3 together. The per-card badges are misleading in two-pick mode. The 4-button row is cramped | 4
- 087 my turn ±0: Odile took a roll and tied me | — | 3 | — | 3
- 096 Round 3 scores | See the final result | 4 | — | 4
- 098 Game over: "Odile wins with 44". Custard: I tied for fewest and lost 3 | — | 5 | "ties split the points, rounded down" only shows up at the very end | 4

## Final report

### (1) The goal and what a round is
Score the most points over 3 rounds (meals). Each round you hold a hand of plates. Every turn everyone picks one plate to keep, and the rest of the hand passes to the next player (I pass to Odile, I get Kofi's). After 9 picks the round is scored: rolls are a race (most icons +6, second +3), prawn pairs 5, three fish slices 10, buns score more the more you have, nigiri give flat points (x3 on Fire Paste). Custard is counted only at the end of the game: most cups +6, fewest −6.

### (2) Top 10 confusion moments
1. The live score drops when someone else takes rolls (I took +2 and saw −1): `skipper/020-wait.png`, `051-wait.png`
2. The +N value badges show on turn 1 of each round but vanish on later turns until you lift a card: `005-wait.png` vs `008-wait.png`
3. Badges count points *right now* only, so protecting a roll lead or starting a set shows 0 and looks pointless: `083.png`
4. In Twin Sticks two-pick mode each roll showed 0 but together they were +3: `085-306_468.png`
5. My custard placeholder vanished, and seat rows overflow into a "…" that hides chips: `017-wait.png`, `029-wait.png`
6. The tie-split rules (roll ties, custard ties rounded down) are only explained after the fact: `023-wait.png`, `098-wait.png`
7. Hint chose Fire Paste (0) over a +6 roll without saying why, and its popup covered the detail panel and buttons: `066-350_556.png`
8. Twin Sticks arrived with no "New:" intro card, unlike Fire Paste: `068-wait.png`
9. Order-slip colour dots don't match the players' seat colours: `033-wait.png`
10. Unexplained bell icons next to the opponent rows, and a "custard 0" slot sitting in my seat before I owned any: `005-wait.png`
(Also: the cards are tight enough that I mis-tapped Crispy Prawn instead of Sunset Nigiri: `044-wait.png`.)

### (3) "What just happened?" moments
- 12 -> 11 after serving a +2 bun (lost my roll lead the same turn): 020
- My turn listed as −2 after a +2 pick, a 3-way roll tie: 051
- My roll pick gave ±0 / −2 because an opponent tied my icon count the same turn: 060, 087
- Odile −2 on a turn where she gained a nigiri: 090
- Twin Sticks disappeared from my row after I used it ("pass the sticks back"): 087
The "Last turn" log explained most of these, but only after I went and read it.

### (4) Too much on screen
The bottom area stacks the prompt, a 3-player score bar, a custard status line and a 3-line Last-turn log, and with a card lifted it also holds the detail panel plus 3-4 buttons. Seat rows cram in many chips ("×2 need 1 more", "2nd now +3", "×3 next nigiri", "custard") that overflow off the right edge. The Twin Sticks button row (Serve both / Twin Sticks: pick 2 / Hint / Cancel) is cramped.

### (5) Final score
Lost: **Me 35**, Odile 44 (winner), Kofi 39. Rounds: 14 / 12 / 12, custard −3.
- Gained: roll races (6 in R1 and R3), buns (3 and 6), prawn pair 5, a Sunset Nigiri on Fire Paste (6).
- Lost: no fish-slice sets (Odile got 10 twice and Kofi once), lost the R2 roll race to Odile (only +1), and tied for fewest custard (−3). Twin Sticks took two turns to set up for +3, which wasn't worth it.

### (6) Options or buttons I couldn't reach
None blocked me. The first text tap on Play timed out but tapping by coordinates worked. I skipped "How to play", the guided game, Configure, Online, Hot-seat, Watch, the Log/Diners/Menu icons and "Look at the table" on purpose (impatient persona), so I didn't check them.

### (7) Fun verdict: 3.5/5
I learned the core loop in two turns without any tutorial, and the live per-pick scoring makes every choice feel like it matters. But the swingy live roll-race numbers, the badges that only count points right now, and an overflowing seat row left me feeling the score happened *to* me more than I earned it.
