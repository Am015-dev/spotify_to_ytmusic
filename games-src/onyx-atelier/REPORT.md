# NEW5 report: Onyx Atelier (slug onyx-atelier)

Art Deco jewellery adaptation of the top-ranked two-player duel version of the gem-merchant engine game. You vs a computer rival (Easy / Normal / Hard).
Branch shelf/W564-new-gems. Not deployed, no shelf card (the owner watches the video first).

## Rules and components
Identical to the original: 25-space board refilled from the bag in a spiral, take 1-3 in a straight line, gold + keep (reserve, max 3, incl. blind deck top),
3 Favours (privileges) with every gain/steal case, 67 jewels (30/24/13) with every cost, bonus, point, crown and power (Encore, Polish, Favour, Pinch, Matching),
4 Patrons at 3 and 6 crowns, 10-token limit, forced refill, wins at 20 points / 10 crowns / 10 points in one colour. See rules-notes.md, COMPONENTS.md, RULES-CHECKLIST.md.
Simplified on purpose: none of the rules. UI only: auto-payment (own gems first, gold for the rest); Keep from the close-up uses the first gold unless you tapped one.
[unverified]: the spiral's first step (up vs down; random tokens make it irrelevant) and the undefined "empty bag and no action" case (we pass; never seen).

## Gates
- build-all --quick: PASS (5 own scenarios incl. real-tap take and buy with engine verify, plus menu/board surfaces).
- build-all --full: PASS twice (phone-check 6 scenarios, rules-test). LAB warn only (new game not yet indexed).
- rules-test.js: 2217/2217 checks, 30/30 computer games end, invariants after every move.
- AI bench: Normal beats Easy 14/20; Hard beats Normal 6/10.

## Assets
Fonts Limelight and Josefin Sans (Google Fonts, SIL OFL 1.1, licence files in fonts/). All other art (faceted gems, pearl, gold, cards, patrons,
icons, sunburst) drawn in SVG code; sounds synthesised. Logged in games-src/THIRD-PARTY.md.

## Cold play (independent testers, no knowledge of the build)
- Round 1 (before fixes): played the guided game and ~65 taps; fun 2.7/5, 2 dead taps, 5 lost moments. Main issues: could not tell what the rival did,
  "return a gem" unclear, stale coach line, bonuses not explained. All fixed (rival recap line, longer rival highlights, return prompt + fly, bonus lesson, coach hides on rival turns).
- Round 2 (final verdict, as given): "Full turn without reading? Mostly yes. The yellow hint banner guided the first game well ... Fun? About 3/5. The glowing
  affordable card and the Buy popup felt good. The best moment was seeing 'won The Countess' appear ... I'd play again, but I was only scoring 1 point by turn 12.
  Goal: get 20 points, 10 crowns, or 10 in one colour by collecting gems and buying jewels." Dead taps ~5, lost moments ~4, fun ~3.
  Its issues fixed after: gem count shown (n/10) and Take warns "Over 10", recap starts with "Rival", gold mode says "Gold: now tap a jewel", Refill shows "rival +1 scroll".
  Not fixed (it is the real game): early jewels give few points, so the race to 20 feels slow.

## Proof
proof/first-3-min-375x667.webm (title, guided game, a full game won, replay), proof/1-title.png, 2-buy.png, 3-midgame.png, 4-result.png.

## Not done
No story/campaign mode, no online play; tutorial and hints only. Board cells are 40 px (not 44) at 375x553; 44+ at 375x667.
