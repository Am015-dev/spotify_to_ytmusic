# Offline report (W345, 7 Nov 2026)

Owner bug: "When I download for offline the game assets are not downloaded fully, so how can I play offline?"

## 1. Reproduction on the LIVE site (before the fix)
`BASE=https://am015-dev.github.io/spotify_to_ytmusic/ node games-src/scripts/offline-test.js` : each game is downloaded through sync.html,
the browser context is set offline, the game opens, the test clicks through start screens / menus / canvas for 20-45 s, then fetches every
file of the pack (audio with a Range request). "Cached" counts the entries stored for the game (the file list + offline.json).

| game | files listed | cached | problem found on live | local fails after fix |
|---|---|---|---|---|
| cauldron-fair | 99 | 100 | none found on live (see notes) | 0 |
| crown-city-smash | 307 | 308 | none found on live (see notes) | 0 |
| doorkick-dungeon | 248 | 249 | none found on live (see notes) | 0 |
| emberclimb | - | - | NOT LISTED in sync.html: cannot be downloaded at all | 0 |
| final-approach | 73 | 74 | none found on live (see notes) | 0 |
| hollowbough | 117 | 118 | offline requests: FAILED sw.js net::ERR_INTERNET_DISCONNECTED | 0 |
| kaiten-kitchen | 69 | 70 | none found on live (see notes) | 0 |
| lantern-dive | 66 | 67 | none found on live (see notes) | 0 |
| mainhattan-nightrun | 562 | 563 | none found on live (see notes) | 0 |
| mainhattan-overdrive | 186 | 187 | none found on live (see notes) | 0 |
| nebula-aces | 94 | 95 | none found on live (see notes) | 0 |
| rampart-and-vine | 112 | 113 | none found on live (see notes) | 0 |
| redline-rally | - | - | NOT LISTED in sync.html: cannot be downloaded at all | 0 |
| sands-of-qamar | 201 | 202 | none found on live (see notes) | 0 |
| shipwreck-isle | 176 | 177 | none found on live (see notes) | 0 |
| short-fuse | 105 | 106 | none found on live (see notes) | 0 |
| sunglaze | 77 | 78 | none found on live (see notes) | 0 |
| thornbound | 133 | 134 | none found on live (see notes) | 0 |
| tidewake | 74 | 75 | none found on live (see notes) | 0 |
| twin-thrones | - | - | NOT LISTED in sync.html: cannot be downloaded at all | 0 |

What the table does not show (it only counts same-origin requests): other-origin requests that failed offline.
* **Mainhattan Overdrive loads three.js and all its addons from cdn.jsdelivr.net** (importmap + 15 modules). Nothing of that was stored, so offline the page opens but the 3D game cannot start.
* Ten games ask Google Fonts for text fonts (doorkick, nightrun, nebula, rampart, sands, shipwreck, short-fuse, crown, tidewake, sunglaze): offline they fell back to system fonts.
* Hollowbough: `sw.js` update check fails offline (the browser's own check, harmless; the test ignores it).

## 2. Found -> fixed
| # | found | fixed in |
|---|---|---|
| 1 | Emberclimb, Redline Rally and Twin Thrones were not in the sync.html list: no Keep switch, never downloadable | games-src/sync/build.py (LIST); sync.html rebuilt |
| 2 | Mainhattan Nightrun / Overdrive `offline.json` are stale in the repo: 148 + 22 files on disk are not listed (so never downloaded), 560 + 11 sizes differ. build-all only rewrites manifests on a deploy of a build-all game; those two ship by other routes | offline-manifest.py `--check`; guard.py note; offline-test.js fails while stale. **Needs a regenerate (see 5)** |
| 3 | Nightrun "optional" files (386 placeholder webp, 7 MB) were skipped although the game may ask for them | offline-manifest.py: everything on disk is core |
| 4 | CDN scripts (three.js for Overdrive) never stored | sync.html `cdnFor` (reads importmap, modulepreload, script URLs, follows relative imports) + sw.js serves cdn hosts cache-first from `gns-fonts-v2` |
| 5 | Google Fonts never stored | sync.html `fontsFor` (css + woff2) + sw.js |
| 6 | Download said "complete" with no size check; a cut-off body was kept; 3 tries with 0.3 s pauses; failures silent | fetchOne: 4 tries (0.4/1.6/3.6/6.4 s), body must equal Content-Length, one slow second pass (1 connection) for what failed, concurrency 4 -> 3 |
| 7 | UI wording "complete" / only a Remove button for a partial pack | "Ready offline" only when every file is stored; otherwise "N of M files not stored yet · not ready offline" + **Retry** + Remove; "Not enough storage" message on quota errors |
| 8 | Phones stop downloads when the screen sleeps / network drops | Screen Wake Lock while downloading; a stalled download resumes by itself on the `online` event; storage persist was already requested |
| 9 | sw.js matched cache keys exactly | `cacheFirst` also matches ignoring `?v=` queries and encoded/plain names |

Not found to be causes (checked): media copied after the manifest (manifest is written after the copy), Range/206 for audio (works), cache key
mismatch for query strings (keys already drop queries), files with odd names (none exist).

## 3. Gate: `node games-src/scripts/offline-test.js` (every game of build-all GAMES + nightrun + overdrive)
Per game: download via sync.html, "Ready offline", every manifest file cached, reload still ready, go offline, open, play 25 s, every pack file
served offline, audio Range -> 206, **0 failed requests, 0 error responses (incl. the worker's offline page), 0 failed CDN scripts**, no page
errors, Remove deletes everything. Requests that also fail online (files a game asks for but never shipped) are reported as NOTE, not failed.
Extra: a failure test (one file refuses -> not "Ready offline", Retry button, Retry completes). Result lines: see the DONE message.
`PLAY_MS=60000` plays longer; `BASE=<live url>` tests the live site; `PW_PATH`, `CHROME` select the Playwright package and browser.

## 4. build-all --quick on 2 games
`build-all.py --quick sunglaze tidewake` builds both; scenarios run 10/13 and 8/11; the failures are "A snapshot doesn't exist .../.baselines/..." (visual
baselines are not in this checkout), not caused by this change (no game file changed). In this container the installed browser is 1243 but
`@playwright/test@1.56.1` wants 1194, so scenarios only ran with PLAYWRIGHT_BROWSERS_PATH pointing at a symlink dir.

## 5. What remains
* **Regenerate and commit `games/mainhattan-nightrun/offline.json` and `games/mainhattan-overdrive/offline.json`** (`python3 games-src/scripts/offline-manifest.py`). The
  sandbox blocked this worker from writing into those two folders, so they were left alone. Until then the gate prints one FAIL line (`_manifest`).
* Deploy sync.html + sw.js (shell files, no game rebuild needed). The service worker version string is unchanged (v2) so kept games survive the update.
* Fonts / CDN storage is best effort and starts only after the files of a game are all stored; a game kept before this change gets them the next time Saves & Offline is opened online (one background pass).
* Not tested on a real phone (iOS Safari quota and background tab behaviour); Wake Lock is a no-op where unsupported.
* Pixi basis/ktx transcoders (cdn.jsdelivr.net, 4 games) are named in game code but not requested by the games; not stored.
