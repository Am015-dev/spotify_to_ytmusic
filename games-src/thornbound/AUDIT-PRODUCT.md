# The Thornbound Throne (new build): product audit

Build audited: `games/thornbound-new/index.html` (1,003,371 bytes, source `games-src/thornbound/game/`), served locally.
Checked against `games-src/PRODUCT-BAR.md`. Known items from `REVIEW-NEWCOMER-2.md`, `REWORK-REPORT.md` and `GAPS.md`
were re-checked, not copied.

**How I tested** (headless Chromium, touch emulation on phones, Google Fonts blocked; the fonts are embedded anyway):
- **390x763, guided first game:** played to the end, 4 rounds, won 20–6. I tapped cards, the Great Road, glossary words and the rules.
- **1366x768, full game:** 3 players vs 2 normal computers, 5 rounds, following the suggestions. Won 16–11–9.
- **375x553:** guided round 1, a 3-player hot-seat round 1, save, reload and Resume, and the online Host screen.
- **Console:** 0 page errors and 0 console errors in all three sessions. The only errors were WebSocket failures to the public Nostr relays, which this sandbox blocks. Because of that, a second tab could not actually join; the repo's own `p2p-tb.js` local-relay test is the evidence for online play.
- **First paint:** 68 ms; DOMContentLoaded 144 ms (local).
- **Rules:** I read both game logs against `rules-notes.md`. Every spot-check matched:
  - Herald steal is capped at what the rival has.
  - The last player on the Order Track sets the clash order.
  - A steal needs a strictly higher bid (+3 from the stealing Kingdom Card).
  - Attrition lowers hand size.
  - Lost Pile vs. Resilient.
  - Order Track by Influence.

## Scores (0–5)
| Area | Score | Evidence |
|---|---|---|
| A. The game itself | **4** | The full multiplayer base game, 2–4 players, 4/5/6 rounds, 51 Kingdom Cards, 4 factions; 114 rules tests and a clean log. Missing: the solo opponent mode (no rulebook) and the optional "advanced setup" (mulligan + secret Kingdom Card), which is in rules-notes §3 but not in the engine. AI has easy/normal/hard (hard beat 3 normals 82%), but 2-player balance is off: one faction wins 63% (`game/ENGINE-REPORT.md:25`). |
| B. Learning the game | **3** | Good parts: a scripted guided game with "step n of 6" and a why on every suggestion, a 31-word glossary on tap, and a rules drawer that starts with "In two minutes". Weak parts: **no component reference at all** (no list of cards, Kingdom Cards, Tactics, Site cards or locations with counts), and the game is missing from the shelf's `reference.html`. The first lesson is undercut, and the same stale tip shows in every action step. |
| C. Playing comfortably | **2** | Missing: undo and any confirmation (one tap commits a bid or a hidden card). Settings are only sound on/off, music on/off, graphics High/Low, computer speed and tips: no volume, text size, colour-blind mode, animation speed or handedness. The end breakdown is cut to 5 sources. Save/Resume works after a reload, but the save is not version-checked. |
| D. Playing with friends | **3** | Works: online host/join with an invite link, rejoin, the computer taking over a seat, hidden information stripped (tests), and a good hot-seat pass screen. Missing: the game ends if the host leaves (no migration), no chat or emotes, no async play, and it depends on free public relays. |
| E. Look, sound and feel | **2** | Consistent but flat SVG vector art (title throne, small hand-card art). It is not the painted PixiJS table the brief asks for. The map is 150 px on a 375x553 phone and unreadable. Motion is limited to flips and tokens. Real audio samples are bundled, but the credits say "placeholder synthesised tones". |
| F. Quality | **4** | Fast and light (1.0 MB), 0 errors, every button has a name, hand cards are labelled ("Heir…, strength 10"), there is an aria-live line and keyboard Esc on drawers. Not in the shelf's service worker (it is a preview slug), so it does not work offline. |

## Problems

### P0 — blocks paying users
1. **No card or component reference.**
   - **What I saw:**
     - Nowhere in the game can you browse the 51 Kingdom Cards, the 4×19 faction cards, the 16 Tactics, the Site of Power cards, the Favour actions or the 6 locations.
     - You can only read a card when it is in your hand, on the Great Road, or in a rival pop-up.
     - Great Road thumbnails show only a suit icon: two scroll cards look identical, and you must tap each one.
     - The shelf's `games/reference.html` covers other games but has no Thornbound entry.
   - **Where:** `audit-shots/04-great-road-thumbs-390.jpg`; `grep -i reference game/src/ui*.js` → nothing.
   - **Fix:**
     - Add a "Cards" tab to the Rules drawer, built from `data.js`: KC, BASICNAMES, TACTICS, site_of_power, favour.
     - Give it filters (faction, suit, type), count ×1, the picture via `cardEl`, the full text and a search box.
     - Link it from every card pop-up ("all cards") and from the throne pop-up.
     - Add Thornbound to `refpage/gen.py`.
   - **Effort:** M. **[shared]** The drawer tab pattern and gen.py entry should come from the shell.
2. **The public repo names the original game, its publisher and designers.** `games-src/thornbound/rules-notes.md` (first lines), `cards.json` and `sources.md` carry the real title, publisher and designer names. The brief allows real names only in the private research repo. Any shipped or sold version also needs a publisher licence, or it must be redesigned enough to be our own.
   - **Fix:** Move these files (or their `ref`/source lines) to the private research repo, scrub the git history before going public or paid, and decide licence vs. redesign.
   - **Effort:** S (move) / L (licence). **[shared]** The suite needs a repo-wide check.

### P1 — clearly below a paid app
3. **No undo and no confirmation.**
   - **What I saw:** Tapping "Bid Sailing Hall (5)" or a hidden-card placement commits at once. The UI state has an unused `undo:null` (`game/src/ui1.js:14`).
   - **Fix:** For your own simultaneous secret choices (bid, the 3 face-down cards, Supporter counts), keep them editable until "Confirm" or until the last player locks in. The engine already collects simultaneous choices.
   - **Effort:** M. **[shared]** A "commit row" pattern.
4. **The guided first lesson is cancelled at once.**
   - **What I saw:** Step 1 teaches "bid 5, the higher bid picks first". The scripted Court then plays Crown's Edict, your bid becomes 0, and the coach says "for now just watch". The first decision a newcomer makes has no effect, and a power they have never heard of is introduced.
   - **Where:** `audit-shots/05-guided-bid-cancelled-390.jpg`.
   - **Fix:** In the scripted round 1, keep the Court's Tactic for round 2, so bid 5 vs 0 wins and the Kingdom Card pick follows.
   - **Effort:** S.
5. **The same tip shows in every action step.**
   - **What I saw:** "Supporters add +1 Strength each in a region's first Clash…" appears in Spring, Day and Autumn. In Autumn it sits above "Suggested: Brine-Hardened…", so it teaches the wrong thing at that moment.
   - **Where:** `audit-shots/06-autumn-stale-tip-390.jpg`; `game/src/ui4.js:95` and `ui.js:548` (`menu:` tip is phase-blind).
   - **Fix:** Give each phase its own tip (Day: Ambush, Retreat, Flank; Autumn: Govern, Journey, Rally).
   - **Effort:** S.
6. **The decision area is too small on small phones, and the map is unreadable there.**
   - **What I saw:** At 375x553 the map stays at about 150 px (locations about 20 px, names hidden). The Kingdom Card question shows one line of the first card; the other two options and "Keep your card" need a scroll that has no cue.
   - **Where:** `audit-shots/08-kingdom-choice-375.jpg`.
   - **Fix:** On list questions, let the map collapse to a 60 px strip (region chips with totals) and tap to expand. Show the option count ("3 more below").
   - **Effort:** M. **[shared]** Phone layout rule in `phfit`/shell.
7. **Your own board is not on screen.**
   - **What I saw:** The Kingdom Cards you hold, your Supporters on the board, your Tactics (used or not), your Lore and your Council cards are visible only in the "My board and piles" drawer or the rival pop-ups. On desktop the 960 px map leaves a black band on the left (`audit-shots/12-desktop-midgame-1366.jpg`), and on phones there is no room at all.
   - **Fix:**
     - Desktop: a player-board strip under the hand.
     - Phone: chips on your own player chip (KC ×2, Supporters 5, Tactics 3/4, Lore 2), tap to open.
   - **Effort:** M.
8. **The end breakdown is incomplete.**
   - **What I saw:** "Where the Influence came from" lists the top 5 sources only. In the guided game it listed 13 of 20 points; on desktop, 10 of 16. Steals are not listed. Online it is blank (`NET.on` → '').
   - **Where:** `audit-shots/07-end-breakdown-390.jpg`; `game/src/ui7.js:133-135`.
   - **Fix:** Show every source plus "Herald steals ±n" and the total. Show a per-round score graph. Send the stats to clients.
   - **Effort:** S–M. **[shared]** End-screen component.
9. **Settings are thin.**
   - **What I saw:** No volume sliders, text size, colour-blind palette (factions are told apart by red/green/orange/purple chips; there are icons, but the score-track tokens are colour-only), animation speed, or left-handed layout. Settings cannot be reached from the title screen (the top-bar buttons sit behind it).
   - **Where:** `game/src/ui5.js:76-82`.
   - **Effort:** M. **[shared]** One settings panel in the shell for every game.
10. **Online gaps.**
    - **What I saw:**
      - If the host leaves, the game is over (`game/src/net.js:12,46`).
      - No quick chat or emotes.
      - The whole service relies on free public Nostr relays: here every relay failed (certificate or proxy), and the lobby only said "Looking for players…" with no error or fallback.
      - No async play.
    - **Fix:**
      - Show an error after 10 s ("can't reach the matchmaking servers").
      - Add 6–8 emotes.
      - Plan host hand-over; it needs hidden state shared with a trusted seat, or a small server for a paid product.
    - **Effort:** M/L. **[shared]** netroom.
11. **Art is placeholder-grade for a paid product.**
    - **What I saw:** The title throne is a flat outline; the hand cards have small generic portraits with only the Strength showing; the map is an SVG kit at 150–320 px on phones. The brief's PixiJS painted table with flying cards (Kaiten standard) is not done (REWORK-REPORT "still weak").
    - **Where:** `audit-shots/01-title-390.jpg`, `03-card-popup-390.jpg`.
    - **Fix:** Generate the final art from `ART-PROMPTS` (Google Flow) and port the table to Pixi with card flights.
    - **Effort:** L.
12. **Missing modes.** No solo opponent (the published base box has one; GAPS §1) and no advanced setup variant. The menu does not tell the player either is absent.
    - **Fix:** Build the advanced setup (rules are known). For solo, design an original labelled opponent or get the solo rules.
    - **Effort:** M / L.
13. **2-player faction balance.** The Gilded Court wins 63% of 2-player AI games and the Clans 40% (`game/ENGINE-REPORT.md:25`). The guided game has a newcomer play the weakest faction.
    - **Fix:** Tune the AI usage of the Council of Pledges for the other factions, or show "strong at 2 players" on the faction card.
    - **Effort:** M.

### P2 — polish
14. **Stale credits.** They say "Sound: placeholder synthesised tones", but real CC0 samples are bundled, and the sample credits/licences are not shown in the game (`game/src/ui5.js:82`). **Fix:** Add the `audio/thornbound/credits.html` lines. **Effort:** S. **[shared]**
15. **Unexplained Heir elimination.** The log says "Gilded Court's Heir… is Eliminated" with no cause; the cause was the Court's own Kingdom Card drawback (a rival Follower in the clash). The newcomer cannot tell why. **Fix:** Log the source card. **Effort:** S.
16. **Misleading log line.** A forced discard from a rival's effect ("Midnight Pressure") is logged as "discards 1 card to fit their hand size" (`game/src/engine.js:186,450`). **Fix:** Pass the reason. **Effort:** S.
17. **Generic suggestion reasons.** "Take Cutthroat Crew (tap it to read it)" gives no why. The Spend-Lore reason "stronger than your basic cards… makes your deck better" is given for an HQ, which never enters the deck (`audit-shots/12-desktop-midgame-1366.jpg`). **Effort:** S.
18. **Desktop setup is cut off at 1366x768.** "Start the game" is 130 px below the fold with no scroll cue, and the per-computer level rows are cut off at the bottom edge (`audit-shots/11-setup-cut-1366.jpg`). **Fix:** Pin the start row. **Effort:** S.
19. **Phone action row and map tokens.**
    - Half-visible button stubs peek above the pinned action row (Herald step at 390x763).
    - Glossary chips are 24×22 px visually (their hit area is padded).
    - A "K" marker and score tokens cover the "Cairn Field" and "10" labels on the map.
    - **Effort:** S.
20. **Unversioned save.** The save stores `v:1`, but `loadSave` never checks it, so a new build with a changed state shape could crash on Resume (`game/src/ui1.js:136-139`). **Fix:** Check the version and offer "start new". **Effort:** S. **[shared]**
21. **Preview slug.** `thornbound-new` is not in `games/sw.js` SLUGS and is not on the shelf, so it is not offline-capable or discoverable. Promote it when ready. **Effort:** S.

## Top 5 fixes (value for effort)
1. **In-game card reference** (all cards with counts, search, linked from every pop-up) plus the shelf reference entry. Effort M. Answers the owner's complaint directly.
2. **Phase-specific tips, and keep the Tactic out of guided round 1.** Effort S. The first five minutes stop contradicting themselves.
3. **Edit-until-confirm for your secret choices**, plus a complete end breakdown with steals and a round graph. Effort M.
4. **Phone: collapsible map on list questions**, and your own board as chips. Effort M. Biggest phone readability gain.
5. **Move real-name research files out of the public repo; settle the licence question.** Effort S now, L later. Required before charging.
