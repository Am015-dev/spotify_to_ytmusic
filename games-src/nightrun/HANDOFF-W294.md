# HANDOFF W294: itch.io store package (branch nr/W294-store, 31 Oct 2026)

## Result (measured, not promised)
- `python3 games-src/nightrun/release/package.py` builds the game, then writes `games-src/nightrun/release/dist/nightrun-web.zip` (NOT committed, `dist/` is git-ignored; regenerate it after merging, this container is temporary).
- **990 files, 211.0 MB extracted, 208.4 MB zip**, biggest file 4.3 MB, longest path 51 characters, `index.html` at the zip root.
- itch.io HTML5 limits (official page https://itch.io/docs/creators/html5, read 31 Oct 2026): at most 1,000 files, 500 MB extracted, 200 MB per file, 240-character paths. The game folder had **1,098 files** (too many); 108 files that the game never loads were left out of the ZIP ONLY (repo untouched). Proof and the full list: `release/DROPPED-FILES.txt` and the header of `package.py` (street pictures not in `media/ready.json` are never fetched by `street/footart.js`; `media/poses/` is named by no code; `kit-/wp-/abup-/char-` pictures are only drawn when `ART.isReal` = listed in `ready.json`). Margin is only 10 files: do not add files to `games/mainhattan-nightrun` without re-running package.py (it prints PASS or FAIL against the limits).

## BIG FINDING for the $5 plan (read first)
itch.io's HTML5 page says: "HTML5 games can only take payments as donations. Selling requires the 'Downloadable' kind." So a browser-playable zip cannot be sold at $5 as such. Options for the owner:
1. Sell a **Downloadable** project at $5 and ship a desktop wrapper (Electron/Tauri) around the same files. NOT done; out of my scope. Do not just upload the web zip as a download: the game needs http (service worker, `ready.json` fetches are skipped on `file:`), so art would be partly missing from a double-clicked `index.html` (I did not test this).
2. Keep the web zip as a free/"donate" browser project and put a $5 "Supporter / full version" downloadable beside it later.
3. Check `itch.io` support if the limits or kind need to change; the docs say limits can be discussed with them.
Decide before the steps below.

## Upload steps (browser build, free or donation) for the owner
1. Create an account at https://itch.io/register and verify the email. Set up payouts (Dashboard > Account > Payment info) if you want donations.
2. Dashboard > Create new project. Title: `Mainhattan Nightrun`. Project URL: pick a short one. Short description, description, tags, genre: copy from `release/STORE-PAGE.md`.
3. Kind of project: **HTML** (browser). For a paid game choose Downloadable instead (see BIG FINDING).
4. Pricing: browser projects: "No payments" or donations. Suggested sale price when it is a download: $5.
5. Uploads: Upload files > choose `nightrun-web.zip` > tick **This file will be played in the browser**.
6. Embed options: **Click to launch in fullscreen** (needs no size; the game fits any size) or Embed in page with viewport 960 x 540 (the game's own 16:9 stage; it also fills a phone portrait screen). Tick **Mobile friendly** (touch drag works inside the iframe, tested). Tick **Fullscreen button** (iframe fullscreen is allowed, tested).
7. Cover image (630 x 500): `release/shots/cover-630x500.jpg`. Screenshots: `01-title`, `02-flight`, `03-street`, `04-boss` (all 1280 x 720) and `flight-10s.gif`.
8. AI disclosure: tick the generative-AI box and describe it as in `release/STORE-PAGE.md` (music and images). Add the third-party notice from `release/THIRD-PARTY-LICENSES.md` to the page footer or a text file.
9. Set visibility **Draft**, click **Save**, open the page with the preview link, play on a phone and a PC, then set it **Public**.

## Licence BLOCKERS (details: `release/LICENSE-AUDIT.md`)
- A: the 11 older songs in `music/*.mp3` have no recorded service or plan; the repo hints at Suno, whose free plan is non-commercial. Owner must confirm paid plan at creation or replace them.
- B: the 37 `media/mp-*.mp3` cues are from Treblo; its terms page was blocked for me (403), so "owner owns outputs" is unverified.
Everything else (code, owner art, two OFL fonts) is fine for sale.

## Iframe test (itch-like cross-origin embed): `release/iframe-test.js`, 22 PASS / 0 FAIL after the fix
Page on port 18101 embeds the unzipped zip on port 18102 with `allowfullscreen allow="autoplay; fullscreen"`. Phone 390x763 (touch, iPhone user agent) and PC 1440x860: game loads, FLIGHT starts, audio context is suspended before the first gesture and running after it, touch drag / arrow keys move the ship, fullscreen is available, the service worker becomes active, zero github.io requests (the build contains no github.io or am015 URL), 0 console errors, 0 HTTP 4xx/5xx. Only external hosts: fonts.googleapis.com, fonts.gstatic.com.
**Fixed (the test caught it):** inside an iframe on iPhone the game showed "Add to Home Screen" instructions, which would install itch.io, not the game. Now `core/fs.js` knows when it is embedded (`FSX.embedded`): no install card, no "FULL SCREEN: ADD TO HOME" button where fullscreen is unsupported, and `profile/ret.js` hides the iOS install tip. Outside an iframe nothing changed.
Run it: `python3 -I -c "import zipfile;zipfile.ZipFile('games-src/nightrun/release/dist/nightrun-web.zip').extractall('/tmp/nrzip')"; NODE_PATH=$(npm root -g) node games-src/nightrun/release/iframe-test.js`.

## Screenshots (looked at each): `release/shots/` (0.7 MB of JPGs q85 + 2.5 MB GIF)
01 title, 02 flight, 03 street, 04 boss (real eagle boss; hull is low because the shot was taken mid-fight), cover-630x500 = a 1:1 crop of the 1280x720 boss frame, `flight-10s.gif` (8 fps, 400 px wide, 10 s real play, 2.5 MB). Regenerate: `release/shots.js`, `release/gif.js`.

## Open items
- Menu has a **LAB** button (developer viewer) on the title screen: remove for sale (W295 owns in-game text).
- Whether stages past the first are playable (W19 a) decides if "complete" in the price reason holds; STORE-PAGE.md avoids stage counts on purpose.
- Fonts come from Google over the network; self-hosting is optional (see audit).
- I did not run the repo's other gauntlet/simhunt suites: the only game-code change is the embed guard in `fs.js` and one `ret.js` line (the `fs-test.js` named in the fs.js header does not exist in `qa/`).
