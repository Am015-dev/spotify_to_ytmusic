# Onyx Atelier rules audit (worker W616)

Source of truth: `rules-notes.md` + `COMPONENTS.md`. Checked against the engine (`src/engine.js`, tests in `rules-test.js`), the Rules panel (`ui.js rules()`) and the guided first game (`tutor.js`). Two players only (the notes cover the duel only). Engine = PASS on every rule; the mismatches were in the TEXT (panel and tutorial). Panel and tutorial now share one set of sentences (`OD.TXT` in `data.js`), asserted by a test.

| # | Rule (notes) | Engine | Rules panel before -> now | Tutorial before -> now |
|--|--|--|--|--|
| 1 | 25 tokens: 4 of each gem, 2 pearls, 3 gold; bag then spiral from centre | PASS (test) | box list ok -> ok | not taught -> setup is staged by the lesson |
| 2 | Pyramid 3 Tiaras, 4 Brooches, 5 Rings; 4 patrons; 3 Favours | PASS | ok -> ok | - |
| 3 | Second player starts with 1 Favour | PASS | missing -> kept in the box text only | you hold it in lesson 4 |
| 4 | Turn = optional Favours, optional refill, then exactly one of take / keep / buy | PASS | FAIL (order of Favour, refill unclear) -> `order` sentence | FAIL (never taught) -> lessons 4,5 then main actions |
| 5 | Take 1-3 gems in a straight line, touching, no gaps, no gold | PASS | "up to 3 gems" PASS; pearls not said -> "gems or pearls" | PASS (lesson 1, must tap a real line) |
| 6 | 3 of one colour or 2 pearls: rival gains a Favour | PASS | PASS | FAIL (not shown) -> said in lesson 1 result |
| 7 | Favour: any one gem or pearl, never gold; goes back to supply; only before a refill | PASS | FAIL (not gold, not after refill) -> `fav`, `refill` | FAIL (one line) -> lesson 4 and 5 |
| 8 | Refill only if bag not empty; rival gains a Favour | PASS | PASS -> adds "no Favours after a refill" | FAIL (never taught) -> lesson 5 |
| 9 | Favour gain: supply, else from rival, else nothing | PASS (test) | not said (low value, not added) | - |
| 10 | Keep: 1 gold + 1 jewel (pyramid or blind from a deck), max 3 | PASS | PASS | PASS (lesson 3) |
| 11 | Buy: cost minus bonus per colour; gold pays any missing gem or pearl; paid tokens to bag; slot refills | PASS | "gold pays for any colour" FAIL (pearls too) -> `buy` | lesson 2 (+ result text) |
| 12 | Matching jewel: needs a coloured jewel; joins one colour (bonus + colour points) | PASS | FAIL (no "needs") -> fixed | not taught (rare; in panel) |
| 13 | Powers: Encore, Polish (nothing if no gem), Favour, Pinch (not gold) | PASS | PASS | Polish taught by buying one (lesson 6) |
| 14 | Crowns: 3 -> patron, 6 -> second; patron points count; patron power resolves | PASS (test added for 6) | PASS -> `crowns` | FAIL (never taught) -> lesson 7 |
| 15 | 10-token limit, return extra before turn ends | PASS | PASS | FAIL (never taught) -> lesson 8 |
| 16 | No action possible: must refill | PASS | PASS | said in lesson 8 result |
| 17 | Win: 20 points OR 10 crowns OR 10 points on jewels of one colour, checked at end of own turn | PASS (tests) | PASS | FAIL: "10 in one colour" (no "points") -> exact text + your real numbers |
| 18 | UI numbers 0/20 pts, 0/10 crowns, 0/10 of one colour | PASS (match notes) | unlabeled -> titles + aria-labels on the three counters | pointed at in the last step |
| 19 | Colourless jewels (3) give points, no colour | PASS (test added) | - | - |
| 20 | Ties | No tie rule exists: only the player who just moved can win, so there is none | - | - |

## Mismatches found and fixed
1. Tutorial taught only take, buy, keep, Favour; refill, powers, patrons, 10-gem limit and win were never taught -> 8 lessons + win step.
2. Tutorial win line said "10 in one colour" (rule is 10 points on jewels of one colour) -> shared sentence with the player's real numbers.
3. Rules panel: Favour rules (not gold, before a refill only) and refill-order were missing -> added.
4. Rules panel: "gold pays for any colour" -> "any one gem or pearl"; matching jewel did not say it needs a coloured jewel.
5. The three race counters had no label -> title and aria-label.
6. Tutorial lessons depended on a fixed script that broke once the rival moved: each lesson now re-stages its own teaching position (counts stay valid, `checkInvariants`).

## Tests
`node rules-test.js` (2227 checks, 30 full games). New: no Favour after refill; Polish with no gem does nothing; 6 crowns -> second patron; colourless jewels; win checked at end of own turn; panel/tutorial share the sentences.

## Not settled by the notes
- Spiral first step direction ([unverified] in the notes).
- Nothing says what happens when the bag is empty and no action is possible (we let the player pass).
- Whether a Favour may be spent after a refill in the original: the notes say no, followed here.
