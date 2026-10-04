# Thornbound: clarity and fun plan (Oct 2026)

Why: the owner says every game is confusing, nobody understands it, and it isn't fun. Three blind playtesters
played `games/thornbound-new` on a 390x763 phone screen with no access to the code or rules notes. Their logs are
in the session scratchpad (`playtest/casual.md`, `careful.md`, `skipper.md`).

Results: one won 16–7 (fun 3.5/5), one lost 12–13 to "easy" ("wouldn't press Play again"), and one won 25–12–2
by pressing the gold button without reading from round 3 on (fun 2/5, "everything between the fights felt like
homework").

What worked, so keep it: the painted look, the big card-flip clash reveals, bidding and bluffing, the tense last
round, the end-of-game "where the Influence came from" breakdown, and the tappable glossary words.

## Root causes (all three testers hit each one)

1. **Effects happen with no visible cause.** Cards are "Eliminated" before a fight, a side gets +4 from nowhere,
   cards flank or retreat, and Influence is stolen or lost. Neither the screen nor the log says who did it or why.
   Fights feel random.
2. **Real bugs.** Each one must be reproduced in a test before it is fixed:
   - The end breakdown doesn't add up to the score (two testers; for example, a Spire Court +1 is missing).
   - "You have the least Influence, so you choose the order" appears while you lead (8–3, 6–0).
   - Using a Favour, or placing Supporters, ends Spring by itself.
   - A Tactic called "once-only" comes back every round.
   - A bought card (Roving Mission) never reached the hand.
   - The round-3 bid panel is drawn over the end-of-round table.
   - The hand reflows after each play, so the next tap lands on the wrong card.
3. **The suggestions can't be trusted.** The text says "tuck your weakest card" but the pick is the 11. The text
   says "nothing else helps", then a card kills you. The suggested Favour cost points twice. The guided game's
   first suggested bid gets cancelled. Steal options act at once, with no "your 6 vs their 5" preview.
4. **Too many systems before the basics land.** Councils, Favours, Tactics, Lore, Sites of Power, Journey and
   Govern, Attrition, and the Lost and Discard piles all arrive in rounds 1–2. Lore's use is first explained in
   round 2. The intro says "five steps" but the screen says "Step 1 of 6".
5. **Seasons are chains of small optional actions.** Spring, Day and Autumn are 3–6 screens of "do this or
   End", with "Other actions (16–19)".
6. **The layout hides or repeats things.**
   - Options are below the fixed button bar with no way to scroll.
   - The map is too small to read the clash numbers.
   - The same rules box and suggestion are repeated 2–3 times per screen.
   - Long buttons are cut off with "...".
   - The fight screen swaps your side left and right.
   - Board cards overlap the title.
7. **No goal or score race on screen.** No screen says how you win until the results. There is no
   running "you 8, Court 3, 2 rounds left" display, and no "this region is 9 vs 7" before a clash.
8. **Jargon on cards can't be tapped.** Only some words are tappable. Heir, Deadly, Retreat, Govern,
   Lost Pile, Rally, Occupier, Order Track, Site of Power and Attrition are not.
9. **Pace and stakes.** The computer acts off-screen. Easy is so easy that choices don't seem to matter.
   There are many "finish this step" screens.

## Changes

Rule for every change: show less, explain cause and effect, one decision at a time. The rules of the game don't
change, except where a bug makes the engine differ from `rules-notes.md`.

A. **Cause → effect for everything that touches the player.** Each elimination, steal, flank, retreat, bonus or
   Influence change is shown as one short event card at the moment it happens: who, what, why, result. For
   example: "Court's Poison Physician (Deadly) eliminates your 9 Pikeman: Deadly removes the highest enemy card."
   The log uses the same sentence.
B. **Clash screen with a strength breakdown per side.** Card + Supporters + Herald + each bonus, labelled, summed,
   and then the winner. You are always on the left.
C. **A score race bar, always visible.** "Most Influence after round N wins · You 8 · Court 3 · Round 3 of 4."
   Before the clashes, each region shows "You 9 · Court 7" in big chips. Tap the map to zoom.
D. **One screen per season.** "Your options this season" lists each option as a row: cost → effect → what you
   gain. One "Done with Spring" button. Options with nothing useful to do are hidden; the computer skips trivia.
   The decision area always scrolls, and nothing sits under the fixed bar.
E. **Suggestions you can trust.** The pick and its sentence come from the same evaluation. Make no suggestion when
   unsure. Previews show "your 6 vs their 5" before anything that resolves at once. Hints are on in the guided
   game and rounds 1–2, then only on request.
F. **The guided game teaches in layers.** Round 1: cards, bids, Herald, hiding cards, Supporters, clashes,
   claiming. Round 2 adds Lore, Sites and Autumn. Round 3 adds Tactics, Favours and Councils, each with a
   one-line "why you'd want this" when it first appears. Normal games keep the full rules.
G. **Every keyword is tappable everywhere**: card text, popups, log, buttons. A card popup shows the plain effect
   first, keywords after.
H. **Remove repetition.** One rules line per screen, not three. No tip that came back after "Hide". Buttons wrap
   instead of truncating.
I. **Stakes and pace.** Show the Court's moves as short narrated events (0.6–1 s each, tap to skip). The default
   computer level is Normal; Easy is labelled "for learning". Bring the opening into one line: "Win by having the
   most Influence after round 4."
J. **Fix every bug in Root cause 2**, each with a rules or UI test that failed before and passes after.

## Acceptance (the game ships only when all of this holds)

- **Three new blind testers** (new agents, no repo access, same three personas) each:
  - explain the goal, a round, and why each of their clashes was won or lost;
  - report zero "what just happened?" eliminations or score changes;
  - find no option they couldn't reach;
  - give fun ≥ 3.5/5 on average, with nobody under 3.
- Automated: the end breakdown sums to the final score in 200 games; every Influence change and every removed card
  has an event with a cause.
- Existing tests still pass: rules, hidden, net-strip, click, lay, lay-phone (all 7 sizes) and p2p.
- Then the owner tries it on an iPhone. Only after the owner's OK does it replace the live game, and this becomes
  the standard brief for the other games.
