# Twin Thrones: independent review R2 (7 Nov 2026)

Played live (https://am015-dev.github.io/spotify_to_ytmusic/twin-thrones/) with real input only:
- Phone 390x763, CDP touch: vs computer Normal, full wonder draft, 3 ages, 31 turns, ~1.5 min of input. Won 56-42 on points.
- PC 1440x860, mouse: vs computer Hard, full game, 31 turns. Won 60-33 on points.
My play was deliberately simple (take the first card I can afford, raise a wonder every fourth turn, else sell). No console errors. Art not judged (placeholders).

Anchor: 7 = a stranger would happily play it again.

| # | Row | Score | Why (screen, what a player would say) |
|---|-----|-------|------|
| 1 | First minute | 7 | Title has one clear "Play vs computer" with difficulty; the wonder draft explains itself ("Draft four wonders each", each wonder lists its effect in plain words). Straight into the first age after the draft. |
| 2 | Clarity of the core decision | 6 | Selecting a card opens a sheet with "Build · 1$ / Sell +2$ / <wonder> · 8$": the build/sell/wonder choice and its price are very clear. But in the pyramid only the bottom row shows costs and effects; every covered face-up card shows just its name (PC age 3: "Armory", "Planetarium", "Sky Obelisk" with blank faces). Player: "What does Planetarium give? I can't plan ahead." Progress tokens show 3-letter stubs ("Sac", "Dee", "Fer"). |
| 3 | Original's fun moment lands | 5 | The tug-of-war track, chains and wonder race are present, but the rival never fights back, so the tension of denying a card or racing to science/military supremacy never shows up. Both games ended on points with a big gap. |
| 4 | Computer opponent quality | 3 | Result screens: Normal ended with the computer holding $60 and 1 science point; Hard ended with $45, 3 civic points and 0 guilds, and lost 60-33 to a player who takes the first affordable card. Player: "Hard is a pushover, it just hoards money." |
| 5 | Pacing | 7 | AI turns are quick, ages flow with an "Age III begins" toast and a who-starts prompt; a full game is an estimated 15 minutes for a human. |
| 6 | Feedback and juice | 5 | A taken card ghost-flies across the pyramid; the conflict pawn moves. No sound, no coin pop, no highlight when the rival takes the card you wanted, and the result screen is a plain table. Player: "I didn't notice the military coins I lost." |
| 7 | Phone playability | 5 | Board at 390x763: pyramid cards are ~28 px units, the action sheet covers the bottom pyramid row and your own city strip while you decide, and token labels are unreadable. Draft, sheet buttons and result screen are fine. |
| 8 | PC playability | 6 | PC board: the pyramid uses the left 70% while the right panel is mostly empty space with two buttons; covered face-up cards show names only. Mouse works everywhere. |
| 9 | Rules faithfulness | 7 | Draft order, pyramid layouts, face-down rows, buy/sell/wonder, trade pricing (2 + rival production), chains, military coin losses, science pairs and tokens, age-start choice, end scoring categories: matches the original as I know it. rules-notes lists card values as guessed. |
| 10 | Stability | 8 | Two full games to result, no errors, no stuck prompts (who-starts and token picks resolved fine). |

Average: 5.9. Lowest row: 4 (computer opponent, 3).

## Top 5 changes (most fun first)

1. Fix the AI coin hoarding: in the move scorer, value coins as roughly 1 point per 3 at game end, add a penalty for selling while holding over 10 coins, and add terms for denying the human a card that would complete a science pair, a chain or a military step, then check that Hard beats a take-first-affordable bot in 70%+ of 100 headless games.
2. In the pyramid, show every face-up card's cost and effect as a strip in its visible top part (or a long-press/hover enlarged preview), so covered cards are readable.
3. On phone, make the action sheet a compact single row (Build / Sell / Wonder) docked above the city strip, so the bottom pyramid row and your own city stay visible while you decide.
4. Replace the 3-letter progress token stubs with an icon + a tap/hover tooltip giving the full name and effect.
5. Add feedback beats: coin pop on gain/loss, a red flash on the military track when coins are lost, a "Rival took X" toast with the card flying to their city, and sound on build.
