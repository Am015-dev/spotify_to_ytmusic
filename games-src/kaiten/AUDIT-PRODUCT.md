# Kaiten Kitchen: product audit (Oct 2026)

Audited build: the deployed file `games/kaiten-kitchen/index.html` (2.46 MB), served locally and played in headless
Chromium (SwiftShader WebGL, so the renderer picked "Low" graphics). Played as a newcomer:
- guided first game, 2 diners, iPhone 390x763 (touch): finished, lost 39–66;
- full game vs 3 **hard** computers, desktop 1366x768: finished, 24 / 47 / 41 / 35;
- full game vs 2 normal computers, iPhone 390x763 (touch): finished, 23 / 46 / 46 (tie broken on custard);
- hot-seat, 3 people, 375x553: pass screens and hidden hands checked for 2 diners;
- every bar drawer (Diners, Log, How to play, Menu), the title, setup, Configure sheet, round pad and final card;
- online: hosted a room on desktop and joined from a second page by the `#join-` link at 390x763.
  **Blocked:** the sandbox proxy rejects every public signalling relay (`ERR_CERT_AUTHORITY_INVALID`), so the two
  pages never met. Online was audited from `src/net.js` and `game/ONLINE-REPORT.md` instead.

Rules checked against `PLAN.md` (Kaiten has no `rules-notes.md`, see P2-6): hand sizes (8 cards with 4 diners, 10
with 2), Twin Sticks used on a later turn and returned to the hand, Fire Paste ×3, the roll race (6 icons +6; two
diners tied on 3 icons for second each got 1 = 3 split, rounded down), custard at game end (4 diners: most +6,
fewest −6; 3 diners with two tied for fewest: −3 each; 2 diners: no penalty), tie broken on custard. All correct.
Known items in `UI-REPORT.md` / `ENGINE-REPORT.md` / `ONLINE-REPORT.md` were not re-reported unless still wrong.

Screenshots: `audit-shots/` (JPEG, 12 files).

## Scores (0–5, 5 = as good as a paid app)

| Area | Score | Evidence |
|---|---|---|
| A. The game itself | 4 | Every scoring rule correct in three full games; 3 AI levels with a large measured gap (hard beats normal 99% in 2p); fast picks. No rules-notes with confirmed/guessed list; base-box variants (if any) not documented. |
| B. Learning the game | 3 | Good Hint with a reason, live "+N" on every plate, roll-race and custard sentences. But **How to play on the title screen does nothing** (02), the guided game is a queue of plate tips rather than a lesson, no glossary, no "read it big". |
| C. Playing comfortably | 2 | **No autosave**: a reload or an iPhone tab eviction throws the game away and the title shows no Resume. Settings are on/off toggles only (no volume, text size, colour-blind mode). Good log and round pad. |
| D. Playing with friends | 3 | Code + invite link, rejoin by uid, computer takes a leaving seat, hot-seat with pass screens. No TURN fallback, no "cannot reach the relays" state (11, 12 stayed on "Looking…" for 20 s+), no emotes, no turn timer, no async. |
| E. Look, sound, feel | 3 | Painted title and plates are the best on the shelf (01, 10) and plates fly; real CC0 samples and music. On phones the counter plates shrink to ~25 px and labels clip (05, 06); no haptics. |
| F. Quality | 3 | 0 page errors in all runs; self-contained and offline-capable. Missing favicon (404), meta description and share-preview tags; a stray dev page is live; DOM buttons with aria labels (good keyboard base). |

## Problems

### P0 (blocks paying users)

1. **"How to play" on the title screen is a dead button** (phone and desktop). It opens the rules drawer *behind* the
   title: `#start` is `z-index:60` (`game/head.html:163`), the shell drawer is `z-index:41`
   (`shell/shell.css:27`). Hit-test at the screen centre returns `#start` while `#rulesd` is open. A newcomer's very
   first tap does nothing. Evidence: `audit-shots/02-howto-dead-desktop.jpg` (identical to 01 after the tap).
   Fix: hide `#start` while a drawer opened from it is up (restore on close), or give drawers opened from the title a
   z-index above 60; add a click test that asserts something visible changed after each title button.
   Effort S. **[shared]** (every game that copied Kaiten's title/start pattern should be checked).
2. **No autosave; a reload loses the game.** `save()` (`game/src/ui3.js:206`) only runs from Menu → Save
   (`ui5.js:176`). After a reload mid-game `localStorage` held only `kk_ga_mus, kk_ga_sfx, gns-uid` and the title
   showed no Resume. iPhone Safari evicts background tabs often, so phone players will lose games.
   Fix: save after every resolved turn and on `visibilitychange`/`pagehide`; keep the `G.v` check and add a build
   version so an old save from a new build is refused politely. Effort S. **[shared]**
3. **Selling needs a licence.** The game is a faithful rules copy of a published 2013 card-drafting game (same deck
   counts, scoring tables, 2–5 players). Names, text and art are original, which is fine for free play among friends,
   but a paid release needs the publisher's licence or a redesign that makes the rules our own (new card types,
   different scoring). Effort L (business). **[shared]**

### P1 (clearly below a paid app)

4. **Wrong / leftover wording in shipped text.** Winner line "Odile wins with 46 points (on puddings)."
   (`game/src/engine.js:212`): the game calls them Custard Cups everywhere else (09). Log lines read "You takes
   Seaweed Roll." (`engine.js:161-162`). Fix: "(more Custard Cups)", "You take". Effort S.
5. **The shelf's Card & Token Reference page has no Kaiten Kitchen entry.** `games/reference.html` is built by
   `games-src/refpage/gen.py` from `ref_*.json`; there is no `ref_kk.json`. In-game, the plate list lives inside How
   to play (good: art + counts), but there is no "Cards" button and no full-screen card view: tapping a plate shows a
   ~50 px picture in the dock (04). Fix: dump `KK.DATA.types` to `ref_kk.json`, add it to `gen.py`; add a
   "read it big" sheet (tap/long-press any plate on belt or counter → large painted plate + rule + count).
   Effort M. **[shared]**
6. **Phone table is cramped.** At 390x763 played plates on counters are ~25 px and their labels clip ("Seawe…",
   05); at 375x553 the custard label reads "custa" and the dock prompt is cut (06); the guided tip text runs under
   the "Got it" button (03). The painted art cannot be appreciated at this size. Fix: on phones show counters as
   one row of grouped stacks with count badges (one sprite per group, 40 px+), move labels into the badge, let the tip
   card grow before the button. Effort M.
7. **Settings below the bar.** Menu has sound on/off, music on/off, computer speed, guide level, graphics. Missing:
   separate volume sliders, text size, colour-blind safe mode (plates are told apart by colour rim + picture, check
   with a simulator), reduce motion toggle (only the OS media query is read), haptics, left/right hand.
   Effort M. **[shared]** (one shared settings drawer in `shell/`).
8. **Online is fragile on real networks.** No TURN server is configured anywhere (`window.NETROOM_TURN` is never set
   in any deployed game), so phones on mobile data / strict NATs will often fail to connect; the page then says
   "Looking for players…" / "Connecting…" forever with no error or retry advice (11, 12). No emotes or quick
   chat, no turn timer for an idle human, host leaving ends the game. Fix: a TURN entry (free tier of a hosted TURN
   service) in `netroom.js`, a 15 s "Could not reach the other player — try Wi-Fi / retry" state, 6 canned emotes,
   an optional 60 s pick timer that lets the computer pick. Effort M. **[shared]**
9. **The guided game is tips, not a tutorial.** It queues one card per plate type the first time it appears, but
   never asks the player to do a specific thing, never explains *why* a pick was good or bad, and does not stop a
   random pick (my random guided game lost 39–66 without a word). The setup sheet's big red button is "Start the
   meal", not the guided game, for a first-time player. Fix: a scripted first round (fixed deal, 5–6 steps:
   "take the 2nd Prawn now — a pair is 5", "this Paste triples your next nigiri"), then hand over; make Guided the
   primary button until one game is finished. Effort M.
10. **Store / identity basics missing in the page.** `/favicon.ico` 404 on every load, no `<link rel=icon>`, no
    meta description, no Open Graph tags (the invite link shows a bare URL in chat apps), no privacy/terms/credits
    page beyond the credits paragraph, no stats (games played/won, best score) or achievements. Effort M.
    **[shared]**

### P2 (polish)

1. Confetti rains on the final card even when the human lost (08). Show confetti only for a human win; a softer
   "well played" otherwise. S.
2. The round pad covers the bar, so Log and Diners can't be opened while it is up (07). Let the bar stay on top. S.
3. No glossary: "roll race", "order slip", "sweets", "Fire Paste bonus" are used without definitions. Add a short
   glossary to How to play and `title` tooltips on the pad rows. S.
4. A dev page is live: `games/kaiten-kitchen/preview.html` ("art kit demo", 96 KB). Remove from deploy. S.
5. Internal ids use the original game's component words (`maki`, `wasabi`, `tempura`, `sashimi`, `pudding`) and
   they show in the DOM (`data-type="pudding"`) and page source. Harmless for play; rename before any sale. M.
6. The reference build has no `rules-notes.md` with a "Confirmed vs guessed" section (the brief requires one; only
   `PLAN.md`). Write it from PLAN.md + ENGINE-REPORT "rule decisions". S.
7. Title has no sound/settings button; a first-time player can't mute before the first sound. S. **[shared]**
8. No undo for an accidental Serve with "tap twice to serve" on (the second tap commits at once). The option exists
   (Menu → Tap twice to serve), so default it to Serve-button-only on phones, or add a 2 s "Undo" toast while the
   other diners still choose. S.

## Top 5 fixes (value for effort)

1. Fix the dead title "How to play" (P0-1) — S, every newcomer hits it.
2. Autosave every turn + on `pagehide` (P0-2) — S, stops lost games on iPhone.
3. Wording fixes "(on puddings)", "You takes" (P1-4) — S.
4. `ref_kk.json` into the shelf reference + a "read it big" plate sheet (P1-5) — M, it is the missing card reference.
5. TURN + "could not connect" state for online (P1-8) — M, shared by every game.
