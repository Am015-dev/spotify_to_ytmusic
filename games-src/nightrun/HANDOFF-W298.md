# HANDOFF W298: a sale path that works today (branch nr/W298-sell, from nr/W294-store, 31 Oct 2026)

## Result
- **itch rule (verified, quoted in `release/SELL-PATH.md`):** "Currently all HTML5 games on itch.io are set up to only take payments as donations." and "it's possible to sell access to your game by setting its "Kind of Game" to "Downloadable"" (https://itch.io/docs/creators/html5). So $5 = a **Downloadable** project, price minimum $5.00.
- **Builds (all from `python3 games-src/nightrun/release/package.py`, then `bash games-src/nightrun/release/desktop/build.sh`; outputs in git-ignored `release/dist/`):**
  - `nightrun-web.zip` 112.4 MB, 942 files: itch iframe test 23 PASS / 0 FAIL; launch-test over http: title, flight, street, 0 console errors.
  - `nightrun-download.zip` 112.5 MB, 944 files (+PLAY.html, README.txt, file:// shim): launched in Chromium from `file://`, title, flight, street, 0 console errors, art loads. No server needed.
  - `desktop/Mainhattan-Nightrun-linux-x64.zip` 241.8 MB: **really launched** with xvfb-run, title screen loaded, screenshot taken (a first-run "NEW HERE?" prompt shows, normal).
  - `desktop/Mainhattan-Nightrun-win32-x64.zip` 276.3 MB: built (PE32+ x64 .exe, game folder inside) but **never launched** (no Windows/wine). macOS: not buildable here.
- **Music fallback:** `release/MUSIC-BLOCKED.txt` (11 `music/*.mp3` + 37 `media/mp-*.mp3`). package.py leaves them out of every zip and out of tracks.json, ready.json, offline.json, and the zips answer fetches of them with a local 404. Proof: 0 console errors, 0 mp3 requests, tracks.json 0 entries (picker empty), synth audio running. Zips shrink from 208 MB to 112 MB.
- **Treblo terms: unreadable.** treblo.com/terms = HTTP 403; Wayback availability API: no snapshot for that URL; a further Wayback probe was refused by the sandbox so I stopped. Details in `release/MUSIC-PROVENANCE.md`.

## Owner's exact upload steps (itch.io)
1. Build on a machine with the repo (this container is temporary): `python3 games-src/nightrun/release/package.py` then `bash games-src/nightrun/release/desktop/build.sh` (needs network for electron). Files appear in `games-src/nightrun/release/dist/` (`nightrun-download.zip`) and `dist/desktop/` (two zips).
2. itch.io > Dashboard > Create new project. Title `Mainhattan Nightrun`; text from `release/STORE-PAGE.md`.
3. **Kind of project: Downloadable.** **Pricing: Paid, minimum $5.00.**
4. Upload three files, none ticked "played in the browser": Windows zip -> Windows; Linux zip -> Linux; `nightrun-download.zip` -> all platforms (macOS players: unzip, open PLAY.html).
5. Cover `release/shots/cover-630x500.jpg`, screenshots `01..04`, GIF; tick the generative-AI box; paste the notice from `release/THIRD-PARTY-LICENSES.md`.
6. Draft > preview > download and run each build yourself > Public. Mention "Windows build is unsigned (SmartScreen may warn)".
7. Music: send the song confirmations in `MUSIC-PROVENANCE.md`. Until then the store page must NOT promise a song soundtrack (STORE-PAGE.md already says synth music).

## What the owner must confirm to ship the songs
Per file: generator, plan, date, saved copy of the terms (`MUSIC-PROVENANCE.md`). Then delete the lines from `MUSIC-BLOCKED.txt` and rebuild. Also: the LAB button is still on the title (W295), the desktop apps are unsigned.

## Files
Committed: `release/{package.py,launch-test.js,MUSIC-BLOCKED.txt,MUSIC-PROVENANCE.md,SELL-PATH.md,STORE-PAGE.md,DROPPED-FILES.txt}`, `release/desktop/{main.js,package.json,build.sh}`, this file.
NOT committed (generated, ignored or left untouched in the work tree): `release/dist/**` (all zips, `dist/stage`, `dist/desktop`), `games/mainhattan-nightrun/index.html` and `sw.js` (rebuilt by package.py; the committed copy was stale and failed 2 iframe checks, the rebuild passes), `/tmp/nr-desktop`, node_modules.
Tests: `NODE_PATH=$(npm root -g) node release/launch-test.js <file:// or http:// url> [shot-dir]`; `release/iframe-test.js <unzipped web dir>`.

## Open
- `file://` download: synth music only, on-foot outline pass skipped (shim returns a blank image); desktop apps have full audio.
- Whether itch's app launches a Downloadable project's uploaded zip: not established; not needed (desktop zips are real apps).
- A game change that fetches a new URL on file: needs the shim in `package.py` to be revisited; add new `fetch` targets there.
