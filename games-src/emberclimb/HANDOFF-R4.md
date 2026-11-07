# Emberclimb R4 fix (W370, branch shelf/W370-emberclimb-fix, from W363 + alex/brave-carson-rbpmlk, not deployed)

## Review items (REVIEW-R4.md) -> status
1. Story buttons stacked/dead: game class renamed `.ec-ghost` (W363); verified by real taps (phone 390x763, 844x390, PC 1440x860): Close, Skip, Next, Play, result Story map / Play again / Next chapter / Title all tappable, none covered. FIXED
2. No pictures: temp art (85 slots) installed locally via `cp temp-art/*.webp games/emberclimb/media/` and judged; backgrounds + 100 card pictures still code placeholders. PARTLY (needs the deploy copy step + Flow art)
3. Hand cards without rule text: every hand card shows cost, name, type word, full effect text (13px phone, 16px PC). Hands over 5 cards keep the old compact look (overlap) + key number; tap-lift shows the text. FIXED
4. Lifted card under the pills: hand z-index above the control row, lift scale 1.65. FIXED
5. Phone dock gutter: 16px side padding, potions no longer clipped. FIXED
6. PC dock empty / potions off screen: dock 300-340px, potions 52px in view, relic list (icon, name, text) fills the dock; hand cards 150px, hand + piles + potions all visible at 1440x860. FIXED
7. HP chip on defeat: shows 0. FIXED
8. Raw "PORTRAIT" tag in unlock lines: hidden by CSS (`.gxc-unl .gxc-tag`). FIXED in game
9. Guide reward screen behind Story dialogs: the game goes to the title before the chapter result. FIXED
10. Chapter 1 star 3 was a free star: now "Finish above 60% HP". FIXED
11. "You reached the summit" for a short climb: result says CLIMB WON! when floors < 9, dock says "You won this climb." FIXED
12. No confirm on Restart / Leave / Title: first tap turns the button into "Sure? Tap again" (4 s). FIXED
13. Title Settings showed "Leave: Title screen": hidden on the title. FIXED
14. Deck view chip over names / tiny text: bigger deck cards, 13px/16px text, chip hidden. FIXED
15. Result screen: buttons sticky at the bottom (landscape reached), shared dock hidden on the result. PARTLY (W363 already added cause, deck, relics, stars; no "same hero again" or run summary)
Top-5 #5 balance (floor-1 53 HP enemy, chapter 2 won first try): NOT done (needs a tuning round with bal.js).

## Shared kit check
`'relic'` added to UNLOCKS in shell/gx-campaign.js is additive. `build-all.py --quick cauldron-fair redline-rally twin-thrones` PASS. Not reverted.

## Remaining (shared files, listed for the orchestrator)
- E6 on phone, phone-s, pc: Menu panel jump chips (Game, Sound, Speed, Help, Accessibility, About: `div.gx-set>nav.gx-set-nav>button.gx-chip`) scroll only, no DOM change, so the audit calls them dead. Shared `gx-kit` Menu.
- B1 phone-s: Menu > Sound row label "Music" contrast 3.01:1 (`.gx-row-l`, shared gx-kit css; a game override did not take).

## Found -> fixed while testing
- Result buttons hidden under the shared bottom dock on phone: dock hidden on the result screen.
- Result buttons below the fold in landscape: sticky button bar.
- Energy number unreadable over the new orb art (audit B): dark disc behind the number.
- Playwright 1.56.1 needs browser build 1194: shim symlink in /opt/pw-browsers (outside the repo).

## Tests
build-all --quick emberclimb PASS (11/11 scenarios); smoke, tutor-test, rules-test 100 games PASS; ui-audit phone A0 B0 C0 D0 E6 F0, phone-s A0 B1 C0 D0 E6 F0, pc A0 B0 C0 D0 E6 F0.

## W373 polish (branch shelf/W373-emberclimb-polish, from W370; not deployed)
Found -> fixed:
- E6 (Menu jump chips dead, all sizes): the shared chips only call scrollIntoView, so no DOM change. Other games pass only because their Menu has >14 buttons and the audit stops at 14 (UA_MAX_BTN); Emberclimb's shorter Menu exposed it. Fix in src/ui.js: delegated click marks the chosen chip `aria-current` (+ highlight in head.html). Real taps 390x763: 6/6 chips hit, marked and scrolled.
- Chips also overflowed the nav (About/Accessibility clipped or covered, tap landed outside): nav now bleeds 22px into the panel padding, chips flex:none, padding 4px, gap 3px.
- B1 phone-s "Music" (and "Effects" on phone), contrast 3.01: text colour was already fine (#231a10 on cream); the audit read the dark scenario tag pill over rows that sit under the clipped sheet edge. Fix in head.html only: tighter section spacing, sheet bottom padding 10px (<1000px wide), extra tightening when taller than 650px, so no row straddles the tag. No generic class clash left (`.chip` is the game's own; the shared Menu uses `.gx-chip`).
- Hex Acolyte HP 48-54 -> 40-44 (first fight relief for a human, per review).
Audit now A-F all 0 on phone, phone-s, pc.
Balance (200 seeds 7000+, headless, first-legal-play bot = validMoves()[0]; ai = aiMove bot), whole climb:
- ch c2 (floors 2, iron-warden): first-legal 100%, ai 100% before and after. First fight alone 100%, hero loses 0-12 HP.
- ch c3 (thorn-brute): first-legal 31%, ai 86% (already much harder than c2); c4: 96%/99%.
- Gate NOT met: 70-85% for c2 needs enemy HP x2.0 (74%) or damage x2.5 (70%); that would make a human's first fight brutal and contradicts the review ("too strong"). Left c2 easy for bots; c3 is already harder. Owner decision needed: add an explicit dmgPct/hpPct step to c2 only if a stricter first chapter is wanted.
