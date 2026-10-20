# Game Night Shelf: suite audit (Oct 2026)

Scope: section G of `PRODUCT-BAR.md` (consistency, identity, store needs, legal) plus the shared pages
(`index.html`, `classic.html`, `room.html`, `suggest.html`, `reference.html`, `sync.html`, `sw.js`, the manifest,
icons and covers). The per-game rules, AI and art audits are done in other sessions; this file covers what is
the same, or should be the same, across games. Audit only: no code or `games/` file was changed.

How it was checked: `games/` served locally; headless Chromium (Playwright) at 390x763, 375x553 and 1366x768.
For every game a script opened the title screen, started a game against the computer, opened every top-bar
button and recorded what each panel contains. Feature presence was then cross-checked by searching each built
page (`games/<slug>/index.html`). Screenshots are in `audit-suite-shots/` (15 files, all under 85 KB).
Games covered: the 12 board games on the shelf (with `thornbound-new` instead of `thornbound`) plus the two
previews, Cauldron Fair and Lantern Dive. The two Mainhattan games are out of scope.

---

## 1. Game x feature table

✓ = present · ~ = partial (see note) · ✗ = missing · "src" = found in the code but not reached in the browser run.

| Game | Guided first game | Rules drawer | Card/component reference in game | Glossary | Undo | Log | Last-turn summary | Volume | AI speed | Text size | Colour-blind | Save / resume | Online invite | Rejoin | Hot-seat | End-screen breakdown | Graphics setting | Menu style |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Kaiten Kitchen | ✓ | ✓ | ~ tooltips on cards only, no list | ✗ | ~ two-tap confirm | ✓ | ✗ | on/off | ✓ | ✗ | ✗ | ✓ Save/Load | ✓ | ✓ | ✓ | src | ✓ A/H/M/L | new |
| Crown City Smash | ~ 4 tips | ✓ | ~ market + own cards; full list only on reference.html | ~ keywords on reference.html | ✗ | ✓ | ✗ | on/off | ✓ | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | src | ✓ A/H/L | Menu drawer, but old look |
| Nebula Aces | ~ guide tips + Advice | ✓ | ~ squad builder lists pilots/upgrades | ✗ | ✗ | ✓ | ✓ round recap | on/off | ✓ | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | src | ✓ | old (all toggles in top bar) |
| Doorkick Dungeon | ✗ (hints only) | ✓ | ~ tap a card to read it; catalogue only on reference.html | ✗ | ✗ | ✓ Diary | ✓ recap | on/off | ✓ | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | src | ✓ | old |
| Shipwreck Isle | ~ tips | ✓ | ✓ Card list (all groups) | ~ terms in rules | ~ un-ready / take back a pawn | ✓ | ~ | on/off | ✓ | ✗ | ✗ | ✓ | ✓ | ✓ | ~ seat picker | ✓ breakdown | ✓ | old |
| Sands of Qamar | ~ Advise me + coach | ✓ | ✓ Card list + Djinns | ✗ | ✓ undo last drop | ✓ | ✓ recap | on/off | ✓ | ✗ | ✗ | ✓ | ✓ | ✓ | ~ seat picker (open info) | src final scores | ✓ | old, Settings drawer |
| Sunglaze | ✓ | ✓ | ✓ Tile list | ✗ | ✗ | ✓ | ✓ last round | on/off | ✓ | ✗ | ✗ | ✓ | ✓ | ✓ | ~ seat picker | src | ✓ | old (icons only, many unlabeled) |
| Rampart & Vine | ✓ | ✓ | ✓ Tile list | ✗ | ✗ | ✓ | ✓ recap | on/off | ✓ | ✗ | ✗ | ✓ | ✓ | ✓ | ~ seat picker | ✓ breakdown | ✓ | old |
| Short Fuse | ✓ (lessons) | ✓ | ✓ Cards | ✓ | ✗ | ✓ | ✗ | on/off | ✓ | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | src | ✓ | new |
| Tidewake | ✓ | ✓ | ✓ Pieces | ✗ | ✓ rewind my last move | ✓ | ✗ | on/off | ✓ | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | src | ✓ + animations on/off | new |
| Hollowbough | ✓ | ✓ | **✗ none** (≈ 130-card deck) | ✗ | ✗ | ✓ | ✗ | on only | ✓ | ✗ | ✗ | ✓ Save/Load | ✓ | ✓ | ✓ | src final scores | ✗ none | new |
| Thornbound (new) | ✓ | ✓ | **✗ none** (deck, kingdom cards, tactics) | ✓ inline underlined words | ✗ | ✓ | ~ | on/off | ✓ | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ breakdown | ~ on/off toggle | new |
| Cauldron Fair (preview) | ✓ | ✓ | ✓ Chips, books and cards | ✗ | ~ put chip back | ✓ | ~ | on/off | ✓ | ✗ | ✗ | ✓ Save/Load | ✓ | ✓ | ✓ | src final scores | ✓ | new |
| Lantern Dive (preview) | ~ guide tips | ✓ | ✓ Cards, jobs, dives | ✗ | ✗ | ✓ | ✗ | on/off | ✓ | ✗ | ✗ | ✓ Save/Load | ✓ | ✓ | ✓ | src | ✓ | new |

Size and first screen (local server, no network throttling, shared machine; "load" is the browser load event,
which for the 3D games includes decoding the inlined art):

| Game | File MB | gzip MB | First paint 390x763 (ms) | Load event 390x763 / 375x553 (ms) |
|---|---|---|---|---|
| Kaiten Kitchen | 2.46 | 1.27 | 444 | 767 / 518 |
| Crown City Smash | 2.47 | 1.29 | 880 | 7265 / 9231 |
| Nebula Aces | 2.97 | 1.66 | 804 | 2852 / 4597 |
| Doorkick Dungeon | 1.86 | 1.19 | 676 | 2182 / 2312 |
| Shipwreck Isle | 3.86 | 2.27 | 768 | 2280 / 3548 |
| Sands of Qamar | 2.21 | 1.17 | 324 | 4835 / 8118 |
| Sunglaze | 2.96 | 1.74 | 552 | 4545 / 5705 |
| Rampart & Vine | 2.45 | 1.35 | 1244 (375) | – / 3297 |
| Short Fuse | 2.55 | 1.26 | 724 | 4691 / 5191 |
| Tidewake | 1.92 | 0.89 | 328 | 1661 / 2481 |
| Hollowbough | 0.80 | 0.40 | 216 | 141 / 206 |
| Thornbound (new) | 1.00 | 0.49 | 156 | 184 / 170 |
| Cauldron Fair | 1.88 | 0.83 | 148 | 375 / 286 |
| Lantern Dive | 1.99 | 0.90 | 92 | 319 / 276 |

No game scrolled the page at any of the three sizes, and no game threw a script error on load. The only console
errors were the Google Fonts request (blocked in this sandbox), which 9 of the 14 pages make, and a missing
`favicon.ico`.

What the table says, in short:
- **Nobody has** text size, colour-blind mode, a volume slider, left-hand layout or haptics. These are suite
  gaps and belong in the shared shell.
- **Undo** exists in 3 games, each built differently (Sands, Tidewake, Shipwreck).
- **No card reference in the game**: Hollowbough and Thornbound have none; Kaiten, Crown City and Doorkick
  only show cards one at a time (Crown City and Doorkick have a full list, but only on the separate
  `reference.html`).
- **Two menu generations**: the older games (Nebula, Doorkick, Shipwreck, Sands, Sunglaze, Rampart) put sound,
  music, speed, pause, hints and graphics as loose buttons in the top bar (shot 06). The newer games use one
  Menu drawer with sections (shots 08, 12). Crown City has a menu drawer, but it looks different (shot 07).
- **Developer tools shown to players**: every game shows "Show speed" and "Test speed" (and "Copy report") in
  the player menu.

---

## 2. Shelf, offline and install findings

| Area | What I saw | Evidence |
|---|---|---|
| Home (`index.html`) | Living-room shelf works at all three sizes; phone gets a stacked shelf with Cards / Suggest / Online / Saves / Trophies buttons. The page scrolls on phones (2025 px tall at 390x763), which is fine for a home page. | shots 01, 02 |
| Trophies | 5 shelf-level trophies based only on how often you open each game (first game, 10 games, 5 kinds, all games, night owl). Nothing for winning, nothing inside a game. | shot 03, `index.html` `TROPHIES=[` |
| Statistics / profile | None. A `gns-name` (online name) and a random `gns-uid` exist; no avatar, wins, streaks or history. | `net/netroom.js` |
| Recent games | Not remembered on the home screen (play counts only feed trophies). | |
| `room.html` | A redirect to `./`; fine. | |
| `classic.html` | Works; long scroll page. Its "Back to the living room" link is 15 px tall (tap target too small). | |
| `reference.html` | Text-only list of 230 entries for **7 games only** (Crown, Nebula, Doorkick, Shipwreck, Sands, Sunglaze, Rampart). Missing Short Fuse, Tidewake, Hollowbough, Thornbound, Kaiten. The intro says "the **three** games on the shelf", which is out of date. Section chips at the top show the original game's expansion titles. | shot 04 |
| `suggest.html` | Form posts to a third-party form service (web3forms) and asks for an optional email. No privacy notice beyond one sentence. | |
| `sync.html` | Keep-on-device switches, storage estimate, device-to-device save transfer (P2P + QR). Works. Its key map does not know the new Thornbound's keys (`tbt_`) or the previews' (`cf_`, `ld_`), so those would be filed under "Other". | shot 05, `sync.html:308` |
| Service worker | **Registered only by `sync.html`.** Neither the home page, the classic shelf nor any game registers it. Test: a fresh browser that opens the home page, then goes offline and reloads → `ERR_INTERNET_DISCONNECTED`. After a visit to Saves & Offline, the shelf and kept games open offline as designed. | `sw.js`, `sync.html` |
| Update behaviour | Kept games are cache-first with a silent background refresh: after a release the player gets the old version once, then the new one on the next open, with no "new version" notice. `VER='v1'` must be bumped by hand in two files. There is no suite rule for old saves after an update (each game has its own `_save1`/`_save2` key). | `sw.js:7`, `sync.html` |
| Offline fonts | 9 of 14 games and all shelf pages load Google Fonts. Offline (and in the iPhone app with no signal) they fall back to system fonts. It also sends every visitor's IP address to Google, which in the EU needs consent or self-hosting. | `<link href="https://fonts.googleapis.com…">` |
| Manifest | Name, icons (192, 512, maskable), `display: fullscreen`, theme colours. Missing `id`, `screenshots`, `categories`, `lang`, `shortcuts`. iPhone ignores `fullscreen` and uses standalone, which is fine. `apple-touch-icon` 180 px present. | `manifest.webmanifest` |
| Icons, covers | Icons look clean (shelf + die). Covers exist for all 14 shelf games; none for the two previews (expected). The 512 px PNGs are 210–245 KB and could be ~40 KB. | `games/icons/` |
| Game pages as apps | Game pages have no manifest link and no `apple-mobile-web-app` tags. An invite link opens the game in Safari, not in the installed app (an iPhone limitation), and "Add to Home Screen" from a game page gives a plain bookmark. | |
| Previews | Cauldron Fair, Lantern Dive and the new Thornbound are not on the shelf, in `sw.js` `SLUGS` or in `sync.html` (expected for previews; remember to add them on release). | `sw.js:9` |
| Donations | "Support on Ko-fi" in the footer and on the suggestion page. | `index.html` footer |

---

## 3. Problem list

Effort: S < 1 h, M < 1 day, L > 1 day. **[shared]** = fix once in a shared module or shelf page.

### P0: blocks paying users

1. **Selling requires licences or a redesign (legal).** The games copy the originals' mechanics, numbers and
   component lists one-to-one (that is the brief), and the originals are sold by publishers who also license
   official apps. See section 4. *Fix:* choose per game between licensing, keeping it free and private, or
   redesigning it. *Effort:* L (business decision + work per game).
2. **The original games' own titles are shipped on public pages.** The Crown City Smash expansion chips on the
   shelf (`games/index.html:510`, `games/classic.html:149`), the section names on `reference.html` (generated by
   `games-src/refpage/gen.py:13-27`, which also names the original's real-world city and its tower), and
   expansion and keyword names inside `games/crown-city-smash/index.html` (one is the title of a separately
   published card game). This breaks the shelf's own rule ("never put the original game's name in the shipped
   HTML") and is the easiest trademark complaint to make. *Fix:* rename the expansions, keywords and the city
   in the game data, `gen.py` and both shelves; then search all shipped pages for the original names.
   *Effort:* M. **[shared]** for the shelves and the reference page.
3. **Offline and "install as app" do not work unless the player visits Saves & Offline first.** Verified: the
   home page alone never registers the service worker, so an iPhone home-screen app with no signal shows a
   browser error. *Fix:* register `sw.js` in `index.html`, `classic.html` and the shared shell (a 1-line
   `navigator.serviceWorker.register('../sw.js',{scope:'../'})`, scope already allowed). Precache the shelf on
   first visit. *Effort:* S. **[shared]**
4. **No in-game card reference in the card-heavy games.** Hollowbough (about 130 cards plus events) and
   Thornbound (deck, kingdom cards, tactics) have no list at all. Kaiten Kitchen, Crown City and Doorkick only
   let you read the cards on the table or in your hand. Players can't answer "what else is in the deck?" without
   leaving the game. *Fix:* a shared `GX.reference(sections)` drawer (search, filter chips, counts, big card
   view) fed by each game's data table, the same data that `refpage/gen.py` reads. Add a "Cards" button to every
   game's top bar. *Effort:* M for the shared drawer, then S per game. **[shared]**
5. **No privacy policy, terms or imprint** while the site collects emails (suggestion box), shows a donation link
   and sends visitors' IP addresses to Google Fonts, public Nostr relays and STUN servers. App stores reject apps
   without a privacy policy, and an EU site needs one now anyway. *Fix:* a `privacy.html` and `terms.html` (plain
   language: what is stored locally, what the relays, STUN servers and form service see, no tracking), linked
   from every footer and every game's Credits. Check whether a German imprint (Impressum) is needed.
   *Effort:* S–M. **[shared]**

### P1: clearly below a paid app

6. **Two menu generations and no common settings.** The six older games scatter toggles across the top bar;
   the newer games use a Menu drawer, but its sections and wording differ in each game. *Fix:* one shared
   `GX.menu()` with fixed sections (Game · Sound · Speed · Help · Graphics · Accessibility · About) and the same
   labels everywhere; retrofit the old six. *Effort:* M shared + S–M per game. **[shared]**
7. **Accessibility and comfort settings missing everywhere:** text size, colour-blind-safe palette (or
   patterns/symbols on every colour-coded piece; Sunglaze's glaze tiles and every game's player colours rely on
   colour alone), volume sliders (sound and music separately), left/right-hand dock, reduce-motion toggle (CSS
   honours the system setting, but only Tidewake has an in-game switch), haptics on phones. *Fix:* store them
   once as `gns-prefs` on the shelf, read them in the shell (CSS variables such as `--gx-font-scale`,
   `html.cb`, `html.lefty`), and pass volume to `gameaudio.js`. *Effort:* M shared, S per game for the
   colour-blind palette. **[shared]**
8. **Undo is missing in 11 of 14 games.** Since every game keeps all of its state in one JSON object `G`, a shared
   "snapshot before each human move, restore on Undo until the move is confirmed or hidden information is
   revealed" helper is cheap. *Effort:* M shared + S per game. **[shared]**
9. **Guided first game missing or thin** in Crown City (4 tips), Nebula (tips + Advice), Doorkick (hints),
   Shipwreck (tips), Sands (Advise me) and Lantern Dive (tips). Kaiten, Tidewake, Short Fuse, Sunglaze,
   Rampart, Hollowbough, Thornbound and Cauldron Fair have one. *Effort:* M–L per game.
10. **"Since your last turn" summary** exists in 5 games and is missing in the 7 newest. *Fix:* a shared
    component that collects the log lines since the human's last decision and shows them as one dismissible
    strip in the dock. *Effort:* M shared. **[shared]**
11. **`reference.html` is out of date and incomplete**: 7 of 12 games, "three games" in the intro, text only (no
    pictures), not linked from inside most games. *Fix:* generate it from the same per-game reference data as
    P0-4 and add the five missing games. *Effort:* M. **[shared]**
12. **Online play has no TURN server.** Two players behind strict NATs (some mobile carriers, office and hotel
    Wi-Fi) cannot connect at all; the hook (`window.NETROOM_TURN`) exists but is not set. The lobby also relies
    on public Nostr relays the suite does not control. *Fix:* set a hosted TURN as a fallback (costs in section
    5) and keep one relay you run as a backup. *Effort:* S–M. **[shared]**
13. **Update notice and save compatibility.** Show "A new version is ready, tap to reload" when the service
    worker finds a new game file. Add a suite rule that every save stores a format version and either migrates
    or explains why it can't be resumed. *Effort:* M. **[shared]**
14. **Fonts from Google** in 9 games and all shelf pages: offline fallback fonts and an IP leak to Google. *Fix:*
    inline WOFF2 subsets as the newer games already do. *Effort:* S per page. **[shared]** (build step)
15. **Developer tools in player menus** ("Show speed", "Test speed", "Copy report", "Phone screen test" on the
    shelf). *Fix:* move them behind `?dev=1` or a long-press on the version label. *Effort:* S. **[shared]**
16. **Open-source licence notices.** The games say "MIT" for three.js, PixiJS and Trystero, but none contains the
    licence text, which the MIT licence requires in copies. *Fix:* one `credits.html` for the suite (libraries
    with full licence texts, fonts under OFL, every CC-BY sound with attribution, art sources), linked from each
    game's Credits. *Effort:* S. **[shared]**
17. **Identity is thin**: no profile picture or colour, no per-game statistics (games, wins, best score, average
    length), no in-game achievements, no "continue where you left off" row on the home screen. All of this can be
    local-first (see section 5). *Effort:* M shared + S per game (each game reports `GNS.result({...})` on game
    over).
18. **The donation link sits next to faithful adaptations.** It turns a free fan project into one that makes
    money, which makes a takedown more likely and weakens a "not for profit" position. *Fix:* until the legal
    choice in P0-1 is made, keep Ko-fi off pages that host adaptations, or limit it to original games.
    *Effort:* S.

### P2: polish

19. `sync.html` key map misses `tbt_` (Thornbound new) and the previews' `cf_`/`ld_` keys. S.
20. `sw.js` `SLUGS`, the shelf `GAMES` list, `sync.html` and covers each need the previews added when they
    ship. A single `games.json` read by all four would stop this drifting. S–M. **[shared]**
21. Manifest: add `id`, `lang`, `categories:["games"]`, `screenshots` (needed for the richer Android install
    dialog), `shortcuts` (Resume last game, Saves). S.
22. Add the manifest link and Apple tags to game pages, so a game page added to the home screen opens full-screen
    with the right icon. S. **[shared]**
23. `favicon.ico` 404 on every page. S.
24. Tap targets under 32 px on `classic.html` ("Back to the living room", 15 px high), the shelf's channel
    arrows on desktop (25 px) and the suggestion checkbox (13 px). S.
25. 512 px icons are 210–245 KB; compress them to about 40 KB. S.
26. Language readiness: every page is `lang="en"`, with strings inside the code and no string table. Translation
    later will mean editing every game. L (only if translation is planned).
27. Big files: Shipwreck Isle is 3.9 MB (2.3 MB gzipped); the 3D games take 2–9 s to the load event here.
    Lazy-decode the inlined art after the title screen, as the 2D games do. M per game.

---

## 4. Legal: what "faithful adaptation" means for selling

*This is a plain-language summary to help with a decision, not legal advice; ask a games or IP lawyer before
selling anything.*

**What is free to copy and what is not.**
- **Rules and mechanics are ideas.** Copyright in the US and the EU does not protect game rules, systems or
  scoring as such. That is why "inspired by" games exist.
- **Expression is protected.** This means the rulebook's wording, card and flavour text, illustrations,
  graphic design, iconography, the board layout as drawn, and how the components look. Copying the overall look
  and feel of a game can infringe even when every asset is redrawn. A US court found a near-pixel-faithful
  falling-blocks clone infringing for exactly this reason (2012).
- **Card lists are a grey zone.** Our games keep every number, every card's effect (in our own words) and every
  count. One-to-one card lists can be treated as a protected "selection and arrangement", especially for games
  whose value is in the card designs.
- **Trademarks protect names and branding:** the game title, expansion names, distinctive terms, logos, and the
  trade dress (box style, signature colours or iconography). Original names are already the rule here, but
  some of the originals' names are still shipped (P0-2). Saying "plays like X" in a store listing is a
  trademark use; the brief rightly bans it.
- **Patents** are rare for board games but exist; check before selling any game whose original is recent.

**Why the professional apps all have licences.** Publishers sell digital rights to studios: usually an advance
plus a revenue share (often 10–30%), approval of art and text, and the right to use the real name, which is
what sells in stores. App stores act quickly on intellectual-property complaints (Apple and Google both remove
apps on a rights holder's complaint), and most of our originals already have an official app or a licensed
online version. A paid unlicensed clone of a game with an official app is the case most likely to get a
complaint.

**Which of our games look riskiest** (judged by how closely they copy, how much the original relies on card
text or art, and whether the rights holder is known to license or enforce):

| Risk | Game | Why |
|---|---|---|
| Highest | **Crown City Smash** | Every power card, expansion and keyword is carried over one-to-one, the original's titles are still shipped (P0-2), its setting is the original's real-world city in all but name, and an official digital version exists. |
| Highest | **Nebula Aces** | The original is itself a licensed product of a major film franchise, and that franchise's owners enforce hard. Ship stat lines, maneuver dials and pilot/upgrade cards are one-to-one. |
| High | **Doorkick Dungeon** | The original's value is its joke card texts and its art style; ours keeps the card list and rewrites the jokes one by one, close to the original's expression. Its publisher is known for licensing. |
| High | **Hollowbough, Thornbound, Kaiten Kitchen, Shipwreck Isle, Short Fuse, Lantern Dive** | Modern games with active official apps or licensed online versions, card-driven designs and one-to-one card or mission lists. |
| Medium | **Sands of Qamar, Tidewake, Cauldron Fair** | Mechanics-led games with distinctive boards; risk is mainly the card/tile lists and the look of the board. |
| Lower | **Sunglaze, Rampart & Vine** | Abstract tile games whose mechanics are generic; the risk is mostly trade dress (tile and board look) and the one-to-one tile list. Their originals still have official apps. |

**The options.**
1. **License.** Write to the publisher of each game you want to sell (start with smaller publishers of games
   that have no app yet, since they are more open). Expect an advance or minimum guarantee, a 10–30% royalty,
   art and text approval, and a timetable; publishers often prefer studios with a track record. Months per
   deal. Upside: you can use the real name, which is what sells.
2. **Keep it free and private.** Friends-only use, with no donations, no store listing, no ads. Optionally put
   the shelf behind a password or invite (Cloudflare Access is free for small teams) and add `noindex`. This
   carries the least risk, though it is still not a licence; remove a game at once if a rights holder asks.
3. **Redesign into original games.** Change enough that the game is ours: a different card set (new powers and
   numbers), changed core loops or scoring, our own theme and board, and no one-to-one lists. This takes the
   most design work, and a game balanced over decades is hard to beat. But the engine, AI, online layer, shell
   and art pipeline all carry over, and the result can be sold anywhere. Short Fuse, Lantern Dive and Cauldron
   Fair-style designs (simple components, missions) are the cheapest to make truly original.
4. **Mixed (recommended).** Keep the shelf free and private as a showcase for friends (option 2). Build the paid
   product around 2–3 original games made with the same tech (option 3). Approach one or two publishers whose
   game has no app yet, using the polished free version as a demo (option 1).

The BRIEF files require "mechanics, numbers and structure exactly". That rule suits a free private shelf, but it
works against selling, so any game meant for sale needs its own brief.

---

## 5. Product and store readiness: what paying users expect

| Need | Today | What it takes | Server? | Running cost (estimate) |
|---|---|---|---|---|
| Profiles | Online name + random id | Local profile (name, avatar, colour) in `gns-profile`; optional account later | No (local) / yes for accounts | €0 |
| Statistics | None | Each game calls `GNS.result({game, mode, seats, winner, scores, turns, ms})`; the shelf shows per-game stats | No | €0 |
| Achievements | 5 shelf trophies | 5–10 per game, declared in each game, checked in the shell | No | €0 |
| Save sync between devices | P2P transfer page | Cloud save needs accounts | Yes | in accounts row |
| Accounts | None | Supabase or Firebase auth + one table | Yes | free tier → about €25/month at scale |
| Payments / unlocks | None | Web: Paddle or Lemon Squeezy (they handle EU VAT, 5% + fee) for a one-time "supporter" unlock; iOS/Android apps must use in-app purchase (Apple's small-business rate 15%) | Yes (entitlement check) | fees per sale only |
| Async play ("take your turn later") | None (live P2P only) | Turn store + push notifications: Cloudflare Workers + Durable Objects, or Supabase realtime; the host-runs-rules model must move to a server-run or "verify on next client" model | Yes | about €5–20/month small; grows with players |
| Reliable online | Public relays, no TURN | Hosted TURN (e.g. Cloudflare Realtime or a metered service), about $0.05 per GB after a free allowance; one own signalling relay on a small VPS | Yes | about €5–15/month |
| Analytics (opt-in) | None | Plausible or a self-hosted counter, opt-in only | Yes (hosted) | €0–9/month |
| Crash reporting (opt-in) | Errors are handled in-page | Sentry browser SDK, opt-in, free tier (5k events/month) | Hosted | €0 |
| Privacy policy, terms, imprint | None | P0-5 | No | €0 |
| Credits and licences page | Per-game credits, no licence texts | P1-16 | No | €0 |
| Age rating | None | IARC questionnaire (free, through Google Play), Apple's questionnaire. Expect about 7+/9+: cartoon fighting in Crown City, Nebula and Doorkick, and Doorkick's humour. | No | €0 |
| Store screenshots and listing | Covers only | 5–8 phone shots per game in store sizes, short text, a promo video | No | €0 (time) |
| PWA vs app store | PWA (offline only after Saves page) | PWA first (fix P0-3). For stores: wrap with Capacitor; Apple Developer €99/year, Google Play $25 once. Apple rejects thin web wrappers, so ship the games bundled inside the app (they are already single files) | No | about €100/year |
| Support | Suggestion box (web3forms) | Support email + FAQ page; reply within 48 h; the suggestion box can stay | No | €0 |
| Domain | github.io | Own domain (also needed for a store listing and a stable PWA identity) | No | about €15/year |

**What can stay free and serverless:** every game against the computer, hot-seat, live online play (P2P,
plus a cheap TURN), offline downloads, save transfer by QR/P2P, local profiles, statistics and achievements,
the reference and credits pages, privacy and terms. GitHub Pages hosting stays free.

**What needs a server:** accounts, cloud saves, async turns and push, payments and entitlements, reliable
connections (TURN), and opt-in analytics/crash reports. A minimal stack (Cloudflare Workers + Durable
Objects + Supabase auth + Paddle + Sentry free + TURN) costs about **€20–50/month** at small scale, plus
about €115/year for both stores and a domain.

---

## 6. Roadmap

### Track A: "Free suite, polished" (no server, no money changes hands)
| # | Step | Effort |
|---|---|---|
| 1 | Remove the original games' names from the shelves, the reference page, `gen.py` and Crown City (P0-2) | M |
| 2 | Register the service worker everywhere; precache the shelf; add an update notice (P0-3, P1-13) | S + M |
| 3 | Privacy page, terms, credits and licences page; footer links; Ko-fi decision (P0-5, P1-16, P1-18) | S–M |
| 4 | Shared reference drawer + the missing reference in Hollowbough, Thornbound, Kaiten, Crown City and Doorkick; regenerate `reference.html` for all 12 games (P0-4, P1-11) | M + 5×S |
| 5 | Shared Menu with fixed sections; hide developer tools; retrofit the six old-style games (P1-6, P1-15) | M + 6×S |
| 6 | Shared accessibility settings: text size, colour-blind mode, volume sliders, left-hand dock, reduce motion, haptics (P1-7) | M + per-game S |
| 7 | Shared undo and "since your last turn" components (P1-8, P1-10) | M + per-game S |
| 8 | Local profile, per-game statistics, 5–10 achievements per game, "continue" row on the home screen (P1-17) | M + per-game S |
| 9 | Self-host fonts; set a TURN fallback (P1-14, P1-12) | S–M |
| 10 | Guided first games for Crown City, Nebula, Doorkick, Shipwreck, Sands and Lantern Dive (P1-9) | 6×M–L |
| 11 | One `games.json` for the shelf, SW, Saves page and covers; manifest and icon polish (P2) | S–M |

### Track B: "Paid product"
| # | Step | Effort |
|---|---|---|
| 1 | Legal decision per game (license / free-private / redesign); new brief for originals (section 4) | L (decision + design) |
| 2 | Finish Track A steps 1–8 first; paying users expect them | see above |
| 3 | Own domain; accounts (Supabase/Firebase); cloud saves; analytics and crash reports, opt-in | M–L |
| 4 | Payments: one-time "supporter" unlock or per-game unlock on the web (Paddle/Lemon Squeezy); in-app purchase in the store apps | M |
| 5 | Async play server and push notifications for the 3–4 games that suit it (turn-based, no simultaneous moves) | L |
| 6 | Capacitor wrapper, store listings, screenshots, age ratings, support page | M–L |
| 7 | Soft launch with 2–3 original or licensed games; keep the adaptations free, private and off the stores | – |

---

## Screenshots (`audit-suite-shots/`)
01 shelf on a phone · 02 shelf on desktop · 03 trophies strip · 04 reference page (7 games, old intro, original
expansion titles in the chips) · 05 Saves & Offline at 375x553 · 06 Nebula Aces old-style top bar · 07 Crown City
menu · 08 Kaiten Kitchen menu (new style) · 09 Hollowbough (no card reference button) · 10 Thornbound (inline
glossary, no reference) · 11 Short Fuse (Cards + glossary) · 12 Tidewake menu · 13 Doorkick Dungeon ·
14 Sands of Qamar · 15 Lantern Dive title on a phone.
