# The Thornbound Throne: newcomer rework (Oct 2026)

Goal: a first-time player on an iPhone understands the game from the first minute. Owner's complaint: "unplayable, very confusing from the first minute, lots of bugs, overlaps on phone, no good instructions with steps". Input: `REVIEW-NEWCOMER-2.md` (merged from `alex/brave-carson-rbpmlk`) and my own first look at the old build.

The rules engine (`game/src/engine.js`, `data.js`, `ai.js`) is **unchanged**; every rules test still passes. All work is in the UI (`game/src/ui1..7.js`, `head.html`, `body.html`), the test scripts and the online test `games-src/net/p2p-tb.js`.

Built file: `game/thornbound.html` = `games/thornbound/index.html` (+ copyright stamp), 1.00 MB.

## What changed

### Front door
* **Painted title** (`ui7.js titleArt()`, an SVG painting drawn in code: dusk sky, moon, castle, a throne wrapped in thorns, paper grain). Three big buttons: **Play** ("new here? a guided first game is ready"), **Online** ("with friends, free, no sign-up"), **Resume** (only when a save exists, shows the round), plus **How to play**. Phones: logo top, buttons bottom; short landscape: buttons side by side.
* **How to play now opens on top of the title** (review P1: the drawer used to open behind it). The rules drawer starts with **"In two minutes"** (goal + the five steps of a round), the full rules and a **"Words used in the game"** glossary are folded below (P20).
* **Setup: "Choose your faction"** with four story cards: an original two-sentence story, a playstyle/difficulty tag and a "Choose X if you enjoy…" line (P18). Desktop shows the cards + options (players, length, tips, a level per computer). Phones show a one-line summary ("You lead Heathbound Clans against 2 computers · 5 rounds") + **Configure** (full-screen dialog with the same cards and options). For first-timers the gold button is **Guided first game**; then Start, How to play / Hot-seat / Watch (P19).
* **Online** opens its own page (host/join, then faction + options for the host). An invite link (`#join-CODE`) now opens straight on the join panel with the code filled in (bug found by the leave/rejoin test: the link used to land on the title).

### Guided first game (scripted, fixed deal)
* Deal: you lead the **Heathbound Clans** against an **easy Gilded Court**, 4 rounds, seed 98 (picked by a node search over seeds with the in-game names so that the teaching moves produce the lesson). With the suggested moves you meet the Court's Herald on Cairn Field and win there with your Heir + 2 Supporters: +2, the Herald's +1 and the steal all happen in round 1. The Court also plays a Tactic on the bids, which the coach explains.
* **Goal first**, then the map, then the shape of a round, each a one-screen coach card with Continue (the score chips / the six locations are highlighted).
* Then one step at a time, each with **one sentence of why** and **one glowing button** in the pinned action row: Step 1 Bid → (bids revealed, explained) → Step 2 Take a Kingdom Card → Step 3 Place your Herald → Step 4 Hide a card at each region (×3) → Step 5 Send Supporters → Clash order → Day actions (none needed) → the clash result card → Step 6 Claim a location → Autumn (skipped this round) → scoring card ("you have 4, the Court has 2, you lead"). Round 2 opens with "Now you lead" and coaches Autumn (Journey/Govern) and spending Lore once. The end card adds where the Influence came from and what to try next.
* In round 1 the suggestions are **teaching moves**, not the strongest moves, and they agree with each other (bid 5, Herald on the contested location, the 10 where the Herald is, Supporters there) (P5). Anything the player does differently still works; the coach falls back to the normal suggestion.

### Plain words everywhere
* **Glossary chips**: 31 game words (Influence, Kingdom Card, Great Road, Herald, Supporter, Clash, Strength, region, location, bid, Tactic, Lore, Site of Power, Govern, Journey, Council, Attrition, Favour, Order Track, Winter, Autumn, Ambush, Retreat, Flank, Deadly, Rally, Deploy, Lost Pile, hand size, occupier, Exhausted…). The first appearance in each prompt, coach line, suggestion and result card is a dotted-underlined button (bold gold until you have opened it once); tapping shows a one-line meaning in a bar at the top of the panel, never over the hand or the buttons (P13).
* **What's happening line** at the top of the panel: every computer action in plain words ("Gilded Court hides a card next to The Sinks.", "Gilded Court is done with Spring actions.", "Gilded Court chooses a secret bid."). Moves that write no log line get a generated line (hidden choices never reveal the card). Your own lines read "You gain 2 Influence (Cairn Field)" instead of "Heathbound Clans gains…". An Influence change that touches you is pinned as a gold second line until your next decision, so a steal is never lost behind later lines (P10).
* **Every suggestion says why** (bid, Kingdom Card, Herald, hidden card, location, clash order, every action group, Site of Power buys, Moss Altar, Ossuary, occupier, slot, councils, yes/no Tactics) (P5).
* Question headings are short names ("Spring actions", "Flank", "Spend Lore", "Choose a slot") and the long engine question is the body, never repeated as a heading (P7).
* Hot-seat players are "P1 · Clans" on chips and "Player 1 (Clans)" in text (P27).

### Phone layout (390x844 … 750x342)
* The dock is now a column: what's-happening line → prompt (scrolls, with scroll shadows) → **pinned action row** (`#act`, never covered, never inside the scroller) → hand → rivals. The old sticky buttons that sat on top of option lists are gone (P3, P6).
* **The board shrinks**: portrait phones keep the square map at `height − 44 − dock minimum`; for list-heavy questions (bids, Kingdom Cards, menus, selections, result cards) it shrinks further so the decision gets the room; for map questions (Herald, hidden cards, claiming, ties, clash order, the map lesson) it grows back. 390x763: map 209–323 px, decision area ≥ 210 px (was 152). 375x553: 150–179 px, decision ≥ 193 px (was 92). Landscape keeps the map at full height on the left.
* Tips/coach lines live **inside** the prompt; they never cover the hand or the action buttons. Pop-ups (card, location, rival, kingdom) end above the hand and the rival chips (`--hb`).
* Result/pass/end cards have a scrolling body and a pinned foot row; Continue can no longer overlap the result (P6). In clash cards the result line comes right under the cards.
* Step tracker on phones: "Round 1 of 4 · Bids" with seven dots in the top bar (P8). Location names are drawn on the phone map when it is ≥ 250 px (P9). The hand stays visible for every question (P16). Rival chips say "4 Influence" (P17).
* Menus: the suggested action and "End" are always in the action row; everything else is folded into "Other actions (n)", grouped (Send Supporters by region, Govern, Journey, Card abilities, Tactics, Favour, Councils, Kingdom Cards) with a one-line meaning per group (P2).
* `#main` scroll resets for each new question (P7).

### Bugs fixed (beyond the layout)
* The location was claimed **before** the clash result card appeared (P12): the result card is now queued at the tally.
* The bids card was shown before a bid-changing Tactic (Crown's Edict) was decided, so it showed you first and then the Court chose first: it now appears after the Tactic, shows "0 (printed 5)", and the coach explains.
* "How to play" behind the title (P1), invite link landing on the title (online), hot-seat naming (P27), stale round in the top bar while the round-end card is up (P17 part), tip cards that hid the decision (P11, now inline and only in rounds 1–2, "Hide" per kind).

### Review problem list, status
| | Status |
|---|---|
| P1 How to play dead | fixed (z-index above the title) + "In two minutes" |
| P2 decision area 152/92 px | fixed: ≥ 210 / ≥ 193 px, pinned action row, folded menus |
| P3 sticky "Choose none" over options | fixed (action row is outside the scroller) |
| P4 no goal / no why | fixed: goal card first, coach + why lines |
| P5 suggestions without reasons, contradicting | fixed (why on every suggestion; scripted coherent round 1) |
| P6 Continue overlaps result | fixed (pinned foot row) |
| P7 broken/duplicated headings | fixed (short headings, scroll reset) |
| P8 no step tracker on phone | fixed (7-dot tracker in the bar) |
| P9 no location names on phone | fixed when the map is ≥ 250 px; below that the names are in every button |
| P10 silent effects | fixed (what's-happening line + pinned "your Influence changed" line) |
| P11 too many tip cards | fixed (inline, rounds 1–2 only, hideable) |
| P12 claim before reveal | fixed |
| P13 jargon | fixed with glossary chips (names kept, not renamed) |
| P14 15 concepts in round 1 | reduced: one concept per step, Autumn and Tactics deferred to round 2 |
| P15 opponent plays 0,0,10 | round 1 is a fixed deal with a close clash and a loss in the Sinks; rounds 2–4 are the easy computer |
| P16 hand disappears | fixed |
| P17 unexplained header / score ring | header fixed; the map lesson names the Influence track |
| P18 no faction info | fixed (story cards) |
| P19 setup form on the title | fixed (title → setup → Configure) |
| P20 rules wall | "In two minutes" + folded full rules + word list |
| P21 icon-only top buttons on phone | not changed (aria labels only) |
| P22 stray dot | not changed (it is a Herald marker) |
| P23 tiny map card slots | not changed (cards are read in pop-ups and result cards) |
| P24 hand size changes unexplained | Attrition/hand size in the glossary and round-end lines |
| P25 bare game-over | fixed (ranking + where the Influence came from + next step) |
| P26 empty desktop dock | coach/prompt fill it |
| P27 hot-seat names | fixed |

## Tests (final runs on this build)
| Test | Result |
|---|---|
| `rules-test.js` | 114 passed, 0 failed |
| `cover.js` | 221 / 221 items fired, 17548 applies checked, 0 invariant violations, 0 problems |
| `hidden-test.js` | PASSED: structural leaks 0, simultaneous-secret leaks 0, legal-move/label diffs 0, AI decision diffs 0, control cheater caught 1096/1745 |
| `net-strip-test.js` | PASSED: 16 games, 4665 stripped copies, poison diffs 0, legal-move diffs 0, structural leaks 0, unlisted-field leaks 0 |
| `click.js 0 9` (jsdom, real buttons) | 10 games (guided, me 3p, me 4p animated, hot-seat 2p/3p, watch 4p, phone me/hot-seat/guided, 2p extended hard): all reached the end card, 0 errors, 0 hidden-info violations, 351 s; coach, glossary, every question kind seen |
| `lay.js` 1366x768 / 1920x1080 / 768x1024 / 1100x700 | PROBLEMS 0 each (map 710 / 1022 / 495 / 642 px) |
| `lay-phone.js` 390x844 | PROBLEMS 0 (map 263 px, decision room ≥ 224 px) |
| `lay-phone.js` 390x763 | PROBLEMS 0 (209 px, ≥ 210 px) |
| `lay-phone.js` 390x664 | PROBLEMS 0 (170 px, ≥ 172 px) |
| `lay-phone.js` 375x553 | PROBLEMS 0 (150 px, ≥ 193 px) |
| `lay-phone.js` 412x780 | PROBLEMS 0 (223 px, ≥ 210 px) |
| `lay-phone.js` 844x390 | PROBLEMS 0 (390 px, ≥ 185 px) |
| `lay-phone.js` 750x342 | PROBLEMS 0 (342 px, ≥ 166 px) |
| `p2p-tb.js full` (desktop) | 3 players (host + client + computer) to the end in 46 s, client agrees with host, 102 remote moves, 0 rejected, 115 packets checked, 0 leaks, 0 errors |
| `p2p-tb-phone.js full` | to the end in 44 s, agrees, 99 remote moves, 0 rejected, 0 leaks, 0 errors |
| `p2p-tb.js ui` / `p2p-tb-phone.js ui` | invite link has `#join-CODE`; lobby opens/Esc/reopen/outside/X all OK; copy fallback selects; host rows "Online: Hosty (you) / Online: Friend1 / Computer"; status line below the board; spectator: no hand, 0 move buttons, 0 face-up rival cards, 0 packet leaks; "The host left" shown; back to start |
| `p2p-tb.js illegal` | 28 malformed/out-of-turn messages sent, 28 rejected, 0 accepted, state unchanged, 0 invariant failures, game finished |
| `p2p-tb.js leave` | client leaves in round 2, computer takes over, game continues; rejoin via the invite link (code prefilled, panel open) in 285 ms, seat back; game finished; 0 leaks (failed before the invite-link fix) |
| `shots-rework.js` 4 sizes | 0 page/console errors at 390x763, 375x553, 844x390, 1366x768 |
| Save/Resume (ad-hoc Playwright) | title shows "Resume · round 1 of 4" after a reload; game, guided state and coach progress restored |

How `lay-phone.js` differs from the shared rule: the shared `phfit.share()` asks the board to be ≥ 0.75 of the short side on short portrait screens. This rework deliberately shrinks the board so the dock has room (the brief and the review both ask for it), so Thornbound's phone test checks instead that the board is ≥ 150 px, that the prompt + action row get their room, and that the action row, the hand cards and the rival chips are never covered (elementFromPoint), plus every shared `phfit.run` text-clipping/primary-button check, tap targets ≥ 44 px (glossary chips count their invisible 44 px tap area), text ≥ 13 px, no page scroll, the title's How to play on top, a glossary chip opening its meaning, and a full guided round by touch only (Herald placed by tapping the map). Location hit areas on the small map are checked at ≥ 20 px (≥ 30 px from 260 px); every location choice is also a ≥ 44 px button in the dock.

Test tooling notes: on a fresh clone `games-src/node_modules` is missing, so `click.js` (jsdom) and the p2p relay (`ws`) fail until `npm install` in `games-src` (click.js now falls back to `require('jsdom')` via NODE_PATH). The Playwright scripts launch `/opt/pw-browsers/chromium`.

## Screenshots
Committed (JPEG): `games-src/thornbound/rework-shots/`
* Before (old build): `before/390x763_00_title.jpg`, `before/390x763_01_r1_tip_bid.jpg` (tip covering the decision and the hand), `before/390x763_02_r1_q_bid.jpg`, `before/390x763_04_r1_q_edict.jpg`, `before/390x763_08_r1_q_herald.jpg`, `before/390x763_12_r1_q_menu.jpg`, `before/390x763_16_r1_q_location.jpg`, `before/390x763_17_r1_event_clash.jpg` (Continue over the result), `before/375x553_*`, `before/844x390_*`.
* After: `after/390x763/` title, setup, configure, the three coach cards, every round-1 guided step, the round-1 scoring card, "Now you lead", the end card, a 3-player mid-game; `after/375x553/`, `after/844x390/`, `after/1366x768/` the same key screens.
* Regenerate everything with `node game/shots-rework.js [sizes] [outdir]` (`JPG=1` for JPEG); the full set (41 per size) goes to `game/shots/rework/` (git-ignored).

I looked at all of them; the issues I saw were fixed and re-shot (title logo over the throne on desktop, clash result below the fold at 375x553, cut bids card, "Clans you" chip, location claimed before the result, the stale bids order, long button labels, rival chips overflowing in 3–4 player hot-seat, duplicated tip + prompt, generic "a strong player would pick this" reasons).

## What is still weak
* **The table is still the SVG kit, not a PixiJS painted table like Kaiten's**, and the title painting is SVG drawn in code, not a rasterised painted WebP. A Pixi port of the map is a separate job.
* **Rounds 2–4 of the guided game are not scripted**: the deal is fixed, round 1 uses teaching moves, after that it is the easy computer and normal suggestions with a few first-time coach lines. The review's alternative tutorial (cards first, bid introduced in round 3) would need a different round order than the rules, so I kept the rules order and taught one concept per step instead.
* **Small portrait phones**: at 375x553 the map is 150 px (names hidden, location taps ~21 px; all choices are dock buttons). Long coach lines still need a short scroll at that size and in 750x342 landscape (decision area 166 px).
* Words are explained, not renamed (Supporter, Journey, Lore stay as in the rules text and the cards).
* Phone top-bar buttons are still icon-only (P21).
* Not tested on a real iPhone (Safari bars, safe areas) — only Chromium with touch emulation.
* Audio untouched and not auditioned.

## Proposed patches to shared modules (not applied)
1. `games-src/phfit.js`: let a game opt out of `share()` (e.g. `exports.share=(W,H,o)=>o&&o.boardMin?0:…` or read `window.PHFIT_BOARD_MIN` from the page), so games that shrink the board for the dock can still use the shared runner without a local rule.
2. `games-src/shell/shell.css`: drawers open under full-screen start screens (`#start` uses z-index 60 in several games, `.gx-drawer` 41). Suggest `.gx-scrim{z-index:66}.gx-drawer{z-index:67}` (Thornbound overrides it locally with `body.in-start`).
3. Test scripts that `require('../../node_modules/jsdom')` / `require('../node_modules/ws')` (several games, `net/relay.js`): fall back to plain `require()` so NODE_PATH works, or note `npm install` in `games-src/README.md`.
