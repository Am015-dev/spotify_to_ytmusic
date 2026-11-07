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
