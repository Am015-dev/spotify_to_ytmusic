# Nebula Aces: product audit (Oct 2026)

Audited against `games-src/PRODUCT-BAR.md`, using the deployed `games/nebula-aces/index.html` (2,974,154 bytes) served
locally in headless Chromium (SwiftShader WebGL). This is an audit only: no game code was changed.

**What I played**
- **Guided first battle (Core duel):** desktop 1366x768, Normal, defaults. I won in 8 rounds, using the dock's ★ advice
  and "Use recommended" dials.
- **Full battle:** Standard 100, all three waves, Hard AI, desktop. The computer won in 6 rounds (0 errors).
- **Phone:** 390x763 and 375x553 (iPhone user agent, touch).
- **Other screens:**
  - setup, asteroid placement and auto-place;
  - Squads, Log, Rules, the gear menu, Advice and graphics;
  - Show speed / Test speed;
  - the squad builder;
  - Watch the computer;
  - hot-seat with its pass-the-device screen;
  - online Host (lobby, code, invite link);
  - reload and "Continue saved battle".
- **Second tab joining:** not tested. The sandbox's proxy blocks the public relays the room uses (`wss://…` failed with a
  certificate or tunnel error), so the join tab stayed at "Looking for players…". This is a test-environment limit, not
  proven to be a game bug.
- **Log check:** I read the full 186-line log of the 100-point battle against `rules-notes.md`. Every number I checked
  was right:
  - dice counts with the range 1 and 3 bonuses and obstruction;
  - pilot-skill order and initiative ties;
  - bump: no shot while touching;
  - asteroid crits taken on shields first;
  - Hull Rupture counting 2;
  - the light-fighter ace's "attackers can't spend focus" ability;
  - the wing leader's reroll;
  - the free-focus-after-green ability.

## Scores

| Area | Score | Evidence |
|---|---|---|
| A. The game itself | 4 | Waves 1–3 are complete, with 57 pilots, 57 upgrades and a 33-card damage deck. The rules were correct in every log line I checked. Easy/Normal/Hard AI; Hard beat recommended play 3–0 ships. Missing: waves 4+ and the base set's scenario missions (`rules-notes.md` "Not in this version"). |
| B. Learning the game | 3 | Excellent dock: phase tracker, numbered sub-steps, a ★ with "why" on every choice, ghost previews. But there is **no in-game card/pilot/upgrade/damage reference**, card text is shown only as hover tooltips, and the rules are a 2.5k-character summary. |
| C. Playing comfortably | 2 | Good round summaries and a debrief. But there's no undo, the log is a flat newest-first list, and the settings are a row of unlabeled toggles. **The save only happens in Planning**, so a reload mid-round rewinds to the round's start. |
| D. Playing with friends | 3 | Online P2P works: host, code and link; rejoin by browser id; the computer takes over a seat. Hot-seat has a pass-the-device screen. No chat or emotes, no host migration, no async play. |
| E. Look, sound and feel | 3 | Lit 3D ships, asteroids and arcs; ships visibly fly their templates. CC0 samples and music. But the pilot cards show flat silhouettes, labels pile up when ships touch, and on phones the ship name tags are gone. |
| F. Quality | 3 | No game errors in the console (only a favicon 404). But it's 3 MB, the fonts come from Google's CDN (not fully offline), "Show speed" and "Test speed" developer tools are in the main bar, and the action buttons overlap text at 375x553. |

## Problems

### P0: blocks paying users

1. **[shared] Original names are published on the live site.**
   - **Seen:** `games/nebula-aces/rules-notes.md` is deployed next to the game. It names the original game and edition, the
     publisher's short name, the catalogue id, three licensed characters and several original pilot and droid names. See
     lines 3, 10, 146 and 156–158 (the same text as `games-src/xw/rules-notes.md`).
   - **Why it matters:** selling a faithful adaptation needs a publisher licence anyway (PRODUCT-BAR §26), and this file
     shows exactly what it adapts.
   - **Fix:**
     - stop copying `rules-notes.md` into `games/`;
     - keep a neutral copy in the source folder, with the real names only in the private research repo;
     - decide between licence and redesign before selling.
   - **Effort:** S (the file), L (the licence or redesign decision).

2. **No component reference in the game (the owner's example).**
   - **Seen:**
     - Squads shows the pilot ability, but each upgrade appears only as a chip whose text is a `title` tooltip
       (`audit-shots/04-squads-panel.jpg`).
     - The squad builder shows pilot abilities only as tooltips and upgrades as bare names in `<select>` lists.
     - Damage cards appear only in the log.
     - Ship dials are visible only for your own ship while planning.
   - **Why it matters:** none of the tooltips work on a phone. A complete list (12 ships, 57 pilots, 57 upgrades, 14
     damage designs, 17 tokens) does exist on the shelf's `reference.html`, but the game doesn't link to it.
   - **Fix:**
     - add a Cards drawer built from `ref_xw.json`, with tabs, search, the ship dial grid and art;
     - make every pilot, upgrade chip, damage card and enemy ship tag open a large card;
     - as a stopgap, link to `../reference.html#nebula-aces` from the Rules drawer.
   - **Effort:** M. **[shared]** The drawer component and the `ref_*.json` loader belong in the shell.

### P1: clearly below a paid app

3. **The save only happens in the Planning phase.**
   - **Seen:** `ui.js:259` saves only when `G.phase==='plan'`. Reloading during Activation (round 1, action step) gave
     "Continue saved battle", which went back to round 1 Planning with fresh dials.
   - **Why it matters:** an iPhone app switch mid-combat loses the round, and players can reroll bad dice by reloading.
     Also:
     - a new version silently drops saves (`g.v===2` check, `ui.js:260`);
     - "Continue saved battle" is still offered after a finished battle.
   - **Fix:**
     - replace the `KONT` closures with `{h,d}` pending questions so `G` can be saved after every move, or store the
       seed plus a move list and replay it;
     - migrate old saves instead of discarding them;
     - clear the save on game over.
   - **Effort:** L.

4. **"Use recommended" crashes your own ships into each other.**
   - **Seen:** in the 100-point battle, the recommended dials made friendly ships bump in rounds 1, 2 and 3:
     - the freighter into the courier, twice;
     - the freighter into the gunship;
     - the heavy fighter into an enemy.
   - **Why it matters:** each bump skips that ship's action. The recommender doesn't account for friendly ships moving
     in the same round.
   - **Fix:** when picking recommendations for all ships, score them as one plan, with already-chosen friendly ghosts
     as obstacles in pilot-skill order. The AI planner may share the gap; check `ai.js`.
   - **Effort:** M.

5. **[shared] Settings aren't a product settings screen.**
   - **Seen:** the phone gear menu lists "On", "normal", "On" and "Auto · Low" with no labels saying they are music,
     game speed, hints and graphics (`audit-shots/09-phone-settings.jpg`). There's no volume slider, text size,
     reduce-motion, colour-blind mode or left/right hand option. Esc doesn't close the menu.
   - **Fix:** a shared Settings sheet with labelled rows, sound and music volume sliders, text size, reduce motion,
     colour-blind mode and handedness.
   - **Effort:** M.

6. **Maneuver difficulty is shown by colour only.**
   - **Seen:** green, white and red dial tiles (red-green is the most common colour-blindness pair). The `aria-label`
     covers screen readers but not colour-blind sighted players (`ui.js:24`, `ui-ph.js:80`).
   - **Fix:** add a glyph or edge pattern (e.g. "!" on red, "✓" on green) and a colour-blind palette option.
   - **Effort:** S.

7. **[shared] Developer tools are exposed.**
   - **Seen:** "Show speed" (FPS, draw calls, heap) and "Test speed" sit in the desktop top bar and the phone menu
     (`body.html:18`, `perf/perfhud.js`; `audit-shots/05-perf-hud-exposed.jpg`).
   - **Fix:** show them only with `?dev=1` or F9.
   - **Effort:** S.

8. **Ship names are hidden on phones.**
   - **Seen:** at 390x763 the board shows no pilot tags. The mission briefing still says "orange tags at the bottom
     edge", and enemies can be told apart only by tapping.
   - **Fix:** small skill and name tags on phone, or a tap-to-identify hint, plus a toggle.
   - **Effort:** M.

9. **The rules are a one-page summary.**
   - **Seen:** about 2,500 characters with no sections or search. Nothing on:
     - how barrel roll, boost and target-lock ranges work;
     - the stressed-red reveal rule (the summary says a stressed ship "can't fly red", but in fact the opponent picks
       a maneuver);
     - damage deck traits, ion, bombs and mines in any detail;
     - the initiative roll and the asteroid setup rules.
   - **Fix:** a short page plus a full, sectioned rules drawer with search, with phase-aware links from the dock
     ("? rules for this step").
   - **Effort:** M.

10. **At 375x553 the action buttons cover their own explanation.**
    - **Seen:** the pinned main action ("★ Focus") floats over the paragraph above it. Only the first of 4 action
      choices is visible without scrolling the 182 px dock body (`audit-shots/10-375-overlap.jpg`).
    - **Fix:** give the pinned `.acts` bar its own reserved space (padding-bottom on `.gx-dock-body`) or let it scroll
      with the content at short heights.
    - **Effort:** S. **[shared]** The dock CSS is the shell's.

11. **No undo or confirmation.**
    - **Seen:** your action and token spends commit on tap. A mis-tap ("Skip action", the wrong lock target) can't be
      taken back, even before any dice are rolled.
    - **Fix:** a one-step undo for your own choices until the next random event (dice or reveal).
    - **Effort:** M.

12. **[shared] Online is thin compared with paid apps.**
    - **Seen:**
      - no quick chat or emotes;
      - no host migration (`ONLINE-REPORT.md`);
      - the room depends on volunteer public Nostr relays, with no TURN server for strict NATs;
      - no async play (it needs a server).
    - **Fix:** a quick-chat/emote channel in `net/netroom.js`; plan a small relay plus TURN before selling.
    - **Effort:** M (chat), L (server).

### P2: polish

13. **The battle log is hard to scan.**
    - **Seen:**
      - it is a flat newest-first list with no round headers, filters or dice icons;
      - the opponent's asteroid placements aren't logged (only "Free Compact places an asteroid" ×3);
      - when one hit deals two crits, only one card name appeared in the guided game's log.
    - **Fix:** group the log by round, add the missing setup lines, and log every damage card.
    - **Effort:** S.

14. **The defeat screen hint is wrong at the top size.**
    - **Seen:** "Next sortie: pick a bigger battle size, or switch sides" appears after losing at Standard 100
      (`ui.js:147`, `audit-shots/07-defeat-screen.jpg`). There's no Rematch button.
    - **Fix:** write the hint for the size actually played, and add "Rematch (same squads)".
    - **Effort:** S.

15. **Labels overlap and big ships hang off the mat.**
    - **Seen:**
      - when ships touch, the name tags and the "BUMP" text sit on top of each other;
      - at deployment the large freighter's model sticks out past the mat's bottom edge (`audit-shots/06-std100-plan.jpg`),
        which reads as "off the board = destroyed";
      - the top-row enemy tag is clipped by the legend bar.
    - **Fix:** de-overlap tags, clamp large models to the base footprint, and add top padding.
    - **Effort:** S–M.

16. **[shared] Fonts come from Google's CDN.**
    - **Seen:** `head.html:7-8`. With no network the fonts fall back, and the CDN is a privacy issue in the EU.
    - **Fix:** inline subsetted WOFF2.
    - **Effort:** S.

17. **[shared] No favicon or web-app manifest link** on the game page (the 404 on `/favicon.ico`).
    - **Fix:** a per-game icon plus the suite's `manifest.webmanifest`.
    - **Effort:** S.

18. **Card art is placeholder-like.**
    - **Seen:** pilot cards use flat SVG silhouettes on software GPUs (`audit-shots/04-squads-panel.jpg`); the
      `GRAPHICS-REPORT.md` known limits say the same.
    - **Fix:** painted portraits through the art manifest.
    - **Effort:** L.

## Top 5 fixes (value for effort)
1. **Take the original names off the live site** (P0 #1). Effort: S.
2. **In-game Cards drawer plus tap-to-read**, built from `ref_xw.json`. Link to `reference.html` today as a stopgap
   (P0 #2). Effort: M.
3. **Hide the dev tools, label every setting, and add volume and text size** (#5, #7). Effort: S–M.
4. **Phone readability:** ship tags on phones, the 375x553 action-bar overlap, and colour-blind dial glyphs (#6, #8,
   #10). Effort: S–M.
5. **A recommender that avoids friendly bumps**, plus a one-step undo (#4, #11). Effort: M.

The save rework (#3) is the most important large item: without it an iPhone app switch costs players a round.
